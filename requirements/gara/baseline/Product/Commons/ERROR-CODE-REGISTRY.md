---
type: reference
artifact_kind: error-code-registry
status: ACTIVE
version: 34
tier: T3
owner_authority: Business Authority + Architect
boundary: "cross-cutting (gf-sales, gf-accounting, gf-inventory, gf-hrms, agg-garage-graph, garage-web)"
last_reviewed: "2026-08-02"  # v34 CR-20260801-07 (MINOR, APPROVED — sonhoang) — đăng ký 2 mã symbolic cấp platform `ERR-CMN-validation` (400) + `ERR-CMN-not-found` (404) vốn đã dùng ≥20 file Architecture/Execution + auto-test W04 nhưng thiếu trong registry. v33 thêm ERR-INV-051 (LockTimeoutException W06-P5) — xem §8 Change Log. v32 backfill YAML §6 machine-readable block cho ERR-INV-024 — sync với bảng §4 (v31 đã update, YAML bị sót).
---

# ERROR-CODE-REGISTRY — Sổ đăng ký mã lỗi & thông báo (GMS v3)

> **Mục đích**: Nguồn duy nhất (single source of truth) cho **mã lỗi dùng chung BE ↔ FE**.
> Backend trả về `errorCode`; Frontend tra cứu registry này để render đúng **nội dung thông báo + loại thông báo + hình thức hiển thị**.
> Tránh hardcode chuỗi lệch giữa các màn — message tái sử dụng được khai báo nhóm **Common (`ERR-CMN-*`)**.

---

## 1. Quy ước

### 1.1 Cấu trúc mã

```
ERR-{NHÓM}-{NNN}
       │      └── số thứ tự 3 chữ số, tăng dần, KHÔNG tái sử dụng khi xoá (chỉ deprecate)
       └── CMN = Common (dùng chung mọi màn) · INS = Insurance-Settlement (riêng domain) · INV = Inventory V2 (riêng domain kho V2) · HRMS = Human Resources (dùng chung khi domain khác gọi gf-hrms — suffix có thể descriptive hoặc numeric)
```

> **Ngoại lệ — mã symbolic**: một số mã dùng hậu tố mô tả thay vì số thứ tự (`ERR-CMN-validation`, `ERR-CMN-not-found`, `ERR-HRMS-STAFF-NOT-ELIGIBLE`). Đây là convention de-facto đã tồn tại từ W03 trên ≥20 file Architecture/Execution + auto-test đang chạy; `CR-20260801-07` (2026-08-02) chốt **giữ nguyên dạng symbolic**, KHÔNG remap sang `ERR-CMN-0XX` (remap sẽ cascade ≥20 file gồm `Execution/auto/specs/W04/api/*.spec.ts`). Mã mới nên ưu tiên dạng đánh số; dạng symbolic chỉ dùng cho generic fallback cấp platform.

- **BE**: ném/đáp `errorCode` (string) + (tuỳ chọn) `params` cho phần động.
- **FE**: KHÔNG tự đặt text — map `errorCode → message + severity + display` từ registry này (build thành i18n/constants dùng chung).
- **Hợp đồng BE/FE**: mã lỗi là contract — đổi text KHÔNG đổi mã; đổi semantics → cấp **mã mới**, deprecate mã cũ.

### 1.2 Loại thông báo (severity)

| Ký hiệu | severity (code) | Ý nghĩa | Màu |
|---|---|---|---|
| 🔴 Lỗi | `ERROR` | Vi phạm chặn thao tác / lỗi hệ thống | Đỏ |
| 🟡 Cảnh báo | `WARNING` | Bất thường nhưng **vẫn cho lưu** | Vàng |
| 🔵 Thông tin | `INFO` | Trạng thái rỗng / chỉ dẫn | Xám |

### 1.3 Common vs Riêng

- **Common (`ERR-CMN-*`)** — message generic, **tái sử dụng** cho màn hình khác sau này. Không nhúng từ ngữ đặc thù domain.
- **Riêng (`ERR-INS-*`)** — message gắn nghiệp vụ insurance-settlement; chỉ dùng trong domain này.

### 1.4 Hình thức hiển thị (display) — **dev agent đọc bảng này để biết render kiểu gì**

| `display` | Mô tả render | Vị trí | Block thao tác? | Tự đóng (auto-dismiss) | Khi nào dùng |
|---|---|---|---|---|---|
| `INLINE_FIELD` | Text lỗi đỏ ngay dưới ô nhập + viền đỏ + highlight trường | Dưới input | ✅ Có (chặn submit) | ❌ Không — tự xoá khi sửa hợp lệ | Validation field-level (số tiền, %, dropdown bắt buộc, file format) |
| `INLINE_FORM` | Banner/vùng lỗi trong form hoặc modal + highlight phần liên quan (vd thẻ tài liệu thiếu) | Đầu form / trong modal | ✅ Có | ❌ Không | Validation gom nhiều phần khi bấm submit/xuất |
| `INLINE_WARNING` | Dải cảnh báo vàng cạnh khối liên quan + highlight, **không chặn** lưu | Cạnh khối tổng / trường | ❌ Không (vẫn cho lưu) | ❌ Không | Cảnh báo nghiệp vụ (vd BH thanh toán âm) |
| `TOAST` | Toast nổi (snackbar) góc trên-phải | Overlay góc trên-phải | ❌ Không chặn form | ✅ Có (~4–5s); lỗi hệ thống có thể kèm nút **Thử lại** (không auto-dismiss khi có action) | Lỗi hệ thống / kết quả thao tác async thất bại |
| `DIALOG` | Modal chặn, cần user bấm xác nhận / điều hướng (thường kèm link) | Giữa màn, có overlay | ✅ Có (chặn tới khi user xử lý) | ❌ Không | Guard nghiệp vụ cần quyết định/điều hướng (chưa chọn DN BH, đã tồn tại phiếu, conflict reload) |
| `EMPTY_STATE` | Placeholder (icon + text) giữa vùng nội dung khi danh sách rỗng — **không phải lỗi** | Giữa vùng danh sách | — | — | Tab/list không có dữ liệu |

---

## 2. Registry — Common (`ERR-CMN-*`)

| Mã | Loại | Hiển thị | Category | Message (VI) | Message (EN) | Action kèm | HTTP | Rule ref | Dùng tại (FEAT) |
|---|---|---|---|---|---|---|---|---|---|
| `ERR-CMN-001` | 🔴 ERROR | `INLINE_FIELD` | Validation | Số tiền vượt quá số lượng cho phép | Amount exceeds the allowed quantity | — | 400 | VLD-INS-SO-004 | FEAT-INS-SO-ADJUSTMENT, *(tái sử dụng)* |
| `ERR-CMN-002` | 🔴 ERROR | `INLINE_FIELD` | Validation | Chiết khấu không thể lớn hơn 100% | Discount cannot be greater than 100% | — | 400 | VLD-INS-SO-003 | FEAT-INS-SO-ADJUSTMENT, *(tái sử dụng)* |
| `ERR-CMN-003` | 🔴 ERROR | `INLINE_FIELD` | Validation | Khấu hao không thể lớn hơn 100% | Depreciation cannot be greater than 100% | — | 400 | VLD-INS-SO-003 | FEAT-INS-SO-ADJUSTMENT, *(tái sử dụng)* |
| `ERR-CMN-004` | 🔴 ERROR | `INLINE_FIELD` | File | File quá lớn (tối đa 30MB) | File is too large (maximum 30MB) | — | 413 | — | *(toàn platform — upload file)* |
| `ERR-CMN-005` | 🔴 ERROR | `INLINE_FIELD` | File | Định dạng không hỗ trợ — chỉ chấp nhận PDF, JPG, PNG, DOC, XLSX | Unsupported file format — only PDF, JPG, PNG, DOC, and XLSX are accepted | — | 415 | — | *(toàn platform — upload file)* |
| `ERR-CMN-006` | 🔴 ERROR | `TOAST` | System | Không tải lên được file — vui lòng thử lại | File upload failed — please try again | Nút: Thử lại | 502 | — | *(toàn platform — upload file)* |
| `ERR-CMN-007` | 🔴 ERROR | `TOAST` | System | Hệ thống đang bận, vui lòng thử lại sau | The system is busy. Please try again later | — | 503 | — | *(toàn platform)* |
| `ERR-CMN-007-DEGRADED` | 🟡 WARNING | `DIALOG` | Business | Không kết nối được hệ thống đơn hàng để đối soát. Bạn có muốn tiếp tục ghi sổ không? | The order system cannot be reached for reconciliation. Do you want to continue posting? | Nút: [Đóng] / [Vẫn Ghi sổ] | 409 | BR-IDV2-009 v40 (case C4) | EP-INVENTORY-DELIVERY-V2 (FEAT-ID-DETAIL-V2 AC-5) — `postDeliveryV2` case C4 fail-CLOSED reconciliation (gf-sales down/timeout/5xx). BA authorize 2026-07-16 tối (Plan mode Q2). NO commit; client re-call với `overrideWarnings=true` → BE commit (case C5). Distinct semantic từ `ERR-CMN-007` HTTP 503 platform-wide toast retry — 2 code coexist. Producer: gf-inventory. Consumer: BFF pass-through + FE popup handler. |
| `ERR-CMN-008` | 🔴 ERROR | `DIALOG` | System | Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại | This data was updated by someone else — please reload | Nút: Tải lại | 409 | — | FEAT-INS-STL-DETAIL, *(tái sử dụng — optimistic lock)* |
| `ERR-CMN-009` | 🔴 ERROR | `TOAST` | Business | Phiếu dịch vụ chưa hoàn thành | The service order is not completed | — | 409 | VLD-INS-STL-004 | FEAT-INS-STL-DETAIL, *(tái sử dụng — SO/settlement)* |
| `ERR-CMN-010` | 🔵 INFO | `EMPTY_STATE` | Empty-state | Không có kết quả phù hợp | No matching results | — | 200 | — | *(toàn platform — list/export empty state)* |
| `ERR-CMN-validation` | 🔴 ERROR | `INLINE_FIELD` | Validation | Dữ liệu không hợp lệ | Invalid request data | — | 400 | — | *(toàn platform — generic 400)* — dùng khi **không có** mã validation nghiệp vụ cụ thể hơn (`ERR-CMN-001/002/003`, `ERR-INV-*`, `ERR-INS-*`). Mã **symbolic** (không đánh số) — đã là convention de-facto ≥20 file Architecture/Execution từ W03; đăng ký chính thức per `CR-20260801-07`. Consumer: `gf-inventory-api.md`, `gf-accounting-api.md`, `agg-garage-graph-graphql.md`, `Execution/auto/specs/W04/api/*.spec.ts`, 5 exec spec W06 PRC. |
| `ERR-CMN-not-found` | 🔴 ERROR | `TOAST` | Business | Không tìm thấy dữ liệu | Resource not found | — | 404 | — | *(toàn platform — generic 404)* — bao gồm cả case **tenant-mismatch** và **soft-deleted**: trả 404 thay vì 403/410 để **không leak existence** cross-tenant (per `CR-20260801-02`). Mã **symbolic** (không đánh số), đăng ký chính thức per `CR-20260801-07`. Consumer: như trên. |

