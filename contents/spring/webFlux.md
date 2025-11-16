# SpringWebFlux
## 1. **Spring WebFlux란?**
Spring WebFlux는 리액티브 프로그래밍 모델을 따라 **비동기** 및 **논블로킹** 애플리케이션을 구축할 수 있도록 지원하는 웹 스택입니다. 기존 Spring MVC가 스레드 기반의 블로킹 I/O 작업을 사용하는 것과는 대조적으로, WebFlux는 이벤트 루프(Event Loop) 모델을 사용하여 논블로킹 방식으로 높은 확장성을 제공합니다.
### 🎯 **Spring WebFlux의 이름**
`Web`은 웹 애플리케이션의 클라이언트-서버 구조를 의미하며, `Flux`는 Spring WebFlux가 사용하는 Reactor의 주요 데이터 스트림 타입 중 하나에서 따왔습니다. 이 이름은 WebFlux가 **리액티브 스트림을 활용하여 데이터를 비동기적으로 처리**한다는 점을 강조합니다.
## 2. **왜 Spring WebFlux를 사용해야 할까?**
### ✅ **동기 vs 비동기 모델**
- **Spring MVC (동기 모델)**
    - 요청을 처리하는 동안 해당 스레드는 블로킹 상태.
    - 하나의 요청 처리가 길어질 경우 스레드 리소스가 소모됨.
    - 확장성을 확보하기 위해 더 많은 스레드를 추가해야 함.

- **Spring WebFlux (비동기 모델)**
    - 요청을 처리할 때 스레드를 블로킹하지 않음.
    - `Mono`, `Flux`를 통해 비동기적으로 데이터를 스트리밍.
    - 소수의 스레드를 활용하여 더 많은 요청을 효율적으로 처리.

### ✅ **Spring WebFlux를 선택해야 하는 이유**
1. **확장성 (Scalability)**
    - 소수의 스레드로 많은 요청을 효율적으로 처리 가능.

2. **고성능**
    - CPU와 메모리 사용을 최소화하여 빠른 응답 시간을 제공.

3. **리소스 절약**
    - 블로킹 서버와 달리 스레드 풀에서 대규모 스레드를 유지할 필요가 없음.

4. **적합한 사용 사례**
    - I/O가 많은 작업(데이터베이스 호출, API 연동)에서 높은 성능을 발휘.
    - 실시간 스트리밍 데이터 처리 및 이벤트 기반 시스템에 적합.

## 3. **Spring WebFlux의 특징**
### **리액티브 스트림 (Reactive Streams)**
Spring WebFlux는 **리액티브 스트림 사양([https://www.reactive-streams.org/](https://www.reactive-streams.org/))**을 따릅니다. 이 사양은 데이터 처리 스트림에서 백프레셔(Backpressure)를 지원하며, 이는 생산자와 소비자 사이의 데이터 전달 속도를 조정하여 효율성을 높입니다.
- **Publisher**: 데이터를 발행하는 주체.
- **Subscriber**: 데이터를 구독 및 소비하는 주체.
- **Backpressure**: 구독자가 감당할 수 있는 만큼만 데이터를 요청하도록 조정.

WebFlux는 이러한 패턴을 통해 효율적인 데이터 흐름과 리소스 관리를 가능하게 합니다.
### **Project Reactor 기반**
Spring WebFlux는 리액티브 프로그래밍의 구현체인 **Project Reactor**를 기반으로 합니다.
- **Mono**: 0~1개의 비동기 데이터를 처리.
- **Flux**: 0~N개의 비동기 데이터를 처리.

`Mono`와 `Flux`를 활용하여 비동기 데이터를 선언적으로 처리할 수 있으며, WebFlux에서 클라이언트-서버 간의 데이터 통신에 주로 사용됩니다.
### **논블로킹 I/O 프로그래밍**
Spring WebFlux는 Java의 NIO(Non-blocking IO) API를 사용하여, 요청 처리 중 스레드를 블로킹되지 않게 유지합니다. 이를 통해 모든 요청은 다음과 같은 방식으로 처리됩니다.
1. 요청이 들어오면 논블로킹 방식으로 처리.
2. 요청 작업이 오래 걸리더라도 스레드는 풀(pool)에 반환되고, 다른 요청 처리에 활용.
3. 결과가 준비되면 이벤트 루프를 통해 응답을 반환.

### **함수형 라우터 선언 (Functional Endpoint)**
전통적인 MVC처럼 `@Controller` 및 `@RequestMapping`을 사용할 수도 있지만, WebFlux는 함수형 스타일로 라우팅을 구성하는 것을 기본 지원합니다. 이를 **함수형 엔드포인트(Functional Endpoint)**라고 하며, 선언형 스타일로 요청-응답 처리를 정의합니다.
``` java
@Bean
public RouterFunction<ServerResponse> route(ExampleHandler handler) {
    return RouterFunctions
        .route(GET("/example"), handler::handleGet)
        .andRoute(POST("/example"), handler::handlePost);
}
```
## 4. **Spring WebFlux의 작동 원리**
Spring WebFlux는 **Netty**와 같은 논블로킹 HTTP 서버를 활용합니다. 이러한 아키텍처는 기존의 Servlet 스레드 모델과 전혀 다릅니다.
### ▶ 기존 동기 모델의 작동 방식
1. 클라이언트 요청 → 별도의 스레드 할당 → 요청 처리 완료 시까지 스레드 블로킹.
2. 동시 요청 수 증가 시 스레드 자원이 부족해질 가능성 증가.

### ▶ Spring WebFlux의 비동기 모델 작동 방식
1. 클라이언트 요청 → 이벤트 루프(Event Loop)를 사용해 요청 처리.
2. 요청 중 다른 비동기 작업이 필요하다면, 작업 실행 중 스레드 반환 → 다른 요청 처리.
3. 작업 결과가 준비되면 다시 이벤트 루프가 이를 소비하고 응답 반환.

이 논블로킹 모델은 확장성이 뛰어나며, 특정 시점에 요청 수가 급격히 증가해도 성능이 저하되지 않는 안정성을 보장합니다.
## 5. **Spring WebFlux의 사용 사례**
Spring WebFlux는 특정 상황에서 매우 강력한 성능을 발휘합니다. 다음과 같은 경우 고려할 수 있습니다.
1. **멀티플렉싱 I/O 작업**
    - 데이터베이스, REST API, 메시지 브로커 등 I/O 작업이 많을 때 최적화된 동작.

2. **리소스 제한된 환경**
    - 제한된 CPU 및 메모리 자원으로 높은 처리량을 원할 경우.

3. **실시간 데이터 스트리밍**
    - WebSocket, SSE(Server-Sent Event) 기반 실시간 알림 또는 대규모 데이터 전송.

4. **분산 마이크로서비스**
    - 분산 시스템에서 느린 네트워크 지연을 극복하며 데이터 전달 속도 최적화.

## 6. **Spring WebFlux의 장점**
1. **높은 확장성**
    - 적은 리소스로 대규모 요청 처리.

2. **비동기 및 논블로킹 아키텍처**
    - 요청 자체가 비동기로 동작하며, 처리 중 스레드를 점유하지 않음.

3. **선언형 프로그래밍**
    - `Mono`와 `Flux`의 선언적인 API를 통해 간결하면서 가독성 높은 코드 작성 가능.

4. **다양한 HTTP 서버 지원**
    - Netty, Jetty, Undertow 등 다양한 비동기 HTTP 서버와 통합 가능.

---
[Project Reactor 공식](https://projectreactor.io)
[Spring WebFlux 공식 문서](https://spring.io/projects/spring-webflux)