---
type: feature
artifact_kind: feature
status: PLANNED
version: 32
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
boundary: "gf-accounting"
last_reviewed: "2026-07-24"
---

# FEAT-PRC-CREATE: Thực hiện tính giá xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-CREATE` |
| Title | Thực hiện tính giá xuất kho (BQGQ cuối kỳ) |
| Parent Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Boundary | `gf-accounting` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** thực hiện tính giá vốn xuất kho theo kỳ + kho + phạm vi mã (phương pháp BQGQ cuối kỳ), **so that** giá vốn các phiếu xuất trong kỳ được điền và giá trị tồn được chốt chính xác.

## 2. Acceptance Criteria

### Nhóm A — Mở form & thông tin kỳ tính giá

- [ ] **AC-1**: Mở form
  - Tại: danh sách lịch sử, nút **"Tính giá"**.
  - Thì: hệ thống mở màn **"Thực hiện tính giá xuất kho"** với mô tả **"Form tính lại giá vốn cho các mặt hàng xuất kho trong kỳ, theo Kho và phương pháp bình quân cuối kỳ."**, mục **"Thông tin kỳ tính giá"** + khu vực **"Vật tư hàng hóa cần tính giá"**, nút **"Hủy bỏ"** / **"Thực hiện tính giá"** (v24 — rename từ "Đóng" sang "Hủy bỏ", khớp screenshot/UI convention).

- [ ] **AC-2**: Chọn kỳ kế toán → khóa khoảng ngày
  - Tại: trường **"Kỳ kế toán"*** (dropdown), **"Từ ngày"***, **"Đến ngày"***.
  - Khi: chủ garage chọn kỳ kế toán.
  - Thì: hệ thống **tự điền Từ ngày / Đến ngày** theo kỳ và **khóa không cho sửa**.

- [ ] **AC-3**: Chọn kho & phương pháp
  - Tại: trường **"Kho"*** (dropdown danh mục kho), **"Phương pháp tính giá"*** (mặc định **"Phương pháp bình quân cuối kỳ"**).
  - Thì: hệ thống tính theo **kho đã chọn** + garage hiện tại. Phương pháp hiện tại chỉ BQGQ.

- [ ] **AC-4**: Chọn vật tư hàng hóa
  - Tại: trường **"Chọn vật tư hàng hóa"** (Tất cả mã / Chọn mã cụ thể).
  - Khi: hệ thống xác định nguồn mã (cả 2 cách).
  - Thì: nguồn mã = **danh mục vật tư hàng hóa (Mã sản phẩm nội bộ) thuộc garage hiện tại** đã lọc **"Phương pháp tính giá" = "Bình quân cuối kỳ"** và **"Trạng thái" = "Đang hoạt động"** (BR-PRC-012; thiết lập tại `FEAT-CAT-PROD-CREATE/EDIT`). Mã phương pháp khác hoặc mã **"Ngừng hoạt động"** không xuất hiện/không thuộc phạm vi chạy. **Kỳ kế toán / Từ ngày / Đến ngày / Kho không dùng để lọc danh sách mã từ catalog**; các trường này chỉ là **ngữ cảnh tính giá** theo AC-7.
  - Khi: chọn **"Tất cả mã"**.
  - Thì: form **không đổ toàn bộ mã vào bảng** và **không cho loại bớt từng dòng**; khi bấm **"Thực hiện tính giá"**, server tự resolve toàn bộ mã BQGQ **"Đang hoạt động"** của garage vào phạm vi chạy, rồi tính theo kỳ + kho đã chọn. Mã **"Ngừng hoạt động"** bị bỏ qua, **không** tính là mã lỗi.
  - Khi: chọn **"Chọn mã cụ thể"**.
  - Thì: hệ thống cho thêm mã qua nút **"Thêm phụ tùng"** vào bảng "Vật tư hàng hóa cần tính giá" (dropdown chỉ liệt kê mã BQGQ **"Đang hoạt động"** từ danh mục — AC-6b).

### Nhóm B — Bảng vật tư cần tính

- [ ] **AC-5**: Cột bảng vật tư (chỉ khi chọn mã cụ thể)
  - Tại: bảng **"Vật tư hàng hóa cần tính giá"** khi trường **"Chọn vật tư hàng hóa"** = **"Chọn mã cụ thể"**.
  - Thì: hệ thống hiển thị: **"STT"**, **"Mã nội bộ"**, **"Tên sản phẩm nội bộ"**, **"ĐVT chính"**, **"Có phát sinh xuất"** (số phiếu xuất của mã trong kỳ/kho — thông tin), **"Lần tính gần nhất"** (ngày tính gần nhất hoặc "Chưa tính trong kỳ" — thông tin), **"Thao tác"** (xóa dòng).

