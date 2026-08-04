---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W03"
last_reviewed: "2026-06-29"
source_ref: "Product/epics/EP-INVENTORY-CATALOG.md"
source_version: 7
source_sha: "59db2b4f49776691f00d991d38e88b96b83c0d155af89ade058dfc57eef89021"
generated_at: "2026-06-29T00:00:00+00:00"
parent_pkg: "PKG-W03-inventory-catalog"
features_in_wave:
  - FEAT-CAT-GRP-LIST
  - FEAT-CAT-GRP-CREATE
  - FEAT-CAT-GRP-DETAIL
  - FEAT-CAT-GRP-EDIT
  - FEAT-CAT-GRP-DELETE
  - FEAT-CAT-PROD-LIST
  - FEAT-CAT-PROD-CREATE
  - FEAT-CAT-PROD-DETAIL
  - FEAT-CAT-PROD-EDIT
  - FEAT-CAT-PROD-DELETE
  - FEAT-CAT-PROD-IMPORT
  - FEAT-CAT-PROD-EXPORT
boundaries_affected:
  - gf-inventory
  - agg-garage-graph
  - garage-web
  - garage-mobile
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  bundle_path: "N/A — epic mode, no per-tier bundle"
  bundle_generated_at: "N/A"
---

# EP-INVENTORY-CATALOG — Execution Spec (W03)

> **Execution spec**, không phải nguồn BA. Nguồn gốc: `Product/epics/EP-INVENTORY-CATALOG.md` v7.
> §1-§5 verbatim từ source. §6-§12 là DEV section do Delivery Authority + Architecture Authority soạn.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INVENTORY-CATALOG.md`](../../../../Product/epics/EP-INVENTORY-CATALOG.md) |
| Source version | 7 |
| Source SHA | `59db2b4f49776691f00d991d38e88b96b83c0d155af89ade058dfc57eef89021` |
| Generated at | 2026-06-29T00:00:00+00:00 |
| Wave | W03 — Inventory V2 Slice 1/4: Danh mục vật tư |

---

## 1. Outcome / Hypothesis

Nếu garage có một danh mục **Mã sản phẩm nội bộ** chuẩn hóa (mã chuẩn dùng để tính tồn và mapping SKU) cùng hệ thống **Nhóm vật tư hàng hóa** phân cấp để phân loại sản phẩm — quản lý tập trung trên một hệ thống — thì garage sẽ có nền tảng dữ liệu vật tư thống nhất phục vụ toàn bộ nghiệp vụ kho V2 (nhập kho, xuất kho, tồn đầu kỳ, tính giá, báo cáo tồn), giảm sai sót do trùng/lệch mã giữa các nguồn, và kiểm soát được vòng đời sản phẩm (đang dùng / ngừng dùng).

---

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý toàn bộ danh mục: tạo/sửa/xóa mã sản phẩm nội bộ, nhóm vật tư hàng hóa, gắn SKU, khai báo ĐVT quy đổi, import/export |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trên toàn bộ danh mục |

---

## 3. Vòng đời trạng thái

### 3.1 Nhóm vật tư hàng hóa (GRP)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (ACTIVE)       │  Ngừng  │   (INACTIVE)     │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo nhóm, trạng thái khởi tạo là **"Đang hoạt động"**.
- Nhóm có cấu trúc **phân cấp đa tầng** (cha–con qua trường "Thuộc nhóm", không giới hạn số cấp). *Lưu ý: đây là cấu trúc dữ liệu — danh sách Nhóm VTHH render dạng **trải phẳng có phân trang**, không phải tree view (xem `FEAT-CAT-GRP-LIST` AC-3).*
- Khi nhóm **cha** chuyển sang **"Ngừng hoạt động"**, hệ thống **tự động** cập nhật toàn bộ nhóm con (mọi cấp dưới) sang **"Ngừng hoạt động"**.
- Nhóm ở trạng thái **"Ngừng hoạt động"** không cho phép gắn vào mã sản phẩm nội bộ mới.

### 3.2 Mã sản phẩm nội bộ (PROD)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │ Đang hoạt động   │────────▶│ Ngừng hoạt động  │
  │   (ACTIVE)       │  Ngừng  │   (INACTIVE)     │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Kích hoạt lại        │
           └────────────────────────────┘
```

**Ghi chú:**
- Khi tạo mã sản phẩm nội bộ, trạng thái khởi tạo là **"Đang hoạt động"**.
- Mã sản phẩm ở trạng thái **"Ngừng hoạt động"** không cho phép sử dụng trong phiếu nhập kho / xuất kho mới.
- Mã sản phẩm nội bộ là **mã chuẩn** dùng để tính tồn kho và mapping với mã SKU (một mã nội bộ gắn nhiều SKU; một SKU chỉ thuộc một mã nội bộ).

