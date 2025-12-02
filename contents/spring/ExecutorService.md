# RedisMonitorSvc ExecutorService 리팩토링
Redis 모니터링 API를 처음 만들 때는 요청마다 `new Thread(new MonitorRunner(...))`를 생성해 `FluxSink`에 직접 데이터를 밀어 넣었다.<br>
어차피 사내 개발자들만 사용하는 시스템이라 크게 고려하지 않았는데 그래도 이왕 만드는거 안정적으로 만들고 싶어 다른 방법을 찾던중 ExecutorService를 알게 되었다

### 문제점
- Thread 수를 제한하지 않아, 요청마다 Thread 를 들고 있었다.
- Thread 이름/daemon 여부/우선순위를 맞출 수 없어 모니터링 시 어떤 작업인지 추적이 어려웠다.
- Reactor `Flux` 구독이 끊겨도 Thread 가 계속 살아 있어 소켓이 유령 연결 상태로 남았다.
- 기능 중단 발생시 전체 Thread 를 내릴 방법이 없어 애플리케이션 재기동이 유일한 해법이었다.

`ExecutorService` 로 리팩토링을 진행했다.

## ThreadPoolExecutor 핵심 정리
리팩토링 전에 다시 정리한 `ExecutorService` 구성 요소는 아래 표와 같다.

|구성요소|역할|
|---|---|
|`Executor`|`Runnable` 실행만 담당하는 최소 인터페이스|
|`ExecutorService`|작업 제출, `Future` 반환, 종료 제어까지 포함한 상위 인터페이스|
|`Executors`|`newFixedThreadPool` 등 스레드 풀 팩토리|
|`ThreadPoolExecutor`|실제로 스레드 풀을 구현한 클래스|
|`ScheduledExecutorService`|지연/주기 실행 지원|
|`Future`|작업 결과, 예외, 취소 제어|

`ThreadPoolExecutor` 의 생성자 파라미터를 다시 뜯어보면서 우리 서비스에 필요한 값을 명확히 결정할 수 있었다.

|파라미터|설명|
|---|---|
|`corePoolSize`|항상 유지되는 스레드 수. Redis 모니터링 최소 동시 사용자 수(2) 이상으로 설정했다.|
|`maximumPoolSize`|스파이크 대응을 위한 상한. CPU 코어 수보다 2배 이하로 제한해 컨텍스트 스위칭을 넉넉히 잡았다.|
|`keepAliveTime` + `unit`|`corePoolSize` 초과 스레드가 얼마 동안 대기 후 정리될지 결정. 30초만에 줄여 불필요한 리소스를 조절했다.|
|`workQueue`|대기 작업을 담는 `BlockingQueue`. 순서를 보장하기 위해 `LinkedBlockingQueue` 를 선택했다. 필요한 경우 `SynchronousQueue` 로 바꿔 즉시 손님만 받는 전략도 검토했다.|
|`threadFactory`|스레드 이름, daemon 여부 등을 통일하기 위한 팩토리. 운영 중에도 어떤 작업이 실행 중인지 한 번에 찾을 수 있게 했다.|
|`RejectedExecutionHandler`|큐와 풀 모두 꽉 찼을 때 전략. 우선은 기본 `AbortPolicy` 로 두고 알람을 받아 튜닝하기로 했다.|

## Thread 풀 설계
Thread 를 마음대로 생성하던 시절과 달리, 풀의 크기와 생명 주기를 명시적으로 설계했다.

```java
private static final int CORE_POOL_SIZE = Math.max(2, Runtime.getRuntime().availableProcessors() / 2);
private static final int MAX_POOL_SIZE = Math.max(4, Runtime.getRuntime().availableProcessors());
private static final Duration KEEP_ALIVE = Duration.ofSeconds(30);

@Bean(name = "redisMonitorExecutor", destroyMethod = "shutdown")
public ExecutorService redisMonitorExecutor() {
    ThreadFactory threadFactory = runnable -> {
        Thread thread = new Thread(runnable);
        thread.setName("redis-monitor-worker-" + thread.getId());
        thread.setDaemon(true);
        return thread;
    };

    return new ThreadPoolExecutor(
            CORE_POOL_SIZE,
            MAX_POOL_SIZE,
            KEEP_ALIVE.toMillis(),
            TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>(),
            threadFactory
    );
}
```

- `destroyMethod = "shutdown"` 덕분에 애플리케이션 종료 시 모니터링 작업이 안전하게 정리된다.
- Thread 이름 패턴(`redis-monitor-worker-*`)을 통일하니 APM, JVM dump 에서 검색하기가 쉬워졌다.
- `LinkedBlockingQueue` 로 실행 순서를 보장하고, 추후 병렬성이 더 필요하면 `SynchronousQueue(true)` 로 바꿔 즉시 소비 전략을 적용할 계획이다.

## RedisMonitorSvc 적용
기존 `Flux.create` 구간에서 매번 Thread 를 만들던 코드를 아래처럼 `ExecutorService` 에 위임했다.

```java
@Service
public class RedisMonitorSvc {

    private final ExecutorService redisMonitorExecutor;

    public RedisMonitorSvc(@Qualifier("redisMonitorExecutor") ExecutorService redisMonitorExecutor) {
        this.redisMonitorExecutor = redisMonitorExecutor;
    }

    public Flux<RedisMonitorLog> monitor(RedisProfile profile, Integer seconds) {
        ...
        return Flux.create(sink -> {
            MonitorRunner runner = new MonitorRunner(profile, durationMillis, sink);
            sink.onDispose(runner::close);
            redisMonitorExecutor.submit(runner); // Thread 생성 대신 풀에서 실행
        }, FluxSink.OverflowStrategy.BUFFER);
    }
}
```

- `sink.onDispose(runner::close)` 와 `ExecutorService` 를 조합하니 구독이 끊기는 즉시 Redis 소켓을 닫을 수 있었다.
- Reactor 의 백프레셔로 인해 작업이 지연되면 `LinkedBlockingQueue` 가 자연스럽게 버퍼 역할을 하여 불필요한 Thread 확장을 막는다.
- `redisMonitorExecutor.shutdownNow()` 호출로 모니터링 기능을 중지 시킬수 있다.