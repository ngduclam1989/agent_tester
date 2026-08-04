# BUGFIX BUG-W01-281 — SO Edit preview Khấu hao ignore per-part `depreciationPercent` override

> **Status**: RESOLVED.
> **Severity**: P1.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-280 (sibling — cùng layer fix, symptom đối nghịch).

---

## 1. Failure mode

Tại SO Edit `PDV-20260615-00017` có header "Khấu hao vật tư / thay mới"
= 10% (đã từng nhấn "Áp dụng tất cả" trước đó) và 1 part INSURANCE
(Spark Plug, post-VAT 2.508.000đ). User nhập cột "Khấu hao VT" trên
bảng Phụ tùng row #2 = 5% (override per-part theo AC-5b).

Expected: preview Khấu hao = 5% × 2.508.000 = **125.400đ**.
Actual: preview Khấu hao = **250.800đ** (= 10% × 2.508.000) — header
rate 10% vẫn được dùng, override 5% bị ignore. "Giảm trừ bồi thường"
song song hiển thị 376.200đ confirm header rate vẫn áp.

## 2. Root cause

Cùng 2 nguyên nhân với BUG-W01-280 (sibling P1):

- `calc.ts:computeDepreciation` precedence cũ: `overrideByLine.get(lineId) ?? defaultPercent`
  → khi `overrideByLine` empty (do user override per-row qua RHF state, KHÔNG qua
  nút "Áp dụng tất cả"), fallback về `defaultPercent` (header). Override 5%
  user nhập vào cột "Khấu hao VT" sống ở `parts[i].depreciationPercent` của RHF —
  KHÔNG được map vào `depreciationByLine` array.
- `form/index.tsx:insuranceParts` mapping không propagate `part.depreciationPercent`
  → calc không nhìn thấy override.

## 3. Fix

Cùng diff với BUG-W01-280:

1. Mở rộng `InsurancePartLine` interface bổ sung `depreciationPercent`.
2. `computeDepreciation` đọc precedence `part.depreciationPercent ?? overrideByLine ?? 0` —
   loại bỏ fallback header.
3. `form/index.tsx` mapping pass `part?.depreciationPercent ?? null`.

## 4. Regression test

`src/features/insurance-allocation/helper/calc.test.ts` describe
"BUG-W01-280/281" spec "BUG-W01-281 — per-part override 5% phải thắng header 10%":

```ts
const input: InsuranceAdjustmentInput = {
  ...emptyAdjustmentInput(),
  depreciationDefault: { percent: 10 }, // header
  depreciationByLine: [],
};
const insuranceParts: InsurancePartLine[] = [
  { lineId: "row-1", amount: 2_508_000, isInsurancePayer: true, depreciationPercent: 5 },
];
expect(computeDepreciation(input, insuranceParts)).toBe(125_400);
```

## 5. Blast radius

- Same diff as BUG-W01-280 — 3 files touched.
- No public API or GraphQL schema change.

## 6. Verification

- `npm run build` → exit 0.
- `npx eslint <changed files>` → no errors.
- Vitest (node env) — touched test files all pass (34 tests / 7 files).
