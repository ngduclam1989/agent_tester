---
type: feature
artifact_kind: feature
status: PLANNED
version: 33
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT-V2"
boundary: "gf-inventory"
last_reviewed: "2026-07-16"  # v33 RGR RR-003 + RR-010 batch fix (bachho RGR + sonhoang decisions 2026-07-16): AC-3e bổ sung kế thừa PO partial delivery (filter + SL default `maxCount` + cảnh báo vượt) + AC-4 rewrite explicit auto-only Nguồn nhập (không có input tay, khớp §2A). No Architecture/BR cascade — BFF field đã sẵn v7.70. v32 → v33.
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
  - Thì: hệ thống mở form **"Tạo phiếu nhập kho"** với mô tả **"Bố cục theo form phiếu: thông tin chung ở trên, chi tiết dòng nhập ở tab bên dưới."**, gồm header + tab **Chi tiết** / **Đính kèm**, sidebar **"Tổng giá trị phiếu"**, nút **"Huỷ bỏ"** / **"Tạo"** (primary "Tạo" — form CREATE dùng verb "Tạo" thay vì "Lưu"; form Sửa dùng "Lưu" — Figma convention).

- [ ] **AC-2**: Trường header
  - Tại: vùng header + Thông tin chung.
  - Khi: form được mở.
  - Thì: hệ thống hiển thị: **"Loại phiếu"*** (Nhập mua = `RECEIPT_PURCHASE` / Nhập hàng bán bị trả lại = `RECEIPT_SALE_RETURN` / Nhập khác = `RECEIPT_OTHER` — mã enum backend, lock BR-IRV2-009), **"Mã đơn hàng"** (dropdown PO, không bắt buộc), **"Phiếu xuất bán"** (dropdown — **chỉ hiện khi Loại phiếu = "Nhập hàng bán bị trả lại"**), **"Mã lô hàng"**, **"Đối tượng"***, **"Người phụ trách"**, **"Người giao hàng"**, **"Kho nhập"***, **"Diễn giải"**, **"Số phiếu"*** (tự sinh PN-xxxxx), **"Ngày nhập kho"***, **"Trạng thái"*** (mặc định **"Nháp"**).

- [ ] **AC-3**: Chọn đơn hàng PO (không bắt buộc)
  - Tại: trường **"Mã đơn hàng"**.
  - Khi: chủ garage chọn một PO.
  - Thì: hệ thống **kế thừa dữ liệu** sản phẩm/đối tượng từ đơn hàng. Khi không chọn PO → nhập sản phẩm thủ công ở tab chi tiết.

- [ ] **AC-3b**: Validate SL nhập theo đơn hàng (chỉ khi có gắn PO)
  - Tại: dòng phụ tùng, khi phiếu **có gắn PO**.
  - Khi: chủ garage nhập **Số lượng nhập** vượt quá **SL đặt hàng** (còn lại) của dòng tương ứng từ PO.
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

- [ ] **AC-3e**: Kế thừa PO đã nhập một phần — filter dropdown + SL mặc định + cảnh báo vượt (BFF `searchDirectPurchaseOrders` + `getPurchaseOrderForReceipt`)
  - Tại: dropdown **"Mã đơn hàng"** (AC-3).
  - Khi: chủ garage mở dropdown chọn PO.
  - Thì: hệ thống chỉ hiển thị PO có **ít nhất 1 dòng còn SL nhập** (BFF query gọi với input `excludeFullyReceived: true` — đã có sẵn v7.70 §3h; PO đã nhập đủ hết mọi dòng → auto ẩn khỏi dropdown, tránh user chọn nhầm tạo phiếu rỗng).
  - Khi: chủ garage chọn 1 PO.
  - Thì: hệ thống kế thừa dòng chi tiết (AC-3) + **Số lượng nhập mặc định của mỗi dòng = `maxCount`** (BFF `getPurchaseOrderForReceipt.items[].maxCount` — SL còn lại của dòng = SL đặt hàng gốc − Σ SL đã nhập của các phiếu Nhập trước đó ở trạng thái Ghi sổ). Trường hợp PO chưa có phiếu Nhập nào trước → `maxCount = SL đặt hàng gốc`.
  - Khi: chủ garage tự sửa **Số lượng nhập** vượt `maxCount`.
  - Thì: hệ thống hiển thị **cảnh báo đỏ inline trên dòng** ("Số lượng nhập vượt số lượng đặt hàng còn lại. SL còn lại = {X}") ngay khi gõ (real-time validate) + **chặn lưu / ghi sổ** với message giống AC-3b **"Số lượng nhập không được vượt quá số lượng đặt hàng."**. User giảm SL về ≤ `maxCount` → cảnh báo tự biến mất.
  - Ref: BR-IRV2-010 + `agg-garage-graph-graphql.md v7.70 §3h getPurchaseOrderForReceipt` (line-level `maxCount`) + `searchDirectPurchaseOrders` (input `excludeFullyReceived: true`). AC-3e extend AC-3b với 2 hành vi bổ sung: filter dropdown + SL default kế thừa.

