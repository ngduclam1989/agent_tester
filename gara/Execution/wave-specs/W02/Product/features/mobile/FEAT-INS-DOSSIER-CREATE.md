---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/ui/FEAT-INS-DOSSIER-CREATE.md"
source_version: 22
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-DOSSIER-CREATE"
source_feat_sha: "f04a51b87f035716574cecbd812eef3984b04d20458c4c82e48556cf25284eb0"
source_feat_version: 22
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 4
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-INS-DOSSIER-CREATE"]
consumes_bff_feats: ["FEAT-INS-DOSSIER-CREATE"]
screens_touched:
  - "lib/ui/insurance_dossier/screens/insurance_dossier_screen.dart"
  - "lib/ui/insurance_dossier/widgets/dossier_document_tile.dart"
  - "lib/ui/insurance_dossier/widgets/dossier_template_form.dart"
flutter_packages:
  - "flutter_bloc"
  - "graphql_flutter"
  - "freezed"
  - "go_router"
  - "flutter_localizations"
authoring_inputs:
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "78dfb9c9b06778ef56cd143a4244b300957f83879f552293638d5791aa2dc076"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-CREATE.mobile.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
  kg_baseline_sha: "N/A (mobile tier)"
paired_backend_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_bff_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_fe_web_feats: ["FEAT-INS-DOSSIER-CREATE"]
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-CREATE (Mobile): Tạo hồ sơ bảo hiểm — list dọc tài liệu + lưu cục bộ phiên

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

