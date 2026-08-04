---
type: feature
artifact_kind: feature
status: PLANNED
version: 24
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-22"
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

**As** chủ garage / kế toán, **I want** xem chi tiết một lần tính giá (kết quả tổng hợp, mã đã tính khi có lưu chi tiết, số phiếu xuất cập nhật, mã lỗi), **so that** tôi kiểm tra kết quả tính giá và chạy lại khi cần.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị chi tiết

- [ ] **AC-1**: Mở màn chi tiết
  - Tại: danh sách lịch sử, icon **Xem**.
  - Thì: hệ thống mở màn **"Xem khoản mục / Chi tiết lần tính giá"** với mô tả **"Xem thông tin lần tính giá, kết quả tổng hợp, danh sách mã nội bộ đã tính nếu có và phiếu xuất được cập nhật giá vốn."**, cụm thông tin đầu màn + bảng chi tiết/lỗi theo mã (nếu log có chi tiết mã hoặc có mã lỗi) + 2 nút góc phải: **"Tính lại mã lỗi"** (secondary) + **"Tính lại toàn bộ"** (primary) (v15 — xem AC-5/AC-5b).

- [ ] **AC-2**: Cụm thông tin đầu màn
  - Tại: đầu màn.
  - Thì: hệ thống hiển thị đúng các trường theo layout Figma/screenshot: **Tên kỳ kế toán**, **Từ ngày**, **Đến ngày**, **Kho**, **Phương pháp tính giá**, **Người thực hiện**, **Ngày giờ thực hiện**, **Trạng thái**. Với lần tính đã RECALC, **Người thực hiện**, **Ngày giờ thực hiện** và **Trạng thái** phản ánh lần chạy gần nhất. **Trạng thái** là 1 trong 3 giá trị: **"Đang tính"** (đang chạy nền) / **"Thành công"** / **"Hoàn thành có lỗi"** (gồm cả khi toàn bộ mã lỗi — không có "Thất bại" riêng) (BR-PRC-014). Các chỉ số tổng hợp như **phạm vi mã / số mã đã resolve / số mã thành công / số mã lỗi** là dữ liệu log server-side, không hiển thị thành field riêng ở cụm đầu màn này. Khi đang **"Đang tính"** → nếu log có chi tiết mã thì bảng chi tiết hiển thị tiến độ từng mã (**Đang tính / Đã tính / Lỗi**); nếu scope **"Tất cả mã"** không lưu toàn bộ chi tiết mã thành công thì hiển thị tiến độ dạng tổng hợp.

- [ ] **AC-2c**: Tự động cập nhật tiến độ (v18 — mới)
  - Tại: toàn màn Chi tiết.
  - Khi: trạng thái lần tính = **"Đang tính"**.
  - Thì: FE **tự động polling** (gọi lại query lấy chi tiết lần tính) mỗi **5 giây** để cập nhật cụm thông tin đầu màn + bảng chi tiết/lỗi theo mã nếu có + tiến độ tổng hợp — **không cần user refresh tay**. Dừng polling ngay khi trạng thái chuyển sang trạng thái cuối (**"Thành công"** / **"Hoàn thành có lỗi"**). Khi chuyển trạng thái cuối → hiển thị **toast thông báo** (VD: "Tính giá hoàn tất — X/Y mã thành công").

- [ ] **AC-2b**: Tìm kiếm + bộ lọc bảng chi tiết (v23 — khớp screenshot UI)
  - Tại: thanh công cụ trên bảng chi tiết (dưới thẻ tổng quan).
  - Thì: hệ thống chỉ hiển thị **ô tìm kiếm** ("Tìm theo mã và tên sản phẩm nội bộ" — filter theo Mã nội bộ hoặc Tên sản phẩm nội bộ, khớp một phần chuỗi) và **filter "Trạng thái"** (dropdown: Tất cả / Đã tính / Lỗi — lọc theo cột Trạng thái của bảng chi tiết AC-3). **Không** hiển thị filter riêng **"Ngày thực hiện"** hoặc **"Kho"** tại khu vực bảng chi tiết vì 2 thông tin này đã nằm ở cụm thông tin đầu màn của lần tính. Các filter áp dụng **client-side trên tập mã chi tiết/lỗi đang hiển thị** (không gọi lại API tính giá). Với scope **"Tất cả mã"** không lưu toàn bộ mã thành công, thanh filter bảng chính chỉ hiển thị khi có bảng chi tiết mã hoặc có mã lỗi cần hiển thị. Xóa hết filter → hiển thị đầy đủ mã chi tiết/lỗi đang có.

