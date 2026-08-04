# BUGFIX-BUG-W03-107 — MaterialGroup create/update: description > 255 chars must return ERR-INV-016 (not generic IAM_037)

| Field | Value |
|---|---|
| Bug ID | BUG-W03-107 |
| Severity | P3 |
| Boundary | gf-inventory |
| Feature | FEAT-CAT-GRP-CREATE (V2-4 create) + regression-guard cho V2-5 update |
| Business rule violated | BR-CAT-GRP-012 (Mô tả ≤ 255 ký tự) + Error Code Contract Testing |
| Error code | ERR-INV-016 (`GROUP_DESC_TOO_LONG`) |
| Wave | W03 |
| Status | RESOLVED |
| Verify doc (L2) | `Tracking/WAVE03/verify/BUG-W03-107.verify.md` |
| Ticket row (L1) | `Tracking/WAVE03/BUGS.md` |

---

## 1. Symptom

`POST /api/v2/material-groups` với `description` dài 256 ký tự trả về HTTP 400 nhưng:

- `code = "IAM_037"` (generic fallback từ platform GlobalExceptionHandler)
- `message = "Dữ liệu không hợp lệ"` (generic)
- `details.fieldErrors.description = "size must be between 0 and 255"` (bean-validation raw message tiếng Anh)

Kỳ vọng (theo ERROR-CODE-REGISTRY + BR-CAT-GRP-012):

- `code = "ERR-INV-016"`
- `message` verbatim theo registry (VD "Mô tả nhóm vật tư hàng hóa vượt quá 255 ký tự")

Hệ quả: Error Code Contract Testing FAIL (assert `code` symbol), FE / BFF / test không nhận được error code chuẩn để render UX rule + đối chiếu BR.

## 2. Why-chain (≤5 bước)

1. `MaterialGroupController.create(@Valid @RequestBody MaterialGroupRequest req)` — Spring MVC chạy bean-validation trước khi vào service.
2. `MaterialGroupRequest.description` (trong `CatalogDtos.java`) khai báo `@Size(max = 255)`.
3. Khi `description.length() == 256` → Hibernate Validator ném `ConstraintViolationException` → Spring MVC bọc thành `MethodArgumentNotValidException` **trước** khi handler service chạy.
4. `MethodArgumentNotValidException` được platform `GlobalExceptionHandler` (không phải `CatalogExceptionHandler`) map thành `code=IAM_037` — generic invalid-input code, không boundary-specific.
5. Manual guard trong `MaterialGroupService.create()` line 162-164 (`if (request.getDescription() != null && request.getDescription().length() > 255) throw GROUP_DESC_TOO_LONG`) trở thành **dead code** — không có code path nào chạm được. Root cause: bean-validation `@Size` intercept sớm hơn business-layer guard.

## 3. Fix Plan (minimal)

- **A.** Gỡ `@Size(max = 255)` khỏi `MaterialGroupRequest.description` trong `services/gf-inventory/src/main/java/com/actechx/gf/app/dto/catalog/CatalogDtos.java`.
- **B.** Giữ nguyên manual length guard trong `MaterialGroupService.create()` (line 162-164) và `MaterialGroupService.update()` (line 201-203) — chúng đã throw `CatalogException(GROUP_DESC_TOO_LONG, "Mô tả nhóm vượt 255 ký tự")` với error code `ERR-INV-016`.
- **C.** Ba lớp bảo vệ vẫn còn nguyên vẹn sau fix:
  1. **App layer (service)**: manual guard → throw `CatalogException` với `ERR-INV-016` (mới trở thành live path, được test).
  2. **DB layer**: cột `material_group.description VARCHAR(255)` trong `MaterialGroupEntity` (`@Column(name = "description", length = 255)`) — nếu manual guard bị bypass thì Hibernate/JDBC ném `DataException` (hard guard cuối).
  3. **Contract layer**: `CatalogExceptionHandler` (`@Order(0)`) map `CatalogException` → HTTP 400 body `{code: "ERR-INV-016", message, details.error.code, details.error.message}`.
