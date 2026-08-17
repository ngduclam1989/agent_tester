---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-08-10"
---

# FEAT-BOOK-DRIVERPLUS-OUTBOUND: Phản hồi và đồng bộ trạng thái lịch hẹn sang Driver+

> **Bối cảnh viết lại (2026-08-03)**: Cùng đợt viết lại với `FEAT-BOOK-DRIVERPLUS-INBOUND.md` — đặc tả phía **gửi** (outbound) của GMS khi trạng thái booking thay đổi, để Driver+ đồng bộ hiển thị lại cho khách hàng. Thay thế AC-15 cũ tại `FEAT-BOOK-EDIT.md` **KHÔNG áp dụng** (edit-sync giữ nguyên, xem §7 Out of Scope) — feature này chỉ cover đồng bộ **trạng thái vòng đời** (xác nhận/từ chối/xe đến/hủy), không cover đồng bộ khi sửa nội dung lịch hẹn.
>
> **Nguồn**: FEAT-DP-035 Nhóm 3 (chiều về — cập nhật trạng thái), Nhóm 6 (retry/dead-letter), Nhóm 7 (chống trùng lặp), phía Driver+.
> **Không cover**: emit phiếu dịch vụ/phiếu quyết toán sang Driver+ — logic đó thuộc `FEAT-SO-DETAIL` (AC hoàn thành phiếu DV) và `FEAT-STL-CREATE` (AC tạo phiếu QT), theo quyết định giữ đúng boundary ownership (không tạo FEAT/BR cross-boundary riêng).

---

## Metadata

| Field       | Value                                                |
| ----------- | ---------------------------------------------------- |
| Feature ID  | `FEAT-BOOK-DRIVERPLUS-OUTBOUND`                      |
| Title       | Phản hồi và đồng bộ trạng thái lịch hẹn sang Driver+ |
| Parent Epic | `EP-BOOKING`                                         |
| Boundary    | `gf-sales`                                           |
| Priority    | P0 (thay thế cơ chế đang production)                 |
| Status      | PLANNED                                              |

## 1. User Story

**As** hệ thống `gf-sales`, **I want** phản hồi lại Driver+ đúng và đầy đủ mỗi khi trạng thái lịch hẹn thay đổi (do garage xử lý hoặc do hệ thống tự động), **so that** khách hàng trên Driver+ luôn thấy đúng trạng thái thực tế của lịch hẹn mà không bị trễ hay sai lệch.

## 2. Acceptance Criteria

### Nhóm A — Đồng bộ trạng thái khi garage xử lý

- [ ] **AC-1**: Gửi cập nhật khi garage xác nhận lịch hẹn
  - Tại: sau khi garage xác nhận lịch hẹn thành công (`FEAT-BOOK-CONFIRM`, không đổi).
  - Khi: trạng thái booking chuyển sang **"Đã xác nhận"**.
  - Thì: hệ thống gửi sự kiện cập nhật trạng thái sang Driver+ với giá trị chuẩn hoá **"Đã xác nhận"** (khớp đúng 1 trong 5 nhãn trạng thái đã thống nhất với Driver+ — Chờ xác nhận/Đã xác nhận/Từ chối/Xe đã đến/Đã hủy).

- [ ] **AC-2**: Gửi cập nhật khi garage từ chối lịch hẹn
  - Tại: sau khi garage từ chối lịch hẹn thành công (`FEAT-BOOK-DECLINE`, không đổi).
  - Khi: trạng thái booking chuyển sang **"Đã từ chối"**.
  - Thì: hệ thống gửi sự kiện cập nhật trạng thái sang Driver+ với giá trị chuẩn hoá **"Từ chối"**.

- [ ] **AC-3**: Gửi cập nhật khi ghi nhận xe đã đến
  - Tại: sau khi garage ghi nhận xe đã đến (`FEAT-BOOK-ARRIVE`, không đổi).
  - Khi: trạng thái booking chuyển sang **"Xe đã đến"**.
  - Thì: hệ thống gửi sự kiện cập nhật trạng thái sang Driver+ với giá trị chuẩn hoá **"Xe đã đến"**.

