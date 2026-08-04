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

# FEAT-CAT-PROD-DELETE: Xóa mã sản phẩm nội bộ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DELETE` |
| Title | Xóa mã sản phẩm nội bộ |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa một mã sản phẩm nội bộ không còn dùng, **so that** danh mục gọn gàng — đồng thời hệ thống ngăn xóa mã đã phát sinh dữ liệu sử dụng.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận xóa
  - Tại: danh sách (icon Xóa) hoặc chi tiết (nút **"Xóa"**).
  - Khi: chủ garage xóa một mã sản phẩm **chưa phát sinh dữ liệu sử dụng**.
  - Thì: hệ thống hiển thị popup **"Xác nhận"** với nội dung **"Bạn có chắc chắn muốn xóa mã sản phẩm [mã] không?"**, nút **"Xóa"** và **"Hủy"**.

- [ ] **AC-2**: Thực hiện xóa
  - Tại: popup **"Xác nhận"**, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa mã sản phẩm; đồng thời gỡ các mapping SKU và ĐVT quy đổi liên quan (chưa phát sinh giao dịch). Hiển thị thông báo thành công, cập nhật danh sách.

- [ ] **AC-3**: Hủy xóa
  - Tại: popup **"Xác nhận"**, nút **"Hủy"**.
  - Khi: chủ garage nhấn **"Hủy"**.
  - Thì: hệ thống đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn xóa khi đã phát sinh dữ liệu sử dụng
  - Tại: danh sách / chi tiết, thao tác Xóa.
  - Khi: chủ garage xóa một mã sản phẩm **đã phát sinh dữ liệu sử dụng** (đã có trong phiếu nhập/xuất kho hoặc đã có tồn kho).
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Mã sản phẩm [mã] đã phát sinh dữ liệu sử dụng nên không được xóa."**, chỉ có nút **"Đóng"**.

### Nhóm C — Phân quyền

- [ ] **AC-5**: Phân quyền xóa
  - Tại: danh sách / chi tiết.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xóa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14322-176694&t=fE3MKR6uAHS9vkKm-4 |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2, EC-5.
- Design source: **Figma** (web — xem bảng trên). Mobile: không thuộc phạm vi (web-only).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Xóa mã sản phẩm: Mutation `[PROPOSED] DeleteInternalProduct`.

## 5. Business Rules

- **BR-CAT-PROD-016**: Mã đã phát sinh dữ liệu sử dụng (phiếu nhập/xuất hoặc có tồn) không được xóa; mã chỉ mới gắn SKU / khai ĐVT quy đổi (chưa giao dịch) vẫn xóa được, kèm gỡ mapping SKU và ĐVT quy đổi.

## 6. Edge Cases

- **EC-1**: Mã đủ điều kiện xóa nhưng phiên khác vừa tạo phiếu/tồn → hệ thống kiểm tra lại tại thời điểm xóa, chuyển sang popup "Không thể xóa".
- **EC-2**: Mã chỉ mới gắn SKU (chưa giao dịch) → cho xóa, gỡ mapping SKU; SKU gốc không bị xóa.

## 7. Out of Scope

- Danh sách → xem `FEAT-CAT-PROD-LIST`.
- Ngừng hoạt động thay cho xóa (khi mã đã giao dịch) → dùng trạng thái ở `FEAT-CAT-PROD-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-CAT-PROD-DELETE (mới) — 2 popup: Xác nhận xóa (chưa giao dịch, gỡ mapping SKU/ĐVT quy đổi) / Không thể xóa (đã có phiếu nhập-xuất hoặc tồn kho). |
| 2026-06-24 | 2 | Business Authority | Gắn **Figma web** vào §3 UI/UX Reference (node `14322-176694`, file GMS-v.3); Mobile **web-only** (không làm). Nguồn authoritative cho registry figma-links (wave 03 sync). |
