---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-DETAIL.md"
source_version: 5
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-DETAIL"
source_feat_sha: "6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4"
generated_at: "2026-07-08T05:30:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-AP-DETAIL"]
consumes_bff_feats: ["FEAT-AP-DETAIL"]
i18n_keys: []                                          # fixed VN labels — xem §4.3 NEED CONFIRMATION
screens_touched:
  - "src/features/inventory/accounting-period/pages/AccountingPeriodDetailPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ap-detail.md (node 14146:87552 — Year 13523:69659 / Quarter-Month 13523:70227 / Quarter-Month edited 13523:70433)"
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NEED CONFIRMATION"
  template_sha: "NEED CONFIRMATION"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-DETAIL.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-DETAIL (FE Web): Chi tiết kỳ kế toán

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DETAIL` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/features/inventory/accounting-period/pages/AccountingPeriodDetailPage.tsx` |
| Cross-tier consume | BE: `FEAT-AP-DETAIL` \| BFF: `FEAT-AP-DETAIL` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-DETAIL.md`](../../../../../Product/features/FEAT-AP-DETAIL.md) |
| Source version | v5 |
| Source SHA | `6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4` |
| Generated at | 2026-07-08T04:51:55+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xem đầy đủ thông tin một kỳ kế toán cụ thể — bao gồm thông tin định danh, khoảng ngày, trạng thái đóng/mở và dấu vết audit (ai tạo, ai sửa, khi nào) — trước khi quyết định chỉnh sửa hay xóa kỳ đó. Đây là điểm dừng trung gian giữa danh sách kỳ (`FEAT-AP-LIST`) và thao tác chỉnh sửa (`FEAT-AP-EDIT`), phục vụ nghiệp vụ quản lý cây kỳ kế toán Năm→Quý→Tháng làm mốc khóa sổ kho.

## 2. Trách nhiệm FE Web (garage-web)

- Render trang read-only tại route `/inventory/accounting-period/:id`, mở từ row action "Xem" ở `FEAT-AP-LIST`; layout: page header (back-arrow + tiêu đề biến thiên theo loại kỳ + nút "Chỉnh sửa" outline top-right, KHÔNG có nút "Đóng" riêng) + section "Thông tin chung" 3-hàng-4-cột.
- User flow chính: user mở trang → FE fetch chi tiết kỳ qua BFF → render field grid (biến thể theo `type` YEAR vs QUARTER/MONTH) → user click "Chỉnh sửa" → điều hướng `FEAT-AP-EDIT`, hoặc click back-arrow → quay về `FEAT-AP-LIST`.
- Quản lý state UI: `idle → loading (skeleton field grid) → success (field grid populated) | error (not-found → empty-state hoặc toast)`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): Author đã scan `.claude/references/web-component-registry.yaml` (§G.X KG parse error → scan manual). Kết quả reuse ở §5.2 — không cần build-new component nào ngoại trừ layout wrapper `AccountingPeriodFieldGrid` (không có component grid-detail sẵn trong registry).
- **Figma spec là visual SSOT**: layout, token, verbatim label theo `Product/ux/figma-web/wave04-ap-detail.md` (node `14146:87552`). Mọi visual AC trong spec này cross-ref figma section cụ thể (§1 Layout DSL, §2 Design Token Map, §8 Anti-Pattern Trap).
- GraphQL op consume từ BFF: query `getAccountingPeriod(id: ID!)` trả `AccountingPeriodDetail!`.
- RBAC render: route yêu cầu authenticated user với role `garage-owner` HOẶC `accountant` — quyền ngang nhau (BR-AP-CMN-002); KHÔNG có ẩn/hiện field/CTA theo role trong màn này (khác với các FEAT khác có row action write-restricted).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Mỗi source AC-ID → 1 FE behaviour statement. Coverage gate: 6/6 AC-ID.

### Cluster A — Mở màn + header

#### AC-1 → FE render page header với tiêu đề biến thiên + nút Chỉnh sửa + back-arrow, KHÔNG có nút Đóng

- **Khi**: user điều hướng đến route `/inventory/accounting-period/:id` (từ row action "Xem" ở `FEAT-AP-LIST`)
- **FE phải**: mount `AccountingPeriodDetailPage`, đọc `:id` từ route param, trigger BFF query `getAccountingPeriod(id)`; render `PageHeader` gồm back-arrow (trái) + `PageTitle` nội suy hậu tố theo loại kỳ ("Chi tiết kỳ kế toán {năm|quý|tháng}") + `EditCTA` outline "Chỉnh sửa" (phải) — **KHÔNG** render nút "Đóng" riêng (điều hướng chỉ qua back-arrow, per figma `_negative_coverage` EC-1)
- **State transition**: `idle → loading (skeleton page header + field grid) → success | error (404 → empty-state "Kỳ kế toán không tồn tại")`
- **Component**: `AccountingPeriodDetailPage.tsx` (NEW) dùng `share/layouts/page-header` (REUSE)
- **GraphQL op**: `getAccountingPeriod` — input `{ id }`
- **i18n keys**: fixed VN labels (NEED CONFIRMATION — xem §4.3)
- **a11y**: `<h1>` tiêu đề trang; back-arrow button `aria-label="Quay lại danh sách kỳ kế toán"`
- **Ref**: figma spec `wave04-ap-detail.md` §1 Layout DSL `PageHeader` + §8 Anti-Pattern Trap `AP-AP-DET-1`/`AP-AP-DET-7`; node `13523:69659` / `13523:70433`

### Cluster B — Field grid (thông tin chung)

#### AC-2 → FE render field grid 3-hàng-4-cột với biến thể theo loại kỳ (Thuộc kỳ chỉ Q/M)

- **Khi**: BFF `getAccountingPeriod` trả về thành công (state success)
- **FE phải**: render `AccountingPeriodFieldGrid` với 3 hàng × 4 cột (label-above-value, read-only text — KHÔNG input control):
  - **Hàng 1 (biến thể theo `type`)**: `type === 'YEAR'` → [Loại kỳ, Tên kỳ kế toán, Thứ tự hiển thị, (cột 4 rỗng)]; `type ∈ {QUARTER, MONTH}` → [Loại kỳ, Tên kỳ kế toán, Thuộc kỳ (`parentName`), Thứ tự hiển thị]
  - **Hàng 2 (giống nhau mọi variant)**: [Trạng thái, Ngày bắt đầu, Ngày kết thúc, Mô tả]
  - Format ngày `DD/MM/YYYY`; "Loại kỳ" hiển thị display name tĩnh theo `type` ("Kỳ kế toán năm/quý/tháng"); "Mô tả" wrap nhiều dòng nếu dài
- **State transition**: `loading (skeleton 3×4 grid) → success (grid filled)`
- **Component**: `AccountingPeriodFieldGrid.tsx` (Build-new wrapper) composes `share/displays/description-item` (REUSE) × 8 cells hàng 1-2
- **GraphQL op**: field từ `getAccountingPeriod` response — `type`, `name`, `parentName`, `displayOrder`, `status`, `startDate`, `endDate`, `description`
- **i18n keys**: fixed VN labels (NEED CONFIRMATION)
- **a11y**: mỗi `InforItem` label + value đọc theo cặp (label trước, value sau) khi screen reader duyệt qua grid
- **Ref**: figma spec `wave04-ap-detail.md` §1 Layout DSL `FieldGrid` Row1/Row2 + §5 Field Composition Schema + §8 Anti-Pattern Trap `AP-AP-DET-2`; node `13523:69659` (Year) + `13523:70433` (Q/M)

### Cluster C — Audit trail

#### AC-3 → FE render 4 field audit (Ngày tạo/Người tạo/Ngày sửa/Người sửa), giữ label khi rỗng

- **Khi**: BFF response thành công, bất kể kỳ đã từng sửa hay chưa
- **FE phải**: render hàng 3 gồm 4 `InforItem`: Ngày tạo (`createdAt` format `DD/MM/YYYY HH:mm`), Người tạo (`createdByName`), Ngày sửa (`updatedAt` — nếu `null` render `—`), Người sửa (`updatedByName` — nếu `null` render `—`). **Label LUÔN hiển thị dù giá trị rỗng — KHÔNG ẩn field** khi kỳ chưa từng sửa
- **State transition**: (thuộc success state chung — không có state riêng)
- **Component**: `share/displays/description-item` (REUSE) × 4 cells, prop `emptyPlaceholder="—"`
- **GraphQL op**: field `createdAt`, `createdByName`, `updatedAt`, `updatedByName` từ `getAccountingPeriod`
- **a11y**: label "Ngày sửa"/"Người sửa" vẫn đọc được screen reader kể cả value rỗng (không dùng `display: none`)
- **Ref**: figma spec `wave04-ap-detail.md` §1 Layout DSL `Row3` `_empty_render` + §8 Anti-Pattern Trap `AP-AP-DET-3`; node `13523:70227` (empty state) / `13523:70433` (populated)

### Cluster D — Navigation

#### AC-4 → FE điều hướng sang FEAT-AP-EDIT khi click nút Chỉnh sửa

- **Khi**: user click `EditCTA` "Chỉnh sửa"
- **FE phải**: `navigate('/inventory/accounting-period/edit/{id}')` — verbatim label "Chỉnh sửa" (2 từ, KHÔNG "Sửa" hay "Chỉnh sửa kỳ"), variant `outline` (KHÔNG brand-blue primary)
- **State transition**: click → route transition (không có loading state riêng cho nút này)
- **Component**: `share/buttons/button` (REUSE) variant="outline", leadingIcon Edit2 (iconsax-reactjs)
- **GraphQL op**: — (pure navigation, không gọi mutation)
- **a11y**: button có text label visible, `aria-label` không cần thiết vì label đủ rõ
- **Ref**: figma spec `wave04-ap-detail.md` §1 Layout DSL `EditCTA` + §8 Anti-Pattern Trap `AP-AP-DET-4`/`AP-AP-DET-5`/`AP-AP-DET-6`; node `13523:69659` L143

#### AC-5 → FE điều hướng về FEAT-AP-LIST khi click back-arrow; KHÔNG có nút Đóng riêng

- **Khi**: user click `BackLink` (icon ArrowLeft, đầu header)
- **FE phải**: `navigate('/inventory/accounting-period')` — quay về danh sách kỳ. Xác nhận lại: **không** có nút "Đóng" thứ hai trong header (đã cover ở AC-1 nhưng nhắc lại tại đây theo đúng phạm vi source AC-5)
- **State transition**: click → route transition
- **Component**: `share/buttons/button` (REUSE) size="icon" variant="ghost", icon ArrowLeft (iconsax-reactjs)
- **GraphQL op**: — (pure navigation)
- **a11y**: `aria-label="Quay lại danh sách kỳ kế toán"`
- **Ref**: figma spec `wave04-ap-detail.md` §1 Layout DSL `BackLink` + §8 Anti-Pattern Trap `AP-AP-DET-1`; node `13523:69659` L143

### Cluster E — Phân quyền

#### AC-6 → FE guard route theo 2 role ngang quyền, không ẩn/hiện field theo role

- **Khi**: user (bất kỳ role nào trong 2 role hệ thống) mở route detail
- **FE phải**: route guard yêu cầu authenticated + role ∈ {`garage-owner`, `accountant`} (BR-AP-CMN-002 — quyền ngang nhau). Không có field hay CTA nào bị ẩn/disable theo role trong màn DETAIL này (khác các FEAT write-heavy khác)
- **Component**: route `beforeLoad` guard (không phải component riêng)
- **Ref**: paired BE spec §4 (tenant filter) + BFF spec §4 (auth header propagation); BR-AP-CMN-002

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave04-ap-detail.md` (node `14146:87552`, 3 screen: `13523:69659` Year / `13523:70227` Q/M intermediate / `13523:70433` Q/M fully edited). KHÔNG re-invent layout/spacing/color.
- Section "Thông tin chung" render **plain stack layout — KHÔNG bọc Card** (§8 Anti-Pattern Trap `AP-AP-DET-8`).
- `InforItem` render **label-above-value vertical stack** — KHÔNG dùng table key-value row (§8 Anti-Pattern Trap `AP-AP-DET-9`).
- Icon **iconsax-reactjs** (ArrowLeft, Edit2, variant Linear) — KHÔNG `lucide-react` (§8 Anti-Pattern Trap `AP-AP-DET-10`).
- Header layout: back-arrow + tiêu đề trái, EditCTA outline phải, `justify: space-between`. KHÔNG breadcrumb.
- Mỗi visual AC (field grid biến thể, empty-state audit) MUST cross-ref figma section — xem §3 mỗi entry.
- Design tokens MUST khớp tokens ở §5.3 (không hardcode hex/px).

