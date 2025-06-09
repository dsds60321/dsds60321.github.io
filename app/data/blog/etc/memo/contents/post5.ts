// post1.ts
import type { BlogPost } from '@/app/types/blog';
import {GLOBAL} from "@/app/constants";

export const post5: BlogPost = {
    id: 'interview',
    title: '개발자 면접 질문',
    date: '2025-06-09',
    md: `
    # 개발자 기술면접 핵심 정리
## 개발자 기술면접 꼬리물기 질문 스터디 가이드
* 링크 : https://chained-tech-interview-questions.gitbook.io/ctiq
* 유튜브 : https://www.youtube.com/watch?v=Mbetqbic2gY&list=PLf6phOsW5cZ4V0cxgH-1pmRFjhtq084Sw

### 퀴즈
1. 스택(Stack)의 데이터 입출력 방식은 무엇이며, 주요 연산 두 가지는 무엇인가요?
2. 큐(Queue)의 데이터 입출력 방식은 무엇이며, 주요 연산 두 가지는 무엇인가요?
3. 개발에서 스택이 사용되는 대표적인 예시 두 가지를 설명하세요.
4. 개발에서 큐가 사용되는 대표적인 예시 두 가지를 설명하세요.
5. 스택을 구현할 때 Array List가 적합한 이유는 무엇인가요?
6. 큐를 구현할 때 Linked List가 적합한 이유는 무엇인가요?
7. 자바에서 Generic을 사용하는 주된 이유는 무엇인가요?
8. 자바에서 Garbage Collection의 역할은 무엇인가요?
9. Spring 프레임워크의 @Autowired 어노테이션은 어떤 역할을 하나요?
10. 데이터베이스 트랜잭션(Transaction)의 주된 목적은 무엇인가요?

---

### 퀴즈 정답
1. 스택은 **후입선출(LIFO)** 방식이며, 주요 연산은 데이터를 쌓는 *Push*와 꺼내는 *Pop*입니다.
2. 큐는 **선입선출(FIFO)** 방식이며, 주요 연산은 데이터를 넣는 *Offer*와 꺼내는 *Poll*입니다.
3. 스택은 **실행 취소 기능**, **웹 브라우저의 뒤로 가기 기능**, **재귀 함수 호출 관리**, **백트래킹 알고리즘** 등에 사용됩니다.
4. 큐는 **운영 체제에서 프로세스를 순차적으로 처리**, **너비 우선 탐색(BFS)**, **비동기 요청 처리** 등에 사용됩니다.
5. Array List는 **인덱스를 통해 마지막 데이터에 빠르게 접근**할 수 있어, 데이터 추가와 제거가 리스트의 끝에서 일어나는 스택 구현에 적합합니다.
6. Linked List는 **앞에서 데이터를 제거하고 뒤에서 데이터를 추가하는 큐의 구조에서 삽입과 삭제가 효율적**이기 때문에 적합합니다.
7. Generic은 **컴파일 시점에 타입 체크를 강화**하여 런타임 에러를 줄이고 코드의 안정성을 높이는 데 사용됩니다.
8. Garbage Collection은 **더 이상 사용되지 않는 객체의 메모리를 자동으로 회수**하여 메모리 누수를 방지하는 역할을 합니다.
9. @Autowired는 **스프링 컨테이너가 관리하는 빈(Bean)을 필요한 곳에 자동으로 주입**(Dependency Injection)하는 역할을 합니다.
10. 트랜잭션은 **여러 데이터베이스 작업을 하나의 논리적인 단위로 묶어 데이터의 일관성과 무결성을 보장**하는 데 목적이 있습니다.

---

### 에세이 형식 문제
1. **자바의 힙(Heap) 메모리 구조와 Garbage Collection의 동작 방식을 상세히 설명**하고, 메모리 관리 측면에서 Garbage Collection이 중요한 이유를 논하세요.
2. **데이터베이스의 정규화(Normalization)가 필요한 이유**와 각 정규형(예: 1NF, 2NF, 3NF)의 목표를 설명하고, **정규화의 장단점**을 분석하여 비정규화(Denormalization)가 필요한 경우를 예시와 함께 제시하세요.
3. **네트워크 전송 계층의 역할과 주요 프로토콜(TCP와 UDP)을 비교 설명**하고, 각각의 특징이 어떤 종류의 애플리케이션에 적합한지 구체적인 예시를 들어 설명하세요.
4. **디자인 패턴 중 싱글톤 패턴(Singleton Pattern)의 목적과 구현 방법**을 설명하고, 멀티 스레드 환경에서 싱글톤 패턴을 안전하게 구현하기 위한 방법들을 논하며 장단점을 분석하세요.
5. **운영체제의 프로세스와 스레드의 차이점**을 설명하고, 멀티 프로세스 환경과 멀티 스레드 환경의 특징, 장단점을 비교하여 어떤 상황에 각각의 방식이 더 적합한지 설명하세요.

---
### 에세이 정답

### 1. 자바의 힙(Heap) 메모리 구조와 Garbage Collection의 동작 방식
#### 힙 메모리 구조
자바는 메모리를 \`Heap\`과 \`Stack\`으로 구분합니다. **Heap 메모리**는 JVM이 메모리를 동적으로 할당하며 객체의 생명 주기를 관리하는 공간입니다. 이는 크게 다음 두 영역으로 나뉩니다:
- **Young Generation**: 새로 생성된 객체가 저장되며, \`Eden\`, \`S0(Survivor 0)\`, \`S1(Survivor 1)\` 영역으로 세분화됩니다.
- **Old Generation**: Young Generation에서 오래 살아남은 객체가 이동되는 영역으로, 대부분 장수 객체를 보관합니다.

#### Garbage Collection의 동작 방식
Garbage Collection(이하 GC)은 더 이상 사용하지 않는 객체의 메모리를 회수하는 역할을 합니다. 기본적인 알고리즘은 다음과 같습니다:
1. **Mark-and-Sweep**: 객체 그래프를 탐색해 사용 중인 객체를 표시(mark)하고, 사용되지 않는 객체를 제거합니다.
2. **Stop-the-World**: GC 실행 시 애플리케이션 실행을 중단하여 메모리 정리를 수행합니다.
3. **Generational Collection**:
    - Young Generation에서는 Minor GC가 실행되며, 대부분 단기 객체를 제거합니다.
    - Old Generation에서는 Major/Full GC가 실행되어 장수 객체를 정리합니다.

#### 중요한 이유
Garbage Collection은 적절한 메모리 관리를 통해 **메모리 누수를 방지하고 안정성과 성능을 유지**하도록 돕습니다. GC 없이 메모리 누수가 발생하면 프로그램이 중단(crash)될 수 있습니다.

---

### 2. 데이터베이스 정규화(Normalization)
#### 정규화가 필요한 이유
정규화는 데이터 중복을 줄이고 데이터 무결성을 유지하기 위해 테이블을 체계적으로 설계하는 과정입니다.

#### 각 정규형의 목표
1. **1NF (First Normal Form)**:
    - 모든 필드 값이 원자값(Atomic Value)을 가져야 함.
    - 중복된 레코드가 없어야 함.
2. **2NF (Second Normal Form)**:
    - 1NF를 만족하며, 부분 함수 종속 제거.
    - 기본키에 의존하지 않는 속성 제거.
3. **3NF (Third Normal Form)**:
    - 2NF를 만족하며, 이행적 함수 종속 제거.

#### 정규화의 장단점
- 장점:
    - 데이터 중복 감소.
    - 스토리지 효율성 개선.
    - 데이터 무결성 보장.
- 단점:
    - 복잡한 SQL 실행으로 성능 저하.

#### 비정규화 적용 사례
성능 최적화가 필요한 경우 비정규화를 사용예:
- 조회 속도를 높이기 위해 고객 테이블에 총 주문 금액을 추가.

---

### 3. 네트워크 전송 계층과 주요 프로토콜
#### 전송 계층의 역할
- 데이터 전송의 신뢰성 및 흐름 제어를 담당.
- 주요 프로토콜: TCP와 UDP.

#### TCP와 UDP 비교

| 프로토콜 | 특징                      | 사용 사례                    |
|---------|---------------------------|-----------------------------|
| **TCP** | 신뢰성 있고 연결 지향적   | 파일 전송, 이메일           |
| **UDP** | 속도가 빠르고 비연결 지향 | VoIP, 스트리밍              |

---

### 4. 싱글톤 패턴(Singleton Pattern)
#### 목적
클래스의 인스턴스가 단 한 번만 생성되도록 보장하고 전역적으로 공유하며 사용합니다.

#### 구현 방법
1. **Lazy Initialization** (지연 초기화):
   \`\`\`java
   public class Singleton {
       private static Singleton instance;
       private Singleton() {}
       public static Singleton getInstance() {
           if (instance == null) instance = new Singleton();
           return instance;
       }
   }
   \`\`\`
2. **Thread-Safe Singleton** (멀티스레드 환경):
   \`\`\`java
   public class Singleton {
       private static Singleton instance;
       private Singleton() {}
       public static synchronized Singleton getInstance() {
           if (instance == null) instance = new Singleton();
           return instance;
       }
   }
   \`\`\`
3. **Double-Check Locking**:
   \`\`\`java
   public class Singleton {
       private static volatile Singleton instance;
       private Singleton() {}
       public static Singleton getInstance() {
           if (instance == null) {
               synchronized (Singleton.class) {
                   if (instance == null) instance = new Singleton();
               }
           }
           return instance;
       }
   }
   \`\`\`


### 5. 프로세스와 스레드의 차이점 및 특징
#### 차이점
- **프로세스**: 독립적 메모리 공간을 가지고 실행됨.
- **스레드**: 동일 프로세스 내에서 메모리를 공유하며 실행됨.

#### 멀티 프로세스와 멀티 스레드의 특징
| **특징**              | **멀티 프로세스**                      | **멀티 스레드**               |
|-----------------------|---------------------------------------|------------------------------|
| **메모리 사용**       | 독립 메모리 사용                     | 공유 메모리 사용             |
| **성능**              | 문맥 전환 비용 높음                  | 문맥 전환 비용 낮음          |
| **안전성**            | 한 프로세스 중단 시 다른 프로세스 영향 없음 | 하나의 스레드 오류 시 전체 중단 가능 |

#### 적합한 상황
- **멀티 프로세스**: 대규모 연산 또는 독립 작업(예: 웹 브라우저 탭).
- **멀티 스레드**: 데이터 공유가 잦거나 응답 속도가 중요한 작업(예: 게임, 웹 서버).

---

### 핵심 용어 해설집

- **Generic (자바)**: 다양한 타입의 객체를 다루는 메서드나 컬렉션 클래스에서 컴파일 시 타입 안정성을 제공하기 위한 기능.
- **Garbage Collection (자바)**: 자바에서 더 이상 사용되지 않는 객체의 메모리를 자동으로 해제하는 프로세스.
- **힙 (Heap) (자바)**: 자바에서 객체가 동적으로 할당되는 메모리 영역.
- **스레드 (Thread)**: 프로세스 내에서 실행되는 가장 작은 작업 단위.
- **Spring 동작 방식**: 스프링 컨테이너가 빈(Bean)을 생성하고 관리하며 의존성 주입(DI)을 통해 객체 간의 관계를 설정하는 방식.
- **트랜잭션 (Transaction)**: 데이터베이스에서 하나 이상의 연산을 하나의 논리적인 작업 단위로 묶어 일관성을 유지하는 기능.
- **Join (데이터베이스)**: 두 개 이상의 테이블에서 관련된 데이터를 조합하여 하나의 결과 집합으로 만드는 연산.
- **Index (데이터베이스)**: 데이터베이스 테이블에서 원하는 데이터를 빠르게 찾기 위해 사용하는 자료구조.
- **정규화 (Normalization) (데이터베이스)**: 데이터 중복을 최소화하고 데이터 무결성을 향상시키기 위해 테이블을 분해하는 과정.
- **Redis**: 인메모리 기반의 키-값 데이터 스토어로서, 빠른 데이터 접근 속도를 제공한다.
- **DFS (깊이 우선 탐색)**, **BFS (너비 우선 탐색)**: 각각 깊이 또는 너비 우선으로 그래프를 탐색하는 알고리즘.
- **싱글톤 패턴 (Singleton Pattern)**: 클래스의 인스턴스가 단 하나만 생성되도록 보장하고, 그 인스턴스에 전역적으로 접근할 수 있도록 하는 디자인 패턴.
- **로드 밸런싱 (Load Balancing)**: 서버에 가해지는 트래픽 부하를 여러 서버로 분산하여 성능과 가용성을 높이는 기술.
- **TDD (Test Driven Development)**: 테스트 케이스를 먼저 작성하고, 그 테스트를 통과하는 코드를 작성하는 개발 방법론.
- **컨텍스트 스위칭 (Context Switching)**: 운영체제에서 CPU가 한 프로세스나 스레드에서 다른 프로세스나 스레드로 실행 제어를 전환하는 과정.

---

    `,
    excerpt: 'interview',
    tags: ['interview'],
    author: GLOBAL.NAME,
    coverImage: '/images/memo/interview.png'
};
