# BUGFIX BUG-W01-280 — SO Edit preview Khấu hao auto-apply header rate khi user CHƯA ấn "Áp dụng tất cả"

> **Status**: RESOLVED.
> **Severity**: P1.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-281 (sibling FE preview layer — per-part override bị ignore), BUG-W01-279 (BE cùng fallback rule, separate boundary).

---

## 1. Failure mode

Tại màn SO Edit có bảo hiểm: user nhập `15%` vào trường header
"Khấu hao vật tư / thay mới" trong section "Phân bổ quyết toán bảo hiểm"
nhưng KHÔNG nhấn nút "Áp dụng tất cả" và KHÔNG đổi cột "Khấu hao VT"
trên bảng Phụ tùng. Panel "Tổng giá dịch vụ" lập tức render `Khấu hao =
+149.985đ` (≈ 15% × parts post-VAT BH), kéo "BH thanh toán" xuống và
"Khách hàng thanh toán" lên. Trạng thái này vi phạm AC-8 + EC-4:
**preview phải đọc per-part canonical**; header value chỉ là **seed**
cho nút "Áp dụng tất cả" — trước khi user nhấn nút, hệ thống không được
auto-apply.

## 2. Root cause

Hai layer khiến preview compute fallback về header:

- `src/features/insurance-allocation/helper/calc.ts:computeDepreciation`
  có nhánh `defaultPercent = input?.depreciationDefault?.percent ?? 0`
  và return `defaultPercent` khi cả `depreciationByLine` lẫn `part.depreciationPercent`
  absent.
- `src/features/service-order/components/form/index.tsx` mapping
  `insuranceParts` (truyền xuống `<InsuranceAllocationSection>`) KHÔNG
  copy `part.depreciationPercent` từ RHF state → `InsurancePartLine` luôn
  có `depreciationPercent: undefined` → calc fall through fallback.

## 3. Fix

1. Mở `InsurancePartLine` interface bổ sung field `depreciationPercent?: number | null`
   (kèm JSDoc EC-4: per-part canonical, header là seed only).
2. `calc.ts:computeDepreciation` đổi precedence:
   - `part.depreciationPercent` (RHF canonical) > `depreciationByLine` (legacy compat) > `0`.
   - **Loại bỏ hoàn toàn** đọc `depreciationDefault.percent` trong compute.
3. `form/index.tsx:insuranceParts` mapping thêm
   `depreciationPercent: part?.depreciationPercent ?? null`.

Nút "Áp dụng tất cả" giữ nguyên (`handleApplyDepreciationToAll`):
caller (form host) đã `setValue('parts.${i}.depreciationPercent', percent)`
cho mọi BH part khi user click → preview compute đọc từ per-part nên
khớp expected behavior.

## 4. Regression test

`src/features/insurance-allocation/helper/calc.test.ts` describe
"BUG-W01-280/281 — preview depreciation per-part canonical (EC-4)" gồm 5 specs:

- `header rate 15% nhưng KHÔNG ấn 'Áp dụng tất cả'` → expect `computeDepreciation = 0`.
- `per-part override 5% phải thắng header 10%` → expect 125.400.
- `Áp dụng tất cả flow` → header value đã write vào per-part → expect 225.000.
- `Non-insurance part bị loại` → expect 100.000 (chỉ row BH).
- `Legacy depreciationByLine vẫn dùng được khi per-part absent` → expect 70.000.

## 5. Blast radius

- Touched 3 files: `interfaces/index.ts`, `helper/calc.ts`, `service-order/components/form/index.tsx`.
- Callers checked: `useAllocationPreview` (chỉ qua `<InsuranceAllocationSection>`),
  `cost-tab.tsx` của insurance-settlement (Detail page, không pass `insuranceParts`).
- `mapFlatRootInsuranceAdjustment` (STL Detail path) không gọi `computeDepreciation` —
  reads server-computed amount.
- Không đổi public API hoặc GraphQL schema.

## 6. Verification

- `npm run build` → exit 0.
- `npx eslint <changed files>` → no errors.
- Vitest (node env) — touched test files all pass; pre-existing infra issue
  (`html-encoding-sniffer` ESM require) blocks jsdom env render tests
  (BUG-VERIFY-MECHANISM-V2 backlog).
