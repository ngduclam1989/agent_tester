# BUGFIX-BUG-W03-106 — MaterialGroup create: case-insensitive code uniqueness

| Field | Value |
|---|---|
| Bug ID | BUG-W03-106 |
| Severity | P2 |
| Boundary | gf-inventory |
| Feature | FEAT-CAT-GRP-CREATE |
| Business rule violated | BR-CAT-GRP-003 (Mã nhóm VTHH unique case-insensitive trong tenant) |
| Error code | ERR-INV-002 (`GROUP_CODE_DUPLICATE`) |
| Wave | W03 |
| Status | RESOLVED |
| Verify doc (L2) | `Tracking/WAVE03/verify/BUG-W03-106.verify.md` |
| Ticket row (L1) | `Tracking/WAVE03/BUGS.md` |

---

## 1. Symptom

Tạo nhóm vật tư (`POST /api/v2/material-groups`) với mã `REPRO106-1` thành công, tiếp theo tạo với mã `repro106-1` (chỉ khác hoa/thường) trả HTTP 201 thay vì bị chặn bằng HTTP 400 `code=ERR-INV-002`. Kết quả: cùng tenant tồn tại 2 record mã trùng theo nghĩa case-insensitive — vi phạm BR-CAT-GRP-003.

## 2. Why-chain (≤5 bước)

1. Controller `MaterialGroupController.create` gọi `MaterialGroupService.create(request)`.
2. `create()` kiểm tra tồn tại bằng `repository.existsByTenantIdAndCode(tenantId, code)` (`MaterialGroupService.java:156`, pre-fix).
3. `existsByTenantIdAndCode` là Spring Data derived method → sinh SQL `WHERE tenant_id = ? AND code = ?` với so sánh **case-sensitive** theo mặc định collation của PostgreSQL cột `code`.
4. `code = 'GRP001'` không khớp `'grp001'` → `existsByTenantIdAndCode` trả `false` → service cho phép save.
5. BR-CAT-GRP-003 yêu cầu uniqueness case-insensitive — chưa được enforce ở tầng application, cũng không có functional unique index (`ddl-auto=update` không tự sinh index này). Root cause: existence check case-sensitive.

## 3. Fix Plan (minimal)

- **A.** Thêm method mới `existsByTenantIdAndCodeIgnoreCase` trong `JpaMaterialGroupRepository` dùng JPQL `LOWER(g.code) = LOWER(:code)` — tránh clash với derived method Spring Data (không dùng `IgnoreCase` keyword để không phụ thuộc property naming, dùng `@Query` tường minh).
- **B.** `MaterialGroupService.create()` gọi method mới thay `existsByTenantIdAndCode`. Giữ nguyên casing người dùng nhập khi save (`REPRO106-1` được lưu nguyên, không normalize UPPER/LOWER → tránh breaking data cũ + hiển thị đúng label người dùng đã tạo).
- **C.** Regression test `MaterialGroupServiceTest.create_rejectsCaseInsensitiveDuplicate_bugW03_106` — 2 variant (lowercase, mixed case) cùng va chạm existing `GRP001` → `ERR-INV-002`. Test cũng `verify(never())` gọi vào derived method cũ để chốt path.
- **D.** Cập nhật existing tests dùng `existsByTenantIdAndCode` sang method mới (không đổi assertion — chỉ đổi stub target).

**Blast radius**: chỉ tầng service+repo của `MaterialGroup` (V2-4 create). KHÔNG chạm:
- V2-5 update (BR-CAT-GRP-004 `code` immutable — `.equals()` giữ nguyên case-sensitive vì bất kỳ case-change nào cũng bị chặn bởi immutability guard `GROUP_CODE_INVALID`).
- V2-6 delete, V2-1 search, V2-2 tree, V2-3 detail (unchanged).
- Migration Flyway (`spring.flyway.enabled=false` trong gf-inventory — schema qua `ddl-auto=update`, không cần V{N+1}).
- Cross-boundary contract (BFF `agg-garage-graph` gọi cùng endpoint, response shape không đổi).
- Kafka events, outbox, tenant filter, workflows.
- `JpaInternalProductRepository.existsByTenantIdAndCode` (khác aggregate `internal_product`, khác bug — out of scope).

## 4. Files Changed

