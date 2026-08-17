# 📋 Phân Tích Requirement: PKG-W07

## Partner Link + Booking relay + Document sync Driver Plus (Gara Wave 7)

> Nguồn phân tích: `requirements/gara/wave-07/` — bản refresh 2026-08-14, đồng bộ trực tiếp từ dự án gốc `F:\AC\garage\garage-agentic-design`. Toàn bộ Product layer (PKG, 3 Epic liên quan, 8 Feature, 3 Business Rules) + toàn bộ Architecture layer (3 ADR, 3 HLD, 4 API doc, 3 Event doc, 2 Data model, 1 Integration doc, 2 tài liệu tham chiếu governance) + `tracking/ARCH-REVIEW-W07.md`.
> Không có mockup/screenshot dạng ảnh được cung cấp trực tiếp — chỉ có link Figma tham chiếu (xem mục 6). Không sinh test case trong tài liệu này, đúng phạm vi workflow `/analyze_requirement_document`.
>
> **Đây là bản v3 — phân tích lại hoàn toàn từ đầu, KHÔNG phải bản chỉnh sửa văn phong của v1/v2.** Lý do: bản copy nguồn cục bộ dùng cho v1/v2 (2026-08-11) đã lỗi thời 3 ngày và có 2 file bị copy sai/thiếu (`Product/epics/EP-BOOKING.md` chứa nhầm nội dung `UX-FLOW-BOOKING`; `Architecture/data/gf-sales-data-model.md` chưa từng được copy dù tồn tại ở nguồn) — khiến 3 finding cũ (RR-028, RR-029, RR-039 theo mã v1/v2) là false positive. Ngoài ra, phạm vi `PKG-W07` bản thân đã mở rộng thật sự (version 5 → 10) với 1 nhánh nghiệp vụ hoàn toàn mới — **Document sync** (`gf-sales`/`gf-accounting` gửi phiếu dịch vụ + phiếu quyết toán sang Driver Plus) — trước đây bị liệt kê tường minh là "Ngoài phạm vi W07", nay đã chính thức vào scope. Bản v3 phân tích lại từ đầu (đọc trực tiếp 39 file nguồn mới nhất, không copy lại nội dung phân tích cũ) cho cả 3 nhánh, đối chiếu ngược từng finding cũ với nội dung mới, và bổ sung toàn bộ finding cho nhánh Document sync chưa từng được review. File v1 (`requirements_wave-07.md`) và v2 (`requirements_wave-07-v2.md`) được giữ nguyên để đối chiếu lịch sử — không xoá.

---

## 1. Tổng Quan Ticket

| Field | Value |
|---|---|
| Package ID | `PKG-W07` |
| Title | Partner Link + Booking relay + Document sync Driver Plus |
| Type | Work package (execution) |
| Status | PLANNED |
| Version | 10 (tăng từ 5 tại lần rà soát trước, 2026-08-11) |
| Wave | W07 (timebox 5 ngày, M01 Vertical-Slice) |
| Owner Authority | Delivery Authority |
| Epic liên quan | `EP-PARTNER-LINK` (P1) + `EP-BOOKING` (compatibility hardening cho phần Driver Plus) + Document sync (chưa có Epic riêng, gắn trực tiếp vào PKG qua `FEAT-SO-DETAIL`/`FEAT-STL-CREATE`) |
| Feature core (3) | `FEAT-SYS-DRIVERPLUS-LINK` (P1, boundary `gf-system`) · `FEAT-BOOK-DRIVERPLUS-INBOUND` (P0, boundary `gf-sales`) · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` (P0, boundary `gf-sales`) |
| Feature liên quan mới (Document sync) | `FEAT-SO-DETAIL` AC-17/AC-38 (boundary `gf-sales`) · `FEAT-STL-CREATE` AC-3/AC-4/AC-18 (boundary `gf-accounting`) |
| Feature regression-only | `FEAT-BOOK-EDIT` AC-15 (giữ nguyên `BOOKING.UPDATE.RESPONSE`, không đổi) |
| Boundary bị ảnh hưởng | `gf-system` (Partner Link owner) · `gf-sales` (Booking + phiếu dịch vụ) · `gf-accounting` (phiếu quyết toán, **mới**) · `agg-garage-graph` (BFF) · `garage-web` · `garage-mobile` · Driver Plus (external) |
| Kiến trúc nền | ADR-029 (giao thức Kafka + correlated response event, đã lên v3 — thêm cơ chế resolve tenant qua SĐT/requestCode) · ADR-030 (bảng `tenant_profile` làm SoT) · ADR-031 (đồng bộ chứng từ — **nay đã CHÍNH THỨC trong scope**, không còn là "ngoài phạm vi") |
| Kết quả ARCH-REVIEW-W07 | Không đổi so với lần rà soát 2026-08-11 (P0=0, P1=0, P2=2, `ready_for_sa_ratify = true`) — **quan trọng: kết quả này KHÔNG bao phủ nhánh Document sync**, vì nhánh này được thêm vào sau khi ARCH-REVIEW-W07 đã chạy xong (xem RR-044). |

Package mô tả 3 luồng tích hợp với đối tác ngoài Driver Plus, dùng chung 1 convention envelope Kafka (ADR-029) nhưng thuộc 3 boundary sở hữu nghiệp vụ khác nhau và 3 feature-flag độc lập: (1) garage duyệt/từ chối/hủy yêu cầu liên kết tài khoản Driver Plus và đồng bộ hồ sơ garage sang đối tác; (2) `gf-sales` nhận đặt lịch/hủy lịch từ khách hàng Driver Plus và phản hồi đúng trạng thái ngược lại; (3) **mới** — khi garage hoàn thành phiếu dịch vụ hoặc tạo phiếu quyết toán cho booking nguồn Driver+, `gf-sales`/`gf-accounting` gửi mã phiếu + URL tải tệp để Driver Plus lưu vào hồ sơ số của xe.

## 2. User Story

Package gồm 4 user story cấp Feature (bổ sung 1 so với v1/v2 cho nhánh Document sync):

- FEAT-SYS-DRIVERPLUS-LINK: "Là chủ garage / kế toán, tôi muốn xem danh sách yêu cầu liên kết Driver Plus và duyệt / từ chối / hủy / đồng bộ lại thông tin từng yêu cầu, để tôi có thể kiểm soát tài khoản D+ nào được phép nhận dữ liệu garage của tôi và giữ dữ liệu chia sẻ luôn cập nhật khi hồ sơ garage thay đổi."
- FEAT-BOOK-DRIVERPLUS-INBOUND: "Là hệ thống gf-sales, tôi muốn nhận đúng và đầy đủ yêu cầu đặt lịch / yêu cầu hủy do khách hàng gửi từ ứng dụng Driver+, để garage có lịch hẹn chính xác để xử lý mà không cần khách hàng liên hệ trực tiếp, đồng thời không tự ý suy diễn quyết định thay garage khi có yêu cầu hủy."
- FEAT-BOOK-DRIVERPLUS-OUTBOUND: "Là hệ thống gf-sales, tôi muốn phản hồi lại Driver+ đúng và đầy đủ mỗi khi trạng thái lịch hẹn thay đổi, để khách hàng trên Driver+ luôn thấy đúng trạng thái thực tế của lịch hẹn mà không bị trễ hay sai lệch."
- **Document sync (mới)**: "Là hệ thống gf-sales/gf-accounting, tôi muốn tự động gửi mã phiếu dịch vụ và phiếu quyết toán cùng đường dẫn tải tệp sang Driver Plus ngay khi các phiếu này hoàn tất cho booking nguồn Driver+, để khách hàng trên Driver+ có thể lưu hồ sơ sửa chữa/quyết toán vào hồ sơ số của xe mà garage không phải thao tác thủ công."

## 3. Phạm Vi Áp Dụng (Scope)

| Module / Boundary | Ảnh hưởng | Ghi chú |
|---|---|---|
| `gf-system` — backend Partner Link | Mới hoàn toàn | 2 bảng mới (`partner_link_request`, `tenant_profile`), 6 REST endpoint, 3 inbound + 3 outbound Kafka step; cơ chế resolve tenant qua SĐT/requestCode (ADR-029 v2/v3, mới) |
| `gf-sales` — backend Booking relay | Rewrite additive trên contract production | Không đổi tên step đang chạy; bổ sung 14-trường payload, `cancel_source`, `driverplus_service_type`, step mới `BOOKING.CANCEL.RESPONSE` |
| `gf-sales` + `gf-accounting` — Document sync | **Mới hoàn toàn (nhánh vừa thêm 2026-08-10/11)** | Topic mới `AC-DEV-DOCUMENT-EVENTS`, 2 event outbound 1 chiều (`DOCUMENT.SERVICE_ORDER.SYNC`, `DOCUMENT.SETTLEMENT.SYNC`), gửi mã phiếu + URL tệp (TTL 30 ngày), flag riêng `Document:DriverPlus` |
| `agg-garage-graph` (BFF) | Mới — 6 GraphQL operation (Partner Link) | Passthrough thuần, không cache, không orchestrate; Document sync không cần BFF (thuần backend-to-backend) |
| `garage-web` | Mới — menu "Liên kết" | Layout master-detail, 4 modal action |
| `garage-mobile` (Flutter) | Mới — tab "Liên kết" | Layout card + màn Bộ lọc/chi tiết full-screen riêng, cùng 6 operation với web |
| `garage-web` / `garage-mobile` — module Booking | Regression only | Không có route mới; danh sách/chi tiết booking hiện hữu hiển thị booking nguồn D+ |
| Driver Plus (external) | Đối tác duy nhất giai đoạn 1 | Kênh Kafka 2 chiều (Partner Link + Booking) + 1 chiều (Document sync, GMS → D+), 15 `MessageStep` áp dụng cho W07 (6 partner-link + 5 booking + 4 document sync) |
| `gf-erp-agent` | Không tham gia | Quyết định kiến trúc rõ ràng — không thêm hop trung gian (ADR-029) |

Ngoài phạm vi (explicit, đã chốt):

- UI hiển thị retry/lỗi delivery của cả 3 nhánh — xử lý ngầm ở backend, Web/Mobile không có badge/cảnh báo/nút thử lại.
- Tab "Đối tác khác" (placeholder cho đối tác tương lai ngoài Driver Plus).
- Garage tự tạo yêu cầu liên kết hoặc cấu hình đa-đối tác.
- Đồng bộ ngược booking tạo từ kênh khác (Garage Care/Walk-in) cho khách đã liên kết Driver+.
- Màn quản trị Driver Plus, D+ customer push notification.

## 4. Acceptance Criteria — Phân Tích Chi Tiết

### 4.1. FEAT-SYS-DRIVERPLUS-LINK (43 AC, 14 nhóm A→N, v36)

FEAT-SYS-DRIVERPLUS-LINK hiện có 43 AC (AC-1 đến AC-43) chia thành 14 nhóm (A→N, cộng nhóm K/L/M mới và Nhóm N mobile), phiên bản v36 tính đến 2026-08-12. Có thể gom theo 5 khối chức năng chính: (1) Điều hướng & khung màn hình (AC-1..3, cả web menu "Liên kết" lẫn mobile bottom-nav AC-40); (2) Danh sách + filter (AC-4..7, EC-1, mobile AC-41..42); (3) Form chi tiết 3 section — 1 luôn hiện mọi trạng thái, 1 có điều kiện theo trạng thái (AC-8..11); (4) 4 action nghiệp vụ chính — Duyệt/Từ chối/Đồng bộ lại/Hủy (AC-12..24), mỗi action có modal xác nhận riêng, gate lý do bắt buộc hoặc consent scroll-to-end; (5) Inbound/outbound Driver Plus (Nhóm H/J/K/L/M: re-request AC-25, race condition AC-27/28/31, outbound push fail AC-32, D+ withdraw/unlink AC-33/35, single-active guard AC-34, 4 loại notification AC-36..39).

Điểm mạnh: traceability AC→BR khá tốt — đa số AC đều cite ngược đúng mã BR-DPL-* (đã fix từ đợt BA-review F1 mapping sai trước đây); state guard rõ ràng theo từng trạng thái; đặc tả race condition khá sâu (AC-27/28/31) kèm cơ chế kỹ thuật cụ thể (partial unique index, transaction atomic all-or-nothing); toàn bộ wording notification/toast đã chốt verbatim, không còn "NEED CONFIRMATION"; platform parity Web/Mobile được nêu tường minh — Nhóm N nói rõ phần nào giống 100% web, phần nào khác (chỉ khác ở màn danh sách "bên ngoài").

Điểm cần lưu ý: (a) AC-9/AC-12 vừa trải qua 1 thay đổi ý nghĩa field quan trọng (v35, 2026-08-12) — đổi field "SĐT tài khoản D+ xác minh" thành "SĐT garage dùng để liên kết", phản ánh cơ chế resolve tenant mới theo ADR-029 v2/v3 (D+ không còn tự biết `tenantId` GMS ở bất kỳ step nào). Thay đổi này còn rất mới, cascade tài liệu (gf-system-events, INTEG-EXT, ERROR-CODE-REGISTRY) đã cập nhật nhưng một số hệ luỵ vận hành (backfill `tenant_profile` cho tenant cũ, thứ tự check kill-switch, xử lý match mơ hồ khi resolve theo SĐT) chưa được đặc tả đầy đủ ở tầng Product — xem chi tiết ở mục FINDINGS. (b) Accessibility của scroll-gate checkbox (AC-13) vẫn chỉ mô tả hành vi chuột/scroll, chưa có nhánh bàn phím/screen-reader. (c) Một số AC phụ thuộc hoàn toàn vào quyết định Architecture đã chốt tốt ở tầng ADR (vd retry-exhausted AC-32, cascade atomic AC-16/31) nhưng liên kết ngược từ FEAT sang các gap vận hành mới phát sinh (ADR-029 v3 gap G4) chưa đầy đủ. Nhìn chung FEAT đã ở trạng thái khá chín (v36, nhiều vòng BA-review), nhưng đợt refresh nguồn hôm nay cho thấy domain "resolve tenant qua dữ liệu đối tác ngoài" vẫn đang biến động nhanh (ADR-029 nhảy version 1→3 chỉ trong 1 tuần) và là nơi tập trung phần lớn gap mới.

### 4.2. FEAT-BOOK-DRIVERPLUS-INBOUND (9 AC, 3 nhóm, v7)

**FEAT-BOOK-DRIVERPLUS-INBOUND** (v7, 9 AC chia 3 nhóm A/B/C) đặc tả phía nhận của gf-sales khi Driver+ gửi yêu cầu đặt lịch hoặc hủy. Nhóm A (AC-1..5) phủ luồng tạo booking mới: AC-1 tạo booking trạng thái "Lịch hẹn mới", AC-2 chốt cấu trúc 14 trường (5 bắt buộc + 9 tùy chọn), AC-3 khẳng định "Loại dịch vụ" Driver+ độc lập hoàn toàn với danh mục GMS (đã RESOLVED, đối chiếu FEAT-DP-034 gốc), AC-4 tái dùng cơ chế khớp khách hàng theo SĐT sẵn có, AC-5 xác nhận 9 trường tùy chọn để trống vẫn tạo được booking. Nhóm B (AC-6..8) phủ luồng hủy: AC-6 áp dụng hủy tự động ngay khi đủ điều kiện (không qua duyệt), AC-7 là gate khi booking không đủ điều kiện hủy, AC-8 là nhánh không tìm thấy booking tương ứng. Nhóm C (AC-9) là dedupe theo event_id. Điểm mạnh: mỗi AC đều theo cấu trúc Tại/Khi/Thì nhất quán, có citation rõ tới BR liên quan và tới FEAT-BOOK-DRIVERPLUS-OUTBOUND tương ứng; các marker "RESOLVED"/"NEED CONFIRMATION" cũ đã thực sự được đóng qua nhiều vòng BA-review, Change Log truy vết được đầy đủ từng quyết định qua 7 version. Điểm cần lưu ý: ranh giới "5 trường bắt buộc" ở AC-2 không nói rõ có tính luôn trường định danh kỹ thuật `externalBookingId` hay không (chỉ lộ ra khi đối chiếu với bảng field ở Architecture); cơ chế dedupe AC-9 chỉ giải quyết được case retry mạng cùng 1 event_id, chưa phủ case 2 event_id khác nhau phát sinh từ cùng 1 hành động người dùng (double-tap ở tầng app D+).

### 4.3. FEAT-BOOK-DRIVERPLUS-OUTBOUND (11 AC, 3 nhóm, v5)

**FEAT-BOOK-DRIVERPLUS-OUTBOUND** (v5, 11 AC chia 3 nhóm A/B/C) đặc tả phía gửi. Nhóm A (AC-1..6) đồng bộ trạng thái khi garage xử lý: AC-1..4 map 1-1 với 4 hành động vòng đời (xác nhận/từ chối/xe đến/hủy), AC-4 làm rõ `cancel_source` bắt buộc trong payload gửi D+, AC-5 là gate "không đủ điều kiện" trả về đúng trạng thái thực tế thay vì coi là "từ chối yêu cầu", AC-6 là phản hồi sau khi tạo booking mới thành công. Nhóm B (AC-7..9) là cơ chế retry/dead-letter: AC-7 tự thử lại không rollback state cục bộ, AC-8 hết lượt retry thì chuyển ngoại lệ cho vận hành (không tự suy đoán kết quả), AC-9 đảm bảo `eventId` ổn định qua các lần retry để D+ dedupe đúng. Nhóm C (AC-10..11) là phản hồi từ chối khi request inbound sai (`ERR-BOOK-001`/`ERR-BOOK-002`). Điểm mạnh: phân định rất rõ ràng giữa lỗi tạm thời (retry, không đổi state) và lỗi vĩnh viễn (reject + ack ngay, không retry vô hạn) — đúng best-practice outbox/event-driven; toàn bộ AC đều bám sát đúng 1 trong 3 kênh event (CREATE.RESPONSE / CHANGE.STATUS / CANCEL.RESPONSE). Điểm cần lưu ý: AC-9 khẳng định tính ổn định của `eventId` nhưng không có AC nào mô tả rõ hành vi khi flag `Booking:DriverPlus` bị tắt ngay giữa 1 chu kỳ retry đang chạy dở.

### 4.4. FEAT-BOOK-EDIT AC-15 (regression, không đổi nội dung)

**FEAT-BOOK-EDIT AC-15** là AC duy nhất trong 15 AC của FEAT-BOOK-EDIT liên quan trực tiếp tới Driver+ — khẳng định giữ nguyên `BOOKING.UPDATE.RESPONSE` không đổi qua đợt viết lại 2026-08-03, và phân biệt rõ với luồng đồng bộ trạng thái vòng đời (thuộc OUTBOUND, dùng `BOOKING.CHANGE.STATUS`). Điểm mạnh: ranh giới "sửa nội dung" vs "đổi trạng thái" được nêu tường minh, tránh nhầm lẫn giữa 2 luồng đồng bộ dùng 2 MessageStep khác nhau. Điểm cần lưu ý: (a) AC-15 không có gate theo nguồn booking như OUTBOUND EC-2 đang có cho luồng trạng thái — nghĩa là về mặt câu chữ, sửa 1 booking nguồn Garage Care cũng đọc được là phải "đồng bộ sang Driver+"; (b) payload thực tế của bước này chưa từng được đặc tả field-by-field ở tầng Architecture — chỉ có 1 ghi chú rằng KG map `BOOKING.UPDATE.RESPONSE` vào class `BookingCreateResponseEvent` (thiết kế gốc cho luồng tạo mới, shape `{success, booking:{id,code}, error, correlation}`), không rõ shape này có mang đủ nội dung "lịch hẹn mới nhất" mà AC-15 hứa hẹn hay không.

### 4.5. Document sync — FEAT-SO-DETAIL AC-17/AC-38 + FEAT-STL-CREATE AC-3/AC-4/AC-18 (mới, chưa từng có trong bản v1/v2)

Nhánh "Document sync" là mảnh ghép thứ ba của tích hợp Driver Plus trong Wave 7 (sau Partner Link và Booking relay), vừa được đưa chính thức vào scope ngày 2026-08-10/11 qua ADR-031 sau khi Business Authority phát hiện gap so với bản phân tích 2026-08-11 trước đó. Cơ chế gồm 2 luồng event độc lập trên cùng 1 topic Kafka mới `AC-DEV-DOCUMENT-EVENTS` (`MessageGroup=DOCUMENT`, partition key `Document-{documentCode}`): `gf-sales` phát `DOCUMENT.SERVICE_ORDER.SYNC` khi phiếu dịch vụ (SO) nguồn booking Driver+ chuyển sang "Hoàn thành" (FEAT-SO-DETAIL AC-17, BR-SO-DTL-007); `gf-accounting` phát `DOCUMENT.SETTLEMENT.SYNC` khi tạo phiếu quyết toán thành công từ SO nguồn Driver+ (FEAT-STL-CREATE AC-3/AC-4, BR-STL-CRE-008). Tổng cộng có 4 AC trực tiếp liên quan (SO-DETAIL AC-17 + AC-38, STL-CREATE AC-3 + AC-18) cùng 2 Business Rule cấp boundary (BR-SO-DTL-007, BR-STL-CRE-008) và 1 ADR riêng (ADR-031) mô tả toàn bộ cơ chế kỹ thuật.

Điểm mạnh: tài liệu đã đóng rất tốt 3 marker "NEED CONFIRMATION Architecture" tồn đọng từ tháng 6 — tên event, định dạng tệp (URL thay vì binary, TTL 30 ngày tính từ `occurredAt`), và cơ chế dedupe (`eventId = UUIDv5` theo mã phiếu). Cả 2 boundary tái dùng hạ tầng outbox sẵn có, không migration schema. Hai loại phiếu được thiết kế minh bạch là độc lập — không chờ nhau, không ghi đè — và cả 2 AC lỗi (AC-38, AC-18) đều nhất quán về nguyên tắc "không rollback nghiệp vụ, lưu chờ đồng bộ và tự động thử lại". Việc loại bỏ hoàn toàn step `REVOKED` (cả cho SO lẫn Settlement) sau khi xác nhận "hủy phiếu quyết toán" không phải luồng nghiệp vụ tồn tại là một quyết định kiến trúc sạch, có căn cứ rõ ràng và được ghi log đầy đủ trong ADR-031.

Điểm cần lưu ý, tổng hợp từ 10 finding trong file này: (1) việc dọn dẹp step `REVOKED` chưa lan tỏa đều đến tất cả tài liệu — enum tại `gf-accounting-api.md` §6.5 và bảng tham chiếu tại `INTEG-EXT-driver-plus.md` §5 vẫn còn sót; (2) cơ chế dedupe theo `eventId` thuần hàm của mã phiếu va chạm trực tiếp với quy tắc tái sử dụng mã phiếu quyết toán sau khi hủy (EC-3/BR-STL-CRE-004) — một luồng nghiệp vụ hợp lệ có thể bị Driver+ âm thầm bỏ qua; (3) cặp phiếu quyết toán Khách hàng/Bảo hiểm dùng 2 partition key khác nhau nên không có bảo đảm thứ tự dù chúng tham chiếu chéo nhau; (4) 2 tài liệu governance bắt buộc theo Entry Criteria của PKG-W07 (ARCH-REVIEW-W07.md, SERVICE-BOUNDARY-MATRIX.md) chưa hề được cập nhật cho nhánh này; (5) một lỗi định dạng mã phiếu trong ví dụ payload có thể gây hiểu nhầm khi viết test; và một số điểm mờ về hành vi khi feature flag tắt giữa chừng, khi ops phải re-queue event đã hết hạn. Nhìn chung nhánh này có chất lượng đặc tả nghiệp vụ tốt nhưng có dấu hiệu rõ của một khối lượng thay đổi lớn được chốt rất nhanh (rất nhiều version bump trong 2 ngày 2026-08-10/11) khiến một số tài liệu vệ tinh chưa theo kịp.

## 5. Phụ Thuộc (Dependencies)

| Dependency | Chiều | Mô tả |
|---|---|---|
| `EP-FOUND` | Upstream | Hồ sơ doanh nghiệp/chi nhánh — nguồn dữ liệu khối "Thông tin đồng bộ sang Driver Plus". |
| `EP-BOOKING` (baseline) | Downstream | Năng lực nhận booking D+ đã có ở baseline production — W07 chỉ rewrite phần payload/hủy/phản hồi. |
| Driver Plus (external) | Bidirectional (Partner Link/Booking) + 1 chiều (Document sync) | 15 `MessageStep` trên 3 topic Kafka. Tài liệu nguồn phía Driver+ nằm ngoài repo — GMS chỉ đối chiếu, không kiểm chứng trực tiếp được. |
| ADR-029 | Kiến trúc nền | Giao thức Kafka 2 chiều, đã lên v3 — thêm cơ chế resolve tenant qua SĐT (`PARTNER_LINK.REQUEST.CREATE`) / requestCode (`WITHDRAW`/`UNLINK`) vì D+ không quản lý `tenantId` GMS (gap G4). |
| ADR-030 | Kiến trúc nền | Bảng `tenant_profile` làm SoT; gap backfill tenant cũ nay nghiêm trọng hơn vì SĐT đã thành khoá bắt buộc để resolve tenant (xem RR-005). |
| ADR-031 | Kiến trúc nền, **nay CHÍNH THỨC trong scope** | Cơ chế Document sync đầy đủ — trước đây (v1/v2) bị liệt kê "ngoài phạm vi W07 có chủ đích", nay đã lên v6 và active. |
| `FEAT-SO-DETAIL`, `FEAT-STL-CREATE` | Mới (Document sync) | 2 feature Product mới hoàn toàn chưa từng nằm trong phạm vi phân tích v1/v2. |
| `BR-GF-ACCOUNTING.md` | Mới (Document sync) | Business rule của boundary `gf-accounting` — boundary hoàn toàn mới với package này. |
| Feature flag `PartnerLink:DriverPlus` / `Booking:DriverPlus` / `Document:DriverPlus` | Vận hành | 3 flag độc lập (tăng từ 2), default `on` toàn bộ tenant, dùng làm kill-switch khẩn cấp. |
| `Product/Commons/ERROR-CODE-REGISTRY.md`, `Execution/SERVICE-BOUNDARY-MATRIX.md` | Tham chiếu | 2 file trước đây KHÔNG có trong bộ copy cục bộ dùng cho v1/v2 (gây ra false positive RR-028/RR-029) — đã bổ sung vào bộ nguồn từ 2026-08-14. |

## 6. Phân Tích Mockup/Screenshot

Không có ảnh mockup/screenshot được cung cấp trực tiếp trong bộ tài liệu để phân tích. `FEAT-SYS-DRIVERPLUS-LINK.md` §3 UI/UX Reference khai báo visual source mode là `figma` với 2 link chính thức (Web + Mobile). Do đây là link Figma bên ngoài (không phải file ảnh đính kèm trong workspace), tài liệu này không thực hiện được bước đối chiếu trực tiếp hình ảnh. Nhánh Document sync không có UI riêng (thuần backend-to-backend), nên không áp dụng mục này.

## 7. Điểm Thiếu/Điểm Mờ — Gap Review

### 7.1. Bảng tổng hợp

| Mã | Loại | Mức độ | Tóm tắt | Ảnh hưởng | Owner |
|---|---|---|---|---|---|
| RR-001 | Thiếu phủ | Cao | ADR-029 v2 gộp chung 2 tình huống khác bản chất (SĐT không tồn tại vs SĐT trùng nhiều garage) vào cùng 1 mã lỗi ERR-DPL-013, không có nhánh cảnh báo vận hành như case tương tự ở WITHDRAW/UNLINK | TC | Solution Architect + Business Authority |
| RR-002 | Mơ hồ | Trung bình | Display type của 5 mã lỗi trả cho Driver Plus bị gọi bằng 2 tên khác nhau xuyên tài liệu: "API_RESPONSE" (ADR-029, BR-GF-SYSTEM, FEAT changelog) vs "EXTERNAL_RESPONSE" (chính ERROR-CODE-REGISTRY.md, kể cả tự mâu thuẫn trong nội bộ file này) | TC | Solution Architect |
| RR-003 | Thiếu phủ | Cao | Thứ tự kiểm tra kill-switch `PartnerLink:DriverPlus` (per-tenant) không được nêu trong 3 bước gate của luồng inbound CREATE/WITHDRAW/UNLINK, dù về mặt kỹ thuật buộc phải xảy ra SAU bước resolve tenant | TC | Solution Architect |
| RR-004 | Bảo mật | Trung bình | Cơ chế resolve tenant qua SĐT tại `PARTNER_LINK.REQUEST.CREATE` tạo ra kênh dò quét (phản hồi khác nhau giữa "SĐT tồn tại" và "SĐT không tồn tại") mà không có giới hạn tần suất nào được đặc tả | TC | Security Lead + Solution Architect |
| RR-005 | Thiếu phủ | Cao | ADR-030 Gap 2 (backfill `tenant_profile` cho tenant cũ) được viết trước khi ADR-029 v2 biến SĐT garage thành khoá bắt buộc để tạo yêu cầu liên kết — mức độ nghiêm trọng của gap đã tăng nhưng chưa được 2 tài liệu tham chiếu chéo lại với nhau | TC | Solution Architect + Business Authority |
| RR-006 | Thiếu phủ | Trung bình | Cờ `truncated` khi danh sách vượt cap phòng vệ 500 dòng được đặc tả rõ ở tầng BE nhưng FE "có thể hiện hint (không bắt buộc)", nghĩa là garage có thể mất dữ liệu khỏi màn hình mà không có bất kỳ dấu hiệu nào | UX | Product Designer + Business Authority |
| RR-007 | Trạng thái | Trung bình | Sau khi ADR-029 v2 khiến case "tenant_profile hoàn toàn rỗng" không còn xảy ra được ở bước tạo request, case "hồ sơ garage rỗng MỘT PHẦN" (có SĐT nhưng thiếu tên/địa chỉ) vẫn có thể khiến Duyệt/Đồng bộ thành công mà không cảnh báo | TC+UX | Product Designer + Business Authority |
| RR-008 | Thiếu phủ | Cao | D+ không nhận được bất kỳ phản hồi nào cho `REQUEST.WITHDRAW`/`UNLINK`, kể cả khi message bị bỏ qua do lỗi resolve `requestCode` (gap G4) — không có kênh nào giúp D+ tự phát hiện lỗi tái sử dụng mã sai | TC | Solution Architect + Business Authority |
| RR-009 | Khả năng tiếp cận | Cao | Checkbox điều khoản chia sẻ thông tin chỉ mô tả gate scroll-to-end bằng chuột, chưa có cơ chế cho người dùng bàn phím/screen-reader nhận biết đã đọc hết nội dung | UX | Product Designer + Frontend Lead |
| RR-010 | Bảo mật | Cao | Nội dung "Lý do" free-text (cả garage nhập lẫn Driver Plus gửi kèm WITHDRAW/UNLINK) được nội suy trực tiếp vào chuỗi `notification.message` gửi cho bên còn lại mà không có quy tắc escaping/sanitize nào được đặc tả | TC | Security Lead |
| RR-011 | Tuân thủ | Trung bình | Không có trường nào lưu lại phiên bản/nội dung cụ thể của "Điều khoản chia sẻ thông tin" mà garage đã đồng ý tại thời điểm Duyệt | Khác | Legal/Compliance + Solution Architect |
| RR-012 | Thiếu phủ | Trung bình | Wording modal "Đồng bộ lại" và cả 4 mẫu notification outbound đều nội suy `{Tên garage}`/`{Tên garage}` nhưng không có fallback khi `tenant_profile.business_name` là NULL | UX | Product Designer |
| RR-013 | Biên | Trung bình | Không có ràng buộc độ dài tối đa nào được đặc tả cho các trường payload đến từ Driver Plus dùng làm dữ liệu domain (`requestCode`, `partnerAccountName`, `partnerAccountPhone`, `reason` của WITHDRAW/UNLINK) | TC | Backend Lead |
| RR-014 | Mơ hồ | Trung bình | `BR-DPL-CMN-006` cam kết giữ record terminal "vĩnh viễn" nhưng `BR-DPL-LST-004` lại giới hạn danh sách trả về tối đa 500 dòng — 2 rule cùng 1 domain có thể mâu thuẫn nhau về lâu dài với garage hoạt động nhiều năm | Khác | Business Authority |
| RR-015 | Thiếu phủ | Trung bình | Mobile không có màn hình lỗi tải danh sách ban đầu tương đương "banner + nút Tải lại" của web, dù cùng dùng chung mã lỗi ERR-DPL-007 | UX | Mobile Lead |
| RR-016 | Thiếu phủ | Trung bình | `Execution/SERVICE-BOUNDARY-MATRIX.md` vẫn chưa backfill "Partner Link" vào cột Modules của boundary `gf-system`, dù đã được chính `ARCH-REVIEW-W07.md` và `PKG-W07` ghi nhận là việc còn thiếu | Khác | DevOps/SRE Lead + Solution Architect |
| RR-017 | Tương tranh | Trung bình | Chưa đặc tả hành vi khi Delivery Authority tắt kill-switch `PartnerLink:DriverPlus` đúng lúc 1 user đang giữa chừng thao tác (modal đang mở, đã gửi request nhưng response chưa về) | TC+UX | Frontend Lead + Backend Lead |
| RR-018 | Thiếu phủ | Thấp | Endpoint GET detail dùng chung mã lỗi 503 `ERR-DPL-007` với endpoint GET list nhưng chỉ có UI mapping (banner + Tải lại) cho trường hợp list, chưa rõ hành vi UI khi chính detail của item đang xem gặp lỗi | UX | Frontend Lead |
| RR-019 | Mơ hồ | Thấp | "Ghi nhớ filter trong phiên" (`BR-COMMON#SYS-RETRY-009`) không nói rõ F5/reload trang có được tính là "thoát session" hay không, trong khi state filter hiện đang giữ ở Zustand (in-memory, không sống sót qua reload) | UX | Frontend Lead |
| RR-020 | Thiếu phủ | Thấp | 4 wording notification outbound + các message inline/toast của feature không có đặc tả i18n dù `garage-mobile` đã ghi nhận yêu cầu "Locale VN/EN" cho riêng mobile | Khác | Business Authority |
| RR-021 | Biên | Thấp | Trường `processedByLabel` (snapshot "Tên nhân viên (Role)") không có giới hạn độ dài tối đa nào được đặc tả, dù tên nhân viên là input tự do khi tạo tài khoản | Khác | Backend Lead |
| RR-022 | UX | Thấp | Cập nhật ngầm không toast khi Driver Plus tự hủy/rút yêu cầu (AC-33/35) nay đã được xác nhận là hành vi chủ đích áp dụng nhất quán cho cả Web và Mobile, nhưng vẫn chưa có cơ chế nào giúp user đang xem đúng record đó biết dữ liệu vừa đổi mà không cần tự thao tác | UX | Product Designer |
| RR-023 | Biên | Thấp | Chưa có UI mapping rõ ràng cho trường hợp `getPartnerLinkRequestDetail` trả `NF_404` ngay tại bước auto-select item đầu tiên (AC-3), dù xác suất xảy ra trong thực tế là thấp | UX | Frontend Lead |
| RR-024 | Thiếu phủ | Trung bình | FEAT-BOOK-EDIT AC-15 không nêu điều kiện giới hạn theo nguồn booking khi đồng bộ sang Driver+ | TC | Backend Lead + Business Authority |
| RR-025 | Thiếu phủ | Cao | Schema thực tế của `BOOKING.UPDATE.RESPONSE` (FEAT-BOOK-EDIT AC-15) chưa được đặc tả field-by-field | TC | Backend Lead |
| RR-026 | Mơ hồ | Trung bình | `externalBookingId` là trường bắt buộc nhưng nằm ngoài "5 trường bắt buộc" mà AC-2 dùng làm điều kiện gate | TC | Solution Architect |
| RR-027 | Thiếu phủ | Trung bình | FEAT-BOOK-DETAIL AC-5 không phân biệt hiển thị "Loại dịch vụ" nội bộ GMS với "Loại dịch vụ" macro của Driver+ | UX | Product Designer + Business Authority |
| RR-028 | Thiếu phủ | Trung bình | Driver+ không có cơ chế chủ động truy vấn lại trạng thái booking khi lỡ mất event | Khác | Solution Architect |
| RR-029 | Tương tranh | Trung bình | Dedupe theo `event_id` không chặn được 2 `event_id` khác nhau phát sinh từ cùng 1 hành động người dùng | TC+UX | Business Authority + Backend Lead |
| RR-030 | Thiếu phủ | Trung bình | Không có cơ chế thông báo rõ ràng cho vận hành garage khi yêu cầu hủy từ Driver+ không xác định được booking | UX | DevOps/SRE Lead + Business Authority |
| RR-031 | Thiếu phủ | Thấp | Chưa có chính sách archival cho `inbox_event`/`outbox_event` dù đã xác nhận không có TTL | Khác | DevOps/SRE Lead |
| RR-032 | Bảo mật | Trung bình | `vehicleImages` nhận URL bên ngoài từ Driver+ không có giới hạn số lượng, định dạng, hay allowlist domain | TC | Security Lead + Backend Lead |
| RR-033 | Thiếu phủ | Cao | FEAT-BOOK-EDIT AC-9/AC-10 bắt buộc "Loại dịch vụ" GMS-nội bộ khi sửa, nhưng không xử lý trường hợp booking nguồn Driver+ chưa từng có giá trị này | TC+UX | Business Authority + Product Designer |
| RR-034 | Thiếu phủ | Cao | Giá trị enum `LeadSource` (bao gồm giá trị đại diện cho "nguồn Driver+") chưa từng được liệt kê tường minh ở bất kỳ tài liệu nào | TC | Backend Lead |
| RR-035 | Mơ hồ | Cao | Ngưỡng "quá hạn" cho auto-cancel/NO_SHOW_AUTO có 3 giá trị timer khác nhau trong Architecture, trong khi Product vẫn ghi nhận đây là quy tắc chưa chốt | TC | Business Authority + Solution Architect |
| RR-036 | Tương tranh | Trung bình | Race giữa việc tắt flag `Booking:DriverPlus` và event đã nằm sẵn trong outbox chờ gửi | TC | Backend Lead |
| RR-037 | Biên | Trung bình | Payload đặt lịch (`appointmentDate`) không validate ngày quá khứ/quá xa tương lai | TC | Business Authority |
| RR-038 | Mơ hồ | Thấp | `PKG-W07` dùng tên trạng thái "NEW"/"CONFIRMED" không khớp enum canonical `BookingStatus` đã chốt | Khác | Backend Lead |
| RR-039 | Mơ hồ | Thấp | Frontmatter `boundary: sales` của `gf-sales-events.md` không khớp tên boundary chuẩn `gf-sales` dùng ở mọi nơi khác | Khác | Solution Architect |
| RR-040 | Biên | Trung bình | FEAT-BOOK-EDIT AC-8 không validate bước 15 phút khi sửa giờ hẹn của booking nguồn Driver+ | TC | Business Authority |
| RR-041 | Thiếu phủ | Cao | `gf-accounting-api.md` §6.5 vẫn liệt kê step `DOCUMENT.SERVICE_ORDER.REVOKED` dù ADR-031 v6 đã loại bỏ hoàn toàn step này | TC | Backend Lead |
| RR-042 | Thiếu phủ | Trung bình | Bảng tham chiếu hợp đồng tại `INTEG-EXT-driver-plus.md` §5 vẫn ghi "Document sync (3 step)" và trích dẫn §3.11 như một step còn sống | Khác | Solution Architect |
| RR-043 | Trạng thái | Cao | Tái sử dụng mã phiếu quyết toán sau khi hủy (EC-3) va chạm với khóa dedupe `eventId` thuần hàm của mã phiếu, khiến Driver+ có thể bỏ qua chứng từ của phiếu quyết toán hợp lệ mới tạo | TC | Solution Architect + Backend Lead |
| RR-044 | Thiếu phủ | Cao | Nhánh Document sync (ADR-031, ngày 2026-08-10/11) chưa từng đi qua cổng Architecture Review mà chính PKG-W07 yêu cầu làm Entry Criteria | Khác | Solution Architect + Delivery Authority |
| RR-045 | Tuân thủ | Trung bình | Đầu mục compliance/PII "chưa xác định" của Driver+ chỉ được tracked cho dữ liệu Partner Link, không mở rộng cho tệp chứng từ chứa PII nhạy cảm hơn của Document sync | Khác | Legal/Compliance + Business Authority |
| RR-046 | Tương tranh | Cao | Tài liệu không nói rõ hành vi khi feature flag `Document:DriverPlus` bị tắt trong lúc 1 sự kiện đã nằm sẵn trong outbox ở trạng thái `PENDING` | TC | Solution Architect |
| RR-047 | Tương tranh | Trung bình | Cặp phiếu quyết toán Khách hàng/Bảo hiểm (AC-4) phát 2 sự kiện với 2 `documentCode` khác nhau nên rơi vào 2 partition khác nhau, không có bảo đảm thứ tự dù chúng tham chiếu chéo qua `relatedSettlementCode` | TC | Solution Architect |
| RR-048 | Mơ hồ | Thấp | Payload mẫu của `DOCUMENT.SETTLEMENT.SYNC` dùng tiền tố mã phiếu "PQT-" thay vì định dạng chuẩn "SET-" đã được BR-STL-CRE-006 chốt | TC | Backend Lead |
| RR-049 | Thiếu phủ | Trung bình | `SERVICE-BOUNDARY-MATRIX.md` chưa được backfill cho Document sync dù chính PKG-W07 đặt đây là Entry Criteria bắt buộc, và đã bị cảnh báo là gap từ trước cả khi Document sync tồn tại | Khác | Delivery Authority + Solution Architect |
| RR-050 | Biên | Trung bình | Cơ chế "re-queue outbox row" để phát lại chứng từ hết hạn có thể phát lại kèm `expiresAt` đã ở trong quá khứ | TC | DevOps/SRE Lead |
| RR-051 | Thiếu phủ | Trung bình | PKG-W07 Entry Criteria vẫn trích dẫn `INTEG-EXT-driver-plus.md` v5, trong khi file thật đã lên tới version 10 và mở rộng thêm cả nhánh Document sync | Khác | Solution Architect |
| RR-052 | Thiếu phủ | Trung bình | Chưa có schema registry cho hợp đồng dữ liệu 2 chiều với Driver Plus, contract test hiện dựa hoàn toàn vào fixture thủ công tự tạo, không tự động phát hiện khi payload thật của đối tác lệch khỏi tài liệu | Khác | Solution Architect + Backend Lead |
| RR-053 | Mơ hồ | Thấp | Trường `eventVersion` trong envelope Kafka dùng 2 định dạng chuỗi khác nhau ngay trong cùng 1 file (`"v1"` ở envelope mẫu tổng quát, `"1.0"`/`"2.0"` ở các ví dụ event cụ thể), và không có rule nào định nghĩa hành vi khi consumer nhận `eventVersion` khác giá trị đang hỗ trợ | Khác | Solution Architect |
| RR-054 | Thiếu phủ | Trung bình | Không có cơ chế phát hiện khi Driver Plus ngừng hẳn việc gửi message inbound (producer-side silence) — metric hiện có chỉ đo được độ trễ xử lý, không đo được tình trạng "không có gì để xử lý" | Khác | DevOps/SRE Lead + Solution Architect |
| RR-055 | Mơ hồ | Thấp | Success Metric #3 của EP-PARTNER-LINK đo tỷ lệ "Từ chối có nhập lý do" nhưng mẫu số "tổng Từ chối" nhiều khả năng gộp cả case Từ chối tự động (cascade khi Duyệt 1 request khác) — vốn không có và không cần trường lý do | Khác | Business Authority |
| RR-056 | Thiếu phủ | Thấp | Cả 3 Success Metric của EP-PARTNER-LINK chỉ có công thức tính trên giấy, chưa có AC hay cơ chế kỹ thuật nào định nghĩa ai tính, tính bằng công cụ gì, và báo cáo ở đâu sau go-live | Khác | Business Authority |

### 7.3. Khuyến nghị

> Bản v3 (2026-08-14) — phân tích lại hoàn toàn từ nội dung nguồn mới nhất, không kế thừa nội dung viết sẵn từ v1/v2. Tổng cộng **56 finding mới** (0 `[Chặn]`, 14 `[Cao]`, 29 `[Trung bình]`, 13 `[Thấp]`), chia theo 3 nhánh: Partner Link (23), Booking relay (17), Document sync (10), cộng 6 finding cross-cutting/PKG-level (schema registry, envelope version, Success Metric, Entry Criteria, producer silence). Đối chiếu với 51 finding của bản v1/v2: 3 finding cũ (RR-028, RR-029, RR-039 theo mã cũ) được xác nhận là **false positive** (do lỗi copy tài liệu nguồn, không phải gap thật — đã sửa lỗi copy và verify lại trực tiếp); phần lớn finding còn lại được viết lại với bằng chứng cụ thể hơn nhờ nội dung nguồn đã cập nhật; một số bị thay thế bởi finding mới có bản chất rộng hơn do cơ chế nghiệp vụ đã đổi (đặc biệt là cơ chế resolve tenant qua SĐT/requestCode mới trong ADR-029 v2/v3).

SẴN SÀNG sinh TC — 0 finding mức `[Chặn]` còn mở. 14 finding mức `[Cao]` (RR-001, RR-003, RR-005, RR-008, RR-009, RR-010, RR-025, RR-033, RR-034, RR-035, RR-041, RR-043, RR-044, RR-046) nên được làm rõ trước khi viết test case cho đúng các nhánh liên quan. Đáng chú ý nhất trong nhóm `[Cao]`:

- RR-034 (enum `LeadSource` chưa từng được liệt kê tường minh) và RR-035 (3 giá trị timer khác nhau cho ngưỡng "quá hạn") — 2 gap có bằng chứng cross-document mạnh nhất, phát hiện qua đối chiếu trực tiếp nhiều file Architecture với nhau.
- RR-043 (tái sử dụng mã phiếu quyết toán va chạm dedupe `eventId`) — rủi ro Driver+ âm thầm bỏ qua chứng từ hợp lệ, thuộc nhánh Document sync còn rất mới.
- RR-044 (Document sync chưa qua Architecture Review gate) — toàn bộ nhánh Document sync (10 finding DOC + các finding liên quan) nên được ưu tiên xác nhận qua ARCH-REVIEW trước khi đầu tư nhiều effort viết TC cho nhánh này, vì bản thân nhánh chưa được chính thức ratify.
- RR-001/RR-005/RR-008 (nhóm Partner Link) — hệ luỵ trực tiếp của thay đổi cơ chế resolve tenant mới (ADR-029 v2/v3), vùng biến động nhanh nhất trong đợt refresh này.
- RR-009/RR-010/RR-025/RR-033/RR-041 — accessibility, sanitize dữ liệu tự do, schema event chưa đặc tả, gate "Loại dịch vụ" có thể chặn tính năng Sửa cho booking D+, và tài liệu chưa dọn sạch step đã bị loại bỏ.

Các nhánh còn lại của package vẫn có thể tiến hành sinh TC bình thường.

### 7.4. Phân loại theo tác động

Theo đúng mục 5.7 của skill `requirements_analyzer`, toàn bộ 56 finding được phân theo tác động thực tế (nhãn `TC` / `UX` / `Khác`) để người đọc lọc nhanh finding nào cần ưu tiên xử lý cho mục đích nào. Nhãn này độc lập với Mức độ.

Nhóm TC — Ảnh hưởng trực tiếp tới viết Test Case (27 finding):

| Mã | Mức độ | Vì sao ảnh hưởng viết TC |
|---|---|---|
| RR-001 | Cao | ADR-029 v2 gộp chung 2 tình huống khác bản chất (SĐT không tồn tại vs SĐT trùng nhiều garage) vào cùng 1 mã lỗ |
| RR-002 | Trung bình | Display type của 5 mã lỗi trả cho Driver Plus bị gọi bằng 2 tên khác nhau xuyên tài liệu: "API_RESPONSE" (ADR- |
| RR-003 | Cao | Thứ tự kiểm tra kill-switch `PartnerLink:DriverPlus` (per-tenant) không được nêu trong 3 bước gate của luồng i |
| RR-004 | Trung bình | Cơ chế resolve tenant qua SĐT tại `PARTNER_LINK.REQUEST.CREATE` tạo ra kênh dò quét (phản hồi khác nhau giữa " |
| RR-005 | Cao | ADR-030 Gap 2 (backfill `tenant_profile` cho tenant cũ) được viết trước khi ADR-029 v2 biến SĐT garage thành k |
| RR-007 | Trung bình | Sau khi ADR-029 v2 khiến case "tenant_profile hoàn toàn rỗng" không còn xảy ra được ở bước tạo request, case " |
| RR-008 | Cao | D+ không nhận được bất kỳ phản hồi nào cho `REQUEST.WITHDRAW`/`UNLINK`, kể cả khi message bị bỏ qua do lỗi res |
| RR-010 | Cao | Nội dung "Lý do" free-text (cả garage nhập lẫn Driver Plus gửi kèm WITHDRAW/UNLINK) được nội suy trực tiếp vào |
| RR-013 | Trung bình | Không có ràng buộc độ dài tối đa nào được đặc tả cho các trường payload đến từ Driver Plus dùng làm dữ liệu do |
| RR-017 | Trung bình | Chưa đặc tả hành vi khi Delivery Authority tắt kill-switch `PartnerLink:DriverPlus` đúng lúc 1 user đang giữa  |
| RR-024 | Trung bình | FEAT-BOOK-EDIT AC-15 không nêu điều kiện giới hạn theo nguồn booking khi đồng bộ sang Driver+ |
| RR-025 | Cao | Schema thực tế của `BOOKING.UPDATE.RESPONSE` (FEAT-BOOK-EDIT AC-15) chưa được đặc tả field-by-field |
| RR-026 | Trung bình | `externalBookingId` là trường bắt buộc nhưng nằm ngoài "5 trường bắt buộc" mà AC-2 dùng làm điều kiện gate |
| RR-029 | Trung bình | Dedupe theo `event_id` không chặn được 2 `event_id` khác nhau phát sinh từ cùng 1 hành động người dùng |
| RR-032 | Trung bình | `vehicleImages` nhận URL bên ngoài từ Driver+ không có giới hạn số lượng, định dạng, hay allowlist domain |
| RR-033 | Cao | FEAT-BOOK-EDIT AC-9/AC-10 bắt buộc "Loại dịch vụ" GMS-nội bộ khi sửa, nhưng không xử lý trường hợp booking ngu |
| RR-034 | Cao | Giá trị enum `LeadSource` (bao gồm giá trị đại diện cho "nguồn Driver+") chưa từng được liệt kê tường minh ở b |
| RR-035 | Cao | Ngưỡng "quá hạn" cho auto-cancel/NO_SHOW_AUTO có 3 giá trị timer khác nhau trong Architecture, trong khi Produ |
| RR-036 | Trung bình | Race giữa việc tắt flag `Booking:DriverPlus` và event đã nằm sẵn trong outbox chờ gửi |
| RR-037 | Trung bình | Payload đặt lịch (`appointmentDate`) không validate ngày quá khứ/quá xa tương lai |
| RR-040 | Trung bình | FEAT-BOOK-EDIT AC-8 không validate bước 15 phút khi sửa giờ hẹn của booking nguồn Driver+ |
| RR-041 | Cao | `gf-accounting-api.md` §6.5 vẫn liệt kê step `DOCUMENT.SERVICE_ORDER.REVOKED` dù ADR-031 v6 đã loại bỏ hoàn to |
| RR-043 | Cao | Tái sử dụng mã phiếu quyết toán sau khi hủy (EC-3) va chạm với khóa dedupe `eventId` thuần hàm của mã phiếu, k |
| RR-046 | Cao | Tài liệu không nói rõ hành vi khi feature flag `Document:DriverPlus` bị tắt trong lúc 1 sự kiện đã nằm sẵn tro |
| RR-047 | Trung bình | Cặp phiếu quyết toán Khách hàng/Bảo hiểm (AC-4) phát 2 sự kiện với 2 `documentCode` khác nhau nên rơi vào 2 pa |
| RR-048 | Thấp | Payload mẫu của `DOCUMENT.SETTLEMENT.SYNC` dùng tiền tố mã phiếu "PQT-" thay vì định dạng chuẩn "SET-" đã được |
| RR-050 | Trung bình | Cơ chế "re-queue outbox row" để phát lại chứng từ hết hạn có thể phát lại kèm `expiresAt` đã ở trong quá khứ |

Nhóm UX — Liên quan hành vi người dùng thực tế (14 finding):

| Mã | Mức độ | Hành vi người dùng bị ảnh hưởng |
|---|---|---|
| RR-006 | Trung bình | Cờ `truncated` khi danh sách vượt cap phòng vệ 500 dòng được đặc tả rõ ở tầng BE nhưng FE "có thể hiện hint (k |
| RR-007 | Trung bình | Sau khi ADR-029 v2 khiến case "tenant_profile hoàn toàn rỗng" không còn xảy ra được ở bước tạo request, case " |
| RR-009 | Cao | Checkbox điều khoản chia sẻ thông tin chỉ mô tả gate scroll-to-end bằng chuột, chưa có cơ chế cho người dùng b |
| RR-012 | Trung bình | Wording modal "Đồng bộ lại" và cả 4 mẫu notification outbound đều nội suy `{Tên garage}`/`{Tên garage}` nhưng  |
| RR-015 | Trung bình | Mobile không có màn hình lỗi tải danh sách ban đầu tương đương "banner + nút Tải lại" của web, dù cùng dùng ch |
| RR-017 | Trung bình | Chưa đặc tả hành vi khi Delivery Authority tắt kill-switch `PartnerLink:DriverPlus` đúng lúc 1 user đang giữa  |
| RR-018 | Thấp | Endpoint GET detail dùng chung mã lỗi 503 `ERR-DPL-007` với endpoint GET list nhưng chỉ có UI mapping (banner  |
| RR-019 | Thấp | "Ghi nhớ filter trong phiên" (`BR-COMMON#SYS-RETRY-009`) không nói rõ F5/reload trang có được tính là "thoát s |
| RR-022 | Thấp | Cập nhật ngầm không toast khi Driver Plus tự hủy/rút yêu cầu (AC-33/35) nay đã được xác nhận là hành vi chủ đí |
| RR-023 | Thấp | Chưa có UI mapping rõ ràng cho trường hợp `getPartnerLinkRequestDetail` trả `NF_404` ngay tại bước auto-select |
| RR-027 | Trung bình | FEAT-BOOK-DETAIL AC-5 không phân biệt hiển thị "Loại dịch vụ" nội bộ GMS với "Loại dịch vụ" macro của Driver+ |
| RR-029 | Trung bình | Dedupe theo `event_id` không chặn được 2 `event_id` khác nhau phát sinh từ cùng 1 hành động người dùng |
| RR-030 | Trung bình | Không có cơ chế thông báo rõ ràng cho vận hành garage khi yêu cầu hủy từ Driver+ không xác định được booking |
| RR-033 | Cao | FEAT-BOOK-EDIT AC-9/AC-10 bắt buộc "Loại dịch vụ" GMS-nội bộ khi sửa, nhưng không xử lý trường hợp booking ngu |

Nhóm Khác — không thuộc 2 nhóm trên (19 finding): compliance/pháp lý, vận hành/monitoring nội bộ, hoặc governance/tài liệu (version citation, schema registry, đặt tên enum không nhất quán, Success Metric chưa có cơ chế đo lường) — không chặn việc viết TC chức năng và không phải hành vi user trực tiếp nhìn thấy trên UI.

RR-011, RR-014, RR-016, RR-020, RR-021, RR-028, RR-031, RR-038, RR-039, RR-042, RR-044, RR-045, RR-049, RR-051, RR-052, RR-053, RR-054, RR-055, RR-056.

### 7.2. Chi tiết từng finding

## RR-001 [Cao] Thiếu phủ — ADR-029 v2 gộp chung 2 tình huống khác bản chất (SĐT không tồn tại vs SĐT trùng nhiều garage) vào cùng 1 mã lỗi ERR-DPL-013, không có nhánh cảnh báo vận hành như case tương tự ở WITHDRAW/UNLINK

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L503-L503) — mục Consumer logic.
- **Section**: §3.11 `PartnerLink*` (inbound), bước 4 Adapter validation gate.
- **Dòng**: 503.
- **Quote nguyên văn**:
  > `REQUEST.CREATE`: **resolve tenant trước** — match `partnerAccountPhone` với `tenant_profile.contact_phone_number`. **Không khớp (0 hoặc >1 tenant)** → publish `PARTNER_LINK.REQUEST.RESPONSE` `success=false` + `ERR-DPL-013`, **dừng xử lý** (không ghi domain table).

### 2. Bối cảnh nghiệp vụ

Khi tài khoản Driver Plus của tài xế Nguyễn Văn Sơn gửi yêu cầu liên kết `LKD-2026-050` tới GMS, payload chỉ mang đúng 1 thông tin để GMS xác định garage đích: `partnerAccountPhone = "0287654321"`. Adapter tại `gf-system` chạy 1 câu lệnh dò `tenant_profile.contact_phone_number = '0287654321'`. Nếu tìm thấy đúng 1 garage — ví dụ Garage Đăng Vinh — GMS gán `tenantId` của Đăng Vinh cho request và tiếp tục kiểm tra single-active guard. Nhưng bảng `tenant_profile` (theo ADR-030) không có ràng buộc unique nào trên cột `contact_phone_number` — chỉ `tenant_id` là unique. Số điện thoại này lại được seed tự động từ sự kiện `TenantProvisionedEvent.phone` lúc garage đăng ký ban đầu, hoàn toàn có thể trùng nhau giữa 2 garage khác nhau trong thực tế (ví dụ chuỗi garage dùng chung 1 hotline tổng đài cho nhiều chi nhánh được provisioning thành 2 tenant riêng, hoặc lỗi nhập liệu khi provisioning).

### 3. Vấn đề cụ thể

Đoạn tài liệu trích ở mục 1 xử lý 2 tình huống có bản chất hoàn toàn khác nhau bằng đúng 1 mã lỗi `ERR-DPL-013` với đúng 1 nội dung message: "Không tìm thấy garage nào đăng ký số điện thoại này trong hệ thống GMS." — Khả năng A (0 tenant khớp): đúng là garage chưa tồn tại/SĐT sai, message chính xác. Khả năng B (>1 tenant khớp, do trùng SĐT): message này SAI bản chất — garage CÓ tồn tại (thậm chí ≥2 garage), chỉ là hệ thống không tự chọn được garage nào đúng, nhưng D+ lại nhận về thông báo "không tìm thấy" khiến tài xế/garage tưởng nhầm là sai số điện thoại và không biết phải làm gì tiếp. Đối chiếu với chính case tương tự ở `WITHDRAW`/`UNLINK` (cùng file, dòng 504): khi `requestCode` khớp >1 record, tài liệu yêu cầu tường minh "**KHÔNG** tự chọn tenant, alert vận hành mức **P1**" — tức có hẳn 1 quy trình cảnh báo riêng cho case ambiguous. Còn ở `REQUEST.CREATE`, case ambiguous (>1 tenant) bị gộp chung xử lý với case "0 kết quả" mà không có bất kỳ alert/log mức nghiêm trọng riêng nào được nêu.

### 4. Ảnh hưởng nếu không giải quyết

- Đội vận hành GMS không có cách nào phân biệt được giữa "SĐT thật sự chưa đăng ký" và "SĐT bị trùng giữa nhiều garage" chỉ từ metric `error_code=ERR-DPL-013`, khiến 1 lỗi dữ liệu nghiêm trọng (2 garage cùng SĐT liên hệ) có thể tồn tại âm thầm rất lâu mà không ai phát hiện.
- Driver Plus/tài xế nhận thông báo sai lệch bản chất ("không tìm thấy") trong khi garage đích thực sự tồn tại, dẫn đến trải nghiệm khó hiểu và có thể khiến garage bỏ lỡ cơ hội liên kết hợp lệ dù đã cung cấp đúng SĐT.
- Test case viết theo tài liệu hiện tại sẽ không có oracle rõ ràng để phân biệt 2 kịch bản test khác nhau (SĐT chưa tồn tại vs SĐT trùng nhiều garage) vì cả 2 đều "PASS" với cùng 1 response — không thể viết assertion khác nhau cho 2 tình huống nghiệp vụ khác nhau.
- Rủi ro bảo mật gián tiếp: nếu 1 garage cố tình đăng ký SĐT trùng với garage khác (hoặc lỗi vận hành gây trùng), garage đó có thể vô tình chặn garage kia nhận được yêu cầu liên kết hợp lệ mà không ai biết nguyên nhân.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Business Authority + Solution Architect xác nhận): tách case ">1 tenant khớp" thành 1 outcome riêng trong metric (tương tự `skipped_ambiguous` đã có cho `WITHDRAW`/`UNLINK` ở `INTEG-EXT-driver-plus.md` §8.1) — ví dụ `outcome=create_ambiguous_phone` — kèm alert P1 giống hệt pattern đã áp dụng cho gap G4, và cân nhắc đăng ký thêm 1 mã lỗi riêng (vd `ERR-DPL-014`) thay vì dùng chung `ERR-DPL-013`, để tránh D+ nhận nhầm thông điệp "chưa đăng ký" trong khi garage đã tồn tại.

### 6. Liên kết với các phát hiện khác

Cùng gốc rễ với RR-005 (backfill `tenant_profile` cho tenant cũ) — cả 2 đều xuất phát từ việc `contact_phone_number` được dùng làm khoá resolve nhưng chưa có ràng buộc chất lượng dữ liệu tương xứng. Không thay thế RR nào cũ (đây là finding hoàn toàn mới, phát sinh từ nội dung ADR-029 v2 mới refresh).

### 7. Câu hỏi cho người dùng

(a) Tách case ">1 tenant khớp SĐT" thành mã lỗi + outcome/alert riêng như case ambiguous của `WITHDRAW`/`UNLINK`, chấp nhận thêm 1 mã lỗi mới `ERR-DPL-014` và cascade sang registry + ADR-029. (b) Giữ nguyên gộp chung `ERR-DPL-013` cho cả 2 case như hiện tại, chấp nhận rủi ro vận hành không phát hiện được lỗi trùng SĐT cho tới khi có khiếu nại từ garage/D+. (c) Bổ sung ràng buộc unique (có kiểm soát, cho phép null) trên `tenant_profile.contact_phone_number` để case ">1 tenant" về mặt kỹ thuật không thể xảy ra nữa, loại bỏ hoàn toàn nhu cầu xử lý ambiguous ở bước resolve.

### 8. Owner

Solution Architect + Business Authority (Solution Architect vì đây là quyết định cơ chế resolve/alert ở tầng adapter gate đã do Architecture sở hữu theo ADR-029; Business Authority vì cần quyết định wording/mã lỗi mới có ảnh hưởng UX phía đối tác ngoài).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-002 [Trung bình] Mơ hồ — Display type của 5 mã lỗi trả cho Driver Plus bị gọi bằng 2 tên khác nhau xuyên tài liệu: "API_RESPONSE" (ADR-029, BR-GF-SYSTEM, FEAT changelog) vs "EXTERNAL_RESPONSE" (chính ERROR-CODE-REGISTRY.md, kể cả tự mâu thuẫn trong nội bộ file này)

### 1. Trích dẫn nguồn

- **File**: [ERROR-CODE-REGISTRY.md](../../../requirements/gara/wave-07/Product/Commons/ERROR-CODE-REGISTRY.md#L58-L198)
- **Section**: §1.4 (định nghĩa enum hiển thị), §5 (bảng `ERR-DPL-*`), §7 (Tổng hợp).
- **Dòng**: 58, 169-172, 198.
- **Quote nguyên văn**:
  > (§1.4, dòng 58) `EXTERNAL_RESPONSE` | **KHÔNG render trên GMS UI** — kết quả nghiệp vụ gửi cho hệ thống ngoài gọi vào...
  >
  > (§5, dòng 169) `ERR-DPL-010` ... | `EXTERNAL_RESPONSE` | ...
  >
  > (§7, dòng 198) **Theo hình thức hiển thị (gồm `ERR-INV-*` + `ERR-DPL-*` + `ERR-BOOK-*`, tổng 80)**: ... `API_RESPONSE` ×5.

### 2. Bối cảnh nghiệp vụ

Khi Driver Plus gửi yêu cầu liên kết bị chặn bởi single-active guard, GMS trả về mã `ERR-DPL-010` cho D+. Dev đọc `ADR-029` sẽ thấy dòng "Cả 4 mã có display type `API_RESPONSE`" (mục References/Consequences của ADR); đọc `BR-GF-SYSTEM.md` v16 sẽ thấy "cấp mã `ERR-DPL-010`... (thêm display type mới **`API_RESPONSE`**...)"; đọc changelog `FEAT-SYS-DRIVERPLUS-LINK.md` v23 cũng thấy đúng cụm "display type `API_RESPONSE`". Nhưng khi dev mở đúng nguồn duy nhất được khai là "single source of truth" — `ERROR-CODE-REGISTRY.md` — để lấy giá trị enum thật dùng cho code, giá trị hiển thị trong bảng cho `ERR-DPL-010`/`011`/`013` (và cả `ERR-BOOK-001`/`002`) lại là `EXTERNAL_RESPONSE`, không phải `API_RESPONSE`.

### 3. Vấn đề cụ thể

Đây là 1 tên enum bị viết thành 2 chuỗi khác nhau tại nhiều nơi, và ngay cả trong CHÍNH file registry cũng tự mâu thuẫn: mục §1.4 định nghĩa enum là `EXTERNAL_RESPONSE`, mục §5/§6 liệt kê từng dòng dùng đúng `EXTERNAL_RESPONSE`, nhưng mục §7 "Tổng hợp" — bảng thống kê số lượng theo display type — lại ghi nhãn đếm là "`API_RESPONSE` ×5" thay vì "`EXTERNAL_RESPONSE` ×5" (dù con số 5 khớp đúng 3 `ERR-DPL-*` + 2 `ERR-BOOK-*` dùng `EXTERNAL_RESPONSE`). Vì tài liệu §8 "Machine-readable registry" tuyên bố đây là "nguồn sinh code" cho BE enum/constants và FE i18n map, nếu code-gen dựa theo mục §7 (hoặc theo các tài liệu ADR/BR/FEAT dùng "API_RESPONSE") mà không đối chiếu lại đúng cột `display` ở §5/§6, hệ thống sẽ sinh sai tên hằng số.

### 4. Ảnh hưởng nếu không giải quyết

- Dev BE hoặc FE grep "API_RESPONSE" trong codebase tương lai để tìm cách xử lý các mã lỗi external-response sẽ không tìm thấy match nào khớp với registry thật, gây nhầm lẫn khi audit hoặc mở rộng thêm domain mới dùng chung display type này.
- Nếu công cụ sinh code tự động đọc mục §7 (thay vì §5/§6) để verify tổng số display type, assertion đối chiếu "API_RESPONSE = 5" sẽ luôn fail vì không có dòng nào trong bảng chính thức dùng đúng chuỗi đó.
- Reviewer đọc nhanh ADR-029/BR-GF-SYSTEM sẽ nghĩ enum chính thức là "API_RESPONSE" và có thể yêu cầu sửa registry (đi sai hướng — thực chất registry đúng, các tài liệu kia sai) hoặc ngược lại sửa nhầm registry theo các tài liệu tham chiếu sai.

### 5. Đề xuất giải quyết

Đề xuất (giả định): chuẩn hoá về đúng 1 tên `EXTERNAL_RESPONSE` (vì đây là tên được định nghĩa tường minh kèm giải thích ngữ nghĩa ở §1.4 của chính registry — nguồn duy nhất theo quy ước của chính tài liệu này) — sửa lại 3 chỗ dùng sai "API_RESPONSE" trong `ADR-029`, `BR-GF-SYSTEM.md` (changelog v16), `FEAT-SYS-DRIVERPLUS-LINK.md` (changelog v23), và sửa nốt dòng thống kê sai ở chính `ERROR-CODE-REGISTRY.md` §7.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Chuẩn hoá toàn bộ về "`EXTERNAL_RESPONSE`" (khớp định nghĩa enum ở §1.4 của registry) và sửa lại các cite sai ở ADR-029/BR-GF-SYSTEM/FEAT. (b) Chuẩn hoá ngược lại về "`API_RESPONSE`" nếu đây mới là tên đã thống nhất thật sự với đội BE (cần xác nhận lại), khi đó phải sửa registry §1.4/§5/§6 cho khớp.

### 8. Owner

Solution Architect (vì đây là quyết định đặt tên enum hạ tầng dùng chung nhiều domain, cần 1 đầu mối chốt tên chuẩn rồi cascade toàn bộ tài liệu liên quan).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-003 [Cao] Thiếu phủ — Thứ tự kiểm tra kill-switch `PartnerLink:DriverPlus` (per-tenant) không được nêu trong 3 bước gate của luồng inbound CREATE/WITHDRAW/UNLINK, dù về mặt kỹ thuật buộc phải xảy ra SAU bước resolve tenant

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L502-L505)
- **Section**: §3.11, Consumer logic bước 4 "Adapter validation gate".
- **Dòng**: 502-505.
- **Quote nguyên văn**:
  > 4. **Adapter validation gate (PC-4 / BR-CORE-012)**:
  >    - `REQUEST.CREATE`: **resolve tenant trước** — match `partnerAccountPhone` với `tenant_profile.contact_phone_number`. Không khớp (0 hoặc >1 tenant) → publish ... `ERR-DPL-013`, dừng xử lý. Khớp đúng 1 tenant → gán `tenantId` resolve được, tiếp tục enforce single-active guard `BR-DPL-CMN-007` **TRƯỚC** khi ghi domain table.
  >    - `REQUEST.WITHDRAW` / `UNLINK` **(v3, ADR-029 gap G4)**: resolve `tenant_id` + record bằng `SELECT ... WHERE request_code = {data.requestCode}` ... Đúng 1 record → gán `tenantId` từ record, tiếp tục validate `status` đúng kỳ vọng...

### 2. Bối cảnh nghiệp vụ

`gf-system-HLD.md` (dòng 255) xác nhận cache key của feature flag là `feature-flag:{tenantId}:PartnerLink:DriverPlus` — tức đây là 1 cờ bật/tắt theo TỪNG tenant, không phải cờ global cho toàn hệ thống. Với 6 REST endpoint (list/detail/4 action), việc check cờ rất đơn giản vì `tenantId` luôn có sẵn từ JWT của user GMS trước khi chạm tới bất kỳ logic nghiệp vụ nào. Nhưng với luồng Kafka inbound `PARTNER_LINK.REQUEST.CREATE`, GMS **hoàn toàn không biết `tenantId`** cho tới khi resolve xong qua `partnerAccountPhone` (bước 1 trong gate) — nghĩa là về mặt kỹ thuật, GMS không thể kiểm tra cờ `PartnerLink:DriverPlus` cho tenant đích trước khi đã tìm ra tenant đó là ai.

### 3. Vấn đề cụ thể

`BR-DPL-CMN-008` mô tả hành vi khi cờ `off`: "request tạo mới từ D+ không tạo record và nhận `PARTNER_LINK.REQUEST.RESPONSE` `success=false`, mã `ERR-DPL-011`" — nhưng không nói rõ bước check cờ này nằm ở ĐÂU trong trình tự 3 bước gate đã liệt kê tường minh ở §3.11 (bước 4). Có 2 khả năng hợp lý: Khả năng A — cờ được check ngay SAU khi resolve tenant thành công (trước single-active guard) — nghĩa là nếu 1 SĐT không khớp garage nào, D+ vẫn nhận `ERR-DPL-013` bất kể cờ garage đích (giả sử garage đó tồn tại) đang bật hay tắt, vì garage chưa được xác định. Khả năng B — cờ được check ngay từ đầu bằng cách nào đó trước cả bước resolve (không khả thi kỹ thuật vì chưa biết tenant, trừ khi có 1 cờ global riêng che hết mọi tenant). Với `WITHDRAW`/`UNLINK` cũng cùng câu hỏi: nếu `requestCode` resolve ra đúng 1 tenant nhưng tenant đó đang tắt cờ, GMS có tiếp tục xử lý transition (vì record đã tồn tại từ lúc `CREATE`, không phải "tạo mới") hay chặn luôn theo đúng tinh thần "chặn toàn bộ API/action" của `BR-DPL-CMN-008` mục (b)?

### 4. Ảnh hưởng nếu không giải quyết

- Dev BE phải tự suy đoán thứ tự implement, có rủi ro làm sai lệch với ý định nghiệp vụ ban đầu của kill-switch (vốn được đặc tả để ngừng "toàn bộ khả năng phát sinh tác động mới" — §8 Feature-flag của FEAT), ví dụ vô tình vẫn tạo record `PENDING` cho 1 tenant đã tắt cờ nếu implement sai thứ tự.
- Test case cho case "kill-switch off + D+ gửi CREATE cho đúng garage đã tắt cờ" không có oracle rõ ràng để biết response mong đợi là `ERR-DPL-011` (ưu tiên cờ) hay `ERR-DPL-013`/thành công (ưu tiên resolve trước, bỏ qua cờ).
- Với `WITHDRAW`/`UNLINK`, nếu garage tắt cờ giữa lúc có 1 record `PENDING` đang chờ D+ tự hủy (`REQUEST.WITHDRAW`), không rõ GMS có tiếp tục cho phép record đó chuyển "Đã hủy liên kết" hay bị chặn hoàn toàn — ảnh hưởng trực tiếp tới tính đúng đắn của "giữ nguyên mọi record và audit hiện hữu" mà `BR-DPL-CMN-008` mục (e) cam kết.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Architecture xác nhận): chèn 1 bước rõ ràng "check flag" ngay SAU bước resolve tenant (vì chỉ từ bước đó mới có `tenantId` để tra cache flag) và TRƯỚC single-active guard cho `CREATE`; tương tự cho `WITHDRAW`/`UNLINK` — check flag ngay sau khi resolve `tenant_id` từ `requestCode`, trước khi validate `status`. Đồng thời làm rõ: nếu flag off, `WITHDRAW`/`UNLINK` có nên vẫn cho phép hủy (để tránh D+ bị "kẹt" 1 request không bao giờ resolve được trong lúc flag tắt) hay chặn cứng đồng bộ với REST.

### 6. Liên kết với các phát hiện khác

Cùng nhóm "gate order chưa đặc tả đầy đủ" như RR-001 (cùng bước 4 §3.11). Không thay thế RR nào cũ — đây là gap mới phát sinh từ việc ADR-029 v2/v3 đổi cơ chế resolve tenant khiến thứ tự với kill-switch trở nên không hiển nhiên như trước (khi còn `OriginTenantId` bắt buộc, tenant luôn biết trước khi vào gate).

### 7. Câu hỏi cho người dùng

(a) Check kill-switch ngay sau bước resolve tenant, trước single-active guard — nếu tenant đã tắt cờ, D+ luôn nhận `ERR-DPL-011` bất kể trạng thái single-active. (b) Bỏ qua kill-switch hoàn toàn cho riêng `WITHDRAW`/`UNLINK` (vẫn cho phép D+ tự hủy request đang chờ dù garage đã tắt tính năng) để tránh request bị kẹt vĩnh viễn, chỉ áp kill-switch cho `CREATE` và 6 REST endpoint. (c) Giữ nguyên như hiện tại, không đặc tả thêm, để team dev tự quyết khi implement — chấp nhận rủi ro không nhất quán giữa các agent/dev thực hiện.

### 8. Owner

Solution Architect (vì đây là quyết định thứ tự xử lý trong adapter gate, thuộc thẩm quyền kỹ thuật đã sở hữu toàn bộ ADR-029, cần đồng bộ với Backend Lead khi implement).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-004 [Trung bình] Bảo mật — Cơ chế resolve tenant qua SĐT tại `PARTNER_LINK.REQUEST.CREATE` tạo ra kênh dò quét (phản hồi khác nhau giữa "SĐT tồn tại" và "SĐT không tồn tại") mà không có giới hạn tần suất nào được đặc tả

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L63-L66)
- **Section**: §3.1 Auth model.
- **Dòng**: 63-66.
- **Quote nguyên văn**:
  > Scope / permission | `gf-system`: read+write `AC-DEV-PARTNER-LINK-EVENTS`. ... Driver Plus: đối xứng trên 2 topic đầu...
  > Multi-tenant strategy | **1 credential chung cho mọi tenant**; cô lập tenant ở tầng **message**...

### 2. Bối cảnh nghiệp vụ

Theo mô hình auth ở §3.1, Driver Plus chỉ cần 1 credential Kafka duy nhất (SASL/IAM broker-level) để publish bất kỳ message nào lên topic `AC-DEV-PARTNER-LINK-EVENTS` — không có kiểm soát nào ở tầng nghiệp vụ giới hạn tần suất hay số lượng message `PARTNER_LINK.REQUEST.CREATE` mà "phía Driver Plus" (thực chất là bất kỳ ai có quyền publish lên topic đó, kể cả nếu credential bị lộ hoặc 1 service nội bộ D+ bị compromise) có thể gửi. Mỗi message CREATE với 1 `partnerAccountPhone` khác nhau sẽ nhận về đúng 1 trong 2 kết quả phân biệt được: `success=false, error.code=ERR-DPL-013` (SĐT này không thuộc garage nào) hoặc `success=true`/`ERR-DPL-010` (SĐT này CÓ thuộc 1 garage — dù bị chặn do single-active guard, phản hồi đó vẫn tiết lộ garage tồn tại).

### 3. Vấn đề cụ thể

Việc phân biệt rạch ròi 2 nhánh phản hồi (tìm thấy garage vs không tìm thấy) qua đúng field `error.code` biến cơ chế resolve-theo-SĐT thành 1 kênh "có/không" mà bên gửi message (bất kỳ ai điều khiển được 1 client Kafka hợp lệ trên topic này) có thể dùng để dò xem 1 số điện thoại bất kỳ có đang là SĐT liên hệ đăng ký của garage nào trong hệ thống GMS hay không — về bản chất là 1 dạng "user enumeration" áp dụng cho garage thay vì user. Tài liệu không đề cập bất kỳ giới hạn tần suất (rate limit), giám sát bất thường (anomaly detection theo volume CREATE từ cùng 1 nguồn), hay cơ chế nào khác để giảm thiểu rủi ro dò quét này ở tầng message — khác hẳn với REST 6 endpoint đã có "Rate limit REST: 20 req/s per tenant" (`gf-system-HLD.md` §7.6) được đặc tả rõ.

### 4. Ảnh hưởng nếu không giải quyết

- Một bên có quyền publish hợp lệ trên topic (kể cả 1 phần hệ thống D+ bị lộ credential, hoặc do lỗi phân quyền IAM/MSK nội bộ) có thể lần lượt gửi hàng loạt SĐT để xác định garage nào đang hoạt động trong GMS, phục vụ mục đích không chính đáng (dò tìm đối tác cạnh tranh, thu thập danh sách khách hàng GMS).
- Không có cơ chế phát hiện: metric `gate.rejections` theo `error_code=ERR-DPL-013` chỉ đo tổng số, không có ngưỡng cảnh báo cho hành vi dò quét hàng loạt (khác các alert khác đã có ngưỡng cụ thể như "Gate rejection rate > 20% trong 15 phút").
- Test case bảo mật không có oracle để assert hệ thống có/không giới hạn số lượng request CREATE bất thường từ 1 nguồn trong khoảng thời gian ngắn.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Security Lead + Architecture xác nhận mức độ rủi ro thực tế do kênh Kafka broker-level ACL đã có 1 lớp kiểm soát truy cập riêng, khác hẳn REST public): cân nhắc thêm 1 ngưỡng rate-limit ở tầng consumer cho message step `PARTNER_LINK.REQUEST.CREATE` theo nguồn gửi (nếu phân biệt được), hoặc bổ sung alert riêng khi tỷ lệ `ERR-DPL-013` tăng đột biến trong khoảng thời gian ngắn — tương tự pattern "Gate rejection rate" đã có ở §8.4.

### 6. Liên kết với các phát hiện khác

Liên quan tới RR-001 (cùng cơ chế resolve theo SĐT) — nếu RR-001 được giải quyết bằng cách tách case ambiguous ra mã lỗi riêng, nên đồng thời cân nhắc rủi ro dò quét ở đây để tránh 3 mã lỗi (013/014/010) lại tạo ra 1 kênh phân loại còn chi tiết hơn cho kẻ dò quét.

### 7. Câu hỏi cho người dùng

(a) Bổ sung rate-limit/anomaly alert riêng cho `PARTNER_LINK.REQUEST.CREATE` theo tần suất `ERR-DPL-013`, chấp nhận thêm effort kỹ thuật cho 1 rủi ro được đánh giá là có thật dù xác suất thấp (kênh Kafka nội bộ, không public). (b) Chấp nhận rủi ro hiện tại vì kênh Kafka đã có ACL broker-level bảo vệ và Driver Plus là đối tác nội bộ tin cậy, không cần bổ sung kiểm soát thêm ở tầng nghiệp vụ. (c) Đánh giá lại toàn bộ mô hình threat của tích hợp Driver Plus qua 1 buổi security review riêng trước khi quyết định.

### 8. Owner

Security Lead + Solution Architect (Security Lead đánh giá mức độ rủi ro thực tế của kênh Kafka nội bộ; Solution Architect quyết định có đáng đầu tư thêm kiểm soát hay không).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-005 [Cao] Thiếu phủ — ADR-030 Gap 2 (backfill `tenant_profile` cho tenant cũ) được viết trước khi ADR-029 v2 biến SĐT garage thành khoá bắt buộc để tạo yêu cầu liên kết — mức độ nghiêm trọng của gap đã tăng nhưng chưa được 2 tài liệu tham chiếu chéo lại với nhau

### 1. Trích dẫn nguồn

- **File**: [ADR-030-tenant-profile-sot-on-gf-system.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-030-tenant-profile-sot-on-gf-system.md#L73-L74)
- **Section**: Consequences — Tiêu cực/gap.
- **Dòng**: 73-74.
- **Quote nguyên văn**:
  > **Gap 2 — backfill tenant hiện hữu**: tenant đã provisioning trước W07 không có row `tenant_profile`. Cần 1 backfill job/one-off script từ `ct-saas-tenant` hoặc để `NULL` và render rỗng. Đọc phải null-safe: response trả field `null`, UI hiển thị rỗng — **KHÔNG** chặn Duyệt/Đồng bộ (không có AC nào yêu cầu bắt buộc đủ hồ sơ mới được Duyệt).

### 2. Bối cảnh nghiệp vụ

ADR-030 được chốt ngày 2026-08-05, ở thời điểm đó `tenant_profile` chỉ đóng vai trò dữ liệu HIỂN THỊ (khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS" trên form chi tiết và trong điều khoản Duyệt) — nên Gap 2 kết luận đúng rằng thiếu `tenant_profile` chỉ gây "hiển thị rỗng", hoàn toàn không chặn bất kỳ hành động nghiệp vụ nào. Nhưng 6 ngày sau (2026-08-11), ADR-029 v2 (gap G3) thay đổi hoàn toàn vai trò của chính cột `tenant_profile.contact_phone_number`: nó không còn chỉ để hiển thị nữa mà trở thành KHOÁ DUY NHẤT để GMS xác định garage nào là đích đến của 1 yêu cầu liên kết mới từ Driver Plus (`gf-system-events.md` §3.11 bước 4). Một garage như "Garage Thành Công" được provisioning từ năm 2025 (trước Wave 7, trước khi bảng `tenant_profile` tồn tại) sẽ có `contact_phone_number = NULL` cho tới khi có job backfill chạy.

### 3. Vấn đề cụ thể

Với garage "Garage Thành Công" nêu trên: khi tài xế Driver Plus gửi `PARTNER_LINK.REQUEST.CREATE` với `partnerAccountPhone` đúng bằng số điện thoại thật của garage này, câu truy vấn resolve `WHERE contact_phone_number = '...'` sẽ trả về **0 dòng** (vì `tenant_profile` không có row nào cho tenant này) — request bị từ chối ngay từ vòng gate đầu tiên với `ERR-DPL-013` ("Không tìm thấy garage nào đăng ký số điện thoại này"), dù garage này hoàn toàn có thật và đang hoạt động bình thường trên GMS. Nói cách khác: Gap 2 của ADR-030 (viết "KHÔNG chặn Duyệt/Đồng bộ") đã bị chính ADR-029 v2 làm SAI LỆCH bản chất — giờ đây thiếu backfill không còn là vấn đề hiển thị nữa mà CHẶN HOÀN TOÀN khả năng NHẬN yêu cầu liên kết đầu tiên của bất kỳ garage cũ nào chưa có `tenant_profile`. Đây không phải là 1 AC nào mới bị bỏ sót, mà là 1 tiền đề nền tảng ("không chặn nghiệp vụ") của 1 ADR đã ACCEPTED bị đảo ngược bởi 1 ADR khác ACCEPTED sau đó, mà không có bất kỳ dòng nào trong `ADR-029` v2/v3 hoặc `gf-system-events.md` nhắc lại và đối chiếu với Gap 2 của `ADR-030`.

### 4. Ảnh hưởng nếu không giải quyết

- Toàn bộ garage được provisioning trước khi Wave 7 triển khai (rất có thể là phần lớn garage đang hoạt động thật trên hệ thống, vì đây là baseline production) sẽ không thể nhận bất kỳ yêu cầu liên kết Driver Plus nào cho tới khi có 1 job backfill riêng chạy xong — nhưng theo đúng câu chữ hiện tại của ADR-030, backfill vẫn đang là 1 lựa chọn TÙY CHỌN ("hoặc để NULL"), không phải yêu cầu bắt buộc trước khi ship tính năng.
- Nếu team dev đọc đúng câu "KHÔNG chặn Duyệt/Đồng bộ" của ADR-030 và bỏ qua việc backfill vì tưởng đây chỉ là vấn đề UI, tính năng "Liên kết Driver Plus" trên thực tế sẽ không hoạt động được cho đa số garage hiện hữu ngay từ ngày ra mắt, dẫn tới tỷ lệ lỗi `ERR-DPL-013` tăng vọt mà nguyên nhân gốc không phải do SĐT sai mà do thiếu dữ liệu nền.
- Test case E2E "Driver Plus gửi yêu cầu liên kết hợp lệ tới 1 garage có thật" có nguy cơ luôn fail trên môi trường test nếu dữ liệu test garage không được backfill `tenant_profile` thủ công trước, khiến kết quả test gây hiểu lầm là lỗi tính năng trong khi thực chất là thiếu dữ liệu chuẩn bị.
- Success Metric của epic ("Tỷ lệ yêu cầu Chờ liên kết được xử lý trong 24h ≥ 80%" — `EP-PARTNER-LINK.md` §6) sẽ không đo được chính xác nếu số lượng lớn garage cũ không nhận được request nào ngay từ đầu do bị chặn ở gate resolve.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Solution Architect + Business Authority xác nhận): nâng Gap 2 của ADR-030 từ "tuỳ chọn" thành "bắt buộc" — yêu cầu chạy backfill job cho toàn bộ tenant hiện hữu TRƯỚC khi bật `PartnerLink:DriverPlus` cho garage đó (có thể đưa vào Entry Criteria của `PKG-W07` §3, hiện `PKG-W07` chưa liệt kê hạng mục backfill `tenant_profile` này trong danh sách entry criteria đã đọc). Đồng thời bổ sung 1 dòng cascade rõ ràng trong `ADR-029` v2/v3 trỏ ngược về Gap 2 của `ADR-030` để 2 tài liệu không rời rạc nhau.

### 6. Liên kết với các phát hiện khác

Cùng nhóm dữ liệu nguồn với RR-001 (đều liên quan `tenant_profile.contact_phone_number` dùng làm khoá resolve). Không thay thế RR-012 cũ trực tiếp nhưng có liên quan gần — RR-012 cũ nói về "tenant_profile rỗng vẫn thành công không cảnh báo" ở bước Duyệt; RR-005 này chỉ ra 1 tầng vấn đề sớm hơn và nghiêm trọng hơn: tenant_profile rỗng khiến garage còn KHÔNG THỂ nhận được request để mà Duyệt. Xem thêm RR-007 (bên dưới) — phần diễn giải lại RR-012 cũ theo đúng bối cảnh mới.

### 7. Câu hỏi cho người dùng

(a) Bắt buộc chạy backfill `tenant_profile` cho toàn bộ tenant hiện hữu trước khi bật kill-switch `PartnerLink:DriverPlus` lần đầu, đưa thành 1 mục Entry Criteria cứng của Wave 7. (b) Chấp nhận garage cũ sẽ không nhận được request cho tới khi tự phát sinh 1 sự kiện khác kích hoạt tạo `tenant_profile` (ví dụ garage tự cập nhật hồ sơ ở 1 màn hình tương lai), coi đây là giới hạn tạm thời được truyền thông rõ cho vận hành. (c) Đổi cơ chế resolve tại `REQUEST.CREATE` sang có thêm 1 nguồn dữ liệu dự phòng (vd fallback query sang bảng khác đang có SĐT garage) để không phụ thuộc hoàn toàn vào `tenant_profile` mới.

### 8. Owner

Solution Architect + Business Authority (Solution Architect vì đây là hệ luỵ kỹ thuật giữa 2 ADR; Business Authority vì cần quyết định có chấp nhận trì hoãn tính năng cho garage cũ hay bắt buộc backfill trước khi ra mắt).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-006 [Trung bình] Thiếu phủ — Cờ `truncated` khi danh sách vượt cap phòng vệ 500 dòng được đặc tả rõ ở tầng BE nhưng FE "có thể hiện hint (không bắt buộc)", nghĩa là garage có thể mất dữ liệu khỏi màn hình mà không có bất kỳ dấu hiệu nào

### 1. Trích dẫn nguồn

- **File**: [INTEG-FE-garage-web-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md#L329-L329)
- **Section**: §3.9, dòng UI mapping "Không có ô tìm kiếm / thanh phân trang".
- **Dòng**: 329.
- **Quote nguyên văn**:
  > AC-6, `BR-DPL-LST-004` — **deviation có chủ đích**. FE **KHÔNG** render `MainFilter` search box, **KHÔNG** render pagination. BE trả `truncated=true` khi vượt cap 500 → FE **có thể** hiện hint (**không bắt buộc**).

### 2. Bối cảnh nghiệp vụ

Garage đã hoạt động lâu năm với nhiều tài khoản Driver Plus đã từng thử liên kết (bị Từ chối, bị Hủy) cộng dồn theo thời gian — vì `BR-DPL-CMN-006` quy định record terminal giữ **vĩnh viễn**, không bao giờ bị xoá hay archive. `gf-system-api.md` §3bis đặc tả rõ: khi số record thoả filter vượt 500, server chỉ trả về 500 dòng mới nhất theo `requested_at DESC` kèm cờ `truncated: true`, còn các record cũ hơn (vd request từ 3 năm trước) hoàn toàn biến mất khỏi response, không hiển thị trên panel trái nữa.

### 3. Vấn đề cụ thể

Cờ `truncated` được BE tính toán và trả về đầy đủ, nhưng dòng đặc tả FE lại ghi rõ ràng việc hiển thị hint cho user là "**không bắt buộc**" — tức FE hoàn toàn hợp lệ nếu KHÔNG hiển thị bất kỳ dấu hiệu nào cho garage biết rằng danh sách họ đang xem đã bị cắt bớt. Với 1 garage đã bị cắt (`truncated=true`), nhân viên kế toán mở màn "Liên kết" sẽ thấy đúng 500 item gần nhất, không có gì báo hiệu rằng còn nhiều record lịch sử hơn đang tồn tại nhưng không hiển thị — họ sẽ tin tưởng rằng danh sách đang xem là ĐẦY ĐỦ.

### 4. Ảnh hưởng nếu không giải quyết

- Nhân viên tra cứu lịch sử liên kết (vd phục vụ audit hoặc giải quyết khiếu nại với 1 tài khoản D+ cũ) sẽ không tìm thấy record vì nó đã rơi ra ngoài 500 dòng gần nhất, và không có bất kỳ gợi ý nào để họ biết cần tìm ở đâu khác — trong khi tính năng lại không có ô tìm kiếm/phân trang để tự khắc phục.
- Mâu thuẫn trực tiếp với chính rule `BR-DPL-CMN-006` ("giữ vĩnh viễn... phục vụ tra cứu lịch sử + kiểm toán không giới hạn thời gian") — dữ liệu được giữ vĩnh viễn trong DB nhưng UI lại có thể không bao giờ cho user thấy được phần dữ liệu cũ đó, khiến cam kết "phục vụ kiểm toán" trở thành lời hứa suông về mặt trải nghiệm thực tế.
- Test case cho kịch bản "garage có >500 record lịch sử" không có oracle rõ ràng để assert UI PASS hay FAIL, vì tài liệu cho phép cả 2 cách triển khai (có hint hoặc không).

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Product Designer + Business Authority xác nhận): nâng việc hiển thị hint `truncated=true` (vd banner "Chỉ hiển thị 500 yêu cầu gần nhất, còn X yêu cầu cũ hơn không hiển thị") từ "không bắt buộc" thành bắt buộc, để nhất quán với cam kết retention vĩnh viễn của `BR-DPL-CMN-006` — đồng thời cân nhắc bổ sung khả năng lọc theo khoảng thời gian nếu nhu cầu audit lịch sử thực sự phát sinh trong tương lai.

### 6. Liên kết với các phát hiện khác

Thay thế RR-006 cũ (nội dung cũ nói "giới hạn 500 dòng không có AC mô tả hành vi UI khi vượt ngưỡng") — nay tài liệu MỚI đã bổ sung cờ `truncated` ở tầng API (khác bản cũ hoàn toàn không có cơ chế nào), nhưng lại chốt rõ ràng là "không bắt buộc" hiển thị, nên bản chất gap đã đổi từ "thiếu cơ chế" sang "có cơ chế nhưng cho phép bỏ qua nó" — cần viết lại finding theo đúng nội dung mới này thay vì giữ nguyên RR-006 cũ.

### 7. Câu hỏi cho người dùng

(a) Bắt buộc FE hiển thị hint khi `truncated=true` để garage luôn biết dữ liệu đang bị cắt, chấp nhận thêm 1 dòng UI mới cần thiết kế. (b) Giữ nguyên "không bắt buộc" như hiện tại, chấp nhận rủi ro garage không biết dữ liệu bị cắt vì nghiệp vụ thực tế hiếm khi có garage vượt 500 record. (c) Bổ sung khả năng lọc theo khoảng thời gian gửi yêu cầu để garage tự truy cập được phần dữ liệu cũ hơn khi cần, thay vì chỉ hiển thị cảnh báo.

### 8. Owner

Product Designer + Business Authority (Product Designer vì cần thiết kế UI hint cụ thể; Business Authority vì cần quyết định mức độ ưu tiên của nhu cầu tra cứu lịch sử dài hạn).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-007 [Trung bình] Trạng thái — Sau khi ADR-029 v2 khiến case "tenant_profile hoàn toàn rỗng" không còn xảy ra được ở bước tạo request, case "hồ sơ garage rỗng MỘT PHẦN" (có SĐT nhưng thiếu tên/địa chỉ) vẫn có thể khiến Duyệt/Đồng bộ thành công mà không cảnh báo

### 1. Trích dẫn nguồn

- **File**: [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L645-L645)
- **Section**: §3bis, GET detail — bảng field response.
- **Dòng**: 645.
- **Quote nguyên văn**:
  > `data.garageProfile.*` | 5 field, nullable | Đọc **real-time** `tenant_profile`; `null` khi tenant chưa có hồ sơ (ADR-030 Gap 2) → UI render rỗng, **KHÔNG** chặn action | `FEAT` AC-11 · CB-SYS-006

### 2. Bối cảnh nghiệp vụ

Vì cơ chế resolve tenant tại `PARTNER_LINK.REQUEST.CREATE` (ADR-029 v2) bắt buộc phải khớp được `partnerAccountPhone` với `tenant_profile.contact_phone_number`, nên kể từ Wave 7 trở đi, bất kỳ garage nào ĐÃ có record `partner_link_request` (dù ở trạng thái nào) chắc chắn ĐÃ có ít nhất giá trị `contact_phone_number` không rỗng trong `tenant_profile` — tình huống "tenant_profile hoàn toàn không tồn tại row" chỉ còn xảy ra TRƯỚC bước tạo request (chặn ở `ERR-DPL-013`, xem RR-005), không còn xảy ra SAU khi record đã được tạo. Nhưng `tenant_profile` có 5 cột: `tenant_id`, `business_name`, `contact_phone_number`, `address_detail`, `ward`, `city` — chỉ `contact_phone_number` chắc chắn có giá trị (vì đó là điều kiện resolve), còn `business_name`/`address_detail`/`ward`/`city` hoàn toàn có thể vẫn `NULL` (nếu job seed từ `TenantProvisionedEvent` gặp payload thiếu field, hoặc do dữ liệu provisioning cũ không đầy đủ).

### 3. Vấn đề cụ thể

Đoạn trích ở mục 1 vẫn giữ nguyên logic "profile null → UI render rỗng → KHÔNG chặn action" áp dụng chung cho toàn bộ 5 field, không phân biệt trường hợp "thiếu 1 phần" (có SĐT, thiếu tên doanh nghiệp) so với "thiếu hoàn toàn". Với case thiếu 1 phần này, khi nhân viên garage bấm "Duyệt" ở modal AC-12, khối điều khoản "Mục 1. Thông tin garage" sẽ hiển thị tên doanh nghiệp RỖNG cho D+ đọc trước khi tick đồng ý chia sẻ — và khi Duyệt thành công, dữ liệu rỗng đó (business_name = null) sẽ thực sự được đẩy sang Driver Plus qua `PARTNER_LINK.PROFILE.SYNC` mà không có bất kỳ cảnh báo nào cho nhân viên garage biết rằng hồ sơ họ đang chia sẻ chưa đầy đủ.

### 4. Ảnh hưởng nếu không giải quyết

- Driver Plus nhận được 1 bản ghi hồ sơ garage với tên doanh nghiệp/địa chỉ trống trong khi phía garage tin rằng mình vừa "duyệt liên kết" bình thường, không biết dữ liệu chia sẻ đi bị thiếu.
- Nhân viên garage đọc điều khoản chia sẻ ở AC-12 với trường "Tên doanh nghiệp" hiển thị trống nhưng vẫn có thể tick checkbox và bấm "Đồng ý liên kết" vì không có validation nào yêu cầu hồ sơ đầy đủ mới cho Duyệt — trải nghiệm đọc điều khoản trở nên vô nghĩa khi 1 phần nội dung đang cam kết chia sẻ lại trống rỗng.
- Test case cho kịch bản "garage có tenant_profile với business_name null nhưng contact_phone_number có giá trị" không có oracle rõ ràng cho việc UI có nên cảnh báo/chặn hay không, vì tài liệu chỉ nói chung chung "không chặn" mà không phân biệt mức độ thiếu.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Product Designer + Business Authority xác nhận): bổ sung 1 cảnh báo (không nhất thiết phải chặn action, tuân thủ đúng quyết định "không có AC yêu cầu đủ hồ sơ mới Duyệt") ở modal Duyệt AC-12 khi phát hiện 1 hoặc nhiều field trong khối "Thông tin garage" đang rỗng, giúp nhân viên biết trước khi tick đồng ý chia sẻ 1 hồ sơ chưa hoàn chỉnh.

### 6. Liên kết với các phát hiện khác

Diễn giải lại (thay thế) RR-012 cũ — nội dung cũ nói chung chung "tenant_profile rỗng vẫn thành công không cảnh báo"; nay sau khi đọc kỹ ADR-029 v2 (RR-005), case "rỗng hoàn toàn" đã không còn khả thi ở bước tạo request nữa (bị chặn sớm hơn bởi `ERR-DPL-013`), nên bản chất gap thu hẹp lại đúng còn case "rỗng một phần" như mô tả ở đây.

### 7. Câu hỏi cho người dùng

(a) Bổ sung cảnh báo (không chặn) khi 1 phần khối "Thông tin garage" đang trống lúc mở modal Duyệt, để nhân viên biết trước khi đồng ý chia sẻ. (b) Giữ nguyên hành vi hiện tại (âm thầm gửi field trống, không cảnh báo) vì tần suất xảy ra thấp và garage có thể tự phát hiện qua chính nội dung điều khoản đang đọc.

### 8. Owner

Product Designer + Business Authority (Product Designer thiết kế cảnh báo; Business Authority quyết định có cần enforce chất lượng dữ liệu trước khi chia sẻ ra đối tác ngoài hay không).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-008 [Cao] Thiếu phủ — D+ không nhận được bất kỳ phản hồi nào cho `REQUEST.WITHDRAW`/`UNLINK`, kể cả khi message bị bỏ qua do lỗi resolve `requestCode` (gap G4) — không có kênh nào giúp D+ tự phát hiện lỗi tái sử dụng mã sai

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L713-L713)
- **Section**: §4 Workflow correlation — "Partner Link ↔ Driver Plus" chain.
- **Dòng**: 713.
- **Quote nguyên văn**:
  > 5. Chiều ngược (D+ withdraw/unlink) chỉ đổi state cục bộ, **KHÔNG** phát noti ngược. Resolve tenant qua lookup `partner_link_request` theo `requestCode` (ADR-029 v3 gap G4), **không** đọc `OriginTenantId` (D+ không gửi).

### 2. Bối cảnh nghiệp vụ

Theo thiết kế mới của ADR-029 v3 (gap G4), Driver Plus BẮT BUỘC phải lưu và tái sử dụng chính xác `requestCode` (mã `LKD-YYYY-NNN`) đã sinh lúc `REQUEST.CREATE` cho mọi message `REQUEST.WITHDRAW`/`UNLINK` tiếp theo của cùng 1 lần liên kết — đây là "điều kiện tiên quyết thiết kế" mà chính ADR-029 v3 (Consequences, mục cuối) thừa nhận là "ngoài phạm vi kiểm soát kỹ thuật của GMS". Giả sử hệ thống Driver Plus có 1 lỗi (bug hoặc thay đổi hành vi không thông báo) khiến nó tự sinh 1 mã mới `LKD-2026-999` thay vì tái sử dụng đúng `LKD-2026-050` gốc khi gửi `PARTNER_LINK.REQUEST.WITHDRAW`.

### 3. Vấn đề cụ thể

Với message `WITHDRAW`/`UNLINK` sai `requestCode` như trên, GMS sẽ resolve ra 0 record khớp và theo đúng tài liệu, chỉ "**ack + skip** + log warning" (`gf-system-events.md` dòng 504) — nghĩa là GMS coi như đã xử lý xong message (ack), không có bất kỳ response event nào được publish ngược lại D+ để báo "tôi không tìm thấy request nào khớp mã này". Chính `ADR-029` v3 (Consequences) đã tự nhận định: "nếu D+ đổi hành vi trở lại sinh mã mới mỗi lần bắn, cơ chế resolve sẽ luôn ra 0 record và toàn bộ `WITHDRAW`/`UNLINK` bị ack+skip âm thầm. Không có cách nào ở phía GMS tự phát hiện regression này ngoài giám sát tỉ lệ ack+skip qua log warning." Điều này có nghĩa: (1) từ góc nhìn của D+, họ gửi "Hủy yêu cầu" nhưng garage vẫn tiếp tục thấy record ở trạng thái "Chờ liên kết"/"Đã liên kết" như chưa từng có gì xảy ra — vì D+ không có step phản hồi nào (`REQUEST.RESPONSE` chỉ tồn tại cho `CREATE`) để biết yêu cầu hủy của họ có thành công hay không; (2) việc phát hiện lỗi hoàn toàn phụ thuộc vào GIÁM SÁT THỦ CÔNG phía GMS (metric `outcome=skipped_unresolved`), không có cơ chế tự động nào cảnh báo ngược cho D+.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu Driver Plus có 1 lỗi triển khai khiến họ không tái sử dụng đúng `requestCode` gốc (kịch bản mà chính ADR-029 v3 liệt kê là rủi ro thật), toàn bộ luồng "D+ tự hủy yêu cầu" sẽ âm thầm không hoạt động cho tới khi có người vận hành GMS chủ động phát hiện qua log/metric — trong lúc đó, tài xế/garage phía D+ tin rằng họ đã hủy thành công nhưng thực tế garage vẫn giữ nguyên trạng thái liên kết cũ.
- Không có cơ chế nào ở phía Driver Plus để tự kiểm tra "tôi gửi WITHDRAW có thành công hay không" — khác hẳn với `REQUEST.CREATE` vốn luôn có `PARTNER_LINK.REQUEST.RESPONSE` xác nhận rõ ràng — tạo ra sự bất đối xứng lớn giữa 3 step inbound cùng 1 domain.
- Đội vận hành GMS phải tự phát hiện qua theo dõi thủ công tỉ lệ `skipped_unresolved`/`skipped_ambiguous`, đây là quy trình phản ứng (reactive) chứ không phải phòng ngừa, khiến thời gian phát hiện lỗi tích hợp thực tế có thể kéo dài.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Solution Architect + Business Authority xác nhận, vì đây là mở rộng contract ngoài phạm vi tài liệu hiện tại): cân nhắc bổ sung 1 response event tối thiểu (không cần đối xứng đầy đủ như `REQUEST.RESPONSE`) cho riêng nhánh lỗi "0 record khớp"/"ambiguous" của `WITHDRAW`/`UNLINK`, để D+ có ít nhất 1 tín hiệu phát hiện được regression phía họ mà không phải chờ GMS báo thủ công — đúng như chính "Threshold để re-evaluate" của ADR-029 đã chừa chỗ cho việc điều chỉnh khi phát sinh vấn đề vận hành thực tế.

### 6. Liên kết với các phát hiện khác

Diễn giải lại và mở rộng RR-014 cũ ("Không có ack cho WITHDRAW/UNLINK, khác nguyên tắc ADR-029") — nội dung cũ vẫn đúng về bản chất, nhưng ADR-029 v3 (gap G4, mới hoàn toàn so với bản đọc cũ 3 ngày trước) đã làm vấn đề nghiêm trọng hơn nhiều vì giờ đây thiếu ack còn đồng nghĩa với việc D+ không có cách nào phát hiện chính lỗi tái sử dụng mã của họ — đây là lý do chính đáng để nâng mức độ từ [Cao] giữ nguyên nhưng viết lại toàn bộ nội dung theo bối cảnh mới.

### 7. Câu hỏi cho người dùng

(a) Bổ sung 1 response event tối thiểu cho nhánh lỗi resolve thất bại của `WITHDRAW`/`UNLINK`, chấp nhận mở rộng contract Kafka đã chốt ACCEPTED. (b) Giữ nguyên thiết kế hiện tại (không có ack cho 2 step này dưới mọi hình thức), chấp nhận rủi ro vận hành đã được chính ADR-029 v3 ghi nhận và xử lý hoàn toàn bằng giám sát thủ công phía GMS. (c) Yêu cầu Driver Plus tự bổ sung 1 cơ chế đối soát định kỳ (reconciliation) — vd D+ định kỳ query lại trạng thái thật qua 1 API khác — thay vì chờ GMS phản hồi theo thời gian thực cho từng message.

### 8. Owner

Solution Architect + Business Authority (Solution Architect vì cần đánh giá lại contract đã ACCEPTED với ADR-029; Business Authority vì cần cân nhắc mức độ ưu tiên đầu tư thêm cho rủi ro vận hành đã biết trước).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-009 [Cao] Khả năng tiếp cận — Checkbox điều khoản chia sẻ thông tin chỉ mô tả gate scroll-to-end bằng chuột, chưa có cơ chế cho người dùng bàn phím/screen-reader nhận biết đã đọc hết nội dung

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L127-L132)
- **Section**: Nhóm D, AC-13.
- **Dòng**: 127-132.
- **Quote nguyên văn**:
  > Khi: user chưa cuộn đến cuối nội dung điều khoản. Thì: checkbox **disabled** (không tick được); phía trên checkbox hiển thị hint **"Vui lòng cuộn xuống cuối để tiếp tục"**. Khi: user đã cuộn đến cuối nội dung điều khoản. Thì: checkbox chuyển sang enabled, hint biến mất, user có thể tick.

### 2. Bối cảnh nghiệp vụ

Nhân viên kế toán Lan Anh mở modal "Duyệt liên kết với Driver Plus" (AC-12) để duyệt tài khoản D+ của tài xế Nguyễn Văn Sơn. Nội dung khối "Điều khoản chia sẻ thông tin" khá dài (2 mục: Thông tin garage + Thông tin xuất hoá đơn). Theo AC-13, checkbox chỉ chuyển sang enabled sau khi hành động "cuộn" (scroll) chạm đáy container. Đây là hành vi đã được kiểm tra qua nhiều vòng BA-review (tới v35) nhưng luôn được mô tả bằng đúng 1 động từ "cuộn" gắn với thao tác chuột/vuốt cảm ứng.

### 3. Vấn đề cụ thể

Tài liệu không mô tả điều gì xảy ra khi Lan Anh điều hướng modal này hoàn toàn bằng bàn phím (Tab để focus vào vùng nội dung, dùng Page Down/mũi tên để đọc) hoặc dùng screen reader (JAWS/NVDA/VoiceOver) — 2 câu hỏi cụ thể chưa được trả lời: (1) việc dùng phím mũi tên/Page Down cuộn nội dung có kích hoạt cùng sự kiện "đã cuộn đến cuối" như thao tác chuột hay không; (2) khi checkbox chuyển từ disabled sang enabled, có bất kỳ thông báo nào (`aria-live` region hoặc tương đương) để user dùng screen reader biết được trạng thái đã thay đổi hay họ phải tự dò lại toàn bộ DOM để phát hiện.

### 4. Ảnh hưởng nếu không giải quyết

- Người dùng khuyết tật vận động (không dùng được chuột/cảm ứng mượt) hoặc dùng screen reader có nguy cơ không bao giờ enable được checkbox nếu cơ chế phát hiện "cuộn đến cuối" chỉ lắng nghe sự kiện scroll của chuột/cảm ứng mà không bắt được scroll bằng bàn phím — khiến họ hoàn toàn không thể hoàn tất hành động Duyệt, chặn đứng 1 nghiệp vụ có tác động pháp lý (chia sẻ dữ liệu doanh nghiệp ra ngoài).
- Vi phạm nguyên tắc accessibility cơ bản (WCAG 2.1 AA — thao tác không được phụ thuộc hoàn toàn vào con trỏ chuột) cho 1 luồng có tính chất consent/pháp lý, rủi ro cao hơn các màn hình thông thường khác.
- QA không có tiêu chí rõ ràng để viết test case accessibility cho AC-13, dễ bỏ sót hoàn toàn nhánh kiểm thử này.

### 5. Đề xuất giải quyết

Đề xuất (giả định, theo best practice WCAG 2.1 AA cho pattern "scroll-to-accept"): (1) đảm bảo listener phát hiện "đã cuộn đến cuối" bắt được cả sự kiện scroll sinh ra từ phím (Page Down/mũi tên/Space khi vùng nội dung đang focus), không chỉ sự kiện chuột/cảm ứng; (2) bổ sung 1 phương án thay thế không phụ thuộc cuộn — ví dụ khi vùng nội dung nhận đủ 1 lượt focus + Tab tới cuối bằng bàn phím cũng được coi là "đã đọc"; (3) thêm `aria-live="polite"` hoặc tương đương khi checkbox chuyển trạng thái enabled để screen reader thông báo ngay.

### 6. Liên kết với các phát hiện khác

Cùng mẫu với PL cũ RR-001 (đây chính là finding kế thừa RR-001, nội dung AC-13 hoàn toàn không đổi giữa 2 lần đọc — xác nhận vẫn còn nguyên).

### 7. Câu hỏi cho người dùng

(a) Bổ sung đặc tả accessibility rõ ràng cho AC-13 (scroll bằng phím + aria-live), coi đây là 1 phần bắt buộc của Definition of Done cho feature này vì có tính chất pháp lý. (b) Chấp nhận rủi ro hiện tại, coi đây là nợ kỹ thuật accessibility chung của cả hệ thống (không riêng feature này) và xử lý ở 1 sáng kiến accessibility tổng thể sau này. (c) Yêu cầu Frontend Lead tự đảm bảo tuân thủ theo component-registry sẵn có (nếu registry đã có sẵn pattern accessible scroll-gate) mà không cần bổ sung AC mới.

### 8. Owner

Product Designer + Frontend Lead (Product Designer vì cần quyết định UX thay thế cho người dùng không dùng chuột; Frontend Lead vì cần xác nhận component registry hiện có đã hỗ trợ accessible pattern này chưa).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-010 [Cao] Bảo mật — Nội dung "Lý do" free-text (cả garage nhập lẫn Driver Plus gửi kèm WITHDRAW/UNLINK) được nội suy trực tiếp vào chuỗi `notification.message` gửi cho bên còn lại mà không có quy tắc escaping/sanitize nào được đặc tả

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L613-L618)
- **Section**: §3.14 `PartnerLinkStatusChanged`, bảng wording.
- **Dòng**: 613-618.
- **Quote nguyên văn**:
  > `REJECTED` | Từ chối do user thao tác (AC-19) | `Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã bị từ chối. Lý do: {Lý do do garage nhập}.` | `BR-DPL-NOTI-002` · AC-37

### 2. Bối cảnh nghiệp vụ

Nhân viên kế toán Lan Anh mở modal "Từ chối yêu cầu liên kết" (AC-17) và gõ vào textarea "Lý do từ chối" một chuỗi tuỳ ý, tối đa 2.000 ký tự, chỉ bị chặn khi rỗng hoặc vượt giới hạn (`BR-DPL-REJ-002`) — không có ràng buộc nào khác về nội dung (không lọc ký tự đặc biệt, không chặn HTML/script tag, không chặn markdown). Chuỗi này sau đó được GMS nội suy trực tiếp vào vị trí `{Lý do do garage nhập}` trong template `notification.message` rồi gửi nguyên văn cho Driver Plus qua Kafka event `PARTNER_LINK.STATUS.CHANGED` — nếu D+ render chuỗi này trực tiếp lên UI ứng dụng tài xế (nhiều khả năng có, vì đây là nội dung thông báo cho end-user D+ đọc) mà không tự escape phía họ, bất kỳ ký tự đặc biệt nào Lan Anh gõ vào sẽ được hiển thị y nguyên phía D+.

### 3. Vấn đề cụ thể

Vấn đề 1 (chiều garage → D+): tài liệu không có bất kỳ dòng nào yêu cầu GMS escape/sanitize nội dung "Lý do" trước khi nội suy vào `notification.message`, cũng như không có cam kết/giả định nào về việc Driver Plus có tự escape khi render phía họ hay không — 2 hệ thống độc lập, không rõ trách nhiệm escaping thuộc về bên nào. Vấn đề 2 (chiều D+ → garage, cùng câu hỏi gốc, đối xứng): payload `PARTNER_LINK.UNLINK`/`REQUEST.WITHDRAW` từ D+ mang field `reason` tự do (`gf-system-events.md` dòng 493), được lưu thẳng vào `partner_link_request.reason` và hiển thị trên UI GMS (section "THÔNG TIN XỬ LÝ", cả web lẫn card mobile theo `BR-DPL-LST-005`) — nếu Driver Plus (hoặc 1 client giả mạo có quyền publish lên topic) gửi 1 chuỗi chứa mã độc, không có dòng nào xác nhận GMS có escape trước khi render lên `garage-web`/`garage-mobile` hay không.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu Driver Plus render `notification.message` trực tiếp mà không escape, garage có thể vô tình (hoặc cố ý) chèn nội dung độc hại vào UI của đối tác ngoài thông qua trường "Lý do" hợp lệ trong nghiệp vụ của chính GMS.
- Nếu `garage-web`/`garage-mobile` render field `reason` đến từ Driver Plus (bên ngoài, không qua validate nội dung ngoài rule "free text") mà không escape, đây là 1 vector XSS cổ điển (stored XSS) — dữ liệu từ nguồn không tin cậy (external partner) được lưu vào DB rồi render lại cho user GMS mà không qua bước làm sạch nào được đặc tả.
- Test case bảo mật không có oracle rõ ràng để assert hệ thống có chặn/escape input dạng `<script>`, markdown injection, hay ký tự điều khiển hay không ở cả 2 chiều.

### 5. Đề xuất giải quyết

Đề xuất (theo best practice OWASP — output encoding tại điểm render, không phải tại điểm nhập liệu): (1) `garage-web`/`garage-mobile` phải escape mọi field tự do đến từ nguồn ngoài (`reason` payload D+) trước khi render, theo đúng cơ chế escaping mặc định của framework UI đang dùng (React tự escape theo mặc định khi không dùng `dangerouslySetInnerHTML` — cần xác nhận component render "Lý do" hiện tại có tuân thủ không); (2) làm rõ với đội Driver Plus (qua `INTEG-EXT-driver-plus.md`) rằng `notification.message` là raw text, trách nhiệm escape khi render thuộc về phía họ — bổ sung dòng ghi chú tường minh trong hợp đồng tích hợp.

### 6. Liên kết với các phát hiện khác

Kế thừa và gộp 3 finding cũ RR-002 ("Free text Lý do Từ chối/Hủy không sanitize khi gửi ra D+"), RR-013 ("Lý do WITHDRAW/UNLINK từ D+ không sanitize"), và RR-022 ("escaping khi nội suy tên vào notification.message") — cả 3 cùng chung 1 câu hỏi gốc (ai chịu trách nhiệm escape dữ liệu tự do khi đi qua ranh giới GMS ↔ Driver Plus) nên gộp vào 1 mã theo đúng quy tắc mục 5.4 §3 của skill.

### 7. Câu hỏi cho người dùng

(a) GMS chủ động escape/sanitize toàn bộ field tự do trước khi gửi ra ngoài (notification.message) VÀ trước khi render field đến từ ngoài (reason của D+) lên UI GMS, không phụ thuộc vào việc bên kia có tự bảo vệ hay không. (b) Chỉ đảm bảo phía GMS tự bảo vệ chiều nhận vào (render `reason` từ D+ an toàn), còn chiều gửi ra để nguyên trách nhiệm escaping cho Driver Plus tự xử lý theo hợp đồng tích hợp đã thống nhất ngoài phạm vi tài liệu GMS. (c) Xác nhận component UI hiện tại (React) đã tự động escape theo mặc định và không cần thêm xử lý gì, chỉ cần audit lại code để đảm bảo không có chỗ nào dùng `dangerouslySetInnerHTML`/tương đương cho field này.

### 8. Owner

Security Lead (vì đây là câu hỏi về ranh giới trách nhiệm bảo mật giữa 2 hệ thống và cơ chế output encoding, cần thẩm quyền bảo mật chốt chính sách chung).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-011 [Trung bình] Tuân thủ — Không có trường nào lưu lại phiên bản/nội dung cụ thể của "Điều khoản chia sẻ thông tin" mà garage đã đồng ý tại thời điểm Duyệt

### 1. Trích dẫn nguồn

- **File**: [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L688-L696)
- **Section**: §3bis, POST approve — Request body.
- **Dòng**: 688-696.
- **Quote nguyên văn**:
  > `{ "termsAccepted": true }` ... `termsAccepted` | Boolean | Yes | Phải `true`; `false`/thiếu → 400. ... Nội dung "Điều khoản chia sẻ thông tin" **không** đến từ API — DEV dùng bản tóm tắt 2 mục dựng sẵn ở FE, Legal thay câu chữ sau qua CR. Server chỉ ghi nhận sự đồng ý.

### 2. Bối cảnh nghiệp vụ

Khi chủ garage Đăng Vinh bấm "Đồng ý liên kết" ở modal AC-12, hệ thống chỉ gửi lên server đúng 1 boolean `termsAccepted: true` — không kèm theo bất kỳ định danh nào cho biết ANH ĐÃ ĐỒNG Ý VỚI PHIÊN BẢN NỘI DUNG ĐIỀU KHOẢN NÀO. Theo chính change log của FEAT (v33, 2026-08-10), nội dung điều khoản "không phải bản tạm... nhưng Legal có thể thay câu chữ sau qua CR" — nghĩa là nội dung điều khoản CÓ khả năng thay đổi trong tương lai (khi Legal hoàn thiện câu chữ pháp lý).

### 3. Vấn đề cụ thể

Vì nội dung điều khoản chỉ tồn tại dưới dạng "bản tóm tắt dựng sẵn ở FE" (client-side, không phải server-side versioned content), và server chỉ lưu đúng 1 boolean cờ đồng ý, nếu Legal cập nhật câu chữ điều khoản 6 tháng sau, GMS sẽ KHÔNG có cách nào biết được chủ garage Đăng Vinh đã đồng ý với đúng nội dung nào tại thời điểm Duyệt — record duy nhất anh ta để lại là "đã đồng ý" (true), không phải "đã đồng ý với văn bản X phiên bản Y".

### 4. Ảnh hưởng nếu không giải quyết

- Nếu phát sinh tranh chấp pháp lý về việc garage có thực sự được thông báo đầy đủ nội dung chia sẻ dữ liệu trước khi đồng ý hay không, GMS không có bằng chứng cụ thể (snapshot nội dung + phiên bản) để đối chiếu, chỉ có 1 cờ boolean vô nghĩa về mặt chứng cứ.
- Khi Legal cập nhật điều khoản, không có cơ chế nào yêu cầu garage đã Duyệt từ trước phải đồng ý lại theo nội dung mới — record cũ vẫn hiển thị "Đã liên kết" như thể garage đã đồng ý với bản mới nhất.
- Đây là rủi ro tuân thủ (PDPD — Nghị định bảo vệ dữ liệu cá nhân VN, được `INTEG-EXT-driver-plus.md` §10 chính thức dẫn chiếu) vì tính minh bạch của việc chia sẻ dữ liệu doanh nghiệp phụ thuộc vào bằng chứng consent cụ thể.

### 5. Đề xuất giải quyết

Đề xuất (giả định, theo thông lệ compliance chung — versioned consent record): bổ sung 1 trường `termsVersion` (hoặc tương đương) trong request body approve, đại diện cho phiên bản nội dung điều khoản mà FE đang hiển thị tại thời điểm user tick — server lưu lại giá trị này cùng `processedAt` để có thể tra cứu về sau đúng garage đã đồng ý với văn bản phiên bản nào.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-005 cũ ("Điều khoản chia sẻ thông tin không lưu phiên bản đã chấp thuận") — nội dung vẫn còn nguyên vẹn dù nội dung điều khoản đã được chốt chính thức ở v33 (khác bản đọc cũ khi điều khoản còn NEED CONFIRMATION); bản chất gap không đổi: dù nội dung đã chốt, vẫn không có cơ chế lưu phiên bản consent.

### 7. Câu hỏi cho người dùng

(a) Bổ sung trường versioning cho nội dung điều khoản + lưu lại khi Duyệt, chấp nhận thêm 1 field vào API + FE. (b) Chấp nhận rủi ro hiện tại vì nội dung điều khoản hiếm khi thay đổi và rủi ro tranh chấp thấp trong bối cảnh B2B nội bộ.

### 8. Owner

Legal/Compliance + Solution Architect (Legal/Compliance đánh giá mức độ rủi ro pháp lý cần bằng chứng consent; Solution Architect quyết định cơ chế versioning kỹ thuật).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-012 [Trung bình] Thiếu phủ — Wording modal "Đồng bộ lại" và cả 4 mẫu notification outbound đều nội suy `{Tên garage}`/`{Tên garage}` nhưng không có fallback khi `tenant_profile.business_name` là NULL

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L177-L177)
- **Section**: Nhóm F, AC-20.
- **Dòng**: 177.
- **Quote nguyên văn**:
  > hệ thống mở modal **"Đồng bộ lại thông tin sang D+"** với text **"Bạn có xác nhận gửi lại thông tin garage hiện tại của {Tên garage} sang Driver Plus."**

### 2. Bối cảnh nghiệp vụ

Kế toán Lan Anh của 1 garage có `tenant_profile.business_name = NULL` (vd do chưa từng backfill, xem RR-005/RR-007) bấm nút "Đồng bộ lại thông tin sang D+" ở form chi tiết của 1 record đã "Đã liên kết". Modal xác nhận cần nội suy `{Tên garage}` vào đúng vị trí trong câu — nhưng nguồn dữ liệu cho placeholder này (được đọc real-time từ `tenant_profile.business_name` theo CB-SYS-006) đang là NULL.

### 3. Vấn đề cụ thể

Không có bất kỳ dòng nào trong FEAT hoặc BR mô tả fallback text khi `{Tên garage}` không có giá trị — 2 khả năng render ra màn hình: Khả năng A — chuỗi hiển thị nguyên văn lỗi "Bạn có xác nhận gửi lại thông tin garage hiện tại của **null** sang Driver Plus." (bug hiển thị rõ ràng nếu FE không xử lý). Khả năng B — FE tự ý xử lý bằng cách ẩn khoảng trắng, cho ra câu cụt "...của sang Driver Plus." (ngữ pháp sai). Cùng câu hỏi gốc áp dụng cho cả 4 mẫu wording notification outbound (`BR-DPL-NOTI-001..004`) đều dùng `{Tên garage}` — nếu garage chưa có `business_name`, Driver Plus cũng sẽ nhận thông báo với cùng vấn đề hiển thị.

### 4. Ảnh hưởng nếu không giải quyết

- Garage nhìn thấy modal xác nhận với nội dung lỗi ("null" hoặc câu cụt ngữ pháp), gây mất niềm tin vào chất lượng sản phẩm ngay tại 1 hành động xác nhận quan trọng.
- Driver Plus nhận notification với tên garage rỗng/lỗi, giảm tính chuyên nghiệp của tích hợp và có thể gây khó hiểu cho tài xế đọc thông báo.
- QA không có wording chuẩn để assert khi viết test case cho garage chưa backfill hồ sơ.

### 5. Đề xuất giải quyết

Đề xuất (giả định): định nghĩa 1 fallback text ngắn gọn khi `business_name` null, ví dụ dùng lại tên garage hiển thị mặc định của hệ thống (nếu có sẵn ở nơi khác trong GMS, như tên tenant gốc) hoặc 1 cụm trung tính "garage của bạn" thay cho việc nội suy trực tiếp giá trị null.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-016 cũ ("{Tên garage} NULL không có fallback wording") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid nguyên vẹn. Liên quan tới RR-007 (cùng nguồn gốc dữ liệu `tenant_profile` có thể thiếu 1 phần).

### 7. Câu hỏi cho người dùng

(a) Định nghĩa 1 fallback text cụ thể cho `{Tên garage}` khi null, áp dụng đồng nhất cho cả modal xác nhận và 4 mẫu notification. (b) Chấp nhận rủi ro hiện tại và để FE tự xử lý theo quy ước chung của component-registry (nếu registry đã có sẵn cơ chế xử lý placeholder rỗng).

### 8. Owner

Product Designer (vì cần quyết định wording fallback cụ thể cho cả 5 vị trí sử dụng placeholder này).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-013 [Trung bình] Biên — Không có ràng buộc độ dài tối đa nào được đặc tả cho các trường payload đến từ Driver Plus dùng làm dữ liệu domain (`requestCode`, `partnerAccountName`, `partnerAccountPhone`, `reason` của WITHDRAW/UNLINK)

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L467-L493)
- **Section**: §3.11, bảng field payload `PARTNER_LINK.REQUEST.CREATE` và `WITHDRAW`/`UNLINK`.
- **Dòng**: 467-473, 490-493.
- **Quote nguyên văn**:
  > `requestCode` | String | ✅ | `EP-PARTNER-LINK` §3 (mã `LKD-YYYY-NNN` do D+ tự sinh) ... `partnerAccountName` | String | ✅ | `FEAT` AC-9 ... `partnerAccountPhone` | String | ✅ | **SĐT garage** D+ muốn liên kết...

### 2. Bối cảnh nghiệp vụ

Tất cả field trong bảng payload trên chỉ ghi kiểu dữ liệu "String" và mức độ bắt buộc, hoàn toàn không có cột "Max length" hay ràng buộc định dạng nào khác (khác hẳn với các field do chính GMS user nhập, như "Lý do" luôn có ràng buộc rõ ràng "tối đa 2.000 ký tự" ở `BR-DPL-REJ-002`/`BR-DPL-CAN-002`). Các giá trị này sau đó được ghi thẳng vào các cột tương ứng của bảng `partner_link_request` (`request_code`, `partner_account_name`, `partner_account_phone`, `reason`) — các cột DB này chắc chắn có 1 giới hạn kiểu dữ liệu vật lý nào đó (VARCHAR(n)) dù tài liệu Product/Architecture không nêu con số cụ thể.

### 3. Vấn đề cụ thể

Nếu Driver Plus (do lỗi hoặc do dữ liệu tài khoản D+ không chuẩn hoá) gửi 1 `partnerAccountName` dài bất thường (ví dụ 5.000 ký tự), không có tài liệu nào cho biết GMS sẽ: Khả năng A — reject message này ngay từ adapter gate với 1 lỗi validation cụ thể (giống cách xử lý payload sai nghiệp vụ khác). Khả năng B — cố insert vào DB và gặp lỗi tầng thấp (DB constraint violation) không được kiểm soát, có thể làm crash consumer hoặc gây message bị redeliver vô hạn nếu lỗi xảy ra trước bước ack.

### 4. Ảnh hưởng nếu không giải quyết

- Rủi ro vận hành: 1 payload bất thường từ D+ (dù vô tình hay cố ý) có thể gây lỗi tầng DB không được xử lý gọn gàng, ảnh hưởng tới toàn bộ consumer group xử lý topic `AC-DEV-PARTNER-LINK-EVENTS` nếu message bị kẹt lại và redeliver liên tục.
- UI hiển thị `partnerAccountName`/`partnerAccountPhone` trên panel trái/card mobile không có giới hạn wrap/truncate được đặc tả (khác `BR-DPL-LST-005` đã có ellipsis riêng cho "tên tài khoản D+ / lý do" — nhưng đó là hành vi UI, không phải giới hạn dữ liệu ở tầng lưu trữ).
- Test case validate payload biên (giá trị cực dài) không có oracle rõ ràng để assert hành vi mong đợi.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Backend Lead xác nhận theo giới hạn cột DB thực tế sẽ định nghĩa ở migration): bổ sung 1 bước validate độ dài tối đa (khớp với giới hạn cột DB) tại adapter gate cho các field `requestCode`/`partnerAccountName`/`partnerAccountPhone`, coi vượt giới hạn là "payload sai nghiệp vụ" (ack + response event lỗi, không ghi domain table) theo đúng pattern đã áp dụng cho các lỗi payload khác.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-018 cũ ("payload inbound requestCode/partnerAccountName vượt độ dài cột DB") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid nguyên vẹn.

### 7. Câu hỏi cho người dùng

(a) Bổ sung validate độ dài tối đa tại adapter gate cho các field từ D+, reject có kiểm soát khi vượt giới hạn. (b) Chấp nhận rủi ro hiện tại, dựa vào việc Driver Plus là đối tác tin cậy hiếm khi gửi dữ liệu bất thường, chỉ xử lý khi sự cố thực sự xảy ra.

### 8. Owner

Backend Lead (vì cần định nghĩa giới hạn cột DB cụ thể trước khi có thể validate ở tầng adapter).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-014 [Trung bình] Mơ hồ — `BR-DPL-CMN-006` cam kết giữ record terminal "vĩnh viễn" nhưng `BR-DPL-LST-004` lại giới hạn danh sách trả về tối đa 500 dòng — 2 rule cùng 1 domain có thể mâu thuẫn nhau về lâu dài với garage hoạt động nhiều năm

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L99-L99) và [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L517-L517)
- **Section**: §2.5.1 BR-DPL-CMN-006 (retention) và §3bis GET list (cap 500).
- **Dòng**: BR-GF-SYSTEM.md dòng 99; gf-system-api.md dòng 517.
- **Quote nguyên văn**:
  > (BR-GF-SYSTEM.md) Record ở trạng thái terminal ... cùng audit log kèm theo ... **giữ VĨNH VIỄN trong DB active** — KHÔNG xóa, KHÔNG archive, KHÔNG chuyển cold-storage. Phục vụ tra cứu lịch sử + kiểm toán không giới hạn thời gian.
  >
  > (gf-system-api.md) Server áp **cap phòng vệ 500 row** — vượt cap thì trả 500 row mới nhất + `truncated=true`.

### 2. Bối cảnh nghiệp vụ

`BR-DPL-LST-004` giải thích lý do chọn bỏ phân trang là vì "mỗi garage tối đa 1 tài khoản D+ active tại 1 thời điểm nên danh sách yêu cầu thực tế luôn ngắn" — lập luận này đúng cho SỐ LƯỢNG RECORD ĐANG HOẠT ĐỘNG (chỉ có tối đa 1 "Đã liên kết" + vài "Chờ liên kết" tạm thời), nhưng lại không tính tới việc `BR-DPL-CMN-006` cam kết giữ TOÀN BỘ lịch sử terminal vĩnh viễn — 1 garage sau 5-10 năm hoạt động, liên tục đổi qua nhiều tài khoản D+ khác nhau (mỗi lần Hủy rồi Duyệt tài khoản mới đều để lại ≥1 record terminal), hoàn toàn có thể tích luỹ vượt 500 record.

### 3. Vấn đề cụ thể

Đây chính là gap đã nêu ở RR-006 (không bắt buộc hiển thị hint truncated) nhưng ở đây tôi muốn nêu riêng khía cạnh MÂU THUẪN GIỮA 2 RULE tại tầng Business Rules: `BR-DPL-CMN-006` hứa hẹn "phục vụ tra cứu lịch sử + kiểm toán không giới hạn thời gian" — đây là 1 cam kết chức năng (tra cứu được), trong khi `BR-DPL-LST-004` (cùng đứng ở §2.5, cùng 1 file business rules) lại quy định cơ chế list duy nhất hiện có (không tìm kiếm, không phân trang, cap 500) không đủ khả năng thực hiện đúng cam kết "tra cứu không giới hạn thời gian" khi vượt ngưỡng.

### 4. Ảnh hưởng nếu không giải quyết

- 2 rule cùng mức T1 (Business Rules chính thức) trong cùng 1 tài liệu mô tả 2 cam kết không tương thích với nhau về lâu dài, gây khó khăn khi Business Authority cần dẫn chiếu rule nào là ưu tiên khi có xung đột thực tế.
- Đội audit/kiểm toán nội bộ tin tưởng vào cam kết "giữ vĩnh viễn, tra cứu không giới hạn" của `BR-DPL-CMN-006` nhưng không biết rằng công cụ tra cứu duy nhất (màn hình Liên kết) có giới hạn kỹ thuật ẩn.

### 5. Đề xuất giải quyết

Đề xuất (giả định): làm rõ ràng ranh giới của cam kết `BR-DPL-CMN-006` — ví dụ "vĩnh viễn trong DB, có thể tra cứu qua kênh khác (DB trực tiếp/BI) khi vượt 500 record hiển thị trên UI", để tránh đọc rule này như 1 cam kết UI tuyệt đối.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-020 cũ ("Retention 'vĩnh viễn' bị vô hiệu do giới hạn 500-row"); liên quan chặt với RR-006 (cùng chủ đề cap 500, nhưng RR-006 tập trung khía cạnh UX hint còn finding này tập trung khía cạnh mâu thuẫn văn bản giữa 2 BR).

### 7. Câu hỏi cho người dùng

(a) Làm rõ trong văn bản `BR-DPL-CMN-006` rằng cam kết "tra cứu không giới hạn" chỉ áp dụng ở tầng dữ liệu (DB), không đảm bảo qua UI danh sách hiện tại. (b) Nâng cấp cơ chế UI (bổ sung tìm kiếm/lọc theo thời gian) để thực sự đáp ứng đúng cam kết ban đầu của rule.

### 8. Owner

Business Authority (vì cần quyết định lại phạm vi thực sự của cam kết retention đã công bố).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-015 [Trung bình] Thiếu phủ — Mobile không có màn hình lỗi tải danh sách ban đầu tương đương "banner + nút Tải lại" của web, dù cùng dùng chung mã lỗi ERR-DPL-007

### 1. Trích dẫn nguồn

- **File**: [INTEG-MOB-garage-mobile-agg-garage-graph.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md#L180-L195)
- **Section**: §3.6, bảng UI Action.
- **Dòng**: 180-195.
- **Quote nguyên văn**: (toàn bộ bảng 14 dòng UI action của mobile — không có dòng nào tương đương dòng web "Banner lỗi load danh sách + nút 'Tải lại'" cite `ERR-DPL-007`).

### 2. Bối cảnh nghiệp vụ

Đối chiếu trực tiếp: `INTEG-FE-garage-web-agg-garage-graph.md` dòng 332 có hẳn 1 dòng UI action riêng: "Banner lỗi load danh sách + nút 'Tải lại' | `/partner-links` | ↑ (`ErrorResponse` `ERR-DPL-007`) | — | UX-FLOW §4. Bind message theo `ERROR-CODE-REGISTRY` §5". Khi chủ garage Đăng Vinh mở màn "Liên kết" trên web và server trả lỗi 503 (`ERR-DPL-007`, DB tạm thời không đọc được), anh ta thấy 1 banner cụ thể kèm nút bấm để thử lại. Nhưng bảng UI mapping tương đương của mobile (`INTEG-MOB` §3.6, 14 dòng từ tab bottom-nav tới race condition) hoàn toàn không có dòng nào mô tả hành vi UI khi `listPartnerLinkRequests` trả lỗi hệ thống lúc tải màn hình lần đầu.

### 3. Vấn đề cụ thể

Vì đây là danh sách dạng card không có sẵn "banner cạnh panel" như web (web có sẵn khung layout master-detail để đặt banner), mobile cần 1 pattern UI khác hẳn (toàn màn hình lỗi + nút thử lại, hay pattern nào khác theo chuẩn Mobile Lead đang dùng) — nhưng tài liệu hoàn toàn im lặng về việc chọn pattern nào, khác biệt với việc cả 2 platform đều đã mô tả rất kỹ 2 loại empty-state (dòng 188-189) chỉ riêng error-state ban đầu là bị bỏ sót.

### 4. Ảnh hưởng nếu không giải quyết

- Dev mobile không có đặc tả để implement màn lỗi tải danh sách ban đầu, có nguy cơ tự chọn 1 pattern không nhất quán với chuẩn UI chung của app hoặc bỏ sót hoàn toàn (màn hình trắng/card rỗng gây hiểu lầm là "chưa có yêu cầu nào" thay vì "lỗi tải dữ liệu").
- QA không có oracle để viết test case cho "mobile mở tab Liên kết khi server lỗi 503" — không biết kỳ vọng UI hiển thị gì để assert.
- Rủi ro người dùng mobile nhầm lẫn giữa trạng thái "chưa có yêu cầu nào" (`ERR-DPL-008`) và "lỗi tải dữ liệu" (`ERR-DPL-007`) nếu app không phân biệt rõ 2 case này khi không có đặc tả UI riêng cho lỗi.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Mobile Lead xác nhận theo pattern UI chuẩn của `garage-mobile`): bổ sung 1 dòng UI mapping cho mobile tương đương web, mô tả pattern lỗi toàn màn hình hoặc banner đầu danh sách + nút thử lại, cùng cite `ERR-DPL-007`, đồng bộ với UX-FLOW-PARTNER-LINK §4 vốn đã ghi chú "Mobile equivalent" áp dụng chung cho toàn bảng Empty/Error/Loading (theo change log v18 của FEAT) nhưng chưa được cụ thể hoá thành 1 dòng UI mapping riêng trong INTEG-MOB.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-044 cũ ("mobile thiếu UI lỗi tải danh sách ban đầu") — xác nhận CÒN NGUYÊN VẸN sau khi đọc lại `INTEG-MOB-garage-mobile-agg-garage-graph.md` §3.6 mới nhất, gap chưa được bổ sung dù đã qua nhiều lần cascade khác của tài liệu này (tới v10).

### 7. Câu hỏi cho người dùng

(a) Bổ sung 1 dòng UI mapping mobile cho error-state tải danh sách ban đầu, chọn pattern cụ thể (toàn màn hình hoặc banner) trước khi DEV. (b) Xác nhận mobile dùng chung pattern lỗi chung của app (đã có sẵn ở 1 màn khác) mà không cần đặc tả riêng — chỉ cần ghi rõ tên pattern tái sử dụng trong tài liệu.

### 8. Owner

Mobile Lead (vì cần xác nhận pattern UI lỗi chuẩn hiện có của `garage-mobile` có áp dụng được cho case này không).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-016 [Trung bình] Thiếu phủ — `Execution/SERVICE-BOUNDARY-MATRIX.md` vẫn chưa backfill "Partner Link" vào cột Modules của boundary `gf-system`, dù đã được chính `ARCH-REVIEW-W07.md` và `PKG-W07` ghi nhận là việc còn thiếu

### 1. Trích dẫn nguồn

- **File**: [SERVICE-BOUNDARY-MATRIX.md](../../../requirements/gara/wave-07/Execution/SERVICE-BOUNDARY-MATRIX.md#L21-L21)
- **Section**: Bảng boundary ownership, dòng 2 (`gf-system`).
- **Dòng**: 21.
- **Quote nguyên văn**:
  > | 2 | `gf-system` | agent-dev-gf-system | gf-system | Tenant provisioning, quota cache, branch creation, invoice info, transporter registry, sequences | EP-FOUND | ...

### 2. Bối cảnh nghiệp vụ

Cột "Modules" của dòng `gf-system` liệt kê 6 module: "Tenant provisioning, quota cache, branch creation, invoice info, transporter registry, sequences" — hoàn toàn không có "Partner Link" dù đây đã là 1 domain P1 của Wave 7, đã có 6 REST endpoint, 6 message step Kafka, 2 bảng DB mới. Chính `Tracking/ARCH-REVIEW-W07.md` (dòng 45) đã tự ghi nhận: "`Execution/SERVICE-BOUNDARY-MATRIX.md` row 2 (`gf-system`) 'Modules' column doesn't yet list 'Partner Link' — matrix file wasn't in this commit's scope; likely expected to be updated separately." Và `PKG-W07-partner-link-booking-driver-plus.md` (dòng 116, mục Entry Criteria) vẫn còn checkbox CHƯA tick: "`SERVICE-BOUNDARY-MATRIX` module Partner Link/document sync được backfill theo governance."

### 3. Vấn đề cụ thể

Đây KHÔNG phải là 1 phỏng đoán — đã verify trực tiếp bằng cách đọc lại nội dung file `SERVICE-BOUNDARY-MATRIX.md` mới nhất hôm nay (2026-08-14) và xác nhận cột Modules của `gf-system` vẫn giữ nguyên 6 module cũ, KHÔNG có "Partner Link" hay "partner-link" xuất hiện ở bất kỳ đâu trong toàn bộ file. Việc backfill này vẫn đang là 1 Entry Criteria CHƯA HOÀN THÀNH của chính Wave 7 (checkbox rỗng), nghĩa là gap này KHÔNG chỉ là 1 quan sát tài liệu đơn thuần mà còn là 1 điều kiện tiên quyết được chính team tự đặt ra nhưng chưa thực hiện.

### 4. Ảnh hưởng nếu không giải quyết

- Agent/dev tương lai tra cứu `SERVICE-BOUNDARY-MATRIX.md` để hiểu phạm vi module của boundary `gf-system` sẽ không biết rằng domain Partner Link cũng thuộc boundary này, có nguy cơ đặt code/logic Partner Link sai boundary hoặc bỏ sót khi audit phạm vi sở hữu module.
- Entry Criteria của `PKG-W07` §3 chưa đủ điều kiện hoàn thành theo đúng tiêu chí tự đặt ra — nếu wave tiếp tục triển khai DEV mà bỏ qua checklist này, đây là 1 governance gap thực sự chứ không chỉ lý thuyết.
- KG (Knowledge Graph) hoặc công cụ tự động dựa vào `SERVICE-BOUNDARY-MATRIX.md` để định tuyến review/audit có thể bỏ sót hoàn toàn domain Partner Link khi quét theo boundary.

### 5. Đề xuất giải quyết

Đề xuất: bổ sung "Partner Link" vào cột Modules của dòng `gf-system` trong `SERVICE-BOUNDARY-MATRIX.md`, hoàn tất đúng checklist Entry Criteria đã tự đặt ra ở `PKG-W07` §3 trước khi bắt đầu DEV chính thức.

### 6. Liên kết với các phát hiện khác

Kế thừa nguyên vẹn RR-048 cũ ("KG/SERVICE-BOUNDARY-MATRIX chưa backfill Partner Link, UNVERIFIED") — nay đã được XÁC MINH TRỰC TIẾP (không còn UNVERIFIED) bằng cách đọc lại file thật + đối chiếu 2 nguồn độc lập khác (`ARCH-REVIEW-W07.md`, `PKG-W07`) đều xác nhận cùng 1 kết luận.

### 7. Câu hỏi cho người dùng

(a) Bổ sung ngay "Partner Link" vào `SERVICE-BOUNDARY-MATRIX.md` trước khi tiếp tục coi Wave 7 đủ điều kiện DEV. (b) Chấp nhận hoãn việc backfill này sang 1 bước governance riêng sau DEV, không coi là blocker.

### 8. Owner

DevOps/SRE Lead + Solution Architect (DevOps/SRE Lead vì đây là tài liệu vận hành/governance; Solution Architect vì cần xác nhận nội dung mô tả module chính xác).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-017 [Trung bình] Tương tranh — Chưa đặc tả hành vi khi Delivery Authority tắt kill-switch `PartnerLink:DriverPlus` đúng lúc 1 user đang giữa chừng thao tác (modal đang mở, đã gửi request nhưng response chưa về)

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L425-L428)
- **Section**: AC-43.
- **Dòng**: 425-428.
- **Quote nguyên văn**:
  > Tại: `PartnerLink:DriverPlus` đang `on`, hệ thống có thể đã có dữ liệu yêu cầu/liên kết. Khi: Delivery Authority chuyển flag sang `off`. Thì: Web/Mobile ẩn menu/tab "Liên kết"; mọi thao tác và API Liên kết bị chặn...

### 2. Bối cảnh nghiệp vụ

Chủ garage Đăng Vinh đang mở modal "Duyệt liên kết với Driver Plus" (AC-12), đã tick xong checkbox điều khoản, chuẩn bị bấm "Đồng ý liên kết". Đúng thời điểm đó, Delivery Authority (vì Driver Plus gặp sự cố diện rộng) tắt flag `PartnerLink:DriverPlus` sang `off`. AC-43 mô tả rất rõ hành vi TỔNG THỂ khi flag off (ẩn menu, chặn API) nhưng không mô tả CHÍNH XÁC điều gì xảy ra với modal đang mở sẵn của Đăng Vinh — vì menu/tab chỉ ẩn khi re-render lại (load lại trang/điều hướng), modal hiện tại của anh vẫn đang hiển thị trên màn hình.

### 3. Vấn đề cụ thể

Có 2 khả năng khi Đăng Vinh bấm "Đồng ý liên kết" ngay sau khi flag vừa tắt: Khả năng A — request `POST .../approve` gửi lên vẫn bị chặn ở BE (403 `GMS.gf-system.PARTNER_LINK.FLAG_OFF`), nhưng FE hiện tại không có toast/message riêng cho case này trong bảng lỗi đã liệt kê ở AC-27/AC-29/AC-31 (chỉ có `ERR-DPL-004/005/006`, không có xử lý cho `FLAG_OFF` xuất hiện giữa modal action) — user sẽ thấy lỗi gì? Khả năng B — nếu FE cache trạng thái flag từ lúc mở trang và không re-check tại thời điểm submit, request có thể silently fail theo cách không được người dùng hiểu (modal đứng yên, không phản hồi).

### 4. Ảnh hưởng nếu không giải quyết

- Người dùng cuối gặp lỗi không có message rõ ràng đúng lúc hệ thống đang trong tình huống khẩn cấp (sự cố Driver Plus, lý do khiến Delivery Authority phải tắt kill-switch) — đây là lúc trải nghiệm lỗi rõ ràng quan trọng nhất nhưng lại chưa được đặc tả.
- Dev BE/FE không có specification để xử lý nhất quán response `403 FLAG_OFF` xuất hiện bất ngờ giữa 1 action đang thực hiện (khác với case flag đã off từ đầu, lúc đó user còn không vào được màn hình).

### 5. Đề xuất giải quyết

Đề xuất (giả định): bổ sung 1 nhánh xử lý `403 GMS.gf-system.PARTNER_LINK.FLAG_OFF` vào bảng lỗi chung của cả 4 action (song song `ERR-DPL-004/005/006`), với toast riêng thông báo tính năng đang tạm ngừng, đóng modal, và ẩn menu ngay khi phát hiện (không cần chờ user tự reload).

### 6. Liên kết với các phát hiện khác

Kế thừa RR-040 cũ ("kill-switch off giữa lúc user đang thao tác") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid nguyên vẹn.

### 7. Câu hỏi cho người dùng

(a) Bổ sung nhánh xử lý lỗi `FLAG_OFF` riêng cho 4 action, với toast + tự động ẩn menu khi phát hiện flag vừa tắt giữa chừng thao tác. (b) Chấp nhận hành vi mặc định hiện có (lỗi hệ thống chung `ERR-DPL-005`) áp dụng luôn cho case này, không cần phân biệt riêng.

### 8. Owner

Frontend Lead + Backend Lead (cần thống nhất mã lỗi/toast cụ thể cho case race hiếm gặp này).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-018 [Thấp] Thiếu phủ — Endpoint GET detail dùng chung mã lỗi 503 `ERR-DPL-007` với endpoint GET list nhưng chỉ có UI mapping (banner + Tải lại) cho trường hợp list, chưa rõ hành vi UI khi chính detail của item đang xem gặp lỗi

### 1. Trích dẫn nguồn

- **File**: [gf-system-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-system-api.md#L659-L659)
- **Section**: §3bis, GET detail — Response 4xx/5xx.
- **Dòng**: 659.
- **Quote nguyên văn**:
  > `ERR-DPL-007` | 503 | Lỗi đọc DB

### 2. Bối cảnh nghiệp vụ

Khi Lan Anh mở màn "Liên kết", danh sách tải thành công (`listPartnerLinkRequests` OK) và item đầu tiên tự động được chọn (AC-3), nhưng ngay sau đó call `getPartnerLinkRequestDetail` cho item đó gặp lỗi DB tạm thời — trả về cùng mã `ERR-DPL-007` như khi list bị lỗi.

### 3. Vấn đề cụ thể

`INTEG-FE-garage-web-agg-garage-graph.md` chỉ có duy nhất 1 dòng UI mapping cho `ERR-DPL-007` — gắn với "Banner lỗi load danh sách" ở panel TRÁI. Không có dòng nào mô tả hành vi panel PHẢI (form chi tiết) khi chính API detail bị lỗi trong khi danh sách vẫn tải thành công bình thường — panel phải sẽ hiển thị gì: rỗng, spinner treo mãi, hay 1 banner lỗi riêng trong khung panel phải?

### 4. Ảnh hưởng nếu không giải quyết

- Dev FE có thể tái sử dụng nhầm banner của panel trái cho panel phải (sai vị trí UI) hoặc bỏ sót hoàn toàn, khiến panel phải treo ở trạng thái loading vô thời hạn khi lỗi xảy ra.
- QA không có oracle rõ ràng để viết test case cho case "list OK nhưng detail lỗi ngay lần tải đầu tiên".

### 5. Đề xuất giải quyết

Đề xuất (giả định): bổ sung 1 dòng UI mapping riêng cho panel phải khi `getPartnerLinkRequestDetail` lỗi, dùng cùng wording `ERR-DPL-007` nhưng đặt đúng vị trí (trong khung panel phải, kèm nút thử lại riêng cho detail).

### 6. Liên kết với các phát hiện khác

Kế thừa RR-042 cũ ("ERR-DPL-007 dùng chung list/detail chỉ list có UI") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid nguyên vẹn.

### 7. Câu hỏi cho người dùng

(a) Bổ sung UI mapping riêng cho panel phải khi detail lỗi. (b) Xác nhận panel phải tái sử dụng đúng pattern lỗi chung của panel trái (chỉ cần ghi rõ trong tài liệu, không cần thiết kế mới).

### 8. Owner

Frontend Lead (vì cần xác định pattern UI cụ thể cho panel phải).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-019 [Thấp] Mơ hồ — "Ghi nhớ filter trong phiên" (`BR-COMMON#SYS-RETRY-009`) không nói rõ F5/reload trang có được tính là "thoát session" hay không, trong khi state filter hiện đang giữ ở Zustand (in-memory, không sống sót qua reload)

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L109-L109)
- **Section**: §2.5.2, BR-DPL-LST-003.
- **Dòng**: 109.
- **Quote nguyên văn**:
  > **Persistence**: ghi nhớ lựa chọn filter trong phiên (session) theo default hệ thống `[BR-COMMON#SYS-RETRY-009]`; thoát session (đăng xuất / đóng app) → filter về lại default 2 trạng thái nêu trên.

### 2. Bối cảnh nghiệp vụ

`INTEG-FE-garage-web-agg-garage-graph.md` §4 xác nhận: "Zustand giữ tenant, filter, breadcrumb..." — đây là state quản lý bằng thư viện Zustand, mặc định lưu hoàn toàn trong bộ nhớ JS (không dùng `persist` middleware nào được nhắc tới). Khi Lan Anh chỉnh filter "Trạng thái liên kết" để chỉ xem "Từ chối" + "Đã hủy liên kết" rồi vô tình bấm F5 (reload trang, không phải đăng xuất/đóng app).

### 3. Vấn đề cụ thể

Câu chữ "thoát session (đăng xuất / đóng app)" chỉ liệt kê đúng 2 hành động cụ thể, không đề cập F5/reload trang. Về mặt kỹ thuật, nếu Zustand không dùng persist middleware, F5 chắc chắn sẽ xoá toàn bộ state filter (quay về default) dù đây không phải "đăng xuất/đóng app" theo đúng câu chữ — tức hành vi kỹ thuật thực tế có thể không khớp với đúng câu chữ đặc tả (chỉ liệt kê 2 trigger nhưng có 1 trigger thứ 3 ngoài ý muốn).

### 4. Ảnh hưởng nếu không giải quyết

- Không rõ đây là hành vi "chấp nhận được" (F5 được ngầm hiểu là 1 dạng thoát phiên) hay là 1 bug cần fix (F5 phải giữ được filter, cần đổi sang lưu vào sessionStorage).
- QA không có oracle rõ ràng để biết F5 giữ filter là PASS hay FAIL.

### 5. Đề xuất giải quyết

Đề xuất (giả định): làm rõ trong `BR-DPL-LST-003` liệu F5/reload trang có được coi là 1 trigger reset filter hợp lệ hay không; nếu không, cần đổi cơ chế lưu trữ filter sang `sessionStorage` (sống sót qua reload, mất khi đóng tab) thay vì Zustand in-memory thuần.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-023 cũ ("ghi nhớ filter khi F5") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid nguyên vẹn, mức độ vẫn thấp.

### 7. Câu hỏi cho người dùng

(a) Làm rõ F5 là 1 trigger reset hợp lệ, giữ nguyên cơ chế Zustand hiện tại. (b) Yêu cầu filter phải sống sót qua F5, đổi cơ chế lưu trữ sang `sessionStorage`.

### 8. Owner

Frontend Lead (vì đây là quyết định cơ chế lưu trữ state kỹ thuật cụ thể).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-020 [Thấp] Thiếu phủ — 4 wording notification outbound + các message inline/toast của feature không có đặc tả i18n dù `garage-mobile` đã ghi nhận yêu cầu "Locale VN/EN" cho riêng mobile

### 1. Trích dẫn nguồn

- **File**: [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L92-L92)
- **Section**: §2.2.6 Mobile — `garage-mobile`.
- **Dòng**: 92.
- **Quote nguyên văn**:
  > Locale VN/EN, Semantics labels, loading/empty/error states và widget tests cho lifecycle/action matrix.

### 2. Bối cảnh nghiệp vụ

Toàn bộ wording của feature — 4 mẫu notification outbound (`BR-DPL-NOTI-001..004`), toast xác nhận 4 action, 9 mã lỗi hiển thị UI (`ERR-DPL-001..009`) — đều chỉ được viết bằng đúng 1 ngôn ngữ (tiếng Việt) trong toàn bộ `FEAT-SYS-DRIVERPLUS-LINK.md`/`BR-GF-SYSTEM.md`/`ERROR-CODE-REGISTRY.md`. Nhưng dòng trích ở mục 1 (chỉ xuất hiện ở PKG-W07, phần công việc riêng cho mobile) lại yêu cầu tường minh "Locale VN/EN" như 1 hạng mục công việc DEV mobile phải làm.

### 3. Vấn đề cụ thể

Không rõ yêu cầu "Locale VN/EN" ở PKG-W07 áp dụng cho TOÀN BỘ nội dung feature (bao gồm cả 13 mã `ERR-DPL-*` + 4 wording notification) hay chỉ áp dụng cho phần khung UI chung (nhãn nút, tiêu đề màn hình — những phần vốn đã có sẵn cơ chế i18n chung toàn app) — trong khi nội dung nghiệp vụ cụ thể của Partner Link (toast, error message, notification) chỉ tồn tại dưới dạng chuỗi tiếng Việt cứng trong toàn bộ Product docs, không có bảng song ngữ nào.

### 4. Ảnh hưởng nếu không giải quyết

- Dev mobile không biết có cần dịch 13 mã lỗi + 4 notification sang tiếng Anh hay không khi implement locale EN, có nguy cơ để sót (chỉ dịch phần UI chung, giữ nguyên tiếng Việt cho phần nghiệp vụ) hoặc tự dịch không chính xác vì không có bản gốc tiếng Anh do Product cung cấp.
- QA không có oracle để kiểm tra bản dịch tiếng Anh của các message nghiệp vụ có đúng ý hay không.

### 5. Đề xuất giải quyết

Đề xuất (giả định): làm rõ phạm vi "Locale VN/EN" của PKG-W07 có bao gồm nội dung nghiệp vụ cụ thể (13 mã lỗi + 4 notification) hay không; nếu có, Business Authority cần cung cấp bản dịch tiếng Anh chính thức trước khi DEV, tương tự cách wording tiếng Việt đã được chốt chính thức.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-024 cũ ("không i18n cho 4 wording notification") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid, nay còn phát hiện thêm bối cảnh mới: PKG-W07 (tài liệu mới hoàn toàn so với lần đọc trước) có nhắc yêu cầu locale EN cho mobile khiến câu hỏi này trở nên cụ thể và cấp thiết hơn.

### 7. Câu hỏi cho người dùng

(a) Yêu cầu Business Authority cung cấp bản dịch tiếng Anh chính thức cho toàn bộ wording nghiệp vụ (13 mã lỗi + 4 notification) trước DEV mobile. (b) Giới hạn phạm vi "Locale VN/EN" chỉ áp dụng cho khung UI chung, giữ nguyên tiếng Việt cho toàn bộ nội dung nghiệp vụ vì đối tượng người dùng chính (garage VN) không cần bản tiếng Anh.

### 8. Owner

Business Authority (vì cần quyết định phạm vi i18n và cung cấp bản dịch chính thức nếu cần).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-021 [Thấp] Biên — Trường `processedByLabel` (snapshot "Tên nhân viên (Role)") không có giới hạn độ dài tối đa nào được đặc tả, dù tên nhân viên là input tự do khi tạo tài khoản

### 1. Trích dẫn nguồn

- **File**: [BR-GF-SYSTEM.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SYSTEM.md#L98-L98)
- **Section**: §2.5.1, BR-DPL-CMN-005.
- **Dòng**: 98.
- **Quote nguyên văn**:
  > Format snapshot: `{Tên nhân viên} ({Tên hiển thị role})`, VD `Đăng Vinh (Chủ garage)` / `Lan Anh (Kế toán)`.

### 2. Bối cảnh nghiệp vụ

Trường `processedByLabel` được ghép từ tên hiển thị thật của nhân viên (dữ liệu tự do, do chính nhân viên hoặc HR nhập lúc tạo tài khoản, không thuộc phạm vi kiểm soát của feature này) cộng thêm tên role cố định. Trên card mobile (`BR-DPL-LST-005`), trường này được hiển thị trực tiếp ngay trên item danh sách, có cơ chế ellipsis khi tràn dòng — nhưng đó là xử lý ở tầng UI (cắt hiển thị), không phải giới hạn ở tầng dữ liệu lưu trữ.

### 3. Vấn đề cụ thể

Không có tài liệu nào cho biết cột `processed_by_label` trong DB có giới hạn độ dài tối đa hay không, và nếu tên nhân viên gốc (từ hệ thống nhân sự) dài bất thường, giá trị ghép cuối cùng có bị cắt bớt một cách âm thầm hay không — khác hẳn 2 trường "Lý do" (2.000 ký tự) đã có giới hạn rõ ràng.

### 4. Ảnh hưởng nếu không giải quyết

- Rủi ro tràn cột DB nếu tên nhân viên bất thường dài, dù xác suất thấp vì đây không phải input trực tiếp của feature này.
- Test case biên cho trường hợp tên nhân viên rất dài không có oracle rõ ràng.

### 5. Đề xuất giải quyết

Đề xuất (giả định, ưu tiên thấp): xác nhận giới hạn cột DB hiện có (kế thừa từ module quản lý nhân viên) đã đủ lớn để chứa `{Tên nhân viên} ({Role})` mà không cần cắt, không cần thêm ràng buộc riêng cho feature này trừ khi phát hiện vấn đề thực tế.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-025 cũ ("processed_by_label không truncate") — nội dung không đổi giữa bản cũ và bản mới đọc lại, vẫn valid, mức độ thấp.

### 7. Câu hỏi cho người dùng

(a) Xác nhận giới hạn cột DB đã đủ, không cần thêm gì. (b) Bổ sung 1 dòng ghi chú tường minh về giới hạn độ dài cho trường này nếu cần đồng bộ với các module khác dùng chung cột này.

### 8. Owner

Backend Lead (vì cần xác nhận giới hạn cột DB hiện có).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-022 [Thấp] UX — Cập nhật ngầm không toast khi Driver Plus tự hủy/rút yêu cầu (AC-33/35) nay đã được xác nhận là hành vi chủ đích áp dụng nhất quán cho cả Web và Mobile, nhưng vẫn chưa có cơ chế nào giúp user đang xem đúng record đó biết dữ liệu vừa đổi mà không cần tự thao tác

### 1. Trích dẫn nguồn

- **File**: [FEAT-SYS-DRIVERPLUS-LINK.md](../../../requirements/gara/wave-07/Product/features/FEAT-SYS-DRIVERPLUS-LINK.md#L258-L258)
- **Section**: Nhóm J, AC-33.
- **Dòng**: 258.
- **Quote nguyên văn**:
  > **KHÔNG hiển thị toast** cho GMS user đang xem record đó — UI cập nhật ngầm; user tự làm mới trang / thao tác khác trên panel sẽ thấy trạng thái mới.

### 2. Bối cảnh nghiệp vụ

Chủ garage Đăng Vinh đang mở đúng form chi tiết của record `LKD-2026-001` (đang "Chờ liên kết") trên cả web lẫn mobile (hành vi đã xác nhận đồng nhất theo `INTEG-MOB` dòng 195: "KHÔNG toast, KHÔNG push realtime"). Đúng lúc đó, tài xế D+ bấm nút Hủy trên app của họ (sau 60 phút Đăng Vinh chưa phản hồi) — GMS nhận event, chuyển record sang "Đã hủy liên kết" ngầm, không có bất kỳ tín hiệu chủ động nào đẩy tới màn hình đang mở của Đăng Vinh.

### 3. Vấn đề cụ thể

Hành vi này rõ ràng là CHỦ ĐÍCH (khớp Out of Scope §7: "Notification real-time / badge đỏ... BA/PO đã chốt bỏ khỏi giai đoạn 1"), không phải 1 gap bị bỏ sót — nên bản chất finding này khác các finding "Thiếu phủ" khác: đây thiên về 1 gợi ý cải thiện trải nghiệm hơn là 1 lỗ hổng đặc tả. Tuy vậy, hệ quả thực tế vẫn đáng ghi nhận: Đăng Vinh có thể tiếp tục thao tác trên 1 record đã thực chất bị đổi trạng thái (vd bấm "Duyệt" cho 1 record vừa bị D+ tự rút) — trường hợp này đã được AC-27 phủ đúng (race condition với toast `ERR-DPL-004`), nên về bản chất KHÔNG có lỗ hổng chức năng, chỉ là trải nghiệm "đợi tới khi thao tác nhầm mới biết" thay vì "được báo ngay".

### 4. Ảnh hưởng nếu không giải quyết

- Nhân viên garage có thể tốn công thao tác lại (mở modal, tick điều khoản, bấm Duyệt) trên 1 record đã thực chất đổi trạng thái, chỉ để nhận toast lỗi race condition ở bước cuối, gây khó chịu nhẹ về trải nghiệm dù không có rủi ro dữ liệu sai.
- Đây thuần tuý là 1 trade-off UX đã được BA/PO cân nhắc và chốt bỏ khỏi scope, không phải rủi ro nghiệp vụ.

### 5. Đề xuất giải quyết

Đề xuất (giả định, mức độ ưu tiên thấp, chỉ nêu để tham khảo cho giai đoạn 2): không cần hành động ngay vì đây là quyết định BA/PO đã chốt rõ ràng; có thể cân nhắc bổ sung khi có đủ hạ tầng realtime/badge trong tương lai (đã được note là Out of Scope giai đoạn 1, chưa phải giai đoạn 2 cụ thể).

### 6. Liên kết với các phát hiện khác

Kế thừa RR-026 cũ ("mobile kill/relaunch update ngầm không toast") nhưng ĐÃ HẠ MỨC ĐỘ so với bản đọc cũ — sau khi đọc lại đầy đủ `INTEG-MOB` + Out of Scope §7 của FEAT, hành vi này rõ ràng là chủ đích nhất quán cả 2 platform, không còn là "thiếu phủ" đơn thuần như cách diễn giải trước.

### 7. Câu hỏi cho người dùng

(a) Xác nhận giữ nguyên như hiện tại (không toast, không realtime), coi đây là giới hạn đã biết của giai đoạn 1. (b) Đề xuất cho giai đoạn 2/CR riêng nếu phát sinh phàn nàn thực tế từ garage về việc thao tác nhầm trên record đã đổi trạng thái.

### 8. Owner

Product Designer (vì đây là quyết định trade-off UX đã có, chỉ cần xác nhận lại nếu muốn thay đổi).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-023 [Thấp] Biên — Chưa có UI mapping rõ ràng cho trường hợp `getPartnerLinkRequestDetail` trả `NF_404` ngay tại bước auto-select item đầu tiên (AC-3), dù xác suất xảy ra trong thực tế là thấp

### 1. Trích dẫn nguồn

- **File**: [agg-garage-graph-graphql.md](../../../requirements/gara/wave-07/Architecture/api/agg-garage-graph-graphql.md#L52204-L52204)
- **Section**: §3k.3, `getPartnerLinkRequestDetail` — mẫu response lỗi.
- **Dòng**: 52204.
- **Quote nguyên văn**:
  > `{ "data": { "getPartnerLinkRequestDetail": { "__typename": "ErrorResponse", "code": "GMS.gf-system.PARTNER_LINK.NF_404", "message": "Không tìm thấy yêu cầu liên kết", ... } } }`

### 2. Bối cảnh nghiệp vụ

Theo AC-3, ngay sau khi `listPartnerLinkRequests` trả về, FE tự động gọi `getPartnerLinkRequestDetail` cho `items[0].requestCode`. Vì record không bị xoá vật lý (chỉ đổi trạng thái, `BR-DPL-CMN-006` giữ vĩnh viễn), khả năng record biến mất giữa 2 lần gọi API gần như bằng 0 trong vận hành bình thường — khác các hệ thống có xoá cứng dữ liệu.

### 3. Vấn đề cụ thể

Mã lỗi `NF_404` tồn tại trong contract detail nhưng không có dòng UI mapping nào ở `INTEG-FE`/`INTEG-MOB` mô tả panel phải sẽ hiển thị gì nếu case này xảy ra ngay tại bước auto-select (khác với case user tự bấm chọn 1 item cũ đã hết hạn — cũng chưa rõ, nhưng còn ít khả năng xảy ra hơn nữa vì luôn chọn từ chính danh sách vừa tải).

### 4. Ảnh hưởng nếu không giải quyết

- QA khó viết test case cho case biên này vì gần như không có kịch bản nghiệp vụ hợp lệ nào tạo ra được tình huống thật (chỉ có thể giả lập bằng cách can thiệp trực tiếp DB/mock), nên đây là gap có mức độ ưu tiên thấp.

### 5. Đề xuất giải quyết

Đề xuất (giả định, ưu tiên thấp): bổ sung 1 dòng UI mapping mô tả panel phải hiển thị lỗi chung (dùng lại toast/banner lỗi hệ thống có sẵn) khi detail trả 404, chỉ cần đủ để không treo UI, không cần thiết kế riêng cho case hiếm gặp này.

### 6. Liên kết với các phát hiện khác

Kế thừa RR-041 cũ ("UI cho NF_404 khi race auto-select") nhưng hạ mức độ tin cậy — sau khi đọc kỹ lại cơ chế lưu trữ (không xoá cứng), khả năng xảy ra case này trong thực tế thấp hơn nhiều so với đánh giá ban đầu.

### 7. Câu hỏi cho người dùng

(a) Bổ sung UI mapping tối thiểu cho case NF_404 tại auto-select, dùng chung pattern lỗi hệ thống sẵn có. (b) Bỏ qua vì xác suất xảy ra quá thấp trong vận hành thực tế.

### 8. Owner

Frontend Lead (mức độ ưu tiên thấp, có thể xử lý cùng đợt hoàn thiện error-handling chung).

### 9. Trạng thái

ĐANG MỞ

---

## RR-024 [Trung bình] Thiếu phủ — FEAT-BOOK-EDIT AC-15 không nêu điều kiện giới hạn theo nguồn booking khi đồng bộ sang Driver+

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-EDIT.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-EDIT.md#L135-L139)
- **Section**: AC-15 "Đồng bộ thông tin cập nhật sang Driver+"
- **Dòng**: 135-139
- **Quote nguyên văn**:
  > - [ ] **AC-15**: Đồng bộ thông tin cập nhật sang Driver+
  >   - Tại: không qua màn hình — hệ thống tự động xử lý sau khi cập nhật thành công.
  >   - Khi: lịch hẹn được cập nhật thành công.
  >   - Thì: hệ thống đồng bộ thông tin lịch hẹn đã cập nhật sang Driver+ qua Kafka event `BOOKING.UPDATE.RESPONSE`...

### 2. Bối cảnh nghiệp vụ

Chị kế toán ở garage sửa lại số điện thoại khách hàng trên 1 booking có mã BK-20260812-0031 — booking này được nhân viên garage tự tạo tay từ Web GMS (nguồn "Garage Care"), khách hàng chưa từng dùng app Driver+. Chị bấm "Lưu thay đổi" trên form Chỉnh sửa lịch hẹn, hệ thống báo "Cập nhật lịch hẹn thành công" và quay về màn Chi tiết. Theo đúng câu chữ AC-15, sự kiện "lịch hẹn được cập nhật thành công" đã xảy ra, nên hệ thống sẽ "đồng bộ thông tin lịch hẹn đã cập nhật sang Driver+ qua Kafka event `BOOKING.UPDATE.RESPONSE`".

### 3. Vấn đề cụ thể

AC-15 không có điều kiện "chỉ áp dụng cho booking có nguồn Driver+" giống hệt cách OUTBOUND EC-2 đã làm rõ cho luồng đồng bộ trạng thái ("Toàn bộ Nhóm A (AC-1..6) chỉ áp dụng cho booking có nguồn Driver+"). Có 2 khả năng đọc AC-15: Khả năng A — đây là sơ suất soạn thảo, ý định thực sự cũng chỉ giới hạn cho booking nguồn Driver+ giống OUTBOUND, chỉ là quên viết ra; Khả năng B — hành vi hiện tại (production, "không đổi" theo Change Log v3) thực sự publish `BOOKING.UPDATE.RESPONSE` cho MỌI booking được sửa bất kể nguồn, và Driver+ phía nhận tự bỏ qua các event không khớp `driverPlusUserId`/booking họ không biết. Cả 2 khả năng đều hợp lý về mặt đọc văn bản, nhưng dẫn tới 2 hành vi hệ thống hoàn toàn khác nhau (có publish thừa hay không) mà tài liệu không phân xử.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu Khả năng B đúng nhưng không phải chủ đích: mỗi lần garage sửa 1 booking Garage Care/Walk-in, hệ thống phát sinh 1 event outbox vô ích, tốn tài nguyên outbox scheduler (batch 10/poll 10s) mà không ai tiêu thụ.
- QA không có oracle rõ ràng để viết test case "sửa booking nguồn Garage Care có publish `BOOKING.UPDATE.RESPONSE` hay không" — assert PASS hay FAIL đều có thể bị phản bác vì tài liệu không chốt.
- Nếu tương lai Driver+ đổi hành vi từ "tự bỏ qua event lạ" sang "log cảnh báo mỗi event không khớp booking họ biết", việc publish thừa sẽ tạo noise giám sát phía đối tác mà GMS không hay biết.

### 5. Đề xuất giải quyết

Đề xuất bổ sung 1 dòng "Tại" cho AC-15 tương tự cách OUTBOUND EC-2 đã làm rõ: "chỉ áp dụng cho booking có nguồn Driver+ (`lead_source = DRIVER_PLUS`)". Đây là đề xuất dựa trên suy luận nhất quán với pattern đã áp dụng ở OUTBOUND AC-1..6, không phải sự thật đã xác nhận — cần Business Authority xác nhận hành vi production thực tế trước khi chốt.

### 6. Liên kết với các phát hiện khác

Tương đương RR-007 cũ, vẫn còn hiệu lực sau khi đối chiếu nội dung mới. Cùng mẫu với RR-025 (cùng AC-15, khác khía cạnh — schema payload).

### 7. Câu hỏi cho người dùng

(a) Xác nhận hành vi production hiện tại: AC-15 CHỈ publish cho booking nguồn Driver+ (giống OUTBOUND), cần bổ sung dòng "Tại" tương ứng vào tài liệu. (b) Xác nhận hành vi production hiện tại: AC-15 publish cho MỌI booking sửa đổi bất kể nguồn, và đây là chủ đích — cần ghi rõ lý do (VD để đơn giản hoá logic, chấp nhận publish thừa vì chi phí thấp). (c) Chưa rõ hành vi thực tế, cần DEV kiểm tra code `BookingV3Service` hiện tại rồi cập nhật tài liệu theo đúng thực tế đang chạy.

### 8. Owner

Backend Lead + Business Authority (Backend Lead xác nhận code thực tế đang publish theo điều kiện nào; Business Authority chốt đây có phải hành vi mong muốn hay cần sửa).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-025 [Cao] Thiếu phủ — Schema thực tế của `BOOKING.UPDATE.RESPONSE` (FEAT-BOOK-EDIT AC-15) chưa được đặc tả field-by-field

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L151-L153)
- **Section**: §3.1 `BookingStatusChanged`, khối ghi chú "Làm rõ drift tài liệu Product"
- **Dòng**: 151-153
- **Quote nguyên văn**:
  > **Làm rõ drift tài liệu Product**: `FEAT-BOOK-DRIVERPLUS-OUTBOUND` §4 ghi "Production hiện dùng `BOOKING.UPDATE.RESPONSE` (`BookingStatusChanged`)" — **không chính xác**. Theo source-of-truth: `BOOKING.CHANGE.STATUS` → `BookingStatusChanged`...; còn `BOOKING.UPDATE.RESPONSE` → `BookingCreateResponseEvent`, dùng cho luồng **sửa nội dung lịch hẹn** (`FEAT-BOOK-EDIT` AC-15)... Cần BA sửa lại §4 của FEAT — xem Open Questions của wave.

### 2. Bối cảnh nghiệp vụ

Một lập trình viên được giao viết consumer phía test double cho Driver+ để verify event `BOOKING.UPDATE.RESPONSE` khi garage sửa số km, biển số hay ghi chú của booking BK-20260812-0031. Bạn tra `gf-sales-events.md` để tìm schema JSON đầy đủ của bước này — nhưng không có mục §3.x nào tên `BOOKING.UPDATE.RESPONSE`. Chỉ có 1 ghi chú rải rác nói rằng, theo Knowledge Graph nội bộ, bước này tái dùng class `BookingCreateResponseEvent` — vốn được thiết kế cho §3.3, có shape `{success, booking:{id, code}, error, correlation}`.

### 3. Vấn đề cụ thể

Shape `{success, booking:{id, code}, error, correlation}` được thiết kế để trả lời câu hỏi "tạo booking mới có thành công không, mã là gì" — nó KHÔNG mang bất kỳ trường nội dung nào đã thay đổi (số km mới, biển số mới, ghi chú mới...). Nhưng AC-15 hứa hẹn: "Khách hàng trên ứng dụng Driver+ nhận được thông tin lịch hẹn mới nhất" — nghĩa là D+ phải nhận được đủ dữ liệu mới để hiển thị lại cho khách. Nếu payload thực tế chỉ có `id`/`code` (như thiết kế gốc của `BookingCreateResponseEvent`), D+ sẽ không có gì để cập nhật hiển thị — trừ khi D+ tự gọi ngược 1 API khác để lấy chi tiết (nhưng không có API nào như vậy được liệt kê ở §4 Endpoints/Operations của INTEG-EXT-driver-plus.md, kênh 100% Kafka).

### 4. Ảnh hưởng nếu không giải quyết

- Không có oracle để viết test case xác nhận nội dung payload `BOOKING.UPDATE.RESPONSE` đúng — không biết assert những trường nào phải xuất hiện.
- Rủi ro triển khai: DEV có thể literal tái dùng đúng class `BookingCreateResponseEvent` (theo đúng gợi ý của KG) và vô tình gửi payload rỗng thông tin nội dung đã sửa, khiến AC-15 "khách hàng nhận được thông tin mới nhất" không bao giờ đúng trên thực tế dù test kỹ thuật (publish thành công, D+ nhận được message) vẫn PASS.
- Bản thân Architecture doc tự ghi nhận đây là "drift tài liệu Product" cần "BA sửa lại §4 của FEAT" nhưng đối chiếu `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` hiện tại (đã đọc lại bản mới nhất) thì §4 đã sửa đúng (`BOOKING.CHANGE.STATUS` → `BookingStatusChanged`) — ghi chú "cần BA sửa" trong events.md đã lỗi thời nhưng vẫn còn tồn tại, gây nhiễu cho người đọc sau.

### 5. Đề xuất giải quyết

Đề xuất bổ sung 1 mục schema riêng (VD `§3.1bis BookingUpdateResponse`) trong `gf-sales-events.md`, liệt kê đầy đủ field mà `BOOKING.UPDATE.RESPONSE` thực sự mang khi trigger từ FEAT-BOOK-EDIT AC-15 — tối thiểu cần các field khách hàng, xe, thời gian hẹn, dịch vụ đã cập nhật (đối chiếu các field ở `booking_details`). Đây là đề xuất dựa trên đọc AC-15 theo nghĩa đen ("thông tin lịch hẹn mới nhất"), không phải xác nhận từ nguồn nào — cần Backend Lead xác nhận payload thật của code hiện có trước khi ghi vào tài liệu.

### 6. Liên kết với các phát hiện khác

Tương đương RR-031 cũ, vẫn còn hiệu lực — bằng chứng mới (ghi chú "drift" tự nhận của chính tài liệu) càng củng cố finding này. Cùng mã AC-15 với RR-024.

### 7. Câu hỏi cho người dùng

(a) Xác nhận payload thực tế của `BOOKING.UPDATE.RESPONSE` hiện đang chạy production mang đủ field nội dung đã sửa (không chỉ id/code) — nếu đúng, chỉ cần bổ sung tài liệu hoá lại đúng payload thật. (b) Xác nhận payload thực tế chỉ có id/code như thiết kế gốc `BookingCreateResponseEvent` — nếu vậy, đây là bug cần Backend Lead vá để AC-15 thực sự đúng như mô tả. (c) Xoá ghi chú "cần BA sửa lại §4" đã lỗi thời trong `gf-sales-events.md` §3.1 vì `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` §4 hiện tại đã đúng.

### 8. Owner

Backend Lead (cần xác nhận payload thật đang publish trong code `BookingV3Service` khi trigger từ luồng Edit).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-026 [Trung bình] Mơ hồ — `externalBookingId` là trường bắt buộc nhưng nằm ngoài "5 trường bắt buộc" mà AC-2 dùng làm điều kiện gate

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L453-L456)
- **Section**: §3.8 `BookingCreateRequest`, bảng field #0-#1
- **Dòng**: 453-456
- **Quote nguyên văn**:
  > | 0 | `externalBookingId` | String | ✅ | Không rỗng; dùng làm `OriginMessageCode` | `booking.lead_id` | §3.8 baseline (field production sẵn có) |
  > | 1 | `customerPhone` | String | ✅ | **KHÔNG validate lại định dạng**... | `booking_details.customer_phone` | INBOUND AC-2 (fix F4 v5) |

Đối chiếu với [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L45-L48) AC-2: "hệ thống nhận đúng **5 trường bắt buộc**: Số điện thoại, Tên, Ngày hẹn, Giờ hẹn, Loại dịch vụ... Thiếu 1 trong 5 trường bắt buộc → từ chối tại adapter gate".

### 2. Bối cảnh nghiệp vụ

Đội Driver+ do lỗi tích hợp gửi 1 request đặt lịch thiếu hẳn trường `externalBookingId` (rỗng hoặc null) nhưng vẫn điền đủ 5 trường Product liệt kê là bắt buộc (SĐT, Tên, Ngày hẹn, Giờ hẹn, Loại dịch vụ). Theo bảng field ở Architecture, `externalBookingId` được đánh dấu "✅ Required" với validation "Không rỗng", đồng thời nó được dùng làm `OriginMessageCode` — chính là khoá để `gf-sales` gửi phản hồi tương ứng ngược lại đúng request gốc.

### 3. Vấn đề cụ thể

AC-2 của Product định nghĩa "5 trường bắt buộc" chỉ gồm 5 trường nghiệp vụ (không có `externalBookingId`), và adapter gate ở AC-2 chỉ nói "thiếu 1 trong 5 trường bắt buộc → từ chối". `externalBookingId` không nằm trong danh sách 5 trường đó theo câu chữ Product, nhưng lại được Architecture đánh dấu required riêng. Có 2 khả năng: Khả năng A — `externalBookingId` có 1 gate validate riêng, độc lập với "5 trường bắt buộc" của AC-2, và khi thiếu nó hệ thống hành xử khác (có thể không publish được response vì không có gì để đặt vào `correlation.requestEventId`/`OriginMessageCode`, dẫn tới rớt message hoàn toàn không có phản hồi nào cả — khác hẳn nhánh `ERR-BOOK-001` có phản hồi). Khả năng B — đây thực chất cũng nên được gộp vào cùng gate `ERR-BOOK-001` như 5 trường kia, chỉ là Product quên liệt kê nó vì coi đây là trường hạ tầng chứ không phải trường nghiệp vụ khách nhập.

### 4. Ảnh hưởng nếu không giải quyết

- Không viết được test case rõ ràng cho case "thiếu `externalBookingId`" — không biết kỳ vọng response nào (có `ERR-BOOK-001` với correlation rỗng, hay hoàn toàn không có response nào, hay consumer ack+skip âm thầm).
- Nếu thực tế là "không publish được response vì thiếu khoá correlation", Driver+ sẽ gặp booking bị treo vô thời hạn không rõ lý do — vi phạm chính nguyên tắc OUTBOUND AC-11 "không retry vô hạn, phải phản hồi rõ ràng".
- Rủi ro vận hành: đội support garage nhận được báo cáo "khách đặt lịch trên app nhưng không thấy gì bên GMS, cũng không báo lỗi phía app" mà không có log nào để tra cứu nếu message bị consumer âm thầm bỏ qua.

### 5. Đề xuất giải quyết

Đề xuất Architecture bổ sung rõ 1 dòng ở §3.8: nếu `externalBookingId` rỗng, hệ thống xử lý theo nhánh nào (đề xuất: coi như payload không hợp lệ, publish `ERR-BOOK-001` nhưng để `correlation.requestEventId` rỗng/null vì không có gì để khớp, đồng thời log riêng biệt case này để vận hành dễ tra cứu). Đây là đề xuất dựa trên suy luận nhất quán với cách xử lý payload sai khác, không phải sự thật đã xác nhận.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) `externalBookingId` được gộp chung vào adapter gate 5-trường-bắt-buộc của AC-2 (thực chất là 6 trường), cần sửa lại số đếm trong AC-2 và trong mọi nơi trích dẫn "14 trường = 5+9". (b) `externalBookingId` có 1 gate riêng biệt, độc lập với AC-2 — cần bổ sung 1 AC/EC mới mô tả rõ hành vi khi thiếu trường này. (c) `externalBookingId` trong thực tế production luôn được Driver+ gửi kèm (do là 1 phần cấu trúc kỹ thuật bắt buộc của mọi message, không phải input tự do), nên case "thiếu" là không thể xảy ra trên thực tế và không cần đặc tả thêm — chỉ cần ghi chú rõ giả định này.

### 8. Owner

Solution Architect (cần xác nhận đây có phải 1 gate độc lập ở tầng adapter/consumer hay không, và cách phản hồi khi thiếu khoá correlation).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-027 [Trung bình] Thiếu phủ — FEAT-BOOK-DETAIL AC-5 không phân biệt hiển thị "Loại dịch vụ" nội bộ GMS với "Loại dịch vụ" macro của Driver+

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DETAIL.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DETAIL.md#L60-L63)
- **Section**: AC-5 "Hiển thị thông tin dịch vụ"
- **Dòng**: 60-63
- **Quote nguyên văn**:
  > - [ ] **AC-5**: Hiển thị thông tin dịch vụ
  >   - Tại: màn hình Chi tiết lịch hẹn, mục thông tin dịch vụ.
  >   - Khi: màn hình được tải.
  >   - Thì: hệ thống hiển thị: loại dịch vụ, mô tả tình trạng xe, ghi chú khách hàng, ghi chú nội bộ.

### 2. Bối cảnh nghiệp vụ

Khách hàng đặt lịch trên app Driver+, chọn "Loại dịch vụ" là "Bảo dưỡng" — giá trị này được lưu nguyên văn vào cột mới `booking.driverplus_service_type` theo đúng INBOUND AC-3 ("2 danh mục độc lập hoàn toàn... GMS chỉ lưu/hiển thị nguyên văn, không map"). Vì GMS không tự động map giá trị này vào danh mục dịch vụ nội bộ (`booking.service_type`, enum `ServiceType` của `gf-erp-mdm`), trường `service_type` của booking này có khả năng đang để trống — vì việc chọn "Loại dịch vụ" GMS-nội bộ vốn là hành động của garage (theo FEAT-BOOK-CREATE AC-15, garage tự chọn qua radio button khi TẠO thủ công), mà booking này garage không hề tạo tay, chỉ nhận từ event Driver+.

### 3. Vấn đề cụ thể

Nhân viên garage mở Chi tiết lịch hẹn của booking này để chuẩn bị đón khách. AC-5 nói "hệ thống hiển thị: loại dịch vụ" nhưng không nói rõ đây là `service_type` (GMS-nội bộ, có thể null) hay `driverplus_service_type` (giá trị "Bảo dưỡng" khách thực sự đã chọn trên app). Nếu UI chỉ bind vào `service_type` như cách hiển thị cho booking Garage Care, nhân viên sẽ thấy ô "Loại dịch vụ" trống rỗng dù khách đã chọn rõ ràng trên app — ngược lại hoàn toàn với kỳ vọng nghiệp vụ (garage cần biết khách cần "Bảo dưỡng" để chuẩn bị).

### 4. Ảnh hưởng nếu không giải quyết

- Nhân viên garage tiếp nhận booking nguồn Driver+ không biết khách thực sự cần loại dịch vụ gì, dù dữ liệu này đã tồn tại sẵn trong hệ thống (`driverplus_service_type`).
- QA không có căn cứ để viết test case xác nhận UI hiển thị đúng giá trị nào cho booking nguồn Driver+ trên màn Chi tiết.
- Có nguy cơ garage vô tình sửa `service_type` (qua FEAT-BOOK-EDIT AC-9, trường "Loại dịch vụ" GMS-nội bộ là bắt buộc khi sửa) bằng 1 giá trị không liên quan tới ý định thật của khách, vì màn hình không cho garage nhìn thấy `driverplus_service_type` để đối chiếu.

### 5. Đề xuất giải quyết

Đề xuất bổ sung vào AC-5 (hoặc thêm 1 AC mới) yêu cầu hiển thị RIÊNG BIỆT cả 2 giá trị khi booking có nguồn Driver+: "Loại dịch vụ (Driver+)" = giá trị nguyên văn `driverplus_service_type`, và "Loại dịch vụ (GMS)" = `service_type` nếu đã được garage gán. Đây là đề xuất dựa trên nguyên tắc "2 danh mục độc lập" đã chốt ở INBOUND AC-3 — cần Product Designer xác nhận layout cụ thể.

### 6. Liên kết với các phát hiện khác

Tương đương RR-032 cũ, vẫn còn hiệu lực. Liên quan tới RR-033 (cùng chủ đề "Loại dịch vụ" GMS-nội bộ vs Driver+ macro, nhưng ở màn Edit thay vì Detail).

### 7. Câu hỏi cho người dùng

(a) Bổ sung 1 trường hiển thị riêng "Loại dịch vụ (từ Driver+)" trên màn Chi tiết cho booking nguồn Driver+, giữ nguyên trường "Loại dịch vụ" hiện có cho `service_type` GMS-nội bộ. (b) Đổi ngữ nghĩa: khi booking nguồn Driver+, ô "Loại dịch vụ" duy nhất trên Chi tiết sẽ hiển thị giá trị `driverplus_service_type` thay vì `service_type` — chấp nhận không hiển thị `service_type` GMS-nội bộ ở màn này nữa. (c) Không cần hiển thị `driverplus_service_type` ở đâu trên Web GMS — thông tin này chỉ phục vụ nội bộ D+, garage không cần biết trước khi khách đến (cần Business Authority xác nhận đây có đúng là điều garage không cần biết hay không, vì có vẻ mâu thuẫn với mục đích chuẩn bị dịch vụ trước).

### 8. Owner

Product Designer + Business Authority (Designer quyết layout hiển thị, Business Authority xác nhận garage có thực sự cần thấy giá trị này trước khi khách đến hay không).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-028 [Trung bình] Thiếu phủ — Driver+ không có cơ chế chủ động truy vấn lại trạng thái booking khi lỡ mất event

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L4)
- **Section**: §7 Idempotency & Ordering, dòng "Outbound event không được D+ tiêu thụ"
- **Dòng**: 222
- **Quote nguyên văn**:
  > | Outbound event không được D+ tiêu thụ | Không có ack nghiệp vụ | Không phát hiện được từ GMS | **Chấp nhận** — at-least-once, không có end-to-end ack. Theo dõi qua consumer lag phía D+ |

Đối chiếu [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L123-L124) §7 Out of Scope: "Cổng quản trị nội bộ Driver+ xem các ngoại lệ (booking không khớp, chuyển tiếp thất bại) — thuộc `FEAT-DP-037` (ngoài repo này, phía Driver+ tự vận hành)."

### 2. Bối cảnh nghiệp vụ

Nhân viên garage bấm "Xác nhận" cho booking BK-20260812-0031 trên Web GMS. `gf-sales` publish `BOOKING.CHANGE.STATUS` (`driverPlusStatus="Đã xác nhận"`) sang Kafka, nhưng đúng lúc đó consumer phía Driver+ đang restart hoặc gặp sự cố tạm thời — message vẫn nằm ở Kafka nhưng D+ chưa kịp đọc. 10 phút sau consumer D+ hồi phục và tiếp tục đọc bình thường (Kafka at-least-once đảm bảo message không mất) — nhưng giả sử trong khoảng downtime đó consumer group của D+ bị reset offset hoặc message bị bỏ lỡ do lỗi xử lý riêng phía họ (nằm ngoài kiểm soát của GMS).

### 3. Vấn đề cụ thể

Toàn bộ luồng đồng bộ trạng thái là kiểu "push-only": GMS chỉ publish, không có cách nào để D+ chủ động hỏi lại "trạng thái hiện tại thật sự của booking X là gì". `EXTERNAL_RESPONSE` chỉ tồn tại cho 2 luồng phản hồi request cụ thể (tạo/hủy), không có kênh "query trạng thái theo bookingCode". Nếu D+ vì lý do nào đó (bug nội bộ, downtime dài hơn dự kiến) làm mất 1 event cập nhật trạng thái, khách hàng trên app sẽ thấy trạng thái cũ (VD vẫn "Chờ xác nhận" dù thực tế garage đã "Xác nhận" từ lâu) mà không có cách nào tự đồng bộ lại — trừ khi phía D+ tự phát hiện qua cổng quản trị nội bộ của họ (`FEAT-DP-037`, ngoài repo này, GMS không kiểm soát được).

### 4. Ảnh hưởng nếu không giải quyết

- Khách hàng nhìn thấy trạng thái lịch hẹn sai lệch trên app Driver+ mà không có cơ chế tự khắc phục nào phía GMS hỗ trợ, dẫn tới khách gọi điện garage hỏi trong khi garage đã xử lý xong từ lâu.
- Đội vận hành garage không có công cụ nào để chủ động "gửi lại" trạng thái hiện tại của 1 booking cụ thể theo yêu cầu — chỉ có thể chờ garage tự thực hiện 1 hành động mới (VD hủy rồi tạo lại) để trigger 1 event mới, vốn không phải giải pháp hợp lý cho việc đồng bộ lại trạng thái.
- Không có test case nào có thể verify được hành vi "khôi phục đồng bộ sau khi mất event" vì hệ thống không có tính năng này.

### 5. Đề xuất giải quyết

Đề xuất bổ sung 1 API/event query trạng thái booking theo `bookingCode`/`externalBookingId` mà D+ có thể chủ động gọi khi nghi ngờ dữ liệu lệch (đối xứng với cơ chế polling dự phòng, phổ biến trong tích hợp event-driven với đối tác ngoài). Đây là đề xuất dựa trên best practice tích hợp event-driven (bổ sung "pull" bên cạnh "push" thuần), không phải yêu cầu đã xác nhận từ Business Authority — cần đánh giá độ ưu tiên so với chi phí thêm 1 bề mặt API mới.

### 6. Liên kết với các phát hiện khác

Tương đương RR-033 cũ, vẫn còn hiệu lực.

### 7. Câu hỏi cho người dùng

(a) Bổ sung 1 kênh truy vấn (REST hoặc Kafka request/response) cho phép Driver+ chủ động hỏi lại trạng thái 1 booking cụ thể khi nghi ngờ lệch dữ liệu. (b) Chấp nhận rủi ro này ở mức "at-least-once, theo dõi qua consumer lag" như hiện tại — vì tần suất message ít (≤ 5 msg/s/tenant) nên rủi ro mất event thực tế rất thấp, không cần đầu tư thêm. (c) Đẩy trách nhiệm hoàn toàn sang phía Driver+ tự xây cơ chế polling định kỳ gọi 1 API đọc-only hiện có (`GET /api/v3/bookings/detail/{code}`) — nhưng endpoint này hiện là `authenticated` (dành cho user GMS nội bộ), cần đánh giá có mở riêng 1 bề mặt cho đối tác ngoài hay không.

### 8. Owner

Solution Architect (đánh giá chi phí/lợi ích của việc bổ sung kênh pull, và có phù hợp với nguyên tắc "GMS giữ ownership adapter, không qua gf-erp-agent" đã chốt ở ADR-029 hay không).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-029 [Trung bình] Tương tranh — Dedupe theo `event_id` không chặn được 2 `event_id` khác nhau phát sinh từ cùng 1 hành động người dùng

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L84-L87)
- **Section**: AC-9 "Nhận trùng lặp yêu cầu đặt lịch hoặc yêu cầu hủy — chỉ áp dụng một lần"
- **Dòng**: 84-87
- **Quote nguyên văn**:
  > - [ ] **AC-9**: Nhận trùng lặp yêu cầu đặt lịch hoặc yêu cầu hủy — chỉ áp dụng một lần
  >   - Tại: kênh sự kiện inbound từ Driver+.
  >   - Khi: cùng một yêu cầu (đặt lịch mới hoặc hủy) được gửi/nhận nhiều lần liên tiếp (**do retry mạng phía Driver+, không phải 2 yêu cầu khác nhau**).
  >   - Thì: hệ thống dedupe qua inbox (theo `event_id`...)

### 2. Bối cảnh nghiệp vụ

Khách hàng dùng app Driver+ đứng ở khu vực sóng yếu, bấm nút "Hủy lịch hẹn" cho booking LH-20260812-00001. App không thấy phản hồi ngay (do mạng chập chờn, chứ không phải request đã gửi thất bại) nên khách bấm thêm 1 lần nữa. Nếu app Driver+ implement theo kiểu "mỗi lần bấm = sinh 1 `event_id`/`messageId` mới" (khác với retry-đúng-nghĩa ở tầng transport, vốn tái dùng cùng 1 `event_id`), thì `gf-sales` sẽ nhận 2 message `BOOKING.CANCELLED` với 2 `event_id` khác nhau cho cùng 1 booking.

### 3. Vấn đề cụ thể

AC-9 tự giới hạn phạm vi rất rõ: "do retry mạng phía Driver+, không phải 2 yêu cầu khác nhau" — nghĩa là chính Product cũng chỉ cam kết dedupe cho trường hợp cùng 1 `event_id`. Với 2 `event_id` khác nhau cho cùng 1 ý định người dùng, cơ chế inbox dedupe (unique theo `event_id`) sẽ coi đây là 2 request hợp lệ độc lập. Với luồng hủy, 2 lần gọi hủy liên tiếp không gây hại lớn (booking đã "Đã hủy" thì lần 2 sẽ rơi vào nhánh (b) "không đủ điều kiện", vẫn xử lý an toàn nhờ gate trạng thái). Nhưng với luồng TẠO booking mới, nếu khách bấm "Đặt lịch" 2 lần do không thấy phản hồi và app sinh 2 `event_id`/2 `externalBookingId` khác nhau cho cùng 1 lần đặt, `gf-sales` hoàn toàn có thể tạo ra 2 booking trùng lặp cho cùng 1 khách, cùng 1 khung giờ.

### 4. Ảnh hưởng nếu không giải quyết

- Garage nhận 2 lịch hẹn trùng lặp cho cùng 1 khách, cùng khung giờ — gây nhầm lẫn khi lên kế hoạch tiếp nhận xe, có thể dẫn tới double-book khung giờ đó.
- Không có business-key nào (VD khách + khung giờ trong 1 khoảng thời gian ngắn) được dùng làm lớp phòng vệ thứ 2 ngoài `event_id` — trong khi `gf-sales-api.md` §3 (mô tả `POST /api/v2/bookings`) cũng chỉ ghi "chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ **nếu** cơ chế nội bộ có hỗ trợ" — câu chữ có điều kiện "nếu có" cho thấy đây không phải điều đã được đảm bảo.
- QA không thể viết test case khẳng định chắc chắn hệ thống chặn được double-tap ở tầng người dùng, vì AC-9 tự loại trừ case này khỏi phạm vi cam kết.

### 5. Đề xuất giải quyết

Đề xuất bổ sung 1 lớp phòng vệ thứ 2 ở mức business-key cho luồng TẠO booking mới: nếu cùng 1 `customerPhone` + cùng `appointmentDate`/`appointmentTime` (hoặc trong khung 1-2 phút) gửi 2 request tạo khác `event_id`, hệ thống coi là khả nghi trùng lặp và có thể trả về booking đã tồn tại thay vì tạo mới. Đây là đề xuất dựa trên best practice chống double-submit ở tầng nghiệp vụ (ngoài dedupe kỹ thuật theo message-id), không phải yêu cầu đã xác nhận — cần Business Authority quyết định ngưỡng thời gian và xử lý cụ thể.

### 6. Liên kết với các phát hiện khác

Tương đương RR-034 cũ, vẫn còn hiệu lực.

### 7. Câu hỏi cho người dùng

(a) Bổ sung business-key dedupe (khách + khung giờ trong ngưỡng thời gian ngắn) cho luồng tạo booking mới, độc lập với dedupe theo `event_id`. (b) Chấp nhận rủi ro double-booking hiếm gặp này vì tần suất thấp, để garage tự phát hiện và huỷ thủ công booking trùng qua FEAT-BOOK-CANCEL nếu xảy ra. (c) Xác nhận với đội Driver+ rằng app phía họ CAM KẾT luôn tái sử dụng cùng 1 `event_id` khi người dùng bấm lại do không thấy phản hồi (tức là double-tap luôn được xử lý như retry ở tầng app D+, không sinh `event_id` mới) — nếu đúng, rủi ro này không tồn tại trên thực tế và chỉ cần ghi rõ giả định vào tài liệu.

### 8. Owner

Business Authority + Backend Lead (Business Authority quyết định có cần business-key dedupe hay chấp nhận rủi ro; Backend Lead xác nhận với đội Driver+ về hành vi sinh `event_id` phía app của họ).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-030 [Trung bình] Thiếu phủ — Không có cơ chế thông báo rõ ràng cho vận hành garage khi yêu cầu hủy từ Driver+ không xác định được booking

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L521)
- **Section**: §3.9 `BookingCancelledByDriver`, bảng gate 3 nhánh, nhánh (c)
- **Dòng**: 521
- **Quote nguyên văn**:
  > | **(c) Không tìm thấy booking** | `bookingId`/`bookingCode` không khớp booking nào trong tenant | KHÔNG đổi state bất kỳ booking nào; **ghi ngoại lệ nội bộ để vận hành rà soát**; **KHÔNG** đoán booking gần đúng nhất | **`BOOKING.CANCEL.RESPONSE`** `success=false` + `ERR-BOOK-002` (§3.9bis) | INBOUND AC-8 · OUTBOUND AC-11 |

### 2. Bối cảnh nghiệp vụ

Do 1 lỗi hiếm gặp ở phía Driver+ (VD dữ liệu bookingCode bị cắt bớt ký tự khi lưu cache), app gửi yêu cầu hủy cho `bookingCode = "LH-20260812-0000"` (thiếu 1 chữ số cuối so với mã thật `LH-20260812-00001`). `gf-sales` không tìm thấy booking nào khớp, đúng theo nhánh (c): không đổi state, "ghi ngoại lệ nội bộ để vận hành rà soát", đồng thời trả `ERR-BOOK-002` về cho Driver+.

### 3. Vấn đề cụ thể

Cụm "ghi ngoại lệ nội bộ để vận hành rà soát" xuất hiện lặp lại ở cả Product (INBOUND AC-8) và Architecture (§3.9 nhánh c), nhưng không nơi nào định nghĩa CÁCH đội vận hành garage/GMS thực sự biết để mà "rà soát" — có phải chỉ là 1 dòng log/exception record nằm im trong hệ thống, chờ ai đó chủ động tra cứu? Có dashboard, alert, hay email nào không? Đối chiếu §3.9 bước 5: publish `NotificationRequest` chỉ được nhắc tới cho nhánh (a)/(b) ("Nhánh (a)/(b) gọi `BookingV3Service.handleBookingCancelledByDriver`... publish `NotificationRequest` cho user GMS"), nhánh (c) hoàn toàn không được nhắc trong câu này — nghĩa là nhánh (c), vốn là trường hợp nghiêm trọng nhất (dữ liệu không khớp, cần con người can thiệp), lại là nhánh DUY NHẤT không chắc có notification nào cho ai cả.

### 4. Ảnh hưởng nếu không giải quyết

- Yêu cầu hủy hợp lệ về mặt ý định của khách nhưng bị lỗi dữ liệu ở phía đối tác sẽ "biến mất" khỏi tầm nhìn của cả garage lẫn đội vận hành GMS — không ai biết để xử lý, khách hàng vẫn tưởng đã hủy thành công (dù D+ nhận `ERR-BOOK-002`, còn tùy D+ có hiển thị lỗi rõ ràng cho khách hay không, nằm ngoài phạm vi GMS).
- QA không thể viết test case xác nhận "vận hành garage nhận được cảnh báo" vì không rõ kênh cảnh báo là gì (dashboard nội bộ? bảng ngoại lệ trong DB? metric/alert?).
- Không có SLA nào ràng buộc thời gian đội vận hành phải xử lý các "ngoại lệ nội bộ" này, khác hẳn với các alert khác trong hệ thống (VD Alert `Gate rejection rate > 20%` có ngưỡng + severity P3 rõ ràng ở INTEG-EXT §8.4).

### 5. Đề xuất giải quyết

Đề xuất bổ sung metric/alert riêng cho nhánh (c) tương tự cách `integration.driver_plus.gate.rejections` đã đếm theo `error_code` (đã có `ERR-BOOK-002` trong danh sách tag) — nhưng cần thêm ngưỡng cảnh báo cụ thể (VD > N lần/giờ → P3) vào bảng Alerts §8.4 của `INTEG-EXT-driver-plus.md`, vì hiện bảng đó chỉ có "Gate rejection rate > 20%" tính chung cho MỌI mã lỗi gate, không tách riêng theo từng mã. Đây là đề xuất dựa trên pattern đã có sẵn trong cùng tài liệu (áp dụng nhất quán), không phải yêu cầu đã xác nhận.

### 6. Liên kết với các phát hiện khác

Tương đương RR-035 cũ (đã mở rộng thêm bằng chứng cụ thể về việc nhánh (c) thiếu cả `NotificationRequest`).

### 7. Câu hỏi cho người dùng

(a) Bổ sung 1 alert riêng cho nhánh (c) (booking không tìm thấy) vào bảng Alerts, với ngưỡng cụ thể để vận hành chủ động phát hiện thay vì chờ tra log thủ công. (b) Chấp nhận cơ chế hiện tại (chỉ ghi log/exception, không alert riêng) vì tần suất case này cực hiếm (lỗi dữ liệu phía đối tác), rủi ro thấp không cần đầu tư thêm. (c) Làm rõ "ghi ngoại lệ nội bộ" cụ thể nghĩa là gì trong thiết kế hiện tại (bảng DB riêng? log level ERROR? cả 2?) trước khi quyết định có cần alert hay không.

### 8. Owner

DevOps/SRE Lead + Business Authority (SRE Lead xác nhận cơ chế alert kỹ thuật khả thi; Business Authority quyết định mức độ ưu tiên xử lý case này).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-031 [Thấp] Thiếu phủ — Chưa có chính sách archival cho `inbox_event`/`outbox_event` dù đã xác nhận không có TTL

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L246)
- **Section**: §7 Idempotency & Ordering, dòng "Server-side dedup window"
- **Dòng**: 246
- **Quote nguyên văn**:
  > | Server-side dedup window | **Không giới hạn thời gian** — `inbox_event.event_id` là PK, giữ vĩnh viễn (không có TTL cleanup ở `gf-system`). Lớp 2: unique `(tenant_id, request_code)` |

### 2. Bối cảnh nghiệp vụ

`gf-sales-HLD.md` §7.1 ước tính tải hệ thống ở quy mô 500 tenant active, với throughput Driver+ inbound tới 5 message/giây/tenant vào giờ cao điểm. Mỗi message inbound (tạo booking, hủy booking) đều ghi 1 dòng vào `inbox_event`; mỗi lần publish outbound (xác nhận, từ chối, xe đến, hủy, phản hồi tạo/hủy) ghi 1 dòng vào `outbox_event`. Bảng `inbox_event` dùng `event_id` làm khoá chính và, theo trích dẫn trên, "giữ vĩnh viễn" — không có cơ chế dọn dẹp nào được nhắc tới.

### 3. Vấn đề cụ thể

Câu trả lời "không có TTL" thực chất đã đóng lại câu hỏi cũ (RR-037: "chưa định nghĩa retention") — đây LÀ quyết định kiến trúc, không còn là khoảng trống. Nhưng quyết định này tự nó mở ra 1 câu hỏi mới: với quy mô tải đã ước tính (hàng trăm nghìn dòng/ngày cộng dồn qua nhiều năm cho riêng luồng Driver+, chưa kể các luồng khác cũng dùng chung 2 bảng này), không có bất kỳ chiến lược archival/partition nào (theo thời gian, theo tenant) được đề cập trong `gf-sales-HLD.md` §5 Data Ownership hay §7 Performance & Scale — trong khi các mối quan tâm về index/cache/N+1 khác đều đã được viết rất chi tiết ở cùng tài liệu.

### 4. Ảnh hưởng nếu không giải quyết

- Bảng `inbox_event`/`outbox_event` phình to vô hạn theo thời gian, có thể ảnh hưởng hiệu năng insert/index maintenance sau vài năm vận hành mà không ai lên kế hoạch trước.
- Không có timeline rõ ràng để đội hạ tầng lập kế hoạch capacity (dung lượng ổ đĩa PostgreSQL `dev_gf_sales`) cho riêng 2 bảng này.
- Đây không phải rủi ro cấp bách trong phạm vi Wave 7 (throughput hiện tại còn thấp), nên mức độ ưu tiên hợp lý là Thấp, nhưng vẫn nên được ghi nhận thay vì bỏ qua hoàn toàn.

### 5. Đề xuất giải quyết

Đề xuất bổ sung 1 dòng trong `gf-sales-HLD.md` §7 (Performance & Scale) ghi nhận đây là quyết định có chủ đích ("không TTL vì cần audit vĩnh viễn") kèm kế hoạch archival định kỳ (VD partition theo tháng, di chuyển dữ liệu cũ hơn N năm sang cold storage) làm việc cần làm trong tương lai khi quy mô tăng. Đây là đề xuất dựa trên thực hành vận hành chuẩn cho bảng audit append-only tăng trưởng không giới hạn, không phải yêu cầu đã xác nhận từ Business Authority.

### 6. Liên kết với các phát hiện khác

Tương đương RR-037 cũ — nay đã có câu trả lời rõ ràng cho câu hỏi gốc ("có TTL hay không" → không có, có chủ đích), nên diễn giải lại thành 1 finding hẹp hơn (archival strategy dài hạn) thay vì giữ nguyên khung câu hỏi cũ.

### 7. Câu hỏi cho người dùng

(a) Xác nhận "giữ vĩnh viễn, không TTL" là quyết định cuối cùng cho mọi quy mô tương lai — không cần bổ sung gì thêm. (b) Bổ sung kế hoạch archival/partition định kỳ vào roadmap kỹ thuật (không cần làm ngay ở Wave 7) để tránh nợ kỹ thuật âm thầm tích luỹ. (c) Đánh giá lại có cần retention khác nhau giữa `inbox_event` (chỉ cần giữ đủ lâu để dedupe hiệu quả) và audit trail nghiệp vụ thực sự (`booking_status_history`, vốn đã có ý nghĩa nghiệp vụ lâu dài) — có thể tách 2 nhu cầu retention khác nhau.

### 8. Owner

DevOps/SRE Lead (đánh giá capacity planning và đề xuất chiến lược archival phù hợp hạ tầng PostgreSQL hiện có).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-032 [Trung bình] Bảo mật — `vehicleImages` nhận URL bên ngoài từ Driver+ không có giới hạn số lượng, định dạng, hay allowlist domain

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L468)
- **Section**: §3.8 `BookingCreateRequest`, bảng field #13 `vehicleImages`
- **Dòng**: 468
- **Quote nguyên văn**:
  > | 13 | `vehicleImages` | String[] | ⛔ | — | `booking_details.vehicle_images` (JSONB) | INBOUND AC-2, AC-5 |

Đối chiếu [BR-GF-SALES.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SALES.md#L334) §7.2 M-2 (self-flagged missing rule): "Thiếu validation tối đa hình ảnh booking — FEAT-BOOK-CREATE cho phép tải nhiều ảnh cùng lúc nhưng không quy định giới hạn số lượng hoặc dung lượng tối đa."

### 2. Bối cảnh nghiệp vụ

Khách hàng đặt lịch trên app Driver+, đính kèm ảnh xe. App D+ upload ảnh lên hạ tầng lưu trữ riêng của họ rồi gửi mảng URL (VD `https://cdn.driverplus.vn/booking/77219/1.jpg`) sang GMS qua trường `vehicleImages`. `gf-sales` lưu nguyên các URL này vào `booking_details.vehicle_images` (JSONB), rồi hiển thị lại cho garage xem trên FEAT-BOOK-DETAIL AC-4.

### 3. Vấn đề cụ thể

Cột validation của `vehicleImages` trong bảng field ở §3.8 để trống ("—"), khác hẳn các trường khác đều có ghi rõ ràng buộc hoặc "—" kèm lý do. Có 3 khoảng trống cụ thể: (1) không giới hạn SỐ LƯỢNG phần tử trong mảng — Driver+ có thể gửi 1 mảng cực lớn; (2) không kiểm tra ĐỊNH DẠNG URL (có phải URL hợp lệ, có đúng scheme `https://` không) trước khi lưu; (3) không có allowlist DOMAIN — GMS chấp nhận bất kỳ URL nào Driver+ gửi mà không xác minh nó thuộc hạ tầng CDN hợp lệ của đối tác. Đây là ranh giới tin cậy khác với upload ảnh trực tiếp qua `POST /api/v2/service-orders/{id}/...` (nơi GMS tự kiểm soát file), vì ở đây GMS chỉ lưu tham chiếu URL do bên ngoài cung cấp mà không tự tải/kiểm tra nội dung.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu FE Web GMS render trực tiếp các URL này thành thẻ `<img>` mà không qua proxy/sanitize, 1 URL độc hại (VD trỏ tới file cực lớn, hoặc endpoint theo dõi/tracking pixel) có thể gây chậm trang hoặc rò rỉ thông tin truy cập (IP, user-agent nhân viên garage) sang bên thứ 3 không phải Driver+ thật, nếu payload từng bị giả mạo hoặc đối tác bị compromise.
- Không giới hạn số lượng phần tử mảng tạo rủi ro 1 payload cực lớn (nhiều nghìn URL) làm phình `booking_details.vehicle_images` (JSONB) bất thường, ảnh hưởng hiệu năng đọc/ghi dòng đó.
- Không có test case nào có thể verify hành vi hệ thống khi nhận payload "quá nhiều ảnh" hay "URL sai định dạng" vì không có ràng buộc nào được đặc tả để assert.

### 5. Đề xuất giải quyết

Đề xuất bổ sung: (a) giới hạn số lượng phần tử tối đa trong `vehicleImages` (đề xuất tham khảo M-2 đã tự flag trong BR-GF-SALES.md, cần Business Authority chốt con số cụ thể, VD tối đa 10 ảnh); (b) validate định dạng URL (scheme `https://`) tại adapter gate trước khi lưu; (c) cân nhắc allowlist domain CDN của Driver+ nếu khả thi về mặt vận hành. Đây là đề xuất dựa trên best practice bảo mật khi nhận URL từ bên thứ 3 (OWASP SSRF/URL validation), không phải yêu cầu đã xác nhận.

### 6. Liên kết với các phát hiện khác

Tương đương RR-038 cũ, mở rộng thêm góc bảo mật (rủi ro khi hiển thị URL ngoài không qua allowlist) ngoài khía cạnh giới hạn số lượng/dung lượng đã nêu trước đó. Cùng gốc với M-2 đã tự flag trong `BR-GF-SALES.md` §7.2 (nhưng M-2 chỉ nói về luồng tạo booking thủ công qua Web GMS, chưa đề cập riêng luồng nhận URL từ bên ngoài qua Driver+).

### 7. Câu hỏi cho người dùng

(a) Bổ sung giới hạn số lượng + validate định dạng URL tại adapter gate cho `vehicleImages` khi nhận từ Driver+, từ chối payload vi phạm bằng `ERR-BOOK-001` giống các trường bắt buộc khác. (b) Chấp nhận rủi ro hiện tại vì Driver+ là đối tác tin cậy nội bộ tập đoàn (không phải bên thứ 3 công khai), chỉ cần giới hạn số lượng để tránh phình dữ liệu, không cần validate domain. (c) Xử lý ở tầng Frontend Lead (Web GMS): không tin tưởng URL nhận từ backend, luôn hiển thị ảnh qua proxy nội bộ có kiểm soát thay vì `<img src>` trực tiếp — nếu chọn phương án này thì không cần validate ở tầng backend/adapter.

### 8. Owner

Security Lead + Backend Lead (Security Lead đánh giá rủi ro cụ thể và mức độ cần allowlist; Backend Lead triển khai validate tại adapter gate nếu được chốt).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-033 [Cao] Thiếu phủ — FEAT-BOOK-EDIT AC-9/AC-10 bắt buộc "Loại dịch vụ" GMS-nội bộ khi sửa, nhưng không xử lý trường hợp booking nguồn Driver+ chưa từng có giá trị này

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-EDIT.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-EDIT.md#L93-L109)
- **Section**: AC-9 "Chỉnh sửa thông tin dịch vụ" + AC-10 "Điều kiện nút lưu thay đổi"
- **Dòng**: 93-109
- **Quote nguyên văn**:
  > - [ ] **AC-9**: Chỉnh sửa thông tin dịch vụ... các trường hiển thị với dữ liệu hiện tại đã điền sẵn: - **"Loại dịch vụ"** — bắt buộc...
  > - [ ] **AC-10**: Điều kiện nút lưu thay đổi... Khi: chủ garage đã điền đủ các trường bắt buộc (Tên khách hàng, SĐT khách hàng, Ngày hẹn, Giờ hẹn, **Loại dịch vụ**) và hệ thống không đang gửi yêu cầu. Thì: nút ở trạng thái khả dụng (enabled).

Đối chiếu [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L107) BR-BOOK-005: "Lịch hẹn từ Driver+ được tạo qua kênh sự kiện tự động, đủ 14 trường... **garage không nhập liệu** mà chỉ xác nhận hoặc từ chối."

### 2. Bối cảnh nghiệp vụ

Booking BK-20260812-0031 được tạo tự động từ Driver+, khách chọn "Loại dịch vụ" (macro D+) là "Bảo dưỡng" — lưu vào `driverplus_service_type`, KHÔNG map vào `booking.service_type` (theo đúng INBOUND AC-3). Vì garage không hề nhập liệu khi tạo booking này (BR-BOOK-005), trường `service_type` (GMS-nội bộ, dùng cho radio button ở FEAT-BOOK-CREATE AC-15) nhiều khả năng đang để trống (null). Vài ngày sau, chị kế toán chỉ muốn sửa lại số Km hiển thị trên booking này (khách báo lại số Km chính xác hơn qua điện thoại) — chị mở form Chỉnh sửa lịch hẹn.

### 3. Vấn đề cụ thể

AC-9 nói form sẽ hiển thị "Loại dịch vụ" — "bắt buộc" — với "dữ liệu hiện tại đã điền sẵn". Nhưng nếu `service_type` đang null (vì chưa từng được garage chọn), sẽ không có gì để "điền sẵn" cả. Đồng thời AC-10 liệt kê "Loại dịch vụ" là 1 trong 5 trường bắt buộc để nút "Lưu thay đổi" được enable — nghĩa là chị kế toán, dù chỉ muốn sửa số Km, sẽ BẮT BUỘC phải tự chọn 1 giá trị cho "Loại dịch vụ" GMS-nội bộ (1 danh mục hoàn toàn không liên quan tới "Bảo dưỡng" mà khách đã chọn trên app D+) trước khi có thể lưu bất kỳ thay đổi nào — kể cả những thay đổi không liên quan gì tới dịch vụ.

### 4. Ảnh hưởng nếu không giải quyết

- Garage bị ép phải tự suy đoán/chọn đại 1 giá trị "Loại dịch vụ" GMS-nội bộ không có căn cứ rõ ràng, chỉ để sửa 1 trường hoàn toàn không liên quan (VD số Km) — trải nghiệm khó hiểu và có thể dẫn tới dữ liệu dịch vụ sai lệch được ghi nhận vào hệ thống.
- Nếu điều này chưa từng được test trên môi trường thật, tính năng Chỉnh sửa có thể bị chặn hoàn toàn (nút "Lưu thay đổi" luôn disabled) cho MỌI booking nguồn Driver+ chưa từng có `service_type`, cho tới khi garage vô tình chọn 1 giá trị — đây có thể là 1 bug ẩn chưa bị phát hiện vì baseline trước W07 không có luồng booking nào được tạo mà garage không tự chọn "Loại dịch vụ".
- QA không có oracle rõ ràng: có nên coi đây là behavior đúng (ép garage chọn) hay bug (phải cho phép bỏ trống/giữ nguyên null cho trường hợp này)?

### 5. Đề xuất giải quyết

Đề xuất làm rõ 1 trong 2 hướng: (a) nới lỏng AC-10 để "Loại dịch vụ" không bắt buộc khi booking nguồn Driver+ và trường này đang null — cho phép lưu các thay đổi khác mà không ép chọn; hoặc (b) giữ nguyên yêu cầu bắt buộc nhưng bổ sung UI gợi ý rõ ràng (VD hiển thị kèm chú thích "Khách đã chọn: Bảo dưỡng (Driver+)" bên cạnh ô chọn "Loại dịch vụ" GMS để garage có căn cứ chọn giá trị tương ứng gần nhất). Đây là đề xuất, không phải sự thật đã xác nhận — cần Business Authority quyết định hướng nào phù hợp vận hành thực tế của garage.

### 6. Liên kết với các phát hiện khác

Finding mới, chưa từng xuất hiện trong bản gap review cũ. Cùng chủ đề với RR-027 (hiển thị 2 loại "Loại dịch vụ" độc lập) nhưng khác khía cạnh — RR-027 là hiển thị (Detail), RR-033 là bắt buộc nhập liệu (Edit) có khả năng chặn luồng nghiệp vụ.

### 7. Câu hỏi cho người dùng

(a) "Loại dịch vụ" GMS-nội bộ không bắt buộc khi sửa booking nguồn Driver+ nếu trường này đang trống — chủ garage có thể lưu các thay đổi khác mà không cần chọn giá trị này. (b) Giữ nguyên bắt buộc như hiện tại, đồng thời bổ sung UI gợi ý giá trị Driver+ đã chọn cạnh ô chọn để garage dễ đối chiếu chọn giá trị tương ứng. (c) Đây thực chất KHÔNG phải vấn đề — trên thực tế production, `service_type` LUÔN được garage gán qua 1 luồng khác (VD lúc Xác nhận lịch hẹn) trước khi có thể sửa, cần Backend Lead xác nhận có đúng vậy không.

### 8. Owner

Business Authority + Product Designer (Business Authority quyết định garage có bắt buộc chọn Loại dịch vụ GMS-nội bộ cho booking Driver+ hay không; Designer thiết kế UI gợi ý nếu chọn phương án giữ bắt buộc).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-034 [Cao] Thiếu phủ — Giá trị enum `LeadSource` (bao gồm giá trị đại diện cho "nguồn Driver+") chưa từng được liệt kê tường minh ở bất kỳ tài liệu nào

### 1. Trích dẫn nguồn

- **File**: [gf-sales-data-model.md](../../../requirements/gara/wave-07/Architecture/data/gf-sales-data-model.md#L426)
- **Section**: §2 Entities, bảng cột `booking`
- **Dòng**: 426, đối chiếu dòng 934 (enum `CancelSource` — có liệt kê đủ 3 giá trị, làm chuẩn so sánh)
- **Quote nguyên văn**:
  > | `lead_source` | ENUM `LeadSource` | YES | Nguồn lead |

  So sánh với dòng 934 (đã có sẵn 1 mẫu tốt trong cùng file): `| CancelSource (mới) | DRIVERPLUS_USER, GARAGE_INTERNAL, NO_SHOW_AUTO | BR-BOOK-023 (liệt kê đủ 3, verbatim) |`

  Và đối chiếu [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L564): `SO liên kết booking có nguồn Driver+ (`booking.source = DRIVER_PLUS` — cùng gate nguồn với §3.1 D11)`.

### 2. Bối cảnh nghiệp vụ

Toàn bộ cơ chế gate "chỉ publish/xử lý cho booking nguồn Driver+" — vốn là xương sống của OUTBOUND EC-2/D11 (chỉ gửi `BOOKING.CHANGE.STATUS` cho booking Driver+) và của index mới `idx_booking_tenant_lead_source_status` — đều dựa trên việc so sánh giá trị của cột `lead_source`. Nhưng khác hẳn với `CancelSource` (3 giá trị `DRIVERPLUS_USER`/`GARAGE_INTERNAL`/`NO_SHOW_AUTO` được liệt kê rõ ràng, verbatim, có cite BR-BOOK-023), cột `lead_source` chỉ được mô tả là "ENUM `LeadSource`" — không nơi nào trong toàn bộ tài liệu đã đọc liệt kê đủ tập giá trị thật của enum này (VD `DRIVER_PLUS`? `DRIVERPLUS`? `DRIVER_PLUS_APP`?).

### 3. Vấn đề cụ thể

Chính vì thiếu định nghĩa tường minh này, đã có 1 tài liệu Architecture khác (§3.10 Document sync, dùng chung field này) viết SAI cả tên cột lẫn giá trị: `booking.source = DRIVER_PLUS` — trong khi tên cột thật là `lead_source` (không phải `source`), và giá trị `DRIVER_PLUS` chưa từng được xác nhận là đúng mã enum ở bất kỳ nơi nào khác. Đây không phải lỗi đánh máy đơn lẻ vô hại — nó là bằng chứng trực tiếp cho thấy hợp đồng dữ liệu (tên cột + giá trị enum) của chính điều kiện gate cốt lõi nhất của toàn bộ tích hợp Driver+ (OUTBOUND EC-2/D11) chưa từng được "pin" cứng ở một nơi duy nhất, khiến người viết tài liệu khác (và có thể cả DEV sau này) phải tự đoán tên cột/giá trị theo trực giác thay vì tra cứu.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu DEV implement điều kiện gate ở `ServiceOrderV3Service` (Document sync) đúng theo câu chữ `booking.source = DRIVER_PLUS` mà không tự phát hiện đây là field/giá trị sai, mệnh đề WHERE sẽ không bao giờ khớp — khiến tính năng Document sync không bao giờ kích hoạt cho bất kỳ booking Driver+ nào, lỗi âm thầm không báo exception.
- Cùng rủi ro này áp dụng cho chính OUTBOUND EC-2/D11 (booking relay) nếu bất kỳ đoạn code/tài liệu nào khác cũng nhầm lẫn tương tự khi tra cứu giá trị enum cho "nguồn Driver+" — QA không có 1 nguồn chân lý duy nhất để đối chiếu khi viết test data (tạo booking test với `lead_source` giá trị gì để mô phỏng "nguồn Driver+"?).
- Đây là finding mức Cao vì ảnh hưởng trực tiếp tới khả năng viết test case chính xác cho OUTBOUND EC-2/D11 — không có oracle rõ ràng để biết giá trị enum chuẩn cần seed vào dữ liệu test.

### 5. Đề xuất giải quyết

Đề xuất bổ sung 1 dòng liệt kê đầy đủ giá trị `LeadSource` verbatim vào `gf-sales-data-model.md` §2 (cạnh mô tả cột `lead_source`), theo đúng mẫu đã làm tốt cho `CancelSource` ở §2ter.3 — đối chiếu với 3 nhãn hiển thị đã biết ở `BR-BOOK-003` ("Từ ứng dụng tài xế", "Garage Care", "Walk-in") để suy ra 3 mã enum kỹ thuật tương ứng cần Backend Lead xác nhận từ source code thật. Đồng thời sửa lại `gf-sales-events.md` dòng 564 từ `booking.source` thành `booking.lead_source` với đúng giá trị enum sau khi xác nhận. Đây là đề xuất dựa trên pattern đã áp dụng tốt cho `CancelSource` trong cùng tài liệu, không phải giá trị đã xác nhận.

### 6. Liên kết với các phát hiện khác

Finding mới. Root cause chung với lỗi cụ thể ở §3.10 (Document sync, ngoài phạm vi Booking relay của gap review này) — nhưng bản thân gap "enum `LeadSource` chưa liệt kê" nằm hoàn toàn trong phạm vi Booking relay vì đây là điều kiện gate của OUTBOUND EC-2/D11 và của index `idx_booking_tenant_lead_source_status` (cite INBOUND AC-8 · OUTBOUND EC-2).

### 7. Câu hỏi cho người dùng

(a) Bổ sung bảng liệt kê đầy đủ giá trị `LeadSource` (tên mã enum kỹ thuật thật, không chỉ nhãn hiển thị tiếng Việt) vào `gf-sales-data-model.md`, đồng thời sửa lỗi tên cột/giá trị sai ở `gf-sales-events.md` §3.10. (b) Backend Lead xác nhận trực tiếp từ source code hiện có (enum Java `LeadSource`) rồi cập nhật tài liệu theo đúng thực tế, không suy đoán từ nhãn hiển thị. (c) Chấp nhận rủi ro này ở mức thấp vì tin rằng DEV sẽ tự tra code thay vì đọc theo văn bản tài liệu — không cần sửa gì thêm (không khuyến nghị, vì đi ngược nguyên tắc tài liệu là nguồn chân lý).

### 8. Owner

Backend Lead (là người duy nhất có quyền truy cập source code thật để xác nhận chính xác giá trị enum `LeadSource` hiện có trong hệ thống).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-035 [Cao] Mơ hồ — Ngưỡng "quá hạn" cho auto-cancel/NO_SHOW_AUTO có 3 giá trị timer khác nhau trong Architecture, trong khi Product vẫn ghi nhận đây là quy tắc chưa chốt

### 1. Trích dẫn nguồn

- **File**: [gf-sales-HLD.md](../../../requirements/gara/wave-07/Architecture/hld/gf-sales-HLD.md#L165-L167)
- **Section**: §6 Quality Attributes
- **Dòng**: 165-167
- **Quote nguyên văn**:
  > | Auto-cancel booking | sau **60 min** quá hạn (`BOOKING_AUTO_CANCEL_TIMEOUT_MINUTES`) |
  > | No-show check trigger | **30 min** sau scheduled time (`BOOKING_NO_SHOW_DELAY`) |
  > | Booking confirmation timeout | **24h** sau create (`BOOKING_CONFIRMATION_TIMEOUT`) |

  Đối chiếu [BR-GF-SALES.md](../../../requirements/gara/wave-07/Product/business-rules/BR-GF-SALES.md#L333) §7.2 M-1 (self-flagged missing rule, chưa được cập nhật dù Architecture đã có số liệu): "Thiếu quy tắc thời gian quá hạn booking — BR-BOOK-017 ghi nhận 'quá hạn thời gian quy định' nhưng không xác định cụ thể bao lâu... Cần Business Authority xác định thời gian quá hạn cụ thể hoặc cơ chế cấu hình."

  Đối chiếu [FEAT-BOOK-LIST.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-LIST.md#L110-L113) AC-14: "Khi: lịch hẹn ở trạng thái 'Lịch hẹn mới' hoặc 'Đã xác nhận' **quá hạn thời gian quy định**."

### 2. Bối cảnh nghiệp vụ

Booking LH-20260812-00001 (nguồn Driver+) được tạo lúc 08:00, hẹn giờ 09:00. Garage chưa kịp xác nhận. Đến 1 thời điểm nào đó, hệ thống phải tự động chuyển booking này sang "Đã hủy" (`cancel_source=NO_SHOW_AUTO`) theo BR-BOOK-017/FEAT-BOOK-LIST AC-14. Câu hỏi đặt ra: "1 thời điểm nào đó" là thời điểm nào — tính từ lúc tạo hay từ lúc giờ hẹn đã qua?

### 3. Vấn đề cụ thể

`gf-sales-HLD.md` §6 liệt kê tới 3 hằng số timer khác nhau có vẻ liên quan tới cùng khái niệm "quá hạn": `BOOKING_AUTO_CANCEL_TIMEOUT_MINUTES` = 60 phút, `BOOKING_NO_SHOW_DELAY` = 30 phút (tính "sau scheduled time" — tức sau giờ hẹn), và `BOOKING_CONFIRMATION_TIMEOUT` = 24 giờ (tính "sau create" — tức sau lúc tạo booking). Có ít nhất 2 khả năng đọc: Khả năng A — đây là 3 cơ chế ĐỘC LẬP hoàn toàn khác nhau về mục đích (VD 24h là ngưỡng nhắc nhở/cảnh báo garage chưa xác nhận, 30 phút là ngưỡng tự động NO_SHOW sau giờ hẹn, 60 phút là 1 cơ chế auto-cancel khác nữa chưa rõ áp dụng cho case nào) và chỉ 1 trong 3 mới thực sự là ngưỡng chi phối FEAT-BOOK-LIST AC-14. Khả năng B — có sự chồng chéo/mâu thuẫn thực sự giữa các con số này (VD "Auto-cancel" và "No-show" nghe như cùng 1 khái niệm nhưng lại có 2 giá trị khác nhau: 60 phút vs 30 phút). Trong khi đó, `BR-GF-SALES.md` §7.2 M-1 — nằm CÙNG 1 file, mục "Missing rules" tự nhận là chưa giải quyết — chưa được cập nhật để phản ánh rằng Architecture đã đưa ra con số cụ thể, khiến 2 phần của cùng 1 tài liệu Product tự mâu thuẫn nhau về việc câu hỏi này đã được trả lời hay chưa.

### 4. Ảnh hưởng nếu không giải quyết

- QA không biết chính xác giá trị nào để dùng làm oracle khi viết test case cho FEAT-BOOK-LIST AC-14 — nếu chọn sai giữa 30 phút/60 phút/24 giờ, test sẽ liên tục fail hoặc pass sai (false positive) tuỳ ngẫu nhiên thời điểm chạy test.
- Business Authority có thể vô tình bỏ sót việc rà soát và chốt chính thức quy tắc này, vì Architecture "trông có vẻ" đã có số liệu cụ thể (dễ khiến người đọc nhanh nghĩ là đã xong), trong khi thực chất đây có thể chỉ là giá trị đề xuất/mặc định kỹ thuật (`Propose` — như cách các số liệu khác trong §7.1 cùng file được đánh dấu) chưa qua xác nhận nghiệp vụ.
- Không rõ 3 con số có đang overlap gây xung đột hành vi thực tế hay không — VD nếu `BOOKING_NO_SHOW_DELAY` (30 phút sau giờ hẹn) trigger trước `BOOKING_AUTO_CANCEL_TIMEOUT_MINUTES` (60 phút, không rõ tính từ đâu), 2 scheduler có giẫm chân lên nhau không.

### 5. Đề xuất giải quyết

Đề xuất Business Authority + Solution Architect ngồi lại đối chiếu rõ: 3 hằng số này có phải cùng 1 khái niệm (thừa 2, chỉ giữ 1) hay 3 cơ chế độc lập (mỗi cái phục vụ 1 mục đích khác nhau, cần đặt tên/mô tả phân biệt rõ hơn trong tài liệu). Sau khi chốt, cập nhật lại `BR-GF-SALES.md` §7.2 M-1 để đóng mục "missing rule" này (xoá khỏi danh sách hoặc chuyển thành "RESOLVED" với trích dẫn ngược sang `gf-sales-HLD.md` §6). Đây là đề xuất về quy trình đối soát, không tự đề xuất con số cụ thể vì đây thuộc thẩm quyền nghiệp vụ.

### 6. Liên kết với các phát hiện khác

Tương đương RR-010 cũ, cập nhật bằng chứng mới rất quan trọng (3 con số cụ thể ở Architecture, kết hợp mâu thuẫn với chính Product) khiến finding trở nên cụ thể và nghiêm trọng hơn bản gap review trước.

### 7. Câu hỏi cho người dùng

(a) Xác nhận `BOOKING_NO_SHOW_DELAY` (30 phút sau giờ hẹn) là con số duy nhất chi phối FEAT-BOOK-LIST AC-14/BR-BOOK-017, còn 2 hằng số kia phục vụ mục đích khác (VD `BOOKING_CONFIRMATION_TIMEOUT` 24h chỉ dùng để gửi nhắc nhở garage, không tự hủy booking) — cần ghi rõ vào Product. (b) Xác nhận cả 3 con số cùng áp dụng theo trình tự (VD 24h không xác nhận → cảnh báo, rồi 30 phút sau giờ hẹn → NO_SHOW) — cần Product mô tả rõ luồng nhiều bước này thay vì 1 AC đơn giản như hiện tại. (c) Đây là giá trị mặc định kỹ thuật (`Propose`) chưa qua Business Authority xác nhận chính thức — cần 1 buổi làm việc riêng để chốt trước khi đưa vào code.

### 8. Owner

Business Authority + Solution Architect (Business Authority chốt ý nghĩa nghiệp vụ và giá trị cuối cùng; Solution Architect đảm bảo 3 cơ chế kỹ thuật không xung đột nhau khi triển khai).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-036 [Trung bình] Tương tranh — Race giữa việc tắt flag `Booking:DriverPlus` và event đã nằm sẵn trong outbox chờ gửi

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L85-L90)
- **Section**: §2bis.2 Cutover
- **Dòng**: 85-90
- **Quote nguyên văn**:
  > 3. Rollback: tắt flag `Booking:DriverPlus` → adapter gate + gate publish tắt, quay lại hành vi baseline; **field additive vẫn được gửi** (vô hại).

### 2. Bối cảnh nghiệp vụ

Đội vận hành phát hiện Driver+ đang gặp sự cố diện rộng, quyết định bấm kill-switch tắt flag `Booking:DriverPlus` lúc 14:00:00. Ngay trước đó, lúc 13:59:55, garage vừa bấm "Xác nhận" cho booking LH-20260812-00001 (nguồn Driver+), khiến hệ thống ghi 1 dòng `outbox_event` (status `PENDING`) mang `BOOKING.CHANGE.STATUS` chờ `OutboxProcessor` gửi (poll mỗi 10 giây theo `gf-sales-HLD.md` §6). Dòng outbox này được ghi TRƯỚC khi flag tắt.

### 3. Vấn đề cụ thể

§2bis.2 mô tả rất rõ hành vi "gate" — tức là điểm quyết định CÓ GHI outbox hay không — nằm ở thời điểm xử lý nghiệp vụ (lúc garage bấm Xác nhận). Nhưng không có dòng nào mô tả `OutboxProcessor` (chạy nền, độc lập với luồng request-response) có TỰ KIỂM TRA LẠI trạng thái flag tại thời điểm THỰC SỰ GỬI hay không. Nếu `OutboxProcessor` chỉ đơn thuần gửi mọi dòng `PENDING` bất kể flag hiện tại là gì (cách thiết kế outbox pattern phổ biến — outbox không biết gì về business flag), thì dòng outbox đã ghi lúc 13:59:55 vẫn sẽ được gửi đi lúc 14:00:05 (vòng poll kế tiếp), dù garage/vận hành đã chủ động tắt flag đúng 10 giây trước đó với ý định "ngừng ngay lập tức mọi tương tác với Driver+ đang gặp sự cố".

### 4. Ảnh hưởng nếu không giải quyết

- Mục đích thực sự của việc bấm kill-switch (dừng NGAY LẬP TỨC gửi dữ liệu sang 1 đối tác đang gặp sự cố) có thể không đạt được hoàn toàn trong vài giây/vài chục giây "vùng đệm" quanh thời điểm tắt flag — vẫn có 1 số message lọt ra ngoài đúng lúc đối tác không sẵn sàng nhận (có thể worse hơn: gửi vào đúng lúc hạ tầng D+ đang lỗi, khiến message đó thất bại và lại rơi vào chu kỳ retry của chính GMS).
- Không có test case nào verify được chính xác hành vi "biên" này — chỉ có mô tả rất rõ ràng cho case bình thường (flag tắt → adapter gate chặn) mà không có case race-condition khi outbox đã có sẵn item chờ.
- Đây không phải lỗi nghiêm trọng vì tài liệu đã tự nhận "field additive vẫn được gửi (vô hại)" — ngụ ý các bên soạn thảo NHẬN THỨC ĐƯỢC rằng dữ liệu có thể vẫn rò rỉ ra sau khi tắt flag, chỉ là chưa nói rõ ràng đây có phải hành vi CHỦ ĐÍCH cho toàn bộ luồng gửi (không riêng "field additive") hay không.

### 5. Đề xuất giải quyết

Đề xuất làm rõ trong tài liệu: `OutboxProcessor` khi gửi 1 dòng thuộc luồng Driver+ CÓ tái kiểm tra flag `Booking:DriverPlus` tại thời điểm gửi hay không. Nếu KHÔNG tái kiểm tra (thiết kế outbox thuần), cần ghi rõ đây là hành vi chủ đích chấp nhận được (do khoảng thời gian lọt rất ngắn, tối đa 1 vòng poll 10 giây) để tránh hiểu nhầm là bug. Đây là đề xuất làm rõ tài liệu, không phải yêu cầu thay đổi hành vi — cần Backend Lead xác nhận thiết kế `OutboxProcessor` thực tế.

### 6. Liên kết với các phát hiện khác

Tương đương RR-011 cũ, vẫn còn hiệu lực với citation cập nhật từ nội dung mới (§2bis.2 Cutover).

### 7. Câu hỏi cho người dùng

(a) Xác nhận `OutboxProcessor` KHÔNG tái kiểm tra flag tại thời điểm gửi (thiết kế outbox thuần) — đây là hành vi chấp nhận được, chỉ cần ghi rõ vào tài liệu để tránh hiểu nhầm. (b) Bổ sung việc `OutboxProcessor` tái kiểm tra flag tại thời điểm gửi cho riêng nhóm event Driver+ — đảm bảo kill-switch có hiệu lực tức thời tuyệt đối, chấp nhận thêm 1 lượt gọi `FeatureFlagService` mỗi lần gửi. (c) Đây là rủi ro chấp nhận được ở mức thấp (do khoảng lọt tối đa 10 giây, tần suất kill-switch cực hiếm) — không cần làm gì thêm.

### 8. Owner

Backend Lead (xác nhận thiết kế `OutboxProcessor` hiện tại có tái kiểm tra flag hay không, và đánh giá chi phí bổ sung nếu cần).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-037 [Trung bình] Biên — Payload đặt lịch (`appointmentDate`) không validate ngày quá khứ/quá xa tương lai

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L458)
- **Section**: §3.8, bảng field #3 `appointmentDate`
- **Dòng**: 458
- **Quote nguyên văn**:
  > | 3 | `appointmentDate` | Date `YYYY-MM-DD` | ✅ | **Parse được** | `booking.booked_at` (ghép với #4) | INBOUND AC-2 |

### 2. Bối cảnh nghiệp vụ

Do lỗi hiển thị lịch trên app Driver+ (hoặc lỗi múi giờ khi convert), khách hàng vô tình chọn ngày hẹn là "2026-08-01" (đã qua, vì hôm nay là 2026-08-12) hoặc ngược lại chọn nhầm "2027-08-12" (1 năm sau, do bấm nhầm nút chuyển năm trên date-picker). App vẫn gửi request tạo booking với giá trị này sang GMS.

### 3. Vấn đề cụ thể

Cột "Validation tại adapter gate" của trường `appointmentDate` chỉ ghi "Parse được" — nghĩa là chỉ cần đúng định dạng `YYYY-MM-DD`, không có ràng buộc về khoảng giá trị hợp lý (không cho phép ngày trong quá khứ, không giới hạn số ngày tối đa trong tương lai). Đối chiếu với trường `appointmentTime` (field #4) ngay cạnh đó — được validate rất chi tiết (giờ 00-23, phút phải là bội số 15) — sự thiếu vắng ràng buộc tương tự cho `appointmentDate` là 1 khoảng trống rõ rệt, đặc biệt vì cả 2 trường được "ghép" lại thành `booking.booked_at` duy nhất.

### 4. Ảnh hưởng nếu không giải quyết

- Garage có thể nhận được 1 "Lịch hẹn mới" với ngày hẹn đã qua từ lâu — hiển thị trên Danh sách/Chi tiết lịch hẹn 1 cách vô nghĩa (VD "Thời gian hẹn: 2026-08-01" trong khi hôm nay đã là 2026-08-12), gây nhầm lẫn khi lọc theo khoảng thời gian (FEAT-BOOK-LIST AC-5).
- Không rõ cơ chế "quá hạn tự động" (FEAT-BOOK-LIST AC-14, xem RR-035) có xử lý đúng cho case ngày hẹn NGAY TỪ ĐẦU đã ở quá khứ hay không — có thể trigger NO_SHOW_AUTO gần như ngay lập tức sau khi tạo, hoặc ngược lại logic scheduler có giả định ngầm "ngày hẹn luôn ở tương lai" nên xử lý sai.
- Không có test case rõ ràng để verify hệ thống có nên reject (giống case sai bước 15 phút) hay chấp nhận và để garage tự judgment.

### 5. Đề xuất giải quyết

Đề xuất bổ sung ràng buộc: `appointmentDate` không được ở quá khứ (nhỏ hơn ngày hiện tại) và có giới hạn hợp lý về khoảng cách tối đa trong tương lai (VD tối đa 90 ngày, tương tự các hệ thống đặt lịch phổ biến) — vi phạm sẽ reject tại adapter gate với `ERR-BOOK-001` giống case sai bước 15 phút. Đây là đề xuất dựa trên best practice validate ngày hẹn, con số cụ thể (90 ngày) chỉ là ví dụ minh hoạ cần Business Authority xác nhận.

### 6. Liên kết với các phát hiện khác

Tương đương RR-009 cũ, vẫn còn hiệu lực.

### 7. Câu hỏi cho người dùng

(a) Bổ sung validate `appointmentDate` không được ở quá khứ + giới hạn tối đa trong tương lai, reject bằng `ERR-BOOK-001` giống case sai bước 15 phút. (b) Chấp nhận mọi giá trị ngày hợp lệ về định dạng, để garage tự nhận biết và xử lý thủ công (VD từ chối lịch hẹn có ngày bất thường) — không cần validate thêm ở tầng hệ thống. (c) Giao cho phía Driver+ tự đảm bảo ngày hẹn luôn hợp lý trước khi gửi (vì app D+ đã có UI date-picker chỉ cho chọn ngày tương lai) — GMS tin tưởng hoàn toàn dữ liệu đầu vào từ đối tác, không cần validate lại (cần đối chiếu với cách AC-2 đã xử lý tương tự cho `customerPhone` — "không cần validate lại vì đã đảm bảo hợp lệ từ phía Driver+" — để nhất quán nguyên tắc).

### 8. Owner

Business Authority (quyết định khoảng giá trị ngày hẹn hợp lệ và có nên tin tưởng hoàn toàn dữ liệu từ Driver+ theo đúng tinh thần đã áp dụng cho `customerPhone`).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-038 [Thấp] Mơ hồ — `PKG-W07` dùng tên trạng thái "NEW"/"CONFIRMED" không khớp enum canonical `BookingStatus` đã chốt

### 1. Trích dẫn nguồn

- **File**: [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L53)
- **Section**: §2.2.2 Backend — `gf-sales`: Booking relay
- **Dòng**: 53
- **Quote nguyên văn**:
  > - `BOOKING.CANCELLED`: chỉ auto-cancel booking `NEW`/`CONFIRMED` chưa có service order; trường hợp state không phù hợp giữ nguyên và đồng bộ trạng thái thực tế.

Đối chiếu [gf-sales-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-sales-api.md#L4206) §5.2: `| BookingStatus (enum kỹ thuật nội bộ, không đổi W07) | BOOKING | BOOKED | ARRIVED | CANCELLED | DECLINED | NO_SHOW |`

### 2. Bối cảnh nghiệp vụ

`PKG-W07` là tài liệu tóm tắt công việc (work package) dùng để giao việc cho các agent lập trình (`agent-dev-gf-sales`) triển khai booking relay. Khi 1 lập trình viên (hoặc dev agent) đọc dòng mô tả nhanh này để hiểu phạm vi việc cần làm cho case "auto-cancel khi nhận `BOOKING.CANCELLED`", họ thấy tên trạng thái viết là `NEW` và `CONFIRMED`.

### 3. Vấn đề cụ thể

Enum kỹ thuật thật sự đã được chốt xuyên suốt `gf-sales-api.md` §5.2 (Naming Registry — nơi có quy tắc P0 "1 concept ↔ 1 canonical name") và `gf-sales-events.md` §3.1 là `BOOKING` (không phải `NEW`) và `BOOKED` (không phải `CONFIRMED`). PKG-W07 dùng 2 tên khác hoàn toàn — có thể là tên mô tả theo nghĩa tiếng Anh thông thường (new/confirmed) chứ không phải mã enum thật, nhưng không có dấu hiệu nào (VD dùng khác font, ký hiệu ~) để phân biệt "đây là mô tả ý nghĩa" với "đây là mã kỹ thuật thật cần gõ vào code".

### 4. Ảnh hưởng nếu không giải quyết

- Một dev agent đọc PKG-W07 làm nguồn tham khảo nhanh (như đúng vai trò tài liệu này được thiết kế) có rủi ro implement nhầm literal string `"NEW"`/`"CONFIRMED"` vào điều kiện so sánh, trong khi enum thật trong hệ thống là `BOOKING`/`BOOKED` — gây lỗi runtime hoặc logic sai âm thầm (điều kiện luôn false vì không khớp giá trị thật).
- Đây đúng là loại lỗi mà chính `gf-sales-api.md` §4 Forbidden Patterns đã cảnh báo: "❌ Dùng field không có row trong §5 Naming Registry cho payload Driver+ (alien field) — Reviewer G11 P0" — dù đây là tên trạng thái (không phải tên field), cùng bản chất rủi ro "1 concept nhưng 2 tên gọi khác nhau giữa các tài liệu".

### 5. Đề xuất giải quyết

Đề xuất sửa `PKG-W07` dòng 53 dùng đúng mã enum canonical (`BOOKING`/`BOOKED`) thay vì tên mô tả (`NEW`/`CONFIRMED`), hoặc nếu muốn giữ tên dễ đọc thì ghi kèm cả 2 dạng (VD "booking `Lịch hẹn mới` (`BOOKING`) / `Đã xác nhận` (`BOOKED`)"). Đây là sửa lỗi thuần văn bản, độ tin cậy cao vì đối chiếu trực tiếp với Naming Registry đã chốt.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Sửa PKG-W07 dùng đúng mã enum `BOOKING`/`BOOKED` theo Naming Registry đã chốt. (b) Giữ nguyên cách viết mô tả (`NEW`/`CONFIRMED`) vì PKG-W07 chỉ là tài liệu tóm tắt cho con người đọc, không phải nguồn code trực tiếp — chỉ cần nhắc dev agent luôn tra `gf-sales-api.md` §5.2 làm nguồn chân lý cho tên enum thật.

### 8. Owner

Backend Lead (đảm bảo dev agent không copy nhầm tên trạng thái từ PKG-W07 vào code).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-039 [Thấp] Mơ hồ — Frontmatter `boundary: sales` của `gf-sales-events.md` không khớp tên boundary chuẩn `gf-sales` dùng ở mọi nơi khác

### 1. Trích dẫn nguồn

- **File**: [gf-sales-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-sales-events.md#L8)
- **Section**: Frontmatter YAML
- **Dòng**: 8
- **Quote nguyên văn**:
  > boundary: sales

Đối chiếu [ARCH-REVIEW-W07.md](../../../requirements/gara/wave-07/tracking/ARCH-REVIEW-W07.md#L43): "`gf-system-events.md:8` `boundary: tenant-system` và `gf-sales-events.md:8` `boundary: sales` don't match their file-path-implied boundary (`gf-system`/`gf-sales`) — this predates W07 (verified via `git show eec8ee9^:...`)."

### 2. Bối cảnh nghiệp vụ

Mọi tài liệu khác đã đọc trong phạm vi Booking relay (Feature files, BR-GF-SALES.md, gf-sales-HLD.md, gf-sales-api.md, gf-sales-data-model.md) đều dùng đúng `boundary: "gf-sales"` trong frontmatter — trừ riêng `gf-sales-events.md`, nơi ghi `boundary: sales` (thiếu tiền tố `gf-`).

### 3. Vấn đề cụ thể

Đây là drift đặt tên thuần tuý ở tầng metadata, không ảnh hưởng nội dung nghiệp vụ. Bản thân `ARCH-REVIEW-W07.md` đã tự phát hiện và ghi nhận rõ đây là lỗi có từ trước Wave 7 ("predates W07"), không phải lỗi phát sinh từ đợt viết lại Booking relay lần này.

### 4. Ảnh hưởng nếu không giải quyết

- Bất kỳ công cụ/script nào lọc tài liệu theo `boundary` field (VD để tự động gom toàn bộ tài liệu thuộc `gf-sales` phục vụ 1 agent) có nguy cơ bỏ sót chính file quan trọng nhất của Booking relay (`gf-sales-events.md`) nếu filter chính xác theo chuỗi `"gf-sales"`.
- Rủi ro thấp vì đã được ghi nhận công khai trong tracking file, nhưng nếu không có ai chủ động sửa, gap này sẽ tiếp tục tồn tại vô thời hạn qua các wave sau.

### 5. Đề xuất giải quyết

Đề xuất sửa `boundary: sales` thành `boundary: "gf-sales"` trong frontmatter của `gf-sales-events.md`, đồng bộ với mọi tài liệu khác cùng boundary. Đây là sửa lỗi cosmetic độ rủi ro thấp, có thể gộp chung với các đợt dọn dẹp editorial khác.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này. Đã được ghi nhận trước đó (không phải phát hiện mới) trong `ARCH-REVIEW-W07.md`, đưa vào đây để đảm bảo không bỏ sót khi tổng hợp gap review chính thức của Wave 7.

### 7. Câu hỏi cho người dùng

(a) Sửa ngay `boundary: sales` → `boundary: "gf-sales"` trong đợt này, gộp chung batch fix cosmetic. (b) Để nguyên, vì đã tracking sẵn ở `ARCH-REVIEW-W07.md`, ưu tiên thấp hơn các finding nghiệp vụ khác của wave — xử lý sau trong 1 đợt dọn dẹp editorial riêng.

### 8. Owner

Solution Architect (chỉ cần sửa 1 dòng frontmatter, không cần thẩm quyền nghiệp vụ).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-040 [Trung bình] Biên — FEAT-BOOK-EDIT AC-8 không validate bước 15 phút khi sửa giờ hẹn của booking nguồn Driver+

### 1. Trích dẫn nguồn

- **File**: [FEAT-BOOK-EDIT.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-EDIT.md#L86-L89)
- **Section**: AC-8 "Chỉnh sửa ngày và giờ hẹn"
- **Dòng**: 86-89
- **Quote nguyên văn**:
  > - [ ] **AC-8**: Chỉnh sửa ngày và giờ hẹn
  >   - Tại: mục Thời gian hẹn, trường "Ngày hẹn" và "Giờ hẹn".
  >   - Khi: chủ garage thay đổi ngày hoặc giờ hẹn.
  >   - Thì: hệ thống kiểm tra khung giờ **tương tự như khi tạo mới** (xem `FEAT-BOOK-CREATE` AC-12, AC-13, AC-14). Cả hai trường bắt buộc.

Đối chiếu [FEAT-BOOK-DRIVERPLUS-INBOUND.md](../../../requirements/gara/wave-07/Product/features/FEAT-BOOK-DRIVERPLUS-INBOUND.md#L118) EC-3: "Giờ hẹn nhận được không đúng bước 15 phút... chốt: validate + reject tại adapter gate, không tạo booking."

### 2. Bối cảnh nghiệp vụ

Booking LH-20260812-00001 (nguồn Driver+) được tạo với giờ hẹn `09:15` — hợp lệ theo đúng ràng buộc "bước 15 phút" mà adapter gate của INBOUND EC-3 đã kiểm tra lúc tạo. Vài ngày sau, khách gọi điện garage xin đổi giờ hẹn sang `09:20`. Nhân viên garage mở form Chỉnh sửa lịch hẹn, sửa "Giờ hẹn" thành `09:20` rồi bấm "Lưu thay đổi".

### 3. Vấn đề cụ thể

AC-8 chỉ dẫn chiếu sang FEAT-BOOK-CREATE AC-12/13/14 — 3 AC này (đã đọc lại đầy đủ) đều chỉ mô tả cơ chế "Kiểm tra khung giờ" theo nghĩa CẢNH BÁO XUNG ĐỘT với lịch hẹn khác gần đó (hiển thị "Đang kiểm tra khung giờ...", "Khung giờ phù hợp", hoặc "Có {n} lịch hẹn gần thời điểm bạn chọn") — hoàn toàn KHÔNG phải cơ chế validate "giờ phải là bội số 15 phút" mà INBOUND EC-3 đã chốt riêng cho luồng nhận từ Driver+. Vì AC-8 không dẫn chiếu tới ràng buộc bước-15-phút này, nhân viên garage hoàn toàn có thể lưu giờ hẹn `09:20` (không phải bội số 15) cho 1 booking vốn có nguồn gốc từ Driver+ — phá vỡ ngầm định "giờ hẹn của booking nguồn Driver+ luôn là bội số 15 phút" mà chính hệ thống đã dùng làm căn cứ validate lúc tạo.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu có bất kỳ logic nào khác trong hệ thống (hiện tại hoặc tương lai) giả định ngầm rằng "giờ hẹn của booking nguồn Driver+ luôn đúng bước 15 phút" (VD để tính toán slot lịch, hiển thị timeline theo khối 15 phút), giá trị `09:20` sau khi sửa sẽ phá vỡ giả định đó mà không ai phát hiện.
- Khi hệ thống gửi lại thông tin đã cập nhật sang Driver+ qua `BOOKING.UPDATE.RESPONSE` (AC-15, xem RR-025), phía Driver+ — vốn được thiết kế xoay quanh khái niệm "khung giờ 15 phút" (theo đúng FEAT-DP-034 gốc) — nhận được giờ hẹn không đúng bước 15 phút mà GMS chưa từng thoả thuận rõ với D+ là có được chấp nhận hay không ở chiều ngược lại (GMS → D+).
- QA không có oracle rõ ràng để viết test case "sửa giờ hẹn booking Driver+ thành giờ không đúng bước 15 phút — có bị chặn hay không".

### 5. Đề xuất giải quyết

Đề xuất bổ sung vào AC-8: nếu booking đang sửa có nguồn Driver+, áp dụng thêm validate bước 15 phút (tương tự INBOUND EC-3) bên cạnh cơ chế kiểm tra khung giờ trùng lặp hiện có. Đây là đề xuất dựa trên nguyên tắc nhất quán dữ liệu xuyên suốt vòng đời booking (không chỉ validate lúc tạo rồi bỏ ngỏ lúc sửa), cần Business Authority xác nhận có thực sự cần ràng buộc này khi SỬA hay chỉ áp dụng lúc TẠO.

### 6. Liên kết với các phát hiện khác

Tương đương RR-030 cũ, vẫn còn hiệu lực. Liên quan tới RR-025 (cùng luồng AC-15 gửi thông tin đã sửa sang Driver+).

### 7. Câu hỏi cho người dùng

(a) Bổ sung validate bước 15 phút vào AC-8 khi sửa giờ hẹn của booking nguồn Driver+, nhất quán với ràng buộc đã áp dụng lúc tạo (INBOUND EC-3). (b) Không cần ràng buộc này khi sửa — vì đây là hành động garage chủ động theo yêu cầu khách qua điện thoại, garage có toàn quyền đặt giờ tuỳ ý kể cả không đúng bước 15 phút, miễn khách đồng ý. (c) Cần làm rõ với đội Driver+ trước: phía họ có chấp nhận nhận về giờ hẹn không đúng bước 15 phút qua `BOOKING.UPDATE.RESPONSE` hay không — nếu không chấp nhận, bắt buộc phải chọn phương án (a).

### 8. Owner

Business Authority (quyết định ràng buộc bước 15 phút có áp dụng cho luồng Sửa hay chỉ luồng Tạo, và có cần xác nhận ngược với đội Driver+ về khả năng chấp nhận giờ lệch khi đồng bộ ngược).

### 9. Trạng thái

ĐANG MỞ

---

## RR-041 [Cao] Thiếu phủ — `gf-accounting-api.md` §6.5 vẫn liệt kê step `DOCUMENT.SERVICE_ORDER.REVOKED` dù ADR-031 v6 đã loại bỏ hoàn toàn step này

### 1. Trích dẫn nguồn

- **File**: [gf-accounting-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-accounting-api.md#L1790-L1794)
- **Section**: §6.5 Naming Registry — bảng enum dùng chung với `gf-sales-api.md`.
- **Dòng**: 1790-1794 (đối chiếu với `gf-sales-api.md` dòng 4231 và ADR-031 Change Log v6, dòng 136).
- **Quote nguyên văn**:
  > | `DocumentMessageStep` | `DOCUMENT.SERVICE_ORDER.SYNC \| DOCUMENT.SETTLEMENT.SYNC \| DOCUMENT.SERVICE_ORDER.REVOKED` | ADR-031 D3 — `gf-accounting` chỉ phát step `DOCUMENT.SETTLEMENT.SYNC`; **không có** `SETTLEMENT.REVOKED` (mandate Q8) |

  Đối chứng — cùng khái niệm nhưng ở `gf-sales-api.md` dòng 4231:
  > | `DocumentMessageStep` | `DOCUMENT.SERVICE_ORDER.SYNC \| DOCUMENT.SETTLEMENT.SYNC` | ADR-031 D3 (2 step — `SETTLEMENT.REVOKED` gỡ round 2 2026-08-10... `SERVICE_ORDER.REVOKED` gỡ 2026-08-11 (v6)...) |

### 2. Bối cảnh nghiệp vụ

Ngày 2026-08-11, Delivery Authority sonhoang chốt qua quy trình `/warm-up gf-sales --phase A` (gap GAP-W07-GSL-02) rằng step `DOCUMENT.SERVICE_ORDER.REVOKED` phải bị loại bỏ hoàn toàn khỏi hợp đồng Kafka — không chỉ hoãn — vì tiền đề duy nhất khiến nó khả thi ("hủy phiếu quyết toán → mở lại SO → hủy SO") không phải là một luồng nghiệp vụ có thật. ADR-031 phiên bản 6 ghi rất rõ danh sách cascade bắt buộc phải sửa cùng lúc: `gf-sales-events.md`, `gf-sales-HLD.md`, `INTEG-EXT-driver-plus.md`, `gf-sales-api.md`, `_CONVENTIONS.md`, `PKG-W07-partner-link-booking-driver-plus.md`, `Plan/WAVE-SEQUENCE.md`. Team đã làm đúng với `gf-sales-api.md` — dòng 4231 hiện chỉ còn 2 giá trị enum, kèm chú thích rõ ràng cả 2 lần loại bỏ REVOKED (round 2 ngày 2026-08-10 cho `SETTLEMENT.REVOKED`, và v6 ngày 2026-08-11 cho `SERVICE_ORDER.REVOKED`).

### 3. Vấn đề cụ thể

Nhưng `gf-accounting-api.md` §6.5 — bảng Naming Registry được chính tài liệu ghi rõ là "dùng chung tên canonical với `gf-sales-api.md` §5.2bis" (dòng 1813, changelog v27) — lại KHÔNG nằm trong danh sách cascade của ADR-031 v6, và enum tại dòng 1792 của nó vẫn giữ nguyên 3 giá trị, bao gồm cả `DOCUMENT.SERVICE_ORDER.REVOKED` đã bị khai tử. Ghi chú đi kèm dòng đó ("gf-accounting chỉ phát step DOCUMENT.SETTLEMENT.SYNC; không có SETTLEMENT.REVOKED") chỉ nói tới việc gỡ `SETTLEMENT.REVOKED` (quyết định vòng 2, ngày 2026-08-10) mà hoàn toàn không đề cập tới việc `SERVICE_ORDER.REVOKED` cũng đã bị gỡ 1 ngày sau đó. Kết quả: cùng một enum được khai báo là "canonical dùng chung" giữa 2 file lại có 2 nội dung khác nhau — 1 file 2 giá trị, 1 file 3 giá trị.

### 4. Ảnh hưởng nếu không giải quyết

- Một dev đọc `gf-accounting-api.md` trước (thay vì `gf-sales-api.md`) sẽ tin rằng `DOCUMENT.SERVICE_ORDER.REVOKED` vẫn là một giá trị hợp lệ của enum `DocumentMessageStep`, có thể vô tình để lại code xử lý cho step không tồn tại hoặc viết test case validate enum sai.
- QA sinh test case validate schema/enum cho hợp đồng Kafka `AC-DEV-DOCUMENT-EVENTS` dựa trên `gf-accounting-api.md` sẽ tạo ra một test case kiểm tra 1 giá trị enum không bao giờ được phát — lãng phí effort và có thể FAIL sai khi implementation (đúng) chỉ hỗ trợ 2 giá trị.
- Cho thấy quy trình cascade của ADR-031 v6 có lỗ hổng thực tế: danh sách "must-update" tự liệt kê trong Change Log không đủ đầy đủ, dù chính tài liệu đó (§6.5, changelog v27) đã tự nhận đây là bản sao của cùng 1 enum canonical.

### 5. Đề xuất giải quyết

Sửa dòng 1792 của `gf-accounting-api.md` để enum `DocumentMessageStep` chỉ còn 2 giá trị (`DOCUMENT.SERVICE_ORDER.SYNC | DOCUMENT.SETTLEMENT.SYNC`), đồng bộ y hệt `gf-sales-api.md` dòng 4231, và cập nhật ghi chú đi kèm để phản ánh cả 2 lần loại bỏ REVOKED (round 2 + v6), giống cách `gf-sales-api.md` đã làm. Nên thêm 1 dòng Change Log mới ghi rõ đây là fix đồng bộ cascade còn sót của ADR-031 v6.

### 6. Liên kết với các phát hiện khác

Cùng nhóm nguyên nhân gốc với RR-042 (tài liệu vệ tinh chưa cập nhật sau ADR-031 v6) và RR-049 (governance artifact không được backfill) — dấu hiệu chung cho thấy khối lượng thay đổi dồn trong 2 ngày 2026-08-10/11 vượt quá khả năng rà soát cascade thủ công.

### 7. Câu hỏi cho người dùng

(a) Chấp nhận đây là lỗi cascade sót và yêu cầu sửa ngay `gf-accounting-api.md` §6.5 để khớp với `gf-sales-api.md`, không cần thêm quyết định nghiệp vụ nào khác. (b) Yêu cầu rà soát lại toàn bộ các nơi khác từng trích dẫn "DocumentMessageStep" trong repo (không chỉ 2 file API) để đảm bảo không còn bản sao nào khác bị sót, trước khi đóng finding này. (c) Giữ nguyên và chỉ ghi nhận là known documentation debt, xử lý ở CR riêng ngoài phạm vi Gap Review lần này.

### 8. Owner

Backend Lead (boundary `gf-accounting`) + Solution Architect (vì đây là lỗi đồng bộ hợp đồng canonical dùng chung giữa 2 boundary, cần người có thẩm quyền xác nhận cascade đã đủ trước khi đóng ADR-031).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-042 [Trung bình] Thiếu phủ — Bảng tham chiếu hợp đồng tại `INTEG-EXT-driver-plus.md` §5 vẫn ghi "Document sync (3 step)" và trích dẫn §3.11 như một step còn sống

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L123-L127)
- **Section**: §5 Request/Response Contracts — bảng "Nguồn canonical".
- **Dòng**: 123-127.
- **Quote nguyên văn**:
  > | Document sync (3 step) | [`gf-sales-events.md` §2ter · §3.10 · §3.11](../events/gf-sales-events.md) (phiếu dịch vụ + thu hồi) · [`gf-accounting-events.md` §3.3](../events/gf-accounting-events.md) (phiếu quyết toán) · [`gf-sales-api.md` §3bis.2`](../api/gf-sales-api.md) (snapshot `for-settlement` — điều kiện emit) |

  Đối chứng — `gf-sales-events.md` dòng 611-613, chính nội dung mà §3.11 hiện đang chứa:
  > ### 3.11 `ServiceOrderDocumentRevoked` — REMOVED (v9, 2026-08-11)
  > **KHÔNG có `DOCUMENT.SERVICE_ORDER.REVOKED`** (loại bỏ hoàn toàn, không chỉ hoãn — ADR-031 v6 D3)...

### 2. Bối cảnh nghiệp vụ

Bản thân file `INTEG-EXT-driver-plus.md` đã được cập nhật đúng ở phần thân — mục §4.3 (dòng 99-117), bảng liệt kê chỉ còn đúng 2 dòng step thật (`DOCUMENT.SERVICE_ORDER.SYNC` và `DOCUMENT.SETTLEMENT.SYNC`), và có hẳn 1 bullet "Thu hồi" (dòng 113) giải thích rất rõ cả 2 step REVOKED đều đã bị loại bỏ. Nhưng ở §5 — bảng dẫn người đọc tới "nguồn canonical" cho từng nhóm hợp đồng — tiêu đề dòng vẫn ghi "Document sync (3 step)" và trỏ người đọc tới `gf-sales-events.md` §3.11 với chú thích "(phiếu dịch vụ + thu hồi)", như thể §3.11 mô tả một cơ chế "thu hồi" (revoke) đang hoạt động.

### 3. Vấn đề cụ thể

Trên thực tế, `gf-sales-events.md` §3.11 không còn mô tả bất kỳ step nào — nó là một đoạn văn xác nhận việc GỠ BỎ step đó, với schema/payload cũ đã bị xóa khỏi tài liệu. Một người đọc đi theo đường dẫn từ §5 của `INTEG-EXT-driver-plus.md` (đúng theo hướng dẫn "Schema đầy đủ ... nằm ở boundary event doc — không lặp lại ở đây") với kỳ vọng tìm thấy payload của step "thu hồi" thứ 3 sẽ hoặc (Khả năng A) hiểu nhầm rằng có 1 step thu hồi thật đang tồn tại và cố tìm payload không có; hoặc (Khả năng B) tự suy luận đúng rằng nó đã bị gỡ nhưng mất thời gian đối chiếu ngược 2 tài liệu để xác nhận, đúng như những gì agent này vừa phải làm khi audit.

### 4. Ảnh hưởng nếu không giải quyết

- Người viết test hợp đồng Kafka (`agent-test-api` theo PKG-W07 §4.3) đọc bảng này trước có thể lên kế hoạch viết test case cho "step thứ 3" không tồn tại, gây lãng phí effort khi rà soát lại.
- Tài liệu tự mâu thuẫn nội bộ giữa §4.3 (đã sửa đúng, ghi rõ không có step thu hồi) và §5 (chưa sửa, vẫn đếm 3 step) trong CÙNG MỘT FILE — làm giảm độ tin cậy của toàn bộ tài liệu khi người đọc phát hiện ra sự vênh này.
- Tăng thời gian audit của lần rà soát Gap Review kế tiếp vì phải verify lại từ đầu liệu "3 step" có phải là số đúng ở thời điểm đó hay không.

### 5. Đề xuất giải quyết

Sửa dòng 127: đổi "Document sync (3 step)" thành "Document sync (2 step)", và bỏ chú thích "(phiếu dịch vụ + thu hồi)" — thay bằng ghi chú trỏ rõ ràng rằng `gf-sales-events.md` §3.11 chỉ còn là ghi chú lịch sử về việc loại bỏ step, không phải một step đang hoạt động (có thể giữ nguyên link tới §3.11 nhưng đổi nhãn thành "(§3.11 — ghi chú loại bỏ REVOKED)"). Đây là sửa lỗi cascade thuần túy trong cùng 1 file, không cần quyết định nghiệp vụ mới.

### 6. Liên kết với các phát hiện khác

Cùng nguyên nhân gốc với RR-041 — cùng đợt cascade ADR-031 v6 chưa lan tỏa hết tới mọi vị trí trích dẫn "3 step"/"REVOKED" trong hệ tài liệu.

### 7. Câu hỏi cho người dùng

(a) Sửa ngay dòng 127 theo đề xuất ở mục 5, coi đây là cosmetic fix không cần chờ quyết định nghiệp vụ. (b) Gộp fix này cùng đợt với RR-041 thành 1 CR dọn dẹp cascade ADR-031 v6 duy nhất, xử lý cả 2 cùng lúc. (c) Bỏ qua vì mức độ ảnh hưởng thấp, chỉ ghi nhận là known issue.

### 8. Owner

Solution Architect (chủ sở hữu `INTEG-EXT-driver-plus.md` với vai trò SSOT external transport, cần xác nhận số step chính thức trước khi publish).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-043 [Cao] Trạng thái — Tái sử dụng mã phiếu quyết toán sau khi hủy (EC-3) va chạm với khóa dedupe `eventId` thuần hàm của mã phiếu, khiến Driver+ có thể bỏ qua chứng từ của phiếu quyết toán hợp lệ mới tạo

### 1. Trích dẫn nguồn

- **File**: [FEAT-STL-CREATE.md](../../../requirements/gara/wave-07/Product/features/FEAT-STL-CREATE.md#L158) và [dòng 168](../../../requirements/gara/wave-07/Product/features/FEAT-STL-CREATE.md#L168)
- **Section**: §5 Business Rules (BR-STL-CRE-004) và §6 Edge Cases (EC-3).
- **Dòng**: 158, 168.
- **Quote nguyên văn**:
  > **BR-STL-CRE-004**: Không cho phép tạo phiếu quyết toán đang hoạt động trùng mã phiếu dịch vụ và loại bên thanh toán. Phiếu đã hủy trước đó có thể được tái sử dụng mã khi tạo lại.

  > **EC-3**: Phiếu dịch vụ đã từng có phiếu quyết toán bị hủy — hệ thống cho phép tạo lại phiếu quyết toán mới, có thể tái sử dụng mã cũ.

  Đối chứng — [ADR-031](../../../requirements/gara/wave-07/Architecture/decisions/ADR-031-driver-plus-document-sync.md#L74-L78), D5:
  > `event_id = UUIDv5(NS_DP_DOCUMENT, documentCode + "|" + documentType)`... Retry kỹ thuật lặp y nguyên `event_id` → D+ dedupe sạch... **Known limitation**: khoá **không có `revision`** → phiếu được **sửa / xuất lại** sau khi đã emit sẽ mang cùng `event_id` và bị D+ bỏ qua.

### 2. Bối cảnh nghiệp vụ

Hình dung phiếu dịch vụ PDV-20260810-00042, nguồn từ 1 booking Driver+ (mã LH-20260810-00007), vừa hoàn thành sửa chữa. Chủ garage tạo phiếu quyết toán SET-20260810-00013, `gf-accounting` phát `DOCUMENT.SETTLEMENT.SYNC` với `eventId` được sinh từ hàm `UUIDv5(NS_DP_DOCUMENT, "SET-20260810-00013|SETTLEMENT")`, Driver+ nhận và ghi vào hồ sơ số của xe. Vài phút sau, khách phát hiện nhân viên nhập sai số tiền, kế toán vào hủy phiếu quyết toán này (theo BR-GF-SALES §3.4 và BR-STL-CRE-004, phiếu quyết toán chưa có thanh toán nên được phép hủy, SO tự động mở lại từ "Đã tạo quyết toán" về "Hoàn thành"). Kế toán sửa lại số liệu và tạo phiếu quyết toán mới cho đúng SO đó. Theo đúng EC-3, hệ thống "có thể tái sử dụng mã cũ" — tức là phiếu quyết toán MỚI này hoàn toàn có thể lại mang chính mã SET-20260810-00013 vừa bị hủy.

### 3. Vấn đề cụ thể

Nếu phiếu quyết toán mới thực sự tái sử dụng đúng mã cũ như EC-3 mô tả, thì `documentCode` gửi cho sự kiện `DOCUMENT.SETTLEMENT.SYNC` lần thứ 2 sẽ lại là "SET-20260810-00013" — và vì `eventId` là hàm thuần của `(documentCode, documentType)` (ADR-031 D5), `eventId` sinh ra sẽ TRÙNG Y HỆT với `eventId` của lần phát đầu tiên (đã bị hủy). Theo đúng cơ chế dedupe mà chính ADR-031 D5 xác nhận là "known limitation", Driver+ sẽ coi sự kiện thứ 2 này là một lần retry của sự kiện đã xử lý trước đó và ÂM THẦM BỎ QUA nó — dù đây là một phiếu quyết toán hoàn toàn mới, với số liệu đã được sửa đúng, đại diện cho một giao dịch tài chính thực sự khác. Có 2 khả năng về mức độ nghiêm trọng: Khả năng A — nếu "tái sử dụng mã" chỉ là cách diễn đạt cho việc counter sinh mã tự động tình cờ ra lại đúng số cũ (xác suất thấp, không phải chủ đích thiết kế) thì đây chỉ là edge case hiếm; Khả năng B — nếu đây là quyết định nghiệp vụ có chủ đích (đúng như câu chữ EC-3 khẳng định) để tránh việc số phiếu bị "nhảy cóc" gây khó hiểu cho kế toán, thì đây là một xung đột thiết kế trực tiếp giữa 2 quyết định đã chốt riêng biệt (Product chốt EC-3 ngày khởi tạo baseline; Architecture chốt ADR-031 D5 ngày 2026-08-10) mà chưa ai đối chiếu chéo.

### 4. Ảnh hưởng nếu không giải quyết

- Khách hàng Driver Plus sẽ không nhận được chứng từ quyết toán đúng cho lần sửa lỗi, hồ sơ số của xe (`FEAT-DP-046`) sẽ thiếu hoặc giữ nguyên chứng từ CŨ đã sai số liệu (nếu bản ghi cũ chưa bị D+ xóa khi hủy — mà thực tế D+ không có cơ chế xóa vì không có step REVOKED).
- Đây là lỗi âm thầm hoàn toàn phía Driver+ — GMS không có cách nào biết event bị D+ dedupe/bỏ qua (theo chính §6.1 của `INTEG-EXT-driver-plus.md`: "Outbound event không được D+ tiêu thụ — Không phát hiện được từ GMS"), nên vận hành sẽ không bao giờ nhận được cảnh báo để re-queue.
- Kế toán/garage tin rằng nghiệp vụ đã hoàn tất đúng (phiếu quyết toán sửa lỗi đã tạo thành công trên GMS) trong khi phía đối tác Driver+ vẫn giữ dữ liệu tài chính sai — rủi ro tranh chấp công nợ với khách hàng nếu Driver+ dùng dữ liệu đó làm căn cứ.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Product + Architecture xác nhận): làm rõ ngay bản chất "tái sử dụng mã cũ" ở EC-3 — nếu counter sinh mã KHÔNG chủ đích cấp lại đúng số cũ (chỉ là "không giữ chỗ mã của phiếu đã hủy" chứ số mới vẫn tăng dần bình thường) thì rủi ro này không xảy ra trong thực tế và chỉ cần ghi chú làm rõ trong tài liệu để tránh hiểu nhầm. Nếu ngược lại, số bị cấp lại y hệt là chủ đích, cần bổ sung `revision`/version hoặc timestamp tạo phiếu vào công thức `eventId` (ADR-031 D5 đã tự nêu đây là hướng mở rộng hợp lệ: "Nếu nghiệp vụ có case xuất lại phiếu → CR bổ sung `revision` vào khoá") — đây chính là 1 case cụ thể của "case xuất lại phiếu" mà ADR-031 đã lường trước nhưng chưa gắn với EC-3.

### 6. Liên kết với các phát hiện khác

Liên quan trực tiếp tới RR-050 (cùng nhóm vấn đề dedupe theo `eventId` không có `revision`) — cả 2 finding cùng chỉ ra rằng thiết kế `eventId` thuần hàm của mã phiếu chưa tính hết các luồng nghiệp vụ khiến cùng 1 mã phiếu có thể đại diện cho 2 bản ghi khác nhau theo thời gian.

### 7. Câu hỏi cho người dùng

(a) Xác nhận counter sinh mã phiếu quyết toán (`SET-{yyyyMMdd}-{00001}`) không bao giờ cấp lại đúng số của 1 phiếu đã hủy trong cùng ngày — nếu đúng vậy, chỉ cần sửa lại câu chữ EC-3 cho rõ ràng, không cần đổi kiến trúc. (b) Xác nhận counter THỰC SỰ cấp lại đúng số cũ như câu chữ hiện tại — nếu vậy cần bổ sung `revision`/timestamp vào công thức `eventId` theo đúng hướng CR mà ADR-031 D5 đã dự trù, trước khi go-live document sync. (c) Chấp nhận rủi ro này ở mức thấp (vì mã bị hủy hiếm khi được tái sử dụng ngay trong ngày) và chỉ theo dõi qua vận hành, không sửa kiến trúc ở W07.

### 8. Owner

Solution Architect + Backend Lead (boundary `gf-accounting`) — vì cần xác nhận hành vi thực tế của cơ chế sinh mã (`tenant_sequences`, pessimistic lock) đối chiếu với câu chữ Product, và nếu cần sửa thì đây là thay đổi công thức `eventId` thuộc thẩm quyền kiến trúc.

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-044 [Cao] Thiếu phủ — Nhánh Document sync (ADR-031, ngày 2026-08-10/11) chưa từng đi qua cổng Architecture Review mà chính PKG-W07 yêu cầu làm Entry Criteria

### 1. Trích dẫn nguồn

- **File**: [ARCH-REVIEW-W07.md](../../../requirements/gara/wave-07/tracking/ARCH-REVIEW-W07.md#L1-L3)
- **Section**: Tiêu đề + Scope note.
- **Dòng**: 1, 3.
- **Quote nguyên văn**:
  > # ARCH-REVIEW W07 — 2026-08-07
  > Scope note: label "W07" is informal... Review covers exactly the **14 files** changed by commit `eec8ee9` ("add architecture for wave 07").

  Đối chứng — [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L111), §3 Entry Criteria:
  > - [ ] `Tracking/ARCH-REVIEW-W07.md` đang P0=0, P1=0; các P2 cross-reference/frontmatter đã được fix; SA ratify/merge toàn bộ W07 Architecture trước `/wave-start 07`.

### 2. Bối cảnh nghiệp vụ

`ARCH-REVIEW-W07.md` được lập ngày 2026-08-07, rà soát đúng 14 file thay đổi bởi 1 commit duy nhất — nội dung của commit đó, theo Summary, chỉ gồm Partner Link (`FEAT-SYS-DRIVERPLUS-LINK`, ADR-029, ADR-030) và Booking relay (`FEAT-BOOK-DRIVERPLUS-INBOUND/OUTBOUND`). Toàn bộ nội dung Document sync — ADR-031, các thay đổi tại `gf-sales-events.md` §2ter/§3.10/§3.11, `gf-accounting-events.md` §3.3, `gf-accounting-HLD.md` §11bis, `gf-accounting-api.md` §6.5 — chỉ được viết ra bắt đầu từ 2026-08-10, tức 3 ngày SAU khi bản Architecture Review này đã chốt xong và tuyên bố "Ready for SA ratify: true". PKG-W07 tại §3 Entry Criteria lại đưa chính file review này làm điều kiện tiên quyết bắt buộc ("P0=0, P1=0... SA ratify/merge toàn bộ W07 Architecture trước `/wave-start 07`") cho TOÀN BỘ package, mà package này (bản v10, `last_reviewed: 2026-08-12`) đã bao gồm cả Document sync trong phạm vi.

### 3. Vấn đề cụ thể

Nói cách khác: cổng kiểm soát chất lượng kiến trúc (Architecture Review) mà chính PKG-W07 yêu cầu phải PASS trước khi cho phép `/wave-start 07` chưa bao giờ nhìn thấy — và do đó chưa bao giờ áp dụng 13 gate kiểm tra (G1 Frontmatter, G3 12 Critical Rules, G5 Contract-first completeness, G7 ADR numbering, G9 KG consistency, G11 Naming Registry, v.v.) — cho bất kỳ file nào thuộc nhánh Document sync. Toàn bộ những gì RR-041, RR-042, RR-045, RR-047, RR-048, RR-049 trong tài liệu này phát hiện được đều là loại lỗi mà đúng ra 13 gate đó được thiết kế để bắt (VD G7 "ADR cross-ref", G11 "Naming Registry drift", G9 "KG consistency") — nhưng vì file review chưa từng chạy lại cho nhánh này, không có cơ chế nào đã thử bắt chúng trước khi tài liệu này được coi là "sẵn sàng" đưa vào wave.

### 4. Ảnh hưởng nếu không giải quyết

- PKG-W07 v10 (2026-08-12) tuyên bố Document sync đã sẵn sàng cho DEV song song với Partner Link/Booking, nhưng điều kiện Entry Criteria mà chính nó đặt ra (ARCH-REVIEW-W07.md P0=0/P1=0 cho "toàn bộ W07 Architecture") chưa thực sự được thỏa mãn cho phần Document sync — đây là một self-contradiction trong chính bộ tài liệu điều phối wave.
- Các lỗi cascade nhỏ mà RR-041/RR-042/RR-049 phát hiện được (enum sót, bảng tham chiếu sai số step, matrix chưa backfill) rất có thể đã bị 1 vòng Architecture Review thực sự bắt được trước khi DEV bắt đầu, thay vì chỉ lộ ra khi làm Gap Review thủ công như lần này.
- Nếu Delivery Authority tiến hành `/wave-start 07` dựa trên báo cáo "Ready for SA ratify: true" của file cũ mà không nhận ra file đó không hề bao phủ Document sync, rủi ro lan sang cả review chất lượng code khi DEV team `agent-dev-gf-accounting` bắt đầu — không có baseline review để đối chiếu.

### 5. Đề xuất giải quyết

Yêu cầu chạy lại `agent-arch-author`/quy trình Architecture Review cho đúng phạm vi các file bị thay đổi bởi ADR-031 (tối thiểu: `ADR-031-driver-plus-document-sync.md`, `gf-sales-events.md`, `gf-sales-api.md` §5.2bis, `gf-accounting-events.md`, `gf-accounting-api.md` §6.5, `gf-accounting-HLD.md` §11bis, `INTEG-EXT-driver-plus.md` §4.3/§5, `PKG-W07...md` §2.2.3), sinh ra 1 bản review mới (hoặc phụ lục nối vào `ARCH-REVIEW-W07.md` hiện có với ghi chú rõ phạm vi bổ sung + ngày review) trước khi coi Entry Criteria của PKG-W07 là đã thỏa mãn.

### 6. Liên kết với các phát hiện khác

Cùng nhóm nguyên nhân gốc với RR-049 (SERVICE-BOUNDARY-MATRIX.md cũng chưa backfill) — cả 2 là governance artifact bắt buộc theo Entry Criteria của PKG-W07 nhưng chưa được cập nhật cho nhánh mới. RR-044 còn giải thích một phần lý do vì sao RR-041/RR-042 tồn tại: không có review nào bắt các lỗi cascade đó trước khi merge.

### 7. Câu hỏi cho người dùng

(a) Yêu cầu chạy Architecture Review bổ sung cho phạm vi Document sync trước khi cho phép `/wave-start 07`, đúng theo tinh thần Entry Criteria hiện có của PKG-W07. (b) Chấp nhận rủi ro và cho phép DEV bắt đầu song song, coi việc review Document sync là một hoạt động có thể chạy đồng thời (không blocking), miễn accounting team tự kiểm tra kỹ theo checklist 12 Critical Rules trước khi merge code. (c) Sửa lại câu chữ Entry Criteria của PKG-W07 để làm rõ "ARCH-REVIEW-W07.md" ở đây chỉ áp dụng cho phạm vi Partner Link/Booking, còn Document sync có cổng review riêng chưa được định nghĩa — và định nghĩa cổng đó ngay.

### 8. Owner

Solution Architect + Delivery Authority (Solution Architect chịu trách nhiệm chạy/xác nhận Architecture Review; Delivery Authority là owner của PKG-W07 và quyết định có chặn `/wave-start 07` hay không).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-045 [Trung bình] Tuân thủ — Đầu mục compliance/PII "chưa xác định" của Driver+ chỉ được tracked cho dữ liệu Partner Link, không mở rộng cho tệp chứng từ chứa PII nhạy cảm hơn của Document sync

### 1. Trích dẫn nguồn

- **File**: [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L98)
- **Section**: §2.3 Out of Scope / Explicitly Deferred.
- **Dòng**: 98.
- **Quote nguyên văn**:
  > **Compliance/PII disposition với Driver Plus** (CR-20260812-03, backfill gap `GAP-W07-GSY-07`): Provider SLA chưa chính thức, DPA chưa xác nhận ký, data retention phía D+ chưa đặc tả, chưa có right-to-erasure flow (`PARTNER_LINK.DATA.PURGE`) khi Hủy liên kết — 4 hạng mục thuộc phạm vi Legal/BizOps, tracked ngoài W07 exit criteria, không block DEV kỹ thuật.

  Đối chứng — [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L308), §10 PII/Compliance:
  > | PII (chứng từ, ADR-031) | Tệp phiếu dịch vụ / phiếu quyết toán chứa tên khách, biển số, hạng mục sửa chữa, số tiền. Cơ sở pháp lý: cùng consent garage ↔ D+ của luồng booking... URL không log; retention phía D+ là Open Question |

### 2. Bối cảnh nghiệp vụ

Khi khách hàng Nguyễn Văn A đặt lịch sửa xe qua app Driver+, garage hoàn thành phiếu dịch vụ PDV-20260810-00042, hệ thống render 1 file PDF chứa đầy đủ tên khách hàng, biển số xe 51K-123.45, danh sách hạng mục sửa chữa và số tiền, rồi gửi URL tải file đó sang Driver+ qua `DOCUMENT.SERVICE_ORDER.SYNC`. Đây là dữ liệu tài chính + định danh cá nhân đậm đặc hơn nhiều so với dữ liệu "hồ sơ garage" (tên doanh nghiệp, SĐT, địa chỉ, MST) mà luồng Partner Link chia sẻ. ADR-031 đồng thời chốt rằng file này được `ct-file-storage` giữ VĨNH VIỄN, không có lifecycle expiry, không auto-purge (Open Question #5, RESOLVED 2026-08-11).

### 3. Vấn đề cụ thể

PKG-W07 §2.3 liệt kê rất rõ ràng và có trách nhiệm 4 hạng mục compliance còn treo với Driver+ (Provider SLA, DPA, data retention, right-to-erasure) — nhưng toàn bộ 4 hạng mục đó, kể cả tên gọi step tham chiếu `PARTNER_LINK.DATA.PURGE`, đều đóng khung phạm vi là dữ liệu Partner Link (hồ sơ doanh nghiệp garage). Không có mục tương ứng nào cho dữ liệu chứng từ Document sync — dù chính `INTEG-EXT-driver-plus.md` dòng 308 cũng tự thừa nhận "retention phía D+ là Open Question" cho riêng nhóm PII chứng từ này. Có 2 khả năng: Khả năng A — đây là một thiếu sót thực sự, GAP-W07-GSY-07/CR-20260812-03 cần mở rộng phạm vi để bao gồm cả retention/DPA cho tệp chứng từ; Khả năng B — đội ngũ Legal/BizOps coi 2 loại dữ liệu này cùng nằm dưới 1 thỏa thuận DPA tổng thể với Driver+ (chưa ký), nên không cần tách riêng — nhưng nếu vậy, PKG-W07 §2.3 nên nói rõ điều đó thay vì chỉ nhắc tới `PARTNER_LINK.DATA.PURGE`.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu DPA với Driver+ sau này chỉ ký cho phạm vi "hồ sơ doanh nghiệp garage" (đúng như tên step `PARTNER_LINK.DATA.PURGE` gợi ý) mà không bao gồm dữ liệu tài chính + định danh khách hàng trong chứng từ, GMS có thể đang truyền đi và cho phép lưu trữ vĩnh viễn 1 loại dữ liệu ngoài phạm vi thỏa thuận pháp lý đã ký.
- Vì ADR-031 đã chốt lưu trữ VĨNH VIỄN phía `ct-file-storage`, rủi ro compliance này không tự giảm dần theo thời gian như dữ liệu có TTL — nó tích lũy vô hạn cho tới khi có DPA hoặc quyết định retention rõ ràng.
- Khi Legal/BizOps xử lý CR-20260812-03 trong tương lai, nếu không có ai chủ động chỉ ra phạm vi thiếu này, rất có thể họ sẽ ký DPA chỉ cho Partner Link rồi coi compliance Driver+ đã xong, bỏ sót hoàn toàn nhánh Document sync.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Business Authority + Legal xác nhận): mở rộng phạm vi GAP-W07-GSY-07/CR-20260812-03 để minh thị bao gồm cả PII trong tệp chứng từ Document sync (tên khách, biển số, hạng mục sửa chữa, số tiền, lưu trữ vĩnh viễn theo ADR-031), hoặc mở 1 gap/CR riêng nếu Legal muốn tách 2 luồng theo 2 track compliance khác nhau. Ghi rõ trong PKG-W07 §2.3 để nhất quán với ghi nhận đã có tại `INTEG-EXT-driver-plus.md` §10.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Xác nhận DPA đang đàm phán với Driver+ đã bao gồm cả dữ liệu chứng từ (không chỉ hồ sơ garage) — nếu vậy chỉ cần cập nhật lại wording của GAP-W07-GSY-07 cho rõ, không có rủi ro thực tế. (b) Xác nhận DPA hiện tại KHÔNG bao gồm dữ liệu chứng từ — nếu vậy cần Legal đánh giá gấp trước khi cho phép ADR-031 (lưu trữ vĩnh viễn + gửi PII tài chính) go-live production. (c) Chuyển toàn bộ quyết định này cho 1 CR/gap riêng do Legal chủ trì, không block DEV kỹ thuật của W07 (giữ nguyên tinh thần "không block DEV" mà PKG-W07 đã áp dụng cho Partner Link).

### 8. Owner

Legal/Compliance + Business Authority (đây là quyết định phạm vi pháp lý, không phải quyết định kỹ thuật — cần người có thẩm quyền đàm phán DPA với đối tác ngoài xác nhận).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-046 [Cao] Tương tranh — Tài liệu không nói rõ hành vi khi feature flag `Document:DriverPlus` bị tắt trong lúc 1 sự kiện đã nằm sẵn trong outbox ở trạng thái `PENDING`

### 1. Trích dẫn nguồn

- **File**: [ADR-031-driver-plus-document-sync.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-031-driver-plus-document-sync.md#L84-L86)
- **Section**: D7 — Kill-switch riêng.
- **Dòng**: 84-86.
- **Quote nguyên văn**:
  > ### D7 — Kill-switch riêng: feature flag `Document:DriverPlus`
  > Độc lập với `Booking:DriverPlus` / `PartnerLink:DriverPlus`... Default `on` khi release. Tắt → 2 boundary ngừng emit, không ảnh hưởng booking relay.

  Đối chứng — [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L109), §2ter Cutover:
  > **Cutover**: ... Rollback = tắt flag (không rollback state nghiệp vụ đã commit).

### 2. Bối cảnh nghiệp vụ

Hình dung lúc 10:04:55 sáng, chủ garage bấm "Xác nhận" hoàn thành phiếu dịch vụ PDV-20260810-00042 (nguồn booking Driver+). Đúng lúc `Document:DriverPlus` đang bật, `ServiceOrderV3Service` render xong PDF, upload lên `ct-file-storage` thành công, và ghi 1 dòng vào bảng `outbox_event` với trạng thái `PENDING` — TRONG CÙNG TRANSACTION với việc cập nhật trạng thái SO sang "Hoàn thành" (theo đúng ADR-004 outbox pattern mà ADR-031 D4 mô tả). Ngay giây sau, lúc 10:05:00, do một sự cố khác không liên quan (VD Driver+ báo lỗi consumer), vận hành quyết định tắt khẩn cấp `Document:DriverPlus` làm kill-switch. `OutboxProcessor` của `gf-sales` (poll mỗi 10 giây theo `gf-sales-HLD` §6) tới phiên poll tiếp theo lúc 10:05:05 vẫn thấy dòng `PENDING` đó và publish nó lên Kafka như bình thường.

### 3. Vấn đề cụ thể

Câu "Tắt → 2 boundary ngừng emit" (ADR-031 D7) và "Rollback = tắt flag" (§2ter) đọc tự nhiên như một cam kết: bật flag `off` sẽ NGAY LẬP TỨC dừng mọi việc gửi chứng từ, đúng tinh thần "emergency kill-switch". Nhưng toàn bộ mô tả kỹ thuật về `OutboxProcessor` ở cả 2 boundary (poll theo chu kỳ cố định, không có mô tả nào về việc re-check giá trị flag ngay trước khi publish từng dòng) cho thấy hành vi thực tế nhiều khả năng là: flag chỉ được kiểm tra tại thời điểm QUYẾT ĐỊNH CÓ GHI outbox row hay không (lúc SO hoàn thành/phiếu quyết toán được tạo), chứ không được kiểm tra lại ở bước `OutboxProcessor` publish. Có 2 khả năng: Khả năng A — đúng như câu chữ D7 diễn đạt, `OutboxProcessor` có logic riêng để purge/giữ lại các dòng `PENDING` đã tồn tại khi flag tắt (chưa được mô tả ở bất kỳ đâu trong 12 file đã đọc); Khả năng B — flag chỉ chặn việc TẠO MỚI dòng outbox, còn dòng đã ghi trước đó vẫn được publish bình thường ở lần poll kế tiếp, mâu thuẫn trực tiếp với kỳ vọng "emergency kill-switch ngừng emit ngay" mà tên gọi D7 gợi ý.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu vận hành tắt `Document:DriverPlus` với kỳ vọng chặn TOÀN BỘ việc gửi dữ liệu ra ngoài ngay lập tức (VD nghi ngờ có sự cố bảo mật/rò rỉ dữ liệu phía Driver+), nhưng thực tế các dòng `PENDING` đã ghi trước đó vẫn tiếp tục được gửi trong vài giây/phút sau khi tắt flag, đây là 1 khoảng hở bảo mật/vận hành không được tài liệu hóa.
- QA không có đủ đặc tả để viết test case "tắt flag giữa chừng" một cách chính xác — không biết nên assert dòng outbox `PENDING` bị hủy, giữ nguyên chờ mãi mãi, hay vẫn được publish.
- Đội `agent-review-backend` (theo PKG-W07 §4.2, có nhiệm vụ review "ba kill-switch") không có tiêu chí rõ ràng để đánh giá implementation có đúng ý đồ kiến trúc hay không, vì chính ý đồ đó chưa được viết rõ.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Architecture xác nhận): làm rõ trong ADR-031 D7 rằng kill-switch `Document:DriverPlus` chỉ chặn việc GHI MỚI outbox row (tức chặn phát sinh chứng từ mới từ thời điểm tắt trở đi), còn các dòng đã `PENDING` trước đó tiếp tục được gửi theo cơ chế outbox thông thường — đây là hành vi nhất quán và dễ giải thích, phù hợp với triết lý "không rollback state nghiệp vụ đã commit" mà ADR-031 áp dụng xuyên suốt. Nếu nghiệp vụ thực sự cần chặn cả các dòng đã `PENDING` (trường hợp khẩn cấp bảo mật), cần bổ sung 1 bước `OutboxProcessor` re-check flag ngay trước khi publish — đây là thay đổi kiến trúc cần CR riêng.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Xác nhận kill-switch chỉ cần chặn phát sinh MỚI, chấp nhận các dòng đã `PENDING` trước đó vẫn được gửi trong vài giây/phút tiếp theo — đây là hành vi đơn giản, nhất quán với thiết kế outbox hiện có, chỉ cần bổ sung 1 câu làm rõ vào ADR-031. (b) Yêu cầu kill-switch phải chặn TUYỆT ĐỐI kể cả các dòng đã `PENDING`, cần bổ sung logic re-check flag ở `OutboxProcessor` trước khi publish — đây là thay đổi kiến trúc, cần ước lượng lại effort cho `agent-dev-gf-sales`/`agent-dev-gf-accounting`. (c) Không cần làm rõ ở W07, chấp nhận độ trễ tắt flag tối đa bằng 1 chu kỳ poll (10 giây `gf-sales` / 5 giây `gf-accounting`) là đủ nhanh cho mọi tình huống thực tế, chỉ ghi chú rõ con số này vào tài liệu.

### 8. Owner

Solution Architect (vì đây là quyết định về ngữ nghĩa chính xác của "kill-switch" — ranh giới giữa dừng phát sinh mới và dừng hoàn toàn — ảnh hưởng tới cả 2 boundary `gf-sales` và `gf-accounting`).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-047 [Trung bình] Tương tranh — Cặp phiếu quyết toán Khách hàng/Bảo hiểm (AC-4) phát 2 sự kiện với 2 `documentCode` khác nhau nên rơi vào 2 partition khác nhau, không có bảo đảm thứ tự dù chúng tham chiếu chéo qua `relatedSettlementCode`

### 1. Trích dẫn nguồn

- **File**: [ADR-031-driver-plus-document-sync.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-031-driver-plus-document-sync.md#L39)
- **Section**: D2 — Topic mới, và D3 cuối mục.
- **Dòng**: 39, 52.
- **Quote nguyên văn**:
  > Partition key `Document-{documentCode}` (per-aggregate, `_CONVENTIONS.md` §4.1).
  > ... Cặp phiếu quyết toán (`FEAT-STL-CREATE` AC-4) emit **riêng từng phiếu**.

  Đối chứng — [gf-accounting-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-accounting-events.md#L150-L151), §3.3:
  > Cặp phiếu quyết toán (AC-4 — `CUSTOMER` + `INSURANCE`) emit **riêng từng phiếu**, mỗi phiếu 1 event với `documentCode` riêng.

### 2. Bối cảnh nghiệp vụ

Phiếu dịch vụ PDV-20260810-00042 vừa hoàn thành có cả hạng mục khách hàng tự trả và hạng mục bảo hiểm chi trả. Theo BR-STL-CRE-002/AC-4, khi kế toán tạo phiếu quyết toán, hệ thống tự động tạo 1 cặp: phiếu SET-20260810-00013 (loại "Khách hàng") và phiếu SET-20260810-00014 (loại "Bảo hiểm"), liên kết 2 chiều qua trường `relatedSettlementCode`. Theo đúng ví dụ payload trong `gf-accounting-events.md` §3.3, sự kiện của phiếu SET-20260810-00013 mang `relatedSettlementCode: "SET-20260810-00014"` — tức là ngay trong payload, GMS chủ động nói cho Driver+ biết "còn 1 phiếu nữa liên quan tới phiếu này".

### 3. Vấn đề cụ thể

Vì partition key được tính theo `Document-{documentCode}` — tức `Document-SET-20260810-00013` cho phiếu Khách hàng và `Document-SET-20260810-00014` cho phiếu Bảo hiểm — 2 mã khác nhau gần như chắc chắn hash vào 2 partition Kafka khác nhau. So sánh với luồng Booking (`BOOKING.CHANGE.STATUS`, `BOOKING.CANCELLED`...) nơi tài liệu `gf-sales-events.md` §3.9 minh bạch giải thích: "Partition key theo aggregate (`Booking-{bookingCode}`) đảm bảo 2 message cùng booking rơi CÙNG PARTITION → xử lý tuần tự đúng thứ tự producer gửi" — thì ở đây, 2 sự kiện của CÙNG MỘT giao dịch nghiệp vụ (tạo cặp phiếu quyết toán cho 1 SO) lại KHÔNG có cơ chế tương đương để đảm bảo Driver+ xử lý chúng theo bất kỳ thứ tự xác định nào, dù chúng tham chiếu chéo lẫn nhau qua `relatedSettlementCode`. Nếu Driver+ xử lý phiếu Bảo hiểm TRƯỚC phiếu Khách hàng (hoàn toàn có thể xảy ra do khác partition, khác consumer thread), Driver+ sẽ ghi nhận 1 chứng từ có `relatedSettlementCode` trỏ tới 1 mã phiếu (SET-20260810-00013) mà tại thời điểm đó họ CHƯA nhận được — hồ sơ số của xe tạm thời có 1 tham chiếu "treo" (dangling reference).

### 4. Ảnh hưởng nếu không giải quyết

- Nếu Driver+ implement việc xử lý `relatedSettlementCode` bằng cách tra cứu ngay lập tức và fail nếu không tìm thấy (thay vì lưu tạm rồi join sau), họ có thể log lỗi hoặc từ chối ghi nhận chứng từ đến trước, dù về bản chất đây không phải là lỗi từ phía GMS.
- Nếu 1 trong 2 sự kiện của cặp bị lỗi render/upload (theo AC-18, không rollback, chỉ retry ngầm), khoảng thời gian "1 phiếu có mặt, phiếu kia chưa" có thể kéo dài không xác định — hồ sơ số của xe hiển thị chứng từ không đầy đủ cho khách hàng Driver+ trong lúc đó.
- Test case E2E cho "tạo cặp phiếu quyết toán nguồn D+" (theo PKG-W07 §6 Demo Target mục 7: "D+ nhận hai `DOCUMENT.SETTLEMENT.SYNC` riêng") rất dễ chỉ test happy-path (2 message tới gần như đồng thời, thứ tự không quan trọng trong môi trường test có độ trễ thấp) mà bỏ sót đúng kịch bản lệch thứ tự/lệch thời gian này.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Architecture xác nhận): làm rõ trong ADR-031/`gf-accounting-events.md` §3.3 một trong hai hướng — (1) xác nhận Driver+ được kỳ vọng xử lý `relatedSettlementCode` theo kiểu "lazy join" (lưu tạm, không fail nếu chưa thấy, tự join khi cả 2 đã tới) và đây là hợp đồng ngầm cần D+ xác nhận trước cutover; hoặc (2) nếu cần đảm bảo thứ tự, cân nhắc đổi partition key cho riêng luồng SETTLEMENT về theo SO gốc (VD `Document-{serviceOrderCode}`) để cả cặp rơi cùng partition — đánh đổi là các phiếu SETTLEMENT của các SO khác nhau có thể dồn cùng 1 partition nhiều hơn, cần đánh giá lại throughput.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Xác nhận Driver+ xử lý `relatedSettlementCode` theo kiểu không chặn (best-effort join), không cần GMS đảm bảo thứ tự — nếu vậy chỉ cần ghi rõ điều này thành 1 dòng hợp đồng tường minh trong `gf-accounting-events.md` §3.3, không cần đổi kiến trúc. (b) Yêu cầu đảm bảo thứ tự cứng giữa 2 sự kiện của cùng 1 cặp phiếu — cần đổi partition key hoặc thêm cơ chế đồng bộ khác, ước lượng lại effort cho `agent-dev-gf-accounting`. (c) Chuyển câu hỏi này trực tiếp cho đội Driver+ xác nhận hành vi consumer thực tế của họ trước khi GMS quyết định có cần sửa gì hay không.

### 8. Owner

Solution Architect (quyết định partition key ảnh hưởng hợp đồng Kafka dùng chung với `gf-sales`) + Backend Lead boundary `gf-accounting` (người triển khai luồng emit cặp phiếu).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-048 [Thấp] Mơ hồ — Payload mẫu của `DOCUMENT.SETTLEMENT.SYNC` dùng tiền tố mã phiếu "PQT-" thay vì định dạng chuẩn "SET-" đã được BR-STL-CRE-006 chốt

### 1. Trích dẫn nguồn

- **File**: [gf-accounting-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-accounting-events.md#L157-L181)
- **Section**: §3.3 `SettlementDocumentSync` — Payload ví dụ.
- **Dòng**: 165, 167, 169.
- **Quote nguyên văn**:
  > "documentCode": "PQT-20260810-00013",
  > "settlementCode": "PQT-20260810-00013",
  > "relatedSettlementCode": "PQT-20260810-00014",

  Đối chứng — [FEAT-STL-CREATE.md](../../../requirements/gara/wave-07/Product/features/FEAT-STL-CREATE.md#L160), BR-STL-CRE-006:
  > **BR-STL-CRE-006**: Mã phiếu quyết toán được hệ thống tự sinh theo định dạng SET-yyyyMMdd-00001, không cho phép nhập thủ công.

  Đối chứng thêm — [gf-accounting-api.md](../../../requirements/gara/wave-07/Architecture/api/gf-accounting-api.md#L114), ví dụ response `POST .../settlements`:
  > "code": "SET-20260506-00001",

### 2. Bối cảnh nghiệp vụ

Toàn bộ tài liệu — từ BR-STL-CRE-006, ví dụ response API tạo phiếu quyết toán (`SET-20260506-00001`), cho tới ví dụ endpoint GET chi tiết settlement (`SET-20260506-00001`) — đều thống nhất mã phiếu quyết toán mang tiền tố "SET-". Nhưng riêng đoạn payload mẫu minh họa cho sự kiện `DOCUMENT.SETTLEMENT.SYNC` gửi sang Driver+ tại §3.3 lại dùng "PQT-20260810-00013" (PQT — có thể là viết tắt "Phiếu Quyết Toán") cho cả 3 trường `documentCode`, `settlementCode` và `relatedSettlementCode`. Trong khi đó, cùng đoạn payload đó, trường `serviceOrderCode` lại dùng đúng tiền tố chuẩn "PDV-20260810-00042" khớp với BR-SO-001.

### 3. Vấn đề cụ thể

Đây thuần túy là lỗi soạn ví dụ (không phải mâu thuẫn business rule — BR-STL-CRE-006 vẫn là nguồn đúng), nhưng vì đây là payload mẫu duy nhất minh họa hợp đồng Kafka thực tế cho `DOCUMENT.SETTLEMENT.SYNC`, nó có nguy cơ được copy nguyên văn làm fixture cho test tự động hoặc làm mock data cho Driver+ sandbox.

### 4. Ảnh hưởng nếu không giải quyết

- `agent-test-api` (theo PKG-W07 §4.3) khi soạn test case cho "document payload URL/checksum/expiry" có thể copy nguyên ví dụ này làm test fixture, vô tình khẳng định sai định dạng mã phiếu trong bộ test tự động.
- Nếu đội Driver+ dùng chính ví dụ JSON này làm tài liệu tham chiếu khi build handler phía họ (rất phổ biến khi đọc spec kiểu "xem ví dụ payload"), họ có thể viết regex/validate parse sai định dạng mã phiếu thực tế sẽ nhận được.

### 5. Đề xuất giải quyết

Sửa 3 giá trị "PQT-20260810-00013"/"PQT-20260810-00014" trong ví dụ thành đúng định dạng "SET-20260810-00013"/"SET-20260810-00014" để nhất quán với BR-STL-CRE-006 và các ví dụ khác trong `gf-accounting-api.md`.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Xác nhận đây là lỗi soạn ví dụ đơn thuần, sửa trực tiếp theo đề xuất mà không cần thảo luận thêm. (b) Giữ nguyên vì có lý do khác chưa được nêu (VD "PQT" là 1 định danh nội bộ khác song song với "SET", cần làm rõ nếu vậy 2 định danh này quan hệ với nhau thế nào).

### 8. Owner

Backend Lead (boundary `gf-accounting`) — sửa trực tiếp trong lần cập nhật tài liệu tiếp theo, không cần leo thang quyết định.

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-049 [Trung bình] Thiếu phủ — `SERVICE-BOUNDARY-MATRIX.md` chưa được backfill cho Document sync dù chính PKG-W07 đặt đây là Entry Criteria bắt buộc, và đã bị cảnh báo là gap từ trước cả khi Document sync tồn tại

### 1. Trích dẫn nguồn

- **File**: [SERVICE-BOUNDARY-MATRIX.md](../../../requirements/gara/wave-07/Execution/SERVICE-BOUNDARY-MATRIX.md#L1-L8) và [dòng 104-110](../../../requirements/gara/wave-07/Execution/SERVICE-BOUNDARY-MATRIX.md#L104-L110)
- **Section**: Frontmatter + Change Log.
- **Dòng**: 5-7 (`status: ACTIVE`, `version: 4`), 104-110.
- **Quote nguyên văn**:
  > status: ACTIVE
  > version: 4
  > owner_authority: Delivery Authority + Solution Architect
  > last_updated: "2026-06-04"
  > ...
  > | 2026-06-04 | 4 | Mobile (garage-mobile) | §1.1: loại `test/**` khỏi owned_paths của `garage-mobile`... |

  Đối chứng 1 — [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L116), §3 Entry Criteria:
  > - [ ] KG update scope `gf-system` + `gf-sales` + `gf-accounting` được tạo trước DEV; `SERVICE-BOUNDARY-MATRIX` module Partner Link/document sync được backfill theo governance.

  Đối chứng 2 — [ARCH-REVIEW-W07.md](../../../requirements/gara/wave-07/tracking/ARCH-REVIEW-W07.md#L45), mục quan sát trước đó (2026-08-07):
  > `Execution/SERVICE-BOUNDARY-MATRIX.md` row 2 (`gf-system`) "Modules" column doesn't yet list "Partner Link" — matrix file wasn't in this commit's scope; likely expected to be updated separately.

### 2. Bối cảnh nghiệp vụ

`SERVICE-BOUNDARY-MATRIX.md` là bảng phân định "ai được sửa file nào" cho từng boundary — dòng thứ 9 của bảng ghi module của `gf-accounting` là "Settlement record, settlement-document sync, tenant-sequence, outbox/inbox, settlement-print" và cột Forbidden Scope liệt kê các quy tắc cấm cụ thể (VD "không call gf-sales không snapshot", "không cancel single settlement cặp CUSTOMER+INSURANCE"). File này có `last_updated: "2026-06-04"`, phiên bản 4 — nghĩa là 2 tháng trước khi ADR-031/Document sync Driver+ thậm chí được nghĩ tới (ADR-031 khởi tạo 2026-08-10).

### 3. Vấn đề cụ thể

Ngay từ vòng Architecture Review ngày 2026-08-07 cho Partner Link/Booking, agent review đã tự phát hiện và ghi chú rằng file matrix này CHƯA được cập nhật cho nhánh Driver+ nói chung ("row 2 gf-system Modules column doesn't yet list Partner Link"). Đến ngày 2026-08-12 (`last_reviewed` của PKG-W07 v10), sau khi cả Booking relay VÀ Document sync đã được đưa vào scope, PKG-W07 tự đặt ra yêu cầu Entry Criteria minh thị: "SERVICE-BOUNDARY-MATRIX module Partner Link/document sync được backfill theo governance" — nhưng file thực tế vẫn đứng nguyên ở version 4, `last_updated: 2026-06-04`, không có bất kỳ dòng Change Log nào phản ánh việc backfill này đã xảy ra. Cột "Forbidden Scope" của dòng `gf-accounting` cũng chưa hề chứa quy tắc mới quan trọng nhất mà ADR-031 vừa thiết lập: "không đọc DB `gf-sales` để xác định nguồn Driver+" (Critical Rule #1, nhắc lại nhiều lần trong `gf-accounting-events.md` §5 Forbidden patterns).

### 4. Ảnh hưởng nếu không giải quyết

- `check-boundary.sh` — hook thực thi tự động theo chính tài liệu này mô tả ("Runtime: `/dev-start <boundary>` set `STATE.json.owned_paths` dựa trên bảng này") — sẽ không có bất kỳ ràng buộc máy-kiểm-tra-được nào ngăn `agent-dev-gf-accounting` vô tình vi phạm quy tắc "không đọc DB gf-sales", vì quy tắc đó chưa nằm trong Forbidden Scope mà hook đối chiếu.
- PKG-W07 tự tuyên bố 1 điều kiện Entry Criteria (backfill matrix) mà không có bằng chứng nào cho thấy điều kiện đó đã được thỏa mãn — tương tự self-contradiction đã nêu ở RR-044, nhưng cho 1 artifact khác.
- Vì đây đã là gap được cảnh báo TỪ TRƯỚC (2026-08-07, trước cả khi Document sync tồn tại) mà vẫn chưa được xử lý sau thêm 5 ngày và 1 nhánh nghiệp vụ mới được thêm vào, có dấu hiệu cho thấy quy trình backfill matrix không có cơ chế theo dõi chủ động (không giống các gap khác trong wave này như GAP-W07-GSL-02/03/05 đều có cross-ref rõ ràng và được đóng đúng hạn).

### 5. Đề xuất giải quyết

Backfill `SERVICE-BOUNDARY-MATRIX.md`: (1) dòng `gf-sales`/`gf-accounting` cột Modules bổ sung "document sync Driver+ (DOCUMENT.SERVICE_ORDER.SYNC / DOCUMENT.SETTLEMENT.SYNC)"; (2) cột Forbidden Scope bổ sung quy tắc "không đọc DB gf-sales để xác định nguồn Driver+ — phải qua snapshot REST for-settlement" cho dòng `gf-accounting`; (3) dòng `gf-system` cột Modules bổ sung "Partner Link" như đã được cảnh báo từ 2026-08-07; (4) thêm 1 dòng Change Log version 5 ghi rõ đây là backfill theo yêu cầu Entry Criteria PKG-W07.

### 6. Liên kết với các phát hiện khác

Cùng nhóm nguyên nhân gốc với RR-044 — cả 2 là governance artifact bắt buộc theo Entry Criteria PKG-W07 nhưng chưa được cập nhật cho nhánh Document sync.

### 7. Câu hỏi cho người dùng

(a) Yêu cầu backfill `SERVICE-BOUNDARY-MATRIX.md` ngay theo đề xuất mục 5 trước khi coi Entry Criteria PKG-W07 đã thỏa mãn. (b) Xác nhận việc backfill này đã được thực hiện ở 1 nơi khác chưa được đưa vào phạm vi đọc của Gap Review lần này (VD 1 file nháp/CR riêng chưa merge) — nếu vậy chỉ cần trỏ tới đúng vị trí đó. (c) Hạ mức ưu tiên, chấp nhận backfill matrix làm việc song song trong lúc DEV chạy, không coi là blocking cho `/wave-start 07`.

### 8. Owner

Delivery Authority + Solution Architect (đồng sở hữu file này theo `owner_authority` khai báo ở frontmatter — cần cả 2 vai trò xác nhận nội dung backfill đúng).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-050 [Trung bình] Biên — Cơ chế "re-queue outbox row" để phát lại chứng từ hết hạn có thể phát lại kèm `expiresAt` đã ở trong quá khứ

### 1. Trích dẫn nguồn

- **File**: [ADR-031-driver-plus-document-sync.md](../../../requirements/gara/wave-07/Architecture/decisions/ADR-031-driver-plus-document-sync.md#L72)
- **Section**: D4 — Tệp gửi bằng URL tuyệt đối có hạn.
- **Dòng**: 72.
- **Quote nguyên văn**:
  > **Hết hạn / fetch lỗi**: GMS **không** tự phát lại. Không có kênh REST ngược từ D+... Cách xử lý: vận hành re-queue outbox row (`FAILED`/`SENT` → `PENDING`, runbook `INTEG-EXT-driver-plus.md` §13) để phát lại cùng `event_id`; D+ dedupe theo `event_id` nên phát lại chỉ có tác dụng khi D+ chưa ghi nhận.

### 2. Bối cảnh nghiệp vụ

Giả sử sự kiện `DOCUMENT.SERVICE_ORDER.SYNC` của phiếu PDV-20260810-00042 được phát lúc `occurredAt = 2026-08-10T09:12:00Z`, mang `expiresAt = 2026-09-09T09:12:00Z` (đúng 30 ngày sau, theo ví dụ payload tại `gf-sales-events.md` §3.10). Vì lý do hạ tầng phía Driver+ (server bảo trì, mất kết nối dài ngày), đến ngày 2026-10-05 — tức đã qua mốc `expiresAt` gần 1 tháng — Driver+ báo lại với vận hành GMS rằng họ chưa từng fetch được file này. Theo đúng quy trình đã chốt ở D4, vận hành thực hiện "re-queue outbox row" — chuyển trạng thái dòng đó từ `FAILED` (hoặc `SENT`) về lại `PENDING` để `OutboxProcessor` phát lại, giữ nguyên `event_id` để Driver+ dedupe đúng.

### 3. Vấn đề cụ thể

Thao tác "re-queue" theo đúng nghĩa đen mà D4 mô tả (chuyển trạng thái cột `status` của outbox row) chỉ đổi 1 cột — payload JSON đã persist trong outbox row (bao gồm cả trường `expiresAt = 2026-09-09T09:12:00Z`) không có lý do gì tự thay đổi theo. Kết quả: sự kiện phát lại vào ngày 2026-10-05 sẽ mang đúng `expiresAt` đã trôi qua gần 1 tháng trước đó — một hợp đồng thời hạn tự mâu thuẫn (nói với Driver+ rằng "hạn tải là 2026-09-09" trong khi hôm nay đã là 2026-10-05). Có 2 khả năng: Khả năng A — quy trình vận hành thực tế yêu cầu render lại PDF/tính lại `expiresAt` mới (không chỉ đổi trạng thái) trước khi re-queue, nhưng điều đó không được nêu rõ trong D4 hay bất kỳ tài liệu nào đã đọc; Khả năng B — vận hành chỉ đổi trạng thái đúng như câu chữ, và `expiresAt` cũ vẫn được gửi đi, dựa vào việc file vật lý tại `ct-file-storage` thực ra được lưu VĨNH VIỄN (ADR-031 Open Question #5 RESOLVED) nên `expiresAt` chỉ là "deadline hợp đồng" hình thức chứ không chặn truy cập thật — nhưng nếu vậy, Driver+ hoàn toàn có thể tự ý bỏ qua sự kiện phát lại vì thấy `expiresAt` đã qua, dựa theo đúng logic mà tài liệu D4 đã dạy họ áp dụng ("D+ phải fetch trước mốc đó").

### 4. Ảnh hưởng nếu không giải quyết

- Trường hợp Khả năng B xảy ra trong thực tế, quy trình khắc phục sự cố duy nhất mà GMS có cho việc "D+ fetch lỗi/hết hạn" (chính là re-queue) sẽ không giải quyết được vấn đề — chứng từ vẫn không tới tay Driver+ dù vận hành đã làm đúng runbook.
- Đội vận hành (theo bảng Alerts/Runbook tại `INTEG-EXT-driver-plus.md` §8.4/§13) không có hướng dẫn rõ liệu có cần thao tác bổ sung (render lại, cập nhật `expiresAt`) trước khi re-queue hay không — dễ dẫn tới xử lý sự cố không nhất quán giữa các lần khác nhau tùy người trực.
- QA khi viết test cho kịch bản "re-queue sau khi hết hạn" (nếu có test case này) không có tiêu chí rõ để assert `expiresAt` của lần phát lại nên là giá trị nào.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Architecture + DevOps/SRE xác nhận): làm rõ trong runbook `INTEG-EXT-driver-plus.md` §13 rằng thao tác "re-queue" bắt buộc phải tính lại `expiresAt` mới (= thời điểm re-queue + 30 ngày) trước khi đổi trạng thái `PENDING`, không đơn thuần đổi 1 cột status — vì `event_id` vẫn giữ nguyên (dựa theo mã phiếu, không phụ thuộc `occurredAt`) nên việc cập nhật `expiresAt` không phá vỡ cơ chế dedupe D5. Ghi rõ điều này thành 1 bước tường minh trong quy trình vận hành.

### 6. Liên kết với các phát hiện khác

Cùng nhóm chủ đề dedupe/khóa `eventId` với RR-043 — cả 2 cùng cho thấy công thức `eventId` thuần hàm của mã phiếu (không có `revision`/thời gian) tạo ra các cạnh biên chưa được tính hết khi dữ liệu "phát lại" theo những cách khác với retry kỹ thuật đơn thuần.

### 7. Câu hỏi cho người dùng

(a) Xác nhận runbook re-queue phải luôn tính lại `expiresAt` mới trước khi chuyển `PENDING`, bổ sung thành bước tường minh trong `INTEG-EXT-driver-plus.md` §13. (b) Xác nhận `expiresAt` chỉ mang tính hình thức (vì file lưu vĩnh viễn) nên không cần cập nhật lại, và yêu cầu phía Driver+ xác nhận consumer của họ KHÔNG dùng `expiresAt` đã qua làm điều kiện bỏ qua sự kiện. (c) Coi đây là edge case hiếm (re-queue chỉ xảy ra khi có sự cố dài ngày phía D+) và chấp nhận xử lý thủ công case-by-case, không cần chuẩn hóa vào runbook ở W07.

### 8. Owner

DevOps/SRE Lead (chủ sở hữu runbook vận hành outbox) + Solution Architect (xác nhận việc cập nhật `expiresAt` khi re-queue không phá vỡ hợp đồng dedupe `event_id` đã chốt ở ADR-031 D5).

### 9. Trạng thái

ĐANG MỞ

---

## RR-051 [Trung bình] Thiếu phủ — PKG-W07 Entry Criteria vẫn trích dẫn `INTEG-EXT-driver-plus.md` v5, trong khi file thật đã lên tới version 10 và mở rộng thêm cả nhánh Document sync

### 1. Trích dẫn nguồn

- **File**: [PKG-W07-partner-link-booking-driver-plus.md](../../../requirements/gara/wave-07/PKG-W07-partner-link-booking-driver-plus.md#L112)
- **Section**: §3 Entry Criteria, dòng thứ 2.
- **Dòng**: 112 (PKG); đối chiếu frontmatter [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L4-L9) dòng 4-9.
- **Quote nguyên văn**:
  > "`ADR-029` + `ADR-030` + `ADR-031` ACCEPTED; `INTEG-EXT-driver-plus.md` v5; HLD/API/event của `gf-system`, `gf-sales`, `gf-accounting`; `agg-garage-graph` §3k; INTEG-FE §3.9 và INTEG-MOB §3.6 đã lock." (PKG-W07 §3)
  >
  > "version: 10 ... last_reviewed: '2026-08-12'" (frontmatter `INTEG-EXT-driver-plus.md`)

### 2. Bối cảnh nghiệp vụ

Trước khi cho phép Wave 7 chính thức bắt đầu (`/wave-start 07`), checklist "Entry Criteria" của PKG-W07 yêu cầu người thực thi tự tay xác nhận từng dòng điều kiện đã đủ chưa — trong đó có dòng yêu cầu `INTEG-EXT-driver-plus.md` phải "lock" đúng ở phiên bản 5. Đây là tài liệu hợp đồng tích hợp Driver Plus (transport, topic, schema, retry) — được cả 2 agent gap review nhánh Partner Link và Booking relay xác nhận là nguồn tham chiếu trung tâm cho hàng chục finding khác.

### 3. Vấn đề cụ thể

Bản thân phát hiện này đã từng tồn tại ở lần rà soát trước (2026-08-11, khi đó PKG trích v3 còn file thật là v5) — nhưng thay vì được khép lại, khoảng lệch phiên bản còn NỚI RỘNG THÊM: dòng Entry Criteria vẫn chưa được cập nhật kể từ đó (vẫn ghi "v5"), trong khi bản thân `INTEG-EXT-driver-plus.md` đã trải qua 5 lần sửa nữa để lên tới v10 — trong đó lần sửa gần nhất (v10, changelog dòng 409) chính là lần bổ sung TOÀN BỘ nhánh Document sync (topic mới, 4 step mới, 2 producer mới `gf-sales`+`gf-accounting`). Nói cách khác, dòng checklist Entry Criteria hiện tại không chỉ trỏ sai số phiên bản — nó đang trỏ tới 1 phiên bản file HOÀN TOÀN CHƯA CÓ nhánh Document sync, dù chính PKG-W07 (cùng file) đã liệt kê Document sync là 1 trong 3 nhánh nghiệp vụ chính thức của wave.

### 4. Ảnh hưởng nếu không giải quyết

- Người thực thi checklist trước `/wave-start 07` có thể đối chiếu nhầm nội dung ở v5 (chưa có Document sync) và kết luận sai rằng điều kiện đã đủ, trong khi thực tế còn thiếu toàn bộ phần đặc tả liên quan `gf-accounting`.
- Checklist Entry Criteria mất giá trị làm bằng chứng kiểm soát chất lượng (governance) nếu số phiên bản trích dẫn không còn phản ánh đúng nội dung cần khoá.
- Rủi ro lặp lại: nếu không sửa cơ chế (chỉ sửa số phiên bản 1 lần), khoảng lệch sẽ tiếp tục nới rộng ở mỗi lần `INTEG-EXT-driver-plus.md` được cập nhật tiếp theo.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Solution Architect xác nhận): cập nhật dòng Entry Criteria thành đúng "v10" tại thời điểm hiện tại, đồng thời cân nhắc đổi cách trích dẫn từ số version cứng sang điều kiện định tính bền vững hơn (VD "đã lock, không còn thay đổi trong 48h gần nhất") để tránh lặp lại đúng loại lỗi này ở các đợt cập nhật sau.

### 6. Liên kết với các phát hiện khác

Cùng nhóm "tài liệu quản trị/citation lỗi thời" với RR-044 và RR-049 (Document sync chưa qua Architecture Review / SERVICE-BOUNDARY-MATRIX chưa backfill) — cả 3 đều phản ánh việc nhánh Document sync được thêm vào rất nhanh (trong vài ngày) nhưng các bước quản trị/đối chiếu chéo chưa theo kịp.

### 7. Câu hỏi cho người dùng

(a) Cập nhật ngay dòng Entry Criteria lên đúng "v10" và bổ sung xác nhận riêng cho phần Document sync mới thêm. (b) Giữ nguyên "v5" nếu đây là chủ đích (VD phần Document sync được coi là điều kiện khác, tách riêng) — cần nêu rõ lý do nếu chọn phương án này.

### 8. Owner

Solution Architect (chủ sở hữu `INTEG-EXT-driver-plus.md` và PKG-W07 Entry Criteria, người duy nhất có đủ thẩm quyền xác nhận version nào là "đã lock").

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-052 [Trung bình] Thiếu phủ — Chưa có schema registry cho hợp đồng dữ liệu 2 chiều với Driver Plus, contract test hiện dựa hoàn toàn vào fixture thủ công tự tạo, không tự động phát hiện khi payload thật của đối tác lệch khỏi tài liệu

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L337)
- **Section**: Bảng kiểm thử tích hợp (dòng "Contract test").
- **Dòng**: 337; đối chiếu changelog v1 dòng 411 ("Flag ... gap schema registry cho contract test vào Open Questions của wave").
- **Quote nguyên văn**:
  > "Contract test | So sánh payload sample trong `gf-system-events.md` §3.11–§3.14 / `gf-sales-events.md` §3.8/§3.9 với fixture do Driver Plus cung cấp. **Chưa có schema registry** — contract test dựa trên fixture thủ công (Open Question)"

### 2. Bối cảnh nghiệp vụ

Toàn bộ tích hợp Driver Plus — cả 3 nhánh Partner Link, Booking relay, Document sync — đều dựa trên giả định rằng payload JSON thật mà Driver Plus gửi/nhận sẽ khớp đúng với các bảng field được đặc tả trong `gf-system-events.md`/`gf-sales-events.md`/`gf-accounting-events.md`. Cách duy nhất để verify giả định này trước khi lên production là so sánh thủ công 1 file fixture mẫu (do Driver Plus tự cung cấp, không có cơ chế kiểm soát tự động) với đúng những gì tài liệu mô tả.

### 3. Vấn đề cụ thể

Đây là 1 Open Question đã được chính Architecture Authority tự ghi nhận từ v1 (2026-08-05) của file này và vẫn còn nguyên tới v10 (2026-08-12) — nghĩa là sau 5 lần chỉnh sửa lớn (bao gồm cả lần thêm hẳn 1 nhánh nghiệp vụ Document sync), khoảng trống "không có schema registry" chưa từng được khép lại. Vì fixture là thủ công và không có cơ chế đồng bộ tự động, có 2 rủi ro độc lập: (a) fixture do team tự tạo có thể không phản ánh đúng payload thật D+ đang gửi trong môi trường thật, khiến contract test PASS giả; (b) khi Driver Plus tự ý thay đổi payload phía họ (ngoài tầm kiểm soát của GMS), không có cơ chế tự động nào phát hiện được sai lệch cho tới khi lỗi xảy ra ở production.

### 4. Ảnh hưởng nếu không giải quyết

- Contract test có thể tạo cảm giác an toàn giả (false confidence) vì luôn PASS với fixture tĩnh, ngay cả khi payload thật của Driver Plus đã trôi dạt so với tài liệu.
- Khi có bug production do lệch payload, đội vận hành sẽ mất nhiều thời gian hơn để xác định nguyên nhân gốc vì không có bằng chứng schema chính thức nào để đối chiếu ngay.
- Không có cách nào tự động hoá việc mở rộng contract test khi thêm domain mới (Document sync vừa là ví dụ thực tế — 2 event mới `DOCUMENT.SERVICE_ORDER.SYNC`/`DOCUMENT.SETTLEMENT.SYNC` cũng sẽ đi theo đúng con đường "fixture thủ công" này).

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Solution Architect + Backend Lead xác nhận): đánh giá đưa 1 giải pháp schema registry nhẹ (VD JSON Schema versioned trong repo, validate tự động ở cả 2 đầu producer/consumer khi build) vào roadmap kỹ thuật sau W07 — không nhất thiết phải chặn W07 vì đây đã là rủi ro được chấp nhận có ý thức từ đầu, nhưng nên có 1 mốc thời gian cụ thể để xử lý thay vì để mãi ở trạng thái "Open Question".

### 6. Liên kết với các phát hiện khác

Không có liên kết trực tiếp với finding khác trong tài liệu này, nhưng cùng bản chất "rủi ro tích lũy theo thời gian" với RR-051 (version drift) — cả 2 đều là nợ kỹ thuật về quản lý hợp đồng tích hợp chưa được đóng qua nhiều lần cập nhật liên tiếp.

### 7. Câu hỏi cho người dùng

(a) Chấp nhận giữ nguyên contract test thủ công cho hết W07, đưa schema registry vào backlog kỹ thuật với mốc thời gian cụ thể sau go-live. (b) Ưu tiên làm schema registry ngay trong W07 trước khi triển khai nhánh Document sync (nhánh mới nhất, rủi ro payload trôi dạt cao nhất vì chưa qua thực chiến). (c) Giữ nguyên vô thời hạn, chấp nhận đây là rủi ro vận hành lâu dài không cần lộ trình đóng.

### 8. Owner

Solution Architect + Backend Lead (Solution Architect vì đây là quyết định đầu tư hạ tầng kiểm thử tích hợp; Backend Lead vì trực tiếp chịu ảnh hưởng khi contract drift xảy ra ở production).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-053 [Thấp] Mơ hồ — Trường `eventVersion` trong envelope Kafka dùng 2 định dạng chuỗi khác nhau ngay trong cùng 1 file (`"v1"` ở envelope mẫu tổng quát, `"1.0"`/`"2.0"` ở các ví dụ event cụ thể), và không có rule nào định nghĩa hành vi khi consumer nhận `eventVersion` khác giá trị đang hỗ trợ

### 1. Trích dẫn nguồn

- **File**: [gf-system-events.md](../../../requirements/gara/wave-07/Architecture/events/gf-system-events.md#L244)
- **Section**: Envelope mẫu tổng quát (đầu file) so với các ví dụ payload cụ thể (VD `PartnerLinkRequestCreate` §3.11, `PartnerLinkRequestResponse` §3.11).
- **Dòng**: 244 (`"eventVersion": "v1"`, envelope mẫu tổng quát) so với 457 (`"eventVersion": "2.0"`) và 519 (`"eventVersion": "1.0"`).
- **Quote nguyên văn**:
  > `"eventVersion": "v1",` (envelope mẫu tổng quát, dòng 244)
  >
  > `"eventVersion": "2.0",` (ví dụ `PartnerLinkRequestCreate`, dòng 457)
  >
  > `"eventVersion": "1.0",` (ví dụ `PartnerLinkRequestResponse`, dòng 519)

### 2. Bối cảnh nghiệp vụ

Mọi event Kafka trao đổi giữa GMS và Driver Plus (dù thuộc nhánh Partner Link, Booking hay Document sync) đều bọc trong 1 envelope chung có field `eventVersion` để đánh dấu phiên bản schema của event đó — mục đích là để consumer biết cách parse đúng khi schema đổi qua thời gian. Dev khi implement adapter thường tra cứu đúng 1 chỗ: envelope mẫu tổng quát ở đầu file `gf-system-events.md` để hiểu format chuẩn của field này trước khi viết code cho từng event cụ thể.

### 3. Vấn đề cụ thể

Envelope mẫu tổng quát (dòng 244) dùng định dạng `"v1"` (tiền tố chữ "v" + số nguyên), trong khi mọi ví dụ event cụ thể trong cùng file lại dùng định dạng số thập phân kiểu semver (`"1.0"`, `"2.0"`) — 2 quy ước khác nhau cho cùng 1 field, ngay trong cùng 1 tài liệu. Nếu dev implement đúng theo envelope mẫu (định dạng "v1") nhưng test lại đối chiếu với ví dụ event cụ thể (định dạng "1.0"), string so sánh sẽ luôn lệch dù về mặt ý nghĩa nghiệp vụ đang cùng chỉ 1 phiên bản. Ngoài ra, không có bất kỳ đoạn nào trong toàn bộ 3 file event (`gf-system-events.md`, `gf-sales-events.md`, `gf-accounting-events.md`) định nghĩa hành vi khi 1 event tới với `eventVersion` khác giá trị hiện tại consumer đang hỗ trợ — ack và bỏ qua, reject cứng, hay cố parse theo best-effort.

### 4. Ảnh hưởng nếu không giải quyết

- Dev có thể implement sai định dạng field `eventVersion` ở service mới (VD nếu sau này thêm domain thứ 4) do làm theo đúng envelope mẫu thay vì theo các ví dụ thực tế đã dùng.
- QA không có oracle rõ ràng để viết test case "envelope version mismatch" — không biết kỳ vọng consumer sẽ ack-and-skip, reject, hay throw lỗi khi gặp version lạ.
- Khi Driver Plus (đối tác ngoài, ngoài tầm kiểm soát version của GMS) tự ý tăng version schema phía họ trong tương lai, GMS không có hành vi phòng vệ nào được đặc tả trước — rủi ro parse sai âm thầm thay vì fail rõ ràng.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Solution Architect xác nhận): (1) chuẩn hoá envelope mẫu tổng quát về đúng định dạng `"1.0"` (khớp với toàn bộ ví dụ thực tế đang dùng trong cả 3 file event), sửa lại dòng 244; (2) bổ sung 1 rule tường minh trong `_CONVENTIONS.md` hoặc ADR-029 về hành vi consumer khi gặp `eventVersion` không khớp — tối thiểu nên là "reject có kiểm soát + log cảnh báo", nhất quán với nguyên tắc "KHÔNG side-effect im lặng" đã áp dụng cho case lệch `OriginTenantId`.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Chuẩn hoá envelope mẫu về "1.0" và bổ sung rule reject-có-kiểm-soát khi version không khớp, áp dụng thống nhất cho cả 3 file event. (b) Giữ nguyên hiện trạng, chấp nhận đây chỉ là lỗi trình bày tài liệu không ảnh hưởng thực thi (vì dev thực tế sẽ nhìn theo ví dụ cụ thể chứ không theo envelope mẫu) — nhưng vẫn cần quyết định tường minh về hành vi khi version mismatch xảy ra.

### 8. Owner

Solution Architect (sở hữu convention envelope Kafka dùng chung cho toàn bộ 3 boundary).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-054 [Trung bình] Thiếu phủ — Không có cơ chế phát hiện khi Driver Plus ngừng hẳn việc gửi message inbound (producer-side silence) — metric hiện có chỉ đo được độ trễ xử lý, không đo được tình trạng "không có gì để xử lý"

### 1. Trích dẫn nguồn

- **File**: [INTEG-EXT-driver-plus.md](../../../requirements/gara/wave-07/Architecture/integrations/INTEG-EXT-driver-plus.md#L260)
- **Section**: Bảng Metrics (§8.1) và bảng Alerts.
- **Dòng**: 260 (metric `integration.driver_plus.inbound.lag`), 285 (alert "Consumer lag inbound").
- **Quote nguyên văn**:
  > `integration.driver_plus.inbound.lag | gauge | boundary, topic, partition` (dòng 260)
  >
  > `Consumer lag inbound | > 5 phút | P2 | boundary owner (gf-system / gf-sales)` (dòng 285)

### 2. Bối cảnh nghiệp vụ

Toàn bộ luồng inbound (Driver Plus → GMS, cả 3 nhánh) được giám sát bằng đúng 1 loại metric: "consumer lag" — tức khoảng cách giữa offset mới nhất trong topic Kafka và offset consumer đã xử lý tới. Cơ chế này hoạt động tốt khi Driver Plus vẫn đang gửi message đều đặn nhưng GMS xử lý chậm lại (lag tăng dần, alert bắn ở ngưỡng >5 phút).

### 3. Vấn đề cụ thể

Consumer lag chỉ đo được "còn bao nhiêu message CHƯA xử lý" — nếu Driver Plus dừng hẳn việc publish message (ví dụ do lỗi hệ thống phía đối tác, hoặc credential/ACL bị thu hồi nhầm), sẽ không có message mới nào vào topic, khiến lag luôn bằng 0 (không tăng) dù thực chất tích hợp đã "chết lâm sàng". Không có bảng metric hay alert nào trong toàn bộ `INTEG-EXT-driver-plus.md` đo lường "khoảng thời gian kể từ message inbound cuối cùng nhận được" — đây là 1 khía cạnh giám sát khác hẳn về bản chất so với consumer lag, và hiện đang hoàn toàn vắng mặt cho cả 3 nhánh Partner Link/Booking/Document sync.

### 4. Ảnh hưởng nếu không giải quyết

- Nếu Driver Plus ngừng gửi request liên kết/booking/chứng từ hoàn toàn trong nhiều ngày do sự cố phía họ, đội vận hành GMS sẽ không nhận được bất kỳ tín hiệu cảnh báo nào — chỉ phát hiện được khi garage/khách hàng chủ động khiếu nại vì không thấy dữ liệu cập nhật.
- Không có oracle rõ ràng để QA thiết kế test case cho kịch bản "đối tác ngừng gửi hoàn toàn" — hiện chỉ có thể test kịch bản "gửi chậm/dồn ứ" (khớp với alert lag đã có).

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần DevOps/SRE Lead + Solution Architect xác nhận): bổ sung 1 metric dạng "thời gian kể từ message inbound cuối cùng theo từng topic" (VD `integration.driver_plus.inbound.last_message_age`), kèm alert khi vượt ngưỡng kỳ vọng theo pattern lưu lượng thực tế (VD >24h không có bất kỳ message inbound nào trên 1 topic đang hoạt động — cần baseline dữ liệu thật để chốt ngưỡng chính xác).

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này.

### 7. Câu hỏi cho người dùng

(a) Bổ sung metric + alert riêng cho "producer silence" như đề xuất, cần DevOps/SRE Lead xác định ngưỡng cụ thể dựa trên baseline lưu lượng thực tế dự kiến. (b) Chấp nhận rủi ro này ở W07, coi đây là gap vận hành sẽ xử lý sau go-live khi đã có dữ liệu lưu lượng thật để định ngưỡng hợp lý hơn.

### 8. Owner

DevOps/SRE Lead + Solution Architect (DevOps/SRE Lead vì đây là thiết kế alerting vận hành; Solution Architect vì cần xác nhận không phá vỡ nguyên tắc giám sát hiện có).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-055 [Thấp] Mơ hồ — Success Metric #3 của EP-PARTNER-LINK đo tỷ lệ "Từ chối có nhập lý do" nhưng mẫu số "tổng Từ chối" nhiều khả năng gộp cả case Từ chối tự động (cascade khi Duyệt 1 request khác) — vốn không có và không cần trường lý do

### 1. Trích dẫn nguồn

- **File**: [EP-PARTNER-LINK.md](../../../requirements/gara/wave-07/Product/epics/EP-PARTNER-LINK.md#L144)
- **Section**: §6 Success Metric, dòng metric thứ 3.
- **Dòng**: 144.
- **Quote nguyên văn**:
  > "Tỷ lệ yêu cầu bị Từ chối có nhập lý do (không rỗng) | >= 95% | Số LKD Từ chối có lý do / tổng Từ chối (đo consistency thao tác — v13, BA-review round 2 N8: bỏ ngưỡng '≥10 ký tự' vì BR-DPL-REJ-002 chỉ chặn khi rỗng, không enforce độ dài tối thiểu, nên metric cũ không đo được)"

### 2. Bối cảnh nghiệp vụ

Hệ thống có 2 con đường hoàn toàn khác nhau khiến 1 yêu cầu liên kết chuyển sang trạng thái "Từ chối": (a) nhân viên garage chủ động bấm "Từ chối" và bắt buộc gõ lý do (BR-DPL-REJ-002); (b) hệ thống tự động cascade-reject mọi request "Chờ liên kết" còn lại của cùng garage ngay khi 1 request khác được Duyệt (BR-DPL-APV-004) — trường hợp này không có màn hình nhập liệu, không có ai gõ "lý do" vì đây là hành vi hệ thống, không phải thao tác người dùng.

### 3. Vấn đề cụ thể

Công thức đo lường ở §6 chỉ ghi "Số LKD Từ chối có lý do / tổng Từ chối" — không nói rõ "tổng Từ chối" có loại trừ các bản ghi Từ chối do cascade tự động hay không. Nếu mẫu số gộp cả 2 loại, mọi bản ghi cascade-reject (không có lý do, đúng theo thiết kế) sẽ tự động kéo tỷ lệ đo xuống thấp hơn thực tế thao tác thủ công thật sự đạt được — khiến chỉ số ">=95%" có thể không bao giờ đạt được dù nhân viên luôn nhập đầy đủ lý do ở mọi lần Từ chối chủ động, chỉ vì mẫu số bị "pha loãng" bởi các bản ghi mà bản chất không nên được tính vào cùng phép đo "consistency thao tác" (vốn chỉ có ý nghĩa với hành vi CON NGƯỜI, không phải hành vi hệ thống tự động).

### 4. Ảnh hưởng nếu không giải quyết

- Chỉ số báo cáo cho Business Authority có thể phản ánh sai thực trạng vận hành thật — hiển thị "kém" dù đội ngũ vận hành đang tuân thủ tốt.
- Nếu dùng chỉ số này để đánh giá hiệu suất/tuân thủ của nhân viên garage, kết luận rút ra có thể sai lệch và không công bằng.
- Không rõ nên viết TC đo lường theo công thức nào — bao gồm hay loại trừ cascade-reject — dẫn tới rủi ro 2 người viết TC cho cùng 1 metric ra 2 kết quả khác nhau.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Business Authority xác nhận): làm rõ tường minh công thức thành "Số LKD Từ chối THỦ CÔNG có lý do / tổng LKD Từ chối THỦ CÔNG (loại trừ cascade tự động)" — vì bản chất metric này vốn dùng để đo "consistency thao tác" con người, cascade tự động không thuộc phạm vi đo lường đó.

### 6. Liên kết với các phát hiện khác

Không có liên kết với finding khác trong tài liệu này — đây là điểm chưa được làm rõ dù đã qua 1 lần sửa metric này ở v13 (chỉ sửa phần ngưỡng "≥10 ký tự", chưa đụng tới phần định nghĩa mẫu số).

### 7. Câu hỏi cho người dùng

(a) Làm rõ mẫu số CHỈ tính Từ chối thủ công, loại trừ cascade tự động, khớp đúng ý nghĩa "consistency thao tác". (b) Xác nhận mẫu số CÓ CHỦ ĐÍCH gộp cả 2 loại (nếu mục tiêu thật là đo tỷ lệ có-lý-do trên tổng số bản ghi Từ chối bất kể nguồn gốc) — khi đó cần điều chỉnh lại target ">=95%" cho thực tế hơn vì sẽ không bao giờ đạt 100% do cascade luôn thiếu lý do.

### 8. Owner

Business Authority (chủ sở hữu Success Metric của epic, người duy nhất có thẩm quyền định nghĩa lại phạm vi đo lường).

### 9. Trạng thái

ĐANG MỞ

---

---

## RR-056 [Thấp] Thiếu phủ — Cả 3 Success Metric của EP-PARTNER-LINK chỉ có công thức tính trên giấy, chưa có AC hay cơ chế kỹ thuật nào định nghĩa ai tính, tính bằng công cụ gì, và báo cáo ở đâu sau go-live

### 1. Trích dẫn nguồn

- **File**: [EP-PARTNER-LINK.md](../../../requirements/gara/wave-07/Product/epics/EP-PARTNER-LINK.md#L140-L144)
- **Section**: §6 Success Metric (toàn bộ bảng 3 dòng).
- **Dòng**: 140-144.
- **Quote nguyên văn**:
  > "| Metric | Target | Measurement |" ... 3 dòng liệt kê công thức tính, không có cột "Nguồn dữ liệu/Công cụ/Tần suất báo cáo".

### 2. Bối cảnh nghiệp vụ

§6 của epic định nghĩa 3 chỉ số thành công cho toàn bộ Partner Link (tỷ lệ xử lý trong 24h, tỷ lệ garage có liên kết active, tỷ lệ Từ chối có lý do) — đây là những con số Business Authority sẽ dùng để đánh giá epic có đạt mục tiêu đề ra sau khi go-live hay không.

### 3. Vấn đề cụ thể

Toàn bộ 43 AC của `FEAT-SYS-DRIVERPLUS-LINK` tập trung vào hành vi chức năng (Duyệt/Từ chối/Đồng bộ/Hủy, race condition, notification...) — rà soát không thấy bất kỳ AC nào yêu cầu xây dựng dashboard, query báo cáo định kỳ, hay export dữ liệu phục vụ tính toán 3 Success Metric này. Về lý thuyết, cả 3 chỉ số đều CÓ THỂ tính được bằng cách query trực tiếp DB `partner_link_request`/`tenant_profile` — nhưng tài liệu không xác nhận đây có phải là cách làm dự kiến, ai (BA tự query, hay có dashboard tự động), và tần suất báo cáo (hàng ngày/tuần/tháng).

### 4. Ảnh hưởng nếu không giải quyết

- Sau go-live, không ai chịu trách nhiệm rõ ràng cho việc tính và báo cáo 3 chỉ số này — có thể bị bỏ quên hoàn toàn cho tới khi có ai đó chủ động hỏi.
- Nếu phải query trực tiếp DB production để tính chỉ số, cần xác nhận trước về quyền truy cập và ảnh hưởng hiệu năng — hiện chưa có ai đánh giá việc này.
- Không có AC nào để QA verify rằng dữ liệu phục vụ đo lường (VD field lý do Từ chối, trạng thái LKD) được ghi nhận đủ chính xác cho mục đích thống kê, ngoài mục đích vận hành thông thường.

### 5. Đề xuất giải quyết

Đề xuất (giả định, cần Business Authority xác nhận): bổ sung 1 AC hoặc 1 Out-of-Scope tường minh cho việc đo lường Success Metric — nếu quyết định đây không phải việc cần làm trong W07 (chỉ query thủ công khi cần), nên ghi rõ tường minh vào §7 Out of Scope thay vì để mặc định không ai biết trách nhiệm thuộc về đâu.

### 6. Liên kết với các phát hiện khác

Cùng chủ đề đo lường với RR-055 (mẫu số Success Metric #3 mơ hồ) — cả 2 đều liên quan tới §6 Success Metric của epic này.

### 7. Câu hỏi cho người dùng

(a) Xác nhận việc đo lường 3 Success Metric là trách nhiệm thủ công của Business Authority/PM (query DB định kỳ khi cần), không cần dashboard riêng trong W07 — ghi rõ vào Out of Scope. (b) Yêu cầu bổ sung 1 AC/dashboard tối thiểu để tự động hoá việc tính toán, cần Delivery Authority xác nhận effort bổ sung có nằm trong timebox 5 ngày của W07 hay không.

### 8. Owner

Business Authority (chủ sở hữu Success Metric, người quyết định mức độ đầu tư cho việc đo lường sau go-live).

### 9. Trạng thái

ĐANG MỞ

## 8. Ma Trận Trạng Thái

### 8.1. Yêu cầu liên kết Driver Plus (`partner_link_request`)

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
|---|---|---|---|
| *(D+ push mới)* | Nhận request | Chờ liên kết | Adapter gate pass (resolve tenant qua SĐT thành công, đúng 1 match) + garage chưa có liên kết active, nếu có → chặn, `ERR-DPL-010`, không tạo record |
| Chờ liên kết | Duyệt | Đã liên kết | Consent + scroll gate |
| Chờ liên kết | Từ chối (user) | Từ chối | Lý do bắt buộc ≤2.000 ký tự |
| Chờ liên kết | Cascade auto-reject | Từ chối | Trigger khi 1 record khác cùng garage được Duyệt |
| Chờ liên kết | D+ withdraw (inbound) | Đã hủy liên kết | Resolve tenant qua `requestCode` (ADR-029 v3 gap G4), không toast |
| Đã liên kết | Đồng bộ lại | *(không đổi)* | Đọc real-time, không ghi đè THÔNG TIN XỬ LÝ |
| Đã liên kết | Hủy liên kết (user) | Đã hủy liên kết | Lý do bắt buộc ≤2.000 ký tự |
| Đã liên kết | D+ unlink (inbound) | Đã hủy liên kết | Resolve tenant qua `requestCode` |
| Từ chối / Đã hủy liên kết | *(terminal)* | — | D+ có thể tạo LKD-xxx mới nếu garage hiện chưa có liên kết active |

### 8.2. Booking (các dòng liên quan Driver Plus)

| From | To | Điều kiện | Trigger |
|---|---|---|---|
| *(tạo mới)* | Lịch hẹn mới | Nguồn = Driver+, đủ 14 trường (+`externalBookingId` kỹ thuật) | Sự kiện từ Driver+ |
| Lịch hẹn mới | Đã hủy (`cancel_source=DRIVERPLUS_USER`) | Khách gửi yêu cầu hủy qua Driver+ | Áp dụng tự động, không qua duyệt |
| Đã xác nhận | Đã hủy (`cancel_source=DRIVERPLUS_USER`) | Khách gửi yêu cầu hủy qua Driver+ | Áp dụng tự động, không qua duyệt |
| Lịch hẹn mới / Đã xác nhận | Đã hủy (`cancel_source=NO_SHOW_AUTO`) | Quá hạn thời gian quy định (3 con số timer mâu thuẫn — RR-035) | Hệ thống tự động |
| Xe đã đến / Đã từ chối / Đã hủy | *(giữ nguyên)* | Yêu cầu hủy từ D+ đến khi booking đã khép lại | Không áp dụng hủy, đồng bộ lại thực tế |

### 8.3. Document sync (mới) — vòng đời phát sự kiện

| Trigger nghiệp vụ | Producer | Event phát | Điều kiện |
|---|---|---|---|
| Phiếu dịch vụ (SO) nguồn booking D+ chuyển "Hoàn thành" | `gf-sales` | `DOCUMENT.SERVICE_ORDER.SYNC` | AC-17/AC-38, `eventId = UUIDv5(documentCode)` |
| Tạo phiếu quyết toán thành công từ SO nguồn D+ | `gf-accounting` | `DOCUMENT.SETTLEMENT.SYNC` | AC-3/AC-4/AC-18, snapshot REST `for-settlement`, độc lập không chờ SO |
| Phiếu quyết toán bị hủy rồi tạo lại cùng mã | `gf-accounting` | `DOCUMENT.SETTLEMENT.SYNC` (lần 2) | ⚠️ Va chạm dedupe `eventId` thuần hàm — xem RR-043 |
| Flag `Document:DriverPlus` tắt giữa lúc outbox có row PENDING | — | *(chưa đặc tả — RR-046)* | — |

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
- [ ] AC-15 — Đồng bộ khi sửa nội dung (cần xác nhận RR-024)
- [ ] AC-8 — Bước 15 phút khi sửa giờ hẹn D+ (cần xác nhận RR-040)
- [ ] AC-9/AC-10 — "Loại dịch vụ" bắt buộc khi sửa booking D+ (cần xác nhận RR-033, có thể chặn cả tính năng Sửa)

Document sync — FEAT-SO-DETAIL / FEAT-STL-CREATE (mới):
- [ ] FEAT-SO-DETAIL AC-17 — Phát `DOCUMENT.SERVICE_ORDER.SYNC` khi SO hoàn thành
- [ ] FEAT-SO-DETAIL AC-38 — Xử lý lỗi khi phát sự kiện thất bại (không rollback nghiệp vụ)
- [ ] FEAT-STL-CREATE AC-3/AC-4 — Phát `DOCUMENT.SETTLEMENT.SYNC` khi tạo phiếu quyết toán, cặp Khách hàng/Bảo hiểm độc lập
- [ ] FEAT-STL-CREATE AC-18 — Xử lý lỗi khi phát sự kiện thất bại
- [ ] Kill-switch `Document:DriverPlus` (cần xác nhận RR-046 trước khi viết TC)

## 10. Khuyến Nghị Cho Kiểm Thử

1. Ưu tiên viết test case cho invariant "tối đa 1 liên kết active/garage" (AC-16, AC-31, AC-34) trước — bất biến quan trọng nhất, bảo vệ bằng partial unique index ở tầng DB.
2. Thiết kế bộ test riêng cho cơ chế resolve tenant MỚI qua SĐT (`REQUEST.CREATE`) và qua `requestCode` (`WITHDRAW`/`UNLINK`) — đây là thay đổi lớn nhất của đợt refresh này (ADR-029 v1→v3 trong 1 tuần), bao gồm cả case SĐT trùng nhiều garage (RR-001) và case garage cũ chưa backfill SĐT (RR-005).
3. Test case cho 4 loại notification outbound nên verify đúng wording chính xác từng ký tự — không chỉ verify có gửi hay không.
4. Chờ làm rõ RR-034 (enum `LeadSource` chưa liệt kê) và RR-035 (3 con số "quá hạn" mâu thuẫn) trước khi viết test case cho các nhánh liên quan — đây là 2 gap có bằng chứng cross-document mạnh nhất trong đợt rà soát này.
5. **Mới — nhánh Document sync**: vì đây là nhánh vừa thêm rất gần đây (2026-08-10/11) và CHƯA từng qua Architecture Review (RR-044), nên ưu tiên thấp hơn 2 nhánh còn lại cho tới khi có xác nhận chính thức đã ratify — trước mắt có thể viết test case cho phần cơ chế kỹ thuật đã rõ (dedupe `eventId`, TTL 30 ngày, payload không nhúng binary) nhưng KHÔNG nên viết test cho case tái tạo phiếu quyết toán sau hủy (RR-043) cho tới khi cơ chế dedupe được làm rõ — hiện đang có rủi ro silent-skip.
6. Test mobile nên tập trung xác nhận đúng phần khác biệt thật sự (entry point, layout card, màn Bộ lọc full-screen) — phần chi tiết + 4 modal action phải giống hệt Web.
7. Test case tenant isolation và tenant mismatch nên có mức ưu tiên cao — đây là alert mức P1 duy nhất trong toàn bộ `INTEG-EXT-driver-plus.md §8.4`.
8. **Lưu ý quan trọng khi kế thừa test case từ bản v1/v2**: RR-028/RR-029/RR-039 (mã cũ) của bản v1/v2 đã được xác nhận là false positive ở bản v3 này (do lỗi copy tài liệu, không phải gap thật) — bất kỳ test case nào đã viết dựa trên các finding này (VD "verify field DB không tồn tại", "verify mã lỗi chưa đăng ký") cần được rà soát lại và loại bỏ vì premise đã sai.
9. Với RR-009 (accessibility scroll-gate), nếu W07 không có ngân sách test accessibility đầy đủ, tối thiểu nên có 1 test case xác nhận hành vi thực tế của cơ chế "cuộn đến cuối" khi dùng phím tắt trình duyệt.
10. Test case cho garage cũ chưa backfill `tenant_profile` (RR-005, RR-007) nên được đưa vào bộ test dữ liệu biên — mức độ nghiêm trọng đã TĂNG so với bản v1/v2 vì SĐT giờ là khoá bắt buộc để resolve tenant.
