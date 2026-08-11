---
type: execution
artifact_kind: work-package
status: PLANNED
version: 5
tier: T4
owner_authority: Delivery Authority
wave: "W07"
last_reviewed: "2026-08-10"
---

# PKG-W07 — Partner Link + Booking relay Driver Plus

> Work package cho Wave 7: garage xử lý vòng đời liên kết Driver Plus trên Web/Mobile và `gf-sales` relay booking hai chiều qua Kafka. M01 Vertical-Slice, timebox 5 ngày. Kafka adapter phải tự-own tại boundary nghiệp vụ (`gf-system` cho Partner Link, `gf-sales` cho Booking), dùng correlated response event theo ADR-029; không thay bằng HTTP synchronous callback. Update Actuals (§10) khi kết thúc wave.

## 1. Overview

| Field | Value |
|---|---|
| Wave | `W07 — Partner Link + Booking relay Driver Plus` |
| Epic / business capability | `EP-PARTNER-LINK` phase 1 + compatibility hardening cho `EP-BOOKING` relay Driver Plus |
| Duration | 5 ngày làm việc (timebox cố định) |
| Features (3 core) | `FEAT-SYS-DRIVERPLUS-LINK` · `FEAT-BOOK-DRIVERPLUS-INBOUND` · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` |
| Regression-only (không count FEAT) | `FEAT-BOOK-EDIT` AC-15 — giữ `BOOKING.UPDATE.RESPONSE` cho sửa nội dung booking. |
| Boundaries affected | `gf-system` (Partner Link owner) · `gf-sales` (Booking owner) · `agg-garage-graph` · `garage-web` · `garage-mobile` · Driver Plus external |
| Vertical slice | D+ gửi request liên kết → garage xem/duyệt trên Web hoặc Mobile → D+ nhận profile/status; D+ gửi booking/hủy → GMS xử lý đúng một lần và trả event correlated. |
| Entry gate | Bộ architecture Driver Plus W07 ratified, Kafka sandbox/ACL available, Product Kafka decision locked. |

## 2. Scope

### 2.1 Business Goal

Garage chủ động duyệt hoặc từ chối tài khoản Driver Plus được phép nhận hồ sơ doanh nghiệp, chỉ cho phép tối đa một liên kết hoạt động tại một thời điểm và lưu dấu vết mọi thay đổi. Sau đó, lịch hẹn từ Driver Plus được ghi nhận đúng dữ liệu khách cung cấp; khi lịch bị hủy hoặc trạng thái thay đổi, Driver Plus nhận phản hồi để hiển thị đúng cho khách của họ. Khi đối tác gửi lại message do lỗi mạng, garage không phát sinh liên kết hay booking trùng.

### 2.2 Technical Scope

#### 2.2.1 Backend — `gf-system`: Partner Link

- Nhận Kafka `AC-DEV-PARTNER-LINK-EVENTS`, filter bắt buộc `MessageGroup=PARTNER_LINK` + `MessageStep`:
  - inbound `PARTNER_LINK.REQUEST.CREATE`, `.REQUEST.WITHDRAW`, `.UNLINK`;
  - outbound `PARTNER_LINK.REQUEST.RESPONSE`, `.PROFILE.SYNC`, `.STATUS.CHANGED`.
- `PartnerLinkDriverPlusConsumer`: validate `OriginTenantId` khớp `data.tenantId`; inbox dedupe; message sai nghiệp vụ ack + response event, lỗi hạ tầng không ack để redeliver.
- `partner_link_request` và `tenant_profile` theo ADR-030; scalar FK only, Flyway additive. Single-active-link enforce bằng transaction + partial unique index `(tenant_id) WHERE status='LINKED'`; approve cascade auto-reject mọi pending cùng tenant.
- Sáu REST endpoint theo `Architecture/api/gf-system-api.md` §3bis: list, detail, approve, reject, resync, cancel. Không tạo endpoint garage tự tạo request.
- Mọi state change từ GMS ghi outbox: approve phát profile sync + status changed; reject/cancel/cascade phát status changed; state do D+ withdraw/unlink không gửi notification ngược.
- Flag `PartnerLink:DriverPlus`: off → REST/action bị chặn, client ẩn menu/tab, request tạo mới từ D+ không tạo record và nhận correlated response `ERR-DPL-011`, không phát profile/status mới; giữ dữ liệu/audit, không xóa. Bật lại tiếp tục trên dữ liệu hiện hữu.

#### 2.2.2 Backend — `gf-sales`: Booking relay

- Nhận Kafka `AC-DEV-BOOKING-EVENTS`, filter `MessageGroup=BOOKING`:
  - `BOOKING.CREATE.REQUEST`: parse 14 field (5 bắt buộc + 9 optional), giờ hẹn theo bước 15 phút; tạo booking nguồn Driver Plus đúng một lần.
  - `BOOKING.CANCELLED`: chỉ auto-cancel booking `NEW`/`CONFIRMED` chưa có service order; trường hợp state không phù hợp giữ nguyên và đồng bộ trạng thái thực tế.
- Inbox dedupe; partition key `Booking-{bookingCode}` để giữ thứ tự create/cancel cùng aggregate. Không direct DB boundary khác, không đưa qua `gf-erp-agent`.
- Outbox phát `BOOKING.CREATE.RESPONSE` (success true/false), `BOOKING.CANCEL.RESPONSE` (không tìm thấy booking), `BOOKING.CHANGE.STATUS` (confirm/decline/arrive/cancel/no-show); giữ `BOOKING.UPDATE.RESPONSE` regression cho FEAT-BOOK-EDIT.
- `cancelSource` luôn được lưu nội bộ khi hủy; `driverPlusStatus` và response fields là additive. Response lỗi dùng correlation tới inbound message, không là HTTP response.
- Flag `Booking:DriverPlus` được check programmatic tại adapter `FeatureFlagService.isEnabled()`; off thì không consume side-effect và không publish outbound.

#### 2.2.3 BFF — `agg-garage-graph`

| GraphQL operation | Downstream `gf-system` | Mục đích |
|---|---|---|
| `listPartnerLinkRequests` | `GET /partner-links` | Danh sách liên kết D+ |
| `getPartnerLinkRequestDetail` | `GET /partner-links/{requestCode}` | Chi tiết + action khả dụng |
| `approvePartnerLinkRequest` | `POST .../approve` | Duyệt + chấp nhận điều khoản |
| `rejectPartnerLinkRequest` | `POST .../reject` | Từ chối kèm lý do |
| `resyncPartnerLinkData` | `POST .../resync` | Gửi lại hồ sơ garage |
| `cancelPartnerLink` | `POST .../cancel` | Hủy liên kết kèm lý do |

- Resolvers passthrough, không cache/enrich profile sync data và không đổi tên enum/field so với Naming Registry `gf-system-api.md` §5.
- Propagate auth/tenant headers, error code `ERR-DPL-*`, flag behavior; bổ sung regression script theo convention BFF hiện có (không thêm test framework mới).

#### 2.2.4 Web — `garage-web`

- Menu top navigation “Liên kết” chỉ hiện khi flag on; trang Driver Plus list không search/pagination; detail và modal riêng cho Duyệt, Từ chối, Đồng bộ lại, Hủy.
- Render đúng badge/lifecycle `PENDING`, `LINKED`, `REJECTED`, `UNLINKED`; dùng `availableActions` server-side, không tự suy luận quyền action ở client.
- Reuse-First gate cho table/card, status badge, modal confirmation và empty/loading/error state; accessibility và testid theo convention hiện hữu.
- Booking không có route mới: regression list/detail booking baseline hiển thị booking D+ và status đã relay.

#### 2.2.5 Mobile — `garage-mobile`

- Bottom-nav tab “Liên kết”, màn list/filter/detail full screen và 4 action tương đương Web nhưng dùng navigation/mobile component chuẩn.
- Dùng chung 6 GraphQL operation qua `agg-garage-graph`; flag off ẩn tab/surface. Không tạo BFF/API riêng.
- Locale VN/EN, Semantics labels, loading/empty/error states và widget tests cho lifecycle/action matrix.

### 2.3 Out of Scope / Explicitly Deferred

- Emit phiếu dịch vụ/SO và phiếu quyết toán/settlement sang Driver Plus. Product có yêu cầu nhưng thiếu Architecture contract về owner, step, payload URL/binary, retry và idempotency; cần CR/design riêng.
- UI biểu thị retry/error delivery của Partner Link: **đã chốt không triển khai trong W07**. Retry và event `FAILED` xử lý ngầm ở backend/vận hành; Web/Mobile không có badge, cảnh báo hoặc nút thử lại. Nếu cần UI trong tương lai phải mở CR/feature riêng.
- Màn quản trị Driver Plus, D+ customer push notification, hoặc đồng bộ booking do kênh khác tạo.

### 2.4 Contract & Implementation Gates

1. `INTEG-EXT-driver-plus.md` là SSOT external transport: topic/step/header/correlation/idempotency/order/retry, không duplicate schema ở PKG.
2. Mọi consumer filter cả `MessageGroup` và `MessageStep`; self-produced outbound message phải ack + skip.
3. Retry transport không rollback business state đã commit. D+ consumer phải dedupe `eventId`/correlation; GMS consumer phải dedupe inbox.
4. Tenant mismatch là fail có kiểm soát, không side effect. Không log PII payload đầy đủ.
5. Reuse-first trước UI composition; contract mock Day 1, wire thật khi BFF/REST đã stable.

## 3. Entry Criteria

- [ ] `Tracking/ARCH-REVIEW-W07.md` đang P0=0, P1=0; các P2 cross-reference/frontmatter đã được fix; SA ratify/merge toàn bộ W07 Architecture trước `/wave-start 07`.
- [ ] `ADR-029` + `ADR-030` ACCEPTED; `INTEG-EXT-driver-plus.md` v3; `gf-system`/`gf-sales` HLD, API, data, events; `agg-garage-graph` §3k; INTEG-FE §3.9 và INTEG-MOB §3.6 đã lock.
- [ ] Product chốt Kafka + kill-switch + API naming + giới hạn lý do + xử lý retry ngầm: EP Partner Link v15; FEAT Link v32; Booking inbound v6; Booking outbound v4; `BR-GF-SYSTEM` v21 và `BR-GF-SALES` v5.
- [ ] D+ sandbox topic, ACL/SASL, producer/consumer group, schema version, test tenant và correlation agreement được Platform + D+ xác nhận.
- [ ] Feature flags `PartnerLink:DriverPlus`/`Booking:DriverPlus` tồn tại, default on và có emergency kill-switch do Delivery Authority sở hữu.
- [ ] KG update scope `gf-system` + `gf-sales` được tạo trước DEV; `SERVICE-BOUNDARY-MATRIX` module Partner Link được backfill theo governance.
- [ ] Branch, `STATE.wave=07` và infrastructure scope đã được Delivery Authority mở khi thực sự bắt đầu; PKG này đã populated.

## 4. Agent Assignments

### 4.1 DEV Agents

| Agent | Boundary | Tasks | Estimated effort |
|---|---|---|---|
| `agent-dev-gf-system` | `gf-system` | Day 1 contract/Kafka consumer + schema/Flyway; Day 2 lifecycle + six REST endpoints; Day 3 approve cascade/outbox/profile sync; Day 4 flags, audit, tests; Day 5 KG/review fixes. | ~32h |
| `agent-dev-gf-sales` | `gf-sales` | Day 1 inspect production relay + lock 14-field mapping; Day 2 create/cancel gate; Day 3 correlated responses/status outbox; Day 4 idempotency/flags/tests; Day 5 KG/review fixes. | ~28h |
| `agent-dev-agg-garage-graph` | BFF | Six Partner Link operations, auth/error/flag passthrough, regression script, KG. | ~14h |
| `agent-dev-garage-web` | Web | Navigation, list/detail, 4 action dialogs, flag hide, baseline booking regression, a11y. | ~22h |
| `agent-dev-garage-mobile` | Mobile | Bottom tab, list/filter/detail, 4 actions, flag hide, locale/semantics/widget tests. | ~24h |

**Parallel safety**: `gf-system` và `gf-sales` start song song sau contract gate Day 1. BFF scaffolds from locked REST contract Day 1; Web/Mobile use mock data Day 1–2 then wire actual GraphQL. External sandbox integration is the critical path from Day 3; no team may re-negotiate event steps in code.

### 4.2 REVIEW Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-review-backend` | Both Java boundaries: Flyway additive, scalar FK, tenant guard, inbox/outbox, dual header filter, correlation, partial unique index + approve atomicity, no PII log, flag kill-switch. | Post-DEV Day 4–5 |
| `agent-review-garage-web` | Six operation mapping, state/action matrix, flag hides menu, no invented retry UI, reuse/a11y/testid. | Post-DEV Day 4–5 |
| `agent-review-garage-mobile` | Tab/navigation, list/filter/detail, 4 actions, flag hide, locale/semantics and no unsupported UI state. | Post-DEV Day 4–5 |