- [ ] **AC-6**: Thêm / xóa mã cụ thể
  - Tại: nút **"Thêm phụ tùng"** / icon xóa trên dòng khi trường **"Chọn vật tư hàng hóa"** = **"Chọn mã cụ thể"**.
  - Thì: thêm mã vào bảng / loại mã khỏi bảng tính giá.

- [ ] **AC-6b**: Chỉ mã BQGQ "Đang hoạt động"
  - Tại: khi chọn/thêm mã vào bảng tính giá.
  - Khi: chủ garage thêm mã.
  - Thì: hệ thống **chỉ cho chọn mã có "Phương pháp tính giá" = "Bình quân cuối kỳ"** và **"Trạng thái" = "Đang hoạt động"** (thiết lập ở danh mục Mã sản phẩm nội bộ — `FEAT-CAT-PROD-CREATE/EDIT`). Mã đặt phương pháp khác (Đích danh / Nhập trước xuất trước — mở rộng tương lai) hoặc mã **"Ngừng hoạt động"** **không thuộc** lần tính BQGQ này.

### Nhóm C — Thực hiện tính giá

- [ ] **AC-7**: Công thức tính (BQGQ)
  - Tại: nút **"Thực hiện tính giá"**.
  - Khi: chủ garage thực hiện.
  - Thì: với mỗi (mã + kho + garage), hệ thống tính:
    - **Tồn đầu kỳ** = **tồn kho của mặt hàng theo (Mã + Kho + Garage), tính đến hết ngày "Từ ngày" − 1** — **SL tồn đầu** (SL quy đổi theo ĐVT chính) và **GT tồn đầu** (tiền tuyệt đối VND). Phiếu đúng ngày "Từ ngày" thuộc "trong kỳ", không tính vào tồn đầu (BR-PRC-002/003).
    - **Nhập trong kỳ (SL, GT)** — phiếu **đã ghi sổ**, ngày chứng từ trong **[Từ ngày, Đến ngày]**, theo (Mã + Kho + Garage) = **Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua)**, áp cho **cả SL quy đổi + GT**. **Giá trị kế thừa (không theo đơn giá BQ)**: "Nhập hàng bán bị trả lại" ← phiếu **Xuất bán** gốc (cơ chế: BR-IRV2-031); "Xuất trả hàng mua" ← phiếu **Nhập mua** gốc (cơ chế: BR-IDV2-030).
    - **Đơn giá BQ** = (GT tồn đầu + GT nhập) / (SL tồn đầu + SL nhập). Mẫu số = 0 → **đơn giá BQ = 0** (BR-PRC-001).
    - **ĐVT**: mọi "SL" ở trên = **SL quy đổi (ĐVT chính)**; đơn giá BQ theo ĐVT chính (khác đơn giá nhập theo ĐVT nhập). **Giá vốn mỗi phiếu xuất = đơn giá BQ × SL quy đổi** của dòng xuất — **riêng "Xuất trả hàng mua" kế thừa giá nhập gốc, không theo đơn giá BQ** (BR-PRC-001/005).
    - **Làm tròn**: **đơn giá BQ làm tròn 2 chữ số thập phân sau khi tính** rồi **dùng giá trị đó để tính tiền vốn** = đơn giá BQ (2 lẻ) × SL quy đổi; **tiền** làm tròn về **đơn vị đồng** (BR-PRC-013).

