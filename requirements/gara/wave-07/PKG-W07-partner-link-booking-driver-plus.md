---
type: execution
artifact_kind: work-package
status: PLANNED
version: 10
tier: T4
owner_authority: Delivery Authority
wave: "W07"
last_reviewed: "2026-08-12"
---

# PKG-W07 — Partner Link + Booking relay + Document sync Driver Plus

> Work package cho Wave 7: garage xử lý vòng đời liên kết Driver Plus trên Web/Mobile, `gf-sales` relay booking hai chiều và `gf-sales`/`gf-accounting` gửi chứng từ sau booking qua Kafka. M01 Vertical-Slice, timebox 5 ngày. Adapter tự-own tại boundary nghiệp vụ (`gf-system` cho Partner Link, `gf-sales` cho Booking/phiếu dịch vụ, `gf-accounting` cho phiếu quyết toán), theo ADR-029 + ADR-031; không thay bằng HTTP synchronous callback. Update Actuals (§10) khi kết thúc wave.

## 1. Overview

| Field | Value |
|---|---|
| Wave | `W07 — Partner Link + Booking relay + Document sync Driver Plus` |
| Epic / business capability | `EP-PARTNER-LINK` phase 1 + `EP-BOOKING` relay Driver Plus + đồng bộ chứng từ sau booking |
| Duration | 5 ngày làm việc (timebox cố định) |
| Features (3 core) | `FEAT-SYS-DRIVERPLUS-LINK` · `FEAT-BOOK-DRIVERPLUS-INBOUND` · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` |
| Product requirements liên quan | `FEAT-SO-DETAIL` AC-17 / BR-SO-DTL-007 · `FEAT-STL-CREATE` AC-3/AC-4 / BR-STL-CRE-008 |
| Regression-only (không count FEAT) | `FEAT-BOOK-EDIT` AC-15 — giữ `BOOKING.UPDATE.RESPONSE` cho sửa nội dung booking. |
| Boundaries affected | `gf-system` (Partner Link owner) · `gf-sales` (Booking + phiếu dịch vụ) · `gf-accounting` (phiếu quyết toán) · `agg-garage-graph` · `garage-web` · `garage-mobile` · Driver Plus external |
| Vertical slice | D+ gửi request liên kết → garage duyệt → D+ nhận profile/status; D+ gửi booking/hủy → GMS xử lý và phản hồi; hoàn thành phiếu dịch vụ/tạo phiếu quyết toán từ booking D+ → D+ nhận mã phiếu + URL tệp. |
| Entry gate | Bộ architecture Driver Plus W07 ratified, Kafka sandbox/ACL available, Product Kafka decision locked. |

## 2. Scope

### 2.1 Business Goal

Garage chủ động duyệt hoặc từ chối tài khoản Driver Plus được phép nhận hồ sơ doanh nghiệp, chỉ cho phép tối đa một liên kết hoạt động tại một thời điểm và lưu dấu vết mọi thay đổi. Lịch hẹn từ Driver Plus được ghi nhận đúng dữ liệu khách cung cấp; khi lịch bị hủy hoặc trạng thái thay đổi, Driver Plus nhận phản hồi đúng. Khi garage hoàn thành phiếu dịch vụ hoặc tạo phiếu quyết toán cho booking nguồn Driver+, Driver+ nhận từng mã phiếu và URL tải tệp để lưu riêng trong hồ sơ số của xe. Retry không tạo liên kết, booking hay chứng từ trùng.

### 2.2 Technical Scope

#### 2.2.1 Backend — `gf-system`: Partner Link

- Nhận Kafka `AC-DEV-PARTNER-LINK-EVENTS`, filter bắt buộc `MessageGroup=PARTNER_LINK` + `MessageStep`:
  - inbound `PARTNER_LINK.REQUEST.CREATE`, `.REQUEST.WITHDRAW`, `.UNLINK`;
  - outbound `PARTNER_LINK.REQUEST.RESPONSE`, `.PROFILE.SYNC`, `.STATUS.CHANGED`.
- `PartnerLinkDriverPlusConsumer`: `OriginTenantId`/`data.tenantId` **không bắt buộc ở cả 3 step inbound** (v3, ADR-029 gap G4 — D+ không quản lý tenantId GMS) — resolve tenant qua `partnerAccountPhone` (`REQUEST.CREATE`) hoặc lookup theo `requestCode` (`WITHDRAW`/`UNLINK`); inbox dedupe; message sai nghiệp vụ ack + response event, lỗi hạ tầng không ack để redeliver.
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

#### 2.2.3 Backend — `gf-sales` + `gf-accounting`: Document sync

- Topic `AC-DEV-DOCUMENT-EVENTS`, `MessageGroup=DOCUMENT`, partition key `Document-{documentCode}` theo ADR-031.
- `gf-sales` phát `DOCUMENT.SERVICE_ORDER.SYNC` khi phiếu dịch vụ nguồn booking Driver+ hoàn thành. **Không có** step thu hồi (`DOCUMENT.SERVICE_ORDER.REVOKED` đã bị loại bỏ 2026-08-11, ADR-031 v6 — premise "hủy phiếu quyết toán" không phải luồng nghiệp vụ tồn tại).
- `gf-accounting` phát `DOCUMENT.SETTLEMENT.SYNC` khi tạo phiếu quyết toán từ SO nguồn Driver+; cặp phiếu quyết toán phát riêng từng phiếu. Điều kiện nguồn booking lấy qua snapshot REST `for-settlement`, không đọc DB `gf-sales`.
- Payload gửi mã phiếu + URL tuyệt đối tải tệp, `fileName`, `mimeType`, `checksum`, `expiresAt`; không nhúng binary. Hai loại phiếu độc lập, không chờ nhau và không ghi đè.
- Mỗi boundary render PDF, upload `ct-file-storage`, ghi outbox và giữ `eventId` ổn định theo ADR-031. Feature flag `Document:DriverPlus` độc lập với hai flag Partner Link/Booking.

#### 2.2.4 BFF — `agg-garage-graph`

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

#### 2.2.5 Web — `garage-web`

- Menu top navigation “Liên kết” chỉ hiện khi flag on; trang Driver Plus list không search/pagination; detail và modal riêng cho Duyệt, Từ chối, Đồng bộ lại, Hủy.
- Render đúng badge/lifecycle `PENDING`, `LINKED`, `REJECTED`, `UNLINKED`; dùng `availableActions` server-side, không tự suy luận quyền action ở client.
- Reuse-First gate cho table/card, status badge, modal confirmation và empty/loading/error state; accessibility và testid theo convention hiện hữu.
- Booking không có route mới: regression list/detail booking baseline hiển thị booking D+ và status đã relay.

#### 2.2.6 Mobile — `garage-mobile`

- Bottom-nav tab “Liên kết”, màn list/filter/detail full screen và 4 action tương đương Web nhưng dùng navigation/mobile component chuẩn.
- Dùng chung 6 GraphQL operation qua `agg-garage-graph`; flag off ẩn tab/surface. Không tạo BFF/API riêng.
- Locale VN/EN, Semantics labels, loading/empty/error states và widget tests cho lifecycle/action matrix.

### 2.3 Out of Scope / Explicitly Deferred

- UI biểu thị retry/error delivery của Partner Link: **đã chốt không triển khai trong W07**. Retry và event `FAILED` xử lý ngầm ở backend/vận hành; Web/Mobile không có badge, cảnh báo hoặc nút thử lại. Nếu cần UI trong tương lai phải mở CR/feature riêng.
- Màn quản trị Driver Plus, D+ customer push notification, hoặc đồng bộ booking do kênh khác tạo.
- **Compliance/PII disposition với Driver Plus** (CR-20260812-03, backfill gap `GAP-W07-GSY-07`): Provider SLA chưa chính thức, DPA chưa xác nhận ký, data retention phía D+ chưa đặc tả, chưa có right-to-erasure flow (`PARTNER_LINK.DATA.PURGE`) khi Hủy liên kết — 4 hạng mục thuộc phạm vi Legal/BizOps, tracked ngoài W07 exit criteria, không block DEV kỹ thuật. Chi tiết: `Product/features/FEAT-SYS-DRIVERPLUS-LINK.md` §12 Cross-tier coordination, nguồn `Architecture/integrations/INTEG-EXT-driver-plus.md` §9-§10.

### 2.4 Contract & Implementation Gates

1. `INTEG-EXT-driver-plus.md` là SSOT external transport: topic/step/header/correlation/idempotency/order/retry, không duplicate schema ở PKG.
2. Mọi consumer filter cả `MessageGroup` và `MessageStep`; self-produced outbound message phải ack + skip.
3. Retry transport không rollback business state đã commit. D+ consumer phải dedupe `eventId`/correlation; GMS consumer phải dedupe inbox.
4. Tenant mismatch là fail có kiểm soát, không side effect. Không log PII payload đầy đủ.
5. Reuse-first trước UI composition; contract mock Day 1, wire thật khi BFF/REST đã stable.
6. Document sync tuân thủ ADR-031: `gf-sales`/`gf-accounting` tự emit, URL tuyệt đối thay binary, không đọc DB cross-boundary và không phát chứng từ ngoài booking nguồn Driver+.

## 3. Entry Criteria

- [ ] `Tracking/ARCH-REVIEW-W07.md` đang P0=0, P1=0; các P2 cross-reference/frontmatter đã được fix; SA ratify/merge toàn bộ W07 Architecture trước `/wave-start 07`.
- [ ] `ADR-029` + `ADR-030` + `ADR-031` ACCEPTED; `INTEG-EXT-driver-plus.md` v5; HLD/API/event của `gf-system`, `gf-sales`, `gf-accounting`; `agg-garage-graph` §3k; INTEG-FE §3.9 và INTEG-MOB §3.6 đã lock.
- [ ] Product chốt Kafka + kill-switch + API naming + giới hạn lý do + xử lý retry ngầm; `FEAT-SO-DETAIL` v6 và `FEAT-STL-CREATE` v5 đã đóng marker event/file theo ADR-031.
- [ ] D+ sandbox cho cả 3 topic, ACL/SASL, producer/consumer group, schema version, test tenant, correlation/dedupe và handler cho các step document được Driver Plus + Platform xác nhận.
- [ ] Feature flags `PartnerLink:DriverPlus`, `Booking:DriverPlus`, `Document:DriverPlus` tồn tại, default on và có emergency kill-switch do Delivery Authority sở hữu.
- [ ] KG update scope `gf-system` + `gf-sales` + `gf-accounting` được tạo trước DEV; `SERVICE-BOUNDARY-MATRIX` module Partner Link/document sync được backfill theo governance.
- [ ] Branch, `STATE.wave=07` và infrastructure scope đã được Delivery Authority mở khi thực sự bắt đầu; PKG này đã populated.

## 4. Agent Assignments

### 4.1 DEV Agents

| Agent | Boundary | Tasks | Estimated effort |
|---|---|---|---|
| `agent-dev-gf-system` | `gf-system` | Day 1 contract/Kafka consumer + schema/Flyway; Day 2 lifecycle + six REST endpoints; Day 3 approve cascade/outbox/profile sync; Day 4 flags, audit, tests; Day 5 KG/review fixes. | ~32h |
| `agent-dev-gf-sales` | `gf-sales` | Booking relay; document publisher phiếu dịch vụ; render/upload URL; `SERVICE_ORDER.SYNC` (không REVOKED); additive snapshot `for-settlement`; idempotency/flags/tests/KG. | ~34h |
| `agent-dev-gf-accounting` | `gf-accounting` | Document publisher phiếu quyết toán; đọc snapshot nguồn booking; render/upload URL; `SETTLEMENT.SYNC`; cặp phiếu phát riêng; outbox/flag/tests/KG. | ~20h |
| `agent-dev-agg-garage-graph` | BFF | Six Partner Link operations, auth/error/flag passthrough, regression script, KG. | ~14h |
| `agent-dev-garage-web` | Web | Navigation, list/detail, 4 action dialogs, flag hide, baseline booking regression, a11y. | ~22h |
| `agent-dev-garage-mobile` | Mobile | Bottom tab, list/filter/detail, 4 actions, flag hide, locale/semantics/widget tests. | ~24h |

**Parallel safety**: `gf-system`, `gf-sales` và `gf-accounting` start song song sau contract gate Day 1; `gf-accounting` chỉ wire emit sau khi additive snapshot `for-settlement` của `gf-sales` ổn định. BFF scaffolds từ REST contract Day 1; Web/Mobile dùng mock Day 1–2 rồi wire GraphQL. External sandbox integration là critical path từ Day 3; không team nào tự đổi event step trong code.

### 4.2 REVIEW Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-review-backend` | Ba Java boundary: Partner Link/Booking + document render/upload/outbox, snapshot REST cross-boundary, URL/checksum/TTL, idempotency, no binary/PII log và ba kill-switch. | Post-DEV Day 4–5 |
| `agent-review-garage-web` | Six operation mapping, state/action matrix, flag hides menu, no invented retry UI, reuse/a11y/testid. | Post-DEV Day 4–5 |
| `agent-review-garage-mobile` | Tab/navigation, list/filter/detail, 4 actions, flag hide, locale/semantics and no unsupported UI state. | Post-DEV Day 4–5 |

