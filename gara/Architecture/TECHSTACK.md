---
type: architecture
artifact_kind: tech-stack
status: ACTIVE
version: 2
tier: T0
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-05-07"
supersedes: "v1"
---

# TECHSTACK -- Garage

> T0 source-of-truth cho tech stack Garage, reverse-engineered tu local code/config.
> File nay chi ghi nhan evidence hien co trong repo; cac diem chua du bang chung duoc danh dau `TBD`.

---

## 1. Overview

Garage la multi-service landscape gom:

- Spring Boot services cho domain/platform/worker.
- Node.js TypeScript GraphQL gateways cho API aggregation.
- Python FastAPI service cho OCR dang ky xe.
- PostgreSQL + JPA cho persistence trong Spring services.
- Flyway cho migration trong cac service co `db/migration` hoac dependency Flyway.
- Kafka cho event-driven integration trong nhieu Spring services.
- Temporal cho mot so domain/workflow services.
- Redis/Redisson cho cache, lock, hoac runtime state trong mot so online services.
- OpenTelemetry/Prometheus evidence trong GraphQL gateway va Spring common starters.

Important baseline note:

Garage backend is **not on one uniform Java/Spring baseline**:

- Most Spring services use **Java 21 + Spring Boot 3.5.0**.

This mixed baseline is an architecture gap and should be resolved or explicitly approved by ADR.

## 2. Evidence Sources

Phase 2 evidence was extracted from local files only:

| Evidence type | Files scanned |
|---|---|
| Java/Spring build | `*/build.gradle`, `*/settings.gradle`, `*/gradle.properties` |
| Java/Spring config | `*/src/main/resources/application.yml`, `application.yaml`, `application.properties` |
| GraphQL build/runtime | `agg-garage-graph/package.json`, `agg-sso-graph/package.json`, Dockerfiles, compose files |
| OCR build/runtime | `ocr-car-registration/requirements.txt`, `pyproject.toml`, `.python-version`, Dockerfile, compose file, `.env.example` |
| Infra/observability | Dockerfiles, `docker-compose.yml`, `otel-collector-config.yaml`, app configs |

## 3. Languages & Runtimes

| Layer / boundary group | Language | Version evidence | Runtime/build | Projects |
|---|---|---|---|---|
| Spring services baseline | Java | `JavaLanguageVersion.of(21)` | Gradle | `gf-accounting`, `gf-customer`, `gf-marketing`, `gf-erp-agent`, `gf-erp-mdm`, `gf-hrms`, `gf-inventory`, `gf-inventory-worker`, `gf-notification`, `gf-purchase`, `gf-sales`, `gf-shipment`, `gf-system`, `gf-worker` |
| GraphQL gateways | TypeScript / Node.js | Docker `node:22.16-alpine`; TypeScript `^5.8.3`; no `.nvmrc`/`.node-version` found | npm | `agg-garage-graph`, `agg-sso-graph` |
| OCR service | Python | `.python-version` `3.11`; Docker `python:3.11-slim`; `requires-python >=3.11` | pip/uv/setuptools | `ocr-car-registration` |

## 4. Spring Backend Stack

### 4.1 Frameworks & Libraries

