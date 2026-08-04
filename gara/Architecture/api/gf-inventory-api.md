---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 44
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-07-08"  # v44 W04 rename + clarify — §3b.2 W04-5 PUT `/api/v2/opening-balances/{id}` request body rename `warehouseCode: string` → `warehouseId: int` (canonical `warehouse.id` scalar FK) per user quannn 2026-07-08 "trong updateOpeningBalanceLine: chuyền warehouseId thay vì warehouseCode"; đồng thời clarify Semantics bullet mới `mainUnitCode` auto-derived server-side từ `internal_product.main_unit_code` theo productCode per FEAT-OB-EDIT AC-5 + user quannn "mainUnitCode luôn lấy theo internal_product" (đã đúng semantic, chỉ document explicit). Breaking change contract W04-5 — W04 chưa DEV nên safe at design time. Cascade 3 sub-edits §3b.2 W04-5: (1) Request body sample rename `"warehouseCode": "WH-01"` → `"warehouseId": 12`; (2) Field table replace row `warehouseCode string YES` → `warehouseId int YES canonical warehouse.id scalar FK tenant-scoped, breaking change contract v44 rename, lookup fail → ERR-INV-020`; extend `productCode` row description thêm "Backend auto-derive mainUnitCode từ internal_product.main_unit_code theo productCode — user KHÔNG gửi mainUnitCode (v44 clarify)"; (3) Semantics add 2 bullet mới: "mainUnitCode auto-derived (v44 clarify)" explicit backend behavior FEAT-OB-EDIT AC-5 + snapshot persistence DB column unit_code auto-update; "warehouseId canonical (v44 rename)" backend lookup + resolve tới warehouse.code string cho DB snapshot (data model không đổi). **KHÔNG đụng**: W04-1 search, W04-3 verify, W04-4 import (không có warehouseCode input scope này; W04-3/4 v43 đã có `rows[].warehouseId` int nullable "Add alongside" semantics migration khác edit rename); W04-6 delete-single, W04-7 delete-lines (không có warehouseCode input); §5 Naming Registry OB scope; data model `opening_balance_line` (DB snapshot `warehouse_code` string column giữ nguyên — backend resolve int → string tại commit time); Product FEAT-OB-EDIT / BR-OB-EDIT-** (AC-5 "ĐVT readonly" đã có sẵn confirm); UX / Figma. Cascade pair với `agg-garage-graph-graphql.md v7.56→v7.57` SDL `UpdateOpeningBalanceLineInput` rename field cùng semantic. Consistency với v43 import path: import (v43) dùng `rows[].warehouseId: int` nullable "Add alongside" (canonical + display coexist migration); edit (v44) dùng `warehouseId: int` required rename (clean canonical only). Semantics khác — import batch có transitional legacy display fallback, edit single-row direct. v43 W04 add — `rows[].mainUnitCode: string` + `rows[].warehouseId: int` nullable fields vào §3b.2 W04-3 verify-import (shared cascade W04-4 import per "cùng schema W04-3" note) per user quannn 2026-07-08 "trong importOpeningBalances sẽ chuyền lên mainUnitCode và warehouseId" + AskUserQuestion resolve Option "Add alongside" (giữ `unitName` + `warehouseName` display + THÊM canonical `mainUnitCode` + `warehouseId` — migration-safe transition). Cascade 4 sub-edits §3b.2 W04-3: (1) Request body sample thêm 2 field vào row; (2) field table add 2 row `rows[].mainUnitCode` (canonical string, fallback từ unitName, mismatch → `ERR-INV-019`) + `rows[].warehouseId` (canonical int, fallback từ warehouseName, mismatch → `ERR-INV-020`); extend `unitName` + `warehouseName` row descriptions ghi rõ fallback path khi canonical missing; (3) Semantics bullet extend "Canonical + display coexist (v43 add)" — canonical wins khi provided + cross-validate + fallback resolve legacy path + migration deferred deprecate. W04-4 note "cùng schema W04-3" giữ nguyên — 2 field mới auto-inherit vào commit path (không đụng W04-4 block riêng). **KHÔNG đụng**: W04-5 PUT (edit path shape khác, không phải import); W04-6 DELETE; W04-7 delete-lines; W04-1 search; §5 Naming Registry (canonical + display cùng belong OB scope, không cross-tier register mới); Product FEAT-OB-IMPORT / BR-OB (Business Authority; canonical vs display là API-layer detail). Cascade pair với `agg-garage-graph-graphql.md v7.55→v7.56` SDL `OpeningBalanceImportRow` add 2 field cùng semantic. Design rationale (user Option "Add alongside"): migration-safe transition — tồn tại window khi FE cũ display-only + FE mới gửi cả 2; backend deterministic khi canonical + fallback display khi không; audit consistency. Backward-compat: nullable field addition — existing FE clients KHÔNG break. Follow-up: FE `garage-web` form implement parse .xlsx → resolve display names → send cả 2 (agent-dev-garage-web Day 3 W04); separate CR deprecate legacy `unitName`/`warehouseName` khi FE 100% migrate. v42 W04 doc-nav cascade — §3b W04-4/W04-5 language refactor: replace `List<RecomputeResult>` (Java generic syntax) + `RecomputeResult` (Java class name) bằng "result shape" (semantic label) đồng bộ ADR-020 v3→v4 (strip Java code, giữ logic contract). Anchor cross-ref C4 giữ nguyên. Additive-only, KHÔNG đổi endpoint bodies / field name / Semantics. v41 W04 doc-nav cascade — §3b W04-4 `cascadedKeys[]` field description + W04-5 §Response 2xx block cite `ADR-020 §Component Interface C4` (shape 1-1 map `RecomputeResult`). Notes deprecation window cho legacy alias `recomputedRows` → canonical `affectedRows` next bump. Additive-only, KHÔNG đổi endpoint bodies. Pair với ADR-020 v3 + HLD v16. v40 doc-nav — Add §0 Wave Index (wave → §3<letter> pointer table) để subagent bounded-read theo wave hiện tại, không đọc full 6k dòng. Không đụng nội dung §1..§6, §3<letter> sub-modules, hoặc endpoint bodies. Pair với MANIFEST §5 Read scope column extension + `scripts/check-api-wave-index-drift.sh` warn-only. FM-020 entry. v39 W04 Q3 fix — Apply @FeatureOn(Inventory:InventoryV2) intro §3a (backfill W03 catalog v2 — MaterialGroupController + InternalProductController) + §3b (W04 OpeningBalanceController). User chốt scope 2026-07-06 mở rộng flag cover TRỌN Inventory V2 subsystem (đồng bộ pattern legacy `INVENTORY_STOCK`). Product spec EP-INVENTORY-OPENING-BALANCE §5.2 v3 + CR-1782974034. Doc-only update — nếu code W03 production chưa có annotation @FeatureOn(Inventory:InventoryV2) cần CR bổ sung (dev team confirm). Pair với gf-inventory-HLD v15 + INTEG-EXT-gf-inventory v11. Không đụng Product docs. v38 W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý (bundled static asset từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx`). Xoá endpoint W04-2 khỏi §3b.1 summary + §3b.2 detail block; thay UI mapping §3b.4 "Bấm link Tải template" thành "(none — FE bundled static asset)"; xoá row "Đường dẫn template" khỏi §5.1 Naming Registry. Thêm skip note ở đầu §3b.2 (trên W04-3) giữ audit trail. KHÔNG renumber W04-3..W04-7 (giữ gap tại W04-2). Không đụng Product docs. v37 W04 Gap 3 fix — §3b.2 W04-7 delete-lines validate FAIL-FAST theo thứ tự `ids[]`, dừng ngay khi gặp id đầu tiên vi phạm. Merge 3 dòng 400 trùng lặp/chồng chéo thành 1 dòng rõ ràng (mô tả fail-fast + response shape `{errorCode, offendingIds: [<id đầu>]}` + hai mã có thể `ERR-INV-024`/`ERR-INV-036` tuỳ guardrail nào fail trước theo thứ tự id). Thêm bullet Semantics "Validate fail-fast" — KHÔNG cần rule ưu tiên. All-or-nothing giữ nguyên per BR-OB-DEL-004. Không đụng Product docs (AC-4 popup wording đã fits fail-fast pattern). v36 W04 Gap 2 fix — Thay `ERR-INV-024-UNAVAILABLE` (suffix bịa, không có trong Product registry) bằng `ERR-CMN-007` (đã tồn tại tại `Product/error-code/ERROR-CODE-REGISTRY.md:71`, "Hệ thống đang bận, vui lòng thử lại sau", HTTP 503, TOAST, platform-wide) trên §3b.2 W04-4 import (fix explicit fake code); đồng thời elaborate 2 row 503 "bare" ở W04-5 edit + W04-6 delete-single với cùng ngữ nghĩa; thêm row 503 bị thiếu ở W04-7 delete-lines (commit-path per ADR-021 cũng fail-CLOSED). W04-3 verify-import không đụng — vẫn fail-OPEN với `warningLockCheckUnavailable` marker per ADR-021 (không throw 503). Không đụng Product docs. v35 W04 — Document empty-file semantics ở W04-3 verify-import response (BA/PO chốt 2026-07-06 phương án (b) — file rỗng KHÔNG throw error, verify PASS với totalRows=0/canCommit=false, FE render banner INFO). Cập nhật §3b.2 W04-3: (a) mở rộng doc cho field `canCommit` với công thức `canCommit = (totalRows > 0 AND errorRows == 0)`; (b) thêm block "Empty-file semantics"; (c) note trong bảng error codes 4xx/5xx rằng không có row cho empty file; (d) Semantics bullet enumerate errors thêm note "KHÔNG có mã lỗi cho empty file". Schema field không đổi (canCommit đã có sẵn). Pair với ADR-022 v3. v34 W04 — Add §3b Opening Balance + Stock Ledger (7 endpoints W04-1..W04-7 với full 6-block details) + §5 Naming Registry cross-tier (BE/BFF/FE/Mobile) — includes OB + stock ledger + AP lock-check consumer names. depends_on cite ADR-020/021/022 mới. v33 R39 — V2-11 body nhận thêm 3 collection `initialProducts` / `initialConversionUnits` / `attachments` (diff-by-id). Item có `id` = update tại chỗ; không `id` = insert; DB row không có trong payload = delete. Payload `null` = giữ nguyên collection; `[]` = xóa hết. Delete-guard reject full-rollback theo BR-CAT-PROD-012/014 — SKU cần xóa có `inventory_transaction` (BR-CAT-PROD-014) hoặc conv unit cần xóa khi product có bất kỳ activity nào (proxy `hasActivity` per BR-CAT-PROD-012, conservative vì `inventory_transaction` không lưu `unit_code`) → `400 ERR-INV-016 PRODUCT_HAS_TRANSACTIONS`. Update-in-place: `initialProducts[]` chỉ giữ mapping (không được đổi `productId`); `initialConversionUnits[]` set `conversionRate` (unitCode immutable per BR-CAT-PROD-011); `attachments[]` set `fileName` + `attachmentKind` (fileUrl/fileType/fileSizeBytes immutable per R31/R35). Ordering delete→flush→insert. 6 sub-resource endpoint V2-13..V2-19 giữ nguyên (backward-compat, FE có thể chọn 1 trong 2 path). Sync graphql (mutation `updateInternalProduct` input mở rộng 3 field — CR riêng cho BFF). Trước đó v32 R38 — `SkuMappingResponse.name` renamed to `productName` (CatalogDtos.java), per direct product instruction to close the field-name mismatch flagged in R36/R37 against BFF GraphQL SDL `InternalProductSkuMapping.productName: String`. `InternalProductService.toMapping()` builder `.name(...)` → `.productName(...)`; V2-8 `skuMappings[]` example + V2-13 response example updated. No dual-field back-compat shim added (single canonical field, matching this DTO's other fields which all already track the GraphQL SDL names exactly). Trước đó v31 R37 — BUGFIX: `SkuMappingResponse.sku`/`.name` were always null in V2-8 `skuMappings[]` and V2-13 response (reported via curl by user against `GET /api/v2/internal-products/{id}`). Root cause: `InternalProductService.toMapping()` never populated these fields — they live on the legacy `product` table (SKU master, ADR-017 Q2), not on `internal_product_sku_mapping`, so a lookup via `productId` was required and was simply missing. Fix looks up `ProductEntity` via the already-injected `JpaProductRepository.findAllByTenantIdAndIdInAndIsDeletedFalse` (same tenant-scoped method already used by `hasActivity()`), batched for the V2-8 list case, single-lookup for the V2-13 create case. This resolves the "Flag (not fixed, out of scope)" note left in R36 below — that flag also warned `sku: String!` is non-nullable in the BFF GraphQL SDL, so this was a latent P1-class null-crash risk, not merely cosmetic. `SkuMappingResponse.name` vs GraphQL's `productName` mismatch remains unresolved (separate, lower-severity, nullable-field issue — not requested this round). Trước đó v30 R36 — `SkuMappingResponse` (V2-8 `skuMappings[]` + V2-13 response body) rename field `internalProductId`→`id`, now carrying the mapping row's own PK (`e.getId()`) instead of the FK to the parent internal_product. Verified directly against BFF `agg-garage-graph` GraphQL SDL `InternalProductSkuMapping.id: Int!` (non-nullable, no `internalProductId` field declared) — same root cause/fix shape as R33/R34, this time confirmed proactively via SDL inspection rather than an incident report. Reusing the old FK value under the new `id` name would have collided across every SKU mapped to the same internal product; dropped `internalProductId` entirely (BFF never consumed it, same as sibling `ConversionUnitResponse`/`AttachmentResponse`). Trước đó v29 R35 — `AttachmentRequest` (V2-18 request body) rename 3 field: `sizeBytes`→`fileSizeBytes`, `storageUrl`→`fileUrl`, `kind`→`attachmentKind` (`CatalogDtos.java`), reversing the R11/R34 "unchanged" decision per direct product instruction (2026-07-01) — now full parity với `AttachmentCreateRequest`/`AttachmentResponse`. Trước đó v28 R34 — `AttachmentResponse` rename 3 field: `sizeBytes`→`fileSizeBytes`, `storageUrl`→`fileUrl`, `kind`→`attachmentKind` (V2-18 response body + V2-8/V2-10/V2-11 `attachments[]` — cùng shared DTO). Cùng root cause với R33: BFF `agg-garage-graph` GraphQL query `attachments { fileUrl fileSizeBytes attachmentKind }` đọc field không tồn tại trong REST cũ → null → 500. `AttachmentRequest` (V2-18 request body — `fileName/fileType/sizeBytes/storageUrl`) KHÔNG đổi, vẫn giữ shape cũ theo thiết kế R11. Đóng luôn gap tiềm ẩn: response giờ mới thực sự khớp shape mà R31 changelog đã mô tả cho V2-10 create (trước đó code chưa khớp). Trước đó v27 R33 — `ConversionUnitResponse` rename response field `unitId` → `id` (V2-8 `conversionUnits[]` item + V2-15/V2-16 response body) — BFF `agg-garage-graph` GraphQL resolver `InternalProductConversionUnit.id` (non-nullable) đọc field `id`, không tồn tại field đó trong REST cũ → null → 500 "Cannot return null for non-nullable field". URL path param `{unitId}` (V2-16/V2-17, R8 D-E) KHÔNG đổi — chỉ response body field. Trước đó v26 R32 — V2-10 add `pricingMethod` (doc-drift fix: field đã settable ở V2-11 + đã có `update()`, V2-10 create() thiếu field trên request DTO → client gửi pricingMethod bị Jackson reject "Unrecognized field". Thêm field vào request, backend default PWA nếu không truyền, respect giá trị client gửi — cùng enum/default V2-11). Trước đó v25 R31 — V2-10 add `status` (đồng bộ BFF drift, đã có sẵn ở graphql SDL) + `attachments[]` inline-tại-create (đảo pattern R11 post-create-only, theo yêu cầu Delivery Authority 2026-07-01, không raise CR) — item shape `fileUrl/fileName/fileType/fileSizeBytes/attachmentKind` (default IMAGE), khác V2-18 `AttachmentMetadataInput`. Sync graphql v7.36. Flag: FEAT-CAT-PROD-CREATE.md AC-13 ("KHÔNG inline tại create") hiện lệch — follow-up riêng.
depends_on:
  - "../hld/gf-inventory-HLD.md"
  - "../decisions/ADR-017-inventory-v2-catalog-additive-aggregates.md"
  - "../decisions/ADR-018-inventory-v2-bulk-import-pattern.md"
  - "../decisions/ADR-020-stock-ledger-daily-snapshot.md"
  - "../decisions/ADR-021-ob-period-lock-cross-boundary.md"
  - "../decisions/ADR-022-ob-import-all-or-nothing-bulk.md"
---

# REST API - `gf-inventory`

> API contract cho boundary `gf-inventory`, quản lý warehouse, stock, receipt, delivery, reservation, period stock và protected inventory operations.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## §0 Wave Index

> **Subagent RULE (bounded read)**: nếu prompt scope gắn với 1 wave cụ thể, subagent chỉ được `Read` các section liệt kê ở cột `Sections` của wave đó **+ §1 Thông tin chung + §5 Naming Registry + §6 References**. **KHÔNG đọc toàn file** (6k+ dòng). Nếu cần cross-wave check thì đọc thêm section wave lân cận theo bảng.
>
> **Cascading rule**: khi ratify thêm 1 sub-module `§3<letter>` cho wave mới, MUST append 1 hàng vào bảng này **trong cùng commit**. Drift check: `scripts/check-api-wave-index-drift.sh` (warn-only). Vi phạm = FM-020.

| Wave | Scope name | Sections | Endpoint ID range | Status | Ratified in |
|------|------------|----------|-------------------|--------|-------------|
| WT-baseline | Baseline REST endpoints (pre-Inventory V2) | §3 (default) Endpoint Details baseline | (§2 rows #1..#332 baseline) | ACTIVE | pre-v10 |
| W03 | Inventory Catalog V2 (ADR-017/018) | §3a Inventory V2 Catalog V2 · §5.1 Naming (catalog) | Ops `V2-1..V2-22` | ACTIVE | v10..v33 range |
| W04 | Opening Balance + Stock Ledger (ADR-020/021/022) | §3b Opening Balance + Stock Ledger · §5.1 (OB) + §5.2 (Stock Ledger) · §5.3 (AP read-only) | Ops `W04-1..W04-7` (skip W04-2, xem §3b.2) | DESIGN | v34..v42 (current) |

**Note**: §4 Forbidden Patterns + §5 Naming Registry + §6 References là cross-wave — luôn nằm trong read scope bất kể wave. `§5.3 Accounting Period` liệt kê consumer-side reads (gf-inventory chỉ consume, `gf-accounting` own — xem `Architecture/api/gf-accounting-api.md` §3bis + `agg-garage-graph-graphql.md §3e`).

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-inventory` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1`, `/api/v2` |
| Protected prefixes | `/protected/deliveries`, `/protected/internal`, `/protected/receipts`, `/protected/reservations`, `/protected/v1`, `/protected/v2` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `GET` | `/api/v1/mdm-parts` | MdmPart | authenticated |
| 2 | `GET` | `/api/v1/mdm-parts/google-images` | MdmPart | authenticated |
| 3 | `GET` | `/api/v1/services` | GarageService | authenticated |
| 4 | `POST` | `/api/v1/services` | GarageService | authenticated |
| 5 | `GET` | `/api/v1/services/{id}` | GarageService | authenticated |
| 6 | `PUT` | `/api/v1/services/{id}` | GarageService | authenticated |
| 7 | `GET` | `/api/v1/warehouses` | Warehouse | authenticated |
| 8 | `GET` | `/api/v1/warehouses/{id}` | Warehouse | authenticated |
| 9 | `GET` | `/api/v1/warehouses/code/{warehouseCode}` | Warehouse | authenticated |
| 10 | `POST` | `/api/v2/deliveries` | InventoryDelivery | authenticated |
| 11 | `GET` | `/api/v2/deliveries/{code}` | InventoryDelivery | authenticated |
| 12 | `PUT` | `/api/v2/deliveries/{id}` | InventoryDelivery | authenticated |
| 13 | `POST` | `/api/v2/deliveries/{id}/cancel` | InventoryDelivery | authenticated |
| 14 | `POST` | `/api/v2/deliveries/{id}/complete` | InventoryDelivery | authenticated |
| 15 | `GET` | `/api/v2/deliveries/{id}/export-pdf` | InventoryDelivery | authenticated |
| 16 | `GET` | `/api/v2/deliveries/{id}/items` | InventoryDelivery | authenticated |
| 18 | `GET` | `/api/v2/deliveries/mobile/{code}` | InventoryDelivery | authenticated |
| 19 | `POST` | `/api/v2/deliveries/mobile/search` | InventoryDelivery | authenticated |
| 20 | `POST` | `/api/v2/deliveries/products/search` | InventoryDelivery | authenticated |
| 21 | `POST` | `/api/v2/deliveries/search` | InventoryDelivery | authenticated |
| 22 | `GET` | `/api/v2/period-stocks` | InventoryPeriodStock | authenticated |
| 23 | `GET` | `/api/v2/period-stocks/{id}` | InventoryPeriodStock | authenticated |
| 24 | `GET` | `/api/v2/period-stocks/filters/periods` | InventoryPeriodStock | authenticated |
| 25 | `GET` | `/api/v2/period-stocks/filters/products` | InventoryPeriodStock | authenticated |
| 26 | `GET` | `/api/v2/period-stocks/mobile/detail` | InventoryPeriodStock | authenticated |
| 27 | `GET` | `/api/v2/period-stocks/mobile/list` | InventoryPeriodStock | authenticated |
| 28 | `GET` | `/api/v2/period-stocks/stats/current` | InventoryPeriodStock | authenticated |
| 29 | `POST` | `/api/v2/products` | Product | authenticated |
| 30 | `GET` | `/api/v2/products/search` | Product | authenticated |
| 31 | `GET` | `/api/v2/products/search-grouped` | Product | authenticated |
| 32 | `POST` | `/api/v2/products/stock/cost-price` | Product | authenticated |
| 33 | `POST` | `/api/v2/products/stock/total-by-skus` | Product | authenticated |
| 34 | `GET` | `/api/v2/receipts` | InventoryReceipt | authenticated |
| 35 | `POST` | `/api/v2/receipts` | InventoryReceipt | authenticated |
| 36 | `GET` | `/api/v2/receipts/{code}` | InventoryReceipt | authenticated |
| 37 | `PUT` | `/api/v2/receipts/{id}` | InventoryReceipt | authenticated |
| 38 | `POST` | `/api/v2/receipts/{id}/cancel` | InventoryReceipt | authenticated |
| 39 | `POST` | `/api/v2/receipts/{id}/complete` | InventoryReceipt | authenticated |
| 40 | `GET` | `/api/v2/receipts/{id}/export-pdf` | InventoryReceipt | authenticated |
| 42 | `GET` | `/api/v2/receipts/mobile/{code}` | InventoryReceipt | authenticated |
| 43 | `GET` | `/api/v2/receipts/mobile/search` | InventoryReceipt | authenticated |
| 44 | `GET` | `/api/v2/stocks` | InventoryStock | authenticated |
| 45 | `GET` | `/api/v2/stocks/{id}` | InventoryStock | authenticated |
| 46 | `PUT` | `/api/v2/stocks/adjust` | InventoryStock | authenticated |
| 47 | `GET` | `/api/v2/stocks/history` | InventoryStock | authenticated |
| 48 | `GET` | `/api/v2/stocks/mobile` | InventoryStock | authenticated |
| 49 | `GET` | `/api/v2/stocks/mobile/{id}` | InventoryStock | authenticated |
| 50 | `PUT` | `/api/v2/stocks/prices` | InventoryStock | authenticated |
| 51 | `POST` | `/protected/deliveries` | ProtectedDelivery | service-to-service |
| 52 | `GET` | `/protected/deliveries/{code}/status` | ProtectedDelivery | service-to-service |
| 53 | `POST` | `/protected/deliveries/cancel` | ProtectedDelivery | service-to-service |
| 54 | `POST` | `/protected/deliveries/complete` | ProtectedDelivery | service-to-service |
| 55 | `POST` | `/protected/deliveries/items/update-cost-prices` | ProtectedDelivery | service-to-service |
| 56 | `POST` | `/protected/internal/delivery-items/update-cost-prices` | ProtectedInternal | service-to-service |
| 57 | `POST` | `/protected/receipts` | ProtectedReceipt | service-to-service |
| 58 | `GET` | `/protected/receipts/{code}/status` | ProtectedReceipt | service-to-service |
| 59 | `POST` | `/protected/receipts/cancel` | ProtectedReceipt | service-to-service |
| 60 | `POST` | `/protected/receipts/complete` | ProtectedReceipt | service-to-service |
| 61 | `POST` | `/protected/reservations/{code}/expire` | ProtectedReservation | service-to-service |
| 62 | `POST` | `/protected/reservations/{code}/release` | ProtectedReservation | service-to-service |
| 63 | `POST` | `/protected/v1/iostock-issuance` | InternalInventory | service-to-service |
| 64 | `GET` | `/protected/v1/keys` | ApiKey | service-to-service |
| 65 | `POST` | `/protected/v1/keys` | ApiKey | service-to-service |
| 66 | `DELETE` | `/protected/v1/keys/{key}` | ApiKey | service-to-service |
| 67 | `POST` | `/protected/v1/keys/{key}/disable` | ApiKey | service-to-service |
| 68 | `POST` | `/protected/v1/keys/{key}/enable` | ApiKey | service-to-service |
| 69 | `POST` | `/protected/v1/keys/{key}/reset` | ApiKey | service-to-service |
| 70 | `GET` | `/protected/v1/keys/{key}/status` | ApiKey | service-to-service |
| 71 | `GET` | `/protected/v1/keys/{key}/validate` | ApiKey | service-to-service |
| 72 | `GET` | `/protected/v1/keys/status/all` | ApiKey | service-to-service |
| 73 | `GET` | `/protected/v1/keys/test/{key}` | ApiKey | service-to-service |
| 74 | `POST` | `/protected/v1/locations` | InternalLocation | service-to-service |
| 75 | `POST` | `/protected/v1/pim-info` | InternalPimInfo | service-to-service |
| 76 | `GET` | `/protected/v1/product/{productId}` | InternalProduct | service-to-service |
| 77 | `POST` | `/protected/v1/product/batch` | InternalProduct | service-to-service |
| 78 | `GET` | `/protected/v1/product/po-summary` | InternalProduct | service-to-service |
| 79 | `POST` | `/protected/v1/product/product-lines` | InternalProduct | service-to-service |
| 80 | `POST` | `/protected/v1/product/productId` | InternalProduct | service-to-service |
| 81 | `GET` | `/protected/v1/product/so-summary` | InternalProduct | service-to-service |
| 82 | `POST` | `/protected/v2/period-closure/atomic-close` | ProtectedPeriodClosure | service-to-service |
| 83 | `GET` | `/protected/v2/period-closure/check-idempotency` | ProtectedPeriodClosure | service-to-service |
| 84 | `POST` | `/protected/v2/period-closure/close-warehouse` | ProtectedPeriodClosure | service-to-service |
| 85 | `POST` | `/protected/v2/period-closure/close-warehouse-batch` | ProtectedPeriodClosure | service-to-service |
| 86 | `POST` | `/protected/v2/period-closure/create-next-period` | ProtectedPeriodClosure | service-to-service |
| 87 | `POST` | `/protected/v2/period-closure/increment-retry-count` | ProtectedPeriodClosure | service-to-service |
| 88 | `POST` | `/protected/v2/period-closure/init-history` | ProtectedPeriodClosure | service-to-service |
| 89 | `POST` | `/protected/v2/period-closure/mark-all-failed-retry` | ProtectedPeriodClosure | service-to-service |
| 90 | `POST` | `/protected/v2/period-closure/mark-retry` | ProtectedPeriodClosure | service-to-service |
| 91 | `GET` | `/protected/v2/period-closure/pending-warehouses` | ProtectedPeriodClosure | service-to-service |
| 92 | `GET` | `/protected/v2/period-closure/retry-warehouses` | ProtectedPeriodClosure | service-to-service |
| 93 | `POST` | `/protected/v2/period-closure/rollback` | ProtectedPeriodClosure | service-to-service |
| 94 | `GET` | `/protected/v2/period-closure/stats` | ProtectedPeriodClosure | service-to-service |
| 95 | `POST` | `/protected/v2/period-closure/update-status` | ProtectedPeriodClosure | service-to-service |

---

## 3. Endpoint Details

### GET `/api/v1/mdm-parts`

Lấy dữ liệu mdm part theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "genuineCode": "MP-20260506-0001",
      "parentCode": "MP-20260506-0001",
      "aliasName": "MdmPart mẫu",
      "uniqueKey": "mdm-part-sample-20260506",
      "mainAvatarUrl": "2026-05-06T10:30:00+07:00",
      "avatars": "2026-05-06T10:30:00+07:00"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.MDM_PART_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.MDM_PART_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.MDM_PART_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.MDM_PART_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.MDM_PART_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.MDM_PART_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/mdm-parts/google-images`

Lấy dữ liệu mdm part theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "images": [
      "mdm-part-sample-20260506"
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.MDM_PART_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.MDM_PART_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.MDM_PART_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.MDM_PART_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.MDM_PART_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.MDM_PART_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/services`

Lấy dữ liệu garage service theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "serviceCode": "GS-20260506-0001",
      "serviceName": "GarageService mẫu",
      "updatedBy": "2026-05-06",
      "updatedAt": "2026-05-06",
      "sellingPrice": 2500000,
      "unit": "garage-service-sample-20260506",
      "images": [
        "garage-service-sample-20260506"
      ],
      "description": "Ghi chú nghiệp vụ mẫu",
      "createdBy": "2026-05-06T10:30:00+07:00",
      "createdAt": "2026-05-06T10:30:00+07:00"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.GARAGE_SERVICE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/services`

Tạo mới garage service. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "serviceCode": "GS-20260506-0001",
    "serviceName": "GarageService mẫu",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "sellingPrice": 2500000,
    "unit": "garage-service-sample-20260506",
    "images": [
      "garage-service-sample-20260506"
    ],
    "description": "Ghi chú nghiệp vụ mẫu",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.GARAGE_SERVICE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.GARAGE_SERVICE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.GARAGE_SERVICE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.GARAGE_SERVICE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.GARAGE_SERVICE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.GARAGE_SERVICE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/services/{id}`

Lấy dữ liệu garage service theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "serviceCode": "GS-20260506-0001",
    "serviceName": "GarageService mẫu",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "sellingPrice": 2500000,
    "unit": "garage-service-sample-20260506",
    "images": [
      "garage-service-sample-20260506"
    ],
    "description": "Ghi chú nghiệp vụ mẫu",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.GARAGE_SERVICE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.GARAGE_SERVICE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/services/{id}`

Cập nhật garage service theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "serviceCode": "GS-20260506-0001",
    "serviceName": "GarageService mẫu",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "sellingPrice": 2500000,
    "unit": "garage-service-sample-20260506",
    "images": [
      "garage-service-sample-20260506"
    ],
    "description": "Ghi chú nghiệp vụ mẫu",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.GARAGE_SERVICE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.GARAGE_SERVICE_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.GARAGE_SERVICE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.GARAGE_SERVICE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.GARAGE_SERVICE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.GARAGE_SERVICE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/warehouses`

Lấy dữ liệu warehouse theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "branchCode": "WH-20260506-0001",
      "warehouseCode": "WH-20260506-0001",
      "warehouseName": "Warehouse mẫu",
      "warehouseType": "STANDARD",
      "updatedBy": "2026-05-06",
      "updatedAt": "2026-05-06",
      "tenantId": 10,
      "address": "123 Le Loi, Quan 1, TP HCM",
      "city": "warehouse-sample-20260506",
      "ward": "warehouse-sample-20260506",
      "contactPhone": "0909123456",
      "contactEmail": "nguyen.van.a@example.com",
      "isDefault": true
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.WAREHOUSE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.WAREHOUSE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.WAREHOUSE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.WAREHOUSE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.WAREHOUSE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.WAREHOUSE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/warehouses/{id}`

Lấy dữ liệu warehouse theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "branchCode": "WH-20260506-0001",
    "warehouseCode": "WH-20260506-0001",
    "warehouseName": "Warehouse mẫu",
    "warehouseType": "STANDARD",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "warehouse-sample-20260506",
    "ward": "warehouse-sample-20260506",
    "contactPhone": "0909123456",
    "contactEmail": "nguyen.van.a@example.com",
    "isDefault": true
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.WAREHOUSE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.WAREHOUSE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.WAREHOUSE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.WAREHOUSE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.WAREHOUSE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.WAREHOUSE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/warehouses/code/{warehouseCode}`

Lấy dữ liệu warehouse theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "warehouseCode": "WH-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "branchCode": "WH-20260506-0001",
    "warehouseCode": "WH-20260506-0001",
    "warehouseName": "Warehouse mẫu",
    "warehouseType": "STANDARD",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "warehouse-sample-20260506",
    "ward": "warehouse-sample-20260506",
    "contactPhone": "0909123456",
    "contactEmail": "nguyen.van.a@example.com",
    "isDefault": true
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.WAREHOUSE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.WAREHOUSE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.WAREHOUSE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.WAREHOUSE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.WAREHOUSE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.WAREHOUSE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/deliveries`

Tạo mới inventory delivery. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "deliveryCode": "DLV-20260506-0001",
    "warehouseCode": "DLV-20260506-0001",
    "salesOrderCode": "DLV-20260506-0001",
    "serviceOrderCode": "DLV-20260506-0001",
    "status": "ACTIVE",
    "deliveryType": "STANDARD",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "DLV-20260506-0001",
        "productName": "InventoryDelivery mẫu",
        "costPriceUpdatedAt": "2026-05-06",
        "costPrice": 2500000,
        "sku": "inventory-delivery-sample-20260506",
        "tier": "inventory-delivery-sample-20260506"
      }
    ],
    "source": "inventory-delivery-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/deliveries/{code}`

Lấy dữ liệu inventory delivery theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "DLV-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "deliveryCode": "DLV-20260506-0001",
    "warehouseCode": "DLV-20260506-0001",
    "salesOrderCode": "DLV-20260506-0001",
    "serviceOrderCode": "DLV-20260506-0001",
    "status": "ACTIVE",
    "deliveryType": "STANDARD",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "totalItems": 2500000,
    "totalValue": 2500000,
    "items": [
      {
        "id": 51001,
        "genuineCode": "DLV-20260506-0001",
        "productName": "InventoryDelivery mẫu",
        "costPriceUpdatedAt": "2026-05-06",
        "costPrice": 2500000,
        "sku": "inventory-delivery-sample-20260506",
        "tier": "inventory-delivery-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/deliveries/{id}`

Cập nhật inventory delivery theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "deliveryCode": "DLV-20260506-0001",
    "warehouseCode": "DLV-20260506-0001",
    "salesOrderCode": "DLV-20260506-0001",
    "serviceOrderCode": "DLV-20260506-0001",
    "status": "ACTIVE",
    "deliveryType": "STANDARD",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "DLV-20260506-0001",
        "productName": "InventoryDelivery mẫu",
        "costPriceUpdatedAt": "2026-05-06",
        "costPrice": 2500000,
        "sku": "inventory-delivery-sample-20260506",
        "tier": "inventory-delivery-sample-20260506"
      }
    ],
    "source": "inventory-delivery-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/deliveries/{id}/cancel`

Hủy inventory delivery theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "deliveryCode": "DLV-20260506-0001",
    "warehouseCode": "DLV-20260506-0001",
    "salesOrderCode": "DLV-20260506-0001",
    "serviceOrderCode": "DLV-20260506-0001",
    "status": "ACTIVE",
    "deliveryType": "STANDARD",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "DLV-20260506-0001",
        "productName": "InventoryDelivery mẫu",
        "costPriceUpdatedAt": "2026-05-06",
        "costPrice": 2500000,
        "sku": "inventory-delivery-sample-20260506",
        "tier": "inventory-delivery-sample-20260506"
      }
    ],
    "source": "inventory-delivery-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/deliveries/{id}/complete`