> **NEED CONFIRMATION**: Bundle không chứa Figma node-id cụ thể cho màn Hồ sơ bảo hiểm trên mobile. Chạy `/prefetch-figma mobile 02` để lấy Figma refs trước khi dev bắt đầu implement §5. Các `figma_refs` trong spec này đánh dấu `[FIGMA-TBD]` — dev phải điền sau khi có output prefetch.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-CREATE` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter 3.41 / Dart 3.11 / BLoC) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 (Phase B) |
| Status | DRAFT |
| Screens touched | `InsuranceDossierPage`, entry từ màn chi tiết phiếu QT BH |
| Flutter packages | `flutter_bloc`, `graphql_flutter`, `freezed`, `go_router`, `flutter_localizations` |
| Cross-tier consume | BE: `FEAT-INS-DOSSIER-CREATE` (gf-accounting) \| BFF: `FEAT-INS-DOSSIER-CREATE` (agg-garage-graph) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/ui/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/ui/FEAT-INS-DOSSIER-CREATE.md) |
| Source version | v21 |
| Source SHA | `6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` |
| Generated at | 2026-06-18T01:03:11+00:00 |

## 1. Mục đích nghiệp vụ

Kế toán cần lập và xuất bộ hồ sơ bảo hiểm chuẩn (4 tài liệu) trực tiếp trong hệ thống thay vì thao tác ngoài Excel, nhằm gửi đầy đủ giấy tờ cho doanh nghiệp bảo hiểm ngay lần đầu. Feature cho phép kế toán xem trước từng tài liệu, điền nội dung vào template ③④, tích chọn tài liệu cần xuất, và nhận PDF sẵn sàng gửi BH — rút ngắn thời gian thu tiền và tránh bị trả lại hồ sơ.

## 2. Trách nhiệm Mobile (garage-mobile)

- **Màn `InsuranceDossierPage`**: mở từ nút hành động trên màn chi tiết phiếu QT BH (push route); hiển thị list dọc 4 tài liệu (dạng `ListView` expandable tiles — tương đương accordion web) và footer nút "Xuất hồ sơ"; không mở modal overlay như web.
- **List dọc 4 tài liệu**: ① Phiếu quyết toán (read-only), ② Phiếu báo giá (read-only), ③ Biên bản nghiệm thu (form điền), ④ Giấy ủy quyền nhận tiền bồi thường (form điền); mỗi tile có `Checkbox` mặc định **bỏ trống** — kế toán tích chủ động trước khi xuất.
- **Lưu cục bộ phiên (EC-1)**: dữ liệu form ③④ và checkbox selection tồn tại trong `InsuranceDossierCubit` state duy nhất trong phiên. Kill app → mất hoàn toàn — KHÔNG persist `SharedPreferences` / `Hive` / local DB. Đây là hành vi chốt (FEAT v21 EC-1), không phải bug.
- **KHÔNG có file picker / upload** (BA chốt v12 bỏ B-3): không cần xin permission camera/storage/photo library. ①② auto-render từ BFF — chỉ hiển thị read-only. ③④ điền form inline trong tile.
- **GraphQL consume**: query `getInsuranceDossierCurrent` khi vào màn, mutation `exportInsuranceDossier` khi bấm "Xuất hồ sơ"; dùng `graphql_flutter` `Query` / `Mutation` widget hoặc repository pattern + Cubit.
- **RBAC**: chỉ render nút "Hồ sơ bảo hiểm" và route `InsuranceDossierPage` cho `accountant` và `garage-owner`; ẩn hoàn toàn khi phiếu QT ở trạng thái CANCEL (tạo bộ mới ẩn, tab "Đã xuất" vẫn read-only accessible).
- **Offline**: màn này yêu cầu kết nối mạng (BFF call). Hiển thị `ConnectivityBanner` khi offline; disable nút "Xuất hồ sơ" khi mất mạng; KHÔNG cache dossier state offline.

## 3. Hành vi cần triển khai (Mobile behaviour map)

### Cluster A — Entry point + load màn hồ sơ BH

#### AC-1 → Mobile render nút entry từ màn chi tiết phiếu QT BH

- **Khi**: kế toán đang xem màn chi tiết phiếu QT BH (loại BH, có `settlementCode`), tap nút "Hồ sơ bảo hiểm"
- **Mobile phải**: push route `/insurance-dossier/:settlementCode` bằng `go_router`; khởi tạo `InsuranceDossierCubit` với `settlementCode`; dispatch event `LoadDossier` → Cubit gọi `getInsuranceDossierCurrent` qua repository
- **State transition**: `DossierInitial` → `DossierLoading` (skeleton 4 tiles) → `DossierLoaded` hoặc `DossierError`
- **Widget**: nút action trong màn chi tiết phiếu QT — MODIFY existing `SettlementDetailPage`; button render theo RBAC check (ẩn nếu không phải `accountant` / `garage-owner`)
- **GraphQL op**: `getInsuranceDossierCurrent(settlementCode)` — query
- **i18n key (ARB)**: `insuranceDossier_entryButton` (vi: "Hồ sơ bảo hiểm", en: "Insurance Dossier")
- **a11y**: `Semantics(label: "Mở hồ sơ bảo hiểm", button: true)` cho nút entry
- **Ref**: Figma node `[FIGMA-TBD]` — nút trên màn chi tiết phiếu QT mobile

#### AC-2 → Mobile render layout màn `InsuranceDossierPage` đúng cấu trúc

- **Khi**: `DossierLoaded` state nhận từ Cubit sau query thành công
- **Mobile phải**: render `Scaffold` với `AppBar` (tiêu đề "Hồ sơ bảo hiểm"), body là `ListView` chứa 4 `DossierDocumentTile`, footer `StickyBottomBar` với nút "Xuất hồ sơ" và nút "Tạo bộ hồ sơ mới" (hiển thị khi đã có bộ đã xuất); 2 tab switcher "Hồ sơ mới" / "Hồ sơ đã xuất" trong header hoặc tab bar
- **State transition**: `DossierLoading` → `DossierLoaded`; query lỗi → `DossierError` (error widget + retry button)
- **Widget**: `InsuranceDossierPage` + `DossierDocumentTile` x4 + `StickyBottomBar`
- **i18n key (ARB)**: `insuranceDossier_screenTitle`, `insuranceDossier_exportButton`, `insuranceDossier_tabNew`, `insuranceDossier_tabExported`
- **a11y**: `AppBar` với `Semantics` tiêu đề; tab switcher dùng `TabBar` semantic; focus order tự nhiên top → bottom
- **Ref**: Figma node `[FIGMA-TBD]`

### Cluster B — 4 tile tài liệu list dọc

#### AC-3 → Mobile render 4 tile tài liệu dọc với checkbox mặc định bỏ trống

- **Khi**: màn ở state `DossierLoaded`
- **Mobile phải**: render 4 `DossierDocumentTile` theo đúng thứ tự BR-INS-DOSSIER-001 (① Phiếu quyết toán → ② Phiếu báo giá → ③ Biên bản nghiệm thu → ④ Giấy ủy quyền); mỗi tile có `Checkbox` mặc định **unchecked**, label tên tài liệu, badge trạng thái ("Sẵn sàng" / "Bổ sung"), `ExpansionTile` để mở rộng nội dung
- **State transition**: tile collapsed (default) → expanded (tap `ExpansionTile`); checkbox: unchecked → checked (tap user)
- **Widget**: `lib/ui/insurance_dossier/widgets/dossier_document_tile.dart` (NEW)
- **Lưu cục bộ phiên**: trạng thái checkbox và expanded lưu trong `InsuranceDossierCubit` state — KHÔNG persist local DB
- **i18n key (ARB)**: `insuranceDossier_docSettlementSheet`, `insuranceDossier_docQuotationSheet`, `insuranceDossier_docAcceptanceRecord`, `insuranceDossier_docPaymentAuthorization`; badge: `insuranceDossier_statusReady`, `insuranceDossier_statusSupplement`
- **a11y**: `Semantics(label: "..., checkbox, unchecked")` cho mỗi tile row; `ExpansionTile` announce state expanded/collapsed
- **Ref**: Figma node `[FIGMA-TBD]`

#### AC-4 → Mobile render Phiếu quyết toán (①) dạng read-only khi mở tile

- **Khi**: kế toán tap expand tile ① Phiếu quyết toán
- **Mobile phải**: hiển thị nội dung read-only của PHIẾU QUYẾT TOÁN SỬA CHỮA (auto-sinh từ BFF); dùng `WebView` hoặc PDF viewer widget nhận `pdfUrl` compose từ env domain config + `pdfUrl` relative (ADR-016); badge "Sẵn sàng" hiển thị ngay; KHÔNG có field input nào chỉnh được
- **State transition**: collapsed → expanded + PDF loading (CircularProgressIndicator) → loaded / error (retry inline)
- **Widget**: trong `DossierDocumentTile` — slot content `ReadOnlyDocumentPreview` widget; URL compose: `${AppConfig.fileStorageDomain}/${pdfUrl}`
- **GraphQL op**: `pdfUrl` từ `getInsuranceDossierCurrent` response (documentType `SETTLEMENT_SHEET`)
- **i18n key (ARB)**: `insuranceDossier_docSettlementSheet`
- **a11y**: `Semantics(label: "Phiếu quyết toán, read-only")` cho preview container; thông báo loaded
- **Ref**: ADR-016 — compose download URL từ env config + `pdfUrl`

#### AC-5 → Mobile render Phiếu báo giá (②) dạng read-only khi mở tile

- **Khi**: kế toán tap expand tile ② Phiếu báo giá
- **Mobile phải**: hiển thị PHIẾU BÁO GIÁ SỬA CHỮA (auto-sinh từ SO snapshot) dạng read-only; cùng pattern widget với AC-4 (reuse `ReadOnlyDocumentPreview`), documentType `QUOTATION_SHEET`; badge "Sẵn sàng"
- **State transition**: giống AC-4
- **Widget**: `ReadOnlyDocumentPreview` — reuse từ AC-4
- **GraphQL op**: `pdfUrl` từ `getInsuranceDossierCurrent` (documentType `QUOTATION_SHEET`)
- **i18n key (ARB)**: `insuranceDossier_docQuotationSheet`
- **a11y**: giống AC-4, Semantics label khác

#### AC-6 → Mobile render Biên bản nghiệm thu (③) dạng form điền khi mở tile

- **Khi**: kế toán tap expand tile ③ Biên bản nghiệm thu
- **Mobile phải**: render `DossierTemplateForm` variant `acceptanceRecord` với các field: Ngày nghiệm thu (`AppDatePicker`), Người đại diện garage (`AppTextField`), Người đại diện khách hàng (`AppTextField`), Người đại diện BH (`AppTextField`), Mô tả hạng mục (`AppTextField` multiline), Ghi chú (`AppTextField` optional); prefill từ SO data trong `getInsuranceDossierCurrent` response; badge "Bổ sung" cho đến khi required field đủ
- **State transition**: collapsed → expanded; form: prefilled → user edits → dirty (Cubit state `formData.acceptanceRecord` updated inline)
- **Widget**: `lib/ui/insurance_dossier/widgets/dossier_template_form.dart` (NEW — variant enum)
- **Lưu cục bộ phiên**: edits lưu trong `InsuranceDossierCubit.state.formData.acceptanceRecord`; kill app = mất (EC-1)
- **GraphQL op**: form data submit gộp vào `exportInsuranceDossier` (AC-9) — KHÔNG có mutation riêng save form
- **i18n key (ARB)**: `insuranceDossier_formAcceptanceDate`, `insuranceDossier_formGarageRep`, `insuranceDossier_formCustomerRep`, `insuranceDossier_formInsuranceRep`, `insuranceDossier_formDescription`, `insuranceDossier_formNote`
- **a11y**: `Semantics(label: field_label, textField: true)` mỗi field; `AppDatePicker` announce ngày chọn
- **Ref**: BR-INS-DOSSIER-003 — prefill từ SO; Figma node `[FIGMA-TBD]`

#### AC-7 → Mobile render Giấy ủy quyền nhận tiền bồi thường (④) dạng form điền khi mở tile

- **Khi**: kế toán tap expand tile ④ Giấy ủy quyền
- **Mobile phải**: render `DossierTemplateForm` variant `paymentAuthorization`; prefill thông tin KH/xe/DN BH từ response; kế toán điền thêm nội dung ủy quyền; badge "Bổ sung"; edits lưu Cubit state `formData.paymentAuthorization`
- **State transition**: giống AC-6
- **Widget**: `DossierTemplateForm` variant `paymentAuthorization` — reuse widget, khác variant
- **Lưu cục bộ phiên**: kill app = mất (EC-1)
- **i18n key (ARB)**: `insuranceDossier_formPaymentAuth*` per field
- **a11y**: giống AC-6
- **Ref**: BR-INS-DOSSIER-004 — prefill KH/xe/DN BH từ phiếu QT BH; Figma node `[FIGMA-TBD]`

### Cluster C — Preview + thao tác từng tài liệu

#### AC-8 → Mobile render khu vực preview + action "Tải về" trong expanded tile

- **Khi**: một tile đang expanded
- **Mobile phải**: cho ①② — hiển thị PDF preview + `AppButton.text` "Tải về" (trigger share/save `FileExporter`, làm giống `ServiceOrderPrintHelper`; cho ③④ — form editable (đã ở AC-6/AC-7); KHÔNG có file picker upload (B-3 đã bỏ — v12)
- **State transition**: preview: loading → loaded / error (inline retry)
- **Widget**: action button trong `DossierDocumentTile` expanded slot; download qua `url_launcher` openUrl
- **i18n key (ARB)**: `insuranceDossier_actionDownload` (vi: "Tải về", en: "Download")
- **Platform-specific**: iOS — share sheet qua `Share.shareUri`; Android — download to Downloads folder qua `url_launcher`
- **a11y**: `Semantics(label: "Tải về tài liệu ①", button: true)` cho download button
- **Ref**: ADR-016 — mobile download pattern reuse từ settlement print; KHÔNG endpoint `/download` riêng

### Cluster D — Xuất hồ sơ

#### AC-9 → Mobile invoke mutation exportInsuranceDossier khi tap "Xuất hồ sơ"

- **Khi**: kế toán đã tích ít nhất 1 checkbox và tap "Xuất hồ sơ" trên `StickyBottomBar`
- **Mobile phải**: validate client-side — nếu không có document nào tích → nút "Xuất hồ sơ" disabled + `Tooltip` "Vui lòng chọn ít nhất 1 tài liệu"; KHÔNG client-side gate theo trạng thái điền template ③④ (FEAT v22 — gỡ EC-4); pass → dispatch `ExportDossier` event → Cubit invoke mutation `exportInsuranceDossier` với `{settlementCode, selectedDocs: documentTypes[], formData: {acceptanceRecord?, paymentAuthorization?}}`
- **State transition**: `DossierLoaded` → `DossierExporting` (button loading, overlay dim) → `DossierExportSuccess` (SnackBar + refresh tab "Đã xuất") / `DossierExportError` (SnackBar lỗi + retry)
- **Widget**: `StickyBottomBar` footer trong `InsuranceDossierPage`; form validation trong `DossierTemplateForm`
- **GraphQL op**: mutation `exportInsuranceDossier` — BFF orchestrate 4-phase (ADR-016); input: `selectedDocs[]`, `formData`
- **i18n key (ARB)**: `insuranceDossier_exportSuccess`, `insuranceDossier_exportValidationNoDoc`
- **a11y**: `Semantics(liveRegion: true)` cho SnackBar success/error
- **Ref**: BR-INS-DOSSIER-005 — xuất subset được tích; ADR-016 Phase A-E orchestration ở BFF

#### AC-10 → Mobile cập nhật UI sau khi xuất thành công (version immutable + tab "Đã xuất")

- **Khi**: mutation `exportInsuranceDossier` trả về success `{versionNo, exports[]}`
- **Mobile phải**: hiển thị `SnackBar` thành công; dispatch `RefetchVersions` event → Cubit gọi `getInsuranceDossierVersions` → cập nhật tab "Hồ sơ đã xuất" với entry mới (`versionNo`, ngày xuất, danh sách file); 4 tile accordion trong bộ vừa xuất chuyển sang read-only immutable (form ③④ disabled, checkbox frozen, KHÔNG cho tap "Xuất hồ sơ" lại trên bộ đó)
- **State transition**: `DossierExporting` → `DossierExportSuccess` → tab "Đã xuất" active
- **Widget**: `DossierVersionListItem` widget trong tab "Đã xuất"; tile switch `readOnly=true`
- **GraphQL op**: `getInsuranceDossierVersions(settlementCode, page: 0, size: 10)` refetch sau mutation
- **i18n key (ARB)**: `insuranceDossier_tabExported`, `insuranceDossier_versionLabel`
- **Ref**: BR-INS-DOSSIER-006 — immutability sau export; BR-INS-DOSSIER-009 — hiển thị tất cả versions

#### AC-11 → Mobile render nút "Tạo bộ hồ sơ mới" và reset state phiên

- **Khi**: kế toán tap "Tạo bộ hồ sơ mới" (hiển thị khi đã có ít nhất 1 bộ đã xuất)
- **Mobile phải**: dispatch `ResetDossier` event → Cubit reset toàn bộ: checkbox → unchecked, form ③④ → prefill lại từ SO data ban đầu (KHÔNG copy dữ liệu từ bộ cũ, BR-INS-DOSSIER-007); scroll lên tile đầu; tab chuyển về "Hồ sơ mới"
- **State transition**: bất kỳ → `DossierLoaded` (reset state clean + prefill từ server data giữ nguyên trong Cubit)
- **Widget**: `TextButton` "Tạo bộ hồ sơ mới" trong `StickyBottomBar` hoặc `AppBar` action
- **Lưu cục bộ phiên**: reset hoàn toàn Cubit state — không cần xóa local DB (EC-1, không có gì persist)
- **i18n key (ARB)**: `insuranceDossier_actionNewDossier` (vi: "Tạo bộ hồ sơ mới", en: "Create New Dossier")
- **a11y**: `Semantics(label: "Tạo bộ hồ sơ mới", button: true)`
- **Ref**: BR-INS-DOSSIER-007 — không unlock bản cũ; không sao chép bản trước

#### AC-12 → Mobile KHÔNG cho sửa bộ hồ sơ đã xuất (immutability enforce trên UI)

- **Khi**: kế toán xem tab "Hồ sơ đã xuất", tap vào 1 version đã xuất
- **Mobile phải**: render 4 tile read-only (`DossierDocumentTile` prop `readOnly=true`): form ③④ disabled, `AppTextField` không focus được; checkbox không toggle; KHÔNG hiện nút "Xuất hồ sơ"; chỉ hiện nút "Tải về" per document
- **Widget**: `DossierDocumentTile(readOnly: true)`, `DossierTemplateForm(readOnly: true)` — prop propagation
- **a11y**: field disabled announce "không thể chỉnh sửa" qua Semantics
- **Ref**: BR-INS-DOSSIER-006 + BR-INS-DOSSIER-007

### Cluster E — Phân quyền + lỗi

#### AC-13 → Mobile enforce RBAC — ẩn entry point và route với role không được phép

- **Khi**: user có role không phải `accountant` / `garage-owner` truy cập màn chi tiết phiếu QT BH
- **Mobile phải**: ẩn hoàn toàn nút "Hồ sơ bảo hiểm" (KHÔNG render DOM, không disable); nếu deeplink `/insurance-dossier/:settlementCode` với user không có quyền → `go_router` redirect về màn danh sách phiếu QT; phiếu QT CANCEL → ẩn "Tạo bộ mới" + "Xuất hồ sơ", tab "Đã xuất" vẫn accessible
- **Widget**: conditional render dựa trên `AuthCubit.state.role` check; route guard trong `go_router` `redirect` callback
- **i18n key (ARB)**: N/A (ẩn hoàn toàn, không message)
- **Ref**: BR-INS-DOSSIER-001 (phân quyền); BR-INS-DOSSIER-010 (cancel guard)

#### AC-14 → Mobile hiển thị lỗi PDF generate cho từng tài liệu lỗi

- **Khi**: mutation `exportInsuranceDossier` trả về partial error (1 document fail render/upload)
- **Mobile phải**: hiển thị inline error badge/icon tại tile tài liệu lỗi trong list (tag "Lỗi" màu đỏ, mô tả ngắn); `SnackBar` tổng "Xuất hồ sơ thất bại — một số tài liệu không xuất được"; cho phép retry (re-dispatch `ExportDossier` cùng payload)
- **State transition**: `DossierExporting` → `DossierExportError` (partial hoặc total); Cubit giữ nguyên form data để retry
- **Widget**: `DossierDocumentTile` error state slot (badge "Lỗi"); `SnackBar` từ `ScaffoldMessenger`
- **i18n key (ARB)**: `insuranceDossier_exportErrorPdfFailed`, `insuranceDossier_exportErrorPartial`
- **a11y**: `Semantics(liveRegion: true)` cho SnackBar error; inline error tile có Semantics label mô tả lỗi
- **Ref**: BR-INS-DOSSIER-005 — chỉ xuất tài liệu được chọn và sẵn sàng

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Layout list dọc theo Figma node `[FIGMA-TBD]` (sau `/prefetch-figma mobile 02`) — KHÔNG re-invent thành grid ngang hay tab-based card layout.
- Design tokens lấy từ `lib/theme/**` (color, spacing, typography) — KHÔNG hardcode hex/dp.
- Responsive: `LayoutBuilder` / `MediaQuery` cho phone (compact) và tablet (expanded); tile padding adapt theo breakpoint.
- Badge "Sẵn sàng" (success token) / "Bổ sung" (warning token) dùng đúng color token semantic — không hardcode.

### 4.2 State machine + error handling

- `InsuranceDossierCubit` state tường minh: `DossierInitial | DossierLoading | DossierLoaded | DossierExporting | DossierExportSuccess | DossierExportError`. Mỗi state có widget render tương ứng.
- `DossierError` (query fail) → error widget toàn màn + retry button → re-dispatch `LoadDossier`.
- `DossierExportError` (mutation fail) → Cubit giữ nguyên `DossierLoaded` data + set error field; KHÔNG reset form.
- KHÔNG silent fail — log error qua Sentry/equivalent trước khi emit error state.

### 4.3 Native interaction + permission

- **KHÔNG cần xin permission** camera/storage/photo library (B-3 đã bỏ, v12 — không có file picker upload).
- Download tài liệu (AC-8): iOS → `url_launcher` openUrl / `Share.shareUri` (share sheet); Android → `url_launcher` openUrl (browser download hoặc Downloads manager).
- KHÔNG có deeplink riêng cho màn này — entry duy nhất qua stack navigation từ màn chi tiết phiếu QT.

### 4.4 Offline + connectivity

- Màn này **yêu cầu kết nối mạng** (online-required): query và mutation đều gọi BFF.
- Hiển thị `ConnectivityBanner` (widget reuse từ foundation) khi `connectivity_plus` detect offline.
- Khi offline: disable nút "Xuất hồ sơ"; form ③④ vẫn có thể điền (local state), nhưng không submit được.
- `graphql_flutter` cache policy: `NetworkOnly` cho query dossier (đảm bảo data fresh mỗi lần vào màn).
- KHÔNG dùng offline queue / Hive sync cho feature này — lưu cục bộ phiên là đủ per EC-1.

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`lib/l10n/intl_vi.arb`, `lib/l10n/intl_en.arb`) namespace `insuranceDossier*` — KHÔNG hardcode tiếng Việt inline widget.
- `AppDatePicker` (AC-6): locale-aware date format `dd/MM/yyyy` (vi) / `MM/dd/yyyy` (en) qua `intl` package.
- a11y: `Semantics` widget cho icon-only button (download, retry); `ExcludeSemantics` cho decorative badge color; TalkBack/VoiceOver test priority AC-3, AC-6, AC-9, AC-14.
- Tap target ≥ 48dp cho checkbox, button, tile expand trigger.
- Contrast ratio WCAG AA cho text trên badge và error message.

### 4.6 RBAC render + feature flag

- Route guard: `go_router` `redirect` callback kiểm tra `AuthCubit.state.role` ∈ `{accountant, garage-owner}` trước khi allow `/insurance-dossier/:settlementCode`.
- Phiếu QT CANCEL: Cubit nhận field `isCancelled` từ query response → ẩn `StickyBottomBar` action "Xuất hồ sơ" + "Tạo bộ mới"; tab "Đã xuất" vẫn hiển thị (BR-INS-DOSSIER-010).
- Feature flag `insurance_dossier_enabled` (nếu Platform cung cấp) → gate toàn bộ route.

### 4.7 Business rule secondary (UI hint)

- BR primary enforce tại BE. Mobile chỉ UI hint:
  - **BR-INS-DOSSIER-001**: 4 tile hardcoded order trong `InsuranceDossierPage` — KHÔNG cho reorder/thêm/bớt.
  - **BR-INS-DOSSIER-002**: `DossierDocumentTile` ①② luôn `readOnly=true` — không có input nào focus được.
  - **BR-INS-DOSSIER-005**: disable nút "Xuất hồ sơ" khi `selectedDocs.isEmpty`; inline tooltip/hint.
  - **BR-INS-DOSSIER-006**: sau xuất thành công, Cubit set bộ vừa xuất sang `readOnly=true`.
  - **BR-INS-DOSSIER-007**: "Tạo bộ mới" dispatch `ResetDossier` — KHÔNG copy form data bộ cũ.
  - **BR-INS-DOSSIER-010**: phiếu QT CANCEL → ẩn action tạo mới / xuất.
  - **BR-INS-DOSSIER-011**: tên file download = `{slug}_{settlementCode}_v{N}.pdf` — Mobile dùng `fileName` field từ mutation response; KHÔNG tự format tên file.

### 4.8 Performance

- `ListView.builder` cho tile list (4 item — không cần lazy, nhưng dùng builder cho consistency).
- `ExpansionTile` / `AnimatedCrossFade` cho accordion expand — KHÔNG `setState` toàn màn; dùng `BlocBuilder` granular.
- PDF preview (`WebView` / PDF viewer): lazy load khi tile expand, không preload tất cả khi vào màn.
- `const` constructor cho stateless sub-widget; tránh rebuild không cần thiết qua `BlocSelector`.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `ERR-INS-DOSSIER-PDF-FAIL` | `SnackBar` (partial) + inline badge lỗi trên tile | `DossierDocumentTile` error slot + `ScaffoldMessenger` | AC-14 |
| `ERR-INS-DOSSIER-CANCEL-BLOCK` | `SnackBar` | `ScaffoldMessenger` | AC-13 (cancel guard) |
| `ERR-INS-DOSSIER-NO-DOC` | Tooltip trên disabled button | `StickyBottomBar` export button | AC-9 |
| `ERR-CMN-NETWORK` | `SnackBar` + `ConnectivityBanner` | global + màn | AC-9, AC-14 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> **NEED CONFIRMATION**: Figma node-id chưa có — chạy `/prefetch-figma mobile 02` trước khi điền cột "Figma node-id". Dev dùng `[FIGMA-TBD]` trong code annotation và cập nhật sau khi prefetch xong.

### 5.1 Screens

| Screen | go_router path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InsuranceDossierPage` | `/insurance-dossier/:settlementCode` | NEW | `[FIGMA-TBD]` | AC-2, AC-3, AC-9, AC-10, AC-11 |
| `SettlementDetailPage` (existing) | `/settlements/:settlementCode` | MODIFY (add action button) | `[FIGMA-TBD]` | AC-1, AC-13 |

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `InsuranceDossierPage` | `lib/ui/insurance_dossier/insurance_dossier_page.dart` | NEW | BlocBuilder(InsuranceDossierCubit) | Scaffold + TabBar + ListView | AC-1–AC-14 |
| `DossierDocumentTile` | `lib/ui/insurance_dossier/widgets/dossier_document_tile.dart` | NEW | StatelessWidget + readOnly prop | ExpansionTile-based | AC-3–AC-8, AC-12 |
| `DossierTemplateForm` | `lib/ui/insurance_dossier/widgets/dossier_template_form.dart` | NEW | StatefulWidget (form fields) | Form + AppTextField | AC-6, AC-7, AC-12 |
| `ReadOnlyDocumentPreview` | `lib/ui/insurance_dossier/widgets/readonly_document_preview.dart` | NEW | StatefulWidget | WebView/PDF embed | AC-4, AC-5, AC-8 |
| `DossierVersionListItem` | `lib/ui/insurance_dossier/widgets/dossier_version_list_item.dart` | NEW | StatelessWidget | Card-based | AC-10 |
| `StickyBottomBar` | `lib/ui/insurance_dossier/widgets/sticky_bottom_bar.dart` | NEW | StatelessWidget + callbacks | Container + Row buttons | AC-9, AC-11 |

### 5.3 Navigation

| Route | Screen | Guard | Entry | AC ref |
|---|---|---|---|---|
| `/insurance-dossier/:settlementCode` | `InsuranceDossierPage` | `redirect: requireRole([accountant, garage-owner])` | push từ `SettlementDetailPage` | AC-1, AC-13 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events / States | AC ref |
|---|---|---|---|---|
| Dossier page state | Cubit | `lib/ui/insurance_dossier/insurance_dossier_cubit.dart` | `LoadDossier / ExportDossier / ResetDossier / RefetchVersions` → `DossierInitial / DossierLoading / DossierLoaded / DossierExporting / DossierExportSuccess / DossierExportError` | AC-1–AC-14 |
| Form data ③ in-session | embedded in Cubit state `formData.acceptanceRecord` | (same file) | updated via `UpdateAcceptanceRecord` event | AC-6 |
| Form data ④ in-session | embedded in Cubit state `formData.paymentAuthorization` | (same file) | updated via `UpdatePaymentAuthorization` event | AC-7 |
| Checkbox selection in-session | embedded in Cubit state `selectedDocs: List<DocumentType>` | (same file) | `ToggleDocument` event | AC-3, AC-9 |
| Active tab | embedded in Cubit state `activeTab: DossierTab` | (same file) | `SwitchTab` event | AC-10, AC-11 |
| Version list pagination | `DossierVersionListCubit` (separate) hoặc embedded | `insurance_dossier_cubit.dart` | `RefetchVersions` | AC-10 |

> **EC-1 phiên cục bộ**: tất cả state trên chỉ tồn tại trong Cubit instance (Flutter widget tree). Kill app → BLoC disposed → mất hoàn toàn. Đây là hành vi mong muốn (FEAT v21 EC-1) — KHÔNG có mechanism persist.

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| `getInsuranceDossierCurrent` | query | `Query()` widget hoặc `graphQLClient.query()` | `lib/core/repositories/insurance_dossier/insurance_dossier_repository.dart` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 |
| `getInsuranceDossierVersions` | query | `graphQLClient.query()` (paginated) | `insurance_dossier_repository.dart` | AC-10 |
| `exportInsuranceDossier` | mutation | `graphQLClient.mutate()` | `insurance_dossier_repository.dart` | AC-9, AC-10, AC-14 |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #17 enforce).
>
> **Op naming canonical** (reviewer item #17 verified):
> - `exportInsuranceDossier` (mutation) — confirmed trong BFF SDL delta.
> - `getInsuranceDossierVersions` (query) — confirmed trong BFF SDL delta.
> - `getInsuranceDossierCurrent` (query) — **BFF đang bổ sung song song** (spec BFF FEAT §6.1 đang được update trong cùng RETRY slot). Mobile dev phải wait BFF S5 stable trước khi wire AC-1/AC-2/AC-4/AC-5/AC-6/AC-7 consume op này. Xem §10 test note.

**Input `exportInsuranceDossier`** (align với BFF SDL):

```graphql
input ExportInsuranceDossierInput {
  settlementCode: String!
  selectedDocs: [DocumentType!]!
  formData: DossierFormDataInput
}
```

### 6.2 REST endpoints consumed direct

Không có — mọi data qua BFF GraphQL (ADR-016: orchestrator là BFF, Mobile invoke 1 mutation).

### 6.3 Offline-first strategy

| Concern | Pattern | Notes |
|---|---|---|
| Query cache | `NetworkOnly` policy (graphql_flutter) | Data luôn fresh khi vào màn |
| Form data | Cubit state in-memory | EC-1: kill app = mất, không cache |
| Offline detect | `connectivity_plus` | Banner UI + disable export button |
| Retry | Manual (tap retry button) | Không auto-retry background |

### 6.4 Platform-specific behaviors

| Concern | iOS | Android | Notes |
|---|---|---|---|
| Download tài liệu | `Share.shareUri` → share sheet | `url_launcher` openUrl → browser download | AC-8 |
| Permissions | Không cần (B-3 bỏ) | Không cần | v12 chốt |
| Deep link | Không có route deeplink riêng | Không có | Entry chỉ qua stack nav |
| Date picker | CupertinoDatePicker hoặc Material | Material DatePicker | AC-6 |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/insurance_dossier/screens/` | `insurance_dossier_screen.dart` | NEW | Scaffold + TabBar | ~200 | AC-1–AC-14 |
| `lib/ui/insurance_dossier/widgets/` | `dossier_document_tile.dart` | NEW | ExpansionTile-based | ~150 | AC-3–AC-8, AC-12 |
| `lib/ui/insurance_dossier/widgets/` | `dossier_template_form.dart` | NEW | Form + AppTextField | ~180 | AC-6, AC-7, AC-12 |
| `lib/ui/insurance_dossier/widgets/` | `readonly_document_preview.dart` | NEW | WebView embed | ~80 | AC-4, AC-5, AC-8 |
| `lib/ui/insurance_dossier/widgets/` | `dossier_version_list_item.dart` | NEW | Card-based | ~60 | AC-10 |
| `lib/ui/insurance_dossier/widgets/` | `sticky_bottom_bar.dart` | NEW | Container + Row | ~70 | AC-9, AC-11 |
| `lib/ui/insurance_dossier/` | `insurance_dossier_cubit.dart` | NEW | Cubit pattern | ~200 | AC-1–AC-14 |
| `lib/ui/insurance_dossier/` | `insurance_dossier_state.dart` | NEW | freezed union | ~80 | — |
| `lib/core/repositories/insurance_dossier/` | `insurance_dossier_repository.dart` | NEW | repository | ~100 | AC-1, AC-9, AC-10 |
| `lib/core/models/insurance_dossier/` | `insurance_dossier.dart` | NEW | freezed + JsonSerializable | ~100 | — |
| `lib/core/repositories/insurance_dossier/` | `insurance_dossier_remote_datasource.dart` | NEW | graphql_flutter | ~80 | AC-1, AC-9 |
| `lib/router/` | `app_router.dart` | MODIFY (add route + guard) | go_router | ~20 | AC-1, AC-13 |
| `assets/localizations/` | `vi.json`, `en.json` | MODIFY |  easy_localization | ~40 | AC-1–AC-14 |
| `lib/ui/settlement/` | `settlement_detail_screen.dart` | MODIFY (add entry button) | existing pattern | ~15 | AC-1, AC-13 |
| `test/ui/insurance_dossier/` | `insurance_dossier_cubit_test.dart` | NEW | bloc_test | ~200 | AC-1–AC-14 |
| `test/ui/insurance_dossier/` | `insurance_dossier_screen_test.dart` | NEW | widget test | ~180 | AC-2–AC-13 |
| `patrol-test/insurance_dossier/` | `insurance_dossier_e2e_test.dart` | NEW | integration_test / patrol | ~120 | smoke |

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6 (cùng entry: BFF S5 stable). Phase A gate phải stable trước Phase B start.

```
(← Phase A gate: FEAT-INS-STL-CREATE + CR-20260612-01 + CR-20260616-01 stable on staging)
(← BFF tier S5: SDL delta exportInsuranceDossier / getInsuranceDossierCurrent / getInsuranceDossierVersions stable)
(← Figma prefetch mobile W02 xong: /prefetch-figma mobile 02)

S6.1  Setup slice + models + ARB keys
      Entry: BFF S5 SDL stable
      Output: freezed models, ARB keys vi/en, graphql files

S6.2  DossierDocumentTile + DossierTemplateForm + ReadOnlyDocumentPreview (widgets)
      Entry: S6.1 done + Figma refs confirmed
      Output: widget unit tests green

S6.3  InsuranceDossierCubit + repository + datasource
      Entry: S6.1 done + BFF local endpoint reachable
      Output: Cubit bloc_test green (load / export / reset / error paths)

S6.4  InsuranceDossierPage (wiring Cubit + widgets + navigation)
      Entry: S6.2 + S6.3 done
      Output: screen widget test green

S6.5  SettlementDetailPage modification (entry button + route)
      Entry: S6.4 done
      Output: entry point wired + RBAC gate verified

S6.6  Integration E2E happy path (smoke)
      Entry: S6.5 done + BE/BFF staging deployed
      Exit: Patrol / integration_test smoke green → hand-off QA mobile-e2e
```

| Step | Hành động | Layer | Depends |
|---|---|---|---|
| S6.1 | Models + ARB + graphql files | data + i18n | BFF S5 |
| S6.2 | Widgets |/widgets | S6.1 + Figma |
| S6.3 | Cubit + repository + datasource | application + data | S6.1 + BFF endpoint |
| S6.4 | Screen wiring |/screens | S6.2 + S6.3 |
| S6.5 | Entry point + route guard | router + existing screen | S6.4 |
| S6.6 | E2E smoke | integration_test | S6.5 + staging |

## 9. Business Rules to enforce (Mobile — UI hint + secondary)

> Mobile KHÔNG enforce business validation primary. BE là primary (paired `be/FEAT-INS-DOSSIER-CREATE.md §9`). Mobile chỉ: client-side hint, RBAC render, error code → display mode.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INS-DOSSIER-001` | CORNERSTONE | 4 tile hardcoded order; không cho reorder/thêm/bớt | `insurance_dossier_screen.dart` (hardcoded list) | AC-3 | BE enforce set cố định |
| `BR-INS-DOSSIER-002` | CORNERSTONE | Tile ①② `readOnly=true` — không có field focus được | `dossier_document_tile.dart` prop | AC-4, AC-5 | BE enforce read-only snapshot |
| `BR-INS-DOSSIER-005` | CORNERSTONE | Disable "Xuất hồ sơ" khi `selectedDocs.isEmpty`; Tooltip giải thích | `sticky_bottom_bar.dart` | AC-9 | BE validate lại trước persist |
| `BR-INS-DOSSIER-006` | CORNERSTONE | Lock bộ đã xuất: tile `readOnly=true` toàn bộ | `dossier_document_tile.dart`, `dossier_template_form.dart` | AC-10, AC-12 | BE enforce immutability |
| `BR-INS-DOSSIER-007` | CORNERSTONE | "Tạo bộ mới" reset Cubit state — không copy form data bộ cũ | `insurance_dossier_cubit.dart` `ResetDossier` handler | AC-11 | Không có "sao chép bản trước" |
| `BR-INS-DOSSIER-010` | CORNERSTONE | Phiếu QT CANCEL → ẩn "Tạo bộ mới" + "Xuất hồ sơ"; tab "Đã xuất" vẫn accessible | `insurance_dossier_screen.dart` conditional render | AC-13 | BE block mutation; Mobile hide trước |
| `BR-INS-DOSSIER-011` | NORMAL | Download filename dùng `fileName` field từ response — KHÔNG tự format | `dossier_document_tile.dart` download action | AC-8, AC-10 | Slug naming pattern từ BE/BFF |

> **Primary enforcement** = BE tier (`ui/be/FEAT-INS-DOSSIER-CREATE.md §9`).

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (entry button visible/hidden theo RBAC) | test-mobile-ui | Dual persona: accountant thấy, role khác ẩn |
| AC-2 | Widget test (layout màn: 4 tile + footer) | test-mobile-ui | Scaffold render check |
| AC-3 | Widget test (tile order + checkbox unchecked default + expand) | test-mobile-ui | bloc_test DossierLoaded state |
| AC-4 | Widget test (tile ① read-only, badge "Sẵn sàng") | test-mobile-ui | Không có input focusable |
| AC-5 | Widget test (tile ② read-only) | test-mobile-ui | Giống AC-4 |
| AC-6 | Widget test (form ③ prefill + edit + dirty state) | test-mobile-ui | bloc_test UpdateAcceptanceRecord |
| AC-7 | Widget test (form ④ prefill + edit) | test-mobile-ui | Giống AC-6 |
| AC-8 | Widget test (download button + URL compose) | test-mobile-ui | Mock AppConfig.fileStorageDomain |
| AC-9 | Widget test (mutation trigger + validation disabled + error form) | test-mobile-ui | bloc_test ExportDossier happy + error |
| AC-10 | Widget test (post-export immutability + tab switch) | test-mobile-ui | bloc_test ExportSuccess → RefetchVersions |
| AC-11 | Widget test ("Tạo bộ mới" reset state không giữ form cũ) | test-mobile-ui | bloc_test ResetDossier |
| AC-12 | Widget test (tile readOnly khi xem bộ đã xuất) | test-mobile-ui | DossierDocumentTile readOnly=true |
| AC-13 | Widget test (RBAC ẩn route + CANCEL guard) | test-mobile-ui + test-isolation | go_router redirect test |
| AC-14 | Widget test (partial error inline tile + SnackBar) | test-mobile-ui | bloc_test ExportError partial |
| (EC-1) | Cubit unit test (kill simulate → state disposed) | test-mobile-ui | close() cubit → state cleared |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol: open màn → tick 2 tile → fill ③ → tap "Xuất hồ sơ" → SnackBar success |

> **Note #17 (getInsuranceDossierCurrent)**: Op `getInsuranceDossierCurrent` đang được BFF thêm vào SDL trong cùng RETRY slot. AC-1/AC-2/AC-4/AC-5/AC-6/AC-7 depend vào query này — mock repository trong unit test cho đến khi BFF S5 stable. E2E smoke (patrol) chỉ chạy sau BFF deploy lên staging.

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key (ARB) | vi | en | AC ref |
|---|---|---|---|
| `insuranceDossier_screenTitle` | "Hồ sơ bảo hiểm" | "Insurance Dossier" | AC-2 |
| `insuranceDossier_entryButton` | "Hồ sơ bảo hiểm" | "Insurance Dossier" | AC-1 |
| `insuranceDossier_exportButton` | "Xuất hồ sơ" | "Export Dossier" | AC-9 |
| `insuranceDossier_actionNewDossier` | "Tạo bộ hồ sơ mới" | "Create New Dossier" | AC-11 |
| `insuranceDossier_actionDownload` | "Tải về" | "Download" | AC-8 |
| `insuranceDossier_tabNew` | "Hồ sơ mới" | "New Dossier" | AC-2 |
| `insuranceDossier_tabExported` | "Hồ sơ đã xuất" | "Exported Dossiers" | AC-10 |
| `insuranceDossier_docSettlementSheet` | "Phiếu quyết toán" | "Settlement Sheet" | AC-4 |
| `insuranceDossier_docQuotationSheet` | "Phiếu báo giá" | "Quotation Sheet" | AC-5 |
| `insuranceDossier_docAcceptanceRecord` | "Biên bản nghiệm thu" | "Acceptance Record" | AC-6 |
| `insuranceDossier_docPaymentAuthorization` | "Giấy ủy quyền nhận tiền bồi thường" | "Payment Authorization" | AC-7 |
| `insuranceDossier_statusReady` | "Sẵn sàng" | "Ready" | AC-3 |
| `insuranceDossier_statusSupplement` | "Bổ sung" | "Supplement Required" | AC-3 |
| `insuranceDossier_versionLabel` | "Lần xuất" | "Export #" | AC-10 |
| `insuranceDossier_exportSuccess` | "Xuất hồ sơ thành công" | "Dossier exported successfully" | AC-9, AC-10 |
| `insuranceDossier_exportValidationNoDoc` | "Vui lòng chọn ít nhất 1 tài liệu" | "Please select at least one document" | AC-9 |
| `insuranceDossier_exportErrorPdfFailed` | "Không thể tạo PDF tài liệu này" | "Failed to generate PDF for this document" | AC-14 |
| `insuranceDossier_exportErrorPartial` | "Xuất hồ sơ thất bại — một số tài liệu không xuất được" | "Export failed — some documents could not be generated" | AC-14 |
| `insuranceDossier_formAcceptanceDate` | "Ngày nghiệm thu" | "Acceptance Date" | AC-6 |
| `insuranceDossier_formGarageRep` | "Người đại diện garage" | "Garage Representative" | AC-6 |
| `insuranceDossier_formCustomerRep` | "Người đại diện khách hàng" | "Customer Representative" | AC-6 |
| `insuranceDossier_formInsuranceRep` | "Người đại diện bảo hiểm" | "Insurance Representative" | AC-6 |
| `insuranceDossier_formDescription` | "Mô tả hạng mục" | "Work Description" | AC-6 |
| `insuranceDossier_formNote` | "Ghi chú" | "Note" | AC-6 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: "Mở hồ sơ bảo hiểm", button: true)` cho entry button | TalkBack/VoiceOver |
| AC-2 | `AppBar` title Semantics; Tab announce tên tab và index | TabBar semantic |
| AC-3 | `Semantics` cho Checkbox (label + checked state); `ExpansionTile` announce expanded/collapsed | Screen reader |
| AC-6 | `Semantics(label: field_label, textField: true)` per field; `aria-required` equiv `Semantics(hint: "Bắt buộc")` | Form a11y |
| AC-7 | Giống AC-6 | — |
| AC-9 | Loading state: `Semantics(liveRegion: true)` cho SnackBar / `CircularProgressIndicator` label | Announce xuất đang xử lý |
| AC-10 | `SemanticsService.announce("Xuất hồ sơ thành công")` sau success | Live region |
| AC-13 | Widget ẩn hoàn toàn (KHÔNG render trong tree) cho unauthorized — không dùng `Visibility(visible: false)` | Không leak semantic |
| AC-14 | `Semantics(liveRegion: true)` cho error SnackBar; inline error tile có label mô tả lỗi cụ thể | Announce error |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/ui/be/FEAT-INS-DOSSIER-CREATE.md` | DRAFT (pending) | BR primary enforcement; schema dossier entity; render ③④ PDF; persist batch |
| BFF | `Execution/wave-specs/W02/Product/ui/bff/FEAT-INS-DOSSIER-CREATE.md` | DRAFT (pending) | `exportInsuranceDossier` mutation orchestrator (ADR-016 4-phase); `getInsuranceDossierCurrent` / `getInsuranceDossierVersions` queries; GraphQL SDL delta |
| FE Web | `Execution/wave-specs/W02/Product/ui/fe-web/FEAT-INS-DOSSIER-CREATE.md` | DRAFT | List dọc mobile (ExpansionTile) tương đương accordion dọc web; share §1 mục đích nghiệp vụ; khác widget/state tool |

**Source ID consistency** (item #18): `source_feat_sha` = `6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` — identical với BE/BFF/FE-Web files.

**Mobile consume (read-only reference)**:

- BFF mutation: `exportInsuranceDossier` — Mobile invoke, BFF orchestrate Phase A-E (ADR-016); Mobile KHÔNG gọi gf-accounting / gf-sales / ct-file-storage trực tiếp.
- BFF query: `getInsuranceDossierCurrent(settlementCode)` — trả trạng thái + prefill data + `pdfUrl` cho ①②.
- BFF query: `getInsuranceDossierVersions(settlementCode, page, size)` — paginated list bộ đã xuất.
- Download URL: Mobile compose `${AppConfig.fileStorageDomain}/${pdfUrl}` — `pdfUrl` là relative path từ BFF response; không có endpoint `/download` riêng (ADR-016 chốt 2026-06-17).

## 13. References

- **Source**: [`Product/ui/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/ui/FEAT-INS-DOSSIER-CREATE.md) v21
- **Paired BE**: [`ui/be/FEAT-INS-DOSSIER-CREATE.md`](../be/FEAT-INS-DOSSIER-CREATE.md)
- **Paired BFF**: [`ui/bff/FEAT-INS-DOSSIER-CREATE.md`](../bff/FEAT-INS-DOSSIER-CREATE.md)
- **Paired FE Web**: [`ui/fe-web/FEAT-INS-DOSSIER-CREATE.md`](../fe-web/FEAT-INS-DOSSIER-CREATE.md)
- **ADR-016**: `Architecture/decisions/ADR-016.md` — PDF generation + BFF orchestrator + download URL pattern
- **BR-INS-DOSSIER-001..011**: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` §2.5
- **PKG**: `Execution/wave-packages/PKG-W02-insurance-dossier.md`
- **Fan-out map**: `Execution/wave-specs/W02/_routing/FEAT-FAN-OUT-MAP.yaml`
- **UX Figma**: chạy `/prefetch-figma mobile 02` để lấy Figma refs cho màn Hồ sơ bảo hiểm mobile

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260622-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-01--ins-dossier-current-endpoint-contract) | Add `GET /api/v1/insurance-dossiers/current` endpoint | RAISED (pending Architecture) | Wire op `getInsuranceDossierCurrent` để preload draft existing |
| [CR-20260622-03](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-03--ins-dossier-create-nav-expansion-to-push) | Reconcile §5.2 ExpansionTile → push nav 4 màn chi tiết | APPROVED MINOR self | §5.2 push nav 4 màn chi tiết tài liệu (KHÔNG ExpansionTile inline) |

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 3 | User request | **Gỡ gate client-side "③④ form chưa hoàn tất → block submit"** (sync FEAT v22 — rule không chính xác): §3 AC-9 validate client-side gỡ "nếu ③④ được tích nhưng required field chưa điền → scroll đến field lỗi + inline error trước khi submit" — chỉ check ≥1 checkbox tick. BE-side `INS_DOSSIER_FORM_INCOMPLETE` (400) error mapping giữ nguyên (defensive). Đồng bộ source FEAT v22, PKG-W02 v16, BR-EP v31, UX-FLOW v21. |
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho FEAT-INS-DOSSIER-CREATE W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier, copy từ fe-web §1), §2 trách nhiệm Mobile (list dọc 4 tile, EC-1 lưu cục bộ phiên/BLoC state, KHÔNG file picker, KHÔNG persist offline), §3 Mobile behaviour map 14 AC-IDs, §4 visual + state machine + native interaction (không permission) + offline + i18n ARB + a11y Semantics + RBAC + BR secondary + perf + error mapping, §5-§11 Mobile-specific (screens/widgets/Cubit/repository). NEED CONFIRMATION: Figma node-id cần `/prefetch-figma mobile 02` trước dev. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix reviewer items #18c + #17. §1 đã byte-equal canonical cross-tier (verified — không thay đổi nội dung). §6.1 thêm note op naming canonical: `exportInsuranceDossier` ✓, `getInsuranceDossierVersions` ✓, `getInsuranceDossierCurrent` ✓ (BFF đang bổ sung song song — dev mock đến BFF S5 stable). §10 thêm note dependency BFF parallel cho E2E smoke. |
| 2026-06-22 | 4 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 2 CR liên quan tier mobile: CR-20260622-01, CR-20260622-03. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
