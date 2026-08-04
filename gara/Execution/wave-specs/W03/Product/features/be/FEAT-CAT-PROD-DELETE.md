---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-PROD-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DELETE"
source_feat_sha: "dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory"]
modifies: []
change_type: "new-capability"
demo_signature: "Garage-owner xóa mã SP nội bộ chưa có giao dịch — system cascade xóa sku-mapping + conversion-units + attachments; reject ERR-INV-008 khi mã đã phát sinh nhập/xuất/tồn"
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-PROD-DELETE"]
paired_fe_web_feats: ["FEAT-CAT-PROD-DELETE"]
paired_mobile_feats: ["FEAT-CAT-PROD-DELETE"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da..."
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DELETE.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-DELETE (BE): Xóa mã sản phẩm nội bộ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DELETE` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Garage-owner xóa mã SP nội bộ chưa có giao dịch — cascade xóa sku-mapping / conversion-units / attachments; reject ERR-INV-008 nếu đã phát sinh nhập/xuất/tồn |
| Cross-tier pair | BFF: FEAT-CAT-PROD-DELETE \| Web: FEAT-CAT-PROD-DELETE \| Mobile: FEAT-CAT-PROD-DELETE |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + regen để cascade.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DELETE.md`](../../../../../Product/features/FEAT-CAT-PROD-DELETE.md) |
| Source version | v2 |
| Source SHA | `dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246` |
| Generated at | 2026-06-29T14:36:41+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần loại bỏ các mã sản phẩm nội bộ không còn dùng để danh mục vật tư không bị thừa và gây nhầm lẫn trong nghiệp vụ kho. Hệ thống bảo vệ tính toàn vẹn bằng cách từ chối xóa bất kỳ mã nào đã phát sinh giao dịch nhập kho, xuất kho, hoặc có tồn kho — chỉ xóa được khi mã thực sự chưa được dùng trong vận hành. Feature này là thao tác hủy bỏ trong luồng quản lý danh mục catalog V2 của wave W03.

---

## 2. Trách nhiệm backend (`gf-inventory`)

- Expose endpoint `DELETE /api/v2/internal-products/{id}` (V2-12), tenant-scoped, JWT auth; trả 204 No Content khi xóa thành công.
- Enforce BR-CAT-PROD-016 (CORNERSTONE): kiểm tra sự tồn tại của bất kỳ giao dịch nhập/xuất/tồn kho liên quan trước khi thực hiện xóa; từ chối với ERR-INV-008 nếu guard trả positive.
- Cascade xóa explicit (không dùng JPA cascade — ADR-009) toàn bộ bản ghi phụ thuộc khi mã đủ điều kiện xóa: `internal_product_sku_mapping`, `internal_product_uom_conversion`, `internal_product_attachment`.
- Ghi audit entry vào `internal_product_history` trước khi xóa bản ghi chính (ai xóa, thời điểm, tenantId).
- Enforce RBAC: endpoint yêu cầu quyền xóa của người dùng — NEED CONFIRMATION: xác nhận role cụ thể (`garage-owner` hay cả `accountant`) đều có thể xóa, vì KG permissions bị truncate trong bundle.
- Không cần Flyway migration mới — các bảng liên quan đã tạo trong specs CREATE/EDIT (ADR-017 migration sequence V20260624020000–V20260624060000).

---

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Kiểm tra điều kiện xóa

#### AC-4 → Reject xóa khi mã đã phát sinh dữ liệu sử dụng

- **Khi**: BE nhận `DELETE /api/v2/internal-products/{id}`, tenant resolve từ JWT.
- **BE phải**: truy vấn guard — kiểm tra xem `internal_product.id` có xuất hiện trong bất kỳ bảng giao dịch nhập kho (`inventory_receipt_item`), xuất kho (`inventory_delivery_item`), hoặc tồn kho (`stock_balance`) không. Nếu bất kỳ điều kiện nào đúng → throw business exception.
- **Output**: HTTP 422 + error code `ERR-INV-008`.
- **Failure mode**: `ERR-INV-008` (UNPROCESSABLE_ENTITY). Không có side effect — bản ghi không bị thay đổi.
- **Ref**: BR-CAT-PROD-016 (§9), entity `InternalProduct` (§5.1), endpoint `DELETE /api/v2/internal-products/{id}` (§6.1).

#### AC-1 → N/A (UI-only — popup xác nhận phía client)

