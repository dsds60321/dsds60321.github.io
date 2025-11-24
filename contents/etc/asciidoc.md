# 아스키독스 설정
# Asciidoctor를 활용한 문서 작성 가이드
기술 블로그, 프로젝트 문서 또는 개발 관련 자료를 체계적으로 작성하려면 강력한 문서 포맷이 필요합니다. Asciidoctor 간단한 문법과 강력한 기능으로 개발자들에게 효과적인 문서 작성 도구를 제공합니다. 이번 글에서는 Gradle 프로젝트를 통해 Asciidoctor를 설정하고 사용하는 방법을 상세하게 다뤄보겠습니다.
## 1. Asciidoctor란?
Asciidoctor 포맷을 사용하여 HTML, PDF 등 다양한 출력 포맷의 문서를 생성하는 오픈소스 도구입니다. 마크다운(Markdown)보다 더 많은 기능을 제공하며 다음과 같은 주요 장점을 갖습니다.
### 주요 장점
- **다양한 출력 지원**: HTML, PDF, ePub 등 문서를 여러 형식으로 출력 가능
- **문서 구조화 기능**: 목차, 섹션 번호, 아이콘 등을 효율적으로 추가
- **개발 친화적 문법**: 코드 블록 하이라이팅 및 다채로운 포맷 제공

## 2. 프로젝트 구성 및 Gradle 설정
프로젝트에 Asciidoctor를 도입하려면 Gradle 플러그인과 태스크(Task) 구성을 추가해야 합니다. 아래는 Gradle 설정 코드입니다.
### Gradle 설정
파일에 Asciidoctor 플러그인과 태스크를 추가합니다: `build.gradle`
``` groovy
import org.asciidoctor.gradle.jvm.AsciidoctorTask

plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.4'
    id 'io.spring.dependency-management' version '1.1.7'
    id 'org.asciidoctor.jvm.convert' version '4.0.0'
}

group = 'dev.gunho'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-r2dbc'
    implementation 'org.mariadb:r2dbc-mariadb'
    implementation 'org.springframework.boot:spring-boot-starter-webflux'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'io.projectreactor:reactor-test'
    testImplementation 'org.mockito:mockito-core'
}

tasks.named('asciidoctor', AsciidoctorTask) {
    sourceDir = file('src/docs/asciidoc') // AsciiDoc 문서 경로 설정
    outputDir = file("{buildDir}/docs") // HTML 출력 경로 설정

    doLast {
        println("HTML 문서 생성 완료! 확인 경로: {outputDir}")
    }
}
```
## 3. AsciiDoc 문서 작성
AsciiDoc 파일은 `.adoc` 확장자를 사용합니다. 아래는 AsciiDoc 예제입니다. `index.adoc`
### 예제 문서: `index.adoc`
``` asciidoc
= My First AsciiDoc Document
Gunho Gang <gunho@example.com>
v1.0, 2025-01-01
:toc: left
:icons: font
:sectnums:
:source-highlighter: rouge

== Welcome to AsciiDoc

AsciiDoc 예제 입니다.

=== 주요 특징
* 마크다운(Markdown)보다 강력한 기능 제공
* HTML, PDF 등 다양한 출력 형식 지원
* 코드 블럭 하이라이팅 지원

[source,java]
----
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, AsciiDoc!");
    }
}
----

== 다음 단계

1. AsciiDoc 문서를 작성합니다.
```
위 문서를 통해 다음과 같은 결과물을 얻을 수 있습니다:
- **목차 자동 생성**
- **섹션 번호 자동 추가**
- **코드 블록 하이라이팅**

## 4. 커스텀 스타일 적용
AsciiDoc 문서를 스타일링하려면 별도의 CSS 파일을 추가로 작성해야 합니다. 아래는 간단한 CSS 스타일 예제입니다.
### 커스텀 CSS 예제: `asciidoc-style.css`
``` css
/* 코드 블록 스타일 */
pre {
    background-color: #000;
    color: #00ff00;
    padding: 10px;
}

/* 목차 영역 스타일 */
#toc {
    background-color: #eaeaea;
    border: 1px solid #ccc;
    padding: 10px;
}
```
에서 커스텀 CSS를 사용하도록 설정하려면 `attributes`를 활용하면 됩니다. `index.adoc`
``` asciidoc
:stylesheet: css/custom-style.css
:stylesdir: .
```
## 5. HTML 문서 변환
AsciiDoc 파일을 HTML로 변환하려면 아래 명령어를 실행하세요:
``` bash
./gradlew clean asciidoctor
```
성공적으로 실행되면 HTML 파일은 `build/docs/index.html`에 생성됩니다. 브라우저를 통해 해당 파일을 열어 결과물을 확인하세요.
### 출력 결과
- **코드 블록 하이라이팅**: 지정한 언어별로 코드에 색상이 적용됩니다.
- **목차 자동 생성**: 설정에 따라 문서의 좌측 또는 상단에 표시됩니다.
- **커스텀 스타일 적용**: CSS를 통해 원하는 디자인으로 문서를 꾸밀 수 있습니다.

## 6. 추가 팁 및 권장 사항
1. **코드 하이라이팅**: Asciidoctor 다양한 코드 하이라이팅 옵션을 제공합니다. `rouge`, `highlight.js` 등을 선택해 보세요.
2. **목차 위치 변경**: `:toc` 속성을 통해 목차를 `left`, `right`, `top` 위치에 배치할 수 있습니다.
3. **다양한 출력 형식 실험**: HTML뿐만 아니라 PDF 등 다양한 형식으로 문서를 생성할 수 있습니다.

[Asciidoctor 공식 문서](https://asciidoctor.org/)를 참고하세요.