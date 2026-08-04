---
type: feature
artifact_kind: feature
status: PLANNED
version: 17
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-06-29"
supersedes: "FEAT-ID-CREATE"
---

# FEAT-ID-CREATE-V2: Tạo phiếu xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-CREATE-V2` |
| Title | Tạo phiếu xuất kho (V2) |
| Parent Epic | `EP-INVENTORY-DELIVERY-V2` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu xuất kho với các dòng phụ tùng (theo SKU / mã nội bộ, ĐVT quy đổi, kho) và thấy tồn khả dụng, **so that** tôi ghi nhận hàng xuất và (khi ghi sổ) trừ đúng tồn theo ĐVT chính mà không làm tồn âm.

## 2. Acceptance Criteria

### Nhóm A — Mở form & thông tin chung

- [ ] **AC-1**: Mở form tạo phiếu
  - Tại: danh sách, nút **"Tạo mới PX"**.
  - Thì: hệ thống mở form **"Phiếu xuất kho"** gồm header + tab **CHI TIẾT** / **ĐÍNH KÈM**, sidebar **"Tổng giá trị phiếu"**, nút **"Đóng"** / **"Lưu"**.

- [ ] **AC-2**: Trường header
  - Tại: vùng header + Thông tin chung.
  - Thì: hệ thống hiển thị: **"Loại phiếu"*** (Xuất bán / Xuất trả hàng mua / Xuất sửa chữa / Xuất khác), **"Mã đơn hàng"** (dropdown SO/phiếu dịch vụ, không bắt buộc), **"Số phiếu nhập"** (dropdown phiếu Nhập mua — **chỉ hiện khi Loại phiếu = "Xuất trả hàng mua"**, thay cho "Mã đơn hàng"), **"Mã lô hàng"**, **"Đối tượng"***, **"Người phụ trách"**, **"Người giao hàng"**, **"Kho xuất"***, **"Diễn giải"**, **"Số phiếu"*** (tự sinh PX-xxxxx), **"Ngày xuất kho"***, **"Trạng thái"*** (mặc định **"Nháp"**). Nguồn xuất (Mua ngoài / Nền tảng) là trường riêng.

- [ ] **AC-3**: Chọn phiếu dịch vụ (SO) không bắt buộc
  - Tại: trường **"Mã đơn hàng"** (SO).
  - Khi: chủ garage chọn SO.
  - Thì: hệ thống kế thừa dữ liệu sản phẩm/đối tượng từ SO. Không chọn → nhập thủ công.

- [ ] **AC-3b**: Số phiếu nhập (khi Loại phiếu = "Xuất trả hàng mua" — **không bắt buộc**)
  - Tại: trường **"Số phiếu nhập"** (chỉ hiện với loại "Xuất trả hàng mua", thay cho "Mã đơn hàng").
  - Khi: chủ garage / kế toán **chọn** một phiếu **Nhập mua** đã ghi sổ.
  - Thì: hệ thống **kế thừa**: (a) **Đối tượng** = Nhà cung cấp của phiếu Nhập mua; (b) **Kho xuất** = kho của phiếu Nhập mua; (c) **toàn bộ dòng chi tiết** (SKU, mã nội bộ, tên, ĐVT, SL, SL quy đổi, kho, **đơn giá/giá vốn kế thừa từ phiếu Nhập mua gốc**) → đổ vào Thông tin chung + tab Chi tiết. Các dòng kế thừa **được sửa**: đổi **SL**, **đơn giá**, hoặc **xóa dòng** (hỗ trợ trả một phần).
  - Khi: **không chọn** số phiếu nhập.
  - Thì: nhập sản phẩm + **SL & đơn giá thủ công** như bình thường. Dù kế thừa hay nhập tay, giá vốn là **tiền vốn của phiếu** — khoản giảm-trừ phía nhập trong BQGQ, không tính lại theo đơn giá BQ kỳ này (BR-IDV2-030, BR-PRC-001/005).

- [ ] **AC-3c**: Chặn SL trả vượt số đã mua (chỉ khi có chọn Số phiếu nhập)
  - Tại: dòng phụ tùng, khi phiếu **có chọn "Số phiếu nhập"**.
  - Khi: SL xuất trả (SL quy đổi) của dòng **vượt quá SL đã nhập** của dòng tương ứng trên phiếu Nhập mua.
  - Thì: hệ thống báo lỗi → mã lỗi **`ERR-INV-040`** và **chặn lưu / ghi sổ**.
  - Khi: phiếu **không chọn** số phiếu nhập.
  - Thì: **không áp** ràng buộc này (BR-IDV2-031).

