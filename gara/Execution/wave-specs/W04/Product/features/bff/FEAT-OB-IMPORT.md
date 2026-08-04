---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-OB-IMPORT.md"
source_version: 20
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-IMPORT"
source_feat_sha: "a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8"
generated_at: "2026-07-08T00:00:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["verifyImportOpeningBalances", "importOpeningBalances"]
paired_backend_feats: ["FEAT-OB-IMPORT"]
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "29aa42e1a902864edb2449b59fc1f7419dc0ee8a1bca7a79e7bc368d176208bd"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NEED CONFIRMATION — không đọc được _routing/FEAT-FAN-OUT-MAP.yaml (chưa tồn tại tại thời điểm author W04 BFF)"
  template_sha: "NEED CONFIRMATION — author session không có tool hash"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-IMPORT (BFF): Import tồn đầu kỳ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-IMPORT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `verifyImportOpeningBalances` (mutation), `importOpeningBalances` (mutation) |
| Cross-tier pair | BE: `FEAT-OB-IMPORT` \| Web: — \| Mobile: — (mobile scope chỉ view-only list, không import — §3g.4) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-IMPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-IMPORT.md`](../../../../../Product/features/FEAT-OB-IMPORT.md) |
| Source version | v20 |
| Source SHA | `a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8` |
| Generated at | 2026-07-08T04:51:55+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần thiết lập nhanh số lượng và giá trị tồn kho khởi đầu (theo mã sản phẩm nội bộ + kho + ngày) khi đưa hệ thống quản lý tồn kho vào vận hành, thay vì nhập tay từng dòng. Tính năng cho phép nhập hàng loạt qua file mẫu `.xlsx`, có bước kiểm tra dữ liệu trước khi ghi để tránh sai lệch số dư đầu kỳ — vì tồn đầu kỳ là điểm mốc gốc cho mọi tính toán tồn kho về sau. Đây là bước khởi tạo dữ liệu nền tảng cho toàn bộ luồng quản lý kho (nhập/xuất/kiểm kê) của epic `EP-INVENTORY-OPENING-BALANCE`.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 GraphQL mutation mới: `verifyImportOpeningBalances` (preview validate — đọc, không ghi) và `importOpeningBalances` (commit all-or-nothing — có ghi).
- Resolver pattern: **pure passthrough** (không business logic tại BFF) — forward toàn bộ payload rows (đã parse `.xlsx` browser-side ở FE, KHÔNG có multipart file upload ở BFF) xuống `gf-inventory` REST tương ứng; chỉ có 1 defense-in-depth check tại BFF (cap 500 rows).
- Downstream BE endpoints: `POST /api/v2/opening-balances/verify-import` (W04-3) và `POST /api/v2/opening-balances/import` (W04-4) trên boundary `gf-inventory`.
- Không cần DataLoader/batching — mỗi mutation là 1 lời gọi downstream duy nhất, không có N+1 fan-out.
- Không cache — cả 2 op đều là mutation (verify là read-only nhưng vẫn mutation semantics do input lớn/side-effect-free preview, không cacheable theo Apollo cache hint).
- Propagate header `Authorization`, `X-Tenant-Id`, `x-request-id` xuống downstream; forward `idempotencyKey` argument của `importOpeningBalances` thành HTTP header `X-Idempotency-Key`.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage: 10/10 AC (bao gồm AC-3b từ source FEAT — bundle §C liệt kê 9 AC chính, source thực tế còn AC-3b).

### Cluster A — Mở màn, tải template, chọn file (FE local — BFF không touch)

#### AC-1 → N/A (xem fe-web/ tier file)

- Mở màn import là FE local UI navigation (route + layout). BFF không expose op riêng cho hành động này.

#### AC-2 → N/A (xem fe-web/ tier file)

- Link tải template `.xlsx` là **FE bundled static asset** (per ADR-022 — BA/PO chốt 2026-07-06, thay đề xuất `GET /api/v2/opening-balances/template` ban đầu). GraphQL op `getOpeningBalanceTemplate` đã bị xoá khỏi schema (W04-Q2 removed 2026-07-06 — xem `agg-garage-graph-graphql.md §3g.6` skip note). BFF **KHÔNG** expose endpoint download template.

#### AC-3 → N/A (xem fe-web/ tier file)

- Chọn file + parse `.xlsx` **chỉ browser-side (SheetJS)** per ADR-022 — BE/BFF không bao giờ nhận binary `.xlsx`. FE chỉ gửi JSON rows đã parse tới BFF ở bước AC-4/AC-5 (verify).

#### AC-3b → BFF phải enforce defense-in-depth cap 500 dòng (1 trong 3 tầng)

- **Khi**: FE gọi mutation `verifyImportOpeningBalances` với `input.rows.length > 500` (bypass FE first-check, hoặc `input.rows` rỗng).
- **BFF phải**: resolver validate `input.rows.length <= 500` **trước khi forward** downstream — vi phạm → reject ngay tại BFF với `extensions.code = ERR-INV-048`, KHÔNG gọi xuống `gf-inventory`.
- **Downstream**: không gọi (short-circuit tại BFF layer).
- **Output shape**: GraphQL `ErrorResponse` union hoặc top-level `errors[]` với `extensions.code = ERR-INV-048`.
- **Failure mode**: `ERR-INV-048` — FE hiển thị "Vượt giới hạn 500 dòng/lần import — vui lòng tách file". BE cũng re-check cùng mã lỗi (defense-in-depth tầng 3) nếu BFF bị bypass.
- **Ref**: op `verifyImportOpeningBalances` (§6.1), resolver discipline `agg-garage-graph-graphql.md §3g.3` bullet 2, paired BE FEAT-OB-IMPORT §6 (W04-3).
- **Note**: extension-mismatch (không phải `.xlsx`) và file-rỗng là FE-only check (không có mã lỗi Product-registered) — BFF không có behaviour riêng cho 2 case này.

### Cluster B — Preview / kiểm tra dữ liệu

#### AC-4 → BFF phải expose contract trả tổng quan (Tổng cộng/Hợp lệ/Lỗi + danh sách kho)

- **Khi**: FE gọi mutation `verifyImportOpeningBalances(input: VerifyImportOpeningBalancesInput!)` với `fileName`, `fileChecksum`, `rows[]` (raw values chưa resolve ID).
- **BFF phải**: passthrough JSON body xuống `POST /api/v2/opening-balances/verify-import` (W04-3); trả nguyên response envelope (không transform field).
- **Downstream**: `gf-inventory POST /api/v2/opening-balances/verify-import` (W04-3, `gf-inventory-api.md §3b.2`).
- **Output shape**: `VerifyImportOpeningBalancesResult { totalRows, validRows, errorRows, warehousesInFile[], previewLines[], canCommit, warningLockCheckUnavailable }` — FE dùng `totalRows/validRows/errorRows` render 3 thẻ, `warehousesInFile[]` render "Kho áp dụng".
- **Failure mode**: `ERR-CMN-validation` (checksum/asOfDate malformed); `warningLockCheckUnavailable: true` khi gf-accounting lock-check 502/503 (ADR-021 fail-OPEN verify marker) — KHÔNG throw GraphQL error, chỉ set flag trong payload để FE disable nút Xác nhận.
- **Ref**: op `verifyImportOpeningBalances` (§6.1), SDL `VerifyImportOpeningBalancesResult` (§5.1), paired BE §6 (W04-3).

#### AC-5 → BFF phải passthrough per-row status + mã lỗi chi tiết

- **Khi**: response `verifyImportOpeningBalances` trả về.
- **BFF phải**: forward nguyên `previewLines[] { rowNumber, status (VALID|ERROR), resolvedProductCode, resolvedWarehouseCode, errors[] { code, field, message } }` — KHÔNG rút gọn hay đổi mã lỗi (contract đầy đủ cho FE map sang wording rút gọn theo Figma).
- **Downstream**: cùng call W04-3 ở AC-4 (1 response phục vụ cả AC-4 + AC-5).
- **Output shape**: `OpeningBalancePreviewLine[]` với `PreviewLineError { code, field, message }`.
- **Failure mode**: mã lỗi per-row đúng 1 trong `ERR-INV-{009,010,017,018,019,020,024,032,033,034,035,036}` — reuse verbatim từ `gf-inventory-api.md §3b.3`, BFF không tạo mã lỗi mới.
- **Ref**: op `verifyImportOpeningBalances` (§6.1), SDL `OpeningBalancePreviewLine`/`PreviewLineError` (§5.1), §4.5 error mapping.

### Cluster C — Xác nhận import (all-or-nothing)

#### AC-6 → BFF phải expose mutation commit với idempotency-key bắt buộc

- **Khi**: FE gọi mutation `importOpeningBalances(input: VerifyImportOpeningBalancesInput!, idempotencyKey: String!)` sau khi `verifyImportOpeningBalances` trả `canCommit: true`.
- **BFF phải**: (a) re-validate cap 500 rows tại BFF (defense-in-depth tầng 2, giống AC-3b); (b) forward `input` xuống `POST /api/v2/opening-balances/import` (W04-4) KÈM header `X-Idempotency-Key: {idempotencyKey}` bắt buộc (không optional); (c) trả nguyên response — BE tự enforce all-or-nothing (single `@Transactional`) + cascade sổ tồn (`StockLedgerRecomputeService`), BFF không có business logic all-or-nothing riêng.
- **Downstream**: `gf-inventory POST /api/v2/opening-balances/import` (W04-4, header `X-Idempotency-Key`).
- **Output shape**: `ImportOpeningBalancesResult { totalRows, importedRows, importedAt, importedBy, fileName, fileChecksum, alreadyImported, cascadedKeys[] }`.
- **Failure mode**: có bất kỳ dòng lỗi nào → BE reject toàn bộ, không ghi dòng nào — surface qua `ERR-INV-{009,010,017,018,019,020,032,033,034,035,036}` (per-row) hoặc file-level; `ERR-INV-024` (kỳ đã đóng, authoritative re-check); `ERR-INV-036` (cascade âm tồn); `ERR-CMN-007` HTTP 503 khi gf-accounting lock-check unreachable (fail-CLOSED commit-path per ADR-021).
- **Ref**: op `importOpeningBalances` (§6.1), resolver mapping (§6.2), SDL `ImportOpeningBalancesResult`/`StockLedgerCascadeAudit` (§5.1), paired BE §6 (W04-4), §4.5 error mapping.

### Cluster D — Kết quả, huỷ bỏ, phân quyền

#### AC-7 → N/A (xem fe-web/ tier file)

- Huỷ bỏ là FE local navigation (đóng màn, quay về `FEAT-OB-LIST`) — không gọi GraphQL op nào.

#### AC-8 → BFF phải trả đủ field cho FE render toast + audit

- **Khi**: `importOpeningBalances` trả `success: true`.
- **BFF phải**: trả `importedRows`, `importedAt`, `importedBy`, `fileName`, `fileChecksum` trong `ImportOpeningBalancesResult` để FE hiển thị toast "Tải tệp lên thành công!" và điều hướng về `FEAT-OB-LIST` (không có màn kết quả riêng — audit tra được qua `searchOpeningBalances` sau này, thuộc `FEAT-OB-LIST` BFF spec).
- **Downstream**: cùng call W04-4 ở AC-6.
- **Output shape**: `ImportOpeningBalancesResult` (§5.1).
- **Failure mode**: N/A — nhánh thành công.
- **Ref**: op `importOpeningBalances` (§6.1), §5.1.

#### AC-9 → BFF không cần field-level RBAC riêng — 2 persona quyền ngang nhau

- **Khi**: `garage-owner` hoặc `accountant` gọi `verifyImportOpeningBalances`/`importOpeningBalances`.
- **BFF phải**: chỉ forward JWT chuẩn (`authenticated/context-dependent`) — KHÔNG có guard phân biệt persona cho 2 mutation này (BR-OB-CMN-002: cả 2 vai trò quyền ngang nhau). Không cần `auth/{op}Guard.ts` riêng.
- **Downstream**: JWT forward nguyên vẹn, tenant scope qua `X-Tenant-Id`.
- **Output shape**: — (không đổi shape theo persona).
- **Failure mode**: `UNAUTHENTICATED_ERROR`/`FORBIDDEN_ERROR` (401/403) chỉ khi JWT thiếu/hết hạn hoặc tenant mismatch — không phải theo persona.
- **Ref**: §4.1 Auth header propagation, §4.3.

## 4. Ràng buộc & rule cần enforce

> MUST-NOT-VIOLATE list cho BFF. Group: auth, perf, security, contract stability, error mapping.

### 4.1 Auth header propagation

- Mọi resolver (`verifyImportOpeningBalances`, `importOpeningBalances`) propagate `Authorization`, `X-Tenant-Id`, `x-request-id` xuống downstream REST `gf-inventory`.
- `importOpeningBalances` bắt buộc thêm header `X-Idempotency-Key` (giá trị từ argument `idempotencyKey`, format `OB-IMPORT-{tenantId}-{uuid}` per ADR-022) — KHÔNG optional.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Không cần DataLoader — cả 2 mutation là single-call passthrough (không có nested field resolution fan-out theo từng row).
- Không có persisted query allowlist riêng cho 2 op này (theo baseline discipline chung của module `opening-balance`).
- Payload lớn nhất `input.rows` cap 500 phần tử (defense-in-depth 3 tầng FE + BFF + BE) — tránh payload khổng lồ tới downstream.

### 4.3 Security + data exposure

- KHÔNG log nội dung `rows[]` đầy đủ (có thể chứa dữ liệu nghiệp vụ nhạy cảm số lượng/giá trị) ở resolver — chỉ log `fileName`, `fileChecksum`, `rowCount`, `tenantId`, request id.
- KHÔNG có field-level RBAC — 2 persona (`garage-owner`, `accountant`) quyền ngang nhau (BR-OB-CMN-002, AC-9).
- Tenant scope lấy từ header `X-Tenant-Id` (derive từ JWT context ở gateway), KHÔNG lấy từ arg client-controlled.

### 4.4 Contract stability

- Schema additive only cho 2 mutation này ở W04 — KHÔNG có breaking change trong scope FEAT-OB-IMPORT (khác với `updateOpeningBalanceLine` ở FEAT-OB-EDIT có breaking rename `warehouseCode → warehouseId`, không thuộc FEAT này).
- `OpeningBalanceImportRow` dùng pattern "canonical + display coexist" (v7.56) — field `mainUnitCode`/`warehouseId` (canonical, nullable) thêm **alongside** `unitName`/`warehouseName` (display, required) — KHÔNG xoá field cũ, migration-safe.
- Breaking change → CR MAJOR (không áp dụng cho FEAT này ở W04).

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| Row count > 500 hoặc rỗng | `ERR-INV-048` | AC-3b |
| Checksum/date malformed | `ERR-CMN-validation` | AC-4 |
| Mã sản phẩm không tồn tại | `ERR-INV-009` | AC-5, AC-6 |
| Mã sản phẩm ngừng hoạt động | `ERR-INV-010` | AC-5, AC-6 |
| Thiếu trường bắt buộc | `ERR-INV-017` | AC-5, AC-6 |
| Sai định dạng ngày | `ERR-INV-018` | AC-5, AC-6 |
| ĐVT lệch ĐVT chính | `ERR-INV-019` | AC-5, AC-6 |
| Kho không tồn tại | `ERR-INV-020` | AC-5, AC-6 |
| Ngày thuộc kỳ đã đóng | `ERR-INV-024` | AC-5, AC-6 |
| Số lượng tồn ≤ 0 | `ERR-INV-032` | AC-5, AC-6 |
| Giá trị tồn < 0 | `ERR-INV-033` | AC-5, AC-6 |
| Trùng (mã+kho) | `ERR-INV-034` | AC-5, AC-6 |
| OB sau/cùng ngày phiếu đã có | `ERR-INV-035` | AC-5, AC-6 |
| Cascade làm tồn âm | `ERR-INV-036` | AC-6 |
| gf-accounting lock-check unreachable (commit-path, fail-CLOSED) | `ERR-CMN-007` (HTTP 503) | AC-6 |
| gf-accounting lock-check unreachable (verify-path, fail-OPEN) | `warningLockCheckUnavailable: true` (data payload, không phải GraphQL error) | AC-4 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`. SDL đã ratify tại `Architecture/api/agg-garage-graph-graphql.md §3g.1` (module `opening-balance`, shared với `FEAT-OB-LIST`/`FEAT-OB-EDIT`/`FEAT-OB-DELETE-LINES`). Type `OpeningBalanceLine`/`PagedOpeningBalanceData`/`OpeningBalanceSearchInput` thuộc `FEAT-OB-LIST` BFF spec — chỉ liệt kê ở đây làm reference, KHÔNG re-define.

