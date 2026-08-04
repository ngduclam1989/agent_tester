---
type: feature
artifact_kind: feature
status: PLANNED
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "gf-inventory"
last_reviewed: "2026-06-24"
---

# FEAT-CAT-GRP-DELETE: Xóa nhóm vật tư hàng hóa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DELETE` |
| Title | Xóa nhóm vật tư hàng hóa |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa một nhóm vật tư hàng hóa không còn dùng, **so that** danh mục phân loại gọn gàng — đồng thời hệ thống ngăn xóa nhầm nhóm đang được sử dụng.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận xóa
  - Tại: danh sách nhóm, icon **Xóa** ở cột Thao tác.
  - Khi: chủ garage nhấn xóa một nhóm **chưa phát sinh mã sản phẩm** và **không còn nhóm con**.
  - Thì: hệ thống hiển thị popup **"Xác nhận"** với nội dung **"Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa [tên nhóm] không?"**, nút **"Hủy"** và **"Xóa"**.

- [ ] **AC-2**: Thực hiện xóa
  - Tại: popup **"Xác nhận"**, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa nhóm, hiển thị thông báo thành công, cập nhật lại danh sách.

- [ ] **AC-3**: Hủy xóa
  - Tại: popup **"Xác nhận"**, nút **"Hủy"**.
  - Khi: chủ garage nhấn **"Hủy"**.
  - Thì: hệ thống đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn xóa khi đã phát sinh mã sản phẩm
  - Tại: danh sách nhóm, icon **Xóa**.
  - Khi: chủ garage xóa một nhóm **đã có mã sản phẩm nội bộ gắn vào**.
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Nhóm vật tư hàng hóa [tên nhóm] đã phát sinh mã sản phẩm nội bộ nên không được xóa."**, chỉ có nút **"Đóng"**.

- [ ] **AC-5**: Chặn xóa khi còn nhóm con
  - Tại: danh sách nhóm, icon **Xóa**.
  - Khi: chủ garage xóa một nhóm **cha còn nhóm con**.
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với thông báo phải xóa hết nhóm con trước khi xóa nhóm cha, chỉ có nút **"Đóng"**.

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền xóa
  - Tại: danh sách nhóm.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều xóa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88840&t=g9GrqfVRsuvDYwl3-4 |
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24250&t=4nMPkzz6Vhf93ZCC-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1, EC-4.
- Design source: **Figma** (web + mobile — xem bảng trên).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa nhóm: Mutation `[PROPOSED] DeleteMaterialGroup`.

## 5. Business Rules

- **BR-CAT-GRP-010**: Nhóm đã phát sinh mã sản phẩm → không được xóa.
- **BR-CAT-GRP-011**: Nhóm cha còn nhóm con → phải xóa hết con trước.

## 6. Edge Cases

- **EC-1**: Nhóm vừa đủ điều kiện xóa nhưng phiên khác vừa gắn mã sản phẩm vào → hệ thống kiểm tra lại tại thời điểm xóa, chuyển sang popup "Không thể xóa".
- **EC-2**: Xóa lần lượt từ nhóm con lên nhóm cha là cách hợp lệ để xóa cả nhánh.

## 7. Out of Scope

- Danh sách nhóm → xem `FEAT-CAT-GRP-LIST`.
- Chỉnh sửa / đổi trạng thái nhóm → xem `FEAT-CAT-GRP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-GRP-DELETE (mới) — 2 trạng thái popup: Xác nhận xóa (chưa phát sinh PROD & không còn con) / Không thể xóa (đã có mã sản phẩm hoặc còn nhóm con). |
| 2026-06-24 | 2 | Business Authority | Gắn **Figma web + mobile** vào §3 (web GMS-v.3 node `14423-88840`, mobile App-Garage-V3 node `21555-24250`). Nguồn authoritative cho registry figma-links (wave 03 sync). |
