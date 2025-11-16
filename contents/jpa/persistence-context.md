## 영속성 컨텍스트란?
영속성 컨텍스트(Persistence Context)는 하이버네이트의 가장 핵심적인 개념 중 하나로, 엔티티를 영구 저장하는 환경을 의미합니다. 이는 물리적인 공간이 아닌 논리적인 개념으로, 엔티티 매니저(EntityManager)를 통해 접근합니다.
``` java
EntityManager entityManager = entityManagerFactory.createEntityManager();
// 이제 entityManager를 통해 영속성 컨텍스트에 접근할 수 있습니다
```
영속성 컨텍스트와 엔티티 매니저는 1:1 관계를 가지며, 엔티티 매니저를 통해 영속성 컨텍스트의 기능을 사용할 수 있습니다.

## 엔티티의 생명주기
하이버네이트에서 관리되는 엔티티는 네 가지 상태를 가집니다:

### 1. 비영속 상태(New/Transient)
객체가 생성되었지만 아직 영속성 컨텍스트에 저장되지 않은 상태입니다.
``` java
Member member = new Member();  // 객체 생성
member.setId(1L);              // 식별자 값 설정
member.setName("홍길동");       // 비영속 상태
```

### 2. 영속 상태(Managed)
객체가 영속성 컨텍스트에 저장되어 관리되는 상태입니다.
``` java
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();

// 객체를 영속성 컨텍스트에 저장 (영속 상태)
em.persist(member);
```

### 3. 준영속 상태(Detached)
영속성 컨텍스트에 저장되었다가 분리된 상태입니다.
``` java
// 엔티티를 영속성 컨텍스트에서 분리
em.detach(member);
```

### 4. 삭제 상태(Removed)
삭제된 상태로, 실제 데이터베이스에서도 삭제가 예정된 상태입니다.
``` java
// 엔티티 삭제
em.remove(member);
```

## 영속성 컨텍스트의 핵심 기능

### 1. 1차 캐시
영속성 컨텍스트 내부에는 '1차 캐시'라고 불리는 엔티티 저장소가 있습니다. 엔티티를 조회할 때 먼저 1차 캐시에서 찾고, 없으면 데이터베이스에서 조회합니다.
``` java
// 데이터베이스에서 조회 후 1차 캐시에 저장
Member member1 = em.find(Member.class, "member1");

// 1차 캐시에서 바로 조회 (데이터베이스 조회 없음)
Member member2 = em.find(Member.class, "member1");
```
> **실무적 관점**: 1차 캐시는 트랜잭션 단위로 생존하기 때문에 애플리케이션 전체에서 공유하는 글로벌 캐시가 아닙니다. 따라서 성능상 이점이 크지는 않지만, 같은 트랜잭션 내에서 반복 조회 시 효과적입니다.

### 2. 동일성(Identity) 보장
같은 트랜잭션 내에서 같은 엔티티를 여러 번 조회하면, 항상 같은 엔티티 인스턴스를 반환합니다. 이는 자바 컬렉션과 같은 동작 방식입니다.
``` java
Member member1 = em.find(Member.class, "member1");
Member member2 = em.find(Member.class, "member1");

System.out.println(member1 == member2); // true
```
이 특성은 1차 캐시가 있기 때문에 가능하며, 애플리케이션 레벨에서 **반복 가능한 읽기(Repeatable Read)** 트랜잭션 격리 수준을 제공합니다.

### 3. 쓰기 지연(Transactional Write-Behind)
하이버네이트는 트랜잭션을 커밋하기 전까지 SQL을 실제로 데이터베이스에 전송하지 않고, '쓰기 지연 SQL 저장소'에 모아둡니다.
``` java
EntityManager em = emf.createEntityManager();
EntityTransaction transaction = em.getTransaction();
transaction.begin(); // 트랜잭션 시작

// 1. 엔티티 영속화 (이 시점에는 SQL 실행 안 함)
em.persist(memberA);
em.persist(memberB);
// 여기까지 INSERT SQL을 데이터베이스에 보내지 않고 쓰기 지연 SQL 저장소에 보관

// 2. 트랜잭션 커밋 시점에 저장된 SQL 실행
transaction.commit();
```
> **성능 최적화 팁**: 하이버네이트는 쓰기 지연을 활용하여 JDBC 배치(batch) 기능을 구현합니다. 여러 SQL을 모아서 한 번에 데이터베이스로 전송할 수 있어 네트워크 통신 비용을 줄일 수 있습니다.
> `<!-- hibernate.cfg.xml 또는 persistence.xml --> <property name="hibernate.jdbc.batch_size" value="50"/> `

### 4. 변경 감지(Dirty Checking)
영속 상태의 엔티티의 값을 변경할 경우, 하이버네이트는 트랜잭션 커밋 시점에 이를 감지하고 자동으로 UPDATE SQL을 생성해 실행합니다.
``` java
// 영속 엔티티 조회
Member member = em.find(Member.class, "member1");

// 엔티티 데이터 변경 (이 시점에서는 아직 UPDATE SQL 실행 안 함)
member.setName("변경된이름");
member.setAge(30);

// 트랜잭션 커밋 시점에 변경 감지(dirty checking) 동작, UPDATE SQL 실행
transaction.commit();
```
**변경 감지 내부 동작 원리**:
1. 트랜잭션 커밋 시 `flush()` 호출
2. 엔티티와 스냅샷(최초 조회 시점의 상태) 비교
3. 변경 사항 발견 시 UPDATE SQL 생성
4. 쓰기 지연 SQL 저장소에 저장
5. 데이터베이스에 SQL 전송
6. 트랜잭션 커밋

