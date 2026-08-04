---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-OB-DELETE-LINES.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-DELETE-LINES"
source_feat_sha: "976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408"
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
consumes_backend_feats: ["FEAT-OB-DELETE-LINES"]
consumes_bff_feats: ["FEAT-OB-DELETE-LINES"]
i18n_keys: []
screens_touched:
  - "src/routes/_modules/_inventory/opening-balances/delete-lines.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ob-delete-lines.md (node 14492:89264 — Xóa dòng tồn đầu kỳ: 2 state confirm 13575:94897 / blocked 13575:95000)"
coverage_gaps:
  - "Route-as-dialog mechanics: spec giả định `delete-lines.tsx` là child route dưới layout route `_modules/_inventory/opening-balances/route.tsx` (list vẫn mount phía sau, dialog Portal overlay). FEAT-OB-LIST hiện tại (v1) dùng flat `index.tsx` (không có layout route riêng) — DEV cần xác nhận/điều chỉnh cấu trúc route thực tế khi implement 2 FEAT cùng lúc (agent-dev-garage-web), tránh conflict file structure."
  - "Confirm dialog body text (node 13575:94897) chưa OCR verbatim từ PNG screenshot (`assets/wave04-ob-delete-lines/13575-94897.png`) — spec đề xuất wording chuẩn xác nhận xóa generic 'Bạn có chắc chắn muốn xóa N dòng tồn đầu kỳ đã chọn? Hành động này không thể hoàn tác.' DEV verify trực tiếp screenshot trước khi hardcode, N = số dòng thực tế (1 cho single-row, nhiều cho bulk)."
  - "Blocked dialog body text (node 13575:95000) đã OCR verbatim từ figma spec: 'Một số dòng tồn đầu kỳ thuộc kỳ đã khóa hoặc đã phát sinh phiếu xuất kho nên không được xóa' — bundle flag MISMATCH với source FEAT AC-4 v7 wording gốc (không lấy được do policy no-copy). Theo API doc changelog (`gf-inventory-api.md` v37 + `agg-garage-graph-graphql.md` v7.46) đã chốt \"FE render popup verbatim per AC-4 (wording generic bao cả 2 case)\" — spec này DÙNG wording Figma làm nguồn verbatim (visual SSOT ưu tiên theo §G.Y gate), coi là đã fit chủ đích generic của AC-4. Nếu BA có wording khác chính xác hơn → cần CR đồng bộ Figma + spec."
  - "Single-row delete (trigger từ icon 🗑️ per row, FEAT-OB-LIST AC-11) — OB-LIST spec chỉ nói \"trigger flow xác nhận xóa dùng chung với FEAT-OB-DELETE-LINES\", KHÔNG chỉ rõ có navigate route `delete-lines` hay mở dialog inline tại chỗ. Spec này giả định DÙNG CHUNG route `delete-lines?ids={id}` (1 phần tử) để tái dùng 100% component/logic — NEED CONFIRMATION với BA/PO nếu single-row cần UX nhẹ hơn (popover inline thay vì full route navigate)."
  - "Toast success message text chưa có nguồn — đề xuất \"Đã xóa {N} dòng tồn đầu kỳ\" (N = deletedCount từ response) — NEED CONFIRMATION verbatim wording với BA khi implement."
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "n/a"
  template_sha: "n/a"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-DELETE-LINES.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-DELETE-LINES (FE Web): Xóa dòng tồn đầu kỳ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-DELETE-LINES` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/routes/_modules/_inventory/opening-balances/delete-lines.tsx` |
| Cross-tier consume | BE: `FEAT-OB-DELETE-LINES` \| BFF: `FEAT-OB-DELETE-LINES` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-DELETE-LINES` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-DELETE-LINES.md`](../../../../../Product/features/FEAT-OB-DELETE-LINES.md) |
| Source version | v7 |
| Source SHA | `976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408` |
| Generated at | 2026-07-08T07:00:00Z |

## 1. Mục đích nghiệp vụ

