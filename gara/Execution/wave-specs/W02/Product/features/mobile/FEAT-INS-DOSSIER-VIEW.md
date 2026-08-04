---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/ui/FEAT-INS-DOSSIER-VIEW.md"
source_version: 15
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-DOSSIER-VIEW"
source_feat_sha: "d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "brownfield-enhancement"
consumes_backend_feats: ["FEAT-INS-DOSSIER-VIEW"]
consumes_bff_feats: ["FEAT-INS-DOSSIER-VIEW"]
screens_touched:
  - "lib/ui/insurance_dossier/dossier_history_screen.dart"
flutter_packages:
  - "flutter_bloc"
  - "graphql_flutter"
  - "infinite_scroll_pagination"
  - "freezed"
  - "get_it"
  - "go_router"
authoring_inputs:
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "78dfb9c9b06778ef56cd143a4244b300957f83879f552293638d5791aa2dc076"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-VIEW.mobile.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
tier_role: mobile
paired_tiers:
  - be
  - bff
  - fe-web
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-VIEW (Mobile): Xem lại bộ hồ sơ bảo hiểm đã xuất

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-VIEW` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 |
| Status | DRAFT |
| Screens touched | `dossier_history_screen.dart` |
| Flutter packages | `flutter_bloc`, `graphql_flutter`, `infinite_scroll_pagination`, `freezed`, `go_router` |
| Cross-tier consume | BE: `FEAT-INS-DOSSIER-VIEW` \| BFF: `FEAT-INS-DOSSIER-VIEW` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-VIEW` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/ui/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/ui/FEAT-INS-DOSSIER-VIEW.md) |
| Source version | v15 |
| Source SHA | `d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` |
| Generated at | 2026-06-18T01:05:38+00:00 |

## 1. Mục đích nghiệp vụ

Tính năng cho phép kế toán và chủ garage tra cứu toàn bộ lịch sử các bộ hồ sơ bảo hiểm đã xuất PDF gắn với một phiếu quyết toán bảo hiểm cụ thể. Mỗi bộ hồ sơ đại diện cho một lần xuất (versioning), bao gồm các file PDF riêng lẻ của từng tài liệu trong bộ. Mục tiêu là hỗ trợ truy vết lịch sử hồ sơ đã gửi cho doanh nghiệp bảo hiểm, đối chiếu khi có tranh chấp và xem hoặc tải lại PDF gốc bất kỳ lúc nào.

## 2. Trách nhiệm Mobile (garage-mobile)

- **Màn lịch sử hồ sơ BH**: hiển thị danh sách tất cả các bộ hồ sơ đã xuất (versioned, không filter, không xóa) của một phiếu quyết toán BH — truy cập qua tab "Hồ sơ BH đã xuất" trên màn chi tiết phiếu QT BH.
- **Phân trang vô hạn (infinite scroll)**: load từng trang 10 bộ (`page=0, size=10`) qua GraphQL query `getInsuranceDossierVersions`; dùng `infinite_scroll_pagination` (PagedListView) — không có page-size selector trên mobile.
- **Lưới thẻ PDF 2 cột (CrossAxisCount=2)**: mỗi bộ hồ sơ hiển thị các file tài liệu dưới dạng lưới thẻ — tên tài liệu + file name + icon PDF; tap vào thẻ → mở file native.
- **Mở PDF native**: compose download URL = domain config (env) + `pdfUrl` (relative path từ BFF); gọi `url_launcher` (Android `ACTION_VIEW` intent / iOS `UIDocumentInteractionController`) — KHÔNG render PDF in-app.
- **Chế độ chỉ xem hoàn toàn**: không có action edit/delete; RBAC gate tại tab entry — chỉ hiển thị với `accountant` hoặc `garage-owner`.
- **Trạng thái UI tường minh**: `initial | loading | loaded | empty | error` qua `InsuranceDossierHistoryCubit`; inline error widget + nút "Thử lại" khi file storage lỗi (AC-9).

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 9/9 AC-IDs từ bundle §C phải xuất hiện trong §3 hoặc §4.

### Cluster A — Truy cập tab & hiển thị bộ hồ sơ

#### AC-1 → Hiển thị tab "Hồ sơ BH đã xuất" trên màn chi tiết phiếu QT BH

