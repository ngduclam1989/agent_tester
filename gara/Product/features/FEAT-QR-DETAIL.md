---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-PROCUREMENT"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-QR-DETAIL: Chi tiết yêu cầu báo giá

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-QR-DETAIL` |
| Title | Chi tiết yêu cầu báo giá |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết yêu cầu báo giá bao gồm thông tin chung, thông tin xe, phụ tùng cần báo giá, báo giá từ nhà cung cấp, hóa đơn và lịch sử cập nhật, **so that** tôi có thể đánh giá báo giá và quyết định đặt hàng.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá.
  - Khi: chủ garage nhấn vào dòng yêu cầu báo giá trong bảng.
  - Thì: hệ thống chuyển sang màn hình chi tiết yêu cầu báo giá gồm các mục: **"Thông tin chung"**, **"Thông tin xe"**, **"Thông tin phụ tùng cần báo giá"**, **"Yêu cầu xuất hóa đơn"**, **"Lịch sử cập nhật"**.

- [ ] **AC-2**: Hiển thị mục Thông tin chung
  - Tại: màn hình Chi tiết yêu cầu báo giá, mục **"Thông tin chung"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: trạng thái yêu cầu, **"Phiếu dịch vụ liên kết"**, **"Mã yêu cầu đặt hàng liên kết"**, **"Ngày tạo"**, **"Ngày cập nhật"**, **"Yêu cầu xuất hóa đơn"** (hiển thị **"Có"** hoặc **"Không"**).

- [ ] **AC-3**: Hiển thị mục Thông tin xe
  - Tại: màn hình Chi tiết yêu cầu báo giá, mục **"Thông tin xe"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Hãng xe"**, **"Dòng xe"**, **"Loại xe"**, **"Năm sản xuất"**, **"Phiên bản xe"**, **"Số khung xe (Số VIN)"**, **"Biển số xe"**, **"Công ty bảo hiểm"**, **"Ghi chú"**, **"Hình ảnh xe"**.

- [ ] **AC-4**: Hiển thị bảng Thông tin phụ tùng cần báo giá
  - Tại: màn hình Chi tiết yêu cầu báo giá, mục **"Thông tin phụ tùng cần báo giá"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị bảng phụ tùng với các cột: **"Tên phụ tùng"**, **"Đơn vị tính"**, **"Số lượng"**, **"Ảnh (Tối đa 3 ảnh)"**. Nếu chưa có dữ liệu, hiển thị **"Không có dữ liệu"**.

- [ ] **AC-5**: Hiển thị mục Yêu cầu xuất hóa đơn
  - Tại: màn hình Chi tiết yêu cầu báo giá, mục **"Yêu cầu xuất hóa đơn"**.
  - Khi: yêu cầu có đánh dấu xuất hóa đơn.
  - Thì: hiển thị: **"Tên công ty"**, **"Mã số thuế"**, **"Email công ty"**, **"Địa chỉ"**.
  - Khi: yêu cầu không đánh dấu xuất hóa đơn.
  - Thì: hiển thị badge **"Không yêu cầu xuất hóa đơn"**.

- [ ] **AC-6**: Hiển thị mục Lịch sử cập nhật
  - Tại: màn hình Chi tiết yêu cầu báo giá, mục **"Lịch sử cập nhật"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị danh sách lịch sử cập nhật theo thời gian. Các loại cập nhật bao gồm: báo giá chi tiết (giá hàng hóa, giá dịch vụ), báo giá tổng dự tính, thay đổi phụ tùng (tên, số lượng, đơn vị). Nguồn cập nhật: **"từ nhà cung cấp"** hoặc **"từ CSKH CarDoctor"**.

### Nhóm B — Nút hành động

- [ ] **AC-7**: Chọn phụ tùng để đặt hàng
  - Tại: màn hình Chi tiết yêu cầu báo giá, khi có báo giá từ nhà cung cấp.
  - Khi: chủ garage chọn phụ tùng từ báo giá.
  - Thì: hệ thống hiển thị bảng chọn phụ tùng với thông tin: **"Tên phụ tùng"**, **"Đơn vị tính"**, **"Phân khúc"**, **"Số lượng"**, **"Giá"**. Phụ tùng có **"Giá tốt nhất!"** được đánh dấu. Placeholder chọn phụ tùng đi kèm: **"Chọn phụ tùng đi kèm"**. Phụ tùng hết hàng hiển thị **"Hết hàng"**.

- [ ] **AC-8**: Gửi yêu cầu đặt hàng
  - Tại: màn hình Chi tiết yêu cầu báo giá.
  - Khi: chủ garage nhấn nút **"Gửi yêu cầu đặt hàng"** sau khi chọn phụ tùng.
  - Thì: hệ thống chuyển sang luồng xác nhận đặt hàng (xem `FEAT-PR-CREATE`).

- [ ] **AC-9**: Nhân bản yêu cầu báo giá
  - Tại: màn hình Chi tiết yêu cầu báo giá, nút **"Nhân bản"**.
  - Khi: chủ garage nhấn nút nhân bản.
  - Thì: hệ thống hiển thị 3 tùy chọn: **"Nhân bản toàn bộ"**, **"Chỉ nhân bản thông tin phụ tùng"**, **"Chỉ nhân bản thông tin xe"**. Khi chọn, chuyển sang form tạo yêu cầu báo giá mới với dữ liệu được sao chép tương ứng.

- [ ] **AC-10**: Thay đổi nhà xe liên kết
  - Tại: màn hình Chi tiết yêu cầu báo giá, mục nhà xe.
  - Khi: chủ garage nhấn **"Thay đổi nhà xe liên kết"**.
  - Thì: hệ thống hiển thị modal với các trường: **"Nhà xe"** (placeholder: **"Chọn nhà xe"**), **"Địa chỉ"** (placeholder: **"Nhập địa chỉ"**), **"Số điện thoại"** (placeholder: **"Nhập số điện thoại"**), **"Thời gian xe chạy"** (placeholder: **"Nhập thời gian xe chạy"**). Hai nút **"Hủy"** / **"Xác nhận"**.

- [ ] **AC-11**: Nút hỗ trợ
  - Tại: màn hình Chi tiết yêu cầu báo giá.
  - Khi: chủ garage nhấn nút **"Hỗ trợ"**.
  - Thì: hệ thống mở chat hỗ trợ cho yêu cầu báo giá đó.

### Nhóm C — Phân quyền

- [ ] **AC-12**: Phân quyền xem chi tiết và thao tác yêu cầu báo giá
  - Tại: màn hình Chi tiết yêu cầu báo giá.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết, chọn phụ tùng để đặt hàng, nhân bản, thay đổi nhà xe và gửi yêu cầu đặt hàng. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-13**: Tải dữ liệu chi tiết thất bại
  - Tại: màn hình Chi tiết yêu cầu báo giá.
  - Khi: hệ thống không tải được dữ liệu (lỗi mạng hoặc lỗi server).
  - Thì: hệ thống hiển thị thông báo lỗi.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Chi tiết yêu cầu báo giá: Query `QuotationAskV3ByCode`
- Lịch sử cập nhật: Query `QuotationAskHistories`
- Báo giá sơ bộ: Query `GetPreliminaryQuotation`
- Thêm yêu cầu mua hàng: Mutation `AddPurchaseRequestV2`
- Thông tin hóa đơn tenant: Query `QuotationAskTenantInvoiceInfo`

## 5. Business Rules

- **BR-QR-DTL-001**: Thông tin yêu cầu báo giá trên màn hình chi tiết luôn được phạm vi theo garage hiện tại.
- **BR-QR-DTL-002**: Nhà cung cấp cung cấp báo giá chi tiết (giá hàng hóa, giá dịch vụ) cho từng phụ tùng. Phụ tùng có giá tốt nhất được đánh dấu.
- **BR-QR-DTL-003**: Phụ tùng hết hàng không thể chọn để đặt hàng.
- **BR-QR-DTL-004**: Lịch sử cập nhật ghi nhận mọi thay đổi từ nhà cung cấp hoặc CSKH CarDoctor.
- **BR-QR-DTL-005**: Nhân bản yêu cầu báo giá cho phép tái sử dụng thông tin xe và/hoặc phụ tùng cho yêu cầu mới.

## 6. Edge Cases

- **EC-1**: Yêu cầu báo giá chưa có báo giá từ nhà cung cấp — không hiển thị khu vực chọn phụ tùng và nút đặt hàng.
- **EC-2**: Tất cả phụ tùng hết hàng — nút **"Gửi yêu cầu đặt hàng"** không khả dụng.
- **EC-3**: Yêu cầu không đánh dấu xuất hóa đơn — mục hóa đơn hiển thị **"Không yêu cầu xuất hóa đơn"**.
- **EC-4**: Yêu cầu chưa có hình ảnh xe — mục hình ảnh hiển thị trống.

## 7. Out of Scope

- Tạo yêu cầu báo giá → xem `FEAT-QR-CREATE`.
- Danh sách yêu cầu báo giá → xem `FEAT-QR-LIST`.
- Tạo yêu cầu mua hàng (luồng đặt hàng) → xem `FEAT-PR-CREATE`.
- Chi tiết yêu cầu mua hàng → xem `FEAT-PR-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (quotation-requests-code detail screen, QuotationAskV3ByCode, QuotationAskHistories, select spare parts, order confirm, duplicate, change garage) |