Garage cần xóa được các dòng tồn đầu kỳ đã import sai — chọn 1 dòng (icon xóa trên bảng) hoặc nhiều dòng cùng lúc (checkbox multi-select), rồi xác nhận trong popup trước khi thực thi. Hệ thống phải chặn xóa khi dòng đó thuộc kỳ kế toán đã khóa hoặc khi việc xóa làm số tồn tính lại theo thời gian bị âm — bảo vệ tính toàn vẹn của sổ tồn kho vốn là nền cho báo cáo tồn/NXT và các phiếu nhập/xuất sau này. Đây là mảnh ghép cuối của luồng quản lý tồn đầu kỳ, tiếp nối trực tiếp từ màn danh sách (`FEAT-OB-LIST`).

## 2. Trách nhiệm FE Web (garage-web)

- Dialog/route **`/inventory/opening-balances/delete-lines`** (search param `ids: number[]`) — mở khi user bấm icon xóa 🗑️ trên 1 dòng (điều hướng từ `FEAT-OB-LIST` AC-11, `ids=[id]`) hoặc bấm nút "Xoá các dòng đã chọn" (điều hướng từ `FEAT-OB-LIST` AC-7, `ids=selectedRowIds`). **Checkbox multi-select + nút trigger thuộc `FEAT-OB-LIST` §3 AC-7/AC-2** (đã spec riêng, KHÔNG re-build ở feature này) — FEAT-OB-DELETE-LINES chỉ tiêu thụ `ids[]` truyền qua route, sở hữu toàn bộ dialog + mutation execution + kết quả.
- User flow chính: mount route → render Confirm dialog (danger variant, "Xác nhận"/"Hủy"/"Xoá") → user Confirm → gọi mutation (1 id → `deleteOpeningBalanceLine`, ≥2 id → `deleteOpeningBalanceLines`) → thành công: đóng dialog, toast, invalidate list query, quay lại `/inventory/opening-balances`; thất bại do guardrail (kỳ khóa / tồn âm): chuyển dialog sang Blocked variant (title "Không thể xóa", wording generic, chỉ nút "Đóng") — không xóa bất kỳ dòng nào (all-or-nothing).
- State machine UI: `idle → confirm-open → (submitting) → success (close+toast) | blocked (switch dialog variant) | transient-error (toast, giữ dialog confirm mở lại để retry)`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): scan `customs/` trước — KHÔNG có dialog domain-specific cho OB delete trong registry → fallback `share/dialogs/alert-confirm` (Confirm) + `share/dialogs/alert-dialog` (Blocked), cả 2 đã match sẵn ở Priority 2 — KHÔNG cần build-new (xem §5.2).
- **Figma spec là visual SSOT**: `Product/ux/figma-web/wave04-ob-delete-lines.md` (node `14492:89264`) — 2 screen: Confirm `13575:94897` (danger, `bg-destructive` trên nút Xoá), Blocked `13575:95000` (nút Đóng only, `text-muted-foreground` body). KHÔNG có icon trong dialog (chỉ title + body text + 1-2 button).
- GraphQL op consume từ BFF: mutation `deleteOpeningBalanceLine(id: Int!)` (single) và `deleteOpeningBalanceLines(input: DeleteOpeningBalanceLinesInput!)` (bulk, `input.ids: [Int!]!`).
- RBAC render: route kế thừa feature-flag `Inventory:InventoryV2` guard từ layout cha; 2 persona `garage-owner` + `accountant` xem quyền xóa ngang nhau — KHÔNG có gating riêng theo role (AC-6).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 6/6 source AC-ID (5 áp dụng tier fe-web + 1 N/A — BE invariant, khai báo dưới).

### Cluster A — Mở popup xác nhận

#### AC-1 → FE mở Confirm dialog khi nhận trigger từ FEAT-OB-LIST

