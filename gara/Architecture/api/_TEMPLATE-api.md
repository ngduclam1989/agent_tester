---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 4
tier: T1
owner_authority: Architecture Authority
boundary: "{{boundary}}"
last_reviewed: "2026-07-07"
---

# REST API — `{{boundary}}`

> Mô tả ngắn 1-2 câu: phạm vi nghiệp vụ, data schema chính, downstream chính.

## §0 Wave Index (optional — mandatory once file > 3,000 lines OR ≥ 2 wave-scoped sub-modules)

> **When to include**: nếu file API doc này > 3,000 dòng, HOẶC đã có ≥ 2 sub-module `§3<letter>` scoped theo wave riêng (vd `§3a Catalog V2 W03`, `§3b Opening Balance W04`) — thì §0 BẮT BUỘC. Dưới ngưỡng: bỏ qua §0, subagent đọc full file như cũ.
>
> **Subagent RULE (bounded read)**: khi §0 tồn tại và prompt scope gắn với 1 wave cụ thể, subagent chỉ được `Read` các section liệt kê ở cột `Sections` của wave đó **+ §1 Thông tin chung + §5 Naming Registry + §6 References**. KHÔNG đọc toàn file.
>
> **Cascading rule**: khi ratify thêm 1 sub-module `§3<letter>` cho wave mới, MUST append 1 hàng vào bảng này **trong cùng commit**. Drift check: `scripts/check-api-wave-index-drift.sh` (warn-only). Vi phạm = FM-020.

| Wave | Scope name | Sections | Endpoint ID range | Status | Ratified in |
|------|------------|----------|-------------------|--------|-------------|
| WT-baseline | Baseline endpoints (pre-first-wave) | §3 (default) | (rows §2 baseline) | ACTIVE | pre-v{{N}} |
| W{{NN}} | {{Scope name — cite EP / ADR}} | §3{{letter}} | Ops `W{{NN}}-1..W{{NN}}-M` | {{DESIGN\|ACTIVE}} | v{{N}} |

**Note**: §4 Forbidden + §5 Naming Registry + §6 References là cross-wave — luôn nằm trong read scope bất kể wave.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Base URL | `/{{boundary}}/api/v1` |
| Auth | {{JWT RS256 / Bearer + x-api-key cho protected}} |
| Idempotency | Không mặc định header `Idempotency-Key`; chỉ khai báo khi controller/filter thực sự đọc header. Nếu API dùng business key/query param thì mô tả đúng cơ chế đó. |
| Error envelope | `GMS.{{boundary}}.<DOMAIN>.<NN>` |
| Pagination | `page=0&size=20` (max size: 100) |
| Tenant Resolution | Public: `SecurityUtils.getCurrentTenantIdAsLong()`; Protected: từ body/query |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` |
| Persistence | {{vd: PostgreSQL schema `gf_xxx`, Flyway enabled}} |
| Cache / async | {{Redis, Kafka outbox/inbox, Temporal nếu có}} |
| Downstream | {{Liệt kê các service được gọi}} |

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---|---|---|---|---|
| 1 | POST | `/{{resource}}` | {{module}} | {{role}} |
| 2 | GET | `/{{resource}}/{id}` | {{module}} | {{role}} |
| 3 | POST | `/protected/v1/{{resource}}` | {{module}} | service-to-service (`x-api-key`) |

## 3. Endpoint Details

> **Rule COMPLETENESS (Reviewer G5 enforce — P0 nếu vi phạm, v5)**: Mỗi row §2 Endpoint Summary BẮT BUỘC có 1 detail sub-section riêng trong §3. KHÔNG skip endpoint (kể cả CRUD trivial GET-by-id / DELETE). Pair sub-section chỉ khi semantic identical (vd verify-import + import — combined heading `#### V2-20/V2-21`). Mỗi sub-section **BẮT BUỘC** đủ **6 khối**: (1) Headers · (2) Params · (3) Request · (4) Response 2xx · (5) Response 4xx · (6) Semantics + ≥ 1 fenced `\`\`\`json`. Skeleton chỉ có 1-2 dòng mô tả → G5 P0 block SA ratify — DEV không có contract để impl. Xem `agent-arch-author §Phase 5` + `agent-arch-review §G5`.

### {{METHOD}} `{{path}}`

{{Mô tả nghiệp vụ ngắn 1-2 câu — khi nào client gọi, side-effect quan trọng nhất.}}

**(1) Headers**:
| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | Public: user JWT. Protected: `x-api-key` thay Authorization. |
| `X-Tenant-Id` | Yes | Numeric tenant id. |
| `X-Branch-Id` | {{Yes if branch-scoped}} | Branch scope cho action nghiệp vụ. |

**(2) Path / Query params**:
| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `{{id}}` | Long | Yes | > 0 | FEAT-XXX §3:12 |

**(3) Request body** ({{N/A cho GET/DELETE}}):
```json
{
  "{{field}}": "{{example}}"
}
```
| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `{{field}}` | String | Yes | length 1..64, regex `^[A-Z0-9-]+$` | FEAT-XXX §3:20 |

**(4) Response 2xx** (200 OK / 201 Created):
```json
{
  "data": { "{{field}}": "{{value}}" }
}
```
| Field | Type | Note | Cite |
|---|---|---|---|
| `data.{{field}}` | String | canonical name — see §5 Naming Registry | KG.{{boundary}}.entities.{{Entity}}.{{field}} |

