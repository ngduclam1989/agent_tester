---
type: feature
artifact_kind: feature
status: DONE
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-PERIOD"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-IP-VIEW: Theo dõi kho theo kỳ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IP-VIEW` |
| Title | Theo dõi kho theo kỳ |
| Parent Epic | `EP-INVENTORY-PERIOD` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem tồn kho theo kỳ bao gồm số lượng, giá trị tồn kho và lọc theo sản phẩm/kỳ, **so that** tôi nắm được tình hình tồn kho qua các giai đoạn.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình tồn kho theo kỳ
  - Tại: menu hệ thống, mục tồn kho theo kỳ.
  - Khi: chủ garage truy cập chức năng tồn kho theo kỳ.
  - Thì: hệ thống hiển thị màn hình **"Tồn kho theo kỳ"** với bảng dữ liệu gồm các cột: **"Tên phụ tùng"**, **"Mã SKU"**, **"Phân khúc"**, **"Thời gian chốt kỳ"**, **"Tồn đầu kỳ"**, **"Nhập trong kỳ"**, **"Xuất trong kỳ"**, **"Tồn cuối kỳ"**, **"Giá vốn đầu kỳ"**, **"Giá vốn cuối kỳ"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Tìm kiếm theo mã SKU hoặc tên sản phẩm
  - Tại: màn hình Tồn kho theo kỳ, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã SKU hoặc tên sản phẩm. Placeholder: **"Tìm kiếm theo mã SKU, tên sản phẩm"**. Kết quả được cập nhật tự động.

- [ ] **AC-3**: Lọc theo kỳ
  - Tại: màn hình Tồn kho theo kỳ, bộ lọc **"Kỳ"**.
  - Khi: chủ garage chọn giá trị kỳ từ danh sách các kỳ đã có.
  - Thì: hệ thống hiển thị dữ liệu tồn kho tương ứng với kỳ đã chọn. Danh sách kỳ được lấy từ hệ thống (các kỳ đã chốt và kỳ đang mở).

- [ ] **AC-4**: Lọc theo sản phẩm
  - Tại: màn hình Tồn kho theo kỳ, bộ lọc sản phẩm.
  - Khi: chủ garage chọn sản phẩm từ danh sách bộ lọc sản phẩm.
  - Thì: hệ thống hiển thị dữ liệu tồn kho chỉ cho sản phẩm đã chọn. Danh sách sản phẩm trong bộ lọc hỗ trợ tìm kiếm theo từ khóa.

- [ ] **AC-5**: Phân trang danh sách
  - Tại: màn hình Tồn kho theo kỳ, cuối bảng dữ liệu.
  - Khi: danh sách vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

### Nhóm B — Hiển thị chi tiết dòng tồn kho

- [ ] **AC-6**: Xem chi tiết tồn kho theo kỳ
  - Tại: màn hình Tồn kho theo kỳ, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng tồn kho.
  - Thì: hệ thống hiển thị chi tiết tồn kho theo kỳ của sản phẩm đó, bao gồm: tên phụ tùng, mã SKU, phân khúc, tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ, giá vốn đầu kỳ, giá vốn cuối kỳ và thời gian chốt kỳ.

### Nhóm C — Phân quyền

- [ ] **AC-7**: Phân quyền xem tồn kho theo kỳ
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem tồn kho theo kỳ, tìm kiếm, lọc và xem chi tiết. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Trạng thái trống và lỗi

- [ ] **AC-8**: Danh sách trống
  - Tại: màn hình Tồn kho theo kỳ.
  - Khi: không có dữ liệu tồn kho nào trong hệ thống hoặc không có dữ liệu phù hợp với điều kiện tìm kiếm/lọc.
  - Thì: hệ thống hiển thị bảng trống, không có dòng dữ liệu.

- [ ] **AC-9**: Chưa có kỳ nào được chốt
  - Tại: màn hình Tồn kho theo kỳ.
  - Khi: garage chưa thực hiện chốt kỳ lần nào.
  - Thì: hệ thống hiển thị dữ liệu kỳ đang mở hiện tại (nếu có). Bộ lọc kỳ chỉ chứa kỳ đang mở.

