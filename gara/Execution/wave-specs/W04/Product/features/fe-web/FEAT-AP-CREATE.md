---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-CREATE.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-CREATE"
source_feat_sha: "fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c"
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
consumes_backend_feats: ["FEAT-AP-CREATE"]
consumes_bff_feats: ["FEAT-AP-CREATE"]
i18n_keys:
  - "inventoryAccountingPeriod.create.title"
  - "inventoryAccountingPeriod.create.actions.cancel"
  - "inventoryAccountingPeriod.create.actions.submit"
  - "inventoryAccountingPeriod.create.section.generalInfo"
  - "inventoryAccountingPeriod.create.field.periodType.year"
  - "inventoryAccountingPeriod.create.field.periodType.quarter"
  - "inventoryAccountingPeriod.create.field.periodType.month"
  - "inventoryAccountingPeriod.create.field.autoGenerate"
  - "inventoryAccountingPeriod.create.field.year.label"
  - "inventoryAccountingPeriod.create.field.year.placeholder"
  - "inventoryAccountingPeriod.create.field.parentPeriod.label"
  - "inventoryAccountingPeriod.create.field.parentPeriod.placeholder"
  - "inventoryAccountingPeriod.create.field.name.label"
  - "inventoryAccountingPeriod.create.field.name.placeholder"
  - "inventoryAccountingPeriod.create.field.name.errorRequired"
  - "inventoryAccountingPeriod.create.field.startDate.label"
  - "inventoryAccountingPeriod.create.field.endDate.label"
  - "inventoryAccountingPeriod.create.field.displayOrder.label"
  - "inventoryAccountingPeriod.create.field.status.label"
  - "inventoryAccountingPeriod.create.field.status.open"
  - "inventoryAccountingPeriod.create.field.status.closed"
  - "inventoryAccountingPeriod.create.field.description.label"
  - "inventoryAccountingPeriod.create.field.description.placeholder"
  - "inventoryAccountingPeriod.create.error.dateRangeInvalid"
  - "inventoryAccountingPeriod.create.error.dateOutOfParentRange"
  - "inventoryAccountingPeriod.create.error.dateOverlap"
  - "inventoryAccountingPeriod.create.error.invalidParent"
  - "inventoryAccountingPeriod.create.success.toast"
  - "inventoryAccountingPeriod.create.success.autoGenerateSummary"
screens_touched:
  - "src/features/inventory-accounting-period/pages/accounting-period-create-page.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ap-create.md (node 14146:87555 — Thêm kỳ kế toán: Year variant 13521:66036, Intermediate variant 13523:68171, Quarter/Month variant 13523:68476)"
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — không được cung cấp trong Context Bundle spawn này"
  template_sha: "N/A — không được cung cấp trong Context Bundle spawn này"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-CREATE.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-CREATE (FE Web): Tạo kỳ kế toán

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-CREATE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/features/inventory-accounting-period/pages/accounting-period-create-page.tsx` |
| Cross-tier consume | BE: `FEAT-AP-CREATE` (gf-accounting) \| BFF: `FEAT-AP-CREATE` (agg-garage-graph) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-CREATE.md`](../../../../../Product/features/FEAT-AP-CREATE.md) |
| Source version | v6 |
| Source SHA | `fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c` |
| Generated at | 2026-07-08T04:51:55+00:00 (bundle) |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần thiết lập khung **kỳ kế toán** (Năm → Quý → Tháng) làm mốc kiểm soát đóng/mở sổ kho trước khi vận hành nghiệp vụ nhập/xuất/tồn kho. Màn "Thêm kỳ kế toán" là điểm khởi tạo dữ liệu nền cho toàn bộ chuỗi kiểm soát kỳ (mở kỳ → nhập liệu → đóng kỳ), đồng thời hỗ trợ tự động sinh cây kỳ con để rút ngắn thao tác thiết lập ban đầu. Không có kỳ hợp lệ thì các luồng downstream (tồn đầu kỳ, lock-check phiếu nhập/xuất) không có mốc để đối chiếu.

## 2. Trách nhiệm FE Web (garage-web)

- Render trang **"Thêm kỳ kế toán"** (page, không phải modal) tại route con của khu vực Danh mục — entry point từ nút "Thêm kỳ kế toán" trên `FEAT-AP-LIST`; tab "Kỳ kế toán" trong SubNav ở trạng thái active.
- Điều phối **form 1 màn 3 biến thể**: chọn loại kỳ (radio) quyết định field nào hiển thị ở cột 1 của grid (Năm select cho kỳ Năm; Thuộc kỳ select cho kỳ Quý/Tháng) và checkbox "Tự động sinh kỳ" (ẩn với kỳ Tháng).
- Quản lý state machine form: `idle → editing → validating → submitting → success/error`, kèm loading trên nút "Tạo" khi submit.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên (bundle §G.X + `.claude/references/web-component-registry.yaml`). Form của feature này chủ yếu compose `share/*` (form-ready generic); chỉ build-new khi không có component fit ở cả 3 layer (radio-group — xem §5.2).
- **Figma spec là visual SSOT**: layout, token, 3 screen variant theo `Product/ux/figma-web/wave04-ap-create.md` (node `14146:87555`). Không suy luận layout từ AC text.
- Consume GraphQL mutation `createAccountingPeriod` (tạo kỳ + tuỳ chọn tự sinh kỳ con) và query tra cứu kỳ cha hợp lệ cho dropdown "Thuộc kỳ" từ BFF `agg-garage-graph`.
- RBAC render: route chỉ truy cập khi feature flag `Inventory:InventoryV2` bật; cả 2 persona (`garage-owner`, `accountant`) có quyền ngang nhau — không gate riêng theo role.

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 12/12 source AC-ID. Không AC nào N/A ở tier FE-web (toàn bộ AC đều có bề mặt UI).

