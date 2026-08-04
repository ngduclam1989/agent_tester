# BUGFIX BUG-W01-240 — Settlement detail "Không tìm thấy phiếu quyết toán"

> **Status**: RESOLVED (FE-side root cause).
> **Authored by**: agent-fix-garage-web.
> **Related**: BUG-W01-244 (same symptom, confirmed via E2E probe — "Cannot query field 'bh' on type 'InsuranceSettlementBreakdown'").

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-240 (P1) |
| Symptom | 3 mã STL (`SET-20260611-00001`, `SET-20260610-00002`, `SET-20260610-00001`) đều hiển thị "Something went wrong!" / "Lỗi Hệ thống" + "Không tìm thấy phiếu quyết toán." |
| Reporter | agent-test-ui |
| Blocks | TC-AUTO-077..090, CONF-03..06 (14 TCs) |
| Confirmed cross-team | BUG-W01-244 (agent-test-e2e) — BFF returns `Cannot query field "bh" on type "InsuranceSettlementBreakdown"` |

## 2. Root cause (why-chain)

### Why #1 — Tại sao trang `/settlement-voucher/{code}` render fallback "Không tìm thấy"?

`<InsuranceSettlementDetailPage>` (`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx:55-62`) render fallback khi `useInsuranceSettlementDetail(code)` trả `detail = undefined`.

### Why #2 — Tại sao `detail = undefined`?

`useInsuranceSettlementDetail` (`.../hooks/use-insurance-settlement-detail.ts:264`) gọi `mapInsuranceSettlementDetail(data?.getSettlementByCode?.data)`. Khi GraphQL query fail validation, Apollo trả `data = undefined` → mapper trả undefined → fallback.

### Why #3 — Tại sao query fail validation?

Query `GetSettlementByCode` reuse fragment `INSURANCE_ADJUSTMENT_FRAGMENT` (`frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.ts`). Fragment cũ (pre-fix) request:

```graphql
breakdownByPayer {
  bh { service parts vat totalAfterVat }
  kh { service parts vat totalAfterVat }
}
```

— **payer-first axis** (`bh`/`kh` ở level trên metric).

### Why #4 — Tại sao đây là sai shape?

Canonical agg SDL `InsuranceAdjustmentBlock` (`bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts:269-274`) định nghĩa:

```graphql
type InsuranceSettlementBreakdown {
  service: InsuranceBreakdownPair    # = { bh: Float, kh: Float }
  parts: InsuranceBreakdownPair
  vat: InsuranceBreakdownPair
  totalAfterVat: InsuranceBreakdownPair
}
```

— **metric-first axis** (`bh`/`kh` ở DƯỚI metric). Comment dòng 262 nói rõ: "Surface B — metric-first axis BUG-W01-209".

GraphQL schema validation reject `breakdownByPayer.bh`: "Cannot query field 'bh' on type 'InsuranceSettlementBreakdown'" → entire query rejected → `data = undefined` → page render "Không tìm thấy".

### Why #5 — Tại sao có drift?

Đây là Surface B legacy (`getSettlementByCode.insurance` wrapper status quo per agg SDL §4.3.7b.6 Open follow-up). Surface A (`getServiceOrderByCode`) đã reshape sang Shape D flat-root (BUG-W01-218), nhưng Surface B giữ nested wrapper. FE fragment được viết khi shape Surface B chưa stabilize → drift do dev FE assumed cùng axis với Surface A inline write shape (`breakdown.bh.{...}`) mà KHÔNG bám agg SDL truth.

Confirm chéo: hook khác (`use-get-settlement-by-code.ts` ở settlement-voucher feature) đã metric-first đúng (lines 281-298) — chứng minh fragment cũ là outlier sai.

## 3. Fix

### Touched files

- `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.ts` — align fragment to metric-first axis (rewrite `breakdownByPayer` selection).
- `frontend/gf-gms-web/src/features/insurance-allocation/interfaces/index.ts` — replace `RawPayerColumn` (payer-first) with `RawBreakdownPair` (metric-first); rewrite `RawInsuranceAdjustmentBlock.breakdownByPayer` shape.
- `frontend/gf-gms-web/src/features/insurance-allocation/index.ts` — export `RawBreakdownPair`, remove `RawPayerColumn`.
- `frontend/gf-gms-web/src/features/insurance-allocation/helper/map-read.ts` — rewrite `mapRawInsuranceAdjustment` to read metric-first axis.
- `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.test.ts` — update fixture data to canonical metric-first shape (pre-fix fixture asserted the wrong axis).

