---
type: execution-spec
artifact_kind: business-rule
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W03"
last_reviewed: "2026-06-29"
source_ref: "Product/business-rules/BR-GF-INVENTORY-CATALOG.md"
source_version: 18
source_sha: "9114d75a5d418382f9ce2d3b738bba5a557cf7f1a3b4b46518e4b3f80d2e3334"
generated_at: "2026-06-29T00:00:00Z"
boundary: "gf-inventory"
applies_to_feats:
  - FEAT-CAT-GRP-LIST
  - FEAT-CAT-GRP-CREATE
  - FEAT-CAT-GRP-DETAIL
  - FEAT-CAT-GRP-EDIT
  - FEAT-CAT-GRP-DELETE
  - FEAT-CAT-PROD-LIST
  - FEAT-CAT-PROD-CREATE
  - FEAT-CAT-PROD-DETAIL
  - FEAT-CAT-PROD-EDIT
  - FEAT-CAT-PROD-DELETE
  - FEAT-CAT-PROD-IMPORT
  - FEAT-CAT-PROD-EXPORT
parent_pkg: "PKG-W03-inventory-catalog"
---

# BR-GF-INVENTORY-CATALOG — Wave W03 Scoped Spec

> **Phạm vi**: Toàn bộ 12 feature của EP-INVENTORY-CATALOG — 5 GRP + 7 PROD.
> Rule text §1 là **VERBATIM copy** từ nguồn canonical (v18, SHA trên). Policy `mode=business-rule` §2 modes-extra.
> Boundary primary: `gf-inventory` (per-boundary BR).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` |
| Source version | 18 |
| Source SHA | `9114d75a5d418382f9ce2d3b738bba5a557cf7f1a3b4b46518e4b3f80d2e3334` |
| Generated at | 2026-06-29T00:00:00Z |
| PKG | `PKG-W03-inventory-catalog` |

---

## §1 Rule Statements (VERBATIM — toàn bộ W03 scope)

> Toàn bộ rule trong nguồn áp dụng cho EP-INVENTORY-CATALOG = W03 scope. Không filter out rule nào.

### 1.1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-CAT-001 | Mã sản phẩm nội bộ + nhóm vật tư hàng hóa được gf-inventory sở hữu và sử dụng làm dữ liệu nền cho phiếu nhập/xuất kho, tồn đầu kỳ, tính giá và báo cáo tồn (cùng boundary). | Nội bộ | `gf-inventory` | Trực tiếp trong boundary |
| CB-CAT-002 | ĐVT chính và ĐVT quy đổi của mã sản phẩm nội bộ tham chiếu **danh mục đơn vị tính (master) sẵn có**. Không nhập tự do — chỉ chọn từ danh mục. | Tham chiếu | Danh mục ĐVT master | Read-only lookup |
| CB-CAT-003 | Mã SKU gắn vào mã sản phẩm nội bộ lấy từ **danh mục SKU sẵn có** của hệ thống. Việc gắn tạo mapping giữa SKU và mã nội bộ, không tạo/sửa/xóa bản ghi SKU gốc. | Tham chiếu | Danh mục SKU sẵn có | Mapping (bảng trung gian) |

### 1.2 Nhóm vật tư hàng hóa (BR-CAT-GRP-001 .. BR-CAT-GRP-013)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CAT-GRP-001 | Nhóm vật tư hàng hóa khởi tạo ở trạng thái **"Đang hoạt động"**. | Status Init | FEAT-CAT-GRP-CREATE |
| BR-CAT-GRP-002 | Mã nhóm VTHH do người dùng nhập tay, **không chứa ký tự đặc biệt** (`~ ! @ # $ % ^ & *`). Vi phạm → mã lỗi **`ERR-INV-001`**. | Validation | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-003 | Mã nhóm VTHH **unique theo từng garage** (tenant). Trùng mã → mã lỗi **`ERR-INV-002`** ("Mã nhóm đã tồn tại"). | Uniqueness | FEAT-CAT-GRP-CREATE |
| BR-CAT-GRP-004 | Mã nhóm VTHH **không được chỉnh sửa** sau khi tạo. | Immutability | FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-005 | Nhóm VTHH có cấu trúc **phân cấp đa tầng** (cha–con, không giới hạn số cấp) thông qua trường **"Thuộc nhóm"**. Nhóm gốc không có nhóm cha. | Hierarchy | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT, FEAT-CAT-GRP-LIST |
| BR-CAT-GRP-006 | Trạng thái nhóm có 2 giá trị: **"Đang hoạt động"** / **"Ngừng hoạt động"**. | Enum | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT, FEAT-CAT-GRP-LIST |
| BR-CAT-GRP-007 | Khi nhóm **cha** chuyển sang **"Ngừng hoạt động"**, hệ thống **tự động** cập nhật toàn bộ nhóm con (mọi cấp dưới) sang **"Ngừng hoạt động"**. | Cascade Status | FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-008 | Nhóm ở trạng thái **"Ngừng hoạt động"** không cho phép gắn vào mã sản phẩm nội bộ mới (ẩn khỏi dropdown chọn nhóm ở form tạo/sửa mã sản phẩm) **+ ẩn khỏi dropdown "Thuộc nhóm" ở form tạo/sửa nhóm VTHH** (cấm chọn nhóm Ngừng hoạt động làm nhóm cha cho nhóm mới hoặc khi chuyển nhóm cha). | Status Guard | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT, FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT |
| BR-CAT-GRP-009 | Khi chỉnh sửa, trường **"Thuộc nhóm"** có thể đặt là **bất kỳ nhóm nào khác** trong cây — kể cả nhóm ở cấp cha hay nhóm con thuộc một nhánh khác. **Chỉ không cho phép** chuyển nhóm vào **chính nó** hoặc vào bất kỳ **nhóm con / hậu duệ** của nó (tránh vòng lặp phân cấp). Vi phạm → mã lỗi **`ERR-INV-003`**. | Validation | FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-010 | Nhóm **đã phát sinh mã sản phẩm nội bộ** (có mã sản phẩm gắn vào) **không được xóa** → mã lỗi **`ERR-INV-004`**. | Delete Guard | FEAT-CAT-GRP-DELETE |
| BR-CAT-GRP-011 | Nhóm **cha còn nhóm con** không được xóa — phải xóa hết toàn bộ nhóm con trước → mã lỗi **`ERR-INV-005`**. | Delete Guard | FEAT-CAT-GRP-DELETE |
| BR-CAT-GRP-012 | Trường **"Mô tả"** giới hạn tối đa **255 ký tự** → vượt: mã lỗi **`ERR-INV-016`**. | Validation | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-EDIT |
| BR-CAT-GRP-013 | Danh mục nhóm VTHH luôn được phạm vi theo garage hiện tại (tenant isolation) — không hiển thị nhóm của garage khác. Tìm kiếm áp dụng dạng LIKE trên mã nhóm và tên nhóm. | Tenant Isolation / Search | FEAT-CAT-GRP-LIST |