- [ ] **AC-3**: Bảng chi tiết theo mã
  - Tại: bảng chính.
  - Thì: với scope **"Chọn mã cụ thể"** hoặc log có lưu chi tiết mã/lỗi, hệ thống hiển thị cột (v23 — khớp screenshot UI): **"STT"**, **"Mã nội bộ"**, **"Tên sản phẩm nội bộ"**, **"ĐVT chính"**, **"Tồn đầu kỳ (SL, GT)"**, **"Nhập trong kỳ (SL, GT)"**, **"Xuất trong kỳ (SL, GT)"**, **"Giá bình quân"**, **"Số phiếu xuất cập nhật"**, **"Trạng thái"** (Đang tính / Đã tính / Lỗi), **"Lí do lỗi"**; dòng **Tổng**. **Cột "Giá bình quân"** = (GT tồn đầu + GT nhập) / (SL tồn đầu + SL nhập) — **kết quả lần chạy giá** (BR-PRC-001), **làm tròn 2 chữ số thập phân ngay sau khi tính** và **dùng chính giá trị này để tính tiền vốn** (BR-PRC-013); cột hiển thị đúng giá trị 2 lẻ đó. **Giá bình quân = 0 là hợp lệ** (mã chưa nhập / nhập tiền 0) — không phải lỗi. Giá trị tiền làm tròn về đồng. **Dòng "Đã tính"**: cột **"Lí do lỗi"** để trống / "—". **Dòng "Lỗi"**: cột **"Giá bình quân" để trống** (chưa cập nhật) và cột **"Lí do lỗi"** hiển thị lý do lỗi hợp lệ (AC-4). **Dòng "Tổng"**: cột **"Giá bình quân"** và **"Lí do lỗi"** để trống (cộng tổng đơn giá/lý do không có nghĩa — chỉ cộng SL / giá trị / số phiếu).
  - Với scope **"Tất cả mã"**: hệ thống **không bắt buộc lưu/hiển thị toàn bộ mã thành công**; màn chi tiết hiển thị cụm thông tin đầu màn AC-2 + các dòng mã lỗi theo AC-4 nếu có. Nếu log đang **"Đang tính"**, tiến độ có thể hiển thị dạng tổng hợp (đã xử lý / thành công / lỗi), không cần danh sách toàn bộ mã.
  - **Ghi chú (v16 — BA sonhoang chốt bỏ 2 cột sau khi xác nhận không ảnh hưởng công thức):** "SL cuối kỳ" + "Giá trị cuối kỳ" bỏ khỏi UI theo screenshot thực tế — **KHÔNG ảnh hưởng công thức tính** (BQGQ chỉ cần Tồn đầu + Nhập trong kỳ, đã có sẵn 2 cột; kỳ sau tự truy vấn sổ tồn sống, không đọc field lưu trên log này — BR-PRC-002/004). User cần SL/GT cuối kỳ vẫn tự suy ra = Tồn đầu + Nhập − Xuất (3 cột này còn hiển thị), hoặc xem báo cáo `FEAT-STK-DETAIL-V2` (thẻ kho).

### Nhóm B — Mã sản phẩm chạy lỗi

