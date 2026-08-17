---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 6
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-08-11"
---

# ADR-031: Đồng bộ chứng từ GMS → Driver Plus — topic `AC-DEV-DOCUMENT-EVENTS`, mỗi boundary tự emit, tệp qua URL có hạn

## Status

ACCEPTED — 2026-08-10

Bổ sung **nửa thứ 3** của tích hợp Driver Plus (sau partner link + booking relay của ADR-029): đồng bộ **chứng từ sau booking** — phiếu dịch vụ (`gf-sales`) + phiếu quyết toán (`gf-accounting`).

Phạm vi Product: `FEAT-SO-DETAIL` AC-17 / `BR-SO-DTL-007` · `FEAT-STL-CREATE` AC-3 / `BR-STL-CRE-008`.

## Context

1. **Gap**: W07 (ADR-029) chỉ phủ partner link + booking relay (`INTEG-EXT-driver-plus.md` §4.1/§4.2). Đồng bộ chứng từ nằm ngoài scope W07 có chủ đích (`Tracking/arch-design-partner-link-answers-1.md` Q4 — 3 FEAT, 5 boundary, không có `gf-accounting`). BA phát hiện gap 2026-08-10.
2. Product để mở **3 marker** `NEED CONFIRMATION Architecture`: tên event (`FEAT-SO-DETAIL:139`, `FEAT-SO-DETAIL:280`, `FEAT-STL-CREATE:50`) + định dạng tệp (URL hay binary).
3. Driver+ dùng dữ liệu này để ghi lịch sử vào **hồ sơ số của xe** (`FEAT-DP-046`) — GMS chỉ cần emit đúng payload.
4. 2 loại phiếu do **2 boundary khác nhau** sở hữu (`SERVICE-BOUNDARY-MATRIX` #5 `gf-sales` · #9 `gf-accounting`) và emit **độc lập, không chờ nhau, không ghi đè** (`BR-SO-DTL-007` + `BR-STL-CRE-008`).
5. Cả 2 boundary **đã có hạ tầng outbox** production: `gf-sales` (`outbox_event`, poll 10s, retry 5×, Redis lock — `gf-sales-HLD` §6) · `gf-accounting` (`outbox_events` + `OutboxProcessor`, poll 5s, batch 100, retry 3×, Redis lock `gf-accounting-outbox-processor` — `gf-accounting-events.md` §1, `gf-accounting-data-model.md` §2 `outbox_events`).
6. PDF hiện được render **on-demand trả byte[]**, không persist: `gf-sales GET /api/v2/service-orders/{id}/export-pdf` (`gf-sales-api.md` §3) · `gf-accounting GET /api/v1/settlements/{id}/export-pdf` (`gf-accounting-api.md` §3). Việc upload lên `ct-file-storage` hiện do **BFF** orchestrate (ADR-016) — luồng Kafka async không có BFF trong vòng lặp.

## Decision

### D1 — Mỗi boundary tự emit (không gom, không qua `gf-erp-agent`)

`gf-sales` emit phiếu dịch vụ; `gf-accounting` emit phiếu quyết toán. Nhất quán precedent ADR-029 (adapter thuộc boundary sở hữu nghiệp vụ). Không gom về `gf-sales` để `gf-sales` không phải biết vòng đời chứng từ kế toán; không thêm hop `gf-erp-agent` (boundary đó là bridge ERP/COP).

### D2 — Topic mới `AC-DEV-DOCUMENT-EVENTS`, `MessageGroup=DOCUMENT`

Cả 2 producer bắn vào **1 topic**; Driver+ chỉ subscribe 1 topic cho chứng từ. Naming theo `_CONVENTIONS.md` §2.1 (`AC-DEV-{DOMAIN}-EVENTS`, suffix `-EVENTS` cho lifecycle). **Không** đụng contract `AC-DEV-BOOKING-EVENTS` đang chạy production (tránh trộn consumer group booking với chứng từ). Partition key `Document-{documentCode}` (per-aggregate, `_CONVENTIONS.md` §4.1).

### D3 — 2 `MessageStep`, 2 loại phiếu tách riêng

| `MessageStep` | Producer | Trigger |
|---|---|---|
| `DOCUMENT.SERVICE_ORDER.SYNC` | `gf-sales` | Phiếu dịch vụ chuyển "Hoàn thành" (AC-17), SO liên kết booking nguồn Driver+ |
| `DOCUMENT.SETTLEMENT.SYNC` | `gf-accounting` | Tạo phiếu quyết toán thành công (AC-3), SO gốc liên kết booking nguồn Driver+ |

**Không có `DOCUMENT.SETTLEMENT.REVOKED`** (quyết định round 2, 2026-08-10): `FEAT-STL-DETAIL` EC-7 + AC-16/17/18 đã bị Business Authority **gỡ 2026-08-03** (Change Log v3) — "Hủy phiếu quyết toán" mô tả một chức năng **không tồn tại**, nhầm với AC-15 "Hủy chỉnh sửa". Không có luồng nghiệp vụ → không khai báo step. Endpoint `POST /api/v1/settlements/{code}/cancel` có trong API baseline nhưng chưa được Product xác nhận là luồng người dùng thật.

**Không có `DOCUMENT.SERVICE_ORDER.REVOKED`** (RESOLVED v6, Delivery Authority sonhoang chốt 2026-08-11, xem Change Log v6): step này ban đầu được khai báo (round 1/2) với ghi chú tính khả đạt — đường **duy nhất** để 1 SO đã "Hoàn thành" (đã emit SYNC) chuyển sang "Đã huỷ" là qua **huỷ phiếu quyết toán** → `gf-accounting` gọi REST reopen SO (CB-INS-003) → SO rời "Đã quyết toán" → garage huỷ phiếu. User xác nhận lại 2026-08-11 (cùng root-cause với quyết định gỡ `SETTLEMENT.REVOKED` ở trên): **"Hủy phiếu quyết toán" không phải luồng nghiệp vụ tồn tại** — do đó đường duy nhất tới trạng thái kích hoạt REVOKED không đạt được. Step bị loại bỏ hoàn toàn (không chỉ hoãn qua CR) vì **không có cơ chế nào có thể trigger nó** trong hệ thống hiện tại. Nếu sau này Business Authority xác nhận có luồng huỷ phiếu quyết toán thật (hoặc đường khác dẫn tới hủy SO sau "Hoàn thành") → CR bổ sung lại step, thuần additive (đối xứng D3 cho `SETTLEMENT.REVOKED`).

Driver+ filter được ở header, không phải parse payload (Critical Rule #18). Cặp phiếu quyết toán (`FEAT-STL-CREATE` AC-4) emit **riêng từng phiếu**.

### D3bis — Nguồn điều kiện emit của `gf-accounting`

`gf-accounting` biết SO gốc có thuộc booking nguồn Driver+ hay không **chỉ qua snapshot REST** `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement` — bổ sung additive 3 field `bookingCode` + `externalBookingId` + `isDriverPlusSource` ([`gf-sales-api.md` §3bis.2](../api/gf-sales-api.md), v13). Gate emit = `isDriverPlusSource == true`. **Cấm** đọc DB `gf-sales` (Critical Rule #1). Cùng pattern snapshot đã dùng cho insurance settlement (ADR-014).

### D4 — Tệp gửi bằng **URL tuyệt đối có hạn**, không nhúng binary

Payload mang `fileUrl` (**URL tuyệt đối**, có scheme + domain — khác `pdfUrl` relative của ADR-016 vì Driver+ là hệ ngoài, không ghép domain config được) + `expiresAt` + `checksum` (SHA-256); Driver+ tự fetch. Lý do: outbox row nhỏ, không chạm `max.message.bytes` (~1MB) với PDF nhiều trang; replay/log không phình.

Đường đi tệp (producer-side, đồng bộ trong luồng emit):

1. Render PDF bằng đúng print strategy sẵn có (`gf-sales` `V1PrintStrategy` · `gf-accounting` `DocPrintService.generatePdf(SETTLEMENT)` — ADR-016 §Phase B).
2. Upload `ct-file-storage` `POST /api/v1/files/upload-files` (multipart) → `{fileUrl, fileName, size}` (ADR-016 §Phase C).
3. Ghi outbox row cùng transaction nghiệp vụ (ADR-004) với `fileUrl` đã có.

**TTL = 30 ngày** kể từ `occurredAt`, mang trong `expiresAt`. Chọn 30 ngày vì: (a) đây là chứng từ Driver+ ghi vào hồ sơ số của xe, không phải link tải tức thời — cửa sổ phải sống qua sự cố/consumer lag của đối tác (alert lag hiện đặt ở mức giờ, `INTEG-EXT-driver-plus.md` §13); (b) mốc ngắn kiểu 300s sẽ vỡ ngay lần đầu D+ down.

**Bản chất của `expiresAt`**: **signed URL TTL là thứ ADR-016 đã chốt KHÔNG dùng** — quyết định kiến trúc có chủ đích ("KHÔNG signed URL TTL", đơn giản hoá per user feedback 2026-06-17, supersede mốc 300s trước đó), không phải giới hạn của `ct-file-storage`. Vì vậy `expiresAt` ở đây là **deadline hợp đồng**: D+ phải fetch trước mốc đó, GMS không cam kết URL sống sau đó. Muốn cưỡng chế ở tầng storage thì phải **supersede/sửa ADR-016** (Architecture Authority) — không phải chờ Platform bật tính năng.

**Hết hạn / fetch lỗi**: GMS **không** tự phát lại. Không có kênh REST ngược từ D+ (ADR-029 — tích hợp thuần Kafka). Cách xử lý: vận hành re-queue outbox row (`FAILED`/`SENT` → `PENDING`, runbook `INTEG-EXT-driver-plus.md` §13) để phát lại cùng `event_id`; D+ dedupe theo `event_id` nên phát lại chỉ có tác dụng khi D+ chưa ghi nhận. Nếu nghiệp vụ cần D+ chủ động xin lại → CR thêm step inbound `DOCUMENT.RESEND.REQUEST` (ngoài phạm vi đợt này).

### D5 — `event_id` deterministic theo mã phiếu

`event_id = UUIDv5(NS_DP_DOCUMENT, documentCode + "|" + documentType)` với namespace cố định `NS_DP_DOCUMENT = 3f1a7c52-8b6d-4e29-9a10-b7c4d5e6f708`. Retry kỹ thuật lặp y nguyên `event_id` → D+ dedupe sạch, khớp câu chữ Product ("GMS đảm bảo `event_id` ổn định qua các lần retry", `FEAT-SO-DETAIL:139`). `messageId` của step SYNC **đặt bằng** `event_id` (retry-stable ở cả 2 lớp).

**Known limitation (chấp nhận có ý thức)**: khoá **không có `revision`** → phiếu được **sửa / xuất lại** sau khi đã emit sẽ mang cùng `event_id` và bị D+ bỏ qua. Nếu nghiệp vụ có case xuất lại phiếu → CR bổ sung `revision` vào khoá (breaking với dedupe store phía D+, cần thống nhất trước).

### D6 — Không thêm bảng, không migration

Cả 2 boundary tái dùng outbox sẵn có. Không cần lưu vết "đã emit" riêng vì `event_id` là **hàm thuần** của `(documentCode, documentType)`. `gf-accounting` dùng `ddl-auto=update` (Gotcha #5) nên nếu sau này phát sinh cột thì cũng additive, **không** Flyway DDL; đợt này không phát sinh cột nào.

### D7 — Kill-switch riêng: feature flag `Document:DriverPlus`

Độc lập với `Booking:DriverPlus` / `PartnerLink:DriverPlus` (`INTEG-EXT-driver-plus.md` §11). Default `on` khi release. Tắt → 2 boundary ngừng emit, không ảnh hưởng booking relay.

## Alternatives considered

| Phương án | Ưu | Nhược | Lý do loại |
|---|---|---|---|
| Gom emit về `gf-sales` (1 producer) | 1 nơi cấu hình adapter | `gf-sales` phải theo dõi vòng đời phiếu quyết toán của boundary khác | Vi phạm boundary isolation; trái precedent ADR-029 |
| Route qua `gf-erp-agent` | Tập trung bridge | Thêm hop, thêm độ trễ, `gf-erp-agent` là bridge ERP/COP | ADR-029 đã loại cho Driver+ |
| Tái dùng `AC-DEV-BOOKING-EVENTS` | Không thêm topic | Trộn consumer group booking với chứng từ; ảnh hưởng contract production | D2 |
| Nhúng binary base64 trong payload | D+ không cần fetch | PDF nhiều trang chạm `max.message.bytes`; outbox + log phình; replay tốn kém | D4 |
| Signed URL TTL ngắn (300s) | Bảo mật chặt hơn | ADR-016 đã chốt **KHÔNG dùng signed URL TTL** (quyết định kiến trúc 2026-06-17, supersede mốc 300s); ngoài ra 300s vỡ ngay khi D+ lag | D4 — đổi được thì phải supersede/sửa ADR-016 |
| Hoãn `SERVICE_ORDER.REVOKED` sang CR sau (ship 2 step SYNC trước) | Ship nhanh hơn, không chờ Driver+ xác nhận handler | Phiếu DV đã huỷ vẫn nằm trong hồ sơ số của xe → sai lệch dữ liệu đối tác | Quyết định user 2026-08-10 (Q6) — **superseded 2026-08-11** (v6): premise "SO có thể huỷ sau Hoàn thành" không đúng (xem D3), nên không còn phương án nào giữa "ship ngay" vs "hoãn" — step bị loại bỏ hoàn toàn |
| Khai báo luôn `SETTLEMENT.REVOKED` | Đối xứng 2 loại phiếu | Không có luồng nghiệp vụ hủy phiếu QT — `FEAT-STL-DETAIL` EC-7/AC-16..18 đã bị BA gỡ 2026-08-03 | Loại ở round 2 (Q8); CR bổ sung nếu BA xác nhận sau |
| Giữ `SERVICE_ORDER.REVOKED` chờ D+ xác nhận handler (Open Question #1 gốc) | Đối xứng nếu path thật sự xảy ra | Path kích hoạt (huỷ phiếu quyết toán → reopen SO → huỷ SO) không tồn tại — chờ D+ xác nhận cho 1 step không bao giờ fire là lãng phí effort tích hợp | Loại 2026-08-11 (v6) — cùng root-cause với dòng "Khai báo luôn SETTLEMENT.REVOKED" ở trên; CR bổ sung nếu BA xác nhận có luồng huỷ phiếu QT thật sau này |

## Consequences

**Tích cực**

- Đóng 3 marker `NEED CONFIRMATION Architecture` trong Product (tên event + định dạng tệp).
- Không có breaking change: topic mới, step mới, không đụng contract đang chạy.
- Không schema change, không migration → cutover chỉ là deploy + bật flag.

**Tiêu cực / rủi ro**

- `gf-sales-api.md` §3bis.2 (`for-settlement` +3 field) phải deploy **trước** producer `gf-accounting` — thứ tự cutover bắt buộc.
- `gf-sales` và `gf-accounting` **mới trở thành caller trực tiếp của `ct-file-storage`** (trước đó chỉ BFF gọi — ADR-016). Thêm 1 dependency đồng bộ trong luồng emit; lỗi upload → không ghi outbox → phiếu vẫn hoàn thành/tạo bình thường (KHÔNG rollback state nghiệp vụ), ghi ngoại lệ cho vận hành.
- D+ phải có handler cho 2 step mới (`SERVICE_ORDER.SYNC` + `SETTLEMENT.SYNC`).
- Dedupe không có `revision` (D5) — xuất lại phiếu bị bỏ qua phía D+.

## Open Questions

1. ~~Driver+ team xác nhận đã có handler cho `DOCUMENT.SERVICE_ORDER.REVOKED` trước cutover~~ — **RESOLVED v6 (moot)**: step `DOCUMENT.SERVICE_ORDER.REVOKED` bị loại bỏ hoàn toàn khỏi contract (xem D3) — không còn gì để D+ cần confirm handler. Contract W07 document-sync chỉ còn 2 step (`SERVICE_ORDER.SYNC` + `SETTLEMENT.SYNC`), cả 2 đều D+ cần handler nhưng không phải Open Question (đã ratified từ v1).
2. ~~`folderType` dùng khi upload `ct-file-storage`~~ — **RESOLVED v4** (Delivery Authority sonhoang chốt 2026-08-11, xem Change Log v3 + v4): **1 giá trị dùng chung `folderType="SO"`** cho cả 2 loại chứng từ — phiếu dịch vụ (`gf-sales`, `DOCUMENT.SERVICE_ORDER.SYNC`, chốt qua GAP-W07-GSL-03) và phiếu quyết toán (`gf-accounting`, `DOCUMENT.SETTLEMENT.SYNC`, chốt qua GAP-W07-GAC-02) — vì cả 2 đều thuộc cùng 1 Service Order gốc. Thay thế đề xuất split 2 giá trị (`SETTLEMENTS`/`SERVICE_ORDERS`) ở v1/v2.
3. Nếu Security yêu cầu cưỡng chế hạn tải ở tầng storage → cần **CR supersede/sửa ADR-016** ("KHÔNG signed URL TTL" là quyết định của Architecture Authority, không phải giới hạn platform). Trước khi đó, `expiresAt` giữ nghĩa deadline hợp đồng.
4. Luồng hủy phiếu quyết toán: endpoint `POST /api/v1/settlements/{code}/cancel` có trong API baseline nhưng `FEAT-STL-DETAIL` đã gỡ AC-16/17/18 (2026-08-03) vì chức năng không tồn tại. Nếu BA xác nhận sau này có luồng thật → CR bổ sung step `DOCUMENT.SETTLEMENT.REVOKED`, thuần additive (đối xứng D3).
5. ~~Retention của tệp chứng từ phía D+ và phía `ct-file-storage`~~ — **RESOLVED v5** (Delivery Authority sonhoang chốt 2026-08-11, xem Change Log v5): **giữ vĩnh viễn** (không xóa/không có lifecycle expiry) tại `ct-file-storage` — khác với `expiresAt` (TTL 30 ngày, chỉ là deadline hợp đồng cho Driver+ tải tệp, KHÔNG phải storage lifecycle). Platform KHÔNG cấu hình auto-purge cho `folderType="SO"` documents nguồn document-sync này.

## References

- Product: `FEAT-SO-DETAIL` AC-17 + `BR-SO-DTL-007` · `FEAT-STL-CREATE` AC-3/AC-4 + `BR-STL-CRE-008` · `FEAT-SO-DETAIL` AC-22..24 (huỷ phiếu)
- ADR: [ADR-029](ADR-029-driver-plus-kafka-adapter-on-gf-system.md) (giao thức GMS ↔ D+) · [ADR-016](ADR-016-insurance-dossier-pdf-s3.md) (PDF + ct-file-storage) · ADR-004 (outbox) · ADR-013 (additive only) · ADR-014 (settlement ownership)
- Integration: [INTEG-EXT-driver-plus.md](../integrations/INTEG-EXT-driver-plus.md) §4.3
- Events: [gf-sales-events.md](../events/gf-sales-events.md) §2ter/§3.10/§3.11 · [gf-accounting-events.md](../events/gf-accounting-events.md) §3.3 · [`_CONVENTIONS.md`](../events/_CONVENTIONS.md) §2/§11
- Quyết định nền: `Tracking/arch-design-document-sync-answers-1.md` (Q1–Q6, 2026-08-10) · `Tracking/arch-design-partner-link-answers-1.md` Q4 (scope gap W07)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-11 | 6 | Delivery Authority (sonhoang) — chốt qua `/warm-up gf-sales --phase A` gap GAP-W07-GSL-02 | **D3 — loại bỏ hoàn toàn step `DOCUMENT.SERVICE_ORDER.REVOKED`** (không chỉ hoãn qua CR như quyết định 2026-08-10 Q6): user xác nhận **"hủy phiếu quyết toán" không phải luồng nghiệp vụ tồn tại** — đây là premise DUY NHẤT khiến REVOKED khả đạt (đường: huỷ phiếu QT → reopen SO → huỷ SO), cùng root-cause đã dùng để gỡ `SETTLEMENT.REVOKED` ở round 2 (2026-08-10, Q8). Contract W07 document-sync còn **2 `MessageStep`** (`SERVICE_ORDER.SYNC` + `SETTLEMENT.SYNC`, cả 2 đều SYNC-only, không REVOKED). D3 table + achievability note rewrite; D5 bỏ khoá dedupe riêng cho REVOKED; D6 bỏ mention "bản REVOKED tự correlate"; Alternatives table +2 row phản ánh đảo ngược quyết định Q6; Consequences "D+ phải có handler cho 3 step" → "2 step"; Open Question #1 đóng (moot — không còn gì cần D+ xác nhận). Cascade bắt buộc (thực hiện cùng version bump này): `gf-sales-events.md` (xóa catalog row 7c + §2ter E3 + §3.11 schema), `gf-sales-HLD.md` (xóa bullet "Thu hồi"), `INTEG-EXT-driver-plus.md` (xóa row #14 step table, step count 14→13), `gf-sales-api.md` (enum `DocumentMessageStep` bỏ `SERVICE_ORDER.REVOKED`, còn 2 giá trị), `_CONVENTIONS.md` (§11 cross-boundary topic bảng bỏ step), `PKG-W07-partner-link-booking-driver-plus.md` (bỏ mọi mention REVOKED ở §2.2.3/§4.1/§5.1), `Plan/WAVE-SEQUENCE.md` (Core contracts DOCUMENT 3→2 step, tổng 14→13 MessageStep, Exit Criteria bỏ clause REVOKED). Cross-ref: `Tracking/warm-up/WAVE07/W07-gf-sales-warm-up-phaseA.md` GAP-W07-GSL-02 (RESOLVED). |
| 2026-08-11 | 5 | Delivery Authority (sonhoang) — chốt qua `/warm-up gf-sales --phase A` gap GAP-W07-GSL-05 | **Open Question #5 resolved — Retention chứng từ document-sync**: chốt **giữ vĩnh viễn** (không lifecycle expiry / không auto-purge) cho tệp `folderType="SO"` tại `ct-file-storage` — khác `expiresAt` TTL 30 ngày (D4, chỉ là deadline hợp đồng cho Driver+ tải tệp). Cross-ref: `Tracking/warm-up/WAVE07/W07-gf-sales-warm-up-phaseA.md` GAP-W07-GSL-05 (RESOLVED, chuyển từ DEFERRED do `--fix` subagent trước đó). |
| 2026-08-11 | 4 | Delivery Authority (sonhoang) — chốt qua `/warm-up gf-accounting --phase A` gap GAP-W07-GAC-02 | **Open Question #2 fully resolved — `folderType` phía `gf-accounting`**: chốt `folderType="SO"` cho upload PDF phiếu quyết toán (`gf-accounting`) khi đồng bộ chứng từ sang Driver+, thay đề xuất ban đầu `SETTLEMENTS`. Đồng nhất với quyết định v3 phía `gf-sales` (cũng `folderType="SO"`) — 1 giá trị dùng chung cho cả 2 loại chứng từ vì cùng thuộc 1 Service Order gốc. Open Question #2 nay **đóng hoàn toàn**. Cross-ref: `Tracking/warm-up/WAVE07/W07-gf-accounting-warm-up-phaseA.md` GAP-W07-GAC-02 (RESOLVED) · sibling `Tracking/warm-up/WAVE07/W07-gf-sales-warm-up-phaseA.md` GAP-W07-GSL-03 (RESOLVED, v3). |
| 2026-08-11 | 3 | Delivery Authority (sonhoang) — chốt qua `/warm-up gf-sales --phase A` gap GAP-W07-GSL-03 | **Open Question #2 partial resolve — `folderType` phía `gf-sales`**: chốt `folderType="SO"` cho upload PDF phiếu dịch vụ (`gf-sales`) khi đồng bộ chứng từ sang Driver+, thay đề xuất ban đầu `SERVICE_ORDERS`. Phía `gf-accounting` (phiếu quyết toán, đề xuất `SETTLEMENTS`) **vẫn OPEN** — chưa được Platform xác nhận, không thuộc quyết định lần này. Cross-ref: `Tracking/warm-up/WAVE07/W07-gf-sales-warm-up-phaseA.md` GAP-W07-GSL-03 (RESOLVED) · sibling gap `GAP-W07-GAC-02` (gf-accounting warm-up, vẫn OPEN cho phần `SETTLEMENTS`). |
| 2026-08-10 | 2 | Architecture Authority (agent-arch-author) | **Round 2 sau arch-review (mandate Q7–Q10)**: (Q8) gỡ step `DOCUMENT.SETTLEMENT.REVOKED` khỏi D3 + Alternatives + Consequences + Open Q — tiền đề round 1 sai vì `FEAT-STL-DETAIL` EC-7/AC-16..18 đã bị Business Authority gỡ 2026-08-03; contract còn **3 step**. (Q7) thêm **D3bis** — điều kiện emit của `gf-accounting` lấy từ 3 field additive `bookingCode`/`externalBookingId`/`isDriverPlusSource` trong snapshot `for-settlement` (`gf-sales-api.md` §3bis.2 v13), đóng P0 vi phạm Critical Rule #1. (Q9) D4 + Open Q3: KHÔNG signed URL là **quyết định ADR-016**, gỡ ràng buộc = supersede ADR-016, không phải chờ Platform. (Q10) frontmatter `boundary` → `global` (precedent ADR-029); D4 khẳng định `fileUrl` là URL **tuyệt đối**. |
| 2026-08-10 | 1 | Architecture Authority (agent-arch-author) | Initial — đồng bộ chứng từ GMS → Driver+ (phiếu dịch vụ + phiếu quyết toán): topic `AC-DEV-DOCUMENT-EVENTS`, 4 MessageStep, mỗi boundary tự emit, tệp qua URL TTL 30 ngày, `event_id` UUIDv5 theo mã phiếu, không schema change. |
