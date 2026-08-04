# BUGFIX-BUG-W01-262: gf-sales persist `depreciationPercent` per part — regression test coverage

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-262 |
| **Service** | gf-sales |
| **Priority** | P1 |
| **Source TC** | TC-W01-API-SOADJ-032 |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT / AC-5, AC-14, BR-INS-SO-ADJ-005 |
| **Mô tả** | `PUT /api/v3/service-orders/{id}` phải nhận `parts[i].depreciationPercent` từ request body và persist vào `service_order_part.depreciation_percent`. Là paired fix với BUG-W01-261 (BFF SDL refactor: `depreciationPercent` moved to part-level passthrough). |

## Reproduction Steps

Per ticket: sau khi BUG-W01-261 fix BFF SDL, gf-sales phải nhận `parts[i].depreciationPercent` từ body REST. Xác minh end-to-end: `PUT /api/v3/service-orders/{SO_ID}` body `{ parts: [{id:1, payer:"BH", depreciationPercent:30}] }` → `SELECT depreciation_percent FROM service_order_part WHERE id=1` → expect 30.

## Root Cause

Why-chain:

1. **Why bug originally filed?** BUG-W01-237 (root): mapper / entity không bind `depreciationPercent` từ request → DB luôn NULL. BUG-W01-262 là evolution: sau khi BFF SDL refactor (BUG-W01-261) chuyển sang part-level passthrough, gf-sales cần confirm toàn bộ chain hoạt động.
2. **Why no regression coverage?** Code chain đã đúng (DTO có field, entity có column, MapStruct tự map theo tên, service call chain `handleUpdateServiceOrderParts` → `ServiceOrderPartMapper.toEntity()`), nhưng không có unit test verify the chain end-to-end trong isolation. TC-AUTO-032 là integration test, chạy qua BFF.
3. **Why code was already correct?**
   - `UpdateServiceOrderPartV3Request.depreciationPercent: BigDecimal` — field tồn tại ở DTO.
   - `ServiceOrderPartEntity.depreciation_percent: BigDecimal` — column mapped với `@Column(name="depreciation_percent")`.
   - `ServiceOrderPartMapper` dùng MapStruct — auto-maps by name (`depreciationPercent` ↔ `depreciationPercent`).
   - `ServiceOrderV3Service.handleUpdateServiceOrderParts()` gọi mapper để convert request → domain → entity.
4. **Why was it still filed as P1?** End-to-end integration failed because BFF (agg-garage-graph) was dropping `depreciationPercent` before forwarding (BUG-W01-261). gf-sales side was correct but untested in isolation — a potential regression risk.
5. **Why add regression tests?** Guard against future refactors breaking the mapping chain without detection. Per Exit Criteria: "Regression test mới ADDED + PASS".

Net root cause: missing unit test coverage for the `depreciationPercent` persist chain. Code was already correct. Fix = add regression tests.

## Fix

- **Files changed:**
  - `services/gf-sales/src/test/java/com/actechx/gf/app/service/ServiceOrderV3ServiceInsuranceTest.java` (new file)
    - `bug262_newPart_depreciationPercentPersisted` — ArgumentCaptor trên `serviceOrderRepository.save()` verify saved part has `depreciationPercent=20` when request includes it.
    - `bug262_existingPart_depreciationPercentUpdated` — existing part with `depreciationPercent=null` updated to `15` when request sends `15`.
    - `bug262_existingPart_nullDepreciationClears` — existing part with `depreciationPercent=10` set to `null` when request sends `null` (clear/remove override).

- **No production code change:** implementation was already correct. Tests verify the existing correct behavior.

## Regression Test

- **File:** `services/gf-sales/src/test/java/com/actechx/gf/app/service/ServiceOrderV3ServiceInsuranceTest.java`
- **Test names:**
  - `bug262_newPart_depreciationPercentPersisted` — new part with depreciationPercent=20 persists correctly.
  - `bug262_existingPart_depreciationPercentUpdated` — null→15 update.
  - `bug262_existingPart_nullDepreciationClears` — 10→null clear.
- **Pre-fix state:** tests did not exist (no regression coverage).
- **Post-fix state:** 3/3 PASS. Full suite 286 green.

## Verification Checklist

- [x] Implementation verified correct (DTO field, entity column, MapStruct auto-mapping, service call chain).
- [x] Regression tests added and pass.
- [x] Existing tests still pass.
- [x] `./gradlew build` green.
- [x] `Tracking/WAVE01/BUGS.md` status updated → `RESOLVED`.
- [x] No production code changed (tests only).

## Blast Radius

| Surface | Impact |
|---|---|
| `service_order_part.depreciation_percent` | Persist behavior unchanged (was already correct). |
| `for-settlement` snapshot `lines[].depreciationPercent` | Reads from DB — now covered by regression test. |
| Validation (BUG-W01-236 `INS_ADJ_PERCENT_OUT_OF_RANGE`) | Still active on the same request path — not regressed. |

## Cross-Reference

- BUG-W01-261 — paired BFF SDL refactor (agg-garage-graph). Both needed for end-to-end.
- BUG-W01-237 — original NULL persist bug (superseded by BUG-W01-262 with contract refactor).
- BUG-W01-236 — line-level validation (`validateLineDepreciationPercents`).
- gf-sales-api.md §3bis.1 line 4069 — `parts: [{id, payer, depreciationPercent}]` contract.
