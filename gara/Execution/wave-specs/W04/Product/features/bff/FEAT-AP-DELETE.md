---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-AP-DELETE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-DELETE"
source_feat_sha: "7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422"
generated_at: "2026-07-08T05:30:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting"]
modifies: []
change_type: "new-capability"
graphql_ops:
  - "deleteAccountingPeriod"
paired_backend_feats: ["FEAT-AP-DELETE"]
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "29aa42e1a902864edb2449b59fc1f7419dc0ee8a1bca7a79e7bc368d176208bd"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: ""
  template_sha: ""
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-DELETE.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-DELETE (BFF): Xóa kỳ kế toán

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DELETE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `deleteAccountingPeriod` (reuse — đã ratified cùng module `accounting-period` §3e, ADR-019 DESIGN batch) |
| Cross-tier pair | BE: `FEAT-AP-DELETE` \| Web: không có tier riêng (popup xóa nằm trong `fe-web/FEAT-AP-LIST`) \| Mobile: N/A (out-of-scope W04) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-DELETE.md`](../../../../../Product/features/FEAT-AP-DELETE.md) |
| Source version | v4 |
| Source SHA | `7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422` |
| Generated at | 2026-07-08T05:30:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần dọn dẹp danh mục kỳ kế toán bằng cách xóa những kỳ tạo nhầm hoặc không còn dùng tới. Hệ thống chỉ cho xóa khi kỳ chưa đóng, chưa phát sinh dữ liệu kho liên quan và không còn kỳ con — đảm bảo tính toàn vẹn của cây kỳ kế toán (Năm → Quý → Tháng) làm mốc chốt sổ cho toàn bộ nghiệp vụ kho. Đây là 1 trong 5 tính năng CRUD của `EP-INVENTORY-ACCOUNTING-PERIOD`, đứng cùng nhóm với `FEAT-AP-LIST` (nơi thao tác xóa được kích hoạt).

## 2. Trách nhiệm BFF (`agg-garage-graph`)

- Expose lại `Mutation.deleteAccountingPeriod(id: ID!): Boolean!` — operation này đã được ratify DESIGN cùng đợt với `FEAT-AP-CREATE`/`FEAT-AP-LIST`/`FEAT-AP-EDIT` trong module `accounting-period` (§3e SDL, `agg-garage-graph-graphql.md`); FEAT-AP-DELETE **không cần SDL mới**, chỉ cần resolver case + error-mapping cho riêng nhánh xóa.
- Resolver pattern: **passthrough thuần** — không orchestrate nhiều downstream call, không business logic, không transform payload ngoài mapping error code.
- Downstream duy nhất: `DELETE /api/v2/accounting-periods/{id}` trên `gf-accounting` (single-hop, không cross-call sang `gf-sales`/`gf-inventory`).
- Không cần DataLoader/batching — thao tác xóa theo 1 `id` đơn lẻ, không có N+1.
- Không cache mutation (`@cacheControl(maxAge: 0, scope: PRIVATE)`); vì return type `Boolean!` non-nullable nên lỗi trả về qua top-level GraphQL `errors[]` thay vì union `ErrorResponse` — resolver phải throw đúng shape để Apollo serialize.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST; feature-flag `Inventory:InventoryV2` gate ở resolver-level (fail-fast 403 nếu OFF, trước khi forward BE — theo cơ chế đã setup sẵn boundary, không cần expand thêm).

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Thực hiện xóa qua mutation

#### AC-2 → Expose + forward mutation xóa kỳ

- **Khi**: FE gửi mutation `deleteAccountingPeriod(id)` sau khi user xác nhận trong popup.
- **BFF phải**: forward request xuống `gf-accounting` qua `DELETE /api/v2/accounting-periods/{id}`, trả `true` khi BE trả `204 No Content`.
- **Downstream**: `DELETE /api/v2/accounting-periods/{id}` (`gf-accounting`).
- **Output shape**: `Boolean!` — `true` khi xóa thành công.
- **Failure mode**: BE `404` → `ERR-CMN-not-found` (id không tồn tại/tenant mismatch, không leak thông tin).
- **Ref**: op `deleteAccountingPeriod` (§6.1), resolver `src/graphql/modules/gf-accounting/accounting-period/accounting-period.resolver.ts` (§6.2), paired BE `FEAT-AP-DELETE` §6 (DELETE endpoint, guard 1+2).

#### AC-4 → Map lỗi khi kỳ đã đóng hoặc đã phát sinh dữ liệu kho

- **Khi**: BE trả `400 ERR-INV-025` do kỳ đang `CLOSED` hoặc đã có dữ liệu kho liên quan (guard 1 + guard 3 — guard 3 enforce ở downstream Receipt/Delivery/OB backend, không phải tại `gf-accounting`; xem BR-OB-002 cho liên hệ gián tiếp OB↔kỳ qua "Tồn đến ngày").
- **BFF phải**: pass-through nguyên trạng mã lỗi `ERR-INV-025` vào GraphQL `errors[].extensions.code` (không rename, không tạo mã BFF-only cho case này).
- **Downstream**: `DELETE /api/v2/accounting-periods/{id}` — response body `{error: {code: "ERR-INV-025", ...}}`.
- **Output shape**: GraphQL top-level `errors[]` (do `Boolean!` non-nullable không wrap được union `ErrorResponse`), kèm `data: { deleteAccountingPeriod: null }`.
- **Failure mode**: `ERR-INV-025` HTTP 400 → FE render popup "Không thể xóa" verbatim theo message BE trả.
- **Ref**: §4.5 Error code mapping, §6.2 resolver mapping.

#### AC-5 → Map lỗi khi kỳ còn kỳ con

- **Khi**: BE trả `400 ERR-INV-026` do kỳ cha còn ít nhất 1 kỳ con (recursive CTE check trên `parent_id`, guard 2, BR-AP-014).
- **BFF phải**: pass-through nguyên trạng `ERR-INV-026` vào `errors[].extensions.code`, không transform message.
- **Downstream**: `DELETE /api/v2/accounting-periods/{id}`.
- **Output shape**: GraphQL top-level `errors[]` + `data: { deleteAccountingPeriod: null }`.
- **Failure mode**: `ERR-INV-026` HTTP 400 → FE render popup "Không thể xóa" verbatim (khác message với AC-4).
- **Ref**: §4.5 Error code mapping.

#### AC-6 → Cho phép cả 2 persona xóa ngang quyền

- **Khi**: request `deleteAccountingPeriod` đến từ user có persona `garage-owner` hoặc `accountant` cùng tenant.
- **BFF phải**: forward JWT nguyên trạng xuống BE (không có field-level RBAC riêng cho xóa AP — theo BR nội bộ 2 persona có quyền CRUD ngang nhau); chỉ đảm bảo `X-Tenant-Id` khớp tenant trong JWT để BE tenant-filter đúng dữ liệu (Critical Rule #4). Không thêm guard phân biệt persona ở resolver.
- **Downstream**: n/a (không có REST riêng cho check quyền — tenant scoping enforced ở `gf-accounting` qua header).
- **Output shape**: n/a.
- **Failure mode**: `401 UNAUTHENTICATED_ERROR` khi thiếu/hết hạn JWT; `403 FORBIDDEN_ERROR` khi tenant mismatch.
- **Ref**: §4.1 Auth header propagation.

### Cluster B — UI-only (N/A cho BFF)

#### AC-1 → N/A (FE-web local dialog)

- Mở popup xác nhận xóa là hành vi UI thuần (render dialog khi user click icon "Xóa" trong danh sách) — không có API call. BFF không touch. Xem `fe-web/FEAT-AP-LIST.md` (danh sách chứa nút Xóa).

#### AC-3 → N/A (FE-web local dialog)

- Hủy xóa chỉ đóng popup ở client, không gọi mutation nào. BFF không touch. Xem `fe-web/FEAT-AP-LIST.md`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Resolver `deleteAccountingPeriod` propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST `DELETE /api/v2/accounting-periods/{id}`.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Không cần DataLoader — thao tác xóa 1 `id` đơn lẻ, không có nested field resolution nào cần batch.
- Không có persisted query whitelist riêng cho op này trong batch W04.

### 4.3 Security + data exposure

- KHÔNG log PII / JWT trong resolver khi forward request xóa.
- Không có field-level RBAC riêng — 2 persona (`garage-owner`, `accountant`) full quyền ngang nhau theo AC-6; chỉ enforce tenant scope qua header (client-controlled arg `id` không dùng để xác định tenant — tenant lấy từ JWT/header).

### 4.4 Contract stability

- **Không có schema change** cho FEAT-AP-DELETE — `Mutation.deleteAccountingPeriod` đã tồn tại trong SDL ratified DESIGN (module `accounting-period` §3e, cùng batch với AP-CREATE/LIST/EDIT). Nếu cần sửa contract (vd đổi return type) → CR MAJOR, ngoài phạm vi feature này.
- Breaking change bất kỳ → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `400 ERR-INV-025` (status=CLOSED hoặc có dữ liệu kho — BR-AP-013) | `ERR-INV-025` (pass-through, top-level `errors[].extensions.code`) | AC-4 |
| `400 ERR-INV-026` (còn kỳ con — BR-AP-014) | `ERR-INV-026` (pass-through) | AC-5 |
| `404 Not Found` (id không tồn tại/tenant mismatch) | `ERR-CMN-not-found` | AC-2 |
| — | `UNAUTHENTICATED_ERROR` / `FORBIDDEN_ERROR` | AC-6 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> **Không có type mới cho FEAT-AP-DELETE.** SDL module `accounting-period` (enum `AccountingPeriodType`/`AccountingPeriodStatus`, type `AccountingPeriod`/`AccountingPeriodDetail`/`AccountingPeriodTreeNode`, mutation `deleteAccountingPeriod(id: ID!): Boolean!`) đã ratified DESIGN cùng batch W04 trong `agg-garage-graph-graphql.md §3e.1` (đi kèm `FEAT-AP-CREATE`/`FEAT-AP-LIST`/`FEAT-AP-EDIT`). FEAT-AP-DELETE chỉ **reuse** `Mutation.deleteAccountingPeriod` — không thêm/sửa field nào.

### 5.1 New types

_(không có — reuse SDL đã ratified)_

### 5.2 Modified types (additive — backward-compat)

_(không có)_

> **Breaking changes** → REJECT (BFF schema additive only).

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

> Operation đã tồn tại trong SDL — bảng dưới liệt kê lại contract cho scope FEAT-AP-DELETE (reuse, không phải op mới).

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `deleteAccountingPeriod` | mutation | `id: ID!` | `Boolean!` | JWT + `X-Tenant-Id` (forward) | AC-2 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `deleteAccountingPeriod` | `src/graphql/modules/gf-accounting/accounting-period/accounting-period.resolver.ts` | `FEAT-AP-DELETE` (BE §6 — DELETE `/api/v2/accounting-periods/{id}`, `gf-accounting-api.md §4.6`, ref nội bộ Architecture "V4-AP-6") | `DELETE /api/v2/accounting-periods/{id}` | n/a (single by id, không batch) | AC-2, AC-4, AC-5, AC-6 |

> Ghi chú đối chiếu nguồn: chốt label `V4-AP-6` (SSOT `agg-garage-graph-graphql.md §3e.6` + `gf-accounting-api.md §4.6`, resolved 2026-07-08 v2). PKG-W04 §2.2.3 dùng label ngắn `V4-AP-5` là snapshot cũ pre-SSOT — dev đọc spec này ưu tiên `V4-AP-6`. REST path unambiguous (`DELETE /api/v2/accounting-periods/{id}`).

### 6.3 DataLoader / batching strategy

_(không cần — thao tác xóa theo 1 `id` đơn lẻ, không có N+1 risk)_

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `deleteAccountingPeriod` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache; FE tự refetch tree sau khi xóa thành công |

### 6.5 Persisted query allowlist (nếu enable)

_(không enable trong batch W04)_

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (item #5 enforce). Module đã tồn tại từ FEAT-AP-CREATE cùng wave — chỉ thêm resolver case + error-map cho nhánh xóa.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/graphql/modules/gf-accounting/accounting-period/accounting-period.schema.ts` | REUSE (không đổi — mutation đã có trong SDL cùng batch AP-CREATE) | existing SDL | 0 | AC-2 |
| `resolvers/` | `src/graphql/modules/gf-accounting/accounting-period/accounting-period.resolver.ts` | MODIFY (thêm case `deleteAccountingPeriod`) | resolver passthrough pattern | ~25 | AC-2, AC-4, AC-5, AC-6 |
| `data-sources/` | `src/graphql/modules/gf-accounting/accounting-period/accounting-period.datasource.ts` | ADDITIVE (thêm method `deleteAccountingPeriod(id)`) | new method | ~15 | AC-2 |
| `error-code-map/` | `src/graphql/modules/gf-accounting/accounting-period/error-code-map.ts` | ADDITIVE (thêm entry `ERR-INV-025`/`ERR-INV-026` nếu chưa có từ AP-EDIT) | reuse `ERR-INV-*` map | ~5 | AC-4, AC-5 |
| `tests/integration` | `tests/integration/gf-accounting/accounting-period.test.ts` | ADDITIVE (case xóa thành công + 2 case lỗi guard) | apollo test client | ~45 | AC-2, AC-4, AC-5 |
| `tests/contract` | `tests/contract/gf-accounting/accounting-period-contract.test.ts` | ADDITIVE (assert `deleteAccountingPeriod` shape) | schema contract | ~15 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green — DELETE endpoint 3-guard đã pass integration test). BFF S5 exit hand-off S6 cho FE-web (FEAT-AP-LIST tier — nơi popup xóa được trigger).

