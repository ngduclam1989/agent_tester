---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-EDIT.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-EDIT"
source_feat_sha: "17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416"
generated_at: "2026-07-08T05:30:00+00:00"
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
consumes_backend_feats: ["FEAT-AP-EDIT"]
consumes_bff_feats: ["FEAT-AP-EDIT"]
i18n_keys: []                                          # fixed VN labels inline — xem §4.3 (KHÔNG dùng i18next, đồng bộ pattern W02)
screens_touched:
  - "src/features/inventory-accounting-period/pages/AccountingPeriodEditPage.tsx"
  - "src/features/inventory-accounting-period/components/accounting-period-edit-form.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ap-edit.md (node 14146:87554 — 3 screens: Year variant 13523:68781, Q/M intermediate 13523:68806, Q/M final 13523:68831)"
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — hash tool không khả dụng trong spawn này; orchestrator backfill từ `_routing/FEAT-FAN-OUT-MAP.yaml` hiện hành"
  template_sha: "N/A — hash tool không khả dụng trong spawn này; orchestrator backfill từ `_TEMPLATE-feature-fe-web.md` hiện hành"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-EDIT.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
  kg_baseline_sha: "dbbc30b5b3547e6c117b2ebbefc200157de88044796b8476bf83d100c19e20fc"
