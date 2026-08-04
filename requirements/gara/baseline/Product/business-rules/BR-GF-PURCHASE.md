---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-purchase"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules — gf-purchase

> Boundary này sở hữu domain: Quotation Request (Yêu cầu báo giá), Purchase Request (Yêu cầu đặt hàng), Purchase Order (Đơn hàng mua), Supplier (Nhà cung cấp).

---

## §1 Cross-boundary Rules

| ID | Rule | Boundary liên quan | Mô tả |
|---|---|---|---|
| BR-XBOUND-001 | Tenant isolation bắt buộc | `gf-system` | Mọi dữ liệu trong gf-purchase phải scoped theo `tenant_id`. Event header `OriginTenantId` phải match `data.tenantId`. Vi phạm = data breach. |
| BR-XBOUND-002 | Outbox/inbox bắt buộc cho state-changing events | Architecture (ADR-004) | PurchaseOrderStatusChanged event phải qua transactional outbox. Consumer (gf-inventory-worker) phải dedup qua inbox table. |
| BR-XBOUND-003 | Thông tin xe từ gf-erp-mdm | `gf-erp-mdm` | Danh mục hãng xe, dòng xe, phiên bản xe được lấy từ gf-erp-mdm (cached qua Redis). gf-purchase chỉ đọc, không ghi. |
| BR-XBOUND-004 | Phiếu dịch vụ liên kết từ gf-sales | `gf-sales` | Đơn hàng mua có thể tham chiếu phiếu dịch vụ (sale_order_code). Thông tin phiếu dịch vụ lấy từ gf-sales qua REST — gf-purchase chỉ lưu reference code, không lưu chi tiết. |
| BR-XBOUND-005 | Event nhập kho tự động qua gf-inventory-worker | `gf-inventory`, `gf-inventory-worker` | Khi đơn hàng mua (source DIRECT) chuyển sang trạng thái DELIVERING và feature `Inventory:InventoryStockV01` bật, hệ thống phát event `PurchaseOrderStatusChanged` (EVENT_VERSION 2.0). gf-inventory-worker consume event này để tạo phiếu nhập kho tự động. |
| BR-XBOUND-006 | Giao hàng qua gf-shipment | `gf-shipment` | Đơn hàng mua nguồn "Nền tảng" có thể liên kết với transport_order_id từ gf-shipment để theo dõi trạng thái vận chuyển. |
| BR-XBOUND-007 | Danh mục tỉnh/thành phố, phường/xã từ gf-erp-mdm | `gf-erp-mdm` | Thông tin địa chỉ nhà cung cấp (tỉnh/thành phố, phường/xã) lấy từ MDM. |
| BR-XBOUND-008 | Danh mục kho từ gf-inventory | `gf-inventory` | Kho ưu tiên nhận hàng (preferred_warehouse_code) của nhà cung cấp tham chiếu danh mục kho từ gf-inventory (Query `SearchWarehouses`). |
| BR-XBOUND-009 | Nhà xe liên kết từ gf-system | `gf-system` | Thông tin nhà xe liên kết (transporter) được quản lý bởi gf-system. gf-purchase tham chiếu `transport_route_id` khi tạo/cập nhật đơn hàng mua. |

---

## §2 Rules Registry

### 2.1 Yêu cầu báo giá (BR-QR-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-QR-001 | Danh sách yêu cầu báo giá luôn được phạm vi theo garage hiện tại — không hiển thị yêu cầu của garage khác. | Data Scope | FEAT-QR-LIST |
| BR-QR-002 | Tìm kiếm từ khóa áp dụng đồng thời cho mã yêu cầu báo giá và biển số xe. | Search | FEAT-QR-LIST |
| BR-QR-003 | Báo giá sơ bộ chỉ mang tính tham khảo — không phải giá chính thức từ nhà cung cấp. | Business Logic | FEAT-QR-LIST |
| BR-QR-004 | Biểu tượng xem báo giá sơ bộ chỉ hiển thị khi yêu cầu đã có báo giá sơ bộ. | Visibility | FEAT-QR-LIST |
| BR-QR-005 | Hãng xe và dòng xe là trường bắt buộc khi tạo yêu cầu báo giá. | Validation | FEAT-QR-CREATE |
| BR-QR-006 | Không được tạo phụ tùng trùng tên trong cùng một yêu cầu báo giá. | Validation | FEAT-QR-CREATE |
| BR-QR-007 | Khi yêu cầu xuất hóa đơn, các trường tên công ty, mã số thuế và địa chỉ trở thành bắt buộc. | Conditional Validation | FEAT-QR-CREATE |
| BR-QR-008 | File import phụ tùng chỉ chấp nhận định dạng Excel, tối đa 30MB. | Validation | FEAT-QR-CREATE |
| BR-QR-009 | Biển số xe phải đúng định dạng (ví dụ: 30A12345). | Validation | FEAT-QR-CREATE |
| BR-QR-010 | Tên công ty không vượt quá 255 ký tự, mã số thuế không vượt quá 50 ký tự, email không vượt quá 255 ký tự, địa chỉ không vượt quá 255 ký tự. | Validation | FEAT-QR-CREATE |
| BR-QR-011 | Hình ảnh xe tối đa 3 ảnh. | Validation | FEAT-QR-CREATE |
| BR-QR-012 | Yêu cầu báo giá phải có ít nhất một phụ tùng trước khi tạo. | Validation | FEAT-QR-CREATE |
| BR-QR-013 | Thông tin yêu cầu báo giá trên màn hình chi tiết luôn được phạm vi theo garage hiện tại. | Data Scope | FEAT-QR-DETAIL |
| BR-QR-014 | Nhà cung cấp cung cấp báo giá chi tiết (giá hàng hóa, giá dịch vụ) cho từng phụ tùng. Phụ tùng có giá tốt nhất được đánh dấu **"Giá tốt nhất!"**. | Business Logic | FEAT-QR-DETAIL |
| BR-QR-015 | Phụ tùng hết hàng không thể chọn để đặt hàng. | Business Logic | FEAT-QR-DETAIL |
| BR-QR-016 | Lịch sử cập nhật ghi nhận mọi thay đổi từ nhà cung cấp hoặc CSKH CarDoctor. | Audit | FEAT-QR-DETAIL |
| BR-QR-017 | Nhân bản yêu cầu báo giá cho phép tái sử dụng thông tin xe và/hoặc phụ tùng cho yêu cầu mới. 3 tùy chọn: **"Nhân bản toàn bộ"**, **"Chỉ nhân bản thông tin phụ tùng"**, **"Chỉ nhân bản thông tin xe"**. | Business Logic | FEAT-QR-DETAIL |
| BR-QR-018 | QuotationAsk khởi tạo ở trạng thái OPEN và isProcessed=false. | Status Init | FEAT-QR-CREATE |
| BR-QR-019 | Không tạo purchase request từ quotation ask đã ở ORDER_CONFIRMING, CANCELLED hoặc CLOSED. | Status Constraint | FEAT-QR-DETAIL, EP-PROCUREMENT |
| BR-QR-020 | Tạo purchase request từ quotation ask sẽ chuyển status sang ORDER_CONFIRMING. | Status Transition | FEAT-QR-DETAIL, FEAT-PR-CREATE |

