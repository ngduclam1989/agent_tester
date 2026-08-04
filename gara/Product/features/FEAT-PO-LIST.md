---
type: feature
artifact_kind: feature
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-PROCUREMENT"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-PO-LIST: Danh sách đơn hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PO-LIST` |
| Title | Danh sách đơn hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách đơn hàng mua phụ tùng với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý và theo dõi tình trạng các đơn hàng mua hàng.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách đơn hàng
  - Tại: menu hệ thống, mục quản lý mua hàng.
  - Khi: chủ garage truy cập chức năng quản lý đơn hàng.
  - Thì: hệ thống hiển thị màn hình **"Danh sách đơn hàng"** với mô tả **"Quản lý và xem chi tiết các đơn hàng của bạn."**. Bảng dữ liệu gồm các cột: **"Mã đơn hàng"**, **"Ngày tạo"**, **"Nguồn đơn"**, **"Nhà cung cấp"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Trạng thái đơn"**, **"Trạng thái thanh toán"**, **"Hỗ trợ"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái đơn hàng với badge
  - Tại: màn hình Danh sách đơn hàng, cột **"Trạng thái đơn"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng đơn hàng.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Chờ xác nhận"**
    - **"Chuẩn bị hàng"**
    - **"Đang giao hàng"**
    - **"Hoàn thành"**
    - **"Đã hủy"**
    - **"Hoàn hàng"**

- [ ] **AC-3**: Hiển thị trạng thái thanh toán với badge
  - Tại: màn hình Danh sách đơn hàng, cột **"Trạng thái thanh toán"**.
  - Khi: hệ thống hiển thị giá trị trạng thái thanh toán của từng đơn hàng.
  - Thì: trạng thái thanh toán hiển thị dưới dạng badge với các giá trị:
    - **"Chưa thanh toán"**
    - **"Đã thanh toán"**

- [ ] **AC-4**: Hiển thị nguồn đơn
  - Tại: màn hình Danh sách đơn hàng, cột **"Nguồn đơn"**.
  - Khi: hệ thống hiển thị nguồn đơn của từng đơn hàng.
  - Thì: nguồn đơn hiển thị với các giá trị:
    - **"Mua ngoài"**
    - **"Nền tảng"**

- [ ] **AC-5**: Tìm kiếm đơn hàng theo từ khóa
  - Tại: màn hình Danh sách đơn hàng, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã đơn hàng hoặc biển số xe. Placeholder: **"Tìm kiếm theo mã đơn hàng, biển số xe"**. Kết quả được cập nhật tự động.

- [ ] **AC-6**: Lọc danh sách đơn hàng
  - Tại: màn hình Danh sách đơn hàng, khu vực bộ lọc.
  - Khi: chủ garage chọn điều kiện lọc.
  - Thì: hệ thống hỗ trợ lọc theo các tiêu chí: **"Trạng thái đơn"**, **"Trạng thái thanh toán"**, **"Nguồn đơn"**, **"Ngày tạo"**, **"Nhà cung cấp"**. Kết quả cập nhật tự động khi thay đổi bộ lọc.

- [ ] **AC-7**: Phân trang danh sách
  - Tại: màn hình Danh sách đơn hàng, cuối bảng dữ liệu.
  - Khi: danh sách đơn hàng vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-8**: Nhấn vào dòng để xem chi tiết đơn hàng
  - Tại: màn hình Danh sách đơn hàng, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng đơn hàng.
  - Thì: hệ thống chuyển sang màn hình Chi tiết đơn hàng tương ứng (xem `FEAT-PO-DETAIL`).

- [ ] **AC-9**: Nút tạo đơn hàng mới
  - Tại: màn hình Danh sách đơn hàng, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Tạo đơn hàng mới"**.
  - Thì: hệ thống chuyển sang màn hình tạo đơn hàng mới (xem `FEAT-PO-CREATE`).

- [ ] **AC-10**: Nút chat hỗ trợ đơn hàng
  - Tại: màn hình Danh sách đơn hàng, cột **"Hỗ trợ"**.
  - Khi: chủ garage nhấn biểu tượng chat trên dòng đơn hàng nguồn **"Nền tảng"**.
  - Thì: hệ thống mở cửa sổ chat hỗ trợ cho đơn hàng đó, cho phép garage trao đổi trực tiếp với đội hỗ trợ / nhà cung cấp.
  - Khi: đơn hàng có nguồn **"Mua ngoài"** (DIRECT).
  - Thì: biểu tượng chat không hiển thị (đơn mua ngoài không có kênh chat trên nền tảng).
  - Khi: người dùng không có quyền `PURCHASE_CHAT_CREATE`.
  - Thì: biểu tượng chat không hiển thị.

- [ ] **AC-11**: Danh sách trống
  - Tại: màn hình Danh sách đơn hàng.
  - Khi: không có đơn hàng nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-12**: Phân quyền xem danh sách đơn hàng
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách đơn hàng, tìm kiếm, lọc, và điều hướng sang chi tiết hoặc tạo mới. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Danh sách đơn hàng mua ngoài: Query `SearchDirectPurchaseOrders`
- Danh sách đơn hàng nền tảng: Query `SearchPurchaseOrdersForWeb`
- Danh sách nhà cung cấp cho bộ lọc: Query `SearchSuppliersForFilter`

## 5. Business Rules

- **BR-PO-LST-001**: Danh sách đơn hàng luôn được phạm vi theo garage hiện tại — không hiển thị đơn hàng của garage khác.
- **BR-PO-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã đơn hàng và biển số xe.
- **BR-PO-LST-003**: Trạng thái đơn hàng gồm 6 giá trị: **"Chờ xác nhận"**, **"Chuẩn bị hàng"**, **"Đang giao hàng"**, **"Hoàn thành"**, **"Đã hủy"**, **"Hoàn hàng"**.
- **BR-PO-LST-004**: Trạng thái thanh toán gồm 2 giá trị: **"Chưa thanh toán"**, **"Đã thanh toán"**.
- **BR-PO-LST-005**: Nguồn đơn gồm 2 giá trị: **"Mua ngoài"** (đơn tạo trực tiếp từ garage) và **"Nền tảng"** (đơn từ sàn thương mại điện tử).

## 6. Edge Cases

- **EC-1**: Garage mới chưa có đơn hàng nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và lọc cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Đơn hàng chưa có biển số xe — cột **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"** hiển thị trống.

## 7. Out of Scope

- Chi tiết đơn hàng → xem `FEAT-PO-DETAIL`.
- Tạo đơn hàng mới → xem `FEAT-PO-CREATE`.
- Chỉnh sửa đơn hàng → xem `FEAT-PO-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-orders list screen, SearchDirectPurchaseOrders, SearchPurchaseOrdersForWeb) |
| 2026-05-20 | 2 | Business Authority | Bổ sung AC-10: nút chat hỗ trợ ĐHM trong cột Hỗ trợ (quyền PURCHASE_CHAT_CREATE, ẩn với đơn Mua ngoài/DIRECT). Đánh lại số AC-11/AC-12. |
| 2026-05-20 | 3 | Business Authority | Sửa AC-2 + BR-PO-LST-003: thay "Đã giao hàng" bằng "Hoàn hàng" cho khớp 6 trạng thái UI đã xác nhận (Chờ xác nhận / Chuẩn bị hàng / Đang giao hàng / Hoàn thành / Đã hủy / Hoàn hàng). |