### 1.3 Mã sản phẩm nội bộ (BR-CAT-PROD-001 .. BR-CAT-PROD-025)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CAT-PROD-001 | Mã sản phẩm nội bộ khởi tạo ở trạng thái **"Đang hoạt động"**. | Status Init | FEAT-CAT-PROD-CREATE |
| BR-CAT-PROD-002 | Mã sản phẩm nội bộ do người dùng nhập tay, **không chứa ký tự đặc biệt** (`~ ! @ # $ % ^ & *`). Vi phạm → mã lỗi **`ERR-INV-006`**. | Validation | FEAT-CAT-PROD-CREATE |
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

### 1.4 Audit & Phân quyền (BR-CAT-CMN-002 .. BR-CAT-CMN-003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CAT-CMN-002 | Danh mục (cả GRP và PROD) hiển thị thông tin audit: ngày tạo / người tạo / ngày sửa / người sửa. | Audit | FEAT-CAT-GRP-DETAIL, FEAT-CAT-PROD-DETAIL |
| BR-CAT-CMN-003 | Hệ thống có 2 vai trò — **chủ garage** và **kế toán** — với **quyền ngang nhau** trên toàn bộ danh mục (xem / tạo / sửa / xóa / import / export / gắn SKU / khai ĐVT quy đổi). | Permission | (toàn bộ feature trong epic) |

---

## §2 Rationale (VERBATIM — trích header + preamble nguồn)

> Trích nguyên văn từ header + preamble nguồn canonical.

Tập business rules cho danh mục vật tư kho V2 (`EP-INVENTORY-CATALOG`). File **mới**, không thay thế `BR-GF-INVENTORY.md` (rule nhập/xuất/tồn kho hiện hành giữ nguyên). Phục vụ làm nền tảng dữ liệu cho các epic kho V2 khác.

Domain sở hữu: **Nhóm vật tư hàng hóa** (phân loại sản phẩm, phân cấp đa tầng) + **Mã sản phẩm nội bộ** (mã chuẩn tính tồn, mapping SKU, ĐVT quy đổi).

---

## §3 Enforcement Layer

### 3.1 Tổng quan phân lớp

| Layer | Vai trò | Rules chính |
|---|---|---|
| Domain (`gf-inventory` — `app/service`) | PRIMARY — enforce tất cả BR (CORNERSTONE per domain SSOT), cascade logic, immutability guards, cross-entity validation | Tất cả BR-CAT-GRP-*/BR-CAT-PROD-*/CB-CAT-* |
| REST adapter (`adapter/controller`) | Secondary — validate đầu vào trước khi vào domain; map lỗi thành HTTP response | BR-CAT-GRP-002/003/009/012, BR-CAT-PROD-002/003/005/006/011/013/020/021/022/023/025 |
| DB-level (Flyway schema) | Hard constraint — unique index, FK scalar | unique `(tenant_id, code)` per table, `conversion_rate` type |
| BFF (`agg-garage-graph`) | Defense-in-depth — cap 500-row import, 1000-row export, 1000-node tree | BR-CAT-PROD-020, BR-CAT-PROD-024, BR-CAT-GRP-005 |
| UI (garage-web / garage-mobile) | Secondary — dropdown filter ACTIVE-only, immutable field display, error display | BR-CAT-GRP-006/008, BR-CAT-PROD-007/008/009/010 |

### 3.2 Chi tiết enforcement per nhóm rule

