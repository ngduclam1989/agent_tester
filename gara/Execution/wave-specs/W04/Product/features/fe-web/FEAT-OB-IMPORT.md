---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-OB-IMPORT.md"
source_version: 20
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-IMPORT"
source_feat_sha: "a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8"
generated_at: "2026-07-08T07:00:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-OB-IMPORT"]
consumes_bff_feats: ["FEAT-OB-IMPORT"]
i18n_keys: []
screens_touched:
  - "src/routes/_modules/_inventory/opening-balances/import.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ob-import.md (node 14492:89263 — Import tồn đầu kỳ: 3 states initial/file-selected/preview)"
coverage_gaps:
  - "Route slug: Figma §1 Layout DSL literal route ghi `/inventory/opening-balance/import` (số ít) — theo tiền lệ `FEAT-OB-LIST` (PKG + route thực tế dùng số nhiều `opening-balances`), spec này dùng canonical số nhiều `/inventory/opening-balances/import`."
  - "Frame 1 (node 14646:92037) PNG initial state KHÔNG hiển thị 2 nút 'Huỷ bỏ'/'Xác nhận' ở header (chỉ back-arrow + title) — trái với FEAT AC-1 'nút Xác nhận chỉ enable khi có file hợp lệ đã parse xong' (ngụ ý 2 nút LUÔN hiện, chỉ đổi enable state). Implementation: 2 nút luôn hiện, Xác nhận disabled ở state initial. Figma Frame 1 nhiều khả năng là draft cũ."
  - "Cột 'Lý do lỗi' (cột 11) KHÔNG xuất hiện trong PNG preview (node 14646:93780, chỉ thấy 10 cột) — trái với FEAT AC-4 liệt kê rõ 11 cột gồm 'Lý do lỗi'. Implementation MUST render cột này (visible khi Trạng thái=Lỗi); bảng cần `overflow-x: auto` (Figma §6 Layout Width Table: tổng 11 cột = 1463px > container 1216px)."
  - "Hint dropzone Figma PNG ghi 'Hỗ trợ file: .xls, .xlsx, .csv' trong khi FEAT AC-3b chỉ cho phép `.xlsx` — implementation theo FEAT authoritative (chỉ .xlsx), Figma hint là bản nháp cũ."
  - "Figma không có UI pagination cho bảng preview (`_negative_coverage`: 'implementation may add pagination hoặc virtualize scroll cho file > 500 dòng'). Spec này chọn reuse `share/tables/table-pagination` (client-side pagination trên `previewLines` đã tải hết trong response, KHÔNG re-fetch server) để xử lý cap tối đa 500 dòng — đồng bộ pattern reuse với `FEAT-OB-LIST`."
  - "UX-FLOW bundle §G mô tả 'Có tab \"ĐVT\" reference cạnh vùng upload để user lookup nhanh danh sách ĐVT hợp lệ' — Figma spec (visual SSOT, verified) KHÔNG có UI tab riêng trên trang cho việc này. Interpretation trong spec này: 'tab ĐVT' = worksheet thứ 2 TRONG file `.xlsx` tải về (per FEAT AC-2 explicit '2 tab': 'Danh sách tồn sản phẩm' + 'ĐVT'), KHÔNG phải component UI riêng trên page. NEED CONFIRMATION với BA/PO nếu ý định thực sự là thêm 1 UI lookup panel riêng (sẽ cần Figma bổ sung frame + `/allow-new-component` nếu build-new)."
  - "`OpeningBalanceTotalRow` — REUSE cross-FEAT component đã đề xuất build-new ở `FEAT-OB-LIST §5.2` (chưa merge tại thời điểm spawn spec này). Coordinate với DEV: nếu `FEAT-OB-LIST` implement trước, `FEAT-OB-IMPORT` reuse trực tiếp; nếu ngược lại thì build tại đây và `FEAT-OB-LIST` reuse lại — tránh double-build."
  - "Cột 'ĐVT' và 'Kho' trong bảng preview hiển thị TÊN (unitName/warehouseName) từ dữ liệu file gốc (đã parse client-side) — response `previewLines[]` chỉ trả `resolvedProductCode`/`resolvedWarehouseCode` (KHÔNG trả lại full row). FE PHẢI giữ lại rows đã parse ở client để render đủ 11 cột, chỉ overlay `status`+`errors` theo `rowNumber` từ response verify."
  - "File path `src/features/inventory-opening-balance/**` suy luận theo convention đã dùng ở `FEAT-OB-LIST` (cùng feature slice, cùng epic) — DEV xác nhận/điều chỉnh nếu filesystem thực tế lệch (design repo không truy cập trực tiếp `frontend/gf-gms-web`)."
  - "Bundle §C AC index đếm 'Tổng số AC: 9' nhưng source FEAT thực tế có 10 AC-ID (bao gồm AC-3b — không được bundle liệt kê riêng vì regex chỉ match `AC-\\d+` thuần số). Spec này cover đủ 10/10 AC-ID (đọc trực tiếp source FEAT để xác nhận)."
  - "Lib parse `.xlsx` client-side: đề xuất reuse cùng utility đã dùng ở `FEAT-CAT-PROD-IMPORT` (W03, theo ADR-018 pattern) nếu đã tồn tại trong `frontend/gf-gms-web` — KHÔNG cài đặt lại SheetJS setup mới. DEV xác nhận path utility hiện có (đề xuất `share/uploads/excel-upload` internal implementation)."
  - "Nút 'Xác nhận' `_enabled_rule` trong Figma DSL ghi `hasFile && previewLoaded && !isValidating && (validCount + errorCount > 0)` — KHÔNG check `errorCount === 0`. Spec này theo FEAT AC-6/BR-OB-004a authoritative (disable khi `errorRows > 0`, CR-20260707-01 FE-only atomic gate) — Figma DSL rule có khả năng là bản nháp thiếu điều kiện all-or-nothing."
  - "FEAT AC-4 gọi 3 khối tổng quan là '3 thẻ' (cards) nhưng Figma implement dưới dạng `StatsPills` — 3 dòng text inline màu-mã hoá (KHÔNG phải card có border/shadow riêng). Spec này theo Figma (visual SSOT) — render dạng text pill, KHÔNG dựng UI card component riêng."
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "n/a"
  template_sha: "n/a"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-IMPORT.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-IMPORT (FE Web): Import tồn đầu kỳ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-IMPORT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/routes/_modules/_inventory/opening-balances/import.tsx` |
| Cross-tier consume | BE: `FEAT-OB-IMPORT` \| BFF: `FEAT-OB-IMPORT` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-IMPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-IMPORT.md`](../../../../../Product/features/FEAT-OB-IMPORT.md) |
| Source version | v20 |
| Source SHA | `a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8` |
| Generated at | 2026-07-08T07:00:00Z |

## 1. Mục đích nghiệp vụ