- [ ] **AC-4**: Nguồn nhập (auto-derive, không có input tay)
  - Tại: trường **"Nguồn nhập"** ở header.
  - Khi: chủ garage **chọn 1 PO** ở trường "Mã đơn hàng" (AC-3).
  - Thì: hệ thống **auto điền Nguồn nhập** kế thừa từ trường `Nguồn` của PO gốc (**Mua ngoài** / **Nền tảng** — 2 giá trị enum). Trường **read-only** với user (không có option nhập tay / không có dropdown chọn).
  - Khi: **không chọn PO** (phiếu Nhập độc lập, không kế thừa).
  - Thì: trường Nguồn nhập **để trống** (hiển thị placeholder "—"). Trường vẫn read-only, không cho user gõ tay.
  - Ref: §2A row "Nguồn nhập" — kiểu auto-only, không có manual input.

### Nhóm B — Tab chi tiết: dòng phụ tùng

- [ ] **AC-5**: Thêm dòng phụ tùng
  - Tại: tab **Chi tiết**, nút **"Thêm phụ tùng"**.
  - Khi: chủ garage thêm dòng.
  - Thì: hệ thống thêm dòng với các cột: STT, **SKU**, Tên phụ tùng, **Mã SP nội bộ**, Tên SP nội bộ, **ĐVT nhập**, **Số lượng nhập**, **SL quy đổi**, **ĐVT chính**, **Tự nhập giá** (checkbox — chỉ loại "Nhập hàng bán bị trả lại"), **Đơn giá nhập**, **Thành tiền**, **Kho**, Ghi chú, **Thao tác** (icon xóa dòng).

- [ ] **AC-6**: Đổ dữ liệu khi chọn SKU / mã nội bộ
  - Tại: cột **SKU** / **Mã SP nội bộ**.
  - Khi: chủ garage chọn **SKU** (không bắt buộc).
  - Thì: hệ thống đổ: Tên phụ tùng (theo SKU) + Mã nội bộ + Tên nội bộ + ĐVT chính.
  - Khi: chủ garage chọn thẳng **Mã SP nội bộ** (không qua SKU).
  - Thì: hệ thống đổ: Tên SP nội bộ + ĐVT chính.

- [ ] **AC-6b**: Tạo mới mã nội bộ từ dropdown (**modal inline** — không rời form phiếu)
  - Tại: dropdown cột **"Mã SP nội bộ"**, mục cuối **"+ Tạo mới mã nội bộ"**.
  - Khi: chủ garage chọn **"+ Tạo mới mã nội bộ"**.
  - Thì: hệ thống **mở modal inline** chứa **full form `FEAT-CAT-PROD-CREATE`** (4 tab: Thông tin chung / ĐVT quy đổi / Mã SKU / Đính kèm file — reuse component gốc, cùng validation/logic). Form phiếu nhập giữ nguyên phía sau modal (không mất dữ liệu đã nhập). **Không có cảnh báo rời trang** (vì không rời trang). Lưu thành công → mã mới (**"Đang hoạt động"**) tự chọn vào dòng phiếu, đóng modal. Hủy modal → không tạo. Nếu dòng đang có SKU chưa mapping → modal mở gắn sẵn SKU vào tab "Mã SKU" (`FEAT-CAT-PROD-CREATE` AC-1b).
  - Khi: dòng có **SKU chưa mapping mã nội bộ** (điển hình: phiếu **Nền tảng** do bên mua đẩy sang — dòng chỉ có mã SKU + tên SKU, chưa có mã nội bộ).
  - Thì: màn Tạo mã nội bộ mở ra **gắn sẵn SKU đó vào tab "Mã SKU"**; **Mã + Tên sản phẩm nội bộ đều nhập tay** (không seed từ tên SKU). Nếu **SKU đã mapping mã khác** → không gắn sẵn (form trống, gắn SKU khác). Xem `FEAT-CAT-PROD-CREATE` AC-1b. (Dòng chưa chọn SKU → form mở trống.)