---

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-CAT-GRP-LIST` | Danh sách nhóm vật tư hàng hóa | [FEAT-CAT-GRP-LIST](../features/FEAT-CAT-GRP-LIST.md) | P1 |
| `FEAT-CAT-GRP-CREATE` | Tạo nhóm vật tư hàng hóa | [FEAT-CAT-GRP-CREATE](../features/FEAT-CAT-GRP-CREATE.md) | P1 |
| `FEAT-CAT-GRP-DETAIL` | Chi tiết nhóm vật tư hàng hóa | [FEAT-CAT-GRP-DETAIL](../features/FEAT-CAT-GRP-DETAIL.md) | P1 |
| `FEAT-CAT-GRP-EDIT` | Chỉnh sửa nhóm vật tư hàng hóa | [FEAT-CAT-GRP-EDIT](../features/FEAT-CAT-GRP-EDIT.md) | P1 |
| `FEAT-CAT-GRP-DELETE` | Xóa nhóm vật tư hàng hóa | [FEAT-CAT-GRP-DELETE](../features/FEAT-CAT-GRP-DELETE.md) | P1 |
| `FEAT-CAT-PROD-LIST` | Danh sách mã sản phẩm nội bộ | [FEAT-CAT-PROD-LIST](../features/FEAT-CAT-PROD-LIST.md) | P1 |
| `FEAT-CAT-PROD-CREATE` | Tạo mã sản phẩm nội bộ | [FEAT-CAT-PROD-CREATE](../features/FEAT-CAT-PROD-CREATE.md) | P1 |
| `FEAT-CAT-PROD-DETAIL` | Chi tiết mã sản phẩm nội bộ (gắn SKU, ĐVT quy đổi) | [FEAT-CAT-PROD-DETAIL](../features/FEAT-CAT-PROD-DETAIL.md) | P1 |
| `FEAT-CAT-PROD-EDIT` | Chỉnh sửa mã sản phẩm nội bộ | [FEAT-CAT-PROD-EDIT](../features/FEAT-CAT-PROD-EDIT.md) | P1 |
| `FEAT-CAT-PROD-DELETE` | Xóa mã sản phẩm nội bộ | [FEAT-CAT-PROD-DELETE](../features/FEAT-CAT-PROD-DELETE.md) | P1 |
| `FEAT-CAT-PROD-IMPORT` | Import danh mục mã sản phẩm nội bộ | [FEAT-CAT-PROD-IMPORT](../features/FEAT-CAT-PROD-IMPORT.md) | P1 |
| `FEAT-CAT-PROD-EXPORT` | Export danh mục mã sản phẩm nội bộ | [FEAT-CAT-PROD-EXPORT](../features/FEAT-CAT-PROD-EXPORT.md) | P2 |
| `FEAT-INV-MOBILE-MENU` | Màn quản lý kho hàng — hub điều hướng mobile (6 tile, mobile-only) | [FEAT-INV-MOBILE-MENU](../features/FEAT-INV-MOBILE-MENU.md) | P1 |

---

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT-V2` | Downstream | Phiếu nhập kho V2 chọn mã sản phẩm nội bộ + ĐVT (chính/quy đổi) từ danh mục này. |
| `EP-INVENTORY-DELIVERY-V2` | Downstream | Phiếu xuất kho V2 chọn mã sản phẩm nội bộ từ danh mục này. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Báo cáo tồn kho / NXT tính theo mã sản phẩm nội bộ. |
| `EP-INVENTORY-OPENING-BALANCE` | Downstream | Import tồn đầu kỳ tham chiếu mã sản phẩm nội bộ. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` | Downstream | Tính giá xuất kho (BQGQ cuối kỳ) theo mã sản phẩm nội bộ + phương pháp tính giá khai báo ở từng mã. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: quản lý mã sản phẩm nội bộ, nhóm vật tư hàng hóa, mapping SKU, ĐVT quy đổi. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-inventory. |
| Danh mục ĐVT (master) | Nguồn đơn vị tính dùng cho ĐVT chính + ĐVT quy đổi của mã sản phẩm. |
| Danh mục SKU (sẵn có) | Nguồn mã SKU để gắn (mapping) vào mã sản phẩm nội bộ. |

---

## §6 Service Impact Matrix

> Wave W03 — 12 features × 4 boundaries. gf-inventory BE trước → agg-garage-graph BFF → garage-web + garage-mobile song song.
> **Mobile partial scope (BA decision 2026-06-24, CR-1782373204)**: garage-mobile chỉ implement GRP full CRUD (5 feature) + PROD view-only (LIST + DETAIL). PROD-CREATE/EDIT/DELETE/IMPORT/EXPORT = web-only. Xem NC-W03-EP-001 tại §10.

| Boundary | Role | FEATs touched (W03) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `gf-inventory` | **Lead boundary** | Tất cả 12 FEAT | **MỚI** 4 bảng qua Flyway `V{N+1}__inventory_v2_catalog.sql` (additive — KHÔNG ddl-auto): `material_group` (UUID PK, tenant_id, code, name, description ≤255, parent_id scalar FK self-ref ADR-009, status ACTIVE/INACTIVE, audit cols; unique `(tenant_id,code)`), `internal_product` (UUID PK, tenant_id, code, name, main_unit_code, material_group_id scalar FK, status, nature enum GOODS/TOOL/SERVICE/OTHER default GOODS, pricing_method enum default PWA locked, brand varchar 255 free-text, origin_code varchar 20 codified ISO-3166-1-alpha-3, image_url varchar 500 opaque, product_spec text, technical_spec text, description varchar 500, notes varchar 500, audit), `internal_product_sku_mapping` (id, tenant_id, internal_product_id scalar FK, sku_id scalar FK; unique `(tenant_id, sku_id)`), `internal_product_uom_conversion` (id, tenant_id, internal_product_id scalar FK, uom_id scalar FK, conversion_rate NUMERIC(18,6) >0; unique `(internal_product_id, uom_id)`), `internal_product_attachment` (id, tenant_id, internal_product_id scalar FK, file_url, file_name, file_size ≤**30MB** per BR-CAT-PROD-015 v17, mime_type PDF/JPG/PNG, attachment_kind IMAGE/DOC; max 5 per product) | **MỚI** 23 REST endpoints V2-1..V2-23 (`/api/v2/material-groups/*` × 6 + `/api/v2/internal-products/*` × 16 + `/api/v2/skus/search` × 1) + tenant filter + cascade INACTIVE (recursive CTE) + tree cap 1000 nodes ERR-INV-027 + import 500-row cap ERR-INV-041 + export 1000-row cap ERR-INV-045 + SKU search V2-23 | — | Không có event mới; không cần outbox (downstream W04-W06 consume qua REST sync — CB-CAT-001) |
| `agg-garage-graph` | BFF orchestrator | Tất cả 12 FEAT | GraphQL SDL types: `MaterialGroup`, `InternalProduct`, `MaterialGroupSearchInput`, `InternalProductSearchInput`, `ConversionUnitInput`, `AttachmentInput`, `ImportInternalProductsInput` etc. | **MỚI** 24 GraphQL ops: 9 Query (V2-Q1..Q9 `searchMaterialGroups`, `getMaterialGroupTree`, `getMaterialGroup`, `searchInternalProducts`, `getInternalProduct`, [Q6 N/A], `exportInternalProducts`, `searchSkus`, `listUnits`) + 15 Mutation (V2-M1..M15 createMaterialGroup, updateMaterialGroup, deleteMaterialGroup, createInternalProduct, updateInternalProduct, deleteInternalProduct, mapSkuToInternalProduct, unmapSkuFromInternalProduct, addConversionUnit, updateConversionUnit, deleteConversionUnit, addInternalProductAttachment, deleteInternalProductAttachment, verifyImportInternalProducts, importInternalProducts) + 6 DataLoaders + TENANT-USERS enrichment (createdByName/updatedByName trên MaterialGroup) + backend-native passthrough `parentName` + BFF defense (tree 1000 nodes, import 500 rows, export 1000 rows) | — | — |
| `garage-web` | UI consumer (full CRUD) | Tất cả 12 FEAT | — | — | **MỚI** 10 routes/screens tại `src/features/inventory-catalog/`: `/inventory/material-groups` (flat table + cột parentName), `/inventory/material-groups/create` (modal), `/inventory/material-groups/{id}` (drawer), `/inventory/material-groups/{id}/edit` (modal), `/inventory/internal-products` (list + filter + 3 button), `/inventory/internal-products/create`, `/inventory/internal-products/{id}` (Tabs: Thông tin chung/SKU/ĐVT/Đính kèm — KHÔNG tab Lịch sử), `/inventory/internal-products/{id}/edit`, `/inventory/internal-products/import` (dedicated route mirror customer), export button inline list page. Reuse-first: customs > share > ui (KHÔNG build-new component). | — |
| `garage-mobile` | UI consumer (PARTIAL — GRP full + PROD view-only) | GRP: 5 FEAT (LIST/CREATE/DETAIL/EDIT/DELETE). PROD: 2 FEAT (LIST + DETAIL view-only). **Excluded**: FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT, FEAT-CAT-PROD-DELETE, FEAT-CAT-PROD-IMPORT, FEAT-CAT-PROD-EXPORT = **web-only** | — | — | **MỚI** 5 screens tại `lib/ui/inventory_catalog/`: `MaterialGroupListScreen` (flat card list, Tab segment status, FAB — KHÔNG TreeView, Figma `21254:52586`), `MaterialGroupFormScreen` (create/edit unified), `MaterialGroupDetailScreen` (6 field, Figma `21254:51661`), `InternalProductListScreen` (**view-only** — KHÔNG action CREATE/IMPORT/EXPORT), `InternalProductDetailScreen` (Tabs — KHÔNG tab Lịch sử; **view-only** — KHÔNG nút Sửa/Xóa). BLoC: MaterialGroupListBloc, MaterialGroupFormBloc, InternalProductListBloc, InternalProductDetailBloc. | — |

**Dependency arrows:**
- `garage-web` / `garage-mobile` → `agg-garage-graph` (24 GraphQL ops V2-Q1..Q9 + V2-M1..M15).
- `agg-garage-graph` → `gf-inventory` (23 REST endpoints V2-1..V2-23 passthrough + DataLoader batch).
- `agg-garage-graph` → `gf-erp-mdm` (Q9 `listUnits` `directory=UNIT` + DataLoader `unitByCode` `directory=UNIT` + DataLoader `originCountryByCode` `directory=COUNTRY` — CB-CAT-002).
- `agg-garage-graph` → `ct-saas-tenant` (TENANT-USERS enrichment `createdByName/updatedByName` trên MaterialGroup — pattern canonical §3b).
- `agg-garage-graph` → `ct-file-storage` (presigned URL attachment upload pattern ADR-016 reuse — CB-CAT-003 adjacent).
- `gf-inventory` → `gf-erp-mdm` (validate `mainUnitCode` `directory=UNIT` + `originCode` `directory=COUNTRY` tại V2-10/V2-11/V2-15/V2-16/V2-20/V2-21).

---

## §7 Cross-boundary Contracts

> Nguồn: `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` v18 §1 Cross-boundary Rules.

| CB ID | Mô tả | REST/GraphQL/Kafka touchpoint | Integration file |
|---|---|---|---|
| CB-CAT-001 | Mã sản phẩm nội bộ + nhóm vật tư hàng hóa được **gf-inventory sở hữu** và dùng làm dữ liệu nền cho phiếu nhập/xuất kho, tồn đầu kỳ, tính giá và báo cáo tồn (cùng boundary — không cross-boundary). W04-W06 downstream consume qua REST sync (không outbox — KHÔNG có state-changing event ra ngoài W03). | Nội bộ gf-inventory + REST consumer W04+ | `Architecture/integrations/INTEG-BFF-gf-inventory.md` (baseline) |
| CB-CAT-002 | **ĐVT chính và ĐVT quy đổi** của mã sản phẩm nội bộ tham chiếu danh mục đơn vị tính (master) sẵn có tại `gf-erp-mdm`. Không nhập tự do — chỉ chọn từ danh mục. | (a) `gf-inventory` validate `mainUnitCode` / `uom_id` → `gf-erp-mdm` REST `GET /protected/catalog/v1/inquiry?directory=UNIT` khi tạo/cập nhật. (b) `agg-garage-graph` Q9 `listUnits` → gf-erp-mdm direct cho dropdown. (c) DataLoader `unitByCode` batch enrichment `directory=UNIT` cho `mainUnitDisplayName`. | `Architecture/integrations/INTEG-EXT-gf-erp-mdm.md` v4 (xác nhận endpoint `directory=UNIT` — NEED CONFIRMATION: đã cover `directory=COUNTRY`?) |
| CB-CAT-003 | **Mã SKU** gắn vào mã sản phẩm nội bộ lấy từ danh mục SKU sẵn có (legacy `product` table per ADR-017). Việc gắn tạo mapping trong `internal_product_sku_mapping`, **không tạo/sửa/xóa bản ghi SKU gốc**. Một SKU thuộc tối đa 1 mã nội bộ (ERR-INV-015). | (a) `gf-inventory` V2-23 `GET /api/v2/skus/search` lookup legacy `product` table SKU master. (b) `agg-garage-graph` V2-Q8 `searchSkus` passthrough cho dropdown "Gắn SKU". (c) `internal_product_sku_mapping` chỉ lưu `sku_id` scalar FK — KHÔNG `@ManyToOne` ADR-009. | — (nội bộ gf-inventory đọc legacy `product` table trực tiếp per ADR-017; không cross-service call cho V2-23) |
| CB-CAT-004 (BFF-side) | `agg-garage-graph` enrich `createdByName`/`updatedByName` cho `MaterialGroup` qua **TENANT-USERS pattern** — gọi `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` batch `{iamUserIds, tenantId từ JWT}`. Không áp dụng cho `InternalProduct` trong W03. | `agg-garage-graph` → `ct-saas-tenant` REST (batch POST, sau khi nhận V2-1/V2-3/M1/M2 response từ gf-inventory). Helper `enrichObjectWithByNames` / `enrichArrayWithByNames` (pattern production Settlement/Receipt). | `Architecture/api/agg-garage-graph-graphql.md` §3b prelude (TENANT-USERS enrichment pattern canonical) |
| CB-CAT-005 (BFF-side) | **Attachment upload** qua presigned URL pattern (ADR-016 reuse) — client upload trực tiếp lên ct-file-storage, BFF chỉ orchestrate; `gf-inventory` nhận metadata `{fileName, fileType, sizeBytes, storageUrl}` qua V2-18. | `agg-garage-graph` → `ct-file-storage` (presigned URL generate); sau đó FE PUT trực tiếp; FE gọi V2-M12 `addInternalProductAttachment` metadata-only. | NEED CONFIRMATION: `Architecture/integrations/INTEG-BFF-CT-FILE-STORAGE.md` có tồn tại không? Nếu chưa → tạo trước Phase attachment impl. |
| CB-CAT-006 (Origin) | `gf-inventory` validate `originCode` (ISO 3166-1 alpha-3) tại V2-10/V2-11/V2-20 vs `gf-erp-mdm` `directory=COUNTRY`. Invalid → `ERR-CMN-validation` (form context V2-10/V2-11) hoặc `ERR-INV-044` highlight dòng (import V2-20). | `gf-inventory` → `gf-erp-mdm` REST `GET /protected/catalog/v1/inquiry?directory=COUNTRY`. DataLoader `originCountryByCode` BFF-side cho `originDisplayName` enrichment. | `Architecture/integrations/INTEG-EXT-gf-erp-mdm.md` v4 — NEED CONFIRMATION endpoint `directory=COUNTRY` có cùng path pattern `directory=UNIT` không? |

---

## §8 Implementation Sequence DAG

> Topological order: schema/entity producer trước → REST API → BFF wire → UI parallel cuối. KHÔNG có hard gate giữa các phase (W03 entry wave Inventory V2 — no upstream dependency). Các boundary BE/BFF/Web/Mobile có thể start ngay khi bàn giao schema + contract.

```
DAY 1-2 — gf-inventory (BE lead):
  [Day 1]
  gf-inventory (schema) : Flyway V{N+1}__inventory_v2_catalog.sql
                          - CREATE TABLE material_group (UUID PK, tenant_id, code, name, description,
                            parent_id scalar FK, status ACTIVE/INACTIVE, audit cols)
                          - CREATE TABLE internal_product (UUID PK, tenant_id, code, name,
                            main_unit_code, material_group_id, status, nature, pricing_method,
                            brand, origin_code, image_url, product_spec, technical_spec,
                            description varchar 500, notes varchar 500, audit)
                          - CREATE TABLE internal_product_sku_mapping (id, tenant_id,
                            internal_product_id, sku_id; UNIQUE tenant_id+sku_id)
                          - CREATE TABLE internal_product_uom_conversion (id, tenant_id,
                            internal_product_id, uom_id, conversion_rate NUMERIC(18,6); UNIQUE unit)
                          - CREATE TABLE internal_product_attachment (id, tenant_id,
                            internal_product_id, file_url, file_name, file_size, mime_type,
                            attachment_kind; max 5 per product app-layer)
  
  Entry : W03 kick-off, no upstream blocker
  Exit  : Migration deployed to dev — schema stable

  [Day 1-2]
  gf-inventory (domain) : Entity + enum + domain layer
                          - Enum: MaterialGroupStatus, InternalProductStatus, ProductNature
                            {GOODS, TOOL, SERVICE, OTHER}, PricingMethod {PWA, SI, FIFO, MA}
                          - Domain service: cascade INACTIVE via recursive CTE (1 transaction)
                          - Circular check: BFS/DFS pre-UPDATE parentId (ERR-INV-003)
                          - Tree cap defense: COUNT nodes before buildTree V2-2 (ERR-INV-027 HTTP 413)
                          - Import: Apache POI parse .xlsx; verify-then-commit; 500-row cap ERR-INV-041
                          - Export: Apache POI generate; 1000-row count-before-build ERR-INV-045
                          - Attachment: 5-file cap per product; 30MB per file; PDF/JPG/PNG MIME

  gf-inventory (API)    : 23 REST endpoints V2-1..V2-23 under /api/v2/ (prefix, no {tenantId})
                          - GRP: V2-1 search (flat+ordered), V2-2 tree, V2-3 detail, V2-4 create,
                            V2-5 update (cascade + circular), V2-6 delete (guard ERR-INV-004/005)
                          - PROD: V2-7 search (POST, 3-col keyword), V2-8 detail enriched,
                            V2-10 create, V2-11 update, V2-12 delete (guard ERR-INV-008),
                            V2-13 mapSku, V2-14 unmapSku, V2-15 addConversionUnit,
                            V2-16 updateConversionUnit, V2-17 deleteConversionUnit,
                            V2-18 addAttachment (metadata-only), V2-19 deleteAttachment,
                            V2-20 verifyImport, V2-21 import, V2-22 export (POST stream binary),
                            V2-23 searchSkus (legacy product table)
  
  Entry : Schema migration deployed
  Exit  : Unit test ≥ 80% (service layer + cascade + import parser + tree cap) pass;
          23 endpoints integration tested on dev

══════════════════════════════════════════════════════
DAY 2-3 — agg-garage-graph (BFF):

  [Day 2-3, depends on gf-inventory API available]
  agg-garage-graph (SDL)    : SDL types MaterialGroup, InternalProduct, plus Input/Response types;
                              schema deploy
  agg-garage-graph (ops)    : 24 GraphQL ops V2-Q1..Q9 + V2-M1..M15
                              - Passthrough resolvers: M3/M4/M5/M6/M7/M8/M9/M10/M11/M12/M13
                              - DataLoader 6 loader: materialGroupById, unitByCode (UNIT),
                                originCountryByCode (COUNTRY), skuMappingsByProductId,
                                conversionUnitsByProductId, attachmentsByProductId
                              - TENANT-USERS enrichment: enrichObjectWithByNames / enrichArrayWithByNames
                                (MaterialGroup Q1/Q2/Q3/M1/M2 — createdByName/updatedByName)
                              - backend-native passthrough: parentName (Q1/Q2/Q3/M1/M2 — gf-inventory
                                fills via recursive CTE, BFF passthrough only)
                              - BFF defense: Q2 1000-node cap, M14/M15 500-row cap ERR-INV-041,
                                Q7 export 1000-row pass-through ERR-INV-045 DIALOG
                              - Q7 export: reverse-proxy signed-token TTL 60s; BFF middleware
                                re-call V2-22 + stream binary + Content-Disposition pass-through
                              - Auth header propagation: Authorization, X-Tenant-Id, X-Branch-Id,
                                x-request-id → gf-inventory + gf-erp-mdm + ct-saas-tenant +
                                ct-file-storage
                              - Error mapping: ERR-INV-001..ERR-INV-027 + ERR-INV-041/044/045/047
                                + ERR-CMN-004/005/006 → error-code-map.ts

  Entry : gf-inventory 23 endpoints available + ct-file-storage presigned URL API confirmed
  Exit  : Vitest contract test ≥ 80% pass (24 ops happy path + 2 error each + 3 defense cap +
          TENANT-USERS conditional); SDL deployed on staging

══════════════════════════════════════════════════════
DAY 3-5 — garage-web + garage-mobile (PARALLEL):

  [Day 3-5, depends on agg-garage-graph ops available]
  garage-web             : 10 routes src/features/inventory-catalog/
                           - Material Group: flat DataTable + parentName column, modal create/edit,
                             detail drawer; cascade INACTIVE confirm (alert-dialog + count children);
                             ACTIVE-only dropdown "Thuộc nhóm" (BR-CAT-GRP-008 v18)
                           - Internal Product: list + filter bar (status/nature/group/keyword) +
                             3 action buttons; form page (code regex + nature enum + mainUnitCode
                             combo + materialGroupCode ACTIVE-only + brand free-text + originCode
                             combo COUNTRY); detail tabs (Thông tin chung / SKU / ĐVT / Đính kèm
                             — KHÔNG tab Lịch sử); immutability UX (disable mainUnitCode/convUnit
                             when hasTransactions)
                           - Import: dedicated route /inventory/internal-products/import mirror
                             customer import pattern; XLSX client-side parse; M14 verify + M15 commit;
                             FE 500-row cap hint client-side; error highlight INLINE_FORM
                           - Export: single-call Q7 → downloadUrl → window.location.href; ERR-INV-045
                             DIALOG (KHÔNG toast)
                           - Reuse-first: KHÔNG build-new component; all UI elements covered by
                             web-component-registry.yaml (customs > share > ui)
                           - Error code map: error-messages.ts từ ERROR-CODE-REGISTRY

  Entry : agg-garage-graph SDL + 24 ops deployed on staging; Figma web W03 prefetched
  Exit  : Vitest ≥ 60% coverage (form validation + import state machine + error map);
          E2E Group flow + Product flow pass

  garage-mobile          : 5 screens lib/ui/inventory_catalog/
                           - MaterialGroupListScreen: flat card ListView.builder + Tab segment
                             status (ACTIVE/INACTIVE/ALL) + filter bottom sheet parent group +
                             FAB create; KHÔNG TreeView (CR-1782381477 Figma `21254:52586`)
                           - MaterialGroupFormScreen: create/edit unified; ACTIVE-only parentId
                             dropdown (BR-CAT-GRP-008)
                           - MaterialGroupDetailScreen: 6 field (name/status badge/parentName/
                             description/createdAt+createdByName/updatedAt+updatedByName);
                             Figma `21254:51661`
                           - InternalProductListScreen: list + filter sheet + search; VIEW-ONLY
                             (KHÔNG FAB/Import/Export actions)
                           - InternalProductDetailScreen: Tabs — KHÔNG tab Lịch sử; VIEW-ONLY
                             (KHÔNG overflow menu Sửa/Xóa)
                           - BLoC: MaterialGroupListBloc, MaterialGroupFormBloc,
                             InternalProductListBloc, InternalProductDetailBloc
                           - Wire Q1/Q3/Q4/Q5/M1/M2/M3 (7 ops mobile scope)

  Entry : agg-garage-graph SDL + 7 mobile ops deployed; Figma mobile W03 prefetched
           (7 nodes: 5 GRP + PROD-LIST + PROD-DETAIL)
  Exit  : bloc_test ≥ 80% (view-only assertion + cascade INACTIVE confirm);
          E2E Group flow + Product view-only flow pass
```

---

## §9 Architecture References

- **`Architecture/api/gf-inventory-api.md`** — 23 endpoint canonical V2-1..V2-23; request/response schema đầy đủ; immutability matrix V2-11; tree cap behavior; import schema R14; export stream R22.
- **`Architecture/api/agg-garage-graph-graphql.md`** — SDL canonical; 24 ops V2-Q1..Q9 + V2-M1..M15 (§3d.2); DataLoader 6 loader + TENANT-USERS pattern (§3b prelude ~line 40355); enrichment notes.
- **`Architecture/integrations/INTEG-BFF-gf-inventory.md`** — baseline integration file (KG `gf-inventory.knowledge-graph.yaml` v3 `integration_ref`).
- **`Architecture/integrations/INTEG-EXT-gf-inventory.md`** — extended integration cho W03 (referenced PKG-W03 v6 R18 origin codified + v14 R25 imageUrl opaque).
- **`Architecture/integrations/INTEG-EXT-gf-erp-mdm.md`** v4 — `directory=UNIT` + `directory=COUNTRY` endpoint pattern (PKG-W03 v6).
- **ADR-009** (`Architecture/decisions/ADR-009-*.md`) — JPA no relationship mapping. Tất cả 4 bảng W03 dùng scalar FK only; KHÔNG `@ManyToOne`/`@OneToMany`.
- **ADR-017** (SKU master) — V2-23 `searchSkus` đọc legacy `product` table; KHÔNG modify bản ghi SKU gốc (CB-CAT-003).
- **ADR-018** (import cap 500) — V2-20/V2-21 enforce 500 dòng/lần; BFF defense-in-depth M14/M15; FE client-side cap hint.
- **ADR-016** (ct-file-storage presigned URL) — V2-18/V2-19 attachment pattern reuse (CB-CAT-005).
- **KG `gf-inventory`** (`Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml`) v3 — baseline KG; W03 thêm 5 entity mới (material_group, internal_product + 3 mapping/join tables) + 23 API mới vào KG sau wave complete.
- **`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`** v18 — 13 rule GRP (BR-CAT-GRP-001..013) + 25 rule PROD (BR-CAT-PROD-001..025) + 2 audit/permission (BR-CAT-CMN-002..003) + 3 CB (CB-CAT-001..003).
- **`Product/error-code/ERROR-CODE-REGISTRY.md`** v16 — mã lỗi W03: ERR-INV-001..008, ERR-INV-012..016, ERR-INV-027, ERR-INV-041..047; ERR-CMN-004/005/006.
- **`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`** — UX spec cho toàn bộ feature trong epic (web + mobile).
- **`Execution/work-packages/PKG-W03-inventory-catalog.md`** v21 — phase plan, DEV task breakdown, effort per boundary, deliverable checklist.

---

## §10 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker cho |
|---|---|---|---|
| NC-W03-EP-001 | **FEAT-INV-MOBILE-MENU (Mobile Hub) — scope W03 hay W03+?** EP-INVENTORY-CATALOG v7 (2026-06-29) thêm `FEAT-INV-MOBILE-MENU` (hub điều hướng mobile 6 tile xuyên W03-W06) vào §4 Features. Context bundle orchestrator liệt kê **12 features** (KHÔNG bao gồm FEAT-INV-MOBILE-MENU). Nếu feature này nằm trong W03 scope: (a) cần thêm vào `features_in_wave` frontmatter, (b) thêm row garage-mobile vào §6 Service Impact Matrix, (c) spawn FEAT-level tier spec riêng. BA decisions EP v7: tile chưa ship ẨN HOÀN TOÀN (không badge) — W03 render 2 tile (Sản phẩm + Nhóm vật tư). EP v7 ghi "NEED CONFIRMATION: Figma node-id màn hub + điểm vào hub từ đâu". Confirm (a) có vào W03 scope không, (b) Figma node-id màn hub. | Business Authority + Delivery Authority | Mobile spec FEAT-INV-MOBILE-MENU; frontmatter update nếu có |
| NC-W03-EP-002 | **ERR-CMN-004 message update 10MB → 30MB** — BR-CAT-PROD-015 v17 (2026-06-29) nâng attachment cap lên 30MB toàn Inventory V2. Follow-up CR (BA + Architect dual-owner): cập nhật `Product/error-code/ERROR-CODE-REGISTRY.md` ERR-CMN-004 message từ "tối đa 10MB" → "tối đa 30MB" (bump v16→v17). Cho đến khi CR được apply, DEV wire attachment với giá trị 30MB nhưng error message hiển thị có thể drift. | Business Authority + Architecture Authority | DEV wire attachment error message; ERROR-CODE-REGISTRY sync |
| NC-W03-EP-003 | **PKG-W03 entity drift — `internal_product_attachment.file_size ≤ 10MB`** — PKG-W03 §2.2.1 vẫn ghi `file_size (≤ 10MB)` trong bảng entity trong khi BR-CAT-PROD-015 v17 (2026-06-29) đã update về 30MB. DEV phải dùng **30MB** per BR canonical. PKG cần update riêng (ngoài scope exec spec). | Delivery Authority | gf-inventory DEV attachment validation |
| NC-W03-EP-004 | **Country seed pre-W03 verification** — PKG-W03 v6 ghi "BA verified pre-W03" nhưng không có evidence explicit. Confirm `gf-erp-mdm` `directory=COUNTRY` đã seed ISO 3166-1 alpha-3 trước W03 start. Nếu seed chưa có → BLOCK V2-10/V2-11/V2-20/V2-23 origin validation + BFF DataLoader `originCountryByCode`. | Business Authority + Architecture Authority | gf-inventory V2-10/V2-11/V2-20 origin validate; BFF DataLoader |
| NC-W03-EP-005 | **`INTEG-BFF-CT-FILE-STORAGE.md` tồn tại không?** — CB-CAT-005 attachment upload cần BFF orchestrate presigned URL (ADR-016 reuse). Confirm file `Architecture/integrations/INTEG-BFF-CT-FILE-STORAGE.md` đã tồn tại. Nếu chưa → tạo trước agg-garage-graph Phase attachment impl. | Architecture Authority | agg-garage-graph attachment orchestration |
| NC-W03-EP-006 | **`INTEG-EXT-gf-erp-mdm.md` cover `directory=COUNTRY`** — CB-CAT-002 + CB-CAT-006 yêu cầu `gf-erp-mdm` endpoint `directory=COUNTRY` (cùng pattern `directory=UNIT`). Confirm `Architecture/integrations/INTEG-EXT-gf-erp-mdm.md` v4 đã document endpoint này. Nếu chưa → append section trước DEV start. | Architecture Authority | gf-inventory origin validate + BFF DataLoader `originCountryByCode` |

---

## §11 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INVENTORY-CATALOG.md` v7 | BA source-of-truth |
| Business rules | `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` v18 | 13 GRP rules + 25 PROD rules + 2 CMN + 3 CB |
| Work package | `Execution/work-packages/PKG-W03-inventory-catalog.md` v21 | DEV task breakdown, effort, deliverable checklist |
| KG gf-inventory | `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3 | Entity baseline, APIs baseline |
| gf-inventory API | `Architecture/api/gf-inventory-api.md` | 23 endpoints V2-1..V2-23 canonical |
| GraphQL ops | `Architecture/api/agg-garage-graph-graphql.md` | 24 ops V2-Q1..Q9 + V2-M1..M15 canonical |
| Integration BFF | `Architecture/integrations/INTEG-BFF-gf-inventory.md` | BFF → gf-inventory baseline |
| Integration ext | `Architecture/integrations/INTEG-EXT-gf-inventory.md` | W03 origin codified + imageUrl |
| Integration erp-mdm | `Architecture/integrations/INTEG-EXT-gf-erp-mdm.md` v4 | directory=UNIT + COUNTRY |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| ADR-016 | `Architecture/decisions/ADR-016-*.md` | ct-file-storage presigned URL |
| ADR-017 | `Architecture/decisions/ADR-017-*.md` | SKU master legacy product table |
| ADR-018 | `Architecture/decisions/ADR-018-*.md` | Import 500-row cap |
| Error registry | `Product/error-code/ERROR-CODE-REGISTRY.md` v16 | ERR-INV-001..047 + ERR-CMN-* |
| UX-FLOW | `Product/ux/UX-FLOW-INVENTORY-CATALOG.md` | Web + mobile UX spec |
| FEAT-CAT-GRP-LIST | `Product/features/FEAT-CAT-GRP-LIST.md` | |
| FEAT-CAT-GRP-CREATE | `Product/features/FEAT-CAT-GRP-CREATE.md` | |
| FEAT-CAT-GRP-DETAIL | `Product/features/FEAT-CAT-GRP-DETAIL.md` | |
| FEAT-CAT-GRP-EDIT | `Product/features/FEAT-CAT-GRP-EDIT.md` | |
| FEAT-CAT-GRP-DELETE | `Product/features/FEAT-CAT-GRP-DELETE.md` | |
| FEAT-CAT-PROD-LIST | `Product/features/FEAT-CAT-PROD-LIST.md` | |
| FEAT-CAT-PROD-CREATE | `Product/features/FEAT-CAT-PROD-CREATE.md` | |
| FEAT-CAT-PROD-DETAIL | `Product/features/FEAT-CAT-PROD-DETAIL.md` | |
| FEAT-CAT-PROD-EDIT | `Product/features/FEAT-CAT-PROD-EDIT.md` | |
| FEAT-CAT-PROD-DELETE | `Product/features/FEAT-CAT-PROD-DELETE.md` | |
| FEAT-CAT-PROD-IMPORT | `Product/features/FEAT-CAT-PROD-IMPORT.md` | |
| FEAT-CAT-PROD-EXPORT | `Product/features/FEAT-CAT-PROD-EXPORT.md` | |

---

## §12 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W03 từ EP-INVENTORY-CATALOG v7. §1-§5 verbatim copy từ source. §6 Service Impact Matrix (12 FEAT × 4 boundary; mobile partial scope GRP full + PROD view-only per CR-1782373204). §7 Cross-boundary contracts từ BR-GF-INVENTORY-CATALOG v18 §1 (CB-CAT-001..003 + 3 BFF-side CB bổ sung). §8 Implementation sequence DAG (BE Day 1-2 → BFF Day 2-3 → Web+Mobile parallel Day 3-5). §9 Architecture references. §10 Open items (6 NC markers: FEAT-INV-MOBILE-MENU scope gap, ERR-CMN-004 message drift, PKG attachment size drift, Country seed verification, INTEG-BFF-CT-FILE-STORAGE existence, INTEG-EXT-gf-erp-mdm COUNTRY coverage). |
| 2026-06-29 | 2 | Delivery Authority | DRAFT → ACTIVE per reviewer-W03 verdict APPROVED (read-only review by agent-execution-spec-reviewer). 10 NC items still open for downstream (Architecture/BA resolve) but do not block EP-level activation per checklist v5 item #18a/#19. |
