---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-EXPORT.md"
source_version: 8
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-EXPORT"
source_feat_sha: "4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-web"
platform: web
modifies: []
change_type: "brownfield-enhancement"
consumes_backend_feats: ["FEAT-CAT-PROD-EXPORT"]
consumes_bff_feats: ["FEAT-CAT-PROD-EXPORT"]
i18n_keys:
  - "catalog.internalProduct.export.button"
  - "catalog.internalProduct.export.limitExceeded"
screens_touched:
  - "src/features/catalog/internal-products/ProductListPage.tsx"
figma_refs:
  - "NOT_APPLICABLE — export is a desktop action triggered từ ProductListPage toolbar (button + native browser download dialog); không có Figma node riêng. Visual fidelity follows ProductListPage canonical (FEAT-CAT-PROD-LIST) + shadcn Dialog tokens cho confirm modal. Registry lookup `Product/ux/figma/figma-links.yaml waves[03]` confirms no EXPORT key (2026-06-30)."
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "not-provided"
  template_sha: "b196f9...8b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-EXPORT.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-EXPORT (FE Web): Xuất danh mục mã sản phẩm nội bộ ra Excel

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EXPORT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/catalog/internal-products/ProductListPage.tsx` |
| Cross-tier consume | BE: FEAT-CAT-PROD-EXPORT \| BFF: FEAT-CAT-PROD-EXPORT |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-EXPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-EXPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-EXPORT.md) |
| Source version | v8 |
| Source SHA | `4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xuất danh sách mã sản phẩm nội bộ ra file Excel để tra cứu ngoài hệ thống hoặc chuẩn bị dữ liệu tái import lần sau. Feature nằm ở cuối flow danh mục vật tư W03: sau khi thiết lập và lọc mã sản phẩm nội bộ, người dùng có thể export kết quả bộ lọc hiện tại thành file tải về ngay. File xuất ra có cấu trúc 9 cột đồng nhất với template import, đảm bảo dữ liệu có thể tái sử dụng mà không cần chuyển đổi thêm.

## 2. Trách nhiệm FE Web (garage-web)

- Hiển thị nút "Xuất Excel" trên toolbar của màn hình danh sách mã sản phẩm nội bộ (`ProductListPage`); reuse `share/exports/export-excel` component cho button UI.
- Khi user nhấn nút: thu thập trạng thái bộ lọc hiện tại từ list page state, gọi lazy query `exportInternalProducts` (V2-Q7) với filter params tương ứng; handler inline ~20 LoC — không tạo hook riêng.
- Khi query thành công: redirect browser tới `data.downloadUrl` bằng `window.location.href = downloadUrl` để trigger download file Excel.
- Khi query trả về ERR-INV-045 (vượt 1.000 dòng): hiển thị DIALOG (không phải toast) với nội dung canonical từ registry — hướng dẫn user thu hẹp bộ lọc rồi xuất lại.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: scan §G.X trước mọi UI task; `share/exports/export-excel` ở Priority 2 đã match nhu cầu button Export.
- RBAC render: nút "Xuất Excel" chỉ hiện với `garage-owner` và `accountant` có quyền xuất — KHÔNG show-then-disable.
- **Figma spec là visual SSOT**: FIGMA SPEC MISSING per bundle §G.Y — mọi quyết định layout/visual phải chờ sau khi chạy `/prefetch-figma web 03 FEAT-CAT-PROD-EXPORT`. KHÔNG suy luận visual từ AC/BR text.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Trigger xuất và xử lý kết quả

#### AC-1 → Truyền bộ lọc hiện tại khi gọi export

- **Khi**: user nhấn nút "Xuất Excel" trên `ProductListPage`
- **FE phải**: đọc toàn bộ filter state hiện tại của list page (keyword, status, nature, materialGroupId — cùng schema với `searchProducts`); truyền làm input cho lazy query `exportInternalProducts` (V2-Q7); chuyển button sang state loading (disabled + spinner)
- **State transition**: idle → loading (button disabled) → success hoặc error
- **Component**: `src/components/share/exports/export-excel.tsx` (reuse Priority 2)
- **GraphQL op**: `exportInternalProducts` (lazy query V2-Q7) — xem §6.1
- **i18n keys**: `catalog.internalProduct.export.button` → vi: "Xuất Excel" / en: "Export Excel"
- **a11y**: button có `aria-label="Xuất Excel"` khi icon-only; `aria-busy="true"` khi loading
- **Ref**: paired BFF FEAT §6.1 op `exportInternalProducts` (V2-Q7); Figma: NEED CONFIRMATION (§G.Y missing)

