---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-OB-EDIT.md"
source_version: 5
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-EDIT"
source_feat_sha: "c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19"
generated_at: "2026-07-08T06:30:00Z"
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
consumes_backend_feats: ["FEAT-OB-EDIT"]
consumes_bff_feats: ["FEAT-OB-EDIT"]
i18n_keys: []
screens_touched:
  - "src/routes/_modules/_inventory/opening-balances/$id/edit.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ob-edit.md (node 14854:94446 — Sửa chi tiết tồn kho vật tư hàng hoá, screen node 14854:93461)"
coverage_gaps:
  - "Task focus hint ban đầu ghi 'Modal/drawer edit line OB'; bundle §G UX-FLOW + Figma header pattern (nút '← Quay lại' + 'Huỷ bỏ' + 'Lưu') + FEAT-OB-LIST AC-10 (`navigate('/inventory/opening-balances/{id}/edit')`, route riêng — không phải query-param modal) đều chỉ ra đây là **dedicated route full-page form**, KHÔNG phải modal/drawer overlay trên danh sách. Spec này dùng bundle làm nguồn authoritative (route full-page) — nếu design intent thực sự là modal, cần CR điều chỉnh lại route pattern + Figma."
  - "**KHÔNG có GraphQL query 'get single OpeningBalanceLine by id'** trong `agg-garage-graph-graphql.md §3g.2` (chỉ có `searchOpeningBalances` W04-Q1 paged, không filter theo `id`; `updateOpeningBalanceLine` W04-M3 chỉ nhận input, không phải fetch). FE-EDIT screen KHÔNG có backend endpoint riêng để tải lại 1 dòng OB theo id. Giải pháp W04 (pragmatic, xem §6.3): (1) ưu tiên đọc data từ TanStack Router `state` truyền kèm khi navigate từ danh sách (row đã có đủ field từ `searchOpeningBalances`); (2) fallback tìm trong TanStack Query cache `['opening-balance-list', ...]` theo `id`; (3) nếu cả 2 đều miss (deep-link trực tiếp / F5 refresh trang edit) → render banner lỗi 'Không tìm thấy dữ liệu dòng tồn đầu kỳ — vui lòng quay lại danh sách và chọn lại' + CTA quay lại, KHÔNG render form. NEED CONFIRMATION: follow-up CR đề xuất thêm BFF query `getOpeningBalanceLine(id: Int!)` để loại bỏ giới hạn này (ghi nhận, không block W04 scope hiện tại)."
  - "Component `customs/select/select-suggested-product` (Priority 1 — reuse cho 'Sản phẩm nội bộ') hiện phục vụ use-case 'add line item' (SO/quotation/PO) — chưa xác nhận có sẵn prop filter 'chỉ mã Đang hoạt động' (`statusFilter: 'ACTIVE'` hoặc tương đương). NEED CONFIRMATION khi DEV: nếu thiếu prop → `/allow-new-component` reason=\"extend\" (thêm prop filter status) thay vì build-new, theo `extension_threshold` của registry."
  - "[RESOLVED 2026-07-09 — user quannn confirm] Component `customs/select/warehouses-select-filter` (Priority 1) — CONFIRMED reuse cho field 'Kho' (`warehouseId`) trong RHF form context của FEAT-OB-EDIT. Component đã tồn tại tại `src/components/customs/select/warehouses-select-filter.tsx` (verified). DEV binding qua RHF `Controller` với `name`/`control` (component vốn build cho filter-bar context nhưng anatomy đủ để adapt vào form context không cần extend). KHÔNG cần `/allow-new-component`."
  - "Đơn vị tính (ĐVT) hiển thị 'dự đoán' khi user đổi Sản phẩm nội bộ TRƯỚC khi lưu — lấy từ metadata option trong dropdown `select-suggested-product` (client-side derive, không gọi API riêng). Server tự derive lại `mainUnitCode` từ `internal_product.main_unit_code` theo `productCode` khi commit (per SDL comment `UpdateOpeningBalanceLineInput`) — có rủi ro race nhỏ nếu metadata option cũ/stale; chấp nhận vì server luôn là nguồn cuối cùng (client chỉ optimistic display)."
  - "Popup lỗi guardrail (ERR-INV-024/034/035/036) chưa có Figma frame riêng (chỉ 1 frame default filled data). Spec chọn `share/dialogs/alert-dialog` (blocking dialog) thay vì TOAST cho 4 mã lỗi này — dựa theo cụm từ bundle §G.Y 'blocked-guardrail popup'. NEED CONFIRMATION với thiết kế UX khi có Figma bổ sung."
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "n/a"
  template_sha: "n/a"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-EDIT.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-EDIT (FE Web): Sửa dòng tồn đầu kỳ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-EDIT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) — **web-only**, mobile KHÔNG có màn sửa OB (per `agg-garage-graph-graphql.md §3g.4` Mobile scope "PARTIAL — view-only list", W04-M1..M5 không expose sang mobile schema bundle) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/routes/_modules/_inventory/opening-balances/$id/edit.tsx` |
| Cross-tier consume | BE: `FEAT-OB-EDIT` \| BFF: `FEAT-OB-EDIT` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-EDIT.md`](../../../../../Product/features/FEAT-OB-EDIT.md) |
| Source version | v5 |
| Source SHA | `c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19` |
| Generated at | 2026-07-08T06:30:00Z |

