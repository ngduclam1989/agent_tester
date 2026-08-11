---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 21
tier: T1
owner_authority: Business Authority
boundary: "gf-system"
last_reviewed: "2026-08-10"
supersedes: "none"
---

# Business Rules — gf-system

> Boundary này sở hữu domain: Tenant provisioning, branch, invoice info, nhà xe liên kết (transporter registry), **yêu cầu liên kết đối tác Driver Plus** (hậu baseline).
> Phạm vi tài liệu:
> - Nghiệp vụ nhà xe liên kết thuộc EP-CATALOG (4 FEAT: LIST, CREATE, EDIT, DELETE) — §2.1..§2.4.
> - **Nghiệp vụ yêu cầu liên kết đối tác Driver Plus thuộc EP-PARTNER-LINK (1 FEAT: FEAT-SYS-DRIVERPLUS-LINK) — §2.5 (v16)**.

---

## §1 Cross-boundary Rules

| Rule | Mô tả | Boundaries liên quan |
|---|---|---|
| CB-SYS-001 | Dữ liệu nhà xe liên kết được phạm vi theo tenant (garage). Mọi truy vấn và thao tác đều phải filter theo `tenantId` — không hiển thị hoặc cho phép thao tác dữ liệu của garage khác. | gf-system, agg-garage-graph |
| CB-SYS-002 | Nhà xe liên kết được tham chiếu bởi yêu cầu đặt hàng và đơn hàng mua trên `gf-purchase`. Xóa nhà xe liên kết bị chặn nếu có dữ liệu tham chiếu. | gf-system, gf-purchase |
| CB-SYS-003 | Mọi thao tác CRUD nhà xe liên kết đi qua BFF `agg-garage-graph` (GraphQL) rồi gọi REST API `gf-system`. Frontend không truy cập trực tiếp `gf-system`. | gf-system, agg-garage-graph |
| CB-SYS-004 | Yêu cầu liên kết Driver Plus (`LKD-YYYY-NNN`) được **tạo hoàn toàn từ app Driver Plus** và push sang GMS qua Kafka `AC-DEV-PARTNER-LINK-EVENTS`, `MessageGroup=PARTNER_LINK`, `MessageStep=PARTNER_LINK.REQUEST.CREATE`; adapter validation gate (PC-4 pattern — tham chiếu BR-CORE-012) xử lý trước khi ghi domain. Garage KHÔNG có endpoint tạo yêu cầu; chỉ nhận và xử lý. **Adapter validation gate CHẶN request mới nếu garage đã có 1 tài khoản D+ ở trạng thái "Đã liên kết"** (single-active guard — xem BR-DPL-CMN-007): không tạo record "Chờ liên kết" mới, trả `PARTNER_LINK.REQUEST.RESPONSE` với correlation và lỗi `ERR-DPL-010`. | gf-system, Driver Plus (external) |
| CB-SYS-005 | Khi 1 yêu cầu liên kết được Duyệt / Đồng bộ lại / Hủy, `gf-system` publish Kafka event ngược lại sang Driver Plus: `PARTNER_LINK.PROFILE.SYNC` cho dữ liệu hồ sơ và `PARTNER_LINK.STATUS.CHANGED` cho đổi trạng thái/notification. Tuân thủ BR-CORE-005 outbox/inbox mandatory + BR-CORE-011 no PII / sensitive data leak. | gf-system, Driver Plus (external) |
| CB-SYS-006 | Dữ liệu chia sẻ sang Driver Plus (khối "Thông tin đồng bộ sang Driver Plus": doanh nghiệp + địa chỉ + xuất hóa đơn) đọc **real-time từ hồ sơ garage hiện tại** (không lưu snapshot lúc Duyệt). Khi user bấm "Đồng bộ lại thông tin sang D+", `gf-system` re-fetch từ chính domain của mình + join dữ liệu chi nhánh/xuất HĐ; KHÔNG có cache trung gian dữ liệu chia sẻ. | gf-system, agg-garage-graph |
| CB-SYS-007 | Ngoài luồng tạo request (CB-SYS-004), Driver Plus còn gửi inbound event "hủy yêu cầu liên kết" cho record đang **"Chờ liên kết"**, qua cùng Kafka topic/group với `MessageStep=PARTNER_LINK.REQUEST.WITHDRAW`. Logic timeout / điều kiện enable nút Hủy thuộc phía D+; `gf-system` chỉ xử lý event cùng payload lý do hủy, qua inbox dedupe và transaction domain. | gf-system, Driver Plus (external) |
| CB-SYS-008 (v6 — hủy 2 chiều) | Driver Plus gửi inbound event "hủy liên kết" cho record đang **"Đã liên kết"**, qua cùng Kafka topic/group với `MessageStep=PARTNER_LINK.UNLINK`. Payload kèm lý do free text; nếu trống, `gf-system` dùng wording mặc định "Hủy từ ứng dụng Driver Plus." Tuân thủ inbox dedupe + outbox/inbox mandatory. | gf-system, Driver Plus (external) |
| CB-SYS-009 (v6 — outbound noti) | Khi record đổi state do action từ phía GMS, `gf-system` gửi notification trực tiếp sang Driver Plus trong Kafka event `PARTNER_LINK.STATUS.CHANGED`, field `notification.message` chứa wording tiếng Việt đã chốt. Retry theo outbox; noti fail KHÔNG rollback state cục bộ. Case state change do D+ khởi phát → KHÔNG gửi noti ngược. | gf-system, Driver Plus (external) |

---

## §2 Rules Registry

### 2.1 Danh sách nhà xe liên kết (BR-TRANS-LST-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-LST-001 | Danh sách nhà xe liên kết luôn được phạm vi theo garage hiện tại — không hiển thị nhà xe liên kết của garage khác. | Tenant isolation | FEAT-CAT-TRANS-LIST |
| BR-TRANS-LST-002 | Tìm kiếm từ khóa áp dụng đồng thời cho tên nhà xe, số điện thoại và tuyến xe. | Search | FEAT-CAT-TRANS-LIST |
| BR-TRANS-LST-003 | Trạng thái nhà xe liên kết chỉ có hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**. | Domain constraint | FEAT-CAT-TRANS-LIST |

### 2.2 Tạo nhà xe liên kết (BR-TRANS-CRE-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-CRE-001 | Số điện thoại nhà xe liên kết không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối tạo và thông báo lỗi. | Uniqueness | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-002 | Số điện thoại phải đúng 10 chữ số. | Validation | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-003 | Thời gian xe chạy theo định dạng hh:mm, có thể nhập nhiều giá trị cách nhau bằng dấu phẩy. | Format | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-004 | Trạng thái nhà xe liên kết mặc định khi tạo là **"Đang hoạt động"**. | Default value | FEAT-CAT-TRANS-CREATE |
| BR-TRANS-CRE-005 | Các trường bắt buộc khi tạo: Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy. | Required fields | FEAT-CAT-TRANS-CREATE |

### 2.3 Chỉnh sửa nhà xe liên kết (BR-TRANS-EDT-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-EDT-001 | Số điện thoại nhà xe liên kết không được trùng với nhà xe liên kết khác trong cùng một garage. Nếu trùng, hệ thống từ chối cập nhật. | Uniqueness | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-002 | Số điện thoại phải đúng 10 chữ số. | Validation | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-003 | Thời gian xe chạy theo định dạng hh:mm, có thể nhập nhiều giá trị cách nhau bằng dấu phẩy. | Format | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-004 | Các trường bắt buộc khi cập nhật: Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy. | Required fields | FEAT-CAT-TRANS-EDIT |
| BR-TRANS-EDT-005 | Trạng thái nhà xe liên kết có thể thay đổi giữa **"Đang hoạt động"** và **"Ngừng hoạt động"** khi chỉnh sửa. | Status toggle | FEAT-CAT-TRANS-EDIT |