### Cluster A — Mở form & thoát form

#### AC-1 → Mở trang "Thêm kỳ kế toán"

- **Khi**: user click nút "Thêm kỳ kế toán" ở `FEAT-AP-LIST`.
- **FE phải**: navigate tới trang create; render `PageHeader` (back-link + H1 "Thêm kỳ kế toán" + action row `[Huỷ bỏ] [Tạo]`) và section "Thông tin chung" chứa toàn bộ field.
- **State transition**: `idle` — form mount với default values (loại kỳ = Năm, năm hiện tại, Trạng thái = "Chưa đóng", Thứ tự hiển thị = 0).
- **Component**: `share/layouts/page-header` (REUSE), `share/containers/section` (REUSE).
- **GraphQL op**: (không cần fetch khi mount — trừ khi prefetch danh sách năm hợp lệ, xem AC-4).
- **i18n keys**: `inventoryAccountingPeriod.create.title`, `...section.generalInfo`.
- **a11y**: `<h1>` cho page title; focus tự động vào radio đầu tiên khi mount.
- **Ref**: Figma node `14146:87555` §1 Layout DSL `PageHeader` + `ThongTinChungSection`.

#### AC-11 → Huỷ bỏ

- **Khi**: user click nút "Huỷ bỏ".
- **FE phải**: đóng form, không gọi mutation, `navigate(-1)` quay về `FEAT-AP-LIST`.
- **State transition**: `editing → idle` (unmount, không có confirm dialog theo Figma — negative-coverage xác nhận không có confirm-on-cancel).
- **Component**: `share/buttons/button` variant `outline` (REUSE).
- **GraphQL op**: — (không mutation).
- **i18n keys**: `inventoryAccountingPeriod.create.actions.cancel`.
- **a11y**: `aria-label="Huỷ bỏ, quay về danh sách kỳ kế toán"` nếu icon-only variant không dùng (button đã có text label nên không bắt buộc).
- **Ref**: Figma `CancelButton` node.

### Cluster B — Chọn loại kỳ & field variant

#### AC-2 → Chọn loại kỳ (radio 3 giá trị)

- **Khi**: user click 1 trong 3 radio "Kỳ kế toán năm / quý / tháng".
- **FE phải**: cập nhật `form.periodType`, trigger re-render cột 1 của `FieldGrid` (xem AC-4) và visibility của checkbox "Tự động sinh kỳ" (xem AC-8); reset field không còn liên quan (vd đổi từ Năm sang Quý thì clear `form.year`, ngược lại clear `form.parentPeriodId`).
- **State transition**: `editing` — không loading (đổi field tại chỗ, không round-trip server trừ khi cần load lại option "Thuộc kỳ").
- **Component**: `PeriodTypeRadioGroup` — **build-new** (xem §5.2, không có component radio-group trong registry).
- **GraphQL op**: nếu chuyển sang Quý/Tháng và chưa từng load → trigger query `searchAccountingPeriods` (xem AC-5).
- **i18n keys**: `...field.periodType.year`, `...field.periodType.quarter`, `...field.periodType.month`.
- **a11y**: `role="radiogroup"` + `aria-label` mô tả "Loại kỳ kế toán"; arrow-key nav giữa 3 radio.
- **Ref**: Figma `LoaiKyRadioRow` — 3 biến thể width 593 (Năm/Quý có checkbox) / 438 (Tháng không checkbox).

#### AC-4 → Field đặc thù theo loại kỳ

- **Khi**: `form.periodType` thay đổi (từ AC-2).
- **FE phải**: render cột 1 hàng 1 của `FieldGrid` theo mode:
  - `periodType = NAM` → field **"Năm *"** = dropdown single-select tĩnh 50 giá trị `[currentYear .. currentYear+49]` sort ascending, default = năm hiện tại, disable chọn năm quá khứ (constrain client-side theo BR-AP-003a) — field "Thuộc kỳ" ẩn.
  - `periodType ∈ {QUY, THANG}` → field **"Thuộc kỳ *"** = combo server-loaded (xem AC-5) — field "Năm" ẩn.
- **State transition**: `editing`, field switch tức thời (không loading trừ combo "Thuộc kỳ" đang fetch).
- **Component**: `share/selects/select-label` cho "Năm" (REUSE — Priority 2 `share/`, static enum 50 giá trị); `share/inputs/input-select` cho "Thuộc kỳ" (REUSE — Priority 2 `share/`, searchable + server-loaded).
- **GraphQL op**: `searchAccountingPeriods` (filter `level=NAM` không cần gọi — client tự sinh dãy năm; filter `level=NAM|QUY` khi cần load "Thuộc kỳ").
- **i18n keys**: `...field.year.label`, `...field.year.placeholder`, `...field.parentPeriod.label`, `...field.parentPeriod.placeholder`.
- **a11y**: `aria-required="true"` cho cả 2 field; error announce qua `aria-describedby`.
- **Ref**: Figma `Row1Col1` `_mode_switch` (§1 Layout DSL); Anti-Pattern Trap `AP-AP-CREATE-4`.

#### AC-5 → Dropdown "Thuộc kỳ" lọc kỳ cha hợp lệ