### 5.1 New types (FEAT-OB-IMPORT scope)

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `VerifyImportOpeningBalancesInput` | input | `fileName: String!`, `fileChecksum: String!`, `rows: [OpeningBalanceImportRow!]!` (cap 500) | NO (new) | AC-4 |
| `OpeningBalanceImportRow` | input | `rowNumber: Int!`, `productCode: String!`, `productName: String`, `unitName: String!`, `mainUnitCode: String` (canonical, nullable), `warehouseName: String!`, `warehouseId: Int` (canonical, nullable), `quantity: Float!`, `value: Float!`, `asOfDate: String!` | NO (new) | AC-4, AC-6 |
| `VerifyImportOpeningBalancesResult` | type | `totalRows: Int!`, `validRows: Int!`, `errorRows: Int!`, `warehousesInFile: [String!]!`, `previewLines: [OpeningBalancePreviewLine!]!`, `canCommit: Boolean!`, `warningLockCheckUnavailable: Boolean` | NO (new) | AC-4 |
| `OpeningBalancePreviewLine` | type | `rowNumber: Int!`, `status: PreviewStatus!`, `resolvedProductCode: String`, `resolvedWarehouseCode: String`, `errors: [PreviewLineError!]!` | NO (new) | AC-5 |
| `PreviewStatus` | enum | `VALID`, `ERROR` | NO (new) | AC-5 |
| `PreviewLineError` | type | `code: String!`, `field: String!`, `message: String!` | NO (new) | AC-5 |
| `ImportOpeningBalancesResult` | type | `totalRows: Int!`, `importedRows: Int!`, `importedAt: String!`, `importedBy: String!`, `fileName: String!`, `fileChecksum: String!`, `alreadyImported: Boolean`, `cascadedKeys: [StockLedgerCascadeAudit!]!` | NO (new) | AC-6, AC-8 |
| `StockLedgerCascadeAudit` | type | `productCode: String!`, `warehouseCode: String!`, `fromDate: String!`, `recomputedRows: Int!` | NO (new) | AC-6 |