Hoàn tất inventory delivery, cập nhật trạng thái nghiệp vụ và dữ liệu liên quan.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "serviceOrderCode": "DLV-20260506-0001",
    "details": [
      {
        "productName": "InventoryDelivery mẫu",
        "type": "EXCESS",
        "sku": "inventory-delivery-sample-20260506",
        "quantity": 2
      }
    ],
    "delivery": {
      "id": 51001,
      "deliveryCode": "DLV-20260506-0001",
      "warehouseCode": "DLV-20260506-0001",
      "salesOrderCode": "DLV-20260506-0001",
      "serviceOrderCode": "DLV-20260506-0001",
      "status": "ACTIVE",
      "deliveryType": "STANDARD"
    },
    "mismatch": {
      "serviceOrderCode": "DLV-20260506-0001",
      "details": [
        "inventory-delivery-sample-20260506"
      ],
      "mismatchCase": "QUANTITY_MISMATCH"
    },
    "mismatchCase": "QUANTITY_MISMATCH"
  }
}
```

**Side-effect**: cập nhật trạng thái hoàn tất và đồng bộ dữ liệu tồn kho/tài chính/liên quan nếu có.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_COMPLETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_COMPLETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_COMPLETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_COMPLETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_COMPLETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_COMPLETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/deliveries/{id}/export-pdf`

Lấy dữ liệu inventory delivery theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "fileName": "dlv-20260506-0001.pdf",
      "contentType": "application/pdf",
      "downloadUrl": "https://files.garage.example/documents/sample.pdf"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/deliveries/{id}/items`

Lấy dữ liệu inventory delivery theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "genuineCode": "DLV-20260506-0001",
      "productName": "InventoryDelivery mẫu",
      "costPriceUpdatedAt": "2026-05-06",
      "costPrice": 2500000,
      "sku": "inventory-delivery-sample-20260506",
      "tier": "inventory-delivery-sample-20260506"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/deliveries/mobile/{code}`

