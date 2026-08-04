---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-RECALC.md"
source_version: 21
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-RECALC"
source_feat_sha: "ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-PRC-RECALC"]
consumes_bff_feats: ["FEAT-PRC-RECALC"]
i18n_keys: []                                          # KHÔNG dùng i18next — fixed VN labels (mirror precedent W04/W05, PKG-W06 không có override i18n riêng — xem §4.3)
screens_touched: ["src/features/inventory-price-calc-runs/pages/price-calc-run-detail-page.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-prc-detail.md (node 13575:103113 — PageHeader, 2 nút 'Tính lại toàn bộ' + 'Tính lại mã lỗi'; RECALC KHÔNG có screen/modal riêng — hành động nằm trên host screen FEAT-PRC-DETAIL, xem §0 note)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-RECALC (FE Web): Tính lại giá xuất kho

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.
>
> **Ghi chú vị trí UI**: FEAT-PRC-RECALC **không có screen/modal riêng**. 2 hành động "Tính lại toàn bộ" / "Tính lại mã lỗi" là 2 nút trong `PageHeader` của màn **FEAT-PRC-DETAIL** (`/inventory/price-calc-runs/:id`). Bundle §G.Y báo "FIGMA SPEC MISSING" cho glob `wave06-prc-recalc*.md` vì đúng — không có frame Figma riêng cho RECALC; spec này cite trực tiếp node của 2 nút trong `wave06-prc-detail.md` (host screen, đã ACTIVE, transform_version 8).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-RECALC` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/inventory-price-calc-runs/pages/price-calc-run-detail-page.tsx` (MODIFY — shared file với be/FEAT-PRC-DETAIL fe-web tier) |
| Cross-tier consume | BE: `FEAT-PRC-RECALC` \| BFF: `FEAT-PRC-RECALC` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-RECALC` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-RECALC.md`](../../../../../Product/features/FEAT-PRC-RECALC.md) |
| Source version | v21 |
| Source SHA | `ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f` |
| Generated at | 2026-07-31T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần tính lại giá vốn cho một lần tính PRC đã có, khi dữ liệu đầu vào phát sinh thay đổi sau khi lần tính gốc đã hoàn tất (vd phiếu nhập/xuất bổ sung, sửa dữ liệu tồn). Tính năng cho phép chọn tính lại toàn bộ mã hoặc chỉ những mã đang lỗi, đảm bảo giá vốn phiếu xuất và giá trị sổ tồn được cập nhật đúng mà không mất dấu vết audit của lần tính gốc. Feature nằm ở cuối vòng đời một lần tính giá xuất kho BQGQ — tiếp nối FEAT-PRC-CREATE/FEAT-PRC-DETAIL, cung cấp đường sửa sai khi phát hiện dữ liệu đầu vào chưa chuẩn.

## 2. Trách nhiệm FE Web (garage-web)

- Wire 2 nút hành động **"Tính lại toàn bộ"** (AC-1) và **"Tính lại mã lỗi"** (AC-1b) đã tồn tại trong `PageHeader` của màn `FEAT-PRC-DETAIL` — trigger mutation kick-off tương ứng, KHÔNG dựng screen/modal mới.
- User flow: bấm nút → gọi mutation → nhận `runId` mới (202-equivalent qua GraphQL) → toast xác nhận + điều hướng sang trang chi tiết của **lần chạy mới** (`/inventory/price-calc-runs/{newRunId}`) → màn DETAIL (be/FEAT-PRC-DETAIL fe-web tier) tiếp quản polling + render bảng cập nhật tại chỗ (AC-2b).
- State machine nút: `idle → loading (isLoading trên Button) → success (toast + navigate) / error (dialog/alert theo mã lỗi)`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: cả 2 nút RECALC tái dùng nguyên `share/buttons/button` đã render trên PageHeader host screen; chặn lỗi tái dùng `share/dialogs/alert-dialog`; xác nhận thành công tái dùng `share/toasts/toast`. KHÔNG build-new component cho RECALC (§5.2).
- **Figma spec là visual SSOT**: 2 nút + vị trí layout theo `wave06-prc-detail.md` node `13575:103113` (PageHeader) — xem §4.1/§5.
- GraphQL mutation consume từ BFF: `recalcPriceCalcRun(id, input: { runScope })` — trả `PriceCalcRunKickoff` (§6.1).
- RBAC render: KHÔNG có gating theo persona — `garage-owner` và `accountant` thấy + bấm được cả 2 nút như nhau (AC-5, BR-AP-CMN-002).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 8/8 AC-ID nguồn — 6 entry đầy đủ + 2 khai báo N/A/light theo phạm vi FE thực tế (rendering owned bởi paired DETAIL tier).