- [ ] **AC-8**: Cập nhật kết quả
  - Tại: sau khi tính.
  - Thì: hệ thống **(1) Cập nhật phiếu xuất** — điền **giá vốn = làm tròn(Đơn giá BQ × SL) về đồng** vào **toàn bộ phiếu xuất trong kỳ/kho của các mã thuộc phạm vi chạy** (đang 0); **(2) Cập nhật sổ tồn** — tính lại giá trị tồn của các (mã + kho) thuộc phạm vi chạy **từ kỳ tính trở đi** → báo cáo tồn / NXT tự đúng (BR-PRC-005); **(3)** ghi **log tổng hợp** lần chạy (tài khoản + ngày giờ + phạm vi mã + số mã đã resolve / số mã thành công / số mã lỗi). **Số mã đã resolve chỉ tính các mã đủ điều kiện chạy** (BQGQ + **Đang hoạt động**). Với phạm vi **"Tất cả mã"**, log **không cần lưu toàn bộ dòng mã thành công**, chỉ bắt buộc lưu tổng hợp + danh sách mã lỗi (nếu có). Với phạm vi **"Chọn mã cụ thể"**, log lưu danh sách mã đã chọn; tại thời điểm chạy, scope thực tế chỉ gồm các mã còn **"Đang hoạt động"** — nếu có mã đã chọn nhưng đến thời điểm chạy đã **"Ngừng hoạt động"**, hệ thống tự bỏ qua mã đó và hiển thị **toast cảnh báo** với wording verbatim **"Đã bỏ qua N mã do ngừng hoạt động"** (N = số mã stale, lấy từ field `warningsSkippedItems` trong response), **không** đưa vào danh sách mã lỗi. **Tồn cuối kỳ (SL, GT)** làm điểm đầu cho lần tính sau.

- [ ] **AC-8b**: Lưu phiếu trước, chạy giá nền (cập nhật dần)
  - Tại: nút **"Thực hiện tính giá"**.
  - Khi: chủ garage bấm thực hiện.
  - Thì: hệ thống **lưu ngay bản ghi lần tính** (kỳ / kho / khoảng ngày / scope mã / người thực hiện / thời điểm; nếu **"Tất cả mã"** thì lưu predicate nguồn mã = garage hiện tại + phương pháp BQGQ + trạng thái **Đang hoạt động**, nếu **"Chọn mã cụ thể"** thì lưu danh sách mã đã chọn) với **trạng thái "Đang tính"** (phiếu xuất hiện ngay, không chờ tính xong) → chạy tính BQGQ **từng mã ở nền** (có thể lâu). Với **"Tất cả mã"**, server resolve danh sách mã đủ điều kiện ở thời điểm job bắt đầu; với **"Chọn mã cụ thể"**, server revalidate trạng thái mã ở thời điểm job bắt đầu và tự bỏ qua mã đã **"Ngừng hoạt động"**. Khi một mã đã **chốt giá cuối** (bao gồm tính lặp BR-PRC-017 nếu có) → **cập nhật kết quả mã đó** (giá vốn phiếu xuất + giá trị sổ tồn theo AC-8), đồng thời cập nhật tổng hợp/log lỗi; xong toàn bộ → **chốt trạng thái lần tính** = "Thành công" / "Hoàn thành có lỗi" (BR-PRC-016, BR-PRC-014).

- [ ] **AC-9**: KHÔNG bắt tính tuần tự
  - Tại: nút **"Thực hiện tính giá"**.
  - Khi: kỳ trước chưa tính giá (kể cả có nhập).
  - Thì: hệ thống **vẫn cho tính** kỳ hiện tại — **không chặn**. Tồn đầu lấy theo **tồn kho đến "Từ ngày" − 1** nên đã phản ánh mọi biến động nhập/xuất của các kỳ chưa tính ở trước (AC-7, BR-PRC-006). Lưu ý: tính/tính lại một kỳ → các kỳ **sau** cần tính lại (BR-PRC-015).

- [ ] **AC-9b**: Cảnh báo kỳ sau cần tính lại
  - Tại: nút **"Thực hiện tính giá"** / sau khi tính.
  - Khi: kỳ đang tính có **(các) kỳ sau đã được tính giá** (giá trị sổ tồn sẽ lan tới các kỳ sau — BR-PRC-015).
  - Thì: hệ thống hiển thị **cảnh báo** liệt kê (các) kỳ sau cần tính lại; người dùng **tự chạy lại RECALC** cho các kỳ đó. (Không tự động cascade.)

