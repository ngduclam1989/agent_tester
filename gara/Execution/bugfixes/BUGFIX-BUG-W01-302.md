# BUGFIX-BUG-W01-302 — Phiếu QT BH ẨN cột "Phân khúc" trên bảng "Phụ tùng sử dụng" khi SO `serviceType = DETAILING`

| Field | Value |
|---|---|
| Bug ID | BUG-W01-302 |
| Severity | P3 |
| Status | RESOLVED (pending TEST_GROUP / QA verify) |
| Wave | W01 (EP-INSURANCE-SETTLEMENT) |
| Feature(s) | FEAT-INS-STL-DETAIL |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Fix Agent | agent-fix-garage-web |
| Fix Commit | `PENDING_USER_COMMIT` |
| Fix Branch | `feature/ep-insurance-settlement-w01` |
| Spec Version | 1 |
| Last Reviewed | 2026-06-17 |

## 1. Symptom

Phiếu QT BH (STL Detail biến thể BH) từ SO có `serviceType = DETAILING` (vd `SET-20260505-00008` từ SO `PDV-...` dịch vụ "Phụ hồi đít xe") render bảng "Phụ tùng sử dụng" với cột "Phân khúc" hiển thị value raw `TIER1`/`TIER2`/... — vi phạm parity với KH baseline production (`settlement-voucher/components/detail/cost-tab.tsx`) đã ẨN cột này hoàn toàn khi `serviceType === DETAILING`.

User attribution: "Bug do MISS CASE khi chạy wave01" + "làm tương tự màn QT khách hàng".

## 2. Root Cause

BH variant `CostTab` ở `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx` hardcode cột "Phân khúc" trong `PartsTable` (header `<th>Phân khúc</th>` L146 + cell `<td data-testid="col-phan-khuc">…</td>` L167-169) mà **không** đọc `serviceType` từ detail để conditional-hide.

KH baseline canonical đã có pattern:
```ts
const hideSegmentColumn = data?.serviceOrder?.serviceType === ServiceTypeEnum.DETAILING;
const visiblePartColumns = hideSegmentColumn
  ? partColumns.filter((_, index) => index !== 1)
  : partColumns;
```
(`settlement-voucher/components/detail/cost-tab.tsx` L29-30 + L316-322).

**RC = miss-case wave01**: khi build BH variant, dev không port logic conditional column theo `serviceType` từ KH baseline. Đồng thời `serviceType` không nằm trong GraphQL query `GET_INSURANCE_SETTLEMENT_BY_CODE_QUERY` và không project sang view-model — nên FE không có data để conditional render kể cả nếu logic được port.

Cluster anti-pattern với BUG-W01-296 (BH payment method format raw) + BUG-W01-299 (BH part tier format raw enum) — đều = BH variant không reuse KH baseline.

## 3. Fix

### 3.1 Expose `serviceType` qua GraphQL + view-model

`frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts`:

- Query block `serviceOrder { … }` thêm 1 field `serviceType` (SDL `ServiceOrderDetailV3Data` đã expose; non-breaking selection-set expansion).
- `IRawServiceOrder` interface thêm `serviceType?: string | null`.
- `mapInsuranceSettlementDetail` project `serviceType: so?.serviceType ?? undefined` lên root view-model.

`frontend/gf-gms-web/src/features/insurance-settlement/interfaces/index.ts`:

- `InsuranceSettlementDetail` thêm field `serviceType?: string` (comment ref BUG-W01-302).

### 3.2 Conditional column trong `CostTab`

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx`:

- Import `ServiceTypeEnum` từ `@/features/service-order/constants`.
- `CostTab` compute `const hideSegmentColumn = detail.serviceType === ServiceTypeEnum.DETAILING;`.
- Pass `hideSegmentColumn` prop xuống `<PartsTable items={parts} hideSegmentColumn={hideSegmentColumn} />`.
- `PartsTable` signature mở rộng `{ items, hideSegmentColumn = false }`; wrap header `<th>Phân khúc</th>` + body cell `<td data-testid="col-phan-khuc">…</td>` bằng `{!hideSegmentColumn && (…)}` guard.
- `PartsFooterRow` signature nhận `hideSegmentColumn` và switch `colSpan={hideSegmentColumn ? 6 : 7}` cho `<td>Tổng</td>` để footer stretch đúng số cột thực tế render.

### 3.3 Regression test

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-302.test.ts` — 10 source-pin specs:

1. GraphQL query selects `serviceType` trên nested `serviceOrder`.
2. Mapper project `so?.serviceType ?? undefined` lên view-model root.
3. `InsuranceSettlementDetail` interface declare `serviceType?: string`.
4. CostTab import `ServiceTypeEnum` từ service-order constants.
5. CostTab compute `hideSegmentColumn = detail.serviceType === ServiceTypeEnum.DETAILING`.
6. Pass `hideSegmentColumn` vào `<PartsTable>`.
7. Wrap `<th>Phân khúc</th>` trong `!hideSegmentColumn` guard.
8. Wrap `<td data-testid="col-phan-khuc">` trong `!hideSegmentColumn` guard.
9. `PartsFooterRow` `colSpan` switch `7 → 6` khi `hideSegmentColumn=true`.
10. Pass `hideSegmentColumn` vào `<PartsFooterRow>`.

Source-pin (no runtime tree) follow cluster pattern BUG-W01-296/299/301 — catch deploy regressions nếu literal/conditional bị strip.

### 3.4 Cluster siblings

Cluster với BUG-W01-296 / BUG-W01-299 (cùng anti-pattern BH-variant-không-reuse-KH-baseline). 302 fix KHÔNG đụng vùng 296/299 đã RESOLVED — minimal scope.

## 4. Verification

```bash
cd frontend/gf-gms-web
npx vitest run --environment=node \
  src/features/insurance-settlement/components/detail/cost-tab.bug-302.test.ts
# → 10/10 passed

npm run build           # → exit 0 (built in 20.30s)

npx eslint --max-warnings=0 \
  src/features/insurance-settlement/components/detail/cost-tab.tsx \
  src/features/insurance-settlement/components/detail/cost-tab.bug-302.test.ts \
  src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts \
  src/features/insurance-settlement/interfaces/index.ts
# → clean (no warnings)
```

**Env note**: Test suite mặc định chạy `jsdom`; current shell environment có pre-existing dep mismatch (`html-encoding-sniffer/lib/html-encoding-sniffer.js` `require()` ES Module `@exodus/bytes`) làm jsdom env fail load — không phải regression do bug 302 fix. Source-pin test verify pass dưới `--environment=node`. JSDOM-dependent tests (render tests cost-tab.render.test.tsx, etc.) cần env fix riêng (deps upgrade hoặc node v22).

## 5. Files Changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts` | Query +`serviceType` on nested SO; `IRawServiceOrder.serviceType?: string \| null`; mapper project `serviceType` lên view-model |
| `frontend/gf-gms-web/src/features/insurance-settlement/interfaces/index.ts` | `InsuranceSettlementDetail` +`serviceType?: string` |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx` | Import `ServiceTypeEnum`; compute `hideSegmentColumn`; pass prop xuống `<PartsTable>` + `<PartsFooterRow>`; wrap segment header `<th>` + cell `<td>` trong `!hideSegmentColumn` guard; `PartsFooterRow` colSpan switch |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-302.test.ts` | NEW — 10-spec regression source-pin |

## 6. Constraints Honored

- FE-only (Layer 1 garage-web) — KHÔNG đụng BFF (agg-garage-graph) hay BE (gf-accounting/gf-sales). `serviceType` selection-set expansion non-breaking (KH baseline production đã expose).
- KHÔNG modify entities/schemas thuộc boundary khác. KHÔNG đụng Flyway.
- Owned_paths `frontend/gf-gms-web/**` (per agent-fix-garage-web spec).
- Cluster siblings BUG-W01-296 / BUG-W01-299 (RESOLVED) KHÔNG bị regress — minimal scope chỉ touch `PartsTable` column rendering.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial — fix conditional column `Phân khúc` cho BH variant theo `serviceType` parity với KH baseline. |
