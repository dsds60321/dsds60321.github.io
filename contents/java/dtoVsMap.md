# **DTO vs Map**

현 회사에서는 `Map` 기반으로 데이터를 주고받는 방식으로 서비스를 개발하고 있습니다. 반면, 개인 프로젝트나 포트폴리오 작업에서는 주로 DTO(Data Transfer Object)를 활용하여 Bean 기반 데이터 구조로 개발하고 있습니다. 두 방식을 사용해보며 느낀 **Map과 DTO의 장단점**에 대해 정리합니다.

## **Map 기반 개발 경험**

현 회사에서는 DTO 구조가 아닌 `Map`을 사용하여 데이터를 주고받습니다. 처음에는 Map 사용에 대해 부정적이었으나, 사용하면서 **Map만의 장점**도 충분히 있다는 것을 알게 되었습니다.

### **Map 기반 개발의 장점**

1.  **별도의 클래스를 정의하지 않아도 된다**
    -   Map은 키-값 형태로 데이터를 처리하기 때문에, 추가적인 DTO나 VO 클래스를 작성할 필요 없이 빠르게 데이터를 처리할 수 있습니다.
2.  **데이터의 유연성**
    -   구조가 고정되지 않으므로 요청과 응답 데이터에 추가 필드를 쉽게 처리할 수 있어, 초기 개발이 간편하고 빠르게 완료됩니다.

하지만 프로젝트가 커지고 복잡성이 증가하면서 다음과 같은 한계점들이 드러났습니다.

### **Map 기반 개발의 문제점**

1.  **유지보수의 어려움**
    -   데이터 키 값의 오타나 잘못된 데이터 타입으로 인해 오류가 발생해도 이를 **런타임에서만 발견**할 수 있었습니다.
    -   이러한 문제를 방지하는 로직을 따로 구현해야만 했고, 데이터 검증 코드를 곳곳에서 중복 작성하느라 비효율적인 개발이 이루어졌습니다.
2.  **불명확한 데이터 구조**
    -   Map 기반으로는 데이터의 구조와 타입을 명확히 알 수 없습니다.
    -   로직 흐름 중간에 Map에 데이터가 추가되거나 삭제되기도 하며, 결과적으로 **데이터 확인을 위해 로깅에 의존**하거나 직접 값을 확인하는 식의 작업이 필요했습니다.
3.  **문서화 및 확장성 부족**
    -   Map 기반의 데이터 구조는 변경이 발생할 경우 명확히 표현하기 어렵습니다.
    -   API의 수정 사항을 직관적으로 설명하기 힘들어, 문서화 및 변경 관련 작업에 추가적인 노력이 필요합니다.
4.  **불변성을 보장하지 못한다**
    -   Map은 기본적으로 데이터의 변경, 삭제를 허용하기 때문에 데이터 무결성을 보장할 수 없습니다.
    -   중간 단계의 데이터 변조나 의도치 않은 변경을 방지하려면 별도의 불변성을 보장하는 코드를 작성해야 했습니다.

## **DTO 기반 개발**

### **DTO 기반 장점**

1.  **명확한 데이터 구조 제공**
    -   DTO 클래스는 명확한 필드와 타입 정의를 제공하므로, 데이터 구조를 한눈에 파악할 수 있습니다.
    -   요청(Request) 모델과 응답(Response) 모델을 구분함으로써, 코드가 구조적이며 가독성이 높아졌습니다.
2.  **타입 안전성과 컴파일 타임 검증 지원**
    -   DTO는 정적 타입 기반으로 정의되기 때문에 잘못된 데이터 타입이나 필드 누락 같은 문제를 **컴파일 단계에서 미리 검출**할 수 있습니다.
    -   이는 런타임에서 오류를 발견하는 일을 줄이고, 디버깅 시간을 단축시켰습니다.
3.  **Swagger를 통한 자동화된 문서화**
    -   DTO는 Swagger와 같은 문서화 도구와도 자연스럽게 연계됩니다. 이를 통해 요청/응답 데이터의 구조와 필드 정보가 명확히 문서화되어 사용 가능합니다.
4.  **데이터 검증의 간편화: @Valid 활용**
    -   컨트롤러에서 `@Valid`를 사용하면 수동 검증 로직 없이 요청 데이터를 간단히 검증하고, 필요한 경우 상세한 에러 메시지를 반환할 수 있습니다.

## **DTO에서 @Valid를 활용한 데이터 검증**

아래는 DTO를 설계하고 `@Valid`를 활용해 데이터 검증을 처리한 간단한 예제입니다.

### **DTO 예제**

```
@Data  
public class UserDTO {  

    @NotNull  
    @Size(min = 3, max = 50)  
    private String username;  

    @Email  
    private String email;  

    @NotNull  
    @Min(18)  
    private Integer age;  
}
```

### **컨트롤러에서 검증 로직 처리**

컨트롤러에서는 `@Valid`를 사용해 DTO로 들어온 요청 데이터를 검증할 수 있습니다:

```
@PostMapping("/users")  
public ResponseEntity<String> createUser(@RequestBody @Valid UserDTO userDTO) {  
    // 요청 데이터는 이미 검증된 상태
    return ResponseEntity.ok("User created successfully");  
}
```

### **`@Valid` 활용 시 주요 장점**

1.  **필드 검증 에러 메시지 자동 생성**
    -   데이터를 검증하는 과정에서 발생한 문제를 필드 단위로 상세하게 메시지로 반환합니다.
    -   이를 통해 클라이언트가 정확히 어떤 요청을 잘못 보냈는지 알 수 있습니다.
2.  **검증 로직의 단순화**
    -   기존 Map 기반 검증에서는 중복되는 검증 로직을 매번 작성해야 했지만, DTO에 Bean Validation을 설정하면서 이러한 중복을 줄일 수 있었습니다.
3.  **Swagger와의 연동 개선**
    -   Validation 어노테이션으로 정의한 유효성 검증 조건이 Swagger 문서에도 반영되므로, 클라이언트가 API 요청 스펙을 명확히 이해할 수 있습니다.

## **MapStruct 활용을 통한 매핑 자동화**

DTO를 사용하며 불편했던 점 중 하나는 **Entity 변환 또는 응답 Payload를 작성할 때 매번 수작업으로 정의해야 하는 반복적인 작업**이었습니다. 특히, 프로젝트가 커질수록 데이터 구조의 변환 로직이 많아지면서 **코드 중복**과 **유지보수의 복잡성**이 부담으로 작용했습니다.  
하지만 **MapStruct**를 도입하면서, DTO와 Entity 간 데이터 변환을 자동화하고 `Map`을 사용할 때와 비슷한 편리함을 제공받을 수 있었습니다. 데이터 변환(Mapping)을 간소화하여 효율적이고 명확한 코드를 작성할 수 있게 되었고, 이를 통해 DTO 활용의 불편함을 줄일 수 있었습니다.  
MapStruct는 **반복적인 매핑 코드 작성 대신 인터페이스와 어노테이션 기반의 자동화된 매핑**을 제공해 생산성을 높였습니다.

### **MapStruct 도입의 주요 효과**

1.  **반복 작업 제거**
    -   `@Mapper` 어노테이션과 인터페이스를 정의하면, Entity ↔ DTO 간의 필드 맵핑 작업이 자동으로 생성됩니다.
    -   수동으로 작성해야 했던 변환 코드를 거의 작성하지 않아도 되므로 반복 작업에서 해방되었습니다.
2.  **유지보수 효율성**
    -   모든 매핑 로직이 MapStruct와 관련된 설정으로 집중되므로, 수정이나 확장 작업이 간편해집니다.
    -   데이터 구조가 변경되더라도 매핑 코드만 업데이트하면 되므로 유지보수가 훨씬 용이합니다.
3.  **코드 품질 향상**
    -   수동으로 작성했던 변환 코드가 사라지고, 전체 코드가 간결해지면서 비즈니스 로직 작성에만 집중할 수 있었습니다.
    -   이는 클린 코드 구현과 함께 가독성과 안정성을 높이는 데 크게 기여했습니다.

### **MapStruct 활용 예제**

아래는 간단한 MapStruct 구성 예제입니다.

#### 1\. **Entity와 DTO 클래스**

```
@Data
public class UserEntity {
    private Long id;
    private String username;
    private String email;
    private Integer age;
}

@Data
public class UserDTO {
    private String username;
    private String email;
    private Integer age;
}
```

#### 2\. **Mapper 인터페이스 정의**

```
@Mapper(componentModel = "iocDi")
public interface UserMapper {

    UserDTO toDTO(UserEntity userEntity);

    UserEntity toEntity(UserDTO userDTO);
}
```

#### 3\. **사용 예시**

컨트롤러나 서비스 레벨에서 쉽게 사용할 수 있습니다:

```
@RestController
public class UserController {

    private final UserMapper userMapper;

    public UserController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @GetMapping("/user")
    public ResponseEntity<UserDTO> getUser() {
        UserEntity userEntity = userService.getUserFromDB();
        UserDTO userDTO = userMapper.toDTO(userEntity);
        return ResponseEntity.ok(userDTO);
    }
}
```

위와 같이 단순한 설정만으로도 Entity ↔ DTO 간 변환 작업을 자동화하여 코드 품질과 유지보수성을 동시에 높일 수 있었습니다.

## **결론**

-   `Map` 기반 개발은 초기 단계에서 빠르고 유연한 개발이 가능했지만, 시간이 지남에 따라 **유지보수성과 데이터 구조의 불명확성**으로 인해 프로젝트가 커질수록 불편함이 많아졌습니다. 반면, DTO는 초기에는 Map에 비해 다소 작성 시간이 소요되지만, **데이터 구조를 명확히 정의**할 수 있고, **검증 로직이 간단해져 유지보수가 편리해지는 장점**이 있었습니다. 특히, **MapStruct**를 활용함으로써 DTO의 단점을 보완하고 생산성을 크게 향상시킬 수 있었습니다. 이러한 이유로, 개인적으로는 **DTO 기반 개발 방식**을 더욱 선호하게 되었습니다.