### Cluster A — Trigger tính lại (PageHeader, 2 nút)

#### AC-1 → Nút "Tính lại toàn bộ" (scope ALL)

- **Khi**: user (garage-owner/accountant) bấm nút **"Tính lại toàn bộ"** trên PageHeader của `FEAT-PRC-DETAIL`.
- **FE phải**: gọi mutation `recalcPriceCalcRun(id: currentRunId, input: { runScope: ALL })`; disable cả 2 nút trong lúc gọi (`isLoading`); on success: nhận `{runId (mới), sourceRunId, status: PENDING, pollingUrl, pollingIntervalHint, affectedSubsequentPeriods[]}` → toast "Đã bắt đầu tính lại" (`share/toasts/toast` variant success) → nếu `affectedSubsequentPeriods.length > 0`, hiện thêm cảnh báo non-blocking liệt kê các kỳ sau cần chạy lại (BR-PRC-015, §4.5) → điều hướng (`router.navigate({ replace: true })`) sang `/inventory/price-calc-runs/{runId mới}`.
- **State transition**: idle → loading (button spinner) → success (toast + navigate) / error (xem AC-3/AC-3b).
- **Component**: `share/buttons/button` (REUSE, đã có trên host screen — `btn_recalc_all`, figma node `I13575:103113;17421:80006`).
- **GraphQL op**: mutation `recalcPriceCalcRun` — input `PriceCalcRunRecalcInput { runScope: PriceCalcRunScope! }`; output `PriceCalcRunKickoffApiResponse` (§6.1).
- **i18n**: fixed VN label "Tính lại  toàn bộ" (verbatim Figma — 2 khoảng trắng giữa "lại" và "toàn", xem `wave06-prc-detail.md` §1 `btn_recalc_all._png_verified`), toast "Đã bắt đầu tính lại".
- **a11y**: button có `aria-busy` khi loading; giữ focus trên button sau khi disable, không tự mất focus.
- **Ref**: paired BFF `FEAT-PRC-RECALC.md §6.1` op `recalcPriceCalcRun`; Figma `wave06-prc-detail.md` node `13575:103113`.

#### AC-1b → Nút "Tính lại mã lỗi" (scope ERROR_ONLY)

- **Khi**: lần tính hiện tại có ít nhất 1 mã trạng thái "Lỗi" (`run.itemsErrorCount > 0`) và user bấm nút **"Tính lại mã lỗi"**.
- **FE phải**: **hide/disable** nút này khi `run.itemsErrorCount === 0` (per Figma `_state_note` trên `btn_recalc_error_only`: "ẩn/disable khi lần tính không có mã Lỗi"); khi bấm → gọi mutation `recalcPriceCalcRun(id: currentRunId, input: { runScope: ERROR_ONLY })`; cùng luồng success/error/navigate như AC-1 (mã "Đã tính" giữ nguyên — BE xử lý, FE không cần lọc lại phía client).
- **State transition**: idle → loading → success (toast + navigate) / error.
- **Component**: `share/buttons/button` (REUSE — `btn_recalc_error_only`, figma node `I13575:103113;17421:80016`, variant `outline`).
- **GraphQL op**: mutation `recalcPriceCalcRun` — input `{ runScope: ERROR_ONLY }`.
- **i18n**: fixed VN label "Tính lại mã lỗi " (verbatim Figma, có 1 space cuối).
- **a11y**: `aria-disabled` + `title`/tooltip giải thích lý do disable khi `itemsErrorCount === 0` ("Không có mã lỗi để tính lại").
- **Ref**: paired BFF `FEAT-PRC-RECALC.md §6.1` op `recalcPriceCalcRun`; Figma `wave06-prc-detail.md` node `I13575:103113;17421:80016`.

