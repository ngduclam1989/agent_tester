---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-06-23"
---

# ADR-017: Inventory V2 Catalog — Additive Aggregates (InternalProduct + MaterialGroup), Legacy Product Preserved

## Status
ACCEPTED — 2026-06-23

## Context

`EP-INVENTORY-CATALOG` introduces two **new** master-data concepts cho garage inventory V2:

1. **Mã sản phẩm nội bộ (InternalProduct)** — mã chuẩn nội bộ của garage để tính tồn kho + mapping SKU + khai báo ĐVT quy đổi (12 features `FEAT-CAT-GRP-*` + `FEAT-CAT-PROD-*`).
2. **Nhóm vật tư hàng hóa (MaterialGroup)** — cây phân cấp đa tầng để phân loại InternalProduct (BR-CAT-GRP-005, không giới hạn số cấp).

Câu hỏi chính: **InternalProduct quan hệ thế nào với legacy `product` table (`gf-inventory.product` — đã production, lưu SKU + product_line + tenant_id, được `gf-purchase`/`gf-sales`/internal-product API consume)?** 

Có 2 hướng:
- (A) **Additive** — InternalProduct là entity mới hoàn toàn, mapping với legacy `product.sku` qua bảng trung gian; legacy `Product` aggregate giữ nguyên.
- (B) **Refactor** — reshape legacy `product` table để chứa cả internal code + SKU; gộp aggregate.

**Constraints từ Product layer**:
- `EP-INVENTORY-CATALOG` §27 (line 27): "Epic này là **mới hoàn toàn**, không có bản V1 gốc … tách riêng khỏi `EP-CATALOG` cũ … `EP-CATALOG` cũ giữ nguyên, không chỉnh sửa".
- `BR-GF-INVENTORY-CATALOG` §CB-CAT-001: catalog mới do gf-inventory own, in-boundary.
- `BR-CAT-PROD-013` + `CB-CAT-003`: "danh mục SKU sẵn có" được leveraged — KHÔNG tạo/sửa/xóa bản ghi SKU gốc.