## 3. Registry — Riêng Insurance-Settlement (`ERR-INS-*`)

| Mã | Loại | Hiển thị | Category | Message (VI) | Message (EN) | Action kèm | HTTP | Rule ref | Dùng tại (FEAT) |
|---|---|---|---|---|---|---|---|---|---|
| `ERR-INS-001` | 🔴 ERROR | `INLINE_FIELD` | Validation | Vui lòng chọn công ty bảo hiểm | Please select an insurance company | — | 400 | VLD-INS-SO-002 | FEAT-INS-SO-ADJUSTMENT |
| `ERR-INS-002` | 🔴 ERROR | `DIALOG` | Business | Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm | Please select the insurance company on the service order before creating an insurance settlement | Link: Quay về Phiếu dịch vụ | 409 | VLD-INS-STL-002 | FEAT-INS-STL-DETAIL, FEAT-INS-SO-ADJUSTMENT |
| `ERR-INS-003` | 🟡 WARNING | `INLINE_WARNING` | Business | Bảo hiểm thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh | Insurance payment cannot be negative — please review the adjustments | Highlight các trường điều chỉnh | 200 | VLD-INS-SO-005 | FEAT-INS-SO-ADJUSTMENT |
| `ERR-INS-004` | 🔴 ERROR | `TOAST` | Business | Phiếu dịch vụ không có hạng mục thuộc bảo hiểm | The service order has no insurance-covered items | — | 409 | VLD-INS-STL-001 | FEAT-INS-STL-DETAIL |
| `ERR-INS-005` | 🔴 ERROR | `DIALOG` | Business | Đã tồn tại phiếu quyết toán bảo hiểm cho phiếu dịch vụ này | An insurance settlement already exists for this service order | Link: Xem phiếu hiện có | 409 | VLD-INS-STL-003 | FEAT-INS-STL-DETAIL |
| `ERR-INS-007` | 🔴 ERROR | `INLINE_FORM` | Validation | Vui lòng hoàn tất các tài liệu còn thiếu | Please complete the missing documents | Highlight thẻ tài liệu thiếu | 400 | VLD-INS-DOSSIER-003 | FEAT-INS-DOSSIER-CREATE |
| `ERR-INS-008` | 🔴 ERROR | `TOAST` | System | Không tạo được PDF hồ sơ — vui lòng thử lại | Could not generate the dossier PDF — please try again | Nút: Thử lại | 500 | — | FEAT-INS-DOSSIER-CREATE |
| `ERR-INS-009` | 🔴 ERROR | `TOAST` | System | Không tải được hồ sơ — vui lòng liên hệ quản trị | Could not load the dossier — please contact an administrator | — (không retry) | 500 | — | FEAT-INS-DOSSIER-VIEW |
| `ERR-INS-010` | 🔵 INFO | `EMPTY_STATE` | Empty-state | Chưa có hồ sơ nào được xuất | No dossier has been exported yet | — | — | — | FEAT-INS-DOSSIER-VIEW |

> **Lưu ý gỡ bỏ**: thông báo cũ *"Vui lòng chọn nguồn thanh toán cho tất cả các dòng"* **không cấp mã** — mặc định Nguồn thanh toán = Khách hàng nên không xảy ra trường hợp rỗng (chốt 2026-06-11).

## 4. Registry — Inventory V2 (`ERR-INV-*`)

> **Status: ✅ ACTIVE — Inventory V2 (cutover 2026-07-14)**
>
> Cutover từ `[DRAFT/PROPOSED]` sang `ACTIVE` cho toàn bộ mã `ERR-INV-*` (Architect + Business Authority co-sign 2026-07-14, unblock W05 spawn DEV — BA-review W05-INVENTORY-V2 C3.2). Mã ổn định về payload, message, HTTP status, rule ref, FEAT usage; DEV có thể binding contract mà không lo drift. Any future add/change → CR + registry Change Log (không cần status transition riêng).
>
> 54 mã lỗi domain kho V2 — đồng bộ từ mã **bare UPPERCASE_SNAKE** khai trong các BR `BR-GF-INVENTORY-*` (Catalog, Accounting-Period, Opening-Balance, Receipt-V2, Delivery-V2). Mã `ERR-INV-NNN` ánh xạ 1-1 với mã bare tương ứng (cột "Rule ref" = BR ID nguồn).