| Purpose | Choice | Version evidence | Used in |
|---|---|---|---|
| Web framework | Spring Boot Web | Spring Boot plugin `3.5.0` depending on service | Spring services |
| ORM / persistence | Spring Data JPA + Hibernate | `spring-boot-starter-data-jpa`; `hibernate-types-60:2.21.1` in selected services | Most Spring services |
| Validation | Spring Boot validation / Jakarta validation | `spring-boot-starter-validation` | Most Spring services |
| Database migration | Flyway | `flyway-core`, `flyway-database-postgresql`; migration files in selected services | Many Spring services |
| API documentation | SpringDoc OpenAPI | `springdoc-openapi-starter-webmvc-ui:2.8.9` for Boot 3.x services; | Multiple Spring services |
| Security | OAuth2 resource server / JWT / common security starter | `spring-boot-starter-oauth2-resource-server`, `spring-security-starter`, `jjwt`, `nimbus-jose-jwt` | Multiple Spring services |
| Kafka integration | Spring Kafka | `org.springframework.kafka:spring-kafka` and Kafka bootstrap config | Most Spring services except confirmed non-Kafka services |
| Temporal workflows | Temporal Java SDK / Spring Boot starter | `io.temporal:temporal-spring-boot-starter:1.31.0`; `temporal:` config | `gf-sales`, `gf-customer`, `gf-marketing`, `gf-inventory`, `gf-inventory-worker` |
| Redis/cache/lock | Spring Data Redis / Spring Integration Redis / Redisson | `spring-boot-starter-data-redis`, `spring-integration-redis`, `redisson-spring-boot-starter:3.27.1` | `gf-accounting`, `gf-customer`, `gf-inventory`, `gf-marketing`, `gf-purchase`, `gf-sales`; `gf-hrms` has config evidence |
| Mapping | MapStruct | `mapstruct:1.5.5.Final` or project property versions | Multiple Spring services |
| Boilerplate | Lombok | `compileOnly lombok`, annotation processors | Spring services |
| Resilience | Spring Retry, Resilience4j | `spring-retry`; `resilience4j-*` in `gf-marketing`, `gf-worker` | Selected services |
| Observability | Actuator, Micrometer Prometheus, Actechx OTLP starter | `spring-boot-starter-actuator`, `micrometer-registry-prometheus`, `spring-otlp-starter:0.0.3-SNAPSHOT` | Multiple services |
| Logging | Actechx logging starter | `spring-logging-starter:0.0.8-SNAPSHOT` | Multiple services |

### 4.2 Java/Spring Service Baseline Matrix

| Service               | Java | Spring Boot | Data/migration | Messaging/workflow/cache | Notable external deps |
|-----------------------|---:|---|---|---|---|
| `gf-accounting`       | 21 | 3.5.0 | PostgreSQL inherited, JPA, Flyway dependency; no migration files observed in Phase 1 | Kafka, Redis/cache, Redis lock | common printing, JWT, OpenAPI 3.0.0 |
| `gf-customer`         | 21 | 3.5.0 | PostgreSQL inherited, JPA, Flyway | Kafka, Temporal 1.31.0, Redis/cache, Redis lock | OPA WASM starter, JWT, OpenAPI 3.0.0 |
| `gf-marketing`        | 21 | 3.5.0 | PostgreSQL inherited, JPA, Flyway | Kafka, Temporal 1.31.0 | OPA WASM starter, JWT, OpenAPI 3.0.0 |
| `gf-erp-agent`        | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka | AWS SNS/SQS, Spring Cloud AWS messaging, JWT, Hibernate Types |
| `gf-erp-mdm`          | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA; no Flyway dependency observed | Kafka | AWS SNS, OAuth2 resource server, Apache POI, Hibernate Types |
| `gf-hrms`             | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka (spring-kafka confirmed in build.gradle; KafkaConfig + KafkaTemplate + 6 topics produced + 4 consumed), Redis | HTTP client, Hibernate Types, OpenAPI |
| `gf-inventory`        | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka, Temporal SDK/starter 1.31.0, Redis/Redisson | AWS SNS, Apache POI, common printing |
| `gf-inventory-worker` | 21 | 3.5.0 | No JPA/Flyway observed | Kafka, Temporal SDK/starter/testing 1.31.0 | Prometheus registry, HTTP client |
| ~~`gf-marketing`~~    | ~~24~~ | ~~4.0.0~~ | ~~(removed — false entry)~~ | ~~(removed)~~ | **REMOVED v2.1**: actual build.gradle confirms Java 21 + SB 3.5.0 (row 89 is correct) |
| `gf-notification`     | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka | AWS S3/SNS/SQS/DynamoDB, Mustache, JWT |
| `gf-purchase`         | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka, Redis/cache | AWS SNS/KMS, OAuth2 resource server, JWT, Hibernate Types |
| `gf-sales`            | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka, Temporal 1.31.0, Redis, Redis lock | common printing, JWT |
| `gf-shipment`         | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA; no Flyway dependency observed | No Kafka/Temporal/Redis dependency observed | AWS SNS, OAuth2 resource server, JWT, Hibernate Types |
| `gf-system`           | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | Kafka | Feature flag starter, Hibernate Types |
| `gf-worker`           | 21 | 3.5.0 | PostgreSQL `42.7.2`, JPA, Flyway | No Kafka/Temporal/Redis dependency observed | Spring Security, Camel stringtemplate, Resilience4j 2.1.0 |

