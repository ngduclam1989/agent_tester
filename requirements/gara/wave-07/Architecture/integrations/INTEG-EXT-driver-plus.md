---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 5
tier: T1
owner_authority: Architecture Authority
boundary: "cross-boundary (gf-system, gf-sales, gf-accounting)"
provider: "Driver Plus"
last_reviewed: "2026-08-10"
supersedes: "none"
---

# Integration — GMS ↔ Driver Plus (External Service)

> Document tích hợp giữa **GMS** (2 boundary nội bộ: `gf-system` + `gf-sales`) và **Driver Plus** (app tài xế, hệ thống ngoài).
> Không document chi tiết feature business — chỉ document **contract, security, failure handling, observability**.
>
> **3 nửa tích hợp, 1 đối tác, 1 convention envelope** (ADR-029 + ADR-031):
> - **Partner link** (`gf-system`, MỚI W07) — vòng đời yêu cầu liên kết `LKD-YYYY-NNN` + đồng bộ hồ sơ garage + notification.
> - **Booking relay** (`gf-sales`, **ĐANG CHẠY PRODUCTION**, rewrite W07) — nhận đặt lịch/hủy từ khách + phản hồi trạng thái ngược.
> - **Document sync** (`gf-sales` + `gf-accounting`, MỚI ad-hoc 2026-08-10 — ADR-031) — đẩy **phiếu dịch vụ** + **phiếu quyết toán** (mã phiếu + tệp) sang D+ để ghi hồ sơ số của xe.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **Driver Plus** — ứng dụng tài xế; khách hàng đặt lịch garage + tài khoản đối tác gửi yêu cầu liên kết |
| Provider docs | Nội bộ team Driver+: `FEAT-DP-034` (biểu mẫu đặt lịch) · `FEAT-DP-035` (relay 2 chiều) · `FEAT-DP-046` (ghi VAP) — **ngoài repo này** |
| Provider status page | N/A (đối tác nội bộ tập đoàn, không có status page công khai) |
| Used by boundary | `gf-system` (partner link — W07) · `gf-sales` (booking relay — production; document sync — ADR-031) · `gf-accounting` (document sync — ADR-031) |
| Module / class | `gf-system`: `PartnerLinkDriverPlusConsumer` (DESIGN) · `gf-sales`: `BookingDriverPlusConsumer` (production) + document publisher (DESIGN) · `gf-accounting`: document publisher (DESIGN) |
| Sandbox URL | N/A — **không phải HTTP integration**. Kênh là Kafka broker chung (AWS MSK), tách môi trường bằng topic prefix `AC-DEV-*` / `AC-NONPROD-*` |
| Production URL | N/A (xem trên) |
| API version pinned | Không có version HTTP. Contract version hoá qua `data.eventVersion` (`1.0`) + `MessageStep` (`_CONVENTIONS.md` §3.4/§6.2) |
| SDK / library | Spring Kafka (Java) — không có SDK riêng của provider |
| Category | Partner / Marketplace integration (event-driven) |

## 2. Why this provider (decision)

**Decision**: Driver Plus là **đối tác duy nhất giai đoạn 1** của domain "liên kết đối tác ngoài" (`EP-PARTNER-LINK` §7 — hard-code 1 đối tác, tab "Đối tác khác" là placeholder). Kênh tích hợp: **Kafka 2 chiều**, adapter do **chính boundary sở hữu nghiệp vụ** tự own — KHÔNG qua `gf-erp-agent`.

**Why**:
- Booking relay với Driver Plus **đã chạy production** qua Kafka (`gf-sales` `BookingDriverPlusConsumer` trên `AC-DEV-BOOKING-EVENTS`) — precedent có thật, không phải lựa chọn lý thuyết.
- `gf-system` đã có sẵn hạ tầng outbox/inbox đầy đủ → chi phí thêm adapter = enum value + migration + consumer class.
- Thoả PC-4 / `BR-CORE-012` (adapter validation gate) mà không thêm hop cross-boundary.

**Alternatives considered**: REST webhook 2 chiều · route qua `gf-erp-agent` · notification qua `gf-notification`. Lý do loại: xem [ADR-029 §Alternatives considered](../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md).

**Ref**: [ADR-029](../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md) · [ADR-030](../decisions/ADR-030-tenant-profile-sot-on-gf-system.md) · USER ANSWERS 2026-08-05 (Q1/Q2/Q3/Q4)

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method | **Kafka broker-level auth** (SASL/IAM của AWS MSK) — không có API key/OAuth ở tầng message. Quyền publish/subscribe theo topic ACL |
| Credential rotation | Theo policy MSK/IAM của Platform team — GMS không quản lý credential riêng cho Driver Plus |
| Storage | Env var / IRSA (EKS service account) — **KHÔNG** hardcode trong source |
| Scope / permission | `gf-system`: read+write `AC-DEV-PARTNER-LINK-EVENTS`. `gf-sales`: read+write `AC-DEV-BOOKING-EVENTS` + write `AC-DEV-DOCUMENT-EVENTS`. `gf-accounting`: write `AC-DEV-DOCUMENT-EVENTS`. Driver Plus: đối xứng trên 2 topic đầu + **read-only** `AC-DEV-DOCUMENT-EVENTS` (1 chiều GMS → D+) |
| Multi-tenant strategy | **1 credential chung cho mọi tenant**; cô lập tenant ở tầng **message**: `headers.OriginTenantId` **bắt buộc** + phải khớp `data.tenantId` (`_CONVENTIONS.md` §3.5). Lệch → fail có kiểm soát, **KHÔNG** side-effect im lặng |

> **Cảnh báo tenant**: consumer thiếu `OriginTenantId` → **ack + skip** (tránh retry vô hạn), không đoán tenant từ payload. Đây là hành vi production đang chạy của `BookingDriverPlusConsumer` (`gf-sales-events.md` §3.9) — `gf-system` adapter áp cùng rule.

