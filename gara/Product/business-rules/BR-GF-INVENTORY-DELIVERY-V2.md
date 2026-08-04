---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 22
tier: T1
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-06-29"
supersedes: "none"
---

# Business Rules — gf-inventory Delivery V2 (Phiếu xuất kho)

> Tập business rules V2 cho `EP-INVENTORY-DELIVERY-V2`. File **mới** (không thay thế `BR-GF-INVENTORY.md` §2.2 BR-ID cũ — baseline giữ nguyên). Dùng chung mô hình tồn/giá/vòng đời phiếu V2 với `BR-GF-INVENTORY-RECEIPT-V2`.

---

## §1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-IDV2-001 | Phiếu xuất kho có thể liên kết phiếu dịch vụ (SO) của `gf-sales` — không bắt buộc. Khi liên kết, đối soát SL/sản phẩm giữa phiếu xuất và SO. | Outbound sync | `gf-sales` | REST |
| CB-IDV2-002 | Ngày chứng từ phiếu rơi vào kỳ kế toán đã đóng → chặn thêm/sửa/xóa/ghi sổ. | Tham chiếu | (kỳ kế toán, cùng boundary) | Kiểm tra trạng thái kỳ |

---

## §2 Rules Registry

### 2.1 Vòng đời & ghi sổ (BR-IDV2-001 .. BR-IDV2-009)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IDV2-001 | Phiếu xuất kho khởi tạo ở trạng thái **"Nháp"**. Số phiếu tự sinh (PX-xxxxx), unique theo garage. | Status Init | FEAT-ID-CREATE-V2 |
| BR-IDV2-002 | Vòng đời: **Nháp → Ghi sổ kho → Bỏ ghi sổ kho** (về Nháp). Không có "Đã hủy" — chỉ Xóa. | Status Transition | FEAT-ID-DETAIL-V2 |
| BR-IDV2-003 | **Ghi sổ kho**: trừ tồn theo **SL quy đổi (ĐVT chính)** cho từng (mã + kho + garage) tại ngày xuất → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)**. | Stock Impact | FEAT-ID-DETAIL-V2 |
| BR-IDV2-004 | **Trước khi ghi sổ, kiểm tra tồn khả dụng**: không cho ghi sổ nếu làm **tồn (mã + kho + garage) < 0 tại bất kỳ thời điểm nào** từ ngày chứng từ trở đi (chặn tồn âm point-in-time). Dòng vượt tồn hiển thị cảnh báo **"Không đủ tồn"** → mã lỗi **`ERR-INV-037`** (ghi sổ làm âm → **`ERR-INV-036`**). *(Phiếu xuất có ngày **trước "Tồn đến ngày" của OB** → tồn tại thời điểm đó = 0 nên **tự bị chặn** theo quy tắc này; không cần rule chặn riêng như phiếu nhập — xem BR-IRV2-030.)* | Core Rule | FEAT-ID-CREATE-V2, FEAT-ID-DETAIL-V2, FEAT-ID-EDIT-V2, FEAT-ID-DELETE |
| BR-IDV2-005 | **Bỏ ghi sổ kho**: cộng tồn lại, đưa phiếu về **"Nháp"** → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)**. | Stock Impact | FEAT-ID-DETAIL-V2 |
| BR-IDV2-006 | Sửa/xóa phiếu **đã Ghi sổ kho** (đổi sản phẩm/SL/ngày/kho/xóa dòng) → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)** — engine tính lại từ (bảng OB + phiếu detail) cho (mã+kho+gara) từ ngày chứng từ bị ảnh hưởng trở đi, kể cả khi lùi ngày. Phiếu **Nháp** sửa/xóa tự do — không gọi engine. | Recompute | FEAT-ID-EDIT-V2, FEAT-ID-DELETE |
| BR-IDV2-007 | Phiếu có ngày chứng từ thuộc **kỳ kế toán đã đóng** → chặn thêm/sửa/xóa/ghi sổ/bỏ ghi sổ → mã lỗi **`ERR-INV-024`**. Kỳ **chưa khóa** → cho sửa/xóa (kể cả phiếu đã Ghi sổ kho — không cần đưa về Nháp). | Lock | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2, FEAT-ID-DELETE, FEAT-ID-DETAIL-V2 |
| BR-IDV2-008 | **Giá vốn xuất = 0** cho tới khi chạy **BQGQ cuối kỳ**; sau khi chạy → cập nhật giá vốn thực vào toàn bộ phiếu xuất trong kỳ (xem PRC). Trên phiếu, đơn giá vốn / tiền vốn / tổng giá trị hiển thị **0** trước khi chạy BQGQ. | Valuation | FEAT-ID-CREATE-V2, FEAT-ID-DETAIL-V2 |
| BR-IDV2-009 | **Đối soát phiếu dịch vụ (SO)**: khi phiếu xuất liên kết SO, đối soát SL/sản phẩm giữa phiếu xuất và SO — nếu lệch, trả **cảnh báo (không chặn)** → mã cảnh báo **`ERR-INV-039`** (warning, vẫn cho ghi sổ). | Reconciliation | FEAT-ID-CREATE-V2, FEAT-ID-DETAIL-V2 |

