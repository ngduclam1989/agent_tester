---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-CREATE.md"
source_version: 32
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-CREATE"
source_feat_sha: "7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
experience: "garage-web"
platform: web
modifies: ["src/routes/inventory-routes.tsx"]
change_type: "new-capability"
consumes_backend_feats: ["FEAT-PRC-CREATE"]
consumes_bff_feats: ["FEAT-PRC-CREATE"]
i18n_keys: []                                          # per bundle add_fields (i18n_keys=[]) — fixed VN labels, no i18next cho wave này (xem §4.3)
screens_touched: ["src/features/inventory-price-calc/pages/price-calc-run-create-page.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-prc-create.md (node 14507:89266 / screen 13575:101509 — Thực hiện tính giá xuất kho)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A — tooling gap, sha256 not computed by author environment (mirror precedent Execution/wave-specs/W06/_decisions.md 2026-07-31 epic-mode LOW note)"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-CREATE (FE Web): Thực hiện tính giá xuất kho

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-CREATE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/inventory-price-calc/pages/price-calc-run-create-page.tsx` |
| Cross-tier consume | BE: `FEAT-PRC-CREATE` \| BFF: `FEAT-PRC-CREATE` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-CREATE.md`](../../../../../Product/features/FEAT-PRC-CREATE.md) |
| Source version | v32 |
| Source SHA | `7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Kế toán/chủ garage cần chốt **giá vốn xuất kho** theo phương pháp bình quân gia quyền cuối kỳ (BQGQ) cho một kỳ kế toán + kho cụ thể, để các phiếu xuất trong kỳ (đang có giá vốn = 0) được điền đúng số tiền và giá trị tồn kho phản ánh chính xác cho báo cáo tồn/NXT. Đây là bước "chốt sổ" bắt buộc trước khi đóng kỳ kế toán — không chốt giá thì không thể đóng kỳ. Tác vụ chạy nền (không chặn UI) vì khối lượng tính có thể lớn (nhiều mã × tính lặp hội tụ cho phiếu trả tự tham chiếu).

## 2. Trách nhiệm FE Web (garage-web)

- Màn hình **"Thực hiện tính giá xuất kho"** (form full-page, NEW route) — entry point từ nút "Tính giá" trên `FEAT-PRC-LIST`; scope: chọn kỳ/kho/phương pháp/phạm vi mã, quản lý bảng mã cụ thể, kích hoạt kick-off tính giá.
- User flow chính: chọn kỳ kế toán (tự khoá ngày) → chọn kho + phương pháp → chọn phạm vi mã (Tất cả mã / Chọn mã cụ thể, kèm quản lý bảng dòng nếu chọn mã cụ thể) → bấm "Thực hiện tính giá" → nhận kick-off 202 (kèm cảnh báo nếu có) → redirect sang `FEAT-PRC-DETAIL` (không chờ tính xong trên màn này).
- State machine UI: `idle` (form mount, dropdown lazy-load khi mở) → `submitting` (nút Submit loading, disabled double-click) → `success` (redirect detail) / `error` (409 conflict/closed-period → dialog/inline error, form giữ nguyên để sửa).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): đã scan `.claude/references/web-component-registry.yaml` (CANONICAL registry — KG `implementation.components` không có entry cho boundary này) trước khi thiết kế §5.2. Chỉ 1 field (Select "Mã nội bộ" trong bảng) match Priority 1 `customs/` (`select-suggested-product` — cùng pattern "add line item product" như SO/quotation/PO); các field còn lại dùng Priority 2 `share/` (không có domain-specific match phù hợp cho RHF form single-select).
- **Figma spec là visual SSOT**: layout/grid/token theo `Product/ux/figma-web/wave06-prc-create.md` (node `13575:101509`). §4/§5 references cross-ref trực tiếp section Figma tương ứng.
- GraphQL op consume từ BFF: mutation `priceCalcRunCreate` (kick-off), query `priceCalcItemsForCogsLookup` (dropdown mã cụ thể) — cả 2 thuộc paired BFF `FEAT-PRC-CREATE` (§3f bundle). Dropdown "Kỳ kế toán" và "Kho" tái sử dụng op cross-feature đã có sẵn — `searchAccountingPeriodTree` (từ `FEAT-AP-LIST`) + `searchWarehouses` (danh mục kho) — ngoài scope BFF §3f của FEAT này (xem ghi chú §6.1).
- RBAC render: cả 2 persona (`garage-owner`, `accountant`) thấy đầy đủ trường + nút như nhau (AC-12) — không gate theo role; feature-flag `Inventory:InventoryV2` được enforce ở BE (403 → FE hiển thị generic error boundary, không cần client-side flag check).

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Mở form & Thông tin kỳ tính giá

#### AC-1 → Mở form tạo lần tính giá

- **Khi**: user click nút "Tính giá" tại `FEAT-PRC-LIST`.
- **FE phải**: navigate sang route `/inventory/price-calc-runs/create`; mount `PriceCalcRunCreatePage` render Page Header (back button + tiêu đề "Thực hiện tính giá xuất kho" + 2 nút hành động) + section "Thông tin kỳ tính giá" + section "Vật tư hàng hoá cần tính giá".
- **State transition**: `idle` — render ngay, không cần fetch chặn (dropdown lazy-load khi user mở select).
- **Component**: `PriceCalcRunCreatePage` (NEW).
- **GraphQL op**: none tại mount.
- **i18n keys**: fixed VN label "Thực hiện tính giá xuất kho" (xem §4.3 — no i18next).
- **a11y**: `<h1>` cho tiêu đề; back button `aria-label="Quay lại"`.
- **Ref**: Figma `Product/ux/figma-web/wave06-prc-create.md` §Screen FEAT-PRC-CREATE (node `13575:101509`).

#### AC-2 → Chọn kỳ kế toán → tự khóa Từ ngày/Đến ngày

- **Khi**: user chọn 1 giá trị trong dropdown "Kỳ kế toán".
- **FE phải**: set `periodId` trong form state; auto-fill `fromDate`/`toDate` (readOnly) theo `startDate`/`endDate` của kỳ đã chọn (lấy kèm option của lookup kỳ kế toán); disable input "Từ ngày"/"Đến ngày" — không cho gõ (đổi BG sang `bg-accent`, không đổi opacity).
- **State transition**: `idle` → chọn kỳ → 2 input ngày chuyển state `disabled` ngay (không loading riêng).
- **Component**: `AccountingPeriodSelect` (REUSE `share/inputs/input-select`); `FromDateField`/`ToDateField` (REUSE `share/date-picker/date-picker`, `disabled=true`).
- **GraphQL op**: lookup kỳ kế toán (cross-feature, xem §6.1 ghi chú).
- **a11y**: input ngày disabled vẫn giữ `<label>` liên kết; không focusable khi disabled.
- **Ref**: Figma nodes `13575:102564` (Select kỳ), `13575:102582`/`13575:102609` (Date, `_behavior`: "AC-2 — giá trị tự sinh (khoá) theo Kỳ kế toán đã chọn").

#### AC-3 → Chọn kho & phương pháp tính giá

- **Khi**: user chọn 1 kho trong dropdown "Kho".
- **FE phải**: set `warehouseId`; trường "Phương pháp tính giá" hiện tại chỉ có 1 lựa chọn ("Phương pháp bình quân cuối kỳ") — render mặc định chọn sẵn giá trị này (single-option select, cho phép mở rộng tương lai).
- **Component**: `WarehouseSelect` (REUSE `share/inputs/input-select`); `PricingMethodSelect` (REUSE `share/selects/select-label` — ít option, không cần search).
- **GraphQL op**: lookup danh mục kho (cross-feature, xem §6.1 ghi chú).
- **Ref**: Figma nodes `13575:102443` (Kho, width FIXED 394px), `13575:102654` (Phương pháp).

#### AC-4 → Chọn phạm vi vật tư hàng hóa

- **Khi**: user chọn giá trị "Chọn vật tư hàng hoá" = **"Tất cả mã"** hoặc **"Chọn mã cụ thể"**.
- **FE phải**: set `scope` = `ALL` | `SPECIFIC`. Khi `ALL`: **không** fetch/hiển thị toàn bộ mã lên bảng, ẩn/disable nút "Thêm phụ tùng" + bảng "Vật tư hàng hoá cần tính giá" (server tự resolve khi submit — AC-4 nguồn FEAT). Khi `SPECIFIC`: hiện section bảng + kích hoạt nút "Thêm phụ tùng" (§Cluster B).
- **Component**: `MaterialScopeSelect` (REUSE `share/selects/select-label`).
- **Ref**: Figma node `13575:102671` (`_behavior`: "AC-4 — chọn 'Tất cả mã' ⇒ bảng vật tư bên dưới ẩn/không dùng; chọn mã cụ thể ⇒ bảng + nút 'Thêm phụ tùng' hoạt động").
- **NEED CONFIRMATION**: Figma `_negative_coverage` xác nhận screen hiện KHÔNG có state ẩn/disable riêng biệt được vẽ cho section bảng khi scope=ALL — author chọn "ẩn toàn bộ section 2" (an toàn nhất, khớp mô tả AC "không đổ mã vào bảng"). Verify với BA/Figma khi có wireframe bổ sung.

### Cluster B — Bảng vật tư cần tính (chỉ khi scope = SPECIFIC)

#### AC-5 → Cột bảng vật tư

- **FE phải**: render bảng 7 cột khi `scope=SPECIFIC`: **STT**, **Mã nội bộ** (select), **Tên sản phẩm nội bộ**, **ĐVT chính**, **Có phát sinh xuất**, **Lần tính gần nhất**, **Thao tác** (icon xoá). 3 cột "Tên sản phẩm nội bộ"/"ĐVT chính"/"Có phát sinh xuất"/"Lần tính gần nhất" auto-fill (read-only) theo dữ liệu trả về khi user chọn mã ở cột "Mã nội bộ" — thông tin, không sửa tay.
- **Component**: `MaterialTable` (REUSE `share/tables/table`) + `MaterialTablePagination` (REUSE `share/tables/table-pagination`).
- **Ref**: Figma node `13575:102969` (header + 3 sample rows, cột `Mã nội bộ` = Select — v7.31 update).

#### AC-6 → Thêm / xóa mã cụ thể

- **Khi**: user click "Thêm phụ tùng" → append 1 dòng mới vào bảng client-side (cột "Mã nội bộ" ở trạng thái chưa chọn — placeholder mờ "Chọn"; 4 cột thông tin trống; icon xoá ẩn `opacity-0` cho tới khi dòng có mã hợp lệ — giữ chỗ layout, không unmount).
- **Khi**: user click icon xoá (Trash) trên 1 dòng → remove dòng khỏi bảng (client state; chưa gọi API — chỉ ảnh hưởng payload lúc submit AC-7).
- **Component**: `AddPartButton` (REUSE `share/buttons/button`, `variant=outline`); `RowDeleteButton` (REUSE `share/buttons/button`, `variant=ghost size=icon`).
- **Ref**: Figma nodes `13575:103103` (`_behavior`: "AC-6 — mở picker chọn mã vật tư cụ thể để thêm dòng"), `13575:102998`→`btn_row_delete` (`_behavior`: "AC-6 — xoá mã vật tư khỏi danh sách cần tính giá").

#### AC-6b → Dropdown "Mã nội bộ" chỉ liệt kê mã BQGQ "Đang hoạt động"

- **Khi**: user mở Select cột "Mã nội bộ" trên 1 dòng bảng.
- **FE phải**: gọi query `priceCalcItemsForCogsLookup(periodId, warehouseId, keyword?, page, size)` — server-side đã filter chỉ mã "Phương pháp tính giá = Bình quân cuối kỳ" + "Trạng thái = Đang hoạt động" (BR-PRC-012 enforce ở BE). FE **không** tự filter thêm client-side; hỗ trợ search theo `keyword` (debounce ~300ms), paginate/load-more khi scroll.
- **Component**: `ProductCodeSelect` — **Priority 1 — customs/** `select-suggested-product` (pattern "add line item product" giống SO/quotation/PO — điều chỉnh props để bind `periodId`/`warehouseId` context thay vì catalog mặc định).
- **GraphQL op**: `priceCalcItemsForCogsLookup` (query) — input `PriceCalcItemsForCogsLookupInput { periodId, warehouseId, keyword, page, size }`, output `PriceCalcItemForCogsLookup { productCode, productName, mainUnitCode, hasDeliveryInPeriod, ... }`.
- **Ref**: paired BFF §6.1 op `priceCalcItemsForCogsLookup`; PKG §2.2.1 endpoint W06-6 `POST /api/v2/price-calc-runs/lookup/items-for-cogs`.

### Cluster C — Kích hoạt tính giá (kick-off async)

#### AC-7 → Kích hoạt tính BQGQ (công thức thuộc BE — xem be/FEAT-PRC-CREATE.md §9)

- **Khi**: user click nút "Thực hiện tính giá".
- **FE phải**: validate client-side tối thiểu (periodId/warehouseId/pricingMethod required; nếu `scope=SPECIFIC` phải có ≥1 dòng đã chọn mã hợp lệ — dòng "Chọn" placeholder chưa gán mã bị loại khỏi payload, không được submit rỗng); build payload `PriceCalcRunCreateInput { periodId, warehouseId, pricingMethod, scope, items? }`; sinh `idempotencyKey = "PRC-CREATE-{tenantId}-{periodId}-{warehouseId}-{clientNonce}"` (`clientNonce` = UUID sinh 1 lần khi component mount, tái dùng cho mọi lần retry của cùng phiên submit — tránh double-trigger khi double-click hoặc network retry); gọi mutation `priceCalcRunCreate`.
- **FE không** tự tính công thức BQGQ hay hiển thị kết quả trên màn CREATE — công thức là domain logic BE.
- **Ref**: paired BFF §6.1 op `priceCalcRunCreate`; ADR-028 §1 Idempotency.

#### AC-8 → Cập nhật kết quả

- N/A trên màn CREATE — cập nhật phiếu xuất/sổ tồn/log là BE side-effect, hiển thị kết quả (progress/items/aggregates) thuộc `FEAT-PRC-DETAIL` fe-web tier. FE CREATE chỉ trigger (AC-7) + redirect (AC-8b).

#### AC-8b → Lưu phiếu trước, chạy giá nền (kick-off 202)

- **Khi**: user bấm "Thực hiện tính giá" (tiếp AC-7).
- **FE phải**: disable nút Submit + hiện `isLoading` (spinner trong button) ngay khi request gửi đi, tránh double-submit; nhận response `PriceCalcRunKickoff { runId, status, pollingUrl, pollingIntervalHint }` (HTTP 202 hoặc HTTP 200 nếu `idempotentReplay=true`); redirect ngay sang `/inventory/price-calc-runs/{runId}` (`FEAT-PRC-DETAIL`) — **không** polling/chờ tính xong tại màn CREATE (polling AC-2c thuộc DETAIL tier).
- **Component**: `SubmitButton` (REUSE `share/buttons/button`, `isLoading` prop).
- **Ref**: ADR-028 §1 Client contract — HTTP 202 semantics + `pollingUrl`.

#### AC-9 → KHÔNG bắt tính tuần tự

- N/A trên FE — BE tự cho phép chạy dù kỳ trước chưa tính (không có precondition UI nào cần thêm ở CREATE, không disable nút Submit vì lý do này).

#### AC-9b → Cảnh báo kỳ sau cần tính lại

- **Khi**: response kick-off trả `affectedSubsequentPeriods` non-empty.
- **FE phải**: hiển thị **TOAST** cảnh báo (đa dòng nếu nhiều kỳ) liệt kê `periodName` các kỳ sau cần tính lại, trước khi redirect sang Detail (non-blocking — user tự điều hướng RECALC sau, FE không tự cascade). Toast auto-dismiss theo hành vi chuẩn (~4-5s) nhưng nội dung cũng available lại ở banner trong `FEAT-PRC-DETAIL` nếu cần (out of scope CREATE).
- **Component**: `AffectedPeriodsToast` (REUSE `share/toasts/toast`).
- **Ref**: SDL `AffectedSubsequentPeriod` (bundle §3f, F-13 v7.76).
- **NEED CONFIRMATION**: Figma `_negative_coverage` xác nhận màn CREATE hiện KHÔNG có banner/alert box nào — author chọn TOAST (registry display phù hợp cho cảnh báo non-blocking async result, không cần thay đổi layout form). Nếu BA muốn DIALOG chặn xác nhận, cần cascade Figma trước khi đổi.

#### AC-10 → Mã lỗi (chạy giá lỗi)

- N/A trên màn CREATE — mã lỗi từng item ("Trạng thái = Lỗi" + "Lí do lỗi") hiển thị ở `FEAT-PRC-DETAIL`.

### Cluster D — Hủy bỏ, phân quyền, chặn trùng/kỳ đóng

#### AC-11 → Hủy bỏ

- **Khi**: user click nút "Huỷ bỏ".
- **FE phải**: navigate back tới `/inventory/price-calc-runs` (list) — **không** gọi mutation, không cần confirm dialog.
- **Component**: `CancelButton` (REUSE `share/buttons/button`, `variant=outline`).
- **Ref**: Figma node `13575:101513`→`btn_cancel`, label verbatim Figma **"Huỷ bỏ"** (lưu ý: source FEAT AC-11 viết "Hủy bỏ" — khác dấu; FE bám label verbatim Figma theo §4.1 visual SSOT — xem NEED CONFIRMATION §4.1).

#### AC-12 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **FE phải**: **không** áp thêm RBAC gating trên form/nút Submit theo persona (`accountant` / `garage-owner`) — cả 2 role thấy đầy đủ trường + nút như nhau; "người thực hiện" tự lấy từ token đăng nhập hiện tại, **không** có field chọn người thực hiện trên UI.

#### AC-13 → Chặn chạy trùng

- **Khi**: submit trả lỗi HTTP 409 `errorCode=ERR-INV-029`.
- **FE phải**: hiển thị `DIALOG` (theo registry display) message "Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất"; **không** redirect, giữ nguyên form, re-enable nút Submit.
- **Component**: `RunInProgressDialog` (REUSE `share/dialogs/alert-dialog`).

#### AC-13b → Chặn tính giá khi kỳ đã đóng

- **Khi**: submit trả lỗi HTTP 409/400 `errorCode=ERR-INV-024`.
- **FE phải**: hiển thị `INLINE_FORM` error tại section "Thông tin kỳ tính giá" — message "Kỳ kế toán đã đóng — Bạn không thể thực hiện mọi thao tác thuộc kỳ này"; re-enable nút Submit.
- **Component**: `PeriodInfoSection` (inline error banner trong `share/containers/section`).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-prc-create.md` (node `13575:101509`). Layout: 2 section trên nền trắng, **không** có card wrapper/border quanh section (per `_negative_coverage`); grid 3 cột cho Thông tin kỳ tính giá (2 hàng); bảng 7 cột + pagination cho Vật tư hàng hoá.
- Design tokens lấy từ `tailwind.config.js` / `src/styles/tokens/**` — **không** hardcode hex/px. Tokens phải khớp §5.3.
- Mỗi visual AC (grid 3 cột §AC-2/AC-3, bảng 7 cột §AC-5, dòng trống mới thêm §AC-6) MUST cross-ref Figma node tương ứng — đã ghi trong §3.
- **NEED CONFIRMATION** (label discrepancy): nút "Huỷ bỏ" trên Figma khác diacritic với "Hủy bỏ" trong source FEAT AC-11/AC-1. FE dùng **Figma verbatim "Huỷ bỏ"** theo visual SSOT; flag cho BA đối soát + cascade FEAT nếu cần đồng bộ.

