---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-IMPORT.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-IMPORT"
source_feat_sha: "2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4"
generated_at: "2026-06-29T00:00:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-PROD-IMPORT"]
consumes_bff_feats: ["FEAT-CAT-PROD-IMPORT"]
i18n_keys: []
screens_touched:
  - "src/routes/_modules/_catalog/internal-products/import.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-prod-import.md (node 14146:87154 — Tải lên danh mục sản phẩm, 4 screens)"
coverage_gaps:
  - "AC-8: Design chọn Toast 'Tải tệp lên thành công!' thay vì màn 'Kết quả import' đầy đủ (chỉ số Tạo mới/Bỏ qua + nút Tải file lỗi). Figma Screen 4 TAP-13. NEED CONFIRMATION: follow design Toast hay AC-8 full screen."
  - "AC-9: Nút 'Tải file lỗi' không xuất hiện trong design (AC-9 collapse cùng AC-8). DEV sẽ extend Toast/summary với Download errors button nếu BA xác nhận."
  - "AC-2/AC-3 accept drift: Dropzone label hiển thị '.xls, .xlsx, .csv' (verbatim Figma), validate thực tế chỉ chấp nhận .xlsx per BR — cần BA confirm label."
  - "TAP-14: Toast 'Tải tệp lên thành công!' — designer ambiguity (upload step vs confirm step). NEED CONFIRMATION từ BA về trigger timing."
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "n/a"
  template_sha: "b196f98b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-IMPORT.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-30"
---

# FEAT-CAT-PROD-IMPORT (FE Web): Tải lên danh mục mã sản phẩm nội bộ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-IMPORT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/routes/_modules/_catalog/internal-products/import.tsx` |
| Cross-tier consume | BE: FEAT-CAT-PROD-IMPORT \| BFF: FEAT-CAT-PROD-IMPORT |

---

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-IMPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-IMPORT.md) |
| Source version | v10 |
| Source SHA | `2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4` |
| Generated at | 2026-06-29T00:00:00Z |

---

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần nhập số lượng lớn mã sản phẩm nội bộ từ file dữ liệu có sẵn, thay vì tạo từng mã thủ công qua form. Feature cung cấp quy trình hai bước — kiểm tra dữ liệu trước (verify), xác nhận rồi mới ghi (commit) — đảm bảo danh mục tồn kho V2 không nhận dữ liệu lỗi. Kết quả trả về rõ ràng: số dòng thành công, số dòng lỗi kèm chi tiết, và file lỗi để tra cứu sau.

---

## 2. Trách nhiệm FE Web (garage-web)

- Render trang đầy đủ (dedicated route `/inventory/internal-products/import`) theo layout 4 trạng thái tuần tự: Empty Upload → Uploaded File → Preview → Success Toast — xem `wave03-cat-prod-import.md` §Screen enumeration.
- Parse file `.xlsx` client-side qua `xlsx` lib (`XLSX.read` + `sheet_to_json`) trước khi gọi BFF; bắt lỗi file rỗng / định dạng sai / vượt 500 dòng ngay tại client (guard ERR-INV-041) — xem figma spec `wave03-cat-prod-import.md` §Screen:Empty Upload §4 Anti-Pattern Trap TAP-4.
- Gọi BFF mutation `verifyImportInternalProduct` để nhận kết quả kiểm tra từng dòng; render StatsRow (Hợp lệ/Không hợp lệ) + PreviewTable 13 cột có horizontal scroll — xem figma spec §Screen:Preview §1 Layout DSL.
- Gọi BFF mutation `confirmImportInternalProduct` khi user nhấn "Xác nhận"; hiển thị Toast success top-right — xem figma spec §Screen:Success Toast.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: scan đã xác nhận customs/ không có component fit cho upload wizard pattern (domain-new). Reuse từ `share/` layer.
- **Reference implementation đã có sẵn — `/customers/import`**: route `frontend/gf-gms-web/src/routes/_modules/_customers/customers/import.tsx` + component `src/features/customers/components/import/index.tsx` + hooks `use-verify-import-customer.ts` / `use-import-customers.ts` đã implement **đúng pattern 2-step verify → confirm** mà FEAT này cần (verify mutation → preview StatsRow + table → confirm mutation → success). DEV PHẢI đọc trước khi viết code — copy structure (xlsx client parse, StatsRow, PreviewTable, error file download), chỉ thay schema cột (customer 13 cột → internal-product 13 cột) + operations (`verifyImportCustomer`/`importCustomers` → `verifyImportInternalProduct`/`confirmImportInternalProduct`) + error code map (ERR-CUS-* → ERR-INV-041/044/045). Không re-design lại pattern — drift sẽ tạo inconsistency giữa 2 import flow cùng repo.
- **Figma spec là visual SSOT**: mọi label, token, layout theo `Product/ux/figma-web/wave03-cat-prod-import.md`. Chú ý các design drift đã ghi tại `coverage_gaps` frontmatter (AC-8 Toast vs full screen; AC-9 download button missing trong design; accept drift TAP-4). Khi visual Figma đụng độ pattern `/customers/import`: Figma thắng (visual SSOT), nhưng state machine + naming convention bám reference implementation.
- RBAC: chỉ hiển thị route import với role `garage-owner` và `accountant` có quyền `INTERNAL_PRODUCT_IMPORT` (AC-10).