### 2.4 Xóa nhà xe liên kết (BR-TRANS-DEL-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-TRANS-DEL-001 | Xóa nhà xe liên kết là xóa hoàn toàn bản ghi khỏi hệ thống (hard delete) — không phải soft delete. | Delete policy | FEAT-CAT-TRANS-DELETE |
| BR-TRANS-DEL-002 | Hệ thống không cho phép xóa nhà xe liên kết khi có dữ liệu liên quan đang sử dụng (Yêu cầu đặt hàng hoặc Đơn hàng mua đang tham chiếu). | Referential integrity | FEAT-CAT-TRANS-DELETE |
| BR-TRANS-DEL-003 | Trước khi xóa, hệ thống bắt buộc hiển thị dialog xác nhận để tránh xóa nhầm. | Safety guard | FEAT-CAT-TRANS-DELETE |

### 2.5 Yêu cầu liên kết Driver Plus (BR-DPL-*, v21)

> Nghiệp vụ mới hậu baseline thuộc `EP-PARTNER-LINK` (giai đoạn 1: đối tác Driver Plus). Bao trùm 1 feature `FEAT-SYS-DRIVERPLUS-LINK` với 4 action: Duyệt / Từ chối / Đồng bộ lại thông tin / Hủy liên kết. **Platform (v10, 2026-07-30)**: nghiệp vụ áp dụng đồng nhất cho cả **Web GMS** và **Mobile app `garage-mobile`** — chỉ `BR-DPL-LST-005` là rule riêng platform (mobile card variant), các rule còn lại platform-agnostic. Nhóm mã BR:
> - `BR-DPL-CMN-*` — rule chung (nguồn tạo, single-active-link, phân quyền, terminal states).
> - `BR-DPL-LST-*` — danh sách + filter.
> - `BR-DPL-APV-*` — Duyệt (Approve).
> - `BR-DPL-REJ-*` — Từ chối (Reject).
> - `BR-DPL-SYN-*` — Đồng bộ lại (Sync).
> - `BR-DPL-CAN-*` — Hủy liên kết (Cancel).
>
> **Naming rationale**: `DPL` = Driver Plus (đối tác cụ thể giai đoạn 1), trong khi epic `EP-PARTNER-LINK` đặt tên theo domain generic "liên kết đối tác" (chừa chỗ đối tác tương lai). Naming khác tầng có chủ đích — xem `FEAT-SYS-DRIVERPLUS-LINK.md` header + BA review F4 (2026-07-28).

#### 2.5.1 Rule chung (BR-DPL-CMN-001..008)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-CMN-001 | Yêu cầu liên kết (`LKD-YYYY-NNN`) được **tạo hoàn toàn từ Driver Plus** và push sang GMS. Garage KHÔNG có UI / endpoint tạo yêu cầu — chỉ nhận và xử lý. | Data source | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-002 | Mỗi garage tại 1 thời điểm chỉ có **tối đa 1 tài khoản Driver Plus ở trạng thái "Đã liên kết"** (rule single-active-link). Nhiều yêu cầu "Chờ liên kết" có thể tồn tại song song **chỉ khi garage CHƯA có tài khoản "Đã liên kết"** (nhiều tài khoản D+ khác nhau gửi khi garage đang trống); khi Duyệt 1 trong số đó → cascade BR-DPL-APV-004 auto-reject các "Chờ liên kết" còn lại. Sau khi có 1 "Đã liên kết", D+ bị chặn gửi thêm yêu cầu (BR-DPL-CMN-007) → không còn "Chờ liên kết" song song với "Đã liên kết". | Cardinality | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-003 (v15 — làm rõ điều kiện guard, BA-review round 2 N1) | Trạng thái **"Từ chối"** và **"Đã hủy liên kết"** là terminal — không có action tiếp theo trên chính record đó. Driver Plus có thể gửi lại request MỚI (tạo LKD-xxx mới), record cũ giữ nguyên làm lịch sử — không sửa, không xóa. **Điều kiện**: re-request vẫn phải qua adapter validation gate như mọi request khác — nếu garage hiện đã có 1 tài khoản D+ khác ở trạng thái "Đã liên kết", re-request **cũng bị chặn** theo single-active guard (BR-DPL-CMN-007), KHÔNG phải ngoại lệ. | Lifecycle | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-004 | Dual persona (`garage-owner` + `accountant`) có **quyền ngang nhau** trên toàn bộ tính năng (Duyệt / Từ chối / Đồng bộ lại / Hủy). Không có ngoại lệ phân quyền. Tuân thủ Critical Rule #6 (Dual persona only) — không tạo actor mới. | Authorization | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-005 | Trường "Người thực hiện" trong section "THÔNG TIN XỬ LÝ" lưu **snapshot text** (tên + role tại thời điểm xử lý), KHÔNG phải reference động vào bảng nhân viên. Đảm bảo lịch sử audit không bị mất khi nhân viên bị vô hiệu hóa / rời garage. **Role display token** map theo Persona display name (`Product/personas/*.md`): `garage-owner` → **"Chủ garage"**, `accountant` → **"Kế toán"**. Format snapshot: `{Tên nhân viên} ({Tên hiển thị role})`, VD `Đăng Vinh (Chủ garage)` / `Lan Anh (Kế toán)`. | Audit / snapshot | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-006 | Record ở trạng thái terminal (**"Từ chối"** / **"Đã hủy liên kết"**) cùng audit log kèm theo (Ngày xử lý / Người thực hiện / Lý do) **giữ VĨNH VIỄN trong DB active** — KHÔNG xóa, KHÔNG archive, KHÔNG chuyển cold-storage. Phục vụ tra cứu lịch sử + kiểm toán không giới hạn thời gian. (Chốt user 2026-07-29 — danh sách yêu cầu liên kết thường ngắn, không lo dung lượng.) | Audit / retention | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-007 (v16 — chốt wording + error code, BA-review round 2 N2) | Driver Plus **CHỈ được gửi yêu cầu liên kết mới khi garage HIỆN KHÔNG có record nào ở trạng thái "Đã liên kết"**. Nếu garage đã có 1 tài khoản D+ "Đã liên kết", GMS **chặn request mới tại adapter validation gate** (CB-SYS-004): KHÔNG tạo record "Chờ liên kết" mới, trả thông báo lỗi về Driver Plus (wording **chính thức, chốt user 2026-07-30**: **"Garage đã liên kết với một tài khoản Driver Plus khác. Không thể gửi yêu cầu liên kết mới cho đến khi liên kết hiện tại bị hủy."** — mã lỗi `ERR-DPL-010`, xem `Product/Commons/ERROR-CODE-REGISTRY.md` §5). **Hệ quả**: KHÔNG bao giờ tồn tại đồng thời record "Chờ liên kết" và record "Đã liên kết" trên cùng garage → loại bỏ hoàn toàn tình huống user bấm Duyệt request thứ 2 khi đang có tài khoản active (không cần state guard cross-record ở tầng Duyệt). Muốn liên kết tài khoản D+ khác: garage Hủy liên kết hiện tại trước → garage trở về trạng thái trống → D+ mới gửi lại được yêu cầu. Chốt user 2026-07-29 (**đảo hướng** so với no-warning v6 — chặn từ đầu ở tầng D+ gửi thay vì cho song song). | Inbound guard / cardinality | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CMN-008 (v20 — kill-switch toàn luồng) | `PartnerLink:DriverPlus` mặc định `on` cho mọi tenant. Khi Delivery Authority chuyển sang `off`: (a) ẩn menu/tab "Liên kết" trên Web/Mobile; (b) chặn toàn bộ API/action list, detail, Duyệt, Từ chối, Đồng bộ lại, Hủy; (c) request tạo mới từ D+ không tạo record và nhận `PARTNER_LINK.REQUEST.RESPONSE` `success=false`, mã `ERR-DPL-011`; (d) GMS không phát hồ sơ hoặc trạng thái mới sang D+; (e) giữ nguyên mọi record và audit hiện hữu. Bật lại flag → tiếp tục hoạt động trên dữ liệu đã giữ, không cần khôi phục dữ liệu. | Emergency kill-switch | FEAT-SYS-DRIVERPLUS-LINK |

