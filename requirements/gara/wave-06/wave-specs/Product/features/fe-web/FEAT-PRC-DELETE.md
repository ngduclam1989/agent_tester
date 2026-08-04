---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-DELETE.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-DELETE"
source_feat_sha: "8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f"
generated_at: "2026-07-31T08:20:00Z"
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
consumes_backend_feats: ["FEAT-PRC-DELETE"]
consumes_bff_feats: ["FEAT-PRC-DELETE"]
i18n_keys: []
screens_touched: []
figma_refs:
  - "Product/ux/figma-web/wave06-prc-delete.md (node 14507:89269 — 2 dialog states: Screen 1 'Dialog xác nhận xóa' 13575:222590/222692, Screen 2 'Dialog chặn xóa' 13575:222693/222795)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "not-computed — no shasum tool available in author session"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-DELETE.fe-web.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-DELETE (FE Web): Xóa khoản mục lịch sử tính giá

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DELETE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | Không có route riêng — component modal mount trong route của `FEAT-PRC-LIST` ("Lịch sử tính giá") |
| Cross-tier consume | BE: `FEAT-PRC-DELETE` \| BFF: `priceCalcRunDelete` (verified verbatim `agg-garage-graph-graphql.md` — chưa có tier file BFF riêng cho wave này, xem §12) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-DELETE.md`](../../../../../Product/features/FEAT-PRC-DELETE.md) |
| Source version | v7 |
| Source SHA | `8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f` |
| Generated at | 2026-07-31T08:20:00Z |

## 1. Mục đích nghiệp vụ

Sau khi chạy tính giá xuất kho BQGQ (CREATE/RECALC), garage cần dọn dẹp lịch sử tính giá khi có log dư thừa hoặc tính nhầm, để danh sách log gọn gàng và dễ tra cứu. Thao tác xóa chỉ xóa bản ghi lịch sử (soft-delete) — hệ thống tuyệt đối không tự động đảo giá vốn đã điền vào phiếu xuất, tránh gây sai lệch dữ liệu kế toán ngoài ý muốn. Để bảo vệ tính toàn vẹn số liệu đã chốt, hệ thống chặn xóa khi kỳ kế toán liên quan đã đóng hoặc khi log đang trong trạng thái tính toán dở dang. Chủ garage và kế toán có quyền thao tác ngang nhau.

## 2. Trách nhiệm FE Web (garage-web)

- **Modal 2 trạng thái, không phải route riêng**: FE cung cấp 1 modal dialog (dùng chung 1 component, 2 biến thể props) mount từ row-action "icon Xóa" trên bảng lịch sử tính giá (thuộc `FEAT-PRC-LIST`, ngoài phạm vi file này). Biến thể (a) "Dialog xác nhận xóa" — happy path; (b) "Dialog chặn xóa" — khi BE trả lỗi guard.
- **User flow**: click icon "Xóa" trên 1 row → mở dialog xác nhận (mặc định) → user bấm "Xác nhận xoá" → FE gọi mutation → (a) thành công: đóng dialog + toast + refetch danh sách; (b) BE trả 409 `ERR-INV-024`/`ERR-INV-029`: dialog swap sang biến thể chặn (cùng modal, đổi nội dung) + chỉ còn nút "Đóng".
- **State machine UI**: `idle` (dialog closed) → `open-confirm` → `loading` (nút "Xác nhận xoá" disable + spinner, chặn double-submit) → `success` (toast + unmount) hoặc `open-blocked` (đổi nội dung modal, không unmount) → `closed` (Hủy/Đóng/Escape).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): scan `customs/` (không có domain-specific PRC-delete-dialog) → `share/dialogs/alert-confirm` (Priority 2) **cover cả 2 biến thể qua prop delta** — KHÔNG cần build dialog mới, KHÔNG compose từ `ui/alert-dialog` (anti-pattern per registry §2 `share/dialogs/alert-confirm` when_to_use + figma §10 forbidden_imports).
- **Figma spec là visual SSOT**: mọi token màu/typography/spacing/bo góc theo `Product/ux/figma-web/wave06-prc-delete.md` (node `14507:89269`). §4/§5 references cross-ref trực tiếp §1/§2/§4/§8 của figma spec (component prop map + anti-pattern trap).
- **GraphQL op consume từ BFF**: mutation `priceCalcRunDelete(id: Int!): PriceCalcRunDeleteApiResponse!` (module `price-calc-run (W06 PRC)`, `agg-garage-graph-graphql.md` §2 row 364).
- **RBAC render**: KHÔNG gate theo role — `garage-owner` và `accountant` thấy/thao tác giống hệt nhau (AC-5).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage gate: 6/6 source AC-IDs cover dưới đây.

### Cluster A — Dialog xác nhận xóa (happy path)

#### AC-1 → Mở dialog xác nhận xóa từ row-action

- **Khi**: user click icon "Xóa" trên 1 row của bảng lịch sử tính giá (trigger nằm ở `FEAT-PRC-LIST` — ngoài node figma của file này, xem `figma-web/wave06-prc-delete.md` coverage_gaps `ac1_trigger_row_delete_icon_out_of_node`).
- **FE phải**: mount `share/dialogs/alert-confirm` với `showHeaderIcon={false}`, `mode="cancel"`, `alertTitleClassName="text-foreground"`, `alertTitle="Xóa khoản mục lịch sử tính giá"`, `alertDescription` = 2 đoạn — đoạn 1 dynamic `"Bạn có muốn xóa log tính giá {periodFrom} - {periodTo} của {warehouseName}."` (bind từ row đã chọn), đoạn 2 literal cố định `"Thao tác này không rollback giá vốn đã cập nhật."`; `cancelText="Hủy"`.
- **State transition**: `idle` → `open-confirm` (fade-in + zoom-in, Radix `data-state=open`).
- **Component**: `share/dialogs/alert-confirm` (REUSE).
- **Ref**: figma node `13575:222590`/`13575:222692`.

#### AC-2 → Thực hiện xóa (không rollback) + thông báo thành công

- **Khi**: user click nút xác nhận trong dialog.
- **FE phải**: gọi mutation `priceCalcRunDelete(id: run.id)`; set `isLoading` (disable nút + spinner, chặn double-submit) trong lúc chờ; **on success** → đóng dialog + `toast.success` (`share/toasts/toast`, hook `use-mutation`) + invalidate/refetch query key danh sách (chủ sở hữu `FEAT-PRC-LIST`); **on 409 error** (`ERR-INV-024` hoặc `ERR-INV-029`) → xem AC-4/AC-4b (dialog **swap nội dung tại chỗ**, không unmount).
- **NEED CONFIRMATION** (label drift): FEAT AC-1/AC-2 ghi nhãn nút xác nhận là **"Xóa khoản mục"**; Figma (PNG-verified, R9 verbatim) ghi **"Xác nhận xoá"** (chính tả *xoá*). Spec này theo **Figma** (visual SSOT) cho tới khi có CR đồng bộ 1 trong 2 nguồn — `confirmText="Xác nhận xoá"`. Business Authority cần chốt.
- **i18n keys**: không dùng — chuỗi cứng (xem §4.3).
- **GraphQL op**: `priceCalcRunDelete` — input `{ id: Int! }` → output `PriceCalcRunDeleteResult { runId, deleted, message }`.
- **a11y**: nút loading có `aria-busy`; `autoFocus` không cần thiết ở biến thể confirm (2 nút).
- **Ref**: `agg-garage-graph-graphql.md` §2 row 364 (line 434, `Mutation priceCalcRunDelete`); figma §11 gap `ac2_success_toast_not_designed` (toast không có frame Figma riêng — dùng runtime hook, không phải gap chặn).

#### AC-3 → Hủy — đóng dialog, không xóa

- **Khi**: user click nút "Hủy" HOẶC nhấn phím `Escape`.
- **FE phải**: đóng dialog (`unmount`, fade-out); **KHÔNG** gọi mutation; **KHÔNG** render nút ✕ góc phải-trên (Figma cố ý không thiết kế — coverage_gaps `ac3_close_x_absent_in_figma`; AC dùng chữ "hoặc" nên ✕ là optional, thoả mãn qua nút "Hủy" + `Escape` của Radix `AlertDialog` primitive bên trong `alert-confirm`).
- **State transition**: `open-confirm` → `closed`.
- **Ref**: figma §8 `AP-PRC-DEL-6` ("Tự thêm nút ✕ đóng" — anti-pattern, KHÔNG làm).

### Cluster B — Dialog chặn xóa (guard path)

#### AC-4 → Chặn khi kỳ đã đóng

- **Khi**: mutation `priceCalcRunDelete` trả lỗi 409 `ERR-INV-024`.
- **FE phải**: **swap nội dung modal tại chỗ** (cùng component `alert-confirm`, không mở dialog thứ 2) sang props: `mode="warning"`, `alertTitleClassName="text-foreground"` (title KHÔNG nhuộm cam/đỏ), `alertTitle="Không thể xóa"`, `alertDescription="Log tính giá đã được dùng để khóa giá vốn hoặc kỳ kế toán đã đóng nên không được xóa."` (verbatim PNG-checked figma text — xem note discrepancy ở §4.6), `cancelText="Đóng"`, **KHÔNG truyền `onConfirm`** (`Show when={Boolean(onConfirm)}` tự ẩn nút thứ 2 → còn đúng 1 nút).
- **State transition**: `loading` → `open-blocked`.
- **Component**: `share/dialogs/alert-confirm` (REUSE — cùng instance, props khác).
- **Ref**: figma node `13575:222693`/`13575:222795`; `ERR-INV-024` (`ERROR-CODE-REGISTRY.md` §4, HTTP 409, rule `BR-PRC-011`).

#### AC-4b → Chặn khi log đang "Đang tính"

- **Khi**: mutation `priceCalcRunDelete` trả lỗi 409 `ERR-INV-029`.
- **FE phải**: cùng cơ chế AC-4 (swap tại chỗ, 1 nút "Đóng"), đổi `alertDescription="Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất"` (verbatim FEAT AC-4b — **Figma chưa thiết kế variant này**, coverage_gaps `ac4b_calculating_state_block_not_designed`, severity MEDIUM; DEV dùng cùng shell Screen 2, chỉ đổi body text theo error-code branch — KHÔNG hiển thị mã lỗi kỹ thuật ra UI, xem `AP-PRC-DEL-12`).
- **Optional client hint** (không bắt buộc, không thay guard server-side): FE có thể dùng `row.status` đã có sẵn từ `FEAT-PRC-LIST` (field `PriceCalcRun.status`) để disable/ẩn icon "Xóa" khi `status ∈ {PENDING, RUNNING}` — soft UX hint; BE guard vẫn là nguồn chặn chính thức (§4.5).
- **Ref**: `ERR-INV-029` (`ERROR-CODE-REGISTRY.md` §4, HTTP 409, rule `BR-PRC-016`/`BR-PRC-011`).

### Cluster C — Phân quyền

#### AC-5 → Phân quyền ngang nhau

- **Khi**: user có role `garage-owner` hoặc `accountant`.
- **FE phải**: KHÔNG gate/disable icon "Xóa" hoặc bất kỳ nút nào trong 2 dialog theo role — hành vi/hiển thị giống hệt nhau cho cả 2 persona.
- **Ref**: `BR-AP-CMN-002`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-prc-delete.md` node `14507:89269` (2 frame). KHÔNG re-invent layout/spacing/màu.
- Dialog width 441px, `rounded-none` (bo góc VUÔNG — **override** baseline `AlertDialogContent` mặc định `rounded-lg`; đây là quyết định thiết kế của riêng feature này, KHÔNG phải thiếu sót — xem figma `AP-PRC-DEL-7`/`AP-PRC-DEL-9`).
- `showHeaderIcon={false}` bắt buộc cho CẢ 2 biến thể (baseline mặc định `true` → tự render icon 48px không có trong Figma — `AP-PRC-DEL-1`/`AP-PRC-DEL-10`).
- Title luôn `text-foreground` (đen `#18181b`) bất kể `mode` — KHÔNG để `color[mode]` tự nhuộm đỏ/cam (`AP-PRC-DEL-2`/`AP-PRC-DEL-11`).
- Description luôn `text-muted-foreground` (xám `#71717a`) — override baseline `text-foreground!` (`AP-PRC-DEL-3`).
- Overlay: dùng `bg-black/10` per §1 Layout DSL; component gap hiện tại KHÔNG expose `overlayClassName` — chấp nhận deviation tạm thời baseline `bg-black/50` hoặc raise CR bổ sung prop (figma §11 Component Gaps, quyết định thuộc DEV/tech-lead).
- Responsive: dialog là fixed 441px trên desktop; không có breakpoint mobile riêng cho web modal này (mobile app không có PRC — web-only).

