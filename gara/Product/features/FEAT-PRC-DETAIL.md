---
type: feature
artifact_kind: feature
status: PLANNED
version: 14
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-07"
---

# FEAT-PRC-DETAIL: Chi tiết lần tính giá xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DETAIL` |
| Title | Chi tiết lần tính giá xuất kho |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết một lần tính giá (mã đã tính, đơn giá BQ, số phiếu xuất cập nhật, mã lỗi), **so that** tôi kiểm tra kết quả tính giá và chạy lại khi cần.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách lịch sử, icon **Xem**.
  - Thì: hệ thống mở màn **"Xem khoản mục / Chi tiết lần tính giá"** với mô tả **"Xem thông tin lần tính giá, danh sách mã nội bộ đã tính và phiếu xuất được cập nhật giá vốn."**, các thẻ tổng quan + bảng chi tiết + nút **"Tính lại"**.

- [ ] **AC-2**: Thẻ tổng quan
  - Tại: đầu màn.
  - Thì: hệ thống hiển thị: **Từ ngày**, **Đến ngày**, **Kho**, **Trạng thái lần tính** — 1 trong 3 giá trị: **"Đang tính"** (đang chạy nền) / **"Thành công"** / **"Hoàn thành có lỗi"** (gồm cả khi toàn bộ mã lỗi — không có "Thất bại" riêng) (BR-PRC-014). Khi đang **"Đang tính"** → bảng chi tiết hiển thị tiến độ từng mã (**Đang tính / Đã tính / Lỗi**).

- [ ] **AC-3**: Bảng chi tiết theo mã
  - Tại: bảng chính.
  - Thì: hệ thống hiển thị cột: **"STT"**, **"Mã nội bộ"**, **"Tên hàng hóa"**, **"ĐVT chính"**, **"Tồn đầu kỳ (SL, GT)"**, **"Nhập trong kỳ (SL, GT)"**, **"Xuất trong kỳ (SL, GT)"**, **"SL cuối kỳ"**, **"Giá trị cuối kỳ"**, **"Đơn giá bình quân"**, **"Số phiếu xuất cập nhật"**, **"Trạng thái"** (Đã tính / Lỗi); dòng **Tổng**. **Cột "Đơn giá bình quân"** = (GT tồn đầu + GT nhập) / (SL tồn đầu + SL nhập) — **kết quả lần chạy giá** (BR-PRC-001), **làm tròn 2 chữ số thập phân ngay sau khi tính** và **dùng chính giá trị này để tính tiền vốn** (BR-PRC-013); cột hiển thị đúng giá trị 2 lẻ đó. **Đơn giá = 0 là hợp lệ** (mã chưa nhập / nhập tiền 0) — không phải lỗi. Giá trị tiền làm tròn về đồng. **Dòng "Lỗi"**: cột **SL cuối / Giá trị cuối / Đơn giá bình quân để trống** (chưa cập nhật). **Dòng "Tổng"**: cột **"Đơn giá bình quân" để trống** (cộng tổng đơn giá không có nghĩa — chỉ cộng SL / giá trị / số phiếu).

### Nhóm B — Bảng sản phẩm chạy lỗi

- [ ] **AC-4**: Danh sách mã lỗi
  - Tại: khu vực **"Danh sách sản phẩm chạy giá lỗi"**.
  - Khi: lần tính có mã lỗi.
  - Thì: hệ thống hiển thị bảng riêng gồm: **mã nội bộ, tên hàng hóa, lý do lỗi, hướng xử lý**. **Lý do lỗi** lấy từ enum (BR-PRC-007): hiện chỉ có **"Do tồn âm"** (`ERR-INV-030` — SL tồn mã trong kỳ âm); **"Lệch hạch toán"** (`ERR-INV-031`) thuộc **[MỞ RỘNG TƯƠNG LAI]** (hạch toán chưa làm). Khi **không có lỗi** → **ẩn** khu vực này. Mã lỗi không cập nhật giá vốn phiếu + giá trị tồn.

### Nhóm C — Tính lại

- [ ] **AC-5**: Nút Tính lại
  - Tại: nút **"Tính lại"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống chạy lại tính giá cho **tất cả mã** trong lần tính này → **ghi đè** kết quả (xem `FEAT-PRC-RECALC`). **Chặn** nếu kỳ đã đóng.

### Nhóm D — Phân quyền

- [ ] **AC-6**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89267&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Chi tiết lần tính: Query `[PROPOSED] GetCogsRun`.

## 5. Business Rules

