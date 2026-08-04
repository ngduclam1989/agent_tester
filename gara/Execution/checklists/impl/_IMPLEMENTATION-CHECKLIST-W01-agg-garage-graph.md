---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 3
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-10"
wave: "W01"
boundary: "agg-garage-graph"
---

# Implementation Checklist — W01 · agg-garage-graph

> Generate bởi orchestrator TRƯỚC `/spawn-dev agg-garage-graph`, từ `docs/Product/wave-01-tasks.md` +
> `Architecture/api/agg-garage-graph-graphql.md` + INTEG-FE §3.4b + ADR-014 + `.harness/_REVIEW-CHECKLIST.md`.
> Features: **FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL**. Contract chốt cuối ngày 1 (gate web + mobile).

## Tasks

- [x] T1 GraphQL types: `InsuranceAllocation` (flat scalar), `InsuranceAllocationMode (PERCENT|AMOUNT)`, `InsuranceSettlement`, `InsuranceSettlementCostTab`, `InsuranceSettlementHeader` (SDL embed `.schema.ts`) · scope:`src/graphql/modules/**/*.schema.ts`,`src/graphql/modules/**/*.types.ts` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-6` · review:`R1,R19`
- [x] T2 **1 mutation mới** `createInsuranceSettlement(id: Int!, input: CreateInsuranceSettlementRequest!)` → gf-accounting `POST /api/v1/service-orders/{id}/settlements` (pull snapshot, KHÔNG push) · scope:`src/graphql/modules/**/*.resolver.ts` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R1,R16`
- [x] T3 Additive trên op hiện hữu (KHÔNG op mới): input allocation trên `updateServiceOrderV3`; đọc trên `getServiceOrderByCode`; block `insurance`+`debtPanel` trên `getSettlementByCode` · scope:`src/graphql/modules/**/*.schema.ts`,`*.resolver.ts` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-1;FEAT-INS-STL-DETAIL-AC-4` · review:`R1,R19`
- [deferred:passthrough-first — DataLoader không cần] T4 DataLoader cho `InsuranceSettlement → ServiceOrder → LineItems` (tránh N+1) · scope:`src/graphql/modules/**`,`src/graphql/common/**` · ac:`FEAT-INS-STL-DETAIL-AC-4` · review:`R16`
- [x] T5 Enforce enum `InsuranceAllocationMode` + propagate `400 INVALID_ALLOCATION_MODE` từ downstream (error union) · scope:`src/graphql/modules/**/*.resolver.ts` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-14` · review:`R1`
- [x] T6 Auth header propagation (X-Tenant-Id, X-Branch-Id, Authorization) downstream qua `PassthroughService`/`ApiClient`; endpoint qua `buildEndpoint()`/`createEndpoint()` · scope:`src/graphql/common/**`,`src/config/endpoints.ts` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R2,R16`
- [deferred:no first-party test runner] T7 Vitest contract test (nếu test runner có); nếu chưa có first-party test → báo gap trung thực, KHÔNG claim coverage · scope:`src/**/*.test.ts` · ac:`FEAT-INS-STL-DETAIL-AC-4` · review:`R17,R18`
- [x] T8 Cập nhật `.knowledge-graph.yaml` nếu có; Change Log bump · scope:`.knowledge-graph.yaml` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-6` · review:`R2`
- [ ] T9 **(FIX CR-1780980611) Error-code passthrough**: agg passthrough nguyên `code` từ REST error (gf-sales/gf-accounting) vào GraphQL `errors[].extensions.code` — KHÔNG rewrite/normalize/nuốt code (PassthroughService discipline); warning non-block (INS-1006) giữ trong `data`, không đẩy vào `errors`; SDL enum `InsuranceAllocationMode` giữ validation sớm · scope:`src/resolvers/**`,`src/data-sources/**`,`src/middleware/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-14`,`FEAT-INS-STL-DETAIL-AC-1` · review:`R2` · ref:`CR-1780980611`
- [ ] T10 **(FIX BUG-W01-209, gated on CR canonical-shape)** Rebuild SDL `InsuranceAdjustmentBlock` khớp FEAT-INS-SO-ADJUSTMENT §4: (a) thay 5 scalar `discountMaterial/discountLabor/depreciation/claimReduction/insuranceDeductible` bằng `adjustments: [InsuranceAdjustmentItem!]!` (7 field/item: key/label/mode/value/amount/sign/transferToCustomer); (b) đảo trục `InsuranceSettlementBreakdown` từ payer-first `{bh,kh}` sang metric-first `{service,parts,vat,totalAfterVat}` mỗi nhánh có `{bh, kh}`; (c) giữ `InsuranceSettlementHeader.bhPayment` theo spec. Mapper `insurance.mapper.ts:111-145, 282-353` rebuild re-aggregate 5 flat REST scalar → array + đảo axis breakdown. Passthrough discipline: KHÔNG thay đổi REST contract gf-sales (giữ v7 flat). Regression: assert TC-W01-API-042 (Contract suite) PASS sau fix · scope:`src/graphql/modules/gf-sales/service-orders-v3/service-orders-v3.{schema,types,resolver}.ts`,`src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts` · ac:`FEAT-INS-SO-ADJUSTMENT-§4` · review:`R1,R2,R19` · ref:`BUG-W01-209` (gated on CR canonical-shape — option A recommended)

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — passthrough-first, additive-only
- [ ] `cd bffs/agg-garage-graph && npm run build && npm run typecheck && npm test` pass (coverage ≥ 80% nếu runner có; else báo gap)
- [ ] Contract khớp INTEG §3.4b + enum mode; field name đồng bộ gf-sales/gf-accounting
- [ ] 3-in-1 / Change Log bump

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-07 | 1 | Delivery Authority | Generated for W01/agg-garage-graph (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL). |
| 2026-06-09 | 2 | Delivery Authority (CR-1780980611) | +T9 error-code passthrough `extensions.code` (FIX): agg KHÔNG rewrite code từ BE; warning non-block giữ trong data. |
| 2026-06-10 | 3 | agent-test-api (BUG-W01-209) | +T10 (FIX BUG-W01-209, gated on CR) — rebuild SDL `InsuranceAdjustmentBlock`: 5 scalar → `adjustments: [InsuranceAdjustmentItem!]!`, breakdown payer-first → metric-first; mapper re-aggregate. Regression: TC-W01-API-042. |