- [ ] **AC-4**: Hiển thị mã lỗi trong bảng chi tiết
  - Tại: bảng chi tiết theo mã (AC-3).
  - Khi: lần tính có mã lỗi.
  - Thì: hệ thống **không hiển thị bảng lỗi riêng**. Mã lỗi hiển thị ngay trong bảng chi tiết theo mã với **"Trạng thái" = "Lỗi"** và cột **"Lí do lỗi"**. Người dùng có thể chọn filter **"Trạng thái: Lỗi"** để xem riêng các mã lỗi. **Lí do lỗi** lấy từ enum 3 giá trị (BR-PRC-007, v19): **"Do tồn âm"** (`ERR-INV-030` — SL tồn mã trong kỳ âm); **"Lệch hạch toán"** (`ERR-INV-031`) thuộc **[MỞ RỘNG TƯƠNG LAI]** (hạch toán chưa làm); **"Do sự cố hệ thống"** (`ERR-INV-052` — mã chưa tới lượt tính do job gián đoạn/hết retry, BR-PRC-014). **Không** có cột **"Hướng xử lý"** trên bảng; hướng xử lý nằm ở hành động màn hình: bấm **"Tính lại mã lỗi"** hoặc **"Tính lại toàn bộ"**. Khi **không có lỗi** → không có dòng trạng thái **"Lỗi"**, cột **"Lí do lỗi"** để trống cho các dòng **"Đã tính"**. Mã lỗi không cập nhật giá vốn phiếu + giá trị tồn. Mã **"Ngừng hoạt động"** bị bỏ qua theo BR-PRC-012/016, **không** hiển thị như mã lỗi.

### Nhóm C — Tính lại

- [ ] **AC-5**: Nút Tính lại toàn bộ (v15 — rename từ "Tính lại")
  - Tại: nút **"Tính lại toàn bộ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống chạy lại tính giá scope `ALL` theo scope gốc của log: nếu log gốc là **"Tất cả mã"** thì server resolve lại toàn bộ mã BQGQ **Đang hoạt động** của garage theo predicate đã lưu; nếu log gốc là **"Chọn mã cụ thể"** thì chạy lại danh sách mã đã chọn trong log sau khi revalidate trạng thái **Đang hoạt động** → **ghi đè** kết quả (xem `FEAT-PRC-RECALC` AC-1). Mã đã **"Ngừng hoạt động"** bị bỏ qua, không tính là lỗi. **Chặn** nếu kỳ đã đóng.

- [ ] **AC-5b**: Nút Tính lại mã lỗi (v15 — mới)
  - Tại: nút **"Tính lại mã lỗi"**.
  - Khi: lần tính có ít nhất 1 mã trạng thái "Lỗi", chủ garage nhấn.
  - Thì: hệ thống chạy lại chỉ các mã "Lỗi" (scope `ERROR_ONLY`) còn **Đang hoạt động** — mã "Đã tính" giữ nguyên, không recompute; mã lỗi đã chuyển **"Ngừng hoạt động"** bị bỏ qua, không tạo lỗi mới (xem `FEAT-PRC-RECALC` AC-1b). Chặn nếu kỳ đã đóng. Nút ẩn/disable khi trạng thái lần tính = "Thành công" (không có mã lỗi).

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