### 3.2 Webhook security

**Không áp dụng** — không có HTTP webhook ở cả 2 chiều. Toàn bộ trao đổi qua Kafka; tính toàn vẹn/authenticity dựa vào broker ACL + topic isolation.

> Nếu tương lai đổi nhánh inbound sang REST webhook (threshold re-evaluate của ADR-029), **BẮT BUỘC** bổ sung mục này: signature header + HMAC + replay protection trước khi ship.

## 4. Endpoints / Operations Used

**Không có HTTP operation.** Contract = **14 `MessageStep`** trên 3 topic:

### 4.1 Partner link — `AC-DEV-PARTNER-LINK-EVENTS` (`MessageGroup=PARTNER_LINK`, boundary `gf-system`)

| # | Chiều | `MessageStep` | Trigger | Cite |
|---|---|---|---|---|
| 1 | D+ → GMS | `PARTNER_LINK.REQUEST.CREATE` | Tài khoản D+ gửi yêu cầu liên kết tới garage | CB-SYS-004 · `BR-DPL-CMN-001` |
| 2 | D+ → GMS | `PARTNER_LINK.REQUEST.WITHDRAW` | D+ user tự hủy yêu cầu đang "Chờ liên kết" | CB-SYS-007 · `BR-DPL-CAN-004` |
| 3 | D+ → GMS | `PARTNER_LINK.UNLINK` | D+ user tự hủy liên kết đang "Đã liên kết" | CB-SYS-008 · `BR-DPL-CAN-005` |
| 4 | GMS → D+ | `PARTNER_LINK.REQUEST.RESPONSE` | Kết quả xử lý #1 (ack hoặc từ chối `ERR-DPL-010`) | ADR-029 · `FEAT` AC-34 |
| 5 | GMS → D+ | `PARTNER_LINK.PROFILE.SYNC` | Garage Duyệt hoặc bấm "Đồng bộ lại" | CB-SYS-005 · `FEAT` AC-15(c)/AC-21(a) |
| 6 | GMS → D+ | `PARTNER_LINK.STATUS.CHANGED` | State đổi do action từ GMS (4 loại) + wording notification | CB-SYS-009 · `BR-DPL-NOTI-001..004` |

### 4.2 Booking relay — `AC-DEV-BOOKING-EVENTS` (`MessageGroup=BOOKING`, boundary `gf-sales`)

| # | Chiều | `MessageStep` | Trigger | Trạng thái |
|---|---|---|---|---|
| 7 | D+ → GMS | `BOOKING.CREATE.REQUEST` | Khách đặt lịch trên app D+ | **Production** (payload 14 trường tài liệu hoá W07) |
| 8 | D+ → GMS | `BOOKING.CANCELLED` | Khách hủy lịch trên app D+ | **Production** (gate 3 nhánh làm rõ W07) |
| 9 | GMS → D+ | `BOOKING.CREATE.RESPONSE` | Kết quả xử lý #7 (`success` true/false + `ERR-BOOK-001`) | **Production** (nhánh `false` tài liệu hoá W07) |
| 10 | GMS → D+ | `BOOKING.CHANGE.STATUS` | Trạng thái booking đổi (confirm/decline/arrive/cancel/no-show) | **Production** (+`cancelSource` +`driverPlusStatus` W07) |
| 11 | GMS → D+ | `BOOKING.CANCEL.RESPONSE` | Yêu cầu hủy không khớp booking nào (`ERR-BOOK-002`) | **MỚI W07** |

### 4.3 Document sync — `AC-DEV-DOCUMENT-EVENTS` (`MessageGroup=DOCUMENT`, boundary `gf-sales` + `gf-accounting`) — MỚI, ADR-031

**Một chiều GMS → D+.** Mỗi boundary tự emit chứng từ mình sở hữu; D+ chỉ subscribe 1 topic. Partition key `Document-{documentCode}`.

| # | Chiều | `MessageStep` | Producer | Trigger | Cite |
|---|---|---|---|---|---|
| 12 | GMS → D+ | `DOCUMENT.SERVICE_ORDER.SYNC` | `gf-sales` | Phiếu dịch vụ chuyển "Hoàn thành", SO liên kết booking nguồn D+ | `FEAT-SO-DETAIL` AC-17 · `BR-SO-DTL-007` |
| 13 | GMS → D+ | `DOCUMENT.SETTLEMENT.SYNC` | `gf-accounting` | Tạo phiếu quyết toán thành công, snapshot `for-settlement` trả `isDriverPlusSource=true` (cặp AC-4 → 2 event) | `FEAT-STL-CREATE` AC-3/AC-4 · `BR-STL-CRE-008` · `gf-sales-api.md` §3bis.2 |
| 14 | GMS → D+ | `DOCUMENT.SERVICE_ORDER.REVOKED` | `gf-sales` | Phiếu DV đã SYNC sau đó chuyển "Đã huỷ" | `FEAT-SO-DETAIL` AC-22..24 · ADR-031 D3 |

**Quy tắc chốt** (chi tiết + lý do: ADR-031):