---

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Khởi động trang & tải template

#### AC-1 → FE render trang import full-page (KHÔNG wizard dialog)

- **Khi**: User nhấn nút "Import" từ trang danh sách mã sản phẩm nội bộ (`/inventory/internal-products`) → navigate tới route `/inventory/internal-products/import`.
- **FE phải**: Render layout full-page "Tải lên danh mục sản phẩm" với PageHeader (back arrow + H1, chưa có action buttons), Section "Thông tin cơ bản", TemplateLink và Dropzone. KHÔNG render wizard stepper (TAP-3 figma spec §Anti-Pattern Trap).
- **State transition**: `idle` → trang render ngay (không fetch), state `uploadPhase = 'empty'`.
- **Component**: `share/layouts/page-header` (back arrow + title), `share/containers/section`, `share/uploads/excel-upload` (Dropzone).
- **Ref**: Figma node `14601:133301` — Screen: Empty Upload (xem `wave03-cat-prod-import.md` §Screen:Empty Upload).

#### AC-2 → FE hiển thị TemplateLink cho phép tải file mẫu

- **Khi**: Trang import đã render (mọi trạng thái screen).
- **FE phải**: Render TemplateLink dạng link icon-leading (icon `document-text-1` lucide-react + label "Mẫu file danh sách sản phẩm.xlsx") — variant `link-brand`, `download=true`, href trỏ đến template static file. KHÔNG dùng Button component (TAP-2 figma spec). Token: `base/foreground-link = #1d4ed8`.
- **Component**: `share/navigates/link` (styled link variant).
- **Ref**: Figma node `14601:133301` L14 — xem `wave03-cat-prod-import.md` §Screen:Empty Upload §4 TAP-2.

### Cluster B — Chọn file & client-side parse

#### AC-3 → FE parse file XLSX client-side + validate trước khi gửi BFF

- **Khi**: User kéo thả hoặc nhấn vào Dropzone để chọn file.
- **FE phải**:
  1. Kiểm tra extension: chỉ chấp nhận `.xlsx` (dù Dropzone label hiển thị `.xls, .xlsx, .csv` per Figma TAP-4). File không phải `.xlsx` → inline error ngay tại Dropzone, không chuyển trạng thái.
  2. Parse file với `XLSX.read(arrayBuffer) + sheet_to_json(worksheet)` tại helper `formatDataImportInternalProductData` trong `src/features/inventory-catalog/helper/import.ts`.
  3. Kiểm tra rỗng (0 dòng) → hiển thị lỗi "File không có dữ liệu" tại Dropzone.
  4. Kiểm tra > 500 dòng → banner ERR-INV-041 "Vượt giới hạn 500 dòng/lần — vui lòng tách file", không chuyển sang Preview.
  5. File hợp lệ → lưu vào state `uploadedFile`, hiển thị UploadedFileItem (XLS badge + tên file + dung lượng + trash icon), set `hasUploaded = true`.
- **State transition**: `empty` → `uploaded` (file hợp lệ); hoặc giữ `empty` với error message (file sai/rỗng/vượt giới hạn).
- **Component**: `share/uploads/excel-upload` (Dropzone), `share/files/file-thumbnail` (UploadedFileItem: XLS badge + name + size + trash), `share/containers/show` (conditional render UploadedFileItem).
- **i18n keys**: fixed VN labels (không dùng i18next — per catalog wave pattern).
- **Ref**: Figma node `14601:133897` — Screen: Uploaded File (xem `wave03-cat-prod-import.md` §Screen:Uploaded File); TAP-4, TAP-5, TAP-6.

### Cluster C — Verify & Preview

#### AC-4 → FE gọi BFF verify + hiển thị StatsRow tổng quan

- **Khi**: State `hasUploaded = true` (file parse thành công) → auto-trigger `useVerifyImportInternalProduct` mutation với `importData[]` từ client parse.
- **FE phải**:
  1. Loading state: spinner overlay trên Dropzone/Section trong khi chờ BFF response.
  2. BFF response trả `{report: {summary: {totalRows, validRows, errorRows}, previewRows[]}}` → lưu vào state `verifyResponse`.
  3. Render StatsRow: "Hợp lệ: {validRows}" (token `base/foreground-success = #16a34a`) + "Không hợp lệ: {errorRows}" (token `base/foreground-error = #dc2626`).
  4. Render PageHeader với 2 action buttons "Huỷ bỏ" (outline) + "Xác nhận" (brand). Chuyển state `uploadPhase = 'preview'`.