### 2.2 Yêu cầu đặt hàng (BR-PR-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-PR-001 | Danh sách yêu cầu đặt hàng luôn được phạm vi theo garage hiện tại — không hiển thị yêu cầu của garage khác. | Data Scope | FEAT-PR-LIST |
| BR-PR-002 | Tìm kiếm từ khóa áp dụng cho mã yêu cầu đặt hàng. | Search | FEAT-PR-LIST |
| BR-PR-003 | Trạng thái yêu cầu đặt hàng gồm 6 giá trị: **"Chờ xác nhận"**, **"Chờ thanh toán"**, **"Chờ tạo đơn"**, **"Đã tạo đơn"**, **"Thiếu hàng"**, **"Đã hủy"**. | Status Enum | FEAT-PR-LIST |
| BR-PR-004 | Trạng thái thanh toán gồm 2 giá trị: **"Chưa thanh toán"**, **"Đã thanh toán"**. | Status Enum | FEAT-PR-LIST, FEAT-PR-DETAIL |
| BR-PR-005 | Yêu cầu đặt hàng được tạo từ yêu cầu báo giá đã có phụ tùng được báo giá bởi nhà cung cấp. | Precondition | FEAT-PR-CREATE |
| BR-PR-006 | Sau khi xác nhận đặt hàng, phương thức thanh toán không thể thay đổi. | Business Logic | FEAT-PR-CREATE |
| BR-PR-007 | Tổng tiền thanh toán chưa bao gồm chi phí vận chuyển giữa garage và nhà xe. | Business Logic | FEAT-PR-CREATE |
| BR-PR-008 | Hủy yêu cầu đặt hàng là hành động không thể hoàn tác. | Business Logic | FEAT-PR-CREATE, FEAT-PR-DETAIL |
| BR-PR-009 | Yêu cầu đặt hàng khởi tạo ở trạng thái **"Chờ xác nhận"** — chờ nhà cung cấp xác nhận. | Status Init | FEAT-PR-CREATE |
| BR-PR-010 | PurchaseRequest domain constructor mặc định status=OPEN và paymentStatus=PENDING. | Status Init | FEAT-PR-CREATE |
| BR-PR-011 | Mã yêu cầu đặt hàng (code) được sinh theo định dạng XNDH-{quotationAsk.id}. | Code Generation | FEAT-PR-CREATE |
| BR-PR-012 | Thông tin yêu cầu đặt hàng trên màn hình chi tiết luôn được phạm vi theo garage hiện tại. | Data Scope | FEAT-PR-DETAIL |
| BR-PR-013 | Yêu cầu đặt hàng ở trạng thái **"Đã tạo đơn"** hoặc **"Đã hủy"** không cho phép hủy. | Status Constraint | FEAT-PR-DETAIL |
| BR-PR-014 | Nút thanh toán chỉ hiển thị khi trạng thái là **"Chờ thanh toán"**. | Visibility | FEAT-PR-DETAIL |
| BR-PR-015 | Mỗi yêu cầu đặt hàng liên kết với một mã yêu cầu báo giá. | Data Integrity | FEAT-PR-DETAIL |
| BR-PR-016 | Checkout prepaid cần confirmation COMPLETE, trừ POST_PAID_QR và COD. | Business Logic | FEAT-PR-CREATE |