### 4.3 TEST Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-test-api` | 6 Partner Link REST + 6 GraphQL op; event step/header/correlation tests; 14-field booking payload and error codes. | TEST_PLANNING Day 3 |
| `agent-test-e2e` | D+ request → Web/Mobile action → profile/status; booking create/cancel/error correlated response. | TEST_PLANNING Day 3 |
| `agent-test-isolation` | Cross-tenant request/code access, OriginTenant mismatch and duplicate message. | TEST_PLANNING Day 4 |
| `agent-test-security` | ACL/auth, PII masking, external payload validation, flag-off behavior. | TEST_PLANNING Day 4 |
| `agent-test-ui` | Web/Mobile state badges, action availability, accessibility, flag hide. | TEST_PLANNING Day 4 |

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests

- **gf-system**: 3 inbound + 3 outbound Partner Link steps, six REST endpoints, tenant profile source read, audit/history, inbox/outbox, single-active-link atomic guard and `PartnerLink:DriverPlus` gate.
- **gf-sales**: Booking create/cancel relay with full 14-field mapping; cancel eligibility; idempotency/order; correlated create/cancel responses; status change event; additive fields and `Booking:DriverPlus` gate.
- **agg-garage-graph**: 2 query + 4 mutation Partner Link operations, contract-pure passthrough and regression script PASS.
- **garage-web/mobile**: full Partner Link lifecycle surface, feature flag hide, no booking screen expansion; baseline booking regression verified.
- **Cross-boundary integration**:
  - Link create → `PENDING` + correlated success; create while linked → `ERR-DPL-010` without record.
  - Approve concurrent pending requests → exactly one `LINKED`, remaining pending auto-reject, profile/status events present.
  - D+ withdraw/unlink changes state but does not produce notification back to D+.
  - Booking create valid/invalid, cancel eligible/ineligible/not-found; retry same message no duplicate; per-booking order preserved.
  - Tenant isolation and flag-off cause no unauthorized data/side effect.