## 5. GraphQL Gateway Stack

| Purpose | Choice | Version evidence | Used in |
|---|---|---|---|
| Runtime | Node.js | Docker `node:22.16-alpine`; local dev version `TBD` | Both GraphQL gateways |
| Language/build | TypeScript | `typescript ^5.8.3`, `tsc` build script | Both GraphQL gateways |
| GraphQL server | Apollo Server | `@apollo/server ^4.9.5`; legacy `apollo-server ^3.13.0` also present | Both GraphQL gateways |
| GraphQL schema tooling | GraphQL Tools | `@graphql-tools/merge`, `@graphql-tools/schema`, `@graphql-tools/utils` | Both GraphQL gateways |
| HTTP server | Express | `express ^4.18.2` | Both GraphQL gateways |
| HTTP client | Axios | `axios ^1.10.0` | Both GraphQL gateways |
| Request security | Helmet, CORS, express-rate-limit | `helmet`, `cors`, `express-rate-limit` | Both GraphQL gateways |
| Validation/config | Zod, dotenv | `zod ^3.22.4`, `dotenv ^16.3.1` | Both GraphQL gateways |
| File upload | multer / graphql-upload-ts | `multer ^2.0.2`; `graphql-upload-ts ^2.1.2` in SSO graph | GraphQL gateways |
| Observability | OpenTelemetry, Prometheus client | `@opentelemetry/*`, `prom-client ^15.1.3`, `otel-collector-config.yaml` | Both GraphQL gateways |
| Logging | Winston | `winston ^3.11.0` | Both GraphQL gateways |
| JWT | jsonwebtoken | `jsonwebtoken ^9.0.3` | `agg-sso-graph` |
| AWS DynamoDB client | AWS SDK DynamoDB | `@aws-sdk/client-dynamodb ^3.859.0`, `@aws-sdk/lib-dynamodb ^3.859.0` | `agg-sso-graph`; persistence ownership TBD |

GraphQL runtime notes:

- Dockerfiles expose `4000` and compose maps `4000:4000`.
- `agg-garage-graph/src/config/env.ts` defaults `PORT` to `4123`.
- `agg-sso-graph/src/config/env.ts` defaults `PORT` to `4007`.
- The difference between Docker/compose and source defaults is a config standardization gap.

## 6. OCR Stack

| Purpose | Choice | Version evidence |
|---|---|---|
| Runtime | Python | `.python-version` `3.11`, Docker `python:3.11-slim`, `pyproject.toml` `requires-python >=3.11` |
| Web framework | FastAPI | `fastapi==0.116.2` in `requirements.txt` |
| ASGI server | Uvicorn / Gunicorn | `uvicorn[standard]==0.35.0`; `gunicorn>=22.0.0` in `pyproject.toml` |
| Packaging/install | uv + pip/setuptools | Docker installs `uv`, then `uv pip install --system -r requirements.txt`; `pyproject.toml` uses setuptools |
| Validation/settings | Pydantic, pydantic-settings | `pydantic==2.11.7`, `pydantic-settings==2.10.1` |
| Image processing | Pillow, pillow-heif, numpy | `Pillow==11.3.0`, `pillow_heif==1.1.0`, `numpy==2.2.6` |
| Azure OCR | Azure AI Vision Image Analysis | `azure-ai-vision-imageanalysis==1.0.0`, `azure-core==1.35.0`; imports in `app/services/ocr_pipeline.py` |
| LLM extraction | OpenAI / Azure OpenAI Python SDK | `openai==1.107.3`; `AsyncOpenAI`, `AsyncAzureOpenAI` imports |
| Auth | PyJWT, bcrypt | `PyJWT==2.10.1`, `bcrypt==4.3.0` |
| Data utilities | pandas | `pandas==2.3.2` |
| AWS client | boto3 | `boto3==1.40.61` |
| Async database client | asyncpg | `asyncpg>=0.29.0` in `pyproject.toml`; actual persistence use TBD |

