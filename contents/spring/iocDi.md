# Spring IOC와 DI
## AI Assistant
### **1. 제어의 역전(IoC, Inversion of Control)이란?**
"제어의 역전"이란 객체의 제어권을 사용자(개발자)로부터 스프링 IoC 컨테이너로 넘기는 것을 의미합니다.
#### **IoC 이전의 방식 (제어권이 개발자에게 있는 경우)**
전통적으로 객체는 스스로 필요한 의존성을 생성하거나 관리해야 했습니다. 하나의 클래스에서 또 다른 클래스를 생성하거나 사용하며 강하게 결합된 구조를 만들었습니다. 예를 들어:
``` java
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService() {
        this.orderRepository = new OrderRepository(); // 의존성 직접 생성
    }

    public void createOrder() {
        orderRepository.save("Order");
    }
}
```
위 코드를 보면 `OrderService`는 `OrderRepository` 객체를 직접 생성하고 있습니다. **OrderService가 OrderRepository 객체를 "제어"하고 있고**, 이로 인해 다음과 같은 문제점이 발생할 수 있습니다:
1. **강한 결합 (Tight Coupling):**
    - `OrderService`는 `OrderRepository` 구현에 의존합니다. 만약 `OrderRepository`를 다른 구현체로 교체하려면 `OrderService` 코드를 수정해야 합니다.

2. **테스트 어려움:**
    - `OrderRepository`를 목(Mock) 객체로 대체해 단위 테스트를 수행하기 어렵습니다.

3. **확장성 부족:**
    - 새로운 기능을 추가하거나 다른 객체를 의존하게 만들기 어렵습니다.

#### **IoC 적용 후 (스프링 컨테이너가 제어)**
IoC를 도입하면, 객체의 생성 및 관리를 개발자가 직접 처리하지 않고, **스프링 IoC 컨테이너**로 위임합니다. 변경된 코드 예:
``` java
@Component
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        // 의존성은 스프링 컨테이너에서 주입됨
        this.orderRepository = orderRepository;
    }

    public void createOrder() {
        orderRepository.save("Order");
    }
}
```
위 코드에서 **OrderRepository**는 더 이상 `new` 키워드로 생성되지 않습니다. 대신 스프링 컨테이너가 객체를 생성하고 주입합니다. 즉, **OrderService가 자신의 의존성을 제어했던 권한을 스프링 컨테이너에 넘겼기 때문에 "제어의 역전"이 발생한 것**입니다.
### **2. 의존성 주입(DI, Dependency Injection)이란?**
**DI**는 IoC의 구현 방식 중 하나로, **객체 사이의 의존성을 외부(스프링 컨테이너)에서 주입하는** 것을 뜻합니다.
IoC란 큰 관점에서 제어를 역전시키는 원칙이라면, DI는 이를 실현하기 위한 구체적인 메커니즘이라고 할 수 있습니다.
#### **DI의 구현 방식과 동작 원리**
스프링에서 DI는 주로 3가지 방식으로 동작합니다:
1. **생성자 주입(Constructor Injection)**
2. **Setter 주입(Setter Injection)**
3. **필드 주입(Field Injection)**

#### **1) 생성자 주입 (Constructor Injection)**
의존성을 객체 생성 시점에 생성자를 통해 주입받는 방식입니다.
``` java
@Component
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
}
```
- 스프링 컨테이너가 `OrderRepository`를 생성한 뒤, 생성자를 통해 `OrderService`에 전달합니다.
- 생성자 주입은 모든 의존성이 필수적일 때 가장 권장되는 방식이며, 객체 불변성을 유지할 수 있습니다.

#### **2) 세터 주입 (Setter Injection)**
Setter 메서드를 통해 의존성을 주입받는 방식입니다.
``` java
@Component
public class OrderService {
    private OrderRepository orderRepository;

    @Autowired
    public void setOrderRepository(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
}
```
- 세터 주입은 선택적으로 의존성을 주입할 때 사용됩니다.
- 의존성이 객체 생성 이후에 변경 가능하다는 단점이 있습니다.