paired_backend_feats: ["FEAT-AP-EDIT"]
paired_bff_feats: ["FEAT-AP-EDIT"]
paired_mobile_feats: []                                # AP slice không có mobile tier trong scope W04 (chỉ FEAT-INV-MOBILE-MENU hub — feature riêng, không mirror AP-EDIT)
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-EDIT (FE Web): Sửa Kỳ kế toán

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma spec: [`Product/ux/figma-web/wave04-ap-edit.md`](../../../../../Product/ux/figma-web/wave04-ap-edit.md) — Visual SSOT. Cross-tier coordination ở §12.
> **i18n KHÔNG dùng** — toàn bộ label render fixed tiếng Việt inline (xem §4.3).
> **Tier đầu tiên author cho FEAT-AP-EDIT trong W04** — BE (`gf-accounting`) + BFF (`agg-garage-graph`) tier spec chưa tồn tại tại thời điểm author file này; contract chi tiết (GraphQL op naming, error code cuối) cần verify khi 2 tier kia được author (đánh dấu NEED CONFIRMATION ở §6.1 + §4.6).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-EDIT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React 19 / TypeScript) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `AccountingPeriodEditPage` (full-page form, KHÔNG phải modal) |
| Cross-tier consume | BE: `FEAT-AP-EDIT` (gf-accounting) \| BFF: `FEAT-AP-EDIT` (agg-garage-graph) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-EDIT.md`](../../../../../Product/features/FEAT-AP-EDIT.md) |
| Source version | v7 |
| Source SHA | `17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416` |
| Figma spec | [`Product/ux/figma-web/wave04-ap-edit.md`](../../../../../Product/ux/figma-web/wave04-ap-edit.md) v7 (transform_version 7) |
| BR canonical | [`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) v27 (§2.1 BR-AP-001..016) |
| PKG | [`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md) |
| Generated at | 2026-07-08T05:30:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần chỉnh sửa một số thông tin hiển thị của kỳ kế toán (tên, mô tả, thứ tự hiển thị) và kiểm soát thời điểm chốt sổ bằng cách đóng/mở kỳ ngay trên danh mục, thay vì phải xóa-tạo-lại kỳ mỗi khi cần điều chỉnh nhãn hoặc khóa dữ liệu. Khi đóng một kỳ, mọi phiếu nhập/xuất kho có ngày chứng từ thuộc kỳ đó bị khóa chỉnh sửa — đảm bảo số liệu đã chốt không bị thay đổi ngoài ý muốn. Các trường định nghĩa khung kỳ (loại kỳ, thuộc kỳ, khoảng ngày) là bất biến sau khi tạo để giữ tính toàn vẹn cấu trúc phân cấp Năm→Quý→Tháng.

## 2. Trách nhiệm FE Web (garage-web)

- **Trang "Sửa Kỳ kế toán" full-page** (KHÔNG phải modal) tại route `/inventory/accounting-period/edit/:id` (theo Figma layout DSL — xem NEED CONFIRMATION §5.1 về route path chính thức), entry từ icon "Sửa" trên `FEAT-AP-LIST` hoặc nút "Chỉnh sửa" trên `FEAT-AP-DETAIL`.
- **Form pre-filled 10 trường** chia 4 editable (Tên kỳ kế toán, Mô tả, Thứ tự hiển thị, Trạng thái) + 6 locked (Loại kỳ radios, Năm/Thuộc kỳ, Ngày bắt đầu, Ngày kết thúc, Tự động sinh kỳ) — layout **2 biến thể** theo `periodTypeVariant` (`year` vs `quarter_or_month`): Row 1 hoán đổi vị trí cột giữa "Năm" (kỳ Năm) và "Thuộc kỳ" (kỳ Quý/Tháng); checkbox "Tự động sinh kỳ" chỉ hiển thị ở biến thể `year`.
- **State machine**: `idle → loading (prefetch chi tiết kỳ) → ready → submitting (Lưu) → success (toast + navigate back) / error`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (per `web-component-registry.yaml` — CANONICAL lookup cho garage-web UI work, thay `knowledge-graph.yaml implementation.components`): trước MỌI UI task, tra registry theo thứ tự ưu tiên `customs/` → `share/` → `ui/`. Form này không có nhu cầu domain-specific picker (không employee/warehouse/product select) nên hầu hết field match ở layer `share/` (Priority 2). Riêng nhóm radio "Loại kỳ" **không có component tương ứng** trong registry (không có category `radios`) — build-new cần `/allow-new-component` (xem §5.2).
- **Figma spec là visual SSOT**: layout, token, 3 screen state (`year` / `quarter_or_month` intermediate / `quarter_or_month` final) đều theo [`wave04-ap-edit.md`](../../../../../Product/ux/figma-web/wave04-ap-edit.md). §2/§4/§5 references cross-ref figma section tương ứng.
- **GraphQL**: query `getAccountingPeriodById` (loader prefetch chi tiết kỳ) + mutation `updateAccountingPeriod` (1 mutation gộp cả 4 field editable, gồm cả `status` — khớp REST endpoint `PUT /protected/accounting/v1/accounting-periods/{id}` single-endpoint per bundle §H V4-AP-4; xem NEED CONFIRMATION §6.1 về divergence với Figma DSL đề xuất 2 mutation tách rời).
- **RBAC + feature flag**: `garage-owner` và `accountant` quyền **ngang nhau** (BR-AP-CMN-002) — không gate theo role, chỉ gate theo `Inventory:InventoryV2` feature flag (route-level, seed default ON per PKG Entry gate).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Mỗi source AC-ID → 1 FE behaviour statement. Coverage: 8/8 AC-IDs cover ở §3 dưới.

### Cluster A — Mở form + pre-fill

#### AC-1 → FE render trang "Sửa Kỳ kế toán" pre-filled + header actions

- **Khi**: user click icon "Sửa" (FEAT-AP-LIST) hoặc nút "Chỉnh sửa" (FEAT-AP-DETAIL) trên 1 kỳ kế toán.
- **FE phải**: navigate tới `AccountingPeriodEditPage`, loader prefetch `getAccountingPeriodById(id)` → render `PageHeader` gồm: icon back (`←`) + tiêu đề `"Sửa Kỳ kế toán"` bên trái, `[Huỷ bỏ]` (outline) + `[Lưu]` (brand) bên phải. Section `"Thông tin chung"` chứa toàn bộ form pre-filled từ dữ liệu kỳ hiện tại (10 trường — xem AC-2/AC-3).
- **State transition**: `idle → loading (skeleton form) → ready (form pre-filled)`. Loader fail (404) → xem §4.6 error mapping.
- **Component**: `AccountingPeriodEditPage.tsx` (NEW) dùng `share/layouts/page-header` (REUSE) + `share/containers/section` (REUSE) cho khối "Thông tin chung".
- **GraphQL op**: query `getAccountingPeriodById(id: ID!)` — route loader prefetch (TanStack Router `loader`).
- **Label fixed**: `"Sửa Kỳ kế toán"` (page title), `"Thông tin chung"` (section title), `"Huỷ bỏ"` / `"Lưu"` (button).
- **a11y**: back link `aria-label="Quay lại"`; page title `<h1>`; focus vào `<h1>` khi route load xong.
- **Ref**: Figma spec §"## Screen: Sửa Kỳ kế toán — Year variant (13523:68781)" §1 Layout DSL `PageHeader`; FEAT bundle §C AC-1.

### Cluster B — Trường được phép sửa

#### AC-2 → FE render 4 trường editable + validate "Tên kỳ kế toán" bắt buộc

- **Khi**: form ready.
- **FE phải**: render 4 field editable (background trắng, border `border-input`, KHÔNG disabled):
  1. **Tên kỳ kế toán*** — `<Input>` bind `form.name`, `required`, validate rỗng → lỗi `"Tên kỳ kế toán là bắt buộc"` hiển thị inline dưới field. Vị trí cột (col 1 hoặc col 2 của Row 1) hoán đổi theo `periodTypeVariant` (xem AC-3).
  2. **Mô tả** — `<Textarea>` bind `form.description`, không bắt buộc, placeholder `"Nhập mô tả"`, 5 rows.
  3. **Thứ tự hiển thị** — `<InputNumber>` bind `form.displayOrder`, không bắt buộc, default `0`.
  4. **Trạng thái** — `<Select>` bind `form.status`, 2 options `"Chưa đóng"` / `"Đã đóng"` (verbatim per BR-AP-010/016 — KHÔNG dùng paraphrase "Đóng"/"Mở"; xem NEED CONFIRMATION về wording chính xác ở §4.6). Đổi giá trị Trạng thái không tự invoke mutation ngay — chỉ cập nhật form state cục bộ, commit khi user nhấn "Lưu" (xem Cluster D).
- **Không bắt buộc kiểm tra trùng tên** (BR-AP-002 explicit — Tên chỉ scoped theo garage, không unique constraint).
- **State transition**: `onChange` cập nhật form state local (react-hook-form); `onBlur` trim whitespace.
- **Component**: `share/inputs/input` (Tên), `share/textareas/textarea` (Mô tả), `share/inputs/input-number` (Thứ tự hiển thị), `share/selects/select-label` (Trạng thái) — tất cả REUSE Priority 2 `share/`.
- **GraphQL op**: (chưa invoke — chỉ commit ở AC-6 Lưu).
- **Label fixed**: `"Tên kỳ kế toán *"`, `"Mô tả"`, `"Thứ tự hiển thị"`, `"Trạng thái"`, error `"Tên kỳ kế toán là bắt buộc"`.
- **a11y**: mỗi field có `<label>` + `aria-required="true"` cho Tên; error message `aria-describedby` trỏ input.
- **Ref**: Figma spec §1 Layout DSL `FieldGrid.Row1Col1/Col2` (variant-conditional), `Row3Col1/Col2`, `MoTaField`; BR-AP-016 (danh sách trường editable); FEAT bundle §C AC-2.

### Cluster C — Trường bị khóa

#### AC-3 → FE render 6 trường locked (readonly/disabled) theo đúng biến thể loại kỳ

- **Khi**: form ready.
- **FE phải**: render 6 field **disabled** (background `bg-muted`, text `text-muted-foreground`), KHÔNG cho phép edit:
  1. **Loại kỳ** — 3 `RadioItem` ("Kỳ kế toán năm" / "Kỳ kế toán quý" / "Kỳ kế toán tháng"), radio tương ứng `period.level` được select nhưng **toàn bộ radio group disabled**.
  2. **"Tự động sinh kỳ"** checkbox — **CHỈ hiển thị khi `periodTypeVariant === 'year'`** (radio group width 593 có checkbox vs 438 không có, theo metadata Figma); disabled, hiển thị giá trị `period.autoGenerate` read-only.
  3. **Năm** (biến thể `year`) hoặc **Thuộc kỳ** (biến thể `quarter_or_month`) — field readonly ở Row 1, vị trí cột hoán đổi với Tên kỳ kế toán theo biến thể (year: Năm ở col 1, Tên ở col 2; quarter/month: Tên ở col 1, Thuộc kỳ ở col 2). "Năm" hiển thị năm hiện tại của kỳ; "Thuộc kỳ" hiển thị `period.parentPeriod.displayName`.
  4. **Ngày bắt đầu*** — `<DateInput>` readonly, format `DD/MM/YYYY`, trailing icon Calendar.
  5. **Ngày kết thúc*** — `<DateInput>` readonly, format `DD/MM/YYYY`, trailing icon Calendar.
- **KHÔNG render Select dropdown thay Loại kỳ, KHÔNG ẩn hoàn toàn radio group** — radio vẫn hiển thị nhưng disabled, giúp user thấy được loại kỳ hiện tại (anti-pattern AP-AP-EDIT-2 per Figma §8).
- **Escape hatch** (informational, NEED CONFIRMATION — Figma không có tooltip UI cho hint này, khuyến nghị thêm nếu BA duyệt): muốn đổi loại kỳ/năm/khoảng ngày → phải xóa kỳ (nếu đủ điều kiện BR-AP-013/014) và tạo lại (BR-AP-016 escape hatch clause).
- **State**: static display, không có transition (locked suốt vòng đời form).
- **Component**: `share/radios/radio-group-inline` (**BUILD-NEW** — xem §5.2 justification), `share/checkboxs/checkbox` (REUSE, disabled variant), `share/inputs/input` (REUSE, disabled + `bg-muted` variant cho Năm/Thuộc kỳ), `share/date-picker/date-picker` (REUSE, disabled variant cho Ngày bắt đầu/kết thúc).
- **GraphQL op**: không có (data từ query `getAccountingPeriodById` đã prefetch AC-1).
- **Label fixed**: `"Kỳ kế toán năm"` / `"Kỳ kế toán quý"` / `"Kỳ kế toán tháng"`, `"Tự động sinh kỳ"`, `"Năm *"`, `"Thuộc kỳ *"`, `"Ngày bắt đầu *"`, `"Ngày kết thúc *"`.
- **a11y**: disabled input vẫn có `<label>` liên kết (không ẩn accessibility tree); `aria-disabled="true"` explicit trên radio group + checkbox.
- **Ref**: Figma spec §1 Layout DSL `LoaiKyRadioRow` + `Row1Col1/Col2` + `Row2Col1/Col2`; §8 Anti-Pattern Trap AP-AP-EDIT-1/2/3; BR-AP-016 (danh sách trường locked, cập nhật v26 today — đồng bộ "Năm" locked); FEAT bundle §C AC-3.

### Cluster D — Đổi trạng thái đóng/mở kỳ

#### AC-4 → FE handle chuyển Trạng thái "Chưa đóng" → "Đã đóng" (đóng kỳ) với confirm danger

- **Khi**: user đổi Trạng thái Select từ `"Chưa đóng"` sang `"Đã đóng"` và nhấn `"Lưu"`.
- **FE phải**: trước khi submit mutation, hiển thị **`AlertConfirm` (danger variant)**: title `"Đóng kỳ kế toán?"`, description `"Sau khi đóng, mọi phiếu nhập/xuất kho có ngày chứng từ thuộc kỳ này sẽ bị khóa chỉnh sửa. Bạn có chắc chắn muốn đóng kỳ?"`, action `[Huỷ]` (secondary) + `[Đóng kỳ]` (destructive). Confirm → invoke mutation `updateAccountingPeriod` với `status: "Đã đóng"` gộp cùng các field khác đã sửa. Huỷ → đóng dialog, giữ nguyên form state (không revert Select value, user có thể sửa lại).
- **Side-effect (BE enforce — informational)**: sau khi đóng, `gf-accounting` khóa tính giá (CREATE/RECALC) cho kỳ (BR-PRC-008) + `gf-inventory` chặn thêm/sửa/xóa phiếu nhập/xuất có ngày chứng từ thuộc kỳ (BR-AP-012, mã lỗi `ERR-INV-024`) qua REST lock-check advisory (ADR-021) — FE-web KHÔNG trực tiếp implement phần này, chỉ hiển thị confirm + gọi mutation.
- **NEED CONFIRMATION**: Figma spec (`wave04-ap-edit.md` §8 anti-pattern AP-AP-EDIT-5) hiện KHÔNG có confirm dialog — Trạng thái đổi + Lưu là 1-step commit theo frame đã fetch. Quyết định thêm `AlertConfirm` danger ở đây theo yêu cầu Focus của task orchestrator (do tác động khóa dữ liệu diện rộng); BA/design cần xác nhận trước khi promote ACTIVE — nếu BA giữ nguyên "không dialog" thì bỏ bước confirm này, giữ submit trực tiếp.
- **State transition**: `ready → confirm-dialog-open → (Huỷ: ready) / (Đóng kỳ: submitting → success/error, xem AC-6)`.
- **Component**: `share/dialogs/alert-confirm` (REUSE — "Hỏi xác nhận hành động nguy hiểm").
- **GraphQL op**: `updateAccountingPeriod` (invoke sau confirm, cùng luồng với AC-6).
- **Label fixed**: `"Đóng kỳ kế toán?"`, `"Sau khi đóng, mọi phiếu nhập/xuất kho có ngày chứng từ thuộc kỳ này sẽ bị khóa chỉnh sửa. Bạn có chắc chắn muốn đóng kỳ?"`, `"Huỷ"`, `"Đóng kỳ"`.
- **a11y**: `AlertConfirm` shadcn built-in focus trap + `aria-describedby` mô tả; Escape = Huỷ.
- **Ref**: BR-AP-012 (lock effect); ADR-021 (lock-check REST advisory từ gf-inventory); Figma §8 AP-AP-EDIT-4/5 (anti-pattern — auto-invoke trước Save, hoặc dialog wording khác); FEAT bundle §C AC-4.

#### AC-5 → FE handle chuyển Trạng thái "Đã đóng" → "Chưa đóng" (mở lại kỳ) — không ràng buộc thứ tự, cảnh báo RECALC thủ công

- **Khi**: user đổi Trạng thái Select từ `"Đã đóng"` sang `"Chưa đóng"` và nhấn `"Lưu"`.
- **FE phải**: KHÔNG cần confirm dialog (per Figma default — chỉ đóng kỳ mới cần danger confirm ở AC-4; mở lại là hành động khôi phục, rủi ro thấp hơn). Submit mutation `updateAccountingPeriod` với `status: "Chưa đóng"` trực tiếp. Sau khi success, hiển thị **advisory banner/toast bổ sung** (khuyến nghị theo Figma Coverage Gaps — NEED CONFIRMATION về wording chính xác + có nên block bằng dialog thay vì toast): `"Kỳ đã được mở lại. Nếu cần cập nhật số liệu, vui lòng tự chạy lại Tính giá xuất kho (RECALC) cho kỳ này."`.
- **Không ràng buộc thứ tự đóng/mở** (BR-AP-011): user có thể mở lại bất kỳ kỳ nào độc lập, không cần mở lại kỳ liền trước.
- **Side-effect (BE enforce — informational)**: mở lại kỳ **KHÔNG** tự động trigger RECALC (BR-PRC-015) — user phải tự vào `FEAT-PRC-RECALC` để chạy lại tính giá nếu cần.
- **State transition**: `ready → submitting → success (toast + advisory banner) / error`.
- **Component**: advisory banner/toast dùng `share/toasts/toast` (REUSE, variant info, thời lượng dài hơn default hoặc persistent banner tùy UX quyết định).
- **GraphQL op**: `updateAccountingPeriod` (cùng luồng AC-6).
- **Label fixed**: `"Kỳ đã được mở lại. Nếu cần cập nhật số liệu, vui lòng tự chạy lại Tính giá xuất kho (RECALC) cho kỳ này."`.
- **a11y**: advisory toast `aria-live="polite"`.
- **Ref**: BR-AP-011 (không ràng buộc thứ tự); BR-PRC-015 (cảnh báo RECALC thủ công); Figma Coverage Gaps ("Đề xuất thêm advisory banner khi user switches Trạng thái Đã đóng → Chưa đóng"); FEAT bundle §C AC-5.

### Cluster E — Lưu / Huỷ bỏ

#### AC-6 → FE invoke mutation "Lưu" — cập nhật form fields + trạng thái, toast success, navigate back

- **Khi**: user nhấn nút `"Lưu"` (đã pass validate AC-2 + confirm dialog nếu đóng kỳ theo AC-4).
- **FE phải**: invoke mutation `updateAccountingPeriod(input: { id, name, description, displayOrder, status })` — gộp toàn bộ 4 field editable trong 1 lần gọi (KHÔNG tách 2 mutation riêng cho status — xem NEED CONFIRMATION §6.1). Disable toàn bộ form + button trong lúc `submitting`.
- **State transition**: `ready → submitting (spinner trên nút Lưu, disable form) → success (toast "Cập nhật kỳ kế toán thành công" + navigate back tới FEAT-AP-DETAIL hoặc FEAT-AP-LIST tuỳ entry point) / error (xem §4.6, giữ form mở, cho phép sửa lại + retry)`.
- **Component**: `SaveButton` (`share/buttons/button` variant brand, `isLoading` prop khi submitting) trong `AccountingPeriodEditPage.tsx`.
- **GraphQL op**: `updateAccountingPeriod` mutation.
- **Label fixed**: `"Lưu"` (button), `"Cập nhật kỳ kế toán thành công"` (toast success).
- **a11y**: button `aria-busy="true"` khi submitting; toast `aria-live="polite"`.
- **Ref**: Figma spec §1 Layout DSL `SaveButton.onClick`; FEAT bundle §C AC-6.

#### AC-7 → FE handle "Huỷ bỏ" — đóng form không lưu

- **Khi**: user nhấn nút `"Huỷ bỏ"` hoặc icon back `←`.
- **FE phải**: navigate back (`navigate(-1)`) không lưu bất kỳ thay đổi nào. Nếu form đang `dirty` (đã sửa nhưng chưa Lưu) — KHÔNG có prompt xác nhận theo Figma hiện tại (khác pattern modal-based feature ở W02 vốn có dirty-check prompt vì đây là full-page form, không phải modal có nguy cơ mất context nhanh); user tự chịu trách nhiệm khi rời trang.
- **State transition**: `ready (dirty hoặc clean) → navigate back`.
- **Component**: `CancelButton` (`share/buttons/button` variant outline) + `BackLink` (icon button).
- **GraphQL op**: không có.
- **Label fixed**: `"Huỷ bỏ"`.
- **a11y**: `aria-label="Huỷ bỏ"` / `"Quay lại"`.
- **Ref**: Figma spec §1 Layout DSL `CancelButton.onClick` / `BackLink.onClick`; FEAT bundle §C AC-7.

### Cluster F — Phân quyền

#### AC-8 → FE cho phép garage-owner và accountant thao tác ngang quyền

- **Khi**: user (bất kỳ role nào trong 2 persona) mở trang Sửa Kỳ kế toán.
- **FE phải**: KHÔNG áp thêm role-based gating trên trang này ngoài yêu cầu đăng nhập hợp lệ + feature flag `Inventory:InventoryV2` ON — cả `garage-owner` và `accountant` thấy đầy đủ form + có thể Lưu/Đóng/Mở kỳ như nhau (BR-AP-CMN-002).
- **Feature flag gate**: route `/inventory/accounting-period/edit/:id` guard bằng `Inventory:InventoryV2` flag (route loader check `useFeatureFlag('Inventory:InventoryV2')`) — flag OFF → redirect về trang danh mục sản phẩm mặc định.
- **Component**: route guard trong `src/routes/inventory-accounting-period-routes.tsx`.
- **GraphQL op**: không có (auth context resolve ở app-level).
- **Ref**: BR-AP-CMN-002 (quyền ngang nhau); PKG Entry gate (`Inventory:InventoryV2` seed default ON); FEAT bundle §C AC-8.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám sát 3 screen state trong [`wave04-ap-edit.md`](../../../../../Product/ux/figma-web/wave04-ap-edit.md): Year variant (13523:68781), Quarter/Month intermediate (13523:68806, dùng chung PNG với final), Quarter/Month final (13523:68831). KHÔNG re-invent layout khác — đặc biệt KHÔNG thêm progress bar / badge / tab nội bộ.
- Design tokens: `bg-background`, `bg-brand`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`, `border-input`, `text-destructive` — lấy từ `tailwind.config.js` / `src/index.css`, khớp §G.Y "Design tokens referenced" (anti-hallucination guard).
- Radio group width thay đổi theo biến thể (593px year có checkbox / 438px quarter-month không checkbox) — implement bằng conditional render, KHÔNG hard-code width cố định.
- Mỗi visual AC (radio disabled state, muted-bg readonly field, editable white-bg field) MUST cross-ref figma §1 Layout DSL node tương ứng — xem §3 mỗi AC.

### 4.2 State machine + error handling

- State tường minh cấp trang: `idle | loading | ready | submitting | success | error`. Cấp dialog: `closed | confirm-open` (AC-4).
- Error → hiển thị theo display mode §4.6, KHÔNG silent fail.
- `submitting` disable toàn bộ form + 2 button header (Huỷ bỏ, Lưu) để tránh double-submit.

### 4.3 i18n + a11y

- **KHÔNG dùng i18next** — toàn bộ label hardcode tiếng Việt inline trong component JSX, verbatim theo Figma spec + BR-GF-INVENTORY-ACCOUNTING-PERIOD.md wording (BR-AP-010/016). `i18n_keys: []` frontmatter — quyết định đồng bộ pattern W02 (`FEAT-INS-DOSSIER-CREATE`) cho wave-spec fixed-VN.
- a11y: mọi `<label>` liên kết field kể cả field disabled; button icon-only có `aria-label`; keyboard nav Tab order theo thứ tự visual (Loại kỳ radios → checkbox → Row1 → Row2 → Row3 → Mô tả → Huỷ bỏ/Lưu); dialog focus trap + Escape.
- Semantic HTML — KHÔNG dùng `<div>` cho clickable (radio/checkbox/button dùng component có sẵn built-in semantic).

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` (seed default ON per PKG Entry gate) gate route-level.
- Persona check: `garage-owner` và `accountant` quyền ngang nhau (BR-AP-CMN-002) — KHÔNG có conditional render theo role trên trang này.
- Route unauthenticated → redirect login (baseline app behavior).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-AP-EDIT.md §9` khi được author). FE chỉ UI hint:
  - Inline validation "Tên kỳ kế toán là bắt buộc" trước submit (BR-AP-016 + FEAT AC-2).
  - Disable Save button khi form invalid (Tên rỗng) hoặc đang submitting.
  - Confirm dialog danger khi đóng kỳ (AC-4 — xem NEED CONFIRMATION).
  - Advisory banner khi mở lại kỳ nhắc RECALC thủ công (BR-PRC-015, AC-5).

