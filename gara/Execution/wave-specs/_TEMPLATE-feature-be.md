---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-{{FEAT-ID}}.md"
source_version: {{N}}                                  # version FEAT gốc tại authoring time
source: "gen-execution-spec"                           # audit: ai tạo file này
source_feat_id: "FEAT-{{FEAT-ID}}"
source_feat_sha: "{{sha256-source}}"                   # SHA của source FEAT (item 18 consistency)
generated_at: "{{ISO8601-UTC}}"
status: DRAFT                                          # DRAFT | ACTIVE | SUPERSEDED
version: 1
tier: T4
owner_authority: Delivery Authority                    # Architecture Authority co-sign §5 §6 §7
wave: "W{{NN}}"
parent_epic: "EP-{{EPIC-ID}}"
parent_pkg: "PKG-W{{NN}}-{{slug}}"
boundary: "{{boundary-owner}}"                         # BE primary owner
boundaries_affected: ["{{boundary-1}}", "{{boundary-2}}"]   # khi FEAT cross-boundary
modifies: []                                           # FEAT baseline production bị extend
change_type: "{{brownfield-enhancement | new-capability}}"
demo_signature: ""                                     # AC-driven happy path one-liner
consumes_contracts: []                                 # REST endpoints + Kafka topics dùng cross-boundary
paired_bff_feats: []                                   # nếu has_bff_touchpoint=true → ["FEAT-{ID}"]
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