### Nhóm B — Tab chi tiết

- [ ] **AC-4**: Thêm dòng phụ tùng
  - Tại: tab **CHI TIẾT**, nút **"Thêm phụ tùng"**.
  - Thì: hệ thống thêm dòng với cột: STT, **SKU**, Tên phụ tùng, **Mã SP nội bộ**, Tên SP nội bộ, **Tồn khả dụng**, **ĐVT xuất**, **SL xuất**, **SL quy đổi**, **ĐVT chính**, **Đơn giá vốn**, **Tiền vốn**, **Kho**, Ghi chú, **Thao tác** (icon xóa dòng).

- [ ] **AC-5**: Đổ dữ liệu khi chọn SKU / mã nội bộ
  - Tại: cột SKU / Mã SP nội bộ.
  - Khi: chọn **SKU** (không bắt buộc).
  - Thì: hệ thống đổ Tên phụ tùng + Mã nội bộ + Tên nội bộ + ĐVT chính.
  - Khi: chọn thẳng **Mã SP nội bộ**.
  - Thì: hệ thống đổ Tên nội bộ + ĐVT chính.

- [ ] **AC-5b**: Tạo mới mã nội bộ từ dropdown (điều hướng)
  - Tại: dropdown cột **"Mã SP nội bộ"**, mục cuối **"+ Tạo mới mã nội bộ"**.
  - Khi: chủ garage chọn **"+ Tạo mới mã nội bộ"**.
  - Thì: hệ thống **điều hướng sang màn Tạo mã nội bộ** (`FEAT-CAT-PROD-CREATE`). Nếu phiếu có thay đổi chưa lưu → **cảnh báo rời trang** trước khi đi. Tạo xong, mã mới (**"Đang hoạt động"**) sẵn sàng để chọn vào dòng.
  - Khi: dòng có **SKU chưa mapping mã nội bộ**.
  - Thì: màn Tạo mã nội bộ mở ra **gắn sẵn SKU đó vào tab "Mã SKU"**; **Mã + Tên sản phẩm nội bộ đều nhập tay** (không seed từ tên SKU). Nếu **SKU đã mapping mã khác** → không gắn sẵn (form trống, gắn SKU khác). Xem `FEAT-CAT-PROD-CREATE` AC-1b. (Dòng chưa chọn SKU → form mở trống.)

- [ ] **AC-5c**: Thêm ĐVT quy đổi inline từ dropdown ĐVT xuất
  - Tại: dropdown cột **"ĐVT xuất"**, mục cuối **"+ Thêm ĐVT quy đổi"** (chỉ khả dụng khi dòng **đã chọn mã nội bộ**).
  - Khi: chủ garage chọn **"+ Thêm ĐVT quy đổi"**.
  - Thì: hệ thống mở **modal "Thêm ĐVT quy đổi"** **ngay trên phiếu (không rời form)** gồm **"ĐVT quy đổi"** (từ ĐVT master) + **"Tỷ lệ quy đổi"** (> 0, **số thập phân tối đa 6 chữ số sau dấu phẩy**). Validate theo BR-CAT-PROD-011: tỷ lệ > 0 (`ERR-INV-013`), **≤ 6 chữ số thập phân (`ERR-INV-047`)**, **không trùng ĐVT chính** / **không trùng ĐVT quy đổi đã có** của mã (`ERR-INV-014`). Lưu → **thêm ĐVT vào mã nội bộ** + **tự chọn làm ĐVT xuất** của dòng. (Tái dùng `FEAT-CAT-PROD-CREATE` AC-11.)

- [ ] **AC-6**: Hiển thị tồn khả dụng & cảnh báo
  - Tại: cột **"Tồn khả dụng"**.
  - Khi: chọn mã nội bộ + kho.
  - Thì: hệ thống hiển thị tồn hiện tại của (mã + kho + garage).
  - Khi: **SL xuất > tồn khả dụng**.
  - Thì: hệ thống hiển thị cảnh báo **"Không đủ tồn"** (đỏ) trên dòng và **chặn ghi sổ** (không cho ghi sổ làm tồn âm).