#### 2.5.2 Danh sách yêu cầu (BR-DPL-LST-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-LST-001 | Danh sách yêu cầu liên kết luôn phạm vi theo garage hiện tại (`tenantId`). Không hiển thị yêu cầu của garage khác. | Tenant isolation | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-LST-002 | Thứ tự mặc định: **ngày gửi yêu cầu mới nhất trước** (DESC). | Sort default | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-LST-003 (v12 — sửa default + persistence, BA-review F6) | Filter "Trạng thái liên kết" — **Web**: dropdown checkbox multi-select 4 giá trị (Chờ liên kết / Đã liên kết / Từ chối / Đã hủy liên kết); **Mobile**: màn "Bộ lọc" full-screen riêng, cùng 4 checkbox. Cả 2 platform mặc định chỉ tick **"Chờ liên kết" + "Đã liên kết"**; **"Từ chối" + "Đã hủy liên kết" KHÔNG tick mặc định** (sửa lại so với v9 — trước đó ghi nhầm "mặc định tất cả 4 đều tick", BA correction 2026-07-30). Tick/bỏ tick từng giá trị → hiện/ẩn yêu cầu thuộc trạng thái đó. **Persistence**: ghi nhớ lựa chọn filter trong phiên (session) theo default hệ thống `[BR-COMMON#SYS-RETRY-009]`; thoát session (đăng xuất / đóng app) → filter về lại default 2 trạng thái nêu trên. | Filter default | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-LST-004 (v12 — bổ sung rationale deviation, BA-review F6) | KHÔNG có ô tìm kiếm và KHÔNG có phân trang trên danh sách (đã chốt với BA/PO — danh sách thường ngắn). Render toàn bộ record thoả filter. **Deviation có chủ đích** so với default hệ thống `[BR-COMMON#SYS-RETRY-004]` (mobile: 20 bản ghi/trang + infinite scroll) và `[BR-COMMON#SYS-RETRY-008/022]` (web: phân trang) — áp dụng cho **cả 2 platform**, không riêng web, vì đặc thù nghiệp vụ: 1 garage tối đa 1 tài khoản D+ active tại 1 thời điểm nên danh sách yêu cầu thực tế luôn ngắn, phân trang/infinite-scroll không cần thiết và thêm phức tạp UI không cần. | UI constraint | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-LST-005 (v12 — mobile card variant, fix tên field + ellipsis) | Card danh sách trên **Mobile** hiển thị bổ sung 2 field **"Người thực hiện"** + **"Lý do"** ngay trên item (khác Web chỉ hiện 2 field này ở form chi tiết; field "Người thực hiện" cùng định nghĩa với BR-DPL-CMN-005 — v10 từng ghi nhầm "Người xử lý", fix 2026-07-30 để thống nhất tên field xuyên tài liệu) — giảm thao tác tap vào chi tiết trên mobile. Nút hành động (Duyệt/Từ chối/Đồng bộ lại/Hủy) cũng hiển thị ngay trên card theo trạng thái, không bắt buộc vào màn chi tiết trước. **Text overflow**: tên tài khoản D+ / lý do dài vượt độ rộng card → ellipsis cuối dòng, tap/hold hiện full text `[BR-COMMON#SYS-RETRY-025]`. | Platform variance | FEAT-SYS-DRIVERPLUS-LINK |

#### 2.5.3 Duyệt yêu cầu (BR-DPL-APV-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-APV-001 | Chỉ yêu cầu ở trạng thái **"Chờ liên kết"** mới có nút "Duyệt". Yêu cầu ở trạng thái khác KHÔNG có nút này. | State guard | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-APV-002 | Modal Duyệt bắt buộc user **tick checkbox** "Tôi đã đọc và đồng ý chia sẻ thông tin garage với Driver Plus" trước khi nút "Đồng ý liên kết" enabled. | Consent | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-APV-003 | Checkbox điều khoản **chỉ enabled sau khi user cuộn hết nội dung block điều khoản** (scroll-to-end gate). Trước đó checkbox disabled với hint "Vui lòng cuộn xuống cuối để tiếp tục". | Consent enforcement | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-APV-004 | Duyệt thành công trigger **cascade single-active-link**: TẤT CẢ các yêu cầu khác của cùng garage đang ở trạng thái "Chờ liên kết" tự động chuyển sang "Từ chối" (system-generated). Với mỗi record bị auto-reject: `Lý do` = giá trị hệ thống VD **"Đã có tài khoản Driver Plus khác được liên kết với garage tại thời điểm này."**; `Người thực hiện` = user vừa Duyệt (snapshot text). Cascade chạy all-or-nothing trong một transaction; partial unique index `(tenant_id) WHERE status='LINKED'` bảo vệ invariant khi concurrent write. | Cascade / consistency | FEAT-SYS-DRIVERPLUS-LINK |

#### 2.5.4 Từ chối yêu cầu (BR-DPL-REJ-001..002)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-REJ-001 | Chỉ yêu cầu ở trạng thái **"Chờ liên kết"** mới có nút "Từ chối". | State guard | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-REJ-002 (v21 — chốt max length) | Textarea "Lý do từ chối" **bắt buộc nhập** (không rỗng, không chỉ khoảng trắng — trim đầu/cuối theo `BR-COMMON#SYS-RETRY-005`) và tối đa **2.000 ký tự**. Không có ràng buộc độ dài tối thiểu ngoài điều kiện không rỗng. Nút "Xác nhận từ chối" chỉ enabled khi nội dung hợp lệ; vượt giới hạn hiển thị `ERR-DPL-012`. Lý do được lưu vào section "THÔNG TIN XỬ LÝ". Áp dụng đồng nhất Web/Mobile. | Required input / max length | FEAT-SYS-DRIVERPLUS-LINK |

#### 2.5.5 Đồng bộ lại thông tin (BR-DPL-SYN-001..002)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-SYN-001 | Chỉ yêu cầu ở trạng thái **"Đã liên kết"** mới có nút "Đồng bộ lại thông tin sang D+". | State guard | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-SYN-002 | "Đồng bộ lại" đọc **real-time hồ sơ garage hiện tại** (không dùng snapshot lưu lúc Duyệt) rồi push sang D+. Trạng thái yêu cầu KHÔNG đổi (vẫn "Đã liên kết"). Section "THÔNG TIN XỬ LÝ" KHÔNG bị ghi đè (giữ nguyên thông tin lúc Duyệt). | Data freshness | FEAT-SYS-DRIVERPLUS-LINK |