- **Khi**: người dùng mở màn chi tiết phiếu quyết toán bảo hiểm và có quyền xem.
- **Mobile phải**: render tab "Hồ sơ BH đã xuất" trong `DefaultTabController` của màn chi tiết QT BH (MODIFY màn hiện có). Nếu người dùng không có quyền (không phải `accountant`/`garage-owner`) → ẩn tab theo RBAC guard.
- **State transition**: tab entry → `InsuranceDossierHistoryCubit` emit `loading` → fetch trang đầu.
- **Widget**: `TabBarView` → `DossierHistoryTab` (NEW).
- **GraphQL op**: không có riêng cho tab entry; dùng `getInsuranceDossierVersions` (AC-2).
- **i18n key (ARB)**: `insurance_dossier_tab_exported_label` → vi: "Hồ sơ BH đã xuất" / en: "Exported Dossiers".
- **a11y**: `Semantics(label: "Tab Hồ sơ BH đã xuất")` trên TabBar item.
- **Ref**: Figma node — NEED CONFIRMATION (xem ghi chú §5).

#### AC-2 → Khối "Bộ hồ sơ" — danh sách dọc theo phiên xuất

- **Khi**: tab được hiển thị và kết quả query trả về danh sách bộ hồ sơ.
- **Mobile phải**: render `PagedListView` (infinite_scroll_pagination) danh sách `DossierVersionCard` theo thứ tự phiên xuất (mới nhất trên cùng). Mỗi card hiển thị: tiêu đề "Bộ hồ sơ #v{N}" + ngày/giờ xuất.
- **State transition**: `Loading → Loaded(versions)` / `Loaded → appended(nextPage)` khi scroll tới cuối.
- **Widget**: `DossierVersionCard` (NEW), `PagedListView<int, InsuranceDossierVersion>`.
- **GraphQL op**: `getInsuranceDossierVersions(settlementCode, page, size=10)` → `{content[], totalPages, totalElements}`.
- **i18n key (ARB)**: `insurance_dossier_version_title` → vi: "Bộ hồ sơ #{version}" / en: "Dossier #{version}".
- **a11y**: `Semantics(label: "Bộ hồ sơ số {version}, ngày {date}")` trên mỗi card.
- **Ref**: paired BFF FEAT §6.1 op `getInsuranceDossierVersions`.

#### AC-7 → Nhiều bộ hồ sơ — versioning, load thêm khi scroll

- **Khi**: danh sách bộ hồ sơ có >10 bộ và người dùng scroll đến cuối trang hiện tại.
- **Mobile phải**: `PagingController` tự động fetch trang tiếp theo (`page+1`, `size=10`); hiển thị `CircularProgressIndicator` nhỏ cuối danh sách khi đang tải thêm. Không có page-size selector trên mobile — fixed `size=10`.
- **State transition**: `PagingController` append `nextPageKey`; khi `totalPages` đã đạt → `PagingController.appendLastPage`.
- **Widget**: `PagedListView` + `PagingController<int, InsuranceDossierVersion>`.
- **i18n key (ARB)**: `insurance_dossier_loading_more` → vi: "Đang tải..." / en: "Loading...".
- **a11y**: `SemanticsService.announce` khi trang mới load xong → "Đã tải thêm {n} bộ hồ sơ".
- **Ref**: BE search endpoint `POST /api/v1/insurance-dossiers/search` (paginated) → BFF query `getInsuranceDossierVersions`.

### Cluster B — Lưới file PDF trong bộ hồ sơ

#### AC-3 → Lưới thẻ file PDF 2 cột trong bộ hồ sơ

- **Khi**: người dùng xem một `DossierVersionCard` đã expand hoặc màn chi tiết bộ hồ sơ.
- **Mobile phải**: render `GridView` với `SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2)` liệt kê từng tài liệu (tối đa 4 thẻ). Mỗi thẻ hiển thị: icon PDF + `documentType` label (i18n) + tên file (theo BR-INS-DOSSIER-011: `{slug}_{code}_v{N}.pdf`).
- **State transition**: inline trong `DossierVersionCard` — không cần Cubit riêng.
- **Widget**: `InsuranceDossierFileGrid` (NEW), `InsuranceDossierFileTile` (NEW — reuse Card foundation).
- **i18n key (ARB)**: `doc_type_bao_gia` → vi: "Phiếu báo giá" / `doc_type_quyet_toan` → vi: "Phiếu quyết toán" / `doc_type_bien_ban_nghiem_thu` → vi: "Biên bản nghiệm thu" / `doc_type_uy_quyen_nhan_tien` → vi: "Giấy ủy quyền nhận tiền".
- **a11y**: `Semantics(label: "{tên tài liệu}, file {fileName}, nhấn để mở")` trên mỗi tile.
- **Platform-specific**: không có khác biệt iOS/Android cho grid render.
- **Ref**: BR-INS-DOSSIER-001 (4 tài liệu cố định), BR-INS-DOSSIER-011 (file naming).