```
(← BE tier S4: integration green — FEAT-AP-DELETE DELETE endpoint)

S5  BFF resolver wire (deleteAccountingPeriod)
    Entry: BE FEAT-AP-DELETE §6 DELETE endpoint stable (guard 1+2 pass)
    Exit: BFF contract test green (delete success + ERR-INV-025 + ERR-INV-026 mapping)
    └─► (hand-off FE-web S6 — FEAT-AP-LIST tier consume mutation)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF resolver case + error-map cho `deleteAccountingPeriod` | resolvers + data-sources + error-code-map | BE FEAT-AP-DELETE §6 stable | BFF contract test green | BE FEAT-AP-DELETE S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE `gf-accounting` territory). BFF chỉ pass-through error code + enforce auth/tenant context + feature-flag gate.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-013` | CORNERSTONE | pass-through error `ERR-INV-025` | `accounting-period.resolver.ts` | AC-4 | Guard 1 (status) + guard 3 (dữ liệu kho, delegated downstream) enforce tại BE; BFF chỉ forward mã lỗi nguyên trạng. |
| `BR-AP-014` | CORNERSTONE | pass-through error `ERR-INV-026` | `accounting-period.resolver.ts` | AC-5 | Guard 2 (kỳ con) enforce tại BE qua recursive CTE; BFF chỉ forward. |
| `Inventory:InventoryV2` flag | NORMAL | resolver-level `@FeatureOn` gate | `accounting-period.resolver.ts` | (implicit, mọi AC) | Fail-fast 403 trước khi forward BE nếu flag OFF (CR-20260707-02). |
| `BR-OB-002` | NORMAL | tham chiếu (không enforce tại BFF) | — | AC-4 (guard 3) | Liên hệ gián tiếp tồn đầu kỳ ↔ kỳ kế toán qua "Tồn đến ngày"; guard 3 enforce ở downstream OB/Receipt/Delivery backend, ngoài phạm vi resolver AP-DELETE. |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-AP-DELETE.md §9` (khi được generate).

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration (resolver → BE) | test-api | mock BE `204`, assert `deleteAccountingPeriod: true` |
| AC-2 | BFF contract (idempotent second-call) | test-api | mock BE `404`, assert `ERR-CMN-not-found` |
| AC-4 | BFF contract (error mapping) | test-api | mock BE `400 ERR-INV-025`, assert GraphQL top-level `errors[]` shape |
| AC-5 | BFF contract (error mapping) | test-api | mock BE `400 ERR-INV-026`, assert GraphQL top-level `errors[]` shape |
| AC-6 | BFF auth (header propagation + flag gate) | test-isolation | dual persona (garage-owner/accountant) đều pass; tenant mismatch → 403; flag OFF → 403 fail-fast trước khi forward BE |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-DELETE.md` | NOT YET GENERATED | Downstream REST `DELETE /api/v2/accounting-periods/{id}` (§6.1-§6.2) — BFF resolver wrap. |
| FE Web | — (không có tier riêng) | N/A | Popup xóa + trigger mutation nằm trong `fe-web/FEAT-AP-LIST.md` (danh sách chứa nút Xóa) — FE-web tier đó consume `deleteAccountingPeriod` từ §6.1. |
| Mobile | — | N/A | Mobile out-of-scope W04 — 5 FEAT-AP-* chỉ desktop (per PKG-W04 §2.2.5, Figma registry không gán link mobile cho AP). |