- **Khi**: user mở dropdown "Thuộc kỳ" (periodType = QUY hoặc THANG).
- **FE phải**: gọi query `searchAccountingPeriods` với filter `level=NAM` (nếu periodType=QUY) hoặc `level=QUY` (nếu periodType=THANG); hiển thị option label kèm ngữ cảnh năm (vd "Quý 1/2026") để user phân biệt; nếu list rỗng (EC-1: chưa có kỳ cha nào) → hiển thị empty-state trong dropdown + disable submit tới khi có kỳ cha.
- **State transition**: `loading` khi fetch options, `error` nếu query fail (hiển thị inline "Không tải được danh sách kỳ cha").
- **Component**: `share/inputs/input-select` (REUSE — đã hỗ trợ `isLoading` + `hasMore`/`loadMore` cho paginated load).
- **GraphQL op**: `searchAccountingPeriods(filter: { level, status })`.
- **i18n keys**: `...field.parentPeriod.label`.
- **a11y**: Combobox pattern chuẩn (`aria-expanded`, `aria-activedescendant`).
- **Ref**: Figma `ThuocKyField.options` filter rule; Anti-Pattern Trap `AP-AP-CREATE-5`; EC-1 (`Product/features/FEAT-AP-CREATE.md §6`).

### Cluster C — Trường thông tin chung

#### AC-3 → Nhập tên kỳ kế toán

- **Khi**: user nhập vào field "Tên kỳ kế toán *" hoặc submit bỏ trống.
- **FE phải**: bind `form.name`; validate required client-side trước submit — bỏ trống → inline error verbatim "Tên kỳ kế toán là bắt buộc" ngay dưới field, chặn submit.
- **State transition**: `editing → validating` (on blur/submit).
- **Component**: `share/inputs/input` (REUSE — Priority 2 `share/`, đã có FormField + Label + FormMessage).
- **GraphQL op**: — (client validation trước; server re-validate khi submit).
- **i18n keys**: `...field.name.label`, `...field.name.placeholder`, `...field.name.errorRequired`.
- **a11y**: `aria-invalid` + `aria-describedby` trỏ tới error message khi có lỗi.
- **Ref**: Figma `Row1Col2` (Tên kỳ kế toán); coverage_gap "validation error UI Figma missing" → dùng `share/inputs/input` error slot mặc định.

#### AC-6 → Nhập ngày bắt đầu / kết thúc

- **Khi**: user nhập/chọn ngày ở 2 field "Ngày bắt đầu *" và "Ngày kết thúc *".
- **FE phải**: bind `form.startDate` / `form.endDate` (format hiển thị `DD/MM/YYYY`); required cả 2; sau khi cả 2 có giá trị → trigger cross-field validate (xem AC-9).
- **State transition**: `editing`.
- **Component**: 2 instance `share/date-picker/date-picker` (REUSE — Priority 2 `share/`) — **không** dùng `share/date-picker/date-range-picker` dù tên gợi ý "date-period-picker" phù hợp ngữ nghĩa, vì Figma render 2 field độc lập trong grid 2 cột riêng biệt (không phải 1 trigger range hợp nhất) — dùng range-picker sẽ lệch visual fidelity §4.1.
- **GraphQL op**: — (giá trị gửi kèm mutation `createAccountingPeriod` ở AC-10).
- **i18n keys**: `...field.startDate.label`, `...field.endDate.label`.
- **a11y**: calendar icon trailing có `aria-label="Chọn ngày"`; keyboard: `Enter` mở calendar popover, `Escape` đóng.
- **Ref**: Figma `Row2Col1` / `Row2Col2`.

#### AC-7 → Thứ tự hiển thị & Mô tả & Trạng thái

- **Khi**: form được mở (mount) hoặc user chỉnh sửa các field này.
- **FE phải**: pre-fill default `displayOrder = 0` (không bắt buộc), `status = "Chưa đóng"` (dropdown 2 giá trị "Chưa đóng"/"Đã đóng" — **không** dùng giá trị test-data "Đã đóng kỳ" của Figma PNG, dùng đúng default AC), `description` textarea rỗng với placeholder "Nhập mô tả" (không bắt buộc).
- **State transition**: `idle` (default values set on mount).
- **Component**: `share/inputs/input-number` cho Thứ tự hiển thị (REUSE); `share/selects/select-label` cho Trạng thái (REUSE — 2 giá trị enum tĩnh); `share/textareas/textarea` cho Mô tả (REUSE).
- **GraphQL op**: —.
- **i18n keys**: `...field.displayOrder.label`, `...field.status.label`, `...field.status.open`, `...field.status.closed`, `...field.description.label`, `...field.description.placeholder`.
- **a11y**: label liên kết đúng control qua `htmlFor`/`id`.
- **Ref**: Figma `Row3Col1`, `Row3Col2`, `MoTaField`; Anti-Pattern Trap `AP-AP-CREATE-6` (default "Chưa đóng" override Figma test value).

### Cluster D — Tự động sinh kỳ

#### AC-8 → Tùy chọn tự động sinh kỳ

