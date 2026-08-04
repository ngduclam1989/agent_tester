---
type: execution
artifact_kind: dev-handoff
wave: "W02"
stage: "DEV→REVIEW (transitioned)"
status: HANDED-OFF
created: "2026-06-18"
boundaries: [agg-garage-graph, garage-mobile, garage-web, gf-accounting, gf-sales]
gate_override: "CR-20260618-03 (MAJOR, APPROVED) — covers boundary_clean (311 violations from pre-cycle committed files per brownfield long-running-branch structural gap) + build_pass + lint_pass (placeholder `{{BUILD_CMD}}`/`{{LINT_CMD}}` defaults in verify-stage-exit.sh never run in multi-boundary parallel DEV; authoritative status in STATE.exit_criteria.met=true after subagent-return parse + user `mobile OK` confirmation 2026-06-18 13:58Z)"
---

# W02 DEV→REVIEW Handoff — EP-INSURANCE-SETTLEMENT (Dossier + Settlement Create)

> 5 DEV subagents ran in parallel (umbrella `W02-ALL`) 2026-06-18 from 09:49Z.
> Features in flight: FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW.
> Mobile re-spawned once (cycle 2) after harness blockers resolved (codegen allowlist + BFF-shipped-confirm + FAILURE-MODES manual append).

## 1. Per-boundary results

| Boundary | build | lint | test | coverage | Notes |
|---|---|---|---|---|---|
| agg-garage-graph | PASS (tsc) | PASS | ts-node contract scripts pass | n/a | Insurance flags + InsuranceAdjustment 2-col + exportInsuranceDossier mutation + getInsuranceDossierVersions query + 4-phase orchestrator + ct-file-storage upload SHIPPED. Vitest runner gap tracked TEST-GAP-W02-BFF-VITEST. |
| garage-web | PASS | PASS | PASS | n/a (no test runner) | InsuranceDossierModal/Tab + DocumentCardSlot + InsuranceTotalPanel components + settlement-voucher dossier tab. 9 ACs done, 8 items deferred to DEBT registry. |
| gf-accounting | PASS (gradle build) | PASS (checkstyle) | PASS (5 IT classes, 23 tests) | 32% (brownfield baseline) | InsuranceDossierService + Controller + Settlement aggregate evolution + 2 print templates (acceptance-record, payment-authorization) + SettlementPrintStrategyIT + DossierLifecycleIT. 27 items done. Coverage gap tracked DEBT-W02-GF-ACCOUNTING-02. |
| gf-sales | PASS (gradle build) | PASS | PASS (300/300) | 16% (brownfield baseline) | V3 PDV template insurance allocation section + for-print breakdownByPayer extend + popup warn ERR-INS-003. 16 items done. Coverage gap tracked DEBT-W02-COVERAGE-GAP. |
| garage-mobile | UNVERIFIED (harness) | UNVERIFIED (harness) | n/a | n/a | Codegen ran clean (286 outputs incl. router.gr.dart + freezed + g.dart). Code-level review clean. flutter analyze/test/build runtime-unverified — harness denies `Bash(cd mobile/gf-garage-app && flutter *)` despite allowlist. **User runs flutter locally** before /dev-handoff. T2/T3/T5/T6/T14 wired against shipped BFF SDL. 17 items done; 3 deferred (T10 PDF eval out-of-scope, T17 test creation TEST-stage, runtime verify BLOCKER-W02-MOBILE-HARNESS-FLUTTER). |

## 2. Files changed (subagent deliverables — uncommitted working tree)

