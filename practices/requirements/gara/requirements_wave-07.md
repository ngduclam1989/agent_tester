# 📋 Phân Tích Requirement: PKG-W07

## Partner Link + Booking relay Driver Plus (Gara Wave 7)

> Nguồn phân tích: `requirements/gara/wave-07/` — toàn bộ Product layer (PKG, 2 Epic, 5 Feature liên quan, 2 Business Rules) + toàn bộ Architecture layer (3 ADR, 2 HLD, 3 API doc, 2 Event doc, 1 Data model, 3 Integration doc) + `tracking/ARCH-REVIEW-W07.md`.
> Không có mockup/screenshot dạng ảnh được cung cấp trực tiếp — chỉ có link Figma tham chiếu (xem mục 6). Không sinh test case trong tài liệu này, đúng phạm vi workflow `/analyze_requirement_document`.

---

## 1. Tổng Quan Ticket

| Field | Value |
|---|---|
| Package ID | `PKG-W07` |
| Title | Partner Link + Booking relay Driver Plus |
| Type | Work package (execution) |
| Status | PLANNED |
| Version | 5 |
| Wave | W07 (timebox 5 ngày, M01 Vertical-Slice) |
| Owner Authority | Delivery Authority |
| Epic liên quan | `EP-PARTNER-LINK` (P1, mới) + `EP-BOOKING` (compatibility hardening cho phần liên quan Driver Plus) |
| Feature core (3) | `FEAT-SYS-DRIVERPLUS-LINK` (P1, boundary `gf-system`) · `FEAT-BOOK-DRIVERPLUS-INBOUND` (P0, boundary `gf-sales`) · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` (P0, boundary `gf-sales`) |
| Feature regression-only | `FEAT-BOOK-EDIT` AC-15 (giữ nguyên `BOOKING.UPDATE.RESPONSE`, không đổi) |
| Boundary bị ảnh hưởng | `gf-system` (Partner Link owner) · `gf-sales` (Booking owner) · `agg-garage-graph` (BFF) · `garage-web` · `garage-mobile` · Driver Plus (external) |
| Kiến trúc nền | ADR-029 (giao thức Kafka + correlated response event) · ADR-030 (bảng `tenant_profile` làm SoT) · ADR-031 (đồng bộ chứng từ — ngoài phạm vi W07 có chủ đích) |
| Kết quả ARCH-REVIEW-W07 (2026-08-07) | 14 file, P0=0, P1=0, P2=2 (đều là lỗi định dạng/đánh số tài liệu, không ảnh hưởng nội dung), `ready_for_sa_ratify = true` |

Package mô tả 2 luồng tích hợp 2 chiều với đối tác ngoài Driver Plus: (1) garage duyệt/từ chối/hủy yêu cầu liên kết tài khoản Driver Plus và đồng bộ hồ sơ garage sang đối tác; (2) `gf-sales` nhận đặt lịch/hủy lịch từ khách hàng Driver Plus và phản hồi đúng trạng thái ngược lại. Cả 2 luồng dùng chung 1 đối tác, 1 convention envelope Kafka (ADR-029), nhưng thuộc 2 boundary sở hữu nghiệp vụ khác nhau và 2 feature-flag độc lập.

## 2. User Story

Package gồm 3 user story cấp Feature:

- FEAT-SYS-DRIVERPLUS-LINK: "Là chủ garage / kế toán, tôi muốn xem danh sách yêu cầu liên kết Driver Plus và duyệt / từ chối / hủy / đồng bộ lại thông tin từng yêu cầu, để tôi có thể kiểm soát tài khoản D+ nào được phép nhận dữ liệu garage của tôi và giữ dữ liệu chia sẻ luôn cập nhật khi hồ sơ garage thay đổi."
- FEAT-BOOK-DRIVERPLUS-INBOUND: "Là hệ thống gf-sales, tôi muốn nhận đúng và đầy đủ yêu cầu đặt lịch / yêu cầu hủy do khách hàng gửi từ ứng dụng Driver+, để garage có lịch hẹn chính xác để xử lý mà không cần khách hàng liên hệ trực tiếp, đồng thời không tự ý suy diễn quyết định thay garage khi có yêu cầu hủy."
- FEAT-BOOK-DRIVERPLUS-OUTBOUND: "Là hệ thống gf-sales, tôi muốn phản hồi lại Driver+ đúng và đầy đủ mỗi khi trạng thái lịch hẹn thay đổi, để khách hàng trên Driver+ luôn thấy đúng trạng thái thực tế của lịch hẹn mà không bị trễ hay sai lệch."

## 3. Phạm Vi Áp Dụng (Scope)

| Module / Boundary | Ảnh hưởng | Ghi chú |
|---|---|---|
| `gf-system` — backend Partner Link | Mới hoàn toàn | 2 bảng mới (`partner_link_request` V8, `tenant_profile` V7), 6 REST endpoint, 3 inbound + 3 outbound Kafka step |
| `gf-sales` — backend Booking relay | Rewrite additive trên contract production | Không đổi tên step đang chạy; bổ sung 14-trường payload, `cancel_source`, `driverPlusStatus`, step mới `BOOKING.CANCEL.RESPONSE` |
| `agg-garage-graph` (BFF) | Mới — 6 GraphQL operation | Passthrough thuần, không cache, không orchestrate, không enrichment |
| `garage-web` | Mới — menu "Liên kết" | Layout master-detail, 4 modal action |
| `garage-mobile` (Flutter) | Mới — tab "Liên kết" | Layout card + màn Bộ lọc/chi tiết full-screen riêng, cùng 6 operation với web |
| `garage-web` / `garage-mobile` — module Booking | Regression only | Không có route mới; danh sách/chi tiết booking hiện hữu hiển thị booking nguồn D+ |
| Driver Plus (external) | Đối tác duy nhất giai đoạn 1 | Kênh Kafka 2 chiều, 11 `MessageStep` áp dụng cho W07 (6 partner-link + 5 booking) |
| `gf-erp-agent` | Không tham gia | Quyết định kiến trúc rõ ràng — không thêm hop trung gian (ADR-029) |
| `gf-accounting` — đồng bộ chứng từ | Ngoài phạm vi W07 có chủ đích | Đã có ADR-031 chuẩn bị sẵn cho wave sau, không triển khai trong W07 |

Ngoài phạm vi (explicit, đã chốt):

- Emit phiếu dịch vụ/phiếu quyết toán sang Driver Plus (đợi CR riêng theo ADR-031).
- UI hiển thị retry/lỗi delivery của Partner Link — xử lý ngầm ở backend, Web/Mobile không có badge/cảnh báo/nút thử lại.
- Tab "Đối tác khác" (placeholder cho đối tác tương lai ngoài Driver Plus).
- Garage tự tạo yêu cầu liên kết hoặc cấu hình đa-đối tác.
- Đồng bộ ngược booking tạo từ kênh khác (Garage Care/Walk-in) cho khách đã liên kết Driver+.

## 4. Acceptance Criteria — Phân Tích Chi Tiết

### 4.1. FEAT-SYS-DRIVERPLUS-LINK (43 AC, 14 nhóm A→N)

Vòng đời 1 yêu cầu liên kết mã `LKD-YYYY-NNN` do Driver Plus tự sinh và đẩy sang GMS — garage không có endpoint tự tạo. 4 trạng thái: Chờ liên kết (PENDING) → Đã liên kết (LINKED) / Từ chối (REJECTED, terminal); Đã liên kết → Đã hủy liên kết (UNLINKED, terminal).

Nhóm chức năng chính đã đặc tả đầy đủ, có wording UI/error code/BR cite cụ thể:

- Nhóm A-C: điều hướng menu, danh sách (filter mặc định 2/4 trạng thái, không tìm kiếm/phân trang), form chi tiết 3 section (thông tin D+ gửi, thông tin xử lý, thông tin đồng bộ sang D+ đọc real-time).
- Nhóm D-G: 4 action Duyệt (có consent gate scroll-to-end) / Từ chối (lý do bắt buộc ≤2000 ký tự) / Đồng bộ lại (không đổi state) / Hủy liên kết (lý do bắt buộc ≤2000 ký tự).
- Nhóm H-I: re-request sau Từ chối/Hủy (có điều kiện guard), dual persona ngang quyền tuyệt đối.
- Nhóm J: 5 edge case race condition + outbound fail không rollback state cục bộ.
- Nhóm K-L: single-active guard chặn D+ gửi request mới khi đã có 1 liên kết active; hủy 2 chiều (D+ tự withdraw/unlink → GMS cập nhật ngầm, không toast).
- Nhóm M: 4 loại notification outbound wording đã chốt chính thức, gửi trực tiếp qua Kafka (không qua `gf-notification`).
- Nhóm N: biến thể UI Mobile — chỉ khác entry point/layout danh sách/màn lọc; phần chi tiết + 4 modal giữ nguyên 100% so với Web.

Điểm mạnh: invariant "tối đa 1 liên kết active/garage" được bảo vệ ở tầng DB (partial unique index) chứ không chỉ ở tầng ứng dụng — giảm rủi ro race condition. Toàn bộ error message, error code, wording notification đều đã chốt câu chữ cụ thể (không còn NEED CONFIRMATION nghiệp vụ).

Điểm cần lưu ý khi thiết kế test (xem chi tiết tại mục 7 Gap Review): cơ chế scroll-to-end gate ở AC-13 chưa mô tả hành vi cho thao tác bàn phím/screen-reader (RR-001); nội dung lý do Từ chối/Hủy là free text được nhúng thẳng vào cả UI nội bộ lẫn notification gửi sang đối tác ngoài mà không có yêu cầu sanitize (RR-002); danh sách có giới hạn phòng vệ 500 dòng ở tầng kiến trúc nhưng AC không mô tả hành vi UI khi vượt giới hạn (RR-006); nội dung điều khoản chia sẻ dữ liệu không lưu phiên bản đã chấp thuận (RR-005); trường hợp `tenant_profile` rỗng do garage cũ chưa backfill (RR-012).

### 4.2. FEAT-BOOK-DRIVERPLUS-INBOUND (9 AC, 3 nhóm)

Thay thế hoàn toàn AC-23/AC-24 cũ tại `FEAT-BOOK-CREATE.md` (nay SUPERSEDED). Nhận đúng 14 trường (5 bắt buộc + 9 tùy chọn) từ payload đặt lịch Driver+, tạo lịch hẹn trạng thái "Lịch hẹn mới"; nhận yêu cầu hủy và tự động áp dụng ngay (không qua bước garage duyệt) nếu booking đang "Lịch hẹn mới"/"Đã xác nhận" và chưa có phiếu dịch vụ liên kết.

Điểm đã chốt rõ: "Loại dịch vụ" Driver+ là danh mục hoàn toàn độc lập với danh mục dịch vụ nội bộ GMS, không cross-map (AC-3, đối chiếu trực tiếp tài liệu nguồn FEAT-DP-034 §7 — không phải suy luận của agent). Dedupe qua inbox theo `event_id`. Giờ hẹn sai bước 15 phút bị reject tại adapter gate (EC-3, RESOLVED).

Điểm cần lưu ý: AC-2 mô tả "Loại dịch vụ" là "enum cố định 3 giá trị" nhưng AC-3 lại mô tả hệ thống "lưu và hiển thị nguyên văn" không map — chưa rõ adapter gate có validate giá trị nằm trong đúng 3 enum hay chấp nhận bất kỳ chuỗi nào miễn không rỗng (RR-008). Payload không có validation cho "Ngày hẹn" (quá khứ / quá xa) — chỉ có validate định dạng giờ theo bước 15 phút (RR-009).

### 4.3. FEAT-BOOK-DRIVERPLUS-OUTBOUND (11 AC, 3 nhóm)

Phản hồi trạng thái ngược sang Driver+ mỗi khi booking đổi trạng thái vòng đời (xác nhận/từ chối/xe đến/hủy) — chỉ áp dụng cho booking có nguồn Driver+ (EC-2, RESOLVED tường minh). `cancel_source` là trường bắt buộc trong mọi payload hủy gửi Driver+. Có cơ chế phản hồi từ chối riêng (Nhóm C, AC-10/AC-11) khi request inbound không hợp lệ — dùng Kafka event correlated, không phải HTTP response đồng bộ (chốt theo ADR-029).

Điểm cần lưu ý: nhánh NO_SHOW_AUTO (AC-4, một trong 3 giá trị `cancel_source`) phụ thuộc ngưỡng "quá hạn thời gian quy định" của `BR-BOOK-017` — ngưỡng này chưa được định nghĩa cụ thể ở bất kỳ đâu trong toàn bộ tài liệu wave (RR-010), khiến không thể thiết kế test case xác định cho nhánh này.

### 4.4. FEAT-BOOK-EDIT AC-15 (regression, không đổi nội dung)

Giữ nguyên hành vi production: sau khi cập nhật lịch hẹn thành công, hệ thống gửi `BOOKING.UPDATE.RESPONSE` sang Driver+. AC này không được rewrite trong đợt Driver+ 2026-08-03, khác với Nhóm A của OUTBOUND (đã rewrite và làm rõ chỉ áp dụng cho booking nguồn D+ ở EC-2). Vì AC-15 không lặp lại điều kiện tương tự, chưa rõ hành vi đồng bộ khi sửa nội dung một booking nguồn Garage Care/Walk-in có bị gửi nhầm sang D+ hay không (RR-007).

## 5. Phụ Thuộc (Dependencies)

| Dependency | Chiều | Mô tả |
|---|---|---|
| `EP-FOUND` | Upstream | Hồ sơ doanh nghiệp/chi nhánh — nguồn dữ liệu khối "Thông tin đồng bộ sang Driver Plus"; W07 không có UI cho garage tự sửa hồ sơ này (đã ghi nhận là Gap 1 tại ADR-030, thuộc phạm vi EP-FOUND, không block W07 vì AC chỉ yêu cầu đọc). |
| `EP-BOOKING` (baseline) | Downstream | Năng lực nhận booking D+ đã có ở baseline production — W07 chỉ rewrite phần payload/hủy/phản hồi, không dev mới từ đầu. |
| Driver Plus (external) | Bidirectional | 11 `MessageStep` trên 2 topic Kafka cho W07 (`AC-DEV-PARTNER-LINK-EVENTS`, `AC-DEV-BOOKING-EVENTS`). Tài liệu nguồn phía Driver+ (FEAT-DP-034/035/046) nằm ngoài repo — GMS chỉ đối chiếu, không kiểm chứng trực tiếp được. |
| ADR-029 | Kiến trúc nền | Giao thức Kafka 2 chiều, adapter tự-own tại boundary sở hữu, correlated response event thay HTTP đồng bộ. |
| ADR-030 | Kiến trúc nền | Bảng `tenant_profile` mới làm SoT cho khối dữ liệu chia sẻ sang D+; có 3 gap đã tự nhận (đường nhập liệu, backfill tenant cũ, dữ liệu draft). |
| ADR-031 | Liên quan nhưng ngoài scope W07 | Chuẩn bị sẵn contract đồng bộ chứng từ cho wave sau — không triển khai trong W07. |
| Feature flag `PartnerLink:DriverPlus` / `Booking:DriverPlus` | Vận hành | 2 flag độc lập, default `on` toàn bộ tenant, dùng làm kill-switch khẩn cấp — không dùng để rollout dần theo nhóm pilot. |
| `gf-purchase`, `gf-erp-mdm`, `gf-hrms`, `gf-customer`, `gf-accounting`, `gf-inventory`, `gf-worker` | Baseline (gf-sales/gf-system) | Không thay đổi trong W07, chỉ liệt kê để đối chiếu boundary — xem `BR-GF-SALES.md` §6, `BR-GF-SYSTEM.md` §6. |

## 6. Phân Tích Mockup/Screenshot

Không có ảnh mockup/screenshot được cung cấp trực tiếp trong bộ tài liệu để phân tích. `FEAT-SYS-DRIVERPLUS-LINK.md` §3 UI/UX Reference khai báo visual source mode là `figma` với 2 link chính thức (Web + Mobile, do Business Authority cung cấp 2026-08-10) và ghi rõ nguyên tắc drift: nếu nội dung UI mô tả trong FEAT khác với Figma, DEV phải dừng lại và báo cáo trước khi triển khai — không tự suy diễn theo FEAT hay theo Figma. Do đây là link Figma bên ngoài (không phải file ảnh đính kèm trong workspace), tài liệu này không thực hiện được bước đối chiếu trực tiếp hình ảnh, chỉ ghi nhận sự tồn tại của quy tắc drift nói trên như một điều kiện cần kiểm tra thủ công trước khi bắt đầu code UI.

## 7. Điểm Thiếu/Điểm Mờ — Gap Review

### 7.1. Bảng tổng hợp

| Mã | Loại | Mức độ | Tóm tắt |
|---|---|---|---|
| RR-001 | Khả năng tiếp cận | Cao | Cơ chế "cuộn đến cuối" mở khóa checkbox đồng ý (AC-13) không mô tả hành vi cho keyboard/screen-reader |
| RR-002 | Bảo mật | Cao | Free text "Lý do" Từ chối/Hủy được nhúng vào UI nội bộ và notification gửi sang Driver Plus mà không có yêu cầu sanitize |
| RR-003 | Tuân thủ | Cao | Không có bước yêu cầu Driver Plus xóa dữ liệu đã đồng bộ khi garage Hủy liên kết (right-to-erasure) |
| RR-004 | Tuân thủ | Trung bình | DPA với Driver Plus chưa ký, chính sách lưu trữ dữ liệu phía đối tác chưa xác định |
| RR-005 | Mơ hồ | Trung bình | Nội dung "Điều khoản chia sẻ thông tin" không lưu phiên bản đã chấp thuận tại thời điểm Duyệt |
| RR-006 | Thiếu phủ | Trung bình | Giới hạn phòng vệ 500 dòng trong danh sách yêu cầu liên kết không có AC mô tả hành vi UI khi vượt ngưỡng |
| RR-007 | Mơ hồ | Trung bình | `FEAT-BOOK-EDIT` AC-15 (đồng bộ khi sửa lịch hẹn) không nêu điều kiện giới hạn theo nguồn booking, khác với Nhóm A của OUTBOUND đã làm rõ |
| RR-008 | Mơ hồ | Cao | "Loại dịch vụ" Driver+ vừa được mô tả là enum cố định 3 giá trị vừa được mô tả lưu nguyên văn không map — chưa rõ có validate giá trị hợp lệ tại adapter gate hay không |
| RR-009 | Biên | Trung bình | Payload đặt lịch Driver+ không có validation cho "Ngày hẹn" quá khứ/quá xa tương lai |
| RR-010 | Thiếu phủ | Cao | Ngưỡng thời gian "quá hạn" cho NO_SHOW_AUTO chưa được định nghĩa, ảnh hưởng trực tiếp khả năng viết TC xác định cho nhánh outbound `cancel_source=NO_SHOW_AUTO` |
| RR-011 | Tương tranh | Trung bình | Hành vi của outbound event đã nằm trong outbox trước khi feature flag chuyển `off` chưa được đặc tả (tiếp tục phát hay giữ lại) |
| RR-012 | Trạng thái | Trung bình | Khi `tenant_profile` chưa có dữ liệu (tenant cũ chưa backfill), Duyệt/Đồng bộ lại vẫn thành công với dữ liệu rỗng gửi sang D+ mà không có cảnh báo cho user |

### 7.2. Chi tiết từng finding

## RR-001 [Cao] Khả năng tiếp cận — FEAT-SYS-DRIVERPLUS-LINK AC-13 "cuộn đến cuối" mở khóa consent không quy định cơ chế cho bàn phím/screen-reader

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L125-L130)
- **Section**: Nhóm D → AC-13, cite chéo `BR-DPL-APV-003` (`BR-GF-SYSTEM.md §2.5.3`)
- **Dòng**: 125-130
- **Quote nguyên văn**:
> "Khi: user chưa cuộn đến cuối nội dung điều khoản. Thì: checkbox **disabled** (không tick được); phía trên checkbox hiển thị hint 'Vui lòng cuộn xuống cuối để tiếp tục'. Khi: user đã cuộn đến cuối nội dung điều khoản. Thì: checkbox chuyển sang enabled, hint biến mất, user có thể tick."

### 2. Bối cảnh nghiệp vụ

Modal "Duyệt liên kết với Driver Plus" (AC-12) bắt buộc user đọc hết block điều khoản chia sẻ thông tin trước khi được tick checkbox đồng ý (AC-13) và chỉ khi đã tick, nút "Đồng ý liên kết" mới enabled (AC-14). Đây là gate consent pháp lý duy nhất trong toàn bộ luồng Duyệt — không có đường tắt nào khác để hoàn tất action "Duyệt", một trong 2 hành động chính (cùng với "Từ chối") ở trạng thái "Chờ liên kết".

### 3. Vấn đề cụ thể

AC-13 và `BR-DPL-APV-003` chỉ mô tả điều kiện đạt được ("đã cuộn đến cuối") mà không nêu cơ chế kỹ thuật để đạt điều kiện này.

- Khả năng A: implementation chỉ lắng nghe sự kiện `scroll` của chuột/touch trên vùng nội dung — cách hiện thực đơn giản và phổ biến nhất.
- Khả năng B: implementation tính điều kiện "đã cuộn đến cuối" dựa trên vị trí scroll của container (bất kể nguồn kích hoạt — chuột, phím Page Down/End, hay `element.scrollIntoView()` khi focus tới phần tử cuối) — tương thích bàn phím/screen-reader.

Tài liệu không chỉ định Khả năng A hay B, nên nếu DEV chọn A (đường ít công sức nhất), user thao tác hoàn toàn bằng bàn phím hoặc dùng screen-reader (đọc tuần tự không luôn kích hoạt sự kiện `scroll` DOM theo cách thông thường) có thể không bao giờ đạt được điều kiện "đã cuộn đến cuối".

### 4. Ảnh hưởng nếu không giải quyết

- Một nhóm người dùng (thao tác hoàn toàn bằng bàn phím hoặc dùng screen-reader) có thể bị chặn vĩnh viễn khỏi action "Duyệt" — không có đường vòng nào khác trong toàn bộ feature để hoàn tất hành động này.
- Test case accessibility (nếu có) sẽ không có oracle rõ ràng để xác định PASS/FAIL vì tài liệu không định nghĩa hành vi mong đợi.
- Rủi ro vi phạm tiêu chuẩn WCAG 2.1 SC 2.1.1 (Keyboard) nếu action bị khoá hoàn toàn với thao tác bàn phím.

### 5. Đề xuất giải quyết

Bổ sung 1 AC yêu cầu điều kiện "đã cuộn đến cuối" phải kích hoạt được qua cả 3 kênh tương đương: scroll chuột/touch, phím Page Down/End/mũi tên trong vùng nội dung, và focus đến phần tử cuối cùng của block điều khoản. Đây là đề xuất theo best practice WCAG 2.1 SC 2.1.1 Keyboard, chưa phải yêu cầu đã có sẵn trong tài liệu.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bắt buộc cơ chế "cuộn đến cuối" hỗ trợ đầy đủ bàn phím + screen-reader trong phạm vi W07 (theo Đề xuất giải quyết).
- (b) Chấp nhận rủi ro chỉ hỗ trợ chuột/touch trong W07, ghi nhận nợ kỹ thuật để xử lý sau.
- (c) Đề xuất phương án khác.

### 8. Trạng thái

ĐANG MỞ

## RR-002 [Cao] Bảo mật — Trường "Lý do" (Từ chối/Hủy liên kết) không có yêu cầu sanitize dù được nhúng lại vào UI và notification gửi sang Driver Plus

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L156-L163) (AC-17/AC-18, textarea "Lý do từ chối"), tương tự [AC-22/AC-23](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L184-L196) (textarea "Lý do hủy liên kết")
- **Section**: Nhóm E (Từ chối) + Nhóm G (Hủy liên kết); wording notification tại `Product/business-rules/BR-GF-SYSTEM.md §2.5.7` `BR-DPL-NOTI-002`/`BR-DPL-NOTI-004`
- **Dòng**: 156-163 (AC-17/18); 184-196 (AC-22/23); `BR-GF-SYSTEM.md` dòng 153 (`BR-DPL-NOTI-002`), dòng 155 (`BR-DPL-NOTI-004`)
- **Quote nguyên văn**:
> "Khi: nội dung vượt 2.000 ký tự. Thì: nút disabled, hiển thị lỗi inline 'Lý do không được vượt quá 2.000 ký tự.' (ERR-DPL-012)." (AC-18)
>
> "Wording chính thức: 'Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã bị từ chối. Lý do: {Lý do do garage nhập}.'" (BR-DPL-NOTI-002)

### 2. Bối cảnh nghiệp vụ

Trường "Lý do" là textarea tự do tối đa 2.000 ký tự do nhân viên garage nhập khi Từ chối hoặc Hủy liên kết. Nội dung này không chỉ hiển thị lại trên UI nội bộ (section "THÔNG TIN XỬ LÝ") mà còn được `gf-system` nhúng nguyên văn vào field `notification.message` gửi qua Kafka sang Driver Plus (`PARTNER_LINK.STATUS.CHANGED`), nhiều khả năng được render trực tiếp trên UI của hệ thống đối tác ngoài.

### 3. Vấn đề cụ thể

Không có bất kỳ rule nào trong `BR-GF-SYSTEM.md §5.5` (Validation Rules, `VLD-DPL-001..006`) yêu cầu escape/sanitize ký tự đặc biệt (HTML tag, script, ký tự điều khiển) tại 1 trong 3 điểm dữ liệu này đi qua: (a) hiển thị lại trên UI nội bộ GMS Web + Mobile, (b) truyền sang hệ thống ngoài Driver Plus qua `notification.message`, (c) lưu vĩnh viễn trong DB theo `BR-DPL-CMN-006`.

### 4. Ảnh hưởng nếu không giải quyết

- Rủi ro XSS lưu trữ (stored XSS) nếu FE Web/Mobile GMS hoặc FE của Driver Plus render field này dưới dạng HTML không escape.
- Bề mặt tấn công rộng hơn 1 field nội bộ thông thường vì dữ liệu đi xuyên hệ thống (garage nhập → UI GMS → hệ thống ngoài Driver Plus).
- Không có test case bảo mật nào được suy ra từ tài liệu hiện tại vì không có yêu cầu tường minh để verify.

### 5. Đề xuất giải quyết

Áp dụng nguyên tắc "output encoding tại điểm render" (không sanitize tại input để giữ nguyên văn phục vụ audit) cho cả 3 điểm hiển thị/truyền dữ liệu nêu trên — đây là best practice OWASP, chưa có xác nhận từ Business Authority/Architecture trong tài liệu hiện tại.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung yêu cầu tường minh về output encoding/sanitize cho trường "Lý do" trước khi hiển thị lại trên UI và trước khi gửi sang Driver Plus.
- (b) Xác nhận đã có cơ chế chung ở tầng framework/FE bao phủ mọi free-text field, tài liệu Product không cần lặp lại yêu cầu này.
- (c) Cần điều tra thêm trước khi quyết định.

### 8. Trạng thái

ĐANG MỞ

## RR-003 [Cao] Tuân thủ — Không có bước yêu cầu Driver Plus xóa dữ liệu đã đồng bộ khi garage Hủy liên kết

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L283)
- **Section**: §10 PII / Compliance / Data Residency
- **Dòng**: 283
- **Quote nguyên văn**:
> "Right-to-erasure flow | Gap đã biết: khi garage Hủy liên kết, GMS publish PARTNER_LINK.STATUS.CHANGED UNLINKED nhưng không có step yêu cầu D+ xoá dữ liệu đã đồng bộ. Nếu cần → CR riêng thêm step PARTNER_LINK.DATA.PURGE."

### 2. Bối cảnh nghiệp vụ

Trong suốt thời gian "Đã liên kết", toàn bộ hồ sơ doanh nghiệp garage (tên, SĐT, địa chỉ, mã số thuế, email nhận hóa đơn) được `gf-system` đẩy sang Driver Plus qua `PARTNER_LINK.PROFILE.SYNC` mỗi lần Duyệt hoặc Đồng bộ lại. Khi garage Hủy liên kết (AC-24), hệ thống chỉ gửi `PARTNER_LINK.STATUS.CHANGED` báo trạng thái đổi, không có bất kỳ yêu cầu xóa dữ liệu nào kèm theo.

### 3. Vấn đề cụ thể

Đây là gap kiến trúc đã tự nhận nhưng không có Acceptance Criteria nào ở `FEAT-SYS-DRIVERPLUS-LINK.md` (kể cả AC-24 Hủy liên kết) đề cập đến việc yêu cầu Driver Plus xóa dữ liệu garage đã nhận trước đó — dữ liệu vẫn tồn tại phía đối tác vô thời hạn sau khi liên kết kết thúc.

### 4. Ảnh hưởng nếu không giải quyết

- Garage chủ động Hủy liên kết với kỳ vọng hợp lý là dừng chia sẻ dữ liệu, nhưng dữ liệu doanh nghiệp vẫn nằm ở hệ thống đối tác ngoài vô thời hạn.
- Rủi ro tuân thủ Nghị định bảo vệ dữ liệu cá nhân Việt Nam (PDPD) — đã được chính tài liệu kiến trúc trích dẫn tại cùng section.
- Không có test case nào có thể verify hành vi "xóa dữ liệu sau khi hủy" vì hành vi đó chưa tồn tại trong đặc tả.

### 5. Đề xuất giải quyết

Đây là quyết định nghiệp vụ + pháp lý cần Business Authority/Legal xác nhận, không phải điều agent có thể tự đề xuất giải pháp kỹ thuật thay thế.

### 6. Liên kết với các phát hiện khác

Cùng nhóm compliance với RR-004 (DPA/retention phía Driver Plus chưa xác nhận).

### 7. Câu hỏi cho người dùng

- (a) Bổ sung yêu cầu xóa dữ liệu doanh nghiệp phía Driver Plus (right-to-erasure, step `PARTNER_LINK.DATA.PURGE`) trong phạm vi W07.
- (b) Chấp nhận rủi ro tạm thời, để CR riêng xử lý sau như Architecture đã đề xuất.
- (c) Cần tham vấn Legal trước khi quyết định.

### 8. Trạng thái

ĐANG MỞ

## RR-004 [Trung bình] Tuân thủ — DPA với Driver Plus chưa ký, chính sách lưu trữ dữ liệu phía đối tác chưa xác định

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L281-L282)
- **Section**: §10 PII / Compliance / Data Residency
- **Dòng**: 281-282
- **Quote nguyên văn**:
> "DPA signed | Open Question — chưa xác nhận trong Product docs. Data retention at provider | Open Question — Driver Plus giữ hồ sơ garage bao lâu sau khi hủy liên kết chưa được đặc tả."

### 2. Bối cảnh nghiệp vụ

Toàn bộ cơ chế consent trong feature (AC-12..AC-14, checkbox "Tôi đã đọc và đồng ý chia sẻ thông tin garage với Driver Plus") giả định có 1 khung pháp lý nền (Data Processing Agreement) giữa 2 doanh nghiệp làm cơ sở cho việc chia sẻ dữ liệu — nhưng khung đó chưa được xác nhận tồn tại ở bất kỳ nguồn Product nào.

### 3. Vấn đề cụ thể

2 mục compliance còn treo, không có nguồn Product nào xác nhận: DPA giữa 2 bên chưa ký; chính sách lưu trữ dữ liệu phía Driver Plus sau khi liên kết kết thúc chưa được đặc tả ở bất kỳ đâu.

### 4. Ảnh hưởng nếu không giải quyết

- Không ảnh hưởng khả năng sinh test case chức năng (đây không phải hành vi hệ thống có thể test).
- Rủi ro release/compliance: garage đồng ý chia sẻ dữ liệu qua checkbox consent trong khi điều khoản pháp lý nền giữa 2 doanh nghiệp chưa tồn tại.

### 5. Đề xuất giải quyết

Xác nhận với Legal/Business Authority về tiến độ DPA trước khi go-live sản xuất, độc lập với tiến độ DEV/QA.

### 6. Liên kết với các phát hiện khác

Cùng nhóm compliance với RR-003 (right-to-erasure).

### 7. Câu hỏi cho người dùng

- (a) DPA và chính sách lưu trữ dữ liệu phía đối tác là điều kiện chặn go-live của W07.
- (b) Có thể release trước, theo dõi tiến độ DPA riêng ngoài phạm vi DEV/QA.

### 8. Trạng thái

ĐANG MỞ

## RR-005 [Trung bình] Mơ hồ — Nội dung "Điều khoản chia sẻ thông tin" không lưu phiên bản đã chấp thuận tại thời điểm Duyệt

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L117-L123); đối chiếu [gf-system-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-system-data-model.md#L344-L359)
- **Section**: AC-12 (nội dung điều khoản); Architecture §2bis.2 (bảng `partner_link_request`, không có cột version điều khoản)
- **Dòng**: 117-123 (AC-12); 344-359 (bảng cột `partner_link_request`)
- **Quote nguyên văn**:
> "Đây là nội dung đã được Business Authority chốt để hiển thị trên Web/Mobile, không phải bản tạm và không còn chờ Legal bổ sung câu chữ trong phạm vi feature này." (AC-12)

### 2. Bối cảnh nghiệp vụ

`ApprovePartnerLinkInput` ở tầng BFF chỉ gửi `termsAccepted: Boolean!` — 1 cờ đồng ý/không đồng ý, không kèm định danh phiên bản nội dung điều khoản tại thời điểm chấp thuận. Bảng `partner_link_request` (V8) cũng không có cột lưu version điều khoản.

### 3. Vấn đề cụ thể

AC-12 xác nhận nội dung hiện tại "không còn chờ Legal bổ sung câu chữ trong phạm vi feature này" — hàm ý ngầm rằng nội dung có thể được Legal cập nhật sau, ngoài phạm vi W07. Nếu điều đó xảy ra, hệ thống không có cách nào biết garage đã Duyệt dựa trên phiên bản điều khoản nào (không có field `termsVersion` hay tương đương).

### 4. Ảnh hưởng nếu không giải quyết

- Khi có audit hoặc tranh chấp pháp lý về nội dung đã đồng ý, GMS không chứng minh được garage đã đọc/đồng ý đúng phiên bản điều khoản nào tại thời điểm Duyệt.
- Làm suy yếu giá trị pháp lý của toàn bộ cơ chế consent (vốn được thiết kế cẩn thận với scroll-gate ở AC-13, xem RR-001).

### 5. Đề xuất giải quyết

Bổ sung 1 field (VD `termsVersion`) lưu kèm mỗi lần Duyệt — đây là đề xuất, chưa có căn cứ xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Liên quan tới RR-001 (cùng modal Duyệt, cùng cơ chế consent).

### 7. Câu hỏi cho người dùng

- (a) Bổ sung lưu vết phiên bản nội dung điều khoản tại mỗi lần Duyệt.
- (b) Không cần, vì nội dung điều khoản coi như cố định trong toàn bộ vòng đời sản phẩm (không có kế hoạch Legal sửa sau).

### 8. Trạng thái

ĐANG MỞ

## RR-006 [Trung bình] Thiếu phủ — Giới hạn phòng vệ 500 dòng trong danh sách yêu cầu liên kết không có AC mô tả hành vi UI khi vượt ngưỡng

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L70-L73); đối chiếu [gf-system-HLD.md](../../../requirements/gara/wave-07/Architecture/hld/gf-system-HLD.md#L232) và [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L51968-L51973)
- **Section**: AC-6 (Product); §7.2 Pagination strategy (Architecture HLD); §3k.1 SDL `PartnerLinkRequestList` (BFF)
- **Dòng**: 70-73 (AC-6); 232 (HLD §7.2); 51968-51973 (SDL)
- **Quote nguyên văn**:
> "hệ thống KHÔNG hiển thị ô tìm kiếm, KHÔNG hiển thị thanh phân trang. Danh sách render toàn bộ record thoả filter theo thứ tự ngày gửi yêu cầu mới nhất trước." (AC-6)
>
> "Guard: server áp cap 500 row (ORDER BY requested_at DESC LIMIT 501); vượt cap → trả 500 row mới nhất + truncated=true. Không im lặng cắt dữ liệu." (gf-system-HLD.md §7.2)

### 2. Bối cảnh nghiệp vụ

`BR-DPL-LST-004` chốt bỏ tìm kiếm/phân trang vì "danh sách thường ngắn" (do invariant 1 garage tối đa 1 liên kết active). Kiến trúc vẫn bổ sung 1 cơ chế phòng vệ kỹ thuật (500-row cap) và trả field `truncated: Boolean!` cho FE để phòng trường hợp giả định nghiệp vụ sai.

### 3. Vấn đề cụ thể

AC-6 khẳng định danh sách "render toàn bộ record thoả filter" mà không nhắc đến bất kỳ giới hạn nào. Không có Acceptance Criteria nào ở `FEAT-SYS-DRIVERPLUS-LINK.md` mô tả FE (Web hoặc Mobile) phải hiển thị gì khi `truncated=true` — banner cảnh báo, hay im lặng chỉ hiện 500 dòng mới nhất.

### 4. Ảnh hưởng nếu không giải quyết

- DEV có thể bỏ qua field `truncated` (không có AC yêu cầu dùng nó).
- Khi 1 garage vượt 500 yêu cầu liên kết, user âm thầm không thấy hết dữ liệu mà không có cảnh báo.

### 5. Đề xuất giải quyết

Bổ sung 1 AC mô tả hành vi UI khi `truncated=true`, ví dụ:

```
Banner ở đầu panel trái: "Chỉ hiển thị 500 yêu cầu gần nhất theo ngày gửi. Thu hẹp bộ lọc để xem đầy đủ."
```

Đề xuất dựa trên field đã có sẵn ở tầng kiến trúc, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung banner cảnh báo khi `truncated=true` theo Đề xuất giải quyết.
- (b) Không cần, chấp nhận im lặng cắt bớt vì case gần như không xảy ra trong thực tế.

### 8. Trạng thái

ĐANG MỞ

## RR-007 [Trung bình] Mơ hồ — FEAT-BOOK-EDIT AC-15 (đồng bộ khi sửa lịch hẹn) không nêu điều kiện giới hạn theo nguồn booking, khác với Nhóm A của OUTBOUND đã làm rõ

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-EDIT.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-EDIT.md#L135-L139); đối chiếu [FEAT-BOOK-DRIVERPLUS-OUTBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-OUTBOUND.md#L122)
- **Section**: AC-15 (FEAT-BOOK-EDIT); EC-2 RESOLVED (FEAT-BOOK-DRIVERPLUS-OUTBOUND, Nhóm A)
- **Dòng**: 135-139 (AC-15); 122 (EC-2)
- **Quote nguyên văn**:
> "Khi: lịch hẹn được cập nhật thành công. Thì: hệ thống đồng bộ thông tin lịch hẹn đã cập nhật sang Driver+ qua Kafka event BOOKING.UPDATE.RESPONSE... Không đổi trong đợt viết lại tích hợp Driver+ 2026-08-03." (AC-15)
>
> "chốt: KHÔNG gửi sự kiện sang Driver+ [cho booking không phải nguồn Driver+]. Toàn bộ Nhóm A (AC-1..6) chỉ áp dụng cho booking có nguồn Driver+." (EC-2)

### 2. Bối cảnh nghiệp vụ

Đợt rewrite tích hợp Driver+ 2026-08-03 tách riêng 2 luồng outbound: đồng bộ trạng thái vòng đời (nay thuộc `FEAT-BOOK-DRIVERPLUS-OUTBOUND` Nhóm A) và đồng bộ khi sửa nội dung (vẫn giữ ở `FEAT-BOOK-EDIT` AC-15, đánh dấu "không đổi").

### 3. Vấn đề cụ thể

Nhóm A của OUTBOUND đã được làm rõ tường minh tại EC-2: chỉ gửi event cho booking có nguồn Driver+, vì Driver+ "không biết và không cần biết booking không phải của họ". AC-15 (cùng bản chất — gửi thông tin booking sang D+) không có điều kiện lọc theo nguồn booking tương tự, và được đánh dấu "không đổi" nên không được rà soát lại theo cùng logic này trong đợt rewrite.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu implementation hiện tại của AC-15 gửi `BOOKING.UPDATE.RESPONSE` cho MỌI booking khi sửa (kể cả nguồn Garage Care/Walk-in), hệ thống liên tục gửi Kafka event vô nghĩa sang Driver+ cho các booking mà D+ hoàn toàn không biết đến.
- Lãng phí throughput, có thể gây nhiễu log/alert phía D+.
- Rủi ro rò rỉ dữ liệu khách hàng nội bộ (không phải khách của D+) sang hệ thống ngoài nếu payload chứa thông tin khách.

### 5. Đề xuất giải quyết

Xác nhận hành vi thực tế đang chạy production của AC-15. Nếu nó đã tự nhiên chỉ áp dụng cho booking nguồn D+ thì đây chỉ là gap tài liệu (thiếu 1 câu làm rõ); nếu implementation hiện tại KHÔNG lọc theo nguồn, đây là 1 gap hành vi thật cần fix.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung điều kiện tường minh "chỉ áp dụng cho booking nguồn Driver Plus" vào AC-15, giống Nhóm A của OUTBOUND.
- (b) Xác nhận hành vi hiện tại đã lọc đúng theo nguồn, chỉ cần bổ sung 1 câu làm rõ trong tài liệu, không đổi code.
- (c) Cần kiểm tra code/log production trước khi trả lời.

### 8. Trạng thái

ĐANG MỞ

## RR-008 [Cao] Mơ hồ — "Loại dịch vụ" Driver+ vừa mô tả là enum cố định 3 giá trị vừa mô tả lưu nguyên văn không map

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L45-L53)
- **Section**: AC-2 (cấu trúc 14 trường) và AC-3 (không cross-mapping)
- **Dòng**: 45-49 (AC-2); 50-53 (AC-3)
- **Quote nguyên văn**:
> "Loại dịch vụ (enum cố định 3 giá trị: Car Spa / Bảo dưỡng / Sửa chữa — xem AC-3 mapping)... Thiếu 1 trong 5 trường bắt buộc → từ chối tại adapter gate." (AC-2)
>
> "hệ thống lưu và hiển thị nguyên văn giá trị này làm 'loại dịch vụ macro' trên Danh sách/Chi tiết lịch hẹn — không map hay liên kết vào danh mục dịch vụ nội bộ GMS." (AC-3)

### 2. Bối cảnh nghiệp vụ

"Loại dịch vụ" là 1 trong 5 trường bắt buộc của payload đặt lịch Driver+, dùng làm "loại dịch vụ macro" hiển thị trên Danh sách/Chi tiết lịch hẹn Web GMS, tách biệt hoàn toàn khỏi danh mục dịch vụ nội bộ GMS (`EP-CATALOG`).

### 3. Vấn đề cụ thể

AC-2 mô tả "Loại dịch vụ" như 1 enum đóng với đúng 3 giá trị hợp lệ, ngụ ý cần validate giá trị nhận được có nằm trong tập 3 giá trị này không. AC-3 lại mô tả hệ thống chỉ "lưu và hiển thị nguyên văn", nhấn mạnh việc "không map" vào danh mục nội bộ. AC-2 chỉ nêu rõ hành vi khi field này HOÀN TOÀN THIẾU, không nêu hành vi khi field CÓ GIÁ TRỊ nhưng giá trị đó không khớp 3 enum đã liệt kê (VD lỗi phiên bản client cũ phía D+, hoặc khác biệt hoa/thường).

- Khả năng A: adapter gate validate nghiêm ngặt theo enum — reject với `ERR-BOOK-001` giống case thiếu trường nếu giá trị không khớp.
- Khả năng B: adapter gate chấp nhận nguyên văn bất kỳ chuỗi non-empty nào — nhất quán với tinh thần "không map" ở AC-3.

### 4. Ảnh hưởng nếu không giải quyết

- 2 nhánh xử lý hoàn toàn khác nhau tùy cách hiểu, không thể viết chính xác test case cho case "Loại dịch vụ chứa giá trị lạ".
- Nếu chọn nhầm Khả năng B khi ý định thực sự là A: booking vẫn được tạo với "loại dịch vụ macro" là 1 chuỗi lạ không nằm trong 3 giá trị chuẩn, có thể phá vỡ báo cáo/thống kê phía sau vốn giả định chỉ có 3 giá trị.

### 5. Đề xuất giải quyết

Đối chiếu AC-3 (đã RESOLVED, xác nhận qua tài liệu chính thức FEAT-DP-034 §7 phía Driver+, không phải suy luận), có khả năng cao ý định thực sự là Khả năng B (chấp nhận nguyên văn, không validate enum ở adapter gate GMS) vì bản chất Driver+ tự quản danh mục của họ, GMS chỉ lưu hộ — nhưng đây là suy luận cần xác nhận, không phải sự thật đã chốt.

### 6. Liên kết với các phát hiện khác

Cùng nhóm validate payload inbound với RR-009 (validate "Ngày hẹn").

### 7. Câu hỏi cho người dùng

- (a) Adapter gate validate giá trị "Loại dịch vụ" phải khớp đúng 1 trong 3 enum, reject nếu không khớp (Khả năng A).
- (b) Adapter gate chấp nhận lưu nguyên văn bất kỳ chuỗi non-empty nào, không validate enum (Khả năng B).

### 8. Trạng thái

ĐANG MỞ

## RR-009 [Trung bình] Biên — Payload đặt lịch Driver+ không có validation cho "Ngày hẹn" quá khứ/quá xa tương lai

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L45-L49) (AC-2) và [EC-3](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L118); đối chiếu [UX-FLOW-BOOKING.md §6](../../../requirements/gara/wave-07/Product/ux/UX-FLOW-BOOKING.md#L387)
- **Section**: AC-2 (5 trường bắt buộc); EC-3 (validate giờ hẹn); UX-FLOW-BOOKING §6 Validation Rules (hàng "Ngày hẹn")
- **Dòng**: 45-49 (AC-2); 118 (EC-3); 387 (UX-FLOW §6)
- **Quote nguyên văn**:
> "Ngày hẹn, Giờ hẹn (định dạng giờ 00-23 + phút bước 15 — 00/15/30/45, không phải giờ tự do)" (AC-2)
>
> "Giờ hẹn nhận được không đúng bước 15 phút (lỗi dữ liệu phía gửi) — chốt: validate + reject tại adapter gate, không tạo booking." (EC-3)

### 2. Bối cảnh nghiệp vụ

5 trường bắt buộc của payload Driver+ gồm Số điện thoại, Tên, Ngày hẹn, Giờ hẹn, Loại dịch vụ. Chỉ "Giờ hẹn" có validate cụ thể (bước 15 phút, đã RESOLVED ở EC-3). Luồng tạo lịch hẹn thủ công qua UI (`UX-FLOW-BOOKING.md §6`) cũng chỉ ghi "Kiểm tra khung giờ (cảnh báo nếu có lịch hẹn gần, không chặn)" cho "Ngày hẹn" — không có validate ngày quá khứ, nhưng luồng thủ công có datepicker UI thường tự chặn chọn ngày quá khứ; luồng Driver+ là event tự động, không có ràng buộc UI tương đương.

### 3. Vấn đề cụ thể

Không có bất kỳ đặc tả nào cho việc validate "Ngày hẹn" nhận từ Driver+ — không rõ hệ thống có reject payload có "Ngày hẹn" ở quá khứ hoặc quá xa tương lai (VD lỗi dữ liệu/đồng hồ phía Driver+) hay chấp nhận tạo booking bình thường.

### 4. Ảnh hưởng nếu không giải quyết

- Có thể tạo ra booking với "Ngày hẹn" trong quá khứ hoặc bất hợp lý (VD 5 năm sau) hiển thị trên Danh sách lịch hẹn Web GMS.
- Gây nhiễu vận hành; không có test case nào phủ được case này vì không có expected behavior được định nghĩa.

### 5. Đề xuất giải quyết

Bổ sung validate biên hợp lý cho "Ngày hẹn" tại adapter gate (VD không cho phép ngày trong quá khứ) — đề xuất theo suy luận nghiệp vụ thông thường, chưa có căn cứ xác nhận từ tài liệu.

### 6. Liên kết với các phát hiện khác

Cùng nhóm validate payload inbound với RR-008 ("Loại dịch vụ").

### 7. Câu hỏi cho người dùng

- (a) Bổ sung validate "Ngày hẹn" không được ở quá khứ (và/hoặc giới hạn khoảng tương lai hợp lý) tại adapter gate, tương tự cách validate "Giờ hẹn" ở EC-3.
- (b) Không cần validate, chấp nhận mọi giá trị ngày hợp lệ về định dạng.

### 8. Trạng thái

ĐANG MỞ

## RR-010 [Cao] Thiếu phủ — Ngưỡng thời gian "quá hạn" cho NO_SHOW_AUTO chưa được định nghĩa, chặn khả năng viết TC xác định cho outbound cancel_source=NO_SHOW_AUTO

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SALES.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SALES.md#L57) (`BR-BOOK-017`) và [§7.2 M-1](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SALES.md#L333); đối chiếu [FEAT-BOOK-DRIVERPLUS-OUTBOUND.md AC-4](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-OUTBOUND.md#L56-L59)
- **Section**: `BR-BOOK-017` (Auto-cancel); §7.2 Missing rules M-1 (tự nhận trước); AC-4 (payload outbound bắt buộc `cancel_source`)
- **Dòng**: 57 (BR-BOOK-017); 333 (M-1); 56-59 (AC-4)
- **Quote nguyên văn**:
> "Lich hen qua han o trang thai 'Lich hen moi' hoac 'Da xac nhan' duoc he thong tu dong chuyen sang 'Da huy' (NO_SHOW), ghi lich su va gui thong bao." (BR-BOOK-017)
>
> "BR-BOOK-017 ghi nhận 'qua han thoi gian quy dinh' nhung khong xac dinh cu the bao lau (1 ngay? 2 ngay? configurable?)." (§7.2 M-1)

### 2. Bối cảnh nghiệp vụ

`cancel_source=NO_SHOW_AUTO` là 1 trong 3 giá trị bắt buộc phải gửi kèm khi booking chuyển "Đã hủy" và có nguồn Driver+ (`FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-4) — đây là nhánh do hệ thống tự động kích hoạt khi lịch hẹn quá hạn, không phải do garage hay khách hàng chủ động.