> **성능 관련 주의점**: 하이버네이트는 엔티티의 모든 필드를 업데이트하는 것이 기본 전략입니다. 이유는:
> 1. 수정 쿼리가 항상 같아 파싱된 쿼리를 재사용할 수 있음
> 2. 데이터베이스에 동일 쿼리를 보내면 데이터베이스도 이전에 파싱된 쿼리를 재사용
>
> 필요한 경우 `@DynamicUpdate` 어노테이션을 사용하여 변경된 필드만 업데이트하도록 설정할 수 있습니다.

### 5. 지연 로딩(Lazy Loading)
연관된 엔티티를 실제로 사용하는 시점에 로딩하는 기능입니다.
``` java
// Member 엔티티만 로드하고 Team은 로드하지 않음
Member member = em.find(Member.class, "member1");

// 실제로 team 속성에 접근하는 시점에 Team 엔티티 로드
Team team = member.getTeam();
String teamName = team.getName(); // 실제 SQL 쿼리 발생 시점
```

## 준영속 상태와 영속성 컨텍스트 관리

### 준영속 상태로 만드는 방법
1. **특정 엔티티만 준영속 상태로 전환**
``` java
em.detach(entity); // 특정 엔티티만 영속성 컨텍스트에서 분리
```

2. **영속성 컨텍스트 초기화**
``` java
em.clear(); // 영속성 컨텍스트를 완전히 초기화
```

3. **영속성 컨텍스트 종료**
``` java
em.close(); // 영속성 컨텍스트 종료
```

### 준영속 상태의 특징
1. **영속성 컨텍스트의 기능을 사용할 수 없음**
    - 1차 캐시, 쓰기 지연, 변경 감지, 지연 로딩 등의 기능을 사용할 수 없습니다.

2. **식별자 값은 유지됨**
    - 준영속 상태로 변환해도 식별자 값은 유지됩니다.

3. **다시 영속 상태로 변환 가능**
``` java
// 준영속 엔티티를 다시 영속 상태로 변환
Member mergedMember = em.merge(detachedMember);
```

## 영속성 컨텍스트의 flush
flush는 영속성 컨텍스트의 변경 내용을 데이터베이스에 동기화하는 작업입니다.

### 호출 방법
1. **직접 호출**
``` java
em.flush(); // 강제로 플러시 호출
```

2. **트랜잭션 커밋 시 자동 호출**
``` java
transaction.commit(); // 내부적으로 flush() 호출
```

3. **JPQL 쿼리 실행 시 자동 호출**
``` java
// JPQL 실행 전 자동으로 flush 호출
List<Member> members = em.createQuery("select m from Member m", Member.class)
                         .getResultList();
```

### flush 모드 설정
``` java
// 커밋할 때만 플러시 (성능 최적화)
em.setFlushMode(FlushModeType.COMMIT);

// JPQL 쿼리 실행 시에도 플러시 (기본값)
em.setFlushMode(FlushModeType.AUTO);
```

## 실무 활용 팁

### 1. 트랜잭션 범위 최적화
영속성 컨텍스트는 메모리를 사용하므로, 너무 오래 유지하면 메모리 사용량이 증가할 수 있습니다. 적절한 범위로 트랜잭션을 관리하세요.
``` java
// 효율적인 트랜잭션 관리
public void someBusinessLogic() {
    EntityManager em = emf.createEntityManager();
    EntityTransaction tx = em.getTransaction();
    
    try {
        tx.begin();
        
        // 비즈니스 로직 수행
        
        tx.commit();
    } catch (Exception e) {
        tx.rollback();
        throw e;
    } finally {
        em.close(); // 영속성 컨텍스트 종료
    }
}
```

### 2. 벌크 연산 후 영속성 컨텍스트 초기화
벌크 연산(대량 UPDATE, DELETE)은 영속성 컨텍스트를 무시하고 직접 데이터베이스에 쿼리를 실행합니다. 이로 인해 영속성 컨텍스트와 데이터베이스 간 불일치가 발생할 수 있습니다.
``` java
// 벌크 연산 수행
int updatedCount = em.createQuery("update Member m set m.age = m.age + 1")
                     .executeUpdate();

// 영속성 컨텍스트 초기화
em.clear();

// 이후 조회는 데이터베이스에서 새로 가져옴
Member refreshedMember = em.find(Member.class, "member1");
```

### 3. 영속성 컨텍스트 단위 테스트
테스트 코드에서는 각 테스트 메서드마다 새로운 영속성 컨텍스트를 사용하도록 설정하는 것이 좋습니다.
``` java
@Test
public void testEntityPersistence() {
    EntityManager em = emf.createEntityManager();
    EntityTransaction tx = em.getTransaction();
    
    try {
        tx.begin();
        
        // 테스트 로직
        
        tx.commit();
    } catch (Exception e) {
        tx.rollback();
        throw e;
    } finally {
        em.close(); // 테스트 종료 시 영속성 컨텍스트 종료
    }
}
```