- [ ] **AC-4**: Gửi cập nhật khi booking chuyển "Đã hủy" — bắt buộc kèm `cancel_source` (v2, làm rõ điều kiện gửi — BA-review F3)
  - Tại: sau khi booking **có nguồn Driver+** chuyển sang **"Đã hủy"** — bất kể nguyên nhân (khách hủy qua Driver+ theo `FEAT-BOOK-DRIVERPLUS-INBOUND` AC-6, garage tự hủy theo `FEAT-BOOK-CANCEL`, hoặc quá hạn tự động NO_SHOW theo `FEAT-BOOK-LIST` AC-14). `cancel_source` được ghi nhận nội bộ cho **mọi** booking hủy (kể cả booking không phải nguồn Driver+ — per `BR-BOOK-023`), nhưng AC này chỉ áp dụng phần **gửi sang Driver+**, vốn chỉ tồn tại khi booking có nguồn Driver+ (Driver+ không biết và không cần biết booking không phải của họ).
  - Khi: hệ thống gửi sự kiện cập nhật trạng thái sang Driver+.
  - Thì: payload **luôn phải kèm** `cancel_source` (1 trong 3 giá trị: `DRIVERPLUS_USER` / `GARAGE_INTERNAL` / `NO_SHOW_AUTO`, per `BR-BOOK-023`) — đây là trường bắt buộc, không được thiếu (Driver+ coi cập nhật "Đã hủy" thiếu `cancel_source` là dữ liệu không hợp lệ và sẽ không áp dụng, per FEAT-DP-035 AC-7).

- [ ] **AC-5**: Booking không đủ điều kiện áp dụng yêu cầu hủy — phản hồi lại trạng thái thực tế, không phải "từ chối"
  - Tại: sau khi hệ thống nhận yêu cầu hủy từ Driver+ nhưng gate không cho phép áp dụng (`FEAT-BOOK-DRIVERPLUS-INBOUND` AC-7 — VD xe đã đến).
  - Khi: hệ thống xử lý xong việc không áp dụng hủy.
  - Thì: hệ thống gửi sự kiện cập nhật trạng thái sang Driver+ mang **đúng trạng thái hiện tại thực tế** của booking (VD "Xe đã đến") — đây là hành động "đồng bộ lại sự thật", không phải "garage từ chối yêu cầu hủy"; Driver+ tự diễn giải và thông báo phù hợp cho khách hàng (thuộc FEAT-DP-036, ngoài phạm vi feature này).

- [ ] **AC-6**: Phản hồi sau khi tạo lịch hẹn mới thành công
  - Tại: ngay sau khi `FEAT-BOOK-DRIVERPLUS-INBOUND` AC-1 tạo lịch hẹn mới thành công.
  - Khi: hệ thống hoàn tất tạo booking.
  - Thì: hệ thống gửi phản hồi xác nhận đã nhận và tạo thành công về Driver+ (booking đang ở "Chờ xác nhận" phía hiển thị Driver+, tương ứng "Lịch hẹn mới" phía GMS).

### Nhóm B — Xử lý sự cố khi gửi

