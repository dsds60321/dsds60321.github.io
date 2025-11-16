## 1. 엔티티 매핑 기본
JPA를 사용할 때 가장 먼저 접하게 되는 것은 엔티티와 테이블 간의 매핑입니다. 이 과정을 제대로 이해하는 것이 JPA 학습의 첫 단계입니다.
### @Entity
\`\`\` java
@Entity
public class Member {
@Id
private Long id;
// ...
}
\`\`\`
- **기능**: \`@Entity\`가 붙은 클래스를 JPA가 관리함
- **필수 요소**: 모든 JPA 엔티티에 반드시 필요

#### 주의사항
1. **기본 생성자 필수** (파라미터가 없는 public 또는 protected 생성자)
    - JPA 스펙상 규정되어 있으며, 리플렉션(reflection) 같은 동적 작업에 필요

2. **사용 불가능한 클래스 타입**
    - final 클래스, enum, interface, inner 클래스는 엔티티로 매핑 불가능

3. **필드 제약사항**
    - 저장할 필드에 final 사용 불가

### @Table
엔티티와 매핑할 테이블 지정
\`\`\` java
@Entity
@Table(name = "MEMBER_TB")
public class Member {
// ...
}
\`\`\`
| 속성 | 기능 | 기본값 |
| --- | --- | --- |
| name | 매핑할 테이블 이름 | 엔티티 이름 사용 |
| catalog | 데이터베이스 카탈로그 매핑 | - |
| schema | 데이터베이스 스키마 매핑 | - |
| uniqueConstraints | DDL 생성 시 유니크 제약조건 생성 | - |
## 2. 데이터베이스 스키마 자동생성
JPA는 엔티티 객체를 기반으로 테이블을 자동 생성하는 기능을 제공합니다.
\`\`\` properties
# application.properties 또는 application.yml
spring.jpa.hibernate.ddl-auto=update
\`\`\`
### 옵션 종류와 특성

| 옵션 | 설명 |
| --- | --- |
| create | 기존 테이블 drop 후 새로운 테이블 생성 |
| create-drop | create와 동일하지만 종료 시점에 테이블 drop |
| update | 변경분만 반영 (운영 DB에 절대 사용 금지) |
| validate | 엔티티와 테이블 매핑이 정상적인지만 확인 |
| none | 자동 생성 기능 사용하지 않음 |
### 환경별 권장 설정
- **개발 초기**: \`create\` 또는 \`update\`
- **테스트 서버**: \`update\` 또는 \`validate\`
- **스테이징/운영 서버**: \`validate\` 또는 \`none\`


> ⚠️ **주의**: 운영 환경에서는 \`create\`, \`create-drop\`, \`update\` 절대 사용 금지
>

## 3. 필드와 컬럼 매핑
### 기본 매핑 어노테이션

| 어노테이션 | 설명 |
| --- | --- |
| @Column | 컬럼 매핑 |
| @Temporal | 날짜 타입 매핑 |
| @Enumerated | enum 타입 매핑 |
| @Lob | BLOB, CLOB 매핑 |
| @Transient | 특정 필드를 DB에 매핑하지 않음 (코드로 관리하거나 계산용) |
### @Column 상세 속성
\`\`\` java
@Column(name = "username", length = 100, nullable = false)
private String name;
\`\`\`
| 속성 | 설명 | 기본값 |
| --- | --- | --- |
| name | 테이블의 컬럼 이름 | 필드명 |
| insertable, updateable | insert, update 가능 여부 | true |
| nullable (DDL) | null 제약조건 | true |
| unique (DDL) | 유니크 제약조건 | - |
| columnDefinition | 컬럼 정보 직접 지정 (ex: varchar(100) default 'EMPTY') | - |
| length | 문자 길이 제약(String 타입만 가능) | 255 |
| precision, scale (DDL) | BigDecimal 타입에서 사용 (precision: 소수점 포함 전체 자리수, scale: 소수점 자리수) | precision=19, scale=2 |
### @Enumerated 사용 시 주의사항
\`\`\` java
@Enumerated(EnumType.STRING) // 반드시 STRING 사용
private RoleType roleType;
\`\`\`
**중요**: \`EnumType.ORDINAL\`은 절대 사용하지 말 것!
- \`ORDINAL\`은 enum 순서를 숫자로 저장 (0, 1, 2...)
- enum 값이 추가되거나 순서가 변경되면 데이터 무결성 훼손
- 항상 \`EnumType.STRING\` 사용하여 enum 이름을 문자열로 저장

### @Temporal
Java 8 이후 \`LocalDate\`, \`LocalDateTime\`을 사용할 경우 \`@Temporal\` 생략 가능
# JPA 기초 - 기본 키(PK) 매핑 전략
## 1. 기본 키 매핑 방법
JPA에서 기본 키를 매핑하는 방법은 크게 직접 할당과 자동 생성이 있습니다.
### 직접 할당
애플리케이션에서 직접 식별자 값을 할당합니다.
\`\`\` java
@Entity
public class Member {
@Id
private String id;

    // ...
}
\`\`\`
### 자동 생성 (@GeneratedValue)
JPA가 자동으로 식별자 값을 생성합니다.
\`\`\` java
@Entity
public class Member {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

    // ...
}
\`\`\`
## 2. 주요 식별자 생성 전략
### IDENTITY 전략
\`\`\` java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
\`\`\`
- **특징**: 기본 키 생성을 데이터베이스에 위임 (MySQL의 AUTO_INCREMENT)
- **동작 방식**:
    - DB에 데이터를 삽입해야만 ID 값을 알 수 있음
    - JPA는 \`persist()\` 호출 시점에 즉시 INSERT SQL 실행

- **장점**: 간단하고 직관적
- **단점**: 대량 INSERT 시 한 번에 모아서 처리하기 어려움

### SEQUENCE 전략
\`\`\` java
@Entity
@SequenceGenerator(
name = "member_seq_generator",
sequenceName = "member_seq",
initialValue = 1,
allocationSize = 50
)
public class Member {
@Id
@GeneratedValue(
strategy = GenerationType.SEQUENCE,
generator = "member_seq_generator"
)
private Long id;
// ...
}
\`\`\`
- **특징**: 데이터베이스 시퀀스 객체 사용 (주로 Oracle, PostgreSQL)
- **동작 방식**:
    - \`persist()\` 시점에 시퀀스에서 값을 가져옴
    - 실제 INSERT는 트랜잭션 커밋 시점에 실행

- **최적화**: \`allocationSize\`로 성능 최적화
    - 미리 시퀀스 값을 여러 개 가져와서 메모리에서 할당
    - DB 접근 횟수를 줄여 성능 향상

### TABLE 전략
\`\`\` java
@Entity
@TableGenerator(
name = "MEMBER_SEQ_GENERATOR",
table = "MY_SEQUENCES",
pkColumnValue = "MEMBER_SEQ",
allocationSize = 1
)
public class Member {
@Id
@GeneratedValue(
strategy = GenerationType.TABLE,
generator = "MEMBER_SEQ_GENERATOR"
)
private Long id;
// ...
}
\`\`\`
- **특징**: 키 생성 전용 테이블을 사용하여 시퀀스를 흉내냄
- **장점**: 모든 데이터베이스에서 사용 가능
- **단점**: 성능이 상대적으로 좋지 않음 (추가적인 테이블 접근 필요)

### AUTO 전략
\`\`\` java
@Id
@GeneratedValue(strategy = GenerationType.AUTO)
private Long id;
\`\`\`
- 데이터베이스 방언에 따라 위 세 가지 전략 중 하나를 자동 선택

## 3. 식별자 전략 권장 사항
좋은 기본 키의 조건:
1. null이 아님
2. 유일함
3. 변하지 않음

**권장하는 식별자 전략**:
- \`Long\` 타입 + 대체 키(시퀀스나 UUID) + 자동 생성
- 자연 키(비즈니스적 의미가 있는 값)보다 대체 키(의미 없는 임의의 값) 사용
- 권장 순서: IDENTITY > SEQUENCE > TABLE

# JPA 기초 - 연관관계 매핑의 이해
## 1. 연관관계 매핑의 기본 개념
객체와 테이블의 연관관계에는 근본적인 차이가 있습니다.
### 객체 vs 테이블 연관관계의 차이
- **테이블 연관관계**: 외래 키(FK)로 양방향 조인 가능
- **객체 연관관계**: 참조(레퍼런스)를 통해 단방향으로만 접근 가능

### 관계형 모델과 객체지향 모델의 차이
\`\`\` java
// 객체지향적이지 않은 방식 (관계형 DB에 맞춘 방식)
@Entity
public class Member {
@Id
private Long id;

    // FK를 그대로 필드로 가짐
    @Column(name = "TEAM_ID")
    private Long teamId;
}

// 객체지향적인 방식
@Entity
public class Member {
@Id
private Long id;

    // 객체 참조를 통한 연관관계 매핑
    @ManyToOne
    @JoinColumn(name = "TEAM_ID")
    private Team team;
}
\`\`\`
## 2. 단방향 연관관계
### 다대일(N:1) 단방향 연관관계
가장 많이 사용하는 연관관계입니다.
\`\`\` java
@Entity
public class Member {
@Id
@GeneratedValue
private Long id;

    private String name;
    
    @ManyToOne
    @JoinColumn(name = "TEAM_ID")
    private Team team;
    
    // Getter, Setter
}

@Entity
public class Team {
@Id
@GeneratedValue
private Long id;

    private String name;
    
    // Getter, Setter
}
\`\`\`
- \`@ManyToOne\`: 다대일 관계 매핑
- \`@JoinColumn\`: 외래 키 매핑 (name 속성은 매핑할 외래 키 컬럼명)

## 3. 양방향 연관관계와 연관관계의 주인
### 양방향 연관관계
\`\`\` java
@Entity
public class Member {
@Id
@GeneratedValue
private Long id;

    private String name;
    
    @ManyToOne
    @JoinColumn(name = "TEAM_ID")
    private Team team;
    
    // 연관관계 편의 메서드
    public void changeTeam(Team team) {
        this.team = team;
        team.getMembers().add(this);
    }
    
    // Getter, Setter
}

@Entity
public class Team {
@Id
@GeneratedValue
private Long id;

    private String name;
    
    @OneToMany(mappedBy = "team")
    private List<Member> members = new ArrayList<>();
    
    // Getter, Setter
}
\`\`\`
### 연관관계의 주인(Owner)
객체 양방향 연관관계는 사실 두 개의 단방향 연관관계로 이루어져 있습니다. 이때 테이블에 영향을 주는 FK를 관리할 주체를 "연관관계의 주인"이라고 합니다.
- **연관관계의 주인**
    - 외래 키를 관리(등록, 수정, 삭제)
    - mappedBy 속성을 사용하지 않음

- **주인이 아닌 쪽**
    - 읽기만 가능
    - mappedBy 속성으로 주인 지정

### 연관관계의 주인 결정 기준
- 외래 키가 있는 엔티티를 연관관계의 주인으로 설정
- 다대일 관계에서는 항상 '다(N)' 쪽이 연관관계의 주인
- \`@ManyToOne\`은 항상 연관관계의 주인 (mappedBy 속성이 없음)


> 💡 **핵심 개념**: \`mappedBy\`는 "~에 의해 매핑됨"이라는 뜻으로, 주인이 아닌 쪽에서 주인을 지정하는 속성입니다.
>

## 4. 양방향 연관관계 사용 시 주의사항
### 양방향 매핑의 일반적인 실수
1. **연관관계의 주인에 값을 입력하지 않는 경우**
   \`\`\` java
   // 잘못된 코드 (외래 키 값이 저장되지 않음)
   Team team = new Team();
   team.setName("TeamA");
   team.getMembers().add(member);
   em.persist(team);

// 올바른 코드
Team team = new Team();
team.setName("TeamA");
em.persist(team);

Member member = new Member();
member.setName("member1");
member.setTeam(team);       // 연관관계의 주인에 값 설정
em.persist(member);
\`\`\`
1. **객체의 양쪽에 값을 모두 입력하지 않는 경우**
    - 영속성 컨텍스트의 1차 캐시에 의해 발생하는 문제 (DB와 객체 상태 불일치)

### 권장 사항
1. **양쪽에 값을 모두 설정하자**
   \`\`\` java
   member.setTeam(team);
   team.getMembers().add(member);
   \`\`\`
1. **연관관계 편의 메서드 활용**
   \`\`\` java
   // Member 클래스 내부
   public void changeTeam(Team team) {
   this.team = team;
   team.getMembers().add(this);
   }

// 또는 Team 클래스 내부
public void addMember(Member member) {
members.add(member);
member.setTeam(this);
}
\`\`\`
1. **무한 루프 주의**
    - \`toString()\`, \`lombok\`, \`JSON 라이브러리\` 사용 시 발생 가능
    - 컨트롤러에서 엔티티를 직접 반환하지 말고 DTO로 변환해서 반환

2. **설계 관점의 조언**
    - 처음에는 단방향 매핑으로 시작
    - 양방향은 필요한 경우에만 추가 (조회 기능이 필요할 때)

# JPA 기초 - 다양한 연관관계 매핑
## 1. 다대일(N:1) 관계
가장 기본적이고 많이 사용하는 연관관계입니다.
### 단방향
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @ManyToOne
    @JoinColumn(name = "TEAM_ID")
    private Team team;
}

@Entity
public class Team {
@Id @GeneratedValue
private Long id;
private String name;
}
\`\`\`
### 양방향
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @ManyToOne
    @JoinColumn(name = "TEAM_ID")
    private Team team;
}

@Entity
public class Team {
@Id @GeneratedValue
private Long id;
private String name;

    @OneToMany(mappedBy = "team")
    private List<Member> members = new ArrayList<>();
}
\`\`\`
- 외래 키가 있는 쪽(Member)이 연관관계의 주인
- 반대쪽(Team)은 mappedBy 속성으로 주인 지정

## 2. 일대다(1:N) 관계
### 단방향
\`\`\` java
@Entity
public class Team {
@Id @GeneratedValue
private Long id;

    @OneToMany
    @JoinColumn(name = "TEAM_ID") // Member 테이블의 TEAM_ID (FK)
    private List<Member> members = new ArrayList<>();
}

@Entity
public class Member {
@Id @GeneratedValue
private Long id;
private String name;
}
\`\`\`
- 1쪽이 연관관계의 주인 (일반적이지 않음)
- 단점:
    - 외래 키가 다른 테이블에 있음
    - 추가적인 UPDATE SQL 실행
    - 관리가 어려움

- 권장하지 않는 모델링 방식

### 일대다 양방향 (비공식)
\`\`\` java
@Entity
public class Team {
@Id @GeneratedValue
private Long id;

    @OneToMany
    @JoinColumn(name = "TEAM_ID")
    private List<Member> members = new ArrayList<>();
}

@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    // 읽기 전용 필드
    @ManyToOne
    @JoinColumn(name = "TEAM_ID", insertable = false, updatable = false)
    private Team team;
}
\`\`\`
- 공식적인 방법은 아님
- 다대일 양방향을 사용하는 것이 권장됨

## 3. 일대일(1:1) 관계
### 주 테이블에 외래 키 단방향
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @OneToOne
    @JoinColumn(name = "LOCKER_ID")
    private Locker locker;
}

@Entity
public class Locker {
@Id @GeneratedValue
private Long id;
private String name;
}
\`\`\`
### 주 테이블에 외래 키 양방향
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @OneToOne
    @JoinColumn(name = "LOCKER_ID")
    private Locker locker;
}

@Entity
public class Locker {
@Id @GeneratedValue
private Long id;
private String name;

    @OneToOne(mappedBy = "locker")
    private Member member;
}
\`\`\`
### 대상 테이블에 외래 키 단방향
- JPA에서 직접 지원하지 않음

### 대상 테이블에 외래 키 양방향
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @OneToOne(mappedBy = "member")
    private Locker locker;
}

@Entity
public class Locker {
@Id @GeneratedValue
private Long id;

    @OneToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member;
}
\`\`\`
### 일대일 관계 정리
**주 테이블에 외래 키**
- 장점: 주 테이블만 조회해도 대상 테이블 데이터 확인 가능
- 단점: 외래 키에 null 허용

**대상 테이블에 외래 키**
- 장점: 일대일→일대다로 관계 변경 시 테이블 구조 유지
- 단점: 프록시 기능 한계로 항상 즉시 로딩됨

## 4. 다대다(N:M) 관계
실무에서는 사용하지 말아야 할 매핑입니다.
### @ManyToMany
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @ManyToMany
    @JoinTable(name = "MEMBER_PRODUCT")
    private List<Product> products = new ArrayList<>();
}

@Entity
public class Product {
@Id @GeneratedValue
private Long id;
private String name;
}
\`\`\`
- 실무에서 사용하기에 한계가 많음
- 연결 테이블에 추가 데이터를 넣을 수 없음
- 엔티티 테이블 불일치

### 다대다 한계 극복
연결 테이블을 엔티티로 승격시키는 방법을 사용합니다.
\`\`\` java
@Entity
public class Member {
@Id @GeneratedValue
private Long id;

    @OneToMany(mappedBy = "member")
    private List<MemberProduct> memberProducts = new ArrayList<>();
}

@Entity
public class Product {
@Id @GeneratedValue
private Long id;
private String name;

    @OneToMany(mappedBy = "product")
    private List<MemberProduct> memberProducts = new ArrayList<>();
}

@Entity
public class MemberProduct {
@Id @GeneratedValue
private Long id;

    @ManyToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member;
    
    @ManyToOne
    @JoinColumn(name = "PRODUCT_ID")
    private Product product;
    
    // 추가 데이터
    private int orderAmount;
    private LocalDateTime orderDate;
}
\`\`\`
- 연결 테이블을 엔티티로 만들어 관리
- 복합 키 대신 새로운 기본 키 사용 권장
- 실무에서는 항상 이런 방식으로 다대다 관계를 풀어서 사용해야 함

## 연관관계 매핑 실무 가이드
1. **단방향 매핑으로 시작하기**
    - 비즈니스 로직에 필요할 때만 양방향 추가

2. **다대일(N:1) 관계를 기본으로 사용**
    - 대부분의 연관관계는 다대일로 설계 가능

3. **양방향 관계에서 무한 루프 주의**
    - toString(), JSON 변환 시 문제 발생

4. **연관관계 편의 메서드 활용**
    - 양쪽 객체에 값을 모두 설정하는 메서드 구현

5. **컨트롤러에서는 엔티티 대신 DTO 반환**
    - 양방향 매핑된 엔티티는 JSON 직렬화 시 문제 발생

   `