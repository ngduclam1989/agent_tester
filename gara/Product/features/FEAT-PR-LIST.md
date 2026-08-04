---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-PROCUREMENT"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-PR-LIST: Danh sách yêu cầu mua hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PR-LIST` |
| Title | Danh sách yêu cầu mua hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách yêu cầu mua hàng (đặt hàng qua nền tảng) với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý và theo dõi tình trạng các yêu cầu đặt hàng trên sàn.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách yêu cầu đặt hàng
  - Tại: menu hệ thống, mục quản lý mua hàng.
  - Khi: chủ garage truy cập chức năng yêu cầu đặt hàng.
  - Thì: hệ thống hiển thị màn hình **"Danh sách yêu cầu đặt hàng"** với mô tả **"Quản lý và xem chi tiết các yêu cầu đặt hàng của bạn."**. Bảng dữ liệu gồm các cột: **"Mã đặt hàng"**, **"Ngày tạo"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Trạng thái yêu cầu đặt hàng"**, **"Trạng thái thanh toán"**, **"Hỗ trợ"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái yêu cầu đặt hàng với badge
  - Tại: màn hình Danh sách yêu cầu đặt hàng, cột **"Trạng thái yêu cầu đặt hàng"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng yêu cầu.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Chờ xác nhận"**
    - **"Chờ thanh toán"**
    - **"Chờ tạo đơn"**
    - **"Đã tạo đơn"**
    - **"Thiếu hàng"**
    - **"Đã hủy"**

- [ ] **AC-3**: Hiển thị trạng thái thanh toán với badge
  - Tại: màn hình Danh sách yêu cầu đặt hàng, cột **"Trạng thái thanh toán"**.
  - Khi: hệ thống hiển thị giá trị trạng thái thanh toán.
  - Thì: trạng thái thanh toán hiển thị dưới dạng badge với các giá trị:
    - **"Chưa thanh toán"**
    - **"Đã thanh toán"**

- [ ] **AC-4**: Tìm kiếm yêu cầu đặt hàng theo từ khóa
  - Tại: màn hình Danh sách yêu cầu đặt hàng, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã yêu cầu đặt hàng. Placeholder: **"Tìm kiếm theo mã yêu cầu đặt hàng"**. Kết quả được cập nhật tự động.

- [ ] **AC-5**: Lọc danh sách yêu cầu đặt hàng
  - Tại: màn hình Danh sách yêu cầu đặt hàng, khu vực bộ lọc.
  - Khi: chủ garage chọn điều kiện lọc.
  - Thì: hệ thống hỗ trợ lọc theo các tiêu chí: **"Trạng thái yêu cầu đặt hàng"**, **"Trạng thái thanh toán"**, **"Ngày tạo"**. Kết quả cập nhật tự động khi thay đổi bộ lọc.

- [ ] **AC-6**: Phân trang danh sách
  - Tại: màn hình Danh sách yêu cầu đặt hàng, cuối bảng dữ liệu.
  - Khi: danh sách vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-7**: Nhấn vào dòng để xem chi tiết yêu cầu đặt hàng
  - Tại: màn hình Danh sách yêu cầu đặt hàng, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng yêu cầu đặt hàng.
  - Thì: hệ thống chuyển sang màn hình Chi tiết yêu cầu mua hàng tương ứng (xem `FEAT-PR-DETAIL`).

- [ ] **AC-8**: Nút chat hỗ trợ yêu cầu đặt hàng
  - Tại: màn hình Danh sách yêu cầu đặt hàng, cột **"Hỗ trợ"**.
  - Khi: chủ garage nhấn biểu tượng chat trên dòng yêu cầu đặt hàng.
  - Thì: hệ thống mở cửa sổ chat hỗ trợ cho yêu cầu đặt hàng đó, cho phép garage trao đổi trực tiếp với đội hỗ trợ / nhà cung cấp.
  - Khi: người dùng không có quyền `PURCHASE_CHAT_CREATE`.
  - Thì: biểu tượng chat không hiển thị.

- [ ] **AC-9**: Danh sách trống
  - Tại: màn hình Danh sách yêu cầu đặt hàng.
  - Khi: không có yêu cầu nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-10**: Phân quyền xem danh sách yêu cầu đặt hàng
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách yêu cầu đặt hàng, tìm kiếm, lọc, và điều hướng sang chi tiết. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Danh sách yêu cầu đặt hàng: Query `SearchPurchaseRequestsForWeb`

## 5. Business Rules

- **BR-PR-LST-001**: Danh sách yêu cầu đặt hàng luôn được phạm vi theo garage hiện tại — không hiển thị yêu cầu của garage khác.
- **BR-PR-LST-002**: Tìm kiếm từ khóa áp dụng cho mã yêu cầu đặt hàng.
- **BR-PR-LST-003**: Trạng thái yêu cầu đặt hàng gồm 6 giá trị: **"Chờ xác nhận"**, **"Chờ thanh toán"**, **"Chờ tạo đơn"**, **"Đã tạo đơn"**, **"Thiếu hàng"**, **"Đã hủy"**.
- **BR-PR-LST-004**: Trạng thái thanh toán gồm 2 giá trị: **"Chưa thanh toán"**, **"Đã thanh toán"**.

## 6. Edge Cases

- **EC-1**: Garage chưa có yêu cầu đặt hàng nào — hiển thị thông báo danh sách trống.
- **EC-2**: Yêu cầu đặt hàng chưa có biển số xe — cột **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"** hiển thị trống.

## 7. Out of Scope

- Chi tiết yêu cầu mua hàng → xem `FEAT-PR-DETAIL`.
- Tạo yêu cầu mua hàng → xem `FEAT-PR-CREATE`.
- Danh sách đơn hàng (mua ngoài) → xem `FEAT-PO-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-requests list screen, SearchPurchaseRequestsForWeb, status enums, filter options) |
| 2026-05-20 | 2 | Business Authority | Bổ sung chi tiết AC-8: nút chat hỗ trợ YCĐH — thêm điều kiện quyền PURCHASE_CHAT_CREATE, mô tả chức năng chat. |
