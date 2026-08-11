---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-08-05"
---

# ADR-029: Giao thức tích hợp GMS ↔ Driver Plus — Kafka adapter tự-own tại boundary sở hữu + correlated response event

## Status

ACCEPTED — 2026-08-05

Áp dụng cho **cả 2 nửa** của tích hợp Driver Plus:

- **Partner link** (`gf-system`) — `EP-PARTNER-LINK` / `FEAT-SYS-DRIVERPLUS-LINK` (mới, W07).
- **Booking relay** (`gf-sales`) — `EP-BOOKING` / `FEAT-BOOK-DRIVERPLUS-INBOUND` + `FEAT-BOOK-DRIVERPLUS-OUTBOUND` (rewrite cơ chế đang production).

## Context

1. **Câu hỏi chính**: giao thức nào cho luồng 2 chiều GMS ↔ Driver Plus (external), và boundary nào own adapter?
2. **Câu hỏi phụ**: Product mô tả một số lỗi phải "trả lỗi **đồng bộ** trong response của request", nhưng kênh inbound là fire-and-forget — mô hình hoá thế nào mà không phải cutover 2 bên đồng thời?

**Constraints từ Product layer:**

- `BR-GF-SYSTEM.md` §1 `CB-SYS-004` / `CB-SYS-005` / `CB-SYS-007` / `CB-SYS-008` / `CB-SYS-009` — cả 5 rule đều ghi "Giao thức … Architect quyết", kèm ràng buộc bắt buộc: adapter validation gate (PC-4 / BR-CORE-012), outbox/inbox mandatory (BR-CORE-005), no PII leak (BR-CORE-011).
- `FEAT-SYS-DRIVERPLUS-LINK.md` §4 API Reference — 5 dòng `NEED CONFIRMATION` cho inbound/outbound.
- `FEAT-BOOK-DRIVERPLUS-INBOUND.md` §4 + `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` §4 — `NEED CONFIRMATION Architecture` về việc **giữ nguyên hay đổi** tên event/message-step khi cutover sang thiết kế mới.
- Lỗi cần phản hồi ngược về Driver Plus: `ERR-DPL-010` (AC-34 single-active guard chặn), `ERR-BOOK-001` (AC-10 payload đặt lịch không hợp lệ), `ERR-BOOK-002` (AC-11 không tìm thấy booking cho yêu cầu hủy) — cả 3 đều display type `API_RESPONSE` trong `Product/Commons/ERROR-CODE-REGISTRY.md` §5/§6.

**Constraints từ runtime / source evidence:**

- **Precedent đang chạy production**: `gf-sales` consume trực tiếp event Driver+ trên `AC-DEV-BOOKING-EVENTS` qua `BookingDriverPlusConsumer` — **KHÔNG** đi qua `gf-erp-agent` (`Architecture/events/gf-sales-events.md` §2.2 rows 14-15).
- `gf-system` **đã có sẵn** đủ hạ tầng outbox/inbox: bảng `outbox_events` + `OutboxService`/`OutboxEventListener` (AFTER_COMMIT) + `OutboxScheduler` 60s fallback, bảng `inbox_event` + enum `InboxEventType` (`Architecture/data/gf-system-data-model.md` §2 + §4; `Architecture/events/gf-system-events.md` §1 Producer summary). Tái dùng 100%, chỉ thêm enum value + migration.
- `Architecture/events/_CONVENTIONS.md` §2.3 — external bridge: "producer external publish vào topic theo external naming convention; internal service consume + translate".
- `KafkaMessageWrapper` envelope + headers `MessageGroup` / `MessageStep` / `OriginTenantId` / `OriginMessageCode` là canonical (`_CONVENTIONS.md` §3).

**Business rules liên quan**: BR-CORE-005, BR-CORE-011, BR-CORE-012, BR-DPL-CMN-007, BR-DPL-NOTI-001..004, BR-BOOK-022..024, BR-CROSS-006.

## Decision

**Kafka cho cả 2 chiều, adapter do chính boundary sở hữu nghiệp vụ tự own (`gf-system` cho partner-link, `gf-sales` cho booking) — KHÔNG thêm hop qua `gf-erp-agent`. Mô hình "response đồng bộ" mà Product mô tả được hiện thực bằng correlated response event trên cùng topic, KHÔNG phải HTTP response.**

Cụ thể:

- **Topic**:
  - Partner link: topic **mới** `AC-DEV-PARTNER-LINK-EVENTS` (naming theo `_CONVENTIONS.md` §2.1 `AC-DEV-{DOMAIN}-EVENTS`), `MessageGroup=PARTNER_LINK`.
  - Booking: **giữ nguyên** topic production `AC-DEV-BOOKING-EVENTS`, `MessageGroup=BOOKING`.
