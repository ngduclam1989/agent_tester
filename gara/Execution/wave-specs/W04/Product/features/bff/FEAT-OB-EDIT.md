---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-OB-EDIT.md"
source_version: 5
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-EDIT"
source_feat_sha: "c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19"
generated_at: "2026-07-08T05:40:00Z"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["updateOpeningBalanceLine"]
paired_backend_feats: ["FEAT-OB-EDIT"]
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "29aa42e1a902864edb2449b59fc1f7419dc0ee8a1bca7a79e7bc368d176208bd"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — Execution/wave-specs/W04/_routing/FEAT-FAN-OUT-MAP.yaml chưa tồn tại tại thời điểm gen; pairing lấy từ Context Bundle orchestrator truyền trực tiếp"
  template_sha: "N/A — không có tool tính SHA256 trong phiên author (Read/Write/Edit only)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-EDIT.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-EDIT (BFF): Sửa dòng tồn đầu kỳ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-EDIT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `updateOpeningBalanceLine` (mutation, W04-M3) |
| Cross-tier pair | BE: `FEAT-OB-EDIT` \| Web: — (chưa fan-out riêng wave này) \| Mobile: — (out-of-scope, edit thuộc web) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-EDIT.md`](../../../../../Product/features/FEAT-OB-EDIT.md) |
| Source version | v5 |
| Source SHA | `c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19` |
| Generated at | 2026-07-08T05:40:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần chỉnh sửa một dòng tồn đầu kỳ đã nhập (sản phẩm, kho, số lượng, giá trị, ngày) khi phát hiện sai sót, thay vì phải xóa và import lại toàn bộ. Thao tác sửa phải cascade cập nhật sổ tồn theo ngày (mã+kho+gara) để mọi báo cáo tồn kho/nhập-xuất-tồn phía sau luôn nhất quán. Đây là mắt xích trong luồng thiết lập tồn kho khởi điểm của epic Tồn đầu kỳ — đảm bảo dữ liệu baseline đúng trước khi các phiếu nhập/xuất W05 phát sinh.

## 2. Trách nhiệm BFF (`agg-garage-graph`)

- Expose mutation `updateOpeningBalanceLine(id: Int!, input: UpdateOpeningBalanceLineInput!): OpeningBalanceLineApiResponse!` trong module `gf-inventory/opening-balance` (đã ratified §3g.1/§3g.2 W04-M3, `agg-garage-graph-graphql.md` v7.58).
- Resolver pattern: **passthrough thuần + 2 enrichment field** — `mainUnitName` (batch qua `fetchAllUnits()`, cache TTL 5 phút, reuse mechanism catalog V2) + `createdByName` (Pattern TENANT-USERS qua `ct-saas-tenant`, dùng `enrichObjectWithByNames` cho single-record response). BFF **KHÔNG** thực hiện business validation — mọi guardrail (kỳ đóng, tồn âm, trùng mã+kho, ngày sau phiếu) do `gf-inventory` enforce.
- Downstream: `PUT /api/v2/opening-balances/{id}` trên `gf-inventory` (W04-5) — forward `id` path param + body JSON `{productCode, warehouseId, quantity, value, asOfDate}`. **`mainUnitCode` KHÔNG có trong input** — BE tự derive theo `productCode`.
- DataLoader/batching: **không cần** — mutation single-entity theo `id`, không phải resolver dạng list/N+1.
- Cache strategy: mutation → không cache (`@cacheControl(maxAge: 0, scope: PRIVATE)`). Cache lock-check TTL (30s) sống hoàn toàn ở `gf-inventory` (ADR-021) — BFF stateless, không mirror cache.
- Auth header propagate: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST; feature-flag `Inventory:InventoryV2` gate **resolver-level** — fail-fast HTTP 403 khi flag OFF, trước khi forward request xuống BE (per PKG §2.2.3 CR-20260707-02).

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Mở form & hiển thị dữ liệu hiện tại

#### AC-1 → N/A (FE local UI)

- Mở form sửa từ icon ✏️ trên danh sách là điều hướng FE thuần (route navigation), không phát sinh op BFF riêng. Xem `be/FEAT-OB-EDIT.md` §3 hoặc `fe-web` tier (khi fan-out) cho chi tiết UI.

#### AC-2 → N/A (FE local UI, dùng dữ liệu đã fetch)

- Form prefill dữ liệu hiện tại của dòng OB dùng row-data đã có sẵn từ kết quả `searchOpeningBalances` (W04-Q1, thuộc BFF spec `FEAT-OB-LIST`) khi FE mở danh sách — **không cần một query fetch-by-id riêng** cho FEAT-OB-EDIT. BFF không touch AC này.

### Cluster B — Lưu thay đổi

#### AC-3 → Orchestrate lưu thay đổi dòng OB

- **Khi**: FE gửi mutation `updateOpeningBalanceLine(id, input)` sau khi chủ garage/kế toán nhấn nút "Lưu" trên form sửa (đã pass validate client-side).
- **BFF phải**: forward `id` + `input` xuống BE nguyên vẹn, enrich response với `mainUnitName` + `createdByName` trước khi trả FE.
- **Downstream**: `PUT /api/v2/opening-balances/{id}` (`gf-inventory`, W04-5).
- **Output shape**: `OpeningBalanceLineApiResponse.data` → `OpeningBalanceLine` (`id, productCode, productName, mainUnitCode, mainUnitName, warehouseCode, warehouseName, quantityOnHand, valueOnHand, asOfDate, createdBy, createdByName, createdAt, fileName, fileChecksum`).
- **Failure mode**: mọi lỗi validate/guardrail map theo §4.5; FE nhận qua union `ErrorResponse.code`.
- **Ref**: op `updateOpeningBalanceLine` (§6.1), resolver `src/graphql/modules/gf-inventory/opening-balance/resolvers.ts` (§6.2), paired BE `FEAT-OB-EDIT` §6 (W04-5).

#### AC-4 → N/A (FE local navigation)

- Nút "Huỷ bỏ" quay về danh sách không lưu — điều hướng FE thuần, không gọi mutation. BFF không touch AC này.

### Cluster C — Guardrails (validate khi lưu)

#### AC-5 → Pass-through lỗi kỳ kế toán đã đóng (dual-date check)

- **Khi**: BE trả lỗi vì "Tồn đến ngày" **cũ HOẶC mới** rơi vào kỳ CLOSED (BE tự gọi lock-check `gf-accounting` cho cả 2 ngày, authoritative — theo ADR-021 dual-date check).
- **BFF phải**: forward nguyên vẹn `ERR-INV-024` (HTTP 400) trong `extensions.code`, KHÔNG remap, KHÔNG tự gọi lock-check.
- **Downstream**: cùng endpoint PUT ở trên.
- **Output shape**: `ErrorResponse{code: "ERR-INV-024", message, statusCode: 400}`.
- **Failure mode**: nếu `gf-accounting` unreachable khi BE lock-check → BE trả `503`, BFF forward `HTTP_ERROR 503 ERR-CMN-007` (fail-CLOSED, xem §4.5).
- **Ref**: paired BE `FEAT-OB-EDIT` §4 AC-5, ADR-021.

#### AC-6 → Pass-through lỗi tồn âm point-in-time

- **Khi**: BE cascade `StockLedgerRecomputeService` phát hiện `closing_qty < 0` tại bất kỳ ngày nào từ "Tồn đến ngày" trở đi cho (mã+kho+gara).
- **BFF phải**: forward `ERR-INV-036` verbatim.
- **Downstream**: cùng PUT endpoint (single `@Transactional` phía BE — BFF không retry tự động).
- **Output shape**: `ErrorResponse{code: "ERR-INV-036"}`.
- **Ref**: paired BE `FEAT-OB-EDIT` §4 AC-6, ADR-020.

#### AC-7 → Pass-through lỗi "Tồn đến ngày" sau phiếu

- **Khi**: BE phát hiện `asOfDate` mới ≥ ngày phát sinh sớm nhất của phiếu nhập/xuất đã ghi sổ cho (mã+kho) mới.
- **BFF phải**: forward `ERR-INV-035` verbatim.
- **Downstream**: cùng PUT endpoint.
- **Output shape**: `ErrorResponse{code: "ERR-INV-035"}`.
- **Ref**: paired BE `FEAT-OB-EDIT` §4 AC-7.

#### AC-8 → Pass-through lỗi trùng (mã+kho)

- **Khi**: BE phát hiện (productCode + warehouseId sau sửa) trùng với dòng OB khác đã tồn tại.
- **BFF phải**: forward `ERR-INV-034` verbatim.
- **Downstream**: cùng PUT endpoint.
- **Output shape**: `ErrorResponse{code: "ERR-INV-034"}`.
- **Ref**: paired BE `FEAT-OB-EDIT` §4 AC-8, BR-OB-012.

#### AC-9 → Pass-through lỗi validate trường bắt buộc + giá trị

- **Khi**: BE trả lỗi field-level — sản phẩm ngừng hoạt động (`ERR-INV-010`), thiếu trường (`ERR-INV-017`), ĐVT lệch ĐVT chính (`ERR-INV-019`), kho không tồn tại (`ERR-INV-020`), số lượng ≤ 0 (`ERR-INV-032`), giá trị < 0 (`ERR-INV-033`).
- **BFF phải**: forward mã lỗi verbatim, KHÔNG tạo mã lỗi mới. Riêng required-field ở GraphQL layer (`productCode`, `warehouseId`, `quantity`, `value`, `asOfDate` đều non-null `!` trong SDL) đã được Apollo tự chặn với `BAD_USER_INPUT` trước khi tới resolver.
- **Downstream**: cùng PUT endpoint.
- **Output shape**: `ErrorResponse{code: "ERR-INV-0{10|17|19|20|32|33}"}`.
- **Ref**: paired BE `FEAT-OB-EDIT` §4 AC-9.

### Cluster D — Phân quyền

#### AC-10 → Đảm bảo phân quyền ngang nhau qua auth context

- **Khi**: chủ garage hoặc kế toán gọi mutation `updateOpeningBalanceLine`.
- **BFF phải**: chỉ enforce JWT authenticated + `X-Tenant-Id` khớp tenant JWT — **KHÔNG** có role-based restriction bổ sung riêng cho op này (2 persona quyền ngang nhau per BR-OB-CMN-002).
- **Downstream**: forward JWT nguyên vẹn xuống `gf-inventory`.
- **Output shape**: không ảnh hưởng response shape.
- **Failure mode**: `UNAUTHENTICATED_ERROR` (401) / `FORBIDDEN_ERROR` (403) nếu thiếu JWT hoặc tenant mismatch.
- **Ref**: §4.1 Auth header propagation, paired BE `FEAT-OB-EDIT` §4 AC-10, BR-OB-CMN-002.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver trong module `opening-balance` propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST `gf-inventory`.
- JWT verify per request (production); dev/local có thể bypass theo profile.
- Feature-flag `Inventory:InventoryV2` gate resolver-level trước forward — fail-fast 403 khi OFF (không leak thông tin downstream khi flag tắt).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Không cần DataLoader — `updateOpeningBalanceLine` là mutation single-entity theo `id`, không phải resolver list.
- 2 enrichment call (`fetchAllUnits()` + `ct-saas-tenant tenant-users/search/basic`) đều single-record scope (`enrichObjectWithByNames`), không fan-out per-row.
- Không persisted-query whitelist bắt buộc ở DESIGN wave này (xem §6.5).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / payment token trong resolver hoặc log enrichment call.
- Tenant scope lấy từ `X-Tenant-Id` header (JWT-derived) — **không** dùng argument client-controlled để filter tenant.
- `createdByName` chỉ hiển thị tên nhân viên nội bộ tenant hiện tại (ct-saas-tenant scope theo `tenantId` JWT) — không leak cross-tenant.

### 4.4 Contract stability

- Schema additive only kể từ v7.57 (baseline hiện tại). Lịch sử: v7.57 đã rename `UpdateOpeningBalanceLineInput.warehouseCode: String!` → `warehouseId: Int!` — breaking change tại thời điểm DESIGN (chưa có FE production consumer nên an toàn); từ nay trở đi field rename phải qua `@deprecated(reason: "...")` giữ field cũ, KHÔNG rename trực tiếp.
- Breaking change (sau baseline v7.57) → bắt buộc CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | HTTP | Source AC |
|---|---|---:|---|
| `NOT_FOUND` (id không tồn tại/đã xóa) | `ERR-CMN-not-found` | 404 | AC-2 (EC-7) |
| Kỳ kế toán đã đóng (ngày cũ hoặc mới) | `ERR-INV-024` | 400 | AC-5 |
| (mã+kho) sau sửa trùng dòng khác | `ERR-INV-034` | 400 | AC-8 |
| `asOfDate` ≥ ngày phát sinh phiếu (mã+kho) | `ERR-INV-035` | 400 | AC-7 |
| Cascade tồn âm point-in-time | `ERR-INV-036` | 400 | AC-6 |
| Sản phẩm ngừng hoạt động | `ERR-INV-010` | 400 | AC-9 |
| Thiếu trường bắt buộc | `ERR-INV-017` | 400 | AC-9 |
| ĐVT lệch ĐVT chính | `ERR-INV-019` | 400 | AC-9 |
| Kho không tồn tại | `ERR-INV-020` | 400 | AC-9 |
| Số lượng tồn ≤ 0 | `ERR-INV-032` | 400 | AC-9 |
| Giá trị tồn < 0 | `ERR-INV-033` | 400 | AC-9 |
| `gf-accounting` lock-check unreachable (fail-CLOSED commit path) | `ERR-CMN-007` | 503 | AC-5 (nhánh unavailable) |
| Thiếu/sai JWT hoặc tenant mismatch | `UNAUTHENTICATED_ERROR` / `FORBIDDEN_ERROR` | 401 / 403 | AC-10 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> SDL đã ratified tại `Architecture/api/agg-garage-graph-graphql.md` §3g.1 (v7.58) — dev implement đúng contract này, không tự phát sinh field mới.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `UpdateOpeningBalanceLineInput` | input | `productCode: String!`, `warehouseId: Int!`, `quantity: Float!`, `value: Float!`, `asOfDate: String!` | NO (new; `warehouseId` là rename design-time từ `warehouseCode` — an toàn vì chưa DEV) | AC-3, AC-5..AC-9 |

### 5.2 Modified types (additive — backward-compat)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| — | — | — | — | (Không có modify — `OpeningBalanceLine` type dùng chung với `searchOpeningBalances`, đã định nghĩa ở `FEAT-OB-LIST` BFF spec, không đổi thêm cho FEAT-OB-EDIT.) |

> **Breaking changes** → REJECT (BFF schema additive only) kể từ baseline v7.57. Deprecate field → `@deprecated(reason: "...")`, không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `updateOpeningBalanceLine` | mutation | `id: Int!`, `input: UpdateOpeningBalanceLineInput!` | `OpeningBalanceLineApiResponse!` | JWT authenticated + `X-Tenant-Id` | AC-3, AC-5..AC-10 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `updateOpeningBalanceLine` | `src/graphql/modules/gf-inventory/opening-balance/resolvers.ts` | `FEAT-OB-EDIT` (BE §6, W04-5) | `PUT /api/v2/opening-balances/{id}` | — (single-entity, không cần DataLoader) | AC-3 |

### 6.3 DataLoader / batching strategy

**N/A** — `updateOpeningBalanceLine` là mutation single-entity theo `id`, không có resolver dạng list cần batch N+1 guard. 2 enrichment field (`mainUnitName`, `createdByName`) dùng single-record helper `enrichObjectWithByNames` / `fetchAllUnits()` lookup — không phải DataLoader pattern.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `updateOpeningBalanceLine` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache; FE tự refetch `searchOpeningBalances` sau khi save thành công |

### 6.5 Persisted query allowlist (nếu enable)

**N/A** — module `opening-balance` chưa bật persisted query allowlist trong DESIGN wave W04 (ad-hoc query cho phép, đồng nhất với các module W04 khác — `accounting-period`, `catalog-v2`).

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/graphql/modules/gf-inventory/opening-balance/schema.graphql` | ADDITIVE (module scaffold shared với FEAT-OB-LIST/IMPORT/DELETE-LINES; FEAT-OB-EDIT thêm `UpdateOpeningBalanceLineInput` + mutation SDL) | extend SDL | ~15 | AC-3 |
| `resolvers/` | `src/graphql/modules/gf-inventory/opening-balance/resolvers.ts` | ADDITIVE (thêm 1 resolver `updateOpeningBalanceLine` vào file module dùng chung) | resolver pattern | ~50 | AC-3, AC-5..AC-10 |
| `data-sources/` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE (thêm method `updateOpeningBalanceLine(tenantId, id, input)`) | new method | ~20 | AC-3 |
| `error-map/` | `src/graphql/modules/gf-inventory/opening-balance/error-map.ts` | ADDITIVE (map `ERR-INV-024/034/035/036/010/017/019/020/032/033` + `ERR-CMN-not-found` + `ERR-CMN-007`) | error-code-map module reuse | ~10 | AC-5..AC-9 |
| `auth/` | `src/graphql/modules/gf-inventory/opening-balance/featureFlagGuard.ts` | ADDITIVE (nếu chưa có sẵn từ FEAT-OB-LIST — `@FeatureOn("Inventory:InventoryV2")` resolver-level guard) | guard pattern (shared) | ~15 | AC-10 |
| `tests/integration` | `tests/integration/gf-inventory/opening-balance.test.ts` | ADDITIVE (thêm test case `updateOpeningBalanceLine` vào file module dùng chung) | apollo test client | ~60 | AC-3, AC-5..AC-9 |
| `tests/contract` | `tests/contract/gf-inventory/opening-balance-contract.test.ts` | ADDITIVE | schema contract | ~25 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE/Mobile (khi fan-out).

