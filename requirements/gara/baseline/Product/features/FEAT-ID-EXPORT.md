---
type: feature
artifact_kind: feature
status: PLANNED
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-13"
---

# FEAT-ID-EXPORT: Xuất excel danh sách phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-EXPORT` |
| Title | Xuất excel danh sách phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P2 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xuất danh sách phiếu xuất kho ra excel theo bộ lọc hiện tại, **so that** tôi có dữ liệu tổng hợp để đối chiếu / báo cáo.

## 2. Acceptance Criteria

### Nhóm A — Xuất excel

- [ ] **AC-1**: Xuất theo bộ lọc hiện tại
  - Tại: danh sách, nút **"Xuất excel"**.
  - Thì: hệ thống xuất file `.xlsx` chứa các phiếu **đang hiển thị theo bộ lọc/tìm kiếm hiện tại** (Loại phiếu / Đối tượng / Người phụ trách / Trạng thái / Ngày xuất / từ khóa).

- [ ] **AC-1b**: Cap 1.000 phiếu/lần xuất (BR-IDV2-020)
  - Tại: nút **"Xuất excel"** khi chủ garage nhấn.
  - Khi: số phiếu match bộ lọc hiện tại **> 1.000 phiếu**.
  - Thì: hệ thống **chặn xuất** trước khi sinh file + hiển thị popup thông báo **"Kết quả vượt 1.000 mục — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"** (mã lỗi `ERR-INV-045`); user nhấn "OK" đóng popup, không có file tạo ra. Cap tính theo **PHIẾU** (business unit), không theo tổng dòng Excel (mỗi phiếu có nhiều dòng phụ tùng).
  - Khi: số phiếu match bộ lọc **≤ 1.000**.
  - Thì: xuất bình thường theo AC-1 + AC-2.

- [ ] **AC-2**: Cột xuất (theo mẫu Excel phiếu xuất)
  - Tại: file `.xlsx`.
  - Thì: hệ thống xuất các cột cấp phiếu: **Mã phiếu xuất** · **Ngày xuất** · **Nguồn xuất** · **Đối tượng** · **Mã phiếu dịch vụ** · **Diễn giải** · **Trạng thái** (Nháp / Ghi sổ kho) · **Ngày tạo** · **Người tạo**; kèm nhóm **"Danh sách phụ tùng xuất kho"** (mỗi dòng phụ tùng): **SKU** · **Tên** · **Mã nội bộ** · **Tên sản phẩm** · **Số lượng xuất** · **ĐVT** · **Số lượng quy đổi** · **Đơn giá vốn** · **Tiền vốn**. (Đơn giá vốn / Tiền vốn = 0 nếu chưa chạy BQGQ.)

### Nhóm B — Phân quyền & tenant

- [ ] **AC-3**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Thì: chủ garage + kế toán quyền ngang nhau; file chỉ chứa phiếu thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| **Excel Template** | file `.xlsx` | [Danh sách phiếu xuất kho.xlsx](<../ux/assets/Danh sách phiếu xuất kho.xlsx>) — mẫu file BE render dùng cho `FEAT-ID-EXPORT`; DEV bám theo mẫu này (tên sheet / cột / thứ tự / định dạng số / merge / header) |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §4.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xuất excel: endpoint `[PROPOSED] ExportDeliveriesV2` (nhận filter hiện tại).

## 5. Business Rules

- **BR-IDV2-020**: Xuất excel danh sách theo bộ lọc hiện tại, theo mẫu — cột phiếu (Mã phiếu xuất, Ngày xuất, Nguồn xuất, Đối tượng, Mã phiếu dịch vụ, Diễn giải, Trạng thái, Ngày tạo, Người tạo) + nhóm "Danh sách phụ tùng xuất kho" (SKU, Tên, Mã nội bộ, Tên sản phẩm, Số lượng xuất, ĐVT, Số lượng quy đổi, Đơn giá vốn, Tiền vốn). **File mẫu chuẩn** cho DEV render: [Danh sách phiếu xuất kho.xlsx](<../ux/assets/Danh sách phiếu xuất kho.xlsx>) (§3 UI/UX Reference).
- **BR-IDV2-024**: Xuất excel luôn khả dụng.

## 6. Edge Cases

- **EC-1**: Bộ lọc không khớp phiếu nào → file chỉ có dòng tiêu đề.
- **EC-2**: Cột Tiền vốn = 0 với phiếu chưa chạy BQGQ.

## 7. Out of Scope

- In PDF 1 phiếu → `FEAT-ID-PRINT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-EXPORT (mới) — xuất `.xlsx` danh sách phiếu xuất theo bộ lọc, theo mẫu: cột phiếu + nhóm "Danh sách phụ tùng xuất kho" (SKU/Tên/Mã nội bộ/Tên SP/SL xuất/ĐVT/SL quy đổi/Đơn giá vốn/Tiền Vốn); audit Ngày tạo/Người tạo. |
| 2026-06-15 | 2 | Business Authority | Thống nhất chữ thường: **"Tiền Vốn" → "Tiền vốn"** (AC + §5) cho khớp nhãn cột màn phiếu xuất. |
| 2026-07-13 | 3 | Business Authority (BA in-session review W05 chuẩn bị) | **Gắn file Excel template chuẩn** vào §3 UI/UX Reference (row mới "Excel Template") + §5 BR-IDV2-020 cite. File: `Product/ux/assets/Danh sách phiếu xuất kho.xlsx`. DEV bám mẫu này để render (tên sheet / cột / thứ tự / định dạng số / merge / header). Đồng bộ FEAT-IR-EXPORT v5. |