- **BR-PRC-004**: tồn cuối kỳ (SL, GT) = điểm đầu lần tính sau (đơn giá suy ra từ công thức BR-PRC-001, không phải số được lưu); bảng chi tiết (v16) chỉ hiển thị **Giá bình quân** — "SL cuối"/"Giá trị cuối" bỏ khỏi UI, tự suy ra từ Tồn đầu + Nhập − Xuất nếu cần.
- **BR-PRC-005**: cập nhật giá vốn phiếu xuất + giá trị sổ tồn (Số phiếu xuất cập nhật).
- **BR-PRC-007**: Mã lỗi không cập nhật; hiển thị trong bảng chi tiết bằng **"Trạng thái" = "Lỗi"** + cột **"Lí do lỗi"** (không có bảng lỗi riêng / cột hướng xử lý). Lý do enum: **"Do tồn âm"** (`ERR-INV-030`, đang áp dụng) / **"Lệch hạch toán"** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]) / **"Do sự cố hệ thống"** (`ERR-INV-052`, job gián đoạn / hết retry).
- **BR-PRC-008**: Tính lại hỗ trợ 2 scope — `ALL` (AC-5; log gốc "Tất cả mã" resolve lại theo predicate BQGQ + Đang hoạt động của garage, log gốc "Chọn mã cụ thể" chạy danh sách đã chọn sau khi revalidate trạng thái) / `ERROR_ONLY` (AC-5b v15, chỉ ghi đè mã "Lỗi" còn Đang hoạt động); cả 2 cập nhật kết quả và thông tin lần chạy gần nhất trên lần tính hiện tại; chặn RECALC nếu kỳ đã đóng.
- **BR-PRC-013**: **đơn giá BQ làm tròn 2 chữ số thập phân sau khi tính** (dùng để tính tiền vốn); giá trị tiền làm tròn về đồng; **cột "Giá bình quân" hiển thị giá trị 2 lẻ đó**.
- **BR-PRC-014**: trạng thái lần tính (Đang tính / Thành công / Hoàn thành có lỗi — không có "Thất bại" riêng); trạng thái từng mã.
- **BR-PRC-016**: lưu phiếu trước (Đang tính) → chạy giá nền → cập nhật dần; chặn chạy trùng cùng kỳ+kho.
- **BR-PRC-015**: tính lại kỳ → các kỳ sau cần tính lại (cảnh báo).
- **BR-AP-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Không có mã lỗi → không có dòng **"Lỗi"**; filter **"Trạng thái: Lỗi"** trả về rỗng; cột **"Lí do lỗi"** trống / "—" cho các dòng **"Đã tính"**.
- **EC-2**: Một số mã lỗi **hoặc** toàn bộ mã lỗi → trạng thái lần tính đều = **"Hoàn thành có lỗi"** (không có "Thất bại" riêng — BR-PRC-014); mã lỗi không cập nhật giá vốn/giá trị tồn.
- **EC-3**: Mở DETAIL khi lần tính đang chạy → trạng thái **"Đang tính"**, thấy tiến độ từng mã; nút "Tính lại" chờ chạy xong (hoặc theo BR-PRC-016).
- **EC-4** (v15): Lần tính "Đang tính" hoặc "Thành công" (không có mã lỗi) → nút "Tính lại mã lỗi" (AC-5b) ẩn/disable; chỉ nút "Tính lại toàn bộ" (AC-5) khả dụng.
- **EC-5**: Mã trong log đã chuyển **"Ngừng hoạt động"** sau lần tính gốc → không hiển thị như dòng **"Lỗi"** mới khi xem DETAIL; nếu RECALC thì mã đó bị bỏ qua theo BR-PRC-008/016.

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
| 2026-07-20 | 15 | Business Authority (user sonhoang directive 2026-07-20) | **Thêm nút "Tính lại mã lỗi" (partial retry, đề phòng job gián đoạn/hạ tầng)** — screenshot UI hiện tại cho thấy 2 nút "Tính lại mã lỗi" + "Tính lại toàn bộ" thay vì 1 nút "Tính lại". AC-5 rename "Tính lại" → "Tính lại toàn bộ" (scope `ALL`, không đổi hành vi). Thêm **AC-5b** — nút "Tính lại mã lỗi" chạy scope `ERROR_ONLY` (chỉ mã "Lỗi", mã "Đã tính" giữ nguyên); ẩn/disable khi không có mã lỗi. Thêm **EC-4** (nút ẩn/disable khi Thành công/Đang tính). §5 BR-PRC-008 mở rộng 2 scope. AC-4 thêm NEED CONFIRMATION — screenshot cho thấy khả năng structure bảng lỗi khác spec (filter Trạng thái trên bảng chính thay vì bảng riêng); chưa đổi AC-4, chờ Figma web ratify. Cascade: `FEAT-PRC-RECALC` v12 (AC-1b), `BR-GF-INVENTORY-ACCOUNTING-PERIOD` BR-PRC-008. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v14 → v15. |
| 2026-07-20 | 17 | Business Authority (user sonhoang directive 2026-07-20, batch 2) | **Rename cột + bỏ 2 cột + thêm AC filter/search** — khớp screenshot UI. (1) AC-3 + AC-4: đổi tên cột **"Tên hàng hóa" → "Tên sản phẩm nội bộ"** (đồng bộ `FEAT-PRC-CREATE` v22, `FEAT-PRC-LIST` không có cột này). (2) AC-3: đổi tên cột **"Đơn giá bình quân" → "Giá bình quân"**; §5 BR-PRC-004/013 cite cập nhật theo. (3) AC-3: **bỏ 2 cột "SL cuối kỳ" + "Giá trị cuối kỳ"** khỏi bảng chi tiết — xác nhận KHÔNG ảnh hưởng công thức BQGQ (kỳ sau tự truy vấn sổ tồn sống, không đọc field trên log này — BR-PRC-002/004); user vẫn tự suy ra SL/GT cuối = Tồn đầu + Nhập − Xuất nếu cần, hoặc xem `FEAT-STK-DETAIL-V2`. (4) Thêm **AC-2b** — khu vực tìm kiếm ("Tìm theo mã và tên sản phẩm nội bộ") + filter Ngày thực hiện/Kho/Trạng thái trên bảng chi tiết (client-side, không gọi lại API). (5) AC-4 giữ nguyên NEED CONFIRMATION (v15) — chưa đổi cấu trúc bảng lỗi, chờ Figma ratify. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v15 → v17 (v16 transient — bị mất do git stash sự cố giữa phiên làm việc, gộp changelog vào entry này). |
| 2026-07-20 | 18 | Business Authority (user sonhoang directive 2026-07-20, batch 5) | **Thêm AC-2c polling + toast; fix cross-ref AC-5** — user hỏi rõ điều hướng UI 2 nút Tính lại. (1) Thêm **AC-2c**: khi "Đang tính", FE tự động polling mỗi **5 giây** cập nhật thẻ tổng quan + bảng chi tiết, dừng khi đạt trạng thái cuối; hiển thị **toast thông báo** khi hoàn tất (chốt: 5s + có toast, sau khi cân nhắc 3s "nhiều quá" — đổi 5s giảm ~40% tải). (2) AC-5 cross-ref sửa `(xem FEAT-PRC-RECALC)` → `(xem FEAT-PRC-RECALC AC-1)` — đối xứng AC-5b đã trỏ cụ thể AC-1b. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v17 → v18. |
| 2026-07-20 | 19 | Business Authority (user sonhoang directive 2026-07-20, batch 6) | **AC-4 thêm lý do lỗi "Do sự cố hệ thống" (`ERR-INV-052`)** — resolve gap taxonomy job gián đoạn (BR-PRC-014/016). Enum lý do lỗi bảng "Sản phẩm chạy giá lỗi" mở rộng 2→3 giá trị. Cascade `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v30 (BR-PRC-007/014) + `ERROR-CODE-REGISTRY.md` v27 (đăng ký ERR-INV-052). Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v18 → v19. |
| 2026-07-21 | 20 | Business Authority (user directive) | **Cascade nốt PRC error enum trong §5 Business Rules** — `BR-PRC-007` tại §5 giờ liệt kê đủ 3 lý do lỗi: **"Do tồn âm"** (`ERR-INV-030`) / **"Lệch hạch toán"** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]) / **"Do sự cố hệ thống"** (`ERR-INV-052`). AC-4 version ref sửa v18 → v19 cho đúng changelog. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v19 → v20. |
| 2026-07-21 | 21 | Business Authority (user directive) | **Đồng bộ scope "Tất cả mã" mới**: detail hiển thị log tổng hợp + mã lỗi; không bắt buộc lưu/hiển thị toàn bộ mã thành công. Bổ sung thẻ phạm vi mã + số mã resolve/thành công/lỗi; `Tính lại toàn bộ` với log gốc "Tất cả mã" resolve lại predicate BQGQ của garage. |
| 2026-07-22 | 22 | Business Authority (user directive) | **Đồng bộ điều kiện mã Đang hoạt động trong DETAIL/RECALC entry point**: số mã resolve không tính mã Ngừng hoạt động; bảng lỗi không hiển thị mã bị bỏ qua do Ngừng hoạt động; 2 nút tính lại chỉ chạy mã còn Đang hoạt động. |
| 2026-07-22 | 23 | Business Authority (user directive) | **Align FEAT-PRC-DETAIL theo 2 screenshot mới**: cụm thông tin đầu màn dùng field **Tên kỳ kế toán / Từ ngày / Đến ngày / Kho / Phương pháp tính giá / Người thực hiện / Ngày giờ thực hiện / Trạng thái**; filter bảng chỉ còn search + **Trạng thái**; bỏ bảng lỗi riêng, mã lỗi hiển thị trong bảng chi tiết bằng **Trạng thái = Lỗi** + cột **"Lí do lỗi"**, không có cột **"Hướng xử lý"**. |
| 2026-07-22 | 24 | Business Authority (user directive) | **Làm rõ DETAIL sau RECALC**: người thực hiện, ngày giờ thực hiện và trạng thái phản ánh lần chạy gần nhất; §5 đồng bộ RECALC cập nhật trên lần tính hiện tại. |
