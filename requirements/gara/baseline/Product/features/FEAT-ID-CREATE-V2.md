---
type: feature
artifact_kind: feature
status: PLANNED
version: 31
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"
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
  - Thì: hệ thống mở form **"Phiếu xuất kho"** gồm header + tab **Chi tiết** / **Đính kèm**, sidebar **"Tổng giá trị phiếu"**, nút **"Huỷ bỏ"** / **"Tạo"** (primary "Tạo" — form CREATE dùng verb "Tạo"; form Sửa dùng "Lưu" — Figma convention).

- [ ] **AC-2**: Trường header
  - Tại: vùng header + Thông tin chung.
  - Thì: hệ thống hiển thị: **"Loại phiếu"*** (Xuất bán = `DELIVERY_SALE` / Xuất trả hàng mua = `DELIVERY_PURCHASE_RETURN` / Xuất sửa chữa = `DELIVERY_REPAIR` / Xuất khác = `DELIVERY_OTHER` — mã enum backend, lock BR-IDV2-010), **"Mã đơn hàng"** (dropdown SO/phiếu dịch vụ, không bắt buộc), **"Số phiếu nhập"** (dropdown phiếu Nhập mua — **chỉ hiện khi Loại phiếu = "Xuất trả hàng mua"**, thay cho "Mã đơn hàng"), **"Mã lô hàng"**, **"Đối tượng"***, **"Người phụ trách"**, **"Người giao hàng"**, **"Kho xuất"***, **"Diễn giải"**, **"Số phiếu"*** (tự sinh PX-xxxxx), **"Ngày xuất kho"***, **"Trạng thái"*** (mặc định **"Nháp"**). Nguồn xuất (Mua ngoài / Nền tảng — kế thừa V1) là trường riêng.

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
  - Tại: tab **Chi tiết**, nút **"Thêm phụ tùng"**.
  - Thì: hệ thống thêm dòng với cột: STT, **SKU**, Tên phụ tùng, **Mã SP nội bộ**, Tên SP nội bộ, **Tồn khả dụng**, **ĐVT xuất**, **Số lượng xuất**, **SL quy đổi**, **ĐVT chính**, **Đơn giá vốn**, **Tiền vốn**, **Kho**, Ghi chú, **Thao tác** (icon xóa dòng).

- [ ] **AC-5**: Đổ dữ liệu khi chọn SKU / mã nội bộ
  - Tại: cột SKU / Mã SP nội bộ.
  - Khi: chọn **SKU** (không bắt buộc).
  - Thì: hệ thống đổ Tên phụ tùng + Mã nội bộ + Tên nội bộ + ĐVT chính.
  - Khi: chọn thẳng **Mã SP nội bộ**.
  - Thì: hệ thống đổ Tên nội bộ + ĐVT chính.

- [ ] **AC-5b**: Tạo mới mã nội bộ từ dropdown (**modal inline** — không rời form phiếu)
  - Tại: dropdown cột **"Mã SP nội bộ"**, mục cuối **"+ Tạo mới mã nội bộ"**.
  - Khi: chủ garage chọn **"+ Tạo mới mã nội bộ"**.
  - Thì: hệ thống **mở modal inline** chứa **full form `FEAT-CAT-PROD-CREATE`** (4 tab: Thông tin chung / ĐVT quy đổi / Mã SKU / Đính kèm file — reuse component gốc, cùng validation/logic). Form phiếu xuất giữ nguyên phía sau modal (không mất dữ liệu đã nhập). **Không có cảnh báo rời trang** (vì không rời trang). Lưu thành công → mã mới (**"Đang hoạt động"**) tự chọn vào dòng phiếu, đóng modal. Hủy modal → không tạo. Nếu dòng đang có SKU chưa mapping → modal mở gắn sẵn SKU vào tab "Mã SKU" (`FEAT-CAT-PROD-CREATE` AC-1b).
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
  - Khi: nhập **Số lượng xuất** (theo ĐVT xuất).
  - Thì: hệ thống tự tính **SL quy đổi = SL xuất × tỷ lệ quy đổi** (ĐVT xuất → ĐVT chính). Tồn (khi ghi sổ) trừ theo **SL quy đổi**.