### 4.2 State machine + error handling

- State tường minh: `idle | loading | success | error`. Loading → skeleton page header + skeleton 3×4 field grid (KHÔNG blank trắng).
- Error `id` không tồn tại hoặc tenant-mismatch → BFF trả `ERR-CMN-not-found` (404, cùng code cho cả 2 case — KHÔNG leak existence cross-tenant) → FE render empty-state "Kỳ kế toán không tồn tại" thay vì field grid.
- Lỗi mạng/5xx/timeout → TOAST, KHÔNG silent fail.
- KHÔNG có mutation trong màn này (pure read) → không cần optimistic UI.

### 4.3 i18n + a11y

- **i18n policy**: fixed VN labels inline theo pattern W03/W04 hiện tại (NEED CONFIRMATION — xác nhận với BA/PO xem wave có dùng i18next hay không). `i18n_keys: []`.
- a11y: `<h1>` cho page title; back-arrow icon-button có `aria-label`; mỗi `InforItem` label + value đọc theo cặp; focus order Tab: BackLink → EditCTA → (không có input tương tác trong field grid, chỉ text).
- Color contrast: `text-muted-foreground` (label) trên `bg-background` đạt WCAG AA.

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` gate (TanStack Router `beforeLoad`) — sidebar/tab "Kỳ kế toán" ẩn khi flag OFF, redirect nếu truy cập trực tiếp URL (CR-20260707-02).
- Persona check: route yêu cầu 1 trong 2 role `garage-owner`/`accountant`, quyền ngang nhau (BR-AP-CMN-002) — KHÔNG có phân biệt hiển thị field/CTA giữa 2 role trong màn DETAIL.
- KHÔNG show-then-disable — nếu unauthorized → redirect.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-AP-DETAIL.md §9`). FE chỉ:
  - BR-AP-CMN-001 (audit display): FE render đủ 4 field audit, giữ label khi rỗng (§3 AC-3).
  - BR-AP-CMN-002 (phân quyền ngang nhau): FE route guard 2-role, không ẩn field theo role (§3 AC-6).
  - BR-AP-010 (trạng thái 2 giá trị OPEN/CLOSED): FE hiển thị đúng label "Chưa đóng"/"Đã đóng" tại field "Trạng thái" — sửa trạng thái thực hiện ở `FEAT-AP-EDIT`, KHÔNG có toggle tại DETAIL.

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-CMN-not-found` (404) | EMPTY_STATE | `AccountingPeriodDetailPage` (thay field grid) | AC-1, AC-2 |
| `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` (downstream forward) | TOAST | global toast | AC-1 |
| `UNAUTHENTICATED_ERROR` / `FORBIDDEN_ERROR` | REDIRECT `/unauthorized` (hoặc login) | route guard | AC-6 |
| `UNKNOWN_ERROR` / `INTERNAL_ERROR` (500) | TOAST | global toast | AC-1 |

---

## 5. Screen / Component breakdown (FE — primary content)

> §G.X: KG parse error — Author đã scan `.claude/references/web-component-registry.yaml` (canonical registry) filesystem manually thay vì `knowledge-graph.yaml`.

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `AccountingPeriodDetailPage` | `/inventory/accounting-period/:id` | NEW | `13523:69659` (Year) / `13523:70227` (Q/M intermediate) / `13523:70433` (Q/M edited) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |

### 5.2 Components new/modified

> **Reuse pattern column** — priority `customs/` > `share/` > `ui/`. Author scan `.claude/references/web-component-registry.yaml` (§G.X manual scan).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `AccountingPeriodDetailPage` | `src/features/inventory/accounting-period/pages/AccountingPeriodDetailPage.tsx` | NEW | — | fetch state | **Build-new** — justification: top-level page container, không có match tại customs/share/ui sau scan registry | AC-1, AC-2, AC-3, AC-6 |
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, backLink, primaryCta }` | — | **Priority 2 — share/** (`page-header` registry key → `share/layouts/page-header`) | AC-1 |
| `BackLink` (icon button) | `src/components/share/buttons/button.tsx` | REUSE | `variant="ghost" size="icon"`, icon ArrowLeft | — | **Priority 2 — share/** (`icon-button` registry key → `share/buttons/button`) | AC-1, AC-5 |
| `EditCTA` | `src/components/share/buttons/button.tsx` | REUSE | `variant="outline"`, leadingIcon Edit2 | — | **Priority 2 — share/** (`primary-button` registry key → `share/buttons/button`) | AC-4 |
| `ThongTinChungSection` | `src/components/share/containers/section.tsx` | REUSE | `{ title: "Thông tin chung" }` | — | **Priority 2 — share/** (`section-block` registry key → `share/containers/section`) | AC-2 |
| `AccountingPeriodFieldGrid` | `src/features/inventory/accounting-period/components/AccountingPeriodFieldGrid.tsx` | NEW | `{ period: AccountingPeriodDetail }` | — | **Build-new (wraps Priority 2 — share/displays/description-item)** — justification: 3×4 grid layout wrapper với logic biến thể theo `type`; không có component grid-detail sẵn tại customs/share/ui sau scan | AC-2, AC-3 |
| `InforItem` (12 cells) | `src/components/share/displays/description-item.tsx` | REUSE | `{ label, value, emptyPlaceholder: '—' }` | — | **Priority 2 — share/** (`description-item` registry key → `share/displays/description-item`) | AC-2, AC-3 |

### 5.3 Design tokens & Figma refs

> Design tokens PHẢI khớp tokens detect ở bundle §G.Y (`bg-brand`, `text-foreground`, `text-muted-foreground`) + full Design Token Map trực tiếp từ `wave04-ap-detail.md §2` (anti-hallucination guard — reviewer item #21).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-background` | `tailwind.config.js` | Page + section background (`#ffffff`) | AC-1, AC-2 |
| `text-foreground` | tokens | PageTitle + InforItem value text (`#18181b`) | AC-1, AC-2, AC-3 |
| `text-muted-foreground` | tokens | InforItem label text (`#71717a`) | AC-2, AC-3 |
| `border-input` | tokens | EditCTA outline border (`#d4d4d8`) | AC-4 |
| `bg-brand` | tokens | Navbar (shared shell component, không thuộc scope NEW của FEAT này) | (shell) |
| `text-2xl` / `font-semibold` | tokens | PageTitle size 24 / weight 600 | AC-1 |
| `text-base` / `font-semibold` | tokens | SectionTitle "Thông tin chung" size 16 / weight 600 | AC-2 |
| `text-sm` / `font-normal` | tokens | InforItem label + value size 14 / weight 400 | AC-2, AC-3 |
| `h-9` / `font-medium` | tokens | EditCTA button height 36 / weight 500 | AC-4 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave04-ap-detail.md` §1 Layout DSL + §2 Design Token Map + §3 State Table. PNG canonical: `13523-69659.png` (Year) + `13523-70433.png` (Q/M edited, cũng cover Frame 2 empty-audit theo `_empty_render` note).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `getAccountingPeriod` | query | `src/api/graphql/getAccountingPeriod.graphql` | `['accountingPeriod', id]` | `AccountingPeriodDetailFragment` | AC-1, AC-2, AC-3 |

> Op `getAccountingPeriod(id: ID!): AccountingPeriodDetail!` phải tồn tại ở paired BFF FEAT `features/bff/FEAT-AP-DETAIL.md §6.1` (reviewer item #16 enforce). Field selection: `id code name type parentId parentName parentBreadcrumb { id name type } startDate endDate status displayOrder description createdAt createdBy createdByName updatedAt updatedBy updatedByName`.

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — mọi data qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (detail) | TanStack Query | — | `['accountingPeriod', id]` | AC-1, AC-2, AC-3 |
| Route param | TanStack Router | — | `:id` | AC-1 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/accounting-period/:id` | `AccountingPeriodDetailPage` | `loader({ params }) => prefetch getAccountingPeriod(params.id)` | RBAC: `garage-owner \| accountant` + flag `Inventory:InventoryV2` | AC-1, AC-6 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (Critical Rule #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory/accounting-period/pages/` | `AccountingPeriodDetailPage.tsx` | NEW | wraps share/layouts/page-header + share/containers/section | ~130 | AC-1, AC-2, AC-3, AC-6 |
| `src/features/inventory/accounting-period/components/` | `AccountingPeriodFieldGrid.tsx` | NEW | wraps share/displays/description-item × 12 | ~90 | AC-2, AC-3 |
| `src/features/inventory/accounting-period/hooks/` | `useAccountingPeriodDetail.ts` | NEW | TanStack Query wrapper | ~35 | AC-1 |
| `src/features/inventory/accounting-period/types/` | `accounting-period.types.ts` | NEW (hoặc MODIFY nếu `FEAT-AP-LIST`/`FEAT-AP-CREATE` đã tạo trước) | TypeScript types | ~30 | — |
| `src/api/graphql/` | `getAccountingPeriod.graphql` | NEW | persisted query | ~15 | AC-1, AC-2, AC-3 |
| `src/api/generated/` | `getAccountingPeriod.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | route entry `inventory/accounting-period/$id` | MODIFY (add) | TanStack Router file-based route | ~15 | AC-1, AC-6 |
| `tests/features/inventory/accounting-period/` | `AccountingPeriodDetailPage.test.tsx` | NEW | Vitest + RTL | ~140 | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver stable — getAccountingPeriod confirmed §3e ratified)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma wave04-ap-detail.md ACTIVE
    Exit: E2E happy path green (list → detail → edit-nav / back-nav)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Page + FieldGrid + routing + state | features + routes | BFF S5 SDL stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> BE tier là primary enforcement. FE chỉ: display + RBAC render.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-CMN-001` | NORMAL | Render đủ 4 field audit, label visible khi rỗng | `AccountingPeriodFieldGrid.tsx` | AC-3 | Display only — data từ BE |
| `BR-AP-CMN-002` | CORNERSTONE | Route guard 2-role ngang quyền, không ẩn field theo role | `AccountingPeriodDetailPage.tsx` (route `beforeLoad`) | AC-6 | Auth context/hook hiện tại |
| `BR-AP-010` | NORMAL | Hiển thị đúng label "Chưa đóng"/"Đã đóng" tại field Trạng thái | `AccountingPeriodFieldGrid.tsx` | AC-2 | Sửa trạng thái ở `FEAT-AP-EDIT`, không phải DETAIL |

> **Primary enforcement** = BE tier (`features/be/FEAT-AP-DETAIL.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (loading → success → 404 empty-state) | test-ui | verify header title interpolation theo loại kỳ |
| AC-2 | UI (field grid biến thể Year vs Q/M) | test-ui | verify Thuộc kỳ chỉ hiện với Q/M |
| AC-3 | UI (audit field empty state) | test-ui | verify label visible + value "—" khi chưa từng sửa |
| AC-4 | UI (navigation) | test-ui | click Chỉnh sửa → route `/inventory/accounting-period/edit/{id}` |
| AC-5 | UI (navigation) | test-ui | click back-arrow → route `/inventory/accounting-period` |
| AC-6 | UI (RBAC route guard) | test-ui + test-isolation | dual persona mock cả 2 role access OK |
| (smoke) | E2E happy path | test-e2e | Playwright: mở list → click Xem → verify field grid → click Chỉnh sửa → verify route |

## 11. i18n & a11y

### 11.1 i18n keys

NEED CONFIRMATION — xác nhận với BA/PO về W04 i18n policy (fixed VN labels vs i18next). Hiện `i18n_keys: []` theo pattern fixed VN labels đã dùng ở W03.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` tiêu đề trang; back-arrow `aria-label="Quay lại danh sách kỳ kế toán"` | semantic header |
| AC-2 | InforItem label + value đọc theo cặp; không dùng table markup | screen reader order |
| AC-3 | Label "Ngày sửa"/"Người sửa" vẫn present trong DOM khi value rỗng (không `display:none`) | empty-state a11y |
| AC-4 | EditCTA text label visible → accessible name tự nhiên | button a11y |
| AC-6 | Route guard redirect có thông báo rõ ràng khi unauthorized | route a11y |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-DETAIL.md` | PENDING (chưa authored tại thời điểm spawn này) | BR primary enforcement; V4-AP-3 `GET /protected/accounting/v1/accounting-periods/{id}` contract |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-DETAIL.md` | PENDING (chưa authored tại thời điểm spawn này) | GraphQL op `getAccountingPeriod` authoritative shape §6.1 |
| Mobile | — | N/A (mobile out-of-scope) | `FEAT-AP-DETAIL` thuộc nhóm 5 AP web-only per PKG-W04 §2.3 (không gán Figma mobile) |

**Source ID consistency** (item 18): `source_feat_sha` = `6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4` phải identical với BE/BFF files khi được author.

## 13. References

- **Source**: [`Product/features/FEAT-AP-DETAIL.md`](../../../../../Product/features/FEAT-AP-DETAIL.md) v5
- **Paired BE**: [`features/be/FEAT-AP-DETAIL.md`](../be/FEAT-AP-DETAIL.md) (pending)
- **Paired BFF**: [`features/bff/FEAT-AP-DETAIL.md`](../bff/FEAT-AP-DETAIL.md) (pending)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md)
- **Figma spec (web)**: [`Product/ux/figma-web/wave04-ap-detail.md`](../../../../../Product/ux/figma-web/wave04-ap-detail.md)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **ADR-019**: Accounting Period on `gf-accounting` boundary
- **BR file**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.3 BR-AP-CMN-001/002, §2.1 BR-AP-010
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **API doc (GraphQL)**: `Architecture/api/agg-garage-graph-graphql.md` §3e Accounting Period — `getAccountingPeriod`

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-AP-DETAIL` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier hint), §2 trách nhiệm FE Web, §3 FE behaviour map 6/6 AC-ID, §4 visual fidelity (Figma SSOT §wave04-ap-detail.md) + state + i18n + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (field grid biến thể Year/Q-M, GraphQL `getAccountingPeriod`, reuse-first component mapping từ web-component-registry.yaml). §G.X KG parse error → scan registry manual. NEED CONFIRMATION: (1) fanout_map_sha; (2) template_sha; (3) W04 i18n policy (fixed VN vs i18next). Mobile out-of-scope (PKG-W04 §2.3). BE/BFF paired tier files chưa authored tại thời điểm spawn — status PENDING. |