# FEAT-{{FEAT-ID}} (BE): {{Tiêu đề tiếng Việt}}

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-{{FEAT-ID}}` |
| Tier | **backend** |
| Boundary owner | `{{boundary-owner}}` |
| Boundaries affected | `{{boundary-1}}`, `{{boundary-2}}`, ... |
| Parent Epic | [`EP-{{EPIC-ID}}`](../../epics/EP-{{EPIC-ID}}.md) |
| Wave | W{{NN}} |
| Status | DRAFT |
| Demo signature | {{Happy path one-liner derived từ AC}} |
| Cross-tier pair | BFF: {{paired_bff_feats}} \| Web: {{paired_fe_web_feats}} \| Mobile: {{paired_mobile_feats}} |

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

{{Viết 3-5 dòng tiếng Việt: persona đang giải quyết vấn đề gì, đầu ra mong muốn, feature này nằm chỗ nào trong end-to-end flow tại garage}}

## 2. Trách nhiệm backend ({{boundary-owner}})

> 3-6 bullet ngắn — boundary này cần làm gì để feature hoạt động. Tier-specific (BE focus: server state, contract, business rule SSOT, integration). KHÔNG mô tả UI/UX/component.

- {{Thay đổi/ extend entity nào — tại boundary {{boundary-owner}}}}
- {{REST endpoints mới hoặc additive — cho client/BFF/cross-boundary consume}}
- {{Business rule nào enforce ở layer nào — primary cho BR CORNERSTONE}}
- {{Event(s) Kafka publish/consume (nếu có) — outbox/inbox}}
- {{Cross-boundary call (nếu có) — REST consumer + failure mode}}
- {{Migration / persistence strategy — Flyway V{N+1} hoặc ddl-auto theo policy boundary}}

## 3. Hành vi cần triển khai (BE behaviour map)

> Mỗi source AC-ID → 1 BE behaviour statement. **Không copy text AC từ source** — viết lại theo góc nhìn BE: "BE phải làm X khi Y để satisfy AC-N". Group theo cluster nghiệp vụ (vd "Tạo & validate", "Persist", "Query", "Permission"…). Mỗi entry link source AC-ID + BR ref + entity/endpoint ref nội bộ.
>
> **Coverage gate** (reviewer item #1): mỗi source AC-ID phải xuất hiện ít nhất 1 lần ở §3 hoặc §4. Source AC-ID nào hoàn toàn UI-only (BE không touch) → khai báo explicit `→ N/A (UI-only, xem fe-web/mobile tier file)` để reviewer biết KHÔNG miss.

### Cluster A — {{tên cluster nghiệp vụ ngắn}}

#### AC-{{N}} → {{Tiêu đề BE behaviour}}

- **Khi**: {{event trigger BE side — vd "client POST /api/v1/X", "Kafka event Y arrive", "scheduled job"}}
- **BE phải**: {{specific action — validate, compute, persist, emit event}}
- **Output**: {{response shape / event payload / DB state change}}
- **Failure mode**: {{error code + status + retry semantics}}
- **Ref**: BR-{{X}}-{{NNN}} (§9), entity `{{Entity}}` (§5.1), endpoint `{{METHOD path}}` (§6.1)

#### AC-{{M}} → {{Tiêu đề}}

...

### Cluster B — {{tên}}

...

#### AC-{{P}} → N/A (UI-only)

- Source AC này thuộc tier fe-web / mobile (vd state highlight, label hiển thị). BE không touch. Xem `fe-web/FEAT-{{FEAT-ID}}.md §3 AC-{{P}}`.

## 4. Ràng buộc & rule cần enforce

> MUST-NOT-VIOLATE list cho BE. Group: business rule (SSOT), data integrity, security, idempotency, error code. Mỗi entry link source ref (BR, ADR, KG).

### 4.1 Business rule SSOT (BE primary)

- **BR-{{X}}-{{NNN}}** ({{CORNERSTONE/NORMAL}}): {{statement tóm tắt}} — enforce tại {{layer: domain/service/repository}}. Vi phạm → error code `{{err-code}}` + HTTP {{status}}.
- ...

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- {{Endpoints nào yêu cầu role nào — accountant / garage-owner}}

### 4.3 Idempotency + concurrency

- {{Idempotency-key strategy cho endpoints POST/PUT nếu có}}
- {{Optimistic locking / version field / unique constraint nếu có}}

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `{{err-code}}` | 400 / 409 / 422 | AC-{{N}} | TOAST / INLINE / EMPTY_STATE |

---

## 5. Schema delta (BE — contract focus)

> Author tổng hợp từ KG.entities + FEAT AC + PKG §2.2. Mỗi row link CB / BR / AC ref. Tier BE chỉ — không có BFF/Web/Mobile noise.

### 5.1 Entity changes — `{{boundary-owner}}`

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `{{table_name}}` | `{{column_name}}` | `{{TYPE(N,M)}}` | Y/N | `{{value}}` | Flyway V{{N+1}} \| ddl-auto=update | `BR-{{X}}-001` | `AC-3` | {{ý nghĩa nghiệp vụ}} |

> **Boundary migration policy** (xem `rules-backend` skill):
> - Flyway V{N+1} additive: gf-system, gf-hrms, gf-sales, gf-purchase, gf-inventory, gf-inventory-worker, gf-customer, gf-marketing, gf-notification, gf-erp-agent.
> - `ddl-auto=update`: gf-erp-mdm, gf-accounting, gf-shipment, gf-worker.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `{{table}}` | `idx_{{name}}` | `(col1, col2)` | btree partial | {{purpose}} | ADR-{{NNN}} |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `{{boundary-owner}}`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| GET | `/protected/v1/{{resource}}/{tenantId}/{id}/for-{{purpose}}` | x-api-key | — | `{ field1, field2 }` | safe (read) | AC-3 | CB-{{X}}-001 |
| POST | `/api/v1/{{resource}}` | JWT | `{ ... }` | `{ id, status }` | client idempotency-key | AC-15 | — |

### 6.2 Modified REST endpoints (additive)

| Method | Path | Change | Backward-compat? | AC ref |
|---|---|---|---|---|
| POST | `/api/v1/{{resource}}/{id}/settlements` | Additive request fields: `{{block}}` | ✅ optional | AC-15 |

### 6.3 Kafka topics (publish/consume)

| Topic | Direction | Schema | When | AC ref |
|---|---|---|---|---|
| `garage.{{boundary}}.{{event}}` | publish | `{{Event}}V1` | On {{trigger}} | AC-{{X}} |

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /for-{{purpose}}` | `{{other-boundary}}` ({{flow}}) | At {{command}} | rollback / log | sync, fail fast |

