---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 19
tier: T1
owner_authority: Business Authority + Architect
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
supersedes: "none"
---

# Business Rules — gf-inventory Catalog (Mã sản phẩm nội bộ & Nhóm vật tư hàng hóa)

> Tập business rules cho danh mục vật tư kho V2 (`EP-INVENTORY-CATALOG`). File **mới**, không thay thế `BR-GF-INVENTORY.md` (rule nhập/xuất/tồn kho hiện hành giữ nguyên). Phục vụ làm nền tảng dữ liệu cho các epic kho V2 khác.
>
> Domain sở hữu: **Nhóm vật tư hàng hóa** (phân loại sản phẩm, phân cấp đa tầng) + **Mã sản phẩm nội bộ** (mã chuẩn tính tồn, mapping SKU, ĐVT quy đổi).

---

## §1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-CAT-001 | Mã sản phẩm nội bộ + nhóm vật tư hàng hóa được gf-inventory sở hữu và sử dụng làm dữ liệu nền cho phiếu nhập/xuất kho, tồn đầu kỳ, tính giá và báo cáo tồn (cùng boundary). | Nội bộ | `gf-inventory` | Trực tiếp trong boundary |
| CB-CAT-002 | ĐVT chính và ĐVT quy đổi của mã sản phẩm nội bộ tham chiếu **danh mục đơn vị tính (master) sẵn có**. Không nhập tự do — chỉ chọn từ danh mục. | Tham chiếu | Danh mục ĐVT master | Read-only lookup |
| CB-CAT-003 | Mã SKU gắn vào mã sản phẩm nội bộ lấy từ **danh mục SKU sẵn có** của hệ thống. Việc gắn tạo mapping giữa SKU và mã nội bộ, không tạo/sửa/xóa bản ghi SKU gốc. | Tham chiếu | Danh mục SKU sẵn có | Mapping (bảng trung gian) |

---

## §2 Rules Registry

### 2.1 Nhóm vật tư hàng hóa (BR-CAT-GRP-001 .. BR-CAT-GRP-013)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CAT-GRP-001 | Nhóm vật tư hàng hóa khởi tạo ở trạng thái **"Đang hoạt động"**. | Status Init | FEAT-CAT-GRP-CREATE |
| BR-CAT-GRP-002 | Mã nhóm VTHH do người dùng nhập tay, **chỉ chấp nhận**: chữ cái Latin không dấu (`A-Z`, `a-z`), chữ số (`0-9`), dấu gạch ngang (`-`), dấu gạch dưới (`_`), dấu chấm (`.`), dấu gạch chéo (`/`), dấu ngoặc đơn (`(` `)`), khoảng trắng ở giữa. **Auto trim** khoảng trắng đầu + cuối. **Tối đa 50 ký tự** (sau trim). Ký tự ngoài whitelist (bao gồm tiếng Việt có dấu, `~ ! @ # $ % ^ & *`, emoji) → mã lỗi **`ERR-INV-001`**. | Validation | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-003 | Mã nhóm VTHH **unique theo từng garage** (tenant). Trùng mã → mã lỗi **`ERR-INV-002`** ("Mã nhóm đã tồn tại"). | Uniqueness | FEAT-CAT-GRP-CREATE |
| BR-CAT-GRP-004 | Mã nhóm VTHH **không được chỉnh sửa** sau khi tạo. | Immutability | FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-005 | Nhóm VTHH có cấu trúc **phân cấp đa tầng** (cha–con, không giới hạn số cấp) thông qua trường **"Thuộc nhóm"**. Nhóm gốc không có nhóm cha. | Hierarchy | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT, FEAT-CAT-GRP-LIST |
| BR-CAT-GRP-006 | Trạng thái nhóm có 2 giá trị: **"Đang hoạt động"** / **"Ngừng hoạt động"**. | Enum | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT, FEAT-CAT-GRP-LIST |
| BR-CAT-GRP-007 | Khi nhóm **cha** chuyển sang **"Ngừng hoạt động"**, hệ thống **tự động** cập nhật toàn bộ nhóm con (mọi cấp dưới) sang **"Ngừng hoạt động"**. | Cascade Status | FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-008 | Nhóm ở trạng thái **"Ngừng hoạt động"** không cho phép gắn vào mã sản phẩm nội bộ mới (ẩn khỏi dropdown chọn nhóm ở form tạo/sửa mã sản phẩm). | Status Guard | FEAT-CAT-GRP-EDIT, FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |
| BR-CAT-GRP-009 | Khi chỉnh sửa, trường **"Thuộc nhóm"** có thể đặt là **bất kỳ nhóm nào khác** trong cây — kể cả nhóm ở cấp cha hay nhóm con thuộc một nhánh khác. **Chỉ không cho phép** chuyển nhóm vào **chính nó** hoặc vào bất kỳ **nhóm con / hậu duệ** của nó (tránh vòng lặp phân cấp). Vi phạm → mã lỗi **`ERR-INV-003`**. | Validation | FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-010 | Nhóm **đã phát sinh mã sản phẩm nội bộ** (có mã sản phẩm gắn vào) **không được xóa** → mã lỗi **`ERR-INV-004`**. | Delete Guard | FEAT-CAT-GRP-DELETE |
| BR-CAT-GRP-011 | Nhóm **cha còn nhóm con** không được xóa — phải xóa hết toàn bộ nhóm con trước → mã lỗi **`ERR-INV-005`**. | Delete Guard | FEAT-CAT-GRP-DELETE |
| BR-CAT-GRP-012 | Trường **"Mô tả"** giới hạn tối đa **255 ký tự** → vượt: mã lỗi **`ERR-INV-016`**. | Validation | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-013 | Danh mục nhóm VTHH luôn được phạm vi theo garage hiện tại (tenant isolation) — không hiển thị nhóm của garage khác. Tìm kiếm áp dụng dạng LIKE trên mã nhóm và tên nhóm. | Tenant Isolation / Search | FEAT-CAT-GRP-LIST |