- [ ] **AC-8**: Tiền vốn = 0 (chưa chạy BQGQ)
  - Tại: cột **"Đơn giá vốn"**, **"Tiền vốn"**, sidebar **"Tổng giá trị phiếu"**.
  - Khi: phiếu chưa được tính giá BQGQ cuối kỳ.
  - Thì: hệ thống hiển thị **0** (giá vốn xuất xác định sau khi chạy BQGQ — xem PRC).

- [ ] **AC-9**: Kho theo dòng + Xóa dòng (per-dòng)
  - Tại: cột **"Kho"** / cột **"Thao tác"** (icon xóa) trên từng dòng.
  - Thì: Kho header đổ xuống dòng, dòng chọn lại được. **Xóa dòng** = icon ở cột Thao tác từng dòng → loại dòng đó + cập nhật Tổng. (Thanh trên tab chi tiết chỉ có nút **"Thêm phụ tùng"** — không có nút "Xóa dòng" hàng loạt.)

### Nhóm C — Lưu & ghi sổ

- [ ] **AC-10**: Tạo (Nháp)
  - Tại: nút **"Tạo"** (primary form CREATE — Figma convention; Trạng thái mặc định **"Nháp"**).
  - Khi: header hợp lệ + ≥ 1 dòng.
  - Thì: hệ thống lưu phiếu **"Nháp"** (chưa trừ tồn), Số phiếu tự sinh.

- [ ] **AC-11**: Ghi sổ kho (check tồn khả dụng)
  - Tại: Trạng thái = **"Ghi sổ kho"** (khi lưu hoặc ghi sổ sau ở chi tiết).
  - Khi: chủ garage ghi sổ.
  - Thì: hệ thống trừ tồn theo SL quy đổi. **Trước khi trừ**: **bắt buộc mọi dòng có mã nội bộ** (BR-IDV2-028 — phiếu Nền tảng từ SO có thể còn dòng chỉ có SKU → chặn `ERR-INV-011`), **check tồn khả dụng** (chặn nếu làm tồn âm — BR-IDV2-004) + **lock kỳ** (chặn nếu kỳ đã đóng).


### Nhóm D — Đính kèm & phân quyền

- [ ] **AC-13**: Tệp đính kèm
  - Tại: tab **Đính kèm** (hiển thị số lượng).
  - Khi: chủ garage tải tệp đính kèm cho phiếu.
  - Thì: hệ thống cho phép tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform (kế toán upload cả Word/Excel ngoài PDF/ảnh — BR-IDV2-026 v36). Không bắt buộc.
- [ ] **AC-14**: Phân quyền — chủ garage + kế toán tạo được, quyền ngang nhau.

### Nhóm E — Auto-create phiếu Xuất từ Phiếu dịch vụ (system-triggered)

