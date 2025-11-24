### 상수 클래스를 생성하는 올바른 방법과 주의점
---
    ### 인터페이스로 상수를 정의하는 방식: 안티 패턴
다음과 같이 **인터페이스를 이용해 상수를 정의**하는 코드는 쉽게 찾아볼 수 있습니다.
``` java
public interface Constants {
    String ERROR_MESSAGE = "에러 발생";
    int MAX_LIMIT = 100;
}
```
해당 방식은 편리해 보이지만, 실제로는 여러 문제를 유발할 수 있기 때문에 **안티 패턴**으로 간주됩니다.
#### 인터페이스를 상수 정의에 사용하는 것이 왜 안티 패턴인가?
1. **인터페이스의 목적에 맞지 않음**
    - 인터페이스는 하나의 **타입을 정의**하거나 클래스의 **행동(Behavior)**을 명시하기 위한 용도로 사용됩니다.
    - 상수만 정의하는 **상수 인터페이스(Constant Interface)**는 이러한 역할에서 벗어나며, 의도에 맞지 않는 용도로 인터페이스를 오용하게 됩니다.

2. **이름 공간 오염 및 충돌 가능성**
    - 상수를 정의하는 여러 인터페이스를 한 클래스가 모두 구현(implement)할 경우, 동일한 이름을 가진 상수의 경우 어떤 상수를 참조해야 할지 **모호한 상황**이 발생할 수 있습니다.
    - 이는 코드의 가독성을 저하시킬 뿐만 아니라, 유지보수를 어렵게 만듭니다.

3. **공개 API 노출**
    - 상수 인터페이스를 구현한 클래스는 인터페이스의 상수를 **공개 API**로 노출합니다.
      이는 클래스의 **기능과 무관한 정보가 외부에 노출**되는 문제를 초래합니다.

#### 예시: 상수 인터페이스 사용의 문제점
``` java
public interface ConstantsA {
    String HELLO = "HELLO";
}

public interface ConstantsB {
    String HELLO = "HI";
}

public class MyClass implements ConstantsA, ConstantsB {
    // ConstantsA.HELLO, ConstantsB.HELLO 모호성 문제 발생
    public void printHello() {
        System.out.println(HELLO); // 어떤 상수를 참조하는지 식별 불가
    }
}
```
### 올바른 상수 정의 방식: 상수 클래스 사용
안티 패턴을 피하고 올바르게 상수를 정의하려면 **상수 전용 클래스**를 사용하는 것이 좋습니다. 상수 클래스는 아래와 같은 방식을 따릅니다.
#### 1. **`final` 클래스 선언**
- 클래스에 `final`을 선언하여 확장을 막아 불변성을 유지하며, 설계 의도를 보호합니다.

#### 2. **생성자 `private` 선언**
- 생성자를 `private`으로 선언하여 외부에서 인스턴스화하는 것을 방지합니다. 상수는 인스턴스를 만들지 않아도 사용 가능해야 하기 때문입니다.

#### 3. **`public static final`로 상수 선언**
- 각 상수를 `public static final`로 선언하여 클래스 이름을 통해 값에 접근할 수 있도록 합니다.

#### 상수 클래스 예제
``` java
public final class Constants {

    // 상수 정의
    public static final String ERROR_MESSAGE = "에러가 발생했습니다.";
    public static final int MAX_LIMIT = 100;

    // 인스턴스화 방지
    private Constants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
}
```
- **사용 방식**:
  상수는 클래스 이름(`Constants`)을 통해 접근합니다.
``` java
System.out.println(Constants.ERROR_MESSAGE);
System.out.println(Constants.MAX_LIMIT);
```
### 상수 클래스 사용의 장점
1. **명확한 역할 분리**
    - 상수는 오직 상태를 나타내기 위한 값으로 사용되며, 타입 정의 등과 혼재되지 않습니다.

2. **캡슐화된 네임스페이스 제공**
    - 클래스 이름을 네임스페이스처럼 사용하므로, 중복된 상수 이름 충돌을 방지하고, 개발자가 상수의 출처를 명확히 알 수 있습니다.

3. **불변성 유지**
    - `final` 클래스로 선언된 객체는 불변성을 가지며, 이는 특히 멀티 스레드 환경에서 안정성을 보장합니다.

4. **보안성 증가**
    - 상수를 정의한 클래스가 `final`로 선언되고, 인스턴스화가 금지되므로 해당 클래스를 확장하거나 상속받아 악용할 수 없습니다.

5. **설계 의도 보호**
    - 상수를 통해 코드의 설계 의도를 더욱 명확히 표현할 수 있습니다.