### 4.3 TEST Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-test-api` | 6 Partner Link REST + 6 GraphQL op; 14-field booking; 14 Driver+ MessageStep; document payload URL/checksum/expiry và snapshot `for-settlement`. | TEST_PLANNING Day 3 |
| `agent-test-e2e` | Link + booking hai chiều; hoàn thành SO/tạo cặp settlement nguồn D+ → D+ nhận từng chứng từ; retry không tạo bản trùng. | TEST_PLANNING Day 3 |
| `agent-test-isolation` | Cross-tenant request/code access, OriginTenant mismatch and duplicate message. | TEST_PLANNING Day 4 |
| `agent-test-security` | ACL/auth, PII masking, external payload validation, flag-off behavior. | TEST_PLANNING Day 4 |
| `agent-test-ui` | Web/Mobile state badges, action availability, accessibility, flag hide. | TEST_PLANNING Day 4 |

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests

- **gf-system**: 3 inbound + 3 outbound Partner Link steps, six REST endpoints, tenant profile source read, audit/history, inbox/outbox, single-active-link atomic guard and `PartnerLink:DriverPlus` gate.
- **gf-sales**: Booking relay đầy đủ; `DOCUMENT.SERVICE_ORDER.SYNC` (không có step thu hồi — `REVOKED` loại bỏ 2026-08-11, ADR-031 v6); render/upload URL; additive snapshot `for-settlement`; `Booking:DriverPlus` + `Document:DriverPlus` gate.
- **gf-accounting**: `DOCUMENT.SETTLEMENT.SYNC`; xác định nguồn booking qua snapshot REST; cặp phiếu emit riêng; render/upload URL, outbox/idempotency và `Document:DriverPlus` gate.
- **agg-garage-graph**: 2 query + 4 mutation Partner Link operations, contract-pure passthrough and regression script PASS.
- **garage-web/mobile**: full Partner Link lifecycle surface, feature flag hide, no booking screen expansion; baseline booking regression verified.
- **Cross-boundary integration**:
  - Link create → `PENDING` + correlated success; create while linked → `ERR-DPL-010` without record.
  - Approve concurrent pending requests → exactly one `LINKED`, remaining pending auto-reject, profile/status events present.
  - D+ withdraw/unlink changes state but does not produce notification back to D+.
  - Booking create valid/invalid, cancel eligible/ineligible/not-found; retry same message no duplicate; per-booking order preserved.
  - Hoàn thành SO nguồn D+ → một `SERVICE_ORDER.SYNC`; tạo một/cặp phiếu QT → một/hai `SETTLEMENT.SYNC`; mỗi payload có URL tuyệt đối, checksum và expiry; hai loại phiếu không ghi đè.
  - Không có step thu hồi cho cả 2 loại phiếu (`SERVICE_ORDER.REVOKED` + `SETTLEMENT.REVOKED` đều đã loại bỏ — ADR-031 v6): huỷ SO hoặc huỷ phiếu QT không publish event nào.
  - Tenant isolation and flag-off cause no unauthorized data/side effect.