#### Nhóm vật tư hàng hóa

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-CAT-GRP-001 | Domain `MaterialGroupService.create()` | `status = ACTIVE` set unconditionally tại CREATE; không nhận `status` từ request khi tạo. |
| BR-CAT-GRP-002 | REST adapter + DB | Regex validate `code` không chứa `[~!@#$%^&*]` trước INSERT; trả HTTP 422 `ERR-INV-001`. |
| BR-CAT-GRP-003 | Domain + DB | Unique constraint `(tenant_id, code)` trên bảng `material_group`; service-layer pre-check + DB constraint backup; trả `ERR-INV-002`. |
| BR-CAT-GRP-004 | Domain / REST adapter | `PUT /api/v2/material-groups/{id}` KHÔNG chấp nhận field `code` trong body — ignore hoặc reject 422 nếu gửi. |
| BR-CAT-GRP-005 | Domain / DB | `parent_id` UUID FK scalar (ADR-009 — KHÔNG `@ManyToOne`); nhóm gốc `parent_id = NULL`; recursive CTE để query cây. |
| BR-CAT-GRP-006 | Domain / REST adapter | Enum `MaterialGroupStatus {ACTIVE, INACTIVE}` — request chứa giá trị ngoài enum → 422 validation error. |
| BR-CAT-GRP-007 | Domain | `MaterialGroupService.update()`: khi `status` thay đổi sang `INACTIVE` → `WITH RECURSIVE descendants` CTE → batch `UPDATE material_group SET status=INACTIVE WHERE id IN (...)` trong 1 `@Transactional`. |
| BR-CAT-GRP-008 | Domain (V2-4/V2-5 parentId validation) + API (V2-7 search filter) | V2-4 CREATE: validate `parentId` phải ACTIVE trước khi INSERT; V2-5 UPDATE: validate new `parentId` ACTIVE; V2-1 search result bao gồm cả INACTIVE (list all) — dropdown filter ACTIVE-only là responsibility của FE/BFF query param. |
| BR-CAT-GRP-009 | Domain | Circular check: BFS/DFS xuống cây hậu duệ của node hiện tại trước khi update `parent_id`; nếu `newParentId ∈ descendants(currentId)` → reject `ERR-INV-003`. |
| BR-CAT-GRP-010 | Domain | `DELETE /api/v2/material-groups/{id}`: COUNT `internal_product WHERE material_group_id = id` > 0 → reject `ERR-INV-004`. |
| BR-CAT-GRP-011 | Domain | `DELETE /api/v2/material-groups/{id}`: COUNT `material_group WHERE parent_id = id` > 0 → reject `ERR-INV-005`. |
| BR-CAT-GRP-012 | REST adapter | `description.length ≤ 255` validate tại adapter trước domain; trả `ERR-INV-016`. |
| BR-CAT-GRP-013 | Domain | Mọi query scope `WHERE tenant_id = TenantContext.getCurrentTenantId()`; keyword search `WHERE code LIKE '%{q}%' OR name LIKE '%{q}%'`. |

#### Mã sản phẩm nội bộ

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-CAT-PROD-001 | Domain | `status = ACTIVE` set tại CREATE; không nhận từ request. |
| BR-CAT-PROD-002 | REST adapter + DB | Regex validate `code` không chứa `[~!@#$%^&*]`; trả `ERR-INV-006`. |
| BR-CAT-PROD-003 | Domain + DB | Unique constraint `(tenant_id, code)` trên `internal_product`; trả `ERR-INV-007`. |
| BR-CAT-PROD-004 | REST adapter | `PUT /api/v2/internal-products/{id}` KHÔNG chấp nhận field `code`. |
| BR-CAT-PROD-005 | REST adapter | `@NotBlank` trên `code`, `name`, `mainUnitCode` trong request DTO. |
| BR-CAT-PROD-006 | Domain | `InternalProductService.update()`: nếu `mainUnitCode` thay đổi → check `hasTransactions(id)` (query phiếu nhập/xuất) → reject nếu true; ĐVT chính immutable sau giao dịch đầu tiên. |
| BR-CAT-PROD-007 | Domain / REST | Enum `InternalProductStatus {ACTIVE, INACTIVE}`; giá trị ngoài enum → 422. |
| BR-CAT-PROD-008 | Domain (downstream — receipt/delivery V2) | Mã INACTIVE → phiếu nhập/xuất kho service reject khi reference mã; W03 scope catalog — enforcement là downstream contracts. |
| BR-CAT-PROD-009 | API (V2-4/V2-5/V2-10/V2-11) | `materialGroupId` trong request phải tham chiếu nhóm tồn tại + `status=ACTIVE`; reject 422 nếu nhóm INACTIVE. |
| BR-CAT-PROD-010 | Domain | `pricing_method = PWA` set tại CREATE; ignored nếu gửi trong request. `PUT` ignore field `pricingMethod`. |
| BR-CAT-PROD-011 | Domain / REST | Custom `@ConversionRatePrecision` Bean Validation (hoặc service-layer check): `rate > 0` (ERR-INV-013); `scale(rate) ≤ 6` (ERR-INV-047); unique `unitCode` per product (ERR-INV-014). Áp dụng V2-15, V2-16 và `initialConversionUnits[]` ở V2-10. |
| BR-CAT-PROD-012 | Domain | Trước UPDATE/DELETE conversion unit: check `hasTransactions(unitId)` → reject nếu đã có giao dịch. |
| BR-CAT-PROD-013 | Domain + DB | Unique constraint `(tenant_id, sku_id)` trên `internal_product_sku_mapping` — 1 SKU tối đa 1 mã nội bộ; trả `ERR-INV-015`. |
| BR-CAT-PROD-014 | Domain | `DELETE /api/v2/internal-products/{id}/sku-mappings/{productId}`: xóa row mapping, KHÔNG `DELETE FROM product`. |
| BR-CAT-PROD-015 | REST adapter + Domain | Validate `sizeBytes ≤ 30MB` (ERR-CMN-004); `mimeType ∈ {application/pdf, image/jpeg, image/png}` (ERR-CMN-005); COUNT `attachments WHERE internal_product_id = id` ≤ 5 (ERR-CMN-004). **Lưu ý**: PKG-W03 §2.2.1 entity table có wording cũ "≤ 10MB" — BR nguồn v17/v18 canonical là 30MB (W03 + toàn Inventory V2 đồng nhất). Follow-up CR: `ERROR-CODE-REGISTRY ERR-CMN-004` message cần cập nhật "10MB" → "30MB" (BR v17 follow-up). |
| BR-CAT-PROD-016 | Domain | Trước DELETE: check `hasTransactions(id)` (stock entry hoặc receipt/delivery line) → reject `ERR-INV-008` nếu true; nếu chỉ gắn SKU/conversion-unit → cascade delete mapping + conversion rows + attachment rows trong 1 `@Transactional`. |
| BR-CAT-PROD-017 | Domain | `POST /api/v2/internal-products/import`: bulk INSERT chỉ fields "Thông tin chung"; column `pricingMethod` trong XLSX bị ignore; `pricing_method = PWA` hardcoded; mã trùng → mark `errorRows[]` `ERR-INV-007` + skip; `nature` null → default `GOODS`. |
| BR-CAT-PROD-018 | Domain | `POST /api/v2/internal-products/export`: Apache POI generate `.xlsx` 9 cột canonical + "phương pháp tính giá" + "trạng thái". |
| BR-CAT-PROD-019 | Domain / REST | Enum `ProductNature {GOODS, TOOL, SERVICE, OTHER}` (English internal, hiển thị VN tại BFF/FE); giá trị ngoài → `ERR-INV-012`; default `GOODS` tại CREATE và import (null → `GOODS`). |
| BR-CAT-PROD-020 | REST adapter + BFF | `items.length > 500` → reject `ERR-INV-041` ngay ở adapter (`verify-import` và `import`); BFF defense-in-depth: reject tại BFF trước forward (ADR-018). |
| BR-CAT-PROD-021 | Domain | Trong `verify-import`: từng dòng validate `mainUnitCode` vs `gf-erp-mdm directory=UNIT` (batch call); không khớp → mark dòng `errorRows[]` `ERR-INV-042`. |
| BR-CAT-PROD-022 | Domain | Trong `verify-import`: validate `materialGroupCode` (nếu có) tồn tại trong `material_group` (tenant-scoped) + `status=ACTIVE`; fail → mark `ERR-INV-043`; bỏ trống thì skip validate. |
| BR-CAT-PROD-023 | Domain | Trong `verify-import`: validate `originCode` (nếu có) vs `gf-erp-mdm directory=COUNTRY`; không khớp → mark `ERR-INV-044`. Form CREATE/EDIT: `originCode` validate server-side vs `directory=COUNTRY` (ERR-CMN-validation generic trong form context per PKG R28). `brand` không validate — free-text. |
| BR-CAT-PROD-024 | Domain | `POST /api/v2/internal-products/export`: COUNT rows khớp filter TRƯỚC khi generate xlsx; count > 1000 → reject `ERR-INV-045` (HTTP 400). BFF pass-through `extensions.code=ERR-INV-045`, FE render DIALOG. |
| BR-CAT-PROD-025 | REST adapter | `description.length ≤ 500` + `notes.length ≤ 500` tại adapter (CREATE + UPDATE); trả `ERR-INV-046`. |