- **BR-PRC-004**: tồn cuối kỳ (SL, GT) = điểm đầu lần tính sau; bảng hiển thị **SL cuối + Giá trị cuối + Đơn giá bình quân** (đơn giá suy ra từ công thức BR-PRC-001, không phải số được lưu).
- **BR-PRC-005**: cập nhật giá vốn phiếu xuất + giá trị sổ tồn (Số phiếu xuất cập nhật).
- **BR-PRC-007**: Mã lỗi không cập nhật; bảng lỗi (mã/tên/lý do/hướng xử lý). Lý do enum: "Do tồn âm" (`ERR-INV-030`, đang áp dụng) / "Lệch hạch toán" (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]).
- **BR-PRC-008**: Tính lại ghi đè kết quả (vẫn ghi audit mới); chặn RECALC nếu kỳ đã đóng.
- **BR-PRC-013**: **đơn giá BQ làm tròn 2 chữ số thập phân sau khi tính** (dùng để tính tiền vốn); giá trị tiền làm tròn về đồng; **cột "Đơn giá bình quân" hiển thị giá trị 2 lẻ đó**.
- **BR-PRC-014**: trạng thái lần tính (Đang tính / Thành công / Hoàn thành có lỗi — không có "Thất bại" riêng); trạng thái từng mã.
- **BR-PRC-016**: lưu phiếu trước (Đang tính) → chạy giá nền → cập nhật dần; chặn chạy trùng cùng kỳ+kho.
- **BR-PRC-015**: tính lại kỳ → các kỳ sau cần tính lại (cảnh báo).
- **BR-AP-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Không có mã lỗi → ẩn bảng "Sản phẩm chạy giá lỗi".
- **EC-2**: Một số mã lỗi **hoặc** toàn bộ mã lỗi → trạng thái lần tính đều = **"Hoàn thành có lỗi"** (không có "Thất bại" riêng — BR-PRC-014); mã lỗi không cập nhật giá vốn/giá trị tồn.
- **EC-3**: Mở DETAIL khi lần tính đang chạy → trạng thái **"Đang tính"**, thấy tiến độ từng mã; nút "Tính lại" chờ chạy xong (hoặc theo BR-PRC-016).

## 7. Out of Scope

- Thực hiện tính lần đầu → `FEAT-PRC-CREATE`. Xóa log → `FEAT-PRC-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-PRC-DETAIL (mới) — chi tiết lần tính: thẻ tổng quan + bảng theo mã (tồn đầu/nhập/xuất trong kỳ/đơn giá BQ/số phiếu xuất cập nhật/trạng thái) + bảng sản phẩm chạy lỗi (ẩn nếu không lỗi) + nút Tính lại. |
| 2026-06-15 | 2 | Business Authority | Rà completeness: AC-2 định nghĩa **enum trạng thái lần tính** 3 giá trị (BR-PRC-014); AC-3 ghi chú đơn giá BQ không làm tròn / tiền làm tròn đồng (BR-PRC-013); EC-2 chính xác hóa trạng thái theo số mã lỗi. |
| 2026-06-15 | 3 | Business Authority | Tái thiết kế: AC-3 **bỏ cột "Đơn giá bình quân" → thêm "SL cuối kỳ" + "Giá trị cuối kỳ"** (đơn giá suy ra = GT cuối/SL cuối); dòng lỗi để trống; §5 thêm BR-PRC-004/015. |
| 2026-06-15 | 4 | Business Authority | Bổ sung cite phân quyền §5 (rà traceability V2). |
| 2026-06-16 | 5 | Business Authority | **Chạy nền**: AC-2 enum trạng thái thêm **"Đang tính"** + bỏ "Thất bại" (toàn bộ lỗi → "Hoàn thành có lỗi"), hiển thị tiến độ từng mã; EC-2 gộp toàn-bộ-lỗi vào "Hoàn thành có lỗi", thêm EC-3 (mở DETAIL lúc đang chạy); §5 cập nhật BR-PRC-014 + thêm BR-PRC-016. |
| 2026-06-16 | 6 | Business Authority | **Mã lỗi chạy giá**: AC-4 + §5 nêu rõ **lý do lỗi enum** — "Do tồn âm" (`PRICING_NEGATIVE_STOCK`, đang áp dụng) / "Lệch hạch toán" (`PRICING_ACCOUNTING_MISMATCH`, [MỞ RỘNG TƯƠNG LAI]). |
| 2026-06-16 | 7 | Business Authority | **Giữ lại cột "Đơn giá bình quân"**: AC-3 thêm cột = (GT đầu+GT nhập)/(SL đầu+SL nhập) — kết quả chạy giá, hiển thị **2 số lẻ**, đơn giá=0 hợp lệ (mã chưa nhập/nhập tiền 0), dòng lỗi để trống; §5 BR-PRC-004/013 cập nhật theo. Không ẩn dòng nào (kết quả khớp danh sách input; lọc do người dùng xóa dòng ở form). |
| 2026-06-16 | 8 | Business Authority | Fix: sửa tham chiếu UX section §4 → §4B (luồng tính giá xuất kho). |
| 2026-06-16 | 9 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 10 | Business Authority | Đồng bộ tham chiếu UX: §4B → §6 (luồng PRC được đánh số lại liền mạch sau §5 trong UX-FLOW-INVENTORY-ACCOUNTING-PERIOD). |
| 2026-06-16 | 11 | Business Authority | **G4 — dòng "Tổng"**: AC-3 ghi rõ cột "Đơn giá bình quân" ở dòng Tổng **để trống** (cộng tổng đơn giá vô nghĩa — chỉ cộng SL/giá trị/số phiếu). |
| 2026-06-16 | 12 | Business Authority | Đổi làm tròn đơn giá BQ (BR-PRC-013): cột "Đơn giá bình quân" = **làm tròn 2 chữ số thập phân sau khi tính** và **dùng giá trị đó để tính tiền vốn** (không còn "chỉ hiển thị / giữ full precision"). |
| 2026-06-26 | 13 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89267`. Mobile chưa có. |
| 2026-07-07 | 14 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Tính giá xuất kho BQGQ (PRC) thuộc nghiệp vụ kế toán (kho tracks SL, kế toán tính money/costing) — khớp SAP FI-CO / Misa / Fast / Odoo. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