### Diff highlights

`insurance-adjustment-fragment.ts`:
```diff
-    breakdownByPayer {
-      bh { service parts vat totalAfterVat }
-      kh { service parts vat totalAfterVat }
-    }
+    breakdownByPayer {
+      service { bh kh }
+      parts { bh kh }
+      vat { bh kh }
+      totalAfterVat { bh kh }
+    }
```

`map-read.ts`:
```diff
-  const bh = raw.breakdownByPayer?.bh;
-  const kh = raw.breakdownByPayer?.kh;
-  const breakdownByPayer = {
-    service: { bh: num(bh?.service), kh: num(kh?.service) },
-    parts: { bh: num(bh?.parts), kh: num(kh?.parts) },
-    ...
-  };
+  const bd = raw.breakdownByPayer;
+  const breakdownByPayer = {
+    service: { bh: num(bd?.service?.bh), kh: num(bd?.service?.kh) },
+    parts: { bh: num(bd?.parts?.bh), kh: num(bd?.parts?.kh) },
+    vat: { bh: num(bd?.vat?.bh), kh: num(bd?.vat?.kh) },
+    totalAfterVat: { bh: num(bd?.totalAfterVat?.bh), kh: num(bd?.totalAfterVat?.kh) },
+  };
```

## 4. Regression test

`frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.test.ts` (NEW — 6 assertions):

1. Fragment targets canonical SDL type `InsuranceAdjustmentBlock`.
2. `breakdownByPayer` nest là metric-first (`{service, parts, vat, totalAfterVat}` ở level trên, KHÔNG có `bh`/`kh` ở level này).
3. Mỗi metric có cặp `{bh, kh}` (match `InsuranceBreakdownPair`).
4. 5 composite adjustments (`discountMaterial`/`discountLabor`/`claimReduction`/`depreciation`/`insuranceDeductible`) request flat dưới block.
5. `settlementBalance` request 3 scalar `{bhPayment, customerPayment, totalPayment}`.
6. Fragment source text KHÔNG còn pattern payer-first deprecated (`breakdownByPayer { bh { service`).

Plus updated `use-insurance-settlement-detail.test.ts` fixture (existing 5 tests still pass, now with the right axis).

Run: `npx vitest run src/features/insurance-allocation/hooks/insurance-adjustment-fragment.test.ts` → 6/6 PASS.

## 5. Blast radius

| Surface | Affected? | Note |
|---|---|---|
| `getSettlementByCode` GraphQL query (Surface B) | YES — main consumer of fragment |
| `getServiceOrderByCode` (Surface A) | NO — Shape D flat-root, KHÔNG dùng fragment |
| `<TotalServicePricePanel>` render | YES (via mapper) — metric-first BreakdownByPayer view model unchanged |
| `<InsuranceCostTab>` Surface B → Shape D adapter (`mapShapeBToFlatRoot`) | NO — adapter already expects metric-first axis (interface `IInsuranceSettlementCostPanel`) |
| FE caching / Apollo store | LOW — query operation name unchanged; downstream fields unchanged |
| BUG-W01-244 (BFF same symptom) | RESOLVED via this fix — the BFF SDL was correct all along; the FE fragment was the drift point. |

## 6. Verification

- `npm test` → 48/48 pass (11 test files).
- `npm run build` → exit 0 (TS + Vite bundle OK).
- `npm run lint` — pre-existing lint warnings/errors exist in unrelated files (not introduced by this fix).

Manual repro pending L2: open `/settlement-voucher/SET-20260611-00001` after FE deploy → page must render header + 2 info blocks + 4 tabs + panel (no "Lỗi Hệ thống" fallback).

## 7. Notes

- The previous `BUGFIX-BUG-W01-240.md` (analysis-only, BFF tenant-enrichment defensive hardening) addresses a DIFFERENT secondary failure mode (tenant lookup throw). That hardening remains valuable as defense-in-depth but is NOT the root cause of the observed symptom. The primary root cause is the FE fragment shape mismatch confirmed by BUG-W01-244 ("Cannot query field 'bh' on type 'InsuranceSettlementBreakdown'").
- BUG-W01-244 is now de-facto resolved by this FE-side fix — its assigned agent (`agent-fix-agg-garage-graph`) should be informed; BFF SDL is correct as-is and no BFF change is required.