### 3. Vấn đề cụ thể

Đây là gap đã được chính `BR-GF-SALES.md` tự phát hiện từ trước (M-1, thuộc baseline, không phát sinh riêng do Driver+), nhưng W07 làm cho gap này trở nên quan trọng hơn: không thể thiết kế 1 test case xác định (deterministic) cho hành vi "quá hạn tự động → gửi `cancel_source=NO_SHOW_AUTO` sang Driver+" nếu không biết chính xác ngưỡng thời gian hoặc cách cấu hình nó.

### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết test case chính xác cho toàn bộ nhánh "booking tự động hủy do quá hạn → đồng bộ cancel_source=NO_SHOW_AUTO sang Driver Plus".
- Phải chờ suy luận từ code hoặc set up test bằng cách chỉnh trực tiếp dữ liệu (bypass thời gian chờ thực tế), làm tăng rủi ro test không phản ánh đúng hành vi production.

### 5. Đề xuất giải quyết

Đối chiếu đề xuất P-2 đã có sẵn trong `BR-GF-SALES.md §7.3` — "Định nghĩa thời gian quá hạn booking có thể cấu hình theo garage" — đây là đề xuất đã ghi nhận trước, chưa được Business Authority chốt giá trị cụ thể.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này (gap gốc thuộc baseline, không phát sinh riêng do W07).

