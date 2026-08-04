---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-INS-STL-CREATE.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-STL-CREATE"
source_feat_sha: "d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting", "gf-sales"]
modifies: []
change_type: "brownfield-enhancement"
graphql_ops:
  - "createInsuranceSettlement"
  - "getSettlementCreateContext"
paired_backend_feats: ["FEAT-INS-STL-CREATE"]
paired_fe_web_feats: ["FEAT-INS-STL-CREATE"]
paired_mobile_feats: ["FEAT-INS-STL-CREATE"]
authoring_inputs:
  kg_baseline_sha: ""
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "09510bdc75b246b0e83130758b24d071c75fe776087d21c92e3d5a68ded91d59"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-STL-CREATE.bff.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
last_updated: "2026-06-18"
---

# FEAT-INS-STL-CREATE (BFF): Tạo phiếu quyết toán bảo hiểm — BFF tier

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-STL-CREATE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting`, `gf-sales` |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 |
| Status | DRAFT |
| GraphQL ops | `createInsuranceSettlement`, `getSettlementCreateContext` |
| Cross-tier pair | BE: `FEAT-INS-STL-CREATE` \| Web: `FEAT-INS-STL-CREATE` \| Mobile: `FEAT-INS-STL-CREATE` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-STL-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-STL-CREATE.md`](../../../../../Product/features/FEAT-INS-STL-CREATE.md) |
| Source version | v6 |
| Source SHA | `d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` |
| Generated at | 2026-06-18T01:05:38+00:00 |

---

## 1. Mục đích nghiệp vụ

Kế toán / chủ garage cần đối chiếu chính xác phần phân bổ bảo hiểm — bao gồm các khoản điều chỉnh và số tiền BH thực trả — ngay trên màn Tạo phiếu quyết toán trước khi chốt, thay vì phải mở lại Phiếu dịch vụ để tra cứu. Feature này mở rộng luồng `FEAT-STL-CREATE` production bằng cách hiển thị panel "Tổng giá dịch vụ" read-only (3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) snapshot từ SO, và đảm bảo số liệu BH thanh toán được tính server-side rồi snapshot vào cặp phiếu QT khi xác nhận — giảm sai sót và loại bỏ thao tác đối chiếu ngoài hệ thống.

---

## 2. Trách nhiệm BFF (agg-garage-graph)

- **Expose hai GraphQL operation**: query `getSettlementCreateContext` (load màn Tạo phiếu QT kèm panel phân bổ BH read-only) và mutation `createInsuranceSettlement` (xác nhận tạo cặp phiếu QT); cả hai là passthrough thuần sang `gf-accounting` REST.
- **Passthrough discipline**: BFF KHÔNG tính toán hay validate phân bổ BH — toàn bộ số liệu (`breakdownByPayer`, 5 khoản điều chỉnh, `settlementBalance`, cờ `soHasInsurance`) lấy từ `gf-accounting` response; BFF chỉ map sang GraphQL type.
- **Downstream REST consumed**:
  - `GET /api/v1/settlement-create-context?serviceOrderCode={code}` — `gf-accounting` (load panel phân bổ + context tạo QT).
  - `POST /api/v1/settlements` — `gf-accounting` (xác nhận tạo cặp phiếu QT atomic).