- Source AC này thuộc về layer FE/Mobile: mở confirmation dialog trước khi gọi API. BE không nhận biết có popup hay không — mỗi request `DELETE` được xử lý độc lập. Xem `fe-web/FEAT-CAT-PROD-DELETE.md §3 AC-1` và `mobile/FEAT-CAT-PROD-DELETE.md §3 AC-1`.

#### AC-3 → N/A (UI-only — hủy thao tác trước khi gọi BE)

- Người dùng bấm "Hủy" trong popup → FE/Mobile không gọi API. BE không có hành vi nào cần triển khai. Xem `fe-web/FEAT-CAT-PROD-DELETE.md §3 AC-3`.

### Cluster B — Thực thi xóa và cascade

#### AC-2 → Xóa mã và cascade dọn bản ghi phụ thuộc

- **Khi**: BE nhận `DELETE /api/v2/internal-products/{id}` và guard AC-4 trả negative (không có giao dịch).
- **BE phải** (theo thứ tự trong 1 transaction):
  1. Ghi audit vào `internal_product_history` — action `DELETED`, `performed_by` từ JWT subject, `tenant_id`.
  2. DELETE tất cả bản ghi trong `internal_product_sku_mapping` WHERE `internal_product_id = id AND tenant_id = tenantId`.
  3. DELETE tất cả bản ghi trong `internal_product_uom_conversion` WHERE `internal_product_id = id AND tenant_id = tenantId`.
  4. DELETE tất cả bản ghi trong `internal_product_attachment` WHERE `internal_product_id = id AND tenant_id = tenantId`.
  5. DELETE bản ghi `internal_product` WHERE `id = id AND tenant_id = tenantId`.
  - Toàn bộ 5 bước trong 1 `@Transactional` — bất kỳ lỗi nào → rollback, không có partial delete.
- **Output**: HTTP 204 No Content; body rỗng.
- **Failure mode**: nếu `id` không tồn tại hoặc sai tenant → 404 trả về trước khi vào cascade logic.
- **Ref**: ADR-009 (không dùng JPA cascade), entity `InternalProduct` (§5.1), endpoint V2-12 (§6.1).

### Cluster C — Phân quyền

#### AC-5 → Enforce RBAC trước khi xử lý xóa

- **Khi**: BE nhận request `DELETE /api/v2/internal-products/{id}`.
- **BE phải**: kiểm tra JWT claim role. Nếu user không có quyền xóa catalog → trả 403 trước khi vào business logic.
- **Output**: HTTP 403 nếu thiếu quyền; tiếp tục vào guard + delete nếu đủ quyền.
- **Failure mode**: 403 Forbidden — không có side effect.
- **Ref**: NEED CONFIRMATION — cần BA xác nhận role cụ thể: `garage-owner` only hay cả `accountant`? Pattern destructive catalog op trong hệ thống → assume `garage-owner` cho đến khi có xác nhận. Xem §4.2.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-PROD-016** (CORNERSTONE): mã sản phẩm nội bộ không được xóa nếu đã có ít nhất 1 giao dịch nhập kho, xuất kho, hoặc tồn kho liên quan — enforce tại `app/service/InternalProductService.java` trước cascade. Vi phạm → `ERR-INV-008` + HTTP 422.
- **BR-CAT-CMN-001** (NORMAL): mọi thao tác thay đổi state phải ghi audit vào `internal_product_history` — enforce tại `app/service` trước khi DELETE.

### 4.2 Tenant + auth

- Mọi query trong flow này (guard check + cascade delete) phải filter `tenant_id = TenantContext.current()` — Critical Rule #4. Cross-tenant leak → data breach.
- RBAC role check: NEED CONFIRMATION về exact role; assume `garage-owner` cho đến khi BA xác nhận (xem AC-5).

### 4.3 Idempotency + concurrency

- DELETE là safe-idempotent về mặt kết quả: nếu `id` không tồn tại → 404 (không 204). Client không nên retry sau 204.
- Không cần `Idempotency-Key` header cho DELETE.
- Guard check và cascade delete phải nằm trong cùng 1 `@Transactional(isolation = READ_COMMITTED)` để tránh race giữa concurrent deletes.

### 4.4 Error code mapping

