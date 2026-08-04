---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-{{FEAT-ID}}.md"
source_version: {{N}}
source: "gen-execution-spec"
source_feat_id: "FEAT-{{FEAT-ID}}"
source_feat_sha: "{{sha256-source}}"
generated_at: "{{ISO8601-UTC}}"
status: DRAFT
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W{{NN}}"
parent_epic: "EP-{{EPIC-ID}}"
parent_pkg: "PKG-W{{NN}}-{{slug}}"
bff: "{{bff-name}}"                                    # vd "agg-garage-graph"
boundaries_consumed: ["{{boundary-1}}", "{{boundary-2}}"]   # BE boundaries mà BFF wrap
modifies: []
change_type: "{{brownfield-enhancement | new-capability}}"
graphql_ops: []                                        # mutation/query/subscription names
paired_backend_feats: ["FEAT-{{FEAT-ID}}"]             # luôn pair tới BE FEAT cùng id
paired_fe_web_feats: []                                # nếu has_ui_touchpoint=true → ["FEAT-{ID}"]
paired_mobile_feats: []                                # nếu has_mobile_touchpoint=true → ["FEAT-{ID}"]
authoring_inputs:
  kg_baseline_sha: "{{sha256-kg}}"
  pkg_ref: "PKG-W{{NN}}-{{slug}}"
  fanout_map_sha: "{{sha256-map-yaml}}"
  template_sha: "{{sha256-template}}"
reviewer_verdict: null
last_reviewed: "{{YYYY-MM-DD}}"
---

# FEAT-{{FEAT-ID}} (BFF): {{Tiêu đề tiếng Việt}}

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-{{FEAT-ID}}` |
| Tier | **bff** |
| BFF | `{{bff-name}}` |
| Boundaries consumed | `{{boundary-1}}`, `{{boundary-2}}` |
| Parent Epic | [`EP-{{EPIC-ID}}`](../../epics/EP-{{EPIC-ID}}.md) |
| Wave | W{{NN}} |
| Status | DRAFT |
| GraphQL ops | {{graphql_ops}} |
| Cross-tier pair | BE: {{paired_backend_feats}} \| Web: {{paired_fe_web_feats}} \| Mobile: {{paired_mobile_feats}} |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-{{FEAT-ID}}` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) |
| Source version | v{{N}} |
| Source SHA | `{{sha256-source}}` |
| Generated at | {{ISO8601-UTC}} |

## 1. Mục đích nghiệp vụ

> 3-5 dòng — vì sao feature tồn tại, user outcome, vị trí trong business flow. **Identical cross-tier**. KHÔNG copy AC text, KHÔNG mô tả UI hay implementation.

{{Viết 3-5 dòng tiếng Việt — match nội dung §1 ở tier BE/FE/Mobile}}

## 2. Trách nhiệm BFF ({{bff-name}})

> 3-6 bullet ngắn — BFF cần làm gì. Tier-specific (focus: GraphQL contract, orchestration/passthrough, auth header propagation, N+1 prevention, cache, error mapping). KHÔNG mô tả schema DB hay UI component.

- {{GraphQL operations mới/extend nào — mutation/query/subscription}}
- {{Resolver pattern: orchestrator multi-phase hay passthrough thuần}}
- {{Downstream BE endpoints cần consume — REST path + auth}}
- {{DataLoader / batching cần setup không — chống N+1}}
- {{Cache strategy: persisted query, in-memory TTL, scope per tenant}}
- {{Auth header propagate downstream: Authorization, X-Tenant-Id, X-Branch-Id, x-request-id}}

## 3. Hành vi cần triển khai (BFF behaviour map)

