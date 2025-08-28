

#  Spring Boot 기반 To-Do List API 서버

##  프로젝트 소개

Spring Boot를 활용하여 **Back-End 기본기를 다지기 위해** 진행한 To-Do List API 서버 프로젝트입니다.

단순한 CRUD 기능 구현을 넘어, 계층형 아키텍처(Layered Architecture)에 대한 이해, **계층별 테스트 코드 작성**의 중요성, 그리고 **안정적인 API 설계**를 위한 DTO의 역할을 깊이 있게 학습하는 것을 목표로 했습니다. 이 프로젝트를 통해 Spring Boot 생태계에 대한 이해를 높이고, 실무에서 마주할 수 있는 문제들을 미리 고민하고 해결하는 경험을 쌓았습니다.

<br>

##  주요 기능

*   **할 일 (To-Do) CRUD**
    *   `POST` : 새로운 할 일 생성
    *   `GET` : 모든 할 일 목록 조회
    *   `PUT` : 특정 할 일의 내용 수정
    *   `PATCH` : 특정 할 일의 완료/미완료 상태 토글
    *   `DELETE` : 특정 할 일 삭제
*   **상태별 목록 조회**
    *   `GET` : 미완료된 할 일만 최신순으로 조회
    *   `GET` : 완료된 할 일만 최신순으로 조회

<br>

## ️ 기술 스택

| 구분 | 기술 | 사용 목적 |
| :--- | :--- | :--- |
| **Backend** | `Java 17` | 안정성을 고려하여 선택 |
| | `Spring Boot 3.3.2` | DI, AOP 등 Spring의 핵심 기능을 통해 객체 지향적이고 효율적인 서버 구축 |
| | `Spring Data JPA` | 객체 지향적인 데이터베이스 접근 및 관리를 위해 사용 (ORM) |
| | `Spring Web` | RESTful API 서버 구축 |
| **Database**| `MySQL` | 관계형 데이터 관리에 널리 사용되는 RDBMS |
| **Build** | `Gradle` | 유연한 빌드 구성과 빠른 빌드 속도를 위해 선택 |
| **Testing** | `JUnit 5` | Java 표준 테스트 프레임워크 |
| | `Mockito` | Service 계층 단위 테스트 시 Repository 의존성을 격리하기 위해 사용 |
| | `Spring Boot Test` | `@WebMvcTest`, `@DataJpaTest` 등을 활용한 계층별 테스트 환경 구축 |
| **Etc** | `Lombok` | 어노테이션 기반으로 Boilerplate 코드(Getter, Setter 등)를 자동 생성하여 코드 가독성 향상 |

<br>

##  아키텍처

이 프로젝트는 역할과 책임에 따라 계층을 명확하게 분리하는 **계층형 아키텍처(Layered Architecture)**를 적용하여 설계했습니다. 이를 통해 코드의 유지보수성과 확장성을 높이고자 했습니다.

```
Client (HTML/CSS/JS)
       ↕
API Request/Response
       ↕
[ Presentation Layer ]
  TodoController (API Endpoints)
       ↕
[ Business Layer ]
  TodoService (비즈니스 로직, 트랜잭션 관리)
       ↕
[ Data Access Layer ]
  TodoRepository (데이터베이스 연동)
       ↕
[ Database ]
  MySQL
```

<br>

##  API 명세

**Base URL**: `http://localhost:8080/api/todos`

| Method | URL | 설명 | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | 모든 할 일 조회 | - | `List<TodoResponseDto>` |
| `POST` | `/` | 새 할 일 생성 | `TodoRequestDto` | `TodoResponseDto` |
| `PUT` | `/{id}` | 할 일 내용 수정 | `TodoRequestDto` | `TodoResponseDto` |
| `PATCH` | `/{id}/toggle` | 완료 상태 토글 | - | `TodoResponseDto` |
| `DELETE` | `/{id}` | 할 일 삭제 | - | - |
| `GET` | `/incomplete` | 미완료 할 일 조회 | - | `List<TodoResponseDto>` |
| `GET` | `/completed` | 완료된 할 일 조회 | - | `List<TodoResponseDto>` |

<br>

##  실행 방법

### 1. 프로젝트 클론
```bash
git clone https://github.com/cho-yooseok/todo-list.git
```

