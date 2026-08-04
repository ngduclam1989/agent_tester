---
type: feature
artifact_kind: feature
status: PLANNED
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-26"
supersedes: "FEAT-ID-LIST"
---

# FEAT-ID-LIST-V2: Danh sách phiếu xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-LIST-V2` |
| Title | Danh sách phiếu xuất kho (V2) |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu xuất kho với tìm kiếm và bộ lọc, **so that** tôi theo dõi luồng xuất, giá vốn và trạng thái ghi sổ.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn danh sách
  - Tại: tab **"Phiếu xuất kho"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Danh sách phiếu xuất kho"** với mô tả **"Không cho ghi sổ nếu làm tồn khả dụng âm."**, ô tìm kiếm + 4 bộ lọc, bảng danh sách, phân trang, và các nút **"Xuất excel"**, **"In"**, **"Tạo mới PX"**.

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng danh sách.
  - Thì: hệ thống hiển thị: **"STT"**, **"Ngày xuất"**, **"Nguồn xuất"**, **"Số phiếu"**, **"Phiếu dịch vụ"**, **"Diễn giải"**, **"Tiền vốn"**, **"Đối tượng"**, **"Người phụ trách"**, **"Loại phiếu"**, **"Phụ tùng xuất"** (link "Xem sản phẩm"), **"Trạng thái"**, **"Thao tác"**.

### Nhóm B — Tìm kiếm & lọc

- [ ] **AC-3**: Tìm kiếm
  - Tại: ô tìm kiếm, placeholder **"Tìm Số phiếu xuất, Phiếu dịch vụ, Người tạo"**.
  - Thì: hệ thống lọc theo từ khóa khớp tương đối (LIKE) trên Số phiếu xuất / Phiếu dịch vụ / Người tạo.

- [ ] **AC-4**: Bộ lọc
  - Tại: 4 bộ lọc **"Loại phiếu"**, **"Đối tượng"**, **"Trạng thái"**, **"Ngày xuất"**.
  - Thì: hệ thống lọc danh sách theo tiêu chí tương ứng.

### Nhóm C — Phân trang & thao tác

- [ ] **AC-5**: Phân trang
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị bộ chọn số dòng mỗi trang (mặc định **20**) + điều hướng trang.

- [ ] **AC-6**: Thao tác theo dòng (ẩn/hiện theo trạng thái + kỳ)
  - Tại: cột **"Thao tác"**.
  - Khi: phiếu **"Nháp"** / **"Ghi sổ kho"** và kỳ kế toán **chưa khóa**.
  - Thì: hệ thống hiển thị icon **Sửa** (→ `FEAT-ID-EDIT-V2`) và **Xóa** (→ `FEAT-ID-DELETE`).
  - Khi: phiếu thuộc **kỳ đã khóa**.
  - Thì: hệ thống **ẩn** icon Sửa / Xóa.
  - Khi: bất kỳ trạng thái.
  - Thì: nhấn **Số phiếu** → chi tiết (`FEAT-ID-DETAIL-V2`); nút **"In"** / **"Xuất excel"** luôn khả dụng (BR-IDV2-024).

- [ ] **AC-7**: Thanh công cụ
  - Tại: thanh công cụ trên cùng.
  - Thì: **"Tạo mới PX"** → `FEAT-ID-CREATE-V2`; **"In"** → `FEAT-ID-PRINT`; **"Xuất excel"** → `FEAT-ID-EXPORT`.

### Nhóm D — Phân quyền & tenant

- [ ] **AC-8**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Thì: chủ garage + kế toán quyền ngang nhau; chỉ hiển thị phiếu thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87561&t=W7XJPVvhmdBPtv2c-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21629-28662&t=30dKkXMi0PSOdK7b-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3, §4.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy danh sách phiếu + filter: Query `[PROPOSED] ListDeliveriesV2`.

## 5. Business Rules

- **BR-IDV2-010**: 2 trường phân loại Nguồn xuất / Loại phiếu.
- **BR-IDV2-021**: Tenant isolation + tìm kiếm LIKE + 4 bộ lọc + cột Tiền vốn.
- **BR-IDV2-024**: Ẩn/hiện icon thao tác theo trạng thái + kỳ; In/Xuất excel luôn khả dụng.

## 6. Edge Cases

- **EC-1**: Garage chưa có phiếu nào — trạng thái rỗng.
- **EC-2**: Tiền vốn = 0 với phiếu thuộc kỳ chưa chạy BQGQ.

## 7. Out of Scope

- Tạo → `FEAT-ID-CREATE-V2`. Chi tiết → `FEAT-ID-DETAIL-V2`. Sửa → `FEAT-ID-EDIT-V2`. Xóa → `FEAT-ID-DELETE`. In → `FEAT-ID-PRINT`. Xuất excel → `FEAT-ID-EXPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-LIST-V2 (V2 của FEAT-ID-LIST) — danh sách phiếu xuất: search (số phiếu/phiếu dịch vụ/người tạo), 4 filter, cột Nguồn xuất + Loại phiếu + Giá vốn, ẩn/hiện icon theo trạng thái + kỳ, nút Tạo mới/In/Xuất excel. |
| 2026-06-15 | 2 | Business Authority | Đổi nhãn cột **"Giá vốn" → "Tiền vốn"** ở AC-2 + §5 + EC-2 — đồng bộ "Tiền vốn". |
| 2026-06-26 | 3 | Business Authority | **Gắn Figma web + mobile vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87561`, mobile node `21629-28662`. |