### 4.2 State machine + error handling

- State tường minh: `idle → open-confirm → loading → (success | open-blocked) → closed`.
- Lỗi 409 → **swap nội dung modal tại chỗ** (không đóng rồi mở dialog mới, không mount 2 dialog song song) — xem AC-4/AC-4b.
- KHÔNG hiển thị mã lỗi kỹ thuật (`ERR-INV-024`/`ERR-INV-029`) ra UI — chỉ dùng để branch câu tiếng Việt (`AP-PRC-DEL-12`).
- KHÔNG silent fail — lỗi khác 409 (vd 5xx, network) → fallback `toast.error` generic (KHÔNG dựng biến thể "blocked" cho lỗi ngoài 2 mã đã biết).

### 4.3 i18n + a11y

- **KHÔNG dùng i18next cho copy dialog này** — chuỗi cứng tiếng Việt, truyền explicit qua props `alertTitle`/`alertDescription`/`cancelText`/`confirmText`, **override** baseline i18n default của `alert-confirm` (`t("button.cancel")`/`t("button.confirm")`) — theo đúng delta bắt buộc trong figma §4 Component Prop Map (R9 verbatim). `i18n_keys: []` frontmatter để trống.
- a11y: `alert-confirm` compose từ Radix `AlertDialog` — focus trap + `aria-labelledby`/`aria-describedby` tự động (title/description). `Escape` đóng dialog (cả 2 biến thể). Biến thể chặn (1 nút) nên `autoFocus` nút "Đóng" vì là action duy nhất.
- KHÔNG render `<button>` HTML thô hoặc compose thủ công từ `ui/alert-dialog` (`figma §10 forbidden_imports/forbidden_jsx_tags`).