- **Khi**: route `/inventory/opening-balances/delete-lines?ids=...` mount (điều hướng từ icon xóa per-row `AC-11` hoặc nút "Xoá các dòng đã chọn" `AC-7` của `FEAT-OB-LIST`).
- **FE phải**: parse `ids[]` từ search params → render `OpeningBalanceDeleteLinesDialog` state `confirm`, hiển thị Confirm dialog: title "Xác nhận", body "Bạn có chắc chắn muốn xóa {N} dòng tồn đầu kỳ đã chọn? Hành động này không thể hoàn tác." (N = `ids.length`, xem `coverage_gaps` verify verbatim), 2 button "Hủy" (outline) / "Xoá" (danger, `bg-destructive`).
- **State transition**: `idle → confirm-open`.
- **Component**: `share/dialogs/alert-confirm` (root, variant danger).
- **GraphQL op**: N/A (chỉ render, chưa gọi mutation).
- **i18n keys**: N/A — fixed VN "Xác nhận" / "Hủy" / "Xoá" (không dùng i18next, xem §4.3).
- **a11y**: dialog `role="alertdialog"`, focus trap vào nút "Hủy" mặc định (safe default), `Escape` = Hủy.
- **Ref**: figma spec `wave04-ob-delete-lines.md` Screen "Confirm delete — Xác nhận", node `13575:94897`.

### Cluster B — Thực hiện xóa

#### AC-2 → FE gọi mutation tương ứng, thành công thì đóng dialog + refresh list

- **Khi**: user bấm nút "Xoá" trong Confirm dialog.
- **FE phải**: set state `submitting` (button "Xoá" `isLoading`) → gọi `deleteOpeningBalanceLine(id)` nếu `ids.length === 1`, hoặc `deleteOpeningBalanceLines(input: { ids })` nếu `ids.length > 1` → thành công: đóng dialog, toast "Đã xóa {deletedCount} dòng tồn đầu kỳ" (xem `coverage_gaps`), invalidate TanStack query key `['opening-balance-list', ...]`, `router.history.back()` về `/inventory/opening-balances` (giữ nguyên filter/scroll list).
- **State transition**: `confirm-open → submitting → success (close + toast)`.
- **Component**: `share/dialogs/alert-confirm` (nút "Xoá" `isLoading` state), `share/toasts/toast` (success).
- **GraphQL op**: `deleteOpeningBalanceLine(id: Int!)` (single) hoặc `deleteOpeningBalanceLines(input: { ids: [Int!]! })` (bulk) — response `deletedId`/`deletedCount` + `cascadedRecomputedRows`/`cascadedKeys` (audit-only, FE không cần render).
- **i18n keys**: N/A — fixed toast text.
- **a11y**: toast `role="status"` announce.
- **Ref**: figma spec §Screenshots node `13575:94897` (state confirm); `agg-garage-graph-graphql.md §3g.6` `deleteOpeningBalanceLine`/`deleteOpeningBalanceLines`.

### Cluster C — Hủy xóa

#### AC-3 → FE đóng dialog khi Hủy, không gọi mutation

- **Khi**: user bấm nút "Hủy" trong Confirm dialog, hoặc `Escape`/click outside (nếu dialog cho phép dismiss).
- **FE phải**: đóng dialog ngay, KHÔNG gọi mutation, `router.history.back()` về `/inventory/opening-balances` — giữ nguyên selection/filter list (nếu bulk, `selectedRowIds` ở `FEAT-OB-LIST` state KHÔNG bị reset bởi hành động Hủy này — do state đó sống ở component cha, ngoài scope route con).
- **State transition**: `confirm-open → idle (dialog closed)`.
- **Component**: `share/dialogs/alert-confirm` (nút "Hủy" outline).
- **GraphQL op**: N/A.
- **i18n keys**: N/A — fixed "Hủy".
- **a11y**: nút "Hủy" default focus (an toàn — tránh nhầm Xoá).
- **Ref**: figma spec node `13575:94897`.

### Cluster D — Chặn khi thuộc kỳ đã khóa hoặc làm tồn âm

#### AC-4 → FE chuyển sang Blocked dialog khi BE trả guardrail error

