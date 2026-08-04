---
type: feature
artifact_kind: feature
status: PLANNED
version: 21
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-24"
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

- [ ] **AC-1**: Trigger tính lại toàn bộ (v12 — rename từ "Trigger tính lại")
  - Tại: màn chi tiết lần tính (`FEAT-PRC-DETAIL`), nút **"Tính lại toàn bộ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống chạy lại tính giá BQGQ với scope `ALL`, cùng **kỳ + kho + khoảng ngày** của lần tính gốc, áp đúng công thức như `FEAT-PRC-CREATE`. Nếu lần tính gốc là **"Tất cả mã"**, server resolve lại toàn bộ mã BQGQ **Đang hoạt động** của garage theo predicate đã lưu (**không lọc catalog theo kỳ/kho**; kỳ/kho chỉ là ngữ cảnh tính). Nếu lần tính gốc là **"Chọn mã cụ thể"**, hệ thống chạy lại danh sách mã đã chọn đã lưu trong log sau khi revalidate trạng thái **Đang hoạt động**. Scope thực tế sau revalidate chỉ gồm mã còn **Đang hoạt động** — mã đã **"Ngừng hoạt động"** bị bỏ qua + cảnh báo (wording verbatim per BR-PRC-009), không tính là mã lỗi.

- [ ] **AC-1b**: Trigger tính lại mã lỗi (v12 — mới, đề phòng job gián đoạn/hạ tầng)
  - Tại: màn chi tiết lần tính (`FEAT-PRC-DETAIL`), nút **"Tính lại mã lỗi"**.
  - Khi: lần tính có ít nhất 1 mã trạng thái "Lỗi", chủ garage nhấn.
  - Thì: hệ thống chạy lại tính giá BQGQ **chỉ cho các mã đang trạng thái "Lỗi"** đã lưu trong lần tính đó và còn **Đang hoạt động** (scope `ERROR_ONLY`) — **mã "Đã tính" giữ nguyên kết quả, KHÔNG recompute**. Mã lỗi đã chuyển **"Ngừng hoạt động"** bị bỏ qua + cảnh báo (wording verbatim per BR-PRC-009), **không** tạo lỗi mới. Áp đúng công thức như `FEAT-PRC-CREATE` cho từng mã lỗi còn đủ điều kiện. Thông tin scope lần chạy gần nhất của lần tính hiện tại ghi nhận `ERROR_ONLY` (phân biệt với scope `ALL`).

- [ ] **AC-2**: Ghi đè kết quả
  - Tại: sau khi tính lại.
  - Thì: hệ thống **ghi đè kết quả tính** cũ — cập nhật lại **giá vốn các phiếu xuất trong kỳ/kho của các mã thuộc scope tính lại sau khi lọc mã đủ điều kiện** + **giá trị sổ tồn từ kỳ trở đi** (báo cáo tự đúng — BR-PRC-005); tồn cuối (SL, GT) cập nhật. Thông tin **người thực hiện / ngày giờ thực hiện / scope / trạng thái** trên lần tính hiện tại phản ánh **lần chạy gần nhất**.

- [ ] **AC-2b**: Chạy nền — ghi đè tại chỗ (không xóa trắng)
  - Tại: nút **"Tính lại toàn bộ"** hoặc **"Tính lại mã lỗi"**.
  - Khi: chủ garage nhấn (kỳ chưa đóng, không bị chặn trùng).
  - Thì: hệ thống chuyển log về trạng thái **"Đang tính"** → chạy lại **từng mã ở nền** (giống `FEAT-PRC-CREATE` AC-8b); trước khi chạy từng scope, server chỉ giữ mã đủ điều kiện BQGQ + **Đang hoạt động**. Khi một mã đã **chốt giá cuối** (bao gồm tính lặp BR-PRC-017 nếu có) thì **ghi đè kết quả + trạng thái mã đó tại chỗ** (giá vốn phiếu xuất + giá trị sổ tồn) nếu log có chi tiết mã. Với log scope **"Tất cả mã"** không lưu toàn bộ mã thành công, hệ thống cập nhật **log tổng hợp + danh sách mã lỗi**; không cần tạo/lưu dòng thành công cho toàn bộ mã. **Mã chưa tới lượt giữ kết quả cũ** (để tham chiếu, nếu có chi tiết mã) — **KHÔNG xóa trắng toàn bộ trước**; cột trạng thái mã phân biệt "Đang tính" (chưa cập nhật) ↔ "Đã tính"/"Lỗi" (đã cập nhật). Xong toàn bộ → **chốt trạng thái lần tính** (Thành công / Hoàn thành có lỗi — BR-PRC-014, BR-PRC-016).
  - Ghi chú: mã từng "Đã tính" nay có thể thành "Lỗi" (vd dữ liệu đổi → tồn âm) và ngược lại — trạng thái lật khi tính tới mã đó, không cần reset toàn cục.

