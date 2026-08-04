---
type: execution-spec
artifact_kind: wave-overview
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W03"
last_reviewed: "2026-06-29"
source: "gen-execution-spec"
generated_at: "2026-06-29T00:00:00+00:00"
parent_pkg: "PKG-W03-inventory-catalog"
pkg_version: 25
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
epics_in_wave:
  - EP-INVENTORY-CATALOG
brs_in_wave:
  - BR-GF-INVENTORY-CATALOG
boundaries_in_wave:
  - gf-inventory
  - agg-garage-graph
  - garage-web
  - garage-mobile
artifact_count:
  epics: 1
  features: 43
  business_rules: 1
  total: 45
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  decisions_log_size: "34KB"
pre_conditions_satisfied:
  - "EP-INVENTORY-CATALOG.md DRAFT ✓"
  - "BR-GF-INVENTORY-CATALOG.md DRAFT ✓"
  - "FEAT-CAT-GRP-{LIST,CREATE,DETAIL,EDIT,DELETE} × {be,bff,fe-web,mobile} DRAFT ✓ (5×4=20)"
  - "FEAT-CAT-PROD-{LIST,CREATE,DETAIL,EDIT,DELETE,IMPORT,EXPORT} × {be,bff,fe-web} DRAFT ✓ (7×3=21)"
  - "FEAT-CAT-PROD-{LIST,DETAIL} × mobile DRAFT ✓ (2)"
  - "Total: 45 DRAFTs confirmed"
---

# W03 Wave Overview — Inventory V2: Danh mục vật tư

> Tài liệu tổng hợp wave-level từ 45 spec DRAFT (1 EP + 1 BR + 43 FEAT-tier). Không thay thế tier spec riêng — đây là điểm tra cứu cross-boundary cho Delivery Authority + Architecture Authority + REVIEW agents.
>
> Nguồn: `PKG-W03-inventory-catalog` v21 · `EP-INVENTORY-CATALOG` v7 (source) · `BR-GF-INVENTORY-CATALOG` v18 (source).

---

## §1 Wave Summary

Wave W03 deliver toàn bộ **EP-INVENTORY-CATALOG** — 12 features, Inventory V2 slice 1/4. Mục tiêu nghiệp vụ: chuẩn hóa danh mục **Mã sản phẩm nội bộ** (mã chuẩn tính tồn kho + mapping SKU + ĐVT quy đổi) và **Nhóm vật tư hàng hóa** phân cấp đa tầng — foundation dữ liệu bắt buộc cho toàn bộ nghiệp vụ kho V2 downstream (W04 nhập kho, W05 xuất kho, W06 tồn kho/báo cáo). Wave này không có upstream hard gate (entry wave Inventory V2). Kết quả demo-able: Chủ garage / kế toán tạo nhóm vật tư + mã sản phẩm + gắn SKU + khai ĐVT quy đổi + import/export hàng loạt — cả 2 platform; garage-web full CRUD (12 FEAT), garage-mobile GRP full CRUD + PROD view-only per CR-1782373204.

---

## §2 Artifact Inventory

> 45 spec DRAFT. `source_version` = version `Product/features/*.md` tại thời điểm authoring 2026-06-29 (ghi "—" nếu không đọc trực tiếp source file; verify từ frontmatter mỗi tier spec).

### EP + BR

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| EP-INVENTORY-CATALOG | epic | v7 | DRAFT | `Execution/wave-specs/W03/Product/epics/EP-INVENTORY-CATALOG.md` |
| BR-GF-INVENTORY-CATALOG | business-rule | v18 | DRAFT | `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` |

### BE tier — gf-inventory (12 specs)

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| FEAT-CAT-GRP-LIST | be | v6 | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-LIST.md` |
| FEAT-CAT-GRP-CREATE | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-CREATE.md` |
| FEAT-CAT-GRP-DETAIL | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DETAIL.md` |
| FEAT-CAT-GRP-EDIT | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-EDIT.md` |
| FEAT-CAT-GRP-DELETE | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DELETE.md` |
| FEAT-CAT-PROD-LIST | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-LIST.md` |
| FEAT-CAT-PROD-CREATE | be | v12 | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-CREATE.md` |
| FEAT-CAT-PROD-DETAIL | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DETAIL.md` |
| FEAT-CAT-PROD-EDIT | be | v10 | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-EDIT.md` |
| FEAT-CAT-PROD-DELETE | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DELETE.md` |
| FEAT-CAT-PROD-IMPORT | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-IMPORT.md` |
| FEAT-CAT-PROD-EXPORT | be | — | DRAFT | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-EXPORT.md` |

### BFF tier — agg-garage-graph (12 specs)

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| FEAT-CAT-GRP-LIST | bff | v6 | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-LIST.md` |
| FEAT-CAT-GRP-CREATE | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-CREATE.md` |
| FEAT-CAT-GRP-DETAIL | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DETAIL.md` |
| FEAT-CAT-GRP-EDIT | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-EDIT.md` |
| FEAT-CAT-GRP-DELETE | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DELETE.md` |
| FEAT-CAT-PROD-LIST | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-LIST.md` |
| FEAT-CAT-PROD-CREATE | bff | v12 | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-CREATE.md` |
| FEAT-CAT-PROD-DETAIL | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DETAIL.md` |
| FEAT-CAT-PROD-EDIT | bff | v10 | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-EDIT.md` |
| FEAT-CAT-PROD-DELETE | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DELETE.md` |
| FEAT-CAT-PROD-IMPORT | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-IMPORT.md` |
| FEAT-CAT-PROD-EXPORT | bff | — | DRAFT | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-EXPORT.md` |