### 5.2 Modified types (additive — backward-compat)

_(không áp dụng — 2 op scope FEAT-OB-IMPORT không sửa type đã ratify trước đó ở W04; `OpeningBalanceLine` search type thuộc `FEAT-OB-LIST` scope.)_

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `verifyImportOpeningBalances` | mutation | `input: VerifyImportOpeningBalancesInput!` | `VerifyImportOpeningBalancesResultApiResponse!` | JWT authenticated | AC-3b, AC-4, AC-5 |
| `importOpeningBalances` | mutation | `input: VerifyImportOpeningBalancesInput!`, `idempotencyKey: String!` | `ImportOpeningBalancesResultApiResponse!` | JWT authenticated | AC-3b, AC-6, AC-8 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `verifyImportOpeningBalances` | `src/resolvers/opening-balance/verifyImportOpeningBalances.ts` | `FEAT-OB-IMPORT` (BE §6, W04-3) | `POST /api/v2/opening-balances/verify-import` | (không cần — single call) | AC-4, AC-5 |
| `importOpeningBalances` | `src/resolvers/opening-balance/importOpeningBalances.ts` | `FEAT-OB-IMPORT` (BE §6, W04-4) | `POST /api/v2/opening-balances/import` (header `X-Idempotency-Key`) | (không cần — single call) | AC-6, AC-8 |