- **Tệp**: payload mang `file.fileUrl` + `fileName` + `mimeType` + `checksum` (SHA-256) + `expiresAt`; D+ **tự fetch**, GMS KHÔNG nhúng binary. TTL **30 ngày** kể từ `occurredAt`. `fileUrl` là **URL tuyệt đối** (có scheme + domain) — khác `pdfUrl` của ADR-016 (relative path, FE ghép domain): Driver+ là hệ ngoài, không ghép được. **Signed URL TTL là quyết định kiến trúc đã chốt KHÔNG dùng** (ADR-016 §Decision + §Đã chốt, supersede mốc 300s ngày 2026-06-17) — nên `expiresAt` ở đây là **deadline hợp đồng** (D+ phải fetch trước mốc này; GMS không cam kết URL sống sau đó), không phải TTL cưỡng chế ở tầng storage. Muốn cưỡng chế → phải **supersede/sửa ADR-016** (Architecture Authority), không phải chờ Platform.
- **Hết hạn / fetch lỗi**: GMS **không** tự phát lại; không có kênh REST ngược. Vận hành re-queue outbox row để phát lại cùng `eventId` (§13). D+ chủ động xin lại → cần CR thêm step inbound `DOCUMENT.RESEND.REQUEST` (ngoài phạm vi).
- **Emit độc lập**: 2 loại phiếu không chờ nhau, không ghi đè nhau; cặp phiếu QT emit riêng từng phiếu.
- **Thu hồi**: chỉ có cho **phiếu dịch vụ** (`FEAT-SO-DETAIL` AC-22..24). D+ **đánh dấu thu hồi**, KHÔNG xoá (giữ audit trail hồ sơ số của xe). **Không có** `DOCUMENT.SETTLEMENT.REVOKED` — `FEAT-STL-DETAIL` EC-7 + AC-16/17/18 đã bị Business Authority gỡ 2026-08-03: "Hủy phiếu quyết toán" là chức năng không tồn tại. Nếu BA xác nhận sau này có luồng đó → CR bổ sung, thuần additive.
- **Nguồn điều kiện emit của `gf-accounting`**: 3 field additive `bookingCode` / `externalBookingId` / `isDriverPlusSource` trong snapshot `for-settlement` (`gf-sales-api.md` §3bis.2 v13) — **KHÔNG** đọc DB `gf-sales`.
- **Kill-switch**: feature flag **`Document:DriverPlus`**, độc lập 2 flag còn lại (§11).

> Step `BOOKING.UPDATE.RESPONSE` (đồng bộ khi **sửa nội dung** lịch hẹn, `FEAT-BOOK-EDIT` AC-15) tồn tại trong production nhưng **ngoài phạm vi** đợt rewrite này.

## 5. Request / Response Contracts

Schema đầy đủ per step (payload JSON + bảng field + cite Product + idempotency) nằm ở boundary event doc — **không lặp lại ở đây**:

| Nhóm | Nguồn canonical |
|---|---|
| Partner link (6 step) | [`gf-system-events.md` §3.11–§3.14](../events/gf-system-events.md) |
| Booking relay (5 step) | [`gf-sales-events.md` §3.1 · §3.3 · §3.8 · §3.9 · §3.9bis](../events/gf-sales-events.md) + §2bis (bảng DELTA W07) |
| Document sync (3 step) | [`gf-sales-events.md` §2ter · §3.10 · §3.11](../events/gf-sales-events.md) (phiếu dịch vụ + thu hồi) · [`gf-accounting-events.md` §3.3](../events/gf-accounting-events.md) (phiếu quyết toán) · [`gf-sales-api.md` §3bis.2](../api/gf-sales-api.md) (snapshot `for-settlement` — điều kiện emit) |
| Canonical field/enum names | [`gf-system-api.md` §5](../api/gf-system-api.md) (partner link) · [`gf-sales-api.md` §5](../api/gf-sales-api.md) (booking + chứng từ) · [`gf-accounting-api.md` §6.5](../api/gf-accounting-api.md) (chứng từ) |

### 5.1 Envelope chung (cả 2 nửa)

**Request/Event** (Kafka value = `KafkaMessageWrapper`):
```json
{
  "headers": {
    "OriginTenantId": 5001,
    "MessageGroup": "PARTNER_LINK",
    "MessageStep": "PARTNER_LINK.REQUEST.CREATE",
    "OriginMessageCode": "LKD-2026-001",
    "CorrelationId": "uuid",
    "TraceParent": "00-trace-span-01"
  },
  "messageId": "b3f1c2de-0000-4000-8000-000000000001",
  "source": "driver-plus",
  "type": "BASIC_MESSAGE",
  "data": "{\"eventId\":\"…\",\"eventType\":\"PartnerLinkRequestCreate\",\"eventVersion\":\"1.0\",\"tenantId\":5001,\"occurredAt\":\"2026-08-05T03:10:00Z\",\"requestCode\":\"LKD-2026-001\"}",
  "timestamp": "2026-08-05T03:10:00Z"
}
```

**Response (correlated) — shape thống nhất cho cả 3 luồng inbound**:
```json
{
  "success": false,
  "error": { "code": "ERR-DPL-010", "message": "Garage đã liên kết với một tài khoản Driver Plus khác. Không thể gửi yêu cầu liên kết mới cho đến khi liên kết hiện tại bị hủy." },
  "correlation": { "requestEventId": "b3f1c2de-0000-4000-8000-000000000001", "originMessageCode": "LKD-2026-001" }
}
```

**Error shape (mã dùng chung, verbatim từ `Product/Commons/ERROR-CODE-REGISTRY.md`)**:

| Code | Luồng | HTTP-equivalent | Nguồn |
|---|---|---|---|
| `ERR-DPL-010` | Partner link — tạo yêu cầu bị single-active guard chặn | 409 | Registry §5 |
| `ERR-DPL-011` | Partner link — tạo yêu cầu khi kill-switch `PartnerLink:DriverPlus=off` | 503 | Registry §5 · FEAT AC-43 · BR-DPL-CMN-008 |
| `ERR-BOOK-001` | Booking — payload đặt lịch không hợp lệ (thiếu 1/5 trường bắt buộc hoặc giờ hẹn sai bước 15 phút) | 400 | Registry §6 |
| `ERR-BOOK-002` | Booking — yêu cầu hủy không tìm thấy lịch hẹn | 404 | Registry §6 |

Cả 3 mã có display type `API_RESPONSE` — **response cho external caller, KHÔNG render UI GMS**.

