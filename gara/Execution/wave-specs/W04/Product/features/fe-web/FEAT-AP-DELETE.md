---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-AP-DELETE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-DELETE"
source_feat_sha: "7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422"
source_feat_version: 4
generated_at: "2026-07-08T05:20:00+00:00"
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
consumes_backend_feats: ["FEAT-AP-DELETE"]
consumes_bff_feats: ["FEAT-AP-DELETE"]
i18n_keys: []
screens_touched:
  - "src/features/inventory-accounting-period/components/accounting-period-delete-dialog.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ap-delete.md (node 14492:89258 — Xóa kỳ kế toán: confirm dialog 13523:70734 + blocked dialog 13523:70836)"
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A (sha256 tool unavailable trong authoring session này — orchestrator backfill ở lần preflight kế tiếp)"
  template_sha: "N/A (sha256 tool unavailable trong authoring session này — orchestrator backfill ở lần preflight kế tiếp)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-DELETE.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
  kg_baseline_sha: "dbbc30b5b3547e6c117b2ebbefc200157de88044796b8476bf83d100c19e20fc"
paired_backend_feats: ["FEAT-AP-DELETE"]
paired_bff_feats: ["FEAT-AP-DELETE"]
paired_mobile_feats: []
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-DELETE (FE Web): Xóa kỳ kế toán

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma spec: [`Product/ux/figma-web/wave04-ap-delete.md`](../../../../../Product/ux/figma-web/wave04-ap-delete.md) — 2 dialog (confirm + blocked). PKG-W04 + `agg-garage-graph-graphql.md §3e.6` là arbiter khi có discrepancy. Cross-tier coordination ở §12.
> **i18n KHÔNG dùng** — toàn bộ label render fixed tiếng Việt inline verbatim theo Figma (xem §4.3).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DELETE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `accounting-period-delete-dialog.tsx` (2 variant embedded trong màn `/inventory/accounting-periods`, tab "Kỳ kế toán", owned bởi `FEAT-AP-LIST`) |
| Cross-tier consume | BE: `FEAT-AP-DELETE` (`gf-accounting`) \| BFF: `FEAT-AP-DELETE` (`agg-garage-graph`, mutation `deleteAccountingPeriod`) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-DELETE.md`](../../../../../Product/features/FEAT-AP-DELETE.md) |
| Source version | v4 |
| Source SHA | `7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422` |
| Generated at | 2026-07-08T05:20:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần xóa một kỳ kế toán tạo nhầm hoặc không còn dùng để danh mục kỳ (Năm→Quý→Tháng) gọn gàng, chính xác. Vì kỳ kế toán là mốc khóa sổ kho quan trọng (kiểm soát đóng/mở kỳ, tính giá xuất kho, báo cáo NXT), hệ thống bắt buộc ngăn xóa những kỳ đã đóng, đã phát sinh dữ liệu kho liên quan, hoặc còn kỳ con — tránh phá vỡ tính toàn vẹn dữ liệu tồn kho. Tính năng nằm trong nhóm `FEAT-AP-*` thuộc màn "Kỳ kế toán" (tab cùng khu vực Danh mục sản phẩm/Nhóm vật tư).

## 2. Trách nhiệm FE Web (garage-web)

> Tier-specific — focus: dialog trigger, state UI, component, i18n, a11y, RBAC render. KHÔNG mô tả schema DB hay GraphQL SDL chi tiết (xem §6).

- Render 2 dialog biến thể (`AccountingPeriodDeleteDialog`) gắn vào icon **Xóa** ở cột Thao tác của bảng kỳ kế toán (`/inventory/accounting-periods`, tab "Kỳ kế toán", owned bởi `FEAT-AP-LIST`): `confirm` (xác nhận xóa) và `blocked` (`blocked_closed` / `blocked_has_children`) — không có route riêng, không rời màn hiện tại.
- User flow chính: click icon Xóa trên 1 row → FE tự đánh giá client-side (từ dữ liệu row đã có: `status`, `children.length`) để chọn variant mở lên ngay → user xác nhận hoặc hủy → khi confirm gọi mutation → thành công cập nhật lại danh sách, thất bại (re-check server-side) chuyển dialog sang variant blocked tương ứng tại chỗ (EC-1).
- State machine UI: `idle` (dialog đóng) → `open` (confirm/blocked hiển thị) → `submitting` (nút "Xoá" loading/disabled trong confirm dialog) → `success` (toast + đóng dialog + refetch list) / `error` (toast lỗi chung, hoặc swap sang blocked dialog nếu lỗi là guard-violation EC-1).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Reuse foundation từ layer cao nhất có component fit (bundle §G.X liệt kê inventory). Chỉ build-new khi cả 3 layer không match — entry phải có justification.
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration, screenshot manifest đều theo `wave04-ap-delete.md` (frontmatter `figma_refs:`). §2/§4/§5 references cross-ref figma sections. KHÔNG suy luận visual từ AC/BR text đơn thuần.
- GraphQL op consume từ BFF `agg-garage-graph`: mutation `deleteAccountingPeriod(id: ID!): Boolean!` (module `accounting-period`, ratified `agg-garage-graph-graphql.md §3e.6`).
- RBAC render: cả `garage-owner` và `accountant` xóa ngang quyền (AC-6) — icon Xóa hiển thị như nhau cho 2 persona, KHÔNG có gate theo role riêng; chỉ gate chung theo feature flag `Inventory:InventoryV2` (đã enforce ở route-level của `FEAT-AP-LIST`, không lặp lại ở đây).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage gate: 6/6 source AC-IDs cover ở dưới.

### Cluster A — Trigger + confirm delete

#### AC-1 → Render confirm dialog khi row đủ điều kiện xóa

- **Khi**: user click icon Xóa trên 1 row của bảng kỳ kế toán mà `row.status === 'OPEN'` (hiển thị "Chưa đóng") và `row.children.length === 0` (client chỉ đánh giá được 2 trong 3 guard — xem NEED CONFIRMATION note ở §6.1).
- **FE phải**: derive `dialogVariant = 'confirm'`, mở `AccountingPeriodDeleteDialog` với title-as-question interpolate `Bạn có chắc chắn muốn xóa kỳ kế toán {row.name} không?` + hint body verbatim "Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan." + 2 nút Hủy/Xoá.
- **State transition**: `idle` → `open(confirm)`.
- **Component**: `share/dialogs/alert-confirm` (REUSE).
- **Ref**: figma spec `wave04-ap-delete.md` §Screen "Confirm delete" (node `13523:70734`).

#### AC-2 → Thực hiện xóa

- **Khi**: user click nút "Xoá" (destructive) trong confirm dialog.
- **FE phải**: set `submitting=true` (nút "Xoá" loading/disabled) → gọi mutation `deleteAccountingPeriod(id: row.id)` → **success**: đóng dialog, hiện toast success "Đã xóa kỳ {row.name}", invalidate/refetch query tree kỳ kế toán (owned bởi `FEAT-AP-LIST` — `['accounting-period-tree', filters]`) → **error guard-violation** (`ERR-INV-025` hoặc `ERR-INV-026` — xem §4.6): KHÔNG đóng dialog, swap `dialogVariant` sang `blocked_closed` hoặc `blocked_has_children` tương ứng in-place (EC-1 re-check tại thời điểm xóa) → **error not-found** (`ERR-CMN-not-found`): đóng dialog, toast lỗi "Kỳ kế toán không còn tồn tại", refetch list (row đã bị xóa ở phiên khác) → **error khác**: toast lỗi chung, giữ dialog confirm mở lại (không mất context).
- **State transition**: `open(confirm)` → `submitting` → `success` (close) hoặc `error` (swap variant hoặc toast).
- **GraphQL op**: mutation `deleteAccountingPeriod` (§6.1).
- **Ref**: figma §3 State Table row `success_toast` / `error_toast`.

#### AC-3 → Hủy xóa

- **Khi**: user click nút "Hủy" trong confirm dialog.
- **FE phải**: đóng dialog ngay, KHÔNG gọi mutation, KHÔNG thay đổi danh sách.
- **State transition**: `open(confirm)` → `idle`.
- **Component**: `AlertDialogCancel` (trong `share/dialogs/alert-confirm`).
- **Ghi chú**: figma dialog KHÔNG có icon đóng "✕" riêng (shadcn `AlertDialog` mặc định omit `showCloseButton`) — nút "Hủy" đảm nhiệm toàn bộ AC-3 (coverage gap đã ghi nhận ở figma frontmatter).

### Cluster B — Blocked dialogs

#### AC-4 → Render blocked dialog khi đã đóng hoặc đã phát sinh dữ liệu kho

- **Khi**: (a) client-side: user click icon Xóa trên row có `row.status === 'CLOSED'` (hiển thị "Đã đóng"), **HOẶC** (b) server-side re-check tại AC-2: mutation trả lỗi `ERR-INV-025` (bao gồm cả case "đã phát sinh dữ liệu kho liên quan" mà FE không thể biết trước khi gọi API — xem §6.1 NEED CONFIRMATION).
- **FE phải**: hiện `dialogVariant='blocked_closed'` — title "Không thể xóa" + body verbatim "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa." + chỉ 1 nút "Đóng".
- **Component**: `share/dialogs/alert-dialog` (REUSE).
- **Ref**: figma §Screen "Blocked 'Không thể xóa'" (node `13523:70836`).

#### AC-5 → Render blocked dialog khi còn kỳ con

- **Khi**: (a) client-side: user click icon Xóa trên row có `row.children.length > 0`, **HOẶC** (b) server-side re-check tại AC-2: mutation trả lỗi `ERR-INV-026` (race condition — kỳ con vừa được tạo ở phiên khác giữa lúc mở list và lúc confirm).
- **FE phải**: hiện `dialogVariant='blocked_has_children'` — title "Không thể xóa" + body riêng + chỉ 1 nút "Đóng".
- **NEED CONFIRMATION**: figma chưa có frame riêng cho variant này. Body DRAFT theo figma `§1 Layout DSL` `content_blocked_has_children`: **"Kỳ kế toán còn kỳ con. Vui lòng xóa các kỳ con trước khi xóa kỳ cha."** — BA phải confirm wording chính xác trước khi bump status ACTIVE; designer cần bổ sung Figma frame tương ứng.
- **Component**: `share/dialogs/alert-dialog` (REUSE — cùng component với AC-4, chỉ khác nội dung `description` prop).
- **Ref**: figma coverage_gaps entry AC-5.

### Cluster C — Phân quyền

#### AC-6 → Phân quyền xóa

- **Khi**: `garage-owner` hoặc `accountant` truy cập bảng kỳ kế toán.
- **FE phải**: hiển thị icon Xóa giống hệt nhau cho cả 2 persona — KHÔNG có conditional render theo role trong feature này (khác với các flow có RBAC differentiate rõ như insurance). Primary enforcement RBAC (nếu có ở tầng khác) nằm ở BE (`features/be/FEAT-AP-DELETE.md §9`) — FE chỉ đảm bảo không vô tình ẩn nút theo persona.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave04-ap-delete.md` §1 Layout DSL + §2 Design Token Map. KHÔNG re-invent layout/spacing/color.
- Backdrop overlay dùng LIGHT variant `bg-black/10` (Figma `overlay/90` #0000001a) — **KHÁC** shadcn `AlertDialog` default 80% dim (`bg-black/80`). Cần override className explicit trên `AlertDialogOverlay`.
- Dialog width 441px (trong giới hạn `max-w-lg` 512px shadcn default) — dùng `className="max-w-[441px]"` hoặc token tương đương, KHÔNG dùng default full `max-w-lg`.
- Nút "Xoá" destructive dùng `variant="destructive"` (`bg-destructive` #dc2626), KHÔNG dùng brand/primary màu xanh — xem Anti-Pattern Trap `AP-AP-DEL-2`.
- KHÔNG render icon `×` close top-right (`showCloseButton={false}`) — xem Anti-Pattern Trap `AP-AP-DEL-1`.
- Label nút "Xoá" dùng dấu huyền ("Xoá"), body prose dùng dấu sắc ("xóa") — orthographic convention Figma (`AP-AP-DEL-8`) — verbatim, KHÔNG tự sửa chính tả.
- Title-as-question pattern: câu hỏi CHÍNH LÀ title (KHÔNG có header "Xóa Kỳ kế toán" riêng phía trên) — xem Anti-Pattern Trap `AP-AP-DEL-3`.

### 4.2 State machine + error handling

- State transition tường minh: `idle | open(confirm) | open(blocked_closed) | open(blocked_has_children) | submitting | success | error`.
- `submitting`: nút "Xoá" hiện spinner inline + disabled cả 2 nút trong confirm dialog (tránh double-submit).
- `success`: toast success + đóng dialog + refetch list.
- `error` guard-violation (`ERR-INV-025`/`ERR-INV-026`): swap variant dialog tại chỗ (KHÔNG đóng rồi mở lại — tránh flicker), KHÔNG toast trùng lặp (dialog blocked tự thông báo).
- `error` khác (`ERR-CMN-not-found`, network, 5xx): toast error, xử lý riêng theo mã lỗi §4.6.
- KHÔNG silent fail — mọi nhánh lỗi phải reach UI (dialog swap hoặc toast).

### 4.3 i18n + a11y

- **i18n KHÔNG dùng** cho feature này — toàn bộ label ("Bạn có chắc chắn muốn xóa kỳ kế toán...", "Chỉ xóa được kỳ chưa đóng...", "Hủy", "Xoá", "Không thể xóa", "Đóng") hardcode tiếng Việt inline verbatim theo Figma. `i18n_keys: []` frontmatter — override single-locale (VN only), đồng bộ pattern các dialog W02/W04 khác trong repo (không dùng i18next cho batch DESIGN này).
- a11y: dialog root dùng `role="alertdialog"` (Radix `AlertDialog` mặc định). Auto-focus vào nút an toàn (Hủy/Đóng) khi dialog mở. Keyboard: `Tab` cycle giữa 2 nút trong confirm; `Escape` = tương đương click Hủy/Đóng (đóng dialog, không side-effect). Nút "Xoá" có `aria-busy="true"` khi `submitting`.
- Semantic HTML — dialog dùng `<button>` cho mọi action, KHÔNG `<div onClick>`.

### 4.4 RBAC render + feature flag

- KHÔNG có feature flag riêng cho delete — thừa kế `@FeatureOn('Inventory:InventoryV2')` gate ở route `/inventory/accounting-periods` (owned bởi `FEAT-AP-LIST`).
- Persona check: KHÔNG conditional render theo role (`garage-owner`/`accountant` ngang quyền per AC-6) — nút Xóa luôn hiển thị cho cả 2 nếu route accessible.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-AP-DELETE.md §9`). FE chỉ UI hint:
  - Client-side pre-check (đủ khả năng: `status` + `children.length`) trước khi mở confirm dialog — tránh mở nhầm confirm cho case chắc chắn không xóa được.
  - Server error code (`ERR-INV-025`/`ERR-INV-026`) → swap dialog variant tại chỗ (không phải toast) vì đã có sẵn "Không thể xóa" component pattern.
  - KHÔNG disable icon Xóa trước khi click (theo Figma — không có disabled-state row action variant trong scope này; check luôn diễn ra sau click, thể hiện qua dialog variant).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-025` | DIALOG_SWAP (in-place, không toast) | `AccountingPeriodDeleteDialog` variant `blocked_closed` | AC-2 → AC-4 |
| `ERR-INV-026` | DIALOG_SWAP (in-place, không toast) | `AccountingPeriodDeleteDialog` variant `blocked_has_children` | AC-2 → AC-5 |
| `ERR-CMN-not-found` | TOAST | `share/toasts/toast` (đóng dialog trước) | AC-2 |
| `UNAUTHENTICATED_ERROR` / `FORBIDDEN_ERROR` | TOAST (app-wide auth handler) | `share/toasts/toast` | AC-2 (defensive) |
| `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` / `UNKNOWN_ERROR` / `INTERNAL_ERROR` | TOAST | `share/toasts/toast`, giữ dialog confirm mở lại | AC-2 (fallback) |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `AccountingPeriodListPage` (owned bởi `FEAT-AP-LIST`) | `/inventory/accounting-periods` | MODIFY (wire icon Xóa → mở `AccountingPeriodDeleteDialog`) | `14492:89258` | AC-1, AC-4, AC-5, AC-6 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Bundle §G.X báo KG parse error — author scan `.claude/references/web-component-registry.yaml` (CANONICAL source thay KG cho UI work per CLAUDE.md §2 item #12) làm inventory.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `share/dialogs/alert-confirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `title`, `description`, `confirmLabel="Xoá"`, `cancelLabel="Hủy"`, `variant="destructive"`, `onConfirm`, `onCancel`, `isLoading` | `submitting` | **Priority 2 — share/** (registry: "Hỏi xác nhận hành động nguy hiểm (delete, cancel, hủy)" — khớp chính xác AC-1/2/3, không cần customs domain-specific) | AC-1, AC-2, AC-3 |
| `share/dialogs/alert-dialog` | `src/components/share/dialogs/alert-dialog.tsx` | REUSE | `title="Không thể xóa"`, `description` (theo variant), `dismissLabel="Đóng"`, `onDismiss` | — | **Priority 2 — share/** (registry: "Alert modal — variant warning/error/info với close action" — khớp AC-4/AC-5 single-button blocked notice) | AC-4, AC-5 |
| `AccountingPeriodDeleteDialog` (kebab-case: `accounting-period-delete-dialog.tsx`) | `src/features/inventory-accounting-period/components/accounting-period-delete-dialog.tsx` | NEW | `{ open, row, onOpenChange }` | `variant` (derived + server-swap), `submitting` | **Build-new** — justification: cần compose logic derive `variant` (client-side từ `row.status`/`row.children`, server-side swap từ error code) + wrap 2 layer component share/ theo variant — không có compound component sẵn nào ở customs/share/ui làm việc derive-and-swap này | AC-1, AC-2, AC-3, AC-4, AC-5 |
| `share/buttons/button` (icon trigger "Xóa" trong cột Thao tác, owned bởi `FEAT-AP-LIST`) | `src/components/share/buttons/button.tsx` | REUSE | `variant="ghost"`, `size="icon"`, `aria-label="Xóa kỳ kế toán"` | — | **Priority 2 — share/** (registry lookup `icon-button` → `share/buttons/button`) | AC-1 |
| `share/toasts/toast` | `src/components/share/toasts/toast.tsx` | REUSE | `variant="success"|"error"`, `message` | — | **Priority 2 — share/** (registry `toast-notification`) | AC-2 |

### 5.3 Design tokens & Figma refs

> Design tokens lấy trực tiếp từ `wave04-ap-delete.md §2 Design Token Map` (cùng nguồn với bundle §G.Y "Design tokens referenced": `bg-brand`, `bg-destructive`, `text-foreground`, `text-muted-foreground`) — không hallucinate token ngoài spec.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-destructive` (#dc2626) | figma §2 `base/destructive` | Nút "Xoá" destructive | AC-2 |
| `text-destructive-foreground` (#fef2f2) | figma §2 | Text nút "Xoá" | AC-2 |
| `bg-secondary` (#f4f4f5) | figma §2 `base/secondary` | Nút "Hủy"/"Đóng" | AC-3, AC-4, AC-5 |
| `text-foreground` (#18181b) | figma §2 `base/foreground` | `DialogTitle` | AC-1, AC-4, AC-5 |
| `text-muted-foreground` (#71717a) | figma §2 `base/muted-foreground` | `DialogBody`/hint | AC-1, AC-4, AC-5 |
| `bg-background` (#ffffff) | figma §2 `base/background` | Dialog card nền | (visual) |
| `bg-black/10` (backdrop, không phải shadcn default `bg-black/80`) | figma §2 `overlay/90` #0000001a | Backdrop overlay LIGHT — navbar vẫn visible bên dưới | AC-1, AC-4, AC-5 |
| `bg-brand` | bundle §G.Y detected (navbar bối cảnh, không phải token của dialog) | Navbar background hiển thị xuyên qua overlay light — contextual, KHÔNG phải style của `AccountingPeriodDeleteDialog` component | (context) |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo `wave04-ap-delete.md`. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `deleteAccountingPeriod(id: ID!): Boolean!` | mutation | `src/api/graphql/delete-accounting-period.graphql` | — (invalidates `['accounting-period-tree', filters]` owned bởi `FEAT-AP-LIST`) | — | AC-2, AC-4, AC-5 |

> Op ratified ở `Architecture/api/agg-garage-graph-graphql.md §3e.6` (module `accounting-period`, Op ID `AP-M3`). Idempotent — gọi 2 lần cùng `id` → lần 2 trả `ERR-CMN-not-found`.
>
> **NEED CONFIRMATION / kiến trúc correction**: figma spec `wave04-ap-delete.md §5 Field Composition Schema` giả định có 1 "pre-check API `GetPeriodDeletionEligibility`" trả `{canDelete, reason}` để derive `variant` prop trước khi mở dialog. **Op này KHÔNG tồn tại** trong contract đã ratify (`agg-garage-graph-graphql.md §3e` chỉ có 6 ops: `searchAccountingPeriodTree`/`getAccountingPeriod`/`checkAccountingPeriodLock`/`createAccountingPeriod`/`updateAccountingPeriod`/`deleteAccountingPeriod` — không có eligibility query riêng). Spec này thay bằng approach grounded theo SDL thật:
> 1. **Client-side pre-check** (tại click icon Xóa, dùng dữ liệu row đã có từ `AccountingPeriodTreeNode` — owned `FEAT-AP-LIST` query `searchAccountingPeriodTree`): `status` (OPEN/CLOSED) + `children.length` — đủ cho AC-1 (confirm) / AC-4 nhánh "đã đóng" / AC-5.
> 2. **`hasWarehouseData` (đã phát sinh dữ liệu kho liên quan) KHÔNG có field tương ứng** trong `AccountingPeriodTreeNode` hoặc `AccountingPeriod` SDL — client KHÔNG thể biết trước khi gọi mutation. Trường hợp này chỉ lộ ra ở **server-side re-check tại AC-2** qua error code `ERR-INV-025` (guard 3 downstream-enforced per `agg-garage-graph-graphql.md §3e.6` note "guard 3 delegated to downstream Receipt/Delivery/OB/PRC backends") — FE xử lý bằng dialog swap (§4.6), khớp đúng semantic EC-1 "hệ thống kiểm tra lại tại thời điểm xóa".

### 6.2 REST endpoints consumed direct (bypass BFF)

_(không có — mọi call qua GraphQL BFF)._

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Delete mutation | TanStack Query `useMutation` | — | `deleteAccountingPeriod` | AC-2 |
| Dialog open/variant/selected row | React local state (`useState`) trong `AccountingPeriodDeleteDialog` wrapper | local | — | AC-1, AC-3, AC-4, AC-5 |
| List invalidate on success | TanStack Query `queryClient.invalidateQueries` | — | `['accounting-period-tree', filters]` (owned `FEAT-AP-LIST`) | AC-2 |

### 6.4 Routing

_(không có route mới — dialog nhúng trong route `/inventory/accounting-periods` owned bởi `FEAT-AP-LIST`)._

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-accounting-period/components/` | `accounting-period-delete-dialog.tsx` | NEW | compose `share/dialogs/alert-confirm` + `share/dialogs/alert-dialog` | ~120 | AC-1-AC-5 |
| `src/features/inventory-accounting-period/hooks/` | `use-delete-accounting-period.ts` | NEW | TanStack mutation wrapper | ~35 | AC-2 |
| `src/features/inventory-accounting-period/utils/` | `accounting-period-delete-eligibility.ts` | NEW | derive `dialogVariant` client-side từ `row.status`/`row.children` | ~25 | AC-1, AC-4, AC-5 |
| `src/features/inventory-accounting-period/components/` (owned `FEAT-AP-LIST`) | `accounting-period-list-row-actions.tsx` | MODIFY (wire icon Xóa `onClick`) | — | ~15 | AC-1 |
| `src/api/graphql/` | `delete-accounting-period.graphql` | ADDITIVE | persisted query | ~8 | AC-2 |
| `src/api/generated/` | `delete-accounting-period.generated.ts` | AUTO-GEN | codegen | — | — |
| `tests/` | `tests/features/inventory-accounting-period/accounting-period-delete-dialog.test.tsx` | NEW | Vitest + RTL | ~150 | AC-1-AC-6 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (`deleteAccountingPeriod` mutation stable — đã ratify `§3e.6`). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + resolver stable — accounting-period module §3e đã ratify)

S6  UI wire (web)
    Entry: BFF S5 SDL stable (deleteAccountingPeriod) + Figma confirmed (blocked_has_children variant PENDING BA — xem AC-5)
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Dialog wrapper + eligibility derive + mutation wiring | features + api/graphql | BFF S5 stable | E2E smoke green | BFF S5, `FEAT-AP-LIST` row action file |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ: client-side pre-check hint, RBAC-driven render, error code → dialog-swap/toast mapping.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-013` | CORNERSTONE | client pre-check ẩn confirm khi `status=CLOSED`; server error `ERR-INV-025` (bao gồm case "đã phát sinh dữ liệu kho") → dialog swap `blocked_closed` | `utils/accounting-period-delete-eligibility.ts` + `components/accounting-period-delete-dialog.tsx` | AC-4 | BE final enforce (guard 1+3, guard 3 downstream-delegated) |
| `BR-AP-014` | CORNERSTONE | client pre-check ẩn confirm khi `children.length > 0`; server error `ERR-INV-026` (race condition) → dialog swap `blocked_has_children` | same files | AC-5 | BE final enforce (guard 2, recursive CTE) |
| `BR-OB-002` | CORNERSTONE | → N/A (FE) | — | — | Gián tiếp: OB liên hệ kỳ qua "Tồn đến ngày" — enforce hoàn toàn ở BE guard 3 (`gf-accounting` DELETE endpoint), không có UI hint riêng trên FE ngoài `ERR-INV-025` đã cover ở BR-AP-013 |

> **Primary enforcement** = BE tier (`features/be/FEAT-AP-DELETE.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | render confirm dialog khi row eligible (status OPEN, no children) |
| AC-2 | UI | test-ui | happy path xóa: submitting state → toast success → list refetch |
| AC-2 (negative — EC-1) | UI | test-ui | mutation trả `ERR-INV-025`/`ERR-INV-026` → dialog swap in-place, không đóng |
| AC-3 | UI | test-ui | click Hủy → đóng dialog, không gọi mutation |
| AC-4 | UI (negative) | test-ui | row status CLOSED → blocked_closed dialog trực tiếp (không qua confirm) |
| AC-5 | UI (negative) | test-ui | row có children → blocked_has_children dialog trực tiếp; NEED CONFIRMATION wording — test dùng draft text, cập nhật khi BA confirm |
| AC-6 | UI (RBAC parity) | test-ui + test-isolation | dual persona `garage-owner` + `accountant` — icon Xóa hiển thị giống nhau |
| (smoke) | E2E happy path | test-e2e | Playwright: click Xóa → confirm → toast → row biến mất khỏi list |

## 11. i18n & a11y

### 11.1 i18n keys

_(không có — override single-locale, xem §4.3. Toàn bộ label hardcode tiếng Việt inline verbatim theo Figma.)_

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `role="alertdialog"`, auto-focus nút "Hủy" khi mở | Radix `AlertDialog` default |
| AC-2 | Nút "Xoá" có `aria-busy="true"` khi `submitting` | ngăn double-submit qua screen reader announce |
| AC-3 | `Escape` key tương đương click "Hủy" | keyboard nav |
| AC-4, AC-5 | Auto-focus nút "Đóng"; `aria-live="polite"` announce title "Không thể xóa" khi dialog mở | screen reader |
| AC-2 (toast) | Toast có `role="status"` (success) / `role="alert"` (error) | announce không chặn focus |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-DELETE.md` | DRAFT (pending) | BR-AP-013/014 primary enforcement, contract source (`DELETE /api/v2/accounting-periods/{id}`) |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-DELETE.md` | DRAFT (pending) | Mutation `deleteAccountingPeriod` consumed §6.1; SDL ratify `agg-garage-graph-graphql.md §3e` |
| Mobile | N/A this wave | — | AP ops "Web GMS only" per `agg-garage-graph-graphql.md §3e.4` + `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD` line 31 — không có mobile touch cho `FEAT-AP-DELETE` |

**Source ID consistency** (item 18): `source_feat_sha` = `7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422` — phải identical với BE/BFF files khi author.

## 13. References

- **Source**: [`Product/features/FEAT-AP-DELETE.md`](../../../../../Product/features/FEAT-AP-DELETE.md) v4
- **Paired BE**: [`features/be/FEAT-AP-DELETE.md`](../be/FEAT-AP-DELETE.md)
- **Paired BFF**: [`features/bff/FEAT-AP-DELETE.md`](../bff/FEAT-AP-DELETE.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3, EC-6
- **Figma spec**: [`Product/ux/figma-web/wave04-ap-delete.md`](../../../../../Product/ux/figma-web/wave04-ap-delete.md)
- **GraphQL contract**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3e.6 (mutation `deleteAccountingPeriod`)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-AP-DELETE` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm FE Web, §3 FE behaviour map 6/6 AC-ID, §4 visual fidelity + state + i18n override single-locale + RBAC + BR secondary + error mapping. §5-§11 FE-specific: reuse `share/dialogs/alert-confirm` + `share/dialogs/alert-dialog` (Priority 2 — share/, không có customs domain-fit, không cần build ui/ mới); grounded GraphQL contract theo `agg-garage-graph-graphql.md §3e.6` (correction so với figma-speculated "pre-check API" không tồn tại — client pre-check giới hạn ở `status`/`children`, guard "đã phát sinh dữ liệu kho" chỉ lộ qua error code `ERR-INV-025` tại thời điểm xóa per EC-1). NEED CONFIRMATION: AC-5 blocked_has_children wording DRAFT (Figma thiếu frame, BA chưa confirm). Mobile N/A (Web GMS only). |