- [ ] **AC-7**: Tính SL quy đổi
  - Tại: dòng phụ tùng.
  - Khi: nhập **SL xuất** (theo ĐVT xuất).
  - Thì: hệ thống tự tính **SL quy đổi = SL xuất × tỷ lệ quy đổi** (ĐVT xuất → ĐVT chính). Tồn (khi ghi sổ) trừ theo **SL quy đổi**.

- [ ] **AC-8**: Tiền vốn = 0 (chưa chạy BQGQ)
  - Tại: cột **"Đơn giá vốn"**, **"Tiền vốn"**, sidebar **"Tổng giá trị phiếu"**.
  - Khi: phiếu chưa được tính giá BQGQ cuối kỳ.
  - Thì: hệ thống hiển thị **0** (giá vốn xuất xác định sau khi chạy BQGQ — xem PRC).

- [ ] **AC-9**: Kho theo dòng + Xóa dòng (per-dòng)
  - Tại: cột **"Kho"** / cột **"Thao tác"** (icon xóa) trên từng dòng.
  - Thì: Kho header đổ xuống dòng, dòng chọn lại được. **Xóa dòng** = icon ở cột Thao tác từng dòng → loại dòng đó + cập nhật Tổng. (Thanh trên tab chi tiết chỉ có nút **"Thêm phụ tùng"** — không có nút "Xóa dòng" hàng loạt.)

### Nhóm C — Lưu & ghi sổ

- [ ] **AC-10**: Lưu (Nháp)
  - Tại: nút **"Lưu"**, Trạng thái **"Nháp"**.
  - Khi: header hợp lệ + ≥ 1 dòng.
  - Thì: hệ thống lưu phiếu **"Nháp"** (chưa trừ tồn), Số phiếu tự sinh.

- [ ] **AC-11**: Ghi sổ kho (check tồn khả dụng)
  - Tại: Trạng thái = **"Ghi sổ kho"** (khi lưu hoặc ghi sổ sau ở chi tiết).
  - Khi: chủ garage ghi sổ.
  - Thì: hệ thống trừ tồn theo SL quy đổi. **Trước khi trừ**: **bắt buộc mọi dòng có mã nội bộ** (BR-IDV2-028 — phiếu Nền tảng từ SO có thể còn dòng chỉ có SKU → chặn `ERR-INV-011`), **check tồn khả dụng** (chặn nếu làm tồn âm — BR-IDV2-004) + **lock kỳ** (chặn nếu kỳ đã đóng).

- [ ] **AC-12**: Đối soát SO
  - Tại: phiếu liên kết SO.
  - Khi: SL/sản phẩm phiếu xuất lệch so với SO.
  - Thì: hệ thống trả **cảnh báo (không chặn)**.

### Nhóm D — Đính kèm & phân quyền

- [ ] **AC-13**: Tệp đính kèm
  - Tại: tab **ĐÍNH KÈM** (hiển thị số lượng).
  - Khi: chủ garage tải tệp đính kèm cho phiếu.
  - Thì: hệ thống cho phép tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform. Không bắt buộc.
- [ ] **AC-14**: Phân quyền — chủ garage + kế toán tạo được, quyền ngang nhau.

## 2A. Trường form — nguồn dữ liệu / bắt buộc / validate

### Header

| Trường | Bắt buộc | Kiểu | Nguồn chọn | Validate |
|---|---|---|---|---|
| Loại phiếu | ✅ | Select | Enum: Xuất bán / Xuất trả hàng mua / Xuất sửa chữa / Xuất khác | — |
| Mã đơn hàng (SO) | ❌ | Select | Danh sách phiếu dịch vụ SO (gf-sales) | Chọn → kế thừa dữ liệu + nguồn xuất + đối soát SO |
| Số phiếu nhập | ❌ | Select | Danh sách phiếu **Nhập mua** đã ghi sổ — **chỉ hiện khi Loại phiếu = "Xuất trả hàng mua"** (thay "Mã đơn hàng"); **không bắt buộc** | Chọn → kế thừa **Đối tượng** (NCC) + **Kho xuất** + **toàn bộ Detail** (kèm đơn giá/giá vốn kế thừa); dòng **sửa được** SL/đơn giá/xóa dòng; **không chọn → nhập SL & đơn giá tay** — AC-3b, BR-IDV2-030 |
| Mã lô hàng | ❌ | Text | nhập tay | — |
| Đối tượng | ✅ | Select | Theo **Loại phiếu**: **Xuất bán → Khách hàng**; **Xuất trả hàng mua → Nhà cung cấp**; **Xuất sửa chữa → Nhân viên**; **Xuất khác → Nhà cung cấp / Khách hàng / Nhân viên** | — |
| Người phụ trách | ❌ | Select | Danh sách nhân sự; **mặc định = nhân viên đang đăng nhập**, cho chọn lại | — |
| Người giao hàng | ❌ | Text | **nhập tay tự do** | — |
| Kho xuất | ✅ | Select | Danh mục kho theo garage | — |
| Diễn giải | ❌ | Text | — | — |
| Số phiếu | ✅ | Auto (read-only) | Hệ thống tự sinh PX-xxxxx | Unique/garage |
| Ngày xuất kho | ✅ | Datetime | — | Ghi sổ chỉ khi kỳ chưa khóa |
| Trạng thái | ✅ | Select | Enum: Nháp / Ghi sổ kho | — |
| Nguồn xuất | (auto) | — | Mua ngoài / Nền tảng — **kế thừa tự động từ SO khi chọn SO** (không chọn tay) | — |