OCR config evidence:

- `.env.example` defines `AZURE_VISION_*`, `OPENAI_*`, `AZURE_OPENAI_*`, `API_PORT`, JWT secret/password variables, and processing timeout settings.
- `docker-compose.yml` maps host `8093` to container `8000`.
- Dockerfile exposes `8000` and healthchecks `/health`.

## 7. Data Stores

| Purpose | Engine / service | Evidence | Owned/used by |
|---|---|---|---|
| Primary relational data | PostgreSQL | JDBC URLs `jdbc:postgresql://...`, PostgreSQL driver `42.7.2` or inherited Boot-managed version | Spring services |
| Migrations | Flyway | `flyway-core`, `flyway-database-postgresql`, `src/main/resources/db/migration/*.sql` | Many Spring services |
| Cache / runtime state | Redis | Redis starters/config, `REDIS_PORT`, Redis lock integration | Selected Spring services |
| Distributed lock | Redis lock / Redisson | `spring-integration-redis`, `redisson-spring-boot-starter:3.27.1` | `gf-sales`, `gf-customer`, `gf-marketing`, `gf-accounting`, `gf-inventory` |
| DynamoDB | AWS DynamoDB | DynamoDB SDK dependency in `agg-sso-graph`; Spring Cloud AWS DynamoDB in `gf-notification` | Ownership TBD |
| Object/file storage | AWS S3 / file services | AWS SDK S3 in `gf-notification`; `CT_FILE_STORAGE` in GraphQL gateway | Exact ownership TBD |
| OCR DB | TBD | `asyncpg` dependency appears in OCR `pyproject.toml`, but concrete persistence usage was not confirmed in Phase 2 | TBD |

Notes:

- Config evidence includes nonprod AWS RDS-style PostgreSQL hosts in some services, but deployment topology is not finalized here.
- Data ownership is authoritative only after Phase 11 data model docs.

## 8. Messaging & Workflow Infrastructure

| Purpose | Choice | Evidence | Notes |
|---|---|---|---|
| Event streaming | Kafka | `spring-kafka`, `KafkaTemplate`, `@KafkaListener`, `spring.kafka.bootstrap-servers` or `kafka.bootstrap-servers` | Defaults include localhost and AWS MSK-like hosts in ap-southeast-1 |
| Workflow orchestration | Temporal | `temporal-spring-boot-starter:1.31.0`, `temporal-sdk:1.31.0`, `temporal:` config | Confirmed for `gf-sales`, `gf-customer`, `gf-marketing`, `gf-inventory`, `gf-inventory-worker` |
| Retry | Spring Retry / Temporal retry | `spring-retry`, Temporal SDK | Per-service policies TBD |
| DLQ / outbox/inbox | Custom tables/events | SQL migrations and event classes observed in some services | To be captured in event contracts |

Important distinctions:

- `gf-purchase` and `gf-notification` may contain workflow-related terms in code/config scans, but Phase 2 dependency evidence does **not** confirm Temporal ownership.
- `gf-hrms` has Kafka dependency confirmed (`spring-kafka` in build.gradle line 40; KafkaConfig.java with KafkaTemplate + KafkaListenerContainerFactory; 6 topics produced + 4 consumed per KG).

## 9. API & Network Layer

| Layer | Choice | Evidence | Notes |
|---|---|---|---|
| Public/API aggregation | GraphQL gateways | `agg-garage-graph`, `agg-sso-graph`, Apollo Server, `/graphql` docs/readme evidence | Detailed schema contracts in GraphQL API phase |
| Service APIs | REST / JSON | Spring MVC controllers across Spring services | Contracts generated in Phase 10 |
| API documentation | SpringDoc OpenAPI | SpringDoc dependencies and app configs | Version split: `2.8.9` for Boot 3.x, `3.0.0` for Boot 4.x services |
| OCR API | REST / multipart/base64 | FastAPI app/routes/readme evidence | Contract in OCR API phase |
| Service discovery/routing | Env-based endpoint registry | GraphQL `src/config/env.ts`, `src/config/services.ts`, `src/config/endpoints.ts` | Gateway routing and downstream ownership need reconciliation |