- **Khi**: mutation `deleteOpeningBalanceLine`/`deleteOpeningBalanceLines` trả lỗi `ERR-INV-024` (dòng thuộc kỳ đã đóng — BR-OB-DEL-002/ADR-021) hoặc `ERR-INV-036` (xóa làm cascade tồn âm — BR-OB-DEL-003/ADR-020); với bulk, BE validate **fail-fast** theo thứ tự `ids[]` — dừng ở id đầu tiên vi phạm, chặn **cả lô** (không xóa dòng nào, BR-OB-DEL-004 all-or-nothing).
- **FE phải**: chuyển `OpeningBalanceDeleteLinesDialog` sang state `blocked` — render title "Không thể xóa", body verbatim "Một số dòng tồn đầu kỳ thuộc kỳ đã khóa hoặc đã phát sinh phiếu xuất kho nên không được xóa" (wording generic, dùng chung cho cả 2 mã lỗi — KHÔNG phân biệt nguyên nhân cụ thể theo error code, per API changelog quyết định), chỉ 1 button "Đóng" → bấm Đóng thì `router.history.back()` về list, KHÔNG xóa gì cả (kể cả single-row).
- **State transition**: `submitting → blocked (dialog variant switch, KHÔNG unmount/remount route)`.
- **Component**: `share/dialogs/alert-dialog` (variant error, action-only "Đóng").
- **GraphQL op**: cùng mutation AC-2, nhánh lỗi `ERR-INV-024` / `ERR-INV-036` trong response `ErrorResponse.code`.
- **i18n keys**: N/A — fixed verbatim per figma (xem `coverage_gaps` nếu BA có wording khác).
- **a11y**: dialog `role="alertdialog"` re-announce khi variant đổi (aria-live polite); nút "Đóng" nhận focus.
- **Ref**: figma spec Screen "Blocked — Không thể xóa", node `13575:95000`; `gf-inventory-api.md §3b.2 W04-7` (fail-fast semantics); `agg-garage-graph-graphql.md §3g.6 deleteOpeningBalanceLines` error codes.

### Cluster E — Guardrail rule (BE invariant)

#### AC-5 → N/A (quy tắc tồn ≥ 0 là invariant tính toán ở BE `StockLedgerRecomputeService`, xem `be/FEAT-OB-DELETE-LINES.md`)

- Đây là AC làm rõ ngữ nghĩa quy tắc `closing_qty ≥ 0` khi cascade recompute (ADR-020/BR-STKV2-001) — thuần server-side invariant, FE không có dữ liệu client-side để precompute hay hiển thị số liệu trung gian. FE chỉ nhận kết quả qua `ERR-INV-036` ở AC-4 (Blocked dialog generic).

### Cluster F — Phân quyền & tenant

#### AC-6 → FE không có gating riêng theo persona; route kế thừa feature-flag từ layout cha