- [ ] **AC-3**: Chặn tính lại khi kỳ đã đóng (v12 — áp cho cả 2 nút)
  - Tại: nút **"Tính lại toàn bộ"** (AC-1) hoặc **"Tính lại mã lỗi"** (AC-1b).
  - Khi: kỳ kế toán chứa khoảng tính giá **đã đóng**.
  - Thì: hệ thống **chặn** tính lại → mã lỗi **`ERR-INV-024`**. Đóng kỳ KHÔNG vĩnh viễn — muốn tính lại thì **mở lại kỳ** (`FEAT-AP-EDIT`, BR-AP-011) rồi RECALC.

- [ ] **AC-3b**: Chặn tính lại khi đang có lần tính chạy nền (v12 — áp cho cả 2 nút)
  - Tại: nút **"Tính lại toàn bộ"** (AC-1) hoặc **"Tính lại mã lỗi"** (AC-1b).
  - Khi: đang có một lần tính **"Đang tính"** cho cùng **(kỳ + kho)** — bất kể do "Tính giá" (CREATE) hay "Tính lại" (RECALC) khởi tạo.
  - Thì: hệ thống **chặn** tính lại → mã lỗi **`ERR-INV-029`** (tránh 2 job cùng cập nhật giá vốn/sổ tồn của một kho — BR-PRC-016).

- [ ] **AC-4**: Mã lỗi khi tính lại
  - Tại: sau khi tính lại.
  - Khi: mã rơi vào một trong các lý do lỗi hợp lệ: **"Do tồn âm"** (`ERR-INV-030`, đang áp dụng), **"Lệch hạch toán"** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]), hoặc **"Do sự cố hệ thống"** (`ERR-INV-052`, mã chưa tới lượt tính khi job gián đoạn / hết retry).
  - Thì: hệ thống đánh dấu mã **"Lỗi"** (không cập nhật mã đó), các mã khác hoàn tất; hiển thị mã lỗi trong bảng chi tiết/log lỗi của `FEAT-PRC-DETAIL` bằng **"Trạng thái" = "Lỗi"** + cột **"Lí do lỗi"**. Không có bảng lỗi riêng / cột hướng xử lý; hướng xử lý nằm ở 2 nút **"Tính lại mã lỗi"** hoặc **"Tính lại toàn bộ"**. Mã lỗi do **"Do sự cố hệ thống"** được cover bởi cả scope `ALL` và scope `ERROR_ONLY` vì vẫn là mã trạng thái **"Lỗi"**.

### Nhóm B — Phân quyền

- [ ] **AC-5**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Tính lại: Mutation `[PROPOSED] RecalcCogsRun`.

## 5. Business Rules

