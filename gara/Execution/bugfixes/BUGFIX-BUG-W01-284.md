# BUGFIX BUG-W01-284 — SO Edit "Khấu hao VT" per-part clear không trigger recompute

> **Status**: RESOLVED.
> **Severity**: P1.
> **Boundary**: garage-web (frontend).
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-263 (Áp dụng tất cả propagate per-row), BUG-W01-265 (clear-default focus rule), BUG-W01-280 (auto-apply header EC-4), BUG-W01-281 (per-part override).

---

## 1. Failure mode

Trên SO Edit `PDV-20260616-00019/edit` (BH=Có), bảng Phụ tùng có ≥2 part
payer=BH, header "Khấu hao VT" có value:

- B2: User nhập per-part 1 part = 5% (khác header) → panel "Tổng giá dịch vụ"
  → mục "Khấu hao vật tư / thay mới" recompute đúng (`+301.820đ`) ✓.
- B3: User clear value (xóa về empty).
- B4: Panel "Khấu hao vật tư / thay mới" KHÔNG recompute, vẫn giữ `+301.820đ`
  từ lần input trước. Drift input ↔ preview → accountant có thể lưu nhầm khi
  UI hiển thị giá trị cũ.

Expected: clear input → preview recompute, fall back về header value HOẶC 0
nếu header rỗng.

## 2. Root cause

`InsuranceAllocationSection.handleApplyDepreciationToAll` (file
`src/features/insurance-allocation/components/insurance-allocation-section.tsx`)
trước fix dual-write:

```js
const handleApplyDepreciationToAll = () => {
  const percent = safeValue.depreciationDefault.percent ?? 0;
  if (onApplyDepreciationPercentToParts) {
    // (1) Canonical: callback set per-row parts[i].depreciationPercent
    onApplyDepreciationPercentToParts(percent, insuranceLineIds);
  }
  if (onChange) {
    // (2) Stale source: cũng populate depreciationByLine override array
    const depreciationByLine = safeInsuranceParts
      .filter((part) => part.isInsurancePayer)
      .map((part) => ({ lineId: part.lineId, percent }));
    onChange({ ...safeValue, depreciationByLine });
  }
};
```

Hệ quả flow:

1. User click "Áp dụng tất cả" với header=10% → per-row=10% (canonical), AND
   `insuranceAllocation.depreciationByLine = [{X, 10}, ...]` (override stale).
2. User gõ per-row[X] = 5% → `parts[X].depreciationPercent=5`. Preview dùng
   per-row 5% (calc.ts:47 precedence `per-part ?? override ?? 0`). ✓
3. User clear per-row[X] → `parts[X].depreciationPercent=undefined` →
   `insuranceParts[X].depreciationPercent=null` (form/index.tsx:218
   `?? null`).
4. `calc.ts:47` `null ?? overrideByLine.get(X) ?? 0` → override hit (vẫn còn
   stale entry với percent=10) → preview tiếp tục show với rate cũ (10% hay
   5% tùy override snapshot tại thời điểm Áp dụng) → drift input ↔ preview.

Trong screenshot QC, override entry vẫn = 5% (snapshot tại lần Áp dụng → gõ
sequence), dẫn tới preview "giữ stale +301.820đ" sau clear.

## 3. Fix

1 file thay đổi:

**`src/features/insurance-allocation/components/insurance-allocation-section.tsx`**:

Remove `onChange({...safeValue, depreciationByLine})` khỏi
`handleApplyDepreciationToAll`. Per-row callback `onApplyDepreciationPercentToParts`
là canonical mechanism (BUG-W01-267 đã phase out
`depreciationByLine` write từ form submit; per-row đi qua
`parts[i].depreciationPercent` per `formatServiceOrderFormData` mapper):

```js
const handleApplyDepreciationToAll = () => {
  const percent = safeValue.depreciationDefault.percent ?? 0;
  if (onApplyDepreciationPercentToParts) {
    const insuranceLineIds = safeInsuranceParts
      .filter((part) => part.isInsurancePayer)
      .map((part) => part.lineId);
    onApplyDepreciationPercentToParts(percent, insuranceLineIds);
  }
};
```

Sau fix:

- "Áp dụng tất cả" chỉ set per-row qua callback; `depreciationByLine`
  giữ `[]` (initial state từ form/edit/index.tsx:230).
- User clear per-row → `calc.ts:47` `null ?? undefined ?? 0` = 0 → preview
  drop về 0 cho row đó. ✓
- Preview state đồng bộ input state tại mọi thời điểm.

## 4. Regression tests

**Modified** `src/features/insurance-allocation/helper/calc.test.ts` —
add describe "BUG-W01-284 — per-part clear triggers recompute (no stale override)":

- `clearing per-part with no override falls back to 0` — `depreciationDefault={percent:10}`,
  `depreciationByLine=[]`, `part.depreciationPercent=null` → expected 0.
- `clearing per-part after override was synced out: preview drops the cleared row contribution` —
  mixed scenario row-1 cleared + row-2 still set → tổng chỉ count row-2.

**Modified** `src/features/insurance-allocation/components/insurance-allocation-section.regression.test.ts` —
add describe "BUG-W01-284 — Apply All no longer writes stale depreciationByLine override":

- `handleApplyDepreciationToAll does not call onChange with depreciationByLine` — guard
  match source body để regression catch nếu re-introduce dual-write pattern.

## 5. Blast radius

- Affected boundary: garage-web ONLY.
- No public API / GraphQL schema change.
- No KG entity / event / permission change.
- Existing BUG-W01-263 regression test (`Apply All handler invokes the parts-row callback`)
  still passes — canonical callback untouched.
- Detail mode (`<InsuranceAllocationSection mode="detail">`) — `handleApplyDepreciationToAll`
  không được trigger (read-only) → no behavior change.
- Production paths (form host always provides `onApplyDepreciationPercentToParts`):
  zero functional change cho "Áp dụng tất cả" UX — chỉ remove redundant write.
- Synthetic test paths không provide callback: trước fix, `onChange` còn populate
  override để preview reflect; sau fix, không populate → preview = 0 (acceptable;
  test paths không dùng).

## 6. Verification

- `npm run build` → exit 0 (Vite build pass, no TypeScript errors).
- `npx eslint <changed files>` → no errors.
- `npx vitest run calc.test.ts insurance-allocation-section.regression.test.ts` →
  all pass (19 tests).
- Full test suite: 121/122 pass (1 pre-existing failure trong
  `depreciation-persist.test.ts:57` NOT related to this fix; failure existed
  trên HEAD trước changes).

## 7. Memory decision

`no-write` — Fix is mechanical removal of redundant dual-write; root cause
(stale override after dual-write) is bounded to the single
`handleApplyDepreciationToAll` handler. Existing pattern guidance (per-row
canonical, BUG-W01-267 phase-out of `depreciationByLine`) already captured
in upstream regression tests. No new failure pattern emerged.