## 1. Mục đích nghiệp vụ

Tồn đầu kỳ là điểm khởi đầu số liệu tồn kho của garage; đôi khi dữ liệu import ban đầu bị sai (nhầm mã sản phẩm, kho, số lượng, giá trị hoặc ngày) và garage cần cách sửa nhanh một dòng cụ thể mà không phải xóa rồi import lại toàn bộ file. Màn sửa phục vụ cả chủ garage lẫn kế toán ngang quyền, cho phép chỉnh 5 trường (sản phẩm, kho, số lượng, giá trị, ngày) trong khi đơn vị tính luôn khóa theo mã sản phẩm đã chọn — không có đường tắt đổi ĐVT riêng. Thay đổi chỉ được xác nhận sau khi thỏa các guardrail nghiệp vụ (kỳ kế toán đang mở ở cả ngày cũ lẫn ngày mới, tồn không âm tại bất kỳ thời điểm nào, ngày hợp lệ trước phiếu đã ghi sổ, không trùng mã+kho) rồi mới cascade lại sổ tồn — đảm bảo dữ liệu tồn kho luôn nhất quán làm nền cho các phiếu nhập/xuất ở wave sau.

## 2. Trách nhiệm FE Web (garage-web)

- Màn **"Sửa chi tiết tồn kho vật tư hàng hoá"** tại route riêng `/inventory/opening-balances/:id/edit` (dedicated full-page route, KHÔNG modal/drawer — xem `coverage_gaps`) — entry duy nhất từ icon ✏️ trên dòng danh sách (`FEAT-OB-LIST` AC-10). Header gồm nút "← Quay lại" (icon-only) + tiêu đề + 2 action "Huỷ bỏ" / "Lưu" (top-right).
- User flow chính: mount với dữ liệu prefill từ router state/cache (xem §6.3) → hiển thị 6 field (5 sửa được + 1 readonly ĐVT) → user chỉnh field → validate client-side realtime → bấm "Lưu" → gọi mutation `updateOpeningBalanceLine` → thành công: toast + điều hướng về danh sách (invalidate cache); lỗi guardrail: dialog chặn hiển thị message server.
- State machine UI: `idle → loading (resolve source data) → ready (form editable) → submitting → success (navigate away) | error (dialog/inline/toast tuỳ mã lỗi)`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Reuse foundation từ layer cao nhất có component fit (xem §5.2, `.claude/references/web-component-registry.yaml`). Feature này 100% reuse — không có component build-new.
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration theo `Product/ux/figma-web/wave04-ob-edit.md` (node `14854:93461`, 1 state default filled-data). §2/§4/§5 references cross-ref figma sections. Error/guardrail state chưa có frame riêng — xem `coverage_gaps`.
- GraphQL op consume từ BFF: mutation `updateOpeningBalanceLine(id, input)` (duy nhất — không có query "get single" riêng, xem §6.3 giải pháp prefill).
- RBAC render: route gate feature-flag `Inventory:InventoryV2` (TanStack Router `beforeLoad`, giống `FEAT-OB-LIST`); 2 persona `garage-owner` + `accountant` xem quyền sửa ngang nhau — KHÔNG có gating riêng theo role.

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 10/10 source AC-ID (toàn bộ áp dụng tier fe-web — feature web-only, mobile không có màn sửa OB).

### Cluster A — Mở form & tải dữ liệu hiện tại

#### AC-1 → FE render route full-page với header 3 action

- **Khi**: user bấm icon ✏️ trên 1 dòng OB ở danh sách (`FEAT-OB-LIST` AC-10 trigger `navigate('/inventory/opening-balances/{id}/edit', { state: { line: row } })`).
- **FE phải**: render `OpeningBalanceEditPage` tại route `/inventory/opening-balances/:id/edit`, gồm: header (icon "← Quay lại" trái + tiêu đề "Sửa chi tiết tồn kho vật tư hàng hoá" + 2 button "Huỷ bỏ" (outline) / "Lưu" (brand, disabled khi form invalid — AC-3) bên phải) + `share/containers/section` "Thông tin tồn đầu kỳ" chứa 6 field (§3 Cluster B).
- **State transition**: `idle → loading` (resolve source data theo §6.3) `→ ready` (form editable) hoặc `→ error` (banner "không tìm thấy dữ liệu" nếu source resolve fail — xem `coverage_gaps`).
- **Component**: `share/layouts/page-header` (title + back), `share/buttons/button` (Huỷ bỏ outline, Lưu brand), `share/containers/section` (form wrapper).
- **GraphQL op**: N/A (mount không tự fetch — data lấy từ router state/cache, xem §6.3).
- **i18n keys**: N/A — fixed VN label "Sửa chi tiết tồn kho vật tư hàng hoá" / "Huỷ bỏ" / "Lưu" (không dùng i18next, xem §4.3).
- **a11y**: H1 semantics cho tiêu đề; back icon-button `aria-label="Quay lại danh sách tồn đầu kỳ"`.
- **Ref**: figma spec `wave04-ob-edit.md` node `14854:93461` (Header + Section layout), icon-catalog `icon/back-arrow`.

#### AC-2 → FE prefill 6 field từ dữ liệu dòng OB hiện tại