### 2.3 Đơn hàng mua (BR-PO-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-PO-001 | Danh sách đơn hàng luôn được phạm vi theo garage hiện tại — không hiển thị đơn hàng của garage khác. | Data Scope | FEAT-PO-LIST |
| BR-PO-002 | Tìm kiếm từ khóa áp dụng đồng thời cho mã đơn hàng và biển số xe. | Search | FEAT-PO-LIST |
| BR-PO-003 | Trạng thái đơn hàng gồm 6 giá trị hiển thị: **"Chờ xác nhận"**, **"Chuẩn bị hàng"**, **"Đang giao hàng"**, **"Hoàn thành"**, **"Đã hủy"**, **"Hoàn hàng"**. | Status Enum | FEAT-PO-LIST, FEAT-PO-DETAIL |
| BR-PO-004 | Trạng thái thanh toán gồm 2 giá trị: **"Chưa thanh toán"**, **"Đã thanh toán"**. | Status Enum | FEAT-PO-LIST |
| BR-PO-005 | Nguồn đơn gồm 2 giá trị: **"Mua ngoài"** (đơn tạo trực tiếp từ garage, source=DIRECT) và **"Nền tảng"** (đơn từ sàn, source=QUOTATION_ASK). | Business Logic | FEAT-PO-LIST |
| BR-PO-006 | Đơn hàng phải có ít nhất một phụ tùng. Nếu không có phụ tùng, hệ thống từ chối tạo. | Validation | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-007 | Mỗi phụ tùng trong đơn hàng phải có đơn giá lớn hơn hoặc bằng 0. | Validation | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-008 | Chiết khấu phải lớn hơn hoặc bằng 0 và không được vượt quá 100%. | Validation | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-009 | Ngày giao dự kiến không được nhỏ hơn ngày hiện tại. | Validation | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-010 | Nhà cung cấp, trạng thái đơn hàng và mức ưu tiên là các trường bắt buộc khi tạo/chỉnh sửa đơn hàng mua ngoài. | Validation | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-011 | Khi chọn nhà cung cấp, hệ thống tự động điền thông tin liên hệ (số điện thoại, mã số thuế, địa chỉ, phương thức thanh toán) từ dữ liệu nhà cung cấp. | Business Logic | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-012 | Mức ưu tiên gồm 3 giá trị: **"Bình thường"**, **"Gấp"**, **"Khẩn cấp"**. | Enum | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-013 | Thông tin đơn hàng trên màn hình chi tiết luôn được phạm vi theo garage hiện tại. | Data Scope | FEAT-PO-DETAIL |
| BR-PO-014 | Đơn hàng ở trạng thái **"Hoàn thành"**, **"Đã hủy"** hoặc **"Hoàn hàng"** không cho phép chỉnh sửa hoặc chuyển trạng thái. | Status Constraint | FEAT-PO-DETAIL, FEAT-PO-EDIT |
| BR-PO-015 | Hủy đơn hàng bắt buộc nhập lý do hủy. Hoàn hàng bắt buộc nhập lý do hoàn hàng. | Validation | FEAT-PO-DETAIL |
| BR-PO-016 | Hủy đơn hàng và hoàn hàng là hành động không thể hoàn tác. | Business Logic | FEAT-PO-DETAIL |
| BR-PO-017 | Hoàn thành đơn hàng sẽ đánh dấu đơn là **"Hoàn thành"** và không thể chỉnh sửa lại. | Business Logic | FEAT-PO-DETAIL |
| BR-PO-018 | Phiếu nhập kho liên kết hiển thị các phiếu nhập kho được tạo từ đơn hàng này. | Business Logic | FEAT-PO-DETAIL |
| BR-PO-019 | Lịch sử ghi nhận theo dõi mọi thay đổi trạng thái của đơn hàng theo thời gian. | Audit | FEAT-PO-DETAIL |
| BR-PO-020 | Đơn hàng ở trạng thái **"Hoàn thành"** hoặc **"Đã hủy"** — nút **"Chỉnh sửa"** không hiển thị. | Visibility | FEAT-PO-EDIT |
| BR-PO-021 | Khi thay đổi nhà cung cấp trong chỉnh sửa, thông tin liên hệ được cập nhật từ nhà cung cấp mới nhưng cho phép chỉnh sửa thủ công. | Business Logic | FEAT-PO-EDIT |
| BR-PO-022 | Direct PO phải có source=DIRECT và được cập nhật qua DirectPurchaseOrderService. | Technical Invariant | FEAT-PO-CREATE |
| BR-PO-023 | Direct PO create bắt buộc directSupplierId và ít nhất một item. | Validation | FEAT-PO-CREATE |
| BR-PO-024 | Backend PO stage gồm 8 giá trị: WAIT_TO_CONFIRM, OPEN, DELIVERING, DELIVERED, CLOSED, COMPLETED, CANCELLED, RETURNED. Giao diện gom DELIVERED + COMPLETED thành **"Hoàn thành"**. | Status Mapping | FEAT-PO-LIST, FEAT-PO-DETAIL |
| BR-PO-025 | Event inventory chỉ phát khi stage = DELIVERING và feature Inventory:InventoryStockV01 bật. | Event Condition | FEAT-PO-DETAIL |
| BR-PO-026 | Thành tiền được tự động tính dựa trên số lượng, đơn giá, chiết khấu và thuế. | Calculation | FEAT-PO-CREATE, FEAT-PO-EDIT |
| BR-PO-027 | Đơn hàng mua có thể tạo từ yêu cầu đặt hàng (source QUOTATION_ASK) hoặc tạo trực tiếp (source DIRECT). | Business Logic | FEAT-PO-LIST, FEAT-PO-CREATE |
| BR-PO-028 | Hủy yêu cầu đặt hàng chỉ hợp lệ khi tất cả đơn hàng mua liên quan còn ở trạng thái **"Chờ xác nhận"**. | Status Constraint | EP-PROCUREMENT |