### FE-web tier — garage-web (12 specs)

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| FEAT-CAT-GRP-LIST | fe-web | v6 | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-LIST.md` |
| FEAT-CAT-GRP-CREATE | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-CREATE.md` |
| FEAT-CAT-GRP-DETAIL | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DETAIL.md` |
| FEAT-CAT-GRP-EDIT | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-EDIT.md` |
| FEAT-CAT-GRP-DELETE | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DELETE.md` |
| FEAT-CAT-PROD-LIST | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-LIST.md` |
| FEAT-CAT-PROD-CREATE | fe-web | v12 | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-CREATE.md` |
| FEAT-CAT-PROD-DETAIL | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DETAIL.md` |
| FEAT-CAT-PROD-EDIT | fe-web | v10 | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-EDIT.md` |
| FEAT-CAT-PROD-DELETE | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DELETE.md` |
| FEAT-CAT-PROD-IMPORT | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-IMPORT.md` |
| FEAT-CAT-PROD-EXPORT | fe-web | — | DRAFT | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-EXPORT.md` |

### Mobile tier — garage-mobile (7 specs — partial scope per CR-1782373204)

| artifact_id | tier | source_version | status | path | scope |
|---|---|---|---|---|---|
| FEAT-CAT-GRP-LIST | mobile | v6 | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-LIST.md` | full CRUD |
| FEAT-CAT-GRP-CREATE | mobile | — | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-CREATE.md` | full CRUD |
| FEAT-CAT-GRP-DETAIL | mobile | — | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DETAIL.md` | full CRUD |
| FEAT-CAT-GRP-EDIT | mobile | — | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-EDIT.md` | full CRUD |
| FEAT-CAT-GRP-DELETE | mobile | — | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DELETE.md` | full CRUD |
| FEAT-CAT-PROD-LIST | mobile | — | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-LIST.md` | **view-only** |
| FEAT-CAT-PROD-DETAIL | mobile | — | DRAFT | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md` | **view-only** |

> **Mobile scope intentional**: FEAT-CAT-PROD-{CREATE,EDIT,DELETE,IMPORT,EXPORT} = web-only per BA decision 2026-06-24 (CR-1782373204, PKG-W03 v12 §2.2.4). 5 mobile tier specs không tồn tại — KHÔNG phải gap. REVIEWER không flag đây là missing artifact.

---

## §3 Cross-tier Consistency Snapshot

> Known divergences giữa các tier specs hoặc source artifacts. Ghi nhận trước REVIEW agent để tránh false positive / false negative.

| # | Divergence | Source | Severity | Owner |
|---|---|---|---|---|
| DIV-01 | **Feature count mismatch**: EP-INVENTORY-CATALOG v7 §4 list 13 features (12 + `FEAT-INV-MOBILE-MENU` hub mobile 6 tile). PKG v21 + orchestrator context bundle = 12 (không bao gồm `FEAT-INV-MOBILE-MENU`). Không có tier spec nào cho `FEAT-INV-MOBILE-MENU` trong W03. Xem NC-W03-EP-001. | EP v7 §4 vs PKG §2.2 | HIGH | Business Authority |
| DIV-02 | **Table name triple drift**: (a) ADR-017 dùng `internal_product_conversion_uom` (column `uom_code`); (b) PKG §2.2.1 entity table dùng `internal_product_uom_conversion` (column `uom_id`); (c) PKG V2-15 REST spec ghi thêm "table backend `internal_product_conversion_unit`". EP §8 + BR §3.3 theo `internal_product_uom_conversion`. Architecture Authority confirm tên canonical trước khi DEV viết Flyway migration. | ADR-017 vs PKG entity vs PKG V2-15 | HIGH — BLOCK migration | Architecture Authority |
| DIV-03 | **ERR-CMN-004 message drift**: `ERROR-CODE-REGISTRY` còn "tối đa 10MB"; BR-CAT-PROD-015 v17/v18 chốt 30MB cho toàn Inventory V2. FE/Mobile có thể hardcode "30MB" tạm trong error message riêng — không block W03 delivery. Follow-up CR cần update registry. | BR v18 vs ERROR-CODE-REGISTRY v16 | MEDIUM | Business Authority + Architecture Authority |
| DIV-04 | **i18n policy inconsistency FE-web**: `FEAT-CAT-GRP-LIST` (fe-web) chọn i18next; `FEAT-CAT-GRP-CREATE` (fe-web) confirm fixed VN labels inline (PKG G8, `i18n_keys: []`); `FEAT-CAT-PROD-DELETE` (fe-web) để default i18next pending confirm. Cần BA/PO chốt uniform policy cho toàn bộ 12 FEAT FE-web trước DEV. | _decisions.md GRP-CREATE vs GRP-LIST vs PROD-DELETE | HIGH | Business Authority / PO |
| DIV-05 | **description maxLength drift mobile**: `FEAT-CAT-GRP-CREATE` (mobile) chọn 250 (Figma SSOT counter "0/250"); `FEAT-CAT-GRP-EDIT` (mobile) chọn 255 (PKG canonical ERR-INV-016). Client behavior inconsistent nếu không chốt. Nếu chọn 250 → update Flyway migration `description VARCHAR(250)` + BE validation. | _decisions.md GRP-CREATE mobile vs GRP-EDIT mobile | MEDIUM | Business Authority |
| DIV-06 | **Status badge color drift mobile**: `FEAT-CAT-GRP-LIST` (mobile) dùng orange (`bgBadgeWarning`) cho "Ngừng hoạt động"; `FEAT-CAT-PROD-LIST` (mobile) dùng grey. Intentional per Figma SSOT (hai màn khác nhau trong design system). BA xác nhận trước impl để tránh visual rework. | Figma GRP-LIST node 21252:48117 vs PROD-LIST badge | MEDIUM | Business Authority + Mobile UX |
| DIV-07 | **Figma node ID canonical GRP-DELETE mobile**: spec `FEAT-CAT-GRP-DELETE` (mobile) dùng node IDs `21254:52061`/`52450` (từ figma-mobile spec); oracle PNG trong repo (figma-test-mobile) dùng `21254:52182`/`52571`. Hai sets thuộc 2 Figma files khác nhau. Architecture Authority confirm node canonical trước mobile DEV. | figma-mobile spec vs oracle PNG git status | HIGH | Architecture Authority |
| DIV-08 | **Icon count AC-7 GRP-LIST web**: Figma extract báo 2 icon (Create + Import); source FEAT-CAT-GRP-LIST AC-7 mention 3 icon. Visual behavior sẽ differ. BA confirm canonical icon set trước impl. | Figma `wave03-cat-grp-list.md` vs source FEAT AC-7 | MEDIUM | Business Authority |
| DIV-09 | **Mobile partial scope (intentional)**: FEAT-CAT-PROD-{CREATE,EDIT,DELETE,IMPORT,EXPORT} = web-only. 5 mobile specs không được tạo. REVIEWER flag = false positive nếu không biết context. | PKG-W03 v12 §2.2.4 + CR-1782373204 | INFO | (documented, no action) |

---

## §4 Aggregated NEED CONFIRMATION

> Tổng hợp từ 45 spec DRAFT + EP §10 (6 items) + BR §7 (2 items) + `_decisions.md` (89 entries). **Tổng ước tính: ~87 NC markers** across toàn bộ 45 specs. Danh sách đầy đủ tại `_decisions.md` + §10 mỗi FEAT tier spec. Bên dưới: các NC quan trọng nhất grouped by category.

### 4.1 Schema / Naming — cần confirm trước Flyway migration

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-W03-EP-003 | PKG §2.2.1 entity table `internal_product_attachment.file_size ≤ 10MB` (stale); BR-CAT-PROD-015 v17/v18 canonical = 30MB. DEV dùng 30MB. | Delivery Authority | gf-inventory migration wording |
| NC-DIV-02 | Table name canonical: `internal_product_uom_conversion` vs `internal_product_conversion_unit` (xem DIV-02). Architecture Authority confirm TRƯỚC Flyway V{N+1} commit. | Architecture Authority | BLOCK migration |
| NC-SCHEMA-01 | V2-7 `searchInternalProducts` max page size: đề xuất 100 (PKG không explicit). Confirm để đồng bộ BE cap + BFF/FE expectation. | Architecture Authority | BE V2-7 |
| NC-SCHEMA-02 | V2-7 sort fields hợp lệ + default: đề xuất `code, name, createdAt` default `code ASC`. PKG không liệt kê explicit. | Architecture Authority | BE V2-7 |
| NC-SCHEMA-03 | `description` maxLength mobile: Figma "0/250" (GRP-CREATE) vs PKG "≤ 255" (GRP-EDIT). BA chốt 1 giá trị (xem DIV-05). | Business Authority | Mobile GRP-CREATE/EDIT + BE migration |

### 4.2 Endpoint Paths — cần confirm trước BFF DataLoader impl

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-W03-EP-004 | `gf-erp-mdm` `directory=COUNTRY` đã seed ISO 3166-1 alpha-3 trước W03 start? Nếu chưa → BLOCK V2-10/V2-11/V2-20 origin validation. | Business Authority | BLOCK BE origin validate |
| NC-W03-EP-005 | `Architecture/integrations/INTEG-BFF-CT-FILE-STORAGE.md` tồn tại? Cần cho BFF attachment upload orchestration (ADR-016 reuse). | Architecture Authority | BFF attachment impl |
| NC-W03-EP-006 | `INTEG-EXT-gf-erp-mdm.md` v4 có document endpoint `directory=COUNTRY`? Confirm path trước DataLoader `originCountryByCode` + BE validate. | Architecture Authority | BFF DataLoader-2, BE V2-10/V2-20 |
| NC-ENDPOINT-01 | gf-erp-mdm batch endpoint path cho DataLoader `unitByCode` (UNIT) + `originCountryByCode` (COUNTRY): suy luận từ pattern `GET /protected/catalog/v1/inquiry?directory={X}`, chưa confirmed vs actual integration file. | Architecture Authority | BFF DataLoaders 1-2 |
| NC-ENDPOINT-02 | TENANT-USERS enrichment endpoint path: `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` (từ §3b prelude ~40355). Architecture Authority confirm path khớp production ct-saas-tenant. | Architecture Authority | BFF MaterialGroup enrichment |

### 4.3 GraphQL / SDL — cần confirm trước BFF impl

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-SDL-01 | `DeleteResponse` type name: đề xuất union `ApiResponseString | ErrorResponse` (GRP-DELETE BFF). BFF architect confirm tên type để tránh SDL conflict khi FEAT-CAT-PROD-DELETE reuse. | Architecture Authority | BFF SDL compile |
| NC-SDL-02 | `DeleteResponse` reuse cho PROD-DELETE BFF: dev phải kiểm tra schema đã tồn tại type từ GRP-DELETE trước khi impl (không define duplicate). | Architecture Authority | BFF PROD-DELETE |
| NC-SDL-03 | DataLoaders 5-6 trong tổng 6 loaders chưa xác định từ bundle. Loaders 1-4 = `materialGroupById`, `unitByCode`, `originCountryByCode`, `skuMappingsByProductId`. Loaders 5-6 = `conversionUnitsByProductId` + `attachmentsByProductId` (inferred). Architecture Authority confirm. | Architecture Authority | BFF DataLoader strategy |
| NC-SDL-04 | BFF parent group query op name cho mobile filter dropdown (GRP-LIST + GRP-CREATE mobile): suy luận `searchMaterialGroups` (Q1, size=100). Confirm sau khi BFF GRP-LIST spec ACTIVE. | Architecture Authority | Mobile GRP-LIST + GRP-CREATE |

### 4.4 RBAC / Permissions

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-RBAC-01 | Permission constant names trong `gf-inventory` KG §permissions bị truncate trong bundle. DEV phải đọc `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` §permissions trực tiếp. Ảnh hưởng BE auth annotation tất cả 12 FEAT. | Architecture Authority | BE auth annotation |
| NC-RBAC-02 | GRP-DELETE RBAC: garage-owner only vs cả accountant? Source AC-6 không specify. Author suy luận garage-owner only; BR-CAT-CMN-003 nói cả 2 role equal. BA confirm để đồng bộ BE + mobile render. | Business Authority | BE GRP-DELETE, Mobile GRP-DELETE |
| NC-RBAC-03 | Permission constant tên cho PROD-DELETE FE-web + mobile (tên suy luận `DELETE_INTERNAL_PRODUCT`): verify từ KG §permissions trước conditional render. | Architecture Authority | FE-web + Mobile PROD-DELETE render |

### 4.5 UI / UX

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-W03-EP-001 | FEAT-INV-MOBILE-MENU (hub 6 tile W03-W06) — scope W03 hay W03+? Figma node-id màn hub? Điểm vào từ đâu? Nếu trong W03 → spawn tier spec riêng + update frontmatter `features_in_wave`. | Business Authority | Mobile hub spec; W03 scope |
| NC-UX-01 | i18n policy FE-web: BA/PO confirm "fixed VN labels" uniform cho toàn bộ 12 FEAT FE-web (PKG G8) hay có exception. Hiện có drift DIV-04. | Business Authority / PO | Toàn bộ 12 FE-web specs |
| NC-UX-02 | `originCode` UI type PROD-CREATE/EDIT FE-web: `input-select` searchable (R18 codified vs gf-erp-mdm) vs plain `input` (server-only validate). Figma DSL khai báo `type: Input`. | Business Authority | FE-web PROD-CREATE/EDIT |
| NC-UX-03 | Attachment upload flow PROD-CREATE FE-web: Option A (pre-upload ct-file-storage → collect fileUrls → submit cùng V2-10) vs Option B (tạo product trước → V2-18 riêng). | Architecture Authority | FE-web PROD-CREATE |
| NC-UX-04 | PROD-IMPORT FE-web kết quả: Toast transient (Figma Screen 4 TAP-13) vs full result screen với stats Tạo mới/Bỏ qua + nút Tải file lỗi (AC-8). | Business Authority | FE-web PROD-IMPORT |
| NC-UX-05 | GRP-DETAIL FE-web: "Mô tả" field (AC mentions) absent từ Figma PNG node 13501:137145. BA confirm cần render không. | Business Authority | FE-web GRP-DETAIL |
| NC-UX-06 | GRP-DETAIL FE-web: "Mã nhóm VTHH" hiển thị màu text-primary (blue link) — click action no-op vs clipboard? | Business Authority | FE-web GRP-DETAIL |
| NC-UX-07 | GRP-DETAIL FE-web: "categoryLabel" (4th column, tên field nguồn không rõ từ schema). BA + BFF confirm trước GraphQL query field. | Business Authority + Architecture Authority | FE-web GRP-DETAIL |
| NC-UX-08 | PROD-IMPORT dropzone label ".xls, .xlsx, .csv" (Figma verbatim TAP-4) nhưng validate thực tế chỉ `.xlsx` (BR-CAT-PROD-017). BA confirm đồng bộ label + validate scope. | Business Authority | FE-web PROD-IMPORT |
| NC-UX-09 | Mobile PROD-DETAIL AC-3 audit trail: Figma node `21526:45088` không có AuditCard. BA confirm + cung cấp Figma node nếu muốn audit display trên mobile. | Business Authority + Mobile UX | Mobile PROD-DETAIL |
| NC-UX-10 | Mobile PROD-DETAIL AC-4/5/6/8 (conversionUnits/skuMappings/attachments list sections): Figma extract chỉ 2 frames variant status. BA confirm list sections hiển thị mobile hay web-only. | Business Authority | Mobile PROD-DETAIL |
| NC-UX-11 | PROD-EXPORT FE-web: **FIGMA SPEC MISSING** — `/prefetch-figma web 03 FEAT-CAT-PROD-EXPORT` cần chạy trước DEV. Design tokens + button layout chưa xác nhận. | Business Authority + UX | FE-web PROD-EXPORT DEV start |
| NC-UX-12 | `TablePagination` component path FE-web: suy luận `share/tables/table-pagination`. DEV verify thực tế trước import (PROD-LIST FE-web). | Architecture Authority | FE-web PROD-LIST |

### 4.6 Error Codes

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-W03-EP-002 | Follow-up CR: `ERROR-CODE-REGISTRY ERR-CMN-004` message "10MB" → "30MB" (BR-CAT-PROD-015 v17). Không block W03 DEV — FE có thể hardcode "30MB" riêng. | Business Authority + Architecture Authority | Post-W03 CR |
| NC-ERR-01 | parentId not found / INACTIVE error code V2-4 (GRP-CREATE BE): đề xuất `ERR-INV-028` hoặc `ERR-CMN-validation`. BA/Architecture Authority confirm. | Architecture Authority | BE GRP-CREATE V2-4 |
| NC-ERR-02 | `PUT /api/v2/material-groups/{id}` với field `code`: reject 400 (error code?) vs silently ignore? BR-CAT-GRP-004 không chỉ định. | Business Authority | BE GRP-EDIT, FE UX clarity |

### 4.7 Figma / Design

| NC ID | Mô tả | Owner | Blocker |
|---|---|---|---|
| NC-FIGMA-01 | Figma node canonical GRP-DELETE mobile: figma-mobile spec `21254:52061`/`52450` vs oracle PNG `21254:52182`/`52571` (xem DIV-07). Architecture Authority confirm node set. | Architecture Authority | Mobile GRP-DELETE impl |
| NC-FIGMA-02 | PROD-EXPORT FE-web Figma MISSING (xem NC-UX-11). Cần prefetch trước DEV. | Business Authority + UX | FE-web PROD-EXPORT |
| NC-FIGMA-03 | GRP-LIST mobile: search header copy bug "phiếu dịch vụ" trong Figma (semantically mismatched). Spec impl "nhóm vật tư" (context-correct). BA confirm wording canonical trước merge. | Business Authority | Mobile GRP-LIST search header |
| NC-FIGMA-04 | "Thương hiệu" PROD-EDIT FE-web: Figma DSL khai báo `type: Select` (catalog) nhưng R18 revert brand → free-text VARCHAR(255). BA confirm intent: catalog dropdown vs plain text input. | Business Authority | FE-web PROD-EDIT brand field |

### 4.8 Mobile Component Paths

| NC ID | Mô tả | Owner | Scope |
|---|---|---|---|
| NC-MOB-01 | KG `implementation.components` không có trong bundle §G.X cho garage-mobile. Tất cả 7 mobile specs dùng naming-convention inference (App* → share/, Custom* → customs/). DEV PHẢI scan `lib/components/{customs,share,ui}/` thực tế + cập nhật §5.2 paths trước impl. | Mobile DEV | Tất cả 7 mobile specs |

---

## §5 Build-new Components Catalog

> FE-web tier: tổng hợp từ spec decisions. Garage-mobile không có web-component-registry tương đương — xem NC-MOB-01 cho tất cả 7 mobile specs.

| Component | FEAT scope | Justification (no match tại customs/share/ui) | Chức năng |
|---|---|---|---|
| `InternalProductTable` | FEAT-CAT-PROD-LIST | customs/: không có catalog-v2 domain table. share/tables/table = primitive không đủ (10-cột + StatusBadge + code link). | DataTable 10 cột + status badge + code link + filter integration |
| `InternalProductRowActions` | FEAT-CAT-PROD-LIST | customs/: không có domain-specific row-action cho inventory. shadcn IconButton available nhưng cần wrapper + confirm dialog logic. | 2-icon row (Edit + Delete) + confirm dialog trigger |
| `InternalProductCreatePage` | FEAT-CAT-PROD-CREATE | customs/: InternalProduct = entity mới W03 (ADR-017 additive aggregate). Không có template page domain-specific. | Full-page form: Tabs (Thông tin chung / ĐVT quy đổi / Gắn SKU / Đính kèm) |
| `InternalProductFormFields` | FEAT-CAT-PROD-CREATE | customs/: no match cho domain-new entity field group. share/inputs cover primitives. | Form group: code/name/mainUnitCode/materialGroup/nature/brand/originCode/specs |
| `UomConversionPanel` | FEAT-CAT-PROD-CREATE | customs/: không có conversion-unit inline panel trong registry. Pattern domain-new. | Inline add/remove ĐVT quy đổi rows trong create session |
| `AssignSkuDialog` | FEAT-CAT-PROD-CREATE + DETAIL | customs/: không có SKU-assign dialog trong registry. Scan confirmed. | Modal search (V2-Q8 searchSkus) + select + gắn/bỏ gắn |
| `AttachmentUploadPanel` | FEAT-CAT-PROD-CREATE | customs/: không có attachment-upload panel cho inventory domain. ADR-016 presigned URL pattern. | Multi-file dropzone + thumbnail list (≤5 files, ≤30MB, PDF/JPG/PNG) |
| `AddConversionUnitDialog` | FEAT-CAT-PROD-DETAIL | customs/: không có quick-add ĐVT dialog. Pattern domain-new quick-action từ detail header. | Modal add ĐVT quy đổi; dùng V2-M9 addConversionUnit |
| `InternalProductImportPage` | FEAT-CAT-PROD-IMPORT | customs/: không có xlsx import wizard cho inventory-catalog domain. Mirror customer import pattern. | Dropzone + verify (M14) + result table + error download |
| `ImportResultsTable` | FEAT-CAT-PROD-IMPORT | customs/: import-result table domain-specific. share/table-pagination wraps nhưng column logic mới. | Paginated valid/invalid rows + error highlight + search |
| `ImportStatsBlock` | FEAT-CAT-PROD-IMPORT | customs/: không có import stats block trong registry. AC-8 pending confirm (xem NC-UX-04). | Tạo mới / Bỏ qua / Lỗi summary counts + Tải file lỗi action |

> **PROD-EXPORT FE-web**: không build-new component. Handler export ~20 LoC inline trong `ProductListPage`. Button Export reuse `share/exports/export-excel` (Priority 2 — share/). Xem NC-UX-11 cho Figma MISSING.

---

## §6 Boundary Effort Summary

> Từ PKG-W03-inventory-catalog v21 §4.1. Timebox 5 ngày làm việc; 4 dev parallel.

| Boundary | Agent | Effort | Tasks chính |
|---|---|---|---|
| `gf-inventory` | agent-dev-gf-inventory | ~21h | Flyway V{N+1} (5 bảng) · 23 REST endpoints V2-1..V2-23 · domain service (cascade INACTIVE CTE + circular check + immutability guards + `@ConversionRatePrecision`) · Apache POI (import 500-row verify-then-commit + export 1000-row stream) · unit test ≥80% service layer + cascade + import parser + tree cap |
| `agg-garage-graph` | agent-dev-agg-garage-graph | ~16h | SDL types deploy · 24 GraphQL ops (9Q + 15M) · 6 DataLoaders · TENANT-USERS `enrichObject/ArrayWithByNames` (MaterialGroup) · BFF defense (tree 1000 nodes Q2, import 500 rows M14/M15, export pass-through ERR-INV-045) · Q7 reverse-proxy signed-token TTL 60s · auth header propagation · Vitest ≥80% |
| `garage-web` | agent-dev-garage-web | ~24h | 10 routes `src/features/inventory-catalog/` · Reuse-first customs>share>ui (composition build-new tại features/) · import page XLSX parse client-side + verify + commit · export single-call + DIALOG ERR-INV-045 · error-messages.ts từ ERROR-CODE-REGISTRY · Vitest ≥60% + E2E GRP + PROD flows |
| `garage-mobile` | agent-dev-garage-mobile | ~13.5h | 5 screens `lib/ui/inventory_catalog/` (GRP full + PROD view-only) · 4 BLoC (MaterialGroupList/Form, InternalProductList/Detail) · 7 ops wire (Q1/Q3/Q4/Q5/M1/M2/M3) · bloc_test ≥80% + E2E GRP + PROD view-only |
| **TỔNG** | — | **~74.5h** | ≪ 5-day timebox (4 boundary parallel Day 3-5) |

---

## §7 Implementation Sequence DAG

> Từ EP-INVENTORY-CATALOG §8. W03 không có hard gate (entry wave Inventory V2 — no upstream dependency). BE/BFF/Web/Mobile start ngay sau schema stable.

```
DAY 1-2 — gf-inventory (BE lead):

  [Day 1]
  gf-inventory (schema) : Flyway V{N+1}__inventory_v2_catalog.sql (additive — KHÔNG ddl-auto)
                          - CREATE TABLE material_group
                            (UUID PK, tenant_id, code, name, description ≤255,
                             parent_id scalar FK self-ref ADR-009, status ACTIVE/INACTIVE, audit)
                          - CREATE TABLE internal_product
                            (UUID PK, tenant_id, code, name, main_unit_code, material_group_id,
                             status, nature default GOODS, pricing_method default PWA,
                             brand VARCHAR(255), origin_code VARCHAR(20), image_url VARCHAR(500),
                             product_spec text, technical_spec text,
                             description VARCHAR(500), notes VARCHAR(500), audit)
                          - CREATE TABLE internal_product_sku_mapping
                          - CREATE TABLE internal_product_uom_conversion (*)
                          - CREATE TABLE internal_product_attachment

  (*) ATTENTION: table name cần Architecture Authority confirm (xem DIV-02 / NC-DIV-02)
      TRƯỚC khi commit migration.

  Entry : W03 kick-off, no upstream blocker
  Exit  : Migration deployed to dev — schema stable

  [Day 1-2]
  gf-inventory (domain)  : Entity + enum + domain service
                          - Enum: MaterialGroupStatus, InternalProductStatus,
                            ProductNature {GOODS,TOOL,SERVICE,OTHER},
                            PricingMethod {PWA,SI,FIFO,MA}
                          - cascade INACTIVE: recursive CTE batch UPDATE 1 @Transactional (BR-CAT-GRP-007)
                          - circular check: BFS/DFS trước UPDATE parentId ERR-INV-003 (BR-CAT-GRP-009)
                          - tree cap defense: COUNT nodes before buildTree → ERR-INV-027 HTTP 413 (V2-2)
                          - @ConversionRatePrecision: scale ≤ 6 → ERR-INV-047 (BR-CAT-PROD-011 v15)
                          - import: Apache POI .xlsx verify-then-commit; 500-row cap ERR-INV-041
                          - export: Apache POI COUNT-before-build; 1000-row cap ERR-INV-045
                          - attachment: 5-file cap app-layer; 30MB; PDF/JPG/PNG

  gf-inventory (API)     : 23 REST endpoints /api/v2/ (no {tenantId} in path)
                          - GRP (V2-1..V2-6): flat search, tree, detail, create, update, delete
                          - PROD (V2-7..V2-22): search, detail enriched, CRUD, SKU mapping ×2,
                            conversion-unit ×3, attachment ×2, verify-import, import, export
                          - SKU (V2-23): legacy product table search

  Entry : schema migration deployed
  Exit  : unit test ≥80% pass; 23 endpoints integration tested on dev

