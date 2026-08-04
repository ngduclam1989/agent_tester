---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
supersedes: "FEAT-IR-LIST"
---

# FEAT-IR-LIST-V2: Danh sách phiếu nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-LIST-V2` |
| Title | Danh sách phiếu nhập kho (V2) |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-ACCOUNTING-PERIOD` (ẩn/hiện nút theo kỳ khóa), `EP-INVENTORY-CATALOG` (Loại phiếu / Đối tượng) |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu nhập kho với tìm kiếm, nhiều bộ lọc và tổng hợp giá trị, **so that** tôi theo dõi luồng nhập, trạng thái ghi sổ và truy cập thao tác (tạo/in/xuất excel).

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn danh sách
  - Tại: tab **"Phiếu nhập kho"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Danh sách phiếu nhập kho"** với mô tả **"Theo dõi phiếu nhập kho trong garage hiện tại, không filter Garage."**, ô tìm kiếm + 5 bộ lọc, bảng danh sách, dòng Tổng, phân trang, và các nút **"Xuất excel"**, **"In"**, **"Tạo mới PN"**.

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng danh sách.
  - Khi: bảng được render.
  - Thì: hệ thống hiển thị: **"STT"**, **"Ngày nhập"**, **"Nguồn nhập"**, **"Số phiếu"**, **"Đơn hàng mua"**, **"Diễn giải"**, **"Thành tiền"**, **"Đối tượng"**, **"Người phụ trách"**, **"Loại phiếu"**, **"Phụ tùng nhập"** (link "Xem sản phẩm"), **"Trạng thái"**, **"Thao tác"**.

- [ ] **AC-3**: Dòng tổng
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị dòng **"Tổng"** = tổng **"Thành tiền"** các phiếu theo bộ lọc hiện tại.

- [ ] **AC-4**: Hiển thị trạng thái
  - Tại: cột **"Trạng thái"**.
  - Thì: phiếu **"Ghi sổ kho"** hiển thị badge xanh; phiếu **"Nháp"** hiển thị badge cam.

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-5**: Tìm kiếm
  - Tại: ô tìm kiếm, placeholder **"Tìm Số phiếu nhập, Số đơn hàng, Người tạo"**.
  - Khi: chủ garage nhập từ khóa.
  - Thì: hệ thống lọc theo từ khóa khớp tương đối (LIKE) trên Số phiếu / Số đơn hàng / Người tạo.

- [ ] **AC-6**: Bộ lọc
  - Tại: 5 bộ lọc **"Nguồn nhập"**, **"Loại phiếu"**, **"Đối tượng"**, **"Trạng thái"**, **"Ngày nhập"**.
  - Khi: chủ garage chọn giá trị.
  - Thì: hệ thống lọc danh sách theo tiêu chí tương ứng.

### Nhóm C — Phân trang & thao tác

- [ ] **AC-7**: Phân trang
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị bộ chọn số dòng mỗi trang (mặc định **20**) và điều hướng trang.

- [ ] **AC-8**: Thao tác theo dòng (ẩn/hiện theo trạng thái + kỳ)
  - Tại: cột **"Thao tác"**.
  - Khi: phiếu **"Nháp"** hoặc **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị icon **Sửa** (→ `FEAT-IR-EDIT-V2`) và **Xóa** (→ `FEAT-IR-DELETE`); thao tác Ghi sổ / Bỏ ghi sổ thực hiện trong màn chi tiết.
  - Khi: ngày chứng từ phiếu thuộc **kỳ đã khóa**.
  - Thì: hệ thống **ẩn** icon Sửa / Xóa.
  - Khi: bất kỳ trạng thái nào.
  - Thì: nhấn **Số phiếu** → mở chi tiết (`FEAT-IR-DETAIL-V2`); nút **"In"** / **"Xuất excel"** luôn khả dụng (BR-IRV2-024).

- [ ] **AC-9**: Thanh công cụ
  - Tại: thanh công cụ trên cùng.
  - Thì: **"Tạo mới PN"** → form tạo (`FEAT-IR-CREATE-V2`); **"In"** → in phiếu (`FEAT-IR-PRINT`); **"Xuất excel"** → xuất danh sách (`FEAT-IR-EXPORT`).

### Nhóm D — Phân quyền & tenant

- [ ] **AC-10**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xem và thao tác với quyền ngang nhau; danh sách chỉ hiển thị phiếu thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87559&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-24081&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy danh sách phiếu + filter: Query `[PROPOSED] ListReceiptsV2`.

## 5. Business Rules

- **BR-IRV2-009**: 2 trường phân loại Nguồn nhập / Loại phiếu.
- **BR-IRV2-021**: Tenant isolation + tìm kiếm LIKE + 5 bộ lọc + dòng Tổng.
- **BR-IRV2-002**: Trạng thái Nháp / Ghi sổ kho.
- **BR-IRV2-024**: Ẩn/hiện icon thao tác theo trạng thái + kỳ; In / Xuất excel luôn khả dụng.

## 6. Edge Cases

- **EC-1**: Garage chưa có phiếu nào — hiển thị trạng thái rỗng.
- **EC-2**: Dòng Tổng theo bộ lọc hiện tại.

## 7. Out of Scope

- Tạo phiếu → `FEAT-IR-CREATE-V2`. Chi tiết → `FEAT-IR-DETAIL-V2`. Sửa → `FEAT-IR-EDIT-V2`. Xóa → `FEAT-IR-DELETE`. In → `FEAT-IR-PRINT`. Xuất excel → `FEAT-IR-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-LIST-V2 (V2 của FEAT-IR-LIST) — danh sách phiếu nhập: search (số phiếu/đơn hàng/người tạo), 5 filter, cột Loại phiếu + Nguồn nhập, trạng thái Nháp/Ghi sổ kho, dòng Tổng, nút Tạo mới/In/Xuất excel. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (map 10 AC ↔ V1) + gắn tag [GIỮ]/[ĐỔI]/[MỚI] + con trỏ lineage `← FEAT-IR-LIST AC-n` vào từng AC (để agent truy vết AC V2 phát triển từ AC V1 nào). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-LIST / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-26 | 5 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87559`, mobile node `21629-24081`. |