### 4.6 Error code mapping (consume từ BFF)

> **NEED CONFIRMATION**: bundle §H (PKG-extracted BE table) dùng mã lỗi `ERR-AP-0XX` cho REST endpoint AP (vd `ERR-AP-013 HAS_CHILDREN_STRICT`, `ERR-AP-020 NOT_FOUND`), trong khi BR canonical `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27 đăng ký mã lỗi dạng `ERR-INV-0XX` (vd `ERR-INV-024 ACCOUNTING_PERIOD_CLOSED` cho BR-AP-012). Hai namespace chưa reconcile — bảng dưới dùng mã theo bundle §H (gần nhất với REST contract thực tế của endpoint `PUT .../accounting-periods/{id}`); BE tier author cần xác nhận mã lỗi cuối cùng khi author `be/FEAT-AP-EDIT.md`.

| Error code (BFF/BE) | Display mode | Component | Label fixed | Source AC |
|---|---|---|---|---|
| (client validate) `NAME_REQUIRED` | INLINE_ERROR | `accounting-period-edit-form.tsx` Tên field | `"Tên kỳ kế toán là bắt buộc"` | AC-2 |
| `ERR-AP-013` HAS_CHILDREN_STRICT (defensive — dates không nằm trong payload nên hiếm gặp) | TOAST | global toaster | `"Không thể lưu do kỳ có kỳ con phụ thuộc. Vui lòng thử lại."` | AC-6 |
| `ERR-AP-020` NOT_FOUND (kỳ bị xoá/không tồn tại khi loader fetch hoặc lúc submit) | TOAST + navigate về `FEAT-AP-LIST` | global toaster | `"Không tìm thấy kỳ kế toán. Có thể đã bị xoá."` | AC-1, AC-6 |
| `ERR-INV-024` ACCOUNTING_PERIOD_CLOSED (nếu BE chặn thao tác khác trong lúc period đang đóng — defensive) | TOAST | global toaster | `"Kỳ đang ở trạng thái đã đóng — thao tác bị chặn."` | AC-4 |
| `ERR-CMN-NETWORK` | TOAST | global toaster | `"Không có kết nối. Vui lòng kiểm tra mạng và thử lại."` | AC-6 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `AccountingPeriodEditPage` | `/inventory/accounting-period/edit/:id` (theo Figma §1 Layout DSL `route:` field — **NEED CONFIRMATION**: task Focus hint đề xuất `/inventory/accounting-periods/:id/edit` (plural + order khác); verify chính thức khi `FEAT-AP-LIST`/`FEAT-AP-DETAIL` fe-web tier author, theo memory convention `garage-web-route-singular-vs-api-plural`) | NEW | `14146:87554` (section) — 3 screen state 13523:68781/68806/68831 | AC-1 đến AC-8 |

### 5.2 Components new/modified

> **Reuse pattern column** dùng `web-component-registry.yaml` (CANONICAL) — không có match ở `customs/` layer cho form này (không cần domain-specific picker); toàn bộ field-level component match ở `share/`. Nhóm radio-group không có entry nào ở cả 3 layer → build-new.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `AccountingPeriodEditPage` | `src/features/inventory-accounting-period/pages/AccountingPeriodEditPage.tsx` | NEW | route params `{ id }` | page-level (loading/ready/submitting) | **Build-new** — page composition, không có registry entry tương đương (page-level, không phải reusable component) | AC-1, AC-6, AC-7 |
| `accounting-period-edit-form` | `src/features/inventory-accounting-period/components/accounting-period-edit-form.tsx` | NEW (kebab-case) | `{ period, onSubmit, isSubmitting }` | `react-hook-form` local | **Build-new** — feature-specific form composition (compose các field REUSE bên dưới) | AC-2, AC-3, AC-6 |
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, backLink, actions }` | — | **Priority 2 — share/** (`share/layouts/page-header`) | AC-1 |
| Section "Thông tin chung" | `src/components/share/containers/section.tsx` | REUSE | `{ title, children }` | — | **Priority 2 — share/** (`share/containers/section`) | AC-1 |
| Cancel/Save buttons | `src/components/share/buttons/button.tsx` | REUSE | `{ variant, isLoading, onClick, children }` | — | **Priority 2 — share/** (`share/buttons/button`) | AC-6, AC-7 |
| Tên kỳ kế toán input | `src/components/share/inputs/input.tsx` | REUSE | `{ name: 'name', label, required }` | — | **Priority 2 — share/** (`share/inputs/input`) | AC-2 |
| Năm / Thuộc kỳ readonly input | `src/components/share/inputs/input.tsx` | REUSE (disabled variant, `className="bg-muted"`) | `{ name, label, disabled: true }` | — | **Priority 2 — share/** (`share/inputs/input`) | AC-3 |
| Ngày bắt đầu / Ngày kết thúc | `src/components/share/date-picker/date-picker.tsx` | REUSE (disabled variant) | `{ name, label, disabled: true }` | — | **Priority 2 — share/** (`share/date-picker/date-picker`) | AC-3 |
| Thứ tự hiển thị | `src/components/share/inputs/input-number.tsx` | REUSE | `{ name: 'displayOrder', label }` | — | **Priority 2 — share/** (`share/inputs/input-number`) | AC-2 |
| Trạng thái select | `src/components/share/selects/select-label.tsx` | REUSE | `{ name: 'status', label, options: ['Chưa đóng', 'Đã đóng'] }` | — | **Priority 2 — share/** (`share/selects/select-label`) | AC-2, AC-4, AC-5 |
| Mô tả textarea | `src/components/share/textareas/textarea.tsx` | REUSE | `{ name: 'description', label }` | — | **Priority 2 — share/** (`share/textareas/textarea`) | AC-2 |
| Tự động sinh kỳ checkbox | `src/components/share/checkboxs/checkbox.tsx` | REUSE (disabled variant) | `{ checked, disabled: true, label }` | — | **Priority 2 — share/** (`share/checkboxs/checkbox`) | AC-3 |
| Confirm đóng kỳ dialog | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, title, description, onConfirm, onCancel, variant: 'destructive' }` | — | **Priority 2 — share/** (`share/dialogs/alert-confirm`) | AC-4 |
| `radio-group-inline` (Loại kỳ) | `src/components/share/radios/radio-group-inline.tsx` | **NEW** (build-new — cần `/allow-new-component`) | `{ options, selected, disabled: true }` | — | **Build-new** — justification: registry `web-component-registry.yaml` không có category `radios` ở bất kỳ layer nào (`customs/`, `share/`, `ui/`) sau khi scan §1 lookup + §2 entries; cần propose layer `share` (generic radio-group, không domain-specific) qua `/allow-new-component` trước khi impl | AC-3 |

### 5.3 Design tokens & Figma refs

> Design tokens khớp bundle §G.Y "Design tokens referenced" (5 token): `bg-brand`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-brand` | `tailwind.config.js` | Navbar + SaveButton background | AC-1, AC-6 |
| `bg-muted` | tokens | Readonly field background (Năm/Thuộc kỳ/Ngày/checkbox disabled) | AC-3 |
| `text-foreground` | tokens | PageTitle, editable label | AC-1, AC-2 |
| `text-muted-foreground` | tokens | Readonly value text, disabled radio label | AC-3 |
| `text-primary` | tokens | Active tab underline "Kỳ kế toán" (sub-nav, existing baseline) | (visual) |
| `text-destructive` | tokens | Required asterisk `*`, inline error "Tên kỳ kế toán là bắt buộc", destructive dialog action | AC-2, AC-4 |

> **Figma source-of-truth**: layout, token, screenshot manifest theo [`wave04-ap-edit.md`](../../../../../Product/ux/figma-web/wave04-ap-edit.md). Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

> **NEED CONFIRMATION**: paired BFF tier `bff/FEAT-AP-EDIT.md` chưa được author tại thời điểm viết spec này — tên operation dưới là đề xuất theo convention CRUD + khớp REST endpoint `PUT /protected/accounting/v1/accounting-periods/{id}` (bundle §H V4-AP-4, single combined endpoint). Figma §5 Field Composition Schema đề xuất **2 mutation tách rời** (`UpdateAccountingPeriodInput` + `SetAccountingPeriodStatusInput`, invoke riêng khi status đổi) — FE tier spec này chọn phương án **1 mutation gộp** để khớp sát BE REST contract single-endpoint đã xác nhận ở bundle §H; verify + reconcile khi BFF tier author.

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `getAccountingPeriodById` | query | `src/api/graphql/getAccountingPeriodById.graphql` | `['accounting-period', id]` | `AccountingPeriodFragment` | AC-1 |
| `updateAccountingPeriod` | mutation | `src/api/graphql/updateAccountingPeriod.graphql` | — | `AccountingPeriodFragment` | AC-2, AC-4, AC-5, AC-6 |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #16 enforce) — verify khi `bff/FEAT-AP-EDIT.md` được author.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

_(không có — mọi call qua BFF GraphQL layer, không direct REST từ FE)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (detail) | TanStack Query | — | `['accounting-period', id]` | AC-1 |
| Form state | react-hook-form | local (`accounting-period-edit-form`) | — | AC-2, AC-3 |
| Confirm dialog state | React local `useState` | — | `isConfirmOpen` | AC-4 |
| Mutation state | TanStack mutation | — | `useMutation` (`updateAccountingPeriod`) | AC-6 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/accounting-period/edit/:id` | `AccountingPeriodEditPage` | `loader({ params }) => prefetch getAccountingPeriodById(params.id)` | Auth (bất kỳ role) + feature flag `Inventory:InventoryV2` | AC-1, AC-8 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-accounting-period/pages/` | `AccountingPeriodEditPage.tsx` | NEW | page composition + loader | ~120 | AC-1, AC-6, AC-7 |
| `src/features/inventory-accounting-period/components/` | `accounting-period-edit-form.tsx` | NEW | react-hook-form compose | ~200 | AC-2, AC-3, AC-6 |
| `src/components/share/radios/` | `radio-group-inline.tsx` | NEW (build-new, cần `/allow-new-component`) | shadcn RadioGroup primitive wrap | ~60 | AC-3 |
| `src/api/graphql/` | `getAccountingPeriodById.graphql`, `updateAccountingPeriod.graphql` | ADDITIVE | persisted query | ~40 | AC-1, AC-6 |
| `src/api/generated/` | `getAccountingPeriodById.generated.ts`, `updateAccountingPeriod.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | `inventory-accounting-period-routes.tsx` | MODIFY (add edit route) | TanStack Router createRoute | ~20 | AC-1, AC-8 |
| `tests/` | `tests/features/inventory-accounting-period/AccountingPeriodEditPage.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1 đến AC-8 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + resolver stable — `updateAccountingPeriod` + `getAccountingPeriodById`)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (3 screen state)
    Exit: E2E happy path green (smoke) — sửa Tên + đóng kỳ + mở lại kỳ
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Page + form component + routing + confirm dialog | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ: client-side validation hint, RBAC-driven render, error code → display mode mapping.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-002` | NORMAL | KHÔNG hiển thị lỗi trùng tên — chỉ validate rỗng | `accounting-period-edit-form.tsx` | AC-2 | không unique check |
| `BR-AP-010` | CORNERSTONE | Select Trạng thái chỉ 2 giá trị "Chưa đóng"/"Đã đóng" | `accounting-period-edit-form.tsx::TrangThaiField` | AC-2 | verbatim wording |
| `BR-AP-011` | CORNERSTONE | Cho phép mở lại kỳ bất kỳ, không ràng buộc thứ tự | `accounting-period-edit-form.tsx` (không gate theo kỳ khác) | AC-5 | BE final enforce |
| `BR-AP-012` | CORNERSTONE | Confirm dialog danger trước khi đóng kỳ (cảnh báo lock phiếu) | `AccountingPeriodEditPage.tsx::handleSave` | AC-4 | BE final enforce lock |
| `BR-AP-016` | CORNERSTONE | Chỉ 4 field editable; 6 field còn lại disabled + escape hatch note | `accounting-period-edit-form.tsx` | AC-2, AC-3 | v26 hôm nay (2026-07-08), đồng bộ Figma |
| `BR-PRC-008` | NORMAL | (informational) tính giá bị chặn khi kỳ đóng — không trực tiếp render ở FE-EDIT | — | AC-4 | xem `FEAT-PRC-CREATE`/`RECALC` |
| `BR-PRC-015` | CORNERSTONE | Advisory toast nhắc user tự chạy RECALC sau khi mở lại kỳ | `AccountingPeriodEditPage.tsx::onReopenSuccess` | AC-5 | non-blocking |
| `BR-AP-CMN-002` | CORNERSTONE | KHÔNG gate theo role — garage-owner + accountant ngang quyền | `inventory-accounting-period-routes.tsx` | AC-8 | chỉ gate feature flag |

> **Primary enforcement** = BE tier (`features/be/FEAT-AP-EDIT.md §9` — chưa author).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | pre-filled form load, 2 biến thể variant |
| AC-2 | UI (form validation) | test-ui | inline error "Tên kỳ kế toán là bắt buộc" |
| AC-3 | UI (negative — locked fields) | test-ui | verify disabled state 6 field, verify checkbox chỉ hiện ở year variant |
| AC-4 | UI (confirm dialog) | test-ui | đóng kỳ → confirm danger → submit |
| AC-5 | UI | test-ui | mở lại kỳ → không dialog, advisory toast xuất hiện |
| AC-6 | UI (happy path) | test-ui + test-e2e | Lưu → toast success → navigate back |
| AC-7 | UI | test-ui | Huỷ bỏ → navigate back không lưu |
| AC-8 | UI (RBAC visibility) | test-ui + test-isolation | dual persona (garage-owner + accountant) đều thao tác được |
| (smoke) | E2E happy path | test-e2e | Playwright — sửa Tên, đóng kỳ, mở lại kỳ |

## 11. i18n & a11y

### 11.1 i18n keys

_(không dùng i18next — toàn bộ label fixed tiếng Việt inline, xem §4.3 + catalog label trong §3 mỗi AC)_

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Focus vào `<h1>` khi route load xong | manual QA |
| AC-2 | `aria-required="true"` cho Tên kỳ kế toán | screen reader |
| AC-3 | Disabled field vẫn giữ `<label>` liên kết trong accessibility tree | không ẩn hoàn toàn |
| AC-4 | `AlertConfirm` focus trap + `aria-describedby` mô tả cảnh báo | keyboard nav |
| AC-6 | Toast success `aria-live="polite"`; Save button `aria-busy="true"` khi submitting | screen reader announce |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-EDIT.md` | **chưa author** (file này là tier đầu tiên author cho FEAT-AP-EDIT trong W04) | BR primary enforcement, REST contract source (`PUT /protected/accounting/v1/accounting-periods/{id}`), mã lỗi cuối cùng cần xác nhận |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-EDIT.md` | **chưa author** | GraphQL op naming cuối cùng (`getAccountingPeriodById` / `updateAccountingPeriod`) cần verify §6.1 |
| Mobile | _(không có — AP slice web-only trong W04 scope)_ | N/A | Chỉ `FEAT-INV-MOBILE-MENU` hub, không mirror FEAT-AP-EDIT |

**Source ID consistency** (item 18): `source_feat_sha` = `17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416` — PHẢI identical với BE/BFF khi 2 tier đó được author.

## 13. References

- **Source**: [`Product/features/FEAT-AP-EDIT.md`](../../../../../Product/features/FEAT-AP-EDIT.md) v7
- **Paired BE**: [`features/be/FEAT-AP-EDIT.md`](../be/FEAT-AP-EDIT.md) (chưa author)
- **Paired BFF**: [`features/bff/FEAT-AP-EDIT.md`](../bff/FEAT-AP-EDIT.md) (chưa author)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR canonical**: [`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) v27
- **Figma spec**: [`Product/ux/figma-web/wave04-ap-edit.md`](../../../../../Product/ux/figma-web/wave04-ap-edit.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml) v3
- **HLD Web**: `Architecture/hld/garage-web-HLD.md`
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **ADR-021**: cross-boundary lock-check advisory (gf-inventory ↔ gf-accounting) — informational cho AC-4 side-effect
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-AP-EDIT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm FE Web (full-page form KHÔNG modal), §3 FE behaviour map 8/8 AC-ID (2 biến thể year/quarter-month, đóng kỳ có confirm danger, mở lại kỳ advisory RECALC), §4 visual fidelity + state + i18n fixed-VN + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (screens/components qua `web-component-registry.yaml`/GraphQL consumed/state/cross-tier pair). NEED CONFIRMATION: (a) route path chính thức (`/inventory/accounting-period/edit/:id` Figma vs `/inventory/accounting-periods/:id/edit` task hint); (b) 1 mutation gộp vs 2 mutation tách theo Figma DSL; (c) mã lỗi `ERR-AP-0XX` (bundle §H) vs `ERR-INV-0XX` (BR canonical) chưa reconcile; (d) confirm dialog đóng kỳ divergence với Figma default no-dialog. BE + BFF tier chưa author tại thời điểm này — file này là tier đầu tiên cho FEAT-AP-EDIT trong W04. |
