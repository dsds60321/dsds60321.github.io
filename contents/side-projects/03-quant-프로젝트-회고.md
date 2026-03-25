# 3. quant 프로젝트 회고

이번 글은 Python 엔진과 외부 라이브러리를 어떻게 연결해서 실제 퀀트 엔진 구조를 만들었는지에 대한 회고이다. 처음에는 "Python으로 백테스트만 돌리면 되지 않을까"라고 생각했다. 하지만 실제로는 전략 입력을 구조화하고, 장시간 작업을 큐로 넘기고, 외부 데이터 소스를 섞고, 결과를 다시 UI가 이해할 수 있는 형태로 돌려주는 과정까지 모두 설계해야 했다.

## 1. 주제 소개

### [ 핵심 개념 ]

이 프로젝트에서 Python 엔진은 단순 계산 스크립트가 아니다. 실제 역할은 아래와 같다.

- 가격 데이터와 펀더멘털 데이터 적재
- 종목 후보 선별
- 백테스트 실행
- 전략 비교와 최적화
- 리스크 계산
- 뉴스와 이벤트 기반 보조 분석

즉, Python 엔진은 "숫자를 계산하는 함수 모음"이 아니라, 퀀트 도메인에 특화된 분석 서버라고 보는 편이 맞다.

### [ 왜 별도 엔진으로 분리했는가? ]

가장 큰 이유는 계산 생태계 때문이다. pandas, numpy, scipy, vectorbt, yfinance 같은 도구는 Python에서 훨씬 자연스럽다. 반대로 화면에서 필요한 검증, 저장, 이력 관리, 응답 포맷 조합은 Spring Boot가 더 익숙하고 안정적이다.

그래서 구조를 아래처럼 나눴다.

`Next.js -> Spring Boot -> Python Quant Engine -> 외부 데이터 소스`

이 구조를 선택하면 장점이 있다. 프론트는 도메인 화면에 집중하고, Spring Boot는 플랫폼 API와 DB를 맡고, Python은 계산과 데이터 가공에 집중할 수 있다.

## 2. 실제로 어떤 흐름으로 연결했는가

### [ Spring Boot에서 Python으로 요청을 넘기는 방식 ]

백테스트 요청은 바로 Python 함수 호출로 연결하지 않았다. 먼저 Spring Boot 쪽에서 전략, 기간, 스냅샷, 패턴 설정을 검증한 다음, Python 엔진이 이해할 수 있는 payload로 바꿔 넘기도록 만들었다.

실제 서비스 흐름은 대략 아래와 같다.

```kotlin
val payload = mutableMapOf<String, Any>(
    "strategyId" to request.strategyId,
    "startDate" to request.startDate.toString(),
    "endDate" to request.endDate.toString(),
    "factorWeightMode" to (snapshot?.factorWeightMode ?: "AUTO"),
    "factorWeights" to snapshotWeights,
)

resolveEffectiveUniverseScope(strategy, request.universeScope)
    ?.let { payload["universeScope"] = buildUniverseScopePayload(it) }

request.signalPlan?.let { signalPlan ->
    payload["signalPlan"] = mapOf(
        "buyMode" to signalPlan.buyMode,
        "sellMode" to signalPlan.sellMode,
        "holdMode" to signalPlan.holdMode,
    )
}

val result = pythonQuantEngineClient.runBacktest(payload)
```

이 코드가 의미하는 바는 단순하다. UI에서 들어온 요청을 그대로 Python으로 넘기는 것이 아니라, Spring Boot가 한 번 플랫폼 규칙에 맞게 정규화한다는 것이다. 여기서 중요한 점은 Python 엔진이 프론트 UI 구조에 직접 의존하지 않게 된다는 점이다.

즉, 화면이 바뀌더라도 Python 엔진은 `strategyId`, `기간`, `유니버스`, `패턴 정의`, `시그널 계획` 같은 안정적인 입력만 받으면 된다.

### [ Python 엔진에서는 왜 바로 실행하지 않고 큐에 넣었는가 ]

