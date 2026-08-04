---
type: execution
artifact_kind: dev-handoff
wave: "W01"
stage: "DEV→REVIEW (gate-override)"
status: HANDED-OFF
created: "2026-06-07"
boundaries: [gf-sales, gf-accounting, agg-garage-graph, garage-web, garage-mobile]
gate_override: "CR-1780801962"
---

# W01 DEV→REVIEW Handoff — Insurance Foundation (EP-INSURANCE-SETTLEMENT)

> 5 DEV subagents ran in parallel (umbrella `W01-ALL`) 2026-06-07. Transitioned DEV→REVIEW via
> **gate-override CR-1780801962** (Delivery Authority approved) — env-unverifiable checks deferred to CI.
> All subagents **boundary-clean**. Contract canonical locked by **CR-1780801481** (PENDING).

## 1. Per-boundary results

| Boundary | build | lint | test | coverage | Notes |
|---|---|---|---|---|---|
| gf-sales | PASS | PASS (spotless) | PASS | 100% new (78% svc) | 12 unit tests incl single-payer CALC-INS-006 |
| gf-accounting | PASS | PASS | PASS | 26% (brownfield 0 baseline) | atomic CUSTOMER+INSURANCE pair + rollback IT |
| agg-garage-graph | PASS (tsc) | PASS | no test runner | n/a | passthrough-first; schema composes |
| garage-web | PASS (tsc -b) | PASS (new files) | no test runner | n/a | components built; NOT route-mounted (scope-extend approved) |
| garage-mobile | SDK absent | SDK absent | n/a | n/a | code-complete; both root-cause fixes done (wiring + conditional-display) |

## 2. Files changed (subagent code — all within owned service paths)
- gf-sales: 15 files (ServiceOrder/Part entities+aggregates, V3 DTOs, inline calc in ServiceOrderV3Service, InvalidInsuranceAdjustmentException, for-settlement response, unit tests, KG)
- gf-accounting: 18 files (Settlement aggregate+entity, AllocationMode enum, InsuranceSettlementSnapshot, CreateSettlementRequest, SettlementResponse+InsuranceSettlementDetailBlock+InsuranceDebtPanel, InsuranceSettlementValidator, SettlementService, IT, KG)
- agg-garage-graph: 5 files (settlements + service-orders-v3 schema/types/resolver, KG)
- garage-web: 25 files (currency-input, insurance-allocation/* + insurance-settlement/* features, KG) — standalone, mount pending
- garage-mobile: 13 files (insurance_allocation section+cubit, settlement_detail insurance widgets, extensions, KG, cr-needed doc)

## 3. Deferred / DEBT (carried into REVIEW)
- **CI verification** (gate-override CR-1780801962): Nexus creds (Java), Flutter SDK (mobile), test infra (gf-gms-web + agg). build/lint/test re-run in CI before merge.
- **gf-accounting coverage** 26% → DEBT-backfill-baseline-tests.
- **Contract reconciliation** CR-1780801481 (PENDING): agg mapper (debtPanel rename D4-6, +OVERPAID/FULLY_PAID enum D7, flat→nested D9, depByLine D2); web unwrap D1/D3; mobile wire insurance block (CR-1 read + CR-2 input). Canonical = `Architecture/integrations/INTEG-BFF-GF-{SALES,ACCOUNTING}-INSURANCE.md`.
- **garage-web route-mount** (scope-extend approved, 3 modify_allowlist entries) — FIX pending.
- **Checklist wording** checkstyleMain → spotlessCheck (gf-sales/gf-accounting).
- **garage-mobile host divergence**: mounted into live `ServiceOrderCreationV3` (named route was dead) — confirm in REVIEW.

## 4. Notes for REVIEW agents
- `agent-review-backend`: focus gf-sales calc (BR-EP §7.2 + single-payer), gf-accounting atomic pair + rollback + insurance_payable_amount received-not-computed (BR-GF-ACCOUNTING-006); agg passthrough-first + additive.
- `agent-review-garage-web`: reuse-first honored? currency-input; conditional render Edit/Detail not Create (AC-0); coverage_gaps honored (AC-5/7/10/11/12). Route-mount is separate FIX.
- `agent-review-garage-mobile`: verify wiring not-orphaned + conditional-display (2 blocks only, not whole-screen); host-route divergence acceptable?
- REVIEW exit gate requires: arch_compliance incl CR-1780801481 canonical, CI green (ci_verified), no P1/P2 open.
