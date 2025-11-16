# JPA의 상속 관계 매핑

객체지향 프로그래밍과 관계형 데이터베이스 간의 패러다임 차이를 해결하는 JPA의 중요한 기능 중 하나는 상속 관계 매핑입니다. 이 글에서는 JPA에서 객체의 상속 관계를 데이터베이스에 어떻게 매핑하는지 살펴보겠습니다.

## 객체 상속과 데이터베이스

- RDBMS에는 상속 관계가 없지만, 객체에는 상속 관계가 있습니다.
- RDBMS의 슈퍼타입-서브타입 모델링 기법이 객체의 상속과 유사합니다.
- 상속 관계 매핑은 객체의 상속 구조와 DB의 슈퍼타입-서브타입 관계를 매핑하는 것입니다.
- 공통적인 속성은 상위(슈퍼타입)에, 구체적인 데이터는 서브타입에 위치합니다.

## 슈퍼타입-서브타입 논리 모델을 물리 모델로 구현하는 방법

JPA에서는 슈퍼타입-서브타입 관계를 구현하기 위한 세 가지 전략을 제공합니다:

### 1. 조인 전략 (JOINED)

각 엔티티를 별도의 테이블로 만들고, 자식 테이블이 부모 테이블의 기본 키를 외래 키로 참조하는 방식입니다.

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "DTYPE")
public abstract class Item {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private int price;
    // ...
}

@Entity
@DiscriminatorValue("A")
public class Album extends Item {
    private String artist;
    // ...
}

@Entity
@DiscriminatorValue("M")
public class Movie extends Item {
    private String director;
    private String actor;
    // ...
}
```

### 2. 단일 테이블 전략 (SINGLE_TABLE)

한 테이블에 모든 컬럼을 넣고, 구분 컬럼(DTYPE)으로 어떤 자식 엔티티인지 구분하는 방식입니다.

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "DTYPE")
public abstract class Item {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private int price;
    // ...
}

@Entity
@DiscriminatorValue("A")
public class Album extends Item {
    private String artist;
    // ...
}

@Entity
@DiscriminatorValue("M")
public class Movie extends Item {
    private String director;
    private String actor;
    // ...
}
```

### 3. 구현 클래스마다 테이블 전략 (TABLE_PER_CLASS)

공통 속성을 각 테이블마다 중복해서 가지는 방식입니다.

```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Item {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private int price;
    // ...
}

@Entity
public class Album extends Item {
    private String artist;
    // ...
}

@Entity
public class Movie extends Item {
    private String director;
    private String actor;
    // ...
}
```

## 주요 어노테이션

### 부모 클래스에서 사용하는 어노테이션

- `@Inheritance(strategy = ...)`: 상속 매핑 전략 지정
    - `InheritanceType.JOINED`: 조인 전략
    - `InheritanceType.SINGLE_TABLE`: 단일 테이블 전략
    - `InheritanceType.TABLE_PER_CLASS`: 구현 클래스마다 테이블 전략

- `@DiscriminatorColumn`: 부모 테이블에 자식 엔티티를 구분하는 컬럼 생성
    - 기본값은 `DTYPE`이라는 컬럼명
    - 단일 테이블 전략에서는 이 어노테이션이 없어도 DTYPE 컬럼이 필수로 생성됨

### 자식 클래스에서 사용하는 어노테이션

- `@DiscriminatorValue("값")`: DTYPE 컬럼에 저장될 값 지정
    - 이 어노테이션이 없으면 기본값으로 엔티티 이름이 사용됨

## 상속 매핑 전략별 장단점

### 조인 전략

**장점**
1. 테이블이 정규화됨
2. 외래 키 참조 무결성 제약조건 활용 가능
3. 저장공간을 효율적으로 사용

**단점**
1. 조회 시 조인이 필요해 성능이 저하될 수 있음
2. 조회 쿼리가 복잡함
3. 데이터 저장 시 INSERT 쿼리가 2번 호출됨

### 단일 테이블 전략

**장점**
1. 조인이 필요 없어 조회 성능이 빠름
2. 조회 쿼리가 단순함

**단점**
1. 자식 엔티티가 매핑한 컬럼은 모두 NULL을 허용해야 함
2. 테이블이 커질 수 있어 상황에 따라 오히려 성능이 저하될 수 있음

### 구현 클래스마다 테이블 전략 (사용 비권장)

**장점**
1. 서브 타입을 명확하게 구분해 처리할 때 효과적
2. NOT NULL 제약조건 사용 가능

**단점**
1. 여러 자식 테이블을 함께 조회할 때 성능이 매우 느림 (UNION 쿼리 사용)
2. 자식 테이블을 통합해서 쿼리하기 어려움

## @MappedSuperclass

공통 매핑 정보가 필요할 때 상속 관계 매핑이 아닌 공통 속성만 상속받아 사용하고 싶을 때 활용합니다.

- 엔티티가 아니므로 테이블과 매핑되지 않음
- `em.find()`로 조회하거나 연관 관계의 대상이 될 수 없음
- 단순히 공통 매핑 정보를 상속받는 역할
- 추상 클래스로 만드는 것을 권장

```java
@MappedSuperclass
public abstract class BaseEntity {
    private String createdBy;
    private LocalDateTime createdDate;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
    
    // getter, setter...
}

@Entity
public class Member extends BaseEntity {
    @Id @GeneratedValue
    private Long id;
    private String name;
    // ...
}
```

## 실무 전략 선택

일반적으로 JPA에서는 조인 전략과 단일 테이블 전략 중에서 선택합니다:

- **조인 전략**: 테이블이 정규화되고 무결성 제약조건을 활용할 수 있어, 객체 지향적 설계와 정밀한 데이터 관리가 필요한 경우 적합
- **단일 테이블 전략**: 간단하고 성능이 중요한 경우, 특히 조회 성능이 중요하거나 테이블 수를 최소화하고 싶을 때 적합
- **구현 클래스마다 테이블 전략**: 실무에서는 사용을 권장하지 않음

JPA 초기 설계 시에는 대부분 조인 전략을 선택하고, 성능 문제가 발생하면 단일 테이블 전략으로 전환하는 것이 일반적인 접근법입니다.

---

JPA의 상속 관계 매핑은 객체지향 프로그래밍의 상속 개념을 관계형 데이터베이스와 효과적으로 연결해주는 중요한 기능입니다. 각 전략의 장단점을 이해하고 프로젝트의 요구사항에 맞는 전략을 선택하는 것이 중요합니다.