- **Khi**: `periodType ∈ {NAM, QUY}` và user tick checkbox "Tự động sinh kỳ" rồi submit.
- **FE phải**: hiển thị checkbox chỉ khi periodType là Năm hoặc Quý (ẩn hoàn toàn với Tháng — không disable, ẩn hẳn); gửi `form.autoGenerate = true` kèm mutation; **auto-generate là server-side** (FE không tự loop tạo con) — nhận response `autoGenerateSummary: { created, skipped }` và render **toast/dialog** post-create verbatim **"Đã tạo {created} kỳ, bỏ qua {skipped} kỳ đã tồn tại."** (Figma không có frame cho bước này — coverage_gap, implement theo AC verbatim wording).
- **State transition**: `submitting → success` kèm summary hiển thị trước hoặc cùng lúc với navigate về list.
- **Component**: `share/checkboxs/checkbox` (REUSE — Priority 2 `share/`) cho checkbox; `share/toasts/toast` (REUSE) cho summary.
- **GraphQL op**: `createAccountingPeriod(input: { ..., autoGenerate: true })` → response field `autoGenerateSummary`.
- **i18n keys**: `...field.autoGenerate`, `...success.autoGenerateSummary`.
- **a11y**: checkbox có `aria-label` "Tự động sinh kỳ"; toast summary dùng `role="status"` (aria-live polite).
- **Ref**: Figma `TuDongSinhKyCheckbox` `_visibility_rule`; Anti-Pattern Trap `AP-AP-CREATE-2`, `AP-AP-CREATE-7`, `AP-AP-CREATE-8`; EC-2 (`Product/features/FEAT-AP-CREATE.md §6`).

### Cluster E — Validate & Submit

#### AC-9 → Validate khoảng ngày

- **Khi**: user nhấn "Tạo" (hoặc blur field ngày, tuỳ UX polish).
- **FE phải** (validate 2 tầng — client hint + server authoritative):
  - Client: chặn submit + inline error nếu `endDate < startDate`.
  - Server (qua response lỗi mutation): `ERR-AP-011` (chồng lấn kỳ cùng cấp) và trường hợp kỳ con ngoài phạm vi kỳ cha (`ERR-AP-010`/validate hierarchy) — FE hiển thị lỗi trả về gắn đúng field ngày liên quan (trùng ngày biên được server chấp nhận, FE không tự chặn case biên).
- **State transition**: `validating → error` (inline) hoặc `submitting → error` (server reject) → quay lại `editing` với error hiển thị, không mất dữ liệu đã nhập.
- **Component**: error slot có sẵn trong `share/date-picker/date-picker` (FormMessage).
- **GraphQL op**: response error từ `createAccountingPeriod`.
- **i18n keys**: `...error.dateRangeInvalid`, `...error.dateOutOfParentRange`, `...error.dateOverlap`.
- **a11y**: lỗi field-level dùng `aria-describedby`; nếu lỗi cross-field không gắn được field cụ thể → hiển thị banner INLINE phía trên form.
- **Ref**: Figma State Table `validation_error`; Anti-Pattern Trap `AP-AP-CREATE-9`; BR-AP-006/007/008 (§9 secondary).

#### AC-10 → Lưu thành công

- **Khi**: dữ liệu hợp lệ và user nhấn "Tạo".
- **FE phải**: disable nút "Tạo" + hiện loading state, gọi mutation `createAccountingPeriod`; khi thành công → toast success + (nếu `autoGenerate=true`) hiển thị summary AC-8, sau đó `navigate` về `FEAT-AP-LIST` (kỳ mới xuất hiện đúng vị trí phân cấp — do BE trả về đúng cây, FE chỉ invalidate cache list).
- **State transition**: `submitting → success` → navigate.
- **Component**: `share/buttons/button` variant `brand` với `isLoading` prop (REUSE); `share/toasts/toast` cho success message.
- **GraphQL op**: mutation `createAccountingPeriod` — invalidate TanStack query key `['accounting-periods']` sau khi thành công.
- **i18n keys**: `...success.toast`.
- **a11y**: nút "Tạo" `disabled` khi `isSubmitting || !isValid` (per Figma Component Prop Map).
- **Ref**: Figma `CreateButton.onClick`; §5 Field Composition Schema `CreateAccountingPeriodResult`.

### Cluster F — Phân quyền

#### AC-12 → Phân quyền tạo

