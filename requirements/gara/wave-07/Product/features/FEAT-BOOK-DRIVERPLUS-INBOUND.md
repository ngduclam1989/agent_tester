---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-08-10"
---

# FEAT-BOOK-DRIVERPLUS-INBOUND: Nhận yêu cầu đặt lịch và yêu cầu hủy từ Driver+

> **Bối cảnh viết lại (2026-08-03)**: Đội Driver+ đã thiết kế lại toàn bộ tích hợp booking ↔ garage (FEAT-DP-034 biểu mẫu đặt lịch, FEAT-DP-035 relay 2 chiều, FEAT-DP-046 ghi VAP — phía D+). Feature này **thay thế hoàn toàn** AC-23/AC-24 cũ tại `FEAT-BOOK-CREATE.md` (nay SUPERSEDED, xem Change Log file đó) — đặc tả phía **nhận** (inbound) của GMS. Phần phản hồi/đồng bộ ngược sang Driver+ xem `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md`.
>
> **Nguồn**: FEAT-DP-034 (Nhóm 1-7 phía Driver+, đặc biệt AC-1/AC-6..11/AC-19/AC-21..25), FEAT-DP-035 (Nhóm 1, 2, 7, phía relay).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-DRIVERPLUS-INBOUND` |
| Title | Nhận yêu cầu đặt lịch và yêu cầu hủy từ Driver+ |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P0 (thay thế cơ chế đang production) |
| Status | PLANNED |

## 1. User Story

**As** hệ thống `gf-sales`, **I want** nhận đúng và đầy đủ yêu cầu đặt lịch / yêu cầu hủy do khách hàng gửi từ ứng dụng Driver+, **so that** garage có lịch hẹn chính xác để xử lý mà không cần khách hàng liên hệ trực tiếp, đồng thời không tự ý suy diễn quyết định thay garage khi có yêu cầu hủy.

## 2. Acceptance Criteria

### Nhóm A — Nhận yêu cầu đặt lịch mới

- [ ] **AC-1**: Tạo lịch hẹn mới từ yêu cầu Driver+ (thay thế AC-23 cũ)
  - Tại: kênh sự kiện inbound từ Driver+ (không qua màn hình Web GMS).
  - Khi: hệ thống nhận một yêu cầu đặt lịch hợp lệ từ Driver+ (đã qua FEAT-DP-035 AC-1 chuyển tiếp, đủ 14 trường theo đúng danh sách tại AC-2).
  - Thì: hệ thống tạo lịch hẹn mới với trạng thái **"Lịch hẹn mới"**, nguồn hiển thị **"Từ ứng dụng tài xế"**. Lịch hẹn xuất hiện trong Danh sách lịch hẹn Web GMS để chủ garage xác nhận hoặc từ chối (FEAT-BOOK-CONFIRM / FEAT-BOOK-DECLINE, không đổi).

- [ ] **AC-2**: Cấu trúc 14 trường nhận từ Driver+
  - Tại: payload yêu cầu đặt lịch từ Driver+.
  - Khi: hệ thống parse payload.
  - Thì: hệ thống nhận đúng **5 trường bắt buộc**: Số điện thoại, Tên, Ngày hẹn, Giờ hẹn (định dạng giờ 00-23 + phút bước 15 — 00/15/30/45, không phải giờ tự do), Loại dịch vụ (enum cố định 3 giá trị: **Car Spa / Bảo dưỡng / Sửa chữa** — xem AC-3 mapping); và **9 trường tùy chọn** (có thể trống): Biển số xe, Số VIN, Số km, Hãng xe, Dòng xe, Năm sản xuất, Phiên bản xe, Hình ảnh xe, Mô tả tình trạng xe/Ghi chú (1 trường gộp). Không có trường nào khác ngoài 14 trường này (không có 3 trường consent — Driver+ tự lưu, xem BR-BOOK-025). Thiếu 1 trong 5 trường bắt buộc → từ chối tại adapter gate, xem `FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-10 (BA-review F7). **Số điện thoại không cần validate lại định dạng ở adapter gate** (RESOLVED, BA-review Wave 7 F4) — trường này khoá cứng, lấy nguyên từ số điện thoại đã dùng đăng ký tài khoản Driver+ (per `FEAT-DP-034` AC-6: "Số điện thoại mặc định, không cho sửa"), không phải input tự do nên đã đảm bảo hợp lệ từ phía Driver+, không cần cite `[BR-COMMON#SYS-RETRY-027]` lặp lại.