### 6.3 DataLoader / batching strategy

_(không áp dụng — cả 2 op là single-call passthrough, không có nested per-row batch resolution tại BFF layer. Enrichment `mainUnitName`/`createdByName` chỉ áp dụng cho `searchOpeningBalances` — thuộc `FEAT-OB-LIST` BFF spec, không thuộc scope này.)_

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `verifyImportOpeningBalances` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | read-only nhưng payload lớn + không lặp lại → không cache |
| `importOpeningBalances` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache; idempotency xử lý qua `X-Idempotency-Key` ở BE (không phải Apollo cache) |

### 6.5 Persisted query allowlist (nếu enable)

_(không áp dụng ở W04 cho module `opening-balance`.)_

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/opening-balance.graphql` | MODIFY (additive — thêm 2 mutation + input/type liệt kê §5.1; type `OpeningBalanceLine`/`OpeningBalanceSearchInput` đã tồn tại từ `FEAT-OB-LIST`) | extend SDL | ~90 | AC-4, AC-5, AC-6, AC-8 |
| `resolvers/` | `src/resolvers/opening-balance/verifyImportOpeningBalances.ts` | NEW | resolver pattern (passthrough + cap-500 guard) | ~45 | AC-3b, AC-4, AC-5 |
| `resolvers/` | `src/resolvers/opening-balance/importOpeningBalances.ts` | NEW | resolver pattern (passthrough + idempotency-key header + cap-500 guard) | ~50 | AC-3b, AC-6, AC-8 |
| `data-sources/` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE (2 method mới: `verifyImportOpeningBalances`, `importOpeningBalances`) | new method | ~40 | AC-4, AC-6 |
| `tests/integration` | `tests/integration/opening-balance-import.test.ts` | NEW | apollo test client | ~90 | AC-3b, AC-4, AC-5, AC-6, AC-8 |
| `tests/contract` | `tests/contract/opening-balance-import-contract.test.ts` | NEW | schema contract | ~40 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE Web.

```
(← BE tier S4: integration green — W04-3 verify-import + W04-4 import contracts stable)