### Dòng chi tiết

| Trường | Bắt buộc | Kiểu | Nguồn chọn | Validate |
|---|---|---|---|---|
| SKU | ❌ | Select | Danh mục SKU đã gắn | Chọn → đổ tên + mã nội bộ + ĐVT chính |
| Mã SP nội bộ | ✅ | Select | Danh mục mã nội bộ **"Đang hoạt động"** (ẩn mã ngừng); mục cuối **"+ Tạo mới mã nội bộ"** → điều hướng `FEAT-CAT-PROD-CREATE` (AC-5b) | Bắt buộc **khi Ghi sổ** (BR-IDV2-028); phiếu **Nền tảng** (SO đẩy) ở Nháp có thể tạm chỉ có SKU (chưa có mã nội bộ) |
| Tên phụ tùng / Tên SP nội bộ / ĐVT chính | (auto) | — | Đổ theo SKU / mã nội bộ | — |
| Tồn khả dụng | (auto) | — | Tồn hiện tại (mã + kho + gara) | — |
| ĐVT xuất | ✅ | Select | **Các ĐVT của mã** = ĐVT chính + các ĐVT quy đổi đã khai; mục cuối **"+ Thêm ĐVT quy đổi"** → modal thêm ĐVT quy đổi cho mã (AC-5c) | — |
| SL xuất | ✅ | Number | — | **> 0**, cho số lẻ; **≤ tồn khả dụng** (vượt → "Không đủ tồn", chặn ghi sổ) |
| SL quy đổi | (auto) | — | = SL xuất × tỷ lệ quy đổi | — |
| Đơn giá vốn / Tiền vốn | (auto) | — | = 0 đến khi chạy BQGQ | — |
| Kho (dòng) | ✅ | Select | Danh mục kho (mặc định theo header, chọn lại được) | — |
| Ghi chú | ❌ | Text | — | — |

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87562&t=W7XJPVvhmdBPtv2c-4 |

- Luồng: [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) §3.1.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Tạo phiếu: Mutation `[PROPOSED] CreateDeliveryV2`.
- Ghi sổ kho: Mutation `[PROPOSED] PostDeliveryV2`.
- Lấy SO: Query `[PROPOSED] GetServiceOrderForDelivery`.
- Tồn khả dụng: Query `[PROPOSED] GetAvailableStock`.

## 5. Business Rules