- [ ] **AC-3**: "Loại dịch vụ" Driver+ là danh mục độc lập, không cross-mapping vào danh mục dịch vụ GMS (RESOLVED, đối chiếu FEAT-DP-034 §7)
  - Tại: khi tạo lịch hẹn từ payload Driver+.
  - Khi: hệ thống ghi nhận giá trị "Loại dịch vụ" (Car Spa/Bảo dưỡng/Sửa chữa).
  - Thì: hệ thống lưu và hiển thị **nguyên văn** giá trị này làm "loại dịch vụ macro" trên Danh sách/Chi tiết lịch hẹn — **không** map hay liên kết vào danh mục dịch vụ nội bộ GMS (`EP-CATALOG`). Đây là 2 danh mục độc lập hoàn toàn theo đúng chủ đích thiết kế phía Driver+ (`FEAT-DP-034` §7: "KHÔNG cross-mapping, KHÔNG dùng đúng 3 nhóm dịch vụ macro của biểu mẫu đặt lịch" — xác nhận rõ ràng, không phải khoảng trống cần lấp bằng gợi ý tự động).

- [ ] **AC-4**: Trường "Số điện thoại" và "Tên" dùng để khớp/tạo khách hàng
  - Tại: khi tạo lịch hẹn từ payload Driver+.
  - Khi: hệ thống xử lý thông tin khách hàng đi kèm.
  - Thì: hệ thống áp dụng đúng cơ chế khớp khách hàng theo số điện thoại đã có (BR-BOOK-004, không đổi) — không có xử lý đặc biệt gì thêm cho nguồn Driver+ so với các nguồn khác.

- [ ] **AC-5**: 9 trường tùy chọn để trống vẫn tạo lịch hẹn bình thường
  - Tại: payload yêu cầu đặt lịch từ Driver+.
  - Khi: một hoặc nhiều trường trong 9 trường tùy chọn không có giá trị (trống).
  - Thì: hệ thống tạo lịch hẹn bình thường, các trường trống hiển thị rỗng trên Chi tiết lịch hẹn — không chặn, không báo lỗi.

### Nhóm B — Nhận yêu cầu hủy từ Driver+

- [ ] **AC-6**: Áp dụng hủy ngay khi booking đủ điều kiện (thay thế AC-24 cũ)
  - Tại: kênh sự kiện inbound từ Driver+ (yêu cầu hủy, đã qua FEAT-DP-035 AC-4 chuyển tiếp).
  - Khi: hệ thống nhận yêu cầu hủy cho 1 booking đang ở trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** (2 trạng thái cho phép hủy khi khách hàng hủy qua Driver+, theo `BR-BOOK-022` — **KHÔNG dùng chung gate với `BR-BOOK-CAN-001`/`BR-BOOK-013`**, vốn chỉ áp dụng cho garage tự hủy qua nút "Hủy" trên Web GMS và hẹp hơn, chỉ cho phép ở "Đã xác nhận"; xem F1 fix 2026-08-03).
  - Thì: hệ thống **tự động** chuyển trạng thái booking sang **"Đã hủy"** — KHÔNG có bước chờ nhân viên garage bấm nút duyệt/từ chối yêu cầu hủy. Ghi nhận `cancel_source = DRIVERPLUS_USER` vào lịch sử trạng thái (xem BR-BOOK-023). Đây là **fact do khách hàng đã xác nhận trên Driver+**, garage chỉ ghi nhận lại, không có quyền "từ chối yêu cầu hủy" trừ trường hợp gate ở AC-7.