Garage cần một cách nhanh và an toàn để thiết lập số dư tồn kho khởi đầu (số lượng + giá trị) theo mã sản phẩm nội bộ, thay vì nhập tay từng dòng dễ sai sót. Import từ file mẫu bắt buộc phải đi qua bước kiểm tra dữ liệu trước khi ghi — vì tồn đầu kỳ là điểm khởi đầu cho toàn bộ sổ tồn point-in-time và mọi phiếu nhập/xuất phát sinh sau này, sai một dòng sẽ lệch toàn bộ chuỗi số liệu về sau. Cơ chế ghi all-or-nothing bảo vệ tính toàn vẹn của số dư mở đầu — hệ thống tuyệt đối không ghi một phần dữ liệu khi còn dòng lỗi. Đây là cửa ngõ nhập liệu chính, đi ra từ `FEAT-OB-LIST` và quay lại đó sau khi hoàn tất.

## 2. Trách nhiệm FE Web (garage-web)

- Màn **"Tải lên danh sách tồn đầu kỳ"** tại route `/inventory/opening-balances/import` — **single-page** (KHÔNG wizard stepper, per FEAT AC-1 explicit) gồm PageHeader (back-arrow + title + 2 CTA "Huỷ bỏ"/"Xác nhận") + Section "Thông tin cơ bản" (template link + DropZone) + PreviewSection (xuất hiện inline bên dưới sau khi file được phân tích).
- User flow chính: user chọn/kéo thả file `.xlsx` → FE first-check (định dạng/rỗng/>500 dòng — AC-3b) → parse client-side (SheetJS) → tính checksum → gọi `verifyImportOpeningBalances` → render preview inline (3 stats pill + search + 3-tab filter + Tải file lỗi + bảng 11 cột + Total row) → nếu `errorRows === 0`, bấm "Xác nhận" → gọi `importOpeningBalances` → toast SUCCESS + điều hướng về `FEAT-OB-LIST`.
- State machine UI: `initial → file_selected_parsing → preview_loaded (no-errors | with-errors) → submitting → success` (hoặc `error` ở mọi bước network).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Toàn bộ nhu cầu UI feature này match ở layer `share/` (xem §5.2) — không có domain-specific `customs/` fit, không cần build-new mới ngoài `OpeningBalanceTotalRow` reuse cross-FEAT (xem `coverage_gaps`).
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration, screenshot manifest đều theo `Product/ux/figma-web/wave04-ob-import.md` (node `14492:89263`, 3 state: initial `14646:92037` / file-selected `14646:93567` / preview `14646:93780`). §2/§4/§5 references cross-ref figma sections. KHÔNG suy luận visual từ AC/BR text đơn thuần.
- GraphQL op consume từ BFF: mutation `verifyImportOpeningBalances` (preview/kiểm tra dữ liệu, idempotent read-only) + mutation `importOpeningBalances` (commit all-or-nothing, idempotent qua `idempotencyKey`).
- RBAC render: route gate feature-flag `Inventory:InventoryV2` (TanStack Router `beforeLoad`, đồng bộ pattern `FEAT-OB-LIST`); 2 persona `garage-owner` + `accountant` import với quyền ngang nhau — KHÔNG có gating riêng theo role.

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 10/10 source AC-ID (AC-1, AC-2, AC-3, AC-3b, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9 — bundle §C đếm sai "9" vì regex bỏ sót `AC-3b`, xem `coverage_gaps`). Toàn bộ 10 AC đều thuộc phạm vi FE (feature này không có FEAT khác đồng sinh tier fe-web).

### Cluster A — Mở màn & Header actions

#### AC-1 → FE render single-page import shell + header actions luôn hiện

- **Khi**: user bấm nút "Import tồn đầu kỳ" tại `FEAT-OB-LIST` → navigate `/inventory/opening-balances/import`.
- **FE phải**: render `OpeningBalanceImportPage` — PageHeader (back-arrow trái + H1 "Tải lên danh sách tồn đầu kỳ" + ActionRow phải gồm "Huỷ bỏ" outline luôn enable + "Xác nhận" brand). KHÔNG render wizard stepper — toàn bộ nằm trong 1 trang; preview xuất hiện inline bên dưới vùng chọn file sau khi file được phân tích (AC-4). Nút "Xác nhận" disabled_rule: `!hasFile || !previewLoaded || isValidating || totalRows === 0 || errorRows > 0` (per BR-OB-004a all-or-nothing + CR-20260707-01 FE-only atomic gate — xem `coverage_gaps` về lệch rule Figma DSL).
- **State transition**: `initial` (hasFile=false, previewLoaded=false).
- **Component**: `share/layouts/page-header` (PageHeader), `share/buttons/button` (CancelButton outline luôn enable, ConfirmButton brand disabled ban đầu).
- **GraphQL op**: N/A (page mount — chỉ render shell, không fetch).
- **i18n keys**: N/A — fixed VN "Tải lên danh sách tồn đầu kỳ" / "Huỷ bỏ" / "Xác nhận" (không dùng i18next, xem §4.3).
- **a11y**: H1 heading semantics cho PageTitle; BackLink `aria-label="Quay lại danh sách tồn đầu kỳ"`.
- **Ref**: figma spec `wave04-ob-import.md` §1 Layout DSL `PageHeader` + `ActionRow._visibility_rule: "always visible"`, node `14646:92037`; anti-pattern AP-OB-IMP-1/AP-OB-IMP-2.

#### AC-7 → FE Huỷ bỏ / back — đóng màn không ghi dữ liệu

- **Khi**: user bấm "Huỷ bỏ" (header phải) hoặc back-arrow (header trái).
- **FE phải**: `navigate('/inventory/opening-balances')` ngay lập tức — KHÔNG gọi mutation, KHÔNG lưu state, KHÔNG hỏi xác nhận (feature không yêu cầu dialog "are-you-sure").
- **Component**: `share/buttons/button` variant outline (CancelButton), IconButton ghost (BackLink).
- **GraphQL op**: N/A (pure navigation).
- **i18n keys**: N/A — fixed "Huỷ bỏ".
- **a11y**: `aria-label="Huỷ bỏ import, quay lại danh sách"`.
- **Ref**: figma spec §1 `CancelButton.onClick` / `BackLink.onClick`.

### Cluster B — Tải template

#### AC-2 → FE render link tải template (FE bundled static asset, 2-tab `.xlsx`)

