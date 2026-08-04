# BUGFIX-BUG-W01-237: ESCALATED — root cause in agg-garage-graph BFF, not gf-sales

> **Status**: ESCALATED — `bugs_escalated[]` from `agent-fix-gf-sales`. **No gf-sales code change applied**.
> **Recommended owner**: `agent-fix-agg-garage-graph` (cross-boundary fix per Escalation Trigger #1).

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-237 |
| **Reported service** | gf-sales |
| **Actual root-cause service** | **agg-garage-graph** (BFF, `bffs/agg-garage-graph/`) |
| **Priority** | P1 |
| **Source TC** | TC-W01-API-SOADJ-032 |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT / AC-14, BR-INS-SO-ADJ-002 |
| **Symptom** | `updateServiceOrderV3` mutation with `depreciationByLine: [{ lineId: <part>, percent: 5 }]` returns HTTP 200 but `dev_gf_sales.service_order_part.depreciation_percent` stays NULL. |

## Reproduction

Runner deactivated the DB assertion (per the bug ticket). Manual SQL `SELECT depreciation_percent FROM dev_gf_sales.service_order_part WHERE id=<part>` returns NULL after the call.

## Root Cause Analysis (Why-chain)

1. **Why is the column NULL after the call?** Because `service_order_part.depreciation_percent` was never written during this request — no UPDATE statement set a non-NULL value.
2. **Why was no UPDATE emitted?** Because the gf-sales V3 part-update path (`ServiceOrderV3Service#handleUpdateServiceOrderParts`) only runs when `request.getParts()` contains the part. The test payload does not include a `parts[]` array — it only sends `depreciationByLine[]`.
3. **Why didn't `depreciationByLine` reach gf-sales as a part update?** The BFF resolver `bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/service-orders-v3.resolver.ts` is supposed to flatten it (`applyDepreciationByLine(input.parts, input.depreciationByLine)`) and then strip the `depreciationByLine` key from the payload. **But** `applyDepreciationByLine` in `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts:739–758` short-circuits with `if (!parts || !byLine || byLine.length === 0) return parts;` — when the client did **not** send a `parts[]` array, `parts === undefined`, the function returns `undefined`, no synthetic part list is built, and the depreciation override is silently dropped before the request leaves the BFF.
4. **Why is gf-sales blameless?** The gf-sales REST contract (`UpdateServiceOrderV3Request#parts[].depreciationPercent`) IS implemented end-to-end:
   - Request DTO carries `depreciationPercent: BigDecimal` (`UpdateServiceOrderPartV3Request.java:102`).
   - `ServiceOrderV3Service#handleUpdateServiceOrderParts` calls `part.applyDepreciationPercent(partRequest.getDepreciationPercent())` on both create (line 1334) and update (line 1365) branches.
   - `ServiceOrderPart#applyDepreciationPercent` writes the field (`ServiceOrderPart.java:180`).
   - MapStruct `ServiceOrderPartMapper` maps `depreciationPercent` ⇄ `depreciationPercent` by name; the entity column `depreciation_percent` is annotated `@Column(name = "depreciation_percent", precision = 5, scale = 2)` (`ServiceOrderPartEntity.java:122–123`).
   - When the request DOES include `parts: [{ id: 1, depreciationPercent: 5 }]`, the persist works.
5. **Why does this look like a gf-sales bug?** Because the test ticket reporter hypothesized "ServiceOrderUpdateMapper hoặc ServiceOrderPart entity không map" — but a code audit (above) shows the mapping exists. The defect is upstream: the BFF mapper drops the input before gf-sales ever sees it.

## Why this is escalated

Per `agent-fix-gf-sales` Forbidden Actions + briefing non-negotiable #5 + Critical Rule #1 (boundary isolation): cross-boundary fix requires REVIEW_GROUP + CR. The fix lives in `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts` (`applyDepreciationByLine`) — outside `OWNED_PATHS`. `agent-fix-gf-sales` may not edit BFF code.

## Suggested fix (for agent-fix-agg-garage-graph)

In `applyDepreciationByLine`:

- When `parts === undefined` but `byLine` is non-empty, synthesize the minimal stub part list `[{ id: lineId, depreciationPercent: percent }]` so gf-sales receives `parts: [{ id, depreciationPercent }]` and the existing `handleUpdateServiceOrderParts` UPDATE branch (`id != null`) fires `existingPart.applyDepreciationPercent(...)` + `partRepository.save(...)`.
- Or, if a stub partial part list is unsafe (legacy V3 update may interpret `parts[]` as authoritative and soft-delete missing parts — see `updateServiceOrderParts` line 1191 `idsToSoftDelete`), introduce a dedicated `depreciationByLine` passthrough field on the gf-sales REST DTO and persist via a focused service method that bypasses the wholesale `parts` reconciler.

**Recommended path**: confirm the BFF intent with the contract owner (CR-1780801481 introduced `depreciationByLine` BFF→gf-sales mapping). If `parts: undefined` is meant to mean "no parts touched", BFF must build a minimal patch payload; otherwise gf-sales must add a dedicated REST input for line-level depreciation overrides.

## Files inspected (no edits)

- `services/gf-sales/src/main/java/com/actechx/gf/app/dto/request/UpdateServiceOrderV3Request.java`
- `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderV3Service.java` (lines 1166–1368)
- `services/gf-sales/src/main/java/com/actechx/gf/domain/model/aggregate/ServiceOrderPart.java`
- `services/gf-sales/src/main/java/com/actechx/gf/adapter/persistence/entity/ServiceOrderPartEntity.java`
- `services/gf-sales/src/main/java/com/actechx/gf/app/mapper/ServiceOrderPartMapper.java`
- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts:739–758`
- `bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/service-orders-v3.resolver.ts:353–390`

## Cross-Reference

- BUG-W01-236 — sibling bug for same field, **validation gap** in gf-sales. **Fixed** in this wave (see `BUGFIX-BUG-W01-236.md`).
- `Tracking/WAVE01/verify/BUG-W01-237.verify.md` — L2 verify owner: agent-test-api. Verify will pass once BFF mapper is patched.
- Related historical bug: BUG-W01-017 (BFF WRITE flatten missing) — same family of payload-drop drift, fixed earlier in BFF. The drop here is the residual case where `parts[]` is absent.