### 5.2 Architecture & Docs

- KG `gf-system` records `tenant_profile`, `partner_link_request`, six Partner Link events/endpoints; KG `gf-sales` records booking relay schema/steps; `last_verified` updated.
- Demo script `Tracking/demos/ep-partner-link-w07-demo.md` created before wave-end.
- 3-in-1 versioning for every edited artifact; không tự thêm scope emit chứng từ SO/QT; không tạo retry UI trái với FEAT Link AC-32.

### 5.3 Quality Gates

- `cd services/gf-system && ./gradlew build checkstyleMain test` — coverage ≥80%.
- `cd services/gf-sales && ./gradlew build checkstyleMain test` — coverage ≥80%.
- `cd bffs/agg-garage-graph && npm run build && npm run typecheck && npm run lint` + Partner Link regression script PASS.
- `cd frontend/gf-gms-web && npm run build && npm run lint`.
- `cd mobile/gf-garage-app && flutter analyze && flutter test && flutter build apk --debug`.
- `scripts/scan-boundary.sh` exit 0; REVIEW P1=0; AC coverage 100% cho 3 core feature.

## 6. Demo Target

1. Driver Plus gửi `PARTNER_LINK.REQUEST.CREATE`; garage mở “Liên kết” trên Web/Mobile, thấy request `PENDING`.
2. Garage duyệt với điều khoản: link thành `LINKED`, D+ nhận `PARTNER_LINK.PROFILE.SYNC` và `PARTNER_LINK.STATUS.CHANGED`; request pending khác tự chuyển `REJECTED`.
3. Driver Plus gửi unlink: GMS đổi `UNLINKED` và không gửi notification loop lại.
4. Driver Plus gửi booking hợp lệ: danh sách booking GMS có lịch mới nguồn D+; retry cùng event không tạo bản sao.
5. D+ gửi cancel hợp lệ: booking chuyển `CANCELLED` với source đúng. Payload sai hoặc code không tồn tại: D+ nhận response correlated, không có side effect sai.