## 3. UI/UX Reference

> Xem [UX-FLOW-INVENTORY-COUNT](../ux/UX-FLOW-INVENTORY-COUNT.md) — luồng tồn kho theo kỳ (view-only).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Danh sách tồn kho theo kỳ: Query `SearchPeriodStocks`
- Chi tiết tồn kho theo kỳ: Query `getPeriodStockById`
- Bộ lọc sản phẩm: Query `getPeriodStockFilterProducts`
- Bộ lọc kỳ: Query `getPeriodStockFilterPeriods`

## 5. Business Rules

- **BR-IP-VW-001**: Dữ liệu tồn kho theo kỳ luôn được phạm vi theo garage hiện tại — không hiển thị dữ liệu của garage khác.
- **BR-IP-VW-002**: Giá vốn cuối kỳ được tính theo phương pháp bình quân gia quyền (WAC): giá vốn cuối kỳ = (giá vốn đầu kỳ + giá vốn nhập trong kỳ) / (tồn đầu kỳ + nhập trong kỳ).
- **BR-IP-VW-003**: Tồn cuối kỳ = tồn đầu kỳ + nhập trong kỳ - xuất trong kỳ.
- **BR-IP-VW-004**: Mỗi kỳ có trạng thái: đang mở, đã chốt hoặc đã điều chỉnh. Dữ liệu kỳ đã chốt là dữ liệu lịch sử, chỉ đọc.
- **BR-IP-VW-005**: Tìm kiếm từ khóa áp dụng đồng thời cho mã SKU và tên sản phẩm.
- **BR-IP-VW-006**: Bộ lọc kỳ hiển thị danh sách tất cả các kỳ đã có trong hệ thống (bao gồm kỳ đang mở và kỳ đã chốt).
- **BR-IP-VW-007**: Bộ lọc sản phẩm hỗ trợ tìm kiếm theo từ khóa để thu hẹp danh sách sản phẩm.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có giao dịch nhập/xuất kho — tồn kho theo kỳ hiển thị giá trị 0 cho tất cả các cột số lượng và giá vốn.
- **EC-2**: Kết hợp nhiều bộ lọc (kỳ + sản phẩm) và tìm kiếm cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Sản phẩm chỉ có giao dịch nhập mà chưa có giao dịch xuất trong kỳ — cột **"Xuất trong kỳ"** hiển thị giá trị 0.
- **EC-4**: Kỳ đã được điều chỉnh (do hoàn tác phiếu nhập/xuất sau khi chốt kỳ) — dữ liệu hiển thị phản ánh giá trị sau điều chỉnh.

## 7. Out of Scope

- Thực hiện chốt kỳ (đóng kỳ và mở kỳ mới): sẽ thuộc FEAT riêng trong `EP-INVENTORY-PERIOD`.
- Điều chỉnh tồn kho theo kỳ (kiểm kê, set stock): thuộc `EP-INVENTORY-RECEIPT` / `EP-INVENTORY-DELIVERY`.
- Xuất file báo cáo tồn kho theo kỳ: sẽ thuộc FEAT riêng nếu có yêu cầu.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-period screen, SearchPeriodStocks query, period-stock APIs) |
| 2026-05-20 | 2 | Business Authority | Cập nhật §3 UI/UX Reference: thêm liên kết UX-FLOW-INVENTORY-COUNT. |
| 2026-05-21 | 3 | Business Authority | Xóa AC-5 "Lọc theo phân khúc" — KG không có filter param segment trong SearchPeriodStocksInput, "Phân khúc" chỉ là cột hiển thị. Đánh lại AC-5 → AC-9. Cập nhật EC-2. |
| 2026-05-21 | 4 | Business Authority | Bổ sung 3 cột định danh sản phẩm (Tên phụ tùng, Mã SKU, Phân khúc) vào AC-1 danh sách cột và AC-6 chi tiết — theo KG garage-web IInventoryPeriod response fields. |