- [ ] **AC-7**: Gate — booking không đủ điều kiện hủy tại thời điểm nhận yêu cầu
  - Tại: kênh sự kiện inbound từ Driver+ (yêu cầu hủy).
  - Khi: hệ thống nhận yêu cầu hủy cho 1 booking đang ở trạng thái **"Xe đã đến"**, **"Đã từ chối"**, hoặc **"Đã hủy"** (đã khép lại) — ví dụ khách bấm hủy đúng lúc xe đã có mặt tại garage.
  - Thì: hệ thống **KHÔNG áp dụng hủy** — giữ nguyên trạng thái hiện tại, không coi đây là garage "từ chối yêu cầu" mà là đồng bộ lại đúng thực tế hiện có (xem FEAT-BOOK-DRIVERPLUS-OUTBOUND AC-tương ứng để phản hồi lại Driver+ đúng trạng thái thực tế). Cùng cơ chế này áp dụng khi booking đã có phiếu dịch vụ liên kết (khớp `BR-BOOK-CAN-002`).

- [ ] **AC-8**: Yêu cầu hủy không xác định được booking tương ứng
  - Tại: kênh sự kiện inbound từ Driver+.
  - Khi: mã booking trong yêu cầu hủy không khớp bất kỳ booking nào đang có trong hệ thống.
  - Thì: hệ thống không áp dụng thay đổi cho bất kỳ booking nào, ghi nhận ngoại lệ nội bộ để đội vận hành garage rà soát (không tự đoán/gán vào booking gần đúng nhất). Đồng thời trả phản hồi từ chối lại Driver+, xem `FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-11 (BA-review F7, mã lỗi `ERR-BOOK-002`).

### Nhóm C — Xử lý trùng lặp và ngoại lệ

- [ ] **AC-9**: Nhận trùng lặp yêu cầu đặt lịch hoặc yêu cầu hủy — chỉ áp dụng một lần
  - Tại: kênh sự kiện inbound từ Driver+.
  - Khi: cùng một yêu cầu (đặt lịch mới hoặc hủy) được gửi/nhận nhiều lần liên tiếp (do retry mạng phía Driver+, không phải 2 yêu cầu khác nhau).
  - Thì: hệ thống dedupe qua inbox (theo `event_id`, per Critical Rule #2 outbox/inbox mandatory) — chỉ tạo 1 booking mới hoặc áp dụng 1 lần thay đổi trạng thái hủy, không nhân đôi lịch hẹn hay ghi đè lịch sử trạng thái nhiều lần.

## 3. UI/UX Reference

> Không phát sinh màn hình mới phía Web GMS — tái sử dụng nguyên vẹn Danh sách lịch hẹn (`FEAT-BOOK-LIST`) và Chi tiết lịch hẹn (`FEAT-BOOK-DETAIL`) hiện có. Thay đổi chỉ ở **bảng dữ liệu Driver+ gửi sang** (payload 14 trường thay vì cấu trúc cũ) và cơ chế xử lý hủy (tự động, không qua bước duyệt).

| Kind | Platform | URL / Path |
|---|---|---|
| Màn hình tái sử dụng | web | `FEAT-BOOK-LIST.md`, `FEAT-BOOK-DETAIL.md` — không đổi. |
| Nguồn payload | — | FEAT-DP-034 (biểu mẫu đặt lịch phía Driver+, ngoài repo này) — đối chiếu khi cần xác nhận field. |

## 4. API Reference

- Boundary: `gf-sales`, tiếp nhận qua kênh sự kiện Kafka (per BR-CROSS-006).
- Inbound tạo booking mới: Kafka topic `AC-DEV-BOOKING-EVENTS`, `MessageGroup=BOOKING`, `MessageStep=BOOKING.CREATE.REQUEST`. Giữ nguyên step production khi cutover.
- Inbound yêu cầu hủy: cùng topic và `MessageGroup`, `MessageStep=BOOKING.CANCELLED`. Giữ nguyên step production khi cutover.
- Dedup: qua inbox table theo `event_id`, per Critical Rule #2.

## 5. Business Rules

- **BR-BOOK-005** (rewrite — xem `BR-GF-SALES.md` §2.1): Lịch hẹn từ Driver+ được tạo qua kênh sự kiện tự động, đủ 14 trường (5 bắt buộc + 9 tùy chọn) — garage không nhập liệu mà chỉ xác nhận hoặc từ chối.
- **BR-BOOK-022** (rewrite): Driver+ có thể gửi yêu cầu hủy lịch hẹn từ phía khách hàng. Hệ thống tự động áp dụng hủy ngay nếu booking đang ở "Lịch hẹn mới"/"Đã xác nhận" và chưa có phiếu dịch vụ liên kết — không có bước chờ garage duyệt.
- **BR-BOOK-023** (v2, làm rõ F3): Khi booking chuyển sang "Đã hủy", hệ thống **luôn ghi nhận `cancel_source` nội bộ cho mọi booking, không phân biệt nguồn** — 1 trong 3 giá trị: `DRIVERPLUS_USER` (khách hủy qua Driver+), `GARAGE_INTERNAL` (garage tự hủy — `FEAT-BOOK-CANCEL`, không đổi), `NO_SHOW_AUTO` (quá hạn tự động — `FEAT-BOOK-LIST` AC-14, không đổi). Riêng **payload gửi outbound sang Driver+** (chỉ tồn tại cho booking nguồn Driver+) thì trường này bắt buộc phải có (per FEAT-DP-035 AC-7 phía Driver+ coi thiếu trường này là dữ liệu không hợp lệ).
- **BR-BOOK-025** (mới, sửa lại ID sai convention "BR-BOOK-DPL-002" cũ — BA-review F6): Consent chia sẻ thông tin từ khách hàng sang GMS được Driver+ tự thu thập và lưu trữ hoàn toàn phía họ (mã booking + thời điểm + phiên bản nội dung, per FEAT-DP-034 AC-18) — GMS **không** nhận, không lưu, không tra cứu thông tin đồng ý này.

> Xem chi tiết đầy đủ tại [Product/business-rules/BR-GF-SALES.md](../business-rules/BR-GF-SALES.md) §2.1 + §3.1.

## 6. Edge Cases

- **EC-1**: Yêu cầu hủy tới đúng lúc xe vừa được ghi nhận "Xe đã đến" — xem AC-7, không áp dụng hủy, đồng bộ lại thực tế.
- **EC-2**: Yêu cầu đặt lịch và yêu cầu hủy cho cùng booking tới gần như đồng thời (race) — Kafka partition theo `Booking-{bookingCode}` bảo toàn thứ tự xử lý cho cùng booking; consumer áp dụng gate theo trạng thái thực tế tại thời điểm xử lý.
- **EC-3** (RESOLVED, BA-review F7): Giờ hẹn nhận được không đúng bước 15 phút (lỗi dữ liệu phía gửi) — **chốt: validate + reject tại adapter gate**, không tạo booking. Xem `FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-10 (phản hồi từ chối, mã lỗi `ERR-BOOK-001`).