- **Auth header propagation**: mọi resolver forward `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream.
- **RBAC**: chỉ persona `accountant` và `garage-owner` được phép gọi mutation `createInsuranceSettlement`; query `getSettlementCreateContext` cũng yêu cầu JWT với role hợp lệ.
- **N+1 guard**: `getSettlementCreateContext` là single-entity query (per SO code) — không cần DataLoader; mutation không batch.
- **Error mapping**: downstream HTTP error (4xx/5xx từ `gf-accounting`) được map sang GraphQL extension code tương ứng; BFF KHÔNG swallow lỗi.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Load màn Tạo phiếu QT với panel phân bổ BH

#### AC-1 → BFF phải expose query để FE/Mobile load context màn Tạo phiếu QT từ SO hoàn thành

- **Khi**: FE/Mobile gọi query `getSettlementCreateContext(serviceOrderCode: String!)`.
- **BFF phải**: passthrough sang `gf-accounting` `GET /api/v1/settlement-create-context?serviceOrderCode={code}`, forward `X-Tenant-Id` + `Authorization`, map response sang type `SettlementCreateContext`.
- **Downstream**: `GET /api/v1/settlement-create-context?serviceOrderCode=<code>` — `gf-accounting` (BE FEAT-INS-STL-CREATE §6.1).
- **Output shape**: `SettlementCreateContext` (xem §5.1) bao gồm `soHasInsurance: Boolean!`, field `insuranceAdjustment: InsuranceAdjustmentPanel`.
- **Failure mode**: `gf-accounting` trả 404 (SO không tồn tại hoặc chưa COMPLETED) → GraphQL error extension `NOT_FOUND`; 403 → `FORBIDDEN`.
- **Ref**: op `getSettlementCreateContext` (§6.1), resolver `src/resolvers/settlement/getSettlementCreateContext.ts` (§6.2).

#### AC-2 → BFF trả cờ soHasInsurance để FE/Mobile render có điều kiện panel "Tổng giá dịch vụ"

- **Khi**: FE/Mobile nhận response `getSettlementCreateContext`.
- **BFF phải**: map field `soHasInsurance: Boolean!` từ `gf-accounting` response; khi `soHasInsurance = false`, field `insuranceAdjustment` trả `null` (không render section phân bổ BH).
- **Downstream**: cùng endpoint AC-1 — field `soHasInsurance` có trong response JSON của `gf-accounting`.
- **Output shape**: `SettlementCreateContext.soHasInsurance: Boolean!`.
- **Failure mode**: field missing từ BE → BFF trả default `false` + log warning (KHÔNG throw error).
- **Ref**: op `getSettlementCreateContext` (§6.1); paired BE FEAT-INS-STL-CREATE §3 AC-2.

#### AC-3 → BFF expose bảng "Chi tiết theo bên thanh toán" — breakdownByPayer — trong panel phân bổ BH

- **Khi**: `soHasInsurance = true` trong response `getSettlementCreateContext`.
- **BFF phải**: map nested object `breakdownByPayer` từ `gf-accounting` response sang type `BreakdownByPayer` (2 cột: BH + KH, mỗi cột có `subtotalBeforeVat`, `vatAmount`, `totalAfterVat`).
- **Downstream**: field `breakdownByPayer` trong response `gf-accounting` `GET /api/v1/settlement-create-context`.
- **Output shape**: `InsuranceAdjustmentPanel.breakdownByPayer: BreakdownByPayer` (xem §5.1).
- **Failure mode**: field null từ BE khi `soHasInsurance = true` → BFF propagate null; FE hiển thị placeholder.
- **Ref**: op `getSettlementCreateContext` (§6.1); paired BE FEAT-INS-STL-CREATE §3 AC-3.

#### AC-4 → BFF expose section "Phân bổ Bảo hiểm" — 5 khoản điều chỉnh — chỉ khi SO có BH

- **Khi**: `soHasInsurance = true`, FE/Mobile đọc field `adjustments` trong `InsuranceAdjustmentPanel`.
- **BFF phải**: passthrough array 5 khoản điều chỉnh BH từ `gf-accounting` response (`insuranceLinkedDiscountParts`, `insuranceLinkedDiscountServices`, `compensationDeduction`, `depreciationDeduction`, `insuranceDeductible`) sang type `InsuranceAdjustmentItem[]`.
- **Downstream**: array `adjustments` trong `gf-accounting` response.
- **Output shape**: `InsuranceAdjustmentPanel.adjustments: [InsuranceAdjustmentItem!]!` (xem §5.1).
- **Failure mode**: array empty hoặc null khi `soHasInsurance = true` → BFF propagate; FE hiển thị 0 hàng.
- **Ref**: op `getSettlementCreateContext` (§6.1); paired BE FEAT-INS-STL-CREATE §3 AC-4.

#### AC-5 → BFF expose khối "Cân thanh toán" — settlementBalance — trong panel phân bổ BH

- **Khi**: `soHasInsurance = true`, FE/Mobile đọc `settlementBalance` trong `InsuranceAdjustmentPanel`.
- **BFF phải**: map object `settlementBalance` từ `gf-accounting` (gồm `insurancePays`, `customerPays`, `totalPays`).
- **Downstream**: field `settlementBalance` trong `gf-accounting` response.
- **Output shape**: `InsuranceAdjustmentPanel.settlementBalance: SettlementBalance!` (xem §5.1).
- **Failure mode**: null từ BE → BFF propagate null.
- **Ref**: op `getSettlementCreateContext` (§6.1); paired BE FEAT-INS-STL-CREATE §3 AC-5.

#### AC-6 → BFF map trường "Tổng tiền bảo hiểm trả" read-only (computed server-side)

- **Khi**: FE/Mobile render trường "Tổng tiền bảo hiểm trả" trên màn Tạo phiếu QT.
- **BFF phải**: expose field `settlementBalance.insurancePays: Long!` từ `gf-accounting` response — đây là giá trị computed server-side, read-only; BFF KHÔNG nhận input tay cho field này từ FE.
- **Downstream**: giá trị `insurancePays` trong `settlementBalance` từ `gf-accounting`.
- **Output shape**: field trong `SettlementBalance.insurancePays: Long!`.
- **Failure mode**: N/A — field là subset của AC-5; nếu null → BFF propagate.
- **Ref**: op `getSettlementCreateContext` (§6.1); CNF-INS-001 (resolved — không nhận nhập tay bên BH).

### Cluster B — Xác nhận tạo cặp phiếu quyết toán

#### AC-7 → BFF expose mutation createInsuranceSettlement để xác nhận tạo cặp phiếu QT + snapshot phân bổ

- **Khi**: FE/Mobile gọi mutation `createInsuranceSettlement(input: CreateInsuranceSettlementInput!)` sau khi người dùng bấm "Xác nhận".
- **BFF phải**: passthrough sang `gf-accounting` `POST /api/v1/settlements` với body map từ input, forward tất cả auth header; BFF KHÔNG tính toán snapshot — `gf-accounting` BE thực hiện snapshot phân bổ atomic.
- **Downstream**: `POST /api/v1/settlements` — `gf-accounting` (BE FEAT-INS-STL-CREATE §6.2); atomic tạo cặp phiếu QT KH + BH + snapshot phân bổ.
- **Output shape**: `CreateInsuranceSettlementPayload` gồm `customerSettlementCode: String!`, `insuranceSettlementCode: String!`, `status: SettlementStatus!`.
- **Failure mode**: `gf-accounting` lỗi 409 (SO đã có QT) → extension `CONFLICT`; 422 (validation fail) → extension `VALIDATION_ERROR` kèm `details`; 500 → `INTERNAL_ERROR`. BFF KHÔNG retry mutation.
- **Ref**: op `createInsuranceSettlement` (§6.1), resolver `src/resolvers/settlement/createInsuranceSettlement.ts` (§6.2); paired BE FEAT-INS-STL-CREATE §6.2.

#### AC-8 → BFF enforce RBAC — chỉ accountant + garage-owner được tạo phiếu QT

- **Khi**: bất kỳ caller nào gọi `createInsuranceSettlement` hoặc `getSettlementCreateContext`.
- **BFF phải**: verify JWT `Authorization` header hợp lệ + extract `role` claim; REJECT nếu role không thuộc `[ACCOUNTANT, GARAGE_OWNER]` với extension `FORBIDDEN` trước khi forward downstream.
- **Downstream**: KHÔNG gọi downstream nếu RBAC fail.
- **Output shape**: GraphQL error extension `{ code: "FORBIDDEN", message: "..." }`.
- **Failure mode**: thiếu JWT → `UNAUTHENTICATED`.
- **Ref**: `src/auth/settlementGuard.ts` (§7); paired BE FEAT-INS-STL-CREATE §4 BR-INS-STL-CRE-008.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver (`getSettlementCreateContext`, `createInsuranceSettlement`) forward đầy đủ: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`.
- JWT verify per request (role claim extraction cho RBAC AC-8).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- `getSettlementCreateContext` là single-entity query (per SO code) — resolver gọi 1 REST call duy nhất; không có N+1 risk.
- `createInsuranceSettlement` là single mutation — không batch.
- Không áp `@cacheControl` cho mutation; query `getSettlementCreateContext` không cache (dữ liệu realtime từ SO trước khi xác nhận tạo QT — caching sẽ gây stale display).