- **Khi**: source data đã resolve (router state hoặc query cache — §6.3).
- **FE phải**: prefill RHF form với 5 field sửa được — **Sản phẩm nội bộ** (`productCode`/`productName`), **Kho** (`warehouseId` — resolve từ `warehouseCode` snapshot hiện có nếu cần map ngược), **Số lượng tồn** (`quantityOnHand`), **Tồn đến ngày** (`asOfDate`), **Giá trị tồn** (`valueOnHand`) — cùng 1 field readonly **Đơn vị tính** hiển thị `mainUnitName` (fallback `mainUnitCode`) từ dòng hiện tại, không nằm trong RHF schema submit.
- **State transition**: `ready` (form editable, `isDirty=false` ban đầu).
- **Component**: `ui/form` (RHF FormProvider root), `customs/select/select-suggested-product`, `customs/select/warehouses-select-filter`, `share/inputs/input-number` ×2, `share/date-picker/date-picker`, `share/displays/description-item` (ĐVT).
- **GraphQL op**: N/A — prefill từ data đã có (§6.3), không gọi lại API khi mount.
- **i18n keys**: N/A — fixed VN label "Sản phẩm nội bộ", "Kho", "Số lượng tồn", "Tồn đến ngày", "Giá trị tồn", "Đơn vị tính".
- **a11y**: mỗi field có `<label>` gắn `htmlFor`; ĐVT readonly có `aria-readonly="true"`.
- **Ref**: figma spec node `14854:93461` (form fields layout mặc định filled).

### Cluster B — Validate & Lưu

#### AC-3 → FE validate client-side + gọi mutation lưu

- **Khi**: user chỉnh field và bấm "Lưu" (button chỉ enable khi `form.formState.isValid === true` — xem AC-9 rule chi tiết).
- **FE phải**: chạy zod/RHF validate lần cuối → gọi `updateOpeningBalanceLine(id, input: { productCode, warehouseId, quantity, value, asOfDate })` (**KHÔNG gửi `mainUnitCode`** — server tự derive theo `productCode`, per SDL comment) → thành công: toast success "Đã lưu thay đổi" + invalidate query key `['opening-balance-list', ...]` + `navigate('/inventory/opening-balances')`.
- **State transition**: `ready → submitting` (button "Lưu" `isLoading`, disable cả 2 button) `→ success (navigate away)` hoặc `→ error` (giữ nguyên form, hiển thị lỗi theo §4.6 mapping).
- **Component**: `share/buttons/button` variant brand `isLoading`, `share/toasts/toast` (success).
- **GraphQL op**: `updateOpeningBalanceLine(id: Int!, input: UpdateOpeningBalanceLineInput!)` — W04-M3.
- **i18n keys**: N/A — fixed "Đã lưu thay đổi".
- **a11y**: submit button giữ `aria-busy="true"` khi submitting.
- **Ref**: `agg-garage-graph-graphql.md §3g.6` Mutation `updateOpeningBalanceLine` (Request/Response mẫu); anti-hallucination note: response KHÔNG có field `cascadedKeys` (khác `importOpeningBalances`) — FE chỉ refetch list, không hiển thị cascade audit chi tiết ở màn này.

#### AC-9 → FE validate trường bắt buộc + giá trị hợp lệ (inline, trước khi cho phép bấm Lưu)

- **Khi**: user gõ/chọn giá trị ở bất kỳ field nào (validate onChange + onBlur, `mode: "onChange"` RHF).
- **FE phải**: enforce zod schema — `productCode` required (chọn từ dropdown, không free-text), `warehouseId` required (int > 0), `quantity` required + `> 0` (cho phép số lẻ, `allowDecimal`), `asOfDate` required (ISO date hợp lệ), `value` optional — để trống tương đương `0`, không cho âm (`>= 0`). Field lỗi → hiển thị inline error message dưới field (per BR-OB-EDIT-006 client hint, xem §4.5). Button "Lưu" disable khi `!isValid`.
- **State transition**: `ready` (validate liên tục, không đổi phase, chỉ toggle `isValid`).
- **Component**: mỗi field input (`share/inputs/input-number`, `share/date-picker/date-picker`, `customs/select/*`) — dùng FormMessage tích hợp sẵn.
- **GraphQL op**: N/A (client-side only; server re-validate authoritative tại AC-3 submit — xem `ERR-INV-010/017/019/020/032/033` mapping §4.6).
- **i18n keys**: N/A — fixed message "Trường bắt buộc" / "Số lượng phải lớn hơn 0" / "Giá trị không được âm".
- **a11y**: error message liên kết `aria-describedby` với input tương ứng.
- **Ref**: `agg-garage-graph-graphql.md §3g.6` updateOpeningBalanceLine Error codes bảng (`ERR-INV-010/017/019/020/032/033`, BR-OB-EDIT-006).

### Cluster C — Huỷ bỏ / Điều hướng

#### AC-4 → FE huỷ bỏ, đóng form không lưu thay đổi