#### 2.5.6 Hủy liên kết (BR-DPL-CAN-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-CAN-001 | Chỉ yêu cầu ở trạng thái **"Đã liên kết"** mới có nút "Hủy liên kết". | State guard | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CAN-002 (v21 — chốt max length) | Textarea "Lý do hủy liên kết" **bắt buộc nhập** (không rỗng, không chỉ khoảng trắng — trim đầu/cuối theo `BR-COMMON#SYS-RETRY-005`) và tối đa **2.000 ký tự**. Không có ràng buộc độ dài tối thiểu ngoài điều kiện không rỗng. Nút "Xác nhận hủy liên kết" chỉ enabled khi nội dung hợp lệ; vượt giới hạn hiển thị `ERR-DPL-012`. Áp dụng đồng nhất Web/Mobile. **Deviation so với `BR-COMMON#SYS-RETRY-013`**: modal này cần thu thập lý do audit nên không dùng confirm-cancel generic. | Required input / max length | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CAN-003 | Hủy liên kết thành công: record chuyển "Đã hủy liên kết" (terminal); section "THÔNG TIN XỬ LÝ" **ghi ĐÈ** với Ngày xử lý / Người thực hiện / Lý do mới. Garage trở về trạng thái không có tài khoản D+ active — cho phép Duyệt 1 request "Chờ liên kết" khác (nếu có) hoặc chờ D+ gửi request mới. | Lifecycle | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CAN-004 | **Inbound D+ withdraw** (CB-SYS-007): khi `gf-system` nhận event D+ hủy 1 record đang **"Chờ liên kết"** → record chuyển **"Đã hủy liên kết"** (badge đỏ đậm, terminal — dùng lại trạng thái sẵn có, không tạo state mới). Section "THÔNG TIN XỬ LÝ" ghi: **Ngày xử lý** = thời điểm `gf-system` nhận event; **Người thực hiện** = snapshot text cố định **"Driver Plus"** (không phải nhân viên GMS — hành động đến từ đối tác); **Lý do** = text từ payload D+ gửi kèm. UI cập nhật ngầm (không toast cho GMS user đang xem — user tự làm mới trang sẽ thấy trạng thái mới). Event chỉ hợp lệ khi record đang ở "Chờ liên kết"; event tới record ở trạng thái khác (VD đã Duyệt, đã Từ chối trước đó) → GMS bỏ qua + log warning (không đổi state). | Lifecycle / inbound | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-CAN-005 (v6 — hủy 2 chiều) | **Inbound D+ unlink** (CB-SYS-008): khi `gf-system` nhận event D+ hủy 1 record đang **"Đã liên kết"** → record chuyển **"Đã hủy liên kết"** (badge đỏ đậm, terminal — dùng lại state, không tạo state mới). Section "THÔNG TIN XỬ LÝ" **ghi ĐÈ** (giống case garage tự hủy BR-DPL-CAN-003): **Ngày xử lý** = thời điểm `gf-system` nhận event; **Người thực hiện** = snapshot text cố định **"Driver Plus"** (thống nhất với case D+ withdraw pending BR-DPL-CAN-004) — **phân biệt với case garage tự hủy** hiển thị nhân viên cụ thể kèm role (VD `Đăng Vinh (Chủ garage)`) theo BR-DPL-CMN-005; **Lý do** = text từ payload D+ nếu payload kèm, hoặc wording mặc định **"Hủy từ ứng dụng Driver Plus."** nếu payload không kèm. UI cập nhật ngầm (không toast — song song với BR-DPL-CAN-004 pattern). Sau khi record chuyển terminal, garage trở về không có tài khoản D+ active — cho phép Duyệt request "Chờ liên kết" khác. Event chỉ hợp lệ khi record đang ở "Đã liên kết"; event tới state khác → bỏ qua + log warning. **Payload spec đã chốt** (user 2026-07-29): kèm lý do dạng free text; rỗng → wording mặc định "Hủy từ ứng dụng Driver Plus." | Lifecycle / inbound | FEAT-SYS-DRIVERPLUS-LINK |

#### 2.5.7 Notification outbound sang Driver Plus (BR-DPL-NOTI-001..004, v6 — hủy 2 chiều + noti)

> Nhóm rule mới đặc tả **wording user-facing** notification GMS gửi sang phía Driver Plus khi record đổi state do action từ phía GMS. Notification đi trực tiếp qua Kafka event `PARTNER_LINK.STATUS.CHANGED`, không qua `gf-notification`; retry theo pattern outbox chuẩn (BR-CORE-005) — noti fail KHÔNG rollback state cục bộ.
>
> **Wording tất cả 4 loại đã CHỐT chính thức** (user 2026-07-29) — dùng đúng câu ghi trong mỗi rule dưới đây (không còn NEED CONFIRMATION). Biến `{Tên}` / `{SĐT}` / `{Tên garage}` / `{Lý do}` / `{DD/MM/YYYY HH:mm}` là placeholder dữ liệu điền lúc runtime, không phải marker chờ chốt.

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DPL-NOTI-001 | **Noti khi garage Duyệt request thành công** (trigger AC-36 sau AC-15): `gf-system` gửi notification cho tài khoản D+ vừa được duyệt. **Đã chốt CÓ kèm mốc thời gian duyệt** (user 2026-07-29). Wording chính thức: *"Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã được duyệt kể từ {DD/MM/YYYY HH:mm}. Bạn có thể bắt đầu chia sẻ dữ liệu với garage."* | Outbound notification | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-NOTI-002 | **Noti khi garage Từ chối request (user thao tác)** (trigger AC-37 sau AC-19): `gf-system` gửi notification cho tài khoản D+ bị từ chối. **Đã chốt CÓ kèm lý do garage nhập** (user 2026-07-29). Wording chính thức: *"Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã bị từ chối. Lý do: {Lý do do garage nhập}."* | Outbound notification | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-NOTI-003 | **Noti khi request bị auto-reject bởi cascade single-active-link** (trigger AC-38 sau AC-16): `gf-system` gửi notification cho từng tài khoản D+ bị auto-reject. **CÓ gửi noti cho case này — CHỐT user 2026-07-29** (để D+ user hiểu vì sao request bị từ chối). Wording chính thức: *"Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã bị từ chối tự động vì garage đã liên kết với tài khoản D+ khác tại thời điểm này."* | Outbound notification | FEAT-SYS-DRIVERPLUS-LINK |
| BR-DPL-NOTI-004 | **Noti khi garage Hủy liên kết** (trigger AC-39 sau AC-24): `gf-system` gửi notification cho tài khoản D+ vừa bị hủy. **Đã chốt CÓ kèm lý do garage nhập + mốc thời gian** (user 2026-07-29). Wording chính thức: *"Tài khoản D+ {Tên} · {SĐT} đã bị hủy liên kết với garage {Tên garage} kể từ {DD/MM/YYYY HH:mm}. Lý do: {Lý do do garage nhập}."* Case ngược (D+ tự hủy — BR-DPL-CAN-004/CAN-005) KHÔNG gửi noti ngược vì D+ là bên khởi phát. | Outbound notification | FEAT-SYS-DRIVERPLUS-LINK |

---

## §3 Status Transition Rules

### 3.1 Trạng thái nhà xe liên kết

