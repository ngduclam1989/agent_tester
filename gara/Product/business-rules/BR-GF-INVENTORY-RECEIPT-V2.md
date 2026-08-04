---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 26
tier: T1
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
supersedes: "none"
---

# Business Rules — gf-inventory Receipt V2 (Phiếu nhập kho)

> Tập business rules V2 cho `EP-INVENTORY-RECEIPT-V2`. File **mới** (không thay thế `BR-GF-INVENTORY.md` §2.1 BR-IR cũ — bản gốc giữ làm baseline). Áp mô hình tồn/giá/vòng đời phiếu V2 (dùng chung với `BR-GF-INVENTORY-DELIVERY-V2` + `BR-GF-INVENTORY-STOCK-V2`).
>
> **Quy ước chặn tồn âm chung** cho cả nhập + xuất; rule chiều tồn dùng chung với DELIVERY-V2.
>

---

## §1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-IRV2-001 | Phiếu nhập kho có thể kế thừa dữ liệu từ đơn hàng mua (PO) của `gf-purchase` — không bắt buộc. | Outbound sync | `gf-purchase` | REST |
| CB-IRV2-002 | Ngày chứng từ phiếu rơi vào kỳ kế toán (danh mục AP) đã đóng → chặn thêm/sửa/xóa. | Tham chiếu | (kỳ kế toán, cùng boundary) | Kiểm tra trạng thái kỳ |

---

## §2 Rules Registry

### 2.1 Vòng đời & ghi sổ (BR-IRV2-001 .. BR-IRV2-008)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IRV2-001 | Phiếu nhập kho khởi tạo ở trạng thái **"Nháp"**. Mã phiếu (Số phiếu) tự sinh, unique theo garage. | Status Init | FEAT-IR-CREATE-V2 |
| BR-IRV2-002 | Vòng đời: **Nháp → Ghi sổ kho → Bỏ ghi sổ kho** (về Nháp). **Không có trạng thái "Đã hủy"** — chỉ có Xóa. | Status Transition | FEAT-IR-DETAIL-V2 |
| BR-IRV2-003 | **Ghi sổ kho**: cộng tồn theo **SL quy đổi (ĐVT chính)** cho từng (mã nội bộ + kho + garage) tại ngày nhập → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)**. | Stock Impact | FEAT-IR-DETAIL-V2 |
| BR-IRV2-004 | **Bỏ ghi sổ kho**: trừ tồn đã cộng, đưa phiếu về **"Nháp"** để chỉnh sửa → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)** (bao gồm re-check tồn âm point-in-time: nếu việc gỡ tồn làm tồn lũy kế < 0 ở bất kỳ thời điểm nào về sau → **chặn bỏ ghi sổ** `ERR-INV-036`). | Stock Impact | FEAT-IR-DETAIL-V2 |
| BR-IRV2-005 | Phiếu **"Nháp"** chưa tác động tồn. Cho sửa/xóa tự do (trừ ràng buộc kỳ khóa). | Status Guard | FEAT-IR-EDIT-V2, FEAT-IR-DELETE |
| BR-IRV2-006 | Sửa/xóa phiếu **đã Ghi sổ kho** (đổi sản phẩm/SL/ngày/kho/xóa dòng) → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)** — engine tính lại từ (bảng OB + phiếu detail) cho (mã+kho+gara) từ ngày chứng từ bị ảnh hưởng trở đi, kể cả khi lùi ngày. Phiếu **Nháp** sửa/xóa tự do — không gọi engine (BR-IRV2-005). | Recompute | FEAT-IR-EDIT-V2, FEAT-IR-DELETE |
| BR-IRV2-007 | Phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng** → chặn thêm/sửa/xóa/ghi sổ/bỏ ghi sổ → mã lỗi **`ERR-INV-024`** ("kỳ đã khóa"). | Lock | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2, FEAT-IR-DELETE, FEAT-IR-DETAIL-V2 |
| BR-IRV2-008 | **CHẶN TỒN ÂM**: khi thêm/sửa/ghi sổ/**bỏ ghi sổ**/xóa làm thay đổi biến động tại ngày D của (mã + kho + garage), **tồn lũy kế tại mọi thời điểm từ D trở đi phải ≥ 0**; nếu bất kỳ thời điểm nào < 0 → chặn (check point-in-time theo ngày chứng từ, không chỉ tồn hiện tại) → mã lỗi **`ERR-INV-036`**. | Core Rule | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2, FEAT-IR-DELETE, FEAT-IR-DETAIL-V2 |

