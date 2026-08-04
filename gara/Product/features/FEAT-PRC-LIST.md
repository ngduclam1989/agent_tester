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

# FEAT-PRC-LIST: Danh sách lịch sử tính giá xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-LIST` |
| Title | Danh sách lịch sử tính giá xuất kho |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tra cứu các lần đã thực hiện tính giá vốn xuất kho và mở form tính giá mới, **so that** tôi theo dõi lịch sử tính giá theo kỳ/kho và chạy tính giá khi cần.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị danh sách

- [ ] **AC-1**: Mở màn danh sách
  - Tại: tab **"Tính giá xuất kho"**.
  - Khi: chủ garage truy cập.
  - Thì: hệ thống hiển thị màn **"Tính giá xuất kho / Danh sách lịch sử"** với mô tả **"Tra cứu các lần thực hiện tính giá vốn xuất kho trong kỳ và mở form thực hiện tính giá."**, bộ lọc, bảng lịch sử, phân trang, và nút **"Tính giá"**.

- [ ] **AC-2**: Cột hiển thị
  - Tại: bảng danh sách.
  - Thì: hệ thống hiển thị: **"STT"**, **"Kỳ kế toán"**, **"Từ ngày"**, **"Đến ngày"**, **"Kho"**, **"Phương pháp tính giá vốn"**, **"Tài khoản thực hiện"**, **"Ngày giờ thực hiện"**, **"Số mã"**, **"Trạng thái"**, **"Thao tác"** (Xem, Xóa). Cột **"Trạng thái"** = trạng thái lần tính: **"Đang tính"** (đang chạy nền) / **"Thành công"** / **"Hoàn thành có lỗi"** (BR-PRC-014).

- [ ] **AC-3**: Mỗi dòng = 1 lần chạy (log)
  - Tại: bảng danh sách.
  - Thì: mỗi dòng tương ứng **một lần thực hiện tính giá / tính lại** (audit). Bấm "Tính giá" lại cùng phạm vi → tạo **log mới chồng lên** (không ghi đè log cũ).

### Nhóm B — Bộ lọc & thao tác

- [ ] **AC-4**: Bộ lọc
  - Tại: bộ lọc **"Phương pháp"** (Phương pháp bình quân cuối kỳ) + **"Ngày thực hiện"**.
  - Thì: hệ thống lọc danh sách theo phương pháp / ngày thực hiện.

- [ ] **AC-5**: Phân trang
  - Tại: cuối bảng.
  - Thì: hệ thống hiển thị bộ chọn số dòng mỗi trang (mặc định **20**) + điều hướng trang.

- [ ] **AC-6**: Thao tác
  - Tại: cột **"Thao tác"** + nút **"Tính giá"**.
  - Thì: **Xem** → chi tiết lần tính (`FEAT-PRC-DETAIL`); **Xóa** → xóa log (`FEAT-PRC-DELETE`); **"Tính giá"** → form thực hiện tính giá (`FEAT-PRC-CREATE`).

### Nhóm C — Phân quyền & tenant

- [ ] **AC-7**: Phân quyền và phạm vi garage
  - Tại: danh sách.
  - Thì: chủ garage + kế toán quyền ngang nhau; chỉ hiển thị log thuộc garage hiện tại.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89265&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Lấy danh sách log tính giá: Query `[PROPOSED] ListCogsRuns`.

## 5. Business Rules

- **BR-PRC-001**: BQGQ cuối kỳ — đơn giá BQ chỉ dùng giá trị nhập (xem epic).
- **BR-PRC-009**: Mỗi lần chạy/tính lại ghi 1 log (audit: tài khoản thực hiện + ngày giờ).
- **BR-PRC-010**: Bấm "Tính giá" lại cùng phạm vi → tạo log mới chồng lên.
- **BR-PRC-014**: Cột "Trạng thái" — Đang tính / Thành công / Hoàn thành có lỗi.
- **BR-PRC-016**: lần tính chạy nền (lưu phiếu trước, trạng thái "Đang tính" rồi tính dần).
- **BR-AP-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Chưa có lần tính nào — hiển thị trạng thái rỗng.
- **EC-2**: Cùng kỳ/kho có nhiều log (do chạy nhiều lần) — hiển thị tất cả theo ngày giờ thực hiện.
- **EC-3**: Log đang **"Đang tính"** (job nền chưa xong) — hiển thị trạng thái "Đang tính"; người dùng làm mới để thấy trạng thái cuối khi chạy xong.

## 7. Out of Scope

- Thực hiện tính giá → `FEAT-PRC-CREATE`. Chi tiết → `FEAT-PRC-DETAIL`. Tính lại → `FEAT-PRC-RECALC`. Xóa → `FEAT-PRC-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-PRC-LIST (mới) — danh sách lịch sử tính giá: cột kỳ/kho/khoảng/phương pháp/tài khoản/giờ/số mã, lọc phương pháp + ngày thực hiện, nút Tính giá, mỗi dòng = 1 log (bấm lại tạo log mới). |
| 2026-06-15 | 2 | Business Authority | Bổ sung cite phân quyền §5 (rà traceability V2). |
| 2026-06-16 | 3 | Business Authority | Fix: sửa tham chiếu UX section §4 → §4B (luồng tính giá xuất kho). |
| 2026-06-16 | 4 | Business Authority | Đồng bộ tham chiếu UX: §4B → §6 (luồng PRC được đánh số lại liền mạch sau §5 trong UX-FLOW-INVENTORY-ACCOUNTING-PERIOD). |
| 2026-06-16 | 5 | Business Authority | **G1 — thêm cột "Trạng thái"** vào AC-2 (Đang tính / Thành công / Hoàn thành có lỗi — BR-PRC-014), khớp với mô hình chạy nền BR-PRC-016; §5 thêm cite BR-PRC-014/016; EC-3 mới (log đang "Đang tính" → làm mới để thấy trạng thái cuối). |
| 2026-06-26 | 6 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89265`. Mobile chưa có. |
| 2026-07-07 | 7 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Tính giá xuất kho BQGQ (PRC) thuộc nghiệp vụ kế toán (kho tracks SL, kế toán tính money/costing) — khớp SAP FI-CO / Misa / Fast / Odoo. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
