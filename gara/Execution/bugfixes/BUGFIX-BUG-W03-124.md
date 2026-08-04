# BUGFIX-BUG-W03-124 — BFF defense cap ERR-INV-016 cho description material group (>255 chars)

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-124`
> **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-124.verify.md`
> **Feature**: `FEAT-CAT-GRP-CREATE` (+ FEAT-CAT-GRP-EDIT scope side-effect)
> **Boundary**: `agg-garage-graph` (BFF)
> **Severity**: P2
> **Status**: OPEN → IN_PROGRESS → RESOLVED
> **Fixed by**: agent-fix-agg-garage-graph — 2026-07-03

---

## 1. Failure mode (observed)

Web client tạo Nhóm vật tư với `description = 'A'.repeat(256)`:
- **GraphQL response**: `{"success":true, "code":null, "message":"Success", "data":{"id":784,...}}` — thành công.
- **DB side-effect**: nhóm được insert với mô tả 256 ký tự, vi phạm BR-CAT-GRP-012 ("Mô tả tối đa 255 ký tự").
- **Contradiction**: verify §2.3 dẫn BUG-W03-107 (REST direct) đã trả HTTP 400 cho cùng payload — nhưng GraphQL layer trả success.

## 2. Root cause (why-chain)

1. Client (garage-web) gửi mutation `createMaterialGroup(input: {description: <256 chars>})`.
2. BFF resolver `createMaterialGroup` (`catalog-v2.resolver.ts`) forward thẳng input qua `catalogV2Service.createMaterialGroup` → `gfInventoryService.post("/api/v2/material-groups", ...)`.
3. Backend `gf-inventory` `MaterialGroupService.create` KHÔNG enforce `@Size(max=255)` trên field `description` — tracked ở **BUG-W03-107** (P3 OPEN, assignee `agent-fix-gf-inventory`). Backend trả HTTP 200 với record đã insert.
4. BFF passthrough đúng discipline → forward success cho FE.
5. FE (garage-web) `MaterialGroupFormDialog` cũng KHÔNG có Zod `.max(255)` + `<Input maxLength={255}>` — bug FE riêng chưa filed nhưng thuộc `agent-fix-garage-web`.

**Kết quả**: KHÔNG có layer nào enforce 255-char cap → user submit thành công, vi phạm data integrity spec.

**Root cause của BFF-share**: BFF chưa có defense-in-depth cap cho description trong khi đã có defense-in-depth cho các cap tương tự (BUG-W03-135: `INTERNAL_PRODUCT_EXPORT_MAX_ROWS=1000` mirror BR-CAT-PROD-024/ERR-INV-045; TREE cap `MATERIAL_GROUP_TREE_MAX_NODES=1000` mirror ERR-INV-027; import cap `INTERNAL_PRODUCT_IMPORT_MAX_ROWS=500` mirror ERR-INV-041).

Pattern chuẩn khi backend rule spec đã có nhưng backend chưa enforce: BFF mirror rule + code từ `ERROR-CODE-REGISTRY` (không invent), throw `bffError()` với message verbatim → FE render qua `INLINE_FIELD` token của registry.

## 3. Fix summary

Áp dụng pattern **defense-in-depth** giống BUG-W03-135 (precedent xác lập 2026-07-03):

**File**: `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.resolver.ts`

- Add hằng số `MATERIAL_GROUP_DESCRIPTION_MAX_LENGTH = 255` với header comment cite BUG-W03-124 + BR-CAT-GRP-012 + BUG-W03-107 dependency.
- Add pre-flight check trong handler `createMaterialGroup`:
  ```typescript
  if (
    typeof input?.description === "string" &&
    input.description.length > MATERIAL_GROUP_DESCRIPTION_MAX_LENGTH
  ) {
    throw bffError(
      "ERR-INV-016",
      "Mô tả vượt quá 255 ký tự",
      { length: input.description.length, max: MATERIAL_GROUP_DESCRIPTION_MAX_LENGTH }
    );
  }
  ```
- Áp cùng defense cho `updateMaterialGroup` (edit path cùng BR-CAT-GRP-012).
- Message + code lấy verbatim từ `Product/error-code/ERROR-CODE-REGISTRY.md` §ERR-INV-016 (`display: INLINE_FIELD`, `http: 400`, `rule: BR-CAT-GRP-012`). BFF KHÔNG invent code hoặc chỉnh sửa message.

**Discipline preserved**:
- Passthrough-first — BFF chỉ mirror backend rule đã spec ra (không invent business logic mới).
- `bffError()` throw `ApiClientError` → `createPassthroughResolver` catch → route qua ErrorResponse union branch của `MaterialGroupResponse` — giống flow BUG-135, giống flow tree cap ERR-INV-027.
- `input.description === null | undefined | ""` → skip defense (pass-through). Chỉ enforce khi có string > 255.

## 4. Blast radius

**GraphQL operations impacted**: 2 mutation
- `createMaterialGroup` — reject 400 ERR-INV-016 nếu `input.description.length > 255`.
- `updateMaterialGroup` — reject 400 ERR-INV-016 nếu `input.description.length > 255`.

**Contract compatibility**: additive-only.
- Schema unchanged (`CreateMaterialGroupInput.description: String`, `UpdateMaterialGroupInput.description: String`).
- New reject case: previously accepted → now rejected với canonical error code. FE nhận thêm 1 nhánh ErrorResponse với `code=ERR-INV-016` (đã có sẵn trong error-code-map + FE registry token INLINE_FIELD). KHÔNG breaking cho happy path (description ≤ 255).