## 7. Dependencies (External to Wave)

| Dependency | Owner | Gate / fallback |
|---|---|---|
| Driver Plus Kafka sandbox, ACL, schema/correlation agreement | Driver Plus + Platform | Blocking TEST_EXECUTION/release. Không dùng fake HTTP để thay thế acceptance integration. |
| EP-FOUND tenant/company/invoice data | `gf-system` baseline | Profile sync read-only; missing profile follows architecture validation/error handling. |
| Existing booking lifecycle + outbox/inbox | `gf-sales` baseline | W07 extends contract additively; regression first. |
| Feature flag configuration | Delivery Authority + Platform | Default on, kill switch available before deploy. |

## 8. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| D+ chưa xác nhận correlation hoặc ACL | Treat as external integration blocker; run internal contract tests but do not declare E2E complete. |
| Duplicate/out-of-order Kafka | Inbox dedupe + stable event IDs + per-aggregate partition key + state guard tests. |
| Hai request được duyệt đồng thời | One transaction + partial unique index, concurrency integration test; no application-only check. |
| Dữ liệu tenant/PII sai | OriginTenant match guard, no full payload logging, security/isolation test. |
| Flag tắt chỉ một nửa relay | Single Booking flag controls inbound + outbound; explicit flag-off test. |
| Scope creep chứng từ SO/QT hoặc retry UI | Emit chứng từ vẫn deferred; retry UI đã chốt không thuộc W07. Mọi mở rộng phải qua design/CR, không tự thêm vào DEV. |