- **Khi**: user bấm "← Quay lại" (icon header) hoặc "Huỷ bỏ" (button).
- **FE phải**: `navigate('/inventory/opening-balances')` — không gọi mutation, không lưu bất kỳ thay đổi nào trong form (RHF state discard on unmount).
- **State transition**: `ready → (unmount)`.
- **Component**: `share/buttons/button` variant outline (Huỷ bỏ), icon-button ghost (Quay lại).
- **GraphQL op**: N/A (pure navigation).
- **i18n keys**: N/A — fixed "Huỷ bỏ".
- **a11y**: `aria-label="Huỷ bỏ sửa dòng tồn đầu kỳ"`.
- **Ref**: figma spec node `14854:93461` Header actions.

### Cluster D — Guardrail server-side (chặn khi lưu)

> 4 AC dưới đây là business rule enforce **authoritative ở BE** (`FEAT-OB-EDIT be/ §9`); FE chỉ hiển thị kết quả reject từ mutation `updateOpeningBalanceLine` — KHÔNG có validate tương đương ở client (không đủ dữ liệu để tính trước point-in-time cascade/lock-check).

#### AC-5 → FE hiển thị dialog chặn khi kỳ đã đóng (ngày cũ HOẶC ngày mới)

- **Khi**: mutation trả lỗi `ERR-INV-024` (BE check CẢ `asOfDate` cũ và mới per ADR-021 dual-date check).
- **FE phải**: mở `share/dialogs/alert-dialog` variant error, hiển thị message server nguyên văn (vd "Kỳ kế toán đã đóng"), giữ form nguyên trạng (không reset field) để user chỉnh lại ngày hoặc hủy.
- **State transition**: `submitting → error (dialog open)` → user đóng dialog → `ready`.
- **Component**: `share/dialogs/alert-dialog`.
- **GraphQL op**: response error `updateOpeningBalanceLine` — code `ERR-INV-024`.
- **i18n keys**: N/A.
- **a11y**: dialog `role="alertdialog"`, focus trap, `aria-labelledby`.
- **Ref**: `agg-garage-graph-graphql.md §3g.6` updateOpeningBalanceLine Error codes; ADR-021 §Phạm vi áp dụng "edit (kiểm tra CẢ ngày cũ VÀ ngày mới per FEAT-OB-EDIT AC-5)"; BR-OB-013.

#### AC-6 → FE hiển thị dialog chặn khi cascade làm tồn âm

- **Khi**: mutation trả lỗi `ERR-INV-036`.
- **FE phải**: mở `share/dialogs/alert-dialog` variant error, message server (vd "Thay đổi làm tồn kho âm tại một số thời điểm"), giữ nguyên form.
- **State transition**: cùng pattern AC-5.
- **Component**: `share/dialogs/alert-dialog`.
- **GraphQL op**: response error — code `ERR-INV-036`.
- **i18n keys**: N/A.
- **a11y**: cùng AC-5.
- **Ref**: BR-OB-015; ADR-020 invariant `closing_qty ≥ 0`.

#### AC-7 → FE hiển thị dialog chặn khi "Tồn đến ngày" sau phiếu đã ghi sổ

- **Khi**: mutation trả lỗi `ERR-INV-035`.
- **FE phải**: mở `share/dialogs/alert-dialog` variant error, message server (vd "Tồn đến ngày phải trước ngày phát sinh phiếu sớm nhất"), giữ nguyên form.
- **State transition**: cùng pattern AC-5.
- **Component**: `share/dialogs/alert-dialog`.
- **GraphQL op**: response error — code `ERR-INV-035`.
- **i18n keys**: N/A.
- **a11y**: cùng AC-5.
- **Ref**: BR-OB-016.

#### AC-8 → FE hiển thị dialog chặn khi (mã+kho) mới trùng dòng OB khác

- **Khi**: mutation trả lỗi `ERR-INV-034`.
- **FE phải**: mở `share/dialogs/alert-dialog` variant error, message server (vd "Mã sản phẩm + Kho đã tồn tại dòng tồn đầu kỳ khác"), giữ nguyên form để user đổi lại Sản phẩm hoặc Kho.
- **State transition**: cùng pattern AC-5.
- **Component**: `share/dialogs/alert-dialog`.
- **GraphQL op**: response error — code `ERR-INV-034`.
- **i18n keys**: N/A.
- **a11y**: cùng AC-5.
- **Ref**: BR-OB-012.

### Cluster E — Phân quyền & tenant

#### AC-10 → FE không có gating riêng theo persona; tenant scope tự động qua session