- [ ] **AC-7**: Gửi thất bại tạm thời — tự thử lại, không đổi trạng thái nội bộ
  - Tại: khi gửi bất kỳ sự kiện nào ở Nhóm A.
  - Khi: việc gửi không thành công do sự cố tạm thời (mạng, phía Driver+ không phản hồi kịp).
  - Thì: hệ thống tự động thử lại theo outbox pattern (Spring Retry + Resilience4j, per Critical Rule #2), giãn cách thời gian tăng dần giữa các lần thử — **trạng thái booking phía GMS KHÔNG rollback**, không phụ thuộc kết quả gửi có thành công hay không (garage đã xử lý xong phần việc của mình).

- [ ] **AC-8**: Hết số lần thử lại — chuyển ngoại lệ cho vận hành, không tự suy kết quả
  - Tại: một sự kiện đã thử gửi nhiều lần theo AC-7 nhưng vẫn thất bại.
  - Khi: hệ thống hết số lần thử cho phép.
  - Thì: hệ thống dừng tự động thử lại, ghi nhận ngoại lệ để đội vận hành garage xử lý thủ công (không tự đánh dấu thành công hay thất bại thay).

- [ ] **AC-9**: Gửi lặp cùng một cập nhật trạng thái — Driver+ chỉ áp dụng một lần
  - Tại: khi hệ thống gửi lại (retry) cùng một sự kiện cập nhật trạng thái nhiều lần.
  - Khi: Driver+ nhận các lượt gửi lặp đó.
  - Thì: mỗi sự kiện mang `event_id` ổn định, không đổi qua các lần retry — Driver+ dedupe theo `event_id` để chỉ áp dụng đúng một lần (per FEAT-DP-035 AC-19, phía nhận). GMS đảm bảo không tự sinh `event_id` mới cho cùng 1 lần thay đổi trạng thái khi retry.

### Nhóm C — Gửi kết quả từ chối khi không xử lý được yêu cầu inbound

- [ ] **AC-10**: Phản hồi từ chối khi yêu cầu đặt lịch không hợp lệ
  - Tại: ngay sau khi hệ thống nhận yêu cầu đặt lịch từ Driver+ (`FEAT-BOOK-DRIVERPLUS-INBOUND` AC-2) nhưng payload không hợp lệ — thiếu 1 trong 5 trường bắt buộc, hoặc giờ hẹn không đúng bước 15 phút (`FEAT-BOOK-DRIVERPLUS-INBOUND` EC-3, nay RESOLVED).
  - Khi: hệ thống phát hiện lỗi tại adapter gate, trước khi tạo booking.
  - Thì: hệ thống phát event phản hồi Kafka `BOOKING.CREATE.RESPONSE` với `success=false`, mã lỗi `ERR-BOOK-001` và correlation tới `messageId` của request inbound — không tạo booking, không ghi nhận vào Danh sách lịch hẹn.

- [ ] **AC-11**: Phản hồi khi yêu cầu hủy không xác định được booking
  - Tại: sau khi `FEAT-BOOK-DRIVERPLUS-INBOUND` AC-8 ghi nhận ngoại lệ nội bộ (mã booking trong yêu cầu hủy không khớp booking nào).
  - Khi: hệ thống hoàn tất xử lý ngoại lệ đó.
  - Thì: hệ thống phát event phản hồi Kafka `BOOKING.CANCEL.RESPONSE` với mã lỗi `ERR-BOOK-002` và correlation tới `messageId` của request inbound — Driver+ tự xử lý hiển thị phù hợp cho khách hàng, không retry vô hạn theo cơ chế Nhóm B (vốn chỉ dành cho lỗi gửi tạm thời, không phải request sai từ đầu).

## 3. UI/UX Reference

> Không phát sinh màn hình mới phía Web GMS — feature này thuần backend/event, không có UI riêng. Các màn hình liên quan (`FEAT-BOOK-CONFIRM`, `FEAT-BOOK-DECLINE`, `FEAT-BOOK-ARRIVE`, `FEAT-BOOK-CANCEL`) giữ nguyên, chỉ thêm side-effect gửi event ở phía sau.

## 4. API Reference

- Boundary: `gf-sales`, gửi qua kênh sự kiện Kafka (per BR-CROSS-006), outbox mandatory (ADR-004, Critical Rule #2).
- Outbound cập nhật trạng thái: Kafka `MessageStep=BOOKING.CHANGE.STATUS`; giữ nguyên step production. `BookingStatusChanged` bổ sung additive `cancelSource` và `driverPlusStatus`, không phải breaking change.
- Outbound phản hồi tạo mới: Kafka `MessageStep=BOOKING.CREATE.RESPONSE`; giữ nguyên step production, dùng thêm nhánh `success=false` khi request không hợp lệ.
- Phản hồi từ chối (AC-10, AC-11): cũng là Kafka event có correlation, không phải HTTP response đồng bộ. Event `BOOKING.CREATE.RESPONSE` cho yêu cầu tạo và `BOOKING.CANCEL.RESPONSE` cho yêu cầu hủy; Driver+ khớp qua `data.correlation.requestEventId` và `headers.OriginMessageCode`.

## 5. Business Rules

- **BR-BOOK-005** (rewrite, xem cite tại `FEAT-BOOK-DRIVERPLUS-INBOUND.md`): garage phản hồi Driver+ qua sự kiện chuẩn hoá sau khi tạo/xử lý booking.
- **BR-BOOK-023** (mới, xem cite tại `FEAT-BOOK-DRIVERPLUS-INBOUND.md`): `cancel_source` bắt buộc khi trạng thái = "Đã hủy".
- **BR-BOOK-024** (v2, làm rõ phạm vi F4): Sự kiện outbound sang Driver+ do `gf-sales` phát hành (tạo mới booking, cập nhật trạng thái — phạm vi feature này) tuân thủ outbox/inbox mandatory (Critical Rule #2) — state cục bộ phía GMS không rollback khi gửi thất bại; retry độc lập với transaction nghiệp vụ đã commit. Emit phiếu quyết toán thuộc `gf-accounting`, có outbox pattern riêng — xem `FEAT-STL-CREATE` BR-STL-CRE-008.

> Xem chi tiết đầy đủ tại [Product/business-rules/BR-GF-SALES.md](../business-rules/BR-GF-SALES.md) §2.1 + §3.1.

## 6. Edge Cases

- **EC-1**: Garage xử lý 2 hành động liên tiếp rất nhanh trên cùng 1 booking (VD xác nhận rồi hủy ngay) — mỗi hành động vẫn gửi 1 sự kiện riêng theo đúng thứ tự xảy ra, không gộp lại.
- **EC-2** (RESOLVED, BA-review F3): Booking có nguồn KHÔNG phải từ Driver+ (Garage Care, Walk-in) chuyển trạng thái — **chốt: KHÔNG gửi sự kiện sang Driver+**. Toàn bộ Nhóm A (AC-1..6) chỉ áp dụng cho booking có nguồn Driver+ — Driver+ chỉ theo dõi booking do chính khách hàng của họ tạo, không có case garage tự tạo hộ + đẩy sang D+ trong đợt viết lại này (xem §7 Out of Scope). `cancel_source` vẫn được ghi nhận nội bộ cho booking không phải nguồn D+ (per `BR-BOOK-023`), chỉ là không có payload gửi đi.

## 7. Out of Scope

- Emit phiếu dịch vụ/phiếu quyết toán (mã phiếu + tệp) sang Driver+ — thuộc `FEAT-SO-DETAIL` AC hoàn thành phiếu DV + `FEAT-STL-CREATE` AC tạo phiếu QT (xem 2 file đó).
- Đồng bộ khi **sửa nội dung** lịch hẹn (không đổi trạng thái vòng đời) — giữ nguyên `FEAT-BOOK-EDIT.md` AC-15 hiện có, không thuộc phạm vi feature này.
- Đồng bộ ngược booking tạo từ kênh khác (Garage Care/Walk-in) cho khách đã liên kết Driver+ — không có trong 3 tài liệu nguồn mới, xem `FEAT-BOOK-DRIVERPLUS-INBOUND.md` §7.
- Nội dung thông báo đẩy hiển thị cho khách hàng — thuộc `FEAT-DP-036` (ngoài repo này).

## 8. Feature-flag

Dùng chung flag `Booking:DriverPlus` với `FEAT-BOOK-DRIVERPLUS-INBOUND` — xem chi tiết đầy đủ (`default_state`, `rollout_scope`, `kill_switch_owner`, behavior khi `off`) tại `FEAT-BOOK-DRIVERPLUS-INBOUND.md` §8. Khi flag `off`, feature này ngừng gửi các sự kiện thuộc luồng booking (đồng bộ trạng thái và phản hồi tạo/hủy, bao gồm AC-10/11), song song với INBOUND ngừng nhận request.

Flag này **không điều khiển** việc gửi phiếu dịch vụ/phiếu quyết toán. Hai luồng chứng từ thuộc `FEAT-SO-DETAIL` và `FEAT-STL-CREATE`, dùng flag riêng `Document:DriverPlus`. Hai công tắc hoạt động độc lập: tắt booking không tự động dừng gửi chứng từ phát sinh từ booking Driver+ đã tồn tại.

## 9. Change Log

| Date       | Version | Author                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-03 | 1       | user (Business Authority) qua main agent | **Khởi tạo** — tách riêng khỏi `FEAT-BOOK-DRIVERPLUS-INBOUND.md` theo đúng chiều outbound. Viết theo FEAT-DP-035 Nhóm 3/6/7 (phía Driver+). Điểm mới quan trọng nhất so với cơ chế cũ: `cancel_source` **bắt buộc** khi trạng thái = "Đã hủy" (AC-4) — trước đây `BOOKING.UPDATE.RESPONSE` không có field này. Quyết định (đồng ý với user 2026-08-03): logic emit phiếu DV/QT **không** đặt trong feature này — thêm AC trực tiếp vào `FEAT-SO-DETAIL`/`FEAT-STL-CREATE` theo boundary ownership sẵn có, tránh tạo FEAT/BR cross-boundary không cần thiết.                                                                                                                                                                                                                                                                                                                     |
| 2026-08-03 | 2       | user (Business Authority) qua main agent | **Fix batch F3/F4/F7 (BA-review round 1, 2026-08-03)**: (F3) AC-4 viết lại "Tại" — chốt rõ: `cancel_source` luôn ghi nhận nội bộ cho mọi booking hủy, chỉ **payload gửi Driver+** (chỉ tồn tại cho booking nguồn D+) mới bắt buộc có trường này; EC-2 chuyển NEED CONFIRMATION → **RESOLVED** cùng logic. (F4) §5 BR-BOOK-024 thu hẹp phạm vi — loại trừ phiếu quyết toán (thuộc `gf-accounting`, outbox riêng, xem `BR-STL-CRE-008`/`CB-ACC-008`), tránh nhận vơ ownership cross-boundary. (F7) Thêm **Nhóm C** (AC-10, AC-11) — phản hồi từ chối đồng bộ khi yêu cầu inbound không hợp lệ (payload sai — `ERR-BOOK-001`) hoặc không tìm thấy booking cho yêu cầu hủy (`ERR-BOOK-002`), mã lỗi mới đăng ký tại `ERROR-CODE-REGISTRY.md` §6 (`API_RESPONSE`, không render GMS UI); §4 API Reference bổ sung mô tả kênh phản hồi đồng bộ khác với 2 kênh event outbound hiện có. |
| 2026-08-03 | 3       | user (Business Authority) qua main agent | **Thêm §8 Feature-flag** (cross-ref, chi tiết đầy đủ tại `FEAT-BOOK-DRIVERPLUS-INBOUND.md` §8) — dùng chung flag `Booking:DriverPlus`, default `on` mọi tenant. §8 cũ (Change Log) đổi thành §9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-08-10 | 4       | Business Authority qua main agent        | **Chốt Kafka theo ADR-029**: response lỗi tạo/hủy booking đổi từ mô tả HTTP đồng bộ sang event correlated (`BOOKING.CREATE.RESPONSE` / `BOOKING.CANCEL.RESPONSE`); chốt `BOOKING.CHANGE.STATUS` và additive `cancelSource`/`driverPlusStatus`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-08-10 | 5       | Business Authority qua main agent        | **Đồng bộ feature flag với ADR-031**: sửa phạm vi `Booking:DriverPlus` chỉ điều khiển các sự kiện booking. Phiếu dịch vụ/quyết toán dùng flag độc lập `Document:DriverPlus`; tắt booking không tự động dừng chứng từ của booking Driver+ đã tồn tại.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