══════════════════════════════════════════════════════
DAY 2-3 — agg-garage-graph (BFF):

  [Day 2-3, depends on gf-inventory API available]
  agg-garage-graph (SDL)  : GraphQL SDL types deploy
                            (MaterialGroup, InternalProduct, *SearchInput, *Response, *Input types)

  agg-garage-graph (ops)  : 24 ops V2-Q1..Q9 + V2-M1..M15
                            - Passthrough resolvers: M3..M13 (11 ops)
                            - 6 DataLoaders: materialGroupById, unitByCode (UNIT),
                              originCountryByCode (COUNTRY), skuMappingsByProductId,
                              conversionUnitsByProductId, attachmentsByProductId
                            - TENANT-USERS enrichment: MaterialGroup Q1/Q2/Q3/M1/M2
                              (enrichObject/ArrayWithByNames — createdByName/updatedByName)
                            - backend-native passthrough: parentName (Q1/Q2/Q3/M1/M2 — gf-inventory fill)
                            - BFF defense: Q2 1000-node ERR-INV-027, M14/M15 500-row ERR-INV-041,
                              Q7 export pass-through ERR-INV-045 DIALOG
                            - Q7 export: reverse-proxy short-lived signed token TTL 60s;
                              BFF middleware re-call V2-22 + stream binary + Content-Disposition
                            - auth header propagation: Authorization, X-Tenant-Id, X-Branch-Id,
                              x-request-id → gf-inventory + gf-erp-mdm + ct-saas-tenant + ct-file-storage
                            - error-code-map.ts: ERR-INV-001..027 + ERR-INV-041/044/045/047
                              + ERR-CMN-004/005/006

  Entry : gf-inventory 23 endpoints available; ct-file-storage presigned URL confirmed (NC-W03-EP-005)
  Exit  : Vitest ≥80% (24 ops happy + 2 error each + 3 cap defense + TENANT-USERS conditional);
          SDL deployed on staging

