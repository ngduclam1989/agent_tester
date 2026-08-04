---
type: feature
artifact_kind: feature
status: PLANNED
version: 11
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-07"
---

# FEAT-PRC-RECALC: Tính lại giá xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-RECALC` |
| Title | Tính lại giá xuất kho |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tính lại giá vốn cho một lần tính đã có (khi dữ liệu phát sinh thay đổi), **so that** giá vốn phiếu xuất và giá trị tồn được cập nhật lại đúng.

## 2. Acceptance Criteria

### Nhóm A — Tính lại

- [ ] **AC-1**: Trigger tính lại
  - Tại: màn chi tiết lần tính (`FEAT-PRC-DETAIL`), nút **"Tính lại"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống chạy lại tính giá BQGQ cho **tất cả mã** trong lần tính đó (cùng kỳ + kho + khoảng ngày), áp đúng công thức như `FEAT-PRC-CREATE`.

- [ ] **AC-2**: Ghi đè kết quả
  - Tại: sau khi tính lại.
  - Thì: hệ thống **ghi đè kết quả tính** cũ — cập nhật lại **giá vốn các phiếu xuất trong kỳ** + **giá trị sổ tồn từ kỳ trở đi** (báo cáo tự đúng — BR-PRC-005); tồn cuối (SL, GT) cập nhật; nhưng **vẫn tạo một bản ghi log/audit MỚI cho mỗi lần tính lại** (tài khoản + ngày giờ). (Ghi đè *kết quả số liệu*, KHÔNG ghi đè *lịch sử audit*.)

- [ ] **AC-2b**: Chạy nền — ghi đè tại chỗ (không xóa trắng)
  - Tại: nút **"Tính lại"**.
  - Khi: chủ garage nhấn (kỳ chưa đóng, không bị chặn trùng).
  - Thì: hệ thống chuyển log về trạng thái **"Đang tính"** → chạy lại **từng mã ở nền** (giống `FEAT-PRC-CREATE` AC-8b); tính tới mã nào thì **ghi đè kết quả + trạng thái mã đó tại chỗ** (giá vốn phiếu xuất + giá trị sổ tồn). **Mã chưa tới lượt giữ kết quả cũ** (để tham chiếu) — **KHÔNG xóa trắng toàn bộ trước**; cột trạng thái mã phân biệt "Đang tính" (chưa cập nhật) ↔ "Đã tính"/"Lỗi" (đã cập nhật). Xong toàn bộ → **chốt trạng thái lần tính** (Thành công / Hoàn thành có lỗi — BR-PRC-014, BR-PRC-016).
  - Ghi chú: mã từng "Đã tính" nay có thể thành "Lỗi" (vd dữ liệu đổi → tồn âm) và ngược lại — trạng thái lật khi tính tới mã đó, không cần reset toàn cục.

- [ ] **AC-3**: Chặn tính lại khi kỳ đã đóng
  - Tại: nút **"Tính lại"**.
  - Khi: kỳ kế toán chứa khoảng tính giá **đã đóng**.
  - Thì: hệ thống **chặn** tính lại → mã lỗi **`ERR-INV-024`**. Đóng kỳ KHÔNG vĩnh viễn — muốn tính lại thì **mở lại kỳ** (`FEAT-AP-EDIT`, BR-AP-011) rồi RECALC.

- [ ] **AC-3b**: Chặn tính lại khi đang có lần tính chạy nền
  - Tại: nút **"Tính lại"**.
  - Khi: đang có một lần tính **"Đang tính"** cho cùng **(kỳ + kho)** — bất kể do "Tính giá" (CREATE) hay "Tính lại" (RECALC) khởi tạo.
  - Thì: hệ thống **chặn** tính lại → mã lỗi **`ERR-INV-029`** (tránh 2 job cùng cập nhật giá vốn/sổ tồn của một kho — BR-PRC-016).

- [ ] **AC-4**: Mã lỗi khi tính lại
  - Tại: sau khi tính lại.
  - Khi: mã có **SL tồn âm** trong kỳ (lý do **"Do tồn âm"** — `ERR-INV-030`).
  - Thì: hệ thống đánh dấu mã **"Lỗi"** (không cập nhật mã đó), các mã khác hoàn tất; cập nhật bảng "Sản phẩm chạy giá lỗi" với lý do + hướng xử lý. (Lý do "Lệch hạch toán" — `ERR-INV-031` — thuộc [MỞ RỘNG TƯƠNG LAI], hạch toán chưa làm nên chưa bắt.)

### Nhóm B — Phân quyền

- [ ] **AC-5**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Tính lại: Mutation `[PROPOSED] RecalcCogsRun`.

## 5. Business Rules