#### Cross-cutting

| Rule | Primary layer | Cơ chế |
|---|---|---|
| CB-CAT-001 | Domain | gf-inventory tự dùng `material_group` + `internal_product` cho receipt/delivery/stock — không cần cross-boundary call. |
| CB-CAT-002 | Domain | `mainUnitCode` validate vs `gf-erp-mdm GET /protected/catalog/v1/inquiry?directory=UNIT` (REST call từ gf-inventory service-layer hoặc BFF batch). |
| CB-CAT-003 | Domain | SKU lookup từ legacy `product` table (V2-23 `GET /api/v2/skus/search`); `internal_product_sku_mapping` bảng trung gian — KHÔNG touch `product` table. |
| BR-CAT-CMN-002 | Domain | Audit columns `created_at`, `created_by`, `updated_at`, `updated_by` fill tự động tại service layer; BFF enrich `createdByName`/`updatedByName` qua Pattern TENANT-USERS (`ct-saas-tenant`). |
| BR-CAT-CMN-003 | BFF / REST adapter | Endpoint auth scope `authenticated` — cả `garage-owner` + `accountant` đều pass; không phân biệt role tại endpoint level. |

### 3.3 DB-level constraints (từ PKG-W03 §2.2.1 + Flyway migration)

**Table `material_group`** (Flyway `V{N+1}__inventory_v2_catalog.sql`):

| Constraint | Detail |
|---|---|
| PK | `id UUID` |
| NOT NULL | `tenant_id, code, name, status` |
| UNIQUE | `uk_material_group_tenant_code(tenant_id, code)` |
| FK scalar | `parent_id UUID REFERENCES material_group(id)` (nullable root; ADR-009 — KHÔNG `@ManyToOne`) |
| CHECK | `description VARCHAR(255)` — length enforce app-layer (ERR-INV-016) |

**Table `internal_product`** (cùng migration):

| Constraint | Detail |
|---|---|
| PK | `id UUID` |
| NOT NULL | `tenant_id, code, name, main_unit_code, status, nature, pricing_method` |
| UNIQUE | `uk_internal_product_tenant_code(tenant_id, code)` |
| DEFAULT | `status = 'ACTIVE'`, `nature = 'GOODS'`, `pricing_method = 'PWA'` |
| VARCHAR cap | `description VARCHAR(500)`, `notes VARCHAR(500)`, `brand VARCHAR(255)`, `origin_code VARCHAR(20)`, `image_url VARCHAR(500)` |

**Table `internal_product_sku_mapping`**:

| Constraint | Detail |
|---|---|
| UNIQUE | `uk_sku_mapping_tenant_sku(tenant_id, sku_id)` — 1 SKU tối đa 1 mã nội bộ (ERR-INV-015) |

**Table `internal_product_uom_conversion`**:

| Constraint | Detail |
|---|---|
| UNIQUE | `uk_conversion_product_unit(internal_product_id, uom_id)` — không trùng ĐVT (ERR-INV-014) |
| TYPE | `conversion_rate NUMERIC(18,6)` — DB silently rounds; app-layer scale guard ≤ 6 digits enforce trước save (ERR-INV-047) |

**Table `internal_product_attachment`**:

| Constraint | Detail |
|---|---|
| COUNT guard | Max 5 file/product (app-layer check trước INSERT) |
| VARCHAR | `file_url VARCHAR(500)`, `mime_type VARCHAR(50)` |

---

## §4 Test Ideas

### TC-BR-gf-inventory — Nhóm vật tư hàng hóa

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-001-01 | BR-CAT-GRP-001 | Tạo nhóm mới → kiểm tra status trả về | Happy | `status = ACTIVE` |
| TC-BR-GF-INV-002-01 | BR-CAT-GRP-002 | Tạo nhóm với `code = "GRP~001"` | Violation | HTTP 422, `ERR-INV-001` |
| TC-BR-GF-INV-002-02 | BR-CAT-GRP-002 | Tạo nhóm `code = "GRP-001"` (hợp lệ) | Happy | 201 Created |
| TC-BR-GF-INV-003-01 | BR-CAT-GRP-003 | Tạo 2 nhóm cùng tenant với cùng `code` | Violation | HTTP 422, `ERR-INV-002` |
| TC-BR-GF-INV-003-02 | BR-CAT-GRP-003 | Tạo cùng `code` ở tenant khác nhau | Happy | Tạo thành công — unique per tenant |
| TC-BR-GF-INV-004-01 | BR-CAT-GRP-004 | PUT với body chứa `code` khác | Immutability | `code` không đổi; response trả `code` gốc |
| TC-BR-GF-INV-005-01 | BR-CAT-GRP-005 | Tạo nhóm con với `parentId` hợp lệ | Happy | `parent_id` lưu đúng; `parentName` enriched |
| TC-BR-GF-INV-007-01 | BR-CAT-GRP-007 | Chuyển nhóm cha sang INACTIVE | Cascade | Toàn bộ nhóm con (mọi cấp) → INACTIVE trong 1 TX |
| TC-BR-GF-INV-007-02 | BR-CAT-GRP-007 | Giả lập lỗi DB giữa chừng cascade | Atomicity | Rollback; parent + tất cả con giữ ACTIVE |
| TC-BR-GF-INV-008-01 | BR-CAT-GRP-008 | Tạo mã SP với `materialGroupId` của nhóm INACTIVE | Violation | HTTP 422, reject |
| TC-BR-GF-INV-008-02 | BR-CAT-GRP-008 | Tạo nhóm mới với `parentId` INACTIVE | Violation | HTTP 422, reject |
| TC-BR-GF-INV-009-01 | BR-CAT-GRP-009 | Chuyển nhóm A làm con của nhóm con B (B thuộc A) | Violation | HTTP 422, `ERR-INV-003` |
| TC-BR-GF-INV-009-02 | BR-CAT-GRP-009 | Chuyển nhóm sang nhánh hoàn toàn khác | Happy | Update thành công |
| TC-BR-GF-INV-010-01 | BR-CAT-GRP-010 | Xóa nhóm đã có mã SP gắn vào | Violation | HTTP 422, `ERR-INV-004` |
| TC-BR-GF-INV-011-01 | BR-CAT-GRP-011 | Xóa nhóm cha còn nhóm con | Violation | HTTP 422, `ERR-INV-005` |
| TC-BR-GF-INV-011-02 | BR-CAT-GRP-011 | Xóa nhóm lá (không con, không SP) | Happy | 204 No Content |
| TC-BR-GF-INV-012-01 | BR-CAT-GRP-012 | Tạo nhóm với `description` = 256 ký tự | Violation | HTTP 422, `ERR-INV-016` |
| TC-BR-GF-INV-013-01 | BR-CAT-GRP-013 | Tenant A tìm kiếm nhóm — không thấy nhóm tenant B | Tenant isolation | Response chỉ chứa nhóm tenant A |