══════════════════════════════════════════════════════
DAY 3-5 — garage-web + garage-mobile (PARALLEL):

  [Day 3-5, depends on agg-garage-graph SDL + ops deployed]

  garage-web           : 10 routes src/features/inventory-catalog/
                        - Material Group: flat DataTable + parentName column + modal create/edit
                          + detail drawer; cascade INACTIVE confirm (alert-dialog + count children);
                          ACTIVE-only dropdown "Thuộc nhóm" (BR-CAT-GRP-008)
                        - Internal Product: list + filter bar (status/nature/group/keyword) +
                          3 action buttons (Create/Import/Export); form page (code regex +
                          nature enum + mainUnitCode combo + materialGroup ACTIVE-only +
                          brand free-text + originCode combo); detail Tabs (Thông tin chung /
                          SKU / ĐVT quy đổi / Đính kèm — KHÔNG tab Lịch sử)
                        - Import: dedicated route /inventory/internal-products/import;
                          XLSX client-side parse; M14 verify → M15 commit; FE 500-row hint;
                          error highlight INLINE_FORM; mirror customer import pattern
                        - Export: single-call Q7 → downloadUrl → window.location.href;
                          ERR-INV-045 → DIALOG (KHÔNG toast)
                        - Reuse: customs > share > ui (composition build-new tại features/)
                        - error-messages.ts từ ERROR-CODE-REGISTRY v16

  Entry : agg-garage-graph SDL + 24 ops on staging;
          Figma web W03 prefetched (NOTE: NC-UX-11 — PROD-EXPORT Figma MISSING,
          run `/prefetch-figma web 03 FEAT-CAT-PROD-EXPORT` trước DEV)
  Exit  : Vitest ≥60% (form validation + import state machine + error code map);
          E2E GRP flow + PROD flow pass; KG updated

  garage-mobile        : 5 screens lib/ui/inventory_catalog/
                        - MaterialGroupListScreen: flat card ListView.builder + Tab segment
                          ACTIVE/INACTIVE/ALL + FAB create; KHÔNG TreeView (CR-1782381477)
                        - MaterialGroupFormScreen: create/edit unified (ACTIVE-only parentId)
                        - MaterialGroupDetailScreen: 6 fields (name/status badge/parentName/
                          description/createdAt+createdByName/updatedAt+updatedByName)
                        - InternalProductListScreen: VIEW-ONLY (KHÔNG FAB/Import/Export)
                        - InternalProductDetailScreen: Tabs VIEW-ONLY (KHÔNG Sửa/Xóa)
                        - BLoC: MaterialGroupListBloc, MaterialGroupFormBloc,
                          InternalProductListBloc, InternalProductDetailBloc
                        - Wire: Q1/Q3/Q4/Q5/M1/M2/M3 (7 ops mobile scope)

  Entry : agg-garage-graph SDL + 7 mobile ops on staging;
          Figma mobile W03 prefetched (7 nodes confirmed)
  Exit  : bloc_test ≥80% (view-only assertion + cascade INACTIVE confirm);
          E2E GRP flow + PROD view-only flow pass