| Error | HTTP | Nguồn AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-008` | 422 | AC-4 | TOAST — "Không thể xóa: mã sản phẩm đã phát sinh giao dịch kho" |
| `GMS.gf-inventory.INTERNAL_PRODUCT_DELETE.NOT_FOUND` | 404 | AC-2 | TOAST — "Mã sản phẩm không tồn tại" |
| `GMS.gf-inventory.INTERNAL_PRODUCT_DELETE.FORBIDDEN` | 403 | AC-5 | TOAST — "Bạn không có quyền xóa mã sản phẩm" |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> Không có schema change mới cho DELETE. Tất cả bảng liên quan (`internal_product`, `internal_product_sku_mapping`, `internal_product_uom_conversion`, `internal_product_attachment`, `internal_product_history`) đã được tạo bởi migration sequence V20260624020000–V20260624060000 (ADR-017) trong spec FEAT-CAT-PROD-CREATE/FEAT-CAT-GRP-CREATE.

| Entity | Thao tác | Migration | Notes |
|---|---|---|---|
| `internal_product` | DELETE record | Không cần migration mới | Bảng đã tồn tại (ADR-017) |
| `internal_product_sku_mapping` | CASCADE DELETE | Không cần migration mới | Explicit DELETE trong service layer (ADR-009) |
| `internal_product_uom_conversion` | CASCADE DELETE | Không cần migration mới | Explicit DELETE trong service layer |
| `internal_product_attachment` | CASCADE DELETE | Không cần migration mới | File record xóa, ct-file-storage object không tự cleanup (xem note §5.2) |
| `internal_product_history` | INSERT audit entry | Không cần migration mới | Ghi trước khi DELETE parent |

### 5.2 Index / constraint changes

> Không có index mới. Cascade delete dựa vào FK indexes đã tồn tại (`internal_product_id`) trong các bảng mapping.

**Note ct-file-storage**: xóa bản ghi `internal_product_attachment` chỉ remove metadata khỏi DB — object file trên ct-file-storage KHÔNG auto-delete. Cleanup lifecycle TBD (Open Question — nếu cần, BA xác nhận policy trước khi impl).

---

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request | Response | Idempotency | AC ref |
|---|---|---|---|---|---|---|
| DELETE | `/api/v2/internal-products/{id}` | JWT (tenant-scoped) | path param `id` (UUID) | 204 No Content | safe-idempotent (404 nếu không tìm thấy) | AC-2, AC-4, AC-5 |

**Request headers**:
```
Authorization: Bearer <JWT>
X-Tenant-Id: <tenantId>   (resolve bởi TenantFilter từ JWT)
```

**Error responses**:
```json
// 422 — BR-CAT-PROD-016 violated
{ "errorCode": "ERR-INV-008", "message": "Không thể xóa mã sản phẩm đã phát sinh giao dịch kho" }

// 404 — not found / tenant mismatch
{ "errorCode": "GMS.gf-inventory.INTERNAL_PRODUCT_DELETE.NOT_FOUND", "message": "..." }

// 403 — insufficient role
{ "errorCode": "GMS.gf-inventory.INTERNAL_PRODUCT_DELETE.FORBIDDEN", "message": "..." }
```

### 6.2 Modified REST endpoints (additive)

> Không có endpoint nào cần modify — V2-12 là endpoint mới thuần.

### 6.3 Kafka topics (publish/consume)

> Không publish Kafka event cho DELETE operation này (không có downstream consumer cần biết catalog item bị xóa trong W03 scope).

### 6.4 Cross-boundary REST consumers

> Không có cross-boundary call từ gf-inventory. BFF (`agg-garage-graph`) gọi endpoint này (§6.1) — xem BFF tier spec.

> **Hand-off tới BFF**: BFF FEAT `features/bff/FEAT-CAT-PROD-DELETE.md` wrap endpoint V2-12 thành GraphQL mutation `deleteInternalProduct(id: ID!): DeleteResult`.

---

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**`. Cross-boundary touch chỉ qua §6 (REST).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductRepository.java` | ADDITIVE | new finder + delete | ~10 | AC-2, AC-4 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductSkuMappingRepository.java` | ADDITIVE | delete by product | ~5 | AC-2 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductUomConversionRepository.java` | ADDITIVE | delete by product | ~5 | AC-2 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductAttachmentRepository.java` | ADDITIVE | delete by product | ~5 | AC-2 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/InternalProductService.java` | MODIFY | add delete method với BR guard + cascade | ~60 | AC-2, AC-4, AC-5 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/InternalProductController.java` | MODIFY | add DELETE endpoint method | ~20 | AC-2, AC-5 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/InternalProductServiceDeleteTest.java` | NEW | unit tests delete guard + cascade | ~100 | AC-2, AC-4, AC-5 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/InternalProductDeleteContractTest.java` | NEW | contract test HTTP 204/422/403/404 | ~60 | AC-2, AC-4, AC-5 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema migration
    Entry: N/A — không có schema change mới (tables đã tồn tại ADR-017)
    → Skip; đảm bảo migration từ FEAT-CAT-PROD-CREATE đã chạy (prerequisite)
    └─► S2

