# BUGFIX — BUG-W03-151

> Internal product form's "Nhóm vật tư/hàng hóa" picker filters client-side only. Groups beyond the initial 200-item page (tenant có 852 nhóm ACTIVE) không thể tìm/chọn được.
> Severity: **P2** · Boundary: `garage-web` · Status: **RESOLVED** · Date: 2026-07-03

## 1. Summary

`GeneralInfoSection.tsx` render field "Nhóm vật tư/hàng hóa" bằng `<InputSelect options={groupOptions} />` với `groupOptions` derived từ `useSearchMaterialGroups({ page: 0, size: 200 })` — chỉ load 1 trang mặc định, không wire keyword người dùng gõ xuống server. Nhóm nằm ngoài trang đầu (như VTHH-01 "Nhóm Phụ tùng Thân vỏ") không bao giờ xuất hiện — dropdown báo "Không có dữ liệu" dù nhóm ACTIVE tồn tại.

Repo có sẵn `SelectSuggestedMaterialGroup` (`src/components/customs/select/select-suggested-material-group.tsx`) đã implement chuẩn keyword-server-side + `defaultValue` injection cho pre-selected values ngoài trang đầu. `MaterialGroupFormPage.tsx` (feature nhóm) đã dùng component này. Product form dùng lại `InputSelect` local là scope inconsistency.

## 2. Root cause

FE inconsistency giữa 2 form: MaterialGroupFormPage (form nhóm) dùng shared customs picker chuẩn; InternalProductFormPage (form sản phẩm) tự viết InputSelect + local useSearchMaterialGroups với `size: 200`, không debounce keyword, không load-more. Khi tenant có >200 nhóm ACTIVE, một phần lớn không thể chọn.

Layer FE CONFIRMED trong `verify/BUG-W03-151.verify.md` §3 (2026-07-03 Manual QC re-test — DevTools Network không có call `SearchMaterialGroups` khi gõ; server pagination hoạt động đúng).

## 3. Fix

Reuse-first: swap `<InputSelect ... options={groupOptions} />` → `<SelectSuggestedMaterialGroup name="materialGroupId" defaultValue={materialGroupDefault} />`.

- `SelectSuggestedMaterialGroup` gọi lại `useSearchMaterialGroups({ keyword, status: ACTIVE, page: 0, size: 20 })` mỗi lần keyword thay đổi (state local, debounce nội tại qua `SelectFilter searchMode="api"`).
- `defaultValue={materialGroupDefault}` inject option `{value: String(product.materialGroupId), label: product.materialGroupName}` vào head của options list khi ở edit mode, đảm bảo picker hiển thị đúng nhóm hiện tại ngay cả khi nhóm đó nằm ngoài trang đầu tiên của server.
- Cast `materialGroupId` sang string tại `reset()` — cùng lý do như BUG-W03-139 (`SelectFilter` options.value là string, RHF field.value phải khớp type).
- `toNumericId()` (submit path) đã handle string→number → không cần đổi.
- Xóa import không dùng (`useSearchMaterialGroups`, `MaterialGroupStatus`, `MATERIAL_GROUP_PAGE_SIZE`, `groupOptions` useMemo).

## 4. Files changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/sections/GeneralInfoSection.tsx` | InputSelect (client-side filter) → SelectSuggestedMaterialGroup (server-search); drop local useSearchMaterialGroups + groupOptions; accept `materialGroupDefault` prop |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/InternalProductFormPage.tsx` | Cast `product.materialGroupId` → string trong reset; derive `materialGroupDefault` từ product + pass xuống GeneralInfoSection |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/__tests__/ConversionUnitDialog.test.tsx` | Fix legacy typo `UnitEnum.M2` → `UnitEnum.UNIT_M2` (blocking build) |

Commit: `4ff24c7c` `fix(inventory-catalog): server-side keyword search for material group picker`

## 5. Regression / verification

- `yarn tsc -b` → **PASS**.
- `npx eslint` trên 3 file touched → **PASS** (0 error, 0 warning).
- Runtime browser smoke: **DEFERRED** — user cần verify theo `verify/BUG-W03-151.verify.md §4.2`:
  1. Mở form Tạo sản phẩm, gõ "thân vỏ" → picker trả "Nhóm Phụ tùng Thân vỏ" (VTHH-01) + chọn được.
  2. Network tab: call `SearchMaterialGroups` có `input.keyword = "thân vỏ"`.
  3. Search theo mã ("VTHH-01") và tên một phần ("phụ tùng") đều tìm ra đúng (BR-CAT-GRP-013 LIKE mã+tên).
  4. Nhóm INACTIVE không xuất hiện (BR-CAT-PROD-009).
  5. Form Sửa sản phẩm (edit mode): picker pre-select nhóm hiện tại + đổi được sang nhóm khác.
- Regression BUG-W03-139 (cùng type-mismatch pattern) — MaterialGroupFormPage vẫn hoạt động (chỉ chạm string cast trong Product form, không chạm code Group form).

## 6. Non-goals / out of scope

- Không đổi BFF query `searchMaterialGroups` (đã đúng, đã có `keyword` field trong `MaterialGroupSearchInput`).
- Không sửa `useSearchMaterialGroups` hook — dùng cùng hook, chỉ đổi call site.
- Không audit các picker danh mục khác (ĐVT, Xuất xứ, SKU) — verify.md §6 nêu "pattern có thể lặp lại" như Follow-up, không mở scope.
- BUG-W03-117 (UNIT_OPTIONS hardcode) — user chỉ đạo skip khỏi cycle này.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-garage-web (main session) | Swap InputSelect client-side → SelectSuggestedMaterialGroup server-search; cast materialGroupId string; fix legacy UnitEnum.M2 typo blocking build. TSC + lint pass. Runtime smoke deferred. |