**Regression surface**:
- 3 handler tree defense pattern đã pass regression (ERR-INV-027, ERR-INV-041, ERR-INV-045) — pattern mới BUG-124 dùng cùng `bffError` helper + cùng `error-code-map ERR_INV_HTTP_STATUS`.
- Existing regression `scResolverInventory` (23 ops wired) không đổi.
- Existing regression `scTenantUsersEnrichment` + `scTenantUsersConditionalSkip` không đổi (không đụng description path).

**Downstream services**: KHÔNG impact — BFF từ chối trước khi forward, gf-inventory không nhận request.

## 5. Regression test

**File**: `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.regression.ts`

Thêm scenario `scMaterialGroupDescriptionCap()` (12 assertions) chạy trong `test:catalog-v2-contract`:

| # | Assertion | Purpose |
|---|---|---|
| 1 | create 256 chars → throws `ApiClientError` | Defense fires cho create path |
| 2 | create — code === "ERR-INV-016" | Canonical error code (không invent) |
| 3 | create — statusCode === 400 | HTTP 400 khớp `ERR_INV_HTTP_STATUS` |
| 4 | create — message === "Mô tả vượt quá 255 ký tự" | Verbatim ERROR-CODE-REGISTRY |
| 5 | create — details.length === 256 | Chi tiết vi phạm forward về FE |
| 6 | create — details.max === 255 | Boundary reference forward về FE |
| 7 | create — downstream NOT called | Defense chặn trước POST |
| 8 | update 256 chars → throws `ApiClientError` | Defense fires cho update path |
| 9 | update — code === "ERR-INV-016" | Same canonical code |
| 10 | update — downstream NOT called | Defense chặn trước PUT |
| 11 | boundary 255 chars → forwarded downstream | Exact boundary passes |
| 12 | null/empty description → forwarded downstream | Non-string / empty skip defense |

Run: `npm run test:catalog-v2-contract` → all 12 assertions PASS.

## 6. Verification

| Command | Result |
|---|---|
| `cd bffs/agg-garage-graph && npm run typecheck` | ✅ PASS (0 TS errors) |
| `cd bffs/agg-garage-graph && npm run build` | ✅ PASS (tsc 0 errors) |
| `cd bffs/agg-garage-graph && npm run test:catalog-v2-contract` | ✅ PASS (all 8 scenarios + 12 new assertions) |
| `npx eslint src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.resolver.ts src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.regression.ts` | ✅ 0 errors trên file đã sửa (lint noise 1306 errors baseline trong `dist/` — pre-existing, không do fix này gây ra) |

## 7. Cross-boundary dependencies (still OPEN, not this fix)

BUG-W03-124 chỉ chặn ở tầng BFF (layer 1 defense). Full 3-layer defense yêu cầu:

1. **BE (gf-inventory)** — `BUG-W03-107` (P3 OPEN, `agent-fix-gf-inventory`): `MaterialGroupService.create` cần `@Size(max=255)` trên field `description` và trả canonical `ERR-INV-016` thay vì fallback `IAM_037`. Sau khi BE fix, BFF passthrough sẽ tự-propagate ERR-INV-016 nếu request lách BFF (VD service-to-service call).
2. **FE (garage-web)** — chưa filed bug riêng: `MaterialGroupFormDialog` cần Zod `.max(255, "Mô tả vượt quá 255 ký tự")` + `<Input maxLength={255}>` để catch UX-level trước khi round-trip GraphQL. Owner: `agent-fix-garage-web`.

BFF fix này giải quyết use-case chính (bypass client validation, submit qua console/curl) — server-side integrity đã protect. Bug hiển thị OPEN thời BUG-107 và FE Zod chưa fix vẫn hợp lý cho verify §4.2 step 2 (client-side inline) — nhưng verify §4.2 step 3 (server-side reject) đã pass sau BUG-124 fix này.

## 8. Files changed

- `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.resolver.ts` — +hằng số + 2 pre-flight check trong `createMaterialGroup` + `updateMaterialGroup`.
- `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.regression.ts` — +scenario `scMaterialGroupDescriptionCap` (12 assertions) + wire vào `main()`.
- `Tracking/WAVE03/BUGS.md` — row BUG-W03-124: OPEN → RESOLVED + [FIXED] note.
- `Execution/bugfixes/BUGFIX-BUG-W03-124.md` — this file (L3 fix doc).

## 9. References

- **Business rule**: `BR-CAT-GRP-012` — Mô tả tối đa 255 ký tự.
- **Error code**: `ERR-INV-016` — Product/error-code/ERROR-CODE-REGISTRY.md §468-476 (display INLINE_FIELD, action highlight:mo-ta, http 400).
- **Precedent pattern**: BUG-W03-135 (BFF defense cap `INTERNAL_PRODUCT_EXPORT_MAX_ROWS=1000` mirror ERR-INV-045) — cùng resolver, cùng helper `bffError`, cùng error-code-map.
- **Cross-boundary trackers**: BUG-W03-107 (BE), FE Zod chưa filed.
- **Contract spec**: `Architecture/api/agg-garage-graph-graphql.md` §3d.2 (V2 catalog-v2 24 ops schema).
- **Discipline reference**: `.claude/skills/rules-bff/SKILL.md` §4 PassthroughService — defense cap acceptable khi mirror backend rule + code + message; KHÔNG invent.