- **Ownership adapter**: `gf-system` own consumer/producer partner-link; `gf-sales` own consumer/producer booking. `gf-erp-agent` **KHÔNG** tham gia — boundary đó phục vụ bridge ERP/COP, không phải Driver Plus.
- **Envelope**: `KafkaMessageWrapper` + headers `MessageGroup` + `MessageStep` + `OriginTenantId` + `OriginMessageCode`. Consumer **BẮT BUỘC** filter `MessageGroup` + `MessageStep` trước khi xử lý (Critical Rule #18). `data.tenantId` phải khớp `headers.OriginTenantId` (`_CONVENTIONS.md` §3.5) — lệch = fail có kiểm soát, KHÔNG side-effect im lặng.
- **Partition key**: `PartnerLink-{requestCode}` / `Booking-{bookingCode}` (aggregate code, `_CONVENTIONS.md` §4.1) — KHÔNG dùng `tenantId` thuần.
- **Adapter validation gate (PC-4 / BR-CORE-012)**: đặt tại inbound consumer của chính boundary sở hữu, chạy **TRƯỚC** khi ghi domain table. Gate partner-link enforce single-active guard `BR-DPL-CMN-007`; gate booking enforce 5 trường bắt buộc + bước 15 phút (`FEAT-BOOK-DRIVERPLUS-INBOUND` AC-2 + EC-3).
- **Correlated response event (thay cho "HTTP response đồng bộ")**: mỗi luồng inbound có 1 `MessageStep` phản hồi trên **cùng topic**, payload shape thống nhất:

  ```json
  { "success": false, "error": { "code": "ERR-DPL-010", "message": "…" }, "correlation": { "requestEventId": "uuid", "originMessageCode": "LKD-2026-001" } }
  ```

  | Luồng inbound | Step phản hồi | Error code khi từ chối |
  |---|---|---|
  | Partner link — tạo yêu cầu | `PARTNER_LINK.REQUEST.RESPONSE` | `ERR-DPL-010` |
  | Booking — tạo lịch hẹn | `BOOKING.CREATE.RESPONSE` *(đã có production, tái dùng field `error` vốn luôn null)* | `ERR-BOOK-001` |
  | Booking — yêu cầu hủy | `BOOKING.CANCEL.RESPONSE` *(step mới, shape đối xứng)* | `ERR-BOOK-002` |

  Correlation key = `data.correlation.requestEventId` (= `messageId` của message inbound) + `headers.OriginMessageCode`. Driver Plus dedupe/khớp theo cặp này.
- **Notification outbound sang Driver Plus** (CB-SYS-009 / BR-DPL-NOTI-001..004): đi **trực tiếp** từ `gf-system` sang Driver Plus trên cùng topic partner-link (step `PARTNER_LINK.STATUS.CHANGED`, field `notification.message` chứa wording tiếng Việt đã chốt) — **KHÔNG** route qua `gf-notification`. Lý do: `gf-notification` phục vụ user nội bộ GMS (in-app/push của tài khoản GMS), không phải tài khoản đối tác ngoài; đẩy qua đó sẽ tạo audience không tồn tại trong domain của nó.
- **Reliability**: mọi outbound state-changing ghi `outbox_events` trong cùng transaction với mutation (ADR-004); mọi inbound dedupe qua `inbox_event` theo `messageId` trước khi xử lý. Outbound fail **KHÔNG** rollback state cục bộ (FEAT-SYS-DRIVERPLUS-LINK AC-32 + FEAT-BOOK-DRIVERPLUS-OUTBOUND AC-7/AC-8 + BR-BOOK-024).
- **Cutover booking (brownfield)**: **KHÔNG đổi tên** step đang chạy production — `BOOKING.CREATE.REQUEST`, `BOOKING.CANCELLED`, `BOOKING.CREATE.RESPONSE`, `BOOKING.CHANGE.STATUS` giữ nguyên. Delta chỉ **additive**: (a) payload inbound tài liệu hoá đủ 14 trường; (b) `BookingStatusChanged` thêm `cancelSource` + `driverPlusStatus`; (c) thêm 1 step mới `BOOKING.CANCEL.RESPONSE`; (d) `BOOKING.CREATE.RESPONSE` tài liệu hoá nhánh `success=false`. Không có rename/remove field → không cần cutover 2 bên đồng thời (ADR-013 deprecation path không áp dụng).

**Threshold để re-evaluate:**

- Driver Plus xác nhận relay (`FEAT-DP-035`) **không** đọc được response event mà chỉ hỗ trợ HTTP response đồng bộ → CR riêng đổi nhánh inbound sang REST webhook (`/protected/v1/partner-links` + `x-api-key`), giữ nguyên nhánh outbound Kafka.
- Số lượng đối tác ngoài vượt 1 (giai đoạn 2 — tab "Đối tác khác") → cân nhắc tách adapter thành module chung / quay lại `gf-erp-agent`.

## Alternatives considered

| Phương án | Lý do loại |
|---|---|
| REST webhook 2 chiều (`gf-system` expose `/protected/v1/...`, gọi ngược D+ qua HTTP) | Trả được lỗi đồng bộ đúng chữ Product, nhưng: (a) lệch precedent production `gf-sales` đang chạy Kafka; (b) phải tự xây retry/DLQ/circuit-breaker mới trong khi outbox/inbox đã có sẵn; (c) cutover booking sẽ phải đồng thời 2 bên. |
| Route qua `gf-erp-agent` (PC-4 literal) | Thêm 1 hop cross-boundary + 1 lần translate schema mà không thêm giá trị; `gf-erp-agent` scope là ERP/COP bridge (`SERVICE-BOUNDARY-MATRIX` row 14), Driver Plus không thuộc domain đó; `gf-sales` đã có precedent bypass. PC-4 yêu cầu **validation gate**, không yêu cầu **service** cụ thể — gate được giữ nguyên, chỉ đặt tại boundary sở hữu. |
| Notification D+ đi qua `gf-notification` | `gf-notification` không có audience "tài khoản Driver Plus"; BR-DPL-NOTI ghi rõ chủ thể gửi là `gf-system`. |
| Đổi tên step booking khi cutover (`BOOKING.CREATE.REQUEST.V2` …) | Breaking change 2 phía, cần deploy đồng thời; delta thực tế thuần additive nên không cần. |

## Consequences

**Tích cực:**

- Tái dùng 100% hạ tầng outbox/inbox sẵn có của `gf-system` — chi phí thêm chỉ là enum value + migration + consumer class.
- Booking rewrite không cần cutover đồng thời với Driver Plus: field mới additive, consumer cũ bỏ qua field lạ (Jackson ignore-unknown).
- 1 convention envelope duy nhất cho cả 2 nửa → test/observability/runbook dùng chung.

**Tiêu cực / gap:**

- "Response" không còn đồng bộ theo nghĩa HTTP: Driver Plus phải giữ state chờ correlated event thay vì đọc status code. **Cần D+ team xác nhận** (xem Open Question OQ-1 trong `Tracking` handoff của wave).
- Topic `AC-DEV-PARTNER-LINK-EVENTS` dùng chung cho cả inbound (D+ → GMS) và outbound (GMS → D+) — cả 2 phía **bắt buộc** filter `MessageGroup` + `MessageStep`, giống pattern `AC-DEV-TENANT-INVOICE-INFO` đang chạy (`gf-system-events.md` §3.7 Critical use case). Không filter = xử lý nhầm message của chính mình.
- Outbound at-least-once qua `OutboxScheduler` fallback 60s → notification có thể đến muộn tới 60s khi AFTER_COMMIT listener fail.

## References

- `Product/epics/EP-PARTNER-LINK.md` §5.2 · `Product/features/FEAT-SYS-DRIVERPLUS-LINK.md` §4 · `FEAT-BOOK-DRIVERPLUS-INBOUND.md` §4 · `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` §4
- `Product/business-rules/BR-GF-SYSTEM.md` §1 CB-SYS-004..009 · `BR-GF-SALES.md` §1 BR-CROSS-006
- `Architecture/events/_CONVENTIONS.md` §2, §3, §4, §5 · `Architecture/events/gf-system-events.md` · `Architecture/events/gf-sales-events.md`
- `Architecture/integrations/INTEG-EXT-driver-plus.md` (contract chi tiết)
- ADR-004 (Kafka event-driven integration) · ADR-005 (no shared outbox lib) · ADR-013 (API deprecation path — không áp dụng vì delta additive)
- ADR-030 (tenant profile SoT — nguồn dữ liệu cho `PARTNER_LINK.PROFILE.SYNC`)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-05 | 1 | Architecture Authority (agent-arch-author) | Initial — chốt Kafka + adapter tự-own + correlated response event cho cả partner-link (`gf-system`) và booking relay (`gf-sales`), theo USER ANSWERS Q1/Q2 (2026-08-05). Resolve CB-SYS-004/005/007/008/009 + `FEAT-SYS-DRIVERPLUS-LINK` §4 (5 dòng NEED CONFIRMATION) + `FEAT-BOOK-DRIVERPLUS-*` §4 (tên event/step khi cutover). |
