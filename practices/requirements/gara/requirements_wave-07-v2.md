# 📋 Phân Tích Requirement: PKG-W07

## Partner Link + Booking relay Driver Plus (Gara Wave 7)

> Nguồn phân tích: `requirements/gara/wave-07/` — toàn bộ Product layer (PKG, 2 Epic, 5 Feature liên quan, 2 Business Rules) + toàn bộ Architecture layer (3 ADR, 2 HLD, 3 API doc, 2 Event doc, 1 Data model, 3 Integration doc) + `tracking/ARCH-REVIEW-W07.md`.
> Không có mockup/screenshot dạng ảnh được cung cấp trực tiếp — chỉ có link Figma tham chiếu (xem mục 6). Không sinh test case trong tài liệu này, đúng phạm vi workflow `/analyze_requirement_document`.
> Cập nhật 2026-08-11: đã rà soát lại lần 2 toàn bộ 29 file nguồn (đọc lại từng dòng, đối chiếu chéo Product ↔ Architecture ↔ tracking, verify trực tiếp bằng grep/Glob với các claim "đã đăng ký"/"đã tồn tại"), bổ sung 39 finding mới RR-013 → RR-051 vào mục 7 Gap Review (tổng 51 finding). Xem tóm tắt đợt cập nhật tại đầu mục 7.3.

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

> Cập nhật 2026-08-12: sinh file v2 — chuyển toàn bộ 51 finding mục 7 Gap Review sang format mới 9 mục (bổ sung mục 8 "Owner" — vai trò chịu trách nhiệm chốt quyết định) và văn phong con người theo mục 5.4/5.4bis đã cập nhật của skill `requirements_analyzer`, thay cho văn phong liệt kê nhãn kỹ thuật ở bản v1. Không thay đổi bất kỳ sự thật/số liệu/citation nào so với v1 — chỉ đổi cấu trúc và cách viết. Giữ nguyên file v1 (`requirements_wave-07.md`) để đối chiếu song song.

## 7. Điểm Thiếu/Điểm Mờ — Gap Review

### 7.1. Bảng tổng hợp

| Mã | Loại | Mức độ | Tóm tắt | Ảnh hưởng | Owner |
|---|---|---|---|---|---|
| RR-001 | Khả năng tiếp cận | Cao | Cơ chế "cuộn đến cuối" mở khóa checkbox đồng ý (AC-13) không mô tả hành vi cho keyboard/screen-reader | UX | Product Designer + Frontend Lead |
| RR-002 | Bảo mật | Cao | Free text "Lý do" Từ chối/Hủy được nhúng vào UI nội bộ và notification gửi sang Driver Plus mà không có yêu cầu sanitize | TC | Security Lead + Backend Lead |
| RR-003 | Tuân thủ | Cao | Không có bước yêu cầu Driver Plus xóa dữ liệu đã đồng bộ khi garage Hủy liên kết (right-to-erasure) | TC | Legal/Compliance + Solution Architect |
| RR-004 | Tuân thủ | Trung bình | DPA với Driver Plus chưa ký, chính sách lưu trữ dữ liệu phía đối tác chưa xác định | Khác | Legal/Compliance + Business Authority |
| RR-005 | Mơ hồ | Trung bình | Nội dung "Điều khoản chia sẻ thông tin" không lưu phiên bản đã chấp thuận tại thời điểm Duyệt | Khác | Legal/Compliance + Business Authority |
| RR-006 | Thiếu phủ | Trung bình | Giới hạn phòng vệ 500 dòng trong danh sách yêu cầu liên kết không có AC mô tả hành vi UI khi vượt ngưỡng | UX | Product Designer + Business Authority |
| RR-007 | Mơ hồ | Trung bình | `FEAT-BOOK-EDIT` AC-15 (đồng bộ khi sửa lịch hẹn) không nêu điều kiện giới hạn theo nguồn booking, khác với Nhóm A của OUTBOUND đã làm rõ | TC | Business Authority + Backend Lead |
| RR-008 | Mơ hồ | Cao | "Loại dịch vụ" Driver+ vừa được mô tả là enum cố định 3 giá trị vừa được mô tả lưu nguyên văn không map — chưa rõ có validate giá trị hợp lệ tại adapter gate hay không | TC | Business Authority + Solution Architect |
| RR-009 | Biên | Trung bình | Payload đặt lịch Driver+ không có validation cho "Ngày hẹn" quá khứ/quá xa tương lai | TC | Business Authority + Backend Lead |
| RR-010 | Thiếu phủ | Cao | Ngưỡng thời gian "quá hạn" cho NO_SHOW_AUTO chưa được định nghĩa, ảnh hưởng trực tiếp khả năng viết TC xác định cho nhánh outbound `cancel_source=NO_SHOW_AUTO` | TC | Business Authority |
| RR-011 | Tương tranh | Trung bình | Hành vi của outbound event đã nằm trong outbox trước khi feature flag chuyển `off` chưa được đặc tả (tiếp tục phát hay giữ lại) | TC | Backend Lead + Solution Architect |
| RR-012 | Trạng thái | Trung bình | Khi `tenant_profile` chưa có dữ liệu (tenant cũ chưa backfill), Duyệt/Đồng bộ lại vẫn thành công với dữ liệu rỗng gửi sang D+ mà không có cảnh báo cho user | UX | Business Authority + Backend Lead |
| RR-013 | Bảo mật | Cao | "Lý do" WITHDRAW/UNLINK do Driver Plus (đối tác ngoài) gửi kèm không có giới hạn độ dài/sanitize trước khi hiển thị UI nội bộ GMS | TC | Security Lead + Backend Lead |
| RR-014 | Thiếu phủ | Cao | Không có ack/response nào cho 2 inbound event WITHDRAW/UNLINK, khác nguyên tắc correlated-response ADR-029 áp dụng cho luồng CREATE | TC | Solution Architect |
| RR-015 | Mơ hồ | Cao | Mã lỗi `ERR-DPL-003` (checkbox điều khoản chưa tick) được đăng ký ở BR-GF-SYSTEM.md nhưng không tồn tại trong API contract `gf-system-api.md` | TC | Backend Lead + Business Authority |
| RR-016 | Thiếu phủ | Trung bình | `{Tên garage}` trong wording notification outbound có thể `NULL` (tenant cũ chưa backfill) nhưng không có fallback wording | UX | Business Authority + Product Designer |
| RR-017 | Trạng thái | Trung bình | Hành vi kill-switch chưa đặc tả cho 2 inbound event WITHDRAW/UNLINK (chỉ đặc tả rõ cho request tạo mới và outbound) | TC | Solution Architect + Business Authority |
| RR-018 | Biên | Trung bình | Payload inbound (`requestCode`, `partnerAccountName`) không có đặc tả hành vi khi vượt độ dài cột DB tại adapter gate | TC | Backend Lead |
| RR-019 | Thiếu phủ | Trung bình | Hành vi khi Driver Plus gửi lại cùng `request_code` nhưng nội dung khác (không phải retry thuần) chưa được đặc tả | TC | Business Authority + Backend Lead |
| RR-020 | Mơ hồ | Trung bình | Retention "vĩnh viễn" (BR-DPL-CMN-006) bị vô hiệu hoá thực tế do giới hạn 500-row + không tìm kiếm/phân trang | Khác | Business Authority + Product Designer |
| RR-021 | Mơ hồ | Trung bình | Cột `version` (optimistic lock, data model) mô tả cơ chế concurrency khác với cơ chế "conditional UPDATE" mô tả ở API contract | TC | Backend Lead + Solution Architect |
| RR-022 | Bảo mật | Trung bình | Nội suy `{Tên}`/`{Tên garage}` vào `notification.message` (chuỗi JSON) không có quy tắc escaping | TC | Security Lead + Backend Lead |
| RR-023 | Mơ hồ | Thấp | Hành vi "ghi nhớ filter trong phiên" khi reload trang (F5, không đăng xuất) chưa được định nghĩa | UX | Product Designer + Frontend Lead |
| RR-024 | Thiếu phủ | Thấp | Không có cơ chế locale/i18n cho 4 wording notification outbound, hard-code tiếng Việt | Khác | Business Authority + Product Designer |
| RR-025 | Biên | Thấp | Cột `processed_by_label` (VARCHAR 255) không có rule truncate khi tên nhân viên dài, có thể cắt mất hậu tố role | Khác | Backend Lead |
| RR-026 | UX | Thấp | Hành vi cập nhật ngầm (không toast) khi mobile app bị kill/relaunch (khác backgrounded) chưa được đặc tả | UX | Product Designer + Mobile Lead |
| RR-027 | Mơ hồ | Cao | Payload `BookingCreateRequest` thực tế có 15 field (gồm `externalBookingId` bắt buộc) mâu thuẫn với câu chốt AC-2 "không có trường nào khác ngoài 14 trường" | TC | Business Authority + Backend Lead |
| RR-028 | Thiếu phủ | Cao | File `gf-sales-data-model.md` — nguồn duy nhất định nghĩa 2 cột DB mới + 1 index mới của Booking relay — được trích dẫn liên tục nhưng không tồn tại trong repo | TC | Solution Architect |
| RR-029 | Thiếu phủ | Cao | Mã lỗi `ERR-BOOK-001`/`ERR-BOOK-002` được khẳng định "đã đăng ký tại ERROR-CODE-REGISTRY.md §6" nhưng registry thật không có 2 mã này | TC | Backend Lead + Business Authority |
| RR-030 | Mơ hồ | Cao | FEAT-BOOK-EDIT AC-8 dẫn chiếu "kiểm tra khung giờ tương tự tạo mới" nhưng không validate bước 15 phút — garage có thể sửa booking nguồn D+ sang giờ lệch slot | TC | Business Authority + Backend Lead |
| RR-031 | Mơ hồ | Cao | Schema thật của event `BOOKING.UPDATE.RESPONSE` (AC-15) chưa được đặc tả; bằng chứng cho thấy tái dùng payload luồng tạo mới, không mang nội dung đã cập nhật | TC | Solution Architect + Backend Lead |
| RR-032 | Thiếu phủ | Trung bình | Danh sách/Chi tiết lịch hẹn (FEAT-BOOK-LIST/DETAIL) chưa có AC phản ánh trường "Loại dịch vụ" macro của Driver+ dù INBOUND AC-3 khẳng định sẽ hiển thị | UX | Business Authority + Product Designer |
| RR-033 | Thiếu phủ | Trung bình | Không có cơ chế nào để Driver Plus chủ động truy vấn lại trạng thái booking khi bỏ lỡ event Kafka (toàn bộ tích hợp là fire-and-forget 1 chiều) | Khác | Solution Architect + Business Authority |
| RR-034 | Tương tranh | Trung bình | Dedupe theo `event_id` (AC-9) chỉ xử lý retry mạng cùng event_id, không phát hiện 2 yêu cầu logic giống hệt nhưng khác `event_id` (double-tap phía D+) | UX | Backend Lead + Solution Architect |
| RR-035 | Thiếu phủ | Trung bình | Khi yêu cầu hủy từ Driver+ không đủ điều kiện áp dụng (đã có phiếu DV/booking đã khép lại), việc garage được thông báo hay không chỉ là "có thể publish", không phải invariant chắc chắn | UX | Business Authority + Backend Lead |
| RR-036 | Thiếu phủ | Trung bình | Không có định nghĩa cụ thể kênh/mức độ/SLA cảnh báo vận hành khi outbound hết số lần retry, chỉ ghi chung "ghi nhận ngoại lệ" | Khác | DevOps/SRE Lead + Backend Lead |
| RR-037 | Thiếu phủ | Thấp | Không có chính sách retention/TTL cho bảng `inbox_event`/`outbox_event` dùng để dedupe | Khác | Backend Lead + DevOps/SRE Lead |
| RR-038 | Bảo mật | Trung bình | Trường `vehicleImages` (mảng URL) nhận từ Driver+ không giới hạn số lượng phần tử và không validate định dạng/domain | TC | Security Lead + Backend Lead |
| RR-039 | Thiếu phủ | Thấp | File `Product/epics/EP-BOOKING.md` không chứa nội dung Epic — nội dung thực tế là `UX-FLOW-BOOKING`, không tìm thấy epic-level doc thật của EP-BOOKING trong scope wave-07 | Khác | Business Authority/Product Owner |
| RR-040 | Tương tranh | Cao | Không có UI xử lý xác định khi kill-switch chuyển `off` giữa lúc user đã mở sẵn trang/modal và bấm action (mutation trả `FLAG_OFF` 403, không có message định nghĩa) | UX | Product Designer + Frontend Lead |
| RR-041 | Thiếu phủ | Trung bình | Không có UI xử lý cho `NF_404` khi fetch chi tiết yêu cầu liên kết trong race condition auto-select item đầu | UX | Product Designer + Frontend Lead |
| RR-042 | Mơ hồ | Trung bình | `ERR-DPL-007` dùng chung cho cả `listPartnerLinkRequests` và `getPartnerLinkRequestDetail` nhưng chỉ ngữ cảnh list có UI (banner) được định nghĩa | UX | Product Designer + Frontend Lead |
| RR-043 | Mơ hồ | Trung bình | Mobile không tái khẳng định yêu cầu `no-cache` cho `getPartnerLinkRequestDetail` như Web (chỉ dùng `networkOnly` default, khác `no-cache` về hành vi ghi cache) | TC | Mobile Lead + Backend Lead |
| RR-044 | Thiếu phủ | Trung bình | Mobile không có UI xử lý lỗi tải danh sách yêu cầu liên kết ban đầu, dù dùng chung 1 operation với Web (đã có banner lỗi) | UX | Mobile Lead + Product Designer |
| RR-045 | Thiếu phủ | Trung bình | Không có cơ chế phát hiện Driver Plus ngừng gửi message hoàn toàn ở phía producer (chỉ có alert lag khi có message tồn tại) | Khác | DevOps/SRE Lead + Solution Architect |
| RR-046 | Thiếu phủ | Thấp | Chưa có schema registry, contract test dựa hoàn toàn vào fixture thủ công (Open Question tự nhận, chưa vào Gap Review) | Khác | Backend Lead + Solution Architect |
| RR-047 | Biên | Thấp | Không có rule xử lý khi `data.eventVersion` trong envelope Kafka khác giá trị hiện tại "1.0" | TC | Backend Lead + Solution Architect |
| RR-048 | Thiếu phủ | Trung bình | KG (`gf-system`/`gf-sales`) và `SERVICE-BOUNDARY-MATRIX` chưa backfill Partner Link — tự ARCH-REVIEW-W07 đánh dấu UNVERIFIED, PKG-W07 Entry Criteria vẫn chưa tick | Khác | Solution Architect |
| RR-049 | Mơ hồ | Trung bình | Success Metric #3 (EP-PARTNER-LINK) trộn "Từ chối do user" và "auto-reject cascade" trong mẫu số, làm sai lệch ý nghĩa đo lường "consistency thao tác" | Khác | Business Authority |
| RR-050 | Thiếu phủ | Thấp | Cả 3 Success Metric của EP-PARTNER-LINK không có AC/cơ chế đo lường-báo cáo nào được định nghĩa sau go-live | Khác | Business Authority |
| RR-051 | Mơ hồ | Thấp | PKG-W07 Entry Criteria trích dẫn phiên bản cũ (v3) của `INTEG-EXT-driver-plus.md` dù tài liệu hiện tại đã lên v5 | Khác | Business Authority/Solution Architect |

### 7.2. Chi tiết từng finding

## RR-001 [Cao] Khả năng tiếp cận — FEAT-SYS-DRIVERPLUS-LINK AC-13 "cuộn đến cuối" mở khóa consent không quy định cơ chế cho bàn phím/screen-reader

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L125-L130)
- **Section**: Nhóm D → AC-13, cite chéo `BR-DPL-APV-003` (`BR-GF-SYSTEM.md §2.5.3`)
- **Dòng**: 125-130
- **Quote nguyên văn**:
> "Khi: user chưa cuộn đến cuối nội dung điều khoản. Thì: checkbox **disabled** (không tick được); phía trên checkbox hiển thị hint 'Vui lòng cuộn xuống cuối để tiếp tục'. Khi: user đã cuộn đến cuối nội dung điều khoản. Thì: checkbox chuyển sang enabled, hint biến mất, user có thể tick."

### 2. Bối cảnh nghiệp vụ

Khi 1 yêu cầu liên kết Driver Plus chuyển sang "Chờ liên kết", nhân viên garage mở modal "Duyệt liên kết với Driver Plus" (AC-12) để xử lý. Modal này chặn checkbox đồng ý ở trạng thái disabled cho tới khi người dùng đọc hết block điều khoản chia sẻ thông tin — chỉ khi checkbox đã tick, nút "Đồng ý liên kết" mới bật lên (AC-14). Đây là cửa duy nhất để hoàn tất hành động "Duyệt", 1 trong 2 lựa chọn chính (cùng với "Từ chối") mà nhân viên có ở trạng thái "Chờ liên kết" — không có đường tắt nào khác.

### 3. Vấn đề cụ thể

Vấn đề nằm ở chỗ AC-13 và `BR-DPL-APV-003` chỉ nói tới ĐIỀU KIỆN cần đạt ("đã cuộn đến cuối"), chứ không nói CÁCH để đạt điều kiện đó. Nếu DEV hiện thực theo cách đơn giản nhất — chỉ lắng nghe sự kiện `scroll` phát sinh từ chuột hoặc chạm tay (Khả năng A) — thì 1 người dùng thao tác hoàn toàn bằng bàn phím (Page Down/End) hoặc dùng screen-reader đọc tuần tự nội dung sẽ không kích hoạt sự kiện `scroll` DOM theo cách thông thường, và do đó có thể KHÔNG BAO GIỜ đạt được điều kiện "đã cuộn đến cuối". Cách hiện thực đúng đắn hơn (Khả năng B) là tính điều kiện dựa trên vị trí scroll thật của container, bất kể nguồn kích hoạt là gì — kể cả `element.scrollIntoView()` khi focus chạm tới phần tử cuối cùng.

### 4. Ảnh hưởng nếu không giải quyết

- Một nhóm người dùng thao tác hoàn toàn bằng bàn phím hoặc dùng screen-reader có thể bị chặn đứng, không bao giờ Duyệt được liên kết — không có đường vòng nào khác trong toàn bộ feature để hoàn tất hành động này.
- Đội QA sẽ không biết PASS hay FAIL khi viết test case accessibility, vì tài liệu chưa định nghĩa rõ hành vi mong đợi để làm oracle so sánh.
- Nếu action bị khoá hoàn toàn với thao tác bàn phím, hệ thống có nguy cơ vi phạm tiêu chuẩn WCAG 2.1 SC 2.1.1 (Keyboard).

### 5. Đề xuất giải quyết

Bổ sung 1 AC yêu cầu điều kiện "đã cuộn đến cuối" phải kích hoạt được qua cả 3 kênh tương đương: scroll chuột/touch, phím Page Down/End/mũi tên trong vùng nội dung, và focus đến phần tử cuối cùng của block điều khoản. Đây là đề xuất theo best practice WCAG 2.1 SC 2.1.1 Keyboard, chưa phải yêu cầu đã có sẵn trong tài liệu.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Nếu chọn bắt buộc cơ chế "cuộn đến cuối" hỗ trợ đầy đủ bàn phím + screen-reader trong phạm vi W07, DEV sẽ triển khai theo Khả năng B ngay từ đầu và cần thêm effort thiết kế/test accessibility.
- (b) Nếu chấp nhận rủi ro chỉ hỗ trợ chuột/touch trong W07, người dùng thao tác bằng bàn phím/screen-reader sẽ tạm thời không Duyệt được liên kết, và đội sẽ ghi nhận đây là nợ kỹ thuật cần xử lý ở đợt sau.
- (c) Nếu có phương án khác, cần nêu rõ để đánh giá lại mức độ ảnh hưởng.

### 8. Owner

Product Designer + Frontend Lead (quyết định cơ chế thay thế cho thao tác bàn phím/screen-reader là vấn đề thiết kế tương tác, không phải business rule)

### 9. Trạng thái

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

Khi nhân viên garage Từ chối hoặc Hủy liên kết, họ được yêu cầu gõ vào 1 ô "Lý do" tự do, tối đa 2.000 ký tự. Nội dung này không chỉ nằm yên trên UI nội bộ (section "THÔNG TIN XỬ LÝ") — `gf-system` còn nhúng nguyên văn nó vào field `notification.message`, rồi gửi qua Kafka sang Driver Plus (event `PARTNER_LINK.STATUS.CHANGED`), nơi nhiều khả năng nó được render trực tiếp trên UI của hệ thống đối tác ngoài.

### 3. Vấn đề cụ thể

Rà lại toàn bộ `BR-GF-SYSTEM.md §5.5` (Validation Rules, `VLD-DPL-001..006`) thì không có rule nào yêu cầu escape hay sanitize ký tự đặc biệt (HTML tag, script, ký tự điều khiển) tại bất kỳ điểm nào trong 3 điểm mà chuỗi "Lý do" này đi qua: hiển thị lại trên UI nội bộ GMS Web + Mobile, truyền sang hệ thống ngoài Driver Plus qua `notification.message`, và lưu vĩnh viễn trong DB theo `BR-DPL-CMN-006`.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu FE Web/Mobile của GMS hoặc FE của Driver Plus render field này dưới dạng HTML không escape, hệ thống sẽ hở lỗ hổng XSS lưu trữ (stored XSS).
- Bề mặt tấn công rộng hơn hẳn 1 field nội bộ thông thường, vì dữ liệu đi xuyên hệ thống — từ garage nhập, qua UI GMS, tới tận hệ thống ngoài Driver Plus.
- Vì tài liệu chưa có yêu cầu tường minh nào để làm căn cứ, đội QA không suy ra được bất kỳ test case bảo mật nào cho luồng dữ liệu này.

### 5. Đề xuất giải quyết

Áp dụng nguyên tắc "output encoding tại điểm render" (không sanitize tại input để giữ nguyên văn phục vụ audit) cho cả 3 điểm hiển thị/truyền dữ liệu nêu trên — đây là best practice OWASP, chưa có xác nhận từ Business Authority/Architecture trong tài liệu hiện tại.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung yêu cầu tường minh về output encoding/sanitize cho trường "Lý do" trước khi hiển thị lại trên UI và trước khi gửi sang Driver Plus, DEV cần thêm bước xử lý tại cả 3 điểm dữ liệu đi qua.
- (b) Nếu xác nhận đã có cơ chế chung ở tầng framework/FE bao phủ mọi free-text field, tài liệu Product không cần lặp lại yêu cầu này và có thể đóng gap.
- (c) Nếu cần điều tra thêm trước khi quyết định, nên xác định rõ cơ chế hiện tại (nếu có) đang nằm ở tầng nào.

### 8. Owner

Security Lead + Backend Lead (quyết định policy sanitize/escape trước khi dữ liệu tự do rời khỏi hệ thống ra đối tác ngoài là quyết định an toàn dữ liệu)

### 9. Trạng thái

ĐANG MỞ

## RR-003 [Cao] Tuân thủ — Không có bước yêu cầu Driver Plus xóa dữ liệu đã đồng bộ khi garage Hủy liên kết

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L283)
- **Section**: §10 PII / Compliance / Data Residency
- **Dòng**: 283
- **Quote nguyên văn**:
> "Right-to-erasure flow | Gap đã biết: khi garage Hủy liên kết, GMS publish PARTNER_LINK.STATUS.CHANGED UNLINKED nhưng không có step yêu cầu D+ xoá dữ liệu đã đồng bộ. Nếu cần → CR riêng thêm step PARTNER_LINK.DATA.PURGE."

### 2. Bối cảnh nghiệp vụ

Suốt thời gian trạng thái liên kết là "Đã liên kết", toàn bộ hồ sơ doanh nghiệp của garage — tên, SĐT, địa chỉ, mã số thuế, email nhận hóa đơn — được `gf-system` đẩy sang Driver Plus qua event `PARTNER_LINK.PROFILE.SYNC` mỗi lần Duyệt hoặc Đồng bộ lại. Nhưng khi garage quyết định Hủy liên kết (AC-24), hệ thống chỉ gửi 1 event `PARTNER_LINK.STATUS.CHANGED` để báo trạng thái đã đổi — không kèm bất kỳ yêu cầu xóa dữ liệu nào.

### 3. Vấn đề cụ thể

