# BUGFIX — BUG-W03-029

> Revert catalog Kafka outbox/event-publishing machinery (BUG-W03-002 scope correction)
> Severity: **P2** · Boundary: `gf-inventory` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

This is a **cleanup/revert** bug, not a functional defect. Two prior FIX cycles
(`5ce3267`, `99c1178`) built a full catalog-domain Kafka outbox/event-publishing
subsystem (`CatalogEventService` → outbox insert → `EventPublishingService`
type-based dispatch → new `CatalogEventPublisher` → topic
`AC-DEV-INVENTORY-CATALOG-EVENTS`) in response to BUG-W03-002 ("catalog mutations
don't publish outbox events — ADR-004 violation"). On 2026-07-01 the SA (Solution
Architect) confirmed **no downstream consumer needs catalog Kafka events in W03
scope** — the original bug's premise was a scope misunderstanding, not a real
ADR-004 violation. BUG-W03-002 was flipped `VERIFIED` → `INVALID`, and this bug
(BUG-W03-029) was opened to revert the now-unnecessary machinery.

The revert had to be **surgical**, not a blanket `git revert` of `5ce3267`,
because that commit bundled the catalog-event work (BUG-002) together with five
unrelated fixes that must be preserved: BUG-004 (`hasActivity()` real check),
BUG-006 (`CatalogMdmValidationService` MDM validation), BUG-007 (checklist doc
annotation), BUG-008 (`InternalProductServiceTest`, 15 unit tests), BUG-010/011
(N+1 → bulk repository methods).

## 2. Root Cause / Rationale

Not a code defect — a **scope correction**. `CatalogEventService` and its
wiring were built to satisfy a requirement (downstream consumers needing catalog
events) that the SA subsequently confirmed does not exist for this wave. Carrying
dead Kafka-publishing machinery forward would leave: (a) unused topic config
(`kafka.topics.catalog-events`) and Kafka client wiring with no real consumer,
(b) an `EventPublishingService` dispatch path (`MessageGroup.CATALOG` branch)
that's dead code, (c) test surface (`EventPublishingServiceTest`,
`InternalProductServiceTest`'s catalog-event assertions) verifying behavior that
serves no product need — all unnecessary maintenance burden and audit-trail
noise for zero business value this wave.

## 3. Fix — 2-step revert

### Step 1 — clean revert of `99c1178` (entire commit, was HEAD)

`git revert 99c1178 --no-edit` → commit **`c9abfc5`**. Applied with zero
conflicts (99c1178 was the tip commit, all its diffs isolated/additive). Result:

- Deleted (new files added by `99c1178`): `domain/event/CatalogEvent.java`,
  `adapter/kafka/publisher/catalog/CatalogEventPublisher.java`,
  `adapter/kafka/publisher/catalog/CatalogMessage.java`,
  `src/test/java/.../app/service/EventPublishingServiceTest.java` (the round-2,
  catalog-dispatch-specific version).
- Restored `app/service/EventPublishingService.java` to its pre-99c1178 form:
  unconditional `branchLifecyclePublisher.publish(rawData, headers)` for every
  outbox row (the exact, original, previously-untested-but-production behavior
  — `5ce3267` never touched this file, so reverting `99c1178` alone fully
  restores it).
- Restored `src/main/resources/application.yml` (removed
  `kafka.topics.catalog-events`).
- Restored `domain/enums/MessageGroup.java` (removed `CATALOG("CATALOG")`) and
  `domain/enums/MessageStep.java` (removed the 10-entry catalog block).
- Restored `domain/enums/OutboxEventType.java`'s catalog entries back to their
  `5ce3267` interim form (`usesMessageWrapper=false, null, null`) and
  `app/service/catalog/CatalogEventService.java`'s payload-building logic back
  to its `5ce3267` flat-JSON form — both are interim states, fully removed in
  step 2.

### Step 2 — surgical manual revert of the catalog-only slice of `5ce3267`