### 4.3 Security + data exposure

- KHÔNG log `Authorization` header, JWT claims, hay bất kỳ PII (tên khách hàng, số hợp đồng BH) trong resolver log.
- `X-Tenant-Id` lấy từ JWT claim, KHÔNG từ GraphQL argument do client kiểm soát.
- BFF KHÔNG expose endpoint quản lý phân bổ BH nào ngoài 2 operation trên (passthrough discipline).

### 4.4 Contract stability

- Schema additive only. Nếu cần rename field → `@deprecated(reason: "...")` giữ field cũ tối thiểu 1 wave.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (gf-accounting) | GraphQL error extension code | Source AC |
|---|---|---|
| HTTP 404 (SO not found / not COMPLETED) | `NOT_FOUND` | AC-1 |
| HTTP 403 | `FORBIDDEN` | AC-8 |
| HTTP 401 | `UNAUTHENTICATED` | AC-8 |
| HTTP 409 (settlement already exists) | `CONFLICT` | AC-7 |
| HTTP 422 (validation error) | `VALIDATION_ERROR` | AC-7 |
| HTTP 500 | `INTERNAL_ERROR` | AC-7 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields key | Breaking? | AC ref |
|---|---|---|---|---|
| `SettlementCreateContext` | type | `serviceOrderCode: String!`, `soHasInsurance: Boolean!`, `insuranceAdjustment: InsuranceAdjustmentPanel` | NO (new) | AC-1, AC-2 |
| `InsuranceAdjustmentPanel` | type | `breakdownByPayer: BreakdownByPayer`, `adjustments: [InsuranceAdjustmentItem!]!`, `settlementBalance: SettlementBalance` | NO (new) | AC-3, AC-4, AC-5 |
| `BreakdownByPayer` | type | `insurance: PayerColumn!`, `customer: PayerColumn!` | NO (new) | AC-3 |
| `PayerColumn` | type | `subtotalBeforeVat: Long!`, `vatAmount: Long!`, `totalAfterVat: Long!` | NO (new) | AC-3 |
| `InsuranceAdjustmentItem` | type | `itemKey: String!`, `label: String!`, `amount: Long!`, `mode: AdjustmentMode` | NO (new) | AC-4 |
| `AdjustmentMode` | enum | `PERCENT`, `AMOUNT` | NO (new) | AC-4 |
| `SettlementBalance` | type | `insurancePays: Long!`, `customerPays: Long!`, `totalPays: Long!` | NO (new) | AC-5, AC-6 |
| `CreateInsuranceSettlementInput` | input | `serviceOrderCode: String!` | NO (new) | AC-7 |
| `CreateInsuranceSettlementPayload` | type | `customerSettlementCode: String!`, `insuranceSettlementCode: String!`, `status: SettlementStatus!` | NO (new) | AC-7 |