### TC-BR-gf-inventory — Mã sản phẩm nội bộ

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-101-01 | BR-CAT-PROD-001 | Tạo mã SP → verify `status` | Happy | `status = ACTIVE` |
| TC-BR-GF-INV-102-01 | BR-CAT-PROD-002 | `code = "SP@001"` | Violation | HTTP 422, `ERR-INV-006` |
| TC-BR-GF-INV-103-01 | BR-CAT-PROD-003 | Tạo 2 SP cùng tenant, cùng `code` | Violation | HTTP 422, `ERR-INV-007` |
| TC-BR-GF-INV-105-01 | BR-CAT-PROD-005 | Tạo SP thiếu `mainUnitCode` | Violation | HTTP 422 (required field) |
| TC-BR-GF-INV-106-01 | BR-CAT-PROD-006 | Sửa `mainUnitCode` khi chưa có giao dịch | Happy | Update thành công |
| TC-BR-GF-INV-106-02 | BR-CAT-PROD-006 | Sửa `mainUnitCode` khi đã có phiếu nhập | Violation | HTTP 422, immutable |
| TC-BR-GF-INV-110-01 | BR-CAT-PROD-010 | Tạo SP với `pricingMethod = "SI"` | Locked | `pricing_method = PWA` trong DB (field bị ignore) |
| TC-BR-GF-INV-111-01 | BR-CAT-PROD-011 | Thêm ĐVT quy đổi: rate = 0 | Violation | HTTP 422, `ERR-INV-013` |
| TC-BR-GF-INV-111-02 | BR-CAT-PROD-011 | Thêm ĐVT quy đổi: rate = 1.1234567 (7 decimals) | Violation | HTTP 422, `ERR-INV-047` |
| TC-BR-GF-INV-111-03 | BR-CAT-PROD-011 | Thêm 2 ĐVT quy đổi cùng `unitCode` | Violation | HTTP 422, `ERR-INV-014` |
| TC-BR-GF-INV-111-04 | BR-CAT-PROD-011 | Thêm ĐVT quy đổi: rate = 1.123456 (6 decimals) | Happy | 201 Created |
| TC-BR-GF-INV-112-01 | BR-CAT-PROD-012 | Sửa ĐVT quy đổi đã phát sinh giao dịch | Violation | HTTP 422, reject |
| TC-BR-GF-INV-113-01 | BR-CAT-PROD-013 | Gắn SKU đã được gắn mã nội bộ khác | Violation | HTTP 422, `ERR-INV-015` |
| TC-BR-GF-INV-114-01 | BR-CAT-PROD-014 | Bỏ gắn SKU → verify SKU master không bị xóa | Happy | Row mapping deleted; `product` table intact |
| TC-BR-GF-INV-115-01 | BR-CAT-PROD-015 | Upload attachment 31 MB | Violation | HTTP 422, `ERR-CMN-004` |
| TC-BR-GF-INV-115-02 | BR-CAT-PROD-015 | Upload attachment loại `.docx` | Violation | HTTP 422, `ERR-CMN-005` |
| TC-BR-GF-INV-115-03 | BR-CAT-PROD-015 | Upload tệp thứ 6 khi đã có 5 tệp | Violation | HTTP 422, `ERR-CMN-004` (exceeds limit) |
| TC-BR-GF-INV-116-01 | BR-CAT-PROD-016 | Xóa mã SP đã có tồn kho | Violation | HTTP 422, `ERR-INV-008` |
| TC-BR-GF-INV-116-02 | BR-CAT-PROD-016 | Xóa mã SP chỉ có SKU mapping (chưa giao dịch) | Happy | 204 No Content; mapping cascade deleted |
| TC-BR-GF-INV-117-01 | BR-CAT-PROD-017 | Import với file có cột "phương pháp tính giá" | Happy | Cột bị ignore; `pricing_method = PWA` |
| TC-BR-GF-INV-119-01 | BR-CAT-PROD-019 | Import dòng với `nature = "KHAC"` (VN lowercase) | Violation | Dòng mark `errorRows[]` `ERR-INV-012` |
| TC-BR-GF-INV-120-01 | BR-CAT-PROD-020 | Import file 501 dòng | Violation | HTTP 422, `ERR-INV-041`; không ghi dòng nào |
| TC-BR-GF-INV-120-02 | BR-CAT-PROD-020 | Import file 500 dòng | Happy | Xử lý bình thường |
| TC-BR-GF-INV-121-01 | BR-CAT-PROD-021 | Import dòng với `mainUnitCode` không tồn tại trong master | Violation | Dòng mark `ERR-INV-042`; dòng hợp lệ khác vẫn preview |
| TC-BR-GF-INV-122-01 | BR-CAT-PROD-022 | Import dòng với nhóm VTHH INACTIVE | Violation | Dòng mark `ERR-INV-043` |
| TC-BR-GF-INV-122-02 | BR-CAT-PROD-022 | Import dòng không điền cột nhóm | Happy | Dòng hợp lệ (nhóm không bắt buộc) |
| TC-BR-GF-INV-123-01 | BR-CAT-PROD-023 | Import dòng với `originCode = "XXXX"` (không có trong master) | Violation | Dòng mark `ERR-INV-044` |
| TC-BR-GF-INV-124-01 | BR-CAT-PROD-024 | Export với filter khớp 1.001 SP | Violation | HTTP 400, `ERR-INV-045`; không sinh file |
| TC-BR-GF-INV-124-02 | BR-CAT-PROD-024 | Export với filter khớp 1.000 SP | Happy | File `.xlsx` 1000 dòng |
| TC-BR-GF-INV-125-01 | BR-CAT-PROD-025 | Tạo SP với `description` = 501 ký tự | Violation | HTTP 422, `ERR-INV-046` |
| TC-BR-GF-INV-125-02 | BR-CAT-PROD-025 | Tạo SP với `notes` = 501 ký tự | Violation | HTTP 422, `ERR-INV-046` |

---

## §5 BR → FEAT → AC Mapping

### FEAT-CAT-GRP-LIST

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-GRP-005 | AC hiển thị cây/flat list | Flat list (R29 canonical) — V2-1 flat-grouped-by-parent |
| BR-CAT-GRP-006 | AC filter status | Tab hoặc dropdown filter ACTIVE/INACTIVE |
| BR-CAT-GRP-013 | Mọi AC | Tenant isolation; keyword LIKE on code+name |

### FEAT-CAT-GRP-CREATE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-GRP-001 | AC tạo thành công | status = ACTIVE |
| BR-CAT-GRP-002 | AC validation mã nhóm | Regex char check |
| BR-CAT-GRP-003 | AC trùng mã | ERR-INV-002 |
| BR-CAT-GRP-005 | AC chọn nhóm cha | parentId optional |
| BR-CAT-GRP-006 | AC status enum | ACTIVE/INACTIVE |
| BR-CAT-GRP-008 | AC dropdown nhóm cha | Chỉ hiển thị ACTIVE |
| BR-CAT-GRP-012 | AC mô tả | ≤ 255 ký tự |

### FEAT-CAT-GRP-DETAIL

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-CMN-002 | AC hiển thị audit | ngày tạo / người tạo / ngày sửa / người sửa |
| BR-CAT-GRP-005 | AC hiển thị nhóm cha | parentName enriched |