**Mapping → internal model**: xem bảng mapping field → cột DB tại `gf-sales-events.md` §3.8 (booking, 14 trường) và `gf-system-data-model.md` §2bis (partner link).

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Broker unavailable khi publish | Producer exception | Spring Kafka callback | Event **đã nằm trong `outbox_events`** → `OutboxScheduler` retry (60s `gf-system` / 10s `gf-sales`). **KHÔNG** rollback state cục bộ |
| Consumer xử lý lỗi hạ tầng (DB down) | Exception trước ack | Log + metric | Không ack → Kafka redeliver; inbox dedupe chặn double-apply |
| **Message thiếu `OriginTenantId`** | Header rỗng | Consumer guard | **Ack + skip** + log warning — tránh retry vô hạn (hành vi production `gf-sales`) |
| `data.tenantId` ≠ `headers.OriginTenantId` | Mismatch | Consumer guard | **Fail có kiểm soát** + audit; **KHÔNG** xử lý side-effect (`_CONVENTIONS.md` §3.5) |
| Message trùng (D+ retry) | Cùng `messageId` | `inbox_event` unique constraint | Ack + skip; thêm lớp 2 là unique `(tenant_id, request_code)` cho partner link (`FEAT` EC-4) / dedupe booking (`INBOUND` AC-9) |
| **Payload sai nghiệp vụ** (thiếu trường bắt buộc, giờ sai bước 15 phút, single-active guard chặn) | Gate reject | Adapter validation gate | Publish **response event** `success=false` + mã lỗi tương ứng, rồi **ack**. **KHÔNG** retry — request sai từ đầu (OUTBOUND AC-11) |
| Event tới record sai state (D+ withdraw record đã terminal) | State guard | Domain check | **Bỏ qua + log warning**, không đổi state, không xoá lịch sử (`FEAT` AC-33/AC-35 nhánh 2) |
| **Render PDF / upload `ct-file-storage` lỗi** (document sync) | Exception trước khi ghi outbox | Log + metric `outbound.failed` | **KHÔNG** rollback state nghiệp vụ (SO đã "Hoàn thành" / phiếu QT đã tạo). Ghi ngoại lệ cho vận hành; phát lại thủ công sau khi sửa nguyên nhân |
| **D+ fetch `fileUrl` sau `expiresAt`** | 403/404 phía storage | Không phát hiện được từ GMS | D+ báo lại; vận hành re-queue outbox row (cùng `eventId`) — GMS **không** tự re-issue URL (ADR-031 D4) |
| **Phiếu được sửa/xuất lại sau khi đã emit** | D+ bỏ qua bản mới | Không phát hiện tự động | **Known limitation** — khoá dedupe không có `revision` (ADR-031 D5). Cần CR nếu nghiệp vụ có case này |
| Outbound event không được D+ tiêu thụ | Không có ack nghiệp vụ | Không phát hiện được từ GMS | **Chấp nhận** — at-least-once, không có end-to-end ack. Theo dõi qua consumer lag phía D+ |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries (outbound) | `gf-system`: `max_retries` mặc định **3** (cột `outbox_events.max_retries`); `gf-sales`: **5** (`gf-sales-HLD` §6); `gf-accounting`: **3** (`gf-accounting-events.md` §1) |
| Backoff | Theo scheduler poll interval — `gf-system` 60s · `gf-sales` 10s · `gf-accounting` 5s (không exponential; đơn giản hoá có chủ đích) |
| Total max wait | `gf-system` ~3 phút · `gf-sales` ~50s trước khi chuyển `FAILED` |
| Idempotency key | `messageId` (UUID per message) + `data.eventId` (UUID per domain event). **Ổn định qua retry** — KHÔNG sinh mới (OUTBOUND AC-9). Riêng document sync: `eventId` **deterministic** `UUIDv5(NS_DP_DOCUMENT, documentCode + "\|" + documentType)`, `messageId` = `eventId` (ADR-031 D5) |
| After max retries | Status `FAILED` trong `outbox_events`; **ghi ngoại lệ cho đội vận hành xử lý thủ công**, KHÔNG tự suy kết quả thành công/thất bại (OUTBOUND AC-8). **KHÔNG** rollback state nghiệp vụ đã commit |
| Retry inbound | Do Kafka redeliver (không ack) — chỉ cho lỗi **hạ tầng**; lỗi **nghiệp vụ** ack ngay + response event |

### 6.3 Circuit breaker

**Không áp dụng** — không có synchronous HTTP call sang Driver Plus ở cả 2 chiều. Kafka producer/consumer không cần breaker; backpressure xử lý qua consumer lag + partition.