백테스트는 짧게 끝날 수도 있지만, 기간이 길거나 패턴 계산이 많아지면 요청 시간이 길어진다. 그래서 Python 엔진에서는 요청을 받자마자 결과를 돌려주기보다, 작업을 등록하고 백그라운드에서 실행하는 방식으로 바꿨다.

실제 구조는 이런 식이다.

```python
metadata = {
    "kind": "backtest",
    "strategyId": request.strategy_id,
    "startDate": request.start_date.isoformat(),
    "endDate": request.end_date.isoformat(),
    "progressPercent": 0,
    "stage": "queued",
    "stageLabel": "대기 중",
}

job = Job(
    job_type="backtest_dispatch",
    status="PENDING",
    message="백테스트를 대기열에 등록했습니다.",
    metadata_json=cls._serialize_metadata(metadata),
)

future = cls._executor.submit(cls._run_job, job_id, request.model_dump())
```

여기서 핵심은 두 가지이다.

첫째, 작업 자체를 `Job`으로 남긴다. 둘째, 진행률과 단계 정보도 함께 메타데이터로 저장한다. 그래서 프론트는 "요청이 성공했는가"만 보는 것이 아니라, 지금 어디까지 진행됐는지를 다시 조회할 수 있다.

### [ 데이터 소스를 하나로 묶지 않고 합친 이유 ]

실제로 엔진을 만들면서 가장 많이 바뀐 부분은 데이터 적재 방식이었다. 처음에는 하나의 데이터 공급자만으로 끝낼 수 있을 것 같았다. 그런데 막상 해보니 가격, 종목 마스터, 공시, 뉴스가 서로 강점이 달랐다.

그래서 Python 엔진에서는 아래처럼 역할을 나눠 사용했다.

- Yahoo Finance 계열 데이터
  - 가격 이력, 심볼 검색, 일부 프로필, 이벤트 데이터
- SEC
  - 미국 종목의 공시 기반 펀더멘털
- Nasdaq Trader / KRX KIND
  - 종목 유니버스 마스터 목록
- NewsAPI
  - 뉴스 원문 수집

특히 펀더멘털 쪽은 SEC와 Yahoo 데이터를 병합하는 방향으로 설계했다. SEC 기반 공시 데이터가 있으면 그것을 우선 사용하고, 비어 있으면 Yahoo 측 데이터를 보조로 쓰는 식이다.

간단히 표현하면 이런 흐름이다.

```python
sec_rows = self.sec_company_facts_service.build_fundamental_rows(symbol, exchange, history)

if not sec_rows:
    ticker = yf.Ticker(provider_symbol)
    info, profile = self._fetch_yahoo_profile(ticker, symbol)
    yahoo_rows = self._build_fundamental_rows(symbol, history, info, profile, ticker)
else:
    yahoo_rows = []

fundamental_rows = self._merge_fundamental_sources(sec_rows, yahoo_rows)
```

이 코드는 "한 소스만 믿지 않는다"는 설계 철학을 잘 보여준다. 데이터 공급자마다 빈 값과 응답 품질이 다르기 때문에, 퀀트 엔진에서는 단일 소스 의존보다 보강 구조가 훨씬 실용적이었다.

## 3. 동작 원리 또는 내부 흐름

### [ 내부 흐름 ]

백테스트를 예로 들면 전체 흐름은 대략 아래 순서로 움직인다.

1. 사용자가 전략과 기간, 패턴을 선택해 백테스트를 요청한다.
2. Spring Boot가 전략 존재 여부, 날짜 범위, 스냅샷 등을 검증한다.
3. Spring Boot가 Python 엔진용 payload로 변환해 요청을 보낸다.
4. Python 엔진은 작업을 큐에 등록하고 `jobId`를 반환한다.
5. 백그라운드 작업이 가격 데이터, 펀더멘털, 패턴 정의를 기반으로 계산을 수행한다.
6. 진행률, 단계, 메시지를 `jobs` 테이블 메타데이터에 갱신한다.
7. 완료되면 결과 요약과 `backtestId`를 남긴다.
8. 프론트는 `jobId`를 기준으로 상태를 조회하고, 완료 후 결과 화면으로 이동한다.

즉, 이 엔진의 핵심은 계산 알고리즘 자체도 중요하지만, 그 계산을 서비스 안에서 "중단 없이 다시 조회 가능한 작업"으로 다루는 방식에 있었다.