### 7. Câu hỏi cho người dùng

- (a) Chốt 1 giá trị cố định toàn hệ thống cho ngưỡng "quá hạn" (VD 24h, 48h...).
- (b) Chốt cơ chế cấu hình theo từng garage, cần thêm field cấu hình tương ứng.
- (c) Cần Business Authority quyết định, chưa có đủ dữ liệu để đề xuất.

### 8. Trạng thái

ĐANG MỞ

## RR-011 [Trung bình] Tương tranh — Hành vi outbound event đã nằm trong outbox trước khi feature flag chuyển off chưa được đặc tả

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L99) (`BR-DPL-CMN-008`); đối chiếu [FEAT-SYS-DRIVERPLUS-LINK.md AC-32](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L247-L251)
- **Section**: `BR-DPL-CMN-008` (kill-switch toàn luồng); AC-32 (outbound push thất bại, retry qua outbox)
- **Dòng**: 99 (BR-DPL-CMN-008); 247-251 (AC-32)
- **Quote nguyên văn**:
> "Khi Delivery Authority chuyển sang off: ... (d) GMS không phát hồ sơ hoặc trạng thái mới sang D+." (BR-DPL-CMN-008)
>
> "gf-system giữ nguyên transition đã commit và retry outbound qua outbox theo cơ chế chuẩn của service." (AC-32)

