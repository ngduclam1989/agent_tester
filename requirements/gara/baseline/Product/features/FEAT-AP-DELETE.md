---
type: feature
artifact_kind: feature
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-07"
---

# FEAT-AP-DELETE: Xóa kỳ kế toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DELETE` |
| Title | Xóa kỳ kế toán |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa một kỳ kế toán tạo nhầm hoặc không dùng, **so that** danh mục kỳ gọn gàng — đồng thời hệ thống ngăn xóa kỳ đã đóng, kỳ đã phát sinh dữ liệu kho, hoặc kỳ còn kỳ con.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận xóa
  - Tại: danh sách, icon **Xóa** ở cột Thao tác.
  - Khi: chủ garage xóa một kỳ **"Chưa đóng"**, **chưa phát sinh dữ liệu kho liên quan**, và **không còn kỳ con**.
  - Thì: hệ thống hiển thị popup **"Xóa Kỳ kế toán"** với nội dung **"Bạn có chắc chắn muốn xóa kỳ kế toán [tên kỳ] không?"** kèm dòng nhắc **"Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan."**, nút **"Hủy"** và **"Xóa"**.

- [ ] **AC-2**: Thực hiện xóa
  - Tại: popup, nút **"Xóa"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa kỳ, hiển thị thông báo thành công, cập nhật danh sách.

- [ ] **AC-3**: Hủy xóa
  - Tại: popup, nút **"Hủy"** (hoặc icon đóng ✕).
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn xóa khi đã đóng hoặc đã phát sinh dữ liệu kho
  - Tại: danh sách, thao tác Xóa.
  - Khi: chủ garage xóa một kỳ **"Đã đóng"** hoặc kỳ **đã phát sinh dữ liệu kho liên quan** (phiếu nhập/xuất có ngày chứng từ thuộc kỳ; **tồn đầu kỳ có "Tồn đến ngày" rơi vào kỳ** — OB liên hệ kỳ *gián tiếp qua ngày*, không gắn trực tiếp; hoặc bản ghi tính giá trong kỳ).
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa."**, chỉ có nút **"Đóng"**.

- [ ] **AC-5**: Chặn xóa khi còn kỳ con
  - Tại: danh sách, thao tác Xóa.
  - Khi: chủ garage xóa một kỳ **cha còn kỳ con**.
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với thông báo phải xóa hết kỳ con trước khi xóa kỳ cha, chỉ có nút **"Đóng"**.

### Nhóm C — Phân quyền

- [ ] **AC-6**: Phân quyền xóa
  - Tại: danh sách kỳ kế toán.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò xóa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89258&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3, EC-6.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Xóa kỳ: Mutation `[PROPOSED] DeleteAccountingPeriod`.

## 5. Business Rules

- **BR-AP-013**: Kỳ đã đóng hoặc đã phát sinh dữ liệu kho liên quan → không được xóa (tồn đầu kỳ xét theo "Tồn đến ngày" rơi vào kỳ — liên hệ gián tiếp, không gắn trực tiếp).
- **BR-AP-014**: Kỳ cha còn kỳ con → phải xóa hết kỳ con trước.

## 6. Edge Cases

- **EC-1**: Kỳ đủ điều kiện xóa nhưng phiên khác vừa đóng kỳ hoặc tạo phiếu trong kỳ → hệ thống kiểm tra lại tại thời điểm xóa, chuyển sang popup "Không thể xóa".
- **EC-2**: Xóa lần lượt từ kỳ tháng → quý → năm là cách hợp lệ để xóa cả nhánh.

## 7. Out of Scope

- Danh sách → xem `FEAT-AP-LIST`.
- Đóng/mở kỳ (thay cho xóa khi kỳ đã có dữ liệu) → dùng trạng thái ở `FEAT-AP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-AP-DELETE (mới) — 2 popup: Xác nhận xóa (chưa đóng & chưa phát sinh dữ liệu kho & không còn kỳ con) / Không thể xóa (đã đóng, có dữ liệu kho, hoặc còn kỳ con). |
| 2026-06-15 | 2 | Business Authority | Rà completeness (B2): làm rõ tồn đầu kỳ liên hệ kỳ **gián tiếp qua "Tồn đến ngày"** (không gắn trực tiếp) ở AC-4 + §5 BR-AP-013 — đồng bộ với Plan §7.5 và BR-OB-002. |
| 2026-06-26 | 3 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14492-89258`. Mobile chưa có. |
| 2026-07-07 | 4 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Kỳ kế toán (AP) thuộc nghiệp vụ kế toán — khớp SAP FI-CO / Misa / Fast / Odoo. OB + Sổ tồn giữ ở `gf-inventory`. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