Đây là gap kiến trúc mà chính tài liệu đã tự nhận biết trước, nhưng khi rà lại `FEAT-SYS-DRIVERPLUS-LINK.md` — kể cả AC-24 Hủy liên kết — thì không có Acceptance Criteria nào đề cập tới việc yêu cầu Driver Plus xóa dữ liệu garage đã nhận trước đó. Nói cách khác, dữ liệu vẫn nằm ở hệ thống đối tác vô thời hạn sau khi liên kết đã kết thúc.

### 4. Ảnh hưởng nếu không giải quyết

- Garage chủ động bấm Hủy liên kết với kỳ vọng hợp lý là dừng chia sẻ dữ liệu, nhưng thực tế hồ sơ doanh nghiệp của họ vẫn nằm ở hệ thống đối tác ngoài vô thời hạn.
- Hệ thống đối diện rủi ro tuân thủ Nghị định bảo vệ dữ liệu cá nhân Việt Nam (PDPD) — chính tài liệu kiến trúc cũng đã trích dẫn rủi ro này tại cùng section.
- Vì hành vi "xóa dữ liệu sau khi hủy" chưa tồn tại trong đặc tả, đội QA không có cách nào viết test case để verify nó.

### 5. Đề xuất giải quyết

Đây là quyết định nghiệp vụ + pháp lý cần Business Authority/Legal xác nhận, không phải điều agent có thể tự đề xuất giải pháp kỹ thuật thay thế.

### 6. Liên kết với các phát hiện khác

Cùng nhóm compliance với RR-004 (DPA/retention phía Driver Plus chưa xác nhận).

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung yêu cầu xóa dữ liệu doanh nghiệp phía Driver Plus (right-to-erasure, step `PARTNER_LINK.DATA.PURGE`) trong phạm vi W07, cần thêm 1 event mới và phối hợp với đội Driver Plus để họ implement phía nhận.
- (b) Nếu chấp nhận rủi ro tạm thời và để CR riêng xử lý sau như Architecture đã đề xuất, cần ghi nhận rõ đây là nợ kỹ thuật/compliance đang mở.
- (c) Nếu cần tham vấn Legal trước khi quyết định, nên làm việc này trước khi go-live để tránh rủi ro pháp lý phát sinh sau.

### 8. Owner

Legal/Compliance + Solution Architect (right-to-erasure là nghĩa vụ pháp lý cần Legal xác nhận, Solution Architect thiết kế cơ chế thực thi)

### 9. Trạng thái

ĐANG MỞ

## RR-004 [Trung bình] Tuân thủ — DPA với Driver Plus chưa ký, chính sách lưu trữ dữ liệu phía đối tác chưa xác định

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L281-L282)
- **Section**: §10 PII / Compliance / Data Residency
- **Dòng**: 281-282
- **Quote nguyên văn**:
> "DPA signed | Open Question — chưa xác nhận trong Product docs. Data retention at provider | Open Question — Driver Plus giữ hồ sơ garage bao lâu sau khi hủy liên kết chưa được đặc tả."

### 2. Bối cảnh nghiệp vụ

Toàn bộ cơ chế consent trong feature — checkbox "Tôi đã đọc và đồng ý chia sẻ thông tin garage với Driver Plus" ở AC-12..AC-14 — ngầm giả định có sẵn 1 khung pháp lý nền (Data Processing Agreement) giữa GMS và Driver Plus làm cơ sở cho việc chia sẻ dữ liệu doanh nghiệp. Nhưng khi rà lại toàn bộ nguồn Product, không có tài liệu nào xác nhận khung pháp lý đó thực sự tồn tại.

### 3. Vấn đề cụ thể

Có 2 mục compliance còn treo mà không nguồn Product nào xác nhận: DPA giữa 2 bên chưa ký, và chính sách lưu trữ dữ liệu phía Driver Plus sau khi liên kết kết thúc chưa được đặc tả ở bất kỳ đâu.

### 4. Ảnh hưởng nếu không giải quyết

- Gap này không cản trở việc sinh test case chức năng, vì đây không phải hành vi hệ thống có thể test được.
- Nhưng nó tạo ra rủi ro release/compliance thật: garage đồng ý chia sẻ dữ liệu qua checkbox consent trong khi điều khoản pháp lý nền giữa 2 doanh nghiệp còn chưa tồn tại.

### 5. Đề xuất giải quyết

Xác nhận với Legal/Business Authority về tiến độ DPA trước khi go-live sản xuất, độc lập với tiến độ DEV/QA.

### 6. Liên kết với các phát hiện khác

Cùng nhóm compliance với RR-003 (right-to-erasure).

### 7. Câu hỏi cho người dùng

- (a) Nếu DPA và chính sách lưu trữ dữ liệu phía đối tác là điều kiện chặn go-live của W07, cần theo dõi tiến độ ký DPA như 1 blocker chính thức.
- (b) Nếu có thể release trước, tiến độ DPA sẽ được theo dõi riêng, tách khỏi phạm vi DEV/QA.

### 8. Owner

Legal/Compliance + Business Authority (ký DPA là quyết định pháp lý/đối tác thuộc thẩm quyền kinh doanh, không phải kỹ thuật)

### 9. Trạng thái

ĐANG MỞ