- **Khi**: user (garage-owner hoặc accountant) truy cập route create.
- **FE phải**: route guard chỉ kiểm tra (a) feature flag `Inventory:InventoryV2` bật, (b) user đã đăng nhập với 1 trong 2 persona hợp lệ — **không** có gate phân biệt quyền giữa 2 persona (quyền ngang nhau theo AC-12), tức là KHÔNG hide/disable nút "Tạo" theo role.
- **State transition**: `idle` (guard chạy ở `beforeLoad`, chặn render nếu fail).
- **Component**: TanStack Router `beforeLoad` (không phải UI component riêng).
- **GraphQL op**: —.
- **i18n keys**: — (không có UI string riêng cho gate; dùng error-boundary chung nếu unauthorized).
- **a11y**: —.
- **Ref**: `Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md §1` — "Người thực hiện: Chủ garage và Kế toán — quyền ngang nhau".

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave04-ap-create.md` (node `14146:87555`, 3 screen variant: Year `13521:66036`, Intermediate `13523:68171` — duplicate của Year, Quarter/Month `13523:68476`). KHÔNG re-invent layout/spacing/màu.
- Design tokens lấy từ `tailwind.config.js` / `src/styles/tokens/**` — không hardcode hex/px. Bundle §G.Y ghi nhận tối thiểu `bg-brand`, `text-foreground`, `text-muted-foreground`, `text-primary`; đọc trực tiếp figma spec §2 Design Token Map (nguồn đầy đủ hơn, superset — không mâu thuẫn) cho bộ token đầy đủ: `bg-background`, `bg-brand`, `text-foreground`, `text-2xl`, `font-semibold`, `border-input`, `h-9`, `font-medium`, `bg-brand` (CreateButton), `text-primary-foreground`, `text-base`, `text-sm`, `text-destructive`, `rounded-md`, `placeholder:text-muted-foreground`.
- Responsive: breakpoint theo Tailwind preset; Figma chỉ có desktop 1440px — verify tablet/mobile fallback qua breakpoint chuẩn của layout hệ thống (không có frame riêng, kế thừa page-level responsive pattern).
- Mỗi visual AC cross-ref figma section: AC-1/11 → `PageHeader`; AC-2/8 → `LoaiKyRadioRow`; AC-4/5 → `Row1Col1` mode-switch; AC-3/6/7 → `FieldGrid` Row1-3 + `MoTaField`.

### 4.2 State machine + error handling

- State transition tường minh: `idle | editing | validating | submitting | success | error`. Mỗi state có UI tương ứng: `submitting` → nút "Tạo" loading + disabled; `error` → inline error field-level hoặc banner cross-field.
- Error → INLINE cho validation field-level (AC-3, AC-9); TOAST cho success (AC-10) và summary tự sinh kỳ (AC-8).
- KHÔNG silent fail — mọi lỗi mutation (`ERR-AP-010/011/012`, `ERR-CMN-*`) phải reach UI.

### 4.3 i18n + a11y

- **i18n policy**: mọi label/placeholder/error string qua i18n key (`src/i18n/{vi,en}.json`, namespace `inventoryAccountingPeriod.create.*`) — KHÔNG hardcode tiếng Việt inline trong component. Giá trị `vi` PHẢI verbatim đúng theo AC text (vd "Tên kỳ kế toán là bắt buộc", "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại.") — không paraphrase.
- a11y: mọi form field có `<label>` liên kết `htmlFor`/`id` + `aria-describedby` cho error; nút icon-only (BackLink) có `aria-label`; radio group có `role="radiogroup"` + keyboard arrow-nav; Tab order tự nhiên theo DOM (Radio → Checkbox → FieldGrid row1 → row2 → row3 → Mô tả → action buttons).
- Semantic HTML — không dùng `<div>` cho clickable (dùng `<button>`/`<a>` qua `share/buttons/button` và `share/navigates/link`).

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` gate route ở `beforeLoad` — chưa bật → 404/redirect (đồng nhất pattern W03).
- Persona check: `garage-owner` và `accountant` quyền ngang nhau theo AC-12 — KHÔNG ẩn/disable action theo role.
- Tab/route gate: unauthenticated → redirect login (pattern chung app).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (`features/be/FEAT-AP-CREATE.md §9` — khi tier BE được author). FE chỉ:
  - Inline validation: required field trước submit (AC-3, AC-4, AC-6), constrain năm không chọn quá khứ (BR-AP-003a — disable option, không chỉ validate on-submit).
  - Disable nút "Tạo" khi `!isValid || isSubmitting` hoặc dropdown "Thuộc kỳ" rỗng (EC-1).
  - Toast/inline khi server reject với `ERR-AP-010/011/012`.

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF/BE) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-AP-010` INVALID_PARENT | INLINE (gắn field "Thuộc kỳ") | `share/inputs/input-select` FormMessage | AC-5, AC-9 |
| `ERR-AP-011` OVERLAP_RANGE | INLINE (gắn field ngày) hoặc banner nếu không rõ field | `share/date-picker/date-picker` FormMessage | AC-9 |
| `ERR-AP-012` INVALID_LEVEL | INLINE (gắn radio group) | `PeriodTypeRadioGroup` error slot | AC-2, AC-4 |
| `ERR-AP-020` NOT_FOUND (parent id không hợp lệ, edge) | INLINE (gắn field "Thuộc kỳ") | `share/inputs/input-select` | AC-5 |
| `ERR-CMN-validation` (required field chung) | INLINE | tương ứng field | AC-3, AC-6 |
| (network/timeout) | TOAST | `share/toasts/toast` | AC-10 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `AccountingPeriodCreatePage` | `/inventory/accounting-periods/new` | NEW | `14146:87555` (frames `13521:66036` / `13523:68171` / `13523:68476`) | AC-1..AC-12 |

> Route naming theo convention plural + `/new` suffix (nhất quán `FEAT-AP-LIST` = `/inventory/accounting-periods`, `FEAT-AP-DETAIL` = `/inventory/accounting-periods/:id`, `FEAT-AP-EDIT` = `/inventory/accounting-periods/:id/edit`). Figma §1 Layout DSL tự ghi chú route `/inventory/accounting-period/create` (số ít) — không dùng trực tiếp vì lệch convention REST-plural đã thiết lập của slice AP; giữ naming nhất quán trong `src/routes/`.

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Bundle §G.X báo "KG parse error — scan filesystem manually"; author dùng `.claude/references/web-component-registry.yaml` (CANONICAL per CLAUDE.md item #12, thay thế KG `implementation.components` cho UI lookup) — registry v3, 84 entries. Scan `customs/` → `share/` → `ui/` cho từng need; không có entry nào tại cả 3 layer cho "radio group" (không tồn tại category `radios` trong §1 lookup hay §2 entries) → build-new.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, backLink, actions }` | — | **Priority 2 — share/** (`page-header` lookup key) | AC-1 |
| `BackLink` | `src/components/share/buttons/button.tsx` (variant ghost icon) | REUSE | `{ onClick, iconOnly }` | — | **Priority 2 — share/** | AC-1 |
| `PeriodTypeRadioGroup` (kebab-case `period-type-radio-group`) | `src/features/inventory-accounting-period/components/period-type-radio-group.tsx` | **NEW** | `{ value, onChange, showAutoGenerate }` | local | **Build-new** — justification: registry §1/§2 không có category "radios"/"radio-group" ở customs/share/ui (chỉ có `form-checkbox*`); confirm filesystem thực tế qua `/allow-new-component` trước khi tạo file (per FM-018/FM-019) | AC-2, AC-8 |
| `TuDongSinhKyCheckbox` | `src/components/share/checkboxs/checkbox.tsx` | REUSE | `{ checked, onChange, label }` | — | **Priority 2 — share/** (`form-checkbox` lookup key) | AC-8 |
| `NamSelect` (Năm field) | `src/components/share/selects/select-label.tsx` | REUSE | `{ options, value, onChange }` | — | **Priority 2 — share/** (`select-with-label` lookup key — enum tĩnh 50 giá trị) | AC-4 |
| `ThuocKySelect` (Thuộc kỳ field) | `src/components/share/inputs/input-select.tsx` | REUSE | `{ name, label, options, isLoading, hasMore, loadMore }` | server-loaded | **Priority 2 — share/** (`form-combo-select` lookup key) | AC-4, AC-5 |
| `TenKyKeToanInput` | `src/components/share/inputs/input.tsx` | REUSE | `{ name, label, required }` | — | **Priority 2 — share/** (`form-text-input` lookup key) | AC-3 |
| `NgayBatDauPicker` / `NgayKetThucPicker` | `src/components/share/date-picker/date-picker.tsx` (×2 instance) | REUSE | `{ name, label, format }` | — | **Priority 2 — share/** (`form-date-picker` lookup key) — 2 instance riêng biệt theo Figma layout, không gộp thành 1 range-picker | AC-6, AC-9 |
| `ThuTuHienThiInput` | `src/components/share/inputs/input-number.tsx` | REUSE | `{ name, label, min: 0 }` | — | **Priority 2 — share/** (`form-number-input` lookup key) | AC-7 |
| `TrangThaiSelect` | `src/components/share/selects/select-label.tsx` | REUSE | `{ options: [Chưa đóng, Đã đóng], default }` | — | **Priority 2 — share/** (`select-with-label` lookup key) | AC-7 |
| `MoTaTextarea` | `src/components/share/textareas/textarea.tsx` | REUSE | `{ name, label, placeholder }` | — | **Priority 2 — share/** (`form-textarea` lookup key) | AC-7 |
| `CancelButton` / `CreateButton` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant, isLoading, disabled, onClick }` | — | **Priority 2 — share/** (`primary-button` lookup key) | AC-10, AC-11 |
| `SuccessToast` / `AutoGenerateSummaryToast` | `src/components/share/toasts/toast.tsx` | REUSE | `{ variant: 'success', message }` | — | **Priority 2 — share/** (`toast-notification` lookup key) | AC-8, AC-10 |
| `ThongTinChungSection` | `src/components/share/containers/section.tsx` | REUSE | `{ title, children }` | — | **Priority 2 — share/** (`section-block` lookup key) | AC-1 |

### 5.3 Design tokens & Figma refs

> Design tokens khớp bundle §G.Y "Design tokens referenced" (`bg-brand`, `text-foreground`, `text-muted-foreground`, `text-primary`) — bảng dưới là superset đọc trực tiếp từ figma spec §2 Design Token Map (nguồn đầy đủ hơn, không mâu thuẫn với bundle, chỉ chi tiết hơn).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-background` | `tailwind.config.js` | Page/Input/Select/Textarea background | (layout) |
| `bg-brand` | `tailwind.config.js` | Navbar background, `CreateButton` background | AC-10 |
| `text-foreground` | tokens | PageTitle, FormField label, Radio/Checkbox text | (layout) |
| `text-primary` | tokens | active tab underline ("Kỳ kế toán" tab state) | AC-1 |
| `text-primary-foreground` | tokens | `CreateButton` text color | AC-10 |
| `text-destructive` | tokens | required asterisk `*`, inline error text | AC-3, AC-9 |
| `text-muted-foreground` | tokens | placeholder text, trailing icon color | AC-6, AC-7 |
| `border-input` | tokens | Input/Select/Textarea border, `CancelButton` border | (layout) |
| `rounded-md` | tokens | Input/Select radius | (layout) |
| `h-9` | tokens | Input/Select/Button height (36px) | (layout) |
| `text-2xl` / `font-semibold` | tokens | PageTitle (24px/600) | AC-1 |
| `text-base` / `font-semibold` | tokens | SectionTitle "Thông tin chung" (16px/600) | AC-1 |
| `text-sm` / `font-medium` | tokens | FormField label (14px/500) | (layout) |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo Figma `wave04-ap-create.md`. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `createAccountingPeriod` | mutation | `src/api/graphql/create-accounting-period.graphql` | — (invalidates `['accounting-periods']`) | `AccountingPeriodFragment` | AC-8, AC-9, AC-10 |
| `searchAccountingPeriods` | query | `src/api/graphql/search-accounting-periods.graphql` | `['accounting-periods', filter]` | `AccountingPeriodFragment` | AC-4, AC-5 |

> **NEED CONFIRMATION**: tên op chính xác chưa xác nhận vì `features/bff/FEAT-AP-CREATE.md` chưa được author tại thời điểm spawn này (bundle §G báo "API không có section match keyword Create"). Tên `createAccountingPeriod` / `searchAccountingPeriods` là provisional, theo naming §5 Field Composition Schema (`CreateAccountingPeriodInput`/`CreateAccountingPeriodResult`) của figma spec + REST V4-AP-1/V4-AP-2. Verify lại với paired BFF FEAT §6.1 khi tier đó được generate — cross-tier reciprocity item #16.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

_(không có — mọi truy cập qua BFF `agg-garage-graph` theo pattern chuẩn)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (parent options) | TanStack Query | — | `['accounting-periods', { level, status: 'OPEN' }]` | AC-5 |
| Server state (mutation) | TanStack Mutation | — | `useMutation(createAccountingPeriod)` | AC-10 |
| Form state | react-hook-form | local | — | AC-2..AC-9 |
| Client state (periodType-driven visibility) | react-hook-form `watch` | local | `form.periodType` | AC-4, AC-8 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/accounting-periods/new` | `AccountingPeriodCreatePage` | `loader() => prefetch searchAccountingPeriods(level=NAM)` (warm cache cho "Thuộc kỳ" nếu user chọn Quý ngay) | `beforeLoad`: feature flag `Inventory:InventoryV2` | AC-1, AC-4, AC-5, AC-12 |

## 7. File/module impact map (FE Web — feature slice)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-accounting-period/pages/` | `accounting-period-create-page.tsx` | NEW | compose share/* form fields | ~220 | AC-1..AC-12 |
| `src/features/inventory-accounting-period/components/` | `period-type-radio-group.tsx` | NEW (build-new, xem §5.2) | Radix RadioGroup + `ui/` primitives compose | ~90 | AC-2, AC-8 |
| `src/features/inventory-accounting-period/hooks/` | `use-create-accounting-period.ts` | NEW | TanStack mutation wrapper | ~40 | AC-10 |
| `src/features/inventory-accounting-period/hooks/` | `use-accounting-periods-for-parent-select.ts` | NEW | TanStack query wrapper | ~35 | AC-5 |
| `src/features/inventory-accounting-period/types/` | `accounting-period.types.ts` | NEW | TypeScript types | ~30 | — |
| `src/api/graphql/` | `create-accounting-period.graphql` | ADDITIVE | persisted mutation | ~25 | AC-8, AC-10 |
| `src/api/graphql/` | `search-accounting-periods.graphql` | ADDITIVE (có thể share với `FEAT-AP-LIST`) | persisted query | ~20 | AC-5 |
| `src/api/generated/` | `*.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/i18n/vi,en/` | `inventory-accounting-period.json` | ADDITIVE | i18next namespace | ~40 | AC-1..AC-10 |
| `src/routes/` | `inventory/accounting-periods.new.tsx` | NEW | TanStack Router file route | ~15 | AC-1, AC-12 |
| `tests/` | `tests/features/inventory-accounting-period/accounting-period-create-page.test.tsx` | NEW | Vitest + RTL | ~200 | AC-1..AC-12 |

> Sidebar/SubNav tab "Kỳ kế toán" (`share/tabs/tab-buttons`) là component **chia sẻ** giữa AP-LIST/DETAIL/CREATE/EDIT — được thêm 1 lần bởi `FEAT-AP-LIST` (entry point của slice); FE-web tier này chỉ REUSE, không tạo lại. Coordinate qua §12.

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver createAccountingPeriod/searchAccountingPeriods stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave04-ap-create.md ACTIVE)
    Exit: E2E happy path green (smoke — tạo kỳ Năm không auto-generate)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Form 3-variant + validation + GraphQL wire + i18n + a11y | features + routes + i18n | BFF S5 stable | E2E smoke green | BFF S5 (`createAccountingPeriod`, `searchAccountingPeriods`) |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ inline hint + RBAC render + error mapping. Primary enforcement = BE tier (`features/be/FEAT-AP-CREATE.md §9`).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-003` | CORNERSTONE | radio group quyết định field variant | `period-type-radio-group.tsx` | AC-2, AC-4 | 3 loại kỳ phân cấp |
| `BR-AP-003a` | CORNERSTONE | Năm dropdown chỉ `[currentYear..+49]`, disable option quá khứ | `accounting-period-create-page.tsx::yearOptions` | AC-4 | client-side constrain, không chỉ validate |
| `BR-AP-004` | CORNERSTONE | "Thuộc kỳ" required khi Quý/Tháng | `thuoc-ky-select` FormField | AC-4, AC-5 | required conditional |
| `BR-AP-005` | CORNERSTONE | inline required across form | tất cả field bắt buộc | AC-3, AC-4, AC-5, AC-6 | required set |
| `BR-AP-006` | CORNERSTONE | client-side `endDate >= startDate` check trước submit | `accounting-period-create-page.tsx::validateDateRange` | AC-9 | BE final enforce |
| `BR-AP-007` | CORNERSTONE | hiển thị lỗi khi server reject phạm vi kỳ cha (không tự validate client vì cần data cây đầy đủ) | error mapping §4.6 | AC-9 | server authoritative |
| `BR-AP-008` | CORNERSTONE | hiển thị lỗi chồng lấn khi server reject | error mapping §4.6 (`ERR-AP-011`) | AC-9 | server authoritative |
| `BR-AP-009` | NORMAL | render summary toast "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại." | success toast handler | AC-8 | non-blocking info |

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | mở form, verify title + action row |
| AC-2 | UI | test-ui | radio switch, field variant re-render |
| AC-3 | UI (form validation, negative) | test-ui | bỏ trống tên → error "Tên kỳ kế toán là bắt buộc" |
| AC-4 | UI | test-ui | Năm select (kỳ Năm) vs Thuộc kỳ select (Quý/Tháng) |
| AC-5 | UI (server-loaded options) | test-ui | filter đúng theo level; EC-1 empty-state |
| AC-6 | UI | test-ui | nhập 2 ngày, format DD/MM/YYYY |
| AC-7 | UI (defaults) | test-ui | default Thứ tự=0, Trạng thái="Chưa đóng", Mô tả placeholder |
| AC-8 | UI + integration | test-ui | checkbox visibility Năm/Quý only; summary toast wording verbatim |
| AC-9 | UI (negative validation) | test-ui | end<start, out-of-parent-range, overlap → error mapping đúng field |
| AC-10 | UI (happy path) | test-ui + test-e2e | submit success → toast + navigate list |
| AC-11 | UI | test-ui | huỷ bỏ không lưu, navigate back |
| AC-12 | UI (RBAC) | test-ui + test-isolation | dual persona đều truy cập được, flag `Inventory:InventoryV2` gate |
| (smoke) | E2E happy path | test-e2e | Playwright — tạo kỳ Năm không auto-generate |

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventoryAccountingPeriod.create.title` | "Thêm kỳ kế toán" | "Add accounting period" | AC-1 |
| `inventoryAccountingPeriod.create.actions.cancel` | "Huỷ bỏ" | "Cancel" | AC-11 |
| `inventoryAccountingPeriod.create.actions.submit` | "Tạo" | "Create" | AC-10 |
| `inventoryAccountingPeriod.create.field.name.errorRequired` | "Tên kỳ kế toán là bắt buộc" | "Period name is required" | AC-3 |
| `inventoryAccountingPeriod.create.field.autoGenerate` | "Tự động sinh kỳ" | "Auto-generate child periods" | AC-8 |
| `inventoryAccountingPeriod.create.success.autoGenerateSummary` | "Đã tạo {created} kỳ, bỏ qua {skipped} kỳ đã tồn tại." | "Created {created} periods, skipped {skipped} existing." | AC-8 |
| `inventoryAccountingPeriod.create.field.status.open` | "Chưa đóng" | "Open" | AC-7 |
| `inventoryAccountingPeriod.create.field.status.closed` | "Đã đóng" | "Closed" | AC-7 |

> Danh sách đầy đủ 28 key ở frontmatter `i18n_keys`.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-2 | `role="radiogroup"` + arrow-key nav giữa 3 radio | keyboard operable |
| AC-3 | Error announce via `aria-describedby` khi bỏ trống | inline error link |
| AC-5 | Combobox pattern chuẩn (`aria-expanded`, `aria-activedescendant`) cho "Thuộc kỳ" | server-loaded, cần `aria-busy` khi loading |
| AC-8 | Checkbox `aria-label`; summary toast `role="status"` aria-live polite | non-intrusive announce |
| AC-9 | Cross-field error banner khi không gắn được field cụ thể — `role="alert"` | overlap/out-of-range errors |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-CREATE.md` | PENDING (chưa generate tại thời điểm spawn này) | BR primary enforcement (BR-AP-001..009, BR-AP-003a), REST contract `POST /protected/accounting/v1/accounting-periods` (V4-AP-2) |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-CREATE.md` | PENDING (chưa generate tại thời điểm spawn này) | GraphQL ops `createAccountingPeriod` / `searchAccountingPeriods` — verify tên op chính xác khi tier này sẵn sàng (§6.1 NEED CONFIRMATION) |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-AP-CREATE.md` | N/A (out of scope W04 — mobile chỉ có `FEAT-INV-MOBILE-MENU` hub 3-tile, không có màn AP CRUD mobile wave này) | — |
| Sibling FE-web | `features/fe-web/FEAT-AP-LIST.md` | PENDING | Chủ sở hữu SubNav tab "Kỳ kế toán" + nút "Thêm kỳ kế toán" (entry point navigate vào trang này) |

**Source ID consistency** (item 18): `source_feat_sha` = `fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c` — PHẢI identical với BE/BFF/Mobile files khi các tier đó được generate.

## 13. References

- **Source**: [`Product/features/FEAT-AP-CREATE.md`](../../../../../Product/features/FEAT-AP-CREATE.md) v6
- **Paired BE**: [`features/be/FEAT-AP-CREATE.md`](../be/FEAT-AP-CREATE.md) (khi generated)
- **Paired BFF**: [`features/bff/FEAT-AP-CREATE.md`](../bff/FEAT-AP-CREATE.md) (khi generated)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §3.1
- **Figma spec**: [`Product/ux/figma-web/wave04-ap-create.md`](../../../../../Product/ux/figma-web/wave04-ap-create.md) (node `14146:87555`)
- **HLD Web**: `Architecture/hld/garage-web-HLD.md`
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml) v3
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-AP-CREATE` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm FE Web, §3 FE behaviour map 12/12 AC-ID, §4 visual fidelity + state + i18n + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (3-variant screen breakdown, component reuse-first customs/share/ui, GraphQL ops consumed [NEED CONFIRMATION tên op — paired BFF chưa generate], state management, file map, cross-tier pair). Source FEAT chỉ audit. Component `period-type-radio-group` build-new do registry không có category radio-group.
