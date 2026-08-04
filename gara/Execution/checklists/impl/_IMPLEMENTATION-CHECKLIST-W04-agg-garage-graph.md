---
type: execution
artifact_kind: implementation-checklist
status: ACTIVE
version: 4
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
wave: "W04"
boundary: "agg-garage-graph"
checklist_source: "wave-spec + agg-garage-graph-graphql.md v7.59"
---

# Implementation Checklist — W04 · agg-garage-graph

> Source: `Execution/wave-specs/W04/Product/features/bff/FEAT-*.md` (9 file ACTIVE — 5 AP + 4 OB) + `PKG-W04-inventory-period-opening-balance.md` §2.2.3 + §4.1 + §5.1 + `Architecture/api/agg-garage-graph-graphql.md` **v7.59** §3e + §3g (canonical).
> Wave single-phase (BFF DAG single-step S5 — schema/resolver/service/enrichment/error-map/test).
> **Bounded read scope** per API Wave Index: `agg-garage-graph-graphql.md` v7.59 đọc `§0 + §3e + §3g + §5 Naming Registry` (mega file 47k dòng — FM-020).
>
> **Op count canonical (v7.59)**: 12 GraphQL op W04 = **6 AP** (§3e — AP-Q2..Q4 + AP-M1..M3; AP-Q1 removed v7.54) + **6 OB** (§3g — W04-Q1 + W04-M1..M5; W04-Q2 removed v7.47).
>
> **Discipline cross-cutting** (rules-bff + rules-graphql-gateway):
> - PassthroughService: KHÔNG persistence, KHÔNG business logic — chỉ orchestration + header propagation.
> - Module layout: `src/graphql/modules/<parent>/<child>/` với `<child>.{schema,resolver,service,types,enrichment}.ts` + `error-code-map.ts` + `index.ts` (precedent: `gf-accounting/settlements/`, `gf-inventory/catalog-v2/`).
> - KHÔNG log PII / password / JWT / api-key / card token.
> - Feature-flag `Inventory:InventoryV2` directive `@FeatureOn` resolver-level fail-fast 403 TRƯỚC forward BE (CR-20260707-02).
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

## Tasks

> Format: `- [ ] T{n} <mô tả tiếng Việt> · scope:<path/glob> · ac:<FEAT-AC> · review:<R*> · layer:<schema|resolver|service|enrichment|error-map|directive|test|kg>`
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/D* — shift-left).

### Module scaffold + schema