### 4.4 RBAC render + feature flag

- KHÔNG có feature flag riêng cho dialog này (thuộc trong `Inventory:InventoryV2` chung của PRC — enforce ở BE, BFF forward 403 nếu flag off → FE xử lý lỗi generic, không phải phạm vi 2 dialog này).
- Persona check: KHÔNG áp dụng — `garage-owner`/`accountant` quyền ngang nhau (AC-5), không role nào bị ẩn/disable icon hay nút.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (`BR-PRC-011`/`BR-PRC-016`, xem paired `be/FEAT-PRC-DELETE.md §9`). FE chỉ:
  - Hiển thị biến thể "blocked" khi server trả 409 (không tự đoán trước khi có response, trừ optional client hint §3 AC-4b dùng `row.status` đã biết).
  - Disable nút "Xác nhận xoá" khi `isLoading=true` (chặn double-submit).
  - KHÔNG tự rollback hay hiển thị bất kỳ control nào liên quan tới `cost_unit_price`/`cost_value` — xóa log KHÔNG đảo giá vốn (theo đúng copy dialog AC-1).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-024` | DIALOG (feature-specific swap-in-place — xem note) | `share/dialogs/alert-confirm` (biến thể chặn) | AC-4 |
| `ERR-INV-029` | DIALOG (feature-specific swap-in-place) | `share/dialogs/alert-confirm` (biến thể chặn) | AC-4b |
| khác (5xx/network) | TOAST (generic fallback) | `share/toasts/toast` | — |

> **NEED CONFIRMATION (non-blocking)**: `ERROR-CODE-REGISTRY.md` §4 khai `ERR-INV-024` display = `INLINE_FORM` với message chung `"Kỳ kế toán đã đóng — Bạn không thể thực hiện mọi thao tác thuộc kỳ này"` (dùng chung nhiều feature khác: Receipt-V2/Delivery-V2/OB/AP). Riêng cho `FEAT-PRC-DELETE`, cả FEAT source AC-4 lẫn Figma (PNG-verified) đều xác nhận display = **DIALOG** modal với message **feature-specific** `"Log tính giá đã được dùng để khóa giá vốn hoặc kỳ kế toán đã đóng nên không được xóa."` — spec này theo FEAT+Figma (nguồn cụ thể hơn cho đúng màn hình này, tương tự cách registry đã có tiền lệ override `ERR-INV-039-RECONCILIATION-WARNING` cho 1 case cụ thể). Registry chưa có 1 row `ERR-INV-024`-variant riêng cho PRC-DELETE — flag cho Business Authority/Architecture Authority cân nhắc thêm row hoặc xác nhận override tại tier spec là đủ.

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| *(không có — modal-only)* | N/A (mount trong route của `FEAT-PRC-LIST`, route path xem tier fe-web sibling — chưa fan-out tại thời điểm viết spec này) | NEW (component) | `14507:89269` | AC-1 – AC-5 |

### 5.2 Components new/modified

> Reuse pattern priority: `customs/` > `share/` > `ui/`. Đã scan `.claude/references/web-component-registry.yaml` — không có domain-specific delete-dialog cho PRC ở `customs/`; `share/dialogs/alert-confirm` cover toàn bộ 2 biến thể qua prop delta (Priority 2).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `AlertConfirm` (baseline) | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `showHeaderIcon`, `mode`, `alertTitle`, `alertDescription`, `alertTitleClassName`, `cancelText`, `confirmText?`, `onConfirm?`, `onClose`, `isLoading`, `className="max-w-[400px]! gap-6 rounded-none"` | open/loading/blocked (props delta, không remount) | **Priority 2 — share/** (registry lookup key `alert-confirm`; đã tồn tại, cover cả 2 biến thể dialog) | AC-1, AC-2, AC-3, AC-4, AC-4b |
| `Button` (transitive) | `src/components/share/buttons/button.tsx` | REUSE (transitive — render bên trong `AlertConfirm`, KHÔNG import trực tiếp trong file feature) | `variant: secondary\|destructive`, `size: default` | — | **Priority 2 — share/** | AC-1, AC-2, AC-3, AC-4, AC-4b |
| `toast` (hook) | `src/components/share/toasts/toast.tsx` (qua `use-mutation` hook layer) | REUSE | `toast.success(message)` | — | **Priority 2 — share/** (không cần Figma frame riêng — figma gap `ac2_success_toast_not_designed`, severity LOW) | AC-2 |
| `PriceCalcRunDeleteDialog` (wrapper) | `src/features/inventory-accounting-period/components/price-calc-run-delete-dialog.tsx` | NEW | `run: PriceCalcRun`, `open: boolean`, `onOpenChange: (v: boolean) => void` | `idle \| loading \| blocked` (internal) | **Build-new** — justification: cần 1 wrapper mỏng bind data row + mutation + branch error-code (`ERR-INV-024`/`ERR-INV-029`) → props cho `AlertConfirm`; không có sẵn ở `customs/`/`share/`/`ui/` nào làm việc này cho PRC domain | AC-1 – AC-4b |

### 5.3 Design tokens & Figma refs

> Tokens khớp `wave06-prc-delete.md §2 Design Token Map` (get_variable_defs, node `14507:89269`). Bundle §G.Y liệt kê 4 token màu chính: `bg-destructive`, `text-foreground`, `text-foreground-warning`, `text-muted-foreground`.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-black/10` | Figma `overlay/90` | overlay backdrop (2 dialog) | AC-1, AC-4 |
| `bg-background` / `border-border` | Figma `base/background` / `base/border` | nền + viền 1px dialog surface | AC-1, AC-4 |
| `text-foreground` | Figma `base/foreground` | title CẢ 2 dialog — luôn đen, KHÔNG nhuộm theo `mode` | AC-1, AC-4, AC-4b |
| `text-muted-foreground` | Figma `base/muted-foreground` | description CẢ 2 dialog | AC-1, AC-4, AC-4b |
| `bg-secondary` / `text-secondary-foreground` | Figma `base/secondary(-foreground)` | nút "Hủy" (Screen 1) và "Đóng" (Screen 2) | AC-3, AC-4, AC-4b |
| `bg-destructive` / `text-destructive-foreground` | Figma `base/destructive(-foreground)` | nút "Xác nhận xoá" (chỉ Screen 1 — Screen 2 KHÔNG dùng, không có action phá huỷ) | AC-2 |
| `rounded-none` | Figma đo pixel-exact (không có `border radius/*` token trên node Dialog) | bo góc dialog surface — **override** baseline `rounded-lg` | AC-1, AC-4 |
| `rounded-md` / `shadow-sm` / `shadow-lg` | Figma `border radius/md` / `shadow/sm` / `shadow/lg` | bo góc nút / shadow nút / shadow dialog | AC-1 – AC-4b |
| `text-foreground-warning` | Figma `mode="warning"` default icon color | **KHÔNG dùng trong feature này** — chỉ tồn tại như default color của header icon `InfoCircle` khi `showHeaderIcon` không bị tắt; feature này luôn `showHeaderIcon={false}` (`AP-PRC-DEL-10`) nên token không xuất hiện trên UI thực tế | (anti-pattern ref) |