- **agg-garage-graph**: 28 files (settlements + insurance-dossiers + service-orders-v3 schema/types/resolver/mapper, orchestrator.ts 4-phase, config endpoints+env, harness REVIEW-CHECKLIST, KG)
- **garage-web**: 12 files (insurance-dossier feature module — modal/tab/document-row/index/constants/interfaces, settlement-voucher insurance-total-panel + create index, insurance-settlement detail create-dossier-button + detail-page, KG, IMPL-CHECKLIST)
- **gf-accounting**: 40 files (InsuranceDossier aggregate+entity+repository+mapper+JpaRepository, InsuranceDossierController + Service + DTOs, Settlement aggregate evolution incl SettlementBreakdownByPayer + InsuranceSettlementCreatePanelIT/DualVoucherWhenInsuranceCoversAllIT/InsuranceDossierLifecycleIT/SettlementPrintStrategyIT, BusinessMessage error codes, DossierStatus/InsuranceDossierDocType enums, DocPrintService/DossierPrintService/SettlementPrintStrategy + builder, 2 dossier templates + 2 settlement templates, KG, IMPL-CHECKLIST)
- **gf-sales**: 15 files (ServiceOrderForPrintResponse + ServiceOrderForSettlementResponse, ServiceOrderInternalService inline insurance compute, ServiceOrderV3Service warn logic, V3PrintContext.InsuranceAllocation, ServiceOrderForPrintService for-print extend, V3PrintDataBuilder, V3 PDV template styles + service-order-v3.html, 4 test classes incl ServiceOrderCompletePopupWarnTest + V3PrintDataBuilderInsuranceTest, KG, IMPL-CHECKLIST)
- **garage-mobile**: 11 files (insurance_dossier_screen renamed Page, document_card_slot widget, acceptance_form_page, insurance_settlement_detail_screen caller update, router + router.gr.dart + cubit.freezed.dart + models.g.dart codegen outputs, IMPL-CHECKLIST, KG)
- **Orchestrator**: `.claude/settings.json` (Bash allowlist +4 patterns for flutter/dart build_runner), `Execution/FAILURE-MODES.md` (+FM-W02-301), `Execution/STATE.json` (exit_criteria notes + scope-extend #5 for FAILURE-MODES `237`)
- **gf-accounting checklist self-check** (orchestrator): ticked T51/T55, deferred T52/T53/T54 with reasons

## 3. Deferred / DEBT (carried into REVIEW)

- **DEBT-W02-MOBILE-T10**: PDF preview embedded package eval (out-of-scope per FEAT-INS-DOSSIER-CREATE v17/v18 B-3 — form template thay upload)
- **DEBT-W02-MOBILE-T17**: integration_test/insurance_dossier_test.dart — TEST stage owns
- **BLOCKER-W02-MOBILE-HARNESS-FLUTTER**: flutter analyze/test/build runtime verification (user local run + manual paste; FM-W02-302 logged)
- **DEBT-W02-GF-ACCOUNTING-01**: golden PDF byte-test for 2 auto-render templates (acceptance-record + payment-authorization) — variant selection IS golden-tested via SettlementPrintStrategyIT
- **DEBT-W02-GF-ACCOUNTING-02**: service-wide line coverage ≥ 80% (currently ~32%) — brownfield baseline gap on Hibernate boilerplate
- **DEBT-W02-COVERAGE-GAP** (gf-sales): project-wide line coverage ≥ 80% (currently ~16%) — brownfield baseline; W02-touched classes meet bar
- **TEST-GAP-W02-BFF-VITEST**: agg-garage-graph Vitest contract test (T11) — repo has no Vitest first-party runner; ts-node test:insurance-mapper + test:insurance-contract pass
- **DEBT-W02-BFF-INS-STL-CREATE-FLAGS / DEBT-W02-BFF-INS-DOSSIER-MUTATIONS** (garage-web cycle-1): web-side wiring needed for shipped BFF flags + mutations — partial; revisit in REVIEW
- **DEBT-W02-CR-20260616-02-PANEL-2COL** (garage-web): display-only reflow blocked on Phase A staging stability
- **DEBT-W02-CR-20260618-01-KH-ALLOC-LAYOUT** (garage-web): KH-only allocation layout; FE depends on BFF flag wired
- **DEBT-W02-STATE-MATRIX-EVIDENCE** (garage-web): BH=Có|Không × 3 màn × tab smoke matrix — needs dev server + Nexus
- **DEBT-W02-DOSSIER-PREVIEW-RENDER** (garage-web): preview area + 4-doc template render — depends on ADR-016 PDF library decision (W03)
- **RELEASE-POLICY-W02 / PKG-W02-insurance-dossier.md §5**: Hard gate A→B (Phase A merged + stable 24h staging before Phase B prod rollout) — release-management owned, not DEV

## 4. STRUCTURAL GAP — boundary_clean scan vs long-running brownfield branch

`scripts/scan-boundary.sh` compares `git diff --name-only main...HEAD` against `STATE.owned_paths`. On this branch (`feature/ep-insurance-settlement-w02`):

- **914 files committed vs main** = ALL prior W02 wave commits (charter framework, execution-spec, planning, prior DEV cycles)
- **223 files uncommitted** = current DEV cycle's actual subagent deliverables + some pre-cycle prep work (figma assets, Architecture docs)
- **311 boundary scan violations** reported = pre-existing branch state, NOT this DEV cycle's work

**This DEV cycle's actual subagent deliverables stayed within owned_paths** — verified per per-boundary RETURN JSON. The scan failure is a structural mismatch between the scan algorithm (`main...HEAD` comparison) and the brownfield long-running branch reality.

### Resolution path at /dev-handoff

The `verify-stage-exit.sh DEV` will FAIL `boundary_clean` with 311 violations. Override via:

```
/cr-raise MAJOR boundary_clean
  reason: "Long-running brownfield branch — boundary_clean compares main...HEAD but
           pre-existing W02 commits (charter framework, execution-spec, prior DEV cycles)
           span dirs outside this cycle's owned_paths. Per-boundary subagent RETURN JSON
           confirms each subagent stayed within its OWNED_PATHS for this cycle's work.
           Suggested protocol fix: introduce BASE_REF=<dev-start-snapshot> for DEV-stage
           boundary scans on brownfield branches."
```

Future protocol enhancement (CR-worthy, not blocking W02 handoff):
- Tag `dev-start-W{NN}` at `/dev-start`; `scan-boundary.sh` defaults `BASE_REF` to that tag for DEV stage.
- Or: switch DEV-stage scan to working-tree diff (`git status --porcelain`) instead of committed-vs-main.

## 5. Contract baseline

- `agg-garage-graph` (producer) touched SDL: insurance flags + InsuranceAdjustment 2-col + negativeInsuranceWarn + exportInsuranceDossier + getInsuranceDossierVersions + 4 SDL types
- `gf-accounting` (provider) touched REST: insurance-dossier-documents/batch + render-pdf endpoints + insurance-dossiers/search + Settlement breakdownByPayer extend
- `gf-sales` (provider) touched REST: service-orders/{id}/for-print + service-orders/{id}/for-settlement response (settlementSummary.warnings + breakdownByPayer 5-allocation)
- **Action**: orchestrator spawn `agent-contract-steward REFRESH-HASHES` to re-sign baseline before /dev-handoff — REVIEW stage will scan for hash drift.

## 6. Pre-handoff checklist (orchestrator)

- [ ] User runs `cd mobile/gf-garage-app && flutter pub get && dart run build_runner build --delete-conflicting-outputs && flutter analyze && flutter test` locally; pastes "mobile OK"
- [ ] orchestrator: `/cr-raise MAJOR boundary_clean` per §4 with structural-gap reason
- [ ] orchestrator: spawn `agent-contract-steward REFRESH-HASHES` per §5
- [ ] orchestrator: flip `all_subagents_clean.met = true` (5 boundaries verified clean) + `all_builds_pass.met = true` (5 builds verified, mobile via user local) via slash command at handoff time
- [ ] orchestrator: `/dev-handoff` → DEV → REVIEW

## 7. Cycle log

| Time (UTC) | Event |
|---|---|
| 09:49 | DEV cycle 1 last_transition |
| ~12:50 | /spawn-dev (no arg) → 5 subagents launched in parallel |
| ~12:54 | agg-garage-graph returns clean |
| ~12:54 | gf-sales returns clean |
| ~12:54 | garage-web returns clean |
| ~12:58 | gf-accounting returns clean |
| ~13:02 | garage-mobile returns NOT clean (codegen + BFF stale-view + FM append blockers) |
| ~13:02 | User confirms "Fix all 3 + re-spawn mobile" |
| ~13:04 | Fix 1: `.claude/settings.json` allowlist extended (+4 patterns) |
| ~13:06 | Fix 2: `/scope-extend FAILURE-MODES.md 237`; FM-W02-301 appended |
| ~13:07 | Fix 3: mobile re-spawn with addendum |
| ~13:31 | mobile cycle 2 returns — code-clean, runtime-unverified |
| ~13:36 | `/dev-checkpoint` snapshot; user authorizes Actions 2/3/4 |
| 2026-06-18 | this prep doc created (Action 3) |