### 2. application.properties 설정
`src/main/resources/application.properties` 파일에서 본인의 MySQL 환경에 맞게 `datasource` 정보를 수정합니다.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/{YOUR_DATABASE_NAME}
spring.datasource.username={YOUR_USERNAME}
spring.datasource.password={YOUR_PASSWORD}
```

### 3. 애플리케이션 실행
프로젝트 루트 디렉토리에서 아래 명령어를 실행합니다.

```bash
./gradlew bootRun
```

<br>

##  테스트 실행 방법
프로젝트 루트 디렉토리에서 아래 명령어를 통해 모든 테스트 코드를 실행할 수 있습니다.

```bash
./gradlew test
```
- 테스트 실행 후 리포트는 `build/reports/tests/test/index.html` 에서 확인할 수 있습니다.

<br>

---

##  트러블 슈팅 및 학습 과정

### 1. DTO의 필요성을 깨닫고 적용하며 배운 점

#### 겪었던 문제
초기 개발 단계에서는 Controller가 클라이언트로부터 **`Todo` Entity**를 직접 받고, 응답 또한 Entity 객체를 그대로 반환했습니다. 하지만 이 방식은 두 가지 큰 문제점을 가지고 있었습니다.
*   **의도치 않은 데이터 노출**: `id`, `createdAt` 등 클라이언트가 수정할 필요가 없는 데이터까지 요청 Body에 포함될 수 있었고, 응답 시에도 Entity의 모든 필드가 외부에 노출되었습니다.
*   **View와 Model의 강한 결합**: 향후 `Todo` Entity의 필드명이 변경되거나 필드가 추가될 경우, API 스펙 자체가 변경되어 API를 사용하는 클라이언트 코드에 직접적인 영향을 미치는 **강한 결합(Tight Coupling)** 상태였습니다.

#### 해결 과정
이 문제를 해결하기 위해 **데이터 전송 객체(DTO, Data Transfer Object)** 개념을 도입했습니다.
*   **`TodoRequestDto`**: 클라이언트로부터 **받아야 할 데이터(`title`)만을 명시적**으로 정의했습니다. `@Valid`와 `@NotBlank` 어노테이션을 사용하여 Controller 단에서 유효성 검사를 수행하도록 했습니다.
*   **`TodoResponseDto`**: 클라이언트에게 **보여줘야 할 데이터만을 선택적**으로 담아 응답하도록 설계했습니다. Entity를 DTO로 변환하는 로직을 추가하여 필요한 데이터만 가공해서 전달했습니다.

#### 배우고 느낀 점
DTO를 적용함으로써 **View(API 스펙)와 Model(Entity)의 역할을 명확히 분리**할 수 있었습니다. 이를 통해 내부 데이터베이스 구조가 변경되더라도 API 스펙은 안정적으로 유지할 수 있게 되었고, 이는 **유지보수성과 확장성이 높은 애플리케이션 설계의 첫걸음**이라는 것을 깨달았습니다. 또한, 필요한 데이터만 주고받음으로써 API의 명확성을 높이고 보안을 강화하는 효과도 얻을 수 있었습니다.

---

### 2. "어떻게 테스트해야 잘하는 걸까?" - 계층별 테스트 전략 수립

#### 겪었던 문제
처음에는 `@SpringBootTest` 어노테이션 하나만 사용하여 모든 컴포넌트를 메모리에 올리는 **통합 테스트** 방식으로만 접근했습니다. 하지만 이 방식은 다음과 같은 단점이 있었습니다.
*   **느린 테스트 속도**: 테스트 하나를 실행하기 위해 전체 애플리케이션 컨텍스트를 로딩해야 하므로 매우 느렸습니다.
*   **실패 원인 파악의 어려움**: 테스트가 실패했을 때, 그것이 Controller의 문제인지, Service의 비즈니스 로직 문제인지, 아니면 Repository의 DB 연동 문제인지 한 번에 파악하기 어려웠습니다.

#### 해결 과정
효율적이고 안정적인 테스트를 위해 **계층별로 테스트 전략을 분리**했습니다.
*   **Controller Layer (`@WebMvcTest`)**: 웹 계층과 관련된 `Controller`의 동작만을 테스트하는 데 집중했습니다. `TodoService`는 실제 객체 대신 `@MockBean`을 사용하여 **가짜(Mock) 객체로 대체**했습니다. 이를 통해 Service의 로직과 관계없이 Controller가 올바른 요청을 받고, 기대하는 응답(상태 코드, JSON Body)을 반환하는지를 검증할 수 있었습니다.
*   **Service Layer (Mockito)**: `@ExtendWith(MockitoExtension.class)`를 사용하여 순수 Java 단위 테스트 환경을 만들었습니다. `TodoRepository`를 `@Mock`으로 만들어, **특정 상황을 가정한(stubbing) 후** Service의 비즈니스 로직이 의도대로 동작하는지만을 정밀하게 테스트했습니다.
*   **Repository Layer (`@DataJpaTest`)**: JPA 관련 설정만 로딩하여 데이터베이스와의 연동을 테스트했습니다. 실제 MySQL 대신 **내장 메모리 데이터베이스(H2)**를 사용하여 외부 환경에 영향을 받지 않는 빠르고 독립적인 테스트가 가능하도록 구성했습니다.

#### 배우고 느낀 점
"좋은 테스트"란 단순히 기능의 동작을 확인하는 것을 넘어, **"무엇을 테스트할 것인가"를 명확히 정의하고 범위를 좁히는 것**에서 시작한다는 것을 배웠습니다. 계층별 테스트를 통해 각 컴포넌트의 책임과 역할을 더 명확하게 이해하게 되었고, **빠르고 안정적인 테스트 코드가 곧 애플리케이션 전체의 안정성을 높이는 중요한 자산**이라는 점을 체감할 수 있었습니다.