Commit **`7d01026`**. Preserves every other fix in `5ce3267`.

- **Deleted entirely**: `app/service/catalog/CatalogEventService.java` — no
  other code needs it after this revert.
- **`domain/enums/OutboxEventType.java`**: removed the 10
  `MATERIAL_GROUP_*`/`INTERNAL_PRODUCT_*` entries. Enum now ends at
  `WAREHOUSE_CREATED` (plus the pre-existing 8 legacy `INVENTORY_*` entries) —
  same shape as before `5ce3267`/`99c1178` ever touched this file.
- **`app/service/catalog/MaterialGroupService.java`**: removed the
  `catalogEventService` field + 3 call sites (`publishMaterialGroupCreated`/
  `Updated`/`Deleted` in create/update/delete). **Kept**: the BUG-010/011 bulk
  cascade-status update (`repository.bulkUpdateStatus(...)`) and everything
  else.
- **`app/service/catalog/InternalProductService.java`**: removed the
  `catalogEventService` field + all 8 call sites (create/update/delete/
  unmapSku/mapSku/2×conversionUnit/2×attachment). **Kept**: `mdmValidationService`
  wiring (BUG-006), the rewritten `hasActivity()` real-transaction check
  (BUG-004), the bulk delete calls (BUG-010/011), the 30MB attachment comment.
- **Left completely untouched** (unrelated fixes, other bugs):
  `InternalProductImportService.java`, `CatalogMdmValidationService.java`,
  `CatalogErrorCode.java` (`IMPORT_UNIT_INVALID` is BUG-006, not BUG-002),
  `docs/Product/_IMPLEMENTATION-CHECKLIST.md`, `CatalogControllerMappingTest.java`,
  `InternalProductImportServiceTest.java`, all `Jpa*Repository` bulk-method
  additions.
- **Test files adapted** (not deleted — BUG-008 coverage preserved, same
  15-test count in `InternalProductServiceTest`):
  - `MaterialGroupServiceTest.java` — dropped the now-unused
    `@Mock CatalogEventService catalogEventService` declaration.
  - `InternalProductServiceTest.java` — dropped the `@Mock` declaration; 5
    tests whose *sole* assertion was the now-removed `catalogEventService.publish*()`
    call were repurposed to assert the real underlying repository
    save/delete instead (and renamed to reflect what they now verify):
    - `create_persistsAndPublishesOutboxEvent` → `create_persistsInternalProduct`
    - `delete_bulkDeletesChildrenAndPublishesEvent_whenNoActivity` → `delete_bulkDeletesChildren_whenNoActivity`
    - `mapSku_publishesOutboxEvent_onSuccess` → `mapSku_savesMapping_onSuccess` (now asserts `verify(skuMappingRepository).save(...)`)
    - `unmapSku_publishesOutboxEvent_onSuccess` → `unmapSku_deletesMapping_onSuccess` (kept existing `verify(skuMappingRepository).delete(row)`)
    - `addAttachment_publishesOutboxEvent_onSuccess` → `addAttachment_savesAttachment_onSuccess` (now asserts `verify(attachmentRepository).save(any())`)
    - 2 more tests (`update_allowsMainUnitChange_whenNoTransactionActivity`,
      `mapSku_rejectsWhenAlreadyMappedToAnotherProduct`) kept their name/body,
      only the dead `verify(catalogEventService...)`/`verifyNoInteractions(catalogEventService)`
      line was dropped.

## 4. Regression Test

