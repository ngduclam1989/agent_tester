---
type: feature
artifact_kind: feature
status: PLANNED
version: 22
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-29"
supersedes: "FEAT-IR-CREATE"
---

# FEAT-IR-CREATE-V2: Tạo phiếu nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-CREATE-V2` |
| Title | Tạo phiếu nhập kho (V2) |
| Parent Epic | `EP-INVENTORY-RECEIPT-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |
| Depends on | `EP-INVENTORY-CATALOG` (mã nội bộ / SKU / ĐVT quy đổi), `EP-INVENTORY-ACCOUNTING-PERIOD` (lock kỳ), `gf-purchase` (PO) |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu nhập kho với thông tin chung và các dòng phụ tùng (theo SKU / mã nội bộ, ĐVT quy đổi, kho), **so that** tôi ghi nhận hàng nhập về và (khi ghi sổ) cộng đúng tồn theo ĐVT chính.

## 2. Acceptance Criteria

### Nhóm A — Mở form & thông tin chung

- [ ] **AC-1**: Mở form tạo phiếu
  - Tại: danh sách, nút **"Tạo mới PN"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống mở form **"Tạo phiếu nhập kho"** với mô tả **"Bố cục theo form phiếu: thông tin chung ở trên, chi tiết dòng nhập ở tab bên dưới."**, gồm header + tab **CHI TIẾT** / **ĐÍNH KÈM**, sidebar **"Tổng giá trị phiếu"**, nút **"Đóng"** / **"Lưu"**.

- [ ] **AC-2**: Trường header
  - Tại: vùng header + Thông tin chung.
  - Khi: form được mở.
  - Thì: hệ thống hiển thị: **"Loại phiếu"*** (Nhập mua / Nhập hàng bán bị trả lại / Nhập khác), **"Mã đơn hàng"** (dropdown PO, không bắt buộc), **"Phiếu xuất bán"** (dropdown — **chỉ hiện khi Loại phiếu = "Nhập hàng bán bị trả lại"**), **"Mã lô hàng"**, **"Đối tượng"***, **"Người phụ trách"**, **"Người giao hàng"**, **"Kho nhập"***, **"Diễn giải"**, **"Số phiếu"*** (tự sinh PN-xxxxx), **"Ngày nhập kho"***, **"Trạng thái"*** (mặc định **"Nháp"**).

- [ ] **AC-3**: Chọn đơn hàng PO (không bắt buộc)
  - Tại: trường **"Mã đơn hàng"**.
  - Khi: chủ garage chọn một PO.
  - Thì: hệ thống **kế thừa dữ liệu** sản phẩm/đối tượng từ đơn hàng. Khi không chọn PO → nhập sản phẩm thủ công ở tab chi tiết.

- [ ] **AC-3b**: Validate SL nhập theo đơn hàng (chỉ khi có gắn PO)
  - Tại: dòng phụ tùng, khi phiếu **có gắn PO**.
  - Khi: chủ garage nhập **SL nhập** vượt quá **SL đặt hàng** (còn lại) của dòng tương ứng từ PO.
  - Thì: hệ thống báo lỗi **"Số lượng nhập không được vượt quá số lượng đặt hàng."** và chặn lưu / ghi sổ.
  - Khi: phiếu **không gắn PO**.
  - Thì: hệ thống **không áp** ràng buộc này (PO không bắt buộc — V2 chỉ bỏ tính *bắt buộc chọn PO*, không bỏ validate khi đã chọn).

- [ ] **AC-3c**: Phiếu xuất bán (khi Loại phiếu = "Nhập hàng bán bị trả lại" — **không bắt buộc**)
  - Tại: trường **"Phiếu xuất bán"** (chỉ hiện với loại "Nhập hàng bán bị trả lại").
  - Khi: chủ garage / kế toán **chọn** một phiếu Xuất bán đã ghi sổ.
  - Thì: hệ thống **kế thừa**: (a) **Đối tượng** = Khách hàng của phiếu Xuất bán → đổ vào Thông tin chung; (b) **các dòng chi tiết phụ tùng** (SKU, mã nội bộ, tên, ĐVT, SL, SL quy đổi, kho, **đơn giá/giá vốn kế thừa từ phiếu Xuất bán gốc**) → đổ vào tab Chi tiết. Các dòng kế thừa **được sửa** (giảm/đổi SL — hỗ trợ **trả một phần**; đơn giá vốn kế thừa giữ theo đơn vị → tiền vốn = đơn giá vốn kế thừa × SL điều chỉnh).
  - Khi: **không chọn** phiếu xuất bán.
  - Thì: nhập sản phẩm thủ công. **Nguồn đơn giá mỗi dòng theo checkbox "Tự nhập giá"**: **không tích** → để hệ thống cập nhật (kế thừa giá vốn từ phiếu Xuất bán, do BQGQ ghi); **tích** → nhập đơn giá tay (BQGQ không đụng). Giá trị nhập của phiếu dùng cho BQGQ, **không** tính lại theo đơn giá BQ kỳ này (BR-IRV2-031, BR-PRC-001/005).

- [ ] **AC-3d**: Chặn SL trả vượt số đã bán (chỉ khi có chọn Phiếu xuất bán)
  - Tại: dòng phụ tùng, khi phiếu **có chọn "Phiếu xuất bán"**.
  - Khi: SL nhập trả (SL quy đổi) của dòng **vượt quá SL đã xuất** của dòng tương ứng trên phiếu Xuất bán.
  - Thì: hệ thống báo lỗi → mã lỗi **`ERR-INV-040`** và **chặn lưu / ghi sổ**.
  - Khi: phiếu **không chọn** phiếu xuất bán.
  - Thì: **không áp** ràng buộc này (BR-IRV2-032).

- [ ] **AC-4**: Nguồn nhập
  - Tại: trường nguồn nhập (Mua ngoài / Nền tảng).
  - Khi: form được điền.
  - Thì: hệ thống ghi nhận nguồn nhập (trường riêng, độc lập với Loại phiếu).

### Nhóm B — Tab chi tiết: dòng phụ tùng

- [ ] **AC-5**: Thêm dòng phụ tùng
  - Tại: tab **CHI TIẾT**, nút **"Thêm phụ tùng"**.
  - Khi: chủ garage thêm dòng.
  - Thì: hệ thống thêm dòng với các cột: STT, **SKU**, Tên phụ tùng, **Mã SP nội bộ**, Tên SP nội bộ, **ĐVT nhập**, **SL nhập**, **SL quy đổi**, **ĐVT chính**, **Tự nhập giá** (checkbox — chỉ loại "Nhập hàng bán bị trả lại"), **Đơn giá nhập**, **Thành tiền**, **Kho**, Ghi chú, **Thao tác** (icon xóa dòng).

- [ ] **AC-6**: Đổ dữ liệu khi chọn SKU / mã nội bộ
  - Tại: cột **SKU** / **Mã SP nội bộ**.
  - Khi: chủ garage chọn **SKU** (không bắt buộc).
  - Thì: hệ thống đổ: Tên phụ tùng (theo SKU) + Mã nội bộ + Tên nội bộ + ĐVT chính.
  - Khi: chủ garage chọn thẳng **Mã SP nội bộ** (không qua SKU).
  - Thì: hệ thống đổ: Tên SP nội bộ + ĐVT chính.

- [ ] **AC-6b**: Tạo mới mã nội bộ từ dropdown (điều hướng)
  - Tại: dropdown cột **"Mã SP nội bộ"**, mục cuối **"+ Tạo mới mã nội bộ"**.
  - Khi: chủ garage chọn **"+ Tạo mới mã nội bộ"**.
  - Thì: hệ thống **điều hướng sang màn Tạo mã nội bộ** (`FEAT-CAT-PROD-CREATE`). Nếu phiếu có thay đổi chưa lưu → **cảnh báo rời trang** trước khi đi. Tạo xong, mã mới (**"Đang hoạt động"**) sẵn sàng để chọn vào dòng.
  - Khi: dòng có **SKU chưa mapping mã nội bộ** (điển hình: phiếu **Nền tảng** do bên mua đẩy sang — dòng chỉ có mã SKU + tên SKU, chưa có mã nội bộ).
  - Thì: màn Tạo mã nội bộ mở ra **gắn sẵn SKU đó vào tab "Mã SKU"**; **Mã + Tên sản phẩm nội bộ đều nhập tay** (không seed từ tên SKU). Nếu **SKU đã mapping mã khác** → không gắn sẵn (form trống, gắn SKU khác). Xem `FEAT-CAT-PROD-CREATE` AC-1b. (Dòng chưa chọn SKU → form mở trống.)

- [ ] **AC-6c**: Thêm ĐVT quy đổi inline từ dropdown ĐVT nhập
  - Tại: dropdown cột **"ĐVT nhập"**, mục cuối **"+ Thêm ĐVT quy đổi"** (chỉ khả dụng khi dòng **đã chọn mã nội bộ**).
  - Khi: chủ garage chọn **"+ Thêm ĐVT quy đổi"**.
  - Thì: hệ thống mở **modal "Thêm ĐVT quy đổi"** **ngay trên phiếu (không rời form)** gồm **"ĐVT quy đổi"** (dropdown từ ĐVT master) + **"Tỷ lệ quy đổi"** (> 0, **cho số thập phân tối đa 6 chữ số sau dấu phẩy**). Validate theo BR-CAT-PROD-011: tỷ lệ > 0 (`ERR-INV-013`), **≤ 6 chữ số thập phân (`ERR-INV-047`)**, **không trùng ĐVT chính** và **không trùng ĐVT quy đổi đã có** của mã (`ERR-INV-014`). Lưu → **thêm ĐVT đó vào mã nội bộ** + **tự chọn làm ĐVT nhập** của dòng. (Tái dùng hành vi tab "ĐVT quy đổi" của `FEAT-CAT-PROD-CREATE` AC-11.)

- [ ] **AC-7**: Tính SL quy đổi & thành tiền
  - Tại: dòng phụ tùng.
  - Khi: chủ garage nhập **SL nhập** (theo ĐVT nhập) và **Đơn giá nhập**.
  - Thì: hệ thống tự tính **SL quy đổi = SL nhập × tỷ lệ quy đổi** (ĐVT nhập → ĐVT chính) và **Thành tiền = SL nhập × Đơn giá nhập**. Tồn (khi ghi sổ) cộng theo **SL quy đổi**.

- [ ] **AC-8**: Kho theo dòng
  - Tại: cột **"Kho"** trên dòng.
  - Khi: chủ garage chọn Kho nhập ở header.
  - Thì: hệ thống đổ kho đó xuống các dòng; **vẫn cho chọn lại** kho khác trên từng dòng.

- [ ] **AC-9**: Xóa dòng (per-dòng, cột Thao tác)
  - Tại: cột **"Thao tác"** trên mỗi dòng (icon xóa).
  - Khi: chủ garage nhấn icon xóa của một dòng.
  - Thì: hệ thống loại dòng đó khỏi bảng + cập nhật Tổng. (Thanh trên tab chi tiết chỉ có nút **"Thêm phụ tùng"**; xóa dòng là icon ở cột Thao tác từng dòng.)

- [ ] **AC-10**: Dòng tổng
  - Tại: cuối bảng chi tiết.
  - Thì: hệ thống hiển thị Tổng: **SL nhập**, **SL quy đổi**, **Thành tiền**; sidebar **"Tổng giá trị phiếu"** = Σ thành tiền.

### Nhóm C — Lưu & trạng thái

- [ ] **AC-11**: Lưu phiếu (Nháp)
  - Tại: nút **"Lưu"**, Trạng thái **"Nháp"**.
  - Khi: header hợp lệ + có ít nhất 1 dòng.
  - Thì: hệ thống lưu phiếu trạng thái **"Nháp"** (chưa tác động tồn), Số phiếu tự sinh.

- [ ] **AC-12**: Lưu kèm ghi sổ kho
  - Tại: Trạng thái = **"Ghi sổ kho"** khi lưu (hoặc ghi sổ sau ở chi tiết).
  - Khi: chủ garage ghi sổ.
  - Thì: hệ thống cộng tồn theo SL quy đổi cho từng (mã + kho + gara). **Trước khi cộng**: **bắt buộc mọi dòng có mã nội bộ** (BR-IRV2-028 — phiếu Nền tảng có thể còn dòng chỉ có SKU → chặn, yêu cầu tạo/gắn mã nội bộ), **check tồn âm** (BR-IRV2-008) và **lock kỳ** (BR-IRV2-007); vi phạm → chặn.

- [ ] **AC-13**: Đóng form
  - Tại: nút **"Đóng"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng form, không lưu.

### Nhóm D — Đính kèm & phân quyền

- [ ] **AC-14**: Tệp đính kèm
  - Tại: tab **ĐÍNH KÈM** (hiển thị số lượng, vd "ĐÍNH KÈM (1)").
  - Khi: chủ garage tải tệp đính kèm cho phiếu.
  - Thì: hệ thống cho phép tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform. Không bắt buộc.

- [ ] **AC-15**: Phân quyền
  - Tại: danh sách / form.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò tạo được với quyền ngang nhau.

## 2A. Trường form — nguồn dữ liệu / bắt buộc / validate

### Header

| Trường | Bắt buộc | Kiểu | Nguồn chọn | Validate |
|---|---|---|---|---|
| Loại phiếu | ✅ | Select | Enum: Nhập mua / Nhập hàng bán bị trả lại / Nhập khác | — |
| Mã đơn hàng (PO) | ❌ | Select | Danh sách PO (gf-purchase) | Chọn → kế thừa dữ liệu + nguồn nhập; khi đã chọn → SL nhập mỗi dòng ≤ SL đặt hàng (AC-3b) |
| Phiếu xuất bán | ❌ | Select | Danh sách phiếu Xuất bán đã ghi sổ — **chỉ hiện khi Loại phiếu = "Nhập hàng bán bị trả lại"**; **không bắt buộc** | Chọn → kế thừa **Đối tượng** (Khách hàng) + **dòng chi tiết** (kèm đơn giá/giá vốn kế thừa); đơn giá kế thừa/cập nhật khi dòng **"Tự nhập giá" không tích**, nhập tay khi **tích** — AC-3c, BR-IRV2-031 |
| Mã lô hàng | ❌ | Text | nhập tay | — |
| Đối tượng | ✅ | Select | Theo **Loại phiếu**: **Nhập mua → Nhà cung cấp**; **Nhập hàng bán bị trả lại → Khách hàng**; **Nhập khác → Nhà cung cấp / Khách hàng / Nhân viên** | — |
| Người phụ trách | ❌ | Select | Danh sách nhân sự; **mặc định = nhân viên đang đăng nhập**, cho chọn lại | — |
| Người giao hàng | ❌ | Text | **nhập tay tự do** | — |
| Kho nhập | ✅ | Select | Danh mục kho theo garage | — |
| Diễn giải | ❌ | Text | — | — |
| Số phiếu | ✅ | Auto (read-only) | Hệ thống tự sinh PN-xxxxx | Unique/garage |
| Ngày nhập kho | ✅ | Datetime | — | Ghi sổ chỉ khi kỳ chưa khóa |
| Trạng thái | ✅ | Select | Enum: Nháp / Ghi sổ kho | — |
| Nguồn nhập | (auto) | — | Mua ngoài / Nền tảng — **kế thừa tự động từ PO khi chọn PO** (không chọn tay) | — |

### Dòng chi tiết

| Trường | Bắt buộc | Kiểu | Nguồn chọn | Validate |
|---|---|---|---|---|
| SKU | ❌ | Select | Danh mục SKU đã gắn | Chọn → đổ tên + mã nội bộ + ĐVT chính |
| Mã SP nội bộ | ✅ | Select | Danh mục mã nội bộ **"Đang hoạt động"** (ẩn mã ngừng); mục cuối **"+ Tạo mới mã nội bộ"** → điều hướng `FEAT-CAT-PROD-CREATE` (AC-6b) | Bắt buộc **khi Ghi sổ** (BR-IRV2-028); phiếu **Nền tảng** ở Nháp có thể tạm chỉ có SKU (chưa có mã nội bộ) |
| Tên phụ tùng / Tên SP nội bộ / ĐVT chính | (auto) | — | Đổ theo SKU / mã nội bộ | — |
| ĐVT nhập | ✅ | Select | **Các ĐVT của mã** = ĐVT chính + các ĐVT quy đổi đã khai; mục cuối **"+ Thêm ĐVT quy đổi"** → modal thêm ĐVT quy đổi cho mã (AC-6c) | — |
| SL nhập | ✅ | Number | — | **> 0**, cho số lẻ; **nếu có gắn PO**: ≤ SL đặt hàng còn lại của dòng (AC-3b) |
| SL quy đổi | (auto) | — | = SL nhập × tỷ lệ quy đổi | — |
| Tự nhập giá | ❌ | Checkbox | — | (Chỉ loại **"Nhập hàng bán bị trả lại"**) **KHÔNG tích** → đơn giá **để hệ thống cập nhật** (kế thừa giá vốn từ phiếu Xuất bán, do BQGQ ghi — BR-PRC-017); **tích** → **nhập đơn giá tay**, BQGQ không cập nhật dòng đó (BR-IRV2-031) |
| Đơn giá nhập | ✅ | Number | — | **≥ 0**, cho số lẻ |
| Kho (dòng) | ✅ | Select | Danh mục kho (mặc định theo header, chọn lại được) | — |
| Ghi chú | ❌ | Text | — | — |

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87556&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) §3.1.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Tạo phiếu: Mutation `[PROPOSED] CreateReceiptV2`.
- Ghi sổ kho: Mutation `[PROPOSED] PostReceiptV2`.
- Lấy PO: Query `[PROPOSED] GetPurchaseOrderForReceipt`.
- Tìm SKU / mã nội bộ: Query `[PROPOSED] SearchSkus`, `[PROPOSED] SearchInternalProducts`.

## 5. Business Rules

- **BR-IRV2-001**: Khởi tạo "Nháp"; số phiếu tự sinh.
- **BR-IRV2-003**: Ghi sổ cộng tồn theo SL quy đổi (ĐVT chính).
- **BR-IRV2-007**: Lock kỳ kế toán đã đóng.
- **BR-IRV2-008**: Chặn tồn âm (point-in-time).
- **BR-IRV2-009 / 010 / 011 / 012 / 013**: Phân loại, PO không bắt buộc, trường bắt buộc, kho theo dòng, tổng giá trị.
- **BR-IRV2-014 / 015 / 016**: Đổ dữ liệu SKU/mã nội bộ, SL quy đổi, cấu trúc dòng.
- **BR-IRV2-027**: "+ Tạo mới mã nội bộ" trong dropdown → điều hướng `FEAT-CAT-PROD-CREATE`.
- **BR-IRV2-029**: "+ Thêm ĐVT quy đổi" trong dropdown ĐVT → modal inline thêm ĐVT quy đổi cho mã nội bộ.
- **BR-IRV2-030**: Chặn lưu/ghi sổ phiếu nhập có **ngày nhập ≤ "Tồn đến ngày" của tồn đầu kỳ (OB)** cùng (mã+kho) → `ERR-INV-038` (OB phải là điểm khởi đầu, phiếu phải sau OB).
- **BR-IRV2-031**: Loại "Nhập hàng bán bị trả lại" → trường **"Phiếu xuất bán"** (**không bắt buộc**); chọn → kế thừa **Đối tượng** + **dòng chi tiết**. Mỗi dòng có checkbox **"Tự nhập giá"**: **không tích** → đơn giá để hệ thống cập nhật (kế thừa giá vốn từ Xuất bán, do BQGQ ghi); **tích** → nhập đơn giá tay. Giá trị nhập của phiếu dùng cho BQGQ (BR-PRC-001/005).
- **BR-IRV2-032**: Khi có chọn phiếu xuất bán → **SL nhập trả ≤ SL đã xuất** của dòng tương ứng; vượt → `ERR-INV-040` (chặn lưu/ghi sổ). Không chọn → không áp.

## 6. Edge Cases

- **EC-1**: Chọn PO → kế thừa dòng; bỏ chọn → nhập thủ công.
- **EC-1b**: Có gắn PO + nhập SL > SL đặt hàng → chặn (AC-3b). Không gắn PO → không áp ràng buộc SL theo đơn hàng.
- **EC-1c**: Phiếu **Nền tảng** (mua đẩy sang) ở **Nháp** có dòng chỉ có SKU (chưa mã nội bộ) → lưu Nháp được (chưa tác động tồn); bấm **Ghi sổ** mà còn dòng thiếu mã nội bộ → **chặn** (`ERR-INV-011`), yêu cầu tạo/gắn mã nội bộ (AC-6b).
- **EC-2**: Không chọn SKU → chọn mã nội bộ độc lập.
- **EC-3**: Ghi sổ làm tồn âm (kể cả do phiếu xuất sau đó) → chặn.
- **EC-4**: **Ngày nhập kho thuộc kỳ đã đóng → chặn khi Lưu phiếu (kể cả lưu Nháp), báo `ERR-INV-024`** (BR-IRV2-007). Nút "Thêm mới" không ẩn — kiểm tra tại thời điểm Lưu.
- **EC-5**: Ngày nhập ≤ "Tồn đến ngày" của tồn đầu kỳ (OB) cùng (mã+kho) → chặn (`ERR-INV-038`); kể cả khi đổi ngày lùi về trước OB.

## 7. Out of Scope

- Chi tiết / ghi sổ / bỏ ghi sổ sau khi tạo → `FEAT-IR-DETAIL-V2`.
- Chỉnh sửa → `FEAT-IR-EDIT-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-IR-CREATE-V2 (V2 của FEAT-IR-CREATE) — form header + tab chi tiết (Thêm phụ tùng + Xóa dòng); SKU/mã nội bộ auto-fill, ĐVT quy đổi→SL quy đổi, kho theo dòng, ghi sổ cộng tồn + check tồn âm + lock kỳ. |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1 (map 15 AC ↔ V1, note 1 AC bỏ: validate SL ≤ SL đặt) + gắn tag [GIỮ]/[ĐỔI]/[MỚI] + con trỏ lineage `← FEAT-IR-CREATE AC-n` vào từng AC (để agent truy vết). |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** giống mẫu: Metadata (Loại thay đổi CR / Màn hình target FEAT-IR-CREATE / Depends on) + section **§0 Bối cảnh thay đổi (Change Request — DEV đọc trước)**; bảng Δ chuyển xuống §0.1. |
| 2026-06-10 | 4 | Business Authority | **Đính chính**: validate "SL nhập ≤ SL đặt hàng" KHÔNG bị bỏ — V2 chỉ bỏ *bắt buộc chọn PO*; khi đã gắn PO vẫn validate. Sửa dòng Δ §0.1 (từ "(Bỏ)" → AC-3b thu hẹp điều kiện), thêm lại **AC-3b** (validate khi có PO), cập nhật §2A (PO + SL nhập). |
| 2026-06-10 | 5 | Business Authority | Gỡ mọi nhắc **"Import dòng"** khỏi tài liệu (V1 vốn không có chức năng này → không mô tả "bỏ Import dòng"). AC-9 hạ [ĐỔI]→**[GIỮ]** (xóa dòng per-dòng giống V1). |
| 2026-06-10 | 6 | Business Authority | Bổ sung **AC-6b**: dropdown "Mã SP nội bộ" có mục **"+ Tạo mới mã nội bộ"** → **điều hướng** sang `FEAT-CAT-PROD-CREATE` (cảnh báo rời trang nếu chưa lưu). Cập nhật §2A + §0.1 Δ + §5 (BR-IRV2-027). [ĐỔI ← V1 EC-1 "tạo nhanh sản phẩm"]. |
| 2026-06-10 | 7 | Business Authority | AC-6b: nếu dòng **đã có SKU** → form Tạo mã nội bộ **pre-fill mã + tên SKU** (gắn sẵn tab Mã SKU + Tên sản phẩm = tên SKU; xem FEAT-CAT-PROD-CREATE AC-1b). |
| 2026-06-10 | 8 | Business Authority | **Sửa AC-6b** theo bối cảnh phiếu Nền tảng (mua đẩy sang, chỉ có SKU): chỉ **gắn sẵn SKU vào tab Mã SKU**, **Mã + Tên nội bộ đều nhập tay**; SKU **đã mapping mã khác** → không gắn sẵn. |
| 2026-06-10 | 9 | Business Authority | AC-12 + §2A + EC-1c: phiếu Nền tảng ở **Nháp** có thể tạm thiếu mã nội bộ (chưa tác động tồn); **Ghi sổ bắt buộc mọi dòng có mã nội bộ** → thiếu thì chặn (BR-IRV2-028, `INTERNAL_PRODUCT_REQUIRED`). |
| 2026-06-10 | 10 | Business Authority | Bổ sung **AC-6c**: dropdown "ĐVT nhập" có mục **"+ Thêm ĐVT quy đổi"** → **modal inline** thêm ĐVT quy đổi cho mã nội bộ (không rời phiếu; validate tỷ lệ>0, không trùng) + tự chọn vào dòng. Cập nhật §2A + §0.1 Δ + §5 (BR-IRV2-029). |
| 2026-06-10 | 11 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-15 | 12 | Business Authority | Theo quyết định BA: §5 + EC-5 — chặn tạo/ghi sổ phiếu nhập có ngày ≤ "Tồn đến ngày" của OB (BR-IRV2-030, `TRANSACTION_BEFORE_OPENING_BALANCE`). |
| 2026-06-16 | 13 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng |
| 2026-06-16 | 14 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 15 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IRV2-007). Guard Lưu = phòng vệ. |
| 2026-06-16 | 16 | Business Authority | Cơ chế kế thừa phía nhập (BR-IRV2-031): AC-2 thêm trường **"Phiếu xuất bán"** (hiện khi loại = "Nhập hàng bán bị trả lại", **không bắt buộc**); thêm **AC-3c** — chọn → kế thừa **Đối tượng** + **dòng chi tiết** (kèm đơn giá/giá vốn kế thừa), **không chọn → nhập đơn giá tay**; dòng kế thừa **sửa được** (trả một phần); cập nhật bảng trường + §5. |
| 2026-06-16 | 17 | Business Authority | Thêm cột **"Tự nhập giá"** (checkbox, dòng chi tiết — loại "Nhập hàng bán bị trả lại") vào AC-6 + bảng trường; điều khiển nguồn đơn giá: không tích → hệ thống cập nhật (kế thừa, BQGQ ghi); tích → nhập tay. Cập nhật AC-3c + §5 (thay "không chọn → nhập tay" cũ). Khớp BR-IRV2-031, BR-PRC-017. |
| 2026-06-16 | 18 | Business Authority | Thêm **AC-3d** (BR-IRV2-032): khi có chọn phiếu xuất bán → SL nhập trả ≤ SL đã xuất; vượt → `ERR-INV-040` (chặn lưu/ghi sổ); không chọn → không áp. Cập nhật §5. |
| 2026-06-26 | 19 | Business Authority | **Cascade precision tỷ lệ quy đổi vào modal inline "+ Thêm ĐVT quy đổi"** (theo BR-CAT-PROD-011 v15): AC modal — "(> 0, cho số thập phân)" → "**(> 0, cho số thập phân tối đa 6 chữ số sau dấu phẩy)**"; validate kèm `ERR-INV-013` + **`ERR-INV-047`** (mới — vượt 6 chữ số) + `ERR-INV-014` (trùng ĐVT). Đồng bộ FEAT-CAT-PROD-CREATE v10 + BR-GF-INVENTORY-CATALOG v15 + ERROR-CODE-REGISTRY v16. |
| 2026-06-26 | 20 | Business Authority | **Nâng giới hạn file đính kèm 10 MB → 30 MB** (BA chốt): AC-14 — "mỗi tệp ≤ 10 MB (`ERR-CMN-004`)" → "**mỗi tệp ≤ 30 MB (`ERR-INV-048`** mới — giới hạn Inventory V2)". ERR-CMN-005 (PDF/JPG/PNG) + max 5 tệp giữ nguyên. Đồng bộ BR-IRV2-026 v25 + ERROR-CODE-REGISTRY v17. |
| 2026-06-26 | 21 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87556`. Mobile chưa có. |
| 2026-06-29 | 22 | Business Authority | **Đồng bộ approach 30 MB toàn Inventory V2 — đảo `ERR-INV-048` → `ERR-CMN-004`**: BA chốt all-30MB toàn Inventory V2 đồng nhất → `ERR-CMN-004` common message sẽ đổi "10MB" → "30MB", không cần error code domain-specific. AC-14 + cite BR-IRV2-026 phục hồi wording "theo chuẩn upload file toàn platform". Đồng bộ BR-IRV2-026 v25 + ERROR-CODE-REGISTRY (CR đổi message ERR-CMN-004). |