### 5.2 Architecture & Docs

- KG `gf-system` ghi Partner Link; KG `gf-sales` ghi booking relay + document SO; KG `gf-accounting` ghi document settlement; `last_verified` cập nhật.
- Demo script `Tracking/demos/ep-partner-link-w07-demo.md` created before wave-end.
- 3-in-1 versioning cho mọi artifact; document sync bám ADR-031, không tạo retry UI trái với FEAT Link AC-32.

### 5.3 Quality Gates

- `cd services/gf-system && ./gradlew build checkstyleMain test` — coverage ≥80%.
- `cd services/gf-sales && ./gradlew build checkstyleMain test` — coverage ≥80%.
- `cd services/gf-accounting && ./gradlew build checkstyleMain test` — coverage ≥80%.
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
6. Hoàn thành phiếu dịch vụ của booking D+: D+ nhận `DOCUMENT.SERVICE_ORDER.SYNC` với mã phiếu + URL tải tệp.
7. Tạo cặp hai phiếu quyết toán: D+ nhận hai `DOCUMENT.SETTLEMENT.SYNC` riêng, giữ độc lập với phiếu dịch vụ; retry cùng event không tạo bản ghi trùng.

## 7. Dependencies (External to Wave)

| Dependency | Owner | Gate / fallback |
|---|---|---|
| Driver Plus Kafka sandbox, ACL, schema/correlation agreement | Driver Plus + Platform | Blocking TEST_EXECUTION/release. Không dùng fake HTTP để thay thế acceptance integration. |
| EP-FOUND tenant/company/invoice data | `gf-system` baseline | Profile sync read-only; missing profile follows architecture validation/error handling. |
| Existing booking lifecycle + outbox/inbox | `gf-sales` baseline | W07 extends contract additively; regression first. |
| `ct-file-storage` upload + URL tuyệt đối | Platform | `folderType` đã chốt dùng chung `SO` cho cả 2 loại chứng từ — phiếu dịch vụ (`gf-sales`) + phiếu quyết toán (`gf-accounting`) — 2026-08-11 (ADR-031 v5, Open Question #2 đóng hoàn toàn). Còn lại: object availability và contract expiry trước document E2E. |
| Snapshot SO cho settlement | `gf-sales` → `gf-accounting` | Additive `bookingCode`/`externalBookingId`/`isDriverPlusSource` deploy trước producer accounting. |
| Feature flag configuration | Delivery Authority + Platform | Ba flag default on, kill switch available trước deploy. |

## 8. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| D+ chưa xác nhận correlation hoặc ACL | Treat as external integration blocker; run internal contract tests but do not declare E2E complete. |
| Duplicate/out-of-order Kafka | Inbox dedupe + stable event IDs + per-aggregate partition key + state guard tests. |
| Hai request được duyệt đồng thời | One transaction + partial unique index, concurrency integration test; no application-only check. |
| Dữ liệu tenant/PII sai | OriginTenant match guard, no full payload logging, security/isolation test. |
| Flag tắt chỉ một nửa relay/document | Test độc lập cả `Booking:DriverPlus` và `Document:DriverPlus`; tắt document không làm dừng booking. |
| Render/upload tệp thất bại | Không rollback trạng thái nghiệp vụ; phải có bằng chứng xử lý/retry theo contract trước khi đạt Exit W07. |
| Scope creep retry UI hoặc resend inbound | Retry UI và `DOCUMENT.RESEND.REQUEST` không thuộc W07; mọi mở rộng phải qua CR. |

## 9. Carryover

Không carryover feature implementation từ W06: Inventory V2 không là dependency trực tiếp của W07. Khi `/wave-start 07`, Delivery Authority phải audit `STATE.json` và debt registry; chỉ item tác động trực tiếp `gf-system`, `gf-sales`, BFF hoặc client mới được đưa vào đây với disposition rõ ràng.

## 10. Post-Wave Actuals

*(Điền cuối wave: phạm vi hoàn thành, số message sandbox/E2E pass, latency/consumer lag, retry/duplicate result, flag usage, defect/carryover, actual effort theo từng boundary.)*

## 11. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-12 | 10 | main agent — self-audit theo yêu cầu user, sau ADR-029 v3 (gap G4) | §2.2.1 bullet `PartnerLinkDriverPlusConsumer` sửa lại mô tả validate `OriginTenantId` — không còn đúng cho `WITHDRAW`/`UNLINK` (D+ không quản lý tenantId GMS ở bất kỳ step nào, ADR-029 v3 gap G4). Đồng bộ `ADR-029` v3 + `gf-system-events.md` v7 + `_IMPLEMENTATION-CHECKLIST-W07-gf-system.md` v2. |
| 2026-08-11 | 8 | main-agent (per user sonhoang — chốt qua `/warm-up gf-sales --phase A` gap GAP-W07-GSL-02) | **Loại bỏ step `DOCUMENT.SERVICE_ORDER.REVOKED`** khỏi scope document sync (ADR-031 v6): premise duy nhất khiến step khả đạt ("hủy phiếu quyết toán" → reopen SO) không phải luồng nghiệp vụ tồn tại. §2.2.3 bullet gf-sales sửa (bỏ REVOKED); §4.1 `agent-dev-gf-sales` task description sửa + effort ~36h→~34h; §5.1 gf-sales exit criteria sửa (bỏ REVOKED); §5.1 cross-boundary integration bullet "SO đã gửi sau đó bị hủy" thay bằng "không có step thu hồi cho cả 2 loại phiếu". §7 Dependencies row `ct-file-storage`: cập nhật `folderType` — nay chốt dùng chung `SO` cho cả gf-sales + gf-accounting (ADR-031 v5, Open Question #2 đóng hoàn toàn — closes stale note từ v7 "phía gf-accounting vẫn OPEN"). Cross-ref: `Tracking/warm-up/WAVE07/W07-gf-sales-warm-up-phaseA.md` GAP-W07-GSL-02 (RESOLVED). |
| 2026-08-11 | 7 | Delivery Authority (sonhoang) qua `/warm-up gf-sales --phase A` gap GAP-W07-GSL-03 | Chốt `folderType="SO"` cho upload `ct-file-storage` phía `gf-sales` (phiếu dịch vụ) — thay đề xuất `SERVICE_ORDERS` ở ADR-031 v2 Open Question #2. §7 Dependencies row `ct-file-storage` cập nhật. Phía `gf-accounting` (`SETTLEMENTS`) vẫn OPEN, không thuộc quyết định này — xem `GAP-W07-GAC-02`. |
| 2026-08-10 | 6 | Delivery Authority qua quyết định Business Authority | **Đưa document sync vào scope/Exit W07 theo ADR-031 v2**: thêm `gf-accounting`, `AC-DEV-DOCUMENT-EVENTS`, 3 MessageStep, URL tệp thay binary, `Document:DriverPlus`, snapshot `for-settlement`, DEV/REVIEW/TEST assignment, quality gate, dependency và demo; bỏ toàn bộ wording deferred do thiếu Architecture contract. |
| 2026-08-10 | 5 | Delivery Authority qua quyết định Business Authority | Đồng bộ FEAT Link v32: retry outbound và event `FAILED` xử lý ngầm ở backend/vận hành; không có badge/cảnh báo/nút thử lại trên Web/Mobile trong W07; state nghiệp vụ không rollback, UI tương lai phải qua CR/feature riêng. |
| 2026-08-10 | 4 | Delivery Authority qua quyết định Business Authority | Đồng bộ Entry Criteria theo FEAT v31/BR v21: lý do Từ chối/Hủy tối đa 2.000 ký tự, dùng chung `ERR-DPL-012` trên Web/Mobile/REST/GraphQL. |
| 2026-08-10 | 3 | Delivery Authority qua quyết định Business Authority | Đồng bộ Entry Criteria theo FEAT Link v30: chốt đủ 6 API/GraphQL operation canonical, dùng `rejectPartnerLinkRequest`/`/reject`, không còn `NEED NAMING`. |
| 2026-08-10 | 2 | Delivery Authority qua quyết định Business Authority | Đồng bộ semantic `PartnerLink:DriverPlus` off thành kill-switch toàn luồng theo FEAT AC-43/BR-DPL-CMN-008: chặn UI/API/action, từ chối request tạo mới bằng `ERR-DPL-011`, dừng outbound và giữ dữ liệu/audit. |
| 2026-08-10 | 1 | Delivery Authority (main agent, theo yêu cầu user) | Khởi tạo PKG-W07 theo cấu trúc PKG-W06: scope per-boundary, entry/exit gates, agent assignments, quality gates, demo, dependencies, risks và actuals. Chốt Kafka correlated response theo ADR-029 cho Partner Link/Booking; phân loại emit chứng từ SO/QT và retry UI là deferred do chưa có contract/UX decision. |