- **File:** `src/test/java/com/actechx/gf/app/service/EventPublishingServiceTest.java` (recreated — the round-2 version was catalog-dispatch-specific and deleted in step 1)
- **Test name:** `publishEvent_routesWarehouseCreatedToBranchLifecyclePublisher`
- **Scenario:** Directly addresses this bug's explicitly called-out regression
  risk ("`EventPublishingService` dispatch logic is shared"). Builds an
  `OutboxEventEntity` with `eventType = OutboxEventType.WAREHOUSE_CREATED.getEventTypeName()`
  and a Message-envelope-shaped payload (`{headers, data, ...}`, matching the
  `WarehouseCreatedEvent`/`Message` convention), calls `publishEvent(event)`,
  and asserts (via `ArgumentCaptor`) that `branchLifecyclePublisher.publish(...)`
  is invoked with the correctly extracted `data`/`headers` — proving the
  `WAREHOUSE_CREATED` path is fully unaffected by the revert.
- There was previously no dedicated test for `EventPublishingService` at all
  (confirmed via `git log` — the only prior test for this class was the
  round-2 catalog-specific one now deleted), so this closes a pre-existing gap
  as a side effect.

## 5. Blast Radius

- **REST API**: none — no public endpoint signature changed.
- **Event publish/consume (outbox)**: catalog mutations (MaterialGroup/InternalProduct
  create/update/delete/SKU-map/conversion-unit/attachment) no longer insert
  outbox rows or publish Kafka events — this is the intended effect of the
  revert (SA-confirmed no consumer needs them). `WAREHOUSE_CREATED` outbox
  path (production-critical, shared dispatch logic) verified unaffected.
- **Temporal workflow / activity**: none.
- **DB schema**: none — no migration touched (outbox table itself is
  unaffected, just fewer event *types* get inserted into it).
- **Cross-boundary caller**: none (`agg-garage-graph`/`gf-sales`/`gf-purchase`/
  `gf-inventory-worker` never consumed the catalog events — confirmed by the
  SA's original scope statement).

## 6. Verification Checklist

- [x] Fix applied (2 commits: `c9abfc5` clean revert of `99c1178`, `7d01026` surgical revert of `5ce3267`'s catalog-only slice)
- [x] Regression test added (`EventPublishingServiceTest.publishEvent_routesWarehouseCreatedToBranchLifecyclePublisher`) + PASS
- [x] `./gradlew clean build` PASS
- [x] `./gradlew test` PASS — **95/95 tests** (0 failures/errors, verified via `build/test-results/test/*.xml`)
- [x] `./gradlew spotlessCheck` PASS (repo has no `checkstyleMain` task — Spotless is the lint gate here, not Checkstyle)
- [x] Coverage delta ≥ 0 (test count preserved: `InternalProductServiceTest` still 15 tests, `MaterialGroupServiceTest` unchanged at 8, plus 1 new `EventPublishingServiceTest`)
- [x] Repo-wide grep for `CatalogEventService`/`CatalogEventPublisher`/`CatalogMessage`/`MessageGroup.CATALOG`/`MessageStep.MATERIAL_GROUP*`/`MessageStep.INTERNAL_PRODUCT*`/`catalog-events` config key → 0 hits (both by the executing subagent and independently re-verified by the orchestrator)
- [x] `knowledge-graph.yaml` — no update needed (verified: the catalog Kafka event machinery was never registered in `gf-inventory.knowledge-graph.yaml` in the first place, so no stale entries to remove)
- [x] Tenant isolation — n/a, no tenant-scoped logic touched
- [x] Logging alert prefix `[INVENTORY_ALERT*]` — not touched, no error path in this revert
- [x] Tracker status updated → `Tracking/WAVE03/BUGS.md` `FIX_DONE`
- [x] No force-push, no `--no-verify`, no test skipping used
- [x] Commits local only (`c9abfc5`, `7d01026`), not pushed to `origin` — matches existing branch state (`5ce3267`/`99c1178` were also unpushed)

## Change Log

| Date | Version | Description | Author |
|---|---|---|---|
| 2026-07-01 | 1 | Initial BUGFIX doc — 2-step revert of catalog Kafka outbox/event-publishing machinery (SA scope correction, BUG-W03-002 flipped `INVALID`). | agent-fix-gf-inventory (spawned) / orchestrator (main agent) |