## 10. Observability Stack

| Layer | Evidence | Current status |
|---|---|---|
| Spring services | `management.endpoints.web.exposure.include` includes `otlp` or `health,info,metrics,prometheus`; `spring-otlp-starter`; `spring-logging-starter` | Present in multiple services |
| GraphQL gateways | OpenTelemetry packages, `src/config/opentelemetry.ts`, `otel-collector-config.yaml`, `prom-client`, `/metrics` README evidence | Present in both gateways |
| Metrics | Prometheus exporter in OTel collector config; `prom-client`; Micrometer Prometheus in selected services | Present |
| Tracing | OTLP exporters in Node config; Spring OTLP starter | Present |
| Trace backend | Jaeger exporter in OTel collector config | Config evidence only; actual deployment TBD |
| Log aggregation backend | TBD | Not confirmed from local evidence |

## 11. CI/CD & Deployment


| Stage | Choice | Version | Notes |
|---|---|---|---|
| VCS | **GitLab** | — | Multi-repo hoặc monorepo (TBD) — mỗi microservice có pipeline riêng |
| CI | **Jenkins** | — | Build, lint, test, security scan per microservice |
| CD | **ArgoCD** | — | GitOps-based continuous delivery to AKS |
| Package / Chart | **Helm** | 3.x | Helm charts cho mỗi microservice deployment |
| Container runtime | **Docker** | — | Build images; **Docker Compose** cho local dev |


## 12. Security & Secrets

| Concern | Evidence | Notes |
|---|---|---|
| JWT validation | `jjwt`, `nimbus-jose-jwt`, `jsonwebtoken`, PyJWT | Used across Java/Node/Python boundaries |
| OAuth2 resource server | Spring OAuth2 resource server dependencies in selected services | Exact issuer/JWKS model TBD |
| Common security starter | `com.actechx.common:spring-security-starter` | Used by many Spring services |
| OPA/PBAC/RBAC | `spring-opa-wasm-starter`; feature/security starters | Detailed in platform/security docs later |
| Secrets | Env vars in application configs, `.env.production`, `.env.example` | Actual secret management platform TBD |
| OCR external credentials | `AZURE_VISION_*`, `OPENAI_*`, `AZURE_OPENAI_*` | From OCR `.env.example` and settings code |
| Gateway source identification | `x-source-service`, forwarded IP headers | Evidence in GraphQL `services.ts` |

## 13. Open Decisions / TBD

| ID | Decision needed | Reason | Target phase |
|---|---|---|---|
| ~~TECH-TBD-001~~ | ~~Standardize Java/Spring baseline~~ | **RESOLVED v2.1**: All 14 services confirmed Java 21 + SB 3.5.0. gf-marketing Java 24/SB 4.0 entry was false (build.gradle shows Java 21). No baseline split. | RESOLVED |
| TECH-TBD-002 | Confirm deployment platform | Docker/Compose evidence exists only for GraphQL/OCR; Spring runtime platform is not confirmed | System architecture / deployment |
| TECH-TBD-003 | Confirm authoritative IAM/SSO service model | `agg-sso-graph` maps to external `sec-iam-service`; Spring services use JWT/security starters | System architecture / HLD |
| TECH-TBD-004 | Confirm DynamoDB ownership | `agg-sso-graph` and `gf-notification` include DynamoDB deps | Data model phase |
| TECH-TBD-005 | ~~Confirm Temporal ownership per service~~ | **PARTIALLY RESOLVED v2.1**: WITH Temporal (confirmed): gf-sales, gf-customer, gf-marketing, gf-inventory, gf-inventory-worker. WITHOUT Temporal (confirmed): gf-purchase (outbox+Kafka only), gf-notification (@Scheduled cron). Remaining services: no Temporal. | RESOLVED |
| TECH-TBD-006 | Confirm object/file storage ownership | AWS S3 deps and `CT_FILE_STORAGE` appear, but owner boundary is TBD | HLD / API phase |
| TECH-TBD-007 | Standardize gateway ports | Docker/compose expose `4000`, while source defaults are `4123` and `4007` | GraphQL HLD / deployment |
| TECH-TBD-008 | Confirm OCR persistence model | `asyncpg` is declared, but concrete DB usage was not confirmed in Phase 2 | OCR HLD / data model decision |