### 4.2 State machine + error handling

- Form-level: `idle | submitting | success (redirect) | error (dialog/inline, form giữ nguyên)`.
- Dropdown lazy-load (lookup kỳ/kho/mã cụ thể): `idle | loading (spinner trong select) | loaded | error (inline retry)`.
- Nút "Thực hiện tính giá": `default → loading (disabled, spinner) → (success: unmount trước redirect) / (error: về default, re-enable)`.
- KHÔNG silent fail — mọi lỗi API reach UI qua §4.6 mapping hoặc generic error boundary (403 feature-flag off).

### 4.3 i18n + a11y

- **i18n policy**: theo `add_fields.i18n_keys=[]` từ context bundle — dùng **fixed VN labels inline**, `i18n_keys: []` frontmatter empty. **KHÔNG dùng i18next** cho feature này (mirror pattern PKG-W06 nếu wave dùng fixed VN — xác nhận với BA/PO nếu cần đổi sang i18n key trước impl).
- a11y: mọi field select/date có `<label>` liên kết + `aria-describedby` cho error; icon-only button (back, xoá dòng) có `aria-label`; Tab order: Kỳ kế toán → Kho → Phương pháp → Chọn vật tư → (bảng nếu SPECIFIC) → Huỷ bỏ → Thực hiện tính giá; Enter không submit ngoài ý muốn trong table row (chặn form submit khi Enter trong ô search select).
- Semantic HTML — button thật cho mọi action, không `<div>` clickable.

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` gate ở BE — FE không cần client-side check riêng; nếu BE trả 403 `FORBIDDEN_ERROR` → hiển thị generic error boundary/redirect.
- Persona: `garage-owner` + `accountant` quyền ngang nhau (AC-12) — không hide/disable control theo role.
- Tab/route gate: route yêu cầu đăng nhập (chuẩn app-shell auth guard); không có redirect riêng theo module Tồn kho.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem `be/FEAT-PRC-CREATE.md §9`). FE chỉ:
  - Inline validation: required fields trước khi submit (§AC-7); disable Submit khi `scope=SPECIFIC` và bảng chưa có dòng hợp lệ.
  - Dropdown "Mã nội bộ" chỉ hiển thị lựa chọn hợp lệ (BR-PRC-012) — BE-filtered, FE không tự lọc thêm (§AC-6b).
  - Toast/dialog khi server reject với error code (§4.6).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-024` | INLINE_FORM | `PeriodInfoSection` inline error banner | AC-13b |