- **BR-PRC-008**: Tính lại chạy lại tất cả mã trong log, ghi đè **kết quả tính** nhưng vẫn ghi **audit mới** mỗi lần; **chặn RECALC nếu kỳ đã đóng** (mở lại kỳ để tính lại).
- **BR-PRC-005**: cập nhật giá vốn phiếu xuất + **giá trị sổ tồn** từ kỳ trở đi (báo cáo tự đúng).
- **BR-PRC-007**: Mã lỗi không cập nhật. Lý do enum: "Do tồn âm" (`ERR-INV-030`, đang áp dụng) / "Lệch hạch toán" (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]).
- **BR-PRC-013**: không làm tròn đơn giá BQ; làm tròn giá trị tiền về đồng.
- **BR-PRC-015**: tính lại kỳ → các kỳ sau cần tính lại.
- **BR-PRC-016**: chặn chạy trùng — đang có lần tính "Đang tính" cùng (kỳ+kho) thì chặn cả CREATE lẫn RECALC (`ERR-INV-029`).
- **BR-AP-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Tính lại sau khi có phiếu nhập/xuất mới trong kỳ (kỳ chưa khóa) → cập nhật đúng theo dữ liệu mới.
- **EC-2**: Kỳ đã đóng → không cho tính lại; mở lại kỳ để RECALC.
- **EC-3**: Tính lại kỳ N (hoặc mở lại kỳ đã đóng + sửa phiếu) → tính lại **chỉ kỳ đó**; hệ thống **KHÔNG tự tính lại các kỳ sau**. Vì **tồn cuối (SL, GT) là input cho kỳ sau** (BR-PRC-015), người dùng **tự chạy lại RECALC cho từng kỳ sau bị ảnh hưởng** (theo thứ tự).

## 7. Out of Scope

- Tính lần đầu → `FEAT-PRC-CREATE`. Xem kết quả → `FEAT-PRC-DETAIL`. Xóa log → `FEAT-PRC-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-PRC-RECALC (mới) — tính lại tất cả mã trong 1 log (từ DETAIL), ghi đè kết quả + cập nhật giá vốn phiếu xuất + snapshot giá trị tồn + ghi log; chặn nếu kỳ đã đóng. |
| 2026-06-15 | 2 | Business Authority | Rà completeness: AC-2 làm rõ ghi đè **kết quả** nhưng vẫn ghi **audit mới** mỗi lần (B4); AC-3 thêm mã lỗi + hướng "mở lại kỳ để tính lại" (A1); EC-3 mới — tính lại 1 kỳ không tự cascade kỳ sau, user tự RECALC từng kỳ (A2). |
| 2026-06-15 | 3 | Business Authority | Tái thiết kế: AC-2 bỏ "đơn giá BQ/snapshot" → cập nhật **giá trị sổ tồn** từ kỳ trở đi (BR-PRC-005); EC-3 đổi "snapshot/đơn giá neo" → "tồn cuối (SL,GT)"; §5 thêm BR-PRC-005/015. |
| 2026-06-15 | 4 | Business Authority | Bổ sung cite phân quyền §5 (rà traceability V2). |
| 2026-06-16 | 5 | Business Authority | **Mã lỗi chạy giá**: AC-4 + §5 đổi "không tính được giá" chung → lý do **"Do tồn âm"** (`PRICING_NEGATIVE_STOCK`, đang áp dụng) / "Lệch hạch toán" (`PRICING_ACCOUNTING_MISMATCH`, [MỞ RỘNG TƯƠNG LAI]). |
| 2026-06-16 | 6 | Business Authority | Fix: sửa tham chiếu UX section §4 → §4B (luồng tính giá xuất kho). |
| 2026-06-16 | 7 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 8 | Business Authority | Đồng bộ tham chiếu UX: §4B → §6 (luồng PRC được đánh số lại liền mạch sau §5 trong UX-FLOW-INVENTORY-ACCOUNTING-PERIOD). |
| 2026-06-16 | 9 | Business Authority | **G2 — chặn chạy trùng phủ RECALC**: thêm **AC-3b** (chặn tính lại khi đang có lần tính "Đang tính" cùng kỳ+kho, do CREATE hay RECALC → `ERR-INV-029`); §5 thêm cite BR-PRC-016. |
| 2026-06-16 | 10 | Business Authority | **G2 ý 2 — RECALC chạy nền (ghi đè tại chỗ)**: thêm **AC-2b** — log → "Đang tính" → ghi đè kết quả từng mã tại chỗ, **mã chưa tới lượt giữ số cũ** (không xóa trắng trước), trạng thái mã lật dần → chốt (BR-PRC-016). |
| 2026-07-07 | 11 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Tính lại giá xuất kho BQGQ (PRC) thuộc nghiệp vụ kế toán — khớp SAP FI-CO / Misa / Fast / Odoo. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
