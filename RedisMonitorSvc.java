package syslink.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import syslink.dto.RedisMonitorLog;
import syslink.enums.TsResultCode;
import syslink.exception.TsException;
import syslink.lib.lang.CommonUtils;
import syslink.lib.lang.MsgUtils;
import syslink.model.RedisProfile;

import java.io.*;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static java.nio.charset.StandardCharsets.*;

@Service
public class RedisMonitorSvc {

    private static final Logger logger = LoggerFactory.getLogger(RedisMonitorSvc.class);

    // 30초 제한
    private static final long MAX_TIMEOUT = Duration.ofSeconds(30).toMillis();


    public Flux<RedisMonitorLog> monitor(RedisProfile profile, Integer seconds) {
        if (seconds == null) {
            throw new TsException(TsResultCode.INVALID_REQUEST, "모니터링 시간은 1초 이상이어야 합니다.");
        }

        long monitoringDurationMillis = Duration.ofSeconds(seconds).toMillis();
        if (monitoringDurationMillis > MAX_TIMEOUT) {
            throw new TsException(TsResultCode.INVALID_REQUEST, "모니터링 시간은 30초 이하여야 합니다.");
        }

        // sink 구독자에게 강제 이벤트 push
        return Flux.create(sink -> { // sink Emitter Flux 입력 장치
            MonitorRunner runner = new MonitorRunner(profile, monitoringDurationMillis, sink);
            Thread worker = new Thread(runner, runner.getThreadName());
            worker.setDaemon(true);
            sink.onDispose(runner::close); // 종료시 발생 코드
            worker.start();
        }, FluxSink.OverflowStrategy.BUFFER);
    }



    /**
     * NOTE : Redis RESP 포맷 통신 헬퍼함수
     */
    private void sendRespCommand(BufferedWriter out, String... parts) throws IOException {
        out.write("*" + parts.length + "\r\n");
        for (String p : parts) {
            byte[] bytes = p.getBytes(StandardCharsets.UTF_8);
            out.write("$" + bytes.length + "\r\n");
            out.write(p);
            out.write("\r\n");
        }
        out.flush();
    }



    /**
     * 실시간 통신을 위한 클래스
     */
    private final class MonitorRunner implements Runnable {
        private final RedisProfile profile;
        private final long durationMillis;
        private final FluxSink<RedisMonitorLog> sink;

        private volatile boolean isClose = false;

        private Socket socket;
        private BufferedReader in;
        private BufferedWriter out;

        private MonitorRunner(RedisProfile profile, long durationMillis, FluxSink<RedisMonitorLog> sink) {
            this.profile = profile;
            this.durationMillis = durationMillis;
            this.sink = sink;
        }

        private String getThreadName() {
            return MsgUtils.format("redis-monitor-{}:{}", profile.getHost(), profile.getPort());
        }

        private void close() {
            isClose = true;

            try {
                if (in != null) {
                    in.close();
                }

                if (out != null) {
                    out.close();
                }

                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                logger.warn("redis monitor close error : {}", CommonUtils.getExceptionMessage(e, 1000));
            }

        }

        @Override
        public void run() {
            try {
                socket = new Socket(profile.getHost(), profile.getPort());
                in = new BufferedReader(new InputStreamReader(socket.getInputStream(), UTF_8));
                out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), UTF_8));

                // 인증
                sendRespCommand(out, "AUTH", profile.getPassword());
                String authReply = in.readLine();
                if (CommonUtils.isEmpty(authReply) || !authReply.contains("OK")) {
                    logger.warn("redis monitor auth error : {}", authReply);
                    throw new TsException(TsResultCode.INTERNAL_ERROR, "REDIS 인증 실패 : " + authReply);
                }

                // 모니터링 진행
                sendRespCommand(out, "MONITOR");
                String monitorReply = in.readLine();
                if (CommonUtils.isEmpty(monitorReply) || !monitorReply.contains("OK")) {
                    logger.warn("redis monitor monitor error : {}", monitorReply);
                    throw new TsException(TsResultCode.INTERNAL_ERROR, "REDIS 모니터링 실패 : " + monitorReply);
                }

                // socket 통신 time
                socket.setSoTimeout((int) durationMillis);
                long deadline = System.currentTimeMillis() + durationMillis;

                logger.info("=============== MONITOR START ( {}s ) ===============", durationMillis / 1000);

                // 시간이 넘거나 중지를 요청하거나
                while (!isClose && !sink.isCancelled() && System.currentTimeMillis() < deadline) {
                    String line;
                    try {
                        line = in.readLine();
                    } catch (SocketTimeoutException e) {
                        logger.debug("redis monitor read timeout");
                        break;
                    }

                    if (line == null) {
                        break;
                    }

                    // client에게 실시간 응답
                    sink.next(RedisMonitorLog.fromLine(line));
                }

                // 성공
                if (!isClose && !sink.isCancelled()) {
                    sink.complete();
                }


            } catch (IOException e) {
                if (!isClose && !sink.isCancelled()) {
                    logger.warn("redis monitor error : {}", CommonUtils.getExceptionMessage(e, 1000));
                    sink.error(new TsException(TsResultCode.INTERNAL_ERROR));
                }
            } catch (TsException e) {
                if (!isClose && !sink.isCancelled()) {
                    sink.error(e);
                }
            } finally {
                //  Buffer  및 Socket 종료
                close();
                logger.info("=============== MONITOR STOP ===============");
            }

        }
    }
}