- **Khi**: chủ garage hoặc kế toán truy cập route `/inventory/opening-balances/:id/edit`.
- **FE phải**: KHÔNG có logic ẩn/hiện field/action theo persona — cả 2 role (`garage-owner`, `accountant`) có quyền sửa ngang nhau. Tenant scope tự động qua JWT/session (`X-Tenant-Id` header truyền BFF). Route chỉ gate theo feature-flag `Inventory:InventoryV2` (§4.4), KHÔNG gate theo persona.
- **Component**: TanStack Router `beforeLoad` guard (feature-flag only, giống `FEAT-OB-LIST`).
- **GraphQL op**: N/A (session-scoped server-side).
- **i18n keys**: N/A.
- **a11y**: N/A.
- **Ref**: BR-OB-CMN-002 (tenant isolation, enforce BE); §4.4 RBAC + feature flag.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave04-ob-edit.md` (node `14854:93461`, duy nhất state default filled-data). KHÔNG re-invent layout/spacing/color.
- Design tokens: `bg-brand` (nút "Lưu"), `text-foreground` (label + value), `text-muted-foreground` (placeholder + trailing icon select/date). Tokens MUST khớp bundle §G.Y "Design tokens referenced" — không hardcode hex/px.
- Icon library `iconsax-reactjs` (garage-web convention v7.6): `icon/back-arrow`, `icon/select-chevron`, `icon/calendar`.
- **Error/guardrail state chưa có Figma frame riêng** (xem `coverage_gaps`) — spec chọn `share/dialogs/alert-dialog` cho 4 guardrail (AC-5..AC-8) + inline `FormMessage` cho validate field (AC-9); cần xác nhận lại với design khi có frame bổ sung.

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | ready | submitting | success | error`. `error` có 2 sub-loại: **guardrail dialog** (AC-5..AC-8, blocking) và **field inline** (AC-9, non-blocking, disable Lưu).
- Error network/downstream (`TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` / `UNKNOWN_ERROR`, hoặc `ERR-CMN-007` khi lock-check unavailable — fail-CLOSED per ADR-021) → TOAST, giữ nguyên form.
- KHÔNG silent fail — mọi error reach UI qua dialog/toast/inline.

### 4.3 i18n + a11y

- **Fixed VN labels (KHÔNG dùng i18next)** — theo tiền lệ `FEAT-OB-LIST §4.3` + `FEAT-CAT-PROD-IMPORT §4.3` (wave Catalog W03). `i18n_keys: []`.
- Form field: `<label>` + `aria-describedby` cho error (RHF FormMessage tích hợp sẵn qua `share/inputs/*`).
- Dialog guardrail: `role="alertdialog"`, focus trap, `Escape` đóng.
- Button icon-only (Quay lại): `aria-label` mô tả rõ mục đích.
- Keyboard nav: Tab order Sản phẩm → Kho → Số lượng → Tồn đến ngày → Giá trị tồn → Huỷ bỏ → Lưu; `Enter` KHÔNG submit form khi focus trong date-picker popover (tránh submit nhầm).

### 4.4 RBAC render + feature flag