### FEAT-CAT-GRP-EDIT

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-GRP-002 | AC validate mã | |
| BR-CAT-GRP-004 | AC mã readonly | Field disabled trên UI |
| BR-CAT-GRP-006 | AC toggle status | |
| BR-CAT-GRP-007 | AC cascade | Confirm dialog trước deactivate cha |
| BR-CAT-GRP-008 | AC dropdown nhóm cha | ACTIVE-only |
| BR-CAT-GRP-009 | AC chuyển nhóm cha | Circular check |
| BR-CAT-GRP-012 | AC mô tả | |

### FEAT-CAT-GRP-DELETE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-GRP-010 | AC guard có SP | ERR-INV-004 → UI hiển thị thông báo không xóa được |
| BR-CAT-GRP-011 | AC guard còn con | ERR-INV-005 → UI thông báo |

### FEAT-CAT-PROD-LIST

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-PROD-007 | AC filter status | |
| BR-CAT-PROD-019 | AC filter tính chất | 4 enum values |
| BR-CAT-GRP-013 | Mọi AC | Tenant isolation |

### FEAT-CAT-PROD-CREATE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-PROD-001 | AC tạo thành công | status = ACTIVE |
| BR-CAT-PROD-002 | AC validate mã | ERR-INV-006 |
| BR-CAT-PROD-003 | AC trùng mã | ERR-INV-007 |
| BR-CAT-PROD-005 | AC required fields | code, name, mainUnitCode |
| BR-CAT-PROD-009 | AC dropdown nhóm | ACTIVE groups only |
| BR-CAT-PROD-010 | AC pricing method | Default PWA, locked |
| BR-CAT-PROD-011 | AC khai ĐVT quy đổi | rate > 0, ≤ 6 decimals, unique unit |
| BR-CAT-PROD-015 | AC tệp đính kèm | ≤ 5 files, ≤ 30MB, PDF/JPG/PNG |
| BR-CAT-PROD-019 | AC tính chất | Default "Vật tư hàng hóa" |
| BR-CAT-PROD-023 | AC xuất xứ | Lookup master, brand free-text |
| BR-CAT-PROD-025 | AC mô tả / ghi chú | ≤ 500 chars each |

### FEAT-CAT-PROD-DETAIL

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-CMN-002 | AC audit fields | |
| BR-CAT-PROD-011 | AC danh sách ĐVT quy đổi | Hiển thị rate + đơn vị |
| BR-CAT-PROD-012 | AC ĐVT quy đổi đã giao dịch | Ẩn nút sửa/xóa |
| BR-CAT-PROD-013 | AC gắn SKU | Nhiều SKU per mã; global unique |
| BR-CAT-PROD-014 | AC bỏ gắn SKU | Mapping only |

### FEAT-CAT-PROD-EDIT

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-PROD-004 | AC mã readonly | |
| BR-CAT-PROD-006 | AC ĐVT chính | Readonly khi đã giao dịch |
| BR-CAT-PROD-008 | AC status → INACTIVE | Warn downstream receipt/delivery blocks |
| BR-CAT-PROD-009 | AC dropdown nhóm | |
| BR-CAT-PROD-011 | AC sửa ĐVT quy đổi | |
| BR-CAT-PROD-012 | AC ĐVT đã giao dịch | Immutable |
| BR-CAT-PROD-015 | AC attachment | |
| BR-CAT-PROD-025 | AC mô tả / ghi chú | |

### FEAT-CAT-PROD-DELETE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-PROD-016 | AC guard | ERR-INV-008; cascade delete SKU mapping + ĐVT khi chỉ gắn |

### FEAT-CAT-PROD-IMPORT

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-PROD-003 | AC trùng mã | ERR-INV-007 per dòng, skip |
| BR-CAT-PROD-017 | AC luồng import | Thêm mới only; verify-then-commit; "Thông tin chung" only |
| BR-CAT-PROD-019 | AC tính chất | Validate + default GOODS |
| BR-CAT-PROD-020 | AC cap 500 | ERR-INV-041 |
| BR-CAT-PROD-021 | AC validate ĐVT | ERR-INV-042 per dòng |
| BR-CAT-PROD-022 | AC validate nhóm | ERR-INV-043 per dòng |
| BR-CAT-PROD-023 | AC xuất xứ | ERR-INV-044 per dòng; brand skip |

### FEAT-CAT-PROD-EXPORT

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-CAT-PROD-018 | AC columns | 9 cột import + "phương pháp tính giá" + "trạng thái" |
| BR-CAT-PROD-024 | AC cap 1000 | ERR-INV-045 DIALOG |

---

## §6 Error Code Mapping

> Nguồn canonical: `Product/error-code/ERROR-CODE-REGISTRY.md`. File này liệt kê mã áp dụng cho 12 FEAT trong W03.

### Nhóm vật tư hàng hóa

| Code | ERR ID | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|---|
| `ERR-INV-001` | INV-001 | 422 | INLINE_FORM | "Mã nhóm không được chứa ký tự đặc biệt" | BR-CAT-GRP-002 |
| `ERR-INV-002` | INV-002 | 422 | INLINE_FORM | "Mã nhóm đã tồn tại" | BR-CAT-GRP-003 |
| `ERR-INV-003` | INV-003 | 422 | TOAST | "Không thể chuyển nhóm vào chính nó hoặc nhóm con của nó" | BR-CAT-GRP-009 |
| `ERR-INV-004` | INV-004 | 422 | TOAST | "Nhóm đã có mã sản phẩm, không thể xóa" | BR-CAT-GRP-010 |
| `ERR-INV-005` | INV-005 | 422 | TOAST | "Nhóm còn nhóm con, không thể xóa" | BR-CAT-GRP-011 |
| `ERR-INV-016` | INV-016 | 422 | INLINE_FORM | "Mô tả không được vượt quá 255 ký tự" | BR-CAT-GRP-012 |