```
(← BE tier S4: integration green — FEAT-OB-EDIT gf-inventory W04-5)

S5  BFF schema + resolver wire
    Entry: BE FEAT-OB-EDIT §6 (PUT /api/v2/opening-balances/{id}) stable
    Exit: BFF contract test green (updateOpeningBalanceLine schema + error map)
    └─► (hand-off FE Web S6 khi fan-out riêng — hiện tại chưa pair wave này)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver `updateOpeningBalanceLine` | schema + resolvers + data-sources + error-map | BE FEAT-OB-EDIT §6 stable (W04-5) | BFF contract test green | BE FEAT-OB-EDIT S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE `gf-inventory` territory — kỳ đóng, tồn âm, trùng mã+kho, ngày sau phiếu). BFF chỉ enforce:
> - Auth context (JWT authenticated, tenant match)
> - Feature-flag gate resolver-level
> - Schema-level constraint (required field non-null theo SDL)

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-CMN-002` | NORMAL | JWT auth guard (không phân biệt role) | `src/graphql/modules/gf-inventory/opening-balance/resolvers.ts` | AC-10 | garage-owner + accountant quyền ngang nhau — không có role check bổ sung |
| (feature-flag policy, không phải BR-ID) | — | Resolver-level `@FeatureOn("Inventory:InventoryV2")` fail-fast 403 | `src/graphql/modules/gf-inventory/opening-balance/featureFlagGuard.ts` | (all AC) | CR-20260707-02 — kill-switch semantic, default ON |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-OB-EDIT.md §9` (BR-OB-012/013/015/016 — kỳ đóng, tồn âm, trùng mã+kho, ngày sau phiếu) — file chưa được tạo tại thời điểm author BFF spec này; xem PKG §2.2.2 REST endpoint W04-5 cho reference tạm thời.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-3 | BFF contract (schema, cache hint) | test-api | snapshot SDL `UpdateOpeningBalanceLineInput` + mutation response shape |
| AC-3 | BFF integration (resolver → BE) | test-api | mock downstream `PUT /api/v2/opening-balances/{id}`, verify request body shape + header propagation |
| AC-5..AC-9 | BFF error-map (pass-through verbatim) | test-api | assert `extensions.code` khớp verbatim BE error code, không remap sai |
| AC-10 | BFF auth (JWT + tenant, không role-restrict) | test-isolation | dual persona (garage-owner, accountant) cùng gọi op thành công như nhau |
| — | Feature-flag gate | test-api | flag OFF → resolver trả 403 trước khi forward BE |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-EDIT.md` | chưa tạo (N/A tại thời điểm author spec này) | Downstream REST `PUT /api/v2/opening-balances/{id}` (W04-5) — BFF resolver wrap |
| FE Web | — | N/A (chưa fan-out riêng wave này) | Context Bundle orchestrator chỉ định `paired_fe_web_feats: []` cho spawn này. **NEED CONFIRMATION**: PKG-W04 §2.2.4 vẫn liệt kê route web `EditLinePage` cho OB — có thể fan-out ở spawn khác hoặc gộp trong `FEAT-OB-LIST` fe-web tier spec; đối chiếu `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` §2.2.4 khi fan-out fe-web thực hiện. |
| Mobile | — | N/A (out-of-scope) | Per PKG §5.1 "8 FEAT còn lại web-only" — mobile chỉ xem OB read-only (`FEAT-OB-LIST`), KHÔNG có màn edit mobile. |