### 2.4 Nhà cung cấp (BR-SUP-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-SUP-001 | Danh sách nhà cung cấp luôn được phạm vi theo garage hiện tại — không hiển thị nhà cung cấp của garage khác. | Data Scope | FEAT-CAT-SUP-LIST |
| BR-SUP-002 | Tìm kiếm từ khóa áp dụng đồng thời cho tên, mã và số điện thoại nhà cung cấp. | Search | FEAT-CAT-SUP-LIST |
| BR-SUP-003 | Trạng thái nhà cung cấp chỉ có hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**. | Status Enum | FEAT-CAT-SUP-LIST |
| BR-SUP-004 | Nguồn tạo nhà cung cấp chỉ có hai giá trị: **"Garage"** (garage tự tạo) và **"CarDoctor"** (đồng bộ từ hệ thống CarDoctor). | Enum | FEAT-CAT-SUP-LIST |
| BR-SUP-005 | Số điện thoại nhà cung cấp không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối tạo/cập nhật và thông báo lỗi. | Uniqueness | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |
| BR-SUP-006 | Mã nhà cung cấp được hệ thống tự sinh theo định dạng NCC-{tenantId}-{supplierId} nếu không nhập thủ công — không cho phép trùng mã trong cùng garage. | Code Generation | FEAT-CAT-SUP-CREATE |
| BR-SUP-007 | Nhà cung cấp tạo từ giao diện garage luôn có nguồn tạo là **"Garage"**. Nhà cung cấp nguồn **"CarDoctor"** chỉ được đồng bộ từ hệ thống, không cho phép tạo thủ công. | Business Logic | FEAT-CAT-SUP-CREATE |
| BR-SUP-008 | Trường Số điện thoại bắt buộc đối với nhà cung cấp nguồn **"Garage"**. | Conditional Validation | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |
| BR-SUP-009 | Điều khoản thanh toán chỉ chấp nhận các giá trị: **"COD (Thanh toán khi nhận hàng)"**, **"Trong vòng 7 ngày"**, **"Trong vòng 15 ngày"**, **"Trong vòng 30 ngày"**, **"Trong vòng 60 ngày"**, **"Thanh toán sau"**. | Validation | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |
| BR-SUP-010 | Mã nhà cung cấp không cho phép chỉnh sửa sau khi đã tạo. | Immutability | FEAT-CAT-SUP-EDIT |
| BR-SUP-011 | Nhà cung cấp nguồn **"Garage"** được chỉnh sửa hầu hết các trường trừ mã nhà cung cấp. Nhà cung cấp nguồn **"CarDoctor"** chỉ cho phép chỉnh sửa một tập trường hạn chế — các trường đồng bộ từ CarDoctor không cho phép chỉnh sửa. | Edit Restriction | FEAT-CAT-SUP-EDIT |
| BR-SUP-012 | Hệ thống không hỗ trợ xóa nhà cung cấp. Chỉ cho phép chuyển trạng thái **"Ngừng hoạt động"**. | Soft Delete | FEAT-CAT-SUP-EDIT |
| BR-SUP-013 | Nhà cung cấp đang có đơn hàng liên kết — hệ thống vẫn cho phép chỉnh sửa thông tin nhà cung cấp; đơn hàng cũ giữ nguyên snapshot thông tin tại thời điểm tạo. | Business Logic | FEAT-CAT-SUP-EDIT |
| BR-SUP-014 | Nhà cung cấp nguồn **"CarDoctor"** — số điện thoại bị ẩn, response trả private_phone riêng. | Privacy | FEAT-CAT-SUP-LIST |
| BR-SUP-015 | Khi tạo nhà cung cấp, trạng thái mặc định là **"Đang hoạt động"**. | Status Init | FEAT-CAT-SUP-CREATE |
| BR-SUP-016 | Số điện thoại phải đúng định dạng. Lỗi: **"Số điện thoại không đúng định dạng."** | Validation | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |

---

## §3 Status Transition Rules

### 3.1 Quotation Request Lifecycle

**Giao diện hiển thị 3 trạng thái chính + 2 terminal:**
- **"Đã gửi yêu cầu"** (gom OPEN + ASKING)
- **"Đã có báo giá"** (gom BIDDING + PRICING)
- **"Xác nhận đặt hàng"** (ORDER_CONFIRMING)
- **"Đã huỷ"** (CANCELLED) — terminal
- **"Đã đóng"** (CLOSED) — terminal

**Backend có 7 trạng thái:** OPEN, ASKING, BIDDING, PRICING, ORDER_CONFIRMING, CANCELLED, CLOSED.

| From (Business) | To (Business) | Backend Transition | Điều kiện | Features |
|---|---|---|---|---|
| _(khởi tạo)_ | Đã gửi yêu cầu | -> OPEN | Tạo yêu cầu báo giá thành công | FEAT-QR-CREATE |
| Đã gửi yêu cầu | Đã có báo giá | OPEN/ASKING -> BIDDING/PRICING | NCC phản hồi báo giá | FEAT-QR-DETAIL |
| Đã có báo giá | Xác nhận đặt hàng | PRICING -> ORDER_CONFIRMING | Garage xác nhận đặt hàng (tạo YCDH) | FEAT-QR-DETAIL, FEAT-PR-CREATE |
| Xác nhận đặt hàng | Đã đóng | ORDER_CONFIRMING -> CLOSED | Tạo YCDH + ĐHM thành công | FEAT-PR-CREATE |
| Đã gửi yêu cầu | Đã huỷ | OPEN/ASKING -> CANCELLED | Garage huỷ yêu cầu | FEAT-QR-DETAIL |
| Đã có báo giá | Đã huỷ | BIDDING/PRICING -> CANCELLED | Garage huỷ yêu cầu | FEAT-QR-DETAIL |
| Đã huỷ | _(terminal)_ | — | Không chuyển tiếp được | — |
| Đã đóng | _(terminal)_ | — | Không chuyển tiếp được | — |

### 3.2 Purchase Request Lifecycle

**Trạng thái yêu cầu đặt hàng:** Chờ xác nhận, Chờ thanh toán, Chờ tạo đơn, Đã tạo đơn, Thiếu hàng, Đã hủy.

**Trạng thái thanh toán:** Chưa thanh toán (PENDING), Đã thanh toán (PAID).

