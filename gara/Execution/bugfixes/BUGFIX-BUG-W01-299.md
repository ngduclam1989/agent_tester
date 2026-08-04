# BUGFIX-BUG-W01-299 — STL Detail BH cost-tab cột "Phân khúc" raw enum `TIER1` → localized "Hàng xịn"

| Field | Value |
|---|---|
| Bug ID | BUG-W01-299 |
| Severity | P2 |
| Status | RESOLVED (pending TEST_GROUP / QA verify) |
| Wave | W01 (EP-INSURANCE-SETTLEMENT) |
| Feature(s) | FEAT-INS-STL-DETAIL |
| Business Rule(s) | BR-INS-STL-DET-007 (BH variant parity với KH baseline) |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Fix Agent | agent-fix-garage-web |
| Fix Commit | `PENDING_USER_COMMIT` |
| Fix Branch | `feature/ep-insurance-settlement-w01` |

## 1. Symptom

Trên STL Detail biến thể BH (`SET-20260616-00012`) bảng "Phụ tùng sử dụng",
cột "Phân khúc" render raw enum `TIER1` thay vì localized `Hàng xịn`. KH
baseline (`SET-20260616-00011` cùng SO `PDV-20260616-01095`) render đúng
`Hàng xịn` — vi phạm BH↔KH parity. EXACT SAME ANTI-PATTERN với BUG-W01-296
(payment method `CASH` → cần `Tiền mặt`) khác section / formatter helper.

Bug report ghi "STL Edit affected" — verify cho thấy KHÔNG có STL Edit
variant trong `features/insurance-settlement/components/` (chỉ tồn tại
`detail/`). Scope effective = STL Detail BH only.

## 2. Root Cause

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx`
L154 cell `<td className="px-2">{item.segment ?? "--"}</td>` bind raw field,
không qua i18n. Translation key tồn tại sẵn trong `src/locales/vi.json`:

```json
"purchase_request": {
  "tiers": {
    "tier_1": "Hàng xịn",
    "tier_2": "Hàng thương hiệu",
    "tier_3": "Hàng liên doanh",
    "tier_4": "Hàng bãi",
    "tier_5": "Khác"
  }
}
```

và mapping `TIERS` đã export sẵn từ
`@/features/purchase-requests/constants` (L76-82):

```ts
export const TIERS = [
  { value: "TIER1", label: "purchase_request.tiers.tier_1" },
  ...
];
```

Component chỉ thiếu wiring qua `useTranslation()` + `TIERS.find`.

Data layer OK — `InsuranceSettlementLineItem.segment` đã expose từ BFF / BE
(L20 `interfaces/index.ts`).

## 3. Fix

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx`:

- Import `useTranslation` (`react-i18next`) + `TIERS`
  (`@/features/purchase-requests/constants`).
- Convert `PartsTable` từ inline arrow expression sang block để host
  `useTranslation()` hook + helper `resolveSegmentLabel`:
  ```ts
  const resolveSegmentLabel = (segment?: string): string => {
    if (!segment) return "--";
    const tier = TIERS.find((v) => v.value === segment);
    return tier ? t(tier.label) : segment;
  };
  ```
- Cell đổi sang `<td data-testid="col-phan-khuc">{resolveSegmentLabel(item.segment)}</td>`
  — `data-testid` cho QA pinpoint regression.

Fallback: nếu enum không match TIERS (vd backend ship enum mới), giữ raw
string thay vì `"--"` (better than silent missing). Khi `segment` undef → `--`.

KHÔNG touch `ServiceTable` (services không có segment).
KHÔNG đổi data shape. KHÔNG đụng BFF / BE / SDL.

## 4. Blast Radius

- Route affected: `/insurance-settlement/:code` cost-tab `PartsTable`.
- Component touched: 1 file (`cost-tab.tsx`).
- Cross-boundary risk: none (FE-only label mapping; data shape không đổi).
- Cross-FEAT impact: shared TIERS mapping is `purchase-requests` source-of-truth —
  any future change there propagates here transparently.
- KH baseline (`settlement-voucher`) KHÔNG share component file này → không regress.

## 5. Regression Test

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-299.test.ts`

5 source-pin specs:

1. `imports TIERS from @/features/purchase-requests/constants`.
2. `imports useTranslation from react-i18next`.
3. `PartsTable resolves segment via TIERS.find(...).label + t(...)` —
   pins mapping logic.
4. `Phân khúc cell renders via resolveSegmentLabel(item.segment) — NOT raw enum` —
   bans pre-fix `{item.segment ?? "--"}` literal direct cell.
5. `PartsTable Phân khúc cell carries data-testid for QA pinpoint`.

## 6. Verification

```
cd frontend/gf-gms-web
npm test -- --run \
  src/features/insurance-settlement/components/detail/cost-tab.bug-299.test.ts
# → 5 passed

npm test -- --run src/features/insurance-settlement/components/detail/
# → 31 passed (cost-tab.render.test.tsx 6 specs still green — no regress)

npm run build  # → exit 0 (built in 16.30s)
npx eslint --max-warnings=0 \
  src/features/insurance-settlement/components/detail/cost-tab.tsx \
  src/features/insurance-settlement/components/detail/cost-tab.bug-299.test.ts
# → clean
```

## 7. Files Changed

- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx` (import + PartsTable hook conversion + cell helper).
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-299.test.ts` (new regression test, 5 specs).

## 8. Follow-ups (out of fix scope)

- **Scope clarification (already noted §1)** — bug report mục "STL Edit affected"
  inaccurate; only STL Detail BH affected. BUGS.md row notes `STL Edit BH`
  nhưng `features/insurance-settlement/components/` không có Edit subtree.
  Update report next QA cycle nếu BA/PO cần.
- **Shared formatter consolidation (deferred)** — bug 299 + bug 296 cùng anti-pattern
  "BH variant binds raw enum, KH baseline binds via formatter". Future refactor:
  hoist các formatter (date, payment method, tier) lên `shared/utils/format` để
  cả BH + KH consume cùng path; prevent same anti-pattern khi FEAT mới ship.
- **Long-term i18n discipline** — codebase chứa hai mappings: `TIERS` (array với
  i18n key) + `TIERS_LABELS` (record với `t(...)` resolved at module load).
  `TIERS_LABELS` resolve sớm sẽ break khi `i18n` chưa init → đã chọn `TIERS` +
  in-component `t()` cho safety. Deferred consolidation theo backlog code review.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial BUGFIX doc — TIERS i18n wiring + regression test. |