#### AC-5 → Phân quyền — không gating theo role

- **Khi**: màn `FEAT-PRC-DETAIL` render cho user role `garage-owner` hoặc `accountant`.
- **FE phải**: hiển thị cả 2 nút RECALC như nhau cho cả 2 persona — KHÔNG check role trước khi render/enable (khác các feature có RBAC hide-button khác trong hệ thống). Chỉ áp dụng auth guard chung ở route-level (đăng nhập hợp lệ), không thêm permission-check riêng cho RECALC.
- **Component**: không có component RBAC riêng — absence-of-gating là behavior cần test (test-isolation dual persona, §10).
- **Ref**: BR-AP-CMN-002.

### Cluster B — Kết quả sau khi tính lại (rendering owned bởi be/FEAT-PRC-DETAIL fe-web tier)

#### AC-2 → Ghi đè kết quả (FE touch: quan sát kết quả trên trang mới)

- Sau khi điều hướng sang `/inventory/price-calc-runs/{runId mới}` (AC-1/AC-1b), FE **không tự render lại kết quả** — trang DETAIL (be/FEAT-PRC-DETAIL fe-web tier, cùng file `price-calc-run-detail-page.tsx`) chịu trách nhiệm fetch + hiển thị `RunInfoGrid` (người thực hiện/ngày giờ/scope/trạng thái phản ánh lần chạy gần nhất) + bảng chi tiết đã cập nhật giá vốn/giá trị tồn. RECALC chỉ đảm bảo route param `id` đúng `runId` mới trả về từ kick-off response.
- **Ref**: xem `features/be/FEAT-PRC-DETAIL.md` §3 (nếu đã author) hoặc `features/fe-web/FEAT-PRC-DETAIL.md` §3 cho phần render RunInfoGrid + DetailTable.

#### AC-2b → Chạy nền — ghi đè tại chỗ (FE touch: retarget polling sang runId mới)

- Ngay sau kick-off thành công, FE bắt đầu polling `priceCalcRunGet(id: runId mới, includeItems: true)` mỗi 5000ms (`pollingIntervalHint` từ response, hard-coded 5000ms theo AC-2c của `FEAT-PRC-DETAIL`) — **tái dùng nguyên cơ chế polling + incremental table update đã spec ở be/FEAT-PRC-DETAIL fe-web tier**; RECALC không viết logic polling riêng, chỉ đảm bảo polling target đúng `runId` mới (không phải `runId` cũ đang xem trước khi bấm nút).
- **Ref**: `features/fe-web/FEAT-PRC-DETAIL.md §6.1` (polling query + TanStack refetchInterval).

#### AC-4 → N/A (rendering owned bởi be/FEAT-PRC-DETAIL fe-web tier)