**(5) Response 4xx/5xx**:
| Code | HTTP | Condition |
|---|---|---|
| `GMS.{{boundary}}.{{DOMAIN}}.AUTH_401` | 401 | Missing / invalid JWT |
| `GMS.{{boundary}}.{{DOMAIN}}.AUTH_403` | 403 | Forbidden role hoặc tenant mismatch |
| `GMS.{{boundary}}.{{DOMAIN}}.VAL_400` | 400 | Validation fail (field cụ thể trong `errors[]`) |
| `GMS.{{boundary}}.{{DOMAIN}}.NF_404` | 404 | Resource không tồn tại trong tenant |
| `GMS.{{boundary}}.{{DOMAIN}}.CONFLICT_409` | 409 | Business key trùng / state transition sai |

**(6) Semantics**:
- **Idempotency**: {{Không áp dụng cho GET; state-changing dùng business key `{{code}}` / header `Idempotency-Key` — mô tả cơ chế thực. Retry safety.}}
- **Permission gate**: {{`accountant` | `garage-owner` — cite `Product/business-rules/BR-XXX.md`}}.
- **Performance annotation**: expected p95 {{200ms}}, {{cursor pagination `pageSize` + `nextCursor` cho list}}, index used: `{{idx_tenant_code}}` on `{{tenant_id, code}}`.
- **Side-effect**: {{publish Kafka event `{{topic}}` với MessageGroup/Step / signal Temporal `{{workflow}}` / invalidate cache key `{{key}}`}}.

## 4. Forbidden patterns

- ❌ {{Anti-pattern 1 — vd: Tạo entity không có `tenant_id`}}.
- ❌ {{Hard-delete record nghiệp vụ}}.
- ❌ {{Cross-tenant query không qua role check}}.
- ❌ {{Bypass idempotency cho POST}}.
- ❌ {{Currency / unit không chuẩn}}.
- ❌ Field không có trong §5 Naming Registry (alien field) — Reviewer G11 P0.
- ❌ Rename canonical field ở BFF/FE/Mobile — 1 concept ↔ 1 name across 4 tier.

## 5. Naming Registry (cross-tier canonical names)

> **Rule (Reviewer G11 enforce — P0)**: Section này BẮT BUỘC tồn tại cho mọi `{B}-api.md`. Bảng đủ 6 cột. Alien field (dùng trong §3 body nhưng không có row §5) = P0. Enum incomplete (dùng `...` / `TBD`) = P0. Cross-artifact drift với `{B}-events.md` / `{B}-data-model.md` = P0. BFF file `{B}-graphql.md` reference `See {B}-api.md §5` — KHÔNG lặp.

### 5.1. DTO fields

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Mã service order | `serviceOrderCode` | `serviceOrderCode: String!` | `serviceOrderCode: string` | `serviceOrderCode` | `KG.gf-sales.entities.ServiceOrder.code` |
| Trạng thái đơn | `status` | `status: ServiceOrderStatus!` | `status: ServiceOrderStatus` | `status` | `KG.gf-sales.entities.ServiceOrder.status` |

### 5.2. Enums (full values verbatim)

| Enum type | Values | Cite |
|---|---|---|
| `ServiceOrderStatus` | `NEW \| IN_PROGRESS \| COMPLETED \| CANCELLED` | `BR-SO-STATUS-001` §2:15 |

### 5.3. Path params

| Path param | Type | Canonical name (mọi tier) | Cite |
|---|---|---|---|
| `{serviceOrderId}` | Long | `serviceOrderId` — KHÔNG viết tắt thành `soId` ở tier khác | FEAT-SO-DETAIL §3:8 |

## 6. References

- HLD: [{{boundary}}-HLD.md](../hld/{{boundary}}-HLD.md)
- Events: [{{boundary}}-events.md](../events/{{boundary}}-events.md)
- ADR-XXX {{topic}}
- BR-XXX, BR-YYY

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-07 | v4 | **Doc-nav — Add §0 Wave Index skeleton (optional, mandatory once file > 3k dòng OR ≥ 2 wave sub-modules)**. Insert §0 sau tiêu đề, trước §1: bảng `Wave | Scope name | Sections | Endpoint ID range | Status | Ratified in` với Subagent RULE + Cascading rule. Backfill roadmap: `agg-garage-graph-graphql.md` + `gf-inventory-api.md` đã populate v40/v7.48; các file khác backfill khi vượt threshold. Pair với MANIFEST §5 Read scope column + `scripts/check-api-wave-index-drift.sh` warn-only + FM-020. v3 → v4. |
| 2026-07-04 | v3 | **v5 tune pair (author/review)** — (a) §3 rule: coverage → **COMPLETENESS** với 6 khối bắt buộc mỗi endpoint (Headers / Params / Request / Response 2xx / Response 4xx / Semantics + ≥1 JSON block); missing = G5 **P0** bumped từ P1. Skeleton `### METHOD path` expand đầy đủ 6 block. (b) **§5 Naming Registry** mới — 3 sub-section (5.1 DTO fields · 5.2 Enums · 5.3 Path params) — Reviewer G11 P0 nếu missing / alien field / enum incomplete / cross-artifact drift. §5 References renumber → §6. (c) §4 Forbidden thêm 2 anti-pattern naming. Root cause: W01/W02 endpoint body incomplete + naming drift cross-tier. Pair với `agent-arch-author v5` + `agent-arch-review v5`. |
| 2026-06-24 | v2 | Add §3 endpoint-detail coverage rule (Reviewer G5 enforce P1) — mọi row §2 Endpoint Summary phải có 1 detail sub-section §3; combined pair chỉ khi semantic identical. Per Delivery Authority 2026-06-24 preventive control (root cause: Inventory V2 R2 batch missed 16/23 endpoint details). |
| YYYY-MM-DD | v1 | Initial API |