> Nếu chuyển sang REST (threshold ADR-029), bổ sung: open 50% failure/30s · half-open probe sau 60s · close sau 3 success · fallback = ghi outbox chờ retry.

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency key generation | `messageId` = UUID v4 per Kafka message; `data.eventId` = UUID v4 per domain event. Producer **tái dùng** cùng giá trị khi retry |
| Server-side dedup window | **Không giới hạn thời gian** — `inbox_event.event_id` là PK, giữ vĩnh viễn (không có TTL cleanup ở `gf-system`). Lớp 2: unique `(tenant_id, request_code)` |
| Order guarantees | **Per-aggregate ordering** qua partition key: `PartnerLink-{requestCode}` · `Booking-{bookingCode}` · `Document-{documentCode}` (`_CONVENTIONS.md` §4.1). SYNC và REVOKED cùng 1 phiếu → cùng partition → D+ luôn thấy đúng thứ tự. 2 message cùng aggregate → cùng partition → xử lý tuần tự đúng thứ tự producer gửi. **KHÔNG** có global ordering giữa các aggregate khác nhau |
| Race create-vs-cancel cùng booking | Giải quyết bằng partition ordering ở trên — GMS **không** thêm rule nghiệp vụ riêng để đảo thứ tự (`FEAT-BOOK-DRIVERPLUS-INBOUND` EC-2) |
| Replay safety | At-least-once cả 2 chiều. Inbound: an toàn nhờ inbox dedupe. Outbound: Driver Plus **BẮT BUỘC** dedupe theo `eventId` / `correlation.requestEventId` (`FEAT-DP-035` AC-19) |
| Document sync dedupe | `eventId` = hàm thuần của `(documentCode, documentType)` → phát lại kỹ thuật mang y nguyên khoá; D+ ghi 1 lần. REVOKED có khoá riêng (`…\|REVOKED`) + `correlation.syncEventId` trỏ về bản SYNC. **Không có `revision`** — xem Known limitation §6.1 |
| `PARTNER_LINK.PROFILE.SYNC` lặp | An toàn — Driver Plus áp **last-write-wins** theo `occurredAt` (mỗi lần "Đồng bộ lại" ghi 1 event mới) |

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags |
|---|---|---|
| `integration.driver_plus.inbound.messages` | counter | `boundary`, `message_step`, `outcome` (`applied` \| `rejected` \| `skipped_duplicate` \| `skipped_state`) |
| `integration.driver_plus.inbound.lag` | gauge | `boundary`, `topic`, `partition` |
| `integration.driver_plus.outbound.published` | counter | `boundary`, `message_step` |
| `integration.driver_plus.outbound.failed` | counter | `boundary`, `message_step`, `retry_count` |
| `integration.driver_plus.gate.rejections` | counter | `boundary`, `error_code` (`ERR-DPL-010` \| `ERR-DPL-011` \| `ERR-BOOK-001` \| `ERR-BOOK-002`) |
| `integration.driver_plus.document.file_upload` | counter | `boundary`, `document_type`, `outcome` (`ok` \| `failed`) — theo dõi bước upload `ct-file-storage` trước khi ghi outbox |
| `integration.driver_plus.outbox.pending_age` | gauge | `boundary` — tuổi event `PENDING` cũ nhất (phát hiện scheduler kẹt) |

### 8.2 Logging

- Mọi message log: `correlation_id`, `message_id`, `message_step`, `origin_tenant_id`, `origin_message_code`, `outcome`, `latency_ms`.
- Mọi rejection log: `error_code` + lý do gate (thiếu trường nào / state hiện tại là gì).
- **KHÔNG log**: full payload chứa PII — `customerPhone`, `customerName`, `partnerAccountPhone`, `vehiclePlate`, `vehicleVin`, `vehicleImages` URL. Mask theo policy `BR-CORE-011` + `gf-system-HLD` §8 forbidden.
- **KHÔNG log**: nội dung `notification.message` đã render (chứa tên garage + SĐT + lý do).
- **KHÔNG log**: `file.fileUrl` của chứng từ (tệp chứa thông tin khách + xe + tiền) — log `documentCode` + `documentType` + `checksum` là đủ để truy vết.

### 8.3 Tracing

- Span name: `integration.driver_plus.{message_step}`.
- Attributes: `message_step`, `origin_tenant_id`, `origin_message_code`, `message_id`.
- Propagate W3C trace context qua header `TraceParent` trong `KafkaMessageWrapper.headers` (`_CONVENTIONS.md` §3.3 — khuyến nghị). Driver Plus nên echo lại `CorrelationId` trong response event để nối span 2 chiều.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Consumer lag inbound | > 5 phút | P2 | boundary owner (`gf-system` / `gf-sales`) |
| Outbox `FAILED` count | > 10 trong 15 phút | P2 | boundary owner |
| Outbox `pending_age` | > 10 phút | P2 | boundary owner |
| Gate rejection rate | > 20% tổng inbound trong 15 phút | P3 | boundary owner + Driver Plus team (dấu hiệu drift contract) |
| Tenant mismatch (`data.tenantId` ≠ `OriginTenantId`) | **any** | **P1** | On-call — nghi vấn cross-tenant leak |

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Chưa có SLA chính thức với Driver Plus — **Open Question** (đối tác nội bộ tập đoàn) |
| Our SLA exposed to users | Inbound consume lag p95 ≤ 5s (`gf-sales-events.md` §2.2 · `gf-system-events.md` §2.1). Outbound publish ≤ 30s (bao gồm outbox fallback tối đa 60s ở `gf-system`) |
| Rate limits | Không có rate limit ở tầng message. Bảo vệ bằng consumer concurrency cap + partition (xem `gf-system-HLD` §7.6 / `gf-sales-HLD` §7.6) |
| Quota limits | Theo cấu hình MSK (partition/throughput) — không tính theo request |
| Pricing model | Không tính phí per-call (Kafka nội bộ) — chi phí là hạ tầng MSK |
| Cost cap / budget alarm | Không áp dụng ở tầng integration |
| Cost owner | Platform team (MSK) |

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII (chứng từ, ADR-031) | Tệp phiếu dịch vụ / phiếu quyết toán chứa tên khách, biển số, hạng mục sửa chữa, số tiền. Cơ sở pháp lý: cùng consent garage ↔ D+ của luồng booking (khách đặt lịch qua D+, D+ ghi hồ sơ số của xe — `FEAT-DP-046`). URL không log; retention phía D+ là Open Question |
| PII transmitted | **CÓ — 2 chiều**. Inbound: `customerPhone`, `customerName`, `vehiclePlate`, `vehicleVin`, `vehicleImages`, `partnerAccountName`, `partnerAccountPhone`. Outbound: hồ sơ doanh nghiệp garage (`businessName`, `contactPhoneNumber`, địa chỉ, MST, email HĐ) |
| Cơ sở pháp lý chia sẻ hồ sơ garage | **Consent tường minh của garage** — checkbox "Tôi đã đọc và đồng ý chia sẻ thông tin garage với Driver Plus" + gate scroll-to-end (`BR-DPL-APV-002/003`); ghi nhận server-side qua `termsAccepted` |
| Cơ sở pháp lý dữ liệu khách hàng | **Driver Plus tự thu thập + lưu consent của khách hàng** (mã booking + thời điểm + phiên bản nội dung, `FEAT-DP-034` AC-18). GMS **không** nhận, không lưu, không tra cứu thông tin đồng ý này (`BR-BOOK-025`) |
| Data residency | AWS region của MSK (Việt Nam/APAC theo cấu hình Platform) — cả 2 phía cùng hạ tầng |
| Regulatory frameworks | PDPD (Nghị định bảo vệ dữ liệu cá nhân VN) — điều khoản chia sẻ đầy đủ do **Legal hoàn thiện sau qua CR**; DEV dùng bản tóm tắt 2 mục (`FEAT` AC-12 + §7) |
| DPA signed | **Open Question** — chưa xác nhận trong Product docs |
| Data retention at provider | **Open Question** — Driver Plus giữ hồ sơ garage bao lâu sau khi hủy liên kết chưa được đặc tả |
| Right-to-erasure flow | **Gap đã biết**: khi garage Hủy liên kết, GMS publish `PARTNER_LINK.STATUS.CHANGED` `UNLINKED` nhưng **không** có step yêu cầu D+ xoá dữ liệu đã đồng bộ. Nếu cần → CR riêng thêm step `PARTNER_LINK.DATA.PURGE` |