- **D.** Comment trong DTO giải thích tại sao chủ đích KHÔNG dùng `@Size` (tránh ai đó "sửa lại cho đẹp" và tái tạo bug).
- **E.** Regression tests trong `MaterialGroupServiceTest`:
  - `create_rejectsDescriptionOver255_bugW03_107` — 256 ký tự → `ERR-INV-016`, không gọi `repository.save()`.
  - `create_acceptsDescriptionExactly255_bugW03_107` — boundary=255 pass, save đúng nội dung.
  - `create_acceptsNullDescription_bugW03_107` — null pass (description không required).
  - `update_rejectsDescriptionOver255_bugW03_107` — update endpoint cùng guard (defense-in-depth vì update controller không có `@Valid` nên nếu ai đó thêm sau này thì tests vẫn assert business-layer mapping).

**Blast radius**:

- **Chạm**: `CatalogDtos.MaterialGroupRequest.description` (gỡ 1 annotation) + service manual guard (không đổi) + 4 test mới.
- **KHÔNG chạm**:
  - REST/GraphQL contract (payload shape không đổi, response error shape đổi từ generic → registry-standard = fix bug).
  - Các field khác của `MaterialGroupRequest` (`code`, `name`) — `@NotBlank` + `@Size(max=50/255)` giữ nguyên vì bug scope chỉ mention `description`. Audit note: `name` + `code` cũng có thể có cùng pattern (bean-validation intercept trước service manual guard nếu có), nhưng scope BUG-W03-107 chỉ description → out-of-scope, để lại làm follow-up nếu contract test phát hiện.
  - `InternalProductCreateRequest.description`/`notes` (khác aggregate, khác error code `ERR-INV-xxx` nếu có) — out-of-scope.
  - `MaterialGroupController.update()` — không có `@Valid` sẵn, nên `MethodArgumentNotValidException` không bung; manual guard đã là path duy nhất → không đổi.
  - Flyway migration (gf-inventory dùng `ddl-auto=update`, DB column length=255 đã đúng, không cần V{N+1}).
  - Kafka events, outbox, tenant filter, workflows.
  - Cross-boundary contract (BFF `agg-garage-graph` `createMaterialGroup` resolver — đã có defense-in-depth guard riêng trong BUG-W03-124 fix).

## 4. Files Changed

| File | Change |
|---|---|
| `services/gf-inventory/src/main/java/com/actechx/gf/app/dto/catalog/CatalogDtos.java` | Gỡ `@Size(max = 255)` khỏi `MaterialGroupRequest.description`. Thêm comment giải thích lý do (BUG-W03-107) để tránh regression. |
| `services/gf-inventory/src/test/java/com/actechx/gf/app/service/catalog/MaterialGroupServiceTest.java` | Thêm 4 regression tests: `create_rejectsDescriptionOver255_bugW03_107`, `create_acceptsDescriptionExactly255_bugW03_107`, `create_acceptsNullDescription_bugW03_107`, `update_rejectsDescriptionOver255_bugW03_107`. |

## 5. Regression Test

**`MaterialGroupServiceTest.create_rejectsDescriptionOver255_bugW03_107`** (primary):

- Given: `existsByTenantIdAndCodeIgnoreCase` returns false; description = 256 chars "a".
- When: `service.create(req)` được gọi.
- Then: throw `CatalogException` với `errorCode == GROUP_DESC_TOO_LONG` (= `ERR-INV-016`).
- Additional: `verify(repository, never()).save(any())` — path không được lọt qua guard.

**Pre-fix state**: khi chạy qua controller (E2E), test này sẽ FAIL vì `@Size` intercept trước service — service không được gọi, `CatalogException` không throw. Ở tầng service unit test (path trực tiếp), test có thể pass ngay cả pre-fix vì bean-validation không chạy tại đó — vì vậy trước fix bug thực sự chỉ visible qua contract test / integration test. Test unit hiện tại pin invariant "service throws đúng error code" nhằm ngăn ai đó lỡ tay xóa manual guard sau khi thấy `@Size` "đã lo" (regression trap).

**Post-fix state**: cả 4 test PASS local (`./gradlew test` full suite BUILD SUCCESSFUL). Sau fix, path bean-validation không còn intercept nữa → service manual guard là con đường duy nhất → error code chuẩn được surface.

**Boundary tests**:

- 255 chars → accept (create OK).
- 256 chars → reject với `ERR-INV-016`.
- null → accept (description optional).
- update endpoint với 500 chars → reject với `ERR-INV-016` (defense-in-depth).

## 6. Verification