- **BR-PRC-008**: Tính lại hỗ trợ 2 scope `ALL` / `ERROR_ONLY`; với log gốc **"Tất cả mã"**, scope `ALL` resolve lại theo predicate BQGQ + Đang hoạt động của garage, còn `ERROR_ONLY` chạy danh sách mã lỗi đã lưu sau khi revalidate trạng thái Đang hoạt động; ghi đè **kết quả tính** và cập nhật thông tin lần chạy gần nhất trên lần tính hiện tại; **chặn RECALC nếu kỳ đã đóng** (mở lại kỳ để tính lại).
- **BR-PRC-005**: cập nhật giá vốn phiếu xuất + **giá trị sổ tồn** từ kỳ trở đi (báo cáo tự đúng).
- **BR-PRC-007**: Mã lỗi không cập nhật; hiển thị trong bảng chi tiết/log lỗi bằng **"Trạng thái" = "Lỗi"** + cột **"Lí do lỗi"**. Lý do enum: "Do tồn âm" (`ERR-INV-030`, đang áp dụng) / "Lệch hạch toán" (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]) / "Do sự cố hệ thống" (`ERR-INV-052`, job gián đoạn / hết retry).
- **BR-PRC-013**: đơn giá BQ làm tròn 2 chữ số thập phân ngay sau khi tính; dùng giá trị 2 lẻ này để tính tiền vốn, rồi làm tròn tiền về đồng.
- **BR-PRC-017**: nếu có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu cùng kỳ thì RECALC dùng cùng cơ chế **tính lặp tạm** như CREATE; chỉ sau khi hội tụ/chốt giá mới ghi đè thật phiếu xuất / phiếu nhập kế thừa / sổ tồn.
- **BR-PRC-015**: tính lại kỳ → các kỳ sau cần tính lại.
- **BR-PRC-016**: chặn chạy trùng — đang có lần tính "Đang tính" cùng (kỳ+kho) thì chặn cả CREATE lẫn RECALC (`ERR-INV-029`).
- **BR-AP-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Tính lại sau khi có phiếu nhập/xuất mới trong kỳ (kỳ chưa khóa) → cập nhật đúng theo dữ liệu mới.
- **EC-2**: Kỳ đã đóng → không cho tính lại; mở lại kỳ để RECALC.
- **EC-3**: Tính lại kỳ N (hoặc mở lại kỳ đã đóng + sửa phiếu) → tính lại **chỉ kỳ đó**; hệ thống **KHÔNG tự tính lại các kỳ sau**. Vì **tồn cuối (SL, GT) là input cho kỳ sau** (BR-PRC-015), người dùng **tự chạy lại RECALC cho từng kỳ sau bị ảnh hưởng** (theo thứ tự).
- **EC-4**: Mã trong scope RECALC đã chuyển **"Ngừng hoạt động"** trước khi job bắt đầu → hệ thống chỉ chạy các mã còn **"Đang hoạt động"** — bỏ qua + cảnh báo (wording verbatim per BR-PRC-009); không ghi đè lại mã đó và không hiển thị như dòng **"Lỗi"**.

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
| 2026-07-20 | 12 | Business Authority (user sonhoang directive 2026-07-20) | **Thêm nút "Tính lại mã lỗi" (partial retry, đề phòng job gián đoạn/hạ tầng)** — screenshot UI hiện tại cho thấy 2 nút thay vì 1 nút "Tính lại". AC-1 rename → "Trigger tính lại toàn bộ" (scope `ALL`, hành vi không đổi). Thêm **AC-1b** — nút "Tính lại mã lỗi" chạy scope `ERROR_ONLY` (chỉ mã "Lỗi" trong log hiện tại, mã "Đã tính" giữ nguyên không recompute). AC-3/AC-3b cập nhật áp dụng cho cả 2 nút (kỳ đóng + chặn trùng). Cascade: `FEAT-PRC-DETAIL` v15 (AC-5/AC-5b), `BR-GF-INVENTORY-ACCOUNTING-PERIOD` BR-PRC-008. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v11 → v12. |
| 2026-07-21 | 13 | Business Authority (user directive) | **Sync W06 Product drift**: AC-2b dùng đúng 2 nút `Tính lại toàn bộ` / `Tính lại mã lỗi`; AC-4 + §5 đồng bộ BR-PRC-007 v30 với 3 lý do lỗi, thêm **"Do sự cố hệ thống"** (`ERR-INV-052`); §5 đồng bộ BR-PRC-013 hiện hành — đơn giá BQ làm tròn 2 chữ số thập phân ngay sau khi tính và dùng giá trị 2 lẻ để tính tiền vốn. |
| 2026-07-21 | 14 | Business Authority (user directive) | **Đồng bộ scope "Tất cả mã" mới**: `ALL` của log gốc "Tất cả mã" resolve lại toàn bộ mã BQGQ của garage theo predicate, không dựa vào danh sách mã thành công đã lưu; `ERROR_ONLY` vẫn chạy danh sách mã lỗi đã lưu. |
| 2026-07-22 | 15 | Business Authority (user directive) | **RECALC revalidate trạng thái mã trước khi chạy**: `ALL` và `ERROR_ONLY` chỉ chạy mã BQGQ còn **Đang hoạt động**. |
| 2026-07-22 | 16 | Business Authority (user directive) | **Align RECALC theo screenshot DETAIL/RECALC mới**: mã lỗi sau tính lại hiển thị trong bảng chi tiết bằng **Trạng thái = Lỗi** + cột **"Lí do lỗi"**; bỏ mô tả bảng lỗi riêng / cột hướng xử lý. |
| 2026-07-22 | 17 | Business Authority (user directive) | **Làm rõ RECALC với tính lặp BR-PRC-017**: ghi đè từng mã chỉ sau khi mã đã chốt giá cuối; nếu có phiếu trả tự tham chiếu thì vòng lặp dùng giá trị tạm, hội tụ/chốt giá xong mới cập nhật thật phiếu xuất / phiếu nhập kế thừa / sổ tồn. |
| 2026-07-22 | 18 | Business Authority (user directive) | **Làm rõ RECALC cập nhật trên lần tính hiện tại**: kết quả tính ghi đè trên lần tính hiện tại; người thực hiện, ngày giờ thực hiện, scope và trạng thái phản ánh lần chạy gần nhất. |
| 2026-07-22 | 19 | Business Authority (user directive) | **Chốt scope thực tế RECALC theo trạng thái mã**: hệ thống chỉ chạy mã còn **Đang hoạt động**. |
| 2026-07-22 | 20 | Business Authority (user directive) | **Chốt wording scope mã Đang hoạt động khi RECALC**: mô tả trực tiếp scope thực tế chỉ gồm mã còn **Đang hoạt động** sau revalidate. |
| 2026-07-24 | 21 | Business Authority (user directive) | **Cascade cite toast wording verbatim per BR-PRC-009** — 3 vị trí (AC-1 / AC-1b / EC-4) thêm cụm "(wording verbatim per BR-PRC-009)" sau "cảnh báo" để trỏ dev về source rule. Single source of truth cho toast wording "Đã bỏ qua N mã do ngừng hoạt động". Resolve cascade L1 W06. v20 → v21. |