| From | To | Điều kiện | Features |
|---|---|---|---|
| _(khởi tạo)_ | Chờ xác nhận (OPEN) | Garage gửi yêu cầu đặt hàng từ YCBG | FEAT-PR-CREATE |
| Chờ xác nhận | Chờ thanh toán | NCC xác nhận đơn (confirmation COMPLETE với phương thức prepaid) | FEAT-PR-DETAIL |
| Chờ xác nhận | Chờ tạo đơn | NCC xác nhận đơn (phương thức COD hoặc POST_PAID_QR) | FEAT-PR-DETAIL |
| Chờ thanh toán | Chờ tạo đơn | Garage thanh toán thành công | FEAT-PR-CREATE, FEAT-PR-DETAIL |
| Chờ tạo đơn | Đã tạo đơn (ORDER_CREATED) | Hệ thống tạo đơn hàng mua thành công | FEAT-PR-DETAIL |
| Chờ xác nhận | Thiếu hàng | NCC xác nhận thiếu hàng | FEAT-PR-DETAIL |
| Chờ xác nhận | Đã hủy (CANCELLED) | Garage hủy yêu cầu hoặc NCC từ chối | FEAT-PR-CREATE, FEAT-PR-DETAIL |
| Đã tạo đơn | _(terminal)_ | — | — |
| Đã hủy | _(terminal)_ | — | — |

**Thanh toán:**

| From | To | Điều kiện | Features |
|---|---|---|---|
| Chưa thanh toán (PENDING) | Đã thanh toán (PAID) | Checkout QR hoặc thẻ tín dụng thành công | FEAT-PR-CREATE, FEAT-PR-DETAIL |

### 3.3 Purchase Order Lifecycle

**Giao diện hiển thị 6 trạng thái:** **"Chờ xác nhận"**, **"Chuẩn bị hàng"**, **"Đang giao hàng"**, **"Hoàn thành"** (gom DELIVERED + COMPLETED), **"Đã hủy"**, **"Hoàn hàng"**.

**Backend có 8 stage:** WAIT_TO_CONFIRM, OPEN, DELIVERING, DELIVERED, CLOSED, COMPLETED, CANCELLED, RETURNED.

| From (UI) | To (UI) | Backend Transition | Điều kiện | Features |
|---|---|---|---|---|
| _(khởi tạo)_ | Chờ xác nhận | -> WAIT_TO_CONFIRM | Tạo đơn hàng thành công | FEAT-PO-CREATE |
| Chờ xác nhận | Chuẩn bị hàng | WAIT_TO_CONFIRM -> OPEN | NCC xác nhận hoặc garage chuyển thủ công | FEAT-PO-DETAIL |
| Chuẩn bị hàng | Đang giao hàng | OPEN -> DELIVERING | Bắt đầu giao hàng; có thể phát event tạo phiếu nhập kho | FEAT-PO-DETAIL |
| Đang giao hàng | Hoàn thành | DELIVERING -> DELIVERED -> COMPLETED | Nhận hàng hoàn tất | FEAT-PO-DETAIL |
| Chờ xác nhận | Đã hủy | WAIT_TO_CONFIRM -> CANCELLED | Garage hủy đơn, bắt buộc nhập lý do | FEAT-PO-DETAIL |
| Chuẩn bị hàng | Đã hủy | OPEN -> CANCELLED | Garage hủy đơn, bắt buộc nhập lý do | FEAT-PO-DETAIL |
| Đang giao hàng | _(không cho phép hủy)_ | — | Đang giao hàng không được hủy | — |
| Hoàn thành | Hoàn hàng | COMPLETED -> RETURNED | Garage hoàn hàng sau khi nhận, bắt buộc nhập lý do | FEAT-PO-DETAIL |
| Hoàn thành | _(terminal)_ | — | Không chỉnh sửa, không chuyển tiếp (trừ hoàn hàng) | — |
| Đã hủy | _(terminal)_ | — | Không chuyển tiếp được | — |
| Hoàn hàng | _(terminal)_ | — | Không chuyển tiếp được | — |

### 3.4 Supplier Status

| From | To | Điều kiện | Features |
|---|---|---|---|
| _(khởi tạo)_ | Đang hoạt động | Tạo nhà cung cấp thành công (mặc định) | FEAT-CAT-SUP-CREATE |
| Đang hoạt động | Ngừng hoạt động | Garage chuyển trạng thái | FEAT-CAT-SUP-EDIT |
| Ngừng hoạt động | Đang hoạt động | Garage kích hoạt lại | FEAT-CAT-SUP-EDIT |

> Nhà cung cấp không bị xóa (no hard delete, no soft delete). Chỉ toggle trạng thái.

---

## §4 Permission Rules

> **Lưu ý:** Module mua hàng áp dụng quyền ngang bằng cho cả hai vai trò. Không có ngoại lệ phân quyền trong toàn bộ module gf-purchase.

| Action | garage-owner | accountant | Điều kiện | Features |
|---|---|---|---|---|
| Xem danh sách YCBG | CO | CO | — | FEAT-QR-LIST |
| Tạo YCBG | CO | CO | — | FEAT-QR-CREATE |
| Xem chi tiết YCBG | CO | CO | — | FEAT-QR-DETAIL |
| Nhân bản YCBG | CO | CO | — | FEAT-QR-DETAIL |
| Thay đổi nhà xe liên kết | CO | CO | — | FEAT-QR-DETAIL |
| Gửi yêu cầu đặt hàng từ YCBG | CO | CO | — | FEAT-QR-DETAIL, FEAT-PR-CREATE |
| Xem danh sách YCDH | CO | CO | — | FEAT-PR-LIST |
| Tạo YCDH | CO | CO | — | FEAT-PR-CREATE |
| Xem chi tiết YCDH | CO | CO | — | FEAT-PR-DETAIL |
| Thanh toán YCDH | CO | CO | Trạng thái = **"Chờ thanh toán"** | FEAT-PR-DETAIL |
| Hủy YCDH | CO | CO | Trạng thái không phải **"Đã tạo đơn"** hoặc **"Đã hủy"** | FEAT-PR-CREATE, FEAT-PR-DETAIL |
| Xem danh sách ĐHM | CO | CO | — | FEAT-PO-LIST |
| Tạo ĐHM (mua ngoài) | CO | CO | — | FEAT-PO-CREATE |
| Xem chi tiết ĐHM | CO | CO | — | FEAT-PO-DETAIL |
| Chuyển trạng thái ĐHM | CO | CO | Trạng thái không phải terminal | FEAT-PO-DETAIL |
| Chỉnh sửa ĐHM | CO | CO | Trạng thái không phải **"Hoàn thành"**, **"Đã hủy"**, **"Hoàn hàng"** | FEAT-PO-EDIT |
| Hủy ĐHM | CO | CO | Trạng thái = **"Chờ xác nhận"** hoặc **"Chuẩn bị hàng"** | FEAT-PO-DETAIL |
| Hoàn hàng ĐHM | CO | CO | Trạng thái = **"Hoàn thành"** | FEAT-PO-DETAIL |
| Hoàn thành ĐHM | CO | CO | Trạng thái = **"Đang giao hàng"** | FEAT-PO-DETAIL |
| Cập nhật tài liệu đính kèm ĐHM | CO | CO | — | FEAT-PO-DETAIL |
| Xem danh sách NCC | CO | CO | — | FEAT-CAT-SUP-LIST |
| Tạo NCC | CO | CO | — | FEAT-CAT-SUP-CREATE |
| Chỉnh sửa NCC | CO | CO | — | FEAT-CAT-SUP-EDIT |
| Chat hỗ trợ YCBG/YCDH/ĐHM | CO | CO | Yêu cầu quyền `PURCHASE_CHAT_CREATE` | FEAT-QR-LIST, FEAT-PR-LIST, FEAT-PO-LIST |

