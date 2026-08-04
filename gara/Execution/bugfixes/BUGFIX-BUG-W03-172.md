# BUGFIX-BUG-W03-172: Danh sách sản phẩm — search theo SKU liên kết trả về rỗng

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W03-172 |
| **Service** | gf-inventory |
| **Priority** | P2 |
| **Layer** | adapter.repository (`JpaInternalProductRepository` — JPQL của method `search()` V2-7 + `exportSearch()` V2-15) |
| **Affected FEAT** | FEAT-CAT-PROD-LIST (V2-7 `POST /api/v2/internal-products/search` — dùng ở màn "Danh sách sản phẩm", GraphQL query `SearchInternalProducts`) |
| **Affected AC / EC** | `FEAT-CAT-PROD-LIST.md` dòng 55-57 (AC search) + dòng 129 (EC-2 *"Tìm kiếm theo SKU liên kết trả về mã nội bộ có SKU khớp"*) |
| **Mô tả** | Gõ 1 mã SKU đã gắn cho sản phẩm (vd `SKU-467-023962-2` gắn cho SP-001 "Đèn pha xe Toyota 2023") vào ô tìm kiếm ở màn Danh sách sản phẩm → response `SearchInternalProducts` trả `totalElements: 0`, `content: []`. Không mất dữ liệu, có workaround (tìm theo mã nội bộ/tên nếu biết trước), nhưng chặn 1 trong 3 tiêu chí search chính thức đã ban hành ở AC (placeholder "Tìm theo mã nội bộ, tên sản phẩm, SKU liên kết"). CONFIRMED trên SIT 2026-07-03 (Manual QC), FE probe Request variables chứng minh `input.keyword` gửi đúng — FE ruled out. |

## Reproduction Steps

1. Auth vào 1 tenant có ≥ 1 sản phẩm (`internal_product`) với ≥ 1 SKU đã gắn qua tab "Mã SKU" trong Detail (mapping row `internal_product_sku_mapping` trỏ tới `product.id` có `product.sku` là mã SKU).
2. Vào **Danh mục → Danh sách sản phẩm** (`/inventory-catalog/internal-products`).
3. Gõ mã SKU đầy đủ (hoặc 1 phần) vào ô tìm kiếm.
4. Expected (theo `FEAT-CAT-PROD-LIST.md` AC + EC-2): danh sách trả sản phẩm chứa SKU đó (LIKE tương đối).
5. Actual (trước fix): `content: []`, `totalElements: 0` — không tìm ra sản phẩm nào.

## Root Cause

Why-chain:

1. Response `SearchInternalProducts` trả rỗng dù SKU tồn tại + đã gắn → BE query không trả về row nào cho keyword đó.
2. FE probe tab Request (verify §3.3): `input.keyword = "SKU-467-023962-2"` gửi đúng 100%, `status: "ACTIVE"` đúng → FE ruled out, keyword đúng đã đến BE.
3. Trace vào `JpaInternalProductRepository.search()` — @Query JPQL:
   ```jpql
   AND (:keyword IS NULL
        OR LOWER(p.code) LIKE :keyword
        OR LOWER(p.name) LIKE :keyword)
   ```
   Chỉ LIKE trên 2 cột `internal_product.code` + `internal_product.name`, **không có nhánh** LIKE trên `product.sku` (SKU code nằm ở bảng `product` — SKU master theo ADR-017 Q2, mapping qua bảng nối `internal_product_sku_mapping` với cột `product_id` scalar FK).
4. Gốc: AC + EC-2 ban hành 3 nguồn search (mã nội bộ / tên sản phẩm / SKU liên kết) nhưng implementation JPQL chỉ hiện thực hoá 2 nguồn đầu; nhánh thứ 3 (SKU liên kết — cần EXISTS-join qua `internal_product_sku_mapping` + `product`) bị bỏ sót ngay từ lúc viết query. Cùng pattern-family với BUG-W03-151 / BUG-W03-130 ("search/filter thiếu 1 điều kiện đã document") nhưng khác entity/entry-point, KHÔNG chung code path — không cluster.

## Fix