| Mã | Loại | Hiển thị | Category | Message (VI) | Message (EN) | Action kèm | HTTP | Rule ref | Dùng tại (FEAT) |
|---|---|---|---|---|---|---|---|---|---|
| `ERR-INV-001` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mã nhóm vật tư hàng hóa không hợp lệ — không được chứa ký tự đặc biệt | The material group code is invalid — special characters are not allowed | Highlight ô Mã nhóm | 400 | BR-CAT-GRP-002 | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-CREATE/EDIT) |
| `ERR-INV-002` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mã nhóm vật tư hàng hóa đã tồn tại | The material group code already exists | Highlight ô Mã nhóm | 400 | BR-CAT-GRP-003 | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-CREATE) |
| `ERR-INV-003` | 🔴 ERROR | `INLINE_FIELD` | Validation | Không thể chuyển nhóm vào chính nó hoặc nhóm con của nó (tránh vòng lặp phân cấp) | Cannot move a group into itself or one of its child groups (prevents hierarchy loops) | Highlight ô Thuộc nhóm | 400 | BR-CAT-GRP-009 | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-EDIT) |
| `ERR-INV-004` | 🔴 ERROR | `DIALOG` | Business | Không thể xóa — nhóm đã phát sinh mã sản phẩm nội bộ | Cannot delete — the group already has internal products | — | 400 | BR-CAT-GRP-010 | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-DELETE) |
| `ERR-INV-005` | 🔴 ERROR | `DIALOG` | Business | Không thể xóa — nhóm cha còn nhóm con, phải xóa hết nhóm con trước | Cannot delete — the parent group still has child groups. Delete all child groups first | — | 400 | BR-CAT-GRP-011 | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-DELETE) |
| `ERR-INV-006` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mã sản phẩm nội bộ không hợp lệ — không được chứa ký tự đặc biệt | The internal product code is invalid — special characters are not allowed | Highlight ô Mã nội bộ | 400 | BR-CAT-PROD-002 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE) |
| `ERR-INV-007` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mã sản phẩm nội bộ đã tồn tại | The internal product code already exists | Highlight ô Mã nội bộ | 400 | BR-CAT-PROD-003 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-IMPORT) |
| `ERR-INV-008` | 🔴 ERROR | `DIALOG` | Business | Không thể xóa — mã sản phẩm đã phát sinh dữ liệu sử dụng (phiếu nhập/xuất hoặc tồn kho) | Cannot delete — the product already has usage data (receipts, deliveries, or stock) | — | 400 | BR-CAT-PROD-016 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-DELETE) |
| `ERR-INV-009` | 🔴 ERROR | `INLINE_FORM` | Business | Mã sản phẩm nội bộ không tồn tại trong garage | The internal product does not exist in this garage | Highlight dòng lỗi | 400 | BR-OB-006 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-010` | 🔴 ERROR | `INLINE_FORM` | Business | Mã sản phẩm nội bộ đang ở trạng thái "Ngừng hoạt động" | The internal product is in "Inactive" status | Highlight dòng lỗi | 400 | BR-OB-007 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-011` | 🔴 ERROR | `INLINE_FORM` | Business | Phải có mã sản phẩm nội bộ ở mọi dòng trước khi ghi sổ kho | Every line must have an internal product before posting stock | Highlight dòng thiếu mã | 400 | BR-IRV2-028 / BR-IDV2-028 | EP-INVENTORY-RECEIPT-V2 / EP-INVENTORY-DELIVERY-V2 (FEAT-IR/ID-DETAIL-V2) |
| `ERR-INV-012` | 🔴 ERROR | `INLINE_FIELD` | Validation | Tính chất sản phẩm không hợp lệ — chỉ chọn từ danh sách cố định | Invalid product nature — select only from the fixed list | Highlight ô Tính chất | 400 | BR-CAT-PROD-019 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/IMPORT) |
| `ERR-INV-013` | 🔴 ERROR | `INLINE_FIELD` | Validation | Tỷ lệ quy đổi phải lớn hơn 0 | The conversion rate must be greater than 0 | Highlight dòng ĐVT quy đổi | 400 | BR-CAT-PROD-011 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/DETAIL) |
| `ERR-INV-014` | 🔴 ERROR | `INLINE_FIELD` | Validation | ĐVT quy đổi bị trùng trong cùng mã sản phẩm | The conversion unit is duplicated within the same product | Highlight dòng ĐVT quy đổi | 400 | BR-CAT-PROD-011 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/DETAIL) |
| `ERR-INV-015` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mã SKU đã được gắn cho một mã sản phẩm nội bộ khác | This SKU has already been linked to another internal product | Highlight ô chọn SKU | 400 | BR-CAT-PROD-013 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-DETAIL) |
| `ERR-INV-016` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mô tả vượt quá 255 ký tự | Description exceeds 255 characters | Highlight ô Mô tả | 400 | BR-CAT-GRP-012 | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-CREATE/EDIT) |
| `ERR-INV-017` | 🔴 ERROR | `INLINE_FORM` | Validation | Thiếu trường bắt buộc | Required field is missing | Highlight dòng/trường thiếu | 400 | BR-OB-011 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-018` | 🔴 ERROR | `INLINE_FORM` | Validation | Sai định dạng ngày ("Tồn đến ngày") | Invalid date format ("Stock as-of date") | Highlight dòng lỗi | 400 | BR-OB-011 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-019` | 🔴 ERROR | `INLINE_FORM` | Validation | ĐVT trong file không khớp ĐVT chính của mã sản phẩm | The unit in the file does not match the product's base unit | Highlight dòng lỗi | 400 | BR-OB-010 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-020` | 🔴 ERROR | `INLINE_FORM` | Business | Kho không tồn tại trong danh mục kho của garage | Warehouse does not exist in this garage's warehouse catalog | Highlight dòng lỗi | 400 | BR-OB-005 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-021` | 🔴 ERROR | `INLINE_FIELD` | Validation | Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu | End date must be greater than or equal to start date | Highlight ô Ngày | 400 | BR-AP-006 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-CREATE) |
| `ERR-INV-022` | 🔴 ERROR | `INLINE_FIELD` | Validation | Khoảng ngày của kỳ con phải nằm trong khoảng ngày của kỳ cha | The child period date range must be within the parent period date range | Highlight ô Ngày | 400 | BR-AP-007 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-CREATE) |
| `ERR-INV-023` | 🔴 ERROR | `INLINE_FIELD` | Validation | Khoảng ngày bị chồng lấn với kỳ cùng cấp trong cùng kỳ cha | The date range overlaps another period at the same level under the same parent | Highlight ô Ngày | 400 | BR-AP-008 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-CREATE) |
| `ERR-INV-024` | 🔴 ERROR | `INLINE_FORM` | Business | Kỳ kế toán đã đóng — Bạn không thể thực hiện mọi thao tác thuộc kỳ này | The accounting period is closed — You cannot perform any operations in this period | — | 400 | BR-AP-012 / BR-OB-013 / BR-OB-DEL-002 / BR-IRV2-007 / BR-IDV2-007 / BR-PRC-008 / BR-PRC-011 | EP-INVENTORY-RECEIPT-V2 / DELIVERY-V2 / OPENING-BALANCE / ACCOUNTING-PERIOD |
| `ERR-INV-025` | 🔴 ERROR | `DIALOG` | Business | Không thể xóa kỳ kế toán — kỳ đã đóng hoặc đã phát sinh dữ liệu kho liên quan | Cannot delete the accounting period — it is closed or already has related inventory data | — | 400 | BR-AP-013 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-DELETE) |
| `ERR-INV-026` | 🔴 ERROR | `DIALOG` | Business | Không thể xóa — kỳ cha còn kỳ con, phải xóa hết kỳ con trước | Cannot delete — the parent period still has child periods. Delete all child periods first | — | 400 | BR-AP-014 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-DELETE) |
| `ERR-INV-027` | 🔴 ERROR | `TOAST` | System | Tính giá xuất kho thất bại — vui lòng thử lại | Inventory costing failed — please try again | Nút: Thử lại | 400 | BR-PRC-007 *(deprecated — thay bằng ERR-INV-030/031/052)* | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/RECALC) |
| `ERR-INV-028` | 🔴 ERROR | `INLINE_FORM` | Business | Kỳ trước chưa được tính giá | The previous period has not been costed | — | 400 | BR-PRC-006 *(deprecated — đã bỏ chặn tuần tự)* | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE) |
| `ERR-INV-029` | 🔴 ERROR | `DIALOG` | Business | Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất | A costing run is already in progress for this period and warehouse — please wait until it completes | — | 400 | BR-PRC-016 / BR-PRC-011 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE, FEAT-PRC-RECALC, FEAT-PRC-DELETE) |
| `ERR-INV-030` | 🔴 ERROR | `INLINE_FORM` | Business | Tồn kho âm — mã không thể chạy giá do xuất vượt tồn | Negative stock — this item cannot be costed because deliveries exceed available stock | Highlight mã lỗi | 400 | BR-PRC-007 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/DETAIL/RECALC) |
| `ERR-INV-031` | 🟡 WARNING | `INLINE_WARNING` | Business | Lệch hạch toán — mã không thể chạy giá [MỞ RỘNG TƯƠNG LAI] | Accounting mismatch — this item cannot be costed [FUTURE EXTENSION] | Highlight mã lỗi | 400 | BR-PRC-007 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/DETAIL/RECALC) |
| `ERR-INV-032` | 🔴 ERROR | `INLINE_FORM` | Validation | Số lượng tồn phải lớn hơn 0 | Opening balance quantity must be greater than 0 | Highlight dòng lỗi | 400 | BR-OB-008 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-033` | 🔴 ERROR | `INLINE_FORM` | Validation | Giá trị tồn không được nhỏ hơn 0 | Opening balance value cannot be less than 0 | Highlight dòng lỗi | 400 | BR-OB-009 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-034` | 🔴 ERROR | `INLINE_FORM` | Validation | Tồn đầu kỳ đã tồn tại cho (mã + kho) này — mỗi (mã + kho) chỉ có một tồn đầu kỳ | Opening balance already exists for this product and warehouse — each product and warehouse can have only one opening balance | Highlight dòng trùng | 400 | BR-OB-012 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-035` | 🔴 ERROR | `INLINE_FORM` | Business | Tồn đầu kỳ phải là điểm khởi đầu — "Tồn đến ngày" phải trước ngày phiếu đã ghi sổ sớm nhất | Opening balance must be the starting point — the stock as-of date must be before the earliest posted document date | Highlight dòng lỗi | 400 | BR-OB-016 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-036` | 🔴 ERROR | `INLINE_FORM` | Business | Không cho phép tồn âm — thao tác làm tồn kho xuống dưới 0 tại một thời điểm | Negative stock is not allowed — this action would make inventory fall below 0 at a point in time | Highlight dòng/phiếu lỗi | 400 | BR-IRV2-008 / BR-IDV2-004 / BR-OB-015 / BR-OB-DEL-003 | EP-INVENTORY-RECEIPT-V2 / DELIVERY-V2 / OPENING-BALANCE |
| `ERR-INV-037` | 🔴 ERROR | `INLINE_FORM` | Business | Không đủ tồn để xuất | Not enough stock to deliver | Highlight dòng vượt tồn | 400 | BR-IDV2-004 | EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/DETAIL-V2/EDIT-V2/DELETE) |
| `ERR-INV-038` | 🔴 ERROR | `INLINE_FORM` | Business | Phiếu nhập có ngày chứng từ trước/cùng "Tồn đến ngày" của tồn đầu kỳ — không hợp lệ | The receipt document date is before or equal to the opening balance stock as-of date — invalid | Highlight ô Ngày chứng từ | 400 | BR-IRV2-030 | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2/EDIT-V2) |
| `ERR-INV-039` | 🟡 WARNING | `INLINE_WARNING` | Business | Lệch số lượng/sản phẩm so với phiếu dịch vụ (SO) — kiểm tra lại (vẫn cho ghi sổ) | Quantity/product mismatch with the service order (SO) — please review (posting is still allowed) | Highlight dòng lệch | 400 | BR-IDV2-009 | EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/DETAIL-V2) *(legacy v10 semantic — pre-2-step commit)* |
| `ERR-INV-039-RECONCILIATION-WARNING` | 🟡 WARNING | `DIALOG` | Business | Cảnh báo lệch số lượng đơn hàng dịch vụ. Bạn có muốn tiếp tục ghi sổ không? | Service order quantity mismatch warning. Do you want to continue posting? | Nút: [Đóng] / [Vẫn Ghi sổ] | 409 | BR-IDV2-009 v40 (case C3) | EP-INVENTORY-DELIVERY-V2 (FEAT-ID-DETAIL-V2 AC-5) — `postDeliveryV2` case C3 SO reconciliation compare finds lệch SL. BA authorize Option A split 2026-07-16 tối (Plan mode Q1) — preserve legacy `ERR-INV-039` HTTP 400 verbatim để zero-break existing consumer; add discriminator suffix align SDL v7.72. NO commit; client set `overrideWarnings=false` → cancel HOẶC `overrideWarnings=true` re-call → BE commit (case C5). Producer: gf-inventory. Consumer: BFF pass-through 409 top-level + FE (web/mobile) popup handler verbatim. |
| `ERR-INV-040` | 🔴 ERROR | `INLINE_FORM` | Business | Số lượng trả vượt quá số lượng của phiếu gốc (đã xuất / đã nhập) — không hợp lệ | Return quantity exceeds the original document quantity (delivered/received) — invalid | Highlight ô Số lượng | 400 | BR-IRV2-032 / BR-IDV2-031 | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2/EDIT-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/EDIT-V2) |
| `ERR-INV-041` | 🔴 ERROR | `INLINE_FORM` | Validation | Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần | More than 500 import rows — please split the file into multiple imports | Thông báo banner: tách file | 400 | BR-CAT-PROD-020 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT) |
| `ERR-INV-042` | 🔴 ERROR | `INLINE_FORM` | Validation | ĐVT trong file không khớp danh mục đơn vị tính | The unit in the file does not match the unit catalog | Highlight dòng lỗi | 400 | BR-CAT-PROD-021 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT) |
| `ERR-INV-043` | 🔴 ERROR | `INLINE_FORM` | Validation | Nhóm vật tư/hàng hóa trong file không tồn tại hoặc đang ngừng hoạt động | The material/product group in the file does not exist or is inactive | Highlight dòng lỗi | 400 | BR-CAT-PROD-022 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT) |
| `ERR-INV-044` | 🔴 ERROR | `INLINE_FORM` | Validation | Xuất xứ trong file không khớp danh mục xuất xứ | The origin in the file does not match the origin catalog | Highlight dòng lỗi | 400 | BR-CAT-PROD-023 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT) |
| `ERR-INV-045` | 🔴 ERROR | `DIALOG` | Validation | Kết quả vượt 1.000 mục — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại | More than 1,000 results — apply filters to narrow the scope and export again | Dialog cảnh báo + gợi ý áp lọc | 400 | BR-CAT-PROD-024 / BR-IRV2-020 / BR-IDV2-020 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-EXPORT) · EP-INVENTORY-RECEIPT-V2 (FEAT-IR-EXPORT) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-EXPORT) |
| `ERR-INV-046` | 🔴 ERROR | `INLINE_FIELD` | Validation | Mô tả / Ghi chú vượt quá 500 ký tự | Description/note exceeds 500 characters | Highlight ô Mô tả / Ghi chú | 400 | BR-CAT-PROD-025 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT) |
| `ERR-INV-047` | 🔴 ERROR | `INLINE_FIELD` | Validation | Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy | Conversion rate cannot have more than 6 decimal places | Highlight dòng ĐVT quy đổi | 400 | BR-CAT-PROD-011 | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/DETAIL) · EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2) |
| `ERR-INV-048` | 🔴 ERROR | `INLINE_FORM` | Validation | Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần | More than 500 opening balance import rows — please split the file into multiple imports | Thông báo banner: tách file | 400 | BR-OB-004b | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT) |
| `ERR-INV-049` | 🔴 ERROR | `DIALOG` | Business | Không thể xóa phiếu — đã có {N} phiếu trả tham chiếu: {danh sách mã}. Vui lòng xóa các phiếu trả trước | Cannot delete the slip — it is referenced by {N} return slip(s): {danh sách mã}. Please delete the return slips first | Dialog liệt kê mã phiếu con | 400 | BR-IRV2-035 / BR-IDV2-034 | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-DELETE) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-DELETE) |
| `ERR-INV-050` | 🔴 ERROR | `DIALOG` | Business | V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2 | The V1 endpoint has been disabled for tenants with V2 enabled — please use V2 | Dialog + redirect V2 | 410 | EP-INVENTORY-RECEIPT-V2 §5.2 / EP-INVENTORY-DELIVERY-V2 §5.2 / EP-INVENTORY-STOCK-V2 §5.2 (V1 Module Hide) | EP-INVENTORY-RECEIPT-V2 / EP-INVENTORY-DELIVERY-V2 / EP-INVENTORY-STOCK-V2 (V1 controllers `@FeatureOff("Inventory:InventoryV2")`) |
| `ERR-INV-051` | 🔴 ERROR | `INLINE_FORM` | System | Đang có thao tác tính giá khác xử lý cùng dữ liệu tồn kho — vui lòng thử lại sau | Another costing operation is currently processing the same inventory data — please try again later | Highlight mã lỗi (tương tự ERR-INV-052) | 409 | BR-STKV2-005a (recompute engine ordered-lock cross-key) / ADR-020 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/RECALC, qua gf-inventory `W06-P5 bulk-recompute` lock timeout) |
| `ERR-INV-052` | 🔴 ERROR | `INLINE_FORM` | System | Chưa kịp tính do lần chạy trước bị gián đoạn (sự cố hệ thống) — vui lòng bấm "Tính lại mã lỗi" hoặc "Tính lại toàn bộ" để tính lại | Not costed in time because the previous run was interrupted (system issue) — please click "Re-cost error items" or "Re-cost all" to run costing again | Highlight mã lỗi | 400 | BR-PRC-007 / BR-PRC-014 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/DETAIL/RECALC) |
| `ERR-INV-053` | 🔴 ERROR | `INLINE_FIELD` | Validation | Số phiếu không hợp lệ | The document number is invalid | Highlight ô Số phiếu | 400 | TBD — Receipt/Delivery document number validation | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2/EDIT-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/EDIT-V2) |
| `ERR-INV-054` | 🔴 ERROR | `INLINE_FIELD` | Validation | Số phiếu đã tồn tại | The document number already exists | Highlight ô Số phiếu | 400 | TBD — Receipt/Delivery document number uniqueness | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2/EDIT-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/EDIT-V2) |

---

## 4a. Registry — HRMS (`ERR-HRMS-*`)

> **Status: ✅ ACTIVE** — Cutover 2026-07-15 (W05 pre-stage, BA + Architect co-sign per user bachho decision, unblock ADR-025 ratify).
>
> Nhóm mã dùng chung khi **domain khác** (VD `gf-inventory` W05 slip Create/Edit) gọi `gf-hrms` để validate staff eligibility → HRMS trả về mã nghiệp vụ. Cho phép **descriptive suffix** (VD `STAFF-NOT-ELIGIBLE`) thay số thứ tự khi ngữ nghĩa cần rõ + tập hợp nhỏ.

| Mã | Loại | Hiển thị | Category | Message (VI) | Message (EN) | Action kèm | HTTP | Rule ref | Dùng tại (FEAT) |
|---|---|---|---|---|---|---|---|---|---|
| `ERR-HRMS-STAFF-NOT-ELIGIBLE` | 🔴 ERROR | `INLINE_FIELD` | Business | Nhân sự chưa được cấp SSO, không thể chọn làm người phụ trách | The staff member has not been granted SSO access and cannot be selected as the person in charge | Highlight ô "Người phụ trách" + xoá lựa chọn | 400 | ADR-025 §Decision (staff eligibility: `iam_user_id IS NOT NULL AND sso_status IN {PROVISIONING,ACTIVE,DISABLED,FAILED} AND employment_status = 'ACTIVE'`) | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2) — BE `gf-inventory` gọi `gf-hrms GET /api/v1/employees/by-iam/{iamUserId}` fail-CLOSED per ADR-025 |

---

## 5. Tổng hợp

| Nhóm | Số mã | 🔴 ERROR | 🟡 WARNING | 🔵 INFO |
|---|---|---|---|---|
| Common (`ERR-CMN-*`) | 13 | 11 | 1 | 1 |
| Riêng (`ERR-INS-*`) | 9 | 7 | 1 | 1 |
| Inventory V2 (`ERR-INV-*`) | 55 | 52 | 3 | 0 |
| HRMS (`ERR-HRMS-*`) | 1 | 1 | 0 | 0 |
| **Tổng** | **78** | **71** | **5** | **2** |

**Theo hình thức hiển thị (toàn bộ registry, tổng 78)**: `INLINE_FIELD` ×25 · `INLINE_FORM` ×26 · `INLINE_WARNING` ×3 · `TOAST` ×8 · `DIALOG` ×14 · `EMPTY_STATE` ×2.

---

## 6. Machine-readable registry (BE/FE đồng bộ)

> Block dưới là **nguồn sinh code**: BE generate enum/constants, FE/mobile generate i18n map + display handler. Giữ đồng bộ `message_vi` / `message_en` với bảng §2–§4a.

```yaml
errorCodes:
  # ---- Common (reusable) ----
  - code: ERR-CMN-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Số tiền vượt quá số lượng cho phép"
    message_en: "Amount exceeds the allowed quantity"
    action: null
    http: 400
    rule: VLD-INS-SO-004
  - code: ERR-CMN-002
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Chiết khấu không thể lớn hơn 100%"
    message_en: "Discount cannot be greater than 100%"
    action: null
    http: 400
    rule: VLD-INS-SO-003
  - code: ERR-CMN-003
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Khấu hao không thể lớn hơn 100%"
    message_en: "Depreciation cannot be greater than 100%"
    action: null
    http: 400
    rule: VLD-INS-SO-003
  - code: ERR-CMN-004
    severity: ERROR
    display: INLINE_FIELD
    category: file
    common: true
    message_vi: "File quá lớn (tối đa {XX}MB)"
    message_en: "File is too large (maximum {XX}MB)"
    action: null
    http: 413
    rule: null
  - code: ERR-CMN-005
    severity: ERROR
    display: INLINE_FIELD
    category: file
    common: true
    message_vi: "Định dạng không hỗ trợ — chỉ chấp nhận PDF, JPG, PNG, DOC, XLSX"
    message_en: "Unsupported file format — only PDF, JPG, PNG, DOC, and XLSX are accepted"
    action: null
    http: 415
    rule: null
  - code: ERR-CMN-006
    severity: ERROR
    display: TOAST
    category: system
    common: true
    message_vi: "Không tải lên được file — vui lòng thử lại"
    message_en: "File upload failed — please try again"
    action: "retry"
    http: 502
    rule: null
  - code: ERR-CMN-007
    severity: ERROR
    display: TOAST
    category: system
    common: true
    message_vi: "Hệ thống đang bận, vui lòng thử lại sau"
    message_en: "The system is busy. Please try again later"
    action: null
    http: 503
    rule: null
  - code: ERR-CMN-007-DEGRADED
    severity: WARNING
    display: DIALOG
    category: business
    common: false
    message_vi: "Không kết nối được hệ thống đơn hàng để đối soát. Bạn có muốn tiếp tục ghi sổ không?"
    message_en: "The order system cannot be reached for reconciliation. Do you want to continue posting?"
    action: "popup:[Đóng]|[Vẫn Ghi sổ]"
    http: 409
    rule: "BR-IDV2-009-v40-case-C4"
    trigger: "gf-sales down/timeout/5xx trong postDeliveryV2 reconciliation lookup — fail-CLOSED per ADR-024 D5 v6 + ADR-026 v2"
    producers: "gf-inventory postDeliveryV2 (case C4)"
    consumers: "BFF pass-through 409 top-level + FE (web/mobile) popup handler"
    ba_authorize: "user sonhoang Delivery Authority Plan mode Q2 2026-07-16 tối"
  - code: ERR-CMN-008
    severity: ERROR
    display: DIALOG
    category: system
    common: true
    message_vi: "Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại"
    message_en: "This data was updated by someone else — please reload"
    action: "reload"
    http: 409
    rule: null
  - code: ERR-CMN-009
    severity: ERROR
    display: TOAST
    category: business
    common: true
    message_vi: "Phiếu dịch vụ chưa hoàn thành"
    message_en: "The service order is not completed"
    action: null
    http: 409
    rule: VLD-INS-STL-004
  - code: ERR-CMN-010
    severity: INFO
    display: EMPTY_STATE
    category: empty-state
    common: true
    message_vi: "Không có kết quả phù hợp"
    message_en: "No matching results"
    action: null
    http: 200
    rule: null
  - code: ERR-CMN-validation
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Dữ liệu không hợp lệ"
    message_en: "Invalid request data"
    action: null
    http: 400
    rule: null
    note: "Generic 400 fallback — dùng khi không có mã validation nghiệp vụ cụ thể hơn. Symbolic code (không đánh số) theo convention de-facto platform-wide; ratified CR-20260801-07."
  - code: ERR-CMN-not-found
    severity: ERROR
    display: TOAST
    category: business
    common: true
    message_vi: "Không tìm thấy dữ liệu"
    message_en: "Resource not found"
    action: null
    http: 404
    rule: null
    note: "Generic 404 — bao gồm tenant-mismatch và soft-deleted, trả 404 để không leak existence cross-tenant (CR-20260801-02). Symbolic code; ratified CR-20260801-07."
  # ---- Insurance-Settlement (domain-specific) ----
  - code: ERR-INS-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Vui lòng chọn công ty bảo hiểm"
    message_en: "Please select an insurance company"
    action: null
    http: 400
    rule: VLD-INS-SO-002
  - code: ERR-INS-002
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm"
    message_en: "Please select the insurance company on the service order before creating an insurance settlement"
    action: "nav:service-order"
    http: 409
    rule: VLD-INS-STL-002
  - code: ERR-INS-003
    severity: WARNING
    display: INLINE_WARNING
    category: business
    common: false
    message_vi: "Bảo hiểm thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh"
    message_en: "Insurance payment cannot be negative — please review the adjustments"
    action: "highlight:adjustments"
    http: 200
    rule: VLD-INS-SO-005
  - code: ERR-INS-004
    severity: ERROR
    display: TOAST
    category: business
    common: false
    message_vi: "Phiếu dịch vụ không có hạng mục thuộc bảo hiểm"
    message_en: "The service order has no insurance-covered items"
    action: null
    http: 409
    rule: VLD-INS-STL-001
  - code: ERR-INS-005
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Đã tồn tại phiếu quyết toán bảo hiểm cho phiếu dịch vụ này"
    message_en: "An insurance settlement already exists for this service order"
    action: "nav:existing-settlement"
    http: 409
    rule: VLD-INS-STL-003
  - code: ERR-INS-007
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Vui lòng hoàn tất các tài liệu còn thiếu"
    message_en: "Please complete the missing documents"
    action: "highlight:missing-docs"
    http: 400
    rule: VLD-INS-DOSSIER-003
  - code: ERR-INS-008
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Không tạo được PDF hồ sơ — vui lòng thử lại"
    message_en: "Could not generate the dossier PDF — please try again"
    action: "retry"
    http: 500
    rule: null
  - code: ERR-INS-009
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Không tải được hồ sơ — vui lòng liên hệ quản trị"
    message_en: "Could not load the dossier — please contact an administrator"
    action: null
    http: 500
    rule: null
  - code: ERR-INS-010
    severity: INFO
    display: EMPTY_STATE
    category: empty-state
    common: false
    message_vi: "Chưa có hồ sơ nào được xuất"
    message_en: "No dossier has been exported yet"
    action: null
    http: null
    rule: null
  # ---- Inventory V2 (ERR-INV-*) ACTIVE ----
  - code: ERR-INV-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã nhóm vật tư hàng hóa không hợp lệ — không được chứa ký tự đặc biệt"
    message_en: "The material group code is invalid — special characters are not allowed"
    action: "highlight:ma-nhom"
    http: 400
    rule: BR-CAT-GRP-002
  - code: ERR-INV-002
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã nhóm vật tư hàng hóa đã tồn tại"
    message_en: "The material group code already exists"
    action: "highlight:ma-nhom"
    http: 400
    rule: BR-CAT-GRP-003
  - code: ERR-INV-003
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Không thể chuyển nhóm vào chính nó hoặc nhóm con của nó (tránh vòng lặp phân cấp)"
    message_en: "Cannot move a group into itself or one of its child groups (prevents hierarchy loops)"
    action: "highlight:thuoc-nhom"
    http: 400
    rule: BR-CAT-GRP-009
  - code: ERR-INV-004
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — nhóm đã phát sinh mã sản phẩm nội bộ"
    message_en: "Cannot delete — the group already has internal products"
    action: null
    http: 400
    rule: BR-CAT-GRP-010
  - code: ERR-INV-005
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — nhóm cha còn nhóm con, phải xóa hết nhóm con trước"
    message_en: "Cannot delete — the parent group still has child groups. Delete all child groups first"
    action: null
    http: 400
    rule: BR-CAT-GRP-011
  - code: ERR-INV-006
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã sản phẩm nội bộ không hợp lệ — không được chứa ký tự đặc biệt"
    message_en: "The internal product code is invalid — special characters are not allowed"
    action: "highlight:ma-noi-bo"
    http: 400
    rule: BR-CAT-PROD-002
  - code: ERR-INV-007
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã sản phẩm nội bộ đã tồn tại"
    message_en: "The internal product code already exists"
    action: "highlight:ma-noi-bo"
    http: 400
    rule: BR-CAT-PROD-003
  - code: ERR-INV-008
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — mã sản phẩm đã phát sinh dữ liệu sử dụng (phiếu nhập/xuất hoặc tồn kho)"
    message_en: "Cannot delete — the product already has usage data (receipts, deliveries, or stock)"
    action: null
    http: 400
    rule: BR-CAT-PROD-016
  - code: ERR-INV-009
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Mã sản phẩm nội bộ không tồn tại trong garage"
    message_en: "The internal product does not exist in this garage"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-006
  - code: ERR-INV-010
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Mã sản phẩm nội bộ đang ở trạng thái \"Ngừng hoạt động\""
    message_en: "The internal product is in \"Inactive\" status"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-007
  - code: ERR-INV-011
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Phải có mã sản phẩm nội bộ ở mọi dòng trước khi ghi sổ kho"
    message_en: "Every line must have an internal product before posting stock"
    action: "highlight:dong-thieu-ma"
    http: 400
    rule: BR-IRV2-028  # multi-source: cũng map BR-IDV2-028 (xem bảng §4)
  - code: ERR-INV-012
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Tính chất sản phẩm không hợp lệ — chỉ chọn từ danh sách cố định"
    message_en: "Invalid product nature — select only from the fixed list"
    action: "highlight:tinh-chat"
    http: 400
    rule: BR-CAT-PROD-019
  - code: ERR-INV-013
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Tỷ lệ quy đổi phải lớn hơn 0"
    message_en: "The conversion rate must be greater than 0"
    action: "highlight:dvt-quy-doi"
    http: 400
    rule: BR-CAT-PROD-011
  - code: ERR-INV-014
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "ĐVT quy đổi bị trùng trong cùng mã sản phẩm"
    message_en: "The conversion unit is duplicated within the same product"
    action: "highlight:dvt-quy-doi"
    http: 400
    rule: BR-CAT-PROD-011
  - code: ERR-INV-015
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã SKU đã được gắn cho một mã sản phẩm nội bộ khác"
    message_en: "This SKU has already been linked to another internal product"
    action: "highlight:chon-sku"
    http: 400
    rule: BR-CAT-PROD-013
  - code: ERR-INV-016
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mô tả vượt quá 255 ký tự"
    message_en: "Description exceeds 255 characters"
    action: "highlight:mo-ta"
    http: 400
    rule: BR-CAT-GRP-012
  - code: ERR-INV-017
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Thiếu trường bắt buộc"
    message_en: "Required field is missing"
    action: "highlight:dong-thieu"
    http: 400
    rule: BR-OB-011
  - code: ERR-INV-018
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Sai định dạng ngày (\"Tồn đến ngày\")"
    message_en: "Invalid date format (\"Stock as-of date\")"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-011
  - code: ERR-INV-019
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "ĐVT trong file không khớp ĐVT chính của mã sản phẩm"
    message_en: "The unit in the file does not match the product's base unit"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-010
  - code: ERR-INV-020
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Kho không tồn tại trong danh mục kho của garage"
    message_en: "Warehouse does not exist in this garage's warehouse catalog"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-005
  - code: ERR-INV-021
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
    message_en: "End date must be greater than or equal to start date"
    action: "highlight:ngay"
    http: 400
    rule: BR-AP-006
  - code: ERR-INV-022
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Khoảng ngày của kỳ con phải nằm trong khoảng ngày của kỳ cha"
    message_en: "The child period date range must be within the parent period date range"
    action: "highlight:ngay"
    http: 400
    rule: BR-AP-007
  - code: ERR-INV-023
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Khoảng ngày bị chồng lấn với kỳ cùng cấp trong cùng kỳ cha"
    message_en: "The date range overlaps another period at the same level under the same parent"
    action: "highlight:ngay"
    http: 400
    rule: BR-AP-008
  - code: ERR-INV-024
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Kỳ kế toán đã đóng — Bạn không thể thực hiện mọi thao tác thuộc kỳ này"
    message_en: "The accounting period is closed — You cannot perform any operations in this period"
    action: null
    http: 400
    rule: BR-AP-012  # multi-source: cũng map BR-OB-013 / BR-OB-DEL-002 / BR-IRV2-007 / BR-IDV2-007 / BR-PRC-008 / BR-PRC-011 (xem bảng §4)
  - code: ERR-INV-025
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa kỳ kế toán — kỳ đã đóng hoặc đã phát sinh dữ liệu kho liên quan"
    message_en: "Cannot delete the accounting period — it is closed or already has related inventory data"
    action: null
    http: 400
    rule: BR-AP-013
  - code: ERR-INV-026
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — kỳ cha còn kỳ con, phải xóa hết kỳ con trước"
    message_en: "Cannot delete — the parent period still has child periods. Delete all child periods first"
    action: null
    http: 400
    rule: BR-AP-014
  - code: ERR-INV-027
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Tính giá xuất kho thất bại — vui lòng thử lại"
    message_en: "Inventory costing failed — please try again"
    action: "retry"
    http: 400
    rule: BR-PRC-007  # deprecated — thay bằng ERR-INV-030/031/052
  - code: ERR-INV-028
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Kỳ trước chưa được tính giá"
    message_en: "The previous period has not been costed"
    action: null
    http: 400
    rule: BR-PRC-006  # deprecated — đã bỏ chặn tuần tự
  - code: ERR-INV-029
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất"
    message_en: "A costing run is already in progress for this period and warehouse — please wait until it completes"
    action: null
    http: 400
    rule: BR-PRC-016
  - code: ERR-INV-030
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Tồn kho âm — mã không thể chạy giá do xuất vượt tồn"
    message_en: "Negative stock — this item cannot be costed because deliveries exceed available stock"
    action: "highlight:ma-loi"
    http: 400
    rule: BR-PRC-007
  - code: ERR-INV-031
    severity: WARNING
    display: INLINE_WARNING
    category: business
    common: false
    message_vi: "Lệch hạch toán — mã không thể chạy giá [MỞ RỘNG TƯƠNG LAI]"
    message_en: "Accounting mismatch — this item cannot be costed [FUTURE EXTENSION]"
    action: "highlight:ma-loi"
    http: 400
    rule: BR-PRC-007
  - code: ERR-INV-032
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Số lượng tồn phải lớn hơn 0"
    message_en: "Opening balance quantity must be greater than 0"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-008
  - code: ERR-INV-033
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Giá trị tồn không được nhỏ hơn 0"
    message_en: "Opening balance value cannot be less than 0"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-009
  - code: ERR-INV-034
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Tồn đầu kỳ đã tồn tại cho (mã + kho) này — mỗi (mã + kho) chỉ có một tồn đầu kỳ"
    message_en: "Opening balance already exists for this product and warehouse — each product and warehouse can have only one opening balance"
    action: "highlight:dong-trung"
    http: 400
    rule: BR-OB-012
  - code: ERR-INV-035
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Tồn đầu kỳ phải là điểm khởi đầu — \"Tồn đến ngày\" phải trước ngày phiếu đã ghi sổ sớm nhất"
    message_en: "Opening balance must be the starting point — the stock as-of date must be before the earliest posted document date"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-016
  - code: ERR-INV-036
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Không cho phép tồn âm — thao tác làm tồn kho xuống dưới 0 tại một thời điểm"
    message_en: "Negative stock is not allowed — this action would make inventory fall below 0 at a point in time"
    action: "highlight:dong-phieu-loi"
    http: 400
    rule: BR-IRV2-008  # multi-source: cũng map BR-IDV2-004 / BR-OB-015 / BR-OB-DEL-003 (xem bảng §4)
  - code: ERR-INV-037
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Không đủ tồn để xuất"
    message_en: "Not enough stock to deliver"
    action: "highlight:dong-vuot-ton"
    http: 400
    rule: BR-IDV2-004
  - code: ERR-INV-038
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Phiếu nhập có ngày chứng từ trước/cùng \"Tồn đến ngày\" của tồn đầu kỳ — không hợp lệ"
    message_en: "The receipt document date is before or equal to the opening balance stock as-of date — invalid"
    action: "highlight:ngay-chung-tu"
    http: 400
    rule: BR-IRV2-030
  - code: ERR-INV-039
    severity: WARNING
    display: INLINE_WARNING
    category: business
    common: false
    message_vi: "Lệch số lượng/sản phẩm so với phiếu dịch vụ (SO) — kiểm tra lại (vẫn cho ghi sổ)"
    message_en: "Quantity/product mismatch with the service order (SO) — please review (posting is still allowed)"
    action: "highlight:dong-lech"
    http: 400
    rule: BR-IDV2-009
    note: "Legacy v10 semantic (pre-2-step commit). Preserved per BA authorize Option A split 2026-07-16 tối để zero-break existing consumer. New semantic tại ERR-INV-039-RECONCILIATION-WARNING."
  - code: ERR-INV-039-RECONCILIATION-WARNING
    severity: WARNING
    display: DIALOG
    category: business
    common: false
    message_vi: "Cảnh báo lệch số lượng đơn hàng dịch vụ. Bạn có muốn tiếp tục ghi sổ không?"
    message_en: "Service order quantity mismatch warning. Do you want to continue posting?"
    action: "popup:[Đóng]|[Vẫn Ghi sổ]"
    http: 409
    rule: "BR-IDV2-009-v40-case-C3"
    trigger: "gf-sales SO reconciliation compare finds lệch SL — case C3 per ADR-024 D5 v6 + ADR-026 v2"
    producers: "gf-inventory postDeliveryV2 (case C3)"
    consumers: "BFF pass-through 409 top-level + FE (web/mobile) popup handler verbatim"
    ba_authorize: "user sonhoang Delivery Authority Plan mode Q1 Option A split 2026-07-16 tối"
    override_semantic: "client set overrideWarnings=false → cancel; overrideWarnings=true re-call → BE commit case C5"
  - code: ERR-INV-040
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Số lượng trả vượt quá số lượng của phiếu gốc (đã xuất / đã nhập) — không hợp lệ"
    message_en: "Return quantity exceeds the original document quantity (delivered/received) — invalid"
    action: "highlight:so-luong"
    http: 400
    rule: BR-IRV2-032, BR-IDV2-031
  - code: ERR-INV-041
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần"
    message_en: "More than 500 import rows — please split the file into multiple imports"
    action: "banner:tach-file"
    http: 400
    rule: BR-CAT-PROD-020
  - code: ERR-INV-042
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "ĐVT trong file không khớp danh mục đơn vị tính"
    message_en: "The unit in the file does not match the unit catalog"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-CAT-PROD-021
  - code: ERR-INV-043
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Nhóm vật tư/hàng hóa trong file không tồn tại hoặc đang ngừng hoạt động"
    message_en: "The material/product group in the file does not exist or is inactive"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-CAT-PROD-022
  - code: ERR-INV-044
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Xuất xứ trong file không khớp danh mục xuất xứ"
    message_en: "The origin in the file does not match the origin catalog"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-CAT-PROD-023
  - code: ERR-INV-045
    severity: ERROR
    display: DIALOG
    category: validation
    common: false
    message_vi: "Kết quả vượt 1.000 mục — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"
    message_en: "More than 1,000 results — apply filters to narrow the scope and export again"
    action: "dialog:apply-filter"
    http: 400
    rule: BR-CAT-PROD-024 / BR-IRV2-020 / BR-IDV2-020
  - code: ERR-INV-046
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mô tả / Ghi chú vượt quá 500 ký tự"
    message_en: "Description/note exceeds 500 characters"
    action: "highlight:o-mo-ta-ghi-chu"
    http: 400
    rule: BR-CAT-PROD-025
  - code: ERR-INV-047
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy"
    message_en: "Conversion rate cannot have more than 6 decimal places"
    action: "highlight:dvt-quy-doi"
    http: 400
    rule: BR-CAT-PROD-011
  - code: ERR-INV-048
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần"
    message_en: "More than 500 opening balance import rows — please split the file into multiple imports"
    action: "banner:tach-file"
    http: 400
    rule: BR-OB-004b
  - code: ERR-INV-049
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa phiếu — đã có {N} phiếu trả tham chiếu: {danh sách mã}. Vui lòng xóa các phiếu trả trước"
    message_en: "Cannot delete the slip — it is referenced by {N} return slip(s): {danh sách mã}. Please delete the return slips first"
    action: "dialog:list-phieu-con"
    http: 400
    rule: BR-IRV2-035 / BR-IDV2-034
  - code: ERR-INV-050
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2"
    message_en: "The V1 endpoint has been disabled for tenants with V2 enabled — please use V2"
    action: "dialog:redirect-v2"
    http: 410
    rule: EP-INVENTORY-RECEIPT-V2 §5.2 / EP-INVENTORY-DELIVERY-V2 §5.2 / EP-INVENTORY-STOCK-V2 §5.2 (V1 Module Hide)
  - code: ERR-INV-051
    severity: ERROR
    display: INLINE_FORM
    category: system
    common: false
    message_vi: "Đang có thao tác tính giá khác xử lý cùng dữ liệu tồn kho — vui lòng thử lại sau"
    message_en: "Another costing operation is currently processing the same inventory data — please try again later"
    action: "highlight:ma-loi"
    http: 409
    rule: BR-STKV2-005a / ADR-020
  - code: ERR-INV-052
    severity: ERROR
    display: INLINE_FORM
    category: system
    common: false
    message_vi: "Chưa kịp tính do lần chạy trước bị gián đoạn (sự cố hệ thống) — vui lòng bấm \"Tính lại mã lỗi\" hoặc \"Tính lại toàn bộ\" để tính lại"
    message_en: "Not costed in time because the previous run was interrupted (system issue) — please click \"Re-cost error items\" or \"Re-cost all\" to run costing again"
    action: "highlight:ma-loi"
    http: 400
    rule: BR-PRC-007 / BR-PRC-014
  - code: ERR-INV-053
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Số phiếu không hợp lệ"
    message_en: "The document number is invalid"
    action: "highlight:so-phieu"
    http: 400
    rule: TBD-RECEIPT-DELIVERY-DOCUMENT-NUMBER-VALIDATION
  - code: ERR-INV-054
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Số phiếu đã tồn tại"
    message_en: "The document number already exists"
    action: "highlight:so-phieu"
    http: 400
    rule: TBD-RECEIPT-DELIVERY-DOCUMENT-NUMBER-UNIQUENESS
  # ---- HRMS ----
  - code: ERR-HRMS-STAFF-NOT-ELIGIBLE
    severity: ERROR
    display: INLINE_FIELD
    category: business
    common: false
    message_vi: "Nhân sự chưa được cấp SSO, không thể chọn làm người phụ trách"
    message_en: "The staff member has not been granted SSO access and cannot be selected as the person in charge"
    action: "highlight:nguoi-phu-trach;clear-selection"
    http: 400
    rule: ADR-025 §Decision (staff eligibility Cognito iamUserId)
```

---

## 7. Open Questions (NEED CONFIRMATION)

1. **HTTP status** ở cột "HTTP" là đề xuất — Architect chốt khi spawn dev (đặc biệt `ERR-INS-003` WARNING: BE trả 200 + warning trong body hay header?).
2. **Phạm vi Common**: `ERR-CMN-002/003` (chiết khấu/khấu hao) hiện gắn từ ngữ cụ thể — nếu sau này nhiều màn cần, có thể gom thành 1 message generic "Giá trị phần trăm không được lớn hơn 100%". Chờ BA/Architect xác nhận.
3. **Display cho guard nghiệp vụ** (`ERR-INS-002/004/005`): đang đề xuất DIALOG/TOAST dựa theo "Hành động đề xuất" trong UX-FLOW §8.1 — FE/UX chốt cuối khi prefetch Figma oracle.
4. Registry này hiện chỉ phủ **EP-INSURANCE-SETTLEMENT**. Khi mở rộng toàn platform → tách file theo domain hoặc giữ 1 file tập trung.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-02 | 34 | Business Authority (CR batch W06 gf-accounting, approver sonhoang) | **CR-20260801-07 (MINOR, APPROVED) — đăng ký 2 mã Common symbolic đã là convention de-facto platform-wide** (`GAP-W06-GAC-07`). Root cause: `ERR-CMN-validation` (generic 400) và `ERR-CMN-not-found` (generic 404) được dùng trong ≥20 file `Architecture/`+`Execution/` (gồm `gf-inventory-api.md`, `gf-accounting-api.md` 9 hit, `agg-garage-graph-graphql.md`, `ADR-022`, 6 `_IMPLEMENTATION-CHECKLIST-*`, TC-W03/W04-API và spec auto-test đang chạy `Execution/auto/specs/W04/api/*.spec.ts`) nhưng **không tồn tại** trong registry — registry chỉ có `ERR-CMN-001..010` + `007-DEGRADED`. Đã rà toàn bộ §2: không mã nào map được (`001/002/003` là validation nghiệp vụ cụ thể; `004/005/006` File; `007` System busy; `008` concurrency; `009` business SO; `010` là INFO `EMPTY_STATE`, không phải 404 resource-not-found — ép vào sẽ sai cả severity lẫn presentation). Thêm: `ERR-CMN-validation` (🔴 ERROR · `INLINE_FIELD` · Validation · 400 · "Dữ liệu không hợp lệ"/"Invalid request data" — fallback khi không có mã nghiệp vụ cụ thể hơn) và `ERR-CMN-not-found` (🔴 ERROR · `TOAST` · Business · 404 · "Không tìm thấy dữ liệu"/"Resource not found" — bao gồm tenant-mismatch + soft-deleted, trả 404 để không leak existence cross-tenant per `CR-20260801-02`). **Quyết định phụ**: giữ dạng **symbolic**, KHÔNG cấp số `ERR-CMN-011/012` — remap sẽ cascade ≥20 file gồm auto-test W04 đang chạy; §1.1 thêm blockquote ghi rõ ngoại lệ symbolic + hướng dẫn mã mới ưu tiên đánh số. §2 thêm 2 row; §5 Tổng hợp Common 11→13 (ERROR 9→11), Tổng 76→78 (ERROR 69→71), `INLINE_FIELD` 24→25, `TOAST` 7→8; §6 YAML thêm 2 block kèm field `note`. **KHÔNG đụng**: 5 exec spec W06 PRC (đang dùng đúng convention), mã `ERR-INV-*`/`ERR-INS-*`/`ERR-HRMS-*`. 33 → 34. |
| 2026-07-31 | 33 | Architecture Authority (`/warm-up gf-inventory` W06 Phase A, user sonhoang, GAP-W06-GI-11) | **Thêm `ERR-INV-051`** — lock timeout khi 2 thao tác tính giá cùng chạm dữ liệu tồn kho (`LockTimeoutException` từ `StockLedgerRecomputeService` ordered-lock cross-key, endpoint S2S `W06-P5 bulk-recompute`). 🔴 ERROR, `INLINE_FORM`, HTTP 409, category `system`, rule `BR-STKV2-005a / ADR-020`, dùng tại `EP-INVENTORY-ACCOUNTING-PERIOD` (FEAT-PRC-CREATE/RECALC). Mã này trước đây được cân nhắc cho 1 mục đích khác (HRMS staff eligibility, v24 2026-07-15) và bị từ chối/để trống — nay dùng đúng namespace Inventory cho use case lock timeout thật. §4 (chèn giữa 050/052) + §6 YAML thêm 051. §5 Tổng hợp: `ERR-INV` 54→55 (ERROR 51→52), Tổng 75→76 (ERROR 68→69), `INLINE_FORM` 25→26. Cascade: `Architecture/api/gf-inventory-api.md v75 §3f W06-P5` + `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md v3 §4.5`. |
| 2026-07-22 | 30 | Business Authority (user directive) | **Thêm 2 mã lỗi cho validate Số phiếu nhập/xuất editable** — `ERR-INV-053` (Số phiếu không hợp lệ) và `ERR-INV-054` (Số phiếu đã tồn tại), đều 🔴 ERROR, `INLINE_FIELD`, HTTP 400, dùng cho `FEAT-IR-CREATE/EDIT-V2` và `FEAT-ID-CREATE-V2/EDIT-V2`. Chỉ đăng ký mã lỗi theo user directive, **chưa cascade BR/FEAT/UX**; rule-ref để TBD cho batch tài liệu sau. §4 + §6 YAML thêm 053/054; §5 summary cập nhật tổng mã 73→75, Inventory 52→54, INLINE_FIELD 22→24. |
| 2026-07-24 | 31 | Business Authority (user directive) | **`ERR-INV-024` generic hoá message + add W06 PRC refs**. Message VI: "…không thể thêm/sửa/xóa/ghi sổ chứng từ…" → "**Bạn không thể thực hiện mọi thao tác thuộc kỳ này**" (cover mọi thao tác bị chặn khi kỳ đóng, không list use case cụ thể → future-proof cho W06 PRC + waves sau). Message EN đồng bộ. Rule ref thêm `BR-PRC-008` (chặn CREATE/RECALC tính giá kỳ đóng) + `BR-PRC-011` (chặn xóa log tính giá kỳ đóng). Code không đổi → BE/FE contract nguyên vẹn, chỉ cần rebuild FE để i18n bundle refresh. Resolve F4 của `agent-ba-review W06` (2026-07-24). |
| 2026-07-24 | 32 | Business Authority (backfill sync) | **Backfill khối YAML §6 (machine-readable, nguồn codegen BE/FE) cho `ERR-INV-024`** — v31 chỉ update bảng §4 (human-readable), quên đồng bộ khối YAML → nếu build ngay sau v31 thì app vẫn ship message VI/EN cũ (do YAML mới là nguồn codegen thực tế theo quy ước file §Mục đích). Đồng bộ `message_vi`/`message_en` verbatim khớp §4 dòng ERR-INV-024 + rule comment thêm BR-PRC-008/011. Resolve NF-01 của drift re-check W06 (2026-07-24). Architecture không đụng — chỉ nội bộ file registry. |
| 2026-07-21 | 29 | Business Authority (user directive) | **Thêm cột `Message (EN)` cho registry lỗi** — bổ sung bản dịch tiếng Anh cho các bảng `ERR-CMN-*`, `ERR-INS-*`, `ERR-INV-*`, `ERR-HRMS-*` để mobile có thông báo tiếng Anh. Đồng thời thêm field `message_en` vào block YAML machine-readable §6 để FE/mobile codegen/i18n consume trực tiếp, giữ song song `message_vi` / `message_en`. Không đổi mã lỗi, severity, display, HTTP, rule ref. Sửa stale summary §5 cho khớp actual registry hiện có: tổng 73 code (`message_vi`/`message_en` đều đủ 73). |
| 2026-07-21 | 28 | Business Authority (user directive) | **Cascade nốt PRC error enum sau `ERR-INV-052`** — deprecated note `ERR-INV-027` đổi **030/031 → 030/031/052**; `ERR-INV-031` usage thêm `FEAT-PRC-RECALC`; message `ERR-INV-052` nói đủ 2 hướng xử lý **"Tính lại mã lỗi"** hoặc **"Tính lại toàn bộ"** để khớp `FEAT-PRC-RECALC` AC-1/AC-1b và `BR-PRC-007/014/016`. Không đổi count / severity / display / HTTP. |
| 2026-07-20 | 27 | Business Authority (user sonhoang directive 2026-07-20) | **Thêm `ERR-INV-052` "Do sự cố hệ thống"** — cover edge case PRC job gián đoạn/hết retry (BR-PRC-016) khi có mã "chưa tới lượt tính". Trước đây `BR-PRC-007` chỉ có 2 lý do lỗi nghiệp vụ (Do tồn âm / Lệch hạch toán) — không có chỗ cho case hạ tầng. Quyết định: gộp chung vào enum lý do lỗi hiện có (không tạo trạng thái item riêng "Chưa tính") — đơn giản hóa, và mã "Do sự cố hệ thống" tự động được nút "Tính lại mã lỗi" (`FEAT-PRC-RECALC` AC-1b, scope `ERROR_ONLY`) cover luôn vì vẫn là trạng thái "Lỗi" trong bảng. 🔴 ERROR, `INLINE_FORM`, 400, category `system`, rule `BR-PRC-007 / BR-PRC-014`, dùng tại `FEAT-PRC-CREATE/DETAIL/RECALC`. Message: *"Chưa kịp tính do lần chạy trước bị gián đoạn (sự cố hệ thống) — vui lòng bấm 'Tính lại toàn bộ' để tính lại mã này"*. §4 + §6 YAML thêm 052 (chèn trước block HRMS). §5 Tổng hợp: `ERR-INV` 48→49 (ERROR 46→47), Tổng 67→68 (ERROR 63→64), `INLINE_FORM` 23→24. Cascade: `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` (BR-PRC-007 mở rộng enum + BR-PRC-014 cite), `FEAT-PRC-DETAIL.md` (AC-4 enum lý do lỗi). Pre-wave (W06 chưa DEV) — không cascade sync xuống service repo. v26 → v27. |
| 2026-07-15 | 24 | Business Authority + user bachho (Delivery Authority) | **Thêm `ERR-HRMS-STAFF-NOT-ELIGIBLE` — resolve Round 3 Q4 line 145 placeholder** (Gap #1 ratify batch, unblock ADR-025 flip PROPOSED → ACCEPTED). BA co-sign wording "Nhân sự chưa được cấp SSO, không thể chọn làm người phụ trách". Trigger: BE `gf-inventory` (`ReceiptV2Service.create/update` + `DeliveryV2Service.create/update`) gọi `gf-hrms GET /api/v1/employees/by-iam/{iamUserId}` fail-CLOSED per ADR-025 §Decision — response 404 hoặc `sso_status=NONE` → BE reject 400 `ERR-HRMS-STAFF-NOT-ELIGIBLE`. Display `INLINE_FIELD` (highlight ô "Người phụ trách" + auto-clear selection). §1.1 group list thêm HRMS (Human Resources — descriptive suffix allowed cho nhóm nhỏ). §4a section mới sau §4 ERR-INV cho 1 row HRMS. §5 Tổng hợp thêm row HRMS (+1 mã ERROR), bump `Tổng 66→67 / ERROR 62→63`. §6 YAML append entry sau `ERR-INV-050`. Cascade: ADR-025 v2 §Decision + INTEG-BFF-agg-garage-graph-gf-hrms v2 §5.2 sẽ cite code này thay vì placeholder. Rationale rejected `ERR-INV-051` (Inventory namespace) — lỗi thuộc HRMS domain (staff eligibility gate là HRMS concern, gf-inventory chỉ là caller). |
| 2026-07-15 | 23 | Business Authority | **Thêm `ERR-INV-049` — chặn xóa phiếu gốc khi có phiếu trả tham chiếu** (BA-review W05 prep, reference-integrity gap): 🔴 ERROR, `DIALOG`, 400, rule **BR-IRV2-035 / BR-IDV2-034** (mới), dùng tại **FEAT-IR-DELETE + FEAT-ID-DELETE**. Áp cho 2 loại phiếu gốc: (a) Nhập mua (`RECEIPT_PURCHASE`) khi có Xuất trả hàng mua (`DELIVERY_PURCHASE_RETURN`) tham chiếu `source_receipt_id`; (b) Xuất bán (`DELIVERY_SALE`) khi có Nhập hàng bán bị trả lại (`RECEIPT_SALE_RETURN`) tham chiếu `source_delivery_id`. Áp bất kể trạng thái phiếu con (Nháp/Ghi sổ — V2 không có "Đã hủy" theo BR-IRV2-002/BR-IDV2-002). Dialog liệt kê **tất cả** mã phiếu con để user điều hướng xóa từng phiếu. Message template: `"Không thể xóa phiếu — đã có {N} phiếu trả tham chiếu: {danh sách mã}. Vui lòng xóa các phiếu trả trước"`. §4 + §6 YAML thêm 049; §5 tổng `ERR-INV` 47→48 (ERROR 45→46), tổng 65→66 (ERROR 61→62); display `DIALOG` 10→11. Cascade BR-GF-INVENTORY-RECEIPT-V2 v40 (thêm BR-IRV2-035) + BR-GF-INVENTORY-DELIVERY-V2 v37 (thêm BR-IDV2-034) + FEAT-IR-DELETE v6 + FEAT-ID-DELETE v3. |
| 2026-06-24 | 13 | Business Authority | **Thêm 3 mã lỗi validate import catalog** (BA chốt khi rà soát wave 3): `ERR-INV-042` (ĐVT file không khớp danh mục → BR-CAT-PROD-021), `ERR-INV-043` (nhóm VTHH không tồn tại/ngừng hoạt động → BR-CAT-PROD-022), `ERR-INV-044` (xuất xứ không khớp danh mục → BR-CAT-PROD-023). §4 + §6 YAML; §5 tổng `ERR-INV` 40→43, tổng 58→61. Đồng bộ FEAT-CAT-PROD-IMPORT AC-5 + BR-GF-INVENTORY-CATALOG. |
| 2026-06-25 | 14 | Business Authority | **Thêm `ERR-INV-045` — cap 1.000 dòng/lần export catalog** (BA chốt phòng timeout/OOM): 🔴 ERROR, `DIALOG`, 400, rule **BR-CAT-PROD-024**, dùng tại **FEAT-CAT-PROD-EXPORT**. Message: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại". §4 + §6 YAML thêm 045; §5 tổng `ERR-INV` 43→44 (ERROR 41→42), tổng 61→62 (ERROR 57→58); display `DIALOG` 9→10. Đồng bộ FEAT-CAT-PROD-EXPORT v8 + BR-GF-INVENTORY-CATALOG v13. |
| 2026-06-25 | 15 | Business Authority | **Thêm `ERR-INV-046` — Mô tả / Ghi chú mã SP nội bộ vượt 500 ký tự** (BA chốt khi rà soát form tạo/sửa): 🔴 ERROR, `INLINE_FIELD`, 400, rule **BR-CAT-PROD-025**, dùng tại **FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT**. Message: "Mô tả / Ghi chú vượt quá 500 ký tự". §4 + §6 YAML thêm 046; §5 tổng `ERR-INV` 44→45 (ERROR 42→43), tổng 62→63 (ERROR 58→59); display `INLINE_FIELD` 19→20. Đồng bộ FEAT-CAT-PROD-CREATE v9 + FEAT-CAT-PROD-EDIT v7 + BR-GF-INVENTORY-CATALOG v14. |
| 2026-06-26 | 16 | Business Authority | **Thêm `ERR-INV-047` — Tỷ lệ quy đổi vượt 6 chữ số thập phân** (BA chốt khi chuẩn hoá precision): 🔴 ERROR, `INLINE_FIELD`, 400, rule **BR-CAT-PROD-011** (mở rộng), dùng tại **FEAT-CAT-PROD-CREATE/EDIT/DETAIL + FEAT-IR-CREATE-V2 + FEAT-ID-CREATE-V2** (modal "Thêm ĐVT quy đổi" trên catalog + modal inline phiếu nhập/xuất V2). Message: "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy". §4 + §6 YAML thêm 047; §5 tổng `ERR-INV` 45→46 (ERROR 43→44), tổng 63→64 (ERROR 59→60); display `INLINE_FIELD` 20→21. ERR-INV-013 (≤0) + ERR-INV-014 (trùng ĐVT) giữ nguyên. Đồng bộ BR-GF-INVENTORY-CATALOG v15 + FEAT-CAT-PROD-CREATE v10 + FEAT-CAT-PROD-DETAIL v8 + FEAT-CAT-PROD-EDIT v8 + FEAT-IR-CREATE-V2 v19 + FEAT-ID-CREATE-V2 v14 + UX-FLOW-INVENTORY-CATALOG v9. |
| 2026-07-03 | 17 | Business Authority | **Thêm `ERR-INV-048` — cap 500 dòng/lần import tồn đầu kỳ** (BA chốt song song cap PROD-IMPORT `ERR-INV-041`): 🔴 ERROR, `INLINE_FORM`, 400, rule **BR-OB-004b** (mới), dùng tại **FEAT-OB-IMPORT**. Message: "Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần". §4 + §6 YAML thêm 048; §5 tổng `ERR-INV` 46→47 (ERROR 44→45), tổng 64→65 (ERROR 60→61); display `INLINE_FORM` 22→23. Đồng bộ BR-GF-INVENTORY-OPENING-BALANCE v11 (thêm BR-OB-004b) + FEAT-OB-IMPORT v11 (thêm AC-3b file-level check). |
| 2026-07-13 | 18 | Business Authority (BA in-session review W05 chuẩn bị) | **Thêm `ERR-INV-050` — V1 endpoint disabled cho tenant bật V2** (BA chốt combo Option 1 per-EP §5.2 + Option 2 có mã lỗi). 🔴 ERROR, `DIALOG`, **HTTP 410 Gone**, category `business`, rule **EP-INVENTORY-RECEIPT-V2 §5.2 / EP-INVENTORY-DELIVERY-V2 §5.2 / EP-INVENTORY-STOCK-V2 §5.2** (V1 Module Hide row), dùng tại V1 controllers `@FeatureOff("Inventory:InventoryV2")`. Message: "V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2". §4 + §6 YAML thêm 050. Rationale: defensive backup cho edge case UI hide không triệt để (bookmark URL cũ / tab pre-flip / integration cũ) + FE parse structured response + log/monitoring track spike. 4 V1 module bị ẩn: "Tồn kho" + "Tồn kho theo kỳ" + "Phiếu nhập kho" + "Phiếu xuất kho". V1 data tables KHÔNG delete (giữ audit + rollback). Cascade EP-INVENTORY-RECEIPT-V2 + EP-INVENTORY-DELIVERY-V2 + EP-INVENTORY-STOCK-V2 §5.2 thêm row V1 Module Hide. |
| 2026-07-14 | 19 | Business Authority + Architect | **Fix drift ERR-CMN-004 message '10MB' → '30MB'** (BA-review 2026-07-14 C3.1 P0 unblock). §2 line 68 display text sync với FEAT-IR-CREATE-V2 + BR-IRV2-026 + BR-IDV2-026 + BR-CAT-PROD-015 (đều đã lock 30MB toàn Inventory + Catalog từ 2026-06-29). §6 machine-readable YAML giữ template `{XX}MB` (dynamic — cho phép domain khác vary limit qua error payload). Cross-domain verify: Insurance đã de-link `ERR-CMN-004` (v3 2026-06-11), không impact. |
| 2026-07-14 | 20 | Business Authority + Architect | **Cutover ERR-INV-* status DRAFT/PROPOSED → ACTIVE** (BA-review 2026-07-14 C3.2 P0 unblock). §4 header note đổi từ `[DRAFT/PROPOSED — Inventory V2, chưa cutover]` → `✅ ACTIVE — Inventory V2 (cutover 2026-07-14)`. Rationale: 14 FEAT + 2 BR V2 đã cite 47 mã `ERR-INV-*` như authoritative; W05 spawn DEV cần contract ổn định (không thể để DEV binding vào mã DRAFT). Any future add/change → CR + registry Change Log. Không impact §6 machine-readable YAML (đã export dạng ACTIVE cho BE/FE codegen). |
| 2026-07-14 | 21 | Business Authority | **Thêm ERR-CMN-010 empty-state common** (BA-review 2026-07-14 C3.3 P1 unblock). 🔵 INFO, `EMPTY_STATE`, 200, message "Không có kết quả phù hợp" — dùng toàn platform cho list/export không có row match filter (thay vì mỗi FEAT ghi wording ad-hoc). §2 line 73 + §6 YAML + §5 count ERR-CMN 9→10 (ERROR 9 + INFO 1). Cite từ EC-1 của FEAT-IR-LIST-V2 / FEAT-ID-LIST-V2 / FEAT-IR-EXPORT / FEAT-ID-EXPORT (defer — BA agent add sau, không blocking). |
| 2026-07-14 | 22 | Business Authority | **Mở rộng ERR-CMN-005 whitelist: PDF/JPG/PNG → PDF/JPG/PNG/DOC/XLSX** (Figma-crosscheck W05 SYS-2 P0 unblock, BA chốt Option B). Kế toán cần upload cả file Word (vận đơn / báo giá text) + Excel (bảng giá NCC) ngoài PDF/ảnh. §2 line 69 + §6 YAML message_vi sync. Cascade: BR-IRV2-026 + BR-IDV2-026 + FEAT-IR/ID-CREATE/EDIT-V2 attachment section cập nhật whitelist. Figma sample list `.doc/.jpeg/.png/.xlxs/.pdf` cần fix typo `.xlxs → .xlsx` (UX task). |
| 2026-06-24 | 12 | Business Authority + Architect | **Giải xung đột domain `ERR-INV-019`** (gap A1): `ERR-INV-019` đã được registry cấp cho **BR-OB-010** (ĐVT file ≠ ĐVT chính — Opening Balance, FEAT-OB-IMPORT) nhưng bị ADR-018/PKG-W03/Architecture chiếm dụng lại cho "cap 500 dòng import catalog" (rule chỉ "proposed BR-CAT-PROD-020"). Cấp **mã mới `ERR-INV-041`** (🔴 ERROR, INLINE_FORM, 400, rule BR-CAT-PROD-020, FEAT-CAT-PROD-IMPORT) cho cap 500 rows — `ERR-INV-019` giữ nguyên cho Opening Balance. §4 + §6 YAML thêm 041; §5 tổng hợp 39→40 (`ERR-INV`), tổng 57→58. Architecture (ADR-018, gf-inventory-api, agg-garage-graph-graphql), PKG-W03 cascade đổi 019→041 cho catalog import. |
| 2026-06-16 | 11 | Business Authority | **Thống nhất HTTP status MỌI mã `ERR-INV` → 400** (chốt BA — đảo chuẩn-hoá HTTP v9 của Architect): 12 mã đổi về 400 ở cả §4 + YAML §6 — **422** (030/035/036/037/038/040), **404** (009/020), **409** (029), **500** (027), **200** (031/039). **Lưu ý**: `ERR-INV-031` & `ERR-INV-039` **vẫn giữ severity WARNING** (display INLINE_WARNING, "vẫn cho lưu") — chỉ http đổi 400; behavior chặn/không-chặn **chưa đổi** (chờ BA chốt riêng). `ERR-INV-027` deprecated cũng về 400. |
| 2026-06-16 | 10 | Business Authority | Thêm **`ERR-INV-040`** (🔴 ERROR, 422, INLINE_FORM): "Số lượng trả vượt quá số lượng của phiếu gốc (đã xuất / đã nhập)" — dùng chung cho **Nhập hàng bán bị trả lại** (SL ≤ SL đã xuất, BR-IRV2-032) và **Xuất trả hàng mua** (SL ≤ SL đã nhập, BR-IDV2-031). Cập nhật §4 + YAML §6 + đếm 39→40. |
| 2026-06-22 | 9 | Business Authority + Architect | **Chuẩn hoá HTTP status Inventory V2 theo phản hồi kỹ thuật**: `409` chỉ dành cho xung đột ghi đồng thời / optimistic-lock (đồng bộ convention R-03 `TEST-CASE-REGISTRY`). Đổi **409 → 400** cho 15 mã `ERR-INV` (002, 004, 005, 007, 008, 010, 011, 014, 015, 023, 024, 025, 026, 028, 034) ở cả bảng §4 lẫn YAML §6. **Giữ 409**: `ERR-INV-029` (đang chạy tính giá — concurrency conflict thật). **Giữ nguyên** các mã `422` (030/035/036/037/038) và 409 domain bảo hiểm (`ERR-CMN-008/009`, `ERR-INS-002/004/005`). Bảng API `gf-inventory-api.md`/`-worker-api.md` (row `.04`) + INTEG idempotency Temporal **không đụng** — xử lý riêng. |
| 2026-06-16 | 8 | Business Authority | `ERR-INV-029`: rule-ref thêm **BR-PRC-011**, "Dùng tại" thêm **FEAT-PRC-DELETE** — chặn xóa log khi đang "Đang tính" (rà lỗ hổng G3). |
| 2026-06-16 | 7 | Business Authority | `ERR-INV-029` (chặn chạy trùng tính giá): cột "Dùng tại (FEAT)" thêm **FEAT-PRC-RECALC** — sau khi BR-PRC-016 mở rộng chặn-trùng phủ cả RECALC (rà lỗ hổng G2). |
| 2026-06-16 | 6 | Business Authority + Architect | Housekeeping §4/§5/§6: đánh dấu ERR-INV-027/028 deprecated; đồng bộ rule-ref đa nguồn (011/024/036) giữa bảng và YAML; sửa thống kê "theo hiển thị" §5 cộng đủ 57. |
| 2026-06-16 | 5 | Business Authority + Architect | Bổ sung 39 mã ERR-INV-001..039 vào khối YAML machine-readable §6 (đồng bộ với bảng §4) cho BE/FE codegen. |
| 2026-06-16 | 4 | Business Authority + Architect | Thêm §4 Registry Inventory V2 (ERR-INV-001..039) — đăng ký 39 mã lỗi domain kho V2 [DRAFT/PROPOSED — chưa cutover]; đồng bộ từ mã bare UPPERCASE_SNAKE trong BR-GF-INVENTORY-*. §1.1 thêm nhóm INV; §4 Tổng hợp 18→57 mã (thêm 39 ERR-INV: 37 ERROR + 2 WARNING); renumber §4→§5 (Tổng hợp), §5→§6 (Machine-readable), §6→§7 (Open Questions), §7→§8 (Change Log). |
| 2026-06-11 | 3 | BA/PO (anhluong) | **Bỏ upload file scan hồ sơ BH** (chốt B-3): **gỡ `ERR-INS-006`** ("Vui lòng upload Giấy ủy quyền", VLD-INS-DOSSIER-001 — Giấy ủy quyền điền template); de-link `ERR-CMN-004/005/006` khỏi hồ sơ BH (rule → null, "Dùng tại" → toàn platform upload file — codes giữ cho upload khác). §4 Tổng hợp 19→18 mã (ERR-INS 10→9). Đồng bộ BR-EP v26, FEAT-INS-DOSSIER-CREATE v17, UX-FLOW v16. |
| 2026-06-11 | 2 | ThanhVu (Business Authority) | Thêm chiều **hình thức hiển thị** cho dev agent: §1.4 taxonomy `display` (INLINE_FIELD / INLINE_FORM / INLINE_WARNING / TOAST / DIALOG / EMPTY_STATE) với thuộc tính block/auto-dismiss/vị trí; thêm cột **Hiển thị** + **Action kèm** vào §2–§3; thêm field `display` + `action` vào YAML; §4 thêm thống kê theo display; §6 thêm OQ-3 (display guard nghiệp vụ chờ UX chốt). |
| 2026-06-11 | 1 | ThanhVu (Business Authority) | Khởi tạo registry mã lỗi cho EP-INSURANCE-SETTLEMENT — 19 mã (9 `ERR-CMN-*` common + 10 `ERR-INS-*` riêng). Mỗi mã có severity, category, common flag, message VI, HTTP gợi ý, rule ref, FEAT usage. Thêm block YAML machine-readable cho BE/FE đồng bộ. Gỡ thông báo "chọn nguồn thanh toán"; đổi 2 message sang chuỗi tĩnh không biến. |