> **PURCHASE_CHAT_CREATE**: Quyền này kiểm soát việc hiển thị biểu tượng chat trên danh sách YCBG, YCDH và ĐHM. Nếu không có quyền này, biểu tượng chat ẩn. Đơn hàng nguồn **"Mua ngoài"** (DIRECT) không hiển thị biểu tượng chat.

---

## §5 Validation Rules

### 5.1 Yêu cầu báo giá (QR)

| Trường | Rule | Error Message | Features |
|---|---|---|---|
| Hãng xe | Bắt buộc | **"Hãng xe là trường bắt buộc"** | FEAT-QR-CREATE |
| Dòng xe | Bắt buộc; phụ thuộc hãng xe đã chọn | **"Dòng xe là trường bắt buộc"** | FEAT-QR-CREATE |
| Biển số xe | Định dạng: 30A12345 | **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"** | FEAT-QR-CREATE |
| Hình ảnh xe | Tối đa 3 ảnh | *(chưa có error message cụ thể trong KG — cần bổ sung)* | FEAT-QR-CREATE |
| Tên phụ tùng | Bắt buộc | **"Vui lòng nhập Tên phụ tùng"** | FEAT-QR-CREATE |
| Phụ tùng trùng tên | Không cho phép | **"Không được tạo phụ tùng giống nhau trong một yêu cầu báo giá"** | FEAT-QR-CREATE |
| File import | Chỉ Excel, tối đa 30MB | **"Định dạng file không hợp lệ. Vui lòng upload file Excel."** / **"Dung lượng file quá 30MB. Vui lòng chọn file nhỏ hơn."** | FEAT-QR-CREATE |
| Tên công ty (khi yêu cầu hóa đơn) | Bắt buộc, max 255 ký tự | **"Vui lòng nhập tên công ty."** | FEAT-QR-CREATE |
| Mã số thuế (khi yêu cầu hóa đơn) | Bắt buộc, max 50 ký tự | **"Vui lòng nhập mã số thuế."** | FEAT-QR-CREATE |
| Email công ty (khi yêu cầu hóa đơn) | Không bắt buộc, max 255 ký tự, đúng format | **"Email công ty không đúng định dạng."** | FEAT-QR-CREATE |
| Địa chỉ (khi yêu cầu hóa đơn) | Bắt buộc, max 255 ký tự | **"Vui lòng nhập địa chỉ."** | FEAT-QR-CREATE |
| Danh sách phụ tùng | Ít nhất 1 phụ tùng | *(hệ thống yêu cầu ít nhất 1 phụ tùng trước khi tạo)* | FEAT-QR-CREATE |

### 5.2 Yêu cầu đặt hàng (PR)

| Trường | Rule | Error Message | Features |
|---|---|---|---|
| Phụ tùng đã chọn | Ít nhất 1 phụ tùng từ báo giá | *(implicit — không thể gửi mà không chọn phụ tùng)* | FEAT-PR-CREATE |
| Phương thức thanh toán | Bắt buộc khi thanh toán | **"Hình thức thanh toán này tạm thời không hỗ trợ. Vui lòng đặt lại đơn hàng và chọn hình thức thanh toán khác!"** | FEAT-PR-CREATE |
| Thời gian thanh toán QR | Có timeout | **"Giao dịch đã quá thời gian chờ thanh toán. Quý khách vui lòng tạo lại mã QR."** | FEAT-PR-CREATE |

### 5.3 Đơn hàng mua (PO)

| Trường | Rule | Error Message | Features |
|---|---|---|---|
| Nhà cung cấp | Bắt buộc | **"Nhà cung cấp là bắt buộc"** | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Trạng thái đơn hàng | Bắt buộc | **"Trạng thái đơn hàng là bắt buộc"** | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Mức ưu tiên | Bắt buộc | **"Mức ưu tiên là bắt buộc"** | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Ngày giao dự kiến | Bắt buộc, >= ngày hiện tại | **"Ngày giao dự kiến là bắt buộc"** / **"Ngày giao dự kiến không được nhỏ hơn ngày hiện tại"** | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Đơn giá phụ tùng | Bắt buộc, >= 0 | **"Vui lòng nhập đơn giá"** | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Số lượng phụ tùng | > 0 | *(implicit — quantity phải lớn hơn 0)* | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Chiết khấu phụ tùng | >= 0 và <= 100% | *(implicit — validated client-side)* | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Danh sách phụ tùng | Ít nhất 1 phụ tùng | **"Đơn hàng phải có ít nhất một phụ tùng"** | FEAT-PO-CREATE, FEAT-PO-EDIT |
| Lý do hủy đơn | Bắt buộc khi hủy | **"Vui lòng nhập lý do hủy đơn"** | FEAT-PO-DETAIL |
| Lý do hoàn hàng | Bắt buộc khi hoàn hàng | **"Vui lòng nhập lý do hoàn hàng"** | FEAT-PO-DETAIL |
| Tên sản phẩm mới | Bắt buộc khi tạo nhanh | **"Tên sản phẩm không được để trống"** | FEAT-PO-CREATE |
| Đơn vị sản phẩm mới | Bắt buộc khi tạo nhanh | **"Đơn vị không được để trống"** | FEAT-PO-CREATE |