## 7. Out of Scope

- Đồng bộ `driverplus_user_id` vào hồ sơ khách hàng `gf-customer` và đẩy ngược booking tạo từ kênh khác sang Driver+ (từng có trong bản thiết kế cũ — **KHÔNG có trong 3 tài liệu FEAT-DP-034/035/046 mới**, coi như ngoài phạm vi đợt viết lại này; nếu vẫn cần, phải làm 1 CR riêng).
- Nội dung màn theo dõi booking chi tiết phía Driver+, nội dung thông báo đẩy cho khách hàng — thuộc `FEAT-DP-036` (ngoài repo này).
- Cổng quản trị nội bộ Driver+ xem các ngoại lệ (booking không khớp, chuyển tiếp thất bại) — thuộc `FEAT-DP-037` (ngoài repo này, phía Driver+ tự vận hành).
- Đặt lịch chọn xe từ VAP đã onboard vs nhập tay xe khác (FEAT-DP-034 Nhóm 2) — logic thuần phía Driver+, GMS chỉ nhận giá trị field cuối cùng, không cần biết nguồn.

## 8. Feature-flag

> Áp dụng chung cho `FEAT-BOOK-DRIVERPLUS-INBOUND` (feature này) và `FEAT-BOOK-DRIVERPLUS-OUTBOUND`: 1 flag key điều khiển riêng luồng booking hai chiều (nhận yêu cầu booking từ Driver+ và gửi phản hồi/trạng thái booking về Driver+). Xem cross-ref tại `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` §Feature-flag.

