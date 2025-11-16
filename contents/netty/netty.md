# Netty: 비동기 이벤트 기반 네트워크 프레임워크의 이해

## Netty란 무엇인가?

Netty는 비동기식 이벤트 기반 네트워크 애플리케이션 프레임워크입니다. Java NIO(Non-blocking I/O)를 기반으로 하여 확장성 있는 고성능 프로토콜 서버와 클라이언트를 개발할 수 있게 해주는 도구입니다.


### Netty 장점
![RMI 다이어그램](/images/netty/stack.png)

1. **고성능**: 최적화된 리소스 사용으로 높은 처리량과 낮은 지연 시간 제공
2. **안정성**: 메모리 관리 최적화로 메모리 누수 방지
3. **유연성**: 다양한 프로토콜(HTTP, WebSocket, TCP, UDP 등) 지원
4. **확장성**: 이벤트 기반 아키텍처로 수천 개의 동시 연결 처리 가능
5. **사용 편의성**: 복잡한 네트워크 프로그래밍을 추상화하여 쉽게 사용 가능


## 비동기와 논블로킹의 이해

Netty의 핵심 개념을 이해하기 위해서는 비동기(Asynchronous)와 논블로킹(Non-blocking)의 차이를 이해하는 것이 중요합니다.

### 블로킹 vs 논블로킹

- **블로킹(Blocking)**: I/O 작업이 완료될 때까지 스레드가 대기 상태에 머무름
```java
// 블로킹 I/O 예시
  InputStream in = socket.getInputStream();
  byte[] buffer = new byte[1024];
  int bytesRead = in.read(buffer); // 데이터가 도착할 때까지 스레드 블로킹
```


- **논블로킹(Non-blocking)**: I/O 작업의 완료 여부와 관계없이 즉시 제어권을 반환
```java
// 논블로킹 I/O 예시
  SocketChannel channel = SocketChannel.open();
  channel.configureBlocking(false);
  ByteBuffer buffer = ByteBuffer.allocate(1024);
  int bytesRead = channel.read(buffer); // 즉시 반환, 데이터가 없으면 0 또는 -1 반환
```


### 동기 vs 비동기

- **동기(Synchronous)**: 작업의 완료를 직접 확인하고 결과를 직접 처리
```java
// 동기 처리 예시
  Future<Integer> future = executor.submit(callableTask);
  int result = future.get(); // 결과가 나올 때까지 대기
  processResult(result);
```


- **비동기(Asynchronous)**: 작업의 완료를 통지받고 콜백으로 결과 처리
```java
// 비동기 처리 예시
  channel.read(buffer, buffer, new CompletionHandler<Integer, ByteBuffer>() {
      @Override
      public void completed(Integer result, ByteBuffer attachment) {
          processResult(result, attachment); // 작업 완료 시 호출되는 콜백
      }
      
      @Override
      public void failed(Throwable exc, ByteBuffer attachment) {
          handleError(exc);
      }
  });
```


Netty는 **비동기 논블로킹** 모델을 사용합니다. 이는 I/O 작업이 완료될 때까지 스레드를 블로킹하지 않고, 이벤트가 발생했을 때 적절한 핸들러를 호출하는 방식으로 동작합니다. 이 방식의 장점은:

1. 적은 수의 스레드로 많은 연결을 처리할 수 있음
2. 스레드 컨텍스트 스위칭 오버헤드 감소
3. CPU와 메모리 사용 효율성 증가
4. 높은 동시성 처리 가능

## Netty의 핵심 컴포넌트

### Channel

Channel은 네트워크 연결의 추상화입니다. 데이터를 읽고 쓰기 위한 기본 단위입니다.

```java
// 채널을 통한 데이터 쓰기 예시
Channel channel = ...;
ByteBuf buffer = Unpooled.copiedBuffer("Hello, Netty!", CharsetUtil.UTF_8);
ChannelFuture future = channel.writeAndFlush(buffer);
future.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture future) {
        if (future.isSuccess()) {
            System.out.println("메시지 전송 성공");
        } else {
            System.err.println("메시지 전송 실패");
            future.cause().printStackTrace();
        }
    }
});
```


### EventLoop 및 EventLoopGroup

EventLoop는 이벤트 처리와 I/O 작업 실행을 담당하는 무한 루프입니다. EventLoopGroup은 여러 EventLoop를 관리합니다.

```java
// EventLoopGroup 설정 예시
EventLoopGroup bossGroup = new NioEventLoopGroup(1);  // 연결 수락용
EventLoopGroup workerGroup = new NioEventLoopGroup(); // 데이터 처리용

try {
    ServerBootstrap bootstrap = new ServerBootstrap();
    bootstrap.group(bossGroup, workerGroup)
        // 추가 설정...
} finally {
    bossGroup.shutdownGracefully();
    workerGroup.shutdownGracefully();
}
```


### ChannelHandler와 ChannelPipeline

#### ChannelHandler

ChannelHandler는 채널에서 발생하는 이벤트를 처리하는 인터페이스입니다. 크게 두 가지 유형으로 나뉩니다:

1. **ChannelInboundHandler**: 인바운드 이벤트 처리
    - channelRegistered: 채널이 EventLoop에 등록됨
    - channelActive: 채널이 활성화됨
    - channelRead: 채널에서 데이터를 읽음
    - channelReadComplete: 채널 읽기 작업 완료
    - channelInactive: 채널이 비활성화됨
    - exceptionCaught: 예외 발생