> `SettlementStatus` enum (existing từ W01 baseline) — reuse, không tạo mới.

### 5.2 Modified types (additive — backward-compat)

Không có type hiện hữu nào bị sửa trong scope W02 Phase A FEAT-INS-STL-CREATE. Các type mới ở §5.1 là hoàn toàn additive.

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `getSettlementCreateContext` | query | `serviceOrderCode: String!` | `SettlementCreateContext` | JWT + X-Tenant-Id + X-Branch-Id | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |
| `createInsuranceSettlement` | mutation | `input: CreateInsuranceSettlementInput!` | `CreateInsuranceSettlementPayload!` | JWT + X-Tenant-Id + X-Branch-Id | AC-7, AC-8 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `getSettlementCreateContext` | `src/resolvers/settlement/getSettlementCreateContext.ts` | `FEAT-INS-STL-CREATE` (BE §6.1) | `GET /api/v1/settlement-create-context?serviceOrderCode=<code>` | N/A (single) | AC-1..6 |
| `createInsuranceSettlement` | `src/resolvers/settlement/createInsuranceSettlement.ts` | `FEAT-INS-STL-CREATE` (BE §6.2) | `POST /api/v1/settlements` | N/A (mutation) | AC-7, AC-8 |

### 6.3 DataLoader / batching strategy

