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

# FEAT-QR-LIST: Danh sách yêu cầu báo giá

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-QR-LIST` |
| Title | Danh sách yêu cầu báo giá |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách yêu cầu báo giá phụ tùng với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý và theo dõi các yêu cầu báo giá gửi tới nhà cung cấp.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách yêu cầu báo giá
  - Tại: menu hệ thống, mục quản lý mua hàng.
  - Khi: chủ garage truy cập chức năng yêu cầu báo giá.
  - Thì: hệ thống hiển thị màn hình **"Danh sách yêu cầu báo giá"** với mô tả **"Quản lý và xem chi tiết các yêu cầu báo giá của bạn."**. Bảng dữ liệu gồm các cột: **"Mã YCBG"**, **"Ngày tạo"**, **"Trạng thái đơn"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Tìm kiếm yêu cầu báo giá theo từ khóa
  - Tại: màn hình Danh sách yêu cầu báo giá, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã yêu cầu báo giá hoặc biển số xe. Placeholder: **"Tìm kiếm theo mã YCBG, biển số xe"**. Kết quả được cập nhật tự động.

- [ ] **AC-3**: Lọc danh sách yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá, khu vực bộ lọc.
  - Khi: chủ garage chọn điều kiện lọc.
  - Thì: hệ thống hỗ trợ lọc theo các tiêu chí: **"Trạng thái"**, **"Ngày tạo"**. Kết quả cập nhật tự động khi thay đổi bộ lọc.

- [ ] **AC-4**: Phân trang danh sách
  - Tại: màn hình Danh sách yêu cầu báo giá, cuối bảng dữ liệu.
  - Khi: danh sách vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-5**: Nhấn vào dòng để xem chi tiết yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng yêu cầu báo giá.
  - Thì: hệ thống chuyển sang màn hình Chi tiết yêu cầu báo giá tương ứng (xem `FEAT-QR-DETAIL`).

- [ ] **AC-6**: Nút thêm mới yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Thêm mới yêu cầu báo giá"**.
  - Thì: hệ thống chuyển sang màn hình tạo yêu cầu báo giá mới (xem `FEAT-QR-CREATE`).

- [ ] **AC-7**: Xem báo giá sơ bộ từ cột Thao tác
  - Tại: màn hình Danh sách yêu cầu báo giá, cột **"Thao tác"**.
  - Khi: chủ garage nhấn biểu tượng xem báo giá sơ bộ trên dòng yêu cầu có báo giá sơ bộ.
  - Thì: hệ thống hiển thị modal **"Thông tin báo giá sơ bộ"** với mô tả **"Báo giá sơ bộ được ước tính nhằm hỗ trợ tham khảo ban đầu."** Bảng hiển thị: **"Tên phụ tùng"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá sơ bộ"** và ghi chú (nếu có). Nút **"Đóng"** để đóng modal.

- [ ] **AC-8**: Nút chat hỗ trợ yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá, cột **"Thao tác"**.
  - Khi: chủ garage nhấn biểu tượng chat trên dòng yêu cầu báo giá.
  - Thì: hệ thống mở cửa sổ chat hỗ trợ cho yêu cầu báo giá đó, cho phép garage trao đổi trực tiếp với đội hỗ trợ / nhà cung cấp.
  - Khi: người dùng không có quyền `PURCHASE_CHAT_CREATE`.
  - Thì: biểu tượng chat không hiển thị.

- [ ] **AC-9**: Danh sách trống
  - Tại: màn hình Danh sách yêu cầu báo giá.
  - Khi: không có yêu cầu nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-10**: Phân quyền xem danh sách yêu cầu báo giá
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách yêu cầu báo giá, tìm kiếm, lọc, xem báo giá sơ bộ và điều hướng sang chi tiết hoặc tạo mới. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Danh sách yêu cầu báo giá: Query `SearchQuotationAsksForWeb`
- Báo giá sơ bộ: Query `GetPreliminaryQuotation`

## 5. Business Rules

- **BR-QR-LST-001**: Danh sách yêu cầu báo giá luôn được phạm vi theo garage hiện tại — không hiển thị yêu cầu của garage khác.
- **BR-QR-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã yêu cầu báo giá và biển số xe.
- **BR-QR-LST-003**: Báo giá sơ bộ chỉ mang tính tham khảo — không phải giá chính thức từ nhà cung cấp.
- **BR-QR-LST-004**: Biểu tượng xem báo giá sơ bộ chỉ hiển thị khi yêu cầu đã có báo giá sơ bộ.

## 6. Edge Cases

- **EC-1**: Garage chưa có yêu cầu báo giá nào — hiển thị thông báo danh sách trống.
- **EC-2**: Yêu cầu báo giá chưa có biển số xe — cột **"Biển số xe"** hiển thị trống.
- **EC-3**: Yêu cầu báo giá chưa có báo giá sơ bộ — không hiển thị biểu tượng xem báo giá trong cột **"Thao tác"**.

## 7. Out of Scope

- Chi tiết yêu cầu báo giá → xem `FEAT-QR-DETAIL`.
- Tạo yêu cầu báo giá → xem `FEAT-QR-CREATE`.
- Danh sách đơn hàng → xem `FEAT-PO-LIST`.
- Danh sách yêu cầu mua hàng → xem `FEAT-PR-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (quotation-requests list screen, SearchQuotationAsksForWeb, GetPreliminaryQuotation, preliminary-modal) |
| 2026-05-20 | 2 | Business Authority | Bổ sung AC-8: nút chat hỗ trợ YCBG trong cột Thao tác (quyền PURCHASE_CHAT_CREATE). Đánh lại số AC-9/AC-10. |