**Source ID consistency** (item 18): `source_feat_sha` = `c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19` — phải identical với BE (và fe-web/mobile khi fan-out sau).

## 12. References

- **Source**: [`Product/features/FEAT-OB-EDIT.md`](../../../../../Product/features/FEAT-OB-EDIT.md) v5
- **Paired BE**: [`features/be/FEAT-OB-EDIT.md`](../be/FEAT-OB-EDIT.md) (chưa tạo)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index (W04) → §3g Opening Balance (v7.58)
- **BE REST contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3b.2 W04-5
- **ADR**: ADR-009 (JPA no-relationship), ADR-020 (stock ledger point-in-time), ADR-021 (lock-check REST advisory dual-date), ADR-022 (OB import all-or-nothing pattern, applicable field pattern)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: `_routing/FEAT-FAN-OUT-MAP.yaml` (chưa tồn tại tại thời điểm gen — pairing lấy từ Context Bundle orchestrator)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-OB-EDIT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough + 2 enrichment `mainUnitName`/`createdByName`), §3 BFF behaviour map 10/10 AC-ID (AC-1/2/4 N/A — FE local UI/navigation), §4 auth + perf + security + contract stability + error mapping (11 mã lỗi + auth), §5-§11 BFF-specific (SDL `UpdateOpeningBalanceLineInput` v7.57, GraphQL op `updateOpeningBalanceLine` W04-M3, resolver/data-source/error-map file impact, cross-tier pair BE only — fe-web/mobile chưa fan-out, flagged NEED CONFIRMATION). Nguồn: bundle `/tmp/exec-spec-bundles/W04/FEAT-OB-EDIT.bff.md` + bounded-read `agg-garage-graph-graphql.md` §0 Wave Index → §3g (v7.57, per FM-020 policy vì bundle §G tier-scoped extract không match keyword "Edit") + `PKG-W04-inventory-period-opening-balance.md` §2.2.2 (W04-5 REST endpoint + error codes) + source FEAT-OB-EDIT.md v5 (AC/BR/error-code cross-check). |
| 2026-07-08 | 3 | Delivery Authority | **W04 BFF↔Arch alignment audit — version cite bump** (per plan `t-i-li-u-trong-home-engineer-ac-projects-graceful-stallman.md` Bước 2). §2 + §5 + §12 References bump cite `agg-garage-graph-graphql.md v7.57 → v7.58` (cosmetic §0 Wave Index cascade, no SDL/behavior change). §4.5 flag-gate discipline (BFF resolver-level `@FeatureOn(Inventory:InventoryV2)`) không đổi — file này đã đúng stance từ v1, dùng làm reference cho cascade sang FEAT-OB-LIST + FEAT-OB-DELETE-LINES. Gap version 2 (skipped). |