**Constraints từ team / runtime:**
- gf-inventory cấu hình Flyway + ddl-auto=update (HLD §6, open HLD-INVENTORY-001/002) → schema migration **phải additive** (Critical Rule §3.2 #17 — V{N+1} only, không rewrite V cũ).
- Legacy `product` table được consume bởi `gf-purchase` + `gf-sales` + internal protected endpoints `/api/v2/products/*` (gf-inventory-api.md §29-33, §57-61) → ADR-013 backward-compat: rename/break field = MAJOR version + deprecation period.
- Source verified 2026-06-23: KG `gf-inventory.knowledge-graph.yaml:1493/1512` confirm SKU master = `product.sku` + `uk_product_tenant_sku`; gf-erp-mdm KG grep "sku" → empty (gf-erp-mdm không own SKU master).

**Business rules liên quan:** BR-CAT-GRP-001..013, BR-CAT-PROD-001..019, CB-CAT-001..003.

## Decision

**Adopt Alternative A — additive aggregates.** InternalProduct + MaterialGroup là entities **mới ĐỘC LẬP** trong cùng gf-inventory boundary; legacy `product` aggregate (SKU master) giữ nguyên unchanged. Mapping qua bảng trung gian.

Cụ thể:

- **New tables (gf-inventory schema `dev_gf_inventory`)**:
  - `material_group` — adjacency-list (`parent_id` scalar self-FK, `level` enum), tenant-scoped, `(tenant_id, code) UNIQUE`.
  - `internal_product` — mã nội bộ master, `(tenant_id, code) UNIQUE`, `main_uom_code VARCHAR(20)` (resolve qua gf-erp-mdm catalog — xem ADR cross-ref note), `material_group_id` scalar FK self-domain, `nature` enum (BR-CAT-PROD-019: 4 giá trị `VAT_TU_HANG_HOA | CCDC | DICH_VU | KHAC`, default `VAT_TU_HANG_HOA`), `pricing_method` enum (BR-CAT-PROD-010, default `WAC_PERIOD_END`, hiện khóa).
  - `internal_product_conversion_uom` — `(internal_product_id, uom_code) UNIQUE`, `conversion_rate NUMERIC > 0`.
  - `internal_product_sku_mapping` — `sku_id BIGINT` scalar FK → existing `product.id` (ADR-009 compliant), `UNIQUE (sku_id)` enforce BR-CAT-PROD-013 ("1 SKU thuộc tối đa 1 mã nội bộ" → `ERR-INV-015`).
  - `internal_product_attachment` — file metadata (BR-CAT-PROD-015: ≤5 tệp, ≤10MB, PDF/JPG/PNG).
  - `internal_product_history` — audit ledger thao tác (BR-CAT-CMN-001).

- **Legacy `product` table**: KHÔNG schema change, KHÔNG deprecate trong batch này. Pattern reference qua `product.id` (scalar FK) trong `internal_product_sku_mapping.sku_id`.

- **Migration sequence (additive, V{N+1} từ V20260423100000)**:
  - `V20260624010000__create_material_group.sql`
  - `V20260624020000__create_internal_product.sql`
  - `V20260624030000__create_internal_product_conversion_uom.sql`
  - `V20260624040000__create_internal_product_sku_mapping.sql`
  - `V20260624050000__create_internal_product_attachment.sql`
  - `V20260624060000__create_internal_product_history.sql`

- **Hierarchy strategy** (MaterialGroup adjacency-list):
  - Cascade INACTIVE (BR-CAT-GRP-007): recursive CTE walk children, single transaction.
  - Cycle prevention khi sửa `parent_id` (BR-CAT-GRP-009): recursive CTE check ancestors trước UPDATE — vi phạm → throw `ERR-INV-003`.

- **Subsystem naming**: "catalog-v2" subsystem trong gf-inventory HLD — phân biệt rõ với legacy product subsystem.

- **API surface**: `/api/v2/material-groups/*`, `/api/v2/internal-products/*`, `/api/v2/skus/search?unmapped=true` (search SKU từ legacy `product` table). Public prefix `/api/v2` — KHÔNG modify existing `/api/v1` hay `/api/v2/products/*`.

**Threshold để re-evaluate (Phase 2 trigger):**
- Khi business decide gộp catalog v1 + v2 (đòi hỏi data migration toàn diện) → new ADR supersede.
- Khi legacy `gf-purchase`/`gf-sales` chuyển hẳn sang InternalProduct → trigger deprecation legacy `product` aggregate (kèm CR-MAJOR + ADR-013 deprecation period).

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **A. Additive (chosen)** | Zero break legacy consumers; rõ subsystem boundary; rollback dễ (drop new tables) | Hai aggregate cùng tồn tại → cognitive overhead; mapping table cần maintain | — |
| **B. Refactor legacy `product`** | One aggregate, đơn giản về sau | Break `gf-purchase`/`gf-sales` consumers; cần MAJOR version + data migration phức tạp; rủi ro production cao | Mâu thuẫn ADR-013 backward-compat + EP §27 (V2 "mới hoàn toàn", không touch V1) |
| **C. New boundary `gf-catalog-v2`** | Cleanest separation | Cross-boundary cho mọi receipt/delivery/stock op → tăng latency + complexity; mâu thuẫn CB-CAT-001 (gf-inventory own) | Over-engineering; lookup hot-path |

## Consequences

**Positive:**
- Zero break cho `gf-purchase`/`gf-sales` consumers của legacy `/api/v2/products/*` — backward-compat full.
- Subsystem boundary rõ (catalog-v2 vs legacy product) — dễ migrate gradually về sau khi đủ usage.
- Migration additive — rollback safe (drop new tables, không impact legacy data).
- Schema migration tuân Critical Rule §3.2 #17 (V{N+1} additive, không rewrite migration cũ).

**Negative:**
- **Cognitive overhead 2 aggregate** trong cùng boundary — dev cần đọc HLD §2 (Subsystem split) để hiểu khi nào dùng InternalProduct vs Product. **Mitigation**: HLD `gf-inventory-HLD.md` thêm §2.1 Subsystem map + naming convention rõ ("legacy" prefix trong code path mới reference legacy product).
- **Mapping table extra hop** khi resolve SKU → mã nội bộ. **Mitigation**: index `idx_ipsm_internal_product_id` + `idx_ipsm_sku_id` (UNIQUE) đủ cho lookup p95 < 50ms.
- **Catalog drift risk** — 2 nguồn product info có thể lệch dài hạn. **Mitigation**: documented trong HLD Forbidden Actions; future ADR khi hợp nhất.

**Risks:**
- Risk: Downstream consumers (RECEIPT-V2/DELIVERY-V2 future waves) confuse khi nào dùng `internal_product` vs `product`. **Mitigation**: HLD §2.1 + ADR refs trong từng FEAT relevant + RECEIPT-V2/DELIVERY-V2 API spec sẽ explicit chỉ accept `internal_product_id` (không `product_id`).

**Trade-off accept:** Accept cognitive + maintenance overhead của 2-aggregate model đổi lấy zero-break-legacy + safe rollback + tuân constraint Product layer (EP §27 "không sửa V1") + ADR-013 backward-compat full.

## References

- [Product/epics/EP-INVENTORY-CATALOG.md](../../Product/epics/EP-INVENTORY-CATALOG.md) §27 "V2 mới hoàn toàn"
- [Product/business-rules/BR-GF-INVENTORY-CATALOG.md](../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) §CB-CAT-001..003, §BR-CAT-GRP-*, §BR-CAT-PROD-*
- [Tracking/arch-design-inventory-v2-answers-1.md](../../Tracking/arch-design-inventory-v2-answers-1.md) Q1+Q2 (verified evidence chain)
- [Architecture/hld/gf-inventory-HLD.md](../hld/gf-inventory-HLD.md) §2 Component Diagram, §6 Quality (schema migration constraint)
- Related ADRs: ADR-009 (JPA scalar-FK rule), ADR-013 (deprecation header convention), ADR-018 (bulk-import pattern)
- [Architecture/data/gf-inventory-data-model.md](../data/gf-inventory-data-model.md) §4 Migration

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-23 | 1 | Architecture Authority | Initial ADR — additive aggregate model cho catalog v2; 6 new tables; legacy product preserved; Flyway V{N+1} additive; subsystem naming "catalog-v2"; mapping `sku_id` scalar FK ADR-009 compliant. |
| 2026-06-25 | 1 (addendum note) | Architecture Authority | **R18 addendum (no major version bump — additive field rename within InternalProduct, không phá decision core)**: R18 supersedes R8 D-C — `internal_product.brand_code` (VARCHAR(50) codified vs `directory=BRAND`) → `brand` (VARCHAR(255) free-text, no validation); `internal_product.origin` (VARCHAR(100) free-text) → `origin_code` (VARCHAR(20) codified vs `directory=COUNTRY`). Legacy `product.brand`/`origin` preserve free-text per ADR-017 core (untouched). Aggregate boundary, FK pattern, additive principle unchanged. Detail spec: gf-inventory-api v18 + data-model v16 + INTEG-EXT-gf-inventory v6 R18 entries + INTEG-EXT-gf-erp-mdm v4 (COUNTRY directory added). |