| File | Change |
|---|---|
| `services/gf-inventory/src/main/java/com/actechx/gf/adapter/repository/catalog/JpaMaterialGroupRepository.java` | Add `existsByTenantIdAndCodeIgnoreCase(tenantId, code)` với `@Query("... LOWER(g.code) = LOWER(:code)")`. Giữ nguyên `existsByTenantIdAndCode` (unused sau fix nhưng không xóa để tránh churn cho contract khác nếu có). |
| `services/gf-inventory/src/main/java/com/actechx/gf/app/service/catalog/MaterialGroupService.java` | `create()` gọi `existsByTenantIdAndCodeIgnoreCase` thay `existsByTenantIdAndCode`. Comment tham chiếu BR-CAT-GRP-003 + BUG-W03-106. |
| `services/gf-inventory/src/test/java/com/actechx/gf/app/service/catalog/MaterialGroupServiceTest.java` | Add `create_rejectsCaseInsensitiveDuplicate_bugW03_106` regression test (2 variants). Update stub target trong `create_rejectsDuplicateCode`, `create_acceptsCodeWithAllWhitelistedChars`, `create_trimsLeadingAndTrailingWhitespaceFromCode`, `create_persistsDefaultActive`. |

## 5. Regression Test

`MaterialGroupServiceTest.create_rejectsCaseInsensitiveDuplicate_bugW03_106`:

- Given: repository reports existing group with same code case-insensitively (`grp001`, `Grp001`).
- When: `service.create(...)` được gọi với 2 variant.
- Then: mỗi variant throw `CatalogException` với error code `GROUP_CODE_DUPLICATE` (=`ERR-INV-002`).
- Additional: `verify(repository, never()).existsByTenantIdAndCode(...)` — đảm bảo path cũ (case-sensitive) không còn được dùng.

**Pre-fix state**: test này **FAIL** — code goes through `existsByTenantIdAndCode` returns false → `save()` được gọi → không throw.
**Post-fix state**: test **PASS** (verified locally, xem §6).

## 6. Verification

```
$ ./gradlew test --tests "com.actechx.gf.app.service.catalog.MaterialGroupServiceTest"
BUILD SUCCESSFUL in 4s

$ ./gradlew build
BUILD SUCCESSFUL in 8s
> Task :spotlessCheck UP-TO-DATE
> Task :test
> Task :check
```

Tất cả test MaterialGroupService PASS (bao gồm regression test mới). Full `./gradlew build` PASS (compile + spotless + test).

## 7. QC verify path (dành cho re-verify)

Theo §4.2 verify doc:

1. Tạo mã `REPRO106-1` — HTTP 201.
2. Tạo mã `repro106-1` — HTTP 400 `code=ERR-INV-002`.
3. Tạo mã `Repro106-1` — HTTP 400 `code=ERR-INV-002`.
4. List → 1 record duy nhất mã `REPRO106-1` (giữ casing người dùng nhập).
5. Tenant khác vẫn tạo được (tenant filter `tenantId = :tenantId` vẫn scope theo tenant).

## 8. Non-goals / Out of scope

- KHÔNG normalize code sang UPPERCASE khi save (giữ casing người dùng — không breaking data cũ + label đúng).
- KHÔNG thêm functional unique index `(tenant_id, LOWER(code))` — `spring.flyway.enabled=false` + `ddl-auto=update` không tự sinh functional index; thay đổi này thuộc scope infra/DDL riêng, không cần cho fix này. App-layer guard là đủ vì tất cả write đi qua `MaterialGroupService`.
- KHÔNG đụng `MaterialGroupService.update()` — BR-CAT-GRP-004 code immutable, casing change tự động bị guard `GROUP_CODE_INVALID` chặn (verify pass criteria "Regression `updateMaterialGroup` không cho đổi thành mã trùng case-insensitive" — đã satisfy qua immutability).
- KHÔNG đụng `JpaInternalProductRepository.existsByTenantIdAndCode` (aggregate khác, bug riêng nếu có).
- KHÔNG bump KG version (không thêm entity/event/permission mới — chỉ fix invariant existing đã document trong BR-CAT-GRP-003).

## 9. Related

- L1 ticket: `Tracking/WAVE03/BUGS.md` row `BUG-W03-106` — status OPEN → RESOLVED.
- L2 verify: `Tracking/WAVE03/verify/BUG-W03-106.verify.md`.
- Related bug: BUG-W03-107 (cùng field `code`, khác vi phạm — description length; out of scope fix này).

## Change Log

| Date | Author | Description |
|---|---|---|
| 2026-07-03 | agent-fix-gf-inventory | Initial BUGFIX doc — case-insensitive uniqueness on MaterialGroup code via `existsByTenantIdAndCodeIgnoreCase` (LOWER-based JPQL). Regression test added. Build + full test suite PASS. |