- [ ] **AC-6c**: Thêm ĐVT quy đổi inline từ dropdown ĐVT nhập
  - Tại: dropdown cột **"ĐVT nhập"**, mục cuối **"+ Thêm ĐVT quy đổi"** (chỉ khả dụng khi dòng **đã chọn mã nội bộ**).
  - Khi: chủ garage chọn **"+ Thêm ĐVT quy đổi"**.
  - Thì: hệ thống mở **modal "Thêm ĐVT quy đổi"** **ngay trên phiếu (không rời form)** gồm **"ĐVT quy đổi"** (dropdown từ ĐVT master) + **"Tỷ lệ quy đổi"** (> 0, **cho số thập phân tối đa 6 chữ số sau dấu phẩy**). Validate theo BR-CAT-PROD-011: tỷ lệ > 0 (`ERR-INV-013`), **≤ 6 chữ số thập phân (`ERR-INV-047`)**, **không trùng ĐVT chính** và **không trùng ĐVT quy đổi đã có** của mã (`ERR-INV-014`). Lưu → **thêm ĐVT đó vào mã nội bộ** + **tự chọn làm ĐVT nhập** của dòng. (Tái dùng hành vi tab "ĐVT quy đổi" của `FEAT-CAT-PROD-CREATE` AC-11.)

- [ ] **AC-7**: Tính SL quy đổi & thành tiền
  - Tại: dòng phụ tùng.
  - Khi: chủ garage nhập **Số lượng nhập** (theo ĐVT nhập) và **Đơn giá nhập**.
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
  - Thì: hệ thống hiển thị Tổng: **Số lượng nhập**, **SL quy đổi**, **Thành tiền**; sidebar **"Tổng giá trị phiếu"** = Σ thành tiền.

### Nhóm C — Lưu & trạng thái

- [ ] **AC-11**: Tạo phiếu (Nháp)
  - Tại: nút **"Tạo"** (primary form CREATE — Figma convention; Trạng thái mặc định **"Nháp"**).
  - Khi: header hợp lệ + có ít nhất 1 dòng.
  - Thì: hệ thống lưu phiếu trạng thái **"Nháp"** (chưa tác động tồn), Số phiếu tự sinh.

- [ ] **AC-12**: Lưu kèm ghi sổ kho
  - Tại: Trạng thái = **"Ghi sổ kho"** khi lưu (hoặc ghi sổ sau ở chi tiết).
  - Khi: chủ garage ghi sổ.
  - Thì: hệ thống cộng tồn theo SL quy đổi cho từng (mã + kho + gara). **Trước khi cộng**: **bắt buộc mọi dòng có mã nội bộ** (BR-IRV2-028 — phiếu Nền tảng có thể còn dòng chỉ có SKU → chặn, yêu cầu tạo/gắn mã nội bộ), **check tồn âm** (BR-IRV2-008) và **lock kỳ** (BR-IRV2-007); vi phạm → chặn.

- [ ] **AC-13**: Huỷ bỏ form
  - Tại: nút **"Huỷ bỏ"** (secondary — Figma convention thay cho "Đóng").
  - Khi: chủ garage nhấn.
  - Thì: hệ thống đóng form, không lưu.

### Nhóm D — Đính kèm & phân quyền

- [ ] **AC-14**: Tệp đính kèm
  - Tại: tab **Đính kèm** (hiển thị số lượng, vd "Đính kèm (1)").
  - Khi: chủ garage tải tệp đính kèm cho phiếu.
  - Thì: hệ thống cho phép tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform (kế toán upload cả Word/Excel ngoài PDF/ảnh — BR-IRV2-026 v39). Không bắt buộc.