```
  ┌──────────────────┐
  │    Tạo mới       │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  └──────────────────┘  Ngừng  └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
|---|---|---|---|
| *(Tạo mới)* | Tạo nhà xe liên kết | Đang hoạt động | Mặc định khi tạo |
| Đang hoạt động | Chuyển ngừng hoạt động | Ngừng hoạt động | Qua FEAT-CAT-TRANS-EDIT |
| Ngừng hoạt động | Kích hoạt lại | Đang hoạt động | Qua FEAT-CAT-TRANS-EDIT |
| Đang hoạt động / Ngừng hoạt động | Xóa | *(Xóa vật lý)* | Không có dữ liệu tham chiếu (BR-TRANS-DEL-002) |

### 3.2 Trạng thái yêu cầu liên kết Driver Plus (v16)

```
   Driver Plus push
   ─────────────────►  ┌────────────────┐
                       │ Chờ liên kết   │  (badge cam)
                       │  (PENDING)     │
                       └──┬───────┬─────┘
                          │       │
                Duyệt     │       │  Từ chối (kèm lý do)
                          │       │
                          ▼       ▼
                  ┌───────────┐  ┌─────────────┐
                  │ Đã liên   │  │  Từ chối    │  (badge đỏ, terminal)
                  │ kết       │  │  (REJECTED) │
                  │ (LINKED)  │  └─────────────┘
                  │ xanh lá   │
                  └──┬────────┘
                     │
                     │  Hủy liên kết (kèm lý do)
                     ▼
                  ┌────────────────┐
                  │ Đã hủy liên    │  (badge đỏ đậm, terminal)
                  │ kết (UNLINKED) │
                  └────────────────┘

   Cascade (system-generated) khi Duyệt:
     Chờ liên kết ──► Từ chối
     (áp cho TẤT CẢ các Chờ liên kết khác của cùng garage; lý do system-generated)

   D+ withdraw (inbound event từ Driver Plus, record đang Chờ liên kết):
     Chờ liên kết ──► Đã hủy liên kết
     (D+ user chủ động hủy — VD sau 60' garage không phản hồi;
      Người thực hiện = "Driver Plus", Lý do = payload D+; BR-DPL-CAN-004 + CB-SYS-007)

   D+ unlink (inbound event, hủy 2 chiều — v6 2026-07-29, record đang Đã liên kết):
     Đã liên kết ──► Đã hủy liên kết
     (D+ user chủ động hủy tài khoản đang liên kết từ app D+;
      Người thực hiện = "Driver Plus" — phân biệt với case garage tự hủy;
      Lý do = payload D+ hoặc "Hủy từ ứng dụng Driver Plus." mặc định;
      BR-DPL-CAN-005 + CB-SYS-008)

   Outbound notification (v6 2026-07-29, gửi khi state change do action từ GMS):
     GMS Duyệt success        ──► noti D+ (BR-DPL-NOTI-001)
     GMS Từ chối user         ──► noti D+ (BR-DPL-NOTI-002)
     Cascade auto-reject      ──► noti D+ (BR-DPL-NOTI-003, đã chốt CÓ gửi)
     GMS Hủy liên kết         ──► noti D+ (BR-DPL-NOTI-004)
     (D+ inbound withdraw/unlink KHÔNG gửi noti ngược — D+ khởi phát, đã biết)