- **State transition**: `uploaded` → `loading-verify` → `preview`.
- **Component**: `share/loadings/loading` (spinner), `share/layouts/page-header` (action buttons xuất hiện ở state này), `share/buttons/button`.
- **Ref**: Figma node `14601:134126` L11 + L29 — Screen: Preview (xem `wave03-cat-prod-import.md` §Screen:Preview §4 Component Prop Map - StatsRow).

#### AC-5 → FE render PreviewTable 13 cột với trạng thái hợp lệ/lỗi từng dòng

- **Khi**: `verifyResponse` đã có, `uploadPhase = 'preview'`.
- **FE phải**:
  1. Render PreviewTable với 13 cột theo thứ tự: STT, Mã sản phẩm nội bộ, Tên sản phẩm, ĐVT chính, Phương pháp tính giá, Thương hiệu, Xuất xứ, Tính chất, Nhóm sản phẩm, Quy cách sản phẩm, Thông số kỹ thuật, Trạng thái, Lý do lỗi. Table width tổng 1981px → `overflow-x: scroll` (TAP-7).
  2. Row hợp lệ: background trắng, cell "Trạng thái" = pill badge xanh "Hợp lệ" (token `bg-background-success #f0fdf4`, border `border-success #22c55e`, text `foreground-success #16a34a`, `border-radius: full`).
  3. Row lỗi: background `base/background-error = #fef2f2` (light pink), cell "Trạng thái" = text đỏ "Lỗi" (NO badge background — TAP-8), cell "Lý do lỗi" = verbatim reason string từ verify response.
  4. Cell "Mã sản phẩm nội bộ" render as colored link (`base/foreground-link = #1d4ed8`).
  5. Column header "Nhóm sản phẩm" follow design label (không phải BR canonical "Nhóm vật tư/hàng hoá" — TAP-9).
  6. Column "Phương pháp tính giá" luôn hiển thị "Bình quân cuối kỳ" (system-derived — TAP-10).
  7. Filter client-side valid/invalid bằng `searchKeyword` qua helper `filterImportDataForDisplay`.
- **State transition**: cột/row data từ `verifyResponse.previewRows`, phân trang bằng state `pagination`.
- **Component**: `share/tables/table-pagination` (PreviewTable + pagination), `share/inputs/input-search` (filter keyword), `share/containers/show` (conditional render filter/table area).
- **Ref**: Figma node `14601:134126` + `14601:135303` (full-width 13 cols annotation) — xem `wave03-cat-prod-import.md` §Screen:Preview §1 Layout DSL TableHead + §8 Anti-Pattern Trap TAP-7..11.

### Cluster D — Xác nhận import

#### AC-6 → FE gọi BFF confirm import + hiển thị Toast success

- **Khi**: User nhấn "Xác nhận" trên PageHeader (chỉ active khi `uploadPhase = 'preview'`).
- **FE phải**:
  1. Disable button "Xác nhận" + show loading state trong button.
  2. Gọi mutation `confirmImportInternalProduct` với `importData[]` (toàn bộ rows từ parse — BFF/BE sẽ chỉ ghi dòng hợp lệ).
  3. Khi thành công → hiển thị Toast "Tải tệp lên thành công!" top-right (token: `bg-background-success #f0fdf4`, border `border-success #22c55e`, icon `tick-circle-filled` green, auto-dismiss 3-5s).
  4. NEED CONFIRMATION: sau dismiss Toast → navigate về `/inventory/internal-products` hay ở lại trang (BA cần xác nhận — TAP-13 figma spec).
- **State transition**: `preview` → `confirming` → `success` (Toast).
- **Component**: `share/buttons/button` (loading state), `share/toasts/toast` (success variant).
- **Ref**: Figma node `14601:135187` — Screen: Success Toast (xem `wave03-cat-prod-import.md` §Screen:Success Toast §4 + TAP-12, TAP-13, TAP-14).

#### AC-7 → FE xử lý "Huỷ bỏ" / back navigation

- **Khi**: User nhấn "Huỷ bỏ" (khi `uploadPhase = 'preview'`) hoặc nhấn back arrow trên PageHeader.
- **FE phải**: Hiển thị confirm discard nếu `hasUploaded = true` (data sẽ mất) → confirm → navigate về `/inventory/internal-products`. Từ state `empty`: back arrow navigate trực tiếp không cần confirm.
- **Component**: `share/dialogs/alert-confirm` (confirm discard dialog), `share/buttons/button`.
- **Ref**: Figma node `14601:134126` L11 — button "Huỷ bỏ" outline (xem `wave03-cat-prod-import.md` §Screen:Preview §4 Component Prop Map PageHeader).