- Cột "Trạng thái" (badge "Lỗi") + "Lí do lỗi" trong bảng chi tiết là UI đã tồn tại sẵn trên màn DETAIL (áp dụng cho cả CREATE lẫn RECALC vì cùng 1 bảng). RECALC không thêm cột/UI mới cho việc hiển thị mã lỗi — chỉ trigger việc tính lại rồi để DETAIL tier render kết quả. Xem `features/fe-web/FEAT-PRC-DETAIL.md §3` (nếu đã author) cho phần render 3 lý do lỗi (`ERR-INV-030/031/052`).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-prc-detail.md` (host screen, node `13575:103113` — PageHeader) cho vị trí, kích thước, màu sắc 2 nút. KHÔNG re-invent layout — RECALC không có frame riêng, không được tự vẽ modal/dialog xác nhận nếu Figma không có (đã verify: không có state frame "confirm" nào trong `wave06-prc-detail.md`).
- Design tokens (khớp `wave06-prc-detail.md`):
  - Nút "Tính lại toàn bộ": `bg-[#0052ff]` (primary), `text-white`, `shadow-base`, `h-40 px-32`.
  - Nút "Tính lại mã lỗi": `bg-background` (`#ffffff`), border `border-input` (`#d4d4d8`), `text-[#18181b]`, `shadow-sm`, `h-40 px-32`.
- Responsive: PageHeader width cố định trong `Page container` 1280px desktop-first (theo host screen) — không có breakpoint mobile riêng cho RECALC (web-only per PKG scope).

### 4.2 State machine + error handling

- `idle | loading | success | error` cho mỗi lần bấm nút. `loading` = disable cả 2 nút (tránh double-submit / race giữa 2 scope).
- Error → render theo `display mode` per §4.6 (INLINE_FORM/DIALOG tuỳ mã lỗi) — KHÔNG silent fail.
- Idempotency: FE sinh `clientNonce` (UUID) mỗi lần user bấm nút, dùng cho `X-Idempotency-Key: PRC-RECALC-{runId}-{clientNonce}` (per ADR-028 §1) — tránh double-trigger khi user double-click nhanh trước khi UI kịp disable.

### 4.3 i18n + a11y

- **i18n policy**: fixed VN labels inline — KHÔNG dùng i18next (`i18n_keys: []` frontmatter). Không có evidence override khác cho W06 trong PKG; mirror precedent các feature khác cùng wave (PRC/Stock-V2 100% VN labels quan sát trong `wave06-prc-detail.md`).
- a11y: 2 button có `aria-label` trùng label hiển thị (đã có text, không icon-only); Tab order: back-arrow → "Tính lại mã lỗi" → "Tính lại toàn bộ" (theo thứ tự DOM trái→phải trong `header_action_group`); dialog lỗi (AC-3/AC-3b) trap focus + `Escape` đóng, focus trả về button vừa bấm.

### 4.4 RBAC render + feature flag

- Feature flag gate `Inventory:InventoryV2` áp tại BE — BFF forward bình thường, BE trả 403 khi flag off → BFF map `FORBIDDEN_ERROR` → FE hiển thị theo `ERR-CMN-*` chung (không có mã riêng cho case này trong registry — dùng fallback `ERR-CMN-007` TOAST nếu 403 xảy ra ngoài luồng dự kiến).
- Persona check: KHÔNG gate theo role (AC-5) — chủ garage + kế toán quyền ngang nhau.
- Route gate: kế thừa auth guard chung của route `/inventory/price-calc-runs/:id` (đã có ở DETAIL tier) — RECALC không thêm guard riêng.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-PRC-RECALC.md §9`). FE chỉ:
  - **BR-PRC-008** (chặn RECALC khi kỳ đóng): inline banner qua `share/dialogs/alert-dialog` khi BE trả `ERR-INV-024` (§4.6).
  - **BR-PRC-016** (chặn chạy trùng kỳ+kho): dialog block qua `share/dialogs/alert-dialog` khi BE trả `ERR-INV-029` (§4.6); FE **không** tự đoán trạng thái trùng phía client — chỉ phản ứng theo response, ngoại trừ 1 optimization: disable cả 2 nút proactively nếu `run.status ∈ {PENDING, RUNNING}` của chính lần tính đang xem (hiển nhiên không tính lại 1 job đang chạy).
  - **BR-PRC-015** (kỳ sau cần tính lại): render `affectedSubsequentPeriods[]` (non-blocking warning panel/toast, KHÔNG chặn) sau kick-off thành công — mỗi phần tử cho phép deep-link "Xem chi tiết" (`lastRunId`) qua `share/navigates/link`; user tự bấm RECALC cho từng kỳ liệt kê (không auto-cascade).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-024` | INLINE_FORM (không có form trên trang → render qua `share/dialogs/alert-dialog`, biến thể `warning`, block cho tới khi user đóng — closest-fit vì registry KHÔNG có component banner độc lập ngoài form) | `share/dialogs/alert-dialog` | AC-3 |
| `ERR-INV-029` | DIALOG | `share/dialogs/alert-dialog` (biến thể `error`) | AC-3b |
| `ERR-INV-030` / `ERR-INV-031` / `ERR-INV-052` | INLINE_FORM / INLINE_WARNING (per-item, render trong bảng chi tiết — **không phải lỗi trigger của RECALC**) | rendering owned bởi `features/fe-web/FEAT-PRC-DETAIL.md` — xem AC-4 | AC-4 |

> Component gap ghi nhận: registry không có component "banner/alert cạnh page header ngoài form" — dùng `share/dialogs/alert-dialog` cho cả `ERR-INV-024` (INLINE_FORM) lẫn `ERR-INV-029` (DIALOG) làm closest-fit reuse (KHÔNG build-new). Nếu reviewer/BA muốn banner non-modal riêng, cần `/allow-new-component` — ngoài phạm vi RECALC tự quyết.

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `PriceCalcRunDetailPage` (shared với be/FEAT-PRC-DETAIL) | `/inventory/price-calc-runs/:id` | MODIFY (wire 2 nút RECALC — không route mới) | `wave06-prc-detail.md` node `13575:103113` (PageHeader) | AC-1, AC-1b, AC-3, AC-3b, AC-5 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Component Inventory KG `implementation.components` rỗng — author dùng canonical `.claude/references/web-component-registry.yaml` (đã đọc trực tiếp; registry này REPLACE KG cho UI reuse lookup của garage-web) thay vì scan filesystem tay.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `Button` (2 instance, đã có trên host screen) | `src/components/share/buttons/button.tsx` | REUSE | `variant`, `size=lg`, `isLoading`, `onClick` | `idle/loading` local | **Priority 2 — share/** (`share/buttons/button`, lookup key `primary-button`; đã render sẵn trên PageHeader FEAT-PRC-DETAIL — RECALC chỉ wire `onClick`, không tạo instance mới) | AC-1, AC-1b, AC-5 |
| `AlertDialog` | `src/components/share/dialogs/alert-dialog.tsx` | REUSE | `variant: warning \| error`, `title`, `description`, `onClose` | `open/closed` | **Priority 2 — share/** (`share/dialogs/alert-dialog`, lookup key `alert-dialog` — closest-fit cho `ERR-INV-024`/`ERR-INV-029`, không có banner-only component trong registry) | AC-3, AC-3b |
| `Toast` | `src/components/share/toasts/toast.tsx` | REUSE | `variant: success`, `message` | auto-dismiss | **Priority 2 — share/** (`share/toasts/toast`, lookup key `toast-notification`) | AC-1, AC-1b |
| `Link` (deep-link kỳ sau bị ảnh hưởng) | `src/components/share/navigates/link.tsx` | REUSE | `to`, `params` | — | **Priority 2 — share/** (`share/navigates/link`, lookup key `link`) | AC-1, AC-1b (BR-PRC-015 panel) |

> Không có build-new component — cả 3 layer (`customs/`, `share/`, `ui/`) đã cover đủ nhu cầu RECALC sau khi scan `.claude/references/web-component-registry.yaml` §1/§2.

### 5.3 Design tokens & Figma refs

> Tokens khớp `wave06-prc-detail.md` (frame `13575:103113` PageHeader) — đã verify trực tiếp trong file spec, không suy đoán.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-[#0052ff]` | `wave06-prc-detail.md` `btn_recalc_all.BG` | nút "Tính lại toàn bộ" primary fill | AC-1 |
| `border-input` (`#d4d4d8`) | `wave06-prc-detail.md` `btn_recalc_error_only.Border` | nút "Tính lại mã lỗi" outline border | AC-1b |
| `bg-background` (`#ffffff`) | `wave06-prc-detail.md` `btn_recalc_error_only.BG` | nút "Tính lại mã lỗi" fill | AC-1b |
| `text-foreground` (`#18181b`) | `wave06-prc-detail.md` §Icon Catalog / text style chung | text nút "Tính lại mã lỗi" | AC-1b |
| `shadow-base` / `shadow-sm` | `wave06-prc-detail.md` `btn_recalc_all.Shadow` / `btn_recalc_error_only.Shadow` | button elevation | AC-1, AC-1b |

> **Figma source-of-truth**: `Product/ux/figma-web/wave06-prc-detail.md` — RECALC không có spec riêng vì hành động nằm trên host screen DETAIL.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `recalcPriceCalcRun` | mutation | `src/features/inventory-price-calc-runs/api/recalc-price-calc-run.graphql` | — (mutation) | `PriceCalcRunKickoffFragment` | AC-1, AC-1b |
| `priceCalcRunGet` (reused từ DETAIL tier, không viết lại) | query | `src/features/inventory-price-calc-runs/api/get-price-calc-run.graphql` (owned bởi be/FEAT-PRC-DETAIL fe-web tier) | `['price-calc-run', newRunId]` | `PriceCalcRunDetailFragment` | AC-2, AC-2b |

> `recalcPriceCalcRun` op name + `PriceCalcRunRecalcInput`/`PriceCalcRunKickoff` types theo ADR-028 §1 Client contract (bundle §F) + `agg-garage-graph-graphql.md §3f` Naming Registry (`gf-accounting-api.md §6.2`). Phải tồn tại ở paired BFF `features/bff/FEAT-PRC-RECALC.md §6.1` (reviewer item #16 enforce).

### 6.2 REST endpoints consumed direct (bypass BFF)

- Không có — RECALC luôn qua BFF passthrough (`POST /api/v2/price-calc-runs/{id}/recalc`, W06-4), không gọi REST `gf-accounting` trực tiếp từ FE.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Mutation state (RECALC kick-off) | TanStack Mutation | `src/features/inventory-price-calc-runs/hooks/use-recalc-price-calc-run.ts` | `useMutation({ mutationKey: ['recalc-price-calc-run'] })` | AC-1, AC-1b |
| Idempotency clientNonce | local `useRef`/`crypto.randomUUID()` | trong hook mutation, không persist store | — | AC-1, AC-1b |
| Server state (run detail, sau navigate) | TanStack Query (owned bởi DETAIL tier) | — | `['price-calc-run', runId]` | AC-2, AC-2b |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/price-calc-runs/:id` (đã tồn tại, KHÔNG route mới) | `PriceCalcRunDetailPage` | `loader({ params }) => prefetch priceCalcRunGet(params.id)` (owned DETAIL tier) | auth chung | AC-1, AC-1b |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`. Đa số file thuộc slice `inventory-price-calc-runs` được share với be/FEAT-PRC-DETAIL fe-web tier (screen chính, xem §12) — bảng dưới chỉ liệt kê phần RECALC sở hữu/thêm mới.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-price-calc-runs/hooks/` | `use-recalc-price-calc-run.ts` | NEW | TanStack mutation wrapper + idempotency key gen | ~40 | AC-1, AC-1b |
| `src/features/inventory-price-calc-runs/api/` | `recalc-price-calc-run.graphql` | NEW | persisted mutation doc | ~15 | AC-1, AC-1b |
| `src/features/inventory-price-calc-runs/pages/` | `price-calc-run-detail-page.tsx` | MODIFY (wire 2 `onClick` + dialog state — file owned chính bởi be/FEAT-PRC-DETAIL fe-web tier) | reuse `share/buttons/button` + `share/dialogs/alert-dialog` + `share/toasts/toast` | ~60 (delta) | AC-1, AC-1b, AC-3, AC-3b, AC-5 |
| `src/features/inventory-price-calc-runs/types/` | `price-calc-run-recalc.types.ts` | NEW | TypeScript types (input/kickoff) | ~20 | — |
| `tests/features/inventory-price-calc-runs/` | `price-calc-run-recalc.test.tsx` | NEW | Vitest + RTL — 2 button click, block dialogs, toast, navigate | ~180 | AC-1, AC-1b, AC-3, AC-3b, AC-5 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver stable — recalcPriceCalcRun mutation)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + be/FEAT-PRC-DETAIL fe-web tier S6 (page + polling) đã có
    Exit: E2E happy path green (smoke — bấm nút → toast → navigate → polling chạy trên trang mới)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Wire 2 nút RECALC + mutation hook + error dialogs + navigate | features/inventory-price-calc-runs | BFF S5 stable + DETAIL page tồn tại | E2E smoke green | BFF S5, be/FEAT-PRC-DETAIL fe-web tier S6 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-008` | CORNERSTONE | `alert-dialog` warning khi BE trả `ERR-INV-024` (kỳ đóng) | `pages/price-calc-run-detail-page.tsx::onRecalcError` | AC-3 | BE final enforce (kickoff-time check) |
| `BR-PRC-016` | CORNERSTONE | `alert-dialog` block khi BE trả `ERR-INV-029` (chạy trùng kỳ+kho) + proactive disable khi `run.status ∈ {PENDING,RUNNING}` | `pages/price-calc-run-detail-page.tsx::onRecalcError` | AC-3b | BE final enforce; FE proactive-disable chỉ optimization UX |
| `BR-PRC-015` | NORMAL | non-blocking warning panel liệt kê `affectedSubsequentPeriods[]` sau kick-off thành công | `pages/price-calc-run-detail-page.tsx::onRecalcSuccess` | AC-1, AC-1b | user tự bấm RECALC từng kỳ sau, KHÔNG auto-cascade |
| `BR-AP-CMN-002` | CORNERSTONE | KHÔNG hide/disable nút theo role — cả 2 persona quyền ngang nhau | `pages/price-calc-run-detail-page.tsx` | AC-5 | absence-of-gating là behavior cần test |

> **Primary enforcement** = BE tier (`features/be/FEAT-PRC-RECALC.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | bấm "Tính lại toàn bộ" → mutation call đúng input `{runScope: ALL}` → toast + navigate |
| AC-1b | UI (conditional visibility) | test-ui | button disable/hide khi `itemsErrorCount=0`; bấm khi có mã lỗi → input `{runScope: ERROR_ONLY}` |
| AC-2 | UI (integration — quan sát render) | test-ui | sau navigate, trang mới hiển thị RunInfoGrid cập nhật (delegate DETAIL tier) |
| AC-2b | UI (polling reuse) | test-ui | polling target đúng `runId` mới, không polling `runId` cũ |
| AC-3 | UI (negative — kỳ đóng) | test-ui | mock `ERR-INV-024` → `alert-dialog` hiển thị, cả 2 nút vẫn clickable lại sau đóng dialog |
| AC-3b | UI (negative — chạy trùng) | test-ui | mock `ERR-INV-029` → dialog block; proactive-disable khi `run.status=RUNNING` |
| AC-5 | UI (RBAC visibility) | test-ui + test-isolation | dual persona (garage-owner/accountant) đều thấy + bấm được 2 nút |
| (smoke) | E2E happy path | test-e2e | Playwright: bấm "Tính lại toàn bộ" → toast → điều hướng → bảng chi tiết cập nhật sau polling |

## 11. i18n & a11y

### 11.1 i18n keys

> `i18n_keys: []` — fixed VN labels, không dùng i18next cho wave này (xem §4.3).

| Key | vi | en | AC ref |
|---|---|---|---|
| — (fixed inline) | "Tính lại  toàn bộ" | n/a | AC-1 |
| — (fixed inline) | "Tính lại mã lỗi " | n/a | AC-1b |
| — (fixed inline) | "Đã bắt đầu tính lại" | n/a | AC-1, AC-1b |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1, AC-1b | `aria-busy` khi loading; giữ focus trên button | manual QA |
| AC-1b | `aria-disabled` + tooltip lý do disable khi không có mã lỗi | screen reader announce |
| AC-3, AC-3b | Dialog trap focus + `Escape` đóng + focus trả về button | keyboard nav |
| AC-1, AC-1b | Toast announce qua `aria-live="polite"` | screen reader |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-RECALC.md` | DRAFT (đang author song song) | BR primary enforcement, contract source (`POST /api/v2/price-calc-runs/{id}/recalc`) |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-RECALC.md` | DRAFT (đang author song song) | GraphQL op `recalcPriceCalcRun` consumed (§6.1) |
| Mobile | N/A | N/A | PRC web-only per PKG-W06 scope (`garage-mobile` chỉ có `FEAT-STK-LIST-V2`) |
| FE-web (host screen) | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-DETAIL.md` | chưa xác nhận trạng thái tại thời điểm author | **Shared file ownership**: `pages/price-calc-run-detail-page.tsx` — DETAIL tier sở hữu screen chính (RunInfoGrid, FilterBar, DetailTable, polling); RECALC chỉ thêm 2 `onClick` handler + dialog state trên cùng file. Cần đồng bộ khi cả 2 spec cùng impl để tránh merge conflict logic. |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/BFF (Mobile N/A cho feature này).

## 13. References

- **Source**: [`Product/features/FEAT-PRC-RECALC.md`](../../../../../Product/features/FEAT-PRC-RECALC.md) v21
- **Paired BE**: [`features/be/FEAT-PRC-RECALC.md`](../be/FEAT-PRC-RECALC.md)
- **Paired BFF**: [`features/bff/FEAT-PRC-RECALC.md`](../bff/FEAT-PRC-RECALC.md)
- **Host screen (DETAIL)**: [`features/fe-web/FEAT-PRC-DETAIL.md`](../fe-web/FEAT-PRC-DETAIL.md) (nếu đã author)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC)
- **Figma host screen**: [`Product/ux/figma-web/wave06-prc-detail.md`](../../../../../Product/ux/figma-web/wave06-prc-detail.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **Error code registry**: [`Product/Commons/ERROR-CODE-REGISTRY.md`](../../../../../Product/Commons/ERROR-CODE-REGISTRY.md) §4 (`ERR-INV-024/029/030/031/052`)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **ADR**: `ADR-027` (PRC engine), `ADR-028` (Temporal + client contract §1)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-PRC-RECALC` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map per AC-ID (8/8 covered — 6 full + 2 light/N-A citing paired be/FEAT-PRC-DETAIL fe-web tier), §4 visual fidelity + state + i18n + a11y + RBAC + BR secondary + error mapping, §5-§12 FE-specific. Đặc thù feature: RECALC không có screen/modal riêng — 2 nút trigger nằm trên host screen FEAT-PRC-DETAIL PageHeader; figma_refs cite trực tiếp `wave06-prc-detail.md` (node `13575:103113`) thay vì FIGMA SPEC MISSING placeholder vì tìm được evidence cụ thể trên host screen. `consumes_bff_feats` sửa từ `[]` (context bundle add_fields mặc định) → `["FEAT-PRC-RECALC"]` vì feature rõ ràng có BFF touchpoint (mutation `recalcPriceCalcRun`) — xem decision log. |