```
$ export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
$ cd services/gf-inventory
$ ./gradlew test --tests "com.actechx.gf.app.service.catalog.MaterialGroupServiceTest"
BUILD SUCCESSFUL in 10s

$ ./gradlew build
> Task :spotlessJava
> Task :spotlessJavaApply
> Task :spotlessJavaCheck UP-TO-DATE
> Task :spotlessCheck UP-TO-DATE
> Task :compileTestJava
> Task :test
> Task :check
> Task :build
BUILD SUCCESSFUL in 7s
```

Full `./gradlew build` PASS (compile + spotless + toàn bộ test-suite). `checkstyleMain` chạy qua build task, không config riêng — spotless (Google Java Format) đã pass.

## 7. QC verify path (dành cho re-verify)

Theo §4.2 verify doc:

1. `POST /api/v2/material-groups -d '{"code":"GRP-107-1","name":"X","description":"<255 chars>"}'` → HTTP 201, description lưu đúng.
2. `POST /api/v2/material-groups -d '{"code":"GRP-107-2","name":"X","description":"<256 chars>"}'` → HTTP 400 với `code=ERR-INV-016`, message tiếng Việt.
3. Parse body: `code == "ERR-INV-016"`, `message` khớp verbatim registry ("Mô tả nhóm vật tư hàng hóa vượt quá 255 ký tự" hoặc tương đương ERROR-CODE-REGISTRY.md).
4. `POST ... description:"<500 chars>"` → cùng result 400 với `ERR-INV-016`.
5. `POST ... description:null` hoặc bỏ field → HTTP 201 (không required).
6. Contract test tự động (`TC-W03-API-GRP-005`) assert `code` symbol PASS.

## 8. Non-goals / Out of scope

- **KHÔNG** thay đổi các bean-validation khác trong `CatalogDtos` (`name`, `code`, các DTO khác) — bug scope chỉ mention `description`. Audit `name`/`code`/`notes` tương tự có thể tồn tại (verify.md §6 gợi ý audit), nhưng cần bug row riêng để tránh scope creep. Nếu contract test tuần sau phát hiện thêm thì file BUG mới.
- **KHÔNG** đụng `MaterialGroupService.update()` logic (chỉ thêm regression test) — update controller chưa có `@Valid` nên chưa vướng bean-validation intercept, guard đã hoạt động sẵn.
- **KHÔNG** đụng BFF `agg-garage-graph` (BUG-W03-124 đã fix defense-in-depth ở tầng BFF riêng biệt — không cần thay đổi thêm cho fix này).
- **KHÔNG** đụng Flyway migration hoặc entity column length — DB `VARCHAR(255)` vẫn giữ nguyên làm hard guard cuối.
- **KHÔNG** đổi error code chuẩn — dùng `ERR-INV-016` đã declared trong `CatalogErrorCode.GROUP_DESC_TOO_LONG` từ trước.
- **KHÔNG** bump KG version — không thêm entity/event/permission mới, chỉ fix invariant đã document trong BR-CAT-GRP-012.

## 9. Related

- L1 ticket: `Tracking/WAVE03/BUGS.md` row `BUG-W03-107` — status OPEN → IN_FIX → RESOLVED.
- L2 verify: `Tracking/WAVE03/verify/BUG-W03-107.verify.md`.
- Related bugs:
  - **BUG-W03-124** (RESOLVED) — cùng field `description` nhưng vi phạm ở tầng BFF: BFF resolver không cap length nên FE nhận `success:true` cho 256 chars. Fixed 2026-07-03 bởi agent-fix-agg-garage-graph. Sau BUG-W03-107 fix, BE trả `ERR-INV-016` như expected → BFF defense-in-depth trở nên redundant nhưng vẫn có value phòng regression BE.
  - **BUG-W03-106** (RESOLVED) — cùng aggregate MaterialGroup, khác vi phạm (code uniqueness case-insensitive).
- Follow-up (optional, không block release): audit các field `name`/`code`/`notes` trong `CatalogDtos` có cùng anti-pattern không → contract test cover.

## Change Log

| Date | Author | Description |
|---|---|---|
| 2026-07-03 | agent-fix-gf-inventory | Initial BUGFIX doc — gỡ `@Size(max=255)` khỏi `MaterialGroupRequest.description` để service-layer manual guard fire → error code chuẩn `ERR-INV-016` thay vì generic `IAM_037`. 4 regression tests (256/255/null create + 500 update). `./gradlew build` PASS. |