Không cần DataLoader cho feature này: cả hai operation đều là single-entity (per SO code) — không có nested list resolution dẫn đến N+1.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `getSettlementCreateContext` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | Dữ liệu realtime trước khi xác nhận; KHÔNG cache để tránh stale panel phân bổ |
| `createInsuranceSettlement` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | Mutation — không cache |

### 6.5 Persisted query allowlist

NEED CONFIRMATION: Cần xác nhận với Architecture Authority liệu W02 bật persisted query allowlist cho production hay vẫn dùng dynamic query (pattern W01). Nếu bật → hash của `getSettlementCreateContext` và `createInsuranceSettlement` phải được thêm vào allowlist trước deploy.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/settlement.graphql` | MODIFY (additive) | extend SDL — thêm types §5.1 + 2 ops §6.1 | ~60 | AC-1..8 |
| `resolvers/` | `src/resolvers/settlement/getSettlementCreateContext.ts` | NEW | resolver passthrough pattern | ~50 | AC-1..6 |
| `resolvers/` | `src/resolvers/settlement/createInsuranceSettlement.ts` | NEW | resolver passthrough pattern | ~40 | AC-7, AC-8 |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | ADDITIVE | 2 method mới: `getSettlementCreateContext()` + `createSettlement()` | ~40 | AC-1..7 |
| `auth/` | `src/auth/settlementGuard.ts` | MODIFY (additive) | thêm guard check cho 2 op mới | ~15 | AC-8 |
| `tests/integration` | `tests/integration/settlement-ins-create.test.ts` | NEW | apollo test client | ~90 | AC-1..8 |
| `tests/contract` | `tests/contract/settlement-ins-create-contract.test.ts` | NEW | schema contract snapshot | ~40 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (BE FEAT-INS-STL-CREATE integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: gf-accounting REST endpoints stable)
         │
         ▼
S5-1  Extend SDL settlement.graphql (new types §5.1 + 2 ops §6.1)
         │
         ▼
S5-2  Implement GfAccountingDataSource methods
         │
         ▼
S5-3  Implement resolvers (getSettlementCreateContext + createInsuranceSettlement)
         │  (auth guard wired trong bước này)
         ▼
S5-4  BFF contract test + integration test green
         │
         └─► (hand-off FE-web S6 + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5-1 | Extend SDL | `schema/settlement.graphql` | BE FEAT §6 endpoints documented | Schema compiles | — |
| S5-2 | DataSource methods | `data-sources/GfAccountingDataSource.ts` | S5-1 done | Methods unit test pass | S5-1 |
| S5-3 | Resolvers + auth guard | `resolvers/settlement/` + `auth/settlementGuard.ts` | S5-2 done | Resolver integration test pass | S5-2 |
| S5-4 | Contract + integration test | `tests/` | S5-3 done | Contract test green, N+1 check pass | S5-3 |

---

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là `gf-accounting` BE territory). BFF chỉ enforce auth context, RBAC, passthrough discipline, schema constraints.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INS-STL-CRE-008` | CORNERSTONE | RBAC guard — chỉ `ACCOUNTANT`/`GARAGE_OWNER` | `src/auth/settlementGuard.ts` | AC-8 | KHÔNG forward downstream nếu role fail |
| `BR-INS-STL-CRE-003` | NORMAL | Read-only field — BFF KHÔNG nhận input tay cho `insurancePays` | resolver `createInsuranceSettlement.ts` | AC-6, AC-7 | computed server-side tại BE |
| `TENANT-ISOLATION` | CORNERSTONE | `X-Tenant-Id` từ JWT, KHÔNG từ arg | mọi resolver | AC-1..8 | Critical Rule #4 |

