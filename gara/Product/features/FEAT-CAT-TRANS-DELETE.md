---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-CATALOG"
boundary: "gf-system"
last_reviewed: "2026-05-27"
---

# FEAT-CAT-TRANS-DELETE: Xóa nhà xe liên kết

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-TRANS-DELETE` |
| Title | Xóa nhà xe liên kết |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-system` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa nhà xe liên kết không còn sử dụng, **so that** danh sách nhà xe liên kết luôn sạch sẽ và chính xác.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Xác nhận và xóa nhà xe liên kết

- [ ] **AC-1**: Mở dialog xác nhận xóa từ danh sách
  - Tại: màn hình Danh sách nhà xe liên kết, icon xóa trên dòng nhà xe liên kết.
  - Khi: chủ garage nhấn icon xóa.
  - Thì: hệ thống hiển thị dialog xác nhận với tiêu đề **"Xác nhận xóa nhà xe liên kết"** và nội dung **"Bạn có chắc chắn muốn xóa bản ghi {transporterName} không?"** (trong đó {transporterName} là tên nhà xe liên kết). Dialog có hai nút: **"Đóng"** (đóng dialog, quay lại danh sách) và **"Xác nhận"** (tiến hành xóa).

- [ ] **AC-2**: Mở dialog xác nhận xóa từ chi tiết
  - Tại: màn hình Chi tiết nhà xe liên kết, nút **"Xóa"**.
  - Khi: chủ garage nhấn nút **"Xóa"**.
  - Thì: hệ thống hiển thị dialog xác nhận với tiêu đề **"Xác nhận xóa nhà xe liên kết"** và nội dung **"Bạn có chắc chắn muốn xóa bản ghi {transporterName} không?"** (trong đó {transporterName} là tên nhà xe liên kết). Dialog có hai nút: **"Đóng"** (đóng dialog, quay lại chi tiết) và **"Xác nhận"** (tiến hành xóa).

- [ ] **AC-3**: Xóa nhà xe liên kết thành công
  - Tại: dialog xác nhận xóa nhà xe liên kết.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xóa thành công.
  - Thì: hệ thống hiển thị toast với mô tả **"Xóa thông tin nhà xe liên kết thành công."**. Bản ghi nhà xe liên kết bị xóa hoàn toàn khỏi hệ thống. Nếu xóa từ danh sách, danh sách được cập nhật lại (bản ghi biến mất). Nếu xóa từ chi tiết, hệ thống chuyển về màn hình Danh sách nhà xe liên kết.

- [ ] **AC-4**: Đóng dialog không xóa
  - Tại: dialog xác nhận xóa nhà xe liên kết.
  - Khi: chủ garage nhấn nút **"Đóng"**.
  - Thì: hệ thống đóng dialog xác nhận. Bản ghi nhà xe liên kết không bị xóa. Màn hình trở lại trạng thái trước khi mở dialog.

### Nhóm B — Xử lý khi có dữ liệu tham chiếu

- [ ] **AC-5**: Không thể xóa do có dữ liệu tham chiếu
  - Tại: dialog xác nhận xóa nhà xe liên kết.
  - Khi: chủ garage nhấn nút **"Xác nhận"** nhưng nhà xe liên kết đang có dữ liệu liên quan sử dụng (Yêu cầu đặt hàng hoặc Đơn hàng mua).
  - Thì: hệ thống hiển thị dialog thông báo với tiêu đề **"Không thể xóa bản ghi nhà xe liên kết"** và nội dung **"Không thể xóa thông tin liên kết nhà xe vì đang có dữ liệu liên quan sử dụng thông tin này."**. Dialog hiển thị mục **"Dữ liệu tham chiếu"** liệt kê loại dữ liệu đang tham chiếu: **"Yêu cầu đặt hàng"** và/hoặc **"Đơn hàng mua"**.

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền xóa nhà xe liên kết
  - Tại: màn hình Danh sách nhà xe liên kết hoặc Chi tiết nhà xe liên kết.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy icon xóa / nút **"Xóa"** và có quyền xóa nhà xe liên kết. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-7**: Xóa nhà xe liên kết thất bại do lỗi hệ thống
  - Tại: dialog xác nhận xóa nhà xe liên kết.
  - Khi: hệ thống xóa nhà xe liên kết thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với mô tả **"Không thể xóa thông tin nhà xe liên kết. Vui lòng thử lại sau."**. Bản ghi nhà xe liên kết không bị xóa.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-system` (qua BFF `agg-garage-graph`)
- Kiểm tra dữ liệu tham chiếu: Query `GetTenantTransporterRegistryReferences`
- Xóa nhà xe liên kết: Mutation `DeleteTenantTransporterRegistry`

## 5. Business Rules

- **BR-CAT-TRANS-DEL-001**: Xóa nhà xe liên kết là xóa hoàn toàn bản ghi khỏi hệ thống — không phải vô hiệu hóa (soft delete).
- **BR-CAT-TRANS-DEL-002**: Hệ thống không cho phép xóa nhà xe liên kết khi có dữ liệu liên quan đang sử dụng (Yêu cầu đặt hàng hoặc Đơn hàng mua đang tham chiếu).
- **BR-CAT-TRANS-DEL-003**: Trước khi xóa, hệ thống bắt buộc hiển thị dialog xác nhận để tránh xóa nhầm.

## 6. Edge Cases

- **EC-1**: Nhà xe liên kết đã bị xóa bởi người dùng khác — hệ thống báo lỗi khi thực hiện xóa.
- **EC-2**: Nhà xe liên kết có cả Yêu cầu đặt hàng và Đơn hàng mua đang tham chiếu — dialog hiển thị đầy đủ cả hai loại dữ liệu tham chiếu.

## 7. Out of Scope

- Danh sách nhà xe liên kết → xem `FEAT-CAT-TRANS-LIST`.
- Tạo nhà xe liên kết mới → xem `FEAT-CAT-TRANS-CREATE`.
- Chỉnh sửa nhà xe liên kết → xem `FEAT-CAT-TRANS-EDIT`.
- Quản lý nhà cung cấp, danh mục dịch vụ, hàng hóa → thuộc các FEAT khác trong `EP-CATALOG`.
- Báo giá, mua hàng và theo dõi đơn hàng → xem `EP-PROCUREMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-system + garage-web (linked-transporters list + detail screens, DeleteTenantTransporterRegistry mutation, GetTenantTransporterRegistryReferences query) |
| 2026-05-20 | 2 | Business Authority | Đổi tên "nhà vận chuyển" → "nhà xe liên kết" toàn bộ file (tiêu đề, metadata, user story). |