## 14 Frontend Frameworks

| Purpose            | Choice                                                       | Version                                      | Used in Boundary | Rationale / ADR                                                                                                    |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| UI framework       | **React**                                                    | 19.x                                         | gf-gms-web       | Mature ecosystem, component-based UI model, compatible with the current SPA architecture                           |
| Meta-framework     | None (SPA, no SSR framework)                                 | N/A                                          | gf-gms-web       | Internal garage management web app; SEO/SSR is not required for the current product boundary                       |
| Routing            | **TanStack Router**                                          | 1.x                                          | gf-gms-web       | File-based routing with generated route tree, type-safe navigation, and Vite integration                           |
| Server state       | **TanStack Query**                                           | 5.x                                          | gf-gms-web       | Centralized query cache and mutation lifecycle for server data                                                     |
| Client state       | **Zustand**                                                  | 5.x                                          | gf-gms-web       | Lightweight global state for tenant, permissions, filters, and feature-local stores                                |
| Styling            | **Tailwind CSS**                                             | 4.x                                          | gf-gms-web       | Utility-first styling with project theme tokens in `src/index.css`                                                 |
| Component library  | **shadcn/ui + Radix UI primitives**                          | shadcn registry + Radix 1.x/2.x              | gf-gms-web       | Accessible UI primitives with local ownership under `src/components/ui` and shared app components                  |
| Build tool         | **Vite + React SWC plugin**                                  | Vite 7.x / SWC plugin 3.x                    | gf-gms-web       | Fast ESM dev server, production build pipeline, and TanStack Router code generation                                |
| API client         | **Apollo Client + Apollo Upload Client + fetch API wrapper** | Apollo Client 3.x / GraphQL 16.x / fetch API | gf-gms-web       | GraphQL is the primary backend contract; upload support and REST/blob helpers cover integration-specific endpoints |
| Forms & validation | **React Hook Form + Zod**                                    | RHF 7.x / Zod 3.x                            | gf-gms-web       | Declarative form state, schema validation, and reusable resolver integration                                       |
| i18n               | **i18next + react-i18next**                                  | i18next 25.x / react-i18next 15.x            | gf-gms-web       | Translation support for Vietnamese/English locale files and user-facing text                                       |
| Theme              | **next-themes**                                              | 0.4.x                                        | gf-gms-web       | Class-based theme switching aligned with Tailwind CSS variables                                                    |

## 15 Mobile Frameworks

 Purpose | Choice | Version | Used in Boundary | Rationale / ADR |