- [ ] **AC-10**: Mã lỗi (chạy giá lỗi)
  - Tại: sau khi tính.
  - Khi: mã rơi vào một trong các lý do lỗi hợp lệ: **"Do tồn âm"** (`ERR-INV-030`, đang áp dụng — SL tồn của mã trong kỳ bị âm tại thời điểm bất kỳ / cuối kỳ); **"Lệch hạch toán"** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI] — hạch toán chưa triển khai nên hiện chưa bắt); hoặc **"Do sự cố hệ thống"** (`ERR-INV-052` — mã chưa tới lượt tính khi job nền bị gián đoạn / hết retry).
  - Thì: hệ thống đánh dấu mã **"Lỗi"** — **không** cập nhật giá vốn phiếu + **không** cập nhật giá trị tồn cho mã đó; các mã khác vẫn hoàn tất; mã lỗi hiển thị ở `FEAT-PRC-DETAIL` trong bảng chi tiết bằng **"Trạng thái" = "Lỗi"** + cột **"Lí do lỗi"**. Không có bảng lỗi riêng / cột hướng xử lý. Mã lỗi do **"Do sự cố hệ thống"** được cover bởi cả nút **"Tính lại toàn bộ"** và **"Tính lại mã lỗi"** vì vẫn là mã trạng thái **"Lỗi"** (BR-PRC-007/014/016).
  - Ghi chú: tồn âm **đã bị chặn point-in-time ở mọi thao tác chạm tồn** (tạo/sửa/lùi ngày/xóa phiếu, import/xóa OB, bỏ ghi sổ) → "Do tồn âm" ở đây là **kiểm tra phòng vệ (invariant)**, về nguyên tắc không xảy ra (BR-PRC-007). Mẫu số = 0 → đơn giá BQ = 0, **không** là lỗi (BR-PRC-001/007).

### Nhóm D — Hủy bỏ & phân quyền

- [ ] **AC-11**: Hủy bỏ — nút **"Hủy bỏ"** đóng form, không tính.
- [ ] **AC-12**: Phân quyền — chủ garage + kế toán quyền ngang nhau; tài khoản thực hiện = người chạy.
- [ ] **AC-13**: Chặn chạy trùng
  - Tại: nút **"Thực hiện tính giá"**.
  - Khi: đang có một lần tính **"Đang tính"** cho cùng **(kỳ + kho)**.
  - Thì: hệ thống **chặn** tạo lần tính mới chồng lên → mã lỗi **`ERR-INV-029`** (tránh 2 job cùng cập nhật giá vốn/sổ tồn — BR-PRC-016).