### 2. Bối cảnh nghiệp vụ

`PartnerLink:DriverPlus` là kill-switch khẩn cấp dùng khi Driver Plus gặp sự cố diện rộng. Song song đó, AC-32 quy định nếu outbound push (VD sau khi Duyệt) thất bại tạm thời, `gf-system` giữ event trong outbox và tự động retry theo lịch chuẩn, không phụ thuộc trạng thái UI.

### 3. Vấn đề cụ thể

`BR-DPL-CMN-008` mô tả hành vi flag `off` áp dụng cho hành động MỚI ("không phát... mới"), trong khi AC-32 mô tả cơ chế retry outbox cho các event ĐÃ được tạo trước đó khi outbound push thất bại. Không có AC hay BR nào nói rõ liệu `OutboxScheduler` có kiểm tra lại trạng thái feature flag tại mỗi lần retry hay không.

- Khả năng A: outbox tiếp tục cố phát các event đã enqueue bất kể flag đang `off` (vì "off" chỉ chặn hành động MỚI).
- Khả năng B: outbox phải kiểm tra flag trước mỗi lần retry và tạm giữ event nếu flag đang `off`, chỉ phát lại khi flag bật.

### 4. Ảnh hưởng nếu không giải quyết

- Đây chính là kịch bản mà kill-switch được thiết kế để xử lý (Driver Plus gặp sự cố diện rộng).
- Nếu chọn Khả năng A, kill-switch không đạt được mục đích "ngừng phát sinh tác động mới" một cách triệt để trong cửa sổ có event đang chờ retry.

