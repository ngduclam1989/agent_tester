---
document_id: 'GMS-TC-W03-ISOLATION'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'gf-inventory, agg-garage-graph, garage-web'
wave: 'W03'
owner: 'QA Authority'
last_reviewed: '2026-06-30'
---

# Test Case W03 — Tenant Isolation Layer

> **Split file** — TC ID giữ nguyên prefix gốc (`TC-W03-API-NNN` / `TC-W03-E2E-NNN` / `TC-W03-UI-NNN`) từ file mẹ. KHÔNG renumber.

## 1. General Info

| Field | Value |
| --- | --- |
| Document ID | `GMS-TC-W03-ISOLATION` |
| Wave | W03 |
| Boundary(ies) | `gf-inventory`, `agg-garage-graph`, `garage-web` |
| Feature(s) | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-DETAIL`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DELETE`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT` |
| Owner | `QA Authority` |
| Last Reviewed | 2026-06-30 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` |

---

## 2. Scope

### In Scope

- **Tenant isolation cross-tenant** nghiêm ngặt theo Critical Rule #4 + AC-10/AC-11 các FEAT:
  - Group: cross-tenant GET trả 404, cross-tenant LIST trả `[]`, cross-tenant DELETE/UPDATE bị từ chối
  - Product: cross-tenant GET 404, search trả `[]`, mapping/conversion-unit/attachment cross-tenant bị từ chối
  - Import: cross-tenant không thể import vào tenant khác
  - Export: cross-tenant không xuất file của tenant khác