> **Figma source-of-truth**: `Product/ux/figma-web/wave06-prc-delete.md` §1-§11 (2 screen block) — mọi delta prop, anti-pattern trap, verification contract đã liệt kê chi tiết ở đó; spec này chỉ tóm tắt phần liên quan AC.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunDelete` | mutation | `src/api/graphql/price-calc-run/delete-price-calc-run.graphql` | — (invalidate `['price-calc-runs', filters]` sở hữu bởi `FEAT-PRC-LIST`) | — | AC-2, AC-4, AC-4b |

> Op verified verbatim `Architecture/api/agg-garage-graph-graphql.md` §2 row 364 (line 434): `priceCalcRunDelete(id: Int!) → PriceCalcRunDeleteApiResponse!` (module `price-calc-run (W06 PRC)`). Chưa có tier file BFF riêng cho `FEAT-PRC-DELETE` trong wave này (xem §12) — contract verify trực tiếp Architecture doc thay vì paired tier §6.1, mirror cách tier BE đã làm cho endpoint REST của chính nó.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

Không có — mọi write đi qua GraphQL mutation `priceCalcRunDelete`.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (mutation) | TanStack `useMutation` | `src/features/inventory-accounting-period/hooks/use-delete-price-calc-run.ts` | — | AC-2, AC-4, AC-4b |
| Client state (dialog variant + open) | local `useState` trong `PriceCalcRunDeleteDialog` | — | `variant: 'confirm' \| 'blocked'` | AC-1, AC-4, AC-4b |
| Form state | — | — | Không có field nào (dialog chỉ text read-only) | — |
| Optimistic UI | Không dùng (destructive action — chờ response server trước khi cập nhật UI, per Radix `AlertDialog` không đóng khi click-outside) | — | — | AC-2 |

### 6.4 Routing

Không có route riêng — dialog mount điều kiện bên trong route của `FEAT-PRC-LIST` (route path do tier fe-web sibling sở hữu, chưa fan-out tại thời điểm viết spec này).

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-accounting-period/components/` | `price-calc-run-delete-dialog.tsx` | NEW | `share/dialogs/alert-confirm` wrapper, 2 biến thể trong 1 file | ~110 | AC-1 – AC-4b |
| `src/features/inventory-accounting-period/hooks/` | `use-delete-price-calc-run.ts` | NEW | TanStack `useMutation` wrapper + error-code branch | ~40 | AC-2, AC-4, AC-4b |
| `src/api/graphql/price-calc-run/` | `delete-price-calc-run.graphql` | ADDITIVE | persisted mutation doc | ~10 | AC-2 |
| `src/api/generated/` | `delete-price-calc-run.generated.ts` | AUTO-GEN | codegen | — | — |
| `tests/features/inventory-accounting-period/` | `price-calc-run-delete-dialog.test.tsx` | NEW | Vitest + RTL | ~140 | AC-1 – AC-4b |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF contract stable (mutation `priceCalcRunDelete` đã ratify tại `agg-garage-graph-graphql.md` v7.74+). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF: priceCalcRunDelete mutation stable — Architecture doc verified, tier file chưa fan-out riêng)