- **Files changed** (service repo `services/gf-inventory/`):
  - `src/main/java/com/actechx/gf/adapter/repository/catalog/JpaInternalProductRepository.java` — mở rộng JPQL của cả 2 method:
    - `search()` (V2-7 — paginated search, dùng bởi màn Danh sách sản phẩm)
    - `exportSearch()` (V2-15 — non-paginated export, dùng bởi Export Excel)

    Thêm nhánh EXISTS thứ 3 vào cụm `(:keyword IS NULL OR ...)`:
    ```jpql
    OR EXISTS (SELECT 1 FROM InternalProductSkuMappingEntity m,
                      com.actechx.gf.adapter.persistence.products.ProductEntity sku
               WHERE m.internalProductId = p.id
               AND m.tenantId = p.tenantId
               AND sku.id = m.productId
               AND sku.tenantId = p.tenantId
               AND (sku.isDeleted IS NULL OR sku.isDeleted = false)
               AND LOWER(sku.sku) LIKE :keyword)
    ```
    Điểm design:
    - **EXISTS-subquery + cartesian join trong JPQL** (không dùng `@ManyToOne`/`@OneToMany`) — tuân ADR-009 scalar-FK cross-aggregate. `InternalProductSkuMappingEntity`, `ProductEntity`, `InternalProductEntity` đều chỉ có scalar FK, không có association mapping.
    - **Tenant isolation trong subquery** — cả `m.tenantId = p.tenantId` + `sku.tenantId = p.tenantId` để tránh SKU của tenant khác lọt vào match (defense-in-depth trên top của TenantFilter).
    - **Excluded soft-deleted SKU** — `(sku.isDeleted IS NULL OR sku.isDeleted = false)` — parity với Detail endpoint (`InternalProductService.toMappings()` gọi `productRepository.findAllByTenantIdAndIdInAndIsDeletedFalse(...)`). Nếu 1 SKU đã bị soft-delete, Detail sẽ không hiển thị nó → Search cũng không nên match theo nó.
    - **LOWER(sku.sku) LIKE :keyword** — dùng cùng lowercased LIKE pattern đã có sẵn (`InternalProductService.toKeywordPattern()` build `"%" + s.trim().toLowerCase() + "%"`) — supports partial-match (BR-CAT-PROD LIKE tương đối).
  - `src/test/java/com/actechx/gf/adapter/repository/catalog/JpaInternalProductRepositoryQueryTest.java` — **file mới**. Reflection-based regression test đọc `@Query` annotation text của `search()` + `exportSearch()`, assert nhánh SKU EXISTS còn tồn tại (contains `InternalProductSkuMappingEntity`, `LOWER(sku.sku) LIKE :keyword`, `m.internalProductId = p.id`, `sku.id = m.productId`, tenant scoping, `sku.isDeleted`). Test infra hiện tại 100% Mockito unit test — repository @Query text bị regression sẽ KHÔNG bị bắt ở service test (mock). Reflection test là mức guardrail phù hợp nhất mà không cần bổ sung H2/Testcontainers cho repo lần đầu.
- **Không sửa** `InternalProductService.search()` — service layer chỉ delegate keyword pattern xuống repository; keyword LIKE pattern (`%lowercased%`) đã đúng từ trước.
- **Không sửa** `toKeywordPattern()` — pattern hiện tại hoạt động đúng cho SKU LIKE (đã thử với "sku-467-023962-2" lowercased).
- **Schema change**: Không. Không đụng migration, không đụng entity, không thêm index (cột `product.sku` đã có unique index `uk_product_tenant_sku` + `idx_product_tenant_sku`; cột `internal_product_sku_mapping.internal_product_id` đã có `idx_ipsm_internal_product`).
- **Workflow change**: Không. Không đụng Temporal, không đụng outbox/inbox.
- **API contract**: Additive — request/response signature không đổi. Client cũ gửi keyword chỉ khớp `code`/`name` tiếp tục hoạt động không đổi. Client gửi keyword khớp SKU (trước đây trả rỗng — bug) nay trả sản phẩm đúng. GraphQL BFF `agg-garage-graph` không cần thay đổi.
- **Logging**: Không đụng prefix alert `[INVENTORY_ALERT*]`.
- **Scope discipline**: Fix chỉ ADD nhánh EXISTS vào 2 JPQL @Query text, KHÔNG refactor logic khác, KHÔNG đổi API/event signature, KHÔNG chạm boundary khác.

## Regression Test

`src/test/java/com/actechx/gf/adapter/repository/catalog/JpaInternalProductRepositoryQueryTest.java` — file mới, 2 test:

1. `search_query_includesSkuMappingExistsBranch` — assert JPQL của `search()` chứa cả 3 nhánh (code/name/EXISTS) + join conditions + tenant scoping + soft-delete guard.
2. `exportSearch_query_includesSkuMappingExistsBranch` — assert JPQL của `exportSearch()` mirror nhánh SKU EXISTS + preserve `ORDER BY p.updatedAt DESC`.