### 5.4 Nhà cung cấp (SUP)

| Trường | Rule | Error Message | Features |
|---|---|---|---|
| Tên nhà cung cấp | Bắt buộc | **"Vui lòng nhập tên nhà cung cấp."** | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |
| Số điện thoại | Bắt buộc (nguồn Garage), đúng định dạng, unique theo garage | **"Vui lòng nhập số điện thoại nhà cung cấp."** / **"Số điện thoại không đúng định dạng."** / *(lỗi trùng số điện thoại)* | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |
| Mã nhà cung cấp | Không chỉnh sửa sau khi tạo; unique theo garage | *(lỗi trùng mã)* | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |
| Điều khoản thanh toán | Chỉ chấp nhận 6 giá trị định trước | *(validated client-side qua dropdown)* | FEAT-CAT-SUP-CREATE, FEAT-CAT-SUP-EDIT |

---

## §6 Dependency Rules

| ID | Rule | Direction | Boundaries | Impact |
|---|---|---|---|---|
| BR-DEP-001 | Yêu cầu báo giá có thể tham chiếu phiếu dịch vụ từ gf-sales. | Upstream | gf-sales -> gf-purchase | Nếu phiếu dịch vụ bị xóa/hủy, YCBG vẫn giữ reference code (không cascade). |
| BR-DEP-002 | Yêu cầu đặt hàng liên kết với yêu cầu báo giá. Mỗi YCDH thuộc 1 YCBG. | Internal | gf-purchase | YCBG phải ở trạng thái cho phép (không phải ORDER_CONFIRMING/CANCELLED/CLOSED). |
| BR-DEP-003 | Đơn hàng mua có thể được tạo từ YCDH (1 YCDH -> nhiều PO theo NCC) hoặc tạo trực tiếp (DIRECT). | Internal | gf-purchase | PO nguồn DIRECT không liên kết YCBG/YCDH. PO nguồn QUOTATION_ASK liên kết qua pr_id và quotation_ask_code. |
| BR-DEP-004 | Đơn hàng mua hoàn thành giao hàng -> sinh phiếu nhập kho tự động. | Downstream | gf-purchase -> gf-inventory-worker -> gf-inventory | Chỉ áp dụng source=DIRECT, stage=DELIVERING, feature flag Inventory bật. |
| BR-DEP-005 | Nhà cung cấp được tham chiếu khi tạo/chỉnh sửa đơn hàng mua. | Internal | gf-purchase | NCC phải tồn tại và thuộc cùng garage. Thông tin NCC snapshot vào đơn hàng tại thời điểm tạo. |
| BR-DEP-006 | Kho ưu tiên nhận hàng của NCC tham chiếu danh mục kho từ gf-inventory. | Upstream | gf-inventory -> gf-purchase | Nếu kho bị xóa, NCC vẫn giữ reference code cũ (không cascade). |
| BR-DEP-007 | Nhà xe liên kết được tham chiếu khi tạo YCDH và ĐHM nguồn "Nền tảng". | Upstream | gf-system -> gf-purchase | Nhà xe phải tồn tại và đang hoạt động trong gf-system. |
| BR-DEP-008 | Danh mục phụ tùng (gf-erp-mdm) được dùng khi tìm kiếm phụ tùng trong ĐHM mua ngoài. | Upstream | gf-erp-mdm -> gf-purchase | Phụ tùng mới có thể tạo nhanh từ form ĐHM (CreateProducts mutation). |
| BR-DEP-009 | Đồng bộ nhà cung cấp nguồn CarDoctor từ hệ thống bên ngoài qua gf-erp-agent. | Upstream | gf-erp-agent -> gf-purchase | NCC CarDoctor có tập trường giới hạn chỉnh sửa; contact_phone bị ẩn. |

---

## §7 Phân tích & Đề xuất

### 7.1 Conflict / Overlap detected

| ID | Mô tả | Mức độ | Features liên quan |
|---|---|---|---|
| CONFLICT-001 | **Trạng thái YCDH trên list vs EP lifecycle:** FEAT-PR-LIST (AC-2) liệt kê 6 trạng thái hiển thị: "Chờ xác nhận", "Chờ thanh toán", "Chờ tạo đơn", "Đã tạo đơn", "Thiếu hàng", "Đã hủy". Tuy nhiên EP-PROCUREMENT §3.2 chỉ mô tả 2 trạng thái chính (OPEN -> ORDER_CREATED / CANCELLED). Các trạng thái "Chờ thanh toán", "Chờ tạo đơn", "Thiếu hàng" chưa được map rõ ràng với backend enum trong EP. | MEDIUM | FEAT-PR-LIST, EP-PROCUREMENT |
| CONFLICT-002 | **PO create cho phép chọn trạng thái bất kỳ:** FEAT-PO-CREATE AC-6 cho phép chọn trạng thái khi tạo đơn (bao gồm "Đã giao hàng", "Hoàn thành", "Đã hủy"). Điều này mâu thuẫn với lifecycle thông thường (tạo đơn = "Chờ xác nhận"). Đây là đặc thù của đơn "Mua ngoài" — garage có thể nhập hồi tố đơn hàng cũ với trạng thái bất kỳ. Cần xác nhận với Business Authority. | LOW | FEAT-PO-CREATE |