|---|---|---:|---|---|
| Mobile framework | Flutter + FVM | Flutter local/CI `3.41.5`; lock minimum `>=3.38.4` | Toàn app, build/run/generate | Chuẩn hóa SDK bằng FVM. Local config, `Makefile` và CircleCI hiện cùng `3.41.5`, thỏa Flutter SDK constraint trong `pubspec.lock`. |
| Language runtime | Dart SDK | `^3.11.0` | Toàn codebase Dart/Flutter | Bám theo `environment.sdk` trong `pubspec.yaml`. |
| App bootstrap | `start.dart` + `main_<flavor>.dart` | Project pattern | `lib/start.dart`, `lib/main_*.dart` | Một bootstrap chung, nhiều entrypoint theo flavor. |
| Flavor management | `flutter_flavorizr` + `F.appFlavor` | `2.1.6` | `pubspec.yaml`, `lib/flavors.dart`, Android/iOS flavor config | Quản lý prod/dev/uat/sit/pt/stag/preprod bằng app id, bundle id, Firebase config riêng. |
| State management | BLoC/Cubit | `flutter_bloc 8.1.6`, `bloc 8.1.4` | `lib/app`, `lib/ui/**`, `BaseCubit`, `BaseState` | Pattern chính của UI state. `BaseCubit.launch()` chuẩn hóa loading/error handling. |
| Base UI architecture | `BasePage`, `BaseCubit`, `BaseState` | Project pattern | `lib/core/common/bases/bloc/*` | Ép feature đi qua lifecycle, loading, error, retry nhất quán. |
| Dependency injection | `get_it` + `injectable` | `get_it 7.7.0`, `injectable 2.6.0` | `lib/injection_container.dart`, generated config | DI compile-time bằng generator, giảm manual wiring. |
| Routing | `auto_route` | `10.1.0+1` | `lib/core/router/router.dart`, guards | Router typed, route guard, generated route contract. |
| Route generation | `auto_route_generator` | `10.2.3` | `router.gr.dart` | Route changes phải chạy build_runner. |
| REST networking | `Dio` + `Retrofit` | `dio 5.9.2`, `retrofit 4.4.2` | `lib/core/services/api_service.dart`, interceptors | REST dùng cho upload/export và các endpoint không đi GraphQL. |
| REST codegen | `retrofit_generator` | `9.2.0` | `api_service.g.dart` | Retrofit interface sinh client typed. |
| GraphQL client | `graphql_flutter` + `gql` | `graphql_flutter 5.2.1`, `gql 1.0.1` | `lib/core/services/graphql/*`, documents | API chính theo query/mutation documents, có cache HiveStore. |
| GraphQL debug | Custom debug link/provider | Project pattern | `lib/core/debug/*`, `DebugGraphQLLink` | Ghi nhận request/response GraphQL để debug trong app. |
| Model immutability | `freezed` | `freezed 2.5.8`, `freezed_annotation 2.4.4` | states/models dùng `@freezed` | State immutable, copyWith, union/pattern nếu cần. |
| JSON serialization | `json_serializable` + annotations | `json_serializable 6.9.5`, `json_annotation 4.9.0` | `*.g.dart`, model request/response | Typed serialization cho REST/GraphQL payload. |
| Code generation runner | `build_runner` | `2.5.4` | freezed/json/retrofit/injectable/auto_route/flutter_gen | Lệnh chuẩn: `fvm dart run build_runner build -d`. |
| Asset generation | `flutter_gen` | `5.10.0`, runner `5.10.0` | `lib/generated` | Sinh asset constants, giảm string path thủ công. |
| Localization | `easy_localization` + `intl` | `easy_localization 3.0.8`, `intl 0.20.2` | `assets/localizations`, `lib/generated/locale_keys.gen.dart`, `start.dart` | Locale khởi tạo ở bootstrap; text UI không nên hard-code. |
| Firebase core | Firebase SDK | `firebase_core 3.15.2` | `lib/start.dart`, flavor Firebase configs | Nền cho analytics, crashlytics, messaging, remote config. |
| Analytics | `firebase_analytics` | `11.6.0` | managers/analytics | Theo dõi event sản phẩm. |
| Crash reporting | `firebase_crashlytics` | `4.3.10` | `lib/start.dart` | Global fatal/non-fatal error reporting. |
| Push messaging | `firebase_messaging` | `15.2.10` | background handler, notification managers | Push notification, background message, notification launch flow. |
| Remote config | `firebase_remote_config` | `5.5.0` | `AppVersionManager`, feature/version managers | Remote toggles/version behavior. |
| Dynamic links | `firebase_dynamic_links` | `6.1.10` | Firebase integration boundary | Legacy/deep-linking dependency; cần kiểm tra lifecycle vì Firebase Dynamic Links đã bị deprecate upstream. |
| Local notifications | `flutter_local_notifications` | `18.0.1` | `LocalNotificationManager`, `start.dart` | Hiển thị và handle tap notification local. |
| Real-time chat | CometChat Chat SDK/UI Kit | `cometchat_sdk 4.0.28`, `cometchat_chat_uikit 5.2.2` | `lib/ui/comet_chat`, `CometChatManager` | Chat realtime là domain đặc thù, cần reviewer riêng khi thay đổi. |
| Calling | CometChat Calls + CallKit plugin | `cometchat_calls_sdk 4.2.1`, `cometchat_calls_uikit 5.0.8`, local `flutter_callkit_incoming` | call screens, local plugins | Luồng call/VoIP nhạy runtime, cần QA foreground/background/terminated. |
| APNS custom integration | Local plugins | path: `flutter_apns_only`, `flutter_apns_x` | local packages | Plugin local cho APNS/VoIP behavior, cần kiểm tra khi nâng SDK. |
| Persistence | `shared_preferences`, `path_provider` | `shared_preferences 2.5.4`, `path_provider 2.1.5` | app preferences, local storage | Lưu lightweight app/user state. |
| Internet status | `internet_connection_checker` / plus | constraints in pubspec | `AppCheckInternetService`, network guards | BaseCubit/GraphQL flow phụ thuộc network guard trước request. |
| WebView | `webview_flutter`, `flutter_inappwebview` | `4.13.1`, `6.1.5` | survey/web content flows | Dùng cho màn nội dung web/embedded flows. |
| Media picking | `image_picker`, `file_picker`, `camera` | `1.2.1`, `10.3.10`, `0.10.6` | upload, OCR, media flows | Dùng cho ảnh/file/camera. Cần permission và platform QA. |
| Permission | `permission_handler` | `12.0.1` | camera/file/notification related flows | Platform permission boundary. |
| Device/app info | `device_info_plus`, `package_info_plus` | `12.3.0`, `8.3.1` | managers/version/device flows | Lấy thông tin thiết bị/app version. |
| UI assets | `flutter_svg`, `lottie`, `cached_network_image` | `2.2.3`, `3.3.0`, `3.4.1` | widgets/assets/images/animations | Chuẩn hiển thị SVG, animation, remote image cache. |
| UI loading/skeleton | `shimmer`, `skeletonizer`, `flutter_spinkit` | `3.0.0`, `2.1.3`, pubspec constraint | list/loading states | Chuẩn hóa loading/placeholder UX. |
| Charts | `fl_chart` | `1.1.1` | dashboard/chart UI | Charting cho dashboard/reporting. |
| Debug network tooling | `flutter_alice`, `flutter_pretty_dio_logger`, `curl_logger_dio_interceptor`, `logger` | `2.0.1`, `3.0.0`, `1.0.1`, `2.6.2` | debug/interceptors/logger | Debug API/Dio/GraphQL trong dev. |
| Static analysis | `flutter_lints` | `6.0.0` | `analysis_options.yaml` | Lint baseline mặc định Flutter. Có thể cần ADR nếu team muốn stricter rules. |
| Build scripts | `Makefile` | Project pattern | root `Makefile` | Gom lệnh run/build/generate. `clean-app` hiện dùng `fvm use 3.41.5` và `fvm flutter clean` để tránh lệch global Flutter. |
| CI/CD | CircleCI + Fastlane + Firebase/App Store/Play Store | CircleCI `2.1`; CI Flutter param `3.41.5`; Ruby `3.2.2`; CocoaPods `1.16.2`; Xcode `26.1.1`; Android image `cimg/android:2025.12` | `.circleci/config.yml`, Android/iOS build and deploy workflows | CI tồn tại thật, nhưng ADR CI/CD đầy đủ phải rà từng job: setup, analyze, scan, build, deploy, tag trigger, secrets, artifact policy. |

## Change Log

| Date | Version | Author | Description |
|---|---:|---|---|
| 2026-05-07 | 1 |   | Populated Garage tech stack from local build, package, Docker and config evidence |
| 2026-05-11 | 2.1 |   | Fix vs source code (cross-ref 21 INTEG + 19 KG + build.gradle verification): (1) §4.2 gf-marketing Java 24/SB 4.0.0 entry FALSE — actual build.gradle confirms Java 21 + SB 3.5.0, removed row; (2) §4.2 gf-hrms "no Kafka" WRONG — spring-kafka confirmed in build.gradle + KafkaConfig.java + 6 topics produced + 4 consumed; (3) TECH-TBD-001 RESOLVED — no baseline split, all 14 services Java 21 + SB 3.5.0; (4) TECH-TBD-005 RESOLVED — Temporal confirmed for 5 services, gf-purchase + gf-notification confirmed NOT using Temporal; (5) §8 gf-hrms Kafka corrected. |