#### **3) 필드 주입 (Field Injection)**
필드에 직접 `@Autowired`를 사용하여 의존성을 주입받는 방식입니다.
``` java
@Component
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
}
```
- 가장 간결한 방식으로 코드가 줄어들지만, 테스트 시 목(Mock) 객체를 주입하는 데 어려움이 있어 권장되지 않습니다.
- Spring Boot에서는 많이 사용되지만, 디자인 측면에서 생성자 주입을 선호합니다.

### **3. IoC와 DI가 동작하는 원리**
#### **1) 스프링 IoC 컨테이너 역할**
스프링 IoC 컨테이너는 **ApplicationContext**를 사용해 애플리케이션에 필요한 객체(빈, Bean)를 생성하고 관리합니다. 개발자가 직접 객체를 생성하거나 의존성을 연결하지 않아도 모든 작업을 컨테이너가 처리합니다.
**동작 과정 개요:**
1. **빈 구성파일(XML, Java Config)** 또는 `@Component` 주석으로 빈을 등록합니다.
2. 스프링은 객체를 생성할 때 필요한 의존성을 확인합니다.
3. 의존성을 생성 후, 원하는 객체에 주입합니다.
4. 컨테이너가 생성한 객체를 애플리케이션에 사용 가능하도록 관리합니다.

#### **2) 스프링에서 DI 실행 흐름**
1. 스프링 **컨테이너**는 애플리케이션에 정의된 모든 빈을 스캔합니다.
2. 필요 시(@Autowired) 다른 빈을 참조하거나 연결하여 의존성을 생성합니다.
3. 이러한 과정을 통해 객체 사이의 관계를 자동으로 설정합니다.

### **4. IoC와 DI의 실제 이점**
1. **유지보수성 향상**
    - 객체 간 의존성이 코드 안에 명시되지 않아 변경에 유연합니다.

2. **테스트 가능성 증가**
    - DI를 통해 Mock 객체를 주입하여 쉽게 단위 테스트를 작성할 수 있습니다.

3. **확장성과 유연성**
    - 의존성을 정의한 곳(Configuration)만 수정하면 객체 간 연결 및 구성 변경이 가능합니다.

### **5. IoC와 DI를 활용한 실제 예**
#### **예제: 서비스, 리포지토리 구성**
``` java
@Repository
public class OrderRepository {
    public void save(String order) {
        System.out.println("Order saved: " + order);
    }
}
```

``` java
@Service
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public void createOrder() {
        orderRepository.save("Order");
    }
}
```

``` java
@RestController
public class OrderController {
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/createOrder")
    public String createOrder() {
        orderService.createOrder();
        return "Order Created!";
    }
}
```
위 코드는 컨트롤러 → 서비스 → 리포지토리 계층 간 의존성을 **DI를 통해 관리**합니다. 모든 의존성은 스프링 컨테이너가 주입하며 코드에는 객체 간 연결이 드러나지 않습니다.
### **6. 정리**
- **IoC**란 객체의 생성 및 관리를 개발자가 아닌 스프링 컨테이너가 담당하게 함으로써 일어나는 제어의 역전입니다.
- **DI**는 IoC를 실현하기 위한 구체적인 기술로, 필요한 의존성을 외부에서 주입받아 객체 간의 결합도를 낮춥니다.
- 이를 통해 유지보수성, 확장성, 테스트 가능성이 크게 향상되며 효율적인 애플리케이션 개발이 가능해집니다.