> **Primary BR enforcement** (BR-INS-STL-CRE-001..009, CNF-INS-001..003) = BE tier. Xem `features/be/FEAT-INS-STL-CREATE.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration (resolver → BE) | test-api | mock gf-accounting endpoint, verify request headers forwarded |
| AC-2 | BFF contract (schema — `soHasInsurance` field) | test-api | snapshot SDL field type Boolean! |
| AC-3 | BFF integration (`breakdownByPayer` mapping) | test-api | mock BE trả 2-cột BH+KH, verify mapping sang `BreakdownByPayer` |
| AC-4 | BFF integration (5 khoản `adjustments` array) | test-api | mock BE trả array 5 items, verify `InsuranceAdjustmentItem[]` mapping |
| AC-5 | BFF integration (`settlementBalance` mapping) | test-api | mock BE trả balance object, verify `SettlementBalance` mapping |
| AC-6 | BFF contract (`settlementBalance.insurancePays` read-only) | test-api | verify mutation input KHÔNG có field `insurancePays` |
| AC-7 | BFF integration (mutation passthrough + payload) | test-api | mock `POST /api/v1/settlements`, verify payload + error mapping 409/422/500 |
| AC-8 | BFF auth (RBAC) | test-isolation | dual persona: `ACCOUNTANT` pass, `TECHNICIAN` blocked với FORBIDDEN |
| — | N+1 guard | test-api | verify single REST call per `getSettlementCreateContext` |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-STL-CREATE.md` | DRAFT (expected) | Downstream REST endpoints §6.1-§6.2 — BFF resolver wrap; BFF S5 entry depends on BE S4 |
| FE Web | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-STL-CREATE.md` | DRAFT (expected) | Consume `getSettlementCreateContext` query + `createInsuranceSettlement` mutation từ §6.1 |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-STL-CREATE.md` | DRAFT (expected) | Consume cùng GraphQL ops từ §6.1 |

**Source ID consistency** (item 18): `source_feat_sha` = `d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` — identical với BE/FE/Mobile tier files.

---

## 12. References

- **Source**: [`Product/features/FEAT-INS-STL-CREATE.md`](../../../../../Product/features/FEAT-INS-STL-CREATE.md) v6
- **Paired BE**: [`features/be/FEAT-INS-STL-CREATE.md`](../be/FEAT-INS-STL-CREATE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **ADR-016**: BFF là orchestrator xuất hồ sơ (Phase B); Phase A BFF chỉ passthrough settlement create.
- **ADR-015**: gf-accounting là SSOT số liệu phân bổ BH; BFF KHÔNG replicate.
- **PKG**: [`PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **BR file**: `Product/rules/BR-EP-INSURANCE-SETTLEMENT.md` — BR-INS-STL-CRE-001..009.

---

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260612-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260612-02--ins-so-complete-popup-negative-bh-warn) | Popup hoàn thành SO cảnh báo Tổng BH âm | APPROVED | Pass-through `insurancePaymentNegative` flag qua SDL |
| [CR-20260616-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column) | Panel "Tổng giá dịch vụ" 2 cột (BH \| KH) | APPROVED | SDL delta per-payer schema |
| [CR-20260618-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all) | Sinh phiếu QT KH khi BH 100% + KH chịu phân bổ | APPROVED | Orchestrate dual-voucher response |

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-INS-STL-CREATE` W02 Phase A. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF passthrough discipline, §3 BFF behaviour map 8 AC-IDs, §4 auth+perf+security+error mapping, §5 SDL types mới (InsuranceAdjustmentPanel + 8 types), §6 2 ops (getSettlementCreateContext + createInsuranceSettlement) + resolver mapping, §7 file impact map, §8 S5 DAG, §9 BR secondary, §10 test hand-off, §11 cross-tier refs. Source FEAT chỉ audit. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | REFINE — fix reviewer #18c: replace §1 "Mục đích nghiệp vụ" với canonical wording byte-equal từ BE tier. Bump version 1 → 2. |
| 2026-06-22 | 3 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 3 CR liên quan tier BFF: CR-20260612-02, CR-20260616-02, CR-20260618-01. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