#### AC-4 → Chọn & mở file PDF qua native intent

- **Khi**: người dùng tap vào thẻ tài liệu (`InsuranceDossierFileTile`).
- **Mobile phải**: compose full download URL = `AppConfig.fileStorageDomain + pdfUrl` (từ BFF response field `pdfUrl`); gọi `url_launcher` → `launchUrl(uri, mode: LaunchMode.externalApplication)`.
  - Android: mở với `ACTION_VIEW` intent, hệ thống chọn PDF viewer (Adobe, Google Drive, v.v.).
  - iOS: trigger `UIDocumentInteractionController` qua `url_launcher` external mode.
  - KHÔNG embed PDF viewer in-app (WebView, flutter_pdfview, v.v.).
- **State transition**: loading overlay nhỏ trên tile khi đang chuẩn bị URL; error → SnackBar `insurance_dossier_open_pdf_error`.
- **Widget**: `InsuranceDossierFileTile` (onTap); `url_launcher` package.
- **i18n key (ARB)**: `insurance_dossier_open_pdf_error` → vi: "Không thể mở file PDF. Vui lòng thử lại." / en: "Cannot open PDF file. Please try again.".
- **a11y**: `Semantics(button: true, label: "Mở {tên tài liệu} dưới dạng PDF")`.
- **Platform-specific**: iOS cần `LSApplicationQueriesSchemes` (nếu dùng custom scheme) — với HTTPS URL public dùng `LaunchMode.externalApplication` không cần khai báo thêm.
- **Ref**: ADR-016 (pdfUrl = relative path, FE compose URL); BR-INS-DOSSIER-006 (immutable PDF).

#### AC-5 → Xem / tải PDF gốc (bất biến)

- **Khi**: native intent (AC-4) mở thành công file PDF.
- **Mobile phải**: URL compose đúng domain + path → PDF viewer native mở bản gốc. Đây là hành vi pass-through — Mobile không render PDF, không re-generate. Tải về cũng qua native intent (native PDF viewer cho phép save/share).
- **State transition**: không có state riêng ở app level sau khi `launchUrl` thành công.
- **Ref**: PRINT-INS-005 (PDF gốc bất biến, không re-generate khi tải lại ngoại trừ recovery case BE xử lý), ADR-016.

### Cluster C — Quyền & error handling

#### AC-6 → Toàn bộ chế độ chỉ xem

- **Khi**: người dùng có quyền xem tab.
- **Mobile phải**: không render bất kỳ action button edit/delete nào. Tất cả `InsuranceDossierFileTile` chỉ có action "mở" (read-only). KHÔNG có FAB, không có swipe-to-delete, không có context menu edit.
- **State transition**: `InsuranceDossierHistoryCubit` không có event `edit`/`delete`.
- **i18n key (ARB)**: không có label cho action bị ẩn (suppress hoàn toàn).
- **Ref**: BR-INS-DOSSIER-006 (immutable after export), BR-INS-DOSSIER-009 (không xóa version).

#### AC-8 → Phân quyền xem — RBAC gate

- **Khi**: người dùng mở màn chi tiết phiếu QT BH.
- **Mobile phải**: kiểm tra persona từ JWT claims (`role = accountant | garage-owner`) trước khi render tab "Hồ sơ BH đã xuất". Nếu role không hợp lệ → ẩn tab (Visibility widget / go_router redirect tại route guard). Không hiển thị error — đơn giản ẩn.
- **State transition**: route guard evaluate trước khi tab mounted.
- **Widget**: `Visibility(visible: canViewDossier, child: TabBarItem(...))`.
- **i18n key (ARB)**: không cần (nội dung bị ẩn).
- **a11y**: khi ẩn → `excludeSemantics: true`.
- **Ref**: BR-INS-DOSSIER-VIEW-001 (quyền xem), Critical Rule #6 (dual persona only).

#### AC-9 → File PDF không tồn tại / storage lỗi