### 2.2 Thông tin phiếu & phân loại (BR-IDV2-010 .. BR-IDV2-014)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IDV2-010 | Hai trường phân loại riêng: **Nguồn xuất** (Mua ngoài / Nền tảng — kế thừa V1) và **Loại phiếu** (Xuất bán / Xuất trả hàng mua / Xuất sửa chữa / Xuất khác). | Enum | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2, FEAT-ID-LIST-V2 |
| BR-IDV2-011 | **Mã đơn hàng / phiếu dịch vụ (SO) không bắt buộc**. Nếu chọn → kế thừa dữ liệu; không chọn → nhập sản phẩm thủ công. | Validation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-012 | Trường bắt buộc header: **Loại phiếu**, **Đối tượng**, **Kho xuất**, **Số phiếu** (tự sinh), **Ngày xuất kho**, **Trạng thái**. | Validation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-013 | **Kho xuất** chọn ở header → đổ xuống dòng; kho từng dòng vẫn cho chọn lại. Tồn trừ theo **kho của dòng**. | Validation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-014 | **Tồn khả dụng** hiển thị trên từng dòng = tồn hiện tại của (mã + kho + garage) tại thời điểm lập phiếu. | Display | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |

### 2.3 Dòng chi tiết & quy đổi (BR-IDV2-015 .. BR-IDV2-018)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IDV2-015 | Chọn **SKU** (không bắt buộc) → đổ Tên phụ tùng + Mã nội bộ + Tên nội bộ + ĐVT chính. Chọn thẳng **Mã nội bộ** → đổ Tên nội bộ + ĐVT chính. | Auto-fill | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-016 | Mỗi dòng xuất theo **ĐVT xuất**; **SL quy đổi = SL xuất × tỷ lệ quy đổi** (ĐVT xuất → ĐVT chính). **Tồn trừ theo SL quy đổi (ĐVT chính)**. | Calculation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-017 | Mỗi dòng lưu: SKU (tùy chọn), mã nội bộ, ĐVT xuất, SL xuất, SL quy đổi, ĐVT chính, đơn giá vốn (=0 đến khi BQGQ), **tiền vốn = Đơn giá vốn × SL quy đổi** (theo ĐVT chính; =0 đến khi BQGQ), kho, ghi chú. | Data Shape | FEAT-ID-CREATE-V2 |
| BR-IDV2-018 | Tab chi tiết: thanh trên chỉ có nút **"Thêm phụ tùng"**; **xóa dòng = icon ở cột "Thao tác"** trên từng dòng (cả Tạo và Sửa). Không có nút "Xóa dòng" hàng loạt. | Form | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |

### 2.4 In / Export / Audit / Phân quyền / Ẩn-hiện nút (BR-IDV2-019 .. BR-IDV2-031)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-IDV2-019 | **In phiếu** xuất PDF 1 phiếu theo **Mẫu 02-VT** (TT 99/2025/TT-BTC). Cột "Mã số" = **mã sản phẩm nội bộ** (không phải SKU). Khối chữ ký: Người lập phiếu / Người nhận hàng / Thủ kho / Kế toán trưởng / Giám đốc. | Output | FEAT-ID-PRINT |
| BR-IDV2-020 | **Xuất excel** xuất danh sách theo bộ lọc hiện tại — dump đúng các cột đang hiển thị ra `.xlsx` (không cần mẫu riêng). | Output | FEAT-ID-EXPORT |
| BR-IDV2-021 | Danh sách luôn phạm vi theo garage (tenant isolation). Tìm kiếm LIKE theo Số phiếu xuất / Phiếu dịch vụ / Người tạo; lọc theo Loại phiếu / Đối tượng / Trạng thái / Ngày xuất. Hiển thị Tiền vốn. | Tenant Isolation / Search | FEAT-ID-LIST-V2 |
| BR-IDV2-022 | Phiếu hiển thị thông tin audit: Ngày tạo / Người tạo / Ngày sửa / Người sửa. | Audit | FEAT-ID-DETAIL-V2 |
| BR-IDV2-023 | 2 vai trò — chủ garage và kế toán — **quyền ngang nhau** trên toàn bộ phiếu xuất kho. | Permission | (toàn bộ feature) |
| BR-IDV2-024 | **Ẩn/hiện nút theo trạng thái + kỳ**: phiếu **"Nháp"** (kỳ chưa khóa) hiện **Sửa / Xóa / Ghi sổ kho**; phiếu **"Ghi sổ kho"** (kỳ chưa khóa) hiện **Sửa / Xóa / Bỏ ghi sổ kho**. **Kỳ đã khóa → ẩn các nút thao tác (Sửa/Xóa/Ghi sổ/Bỏ ghi sổ)**. **In phiếu / Xuất excel** luôn khả dụng. Nút **"Thêm mới"** không ẩn — chặn khi **Lưu** form Thêm nếu ngày chứng từ thuộc kỳ đã khóa (BR-IDV2-007, `ERR-INV-024`). | UI Behavior | FEAT-ID-DETAIL-V2, FEAT-ID-LIST-V2 |
| BR-IDV2-025 | **Nguồn dữ liệu trường form**: **Đối tượng** (bắt buộc) lọc theo Loại phiếu — **Xuất bán → Khách hàng**; **Xuất trả hàng mua → Nhà cung cấp**; **Xuất sửa chữa → Nhân viên**; **Xuất khác → Nhà cung cấp / Khách hàng / Nhân viên**. **Người phụ trách** mặc định = nhân viên đang đăng nhập, chọn lại từ danh sách nhân sự. **Người giao hàng** nhập tay tự do. **Nguồn xuất** (Mua ngoài/Nền tảng) **kế thừa tự động từ SO** khi chọn SO (không chọn tay). **ĐVT xuất** chọn trong ĐVT chính + các ĐVT quy đổi của mã. **SL xuất > 0** (cho số lẻ), ≤ tồn khả dụng. | Validation / Data Source | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-026 | **Tệp đính kèm**: tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform. Không bắt buộc. | Validation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-027 | Dropdown **"Mã SP nội bộ"** (dòng chi tiết) có mục cuối **"+ Tạo mới mã nội bộ"** → **điều hướng sang màn Tạo mã nội bộ** (`FEAT-CAT-PROD-CREATE`); **cảnh báo rời trang** nếu phiếu có thay đổi chưa lưu. Tạo xong, mã mới (**"Đang hoạt động"**) chọn được vào dòng. **Nếu dòng có SKU chưa mapping mã nội bộ** → form Tạo mã nội bộ mở ra **gắn sẵn SKU đó vào tab "Mã SKU"**; **Mã + Tên sản phẩm nội bộ đều nhập tay**. **SKU đã mapping mã khác** → không gắn sẵn (form trống; 1 SKU chỉ thuộc 1 mã — BR-CAT-PROD-013). Xem `FEAT-CAT-PROD-CREATE` AC-1b. | Form / Navigation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-028 | **Phiếu nguồn "Nền tảng"** (bên bán `gf-sales` đẩy từ **phiếu dịch vụ / SO**) khởi tạo trạng thái **"Nháp"** — dòng có thể **chỉ có mã SKU + tên SKU, chưa có mã nội bộ**; ở **Nháp chưa tác động tồn**. Khi chuyển **"Ghi sổ kho"**: **bắt buộc mọi dòng phải có mã nội bộ**; nếu còn dòng thiếu (chỉ có SKU) → **chặn ghi sổ**, yêu cầu tạo/gắn mã nội bộ → mã lỗi **`ERR-INV-011`**. | Stock Impact / Validation | FEAT-ID-CREATE-V2, FEAT-ID-DETAIL-V2 |
| BR-IDV2-029 | Dropdown **"ĐVT xuất"** (dòng chi tiết, khi đã chọn mã nội bộ) có mục cuối **"+ Thêm ĐVT quy đổi"** → mở **modal inline** (ĐVT quy đổi từ master + Tỷ lệ > 0, số thập phân) **không rời form phiếu**; validate tỷ lệ > 0, **không trùng ĐVT chính / ĐVT quy đổi đã có** (BR-CAT-PROD-011). Lưu → thêm ĐVT vào mã nội bộ + **tự chọn vào dòng**. (Tái dùng `FEAT-CAT-PROD-CREATE` AC-11.) | Form | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-030 | **Kế thừa từ phiếu Nhập mua (loại "Xuất trả hàng mua")**: khi **Loại phiếu = "Xuất trả hàng mua"** → thay trường "Mã đơn hàng (SO)" bằng trường **"Số phiếu nhập"** (dropdown phiếu **Nhập mua** đã ghi sổ của garage) — **KHÔNG bắt buộc**. **Nếu chọn số phiếu nhập** → hệ thống **kế thừa**: (a) **Đối tượng** = Nhà cung cấp của phiếu Nhập mua; (b) **Kho xuất** = kho của phiếu Nhập mua; (c) **toàn bộ dòng chi tiết** (SKU, mã nội bộ, tên, ĐVT, SL, SL quy đổi, kho, **đơn giá/giá vốn kế thừa từ phiếu Nhập mua gốc**) — đổ vào Thông tin chung + tab Chi tiết. **Các dòng kế thừa được SỬA**: đổi **SL**, **đơn giá**, hoặc **xóa dòng** (hỗ trợ trả một phần). **Nếu KHÔNG chọn** → nhập sản phẩm + **SL & đơn giá thủ công** như thường. Giá vốn (kế thừa hoặc nhập tay) là **tiền vốn của phiếu Xuất trả hàng mua** — khoản **giảm-trừ phía nhập** trong BQGQ, **KHÔNG** theo đơn giá BQ kỳ này (BR-PRC-001/005). | Inheritance / Form | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
| BR-IDV2-031 | **Chặn SL trả vượt số đã mua (loại "Xuất trả hàng mua")**: khi **có chọn "Số phiếu nhập"**, **SL xuất trả mỗi dòng (SL quy đổi) ≤ SL đã nhập** của dòng tương ứng trên phiếu Nhập mua nguồn; vượt → **chặn lưu / ghi sổ** → mã lỗi **`ERR-INV-040`**. **Không chọn** phiếu nhập → **không áp** (không có "đã nhập" để đối chiếu). (Đối xứng **BR-IRV2-032**.) | Validation | FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2 |
## §3 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-16 | 17 | Business Authority | Fix (quyết định BA cuối): kỳ đã khóa → ẩn nút Sửa (đảo lại "Sửa vẫn hiện"); làm rõ Thêm mới chặn khi Lưu (BR-IDV2-007). Guard Lưu = phòng vệ. |
| 2026-06-16 | 16 | Business Authority | Đăng ký mã lỗi: đổi bare UPPERCASE_SNAKE → ERR-INV-NNN (ERROR-CODE-REGISTRY §4) cho nhóm Xuất kho V2. |
| 2026-06-16 | 15 | Business Authority | Fix (quyết định BA — ý f): kỳ đã khóa → **KHÔNG ẩn nút "Sửa"** (vẫn mở form được, **chặn khi Lưu** — FEAT-ID-EDIT-V2 AC-2); chỉ ẩn Xóa/Ghi sổ/Bỏ ghi sổ (BR-IDV2-024). Đồng bộ FEAT-ID-DETAIL-V2 AC-4 + EC-2. |
| 2026-06-16 | 14 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng |
| 2026-06-03 | 1 | Business Authority | Khởi tạo BR-GF-INVENTORY-DELIVERY-V2 (file mới) — 25 rule: vòng đời Nháp/Ghi sổ/Bỏ ghi sổ, trừ tồn theo SL quy đổi, check tồn khả dụng (chặn tồn âm point-in-time), giá vốn xuất=0 đến khi BQGQ, đối soát SO (cảnh báo), lock kỳ, xóa phiếu ghi sổ khi kỳ chưa khóa, ẩn/hiện nút, BR-IDV2-025 nguồn trường form (Đối tượng theo loại phiếu, người phụ trách default user, nguồn xuất kế thừa SO, ĐVT từ mã, SL>0), in phiếu Mẫu 02-VT (mã số = mã nội bộ) + xuất excel danh sách kèm chi tiết phụ tùng. |
| 2026-06-03 | 2 | Business Authority | Gắn **mã lỗi** (UPPERCASE_SNAKE): INSUFFICIENT_STOCK, NEGATIVE_STOCK_NOT_ALLOWED, ACCOUNTING_PERIOD_CLOSED; cảnh báo SERVICE_ORDER_MISMATCH (warning, không chặn). |
| 2026-06-10 | 3 | Business Authority | Gỡ nhắc **"Import dòng"** khỏi BR-IDV2-018 (V1 vốn không có chức năng này; tab chi tiết chỉ Thêm phụ tùng + xóa per-dòng). |
| 2026-06-10 | 4 | Business Authority | Thêm **BR-IDV2-027**: dropdown "Mã SP nội bộ" có "+ Tạo mới mã nội bộ" → điều hướng `FEAT-CAT-PROD-CREATE` (cảnh báo rời trang nếu chưa lưu). |
| 2026-06-10 | 5 | Business Authority | BR-IDV2-027: bổ sung điều kiện — nếu dòng **đã có SKU** → pre-fill mã + tên SKU vào form Tạo mã nội bộ (FEAT-CAT-PROD-CREATE AC-1b). |
| 2026-06-10 | 6 | Business Authority | **Sửa BR-IDV2-027**: chỉ **gắn sẵn SKU vào tab Mã SKU**, **Mã + Tên nội bộ đều nhập tay**; SKU **đã mapping mã khác** → không gắn sẵn. |
| 2026-06-10 | 7 | Business Authority | Thêm **BR-IDV2-028**: phiếu Nền tảng (**bán `gf-sales` đẩy từ SO/phiếu dịch vụ**) khởi tạo **Nháp** (chưa tác động tồn, dòng có thể chỉ có SKU); **Ghi sổ kho bắt buộc mọi dòng có mã nội bộ** → thiếu thì chặn (`INTERNAL_PRODUCT_REQUIRED`). Đối xứng BR-IRV2-028 nhưng nguồn = bán/SO (không phải mua). |
| 2026-06-10 | 8 | Business Authority | Thêm **BR-IDV2-029**: "+ Thêm ĐVT quy đổi" trong dropdown ĐVT xuất → modal inline thêm ĐVT quy đổi cho mã nội bộ (validate tỷ lệ>0, không trùng) + tự chọn vào dòng. |
| 2026-06-15 | 9 | Business Authority | Theo quyết định BA: **KHÔNG** thêm rule chặn riêng cho phiếu xuất trước OB — xuất trước "Tồn đến ngày" OB tồn = 0 nên tự bị chặn bởi **tồn âm / quá số dư** (BR-IDV2-004); chỉ phiếu **nhập** cần rule riêng (BR-IRV2-030, vì nhập không gây tồn âm). Bổ sung ghi chú vào BR-IDV2-004; sửa heading §2.4 đếm đúng (..029). |
| 2026-06-15 | 10 | Business Authority | Đổi nhãn cột **"giá vốn" → "tiền vốn"** ở BR-IDV2-008 (cột hiển thị), BR-IDV2-017 (data shape), BR-IDV2-021 (LIST) — đồng bộ "Tiền vốn". Giữ "đơn giá vốn" và khái niệm "giá vốn xuất". |
| 2026-06-15 | 11 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (BR-IDV2-006). |
| 2026-06-15 | 12 | Business Authority | Rà lỗ hổng (Nhóm C-7): BR-IDV2-017 ghi rõ **công thức "tiền vốn = Đơn giá vốn × SL quy đổi"** (theo ĐVT chính) — trước đây chỉ liệt kê trường, thiếu công thức. |
| 2026-06-16 | 13 | Business Authority | Fix: bổ sung FEAT-ID-DELETE vào mapping BR-IDV2-004 (cột Features) — đồng bộ với FEAT-ID-DELETE §5 viện dẫn BR-IDV2-004 (chặn tồn âm point-in-time). |
| 2026-06-16 | 18 | Business Authority | Gỡ con trỏ intro tới `Plan/INVENTORY-V2-RULES.md` §7.1 (note file sắp xóa) → đổi sang `BR-GF-INVENTORY-RECEIPT-V2`. |
| 2026-06-16 | 19 | Business Authority | Thêm **BR-IDV2-030** (cơ chế kế thừa phía xuất, đối xứng BR-IRV2-031): loại "Xuất trả hàng mua" → trường **"Số phiếu nhập"** (thay "Mã đơn hàng SO"); chọn phiếu Nhập mua → kế thừa **Đối tượng** (NCC) + **Kho xuất** + **toàn bộ Detail** (kèm **đơn giá/giá vốn kế thừa từ phiếu Nhập mua gốc**); dòng kế thừa **sửa được** (SL/đơn giá/xóa dòng — trả một phần); **KHÔNG bắt buộc chọn — không chọn → nhập SL & đơn giá tay**. Giá vốn = khoản giảm-trừ phía nhập trong BQGQ (BR-PRC-001/005). Heading §2.4 → ..030. |
| 2026-06-16 | 20 | Business Authority | Thêm **BR-IDV2-031**: khi có chọn "Số phiếu nhập" → **SL xuất trả ≤ SL đã nhập** của dòng tương ứng; vượt → chặn lưu/ghi sổ → `ERR-INV-040`. Không chọn → không áp. Đối xứng BR-IRV2-032. Heading §2.4 → ..031. |
| 2026-07-02 | 22 | Business Authority | **BR-IDV2-003 + BR-IDV2-005**: thêm ref **"gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)"** — centralize cascade logic, tất cả write-path gọi chung 1 engine. |
| 2026-06-29 | 21 | Business Authority | **Bump BR-IDV2-026 dung lượng tệp đính kèm 10 MB → 30 MB** (BA chốt rà soát toàn Inventory V2: kế toán cần upload PDF chứng từ + ảnh chất lượng cao). Đồng bộ với W03 Catalog (BR-CAT-PROD-015 v16) + W05 Receipt V2 (BR-IRV2-026 v25) — toàn Inventory V2 nhất quán 30 MB. Định dạng PDF/JPG/PNG + cap 5 tệp + mã lỗi `ERR-CMN-004/005` giữ nguyên. Đồng bộ FEAT-ID-CREATE-V2 + FEAT-ID-EDIT-V2 + ERROR-CODE-REGISTRY (registry follow-up CR dual-owner BA + Architect). |