### 2.2 Thông tin phiếu & phân loại (BR-IRV2-009 .. BR-IRV2-013)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IRV2-009 | Hai trường phân loại riêng: **Nguồn nhập** (Mua ngoài / Nền tảng) và **Loại phiếu** (Nhập mua / Nhập hàng bán bị trả lại / Nhập khác). | Enum | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2, FEAT-IR-LIST-V2 |
| BR-IRV2-010 | **Mã đơn hàng (PO) không bắt buộc** ở cả 2 loại phiếu. Nếu chọn PO → kế thừa dữ liệu từ đơn hàng; không chọn → nhập sản phẩm thủ công. **Khi đã gắn PO**: SL nhập mỗi dòng phải **≤ SL đặt hàng** (còn lại) của dòng tương ứng, vượt → chặn ("Số lượng nhập không được vượt quá số lượng đặt hàng"). V2 chỉ bỏ *bắt buộc chọn PO*, **không bỏ** validate này. | Validation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-011 | Trường bắt buộc header: **Loại phiếu**, **Đối tượng**, **Kho nhập**, **Số phiếu** (tự sinh), **Ngày nhập kho**, **Trạng thái**. Mã lô hàng, Người giao hàng, Diễn giải không bắt buộc. | Validation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-012 | **Kho nhập** chọn ở header → đổ xuống các dòng chi tiết; **kho từng dòng vẫn cho chọn lại** kho khác. Tồn nhóm theo **kho của dòng**. | Validation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-013 | Tổng giá trị phiếu = Σ thành tiền các dòng (= Σ SL nhập × đơn giá nhập). | Calculation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |

### 2.3 Dòng chi tiết & quy đổi (BR-IRV2-014 .. BR-IRV2-018)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IRV2-014 | Chọn **SKU** (không bắt buộc) → đổ: Tên phụ tùng (theo SKU) + Mã nội bộ + Tên nội bộ + ĐVT chính. Chọn thẳng **Mã nội bộ** (không qua SKU) → đổ: Tên SP nội bộ + ĐVT chính. | Auto-fill | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-015 | Mỗi dòng nhập theo **ĐVT nhập**; **SL quy đổi = SL nhập × tỷ lệ quy đổi** (ĐVT nhập → ĐVT chính). **Tồn cộng theo SL quy đổi (ĐVT chính)**. | Calculation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-016 | Mỗi dòng lưu: SKU (tùy chọn), mã nội bộ, ĐVT nhập, SL nhập, SL quy đổi, ĐVT chính, đơn giá nhập, thành tiền (giá trị nhập), kho, ghi chú. | Data Shape | FEAT-IR-CREATE-V2 |
| BR-IRV2-017 | **Chiều tính tồn (hiện tại)** = (Mã nội bộ + Kho + Garage). `[MỞ RỘNG TƯƠNG LAI]`: + Tài khoản kho + Lô & ngày nhập (FIFO/đích danh). | Stock Dimension | (toàn bộ) |
| BR-IRV2-018 | Tab chi tiết: thanh trên chỉ có nút **"Thêm phụ tùng"**; **xóa dòng = icon ở cột "Thao tác"** trên từng dòng (cả Tạo và Sửa). Không có nút "Xóa dòng" hàng loạt. | Form | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |

### 2.4 In / Export / Audit / Phân quyền / Form / Guard (BR-IRV2-019 .. BR-IRV2-032)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IRV2-019 | **In phiếu** xuất PDF 1 phiếu theo **Mẫu 01-VT** (TT 99/2025/TT-BTC). Cột "Mã số" = **mã sản phẩm nội bộ** (không phải SKU). Khối chữ ký: Người lập phiếu / Người giao hàng / Thủ kho / Kế toán trưởng. | Output | FEAT-IR-PRINT |
| BR-IRV2-020 | **Xuất excel** xuất danh sách phiếu theo bộ lọc hiện tại — dump đúng các cột đang hiển thị ra `.xlsx` (không cần mẫu riêng). | Output | FEAT-IR-EXPORT |
| BR-IRV2-021 | Danh sách phiếu nhập kho luôn phạm vi theo garage hiện tại (tenant isolation). Tìm kiếm LIKE theo Số phiếu / Số đơn hàng / Người tạo; lọc theo Nguồn nhập / Loại phiếu / Đối tượng / Trạng thái / Ngày nhập. Hiển thị dòng Tổng (Thành tiền). | Tenant Isolation / Search | FEAT-IR-LIST-V2 |
| BR-IRV2-022 | Phiếu hiển thị thông tin audit: Ngày tạo / Người tạo / Ngày sửa / Người sửa. | Audit | FEAT-IR-DETAIL-V2 |
| BR-IRV2-023 | Hệ thống có 2 vai trò — chủ garage và kế toán — **quyền ngang nhau** trên toàn bộ phiếu nhập kho. | Permission | (toàn bộ feature) |
| BR-IRV2-024 | **Ẩn/hiện nút theo trạng thái + kỳ**: phiếu **"Nháp"** (kỳ chưa khóa) hiện **Sửa / Xóa / Ghi sổ kho**; phiếu **"Ghi sổ kho"** (kỳ chưa khóa) hiện **Sửa / Xóa / Bỏ ghi sổ kho**. Khi ngày chứng từ thuộc **kỳ đã khóa** → **ẩn các nút thao tác (Sửa/Xóa/Ghi sổ/Bỏ ghi sổ)**. Nút **"Thêm mới"** không ẩn — chặn khi **Lưu** form Thêm nếu ngày chứng từ thuộc kỳ đã khóa (BR-IRV2-007, `ERR-INV-024`). **In phiếu** và **Xuất excel** **luôn khả dụng** không phụ thuộc trạng thái hay kỳ. | UI Behavior | FEAT-IR-DETAIL-V2, FEAT-IR-LIST-V2 |
| BR-IRV2-025 | **Nguồn dữ liệu trường form**: **Đối tượng** (bắt buộc) lọc theo Loại phiếu — **Nhập mua → Nhà cung cấp**; **Nhập hàng bán bị trả lại → Khách hàng**; **Nhập khác → Nhà cung cấp / Khách hàng / Nhân viên**. **Người phụ trách** mặc định = nhân viên đang đăng nhập, chọn lại từ danh sách nhân sự. **Người giao hàng** nhập tay tự do. **Nguồn nhập** (Mua ngoài/Nền tảng) **kế thừa tự động từ PO** khi chọn PO (không chọn tay). **ĐVT nhập** chọn trong ĐVT chính + các ĐVT quy đổi của mã. **SL nhập > 0** (cho số lẻ), **Đơn giá nhập ≥ 0** (cho số lẻ). | Validation / Data Source | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-026 | **Tệp đính kèm**: tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform. Không bắt buộc. | Validation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-027 | Dropdown **"Mã SP nội bộ"** (dòng chi tiết) có mục cuối **"+ Tạo mới mã nội bộ"** → **điều hướng sang màn Tạo mã nội bộ** (`FEAT-CAT-PROD-CREATE`); **cảnh báo rời trang** nếu phiếu có thay đổi chưa lưu. Tạo xong, mã mới (**"Đang hoạt động"**) chọn được vào dòng. **Nếu dòng có SKU chưa mapping mã nội bộ** (điển hình phiếu "Nền tảng" mua đẩy sang — chỉ có SKU) → form Tạo mã nội bộ mở ra **gắn sẵn SKU đó vào tab "Mã SKU"**; **Mã + Tên sản phẩm nội bộ đều nhập tay**. **SKU đã mapping mã khác** → không gắn sẵn (form trống; 1 SKU chỉ thuộc 1 mã — BR-CAT-PROD-013). Xem `FEAT-CAT-PROD-CREATE` AC-1b. | Form / Navigation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-028 | **Phiếu nguồn "Nền tảng"** (bên mua `gf-purchase` đẩy sang) khởi tạo trạng thái **"Nháp"** — dòng có thể **chỉ có mã SKU + tên SKU, chưa có mã nội bộ**; ở **Nháp chưa tác động tồn**. Khi chuyển **"Ghi sổ kho"**: **bắt buộc mọi dòng phải có mã nội bộ**; nếu còn dòng thiếu (chỉ có SKU) → **chặn ghi sổ**, yêu cầu tạo/gắn mã nội bộ → mã lỗi **`ERR-INV-011`**. | Stock Impact / Validation | FEAT-IR-CREATE-V2, FEAT-IR-DETAIL-V2 |
| BR-IRV2-029 | Dropdown **"ĐVT nhập"** (dòng chi tiết, khi đã chọn mã nội bộ) có mục cuối **"+ Thêm ĐVT quy đổi"** → mở **modal inline** (ĐVT quy đổi từ master + Tỷ lệ > 0, số thập phân) **không rời form phiếu**; validate tỷ lệ > 0, **không trùng ĐVT chính / ĐVT quy đổi đã có** (BR-CAT-PROD-011). Lưu → thêm ĐVT vào mã nội bộ + **tự chọn vào dòng**. (Tái dùng `FEAT-CAT-PROD-CREATE` AC-11.) | Form | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-030 | **Chặn phiếu nhập trước tồn đầu kỳ**: không cho lưu / ghi sổ phiếu nhập có **ngày chứng từ ≤ "Tồn đến ngày" của tồn đầu kỳ (OB)** của cùng **(mã + kho + garage)** → mã lỗi **`ERR-INV-038`**. **Ngày = "Tồn đến ngày" cũng bị chặn** (phiếu phải có ngày **sau** OB — chủ ý tránh đếm trùng). Áp cả khi **đổi ngày lùi** về trước OB. (OB duy nhất theo (mã+kho) — BR-OB-012; đối xứng **BR-OB-016**.) | Validation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-031 | **Phiếu xuất bán nguồn (loại "Nhập hàng bán bị trả lại")**: khi **Loại phiếu = "Nhập hàng bán bị trả lại"** → hiện trường **"Phiếu xuất bán"** (dropdown phiếu Xuất bán đã ghi sổ của garage) — **KHÔNG bắt buộc**. **Nếu chọn** → hệ thống **kế thừa**: (a) **Đối tượng** = Khách hàng của phiếu Xuất bán đó (đổ vào Thông tin chung); (b) **các dòng chi tiết phụ tùng** (SKU, mã nội bộ, tên, ĐVT, SL, SL quy đổi, kho và **đơn giá/giá vốn kế thừa từ phiếu Xuất bán gốc**) đổ vào tab Chi tiết. **Các dòng kế thừa được SỬA** (giảm/đổi SL — hỗ trợ **trả một phần**; đơn giá vốn kế thừa giữ theo **đơn vị** → tiền vốn = đơn giá vốn kế thừa × SL điều chỉnh). **Nếu KHÔNG chọn** → nhập sản phẩm thủ công. **Mỗi dòng chi tiết có checkbox "Tự nhập giá"** điều khiển nguồn đơn giá: **KHÔNG tích** → đơn giá **để hệ thống cập nhật** (kế thừa giá vốn từ phiếu Xuất bán gốc, do lần chạy **BQGQ** ghi vào — BR-PRC-017); **tích** → người dùng **nhập đơn giá tay**, BQGQ **KHÔNG cập nhật** dòng đó. Giá trị nhập của phiếu (kế thừa hoặc tay) dùng cho BQGQ — **KHÔNG** tính lại theo đơn giá BQ kỳ này (BR-PRC-001/005). | Inheritance / Form | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |
| BR-IRV2-032 | **Chặn SL trả vượt số đã bán (loại "Nhập hàng bán bị trả lại")**: khi **có chọn "Phiếu xuất bán"**, **SL nhập trả mỗi dòng (SL quy đổi) ≤ SL đã xuất** của dòng tương ứng trên phiếu Xuất bán nguồn; vượt → **chặn lưu / ghi sổ** → mã lỗi **`ERR-INV-040`**. **Không chọn** phiếu xuất bán → **không áp** (không có "đã xuất" để đối chiếu). (Đối xứng **BR-IDV2-031**; tương tự ràng buộc SL theo PO — BR-IRV2-010.) | Validation | FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2 |