### [ 외부 라이브러리는 어디까지 맡겼는가 ]

라이브러리가 해주는 것과 직접 구현해야 하는 것을 분리하려고 했다.

- `pandas`, `numpy`
  - 시계열 계산과 데이터 가공
- `vectorbt`
  - 백테스트 계산 보조
- `yfinance`
  - 가격 및 일부 메타데이터 접근
- `requests`
  - 외부 API 호출

반대로 직접 구현한 것은 아래 영역이었다.

- 전략 입력을 계산 파이프라인으로 바꾸는 payload 설계
- 작업 큐와 중복 작업 방지
- 진행률 메타데이터 갱신
- 데이터 공급자 병합 규칙
- 백테스트 결과를 플랫폼 DTO로 되돌리는 방식

즉, 라이브러리는 계산 도구였고, 퀀트 엔진이라는 제품의 흐름은 결국 직접 설계해야 했다.

## 4. 예시로 이해하기

예를 들어 사용자가 특정 전략으로 5년 백테스트를 실행한다고 해보자. 사용자는 버튼 한 번 눌렀을 뿐이지만, 내부에서는 꽤 많은 일이 일어난다.

- 전략 저장 값과 스냅샷 비중을 확인한다
- 유니버스 범위를 실제 종목 집합으로 해석한다
- 필요한 가격 이력을 조회하거나 보강한다
- 리밸런싱 시점마다 후보를 계산한다
- 패턴 정의와 시그널 계획을 결합한다
- 수익률, 낙폭, 거래 로그, 종목별 성과를 계산한다
- 결과를 DB에 저장하고, 프론트가 다시 읽을 수 있는 형태로 정리한다

이 흐름을 하나의 HTTP 요청-응답 안에서 끝내려 했다면 UX도 나빠지고 장애 대응도 어려워졌을 것이다. 그래서 Python 엔진을 별도 서버로 두고 작업형 처리 구조를 만든 것이 결과적으로 맞는 선택이었다고 본다.

## 5. 장점 / 한계 / 주의사항

### [ 장점 ]

- 분석 코드를 Python 생태계에 맞게 자연스럽게 유지할 수 있다
- Spring Boot와 역할이 분리되어 계산 코드가 도메인 서비스에 흩어지지 않는다
- 장시간 작업을 큐 기반으로 다루기 쉬워진다
- 데이터 공급자를 역할별로 섞어 쓸 수 있다

### [ 한계 ]

반대로 서비스가 둘로 나뉘면 공통 타입 관리가 더 중요해진다. 날짜 포맷, 상태값, 필드명, 에러 구조가 조금만 달라도 디버깅이 길어진다. 또한 Python 엔진 내부에서 외부 데이터 소스를 많이 다루다 보니, 네트워크 실패와 rate limit 대응을 생각보다 자주 고민해야 했다.

### [ 주의할 점 ]

Python 엔진을 만든다고 해서 곧바로 퀀트 플랫폼이 되는 것은 아니다. 중요한 것은 계산 코드를 서비스 흐름 안에 안전하게 넣는 일이다. 즉, "계산이 된다"와 "제품에서 안정적으로 운영된다"는 전혀 다른 문제라는 점을 계속 의식해야 했다.

## 6. 정리

정리하면, 이 프로젝트의 Python 엔진은 단순한 분석 스크립트 모음이 아니라, 백테스트와 데이터 적재, 전략 비교, 리스크 계산을 담당하는 독립 계산 서버에 가깝다. Spring Boot는 이 엔진에 요청을 전달하기 전에 입력을 정리하고, Python 엔진은 작업 큐와 메타데이터를 통해 계산을 운영 가능한 형태로 만든다.

결국 중요한 것은 라이브러리를 얼마나 많이 붙였는지가 아니라, 그 라이브러리들을 어떤 책임 구조 안에 넣었는가이다. 따라서 퀀트 엔진을 만들 때는 계산 알고리즘뿐 아니라 작업 관리, 데이터 병합, API 계약까지 함께 설계해야 한다는 점을 크게 배웠다.
