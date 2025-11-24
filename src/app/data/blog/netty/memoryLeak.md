Netty ByteBuf.release() 누수(LEAK) 발생 원인 및 해결 방법

운영 중 Netty 기반 서버에서 다음과 같은 경고 로그가 반복적으로 발생했다.

LEAK: ByteBuf.release() was not called before it's garbage-collected.
See https://netty.io/wiki/reference-counted-objects.html for more information.


Netty의 ByteBuf는 JVM의 GC만으로 관리되지 않으며, 참조 카운트(Reference Count) 기반으로 직접 해제(release)해야 한다. 이 문제가 발생했다는 것은 버퍼를 다 사용한 뒤 release() 호출이 누락된 코드가 존재한다는 의미이다.

1. 발생 원인

Netty의 ByteBuf는 다음과 같은 메모리 모델을 사용한다.

ByteBuf 생성 시 refCnt = 1

사용을 모두 마친 후 release()를 호출하여 refCnt = 0으로 만들면 메모리 반납

release 없이 GC로 넘어가면 Netty가 이를 **누수(leak)**로 판단하고 경고 로그 출력

스택트레이스를 보면 다음과 같은 위치에서 문제가 시작됨을 알 수 있다.

MessageAggregator.decode

MessageToMessageDecoder.channelRead

CompositeByteBuf 생성 지점

즉, Aggregator 또는 Decoder 단계에서 생성된 ByteBuf가 특정 핸들러에서 처리 후 적절히 release되지 않은 경우가 가장 흔한 원인이다.

2. 누수가 자주 발생하는 코드 패턴
   2.1 channelRead()에서 분기 후 release하지 않는 경우
   @Override
   public void channelRead(ChannelHandlerContext ctx, Object msg) {
   if (msg instanceof ByteBuf buf) {
   process(buf);
   return; // release가 필요하지만 호출되지 않음
   }
   ctx.fireChannelRead(msg);
   }

2.2 MessageToMessageDecoder에서 원본 메시지를 release하지 않는 경우
@Override
protected void decode(ChannelHandlerContext ctx, FullHttpResponse msg, List<Object> out) {
out.add(convert(msg));
// msg는 더 이상 사용되지 않지만 release 누락
}

2.3 SimpleChannelInboundHandler / ChannelInboundHandlerAdapter 혼동

SimpleChannelInboundHandler는 처리 후 자동 release

ChannelInboundHandlerAdapter를 사용할 경우 직접 release 필요

이 차이를 인지하지 못하고 사용하면 release 누락 또는 이중 release가 발생한다.

3. 해결 방법
   3.1 분기에서 메시지를 파이프라인으로 넘기지 않는 경우 release 호출
   @Override
   public void channelRead(ChannelHandlerContext ctx, Object msg) {
   try {
   if (!needProcess(msg)) {
   ReferenceCountUtil.release(msg);
   return;
   }
   ctx.fireChannelRead(msg);
   } catch (Exception e) {
   ReferenceCountUtil.release(msg);
   throw e;
   }
   }

3.2 Decoder 내부에서 원본 메시지 해제
@Override
protected void decode(ChannelHandlerContext ctx, FullHttpResponse msg, List<Object> out) {
try {
out.add(convert(msg));
} finally {
msg.release();
}
}

3.3 개발 환경에서 누수를 보다 정확히 찾기 위한 설정
ResourceLeakDetector.setLevel(ResourceLeakDetector.Level.PARANOID);


PARANOID 모드는 성능은 떨어지지만 누수를 매우 세밀하게 추적할 수 있다.

5. 참고 문서
[Netty Reference-Counted Objects (공식)] https://netty.io/wiki/reference-counted-objects.html

ByteBuf 메모리 모델 및 API 문서

https://netty.io/4.1/api/io/netty/buffer/ByteBuf.html

Netty Buffer Leak Debugging

https://netty.io/wiki/using-as-a-generic-library.html#debugging-buffer-leaks