## §3 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-16 | 19 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IRV2-007). Guard Lưu = phòng vệ. |
| 2026-06-16 | 18 | Business Authority | Đăng ký mã lỗi: đổi bare UPPERCASE_SNAKE → ERR-INV-NNN (ERROR-CODE-REGISTRY §4) cho nhóm Nhập kho V2. |
| 2026-06-16 | 17 | Business Authority | Fix (quyết định BA — ý f): kỳ đã khóa → **KHÔNG ẩn nút "Sửa"** nữa (vẫn mở form được, **chặn khi Lưu** — FEAT-IR-EDIT-V2 AC-2); chỉ ẩn Xóa/Ghi sổ/Bỏ ghi sổ (BR-IRV2-024). Đồng bộ FEAT-IR-DETAIL-V2 AC-4. |
| 2026-06-16 | 16 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng |
| 2026-06-03 | 1 | Business Authority | Khởi tạo BR-GF-INVENTORY-RECEIPT-V2 (file mới) — 25 rule: vòng đời Nháp/Ghi sổ/Bỏ ghi sổ, chặn tồn âm point-in-time, lock kỳ kế toán, SKU+mã nội bộ auto-fill, ĐVT quy đổi→tồn ĐVT chính, kho theo dòng, tính lại tồn, in phiếu Mẫu 01-VT (mã số = mã nội bộ) + xuất excel danh sách kèm chi tiết phụ tùng, BR-IRV2-024 ẩn/hiện nút, BR-IRV2-025 nguồn trường form (Đối tượng theo loại phiếu, người phụ trách default user, nguồn nhập kế thừa PO, ĐVT từ mã, SL>0/đơn giá≥0). |
| 2026-06-03 | 2 | Business Authority | Gắn **mã lỗi** (UPPERCASE_SNAKE): BR-IRV2-007 → ACCOUNTING_PERIOD_CLOSED; BR-IRV2-008 → NEGATIVE_STOCK_NOT_ALLOWED. |
| 2026-06-10 | 3 | Business Authority | Thêm §0 Δ Thay đổi so với V1 — bảng map 25 rule V2 ↔ rule BR-IR-* V1 trong BR-GF-INVENTORY.md, gắn loại [GIỮ]/[ĐỔI]/[MỚI]. |
| 2026-06-10 | 4 | Business Authority | Thêm dòng **Loại thay đổi: CR** ở intro (tailor cho BR — tập rule V2 phát triển từ nhóm BR-IR-* production; giữ nguyên §0 Δ, không thêm callout "đọc màn"). |
| 2026-06-10 | 5 | Business Authority | **Đính chính BR-IRV2-010**: làm rõ V2 chỉ bỏ *bắt buộc chọn PO*, **vẫn giữ** validate SL nhập ≤ SL đặt hàng khi đã gắn PO. Cập nhật §0 Δ tương ứng. |
| 2026-06-10 | 6 | Business Authority | Gỡ nhắc **"Import dòng"** khỏi BR-IRV2-018 + §0 Δ. BR-IRV2-018 hạ [ĐỔI]→**[GIỮ]**. |
| 2026-06-10 | 7 | Business Authority | Thêm **BR-IRV2-027**: dropdown "Mã SP nội bộ" có "+ Tạo mới mã nội bộ" → điều hướng `FEAT-CAT-PROD-CREATE` (cảnh báo rời trang nếu chưa lưu). [ĐỔI ← V1 EC-1 "tạo nhanh sản phẩm"]. Cập nhật §0 Δ. |
| 2026-06-10 | 8 | Business Authority | BR-IRV2-027: bổ sung điều kiện — nếu dòng **đã có SKU** → pre-fill mã + tên SKU vào form Tạo mã nội bộ (FEAT-CAT-PROD-CREATE AC-1b). |
| 2026-06-10 | 9 | Business Authority | **Sửa BR-IRV2-027** theo bối cảnh phiếu Nền tảng: chỉ **gắn sẵn SKU vào tab Mã SKU**, **Mã + Tên nội bộ đều nhập tay**; SKU **đã mapping mã khác** → không gắn sẵn. |
| 2026-06-10 | 10 | Business Authority | Thêm **BR-IRV2-028**: phiếu Nền tảng (mua đẩy) khởi tạo **Nháp** (chưa tác động tồn, dòng có thể chỉ có SKU); **Ghi sổ kho bắt buộc mọi dòng có mã nội bộ** → thiếu thì chặn (`INTERNAL_PRODUCT_REQUIRED`). |
| 2026-06-10 | 11 | Business Authority | Thêm **BR-IRV2-029**: "+ Thêm ĐVT quy đổi" trong dropdown ĐVT nhập → modal inline thêm ĐVT quy đổi cho mã nội bộ (validate tỷ lệ>0, không trùng — BR-CAT-PROD-011) + tự chọn vào dòng. Cập nhật §0 Δ. |
| 2026-06-10 | 12 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-15 | 13 | Business Authority | Theo quyết định BA: thêm **BR-IRV2-030** — chặn phiếu nhập có ngày chứng từ ≤ "Tồn đến ngày" của OB cùng (mã+kho) → `TRANSACTION_BEFORE_OPENING_BALANCE` (đối xứng BR-OB-016). Cập nhật heading §2.4 (..030). |
| 2026-06-15 | 14 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (BR-IRV2-006). |
| 2026-06-15 | 15 | Business Authority | Rà lỗ hổng (Nhóm B): **BR-IRV2-030** thêm **"+ garage"** (6b) + ghi rõ ngày = "Tồn đến ngày" cũng chặn (6d) + tham chiếu OB duy nhất (BR-OB-012). |
| 2026-06-16 | 20 | Business Authority | Gỡ con trỏ intro tới `Plan/INVENTORY-V2-RULES.md` §7.1 (note file sắp xóa) → đổi sang `BR-GF-INVENTORY-DELIVERY-V2` + `BR-GF-INVENTORY-STOCK-V2`. |
| 2026-06-16 | 21 | Business Authority | Fix M6 (chốt BA): bổ sung **"bỏ ghi sổ"** vào guard chặn tồn âm — **BR-IRV2-008** thêm "bỏ ghi sổ" vào danh sách thao tác; **BR-IRV2-004** thêm re-check tồn âm point-in-time (bỏ ghi sổ nhập làm tồn<0 về sau → chặn `ERR-INV-036`). Phủ đủ mọi thao tác → BR-PRC-007 "tồn âm không xảy ra" đứng vững. (Bỏ ghi sổ XUẤT cộng tồn lại → không gây âm, không cần guard.) |
| 2026-06-16 | 22 | Business Authority | Thêm **BR-IRV2-031** (phiếu xuất bán nguồn, loại "Nhập hàng bán bị trả lại"): hiện trường **"Phiếu xuất bán"** — **KHÔNG bắt buộc**. Chọn → kế thừa **Đối tượng** (Khách hàng) + **dòng chi tiết phụ tùng** (kèm **đơn giá/giá vốn kế thừa từ phiếu Xuất bán gốc**); **không chọn → nhập đơn giá tay**. Dòng kế thừa **sửa được** (giảm/đổi SL — trả một phần; tiền vốn = đơn giá vốn kế thừa × SL điều chỉnh). Dù kế thừa hay nhập tay, giá trị nhập của phiếu dùng cho BQGQ (không tính lại theo đơn giá BQ; BR-PRC-001/005). Cập nhật heading §2.4 → ..031. |
| 2026-06-16 | 23 | Business Authority | **Checkbox "Tự nhập giá" (dòng chi tiết)** điều khiển nguồn đơn giá phiếu "Nhập hàng bán bị trả lại": **không tích** → đơn giá để hệ thống cập nhật (kế thừa giá vốn từ Xuất bán, do BQGQ ghi); **tích** → nhập đơn giá tay. Thay điều kiện cũ "đơn giá=0". Đồng bộ FEAT-IR-CREATE-V2 + BR-PRC-017/001. |
| 2026-06-16 | 24 | Business Authority | Thêm **BR-IRV2-032**: khi có chọn "Phiếu xuất bán" → **SL nhập trả ≤ SL đã xuất** của dòng tương ứng; vượt → chặn lưu/ghi sổ → `ERR-INV-040`. Không chọn → không áp. Đối xứng BR-IDV2-031. Heading §2.4 → ..032. |
| 2026-07-02 | 26 | Business Authority | **BR-IRV2-003 + BR-IRV2-004**: thêm ref **"gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)"** — centralize cascade logic, tất cả write-path gọi chung 1 engine. |
| 2026-06-29 | 25 | Business Authority | **Bump BR-IRV2-026 dung lượng tệp đính kèm 10 MB → 30 MB** (BA chốt rà soát toàn Inventory V2: kế toán cần upload PDF chứng từ + ảnh chất lượng cao). Đồng bộ với W03 Catalog (BR-CAT-PROD-015 v16) + W05 Delivery V2 (BR-IDV2-026) — toàn Inventory V2 nhất quán 30 MB. Định dạng PDF/JPG/PNG + cap 5 tệp + mã lỗi `ERR-CMN-004/005` giữ nguyên. Đồng bộ FEAT-IR-CREATE-V2 + FEAT-IR-EDIT-V2 + ERROR-CODE-REGISTRY (registry follow-up CR dual-owner BA + Architect). |