- [ ] **AC-15**: Trigger auto-create từ SO
  - Tại: phiếu dịch vụ (SO) trong `gf-sales`.
  - Khi: SO chuyển trạng thái **lần đầu tiên** theo loại phiếu — SO **"Dịch vụ xe"** (SERVICE) → chuyển sang **"Đang thực hiện"**; SO **"Bán lẻ"** (RETAIL) → chuyển sang **"Đã xác nhận"** — VÀ SO có phụ tùng sử dụng nguồn **INVENTORY** (từ kho) VÀ flag `Inventory:InventoryV2` bật.
  - Thì: hệ thống auto-create 1 phiếu Xuất mới với:
    - **Loại phiếu**: theo loại SO — SO `SERVICE` → `DELIVERY_REPAIR` (Xuất sửa chữa); SO `RETAIL` → `DELIVERY_SALE` (Xuất bán) — fix cứng theo loại SO
    - **Trạng thái**: **"Nháp"** (chưa trừ tồn)
    - **Số phiếu**: tự sinh PX-xxxxx
    - **Nguồn xuất**: **"Nền tảng"** (fix cứng — phiếu do hệ thống tạo)
    - **Ngày xuất kho**: ngày SO chuyển trạng thái
    - **Người phụ trách**: user chuyển SO trạng thái
    - **Người giao hàng**: để trống
    - **Kho xuất**: **kho đầu tiên tìm được của garage** (mỗi garage hiện chỉ có 1 kho)
    - **Đối tượng**: theo Loại phiếu — `DELIVERY_REPAIR` → Nhân viên (user chuyển SO trạng thái); `DELIVERY_SALE` → Khách hàng của SO
    - **Mã đơn hàng (SO)**: liên kết ngược với SO nguồn (dùng cho đối soát BR-IDV2-009 khi user chuyển state Ghi sổ — narrow V1 semantic)
    - **Detail dòng lúc auto-create**:
      - **Kế thừa từ SO** (có giá trị): **SKU · Tên phụ tùng theo SKU · ĐVT xuất · SL xuất** (kế thừa nguyên, không convert).
      - **Fix cứng** (có giá trị): **Kho** (kho đầu tiên garage) · **Đơn giá vốn = 0** · **Tiền vốn = 0** (KHÔNG kế thừa từ SO — nhất quán V2 §2A / BR-IDV2-017, chờ **BQGQ cuối kỳ** update giá vốn thực).
      - **Để TRỐNG (hiển thị "—")** — phụ thuộc user chọn Mã nội bộ khi sửa Nháp: **Mã SP nội bộ · Tên SP nội bộ · ĐVT chính · SL quy đổi · Tồn khả dụng**.
      - **Auto-đổ khi user chọn Mã nội bộ trong form Sửa Nháp**: Tên SP nội bộ + ĐVT chính (theo AC-6) · SL quy đổi = SL xuất × tỷ lệ quy đổi (theo AC-7) · Tồn khả dụng theo (mã+kho+garage).
  - Khi: SO đã sinh phiếu Xuất auto-create rồi và sau đó SO thêm/sửa phụ tùng (lần chuyển trạng thái thứ 2+ hoặc SO edit thêm dòng phụ tùng).
  - Thì: **KHÔNG auto-create** lần nữa — user tạo phiếu Xuất **tay** và chọn lại SO trong dropdown "Mã đơn hàng" để kế thừa data (theo AC-3 hiện có).

> **Sửa phiếu Xuất auto-create trước khi ghi sổ**: phiếu ở trạng thái **"Nháp"** → tuân theo **FEAT-ID-EDIT-V2** (sửa phiếu Nháp tự do, BR-IDV2-005); **Ghi sổ** yêu cầu mọi dòng có Mã nội bộ (BR-IDV2-028) — bao gồm cả dòng auto-create còn để trống Mã.

## 2A. Trường form — nguồn dữ liệu / bắt buộc / validate

### Header