#### AC-3 → Export khi không có bộ lọc nào được chọn

- **Khi**: user nhấn "Xuất Excel" khi list page đang ở trạng thái filter rỗng (không có keyword, status = mặc định ACTIVE, không chọn nature/materialGroupId)
- **FE phải**: truyền filter params rỗng/mặc định tới `exportInternalProducts`; backend trả toàn bộ sản phẩm ACTIVE trong phạm vi tenant — FE không cần xử lý đặc biệt cho trường hợp này
- **State transition**: idle → loading → success (download trigger) hoặc ERR-INV-045 nếu vượt 1.000 dòng
- **Component**: reuse `share/exports/export-excel` (Priority 2) — cùng button component với AC-1
- **Ref**: cùng handler path với AC-1

#### AC-5 → Xử lý giới hạn 1.000 dòng (ERR-INV-045)

- **Khi**: `exportInternalProducts` trả lỗi ERR-INV-045
- **FE phải**: đóng loading state, hiển thị DIALOG (không toast) với message canonical từ error registry: `catalog.internalProduct.export.limitExceeded`
- **State transition**: loading → error → dialog open; sau khi user đóng dialog → idle (button enabled lại)
- **Component**: `src/components/ui/dialog.tsx` (Priority 3 — shadcn ui fallback; không có customs/share dialog fit alertdialog use case)
- **GraphQL op**: error path từ `exportInternalProducts`
- **i18n keys**: `catalog.internalProduct.export.limitExceeded` (vi/en đồng bộ canonical R23)
- **a11y**: dialog có `role="alertdialog"`, focus trap, Escape đóng, nút "Đóng" có `aria-label`
- **Ref**: R23 canonical registry display token; ERR-INV-045

### Cluster B — Phân quyền

#### AC-4 → RBAC render nút Xuất Excel

- **Khi**: màn hình `ProductListPage` render
- **FE phải**: kiểm tra role từ auth context — chỉ hiển thị nút "Xuất Excel" với `garage-owner` và `accountant`. Nếu không có quyền → nút ẩn hoàn toàn (KHÔNG show-then-disable)
- **State transition**: conditional render — role check tại mount, không có state machine riêng
- **Component**: `share/exports/export-excel` wrapped trong RBAC guard (role prop hoặc wrapper `can('export:internalProduct')`)
- **i18n keys**: —
- **a11y**: khi ẩn nút, không để lại placeholder element
- **Ref**: BR-CAT-PROD-024 (RBAC — secondary enforcement FE, primary tại BE)

#### AC-2 → N/A (FE Web không touch)

- Source AC này mô tả cột Excel trong file export — toàn bộ column mapping thực hiện ở BE (gf-inventory) và trả về qua file Excel. FE Web chỉ trigger download URL, không kiểm soát nội dung file.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- **NEED CONFIRMATION**: Figma spec cho FEAT-CAT-PROD-EXPORT chưa được prefetch (bundle §G.Y: FIGMA SPEC MISSING). Chạy `/prefetch-figma web 03 FEAT-CAT-PROD-EXPORT` trước khi finalize visual AC.
- Sau khi có figma spec: bám tokens, layout button Export trên toolbar, vị trí relative với các action khác (Import, filter).
- Design tokens: KHÔNG hardcode hex/px — chờ figma spec xác nhận tokens cụ thể; dùng tokens từ `tailwind.config.js` / `src/styles/tokens/**` theo pattern hiện hành.
- Wireframe fallback hiện tại: `Product/ux/UX-FLOW-INVENTORY-CATALOG.md`.

### 4.2 State machine + error handling

- State transition export button: `idle | loading | success | error(ERR-INV-045) | error(other)`
- Loading: button disabled + spinner indicator trong `share/exports/export-excel`
- Success: `window.location.href = data.downloadUrl` → browser download; button trở về idle
- ERR-INV-045: DIALOG (không toast) với canonical message `catalog.internalProduct.export.limitExceeded`
- Error khác (network, 500): toast error generic — KHÔNG silent fail

### 4.3 i18n + a11y

- i18n keys qua `src/i18n/{vi,en}.json` (không có override VN-only cho W03 export feature).
- Key bắt buộc: `catalog.internalProduct.export.button`, `catalog.internalProduct.export.limitExceeded`
- Vi string `limitExceeded` PHẢI verbatim match canonical R23: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"
- a11y: button `aria-label` khi icon-only; dialog `role="alertdialog"` + focus trap + Escape đóng; Tab order hợp lệ.

### 4.4 RBAC render + feature flag