**Source ID consistency** (item 18): `source_feat_sha` phải identical với BE file khi được generate.

## 12. References

- **Source**: [`Product/features/FEAT-AP-DELETE.md`](../../../../../Product/features/FEAT-AP-DELETE.md) v4
- **Paired BE**: [`features/be/FEAT-AP-DELETE.md`](../be/FEAT-AP-DELETE.md) (chưa generate)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md §3e`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **BE REST contract**: [`Architecture/api/gf-accounting-api.md §4.6`](../../../../../Architecture/api/gf-accounting-api.md)
- **ADR**: `ADR-019` (AP boundary + REST/Kafka integration surface), `ADR-009` (no JPA relationship mapping — BE reference)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-AP-DELETE` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BFF (passthrough `deleteAccountingPeriod`, feature-flag gate, header propagation), §3 behaviour map cover 6/6 AC (4 touch BFF, 2 N/A — UI-only thuộc `fe-web/FEAT-AP-LIST`), §4 auth + contract stability + error mapping (`ERR-INV-025`/`ERR-INV-026`/`ERR-CMN-not-found`), §5 SDL delta (reuse — không type mới), §6-§11 BFF-specific (resolver mapping, file map, S5 DAG, BR secondary, test hand-off, cross-tier — BE chưa generate, FE-web không có tier riêng, mobile out-of-scope). Source FEAT chỉ audit. |