### 7.2 Missing rules

| ID | Mô tả | Mức độ | Đề xuất |
|---|---|---|---|
| MISSING-001 | **YCBG: không có rule giới hạn số lượng phụ tùng tối đa** trong một yêu cầu báo giá. Có thể ảnh hưởng hiệu năng khi garage thêm hàng trăm phụ tùng. | LOW | Xác định giới hạn (ví dụ: tối đa 200 phụ tùng). |
| MISSING-002 | **YCDH: không rõ điều kiện hủy chi tiết.** BR-PO-028 (từ EP) nói "hủy YCDH chỉ hợp lệ khi tất cả ĐHM liên quan còn ở Chờ xác nhận", nhưng FEAT-PR-DETAIL AC-8 chỉ nói "hủy" mà không validate trạng thái ĐHM con. Cần bổ sung rule rõ ràng vào FEAT-PR-DETAIL. | MEDIUM | Bổ sung BR vào FEAT-PR-DETAIL kiểm tra trạng thái ĐHM liên quan trước khi hủy YCDH. |
| MISSING-003 | **ĐHM: không rõ ràng trạng thái nào cho phép chỉnh sửa.** BR-PO-014 chỉ cấm "Hoàn thành", "Đã hủy", "Hoàn hàng". Nhưng "Đang giao hàng" có cho phép chỉnh sửa không? FEAT-PO-EDIT không nói rõ. | MEDIUM | Xác nhận với Business Authority: đơn hàng "Đang giao hàng" có được phép chỉnh sửa không. |
| MISSING-004 | **ĐHM: không có rule giới hạn số lượng file đính kèm.** FEAT-PO-DETAIL AC-6 mô tả tài liệu đính kèm nhưng không có giới hạn số lượng hoặc dung lượng. | LOW | Xác định giới hạn file đính kèm (số lượng, dung lượng tối đa). |
| MISSING-005 | **NCC: không có validation độ dài tên nhà cung cấp và địa chỉ.** Thông thường cần giới hạn độ dài để tránh lỗi database. | LOW | Bổ sung max length cho tên NCC (200 ký tự theo KG entity), địa chỉ. |
| MISSING-006 | **YCBG: không có rule thời gian hết hạn.** Yêu cầu báo giá không có thời hạn — có thể tồn tại vĩnh viễn ở trạng thái "Đã gửi yêu cầu" mà không bị tự động hủy. | LOW | Cần thảo luận với Business Authority về chính sách hết hạn YCBG. |
| MISSING-007 | **ĐHM: không mô tả validation khi chuyển từ "Đang giao hàng" -> "Hoàn thành".** Liệu có cần xác nhận số lượng nhận thực tế vs đặt hàng không? | MEDIUM | Xác nhận với Business Authority quy trình xác nhận nhận hàng. |
| MISSING-008 | **YCDH: các trạng thái "Chờ thanh toán", "Chờ tạo đơn", "Thiếu hàng" chưa có backend enum mapping rõ ràng.** EP-PROCUREMENT §3.2 chỉ có OPEN, ORDER_CREATED, CANCELLED. | MEDIUM | Bổ sung backend enum mapping cho các trạng thái trung gian của YCDH. |

### 7.3 Đề xuất cải tiến

| ID | Đề xuất | Lý do | Priority |
|---|---|---|---|
| SUGGEST-001 | **Thêm tính năng hủy YCBG từ màn hình chi tiết.** Hiện tại FEAT-QR-DETAIL không mô tả nút hủy rõ ràng — chỉ có nhân bản, thay đổi nhà xe, gửi YCDH. EP lifecycle cho phép hủy ở "Đã gửi yêu cầu" và "Đã có báo giá". | Cần làm rõ hành động hủy YCBG trên giao diện. | MEDIUM |
| SUGGEST-002 | **Chuẩn hóa trạng thái YCDH giữa EP và FEAT.** Hiện tại EP chỉ mô tả 2 trạng thái chính (OPEN, ORDER_CREATED) nhưng FEAT-PR-LIST có 6 trạng thái. Cần cập nhật EP-PROCUREMENT §3.2 để phản ánh đầy đủ. | Tránh nhầm lẫn giữa EP và FEAT. | HIGH |
| SUGGEST-003 | **Bổ sung error message cho giới hạn hình ảnh xe (max 3 ảnh).** Hiện tại BR-QR-011 có rule nhưng FEAT không có error message cụ thể khi vượt quá 3 ảnh. | Đảm bảo UX nhất quán. | LOW |
| SUGGEST-004 | **Thêm audit trail cho chỉnh sửa đơn hàng mua ngoài.** FEAT-PO-DETAIL có lịch sử ghi nhận cho chuyển trạng thái nhưng không rõ có log thay đổi nội dung (thêm/xóa phụ tùng, đổi NCC, đổi mức ưu tiên). | Hỗ trợ truy vết thay đổi. | MEDIUM |

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khởi tạo BR-GF-PURCHASE từ 2 EP (EP-PROCUREMENT v3, EP-CATALOG v3) và 13 FEAT (QR-LIST/CREATE/DETAIL, PR-LIST/CREATE/DETAIL, PO-LIST/CREATE/DETAIL/EDIT, CAT-SUP-LIST/CREATE/EDIT) kết hợp KG gf-purchase v4. Tổng: 20 BR cho QR, 16 BR cho PR, 28 BR cho PO, 16 BR cho SUP. 9 cross-boundary rules, 9 dependency rules. Phân tích: 2 conflict, 8 missing rules, 4 đề xuất cải tiến. | Business Authority |