S2  Repository + Service logic (BR guard + cascade delete)
    Entry: migrations V20260624020000–V20260624060000 deployed
    Exit: unit test ≥ 6 green (guard pass, guard fail, cascade, 404, 403, audit trail)
    └─► S3

S3  REST adapter — DELETE endpoint
    Entry: S2
    Exit: contract test green (204 / 422 / 403 / 404)
    └─► S4

S4  Integration test (tenant isolation + cascade verify)
    Entry: S3
    Exit: integ test green — verify child records deleted, parent deleted, history entry exists
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Không có migration | — | ADR-017 migrations đã run | Xác nhận tables tồn tại | — |
| S2 | Service logic: guard + cascade + audit | `app/service` | S1 confirmed | Unit test ≥ 6 green | S1 |
| S3 | REST adapter: DELETE handler | `adapter/controller` | S2 | Contract test green | S2 |
| S4 | Integration test | `test/integration` | S3 | Integ test green, cascade verified | S3 |

---

## 9. Business Rules to enforce (BE — SSOT cho BR)

> BE là source-of-truth cho BR enforcement. BFF/FE/Mobile chỉ secondary (UX hint).

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-PROD-016` | CORNERSTONE | service (primary) | `app/service/InternalProductService.java::deleteById()` | AC-4 | `TC-BR-inventory-016-*` |
| `BR-CAT-CMN-001` | NORMAL | service | `app/service/InternalProductService.java::deleteById()` (audit log ghi trước delete) | AC-2 | `TC-BR-inventory-CMN-001-*` |

**Enforcement layer priority**:
- `BR-CAT-PROD-016`: guard query phải chạy trước bất kỳ DELETE nào — enforce tại `app/service` (SSOT). Nếu DB constraint phụ (FK) cũng bắt được lỗi này, đó là defense-in-depth không phải primary.
- `BR-CAT-CMN-001`: audit history INSERT phải nằm trong cùng `@Transactional` với DELETE để đảm bảo consistency.

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | N/A (UI-only) | — | FE/Mobile tier — confirmation dialog không call BE |
| AC-2 | Unit + API contract + Integration | test-api | Verify 204, cascade children deleted, history entry written |
| AC-3 | N/A (UI-only) | — | FE/Mobile tier — hủy dialog không call BE |
| AC-4 | Unit (guard) + API contract (negative) | test-api | POST receipt/delivery trước → DELETE expect 422 ERR-INV-008 |
| AC-5 | Isolation (RBAC) | test-isolation | Dual persona: role đủ quyền → 204; role không đủ → 403 |

---

## 12. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DELETE.md` | PENDING | Wrap V2-12 thành GraphQL mutation `deleteInternalProduct(id: ID!): DeleteResult` |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DELETE.md` | PENDING | AC-1 (popup) + AC-3 (cancel) + AC-2 call via BFF op + AC-5 hide button nếu thiếu quyền |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DELETE.md` | PENDING | AC-1 bottom-sheet confirm + AC-3 + AC-2 call + AC-5 hide/disable |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246`.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DELETE.md`](../../../../../Product/features/FEAT-CAT-PROD-DELETE.md) v2
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) — BR-CAT-PROD-016, BR-CAT-CMN-001
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 endpoint V2-12
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **ADR-009**: JPA no-relationship-mapping — cascade via explicit query
- **ADR-017**: Additive aggregates — InternalProduct entity tables migration sequence
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.1 V2-12

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho FEAT-CAT-PROD-DELETE W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 behaviour map per 5 AC-IDs (AC-1/AC-3 = N/A UI-only, AC-2/AC-4/AC-5 = BE impl), §4 ràng buộc + error codes, §5 no schema delta, §6 REST V2-12 DELETE, §7 hexagonal file map, §8 sequence DAG S2-S4, §9 BR SSOT (BR-CAT-PROD-016 + BR-CAT-CMN-001), §10 test scope. 1 NEED CONFIRMATION (role RBAC cho AC-5). |