## 11. Sandbox vs Production

| Aspect | Sandbox / Dev | Production |
|---|---|---|
| Kênh | Kafka topic prefix `AC-DEV-*` | Topic prefix production tương ứng (config `kafka.topics.*` override qua env) |
| Credentials | IAM role của môi trường dev | IAM role production |
| Webhook URL | N/A | N/A |
| Test data fixtures | Driver Plus cung cấp tenant test + tài khoản D+ test (`EP-PARTNER-LINK` §3 note "D+ có thể có nhiều tài khoản test cùng gửi request") | n/a |
| Switchover gate | Feature flag **`PartnerLink:DriverPlus`** (partner link) + **`Booking:DriverPlus`** (booking relay) + **`Document:DriverPlus`** (document sync) — cả 3 default **`on`** mọi tenant khi release; giữ làm **kill-switch khẩn cấp** | — |

> **Lưu ý flag**: 3 flag **độc lập**. Tắt `Booking:DriverPlus` không ảnh hưởng partner link / document sync và ngược lại. Với `PartnerLink:DriverPlus=off`: Web/Mobile ẩn bề mặt Liên kết; REST bị chặn; `PARTNER_LINK.REQUEST.CREATE` không tạo record và luôn có correlated response `success=false`, `ERR-DPL-011`; `gf-system` không phát `PROFILE.SYNC`/`STATUS.CHANGED`; dữ liệu/audit hiện hữu giữ nguyên. `Document:DriverPlus` dùng chung cho cả 2 producer (`gf-sales` + `gf-accounting`) — tắt là ngừng đồng bộ cả 2 loại phiếu. Cùng tắt cả 3 flag = ngắt toàn bộ khả năng phát sinh tác động mới của tích hợp Driver Plus.

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock `PassthroughService`/repository; assert adapter gate quyết định đúng (5 trường bắt buộc, bước 15 phút, single-active guard) + shape response event |
| Integration | **Testcontainers Kafka** — publish message inbound, assert (a) record DB đúng state, (b) inbox row tạo, (c) outbound event đúng `MessageStep` + payload. Bao gồm case duplicate `messageId`, thiếu `OriginTenantId`, và `PartnerLink:DriverPlus=off` → không tạo record + response `ERR-DPL-011` + không phát profile/status |
| Contract test | So sánh payload sample trong `gf-system-events.md` §3.11–§3.14 / `gf-sales-events.md` §3.8/§3.9 với fixture do Driver Plus cung cấp. **Chưa có schema registry** — contract test dựa trên fixture thủ công (Open Question) |
| Chaos | Inject: broker down khi publish (assert outbox giữ `PENDING` + retry) · consumer crash giữa transaction (assert không double-apply) · message malformed (assert ack + log, không poison partition) |
| E2E | Môi trường dev với tenant test + tài khoản D+ test: duyệt → assert D+ nhận `PROFILE.SYNC` + `STATUS.CHANGED`; đặt lịch từ app D+ → assert booking xuất hiện trên Web GMS |
| Document sync | Integration (Testcontainers Kafka): hoàn thành SO có booking nguồn D+ → assert 1 event `DOCUMENT.SERVICE_ORDER.SYNC` đúng payload + `eventId` khớp `UUIDv5(documentCode\|documentType)`; chạy lại → **cùng** `eventId`. Tạo cặp phiếu QT (AC-4) với `isDriverPlusSource=true` → assert **2** event riêng; `isDriverPlusSource=false` hoặc thiếu → assert **không** publish. Upload `ct-file-storage` fail → assert state nghiệp vụ vẫn commit + không có outbox row. Huỷ SO sau SYNC → assert `DOCUMENT.SERVICE_ORDER.REVOKED` mang `correlation.syncEventId` đúng. Huỷ phiếu QT → assert **không** publish step nào (không có `SETTLEMENT.REVOKED`) |
| Concurrency | **Bắt buộc** cho `FEAT` AC-31: 2 request Duyệt 2 record khác nhau cùng tenant chạy song song → assert đúng 1 thành công, cái còn lại nhận `ERR-DPL-006` và tự chuyển `REJECTED` (verify partial unique index hoạt động) |

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| Driver Plus ngừng consume (lag tăng) | Không có hành động phía GMS — outbound đã ở Kafka, D+ tự catch-up. Escalate D+ team nếu lag > 1h |
| Driver Plus gửi payload sai contract hàng loạt | Kiểm `gate.rejections` metric theo `error_code`; escalate D+ team kèm mẫu `messageId`. **KHÔNG** nới lỏng gate để "cho qua tạm" |
| Outbox `FAILED` tồn đọng | Kiểm broker connectivity → sửa nguyên nhân → re-queue thủ công (đổi status `FAILED` → `PENDING`). **KHÔNG** xoá row (audit invariant) |
| Cần ngắt khẩn cấp tích hợp | Tắt feature flag tương ứng (`PartnerLink:DriverPlus` / `Booking:DriverPlus` / `Document:DriverPlus`) — không cần deploy. Với Partner Link: xác nhận menu/tab và REST bị chặn, request tạo mới nhận `ERR-DPL-011`, không có `PROFILE.SYNC`/`STATUS.CHANGED` mới; không xóa dữ liệu/audit cũ. |
| D+ báo "không tải được tệp chứng từ" | Kiểm `expiresAt` của event gốc + object còn trên `ct-file-storage` không. Còn hạn → lỗi phía D+/mạng. Hết hạn → re-queue outbox row phát lại (cùng `eventId`); nếu D+ đã ghi nhận event thì phải phối hợp D+ xoá dedupe trước |
| Garage báo "phiếu đã sửa nhưng D+ vẫn hiện bản cũ" | **Known limitation** ADR-031 D5 (khoá dedupe không có `revision`) — không có cách xử lý tại chỗ; escalate để mở CR |
| Nghi vấn cross-tenant (alert P1) | Dừng consumer ngay, dump message vi phạm, đối chiếu `OriginTenantId` vs `data.tenantId`, escalate Security + D+ team |
| Unrecognized `MessageStep` | Ack + log warning; **KHÔNG** throw (tránh poison partition). Đây là hành vi mặc định của cả 2 consumer |
| Garage báo "hồ sơ bên D+ không cập nhật" | Hướng dẫn bấm "Đồng bộ lại thông tin sang D+" (không auto-sync theo thiết kế — `FEAT` EC-6); kiểm outbox có event `PROFILE.SYNC` mới không |