## RR-005 [Trung bình] Mơ hồ — Nội dung "Điều khoản chia sẻ thông tin" không lưu phiên bản đã chấp thuận tại thời điểm Duyệt

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L117-L123); đối chiếu [gf-system-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-system-data-model.md#L344-L359)
- **Section**: AC-12 (nội dung điều khoản); Architecture §2bis.2 (bảng `partner_link_request`, không có cột version điều khoản)
- **Dòng**: 117-123 (AC-12); 344-359 (bảng cột `partner_link_request`)
- **Quote nguyên văn**:
> "Đây là nội dung đã được Business Authority chốt để hiển thị trên Web/Mobile, không phải bản tạm và không còn chờ Legal bổ sung câu chữ trong phạm vi feature này." (AC-12)

### 2. Bối cảnh nghiệp vụ

Khi nhân viên garage bấm "Đồng ý liên kết", input `ApprovePartnerLinkInput` ở tầng BFF chỉ gửi lên 1 cờ boolean `termsAccepted: true` — không kèm bất kỳ định danh nào cho biết họ đã đồng ý dựa trên phiên bản nội dung điều khoản nào. Kiểm tra thêm bảng `partner_link_request` (V8) thì cũng không có cột nào lưu version điều khoản.

### 3. Vấn đề cụ thể

AC-12 xác nhận nội dung điều khoản hiện tại "không còn chờ Legal bổ sung câu chữ trong phạm vi feature này" — câu này ngầm hàm ý nội dung CÓ THỂ được Legal cập nhật ở 1 thời điểm khác, ngoài phạm vi W07. Nếu điều đó thực sự xảy ra sau này, hệ thống sẽ không có cách nào biết garage đã Duyệt dựa trên phiên bản điều khoản nào, vì không có field `termsVersion` hay tương đương để lưu vết.

### 4. Ảnh hưởng nếu không giải quyết

- Khi có audit hoặc tranh chấp pháp lý về nội dung đã đồng ý, GMS không chứng minh được garage đã đọc/đồng ý đúng phiên bản điều khoản nào tại thời điểm Duyệt.
- Điều này làm suy yếu giá trị pháp lý của toàn bộ cơ chế consent — vốn đã được thiết kế khá cẩn thận với scroll-gate ở AC-13 (xem RR-001).

### 5. Đề xuất giải quyết

Bổ sung 1 field (VD `termsVersion`) lưu kèm mỗi lần Duyệt — đây là đề xuất, chưa có căn cứ xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Liên quan tới RR-001 (cùng modal Duyệt, cùng cơ chế consent).

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung lưu vết phiên bản nội dung điều khoản tại mỗi lần Duyệt, cần thêm field `termsVersion` vào cả model dữ liệu lẫn input BFF.
- (b) Nếu không cần, vì nội dung điều khoản coi như cố định trong toàn bộ vòng đời sản phẩm (không có kế hoạch Legal sửa sau), gap này có thể đóng mà không cần thay đổi gì.

### 8. Owner

Legal/Compliance + Business Authority (lưu phiên bản điều khoản đã chấp thuận là yêu cầu pháp lý cần Legal xác nhận mức độ cần thiết)

### 9. Trạng thái

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

`BR-DPL-LST-004` đã chốt bỏ hẳn tìm kiếm và phân trang trong danh sách yêu cầu liên kết, với lý do "danh sách thường ngắn" — dựa trên invariant 1 garage tối đa chỉ có 1 liên kết active. Tuy vậy, phía kiến trúc vẫn thận trọng bổ sung 1 cơ chế phòng vệ kỹ thuật: cap 500 dòng, và trả kèm field `truncated: Boolean!` cho FE, đề phòng trường hợp giả định nghiệp vụ trên bị sai.

### 3. Vấn đề cụ thể

AC-6 khẳng định danh sách "render toàn bộ record thoả filter" mà hoàn toàn không nhắc tới giới hạn nào. Khi rà lại `FEAT-SYS-DRIVERPLUS-LINK.md`, không có Acceptance Criteria nào mô tả FE (Web hay Mobile) phải hiển thị gì khi `truncated=true` — hiện banner cảnh báo, hay cứ im lặng chỉ hiện 500 dòng mới nhất mà không nói gì với người dùng.

### 4. Ảnh hưởng nếu không giải quyết

- Vì không có AC nào yêu cầu dùng field `truncated`, DEV hoàn toàn có thể bỏ qua nó khi implement.
- Khi 1 garage vượt quá 500 yêu cầu liên kết, người dùng sẽ âm thầm không thấy hết dữ liệu của mình mà không nhận được bất kỳ cảnh báo nào.

### 5. Đề xuất giải quyết

Bổ sung 1 AC mô tả hành vi UI khi `truncated=true`, ví dụ:

```
Banner ở đầu panel trái: "Chỉ hiển thị 500 yêu cầu gần nhất theo ngày gửi. Thu hẹp bộ lọc để xem đầy đủ."
```

Đề xuất dựa trên field đã có sẵn ở tầng kiến trúc, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung banner cảnh báo khi `truncated=true` theo Đề xuất giải quyết, FE cần thêm 1 vùng hiển thị banner và logic đọc field này.
- (b) Nếu không cần, đội chấp nhận im lặng cắt bớt dữ liệu vì case gần như không xảy ra trong thực tế, không cần thay đổi FE.

### 8. Owner

Product Designer + Business Authority (quyết định trải nghiệm khi dữ liệu bị cắt bớt là quyết định UX/nghiệp vụ, không phải kỹ thuật thuần)

### 9. Trạng thái

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

Đợt rewrite tích hợp Driver+ ngày 2026-08-03 đã tách riêng 2 luồng outbound: đồng bộ trạng thái vòng đời (nay chuyển hẳn về `FEAT-BOOK-DRIVERPLUS-OUTBOUND` Nhóm A) và đồng bộ khi sửa nội dung (vẫn giữ nguyên ở `FEAT-BOOK-EDIT` AC-15, được đánh dấu "không đổi").

### 3. Vấn đề cụ thể

Nhóm A của OUTBOUND đã được làm rõ tường minh tại EC-2: chỉ gửi event cho booking có nguồn Driver+, vì "Driver+ không biết và không cần biết booking không phải của họ". AC-15 mang bản chất y hệt — cũng là gửi thông tin booking sang D+ — nhưng lại không có điều kiện lọc theo nguồn booking tương tự, và vì được đánh dấu "không đổi" nên nó không được rà soát lại theo cùng logic này trong đợt rewrite.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu implementation hiện tại của AC-15 đang gửi `BOOKING.UPDATE.RESPONSE` cho MỌI booking khi sửa — kể cả booking nguồn Garage Care hay Walk-in — hệ thống sẽ liên tục gửi Kafka event vô nghĩa sang Driver+ cho những booking mà D+ hoàn toàn không hề biết đến.
- Điều này gây lãng phí throughput và có thể tạo nhiễu log/alert phía D+.
- Nếu payload chứa thông tin khách hàng, đây còn là rủi ro rò rỉ dữ liệu khách nội bộ (không phải khách của D+) sang hệ thống ngoài.

### 5. Đề xuất giải quyết

Xác nhận hành vi thực tế đang chạy production của AC-15. Nếu nó đã tự nhiên chỉ áp dụng cho booking nguồn D+ thì đây chỉ là gap tài liệu (thiếu 1 câu làm rõ); nếu implementation hiện tại KHÔNG lọc theo nguồn, đây là 1 gap hành vi thật cần fix.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung điều kiện tường minh "chỉ áp dụng cho booking nguồn Driver Plus" vào AC-15 giống Nhóm A của OUTBOUND, cần đối chiếu lại code hiện tại để xác nhận có đang lọc đúng hay không.
- (b) Nếu xác nhận hành vi hiện tại đã lọc đúng theo nguồn, chỉ cần bổ sung 1 câu làm rõ trong tài liệu, không cần đổi code.
- (c) Nếu cần kiểm tra code/log production trước khi trả lời, nên thực hiện việc này trước khi chốt phương án.

### 8. Owner

Business Authority + Backend Lead (cần xác nhận lại phạm vi áp dụng nghiệp vụ trước khi Backend Lead điều chỉnh điều kiện gửi event)

### 9. Trạng thái

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

"Loại dịch vụ" là 1 trong 5 trường bắt buộc của payload đặt lịch Driver+, được dùng làm "loại dịch vụ macro" hiển thị trên Danh sách/Chi tiết lịch hẹn Web GMS — tách biệt hoàn toàn khỏi danh mục dịch vụ nội bộ GMS (`EP-CATALOG`).

### 3. Vấn đề cụ thể

AC-2 mô tả "Loại dịch vụ" như 1 enum đóng với đúng 3 giá trị hợp lệ, ngụ ý cần validate giá trị nhận được có nằm trong tập 3 giá trị này hay không. Nhưng AC-3 lại mô tả hệ thống chỉ "lưu và hiển thị nguyên văn", nhấn mạnh việc "không map" vào danh mục nội bộ. AC-2 chỉ nêu rõ hành vi khi field này HOÀN TOÀN THIẾU, chứ không nêu hành vi khi field CÓ GIÁ TRỊ nhưng giá trị đó không khớp 3 enum đã liệt kê — ví dụ do lỗi phiên bản client cũ phía D+, hoặc chỉ khác biệt hoa/thường. Có 2 khả năng: adapter gate validate nghiêm ngặt theo enum, reject với `ERR-BOOK-001` giống case thiếu trường (Khả năng A); hoặc adapter gate chấp nhận nguyên văn bất kỳ chuỗi non-empty nào, nhất quán với tinh thần "không map" ở AC-3 (Khả năng B).

### 4. Ảnh hưởng nếu không giải quyết

- 2 nhánh xử lý hoàn toàn khác nhau tùy cách hiểu, khiến đội QA không thể viết chính xác test case cho case "Loại dịch vụ chứa giá trị lạ".
- Nếu chọn nhầm Khả năng B trong khi ý định thực sự là A: booking vẫn được tạo với "loại dịch vụ macro" là 1 chuỗi lạ không nằm trong 3 giá trị chuẩn, có thể phá vỡ báo cáo/thống kê phía sau vốn giả định chỉ có 3 giá trị.

### 5. Đề xuất giải quyết

Đối chiếu AC-3 (đã RESOLVED, xác nhận qua tài liệu chính thức FEAT-DP-034 §7 phía Driver+, không phải suy luận), có khả năng cao ý định thực sự là Khả năng B (chấp nhận nguyên văn, không validate enum ở adapter gate GMS) vì bản chất Driver+ tự quản danh mục của họ, GMS chỉ lưu hộ — nhưng đây là suy luận cần xác nhận, không phải sự thật đã chốt.

### 6. Liên kết với các phát hiện khác

Cùng nhóm validate payload inbound với RR-009 (validate "Ngày hẹn").

### 7. Câu hỏi cho người dùng

- (a) Nếu chọn để adapter gate validate giá trị "Loại dịch vụ" phải khớp đúng 1 trong 3 enum và reject nếu không khớp (Khả năng A), cần bổ sung logic validate mới ở adapter gate.
- (b) Nếu chọn để adapter gate chấp nhận lưu nguyên văn bất kỳ chuỗi non-empty nào, không validate enum (Khả năng B), hành vi hiện tại có thể giữ nguyên nhưng cần ghi rõ vào tài liệu để tránh hiểu nhầm sau này.

### 8. Owner

Business Authority + Solution Architect (mâu thuẫn giữa 2 tài liệu nghiệp vụ cần Business Authority chốt lại đặc tả gốc, Solution Architect xác nhận cách adapter gate implement đúng)

### 9. Trạng thái

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

5 trường bắt buộc của payload Driver+ gồm Số điện thoại, Tên, Ngày hẹn, Giờ hẹn, Loại dịch vụ. Trong 5 trường này, chỉ "Giờ hẹn" có validate cụ thể — bước 15 phút, đã RESOLVED ở EC-3. Luồng tạo lịch hẹn thủ công qua UI (`UX-FLOW-BOOKING.md §6`) cũng chỉ ghi "Kiểm tra khung giờ (cảnh báo nếu có lịch hẹn gần, không chặn)" cho "Ngày hẹn" — không validate ngày quá khứ, nhưng luồng thủ công có datepicker UI thường tự chặn chọn ngày quá khứ, trong khi luồng Driver+ là event tự động, không có ràng buộc UI tương đương.

### 3. Vấn đề cụ thể

Không có bất kỳ đặc tả nào cho việc validate "Ngày hẹn" nhận từ Driver+ — không rõ hệ thống có reject payload có "Ngày hẹn" ở quá khứ hoặc quá xa tương lai (ví dụ do lỗi dữ liệu/đồng hồ phía Driver+) hay chấp nhận tạo booking bình thường.

### 4. Ảnh hưởng nếu không giải quyết

- Hệ thống có thể tạo ra booking với "Ngày hẹn" trong quá khứ hoặc bất hợp lý (ví dụ 5 năm sau), hiển thị công khai trên Danh sách lịch hẹn Web GMS.
- Điều này gây nhiễu vận hành, và vì chưa có expected behavior nào được định nghĩa, đội QA không có test case nào phủ được case này.

### 5. Đề xuất giải quyết

Bổ sung validate biên hợp lý cho "Ngày hẹn" tại adapter gate (VD không cho phép ngày trong quá khứ) — đề xuất theo suy luận nghiệp vụ thông thường, chưa có căn cứ xác nhận từ tài liệu.

### 6. Liên kết với các phát hiện khác

Cùng nhóm validate payload inbound với RR-008 ("Loại dịch vụ").

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung validate "Ngày hẹn" không được ở quá khứ (và/hoặc giới hạn khoảng tương lai hợp lý) tại adapter gate, tương tự cách validate "Giờ hẹn" ở EC-3, cần thêm logic reject mới.
- (b) Nếu không cần validate, hệ thống sẽ chấp nhận mọi giá trị ngày hợp lệ về mặt định dạng, kể cả ngày bất hợp lý về nghiệp vụ.

### 8. Owner

Business Authority + Backend Lead (ngưỡng hợp lệ của ngày hẹn là quy tắc nghiệp vụ cần Business Authority định nghĩa)

### 9. Trạng thái

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

`cancel_source=NO_SHOW_AUTO` là 1 trong 3 giá trị bắt buộc phải gửi kèm khi booking chuyển "Đã hủy" và có nguồn Driver+ (`FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-4) — đây là nhánh do hệ thống tự động kích hoạt khi lịch hẹn quá hạn, không phải do garage hay khách hàng chủ động huỷ.

### 3. Vấn đề cụ thể

Đây là gap mà chính `BR-GF-SALES.md` đã tự phát hiện từ trước (M-1, thuộc baseline, không phát sinh riêng do Driver+), nhưng W07 làm cho gap này trở nên quan trọng hơn hẳn: đội QA không thể thiết kế 1 test case xác định (deterministic) cho hành vi "quá hạn tự động → gửi `cancel_source=NO_SHOW_AUTO` sang Driver+" nếu không biết chính xác ngưỡng thời gian hoặc cách cấu hình nó.

### 4. Ảnh hưởng nếu không giải quyết

- Không thể viết test case chính xác cho toàn bộ nhánh "booking tự động hủy do quá hạn → đồng bộ cancel_source=NO_SHOW_AUTO sang Driver Plus".
- Đội QA phải chờ suy luận từ code hoặc set up test bằng cách chỉnh trực tiếp dữ liệu (bypass thời gian chờ thực tế), làm tăng rủi ro test không phản ánh đúng hành vi production.

### 5. Đề xuất giải quyết

Đối chiếu đề xuất P-2 đã có sẵn trong `BR-GF-SALES.md §7.3` — "Định nghĩa thời gian quá hạn booking có thể cấu hình theo garage" — đây là đề xuất đã ghi nhận trước, chưa được Business Authority chốt giá trị cụ thể.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này (gap gốc thuộc baseline, không phát sinh riêng do W07).

### 7. Câu hỏi cho người dùng

- (a) Nếu chốt 1 giá trị cố định toàn hệ thống cho ngưỡng "quá hạn" (VD 24h, 48h...), test case có thể được viết ngay dựa trên giá trị đó.
- (b) Nếu chốt cơ chế cấu hình theo từng garage, cần thêm field cấu hình tương ứng trước khi test case có thể xác định được.
- (c) Nếu cần Business Authority quyết định vì chưa có đủ dữ liệu để đề xuất, nên ưu tiên xử lý sớm vì gap này chặn cả test case lẫn hành vi production.

### 8. Owner

Business Authority (ngưỡng "quá hạn" là con số nghiệp vụ ảnh hưởng trực tiếp trải nghiệm khách hàng, cần thẩm quyền kinh doanh chốt)

### 9. Trạng thái

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

`PartnerLink:DriverPlus` là kill-switch khẩn cấp dùng khi Driver Plus gặp sự cố diện rộng. Song song đó, AC-32 quy định nếu outbound push thất bại tạm thời — ví dụ ngay sau khi Duyệt — `gf-system` sẽ giữ event trong outbox và tự động retry theo lịch chuẩn, không phụ thuộc trạng thái UI hiện tại.

### 3. Vấn đề cụ thể

`BR-DPL-CMN-008` mô tả hành vi flag `off` áp dụng cho hành động MỚI ("không phát... mới"), trong khi AC-32 mô tả cơ chế retry outbox cho các event ĐÃ được tạo trước đó khi outbound push thất bại. Không có AC hay BR nào nói rõ liệu `OutboxScheduler` có kiểm tra lại trạng thái feature flag tại mỗi lần retry hay không. Có 2 khả năng: outbox tiếp tục cố phát các event đã enqueue bất kể flag đang `off`, vì "off" chỉ chặn hành động MỚI (Khả năng A); hoặc outbox phải kiểm tra flag trước mỗi lần retry và tạm giữ event nếu flag đang `off`, chỉ phát lại khi flag bật (Khả năng B).

### 4. Ảnh hưởng nếu không giải quyết

- Đây chính là kịch bản mà kill-switch được thiết kế để xử lý — Driver Plus gặp sự cố diện rộng.
- Nếu chọn Khả năng A, kill-switch sẽ không đạt được mục đích "ngừng phát sinh tác động mới" một cách triệt để, vì vẫn còn 1 cửa sổ event đang chờ retry tiếp tục lọt ra ngoài.

### 5. Đề xuất giải quyết

Outbox scheduler nên kiểm tra trạng thái flag ngay trước khi publish mỗi lần retry, bỏ qua (giữ `PENDING`, không publish, không đánh dấu lỗi) nếu flag đang `off` (Khả năng B) — đây là đề xuất kỹ thuật hợp lý theo tinh thần "kill-switch toàn luồng" đã chốt ở AC-43, chưa có xác nhận cụ thể từ Architecture.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Nếu chọn để event outbound đang chờ retry bị giữ lại (không phát) khi flag chuyển off (Khả năng B, theo Đề xuất giải quyết), cần bổ sung logic kiểm tra flag vào OutboxScheduler.
- (b) Nếu chọn để event outbound đang chờ retry vẫn tiếp tục phát bình thường bất kể trạng thái flag (Khả năng A), kill-switch sẽ không chặn được hoàn toàn các event đã enqueue trước đó.

### 8. Owner

Backend Lead + Solution Architect (hành vi outbox khi tắt flag là quyết định kỹ thuật thuộc cơ chế event, cần Solution Architect xác nhận theo ADR-029)

### 9. Trạng thái

ĐANG MỞ

## RR-012 [Trung bình] Trạng thái — Khi tenant_profile chưa có dữ liệu (tenant cũ chưa backfill), Duyệt/Đồng bộ lại vẫn "thành công" với dữ liệu rỗng mà không cảnh báo

### 1. Trích dẫn nguồn

- **File**: [ADR-030](../../../requirements/gara/wave-07/Architecture/decisions/ADR-030-tenant-profile-sot-on-gf-system.md#L73) (Consequences, Gap 2); đối chiếu [FEAT-SYS-DRIVERPLUS-LINK.md AC-15](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L139-L142) và [AC-21](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L177-L180)
- **Section**: ADR-030 Consequences (Gap 2 — backfill tenant hiện hữu); AC-15 (Duyệt); AC-21 (Đồng bộ lại)
- **Dòng**: 73 (ADR-030 Gap 2); 139-142 (AC-15); 177-180 (AC-21)
- **Quote nguyên văn**:
> "Gap 2 — backfill tenant hiện hữu: tenant đã provisioning trước W07 không có row tenant_profile... Đọc phải null-safe: response trả field null, UI hiển thị rỗng — KHÔNG chặn Duyệt/Đồng bộ (không có AC nào yêu cầu bắt buộc đủ hồ sơ mới được Duyệt)." (ADR-030)

### 2. Bối cảnh nghiệp vụ

Bảng `tenant_profile` (V7) chỉ được seed tự động qua consumer `TenantProvisionedEvent` — cơ chế này chỉ chạy cho tenant provisioning MỚI sau khi V7 được deploy. Mọi garage được tạo trước thời điểm đó, tức toàn bộ tenant hiện hữu tại ngày go-live, sẽ có `tenant_profile` trống hoàn toàn cho tới khi có 1 đợt backfill riêng.

### 3. Vấn đề cụ thể

AC-15/AC-21 (Duyệt/Đồng bộ lại) không có điều kiện chặn hoặc cảnh báo khi khối dữ liệu chuẩn bị gửi sang Driver Plus trống rỗng, mọi field đều `NULL` — hệ thống vẫn coi đây là "thành công" và hiển thị toast thành công bình thường như mọi lần khác.

### 4. Ảnh hưởng nếu không giải quyết

- Một garage cũ (tạo trước W07, chưa được backfill) có thể Duyệt liên kết Driver+ "thành công" theo UI nhưng thực chất gửi sang D+ một bộ hồ sơ hoàn toàn rỗng — tên doanh nghiệp trống, SĐT trống, địa chỉ trống.
- Đây là hành vi trực tiếp đi ngược mục đích cốt lõi của tính năng (chia sẻ hồ sơ garage cho D+), mà không có bất kỳ tín hiệu nào báo cho người dùng biết họ cần cập nhật hồ sơ trước.
- Quan trọng hơn, đây là trạng thái dữ liệu sẽ tồn tại thật ngay từ ngày đầu go-live cho MỌI tenant tạo trước W07 — không phải một case hiếm gặp.

### 5. Đề xuất giải quyết

Cân nhắc 1 trong 2 hướng: (a) chạy backfill 1 lần cho toàn bộ tenant hiện hữu trước khi go-live (đã được chính ADR-030 gợi ý như một lựa chọn), hoặc (b) bổ sung cảnh báo UI khi khối dữ liệu đồng bộ rỗng/thiếu trường quan trọng lúc Duyệt. Cả 2 đều là đề xuất, chưa có quyết định từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Nếu chạy backfill dữ liệu `tenant_profile` 1 lần cho toàn bộ tenant hiện hữu trước khi go-live, gap này sẽ được xử lý tận gốc trước khi feature ra mắt.
- (b) Nếu không backfill nhưng bổ sung cảnh báo UI khi hồ sơ garage rỗng lúc Duyệt/Đồng bộ lại, người dùng ít nhất sẽ được thông báo trước khi gửi dữ liệu rỗng.
- (c) Nếu chấp nhận hiện trạng (không backfill, không cảnh báo), garage sẽ tự phát hiện vấn đề khi họ kiểm tra dữ liệu bên phía Driver Plus.

### 8. Owner

Business Authority + Backend Lead (Business Authority quyết định có nên chặn/cảnh báo hành động khi dữ liệu chưa backfill, Backend Lead hiện thực hoá)

### 9. Trạng thái

ĐANG MỞ

## RR-013 [Cao] Bảo mật — "Lý do" trong 2 inbound event WITHDRAW/UNLINK do Driver Plus gửi không giới hạn độ dài/sanitize trước khi hiển thị UI nội bộ GMS

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L256) (AC-33, D+ withdraw) và [AC-35](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L275) (D+ unlink); [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L483-L490) (bảng payload WITHDRAW/UNLINK)
- **Section**: Nhóm J (AC-33 D+ withdraw), Nhóm L (AC-35 D+ unlink); Architecture bảng field `reason`
- **Dòng**: 256 (AC-33); 275 (AC-35); 483-490 (payload WITHDRAW/UNLINK)
- **Quote nguyên văn**:
> "reason | String | ⛔ optional" (gf-system-events.md, bảng payload WITHDRAW/UNLINK — không có cột Constraint/maxLength)

### 2. Bối cảnh nghiệp vụ

Khác với "Lý do" do chính garage tự nhập khi Từ chối/Hủy — đã bị chặn cứng 2.000 ký tự + `ERR-DPL-012` (xem RR-002) — 2 event WITHDRAW (D+ tự rút yêu cầu) và UNLINK (D+ tự hủy liên kết) mang theo trường `reason` do Driver Plus, một hệ thống ngoài mà GMS không kiểm soát được, tự sinh ra và gửi kèm. Trường này được lưu thẳng và hiển thị nguyên văn trên UI nội bộ GMS (section "THÔNG TIN XỬ LÝ") cho nhân viên garage xem.

### 3. Vấn đề cụ thể

Rà lại AC-33, AC-35 và bảng payload Kafka thì không có bất kỳ đặc tả nào về giới hạn độ dài hoặc quy tắc sanitize cho trường `reason` này trước khi ghi vào DB và hiển thị lại trên UI Web/Mobile GMS. Đây là chiều dữ liệu ngược lại so với RR-002 — RR-002 nói về Lý do garage nhập gửi RA NGOÀI cho D+, còn gap này nói về Lý do D+ gửi VÀO nội bộ GMS.

### 4. Ảnh hưởng nếu không giải quyết

- Hệ thống hở rủi ro XSS lưu trữ (stored XSS) từ nguồn hoàn toàn ngoài hệ thống (đối tác Driver Plus) vào UI quản trị nội bộ GMS — bề mặt tấn công còn nghiêm trọng hơn field do chính người dùng nội bộ nhập, vì GMS không kiểm soát được input của Driver Plus.
- Không có cơ chế nào chặn payload cực lớn từ phía đối tác, tạo nguy cơ DoS nhẹ vào storage.
- Vì luồng dữ liệu này chưa có đặc tả, đội QA không suy ra được test case nào cho nó.

### 5. Đề xuất giải quyết

Áp dụng cùng nguyên tắc output encoding tại điểm render + giới hạn độ dài hợp lý (tương tự RR-002) cho trường `reason` nhận từ D+ trước khi lưu/hiển thị — đây là đề xuất theo best practice, chưa có xác nhận từ Business Authority/Architecture.

### 6. Liên kết với các phát hiện khác

Cùng nhóm bảo mật free-text với RR-002 (chiều garage→D+) và RR-022 (escaping khi nội suy tên vào notification.message).

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung giới hạn độ dài + yêu cầu output encoding cho trường `reason` nhận từ Driver Plus trước khi hiển thị UI nội bộ, cần thêm bước xử lý ở adapter nhận event.
- (b) Nếu xác nhận đã có cơ chế chung ở tầng framework/FE bao phủ mọi dữ liệu external, không cần đặc tả riêng cho trường này.
- (c) Nếu cần điều tra thêm trước khi quyết định, nên xác định rõ cơ chế hiện tại (nếu có) đang xử lý field này ra sao.

### 8. Owner

Security Lead + Backend Lead (cùng nhóm quyết định với RR-002, chiều dữ liệu ngược lại — input từ đối tác ngoài vào nội bộ)

### 9. Trạng thái

ĐANG MỞ

## RR-014 [Cao] Thiếu phủ — Không có ack/response nào cho 2 inbound event WITHDRAW/UNLINK, khác nguyên tắc correlated-response mà ADR-029 áp dụng cho luồng CREATE

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L46-L64) §2.1-§2.2; [ADR-029-driver-plus-kafka-adapter-on-gf-system.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md#L63-L67)
- **Section**: §2.1 (chỉ `PartnerLinkRequestResponse` ứng với `PARTNER_LINK.REQUEST.CREATE`); §2.2 dòng 63-64 (row WITHDRAW/UNLINK, cột "Kết quả" trống); ADR-029 bảng "Luồng inbound | Step phản hồi"
- **Dòng**: 46-48; 63-64; 63-67 (ADR-029)
- **Quote nguyên văn**:
> Bảng "Luồng inbound | Step phản hồi" của ADR-029 chỉ liệt 3 dòng: Partner link tạo yêu cầu / Booking tạo lịch / Booking hủy — không có dòng cho WITHDRAW hay UNLINK.

### 2. Bối cảnh nghiệp vụ

ADR-029 chọn mô hình "correlated response event" qua Kafka (không dùng HTTP đồng bộ) làm nguyên tắc kiến trúc chung cho toàn bộ tích hợp Driver Plus. Nguyên tắc này được áp dụng đầy đủ cho luồng CREATE (partner link request), nhưng WITHDRAW và UNLINK — 2 hành động mà Driver Plus chủ động gửi trên 1 record đã tồn tại — hoàn toàn không có response event tương ứng.

### 3. Vấn đề cụ thể

Giả sử Driver Plus gửi WITHDRAW đúng lúc garage user vừa Duyệt request đó — 1 tình huống race điều kiện — GMS chỉ "bỏ qua + log warning" nội bộ theo nhánh 2 của AC-33/AC-35. Nhưng Driver Plus lại không nhận được bất kỳ tín hiệu nào để biết yêu cầu hủy/rút của họ đã bị bỏ qua thay vì được áp dụng.

### 4. Ảnh hưởng nếu không giải quyết

- Driver Plus và GMS có thể lệch trạng thái vĩnh viễn mà không bên nào có cơ chế phát hiện để reconcile — D+ tưởng đã hủy thành công, trong khi GMS vẫn ghi nhận LINKED.
- Khi đối tác báo cáo "tôi đã hủy nhưng garage vẫn thấy liên kết đang hoạt động", đội vận hành sẽ không debug/trace được vì thiếu dữ liệu phản hồi.
- Đội QA không thể viết test case xác định cho kịch bản race Duyệt-vs-Withdraw, vì không rõ Driver Plus có nhận được phản hồi gì hay không.

### 5. Đề xuất giải quyết

Bổ sung 1 response event (tương tự `PartnerLinkRequestResponse`) cho cả WITHDRAW và UNLINK, báo rõ kết quả "đã áp dụng" hay "bị bỏ qua vì race điều kiện X" — đây là đề xuất theo tinh thần nhất quán kiến trúc đã có ở ADR-029, chưa có xác nhận từ Architecture.

### 6. Liên kết với các phát hiện khác

Liên quan tới RR-017 (kill-switch với 2 event này) — cả 2 đều là gap về đặc tả không đầy đủ cho nhánh inbound WITHDRAW/UNLINK.

### 7. Câu hỏi cho người dùng

- (a) Nếu bổ sung response event correlated cho WITHDRAW/UNLINK theo Đề xuất giải quyết, cần thiết kế thêm 2 event mới và phối hợp phía Driver Plus để họ tiêu thụ được.
- (b) Nếu chấp nhận fire-and-forget cho 2 luồng này, Driver Plus sẽ tự chịu trách nhiệm đối soát định kỳ ngoài phạm vi W07.
- (c) Nếu cần Architecture xác nhận trước khi quyết định, nên tham chiếu lại nguyên tắc đã chốt ở ADR-029.

### 8. Owner

Solution Architect (vì liên quan trực tiếp tới nguyên tắc kiến trúc correlated-response đã chốt ở ADR-029, cần người sở hữu ADR xác nhận có áp dụng cho 2 event này không)

### 9. Trạng thái

ĐANG MỞ

## RR-015 [Cao] Mơ hồ — Mã lỗi `ERR-DPL-003` được đăng ký ở BR-GF-SYSTEM.md nhưng không tồn tại trong API contract `gf-system-api.md`

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L312) (VLD-DPL-003); [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L493) (chính sách mã lỗi) và [dòng 729](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L729) (bảng lỗi endpoint approve)
- **Section**: BR-GF-SYSTEM §5.5 Validation Rules (VLD-DPL-003); gf-system-api.md chính sách "mã nghiệp vụ dùng trực tiếp ERR-DPL-*" + bảng lỗi endpoint `POST /approve`
- **Dòng**: 312 (VLD-DPL-003); 493 (chính sách mã lỗi); 729 (bảng lỗi approve)
- **Quote nguyên văn**:
> "VLD-DPL-003 | Checkbox điều khoản chưa tick khi bấm 'Đồng ý liên kết' | Button disabled, không cần toast; hint 'Vui lòng cuộn xuống cuối để tiếp tục' nếu chưa scroll | `ERR-DPL-003` | FEAT-SYS-DRIVERPLUS-LINK — Duyệt" (BR-GF-SYSTEM.md dòng 312)
>
> "GMS.gf-system.PARTNER_LINK.VAL_400 | 400 | termsAccepted ≠ true hoặc requestCode sai pattern" (gf-system-api.md dòng 729, endpoint approve)

### 2. Bối cảnh nghiệp vụ

`gf-system-api.md` tự công bố 1 chính sách rõ ràng: "mã nghiệp vụ dùng trực tiếp `ERR-DPL-*`, mã hạ tầng giữ pattern `GMS.gf-system.*`". Vi phạm consent (`termsAccepted ≠ true`) là 1 business rule (`VLD-DPL-003`/`BR-DPL-APV-002`), nên đúng ra phải trả mã nghiệp vụ `ERR-DPL-003` theo chính registry của BR.

### 3. Vấn đề cụ thể

Đã verify bằng grep: chuỗi `ERR-DPL-003` không xuất hiện ở bất kỳ đâu trong toàn bộ `gf-system-api.md`. Endpoint `POST /approve` thực tế lại trả mã hạ tầng generic `VAL_400` cho vi phạm `termsAccepted` — trái với chính chính sách self-declare "mã nghiệp vụ dùng ERR-DPL-*" mà tài liệu API này đặt ra cho chính nó.

### 4. Ảnh hưởng nếu không giải quyết

- FE/Mobile không thể bind đúng message theo registry BR — dev buộc phải hoặc hardcode, hoặc dùng nhầm message generic không mô tả đúng lỗi consent.
- Test case viết theo BR (kỳ vọng `ERR-DPL-003`) sẽ assert sai mã lỗi so với API response thực tế (`VAL_400`), gây false negative.
- Đây là vi phạm trực tiếp chính nguyên tắc "Hợp đồng BE/FE" mà tài liệu API tự đặt ra cho mình.

### 5. Đề xuất giải quyết

Đồng bộ lại: hoặc API đổi response consent-violation từ `VAL_400` sang `ERR-DPL-003` cho đúng registry BR, hoặc BR-GF-SYSTEM.md cập nhật lại `VLD-DPL-003` để dùng đúng mã hạ tầng đang chạy thực tế — đây là quyết định cần Architecture xác nhận nguồn nào là sự thật, agent không tự chọn thay.

### 6. Liên kết với các phát hiện khác

Cùng pattern nhất quán chéo nguồn với RR-029 (`ERR-BOOK-001/002` không có trong registry) — cả 2 đều là lỗi đồng bộ giữa registry mã lỗi và API contract thực tế.

### 7. Câu hỏi cho người dùng

- (a) Nếu cập nhật API để trả đúng `ERR-DPL-003` theo registry BR đã đăng ký, cần đổi response code ở endpoint approve.
- (b) Nếu cập nhật BR để khớp với `VAL_400` đang chạy thực tế trên API, không cần đổi code, chỉ cần sửa tài liệu.
- (c) Nếu cần kiểm tra hành vi thực tế production trước khi quyết định, nên xác nhận log/response thật trước khi chọn phương án.

### 8. Owner

Backend Lead + Business Authority (đồng bộ lại giữa business rule đã đăng ký và API contract thật là trách nhiệm của Backend Lead, Business Authority xác nhận mã lỗi nào là đúng)

### 9. Trạng thái

ĐANG MỞ

## RR-016 [Trung bình] Thiếu phủ — `{Tên garage}` trong wording notification outbound có thể `NULL` (tenant cũ chưa backfill) nhưng không có fallback wording

### 1. Trích dẫn nguồn

- **File**: [ADR-030-tenant-profile-sot-on-gf-system.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-030-tenant-profile-sot-on-gf-system.md#L73-L74) (Gap 2); [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L288) (AC-36 wording); [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L583-L612) (`notification.message` render sẵn)
- **Section**: ADR-030 Consequences Gap 2; AC-36 (wording notification); payload ví dụ notification
- **Dòng**: 73-74; 288; 583-612
- **Quote nguyên văn**:
> "tenant đã provisioning trước W07 không có row tenant_profile... Đọc phải null-safe: response trả field null, UI hiển thị rỗng" (ADR-030 Gap 2)

### 2. Bối cảnh nghiệp vụ

`{Tên garage}` xuất hiện trong 4 wording notification outbound (AC-36..39), được lấy từ cột `tenant_profile.business_name` — 1 cột `NULL`-able, trống với mọi tenant tạo trước W07 chưa được backfill. Đây chính là gap đã tự nhận ở ADR-030, liên quan trực tiếp tới RR-012.

### 3. Vấn đề cụ thể

Không tài liệu nào mô tả giá trị fallback khi `business_name = NULL` lúc render `notification.message` gửi RA NGOÀI cho đối tác Driver Plus. Điểm khác biệt so với RR-012 là: RR-012 nói về cảnh báo UI nội bộ khi Duyệt, còn gap này nói riêng về chất lượng wording gửi ra bên ngoài cho đối tác.

### 4. Ảnh hưởng nếu không giải quyết

- Đối tác ngoài (Driver Plus) có thể nhận thông báo lỗi định dạng kiểu "...tới garage . đã được duyệt..." (rỗng) hoặc "tới garage null...", gây mất chuyên nghiệp và có thể tạo confusion nghiệp vụ phía đối tác.
- Vì luồng notification wording chưa được đặc tả cho case này, không có test case nào phủ được tình huống tenant cũ chưa backfill.

### 5. Đề xuất giải quyết

Định nghĩa 1 giá trị fallback rõ ràng (VD dùng `tenant_id` hoặc chuỗi "garage của chúng tôi") khi `business_name` rỗng lúc render notification — đề xuất, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Cùng gốc dữ liệu với RR-012 (tenant_profile rỗng do chưa backfill).

### 7. Câu hỏi cho người dùng

- (a) Nếu định nghĩa fallback wording cụ thể khi `{Tên garage}` rỗng, notification gửi ra ngoài sẽ luôn hợp lệ về mặt câu chữ ngay cả với tenant chưa backfill.
- (b) Nếu chặn gửi notification hoàn toàn cho tới khi có backfill, quyết định này cần bundle chung với quyết định ở RR-012.

### 8. Owner

Business Authority + Product Designer (nội dung wording thay thế khi thiếu dữ liệu là quyết định nghiệp vụ + UX)

### 9. Trạng thái

ĐANG MỞ

## RR-017 [Trung bình] Trạng thái — Hành vi kill-switch chưa đặc tả cho 2 inbound event WITHDRAW/UNLINK

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L99) (BR-DPL-CMN-008); [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L495)
- **Section**: BR-DPL-CMN-008 (kill-switch toàn luồng, liệt 5 mục a-e); gf-system-api.md "Flag off → 6 endpoint trả 403"
- **Dòng**: 99; 495
- **Quote nguyên văn**:
> "Flag off → toàn bộ 6 endpoint trả 403" (gf-system-api.md — chỉ 6 REST endpoint, không đề cập Kafka consumer)

### 2. Bối cảnh nghiệp vụ

BR-DPL-CMN-008 liệt kê rõ 5 hành vi khi flag `off`: ẩn UI, chặn 6 API GMS, chặn request tạo mới (`ERR-DPL-011`), không phát outbound, giữ nguyên dữ liệu — nhưng không có mục nào nói về việc GMS nhận WITHDRAW/UNLINK từ Driver Plus khi flag đang tắt.

### 3. Vấn đề cụ thể

WITHDRAW/UNLINK là hành động Driver Plus chủ động gửi trên 1 record đã tồn tại, độc lập với việc UI GMS có bị ẩn hay 6 endpoint có bị 403 hay không. Không rõ GMS sẽ tiếp tục xử lý — tức đổi state ngầm dù toàn bộ tính năng đang "tắt" — hay bỏ qua hoàn toàn (và khi đó Driver Plus không có ack để biết, xem RR-014).

### 4. Ảnh hưởng nếu không giải quyết

- Khi bật lại flag, dữ liệu có thể đã lệch âm thầm — state đổi trong lúc kill-switch đang bật — mà không ai kiểm soát được.
- Ngược lại, các event WITHDRAW/UNLINK hợp lệ có thể bị mất vĩnh viễn, không có retry, trong suốt khoảng thời gian kill-switch bật.

### 5. Đề xuất giải quyết

Bổ sung rõ mục (f) vào BR-DPL-CMN-008: WITHDRAW/UNLINK inbound khi flag off vẫn được xử lý bình thường (vì đây là dọn dẹp trạng thái, không phải mở rộng tác động mới) hoặc bị giữ trong inbox chờ flag bật lại — đề xuất, chưa có xác nhận từ Architecture.

### 6. Liên kết với các phát hiện khác

Liên quan RR-014 (thiếu ack cho WITHDRAW/UNLINK) và RR-011 đã có (outbox trước khi flag off).

### 7. Câu hỏi cho người dùng

- (a) Nếu chọn để WITHDRAW/UNLINK vẫn được xử lý bình thường khi flag off (không thuộc phạm vi kill-switch vì là dọn dẹp trạng thái), cần ghi rõ ngoại lệ này vào BR-DPL-CMN-008.
- (b) Nếu chọn để WITHDRAW/UNLINK bị giữ/bỏ qua khi flag off giống các luồng khác, cần đảm bảo có cơ chế lưu/retry để không mất event khi flag bật lại.
- (c) Nếu cần Architecture quyết định, nên xử lý cùng lúc với RR-011 và RR-014 vì cùng liên quan tới hành vi kill-switch/outbox.

### 8. Owner

Solution Architect + Business Authority (hành vi kill-switch là cơ chế vận hành/kiến trúc, cần Solution Architect xác nhận có áp dụng đồng nhất)

### 9. Trạng thái

ĐANG MỞ

## RR-018 [Trung bình] Biên — Payload inbound (`requestCode`, `partnerAccountName`) không có đặc tả hành vi khi vượt độ dài cột DB tại adapter gate

### 1. Trích dẫn nguồn

- **File**: [gf-system-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-system-data-model.md#L348-L351) (`request_code VARCHAR(20)`, `partner_account_name VARCHAR(255)`); [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L605) (`requestCode` pattern `^LKD-\d{4}-\d{3,}$`)
- **Section**: Data model bảng cột `partner_link_request`; API pattern `requestCode`
- **Dòng**: 348-351; 605
- **Quote nguyên văn**:
> "request_code VARCHAR(20) NOT NULL... partner_account_name VARCHAR(255) NOT NULL" (gf-system-data-model.md)

### 2. Bối cảnh nghiệp vụ

Khi nhân viên GMS mở màn tra cứu và gõ trực tiếp 1 request code vào URL (REST path param), hệ thống kiểm tra định dạng bằng regex `^LKD-\d{4}-\d{3,}$` trước khi xử lý — đây là bước validate thủ công, chỉ áp dụng cho luồng người dùng điều hướng tay. Nhưng khi Driver Plus gửi 1 message Kafka để tạo `partner_link_request` mới, luồng consumer ghi thẳng `requestCode`/`partnerAccountName` từ payload vào 2 cột DB `VARCHAR(20)`/`VARCHAR(255)` mà không đi qua regex đó. Vấn đề nằm ở chính cú pháp regex: `\d{3,}` chỉ quy định tối thiểu 3 chữ số, không có giới hạn trên — nghĩa là Driver Plus hoàn toàn có thể gửi 1 `requestCode` hợp lệ theo regex nhưng dài hơn 20 ký tự khi ghi xuống cột DB.

### 3. Vấn đề cụ thể

Không tài liệu nào trong bộ hồ sơ nói rõ: khi `requestCode` vượt 20 ký tự hoặc `partnerAccountName` vượt 255 ký tự lọt tới adapter validation gate, hệ thống sẽ từ chối có kiểm soát (giống cách xử lý thiếu trường bắt buộc) hay để lỗi INSERT xuống DB xảy ra không kiểm soát.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu không có validate riêng, consumer có thể crash hoặc throw exception ngay khi nhận 1 payload vượt giới hạn cột DB — và vì không có DLQ (dead-letter queue) riêng cho trường hợp này, sự cố có nguy cơ kéo theo cả pipeline xử lý message Kafka bị nghẽn.
- Vì hành vi mong đợi chưa được định nghĩa, không ai viết được test case phủ đúng cho boundary case này.

### 5. Đề xuất giải quyết

Bổ sung validate độ dài tường minh tại adapter gate cho mọi field string trước khi ghi domain, reject có kiểm soát bằng 1 mã lỗi riêng (`ERR-DPL-0xx`) nếu vượt giới hạn — đây là đề xuất theo best practice, chưa có căn cứ xác nhận.

### 6. Liên kết với các phát hiện khác

Cùng nhóm validate payload inbound với RR-009 (đã có, "Ngày hẹn") và RR-038 (`vehicleImages`).

### 7. Câu hỏi cho người dùng

- (a) Bổ sung validate độ dài tường minh kèm mã lỗi reject riêng cho từng field payload inbound, đảm bảo consumer không bao giờ crash vì dữ liệu vượt cột DB.
- (b) Chấp nhận rủi ro hiện tại, để DB constraint tự chặn và throw exception không kiểm soát khi gặp payload vượt giới hạn.

### 8. Owner

Backend Lead (đây là quyết định kỹ thuật thuần về validate/truncate tại adapter gate, không cần Business Authority)

### 9. Trạng thái

ĐANG MỞ

## RR-019 [Trung bình] Thiếu phủ — Hành vi khi Driver Plus gửi lại cùng `request_code` nhưng nội dung khác (không phải retry thuần) chưa được đặc tả

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L395) (EC-4); [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L500) (idempotency); [gf-system-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-system-data-model.md#L365) (unique index)
- **Section**: EC-4 (idempotency retry); Idempotency lớp 2 unique `(tenant_id, request_code)`
- **Dòng**: 395; 500; 365
- **Quote nguyên văn**:
> "Driver Plus push cùng 1 request LKD-xxx nhiều lần (retry idempotency) → hệ thống dedup theo mã LKD, không tạo record trùng" (EC-4)

### 2. Bối cảnh nghiệp vụ

EC-4 mô tả 1 tình huống quen thuộc: do lỗi mạng hoặc timeout, Driver Plus gửi lại đúng 1 request `LKD-xxx` nhiều lần, và hệ thống dedupe dựa trên unique index `(tenant_id, request_code)` để không tạo record trùng — cơ chế này hoạt động tốt với giả định retry luôn mang y nguyên nội dung ban đầu. Nhưng giả định đó không phải lúc nào cũng đúng: nếu do lỗi phía Driver Plus, hoặc do họ tái sử dụng nhầm mã `request_code` cho 1 lần push khác, request thứ 2 mang cùng mã nhưng nội dung field (VD `partnerAccountName`, `partnerAccountPhone`) lại khác bản đầu.

### 3. Vấn đề cụ thể

Trong tình huống đó, INSERT thứ 2 vẫn bị chặn bởi cùng unique index dù nội dung đã khác — nhưng không tài liệu nào trả lời được: hệ thống sẽ UPDATE lại các field mới để phản ánh đúng thông tin mới nhất từ Driver Plus, hay âm thầm bỏ qua và giữ nguyên dữ liệu cũ (lúc này đã lỗi thời so với phía đối tác)?

### 4. Ảnh hưởng nếu không giải quyết

- Nếu hệ thống chọn giữ bản ghi cũ mà không cảnh báo gì, dữ liệu hiển thị cho garage (tên/SĐT tài khoản Driver Plus) có thể sai lệch so với thực tế phía đối tác mà không ai biết để kiểm tra lại.
- Không thể viết được 1 test case xác định cho kịch bản "gửi lại cùng mã, nội dung khác" vì hành vi mong đợi chưa rõ ràng.

### 5. Đề xuất giải quyết

Làm rõ lại EC-4: nếu nội dung request thứ 2 khác bản ghi cũ, hệ thống log cảnh báo mismatch và giữ nguyên bản ghi đầu tiên (áp dụng nguyên tắc source-of-truth theo thứ tự đến trước) — đây là đề xuất, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Giữ nguyên bản ghi đầu tiên và chỉ log cảnh báo mismatch khi nội dung request thứ 2 khác bản đầu, không thay đổi dữ liệu đã lưu.
- (b) Cho phép UPDATE lại field mới nếu request thứ 2 đến trong 1 khung thời gian ngắn kể từ bản đầu (VD dưới 5 phút), coi đây là bản cập nhật hợp lệ chứ không phải trùng lặp.
- (c) Cần Business Authority quyết định phương án nào phù hợp trước khi triển khai.

### 8. Owner

Business Authority + Backend Lead (Business Authority xác nhận đây có phải tình huống hợp lệ về nghiệp vụ, Backend Lead thiết kế cơ chế xử lý)

### 9. Trạng thái

ĐANG MỞ

## RR-020 [Trung bình] Mơ hồ — Retention "vĩnh viễn" (BR-DPL-CMN-006) bị vô hiệu hoá thực tế do giới hạn 500-row + không tìm kiếm/phân trang

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L97) (BR-DPL-CMN-006) và [dòng 108](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L108) (BR-DPL-LST-004); [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L517)
- **Section**: BR-DPL-CMN-006 (retention vĩnh viễn); BR-DPL-LST-004 (không phân trang/tìm kiếm); cap 500 row
- **Dòng**: 97; 108; 517
- **Quote nguyên văn**:
> "giữ VĨNH VIỄN... Phục vụ tra cứu lịch sử + kiểm toán không giới hạn thời gian" (BR-DPL-CMN-006)

### 2. Bối cảnh nghiệp vụ

BR-DPL-CMN-006 cam kết rất rõ ràng: mọi record ở trạng thái terminal (REJECTED/UNLINKED) được giữ VĨNH VIỄN, mục đích là phục vụ tra cứu lịch sử và kiểm toán không giới hạn thời gian. Nhưng BR-DPL-LST-004 lại quy định UI danh sách không có search, không có pagination, không có filter theo khoảng ngày — chỉ hiển thị đúng 500 row mới nhất. Đây là gap khác với RR-006 (RR-006 nói về việc thiếu AC mô tả UI khi `truncated=true`) — gap này nói thẳng về mâu thuẫn logic giữa 2 rule.

### 3. Vấn đề cụ thể

Hệ quả là bất kỳ record nào cũ hơn top-500 — dù vẫn tồn tại nguyên vẹn trong DB đúng như cam kết retention — sẽ vĩnh viễn không truy vấn lại được qua bất kỳ giao diện nào hiện có. Điều này đi ngược lại chính mục đích "phục vụ kiểm toán" mà BR-DPL-CMN-006 đặt ra.

### 4. Ảnh hưởng nếu không giải quyết

- Khi garage hoạt động nhiều năm, đổi tài khoản Driver Plus nhiều lần, và cần audit/kiểm toán lịch sử lâu dài, dữ liệu vẫn nằm trong DB nhưng không ai truy xuất được qua UI — làm vô hiệu hóa giá trị thực tế của rule retention.
- Nếu có yêu cầu pháp lý cần truy xuất lịch sử cũ, hệ thống không có kênh nào hỗ trợ, tạo ra rủi ro compliance thật sự.

### 5. Đề xuất giải quyết

Bổ sung 1 kênh truy xuất riêng cho dữ liệu lịch sử vượt 500-row, tách biệt khỏi UI vận hành hàng ngày — ví dụ tính năng export/báo cáo, hoặc filter theo khoảng ngày dành riêng cho mục đích audit — đây là đề xuất, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Liên quan RR-006 (đã có, cùng gốc cap 500-row).

### 7. Câu hỏi cho người dùng

- (a) Bổ sung 1 kênh tra cứu/export riêng phục vụ mục đích kiểm toán, không bị giới hạn 500-row như UI vận hành hiện tại.
- (b) Hạ thấp cam kết retention xuống mức "giữ dữ liệu trong DB nhưng không đảm bảo truy xuất qua UI sau ngưỡng 500-row", đồng thời cập nhật lại wording của BR-DPL-CMN-006 cho khớp thực tế.

### 8. Owner

Business Authority + Product Designer (mâu thuẫn giữa cam kết retention và giới hạn UI thực tế cần Business Authority quyết định ưu tiên bên nào)

### 9. Trạng thái

ĐANG MỞ

## RR-021 [Trung bình] Mơ hồ — Cột `version` (optimistic lock, data model) mô tả cơ chế concurrency khác với cơ chế "conditional UPDATE" mô tả ở API contract

### 1. Trích dẫn nguồn

- **File**: [gf-system-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-system-data-model.md#L357) (cột `version`); [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L494) và [dòng 737-738](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L737-L738)
- **Section**: Data model bảng cột `partner_link_request` (`version`); API mô tả cơ chế "state-guarded UPDATE"
- **Dòng**: 357; 494; 737-738
- **Quote nguyên văn**:
> "version | BIGINT | NO | Optimistic lock (@Version) — phát hiện race 2 user cùng thao tác 1 record → ERR-DPL-004 | FEAT AC-27" (data model)
>
> "state-guarded — UPDATE … WHERE status='PENDING'; rowsAffected=0 → 409" (api.md — không nhắc `version` ở bất kỳ request/response nào)

### 2. Bối cảnh nghiệp vụ

Cả 2 tài liệu cùng nhắm tới 1 mục đích giống hệt nhau: phát hiện khi 2 người dùng cùng thao tác trên 1 record (theo AC-27). Nhưng cách mô tả cơ chế lại hoàn toàn khác nhau. Data model khẳng định đây là optimistic lock qua cột `version` (kiểu JPA `@Version`) — khi 2 request cùng ghi 1 bản ghi, request đến sau sẽ nhận lỗi vì version không khớp. Trong khi đó, API contract — vốn là nguồn có thẩm quyền hơn cho hành vi runtime thực tế — lại mô tả 1 cơ chế khác hẳn: conditional UPDATE dạng `UPDATE ... WHERE status='PENDING'`, và trả về 409 nếu `rowsAffected=0`. Tài liệu API không hề nhắc tới cột `version` ở bất kỳ chỗ nào.

### 3. Vấn đề cụ thể

Đây là 2 nguồn mô tả 2 cơ chế kỹ thuật khác nhau cho cùng 1 mục đích, khiến không rõ cột `version` có thực sự được dùng trong runtime hay chỉ là 1 cột thừa/kế hoạch cũ chưa được đồng bộ lại với API contract mới.

### 4. Ảnh hưởng nếu không giải quyết

- Dev có thể hiểu nhầm và triển khai chồng chéo cả 2 lớp lock cùng lúc (tốn công sức không cần thiết), hoặc bỏ sót 1 lớp mà tài liệu khác đã ngỡ là có sẵn.
- Việc thiết kế đúng test case cho race condition cũng gặp khó vì không rõ cơ chế thật là gì — test cho optimistic-lock exception khác hoàn toàn test cho response 409 của conditional-update.

### 5. Đề xuất giải quyết

Xác nhận lại với Architecture cơ chế nào đang thực sự được triển khai — nhiều khả năng là conditional UPDATE theo API contract, vì đây là nguồn đã được review kỹ hơn ở ARCH-REVIEW-W07 — sau đó cập nhật lại data model cho khớp. Đây là suy luận, chưa phải là xác nhận chính thức.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Cơ chế thật đang chạy là conditional UPDATE (API contract mô tả đúng), cần xoá hoặc làm rõ lại mô tả cột `version` trong data model.
- (b) Cơ chế thật đang chạy là optimistic lock qua `version` (data model mô tả đúng), API contract chỉ đang thiếu mô tả chi tiết.
- (c) Cần kiểm tra lại code hiện tại (nếu đã có baseline liên quan) trước khi trả lời câu hỏi này.

### 8. Owner

Backend Lead + Solution Architect (mâu thuẫn giữa 2 tài liệu kỹ thuật cần người sở hữu kiến trúc dữ liệu xác nhận cơ chế đúng)

### 9. Trạng thái

ĐANG MỞ

## RR-022 [Trung bình] Bảo mật — Nội suy `{Tên}`/`{Tên garage}` vào `notification.message` (chuỗi JSON) không có quy tắc escaping

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L592-L612) (payload ví dụ `notification.message`)
- **Section**: Payload notification outbound (render sẵn, nội suy `partnerAccountName`/business name)
- **Dòng**: 592-612

### 2. Bối cảnh nghiệp vụ

`notification.message` là 1 field string nằm trong payload JSON mà GMS gửi ra cho Driver Plus. Nội dung field này được GMS render sẵn bằng cách nội suy các giá trị động — tên tài khoản Driver Plus (`{Tên}`) và tên garage (`{Tên garage}`) — vào 1 template wording đã được chốt chính thức (thuộc Nhóm M).

### 3. Vấn đề cụ thể

Nếu tên tài khoản Driver Plus hoặc tên garage chứa ký tự đặc biệt — dấu ngoặc kép `"`, backslash `\`, hoặc ký tự xuống dòng — chuỗi `notification.message` có nguy cơ vỡ định dạng JSON ngay khi Driver Plus parse. Nếu phía đối tác render trực tiếp nội dung này ra màn hình app của họ (VD hiển thị trong app D+) mà không tự escape lại, đây còn mở đường cho injection. Toàn bộ ADR-029 — tài liệu kiến trúc mô tả luồng này — không có đoạn nào nói tới escaping/encoding cho nội dung được nội suy vào message.

### 4. Ảnh hưởng nếu không giải quyết

- Có thể xảy ra lỗi parse phía đối tác mà GMS hoàn toàn không kiểm soát được, và lỗi này khó reproduce vì phụ thuộc vào dữ liệu input cụ thể (tên do chính Driver Plus tự đặt lúc đăng ký tài khoản).
- Có rủi ro nhẹ về injection nếu Driver Plus render trực tiếp `message` mà không tự escape ở phía họ.

### 5. Đề xuất giải quyết

Escape đúng chuẩn JSON string (backslash, dấu ngoặc kép, ký tự điều khiển) cho mọi giá trị động trước khi nội suy vào `notification.message` và serialize — đây là best practice tiêu chuẩn, chưa có xác nhận cụ thể từ Architecture.

### 6. Liên kết với các phát hiện khác

Cùng nhóm bảo mật free-text với RR-002 (đã có) và RR-013.

### 7. Câu hỏi cho người dùng

- (a) Xác nhận cần bổ sung escaping chuẩn JSON cho mọi giá trị được nội suy vào `notification.message` trước khi gửi đi.
- (b) Xác nhận cơ chế serialize hiện tại (VD dùng thư viện JSON chuẩn thay vì string-concat thủ công) đã tự động escape sẵn, không cần đặc tả thêm gì.

### 8. Owner

Security Lead + Backend Lead (quy tắc escaping cho chuỗi JSON là quyết định an toàn dữ liệu kỹ thuật)

### 9. Trạng thái

ĐANG MỞ

## RR-023 [Thấp] Mơ hồ — Hành vi "ghi nhớ filter trong phiên" khi reload trang (F5, không đăng xuất) chưa được định nghĩa

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L107) (BR-DPL-LST-003); [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L68) (AC-5)
- **Section**: BR-DPL-LST-003 (Persistence filter); AC-5
- **Dòng**: 107; 68
- **Quote nguyên văn**:
> "Persistence: ghi nhớ lựa chọn filter trong phiên (session)... thoát session (đăng xuất / đóng app) → filter về lại default." (BR-DPL-LST-003)

### 2. Bối cảnh nghiệp vụ

Cả 2 nguồn chỉ định nghĩa rõ ràng 2 trường hợp: trong phiên làm việc thì filter được giữ nguyên, còn khi đăng xuất hoặc đóng app thì filter reset về default. Vì API `GET /partner-links` chỉ nhận `statuses[]` theo từng request và không lưu filter phía server, việc "ghi nhớ" chắc chắn phải là state được lưu ở phía client.

### 3. Vấn đề cụ thể

Điều không được nói rõ là: khi user chỉ reload trình duyệt (F5) mà không đăng xuất, filter sẽ ra sao? F5 hoàn toàn có khả năng xóa mất state client-side nếu implementation dùng session storage kiểu in-memory, dù về mặt văn bản user chưa hề "thoát session" theo đúng nghĩa của rule.

### 4. Ảnh hưởng nếu không giải quyết

Các implementation khác nhau sẽ cho ra hành vi UI không nhất quán — bản dùng session storage sẽ giữ được filter qua F5, bản dùng in-memory sẽ mất — mà không ai có căn cứ để review đúng/sai vì spec không nói rõ.

### 5. Đề xuất giải quyết

Làm rõ tường minh: dùng `sessionStorage` (giữ được qua F5, chỉ mất khi đóng tab) làm cơ chế lưu filter — đây là đề xuất kỹ thuật hợp lý bám sát đúng nghĩa "session" trong rule, chưa có xác nhận chính thức.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Filter giữ nguyên qua thao tác F5, triển khai bằng `sessionStorage`.
- (b) Filter reset về default ngay sau F5, coi F5 tương đương với thoát phiên.

### 8. Owner

Product Designer + Frontend Lead (hành vi ghi nhớ trạng thái UI khi reload là quyết định UX thuần)

### 9. Trạng thái

ĐANG MỞ

## RR-024 [Thấp] Thiếu phủ — Không có cơ chế locale/i18n cho 4 wording notification outbound, hard-code tiếng Việt

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L144-L155) (§2.5.7, 4 wording cố định); [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L579-L620) (`notification` object)
- **Section**: §2.5.7 (wording notification); payload `notification { type, message }`
- **Dòng**: 144-155; 579-620
- **Quote nguyên văn**:
> "Wording tất cả 4 loại đã CHỐT chính thức... dùng đúng câu ghi trong mỗi rule." (BR-GF-SYSTEM.md §2.5.7)