Test PASS trước fix = FAIL (JPQL cũ không chứa `InternalProductSkuMappingEntity`, không chứa `LOWER(sku.sku) LIKE :keyword`). Test PASS sau fix = 2/2 PASS.

**Full test suite**: `./gradlew build` PASS (spotlessApply + compile + toàn bộ test suite, 0 regression trong `InternalProductServiceTest` 68 test cũ).

## Blast Radius

- **Impacted paths**: V2-7 search (endpoint gốc của bug — dùng bởi màn Danh sách sản phẩm + GraphQL `SearchInternalProducts`) + V2-15 export search (dùng bởi Export Excel; giữ parity search behavior để QC không thấy khác biệt row set giữa Search UI và Export).
- **API contract**: Additive — client cũ không impacted. Client mới (hoặc client cũ nay gõ SKU) trả row đúng thay vì rỗng.
- **Downstream**: BFF `agg-garage-graph` GraphQL `SearchInternalProducts` không cần thay đổi (passthrough qua REST). FE `useSearchInternalProducts` hook không cần thay đổi.
- **Tenant isolation**: Preserved — cả 2 nhánh scalar-FK join trong subquery scope theo `p.tenantId` (defense-in-depth trên TenantFilter).
- **Performance**: EXISTS subquery scope theo `internal_product_id` + `tenant_id` — cả 2 cột đã có index (`idx_ipsm_internal_product` + `idx_ipsm_tenant`); SKU lookup theo `product.id` (primary key). Không cần index mới. Với keyword không khớp SKU nào, PostgreSQL sẽ short-circuit EXISTS = false ngay (không materialize full join). Với keyword khớp `code`/`name` (2 nhánh đầu), PostgreSQL OR-short-circuit sẽ bỏ qua EXISTS.
- **KHÔNG cascade contract doc T0/T1** — không tạo error code mới, không đổi API signature, không đổi event schema.
- **KG update**: Không cần cập nhật `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` — không thêm entity mới, không thêm invariant mới, không thêm business rule mới; chỉ hiện thực đúng behavior đã document ở AC + EC-2 của FEAT.

## Verification

| Field | Value |
|---|---|
| Regression test PASS trước fix | `JpaInternalProductRepositoryQueryTest.search_query_includesSkuMappingExistsBranch` sẽ FAIL — JPQL cũ chỉ có `LOWER(p.code) LIKE :keyword OR LOWER(p.name) LIKE :keyword`, không chứa `InternalProductSkuMappingEntity` / `LOWER(sku.sku) LIKE :keyword` / `sku.id = m.productId`. Tương tự với `exportSearch_query_includesSkuMappingExistsBranch`. |
| Regression test PASS sau fix | 2/2 test mới PASS (verified `./gradlew test --tests 'com.actechx.gf.adapter.repository.catalog.JpaInternalProductRepositoryQueryTest'` — BUILD SUCCESSFUL). |
| Full test suite | `./gradlew build` PASS (spotlessApply + compile + full test suite; 0 regression). |
| Full build | `./gradlew build` PASS (JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64). |
| Coverage delta | ≥ 0 — chỉ ADD test mới, không xoá test cũ. |

## Related

- **Cùng pattern-family, khác entity/entry-point** (được nhắc trong L2 verify §6): `BUG-W03-151` (garage-web picker Nhóm vật tư/hàng hóa không search server-side đúng) — RESOLVED; `BUG-W03-130` (filter Nhóm hàng thiếu `status: ACTIVE`) — RESOLVED. Cả 2 cùng dạng lỗi-họ "search/filter thiếu 1 điều kiện tài liệu hóa" nhưng khác hook/entity/code path, KHÔNG cluster.
- **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-172.verify.md` (repro + probe + root-cause guidance CONFIRMED BE).
- **AC/EC source**: `Product/features/FEAT-CAT-PROD-LIST.md` dòng 55-57 (AC — 3 nguồn search) + dòng 129 (EC-2 — SKU liên kết).

## Change Log

| Ngày | Người | Ghi chú |
|---|---|---|
| 2026-07-06 | agent-fix-gf-inventory | Fix + doc. Nhánh EXISTS SKU-mapping cho cả `search()` (V2-7) + `exportSearch()` (V2-15); reflection-based regression test cho @Query text vì test infra hiện tại 100% Mockito unit test (không có H2/Testcontainers). |
