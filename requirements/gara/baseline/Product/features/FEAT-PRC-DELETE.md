---
type: feature
artifact_kind: feature
status: PLANNED
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-07"
---

# FEAT-PRC-DELETE: Xóa khoản mục lịch sử tính giá

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DELETE` |
| Title | Xóa khoản mục lịch sử tính giá |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xóa một log tính giá không cần thiết, **so that** danh sách lịch sử gọn — đồng thời hệ thống ngăn xóa khi kỳ đã đóng và không tự ý đảo giá vốn đã cập nhật.

## 2. Acceptance Criteria

### Nhóm A — Xác nhận xóa

- [ ] **AC-1**: Mở popup xác nhận
  - Tại: danh sách lịch sử, icon **Xóa**.
  - Khi: chủ garage xóa một log mà **kỳ chưa đóng**.
  - Thì: hệ thống hiển thị popup **"Xóa khoản mục lịch sử tính giá"** với nội dung **"Bạn có muốn xóa log tính giá [từ ngày] - [đến ngày] của [kho]."** kèm dòng nhắc **"Thao tác này không rollback giá vốn đã cập nhật."**, nút **"Hủy"** / **"Xóa khoản mục"**.

- [ ] **AC-2**: Thực hiện xóa (không rollback)
  - Tại: popup, nút **"Xóa khoản mục"**.
  - Khi: chủ garage xác nhận.
  - Thì: hệ thống xóa **log** lịch sử tính giá. **KHÔNG rollback** giá vốn đã cập nhật vào phiếu xuất (phiếu giữ nguyên giá vốn). Hiển thị thông báo thành công.

- [ ] **AC-3**: Hủy — nút **"Hủy"** (hoặc đóng ✕) đóng popup, không xóa.

### Nhóm B — Chặn xóa

- [ ] **AC-4**: Chặn khi kỳ đã đóng
  - Tại: thao tác xóa.
  - Khi: log thuộc **kỳ kế toán đã đóng** (đã dùng để khóa/chốt giá vốn).
  - Thì: hệ thống hiển thị popup **"Không thể xóa"** với nội dung **"Log tính giá đã được dùng để khóa giá vốn hoặc kỳ kế toán đã đóng nên không được xóa."**, chỉ có nút **"Đóng"**. (Mã lỗi `ERR-INV-024`.)

- [ ] **AC-4b**: Chặn khi log đang "Đang tính"
  - Tại: thao tác xóa.
  - Khi: log đang ở trạng thái **"Đang tính"** (job nền CREATE/RECALC chưa chạy xong).
  - Thì: hệ thống **chặn xóa** → popup/thông báo **"Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất"** → mã lỗi **`ERR-INV-029`** (tránh xóa bản ghi đang được cập nhật — BR-PRC-011/016).

### Nhóm C — Phân quyền

- [ ] **AC-5**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89269&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Xóa log tính giá: Mutation `[PROPOSED] DeleteCogsRun`.

## 5. Business Rules

- **BR-PRC-011**: Xóa log không rollback giá vốn đã cập nhật; **chặn xóa nếu kỳ đã đóng** (`ERR-INV-024`) **hoặc log đang "Đang tính"** (`ERR-INV-029`).
- **BR-PRC-016**: log đang "Đang tính" (job nền) → chặn xóa cho tới khi chạy xong.
- **BR-AP-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Log thuộc kỳ đã đóng → popup "Không thể xóa" (`ERR-INV-024`).
- **EC-3**: Log đang "Đang tính" (job nền chưa xong) → chặn xóa, báo "vui lòng đợi hoàn tất" (`ERR-INV-029`).
- **EC-2**: Xóa log nhưng giá vốn phiếu xuất vẫn giữ (không đảo) — nếu cần đảo phải tính lại / điều chỉnh thủ công (ngoài phạm vi xóa).

## 7. Out of Scope

- Tính / tính lại → `FEAT-PRC-CREATE` / `FEAT-PRC-RECALC`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-PRC-DELETE (mới) — 2 popup: Xác nhận xóa log (không rollback giá vốn) / Không thể xóa (kỳ đã đóng). |
| 2026-06-15 | 2 | Business Authority | Bổ sung cite phân quyền §5 (rà traceability V2). |
| 2026-06-16 | 3 | Business Authority | Fix: sửa tham chiếu UX section §4 → §4B (luồng tính giá xuất kho). |
| 2026-06-16 | 4 | Business Authority | Đồng bộ tham chiếu UX: §4B → §6 (luồng PRC được đánh số lại liền mạch sau §5 trong UX-FLOW-INVENTORY-ACCOUNTING-PERIOD). |
| 2026-06-16 | 5 | Business Authority | **G3 — chặn xóa khi đang "Đang tính"**: thêm **AC-4b** (log đang chạy nền → chặn xóa → `ERR-INV-029`) + EC-3; AC-4 gắn mã `ERR-INV-024`; §5 cite BR-PRC-016. |
| 2026-06-26 | 6 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89269`. Mobile chưa có. |
| 2026-07-07 | 7 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Tính giá xuất kho BQGQ (PRC) thuộc nghiệp vụ kế toán — khớp SAP FI-CO / Misa / Fast / Odoo. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