## 9. Carryover

Không carryover feature implementation từ W06: Inventory V2 không là dependency trực tiếp của W07. Khi `/wave-start 07`, Delivery Authority phải audit `STATE.json` và debt registry; chỉ item tác động trực tiếp `gf-system`, `gf-sales`, BFF hoặc client mới được đưa vào đây với disposition rõ ràng.

## 10. Post-Wave Actuals

*(Điền cuối wave: phạm vi hoàn thành, số message sandbox/E2E pass, latency/consumer lag, retry/duplicate result, flag usage, defect/carryover, actual effort theo từng boundary.)*

## 11. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-10 | 5 | Delivery Authority qua quyết định Business Authority | Đồng bộ FEAT Link v32: retry outbound và event `FAILED` xử lý ngầm ở backend/vận hành; không có badge/cảnh báo/nút thử lại trên Web/Mobile trong W07; state nghiệp vụ không rollback, UI tương lai phải qua CR/feature riêng. |
| 2026-08-10 | 4 | Delivery Authority qua quyết định Business Authority | Đồng bộ Entry Criteria theo FEAT v31/BR v21: lý do Từ chối/Hủy tối đa 2.000 ký tự, dùng chung `ERR-DPL-012` trên Web/Mobile/REST/GraphQL. |
| 2026-08-10 | 3 | Delivery Authority qua quyết định Business Authority | Đồng bộ Entry Criteria theo FEAT Link v30: chốt đủ 6 API/GraphQL operation canonical, dùng `rejectPartnerLinkRequest`/`/reject`, không còn `NEED NAMING`. |
| 2026-08-10 | 2 | Delivery Authority qua quyết định Business Authority | Đồng bộ semantic `PartnerLink:DriverPlus` off thành kill-switch toàn luồng theo FEAT AC-43/BR-DPL-CMN-008: chặn UI/API/action, từ chối request tạo mới bằng `ERR-DPL-011`, dừng outbound và giữ dữ liệu/audit. |
| 2026-08-10 | 1 | Delivery Authority (main agent, theo yêu cầu user) | Khởi tạo PKG-W07 theo cấu trúc PKG-W06: scope per-boundary, entry/exit gates, agent assignments, quality gates, demo, dependencies, risks và actuals. Chốt Kafka correlated response theo ADR-029 cho Partner Link/Booking; phân loại emit chứng từ SO/QT và retry UI là deferred do chưa có contract/UX decision. |