- **Khi**: chủ garage hoặc kế toán mở dialog xóa (single hoặc bulk).
- **FE phải**: KHÔNG có logic ẩn/hiện action theo persona — cả 2 role (`garage-owner`, `accountant`) thấy và thao tác được dialog xóa ngang nhau (đồng nhất pattern `FEAT-OB-LIST` AC-9). Route `delete-lines` kế thừa `beforeLoad` guard feature-flag `Inventory:InventoryV2` từ route cha `/inventory/opening-balances` — nếu route con không tự động kế thừa (xem `coverage_gaps` route-as-dialog), phải khai báo lại tường minh cùng guard để tránh bypass.
- **Component**: TanStack Router `beforeLoad` (kế thừa hoặc khai báo lại, feature-flag only).
- **GraphQL op**: N/A.
- **i18n keys**: N/A.
- **a11y**: N/A.
- **Ref**: BR-OB-CMN-002 (permission dual persona — enforce BE); §4.4 RBAC + feature flag.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave04-ob-delete-lines.md` (node `14492:89264`; Confirm `13575:94897`, Blocked `13575:95000`). KHÔNG re-invent layout/spacing/color.
- Design tokens: `bg-destructive` (nút "Xoá" danger trong Confirm dialog), `text-foreground` (title cả 2 dialog), `text-muted-foreground` (body text cả 2 dialog). Tokens MUST khớp bundle §G.Y "Design tokens referenced" — không hardcode hex/px.
- Dialog KHÔNG có icon glyph (chỉ title + body text + 1-2 button) — KHÔNG tự thêm icon cảnh báo ngoài spec.
- Card 441×182 white, `shadow-lg`, centered — theo figma layout.

### 4.2 State machine + error handling

- State transition tường minh: `idle | confirm-open | submitting | success | blocked | transient-error`. `blocked` là dialog-variant switch (không phải route change) khi guardrail 400 (`ERR-INV-024`/`ERR-INV-036`).
- Error 503 (`gf-accounting` lock-check down, fail-CLOSED per ADR-021, `ERR-CMN-007`) → TOAST "Hệ thống đang bận, vui lòng thử lại sau" — giữ Confirm dialog mở lại (cho phép user retry "Xoá"), KHÔNG chuyển sang Blocked (khác nguyên nhân với guardrail nghiệp vụ).
- Error 404 (`ERR-CMN-not-found` — id đã bị xóa từ tab khác) → TOAST lỗi + đóng dialog + refresh list (không có gì để retry).
- KHÔNG silent fail — mọi error reach UI qua toast hoặc dialog-variant switch.

### 4.3 i18n + a11y

- **Fixed VN labels (KHÔNG dùng i18next)** — đồng nhất pattern `FEAT-OB-LIST §4.3` (tiền lệ W03 Catalog). `i18n_keys: []`.
- Dialog `role="alertdialog"`, `aria-labelledby`/`aria-describedby` trỏ title/body.
- Focus management: Confirm dialog mặc định focus nút "Hủy" (an toàn); Blocked dialog focus nút "Đóng".
- `Escape` = tương đương Hủy/Đóng (không thực thi xóa).

### 4.4 RBAC render + feature flag

- Feature-flag `Inventory:InventoryV2` gate route `/inventory/opening-balances/delete-lines` — kế thừa từ layout cha `/inventory/opening-balances` (CR-20260707-02); nếu route con không tự kế thừa `beforeLoad` (xem `coverage_gaps`), phải khai báo lại tường minh.
- Persona check: 2 actor `garage-owner` + `accountant` (Critical Rule #6) — quyền xóa ngang nhau, KHÔNG role-based hide/disable.
- Mobile KHÔNG có action xóa (view-only per UX-FLOW) — route/feature này chỉ tồn tại ở web.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE tier (xem paired `be/FEAT-OB-DELETE-LINES.md §9` khi được author). FE chỉ:
  - Hiển thị Blocked dialog generic khi BE reject theo BR-OB-DEL-002/003 — KHÔNG tự suy luận/precompute điều kiện tồn âm hay kỳ khóa ở client.
  - All-or-nothing: FE KHÔNG xóa optimistic từng phần — chỉ cập nhật UI sau khi response thành công toàn bộ (BR-OB-DEL-004).
  - Disable nút "Xoá" trong lúc `submitting` (tránh double-submit).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-024` | DIALOG_VARIANT_SWITCH (Blocked) | `OpeningBalanceDeleteLinesDialog` (blocked state) | AC-4 |