> **Hand-off tới BFF**: nếu has_bff_touchpoint=true, BFF FEAT (`features/bff/FEAT-{{FEAT-ID}}.md`) sẽ wrap các endpoints này thành GraphQL ops. KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/{{boundary-owner}}/**` (item #5 enforce). Cross-boundary touch chỉ qua §6 (REST/Kafka).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/{{Entity}}.java` | MODIFY | extend (+columns) | ~20 | AC-3, AC-5 |
| `domain/repository` | `src/main/java/.../domain/repository/{{Entity}}Repository.java` | ADDITIVE | new finder | ~10 | AC-13 |
| `app/service` | `src/main/java/.../app/service/{{Entity}}Service.java` | MODIFY | extend (calc) | ~80 | AC-3-AC-11 |
| `adapter/controller` | `src/main/java/.../adapter/controller/{{Entity}}Controller.java` | NEW | new endpoint | ~30 | AC-3 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/{{Entity}}JpaRepository.java` | ADDITIVE | method | ~5 | — |
| `db/migration` | `src/main/resources/db/migration/V{{N}}__add_{{X}}_columns.sql` | NEW | Flyway additive | ~15 | AC-3 |
| `test/unit` | `src/test/java/.../app/service/{{Entity}}ServiceTest.java` | ADDITIVE | new test methods | ~150 | AC-3-AC-15 |
| `test/contract` | `src/test/java/.../adapter/controller/{{Entity}}ContractTest.java` | NEW | contract test | ~80 | AC-3 |

## 8. Implementation sequence DAG (BE — S1→S4)

> Numbered steps with dependency arrow. BE owns S1-S4; hand-off S5 (BFF wire) sang BFF tier file.

```
S1  Schema migration / entity update
    Entry: KG.entities stable
    Exit: schema deployed local, migration test green
    └─► S2

S2  Repository + Service logic (BR enforcement primary)
    Entry: S1
    Exit: unit test ≥8 green
    └─► S3

S3  REST adapter (controller)
    Entry: S2
    Exit: contract test green
    └─► S4

S4  Integration test (cross-boundary REST + Kafka)
    Entry: S3 + counterpart boundary endpoints stable
    Exit: integ test green
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Schema migration | db/migration | KG stable | Migration test green | — |
| S2 | Entity + service logic | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + counterpart endpoints | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

> BE là source-of-truth cho BR enforcement. BFF/FE/Mobile chỉ secondary (UX hint).

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-{{X}}-001` | CORNERSTONE | domain (primary) + validation (secondary) | `domain/model/{{Entity}}.java` + `app/service/{{Entity}}Validator.java` | AC-3, AC-4 | `TC-BR-{{boundary}}-001-*` |
| `BR-{{X}}-002` | NORMAL | service | `app/service/{{Entity}}Service.java::calculate()` | AC-11 | `TC-BR-{{boundary}}-002-*` |
| `BR-{{X}}-003` | CORNERSTONE | repository | `adapter/persistence/{{Entity}}JpaRepository.java` (unique constraint) | AC-13 | `TC-BR-{{boundary}}-003-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense).
> - UI/client-side enforcement → đó là FE/Mobile tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

> Mapping AC → BE test type. Test-ui / test-mobile-ui chạy ở FE/Mobile tier file.

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-0 | API contract (negative) | test-api | gate gen settlement |
| AC-3 | Unit (calc) + API contract | test-api | dropdown unit + % vs amount |
| AC-13 | API contract + Integration | test-api | lưu entity với new columns |
| AC-15 | Integration (cross-boundary snapshot pull) | test-api | `{{boundary}}` ↔ `{{other-boundary}}` |
| AC-16 | Isolation (RBAC) | test-isolation | dual persona |

## 11. Cross-tier coordination (BE perspective)

> Cross-link sang các tier file khác cùng `FEAT-{{FEAT-ID}}`. Reviewer items 15-18 enforce consistency.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W{{NN}}/Product/features/bff/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | Resolver wrap §6.1-§6.2 endpoints (nếu has_bff_touchpoint=true) |
| FE Web | `Execution/wave-specs/W{{NN}}/Product/features/fe-web/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | UI consume BFF ops (nếu has_ui_touchpoint=true) |
| Mobile | `Execution/wave-specs/W{{NN}}/Product/features/mobile/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | Flutter consume BFF ops (nếu has_mobile_touchpoint=true) |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = {{sha256-source}}`.

## 12. References

- **Source**: [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) v{{N}}
- **Parent EP**: [`EP-{{EPIC-ID}}.md`](../../epics/EP-{{EPIC-ID}}.md) (converted)
- **BR refs**: [`BR-EP-{{EPIC-DOMAIN}}.md`](../../business-rules/BR-EP-{{EPIC-DOMAIN}}.md), [`BR-GF-{{boundary-owner}}.md`](../../business-rules/BR-GF-{{boundary-owner}}.md)
- **HLD**: [`Architecture/hld/{{boundary-owner}}-HLD.md`](../../../../../Architecture/hld/{{boundary-owner}}-HLD.md)
- **API contract**: [`Architecture/api/{{boundary-owner}}-api.md`](../../../../../Architecture/api/{{boundary-owner}}-api.md)
- **Integration**: [`Architecture/integrations/INTEG-*-{{boundary-owner}}-*.md`](../../../../../Architecture/integrations/)
- **KG**: `Execution/knowledge-graphs/{{boundary-owner}}.knowledge-graph.yaml` v{{N}}
- **PKG**: [`PKG-W{{NN}}-{{slug}}.md`](../../../../work-packages/PKG-W{{NN}}-{{slug}}.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| {{YYYY-MM-DD}} | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-{{FEAT-ID}}` W{{NN}}. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map per AC-ID, §4 ràng buộc + error code, §5-§11 BE-specific (schema/REST/Hexagonal/sequence/BR primary/test/cross-tier pair). Source FEAT chỉ audit. |