### 5. Đề xuất giải quyết

Outbox scheduler nên kiểm tra trạng thái flag ngay trước khi publish mỗi lần retry, bỏ qua (giữ `PENDING`, không publish, không đánh dấu lỗi) nếu flag đang `off` (Khả năng B) — đây là đề xuất kỹ thuật hợp lý theo tinh thần "kill-switch toàn luồng" đã chốt ở AC-43, chưa có xác nhận cụ thể từ Architecture.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Event outbound đang chờ retry phải bị giữ lại (không phát) khi flag chuyển off (Khả năng B, theo Đề xuất giải quyết).
- (b) Event outbound đang chờ retry vẫn tiếp tục phát bình thường bất kể trạng thái flag (Khả năng A).

### 8. Trạng thái

ĐANG MỞ

## RR-012 [Trung bình] Trạng thái — Khi tenant_profile chưa có dữ liệu (tenant cũ chưa backfill), Duyệt/Đồng bộ lại vẫn "thành công" với dữ liệu rỗng mà không cảnh báo

### 1. Trích dẫn nguồn

- **File**: [ADR-030](../../../requirements/gara/wave-07/Architecture/decisions/ADR-030-tenant-profile-sot-on-gf-system.md#L73) (Consequences, Gap 2); đối chiếu [FEAT-SYS-DRIVERPLUS-LINK.md AC-15](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L139-L142) và [AC-21](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L177-L180)
- **Section**: ADR-030 Consequences (Gap 2 — backfill tenant hiện hữu); AC-15 (Duyệt); AC-21 (Đồng bộ lại)
- **Dòng**: 73 (ADR-030 Gap 2); 139-142 (AC-15); 177-180 (AC-21)
- **Quote nguyên văn**:
> "Gap 2 — backfill tenant hiện hữu: tenant đã provisioning trước W07 không có row tenant_profile... Đọc phải null-safe: response trả field null, UI hiển thị rỗng — KHÔNG chặn Duyệt/Đồng bộ (không có AC nào yêu cầu bắt buộc đủ hồ sơ mới được Duyệt)." (ADR-030)

### 2. Bối cảnh nghiệp vụ

Bảng `tenant_profile` (V7) chỉ được seed tự động qua consumer `TenantProvisionedEvent` — cơ chế này chỉ chạy cho tenant provisioning MỚI sau khi V7 được deploy. Mọi garage tạo trước thời điểm đó (tức là toàn bộ tenant hiện hữu tại ngày go-live) sẽ có `tenant_profile` trống hoàn toàn cho tới khi có backfill riêng.

### 3. Vấn đề cụ thể

AC-15/AC-21 (Duyệt/Đồng bộ lại) không có điều kiện chặn hoặc cảnh báo khi khối dữ liệu chuẩn bị gửi sang Driver Plus trống rỗng (mọi field `NULL`) — hệ thống vẫn coi là "thành công" và hiển thị toast thành công bình thường.

### 4. Ảnh hưởng nếu không giải quyết

- Một garage cũ (tạo trước W07, chưa được backfill) có thể Duyệt liên kết Driver+ "thành công" theo UI nhưng thực chất gửi sang D+ một bộ hồ sơ hoàn toàn rỗng (tên doanh nghiệp trống, SĐT trống, địa chỉ trống).
- Vi phạm mục đích cốt lõi của tính năng (chia sẻ hồ sơ garage cho D+) mà không có bất kỳ tín hiệu nào cho user biết cần cập nhật hồ sơ trước.
- Đây là trạng thái dữ liệu thực tế sẽ tồn tại ngay ngày đầu go-live cho MỌI tenant tạo trước W07 — không phải case hiếm.

### 5. Đề xuất giải quyết

Cân nhắc 1 trong 2 hướng: (a) chạy backfill 1 lần cho toàn bộ tenant hiện hữu trước khi go-live (đã được chính ADR-030 gợi ý như một lựa chọn), hoặc (b) bổ sung cảnh báo UI khi khối dữ liệu đồng bộ rỗng/thiếu trường quan trọng lúc Duyệt. Cả 2 đều là đề xuất, chưa có quyết định từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Chạy backfill dữ liệu `tenant_profile` 1 lần cho toàn bộ tenant hiện hữu trước khi go-live.
- (b) Không backfill, nhưng bổ sung cảnh báo UI khi hồ sơ garage rỗng lúc Duyệt/Đồng bộ lại.
- (c) Chấp nhận hiện trạng (không backfill, không cảnh báo), để garage tự phát hiện khi kiểm tra dữ liệu bên Driver Plus.

### 8. Trạng thái

ĐANG MỞ

### 7.3. Khuyến nghị

SẴN SÀNG sinh TC — 0 finding mức `[Chặn]` còn mở. 5 finding mức `[Cao]` (RR-001, RR-002, RR-003, RR-008, RR-010) nên được làm rõ trước khi viết test case cho đúng các nhánh liên quan (consent gate accessibility, sanitize free-text, right-to-erasure, validate "Loại dịch vụ", ngưỡng NO_SHOW) để tránh test case dựa trên giả định sai; các nhánh còn lại của package vẫn có thể tiến hành sinh TC bình thường.

## 8. Ma Trận Trạng Thái

### 8.1. Yêu cầu liên kết Driver Plus (`partner_link_request`)

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
|---|---|---|---|
| *(D+ push mới)* | Nhận request | Chờ liên kết | Adapter gate pass + garage chưa có liên kết active (BR-DPL-CMN-007), nếu có → chặn, `ERR-DPL-010`, không tạo record |
| Chờ liên kết | Duyệt | Đã liên kết | Consent + scroll gate (BR-DPL-APV-002/003) |
| Chờ liên kết | Từ chối (user) | Từ chối | Lý do bắt buộc ≤2.000 ký tự |
| Chờ liên kết | Cascade auto-reject | Từ chối | Trigger khi 1 record khác cùng garage được Duyệt (BR-DPL-APV-004) |
| Chờ liên kết | D+ withdraw (inbound) | Đã hủy liên kết | Người thực hiện = "Driver Plus", không toast (BR-DPL-CAN-004) |
| Đã liên kết | Đồng bộ lại | *(không đổi)* | Đọc real-time, không ghi đè THÔNG TIN XỬ LÝ (BR-DPL-SYN-002) |
| Đã liên kết | Hủy liên kết (user) | Đã hủy liên kết | Lý do bắt buộc ≤2.000 ký tự |
| Đã liên kết | D+ unlink (inbound) | Đã hủy liên kết | Người thực hiện = "Driver Plus" (BR-DPL-CAN-005) |
| Từ chối / Đã hủy liên kết | *(terminal)* | — | D+ có thể tạo LKD-xxx mới nếu garage hiện chưa có liên kết active (BR-DPL-CMN-003) |

### 8.2. Booking (các dòng liên quan Driver Plus, trích từ BR-GF-SALES §3.1)

| From | To | Điều kiện | Trigger |
|---|---|---|---|
| *(tạo mới)* | Lịch hẹn mới | Nguồn = Driver+, đủ 14 trường | Sự kiện từ Driver+ |
| Lịch hẹn mới | Đã hủy (`cancel_source=DRIVERPLUS_USER`) | Khách gửi yêu cầu hủy qua Driver+ | Áp dụng tự động, không qua duyệt |
| Đã xác nhận | Đã hủy (`cancel_source=DRIVERPLUS_USER`) | Khách gửi yêu cầu hủy qua Driver+ | Áp dụng tự động, không qua duyệt |
| Lịch hẹn mới / Đã xác nhận | Đã hủy (`cancel_source=NO_SHOW_AUTO`) | Quá hạn thời gian quy định (ngưỡng chưa xác định — RR-010) | Hệ thống tự động |
| Xe đã đến / Đã từ chối / Đã hủy | *(giữ nguyên)* | Yêu cầu hủy từ D+ đến khi booking đã khép lại | Không áp dụng hủy, đồng bộ lại thực tế |

## 9. Tóm Tắt Acceptance Criteria (Checklist)

FEAT-SYS-DRIVERPLUS-LINK (43 AC):
- [ ] Nhóm A-C — Điều hướng, danh sách, form chi tiết (AC-1 → AC-11)
- [ ] Nhóm D — Duyệt (AC-12 → AC-16)
- [ ] Nhóm E — Từ chối (AC-17 → AC-19)
- [ ] Nhóm F — Đồng bộ lại (AC-20 → AC-21)
- [ ] Nhóm G — Hủy liên kết (AC-22 → AC-24)
- [ ] Nhóm H — Re-request (AC-25)
- [ ] Nhóm I — Phân quyền (AC-26)
- [ ] Nhóm J — Race condition & lỗi hệ thống (AC-27 → AC-33)
- [ ] Nhóm K — Single-active guard (AC-34)
- [ ] Nhóm L — Hủy 2 chiều inbound (AC-35)
- [ ] Nhóm M — Notification outbound (AC-36 → AC-39)
- [ ] Nhóm N — Mobile (AC-40 → AC-42)
- [ ] Kill-switch (AC-43)

FEAT-BOOK-DRIVERPLUS-INBOUND (9 AC):
- [ ] Nhóm A — Nhận yêu cầu đặt lịch (AC-1 → AC-5)
- [ ] Nhóm B — Nhận yêu cầu hủy (AC-6 → AC-8)
- [ ] Nhóm C — Trùng lặp/dedupe (AC-9)

FEAT-BOOK-DRIVERPLUS-OUTBOUND (11 AC):
- [ ] Nhóm A — Đồng bộ khi garage xử lý (AC-1 → AC-6)
- [ ] Nhóm B — Sự cố khi gửi (AC-7 → AC-9)
- [ ] Nhóm C — Phản hồi từ chối (AC-10 → AC-11)

FEAT-BOOK-EDIT (regression):
- [ ] AC-15 — Đồng bộ khi sửa nội dung (không đổi, cần xác nhận RR-007)

## 10. Khuyến Nghị Cho Kiểm Thử

1. Ưu tiên viết test case cho invariant "tối đa 1 liên kết active/garage" (AC-16, AC-31, AC-34) trước — đây là bất biến quan trọng nhất của toàn bộ package, đã được bảo vệ bằng partial unique index ở tầng DB nên có thể test cả ở tầng API lẫn tầng concurrency (2 request Duyệt đồng thời).
2. Thiết kế bộ test riêng cho 2 chiều "Driver Plus chủ động hủy" (AC-33 withdraw, AC-35 unlink) — đây là luồng inbound event thuần túy (không qua UI), cần môi trường giả lập publish Kafka message trực tiếp, không thể test qua UI thông thường.
3. Test case cho 4 loại notification outbound (AC-36 → AC-39) nên verify đúng wording chính xác từng ký tự (đã chốt câu chữ chính thức) — không chỉ verify có gửi hay không.
4. Với FEAT-BOOK-DRIVERPLUS-INBOUND/OUTBOUND, thiết kế test theo đúng 2 gate đã chốt: 5 trường bắt buộc (thiếu 1 trường bất kỳ → reject `ERR-BOOK-001`) và bước 15 phút của giờ hẹn — đồng thời chờ làm rõ RR-008 (validate "Loại dịch vụ") và RR-009 (validate "Ngày hẹn") trước khi viết test case cho 2 field này.
5. Case NO_SHOW_AUTO → outbound `cancel_source` (AC-4 của OUTBOUND) không nên viết test case chờ thời gian thực tế trôi qua cho đến khi RR-010 (ngưỡng quá hạn) được xác nhận — nên thiết kế test theo cách thao túng trực tiếp thời điểm tạo booking hoặc cấu hình ngưỡng test riêng.
6. Test mobile nên tập trung xác nhận đúng phần khác biệt thật sự (entry point, layout card, màn Bộ lọc full-screen, 2 field bổ sung trên card) — theo đúng tài liệu, toàn bộ phần chi tiết + 4 modal action phải giống hệt Web, nên có thể tái dùng phần lớn test case Web cho phần đó thay vì viết lại từ đầu.
7. Test case tenant isolation (BR-DPL-LST-001, BR-CROSS-001) và tenant mismatch (`data.tenantId` ≠ `headers.OriginTenantId`) nên có mức ưu tiên cao vì đây là alert mức P1 duy nhất trong toàn bộ `INTEG-EXT-driver-plus.md §8.4`.
8. Cân nhắc bổ sung 1 test case bảo mật cho RR-002 (nhập ký tự đặc biệt/HTML tag vào trường "Lý do") ngay cả khi chưa có xác nhận chính thức từ Business Authority — đây là loại lỗi thường bị bỏ sót nếu chỉ test theo đúng AC đã viết.
9. Với RR-001 (accessibility scroll-gate), nếu W07 không có ngân sách test accessibility đầy đủ, tối thiểu nên có 1 test case xác nhận hành vi thực tế của cơ chế "cuộn đến cuối" khi dùng phím tắt trình duyệt (Home/End/Page Down) để biết mức độ rủi ro trước khi release.
10. Test case cho garage cũ chưa backfill `tenant_profile` (RR-012) nên được đưa vào bộ test dữ liệu biên — đây là trạng thái dữ liệu thực tế sẽ tồn tại ngay ngày đầu go-live (mọi tenant tạo trước W07), không phải case hiếm.