- [ ] T1 Scaffold module `gf-accounting/accounting-period` — tạo folder `src/graphql/modules/gf-accounting/accounting-period/` với `index.ts` (export schema+resolvers), `accounting-period.schema.ts`, `accounting-period.resolver.ts`, `accounting-period.service.ts` (extends PassthroughService), `accounting-period.types.ts`, `error-code-map.ts`; wire vào `src/graphql/modules/gf-accounting/index.ts` (merge với `settlements`, `insurance-dossiers`) · scope:`src/graphql/modules/gf-accounting/accounting-period/**`,`src/graphql/modules/gf-accounting/index.ts` · ac:`FEAT-AP-LIST-AC-1,FEAT-AP-CREATE-AC-1,FEAT-AP-DETAIL-AC-1,FEAT-AP-EDIT-AC-1,FEAT-AP-DELETE-AC-1` · review:`R1` · layer:`schema`
- [ ] T2 Scaffold module `gf-inventory/opening-balance` — tạo folder `src/graphql/modules/gf-inventory/opening-balance/` với `index.ts`, `opening-balance.schema.ts`, `opening-balance.resolver.ts`, `opening-balance.service.ts`, `opening-balance.types.ts`, `opening-balance.enrichment.ts` (mainUnitName + createdByName), `error-code-map.ts`; wire vào `src/graphql/modules/gf-inventory/index.ts` (merge với `catalog-v2`) · scope:`src/graphql/modules/gf-inventory/opening-balance/**`,`src/graphql/modules/gf-inventory/index.ts` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-IMPORT-AC-1,FEAT-OB-EDIT-AC-1,FEAT-OB-DELETE-LINES-AC-1` · review:`R1` · layer:`schema`
- [ ] T3 SDL §3e Accounting Period — khai báo **6 operation canonical**: query `searchAccountingPeriodTree(input: AccountingPeriodTreeSearchInput!): [AccountingPeriodTreeNode!]!` (AP-Q2), `getAccountingPeriod(id: ID!): AccountingPeriodDetail!` (AP-Q3), `checkAccountingPeriodLock(date: String!): AccountingPeriodLockCheckResult!` (AP-Q4); mutation `createAccountingPeriod(input): AccountingPeriodCreateResult!` (AP-M1), `updateAccountingPeriod(id, input): AccountingPeriod!` (AP-M2), `deleteAccountingPeriod(id): Boolean!` (AP-M3); types `AccountingPeriod` + `AccountingPeriodDetail` + `AccountingPeriodTreeNode` + `AccountingPeriodCreateResult { createdPeriod, generated: { created, skipped, skippedDetails[] } }` + `AccountingPeriodLockCheckResult` + input/filter khớp §3e.1 v7.59 (KHÔNG khai `searchAccountingPeriods`/`closeAccountingPeriod`/`reopenAccountingPeriod` — không tồn tại) · scope:`src/graphql/modules/gf-accounting/accounting-period/accounting-period.schema.ts`,`accounting-period.types.ts` · ac:`FEAT-AP-LIST-AC-1,FEAT-AP-CREATE-AC-1,FEAT-AP-DETAIL-AC-1,FEAT-AP-EDIT-AC-1,FEAT-AP-DELETE-AC-1` · review:`R1,R18` · layer:`schema`
- [ ] T4 SDL §3g Opening Balance — khai báo **6 operation canonical**: query `searchOpeningBalances(input: OpeningBalanceSearchInput!): PagedOpeningBalanceApiResponse!` (W04-Q1); mutation `verifyImportOpeningBalances(input: VerifyImportOpeningBalancesInput!): VerifyImportOpeningBalancesResultApiResponse!` (W04-M1), `importOpeningBalances(input, idempotencyKey: String!): ImportOpeningBalancesResultApiResponse!` (W04-M2), `updateOpeningBalanceLine(id: Int!, input): OpeningBalanceLineApiResponse!` (W04-M3), `deleteOpeningBalanceLine(id: Int!): DeleteOpeningBalanceLineResultApiResponse!` (W04-M4), `deleteOpeningBalanceLines(input): DeleteOpeningBalanceLinesResultApiResponse!` (W04-M5); types `OpeningBalanceLine` + `VerifyImportOpeningBalancesResult { totalRows, errorRows, canCommit, warningLockCheckUnavailable }` + `DeleteOpeningBalanceLinesResult { errorCode?, offendingIds? }` + `OpeningBalanceImportRow` carry cả canonical (`mainUnitCode`+`warehouseId`) và display fallback (`unitName`+`warehouseName`) per v7.56 note; KHÔNG khai `getOpeningBalanceTemplate` (removed v7.47, template FE bundled) · scope:`src/graphql/modules/gf-inventory/opening-balance/opening-balance.schema.ts`,`opening-balance.types.ts` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-IMPORT-AC-1,FEAT-OB-EDIT-AC-1,FEAT-OB-DELETE-LINES-AC-1` · review:`R1,R18` · layer:`schema`

### Service (passthrough) + endpoint registry