Lấy dữ liệu inventory delivery theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "DLV-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "deliveryCode": "DLV-20260506-0001",
    "warehouseCode": "DLV-20260506-0001",
    "salesOrderCode": "DLV-20260506-0001",
    "serviceOrderCode": "DLV-20260506-0001",
    "statusDescription": "ACTIVE",
    "deliveryType": "STANDARD",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "totalItems": 2500000,
    "totalValue": 2500000,
    "items": [
      {
        "id": 51001,
        "genuineCode": "DLV-20260506-0001",
        "productName": "InventoryDelivery mẫu",
        "costPriceUpdatedAt": "2026-05-06",
        "costPrice": 2500000,
        "sku": "inventory-delivery-sample-20260506",
        "tier": "inventory-delivery-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/deliveries/mobile/search`

Tra cứu danh sách inventory delivery theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "deliveryCode": "DLV-20260506-0001",
      "warehouseCode": "DLV-20260506-0001",
      "salesOrderCode": "DLV-20260506-0001",
      "serviceOrderCode": "DLV-20260506-0001",
      "status": "ACTIVE",
      "deliveryType": "STANDARD",
      "validatedBy": "2026-05-06",
      "validatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "updatedAt": "2026-05-06",
      "source": "inventory-delivery-sample-20260506",
      "note": "Ghi chú nghiệp vụ mẫu",
      "trackingNumber": "DLV-20260506-0001"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/deliveries/products/search`

Tra cứu danh sách inventory delivery theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "genuineCode": "DLV-20260506-0001",
      "name": "InventoryDelivery mẫu",
      "sku": "inventory-delivery-sample-20260506",
      "unit": "inventory-delivery-sample-20260506",
      "segment": "TIER1",
      "origin": "inventory-delivery-sample-20260506"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/deliveries/search`

Tra cứu danh sách inventory delivery theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "deliveryCode": "DLV-20260506-0001",
      "warehouseCode": "DLV-20260506-0001",
      "salesOrderCode": "DLV-20260506-0001",
      "serviceOrderCode": "DLV-20260506-0001",
      "status": "ACTIVE",
      "deliveryType": "STANDARD",
      "validatedBy": "2026-05-06",
      "validatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "updatedAt": "2026-05-06",
      "items": [
        {
          "id": 51001,
          "genuineCode": "DLV-20260506-0001",
          "productName": "InventoryDelivery mẫu",
          "costPriceUpdatedAt": "2026-05-06",
          "costPrice": 2500000,
          "sku": "inventory-delivery-sample-20260506",
          "tier": "inventory-delivery-sample-20260506"
        }
      ],
      "source": "inventory-delivery-sample-20260506",
      "note": "Ghi chú nghiệp vụ mẫu"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_DELIVERY_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "warehouseCode": "STK-20260506-0001",
      "periodCode": "STK-20260506-0001",
      "warehouseName": "InventoryPeriodStock mẫu",
      "productName": "InventoryPeriodStock mẫu",
      "status": "ACTIVE",
      "periodStartDate": "2026-05-06",
      "periodEndDate": "2026-05-06",
      "updatedAt": "2026-05-06",
      "totalReceivedQuantity": 2500000,
      "totalDeliveredQuantity": 2500000,
      "openingCostPrice": 2500000,
      "closingCostPrice": 2500000,
      "sku": "inventory-period-stock-sample-20260506"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks/{id}`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "warehouseCode": "STK-20260506-0001",
    "periodCode": "STK-20260506-0001",
    "warehouseName": "InventoryPeriodStock mẫu",
    "productName": "InventoryPeriodStock mẫu",
    "status": "ACTIVE",
    "periodStartDate": "2026-05-06",
    "periodEndDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "totalReceivedQuantity": 2500000,
    "totalDeliveredQuantity": 2500000,
    "openingCostPrice": 2500000,
    "closingCostPrice": 2500000,
    "sku": "inventory-period-stock-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks/filters/periods`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "STK-20260506-0001",
      "status": "ACTIVE",
      "name": "InventoryPeriodStock mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks/filters/products`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "PRD-20260506-0001",
      "status": "ACTIVE",
      "name": "InventoryPeriodStock mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks/mobile/detail`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "warehouseCode": "STK-20260506-0001",
    "periodCode": "STK-20260506-0001",
    "warehouseName": "InventoryPeriodStock mẫu",
    "productName": "InventoryPeriodStock mẫu",
    "status": "ACTIVE",
    "periodStartDate": "2026-05-06",
    "periodEndDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "totalReceivedQuantity": 2500000,
    "totalDeliveredQuantity": 2500000,
    "openingCostPrice": 2500000,
    "closingCostPrice": 2500000,
    "sku": "inventory-period-stock-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks/mobile/list`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "warehouseCode": "STK-20260506-0001",
      "periodCode": "STK-20260506-0001",
      "warehouseName": "InventoryPeriodStock mẫu",
      "productName": "InventoryPeriodStock mẫu",
      "status": "ACTIVE",
      "periodStartDate": "2026-05-06",
      "periodEndDate": "2026-05-06",
      "updatedAt": "2026-05-06",
      "totalReceivedQuantity": 2500000,
      "totalDeliveredQuantity": 2500000,
      "openingCostPrice": 2500000,
      "closingCostPrice": 2500000,
      "sku": "inventory-period-stock-sample-20260506"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/period-stocks/stats/current`

Lấy dữ liệu inventory period stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "periodCode": "STK-20260506-0001",
    "openCount": 1001,
    "closedCount": 1001,
    "adjustedCount": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_PERIOD_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/products`

Tạo mới product. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "Product mẫu",
    "sku": "product-sample-20260506",
    "segment": "TIER1",
    "origin": "product-sample-20260506",
    "unit": "product-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PRODUCT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PRODUCT_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.PRODUCT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PRODUCT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PRODUCT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PRODUCT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/products/search`

Tra cứu danh sách product theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "genuineCode": "PRD-20260506-0001",
      "name": "Product mẫu",
      "suggestedPrice": 2500000,
      "costPrice": 2500000,
      "sku": "product-sample-20260506",
      "segment": "TIER1",
      "unit": "product-sample-20260506",
      "origin": "product-sample-20260506",
      "quantity": 2,
      "reservedQuantity": 2,
      "availableQuantity": 2
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PRODUCT_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PRODUCT_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.PRODUCT_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PRODUCT_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PRODUCT_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PRODUCT_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/products/search-grouped`

Tra cứu danh sách product theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "genuineCode": "PRD-20260506-0001",
      "name": "Product mẫu",
      "productLineId": 51001,
      "unit": "product-sample-20260506",
      "origin": "product-sample-20260506",
      "variants": [
        {
          "id": 51001,
          "genuineCode": "PRD-20260506-0001",
          "name": "Product mẫu",
          "suggestedPrice": 2500000,
          "costPrice": 2500000,
          "sku": "product-sample-20260506",
          "segment": "TIER1"
        }
      ]
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PRODUCT_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PRODUCT_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.PRODUCT_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PRODUCT_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PRODUCT_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PRODUCT_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/products/stock/cost-price`

Tạo mới product. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "costPrice": 2500000,
      "sku": "product-sample-20260506"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PRODUCT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PRODUCT_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.PRODUCT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PRODUCT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PRODUCT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PRODUCT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/products/stock/total-by-skus`

Tạo mới product. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "genuineCode": "PRD-20260506-0001",
      "name": "Product mẫu",
      "productAliasName": "Product mẫu",
      "totalQuantity": 2500000,
      "productId": 51001,
      "sku": "product-sample-20260506",
      "unit": "product-sample-20260506"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PRODUCT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PRODUCT_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.PRODUCT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PRODUCT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PRODUCT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PRODUCT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/receipts`

Lấy dữ liệu inventory receipt theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "receiptCode": "REC-20260506-0001",
      "warehouseCode": "REC-20260506-0001",
      "purchaseOrderCode": "REC-20260506-0001",
      "status": "ACTIVE",
      "validatedBy": "2026-05-06",
      "validatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "updatedAt": "2026-05-06",
      "items": [
        {
          "id": 51001,
          "genuineCode": "REC-20260506-0001",
          "productName": "InventoryReceipt mẫu",
          "costPrice": 2500000,
          "suggestedPrice": 2500000,
          "sku": "inventory-receipt-sample-20260506",
          "tier": "inventory-receipt-sample-20260506"
        }
      ],
      "source": "inventory-receipt-sample-20260506",
      "note": "Ghi chú nghiệp vụ mẫu",
      "trackingNumber": "REC-20260506-0001",
      "attachments": [
        {
          "fileName": "InventoryReceipt mẫu",
          "mimeType": "STANDARD",
          "fileUrl": "https://files.garage.example/documents/sample.pdf",
          "fileSize": 20,
          "description": "Ghi chú nghiệp vụ mẫu",
          "createdAt": "2026-05-06T10:30:00+07:00"
        }
      ]
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/receipts`

Tạo mới inventory receipt. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "receiptCode": "REC-20260506-0001",
    "warehouseCode": "REC-20260506-0001",
    "purchaseOrderCode": "REC-20260506-0001",
    "status": "ACTIVE",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "REC-20260506-0001",
        "productName": "InventoryReceipt mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "sku": "inventory-receipt-sample-20260506",
        "tier": "inventory-receipt-sample-20260506"
      }
    ],
    "source": "inventory-receipt-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu",
    "trackingNumber": "REC-20260506-0001",
    "attachments": [
      {
        "fileName": "InventoryReceipt mẫu",
        "mimeType": "STANDARD",
        "fileUrl": "https://files.garage.example/documents/sample.pdf",
        "fileSize": 20,
        "description": "Ghi chú nghiệp vụ mẫu",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/receipts/{code}`

Lấy dữ liệu inventory receipt theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "REC-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "receiptCode": "REC-20260506-0001",
    "warehouseCode": "REC-20260506-0001",
    "purchaseOrderCode": "REC-20260506-0001",
    "status": "ACTIVE",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "REC-20260506-0001",
        "productName": "InventoryReceipt mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "sku": "inventory-receipt-sample-20260506",
        "tier": "inventory-receipt-sample-20260506"
      }
    ],
    "source": "inventory-receipt-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu",
    "trackingNumber": "REC-20260506-0001",
    "attachments": [
      {
        "fileName": "InventoryReceipt mẫu",
        "mimeType": "STANDARD",
        "fileUrl": "https://files.garage.example/documents/sample.pdf",
        "fileSize": 20,
        "description": "Ghi chú nghiệp vụ mẫu",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/receipts/{id}`

Cập nhật inventory receipt theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "receiptCode": "REC-20260506-0001",
    "warehouseCode": "REC-20260506-0001",
    "purchaseOrderCode": "REC-20260506-0001",
    "status": "ACTIVE",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "REC-20260506-0001",
        "productName": "InventoryReceipt mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "sku": "inventory-receipt-sample-20260506",
        "tier": "inventory-receipt-sample-20260506"
      }
    ],
    "source": "inventory-receipt-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu",
    "trackingNumber": "REC-20260506-0001",
    "attachments": [
      {
        "fileName": "InventoryReceipt mẫu",
        "mimeType": "STANDARD",
        "fileUrl": "https://files.garage.example/documents/sample.pdf",
        "fileSize": 20,
        "description": "Ghi chú nghiệp vụ mẫu",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/receipts/{id}/cancel`

Hủy inventory receipt theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "receiptCode": "REC-20260506-0001",
    "warehouseCode": "REC-20260506-0001",
    "purchaseOrderCode": "REC-20260506-0001",
    "status": "ACTIVE",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "REC-20260506-0001",
        "productName": "InventoryReceipt mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "sku": "inventory-receipt-sample-20260506",
        "tier": "inventory-receipt-sample-20260506"
      }
    ],
    "source": "inventory-receipt-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu",
    "trackingNumber": "REC-20260506-0001",
    "attachments": [
      {
        "fileName": "InventoryReceipt mẫu",
        "mimeType": "STANDARD",
        "fileUrl": "https://files.garage.example/documents/sample.pdf",
        "fileSize": 20,
        "description": "Ghi chú nghiệp vụ mẫu",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ]
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/receipts/{id}/complete`

Hoàn tất inventory receipt, cập nhật trạng thái nghiệp vụ và dữ liệu liên quan.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "receiptCode": "REC-20260506-0001",
    "warehouseCode": "REC-20260506-0001",
    "purchaseOrderCode": "REC-20260506-0001",
    "status": "ACTIVE",
    "validatedBy": "2026-05-06",
    "validatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "REC-20260506-0001",
        "productName": "InventoryReceipt mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "sku": "inventory-receipt-sample-20260506",
        "tier": "inventory-receipt-sample-20260506"
      }
    ],
    "source": "inventory-receipt-sample-20260506",
    "note": "Ghi chú nghiệp vụ mẫu",
    "trackingNumber": "REC-20260506-0001",
    "attachments": [
      {
        "fileName": "InventoryReceipt mẫu",
        "mimeType": "STANDARD",
        "fileUrl": "https://files.garage.example/documents/sample.pdf",
        "fileSize": 20,
        "description": "Ghi chú nghiệp vụ mẫu",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ]
  }
}
```

**Side-effect**: cập nhật trạng thái hoàn tất và đồng bộ dữ liệu tồn kho/tài chính/liên quan nếu có.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_COMPLETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_COMPLETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_COMPLETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_COMPLETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_COMPLETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_COMPLETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/receipts/{id}/export-pdf`

Lấy dữ liệu inventory receipt theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "fileName": "rec-20260506-0001.pdf",
      "contentType": "application/pdf",
      "downloadUrl": "https://files.garage.example/documents/sample.pdf"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/receipts/mobile/{code}`

Lấy dữ liệu inventory receipt theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "REC-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "receiptCode": "REC-20260506-0001",
    "purchaseOrderCode": "REC-20260506-0001",
    "status": "ACTIVE",
    "totalItems": 2500000,
    "totalValue": 2500000,
    "items": [
      {
        "id": 51001,
        "genuineCode": "REC-20260506-0001",
        "productName": "InventoryReceipt mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "totalValue": 2500000,
        "quantity": 2
      }
    ],
    "createdAt": "2026-05-06T10:30:00+07:00",
    "trackingNumber": "REC-20260506-0001",
    "source": "inventory-receipt-sample-20260506",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "attachments": [
      {
        "fileName": "InventoryReceipt mẫu",
        "mimeType": "STANDARD",
        "fileUrl": "https://files.garage.example/documents/sample.pdf",
        "fileSize": 20,
        "description": "Ghi chú nghiệp vụ mẫu",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ],
    "note": "Ghi chú nghiệp vụ mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/receipts/mobile/search`

Tra cứu danh sách inventory receipt theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "receiptCode": "REC-20260506-0001",
      "purchaseOrderCode": "REC-20260506-0001",
      "status": "ACTIVE",
      "totalQuantity": 2500000,
      "createdAt": "2026-05-06T10:30:00+07:00",
      "source": "inventory-receipt-sample-20260506"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_RECEIPT_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_RECEIPT_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/stocks`

Lấy dữ liệu inventory stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "warehouseCode": "STK-20260506-0001",
      "genuineCode": "STK-20260506-0001",
      "productName": "InventoryStock mẫu",
      "updatedBy": "2026-05-06",
      "updatedAt": "2026-05-06",
      "costPrice": 2500000,
      "suggestedPrice": 2500000,
      "sku": "inventory-stock-sample-20260506",
      "tier": "inventory-stock-sample-20260506",
      "origin": "inventory-stock-sample-20260506",
      "unitOfMeasure": "inventory-stock-sample-20260506",
      "quantity": 2,
      "reservedQuantity": 2
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/stocks/{id}`

Lấy dữ liệu inventory stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "warehouseCode": "STK-20260506-0001",
    "genuineCode": "STK-20260506-0001",
    "productName": "InventoryStock mẫu",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "costPrice": 2500000,
    "suggestedPrice": 2500000,
    "sku": "inventory-stock-sample-20260506",
    "tier": "inventory-stock-sample-20260506",
    "origin": "inventory-stock-sample-20260506",
    "unitOfMeasure": "inventory-stock-sample-20260506",
    "quantity": 2,
    "reservedQuantity": 2
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/stocks/adjust`

Cập nhật inventory stock theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "warehouseCode": "STK-20260506-0001",
    "genuineCode": "STK-20260506-0001",
    "productName": "InventoryStock mẫu",
    "updatedBy": "2026-05-06",
    "updatedAt": "2026-05-06",
    "costPrice": 2500000,
    "suggestedPrice": 2500000,
    "sku": "inventory-stock-sample-20260506",
    "tier": "inventory-stock-sample-20260506",
    "origin": "inventory-stock-sample-20260506",
    "unitOfMeasure": "inventory-stock-sample-20260506",
    "quantity": 2,
    "reservedQuantity": 2
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/stocks/history`

Lấy dữ liệu inventory stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "transactionCode": "STK-20260506-0001",
      "referenceCode": "STK-20260506-0001",
      "orderCode": "STK-20260506-0001",
      "productName": "InventoryStock mẫu",
      "transactionType": "STANDARD",
      "transactionTypeDescription": "STANDARD",
      "referenceType": "STANDARD",
      "sku": "inventory-stock-sample-20260506",
      "quantity": 2,
      "previousQuantity": 2,
      "newQuantity": 2,
      "performedBy": "inventory-stock-sample-20260506",
      "reason": "Ghi chú nghiệp vụ mẫu"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/stocks/mobile`

Lấy dữ liệu inventory stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "productName": "InventoryStock mẫu",
      "sku": "inventory-stock-sample-20260506",
      "origin": "inventory-stock-sample-20260506",
      "tier": "inventory-stock-sample-20260506",
      "availableQuantity": 2
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/stocks/mobile/{id}`

Lấy dữ liệu inventory stock theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "genuineCode": "STK-20260506-0001",
    "referenceCode": "STK-20260506-0001",
    "orderCode": "STK-20260506-0001",
    "productName": "InventoryStock mẫu",
    "transactionType": "STANDARD",
    "referenceType": "STANDARD",
    "updatedAt": "2026-05-06",
    "costPrice": 2500000,
    "suggestedPrice": 2500000,
    "sku": "inventory-stock-sample-20260506",
    "origin": "inventory-stock-sample-20260506",
    "tier": "inventory-stock-sample-20260506",
    "availableQuantity": 2,
    "expectedInbound": 2500000
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/stocks/prices`

Cập nhật inventory stock theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "STK-20260506-0001",
    "status": "ACTIVE",
    "name": "InventoryStock mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INVENTORY_STOCK_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/deliveries`

Tạo mới protected delivery. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DLV-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedDelivery mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/deliveries/{code}/status`

Lấy dữ liệu protected delivery theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "code": "DLV-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "DLV-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_DELIVERY_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/deliveries/cancel`

Hủy protected delivery theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DLV-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedDelivery mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_DELIVERY_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CANCEL.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/deliveries/complete`

Hoàn tất protected delivery, cập nhật trạng thái nghiệp vụ và dữ liệu liên quan.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DLV-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedDelivery mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hoàn tất và đồng bộ dữ liệu tồn kho/tài chính/liên quan nếu có.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_DELIVERY_COMPLETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_COMPLETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_COMPLETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_COMPLETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_COMPLETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_COMPLETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/deliveries/items/update-cost-prices`

Tạo mới protected delivery. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DLV-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedDelivery mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_DELIVERY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/internal/delivery-items/update-cost-prices`

Tạo mới protected internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PI-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedInternal mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/receipts`

Tạo mới protected receipt. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "REC-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_RECEIPT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/receipts/{code}/status`

Lấy dữ liệu protected receipt theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "code": "REC-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "REC-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_RECEIPT_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/receipts/cancel`

Hủy protected receipt theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "REC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedReceipt mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_RECEIPT_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CANCEL.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/receipts/complete`

Hoàn tất protected receipt, cập nhật trạng thái nghiệp vụ và dữ liệu liên quan.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "REC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedReceipt mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hoàn tất và đồng bộ dữ liệu tồn kho/tài chính/liên quan nếu có.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_RECEIPT_COMPLETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_COMPLETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_COMPLETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_COMPLETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_COMPLETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_RECEIPT_COMPLETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/reservations/{code}/expire`

Tạo mới protected reservation. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "code": "PR-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PR-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedReservation mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/reservations/{code}/release`

Tạo mới protected reservation. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "code": "PR-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PR-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedReservation mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_RESERVATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/iostock-issuance`

Tạo mới internal inventory. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "inventoryIds": [
      51001
    ],
    "ioStockIssuanceId": 51001,
    "ioStockProductIds": [
      51001
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_INVENTORY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_INVENTORY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_INVENTORY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_INVENTORY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INTERNAL_INVENTORY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_INVENTORY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/keys`

Lấy dữ liệu api key theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.API_KEY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/keys`

Tạo mới api key. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.API_KEY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/keys/{key}`

Xóa hoặc vô hiệu hóa api key theo định danh được cung cấp.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.API_KEY_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/keys/{key}/disable`

Tạo mới api key. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.API_KEY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/keys/{key}/enable`

Tạo mới api key. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.API_KEY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/keys/{key}/reset`

Tạo mới api key. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.API_KEY_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/keys/{key}/status`

Lấy dữ liệu api key theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.API_KEY_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/keys/{key}/validate`

Lấy dữ liệu api key theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.API_KEY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/keys/status/all`

Lấy dữ liệu api key theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.API_KEY_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/keys/test/{key}`

Lấy dữ liệu api key theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "key": "api-key-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "AK-20260506-0001",
    "status": "ACTIVE",
    "name": "ApiKey mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.API_KEY_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.API_KEY_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.API_KEY_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.API_KEY_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.API_KEY_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.API_KEY_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/locations`

Tạo mới internal location. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "IL-20260506-0001",
    "opsAreaCode": "IL-20260506-0001",
    "opsRegionCode": "IL-20260506-0001",
    "name": "InternalLocation mẫu",
    "tenantId": 10,
    "address": "123 Le Loi, Quan 1, TP HCM"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_LOCATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_LOCATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_LOCATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_LOCATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INTERNAL_LOCATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_LOCATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/pim-info`

Lấy dữ liệu internal pim info theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "IPI-20260506-0001",
    "status": "ACTIVE",
    "name": "InternalPimInfo mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PIM_INFO_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PIM_INFO_EXECUTE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PIM_INFO_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PIM_INFO_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INTERNAL_PIM_INFO_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PIM_INFO_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/product/{productId}`

Lấy dữ liệu internal product theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "productId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "genuineCode": "PRD-20260506-0001",
    "name": "InternalProduct mẫu",
    "unit": "internal-product-sample-20260506",
    "segment": "TIER1",
    "sku": "internal-product-sample-20260506",
    "origin": "internal-product-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/product/batch`

Tạo mới internal product. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "genuineCode": "PRD-20260506-0001",
      "name": "InternalProduct mẫu",
      "productId": 51001,
      "unit": "internal-product-sample-20260506",
      "segment": "internal-product-sample-20260506",
      "sku": "internal-product-sample-20260506",
      "origin": "internal-product-sample-20260506"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/product/po-summary`

Lấy dữ liệu internal product theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseOrderCode": "PRD-20260506-0001",
    "items": [
      {
        "genuineCode": "PRD-20260506-0001",
        "productName": "InternalProduct mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "productId": 51001,
        "sku": "internal-product-sample-20260506",
        "tier": "internal-product-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/product/product-lines`

Tạo mới internal product. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "name": "InternalProduct mẫu",
    "productTypeEnum": "SPARE_PART",
    "productDtos": [
      {
        "name": "InternalProduct mẫu",
        "productTypeEnum": "SPARE_PART",
        "productLineId": 51001,
        "unit": "internal-product-sample-20260506"
      }
    ],
    "productLineId": 51001,
    "unit": "internal-product-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/product/productId`

Tạo mới internal product. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PRD-20260506-0001",
    "status": "ACTIVE",
    "name": "InternalProduct mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/product/so-summary`

Lấy dữ liệu internal product theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "serviceOrderCode": "PRD-20260506-0001",
    "items": [
      {
        "genuineCode": "PRD-20260506-0001",
        "productName": "InternalProduct mẫu",
        "costPrice": 2500000,
        "productId": 51001,
        "sku": "internal-product-sample-20260506",
        "tier": "internal-product-sample-20260506",
        "tierDescription": "Ghi chú nghiệp vụ mẫu"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.INTERNAL_PRODUCT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/atomic-close`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không dùng header `Idempotency-Key`; endpoint yêu cầu query param `idempotencyKey` unique theo operation/workflow.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "recordsClosed": 1001,
    "recordsCreated": "2026-05-06T10:30:00+07:00",
    "success": true,
    "message": "protected-period-closure-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/check-idempotency`

Lấy dữ liệu protected period closure theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không dùng header `Idempotency-Key`; endpoint yêu cầu query param `idempotencyKey` để kiểm tra operation đã hoàn tất hay chưa.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "alreadyCompleted": true,
    "recordsClosed": 1001,
    "recordsCreated": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/close-warehouse`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PPC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedPeriodClosure mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/close-warehouse-batch`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "recordsInserted": 1001,
    "hasMore": true,
    "currentPage": 0
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/create-next-period`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PPC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedPeriodClosure mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/increment-retry-count`

Đếm số lượng protected period closure theo điều kiện hiện tại để phục vụ dashboard hoặc kiểm tra nhanh.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "count": 12
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_COUNT.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/init-history`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PPC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedPeriodClosure mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/mark-all-failed-retry`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PPC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedPeriodClosure mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/mark-retry`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PPC-20260506-0001",
    "status": "ACTIVE",
    "name": "ProtectedPeriodClosure mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/pending-warehouses`

Lấy dữ liệu protected period closure theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "warehouses": [
      {
        "warehouseCode": "WH-20260506-0001",
        "tenantId": 10
      }
    ],
    "hasNext": true
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/retry-warehouses`

Lấy dữ liệu protected period closure theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "warehouses": [
      {
        "warehouseCode": "WH-20260506-0001",
        "periodCode": "WH-20260506-0001",
        "tenantId": 10,
        "retryCount": 1001
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/rollback`

Tạo mới protected period closure. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không dùng header `Idempotency-Key`; query param `idempotencyKey` là optional để rollback/invalidate theo workflow operation.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "recordsDeleted": 1001,
    "success": true,
    "message": "protected-period-closure-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/stats`

Lấy dữ liệu protected period closure theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "periodCode": "PPC-20260506-0001",
    "totalWarehouses": 2500000,
    "totalRecordsClosed": 2500000,
    "totalRecordsCreated": "2026-05-06T10:30:00+07:00",
    "successCount": 1001,
    "failedCount": 1001,
    "pendingCount": 1001,
    "runningCount": 1001,
    "pendingRetryCount": 1001,
    "avgDurationMs": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/update-status`

Lấy dữ liệu protected period closure theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "PPC-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory.PROTECTED_PERIOD_CLOSURE_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 3a. Inventory V2 — Catalog V2 (DESIGN — ADR-017/018)

> Endpoint **mới ĐỘC LẬP** subsystem `catalog-v2`. Mọi endpoint public dùng prefix `/api/v2`. Authentication = security context (consistent với §1); tenant resolve từ JWT/security context (KHÔNG accept `tenantId` từ client body). Headers chuẩn: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`. **AP slice (kỳ kế toán) deferred to gf-accounting wave** per Delivery Authority boundary correction 2026-06-23 (R4 strip).
>
> **Feature Flag**: toàn bộ endpoints §3a được gate `@FeatureOn(Inventory:InventoryV2, fallback=THROW_EXCEPTION)` class-level trên `MaterialGroupController` + `InternalProductController` (per EP-INVENTORY-OPENING-BALANCE §5.2 v3 + BR-GF-INVENTORY §6.6 v3, CR-1782974034 — user chốt scope 2026-07-06 mở rộng flag cover cả W03 catalog v2). Tenant chưa enable → **HTTP 403** cho mọi endpoint. Web ẩn menu (FE gate route). Đồng bộ pattern legacy `@FeatureOn(INVENTORY_STOCK)` (delivery/receipt/stock/period-stock/garage-service — `gf-inventory-HLD.md` §6 Feature gate row). Product spec dùng naming `Inventory:InventoryV2` trần theo EP §5.2 v3 (không theo format `{Domain}:{Code}` như các boundary khác — architect follow Product spec).

### 3a.1 Endpoint Summary — V2 additions

| # | Method | Path | Module | Auth | BR refs |
|---:|---|---|---|---|---|
| **V2-1** | `POST` | `/api/v2/material-groups/search` | MaterialGroup | authenticated | BR-CAT-GRP-013 (keyword OR-match name/code + flat-grouped-by-parent ordering) |
| **V2-2** | `GET` | `/api/v2/material-groups/tree` | MaterialGroup | authenticated | BR-CAT-GRP-005 (cây phân cấp); MAX 1000 nodes/tenant → `ERR-INV-027` (R3 F10); **W03 UI KHÔNG bind — reserved cho integration future** (R29 BA 2026-06-26: FEAT-CAT-GRP-LIST v6 chuyển sang flat list, UI canonical = V2-1) |
| **V2-3** | `GET` | `/api/v2/material-groups/{id}` | MaterialGroup | authenticated | BR-CAT-CMN-002 (audit fields) |
| **V2-4** | `POST` | `/api/v2/material-groups` | MaterialGroup | authenticated | BR-CAT-GRP-001..006, 012 |
| **V2-5** | `PUT` | `/api/v2/material-groups/{id}` | MaterialGroup | authenticated | BR-CAT-GRP-004 (mã immutable), 007 (cascade), 009 (cycle), 012 |
| **V2-6** | `DELETE` | `/api/v2/material-groups/{id}` | MaterialGroup | authenticated | BR-CAT-GRP-010 (`ERR-INV-004`), 011 (`ERR-INV-005`) |
| **V2-7** | `POST` | `/api/v2/internal-products/search` | InternalProduct | authenticated | BR-CAT-PROD-007 (filter status default ACTIVE), BR-CAT-PROD-019 (filter nature), BR-CAT-GRP-013 (keyword OR-match code/name/sku — R10) |
| **V2-8** | `GET` | `/api/v2/internal-products/{id}` | InternalProduct | authenticated | BR-CAT-CMN-002 |
| ~~**V2-9**~~ | — | ~~`/api/v2/internal-products/{id}/history`~~ | — | — | **R10 REMOVED** — BA đã chốt không track history audit; standard audit cols (created/updated_at/by) trên `internal_product` table preserved |
| **V2-10** | `POST` | `/api/v2/internal-products` | InternalProduct | authenticated | BR-CAT-PROD-001..006, 010, 015, 019 |
| **V2-11** | `PUT` | `/api/v2/internal-products/{id}` | InternalProduct | authenticated | BR-CAT-PROD-004, 006, 008, 015 |
| **V2-12** | `DELETE` | `/api/v2/internal-products/{id}` | InternalProduct | authenticated | BR-CAT-PROD-016 (`ERR-INV-008`) |
| **V2-13** | `POST` | `/api/v2/internal-products/{id}/sku-mappings` | InternalProductSku | authenticated | BR-CAT-PROD-013 (`ERR-INV-015`) |
| **V2-14** | `DELETE` | `/api/v2/internal-products/{id}/sku-mappings/{productId}` | InternalProductSku | authenticated | BR-CAT-PROD-014 — R9 path param rename `{skuId}` → `{productId}` (FK column tường minh) |
| **V2-15** | `POST` | `/api/v2/internal-products/{id}/conversion-units` | InternalProductUnit | authenticated | BR-CAT-PROD-011 (`ERR-INV-013/014`) — R8 D-E path rename |
| **V2-16** | `PUT` | `/api/v2/internal-products/{id}/conversion-units/{unitId}` | InternalProductUnit | authenticated | BR-CAT-PROD-012 — R8 D-E path rename |
| **V2-17** | `DELETE` | `/api/v2/internal-products/{id}/conversion-units/{unitId}` | InternalProductUnit | authenticated | BR-CAT-PROD-012 — R8 D-E path rename |
| **V2-18** | `POST` | `/api/v2/internal-products/{id}/attachments` | InternalProductAttachment | authenticated | BR-CAT-PROD-015 (`ERR-CMN-004/005`) |
| **V2-19** | `DELETE` | `/api/v2/internal-products/{id}/attachments/{attachmentId}` | InternalProductAttachment | authenticated | — |
| **V2-20** | `POST` | `/api/v2/internal-products/verify-import` | InternalProductImport | authenticated | BR-CAT-PROD-017 (preview), ADR-018 (cap 500) |
| **V2-21** | `POST` | `/api/v2/internal-products/import` | InternalProductImport | authenticated | BR-CAT-PROD-017, ADR-018 |
| **V2-22** | `POST` | `/api/v2/internal-products/export` | InternalProductExport | authenticated | BR-CAT-PROD-018 (xuất .xlsx theo filter; R15 GET→POST + body shape match V2-7 search) |
| **V2-23** | `GET` | `/api/v2/skus/search` | Sku | authenticated | BR-CAT-PROD-013 (search SKU master từ legacy `product`, query `unmapped=true` lọc chưa mapping) |

### 3a.2 Endpoint details — full coverage

> **Coverage rule (enforce qua Reviewer G5)**: mọi row trong §3a.1 Endpoint Summary phải có 1 detail sub-section riêng dưới đây. Combined pair chỉ cho phép khi semantic identical (vd V2-20/V2-21 verify-import + import — cùng request body, khác side-effect; document rõ trong combined heading).

#### Material Groups (V2-1..V2-6)

#### V2-1 — POST `/api/v2/material-groups/search` (Search paginated — flat-grouped-by-parent)

**Headers**: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`.

**Request body**:
```json
{
  "keyword": "Lốp",
  "parentId": null,
  "status": "ACTIVE",
  "excludeId": 123,
  "excludeBranch": true,
  "page": 0,
  "size": 20,
  "sort": "default"
}
```

| Body field | Type | Required | Default | Description |
|---|---|---|---|---|
| `keyword` | string | NO | — | LIKE-unaccent **OR-match** trên cả 2 columns `material_group.name` VÀ `material_group.code` (BR-CAT-GRP-013). Backend SQL: `WHERE (LOWER(unaccent(name)) LIKE LOWER(unaccent(:kw)) \|\| '%' OR LOWER(unaccent(code)) LIKE LOWER(unaccent(:kw)) \|\| '%')`. Case-insensitive Vietnamese-unaccent — single search box UX cho phép user gõ tên hoặc mã. |
| `parentId` | long | NO | — | Filter trực tiếp con của node này; null + key omitted → trả mọi node theo ordering rule; truyền explicit `null` → roots only |
| `status` | enum | NO | **`ACTIVE`** | `ACTIVE \| INACTIVE` — không truyền → backend default `ACTIVE` per BR-CAT-GRP-001 (symmetric với V2-4 R5 fix; hide INACTIVE khỏi default UI list) |
| `excludeId` | long | NO | — | Id nhóm gốc cần loại khỏi kết quả khi kết hợp với `excludeBranch=true`. `null` (hoặc omitted) → không loại. Chỉ có hiệu lực khi `excludeBranch=true`. |
| `excludeBranch` | boolean | NO | `false` | Khi `true` + `excludeId != null` → **loại row có `id = excludeId` VÀ toàn bộ hậu duệ của nó** (dùng recursive CTE `findDescendantIds`). Cost: +1 CTE query/request khi bật. Use case chính: FE parent-picker cho màn Edit Material Group (`FEAT-CAT-GRP-EDIT`) — ẩn chính node đang edit + subtree để user không thể chọn parent tạo vòng lặp phân cấp (BE `update()` sẽ reject bằng `ERR-INV-003`, đây là guard phòng thủ tại UI). `excludeBranch=false` hoặc `excludeId=null` → no-op, không CTE query. |
| `page` | int | NO | 0 | Standard offset/limit pagination |
| `size` | int | NO | 20 | Max 100 |
| `sort` | string | NO | `"default"` | `"default"` = flat-grouped-by-parent ordering (xem semantics dưới). Allow override `name,asc|desc`, `createdAt,desc` cho FE muốn alphabetical/recency view (skip group ordering) |

**Flat-grouped-by-parent ordering semantics** (default `sort=default`):
- Backend `ORDER BY (parent_path, display_order, id)` — siblings của cùng parent xếp adjacent
- `parent_path` derived qua recursive CTE in query (KHÔNG add column trong table — avoid migration; performance acceptable với tree depth thực tế ≤5 + cap 1000 nodes per PL5 R3 F10)
- Pagination giữ ordering này → group có thể trải qua nhiều page khi `size` < group size. FE render parent header (từ field `parentName` enrichment) — duplicate header nếu group spans pages

**Example** (parent A: 5 children, parent B: 3, parent C: 12; `size=10`):
- Page 0: A1, A2, A3, A4, A5, B1, B2, B3, C1, C2
- Page 1: C3, C4, C5, C6, C7, C8, C9, C10, C11, C12
- Page 2: (next parent group)

**Response 200**:
```json
{
  "data": {
    "content": [
      {
        "id": 123,
        "code": "GRP-LOC-001",
        "name": "Lốp xe",
        "description": "Nhóm lốp xe các loại",
        "parentId": null,
        "parentName": null,
        "status": "ACTIVE",
        "displayOrder": 10,
        "childCount": 3,
        "productCount": 42,
        "updatedAt": "2026-06-23T10:00:00Z"
      },
      {
        "id": 124,
        "code": "GRP-LOC-001-A",
        "name": "Lốp xe — Bridgestone",
        "description": "Sub-nhóm theo thương hiệu Bridgestone",
        "parentId": 123,
        "parentName": "Lốp xe",
        "status": "ACTIVE",
        "displayOrder": 1,
        "childCount": 0,
        "productCount": 12,
        "updatedAt": "2026-06-23T10:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 156,
    "totalPages": 8
  }
}
```

**Side-effect**: read-only; cache TTL 60s key `mg:search:{tenant}:{queryHash}`.

**Validation**: `page >= 0`, `size <= 100`, `sort` ∈ allowed list. Vi phạm → `400 ERR-CMN-validation`.

#### V2-2 — GET `/api/v2/material-groups/tree` (Tree size cap — R3 F10)

**Headers**: chuẩn.

**Query params**: none (toàn cây tenant).

**Backend defensive cap**: COUNT nodes in tenant trước khi build tree. Nếu > 1000 → reject với HTTP 413 + `ERR-INV-027` `MATERIAL_GROUP_TREE_OVERSIZE`, response body `{"error": {"code": "ERR-INV-027", "message": "Tenant có >1000 nhóm VTHH — sử dụng paginated list endpoint V2-1 (GET /api/v2/material-groups) thay thế", "hint": "redirect-to-paginated"}}`. BFF (V2-Q2) đã enforce defense-in-depth — backend là enforcement chính.

**Response 200** (size ≤ 1000):
```json
{
  "data": {
    "nodes": [
      {"id": 123, "code": "GRP-LOC-001", "name": "Lốp xe", "parentId": null, "status": "ACTIVE", "children": [
        {"id": 124, "code": "GRP-LOC-001-01", "name": "Lốp xe du lịch", "parentId": 123, "status": "ACTIVE", "children": []}
      ]}
    ],
    "totalNodes": 156
  }
}
```

#### V2-3 — GET `/api/v2/material-groups/{id}` (Detail)

**Headers**: chuẩn.

**Path params**: `id` (long, required) — material_group id, tenant-scoped.

**Response 200** (BR-CAT-CMN-002 audit fields):
```json
{
  "data": {
    "id": 123,
    "code": "GRP-LOC-001",
    "name": "Lốp xe",
    "parentId": null,
    "parentName": null,
    "description": "Nhóm lốp xe các loại",
    "status": "ACTIVE",
    "displayOrder": 10,
    "childCount": 3,
    "productCount": 42,
    "createdAt": "2026-06-20T09:00:00Z",
    "createdBy": "garage-owner@garage-001.vn",
    "updatedAt": "2026-06-23T10:00:00Z",
    "updatedBy": "garage-owner@garage-001.vn"
  }
}
```

**Error**: 404 + `ERR-CMN-not-found` nếu id không thuộc tenant.

#### V2-4 — POST `/api/v2/material-groups` (Tạo nhóm VTHH)

**Headers**: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`.

**Request body**:
```json
{
  "code": "GRP-LOC-001",
  "name": "Lốp xe",
  "parentId": null,
  "description": "Nhóm lốp xe các loại",
  "status": "ACTIVE"
}
```

**Validation**:
- `code`: required, regex `^[^~!@#$%^&*]+$` (BR-CAT-GRP-002 → `ERR-INV-001`), tenant-scoped unique (BR-CAT-GRP-003 → `ERR-INV-002`).
- `name`: required.
- `parentId`: optional; nếu set → phải exist trong `material_group` cùng tenant + status=ACTIVE (BR-CAT-GRP-008).
- `description`: optional, ≤255 chars (BR-CAT-GRP-012 → `ERR-INV-016`).
- `status`: optional, enum `ACTIVE | INACTIVE`. Không truyền → backend default `ACTIVE` per BR-CAT-GRP-001. Invalid enum value → `400 ERR-CMN-validation`.

**Response 201**:
```json
{
  "data": {
    "id": 123,
    "code": "GRP-LOC-001",
    "name": "Lốp xe",
    "parentId": null,
    "status": "ACTIVE",
    "description": "Nhóm lốp xe các loại",
    "createdAt": "2026-06-23T10:00:00Z",
    "createdBy": "garage-owner@garage-001.vn"
  }
}
```

#### V2-5 — PUT `/api/v2/material-groups/{id}` (Sửa nhóm — đổi parent / status / description / name)

**Headers**: chuẩn. **Path params**: `id` (long, required).

**Request body**: same shape as V2-4 (no `code` — immutable per BR-CAT-GRP-004; gửi `code` khác giá trị hiện tại → reject `400 ERR-CMN-validation`).

**Note**: `code` **immutable** (BR-CAT-GRP-004). Cha INACTIVE → cascade INACTIVE xuống children trong cùng transaction (BR-CAT-GRP-007). `parentId` **có thể đổi** (BR-CAT-GRP-009 v21) — nếu `parentId` request bằng giá trị hiện tại thì skip toàn bộ guard; nếu khác, backend enforce 3 guard trước khi persist: (a) self-reference (`parentId == id`) → `ERR-INV-003`; (b) `parentId` ∈ descendants của node hiện tại (recursive CTE `findDescendantIds`) → `ERR-INV-003`; (c) parent mới phải `ACTIVE` — subsume BR-CAT-GRP-008 → `ERR-INV-003`. Cho phép cả set `parentId = null` (chuyển về root) và đổi từ `null` → non-null. `description` ≤255 (`ERR-INV-016`).

**Response 200**: updated DTO (same shape as V2-3).

#### V2-6 — DELETE `/api/v2/material-groups/{id}` (Xóa nhóm)

**Headers**: chuẩn. **Path params**: `id` (long, required).

**Delete guards** (cùng transaction, kiểm tra trước khi xóa):
- BR-CAT-GRP-010 — nhóm còn `internal_product` (cùng tenant) gắn → reject `400 ERR-INV-004` `MATERIAL_GROUP_HAS_PRODUCTS`.
- BR-CAT-GRP-011 — nhóm còn children (`material_group` có `parent_id = {id}` cùng tenant) → reject `400 ERR-INV-005` `MATERIAL_GROUP_HAS_CHILDREN`.

**Response 204**: no content.

#### Internal Products (V2-7..V2-19)

#### V2-7 — POST `/api/v2/internal-products/search` (Search paginated — R10 GET→POST + keyword 3-col)

**Headers**: chuẩn. **Idempotency**: N/A (read-only search; POST chỉ vì composite body, KHÔNG side-effect).

**Request body**:
```json
{
  "keyword": "Lốp",
  "status": "ACTIVE",
  "nature": "GOODS",
  "materialGroupId": 123,
  "page": 0,
  "size": 20,
  "sort": "updatedAt,desc"
}
```

| Body field | Type | Required | Default | Description |
|---|---|---|---|---|
| `keyword` | string | NO | — | LIKE-unaccent **OR-match** trên 3 columns: `internal_product.code` (mã nội bộ), `internal_product.name` (tên), legacy `product.sku` (mã SKU mapped qua `internal_product_sku_mapping` join). Backend SQL pseudo: `WHERE LOWER(unaccent(ip.code)) LIKE :kw \|\| '%' OR LOWER(unaccent(ip.name)) LIKE :kw \|\| '%' OR EXISTS (SELECT 1 FROM internal_product_sku_mapping ipsm JOIN product p ON p.id = ipsm.product_id WHERE ipsm.internal_product_id = ip.id AND LOWER(unaccent(p.sku)) LIKE :kw \|\| '%')`. DISTINCT enforce để avoid duplicates từ nhiều SKU mappings. Index leverage: `(tenant_id, code)`, `(tenant_id, name)` trên `internal_product`; `uk_product_tenant_sku` trên legacy product. Single search-box UX. |
| `status` | enum | NO | **`ACTIVE`** | `ACTIVE \| INACTIVE` — không truyền → backend default `ACTIVE` per BR-CAT-PROD-007 (hide INACTIVE khỏi default UI list) |
| `nature` | enum | NO | — | `GOODS \| TOOL \| SERVICE \| OTHER` (R8 D-B English keys) — BR-CAT-PROD-019 |
| `materialGroupId` | long | NO | — | Filter sản phẩm thuộc 1 nhóm cụ thể |
| `page` | int | NO | 0 | |
| `size` | int | NO | 20 | Max 100 |
| `sort` | string | NO | `updatedAt,desc` | Allow `code,asc\|desc`, `name,asc\|desc`, `updatedAt,desc` |

**Response 200**:
```json
{
  "data": {
    "content": [
      {
        "id": 4001,
        "code": "IP-LOC-001",
        "name": "Lốp xe Bridgestone 195/65R15",
        "nature": "GOODS",
        "mainUnitCode": "PCS",
        "brand": "Bridgestone",
        "originCode": "JPN",
        "originDisplayName": "Nhật Bản",
        "imageUrl": "garage-001/internal-products/4001/image/main.jpg",
        "materialGroupId": 123,
        "materialGroupName": "Lốp xe",
        "status": "ACTIVE",
        "updatedAt": "2026-06-23T10:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 320,
    "totalPages": 16
  }
}
```

**Side-effect**: read-only.

#### V2-8 — GET `/api/v2/internal-products/{id}` (Detail enriched)

**Headers**: chuẩn. **Path params**: `id` (long, required).

**Response 200** (BR-CAT-CMN-002):
```json
{
  "data": {
    "id": 4001,
    "code": "IP-LOC-001",
    "name": "Lốp xe Bridgestone 195/65R15",
    "nature": "GOODS",
    "mainUnitCode": "PCS",
    "mainUnitDisplayName": "Cái",
    "materialGroupId": 123,
    "materialGroupName": "Lốp xe",
    "brand": "Bridgestone",
    "imageUrl": "garage-001/internal-products/4001/image/main.jpg",
    "originCode": "JPN",
    "originDisplayName": "Nhật Bản",
    "productSpec": "195/65R15",
    "technicalSpec": "Lốp xe du lịch, gai V-shape...",
    "pricingMethod": "PWA",
    "status": "ACTIVE",
    "conversionUnits": [
      {"id": 9001, "unitCode": "BOX", "unitDisplayName": "Thùng", "conversionRate": 4}
    ],
    "skuMappings": [
      {"id": 8801, "productId": 501, "sku": "BRG-19565R15-001", "productName": "Bridgestone Turanza 195/65R15", "mappedAt": "2026-06-20T10:00:00Z"}
    ],
    "attachments": [
      {"id": 7001, "fileName": "spec-bridgestone-195.pdf", "fileType": "application/pdf", "fileSizeBytes": 245678, "uploadedAt": "2026-06-20T10:15:00Z"}
    ],
    "description": "Lốp xe du lịch chuẩn Bridgestone — bền, êm",
    "notes": "Ghi chú admin: kho stock đầu kỳ 2026",
    "createdAt": "2026-06-20T09:00:00Z",
    "createdBy": "garage-owner@garage-001.vn",
    "updatedAt": "2026-06-23T10:00:00Z",
    "updatedBy": "garage-owner@garage-001.vn"
  }
}
```

**Error**: 404 + `ERR-CMN-not-found` nếu id không thuộc tenant.

> **V2-9 REMOVED (R10)** — BA đã chốt không track history audit cho internal_product. Standard audit cols `created_at/by`, `updated_at/by` trên `internal_product` table preserved cho basic audit; KHÔNG có history ledger riêng. Product layer đã đồng bộ — FEAT-CAT-PROD-DETAIL v3 (2026-06-16) chốt bỏ tab "Lịch sử"; FEAT-CAT-PROD-EDIT v3 gỡ "ghi lịch sử thao tác" + BR-CAT-CMN-001.

#### V2-10 — POST `/api/v2/internal-products` (Tạo mã sản phẩm nội bộ)

**Request body**:
```json
{
  "code": "IP-LOC-001",
  "name": "Lốp xe Bridgestone 195/65R15",
  "mainUnitCode": "PCS",
  "nature": "GOODS",
  "materialGroupId": 123,
  "brand": "Bridgestone",
  "imageUrl": "garage-001/internal-products/4001/image/main.jpg",
  "originCode": "JPN",
  "productSpec": "195/65R15",
  "technicalSpec": "Lốp xe du lịch, gai V-shape...",
  "description": "Lốp xe du lịch chuẩn Bridgestone — bền, êm",
  "notes": "Ghi chú admin: kho stock đầu kỳ 2026",
  "status": "ACTIVE",
  "pricingMethod": "PWA",
  "initialProductIds": [501, 502],
  "initialConversionUnits": [
    {"unitCode": "BOX", "conversionRate": 4}
  ],
  "attachments": [
    {
      "fileUrl": "s3://garage-attachments/tenant-133/ip-4001/spec-bridgestone-195.pdf",
      "fileName": "spec-bridgestone-195.pdf",
      "fileType": "application/pdf",
      "fileSizeBytes": 245678,
      "attachmentKind": "SPEC"
    }
  ]
}
```

**Validation**:
- `code`, `name`, `mainUnitCode` required (BR-CAT-PROD-005).
- `code` regex (BR-CAT-PROD-002 → `ERR-INV-006`) + tenant-unique (BR-CAT-PROD-003 → `ERR-INV-007`).
- `mainUnitCode` validate qua REST gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=UNIT` (cache 5min) — R8 D-A/E.
- `brand` (optional) — **free-text** VARCHAR(255), người dùng nhập tay. KHÔNG validate vs catalog master (R18 — revert R8 D-C decision). Vi phạm max-length → `400 ERR-CMN-validation`.
- `originCode` (optional) validate qua REST gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=COUNTRY` (cache 5min) — **R18** new. Format ISO 3166-1 alpha-3 (JPN/USA/VNM/CHN/...). Invalid → `400 ERR-CMN-validation` "Mã quốc gia xuất xứ không tồn tại".
- `imageUrl` (optional, R8 D-D + R25 OQ10 CLOSED 2026-06-25) — **opaque URL string** ≤ 500 chars. FE upload file lên S3 trực tiếp qua ct-file-storage (presigned URL pattern, ADR-016 reuse) → ct-file-storage trả URL/path → FE submit URL string đó vào field này. Backend persist nguyên văn, **KHÔNG validate format, KHÔNG generate path, KHÔNG quản lý S3 lifecycle** (mirror V2-18 attachment R11 pattern).
- `nature` ∈ enum `{GOODS, TOOL, SERVICE, OTHER}` (R8 D-B English keys; BR-CAT-PROD-019 → `ERR-INV-012`). Default `GOODS` nếu không truyền.
- `materialGroupId` (optional) phải ACTIVE (BR-CAT-PROD-009).
- `description` (optional, R11 + R26 OQ13 CLOSED 2026-06-25) — **"Mô tả"** (FE form label canonical), ≤500 chars. Vi phạm → `400 ERR-CMN-validation`.
- `notes` (optional, R11 + R26 OQ13 CLOSED 2026-06-25) — **"Ghi chú"** (FE form label canonical), ≤500 chars (R26 — đồng bộ với `description` về 500 chars, drop ≤1000 cũ). Vi phạm → `400 ERR-CMN-validation`.
- `initialProductIds[]` (optional) — mỗi `product_id` (legacy `product.id`, business: SKU mapping) chưa được mapping trong tenant (BR-CAT-PROD-013 → `ERR-INV-015`). R9: rename FK column `sku_id` → `product_id`.
- `initialConversionUnits[]` — mỗi row `conversionRate > 0` (`ERR-INV-013`); **scale ≤6 chữ số thập phân (`ERR-INV-047` — R29 BA 2026-06-26 cascade BR-CAT-PROD-011 v15)**; không trùng `unitCode` (`ERR-INV-014`); R8 D-E rename.
- `status` (optional) — enum `ACTIVE | INACTIVE`, backend default `ACTIVE` nếu không truyền (mirror V2-4/V2-11/V2-7 pattern). Invalid enum → `400 ERR-CMN-validation`.
- `pricingMethod` (optional, **R32 2026-07-01 — thêm vào V2-10, trước đây chỉ có ở V2-11**) — enum `{PWA, SI, FIFO, MA}` per ADR-017 + R13 BA rename (PWA = Bình quân cuối kỳ default; SI/FIFO/MA hiện là placeholder cho roadmap kế toán, chưa được business logic nào tiêu thụ). Backend default `PWA` nếu không truyền — cùng field name/enum/default với V2-11 (xem §V2-11 validation). Invalid enum → `400 ERR-CMN-validation`.
- `attachments[]` (optional, **R31 — inline-tại-create theo yêu cầu Delivery Authority 2026-07-01, không dùng chung shape với V2-18**) — mỗi item: `fileUrl` (string, required — S3 URL FE đã upload trước qua presigned URL, cùng pattern R11), `fileName` (string, required), `fileType` (string, required, MIME ∈ `{application/pdf, image/jpeg, image/png}`), `fileSizeBytes` (long, required), `attachmentKind` (string, optional — **default `IMAGE`** nếu omit). Validation tái dùng BR-CAT-PROD-015: tối đa 5 file/product (vượt → `400 ERR-CMN-004` `ATTACHMENT_LIMIT_EXCEEDED`); `fileSizeBytes` ≤ 30MB (vượt → `400 ERR-CMN-004` — BR-CAT-PROD-015 v17 R29 all-30MB bump, xem BR-GF-INVENTORY-CATALOG.md); `fileType` ngoài enum → `400 ERR-CMN-005` `ATTACHMENT_TYPE_INVALID`. Field name **trùng V2-18** kể từ v29 R35 (`fileName/fileType/fileSizeBytes/fileUrl/attachmentKind`) — trước đây khác nhau (`sizeBytes/storageUrl/kind`), nay đã hội tụ shape, xem R35 changelog.

**Response 201**: full DTO + audit fields (`created_at/by` set per Spring Data auditing — R10 history ledger removed). Response bao gồm `attachments[]` đã persist — cùng field shape request (`fileUrl, fileName, fileType, fileSizeBytes, attachmentKind`) + `id` tự sinh.

#### V2-11 — PUT `/api/v2/internal-products/{id}` (Sửa mã sản phẩm)

**Headers**: chuẩn. **Path params**: `id` (long, required).

**Request body** (subset mutable fields):
```json
{
  "name": "Lốp xe Bridgestone 195/65R15 - new name",
  "nature": "GOODS",
  "materialGroupId": 123,
  "brand": "Bridgestone",
  "imageUrl": "garage-001/internal-products/4001/image/main-v2.jpg",
  "originCode": "JPN",
  "productSpec": "195/65R15",
  "technicalSpec": "Updated spec...",
  "description": "Lốp xe du lịch — cập nhật mô tả",
  "notes": "Ghi chú: đã đổi thương hiệu, giá nhập tăng 5%",
  "status": "ACTIVE",
  "pricingMethod": "PWA",
  "mainUnitCode": "PCS"
}
```

> **R11 + R26**: `description` + `notes` mutable (cùng validation rule với V2-10 — cả 2 ≤500 chars, R26 OQ13 CLOSED). Có thể clear-by-null (set null → backend xóa giá trị cũ).

**Immutable** fields (gửi giá trị khác → `400 ERR-CMN-validation`):
- `code` — BR-CAT-PROD-004.
- `mainUnitCode` — **chỉ immutable post-transaction** per BR-CAT-PROD-006: backend check `EXISTS (SELECT 1 FROM inventory_transaction WHERE product_ref = {id})` — nếu có giao dịch → reject change `mainUnitCode`. Chưa có giao dịch → cho phép đổi. R8 D-E rename.

**Validation** (mutable):
- `name` required nếu present trong body.
- `nature` ∈ enum `{GOODS, TOOL, SERVICE, OTHER}` (R8 D-B; BR-CAT-PROD-019 → `ERR-INV-012`).
- `brand` (optional) — **free-text** VARCHAR(255). KHÔNG validate catalog (R18 revert R8 D-C). Cho phép gửi `null` để clear.
- `originCode` (optional) validate vs gf-erp-mdm catalog `directory=COUNTRY` (R18 new). Cho phép gửi `null` để clear.
- `imageUrl` (optional, R25 OQ10 CLOSED) — replace với URL mới hoặc pass `null` để clear field. **DB-only operation** — backend KHÔNG delete S3 object cũ (mirror V2-19 attachment R11 pattern); S3 orphan acceptable, cleanup do ct-file-storage / S3 lifecycle policy quản lý ngoài band (OQ14 scope DEV/Ops).
- `materialGroupId` (nếu set) phải ACTIVE (BR-CAT-PROD-009).
- `status` enum `ACTIVE | INACTIVE`. **Status delete-guard** per BR-CAT-PROD-008: đổi `ACTIVE → INACTIVE` mà còn open reservation/booking-line tham chiếu product → reject `400 ERR-INV-008` `INTERNAL_PRODUCT_HAS_TRANSACTIONS` (cùng namespace BR-CAT-PROD-016).
- `pricingMethod` enum `{PWA, SI, FIFO, MA}` per ADR-017 + R13 BA rename (PWA = Bình quân cuối kỳ default + only active; SI = Đích danh; FIFO = Nhập trước xuất trước; MA = Bình quân tức thời placeholder). Default `PWA` nếu không truyền (BR-CAT-PROD-010 hiện khóa).

**Response 200**: updated DTO (shape same as V2-8). Standard audit cols `updated_at/by` set per Spring Data auditing (R10 history ledger removed — no per-field diff tracking).

**R39 (2026-07-03) — Bulk sync 3 child collection (diff-by-id) — additive, backward-compat với 6 sub-resource endpoint V2-13..V2-19**:

Request body có thể chứa thêm 3 optional field để đồng bộ toàn bộ SKU mapping / conversion unit / attachment trong 1 lần gọi:

```json
{
  "initialProducts": [
    { "id": 8801, "productId": 501 },
    { "productId": 999 }
  ],
  "initialConversionUnits": [
    { "id": 9001, "unitCode": "PCS", "conversionRate": 1 },
    { "id": 9002, "unitCode": "BOX", "conversionRate": 4 },
    { "unitCode": "CTN", "conversionRate": 48 }
  ],
  "attachments": [
    {
      "id": 5001,
      "fileUrl": "https://cdn.example.com/att/5001.pdf",
      "fileName": "datasheet-v2.pdf",
      "fileType": "application/pdf",
      "fileSizeBytes": 524288,
      "attachmentKind": "DOCUMENT"
    },
    {
      "fileUrl": "https://cdn.example.com/att/new-coa.pdf",
      "fileName": "coa-2026.pdf",
      "fileType": "application/pdf",
      "fileSizeBytes": 245760,
      "attachmentKind": "DOCUMENT"
    }
  ]
}
```

**Semantic diff-by-id** (cả 3 collection):
- Item có `id` khớp row DB → **update** tại chỗ.
- Item không có `id` → **insert** row mới.
- Row trong DB nhưng không xuất hiện trong payload → **delete**.
- Payload = `null` (field vắng khỏi body) → **giữ nguyên collection** (không sync).
- Payload = `[]` → **xóa hết collection** (sau khi qua delete-guard).

**Update-in-place rule** (per collection):
- `initialProducts[]` — chỉ giữ mapping (no-op update); nếu `productId` khác row hiện tại → `400 ERR-CMN-validation` "Không được đổi productId của SKU mapping — xóa rồi thêm mới".
- `initialConversionUnits[]` — set `conversionRate` (validate `> 0` → `ERR-INV-013`; scale ≤6 → `ERR-INV-047`, R29). `unitCode` **immutable** per BR-CAT-PROD-011 — client đổi → `400 ERR-CMN-validation`.
- `attachments[]` — set `fileName` + `attachmentKind` metadata. **Nội dung file immutable** (per R31/R35): client đổi `fileUrl`/`fileType`/`fileSizeBytes` → `400 ERR-CMN-validation` "Không được đổi nội dung file — xóa rồi upload mới".

**Delete-guard** (rollback **toàn bộ request** kể cả scalar patch — cùng `@Transactional`):
- `initialProducts[]` delete: resolve SKU string từ legacy `product` table qua `productRepository.findAllByTenantIdAndIdInAndIsDeletedFalse`; nếu bất kỳ SKU trong danh sách bị xóa có row trong `inventory_transaction` → `400 ERR-INV-016 PRODUCT_HAS_TRANSACTIONS` (BR-CAT-PROD-014).
- `initialConversionUnits[]` delete: dùng `hasActivity(tenantId, internalProductId)` proxy (BR-CAT-PROD-012) — nếu product đã có bất kỳ transaction nào thì cấm xóa conv unit. Trade-off: `inventory_transaction` không lưu `unit_code`, nên guard là product-level (conservative). → `400 ERR-INV-016`.
- `attachments[]` delete: **không guard** (BR-CAT-PROD-015 không cấm xóa).

**Insert-phase reuse** validation hiện có:
- Attachment insert reuse cap 5 file/product + ≤30MB + MIME PDF/JPG/PNG (BR-CAT-PROD-015 v17) — cùng `persistAttachment()` helper với V2-18.
- Conv unit insert reuse unique `(tenant_id, internal_product_id, unit_code)` + rate > 0 + scale ≤6 — cùng `addConversionUnit()` helper với V2-15.
- SKU insert reuse `SKU_ALREADY_MAPPED` guard tenant-level (BR-CAT-PROD-013, `ERR-INV-015`) — cùng `mapSku()` helper với V2-13.

**Ordering** trong reconcile: **delete → flush → insert** — tránh vi phạm unique index khi user vừa xóa vừa thêm cùng `unitCode` / `productId` trong 1 request.

**Payload item errors** → `404 ERR-CMN-not-found` nếu `id` gửi lên không thuộc product hiện tại (không thuộc tenant hoặc thuộc product khác) — kiểm tra ở đầu reconcile phase, throw trước mọi write.

**Coexistence**: 6 sub-resource endpoint V2-13..V2-19 (POST/PUT/DELETE `/sku-mappings`, `/conversion-units`, `/attachments`) **giữ nguyên hoạt động** — FE có thể chọn 1 trong 2 path (single-row per call vs bulk sync trong V2-11).

#### V2-12 — DELETE `/api/v2/internal-products/{id}`

**Guard**: nếu mã đã giao dịch (có row trong `inventory_transaction` với product_ref hoặc đã mapping vào delivery/receipt items V2) → reject `ERR-INV-008` (BR-CAT-PROD-016). Chỉ delete được khi chưa giao dịch; cascade xóa `sku_mapping`, `conversion_unit`, `attachment` records cùng aggregate (R8 D-E + R10 — no history ledger).

#### V2-13 — POST `/api/v2/internal-products/{id}/sku-mappings` (Gắn SKU master)

**Headers**: chuẩn. **Path params**: `id` (long, required) — internal_product id.

**Request body**:
```json
{
  "productId": 501
}
```

**Validation**:
- `productId` required, phải exist trong legacy `product` table (SKU master per ADR-017 Q2; column name tường minh với referenced table per R9), cùng tenant.
- SKU **chưa được mapping** vào internal_product nào khác trong tenant (BR-CAT-PROD-013 → `400 ERR-INV-015` `SKU_ALREADY_MAPPED`). Backend check: `NOT EXISTS (SELECT 1 FROM internal_product_sku_mapping WHERE product_id = {productId} AND tenant_id = {ctx.tenantId})`.

**Response 201**:
```json
{
  "data": {
    "id": 8801,
    "productId": 501,
    "sku": "BRG-19565R15-001",
    "productName": "Bridgestone Turanza 195/65R15",
    "mappedAt": "2026-06-23T10:00:00Z",
    "mappedBy": "garage-owner@garage-001.vn"
  }
}
```

**Side-effect**: insert row `internal_product_sku_mapping` (R9 product_id column). Standard audit cols `created_at/by` set (R10 — no history ledger).

#### V2-14 — DELETE `/api/v2/internal-products/{id}/sku-mappings/{productId}` (Bỏ gắn SKU) — R9 path param rename

**Headers**: chuẩn. **Path params**: `id` (long, internal_product), `productId` (long — legacy `product.id`; FK column tường minh per R9). Business term "SKU" preserved trong path resource `/sku-mappings` + UX wording.

**Behavior** (BR-CAT-PROD-014): chỉ xóa row trong `internal_product_sku_mapping` (tenant-scoped). **KHÔNG** xóa hoặc modify legacy `product` row (xem §4 Forbidden).

**Response 204**: no content (R10 — no history ledger; mapping row deleted).

**Error**: 404 nếu mapping không tồn tại trong tenant.

#### V2-15 — POST `/api/v2/internal-products/{id}/conversion-units` (Thêm ĐVT quy đổi) — R8 D-E path rename

**Headers**: chuẩn. **Path params**: `id` (long, required).

**Request body**:
```json
{
  "unitCode": "BOX",
  "conversionRate": 4
}
```

**Validation** (BR-CAT-PROD-011 v15 — R29 BA 2026-06-26 cascade precision):
- `unitCode` required, validate qua REST gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=UNIT` (cache 5min) — R8 D-A/E. KHÔNG dùng local whitelist (xem §4 Forbidden).
- `conversionRate` required, `> 0` (decimal) → vi phạm `400 ERR-INV-013` `CONVERSION_RATE_INVALID`.
- `conversionRate` **scale ≤6 chữ số sau dấu phẩy** (R29 BA 2026-06-26) → vi phạm `400 ERR-INV-047` `CONVERSION_RATE_PRECISION_EXCEEDED` "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy". **App-layer guard bắt buộc** (Bean Validation custom annotation hoặc service-layer check) — DB `NUMERIC(18,6)` silently rounds vượt scale, KHÔNG raise. Xem data-model §4a.2 Precision guard block.
- KHÔNG trùng `unitCode` per product (tenant + product_id + unit_code unique) → `400 ERR-INV-014` `CONVERSION_UNIT_DUPLICATE`.

**Response 201**:
```json
{
  "data": {
    "id": 9001,
    "unitCode": "BOX",
    "unitDisplayName": "Thùng",
    "conversionRate": 4,
    "internalProductId": 4001
  }
}
```

**Side-effect**: insert row `internal_product_conversion_unit` (R8 D-E). Standard audit cols `created_at/by` set (R10 — no history ledger).

#### V2-16 — PUT `/api/v2/internal-products/{id}/conversion-units/{unitId}` (Sửa ĐVT quy đổi) — R8 D-E path rename

**Headers**: chuẩn. **Path params**: `id` (long, internal_product), `unitId` (long, conversion_unit row id).

**Request body**:
```json
{
  "conversionRate": 5
}
```

**Validation** (BR-CAT-PROD-012 + BR-CAT-PROD-011 v15 R29 precision):
- `unitCode` **immutable** (gửi → `400 ERR-CMN-validation`). Đổi unit = delete (V2-17) + add (V2-15).
- `conversionRate` `> 0` (`ERR-INV-013`); **scale ≤6 chữ số sau dấu phẩy → `400 ERR-INV-047`** (R29 BA 2026-06-26 — app-layer guard, xem V2-15 detail).

**Response 200**: updated DTO (same shape as V2-15 response). Standard audit cols `updated_at/by` set (R10 — no history ledger).

#### Misc (V2-17..V2-23)

#### V2-17 — DELETE `/api/v2/internal-products/{id}/conversion-units/{unitId}` (Xóa ĐVT quy đổi) — R8 D-E path rename

**Headers**: chuẩn. **Path params**: `id` (long, internal_product), `unitId` (long).

**Behavior** (BR-CAT-PROD-012): xóa row `internal_product_conversion_unit`. KHÔNG được xóa nếu đây là `mainUnitCode` của product (main unit quản lý ở `internal_product.main_unit_code`, không nằm trong conversion table — nhưng defensive check: nếu `unit_code = product.main_unit_code` → reject `400 ERR-CMN-validation` "Không thể xóa ĐVT chính").

**Response 204**: no content (R10 — no history ledger; conversion-unit row deleted).

**Error**: 404 nếu unitId không tồn tại trong product.

#### V2-18 — POST `/api/v2/internal-products/{id}/attachments` (Lưu metadata tệp đính kèm — R11 client-uploads-to-S3)

**Headers**: chuẩn + `Content-Type: application/json`. **Path params**: `id` (long, required).

> **R11 — FE-uploads-to-S3 pattern (per Delivery Authority feedback 2026-06-24)**: FE tự upload file lên S3 trực tiếp qua existing presigned URL API (ADR-016 pattern). Sau khi upload thành công, FE gửi metadata + S3 URL lên endpoint này để backend lưu vào DB. Backend **KHÔNG xử lý S3 binary** (no multipart, no S3 PutObject, no path generation).

**Request body** (JSON):
```json
{
  "fileName": "spec-bridgestone-195.pdf",
  "fileType": "application/pdf",
  "fileSizeBytes": 245678,
  "fileUrl": "s3://garage-attachments/tenant-133/ip-4001/spec-bridgestone-195.pdf",
  "attachmentKind": "DOCUMENT"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `fileName` | string | YES | Tên file gốc (display) |
| `fileType` | string | YES | MIME type ∈ `{application/pdf, image/jpeg, image/png}` |
| `fileSizeBytes` | long | YES | Kích thước file (bytes) |
| `fileUrl` | string | YES | S3 URL đã upload (FE provide sau khi upload xong) |
| `attachmentKind` | string | NO | Enum `AttachmentKind` — default suy ra từ `fileType` (`image/*` → `IMAGE`, còn lại → `DOCUMENT`) nếu omit |

**Validation** (BR-CAT-PROD-015):
- File count per product ≤ 5: backend COUNT `attachment WHERE product_id = {id} AND tenant_id = {ctx.tenantId}` trước insert; ≥5 → reject `400 ERR-CMN-004` `ATTACHMENT_LIMIT_EXCEEDED`.
- `fileSizeBytes` ≤ 10MB (10485760): vượt → `400 ERR-CMN-004` "Kích thước tệp vượt 10MB" (defensive — trust FE đã validate, backend re-check).
- `fileType` ∈ `{application/pdf, image/jpeg, image/png}`: ngoài enum → `400 ERR-CMN-005` `ATTACHMENT_TYPE_INVALID`.
- `fileUrl` required + must start with allowed S3 prefix (tenant-scoped defensive — vd `s3://garage-attachments/tenant-{tenantId}/`); vi phạm → `400 ERR-CMN-validation`.

**Response 201**:
```json
{
  "data": {
    "id": 7001,
    "internalProductId": 4001,
    "fileName": "spec-bridgestone-195.pdf",
    "fileType": "application/pdf",
    "fileSizeBytes": 245678,
    "fileUrl": "s3://garage-attachments/tenant-133/ip-4001/spec-bridgestone-195.pdf",
    "attachmentKind": "DOCUMENT",
    "uploadedAt": "2026-06-23T10:15:00Z",
    "uploadedBy": "garage-owner@garage-001.vn"
  }
}
```

**Side-effect**: insert `internal_product_attachment` row (metadata + URL only). Standard audit cols set (R10). **KHÔNG xử lý S3 binary** (FE đã upload trước qua presigned URL — R11).

#### V2-19 — DELETE `/api/v2/internal-products/{id}/attachments/{attachmentId}` (Xóa metadata tệp đính kèm — R11 DB-only)

**Headers**: chuẩn. **Path params**: `id` (long, internal_product), `attachmentId` (long).

> **R11 — DB-only delete (per Delivery Authority feedback 2026-06-24)**: Backend **chỉ DELETE row** `internal_product_attachment`. KHÔNG đụng S3 (không delete object). S3 objects orphan acceptable — FE/separate cleanup job/S3 lifecycle policy quản lý (OQ14).

**Behavior**: DELETE row `internal_product_attachment WHERE id = {attachmentId} AND tenant_id = {ctx.tenantId}`. Tenant-scoped enforced.

**Response 204**: no content (R10 — no history ledger; attachment row deleted; R11 — S3 object KHÔNG touch).

**Error**: 404 nếu attachmentId không thuộc product/tenant.

> **OQ14 (new R11)**: S3 cleanup strategy cho orphan objects (deleted attachment rows nhưng S3 objects giữ lại) — DEV/Ops responsibility. Suggest: S3 lifecycle policy với prefix-based expiration, hoặc batch reconcile DB ↔ S3. Out of arch-design scope.

#### V2-20/V2-21 — POST `/api/v2/internal-products/{verify-import,import}` (ADR-018)

**Headers**: chuẩn.

**Request body** (chung 2 endpoint):
```json
{
  "items": [
    {
      "code": "IP-LOC-001",
      "name": "Lốp xe Bridgestone 195/65R15",
      "mainUnitCode": "PCS",
      "brand": "Bridgestone",
      "originCode": "JPN",
      "nature": "GOODS",
      "materialGroupCode": "GRP-LOC-001",
      "productSpec": "195/65R15",
      "technicalSpec": "..."
    }
  ],
  "skipDuplicates": true
}
```

**Validation pre-handle**: `items.length` ≤ 500 (ADR-018 cap Phase 1) — vượt → HTTP 400 + **`ERR-INV-041`** (R28 canonical 2026-06-25 — sync Product `ERROR-CODE-REGISTRY v14 line 139` + `BR-CAT-PROD-020`) "Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần". Banner INLINE_FORM display token. Drop `ERR-INV-019` cũ (legacy proposed-only, sync canonical).

**`verify-import` response 200** (read-only — KHÔNG DB write):
```json
{
  "data": {
    "report": {
      "summary": {"total": 200, "valid": 180, "error": 20},
      "validRows": [{"rowIndex": 0, "item": {...}}],
      "errorRows": [
        {"rowIndex": 5, "item": {...}, "errors": ["ERR-INV-007 — Mã nội bộ đã tồn tại"]},
        {"rowIndex": 7, "item": {...}, "errors": ["ERR-INV-012 — Tính chất không hợp lệ"]}
      ]
    }
  }
}
```

**`import` response 200** (transactional commit valid rows; bỏ qua error rows per BR-CAT-PROD-017):
```json
{
  "data": {
    "importId": "imp-20260623-001",
    "importedCount": 180,
    "failedCount": 20,
    "report": { "...": "(same shape as verify-import)" }
  }
}
```

**Side-effect** (`import` only): insert valid rows vào `internal_product` (cột BR-CAT-PROD-017 subset, KHÔNG SKU/unit/attachment); standard audit cols `created_at/by` set (R10 — no history ledger); pricing_method default `PWA` (R13 rename — Bình quân cuối kỳ; BR-CAT-PROD-010 + cột trong template bị bỏ qua).

#### V2-22 — POST `/api/v2/internal-products/export` (Xuất .xlsx theo filter — R15 GET→POST align V2-7)

**Headers**: chuẩn.

**Security**: `tenant_id` resolved từ JWT security context — backend query implicit `WHERE tenant_id = :tenantId`; KHÔNG accept `{tenantId}` trong path/body. Cross-tenant access → 403 Forbidden (R22).

**Request body** (subset V2-7 search — R15):
```json
{
  "keyword": "Lốp",
  "status": "ACTIVE",
  "nature": "GOODS",
  "materialGroupId": 123
}
```

| Body field | Type | Required | Default | Description |
|---|---|---|---|---|
| `keyword` | string | NO | — | **Same semantics as V2-7**: LIKE-unaccent OR-match trên 3 columns (`internal_product.code` + `internal_product.name` + legacy `product.sku` qua JOIN). DISTINCT enforce. Xem V2-7 detail cho SQL pseudo. |
| `status` | enum | NO | **`ACTIVE`** | `ACTIVE \| INACTIVE` — không truyền → backend default `ACTIVE` per BR-CAT-PROD-007 |
| `nature` | enum | NO | — | `GOODS \| TOOL \| SERVICE \| OTHER` (R8 D-B + BR-CAT-PROD-019) |
| `materialGroupId` | long | NO | — | Filter sản phẩm thuộc 1 nhóm cụ thể |

**OMIT** (vs V2-7): `page`, `size`, `sort` — export tất cả matched rows.

**Validation pre-handle**: backend defensive cap — matched count > **1,000 rows** → reject `400` **`ERR-INV-045`** "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" (preserve TempFile budget + p95 latency target ≤ 10s). Hard cap aligned với V2-Q7 BFF mirror; FE web hiển thị **DIALOG** (per ERROR-CODE-REGISTRY v14 display token) gợi ý user áp filter chặt hơn (trạng thái / tính chất / nhóm vật tư/hàng hóa / từ khóa) trước khi retry. Canonical source: **`BR-CAT-PROD-024`** (BR-GF-INVENTORY-CATALOG v13) + **FEAT-CAT-PROD-EXPORT AC-5** + **ERROR-CODE-REGISTRY v14 line 143** (R23 sync 2026-06-25 — drop R22 wording "PENDING BA" + "ERR-CMN-validation tạm" + "EXPORT_ROW_CAP_EXCEEDED"; Product layer đã canonical hóa `ERR-INV-045` cùng date 2026-06-25, Architecture catch up).

**Behavior** (BR-CAT-PROD-018): generate .xlsx (Apache POI) với **9 cột canonical** theo template import (subset BR-CAT-PROD-017 — R8 + R18 rename): `code, name, mainUnitCode, nature (GOODS|TOOL|SERVICE|OTHER), materialGroupCode, brand` (free-text — R18), `originCode` (R18 codified vs `directory=COUNTRY`), `productSpec, technicalSpec`. Image URL KHÔNG export trong .xlsx (S3 path không có ý nghĩa offline; ảnh load qua UI). **Audit fields OMIT (R22)**: KHÔNG include `createdBy / createdByName / updatedBy / updatedByName / createdAt / updatedAt` — export là product snapshot (config data), KHÔNG phải audit log; audit info xem tại detail page V2-8. Tổng cộng **9 cột** (không phải 13 hay 15).

**Response format — Option A canonical (R22)**:

`200 OK` + `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` + `Content-Disposition: attachment; filename="danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx"` + body binary (octet-stream). Single-call backend stream pattern (Apache POI generate full .xlsx → flush → close). **Filename Vietnamese** mirror import sample `public/sample-files/danh-muc-ma-san-pham-noi-bo.xlsx` cho UX nhất quán giữa import/export.

> **Async/presigned URL pattern** (formerly Option B — 202 Accepted + polling/signed URL) — **DEFERRED** R22 (future expansion). Hiện canonical Option A đủ cho cap 1,000 rows + p95 latency budget ≤ 10s. Khi business yêu cầu export > 1K rows hoặc background generation, mở CR riêng + ADR mới.

**Side-effect**: read-only (no DB write).

#### V2-23 — GET `/api/v2/skus/search?q={text}&unmapped={bool}&page=&size=`

**Purpose**: search SKU từ legacy `product` table (SKU master per ADR-017 Q2). Khi `unmapped=true` → chỉ trả SKU CHƯA có row trong `internal_product_sku_mapping` cùng tenant (BR-CAT-PROD-013).

**Response 200**: paged list of `{productId, sku, name, brand, origin, mappingStatus: "UNMAPPED" | "MAPPED_OTHER" | "MAPPED_SELF"}` (modal "Gắn/bỏ gắn SKU" UX-FLOW §3.3). Note: `productId` = legacy `product.id` (R9 rename `skuId` → `productId` tường minh với referenced table); `sku` field giữ là string column từ `product.sku`. Legacy `product.brand` + `product.origin` field free-text được giữ nguyên cho SKU search (legacy schema untouched per ADR-017). Catalog-v2 `internal_product.brand` cũng free-text (post-R18 revert R8 D-C — symmetric với legacy); `internal_product.origin_code` codified vs `directory=COUNTRY` (R18 new — divergent với legacy free-text origin, chấp nhận được vì V2 schema mới).

### 3a.3 Common error code namespace (V2 additions)

> **Cross-ref**: `ERR-INV-*` codes thuộc namespace **gf-inventory** (boundary-local) — định nghĩa đầy đủ tại bảng dưới. `ERR-CMN-*` codes (cross-boundary common) định nghĩa tại central registry [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../Product/error-code/ERROR-CODE-REGISTRY.md) — bảng dưới chỉ liệt kê những mã `ERR-CMN-*` thực sự được dùng bởi V2 endpoints (PDF/JPG/PNG upload). Đầy đủ catalog `ERR-CMN-*` (vd `ERR-CMN-006` object storage timeout) phải tra cứu registry trung tâm.

| Code | HTTP | Condition | BR ref |
|---|---:|---|---|
| `ERR-INV-001` | 400 | Mã nhóm chứa ký tự đặc biệt | BR-CAT-GRP-002 |
| `ERR-INV-002` | 400 | Trùng mã nhóm trong tenant | BR-CAT-GRP-003 |
| `ERR-INV-003` | 400 | Cycle khi đổi parent_id | BR-CAT-GRP-009 |
| `ERR-INV-004` | 400 | Xóa nhóm có sản phẩm | BR-CAT-GRP-010 |
| `ERR-INV-005` | 400 | Xóa nhóm cha còn children | BR-CAT-GRP-011 |
| `ERR-INV-006` | 400 | Mã sản phẩm ký tự đặc biệt | BR-CAT-PROD-002 |
| `ERR-INV-007` | 400 | Trùng mã sản phẩm trong tenant | BR-CAT-PROD-003 |
| `ERR-INV-008` | 400 | Xóa sản phẩm đã giao dịch | BR-CAT-PROD-016 |
| `ERR-INV-012` | 400 | Nature ngoài enum | BR-CAT-PROD-019 |
| `ERR-INV-013` | 400 | Conversion rate ≤ 0 | BR-CAT-PROD-011 |
| `ERR-INV-014` | 400 | Trùng unit trong conversion (R8 D-E rename UoM → Unit) | BR-CAT-PROD-011 |
| `ERR-INV-047` | 400 | `CONVERSION_RATE_PRECISION_EXCEEDED` — tỷ lệ quy đổi vượt 6 chữ số thập phân (R29 BA 2026-06-26 — Product `ERROR-CODE-REGISTRY v16 line 145` + BR-CAT-PROD-011 v15); app-layer guard trước NUMERIC(18,6) silent-round; display `INLINE_FIELD` | BR-CAT-PROD-011 v15 |
| `ERR-INV-015` | 400 | SKU đã mapping mã khác | BR-CAT-PROD-013 |
| `ERR-INV-016` | 400 | Description > 255 chars | BR-CAT-GRP-012 |
| `ERR-INV-041` | 400 | Bulk import > 500 rows (R28 canonical 2026-06-25 — sync Product `ERROR-CODE-REGISTRY v14 line 139` + `BR-CAT-PROD-020`; drop `ERR-INV-019` legacy proposed) — display INLINE_FORM banner "Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần" | BR-CAT-PROD-020, ADR-018 |
| `ERR-INV-044` | 400 | Bulk import V2-20/V2-21 — `originCode` không khớp `directory=COUNTRY` (R28 canonical 2026-06-25 — sync Product `ERROR-CODE-REGISTRY v14 line 142` + `BR-CAT-PROD-023`) — display INLINE_FORM highlight dòng lỗi "Xuất xứ trong file không khớp danh mục xuất xứ" | BR-CAT-PROD-023, R18 |
| `ERR-INV-045` | 400 | Export V2-22 row-cap > 1000 rows — DIALOG "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" (R22 +R23 sync canonical 2026-06-25 — Product layer `ERROR-CODE-REGISTRY v14 line 143` + `FEAT-CAT-PROD-EXPORT v8 AC-5`) | BR-CAT-PROD-024 |
| `ERR-INV-027` | 413 | `MATERIAL_GROUP_TREE_OVERSIZE` — V2-2 tree > 1000 nodes/tenant; redirect FE V2-1 paginated (R3 F10) | ADR-017 defensive cap |
| `ERR-CMN-004` | 400 | Attachment > 10MB | BR-CAT-PROD-015 |
| `ERR-CMN-005` | 400 | Attachment type không thuộc PDF/JPG/PNG | BR-CAT-PROD-015 |

### 3a.4 UI Action → GraphQL → REST mapping (web)

| UI action (UX-FLOW) | GraphQL operation (agg-garage-graph) | REST endpoint (gf-inventory) |
|---|---|---|
| Tab Nhóm VTHH — danh sách (flat, R29 canonical) | `searchMaterialGroups(input: ...)` | V2-1 `POST /api/v2/material-groups/search` |
| ~~Tab Nhóm VTHH — cây~~ *(R29 BA 2026-06-26: UI W03 bỏ tree view, dùng flat list V2-1 + cột "Thuộc nhóm". V2-2/Q2 reserved future integration — KHÔNG bind UI)* | ~~`getMaterialGroupTree()`~~ | ~~V2-2 `GET /api/v2/material-groups/tree`~~ |
| Thêm nhóm | `createMaterialGroup(input: ...)` | V2-4 `POST /api/v2/material-groups` |
| Sửa nhóm | `updateMaterialGroup(id, input: ...)` | V2-5 `PUT /api/v2/material-groups/{id}` |
| Xóa nhóm | `deleteMaterialGroup(id)` | V2-6 `DELETE /api/v2/material-groups/{id}` |
| Tab Mã SP — list | `searchInternalProducts(input: ...)` | V2-7 `GET /api/v2/internal-products` |
| Chi tiết mã SP | `getInternalProduct(id)` | V2-8 (R10 — V2-9 history removed) |
| Thêm mã SP | `createInternalProduct(input: ...)` | V2-10 |
| Sửa mã SP | `updateInternalProduct(id, input: ...)` | V2-11 |
| Xóa mã SP | `deleteInternalProduct(id)` | V2-12 |
| Modal Gắn SKU — search | `searchSkus(q, unmapped: true)` | V2-23 |
| Modal Gắn SKU — gắn | `mapSkuToInternalProduct(id, productId)` | V2-13 (R9 arg rename) |
| Modal Bỏ gắn | `unmapSkuFromInternalProduct(id, productId)` | V2-14 (R9 arg rename) |
| Modal ĐVT quy đổi — thêm | `addConversionUnit(id, input: ...)` | V2-15 `/conversion-units` (R8 D-E) |
| Modal ĐVT quy đổi — sửa | `updateConversionUnit(id, unitId, input)` | V2-16 |
| Modal ĐVT quy đổi — xóa | `deleteConversionUnit(id, unitId)` | V2-17 |
| Thêm tệp đính kèm | `addInternalProductAttachment(id, input)` | V2-18 |
| Xóa tệp | `deleteInternalProductAttachment(id, attachmentId)` | V2-19 |
| Import — bước "Kiểm tra dữ liệu" | `verifyImportInternalProducts(input)` | V2-20 |
| Import — bước "Kết quả" | `importInternalProducts(input)` | V2-21 |
| Export | `exportInternalProducts(filter)` → file URL | V2-22 |

> **Mobile scope**: V2 endpoints này KHÔNG cho mobile trong batch hiện tại (UX-FLOW-INVENTORY-CATALOG.md:34 "Garage Care (Web GMS) only"). Future mobile expansion = CR riêng.

---

## 3b. Inventory V2 — Opening Balance + Stock Ledger (DESIGN — W04, ADR-020/021/022)

> Endpoint **mới ĐỘC LẬP** subsystem `opening-balance`. Prefix public `/api/v2/opening-balances`. Authentication = security context; tenant resolve từ JWT/security context. Headers chuẩn: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`. **Web GMS đầy đủ CRUD; App Garage view-only** danh sách (per `UX-FLOW-INVENTORY-OPENING-BALANCE.md:29`).
>
> Cross-boundary: gf-inventory (verify + import + edit + delete) call gf-accounting `/protected/v1/accounting-periods/lock-check` (ADR-019 REST advisory pattern re-use per ADR-021) — trong cùng transaction. Cascade sổ tồn qua `StockLedgerRecomputeService` (ADR-020 BR-STKV2-005a) intra-service sync.
>
> **Feature Flag**: toàn bộ 6 endpoints §3b được gate `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController` — **same flag** như catalog v2 (§3a), cover trọn Inventory V2 subsystem (catalog + opening-balance + future RECEIPT/DELIVERY/PRC W05/W06). Tenant chưa enable → HTTP 403. Web GMS ẩn menu route `/inventory/opening-balances*`; Mobile hub `FEAT-INV-MOBILE-MENU` tự động ẩn tile "Tồn đầu kỳ" theo state matrix client-side (per BR-INV-MENU-002). See `Product/epics/EP-INVENTORY-OPENING-BALANCE.md` §5.2 v3.

### 3b.1 Endpoint Summary — Opening Balance additions

| # | Method | Path | Module | Auth | BR / FEAT refs |
|---:|---|---|---|---|---|
| **W04-1** | `POST` | `/api/v2/opening-balances/search` | OpeningBalance | authenticated | BR-OB-014 (tenant + LIKE mã/tên + Kho/NgườiImport/NgàyImport + dòng Tổng), FEAT-OB-LIST AC-1..7 |
| **W04-3** | `POST` | `/api/v2/opening-balances/verify-import` | OpeningBalance | authenticated | BR-OB-004a all-or-nothing preview + BR-OB-004b 500-cap `ERR-INV-048` + BR-OB-005..016 + BR-OB-013 lock-check (ADR-021 verify) + ADR-022 wizard step, FEAT-OB-IMPORT AC-3b..5 |
| **W04-4** | `POST` | `/api/v2/opening-balances/import` | OpeningBalance | authenticated | BR-OB-004a commit + ADR-021 authoritative lock-check + ADR-020 cascade + FEAT-OB-IMPORT AC-6, AC-8 |
| **W04-5** | `PUT` | `/api/v2/opening-balances/{id}` | OpeningBalance | authenticated | BR-OB-EDIT-001..006, FEAT-OB-EDIT AC-1..9 |
| **W04-6** | `DELETE` | `/api/v2/opening-balances/{id}` | OpeningBalance | authenticated | BR-OB-DEL-002..004 single-row, FEAT-OB-LIST AC-11 |
| **W04-7** | `POST` | `/api/v2/opening-balances/delete-lines` | OpeningBalance | authenticated | BR-OB-DEL-001..004 batch + FEAT-OB-DELETE-LINES AC-1..5 |

### 3b.2 Endpoint details — full coverage

> **Coverage rule**: mỗi row §3b.1 có 1 detail sub-section riêng với 6 khối (Headers · Path/Query params · Request body · Response 2xx · Response 4xx/5xx · Semantics).

#### W04-1 — POST `/api/v2/opening-balances/search`

**Headers**: `Authorization: Bearer <jwt>` (BR-OB-014 tenant scope) · `X-Tenant-Id: <int>` · `X-Branch-Id: <int>`.

**Path / Query params**: (none — POST body carries filter).

**Request body**:
```json
{
  "keyword": "Lốp",
  "warehouseId": 12,
  "createdBy": "operator@garage.com",
  "importedFrom": "2026-01-01",
  "importedTo": "2026-07-06",
  "page": 0,
  "size": 20,
  "sort": "createdAt,desc"
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `keyword` | string | NO | LIKE mã/tên sản phẩm nội bộ (accent-insensitive) | `BR-OB-014` |
| `warehouseId` | int64 | NO | Scalar FK `warehouse.id` — tenant-scoped | `BR-OB-014` filter Kho |
| `createdBy` | string | NO | Match `opening_balance_line.created_by` | `BR-OB-014` filter Người import |
| `importedFrom` / `importedTo` | date (ISO-8601) | NO | Range on `created_at` | `BR-OB-014` filter Ngày import |
| `page` / `size` | int | NO | Default 0/20, max size 100 | FEAT-OB-LIST AC-6 |
| `sort` | string | NO | Default `createdAt,desc` (mới nhất lên đầu — BR-OB-014) | FEAT-OB-LIST AC-2 |

**Response 2xx** (200 OK):
```json
{
  "content": [
    {
      "id": 5001,
      "productCode": "SP-NB-000123",
      "productName": "Lốp xe 175/70R13",
      "mainUnitCode": "PCS",
      "warehouseCode": "WH-01",
      "warehouseName": "Kho tổng",
      "quantityOnHand": 240,
      "valueOnHand": 12000000,
      "asOfDate": "2026-01-01",
      "createdBy": "operator@garage.com",
      "createdAt": "2026-01-05T09:12:33Z"
    }
  ],
  "totalElements": 132,
  "totalPages": 7,
  "page": 0,
  "size": 20,
  "aggregates": { "totalQuantity": 12456, "totalValue": 987654321 }
}
```

| Field | Type | Cite |
|---|---|---|
| `content[]` | array | FEAT-OB-LIST AC-2 columns |
| `aggregates.totalQuantity` / `totalValue` | number | FEAT-OB-LIST AC-3 dòng Tổng (theo filter hiện tại) |

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body validation invalid (dates malformed, size > 100) |
| 401 | Missing/invalid JWT |
| 403 | `X-Tenant-Id` mismatch với token tenant (tenant-mismatch) |
| 500 | Unexpected DB error |

**Semantics**:
- Pagination: cursor-based fallback nếu tenant có > 10k OB rows (thresholds — HLD Performance & Scale). Default offset OK cho baseline OB (small dataset per tenant).
- Permission gate: `accountant` + `garage-owner` (BR-OB-CMN-002).
- Index used: `idx_ob_tenant_created (tenant_id, created_at DESC)` cho default sort; `idx_ob_tenant_warehouse_asof` khi filter warehouseId + asOfDate.
- p95 target: ≤ 300ms (dashboard).

> **W04-2 removed 2026-07-06** — template `.xlsx` chuyển sang FE bundled static asset per BA/PO decision. Renumber W04-3..W04-7 skipped để giữ audit trail (audit trail Change Log v34 vẫn quote W04-2 wording cũ). FE source: `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` sync vào `frontend/gf-gms-web/src/assets/`, render qua `<a href={bundled_url} download>` — zero BFF/BE call.

#### W04-3 — POST `/api/v2/opening-balances/verify-import`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id`.

**Path / Query params**: (none).

**Request body** (JSON, per ADR-022):
```json
{
  "fileName": "OB-2026-Q1.xlsx",
  "fileChecksum": "sha256:abc123...",
  "rows": [
    {
      "rowNumber": 2,
      "productCode": "SP-NB-000123",
      "productName": "Lốp xe 175/70R13",
      "unitName": "Cái",
      "mainUnitCode": "PCS",
      "warehouseName": "Kho tổng",
      "warehouseId": 12,
      "quantity": 240,
      "value": 12000000,
      "asOfDate": "2026-01-01"
    }
  ]
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `fileName` | string | YES | ≤ 255 chars | BR-OB-CMN-001 |
| `fileChecksum` | string | YES | SHA-256 hex | BR-OB-CMN-001 |
| `rows[]` | array | YES | Length **1..500** — > 500 → `ERR-INV-048` (BR-OB-004b) | BR-OB-004b ADR-022 |
| `rows[].rowNumber` | int | YES | ≥ 2 (row 1 = header) | ADR-022 |
| `rows[].productCode` | string | YES | LIKE `internal_product.code` — must resolve to ACTIVE (BR-OB-006 → `ERR-INV-009`; BR-OB-007 → `ERR-INV-010`) | BR-OB-006/007 |
| `rows[].unitName` | string | YES | Match `internal_product.main_unit_code` tên hiển thị (BR-OB-010 → `ERR-INV-019`). Fallback path nếu `mainUnitCode` missing. | BR-OB-010 |
| `rows[].mainUnitCode` | string | NO (v43 add) | **v43 add** per user quannn 2026-07-08 + AskUserQuestion Option "Add alongside". Canonical unit code (e.g. `PCS`) khớp `internal_product.main_unit_code`. Authoritative khi provided; nếu missing → fallback resolve từ `unitName` (BR-OB-010 legacy path). Mismatch với `unitName` khi cả 2 present → `ERR-INV-019`. | BR-OB-010 |
| `rows[].warehouseName` | string | YES | Match `warehouse.name`/`code` cho tenant (BR-OB-005 → `ERR-INV-020`). Fallback path nếu `warehouseId` missing. | BR-OB-005 |
| `rows[].warehouseId` | int | NO (v43 add) | **v43 add** per user quannn 2026-07-08. Canonical `warehouse.id` (int scalar FK) cho tenant. Authoritative khi provided; nếu missing → fallback resolve từ `warehouseName` (BR-OB-005 legacy path). Mismatch với `warehouseName` khi cả 2 present → `ERR-INV-020`. | BR-OB-005 |
| `rows[].quantity` | number | YES | > 0 (BR-OB-008 → `ERR-INV-032`) | BR-OB-008 |
| `rows[].value` | number | YES | ≥ 0 (BR-OB-009 → `ERR-INV-033`; empty → 0) | BR-OB-009 |
| `rows[].asOfDate` | date (ISO-8601) | YES | Format `YYYY-MM-DD` (BR-OB-011 → `ERR-INV-018`); lock-check via ADR-021 → `ERR-INV-024` nếu CLOSED | BR-OB-011, BR-OB-013 |

**Response 2xx** (200 OK):
```json
{
  "totalRows": 100,
  "validRows": 95,
  "errorRows": 5,
  "warehousesInFile": ["Kho tổng", "Kho phụ"],
  "previewLines": [
    {
      "rowNumber": 2,
      "status": "VALID",
      "resolvedProductCode": "SP-NB-000123",
      "resolvedWarehouseCode": "WH-01",
      "errors": []
    },
    {
      "rowNumber": 3,
      "status": "ERROR",
      "errors": [
        { "code": "ERR-INV-019", "field": "unitName", "message": "ĐVT trong file khác ĐVT chính của mã sản phẩm" },
        { "code": "ERR-INV-024", "field": "asOfDate", "message": "Tồn đến ngày rơi vào kỳ kế toán đã đóng" }
      ]
    }
  ],
  "canCommit": false
}
```

| Field | Type | Cite |
|---|---|---|
| `totalRows` / `validRows` / `errorRows` | int | FEAT-OB-IMPORT AC-4 cards |
| `warehousesInFile[]` | string[] | FEAT-OB-IMPORT AC-4 card "Kho áp dụng" |
| `previewLines[]` | array | FEAT-OB-IMPORT AC-4 bảng preview |
| `canCommit` | bool | `canCommit = (totalRows > 0 AND errorRows == 0)`. `false` khi có bất kỳ dòng lỗi nào (BR-OB-004a all-or-nothing) HOẶC file rỗng (`totalRows == 0`, không có gì để commit — BA/PO chốt 2026-07-06 phương án (b)). FE disable nút "Xác nhận import" khi `canCommit=false`. Với case empty file: FE render banner INFO "File không có dữ liệu, không có gì để import" (không phải error message) — không có mã lỗi nào được throw cho case này. |

**Empty-file semantics** (BA/PO chốt 2026-07-06 — phương án (b) cho case file rỗng chỉ có headers, 0 dòng dữ liệu):
- verify-import PASS (không throw error, HTTP 200): response body `{totalRows: 0, validRows: 0, errorRows: 0, canCommit: false, warehousesInFile: [], previewLines: []}`.
- `canCommit=false` theo công thức trên (vì `totalRows === 0`).
- BFF/FE render banner **INFO** (không phải ERROR) "File không có dữ liệu, không có gì để import" trong preview area; nút "Xác nhận import" DISABLED.
- Ngữ nghĩa "empty file" **khác biệt hoàn toàn** với `ERR-INV-048` (over-cap > 500 dòng) và extension mismatch — KHÔNG dùng chung mã lỗi. Empty file không được coi là error, chỉ là no-op không cho commit.

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body invalid (rows length > 500 → `ERR-INV-048` returned as top-level error per BR-OB-004b; hoặc extension mismatch nếu bypass FE first-check → `ERR-CMN-validation`) |
| 400 | fileChecksum format invalid |
| 401 / 403 | Auth/tenant |
| 502 / 503 | gf-accounting lock-check unreachable → response body includes `warningLockCheckUnavailable: true` per row có unresolvable asOfDate → FE mark preview "Kỳ chưa xác định", disable commit (ADR-021 fail-CLOSED verify-open-marker) |

Note: **KHÔNG có row cho case file rỗng** trong bảng error codes trên — case này trả HTTP 200 với `canCommit=false` (xem "Empty-file semantics" ở trên).

**Semantics**:
- Read-only preview; NO state change.
- Idempotent — chạy lại cùng payload → cùng response (cache-friendly).
- Permission: dual persona.
- Lock-check per distinct `asOfDate` — parallel fetch + LRU cache 30s scope `(tenantId, date)` (ADR-021).
- p95 target: ≤ 2s cho 500 rows (dominated bởi lock-check dedup); ≤ 50ms cho empty file (không có row nào để validate).
- Errors enumerated: `ERR-INV-009/010/017/018/019/020/024/032/033/034/035/036/048`. **KHÔNG có mã lỗi cho case empty file** (BA/PO chốt 2026-07-06 phương án (b) — xem ADR-022 v3).
- **Canonical + display coexist (v43 add per user quannn 2026-07-08)**: row shape carry cả canonical identifier (`mainUnitCode` + `warehouseId`) và display fallback (`unitName` + `warehouseName`). Backend behavior: (a) nếu FE gửi `mainUnitCode` → authoritative validate cross-check với `unitName` khi cả 2 present; (b) nếu FE chỉ gửi `unitName` (legacy path) → resolve tới canonical qua `internal_product.main_unit_code`; (c) tương tự cho `warehouseId` vs `warehouseName`. Mismatch giữa canonical + display khi cả 2 present → `ERR-INV-019` (unit) hoặc `ERR-INV-020` (warehouse). Migration semantic: sau FE 100% send canonical → separate CR deprecate legacy `unitName`/`warehouseName` inputs.

#### W04-4 — POST `/api/v2/opening-balances/import`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id` · `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` (ADR-022 idempotency; TTL 24h qua `processed_events`).

**Path / Query params**: (none).

**Request body**: **cùng schema với W04-3 verify-import** — client submit lại cùng payload sau khi verify pass. BE re-run mọi validation + lock-check authoritative (ADR-022 defense-in-depth).

**Response 2xx** (200 OK):
```json
{
  "totalRows": 100,
  "importedRows": 100,
  "importedAt": "2026-07-06T09:45:12Z",
  "importedBy": "operator@garage.com",
  "fileName": "OB-2026-Q1.xlsx",
  "fileChecksum": "sha256:abc123...",
  "cascadedKeys": [
    { "productCode": "SP-NB-000123", "warehouseCode": "WH-01", "fromDate": "2026-01-01", "recomputedRows": 8 }
  ]
}
```

| Field | Type | Cite |
|---|---|---|
| `importedRows` | int | = `totalRows` (BR-OB-004a all-or-nothing) — FEAT-OB-IMPORT AC-8 kết quả card |
| `cascadedKeys[]` | array | Audit của recompute forward. **Mỗi item = 1 result shape per [ADR-020 §Component Interface C4](../decisions/ADR-020-stock-ledger-daily-snapshot.md)** — canonical field `affectedRows` (= count row `inventory_stock_ledger` delete + reinsert cho key đó). Legacy alias `recomputedRows` giữ deprecation window: api.md v41 vẫn expose `recomputedRows`; next bump (dự kiến v42+) sẽ expose cả 2 field 1 wave rồi deprecate `recomputedRows`. FE có thể display "N rows ledger đã cập nhật" optional (N = `recomputedRows` hoặc canonical `affectedRows` khi rename hoàn tất). |

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Any row error → `{errorCode: "ERR-INV-034/024/...", errorRows: [...]}` — transaction rolled back (BR-OB-004a) |
| 400 | `X-Idempotency-Key` missing/malformed |
| 409 | `X-Idempotency-Key` đã dùng trong 24h — trả cached response 200 OK với `alreadyImported: true` (idempotent replay) |
| 401 / 403 | Auth/tenant |
| 500 | Cascade recompute failure (ADR-020 `ERR-INV-036` intermediate tồn âm) → whole transaction rollback → return code + affected key |
| 503 | gf-accounting lock-check down → fail-CLOSED (ADR-021), return `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (toast platform-wide, FE render retry button) |

**Semantics**:
- Idempotent qua `X-Idempotency-Key` — dedup 24h in `processed_events`.
- Single `@Transactional` (JPA batch_size=100) → all-or-nothing (BR-OB-004a, ADR-022).
- Cascade `StockLedgerRecomputeService.recompute(fromDate = min OB date for each key)` inside transaction (ADR-020) — invariant `closing_qty ≥ 0` enforce → throw `ERR-INV-036` triggers rollback.
- Redisson lock per `(tenant, productId, warehouseId)` during recompute (ADR-020 concurrency guard).
- p95 target: ≤ 5s cho 500 rows với avg 5-year cascade forward per key.
- Permission: dual persona.

#### W04-5 — PUT `/api/v2/opening-balances/{id}`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id` · `X-Idempotency-Key` (optional; retry safety).

**Path / Query params**:
| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `id` | int64 | YES | `opening_balance_line.id` — tenant-scoped | FEAT-OB-EDIT AC-1 |

**Request body**:
```json
{
  "productCode": "SP-NB-000123",
  "warehouseId": 12,
  "quantity": 220,
  "value": 11000000,
  "asOfDate": "2026-01-01"
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `productCode` | string | YES | Same as verify (BR-OB-EDIT-006). Backend auto-derive `mainUnitCode` từ `internal_product.main_unit_code` theo productCode — user KHÔNG gửi mainUnitCode (v44 clarify per user quannn 2026-07-08). | FEAT-OB-EDIT AC-2 Sản phẩm |
| `warehouseId` | int | YES | **v44 rename** từ `warehouseCode: string` → `warehouseId: int` per user quannn 2026-07-08 "chuyền warehouseId thay vì warehouseCode". Canonical `warehouse.id` scalar FK cho tenant. Tenant-scoped lookup (BR-OB-EDIT-006 → `ERR-INV-020` nếu không tồn tại hoặc cross-tenant). Breaking change contract — W04 chưa DEV nên safe at design time. | FEAT-OB-EDIT AC-2 Kho |
| `quantity` | number | YES | > 0 (BR-OB-EDIT-006 → `ERR-INV-032`) | FEAT-OB-EDIT AC-9 |
| `value` | number | YES | ≥ 0 (BR-OB-EDIT-006 → `ERR-INV-033`) | FEAT-OB-EDIT AC-9 |
| `asOfDate` | date | YES | Lock-check both OLD + NEW date (FEAT-OB-EDIT AC-5 + EC-8) → `ERR-INV-024` | FEAT-OB-EDIT AC-5 |

**Response 2xx** (200 OK): full `OpeningBalanceLineResponse` (same fields as W04-1 content item) + `cascadedKeys[]` (recompute affected keys — both OLD combo if changed AND NEW combo; shape per [ADR-020 §Component Interface C4](../decisions/ADR-020-stock-ledger-daily-snapshot.md) result shape).

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body invalid; `ERR-INV-010/017/018/019/020/032/033/034/035` |
| 400 | `ERR-INV-024` OLD or NEW asOfDate falls in CLOSED period (FEAT-OB-EDIT AC-5, EC-8) |
| 400 | `ERR-INV-034` (mã+kho) mới trùng dòng OB khác (BR-OB-EDIT-005) |
| 400 | `ERR-INV-035` asOfDate ≥ ngày phiếu (BR-OB-EDIT-004) |
| 400 | `ERR-INV-036` cascade tồn âm point-in-time (BR-OB-EDIT-003) |
| 401 / 403 | Auth/tenant |
| 404 | `id` không tồn tại hoặc đã bị xóa (FEAT-OB-EDIT EC-7) |
| 500 | Cascade rollback |
| 503 | gf-accounting lock-check down → fail-CLOSED (ADR-021), return `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (toast platform-wide, FE render retry button) |

**Semantics**:
- Idempotent via `X-Idempotency-Key` optional; PUT natural semantic.
- Single `@Transactional`: check OLD lock, apply update, check NEW lock, recompute cascade from `min(OLD.asOfDate, NEW.asOfDate)`.
- Permission: dual persona (BR-OB-CMN-002).
- p95: ≤ 3s.
- **`mainUnitCode` auto-derived (v44 clarify per user quannn 2026-07-08 "mainUnitCode luôn lấy theo internal_product")**: KHÔNG có trong request body — backend resolve từ `internal_product.main_unit_code` theo `productCode` mỗi lần update per FEAT-OB-EDIT AC-5 "ĐVT readonly auto-derived from productCode server-side". Snapshot persistence: DB column `unit_code` update tự động khi productCode đổi (per BR-OB-EDIT-006 same as verify BR-OB-010 resolve rule). FE KHÔNG cần gửi mainUnitCode.
- **`warehouseId` canonical (v44 rename)**: backend nhận int scalar FK, lookup `warehouse.id` tenant-scoped, resolve tới `warehouse.code` string cho snapshot persistence (DB column `warehouse_code` giữ string — không đổi data model). Breaking change contract từ v43 `warehouseCode: string` — W04 chưa DEV nên safe.

#### W04-6 — DELETE `/api/v2/opening-balances/{id}`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id`.

**Path / Query params**:
| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `id` | int64 | YES | `opening_balance_line.id` | FEAT-OB-LIST AC-11 |

**Request body**: N/A.

**Response 2xx** (204 No Content):
```json
{ "deletedId": 5001, "cascadedRecomputedRows": 8 }
```

(HTTP 200 với body — alternative: 204 no-body — pick 200 để carry cascade audit info per ADR-020 test verification).

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | `ERR-INV-024` asOfDate CLOSED (BR-OB-DEL-002) |
| 400 | `ERR-INV-036` xóa làm tồn cascade âm (BR-OB-DEL-003) |
| 401 / 403 | Auth/tenant |
| 404 | Not found |
| 503 | gf-accounting lock-check down → fail-CLOSED (ADR-021), return `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (toast platform-wide, FE render retry button) |

**Semantics**:
- Hard delete row + cascade recompute (ADR-020).
- Idempotent (repeat DELETE → 404 sau lần đầu).
- Permission: dual persona.
- p95: ≤ 2s.

#### W04-7 — POST `/api/v2/opening-balances/delete-lines`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id` · `X-Idempotency-Key` (recommended).

**Path / Query params**: (none).

**Request body**:
```json
{ "ids": [5001, 5002, 5003] }
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `ids[]` | int64[] | YES | 1..500 length; each ID tenant-scoped | FEAT-OB-DELETE-LINES AC-1 |

**Response 2xx** (200 OK):
```json
{
  "requestedCount": 3,
  "deletedCount": 3,
  "cascadedKeys": [ { "productCode": "SP-NB-000123", "warehouseCode": "WH-01", "recomputedRows": 5 } ]
}
```

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Guardrail vi phạm — BE validate **fail-fast** theo thứ tự `ids[]` trong request, dừng ngay khi gặp id đầu tiên vi phạm (KHÔNG loop qua hết list). Chặn cả lô (BR-OB-DEL-004, FEAT-OB-DELETE-LINES AC-4) — không xóa bất kỳ dòng nào. Response `{errorCode, offendingIds: [<id đầu tiên bị lỗi>]}`. Mã có thể là `ERR-INV-024` (id đó thuộc kỳ kế toán đã đóng — BR-OB-DEL-002) hoặc `ERR-INV-036` (xóa id đó làm cascade tồn âm — BR-OB-DEL-003), tuỳ guardrail nào fail trước theo thứ tự id. FE render popup verbatim per AC-4 (wording generic bao cả 2 case, không phụ thuộc mã cụ thể). |
| 401 / 403 | Auth/tenant |
| 404 | Any ID not found → return `{errorCode: "ERR-CMN-not-found", offendingIds}` |
| 500 | Cascade rollback |
| 503 | gf-accounting lock-check down → fail-CLOSED (ADR-021), return `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (toast platform-wide, FE render retry button) |

**Semantics**:
- Single `@Transactional` — atomic all-or-nothing (BR-OB-DEL-004).
- Cascade forward mỗi (product, warehouse) touched — Redisson lock per key.
- Idempotent via key.
- Permission: dual persona.
- p95: ≤ 5s cho batch 500.
- Validate **fail-fast**: iterate `ids[]` theo thứ tự, dừng ngay tại id đầu tiên vi phạm — không tiếp tục check các id còn lại. Chặn cả lô (BR-OB-DEL-004). BE early return giảm cost khi lô lớn có lỗi sớm. KHÔNG cần rule ưu tiên `ERR-INV-024` vs `ERR-INV-036` — tuỳ id nào đến trước theo thứ tự request.

### 3b.3 Common error code namespace (W04 additions)

| Code | HTTP | Meaning | BR |
|---|---|---|---|
| `ERR-INV-009` | 400 | Mã sản phẩm nội bộ không tồn tại | BR-OB-006 |
| `ERR-INV-010` | 400 | Mã sản phẩm ngừng hoạt động | BR-OB-007 / BR-OB-EDIT-006 |
| `ERR-INV-017` | 400 | Thiếu trường bắt buộc | BR-OB-011 / BR-OB-EDIT-006 |
| `ERR-INV-018` | 400 | Sai định dạng ngày | BR-OB-011 |
| `ERR-INV-019` | 400 | ĐVT trong file khác ĐVT chính | BR-OB-010 |
| `ERR-INV-020` | 400 | Kho không tồn tại trong danh mục | BR-OB-005 / BR-OB-EDIT-006 |
| `ERR-INV-024` | 400 | Tồn đến ngày rơi vào kỳ đã đóng | BR-OB-013 / BR-OB-EDIT-002 / BR-OB-DEL-002 (ADR-021 cross-boundary lock-check) |
| `ERR-INV-032` | 400 | Số lượng tồn ≤ 0 | BR-OB-008 / BR-OB-EDIT-006 |
| `ERR-INV-033` | 400 | Giá trị tồn < 0 | BR-OB-009 / BR-OB-EDIT-006 |
| `ERR-INV-034` | 400 | Trùng OB (mã+kho) | BR-OB-012 / BR-OB-EDIT-005 |
| `ERR-INV-035` | 400 | OB sau/cùng ngày phiếu | BR-OB-016 / BR-OB-EDIT-004 |
| `ERR-INV-036` | 400 | Cascade tồn âm point-in-time | BR-OB-015 / BR-OB-EDIT-003 / BR-OB-DEL-003 / BR-STKV2-005a bước 4 (ADR-020) |
| `ERR-INV-048` | 400 | Vượt 500 dòng/lần import (verify + import) | BR-OB-004b (ADR-022) |

### 3b.4 UI Action → GraphQL → REST mapping (Opening Balance — web + mobile)

| Screen / Action | Platform | GraphQL Op | REST |
|---|---|---|---|
| Tab "Tồn đầu kỳ" open → list | Web + Mobile view-only | `query searchOpeningBalances(input)` | W04-1 |
| Bấm link "Tải template" | Web only | (none — FE bundled static asset) | (none — FE serve từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` sync vào FE bundle) |
| Wizard step 2 "Kiểm tra dữ liệu" | Web only | `mutation verifyImportOpeningBalances(input)` | W04-3 |
| Wizard step 3 "Xác nhận import" | Web only | `mutation importOpeningBalances(input)` | W04-4 |
| Icon "Sửa" ✏️ | Web only | `mutation updateOpeningBalanceLine(id, input)` | W04-5 |
| Icon "Xóa" 🗑️ per row | Web only | `mutation deleteOpeningBalanceLine(id)` | W04-6 |
| Nút "Xóa dòng đã chọn" | Web only | `mutation deleteOpeningBalanceLines(ids)` | W04-7 |

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.
- **V2-20/V2-21 (bulk import)** — KHÔNG accept multipart file upload; KHÔNG parse `.xlsx` server-side; KHÔNG accept array > 500 (ADR-018 Phase 1). Defensive enforce ở backend kể cả BFF đã cap.
- **V2 catalog endpoints** — KHÔNG cho phép modify legacy `product` row qua mapping endpoints (bỏ gắn SKU chỉ xóa mapping row, KHÔNG xóa `product`; BR-CAT-PROD-014).
- **mainUnitCode validation** (R8 D-A/E) — KHÔNG dùng local enum/whitelist; phải REST call gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=UNIT` (cache 5min OK). Bypass = drift catalog master.
- **originCode validation** (R18 new) — KHÔNG accept free-text origin; phải REST call gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=COUNTRY` (cache 5min OK). Format ISO 3166-1 alpha-3 (JPN/USA/VNM/...). Free-text / sai format → `400 ERR-CMN-validation`.
- **imageUrl** (R8 D-D + R25 OQ10 CLOSED) — gf-inventory persist URL string opaque (≤ 500 chars); KHÔNG validate format, KHÔNG validate prefix, KHÔNG enforce S3 path convention, KHÔNG delete S3 object. S3 ownership thuộc ct-file-storage (mirror V2-18/V2-19 attachment R11 pattern).

---

## 5. Naming Registry (cross-tier canonical names — BE ↔ BFF ↔ FE ↔ Mobile)

> Applies to §3a (Catalog V2) và §3b (Opening Balance + Stock Ledger). Rule: **1 concept ↔ 1 canonical name across 4 tiers**. Naming conflict → T6 trigger; enum value verbatim, no ellipsis. Path params in registry (no rename cross-tier).

### 5.1 Opening Balance (W04)

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Dòng tồn đầu kỳ (bản ghi) | `OpeningBalanceLine` (entity) | `type OpeningBalanceLine` | `type OpeningBalanceLine` | `class OpeningBalanceLine` | `KG.gf-inventory.entities.OpeningBalanceLine` (needs_kg_update) |
| ID dòng OB | `id: Long` | `id: Int!` | `id: number` | `id: int` | data-model §4b.2 `opening_balance_line.id` |
| Mã sản phẩm nội bộ | `productCode: String` | `productCode: String!` | `productCode: string` | `productCode` | `BR-OB-001` `internal_product.code` snapshot |
| Tên sản phẩm nội bộ | `productName: String` | `productName: String` | `productName: string` | `productName` | FEAT-OB-LIST AC-2 |
| Mã kho | `warehouseCode: String` | `warehouseCode: String!` | `warehouseCode: string` | `warehouseCode` | `BR-OB-005` `warehouse.code` snapshot |
| Tên kho | `warehouseName: String` | `warehouseName: String` | `warehouseName: string` | `warehouseName` | FEAT-OB-LIST AC-2 |
| ĐVT chính | `mainUnitCode: String` | `mainUnitCode: String!` | `mainUnitCode: string` | `mainUnitCode` | `BR-OB-010` — snapshot from `internal_product.main_unit_code` |
| Số lượng tồn (SL quy đổi) | `quantityOnHand: BigDecimal` | `quantityOnHand: Decimal!` | `quantityOnHand: number` | `quantityOnHand: double` | `BR-OB-008` DECIMAL(18,6) |
| Giá trị tồn (VND) | `valueOnHand: BigDecimal` | `valueOnHand: Decimal!` | `valueOnHand: number` | `valueOnHand: double` | `BR-OB-009` DECIMAL(18,2) |
| Tồn đến ngày | `asOfDate: LocalDate` | `asOfDate: Date!` | `asOfDate: string (YYYY-MM-DD)` | `asOfDate: DateTime` | `BR-OB-002` |
| Người import | `createdBy: String` | `createdBy: String!` | `createdBy: string` | `createdBy` | `BR-OB-CMN-001` |
| Ngày import | `createdAt: OffsetDateTime` | `createdAt: DateTime!` | `createdAt: string (ISO-8601)` | `createdAt: DateTime` | `BR-OB-CMN-001` |
| Tên file import | `fileName: String` | `fileName: String` | `fileName: string \| null` | `fileName: String?` | FEAT-OB-IMPORT AC-8 |
| Checksum file | `fileChecksum: String` | `fileChecksum: String` | `fileChecksum: string \| null` | `fileChecksum: String?` | FEAT-OB-IMPORT AC-8 SHA-256 |
| Trạng thái dòng preview | `previewStatus: PreviewStatus` (enum `VALID \| ERROR`) | `enum PreviewStatus { VALID ERROR }` | `type PreviewStatus = 'VALID' \| 'ERROR'` | `enum PreviewStatus` | FEAT-OB-IMPORT AC-4/5 |
| Mã lỗi validation | `errorCode: String` | `errorCode: String!` | `errorCode: string` | `errorCode: String` | ERROR-CODE-REGISTRY §4 ERR-INV-* verbatim |
| Path param dòng OB | `{id}` | `{id: Int!}` | `${id}` (route path) | `{id}` | W04-5/6 path |
| Idempotency key header | `X-Idempotency-Key` (RFC standard) | `X-Idempotency-Key` | `X-Idempotency-Key` | `X-Idempotency-Key` | ADR-022 |

### 5.2 Stock Ledger (W04 write-side; W06 will add read-side canonical)

| Concept | BE | BFF | FE | Mobile | Cite |
|---|---|---|---|---|---|
| Sổ tồn (bảng) | `InventoryStockLedger` (entity) | (không expose W04 — internal) | (không expose W04) | (không expose W04) | data-model §4b.2 |
| Ngày biến động | `movementDate: LocalDate` | — | — | — | BR-STKV2-001 (a) |
| Loại movement | `movementKind: MovementKind` enum `OB \| SLIP` | — | — | — | data-model §4b.2 |
| SL nhập ngày | `inboundQty: BigDecimal` | — | — | — | BR-STKV2-001 |
| GT nhập ngày | `inboundValue: BigDecimal` | — | — | — | BR-STKV2-001 |
| SL xuất ngày | `outboundQty: BigDecimal` | — | — | — | BR-STKV2-001 |
| GT xuất ngày | `outboundValue: BigDecimal` | — | — | — | BR-STKV2-001 (0 pre-BQGQ) |
| SL tồn cuối ngày | `closingQty: BigDecimal` | — | — | — | BR-STKV2-001 (b) |
| GT tồn cuối ngày | `closingValue: BigDecimal` | — | — | — | BR-STKV2-001 (b) |

> Ledger fields will surface at W06 (FEAT-STK-LIST-V2 / FEAT-IP-VIEW-V2 / FEAT-STK-DETAIL-V2) — canonical names above are pre-registered here to lock convention.

### 5.3 Accounting Period (W04 ADR-019 — read-only reuse for OB context)

> gf-inventory là consumer read-side của gf-accounting AP; local field names must match ADR-019 §5 (see `Architecture/api/gf-accounting-api.md §5 Naming Registry` when authored).

| Concept | BE (in `gf-inventory`) | BFF | FE | Mobile | Cite |
|---|---|---|---|---|---|
| Trạng thái kỳ | `periodStatus: AccountingPeriodStatus` enum `OPEN \| CLOSED` | — | — | — | ADR-019 §Decision A/C |
| Response lock-check | `AccountingPeriodLockCheckResponse.{locked: bool, periodId: Long?, periodCode: String, status, periodType, startDate, endDate}` | — | — | — | ADR-019 §Decision C |

## 6. References

- HLD: [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md)
- Events: [gf-inventory-events.md](../events/gf-inventory-events.md)
- Data model: [gf-inventory-data-model.md](../data/gf-inventory-data-model.md) §4a (Catalog V2), §4b (Opening Balance + Stock Ledger)
- ADR: [ADR-017](../decisions/ADR-017-inventory-v2-catalog-additive-aggregates.md) (additive aggregates), [ADR-018](../decisions/ADR-018-inventory-v2-bulk-import-pattern.md) (bulk import JSON 2-step), [ADR-020](../decisions/ADR-020-stock-ledger-daily-snapshot.md) (stock ledger daily-snapshot), [ADR-021](../decisions/ADR-021-ob-period-lock-cross-boundary.md) (OB period-lock cross-boundary), [ADR-022](../decisions/ADR-022-ob-import-all-or-nothing-bulk.md) (OB import all-or-nothing).
- BR: [BR-GF-INVENTORY-CATALOG](../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md), [BR-GF-INVENTORY-OPENING-BALANCE](../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md), [BR-GF-INVENTORY-STOCK-V2](../../Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md).
- BFF: [agg-garage-graph-graphql.md](agg-garage-graph-graphql.md) §3d (V2 catalog resolvers), §3g (OB resolvers W04).
- Integration: [INTEG-EXT-gf-inventory.md](../integrations/INTEG-EXT-gf-inventory.md) §6 (UoM read dependency on gf-erp-mdm), §13b (gf-accounting lock-check consumer — W04 add).

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-08 | v44 | **W04 rename + clarify — §3b.2 W04-5 PUT `/api/v2/opening-balances/{id}` request body rename `warehouseCode: string` → `warehouseId: int` + Semantics bullet mới clarify `mainUnitCode` auto-derived** per user quannn 2026-07-08 "trong updateOpeningBalanceLine: chuyền warehouseId thay vì warehouseCode, mainUnitCode luôn lấy theo internal_product". Hai yêu cầu: (a) **Replace** `warehouseCode: string` → `warehouseId: int` (canonical `warehouse.id` scalar FK) — đồng bộ với semantic FE (warehouse dropdown return int ID) + simpler tenant-scoped validation. (b) **Clarify** `mainUnitCode` NOT in request body — backend auto-resolve từ `internal_product.main_unit_code` theo `productCode` mỗi lần update per FEAT-OB-EDIT AC-5 "ĐVT readonly auto-derived from productCode server-side" (đã đúng semantic, chỉ document explicit hơn). Breaking change contract W04-5 (rename field, không phải additive) — W04 chưa DEV nên safe at design time. Cascade 3 sub-edits §3b.2 W04-5: **(1) Request body sample** — thay `"warehouseCode": "WH-01"` → `"warehouseId": 12`. **(2) Field table** — replace row `warehouseCode string YES` → `warehouseId int YES` với description "**v44 rename** ... canonical `warehouse.id` scalar FK cho tenant, tenant-scoped lookup (BR-OB-EDIT-006 → `ERR-INV-020` nếu không tồn tại hoặc cross-tenant), breaking change contract W04 chưa DEV safe"; extend `productCode` row description thêm "Backend auto-derive `mainUnitCode` từ `internal_product.main_unit_code` theo productCode — user KHÔNG gửi mainUnitCode (v44 clarify)". **(3) Semantics** — add 2 bullet mới: "**`mainUnitCode` auto-derived (v44 clarify per user quannn 2026-07-08)**" cite FEAT-OB-EDIT AC-5 + snapshot persistence DB column `unit_code` auto-update per BR-OB-EDIT-006 same as verify BR-OB-010 resolve rule + FE KHÔNG cần gửi mainUnitCode; "**`warehouseId` canonical (v44 rename)**" backend nhận int scalar FK, lookup `warehouse.id` tenant-scoped, resolve tới `warehouse.code` string cho snapshot persistence (DB column `warehouse_code` giữ string, data model không đổi). **KHÔNG đụng**: (1) W04-1 search — không có warehouseCode input scope này (list operation); (2) W04-3 verify, W04-4 import — v43 đã có `rows[].warehouseId: int` nullable "Add alongside" (canonical + display coexist migration semantic khác edit rename; scope import batch vs edit single-row direct); (3) W04-6 delete-single, W04-7 delete-lines — không có warehouseCode input; (4) §5 Naming Registry OB scope — `warehouse_code` string vẫn là canonical DB column reference name; API layer `warehouseId` int là input-only canonical FK; (5) data model `opening_balance_line` — DB snapshot `warehouse_code` string column giữ nguyên (backend resolve `warehouseId` int → `warehouse_code` string tại commit time); (6) Product FEAT-OB-EDIT / BR-OB-EDIT-** (Business Authority; AC-5 "ĐVT readonly" đã có sẵn confirm mainUnitCode auto-derived); (7) UX / Figma; (8) `productCode` field trong request body giữ String (không rename sang productId int — user không request; scope narrow chỉ warehouse). Cascade pair với `agg-garage-graph-graphql.md v7.56→v7.57` SDL `UpdateOpeningBalanceLineInput` rename field cùng semantic + inline SDL comment cite user + FEAT-OB-EDIT AC-5. Consistency note với v43 import path: import (v43) dùng `rows[].warehouseId: int` nullable "Add alongside" (canonical + display coexist migration transition); edit (v44) dùng `warehouseId: int` required rename (clean canonical only). Semantics khác nhau vì: import batch có transitional legacy display fallback (xlsx file cũ), edit single-row direct (user chọn từ dropdown canonical). Nếu Architecture Authority muốn unify → follow-up CR. Follow-up (không thuộc scope): FE `garage-web` form edit dùng warehouse dropdown return int ID → gửi `warehouseId` (agent-dev-garage-web Day 3 W04); consistency unify import + edit warehouseId semantic → follow-up CR; `OpeningBalanceLine` output type nếu future muốn expose `warehouseId` int trong response → follow-up CR (không thuộc scope này — response snapshot giữ `warehouseCode` string). v43 → v44. |
| 2026-07-08 | v43 | **W04 add — `rows[].mainUnitCode: string` + `rows[].warehouseId: int` nullable fields vào §3b.2 W04-3 verify-import (shared cascade W04-4 import per "cùng schema W04-3" note)** per user quannn 2026-07-08 "trong importOpeningBalances sẽ chuyền lên mainUnitCode và warehouseId" + AskUserQuestion resolve Option "Add alongside" (giữ `unitName` + `warehouseName` display + THÊM canonical `mainUnitCode` + `warehouseId` — migration-safe transition, không rename/remove legacy). Row shape import cần thêm 2 canonical identifier song song display fields hiện có; verify + import chia sẻ shared schema per W04-4 note. Cascade 4 sub-edits §3b.2 W04-3: **(1) Request body sample** — thêm `"mainUnitCode": "PCS"` + `"warehouseId": 12` vào row object cạnh `unitName`/`warehouseName`. **(2) Field table** — add 2 row: `rows[].mainUnitCode` string NO (v43 add) canonical unit code khớp `internal_product.main_unit_code`, authoritative khi provided, fallback resolve từ `unitName` khi missing, mismatch cả 2 present → `ERR-INV-019`, cite BR-OB-010; `rows[].warehouseId` int NO (v43 add) canonical `warehouse.id` scalar FK cho tenant, authoritative khi provided, fallback resolve từ `warehouseName` khi missing, mismatch → `ERR-INV-020`, cite BR-OB-005. Extend `rows[].unitName` row description thêm "Fallback path nếu `mainUnitCode` missing"; extend `rows[].warehouseName` row description thêm "Fallback path nếu `warehouseId` missing" — làm rõ backward-compat semantic. **(3) Semantics** — add bullet "Canonical + display coexist (v43 add per user quannn 2026-07-08)": (a) nếu FE gửi `mainUnitCode` → authoritative validate cross-check với `unitName` khi cả 2 present; (b) nếu FE chỉ gửi `unitName` (legacy path) → resolve tới canonical qua `internal_product.main_unit_code`; (c) tương tự cho `warehouseId` vs `warehouseName`. Mismatch giữa canonical + display khi cả 2 present → `ERR-INV-019` (unit) hoặc `ERR-INV-020` (warehouse). Migration semantic: sau FE 100% send canonical → separate CR deprecate legacy `unitName`/`warehouseName` inputs. **(4) W04-4 note "cùng schema W04-3"** — giữ nguyên; 2 field mới auto-inherit vào commit path (không đụng W04-4 block riêng). **KHÔNG đụng**: W04-5 PUT (edit path shape khác, không phải import — `warehouseCode` string riêng, follow-up CR nếu cần cross-consistency canonical); W04-6 DELETE; W04-7 delete-lines; W04-1 search; §5 Naming Registry OB scope (canonical + display cùng belong OB, không cross-tier register mới); Product FEAT-OB-IMPORT / BR-OB-** (Business Authority; canonical vs display là API-layer detail); UX / Figma. Cascade pair với `agg-garage-graph-graphql.md v7.55→v7.56` SDL `OpeningBalanceImportRow` add 2 field cùng semantic. Design rationale (user Option "Add alongside"): migration-safe transition — tồn tại window khi FE cũ display-only + FE mới gửi cả 2; backend deterministic khi canonical + fallback display khi không; audit consistency + cross-validation. Backward-compat: nullable field addition — existing FE clients + existing test fixtures KHÔNG break. Precedent pattern: catalog V2 R8 D-A/E rename `mainUomCode` → `mainUnitCode` (cùng canonical string code approach); OpeningBalanceLine output đã carry `mainUnitCode` + `warehouseCode` canonical song song `mainUnitName` + `warehouseName` display từ trước. Follow-up (không thuộc scope): FE `garage-web` form implement parse file .xlsx → resolve display names → send cả 2 field (agent-dev-garage-web Day 3 W04); separate CR deprecate legacy `unitName`/`warehouseName` khi FE 100% migrate; `UpdateOpeningBalanceLineInput` cross-consistency canonical nếu muốn thống nhất scheme cho edit path; data model `opening_balance_line` add `warehouse_id` int nếu future muốn canonical FK snapshot. v42 → v43. |
| 2026-07-07 | v42 | **W04 doc-nav cascade — refactor §3b W04-4/W04-5 `cascadedKeys[]` sang semantic label** đồng bộ ADR-020 v3→v4 (strip Java code, giữ logic contract). Refactor 2 điểm: (1) §3b W04-4 `cascadedKeys[]` field description bảng "Field | Type | Cite" — replace "Shape 1-1 map từ `List<RecomputeResult>`" (Java generic syntax) bằng "Mỗi item = 1 result shape"; note deprecation window `recomputedRows` → `affectedRows` cập nhật bump reference v41+ → v42+; (2) §3b W04-5 Response 2xx one-liner — replace `RecomputeResult` (Java class name) bằng "result shape". Anchor cross-ref ADR-020 §Component Interface C4 giữ nguyên (v4 giữ label — chỉ đổi content). Additive-only, KHÔNG đổi endpoint bodies / field name / Semantics / Naming Registry / §0 Wave Index W04 row (giữ ratified range không bump vì thay đổi doc-nav semantic, không phải endpoint spec). §Semantics blocks `Single @Transactional` (5849, 5900, 5971) giữ nguyên — đây là caller-side tx wrapping notation, language-independent architecture idiom, không phải Java code. v41 → v42. |
| 2026-07-07 | v41 | **W04 doc-nav cascade — §3b W04-4/W04-5 `cascadedKeys[]` cite ADR-020 §Component Interface C4**. Pair với ADR-020 v2→v3 (thêm §Component Interface C1-C8 formal contract) + gf-inventory-HLD v15→v16 (§7 Forbidden 3 rule cross-ref). Sửa 2 điểm: (1) §3b W04-4 `cascadedKeys[]` field description block "Field | Type | Cite" — bổ sung "Shape 1-1 map từ `List<RecomputeResult>` per ADR-020 §Component Interface C4"; note canonical field `affectedRows` vs legacy alias `recomputedRows` với deprecation window (next bump v42+ expose cả 2 field 1 wave rồi deprecate `recomputedRows`); (2) §3b W04-5 `PUT /{id}` Response 2xx one-liner — cite `ADR-020 §Component Interface C4 RecomputeResult` cho shape. §3b W04-6 `DELETE /{id}` giữ nguyên (dùng field `cascadedRecomputedRows` khác semantics — recompute row count trực tiếp, không nằm array — không cần cite C4). §3b W04-7 delete-lines dùng cùng `cascadedKeys[]` shape với W04-4 → implicit inherit cite (không cần thêm cite dòng vì đã có ở W04-4 canonical). Additive-only, KHÔNG đổi field name / endpoint body / Semantics bullet / error codes / Naming Registry / §0 Wave Index. v40 → v41. |
| 2026-07-07 | v40 | **Doc-nav — Add §0 Wave Index (subagent bounded-read pointer table)**. Insert §0 ngay sau tiêu đề `# REST API` trước §1: bảng `Wave | Scope name | Sections | Endpoint ID range | Status | Ratified in` liệt kê 3 hàng (WT-baseline, W03 Catalog V2, W04 Opening Balance + Stock Ledger) trỏ tới sub-modules §3 baseline / §3a / §3b + Naming Registry §5.1/5.2/5.3. Subagent RULE + Cascading rule ghi rõ trong quote-block phía trên bảng. Mục đích: cắt overhead reading của arch-author/arch-review/dev/execution-spec-author trên file 6k+ dòng — cho phép Read bounded theo wave hiện tại thay vì whole-file. Pair mechanism: MANIFEST §5 File allowlist thêm cột `Read scope` (`§0 + §3<letter> + §5`); drift check `scripts/check-api-wave-index-drift.sh` warn-only; FM-020 entry. **KHÔNG đụng** endpoint bodies / §1..§6 nội dung / §3<letter> sub-modules / Naming Registry. Additive-only, backward-compat. v39 → v40. |
| 2026-07-06 | v39 | **W04 Q3 fix — User chốt 2026-07-06 mở rộng scope `@FeatureOn(Inventory:InventoryV2)` cover cả W03 catalog v2 + W04 opening balance (đồng bộ pattern legacy `INVENTORY_STOCK` cover multi-controller)**. Audit độc lập phát hiện Q3 còn treo: architect đã trả lời "Yes — align pattern" ở `INTEG-EXT-gf-inventory.md §13b.7` S-W04-2 nhưng chỉ nằm trong bảng soft question, chưa write vào các artifact chính; W03 catalog v2 (§3a) cũng chưa mention flag. User chốt scope 2026-07-06: apply flag cho TRỌN Inventory V2 subsystem. Sửa 2 điểm ở gf-inventory-api.md: (1) §3a intro (backfill W03): THÊM bullet `Feature Flag` — annotation `@FeatureOn(Inventory:InventoryV2, fallback=THROW_EXCEPTION)` class-level trên `MaterialGroupController` + `InternalProductController`, tenant chưa enable → HTTP 403, Web ẩn menu, đồng bộ pattern legacy `@FeatureOn(INVENTORY_STOCK)`; Product spec dùng naming `Inventory:InventoryV2` trần (không format `{Domain}:{Code}`) — architect follow Product spec. (2) §3b intro (W04): THÊM bullet `Feature Flag` — cùng flag như catalog v2 (không cấp flag riêng cho OB), gate class-level trên `OpeningBalanceController`, cover trọn Inventory V2 subsystem (catalog + opening-balance + future RECEIPT/DELIVERY/PRC W05/W06), tenant chưa enable → HTTP 403, Web GMS ẩn route `/inventory/opening-balances*`, Mobile hub tự động ẩn tile "Tồn đầu kỳ" theo state matrix client-side per BR-INV-MENU-002. Cite EP-INVENTORY-OPENING-BALANCE §5.2 v3 + BR-GF-INVENTORY §6.6 v3 + CR-1782974034. **Doc-only update** — annotation `@FeatureOn(Inventory:InventoryV2)` đã được Product yêu cầu ở EP §5.2 v3 từ 2026-07-02; nếu code W03 production chưa có annotation này thì cần CR bổ sung (không phải architect responsibility — dev team confirm). Pair với `gf-inventory-HLD v15` (thêm row bảng Feature gate + optional §7 Forbidden rule) + `INTEG-EXT-gf-inventory v11` (§13b.7 S-W04-2 → R-W04-2 Resolved). **KHÔNG đụng Product docs** (EP §5.2 v3 đã có sẵn); **KHÔNG đụng file khác** — feature flag là controller-level annotation, không ảnh hưởng data-model/events/GraphQL/naming registry. v38 → v39. |
| 2026-07-06 | v38 | **W04 Q2 fix — BA/PO chốt 2026-07-06 template `.xlsx` do FE quản lý (bundled static asset)**. Audit độc lập phát hiện Q2 còn treo. BA/PO chốt phương án khác 3 lựa chọn ban đầu: xoá endpoint BE `W04-2 GET /api/v2/opening-balances/template` khỏi thiết kế; FE bundle file `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` (BA đã tạo, ship trong Product docs 2026-07-06) làm static asset trong `frontend/gf-gms-web/src/assets/`, render qua `<a href={bundled_url} download>` hoặc `fetch(bundled_url).then(blob → saveAs)` — zero BFF/BE call, browser cache immutable bundle. Sửa 4 điểm ở gf-inventory-api.md: (1) §3b.1 Endpoint Summary: XOÁ row `W04-2 GET /api/v2/opening-balances/template`; (2) §3b.2 Endpoint Details: XOÁ toàn bộ block `#### W04-2 — GET /api/v2/opening-balances/template` (heading + Headers + Path/Query + Request body + Response 2xx + Response 4xx/5xx + Semantics — 32 dòng); THÊM skip note trên block W04-3 giữ audit trail + link FE source path; (3) §3b.4 UI Action mapping: "Bấm nút Tải template ... query getOpeningBalanceTemplateUrl ... W04-2" → "Bấm link Tải template ... (none — FE bundled static asset) ... (none — FE serve từ Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx)"; (4) §5.1 Naming Registry: XOÁ hoàn toàn row "Đường dẫn template | templateUrl: String | ... | W04-2 response" (không còn field templateUrl vì endpoint đã xoá). **KHÔNG renumber W04-3..W04-7** (giữ gap tại W04-2; naming hơi lệch nhưng gọn hơn nhiều so với renumber; audit trail Change Log v34 vẫn quote W04-2 wording cũ). Pair với `agg-garage-graph-graphql v7.47` (§2/§3g.1/§3g.2/§3g.6 remove `getOpeningBalanceTemplate`) + `agg-garage-graph-HLD v12` (§1 callout 7→6 ops + total 37→36; §1b cache bullet update) + `INTEG-FE-garage-web-agg-garage-graph v17` (§3.6c UI mapping) + `garage-web-HLD v11` (§8b.2 cache bullet) + `ADR-022 v4` (§Decision Parse file bullet). **KHÔNG đụng Product docs** (`FEAT-OB-IMPORT.md` AC-2 wording "Tải template mẫu" đã fit cả BE-endpoint và FE-bundled patterns — không phụ thuộc transport; `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` đã có sẵn từ BA). v37 → v38. |
| 2026-07-06 | v37 | **W04 Gap 3 fix — BA/PO chốt 2026-07-06 W04-7 delete-lines validate FAIL-FAST theo thứ tự `ids[]`**. Audit độc lập phát hiện response 400 của W04-7 `POST /api/v2/opening-balances/delete-lines` có 3 dòng chồng chéo lộn xộn: (1) "Bất kỳ ID nào vi phạm guardrail → response `{errorCode, offendingIds: [...]}`; chặn cả lô" (generic — không rõ mã nào); (2) "`ERR-INV-024` (any line in CLOSED period)"; (3) "`ERR-INV-036` (any delete cascade → tồn âm)" — không rõ BE serialize gì khi lô có mix cả 2 loại lỗi, thiếu rule ưu tiên. BA/PO chốt: BE validate **fail-fast** theo thứ tự `ids[]` nhận từ request → gặp id đầu tiên vi phạm bất kỳ guardrail nào → DỪNG NGAY, KHÔNG loop qua hết list; response `{errorCode, offendingIds: [<id đầu tiên>]}` (offendingIds vẫn là array cho consistency, nhưng thường chỉ 1 phần tử); all-or-nothing giữ nguyên per BR-OB-DEL-004; KHÔNG cần rule ưu tiên `ERR-INV-024` vs `ERR-INV-036` — tuỳ id nào đến trước theo thứ tự; FE render popup verbatim per `FEAT-OB-DELETE-LINES.md:58` AC-4 (wording generic bao cả 2 case). Sửa 2 điểm ở §3b.2 W04-7: (1) **Response 4xx/5xx**: XOÁ 3 dòng 400 trùng lặp, THAY bằng 1 dòng duy nhất mô tả rõ fail-fast + response shape `{errorCode, offendingIds: [<id đầu>]}` + hai mã có thể `ERR-INV-024` (BR-OB-DEL-002) hoặc `ERR-INV-036` (BR-OB-DEL-003), tuỳ guardrail nào fail trước theo thứ tự id. (2) **Semantics**: thêm bullet "Validate fail-fast — iterate `ids[]` theo thứ tự, dừng ngay tại id đầu tiên vi phạm, không tiếp tục check các id còn lại; chặn cả lô; BE early return giảm cost khi lô lớn có lỗi sớm; KHÔNG cần rule ưu tiên." Giữ nguyên row 401/403/404/500/503 (đã đúng sau v36). Pair với `agg-garage-graph-graphql v7.46` (§3g.6 `deleteOpeningBalanceLines` merge 2 dòng error → 1 dòng fail-fast). **KHÔNG đụng Product docs** — `FEAT-OB-DELETE-LINES.md` AC-4 popup wording generic đã fit fail-fast pattern (không phụ thuộc mã lỗi cụ thể); `BR-GF-INVENTORY-OPENING-BALANCE.md` BR-OB-DEL-* không đổi. v36 → v37. |
| 2026-07-06 | v36 | **W04 Gap 2 fix — BA/PO chốt 2026-07-06 dùng `ERR-CMN-007` cho case gf-accounting lock-check down (fail-CLOSED per ADR-021)**. Audit độc lập phát hiện suffix bịa `ERR-INV-024-UNAVAILABLE` (không tồn tại trong `Product/error-code/ERROR-CODE-REGISTRY.md`) ở §3b.2 W04-4 import row 503. BA/PO chốt: dùng `ERR-CMN-007` đã tồn tại tại `ERROR-CODE-REGISTRY.md:71` = "Hệ thống đang bận, vui lòng thử lại sau", HTTP 503, TOAST, System category, scope "toàn platform" — semantic khớp chính xác "downstream service unavailable, user retry"; không cần cấp mã mới (0 CR bên Product); phân biệt sạch với `ERR-INV-024` (business "Kỳ đã đóng" HTTP 400) — không còn nhập nhằng suffix. Sửa 4 điểm trong §3b.2: (1) W04-4 (line ~5856) row 503: replace `ERR-INV-024-UNAVAILABLE` → `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (toast platform-wide, FE render retry button); (2) W04-5 edit (line ~5907) row 503: elaborate từ bare "gf-accounting lock-check down" thành đủ ngữ nghĩa với `ERR-CMN-007`; (3) W04-6 delete-single (line ~5940) row 503: cùng elaborate; (4) W04-7 delete-lines: thêm row 503 bị thiếu (commit-path per ADR-021 cũng fail-CLOSED — trước đây chỉ có 400/401/403/404/500, thiếu 503) với cùng ngữ nghĩa `ERR-CMN-007`. W04-3 verify-import (line 5808) KHÔNG đụng — vẫn giữ nguyên fail-OPEN với `warningLockCheckUnavailable: true` marker trong response body per ADR-021 §54-55 (verify path không throw 503). Pair với INTEG-EXT-gf-inventory + agg-garage-graph-graphql cùng fix chỗ tham chiếu. **KHÔNG đụng Product docs** (`ERR-CMN-007` đã tồn tại sẵn — 0 CR). v35 → v36. |
| 2026-07-06 | v35 | **W04 empty-file semantics fix — BA/PO chốt 2026-07-06 phương án (b) cho case file rỗng import OB**. Cập nhật §3b.2 W04-3 `POST /api/v2/opening-balances/verify-import` response documentation (không đụng schema JSON — field `canCommit: bool` đã có sẵn từ v34): (a) mở rộng doc row `canCommit` — công thức mới `canCommit = (totalRows > 0 AND errorRows == 0)` bao phủ cả case `errorRows > 0` (BR-OB-004a all-or-nothing) VÀ case `totalRows == 0` (empty file no-op); (b) thêm block "Empty-file semantics" — verify-import PASS HTTP 200 với response body `{totalRows: 0, validRows: 0, errorRows: 0, canCommit: false, warehousesInFile: [], previewLines: []}`, BFF/FE render banner INFO "File không có dữ liệu, không có gì để import" (không phải error message) + button "Xác nhận import" DISABLED; ngữ nghĩa empty file KHÁC hoàn toàn với `ERR-INV-048` (over-cap) và extension mismatch — không dùng chung mã lỗi; (c) thêm note trong bảng "Response 4xx/5xx" rằng KHÔNG có row cho case file rỗng (case này là HTTP 200); (d) bảng 4xx mở rộng row 400 để cover cả extension mismatch bypass → `ERR-CMN-validation`; (e) Semantics bullet enumerate errors thêm phrase "KHÔNG có mã lỗi cho case empty file" + p95 mục tiêu ≤ 50ms cho empty file. Pair với ADR-022 v3 (bullet §Decision "Wizard 2 bước → Bước 1" tách 3 nhánh + Test 4 thay `ERR-INV-XXX-EMPTY` placeholder). **KHÔNG đụng Product docs** (BR-GF-INVENTORY-OPENING-BALANCE BR-OB-004b + FEAT-OB-IMPORT AC-3b sẽ do BA tự update — kiến trúc chỉ khớp với quyết định (b)). v34 → v35. |
| 2026-07-06 | v34 | **W04 — Add §3b Opening Balance + Stock Ledger (7 endpoints)** — additive REST module `/api/v2/opening-balances/*` với full 6-block detail cho từng endpoint (Headers · Path/Query · Request · Response 2xx · Response 4xx/5xx · Semantics): W04-1 `POST /search`, W04-2 `GET /template`, W04-3 `POST /verify-import`, W04-4 `POST /import`, W04-5 `PUT /{id}`, W04-6 `DELETE /{id}`, W04-7 `POST /delete-lines`. ADR-020 cascade sổ tồn atomic ở commit; ADR-021 cross-boundary lock-check via gf-accounting REST advisory + authoritative; ADR-022 all-or-nothing 2-step wizard + 500 cap + idempotency key `OB-IMPORT-{tenantId}-{uuid}`. §3b.3 error codes ERR-INV-{009,010,017,018,019,020,024,032,033,034,035,036,048}. §3b.4 UI Action → GraphQL → REST mapping. **§5 Naming Registry** cross-tier BE/BFF/FE/Mobile (mới) — OB canonical: `productCode`/`warehouseCode`/`mainUnitCode`/`quantityOnHand`/`valueOnHand`/`asOfDate`/`fileChecksum`/`X-Idempotency-Key`; stock ledger internal canonical (pre-register W06 consumer): `movementDate`/`movementKind`/`inbound{Qty,Value}`/`outbound{Qty,Value}`/`closing{Qty,Value}`; AP consumer names `AccountingPeriodStatus`/`AccountingPeriodLockCheckResponse` mirror ADR-019. §5 References + §6 renumber. `depends_on` cite ADR-020/021/022 mới. v33 → v34. |
| 2026-07-03 | v33 | **R39 — V2-11 `updateInternalProduct` body add 3 bulk sync collection (`initialProducts` / `initialConversionUnits` / `attachments`) với diff-by-id semantics**. Backward-compat additive: 6 sub-resource endpoint V2-13..V2-19 (POST/PUT/DELETE `/sku-mappings`, `/conversion-units`, `/attachments`) giữ nguyên — FE có thể chọn 1 trong 2 path. **Semantic**: item có `id` khớp DB → update; không `id` → insert; DB row không có trong payload → delete. `null` (field vắng khỏi body) = giữ nguyên collection; `[]` = xóa hết. **Update-in-place rule**: `initialProducts[]` chỉ giữ mapping (không được đổi `productId`, khác → `400 ERR-CMN-validation`); `initialConversionUnits[]` set `conversionRate` (unitCode immutable per BR-CAT-PROD-011); `attachments[]` set `fileName` + `attachmentKind` (fileUrl/fileType/fileSizeBytes immutable per R31/R35, client đổi → `400 ERR-CMN-validation`). **Delete-guard rollback toàn bộ request** (cùng `@Transactional` với scalar patch — vi phạm ⇒ scalar cũng rollback): SKU cần xóa có row trong `inventory_transaction` (BR-CAT-PROD-014) → `400 ERR-INV-016 PRODUCT_HAS_TRANSACTIONS`; conv unit cần xóa khi product có bất kỳ activity nào (proxy `hasActivity` vì `inventory_transaction` không lưu `unit_code` — conservative product-level guard per BR-CAT-PROD-012) → `400 ERR-INV-016`; attachment không guard (BR-CAT-PROD-015 không cấm). **Ordering** delete→flush→insert (tránh vi phạm unique `(tenant_id, internal_product_id, unit_code)` khi xóa+thêm cùng `unitCode` trong 1 request; tương tự với unique tenant-level `(tenant_id, product_id)` của SKU mapping khi user re-map). **Insert phase reuse** validation hiện có: `persistAttachment()` cap 5/30MB/MIME (BR-CAT-PROD-015 v17), `addConversionUnit()` rate > 0 + scale ≤6 (BR-CAT-PROD-011 v15, `ERR-INV-013`/`ERR-INV-047` R29), `mapSku()` unique tenant-level (BR-CAT-PROD-013, `ERR-INV-015`). Payload `id` không thuộc product hiện tại → `404 ERR-CMN-not-found` throw ở đầu reconcile trước mọi write. **Code**: `InternalProductUpdateRequest` (CatalogDtos.java) thêm 3 field + 3 upsert DTO mới (`SkuMappingUpsertRequest`/`ConversionUnitUpsertRequest`/`AttachmentUpsertRequest`); `InternalProductService.update()` thêm 3 helper `reconcileSkuMappings`/`reconcileConversionUnits`/`reconcileAttachments` gọi cùng `@Transactional`. **Tests**: `InternalProductServiceTest` +15 test (3 collection × 4 scenario insert/update/delete/null-untouched + cross-cutting delete-guard SKU-has-tx / conv-unit-product-has-activity / unit-code-change-rejected / attachment-content-change-rejected / unknown-id → 404). KHÔNG đụng schema DB, KHÔNG đụng V2-13..V2-19. Sync graphql (mutation `updateInternalProduct` input mở rộng 3 collection field — CR riêng cho BFF `agg-garage-graph`). v32 → v33. |
| 2026-07-01 | v32 | **R38 — `SkuMappingResponse.name` rename → `productName`, closes the R36/R37 field-name mismatch flag**. `CatalogDtos.SkuMappingResponse.name` (`String`) renamed to `productName`, matching the BFF GraphQL SDL exactly: `agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` declares `type InternalProductSkuMapping { id: Int! productId: Int! sku: String! productName: String }` — there is no `name` field on this GraphQL type at all. This was called out (but explicitly left unfixed) in both R36 and R37 as a lower-severity mismatch since `productName` is nullable on the GraphQL side (silent-null rather than crash) — now closed per direct product instruction. Code: `InternalProductService.toMapping()` builder `.name(product == null ? null : product.getName())` → `.productName(...)` (same null-safe behavior, unchanged). No back-compat duplicate field added — single canonical name, consistent with how every other field on this DTO (`id`, `sku`, `productId`) already tracks the GraphQL SDL 1:1. Doc: V2-8 `skuMappings[]` example + V2-13 response 201 example `"name"` → `"productName"`. Tests: `InternalProductServiceTest` 3 sites (`get_populatesSkuAndNameFromProductTable`, `get_leavesSkuAndNameNull_whenProductNotFound`, `mapSku_populatesSkuAndNameFromProductTable`) updated to `getProductName()`. v31 → v32. |
| 2026-07-01 | v31 | **R37 — BUGFIX: `SkuMappingResponse.sku`/`.name` always null (V2-8 `skuMappings[]` + V2-13 response), resolves R36's "not fixed" flag**. Reported by user via curl against `GET /api/v2/internal-products/{id}` on local Swagger — response's `skuMappings[]` items had `sku`/`name` both `null`. Root cause: `InternalProductService.toMapping()` never set these two fields; `sku`/`name` are legacy `product` table columns (SKU master, ADR-017 Q2) reachable only via `internal_product_sku_mapping.product_id` FK, and no lookup existed. Fix: `toMapping()` gains a second `ProductEntity product` param, sets `.sku(product == null ? null : product.getSku())` / `.name(product == null ? null : product.getName())` (null-safe — a dangling/soft-deleted product FK degrades to `null` rather than throwing). New private helper `toMappings(tenantId, List<InternalProductSkuMappingEntity>)` batch-resolves products via `JpaProductRepository.findAllByTenantIdAndIdInAndIsDeletedFalse` (same tenant-scoped method already used by `hasActivity()`) and is shared by both call sites: V2-8 `get()` (list, batched to avoid N+1) and V2-13 `mapSku()` (single mapping, via the same helper with a one-element list). Severity: this was not merely cosmetic — BFF GraphQL SDL declares `sku: String!` (non-nullable) on `InternalProductSkuMapping`, so a null REST value would have null-crashed the resolver exactly like the R33/R34/R36 incidents once a client queried it. Tests: `InternalProductServiceTest` — `get_populatesSkuAndNameFromProductTable`, `get_leavesSkuAndNameNull_whenProductNotFound`, `mapSku_populatesSkuAndNameFromProductTable`. Doc: no example/field changes needed — V2-8/V2-13 JSON examples already showed populated `sku`/`name` values (aspirationally correct; only the code was wrong). **Still unresolved (unchanged from R36 flag)**: `SkuMappingResponse.name` vs GraphQL SDL's `productName` field-name mismatch — not renamed, not requested this round; nullable on the GraphQL side so it silently resolves `null` rather than crashing, still worth a follow-up. v30 → v31. |
| 2026-07-01 | v30 | **R36 — `SkuMappingResponse` (V2-8 `skuMappings[]` item + V2-13 response body) rename field `internalProductId` → `id`, exposing the mapping row's own PK**: `CatalogDtos.SkuMappingResponse.internalProductId` (`Long`, populated from `e.getInternalProductId()` — the FK to the parent `internal_product`) renamed to `id`, now populated from `e.getId()` (the `internal_product_sku_mapping` row's own PK). Same root-cause class as R33/R34, but this time proactively verified against the BFF contract before shipping: `agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` declares `type InternalProductSkuMapping { id: Int! productId: Int! sku: String! productName: String }` — non-nullable `id`, no `internalProductId` field at all (mirrors `InternalProductConversionUnit`/`InternalProductAttachment`, neither of which expose the parent FK either). Reusing the old FK value under the new `id` name was considered and rejected — `uk_ipsm_internal_product(internal_product_id, product_id)` allows many mapping rows per product, so every SKU mapped to the same internal product would have produced a duplicate `id`, breaking GraphQL/FE list-key uniqueness. Code: `InternalProductService.toMapping()` builder `.internalProductId(e.getInternalProductId())` → `.id(e.getId())`. Doc: V2-8 detail `skuMappings[]` example item gets a new leading `"id": 8801` field (previously had none); V2-13 response 201 example `"internalProductId": 4001` → `"id": 8801`. **Flag (not fixed, out of scope)**: `SkuMappingResponse.name`/`.sku` are never populated by `toMapping()` today (pre-existing gap, unrelated to this rename); GraphQL SDL also expects `productName` where the REST DTO has `name` — a separate, lower-severity mismatch (nullable field, resolves to `null` instead of crashing) worth a follow-up. v29 → v30. |
| 2026-07-01 | v29 | **R35 — `AttachmentRequest` (V2-18 request body) rename 3 field, reversing the R11/R34 "unchanged" decision per direct product instruction**: `sizeBytes`→`fileSizeBytes`, `storageUrl`→`fileUrl`, `kind`→`attachmentKind` (`CatalogDtos.java`). This gives `AttachmentRequest` full field-name parity with `AttachmentCreateRequest` (V2-10 inline) and `AttachmentResponse` — the two attachment item shapes (V2-10 inline vs V2-18 post-create) are now identical field-for-field. Code: `InternalProductService.addAttachment()` getter calls updated to match (`getStorageUrl→getFileUrl`, `getSizeBytes→getFileSizeBytes`, `getKind→getAttachmentKind`); `persistAttachment()` shared helper unchanged (its own param names). Doc: V2-18 request JSON example + field table rewritten with new names, added previously-undocumented `attachmentKind` field (optional, default inferred from MIME — `image/*`→`IMAGE`, else `DOCUMENT` — matches existing `persistAttachment()` behavior, not new logic); V2-10 `attachments[]` comparison note updated to say the two shapes have converged instead of differing. Tests: `InternalProductServiceTest` 3 attachment builder call sites updated. **Explicitly supersedes** the R11 design note and R34's "Unchanged: `AttachmentRequest`... keeps its existing shape by design" callout — those were accurate at the time (2026-06-24 / earlier today) but the product decision changed within the same day. v28 → v29. |
| 2026-07-01 | v28 | **R34 — `AttachmentResponse` rename 3 response field**: `sizeBytes`→`fileSizeBytes`, `storageUrl`→`fileUrl`, `kind`→`attachmentKind` (`CatalogDtos.java`); `InternalProductService.toAttachment()` builder calls updated to match. Same root cause as R33: BFF `agg-garage-graph` GraphQL query `attachments { id fileUrl fileName fileType fileSizeBytes attachmentKind }` reads field names that didn't exist on the REST response, which would null-fail once the resolver reached them (same class of `"Cannot return null for non-nullable field"` error as `ConversionUnitResponse.id`). Doc: V2-18 Response 201 example updated (`sizeBytes`→`fileSizeBytes`, `storageUrl`→`fileUrl`, added missing `attachmentKind` example value); V2-8 detail `attachments[]` abbreviated example `sizeBytes`→`fileSizeBytes`. **Unchanged**: `AttachmentRequest` (V2-18 **request** body — `fileName/fileType/sizeBytes/storageUrl`) keeps its existing shape by design (R11) — this rename is response-only, applies to `AttachmentResponse` wherever it's returned (V2-8/V2-10/V2-11 `attachments[]`, V2-18 create response). Bonus: closes a latent gap where the R31 changelog entry already implied V2-10's create response returned attachments in the `fileUrl/fileSizeBytes/attachmentKind` shape, but the code (shared `toAttachment()`) hadn't actually matched that until now. v27 → v28. |
| 2026-07-01 | v27 | **R33 — `ConversionUnitResponse` rename response field `unitId` → `id`**. BFF `agg-garage-graph` GraphQL type `InternalProductConversionUnit.id` (non-nullable) resolves against REST response but REST field was named `unitId`, not `id` → resolver got no matching field → null → GraphQL 500 `"Cannot return null for non-nullable field InternalProductConversionUnit.id"` on `getInternalProduct` query (`conversionUnits[].id`). Fix applied on `gf-inventory` side (backend value was always correctly populated — only the field name was wrong) rather than the BFF, per Delivery decision. Changed: `ConversionUnitResponse.unitId` → `id` (`CatalogDtos.java`); `InternalProductService.toConversionUnit()` builder call `.unitId(...)` → `.id(...)`; doc response examples updated for V2-8 `conversionUnits[]` item + V2-15 (and V2-16, same shape) response body: `"unitId": 9001` → `"id": 9001`. **Unchanged**: URL path param `{unitId}` on V2-16/V2-17 (`/conversion-units/{unitId}`) — that's the R8 D-E path-segment convention, a separate concept from this response-body DTO field, deliberately left as-is. v26 → v27. |
| 2026-07-01 | v26 | **R32 — V2-10 `createInternalProduct` add `pricingMethod` (doc/code-drift fix)**. `pricingMethod` đã settable ở V2-11 (update) từ trước với `update()` respect giá trị client gửi không có guard, nhưng request DTO V2-10 (`InternalProductCreateRequest`) chưa từng có field này + `create()` hard-code `PricingMethod.PWA` — client gửi `pricingMethod` trong body tạo mới bị Jackson reject `400 "Unrecognized field \"pricingMethod\""`. Fix: ADD `pricingMethod` (optional, enum `{PWA, SI, FIFO, MA}`, default `PWA` nếu không truyền — cùng field/enum/default V2-11) vào V2-10 request body + validation bullet; `create()` giờ respect giá trị client gửi thay vì hard-code, đồng nhất với `update()`. Cascade: `BR-CAT-PROD-010` (BR-GF-INVENTORY-CATALOG.md) reword — bỏ "không cho phép sửa" (không còn đúng thực tế ở cả create lẫn update), giữ nguyên SI/FIFO/MA là placeholder chưa được business logic nào tiêu thụ. v25 → v26. |
| 2026-07-01 | v25 | **R31 — V2-10 `createInternalProduct` catch-up + attachments inline-tại-create (theo yêu cầu Delivery Authority 2026-07-01, không raise CR)**. (a) **`status` field** — ADD vào V2-10 request body + validation bullet: enum `ACTIVE \| INACTIVE`, backend default `ACTIVE` nếu không truyền (mirror V2-4/V2-11/V2-7 pattern). Đây là doc-drift fix — BFF SDL `CreateInternalProductInput` (graphql v7.35) đã có field này từ trước, backend REST doc chưa document. (b) **`attachments[]` field** — ADD vào V2-10 request body + validation bullet, **đảo pattern R11 (2026-06-24) hiện tách attachment ra 2 endpoint riêng post-create (V2-18/V2-19)**. Item shape MỚI, KHÔNG tái dùng `AttachmentMetadataInput` của V2-18 (`fileName/fileType/sizeBytes/storageUrl`): `fileUrl` (required), `fileName` (required), `fileType` (required, MIME enum), `fileSizeBytes` (required), `attachmentKind` (optional, default `IMAGE`). Validation tái dùng BR-CAT-PROD-015 (max 5 file, ≤10MB, MIME whitelist). V2-18/V2-19 giữ nguyên không đổi — vẫn dùng cho thêm/xoá attachment sau khi product đã tồn tại. Response 201 note thêm `attachments[]` persisted cùng shape. Sync graphql v7.36 (NEW input `InternalProductAttachmentInput`, `CreateInternalProductInput.attachments`). **Flag chưa xử lý**: `FEAT-CAT-PROD-CREATE.md` AC-13 hiện ghi "KHÔNG inline tại create" — sẽ lệch với đổi này, để lại follow-up riêng (ngoài phạm vi lần sửa này). v24 → v25. |
| 2026-06-26 | v24 | **R29 — Sync 2 BA updates 2026-06-26 cho EP-INVENTORY-CATALOG (W03)**. (a) **V2-2 tree endpoint reserved future** (FEAT-CAT-GRP-LIST v6 chuyển sang flat list): §3a.1 V2-2 row BR description append "W03 UI KHÔNG bind — reserved cho integration future". §3a.4 UI mapping table row "Tab Nhóm VTHH — list" relabel "danh sách (flat, R29 canonical)" + path correction `GET /api/v2/material-groups` → `POST /api/v2/material-groups/search`; row "Tab Nhóm VTHH — cây" strike-through (UI W03 KHÔNG bind V2-2/Q2). KHÔNG xoá endpoint V2-2 (additive future). (b) **Precision constraint cascade BR-CAT-PROD-011 v15 → `ERR-INV-047`**: §3a.2 V2-10 `initialConversionUnits[]` validation bullet ADD "scale ≤6 chữ số thập phân (`ERR-INV-047`)". §3a.2 V2-15 detail Validation block ADD new bullet `conversionRate scale ≤6 → 400 ERR-INV-047 CONVERSION_RATE_PRECISION_EXCEEDED` + note app-layer guard bắt buộc (DB NUMERIC(18,6) silent round). §3a.2 V2-16 detail Validation block append `; scale ≤6 → ERR-INV-047`. §3a.3 error code table ADD row `ERR-INV-047` (400, `CONVERSION_RATE_PRECISION_EXCEEDED`, BR-CAT-PROD-011 v15, INLINE_FIELD). Cascade Product `ERROR-CODE-REGISTRY v16 line 145` + `BR-GF-INVENTORY-CATALOG v15` + FEAT-CAT-PROD-CREATE v10/EDIT v8/DETAIL v8. **KHÔNG đụng DB schema** (NUMERIC(18,6) đã đúng từ v10 R8 D-E) — chỉ application-layer validation rule. **KHÔNG đụng V2-22 export logic / row cap / Forbidden / Mobile scope**. Cascade HLD v12 + data-model v19 + graphql v7.30 + PKG-W03 v19. v23 → v24. |
| 2026-06-25 | v23 | **R28 — Sync `ERR-INV-019` → `ERR-INV-041` (import row cap) + ADD `ERR-INV-044` (originCode invalid import) — đóng item #1 W03 NEED CONFIRM "ERR-INV-020 ORIGIN_INVALID pending"** (per Delivery Authority 2026-06-25). **Phát hiện**: (i) `ERR-INV-019` legacy (proposed BR-CAT-PROD-020) đã được Product canonical hóa thành `ERR-INV-041` (ERROR-CODE-REGISTRY v14 line 139 + BR v10/v12 BR-CAT-PROD-020); (ii) `ERR-INV-020 ORIGIN_INVALID` collision — `ERR-INV-020` thực tế đã thuộc `BR-OB-005` (Opening Balance "Kho không tồn tại"); `ERR-INV-044` (ERROR-CODE-REGISTRY v14 line 142 + BR-CAT-PROD-023) đã cover origin invalid trong import context. **Sửa**: (a) §3a.2 V2-20 line 5378 Validation pre-handle — `ERR-INV-019` → `ERR-INV-041` (Banner INLINE_FORM "Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần", canonical Product message). (b) §3a.3 error code table line 5472 — `ERR-INV-019 (proposed BR-CAT-PROD-020)` → `ERR-INV-041` (canonical link Product registry) + ADD new row `ERR-INV-044` (originCode import invalid, BR-CAT-PROD-023). Cascade: graphql v7.29 (Row cap 500 wording sync) + PKG-W03 v18 (multi-touch ~10 references). KHÔNG đụng V2-10/V2-11 single CREATE/UPDATE (đã đúng dùng `ERR-CMN-validation` generic cho originCode invalid). **Mirror R23 ERR-INV-045 sync pattern** (Architecture catchup Product canonical). v22 → v23. |
| 2026-06-25 | v22 | **R26 — OQ13 CLOSED `description`="Mô tả" + `notes`="Ghi chú", cả 2 max length 500 chars (per BA chốt 2026-06-25)**. User decision: drop `notes` ≤1000 cũ → đồng bộ về 500 chars cùng `description`; FE form label canonical `description`="Mô tả" + `notes`="Ghi chú". **Sửa**: (a) §3a.2 V2-10 body field `description` note line ~5139 — drop "OQ13: BA confirm label + max length"; add "R26 OQ13 CLOSED" + label "Mô tả". (b) §3a.2 V2-10 body field `notes` note line ~5140 — drop "OQ13" + drop "≤1000 chars"; set ≤500 chars; add label "Ghi chú". (c) §3a.2 V2-11 R11 mutable rule line ~5169 — drop "≤500/1000 chars" → "≤500 chars" cho cả 2. Cascade: data-model v18 (notes column VARCHAR(1000) → VARCHAR(500) — pre-deploy DDL change, W03 chưa rollout, edit `V20260624020000__create_internal_product.sql` trước first deploy per R8/R18 entity note pattern) + graphql v7.28 (SDL `notes` comment ≤1000 → ≤500) + PKG-W03 v15 (§2.2.1 entity row `notes (varchar 1000)` → `notes (varchar 500)`). KHÔNG đụng FE/BFF/Mobile spec khác/effort. v21 → v22. |
| 2026-06-25 | v21 | **R25 — OQ10 CLOSED `imageUrl` opaque URL string, gf-inventory KHÔNG quản lý S3 (per Delivery Authority confirm 2026-06-25)**. User decision: khi xóa ảnh chỉ xóa URL trong DB, KHÔNG đụng S3, KHÔNG quản lý bất kỳ thông tin S3. Pattern mirror precedent **V2-18/V2-19 attachment R11 2026-06-24**. **Sửa**: (a) §3a.2 V2-10 `imageUrl` note (line ~5136) — rewrite "S3 path string + Path convention `{tenant}/internal-products/...` (OQ10)" → "opaque URL string ≤ 500 chars, FE upload S3 qua ct-file-storage, backend persist nguyên văn KHÔNG validate format/path/lifecycle". (b) §3a.2 V2-11 `imageUrl` note (line ~5180) — clarify "DB-only operation" mirror V2-19 R11; S3 orphan acceptable OQ14. (c) §4 Forbidden rule (line ~5517) — REMOVE "KHÔNG accept HTTP/HTTPS URL ngoài S3 path convention + defensive validate prefix + Cross-tenant 403"; thay bằng "opaque URL string, KHÔNG validate format/prefix/path convention/delete S3 object". Cascade: INTEG-EXT-gf-inventory v8 + data-model v17 + graphql v7.27 + PKG-W03 v14. KHÔNG đụng V2-18/V2-19 attachment block (đã canonical R11). KHÔNG đụng OQ14 (S3 cleanup vẫn DEV/Ops scope). KHÔNG đụng sample request/response (giữ illustration). v20 → v21. |
| 2026-06-25 | v20 | **R23 — V2-22 error code `ERR-INV-045` canonical sync** (Architecture catchup Product canonical layer cùng date 2026-06-25). R22 đã ghi error code "PENDING BA: `ERR-INV-NNN EXPORT_ROW_CAP_EXCEEDED` dedicated, tạm dùng `ERR-CMN-validation`" — sai vì Product layer **đã định nghĩa `ERR-INV-045`** trước đó: `ERROR-CODE-REGISTRY.md` v14 line 143 (🔴 ERROR, DIALOG, 400) + `BR-GF-INVENTORY-CATALOG.md` v13 `BR-CAT-PROD-024` + `FEAT-CAT-PROD-EXPORT.md` v8 AC-5. **Sửa**: (a) §3a.2 V2-22 "Validation pre-handle" — rewrite error code từ `ERR-CMN-validation` "Filter quá rộng" → `ERR-INV-045` "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" (canonical message từ registry); display token `DIALOG`; reference BR-CAT-PROD-024 + FEAT-CAT-PROD-EXPORT AC-5. (b) §3a.3 error code table — row `ERR-INV-NNN (PENDING BA)` → `ERR-INV-045` canonical + link Product registry. Drop "PENDING Product CR" wording. Cascade: graphql v7.26 (V2-Q7 row + §3d.3) + PKG-W03 v13 (§2.2.1 V2-22 row + §2.2.2 V2-Q7 row + §2.2.3 Web error handling + §4.1 backend task + §5.1 deliverables). v19 → v20. |
| 2026-06-25 | v19 | **R22 — V2-22 export canonical hóa Option A single-call (per review feedback 2026-06-25 — 8 issues identified across REST/GraphQL/PKG-W03)** — §3a.2 V2-22 rewrite: (a) ADD `Security` block — `tenant_id` từ JWT context, KHÔNG accept trong path/body, cross-tenant → 403. (b) Validation note expand — error code flag **NEED CONFIRMATION** cho export row-cap > 1000: `ERR-CMN-validation` generic tạm thời, **PENDING Product CR** add mã dedicated `ERR-INV-NNN EXPORT_ROW_CAP_EXCEEDED` (BA định nghĩa). (c) Behavior block — confirm **9 cột canonical template** + ADD explicit "**Audit fields OMIT**": KHÔNG include `createdBy/createdByName/updatedBy/updatedByName/createdAt/updatedAt`; export là product snapshot KHÔNG audit log. (d) Response format — **Option A canonical**: filename rename `internal-products-{yyyyMMdd-HHmmss}.xlsx` → **`danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx`** (Vietnamese mirror import sample `public/sample-files/danh-muc-ma-san-pham-noi-bo.xlsx`). **DROP Option B paragraph** (202 Accepted + presigned URL polling) — đẩy thành footer DEFERRED future expansion CR. §3a.3 error table ADD row `ERR-INV-NNN` (PENDING BA) cho export row-cap > 1000 mirror ERR-INV-019 pattern. Sync graphql v7.25 (V2-Q7 semantic clarify) + PKG-W03 v10. v18 → v19. |
| 2026-06-25 | v18 | **R18 — Brand revert codified→free-text + Origin upgrade free-text→codified (per BA chốt 2026-06-25)** — Đảo ngược R8 D-C decision (brand catalog validation). **Brand**: §3a.2 V2-7/V2-8/V2-10/V2-11 request body + response sample rename `brandCode` → `brand` (VARCHAR(255) free-text); REMOVE `brandDisplayName` field (không còn BFF enrichment); V2-10/V2-11 validation note thay "validate vs `directory=BRAND`" → "free-text, max 255 chars, không validate catalog"; V2-20/V2-21 import body field rename; V2-22 export column note update. **Origin**: V2-7/V2-8/V2-10/V2-11 request/response rename `origin` → `originCode` + ADD `originDisplayName` (BFF enrichment); V2-10/V2-11 validation note ADD bullet "validate vs `directory=COUNTRY` (cache 5min)" pattern mirror UNIT/BRAND cũ — format ISO 3166-1 alpha-3 (JPN/USA/VNM); V2-20/V2-21 import body field rename; V2-22 export column rename. §4 Forbidden: REMOVE "brandCode validation R8 D-C" bullet (revert); ADD "originCode validation" bullet. §3a.2 V2-23 SKU search legacy `product.brand`/`origin` free-text giữ nguyên (untouched per ADR-017) — V2 `internal_product.brand` symmetric free-text; V2 `internal_product.origin_code` divergent codified (acceptable cho V2 schema mới). Error code `ERR-INV-020 ORIGIN_INVALID` pending Product CR riêng. OQ8 (R8 BRAND seed coverage) CLOSED — không cần seed. OQ9 mới (COUNTRY directory seed coverage) — BA verified, gf-erp-mdm import API sẽ provision. R8 D-C entry trong v10 changelog GIỮ NGUYÊN (historical record). v17 → v18. |
| 2026-06-24 | v17 | **R17 — Dọn stale Lịch sử note (V2-9) + cross-ref ERR-CMN-* central registry (per Backend review 2026-06-24)** — §3a.2 V2-9 REMOVED marker bỏ ref OQ12 "BA self-handle Product layer update" (Product layer đã đồng bộ: FEAT-CAT-PROD-DETAIL v3 chốt bỏ tab Lịch sử + FEAT-CAT-PROD-EDIT v3 gỡ ghi log). §3a.3 header thêm note cross-ref: `ERR-INV-*` namespace local; `ERR-CMN-*` catalog đầy đủ ở [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../Product/error-code/ERROR-CODE-REGISTRY.md), bảng api chỉ liệt kê mã dùng trong V2 (004/005). Tránh false-positive review "ERR-CMN-006 missing" — code có ở registry, chỉ không dùng trong V2 catalog endpoints. v16 → v17. |
| 2026-06-24 | v16 | **R16 — V2-22 export hard cap 50K → 1000 rows (per Backend review 2026-06-24)** — §3a.2 V2-22 "Validation pre-handle" siết defensive cap từ 50,000 xuống **1,000 rows** matched. Lý do: (a) align p95 latency target ≤ 10s mỗi export (Apache POI .xlsx generate 50K rows vượt budget memory + time); (b) thực tế garage SME không cần export đại trà — query filter (group/status/keyword) bắt buộc thu hẹp ≤ 1K rows; (c) bảo vệ TempFile pool + JVM heap khỏi DoS bulk export. Error message Việt-hoá rõ ràng hơn yêu cầu user áp filter chặt hơn. SDL V2-Q7 BFF mirror cap (sync graphql v7.20 + INTEG-FE v15). v15 → v16. |
| 2026-06-24 | v15 | **R15 — V2-22 export align với V2-7 search filter (per Delivery Authority feedback 2026-06-24)** — §3a.1 V2-22 row: method `GET` → `POST` + BR description note R15 alignment. §3a.2 V2-22 detail rewrite: POST body `{keyword, status, nature, materialGroupId}` (subset V2-7); omit `page/size/sort` (export tất cả matched + backend cap 50K rows defensive); cross-ref V2-7 cho keyword 3-col semantics (DRY — không duplicate SQL pseudo). Default `status=ACTIVE` preserved (BR-CAT-PROD-007). F8 OQ response format (Option A xlsx octet-stream / Option B async fileUrl) unchanged — BA pending. SDL V2-Q7 đã dùng `InternalProductSearchInput` shape — REST nay catch up. Sync graphql v7.19 + INTEG-FE v14. v14 → v15. |
| 2026-06-24 | v14 | **R13 — Rename `PricingMethod` enum codes per BA labels (per Delivery Authority feedback 2026-06-24)** — V2-10/V2-11 request samples `pricingMethod: "WAC_PERIOD_END"` → `"PWA"`. V2-11 validation note enum list rename `{WAC_PERIOD_END, FIFO, LIFO}` (LIFO was typo — không trong enum) → `{PWA, SI, FIFO, MA}` với Vietnamese labels inline (PWA=Bình quân cuối kỳ default, SI=Đích danh, FIFO=Nhập trước xuất trước, MA=Bình quân tức thời placeholder). V2-20/V2-21 import side-effect note default `WAC_PERIOD_END` → `PWA`. BR-CAT-PROD-010 lock semantic preserved (PWA only active). Sync data-model v14 + graphql v7.17 + HLD v11. v13 → v14. |
| 2026-06-24 | v13 | **R11 — internal_product description+notes + attachment client-uploads-to-S3 pattern (per Delivery Authority feedback 2026-06-24)** — V2-10 + V2-11 request body add `description` (≤500 chars) + `notes` (≤1000 chars) fields + validation note (OQ13 BA confirm labels). V2-18 rewrite multipart binary upload → JSON body `{fileName, fileType, sizeBytes, storageUrl}` — FE-uploads-to-S3 pattern (ADR-016 presigned URL); backend chỉ persist metadata, KHÔNG xử lý S3 binary; defensive validate storageUrl tenant-prefix. V2-19 simplify: remove "S3 delete best-effort" — DB-only delete; OQ14 flag cho S3 cleanup strategy (DEV/Ops scope). Sync data-model v13 + graphql v7.16 + HLD v10. v12 → v13. |
| 2026-06-24 | v12 | **R10 — V2-7 GET→POST + keyword 3-col search + REMOVE V2-9 history (per Delivery Authority feedback 2026-06-24)** — §3a.1 V2-7 row: `GET /api/v2/internal-products` → `POST /api/v2/internal-products/search` (consistency với V2-1 + V2-24 search pattern); V2-9 row strikethrough + REMOVED marker (BA chốt no history audit). §3a.2 V2-7 detail rewrite: POST body `{keyword, status, nature, materialGroupId, page, size, sort}` + keyword **3-column OR-match** `internal_product.code` + `internal_product.name` + legacy `product.sku` (qua JOIN `internal_product_sku_mapping`); SQL pseudo trong field doc; DISTINCT enforce; LIKE-unaccent. V2-9 detail subsection REMOVED entirely; replaced với REMOVED marker note (BR-CAT-CMN-001 + FEAT-CAT-PROD-DETAIL Tab "Lịch sử" — BA self-handle Product layer per OQ12). Side-effect notes on V2-10/V2-11/V2-13/V2-14/V2-15/V2-16/V2-17/V2-18/V2-19/V2-20/V2-21: remove "ghi internal_product_history action=..." → standard audit cols `created_at/by`/`updated_at/by` only (no history ledger). §3a.4 UI mapping row "Chi tiết mã SP" remove `getInternalProductHistory`. V2-12 cascade list remove `history` (now: sku_mapping, conversion_unit, attachment). **Default `status=ACTIVE`** preserved (R8). **Index leverage**: existing `(tenant_id, code)`, `(tenant_id, name)`, `uk_product_tenant_sku` — no new index. Sync data-model v12 + graphql v7.15 + INTEG-FE v13 + HLD v9. v11 → v12. |
| 2026-06-24 | v11 | **R9 — Rename API field `skuId` → `productId` (FK column tường minh, per Delivery Authority feedback 2026-06-24)** — §3a.1 V2-14 path param `{skuId}` → `{productId}`. §3a.2: V2-10 create body `initialSkuIds[]` → `initialProductIds[]`; V2-8 detail response `skuMappings[].skuId` → `productId`; V2-13 request body + response sample `skuId` → `productId` + validation note + backend SQL snippet; V2-14 heading path + path-param description; V2-23 search response field `skuId` → `productId` (keep `sku` string from legacy product.sku); §3a.4 UI mapping mutation args `(id, skuId)` → `(id, productId)` (mutation NAMES `mapSkuToInternalProduct`/`unmapSkuFromInternalProduct` PRESERVED — business operation semantic). Path `/sku-mappings` resource + error code `SKU_ALREADY_MAPPED` + BR-CAT-PROD-013/014 text references "SKU" all PRESERVED (business term unchanged). Rationale: FK actually references legacy `product.id` per Q2 (SKU master = legacy product table); `productId` rõ với data lineage. v10 → v11. |
| 2026-06-24 | v10 | **R8 — `internal_product` 4 fixes + global rename `uom` → `unit` (post-ratify additive refinement)** — Apply 5 decisions: **(A)** UoM catalog directory `UNIT_OF_MEASURE` → `UNIT` trong validation notes V2-10/V2-11/V2-15 + forbidden bullet; **(B)** `nature` enum keys English `GOODS(default)/TOOL/SERVICE/OTHER` (replaces `VAT_TU_HANG_HOA/CCDC/DICH_VU/KHAC`) trong V2-7 query enum, V2-7 response sample, V2-8 response sample, V2-10/V2-11 request samples + validation notes, V2-20/V2-21 import body, V2-22 export column note; **(C)** rename request body `brand` → `brandCode` (VARCHAR(50)) + add validation vs gf-erp-mdm `directory=BRAND` (V2-10/V2-11/V2-20/V2-21) + new forbidden bullet; response V2-7/V2-8 add `brandCode` + `brandDisplayName` (BFF enrichment); legacy V2-23 SKU search `brand` field giữ nguyên (legacy `product` table untouched per ADR-017); **(D)** new field `imageUrl` (optional, S3 path) — request V2-10/V2-11, response V2-7/V2-8, body V2-20/V2-21 (null trong sample); new forbidden bullet defensive validate prefix; clear-by-null supported V2-11; previous S3 object KHÔNG auto-delete on update; V2-22 export skip imageUrl (offline-meaningless); **(E)** global rename `uom` → `unit`: §3a.1 V2-15/V2-16/V2-17 path `/conversion-uoms` → `/conversion-units` + `{uomId}` → `{unitId}` + table column "InternalProductUom" → "InternalProductUnit"; §3a.2 detail sub-sections V2-15/V2-16/V2-17 header + path + body field `uomCode` → `unitCode` + response field `uomId/uomCode/uomDisplayName` → `unitId/unitCode/unitDisplayName` + side-effect table rename `internal_product_conversion_uom` → `internal_product_conversion_unit` (table) + error code `CONVERSION_UOM_DUPLICATE` → `CONVERSION_UNIT_DUPLICATE`; §3a.3 ERR-INV-014 description update; §3a.4 UI mapping rename `addConversionUom/updateConversionUom/deleteConversionUom` → `addConversionUnit/updateConversionUnit/deleteConversionUnit`; V2-8 detail `conversionUoms[]` → `conversionUnits[]`; V2-11 immutable note rename `mainUomCode` → `mainUnitCode`; V2-17 main-unit guard reference `internal_product.main_unit_code`. History action labels (`UOM_ADDED/UOM_UPDATED/UOM_REMOVED`) retained for ledger backward-compat (audit invariant — no rename). New OQ flagged in INTEG-EXT v5 §13a.6: OQ8 BRAND seed / OQ9 UNIT canonical / OQ10 image S3 / OQ11 single vs multi image. v9 → v10. |
| 2026-06-24 | v9 | **V2-1 response add `description` field (per Delivery Authority feedback 2026-06-24)** — §3a.2 V2-1 response sample: add `description` field vào 2 rows trong content array (consistency với SDL `type MaterialGroup` đã có `description: String` + V2-3 detail response đã include). FE list view có thể render description (tooltip/sub-line under name). ≤255 chars per BR-CAT-GRP-012 — manageable payload. v8 → v9. |
| 2026-06-24 | v8 | **V2-1 add `keyword` OR-match name/code (per Delivery Authority feedback 2026-06-24)** — §3a.1 V2-1 row BR description thêm "+keyword OR-match name/code". §3a.2 V2-1 detail: replace body field `name` → `keyword` (single search-box UX); backend SQL OR-match `LOWER(unaccent(name)) LIKE ...` OR `LOWER(unaccent(code)) LIKE ...`. Index leverage: existing `(tenant_id, name)` + `(tenant_id, code)` indexes union scan. Breaking change cho client cached (acceptable — batch refining, chưa DEV implement). Sync agg-garage-graph-graphql v7.12 + INTEG-FE v11. v7 → v8. |
| 2026-06-24 | v7 | **V2-1 GET→POST + flat-grouped-by-parent ordering (per Delivery Authority feedback 2026-06-24)** — §3a.1 row V2-1: `GET /api/v2/material-groups` → `POST /api/v2/material-groups/search` (avoid path conflict với V2-4 POST create; consistent với AP V2-24 `/search` suffix pattern). §3a.2 V2-1 detail re-written: POST body `{name, parentId, status, page, size, sort}`; default `sort=default` enforces `ORDER BY (parent_path, display_order, id)` — siblings của cùng parent xếp adjacent across pages. `parent_path` derived qua recursive CTE (no migration). Response thêm `parentName` enrichment field cho FE visually group/render parent header. Example pagination với group span pages. v6 → v7. |
| 2026-06-24 | v6 | **§3a.2 Endpoint detail coverage — full fill (per Delivery Authority feedback 2026-06-24)** — Trước: chỉ 7 endpoint có detail sub-section (V2-2, V2-4, V2-5, V2-10, V2-12, V2-20/V2-21 combined, V2-23) — 16/23 endpoint thiếu detail → contract incomplete, block DEV. Sau: thêm 15 detail sub-section còn thiếu (V2-1 search, V2-3 detail, V2-6 delete-with-guards, V2-7 search, V2-8 enriched detail, V2-9 history paginated, V2-11 update + immutability matrix, V2-13 sku map, V2-14 sku unmap, V2-15 add UoM, V2-16 update UoM, V2-17 remove UoM + main-uom guard, V2-18 attachment upload + 5-file/10MB/PDF-JPG-PNG validations, V2-19 attachment delete, V2-22 export + format Option A/B inline OQ note for F8 BA decision). Re-organize §3a.2 thành 3 groups (Material Groups V2-1..V2-6, Internal Products V2-7..V2-19, Misc V2-17..V2-23) + thêm coverage-rule note ở đầu section. Final coverage: 22 sub-sections cho 23 endpoints (V2-20+V2-21 combined per ADR-018). Defaults consistency: V2-1/V2-7 `status` default ACTIVE backend = symmetric với V2-4 R5 fix. V2-11 immutability matrix làm rõ `mainUomCode` chỉ immutable post-transaction (BR-CAT-PROD-006 verify). V2-22 Option A xlsx octet-stream là default, Option B async fileUrl flagged TBD inline. v5 → v6. |
| 2026-06-24 | v5 | **V2-4 add `status` request field (per Delivery Authority feedback 2026-06-24)** — §3a.2 V2-4 request body sample thêm field `status` (vd `"ACTIVE"`). Validation note thêm bullet: `status` optional enum `ACTIVE \| INACTIVE`; không truyền → backend default `ACTIVE` per BR-CAT-GRP-001 (default behavior preserved). Additive, backward-compat — clients cũ không truyền status vẫn work. Invalid enum → `400 ERR-CMN-validation`. Sync BFF SDL agg-garage-graph-graphql v7.10. v4 → v5. |
| 2026-06-23 | v4 | **R4 — Strip AP scope (Boundary correction — AP moved to gf-accounting wave per Delivery Authority decision 2026-06-23)** — §3a section heading: "Catalog V2 + Accounting Period" → "Catalog V2 only". §3a.1 remove rows V2-24..V2-30 (7 endpoints) + V2-25 tree-cap note (ERR-INV-028). §3a.2 remove detail sub-sections for V2-25/V2-27/V2-28/V2-30. §3a.3 remove error codes ERR-INV-021..026 + ERR-INV-028 (AP-specific). §3a.4 UI mapping remove 7 AP rows (keep 22 catalog rows). §4 Forbidden remove "V2-30 advisory" + "no PROPOSED AP publish" rules. §5 References + Change Log scrubbed of ADR-019 + BR-AP. `depends_on` remove ADR-019. Catalog v2 endpoints V2-1..V2-23 + ERR-INV-001..019 + ERR-INV-027 intact. |
| 2026-06-23 | v3 | **R3 F10 — Tree size caps (backend defensive)** — §3a.1 V2-2 row note: MAX 1000 nodes/tenant → HTTP 413 `ERR-INV-027`; V2-25 row note: MAX 500 periods/tenant → HTTP 413 `ERR-INV-028`. §3a.2 thêm detail sub-section cho V2-2 + V2-25 với enforcement spec (count-first, redirect-to-paginated hint). §3a.3 namespace error code thêm `ERR-INV-027` + `ERR-INV-028` (HTTP 413 — defensive cap, không phải BR violation). Đối xứng với BFF caps tại agg-garage-graph-graphql §3d.3. R3 F8 (V2-22 export format) flag-only inline (no bump needed): xlsx default per ADR-017/UX-FLOW, format selector flag cho BA decision khi product confirm. |
| 2026-06-23 | v2 | **Inventory V2 catalog-v2 + AP slice (DESIGN, ADR-017/018/019)** — §3a thêm 30 endpoint V2 (V2-1..V2-30): material-groups CRUD + tree, internal-products CRUD + history + sku-mappings + conversion-uoms + attachments + import (verify-import/import per ADR-018) + export, skus/search (legacy product lookup), accounting-periods CRUD + tree + lock-check. §3a.2 detailed contracts cho 8 non-trivial endpoints (validate per BR-CAT-GRP/PROD/AP + cross-link `ERR-INV-NNN`). §3a.3 namespace error code V2 (21 mã, BR-mapped). §3a.4 UI→GraphQL→REST mapping table cho web (mobile out of scope per UX-FLOW). §4 Forbidden thêm 5 rule guard V2 (no multipart import, lock-check advisory, no legacy product mutation via mapping, no PROPOSED publish trong batch, no local UoM whitelist). §5 References thêm ADR-017/018/019 + data §4a + BR-CAT/BR-AP. depends_on thêm 3 ADR. |
| 2026-05-07 | v1 | Initial API spec cho `gf-inventory`: REST/JSON với public APIs (`/api/v1` + `/api/v2`, bearer JWT/security-context) cho mdm-parts lookup, garage service CRUD, warehouse lookup, product CRUD/search, inventory delivery (CRUD, complete/cancel, mobile, products, export PDF), inventory receipt (CRUD, complete/cancel, mobile, export PDF), period stock (filters, mobile, current stats); cộng protected APIs (`/protected/deliveries`, `/protected/receipts`, `/protected/reservations`, `/protected/internal`, `/protected/v1`, `/protected/v2`) cho service-to-service inventory operations (reservation, stock cost-price, period stock total). Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