- [ ] **AC-15**: Phân quyền
  - Tại: danh sách / form.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò tạo được với quyền ngang nhau.

### Nhóm E — Auto-create phiếu Nhập từ PO (system-triggered)

- [ ] **AC-16**: Trigger auto-create từ PO
  - Tại: PO trong `gf-purchase`.
  - Khi: PO chuyển sang trạng thái **"Đang giao hàng"** lần đầu tiên (áp cả 2 source PO `DIRECT` + `QUOTATION_ASK`) VÀ flag `Inventory:InventoryV2` bật.
  - Thì: hệ thống auto-create 1 phiếu Nhập với:
    - **Header có giá trị**: **Loại phiếu** = `RECEIPT_PURCHASE` (fix cứng) · **Trạng thái** = **"Nháp"** (chưa cộng tồn) · **Số phiếu** tự sinh PN-xxxxx · **Nguồn nhập** kế thừa `PO.Nguồn đơn` (Mua ngoài / Nền tảng) · **Ngày nhập kho** = ngày PO chuyển trạng thái · **Người phụ trách** = user chuyển PO trạng thái · **Người giao hàng** để trống · **Kho nhập** = kho đầu tiên tìm được của garage (1 garage 1 kho hiện tại) · **Đối tượng (NCC)** kế thừa từ PO · **Mã đơn hàng (PO)** liên kết ngược PO nguồn.
    - **Detail dòng lúc auto-create — 4 nhóm state**:
      - **Kế thừa từ PO** (có giá trị): **SKU · Tên phụ tùng theo SKU · ĐVT nhập · SL nhập · Đơn giá nhập** (kế thừa nguyên, không convert).
      - **Fix cứng / auto-tính** (có giá trị): **Kho** (kho đầu tiên garage) · **Thành tiền** = SL nhập × Đơn giá nhập (auto-tính ngay theo AC-7) · **Tổng phiếu** = Σ Thành tiền (auto-tính theo AC-10).
      - **Để TRỐNG (hiển thị "—")** — phụ thuộc user chọn Mã nội bộ khi sửa Nháp: **Mã SP nội bộ · Tên SP nội bộ · ĐVT chính · SL quy đổi**.
      - **Auto-đổ khi user chọn Mã nội bộ trong form Sửa Nháp**: Tên SP nội bộ + ĐVT chính (theo AC-6) · SL quy đổi = SL nhập × tỷ lệ quy đổi (theo AC-7).
  - Khi: PO đã sinh phiếu Nhập auto-create rồi và có partial delivery lần 2+.
  - Thì: **KHÔNG auto-create** lần nữa — user tạo phiếu Nhập **tay** và chọn lại PO trong dropdown "Mã đơn hàng" để kế thừa data (theo AC-3 hiện có).

> **Sửa phiếu Nhập auto-create trước khi ghi sổ**: phiếu ở trạng thái **"Nháp"** → tuân theo **FEAT-IR-EDIT-V2** (sửa phiếu Nháp tự do, BR-IRV2-005); **Ghi sổ** yêu cầu mọi dòng có Mã nội bộ (BR-IRV2-028) — bao gồm cả dòng auto-create còn để trống Mã.

## 2A. Trường form — nguồn dữ liệu / bắt buộc / validate

### Header