#### AC-8 → FE hiển thị kết quả import

- **Khi**: `confirmImportInternalProduct` mutation trả về thành công.
- **FE phải**: Hiển thị Toast success "Tải tệp lên thành công!" (theo design Figma Screen 4). NEED CONFIRMATION: nếu BA yêu cầu hiển thị chỉ số Tạo mới/Bỏ qua đầy đủ → extend Toast với summary row hoặc thêm result panel.
- **Ref**: Figma node `14601:135187`; xem `coverage_gaps` + TAP-13 cho design drift vs AC-8 scope.

#### AC-9 → FE cung cấp Download file lỗi

- **Khi**: Import hoàn thành và `failedCount > 0` (confirm response có dòng lỗi).
- **FE phải**: Hiện nút "Tải file lỗi" (nếu BA xác nhận — NEED CONFIRMATION vì không có trong Figma design). Client-side: dùng helper `handleDownloadWithErrors` tại `src/features/inventory-catalog/helper/import.ts` để tạo XLSX từ `verifyResponse.previewRows` filter `status = 'error'` + column "Lý do lỗi", trigger browser download.
- **Component**: `share/buttons/button` (download variant), `share/containers/show` (conditional render khi `failedCount > 0`).
- **Ref**: coverage_gap AC-9; mirror pattern `features/customers/helper/import.ts` `handleDownloadWithErrors`.

### Cluster E — Phân quyền

#### AC-10 → FE RBAC — ẩn/redirect route import với user không có quyền

- **Khi**: User navigate tới `/inventory/internal-products/import`.
- **FE phải**: Route guard kiểm tra permission `INTERNAL_PRODUCT_IMPORT` (hoặc role check `garage-owner | accountant` có quyền import). User không có quyền → redirect về `/inventory/internal-products` (không show route).
- **RBAC**: KHÔNG show then disable — conditional redirect (xem §4.4).
- **Component**: Route loader guard trong `src/routes/_modules/_catalog/internal-products/import.tsx`.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave03-cat-prod-import.md` (node `14146:87154`). Layout 4 trạng thái: Empty Upload → Uploaded File → Preview → Success Toast.
- Token `base/background-brand-CD = #0052ff` cho button "Xác nhận" (brand variant). Token `base/background-error = #fef2f2` cho invalid row. Token `base/background-success = #f0fdf4` cho valid pill + Toast.
- PageHeader Screen 1 + 2: KHÔNG có action buttons. Screen 3 (Preview): có "Huỷ bỏ" + "Xác nhận" — xem figma spec §Screen:Empty Upload §8 TAP-1.
- PreviewTable: horizontal scroll (width 1981 > section 1216) — KHÔNG ép cột — xem figma spec §Screen:Preview §8 TAP-7.
- Status "Hợp lệ" = pill badge; "Lỗi" = red text KHÔNG có badge background — TAP-8.
- Dropzone label verbatim ".xls, .xlsx, .csv" (hiển thị theo design); validate thực tế chỉ accept `.xlsx` (BR) — TAP-4.
- Column header "Nhóm sản phẩm" (design label); KHÔNG override thành "Nhóm vật tư/hàng hoá" (TAP-9).
- TemplateLink: KHÔNG dùng Button — render link variant với icon (TAP-2).

### 4.2 State machine + error handling

- State machine tường minh: `uploadPhase: 'empty' | 'uploaded' | 'loading-verify' | 'preview' | 'confirming' | 'success'`.
- Client-side error (file format / empty / >500 rows): display INLINE tại Dropzone — KHÔNG gọi BFF.
- BFF verify error (network/server): TOAST error với message.
- BFF confirm error: TOAST error, re-enable "Xác nhận" button để user retry.
- KHÔNG silent fail — mọi error phải reach UI.

### 4.3 i18n + a11y

- Fixed VN labels (KHÔNG dùng i18next) — per catalog wave pattern. `i18n_keys: []`.
- Dropzone: `aria-label="Khu vực kéo thả file"`, keyboard accessible (Enter/Space mở file picker).
- Button "Xác nhận": `aria-label` + disabled state khi `confirming`.
- Table header cells: `scope="col"`. Error row: `aria-live` announce khi filter thay đổi.
- PageHeader back arrow: `aria-label="Quay lại danh sách sản phẩm"`.

### 4.4 RBAC render + feature flag