S6  UI wire (web)
    Entry: GraphQL contract stable + Figma confirmed (wave06-prc-delete.md ACTIVE)
    Exit: E2E happy path green (smoke) — xóa thành công + 2 case chặn (mock 409)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Dialog wrapper + mutation hook + error-code branch | features + hooks | BFF contract stable + Figma ACTIVE | E2E smoke green | BFF S5 (khi fan-out) |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-011` | CORNERSTONE | swap modal sang biến thể "blocked" khi server trả 409; disable nút confirm khi `isLoading` | `price-calc-run-delete-dialog.tsx` | AC-2, AC-4, AC-4b | BE final enforce (`be/FEAT-PRC-DELETE.md §9`) |
| `BR-PRC-016` | CORNERSTONE | render biến thể "blocked" cho `ERR-INV-029` (log đang "Đang tính") | `price-calc-run-delete-dialog.tsx` | AC-4b | BE final enforce |
| `BR-AP-CMN-002` | NORMAL | KHÔNG gate/disable UI theo role | (không cần code riêng — default không gate) | AC-5 | conditional render N/A |

> **Primary enforcement** = BE tier (`features/be/FEAT-PRC-DELETE.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | mở dialog xác nhận, verify title/description/2 nút |
| AC-2 | UI (mutation success) | test-ui | mock `priceCalcRunDelete` 200 → toast + đóng dialog |
| AC-2 (loading) | UI | test-ui | verify disable + spinner trong lúc chờ, chặn double-submit |
| AC-3 | UI | test-ui | click "Hủy" / `Escape` → đóng, KHÔNG gọi mutation |
| AC-4 | UI (negative — mock 409 ERR-INV-024) | test-ui | verify swap sang biến thể "Không thể xóa" đúng text + 1 nút |
| AC-4b | UI (negative — mock 409 ERR-INV-029) | test-ui | verify swap đúng text AC-4b (khác AC-4) |
| AC-5 | UI (RBAC visibility) | test-ui + test-isolation | dual persona — cả 2 role thấy/thao tác giống nhau |
| (smoke) | E2E happy path | test-e2e | Playwright — xóa 1 log thành công end-to-end |