- Nút "Xuất Excel" chỉ render với `garage-owner` và `accountant` có quyền xuất — RBAC từ auth context (JWT claims).
- KHÔNG show-then-disable — nếu không có quyền thì không render element.
- Nếu có feature flag `catalog_export_enabled` per PKG: kiểm tra flag trước khi render. — NEED CONFIRMATION (flag name chưa xác nhận trong bundle).

### 4.5 Business rule secondary (UI hint)

- BR-CAT-PROD-024 (RBAC — phạm vi garage): FE enforce qua RBAC render (§4.4); BE là primary enforce.
- BR-CAT-PROD-007 (tenant isolation): FE không cần xử lý thêm — JWT header tự động qua Apollo client; nếu BE trả 403 → toast error generic.
- Giới hạn 1.000 dòng: FE không pre-validate trên client (không biết row count trước khi gọi) — chỉ xử lý ERR-INV-045 sau khi server trả về.

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-045` | DIALOG | `src/components/ui/dialog.tsx` | AC-5 |
| Network / 500 | TOAST | toast (shared) | — |
| 403 Forbidden | TOAST | toast (shared) | AC-4 |

---

## 5. Screen / Component breakdown (FE — primary content)

> Author scan `src/components/{customs,share,ui}/` — bundle §G.X báo "KG parse error; author MUST scan filesystem manually". Orchestrator context xác nhận `share/exports/export-excel` available Priority 2 (PKG R22 v11).

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `ProductListPage` | `/catalog/internal-products` | MODIFY (add Export button to toolbar) | NEED CONFIRMATION (§G.Y missing) | AC-1, AC-3, AC-4, AC-5 |

### 5.2 Components new/modified

> Author scan kết quả (manual per §G.X mandate): `share/exports/export-excel` xác nhận bởi orchestrator context (PKG R22). Dialog error case dùng shadcn primitive (không có customs/share dialog fit alertdialog). Handler inline, không tạo component riêng.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `export-excel` | `src/components/share/exports/export-excel.tsx` | REUSE | `{ onClick, loading, disabled }` | — | **Priority 2 — share/** (cross-feature export button baseline, PKG R22) | AC-1, AC-3 |
| `<Dialog>` (shadcn) | `src/components/ui/dialog.tsx` | REUSE | shadcn props | — | **Priority 3 — ui/** (shadcn fallback — no customs/share dialog fit error alertdialog use case after §G.X scan) | AC-5 |
| Export handler (inline) | `src/features/catalog/internal-products/ProductListPage.tsx` | MODIFY (~20 LoC inline) | — | `exportLoading`, `dialogOpen` | — | AC-1, AC-3, AC-4, AC-5 |

### 5.3 Design tokens & Figma refs

> FIGMA SPEC MISSING (bundle §G.Y) — design tokens bên dưới là NEED CONFIRMATION cho đến khi `/prefetch-figma web 03 FEAT-CAT-PROD-EXPORT` hoàn thành.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| NEED CONFIRMATION | `tailwind.config.js` | Button Export visual states (loading/idle/disabled) | AC-1 |
| NEED CONFIRMATION | `tailwind.config.js` | Dialog background / border color | AC-5 |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo Figma. Không re-invent từ AC text.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `exportInternalProducts` | lazy query (V2-Q7) | `src/api/graphql/exportInternalProducts.graphql` | — (lazy, không cache) | — | AC-1, AC-3, AC-5 |

> Op `exportInternalProducts` phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #16). Input: subset của `InternalProductSearchInput` (keyword, status, nature, materialGroupId). Response: `{ downloadUrl: String! }`. Trigger: `useLazyQuery` — gọi on-demand khi user click, KHÔNG gọi khi mount. Sau khi success: `window.location.href = data.exportInternalProducts.downloadUrl`.

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — export hoàn toàn qua BFF GraphQL op.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Export query state | Apollo `useLazyQuery` | inline trong `ProductListPage` | — (lazy, no cache key) | AC-1, AC-3 |
| Dialog open state | React `useState` | inline trong `ProductListPage` | `dialogOpen` | AC-5 |
| Filter state (đọc, không sở hữu) | Zustand / TanStack Query | `src/store/catalog/internalProductFilter.ts` (existing) | `filterStore` | AC-1 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/catalog/internal-products` | `ProductListPage` | existing (từ `FEAT-CAT-PROD-LIST`) | RBAC: `garage-owner` \| `accountant` | AC-4 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (Critical Rule #1).

| Layer | Path | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Screen (modify) | `src/features/catalog/internal-products/ProductListPage.tsx` | MODIFY (+~20 LoC inline handler) | existing page | ~20 | AC-1, AC-3, AC-4, AC-5 |
| GraphQL op | `src/api/graphql/exportInternalProducts.graphql` | NEW | persisted query | ~10 | AC-1, AC-3 |
| GraphQL generated | `src/api/generated/exportInternalProducts.generated.ts` | AUTO-GEN | codegen | — | — |
| i18n vi | `src/i18n/vi/catalog.json` | ADDITIVE (2 keys) | i18next | ~3 | AC-1, AC-5 |
| i18n en | `src/i18n/en/catalog.json` | ADDITIVE (2 keys) | i18next | ~3 | AC-1, AC-5 |

> Tổng delta: ~35 LoC net (handler inline + GraphQL op + i18n). Không tạo file component riêng — handler inline per PKG R22 v11.

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: `exportInternalProducts` op stable)