- Feature-flag `Inventory:InventoryV2` gate route `/inventory/opening-balances/:id/edit` qua TanStack Router `beforeLoad` (CR-20260707-02) — flag OFF → redirect.
- Persona check: chỉ 2 actor `garage-owner` + `accountant` (Critical Rule #6) — cả 2 có quyền sửa ngang nhau, KHÔNG có role-based hide/disable riêng.
- Route guard chạy TRƯỚC khi render UI component nào (loader-level).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE tier (xem paired `be/FEAT-OB-EDIT.md §9` khi được author). FE chỉ:
  - Inline validate 4 trường bắt buộc + ràng buộc giá trị cơ bản trước submit (BR-OB-CMN-002, AC-9) — hint UX, BE re-validate authoritative.
  - Disable button "Lưu" khi form invalid hoặc đang submitting.
  - Dialog/toast khi server reject với error code guardrail (AC-5..AC-8) — KHÔNG tự tính trước locked-period/negative-stock/duplicate ở client (không đủ dữ liệu point-in-time).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-CMN-not-found` | TOAST + auto-navigate về danh sách | toast global | AC-1 (id không tồn tại/đã xóa) |
| `ERR-INV-024` | DIALOG (blocking guardrail popup) | `share/dialogs/alert-dialog` | AC-5 |
| `ERR-INV-034` | DIALOG (blocking guardrail popup) | `share/dialogs/alert-dialog` | AC-8 |
| `ERR-INV-035` | DIALOG (blocking guardrail popup) | `share/dialogs/alert-dialog` | AC-7 |
| `ERR-INV-036` | DIALOG (blocking guardrail popup) | `share/dialogs/alert-dialog` | AC-6 |
| `ERR-INV-010` / `ERR-INV-017` / `ERR-INV-019` / `ERR-INV-020` / `ERR-INV-032` / `ERR-INV-033` | INLINE (field-level FormMessage) | field tương ứng (Sản phẩm/Kho/Số lượng/Giá trị) | AC-9 |
| `ERR-CMN-007` (503 — lock-check unavailable, fail-CLOSED) | TOAST | toast global | AC-3 |
| `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | TOAST | toast global | AC-3 |
| `UNKNOWN_ERROR` / `INTERNAL_ERROR` | TOAST | toast global | AC-3 |
| `FORBIDDEN_ERROR` (feature-flag OFF hoặc tenant mismatch) | REDIRECT (route guard, không toast) | TanStack Router `beforeLoad` | AC-10 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `OpeningBalanceEditPage` | `/inventory/opening-balances/:id/edit` | NEW | `14854:93461` (default filled-data — state duy nhất) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Author consult `.claude/references/web-component-registry.yaml` §1/§2 để biết component có sẵn ở priority cao nhất. 100% reuse ở feature này — không có build-new.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `customs/select/select-suggested-product` | `src/components/customs/select/select-suggested-product.tsx` | REUSE | `{ name: "productCode", label, onSelect }` (filter status Active — xem `coverage_gaps`) | RHF-bound + paginated load | **Priority 1 — customs/** (product suggest, đã build cho SO/quotation/PO line item) | AC-2, AC-3, AC-9 |
| `customs/select/warehouses-select-filter` | `src/components/customs/select/warehouses-select-filter.tsx` | REUSE | `{ value, onChange }` (adapt sang RHF `Controller`, xem `coverage_gaps`) | branch-scoped accumulated options | **Priority 1 — customs/** (đã build cho warehouse domain, reuse ở `FEAT-OB-LIST`) | AC-2, AC-3, AC-9 |
| `share/inputs/input-number` | `src/components/share/inputs/input-number.tsx` | REUSE | `{ name: "quantity", label, allowDecimal: true, min: 0 }` | RHF `Controller` | **Priority 2 — share/** (Số lượng tồn) | AC-2, AC-3, AC-9 |
| `share/inputs/input-number` | `src/components/share/inputs/input-number.tsx` | REUSE | `{ name: "value", label, prefix: "₫", allowNegative: false }` | RHF `Controller` | **Priority 2 — share/** (Giá trị tồn) | AC-2, AC-3, AC-9 |
| `share/date-picker/date-picker` | `src/components/share/date-picker/date-picker.tsx` | REUSE | `{ name: "asOfDate", label }` | RHF `Controller` | **Priority 2 — share/** (Tồn đến ngày) | AC-2, AC-3, AC-9 |
| `share/displays/description-item` | `src/components/share/displays/description-item.tsx` | REUSE | `{ label: "Đơn vị tính", value: mainUnitName }` | derived client-side (không nằm RHF schema) | **Priority 2 — share/** (ĐVT readonly, không phải form input thực sự) | AC-2 |
| `share/containers/section` | `src/components/share/containers/section.tsx` | REUSE | `{ title: "Thông tin tồn đầu kỳ" }` | — | **Priority 2 — share/** | AC-1, AC-2 |
| `share/layouts/page-header` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, backAction }` | — | **Priority 2 — share/** | AC-1 |
| `share/buttons/button` | `src/components/share/buttons/button.tsx` | REUSE | `variant`, `size`, `isLoading` | — | **Priority 2 — share/** (Lưu brand, Huỷ bỏ outline, Quay lại ghost icon) | AC-1, AC-3, AC-4 |
| `share/dialogs/alert-dialog` | `src/components/share/dialogs/alert-dialog.tsx` | REUSE | `{ open, variant: "error", title, description, onClose }` | controlled | **Priority 2 — share/** (guardrail popup AC-5..AC-8) | AC-5, AC-6, AC-7, AC-8 |
| `ui/form` | `src/components/ui/form.tsx` | REUSE | RHF `FormProvider` props | — | **Priority 3 — ui/** (RHF context root — không có share/customs wrapper cho toàn bộ form, primitive base cần thiết) | AC-2, AC-3, AC-9 |

### 5.3 Design tokens & Figma refs

> Design tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced" (anti-hallucination guard — reviewer item #21 check). Figma refs reference figma spec file paths, không chỉ node-id.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-brand` | `tailwind.config.js` (`@theme` custom) | Nút "Lưu" fill background | AC-3 |
| `text-foreground` | tokens | Label + giá trị field mặc định | AC-1, AC-2 |
| `text-muted-foreground` | tokens | Placeholder select + trailing chevron/calendar icon | AC-2 |
| `text-primary` | tokens | Nút "Lưu" label text (primary-foreground trên nền brand) | AC-3 |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo `Product/ux/figma-web/wave04-ob-edit.md`. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `updateOpeningBalanceLine` | mutation | `src/api/graphql/opening-balance/update-opening-balance-line.graphql` | invalidate `['opening-balance-list']` on success | `OpeningBalanceLineFragment` (response) | AC-3, AC-5, AC-6, AC-7, AC-8, AC-9 |

> **Cross-tier note (item #16)**: KHÔNG có query "get single OpeningBalanceLine" trong `agg-garage-graph-graphql.md §3g` — chỉ `searchOpeningBalances` (paged, không filter theo `id`) và `updateOpeningBalanceLine` (write). Prefill data ở AC-2 lấy từ router state/cache client-side (§6.3), KHÔNG phải 1 GraphQL query riêng của FEAT này.
> Dropdown "Sản phẩm nội bộ" / "Kho" dùng lại data-fetching **nội bộ đã có sẵn** trong `customs/select/select-suggested-product` / `customs/select/warehouses-select-filter` (component tự quản lý query riêng, không phải op mới của FEAT-OB-EDIT — không invent op name mới ở đây).

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| — | — | (none — mọi traffic qua BFF `agg-garage-graph`) | boundary isolation | — |

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Source data (prefill) | Router state + TanStack Query cache fallback | `OpeningBalanceEditPage` loader | (1) `location.state.line` (truyền từ `Link`/`navigate` ở `FEAT-OB-LIST`); (2) fallback `queryClient.getQueryData(['opening-balance-list', ...])` scan theo `id`; (3) miss cả 2 → render banner lỗi (xem `coverage_gaps`) | AC-1, AC-2 |
| Form state | react-hook-form + zod resolver | local `OpeningBalanceEditForm` | `{ productCode, warehouseId, quantity, value, asOfDate }` (ĐVT KHÔNG nằm schema) | AC-2, AC-3, AC-9 |
| Server state (mutation) | TanStack Query `useMutation` | — | `updateOpeningBalanceLine` | AC-3, AC-5-AC-8 |
| Dialog state | React local state | `OpeningBalanceEditPage` | `{ guardrailError: { code, message } \| null }` | AC-5, AC-6, AC-7, AC-8 |
| Optimistic UI | — | — | (không optimistic — chờ response trước khi navigate, do có guardrail server-side có thể reject) | — |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/opening-balances/:id/edit` | `OpeningBalanceEditPage` | `loader({ params, location }) => resolveSourceLine(location.state, queryClient, params.id)` (§6.3) | RBAC: `garage-owner \| accountant` + feature-flag `Inventory:InventoryV2` | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/routes/_modules/_inventory/opening-balances/$id/` | `edit.tsx` | NEW | TanStack Router file route | ~40 | AC-1 |
| `src/features/inventory-opening-balance/pages/` | `opening-balance-edit-page.tsx` | NEW | compose reuse components §5.2 | ~140 | AC-1, AC-2, AC-4 |
| `src/features/inventory-opening-balance/components/` | `opening-balance-edit-form.tsx` | NEW | RHF form (5 field + ĐVT readonly) | ~180 | AC-2, AC-3, AC-9 |
| `src/features/inventory-opening-balance/components/` | `opening-balance-guardrail-dialog.tsx` | NEW | `share/dialogs/alert-dialog` wrapper | ~30 | AC-5, AC-6, AC-7, AC-8 |
| `src/features/inventory-opening-balance/hooks/` | `use-update-opening-balance-line.ts` | NEW | TanStack `useMutation` wrapper | ~40 | AC-3 |
| `src/features/inventory-opening-balance/hooks/` | `use-opening-balance-line-source.ts` | NEW | router-state + query-cache fallback resolver (§6.3) | ~35 | AC-1, AC-2 |
| `src/features/inventory-opening-balance/schemas/` | `opening-balance-edit.schema.ts` | NEW | zod schema (AC-9) | ~25 | AC-9 |
| `src/features/inventory-opening-balance/types/` | `opening-balance.types.ts` | MODIFY (reuse từ `FEAT-OB-LIST`, add edit input type) | TypeScript types (mirror SDL) | ~15 | — |
| `src/api/graphql/opening-balance/` | `update-opening-balance-line.graphql` | ADDITIVE | persisted mutation | ~20 | AC-3 |
| `src/api/generated/` | `update-opening-balance-line.generated.ts` | AUTO-GEN | codegen | — | — |
| `tests/features/inventory-opening-balance/` | `opening-balance-edit-page.test.tsx` | NEW | Vitest + RTL | ~200 | AC-1-AC-10 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL §3g W04-M3 updateOpeningBalanceLine stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave04-ob-edit.md) + FEAT-OB-LIST AC-10 nav wiring done
    Exit: E2E happy path green (smoke) — mở form từ list → sửa 5 field → lưu thành công → về danh sách
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Form (5 field + ĐVT readonly) + guardrail dialog + routing + state + reuse-first gate | features + routes | BFF S5 stable + `FEAT-OB-LIST` list page done (source data nav) | E2E smoke green | BFF S5, `FEAT-OB-LIST` fe-web S6 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ:
> - Client-side validation hint cho trường bắt buộc + giá trị cơ bản (UX feedback trước submit).
> - RBAC-driven route gate (feature-flag).
> - Error code → display mode mapping (§4.6).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-CMN-002` | CORNERSTONE | Inline validate 4 trường bắt buộc + giá trị (SL>0, GT≥0) trước submit | `opening-balance-edit-form.tsx` (zod resolver) | AC-9 | BE final enforce (`ERR-INV-010/017/019/020/032/033`) |
| `BR-OB-013` | CORNERSTONE | Dialog chặn khi kỳ đóng (ngày cũ/mới) | `opening-balance-guardrail-dialog.tsx` | AC-5 | BE authoritative — dual-date check ADR-021 |
| `BR-OB-015` | CORNERSTONE | Dialog chặn khi cascade tồn âm | `opening-balance-guardrail-dialog.tsx` | AC-6 | BE authoritative — ADR-020 invariant |
| `BR-OB-016` | CORNERSTONE | Dialog chặn khi ngày sau phiếu đã ghi sổ | `opening-balance-guardrail-dialog.tsx` | AC-7 | BE authoritative |
| `BR-OB-012` | CORNERSTONE | Dialog chặn khi trùng (mã+kho) | `opening-balance-guardrail-dialog.tsx` | AC-8 | BE authoritative |
| `BR-OB-001` | NORMAL | Cấu trúc 6 field prefill đúng field OB | `opening-balance-edit-form.tsx` | AC-2 | Display-only |
| `BR-STKV2-001` | NORMAL | Cascade sổ tồn sau lưu (không hiển thị chi tiết cascade ở FE — chỉ refetch list) | (BE-only side effect) | AC-3 | Không có UI riêng cho cascade audit ở màn này |

> **Primary enforcement** = BE tier (`features/be/FEAT-OB-EDIT.md §9` khi được author).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | render header 3 action + section form |
| AC-2 | UI | test-ui | prefill 6 field đúng dữ liệu nguồn (mock router state) |
| AC-3 | UI (happy path submit) | test-ui | mutation call đúng payload (không có `mainUnitCode`) |
| AC-4 | UI (navigation) | test-ui | Huỷ bỏ/Quay lại không gọi mutation |
| AC-5 | UI (negative — guardrail) | test-ui | `ERR-INV-024` → dialog hiện, form giữ nguyên |
| AC-6 | UI (negative — guardrail) | test-ui | `ERR-INV-036` → dialog |
| AC-7 | UI (negative — guardrail) | test-ui | `ERR-INV-035` → dialog |
| AC-8 | UI (negative — guardrail) | test-ui | `ERR-INV-034` → dialog |
| AC-9 | UI (form validation) | test-ui | 4 trường bắt buộc + SL>0 + GT≥0, button Lưu disable |
| AC-10 | UI (RBAC visibility) | test-ui + test-isolation | dual persona ngang quyền + tenant scope |
| (smoke) | E2E happy path | test-e2e | Playwright: mở từ list → sửa 5 field → lưu → về danh sách thấy giá trị mới |

## 11. i18n & a11y

### 11.1 i18n keys

> KHÔNG áp dụng — fixed VN labels (KHÔNG dùng i18next), `i18n_keys: []` per §4.3. Toàn bộ label hardcode inline verbatim theo figma spec (vd "Sửa chi tiết tồn kho vật tư hàng hoá", "Sản phẩm nội bộ", "Kho", "Số lượng tồn", "Tồn đến ngày", "Giá trị tồn", "Đơn vị tính", "Huỷ bỏ", "Lưu").

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | H1 heading semantics cho tiêu đề; back icon-button `aria-label` | screen reader landmark |
| AC-2 | Mỗi field `<label>` + ĐVT readonly `aria-readonly="true"` | form semantics |
| AC-3 | Submit button `aria-busy="true"` khi submitting | loading feedback |
| AC-5-AC-8 | Dialog `role="alertdialog"` + focus trap + `Escape` đóng | guardrail popup |
| AC-9 | Error message `aria-describedby` liên kết field | inline validation |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-EDIT.md` | N-A (chưa author tại thời điểm spawn này) | BR primary enforcement (BR-OB-012/013/015/016/CMN-002), contract source `updateOpeningBalanceLine` downstream `PUT /api/v2/opening-balances/{id}` (`gf-inventory-api.md §3b.2 W04-5`) |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-EDIT.md` | N-A (chưa author tại thời điểm spawn này) | GraphQL op `updateOpeningBalanceLine` (§6.1) — SDL `agg-garage-graph-graphql.md §3g.1/§3g.6 W04-M3`, `warehouseId: Int!` canonical (v7.57 rename), `mainUnitCode` NOT in input (server auto-derive) |
| Mobile | N-A (feature web-only) | N-A | Mobile chỉ có `searchOpeningBalances` view-only (`agg-garage-graph-graphql.md §3g.4`); không có edit trên mobile |
| Sibling FEAT (out of scope, referenced) | `FEAT-OB-LIST` (fe-web tier, cùng wave) | DRAFT | Entry point AC-10 navigate sang route này với `state.line`; sau khi lưu thành công FE invalidate `['opening-balance-list']` cache của `FEAT-OB-LIST` |

**Source ID consistency** (item 18): `source_feat_sha` = `c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19` — PHẢI identical với BE/BFF files khi được author trong cùng wave.

## 13. References

- **Source**: [`Product/features/FEAT-OB-EDIT.md`](../../../../../Product/features/FEAT-OB-EDIT.md) v5
- **Paired BE**: [`features/be/FEAT-OB-EDIT.md`](../be/FEAT-OB-EDIT.md) (khi được author)
- **Paired BFF**: [`features/bff/FEAT-OB-EDIT.md`](../bff/FEAT-OB-EDIT.md) (khi được author)
- **Sibling FE**: [`features/fe-web/FEAT-OB-LIST.md`](FEAT-OB-LIST.md) (entry point nav)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md)
- **Figma spec**: [`Product/ux/figma-web/wave04-ob-edit.md`](../../../../../Product/ux/figma-web/wave04-ob-edit.md) (node `14854:93461`)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **API contract**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index W04 → §3g Opening Balance (§3g.1 SDL + §3g.6 `updateOpeningBalanceLine`)
- **ADR**: `ADR-020` (stock ledger point-in-time), `ADR-021` (lock-check advisory dual-date), `ADR-022` (OB write-path pattern)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-OB-EDIT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier — sẽ đối chiếu khi BE/BFF author), §2 trách nhiệm FE Web, §3 FE behaviour map 10/10 AC-ID (dedicated full-page route, không modal — reconcile với task hint ban đầu qua bundle authoritative), §4 visual fidelity + state + i18n (fixed VN, no i18next) + a11y + RBAC + BR secondary + error mapping (4 guardrail dialog AC-5..AC-8 + inline validate AC-9), §5-§11 FE-specific (route `/inventory/opening-balances/:id/edit` + component reuse §5.2 100% reuse priority customs>share>ui, không build-new + mutation `updateOpeningBalanceLine` `agg-garage-graph-graphql.md §3g.6 W04-M3` + cross-ref `FEAT-OB-LIST` cho nav entry/cache invalidate). Source FEAT chỉ audit. 6 coverage_gaps ghi nhận (route full-page vs modal hint reconcile, KHÔNG có GraphQL get-single query — giải pháp router state/cache fallback, component reuse prop compatibility 2 chỗ, ĐVT client-side derive risk, guardrail popup thiếu Figma frame). |