- **Khi**: `launchUrl` thất bại (URL không hợp lệ, network error, ct-file-storage down) hoặc server trả lỗi khi fetch danh sách.
- **Mobile phải**:
  - Lỗi khi mở PDF tile: hiển thị SnackBar `insurance_dossier_open_pdf_error` + log error.
  - Lỗi fetch danh sách bộ hồ sơ: render `ErrorWidget` inline trong `PagedListView` (error state của `PagingController`) + nút "Thử lại" dispatch `InsuranceDossierHistoryCubit.retry()`.
  - KHÔNG silent fail — log qua `ErrorLogger` / Sentry.
- **State transition**: `Loaded → Error(message)` khi `PagingController` nhận exception; tile error → Dùng `ToastMessageUtils.showOnMessage` với `AppMessageType.error`, và hiện thị một màn lỗi.
- **Widget**: `PagingController` built-in `firstPageErrorIndicatorBuilder` + `newPageErrorIndicatorBuilder`.
- **i18n key (ARB)**: `insurance_dossier_fetch_error` → vi: "Không tải được danh sách hồ sơ. Vui lòng thử lại." / en: "Failed to load dossier list. Please try again."; `insurance_dossier_retry_btn` → vi: "Thử lại" / en: "Retry".
- **a11y**: `Semantics(liveRegion: true)` trên error widget → TalkBack/VoiceOver announce.
- **Ref**: PRINT-INS-005 (recovery case — BE re-generate từ snapshot nếu file mất, ngoại lệ; Mobile chỉ handle error display).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám Figma node-id tại §5 — NEED CONFIRMATION (xem §5.1 ghi chú).
- Design tokens lấy từ `lib/theme/**` — không hardcode hex/dp.
- Lưới 2 cột (`CrossAxisCount=2`) nhất quán với FE Web (cũng 2 cột).
- Responsive: phone (compact) dùng `CrossAxisCount=2`; tablet (medium+) có thể mở rộng `CrossAxisCount=3` qua `LayoutBuilder` breakpoint.

### 4.2 State machine + error handling

- `InsuranceDossierHistoryCubit` state tường minh: `initial | loading | loaded | error`.
- `PagingController` error state riêng cho pagination.
- Mọi error đều log; không silent fail.
- Lỗi mở PDF → SnackBar (không block UI — dismiss trong 4 giây).

### 4.3 Native interaction

- PDF mở qua `url_launcher` `LaunchMode.externalApplication` — KHÔNG render in-app.
- Android: `ACTION_VIEW` intent với MIME `application/pdf` nếu cần force (fallback: browser).
- iOS: `UIDocumentInteractionController` qua external launch mode của `url_launcher`.
- KHÔNG cần xin `CAMERA`/`STORAGE` permission — PDF mở external, không lưu vào gallery.
- Không có deeplink scheme riêng cho tính năng này.

### 4.4 Offline + connectivity

- Tính năng yêu cầu online (danh sách bộ hồ sơ + mở PDF đều cần network).
- Khi offline: `PagingController` nhận exception → hiển thị `ErrorWidget` + "Kiểm tra kết nối mạng và thử lại".
- Không cache danh sách bộ hồ sơ offline (dữ liệu audit-sensitive, không cache local).
- `graphql_flutter` `FetchPolicy.networkOnly` cho query `getInsuranceDossierVersions`.

### 4.5 i18n + a11y

- Mọi label qua ARB key (`lib/l10n/intl_vi.arb`, `intl_en.arb`) — KHÔNG hardcode tiếng Việt/Anh inline.
- `Semantics` cho: tile tap target ("Mở {tên tài liệu}"), tab label, error widget (liveRegion), list announce.
- Tap target tất cả tile ≥ 48dp height.
- Contrast WCAG AA cho tên file + document type label.

### 4.6 RBAC render + feature flag