```

---

## §8 Open Decisions

> Toàn bộ 89 quyết định non-trivial tại `Execution/wave-specs/W03/_decisions.md` (34KB). Bên dưới: top decisions cần resolve TRƯỚC hoặc NGAY KHI DEV start.

| Priority | Decision / NC | Spec ref | Deadline |
|---|---|---|---|
| P0 — BLOCK | Table name canonical (NC-DIV-02 / DIV-02): `internal_product_uom_conversion` vs `internal_product_conversion_unit` | Architecture Authority | Trước Flyway commit |
| P0 — BLOCK | Country seed verification (NC-W03-EP-004): `gf-erp-mdm directory=COUNTRY` đã có data? | Business Authority | Trước W03 BE Day 1 |
| P0 | `INTEG-BFF-CT-FILE-STORAGE.md` tồn tại? (NC-W03-EP-005) | Architecture Authority | Trước BFF Day 2 |
| P1 | FEAT-INV-MOBILE-MENU scope W03 + Figma node (NC-W03-EP-001) | Business Authority | Trước Mobile Day 3 |
| P1 | i18n policy FE-web uniform (NC-UX-01 / DIV-04) | Business Authority/PO | Trước FE-web Day 3 |
| P1 | description maxLength mobile 250 vs 255 (NC-SCHEMA-03 / DIV-05) | Business Authority | Trước Mobile Day 3 |
| P1 | Figma node canonical GRP-DELETE mobile (NC-FIGMA-01 / DIV-07) | Architecture Authority | Trước Mobile GRP-DELETE DEV |
| P1 | GRP-DELETE RBAC: garage-owner only vs accountant (NC-RBAC-02) | Business Authority | Trước BE GRP-DELETE |
| P2 | originCode UI type PROD-CREATE/EDIT (NC-UX-02) | Business Authority | Trước FE-web PROD-CREATE |
| P2 | Attachment upload flow sequence (NC-UX-03) | Architecture Authority | Trước FE-web PROD-CREATE |
| P2 | DataLoaders 5-6 identity (NC-SDL-03); gf-erp-mdm batch paths (NC-ENDPOINT-01) | Architecture Authority | Trước BFF Day 2 |
| P3 | PROD-EXPORT Figma MISSING (NC-FIGMA-02 / NC-UX-11) | Business Authority + UX | Trước FE-web PROD-EXPORT DEV |

---

## §9 References

| Artifact | Path | Notes |
|---|---|---|
| Work package | `Execution/work-packages/PKG-W03-inventory-catalog.md` v21 | Phase plan, DEV tasks, effort, deliverable checklist |
| Epic exec spec | `Execution/wave-specs/W03/Product/epics/EP-INVENTORY-CATALOG.md` | §6 Impact Matrix, §7 Contracts, §8 DAG, §10 Open Items (6 NC) |
| BR exec spec | `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` | §1 rule statements, §3 enforcement, §4 test ideas, §5 BR→FEAT→AC map, §6 error codes |
| gf-inventory API | `Architecture/api/gf-inventory-api.md` | 23 endpoints V2-1..V2-23 canonical (single source of truth for BE) |
| GraphQL SDL | `Architecture/api/agg-garage-graph-graphql.md` | 24 ops V2-Q1..Q9 + V2-M1..M15; DataLoader notes §3b; TENANT-USERS §3b prelude ~40355 |
| KG gf-inventory | `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3 | Baseline entities/APIs; §permissions section (xem NC-RBAC-01) |
| Decision log | `Execution/wave-specs/W03/_decisions.md` | 89 entries, 34KB |
| Error registry | `Product/error-code/ERROR-CODE-REGISTRY.md` v16 | ERR-INV-001..047 + ERR-CMN-004/005 |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping — tất cả 5 bảng W03 scalar FK only |
| ADR-016 | `Architecture/decisions/ADR-016-*.md` | ct-file-storage presigned URL (attachment upload pattern) |
| ADR-017 | `Architecture/decisions/ADR-017-*.md` | SKU master legacy product table; V2-23 searchSkus |
| ADR-018 | `Architecture/decisions/ADR-018-*.md` | Import 500-row cap (V2-20/V2-21 + BFF M14/M15) |
| INTEG-EXT-gf-erp-mdm | `Architecture/integrations/INTEG-EXT-gf-erp-mdm.md` v4 | directory=UNIT + COUNTRY (xem NC-W03-EP-006) |
| UX-FLOW | `Product/ux/UX-FLOW-INVENTORY-CATALOG.md` | Web + mobile UX spec |
| Web component registry | `.claude/references/web-component-registry.yaml` | CANONICAL cho garage-web UI work (customs > share > ui priority) |
| Figma web W03 | `Product/ux/figma-web/wave03-cat-*.md` | 12 spec files prefetched |
| Figma mobile W03 | `Product/ux/figma-mobile/wave03-cat-*.md` | 7 spec files prefetched |