- [ ] **AC-13b**: Chặn tính giá khi kỳ đã đóng
  - Tại: nút **"Thực hiện tính giá"**.
  - Khi: kỳ kế toán đã chọn ở trạng thái **"Đã đóng"** (CLOSED).
  - Thì: hệ thống **chặn chạy tính giá** (cả tính lần đầu CREATE lẫn tính lại RECALC) → mã lỗi **`ERR-INV-024`** — đóng kỳ = đã chốt số liệu, **phải tính giá TRƯỚC khi đóng kỳ**; muốn tính / tính lại thì **mở lại kỳ** (BR-AP-011). (BR-PRC-008, BR-AP-012)

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14507-89266&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD](../ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC).

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`).
- Thực hiện tính giá: Mutation `[PROPOSED] RunCogsCalculation`.
- Lấy mã cần tính cho mode **"Chọn mã cụ thể"** (chỉ mã BQGQ **Đang hoạt động**, kèm có phát sinh xuất + lần tính gần nhất): Query `[PROPOSED] GetItemsForCogs`. Mode **"Tất cả mã"** resolve server-side khi chạy, không cần pre-load toàn bộ mã lên form.

## 5. Business Rules

- **BR-PRC-001 .. 018** (xem `BR-GF-INVENTORY-ACCOUNTING-PERIOD` §2.2): công thức BQGQ (mẫu số=0→0), **tồn đầu = tồn kho đến "Từ ngày" − 1 (SL + GT)**, cập nhật phiếu xuất + **cập nhật sổ tồn**, mã lỗi, chọn kỳ khóa ngày, theo mã+kho+gara, **tính lặp khi có phiếu trả tự tham chiếu (BR-PRC-017)**, sort lịch sử (BR-PRC-018).
- **BR-PRC-007**: Mã lỗi không cập nhật; hiển thị ở `FEAT-PRC-DETAIL` bằng **"Trạng thái" = "Lỗi"** + cột **"Lí do lỗi"** (không có bảng lỗi riêng / cột hướng xử lý). Lý do enum: **"Do tồn âm"** (`ERR-INV-030`, đang áp dụng) / **"Lệch hạch toán"** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]) / **"Do sự cố hệ thống"** (`ERR-INV-052`, job gián đoạn / hết retry).
- **BR-PRC-016**: lưu phiếu trước (trạng thái "Đang tính") → chạy giá nền → cập nhật dần từng mã; **chặn chạy trùng** cùng (kỳ+kho) → `ERR-INV-029`.
- **BR-PRC-014**: trạng thái lần tính (Đang tính / Thành công / Hoàn thành có lỗi — không có "Thất bại" riêng).
- **BR-PRC-006**: KHÔNG bắt tính tuần tự (tồn đầu lấy theo tồn kho đến "Từ ngày" − 1 nên đã gồm biến động kỳ trước).
- **BR-PRC-009**: chọn phạm vi mã = "Tất cả mã" hoặc "Chọn mã cụ thể".
- **BR-PRC-012**: chỉ tính mã có phương pháp = Bình quân cuối kỳ và trạng thái = Đang hoạt động; mã Ngừng hoạt động bị bỏ qua, không tính là lỗi.
- **BR-PRC-013**: **đơn giá BQ làm tròn 2 chữ số thập phân** (dùng để tính tiền vốn); tiền làm tròn về đồng.
- **BR-PRC-002 / 003 / 004 / 005**: tồn đầu = tồn kho đến "Từ ngày" − 1 (SL + GT); tồn cuối (SL, GT); cập nhật phiếu xuất + cập nhật sổ tồn.
- **BR-PRC-015**: tính/tính lại kỳ → các kỳ sau cần tính lại.
- **BR-AP-CMN-002**: phân quyền — chủ garage + kế toán quyền ngang nhau (gồm PRC).

## 6. Edge Cases

- **EC-1**: Tồn đầu luôn = tồn kho đến "Từ ngày" − 1 (SL + GT). Mã chưa phát sinh gì trước kỳ → giá trị này đến từ **OB** (nếu đã import) hoặc = 0.
- **EC-2**: Kỳ trước không có biến động (nhập/xuất) → tồn kho đến "Từ ngày" − 1 = tồn cuối kỳ liền trước (không đổi).
- **EC-3**: Có kỳ giữa chưa tính (kể cả có nhập/xuất) → **KHÔNG chặn**; tồn đầu lấy theo **tồn kho đến "Từ ngày" − 1** đã gồm các biến động đó (phiếu xuất chưa tính → tiền vốn = 0).
- **EC-4**: Mẫu số (SL tồn đầu + SL nhập) = 0 → đơn giá BQ = 0 (không phải lỗi). **SL tồn của mã trong kỳ bị âm** (xuất vượt tồn) → mã có **Trạng thái = "Lỗi"**, **Lí do lỗi = "Do tồn âm"** (`ERR-INV-030` — AC-10).
- **EC-5**: Tính lại một kỳ đã có kỳ sau được tính → kỳ sau thành cũ; hệ thống cảnh báo, người dùng tự tính lại kỳ sau (BR-PRC-015).
- **EC-6**: Mã có dòng phiếu **"Nhập hàng bán bị trả lại" "Tự nhập giá" KHÔNG tích** (đơn giá để hệ thống cập nhật) tham chiếu phiếu **Xuất bán cùng kỳ chưa tính** → GT nhập phụ thuộc giá vốn xuất (output BQGQ) → hệ thống **tính lặp trong bộ tính tạm** đến khi **đơn giá BQ sau làm tròn 2 chữ số thập phân của vòng hiện tại bằng vòng liền trước** (BR-PRC-017): mỗi vòng tính **tạm** giá vốn xuất bán **trước** rồi tính lại / ghi nhận **tạm** GT phiếu trả → tính lại đơn giá BQ. Sau khi hội tụ/chốt giá, hệ thống mới cập nhật thật theo quy trình tổng: cập nhật phiếu xuất → cập nhật phiếu nhập hàng bán bị trả lại kế thừa (nếu có) → cập nhật sổ tồn. Dòng **"Tự nhập giá" tích** (nhập đơn giá tay) → không lặp.
- **EC-7**: Job nền bị gián đoạn / hết retry trước khi tính tới một số mã → lần tính tự chốt **"Hoàn thành có lỗi"**; các mã chưa tới lượt tính có **Trạng thái = "Lỗi"**, **Lí do lỗi = "Do sự cố hệ thống"** (`ERR-INV-052`) và có thể chạy lại bằng `FEAT-PRC-RECALC` scope `ERROR_ONLY` hoặc `ALL`.
- **EC-8**: Mã **"Ngừng hoạt động"** tại thời điểm chạy → không thuộc phạm vi tính giá. Với **"Tất cả mã"**, server không resolve mã đó. Với **"Chọn mã cụ thể"**, nếu mã đã chọn bị đổi sang "Ngừng hoạt động" trước khi job bắt đầu thì hệ thống chỉ chạy các mã còn **"Đang hoạt động"** — tự bỏ qua mã đó và hiển thị cảnh báo (wording verbatim per BR-PRC-009); mã này **không** hiển thị như dòng **"Lỗi"**.

## 7. Out of Scope

- Xem kết quả / mã lỗi → `FEAT-PRC-DETAIL`. Tính lại → `FEAT-PRC-RECALC`. Xóa log → `FEAT-PRC-DELETE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-PRC-CREATE (mới) — form tính giá BQGQ theo kỳ (khóa ngày) + kho + mã cụ thể; công thức đơn giá BQ (chỉ dùng nhập), đơn giá neo (OB/lần gần nhất), cập nhật giá vốn phiếu xuất + snapshot giá trị tồn, tính tuần tự (chặn nếu kỳ trước chưa tính), mã lỗi không cập nhật. |
| 2026-06-15 | 2 | Business Authority | Rà completeness: AC-4 bổ sung nhánh **"Tất cả mã"** (B1); AC-7 thêm mẫu số=0→đơn giá 0 (A5) + quy tắc làm tròn (A4); AC-8 phiếu xuất cost theo đúng kỳ chứa nó + giá vốn làm tròn đồng (A8/A4); EC-4 bỏ tuyên bố "không có chia-0"; §5 cite BR-PRC-001..014 (thêm 012/013). |
| 2026-06-15 | 3 | Business Authority | **Tái thiết kế công thức** (chốt BA): AC-7 tồn đầu = tồn cuối lần gần nhất + Σ nhập (SL,GT) kỳ chưa tính — cộng thẳng, **bỏ đơn giá neo**; AC-8 = cập nhật phiếu xuất + **cập nhật sổ tồn** (báo cáo tự đúng); AC-9 đổi sang **KHÔNG bắt tính tuần tự**; EC-1/2/3 cập nhật + EC-5 cảnh báo re-price; §5 cite BR-PRC-001..015. |
| 2026-06-15 | 4 | Business Authority | Rà lỗ hổng (Nhóm C-8): thêm **AC-9b** — cảnh báo testable khi tính kỳ có kỳ sau đã tính (BR-PRC-015), người dùng tự RECALC kỳ sau. |
| 2026-06-16 | 5 | Business Authority | AC-4 làm rõ **nguồn mã**: cả "Tất cả mã" và "Chọn mã cụ thể" lấy từ **danh mục vật tư hàng hóa (Mã sản phẩm nội bộ)** đã lọc "Phương pháp tính giá" = "Bình quân cuối kỳ" (BR-PRC-012). |
| 2026-06-16 | 6 | Business Authority | **Chạy nền**: thêm **AC-8b** (lưu phiếu trước, trạng thái "Đang tính" → tính từng mã nền → cập nhật dần → chốt trạng thái) + **AC-13** (chặn chạy trùng cùng kỳ+kho → `PRICING_RUN_IN_PROGRESS`); §5 cite BR-PRC-016 + BR-PRC-014 (bỏ "Thất bại"). |
| 2026-06-16 | 7 | Business Authority | **Định nghĩa lại mã lỗi chạy giá**: AC-10 lý do **"Do tồn âm"** (`PRICING_NEGATIVE_STOCK`, đang áp dụng) + "Lệch hạch toán" (`PRICING_ACCOUNTING_MISMATCH`, [MỞ RỘNG TƯƠNG LAI] — hạch toán chưa làm); EC-4 đổi "lỗi kỹ thuật khác" → "tồn âm". Ghi rõ "Do tồn âm" là **invariant** (tồn âm đã chặn ở mọi thao tác chạm tồn) — về nguyên tắc không xảy ra. |
| 2026-06-16 | 8 | Business Authority | **Gỡ cụm "đơn giá neo" khỏi thân** (AC-7 + §5): mô tả thẳng "tồn đầu = cộng thẳng (SL,GT)"; không còn câu phủ định "bỏ/không qua đơn giá neo" trong thân (lịch sử chuyển đổi giữ ở Change Log). |
| 2026-06-16 | 9 | Business Authority | Fix: sửa tham chiếu UX section §4 → §4B (luồng tính giá xuất kho). |
| 2026-06-16 | 10 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 11 | Business Authority | Đồng bộ tham chiếu UX: §4B → §6 (luồng PRC được đánh số lại liền mạch sau §5 trong UX-FLOW-INVENTORY-ACCOUNTING-PERIOD). |
| 2026-06-16 | 12 | Business Authority | Đồng bộ công thức carry-over: tồn đầu trừ cả Σ xuất kỳ giữa chưa tính (BR-PRC-002/004 mới) — cập nhật AC-7, AC-9, §5 (2 dòng), EC-1, EC-3. |
| 2026-06-16 | 13 | Business Authority | Chốt ĐVT (M4) AC-7: thêm dòng "mọi SL = SL quy đổi (ĐVT chính); giá vốn xuất = đơn giá BQ × SL quy đổi; đơn giá BQ theo ĐVT chính". Đồng bộ BR-PRC-001/005. |
| 2026-06-16 | 14 | Business Authority | Fix M8 (Hướng A — đóng kỳ không cho tính giá): thêm **AC-13b** — kỳ "Đã đóng" → chặn tính giá (CREATE & RECALC) tại nút "Thực hiện" → `ERR-INV-024`; phải tính giá trước khi đóng, mở lại kỳ (BR-AP-011) để tính/tính lại. Đồng bộ BR-PRC-008, BR-AP-012. |
| 2026-06-16 | 15 | Business Authority | Đồng bộ mô tả **tồn đầu kỳ** theo điểm-thời-gian (= tồn kho đến "Từ ngày" − 1): cập nhật **AC-7, AC-9, EC-1/2/3, §5** (3 dòng) — bỏ diễn đạt dồn cũ (tồn cuối lần gần nhất + Σ nhập − Σ xuất). Khớp BR-PRC-002/003/004/006. |
| 2026-06-16 | 16 | Business Authority | AC-7: định nghĩa **Nhập trong kỳ (SL + GT)** = Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua), phiếu đã ghi sổ trong [Từ,Đến] theo Mã+Kho+Garage; giá trị kế thừa (không theo BQ): "Nhập hàng bán bị trả lại" ← Xuất bán gốc, "Xuất trả hàng mua" ← Nhập mua gốc (*[MÔ TẢ SAU]*). Khớp BR-PRC-001/005. |
| 2026-06-16 | 17 | Business Authority | Thêm **EC-6** (tính lặp — BR-PRC-017): mã có phiếu "Nhập hàng bán bị trả lại" đơn giá=0 tham chiếu Xuất bán cùng kỳ chưa tính → tính lặp đến khi đơn giá BQ hội tụ (giá vốn xuất bán tính trước rồi cập nhật GT phiếu trả); nhập tay≠0 → không lặp. §5 dải rule → ..017. |
| 2026-06-16 | 18 | Business Authority | Đổi làm tròn đơn giá BQ (BR-PRC-013): AC-7 + §5 — **đơn giá BQ làm tròn 2 chữ số thập phân sau khi tính** rồi dùng giá trị đó tính tiền vốn (= đơn giá BQ[2 lẻ] × SL quy đổi → làm tròn đồng). |
| 2026-06-16 | 19 | Business Authority | EC-6: đổi điều kiện tính lặp từ "đơn giá=0" → theo checkbox **"Tự nhập giá" KHÔNG tích** (hệ thống cập nhật đơn giá); tích (nhập tay) → không lặp. Khớp BR-PRC-017, BR-IRV2-031. |
| 2026-06-26 | 20 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14507-89266`. Mobile chưa có. |
| 2026-07-07 | 21 | Business Authority + Senior PM | **Move boundary**: frontmatter `gf-inventory` → `gf-accounting`. Rationale: Tính giá xuất kho BQGQ (PRC) thuộc nghiệp vụ kế toán (kho tracks SL, kế toán tính money/costing) — khớp SAP FI-CO / Misa / Fast / Odoo. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16. Nội dung AC/BR không đổi. |
| 2026-07-20 | 22 | Business Authority (user sonhoang directive 2026-07-20) | **Đổi tên cột "Tên hàng hóa" → "Tên sản phẩm nội bộ"** — khớp screenshot UI thực tế (đồng bộ naming convention với `FEAT-PRC-DETAIL` v16). AC-5 cập nhật. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v21 → v22. |
| 2026-07-20 | 23 | Business Authority (user sonhoang directive 2026-07-20, batch 3) | **Đổi tên nút "Thực hiện" → "Thực hiện tính giá"** — khớp screenshot UI thực tế. AC-1, AC-7, AC-8b, AC-9, AC-9b, AC-13, AC-13b cập nhật (7 chỗ). Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v22 → v23. |
| 2026-07-21 | 24 | Business Authority (user directive) | **Đổi nút "Đóng" → "Hủy bỏ"** trên form `FEAT-PRC-CREATE`. Cập nhật AC-1 + Nhóm D/AC-11 để đồng bộ microcopy với UI; cascade UX-FLOW-INVENTORY-ACCOUNTING-PERIOD v14. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v23 → v24. |
| 2026-07-21 | 25 | Business Authority (user directive) | **Cascade đủ PRC error enum 3 giá trị**: AC-10 + §5 + EC-7 đồng bộ `BR-PRC-007/014/016` với **"Do tồn âm"** (`ERR-INV-030`) / **"Lệch hạch toán"** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI]) / **"Do sự cố hệ thống"** (`ERR-INV-052`, job gián đoạn / hết retry). Trước đó CREATE chỉ mô tả "Do tồn âm", lệch với BR + DETAIL/RECALC. Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v24 → v25. |
| 2026-07-21 | 26 | Business Authority (user directive) | **Đổi hành vi scope "Tất cả mã"**: không đổ toàn bộ mã vào bảng, không cho loại bớt từng dòng; server resolve toàn bộ mã BQGQ của garage khi bấm **"Thực hiện tính giá"**. Làm rõ nguồn mã catalog **không lọc theo kỳ/kho**; kỳ/kho chỉ là ngữ cảnh tính. Log scope "Tất cả mã" lưu tổng hợp + mã lỗi, không bắt buộc lưu toàn bộ mã thành công. |
| 2026-07-22 | 27 | Business Authority (user directive) | **Bổ sung điều kiện trạng thái mã khi chạy PRC**: nguồn mã chỉ gồm mã BQGQ **"Đang hoạt động"**; scope thực tế khi chạy cũng chỉ gồm các mã còn **"Đang hoạt động"**. |
| 2026-07-22 | 28 | Business Authority (user directive) | **Cascade layout mã lỗi theo screenshot DETAIL/RECALC mới**: mã lỗi của lần tính đầu không còn mô tả đưa vào bảng lỗi riêng; hiển thị ở `FEAT-PRC-DETAIL` bằng **Trạng thái = Lỗi** + cột **"Lí do lỗi"**, không có cột hướng xử lý. |
| 2026-07-22 | 29 | Business Authority (user directive) | **Làm rõ EC-6 tính lặp tự tham chiếu**: vòng lặp chỉ dùng giá trị **tạm** trong bộ tính, hội tụ khi đơn giá BQ sau làm tròn 2 số lẻ bằng vòng liền trước; sau khi chốt giá mới cập nhật thật phiếu xuất → phiếu nhập hàng bán bị trả lại kế thừa → sổ tồn. AC-8b làm rõ cập nhật từng mã là sau khi mã đã chốt giá cuối. |
| 2026-07-22 | 30 | Business Authority (user directive) | **Chốt scope thực tế theo trạng thái mã**: tại thời điểm chạy, hệ thống chỉ chạy mã còn **Đang hoạt động**. |
| 2026-07-22 | 31 | Business Authority (user directive) | **Chốt wording scope mã Đang hoạt động**: mô tả trực tiếp scope thực tế chỉ gồm mã còn **Đang hoạt động** tại thời điểm chạy. |
| 2026-07-24 | 32 | Business Authority (user directive) | **AC-7 + EC-8: spec verbatim toast wording khi mã cụ thể bị stale (Ngừng hoạt động)**: "Đã bỏ qua N mã do ngừng hoạt động" — N lấy từ field `warningsSkippedItems` đã có sẵn trong response API. Counter-only, không list mã (đủ để user hiểu, muốn detail tra list mã đã chọn ban đầu). AC-7 chứa wording verbatim, EC-8 cite BR-PRC-009 (source rule). Architecture không đụng — field đã ratified. Cascade: `FEAT-PRC-RECALC` (AC-1/AC-1b/EC-4) + `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD` (§Form + PRC-EC-8) đều cite BR-PRC-009. Resolve L1 của `agent-ba-review W06` (2026-07-24). v31 → v32. |