| `ERR-INV-036` | DIALOG_VARIANT_SWITCH (Blocked) | `OpeningBalanceDeleteLinesDialog` (blocked state) | AC-4 |
| `ERR-CMN-not-found` | TOAST + close dialog + refresh list | toast global | AC-2 |
| `ERR-CMN-007` (503 lock-check unavailable, fail-CLOSED) | TOAST (giữ dialog mở, cho retry) | toast global | AC-2 |
| `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | TOAST | toast global | AC-2 |
| `UNKNOWN_ERROR` / `INTERNAL_ERROR` | TOAST | toast global | AC-2 |
| `FORBIDDEN_ERROR` (feature-flag OFF hoặc tenant mismatch) | REDIRECT (route guard, không toast) | TanStack Router `beforeLoad` | AC-6 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `OpeningBalanceDeleteLinesDialog` | `/inventory/opening-balances/delete-lines` (search param `ids`) | NEW | `13575:94897` (confirm) / `13575:95000` (blocked) | AC-1, AC-2, AC-3, AC-4, AC-6 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Author consult `.claude/references/web-component-registry.yaml` §1/§2 để biết component có sẵn ở priority cao nhất. Build-new entry phải có justification rằng cả 3 layer không có component fit.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `share/dialogs/alert-confirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, title, description, confirmLabel, cancelLabel, danger, isLoading, onConfirm, onCancel }` | controlled `open` | **Priority 2 — share/** (không có customs/ dialog domain-specific cho OB delete; `alert-confirm` đã match anatomy "Hỏi xác nhận hành động nguy hiểm delete") | AC-1, AC-2, AC-3 |
| `share/dialogs/alert-dialog` | `src/components/share/dialogs/alert-dialog.tsx` | REUSE | `{ open, variant: "error", title, description, closeLabel, onClose }` | controlled `open` | **Priority 2 — share/** (variant error/warning với close-only action — match Blocked dialog anatomy) | AC-4 |
| `share/toasts/toast` | `src/components/share/toasts/toast.tsx` | REUSE | `{ variant, message }` | — | **Priority 2 — share/** | AC-2, AC-4 |
| `OpeningBalanceDeleteLinesDialog` (kebab-case file) | `src/features/inventory-opening-balance/components/opening-balance-delete-lines-dialog.tsx` | NEW (orchestrator, compose reuse) | `{ ids: number[] }` | local `viewState: 'confirm' \| 'submitting' \| 'blocked'` | **Compose reuse** — orchestrator local component switching giữa `alert-confirm`/`alert-dialog` theo mutation result; KHÔNG phải build-new primitive (chỉ compose 2 component có sẵn + hook mutation) | AC-1, AC-2, AC-3, AC-4 |

### 5.3 Design tokens & Figma refs

> Design tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced" (anti-hallucination guard — reviewer item #21 check). Figma refs reference figma spec file paths, không chỉ node-id.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-destructive` | `tailwind.config.js` | Nút "Xoá" danger variant trong Confirm dialog | AC-1, AC-2 |
| `text-foreground` | tokens | Title cả 2 dialog ("Xác nhận" / "Không thể xóa") | AC-1, AC-4 |
| `text-muted-foreground` | tokens | Body text cả 2 dialog | AC-1, AC-4 |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo `Product/ux/figma-web/wave04-ob-delete-lines.md`. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `deleteOpeningBalanceLine` | mutation | `src/api/graphql/opening-balance/delete-opening-balance-line.graphql` | — (mutation, invalidate `['opening-balance-list']` on success) | — | AC-2, AC-4 |
| `deleteOpeningBalanceLines` | mutation | `src/api/graphql/opening-balance/delete-opening-balance-lines.graphql` | — (mutation, invalidate `['opening-balance-list']` on success) | — | AC-2, AC-4 |