- [ ] T5 Service `accounting-period.service.ts` — extend PassthroughService, downstream `gf-accounting` qua `apiClient`; 6 endpoint: `POST /api/v2/accounting-periods/tree` (AP-Q2), `GET /api/v2/accounting-periods/{id}` (AP-Q3), `GET /protected/v1/accounting-periods/lock-check?date=` (AP-Q4 — S2S x-api-key), `POST /api/v2/accounting-periods` (AP-M1), `PUT /api/v2/accounting-periods/{id}` (AP-M2), `DELETE /api/v2/accounting-periods/{id}` (AP-M3); propagate `Authorization` + `X-Tenant-Id` + `X-Branch-Id` + `x-request-id`; centralize path vào `src/config/endpoints.ts` (KHÔNG string-concat trong resolver — rules-graphql-gateway) · scope:`src/graphql/modules/gf-accounting/accounting-period/accounting-period.service.ts`,`src/config/endpoints.ts` · ac:`FEAT-AP-LIST-AC-1,FEAT-AP-CREATE-AC-1,FEAT-AP-DETAIL-AC-1,FEAT-AP-EDIT-AC-1,FEAT-AP-DELETE-AC-1` · review:`R2,R16` · layer:`service`
- [ ] T6 Service `opening-balance.service.ts` — extend PassthroughService, downstream `gf-inventory` qua `apiClient`; 6 endpoint: `POST /api/v2/opening-balances/search` (W04-Q1), `POST /api/v2/opening-balances/verify-import` (W04-M1), `POST /api/v2/opening-balances/import` (W04-M2 — header `X-Idempotency-Key: {idempotencyKey}` format `OB-IMPORT-{tenantId}-{uuid}` ADR-022), `PUT /api/v2/opening-balances/{id}` (W04-M3), `DELETE /api/v2/opening-balances/{id}` (W04-M4), `POST /api/v2/opening-balances/delete-lines` (W04-M5); header propagation identical T5; payload JSON rows đã parse FE browser-side qua SheetJS per ADR-022 (KHÔNG multipart, KHÔNG binary `.xlsx` tại BFF/BE) · scope:`src/graphql/modules/gf-inventory/opening-balance/opening-balance.service.ts`,`src/config/endpoints.ts` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-IMPORT-AC-1,FEAT-OB-EDIT-AC-1,FEAT-OB-DELETE-LINES-AC-1` · review:`R2,R16` · layer:`service`

### Resolvers passthrough

- [ ] T7 Resolver Accounting Period — 6 operation passthrough map BE ↔ GraphQL; **AP-Q4 `checkAccountingPeriodLock` LRU cache 30s** key `(tenantId, date)` scope mandatory (defensive cross-tenant/cross-date leak per INTEG-EXT-gf-accounting §15); AP-Q3/AP-M1/AP-M2 enrich `createdByName`+`updatedByName` qua `enrichObjectWithByNames` helper (BFF-layer Pattern TENANT-USERS — call `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` với `{iamUserIds, tenantId từ JWT}`); AP-Q2 `parentName`+`parentBreadcrumb` từ backend response (recursive CTE — NULL fallback nếu backend thiếu, KHÔNG fan-out); passthrough error extension `code` verbatim từ backend; KHÔNG business logic · scope:`src/graphql/modules/gf-accounting/accounting-period/accounting-period.resolver.ts` · ac:`FEAT-AP-LIST-AC-1,FEAT-AP-CREATE-AC-1,FEAT-AP-DETAIL-AC-1,FEAT-AP-EDIT-AC-1,FEAT-AP-DELETE-AC-1` · review:`R2,R16` · layer:`resolver`
- [ ] T8 Resolver Opening Balance — 6 operation passthrough map BE ↔ GraphQL; W04-M5 `deleteOpeningBalanceLines(ids)` preserve fail-fast ordering per BR-OB-DEL-005 (`ERR-INV-024` báo trước → `ERR-INV-036` báo sau, "Mỗi id chỉ báo 1 mã lỗi") — BFF chỉ passthrough response từ gf-inventory, KHÔNG re-order / KHÔNG merge; W04-M1 `verifyImportOpeningBalances` empty-file → propagate `canCommit=false` + `warningLockCheckUnavailable=true` khi downstream 502/503 (ADR-021 fail-OPEN); W04-M2 `idempotencyKey` argument required → HTTP header `X-Idempotency-Key`; **defense-in-depth 500-row cap** cho W04-M1/W04-M2 tại BFF (`input.rows.length <= 500` → `extensions.code=ERR-INV-048` nếu vượt, ADR-022) · scope:`src/graphql/modules/gf-inventory/opening-balance/opening-balance.resolver.ts` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-IMPORT-AC-1,FEAT-OB-EDIT-AC-1,FEAT-OB-DELETE-LINES-AC-1` · review:`R2,R16` · layer:`resolver`

### Enrichment + tree-cap defense

