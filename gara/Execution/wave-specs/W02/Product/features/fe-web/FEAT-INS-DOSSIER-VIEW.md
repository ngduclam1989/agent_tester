---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-INS-DOSSIER-VIEW.md"
source_version: 15
source: "manual-realign-pkg-v13"
source_feat_id: "FEAT-INS-DOSSIER-VIEW"
source_feat_sha: "d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 5
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-INS-DOSSIER-VIEW"]
consumes_bff_feats: ["FEAT-INS-DOSSIER-VIEW"]
paired_tiers: ["be", "bff", "mobile"]
i18n_keys: []
screens_touched:
  - "src/features/insurance-settlement/pages/InsuranceSettlementDetailPage.tsx"
  - "src/features/insurance-settlement/components/dossier/InsuranceDossierTab.tsx"
figma_refs:
  - "Product/ux/figma-web/wave02-ins-dossier-view.md (node 13257:480151 — 2 frame: Populated + Empty state)"
authoring_inputs:
  pkg_ref: "PKG-W02-insurance-dossier v13"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "9a804fe587a5fa306f6a2c65fe0d932dd5b394bd9fda02eb5b2e937b75fc2ec9"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-VIEW.fe-web.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-VIEW (FE Web): Tab xem lại hồ sơ bảo hiểm đã xuất

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma spec: [`Product/ux/figma-web/wave02-ins-dossier-view.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-view.md). PKG-W02 §2.2 + §2.4 là arbiter khi có discrepancy. Cross-tier coordination ở §12.
> **i18n KHÔNG dùng** — toàn bộ label render fixed tiếng Việt inline (xem §4.3).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-VIEW` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INSURANCE-SETTLEMENT`](../../epics/EP-INSURANCE-SETTLEMENT.md) |
| Wave | W02 |
| Status | DRAFT |
| Screens touched | `InsuranceSettlementDetailPage` (MODIFY — thêm tab "Hồ sơ bảo hiểm đã xuất") + `InsuranceDossierTab` (NEW) |
| Cross-tier consume | BE: `FEAT-INS-DOSSIER-VIEW` \| BFF: `FEAT-INS-DOSSIER-VIEW` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → KHÔNG auto-cascade.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/features/FEAT-INS-DOSSIER-VIEW.md) |
| Source version | v15 |
| Source SHA | `d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` |
| Figma spec | [`Product/ux/figma-web/wave02-ins-dossier-view.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-view.md) |
| PKG | [`Execution/work-packages/PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md) v13 |

## 1. Mục đích nghiệp vụ

Tính năng cho phép kế toán và chủ garage tra cứu toàn bộ lịch sử các bộ hồ sơ bảo hiểm đã xuất PDF gắn với một phiếu quyết toán bảo hiểm cụ thể. Mỗi bộ hồ sơ đại diện cho một lần xuất (versioning), bao gồm các file PDF riêng lẻ của từng tài liệu trong bộ. Mục tiêu là hỗ trợ truy vết lịch sử hồ sơ đã gửi cho doanh nghiệp bảo hiểm, đối chiếu khi có tranh chấp và xem hoặc tải lại PDF gốc bất kỳ lúc nào.

## 2. Trách nhiệm FE Web (garage-web)

- **Tab "Hồ sơ bảo hiểm đã xuất"** trong bộ tab của `InsuranceSettlementDetailPage` (phiếu QT BH detail) — thêm tab vào sau 3 tab baseline (Bảng chi phí / Chứng từ & hoá đơn / Lịch sử thanh toán); tab này **chỉ hiển thị khi `payerType === 'INSURANCE'`** (BR-INS-DOSSIER-VIEW-008 + BR-INS-STL-DET-007). Phiếu QT KH ẩn tab hoàn toàn.
- **Layout tab 1-cột** (PKG v14 §2.2 garage-web — cập nhật 2026-06-18, gỡ preview pane):
  - List dọc các bộ hồ sơ đã xuất (mới nhất trên cùng); mỗi bộ render header (title + subtitle) + grid 2-cột thẻ file PDF.
  - **KHÔNG có preview panel inline** (đã bỏ — chốt 2026-06-18 theo design mới).
- **View PDF: open new tab** (cập nhật 2026-06-18 — pattern thay cho preview pane):
  - Click file card hoặc nút `"Xem PDF"` → mở PDF trong tab mới của trình duyệt (`<a href={composedUrl} target="_blank" rel="noopener noreferrer">`); browser native PDF viewer hiển thị PDF.
  - Nút `"Tải PDF"` riêng → download file gốc về máy (`<a download={pdfFileName}>`).
  - **KHÔNG dùng** iframe inline / `react-pdf` / `pdfjs-dist` / PDF lib khác — gỡ component `pdf-preview` (PKG v14 §2.4 Bước 1).
- **KHÔNG card highlight selection** (cập nhật 2026-06-18 — không còn preview pane để switch, highlight không có mục đích). Card vẫn có hover state baseline `Card` shadcn cho a11y/UX.
- **Pagination** (ADR-016 v11): page size mặc định 10, max 50. Nếu `totalPages > 1` → render `Pagination` component baseline phía dưới list bộ hồ sơ.
- **Empty state**: khi chưa có bộ hồ sơ nào → render `EmptyState` component (reuse) với title `"Chưa có hồ sơ nào được xuất"` (FEAT v15 AC-1, `ERR-INS-010`).
- **Read-only**: tab chỉ xem + tải PDF — KHÔNG có edit/delete/modify (BR-INS-DOSSIER-006).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG v14 §2.4 Bước 1, cập nhật 2026-06-18):
  1. `src/components/customs/` — domain-specific reusable components (ưu tiên cao nhất; foundation W01).
  2. `src/components/share/` — cross-feature shared components (baseline `Pagination`, `EmptyState`, `Card` thường ở đây hoặc `customs/`).
  3. `src/components/ui/` — shadcn primitives (fallback cuối).
  → Build-new: `InsuranceDossierTab`, `dossier-version-card` (kebab-case), `dossier-document-card`. **GỠ `pdf-preview` build-new** (PKG v14 — pattern open-new-tab thay thế).
- **GraphQL op consume**: query `getInsuranceDossierVersions(settlementCode, page, size)` paginated Spring Pageable.
- **RBAC**: chỉ render tab cho `accountant` + `garage-owner`; role khác ẩn tab + nếu access direct qua query param → ẩn nội dung.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Tab xem lại + navigation

#### AC-1 → FE render tab "Hồ sơ bảo hiểm đã xuất" trong tab group

- **Khi**: user mở phiếu QT BH detail (có `payerType === 'INSURANCE'`).
- **FE phải**: thêm `<TabsTrigger value="dossier-history">Hồ sơ bảo hiểm đã xuất</TabsTrigger>` vào `<TabsList>` baseline của `InsuranceSettlementDetailPage`. Khi tab active → trigger query `getInsuranceDossierVersions(settlementCode, page=0, size=10)`.
- **State transition**: `idle → loading (skeleton list 3 card) → success (danh sách bộ hồ sơ) | empty (chưa có) | error`.
- **Component**: `InsuranceSettlementDetailPage` (MODIFY — thêm tab item); `InsuranceDossierTab` (NEW — content cho tab).
- **GraphQL op**: `getInsuranceDossierVersions(input: {settlementCode, page, size})` → `{content[], page, size, totalElements, totalPages}`.
- **Label fixed**: tab text `"Hồ sơ bảo hiểm đã xuất"`.
- **a11y**: `<TabsTrigger>` shadcn built-in: `role="tab"`, `aria-selected`, keyboard nav arrow key.
- **Ref**: paired BFF FEAT §6.1; Figma spec §"## Screen: STL-DETAIL · Tab 'Hồ sơ bảo hiểm đã xuất' — Populated (13257:480949)"; FEAT v15 AC-1.

#### AC-8 → FE ẩn tab với user không có quyền hoặc phiếu QT KH

- **Khi**: user không phải `accountant` / `garage-owner`, HOẶC `settlement.payerType !== 'INSURANCE'`.
- **FE phải**: ẩn tab hoàn toàn (KHÔNG show + disable). Nếu URL có query param `?tab=dossier-history` → fallback về tab default (Bảng chi phí).
- **State transition**: conditional render dựa trên `usePermission()` + `settlement.payerType`.
- **Component**: conditional `<TabsTrigger>` trong `InsuranceSettlementDetailPage`.
- **Label fixed**: tab ẩn không cần label.
- **a11y**: KHÔNG expose element ẩn với screen reader.
- **Ref**: BR-INS-DOSSIER-VIEW-008; FEAT v15 AC-8.

### Cluster B — Danh sách bộ hồ sơ theo lần xuất

#### AC-2 → FE render từng khối "Bộ hồ sơ" + ngày/lần xuất

- **Khi**: query trả về `content[]` (mỗi item = 1 bộ hồ sơ).
- **FE phải**: render mỗi bộ hồ sơ là 1 section `<dossier-version-card>` với:
  - **Title**: `"Bộ hồ sơ #" + settlementCode` (vd `"Bộ hồ sơ #SET-20260326-00001"`) — text-lg weight=600 color `text-foreground` (#18181b).
  - **Subtitle**: `"Xuất ngày " + formatDate(exportedAt, "dd/MM/yyyy HH:mm") + " · " + documents.length + " tài liệu PDF"` (vd `"Xuất ngày 01/06/2026 14:32 · 4 tài liệu PDF"`) — text-xs weight=400 color `text-muted-foreground` (#71717a).
  - **KHÔNG hiển thị** nhãn `"Đã thay thế"` / `"Replaced"` (BR-INS-DOSSIER-007 cấm — UI display rule).
  - **KHÔNG hiển thị** version number `v1, v2, v3` — chỉ phân biệt theo ngày/lần xuất (PKG §2.2 + Figma spec — title dùng `settlementCode`, không dùng `versionNo`).
- **State transition**: success → render list sections; `totalElements === 0` → empty state.
- **Component**: `dossier-version-card.tsx` (NEW kebab-case) — wraps shadcn `Card`.
- **Label fixed**: format string `"Bộ hồ sơ #{settlementCode}"` + `"Xuất ngày {date} · {N} tài liệu PDF"`.
- **a11y**: section heading `<h3>` cho title mỗi bộ; subtitle `<p>` muted.
- **Ref**: BR-INS-DOSSIER-009 (hiển thị tất cả version), BR-INS-DOSSIER-007 (không hiển thị "Replaced"); FEAT v15 AC-2; Figma spec §"#### DossierSet (lặp 1..N — AC-2)".

#### AC-7 → FE render thứ tự nhiều bộ hồ sơ (versioning list)

- **Khi**: `content[]` có nhiều hơn 1 bộ.
- **FE phải**: render tất cả bộ theo thứ tự **mới nhất trên cùng** (BE đã sort descending `versionNo`/`exportedAt` — FE KHÔNG tự sort). KHÔNG filter, KHÔNG ẩn version nào.
- **State transition**: success với multi-item list.
- **Component**: `InsuranceDossierTab.tsx` map qua `content[]` render `dossier-version-card` × N.
- **Label fixed**: (dùng chung label AC-2).
- **a11y**: list container `role="list"`; mỗi item `role="listitem"`.
- **Ref**: BR-INS-DOSSIER-009; FEAT v15 AC-7.

### Cluster C — Lưới file PDF trong bộ hồ sơ

#### AC-3 → FE render grid 2 cột file PDF (KHÔNG highlight, click → open new tab)

- **Khi**: `dossier-version-card` render với `documents[]` (≤4 file đã chọn xuất).
- **FE phải**: render grid CSS 2 cột (`grid grid-cols-2 gap-5`) liệt kê từng file PDF, mỗi ô `dossier-document-card` gồm:
  - Icon PDF (iconsax-reactjs/DocumentText/Linear hoặc lucide-react/FileText, size=24, color `#dc2626`).
  - Text block:
    - **Filename row**: `"{pdfFileName} · {fileSizeKb}kb"` (vd `"Phiếu báo giá.pdf · 100kb"`) — text-sm weight=500 color `text-foreground`.
    - **Reference row**: `"#" + settlementCode` (vd `"#SET-20260326-00001"`) — text-xs weight=400 color `text-muted-foreground`.
  - **Action 1 — click trên thân card (filename/icon area)**: mở PDF tab mới (AC-4) — `<a href={url} target="_blank" rel="noopener noreferrer">` wrap khu vực click.
  - **Action 2 — nút "Tải PDF" riêng** (góc phải card): download file gốc (AC-5) — `<a href={url} download={pdfFileName}>` riêng để browser trigger download thay vì mở tab.
- **KHÔNG có card highlight selection** (cập nhật 2026-06-18 — gỡ preview pane, highlight không còn mục đích). Card chỉ có hover state baseline `Card` shadcn (`hover:bg-accent` hoặc `hover:shadow-md`) cho a11y/UX.
- **Filename mapping** (4 tài liệu chuẩn — FEAT v15 AC-3):
  - `"Phiếu quyết toán.pdf"` (`SETTLEMENT_SHEET`)
  - `"Phiếu báo giá.pdf"` (`QUOTATION_SHEET`)
  - `"Biên bản nghiệm thu.pdf"` (`ACCEPTANCE_RECORD`)
  - `"Giấy ủy quyền nhận tiền bồi thường.pdf"` (`PAYMENT_AUTHORIZATION`)
- **Số thẻ trong bộ** = số tài liệu được tích chọn khi xuất (≤4 — BR-INS-DOSSIER-005). Không pad ô trống khi <4.
- **State transition**: success → grid render. Click thân card → mở tab mới (browser native PDF viewer hiển thị). Click "Tải PDF" → browser download dialog.
- **Component**: `dossier-document-card.tsx` (NEW kebab-case — priority customs > share > ui) — wraps `Card` (verify `customs/` → `share/` → `ui/`) + 2 anchor element.
- **Label fixed**: format `"{pdfFileName} · {fileSizeKb}kb"` + `"#{settlementCode}"` + `"Tải PDF"` (action button text).
- **a11y**: 2 `<a>` semantic elements (KHÔNG `<button onClick>` cho navigation/download); main anchor `aria-label="Xem PDF: {pdfFileName}"`; download anchor `aria-label="Tải về: {pdfFileName}"`; icon PDF `aria-hidden="true"`.
- **Ref**: BR-INS-DOSSIER-001 (4 loại tài liệu cố định), BR-INS-DOSSIER-005 (chỉ file đã chọn), BR-INS-DOSSIER-011 (naming SSOT = BE — FE dùng `pdfFileName` từ response); FEAT v15 AC-3 + AC-4 + AC-5; PKG v14 §2.2 garage-web "open new tab pattern".

### Cluster D — View / Download PDF (open new tab pattern — cập nhật 2026-06-18)

> **Pattern change 2026-06-18**: GỠ inline preview pane (PKG v14 §2.2 + user request 2026-06-18). View PDF → mở tab mới browser native; Download PDF → anchor `<a download>` riêng.

#### AC-4 → FE mở PDF trong tab mới của trình duyệt

- **Khi**: user click thân card (filename + icon area) hoặc nút `"Xem PDF"` (nếu render riêng).
- **FE phải**: compose URL = `${VITE_FILE_STORAGE_BASE_URL}/${pdfUrl}` (`pdfUrl` là object key relative path từ ct-file-storage). Render anchor element:
  ```tsx
  <a
    href={`${VITE_FILE_STORAGE_BASE_URL}/${pdfUrl}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Xem PDF: ${pdfFileName}`}
  >
    {/* card content */}
  </a>
  ```
- Click → browser mở **tab mới** + hiển thị PDF qua native browser viewer (Chrome PDF Viewer / Firefox PDF.js / Safari built-in). KHÔNG cần component preview, KHÔNG cần PDF lib.
- **State transition**: click → tab mới mở → tab hiện tại không đổi state.
- **Component**: anchor `<a target="_blank">` trong `dossier-document-card.tsx` — KHÔNG còn `pdf-preview` component (PKG v14 GỠ).
- **GraphQL op**: `pdfUrl` lấy từ `documents[].pdfUrl` của `getInsuranceDossierVersions` response.
- **Label fixed**: card hiện filename + size + reference (không có label riêng cho "Xem PDF" — click toàn thân card).
- **a11y**: anchor `aria-label="Xem PDF: {pdfFileName}"`; semantic `<a target="_blank">` (KHÔNG `<button onClick={window.open()}>`).
- **Ref**: ADR-016 v11 (pdfUrl = relative path, FE compose từ env domain config — KHÔNG signed URL TTL); PKG v14 §2.2 garage-web; FEAT v15 AC-4.

#### AC-5 → FE trigger download PDF gốc

- **Khi**: user click nút `"Tải PDF"` riêng (góc phải card).
- **FE phải**: compose URL như AC-4 + thêm `download={pdfFileName}` vào anchor tag để browser trigger download thay vì mở tab:
  ```tsx
  <a
    href={`${VITE_FILE_STORAGE_BASE_URL}/${pdfUrl}`}
    download={pdfFileName}
    rel="noopener noreferrer"
    aria-label={`Tải về: ${pdfFileName}`}
  >
    <Button variant="secondary" size="sm">Tải PDF</Button>
  </a>
  ```
  `pdfFileName` đã đúng naming convention `{slug}_{settlementCode}_v{N}.pdf` từ BE/BFF (BR-INS-DOSSIER-011) — FE KHÔNG tự compose tên file.
- **State transition**: click → browser download dialog → file lưu Downloads folder. Tab hiện tại không đổi state.
- **Component**: anchor + `<Button>` (priority customs > share > ui) trong `dossier-document-card.tsx` — đặt góc phải card, độc lập với click area mở tab (AC-4). Click "Tải PDF" stop propagation để không trigger mở tab.
- **Label fixed**: nút text `"Tải PDF"`.
- **a11y**: anchor `aria-label="Tải về: {pdfFileName}"`; KHÔNG dùng `<button>` cho navigation/download (dùng `<a>` semantic).
- **Ref**: ADR-016 v11, BR-INS-DOSSIER-011, BR-INS-DOSSIER-006 (PDF gốc immutable); PKG v14 §2.2; FEAT v15 AC-5.

#### AC-6 → FE hiển thị toàn bộ tab ở chế độ chỉ xem (read-only)

- **Khi**: tab "Hồ sơ bảo hiểm đã xuất" active ở bất kỳ trạng thái phiếu QT BH nào (kể cả CANCEL).
- **FE phải**: KHÔNG render bất kỳ nút edit/delete/modify nào. Kể cả khi phiếu QT BH ở trạng thái CANCEL — tab vẫn hiển thị bộ hồ sơ để truy vết; toàn bộ action chỉ là xem (preview) và tải PDF (download).
- **State transition**: read-only render — không có form input, không có destructive action.
- **Component**: `InsuranceDossierTab.tsx` — KHÔNG inject prop `editable` hay action handler nào ngoài view/download.
- **Label fixed**: không có nút action khác `"Tải PDF"`.
- **a11y**: KHÔNG có interactive element nguy hiểm; dùng semantic `<a>` cho download.
- **Ref**: BR-INS-DOSSIER-006 (immutable sau xuất), BR-INS-DOSSIER-010 (CANCEL → vẫn xem được); FEAT v15 AC-6.

### Cluster E — Phân trang

#### AC-2 (pagination aspect) → FE render Pagination control

- **Khi**: `totalPages > 1` trong response.
- **FE phải**: render `Pagination` component baseline phía dưới list bộ hồ sơ (cuối cột trái). Default `page=0`, `size=10`; UI cho phép chuyển trang + (optional) page size selector `[10, 20, 50]` (max 50 per ADR-016 v11).
- **State transition**: click page → loading (skeleton list) → success (trang mới load).
- **Component**: `Pagination` (REUSE baseline `src/components/shared/Pagination.tsx`).
- **GraphQL op**: re-invoke `getInsuranceDossierVersions(settlementCode, page=N, size=S)`.
- **Label fixed**: pagination control dùng label baseline (`"Trước"` / `"Sau"` / `"Trang {N} / {Total}"`).
- **a11y**: pagination có `aria-label="Phân trang hồ sơ bảo hiểm"`; nút prev/next có `aria-label`.
- **Ref**: ADR-016 v11; FEAT v15 AC-2.

### Cluster F — Error handling

#### AC-9 → FE xử lý lỗi PDF không tồn tại / storage error

- **Khi**: user click xem/tải PDF mà browser nhận 404 từ ct-file-storage (tab mới hiển thị browser error page hoặc download fail), HOẶC BFF trả error code liên quan storage khi query list.
- **FE phải**:
  - **PDF view 404 (open new tab — cập nhật 2026-06-18)**: tab mới mở sẽ hiển thị browser 404 page native — FE KHÔNG can thiệp (không có inline error vì gỡ preview pane). User tự đóng tab + thử lại.
  - **PDF download 404**: toast `"Không thể tải file PDF. Vui lòng thử lại sau."` (browser download fail event không bắt được trực tiếp — fallback dùng pre-fetch HEAD request optional, hoặc rely trên server response).
  - **List query fail**: inline error trong tab panel: `"Không tải được danh sách hồ sơ. Vui lòng thử lại."` + nút `"Thử lại"` (re-invoke query).
  - KHÔNG crash màn hình; các file PDF khác trong bộ vẫn thao tác bình thường.
- **State transition**: error inline / toast (auto-dismiss 5s); state list giữ nguyên.
- **Component**: inline error trong `InsuranceDossierTab.tsx` (list query) + `useToast()` hook baseline cho download error. **KHÔNG còn** `pdf-preview` component (gỡ).
- **Label fixed**:
  - `"Không thể tải file PDF. Vui lòng thử lại sau."` (toast download error)
  - `"Không tải được danh sách hồ sơ. Vui lòng thử lại."` (inline tab panel error)
  - `"Thử lại"` (retry button)
- **a11y**: toast `role="alert"` hoặc `aria-live="polite"`; inline error `aria-describedby`.
- **Ref**: BR-INS-DOSSIER-VIEW-005 (PDF không tồn tại → error message); FEAT v15 AC-9; PKG v14 §2.2 (gỡ inline preview → 404 handle qua browser native).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- **Layout tab 1-cột** (PKG v14 §2.2 garage-web — cập nhật 2026-06-18): list dọc bộ hồ sơ + grid 2-cột file cards trong mỗi bộ. **GỠ preview pane** inline (đã bỏ).
- Grid `grid-cols-2 gap-5` cho file cards theo Figma spec §"#### FileGrid".
- **KHÔNG card highlight selection** (cập nhật 2026-06-18 — không có preview pane để switch, highlight không còn mục đích). Card chỉ giữ hover state baseline.
- Empty state dùng `EmptyState` baseline component với title `"Chưa có hồ sơ nào được xuất"` (KHÔNG dùng generic "Không tồn tại bản ghi!" component empty của Figma — BA chốt copy theo FEAT v15 AC-1).
- KHÔNG hiển thị `"Đã thay thế"` / `"Replaced"` / `"v1, v2, v3"` (BR-INS-DOSSIER-007).
- Design tokens từ `tailwind.config.js` / `src/index.css` — không hardcode hex/px ở component code.
- Tab integrate đúng vào tab group hiện có (`<Tabs>` shadcn); KHÔNG tạo route mới.
- **Figma scope**: Figma spec `Product/ux/figma-web/wave02-ins-dossier-view.md` mô tả **visual/layout** (list + grid 2-cột file cards). Behavior "click file card → mở PDF tab mới + nút 'Tải PDF' riêng" là **decision wave-spec level** (file này) — KHÔNG nằm trong Figma. Figma KHÔNG cần re-prefetch.

### 4.2 State machine + error handling

- State tường minh: `idle | loading | success | empty | error` cho query level + `selected | unselected` cho mỗi file card + `loading | loaded | error` cho preview pane.
- Loading → skeleton list 3 card; empty → `EmptyState` baseline với message `"Chưa có hồ sơ nào được xuất"`.
- Query error → inline error trong tab panel + nút "Thử lại"; KHÔNG toast cho lỗi load list (chỉ inline).
- Preview/download PDF error → inline (preview pane) hoặc toast (download).
- KHÔNG silent fail.

### 4.3 Labels (fixed tiếng Việt — KHÔNG i18n)

> Quyết định 2026-06-18 (user request): toàn bộ label hardcode tiếng Việt inline trong component code. KHÔNG dùng `i18next`.

**Catalog label fixed**:

| Vị trí | Label tiếng Việt |
|---|---|
| Tab trigger text | `"Hồ sơ bảo hiểm đã xuất"` |
| Bộ hồ sơ title format | `"Bộ hồ sơ #" + settlementCode` |
| Bộ hồ sơ subtitle format | `"Xuất ngày " + dd/MM/yyyy HH:mm + " · " + N + " tài liệu PDF"` |
| File card filename format | `"{pdfFileName} · {fileSizeKb}kb"` |
| File card reference format | `"#" + settlementCode` |
| Filename 4 tài liệu chuẩn | `"Phiếu quyết toán.pdf"`, `"Phiếu báo giá.pdf"`, `"Biên bản nghiệm thu.pdf"`, `"Giấy ủy quyền nhận tiền bồi thường.pdf"` |
| Card download button | `"Tải PDF"` |
| Empty state title | `"Chưa có hồ sơ nào được xuất"` |
| Download network fail toast | `"Không thể tải file PDF. Vui lòng thử lại sau."` |
| List query fail inline | `"Không tải được danh sách hồ sơ. Vui lòng thử lại."` |
| Retry button | `"Thử lại"` |
| Pagination controls | `"Trước"` / `"Sau"` / `"Trang {N} / {Total}"` (reuse baseline) |

### 4.4 a11y

- Tab: `<TabsTrigger>` shadcn built-in (`role="tab"`, `aria-selected`, keyboard arrow nav); panel `<TabsContent>` (`role="tabpanel"`).
- List bộ hồ sơ: container `role="list"`, item `role="listitem"`, heading `<h3>` cho mỗi bộ title.
- Grid file: `role="grid"` hoặc semantic `<ul>` list (mỗi item là 1 file card).
- Card file:
  - **2 anchor elements semantic** (cập nhật 2026-06-18):
    - Main anchor (thân card) — `<a target="_blank">` với `aria-label="Xem PDF: {pdfFileName}"`.
    - Download anchor — `<a download>` với `aria-label="Tải về: {pdfFileName}"`.
  - KHÔNG dùng `<button onClick={window.open}>` cho navigation (vi phạm semantic).
- Icon PDF: `aria-hidden="true"`.
- Toast: `role="alert"` (urgent) hoặc `aria-live="polite"` (info).
- Inline error: `aria-describedby` trỏ field/card liên quan.
- **KHÔNG còn** preview pane → KHÔNG cần `role="region"` cho preview.

### 4.5 RBAC render + condition payerType

- Tab chỉ render cho `accountant` + `garage-owner` + `payerType === 'INSURANCE'` — ẩn hoàn toàn DOM.
- KHÔNG có feature flag riêng — gate theo persona + payerType.
- Phiếu QT BH CANCEL → tab vẫn hiển thị (read-only truy vết) — KHÔNG ẩn vì CANCEL (BR-INS-DOSSIER-010).

### 4.6 Business rule secondary (UI hint)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC |
|---|---|---|---|---|
| `BR-INS-DOSSIER-006` | CORNERSTONE | Tab read-only — không có action sửa/xoá PDF | `InsuranceDossierTab.tsx` | AC-6 |
| `BR-INS-DOSSIER-007` | CORNERSTONE | KHÔNG hiển thị nhãn "Đã thay thế"/"Replaced"; không hiển thị `v1,v2` — chỉ phân biệt theo ngày | `dossier-version-card.tsx` title render | AC-2, AC-7 |
| `BR-INS-DOSSIER-009` | NORMAL | Render toàn bộ version không filter | `InsuranceDossierTab.tsx` list map | AC-7 |
| `BR-INS-DOSSIER-010` | NORMAL | Tab vẫn hiển thị khi phiếu CANCEL | `InsuranceSettlementDetailPage.tsx` conditional | AC-6 |
| `BR-INS-DOSSIER-011` | NORMAL | Hiển thị `pdfFileName` từ BFF — KHÔNG tự compose tên file | `dossier-document-card.tsx` | AC-3, AC-5 |
| `BR-INS-DOSSIER-VIEW-008` | CORNERSTONE | Ẩn tab với unauthorized role hoặc payerType !== INSURANCE | `InsuranceSettlementDetailPage.tsx` conditional | AC-8 |
| `BR-INS-STL-DET-004` | NORMAL | Tab integrate đúng vào tab group baseline | `InsuranceSettlementDetailPage.tsx` | AC-1 |

> **Primary enforcement** = BE tier (`features/be/FEAT-INS-DOSSIER-VIEW.md §9`).

### 4.7 Error code mapping (consume từ BFF — cập nhật 2026-06-18 gỡ preview pane)

| Error code (BFF) | Display mode | Component | Label fixed | Source AC |
|---|---|---|---|---|
| `ERR-INS-DOSSIER-VIEW-001` (list query fail) | INLINE_ERROR trong tab panel + retry button | `InsuranceDossierTab.tsx` | `"Không tải được danh sách hồ sơ. Vui lòng thử lại."` | AC-1 |
| `ERR-INS-DOSSIER-VIEW-005` (PDF view 404 — open new tab) | BROWSER NATIVE 404 PAGE (tab mới hiển thị) — FE KHÔNG can thiệp | (browser) | (không có label FE — browser handle) | AC-4 |
| PDF download fail (browser native 404) | TOAST | `useToast()` baseline | `"Không thể tải file PDF. Vui lòng thử lại sau."` | AC-5, AC-9 |
| `ERR-CMN-UNAUTHORIZED` | redirect / tab ẩn | RBAC guard | (không có label — ẩn) | AC-8 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node | AC ref |
|---|---|---|---|---|
| `InsuranceSettlementDetailPage` | `/settlement-voucher/{settlementCode}` (baseline — verify routeTree) | MODIFY (add tab + conditional render) | `13257:480151` section + 2 frame state | AC-1, AC-6, AC-8 |

### 5.2 Components new/modified

| Component | Path | Change type | Props | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|---|
| `InsuranceSettlementDetailPage` | `src/features/insurance-settlement/pages/InsuranceSettlementDetailPage.tsx` | MODIFY (add tab item + conditional) | existing props | tab active state | existing tab group | AC-1, AC-8 |
| `InsuranceDossierTab` | `src/features/insurance-settlement/components/dossier/InsuranceDossierTab.tsx` | NEW | `{ settlementCode }` | query state, pagination | TanStack Query + shadcn `Tabs` content | AC-1, AC-6, AC-7 |
| `dossier-version-card` | `src/features/insurance-settlement/components/dossier/dossier-version-card.tsx` | NEW (kebab-case) | `{ settlementCode, exportedAt, documents[] }` | — | `Card` (priority `customs/` > `share/` > `ui/`) | AC-2, AC-3 |
| `dossier-document-card` | `src/features/insurance-settlement/components/dossier/dossier-document-card.tsx` | NEW (kebab-case) | `{ documentType, pdfUrl, pdfFileName, fileSizeKb, settlementCode }` | — | `Card` + 2 anchor (`<a target="_blank">` + `<a download>`) (priority `customs/` > `share/` > `ui/`) | AC-3, AC-4, AC-5 |
| ~~`pdf-preview`~~ | ~~`pdf-preview.tsx`~~ | **GỠ** (PKG v14 2026-06-18 — pattern open-new-tab thay thế) | — | — | — | — |
| `Pagination` | `src/components/customs/Pagination.tsx` (hoặc `share/` — verify) | REUSE | `{ page, totalPages, size, onPageChange, onSizeChange }` | — | baseline (priority `customs/` > `share/` > `ui/`) | AC-2 (pagination) |
| `EmptyState` | `src/components/customs/EmptyState.tsx` (hoặc `share/` — verify) | REUSE | `{ title }` | — | baseline (priority `customs/` > `share/` > `ui/`) | AC-1 (empty) |

> **PKG v14 §2.4 Bước 1 reuse-first — priority `customs/` > `share/` > `ui/`** (cập nhật 2026-06-18): `Card`, `Tabs`, `Button` verify ở `customs/` → `share/` → `ui/` (shadcn fallback). `Pagination` + `EmptyState` baseline reuse. Build-new **3 component dossier** (kebab-case): `dossier-version-card`, `dossier-document-card`, và wrapper `InsuranceDossierTab`. **GỠ `pdf-preview`** (PKG v14 — open-new-tab thay thế).

### 5.3 Design tokens

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `text-foreground` (#18181b) | `src/index.css` | bộ hồ sơ title, file name | AC-2, AC-3 |
| `text-muted-foreground` (#71717a) | `src/index.css` | subtitle, file reference | AC-2, AC-3 |
| `text-foreground-error` (#dc2626) | `src/index.css` | icon PDF + error message | AC-3, AC-9 |
| `ring-primary` / `border-primary` (#0052ff) | `src/index.css` | card selected highlight | AC-3 |
| `border` / `border-input` (#e4e4e7) | `src/index.css` | card border default | AC-3 |
| `rounded-lg` (8px) | Tailwind | card radius | AC-3 |
| `shadow-sm` | Tailwind | card elevation default | AC-3 |
| `grid-cols-2` | Tailwind | file grid 2 cột | AC-3 |
| `text-xs` / `text-sm` | Tailwind | size scale theo Figma | (visual) |

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack key | AC ref |
|---|---|---|---|---|
| `getInsuranceDossierVersions` | query | `src/api/graphql/getInsuranceDossierVersions.graphql` | `['insuranceDossierVersions', settlementCode, page, size]` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-7 |

**Input variables**:
```graphql
query GetInsuranceDossierVersions($input: GetInsuranceDossierVersionsInput!) {
  getInsuranceDossierVersions(input: $input) {
    content {
      dossierId
      versionNo            # vẫn trả từ BE để consistency — FE KHÔNG hiển thị (BR-INS-DOSSIER-007)
      exportedAt           # ISO timestamp
      documents {
        documentType       # enum: QUOTATION_SHEET | SETTLEMENT_SHEET | ACCEPTANCE_RECORD | PAYMENT_AUTHORIZATION
        pdfUrl             # relative path (ct-file-storage object key) — FE compose full URL
        pdfFileName        # đã đúng naming convention BR-INS-DOSSIER-011: {slug}_{settlementCode}_v{N}.pdf
        fileSizeKb         # số nguyên kb cho display
      }
    }
    page                   # current page (0-indexed)
    size                   # page size
    totalElements          # total bộ hồ sơ
    totalPages             # total pages
  }
}
```

**Download URL compose**:
```typescript
const downloadUrl = `${import.meta.env.VITE_FILE_STORAGE_BASE_URL}/${document.pdfUrl}`;
```

> ADR-016 v11: `pdfUrl` = ct-file-storage object key (no scheme/domain). FE nối domain config. KHÔNG signed URL TTL.

### 6.2 REST endpoints consumed direct

Không có — toàn bộ data qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (dossier list) | TanStack Query | — | `['insuranceDossierVersions', settlementCode, page, size]` | AC-1, AC-2, AC-7 |
| Pagination state | local useState | `InsuranceDossierTab` | `{ page, size }` | AC-2 |
| Selected document state | local useState | `InsuranceDossierTab` | `selectedDocumentId: string` (composite `{dossierId}/{documentType}` hoặc unique id) | AC-3, AC-4 |
| Tab active state | existing shadcn `Tabs` state | `InsuranceSettlementDetailPage` | `activeTab: string` | AC-1 |
| Auth/RBAC | existing auth context | `src/store/auth.ts` | `currentUser.role` | AC-8 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/settlement-voucher/{settlementCode}` (baseline — verify routeTree) | `InsuranceSettlementDetailPage` | existing loader | RBAC: `accountant \| garage-owner` + payerType === INSURANCE | AC-1, AC-8 |

Tab activation qua query param `?tab=dossier-history` (optional) hoặc tab state local — pattern nhất quán với tab group hiện có. Verify `routeTree.gen.ts` theo memory `garage-web-route-singular-vs-api-plural`.

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (Critical Rule #19).

| Layer | Path | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/insurance-settlement/pages/` | `InsuranceSettlementDetailPage.tsx` | MODIFY (add tab conditional) | existing tab group | ~25 | AC-1, AC-8 |
| `src/features/insurance-settlement/components/dossier/` | `InsuranceDossierTab.tsx` | NEW | TanStack Query wrapper + 2-col layout | ~120 | AC-1, AC-6, AC-7 |
| `src/features/insurance-settlement/components/dossier/` | `dossier-version-card.tsx` | NEW (kebab-case) | shadcn `Card` | ~80 | AC-2, AC-3 |
| `src/features/insurance-settlement/components/dossier/` | `dossier-document-card.tsx` | NEW (kebab-case) | shadcn `Card` + click handler | ~70 | AC-3, AC-4, AC-5 |
| ~~`src/features/insurance-settlement/components/dossier/pdf-preview.tsx`~~ | ~~NEW~~ | **GỠ 2026-06-18** (open-new-tab thay thế) | — | — | — |
| `src/features/insurance-settlement/hooks/` | `useInsuranceDossierVersions.ts` | NEW | TanStack Query hook | ~50 | AC-1, AC-2 |
| `src/features/insurance-settlement/types/` | `dossier.types.ts` | NEW (shared với DOSSIER-CREATE) | TypeScript types | (shared ~80 đã ở CREATE) | — |
| `src/api/graphql/` | `getInsuranceDossierVersions.graphql` | NEW (shared với DOSSIER-CREATE refetch) | persisted query | ~25 | AC-1 |
| `src/api/generated/` | `getInsuranceDossierVersions.generated.ts` | AUTO-GEN | codegen | — | — |
| `tests/features/insurance-settlement/dossier/` | `InsuranceDossierTab.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1..AC-9 |
| `tests/features/insurance-settlement/dossier/` | `dossier-version-card.test.tsx` | NEW | Vitest + RTL | ~80 | AC-2, AC-3 |
| `tests/features/insurance-settlement/dossier/` | `dossier-document-card.test.tsx` | NEW | Vitest + RTL | ~80 | AC-3, AC-4, AC-5 |

> **i18n directory KHÔNG đụng** — quyết định 2026-06-18 hardcode VN labels inline.

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + getInsuranceDossierVersions resolver stable)
(← Figma prefetch: Product/ux/figma-web/wave02-ins-dossier-view.md — cần re-prefetch sau update design open-new-tab)
(← PDF lib decision: KHÔNG cần web — open-new-tab dùng browser native viewer)

S6.1  Types + GraphQL query file + codegen
      Entry: BFF S5 SDL stable
      Output: dossier.types.ts (shared), getInsuranceDossierVersions.graphql, codegen green

S6.2  useInsuranceDossierVersions hook + TanStack Query key
      Entry: S6.1
      Output: hook test green

S6.3  dossier-document-card + dossier-version-card
      Entry: S6.1
      Output: 2 component unit-test green (card render + 2 anchor open-new-tab + download)

S6.4  InsuranceDossierTab (compose 1-col layout + pagination + empty/error state)
      Entry: S6.2, S6.3 done
      Output: tab integration test green

S6.5  InsuranceSettlementDetailPage tab integration + RBAC + payerType conditional
      Entry: S6.4
      Output: visual smoke green

S6.6  E2E happy path (Playwright)
      Entry: S6.5 done + BE/BFF staging deployed + ct-file-storage có data test
      Exit: E2E smoke green (click card → assert tab mới mở PDF; click "Tải PDF" → assert download trigger) → hand-off QA
```

> **Cập nhật 2026-06-18**: gỡ S6.4 pdf-preview (KHÔNG cần PDF lib) — DAG giảm từ 7 → 6 steps.

## 9. Business Rules to enforce (FE — UI hint secondary)

Bảng BR liệt ở §4.6 trên — không lặp lại. Primary enforcement = BE tier.

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (tab render + query trigger) | test-ui | mock `getInsuranceDossierVersions` response |
| AC-2 | UI (version card title format + no "Replaced" + no version number display) | test-ui | assert title = `"Bộ hồ sơ #{settlementCode}"`, KHÔNG có "v1", KHÔNG có "Replaced" |
| AC-3 | UI (grid 2 cột + 4 document types + 2 anchor pattern) | test-ui | assert mỗi card có 2 anchor: `<a target="_blank">` + `<a download>`; KHÔNG có card highlight selection (gỡ 2026-06-18) |
| AC-4 | UI (open PDF new tab) | test-ui | mock `window.open`; assert click card thân anchor → `target="_blank"` với URL compose đúng |
| AC-5 | UI (download PDF — `<a download>` với pdfFileName) | test-ui | assert `download` attribute = pdfFileName từ response; click stop propagation không trigger mở tab |
| AC-6 | UI (read-only — không có edit/delete button) | test-ui | assert không có destructive action |
| AC-7 | UI (multi-version list order — newest first) | test-ui | assert render order từ response (BE đã sort) |
| AC-8 | UI + RBAC (tab ẩn với unauthorized + payerType !== INSURANCE) | test-ui + test-isolation | dual persona + payerType |
| AC-9 | UI (error inline + toast) | test-ui | mock list query 404 → assert inline tab panel error + retry button; mock download 404 → assert toast (PDF view 404 → browser native page, KHÔNG assert FE) |
| (smoke) | E2E happy path | test-e2e | Playwright: load tab → verify list + click card → preview + download |

## 11. a11y (KHÔNG có §i18n)

§4.4 trên đã cover. Bảng cụ thể per-AC:

| AC | a11y requirement |
|---|---|
| AC-1 | `<TabsTrigger>` shadcn (`role="tab"`, `aria-selected`); `<TabsContent>` (`role="tabpanel"`) |
| AC-2 | List `role="list"`/`role="listitem"`; version heading `<h3>` |
| AC-3 | Grid `role="grid"` hoặc semantic `<ul>`; icon PDF `aria-hidden`; KHÔNG có `aria-pressed` (no selection) |
| AC-4 | Anchor view `<a target="_blank">` semantic + `aria-label="Xem PDF: {pdfFileName}"` (KHÔNG dùng `<button onClick={window.open}>`) |
| AC-5 | Anchor download `<a download>` semantic + `aria-label="Tải về: {pdfFileName}"` |
| AC-6 | KHÔNG có interactive element nguy hiểm; chỉ `<a>` semantic |
| AC-8 | Tab ẩn không render DOM (không expose với screen reader) |
| AC-9 | Toast error `role="alert"` hoặc `aria-live="polite"`; inline error `aria-describedby` |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-VIEW.md` | DRAFT (pending) | `POST /api/v1/insurance-dossiers/search` paginated Spring Pageable; `pdfUrl` relative path |
| BFF | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-DOSSIER-VIEW.md` | DRAFT (pending) | Query `getInsuranceDossierVersions` passthrough; SDL phải stable trước S6 |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-VIEW.md` | DRAFT (pending) | Mirror — Flutter `ListView` + `DossierPreviewScreen` + PDF embedded |

**Source ID consistency**: `source_feat_sha = d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` — identical cross-tier.

**Key contract dependency**: `VITE_FILE_STORAGE_BASE_URL` env var phải được configure ở `garage-web` để FE compose URL từ `pdfUrl` cho cả 2 actions: (a) view PDF tab mới `<a target="_blank">` (AC-4); (b) download `<a download>` (AC-5). ADR-016 v11: KHÔNG có endpoint `/download` riêng + KHÔNG có signed URL TTL.

## 13. References

- **Source**: [`Product/features/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/features/FEAT-INS-DOSSIER-VIEW.md) v15
- **Figma spec**: [`Product/ux/figma-web/wave02-ins-dossier-view.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-view.md)
- **PKG**: [`Execution/work-packages/PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md) v13 §2.2
- **Paired BE**: [`features/be/FEAT-INS-DOSSIER-VIEW.md`](../be/FEAT-INS-DOSSIER-VIEW.md)
- **Paired BFF**: [`features/bff/FEAT-INS-DOSSIER-VIEW.md`](../bff/FEAT-INS-DOSSIER-VIEW.md)
- **Paired Mobile**: [`features/mobile/FEAT-INS-DOSSIER-VIEW.md`](../mobile/FEAT-INS-DOSSIER-VIEW.md)
- **UX flow**: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../../../../../Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md)
- **ADR-016 v11**: [`Architecture/decisions/ADR-016.md`](../../../../../Architecture/decisions/ADR-016.md) — ct-file-storage + pdfUrl pattern + pagination + KHÔNG signed URL
- **BR file**: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` (BR-INS-DOSSIER-006, 007, 009, 010, 011, VIEW-008)
- **Memory `garage-web-route-singular-vs-api-plural`**: verify route path với `routeTree.gen.ts`

## Related CRs

Hiện không có CR W02 active liên quan tier này. Tham chiếu CR mobile-scoped: [CR-20260622-04](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-04--ins-dossier-view-grid-to-list), [CR-20260622-05](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-05--ins-dossier-view-t40-pdf-viewer-mode) (nếu cần parity verify).

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec FEAT-INS-DOSSIER-VIEW W02. NEED CONFIRMATION #1: Figma node-id. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix #18c + #17: §1 byte-equal canonical; rename `listInsuranceDossiers` → `getInsuranceDossierVersions`. |
| 2026-06-18 | 4 | User request | **3 updates 2026-06-18 (later same day)** — đồng bộ PKG-W02 v14: (a) GỠ inline preview pane (layout 2-cột → **1-cột** list + grid 2-cột file cards); (b) Pattern **open-new-tab** thay preview pane: click thân file card → `<a target="_blank">` mở browser native PDF viewer; nút "Tải PDF" riêng `<a download>` (AC-3/AC-4/AC-5 rewrite); (c) GỠ component `pdf-preview` build-new + DAG bỏ S6.4 (7 → 6 steps); (d) GỠ card highlight selection (không còn purpose); (e) §2 + §5.2 reuse priority đổi sang **`customs/` > `share/` > `ui/`** (PKG v14 §2.4 Bước 1 — `customs/` ưu tiên cao nhất domain-specific); (f) §4.1 visual fidelity + §4.4 a11y + §4.7 error mapping + §10 test scope + §12 cross-tier update đồng bộ open-new-tab pattern; (g) Note: Figma spec `wave02-ins-dossier-view.md` cần re-prefetch (current captures preview pane design — out-of-date). KHÔNG đổi AC business semantics / GraphQL contract / file paths / i18n policy. |
| 2026-06-22 | 5 | Delivery Authority | Thêm section "Related CRs" — không có CR W02 active liên quan tier FE-web; chỉ note tham chiếu CR mobile-scoped (CR-20260622-04, CR-20260622-05) để parity verify. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
| 2026-06-18 | 3 | User request | **Realign hoàn toàn với PKG-W02 v13 + FEAT v15 + Figma spec wave02-ins-dossier-view.md**. Major changes: **(a)** SỬA title format `"Bộ hồ sơ v{n} — {date}"` → `"Bộ hồ sơ #" + settlementCode` (FEAT v15 AC-2 + PKG §2.2 — title dùng settlementCode, KHÔNG dùng versionNo); **(b)** THÊM subtitle format `"Xuất ngày {dd/MM/yyyy HH:mm} · {N} tài liệu PDF"`; **(c)** GỠ hiển thị version number `v1, v2` (BR-INS-DOSSIER-007 explicit cấm); **(d)** SỬA empty state copy từ generic Figma component → `"Chưa có hồ sơ nào được xuất"` (FEAT v15 AC-1 `ERR-INS-010`); **(e)** THÊM card highlight selection logic (default file đầu của bộ mới nhất + click switch — FEAT v15 AC-3 + Figma spec); **(f)** THÊM layout 2-cột (cột trái list + cột phải preview PDF + nút "Tải PDF" — PKG §2.2 explicit; bổ sung cho phần FEAT chưa rõ); **(g)** SỬA file paths `src/features/insurance-dossier/` → `src/features/insurance-settlement/components/dossier/` (per PKG §2.4 Bước 4); **(h)** ĐỔI component naming PascalCase → kebab-case `dossier-version-card.tsx` / `dossier-document-card.tsx` / `pdf-preview.tsx` (per PKG §2.4 Bước 1); **(i)** THÊM condition payerType === INSURANCE cho RBAC gate (BR-INS-DOSSIER-VIEW-008 + BR-INS-STL-DET-007); **(j)** TÁCH AC-4 (preview pane) và AC-5 (download button) thay vì gộp (FEAT v15 + PKG §2.2 layout 2-cột rõ ràng); **(k)** GỠ HOÀN TOÀN i18n keys + namespace `insuranceDossier.*` — hardcode fixed VN labels inline (user request 2026-06-18); §4.3 thay bằng catalog label fixed; (l) SỬA error code mapping align với BFF + thêm display mode cho preview/download fail vs list fail. Status tier-authoritative READY. |