Spring 공식 문서와 같은 [참고 자료](https://spring.io/docs)를 활용해 더 많은 내용을 살펴보세요! 😊
위 글은 IoC와 DI를 기반 개념부터 상세 동작 원리, 이점까지 구체적으로 설명하였습니다. 추가적인 질문이 있다면 편하게 말씀해주세요! 😊


## Me
Spring 공식 홈페이지에서 ioc 와 DI 어떻게 만들어지는데에 대한 내용을 넣어서 더 자세하게 작성해줘

## AI Assistant
아래는 **Spring 공식 홈페이지**의 내용을 참고하여 **IoC(Inversion of Control)**와 **DI(Dependency Injection)**의 개념과 구체적인 동작 방식, Spring이 IoC와 DI를 어떻게 구현하는지에 대해 더욱 자세하게 작성한 기술 블로그 글입니다.
## **Spring IoC와 DI: 원리와 실제 동작 방식**
Spring 프레임워크는 객체를 생성하고, 생성된 객체를 조립하며, 객체 간의 의존성을 관리하는 역할을 하는 **IoC(Inversion of Control)**와 **DI(Dependency Injection)**라는 핵심 원칙을 기반으로 설계되었습니다. 이번 글에서는 Spring 블로그와 공식 문서 내용을 참고해 IoC와 DI가 어떻게 동작하는지 심층적으로 알아봅니다.
### **1. IoC (Inversion of Control): 제어의 역전**
IoC는 객체의 생성과 객체 사이의 의존성 관리를 개발자가 직접 코드 내에서 처리하지 않고, **컨테이너(Inversion of Control Container)**가 관리하도록 위임하는 것을 의미합니다. 즉, 객체의 생명주기, 의존성 등을 스프링이 처리하는 것이 "제어의 역전"입니다.
#### **1.1 제어의 역전이란?**
일반적인 애플리케이션의 전통적인 설계에서는 각 클래스가 스스로 객체를 생성, 초기화하고 필요에 따라 의존성을 연결하는 방식으로 동작했습니다. 하지만 이러한 방식은 **강한 결합(Tight Coupling)**을 초래하며 유지보수나 확장성을 저해할 수 있었습니다.
``` java
public class OrderService {
    private OrderRepository orderRepository;

    public OrderService() {
        this.orderRepository = new OrderRepository(); // 직접 의존성 생성
    }

    public void createOrder() {
        orderRepository.save("Order");
    }
}
```
위 코드에서는 `OrderService`가 `OrderRepository` 객체를 직접 생성하고 관리합니다. 만약 `OrderRepository`의 구현체를 바꿔야 한다면, `OrderService` 코드를 반드시 수정해야 합니다. 이는 유지보수가 어려운 구조를 만듭니다.
#### **1.2 Spring IoC 적용 후의 모습**
스프링에서는 객체 생성 및 의존성 주입의 모든 제어 권한을 IoC 컨테이너가 관리합니다. 개발자는 단순히 컨테이너에 의존성을 명시하면, 컨테이너가 객체를 생성하고 적절히 주입합니다. 위 코드를 Spring IoC 방식으로 재작성하면 다음과 같이 단순해집니다.
``` java
@Component
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository; // DI를 통해 의존성 주입
    }

    public void createOrder() {
        orderRepository.save("Order");
    }
}
```
여기서 객체 생성과 의존성 주입은 **스프링 컨테이너(ApplicationContext)**가 제어하게 됩니다.
### **2. DI (Dependency Injection): 의존성 주입**
DI는 IoC의 구체적인 구현 방식 중 하나로, 객체가 필요로 하는 의존성(다른 객체)을 스프링 컨테이너가 주입하여 관리하도록 합니다. 이를 통해 강한 결합을 해소하고 테스트 가능성과 유연성을 크게 높일 수 있습니다.
#### **2.1 DI의 동작 원리**
Spring에서는 DI를 다음 방식으로 구현할 수 있습니다:
1. **생성자 주입(Constructor Injection)**
2. **Setter 주입(Setter Injection)**
3. **필드 주입(Field Injection)**

결국 어느 방식이든 기본 원리는 **스프링 컨테이너가 적절한 객체를 생성해서 주입**한다는 점입니다. 의존성 주입 전체 흐름에 대해 조금 더 자세히 살펴보겠습니다.
### **3. Spring IoC 및 DI 동작 방식**
#### **3.1 IoC 컨테이너(ApplicationContext)**
Spring IoC는 애플리케이션에서 사용되는 모든 객체(빈, Bean)를 생성, 관리하고, 객체 간의 의존성을 설정합니다. 여기서 **IoC 컨테이너**는 스프링에서 객체를 관리하는 핵심 컴포넌트로, 이를 "스프링 컨테이너"라고 부릅니다. `ApplicationContext`가 가장 일반적으로 사용되는 IoC 컨테이너입니다.
#### **컨테이너의 주요 역할:**
- 객체(bean) 등록 및 생명주기 관리
- 객체 간의 관계(의존성) 주입 관리
- 객체의 초기화/소멸 관련 콜백 처리

다음은 컨테이너가 의존성 주입을 처리하는 구체적인 방법입니다:
#### **3.2 IoC 컨테이너 초기화 과정**
Spring 공식 문서에 설명된 IoC 컨테이너의 초기화 과정은 다음과 같습니다:
1. **빈 정의 읽기**:
    - 컨테이너는 애플리케이션 설정 파일(`XML`, `Java Config`, 혹은 `@ComponentScan`)을 통해 빈 정의를 읽어옵니다.
    - 예를 들어, `@Component`와 같은 어노테이션을 사용해 정의된 클래스를 검색한 뒤 관리 대상으로 설정합니다.
``` java
   @Component
   public class OrderRepository {
       public void save(String order) {
           System.out.println("Order saved: " + order);
       }
   }
```
1. **빈 생성**:
    - 스프링 컨테이너는 빈 정의를 기반으로 객체를 생성합니다.
    - 생성 시 각 객체에 필요한 의존성도 탐색합니다.

2. **의존성 주입**:
    - 스프링 컨테이너는 생성된 빈에 대해 의존성을 주입합니다.

3. **빈 초기화**:
    - `@PostConstruct`, `InitializingBean` 등의 초기화 루틴을 수행합니다.

4. **컨테이너 시작**:
    - 준비된 모든 빈을 컨테이너의 제어 하에 실행하고, 의존성을 관리하게 됩니다.

#### **3.3 DI 방식: 생성자 주입의 동작 원리**
Spring에서 가장 권장하는 DI 방식은 **생성자 주입**입니다. 다음은 생성자 주입 방식이 구체적으로 어떻게 동작하는지 보여줍니다.
1. **빈 정의를 로드할 때 `OrderService`를 분석**:
    - 스프링 컨테이너는 `OrderService` 클래스가 의존성으로 `OrderRepository`를 필요로 한다는 것을 파악합니다.

2. **적절한 객체 생성**:
    - `OrderRepository` 빈을 먼저 생성합니다.

3. **의존성 주입**:
    - 생성자를 통해 `OrderService`에 `OrderRepository` 객체를 전달합니다.
``` java
@Component
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) { // 주입
        this.orderRepository = orderRepository;
    }
}
```
#### **스프링 공식 문서의 구성 예제**
Spring 공식 문서에서는 `ApplicationContext`와 `@Configuration` 기반의 코드 구성을 많이 강조합니다. 다음과 같은 구성을 참고할 수 있습니다:
1. **Java Config로 Spring 컨테이너 설정**:
``` java
@Configuration
public class AppConfig {

    @Bean
    public OrderRepository orderRepository() {
        return new OrderRepository();
    }

    @Bean
    public OrderService orderService() {
        return new OrderService(orderRepository());
    }
}
```
1. **컨테이너 초기화 및 실행**:
``` java
public static void main(String[] args) {
    ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

    OrderService orderService = context.getBean(OrderService.class);
    orderService.createOrder();
}
```
### **4. IoC와 DI로 얻는 이점**
1. **유지보수성**:
    - 의존성이 코드 내부에 강하게 결합되지 않아, 객체 간 연결을 쉽게 변경할 수 있습니다.

2. **확장성**:
    - `@Qualifier`와 같은 기능을 통해 다양한 구현체를 플러그인처럼 끼울 수 있습니다.

[공식 문서 보기](https://docs.spring.io/spring-framework/reference/index.html)