---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-13"
---

# FEAT-IR-EXPORT: Xuất excel danh sách phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-EXPORT` |
| Title | Xuất excel danh sách phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P2 |
| Status | PLANNED |
| Depends on | — |

## 1. User Story

**As** chủ garage / kế toán, **I want** xuất danh sách phiếu nhập kho ra excel theo bộ lọc hiện tại, **so that** tôi có dữ liệu tổng hợp để đối chiếu / báo cáo ngoài hệ thống.

## 2. Acceptance Criteria

### Nhóm A — Xuất excel

- [ ] **AC-1**: Xuất theo bộ lọc hiện tại
  - Tại: danh sách phiếu nhập kho, nút **"Xuất excel"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống xuất file `.xlsx` chứa các phiếu **đang hiển thị theo bộ lọc/tìm kiếm hiện tại** (Nguồn nhập / Loại phiếu / Đối tượng / Người phụ trách / Trạng thái / Ngày nhập / từ khóa).

- [ ] **AC-1b**: Cap 1.000 phiếu/lần xuất (BR-IRV2-020)
  - Tại: nút **"Xuất excel"** khi chủ garage nhấn.
  - Khi: số phiếu match bộ lọc hiện tại **> 1.000 phiếu**.
  - Thì: hệ thống **chặn xuất** trước khi sinh file + hiển thị popup thông báo **"Kết quả vượt 1.000 mục — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"** (mã lỗi `ERR-INV-045`); user nhấn "OK" đóng popup, không có file tạo ra. Cap tính theo **PHIẾU** (business unit), không theo tổng dòng Excel (mỗi phiếu có nhiều dòng phụ tùng).
  - Khi: số phiếu match bộ lọc **≤ 1.000**.
  - Thì: xuất bình thường theo AC-1 + AC-2.

- [ ] **AC-2**: Cột xuất (theo mẫu Excel phiếu nhập)
  - Tại: file `.xlsx` xuất ra.
  - Khi: file được tạo.
  - Thì: hệ thống xuất các cột cấp phiếu: **Mã phiếu nhập** · **Ngày nhập** · **Nguồn nhập** · **Đối tượng** · **Đơn hàng tương ứng** · **Diễn giải** · **Trạng thái** (Nháp / Ghi sổ kho) · **Ngày tạo** · **Người tạo**; kèm nhóm **"Danh sách phụ tùng nhập kho"** (mỗi dòng phụ tùng): **SKU** · **Tên** · **Mã nội bộ** · **Tên sản phẩm** · **Số lượng nhập** · **ĐVT** · **Đơn giá** · **Thành tiền**.

### Nhóm B — Phân quyền & tenant

- [ ] **AC-3**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xuất được với quyền ngang nhau; file chỉ chứa phiếu thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| **Excel Template** | file `.xlsx` | [Danh sách phiếu nhập kho.xlsx](<../ux/assets/Danh sách phiếu nhập kho.xlsx>) — mẫu file BE render dùng cho `FEAT-IR-EXPORT`; DEV bám theo mẫu này (tên sheet / cột / thứ tự / định dạng số / merge / header) |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xuất excel: endpoint `[PROPOSED] ExportReceiptsV2` (nhận filter hiện tại).

## 5. Business Rules

- **BR-IRV2-020**: Xuất excel danh sách theo bộ lọc hiện tại, theo mẫu — cột phiếu (Mã phiếu nhập, Ngày nhập, Nguồn nhập, Đối tượng, Đơn hàng tương ứng, Diễn giải, Trạng thái, Ngày tạo, Người tạo) + nhóm "Danh sách phụ tùng nhập kho" (SKU, Tên, Mã nội bộ, Tên sản phẩm, Số lượng nhập, ĐVT, Đơn giá, Thành tiền). **File mẫu chuẩn** cho DEV render: [Danh sách phiếu nhập kho.xlsx](<../ux/assets/Danh sách phiếu nhập kho.xlsx>) (§3 UI/UX Reference).

## 6. Edge Cases

- **EC-1**: Bộ lọc không khớp phiếu nào → file chỉ có dòng tiêu đề.
- **EC-2**: Cột Thành tiền theo dữ liệu hiện có (đơn giá nhập) — không phụ thuộc BQGQ.

## 7. Out of Scope

- In PDF 1 phiếu → `FEAT-IR-PRINT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-EXPORT (mới) — xuất `.xlsx` danh sách phiếu nhập theo bộ lọc, theo mẫu: cột phiếu + nhóm "Danh sách phụ tùng nhập kho" (SKU/Tên/Mã nội bộ/Tên SP/SL nhập/ĐVT/Đơn giá/Thành tiền); audit Ngày tạo/Người tạo. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (feature mới — tách từ "Xuất file" V1 LIST AC-13, bỏ cột vòng đời cũ) + gắn tag [MỚI] + con trỏ lineage `← tách FEAT-IR-LIST AC-13` cho AC-1/2 (để agent truy vết nguồn gốc). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-LIST / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-07-13 | 5 | Business Authority (BA in-session review W05 chuẩn bị) | **Gắn file Excel template chuẩn** vào §3 UI/UX Reference (row mới "Excel Template") + §5 BR-IRV2-020 cite. File: `Product/ux/assets/Danh sách phiếu nhập kho.xlsx`. DEV bám mẫu này để render (tên sheet / cột / thứ tự / định dạng số / merge / header). |