```

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
|---|---|---|---|
| *(Driver Plus push mới)* | Nhận request từ D+ | Chờ liên kết | Adapter validation pass (BR-CORE-012) |
| Chờ liên kết | Duyệt | Đã liên kết | BR-DPL-APV-002 + BR-DPL-APV-003 (consent + scroll gate) |
| Chờ liên kết | Từ chối (user) | Từ chối | BR-DPL-REJ-002 (lý do bắt buộc) |
| Chờ liên kết | **Cascade auto-reject** | Từ chối | BR-DPL-APV-004 — trigger khi 1 record khác cùng garage được Duyệt |
| Chờ liên kết | **D+ withdraw (inbound event)** | Đã hủy liên kết | BR-DPL-CAN-004 + CB-SYS-007 — D+ user chủ động hủy yêu cầu (VD sau 60 phút garage không phản hồi, D+ hiển thị nút Hủy) |
| Đã liên kết | Đồng bộ lại thông tin sang D+ | (không đổi) | BR-DPL-SYN-002 — không đổi trạng thái |
| Đã liên kết | Hủy liên kết (user GMS) | Đã hủy liên kết | BR-DPL-CAN-002 (lý do bắt buộc) — Người thực hiện = nhân viên GMS kèm role |
| Đã liên kết | **D+ unlink (inbound event, hủy 2 chiều — v6)** | Đã hủy liên kết | BR-DPL-CAN-005 + CB-SYS-008 — D+ user chủ động hủy từ app Driver Plus; Người thực hiện = "Driver Plus" phân biệt với case garage tự hủy |
| Từ chối / Đã hủy liên kết | *(terminal)* | — | Không có action. D+ có thể tạo LKD-xxx MỚI (BR-DPL-CMN-003) — **nếu** garage hiện chưa có tài khoản D+ khác "Đã liên kết" (nếu có → bị chặn theo BR-DPL-CMN-007, xem row "Driver Plus push mới" ở trên). |

---

## §4 Permission Rules

| Action | garage-owner | accountant | Condition |
|---|---|---|---|
| Xem danh sách nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |
| Tạo nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |
| Chỉnh sửa nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |
| Xóa nhà xe liên kết | Cho phep | Cho phep | Không có ngoại lệ |

> Không có ngoại lệ phân quyền trong toàn bộ domain nhà xe liên kết.

### 4.2 Yêu cầu liên kết Driver Plus (v16)

| Action | garage-owner | accountant | Condition |
|---|---|---|---|
| Xem danh sách yêu cầu liên kết | Cho phép | Cho phép | BR-DPL-CMN-004 |
| Xem chi tiết yêu cầu | Cho phép | Cho phép | BR-DPL-CMN-004 |
| Duyệt yêu cầu (trạng thái Chờ liên kết) | Cho phép | Cho phép | BR-DPL-APV-001..004 |
| Từ chối yêu cầu (trạng thái Chờ liên kết) | Cho phép | Cho phép | BR-DPL-REJ-001..002 |
| Đồng bộ lại thông tin (trạng thái Đã liên kết) | Cho phép | Cho phép | BR-DPL-SYN-001..002 |
| Hủy liên kết (trạng thái Đã liên kết) | Cho phép | Cho phép | BR-DPL-CAN-001..003 |
| Tự tạo yêu cầu liên kết | **KHÔNG** | **KHÔNG** | BR-DPL-CMN-001 — chỉ Driver Plus tạo; garage không có UI/endpoint tạo |

> Dual persona ngang quyền trên toàn bộ tính năng — tuân thủ Critical Rule #6 (Dual persona only).

---

## §5 Validation Rules

### 5.1 Số điện thoại

| Rule | Validation | Error message | Features |
|---|---|---|---|
| VLD-TRANS-001 | Đúng 10 chữ số | **"Số điện thoại phải gồm 10 số."** | CREATE, EDIT |
| VLD-TRANS-002 | Unique trong cùng garage | **"Số điện thoại đã tồn tại."** | CREATE, EDIT |

### 5.2 Trường bắt buộc

| Trường | Error message khi trống | Features |
|---|---|---|
| Tên nhà xe | **"Tên nhà xe là bắt buộc."** | CREATE, EDIT |
| Số điện thoại | (xem VLD-TRANS-001, VLD-TRANS-002) | CREATE, EDIT |
| Địa chỉ nhà xe nhận hàng | **"Địa chỉ nhà xe nhận hàng là bắt buộc."** | CREATE, EDIT |
| Thông tin tuyến xe | **"Thông tin tuyến xe là bắt buộc."** | CREATE, EDIT |
| Thời gian xe chạy | **"Thời gian xe chạy là bắt buộc."** | CREATE, EDIT |

### 5.3 Định dạng

| Trường | Định dạng | Features |
|---|---|---|
| Thời gian xe chạy | hh:mm, nhiều giá trị cách nhau bằng dấu phẩy | CREATE, EDIT |

### 5.4 Xóa

| Rule | Validation | Error message | Features |
|---|---|---|---|
| VLD-TRANS-DEL-001 | Không có dữ liệu tham chiếu (Yêu cầu đặt hàng / Đơn hàng mua) | **"Không thể xóa thông tin liên kết nhà xe vì đang có dữ liệu liên quan sử dụng thông tin này."** | DELETE |

### 5.5 Yêu cầu liên kết Driver Plus (v21)

| Rule | Validation | Error message | Error code | Features |
|---|---|---|---|---|
| VLD-DPL-001 | Textarea "Lý do từ chối" không được rỗng / chỉ khoảng trắng | **"Vui lòng nhập lý do từ chối."** (button disabled, không cần toast) | `ERR-DPL-001` | FEAT-SYS-DRIVERPLUS-LINK — Từ chối |
| VLD-DPL-002 | Textarea "Lý do hủy liên kết" không được rỗng / chỉ khoảng trắng | **"Vui lòng nhập lý do hủy liên kết."** (button disabled) | `ERR-DPL-002` | FEAT-SYS-DRIVERPLUS-LINK — Hủy |
| VLD-DPL-003 | Checkbox điều khoản chưa tick khi bấm "Đồng ý liên kết" | Button disabled, không cần toast; hint "Vui lòng cuộn xuống cuối để tiếp tục" nếu chưa scroll | `ERR-DPL-003` | FEAT-SYS-DRIVERPLUS-LINK — Duyệt |
| VLD-DPL-004 | Race condition — yêu cầu đã bị xử lý bởi người khác | **"Yêu cầu liên kết này đã được xử lý bởi người dùng khác. Vui lòng làm mới trang."** | `ERR-DPL-004` | Cả 4 action |
| VLD-DPL-005 | Lỗi hệ thống chung khi gọi 4 action | **"Không thể xử lý yêu cầu. Vui lòng thử lại sau."** | `ERR-DPL-005` | Cả 4 action |
| VLD-DPL-006 | Lý do Từ chối hoặc Hủy vượt 2.000 ký tự | **"Lý do không được vượt quá 2.000 ký tự."** (button disabled) | `ERR-DPL-012` | FEAT-SYS-DRIVERPLUS-LINK — Từ chối / Hủy, Web + Mobile |

> **Error code mapping** (v21): xem đầy đủ registry tại `Product/Commons/ERROR-CODE-REGISTRY.md` §5 (`ERR-DPL-001..012`). `ERR-DPL-012` ánh xạ `VLD-DPL-006`; các mã `ERR-DPL-006..011` không có VLD-ID riêng vì thuộc race, system state, empty state, external guard hoặc kill-switch.

---

## §6 Dependency Rules

| Dependency | Loại | Mô tả |
|---|---|---|
| gf-purchase | Downstream | Yêu cầu đặt hàng và đơn hàng mua tham chiếu nhà xe liên kết. Xóa bị chặn khi có tham chiếu. |
| agg-garage-graph | Gateway | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp gf-system. |
| EP-CATALOG | Epic | Nhà xe liên kết là 1 trong 3 nhóm danh mục trong EP-CATALOG (cùng dịch vụ và nhà cung cấp). |
| Driver Plus (external) | External / Upstream | Nguồn phát sinh yêu cầu liên kết `LKD-YYYY-NNN`. Giao thức hai chiều dùng Kafka `AC-DEV-PARTNER-LINK-EVENTS`, `MessageGroup=PARTNER_LINK`; tuân thủ PC-4 + BR-CORE-005 outbox/inbox + BR-CORE-011 no PII leak + BR-CORE-012 external payload validation gate. |
| EP-FOUND | Upstream | Hồ sơ garage (doanh nghiệp, chi nhánh, xuất hóa đơn) là source dữ liệu cho khối "Thông tin đồng bộ sang Driver Plus" — đọc real-time (CB-SYS-006). |
| EP-BOOKING | Downstream | Post-liên kết, dữ liệu Driver Plus được EP-BOOKING dùng nhận dạng nguồn booking D+ (đã có ở baseline production — không thuộc scope epic này). |
| EP-PARTNER-LINK | Epic | Domain "yêu cầu liên kết đối tác Driver Plus" thuộc epic mới `EP-PARTNER-LINK`. Đặt tên epic theo domain "liên kết đối tác" (không theo tên D+ cụ thể) vì UI đã chừa tab "Đối tác khác" cho tương lai. |

---

## §7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

- **Không phát hiện conflict**: Các BR giữa CREATE và EDIT nhất quán — cùng validation rules (số điện thoại 10 số, unique, 5 trường bắt buộc, format hh:mm).

### 7.2 Missing rules

| ID | Mô tả | Mức độ |
|---|---|---|
| MISS-SYS-001 | **Giới hạn độ dài** tên nhà xe, địa chỉ, tuyến xe, ghi chú chưa được quy định (FEAT chỉ quy định placeholder, không có maxLength). | ⚠ NEED CLARIFICATION |
| MISS-SYS-002 | **Validation format hh:mm** chưa rõ: hệ thống có reject giá trị không đúng format (ví dụ "25:70") không? FEAT chỉ mô tả format mong đợi, không mô tả error message cho format sai. | ⚠ NEED CLARIFICATION |
| MISS-SYS-003 | **Concurrent edit**: FEAT-CAT-TRANS-EDIT EC-3 mô tả "nhà xe đã bị xóa bởi người dùng khác" nhưng không quy định cơ chế optimistic locking (version check). | ⚠ NEED CLARIFICATION |
| MISS-SYS-004 | **Số điện thoại format**: chỉ yêu cầu "đúng 10 chữ số" — chưa rõ có bắt buộc bắt đầu bằng "0" hoặc prefix cụ thể không. | ⚠ NEED CLARIFICATION |

### 7.3 De xuat cai tien

1. **Bổ sung maxLength cho các trường text** (tên nhà xe, địa chỉ, tuyến xe, ghi chú) — thống nhất giới hạn tránh lỗi server-side.
2. **Bổ sung validation error message cho format thời gian sai** (ví dụ: **"Thời gian xe chạy phải theo định dạng hh:mm."**).
3. **Cân nhắc soft delete thay vì hard delete** — để giữ lịch sử tham chiếu cho báo cáo. Hiện tại hard delete có thể gây mất trace khi cần audit.
4. **Bổ sung optimistic locking** cho concurrent edit/delete — gf-system nên trả lỗi conflict khi version mismatch.

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo business rules cho gf-system — nhà xe liên kết (4 FEAT: LIST, CREATE, EDIT, DELETE). Tổng hợp 16 BR, 5 validation rules, 4 missing rules cần clarify. | Business Authority |
| 2026-07-24 | v2 — Bổ sung domain **Yêu cầu liên kết Driver Plus** (`EP-PARTNER-LINK` / `FEAT-SYS-DRIVERPLUS-LINK`). §1 thêm 3 cross-boundary rules CB-SYS-004..006 (D+ inbound qua adapter, outbound push data khi Duyệt/Đồng bộ/Hủy, data real-time không snapshot). §2.5 rules registry 20 BR chia 6 nhóm (CMN-001..005, LST-001..004, APV-001..004, REJ-001..002, SYN-001..002, CAN-001..003). §3.2 status transition 4 trạng thái (Chờ liên kết / Đã liên kết / Từ chối / Đã hủy liên kết) + cascade single-active-link khi Duyệt. §4.2 permission dual persona ngang quyền (KHÔNG có endpoint tự tạo yêu cầu). §5.5 5 validation rule (2 lý do bắt buộc + 1 consent gate + 2 error message chung). §6 dependency thêm Driver Plus external + EP-FOUND upstream + EP-BOOKING downstream + EP-PARTNER-LINK. NEED CONFIRMATION: (a) field cụ thể "Thông tin xuất hóa đơn" (screenshot bị cắt); (b) wording đầy đủ "Điều khoản chia sẻ thông tin" (Business Authority + Legal); (c) UI cảnh báo khi có Chờ liên kết mới trong lúc đã có Đã liên kết (đề xuất KHÔNG cảnh báo, chờ BA confirm). Architecture (Architect quyết): giao thức inbound/outbound sync D+, cơ chế cascade atomic-in-transaction, retention audit log cho record cũ. | Business Authority + Senior PM (main agent, spawn qua ba-author) |
| 2026-07-28 | v3 — Fix theo `Product/reviews/BA-REVIEW-EP-PARTNER-LINK-2026-07-28.md` (F11): §2.5.1 CMN-005 bổ sung role display token mapping (`garage-owner`→"Chủ garage", `accountant`→"Kế toán", đồng bộ với `Product/personas/*.md`) — trước đó FEAT dùng token `owner GMS` không match persona display name (inconsistency F12). Thêm **BR-DPL-CMN-006** (retention rule cho record terminal + audit log) — nguyên tắc KHÔNG auto-xóa/archive đã chốt, **retention period cụ thể vẫn NEED CONFIRMATION Business Authority + Legal**. | main agent (fix theo BA review) |
| 2026-07-28 | v4 — Fix F4 (naming 3-way): §2.5 header thêm note "Naming rationale" — `DPL` abbreviation gắn đối tác cụ thể Driver Plus (giai đoạn 1 hard-code 1 đối tác) trong khi epic `EP-PARTNER-LINK` đặt tên domain generic (tab-ready cho đối tác tương lai). Giữ nguyên `BR-DPL-*` ID, không rename. | user (Business Authority) qua main agent |
| 2026-07-28 | v5 — Bổ sung **inbound D+ withdraw** theo thống nhất GMS ↔ Driver Plus 2026-07-28: (a) §1 thêm CB-SYS-007 (D+ có thể gửi event hủy 1 record đang "Chờ liên kết"; logic timeout 60' thuộc phía D+, GMS không tính timer); (b) §2.5.6 thêm BR-DPL-CAN-004 (Người thực hiện = "Driver Plus", Lý do = payload D+, UI cập nhật ngầm không toast, event tới record ≠ "Chờ liên kết" → GMS bỏ qua + log warning); (c) §3.2 status transition thêm row "Chờ liên kết → Đã hủy liên kết (D+ withdraw)" + cập nhật ASCII diagram. Dùng lại state "Đã hủy liên kết" sẵn có, không tạo state mới. | user (Business Authority) qua main agent |
| 2026-07-29 | v6 — **Cập nhật 3 quyết định GMS ↔ D+ 2026-07-29**: (a) **BR-DPL-CMN-007 mới (no-warning UI)** — resolve NEED CONFIRMATION #3 v5: KHÔNG hiển cảnh báo khi có "Chờ liên kết" mới trong lúc đang có 1 "Đã liên kết"; rule single-active-link chỉ enforce khi user bấm Duyệt. (b) **Hủy 2 chiều — inbound D+ unlink Đã liên kết**: §1 thêm CB-SYS-008 (song song CB-SYS-007 pending case); §2.5.6 thêm BR-DPL-CAN-005 (Người thực hiện = "Driver Plus (hệ thống)" phân biệt với case garage tự hủy hiển thị nhân viên+role; Lý do = payload D+ hoặc "Hủy từ ứng dụng Driver Plus." mặc định nếu payload không kèm — payload spec NEED CONFIRMATION D+ team); §3.2 thêm row transition "Đã liên kết → Đã hủy liên kết (D+ unlink)" + cập nhật ASCII diagram. (c) **Notification outbound (4 loại)** — §1 thêm CB-SYS-009 (outbound noti pattern, retry outbox, kênh Architect quyết); §2.5.7 mới với BR-DPL-NOTI-001..004 (Duyệt / Từ chối user / Auto-reject cascade / Hủy) — wording placeholder NEED CONFIRMATION Business Authority, BR-DPL-NOTI-003 còn NEED CONFIRMATION có gửi cho auto-reject hay im lặng; ASCII diagram thêm section outbound noti. Đồng bộ FEAT v7 + UX-FLOW v3 + EP v5 + PRD v20 + README v17 + BUSINESS-RULES v9 + DESIGN-SOURCE-POLICY v9. | user (Business Authority) qua main agent |
| 2026-07-29 | v7 — **Đảo hướng single-active guard (quyết định user, thay thế no-warning v6)**: khi garage đã có 1 tài khoản D+ "Đã liên kết" → Driver Plus **KHÔNG được gửi thêm yêu cầu liên kết mới**; GMS chặn tại adapter gate (CB-SYS-004 thêm clause chặn) và trả thông báo lỗi. **BR-DPL-CMN-007 viết lại**: từ "no-warning + cho phép Chờ liên kết song song với Đã liên kết" → "inbound guard: D+ chỉ gửi được khi garage chưa có Đã liên kết". BR-DPL-CMN-002 bổ sung vế "Chờ liên kết song song chỉ hợp lệ khi chưa có Đã liên kết". **Hệ quả nghiệp vụ**: không còn tình huống Chờ liên kết đồng thời với Đã liên kết → loại bỏ ambiguity user bấm Duyệt request thứ 2 (BA review 2026-07-29 NF1). Đồng bộ FEAT (AC-34 viết lại + Nhóm K đổi tên), UX-FLOW (bước ⑤ + state-machine note), EP §3 note. | user (Business Authority) qua main agent |
| 2026-07-29 | v8 — **Chốt 6 điểm treo cụm notification + retention + payload (BA-review NF3, C1-C6)**: (C1) BR-DPL-NOTI-003 — chốt CÓ gửi noti khi auto-reject cascade. (C2) NOTI-002/004 — chốt CÓ kèm lý do garage nhập. (C3) NOTI-001 — chốt CÓ kèm mốc thời gian duyệt. (C4) §2.5.7 header + NOTI-001..004 + CB-SYS-009 — wording 4 loại chốt CHÍNH THỨC (gỡ hết marker NEED CONFIRMATION wording). (C5) CB-SYS-008 + BR-DPL-CAN-005 — payload D+ hủy chốt kèm lý do free text, rỗng → câu mặc định "Hủy từ ứng dụng Driver Plus.". (C6) BR-DPL-CMN-006 — retention chốt GIỮ VĨNH VIỄN (không xóa/archive). Marker còn lại đều thuộc Architecture (giao thức inbound/outbound, atomic, kênh noti). Đồng bộ FEAT v10 + UX-FLOW v5. | user (Business Authority) qua main agent |
| 2026-07-29 | v9 — **Thống nhất nhãn "Người thực hiện" cho D+ inbound (BA-review NF4, ý C-NF4)**: đổi **"Driver Plus (hệ thống)" → "Driver Plus"** ở BR-DPL-CAN-005 + §3.2 ASCII diagram + row transition — dùng 1 nhãn duy nhất "Driver Plus" cho cả 2 case inbound (withdraw pending BR-DPL-CAN-004 + unlink linked BR-DPL-CAN-005), vẫn phân biệt với case garage tự hủy (hiển thị tên nhân viên + role). Đồng bộ FEAT v11 + UX-FLOW v6 + EP v7. | user (Business Authority) qua main agent |
| 2026-07-30 | v10 — **SCOPE EXPANSION — Mobile app vào scope**: §2.5 header thêm note Platform (nghiệp vụ áp dụng đồng nhất Web + Mobile `garage-mobile`, trừ BR-DPL-LST-005 riêng platform). **Fix BR-DPL-LST-003** (BA correction): default filter sửa lại đúng — chỉ tick "Chờ liên kết" + "Đã liên kết" mặc định (trước đó ghi nhầm "tất cả 4 tick" từ v2), áp dụng cho cả dropdown Web và màn Bộ lọc full-screen Mobile. Thêm **BR-DPL-LST-005 mới** (mobile card variant — card list hiển thị bổ sung Người xử lý + Lý do + nút action ngay trên card). Đồng bộ FEAT-SYS-DRIVERPLUS-LINK v14 (Nhóm N mới), EP-PARTNER-LINK v9, UX-FLOW v7, README v18, BUSINESS-RULES v10, DESIGN-SOURCE-POLICY v10, PRD v21. | user (Business Authority) qua main agent |
| 2026-07-30 | v11 — **Fix P1 F4 (BA-review 2026-07-30)**: BR-DPL-LST-005 ghi nhầm tên field "Người xử lý" — đúng phải là **"Người thực hiện"** (cùng field, cùng định nghĩa với BR-DPL-CMN-005, chỉ là hiển thị thêm ở vị trí khác trên mobile). Fix để 1 field chỉ có đúng 1 tên xuyên suốt tài liệu, tránh dev/test hiểu nhầm là 2 field khác nhau. Đồng bộ FEAT v17 + UX-FLOW v9. | user (Business Authority) qua main agent |
| 2026-07-30 | v12 — **Fix P1 F6 (BA-review 2026-07-30)**: AC-41/42 (mobile) chưa cite đủ BR + chưa đối chiếu `Product/Commons/BR-COMMON.md`. (a) BR-DPL-LST-003 thêm **persistence** — filter ghi nhớ trong session `[BR-COMMON#SYS-RETRY-009]`, reset khi thoát session, áp dụng cả 2 platform. (b) BR-DPL-LST-004 thêm **rationale deviation** tường minh — no-pagination là lệch có chủ đích so với default hệ thống `[BR-COMMON#SYS-RETRY-004]` (mobile 20/trang + infinite scroll) và `[BR-COMMON#SYS-RETRY-008/022]` (web phân trang), lý do: danh sách luôn ngắn do invariant single-active-link. (c) BR-DPL-LST-005 thêm **text overflow** — ellipsis + tap xem full text `[BR-COMMON#SYS-RETRY-025]` cho tên tài khoản D+/lý do dài trên card. Đồng bộ FEAT v19 (AC-5, AC-41, AC-42 thêm cite tương ứng). | user (Business Authority) qua main agent |
| 2026-07-30 | v13 — **Fix P1 F7 (BA-review 2026-07-30)**: §5.5 bảng VLD-DPL-001..005 thêm cột **"Error code"** cite `ERR-DPL-001..005` (mã lỗi vừa cấp trong `Product/Commons/ERROR-CODE-REGISTRY.md` §5) + note mapping cho `ERR-DPL-006..009` (race AC-31, banner load fail, 2 empty state — không có VLD-ID riêng). Đồng bộ ERROR-CODE-REGISTRY v19. | user (Business Authority) qua main agent |
| 2026-07-30 | v14 — **Fix P2 batch (BA-review 2026-07-30)**: heading §2.5 range tags chưa cập nhật khi thêm rule mới nhiều đợt — §2.5 header "(BR-DPL-*, v2)" → "(BR-DPL-*, v13)"; §2.5.1 "(BR-DPL-CMN-001..006)" → "..007" (đã có CMN-007 từ lâu); §2.5.2 "(BR-DPL-LST-001..004)" → "..005" (đã có LST-005); §2.5.6 "(BR-DPL-CAN-001..004)" → "..005" (đã có CAN-005). Thuần editorial, không đổi nội dung rule. | user (Business Authority) qua main agent |
| 2026-07-30 | v15 — **Fix P1 N1 (BA-review round 2, 2026-07-30)**: BR-DPL-CMN-003 + §3.2 row "Từ chối/Đã hủy liên kết" mô tả re-request là được phép **vô điều kiện**, mâu thuẫn với BR-DPL-CMN-007 (single-active guard chặn MỌI request mới khi garage đã có "Đã liên kết") — side-effect chưa dọn từ đợt đảo hướng v7. Thêm điều kiện tường minh: re-request vẫn qua adapter gate như request thường, KHÔNG phải ngoại lệ của guard. Đồng bộ FEAT v22 (AC-25), PRD v23 (item 8), EP v12 (§3 RE-REQUEST), UX-FLOW v12 (khối terminal state). | user (Business Authority) qua main agent |
| 2026-07-30 | v16 — **Fix P1 N2 (BA-review round 2, 2026-07-30)**: BR-DPL-CMN-007 — wording message chặn D+ tại adapter gate trước đó ghi "đề xuất" dù đã dùng thật trong AC-34 từ 2026-07-29, chưa từng được chốt chính thức. User **chốt luôn wording hiện tại** (2026-07-30, không đổi câu chữ) + cấp mã `ERR-DPL-010` trong `ERROR-CODE-REGISTRY.md` §5 (thêm display type mới `API_RESPONSE` cho message trả về external caller, không render GMS UI). Đồng bộ FEAT v22 (AC-34) + ERROR-CODE-REGISTRY v20. | user (Business Authority) qua main agent |
| 2026-07-30 | v17 — **Fix P2 N5 (BA-review round 2, 2026-07-30)**: đợt fix P2 batch v14 chỉ quét heading §2.5/§2.5.1/§2.5.2/§2.5.6, bỏ sót §1 intro blockquote + §3.2 + §4.2 + §5.5 vẫn ghi "(v2)" dù nội dung đã cập nhật đến v16. Cập nhật cả 4 chỗ → "(v16)" khớp version file hiện tại. Thuần editorial, không đổi nội dung rule. | user (Business Authority) qua main agent |
| 2026-07-30 | v18 — **Fix P2 N8 (BA-review round 2, 2026-07-30)**: BR-DPL-REJ-002 + BR-DPL-CAN-002 chưa đối chiếu `BR-COMMON.md` — thêm cite trim `SYS-RETRY-005`, ghi rõ **không có ràng buộc độ dài tối thiểu** (user chốt giữ nguyên hành vi hiện tại — chỉ cần không rỗng, không thêm min-length enforcement), max length NEED CONFIRMATION. BR-DPL-CAN-002 thêm ghi chú deviation so với `SYS-RETRY-013` (pattern confirm-cancel generic) — modal Hủy liên kết cần thu thập thêm lý do audit nên không dùng pattern đơn giản. Đồng bộ EP v13 (§6 success metric bỏ ngưỡng "≥10 ký tự" không enforce được). | user (Business Authority) qua main agent |
| 2026-08-10 | v19 — **Chốt Kafka theo ADR-029**: CB-SYS-004..005/007..009 xác định topic, message step và response correlation; BR-DPL-APV-004 chốt cascade atomic + partial unique index; notification đi trực tiếp trong `PARTNER_LINK.STATUS.CHANGED`, không qua `gf-notification`. |
| 2026-08-10 | v20 — **Chốt `PartnerLink:DriverPlus` là kill-switch toàn luồng**: thêm BR-DPL-CMN-008 — flag off ẩn UI, chặn API/action, từ chối request tạo mới bằng `ERR-DPL-011`, ngừng outbound profile/status, giữ nguyên dữ liệu/audit; bật lại tiếp tục trên dữ liệu hiện hữu. | user (Business Authority) qua main agent |
| 2026-08-10 | v21 — **Chốt max length Lý do = 2.000 ký tự** cho cả Từ chối/Hủy trên Web/Mobile; giữ nguyên không có min-length ngoài điều kiện không rỗng sau trim. Thêm VLD-DPL-006 + `ERR-DPL-012`, loại bỏ NEED CONFIRMATION max length. | user (Business Authority) qua main agent |
