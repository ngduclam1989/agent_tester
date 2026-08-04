# BUGFIX-BUG-W03-119 — Race between `deleteMaterialGroup` and `createInternalProduct(materialGroupId)` produces orphan product

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-119`
> **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-119.verify.md`
> **Boundary**: `gf-inventory`
> **Severity**: P2
> **Wave**: W03 (Danh mục vật tư — EP-INVENTORY-CATALOG slice 1/4)
> **FEAT**: `FEAT-CAT-GRP-DELETE` + `FEAT-CAT-PROD-CREATE`
> **Guard code**: `ERR-INV-004` (BR-CAT-GRP-005 — không xóa nhóm còn sản phẩm)
> **Fix author**: agent-fix-gf-inventory
> **Fix date**: 2026-07-03
> **Fix status**: `FIX_DONE` (awaiting QC verify per §4.2 verify.md)

---

## 1. Symptom (from L2 verify §2.3)

When two clients hit `DELETE /material-groups/{id}` and `POST /internal-products` (with `materialGroupId={id}`) concurrently against the same empty group, 2/3 runs both requests returned 2xx and, after settlement, the product row referenced a `material_group_id` for which no row existed. Guard `ERR-INV-004` (BR-CAT-GRP-005) was violated because its check (`countByMaterialGroupId`) and the DELETE were not serialised with the concurrent INSERT.

---

## 2. Root cause (Why-chain)

1. **Symptom** — orphan `internal_product.material_group_id` after `Promise.all([delete, create])`.
2. **Why does the guard fail?** `MaterialGroupService.delete()` reads `productRepository.countByTenantIdAndMaterialGroupId(...)` and — if 0 — calls `repository.delete(entity)`. That is a classic **check-then-act** on the same row (`material_group`) with no lock in between.
3. **Why does the create succeed after the guard read?** `InternalProductService.create()` looks up the target `material_group` via `materialGroupRepository.findByTenantIdAndId(...)` (plain read), checks `status == ACTIVE`, then inserts into `internal_product`. The read acquires **no** shared lock — a concurrent `DELETE` on the same group is not blocked.
4. **Why does the race exist at all?** PostgreSQL's default `READ COMMITTED` isolation lets two transactions each see a snapshot where the invariant "group has no products AND group is ACTIVE" holds — until both COMMIT and merge to a state that violates it (product references a deleted group). No FK constraint from `internal_product.material_group_id` → `material_group.id` at the DDL level either (this service runs `ddl-auto: update`, no Flyway; the entity carries only a scalar FK column per ADR-009).
5. **Root cause** — **absence of a pessimistic row lock on the shared `material_group` row** across the two paths that mutate the invariant. Both paths must funnel through the same lock so one transaction blocks until the other commits.

---

## 3. Fix

### 3.1 Approach

Introduce a `SELECT ... FOR UPDATE` (pessimistic write) lookup on `material_group` and route both mutating paths through it. Same lock mode on both sides (WRITE) → strict mutual exclusion:

- `MaterialGroupService.delete(id)` locks the target group **before** reading the child- and product-count guards.
- `InternalProductService.create(request)` locks the referenced group (when `materialGroupId != null`) **before** the `internal_product` INSERT.
- `InternalProductService.update(id, request)` locks the target group when the caller is **reassigning** `materialGroupId` (same check-then-act pattern; scope-consistent root-cause fix).

**Why pessimistic-write on both sides, not shared-read on create + write on delete?**

- Both sides use WRITE → simpler mental model, single lock mode, no lock-upgrade escalation.
- Contention cost: two concurrent CREATE calls against the *same* group serialise briefly. `material_group` is a low-write reference table (created rarely, rarely updated), so the throughput impact is negligible.
- No deadlock risk: each transaction locks at most one `material_group` row, in a single site, before any other write — no ordering ambiguity, no A→B/B→A cycles possible.

### 3.2 Files touched

| File | Change |
|---|---|
| `services/gf-inventory/src/main/java/com/actechx/gf/adapter/repository/catalog/JpaMaterialGroupRepository.java` | Add `findByTenantIdAndIdForUpdate(tenantId, id)` with `@Lock(LockModeType.PESSIMISTIC_WRITE)` + explicit JPQL (mirrors existing naming convention: `JpaInventoryReceiptRepository.findByTenantIdAndIdForUpdate`). |
| `services/gf-inventory/src/main/java/com/actechx/gf/app/service/catalog/MaterialGroupService.java` | `delete(id)` — replace `mustFind(...)` with `repository.findByTenantIdAndIdForUpdate(...)` before guard reads. |
| `services/gf-inventory/src/main/java/com/actechx/gf/app/service/catalog/InternalProductService.java` | `create(request)` — replace `materialGroupRepository.findByTenantIdAndId(...)` with `findByTenantIdAndIdForUpdate(...)` when `materialGroupId != null`. `update(id, request)` — same replacement on the reassignment branch. |
| `services/gf-inventory/src/test/java/com/actechx/gf/app/service/catalog/MaterialGroupServiceTest.java` | Retarget existing `delete_rejectsIfGroupHasChildren` + `delete_rejectsIfGroupHasProducts` stubs to `findByTenantIdAndIdForUpdate`. Add 2 new regression tests (see §3.3). |
| `services/gf-inventory/src/test/java/com/actechx/gf/app/service/catalog/InternalProductServiceTest.java` | Retarget existing `create_rejectsWhenMaterialGroupInactive` stub to `findByTenantIdAndIdForUpdate`. Add 1 new regression test (see §3.3). |