### 2. Bối cảnh nghiệp vụ

Cả 4 loại wording notification mà GMS gửi sang Driver Plus đều được hard-code sẵn bằng tiếng Việt, đã chốt chính thức. Payload `notification` gửi đi chỉ có đúng 2 field: `type` và `message` — không có field `locale` nào để phân biệt ngôn ngữ.

### 3. Vấn đề cụ thể

Nếu trong tương lai Driver Plus cần hỗ trợ đa ngôn ngữ cho user quốc tế, thiết kế payload hiện tại không có sẵn đường mở rộng nào cho việc đó.

### 4. Ảnh hưởng nếu không giải quyết

Khả năng mở rộng quốc tế hóa về sau bị giới hạn; nếu sau này cần thêm hỗ trợ đa ngôn ngữ, việc thêm field mới vào envelope đã chốt sẽ là 1 breaking change.

### 5. Đề xuất giải quyết

Ghi nhận đây là nợ kỹ thuật có chủ đích cho phạm vi W07 (chỉ phục vụ thị trường Việt Nam) — không phải là 1 sai sót, chỉ cần xác nhận đây đúng là quyết định có ý thức chứ không phải bị bỏ sót.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Xác nhận việc hard-code tiếng Việt là quyết định có chủ đích trong phạm vi W07, không cần xử lý gì thêm ở giai đoạn này.
- (b) Cần ghi chú rõ trong tài liệu đây là 1 giới hạn đã biết, để các wave sau cân nhắc khi có yêu cầu mở rộng quốc tế.

### 8. Owner

Business Authority + Product Designer (quyết định có cần đa ngôn ngữ cho đối tác quốc tế hay không thuộc phạm vi nghiệp vụ)

### 9. Trạng thái

ĐANG MỞ

## RR-025 [Thấp] Biên — Cột `processed_by_label` (VARCHAR 255) không có rule truncate khi tên nhân viên dài, có thể cắt mất hậu tố role

### 1. Trích dẫn nguồn

- **File**: [gf-system-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-system-data-model.md#L355) (`processed_by_label`); [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L96) (BR-DPL-CMN-005)
- **Section**: Data model cột `processed_by_label`; BR-DPL-CMN-005 (format snapshot)
- **Dòng**: 355; 96
- **Quote nguyên văn**:
> "processed_by_label | VARCHAR(255) | YES | Snapshot text... {Tên nhân viên} ({Tên hiển thị role})" (data model)

### 2. Bối cảnh nghiệp vụ

Cột `processed_by_label` lưu 1 chuỗi snapshot ghép theo format `{Tên nhân viên} ({Tên hiển thị role})`, giới hạn 255 ký tự, dùng cho mục đích audit trail để biết ai đã xử lý 1 yêu cầu liên kết.

### 3. Vấn đề cụ thể

Tên nhân viên vốn không bị giới hạn ký tự ở những nơi khác trong hệ thống. Nếu tên đủ dài, phần hậu tố role phía sau có nguy cơ bị cắt mất một cách âm thầm khi toàn bộ chuỗi ghép vượt quá 255 ký tự — làm sai lệch dữ liệu audit mà không ai nhận ra.

### 4. Ảnh hưởng nếu không giải quyết

Audit trail có thể hiển thị sai hoặc thiếu thông tin role mà không có bất kỳ cảnh báo nào, ảnh hưởng tới tính chính xác của lịch sử xử lý — dù xác suất xảy ra thấp vì tên nhân viên hiếm khi dài tới mức gây tràn cột.

### 5. Đề xuất giải quyết

Bổ sung rule truncate có kiểm soát, ưu tiên giữ nguyên phần role và cắt bớt phần tên nếu cần, hoặc tăng độ dài cột nếu thấy cần thiết — đây là đề xuất kỹ thuật nhỏ, chưa có xác nhận.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Chấp nhận rủi ro thấp này, không cần xử lý thêm trong phạm vi W07.
- (b) Bổ sung rule truncate có kiểm soát để đảm bảo phần role luôn được giữ lại đầy đủ.

### 8. Owner

Backend Lead (quyết định kỹ thuật thuần về xử lý chuỗi vượt độ dài cột)

### 9. Trạng thái

ĐANG MỞ

## RR-026 [Thấp] UX — Hành vi cập nhật ngầm (không toast) khi mobile app bị kill/relaunch (khác backgrounded) chưa được đặc tả

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L224) (AC-27, mobile refresh) và [dòng 256](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L256) (AC-33)
- **Section**: AC-27 (race condition, mobile refresh khi đang mở); AC-33 (D+ withdraw, cập nhật ngầm)
- **Dòng**: 224; 256
- **Quote nguyên văn**:
> "Mobile: nếu đang ở màn danh sách → refresh card..., nếu đang ở màn chi tiết... → refresh nội dung màn đó." (AC-27)

### 2. Bối cảnh nghiệp vụ

AC-27, AC-33 và AC-35 chỉ mô tả hành vi khi app mobile đang mở và active ngay tại thời điểm event xảy ra — lúc đó app sẽ tự refresh card ở màn danh sách hoặc nội dung ở màn chi tiết. Nhóm M/N đã xác nhận các cập nhật ngầm này KHÔNG kèm toast, nghĩa là user hoàn toàn không có tín hiệu chủ động nào để biết mình cần refresh lại dữ liệu.

### 3. Vấn đề cụ thể

Không tài liệu nào nói rõ: khi user mở lại app sau khi app đã bị kill hoàn toàn (khác với chỉ backgrounded), app có tự động fetch lại danh sách mới nhất hay không, hay user phải tự pull-to-refresh thủ công mới thấy được state mới nhất.

### 4. Ảnh hưởng nếu không giải quyết

User mobile có thể thao tác dựa trên dữ liệu đã cũ (stale) — ví dụ cố "Đồng bộ lại" 1 liên kết mà thực ra Driver Plus đã hủy từ trước khi user mở app — và gặp lỗi 409 bất ngờ mà không hiểu vì sao.

### 5. Đề xuất giải quyết