S6  UI wire (web) — Export Excel
    Entry: BFF S5 SDL stable (`exportInternalProducts` op confirmed) + Figma confirmed (run /prefetch-figma)
    Exit: E2E smoke green (click Export → file download triggered; ERR-INV-045 → dialog render)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Add `exportInternalProducts` GraphQL op + inline handler + i18n keys | features + graphql + i18n | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ: RBAC-driven render + error code → display mode mapping.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-024` | CORNERSTONE | hide Export button khi không có quyền | `src/features/catalog/internal-products/ProductListPage.tsx` (RBAC guard) | AC-4 | BE final enforce |
| `BR-CAT-PROD-007` | CORNERSTONE | tenant scope — headers tự động qua Apollo client | Apollo client config (existing) | AC-4 | BE final enforce |
| `BR-GF-INVENTORY-CATALOG` | CORNERSTONE | ERR-INV-045 dialog khi vượt 1.000 dòng | `ProductListPage.tsx` (error handler inline) | AC-5 | Giới hạn export per R23 |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-PROD-EXPORT.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI + E2E | test-ui + test-e2e | Click Export với filter → download triggered; mock `exportInternalProducts` response |
| AC-2 | N/A | — | Column mapping kiểm tra ở BE test |
| AC-3 | UI | test-ui | Click Export không filter → same handler path, mock empty filters |
| AC-4 | UI (RBAC visibility) | test-ui + test-isolation | dual persona: garage-owner + accountant thấy nút; unauthorized ẩn |
| AC-5 | UI (error dialog) | test-ui | Mock ERR-INV-045 → dialog render + canonical message content |
| (smoke) | E2E happy path | test-e2e | Playwright: login → list page → click Export → verify download URL redirect |

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `catalog.internalProduct.export.button` | "Xuất Excel" | "Export Excel" | AC-1 |
| `catalog.internalProduct.export.limitExceeded` | "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" | "Result exceeds 1,000 rows — please apply filters to narrow the scope and try again" | AC-5 |

> Vi string `limitExceeded` PHẢI verbatim match canonical R23 registry display token.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Export button: `aria-label="Xuất Excel"` (nếu icon-only); `aria-busy="true"` khi loading | manual QA |
| AC-4 | Khi ẩn nút: không render placeholder — KHÔNG dùng `aria-hidden` trên placeholder | conditional render |
| AC-5 | Dialog: `role="alertdialog"`, focus trap khi open, Escape đóng, nút "Đóng" có `aria-label` | WCAG 2.1 AA |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-EXPORT.md` | DRAFT | BR primary enforcement; column mapping Excel; ERR-INV-045 source |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-EXPORT.md` | DRAFT | `exportInternalProducts` (V2-Q7) op SDL + resolver — FE consume §6.1 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-EXPORT.md` | N/A | Export Excel không áp dụng cho mobile (browser download pattern không available) |

**Source ID consistency** (item #18): `source_feat_sha` = `4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03` — identical với BE/BFF files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-EXPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-EXPORT.md) v8
- **Paired BE**: [`features/be/FEAT-CAT-PROD-EXPORT.md`](../be/FEAT-CAT-PROD-EXPORT.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-EXPORT.md`](../bff/FEAT-CAT-PROD-EXPORT.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Figma**: NEED CONFIRMATION — run `/prefetch-figma web 03 FEAT-CAT-PROD-EXPORT`

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-PROD-EXPORT` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3 dòng, identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map 5 AC (AC-2 N/A — column mapping BE), §4 visual fidelity NEED CONFIRMATION (FIGMA SPEC MISSING) + state machine + i18n + a11y + RBAC, §5 screen MODIFY ProductListPage + share/export-excel Priority 2 reuse + shadcn Dialog Priority 3, §6 `exportInternalProducts` lazy query V2-Q7, §7 ~35 LoC delta inline. 2x NEED CONFIRMATION: figma_refs + design tokens. |