- **TenantFilter + TenantContext + OriginTenantId integrity** — query tự động inject `WHERE tenant_id = :currentTenantId` (rule #10)
- **Mã duy nhất theo từng tenant (unique code per tenant)** — cùng code khác tenant phải tạo được (không xung đột ràng buộc duy nhất toàn cục)
- **Liên kết trực tiếp (deep-link) cross-tenant** — dán URL chi tiết của tenant khác phải chuyển hướng/hiển thị 404
- **JWT bị chỉnh sửa trái phép** — sửa `tenant_id` trong JWT payload (chữ ký không hợp lệ) → bị từ chối 401
- **Dữ liệu chủ dùng chung** — gf-erp-mdm UNIT/COUNTRY là dữ liệu chủ dùng chung, KHÔNG bị cô lập theo tenant (kiểm tra tái sử dụng)
- **Cross-tenant import file Excel** — tải template tenant A → import vào tenant B → record được tạo dưới tenant B (không làm lộ dữ liệu tenant A)
- **Cô lập TENANT-USERS** — `createdByName` chỉ làm giàu dữ liệu cho user của tenant đó

### Out of Scope

- Cross-platform sync (thuộc TC-W03-E2E + TC-W03-MOBILE-E2E nếu split)
- Hiệu năng ở quy mô tenant lớn (thuộc Performance suite)
- SSO / cross-account session (thuộc agg-sso-graph test)

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| --- | --- | --- |
| 2 tenant | `garage-a` + `garage-b` cùng database multi-tenant | Tenant_id khác nhau, JWT khác nhau |
| User A | `acct-A@garage-a.com` thuộc `garage-a` | Có entry trong ct-saas-tenant |
| User B | `acct-B@garage-b.com` thuộc `garage-b` | Có entry trong ct-saas-tenant |
| Seed `garage-a` | ≥ 3 nhóm + ≥ 5 mã ACTIVE + đa dạng | Cho test "tenant khác không thấy" |
| Seed `garage-b` | ≥ 2 nhóm + ≥ 3 mã ACTIVE | Tránh nhầm rỗng |
| Trùng code cross-tenant | Cả `garage-a` lẫn `garage-b` đều có nhóm code `GRP-SHARED-CODE` (kiểm tra duy nhất theo từng tenant) | Kiểm tra ràng buộc không toàn cục |
| Master data | gf-erp-mdm UNIT/COUNTRY dùng chung cho cả 2 tenant | Cùng dropdown options |
| Tool | Postman / Insomnia + Chrome DevTools | Sửa header X-Tenant-Id / JWT |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| --- | --- | --- |
| Automated | N/A | — |
| Manual | 14 | 14 READY |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-074 | FEAT-CAT-PROD-LIST | gf-inventory | Tenant filter | ISO | Isolation | P1 | Cross-tenant token → REST `GET /api/v2/internal-products/{id}` của tenant khác trả 404 | Mã `PROD-A1` thuộc tenant `garage-a`; token tenant `garage-b` | 1. Đăng nhập token tenant `garage-b`.<br>2. Lấy `<PROD-A1-id>` từ DB (test setup, không qua API).<br>3. Gọi `GET /api/v2/internal-products/<PROD-A1-id>` với header `X-Tenant-Id: garage-b`. | - HTTP 404.<br>- Không làm lộ field/thông tin nào của tenant A.<br>- TenantFilter inject `WHERE tenant_id = garage-b` → query không match.<br>- Log gf-inventory: TenantContext = `garage-b`. | READY | N/A |
| TC-W03-API-ISO-002 | FEAT-CAT-GRP-LIST | agg-garage-graph | Tenant filter | ISO | Isolation | P1 | Cross-tenant: `searchMaterialGroups` từ `garage-b` không trả nhóm của `garage-a` | Tenant `garage-a` có ≥ 3 nhóm; tenant `garage-b` chưa có nhóm | 1. Đăng nhập token `garage-b`.<br>2. Gọi GraphQL `searchMaterialGroups(input: {keyword: "", page: 0, size: 100})`. | - HTTP 200.<br>- `content[]` không chứa nhóm của tenant `garage-a`.<br>- Nếu `garage-b` rỗng → `totalElements = 0`. | READY | N/A |
| TC-W03-API-ISO-003 | FEAT-CAT-GRP-CREATE | gf-inventory | duy nhất theo tenant | ISO | Isolation | P1 | Trùng code cross-tenant — `garage-a` và `garage-b` đều tạo được nhóm code `GRP-SHARED` | Cả 2 tenant chưa có code `GRP-SHARED` | 1. Đăng nhập `garage-a` → tạo `POST /api/v2/material-groups` body `{code: "GRP-SHARED", name: "Tenant A"}`.<br>2. Đăng nhập `garage-b` → tạo `POST /api/v2/material-groups` body `{code: "GRP-SHARED", name: "Tenant B"}`.<br>3. Kiểm tra DB 2 row. | - Cả 2 tạo HTTP 200.<br>- DB 2 row riêng biệt với `tenant_id` khác nhau.<br>- Unique constraint = `(tenant_id, code)` chứ KHÔNG global. | READY | N/A |
| TC-W03-API-ISO-004 | FEAT-CAT-GRP-EDIT | gf-inventory | Cross-tenant UPDATE bị từ chối | ISO | Isolation | P1 | Cross-tenant: token `garage-b` cố sửa nhóm của `garage-a` → 404 (giả vờ không tồn tại) | Nhóm `GRP-A1` thuộc tenant `garage-a` | 1. Đăng nhập `garage-b`.<br>2. Gọi `PUT /api/v2/material-groups/<GRP-A1-id>` body `{name: "Hacked"}`.<br>3. Kiểm tra DB. | - HTTP 404 (KHÔNG 403 — để không làm lộ sự tồn tại).<br>- DB row của `garage-a` KHÔNG đổi name.<br>- Log: TenantContext không khớp. | READY | N/A |
| TC-W03-API-ISO-005 | FEAT-CAT-PROD-DELETE | gf-inventory | Cross-tenant DELETE bị từ chối | ISO | Isolation | P1 | Cross-tenant: token `garage-b` cố xóa mã của `garage-a` → 404 | Mã `PROD-A1` thuộc tenant `garage-a` | 1. Đăng nhập `garage-b`.<br>2. Gọi `DELETE /api/v2/internal-products/<PROD-A1-id>`.<br>3. Kiểm tra DB. | - HTTP 404.<br>- Mã vẫn tồn tại trong DB. | READY | N/A |
| TC-W03-API-ISO-006 | FEAT-CAT-PROD-DETAIL | gf-inventory | Cross-tenant gắn SKU bị từ chối | ISO | Isolation | P1 | Cross-tenant: token `garage-b` gắn SKU vào mã của `garage-a` → 404 | `PROD-A1` thuộc `garage-a`; SKU 999 unmapped | 1. Đăng nhập `garage-b`.<br>2. Gọi `POST /api/v2/internal-products/<PROD-A1-id>/sku-mappings` body `{productId: 999}`.<br>3. Kiểm tra DB. | - HTTP 404 (mã không thuộc tenant `garage-b`).<br>- DB không có row mapping mới. | READY | N/A |
| TC-W03-API-ISO-007 | FEAT-CAT-PROD-DETAIL | gf-inventory | Cross-tenant đính kèm bị từ chối | ISO | Isolation | P2 | Cross-tenant: thêm attachment vào mã của tenant khác → 404 | `PROD-A1` thuộc `garage-a` | 1. Đăng nhập `garage-b`.<br>2. Gọi `POST /api/v2/internal-products/<PROD-A1-id>/attachments` body metadata.<br>3. Kiểm tra DB + ct-file-storage. | - HTTP 404.<br>- Không tạo row attachment.<br>- Object trên R2 KHÔNG được đăng ký cho tenant khác. | READY | N/A |
| TC-W03-API-ISO-008 | FEAT-CAT-PROD-IMPORT | gf-inventory | Cross-tenant import tuân thủ JWT tenant | ISO | Isolation | P1 | Cross-tenant: user `garage-a` import file → record chỉ tạo trong tenant `garage-a` (không làm lộ vào `garage-b` dù header bị giả) | Tenant `garage-a` + `garage-b` đều rỗng catalog; file 5 dòng valid | 1. Đăng nhập `garage-a` → upload file 5 dòng.<br>2. Verify-import + import.<br>3. Kiểm tra DB `garage-a` + `garage-b`. | - 5 record trong tenant `garage-a` với `tenant_id = garage-a`.<br>- Tenant `garage-b` KHÔNG có record nào.<br>- BE lấy tenant từ JWT, KHÔNG từ header client. | READY | N/A |
| TC-W03-API-ISO-009 | FEAT-CAT-PROD-IMPORT | gf-inventory | JWT bị chỉnh sửa trái phép — từ chối | ISO | Isolation | P1 | Sửa JWT payload `tenant_id` từ `garage-a` → `garage-b` (signature invalid) — bị từ chối 401 | JWT valid của `garage-a` | 1. Decode JWT payload, sửa `tenant_id` thành `garage-b`.<br>2. Re-encode (signature không khớp).<br>3. Gọi `POST /api/v2/internal-products/import` body 1 dòng. | - HTTP 401 Unauthorized.<br>- Lý do: JWT signature invalid.<br>- KHÔNG tạo record nào.<br>- Auth filter từ chối trước khi vào service layer. | READY | N/A |
| TC-W03-API-ISO-010 | FEAT-CAT-PROD-EXPORT | gf-inventory | Cross-tenant export | ISO | Isolation | P1 | Cross-tenant: token `garage-b` export → file chỉ chứa mã của `garage-b`, không làm lộ `garage-a` | Tenant `garage-a` có 10 mã; tenant `garage-b` có 3 mã | 1. Đăng nhập `garage-b`.<br>2. Gọi `exportInternalProducts(filter: {})`.<br>3. Mở file. | - File `.xlsx` chỉ chứa 3 dòng của `garage-b`.<br>- KHÔNG có dòng nào của `garage-a`.<br>- Backend lấy tenant từ JWT context. | READY | N/A |
| TC-W03-UI-091 | FEAT-CAT-PROD-DETAIL | garage-web | Liên kết trực tiếp cross-tenant | ISO | Isolation | P1 | Liên kết trực tiếp: Người dùng `garage-b` dán URL chi tiết mã của `garage-a` → 404/chuyển hướng | URL `/inventory/internal-products/<PROD-A1-id>` với token `garage-b` | 1. Đăng nhập `garage-b` tại web.<br>2. Dán URL chi tiết mã `garage-a` vào thanh địa chỉ. | - Trang hiển thị "Không tìm thấy" hoặc trang 404.<br>- KHÔNG hiển thị dữ liệu của tenant A.<br>- Gợi ý chuyển hướng về danh sách. | READY | N/A |
| TC-W03-E2E-020 | FEAT-CAT-* | gf-inventory, agg-garage-graph | TenantFilter integrity | ISO | Isolation | P1 | TenantFilter active trên 100% query — kiểm tra log gf-inventory + agg-garage-graph có TenantContext set cho mọi request | Mọi loại request CRUD | 1. Bật log level DEBUG.<br>2. Thực hiện 10 loại CRUD request khác nhau (list/detail/create/edit/delete cho group + product).<br>3. Grep log cho `TenantContext`. | - Mỗi request log có `TenantContext: <tenant_id>` ngay sau auth filter.<br>- KHÔNG có request nào miss TenantContext.<br>- Query SQL log có `WHERE tenant_id = ?` cho mọi SELECT/UPDATE/DELETE. | READY | N/A |
| TC-W03-API-ISO-013 | FEAT-CAT-* | agg-garage-graph | Dữ liệu chủ dùng chung | ISO | Isolation | P2 | gf-erp-mdm UNIT + COUNTRY là dữ liệu chủ dùng chung — cả 2 tenant đều thấy đầy đủ lựa chọn | UNIT seed: PCS/BOX/KG; COUNTRY seed: VNM/USA/JPN | 1. Đăng nhập `garage-a` → `listUnits` GraphQL.<br>2. Đăng nhập `garage-b` → `listUnits` GraphQL. | - Cả 2 trả cùng 3 UNIT (dữ liệu chủ dùng chung).<br>- Cùng cách cho COUNTRY (search dropdown).<br>- KHÔNG bị cô lập theo tenant. | READY | N/A |
| TC-W03-API-ISO-014 | FEAT-CAT-GRP-DETAIL | agg-garage-graph | Cô lập TENANT-USERS | ISO | Isolation | P2 | TENANT-USERS chỉ làm giàu dữ liệu cho user thuộc tenant đó — user của tenant khác → `createdByName = null` | User `external-X` không thuộc cả `garage-a` lẫn `garage-b` được set làm `createdBy` (data migration giả lập) | 1. Tạo sẵn row group có `createdBy = external-X`.<br>2. Gọi `getMaterialGroup(id)` với token `garage-a`.<br>3. Kiểm tra response. | - `createdByName = null` (TENANT-USERS không khớp).<br>- KHÔNG phát sinh lỗi.<br>- Response tiếp tục — bỏ qua có điều kiện. | READY | N/A |

---

## 5. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-06-30 | Tạo — tách từ TC-W03-API.md (TC-074), TC-W03-E2E.md (TC-020), TC-W03-UI.md (TC-091 placeholder) + thêm 11 TC isolation chuyên sâu (TC-W03-API-ISO-002..014). Bao phủ tenant isolation cross-tenant nghiêm ngặt cho 12 feature, JWT bị chỉnh sửa trái phép, liên kết trực tiếp, dữ liệu chủ dùng chung. | QA Authority |