Bổ sung 1 AC yêu cầu fetch lại danh sách/chi tiết mỗi khi app chuyển sang foreground từ trạng thái đã bị kill (theo lifecycle `onResume`/`didBecomeActive` sau cold start) — đây là đề xuất theo best practice mobile UX, chưa có xác nhận.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung AC yêu cầu fetch lại dữ liệu ngay khi app được mở lại từ trạng thái đã bị kill.
- (b) Chấp nhận hành vi hiện tại (chỉ refresh khi app đang active), để user tự pull-to-refresh nếu nghi ngờ dữ liệu đã cũ.

### 8. Owner

Product Designer + Mobile Lead (hành vi cập nhật ngầm không toast khi app bị kill là quyết định UX riêng cho mobile)

### 9. Trạng thái

ĐANG MỞ

## RR-027 [Cao] Mơ hồ — Payload `BookingCreateRequest` thực tế có 15 field (gồm `externalBookingId` bắt buộc) mâu thuẫn với câu chốt AC-2 "không có trường nào khác ngoài 14 trường"

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L48) (AC-2); [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L436-L457) (JSON mẫu + bảng field)
- **Section**: AC-2 (cấu trúc 14 trường); payload mẫu `BookingCreateRequest` + bảng field #0-13
- **Dòng**: 48 (AC-2); 436-453 (JSON mẫu, 15 key); 457 (bảng, field #0 `externalBookingId`)
- **Quote nguyên văn**:
> "Không có trường nào khác ngoài 14 trường này (không có 3 trường consent — Driver+ tự lưu, xem BR-BOOK-025)." (AC-2)
>
> "0 | externalBookingId | String | ✅ (bắt buộc) | Không rỗng; dùng làm OriginMessageCode | booking.lead_id | §3.8 baseline (field production sẵn có)" (gf-sales-events.md, bảng field)

### 2. Bối cảnh nghiệp vụ

Product định nghĩa "Loại dịch vụ" cùng 13 field khác tạo thành 1 bộ 14 trường — gồm 5 bắt buộc và 9 tùy chọn — mà AC-2 khẳng định là toàn bộ nội dung payload, không có trường nào khác. Nhưng khi đối chiếu với Architecture, JSON mẫu thực tế của `BookingCreateRequest` lại có tới 15 key, và bảng field liệt kê `externalBookingId` là field số 0 — bắt buộc, dùng làm `OriginMessageCode`, tức là cơ chế định danh message quan trọng phục vụ correlation và dedupe.

### 3. Vấn đề cụ thể

AC-2 khẳng định tuyệt đối "không có trường nào khác ngoài 14 trường" và hoàn toàn không nhắc tới `externalBookingId`, dù đây là field bắt buộc và giữ vai trò kỹ thuật quan trọng làm định danh correlation. Đây là 1 mâu thuẫn trực tiếp về đúng 1 con số cụ thể — 14 so với 15 — giữa 1 câu văn đã được đánh dấu RESOLVED trong Product và bằng chứng payload thật nằm trong Architecture.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu DEV tin theo Product "chỉ 14 trường" và strip `externalBookingId` khỏi validation, hệ thống sẽ mất khả năng correlate response/dedupe — ảnh hưởng trực tiếp tới cơ chế AC-9 dedupe theo `event_id` và các cơ chế correlation khác đang dùng `externalBookingId`.
- Test case viết đúng theo Product AC-2 sẽ assert sai số lượng field, gây false negative khi review.
- QA/BA không biết dựa vào tài liệu nào làm nguồn sự thật khi 2 tài liệu mâu thuẫn nhau về đúng 1 con số cụ thể.

### 5. Đề xuất giải quyết

Cập nhật AC-2 để liệt `externalBookingId` là field số 0 bắt buộc, tổng cộng 15 field thay vì 14, đồng thời giữ nguyên cách phân loại 5+9 cho phần nội dung nghiệp vụ — đây là đề xuất dựa trên bằng chứng payload thật, chưa có xác nhận chính thức từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Cập nhật AC-2 thành 15 field, bổ sung `externalBookingId` như 1 field kỹ thuật bắt buộc, tách biệt khỏi 14 field nghiệp vụ.
- (b) Xác nhận `externalBookingId` thuộc tầng transport/envelope, không tính vào "payload nghiệp vụ" 14 trường mà AC-2 mô tả — chỉ cần ghi chú rõ điều này trong tài liệu.
- (c) Cần Business Authority xác nhận trước khi quyết định theo hướng nào.

### 8. Owner

Business Authority + Backend Lead (Business Authority xác nhận trường nào là chính thức, Backend Lead đồng bộ lại tài liệu contract thật)

### 9. Trạng thái

ĐANG MỞ

## RR-028 [Cao] Thiếu phủ — File `gf-sales-data-model.md` (nguồn định nghĩa 2 cột DB mới + 1 index mới của Booking relay) được trích dẫn liên tục nhưng không tồn tại trong repo

### 1. Trích dẫn nguồn

- **File**: [gf-sales-HLD.md](../../../requirements/gara/wave-07/Architecture/hld/gf-sales-HLD.md#L340) (trích `gf-sales-data-model.md §2ter`) và [dòng 205](../../../requirements/gara/wave-07/Architecture/hld/gf-sales-HLD.md#L205) (index mới, `§2ter.1`); [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L82) (D12)
- **Section**: HLD trích dẫn data model cho schema delta D12 (cột `cancel_source`, `driverplus_service_type`, index `idx_booking_tenant_lead_source_status`)
- **Dòng**: 340; 205; 82
- **Quote nguyên văn**:
> "...gf-sales-data-model.md §2ter..." (gf-sales-HLD.md dòng 340)

### 2. Bối cảnh nghiệp vụ

Toàn bộ delta schema D12 của W07 — gồm 2 cột mới trên bảng `booking` và 1 index mới — được HLD, events và api liên tục dẫn chiếu tới file `gf-sales-data-model.md` như nguồn định nghĩa chi tiết (kiểu dữ liệu, độ dài, nullable, giá trị default). Khi rà soát bằng Glob trên toàn bộ `requirements/gara/` — kể cả thư mục `baseline/` — file này không tồn tại ở bất kỳ đâu trong repo, khác hẳn với `gf-system-data-model.md` (đối tác của Partner Link) vốn là 1 file thật, tồn tại đầy đủ.

### 3. Vấn đề cụ thể

Không có physical schema document nào đóng vai trò nguồn sự thật duy nhất cho Flyway migration của 2 cột `cancel_source`, `driverplus_service_type` và index mới — mọi mô tả hiện có chỉ là những dòng ghi chú rải rác trong HLD/events, chứ không phải 1 đặc tả đầy đủ.

### 4. Ảnh hưởng nếu không giải quyết

- DEV không có đặc tả chính thức về kiểu và độ dài cột `driverplus_service_type` (VARCHAR bao nhiêu ký tự?) nên phải tự đoán, dễ bị lệch khi gặp giá trị tiếng Việt có dấu dài nhất như "Bảo dưỡng".
- Không rõ `cancel_source` có bắt buộc NOT NULL hay nullable ở tầng DB — Product nói ghi cho "mọi booking", nhưng thực tế giá trị này là null với mọi state khác ngoài "Đã hủy" — tạo rủi ro constraint sai khi migration thật sự chạy.
- Review/audit không thể verify được index mới có đúng tenant-prefix theo yêu cầu HLD §7.3 hay không, vì thiếu tài liệu tham chiếu.

### 5. Đề xuất giải quyết

Tạo file `gf-sales-data-model.md` — hoặc bổ sung 1 mục tương đương vào `gf-sales-HLD.md` nếu chủ đích ban đầu không tách file riêng — với đầy đủ đặc tả 2 cột và index mới, trước khi DEV bắt đầu migration. Đây là 1 gap tài liệu cần Architecture bổ sung, không phải điều agent có thể tự suy diễn nội dung.

### 6. Liên kết với các phát hiện khác

Cùng pattern "tài liệu tham chiếu tới nguồn không tồn tại" với RR-029.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung file `gf-sales-data-model.md` đầy đủ trước khi DEV bắt đầu triển khai migration.
- (b) Xác nhận đặc tả schema đã tồn tại ở nơi khác (VD trực tiếp trong migration script) mà tầng Product/Architecture không cần lặp lại.
- (c) Cần Architecture xác nhận trước khi quyết định theo hướng nào.

### 8. Owner

Solution Architect (đây là tài liệu kiến trúc dữ liệu nền tảng, cần người sở hữu kiến trúc bổ sung hoặc xác nhận vị trí thật)

### 9. Trạng thái

ĐANG MỞ

## RR-029 [Cao] Thiếu phủ — Mã lỗi `ERR-BOOK-001`/`ERR-BOOK-002` được khẳng định "đã đăng ký tại ERROR-CODE-REGISTRY.md §6" nhưng registry thật không có 2 mã này

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L147) (Change Log v2, F7); [ADR-029-driver-plus-kafka-adapter-on-gf-system.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md#L33); đối chiếu `requirements/gara/baseline/Product/Commons/ERROR-CODE-REGISTRY.md` (version 34, `last_reviewed: 2026-08-02` — trước ngày rewrite Driver+ 2026-08-03)
- **Section**: Change Log F7 (mã lỗi mới); ADR-029 (display type API_RESPONSE); registry thật §5/§6
- **Dòng**: 147; 33
- **Quote nguyên văn**:
> "...mã lỗi mới đăng ký tại ERROR-CODE-REGISTRY.md §6." (FEAT-BOOK-DRIVERPLUS-INBOUND.md, Change Log v2 F7)

Đã verify bằng grep `ERR-BOOK|ERR-DPL` trên toàn bộ `ERROR-CODE-REGISTRY.md` (1039 dòng): 0 kết quả.

### 2. Bối cảnh nghiệp vụ

Registry hiện tại có cấu trúc 5 nhóm mã lỗi (`ERR-CMN-*`, `ERR-INS-*`, `ERR-INV-*`, `ERR-HRMS-*`, §5 Tổng hợp, §6 machine-readable YAML) — không hề có nhóm `ERR-BOOK-*` hay bất kỳ entry nào cho 2 mã lỗi cốt lõi trong toàn bộ luồng reject của payload Driver Plus inbound: `ERR-BOOK-001` (thiếu trường bắt buộc) và `ERR-BOOK-002` (sai bước 15 phút), theo mô tả tại `gf-sales-events.md` §3.3/§3.9bis.

### 3. Vấn đề cụ thể

Registry hiện có ngày `2026-08-02` (v34) — tức là bản trước ngày rewrite Driver+ (`2026-08-03`) — nên 2 mã lỗi mới chưa bao giờ thực sự được đăng ký vào registry, dù nhiều tài liệu W07 khẳng định "đã đăng ký". Severity, display type (TOAST/DIALOG/...), và message VI+EN chính thức của 2 mã lỗi này hiện chỉ tồn tại dưới dạng message tiếng Việt viết tay trong `gf-sales-events.md`, chưa qua quy trình ratify chuẩn của registry.

### 4. Ảnh hưởng nếu không giải quyết

- BE/FE không có single source of truth cho severity/display/message EN của 2 mã lỗi này — khác với mọi mã lỗi khác trong toàn hệ thống vốn đều đi qua registry.
- Vi phạm chính convention cốt lõi của registry ("hợp đồng BE/FE — đổi text KHÔNG đổi mã") vì 2 mã này chưa từng được ratify chính thức.
- Có nguy cơ conflict số nếu 1 wave khác tự đặt `ERR-BOOK-00X` cho 1 domain khác mà không biết 2 mã này thực chất "đã dùng", dù chưa đăng ký chính thức.

### 5. Đề xuất giải quyết

Chạy quy trình đăng ký chính thức 2 mã `ERR-BOOK-001`/`ERR-BOOK-002` vào `ERROR-CODE-REGISTRY.md` §5/§6 trước khi go-live — đây là action item kỹ thuật rõ ràng, không phải 1 quyết định nghiệp vụ cần tranh luận.

### 6. Liên kết với các phát hiện khác

Cùng pattern nhất quán chéo nguồn với RR-015 (`ERR-DPL-003`) và RR-028 (file tham chiếu không tồn tại).

### 7. Câu hỏi cho người dùng

- (a) Xác nhận cần bổ sung 2 mã lỗi vào registry chính thức trước go-live theo đúng đề xuất giải quyết ở trên.
- (b) Xác nhận registry thực tế đã được cập nhật ở 1 phiên bản mới hơn v34 mà agent chưa nhìn thấy, cần re-check lại.

### 8. Owner

Backend Lead + Business Authority (đồng bộ lại registry mã lỗi là trách nhiệm Backend Lead, Business Authority xác nhận nội dung lỗi đúng)

### 9. Trạng thái

ĐANG MỞ

## RR-030 [Cao] Mơ hồ — FEAT-BOOK-EDIT AC-8 dẫn chiếu "kiểm tra khung giờ tương tự tạo mới" nhưng không validate bước 15 phút — garage có thể sửa booking nguồn D+ sang giờ lệch slot

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-EDIT.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-EDIT.md#L89) (AC-8); [FEAT-BOOK-CREATE.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-CREATE.md#L115-L118) (AC-14); đối lập [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L461) (validate 15 phút của INBOUND)
- **Section**: FEAT-BOOK-EDIT AC-8; FEAT-BOOK-CREATE AC-14 (dẫn chiếu); INBOUND adapter gate validate phút
- **Dòng**: 89 (AC-8); 115-118 (AC-14); 461 (validate 15 phút)
- **Quote nguyên văn**:
> "hệ thống kiểm tra khung giờ tương tự như khi tạo mới (xem FEAT-BOOK-CREATE AC-12, AC-13, AC-14)." (FEAT-BOOK-EDIT AC-8)
>
> "có lịch hẹn gần thời điểm đã chọn → hiển thị cảnh báo... Vẫn cho phép tạo (không chặn)." (FEAT-BOOK-CREATE AC-14 — không nhắc bước 15 phút)
>
> "phút ∈ {00, 15, 30, 45} — sai bước 15 phút → reject ERR-BOOK-001" (gf-sales-events.md, chỉ áp dụng cho payload Driver+ tại adapter gate)

### 2. Bối cảnh nghiệp vụ

Khi garage sửa giờ hẹn của 1 booking trên Web GMS, cả luồng Create lẫn Edit chỉ "kiểm tra khung giờ" theo nghĩa cảnh báo trùng lịch — không chặn — chứ không phải validate định dạng phút. Time picker trên Web GMS cho phép chọn phút hoàn toàn tự do, khác hẳn với ràng buộc bước-15-phút mà chính Driver Plus áp đặt khi họ gửi payload đặt lịch qua kênh của mình.

### 3. Vấn đề cụ thể

Ví dụ, sau khi garage sửa giờ hẹn của 1 booking có nguồn Driver+ qua UI Edit thành 09:07, booking này phá vỡ invariant 15-phút mà chính Driver+ dùng để hiển thị slot cho khách hàng của họ — trong khi không có bất kỳ validate nào ở luồng Edit ngăn việc này xảy ra, dù luồng Inbound (tạo mới) validate rất nghiêm ngặt cùng 1 loại dữ liệu.

### 4. Ảnh hưởng nếu không giải quyết

- Dữ liệu booking nguồn Driver+ có thể rơi vào trạng thái không hợp lệ theo chính rule mà Driver Plus áp đặt lúc tạo, chỉ vì đi qua đường Edit của GMS.
- Driver+ nhận `BOOKING.UPDATE.RESPONSE` với giờ hẹn lệch slot 15 phút, trong khi app của họ không có UI hiển thị phút tự do — có thể gây lỗi hiển thị hoặc crash phía đối tác.
- Không có test coverage nào bắt được lỗi này vì Product không coi đây là 1 rule tường minh cần validate ở Edit.

### 5. Đề xuất giải quyết

Bổ sung validate bước 15 phút khi Edit, áp dụng riêng cho booking có nguồn Driver+ — không áp dụng cho booking nguồn nội bộ vì GMS nội bộ vốn không có ràng buộc này — đây là đề xuất theo suy luận nghiệp vụ hợp lý, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Liên quan RR-007 (đã có, AC-15 không giới hạn theo nguồn booking) và RR-009 (đã có, validate "Ngày hẹn" của Inbound) — cùng chủ đề validate không nhất quán giữa luồng Inbound (nghiêm ngặt) và luồng Edit thủ công (lỏng lẻo) cho cùng 1 loại dữ liệu.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung validate bước 15 phút khi Edit, áp dụng riêng cho booking nguồn Driver+.
- (b) Chấp nhận rủi ro, để Driver Plus tự xử lý phía họ khi nhận được giờ hẹn lệch slot.
- (c) Cần kiểm tra hành vi thực tế hiện tại — nếu Edit của booking Driver+ đã production — trước khi quyết định.

### 8. Owner

Business Authority + Backend Lead (Business Authority xác nhận rule 15 phút có áp dụng cho luồng Edit hay chỉ Create, Backend Lead bổ sung validate)

### 9. Trạng thái

ĐANG MỞ

## RR-031 [Cao] Mơ hồ — Schema thật của event `BOOKING.UPDATE.RESPONSE` (AC-15) chưa được đặc tả; bằng chứng cho thấy tái dùng payload luồng tạo mới, không mang nội dung đã cập nhật

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-EDIT.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-EDIT.md#L135-L138) (AC-15); [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L153-L155) (mapping class) và [§3.3 dòng 197-227](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L197-L227) (shape thật `BookingCreateResponseEvent`)
- **Section**: AC-15 (đồng bộ khi sửa nội dung); mapping `BOOKING.UPDATE.RESPONSE → BookingCreateResponseEvent`; §3.3 shape event
- **Dòng**: 135-138; 153-155; 197-227
- **Quote nguyên văn**:
> "đồng bộ thông tin lịch hẹn đã cập nhật sang Driver+... Khách hàng trên ứng dụng Driver+ nhận được thông tin lịch hẹn mới nhất." (AC-15)
>
> "BOOKING.UPDATE.RESPONSE → BookingCreateResponseEvent... emitted by BookingV3Service.publishBookingCreateResponse" (gf-sales-events.md dòng 153-155)

### 2. Bối cảnh nghiệp vụ

AC-15 hứa hẹn rằng mỗi khi garage cập nhật 1 booking, Driver Plus sẽ nhận được "thông tin lịch hẹn mới nhất". Nhưng bằng chứng trong Architecture lại cho thấy điều ngược lại: `BOOKING.UPDATE.RESPONSE` tái sử dụng đúng lớp (`BookingCreateResponseEvent`) và đúng method publish với luồng "tạo mới thành công". Đối chiếu §3.3, shape thật của `BookingCreateResponseEvent` chỉ gồm `{success, booking:{id, code}, error, correlation}` — không có bất kỳ field nào cho giờ hẹn, dịch vụ, hay xe vừa được cập nhật.

### 3. Vấn đề cụ thể

`gf-sales-events.md` không có mục §3.x riêng cho `BOOKING.UPDATE.RESPONSE`, khác với 7 event khác trong cùng file đều đã có mục riêng — nghĩa là hoàn toàn thiếu đặc tả payload cho event này. Nếu implementation thực tế tái dùng đúng class/method như dòng 153-155 gợi ý, payload gửi đi khi garage sửa lịch hẹn sẽ chỉ có `{id, code}`, không mang theo bất kỳ trường nội dung nào vừa thay đổi.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu DEV implement đúng theo evidence hiện có (tái dùng class cũ), Driver+ sẽ không bao giờ nhận được nội dung đã sửa thật, chỉ nhận `{id, code}` — đây là 1 bug nghiệp vụ nghiêm trọng, vi phạm trực tiếp lời hứa của AC-15, nhưng lại "khớp" với tài liệu hiện tại nên rất khó bị phát hiện qua review thông thường.
- Không có test case nào có thể viết chính xác vì không biết cấu trúc payload thật sự cần assert là gì.

### 5. Đề xuất giải quyết

Đặc tả riêng 1 mục §3.x cho `BOOKING.UPDATE.RESPONSE` với đầy đủ field nội dung đã cập nhật (giờ hẹn, dịch vụ, ghi chú...), tương tự cấu trúc của `BOOKING.CREATE.RESPONSE`, đồng thời xác nhận rõ có dùng class/method riêng hay chỉ mở rộng field cho class hiện có — đây là gap kiến trúc cần Architecture bổ sung, không phải điều agent có thể tự suy diễn.

### 6. Liên kết với các phát hiện khác

Liên quan trực tiếp RR-007 (đã có, AC-15 không giới hạn theo nguồn booking) — cả 2 đều là gap về AC-15, cùng cho thấy AC-15 chưa được rà soát kỹ trong đợt rewrite Driver+ 2026-08-03.

### 7. Câu hỏi cho người dùng

- (a) Xác nhận `BOOKING.UPDATE.RESPONSE` cần 1 payload riêng mang đầy đủ nội dung đã cập nhật, bổ sung đặc tả trước khi DEV bắt đầu.
- (b) Xác nhận việc chỉ gửi `{id, code}` là đủ — Driver+ sẽ tự gọi lại API/luồng khác để lấy chi tiết mới — nếu vậy AC-15 cần viết lại để không hứa hẹn "thông tin mới nhất" ngay trong chính event.
- (c) Cần kiểm tra code hiện tại — nếu AC-15 đã production và không đổi trong đợt rewrite — trước khi quyết định.

### 8. Owner

Solution Architect + Backend Lead (schema event thuộc phạm vi kiến trúc tích hợp, cần xác nhận trước khi Backend Lead hiện thực)

### 9. Trạng thái

ĐANG MỞ

## RR-032 [Trung bình] Thiếu phủ — Danh sách/Chi tiết lịch hẹn (FEAT-BOOK-LIST/DETAIL) chưa có AC phản ánh trường "Loại dịch vụ" macro của Driver+ dù INBOUND AC-3 khẳng định sẽ hiển thị

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L53) (AC-3); [FEAT-BOOK-LIST.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-LIST.md#L39-L46) (AC-1); [FEAT-BOOK-DETAIL.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DETAIL.md#L60-L63) (AC-5)
- **Section**: INBOUND AC-3 (hiển thị nguyên văn "loại dịch vụ macro"); LIST AC-1 (7 cột danh sách); DETAIL AC-5 (loại dịch vụ)
- **Dòng**: 53; 39-46; 60-63
- **Quote nguyên văn**:
> "hệ thống lưu và hiển thị nguyên văn giá trị này làm 'loại dịch vụ macro' trên Danh sách/Chi tiết lịch hẹn." (INBOUND AC-3)

### 2. Bối cảnh nghiệp vụ

`FEAT-BOOK-LIST.md` được review cùng ngày 2026-08-03 — có version bump thêm AC-14 cho `cancel_source` — nhưng 7 cột trong danh sách (Mã lịch hẹn, Nguồn, Khách hàng, Biển số xe, Thời gian hẹn, Trạng thái, Thao tác) lại không có cột "Loại dịch vụ" nào. `FEAT-BOOK-DETAIL.md` thì có `last_reviewed: 2026-05-27` — tức là trước cả đợt rewrite Driver+ — nên chưa kịp phản ánh việc "loại dịch vụ" giờ có 2 nguồn giá trị khác hệ thống: danh mục enum của GMS và chuỗi macro tự do do Driver+ gửi sang.

### 3. Vấn đề cụ thể

Không có Acceptance Criteria nào ở LIST hay DETAIL mô tả FE phải hiển thị trường "Loại dịch vụ" macro của Driver+ ở đâu, dưới label gì — dù INBOUND AC-3 khẳng định chắc chắn rằng giá trị này sẽ được hiển thị trên cả 2 màn.

### 4. Ảnh hưởng nếu không giải quyết

- FE không biết phải vẽ cột/label nào cho giá trị macro Driver+ trên Danh sách — có hiển thị hay không, và hiển thị ở vị trí nào.
- Garage staff có thể nhầm lẫn "Loại dịch vụ" hiển thị trên Chi tiết là danh mục dịch vụ nội bộ GMS (vốn dùng để lọc/báo cáo), trong khi thực chất đây là 1 chuỗi tự do không thể dùng để filter/group.

### 5. Đề xuất giải quyết

Bổ sung AC riêng ở LIST (thêm cột hoặc badge "Loại dịch vụ (D+)") và ở DETAIL (1 section riêng, phân biệt rõ với danh mục dịch vụ nội bộ) — đây là đề xuất, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Cùng nhóm với RR-008 (đã có, validate "Loại dịch vụ") — RR-008 nói về validate input, gap này nói về hiển thị output.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung AC hiển thị "Loại dịch vụ" Driver+ ở cả LIST và DETAIL theo đúng đề xuất giải quyết ở trên.
- (b) Xác nhận field này chỉ cần hiển thị ở DETAIL, không cần ở LIST do giới hạn không gian cột, chỉ bổ sung AC cho DETAIL.

### 8. Owner

Business Authority + Product Designer (bổ sung AC hiển thị là quyết định nghiệp vụ + thiết kế UI)

### 9. Trạng thái

ĐANG MỞ

## RR-033 [Trung bình] Thiếu phủ — Không có cơ chế nào để Driver Plus chủ động truy vấn lại trạng thái booking khi bỏ lỡ event Kafka

### 1. Trích dẫn nguồn

- **File**: [gf-sales-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-sales-api.md) §2 Endpoint Summary (toàn bộ 81 endpoint, không có endpoint service-to-service cho Driver+ query trạng thái); [FEAT-BOOK-DRIVERPLUS-OUTBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-OUTBOUND.md#L83-L86) (AC-9); [ADR-029-driver-plus-kafka-adapter-on-gf-system.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md#L76) (Threshold to re-evaluate)
- **Section**: API endpoint summary; AC-9 (dedupe khi GMS gửi lại); ADR-029 điều kiện đổi sang REST
- **Dòng**: 43-127 (endpoint summary); 83-86 (AC-9); 76 (threshold)

### 2. Bối cảnh nghiệp vụ

Toàn bộ tích hợp Booking relay hiện là fire-and-forget một chiều qua Kafka: GMS publish event, Driver Plus consume — hết. AC-9 chỉ mô tả cơ chế dedupe cho chiều GMS gửi lại (GMS→D+), hoàn toàn không có chiều ngược lại để Driver+ chủ động hỏi GMS "booking XYZ hiện đang ở trạng thái gì?". Bản thân ADR-029 cũng đã ý thức được rủi ro này ở mục "Threshold to re-evaluate" — ghi rõ việc Driver+ không đọc được response event là điều kiện bắt buộc phải đổi hẳn sang REST — nhưng chưa có giải pháp tạm thời nào cho W07.

### 3. Vấn đề cụ thể

Nếu Driver Plus mất kết nối đúng lúc GMS publish `BOOKING.CREATE.RESPONSE` hoặc `BOOKING.CHANGE.STATUS`, cơ chế retry duy nhất hiện có là outbox retry, tối đa 5 lần theo HLD §6 — sau đó event bị coi như "ghi ngoại lệ cho vận hành" và Driver Plus hoàn toàn không có cách nào để chủ động hỏi lại trạng thái thật.

### 4. Ảnh hưởng nếu không giải quyết

- Khách hàng trên Driver+ có thể thấy trạng thái booking "treo" vĩnh viễn — ví dụ mãi ở "Chờ xác nhận" dù GMS đã confirm từ lâu — nếu đúng lúc họ mất mạng trùng vào cửa sổ 5 lần retry.
- Không có test case nào cho kịch bản "Driver+ recovery sau outage" vì hoàn toàn không có API nào để mô phỏng tình huống đó.

### 5. Đề xuất giải quyết

Bổ sung 1 REST endpoint read-only, cho phép Driver Plus (đã xác thực) query trạng thái booking theo `externalBookingId`, dùng làm cơ chế fallback khi Kafka event bị mất — đây là đề xuất kỹ thuật bám đúng theo threshold mà chính ADR-029 đã đặt ra, chưa có quyết định triển khai trong W07.

### 6. Liên kết với các phát hiện khác

Liên quan RR-036 (thiếu SLA cảnh báo khi retry hết) và RR-045 (không phát hiện được Driver+ ngừng gửi message) — cùng chủ đề thiếu cơ chế phục hồi khi 1 bên trong tích hợp gặp sự cố.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung endpoint query trạng thái cho Driver Plus trong phạm vi W07.
- (b) Chấp nhận rủi ro cho W07, để 1 CR riêng xử lý theo đúng threshold đã ghi trong ADR-029.
- (c) Cần Architecture/Business Authority quyết định trước khi triển khai.

### 8. Owner

Solution Architect + Business Authority (thiết kế cơ chế reconciliation là quyết định kiến trúc tích hợp, Business Authority xác nhận mức độ rủi ro nghiệp vụ chấp nhận được)

### 9. Trạng thái

ĐANG MỞ

## RR-034 [Trung bình] Tương tranh — Dedupe theo `event_id` (AC-9) chỉ xử lý retry mạng cùng event_id, không phát hiện 2 yêu cầu logic giống hệt nhưng khác `event_id`

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L84-L87) (AC-9); [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L480) (inbox unique constraint)
- **Section**: AC-9 (dedupe); inbox repository
- **Dòng**: 84-87; 480
- **Quote nguyên văn**:
> "Khi: cùng một yêu cầu (đặt lịch mới hoặc hủy) được gửi/nhận nhiều lần liên tiếp (do retry mạng phía Driver+, không phải 2 yêu cầu khác nhau)." (AC-9)
>
> "Ghi inbox bằng InboxEventType.BOOKING_CREATED_FROM_DRIVER_PLUS; duplicate bị bỏ qua qua unique constraint/inbox repository." (gf-sales-events.md — unique constraint chỉ khoá theo event_id/messageId, không có unique theo business key)

### 2. Bối cảnh nghiệp vụ

AC-9 tự giới hạn phạm vi rất rõ ràng: cơ chế dedupe chỉ xử lý trường hợp retry mạng thật sự, tức là cùng `event_id`. Đúng theo đó, unique constraint trong inbox repository chỉ khoá theo `event_id`/`messageId`, không hề có unique theo business key nào (ví dụ SĐT khách hàng cộng ngày giờ hẹn).

### 3. Vấn đề cụ thể

Có 1 trường hợp nằm ngoài phạm vi bảo vệ này: khách hàng bấm đặt lịch 2 lần liên tiếp trên app Driver Plus (double-tap ở phía UI của họ), tạo ra 2 `event_id` khác nhau nhưng cùng SĐT và cùng ngày giờ hẹn. Vì cơ chế dedupe hiện tại chỉ nhìn vào `event_id`, tình huống trùng logic này sẽ lọt qua và tạo ra 2 booking hợp lệ trùng lặp thật sự trong GMS.

### 4. Ảnh hưởng nếu không giải quyết

- Garage sẽ nhận 2 lịch hẹn giống hệt nhau cho cùng 1 khách, gây nhầm lẫn vận hành — có thể double-book cùng 1 slot, xác nhận nhầm 1 trong 2 booking, còn cái kia bị "treo" không ai xử lý.
- Không có BR nào ngăn được tình huống này, kể cả BR-BOOK-004 (khớp khách hàng theo SĐT) — vì rule đó chỉ dùng để gán snapshot khách hàng, không có tác dụng chặn tạo booking trùng.

### 5. Đề xuất giải quyết

Cân nhắc bổ sung 1 lớp cảnh báo mềm — không chặn cứng, vì đây có thể là 2 nhu cầu thật khác nhau của cùng 1 khách — khi hệ thống phát hiện booking mới trùng SĐT và ngày giờ hẹn với 1 booking khác trong 1 khung thời gian ngắn (VD 5 phút) — đây là đề xuất, chưa có căn cứ xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung cảnh báo mềm cho garage khi phát hiện booking trùng logic, không chặn việc tạo booking.
- (b) Chấp nhận rủi ro, coi đây là trách nhiệm phía Driver Plus (họ tự chặn double-tap ở UI của mình).
- (c) Cần Business Authority quyết định phương án nào phù hợp.

### 8. Owner

Backend Lead + Solution Architect (mở rộng cơ chế dedupe là quyết định kỹ thuật, cần Solution Architect xác nhận không phá vỡ nguyên tắc idempotency hiện có)

### 9. Trạng thái

ĐANG MỞ

## RR-035 [Trung bình] Thiếu phủ — Khi yêu cầu hủy từ Driver+ không đủ điều kiện áp dụng, việc garage được thông báo hay không chỉ là "có thể publish", không phải invariant chắc chắn

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L524) (`handleBookingCancelledByDriver`); [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L75) (AC-7)
- **Section**: Flow xử lý yêu cầu hủy không đủ điều kiện; AC-7
- **Dòng**: 524; 75
- **Quote nguyên văn**:
> "Nhánh (a)/(b) gọi BookingV3Service.handleBookingCancelledByDriver — flow này publish BookingStatusChanged (§3.1) + có thể publish NotificationRequest (§3.6) cho user GMS." (gf-sales-events.md — "có thể", không phải bắt buộc)
>
> "không coi đây là garage 'từ chối yêu cầu' mà là đồng bộ lại đúng thực tế hiện có." (AC-7 — không nhắc việc garage có được báo hay không)

### 2. Bối cảnh nghiệp vụ

Khi khách hàng dùng app Driver Plus bấm hủy cho 1 booking đã có phiếu dịch vụ (SO) liên kết, hoặc booking đã khép lại (Xe đã đến / Đã hủy / Đã từ chối), hệ thống GMS không tự động hủy giúp — flow xử lý (nhánh (a)/(b) trong `handleBookingCancelledByDriver`) chuyển sang cho garage chủ động xử lý ngoài luồng tự động. Đây chính là kịch bản khách hàng đã cố hủy trên app nhưng thực tế yêu cầu hủy không được áp dụng, và garage cần biết điều đó để chủ động liên hệ lại với khách.

### 3. Vấn đề cụ thể

Flow này publish `BookingStatusChanged` (bắt buộc) và "có thể" publish thêm `NotificationRequest` cho user GMS (garage) — chữ "có thể" (optional, không phải "bắt buộc") cho thấy việc garage thực sự nhận được tín hiệu "khách đã cố hủy nhưng bị chặn" không phải là điều chắc chắn xảy ra trong mọi trường hợp. Đồng thời, AC-7 mô tả đây là "đồng bộ lại đúng thực tế hiện có" chứ không coi là garage "từ chối yêu cầu" — nhưng cũng không nhắc gì tới việc garage có được báo hay không.

### 4. Ảnh hưởng nếu không giải quyết

- Khách hàng tin rằng mình đã hủy thành công trên Driver Plus, nhưng garage không hề hay biết và vẫn tiếp tục xử lý booking/phiếu dịch vụ như bình thường — dẫn tới tranh chấp dịch vụ, khiếu nại từ khách vì "tôi đã hủy rồi mà vẫn bị tính phí/vẫn bị gọi tới".
- Không có quy tắc nào nói rõ garage phải chủ động kiểm tra "yêu cầu hủy bị từ chối" ở chỗ nào trên UI nếu không nhận được notification — nhân viên garage không có nơi nào để tự tra cứu case này.

### 5. Đề xuất giải quyết

Đổi "có thể publish" thành bắt buộc publish `NotificationRequest` cho mọi trường hợp yêu cầu hủy từ D+ không được áp dụng tự động — đề xuất theo tầm quan trọng nghiệp vụ của kịch bản, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Đổi "có thể publish" thành bắt buộc publish notification cho garage trong mọi trường hợp yêu cầu hủy Driver+ bị từ chối áp dụng, để đảm bảo garage luôn nhận được tín hiệu này.
- (b) Xác nhận "có thể" là chủ đích thiết kế (ví dụ chỉ publish khi cấu hình notification được bật cho tenant đó), và không cần sửa đổi gì thêm.
- (c) Đưa quyết định này lên Business Authority vì đây là lựa chọn ảnh hưởng tới trải nghiệm khách hàng, không phải quyết định kỹ thuật thuần túy.

### 8. Owner

Business Authority + Backend Lead (Business Authority quyết định đây có bắt buộc phải là invariant hay không, Backend Lead hiện thực hoá)

### 9. Trạng thái

ĐANG MỞ

## RR-036 [Trung bình] Thiếu phủ — Không có định nghĩa cụ thể kênh/mức độ/SLA cảnh báo vận hành khi outbound hết số lần retry

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-OUTBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-OUTBOUND.md#L78-L81) (AC-8); [gf-sales-HLD.md](../../../requirements/gara/wave-07/Architecture/hld/gf-sales-HLD.md#L169) (retry max 5×)
- **Section**: AC-8 (sự cố khi gửi); HLD retry policy chung
- **Dòng**: 78-81; 169
- **Quote nguyên văn**:
> "hệ thống dừng tự động thử lại, ghi nhận ngoại lệ để đội vận hành garage xử lý thủ công (không tự đánh dấu thành công hay thất bại thay)." (AC-8)

### 2. Bối cảnh nghiệp vụ

HLD chung của toàn hệ thống quy định outbox retry tối đa 5 lần trước khi dừng lại (`gf-sales-HLD.md`), và AC-8 của FEAT OUTBOUND mô tả khi hết số lần retry, hệ thống dừng tự động thử lại và "ghi nhận ngoại lệ để đội vận hành garage xử lý thủ công" — không tự động đánh dấu thành công hay thất bại thay. Con số retry 5 lần này chỉ nằm ở mức HLD chung cho toàn bộ outbox, không được cross-reference lại trong chính AC-7/AC-8 của FEAT OUTBOUND.

### 3. Vấn đề cụ thể

"Ghi nhận ngoại lệ" không định nghĩa rõ: log ghi ở đâu, có bắn alert/paging cho ai không, ai là người chịu trách nhiệm nhìn thấy nó, và SLA phát hiện tối đa là bao lâu. Trong khi các domain khác cùng boundary đều có mã lỗi với severity/display rõ ràng cho người dùng cuối, luồng Driver+ lại không có cơ chế visibility tương đương cho lỗi vận hành nội bộ này.

### 4. Ảnh hưởng nếu không giải quyết

- Booking đã đổi trạng thái ở GMS nhưng phía Driver Plus không bao giờ biết vì event đã bị mất sau 5 lần retry, và không ai trong garage hay đội vận hành phát hiện ra kịp thời.
- Khách hàng nhìn thấy trạng thái sai lệch trên app Driver Plus trong một khoảng thời gian không xác định, vì không có SLA nào ràng buộc thời gian phát hiện sự cố.

### 5. Đề xuất giải quyết

Định nghĩa rõ kênh cảnh báo (dashboard vận hành/alert nội bộ), mức độ (severity), và SLA phát hiện tối đa cho case retry hết — đề xuất, chưa có xác nhận từ Architecture/vận hành.

### 6. Liên kết với các phát hiện khác

Liên quan RR-033 (thiếu cơ chế Driver+ tự query lại) — cùng chủ đề thiếu observability cho luồng outbound fail.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung định nghĩa rõ kênh cảnh báo, mức độ severity, và SLA phát hiện tối đa cụ thể cho trường hợp retry hết lần.
- (b) Xác nhận đã có sẵn cơ chế alerting chung ở tầng hạ tầng (nằm ngoài phạm vi tài liệu Product/Architecture của Wave 07) bao phủ mọi trường hợp outbox thất bại, nên không cần đặc tả riêng thêm.

### 8. Owner

DevOps/SRE Lead + Backend Lead (định nghĩa kênh/SLA cảnh báo là quyết định vận hành)

### 9. Trạng thái

ĐANG MỞ

## RR-037 [Thấp] Thiếu phủ — Không có chính sách retention/TTL cho bảng `inbox_event`/`outbox_event` dùng để dedupe

### 1. Trích dẫn nguồn

- **File**: [gf-sales-HLD.md](../../../requirements/gara/wave-07/Architecture/hld/gf-sales-HLD.md#L143)
- **Section**: §5/§6/§7 Event durability
- **Dòng**: 143
- **Quote nguyên văn**:
> "Event durability | outbox_event, inbox_event | Outbox idempotent retry-safe; inbox unique (event_id, type)."

### 2. Bối cảnh nghiệp vụ

Bảng `inbox_event` là cơ chế dedupe chính cho toàn bộ payload gửi từ Driver Plus vào hệ thống (AC-9) — mỗi khi nhận 1 event, hệ thống lưu `event_id` để phát hiện Driver Plus gửi trùng do retry. HLD ghi nhận cơ chế này ("Outbox idempotent retry-safe; inbox unique (event_id, type)") nhưng toàn bộ §5/§6/§7 của HLD không có dòng nào nói về archival/purge/TTL cho 2 bảng `outbox_event`/`inbox_event` này.

### 3. Vấn đề cụ thể

Không rõ 2 bảng này được thiết kế tăng trưởng vô hạn theo thời gian (rủi ro performance dài hạn khi dữ liệu tích lũy), hay có 1 cơ chế purge ngầm nào đó đã tồn tại nhưng chưa được viết vào tài liệu — kéo theo rủi ro dedupe thất bại nếu Driver Plus retry rất trễ, sau khi record gốc đã bị xoá.

### 4. Ảnh hưởng nếu không giải quyết

- Dev không có căn cứ rõ ràng khi thiết kế job dọn dẹp định kỳ cho 2 bảng này.
- QA không có căn cứ để thiết kế test case cho kịch bản "Driver Plus retry rất trễ" — không biết sau bao lâu thì cơ chế dedupe không còn hiệu lực nữa.

### 5. Đề xuất giải quyết

Bổ sung chính sách retention rõ ràng (VD giữ 90 ngày, archival sau đó) cho `inbox_event`/`outbox_event` — đề xuất theo best practice vận hành, chưa có xác nhận.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung chính sách retention/TTL cụ thể cho 2 bảng (ví dụ giữ 90 ngày rồi archival).
- (b) Xác nhận đây là vấn đề thuộc phạm vi vận hành hạ tầng chung của hệ thống, không cần đặc tả riêng trong tài liệu Wave 07.

### 8. Owner

Backend Lead + DevOps/SRE Lead (chính sách retention DB nội bộ là quyết định vận hành/kỹ thuật)

### 9. Trạng thái

ĐANG MỞ

## RR-038 [Trung bình] Bảo mật — Trường `vehicleImages` (mảng URL) nhận từ Driver+ không giới hạn số lượng phần tử và không validate định dạng/domain

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L470) (bảng field #13); [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L48) (AC-2)
- **Section**: Bảng field payload (`vehicleImages`); AC-2 (9 trường tùy chọn)
- **Dòng**: 470; 48
- **Quote nguyên văn**:
> "13 | vehicleImages | String[] | ⛔ | — | booking_details.vehicle_images (JSONB) | INBOUND AC-2, AC-5" (cột "Validation tại adapter gate" để trống)

### 2. Bối cảnh nghiệp vụ

Trường `vehicleImages` là dữ liệu do Driver Plus — một đối tác bên ngoài mà GMS không kiểm soát được input — gửi sang, được lưu thẳng vào cột JSONB `booking_details.vehicle_images` và hiển thị trực tiếp trên màn Chi tiết lịch hẹn cho nhân viên garage xem. Quy tắc M-2 của `BR-GF-SALES.md` §7.2 đã giới hạn số lượng ảnh, nhưng chỉ áp dụng cho luồng upload thủ công trên Web GMS — không cover luồng nhận URL ảnh từ Driver+.

### 3. Vấn đề cụ thể

Bảng field payload của AC-2 để trống cột "Validation tại adapter gate" cho `vehicleImages` — nghĩa là không có giới hạn số lượng phần tử cho mảng ảnh nhận từ Driver+, và cũng không có bước validate URL có đúng domain CDN của Driver+ hay không.

### 4. Ảnh hưởng nếu không giải quyết

- Một tenant hoặc một booking có thể mang theo mảng `vehicleImages` cực lớn mà không hề bị chặn ở adapter gate — mở đường cho rủi ro lạm dụng tài nguyên/storage.
- Nếu URL không được validate domain, garage-web có thể render thẻ `<img src>` trỏ tới bất kỳ domain nào do Driver+ (hoặc lỗi phía họ) gửi lên — rủi ro XSS qua `<img src>` tuy thấp, nhưng vẫn tồn tại rủi ro về tính toàn vẹn dữ liệu và theo dõi (mixed content, link hỏng, hoặc URL trỏ tới nội dung không phù hợp).

### 5. Đề xuất giải quyết

Áp dụng giới hạn số lượng phần tử tương tự M-2 (luồng upload thủ công) cho luồng nhận từ Driver+, và validate URL theo whitelist domain CDN đã biết của Driver Plus — đề xuất, chưa có xác nhận từ Business Authority/Architecture.

### 6. Liên kết với các phát hiện khác

Cùng nhóm validate payload inbound với RR-018.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung giới hạn số lượng phần tử và validate domain cho `vehicleImages` ngay tại adapter gate.
- (b) Chấp nhận mức rủi ro hiện tại là thấp, không cần bổ sung validate trong Wave 07.

### 8. Owner

Security Lead + Backend Lead (giới hạn số lượng/định dạng URL nhận từ đối tác ngoài là quyết định an toàn dữ liệu)

### 9. Trạng thái

ĐANG MỞ

## RR-039 [Thấp] Thiếu phủ — File `Product/epics/EP-BOOKING.md` không chứa nội dung Epic — nội dung thực tế là `UX-FLOW-BOOKING`

### 1. Trích dẫn nguồn

- **File**: [EP-BOOKING.md](../../../requirements/gara/wave-07/Product/epics/EP-BOOKING.md#L1-L11) (frontmatter `type: ux`, `artifact_kind: ux-spec`, tiêu đề "UX-FLOW-BOOKING: Luồng lịch hẹn & tiếp nhận xe")
- **Section**: Frontmatter + tiêu đề file
- **Dòng**: 1-11

### 2. Bối cảnh nghiệp vụ

File epic đối ứng `EP-PARTNER-LINK.md` chứa đúng nội dung cấp epic (scope, success metrics — xem thêm RR-049/RR-050). Nhưng file cùng cấp thư mục `Product/epics/` dành cho Booking, tên là `EP-BOOKING.md`, lại không chứa nội dung epic — frontmatter của nó ghi `type: ux`, `artifact_kind: ux-spec`, và tiêu đề thực tế là "UX-FLOW-BOOKING: Luồng lịch hẹn & tiếp nhận xe".

### 3. Vấn đề cụ thể

Grep `^# EP-BOOKING` trên toàn bộ thư mục `requirements/gara/wave-07/` cho ra 0 kết quả — nghĩa là không có bất kỳ file nào trong phạm vi Wave 07 thực sự chứa nội dung Epic `EP-BOOKING` (scope, success metric ở cấp toàn bộ Booking).

### 4. Ảnh hưởng nếu không giải quyết

Không ảnh hưởng nghiệp vụ trực tiếp — nội dung UX-FLOW-BOOKING tự nó vẫn có giá trị và đã được dùng để đối chiếu trong đợt review này — nhưng gây khó khăn cho việc audit traceability ở cấp Epic, vì không thể verify scope hay success metric cấp Epic của `EP-BOOKING` khi file mang tên đó lại không chứa đúng nội dung.

### 5. Đề xuất giải quyết

Đổi tên file `EP-BOOKING.md` hiện tại thành đúng tên nội dung (VD `UX-FLOW-BOOKING.md`) và tạo file `EP-BOOKING.md` thật chứa nội dung epic-level, nếu epic đó thực sự tồn tại riêng biệt — đây là gap thuần túy về filing/traceability, không phải nghiệp vụ.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Sửa lại việc đặt tên file: đổi tên file hiện tại thành đúng với nội dung của nó (ví dụ `UX-FLOW-BOOKING.md`), đồng thời tạo file `EP-BOOKING.md` thật chứa nội dung epic-level nếu epic đó thực sự cần tồn tại riêng.
- (b) Xác nhận `EP-BOOKING` không tồn tại như một epic riêng biệt — nghĩa là Booking baseline không cần thêm tài liệu epic-level mới cho Wave 07 — và giữ nguyên hiện trạng.

### 8. Owner

Business Authority/Product Owner (đây là vấn đề quản lý tài liệu nội bộ team Product)

### 9. Trạng thái

ĐANG MỞ

## RR-040 [Cao] Tương tranh — Không có UI xử lý xác định khi kill-switch chuyển `off` giữa lúc user đã mở sẵn trang/modal và bấm action

### 1. Trích dẫn nguồn

- **File**: [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L52278) (và tương tự dòng 52346, 52425, 52492 — 4 bảng Error codes của 4 mutation); đối chiếu [INTEG-FE-garage-web-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md#L324-L345) (§3.9 UI mapping)
- **Section**: Error codes 4 mutation Duyệt/Từ chối/Đồng bộ/Hủy; INTEG-FE §3.9 bảng UI mapping
- **Dòng**: 52278 (và 52346, 52425, 52492); 324-345
- **Quote nguyên văn**:
> "GMS.gf-system.PARTNER_LINK.FLAG_OFF | 403 | Feature flag off" (agg-garage-graph-graphql.md, cả 4 mutation)

### 2. Bối cảnh nghiệp vụ

Cơ chế ẩn menu/tab Liên kết Driver Plus khi kill-switch (feature flag) chuyển sang `off` chỉ hoạt động khi người dùng MỞ LẠI trang — vì FE đọc `featureFlags` ngay lúc mount component. Nhưng nếu nhân viên garage đã mở sẵn trang `/partner-links` (hoặc tab tương ứng trên Mobile) từ trước, và ngay lúc đó Delivery Authority bật kill-switch để xử lý sự cố diện rộng phía Driver Plus, rồi nhân viên bấm 1 trong 4 action (Duyệt/Từ chối/Đồng bộ/Hủy), mutation sẽ trả về lỗi 403 với mã `GMS.gf-system.PARTNER_LINK.FLAG_OFF`.

### 3. Vấn đề cụ thể

Không có dòng nào trong toàn bộ bảng UI mapping §3.9 của cả Web (INTEG-FE) lẫn Mobile (INTEG-MOB) đề cập tới việc UI phải xử lý ra sao khi mutation trả về `FLAG_OFF` — khác hẳn với mã lỗi `ERR-DPL-005` (503) vốn đã có toast riêng "Không thể xử lý yêu cầu...". Đây chính là kịch bản mà kill-switch được thiết kế ra để xử lý (Driver Plus gặp sự cố diện rộng), nên khả năng xảy ra không hề thấp.

### 4. Ảnh hưởng nếu không giải quyết

- Nhân viên garage nhìn thấy một thông báo lỗi generic, khó hiểu, đúng vào lúc admin đang chủ động tắt tính năng khẩn cấp — đây là trải nghiệm tệ nhất lại rơi vào đúng thời điểm nhạy cảm nhất.
- Không có oracle rõ ràng để viết test case cho race condition "flag chuyển off giữa phiên làm việc".
- Thông báo lỗi này có thể bị nhầm lẫn với UI "Lỗi hệ thống" (ERR-DPL-005), khiến nhân viên tưởng đây là bug thay vì hành vi được thiết kế chủ đích.

### 5. Đề xuất giải quyết

Bổ sung 1 dòng UI mapping riêng cho `FLAG_OFF`: toast/dialog thông báo "Tính năng Liên kết Driver Plus tạm thời không khả dụng" + tự động ẩn menu/tab ngay khi nhận response này (không chờ user tự reload) — đề xuất, chưa có xác nhận từ Business Authority/UX.

### 6. Liên kết với các phát hiện khác

Liên quan RR-017 (kill-switch với inbound WITHDRAW/UNLINK) và RR-011 (đã có, outbox trước khi flag off) — cùng chủ đề đặc tả chưa đầy đủ cho hành vi kill-switch.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung 1 dòng UI mapping riêng cho `FLAG_OFF`: hiển thị toast/dialog "Tính năng Liên kết Driver Plus tạm thời không khả dụng" và tự động ẩn menu/tab ngay khi nhận response này, không cần chờ người dùng tự reload trang.
- (b) Chấp nhận tái sử dụng UI lỗi generic hiện có (tương tự ERR-DPL-005), không cần thiết kế message riêng cho trường hợp này.

### 8. Owner

Product Designer + Frontend Lead (message hiển thị khi gặp lỗi FLAG_OFF giữa phiên là quyết định UX cụ thể)

### 9. Trạng thái

ĐANG MỞ

## RR-041 [Trung bình] Thiếu phủ — Không có UI xử lý cho `NF_404` khi fetch chi tiết yêu cầu liên kết trong race condition auto-select item đầu

### 1. Trích dẫn nguồn

- **File**: [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L52214) (`PARTNER_LINK.NF_404`); [INTEG-FE-garage-web-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md#L327) (auto-select item đầu)
- **Section**: `getPartnerLinkRequestDetail` error codes; §3.9 hành vi auto-select
- **Dòng**: 52214; 327
- **Quote nguyên văn**:
> "GMS.gf-system.PARTNER_LINK.NF_404 | 404 | Không tìm thấy trong tenant hiện tại..." (agg-garage-graph-graphql.md)
>
> "Item đầu tiên auto-chọn khi mở màn | /partner-links | query getPartnerLinkRequestDetail | ... | AC-3. FE gọi detail cho items[0].requestCode ngay sau khi list resolve" (INTEG-FE)

### 2. Bối cảnh nghiệp vụ

Ngay sau khi `listPartnerLinkRequests` trả về danh sách, FE tự động gọi tiếp `getPartnerLinkRequestDetail` cho item đầu tiên (`items[0].requestCode`) — không có khoảng dừng nào cho người dùng thao tác ở giữa 2 lệnh gọi này.

### 3. Vấn đề cụ thể

Nếu đúng vào khoảng thời gian giữa 2 lần gọi đó, Driver Plus gửi sự kiện `PARTNER_LINK.UNLINK`/withdraw khiến record biến mất khỏi filter mặc định, hoặc record vừa bị một nhân viên khác xử lý xong đúng lúc, thì detail query có thể trả về lỗi `PARTNER_LINK.NF_404` ("Không tìm thấy trong tenant hiện tại"). Không có dòng nào trong cả 2 tài liệu FE (Web lẫn Mobile) mô tả UI phải làm gì khi rơi vào tình huống này.

### 4. Ảnh hưởng nếu không giải quyết

- Màn chi tiết có thể hiển thị trắng trơn hoặc crash khi các trường bắt buộc như `requestCode`, `status` không có dữ liệu trả về.
- Không có oracle rõ ràng để viết test case xác định cho race condition giữa lệnh gọi list và detail.

### 5. Đề xuất giải quyết

Khi detail trả `NF_404` ngay sau auto-select, FE tự động re-fetch lại list (item đầu đã đổi) và auto-select lại item mới, kèm thông báo nhẹ "Dữ liệu vừa được cập nhật" — đề xuất, chưa có xác nhận.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Khi detail trả về `NF_404` ngay sau bước auto-select, cho FE tự động re-fetch lại danh sách (vì item đầu đã đổi) rồi auto-select lại item mới, kèm theo thông báo nhẹ "Dữ liệu vừa được cập nhật".
- (b) Hiển thị một empty-state đơn giản, để người dùng tự chọn lại item khác từ danh sách thay vì tự động xử lý.

### 8. Owner

Product Designer + Frontend Lead (hành vi UI khi item vừa chọn biến mất là quyết định UX)

### 9. Trạng thái

ĐANG MỞ

## RR-042 [Trung bình] Mơ hồ — `ERR-DPL-007` dùng chung cho cả list và detail nhưng chỉ ngữ cảnh list có UI được định nghĩa

### 1. Trích dẫn nguồn

- **File**: [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L52123) (ví dụ lỗi `listPartnerLinkRequests`) và [dòng 52215](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L52215) (bảng lỗi `getPartnerLinkRequestDetail`); [INTEG-FE-garage-web-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md#L332)
- **Section**: `listPartnerLinkRequests` error example; `getPartnerLinkRequestDetail` error codes; INTEG-FE UI mapping cho list
- **Dòng**: 52123; 52215; 332
- **Quote nguyên văn**:
> "Banner lỗi load danh sách + nút 'Tải lại' | /partner-links | ↑ (ErrorResponse ERR-DPL-007) | — | UX-FLOW §4." (INTEG-FE, chỉ định nghĩa cho ngữ cảnh LIST)

### 2. Bối cảnh nghiệp vụ

Mã lỗi `ERR-DPL-007` (503, lỗi đọc DB) được dùng chung cho cả 2 operation: `listPartnerLinkRequests` (hiển thị ở panel trái) và `getPartnerLinkRequestDetail` (hiển thị ở panel phải) — khi 1 trong 2 gặp sự cố đọc DB, cùng 1 mã lỗi này được trả về. Web đã định nghĩa rõ UI cho `ERR-DPL-007` trong ngữ cảnh LIST: một banner lỗi toàn màn hình kèm nút "Tải lại".

### 3. Vấn đề cụ thể

Không có dòng UI nào được định nghĩa cho ngữ cảnh DETAIL — không rõ liệu hệ thống có tái sử dụng banner lỗi của list (khi đó sẽ che luôn cả panel trái đang hoạt động bình thường) hay cần thiết kế riêng một UI cho panel phải.

### 4. Ảnh hưởng nếu không giải quyết

- Dev có thể vô tình áp banner toàn màn hình ngay cả khi chỉ panel phải bị lỗi, khiến panel trái — vốn vẫn đang hoạt động tốt — cũng bị che khuất, mất khả năng truy cập.
- Test case cho lỗi ở panel detail không có oracle UI rõ ràng để dựa vào.

### 5. Đề xuất giải quyết

Bổ sung 1 dòng UI riêng cho `ERR-DPL-007` trong ngữ cảnh detail: banner cục bộ trong panel phải (không che panel trái) + nút "Thử lại" — đề xuất, chưa có xác nhận từ UX.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung 1 UI riêng cho `ERR-DPL-007` trong ngữ cảnh detail: một banner cục bộ chỉ nằm trong panel phải (không che panel trái) kèm nút "Thử lại".
- (b) Tái sử dụng banner toàn màn hình giống ngữ cảnh list, chấp nhận việc nó sẽ che luôn cả panel trái.

### 8. Owner

Product Designer + Frontend Lead (bổ sung UI xử lý cho ngữ cảnh detail là quyết định thiết kế UI)

### 9. Trạng thái

ĐANG MỞ

## RR-043 [Trung bình] Mơ hồ — Mobile không tái khẳng định yêu cầu `no-cache` cho `getPartnerLinkRequestDetail` như Web

### 1. Trích dẫn nguồn

- **File**: [INTEG-FE-garage-web-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md#L350) (Ràng buộc FE bắt buộc); [INTEG-MOB-garage-mobile-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md#L197-L207) (Ràng buộc mobile bắt buộc); [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L52043) (yêu cầu CB-SYS-006)
- **Section**: INTEG-FE ràng buộc no-cache; INTEG-MOB ràng buộc mobile (không có dòng tương đương); BFF yêu cầu real-time
- **Dòng**: 350; 197-207; 52043
- **Quote nguyên văn**:
> "KHÔNG cache Apollo cho getPartnerLinkRequestDetail (fetchPolicy: 'no-cache') — CB-SYS-006 cấm cache khối đồng bộ." (INTEG-FE, dòng 350)
>
> "mobile hiện dùng FetchPolicy.networkOnly với GraphQLCache(HiveStore())" (INTEG-MOB, dòng 207 — default chung, không phải override riêng cho detail)

### 2. Bối cảnh nghiệp vụ

Vì khối dữ liệu `garageProfile`/`invoiceInfo` trả về từ `getPartnerLinkRequestDetail` bắt buộc phải real-time (theo ràng buộc CB-SYS-006 — cấm cache khối đồng bộ), tài liệu BFF (`agg-garage-graph-graphql.md`) yêu cầu tường minh "KHÔNG cache" cho operation này. Phía Web (INTEG-FE) đã tài liệu hoá đúng yêu cầu đó: override Apollo Client sang `fetchPolicy: 'no-cache'` riêng cho `getPartnerLinkRequestDetail`. Phía Mobile (INTEG-MOB) chỉ nêu ra policy mặc định chung của cả app: `FetchPolicy.networkOnly` kết hợp `GraphQLCache(HiveStore())` — không có dòng nào nói riêng cho operation detail này.

### 3. Vấn đề cụ thể

`networkOnly` và `no-cache` không tương đương nhau về mặt kỹ thuật: `networkOnly` vẫn đọc từ network nhưng SAU ĐÓ GHI kết quả vào cache (`HiveStore`), trong khi `no-cache` không đọc/ghi cache ở cả 2 chiều. Không có bằng chứng nào cho thấy Mobile tự override thành `no-cache` riêng cho `getPartnerLinkRequestDetail`.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu implementation thực tế của Mobile không tự override thành `no-cache`, `HiveStore` sẽ lưu lại snapshot của `garageProfile`/`invoiceInfo` — tạo rủi ro hiển thị dữ liệu cache cũ khi có lỗi mạng tạm thời, vi phạm trực tiếp ràng buộc CB-SYS-006.
- Không có test case nào của Mobile verify hành vi real-time bắt buộc này, đơn giản vì tài liệu Mobile chưa yêu cầu nó một cách tường minh.

### 5. Đề xuất giải quyết

Bổ sung dòng ràng buộc tường minh tương đương Web vào INTEG-MOB: override `fetchPolicy` thành `no-cache`/tương đương cho riêng `getPartnerLinkRequestDetail` — đề xuất, chưa có xác nhận từ Architecture Mobile.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung dòng ràng buộc tường minh tương đương Web vào INTEG-MOB — yêu cầu override `fetchPolicy` thành `no-cache` (hoặc tương đương) riêng cho `getPartnerLinkRequestDetail`.
- (b) Xác nhận rằng `networkOnly` mặc định đã đủ đáp ứng CB-SYS-006 trong thực tế (vì luôn đọc network trước khi trả kết quả), nên không cần override thêm.

### 8. Owner

Mobile Lead + Backend Lead (xác nhận chính sách cache là quyết định kỹ thuật riêng cho mobile, cần đối chiếu ngược lại với backend về mức độ real-time cần thiết)

### 9. Trạng thái

ĐANG MỞ

## RR-044 [Trung bình] Thiếu phủ — Mobile không có UI xử lý lỗi tải danh sách yêu cầu liên kết ban đầu

### 1. Trích dẫn nguồn

- **File**: [INTEG-MOB-garage-mobile-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md#L172-L195) (toàn bộ bảng §3.6, 14 dòng UI action); đối chiếu [INTEG-FE-garage-web-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md#L332)
- **Section**: INTEG-MOB §3.6 (14 dòng UI action); INTEG-FE dòng 332 (banner lỗi list của Web)
- **Dòng**: 172-195; 332

### 2. Bối cảnh nghiệp vụ

Web đã có UI xử lý tường minh khi `listPartnerLinkRequests` thất bại: hiển thị banner lỗi kèm nút "Tải lại". Mobile dùng chung đúng 1 operation `listPartnerLinkRequests` này (đã xác nhận cùng shape dữ liệu tại `agg-garage-graph-graphql.md` §3k.4), nhưng bảng §3.6 của INTEG-MOB liệt kê 14 dòng UI action mà không có dòng nào tương đương dòng UI lỗi-list của Web.

### 3. Vấn đề cụ thể

Không có dòng mapping nào trong 14 dòng UI action của Mobile mô tả việc xử lý khi danh sách yêu cầu liên kết tải thất bại.

### 4. Ảnh hưởng nếu không giải quyết

- Mobile có thể hiển thị màn hình trắng, bị crash, hoặc rơi vào error boundary chung chung không có thông điệp tiếng Việt phù hợp khi API lỗi ngay lúc nhân viên mở tab "Liên kết" lần đầu.
- Trải nghiệm giữa Web và Mobile không đối xứng cho cùng 1 kịch bản lỗi của cùng 1 operation.

### 5. Đề xuất giải quyết

Bổ sung 1 dòng UI mapping cho Mobile tương đương Web: empty-state/banner lỗi + nút "Tải lại" — đề xuất, chưa có xác nhận từ UX Mobile.

### 6. Liên kết với các phát hiện khác

Cùng nhóm thiếu đối xứng Web/Mobile với RR-043.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung 1 dòng UI mapping cho Mobile tương đương Web, gồm empty-state/banner lỗi và nút "Tải lại".
- (b) Xác nhận Mobile đã có sẵn error boundary chung ở tầng app-shell xử lý được trường hợp này, nên không cần đặc tả riêng cho tab Liên kết.

### 8. Owner

Mobile Lead + Product Designer (bổ sung UI lỗi cho mobile là quyết định thiết kế + kỹ thuật riêng cho mobile)

### 9. Trạng thái

ĐANG MỞ

## RR-045 [Trung bình] Thiếu phủ — Không có cơ chế phát hiện Driver Plus ngừng gửi message hoàn toàn ở phía producer

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L227-L233) (bảng Metrics); [dòng 253](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L253) (alert lag inbound); [dòng 313](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L313) (runbook D+ ngừng consume)
- **Section**: §8 Metrics; §8 Alert; §13 Runbook
- **Dòng**: 227-233; 253; 313
- **Quote nguyên văn**:
> "Consumer lag inbound | > 5 phút | P2" (dòng 253)
>
> "Driver Plus ngừng consume (lag tăng) | Không có hành động phía GMS — outbound đã ở Kafka, D+ tự catch-up. Escalate D+ team nếu lag > 1h" (dòng 313 — chỉ có runbook cho D+ ngừng CONSUME, không có cho D+ ngừng PRODUCE)

### 2. Bối cảnh nghiệp vụ

Toàn bộ cơ chế alert/metric hiện có ở §8/§13 của INTEG-EXT đều dựa trên tiền đề có message TỒN TẠI trong hệ thống — ví dụ "Consumer lag inbound > 5 phút" được cấu hình mức P2, và runbook hiện tại chỉ định nghĩa cho trường hợp "Driver Plus ngừng consume" (lag tăng phía họ): "Không có hành động phía GMS — outbound đã ở Kafka, D+ tự catch-up. Escalate D+ team nếu lag > 1h".

### 3. Vấn đề cụ thể

Runbook này chỉ xử lý trường hợp Driver Plus ngừng CONSUME, chứ không có runbook nào cho trường hợp Driver Plus ngừng hoạt động hoàn toàn ở phía PRODUCER — tức là không gửi bất kỳ event `PARTNER_LINK.REQUEST.CREATE`/`BOOKING.CREATE.REQUEST` nào trong nhiều giờ liền do sự cố ngoài kiểm soát. Vì lag được tính bằng khoảng cách giữa message đã publish và message đã consume, nếu không có message nào được publish thì cũng không có lag nào để đo — GMS hoàn toàn không có tín hiệu.

### 4. Ảnh hưởng nếu không giải quyết

- Garage và đội vận hành không hề biết Driver Plus đang gặp sự cố cho tới khi có khiếu nại từ người dùng cuối — hoàn toàn ở thế bị động.
- Không thể phân biệt được "không có booking mới vì thực sự không có nhu cầu" với "không có booking mới vì Driver Plus đang down" chỉ bằng cách nhìn vào dashboard hiện có.

### 5. Đề xuất giải quyết

Bổ sung 1 alert dựa trên baseline lịch sử (VD "0 message inbound trong N giờ liên tiếp, trong khi trung bình lịch sử > X message/giờ") thay vì chỉ dựa trên lag — đề xuất kỹ thuật, chưa có xác nhận từ Architecture.

### 6. Liên kết với các phát hiện khác

Liên quan RR-033 (không có cơ chế Driver+ tự query lại) và RR-036 (thiếu SLA cảnh báo retry hết) — cùng chủ đề thiếu observability 2 chiều cho tích hợp Driver Plus.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung 1 alert dựa trên baseline lịch sử — ví dụ "0 message inbound trong N giờ liên tiếp, trong khi trung bình lịch sử lớn hơn X message/giờ" — thay vì chỉ dựa vào lag.
- (b) Chấp nhận rủi ro này, coi việc giám sát và tự báo cáo sự cố là trách nhiệm thuộc về phía Driver Plus.

### 8. Owner

DevOps/SRE Lead + Solution Architect (giám sát producer-side silence là quyết định vận hành/kiến trúc giám sát)

### 9. Trạng thái

ĐANG MỞ

## RR-046 [Thấp] Thiếu phủ — Chưa có schema registry, contract test dựa hoàn toàn vào fixture thủ công

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L303) (Contract test); [dòng 370](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L370) (Change Log v1)
- **Section**: §11 Testing strategy (Contract test); Change Log
- **Dòng**: 303; 370
- **Quote nguyên văn**:
> "Contract test | So sánh payload sample trong gf-system-events.md §3.11–§3.14 / gf-sales-events.md §3.8/§3.9 với fixture do Driver Plus cung cấp. Chưa có schema registry — contract test dựa trên fixture thủ công (Open Question)."

### 2. Bối cảnh nghiệp vụ

Chiến lược testing hiện tại (§11) mô tả contract test bằng cách so sánh payload sample trong `gf-system-events.md`/`gf-sales-events.md` với fixture do Driver Plus cung cấp thủ công — chưa có schema registry nào đứng giữa. Bản thân tài liệu đã tự nhận đây là Open Question, và Change Log v1 cũng ghi nhận việc "flag gap schema registry cho contract test vào Open Questions của wave", nhưng gap này chưa từng xuất hiện trong 12 finding gốc của Gap Review.

### 3. Vấn đề cụ thể

Vì không có schema registry, khi Driver Plus âm thầm đổi field hoặc đổi kiểu dữ liệu phía họ, GMS chỉ phát hiện ra khi fixture thủ công đã lỗi thời — nghĩa là phát hiện muộn, lúc lỗi runtime đã xảy ra, thay vì phát hiện sớm ngay tại CI.

### 4. Ảnh hưởng nếu không giải quyết

- Tình trạng schema drift giữa GMS và Driver Plus không được test tự động phát hiện sớm.
- Rủi ro tích lũy dần theo thời gian khi cả 2 phía độc lập thay đổi payload mà không có cơ chế đối chiếu tự động.

### 5. Đề xuất giải quyết

Cân nhắc schema registry (VD JSON Schema + versioning) làm CR riêng cho wave sau — đây là gap đã tự nhận, chỉ cần đưa chính thức vào Gap Review để không bị quên khi lập kế hoạch wave tiếp theo.

### 6. Liên kết với các phát hiện khác

Liên quan RR-047 (không có rule xử lý `eventVersion` mismatch) — cùng chủ đề quản lý contract version với đối tác ngoài.

### 7. Câu hỏi cho người dùng

- (a) Đưa việc đầu tư schema registry vào backlog như một CR riêng cho wave sau, đúng như tài liệu đã tự đề xuất.
- (b) Chấp nhận rủi ro dài hạn này, tiếp tục duy trì cách làm fixture thủ công như hiện tại.

### 8. Owner

Backend Lead + Solution Architect (đầu tư schema registry là quyết định kỹ thuật/kiến trúc dài hạn, đã tự nhận là Open Question)

### 9. Trạng thái

ĐANG MỞ

## RR-047 [Thấp] Biên — Không có rule xử lý khi `data.eventVersion` trong envelope Kafka khác giá trị hiện tại "1.0"

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L37) (API version pinned); [dòng 147](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L147) (envelope mẫu); [dòng 320](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L320) (unrecognized MessageStep)
- **Section**: §3 Contract versioning; envelope mẫu; §13 Runbook lỗi consumer
- **Dòng**: 37; 147; 320
- **Quote nguyên văn**:
> "API version pinned | Không có version HTTP. Contract version hoá qua data.eventVersion (1.0) + MessageStep..." (dòng 37)
>
> "Unrecognized MessageStep | Ack + log warning; KHÔNG throw (tránh poison partition). Đây là hành vi mặc định của cả 2 consumer." (dòng 320 — chỉ có rule cho MessageStep lạ, không có cho eventVersion khác)

### 2. Bối cảnh nghiệp vụ

Vì API không có version HTTP, `data.eventVersion` (hiện đang là "1.0") là cơ chế version hoá contract chính giữa GMS và Driver Plus, đi kèm `MessageStep`. Tài liệu đã định nghĩa rõ hành vi khi `MessageStep` không nhận dạng được: "Ack + log warning; KHÔNG throw (tránh poison partition)" — áp dụng cho cả 2 consumer.

### 3. Vấn đề cụ thể

Không có rule tương đương cho trường hợp `eventVersion` khác giá trị hiện tại. Nếu Driver Plus tự nâng cấp payload và gửi `eventVersion` khác "1.0" (VD "2.0"), không rõ consumer sẽ: (a) vẫn cố parse theo schema 1.0 hiện tại — rủi ro parse sai hoặc exception, hay (b) có bước kiểm tra tường minh và ack+skip tương tự cách xử lý `MessageStep` lạ.

### 4. Ảnh hưởng nếu không giải quyết

- Chưa có kế hoạch backward-compatibility rõ ràng cho trường hợp Driver Plus đổi schema trong tương lai.
- Có rủi ro exception không kiểm soát xảy ra tại consumer khi field mới hoặc field đổi kiểu xuất hiện trong payload thuộc version cao hơn.

### 5. Đề xuất giải quyết

Bổ sung rule tương tự `MessageStep` lạ: nếu `eventVersion` không thuộc tập version đã hỗ trợ, ack + log warning, không throw — đề xuất theo nhất quán với pattern đã có, chưa có xác nhận từ Architecture.

### 6. Liên kết với các phát hiện khác

Liên quan RR-046 (schema registry).

### 7. Câu hỏi cho người dùng

- (a) Bổ sung rule tương tự cách xử lý `MessageStep` lạ: nếu `eventVersion` không thuộc tập version đã hỗ trợ, ack + log warning, không throw.
- (b) Xác nhận `eventVersion` hiện tại là một hằng số cố định, chưa có kế hoạch thay đổi trong tương lai gần, nên chưa cần bổ sung rule này.

### 8. Owner

Backend Lead + Solution Architect (quy tắc xử lý version envelope là quyết định kỹ thuật/kiến trúc event)

### 9. Trạng thái

ĐANG MỞ

## RR-048 [Trung bình] Thiếu phủ — KG (`gf-system`/`gf-sales`) và `SERVICE-BOUNDARY-MATRIX` chưa backfill Partner Link, tự ARCH-REVIEW-W07 đánh dấu UNVERIFIED

### 1. Trích dẫn nguồn

- **File**: [ARCH-REVIEW-W07.md](../../../requirements/gara/wave-07/tracking/ARCH-REVIEW-W07.md#L23) (G9 KG consistency); [dòng 45](../../../requirements/gara/wave-07/tracking/ARCH-REVIEW-W07.md#L45) (SERVICE-BOUNDARY-MATRIX); [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L106) (Entry Criteria checkbox)
- **Section**: G9 (không nằm trong bảng Summary/Findings chính thức, là mục riêng "UNVERIFIED"); observation SERVICE-BOUNDARY-MATRIX; PKG-W07 Entry Criteria
- **Dòng**: 23; 45; 106
- **Quote nguyên văn**:
> "G9 KG consistency | UNVERIFIED | New entities (partner_link_request, tenant_profile) and 9 new events introduced this wave, but Execution/knowledge-graphs/gf-system.knowledge-graph.yaml / gf-sales.knowledge-graph.yaml are not in the 14 changed files... recommend Leader confirm with the author's actual return JSON that needs_kg_update includes both boundaries before /dev-start." (ARCH-REVIEW-W07.md dòng 23)
>
> "- [ ] KG update scope gf-system + gf-sales được tạo trước DEV; SERVICE-BOUNDARY-MATRIX module Partner Link được backfill theo governance." (PKG-W07 dòng 106)

### 2. Bối cảnh nghiệp vụ

ARCH-REVIEW-W07 tổng kết P0=0/P1=0/P2=2 — đọc lướt qua bảng Summary dễ khiến người đọc kết luận rằng không còn gì phải lo. Nhưng mục "G9 KG consistency" và mục "Pre-existing/out-of-scope observations" (về SERVICE-BOUNDARY-MATRIX chưa backfill) lại nằm ngoài bảng Summary/Findings chính thức — chúng là một mục riêng được đánh dấu "UNVERIFIED", dễ bị bỏ sót nếu chỉ đọc phần tổng kết. Bản thân tài liệu cũng ghi rõ lý do không chấm P1 là vì việc này "khớp pattern đã thiết lập của repo" (KG sync thường xảy ra lúc DEV/source-audit, không phải lúc DESIGN) — nhưng vẫn giữ nguyên là một open item cần Leader xác nhận trước khi chạy `/dev-start`.

### 3. Vấn đề cụ thể

PKG-W07 đã tự đưa 2 mục này vào Entry Criteria dưới dạng checkbox chưa tick ("- [ ] KG update scope gf-system + gf-sales được tạo trước DEV; SERVICE-BOUNDARY-MATRIX module Partner Link được backfill theo governance.") — nghĩa là tại thời điểm review, đây vẫn là một gate CHƯA được xác nhận đóng, không chỉ đơn thuần "để dành xử lý sau". Tuy vậy, 12 finding gốc của Gap Review chưa từng đối chiếu tới mục này.

### 4. Ảnh hưởng nếu không giải quyết

- `/dev-start` có thể được chạy dù knowledge graph (`gf-system`, `gf-sales`) chưa thực sự được cập nhật để phản ánh 2 bảng mới (`partner_link_request`, `tenant_profile`) và 9 event mới — gây rủi ro cho các wave sau khi tra cứu KG bị thiếu thông tin.
- `SERVICE-BOUNDARY-MATRIX` chưa liệt kê "Partner Link" ở boundary `gf-system` — tạo nguy cơ nhầm lẫn về ownership khi có wave khác sau này chạm vào cùng domain.

### 5. Đề xuất giải quyết

Leader xác nhận với return JSON thật của `agent-arch-author` rằng `needs_kg_update` đã bao gồm cả 2 boundary trước khi cho phép `/dev-start`, đồng thời backfill `SERVICE-BOUNDARY-MATRIX` — đây là action item quy trình đã được chính ARCH-REVIEW-W07 khuyến nghị, không phải đề xuất mới của agent.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này — đây là gap về quy trình/governance, không phải nghiệp vụ.

### 7. Câu hỏi cho người dùng

- (a) Xác nhận đã hoàn tất backfill KG và SERVICE-BOUNDARY-MATRIX trước khi tick Entry Criteria, để cho phép chạy `/dev-start`.
- (b) Ghi nhận đang chờ Leader xác nhận, chưa thể tick Entry Criteria — cần tiếp tục theo dõi trước khi bắt đầu DEV.

### 8. Owner

Solution Architect (đây là Entry Criteria kiến trúc do chính ARCH-REVIEW-W07 tự đánh dấu UNVERIFIED, thuộc thẩm quyền Solution Architect chốt trước go-live)

### 9. Trạng thái

ĐANG MỞ

## RR-049 [Trung bình] Mơ hồ — Success Metric #3 (EP-PARTNER-LINK) trộn "Từ chối do user" và "auto-reject cascade" trong mẫu số, làm sai lệch ý nghĩa đo lường

### 1. Trích dẫn nguồn

- **File**: [EP-PARTNER-LINK.md](../../../requirements/gara/wave-07/Product/epics/EP-PARTNER-LINK.md#L144) (Success Metric #3); [dòng 86](../../../requirements/gara/wave-07/Product/epics/EP-PARTNER-LINK.md#L86) (mô tả cascade auto-reject)
- **Section**: §6 Success Metric; §3 (mô tả cascade)
- **Dòng**: 144; 86
- **Quote nguyên văn**:
> "Tỷ lệ yêu cầu bị Từ chối có nhập lý do (không rỗng) | >= 95% | Số LKD Từ chối có lý do / tổng Từ chối (đo consistency thao tác...)" (dòng 144)
>
> "(lý do: system-generated, không cần user nhập)" (dòng 86, mô tả rule cascade auto-reject)

### 2. Bối cảnh nghiệp vụ

Success Metric #3 của EP-PARTNER-LINK có mục đích ghi rõ ngay trong công thức là "đo consistency thao tác" — tức đo hành vi của NGƯỜI DÙNG có nhập lý do đầy đủ khi Từ chối hay không: "Số LKD Từ chối có lý do / tổng Từ chối >= 95%". Nhưng status `REJECTED` trong hệ thống thực ra sinh ra từ 2 nguồn khác nhau: (a) nhân viên garage chủ động bấm Từ chối, với lý do bắt buộc non-empty được cả UI lẫn BE enforce chặt chẽ, và (b) cascade auto-reject của hệ thống, với reason là text system-generated — "không cần user nhập".

### 3. Vấn đề cụ thể

Việc trộn cả 2 nguồn vào chung 1 mẫu số "tổng Từ chối" khiến kết quả luôn gần 100% bất kể hành vi người dùng thực tế ra sao: nhánh (a) luôn xấp xỉ 100% vì validation chặn triệt để không có đường nào bỏ qua lý do, còn nhánh (b) luôn có reason (vì là system-generated, không bao giờ rỗng). Kết quả là con số này không phản ánh đúng mục đích "đo consistency thao tác" đã nêu ngay trong chính công thức.

### 4. Ảnh hưởng nếu không giải quyết

- Metric này bị vô hiệu hoá về mặt thống kê ngay từ khâu thiết kế — không tạo ra bất kỳ tín hiệu hữu ích nào để theo dõi chất lượng thao tác thực tế của nhân viên.
- Nếu sau này có báo cáo/dashboard implement đúng theo công thức này, kết quả sẽ gây hiểu nhầm về "chất lượng dữ liệu", trong khi thực chất con số đó không đo được điều gì có ý nghĩa.

### 5. Đề xuất giải quyết

Loại trừ cascade auto-reject khỏi mẫu số (chỉ tính "Từ chối do user chủ động"), hoặc đổi lại mục đích metric thành "tỷ lệ Từ chối có lý do" thuần túy mô tả (không gắn nhãn "đo consistency") — đề xuất, chưa có xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Cùng nhóm Success Metric với RR-050.

### 7. Câu hỏi cho người dùng

- (a) Sửa lại công thức để loại trừ cascade auto-reject khỏi mẫu số, chỉ tính "Từ chối do người dùng chủ động".
- (b) Giữ nguyên công thức hiện tại, nhưng sửa lại mục đích mô tả — bỏ nhãn "đo consistency thao tác" vì không còn đúng bản chất.
- (c) Đưa quyết định này lên Business Authority vì đây là lựa chọn ảnh hưởng tới cách đo lường thành công của epic.

### 8. Owner

Business Authority (định nghĩa lại công thức đo lường success metric là quyết định thuộc thẩm quyền kinh doanh)

### 9. Trạng thái

ĐANG MỞ

## RR-050 [Thấp] Thiếu phủ — Cả 3 Success Metric của EP-PARTNER-LINK không có AC/cơ chế đo lường-báo cáo nào được định nghĩa

### 1. Trích dẫn nguồn

- **File**: [EP-PARTNER-LINK.md](../../../requirements/gara/wave-07/Product/epics/EP-PARTNER-LINK.md#L138-L144) (toàn bộ §6 Success Metric, 3 hàng); đối chiếu [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L51895-L51907) (`type PartnerLinkRequest`)
- **Section**: §6 Success Metric; SDL `PartnerLinkRequest`
- **Dòng**: 138-144; 51895-51907

### 2. Bối cảnh nghiệp vụ

EP-PARTNER-LINK định nghĩa 3 Success Metric: "Tỷ lệ xử lý trong 24h", "Tỷ lệ garage có ít nhất 1 liên kết Đã liên kết", và "Tỷ lệ Từ chối có lý do". Cả 3 đều có công thức đo cụ thể, và dữ liệu thô cần thiết để tính (`requestedAt`, `processedAt`, `status`, `reason`) thực sự đã tồn tại sẵn trong schema `PartnerLinkRequest`.

### 3. Vấn đề cụ thể

Không có bất kỳ AC nào ở `FEAT-SYS-DRIVERPLUS-LINK` hay ở PKG-W07 mô tả việc tính toán/lưu trữ/hiển thị các tỷ lệ này — không có dashboard, không có cron job báo cáo, cũng không có cơ chế export. Dữ liệu thô đã tồn tại, nhưng không có bất kỳ cơ chế nào biến nó thành metric thực sự theo dõi được sau go-live.

### 4. Ảnh hưởng nếu không giải quyết

Sau go-live, sẽ không ai thực sự đo được các Success Metric mà epic đã cam kết — việc epic "thành công" hay "thất bại" theo đúng tiêu chí đã đặt ra sẽ không thể xác minh được, ngoại trừ cách truy vấn DB thủ công mỗi lần cần biết.

### 5. Đề xuất giải quyết

Bổ sung 1 AC hoặc yêu cầu riêng (ngoài phạm vi feature UI) cho cơ chế báo cáo định kỳ (dashboard/query có sẵn cho Business Authority) — đề xuất, chưa có xác nhận, có thể để CR riêng do không ảnh hưởng chức năng core.

### 6. Liên kết với các phát hiện khác

Cùng nhóm Success Metric với RR-049.

### 7. Câu hỏi cho người dùng

- (a) Bổ sung một cơ chế đo lường/báo cáo cho 3 Success Metric này trong phạm vi Wave 07.
- (b) Chấp nhận đo thủ công qua truy vấn DB sau go-live, không cần xây dashboard riêng trong Wave 07.

### 8. Owner

Business Authority (thiết kế cơ chế đo lường-báo cáo sau go-live là quyết định kinh doanh/vận hành báo cáo)

### 9. Trạng thái

ĐANG MỞ

## RR-051 [Thấp] Mơ hồ — PKG-W07 Entry Criteria trích dẫn phiên bản cũ (v3) của `INTEG-EXT-driver-plus.md` dù tài liệu hiện tại đã lên v5

### 1. Trích dẫn nguồn

- **File**: [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L102) (Entry Criteria); đối chiếu [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L5) (frontmatter version 5) và [Change Log dòng 366-370](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L366-L370)
- **Section**: PKG-W07 Entry Criteria; INTEG-EXT frontmatter + Change Log v3/v4/v5
- **Dòng**: 102; 5; 366-370
- **Quote nguyên văn**:
> "- [ ] ADR-029 + ADR-030 ACCEPTED; INTEG-EXT-driver-plus.md v3; ..." (PKG-W07 dòng 102)

### 2. Bối cảnh nghiệp vụ

`INTEG-EXT-driver-plus.md` đã có 5 lần version bump cùng trong ngày 2026-08-10, trong đó v4-v5 bổ sung nội dung "Document sync" và fix một vấn đề P0 về boundary isolation liên quan tới phần document sync đó — còn nội dung §4.1/§4.2 (partner link + booking relay, phần thực sự liên quan tới Wave 07) không hề thay đổi giữa v3 và v5.

### 3. Vấn đề cụ thể

PKG-W07 cũng có 5 lần version bump trong cùng ngày, nhưng không lần nào cập nhật lại số phiên bản được pin trong Entry Criteria — mục Entry Criteria vẫn ghi "INTEG-EXT-driver-plus.md v3", trong khi tài liệu được tham chiếu thực tế đã lên tới v5.

### 4. Ảnh hưởng nếu không giải quyết

Rủi ro thấp về mặt chức năng vì nội dung liên quan tới Wave 07 không thay đổi qua các version, nhưng gây khó khăn khi audit thủ công xem entry criteria đã thoả mãn hay chưa dựa theo đúng số phiên bản ghi trong tài liệu — đặc biệt bất lợi nếu sau này có công cụ audit tự động dựa trên string-match version.

### 5. Đề xuất giải quyết

Cập nhật Entry Criteria trong PKG-W07 để trích dẫn đúng version hiện tại (v5) — đây là sửa lỗi cosmetic đơn giản, không cần quyết định nghiệp vụ.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

- (a) Cập nhật lại Entry Criteria trong PKG-W07 để trích dẫn đúng version hiện tại (v5).
- (b) Chấp nhận giữ nguyên như hiện tại, vì rủi ro thấp và không ảnh hưởng tới nội dung nghiệp vụ.

### 8. Owner

Business Authority/Solution Architect (cập nhật lại citation tài liệu là vấn đề quản lý tài liệu, thuộc trách nhiệm người duy trì Entry Criteria)

### 9. Trạng thái

ĐANG MỞ

### 7.3. Khuyến nghị

> Cập nhật 2026-08-11: đã bổ sung 39 finding mới (RR-013 → RR-051) sau đợt rà soát lại toàn bộ 29 tài liệu nguồn wave-07 theo đúng 6 dimension × 5 lăng kính của skill `requirements_analyzer`. Tổng cộng tài liệu hiện có 51 finding (0 `[Chặn]`, 14 `[Cao]`, 27 `[Trung bình]`, 10 `[Thấp]`). Đáng chú ý: 3 cặp finding mới (RR-015/RR-029, RR-027, RR-028) phát hiện được bằng cách verify chéo trực tiếp (grep/Glob) chứ không chỉ đọc — cho thấy các mã lỗi `ERR-DPL-003`/`ERR-BOOK-001`/`ERR-BOOK-002` được Product/Architecture khẳng định "đã đăng ký" nhưng thực tế vắng mặt trong API contract/registry, và file `gf-sales-data-model.md` được trích dẫn liên tục nhưng không tồn tại trong repo — cùng RR-027 (mâu thuẫn 14 vs 15 trường payload) và RR-031 (schema `BOOKING.UPDATE.RESPONSE` có thể không mang đúng nội dung đã hứa). Đây là các gap có bằng chứng xác đáng nhất, nên ưu tiên xử lý trước.

SẴN SÀNG sinh TC — 0 finding mức `[Chặn]` còn mở. 14 finding mức `[Cao]` (RR-001, RR-002, RR-003, RR-008, RR-010, RR-013, RR-014, RR-015, RR-027, RR-028, RR-029, RR-030, RR-031, RR-040) nên được làm rõ trước khi viết test case cho đúng các nhánh liên quan — trong đó nhóm ưu tiên cao nhất là các mâu thuẫn/tài liệu-thiếu có thể verify trực tiếp: số trường payload inbound (14 vs 15 — RR-027), file schema DB không tồn tại (RR-028), 2 mã lỗi Booking chưa đăng ký registry (RR-029), mã lỗi Partner Link `ERR-DPL-003` vắng mặt trong API (RR-015), payload thật của `BOOKING.UPDATE.RESPONSE` (RR-031), validate bước 15 phút khi Edit booking D+ (RR-030), kill-switch giữa phiên (RR-040), cùng nhóm gốc consent/sanitize/right-to-erasure/NO_SHOW đã nêu trước đó (RR-001, RR-002, RR-003, RR-008, RR-010) và 2 gap ack/sanitize mới cho luồng inbound WITHDRAW/UNLINK (RR-013, RR-014). Các nhánh còn lại của package vẫn có thể tiến hành sinh TC bình thường.

### 7.4. Phân loại theo tác động

Theo đúng mục 5.7 của skill `requirements_analyzer`, toàn bộ 51 finding được phân theo tác động thực tế (nhãn `TC` / `UX` / `Khác`) để người đọc lọc nhanh finding nào cần ưu tiên xử lý cho mục đích nào. Nhãn này độc lập với Mức độ (`[Cao]`/`[Trung bình]`/`[Thấp]`).

Nhóm TC — Ảnh hưởng trực tiếp tới viết Test Case (23 finding): finding khiến không có oracle rõ ràng để biết TC nên assert PASS hay FAIL, hoặc dữ liệu/mã lỗi mâu thuẫn giữa các nguồn khiến TC viết theo 1 nguồn sẽ assert sai.

| Mã | Mức độ | Vì sao chặn/ảnh hưởng viết TC |
|---|---|---|
| RR-002 | Cao | "Lý do" free text không có yêu cầu sanitize — TC bảo mật (XSS) thiếu expected behavior |
| RR-003 | Cao | Không có AC cho việc xóa dữ liệu khi Hủy liên kết — không viết được TC cho hành vi này |
| RR-007 | Trung bình | AC-15 không rõ có lọc theo nguồn booking — không biết TC booking non-D+ nên PASS hay FAIL |
| RR-008 | Cao | "Loại dịch vụ" vừa enum vừa "nguyên văn" — không biết TC nhập giá trị lạ nên expect reject hay accept |
| RR-009 | Trung bình | "Ngày hẹn" không validate quá khứ/tương lai — thiếu oracle cho TC biên |
| RR-010 | Cao | Ngưỡng NO_SHOW_AUTO chưa định nghĩa — không viết được TC xác định cho toàn nhánh |
| RR-011 | Trung bình | Outbox event trước khi flag off — chưa rõ hành vi để thiết kế TC toggle kill-switch |
| RR-013 | Cao | "Lý do" WITHDRAW/UNLINK (D+→GMS) không sanitize — thiếu oracle bảo mật, tương tự RR-002 |
| RR-014 | Cao | Không có ack cho WITHDRAW/UNLINK — không verify được integration test cho race condition |
| RR-015 | Cao | `ERR-DPL-003` không có trong API — TC viết theo BR sẽ assert sai mã lỗi |
| RR-017 | Trung bình | Kill-switch không rõ hành vi với WITHDRAW/UNLINK — thiếu oracle TC edge case |
| RR-018 | Trung bình | Payload vượt độ dài cột DB không rõ hành vi — thiếu oracle TC biên |
| RR-019 | Trung bình | Request_code trùng nhưng nội dung khác — thiếu oracle TC |
| RR-021 | Trung bình | Cột `version` mô tả cơ chế khác API — không biết test race condition kiểu optimistic-lock hay 409 |
| RR-022 | Trung bình | Escaping `notification.message` chưa định nghĩa — thiếu oracle TC ký tự đặc biệt |
| RR-027 | Cao | 14 vs 15 trường payload mâu thuẫn — TC theo Product sẽ sai số field cần assert |
| RR-028 | Cao | File schema DB Booking không tồn tại — thiếu đặc tả kiểu/độ dài để viết TC biên |
| RR-029 | Cao | `ERR-BOOK-001`/`002` chưa đăng ký registry — TC assert sai mã lỗi |
| RR-030 | Cao | AC-8 (Edit) không validate bước 15 phút — thiếu oracle khi TC sửa giờ hẹn booking D+ |
| RR-031 | Cao | Payload `BOOKING.UPDATE.RESPONSE` chưa rõ cấu trúc — không biết assert nội dung gì |
| RR-038 | Trung bình | `vehicleImages` không giới hạn số lượng — thiếu oracle TC biên |
| RR-043 | Trung bình | Mobile không rõ có thật sự no-cache — không chắc TC verify real-time PASS/FAIL thế nào |
| RR-047 | Thấp | `eventVersion` mismatch chưa có rule — thiếu oracle TC |

Nhóm UX — Liên quan hành vi người dùng thực tế (13 finding): finding về trải nghiệm/thao tác thật của end-user (garage staff, khách hàng D+) trên UI — kể cả khi TC vẫn viết được, hành vi mà user thấy chưa được đặc tả rõ.

| Mã | Mức độ | Hành vi người dùng bị ảnh hưởng |
|---|---|---|
| RR-001 | Cao | User dùng bàn phím/screen-reader có thể bị khóa vĩnh viễn khỏi action "Duyệt" (cơ chế cuộn-đến-cuối không nhận thao tác phím) |
| RR-006 | Trung bình | User không được cảnh báo khi danh sách bị cắt bớt (vượt 500 dòng) |
| RR-012 | Trung bình | Garage cũ Duyệt liên kết "thành công" nhưng không biết dữ liệu gửi đi thực chất rỗng |
| RR-016 | Trung bình | Notification gửi Driver Plus có thể hiện "{Tên garage}" rỗng/null — trải nghiệm xấu phía đối tác nhận |
| RR-023 | Thấp | User F5 reload trang, không rõ filter đang chọn có bị mất hay giữ |
| RR-026 | Thấp | User mobile mở lại app sau khi bị kill — có thể thao tác trên dữ liệu cũ mà không hay biết |
| RR-032 | Trung bình | Garage được hứa thấy "Loại dịch vụ" D+ trên Danh sách/Chi tiết nhưng chưa có UI hiển thị |
| RR-034 | Trung bình | Khách hàng bấm đặt lịch 2 lần (double-tap) tạo 2 booking trùng, garage không được cảnh báo |
| RR-035 | Trung bình | Khách hủy lịch trên D+ nhưng garage có thể không được thông báo để xử lý |
| RR-040 | Cao | User đang thao tác đúng lúc admin bật kill-switch — thấy lỗi generic không rõ nghĩa |
| RR-041 | Trung bình | User mở màn chi tiết đúng lúc dữ liệu đổi (race) — có thể thấy màn trắng/crash |
| RR-042 | Trung bình | User gặp lỗi khi xem chi tiết — banner lỗi toàn màn hình có thể che luôn panel danh sách đang hoạt động tốt |
| RR-044 | Trung bình | User Mobile gặp lỗi tải danh sách lần đầu — không có UI xử lý |

Nhóm Khác — không thuộc 2 nhóm trên (15 finding): compliance/pháp lý (DPA, i18n), vận hành/monitoring nội bộ (alert, retention DB, schema registry), hoặc governance/tài liệu (KG backfill, version citation, đặt tên file, công thức metric báo cáo) — không chặn việc viết TC chức năng và không phải hành vi user trực tiếp nhìn thấy trên UI.

RR-004, RR-005, RR-020, RR-024, RR-025, RR-033, RR-036, RR-037, RR-039, RR-045, RR-046, RR-048, RR-049, RR-050, RR-051.

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
