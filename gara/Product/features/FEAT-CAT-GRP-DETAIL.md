---
type: feature
artifact_kind: feature
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-06-24"
---

# FEAT-CAT-GRP-DETAIL: Chi tiết nhóm vật tư hàng hóa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DETAIL` |
| Title | Chi tiết nhóm vật tư hàng hóa |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem thông tin chi tiết của một nhóm vật tư hàng hóa cùng thông tin tạo/sửa, **so that** tôi nắm được nội dung và lịch sử cập nhật của nhóm trước khi chỉnh sửa hoặc xóa.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn xem chi tiết
  - Tại: danh sách nhóm, icon **Xem** ở cột Thao tác (hoặc nhấn vào tên nhóm).
  - Khi: chủ garage chọn xem một nhóm.
  - Thì: hệ thống mở màn **"Chi tiết nhóm vật tư hàng hóa"** với mô tả **"Thông tin chi tiết nhóm vật tư hàng hóa."**, mục **"Thông tin chung"** ở chế độ chỉ đọc, nút **"Chỉnh sửa"** + nút quay lại (mũi tên **←**). *(Theo Figma màn chi tiết không có nút "Đóng" — dùng mũi tên ← để quay lại.)*

- [ ] **AC-2**: Các trường hiển thị
  - Tại: mục **"Thông tin chung"**.
  - Khi: màn chi tiết được render.
  - Thì: hệ thống hiển thị (read-only): **"Mã nhóm VTHH"**, **"Tên nhóm VTHH"**, **"Thuộc nhóm"**, **"Trạng thái"** (badge), **"Mô tả"**.

- [ ] **AC-3**: Thông tin audit
  - Tại: cuối màn chi tiết.
  - Khi: màn được render.
  - Thì: hệ thống hiển thị: **"Ngày tạo"**, **"Người tạo"**, **"Ngày sửa"**, **"Người sửa"**.

### Nhóm B — Hành động

- [ ] **AC-4**: Chuyển sang chỉnh sửa
  - Tại: nút **"Chỉnh sửa"**.
  - Khi: chủ garage nhấn **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang form chỉnh sửa nhóm (`FEAT-CAT-GRP-EDIT`).

- [ ] **AC-5**: Quay lại danh sách
  - Tại: nút quay lại (mũi tên **←** cạnh tiêu đề).
  - Khi: chủ garage nhấn quay lại.
  - Thì: hệ thống đóng màn chi tiết và quay về danh sách.

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền xem
  - Tại: màn chi tiết nhóm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều xem được chi tiết với quyền ngang nhau.

- [ ] **AC-7**: Phạm vi nền tảng — chi tiết nhóm VTHH **đầy đủ trên web + mobile**
  - Tại: app mobile (garage-mobile) và web.
  - Khi: người dùng mở chi tiết nhóm VTHH.
  - Thì: cả 2 nền tảng đều hiển thị chi tiết kèm nút **Sửa / Xóa** (mobile KHÔNG bị giới hạn view-only).

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88838&t=g9GrqfVRsuvDYwl3-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24248&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Lấy chi tiết nhóm: Query `[PROPOSED] GetMaterialGroup`.

## 5. Business Rules

- **BR-CAT-CMN-002**: Hiển thị thông tin audit (ngày/người tạo, ngày/người sửa).
- **BR-CAT-GRP-006**: Trạng thái 2 giá trị (hiển thị badge).

## 6. Edge Cases

- **EC-1**: Nhóm đã bị xóa bởi phiên khác → hiển thị thông báo không tìm thấy khi mở.

## 7. Out of Scope

- Chỉnh sửa nhóm → xem `FEAT-CAT-GRP-EDIT`.
- Xóa nhóm → xem `FEAT-CAT-GRP-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-GRP-DETAIL (mới) — màn xem chi tiết nhóm VTHH read-only + thông tin audit (ngày/người tạo/sửa), nút Sửa/Đóng. |
| 2026-06-24 | 2 | Business Authority | Gắn **Figma web + mobile** vào §3 (web GMS-v.3 node `14423-88838`, mobile App-Garage-V3 node `21555-24248`). Nguồn authoritative cho registry figma-links (wave 03 sync). |
| 2026-06-24 | 3 | Business Authority | Thêm **AC-7 phạm vi nền tảng** (BA làm rõ rà soát wave 3): chi tiết nhóm VTHH có nút Sửa/Xóa trên **cả web + mobile** (mobile KHÔNG view-only). |
| 2026-06-24 | 4 | Business Authority | **Đồng bộ tên nút theo Figma** (rà soát wave 3): tiêu đề "Xem Nhóm…" → **"Chi tiết nhóm vật tư hàng hóa"**, nút "Sửa" → **"Chỉnh sửa"**; nút "Đóng" → **nút quay lại (mũi tên ←)** (Figma chi tiết không có nút Đóng). |