## 11. i18n & a11y

### 11.1 i18n keys

> **KHÔNG dùng i18next** — fixed VN labels, truyền chuỗi cứng qua props (override baseline `t("button.cancel")`/`t("button.confirm")`), theo delta bắt buộc figma §4 Component Prop Map (R9 verbatim). `i18n_keys: []` frontmatter.

| Copy | VN (hardcode) | AC ref |
|---|---|---|
| Title (confirm) | "Xóa khoản mục lịch sử tính giá" | AC-1 |
| Description dòng 1 (confirm, dynamic) | "Bạn có muốn xóa log tính giá {periodFrom} - {periodTo} của {warehouseName}." | AC-1 |
| Description dòng 2 (confirm, literal) | "Thao tác này không rollback giá vốn đã cập nhật." | AC-1 |
| Nút Hủy | "Hủy" | AC-3 |
| Nút xác nhận | "Xác nhận xoá" *(NEED CONFIRMATION — xem §3 AC-2)* | AC-2 |
| Title (blocked) | "Không thể xóa" | AC-4, AC-4b |
| Description (blocked, ERR-INV-024) | "Log tính giá đã được dùng để khóa giá vốn hoặc kỳ kế toán đã đóng nên không được xóa." | AC-4 |
| Description (blocked, ERR-INV-029) | "Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất" | AC-4b |
| Nút Đóng | "Đóng" | AC-4, AC-4b |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Focus trap trong dialog (Radix `AlertDialog`); `aria-labelledby`/`aria-describedby` tự động từ title/description | manual QA |
| AC-2 | Nút "Xác nhận xoá" có `aria-busy` khi loading | — |
| AC-3 | `Escape` đóng dialog | Radix default |
| AC-4, AC-4b | Biến thể 1 nút — `autoFocus` nút "Đóng" (action duy nhất) | manual QA |
| (chung) | KHÔNG render `<button>` HTML thô hay compose `ui/alert-dialog` trực tiếp | forbidden per figma §10 |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-DELETE.md` | DRAFT | Contract source `DELETE /api/v2/price-calc-runs/{id}`, BR-PRC-011/016 primary enforcement |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-DELETE.md` (`consumes_bff_feats: ["FEAT-PRC-DELETE"]`) | ACTIVE candidate (DRAFT) | Tier file riêng đã được author song song (mutation `priceCalcRunDelete`) — reconciled sau khi authoring batch hoàn tất |
| Mobile | N/A | N/A | PRC web-only (PKG §Overview — mobile W06 chỉ `FEAT-STK-LIST-V2`) |
| Sibling FE | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-LIST.md` (chưa authored tại thời điểm viết spec này) | N/A | Sở hữu route + row-action trigger "icon Xóa" + refetch danh sách sau khi xóa thành công (AC-2) — file này KHÔNG tự chốt route path, tham chiếu ngược khi `FEAT-PRC-LIST` fe-web hoàn tất |

**Source ID consistency** (item 18): `source_feat_sha = 8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f` — khớp BE tier.

## 13. References

- **Source**: [`Product/features/FEAT-PRC-DELETE.md`](../../../../../Product/features/FEAT-PRC-DELETE.md) v7
- **Paired BE**: [`features/be/FEAT-PRC-DELETE.md`](../be/FEAT-PRC-DELETE.md)
- **Paired BFF**: N/A (chưa fan-out; contract verified `Architecture/api/agg-garage-graph-graphql.md` §2 row 364)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC)
- **Figma spec**: [`Product/ux/figma-web/wave06-prc-delete.md`](../../../../../Product/ux/figma-web/wave06-prc-delete.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml) (`share/dialogs/alert-confirm`, `share/buttons/button`, `share/toasts/toast`)
- **Error registry**: [`Product/Commons/ERROR-CODE-REGISTRY.md`](../../../../../Product/Commons/ERROR-CODE-REGISTRY.md) §4 (`ERR-INV-024`, `ERR-INV-029`)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **GraphQL API**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §2 row 364, §0 Wave Index W06
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-PRC-DELETE` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical byte-equal với BE tier), §2 trách nhiệm FE Web (modal 2-biến-thể qua `share/dialogs/alert-confirm`), §3 FE behaviour map 6/6 AC-ID, §4 visual fidelity (rounded-none override + showHeaderIcon=false + title luôn text-foreground) + state machine (swap-in-place, không mount 2 dialog) + i18n (fixed VN, không i18next) + RBAC (no-gate) + BR secondary + error mapping (flag NEED CONFIRMATION registry generic vs feature-specific message), §5-§12 FE-specific (component reuse toàn bộ share/, GraphQL mutation `priceCalcRunDelete` verified trực tiếp Architecture doc do BFF tier chưa fan-out, cross-tier ref `FEAT-PRC-LIST` sibling chưa authored). 2 NEED CONFIRMATION flag: (1) nhãn nút xác nhận "Xóa khoản mục" (FEAT) vs "Xác nhận xoá" (Figma R9) — theo Figma; (2) `ERR-INV-024` display/message registry generic (INLINE_FORM) vs feature-specific (DIALOG, text khác) — theo FEAT+Figma. Source FEAT chỉ audit. |