No entity schema changes. No Flyway migration (service runs `ddl-auto: update`; `@Lock` is purely a JPA-level attribute → SQL runtime hint, no DDL side-effect).

### 3.3 Regression tests (all FAIL pre-fix, PASS post-fix)

| Test | Purpose |
|---|---|
| `MaterialGroupServiceTest.delete_acquiresPessimisticLockBeforeGuardChecks_bugW03_119` | Behavioural — via Mockito `InOrder`: lock query fires FIRST, then guard reads, then delete. Also asserts plain `findByTenantIdAndId` is never used in delete path (pre-fix code path). |
| `MaterialGroupServiceTest.delete_returnsNotFoundWhenLockedGroupMissing_bugW03_119` | Ensures the lock query drives the NOT_FOUND path — a concurrent delete that already committed will surface as `ERR-CMN-not-found` on the second attempt (Case A of verify.md §4.3). |
| `InternalProductServiceTest.create_acquiresPessimisticLockOnMaterialGroup_bugW03_119` | Behavioural — `materialGroupRepository.findByTenantIdAndIdForUpdate` fires BEFORE `internal_product` insert. Plain `findByTenantIdAndId` is never used to validate the group in create(). |

Existing tests updated (mock retargeting only — no assertion logic changes):
- `MaterialGroupServiceTest.delete_rejectsIfGroupHasChildren` → stub `findByTenantIdAndIdForUpdate`.
- `MaterialGroupServiceTest.delete_rejectsIfGroupHasProducts` → same.
- `InternalProductServiceTest.create_rejectsWhenMaterialGroupInactive` → same.

---

## 4. Race semantics after fix (verify.md §4.3 cases)

- **Case A — DELETE wins**: T_delete acquires `FOR UPDATE` on group row → checks children=0, products=0 → deletes → COMMIT (row gone). T_create then acquires the (now nonexistent) lock query → `Optional.empty()` → throws `ERR-INV-005` / `GROUP_CODE_INVALID` ("Material group không tồn tại trong tenant"). Ground truth: `(0 product, 0 group)`.
- **Case B — CREATE wins**: T_create acquires `FOR UPDATE` on group row → validates ACTIVE → inserts product → COMMIT. T_delete then acquires lock → reads product count=1 → throws `GROUP_HAS_PRODUCTS` (`ERR-INV-004`). Ground truth: `(1 product, 1 group)`.

Either path guarantees exactly one of the two requests succeeds and the invariant "no orphan product references a deleted group" holds at commit time.

---

## 5. Blast radius

- **In-scope**: `MaterialGroupService.delete()`, `InternalProductService.create()`, `InternalProductService.update()` reassign path. All three now serialise on `material_group` row via `FOR UPDATE`.
- **Contention risk**: Two concurrent CREATEs against the same `materialGroupId` will serialise on the group row (short critical section — validate + insert `internal_product`). Acceptable: `material_group` is a low-write reference; catalogue creation is not a hot-path burst workload.
- **Deadlock**: Impossible by design — each transaction acquires at most one `material_group` row lock, in one site, before other writes. No lock-order graph → no cycles.
- **Not addressed** (out of scope for this bug, filed separately):
  - `BUG-W03-129` (delete parent still has child) — same anti-pattern at `MaterialGroupService.delete()` guards (child count) and `MaterialGroupService.create()` parent validation (line ~163). The lock on the target row protects the child side of the DELETE, but the CREATE side reading the *parent* still uses plain `findByTenantIdAndId`. Full fix requires locking the parent row in `create(parentId)` similarly — that is BUG-W03-129's fix scope.
  - Bulk import path (`InternalProductImportService`) — if it uses the same `materialGroupRepository.findByTenantIdAndId` for validation, it retains the race. Not in scope of this bug; check follow-up.

---

## 6. Verification

- `./gradlew build` PASS (checkstyle + compile + tests + spotless). See build tail 2026-07-03.
- Targeted `MaterialGroupServiceTest` + `InternalProductServiceTest` PASS.
- Coverage delta ≥ 0 (3 new tests added, no test deleted).

Awaiting QC end-to-end verify per L2 §4.2:
- 10× `asyncio.gather(delete, create)` race runner against a live gf-inventory container.
- DB ground-truth query after each run must show either `(0 product, 0 group)` or `(1 product, 1 group)` — never `(1 product, 0 group)`.
- Sanity: delete empty group alone → 200. Delete non-empty group → 400 `ERR-INV-004`.

---

## 7. Non-goals / forbidden actions honoured

- No Flyway migration created (service uses `ddl-auto: update`; append-only V*.sql history left untouched).
- No public REST API signature change (endpoints + request/response DTOs unchanged).
- No Kafka event schema change.
- No entity `@Entity` / `@Column` mutation.
- No `@ManyToOne`/`@OneToMany` cross-aggregate added (ADR-009 upheld — the fix is a repository-level query, not a relationship mapping).
- No existing test deleted or logically altered — 3 existing tests received mock retargeting only.
- No `--no-verify` / hook bypass.
- Boundary discipline preserved — all edits in `services/gf-inventory/**`.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-gf-inventory | Initial fix — pessimistic row lock `findByTenantIdAndIdForUpdate` wired into delete + create + update-reassign paths; 3 new regression tests added; existing tests retargeted to lock method. |