> **Cross-tier note (item #16)**: cả 2 mutation được `FEAT-OB-LIST` cross-ref như "out of scope tier đó" — thực thi thật sự nằm ở FEAT này. Downstream: `deleteOpeningBalanceLine` → `DELETE /api/v2/opening-balances/{id}` (W04-6); `deleteOpeningBalanceLines` → `POST /api/v2/opening-balances/delete-lines` (W04-7) — xem `gf-inventory-api.md §3b.2` + `agg-garage-graph-graphql.md §3g.6`.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| — | — | (none — mọi traffic qua BFF `agg-garage-graph`) | boundary isolation | — |

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Route param | TanStack Router search params | `delete-lines` route | `ids: number[]` | AC-1 |
| Dialog view state | React local state | `OpeningBalanceDeleteLinesDialog` | `viewState: 'confirm' \| 'submitting' \| 'blocked'` | AC-1, AC-2, AC-4 |
| Server mutation | TanStack Mutation | — | `useMutation` (2 hook: single/bulk) | AC-2 |
| List cache invalidation | TanStack Query | — | `queryClient.invalidateQueries(['opening-balance-list'])` | AC-2 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/opening-balances/delete-lines` | `OpeningBalanceDeleteLinesDialog` | (none — `ids` từ search params, không prefetch) | RBAC: `garage-owner \| accountant` + feature-flag `Inventory:InventoryV2` (kế thừa/khai báo lại từ route cha) | AC-1, AC-6 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/routes/_modules/_inventory/opening-balances/` | `delete-lines.tsx` | NEW | TanStack Router route (search param `ids`) | ~35 | AC-1, AC-6 |
| `src/features/inventory-opening-balance/components/` | `opening-balance-delete-lines-dialog.tsx` | NEW | compose `alert-confirm` + `alert-dialog` (§5.2) | ~120 | AC-1-AC-4 |
| `src/features/inventory-opening-balance/hooks/` | `use-delete-opening-balance-lines.ts` | NEW | TanStack Mutation wrapper (2 mutation, branch theo `ids.length`) | ~60 | AC-2, AC-4 |
| `src/api/graphql/opening-balance/` | `delete-opening-balance-line.graphql` | ADDITIVE | persisted query | ~10 | AC-2 |
| `src/api/graphql/opening-balance/` | `delete-opening-balance-lines.graphql` | ADDITIVE | persisted query | ~10 | AC-2 |
| `src/api/generated/` | `delete-opening-balance-line{,s}.generated.ts` | AUTO-GEN | codegen | — | — |
| `tests/features/inventory-opening-balance/` | `opening-balance-delete-lines-dialog.test.tsx` | NEW | Vitest + RTL | ~150 | AC-1-AC-4, AC-6 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL §3g W04-6/W04-7 deleteOpeningBalanceLine/deleteOpeningBalanceLines stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave04-ob-delete-lines.md) + FEAT-OB-LIST route trigger (AC-7/AC-11) đã impl
    Exit: E2E happy path green (smoke) — single delete + bulk delete + blocked guardrail case
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Dialog component + route + mutation hook + state switch | features + routes | BFF S5 stable + FEAT-OB-LIST S6 trigger wired | E2E smoke green | BFF S5, FEAT-OB-LIST S6 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ:
> - Render Blocked dialog generic khi BE reject (không tự suy luận điều kiện).
> - All-or-nothing UI (không optimistic partial delete).
> - RBAC-driven route gate (feature-flag, kế thừa từ layout cha).
> - Error code → display mode mapping (§4.6).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-DEL-002` | CORNERSTONE | Blocked dialog khi kỳ đã đóng (`ERR-INV-024`) | `opening-balance-delete-lines-dialog.tsx` (blocked state) | AC-4 | BE final enforce (ADR-021 fail-CLOSED commit) |
| `BR-OB-DEL-003` | CORNERSTONE | Blocked dialog khi cascade tồn âm (`ERR-INV-036`) | `opening-balance-delete-lines-dialog.tsx` (blocked state) | AC-4 | BE final enforce (ADR-020 invariant) |
| `BR-OB-DEL-004` | CORNERSTONE | All-or-nothing — không xóa optimistic từng phần | `use-delete-opening-balance-lines.ts` | AC-2, AC-4 | BE transaction rollback toàn bộ |
| `BR-OB-CMN-002` | NORMAL | Dual persona ngang quyền, không gating UI riêng | route `beforeLoad` | AC-6 | Permission enforce BE |

> **Primary enforcement** = BE tier (`features/be/FEAT-OB-DELETE-LINES.md §9` khi được author).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | Confirm dialog mở đúng cho cả 1 id (single) và nhiều id (bulk) |
| AC-2 | UI (mutation happy path) | test-ui | 2 nhánh: `deleteOpeningBalanceLine` (1 id) vs `deleteOpeningBalanceLines` (N id) |
| AC-3 | UI (negative — no-op) | test-ui | Hủy KHÔNG gọi mutation |
| AC-4 | UI (negative — guardrail) | test-ui | ERR-INV-024/ERR-INV-036 → Blocked dialog, không xóa gì |
| AC-6 | UI (RBAC visibility) | test-ui + test-isolation | dual persona ngang quyền |
| (smoke) | E2E happy path | test-e2e | Playwright: OB-LIST checkbox select → bulk delete confirm → list refresh; single-row delete icon → confirm → list refresh; blocked case (seed data thuộc kỳ đã khóa) |

## 11. i18n & a11y

### 11.1 i18n keys

> KHÔNG áp dụng — fixed VN labels (KHÔNG dùng i18next), `i18n_keys: []` per §4.3. Toàn bộ label hardcode inline verbatim theo figma spec (vd "Xác nhận", "Hủy", "Xoá", "Không thể xóa", "Đóng").

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Dialog `role="alertdialog"` + `aria-labelledby`/`aria-describedby` | focus mặc định "Hủy" |
| AC-2 | Nút "Xoá" `aria-busy` khi `isLoading` | tránh double-submit |
| AC-4 | Dialog variant switch có `aria-live="polite"` re-announce | screen reader nhận biết thay đổi title/body |
| AC-6 | N/A | route guard, không UI a11y riêng |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-DELETE-LINES.md` | N-A (chưa author tại thời điểm spawn này) | BR primary enforcement (BR-OB-DEL-002/003/004), contract source `DELETE /api/v2/opening-balances/{id}` (W04-6) + `POST /api/v2/opening-balances/delete-lines` (W04-7) — `gf-inventory-api.md §3b.2` |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-DELETE-LINES.md` | N-A (chưa author tại thời điểm spawn này) | GraphQL op `deleteOpeningBalanceLine` + `deleteOpeningBalanceLines` (§6.1) — SDL `agg-garage-graph-graphql.md §3g.6` |
| Mobile | N-A | N-A | Mobile view-only per UX-FLOW ("KHÔNG có: import/edit/delete") — không có tier mobile cho feature này |
| Sibling FEAT (out of scope, referenced) | `FEAT-OB-LIST` (fe-web tier, cùng wave) | DRAFT | AC-7 (nút "Xoá các dòng đã chọn") + AC-11 (icon xóa per-row) sở hữu checkbox multi-select + trigger navigation — feature này chỉ tiêu thụ `ids[]` truyền qua route |

**Source ID consistency** (item 18): `source_feat_sha` = `976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408` — PHẢI identical với BE/BFF files khi được author trong cùng wave.

## 13. References

- **Source**: [`Product/features/FEAT-OB-DELETE-LINES.md`](../../../../../Product/features/FEAT-OB-DELETE-LINES.md) v7
- **Paired BE**: [`features/be/FEAT-OB-DELETE-LINES.md`](../be/FEAT-OB-DELETE-LINES.md) (khi được author)
- **Paired BFF**: [`features/bff/FEAT-OB-DELETE-LINES.md`](../bff/FEAT-OB-DELETE-LINES.md) (khi được author)
- **Sibling FEAT (checkbox/button trigger)**: [`features/fe-web/FEAT-OB-LIST.md`](FEAT-OB-LIST.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md)
- **Figma spec**: [`Product/ux/figma-web/wave04-ob-delete-lines.md`](../../../../../Product/ux/figma-web/wave04-ob-delete-lines.md) (node `14492:89264`)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **API contract**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index W04 → §3g Opening Balance (`deleteOpeningBalanceLine`/`deleteOpeningBalanceLines`)
- **API contract (BE)**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §0 Wave Index W04 → §3b.2 (W04-6/W04-7)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-OB-DELETE-LINES` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier — sẽ đối chiếu khi BE/BFF author), §2 trách nhiệm FE Web (dialog owner, checkbox/button trigger thuộc `FEAT-OB-LIST`), §3 FE behaviour map 6/6 AC-ID (5 áp dụng web + 1 N/A BE invariant AC-5), §4 visual fidelity (danger `bg-destructive` Confirm + generic Blocked wording) + state machine + i18n (fixed VN, no i18next) + a11y + RBAC + BR secondary + error mapping (`ERR-INV-024`/`ERR-INV-036` → Blocked dialog switch, `ERR-CMN-007` 503 fail-CLOSED → toast retry), §5-§11 FE-specific (route `delete-lines` search param `ids` + component reuse §5.2 priority customs>share>ui — 100% reuse `share/dialogs/alert-confirm`+`alert-dialog`, không build-new + GraphQL `deleteOpeningBalanceLine`/`deleteOpeningBalanceLines` (`agg-garage-graph-graphql.md §3g.6`, downstream `gf-inventory-api.md §3b.2 W04-6/W04-7`) + cross-ref `FEAT-OB-LIST` cho checkbox/button trigger ownership. Source FEAT chỉ audit. 5 coverage_gaps ghi nhận (route-as-dialog mechanics chưa verify filesystem, confirm dialog body text chưa OCR verbatim, blocked dialog wording dùng Figma làm nguồn generic — khác source FEAT AC-4 raw text, single-row delete route ambiguity, toast success wording chưa BA chốt). |