| Field | Value |
|---|---|
| `flag_key` | `Booking:DriverPlus` |
| `default_state` | `on` — **bật cho TẤT CẢ tenant ngay khi release** (chốt user 2026-08-03, không rollout theo nhóm pilot — theo đúng xu hướng chung đã áp dụng cho `Inventory:InventoryV2` + `PartnerLink:DriverPlus`). |
| `rollout_scope` | Toàn bộ tenant ngay khi ship. Không có giai đoạn dùng thử theo nhóm pilot. |
| `kill_switch_owner` | Delivery Authority (config-level toggle) — vẫn giữ công tắc để **tắt khẩn cấp** nếu Driver+ gặp sự cố diện rộng (VD backend Driver+ down, tràn lỗi payload). |
| Behavior khi `off` (kill-switch kích hoạt) | Adapter gate (AC-1..AC-8) từ chối toàn bộ request inbound từ Driver+ (không tạo booking mới, không áp dụng yêu cầu hủy). `FEAT-BOOK-DRIVERPLUS-OUTBOUND` đồng thời ngừng gửi các sự kiện phản hồi/trạng thái booking. Booking đã tồn tại từ trước (nguồn D+) không bị ảnh hưởng — vẫn quản lý bình thường qua Web GMS/App Garage như booking thường. |

> **Rationale**: mặc định bật cho tất cả tenant (quyết định user 2026-08-03) — chấp nhận rủi ro đồng loạt tương tự `PartnerLink:DriverPlus`. Công tắc giữ lại **chỉ để kill-switch khẩn cấp**, không dùng để rollout dần.
> **Cơ chế kỹ thuật triển khai flag**: `FeatureFlagService.isEnabled()` được gọi programmatic trong adapter layer; không dùng annotation. Khi `off`, adapter ngừng nhận inbound và ngừng publish outbound.
>
> **Phạm vi độc lập**: `Booking:DriverPlus` không điều khiển việc gửi phiếu dịch vụ/phiếu quyết toán. Chứng từ dùng flag riêng `Document:DriverPlus` theo `FEAT-SO-DETAIL` và `FEAT-STL-CREATE`. Vì vậy, tắt luồng booking không tự động dừng gửi chứng từ phát sinh từ các booking Driver+ đã tồn tại; chỉ `Document:DriverPlus=off` mới dừng luồng chứng từ.

