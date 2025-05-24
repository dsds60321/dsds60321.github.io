// post1.ts
import type { BlogPost } from '@/app/types/blog';
import {GLOBAL} from "@/app/constants";

export const post2: BlogPost = {
    id: 'netty-project',
    title: 'Netty 프로젝트 구현',
    date: '2025-05-24',
    md: `
   # Netty 사내 프로젝트구현
주로 어드민 페이지나 결제창 개발과 같은 웹 UI 중심의 업무를 해왔지만, 백엔드 API 서버 개발에 대한 갈증이 있었습니다. 다행히 사내에서 모바일 앱 백엔드 서버 개발 기회가 주어졌고, 이번에는 Netty 프레임워크를 활용한 서버 구축 경험을 공유하고자 합니다. <br>
* ~~아래 코드들은 사내 코드가 아닌 예시 코드입니다.~~


### 프로젝트에 구성
* 이벤트는 요청, 인증, 매핑, 응답에 관한 핸들러로 구성했습니다.
1. 요청
    * 요청 정보
      * ip, uri, header, method, payload, user-agent 기록
      * ChannelHandlerContext 안에 요청과 응답에 대한 로깅을 남길 데이터를 넣어두어 처음 요청과 응답에 해당 로깅을 사용했습니다.
    * 특정 IP 차단
    * 특정 http 메서드 허용, 자원요청 응답
       
2. 인증
    * 인증에 대한 부분에서는 인증이 필요한 uri 등에 대해 구분하기위해 어노테이션을 만들어 해당 어노테이션이 아니면 인증에 대한 부분은 통과 아닌경우 인증을 진행
3. 매핑
   * 응답 이벤트에서 스프링과 유사한 진행을 하기 위해 http 요청 정보등을 특정 어노테이션들에 담아 응답 이벤트에게 위임하는 코드를 작성했습니다.
4. 응답
   * 응답 부분에서는 버전별 응답이 상이할수 있음으로 응답 형태별 분기를 다르게 했습니다.
   * 사용자에게 응답을 먼저 주고 연산, db 작업등을 후에 진행하여 조금 더 빠른 응답을 줄 수 있습니다.
5. API 통신
    * Netty에 맞게 비동기 통신을 지원하기위해 HttpClient를 사용했습니다.

## 서버 아키텍처 설계
### 1. 서버 초기화 및 파이프라인 구성
Netty 서버의 핵심은 이벤트 루프와 채널 파이프라인입니다. 서버 초기화 코드는 다음과 같이 구성했습니다:
\`\`\` java
public class Server extends Thread {
    @Override
    public void run() {
        bossGroup = new NioEventLoopGroup(1);
        workGroup = new NioEventLoopGroup(1);

        try {
            // 컨트롤러 매핑 초기화
            for (String basePackage : Config.env.basePackages) {
                RouterConfig.init(basePackage);
            }

            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workGroup)
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel sc) throws Exception {
                        ChannelPipeline p = sc.pipeline();
                        
                        // HTTP 처리 기본 핸들러
                        p.addLast(new IdleStateHandler(30, 60, 0));
                        p.addLast(new HttpServerCodec());
                        p.addLast(new HttpObjectAggregator(MAX_CONTENT_SIZE));
                        p.addLast(new ChunkedWriteHandler());
                        
                        // 비즈니스 로직 핸들러
                        p.addLast(new FrontHandler()); // 요청 로깅 및 기본 검증
                        p.addLast(new AuthHandler()); // 인증 처리
                        p.addLast(new DispatcherHandler()); // 컨트롤러 매핑
                    }
                });

            ChannelFuture future = bootstrap.bind(bindIp, bindPort).sync();
            future.channel().closeFuture().sync();
        } catch (Exception e) {
            logger.error("서버 실행 중 오류: {}", e.getMessage());
        } finally {
            bossGroup.shutdownGracefully();
            workGroup.shutdownGracefully();
        }
    }
}
\`\`\`
여기서 핵심은 파이프라인에 추가된 핸들러들입니다. 각 핸들러는 순차적으로 요청을 처리하며, 이를 통해 관심사를 명확히 분리했습니다.
### 2. 요청 로깅 및 기본 검증
FrontHandler는 모든 요청에 대한 첫 번째 관문 역할을 합니다. 이 핸들러에서는 요청 로깅, IP 필터링, HTTP 메서드 검증 등의 기본적인 처리를 담당합니다:
\`\`\` java
public class FrontHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if(!(msg instanceof FullHttpRequest)) {
            return;
        }

        FullHttpRequest request = (FullHttpRequest)msg;
        String uri = request.uri();

        // 요청 로깅
        long contentLength = CommonUtils.parseLong(request.headers().get(HttpHeaderNames.CONTENT_LENGTH));
        String clientIp = request.headers().get("X-Real-IP") != null 
            ? request.headers().get("X-Real-IP") 
            : TMSUtil.getRemoteAddress(ctx.channel());
            
        String log = String.format("%s,%d,%s,%s", clientIp, contentLength, 
                request.method().toString().toLowerCase(), uri);
        
        logger.info(log);
        ctx.channel().attr(Constants.ATTR_REQUEST_LOG).set(log);

        // HTTP 메서드 검증
        if(!"GET,POST,PUT".contains(request.method().toString().toUpperCase())) {
            ResponseMapper.send(ctx, HttpResponseStatus.METHOD_NOT_ALLOWED);
            return;
        }

        // IP 블랙리스트 확인
        for(String denyIp : Config.env.denyIps) {
            if(clientIp.startsWith(denyIp)) {
                logger.info("차단된 IP 접근: {}, IP: {}", clientIp, denyIp);
                ResponseMapper.send(ctx, HttpResponseStatus.NOT_FOUND);
                return;
            }
        }

        // 다음 핸들러로 전달
        ctx.fireChannelRead(msg);
    }
}
\`\`\`
### 3. 인증 처리
인증 로직은 BaseAuthHandler를 상속한 버전별 구현체를 통해 API 버전별로 다르게 처리했습니다. 여기서는 공통적인 인증 로직을 담당하는 베이스 클래스를 보여드리겠습니다:
\`\`\` java
public abstract class BaseAuthHandler extends ChannelInboundHandlerAdapter {
    // 버전에 맞는 URI 유효성 검사
    protected abstract boolean isNotValidUrl(String path);
    
    // 요청 기록 메서드
    protected abstract void recordNetworkIO();
    
    // 인증 성공 후 처리 로직
    protected abstract boolean processAfterAuthSuccess(ChannelHandlerContext ctx, FullHttpRequest request);

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (!(msg instanceof FullHttpRequest)) {
            ctx.fireChannelRead(msg);
            return;
        }

        FullHttpRequest request = (FullHttpRequest) msg;
        String path = request.uri();

        // 해당 핸들러가 처리할 URL인지 확인
        if (isNotValidUrl(path)) {
            ctx.fireChannelRead(msg);
            return;
        }

        // 라우트 핸들러 찾기
        String httpMethod = request.method().name();
        RouterConfig.Handler handler = RouterConfig.findHandler(httpMethod, path);
        if (handler == null) {
            ctx.fireChannelRead(msg);
            return;
        }

        // 세션 데이터 초기화 및 저장
        SessionBean sessionBean = new SessionBean(ctx, request);
        sessionBean.id = generateRequestId(request);
        sessionBean.uri = path;
        
        // 디바이스 정보 설정
        setDeviceInfo(sessionBean);
        
        // 세션 저장
        SessionManager.setSessionByContext(ctx, sessionBean);
        
        // 요청 기록
        recordNetworkIO();

        // 인증 필요 여부 확인
        Method method = handler.method();
        Class<?> controllerClass = method.getDeclaringClass();
        boolean isIgnoreAuth = method.isAnnotationPresent(SessionIgnore.class) ||
                controllerClass.isAnnotationPresent(SessionIgnore.class);

        if (isIgnoreAuth) {
            ctx.fireChannelRead(msg);
            return;
        }

        // 인증 처리 및 다음 단계 진행
        boolean continueProcessing = processAfterAuthSuccess(ctx, request);
        if (continueProcessing) {
            ctx.fireChannelRead(msg);
        }
    }
}
\`\`\`
이 구조를 통해 API 버전별로 다른 인증 로직을 구현하면서도 공통 처리 흐름은 일관되게 유지할 수 있었습니다.
### 4. 컨트롤러 매핑 및 요청 디스패칭
Spring과 유사하게 어노테이션 기반의 컨트롤러 매핑을 구현했습니다. 먼저 RouterConfig 클래스에서 컨트롤러를 스캔하고 매핑 정보를 등록합니다:
\`\`\` java
public class RouterConfig {
    private static final Map<String, Handler> ROUTES = new HashMap<>();
    
    public record Handler(Object instance, Method method, String produces) {}

    public static void init(String basePackage) {
        try {
            Set<Class<?>> controllers = findClassesWithAnnotation(basePackage, Controller.class);

            for (Class<?> clazz : controllers) {
                Controller controllerAnnotation = clazz.getAnnotation(Controller.class);
                String baseUrl = controllerAnnotation.url();
                Object instance = clazz.getConstructor().newInstance();

                for (Method method : clazz.getDeclaredMethods()) {
                    if (method.isAnnotationPresent(RequestMapping.class)) {
                        RequestMapping rm = method.getAnnotation(RequestMapping.class);
                        
                        String fullPath = buildFullPath(baseUrl, rm.path());
                        String key = rm.method() + ":" + fullPath;
                        
                        ROUTES.put(key, new Handler(instance, method, rm.produces()));
                        logger.info("등록된 라우트: {} -> {}.{}", key, 
                                clazz.getSimpleName(), method.getName());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("라우터 초기화 오류: {}", e.getMessage());
        }
    }

    public static Handler findHandler(String method, String path) {
        // 정확한 경로 매칭
        Handler handler = ROUTES.get(method + ":" + path);
        if (handler != null) {
            return handler;
        }

        // 경로 변수 패턴 매칭 (예: /users/{id})
        for (Map.Entry<String, Handler> entry : ROUTES.entrySet()) {
            String key = entry.getKey();
            if (!key.startsWith(method + ":")) continue;
            
            String routePath = key.substring(method.length() + 1);
            if (routePath.contains("{") && routePath.contains("}")) {
                String pathPattern = routePath.replaceAll("\\\\{[^/]+?\\\\}", "([^/]+?)");
                Pattern pattern = Pattern.compile("^" + pathPattern + "$");
                Matcher matcher = pattern.matcher(path);
                
                if (matcher.matches()) {
                    return entry.getValue();
                }
            }
        }
        
        return null;
    }
}
\`\`\`
그리고 DispatcherHandler는 실제 컨트롤러 메서드를 호출하고 응답을 처리합니다:
* argumentResolver는 스프링에서와 유사하게 응답 영역에서 @RequestBody, @Session, @Pathvariable등과 같은 데이터를 가져오기위해 작성한 유틸입니다.
\`\`\` java
public class DispatcherHandler extends SimpleChannelInboundHandler<FullHttpRequest> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest request) throws Exception {
        String path = request.uri();
        String httpMethod = request.method().name();
        
        // 경로에 맞는 핸들러 찾기
        RouterConfig.Handler handler = RouterConfig.findHandler(httpMethod, path);
        
        if (handler == null) {
            ResponseMapper.send(ctx, HttpResponseStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다");
            return;
        }
        
        Object controller = handler.instance();
        Method method = handler.method();
        
        try {
            // 메서드 파라미터 해석
            Object[] args = MappingUtils.argumentResolver(request, handler, ctx);
            
            // 컨트롤러 메서드 호출
            Object result = method.invoke(controller, args);
            
            // 응답 전송
            ResponseMapper.write(ctx, result, handler.produces());
            
        } catch (ValidationException e) {
            // 유효성 검증 실패 처리
            ResponseMapper.send(ctx, HttpResponseStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            // 기타 오류 처리
            logger.error("요청 처리 중 오류: {}", e.getMessage());
            ResponseMapper.send(ctx, HttpResponseStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다");
        }
    }
}
\`\`\`
### 5. 응답 처리
ResponseMapper 클래스는 다양한 응답 유형을 처리하고 클라이언트에게 전송하는 역할을 담당합니다:
\`\`\` java
public class ResponseMapper {
    public static void write(ChannelHandlerContext ctx, Object result, String contentType) {
        // 요청 로그 출력
        logger.info("{}", ctx.channel().attr(Constants.ATTR_REQUEST_LOG).get());
        
        // API 버전별 응답 처리
        if (result instanceof Response<?> responseData) {
            // 신규 API 응답 (TB)
            HttpResponseStatus httpStatus = resolveHttpStatus(responseData.getCode());
            String responseJson = jsonUtil.toJson(responseData);
            
            FullHttpResponse httpResponse = createResponse(responseJson, contentType, httpStatus);
            sendAndClose(ctx, httpResponse);
        } 
        else if (result instanceof LegacyResponse<?> responseData) {
            // 레거시 API 응답 (C3)
            HttpResponseStatus status = HttpResponseStatus.valueOf(responseData.getStatus());
            String responseContent = "";
            
            if (status.code() == 200) {
                responseContent = jsonUtil.toJson(Map.of("data", responseData.getData()));
            } else {
                responseContent = responseData.getMessage();
            }
            
            FullHttpResponse httpResponse = createResponse(responseContent, 
                    getDefaultHeaders(), status);
            sendAndClose(ctx, httpResponse);
        } 
        else {
            // 일반 객체 응답
            FullHttpResponse response = createResponse(
                    result != null ? jsonUtil.toJson(result) : "", 
                    contentType, HttpResponseStatus.OK);
            sendAndClose(ctx, response);
        }
    }

    // 응답 전송 및 채널 정리
    private static void sendAndClose(ChannelHandlerContext ctx, Object response) {
        if (!ctx.channel().isActive() || !ctx.channel().isWritable()) {
            releaseIfNeeded(response);
            logger.warn("채널이 이미 닫혔거나 쓰기 불가능합니다");
            return;
        }

        // 요청 처리 시간 계산
        Long startTime = ctx.channel().attr(Constants.ATTR_START_TIME).get();
        
        ChannelFuture future = ctx.writeAndFlush(response);
        future.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture future) throws Exception {
                if (future.isSuccess()) {
                    double elapsed = (System.nanoTime() - startTime) / 1e6d;
                    logger.info("응답 완료, 처리 시간: {:.3f}ms", elapsed);
                } else {
                    logger.error("응답 전송 실패: {}", future.cause().getMessage());
                    releaseIfNeeded(response);
                }
                
                // 비동기적으로 채널 닫기
                CompletableFuture.runAsync(() -> {
                    try {
                        Thread.sleep(100); // 응답 완료를 위한 짧은 대기
                    } catch (Exception e) {}
                    
                    future.channel().close();
                });
            }
        });
    }
}
\`\`\`
## 프로젝트 구현 시 고려사항
### 1. 메모리 관리
Netty는 ByteBuf와 같은 참조 카운팅 객체를 사용하므로, 메모리 누수를 방지하기 위해 적절한 자원 해제를 신경썼습니다:
\`\`\` java
private static void releaseIfNeeded(Object msg) {
    if (msg instanceof ReferenceCounted) {
        try {
            ReferenceCounted refCounted = (ReferenceCounted) msg;
            if (refCounted.refCnt() > 0) {
                refCounted.release();
            }
        } catch (Exception e) {
            logger.warn("객체 해제 중 오류: {}", e.getMessage());
        }
    }
}
\`\`\`
### 2. 비동기 처리
외부 API 호출이나 데이터베이스 작업 시 이벤트 루프를 블로킹하지 않기 위해 CompletableFuture를 활용했습니다:
\`\`\` java
public class PaymentService {
    public CompletableFuture<PaymentResult> processPayment(PaymentRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // 외부 결제 API 호출
                HttpResponse<String> response = httpClient.send(
                    HttpRequest.newBuilder()
                        .uri(URI.create(paymentGatewayUrl))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(
                            jsonUtil.toJson(request)))
                        .build(),
                    HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() == 200) {
                    return jsonUtil.fromJson(response.body(), PaymentResult.class);
                } else {
                    throw new RuntimeException("결제 처리 실패: " + response.statusCode());
                }
            } catch (Exception e) {
                logger.error("결제 처리 중 오류: {}", e.getMessage());
                throw new CompletionException(e);
            }
        }, executorService);
    }
}
\`\`\`
### 3. 컨트롤러 예제
Spring MVC와 유사한 패턴으로 컨트롤러를 구현했습니다:
\`\`\` java
@Controller("/api/v1/payment")
public class PaymentController {
    private final PaymentService paymentService = new PaymentService();

    @RequestMapping(method = "POST", path = "/process")
    public ApiResponse<PaymentResult> processPayment(@RequestBody PaymentRequest request, 
                                                   SessionBean session) {
        try {
            // 결제 처리
            PaymentResult result = paymentService.processPayment(request).get();
            return ApiResponse.success(result);
        } catch (Exception e) {
            logger.error("결제 처리 중 오류: {}", e.getMessage());
            return ApiResponse.error("PAY-001", "결제 처리 중 오류가 발생했습니다");
        }
    }
    
    @SessionIgnore
    @RequestMapping(method = "GET", path = "/status/{id}")
    public ApiResponse<PaymentStatus> getPaymentStatus(String id) {
        return ApiResponse.success(paymentService.getPaymentStatus(id));
    }
}
\`\`\`

---
* 이번 프로젝트를 통해 HTTP 서버의 기본 동작 원리와 비동기 이벤트 기반 아키텍처에 대한 이해를 높일 수 있었습니다. 또한 프레임워크가 기본적으로 제공하는 기능들을 직접 구현해봄으로써 서버의 내부 구조에 대한 이해를 얻게 되었습니다.

## 참고 자료
- [Netty 공식 웹사이트](https://netty.io)
- [Netty GitHub 레포지토리](https://github.com/netty/netty)
`,
    excerpt: 'netty',
    tags: ['netty', 'java'],
    author: GLOBAL.NAME,
    coverImage: '/images/netty/netty.webp',
};