- Permission `INTERNAL_PRODUCT_IMPORT` gate route `/inventory/internal-products/import` — redirect nếu không có.
- Chỉ 2 persona: `garage-owner` + `accountant`. KHÔNG tạo actor mới (Critical Rule #6).
- Route loader check permission trước khi render bất kỳ UI component nào.

### 4.5 Business rule secondary (UI hint)

- BR-CAT-PROD-020 (cap 500 dòng): client-side guard — đếm rows sau `sheet_to_json`, reject > 500 với banner ERR-INV-041 trước khi gọi BFF.
- BR-CAT-PROD-017 (template columns): chỉ map đúng columns theo schema ADR-018 (KHÔNG có cột SKU/ĐVT quy đổi/ảnh/tệp).
- BR primary nằm BE tier; FE chỉ hiển thị error reason từ `verifyResponse.previewRows[].errorReason`.

### 4.6 Error code mapping

| Error code | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-041` | INLINE (Dropzone banner) | `share/uploads/excel-upload` | AC-3 |
| File format invalid | INLINE (Dropzone inline error) | `share/uploads/excel-upload` | AC-3 |
| File empty (0 rows) | INLINE (Dropzone inline message) | `share/uploads/excel-upload` | AC-3 |
| `ERR-INV-007` (trùng mã) | TABLE CELL "Lý do lỗi" | `PreviewTable` row | AC-5 |
| `ERR-INV-006` (ký tự đặc biệt) | TABLE CELL "Lý do lỗi" | `PreviewTable` row | AC-5 |
| `ERR-INV-042` (ĐVT không khớp) | TABLE CELL "Lý do lỗi" | `PreviewTable` row | AC-5 |
| `ERR-INV-043` (nhóm không tồn tại) | TABLE CELL "Lý do lỗi" | `PreviewTable` row | AC-5 |
| `ERR-INV-044` (xuất xứ không khớp) | TABLE CELL "Lý do lỗi" | `PreviewTable` row | AC-5 |
| `ERR-INV-012` (tính chất sai) | TABLE CELL "Lý do lỗi" | `PreviewTable` row | AC-5 |
| BFF confirm network error | TOAST error | `share/toasts/toast` | AC-6 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node | AC ref |
|---|---|---|---|---|
| `InternalProductImportPage` | `/inventory/internal-products/import` | NEW | `14146:87154` (wave03-cat-prod-import.md) | AC-1..10 |

### 5.2 Components new/modified

> **Reuse pattern column** references priority order `customs/` > `share/` > `ui/`. Scan §G.X từ bundle báo "KG parse error — author scanned `src/components/{customs,share,ui}/` qua web-component-registry.yaml". Không có customs/ component fit cho import wizard (domain-new).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `title, onBack, actions?` | — | **Priority 2 — share/** (generic page header) | AC-1, AC-4, AC-6, AC-7 |
| `ExcelUpload` | `src/components/share/uploads/excel-upload.tsx` | REUSE | `onDrop, accept, primaryText, subtitleText` | — | **Priority 2 — share/** (xlsx import dropzone) | AC-3 |
| `FileThumbnail` | `src/components/share/files/file-thumbnail.tsx` | REUSE | `fileName, fileSize, onDelete` | — | **Priority 2 — share/** (file card với icon + actions) | AC-3 |
| `Section` | `src/components/share/containers/section.tsx` | REUSE | `title="Thông tin cơ bản"` | — | **Priority 2 — share/** (form section block) | AC-1..5 |
| `Show` | `src/components/share/containers/show.tsx` | REUSE | `when={cond}` | — | **Priority 2 — share/** (conditional render) | AC-3, AC-4, AC-7, AC-9 |
| `TablePagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `columns, data, pageSize, pageIndex` | — | **Priority 2 — share/** (paginated table) | AC-4, AC-5 |
| `InputSearch` | `src/components/share/inputs/input-search.tsx` | REUSE | `value, onChange` | — | **Priority 2 — share/** (search/filter box) | AC-5 |
| `Button` | `src/components/share/buttons/button.tsx` | REUSE | `variant="outline|brand", isLoading` | — | **Priority 2 — share/** (action buttons) | AC-6, AC-7 |
| `AlertConfirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `open, onConfirm, onCancel` | — | **Priority 2 — share/** (discard confirm dialog) | AC-7 |
| `Toast` | `src/components/share/toasts/toast.tsx` | REUSE | `variant="success|error", message` | — | **Priority 2 — share/** (toast notification) | AC-6, AC-8 |
| `Link` | `src/components/share/navigates/link.tsx` | REUSE | `href, download=true` | — | **Priority 2 — share/** (template download link) | AC-2 |
| `NoData` | `src/components/share/emptys/no-data.tsx` | REUSE | `message` | — | **Priority 2 — share/** (empty state placeholder) | AC-5 |
| `Loading` | `src/components/share/loadings/loading.tsx` | REUSE | `size` | — | **Priority 2 — share/** (inline spinner) | AC-4, AC-6 |
| `InternalProductImportPage` | `src/features/inventory-catalog/pages/InternalProductImportPage.tsx` | NEW | — | `uploadPhase, uploadedFile, importData[], verifyResponse, hasUploaded, pagination, searchKeyword` | **Build-new** — justification: page-level orchestrator cho import flow, no component fit at customs/share/ui after §G.X scan; pattern domain-new (import wizard state machine) | AC-1..10 |
| `ImportPreviewTable` | `src/features/inventory-catalog/components/import/ImportPreviewTable.tsx` | NEW | `rows, pagination, onPageChange, searchKeyword` | — | **Build-new** — justification: 13-col read-only preview table với horizontal scroll + row tinting + status pill/text variant; no share/tables component provides row-state coloring with 13-col custom schema | AC-4, AC-5 |
| `ImportStatsRow` | `src/features/inventory-catalog/components/import/ImportStatsRow.tsx` | NEW | `validCount, invalidCount` | — | **Build-new** — justification: stats scorecard layout (2-stat horizontal) không có trong registry; domain-specific stat display | AC-4 |
| `ImportHelper` (module) | `src/features/inventory-catalog/helper/import.ts` | NEW | — | — | **Build-new** — justification: helper module (không phải component); domain-specific xlsx parse + error filter + download logic; mirror `features/customers/helper/import.ts` pattern | AC-3, AC-5, AC-9 |

### 5.3 Design tokens & Figma refs

> Tokens detected tại bundle §G.Y `wave03-cat-prod-import.md` §2 Design Token Map (per screen).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `base/background-brand-CD = #0052ff` | tailwind / tokens | Button "Xác nhận" (brand variant) | AC-6 |
| `base/foreground-link = #1d4ed8` | tailwind / tokens | TemplateLink + Mã sản phẩm cell color | AC-2, AC-5 |
| `base/foreground-success = #16a34a` | tailwind / tokens | StatsRow "Hợp lệ" value + "Hợp lệ" pill text | AC-4, AC-5 |
| `base/foreground-error = #dc2626` | tailwind / tokens | StatsRow "Không hợp lệ" value + "Lỗi" text | AC-4, AC-5 |
| `base/background-success = #f0fdf4` | tailwind / tokens | "Hợp lệ" pill background + Toast background | AC-5, AC-8 |
| `base/background-error = #fef2f2` | tailwind / tokens | Invalid row background (light pink) | AC-5 |
| `base/border-success = #22c55e` | tailwind / tokens | "Hợp lệ" pill border + Toast border | AC-5, AC-8 |
| `base/input = #d4d4d8 (dashed)` | tailwind / tokens | Dropzone dashed border | AC-3 |
| `base/border = #e4e4e7` | tailwind / tokens | UploadedFileItem border + Table borders | AC-3, AC-5 |

> **Figma source-of-truth**: visual / micro-interaction / responsive theo `Product/ux/figma-web/wave03-cat-prod-import.md`. Không re-invent layout — đặc biệt 4 screen state transitions và PreviewTable horizontal scroll.

---

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `verifyImportInternalProduct` | mutation | `src/api/graphql/verifyImportInternalProduct.graphql` | — | `ImportVerifyResponseFragment` | AC-4, AC-5 |
| `confirmImportInternalProduct` | mutation | `src/api/graphql/confirmImportInternalProduct.graphql` | — | `ImportConfirmResponseFragment` | AC-6, AC-8 |

> Mọi op phải tồn tại ở paired BFF FEAT `features/bff/FEAT-CAT-PROD-IMPORT.md §6.1`.

### 6.2 REST endpoints consumed direct (bypass BFF)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| GET | `/templates/cat-prod-import-template.xlsx` | User click TemplateLink | Static file serve từ garage-web (hoặc storage) | AC-2 |

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Upload phase | Local state (`useState`) | `InternalProductImportPage` | `uploadPhase` | AC-1..8 |
| Parsed import data | Local state | `InternalProductImportPage` | `importData: ImportRowDto[]` | AC-3, AC-4 |
| Uploaded file metadata | Local state | `InternalProductImportPage` | `uploadedFile: File \| null` | AC-3, AC-7 |
| Verify response | Local state | `InternalProductImportPage` | `verifyResponse: VerifyImportResponse \| null` | AC-4, AC-5 |
| Has uploaded flag | Local state | `InternalProductImportPage` | `hasUploaded: boolean` | AC-3, AC-7 |
| Pagination | Local state | `InternalProductImportPage` | `pagination: {page, pageSize}` | AC-5 |
| Search/filter keyword | Local state | `InternalProductImportPage` | `searchKeyword: string` | AC-5 |
| BFF mutations | TanStack Mutation | hooks | `useVerifyImportInternalProduct`, `useImportInternalProduct` | AC-4, AC-6 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/internal-products/import` | `InternalProductImportPage` | prefetch user permissions | RBAC: `INTERNAL_PRODUCT_IMPORT` (garage-owner \| accountant) | AC-1, AC-10 |

---

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Route | `src/routes/_modules/_catalog/internal-products/import.tsx` | NEW | TanStack Router createFileRoute | ~30 | AC-1, AC-10 |
| Page | `src/features/inventory-catalog/pages/InternalProductImportPage.tsx` | NEW | React FC + local state | ~200 | AC-1..10 |
| Component | `src/features/inventory-catalog/components/import/ImportPreviewTable.tsx` | NEW | share/tables/table base + horizontal scroll | ~150 | AC-4, AC-5 |
| Component | `src/features/inventory-catalog/components/import/ImportStatsRow.tsx` | NEW | share/containers/box base | ~40 | AC-4 |
| Helper | `src/features/inventory-catalog/helper/import.ts` | NEW | mirror `features/customers/helper/import.ts` | ~80 | AC-3, AC-5, AC-9 |
| Hook | `src/features/inventory-catalog/hooks/useVerifyImportInternalProduct.ts` | NEW | TanStack useMutation wrapper | ~30 | AC-4 |
| Hook | `src/features/inventory-catalog/hooks/useImportInternalProduct.ts` | NEW | TanStack useMutation wrapper | ~30 | AC-6 |
| Types | `src/features/inventory-catalog/types/import.types.ts` | NEW | TypeScript interfaces | ~50 | — |
| GraphQL | `src/api/graphql/verifyImportInternalProduct.graphql` | NEW | mutation | ~15 | AC-4 |
| GraphQL | `src/api/graphql/confirmImportInternalProduct.graphql` | NEW | mutation | ~12 | AC-6 |
| Generated | `src/api/generated/verifyImportInternalProduct.generated.ts` | AUTO-GEN | codegen | — | — |
| Generated | `src/api/generated/confirmImportInternalProduct.generated.ts` | AUTO-GEN | codegen | — | — |
| Tests | `tests/features/inventory-catalog/InternalProductImportPage.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1..10 |

---

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: verifyImportInternalProduct + confirmImportInternalProduct SDL + resolver stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma wave03-cat-prod-import.md confirmed
    Exit: E2E happy path green (smoke — upload xlsx 10 rows → preview → confirm → toast)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Route + page skeleton + RBAC guard | routes + features/pages | — | Route navigable | — |
| S6.2 | Helper import.ts: parse + filter + download | features/helper | — | Unit test green | S6.1 |
| S6.3 | ExcelUpload + UploadedFileItem + client-side validate | features/components | — | Upload flow done | S6.1 |
| S6.4 | Hooks: useVerifyImportInternalProduct (BFF S5) | features/hooks | BFF S5 | Verify response OK | S6.2, S6.3 |
| S6.5 | ImportPreviewTable + ImportStatsRow + filter | features/components | S6.4 | Preview render OK | S6.4 |
| S6.6 | Hook: useImportInternalProduct + Toast | features/hooks + page | S6.4 | Confirm flow + toast | S6.5 |
| S6.7 | E2E smoke (Playwright happy path) | tests | S6.6 | E2E green | S6.6 |

---

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ: client-side hint, RBAC render, error display.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-020` | CORNERSTONE | Inline banner ERR-INV-041 khi rows > 500 | `InternalProductImportPage.tsx::onDrop` | AC-3 | BE defensive cũng check; FE guard trước để tránh unnecessary BFF call |
| `BR-CAT-PROD-017` | CORNERSTONE | Chỉ map đúng columns template (KHÔNG có SKU/ĐVT quy đổi) | `helper/import.ts::formatDataImportInternalProductData` | AC-3 | Parse validation tại helper |
| `BR-CAT-PROD-010` | NORMAL | Column "Phương pháp tính giá" luôn hiển thị "Bình quân cuối kỳ" (system-derived, read-only) | `ImportPreviewTable.tsx` | AC-5 | Không lấy từ file — giá trị backend-assigned |
| `BR-CAT-PROD-019` | NORMAL | Render "Tính chất" enum: "Vật tư hàng hoá" / "CCDC" / "Dịch vụ" / "Khác" | `ImportPreviewTable.tsx` | AC-5 | Display mapping từ enum backend |
| `BR-GF-INVENTORY-CATALOG` (RBAC) | CORNERSTONE | Route guard redirect khi không có quyền import | `routes/.../import.tsx` loader | AC-10 | Redirect, không show-then-disable |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-PROD-IMPORT.md §9`).

---

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (route render + page layout) | test-ui | Verify 4-state flow, no wizard stepper |
| AC-2 | UI (TemplateLink render) | test-ui | Link component, icon leading, download attr |
| AC-3 | UI (file validation — format/empty/500+) | test-ui | 3 negative cases + 1 happy path |
| AC-4 | UI (StatsRow + verify call) | test-ui | Mock BFF response, verify stats display |
| AC-5 | UI (table 13 cols, row states, filter) | test-ui | Valid/invalid row bg + Trạng thái cell variant |
| AC-6 | UI (confirm + toast) | test-ui | Button disable + loading + toast trigger |
| AC-7 | UI (back nav + discard confirm) | test-ui | AlertConfirm dialog flow |
| AC-8 | UI (toast success message) | test-ui | Verbatim "Tải tệp lên thành công!" |
| AC-9 | UI (download errors button) | test-ui | NEED CONFIRMATION — pending BA on AC-9 presence |
| AC-10 | UI (RBAC redirect) | test-ui + test-isolation | Dual persona check |
| (smoke) | E2E happy path | test-e2e | Playwright: upload → preview → confirm → toast |

---

## 11. i18n & a11y

### 11.1 i18n keys

Fixed VN labels — KHÔNG dùng i18next (per catalog wave pattern). `i18n_keys: []`.

Tất cả string literals trong JSX: hardcode tiếng Việt inline (vd "Tải lên danh mục sản phẩm", "Thông tin cơ bản", "Mẫu file danh sách sản phẩm.xlsx", "Kéo thả hoặc nhấn để chọn tệp", v.v. — theo verbatim labels xác nhận tại figma spec §VV Visual Verification Pass).

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | PageHeader back arrow: `aria-label="Quay lại danh sách sản phẩm"` | manual QA |
| AC-2 | TemplateLink: `aria-label="Tải mẫu file danh sách sản phẩm"` | semantic `<a>` not `<div>` |
| AC-3 | Dropzone: `role="button"` + `aria-label="Khu vực kéo thả file"` + keyboard Enter/Space | keyboard nav |
| AC-3 | FileThumbnail trash icon: `aria-label="Xoá tệp"` | xem figma spec §Screen:Uploaded File §1 L25 |
| AC-5 | PreviewTable: `<th scope="col">` cho 13 column headers; `aria-live="polite"` cho filter result | screen reader |
| AC-6 | Button "Xác nhận": `aria-label` + `aria-disabled` khi `confirming` | loading state |
| AC-8 | Toast: `role="status"` + `aria-live="polite"` | auto-dismiss toast announce |

---

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-IMPORT.md` | PENDING | BR primary enforcement (verify/import logic, cap 500 row, error codes) |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-IMPORT.md` | PENDING | GraphQL ops consumed: `verifyImportInternalProduct` + `confirmImportInternalProduct` |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-IMPORT.md` | PENDING | Mirror feature — xem mobile spec khi available |

**Source ID consistency** (item 18): `source_feat_sha = 2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4` identical với BE/BFF/Mobile files.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-IMPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-IMPORT.md) v10
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-prod-import.md`](../../../../../Product/ux/figma-web/wave03-cat-prod-import.md) — node `14146:87154`
- **Paired BE**: [`features/be/FEAT-CAT-PROD-IMPORT.md`](../be/FEAT-CAT-PROD-IMPORT.md) (PENDING)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-IMPORT.md`](../bff/FEAT-CAT-PROD-IMPORT.md) (PENDING)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **ADR-018**: JSON body 2-step pattern, row cap 500, endpoints gf-inventory
- **ADR-017**: InternalProduct entity schema, additive aggregates
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../../../.claude/references/web-component-registry.yaml)
- **Reference implementation (precedent — same 2-step verify→confirm pattern)**:
  - Route: `frontend/gf-gms-web/src/routes/_modules/_customers/customers/import.tsx` (`/customers/import`)
  - Feature module: `frontend/gf-gms-web/src/features/customers/components/import/index.tsx`
  - Hooks: `frontend/gf-gms-web/src/features/customers/hooks/use-verify-import-customer.ts` + `use-import-customers.ts`

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-PROD-IMPORT` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3-5 dòng), §2 trách nhiệm FE Web, §3 behaviour map 10 AC (AC-1..AC-10), §4 visual fidelity + state machine + i18n + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific. Ghi nhận 4 coverage gaps (AC-8/AC-9 design drift, TAP-14 toast timing, AC-2/AC-3 accept drift). Source FEAT chỉ audit. |
| 2026-06-30 | 2 | Delivery Authority (user directive ninhnguyen@cardoctor.vn) | Bổ sung reference implementation pointer `/customers/import` — route + component + hooks đã implement đúng pattern 2-step verify→confirm. Update §2 (add reuse-precedent bullet với guidance copy structure + thay schema/ops/error-code; ghi rõ Figma thắng khi visual đụng độ nhưng state machine + naming bám reference). Update §13 References (add 3 file paths reference). Mục tiêu: prevent DEV re-design pattern đã có sẵn → drift inconsistency cross-import flow. Cross-boundary edit từ stage W03/PLANNING boundary=W03-ALL — authorized inline bởi user. |