S5  BFF schema + resolver wire (opening-balance import module)
    Entry: BE FEAT-OB-IMPORT §6 (W04-3, W04-4) contracts stable
    Exit: BFF contract test green (verifyImportOpeningBalances + importOpeningBalances) — cap-500 defensive guard verified
    └─► (hand-off FE Web S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver (opening-balance import) | schema + resolvers + data-sources | BE FEAT-OB-IMPORT §6 stable (W04-3/W04-4) | BFF contract test green | BE FEAT-OB-IMPORT S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory — BR-OB-004a all-or-nothing, BR-OB-012 duy nhất (mã+kho), BR-OB-013 kỳ đóng, BR-OB-015/016 point-in-time, tất cả enforce ở `gf-inventory`). BFF chỉ enforce:
> - Defense-in-depth cap 500 rows (BR-OB-004b, tầng thứ 2 trong 3 tầng)
> - Auth context (JWT, tenantId guard)
> - Idempotency-key mandatory forward

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-004b` | CORNERSTONE | resolver pre-check `input.rows.length <= 500` trước khi forward | `resolvers/opening-balance/verifyImportOpeningBalances.ts`, `resolvers/opening-balance/importOpeningBalances.ts` | AC-3b, AC-4, AC-6 | tầng 2/3 defense-in-depth; BE re-check là tầng authoritative |
| `BR-OB-CMN-002` | NORMAL | không có guard riêng — JWT chuẩn cho cả 2 persona | `resolvers/opening-balance/*.ts` | AC-9 | garage-owner + accountant quyền ngang nhau |
| tenant isolation (Critical Rule #4) | CORNERSTONE | header `X-Tenant-Id` forward từ JWT context, không lấy từ arg | `resolvers/opening-balance/*.ts` | AC-4, AC-6, AC-9 | resolver pre-check |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-OB-IMPORT.md §9` (khi tier BE được tạo).

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-3b | BFF contract (defensive cap-500 guard) | test-api | assert `ERR-INV-048` khi rows > 500, short-circuit không gọi downstream |
| AC-4 | BFF contract (schema, response shape) | test-api | snapshot `VerifyImportOpeningBalancesResult` shape |
| AC-5 | BFF integration (per-row status/errors passthrough) | test-api | mock downstream trả mixed VALID/ERROR rows, verify passthrough nguyên vẹn |
| AC-6 | BFF integration (idempotency-key header forward) | test-api | assert header `X-Idempotency-Key` present + format match `OB-IMPORT-{tenantId}-{uuid}` |
| AC-8 | BFF contract (response fields cho toast) | test-api | verify `importedRows/importedAt/importedBy/fileName/fileChecksum` present |
| AC-9 | BFF auth (dual persona) | test-isolation | cả 2 persona gọi mutation thành công như nhau |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-IMPORT.md` | PENDING (chưa được tạo tại thời điểm author BFF spec) | Downstream REST endpoints W04-3/W04-4 (§6.1-§6.2) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-IMPORT.md` | PENDING (chưa được tạo) | Consume mutation `verifyImportOpeningBalances` + `importOpeningBalances` từ §6.1 |
| Mobile | — | N/A | Mobile scope chỉ `searchOpeningBalances` view-only (per `agg-garage-graph-graphql.md §3g.4`) — KHÔNG import/edit/delete. `FEAT-OB-IMPORT` không có mobile tier. |

**Source ID consistency** (item 18): `source_feat_sha` phải identical với BE/FE-web files khi được tạo (`a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8`).

## 12. References

- **Source**: [`Product/features/FEAT-OB-IMPORT.md`](../../../../../Product/features/FEAT-OB-IMPORT.md) v20
- **Paired BE**: [`features/be/FEAT-OB-IMPORT.md`](../be/FEAT-OB-IMPORT.md) (chưa tạo tại thời điểm này)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md §3g`](../../../../../Architecture/api/agg-garage-graph-graphql.md) — Opening Balance module (§0 Wave Index → W04)
- **Downstream API**: [`Architecture/api/gf-inventory-api.md §3b`](../../../../../Architecture/api/gf-inventory-api.md) — W04-3/W04-4
- **ADRs**: `ADR-020` (stock ledger point-in-time snapshot), `ADR-021` (cross-boundary lock-check advisory), `ADR-022` (OB import wizard + all-or-nothing + cap 500)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Bundle**: `/tmp/exec-spec-bundles/W04/FEAT-OB-IMPORT.bff.md`

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-OB-IMPORT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (pure passthrough + cap-500 defense), §3 BFF behaviour map 10/10 AC (bao gồm AC-3b), §4 auth + perf + security + contract stability + error mapping (12 mã lỗi + ERR-CMN-007 fail-CLOSED), §5-§11 BFF-specific (SDL delta §3g.1, ops `verifyImportOpeningBalances`/`importOpeningBalances`, resolver mapping, file map, sequence DAG S5, BR secondary, test hand-off, cross-tier pair BE/FE-web PENDING + Mobile N/A). Source FEAT chỉ audit. |