- **BR-IDV2-001**: Khởi tạo "Nháp"; số phiếu tự sinh.
- **BR-IDV2-003 / 004**: Ghi sổ trừ tồn theo SL quy đổi; check tồn khả dụng, chặn tồn âm.
- **BR-IDV2-007**: Lock kỳ đã đóng.
- **BR-IDV2-008**: Giá vốn xuất = 0 đến khi BQGQ.
- **BR-IDV2-009**: Đối soát SO (cảnh báo).
- **BR-IDV2-010 .. 016**: Phân loại, SO không bắt buộc, trường bắt buộc, kho theo dòng, tồn khả dụng, đổ dữ liệu, SL quy đổi.
- **BR-IDV2-030**: Loại "Xuất trả hàng mua" → trường **"Số phiếu nhập"** (thay "Mã đơn hàng", **không bắt buộc**); chọn phiếu Nhập mua → kế thừa **Đối tượng** (NCC) + **Kho xuất** + **toàn bộ Detail** (kèm đơn giá/giá vốn kế thừa); dòng sửa được (SL/đơn giá/xóa dòng); **không chọn → nhập SL & đơn giá tay**. Giá vốn = giảm-trừ phía nhập trong BQGQ (BR-PRC-001/005).
- **BR-IDV2-031**: Khi có chọn số phiếu nhập → **SL xuất trả ≤ SL đã nhập** của dòng tương ứng; vượt → `ERR-INV-040` (chặn lưu/ghi sổ). Không chọn → không áp.
- **BR-IDV2-017**: Mỗi dòng lưu trường; **tiền vốn = Đơn giá vốn × SL quy đổi** (=0 đến BQGQ).
- **BR-IDV2-027**: "+ Tạo mới mã nội bộ" trong dropdown → điều hướng `FEAT-CAT-PROD-CREATE`.
- **BR-IDV2-029**: "+ Thêm ĐVT quy đổi" trong dropdown ĐVT → modal inline thêm ĐVT quy đổi cho mã nội bộ.
- **BR-IDV2-023**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 6. Edge Cases

- **EC-1**: SL xuất > tồn khả dụng → "Không đủ tồn", chặn ghi sổ.
- **EC-2**: Không chọn SO → nhập thủ công.
- **EC-3**: **Ngày xuất kho thuộc kỳ đã đóng → chặn khi Lưu phiếu (kể cả lưu Nháp), báo `ERR-INV-024`** (BR-IDV2-007). Nút "Thêm mới" không ẩn — kiểm tra tại thời điểm Lưu.
- **EC-4**: Lệch SO → cảnh báo, vẫn cho ghi sổ.
- **EC-5**: Phiếu **Nền tảng** (bán/SO đẩy sang) ở **Nháp** có dòng chỉ có SKU (chưa mã nội bộ) → lưu Nháp được (chưa tác động tồn); bấm **Ghi sổ** mà còn dòng thiếu mã nội bộ → **chặn** (`ERR-INV-011`), yêu cầu tạo/gắn mã nội bộ (AC-5b).
- **EC-6**: Phiếu xuất có ngày **trước "Tồn đến ngày" của tồn đầu kỳ (OB)** → tồn tại thời điểm đó = 0 → **tự báo "Không đủ tồn" / quá số dư** (`ERR-INV-037` / `ERR-INV-036`). **Không có rule chặn riêng** như phiếu nhập (khác nhập: xuất luôn bị chặn tồn âm).

## 7. Out of Scope