### 2.2 Mã sản phẩm nội bộ (BR-CAT-PROD-001 .. BR-CAT-PROD-025)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CAT-PROD-001 | Mã sản phẩm nội bộ khởi tạo ở trạng thái **"Đang hoạt động"**. | Status Init | FEAT-CAT-PROD-CREATE |
| BR-CAT-PROD-002 | Mã sản phẩm nội bộ do người dùng nhập tay, **chỉ chấp nhận**: chữ cái Latin không dấu (`A-Z`, `a-z`), chữ số (`0-9`), dấu gạch ngang (`-`), dấu gạch dưới (`_`), dấu chấm (`.`), dấu gạch chéo (`/`), dấu ngoặc đơn (`(` `)`), khoảng trắng ở giữa. **Auto trim** khoảng trắng đầu + cuối. **Tối đa 50 ký tự** (sau trim). Ký tự ngoài whitelist (bao gồm tiếng Việt có dấu, `~ ! @ # $ % ^ & *`, emoji) → mã lỗi **`ERR-INV-006`**. | Validation | FEAT-CAT-PROD-CREATE |
| BR-CAT-PROD-003 | Mã sản phẩm nội bộ **unique theo từng garage** (tenant) — mỗi garage có một danh mục mã riêng. Trùng mã → mã lỗi **`ERR-INV-007`** ("Mã nội bộ đã tồn tại"). | Uniqueness | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-004 | Mã sản phẩm nội bộ **không được chỉnh sửa** sau khi tạo. | Immutability | FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-005 | Trường bắt buộc khi tạo: **Mã sản phẩm nội bộ**, **Tên sản phẩm**, **ĐVT chính**. Các trường còn lại không bắt buộc. | Validation | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-006 | **ĐVT chính** chọn từ danh mục đơn vị tính (master) sẵn có. ĐVT chính **không được sửa** khi mã sản phẩm đã phát sinh giao dịch (đã dùng trong phiếu nhập/xuất kho). | Validation / Immutability | FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-007 | Trạng thái mã sản phẩm có 2 giá trị: **"Đang hoạt động"** / **"Ngừng hoạt động"**. | Enum | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT, FEAT-CAT-PROD-LIST |
| BR-CAT-PROD-008 | Mã sản phẩm ở trạng thái **"Ngừng hoạt động"** không cho phép sử dụng trong phiếu nhập kho / xuất kho mới. | Status Guard | FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-009 | Dropdown **"Nhóm vật tư/hàng hóa"** ở form tạo/sửa chỉ hiển thị nhóm **"Đang hoạt động"** — ẩn nhóm "Ngừng hoạt động". | Status Guard | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-010 | **Phương pháp tính giá** có 4 giá trị: **Bình quân cuối kỳ**, **Đích danh**, **Nhập trước xuất trước**, **Bình quân tức thời**. Hiện tại mặc định **"Bình quân cuối kỳ"** và **không cho phép sửa** (set per mã sản phẩm, dành cho mở rộng tương lai). | Enum / Default | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-011 | **ĐVT quy đổi**: mỗi dòng gồm ĐVT (chọn từ danh mục master) + tỷ lệ quy đổi về ĐVT chính. Tỷ lệ quy đổi **> 0** (mã lỗi **`ERR-INV-013`**), **cho phép số thập phân tối đa 6 chữ số sau dấu phẩy** (mã lỗi **`ERR-INV-047`** khi vượt quá), và **không trùng ĐVT** trong cùng một mã sản phẩm (mã lỗi **`ERR-INV-014`**). | Validation | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL, FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-012 | ĐVT quy đổi **đã phát sinh giao dịch** không được sửa hoặc xóa. | Immutability | FEAT-CAT-PROD-DETAIL, FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-013 | Mã SKU gắn vào lấy từ danh mục SKU sẵn có. Một mã sản phẩm nội bộ gắn được **nhiều** SKU. Một SKU **đã gắn** một mã nội bộ thì **không gắn sang mã nội bộ khác** (một SKU thuộc tối đa một mã nội bộ) → mã lỗi **`ERR-INV-015`**. | Mapping | FEAT-CAT-PROD-DETAIL |
| BR-CAT-PROD-014 | **Bỏ gắn SKU** chỉ xóa mapping giữa SKU và mã nội bộ (bảng trung gian), **không xóa** bản ghi SKU gốc. | Mapping | FEAT-CAT-PROD-DETAIL |
| BR-CAT-PROD-015 | **Tệp đính kèm**: tối đa **5 tệp**, mỗi tệp **≤ 30 MB** (mã lỗi `ERR-CMN-004`), định dạng **PDF, JPG, PNG** (mã lỗi `ERR-CMN-005`) — theo chuẩn upload file toàn platform. Ảnh sản phẩm hỗ trợ `jpg, png`. | Validation | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |
| BR-CAT-PROD-016 | Mã sản phẩm **đã phát sinh dữ liệu sử dụng** (đã có trong phiếu nhập/xuất kho hoặc đã có tồn kho) **không được xóa** → mã lỗi **`ERR-INV-008`**. Mã chỉ mới gắn SKU hoặc khai ĐVT quy đổi (chưa giao dịch) vẫn được xóa — khi xóa thì gỡ luôn mapping SKU và ĐVT quy đổi liên quan. | Delete Guard | FEAT-CAT-PROD-DELETE |
| BR-CAT-PROD-017 | **Import** chỉ cho phép **thêm mới** (không cập nhật). Mã trùng → đánh dấu dòng lỗi mã lỗi **`ERR-INV-007`** ("Mã nội bộ đã tồn tại") và bỏ qua. Import chỉ ghi nhóm trường **"Thông tin chung"** (không gồm SKU, ĐVT quy đổi, ảnh, tệp đính kèm). Bắt buộc đi qua bước kiểm tra dữ liệu (preview lỗi/hợp lệ) trước khi ghi. File template định dạng `.xlsx`. Template import **không có cột "phương pháp tính giá"** — mọi mã nhập đều nhận mặc định **"Bình quân cuối kỳ"** (theo **BR-CAT-PROD-010**, trường đang khóa); cột này chỉ còn ở template export (**BR-CAT-PROD-018**). | Import | FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-018 | **Export** xuất danh mục theo bộ lọc hiện tại, gồm các cột: mã nội bộ, tên sản phẩm, ĐVT, **phương pháp tính giá**, thương hiệu, xuất xứ, tính chất, nhóm vật tư/hàng hóa, quy cách sản phẩm, thông số kỹ thuật, **trạng thái** — tức **các cột template import cộng thêm 2 cột chỉ có ở export**: **"phương pháp tính giá"** và **"trạng thái"** (giá trị "Đang hoạt động"/"Ngừng hoạt động" theo BR-CAT-PROD-007). Định dạng `.xlsx`. | Export | FEAT-CAT-PROD-EXPORT |
| BR-CAT-PROD-019 | **Tính chất** sản phẩm có **4 giá trị cố định** (system-seeded, chỉ chọn từ dropdown — không tự thêm): **Vật tư hàng hóa**, **CCDC** (Công cụ dụng cụ), **Dịch vụ**, **Khác**. Trường **không bắt buộc**; **mặc định khi tạo mới = "Vật tư hàng hóa"**. Giá trị nằm ngoài tập này (gồm cả khi import) → mã lỗi **`ERR-INV-012`**. | Enum / Default | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT, FEAT-CAT-PROD-LIST, FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-020 | **Import giới hạn 500 dòng/lần**: mỗi lần import file `.xlsx` chỉ xử lý tối đa **500 dòng dữ liệu**. File vượt quá → toàn bộ lần import bị từ chối ngay ở bước kiểm tra (không ghi dòng nào) với mã lỗi **`ERR-INV-041`** ("Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần"). Giới hạn áp dụng ở cả tầng kiểm tra (verify-import) lẫn tầng ghi (import). | Validation | FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-021 | **Import — validate ĐVT**: giá trị cột ĐVT trong file phải **khớp một mã đơn vị tính trong danh mục master** (gf-erp-mdm). Không khớp → đánh dấu dòng **"Lỗi"** mã **`ERR-INV-042`**, không ghi dòng đó. | Validation | FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-022 | **Import — validate nhóm VTHH**: giá trị cột "nhóm vật tư/hàng hóa" trong file phải **tồn tại trong danh mục nhóm của garage và đang "Đang hoạt động"** (đồng bộ BR-CAT-PROD-009). Không tồn tại hoặc đang "Ngừng hoạt động" → đánh dấu dòng **"Lỗi"** mã **`ERR-INV-043`**, không ghi dòng đó. Trường nhóm **không bắt buộc** — bỏ trống thì hợp lệ (mã không gắn nhóm). | Validation | FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-023 | **Xuất xứ** chọn từ **danh mục xuất xứ master** sẵn có — **không nhập tự do**. Trường **không bắt buộc**. Khi import: xuất xứ (nếu có) phải khớp danh mục → không khớp: đánh dấu dòng **"Lỗi"** mã **`ERR-INV-044`**, không ghi dòng đó. **Thương hiệu** = **nhập tay (free-text)** — không ràng buộc danh mục, không validate khi import. | Validation / Master Lookup | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT, FEAT-CAT-PROD-IMPORT |
| BR-CAT-PROD-024 | **Export giới hạn 1.000 dòng/lần xuất**: mỗi lần nhấn **"Xuất file"**, hệ thống đếm số mã sản phẩm khớp bộ lọc hiện tại trước khi sinh file. Nếu **> 1.000 dòng** → **không sinh file**, hiển thị cảnh báo mã **`ERR-INV-045`** ("Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại") để người dùng thu hẹp phạm vi bằng các bộ lọc sẵn có (trạng thái / tính chất / nhóm vật tư/hàng hóa / từ khóa). Nếu **≤ 1.000 dòng** → xuất bình thường theo BR-CAT-PROD-018. Giới hạn áp dụng ở tầng API (count trước khi build `.xlsx`) để tránh timeout / OOM. | Validation | FEAT-CAT-PROD-EXPORT |
| BR-CAT-PROD-025 | **Mô tả** và **Ghi chú** của mã sản phẩm nội bộ giới hạn tối đa **500 ký tự / trường** (đếm theo ký tự, không byte). Vượt → mã lỗi **`ERR-INV-046`** ("Mô tả / Ghi chú vượt quá 500 ký tự"), highlight ô vi phạm, không cho lưu. Áp dụng cả lúc tạo mới + chỉnh sửa. Trường **không bắt buộc** — bỏ trống vẫn hợp lệ. | Validation | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |

### 2.3 Audit & Phân quyền (BR-CAT-CMN-002 .. BR-CAT-CMN-003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CAT-CMN-002 | Danh mục (cả GRP và PROD) hiển thị thông tin audit: ngày tạo / người tạo / ngày sửa / người sửa. | Audit | FEAT-CAT-GRP-DETAIL, FEAT-CAT-PROD-DETAIL |
| BR-CAT-CMN-003 | Hệ thống có 2 vai trò — **chủ garage** và **kế toán** — với **quyền ngang nhau** trên toàn bộ danh mục (xem / tạo / sửa / xóa / import / export / gắn SKU / khai ĐVT quy đổi). | Permission | (toàn bộ feature trong epic) |

## §3 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo BR-GF-INVENTORY-CATALOG (file mới, no V1) — 13 rule Nhóm VTHH (BR-CAT-GRP), 18 rule Mã SP nội bộ (BR-CAT-PROD), 3 rule lịch sử/phân quyền (BR-CAT-CMN), 3 cross-boundary (CB-CAT). Phục vụ EP-INVENTORY-CATALOG. |
| 2026-06-03 | 2 | Business Authority | Gắn **mã lỗi** (UPPERCASE_SNAKE, theo chuẩn GraphQL `extensions.code`/downstream code) vào các rule lỗi nghiệp vụ: MATERIAL_GROUP_CODE_INVALID/DUPLICATED, MATERIAL_GROUP_CIRCULAR_REFERENCE/HAS_PRODUCTS/HAS_CHILDREN, INTERNAL_PRODUCT_CODE_INVALID/DUPLICATED, CONVERSION_RATE_INVALID/CONVERSION_UNIT_DUPLICATED, SKU_ALREADY_MAPPED, INTERNAL_PRODUCT_IN_USE, ATTACHMENT_LIMIT_EXCEEDED/TYPE_INVALID, DESCRIPTION_MAX_LENGTH_EXCEEDED. |
| 2026-06-16 | 3 | Business Authority | Theo quyết định BA: thêm **BR-CAT-PROD-019** khai enum trường **"Tính chất"** — 4 giá trị cố định (Vật tư hàng hóa, CCDC, Dịch vụ, Khác), system-seeded, mặc định "Vật tư hàng hóa", mã lỗi `PRODUCT_NATURE_INVALID`. Cập nhật heading §2.2 (..018 → ..019). Đồng bộ FEAT-CAT-PROD-CREATE AC-4 + FEAT-CAT-PROD-LIST AC-5. Lấp lỗ hổng enum "Tính chất" chưa định nghĩa. |
| 2026-06-16 | 4 | Business Authority | Theo quyết định BA: làm rõ **BR-CAT-PROD-017** — cột "phương pháp tính giá" trong template import **bị bỏ qua**, mọi mã import luôn nhận "Bình quân cuối kỳ" (khớp BR-CAT-PROD-010 đang khóa). Gỡ mâu thuẫn template-có-cột vs field-bị-khóa. Đồng bộ FEAT-CAT-PROD-IMPORT AC-2. |
| 2026-06-16 | 5 | Business Authority | Theo quyết định BA: thống nhất tên cột template **"nhóm sản phẩm" → "nhóm vật tư/hàng hóa"** (BR-CAT-PROD-018) cho khớp tên thực thể dùng ở CREATE/EDIT/DETAIL/LIST/BR-009. Đồng bộ FEAT-CAT-PROD-IMPORT/EXPORT. |
| 2026-06-16 | 6 | Business Authority | Fix (quyết định BA): tệp đính kèm tuân platform ≤10MB + PDF/JPG/PNG (ERR-CMN-004/005), bỏ ≤30MB/5-định-dạng |
| 2026-06-16 | 7 | Business Authority | Đăng ký mã lỗi: đổi mã bare UPPERCASE_SNAKE → ERR-INV-NNN (theo ERROR-CODE-REGISTRY §4) cho nhóm Catalog. |
| 2026-06-16 | 8 | Business Authority | **Bỏ hẳn lịch sử mã nội bộ** (chốt BA): xóa **BR-CAT-CMN-001** (lưu lịch sử thao tác); đổi heading §2.3 "Lịch sử & Phân quyền" → "Audit & Phân quyền" (BR-CAT-CMN-002..003, để gap 001 không tái dùng). Đồng bộ FEAT-CAT-PROD-DETAIL (bỏ tab Lịch sử) + EDIT + EP + UX. |
| 2026-06-24 | 9 | Business Authority | Theo quyết định BA: **bỏ cột "phương pháp tính giá" khỏi template import** — sửa **BR-CAT-PROD-017** (template import không còn cột này; mọi mã vẫn default "Bình quân cuối kỳ" per BR-CAT-PROD-010). **Giữ cột ở export**: gỡ coupling "cột giống template import" ở **BR-CAT-PROD-018** → liệt kê cột tường minh (= cột import + "phương pháp tính giá", chỉ có ở export). Đồng bộ FEAT-CAT-PROD-IMPORT v5 + FEAT-CAT-PROD-EXPORT. |
| 2026-06-24 | 10 | Business Authority + Architect | **Chốt BR-CAT-PROD-020** (giải xung đột domain `ERR-INV-019` — gap A1): cap **500 dòng/lần import** vốn được ADR-018/PKG-W03 gán đại mã `ERR-INV-019` (đã thuộc BR-OB-010 Opening Balance) với rule "proposed BR-CAT-PROD-020". Nay chính thức hóa BR-CAT-PROD-020 + cấp mã mới **`ERR-INV-041`** (ERROR-CODE-REGISTRY v12). Cập nhật heading §2.2 (..019 → ..020). Đồng bộ FEAT-CAT-PROD-IMPORT, ADR-018, gf-inventory-api, agg-garage-graph-graphql, PKG-W03. |
| 2026-06-24 | 12 | Business Authority | **Thêm 3 rule validate import + xuất xứ master lookup** (BA chốt khi rà soát wave 3): **BR-CAT-PROD-021** (import validate ĐVT khớp master → `ERR-INV-042`), **BR-CAT-PROD-022** (import validate nhóm VTHH tồn tại + đang hoạt động → `ERR-INV-043`), **BR-CAT-PROD-023** (**Xuất xứ** = lookup danh mục master, KHÔNG nhập tự do; import không khớp → `ERR-INV-044`; **Thương hiệu** = nhập tay free-text, không validate). Heading §2.2 (..020 → ..023). Đồng bộ ERROR-CODE-REGISTRY v13 + FEAT-CAT-PROD-IMPORT/CREATE/EDIT. |
| 2026-06-24 | 11 | Business Authority | **BR-CAT-PROD-018 thêm cột "trạng thái" vào export** (BA chốt khi đối chiếu file mẫu thực tế `cat-prod-export-template.xlsx`): export nay = cột template import **+ "phương pháp tính giá" + "trạng thái"** (giá trị "Đang hoạt động"/"Ngừng hoạt động" per BR-CAT-PROD-007). Template import KHÔNG có 2 cột này. Đồng bộ FEAT-CAT-PROD-EXPORT v5. |
| 2026-06-25 | 13 | Business Authority | **Thêm BR-CAT-PROD-024 — cap 1.000 dòng/lần export** (BA chốt để phòng timeout/OOM): mỗi lần nhấn "Xuất file" hệ thống đếm số mã khớp filter trước; >1.000 → chặn xuất + cảnh báo mã mới **`ERR-INV-045`** ("Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc thu hẹp phạm vi rồi xuất lại"); ≤1.000 → xuất bình thường theo BR-CAT-PROD-018. Heading §2.2 (..023 → ..024). Đồng bộ FEAT-CAT-PROD-EXPORT v8 + ERROR-CODE-REGISTRY v14. |
| 2026-06-25 | 14 | Business Authority | **Thêm BR-CAT-PROD-025 — giới hạn 500 ký tự cho Mô tả + Ghi chú** (BA chốt khi rà soát form tạo/sửa mã SP nội bộ): mỗi trường ≤ 500 ký tự, vượt → mã lỗi mới **`ERR-INV-046`** highlight ô + không cho lưu; trường vẫn không bắt buộc. Heading §2.2 (..024 → ..025). Đồng bộ FEAT-CAT-PROD-CREATE v9 + FEAT-CAT-PROD-EDIT v7 + ERROR-CODE-REGISTRY v15. |
| 2026-06-26 | 15 | Business Authority | **Giới hạn precision tỷ lệ quy đổi — BR-CAT-PROD-011 thêm constraint ≤ 6 chữ số thập phân** (BA chốt để chuẩn hoá precision lưu trữ + nhập liệu): rule mở rộng "cho phép số thập phân" → "**cho phép số thập phân tối đa 6 chữ số sau dấu phẩy**", vượt giới hạn → mã lỗi mới **`ERR-INV-047`** ("Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy"). Constraint `> 0` (ERR-INV-013) + non-trùng ĐVT (ERR-INV-014) giữ nguyên. Áp dụng cho modal "Thêm ĐVT quy đổi" tại catalog + modal inline trên phiếu nhập/xuất V2 (BR tái dùng qua FEAT-CAT-PROD-CREATE AC-11). Đồng bộ FEAT-CAT-PROD-CREATE v10 + FEAT-CAT-PROD-DETAIL v8 + FEAT-CAT-PROD-EDIT v8 + FEAT-IR-CREATE-V2 v19 + FEAT-ID-CREATE-V2 v14 + UX-FLOW-INVENTORY-CATALOG v9 + ERROR-CODE-REGISTRY v16. |