### Mã sản phẩm nội bộ

| Code | ERR ID | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|---|
| `ERR-INV-006` | INV-006 | 422 | INLINE_FORM | "Mã sản phẩm không được chứa ký tự đặc biệt" | BR-CAT-PROD-002 |
| `ERR-INV-007` | INV-007 | 422 | INLINE_FORM / row | "Mã nội bộ đã tồn tại" | BR-CAT-PROD-003/017 |
| `ERR-INV-008` | INV-008 | 422 | TOAST | "Mã sản phẩm đã phát sinh dữ liệu, không thể xóa" | BR-CAT-PROD-016 |
| `ERR-INV-012` | INV-012 | 422 | INLINE_FORM / row | "Tính chất sản phẩm không hợp lệ" | BR-CAT-PROD-019 |
| `ERR-INV-013` | INV-013 | 422 | INLINE_FORM | "Tỷ lệ quy đổi phải lớn hơn 0" | BR-CAT-PROD-011 |
| `ERR-INV-014` | INV-014 | 422 | INLINE_FORM | "Đơn vị tính đã tồn tại trong danh sách quy đổi" | BR-CAT-PROD-011 |
| `ERR-INV-015` | INV-015 | 422 | TOAST | "SKU này đã được gắn vào mã sản phẩm khác" | BR-CAT-PROD-013 |
| `ERR-INV-041` | INV-041 | 422 | TOAST | "Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần" | BR-CAT-PROD-020 |
| `ERR-INV-042` | INV-042 | — | INLINE_ROW | "Đơn vị tính không tồn tại trong danh mục" | BR-CAT-PROD-021 (per-row) |
| `ERR-INV-043` | INV-043 | — | INLINE_ROW | "Nhóm vật tư/hàng hóa không tồn tại hoặc đã ngừng hoạt động" | BR-CAT-PROD-022 (per-row) |
| `ERR-INV-044` | INV-044 | — | INLINE_ROW | "Xuất xứ trong file không khớp danh mục xuất xứ" | BR-CAT-PROD-023 (per-row) |
| `ERR-INV-045` | INV-045 | 400 | DIALOG | "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" | BR-CAT-PROD-024 |
| `ERR-INV-046` | INV-046 | 422 | INLINE_FORM | "Mô tả / Ghi chú vượt quá 500 ký tự" | BR-CAT-PROD-025 |
| `ERR-INV-047` | INV-047 | 422 | INLINE_FORM | "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy" | BR-CAT-PROD-011 |

### Platform-level (dùng chung)

| Code | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|
| `ERR-CMN-004` | 422 | INLINE_FORM | "File quá lớn (tối đa 30MB)" (*) | BR-CAT-PROD-015 (attachment size); max 5 files |
| `ERR-CMN-005` | 422 | INLINE_FORM | "Định dạng file không hợp lệ — chỉ chấp nhận PDF, JPG, PNG" | BR-CAT-PROD-015 (MIME) |

> (*) `ERR-CMN-004` message hiện tại trong registry là "tối đa 10MB". Follow-up CR (dual-owner BA + Architect): cập nhật `ERROR-CODE-REGISTRY ERR-CMN-004` message "10MB" → "30MB" (per BR v17 changelog). Đây là follow-up tách biệt — không block W03 delivery.

---

## §7 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W03-BR-001 | **`ERROR-CODE-REGISTRY ERR-CMN-004` message drift**: registry còn "tối đa 10MB", BR-CAT-PROD-015 v17 đã chốt 30MB cho toàn Inventory V2. Follow-up CR cần update registry message. Không block W03 DEV (FE có thể hardcode "30MB" trong error message riêng hoặc chấp nhận drift tạm thời). | FOLLOW-UP CR — không block |
| OI-W03-BR-002 | **PKG-W03 §2.2.1 `internal_product_attachment` table wording**: còn "≤ 10MB" (stale). Cần DEV xác nhận dùng 30MB per BR-CAT-PROD-015 v18 canonical (không phải PKG table). Architecture là source-of-truth. | LOW — verify DEV reads BR canonical |

---

## §8 References

- `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` v18 (nguồn canonical)
- `Execution/work-packages/PKG-W03-inventory-catalog.md` v21
- `Architecture/api/gf-inventory-api.md` — V2-1..V2-23 endpoint spec
- `Architecture/api/agg-garage-graph-graphql.md` — V2-Q1..Q9 + V2-M1..M15 SDL
- `Architecture/data/gf-inventory-data-model.md` — entity schema
- `Product/error-code/ERROR-CODE-REGISTRY.md`
- `Architecture/decisions/ADR-009.md` — JPA no relationship mapping
- `Architecture/decisions/ADR-018.md` — import cap 500 rows

---

## §9 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT W03 scoped spec. Verbatim copy toàn bộ rule từ BR-GF-INVENTORY-CATALOG v18 (SHA 9114d75a). Bổ sung §3 Enforcement Layer (domain/adapter/DB/BFF/UI), §4 Test Ideas per rule, §5 BR→FEAT→AC mapping cho 12 FEAT, §6 Error code mapping đầy đủ. Note PKG stale wording 10MB → 30MB (OI-W03-BR-001). |
| 2026-06-29 | 2 | Delivery Authority | DRAFT → ACTIVE per reviewer-W03 verdict APPROVED. 2 NC remain non-blocking (OI-W03-BR-001 ERR-CMN-004 message stale 10MB, OI-W03-BR-002 PKG entity attachment wording stale) — follow-up CR. |