- [ ] T9 Tree-cap defense `searchAccountingPeriodTree` (AP-Q2) — **MAX 500 nodes per tenant** (khớp §3e.3 v7.59); vượt → throw GraphQL error code `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` HTTP 413 với `hint: "Tenant có >500 kỳ kế toán — sử dụng filter năm (year) hoặc name LIKE cụ thể để narrow scope tree"`; R2 F2 fix: backend trả plain HTTP 413 no registry error code, BFF-only code là single point (KHÔNG reuse deprecated `ERR-INV-027`) · scope:`src/graphql/modules/gf-accounting/accounting-period/accounting-period.resolver.ts` · ac:`FEAT-AP-LIST-AC-1` · review:`R16` · layer:`resolver`
- [ ] T10 Enrichment `opening-balance.enrichment.ts` — 2 batch call riêng: (a) **`mainUnitName`** — batch collect distinct `mainUnitCode` từ `content[]` → `fetchAllUnits()` (reuse module-shared cache `catalog-v2.enrichment.ts` TTL 5min, key `UNIT::{tenantId}`) → map `mainUnitCode`→`mainUnitName`; fallback null nếu không có trong gf-erp-mdm `directory=UNIT` (KHÔNG throw, KHÔNG fan-out per-row); (b) **`createdByName`** — batch collect distinct `createdBy` từ `OpeningBalanceLine` response (W04-Q1 paged `content[]` qua `enrichArrayWithByNames`; W04-M3 return single qua `enrichObjectWithByNames`) → `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` với `{iamUserIds, tenantId từ JWT}` → map `createdBy`→`createdByName`; conditional call chỉ khi `createdBy` tồn tại VÀ JWT có `tenantId`; fallback null khi không match; KHÔNG có `updatedByName` (SDL `OpeningBalanceLine` không track `updatedBy` — snapshot pattern) · scope:`src/graphql/modules/gf-inventory/opening-balance/opening-balance.enrichment.ts` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-EDIT-AC-1` · review:`R2,R16` · layer:`enrichment`

### Feature-flag directive + error-code map

- [ ] T11 Feature-flag directive `@FeatureOn("Inventory:InventoryV2")` — **resolver-level fail-fast 403** TRƯỚC forward BE (per CR-20260707-02); extension code `ERR-CMN-007` (503 fail-CLOSED khi flag lookup unavailable); apply lên toàn bộ **12 op W04** (6 AP + 6 OB); check flag qua header propagate hoặc BFF-side cache (TTL ngắn); tái sử dụng feature-flag module hiện có (`src/graphql/modules/feature-flags/`) hoặc extend nếu chưa có directive · scope:`src/graphql/modules/feature-flags/**` (extend hoặc `src/graphql/common/directives/feature-on.directive.ts` nếu tạo mới) · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-LIST-AC-1` · review:`R16,R2` · layer:`directive`
- [ ] T12 Error-code map — 2 file riêng per module (precedent `catalog-v2/error-code-map.ts`):
  - `accounting-period/error-code-map.ts` — AP scope `ERR-INV-021..026` (period lifecycle passthrough per ADR-019 D2) + **`ERR-AP-001`** (BR-AP-016 immutable-field — NEW namespace dedicated cho AP domain sau khi `ERR-INV-032` collide với BR-OB-008 registry:130 per R2 F1 fix) + BFF-only `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (HTTP 413 tree cap defense T9) + `ERR-CMN-not-found` (HTTP 404) + `ERR-CMN-validation`
  - `opening-balance/error-code-map.ts` — OB scope `ERR-INV-{009,010,017,018,019,020,024,032,033,034,035,036,041,048}` (passthrough verbatim từ gf-inventory `§3b.3`) + `ERR-INV-036` invariant per ADR-020 (`deleteOpeningBalanceLines` fail-fast) + `ERR-INV-024` fail-CLOSED (503 AP lock-check unavailable per ADR-021)
  - Cross-cutting `ERR-CMN-007` (flag fail-CLOSED) tại directive layer T11
  - Tất cả map thành `extensions.code` chuẩn GraphQL · scope:`src/graphql/modules/gf-accounting/accounting-period/error-code-map.ts`,`src/graphql/modules/gf-inventory/opening-balance/error-code-map.ts` · ac:`FEAT-AP-DELETE-AC-1,FEAT-OB-DELETE-LINES-AC-1,FEAT-OB-IMPORT-AC-1` · review:`R16` · layer:`error-map`

### Auth + CORS + Naming Registry alignment

- [ ] T13 Auth + header propagation — verify context builder gate mọi resolver W04 (existing pattern trong `src/server.ts` + `src/middleware/`); propagate `Authorization` + `X-Tenant-Id` + `X-Branch-Id` + `x-request-id` downstream cả 2 service (T5/T6); CORS không dùng origin `*` production; **Naming Registry §5.1** verbatim per `gf-inventory-api.md §5.1 Opening Balance` — KHÔNG rename BFF-side (1 concept ↔ 1 canonical name) · scope:`src/server.ts`,`src/middleware/**` · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-LIST-AC-1` · review:`R16,R4` · layer:`resolver`

### Test + KG

- [ ] T14 Vitest unit tests ≥ 80% coverage (rules-bff mandate) — **12 operation resolver** passthrough correctness (happy path + BE 4xx/5xx propagate) + `error-code-map` exhaustive (AP+OB) + `@FeatureOn` directive 403 fail-CLOSED + tree-cap 500 defense + enrichment fallback null (UNIT không match + tenant-users không match) + LRU cache 30s AP-Q4 lock-check (tenant scope isolation); supertest cho W04-M1 empty-file propagate `canCommit=false`, W04-M2 `X-Idempotency-Key` header forward, W04-M5 fail-fast ordering (BR-OB-DEL-005); **coverage tool**: vitest c8/istanbul → `coverage/coverage-summary.json` per MANIFEST §4; **KHÔNG có test infra hiện tại** — cần add `vitest` + script `test` vào `package.json` nếu chưa có · scope:`src/graphql/modules/gf-accounting/accounting-period/**/*.test.ts`,`src/graphql/modules/gf-inventory/opening-balance/**/*.test.ts`,`package.json` · ac:`FEAT-OB-IMPORT-AC-1,FEAT-OB-DELETE-LINES-AC-1,FEAT-AP-DELETE-AC-1` · review:`R17,R18` · layer:`test`
- [ ] T15 Contract test — 12 GraphQL operation response shape khớp `agg-garage-graph-graphql.md` v7.59 §3e + §3g SDL (introspection + typed response); error extension shape khớp §5 Naming Registry; contract test cho envelope W04-M1 `VerifyImportOpeningBalancesInput.rows[]` + W04-M2 `rows[]` + `idempotencyKey: String!` argument (KHÔNG `Upload` scalar — payload JSON per ADR-022); verify `@FeatureOn` presence trên 12 op qua schema introspection · scope:`src/__tests__/contract/w04-inventory-period.contract.test.ts` (tạo mới nếu chưa có infra) · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-IMPORT-AC-1` · review:`R17,R1` · layer:`test`
- [ ] T16 KG `knowledge-graph.yaml` update — thêm 12 GraphQL operation (6 AP + 6 OB) + 2 module (accounting-period + opening-balance) + error-code map W04 + enrichment nodes (mainUnitName UNIT cache shared, createdByName ct-saas-tenant); `last_verified` + 3-in-1 version bump (version + last_reviewed + Change Log entry) · scope:`knowledge-graph.yaml` (bffs/agg-garage-graph root) · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-LIST-AC-1` · review:`R1` · layer:`kg`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:...]`
- [ ] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd bffs/agg-garage-graph && npm run build && npm run typecheck` pass; `npm run lint` clean
- [ ] Vitest pass + coverage ≥ 80% overall + 100% resolver coverage cho 12 op W04 (rules-bff + MANIFEST §4)
- [ ] SDL introspection clean; contract test khớp `agg-garage-graph-graphql.md` **v7.59** §3e (6 op) + §3g (6 op)
- [ ] Feature-flag `Inventory:InventoryV2` directive `@FeatureOn` verified fail-CLOSED 403 trên toàn bộ 12 op (CR-20260707-02)
- [ ] Tree-cap 500 nodes verified cho AP-Q2 `searchAccountingPeriodTree` (HTTP 413 `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE`)
- [ ] Enrichment fallback null verified (mainUnitName UNIT miss + createdByName tenant-users miss — KHÔNG throw)
- [ ] BR-OB-DEL-005 fail-fast ordering verified cho W04-M5 (`ERR-INV-024` trước → `ERR-INV-036` sau)
- [ ] `X-Idempotency-Key` header forward verified cho W04-M2 (format `OB-IMPORT-{tenantId}-{uuid}`)
- [ ] KHÔNG log PII / JWT / api-key / card token / full payload (rules-bff)
- [ ] KHÔNG persistence / KHÔNG business logic trong resolver (PassthroughService discipline)
- [ ] Naming Registry §5.1 verbatim — KHÔNG rename BFF-side
- [ ] 3-in-1 version bump trên artifact chạm (KG yaml + module SDL nếu apply)
- [ ] 0 boundary violations (`bash scripts/hooks/check-boundary.sh` exit 0)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority (/planning-wave 04 → Step 4.5) | Generated for W04/agg-garage-graph (source=wave-spec; 9 FEAT tier BFF files ACTIVE). 14 GraphQL op passthrough (8 AP §3e + 6 OB §3g). |
| 2026-07-08 | 2 | Delivery Authority (regen) | **Regen theo `agg-garage-graph-graphql.md` v7.54 canonical** — sửa 5 drift với API doc: (1) op count 14 → **12** (6 AP + 6 OB); (2) AP op names — remove phantom `accountingPeriods`/`accountingPeriodTree`/`closeAccountingPeriod`/`reopenAccountingPeriod`, add canonical `searchAccountingPeriodTree`/`getAccountingPeriod`/`checkAccountingPeriodLock` (AP-Q1 removed v7.54 per user quannn, AP-Q4 lock-check add với LRU cache 30s); (3) module path — `src/schema/` + `src/resolvers/` + `src/data-sources/` phantom → canonical `src/graphql/modules/<parent>/<child>/{schema,resolver,service,types,enrichment}.ts` (precedent `gf-accounting/settlements`, `gf-inventory/catalog-v2`); (4) tree-cap 1000 → **500 nodes** (v7.54 chốt); (5) feature-flag middleware/directive ambiguous → resolver-level `@FeatureOn` directive (CR-20260707-02). Add T10 enrichment (mainUnitName UNIT cache shared + createdByName ct-saas-tenant BFF-layer Pattern TENANT-USERS per v7.50/v7.53); add ERR-AP-001 namespace (R2 F1 fix collision với ERR-INV-032). Reorganize 14 task → 16 task grouped by layer (scaffold/schema/service/resolver/enrichment/directive/error-map/auth/test/kg). |
| 2026-07-08 | 4 | Delivery Authority | **Bump cross-ref agg-garage-graph-graphql.md v7.54 → v7.59** — current SSOT citation sync sau khi (a) HLD v13 cascade v7.54 AP-Q1 removal vào §1 callout (7→6 op AP, footer 30→29 & 36→35), (b) API doc bump v7.58→v7.59 vì §3g.5 arithmetic self-drift fix cascade (36→35 ops), (c) INTEG-FE v18 §3.6b UI mapping table cascade AP-Q1 removal. IMPL v3 vẫn cite v7.54 canonical (op-count baseline khi §3e chốt 6 op) — bump lên v7.59 để đồng nhất docs W04 về single current-SSOT version, tránh reader confusion khi cross-reference. Sửa 7 chỗ: `checklist_source` frontmatter (line 11) + `Source` note (line 16) + Bounded read scope (line 18) + Op count canonical header (line 20 — chỉ heading "v7.54" → "v7.59"; giữ "AP-Q1 removed v7.54" + "W04-Q2 removed v7.47" historical audit trail) + T3 SDL input filter (line 43 "v7.54" → "v7.59") + T9 Tree-cap (line 58) + T15 contract test (line 77) + Pre-handoff self-check (line 88). **KHÔNG đụng**: (1) tất cả historical references "AP-Q1 removed v7.54" / "v7.54 chốt 500 nodes" / "v7.54 canonical" trong Change Log v2 entry (line 105 — audit trail); (2) SDL type names + resolver semantics + endpoint paths (v7.58/v7.59 KHÔNG đụng SDL, chỉ §0 Wave Index + arithmetic footer); (3) T1..T16 task substance (chỉ update version cross-ref); (4) v3 Change Log entry (T6+T15 multipart cleanup). Pair với `agg-garage-graph-HLD.md v13` + `agg-garage-graph-graphql.md v7.59` + `INTEG-FE-garage-web-agg-garage-graph.md v18` + `agent-dev-agg-garage-graph.md § Wave block v7.59` (Group D batch). |
| 2026-07-08 | 3 | Delivery Authority | **Align T6 + T15 với FEAT-OB-IMPORT §2 canonical (ADR-022 JSON-rows model)** — bỏ mention `multipart/form-data upload via graphql-upload` khỏi T6 W04-M1/W04-M2 endpoints; bỏ `multipart upload contract (Upload scalar graphql-upload) test cho W04-M1/W04-M2` khỏi T15. Reason: FEAT-OB-IMPORT §2 chốt "**KHÔNG multipart file upload ở BFF** — FE parse `.xlsx` browser-side qua SheetJS rồi gửi JSON rows đã parse" per ADR-022; W04-Q2 `getOpeningBalanceTemplate` removed v7.47 (template → FE bundled asset), BE/BFF không bao giờ nhận binary `.xlsx`. Add clarifier "payload JSON rows đã parse FE browser-side per ADR-022 (KHÔNG multipart)" tại T6 trailing note; T15 contract test đổi sang envelope `VerifyImportOpeningBalancesInput.rows[]` + `idempotencyKey: String!` argument. KHÔNG đụng T1..T5, T7..T14, T16 hoặc pre-handoff self-check. |