---

## §10 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT wave overview W03 từ 45 spec DRAFT (1 EP + 1 BR + 43 FEAT-tier). §1 Wave summary — EP-INVENTORY-CATALOG Inventory V2 slice 1/4. §2 Artifact inventory 45 specs (5 tier groups). §3 Cross-tier consistency snapshot (9 divergences, 2 HIGH blockers: DIV-02 table name, DIV-07 mobile Figma node). §4 Aggregated NEED CONFIRMATION ~87 NC total (8 categories, 37 explicitly listed). §5 Build-new components catalog FE-web (11 components justified, PROD-EXPORT handler inline only). §6 Boundary effort (BE 21h + BFF 16h + Web 24h + Mobile 13.5h = ~74.5h). §7 Implementation DAG (BE Day 1-2 → BFF Day 2-3 → Web+Mobile parallel Day 3-5). §8 Open decisions (P0-P3 prioritized, 2 P0 blockers). Mobile partial scope (CR-1782373204): 5 PROD write specs intentionally web-only. |
| 2026-06-29 | 2 | Delivery Authority | DRAFT → ACTIVE per reviewer-W03 verdict APPROVED (wave-overview level). Wave aggregate status remains PARTIAL — 43 FEAT-tier files stay DRAFT pending §1 byte-equal re-sync (item #18c). 2 P0 + 3 P1 blockers documented in §8 for downstream resolution. |