| `ERR-INV-029` | DIALOG | `RunInProgressDialog` (`share/dialogs/alert-dialog`) | AC-13 |
| `ERR-CMN-*` (validation 400 chung) | INLINE_FIELD | field tương ứng | AC-7 |
| `ERR-CMN-007` (503 hệ thống bận) | TOAST | generic toast + nút Thử lại | AC-7 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `PriceCalcRunCreatePage` | `/inventory/price-calc-runs/create` | NEW | `13575:101509` | AC-1 – AC-13b |

### 5.2 Components new/modified

> Author scan `.claude/references/web-component-registry.yaml` (CANONICAL — KG `implementation.components` không có entry cho boundary này, thay cho việc scan filesystem thủ công per §G.X stub "KG missing").

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `title, backHref, actions` | — | **Priority 2 — share/** (generic, không có domain-specific match cho page header) | AC-1 |
| `PeriodInfoSection` / `MaterialListSection` | `src/components/share/containers/section.tsx` | REUSE | `title` | error banner | **Priority 2 — share/** | AC-1, AC-13b |
| `AccountingPeriodSelect` | `src/components/customs/select/accounting-period-select.tsx` | NEW | `name="periodId"` | loading | **Priority 1 — customs/** (RESOLVED 2026-07-31, Delivery Authority directive) — chưa có component sẵn cho `domain-accounting-period-select`; DEV tạo mới cùng anatomy/data-fetch pattern với `customs/select/warehouses-select-filter` (accumulated-option + search-as-you-type), tích hợp qua RHF `Controller`. Data nguồn: `searchAccountingPeriodTree` (§6.1) — flatten cây Năm→Quý→Tháng lấy leaf-node cấp Tháng + filter `status=OPEN` trước khi map option list | AC-2 |
| `FromDateField` / `ToDateField` | `src/components/share/date-picker/date-picker.tsx` | REUSE | `disabled=true, readOnly=true` | — | **Priority 2 — share/** | AC-2 |
| `WarehouseSelect` | `src/components/customs/select/warehouses-select-filter.tsx` | REUSE | `name="warehouseId"` | loading | **Priority 1 — customs/** (RESOLVED 2026-07-31, Delivery Authority directive — thay v1 kết luận "không match") — reuse trực tiếp `domain-warehouse-select`; component đã có `useGetWarehouses` (query `searchWarehouses`, §6.1) + accumulated-option pagination sẵn, tích hợp qua RHF `Controller` (field vẫn RHF-managed, chỉ đổi shell UI sang component filter-scoped) | AC-3 |
| `PricingMethodSelect` / `MaterialScopeSelect` | `src/components/share/selects/select-label.tsx` | REUSE | fixed/enum options | — | **Priority 2 — share/** (enum ít option, không cần search) | AC-3, AC-4 |
| `MaterialTable` | `src/components/share/tables/table.tsx` | REUSE | `columns, rows` | — | **Priority 2 — share/** | AC-5 |
| `MaterialTablePagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | — | — | **Priority 2 — share/** | AC-5 |
| `AddPartButton` | `src/components/share/buttons/button.tsx` | REUSE | `variant=outline` | — | **Priority 2 — share/** | AC-6 |
| `RowDeleteButton` | `src/components/share/buttons/button.tsx` | REUSE | `variant=ghost size=icon aria-label="Xoá dòng"` | — | **Priority 2 — share/** | AC-6 |
| `ProductCodeSelect` (Mã nội bộ cell) | `src/components/customs/select/select-suggested-product.tsx` | REUSE (adapted) | `productCode, periodId, warehouseId` | loading | **Priority 1 — customs/** — matches `domain-product-suggest` use-case "add line item product" (SO/quotation/PO pattern) | AC-6, AC-6b |
| `SubmitButton` | `src/components/share/buttons/button.tsx` | REUSE | `variant=default isLoading` | loading | **Priority 2 — share/** | AC-7, AC-8b |
| `CancelButton` | `src/components/share/buttons/button.tsx` | REUSE | `variant=outline` | — | **Priority 2 — share/** | AC-11 |
| `AffectedPeriodsToast` | `src/components/share/toasts/toast.tsx` | REUSE | — | — | **Priority 2 — share/** | AC-9b |
| `RunInProgressDialog` | `src/components/share/dialogs/alert-dialog.tsx` | REUSE | `title, description` | — | **Priority 2 — share/** | AC-13 |
| `PriceCalcRunCreateForm` (orchestrator) | `src/features/inventory-price-calc/components/create/price-calc-run-create-form.tsx` | NEW | form state (RHF) | local | **Build-new** — justification: feature-specific composition logic (period→date lock, scope toggle, idempotency key generation) không match component nào ở customs/share/ui sau khi scan registry | AC-1 – AC-9b |

### 5.3 Design tokens & Figma refs

> Tokens khớp bundle §G.Y "Design tokens referenced": `bg-accent`, `text-foreground`, `text-muted-foreground`, `text-primary`.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-accent` | `tailwind.config.js` | BG input ngày disabled (`Từ ngày`/`Đến ngày`); BG header bảng vật tư | AC-2, AC-5 |
| `text-foreground` | tokens | text mặc định (#18181b) — label, giá trị select đã chọn, nội dung ô bảng | AC-1 – AC-6 |
| `text-muted-foreground` | tokens | placeholder/disabled text (#71717a) — "Chọn" placeholder dòng trống, ngày disabled, "mỗi trang" pagination | AC-2, AC-6 |
| `text-primary` | tokens | BG nút "Thực hiện tính giá" (brand `#0052ff`) | AC-7 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave06-prc-create.md`. Không re-invent layout/spacing/color.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunCreate` | mutation | `src/api/graphql/price-calc-run-create.graphql` | — | `PriceCalcRunKickoffFragment` | AC-7, AC-8b |
| `priceCalcItemsForCogsLookup` | query | `src/api/graphql/price-calc-items-for-cogs-lookup.graphql` | `['priceCalcItemsForCogsLookup', periodId, warehouseId, keyword, page]` | — | AC-6, AC-6b |
| `searchAccountingPeriodTree` | query | `src/api/graphql/search-accounting-period-tree.graphql` | `['searchAccountingPeriodTree']` | — | AC-2 |
| `searchWarehouses` | query | (reuse existing `use-get-warehouses.ts` query doc) | `['searchWarehouses', keyword, page]` | — | AC-3 |

> `priceCalcRunCreate` + `priceCalcItemsForCogsLookup` tồn tại ở paired BFF `bff/FEAT-PRC-CREATE.md §6.1` (bundle §3f, item #16 enforce). Dropdown "Kỳ kế toán" (`searchAccountingPeriodTree`, AP-Q2) và "Kho" (`searchWarehouses`) tái sử dụng op lookup **cross-feature** đã ratified sẵn (`Architecture/api/agg-garage-graph-graphql.md:46295` cho AP-Q2) — **không** thuộc phạm vi paired BFF `FEAT-PRC-CREATE`; author ghi chú rõ để reviewer không flag missing-op nhầm. Component reuse: `AccountingPeriodSelect` (NEW) + `WarehouseSelect` (REUSE `customs/select/warehouses-select-filter`) — xem §5.2.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

_(không có — mọi tương tác qua GraphQL BFF)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Form state | react-hook-form | local (`PriceCalcRunCreateForm`) | — | AC-1 – AC-9b |
| Server state (lookup mã cụ thể) | TanStack Query | — | `['priceCalcItemsForCogsLookup', periodId, warehouseId, keyword, page]` | AC-6b |
| Kick-off mutation | TanStack mutation | `usePriceCalcRunCreate` hook | `idempotencyKey` variable per submit-session | AC-7, AC-8b |
| Idempotency nonce | `useRef` (component-local) | `clientNonce` sinh 1 lần khi mount | — | AC-7 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/price-calc-runs/create` | `PriceCalcRunCreatePage` | none (dropdown lazy-load) | auth guard chuẩn app-shell (garage-owner \| accountant) | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-price-calc/pages/` | `price-calc-run-create-page.tsx` | NEW | route entry | ~60 | AC-1 |
| `src/features/inventory-price-calc/components/create/` | `price-calc-run-create-form.tsx` | NEW | RHF orchestrator | ~180 | AC-1-AC-9b |
| `src/features/inventory-price-calc/components/create/` | `period-info-section.tsx` | NEW | grid 3 cột | ~90 | AC-2, AC-3, AC-13b |
| `src/features/inventory-price-calc/components/create/` | `material-list-section.tsx` | NEW | bảng + pagination | ~140 | AC-4, AC-5, AC-6 |
| `src/features/inventory-price-calc/components/create/` | `material-row-select.tsx` | NEW | wrap `customs/select/select-suggested-product` | ~60 | AC-6, AC-6b |
| `src/features/inventory-price-calc/hooks/` | `use-price-calc-run-create.ts` | NEW | mutation + idempotency key | ~50 | AC-7, AC-8b |
| `src/features/inventory-price-calc/hooks/` | `use-price-calc-items-for-cogs-lookup.ts` | NEW | TanStack query wrapper | ~35 | AC-6b |
| `src/features/inventory-price-calc/types/` | `price-calc-run.types.ts` | NEW | TypeScript types | ~30 | — |
| `src/api/graphql/` | `price-calc-run-create.graphql` | ADDITIVE | persisted mutation | ~20 | AC-7 |
| `src/api/graphql/` | `price-calc-items-for-cogs-lookup.graphql` | ADDITIVE | persisted query | ~15 | AC-6b |
| `src/api/generated/` | codegen output | AUTO-GEN | codegen | — | — |
| `src/routes/` | `inventory-routes.tsx` | MODIFY (add route) | createBrowserRouter | ~10 | AC-1 |
| `tests/` | `tests/features/inventory-price-calc/price-calc-run-create-page.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1-AC-13b |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL priceCalcRunCreate + priceCalcItemsForCogsLookup stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components + routing + form state | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. Xem `be/FEAT-PRC-CREATE.md §9` cho primary enforcement.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-012` | CORNERSTONE | dropdown "Mã nội bộ" chỉ hiển thị mã BQGQ Đang hoạt động (server-filtered) | `material-row-select.tsx` | AC-6b | BE final enforce, FE không filter thêm |
| `BR-AP-012` / `BR-PRC-008` | CORNERSTONE | inline error khi kỳ CLOSED (`ERR-INV-024`) | `period-info-section.tsx` | AC-13b | BE final enforce |
| `BR-PRC-016` / `BR-PRC-011` | CORNERSTONE | dialog khi có lần tính đang chạy (`ERR-INV-029`) | `price-calc-run-create-form.tsx` | AC-13 | BE final enforce |
| `BR-AP-CMN-002` | NORMAL | không gate RBAC theo persona | toàn form | AC-12 | non-blocking, hiển thị đồng nhất |

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | mở form, render 2 section |
| AC-2 | UI | test-ui | chọn kỳ → 2 ngày khoá + auto-fill |
| AC-4 | UI (toggle) | test-ui | Tất cả mã vs Chọn mã cụ thể — ẩn/hiện bảng |
| AC-5 | UI (table render) | test-ui | 7 cột đúng thứ tự |
| AC-6 | UI | test-ui | thêm/xoá dòng bảng |
| AC-6b | UI (dropdown filter) | test-ui | chỉ mã BQGQ Đang hoạt động |
| AC-7 / AC-8b | UI + integration | test-ui + test-e2e | submit → 202 → redirect Detail |
| AC-9b | UI (toast) | test-ui | affectedSubsequentPeriods toast |
| AC-11 | UI | test-ui | Huỷ bỏ đóng form không tính |
| AC-12 | UI (RBAC visibility) | test-ui + test-isolation | dual persona, không khác biệt |
| AC-13 | UI (negative — 409) | test-ui | dialog chặn trùng |
| AC-13b | UI (negative — 409/400) | test-ui | inline error kỳ đóng |
| (smoke) | E2E happy path | test-e2e | Playwright — Tất cả mã lẫn Chọn mã cụ thể |

## 11. i18n & a11y

### 11.1 i18n keys

- **N/A** — fixed VN labels inline theo `add_fields.i18n_keys=[]` (xem §4.3). Không tạo file `src/i18n/{vi,en}/inventory-price-calc.json` cho wave này.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` tiêu đề, back button `aria-label` | manual QA |
| AC-2 | Input ngày disabled vẫn có `<label>` liên kết | screen reader |
| AC-6 | Icon-only Trash button có `aria-label="Xoá dòng"` | keyboard + SR |
| AC-13 / AC-13b | Error message liên kết `aria-describedby` | inline + dialog |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-CREATE.md` | DRAFT (song song) | BR primary enforcement (BR-PRC-*), contract source, công thức BQGQ |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-CREATE.md` | DRAFT (song song) | GraphQL ops consumed (§6.1): `priceCalcRunCreate`, `priceCalcItemsForCogsLookup` |
| Mobile | N/A | — | PRC (bao gồm `FEAT-PRC-CREATE`) là **web-only** per PKG-W06 §Overview — mobile chỉ `FEAT-STK-LIST-V2` |

**Source ID consistency** (item 18): `source_feat_sha` phải identical với BE/BFF files khi các file đó hoàn thành (đang author song song trong cùng batch).

## 13. References

- **Source**: [`Product/features/FEAT-PRC-CREATE.md`](../../../../../Product/features/FEAT-PRC-CREATE.md) v32
- **Paired BE**: [`features/be/FEAT-PRC-CREATE.md`](../be/FEAT-PRC-CREATE.md)
- **Paired BFF**: [`features/bff/FEAT-PRC-CREATE.md`](../bff/FEAT-PRC-CREATE.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC)
- **Figma spec**: [`Product/ux/figma-web/wave06-prc-create.md`](../../../../../Product/ux/figma-web/wave06-prc-create.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **Error codes**: [`Product/Commons/ERROR-CODE-REGISTRY.md`](../../../../../Product/Commons/ERROR-CODE-REGISTRY.md) §4 (`ERR-INV-024`, `ERR-INV-029`)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (per user sonhoang directive) | **Resolved data-source cho 2 dropdown còn ambiguous ở §5.2/§6.1** — (a) `WarehouseSelect`: đổi từ Priority-2 `share/inputs/input-select` (v1 kết luận "không match" filter-scoped component) sang **REUSE trực tiếp** `customs/select/warehouses-select-filter.tsx` (Priority 1, `domain-warehouse-select`) qua RHF `Controller`; (b) `AccountingPeriodSelect`: đổi từ Priority-2 `share/inputs/input-select` sang **NEW** `customs/select/accounting-period-select.tsx` (Priority 1), cùng anatomy/data-fetch pattern với warehouses-select-filter, data từ Query `searchAccountingPeriodTree` (AP-Q2, ratified `agg-garage-graph-graphql.md:46295`) — flatten cây Năm→Quý→Tháng lấy leaf Tháng + filter `status=OPEN`. §6.1 GraphQL ops table thêm 2 row (`searchAccountingPeriodTree`, `searchWarehouses`) + note update. §2 bullet GraphQL consume update tên op cụ thể thay vì mô tả chung chung. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-PRC-CREATE` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm FE Web, §3 FE behaviour map cover 17/17 AC-ID (11 active FE behaviour + 3 explicit N/A + 2 NEED CONFIRMATION marker cho scope=ALL table visibility và AC-9b display mode + 1 label diacritic discrepancy "Huỷ bỏ"/"Hủy bỏ"), §4 visual fidelity + state + i18n (fixed VN, no i18next) + a11y + RBAC + BR secondary + error mapping (ERR-INV-024/029), §5-§12 FE-specific (screens/components qua `web-component-registry.yaml` — 1 Priority-1 customs match `select-suggested-product`, còn lại Priority-2 share/GraphQL consumed/state/cross-tier pair, mobile N/A web-only). Source FEAT chỉ audit. |