2. **ChannelOutboundHandler**: 아웃바운드 이벤트 처리
    - bind: 채널을 로컬 주소에 바인딩
    - connect: 원격 서버에 연결
    - disconnect: 원격 서버와의 연결 해제
    - close: 채널 닫기
    - write: 데이터 쓰기
    - flush: 쓰기 버퍼 비우기

#### 인바운드 vs 아웃바운드 처리 흐름

![Netty Pipeline Flow](https://netty.io/images/components2.png)

- **인바운드 이벤트**: 클라이언트에서 서버로 데이터가 들어오는 흐름
    - 소켓 → 채널 → 파이프라인의 첫 번째 핸들러 → ... → 파이프라인의 마지막 핸들러

- **아웃바운드 이벤트**: 서버에서 클라이언트로 데이터가 나가는 흐름
    - 애플리케이션 → 파이프라인의 마지막 핸들러 → ... → 파이프라인의 첫 번째 핸들러 → 채널 → 소켓

```java
// 인바운드 핸들러 예시
public class SimpleInboundHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ByteBuf buf = (ByteBuf) msg;
        try {
            System.out.println("수신 데이터: " + buf.toString(CharsetUtil.UTF_8));
            ctx.fireChannelRead(msg); // 다음 핸들러로 이벤트 전달
        } finally {
            buf.release(); // 버퍼 해제
        }
    }
    
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}

// 아웃바운드 핸들러 예시
public class SimpleOutboundHandler extends ChannelOutboundHandlerAdapter {
    @Override
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) {
        ByteBuf buf = (ByteBuf) msg;
        System.out.println("송신 데이터: " + buf.toString(CharsetUtil.UTF_8));
        ctx.write(msg, promise); // 다음 핸들러로 이벤트 전달
    }
}
```


#### ChannelPipeline

ChannelPipeline은 ChannelHandler들의 체인을 관리하는 컨테이너입니다. 각 채널은 자신만의 파이프라인을 가집니다.

```java
// 파이프라인 설정 예시
ch.pipeline().addLast("decoder", new HttpRequestDecoder());           // 인바운드
ch.pipeline().addLast("encoder", new HttpResponseEncoder());          // 아웃바운드
ch.pipeline().addLast("aggregator", new HttpObjectAggregator(65536)); // 인바운드
ch.pipeline().addLast("handler", new MyCustomHandler());              // 인바운드/아웃바운드
```


### ByteBuf

ByteBuf는 Netty의 데이터 컨테이너로, Java의 ByteBuffer보다 사용하기 쉽고 성능이 뛰어납니다.

주요 특징:
- 읽기/쓰기 인덱스를 별도로 관리하여 편리한 사용
- 참조 카운팅 기반 메모리 관리로 메모리 누수 방지
- 풀링된 버퍼 할당자를 통한 GC 부하 감소
- 유연한 용량 확장

```java
// ByteBuf 사용 예시
ByteBuf buf = Unpooled.buffer(16);
for (int i = 0; i < 16; i++) {
    buf.writeByte(i);
}

while (buf.isReadable()) {
    System.out.println(buf.readByte());
}

buf.release(); // 버퍼 해제
```


## 실제 Netty 서버 구현 예제

아래는 간단한 HTTP 서버를 구현한 예제입니다:

```java
public class NettyHttpServer {
    public static void main(String[] args) throws Exception {
        // EventLoopGroup 설정
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        
        try {
            // 서버 부트스트랩 설정
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new ChannelInitializer<SocketChannel>() {
                 @Override
                 protected void initChannel(SocketChannel ch) throws Exception {
                     ChannelPipeline p = ch.pipeline();
                     // HTTP 처리를 위한 핸들러 추가
                     p.addLast(new HttpServerCodec());
                     p.addLast(new HttpObjectAggregator(65536));
                     p.addLast(new SimpleHttpServerHandler());
                 }
             })
             .option(ChannelOption.SO_BACKLOG, 128)
             .childOption(ChannelOption.SO_KEEPALIVE, true);
            
            // 서버 시작
            ChannelFuture f = b.bind(8080).sync();
            System.out.println("HTTP 서버가 8080 포트에서 시작되었습니다.");
            
            // 서버 채널이 닫힐 때까지 대기
            f.channel().closeFuture().sync();
        } finally {
            // 리소스 해제
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }
    
    // HTTP 요청 처리 핸들러
    static class SimpleHttpServerHandler extends SimpleChannelInboundHandler<FullHttpRequest> {
        @Override
        protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest req) {
            // 요청 정보 출력
            System.out.println("HTTP 요청 수신: " + req.method() + " " + req.uri());
            
            // 응답 생성
            ByteBuf content = Unpooled.copiedBuffer(
                "Hello, Netty HTTP Server!", CharsetUtil.UTF_8);
            FullHttpResponse response = new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1, HttpResponseStatus.OK, content);
            
            // 응답 헤더 설정
            response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain");
            response.headers().set(HttpHeaderNames.CONTENT_LENGTH, content.readableBytes());
            
            // 응답 전송
            ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
        }
        
        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            cause.printStackTrace();
            ctx.close();
        }
    }
}
```


이 예제는 비동기 논블로킹 방식으로 HTTP 요청을 처리합니다. 각 연결은 EventLoop에 할당되고, 요청이 처리되는 동안 스레드는 블로킹되지 않습니다. 이벤트 기반 모델을 통해 수천 개의 동시 연결을 효율적으로 처리할 수 있습니다.


## 참고 자료
- [Netty 공식 웹사이트](https://netty.io)
- [Netty GitHub 레포지토리](https://github.com/netty/netty)