## 9. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-03 | 1 | user (Business Authority) qua main agent | **Khởi tạo — thay thế AC-23/AC-24 cũ tại FEAT-BOOK-CREATE.md** (SUPERSEDED). Viết lại theo bộ 3 tài liệu FEAT-DP-034 (biểu mẫu đặt lịch), FEAT-DP-035 (relay 2 chiều), FEAT-DP-046 (ghi VAP — không cần GMS xử lý) do đội Driver+ cung cấp 2026-08-03. Thay đổi chính so với cơ chế cũ: (a) 14 trường payload chi tiết (5 bắt buộc + 9 tùy chọn) thay vì mô tả chung chung; (b) cơ chế hủy xác nhận **tự động áp dụng ngay** khi đủ điều kiện gate, không có bước "chờ garage duyệt" (khớp hành vi `BR-BOOK-022` gốc, chỉ làm rõ thêm gate + cancel_source); (c) thêm `cancel_source` bắt buộc khi trạng thái = "Đã hủy" (yêu cầu mới từ FEAT-DP-035 AC-7). Không mang theo Luồng 1b (đồng bộ ngược khách đã liên kết D+ đặt qua kênh khác) từ bản thiết kế sequence-diagram cũ (W10) vì 3 tài liệu nguồn mới không đề cập — flag ở §7 Out of Scope. |
| 2026-08-03 | 2 | user (Business Authority) qua main agent | **Fix batch F1/F6/F7 (BA-review round 1, 2026-08-03)**: (F1) AC-6 sửa cite BR sai — "BR-BOOK-CAN-001" → **BR-BOOK-022** (gate hủy qua Driver+, không dùng chung gate với garage tự hủy), làm rõ scope khác biệt ngay trong AC. (F6) AC-2 + §5 sửa cite orphan "BR-BOOK-DPL-002" (ID không tồn tại, sai convention) → đăng ký đúng **BR-BOOK-025** trong `BR-GF-SALES.md` §2.1 cho rule consent-Driver+-tự-lưu. (F7) EC-3 (giờ hẹn sai bước 15 phút) chuyển từ NEED CONFIRMATION → **RESOLVED**: chốt validate/reject tại adapter gate; AC-2 + AC-8 thêm cross-ref sang `FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-10/AC-11 (phản hồi từ chối, mã lỗi `ERR-BOOK-001`/`ERR-BOOK-002` mới đăng ký tại `ERROR-CODE-REGISTRY.md` §6). |
| 2026-08-03 | 3 | user (Business Authority) qua main agent | **Thêm §8 Feature-flag** (gap phát hiện qua trao đổi trực tiếp với user, không phải qua BA-review — xem Change Log `agent-ba-author.md`/`agent-ba-review.md` cùng ngày về nguồn gốc gap này). Flag `Booking:DriverPlus`, default `on` cho mọi tenant ngay khi release (theo đúng xu hướng chung `Inventory:InventoryV2` + `PartnerLink:DriverPlus`), giữ công tắc làm kill-switch khẩn cấp. Áp dụng chung cho cả `FEAT-BOOK-DRIVERPLUS-OUTBOUND` (xem cross-ref file đó). §8 cũ (Change Log) đổi thành §9. Cơ chế kỹ thuật triển khai flag vẫn NEED CONFIRMATION Architecture. |
| 2026-08-03 | 4 | user (Business Authority) qua main agent | **RESOLVE AC-3 (đối chiếu 3 tài liệu Driver+ chính thức đầy đủ — FEAT-DP-034 v7/FEAT-DP-035 v5/FEAT-DP-046 v5, khác bản sequence-diagram W10 cũ đã dùng trước đó)**: gỡ marker NEED CONFIRMATION Architecture/BA về mapping "Loại dịch vụ" — chốt theo `FEAT-DP-034` §7 (quyết định PO phía Driver+ đã có sẵn, không phải agent tự suy luận): **KHÔNG cross-mapping**, "Loại dịch vụ" (Car Spa/Bảo dưỡng/Sửa chữa) và danh mục dịch vụ nội bộ GMS (`EP-CATALOG`) là 2 hệ thống độc lập theo đúng chủ đích thiết kế — GMS chỉ lưu/hiển thị nguyên văn, không map. Đối chiếu đợt này đồng thời xác nhận: payload phiếu DV/QT (mã phiếu + tệp) đã đúng theo `FEAT-DP-035` AC-11/AC-14 (không cần sửa `FEAT-SO-DETAIL`/`FEAT-STL-CREATE`); Luồng 1b (đồng bộ ngược) và cơ chế dead-letter/retry chi tiết xác nhận **không** có trong 3 tài liệu chính thức — giữ nguyên quyết định loại khỏi phạm vi đã có từ trước, user xác nhận không cần bổ sung. |
| 2026-08-03 | 5 | user (Business Authority) qua main agent | **Fix F4 (BA-review Wave 7)**: AC-2 bổ sung — Số điện thoại **không cần validate lại định dạng** ở adapter gate, vì trường này khoá cứng lấy từ số điện thoại đã dùng đăng ký tài khoản Driver+ (per `FEAT-DP-034` AC-6, không phải input tự do), đã đảm bảo hợp lệ từ phía Driver+. |
| 2026-08-10 | 6 | Business Authority qua main agent | **Chốt Kafka theo ADR-029**: giữ `BOOKING.CREATE.REQUEST` và `BOOKING.CANCELLED` trên `AC-DEV-BOOKING-EVENTS`; chốt partition theo booking cho race create/cancel và cơ chế feature flag programmatic tại adapter. Gỡ các marker Architecture tương ứng. |
| 2026-08-10 | 7 | Business Authority qua main agent | **Đồng bộ feature flag với ADR-031**: giới hạn `Booking:DriverPlus` trong luồng booking inbound/outbound; việc gửi phiếu dịch vụ và phiếu quyết toán được điều khiển độc lập bởi `Document:DriverPlus`. Tắt booking không tự động dừng chứng từ của booking Driver+ đã tồn tại. |