Full runbook: `Operations/runbooks/INTEG-EXT-driver-plus-runbook.md` *(chưa tạo — thuộc stage vận hành)*.

## 14. Forbidden patterns

- ❌ Xử lý message mà **không filter** `MessageGroup` + `MessageStep` — cả 2 topic dùng chung inbound/outbound (Critical Rule #18).
- ❌ Xử lý message tenant-scoped khi thiếu `OriginTenantId`, hoặc khi `data.tenantId` ≠ `OriginTenantId` (data-breach risk).
- ❌ Bypass outbox — publish thẳng `kafkaTemplate.send()` trong transaction nghiệp vụ (ADR-004, `BR-CORE-005`).
- ❌ Ack message inbound **trước khi** ghi inbox thành công (mất idempotency guard).
- ❌ Rollback state nghiệp vụ đã commit khi outbound publish thất bại (`FEAT` AC-32 · `BR-BOOK-024`).
- ❌ Retry vô hạn message sai nghiệp vụ — phải publish response event + ack (OUTBOUND AC-11).
- ❌ Sinh `messageId`/`eventId` mới khi retry cùng 1 sự kiện — phá dedupe phía D+ (OUTBOUND AC-9).
- ❌ Log payload chứa PII (SĐT, tên khách, biển số, VIN, ảnh xe) hoặc nội dung notification đã render (`BR-CORE-011`).
- ❌ Ghi payload external thẳng vào domain table mà không qua adapter validation gate (PC-4 / `BR-CORE-012`).
- ❌ **(ADR-031)** Nhúng binary/base64 tệp phiếu vào payload — chỉ gửi `fileUrl` + `checksum` + `expiresAt`.
- ❌ **(ADR-031)** Sinh `eventId` mới cho cùng `(documentCode, documentType)` khi phát lại.
- ❌ **(ADR-031)** Emit chứng từ cho SO/phiếu QT **không** thuộc booking nguồn Driver+.
- ❌ **(ADR-031)** Publish chứng từ lên `AC-DEV-BOOKING-EVENTS` hoặc dùng `MessageGroup=BOOKING`.
- ❌ **(ADR-031)** `gf-accounting` đọc DB `gf-sales` để biết nguồn booking — phải qua snapshot REST `for-settlement`.
- ❌ Route notification Driver Plus qua `gf-notification` (ADR-029 — audience ngoài GMS).
- ❌ Thêm hop `gf-erp-agent` cho luồng Driver Plus (ADR-029 — boundary đó là bridge ERP/COP).
- ❌ Đổi tên `MessageStep` đang chạy production khi cutover (ADR-029 §2bis.2 — delta thuần additive).
- ❌ Snapshot hồ sơ garage rồi publish lại từ snapshot (CB-SYS-006 — đọc real-time).
- ❌ Tạo record `partner_link_request` từ REST/UI của garage (`BR-DPL-CMN-001` — chỉ D+ tạo).

## 15. References

- HLD caller: [gf-system-HLD.md](../hld/gf-system-HLD.md) · [gf-sales-HLD.md](../hld/gf-sales-HLD.md) §9
- API contract: [gf-system-api.md §3bis + §5](../api/gf-system-api.md) · [gf-sales-api.md §5](../api/gf-sales-api.md)
- Events (contract canonical): [gf-system-events.md §3.11–§3.14](../events/gf-system-events.md) · [gf-sales-events.md §2bis + §3.1/§3.3/§3.8/§3.9/§3.9bis](../events/gf-sales-events.md)
- Data model: [gf-system-data-model.md §2bis](../data/gf-system-data-model.md) · [gf-sales-data-model.md §2ter](../data/gf-sales-data-model.md)
- BFF: [agg-garage-graph-graphql.md §3k](../api/agg-garage-graph-graphql.md)
- Frontend: [INTEG-FE-garage-web-agg-garage-graph.md §3.9](INTEG-FE-garage-web-agg-garage-graph.md) · [INTEG-MOB-garage-mobile-agg-garage-graph.md §3.6](INTEG-MOB-garage-mobile-agg-garage-graph.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md) · Tech stack: [TECHSTACK.md](../TECHSTACK.md) · Event conventions: [`_CONVENTIONS.md`](../events/_CONVENTIONS.md)
- Document sync: [ADR-031](../decisions/ADR-031-driver-plus-document-sync.md) · [gf-sales-events.md §2ter/§3.10/§3.11](../events/gf-sales-events.md) · [gf-accounting-events.md §3.3](../events/gf-accounting-events.md) · Product `FEAT-SO-DETAIL` AC-17 + `BR-SO-DTL-007` · `FEAT-STL-CREATE` AC-3 + `BR-STL-CRE-008` · `Tracking/arch-design-document-sync-answers-1.md`
- ADR: **ADR-029** (giao thức GMS ↔ Driver Plus) · **ADR-030** (tenant profile SoT) · ADR-004 (Kafka event-driven) · ADR-005 (no shared outbox lib) · ADR-013 (deprecation path — không áp dụng, delta additive)
- Sister integration: [INTEG-EXT-gf-erp-agent.md](INTEG-EXT-gf-erp-agent.md) (bridge ERP/COP — **khác** kênh, không dùng cho Driver Plus)
- Business Rules: `BR-GF-SYSTEM.md` §1 CB-SYS-004..009 + §2.5 BR-DPL-* · `BR-GF-SALES.md` §1 BR-CROSS-006 + §2.1 BR-BOOK-005/013/022/023/024/025 · `Product/Commons/ERROR-CODE-REGISTRY.md` §5 + §6
- Provider docs (ngoài repo): `FEAT-DP-034` · `FEAT-DP-035` · `FEAT-DP-046`

## 16. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-08-10 | 5 | Đồng bộ quyết định Business Authority về `PartnerLink:DriverPlus`: flag off là kill-switch toàn luồng, không chỉ ẩn UI; chặn REST/action, từ chối request tạo mới bằng correlated response `ERR-DPL-011`, ngừng outbound profile/status, giữ dữ liệu/audit. Bổ sung contract test + runbook flag-off. Áp dụng cho cả 3 flag (`PartnerLink:DriverPlus` / `Booking:DriverPlus` / `Document:DriverPlus`), kế thừa flag thứ 3 do document sync (v3) thêm. | Architecture Authority qua quyết định Business Authority |
| 2026-08-10 | 4 | **Round 2 fix sau arch-review (mandate Q7/Q8/Q9/Q10)** — (Q8) gỡ step `DOCUMENT.SETTLEMENT.REVOKED`: §4 header 15 → **14 `MessageStep`**, §4.3 bảng còn **3 row**, §5 nguồn canonical, §12 test matrix, §15 references; lý do `FEAT-STL-DETAIL` EC-7 đã bị Business Authority gỡ 2026-08-03. (Q7) §4.3 nêu nguồn điều kiện emit của `gf-accounting` = 3 field additive trong snapshot `for-settlement` (`gf-sales-api.md` §3bis.2 v13), đóng P0 boundary isolation. (Q9/Q10) §4.3 sửa mô tả `expiresAt`: KHÔNG signed URL là **quyết định kiến trúc ADR-016**, gỡ ràng buộc phải supersede ADR-016 (không phải chờ Platform); khẳng định `fileUrl` là **URL tuyệt đối** (khác `pdfUrl` relative của ADR-016 — D+ là hệ ngoài, không ghép domain được). | Architecture Authority (agent-arch-author) |
| 2026-08-10 | 3 | **Bổ sung nửa thứ 3 — Document sync (ADR-031)**, đóng gap BA phát hiện sau W07 (W07 chỉ phủ partner link + booking relay; đồng bộ chứng từ nằm ngoài scope theo `arch-design-partner-link-answers-1.md` Q4). **§4.3 MỚI**: topic `AC-DEV-DOCUMENT-EVENTS`, `MessageGroup=DOCUMENT`, 4 step (`DOCUMENT.{SERVICE_ORDER,SETTLEMENT}.{SYNC,REVOKED}`), 2 producer tự emit (`gf-sales` + `gf-accounting`), 1 chiều GMS → D+. Tệp gửi bằng URL (`fileUrl`+`checksum`+`expiresAt` TTL 30 ngày), KHÔNG binary; `eventId` deterministic UUIDv5 theo mã phiếu. Cập nhật §1 identity (+`gf-accounting`), §3.1 ACL topic mới, §4 header (9 → 15 step), §5 nguồn canonical, §6.1 +3 failure mode (upload fail / fetch hết hạn / phiếu xuất lại bị bỏ qua), §6.2 retry `gf-accounting`, §7 partition key + dedupe chứng từ, §8.1 metric upload + §8.2 cấm log `fileUrl`, §10 PII chứng từ, §11 flag thứ 3 `Document:DriverPlus`, §12 test matrix, §13 +2 runbook, §14 +5 forbidden, §15 references. **KHÔNG đụng** contract partner link + booking relay đang chạy. | Architecture Authority (agent-arch-author) |
| 2026-08-07 | 2 | **ARCH-REVIEW-W07 P2 fix**: (a) frontmatter `boundary: "gf-system, gf-sales"` → `"cross-boundary (gf-system, gf-sales)"` theo convention ADR-013/014/015; (b) cite `gf-system-events.md §3.10–§3.13` → **§3.11–§3.14** (3 chỗ: §4 mapping table, §7 contract test, §15 References) theo renumber gf-system-events.md v5. | Architecture Authority (main agent, post-review fix) |
| 2026-08-05 | 1 | Initial integration contract — gộp **2 nửa** tích hợp Driver Plus vào 1 file theo đúng phạm vi 1 đối tác ngoài: partner link (`gf-system`, mới W07) + booking relay (`gf-sales`, production rewrite W07). 11 `MessageStep` trên 2 topic (§4). Kênh Kafka, adapter tự-own, correlated response event thay HTTP đồng bộ (ADR-029). Điền đủ 16 section template với các mục không áp dụng được ghi rõ lý do (§3.2 webhook · §6.3 circuit breaker · §9 pricing) thay vì bỏ trống. Flag 4 gap PII/compliance (SLA, DPA, retention tại provider, right-to-erasure) + gap schema registry cho contract test vào Open Questions của wave. | Architecture Authority (agent-arch-author) |