| Trường | Bắt buộc | Kiểu | Nguồn chọn | Validate |
|---|---|---|---|---|
| Loại phiếu | ✅ | Select | Enum lock BR-IDV2-010: Xuất bán (`DELIVERY_SALE`) / Xuất trả hàng mua (`DELIVERY_PURCHASE_RETURN`) / Xuất sửa chữa (`DELIVERY_REPAIR`) / Xuất khác (`DELIVERY_OTHER`) | — |
| Mã đơn hàng (SO) | ❌ | Select | Danh sách phiếu dịch vụ SO (gf-sales) | Chọn → kế thừa dữ liệu + nguồn xuất + đối soát SO |
| Số phiếu nhập | ❌ | Select | Danh sách phiếu **Nhập mua** đã ghi sổ — **chỉ hiện khi Loại phiếu = "Xuất trả hàng mua"** (thay "Mã đơn hàng"); **không bắt buộc** | Chọn → kế thừa **Đối tượng** (NCC) + **Kho xuất** + **toàn bộ Detail** (kèm đơn giá/giá vốn kế thừa); dòng **sửa được** SL/đơn giá/xóa dòng; **không chọn → nhập SL & đơn giá tay** — AC-3b, BR-IDV2-030 |
| Mã lô hàng | ❌ | Text | nhập tay | — |
| Loại đối tượng | ⚠️ | Select | **Chỉ hiển thị khi Loại phiếu = "Xuất khác"** — dropdown top-level trong section "Thông tin chung", cạnh trái "Đối tượng"; single-select **Nhà cung cấp / Khách hàng / Nhân viên** (label VN); là **UI filter widget** cho dropdown "Đối tượng" (không phải business field độc lập); FE derive `objectType` (`SUPPLIER`/`CUSTOMER`/`EMPLOYEE`) từ widget này gửi BE. 3 loại còn lại (Xuất bán / Xuất trả hàng mua / Xuất sửa chữa) **KHÔNG hiển thị field này** — Loại đối tượng derive fix theo Loại phiếu. Ref BR-IDV2-025. | Bắt buộc khi Loại phiếu = "Xuất khác" (chặn Lưu nếu chưa chọn) |
| Đối tượng | ✅ | Select | Theo **Loại phiếu**: **Xuất bán → Khách hàng** (dropdown list KH trực tiếp); **Xuất trả hàng mua → Nhà cung cấp** (dropdown list NCC trực tiếp); **Xuất sửa chữa → Nhân viên** (dropdown list NV trực tiếp); **Xuất khác → list load theo dropdown "Loại đối tượng" cạnh bên**: default (chưa chọn Loại đối tượng) → dropdown disabled + placeholder "Chọn loại đối tượng trước"; chọn Loại đối tượng → enable + list re-fetch từ bảng tương ứng (NCC/KH từ `gf-customer`, NV từ `gf-hrms`); đổi Loại đối tượng → clear selection "Đối tượng" + reload list. Form Sửa Xuất khác: dropdown "Loại đối tượng" auto set theo `object_type` đã lưu + dropdown "Đối tượng" load bảng đó với selected value; user có thể đổi Loại đối tượng để chọn Đối tượng loại khác. **Filter cứng theo status**: NCC chỉ "Đang hoạt động"; KH chỉ "Đang hoạt động"; NV chỉ "Đang làm việc" (không show đối tượng đã ngừng). Edge case form Sửa với phiếu cũ có Đối tượng nay đã ngừng: giữ hiện selected value, không cho chọn lại đối tượng đã ngừng khác. Ref BR-IDV2-025. | — |
| Người phụ trách | ❌ | Select | Danh sách nhân sự **có trạng thái "Đang làm việc"** (không show Ngừng làm việc / Nghỉ việc); **mặc định = nhân viên đang đăng nhập**, cho chọn lại. Edge case form Sửa với phiếu cũ có Người phụ trách nay đã ngừng: giữ hiện selected value nhưng không cho chọn nhân sự đã ngừng khác. Ref BR-IDV2-025. | — |
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
| Mã SP nội bộ | ✅ | Select | Danh mục mã nội bộ **"Đang hoạt động"** (ẩn mã ngừng); mục cuối **"+ Tạo mới mã nội bộ"** → mở **modal inline** reuse `FEAT-CAT-PROD-CREATE` (AC-5b, BR-IDV2-027) — không rời form phiếu | Bắt buộc **khi Ghi sổ** (BR-IDV2-028); phiếu **Nền tảng** (SO đẩy) ở Nháp có thể tạm chỉ có SKU (chưa có mã nội bộ) |
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
- **BR-IDV2-027**: "+ Tạo mới mã nội bộ" trong dropdown → mở **modal inline** reuse full form `FEAT-CAT-PROD-CREATE` (không rời form phiếu, không cảnh báo rời trang).
- **BR-IDV2-029**: "+ Thêm ĐVT quy đổi" trong dropdown ĐVT → modal inline thêm ĐVT quy đổi cho mã nội bộ.
- **BR-IDV2-023**: Phân quyền — chủ garage + kế toán quyền ngang nhau.
- **BR-IDV2-032**: Auto-create phiếu Xuất trạng thái "Nháp" từ SO khi SO chuyển trạng thái phù hợp lần đầu (SERVICE → "Đang thực hiện"; RETAIL → "Đã xác nhận"); loại phiếu theo SO (`DELIVERY_REPAIR` / `DELIVERY_SALE`); nguồn xuất fix "Nền tảng"; kho = kho đầu tiên garage; 1 SO chỉ auto-create 1 lần; partial delivery sau → user tạo tay. Xem thêm CB-IDV2-003 (trigger event).
- **BR-IDV2-033**: Post-Save nav "chuyển Chi tiết phiếu vừa tạo + toast success 3s" (đối xứng BR-IRV2-034). Concurrent edit V2 = **last-write-wins** (không optimistic-lock); cửa sổ xung đột chỉ ở Nháp — Ghi sổ đóng edit (BR-IDV2-024).

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
| 2026-07-13 | 18 | Business Authority (BA in-session review W05 chuẩn bị) | **Thêm mã enum backend cho Loại phiếu** (Option A prefix `DELIVERY_*`, cascade BR-IDV2-010 v23) tại 2 vị trí: (1) AC-1 form field list "Loại phiếu" — thêm mapping label ↔ mã `DELIVERY_SALE` / `DELIVERY_PURCHASE_RETURN` / `DELIVERY_REPAIR` / `DELIVERY_OTHER`; (2) Form data table row "Loại phiếu" — cột "Enum" thêm mã. Ghi chú "Nguồn xuất (kế thừa V1)" — KHÔNG đặt mã V2. Label VN chỉ dùng UI; API/DB/event dùng mã. |
| 2026-07-13 | 19 | Business Authority (BA in-session review W05 chuẩn bị) | **Form data table row "Người phụ trách" thêm filter trạng thái "Đang làm việc"** (cascade BR-IDV2-025 v25). Dropdown Người phụ trách chỉ show nhân sự "Đang làm việc" — không hiện "Ngừng làm việc" / "Nghỉ việc". Edge case phiếu cũ mở form Sửa: giữ hiện selected value dù nhân sự đã ngừng, nhưng không cho chọn nhân sự đã ngừng khác. Áp cho cả form Tạo + Sửa (FEAT-ID-EDIT-V2 reference BR canonical, không cần cascade file riêng). |
| 2026-07-13 | 20 | Business Authority (BA in-session review W05 chuẩn bị) | **Form data table row "Đối tượng" thêm filter status** (cascade BR-IDV2-025 v26 — cùng pattern Người phụ trách). Dropdown Đối tượng filter cứng: NCC chỉ "Đang hoạt động"; KH chỉ "Đang hoạt động"; NV chỉ "Đang làm việc". Edge case phiếu cũ mở form Sửa: giữ selected value dù đối tượng đã ngừng, nhưng không cho chọn đối tượng đã ngừng khác. Áp cả form Tạo + Sửa (FEAT-ID-EDIT-V2 reference BR canonical). |
| 2026-07-13 | 21 | Business Authority (BA in-session review W05 chuẩn bị) | **AC-5b + form table + §5 đổi "+ Tạo mới mã nội bộ" điều hướng → modal inline** (cascade BR-IDV2-027 v28, Option A — modal reuse full component `FEAT-CAT-PROD-CREATE`, đồng bộ với FEAT-IR-CREATE-V2 v26). Trước: click → điều hướng sang màn Tạo mã nội bộ. Sau: **mở modal inline không rời form phiếu**; modal chứa full 4 tab reuse component `FEAT-CAT-PROD-CREATE` — cùng validation/logic, khác container. Lưu thành công → mã mới tự chọn vào dòng, đóng modal. Hủy modal → không tạo. Bỏ cảnh báo rời trang. Pre-fill SKU khi dòng có SKU chưa mapping vẫn áp. Consistent với BR-IDV2-029 "+ Thêm ĐVT quy đổi" đã là modal inline. |
| 2026-07-13 | 22 | Business Authority (BA in-session review W05 chuẩn bị) | **Form data table row "Đối tượng" thêm rule radio-inside-dropdown cho "Xuất khác"** (cascade BR-IDV2-025 v29, đồng bộ FEAT-IR-CREATE-V2 v27). Trường "Đối tượng" trên form vẫn duy nhất 1 field, nhưng khi Loại phiếu = "Xuất khác" → mở dropdown → popup có radio "Loại đối tượng" (NCC/KH/NV) ở top + search + list; default list rỗng + placeholder; tích radio → list load bảng tương ứng; đổi radio → clear + reload. Form Sửa: radio auto tick theo `object_type` đã lưu. Xuất bán/Xuất trả mua/Xuất sửa chữa giữ nguyên dropdown mở ra list trực tiếp không radio. Lý do: 3 loại đối tượng lưu ở 3 bảng khác nhau. |
| 2026-07-13 | 23 | Business Authority | **Bổ sung auto-create phiếu Xuất từ SO** (BA chốt in-session review W05 chuẩn bị, cascade BR-IDV2-032 + CB-IDV2-003): thêm **Nhóm E / AC-15** trigger auto-create — SO SERVICE → chuyển "Đang thực hiện" lần đầu (canonical FEAT-SO-DETAIL AC-17); SO RETAIL → chuyển "Đã xác nhận" lần đầu → auto-create phiếu Nháp; loại phiếu = `DELIVERY_REPAIR` (SERVICE) / `DELIVERY_SALE` (RETAIL); nguồn xuất fix "Nền tảng"; kho = kho đầu tiên garage; 1 SO chỉ auto 1 lần; partial delivery sau tạo tay. Detail kế thừa SKU/Tên SKU/ĐVT xuất/SL xuất; Mã nội bộ để trống (user chọn sau); Tồn khả dụng auto-hiển thị. Sửa Nháp theo FEAT-ID-EDIT-V2 (BR-IDV2-005). §5 thêm ref BR-IDV2-032. Đóng gap V1→V2 (V1 fix trạng thái "Chờ duyệt" + Temporal `DeliveryFulfillmentWorkflow` giữ tên khi cutover V2). Đồng bộ pattern FEAT-IR-CREATE-V2 v28-30. Follow-up: cascade FEAT-SO-DETAIL AC-17 + BR-GF-SALES BR-CROSS-004 + EP-INVENTORY-DELIVERY §3 (V1 stale nói "Hoàn thành") — deferred, chờ owner gf-sales confirm. |
| 2026-07-13 | 24 | Business Authority | **Rà soát field-mapping AC-15 (Q7-Q11 BA chốt)** — clarify detail dòng khi auto-create: (Q7=B giữ nguyên) **Mã nội bộ để trống** (user chọn sau khi sửa Nháp — same pattern Nhập PO); (**Q8=A đổi**) **Đơn giá vốn = 0** (**KHÔNG** kế thừa từ SO — nhất quán V2 §2A / BR-IDV2-017: chờ BQGQ update giá vốn thực); **Tiền vốn = 0**; (Q9-Q10-Q11 giữ nguyên) đối tượng `DELIVERY_REPAIR` = user chuyển SO trạng thái; kho = kho đầu tiên garage; **ĐVT + SL kế thừa nguyên từ SO** (không convert). Cascade BR-IDV2-032 v31 + UX-FLOW-INVENTORY-DELIVERY-V2 v12. |
| 2026-07-13 | 25 | Business Authority | **Rewrite AC-15 detail dòng thành 4 nhóm state rõ ràng** (BA chốt sau khi rà tiếp field-level): (1) Kế thừa từ SO có giá trị: SKU / Tên phụ tùng theo SKU / ĐVT xuất / SL xuất; (2) Fix cứng có giá trị: Kho (kho đầu tiên garage) / Đơn giá vốn = 0 / Tiền vốn = 0; (3) **Để TRỐNG (hiển thị "—")** lúc auto-create vì phụ thuộc Mã nội bộ chưa được chọn: **Mã SP nội bộ / Tên SP nội bộ / ĐVT chính / SL quy đổi / Tồn khả dụng**; (4) Auto-đổ khi user chọn Mã nội bộ trong form Sửa Nháp: Tên SP nội bộ + ĐVT chính (AC-6) / SL quy đổi = SL xuất × tỷ lệ quy đổi (AC-7) / Tồn khả dụng. Wording trước gộp "Mã nội bộ để trống" + "SL quy đổi auto-tính sau" gây confuse (không rõ 5 field derived đều trống). Cascade BR-IDV2-032 v32 + UX-FLOW EC-8 v13. |
| 2026-07-14 | 26 | Business Authority | **§5 cite BR-IDV2-033 Post-Save nav + last-write-wins** (BA-review 2026-07-14 C2.4 + C2.5 traceability cascade, đối xứng FEAT-IR-CREATE-V2 v29). Rule mô tả trong BR-GF-INVENTORY-DELIVERY-V2 v34 §2.4. |
| 2026-07-14 | 27 | Business Authority | **Sync doc ↔ Figma cross-check W05 (SYS-1 + SYS-2 P0, đối xứng FEAT-IR-CREATE-V2 v30)**: (1) Button labels — AC-1 "Đóng/Lưu" → **"Huỷ bỏ/Tạo"**; AC-10 title "Lưu" → **"Tạo"**, nút "Lưu" → **"Tạo"** (form CREATE dùng verb "Tạo" — Figma convention). (2) AC-13 attachment whitelist mở rộng: "PDF, JPG, PNG" → **"PDF, JPG, PNG, DOC, XLSX"** (kế toán upload Word/Excel — BR-IDV2-026 v36, ERR-CMN-005 v22). |
| 2026-07-14 | 28 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-6 + SYS-11 P1** (đối xứng FEAT-IR-CREATE-V2 v31): (a) Tab casing "CHI TIẾT / ĐÍNH KÈM" → **"Chi tiết / Đính kèm"**. (b) "SL xuất" → **"Số lượng xuất"** (full form; SL quy đổi/tồn giữ viết tắt). |
| 2026-07-15 | 29 | Business Authority | **Mở rộng AC-12 declare UI banner đối soát SO** (GAP #3 pre-DEV W05 rà soát) — AC-12 cũ chỉ 3 dòng behavior ("trả cảnh báo không chặn") thiếu UI spec → DEV/QA không có T2 source, phải "guess-based" theo PKG-W05 (T4 execution). Version mới bổ sung: (a) trigger khi nào (sau Tạo / Ghi sổ có SO); (b) wording verbatim "Đối soát với đơn dịch vụ có sai lệch" (case `ERR-INV-039`) + "Không thể đối soát với đơn dịch vụ" (case DEGRADED `ERR-CMN-007-DEGRADED` fail-OPEN); (c) delegated vị trí/màu/icon về `FEAT-ID-DETAIL-V2` AC-2b (tránh duplicate spec — banner render trên màn chi tiết post-save). Vẫn warning-only KHÔNG chặn. Cascade từ FEAT-ID-DETAIL-V2 v10. |
| 2026-07-16 | 31 | Business Authority (in-session BA fix — Figma FEAT-ID-CREATE-V2 W05 canonical) | **Form data table row "Đối tượng" flip radio-inside-dropdown → 2 dropdown song song trên form** (cascade BR-IDV2-025 v41, đối xứng FEAT-IR-CREATE-V2 v32 upcoming — align Figma FEAT-ID-CREATE-V2 W05). Trước v22: 1 row "Đối tượng" duy nhất, popup có radio "Loại đối tượng" ẩn ở top. Sau: **thêm row mới "Loại đối tượng"** (⚠️ conditional required — chỉ hiển thị khi Loại phiếu = "Xuất khác"), dropdown top-level cạnh trái "Đối tượng"; single-select NCC/KH/NV; là UI filter widget (FE derive `objectType` gửi BE); + rewrite row "Đối tượng" thành list load theo dropdown "Loại đối tượng" cạnh bên (thay vì radio ẩn trong popup). 3 loại còn lại (Xuất bán/Xuất trả mua/Xuất sửa chữa) KHÔNG hiển thị "Loại đối tượng" (derive fix theo Loại phiếu). Backend contract giữ nguyên. Lý do: Figma FEAT-ID-CREATE-V2 W05 vẽ 2 dropdown song song, user in-session 2026-07-16 confirm giữ Figma làm canonical UX. |
| 2026-07-16 | 30 | Business Authority | **AC-12 BỎ HOÀN TOÀN — đối soát SO KHÔNG trigger tại CREATE** (narrow V1 semantic per BR-IDV2-009 v40 rewrite). Rule mới: đối soát SO CHỈ trigger tại state transition Nháp → Ghi sổ (form Sửa dropdown / form Chi tiết button / mobile List inline), KHÔNG trigger tại Save form Tạo (bất kể `postOnSave=true/false`, bất kể có SO hay không). AC-12 cũ (đối soát post-save CREATE + hiển thị banner delegate về AC-2b) v29 hoàn toàn deprecated — đối xứng V1 baseline `BR-ID-DTL-006`, không broaden CREATE như spec cũ. Reconciliation trigger mới xem: `FEAT-ID-EDIT-V2` AC-4b (form Sửa) + `FEAT-ID-DETAIL-V2` AC-5 (nút Ghi sổ web+mobile) + `FEAT-ID-LIST-V2` (mobile inline Ghi sổ). Fix version drift do session refactor (BR-IDV2-009 rewrite v40 kéo cascade AC-12 deprecate nhưng chưa bump version 3-in-1). |