- **Khi**: user bấm link **"📄 Mẫu file danh sách tồn đầu kỳ.xlsx"**.
- **FE phải**: trigger download file `.xlsx` **bundled sẵn trong FE build** (sync từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` → `frontend/gf-gms-web/src/assets/`) — **KHÔNG** gọi BE/BFF endpoint (ADR-022, BA/PO chốt 2026-07-06, GraphQL op `getOpeningBalanceTemplate` đã bị xoá khỏi SDL). File gồm 2 tab: **"Danh sách tồn sản phẩm"** (cột STT · Mã nội bộ \* · Tên sản phẩm \* · ĐVT \* · Kho \* · SL tồn \* · Giá trị tồn · Tồn đến ngày \*) + **"ĐVT"** (tham chiếu — cột STT · Mã · Tên ĐVT, liệt kê danh mục đơn vị tính master).
- **State transition**: không đổi state page (static download, không ảnh hưởng `hasFile`).
- **Component**: `TemplateDownloadLink` (anchor với leading icon Document, trỏ tới static asset import — không cần component registry riêng, dùng `share/navigates/link` styling).
- **GraphQL op**: N/A (static asset — không có API call).
- **i18n keys**: N/A — fixed verbatim "Mẫu file danh sách tồn đầu kỳ.xlsx".
- **a11y**: link có `aria-label` mô tả rõ "Tải file mẫu import tồn đầu kỳ".
- **Ref**: figma spec §1 `TemplateDownloadLink`, node `14646:92037`; anti-pattern AP-OB-IMP-9 (verbatim filename, KHÔNG rút gọn).
- **Ghi chú**: tab "ĐVT" ở đây là worksheet **thứ 2 TRONG file `.xlsx`** tải về — KHÔNG phải một UI tab riêng trên trang web (xem `coverage_gaps` — NEED CONFIRMATION với BA/PO nếu ý định là thêm panel lookup ĐVT riêng trên page).

### Cluster C — Chọn & kiểm tra cấp file

#### AC-3 → FE nhận file qua dropzone/click, parse client-side, render file card + trigger preview

- **Khi**: user kéo thả hoặc bấm chọn file trong DropZone (text **"Kéo thả hoặc nhấn để chọn tệp"**, hint **"Hỗ trợ file: .xlsx"**).
- **FE phải**: nhận `File` object → chạy first-check gate (AC-3b) → nếu pass, parse `.xlsx` browser-side (SheetJS/`xlsx` lib — reuse cùng utility đã dùng ở `FEAT-CAT-PROD-IMPORT` W03 theo ADR-018 pattern, KHÔNG duplicate setup mới, xem `coverage_gaps`) → tính `fileChecksum` dạng `sha256:{hex}` (Web Crypto `crypto.subtle.digest('SHA-256', ...)`) → render `FileCard` (icon XLS xanh + `{file.name}` + `{file.sizeFormatted}` + nút xóa 🗑) ngay dưới DropZone (DropZone vẫn hiện, cho phép thay file) → gọi mutation `verifyImportOpeningBalances(input: { fileName, fileChecksum, rows })` với `rows` map từ dữ liệu đã parse → render `PreviewSection` inline khi response trả về (AC-4). **KHÔNG ghi dữ liệu ở bước này** (chỉ parse + preview, per FEAT AC-3 explicit).
- **State transition**: `initial → file_selected_parsing → preview_loaded`.
- **Component**: `share/uploads/excel-upload` (DropZone root — file picker + parse + validation summary orchestration), `share/files/file-thumbnail` (FileCard hiển thị sau khi chọn, `onDelete` reset về `initial` + clear preview).
- **GraphQL op**: `verifyImportOpeningBalances(input: VerifyImportOpeningBalancesInput!)`.
- **i18n keys**: N/A — fixed "Kéo thả hoặc nhấn để chọn tệp" / "Hỗ trợ file: .xlsx".
- **a11y**: DropZone `role="button"` + `aria-label="Chọn tệp import tồn đầu kỳ"`; FileDeleteButton `aria-label="Xóa file đã chọn"`.
- **Ref**: figma spec §1 `DropZone` + `FileCard`, node `14646:93780`; anti-pattern AP-OB-IMP-4 (KHÔNG ghi dữ liệu khi chọn file), AP-OB-IMP-10 (icon `iconsax-reactjs`, không `lucide-react`).

#### AC-3b → FE first-check gate — 3 nhánh ngữ nghĩa khác nhau

- **Khi**: file **không phải `.xlsx`** hoặc **không đọc được**.
- **FE phải**: reject ngay client-side (trước khi parse), hiển thị message thân thiện **"Vui lòng chọn file .xlsx"** — **KHÔNG có mã lỗi Product-registered** cho nhánh này (nếu bị bypass qua BFF thì BE trả HTTP 400 thuần `ERR-CMN-validation`). KHÔNG chuyển sang bước preview.
- **Khi**: file hợp lệ nhưng có **> 500 dòng dữ liệu**.
- **FE phải**: đếm số dòng ngay khi SheetJS parse xong → reject client-side (tầng 1 trong 3 tầng defense-in-depth FE/BFF/BE per ADR-022) → hiển thị banner ERROR verbatim `ERR-INV-048` — **"Vượt giới hạn 500 dòng/lần import — vui lòng tách file"** — KHÔNG gọi mutation verify.
- **Khi**: file hợp lệ nhưng **0 dòng dữ liệu** (chỉ có header).
- **FE phải**: **KHÔNG reject, KHÔNG hiển thị mã lỗi** — cho qua sang bước preview (gọi `verifyImportOpeningBalances` với `rows: []`) → response trả `totalRows=0 / validRows=0 / errorRows=0 / canCommit=false` → FE render banner **INFO** "File không có dữ liệu, không có gì để import" trong vùng preview (thay bảng data, header cột vẫn không hiện vì không có gì để show) + nút "Xác nhận" disabled (rule `totalRows === 0`). Đây **KHÔNG phải error state** — ngữ nghĩa khác biệt hoàn toàn với `ERR-INV-048` và extension-mismatch (BA/PO chốt 2026-07-06, ADR-022 §Decision).
- **State transition**: `initial → file_rejected` (2 nhánh đầu) hoặc `initial → file_selected_parsing → preview_loaded` với banner INFO (nhánh 3).
- **Component**: `share/uploads/excel-upload` (validate hook đếm rows + check extension trước parse), `share/emptys/no-data` (banner INFO empty-file, caption "File không có dữ liệu, không có gì để import").
- **GraphQL op**: N/A cho 2 nhánh reject đầu (client-only gate, không gọi mutation); nhánh empty-file **VẪN gọi** `verifyImportOpeningBalances` với `rows: []` (per contract BE — không phải client-only skip).
- **i18n keys**: N/A — fixed message từng nhánh (không dùng i18next).
- **a11y**: banner reject `role="alert"`; banner INFO `role="status"`.
- **Ref**: ADR-022 §Decision (3 nhánh ngữ nghĩa khác nhau, BA/PO 2026-07-06); FEAT AC-3b; anti-pattern AP-OB-IMP-3 (chỉ `.xlsx`) / AP-OB-IMP-5 (reject >500 dòng).

### Cluster D — Preview & kiểm tra dữ liệu (inline)

#### AC-4 → FE render preview: 3 stats pill + search + 3-tab filter + Tải file lỗi + bảng 11 cột + Total row

- **Khi**: `verifyImportOpeningBalances` trả response thành công (`previewLoaded = true`).
- **FE phải**: render `FilterAndStatsRow` gồm — SearchInput placeholder **"Tìm theo mã nội bộ, tên sản phẩm"** (debounce 300ms, filter **client-side** trên rows đã có sẵn trong bộ nhớ — KHÔNG re-call mutation); 3-tab filter **"Tất cả / Hợp lệ / Lỗi"** (filter client-side theo `previewLines[].status`); 3 stat pill màu-mã hoá **"Tổng cộng: {totalRows}"** (mặc định) / **"Hợp lệ: {validRows}"** (xanh) / **"Lỗi: {errorRows}"** (đỏ); nút **"Tải file lỗi"** — enable khi `errorRows > 0`, xuất file `.xlsx` **client-side** chỉ chứa các dòng `status='ERROR'` kèm cột "Lý do lỗi". Render `PreviewTable` **11 cột**: STT · Dòng · Tồn đến ngày · Kho · Mã nội bộ (link xanh) · Tên nội bộ · ĐVT · SL tồn (phải) · Giá trị tồn (phải, VND) · Trạng thái (badge) · Lý do lỗi (chỉ hiện khi Trạng thái=Lỗi). **Lưu ý dữ liệu**: response `previewLines[]` chỉ trả `rowNumber/status/resolvedProductCode/resolvedWarehouseCode/errors[]` — FE phải **giữ lại rows đã parse client-side** (giàu field hơn: `tonDenNgay/kho/product/unit/soLuongTon/giaTriTon`) và **overlay** `status`+`errors` theo `rowNumber` để render đủ 11 cột. Render `TotalRow` cuối bảng = tổng SL tồn + Giá trị tồn của **toàn bộ file** (không đổi theo filter tab, theo Figma).
- **State transition**: `preview_loaded_no_errors` hoặc `preview_loaded_with_errors`.
- **Component**: `share/inputs/input-search` (SearchInput), `share/tabs/tab-buttons` (3-tab filter), `share/exports/export-excel` (nút "Tải file lỗi" — xuất `.xlsx` client-side), `share/tables/table-pagination` (PreviewTable — thêm client-side pagination cho cap tối đa 500 dòng dù Figma PNG không show pagination, xem `coverage_gaps`), `OpeningBalanceTotalRow` (**REUSE cross-FEAT** từ `FEAT-OB-LIST`, xem §12).
- **GraphQL op**: field `data { totalRows validRows errorRows warehousesInFile previewLines { rowNumber status resolvedProductCode resolvedWarehouseCode errors { code field message } } canCommit warningLockCheckUnavailable }` trong response `verifyImportOpeningBalances`.
- **i18n keys**: N/A — fixed verbatim "Tổng cộng" / "Hợp lệ" / "Lỗi" / "Tìm theo mã nội bộ, tên sản phẩm" / "Tải file lỗi" / "Tổng" / "Tất cả".
- **a11y**: `<th scope="col">` mỗi cột; DownloadErrorButton `aria-label="Tải file các dòng lỗi"`, tự động `disabled` khi `errorRows === 0`.
- **Ref**: figma spec §1 `FilterAndStatsRow` + `PreviewTable` + `TotalRow`, node `14646:93780`; anti-pattern AP-OB-IMP-6 (cột Lý do lỗi MUST render dù Figma PNG missing) + AP-OB-IMP-8 (Tải file lỗi disabled khi `errorCount=0`).

#### AC-5 → FE render badge Trạng thái 2-variant + cột Lý do lỗi rút gọn wording

- **Khi**: `previewLines[i].status === 'ERROR'`.
- **FE phải**: render badge **"Lỗi"** (nền đỏ, text đậm, text-only KHÔNG icon) tại cột Trạng thái + cột Lý do lỗi hiển thị wording **rút gọn** map từ `errors[0].code` (bảng mapping đầy đủ ở §4.6, vd `ERR-INV-009` → "Sai mã", `ERR-INV-024` → "Kỳ đã đóng", `ERR-INV-019` → "ĐVT lệch") — giữ mã lỗi API đầy đủ trong data model nội bộ (phục vụ debug/tải file lỗi) nhưng **không hiển thị mã thô** cho user trên UI.
- **Khi**: `previewLines[i].status === 'VALID'`.
- **FE phải**: render badge **"Hợp lệ"** (nền xanh, text đậm), cột Lý do lỗi **để trống**.
- **State transition**: render phase của `preview_loaded` (AC-4).
- **Component**: `share/badges/badge-status` (variant `success` cho "Hợp lệ" / `error` cho "Lỗi").
- **GraphQL op**: field `previewLines[].status` + `previewLines[].errors[].code/message`.
- **i18n keys**: N/A — fixed badge label "Hợp lệ"/"Lỗi", wording rút gọn hardcode theo bảng mapping §4.6.
- **a11y**: badge text-only, row `aria-label` nêu trạng thái (vd `aria-label="Dòng 3: Lỗi — Sai mã"`).
- **Ref**: figma spec §1 `TrangThaiCell` (BadgeCell) + `LyDoLoiCell`, node `14646:93780`; anti-pattern AP-OB-IMP-7 (badge text-only, không icon).

### Cluster E — Xác nhận (all-or-nothing)

#### AC-6 → FE trigger commit all-or-nothing + disable "Xác nhận" khi còn dòng lỗi

- **Khi**: `errorRows === 0 && totalRows > 0` và user bấm "Xác nhận".
- **FE phải**: sinh `idempotencyKey` client-side theo format `OB-IMPORT-{tenantId}-{uuid}` (`crypto.randomUUID()`, `tenantId` từ session/auth context — cùng pattern các mutation khác toàn app) → gọi mutation `importOpeningBalances(input, idempotencyKey)` gửi lại **đúng payload rows** đã verify (không re-parse file) → disable toàn bộ ActionRow + hiện spinner (`isLoading`) trong lúc `submitting` → success → điều hướng theo AC-8.
- **Khi**: `errorRows > 0` (còn dòng lỗi, kể cả 1 dòng).
- **FE phải**: giữ nút "Xác nhận" **disabled** (client-side gate — CR-20260707-01 FE-only atomic, bổ sung layer chặn phía FE **bên cạnh** chặn phía BE all-or-nothing per BR-OB-004a) + hiển thị cảnh báo inline gần nút Xác nhận **"Còn dòng lỗi — vui lòng sửa file rồi kiểm tra lại trước khi import."**.
- **Khi**: `warningLockCheckUnavailable === true` (verify-path fail-OPEN marker, ADR-021).
- **FE phải**: hiển thị banner cảnh báo **"Không thể xác định trạng thái kỳ — vui lòng thử lại"** và giữ nút "Xác nhận" disabled cho đến khi verify thành công không còn cảnh báo này.
- **State transition**: `preview_loaded_no_errors → submitting → success` hoặc giữ `preview_loaded_with_errors` (Xác nhận vẫn disabled).
- **Component**: `share/buttons/button` variant brand (`isLoading` khi `submitting`).
- **GraphQL op**: `importOpeningBalances(input: VerifyImportOpeningBalancesInput!, idempotencyKey: String!)`.
- **i18n keys**: N/A — fixed "Xác nhận" / cảnh báo verbatim.
- **a11y**: ConfirmButton `aria-disabled` phản ánh state; text cảnh báo `role="alert"`.
- **Ref**: figma spec §1 `ConfirmButton._enabled_rule` (lưu ý rule Figma DSL KHÔNG check `errorCount === 0` — FE tuân theo FEAT AC-6/BR-OB-004a authoritative, xem `coverage_gaps`); anti-pattern AP-OB-IMP-2.

### Cluster F — Kết quả

#### AC-8 → FE toast SUCCESS + điều hướng về danh sách

- **Khi**: `importOpeningBalances` trả 200 thành công.
- **FE phải**: hiển thị toast SUCCESS ở góc phải trên verbatim **"Tải tệp lên thành công!"** → `navigate('/inventory/opening-balances')` (unmount form). **KHÔNG hiển thị màn kết quả riêng** — bước preview (AC-4/AC-5) đã cho user thấy số dòng hợp lệ/lỗi + tải file lỗi trước khi confirm; audit (Người import/Ngày import/Filename/Checksum) lưu backend, tra được qua `FEAT-OB-LIST` (cột Người import + Ngày import).
- **State transition**: `submitting → success` (unmount page).
- **Component**: `share/toasts/toast` (variant success).
- **GraphQL op**: response `data.importOpeningBalances.data { totalRows importedRows importedAt importedBy fileName fileChecksum alreadyImported cascadedKeys }`.
- **i18n keys**: N/A — fixed "Tải tệp lên thành công!".
- **a11y**: toast `role="status"`, auto-dismiss.
- **Ref**: FEAT AC-8 (v13 Change Log — bỏ màn kết quả riêng, dùng toast); figma spec không có màn kết quả riêng (đồng nhất).

### Cluster G — Phân quyền & tenant

#### AC-9 → FE không có gating riêng theo persona; feature-flag gate route

- **Khi**: chủ garage hoặc kế toán truy cập route `/inventory/opening-balances/import`.
- **FE phải**: KHÔNG có logic ẩn/hiện action theo persona — cả 2 role (`garage-owner`, `accountant`) thấy đầy đủ import flow ngang nhau. Route chỉ gate theo feature-flag `Inventory:InventoryV2` (TanStack Router `beforeLoad`, đồng bộ pattern `FEAT-OB-LIST`), KHÔNG gate theo persona. Tenant scope tự động qua JWT/session — không có filter/param FE tự set tenant.
- **Component**: TanStack Router `beforeLoad` guard (feature-flag only).
- **GraphQL op**: N/A (session-scoped server-side).
- **i18n keys**: N/A.
- **a11y**: N/A.
- **Ref**: BR-OB-CMN-002 (tenant/persona enforce BE); §4.4 RBAC + feature flag.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave04-ob-import.md` (node `14492:89263`, 3 state: initial `14646:92037` / file-selected `14646:93567` / preview `14646:93780`). KHÔNG re-invent layout/spacing/color.
- Design tokens: `bg-brand` (Navbar + ConfirmButton fill), `bg-accent` (TotalRow background), `bg-destructive` (Badge "Lỗi" + stat "Lỗi" text màu đỏ), `bg-muted` (FileCard background), `text-foreground` (PageTitle + TableRow text), `text-muted-foreground` (TableHeader label + SearchInput placeholder + DropZoneHint), `text-primary` (ConfirmButton label text). Tokens MUST khớp bundle §G.Y "Design tokens referenced" — không hardcode hex/px.
- Icon library `iconsax-reactjs` (garage-web convention v7.6) — KHÔNG dùng `lucide-react` (anti-pattern AP-OB-IMP-10).
- Section "Thông tin cơ bản" + Header + template link + DropZone **luôn hiện** kể cả sau khi chọn file — chỉ vùng PreviewSection thay đổi theo state (ẩn ở `initial`, hiện ở `preview_loaded`).
- Header 2 nút "Huỷ bỏ"/"Xác nhận" **luôn hiện** (chỉ đổi enable state) — Frame 1 Figma PNG thiếu 2 nút này là draft cũ (xem `coverage_gaps`).
- Cột "Lý do lỗi" **MUST render** dù PNG Figma preview bị thiếu/cắt cạnh (xem `coverage_gaps`) — bảng cần `overflow-x: auto`.
- Mọi visual AC (badge trạng thái, stats pill màu, Total row) MUST cross-ref figma section tương ứng (đã ghi ở §3 mỗi AC).

### 4.2 State machine + error handling

- State transition tường minh: `initial | file_selected_parsing | preview_loaded_no_errors | preview_loaded_with_errors | file_rejected | submitting | success`. `error` (network) có thể xảy ra ở bước `verifyImportOpeningBalances` hoặc `importOpeningBalances`.
- Error network/downstream (`TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` / `UNKNOWN_ERROR`) → TOAST, giữ nguyên page state (không unmount, không mất file đã chọn).
- `503` fail-CLOSED tại commit-path (`importOpeningBalances`, gf-accounting lock-check unreachable per ADR-021) → TOAST **"Hệ thống đang bận, vui lòng thử lại sau."** (`ERR-CMN-007`), giữ preview + không unmount.
- `warningLockCheckUnavailable: true` tại verify-path (fail-OPEN marker) → BANNER cảnh báo (không phải error toast), disable "Xác nhận" cho đến khi verify lại thành công.
- KHÔNG silent fail — mọi error reach UI qua toast/banner.

### 4.3 i18n + a11y

- **Fixed VN labels (KHÔNG dùng i18next)** — theo pattern established ở `FEAT-CAT-PROD-IMPORT` (W03) + `FEAT-OB-LIST` (W04). `i18n_keys: []`.
- DropZone/SearchInput: `aria-label` mô tả rõ mục đích.
- Table: `<th scope="col">` mỗi cột; icon-only action (FileDeleteButton, BackLink) PHẢI có `aria-label`.
- Banner reject (extension mismatch, >500 dòng) `role="alert"`; banner INFO (empty-file) `role="status"`.
- Toast success `role="status"` auto-dismiss.

### 4.4 RBAC render + feature flag

- Feature-flag `Inventory:InventoryV2` gate route `/inventory/opening-balances/import` qua TanStack Router `beforeLoad` (CR-20260707-02) — flag OFF → redirect.
- Persona check: chỉ 2 actor `garage-owner` + `accountant` (Critical Rule #6) — cả 2 có quyền import ngang nhau, KHÔNG có role-based hide/disable riêng trong feature này.
- Route guard chạy TRƯỚC khi render UI component nào (loader-level, không show-then-disable).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE tier (xem paired `be/FEAT-OB-IMPORT.md §9` khi được author). FE chỉ:
  - Disable nút "Xác nhận" khi `errorRows > 0` hoặc `totalRows === 0` (BR-OB-004a/BR-OB-004b UI hint — CR-20260707-01 FE-only atomic gate bổ sung).
  - Reject client-side extension sai/vượt 500 dòng trước khi gọi mutation (BR-OB-004b tầng 1 defense-in-depth).
  - Hiển thị badge/wording rút gọn cho 10 loại lỗi validate row-level (BR-OB-005..016) — BE final enforce.
  - Sinh checksum + idempotencyKey đúng format cho audit (BR-OB-CMN-001).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Wording rút gọn (UI, cột Lý do lỗi) | Display mode | Source AC |
|---|---|---|---|
| `ERR-INV-009` | "Sai mã" (mã sản phẩm không tồn tại) | INLINE (cell) | AC-5 |
| `ERR-INV-010` | "SP ngừng hoạt động" | INLINE | AC-5 |
| `ERR-INV-017` | "Thiếu trường bắt buộc" | INLINE | AC-5 |
| `ERR-INV-018` | "Sai định dạng ngày" | INLINE | AC-5 |
| `ERR-INV-019` | "ĐVT lệch" | INLINE | AC-5 |
| `ERR-INV-020` | "Kho không tồn tại" | INLINE | AC-5 |
| `ERR-INV-024` | "Kỳ đã đóng" | INLINE | AC-5 |
| `ERR-INV-032` | "SL tồn ≤ 0" | INLINE | AC-5 |
| `ERR-INV-033` | "GT tồn < 0" | INLINE | AC-5 |
| `ERR-INV-034` | "Trùng mã+kho" | INLINE | AC-5 |
| `ERR-INV-035` | "OB sau phiếu" | INLINE | AC-5 |
| `ERR-INV-036` | "Tồn âm" | INLINE | AC-5 |
| `ERR-INV-048` | — | BANNER (pre-preview, verbatim "Vượt giới hạn 500 dòng/lần import — vui lòng tách file") | AC-3b |
| `ERR-CMN-validation` | — | INLINE (client, extension mismatch pre-preview) | AC-3b |
| `ERR-CMN-007` (HTTP 503) | — | TOAST ("Hệ thống đang bận, vui lòng thử lại sau.") | AC-6 (commit-path fail-CLOSED) |
| `warningLockCheckUnavailable` | — | BANNER (disable "Xác nhận") | AC-4/AC-6 (verify-path fail-OPEN) |
| `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` / `UNKNOWN_ERROR` | — | TOAST | AC-3, AC-6 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `OpeningBalanceImportPage` | `/inventory/opening-balances/import` | NEW | `14646:92037` (initial) / `14646:93567` (file-selected) / `14646:93780` (preview) | AC-1, AC-2, AC-3, AC-3b, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Author consult `.claude/references/web-component-registry.yaml` §1/§2 để biết component có sẵn ở priority cao nhất. Build-new entry phải có justification rằng cả 3 layer không có component fit.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `share/layouts/page-header` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, backLink, actions }` | — | **Priority 2 — share/** | AC-1 |
| `share/buttons/button` | `src/components/share/buttons/button.tsx` | REUSE | `variant`, `size`, `isLoading`, `disabled` | — | **Priority 2 — share/** (CancelButton outline, ConfirmButton brand) | AC-1, AC-6, AC-7 |
| `share/navigates/link` | `src/components/share/navigates/link.tsx` | REUSE | `{ href, children, icon }` | — | **Priority 2 — share/** (TemplateDownloadLink) | AC-2 |
| `share/uploads/excel-upload` | `src/components/share/uploads/excel-upload.tsx` | REUSE | `{ accept: ".xlsx", maxRows: 500, onParsed, onReject }` | parsing/parsed | **Priority 2 — share/** (anatomy "file picker + parse + validation summary" — khớp trực tiếp DropZone + first-check gate) | AC-3, AC-3b |
| `share/files/file-thumbnail` | `src/components/share/files/file-thumbnail.tsx` | REUSE | `{ name, size, onDelete }` | — | **Priority 2 — share/** (FileCard) | AC-3 |
| `share/emptys/no-data` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ caption }` | — | **Priority 2 — share/** (banner INFO empty-file, caption "File không có dữ liệu, không có gì để import") | AC-3b |
| `share/inputs/input-search` | `src/components/share/inputs/input-search.tsx` | REUSE | `{ placeholder, onChange }` | debounce local | **Priority 2 — share/** | AC-4 |
| `share/tabs/tab-buttons` | `src/components/share/tabs/tab-buttons.tsx` | REUSE | `{ value, onValueChange, options }` | active tab | **Priority 2 — share/** (3-tab filter Tất cả/Hợp lệ/Lỗi) | AC-4 |
| `share/exports/export-excel` | `src/components/share/exports/export-excel.tsx` | REUSE | `{ rows, columns, fileName, disabled }` | — | **Priority 2 — share/** (nút "Tải file lỗi" — xuất `.xlsx` client-side các dòng ERROR) | AC-4 |
| `share/tables/table-pagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `{ columns, rows, pageSize, currentPage, totalCount, onPageChange }` | client-side pagination | **Priority 2 — share/** (PreviewTable — cap 500 dòng, xem `coverage_gaps` về pagination client-side) | AC-4 |
| `share/badges/badge-status` | `src/components/share/badges/badge-status.tsx` | REUSE | `{ status: "success" \| "error", label }` | — | **Priority 2 — share/** (Trạng thái badge Hợp lệ/Lỗi) | AC-5 |
| `share/toasts/toast` | `src/components/share/toasts/toast.tsx` | REUSE | `{ variant: "success", message }` | — | **Priority 2 — share/** | AC-8 |
| `OpeningBalanceTotalRow` (feature-shared, kebab-case file) | `src/features/inventory-opening-balance/components/opening-balance-total-row.tsx` | **REUSE (cross-FEAT)** | `{ totalQuantity, totalValue }` | local (stateless) | **REUSE cross-FEAT** — component đã đề xuất build-new tại `FEAT-OB-LIST §5.2` (cùng feature slice `inventory-opening-balance`); coordinate build-once, KHÔNG duplicate (xem `coverage_gaps`) | AC-4 |

### 5.3 Design tokens & Figma refs

> Design tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced" (anti-hallucination guard — reviewer item #21 check). Figma refs reference figma spec file paths, không chỉ node-id.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-brand` | `tailwind.config.js` (`@theme` custom) | Navbar + ConfirmButton fill `#0052ff` | AC-1, AC-6 |
| `bg-accent` | `src/styles/tokens/**` | TotalRow background highlight | AC-4 |
| `bg-destructive` | tokens | Badge "Lỗi" background / stat "Lỗi" màu đỏ | AC-4, AC-5 |
| `bg-muted` | tokens | FileCard background (`bg-muted/50`) | AC-3 |
| `text-foreground` | tokens | PageTitle + TableRow default text color | AC-1, AC-4 |
| `text-muted-foreground` | tokens | TableHeader label + SearchInput placeholder + DropZoneHint | AC-3, AC-4 |
| `text-primary` | tokens | ConfirmButton label text (primary-foreground on brand background) | AC-1, AC-6 |

> **Figma source-of-truth**: visual/micro-interaction/responsive đều theo `Product/ux/figma-web/wave04-ob-import.md`. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `verifyImportOpeningBalances` | mutation | `src/api/graphql/opening-balance/verify-import-opening-balances.graphql` | — (one-shot, không cache) | `VerifyImportOpeningBalancesResultFragment` | AC-3, AC-3b, AC-4, AC-5 |
| `importOpeningBalances` | mutation | `src/api/graphql/opening-balance/import-opening-balances.graphql` | — (one-shot, không cache) | `ImportOpeningBalancesResultFragment` | AC-6, AC-8 |

> **Cross-tier note (item #16)**: cả 2 mutation thuộc module `opening-balance` (agg-garage-graph-graphql.md §3g.2 W04-M1/W04-M2) — passthrough xuống `gf-inventory POST /api/v2/opening-balances/verify-import` (W04-3) và `POST /api/v2/opening-balances/import` (W04-4, header `X-Idempotency-Key`). SDL types: `VerifyImportOpeningBalancesInput`, `OpeningBalanceImportRow` (per-row, gửi cả canonical `mainUnitCode`/`warehouseId` VÀ display fallback `unitName`/`warehouseName` per v7.56 "Add alongside" migration), `VerifyImportOpeningBalancesResult`, `OpeningBalancePreviewLine`, `ImportOpeningBalancesResult`, `StockLedgerCascadeAudit`.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| — | — | (none — mọi traffic qua BFF `agg-garage-graph`) | boundary isolation | — |

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Client state (file + parse) | React local state | `OpeningBalanceImportPage` | `{ hasFile, fileMeta, parsedRows, fileChecksum }` | AC-3, AC-3b |
| Client state (preview) | React local state | `OpeningBalanceImportPage` | `{ previewLoaded, previewLines, totalRows, validRows, errorRows, canCommit, warningLockCheckUnavailable }` | AC-4, AC-5, AC-6 |
| Client state (filter/search) | React local state | `OpeningBalanceImportPage` | `{ keyword, statusTab, page }` | AC-4 |
| Server state (mutation) | TanStack Query `useMutation` | — | `verifyImportOpeningBalances` / `importOpeningBalances` (one-shot, không query key persist) | AC-3, AC-6 |
| Form state | — | — | (không phải RHF form — file upload + preview flow) | — |
| Optimistic UI | — | — | (import là critical write — không optimistic, chờ response) | — |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/opening-balances/import` | `OpeningBalanceImportPage` | (không prefetch — không có initial data fetch) | RBAC: `garage-owner \| accountant` + feature-flag `Inventory:InventoryV2` | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/routes/_modules/_inventory/opening-balances/` | `import.tsx` | NEW | TanStack Router file route | ~30 | AC-1 |
| `src/features/inventory-opening-balance/pages/` | `opening-balance-import-page.tsx` | NEW | compose reuse components §5.2 | ~260 | AC-1-AC-9 |
| `src/features/inventory-opening-balance/components/` | `opening-balance-preview-table.tsx` | NEW | wraps `table-pagination` + `badge-status` + Lý do lỗi mapping | ~120 | AC-4, AC-5 |
| `src/features/inventory-opening-balance/components/` | `opening-balance-total-row.tsx` | **REUSE cross-FEAT** (không tạo lại nếu `FEAT-OB-LIST` đã build) | aggregate footer row | 0 (reuse) | AC-4 |
| `src/features/inventory-opening-balance/hooks/` | `use-opening-balance-import.ts` | NEW | parse xlsx + checksum + verify/import mutation orchestration + idempotencyKey gen | ~150 | AC-3, AC-3b, AC-6 |
| `src/features/inventory-opening-balance/utils/` | `opening-balance-error-export.ts` | NEW | build error-rows `.xlsx` via `share/exports/export-excel` | ~40 | AC-4 |
| `src/features/inventory-opening-balance/types/` | `opening-balance-import.types.ts` | NEW | TypeScript types (mirror SDL) | ~40 | — |
| `src/api/graphql/opening-balance/` | `verify-import-opening-balances.graphql` | ADDITIVE | persisted query | ~25 | AC-3, AC-4, AC-5 |
| `src/api/graphql/opening-balance/` | `import-opening-balances.graphql` | ADDITIVE | persisted query | ~25 | AC-6, AC-8 |
| `src/api/generated/` | `verify-import-opening-balances.generated.ts` + `import-opening-balances.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/assets/` | `Mẫu Import tồn đầu kỳ.xlsx` | ADDITIVE (sync từ `Product/ux/assets/`) | bundled static asset | — | AC-2 |
| `tests/features/inventory-opening-balance/` | `opening-balance-import-page.test.tsx` | NEW | Vitest + RTL | ~200 | AC-1-AC-9 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL §3g W04-M1/W04-M2 verifyImportOpeningBalances/importOpeningBalances stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave04-ob-import.md)
    Exit: E2E happy path green (smoke) — upload → parse → verify preview → confirm → toast → navigate
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components (dropzone/preview-table/total-row reuse) + routing + state + reuse-first gate | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ:
> - Client-side gate (extension/500 dòng) trước khi gọi mutation (defense-in-depth tầng 1).
> - Disable "Xác nhận" khi còn dòng lỗi (all-or-nothing UI hint).
> - Hiển thị badge/wording rút gọn cho error → display mode mapping (§4.6).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-004a` | CORNERSTONE | Disable "Xác nhận" khi `errorRows > 0`; cảnh báo inline | `opening-balance-import-page.tsx::ConfirmButton` | AC-6 | BE final enforce (transaction rollback) |
| `BR-OB-004b` | CORNERSTONE | Reject client-side `.xlsx`-only + cap 500 dòng trước preview | `use-opening-balance-import.ts::validateFile` | AC-3b | BFF + BE re-check defensive |
| `BR-OB-005` | NORMAL | Render lỗi "Kho không tồn tại" (`ERR-INV-020`) | `opening-balance-preview-table.tsx` | AC-5 | BE resolve warehouse |
| `BR-OB-006..011` | NORMAL | Render 6 loại lỗi validate field-level (mã/SL/GT/ĐVT/thiếu trường/ngày) | `opening-balance-preview-table.tsx` | AC-5 | BE final enforce |
| `BR-OB-012` | CORNERSTONE | Render lỗi trùng (mã+kho) `ERR-INV-034` | `opening-balance-preview-table.tsx` | AC-5 | BE chặn ghi |
| `BR-OB-013` / `BR-OB-015` / `BR-OB-016` | CORNERSTONE | Render lỗi kỳ đóng/tồn âm/OB sau phiếu (`ERR-INV-024`/`036`/`035`) | `opening-balance-preview-table.tsx` | AC-5 | Cross-boundary lock-check ADR-021 |
| `BR-OB-CMN-001` | NORMAL | Sinh checksum + gửi filename cho audit | `use-opening-balance-import.ts` | AC-3, AC-6 | Audit lưu backend |
| `BR-OB-CMN-002` | CORNERSTONE | Không gating riêng theo persona | `import.tsx` route guard | AC-9 | Feature-flag only gate |

> **Primary enforcement** = BE tier (`features/be/FEAT-OB-IMPORT.md §9` khi được author).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | render single-page shell, Xác nhận disabled ban đầu |
| AC-2 | UI (navigation/download) | test-ui | template link trigger download bundled asset |
| AC-3 | UI (file upload) | test-ui | dropzone chọn/kéo thả file, FileCard render, parse trigger verify |
| AC-3b | UI (negative — 3 nhánh) | test-ui | extension sai / >500 dòng / file rỗng |
| AC-4 | UI (calculation display) | test-ui | 3 stats pill + search + filter tab + Tải file lỗi + 11 cột + Total row |
| AC-5 | UI (state toggle) | test-ui | badge 2-variant + Lý do lỗi wording rút gọn |
| AC-6 | UI (all-or-nothing gate) | test-ui | Xác nhận disabled khi errorRows>0, enable khi 0 |
| AC-7 | UI (navigation) | test-ui | Huỷ bỏ/back không ghi dữ liệu |
| AC-8 | UI (toast + navigation) | test-ui | toast verbatim + điều hướng danh sách |
| AC-9 | UI (RBAC visibility) | test-ui + test-isolation | dual persona ngang quyền + feature-flag gate |
| (smoke) | E2E happy path | test-e2e | Playwright: chọn file → preview no-error → confirm → toast → về danh sách |

## 11. i18n & a11y

### 11.1 i18n keys

> KHÔNG áp dụng — fixed VN labels (KHÔNG dùng i18next), `i18n_keys: []` per §4.3. Toàn bộ label hardcode inline verbatim theo figma spec (vd "Tải lên danh sách tồn đầu kỳ", "Huỷ bỏ", "Xác nhận", "Kéo thả hoặc nhấn để chọn tệp", "Tải file lỗi", "Tải tệp lên thành công!").

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | H1 heading semantics cho PageTitle | screen reader landmark |
| AC-2 | Link `aria-label` mô tả rõ mục đích | download bundled asset |
| AC-3 | DropZone `role="button"` + `aria-label` | keyboard accessible (Enter/Space mở file picker) |
| AC-3b | Banner reject `role="alert"`; banner INFO `role="status"` | announce đúng semantic |
| AC-4 | `<th scope="col">` mỗi cột; DownloadErrorButton `aria-label` | disabled state announce |
| AC-5 | Row `aria-label` nêu trạng thái + lý do | badge text-only |
| AC-6 | ConfirmButton `aria-disabled`; cảnh báo `role="alert"` | rõ lý do disabled |
| AC-8 | Toast `role="status"` | auto-dismiss |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-IMPORT.md` | N-A (chưa author tại thời điểm spawn này) | BR primary enforcement (all-or-nothing transaction, 10 loại validate, cascade sổ tồn), contract source `verifyImportOpeningBalances`/`importOpeningBalances` downstream `POST /api/v2/opening-balances/{verify-import,import}` (`gf-inventory-api.md §3b.2 W04-3/W04-4`) |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-IMPORT.md` | N-A (chưa author tại thời điểm spawn này) | GraphQL op `verifyImportOpeningBalances`/`importOpeningBalances` (§6.1) — SDL `agg-garage-graph-graphql.md §3g.1/§3g.6 W04-M1/W04-M2` |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-IMPORT.md` | **N-A (out of scope — mobile view-only)** | App Garage KHÔNG có import — chỉ `searchOpeningBalances` view-only per `agg-garage-graph-graphql.md §3g.4` Mobile scope |
| Sibling FEAT (out of scope, referenced) | `FEAT-OB-LIST` (fe-web tier, cùng wave) | N-A | Entry point nút "Import tồn đầu kỳ" (AC-8 của `FEAT-OB-LIST`) navigate vào feature này; AC-7/AC-8 của feature này navigate ngược lại `/inventory/opening-balances`. `OpeningBalanceTotalRow` REUSE cross-FEAT (xem §5.2 + `coverage_gaps`) — coordinate build-once. |

**Source ID consistency** (item 18): `source_feat_sha` = `a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8` — PHẢI identical với BE/BFF files khi được author trong cùng wave. Mobile không author (out of scope).

## 13. References

- **Source**: [`Product/features/FEAT-OB-IMPORT.md`](../../../../../Product/features/FEAT-OB-IMPORT.md) v20
- **Paired BE**: [`features/be/FEAT-OB-IMPORT.md`](../be/FEAT-OB-IMPORT.md) (khi được author)
- **Paired BFF**: [`features/bff/FEAT-OB-IMPORT.md`](../bff/FEAT-OB-IMPORT.md) (khi được author)
- **Sibling FE**: [`features/fe-web/FEAT-OB-LIST.md`](FEAT-OB-LIST.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md) §3.1
- **Figma spec**: [`Product/ux/figma-web/wave04-ob-import.md`](../../../../../Product/ux/figma-web/wave04-ob-import.md) (node `14492:89263`)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **API contract**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index W04 → §3g Opening Balance (§3g.6 `verifyImportOpeningBalances`/`importOpeningBalances`)
- **ADR refs**: ADR-018 (import wizard 2-step pattern), ADR-020 (stock ledger point-in-time), ADR-021 (lock-check advisory REST), ADR-022 (OB import all-or-nothing + cascade + FE parse)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-OB-IMPORT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier — sẽ đối chiếu khi BE/BFF author), §2 trách nhiệm FE Web (single-page, không wizard, per F3 fix v8), §3 FE behaviour map 10/10 AC-ID (bundle §C undercount "9" — miss AC-3b, đã bổ sung đủ), §4 visual fidelity + state machine (initial/file_selected_parsing/preview_loaded/submitting/success) + i18n (fixed VN, no i18next) + a11y + RBAC + BR secondary + error mapping (12 mã ERR-INV-* + ERR-CMN-007 + warningLockCheckUnavailable), §5-§11 FE-specific (route `/inventory/opening-balances/import` + component reuse §5.2 toàn bộ `share/` layer, không customs fit, `OpeningBalanceTotalRow` reuse cross-FEAT từ `FEAT-OB-LIST` + GraphQL `verifyImportOpeningBalances`/`importOpeningBalances` (`agg-garage-graph-graphql.md §3g.6 W04-M1/W04-M2`) + cross-ref navigate qua lại `FEAT-OB-LIST`). Mobile tier N-A (view-only scope, không có import). Source FEAT chỉ audit. 13 coverage_gaps ghi nhận (route slug drift, Figma Frame 1 header buttons, cột Lý do lỗi PNG thiếu, dropzone hint .xls/.csv drift, pagination client-side bổ sung, tab ĐVT interpretation, TotalRow reuse coordination, data overlay previewLines vs parsed rows, file path convention suy luận, bundle AC undercount, xlsx parse lib reuse W03, Xác nhận enabled_rule Figma DSL lệch BR, "3 thẻ" vs StatsPills wording). |