- Feature flag: `insurance_settlement_enabled` (env-driven) — nếu false, toàn bộ tab ẩn.
- Role check: `accountant` | `garage-owner` (Critical Rule #6 dual persona only). Không có role khác.
- Tab ẩn hoàn toàn nếu role không hợp lệ — không hiển thị "không có quyền".

### 4.7 Business rule secondary (UI hint)

- BR-INS-DOSSIER-006 (immutable): Mobile không có action sửa/xuất lại — enforce bằng không render nút.
- BR-INS-DOSSIER-009 (không xóa version): Mobile không có swipe-delete / confirm-delete.
- BR-INS-DOSSIER-011 (file naming): hiển thị `fileName` từ BFF response (đã đặt theo rule ở BE) — Mobile không tự generate tên file.
- BR-INS-DOSSIER-VIEW-001..008: toàn bộ là rule phân quyền + access logic — BE primary enforce; Mobile chỉ hide UI theo RBAC gate.
- BR-INS-STL-DET-004, BR-INS-STL-DET-007: áp dụng tại màn chi tiết phiếu QT BH (không thuộc scope màn dossier history trực tiếp).

### 4.8 Performance

- `PagedListView` với `PagingController` → lazy load; không load toàn bộ list vào memory.
- `DossierVersionCard` dùng `const` constructor khi không có dynamic prop.
- Tránh rebuild toàn `DossierHistoryScreen` — `BlocBuilder` granular cho loading/error state.
- `cached_network_image` không dùng (không có thumbnail PDF — chỉ text/icon).

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `INSURANCE_DOSSIER_NOT_FOUND` | `ErrorWidget` inline | `firstPageErrorIndicatorBuilder` | AC-2, AC-7 |
| `STORAGE_FILE_NOT_FOUND` | SnackBar | `ScaffoldMessenger.showSnackBar` | AC-9 |
| `UNAUTHORIZED` | Tab ẩn (không hiện error) | `Visibility(visible: false)` | AC-8 |
| Network timeout | `ErrorWidget` inline + Retry button | `newPageErrorIndicatorBuilder` | AC-9 |

---

## 5. Screen / Widget breakdown (Mobile)

> NEED CONFIRMATION: Figma node-id cho màn "Hồ sơ BH đã xuất" trên mobile chưa có trong bundle. Các node-id dưới đây để trống chờ xác nhận. Author đã flag NEED CONFIRMATION.

### 5.1 Screens

| Screen | go_router path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| Màn chi tiết phiếu QT BH (tab thêm) | `/insurance-settlement/:code` | MODIFY (add tab) | NEED CONFIRMATION | AC-1, AC-8 |
| `DossierHistoryScreen` (tab content) | — (tab nội tuyến) | NEW | NEED CONFIRMATION | AC-2, AC-3, AC-7, AC-9 |

> Ghi chú: bundle §G liệt kê Figma GMS-v.3 node cho Phase A (A5: SO Edit `13354-57960`, SO Detail `13354-58368`, Tạo QT `13535-159225`) nhưng không có node cụ thể cho màn dossier history (Phase B). Cần BA/UX cung cấp Figma node-id cho màn "Hồ sơ BH đã xuất" mobile trước khi bắt đầu S6.

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `DossierHistoryScreen` | `lib/ui/insurance_dossier/dossier_history_screen.dart` | NEW | BlocBuilder | DefaultTabController | AC-1, AC-2 |
| `DossierVersionCard` | `lib/ui/insurance_dossier/widgets/dossier_version_card.dart` | NEW | StatelessWidget | Card-based | AC-2, AC-7 |
| `InsuranceDossierFileGrid` | `lib/ui/insurance_dossier/widgets/insurance_dossier_file_grid.dart` | NEW | StatelessWidget | GridView 2-col | AC-3 |
| `InsuranceDossierFileTile` | `lib/ui/insurance_dossier/widgets/insurance_dossier_file_tile.dart` | NEW | StatelessWidget | Card + InkWell | AC-4, AC-5 |
| `DossierHistoryErrorWidget` | `lib/ui/insurance_dossier/widgets/dossier_history_error_widget.dart` | NEW | StatelessWidget | inline error | AC-9 |

### 5.3 Navigation

| Route | Screen | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/insurance-settlement/:code` | Màn chi tiết phiếu QT BH (MODIFY — add tab) | `redirect: requireAuth + roleGuard(['accountant','garage-owner'])` | — | AC-1, AC-8 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Danh sách phiên xuất | Cubit | `lib/ui/insurance_dossier/application/dossier_history_cubit.dart` | `Loading / Loaded / Error` | AC-2, AC-7, AC-9 |
| Pagination | `PagingController<int, InsuranceDossierVersion>` | `lib/ui/insurance_dossier/dossier_history_page.dart` | nextPageKey append | AC-7 |
| Mở PDF | inline handler | `InsuranceDossierFileTile.onTap` | url_launcher call | AC-4, AC-5 |

## 6. Data integration (Mobile — consume BFF)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| `getInsuranceDossierVersions` | query | `Query(options: QueryOptions(...))` | `lib/core/repositories/insurance_dossier/insurance_dossier_repository.dart` | AC-2, AC-7 |

> Input: `{ settlementCode: String!, page: Int = 0, size: Int = 10 }`.
> Output: `{ content: [InsuranceDossierVersion!]!, totalPages: Int!, totalElements: Int! }`.
> `InsuranceDossierVersion` fields: `{ versionNo, exportedAt, documents: [{ documentType, pdfUrl, fileName }] }`.
>
> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #17 enforce).

### 6.2 REST endpoints consumed direct

Không có — Mobile tiêu thụ toàn bộ qua BFF GraphQL.

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| Online required | N/A | — | — | AC-2 |
| Lỗi offline | ErrorWidget + Retry | — | Manual tap | AC-9 |

> Danh sách dossier history không cache offline (audit-sensitive). `FetchPolicy.networkOnly`.

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Mở PDF | `url_launcher` → `UIDocumentInteractionController` (hệ thống xử lý) | `url_launcher` → `ACTION_VIEW` intent | HTTPS URL public, không cần custom scheme |
| Permission | Không cần thêm | Không cần thêm | PDF mở external, không lưu local |
| Deeplink | — | — | Không có deeplink riêng cho tính năng này |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/garage-mobile/**` (boundary isolation Critical Rule #1).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Screen | `lib/ui/insurance_dossier/dossier_history_page.dart` | NEW | DefaultTabController + PagedListView | ~200 | AC-1, AC-2, AC-7 |
| Widget — card | `lib/ui/insurance_dossier/widgets/dossier_version_card.dart` | NEW | Card-based | ~120 | AC-2, AC-7 |
| Widget — grid | `lib/ui/insurance_dossier/widgets/insurance_dossier_file_grid.dart` | NEW | GridView 2-col | ~80 | AC-3 |
| Widget — tile | `lib/ui/insurance_dossier/widgets/insurance_dossier_file_tile.dart` | NEW | Card + InkWell + url_launcher | ~100 | AC-4, AC-5, AC-6 |
| Widget — error | `lib/ui/insurance_dossier/widgets/dossier_history_error_widget.dart` | NEW | Column + TextButton | ~60 | AC-9 |
| Cubit | `lib/ui/insurance_dossier/dossier_history_cubit.dart` | NEW | Cubit pattern | ~120 | AC-2, AC-7, AC-9 |
| Cubit states | `lib/ui/insurance_dossier/dossier_history_state.dart` | NEW | freezed | ~60 | — |
| Repository | `lib/core/repositories/insurance_dossier/insurance_dossier_repository.dart` | NEW | graphql_flutter | ~80 | AC-2, AC-7 |
| Models | `lib/core/models/insurance_dossier/insurance_dossier_version.dart` | NEW | freezed + JsonSerializable | ~80 | — |
| Remote DS | `lib/core/repositories/insurance_dossier/insurance_dossier_remote_datasource.dart` | NEW | graphql_flutter `Query` | ~60 | AC-2 |
| Router | `lib/router/app_router.dart` | MODIFY (guard update) | go_router `redirect` | ~10 | AC-1, AC-8 |
| i18n | `assets/localizations/vi.json`, `assets/localizations/en.json` | MODIFY |  easy_localization | ~15 keys | AC-1 → AC-9 |
| Tests | `patrol_test/insurance_dossier/` | NEW | bloc_test + widget | ~200 | AC-2 → AC-9 |
| E2E | `patrol_test/insurance_dossier/insurance_dossier_view_e2e_test.dart` | NEW | patrol / integration_test | ~100 | smoke |

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6 (cùng entry: BFF S5 stable).

```
(← BFF tier S5: query getInsuranceDossierVersions SDL + resolver stable)
(← Phase A hard gate: màn chi tiết phiếu QT BH stable trên staging)

S6  Mobile UI wire (Flutter) — FEAT-INS-DOSSIER-VIEW
    Entry: BFF S5 stable + Figma node-id dossier history confirmed + url_launcher config verified
    Exit:  Patrol E2E happy path green (open dossier tab → see versions → tap tile → native PDF intent)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Model + Repository + Remote DS | data layer | BFF SDL stable | `getInsuranceDossierVersions` mock pass | BFF S5 |
| S6.2 | Cubit + state + PagingController | application | S6.1 done | unit test Cubit pass | S6.1 |
| S6.3 | DossierVersionCard + FileGrid + FileTile | widget | Figma confirmed | widget test golden | S6.2 |
| S6.4 | DossierHistoryScreen + TabBar integration + router guard | screen | S6.3 done | integration test pass | S6.3 |
| S6.5 | i18n ARB + a11y Semantics | i18n | S6.3 done | i18n key check pass | S6.3 |
| S6.6 | E2E Patrol — happy path + error scenario | e2e | S6.4 done | Patrol green | S6.4, S6.5 |

## 9. Business Rules to enforce (Mobile — UI hint secondary)

> Mobile KHÔNG enforce business validation primary. Primary = BE tier (`ui/be/FEAT-INS-DOSSIER-VIEW.md §9`).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INS-DOSSIER-006` | CORNERSTONE | Không render nút sửa/xuất lại | `dossier_history_screen.dart` (suppress action) | AC-6 | BE final enforce |
| `BR-INS-DOSSIER-009` | CORNERSTONE | Không render nút xóa version | `dossier_version_card.dart` (no delete action) | AC-6 | BE final enforce |
| `BR-INS-DOSSIER-011` | NORMAL | Hiển thị `fileName` từ BFF (không tự generate) | `insurance_dossier_file_tile.dart` | AC-3 | File naming đã tính ở BE |
| `BR-INS-DOSSIER-VIEW-001` | CORNERSTONE | Tab ẩn nếu role không hợp lệ | `app_router.dart` redirect + `Visibility` | AC-8 | Role check từ JWT claims |
| `BR-INS-DOSSIER-010` | NORMAL | Bộ hồ sơ của phiếu bị CANCEL vẫn xem được (read-only, không block) | `dossier_history_screen.dart` | AC-6 | Không filter hay ẩn khi cancel |

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (tab hiển thị + RBAC ẩn) | test-mobile-ui | Dual persona: accountant thấy / unknown ẩn |
| AC-2 | Widget test (danh sách card render) | test-mobile-ui | Mock BFF response |
| AC-3 | Widget test (grid 2 cột, 4 tile) | test-mobile-ui | Golden snapshot cho layout |
| AC-4 | Widget test (onTap → url_launcher mock) | test-mobile-ui | `url_launcher` mock |
| AC-5 | Widget test (URL compose = domain + pdfUrl) | test-mobile-ui | Verify URL format |
| AC-6 | Widget test (không có edit/delete action) | test-mobile-ui | Assert widget absence |
| AC-7 | Widget test (PagingController load page 2) | test-mobile-ui | `infinite_scroll_pagination` test helper |
| AC-8 | Widget test (RBAC gate — route redirect) | test-mobile-ui + test-isolation | go_router mock |
| AC-9 | Widget test (error state + retry button) | test-mobile-ui | Cubit emit Error |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol: open tab → scroll → tap tile → verify intent |

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `insurance_dossier_tab_exported_label` | "Hồ sơ BH đã xuất" | "Exported Dossiers" | AC-1 |
| `insurance_dossier_version_title` | "Bộ hồ sơ #{version}" | "Dossier #{version}" | AC-2 |
| `insurance_dossier_exported_at` | "Ngày xuất: {date}" | "Exported: {date}" | AC-2 |
| `doc_type_bao_gia` | "Phiếu báo giá" | "Quotation Sheet" | AC-3 |
| `doc_type_quyet_toan` | "Phiếu quyết toán" | "Settlement Sheet" | AC-3 |
| `doc_type_bien_ban_nghiem_thu` | "Biên bản nghiệm thu" | "Acceptance Record" | AC-3 |
| `doc_type_uy_quyen_nhan_tien` | "Giấy ủy quyền nhận tiền" | "Payment Authorization" | AC-3 |
| `insurance_dossier_open_pdf_error` | "Không thể mở file PDF. Vui lòng thử lại." | "Cannot open PDF file. Please try again." | AC-4, AC-9 |
| `insurance_dossier_fetch_error` | "Không tải được danh sách hồ sơ. Vui lòng thử lại." | "Failed to load dossier list. Please try again." | AC-9 |
| `insurance_dossier_retry_btn` | "Thử lại" | "Retry" | AC-9 |
| `insurance_dossier_loading_more` | "Đang tải..." | "Loading..." | AC-7 |
| `insurance_dossier_empty_state` | "Chưa có bộ hồ sơ nào được xuất." | "No dossiers have been exported yet." | AC-2 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: "Tab Hồ sơ BH đã xuất")` trên TabBar item | TalkBack/VoiceOver |
| AC-2 | `Semantics(label: "Bộ hồ sơ số {version}, ngày {date}")` trên `DossierVersionCard` | Screen reader |
| AC-3 | `Semantics(label: "{tên tài liệu}, file {fileName}, nhấn để mở")` trên tile | TalkBack |
| AC-4 | `Semantics(button: true, label: "Mở {tên tài liệu} dưới dạng PDF")` | VoiceOver |
| AC-7 | `SemanticsService.announce` sau khi load trang mới | Live region |
| AC-8 | `excludeSemantics: true` khi tab ẩn | Không đọc UI bị ẩn |
| AC-9 | `Semantics(liveRegion: true)` trên error widget | Announce error |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/ui/be/FEAT-INS-DOSSIER-VIEW.md` | DRAFT (chưa gen) | BR primary enforcement; `POST /api/v1/insurance-dossiers/search` paginated; `pdfUrl` relative path |
| BFF | `Execution/wave-specs/W02/Product/ui/bff/FEAT-INS-DOSSIER-VIEW.md` | DRAFT (chưa gen) | GraphQL query `getInsuranceDossierVersions` consumed tại §6.1 |
| FE Web | `Execution/wave-specs/W02/Product/ui/fe-web/FEAT-INS-DOSSIER-VIEW.md` | DRAFT (chưa gen) | Chia sẻ cùng BFF op; web dùng `<a href download>`, mobile dùng native intent |

**Source ID consistency** (item 18): `source_feat_sha` = `d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` — identical với BE/BFF/FE-web files.

## 13. References

- **Source**: [`Product/ui/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/ui/FEAT-INS-DOSSIER-VIEW.md) v15
- **Paired BE**: [`ui/be/FEAT-INS-DOSSIER-VIEW.md`](../be/FEAT-INS-DOSSIER-VIEW.md)
- **Paired BFF**: [`ui/bff/FEAT-INS-DOSSIER-VIEW.md`](../bff/FEAT-INS-DOSSIER-VIEW.md)
- **Paired FE Web**: [`ui/fe-web/FEAT-INS-DOSSIER-VIEW.md`](../fe-web/FEAT-INS-DOSSIER-VIEW.md)
- **UX flow**: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../../../../../Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md)
- **ADR-016**: PDF generation + storage + pdfUrl access pattern
- **ADR-009**: JPA no relationship mapping (BE reference)
- **ADR-015**: gf-sales ↔ gf-accounting REST sync (BE reference)
- **PKG**: [`PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md)
- **BR file**: `Product/business-rules/EP-INSURANCE-SETTLEMENT-rules.md` (BR-INS-DOSSIER-*)

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260622-04](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-04--ins-dossier-view-grid-to-list) | Reconcile §AC-3/§4.1/§5.2/§11.2 GridView 2-col → 1-col ListView | APPROVED MINOR self | §AC-3/§4.1/§5.2/§11.2 1-col ListView (KHÔNG GridView 2-col) |
| [CR-20260622-05](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-05--ins-dossier-view-t40-pdf-viewer-mode) | T40 PDF viewer mode drift | RAISED (pending BA) | T40 PDF viewer mode pending BA — giữ `LaunchMode.externalApplication` đến khi BA chốt |

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-INS-DOSSIER-VIEW` W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier — 5 dòng tiếng Việt), §2 trách nhiệm Mobile (infinite scroll + native PDF intent), §3 Mobile behaviour map 9/9 AC-IDs, §4 visual + state + native interaction (url_launcher) + offline + i18n + a11y + RBAC + BR secondary + perf + error mapping, §5-§11 Mobile-specific (screens/widgets/Cubit/repository/i18n ARB). NEED CONFIRMATION: Figma node-id màn dossier history mobile chưa có trong bundle. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix #18c + #17: (1) §1 replaced với canonical BFF wording byte-equal (reviewer item #18c); (2) op name `listInsuranceDossierVersions` → `getInsuranceDossierVersions` toàn file — §2, §3 AC-2/AC-7, §4.4, §6.1 (reviewer item #17 REJECTED→APPROVED). |
| 2026-06-22 | 3 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 2 CR liên quan tier mobile: CR-20260622-04, CR-20260622-05. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