> Mỗi source AC-ID → 1 BFF behaviour statement. **Không copy text AC từ source** — viết lại theo góc nhìn BFF: "BFF phải expose contract X / orchestrate Y / map Z để FE satisfy AC-N".
>
> **Coverage gate** (reviewer item #1): mỗi source AC-ID phải xuất hiện ít nhất 1 lần ở §3 hoặc §4. AC nào BFF không touch (chỉ BE state hoặc chỉ FE local UI) → khai báo explicit `→ N/A (xem be/ tier hoặc fe-web/ tier file)`.

### Cluster A — {{tên cluster nghiệp vụ ngắn}}

#### AC-{{N}} → {{Tiêu đề BFF behaviour}}

- **Khi**: {{FE/Mobile gửi op X — vd mutation `exportInsuranceDossier`}}
- **BFF phải**: {{action — orchestrate N call song song / passthrough / mapping / filter / cache hit}}
- **Downstream**: {{REST endpoint(s) gọi xuống BE — kèm boundary}}
- **Output shape**: {{GraphQL response type / field selected}}
- **Failure mode**: {{error code FE consume — mapping từ downstream error}}
- **Ref**: op `{{opName}}` (§6.1), resolver `{{path}}` (§6.2), paired BE FEAT-{{FEAT-ID}} §6.{{X}}

#### AC-{{M}} → {{Tiêu đề}}

...

### Cluster B — {{tên}}

...

#### AC-{{P}} → N/A

- Source AC này chỉ BE state ({{vd: enforce CORNERSTONE BR}}) / chỉ FE local UI ({{vd: highlight state, label}}). BFF không touch.

## 4. Ràng buộc & rule cần enforce

> MUST-NOT-VIOLATE list cho BFF. Group: auth, perf, security, contract stability, error mapping.

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- {{Resolver(s) nào cần DataLoader batching — key shape, batch endpoint}}
- {{Cache scope per op — `@cacheControl(maxAge: N, scope: PRIVATE)`}}
- {{Persisted query whitelist nếu có — block ad-hoc query in prod}}

### 4.3 Security + data exposure

- KHÔNG log PII / payment token / JWT / card data trong resolver.
- {{Field-level RBAC nếu có — vd field `salary` chỉ role X xem được}}
- {{Tenant scope — query filter qua header, không qua arg client-controlled}}

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")` keep old.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| {{err-code BE}} | {{err-code GraphQL}} | AC-{{N}} |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Author tổng hợp từ KG (GraphQL types) + paired BE FEAT §6 endpoints + FE/Mobile ops needs. Path glob ⊆ `bffs/{{bff-name}}/**`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `{{TypeName}}` | type | `id: ID!`, `field1: String`, ... | NO (new) | AC-3 |
| `{{InputName}}` | input | `field1: String!`, ... | NO (new) | AC-15 |
| `{{EnumName}}` | enum | `VALUE_A`, `VALUE_B`, `VALUE_C` | NO (new) | AC-{{X}} |

### 5.2 Modified types (additive — backward-compat)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `{{ExistingType}}` | `{{newField}}` | `{{FieldType}}` | nullable | AC-9 |

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `create{{Entity}}` | mutation | `input: Create{{Entity}}Input!` | `{{Entity}}!` | JWT + tenantId | AC-15 |
| `get{{Entity}}ByCode` | query | `code: String!`, `tenantId: ID!` | `{{Entity}}` | x-api-key OR JWT | AC-9 |
| `{{entity}}Updated` | subscription | `tenantId: ID!` | `{{Entity}}!` | JWT | AC-{{X}} |

### 6.2 Resolver mapping (downstream BE endpoints)

> Mỗi GraphQL op → 1 hoặc nhiều REST endpoints ở paired BE FEAT.

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `create{{Entity}}` | `src/resolvers/{{domain}}/create{{Entity}}.ts` | `FEAT-{{FEAT-ID}}` (BE §6.1) | `POST /api/v1/{{resource}}` | per tenant+branch | AC-15 |
| `get{{Entity}}ByCode` | `src/resolvers/{{domain}}/get{{Entity}}.ts` | `FEAT-{{FEAT-ID}}` (BE §6.1) | `GET /protected/v1/{{resource}}/{tenantId}/{code}` | per tenant+code | AC-9 |

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Batch endpoint | TTL (in-memory) | Use cases |
|---|---|---|---|---|
| `{{entity}}LoaderByTenant` | `{tenantId, ids[]}` | `POST /batch/by-ids` | request-scoped | resolver N+1 guard |
| `{{related}}LoaderByParent` | `{parentId}` | `GET /by-parent` | request-scoped | nested type resolution |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `get{{Entity}}ByCode` | `@cacheControl(maxAge: 60)` | 60s | `{{entity}}Updated` subscription | publishable read |
| `create{{Entity}}` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache |

### 6.5 Persisted query allowlist (nếu enable)

| Query name | Hash | First-seen | AC ref |
|---|---|---|---|
| `Create{{Entity}}Mutation` | `{{sha256}}` | {{date}} | AC-15 |

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/{{bff-name}}/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/{{domain}}.graphql` | MODIFY (additive) | extend SDL | ~30 | AC-15 |
| `resolvers/` | `src/resolvers/{{domain}}/create{{Entity}}.ts` | NEW | resolver pattern | ~60 | AC-15 |
| `resolvers/` | `src/resolvers/{{domain}}/get{{Entity}}.ts` | NEW | resolver pattern | ~40 | AC-9 |
| `data-sources/` | `src/data-sources/Gf{{Domain}}DataSource.ts` | ADDITIVE | new method | ~25 | AC-15 |
| `data-loaders/` | `src/data-loaders/{{entity}}Loader.ts` | NEW | DataLoader pattern | ~30 | (perf) |
| `auth/` | `src/auth/{{operation}}Guard.ts` | NEW (nếu custom auth) | guard pattern | ~20 | AC-16 |
| `tests/integration` | `tests/integration/{{domain}}.test.ts` | ADDITIVE | apollo test client | ~80 | AC-15 |
| `tests/contract` | `tests/contract/{{domain}}-contract.test.ts` | NEW | schema contract | ~50 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT §6 contracts stable
    Exit: BFF contract test green + DataLoader pass N+1 check
    └─► (hand-off FE/Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | schema + resolvers + data-sources + loaders | BE FEAT §6 stable | BFF contract test green | BE FEAT S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory). BFF chỉ enforce:
> - Auth context (RBAC, tenantId guard)
> - Persisted query allowlist
> - N+1 guard
> - Schema-level constraints (required fields, enum values)

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-{{X}}-RBAC-001` | CORNERSTONE | auth guard | `auth/{{op}}Guard.ts` | AC-16 | persona check |
| `BR-{{X}}-TENANT-001` | CORNERSTONE | resolver pre-check | `resolvers/{{domain}}/*.ts` | AC-5, AC-16 | tenantId from JWT vs args |
| `BR-{{X}}-N+1-001` | NORMAL | DataLoader enforcement | `data-loaders/{{entity}}Loader.ts` | (perf) | batch ≤ 100 |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-{{FEAT-ID}}.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-9 | BFF contract (schema, cache hint) | test-api | snapshot SDL + cache directive |
| AC-15 | BFF integration (resolver → BE) | test-api | mock downstream BE, verify request shape |
| AC-16 | BFF auth (RBAC) | test-isolation | dual persona, schema visibility |
| — | N+1 guard | test-api | inflight count assertion |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W{{NN}}/Product/features/be/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE}} | Downstream REST endpoints (§6.1-§6.2) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W{{NN}}/Product/features/fe-web/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | Consume GraphQL ops từ §6.1 |
| Mobile | `Execution/wave-specs/W{{NN}}/Product/features/mobile/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | Consume GraphQL ops từ §6.1 |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/FE/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) v{{N}}
- **Paired BE**: [`features/be/FEAT-{{FEAT-ID}}.md`](../be/FEAT-{{FEAT-ID}}.md)
- **HLD BFF**: [`Architecture/hld/{{bff-name}}-HLD.md`](../../../../../Architecture/hld/{{bff-name}}-HLD.md)
- **GraphQL schema**: [`Architecture/api/{{bff-name}}-graphql.md`](../../../../../Architecture/api/{{bff-name}}-graphql.md)
- **Integration**: [`Architecture/integrations/INTEG-FE-*-{{bff-name}}-*.md`](../../../../../Architecture/integrations/)
- **PKG**: [`PKG-W{{NN}}-{{slug}}.md`](../../../../work-packages/PKG-W{{NN}}-{{slug}}.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| {{YYYY-MM-DD}} | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-{{FEAT-ID}}` W{{NN}}. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF, §3 BFF behaviour map per AC-ID, §4 auth + perf + cache + error mapping, §5-§11 BFF-specific (SDL/ops/resolver/DataLoader/cross-tier pair). Source FEAT chỉ audit. |