| Trường | Bắt buộc | Kiểu | Nguồn chọn | Validate |
|---|---|---|---|---|
| Loại phiếu | ✅ | Select | Enum lock BR-IRV2-009: Nhập mua (`RECEIPT_PURCHASE`) / Nhập hàng bán bị trả lại (`RECEIPT_SALE_RETURN`) / Nhập khác (`RECEIPT_OTHER`) | — |
| Mã đơn hàng (PO) | ❌ | Select | Danh sách PO (gf-purchase) | Chọn → kế thừa dữ liệu + nguồn nhập; khi đã chọn → SL nhập mỗi dòng ≤ SL đặt hàng (AC-3b) |
| Phiếu xuất bán | ❌ | Select | Danh sách phiếu Xuất bán đã ghi sổ — **chỉ hiện khi Loại phiếu = "Nhập hàng bán bị trả lại"**; **không bắt buộc** | Chọn → kế thừa **Đối tượng** (Khách hàng) + **dòng chi tiết** (kèm đơn giá/giá vốn kế thừa); đơn giá kế thừa/cập nhật khi dòng **"Tự nhập giá" không tích**, nhập tay khi **tích** — AC-3c, BR-IRV2-031 |
| Mã lô hàng | ❌ | Text | nhập tay | — |
| Loại đối tượng | ⚠️ | Select | **Chỉ hiển thị khi Loại phiếu = "Nhập khác"** — dropdown top-level trong section "Thông tin chung", cạnh trái "Đối tượng"; single-select **Nhà cung cấp / Khách hàng / Nhân viên** (label VN); là **UI filter widget** cho dropdown "Đối tượng" (không phải business field độc lập); FE derive `objectType` (`SUPPLIER`/`CUSTOMER`/`EMPLOYEE`) từ widget này gửi BE. 2 loại còn lại (Nhập mua / Nhập hàng bán bị trả lại) **KHÔNG hiển thị field này** — Loại đối tượng derive fix theo Loại phiếu. Ref BR-IRV2-025. | Bắt buộc khi Loại phiếu = "Nhập khác" (chặn Lưu nếu chưa chọn) |
| Đối tượng | ✅ | Select | Theo **Loại phiếu**: **Nhập mua → Nhà cung cấp** (dropdown list NCC trực tiếp); **Nhập hàng bán bị trả lại → Khách hàng** (dropdown list KH trực tiếp); **Nhập khác → list load theo dropdown "Loại đối tượng" cạnh bên**: default (chưa chọn Loại đối tượng) → dropdown disabled + placeholder "Chọn loại đối tượng trước"; chọn Loại đối tượng → enable + list re-fetch từ bảng tương ứng (NCC/KH từ `gf-customer`, NV từ `gf-hrms`); đổi Loại đối tượng → clear selection "Đối tượng" + reload list. Form Sửa Nhập khác: dropdown "Loại đối tượng" auto set theo `object_type` đã lưu + dropdown "Đối tượng" load bảng đó với selected value; user có thể đổi Loại đối tượng để chọn Đối tượng loại khác. **Filter cứng theo status**: NCC chỉ "Đang hoạt động"; KH chỉ "Đang hoạt động"; NV chỉ "Đang làm việc" (không show đối tượng đã ngừng). Edge case form Sửa với phiếu cũ có Đối tượng nay đã ngừng: giữ hiện selected value, không cho chọn lại đối tượng đã ngừng khác. Ref BR-IRV2-025. | — |
| Người phụ trách | ❌ | Select | Danh sách nhân sự **có trạng thái "Đang làm việc"** (không show Ngừng làm việc / Nghỉ việc); **mặc định = nhân viên đang đăng nhập**, cho chọn lại. Edge case form Sửa với phiếu cũ có Người phụ trách nay đã ngừng: giữ hiện selected value nhưng không cho chọn nhân sự đã ngừng khác. Ref BR-IRV2-025. | — |
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
| Mã SP nội bộ | ✅ | Select | Danh mục mã nội bộ **"Đang hoạt động"** (ẩn mã ngừng); mục cuối **"+ Tạo mới mã nội bộ"** → mở **modal inline** reuse `FEAT-CAT-PROD-CREATE` (AC-6b, BR-IRV2-027) — không rời form phiếu | Bắt buộc **khi Ghi sổ** (BR-IRV2-028); phiếu **Nền tảng** ở Nháp có thể tạm chỉ có SKU (chưa có mã nội bộ) |
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
- **BR-IRV2-027**: "+ Tạo mới mã nội bộ" trong dropdown → mở **modal inline** reuse full form `FEAT-CAT-PROD-CREATE` (không rời form phiếu, không cảnh báo rời trang).
- **BR-IRV2-029**: "+ Thêm ĐVT quy đổi" trong dropdown ĐVT → modal inline thêm ĐVT quy đổi cho mã nội bộ.
- **BR-IRV2-030**: Chặn lưu/ghi sổ phiếu nhập có **ngày nhập ≤ "Tồn đến ngày" của tồn đầu kỳ (OB)** cùng (mã+kho) → `ERR-INV-038` (OB phải là điểm khởi đầu, phiếu phải sau OB).
- **BR-IRV2-031**: Loại "Nhập hàng bán bị trả lại" → trường **"Phiếu xuất bán"** (**không bắt buộc**); chọn → kế thừa **Đối tượng** + **dòng chi tiết**. Mỗi dòng có checkbox **"Tự nhập giá"**: **không tích** → đơn giá để hệ thống cập nhật (kế thừa giá vốn từ Xuất bán, do BQGQ ghi); **tích** → nhập đơn giá tay. Giá trị nhập của phiếu dùng cho BQGQ (BR-PRC-001/005).
- **BR-IRV2-032**: Khi có chọn phiếu xuất bán → **SL nhập trả ≤ SL đã xuất** của dòng tương ứng; vượt → `ERR-INV-040` (chặn lưu/ghi sổ). Không chọn → không áp.
- **BR-IRV2-033**: Auto-create phiếu Nhập trạng thái "Nháp" từ PO khi PO chuyển "Đang giao hàng" lần đầu (áp cả 2 source PO `DIRECT` + `QUOTATION_ASK` khi flag `Inventory:InventoryV2` bật); loại `RECEIPT_PURCHASE`; nguồn kế thừa `PO.Nguồn đơn`; kho = kho đầu tiên garage; 1 PO chỉ auto-create 1 lần; partial delivery sau → user tạo tay. Xem thêm CB-IRV2-003 (trigger event).
- **BR-IRV2-034**: Post-Save nav "chuyển Chi tiết phiếu vừa tạo + toast success 3s" (đã user chọn Recommended pattern). Concurrent edit V2 = **last-write-wins** (không optimistic-lock); cửa sổ xung đột chỉ ở Nháp — Ghi sổ đóng edit (BR-IRV2-024).

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
| 2026-07-13 | 23 | Business Authority (BA in-session review W05 chuẩn bị) | **Thêm mã enum backend cho Loại phiếu** (Option A prefix `RECEIPT_*`, cascade BR-IRV2-009 v28) tại 2 vị trí: (1) AC-1 form field list "Loại phiếu" — thêm mapping label ↔ mã `RECEIPT_PURCHASE` / `RECEIPT_SALE_RETURN` / `RECEIPT_OTHER`; (2) Form data table row "Loại phiếu" — cột "Enum" thêm mã. Label VN chỉ dùng UI; API/DB/event dùng mã. |
| 2026-07-13 | 24 | Business Authority (BA in-session review W05 chuẩn bị) | **Form data table row "Người phụ trách" thêm filter trạng thái "Đang làm việc"** (cascade BR-IRV2-025 v29). Dropdown Người phụ trách chỉ show nhân sự "Đang làm việc" — không hiện "Ngừng làm việc" / "Nghỉ việc". Edge case phiếu cũ mở form Sửa: giữ hiện selected value dù nhân sự đã ngừng, nhưng không cho chọn nhân sự đã ngừng khác. Áp cho cả form Tạo + Sửa (FEAT-IR-EDIT-V2 reference BR canonical, không cần cascade file riêng). |
| 2026-07-13 | 25 | Business Authority (BA in-session review W05 chuẩn bị) | **Form data table row "Đối tượng" thêm filter status** (cascade BR-IRV2-025 v30 — cùng pattern Người phụ trách). Dropdown Đối tượng filter cứng: NCC chỉ "Đang hoạt động"; KH chỉ "Đang hoạt động"; NV chỉ "Đang làm việc". Edge case phiếu cũ mở form Sửa: giữ selected value dù đối tượng đã ngừng, nhưng không cho chọn đối tượng đã ngừng khác. Áp cả form Tạo + Sửa (FEAT-IR-EDIT-V2 reference BR canonical). |
| 2026-07-13 | 26 | Business Authority (BA in-session review W05 chuẩn bị) | **AC-6b + form table + §5 đổi "+ Tạo mới mã nội bộ" điều hướng → modal inline** (cascade BR-IRV2-027 v32, Option A — modal reuse full component `FEAT-CAT-PROD-CREATE`). Trước: click → điều hướng sang màn Tạo mã nội bộ (cảnh báo rời trang nếu chưa lưu phiếu). Sau: **mở modal inline không rời form phiếu**; modal chứa full 4 tab reuse component `FEAT-CAT-PROD-CREATE` — cùng validation/logic, khác container; form phiếu giữ nguyên phía sau modal (không mất dữ liệu). Lưu thành công → mã mới tự chọn vào dòng, đóng modal. Hủy modal → không tạo. Bỏ cảnh báo rời trang. Pre-fill SKU khi dòng có SKU chưa mapping vẫn áp. Lý do: UX tốt hơn, consistent với BR-IRV2-029 "+ Thêm ĐVT quy đổi" đã là modal inline. |
| 2026-07-13 | 27 | Business Authority (BA in-session review W05 chuẩn bị) | **Form data table row "Đối tượng" thêm rule radio-inside-dropdown cho "Nhập khác"** (cascade BR-IRV2-025 v33). Trường "Đối tượng" trên form vẫn duy nhất 1 field, nhưng khi Loại phiếu = "Nhập khác" → mở dropdown → popup có radio "Loại đối tượng" (NCC/KH/NV) ở top + search + list; default list rỗng + placeholder; tích radio → list load bảng tương ứng; đổi radio → clear + reload. Form Sửa: radio auto tick theo `object_type` đã lưu. Nhập mua/Nhập trả bán giữ nguyên dropdown mở ra list trực tiếp không radio. Lý do: 3 loại đối tượng lưu ở 3 bảng khác nhau. |
| 2026-07-13 | 28 | Business Authority | **Restore + rewrite Nhóm E / AC-16 auto-create phiếu Nhập từ PO** (file trước bị rollback external về v27, mất nội dung v28-v30 đã apply). Re-apply Nhóm E + AC-16 trigger theo pattern 4 nhóm state (đồng bộ FEAT-ID-CREATE-V2 v25 phía Xuất): (a) Kế thừa từ PO có giá trị: SKU / Tên phụ tùng theo SKU / ĐVT nhập / SL nhập / Đơn giá nhập (nguyên, không convert); (b) Fix cứng / auto-tính: Kho (kho đầu tiên garage) / Thành tiền auto-tính AC-7 / Tổng phiếu auto-tính AC-10; (c) **Để TRỐNG "—"** vì phụ thuộc Mã nội bộ chưa chọn: **Mã SP nội bộ / Tên SP nội bộ / ĐVT chính / SL quy đổi** (4 field TRỐNG — khác Xuất là 5 field vì phiếu Nhập không có cột Tồn khả dụng); (d) Auto-đổ khi user chọn Mã nội bộ: Tên SP nội bộ + ĐVT chính (AC-6) / SL quy đổi (AC-7). Điểm khác phía Xuất: Đơn giá nhập kế thừa PO (không phải = 0) → Thành tiền + Tổng phiếu có giá trị ngay. Note trỏ FEAT-IR-EDIT-V2 cho luồng Sửa Nháp. §5 thêm ref BR-IRV2-033. Trigger áp cả 2 source PO `DIRECT` + `QUOTATION_ASK` khi flag `Inventory:InventoryV2` bật (hard cutover V1→V2). Cascade BR-IRV2-033 v35 + UX-FLOW-INVENTORY-RECEIPT-V2 v11. Follow-up: cascade FEAT-PO-DETAIL + BR-GF-PURCHASE (V1 boundary) — deferred. |
| 2026-07-14 | 29 | Business Authority | **§5 cite BR-IRV2-034 Post-Save nav + concurrent edit** (BA-review 2026-07-14 C2.4 + C2.5 traceability cascade). Rule mô tả trong BR-GF-INVENTORY-RECEIPT-V2 v37 §2.4; FEAT cite explicit để DEV không sót implement pattern nav "Chuyển Chi tiết + toast 3s" + last-write-wins concurrency behavior. |
| 2026-07-14 | 30 | Business Authority | **Sync doc ↔ Figma cross-check W05 (SYS-1 + SYS-2 P0)**: (1) Button labels theo Figma convention — AC-1 "Đóng/Lưu" → **"Huỷ bỏ/Tạo"**; AC-11 title "Lưu phiếu" → **"Tạo phiếu"**, nút "Lưu" → **"Tạo"**; AC-13 title "Đóng form" → **"Huỷ bỏ form"**, nút "Đóng" → **"Huỷ bỏ"** (form CREATE dùng verb "Tạo"; form Sửa dùng "Lưu"). (2) AC-14 attachment whitelist mở rộng: "PDF, JPG, PNG" → **"PDF, JPG, PNG, DOC, XLSX"** (kế toán upload Word/Excel — BR-IRV2-026 v39, ERR-CMN-005 v22). |
| 2026-07-14 | 31 | Business Authority | **Sync doc ↔ Figma cross-check W05 SYS-6 + SYS-11 P1**: (a) Tab casing "CHI TIẾT / ĐÍNH KÈM" → **"Chi tiết / Đính kèm"** (sentence-case Figma convention). (b) Column header cột số lượng "SL nhập" → **"Số lượng nhập"** (full form Figma convention; "SL quy đổi" viết tắt giữ nguyên — cột derived secondary). |
| 2026-07-16 | 32 | Business Authority (in-session BA fix — Figma FEAT-IR-CREATE-V2 W05 canonical) | **Form data table row "Đối tượng" flip radio-inside-dropdown → 2 dropdown song song trên form** (cascade BR-IRV2-025 v43, đối xứng FEAT-ID-CREATE-V2 v31 — align Figma FEAT-IR-CREATE-V2 W05). Trước v27: 1 row "Đối tượng" duy nhất, popup có radio "Loại đối tượng" ẩn ở top. Sau: **thêm row mới "Loại đối tượng"** (⚠️ conditional required — chỉ hiển thị khi Loại phiếu = "Nhập khác"), dropdown top-level cạnh trái "Đối tượng"; single-select NCC/KH/NV; là UI filter widget (FE derive `objectType` gửi BE); + rewrite row "Đối tượng" thành list load theo dropdown "Loại đối tượng" cạnh bên (thay vì radio ẩn trong popup). 2 loại còn lại (Nhập mua / Nhập hàng bán bị trả lại) KHÔNG hiển thị "Loại đối tượng" (derive fix theo Loại phiếu). Backend contract giữ nguyên. Lý do: Figma FEAT-IR-CREATE-V2 W05 vẽ 2 dropdown song song (đối xứng ID), user in-session 2026-07-16 confirm giữ Figma làm canonical UX. |
| 2026-07-16 | 33 | Business Authority (RGR bachho + user sonhoang decisions 2026-07-16) | **RGR RR-003 + RR-010 batch fix** — 2 điểm mơ hồ Product-layer, không đụng Architecture. (1) **RR-003 Bổ sung AC-3e** — kế thừa PO đã nhập một phần: (a) dropdown "Mã đơn hàng" chỉ hiển thị PO có ít nhất 1 dòng còn SL nhập (BFF query gọi input `excludeFullyReceived: true` — đã có sẵn `agg-garage-graph-graphql.md v7.70 §3h searchDirectPurchaseOrders`); (b) Số lượng nhập mặc định mỗi dòng = `maxCount` (BFF `getPurchaseOrderForReceipt.items[].maxCount` — SL còn lại sau các phiếu Nhập trước đã Ghi sổ); (c) real-time cảnh báo đỏ inline + chặn lưu khi user gõ SL vượt `maxCount` (reuse text message AC-3b "Số lượng nhập không được vượt quá số lượng đặt hàng."). AC-3e extend AC-3b — không tách BR mới, share BR-IRV2-010. (2) **RR-010 Clarify AC-4 "Nguồn nhập"** — sửa AC-4 wording mơ hồ "form được điền" (có thể hiểu là user gõ tay) → rewrite explicit "auto-derive từ PO, read-only với user, KHÔNG có input tay / KHÔNG có dropdown chọn". Nhất quán với §2A row "Nguồn nhập" đã ghi "(auto) — kế thừa tự động từ PO khi chọn PO (không chọn tay)". User sonhoang confirm 2026-07-16: "Nguồn nhập gì có điền tay đâu" (verbatim). Trường hợp không chọn PO → hiển thị placeholder "—" (giữ read-only). **KHÔNG đụng** BR/Architecture/API contract (BFF field `maxCount` + input `excludeFullyReceived` đã tồn tại v7.70). v32 → v33. |