- Chi tiết / ghi sổ / bỏ ghi sổ → `FEAT-ID-DETAIL-V2`. Sửa → `FEAT-ID-EDIT-V2`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo FEAT-ID-CREATE-V2 (V2 của FEAT-ID-CREATE) — form header + tab chi tiết (Thêm phụ tùng + Xóa dòng); SKU/mã nội bộ auto-fill, tồn khả dụng + "Không đủ tồn", SL quy đổi, giá vốn=0 đến BQGQ, ghi sổ trừ tồn + check tồn âm + lock kỳ, đối soát SO (cảnh báo). |
| 2026-06-10 | 2 | Business Authority | Gỡ mọi nhắc **"Import dòng"** khỏi tài liệu (V1 vốn không có chức năng này → không mô tả "bỏ Import dòng"). |
| 2026-06-10 | 3 | Business Authority | Bổ sung **AC-5b**: dropdown "Mã SP nội bộ" có mục **"+ Tạo mới mã nội bộ"** → **điều hướng** sang `FEAT-CAT-PROD-CREATE` (cảnh báo rời trang nếu chưa lưu). Cập nhật §2A + §5 (BR-IDV2-027). |
| 2026-06-10 | 4 | Business Authority | AC-5b: nếu dòng **đã có SKU** → form Tạo mã nội bộ **pre-fill mã + tên SKU** (gắn sẵn tab Mã SKU + Tên sản phẩm = tên SKU; xem FEAT-CAT-PROD-CREATE AC-1b). |
| 2026-06-10 | 5 | Business Authority | **Sửa AC-5b**: chỉ **gắn sẵn SKU vào tab Mã SKU**, **Mã + Tên nội bộ đều nhập tay**; SKU **đã mapping mã khác** → không gắn sẵn. |
| 2026-06-10 | 6 | Business Authority | AC-11 + §2A + EC-5: phiếu Nền tảng (bán/SO đẩy) ở **Nháp** có thể tạm thiếu mã nội bộ; **Ghi sổ bắt buộc mọi dòng có mã nội bộ** → thiếu thì chặn (BR-IDV2-028, `INTERNAL_PRODUCT_REQUIRED`). |
| 2026-06-10 | 7 | Business Authority | Bổ sung **AC-5c**: dropdown "ĐVT xuất" có mục **"+ Thêm ĐVT quy đổi"** → **modal inline** thêm ĐVT quy đổi cho mã nội bộ (không rời phiếu) + tự chọn vào dòng. Cập nhật §2A + §5 (BR-IDV2-029). |
| 2026-06-15 | 8 | Business Authority | Theo quyết định BA: EC-6 — xuất trước "Tồn đến ngày" OB tự bị chặn bởi tồn âm/quá số dư (không thêm rule chặn riêng; đối chiếu BR-IDV2-004). |
| 2026-06-15 | 9 | Business Authority | Đổi nhãn cột **"Giá vốn" → "Tiền vốn"** (cột tổng = đơn giá vốn × SL) ở AC-4/AC-8 + bảng field — đồng bộ với "Tiền vốn" ở Export. Giữ nguyên "Đơn giá vốn" và khái niệm "giá vốn xuất". |
| 2026-06-16 | 10 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng. |
| 2026-06-16 | 11 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IDV2-007). Guard Lưu = phòng vệ. |
| 2026-06-16 | 12 | Business Authority | Cơ chế kế thừa phía xuất (BR-IDV2-030): AC-2 thêm trường **"Số phiếu nhập"** (hiện khi loại = "Xuất trả hàng mua", thay "Mã đơn hàng", **không bắt buộc**); thêm **AC-3b** — chọn phiếu Nhập mua → kế thừa **Đối tượng** (NCC) + **Kho xuất** + **toàn bộ Detail** (kèm đơn giá/giá vốn kế thừa); dòng sửa được (SL/đơn giá/xóa dòng); **không chọn → nhập SL & đơn giá tay**; cập nhật bảng trường + §5. |
| 2026-06-16 | 13 | Business Authority | Thêm **AC-3c** (BR-IDV2-031): khi có chọn số phiếu nhập → SL xuất trả ≤ SL đã nhập; vượt → `ERR-INV-040` (chặn lưu/ghi sổ); không chọn → không áp. Cập nhật §5. |
| 2026-06-26 | 14 | Business Authority | **Cascade precision tỷ lệ quy đổi vào modal inline "+ Thêm ĐVT quy đổi"** (theo BR-CAT-PROD-011 v15): AC-5c modal — "(> 0, số thập phân)" → "**(> 0, số thập phân tối đa 6 chữ số sau dấu phẩy)**"; validate kèm `ERR-INV-013` + **`ERR-INV-047`** (mới — vượt 6 chữ số) + `ERR-INV-014` (trùng ĐVT). Đồng bộ FEAT-CAT-PROD-CREATE v10 + BR-GF-INVENTORY-CATALOG v15 + ERROR-CODE-REGISTRY v16. |
| 2026-06-26 | 15 | Business Authority | **Nâng giới hạn file đính kèm 10 MB → 30 MB**: AC-13 — "mỗi tệp ≤ 10 MB (`ERR-CMN-004`)" → "**mỗi tệp ≤ 30 MB (`ERR-INV-048`** mới — giới hạn Inventory V2)". ERR-CMN-005 (PDF/JPG/PNG) + max 5 tệp giữ nguyên. Đồng bộ BR-IDV2-026 v21 + ERROR-CODE-REGISTRY v17. |
| 2026-06-26 | 16 | Business Authority | **Gắn Figma web vào §3** — nguồn authoritative cho registry figma-links (wave 3 sync). Web node `14146-87562`. Mobile chưa có. |
| 2026-06-29 | 17 | Business Authority | **Đồng bộ approach 30 MB toàn Inventory V2 — đảo `ERR-INV-048` → `ERR-CMN-004`**: BA chốt all-30MB toàn Inventory V2 đồng nhất → `ERR-CMN-004` common message sẽ đổi "10MB" → "30MB". AC-13 phục hồi wording "theo chuẩn upload file toàn platform". Đồng bộ BR-IDV2-026 v25 + ERROR-CODE-REGISTRY. |
