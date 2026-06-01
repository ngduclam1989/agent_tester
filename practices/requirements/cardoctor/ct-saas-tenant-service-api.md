---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "tenant-service"
last_reviewed: "2026-05-15"
---

# REST API Contract — tenant-service

> Tài liệu hợp đồng API cho boundary tenant-service. Tất cả endpoints tuân thủ conventions trong `_rules-backend-spring.md`.

---

## 1. Thông tin Chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `tenant-service` |
| Base URL | Context path từ `CONTEXT_PATH`, mặc định rỗng |
| Protocol | HTTPS (REST / JSON) |
| Tiền tố API công khai | `/api/...` |
| Tiền tố API nội bộ | `/protected/...` |
| Authentication | API công khai dùng `Authorization: Bearer ...` khi controller khai báo hoặc runtime security yêu cầu. API nội bộ dùng `x-api-key`. RBAC annotation `@HasAnyActions` phụ thuộc cấu hình runtime `actechx.security.permission.enabled`, mặc định trong `application.yaml` là `false`. |
| Pagination | Các request search kế thừa `BaseSearchRequest`; client gửi pagination/sort theo contract của `com.actechx.common.dto.BaseSearchRequest` (thường gồm `page`, `size`, `sort`, `direction`). |
| Wrapper phản hồi | `ApiResponse<T>`, `PagedApiResponse<T>`, `ServiceStatus<T>`, `Void` hoặc object trực tiếp tùy controller. |
| API Version | Version nằm trong path: `/v1/...`; riêng PT endpoint dùng `/api/pt/...`. |
| Feature flag | `Marketplace:QuotationConsultant` bật/tắt consultant-assignment API; `Purchase:PurchaseV02` bật endpoint cập nhật invoice-info riêng và validation đồng bộ invoice; `Inventory:InventoryStockV01` bật branch/warehouse provisioning và branch-lifecycle consumer. |


---

## 2. Bảng Tổng hợp Endpoints

### 2.1 API công khai

| # | Method | Path | Module | Mô tả | Auth |
|---|---|---|---|---|---|
| 1 | POST | `/api/v1/saas-tenant` | SaaS Tenant | Onboard SaaS tenant | `SaasControlOnboarding: saasControlOnboarding:create` |
| 2 | PUT | `/api/v1/saas-tenant/{tenantId}` | SaaS Tenant | Cập nhật thông tin tenant | `SaasControlTenant: saasControlTenant:updateInformation` |
| 3 | PUT | `/api/v1/saas-tenant/{tenantId}/invoice-info` | Invoice Info | Cập nhật riêng thông tin hóa đơn | `SaasControlTenant: saasControlTenant:updateInformation`; feature flag `Purchase:PurchaseV02` |
| 4 | GET | `/api/v1/saas-tenant/{tenantId}` | SaaS Tenant | Lấy tenant theo id | `SaasControlTenant: saasControlTenant:view` |
| 5 | GET | `/api/v1/saas-tenant/subdomain/{subdomain}` | SaaS Tenant | Lấy tenant theo subdomain | `SaasControlTenant: saasControlTenant:view` |
| 6 | POST | `/api/v1/saas-tenant/search` | SaaS Tenant | Tìm kiếm tenant đầy đủ | `SaasControlOnboarding: saasControlOnboarding:list` |
| 7 | DELETE | `/api/v1/saas-tenant/{tenantId}` | SaaS Tenant | Xóa tenant | Chưa có annotation; code đang `todo implement` và trả `null` |
| 8 | POST | `/api/v1/saas-tenant/{tenantId}/toggle` | SaaS Tenant | Bật/tắt tenant | `SaasControlTenant: saasControlTenant:view, saasControlTenant:updateInformation` |
| 9 | POST | `/api/v1/saas-tenant/tenant-vehicle-profile/search` | Vehicle Profile | Tìm vehicle profile của tenant | `SaasControlTenant: saasControlTenant:view` |
| 10 | POST | `/api/v1/saas-tenant/tenant-user/search` | Tenant User | Tìm user của tenant | `SaasControlTenantUser: saasControlTenantUser:list` |
| 11 | POST | `/api/v1/saas-tenant/tenant-transporter-registry/search` | Transporter Registry | Tìm transporter registry | `SaasControlTenant: saasControlTenant:view` |
| 12 | POST | `/api/v1/saas-tenant/completed` | SaaS Tenant | Đánh dấu hoàn tất thông tin tenant | `SaasControlTenant: saasControlTenant:view, saasControlTenant:updateInformation` |
| 13 | POST | `/api/v1/saas-tenant/consultant-assignment` | Consultant | Gán consultant cho tenant | `SaasControlTenant: saasControlTenant:view, saasControlTenant:updateInformation`; feature flag `Marketplace:QuotationConsultant` |
| 14 | POST | `/api/v1/saas-tenant/create-user` | Tenant User | Tạo SaaS tenant user | `SaasControlTenantUser: saasControlTenantUser:create` |
| 15 | POST | `/api/v1/saas-tenant/{tenantId}/transporter-registries` | Transporter Registry | Tạo một transporter registry cho tenant | `SaasControlTenant: saasControlTenant:updateTransporterRegistry` |
| 16 | POST | `/api/v1/saas-tenant/edit-tenant-transporter-registry` | Transporter Registry | Cập nhật/xóa batch transporter registry | `SaasControlTenant: saasControlTenant:updateTransporterRegistry` |
| 17 | POST | `/api/v1/saas-tenant/edit-tenant-vehicle-profile` | Vehicle Profile | Cập nhật vehicle profile | `SaasControlTenant: saasControlTenant:updateVehicleProfile` |
| 18 | POST | `/api/v1/saas-tenant/{tenantId}/retry-iam` | IAM | Retry tạo IAM tenant | Yêu cầu header `Authorization`; chưa có annotation |
| 19 | POST | `/api/v1/saas-tenant/{tenantId}/retry-conversation-iam` | IAM | Retry tạo IAM conversation | Yêu cầu header `Authorization`; chưa có annotation |
| 20 | POST | `/api/v1/saas-tenant/search-basic-info` | SaaS Tenant | Tìm kiếm tenant basic info | Chưa có annotation |
| 21 | POST | `/api/v1/saas-tenant/import-transport-tenant` | Import | Import transporter registry | `SaasControlTenant: saasControlTenant:importTransporterRegistry` |
| 22 | POST | `/api/v1/saas-tenant/verify-import-transport-tenant` | Import | Verify dữ liệu import transporter registry | `SaasControlTenant: saasControlTenant:importTransporterRegistry` |
| 23 | POST | `/api/v1/saas-tenant/verify-import-vehicle-tenant` | Import | Verify dữ liệu import vehicle profile | `SaasControlTenant: saasControlTenant:importVehicleProfile` |
| 24 | POST | `/api/v1/saas-tenant/import-vehicle-tenant/{tenantCode}` | Import | Import vehicle profile theo tenant code | `SaasControlTenant: saasControlTenant:importVehicleProfile` |
| 25 | GET | `/api/v1/saas-tenant/{tenantId}/search-vehicle-tenant` | Vehicle Profile | Lấy danh sách xe theo tenant | `SaasControlTenant: saasControlTenant:view` |
| 26 | POST | `/api/v1/saas-tenant/{tenantId}/all-vehicle` | Vehicle Profile | Thêm toàn bộ xe cho tenant | `SaasControlTenant: saasControlTenant:importVehicleProfile` |
| 27 | POST | `/api/v1/saas-tenant/tenant-users/search/basic` | Tenant User | Batch search user basic | Chưa có annotation |
| 28 | GET | `/api/v1/saas-tenant/{tenantId}/default-branch` | Branch | Lấy chi nhánh mặc định | `SaasControlTenant: saasControlTenant:view` |
| 29 | GET | `/api/v1/saas-tenant/{tenantId}/default-warehouse` | Warehouse | Lấy kho mặc định | `SaasControlTenant: saasControlTenant:view` |
| 30 | GET | `/api/v1/tenant-users/search` | Tenant User | Tìm tenant user bằng query params | `SaasControlTenantUser: saasControlTenantUser:list` |
| 31 | POST | `/api/pt/saas-tenant/create-user` | PT Tenant User | Tạo user và trả credentials tạm | Chưa có annotation |

### 2.2 API nội bộ / protected

| # | Method | Path | Module | Mô tả | Auth |
|---|---|---|---|---|---|
| 1 | GET | `/protected/v1/saas-tenant/vendors` | SaaS Tenant | Lấy danh sách vendor | `x-api-key` |
| 2 | POST | `/protected/v1/saas-tenant/search-basic-info` | SaaS Tenant | Tìm tenant basic info | Service-to-service |
| 3 | GET | `/protected/v1/saas-tenant/{tenantId}` | SaaS Tenant | Lấy basic info theo tenant id | `x-api-key` |
| 4 | GET | `/protected/v1/saas-tenant/{tenantId}/consultant-assignment` | Consultant | Lấy consultant assignment | `x-api-key` |
| 5 | POST | `/protected/v1/saas-tenant/consultant-assignment` | Consultant | Migrate/gán consultant assignment | Service-to-service; feature flag `Marketplace:QuotationConsultant` |
| 6 | GET | `/protected/v1/saas-tenant/users?tenantIds={ids}&roleCode={roleCode}` | Tenant User | Lấy user IAM theo tenant ids | `x-api-key`; `roleCode` optional |
| 7 | POST | `/protected/v1/saas-tenant/update-tenant-status` | SaaS Tenant | Đồng bộ trạng thái tenant | Service-to-service |
| 8 | POST | `/protected/v1/saas-tenant/{tenantId}/tc-data-privacy-confirmed` | SaaS Tenant | Xác nhận TC và data privacy | Service-to-service |
| 9 | POST | `/protected/v1/saas-tenant/{tenantId}/ecommerce-confirmed` | SaaS Tenant | Xác nhận ecommerce | Service-to-service |
| 10 | GET | `/protected/v1/saas-tenant/qc-vendors` | SaaS Tenant | Lấy danh sách QC vendor | `x-api-key` |
| 11 | GET | `/protected/v1/saas-tenant/tenant-transporter-registry/{id}` | Transporter Registry | Lấy transporter registry theo id | `x-api-key` |
| 12 | POST | `/protected/v1/saas-tenant/tenant-transporter-registry` | Transporter Registry | Lấy transporter registry theo danh sách id | `x-api-key` |
| 13 | PUT | `/protected/v1/saas-tenant/{userId}/status` | Tenant User | Đổi trạng thái user nội bộ | Service-to-service |
| 14 | POST | `/protected/v1/saas-tenant/search` | SaaS Tenant | Tìm tenant đầy đủ, chế độ internal | Service-to-service |
| 15 | GET | `/protected/v1/saas-tenant/all-users?tenantType={tenantType}` | Tenant User | Lấy tất cả user theo tenant type | `x-api-key` |
| 16 | GET | `/protected/v1/saas-tenant/cache/{tenantId}` | Cache | Lấy tenant basic info từ cache | Service-to-service |
| 17 | POST | `/protected/v1/saas-tenant/cache/reload` | Cache | Reload tenant cache | Service-to-service |
| 18 | POST | `/protected/v1/saas-tenant/batch-update-subdomain` | SaaS Tenant | Batch update subdomain | `SaasControlTenant: saasControlTenant:updateInformation` |
| 19 | POST | `/protected/v1/tenant/update-location-and-create-branch` | Migration | Cập nhật city/ward và tạo branch/warehouse mặc định | `@PreAuthorize(hasRole('SUPER_ADMIN'))` |
| 20 | POST | `/protected/v1/migration/tenant-users/{batchSize}?force={force}` | Migration | Migrate tenant user role sang group id | `x-api-key`; `force` optional |


### 2.3 API legacy còn tồn tại trong code

Các endpoint dưới đây nằm trong controller `@Deprecated(forRemoval = true)`. Không dùng cho integration mới; chỉ giữ để nhận diện traffic legacy.

| # | Method | Path | Controller | Mô tả |
|---|---|---|---|---|
| 1 | PUT | `/api/v1/tenants/{tenantId}` | `TenantController` | Cập nhật tenant legacy |
| 2 | GET | `/api/v1/tenants/subdomain/{subdomain}` | `TenantController` | Lấy tenant legacy theo subdomain |
| 3 | DELETE | `/api/v1/tenants/{tenantId}` | `TenantController` | Xóa tenant legacy |
| 4 | POST | `/api/v1/tenants/{tenantId}/retry-iam` | `TenantController` | Retry IAM legacy |
| 5 | GET | `/api/v1/tenants/regions` | `TenantController` | Lấy region master data |
| 6 | GET | `/protected/v1/tenants/vendors` | `InternalTenantController` | Lấy vendor legacy |
| 7 | GET | `/protected/v1/tenants/users?tenantIds={ids}` | `InternalTenantController` | Lấy user IAM legacy |


---

## 3. Chi tiết Endpoints

### 3.1 Quy ước response

Các response dùng wrapper từ common library:

```json
{
  "data": {}
}
```

Paged response dùng `PagedApiResponse<T>` từ `ResponseUtil.successPaged(page)`, thường gồm dữ liệu phân trang và metadata theo common library.

Các endpoint trả `Void` chỉ dùng HTTP status:

| Status | Ý nghĩa |
|---|---|
| 200 OK | Operation hoàn tất |
| 201 Created | Resource/operation tạo hoặc cập nhật thành công theo controller hiện tại |
| 204 No Content | Delete thành công |

Error codes mặc định:

| Code | Condition |
|---|---|
| 400 | Request body/query/path không hợp lệ hoặc validation failed. |
| 401 | Thiếu hoặc sai credential khi security runtime bật. |
| 403 | Không đủ quyền RBAC/PBAC khi security runtime bật. |
| 404 | Không tìm thấy tenant, user, transporter registry hoặc resource liên quan. |
| 500 | Lỗi xử lý không được map bởi service/controller. |

### 3.2 SaaS Tenant công khai

#### POST `/api/v1/saas-tenant`

Onboard SaaS tenant.


**Request Body**:

```json
{
  "name": "Garage A",
  "type": "GARAGE",
  "tenantBusinessModel": "REPAIRING",
  "subdomain": "garage-a",
  "saasTier": "STANDARD",
  "saasSolution": "GMS",
  "companyPhoneNumber": "0900000000",
  "companyEmailAddress": "contact@garage-a.vn",
  "representativeName": "Nguyen Van A",
  "chiefAccountantName": "Nguyen Thi B",
  "operationRegionCode": "VN-SOUTH",
  "operationAreaCodes": ["HCM"],
  "companyHoAddress": "Ho Chi Minh",
  "city": "79",
  "ward": "26734",
  "logoUrl": "https://cdn.example/logo.png",
  "taxCode": "0312345678",
  "invoiceCompanyName": "Garage A Co., Ltd",
  "invoiceCompanyAddress": "Ho Chi Minh",
  "invoiceCompanyEmailAddress": "invoice@garage-a.vn",
  "opsNote": "Onboarding note",
  "ops1": "value",
  "ops2": "value",
  "ops3": "value",
  "ops4": "value",
  "ops5": "value",
  "consultantId": 1001
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `name` | string | Yes | not blank | Tenant/company display name. |
| `type` | enum | Yes | `GARAGE`, `VENDOR` | SaaS tenant type. |
| `tenantBusinessModel` | enum | Yes | `REPAIRING`, `SPA`, `ALL_IN_ONE`, `SPARE_PARTS` | Tenant business model. |
| `subdomain` | string | Yes | not blank, unique, max 20 chars | Tenant subdomain. |
| `saasTier` | enum | Yes | `FREE`, `STANDARD`, `GOLD`, `ENTERPRISE` | SaaS tier. |
| `saasSolution` | enum | Yes | `GMS`, `VMS`, `EXPRESS` | SaaS solution code. |
| `companyPhoneNumber` | string | Yes | not blank, unique | Company phone number. |
| `companyEmailAddress` | string | No | - | Company email address. |
| `representativeName` | string | Yes | not null | Legal/business representative name. |
| `chiefAccountantName` | string | No | - | Chief accountant name. |
| `operationRegionCode` | string | No | MDM operation region code | Accepted in DTO; create flow derives persisted region from `operationAreaCodes`. |
| `operationAreaCodes` | array<string> | Yes | not null, MDM operation area/root region codes | Operation areas to resolve and persist for the tenant. |
| `companyHoAddress` | string | Conditional | required when `Inventory:InventoryStockV01` is enabled | Head-office address. |
| `city` | string | Conditional | location code; required when `Inventory:InventoryStockV01` is enabled | Province/city location code. |
| `ward` | string | Conditional | location code; required when `Inventory:InventoryStockV01` is enabled | Ward location code. |
| `logoUrl` | string | No | URL string | Tenant logo URL. |
| `taxCode` | string | Conditional | max 50 chars; required for `GARAGE` when `Purchase:PurchaseV02` is enabled | Tax code for invoice. |
| `invoiceCompanyName` | string | Conditional | max 255 chars; required for `GARAGE` when `Purchase:PurchaseV02` is enabled | Company name for invoice. |
| `invoiceCompanyAddress` | string | Conditional | max 255 chars; required for `GARAGE` when `Purchase:PurchaseV02` is enabled | Company address for invoice. |
| `invoiceCompanyEmailAddress` | string | No | email format if present, max 255 chars | Invoice email address. |
| `opsNote` | string | No | - | Operations note. |
| `ops1`..`ops5` | string | No | - | Operations extension fields. |
| `consultantId` | number | Conditional | required for `GARAGE` when `Marketplace:QuotationConsultant` is enabled | Assigned consultant id. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### PUT `/api/v1/saas-tenant/{tenantId}`

Cập nhật thông tin SaaS tenant. Controller set `request.id = tenantId`.

Khi feature flag `Purchase:PurchaseV02` bật, các field invoice trong request này không được upsert tại flow update tenant chính; client phải dùng `PUT /api/v1/saas-tenant/{tenantId}/invoice-info`. Khi flag tắt, service vẫn hỗ trợ update invoice info từ request này để tương thích flow cũ.


**Request Body**:

```json
{
  "name": "Garage A Updated",
  "tenantBusinessModel": "REPAIRING",
  "saasTier": "GOLD",
  "saasSolution": "GMS",
  "companyPhoneNumber": "0900000001",
  "companyEmailAddress": "contact@garage-a.vn",
  "representativeName": "Nguyen Van A",
  "chiefAccountantName": "Nguyen Thi B",
  "taxCode": "0312345678",
  "operationRegionCode": "VN-SOUTH",
  "addOperationAreaCodes": ["HCM"],
  "removeOperationAreaCodes": ["HN"],
  "companyHoAddress": "Ho Chi Minh",
  "city": "79",
  "ward": "26734",
  "logoUrl": "https://cdn.example/logo.png",
  "invoiceCompanyName": "Garage A Co., Ltd",
  "invoiceCompanyAddress": "Ho Chi Minh",
  "invoiceCompanyEmailAddress": "invoice@garage-a.vn",
  "type": "GARAGE",
  "subdomain": "garage-a",
  "opsNote": "Updated note",
  "ops1": "value",
  "ops2": "value",
  "ops3": "value",
  "ops4": "value",
  "ops5": "value",
  "consultantId": 1001
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `name` | string | No | not blank if present | Tenant/company display name. |
| `tenantBusinessModel` | enum string | No | `REPAIRING`, `SPA`, `ALL_IN_ONE`, `SPARE_PARTS` | Tenant business model. |
| `saasTier` | enum string | No | `FREE`, `STANDARD`, `GOLD`, `ENTERPRISE` | SaaS tier. |
| `saasSolution` | enum string | No | `GMS`, `VMS`, `EXPRESS` | SaaS solution code. |
| `companyPhoneNumber` | string | No | unique; validated when changed | Company phone number. |
| `companyEmailAddress` | string | No | email format if present | Company email address. |
| `representativeName` | string | No | - | Legal/business representative name. |
| `chiefAccountantName` | string | No | - | Chief accountant name. |
| `taxCode` | string | Conditional | max 50 chars | Tax code for invoice; ignored here when `Purchase:PurchaseV02` is enabled. |
| `operationRegionCode` | string | No | MDM operation region code | DTO field; update flow derives persisted regions from added area codes. |
| `addOperationAreaCodes` | array<string> | No | MDM operation area/root region codes | Operation areas to add. |
| `removeOperationAreaCodes` | array<string> | No | existing operation area codes | Operation areas to remove. |
| `companyHoAddress` | string | No | - | Head-office address. |
| `city` | string | No | location code | Province/city location code. |
| `ward` | string | No | location code; requires city if tenant has no existing city | Ward location code. |
| `logoUrl` | string | No | URL string | Tenant logo URL. |
| `invoiceCompanyName` | string | Conditional | max 255 chars | Invoice company name; ignored here when `Purchase:PurchaseV02` is enabled. |
| `invoiceCompanyAddress` | string | Conditional | max 255 chars | Invoice company address; ignored here when `Purchase:PurchaseV02` is enabled. |
| `invoiceCompanyEmailAddress` | string | No | email format if present, max 255 chars | Invoice email address; ignored here when `Purchase:PurchaseV02` is enabled. |
| `type` | enum | No | `GARAGE`, `VENDOR` | SaaS tenant type. |
| `subdomain` | string | No | max 20 chars, unique when changed | Tenant subdomain. |
| `opsNote` | string | No | - | Operations note. |
| `ops1`..`ops5` | string | No | - | Operations extension fields. |
| `consultantId` | number | Conditional | required for `GARAGE` when `Marketplace:QuotationConsultant` is enabled | Assigned consultant id. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### PUT `/api/v1/saas-tenant/{tenantId}/invoice-info`

Cập nhật riêng thông tin hóa đơn của tenant. Endpoint chỉ được đăng ký khi feature flag `Purchase:PurchaseV02` bật. Service hiện chỉ xử lý khi role hiện tại thuộc nhóm được phép xem/cập nhật tenant (`SYSTEM_ADMIN`, `CD_BD_HEAD`, `CD_BD_LEAD`, `CD_BD_MANAGER`, `CD_BD`); role khác sẽ bị log và return không thay đổi dữ liệu.

Validation theo code mới:

| Field | Rule |
|---|---|
| `invoiceCompanyName` | Tối đa 255 ký tự; bắt buộc với tenant `GARAGE` khi `Purchase:PurchaseV02` bật |
| `taxCode` | Tối đa 50 ký tự; bắt buộc với tenant `GARAGE` khi `Purchase:PurchaseV02` bật |
| `invoiceCompanyAddress` | Tối đa 255 ký tự; bắt buộc với tenant `GARAGE` khi `Purchase:PurchaseV02` bật |
| `invoiceCompanyEmailAddress` | Tối đa 255 ký tự; nếu có thì phải đúng định dạng email |

Tenant ở trạng thái tạm khóa `stage=INACTIVE` và `status=DEACTIVATING` không được cập nhật invoice info.

**Request Body**:

```json
{
  "invoiceCompanyName": "Garage A Co., Ltd",
  "taxCode": "0312345678",
  "invoiceCompanyAddress": "Ho Chi Minh",
  "invoiceCompanyEmailAddress": "invoice@garage-a.vn"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `invoiceCompanyName` | string | Conditional | max 255 chars; required for `GARAGE` when `Purchase:PurchaseV02` is enabled | Company name for invoice. |
| `taxCode` | string | Conditional | max 50 chars; required for `GARAGE` when `Purchase:PurchaseV02` is enabled | Tax code for invoice. |
| `invoiceCompanyAddress` | string | Conditional | max 255 chars; required for `GARAGE` when `Purchase:PurchaseV02` is enabled | Company address for invoice. |
| `invoiceCompanyEmailAddress` | string | No | email format if present, max 255 chars | Invoice email address. |

**Response** `200 OK`:

```json
{
  "data": 123
}
```

Nếu tenant đã `stage=ACTIVE` và `status=ACTIVATED`, service publish message `TENANT_INVOICE_PROFILE_COMMANDS` / `TENANT_INVOICE_INFO_UPSERT_REQUESTED` ra topic invoice-info sau khi transaction commit.


---

#### GET `/api/v1/saas-tenant/{tenantId}`

Lấy chi tiết tenant theo id.


**Response** `200 OK`:

```json
{
  "data": {
    "id": 123,
    "code": "TENANT001",
    "name": "Garage A",
    "type": "GARAGE",
    "subdomain": "garage-a",
    "stage": "ACTIVE",
    "status": "ACTIVATED",
    "companyPhoneNumber": "0900000000",
    "companyEmailAddress": "contact@garage-a.vn",
    "operationAreas": [
      {
        "operationRegionCode": "VN-SOUTH",
        "operationAreaCode": "HCM"
      }
    ],
    "createdAt": "2026-04-25T00:00:00Z",
    "updatedAt": "2026-04-25T00:00:00Z"
  }
}
```


---

#### GET `/api/v1/saas-tenant/subdomain/{subdomain}`

Lấy chi tiết tenant theo subdomain.


**Response** `200 OK`: `ApiResponse<SaasTenantResponse>`.


---

#### POST `/api/v1/saas-tenant/search`

Tìm kiếm tenant đầy đủ.


**Request Body**:

```json
{
  "criteria": "garage",
  "tenantName": "Garage A",
  "tenantIds": [123],
  "types": ["GARAGE"],
  "stages": ["PROVISIONED"],
  "statuses": ["ACTIVATED"],
  "businessModels": ["REPAIRING"],
  "subdomain": "garage-a",
  "tenantType": "GARAGE",
  "notInTenantIds": [999],
  "carBrands": ["TOYOTA"],
  "carModels": ["VIOS"],
  "operationRegionCodes": ["VN-SOUTH"],
  "operationAreaCodes": ["HCM"],
  "consultantIds": [1001],
  "page": 0,
  "size": 20,
  "sort": "id",
  "direction": "DESC"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `criteria` | string | No | - | Free-text search keyword. |
| `tenantName` | string | No | - | Filter by tenant name. |
| `tenantIds` | array<number> | No | - | Include only these tenant ids. |
| `types` | array<string> | No | `GARAGE`, `VENDOR` | Filter by tenant types. |
| `stages` | array<string> | No | `PROCUREMENT`, `PROVISIONED`, `OPEN`, `ACTIVE`, `INACTIVE`, `LOCKED`, `DELETED` | Filter by tenant lifecycle stages. |
| `statuses` | array<string> | No | `PROVISIONING`, `PROVISIONED`, `ACTIVATING`, `ACTIVATED`, `DEACTIVATING`, `DEACTIVATED`, `OFFBOARDING`, `OFFBOARDED` | Filter by tenant provisioning statuses. |
| `businessModels` | array<string> | No | `REPAIRING`, `SPA`, `ALL_IN_ONE`, `SPARE_PARTS` | Filter by business models. |
| `subdomain` | string | No | - | Filter by subdomain. |
| `tenantType` | string | No | `GARAGE`, `VENDOR` | Additional tenant type filter used by some callers. |
| `notInTenantIds` | array<number> | No | - | Exclude these tenant ids. |
| `carBrands` | array<string> | No | vehicle catalog brand codes | Filter by vehicle brand codes. |
| `carModels` | array<string> | No | vehicle catalog model codes | Filter by vehicle model codes. |
| `operationRegionCodes` | array<string> | No | MDM operation region codes | Filter by operation regions. |
| `operationAreaCodes` | array<string> | No | MDM operation area codes | Filter by operation areas. |
| `consultantIds` | array<number> | No | - | Filter by assigned consultant ids. |
| `page`, `size`, `sort`, `direction` | BaseSearchRequest | No | pagination/sort fields | Pagination and sorting. |

**Response** `200 OK`: `PagedApiResponse<SaasTenantResponse>`.


---

#### DELETE `/api/v1/saas-tenant/{tenantId}`

Xóa tenant.


Implementation note: controller hiện tại có `todo implement` và trả `null`; không nên sử dụng cho tới khi được implement rõ ràng.


---

#### POST `/api/v1/saas-tenant/{tenantId}/toggle`

Bật/tắt tenant.


**Request Body**:

```json
{
  "active": false,
  "reason": "Suspended by ops"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `active` | boolean | Yes | `true`, `false` | Target active state. |
| `reason` | string | Conditional | required when deactivating; max 255 chars | Reason for deactivation/reactivation. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### POST `/api/v1/saas-tenant/completed`

Đánh dấu danh sách tenant đã hoàn tất thông tin.


**Request Body**:

```json
[123, 456]
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `body` | array<number> | Yes | tenant ids | Tenant ids to mark as completed. |

**Response** `201 Created`:

```json
{
  "data": [123, 456]
}
```


---

#### POST `/api/v1/saas-tenant/search-basic-info`

Tìm kiếm tenant basic info bằng `SaasTenantSearchRequest`.


**Request Body**: `SaasTenantSearchRequest`.

**Request Fields**: giống `POST /api/v1/saas-tenant/search`.

**Response** `200 OK`: `PagedApiResponse<SaasTenantBasicInfoResponse>`.

### 3.3 Tenant User công khai

#### POST `/api/v1/saas-tenant/create-user`

Tạo user thuộc tenant.


**Request Body**:

```json
{
  "tenantId": 123,
  "fullName": "Nguyen Van A",
  "emailAddress": "user@example.com",
  "phoneNumber": "0900000000",
  "avatarUrl": "https://cdn.example/avatar.png",
  "role": "OWNER",
  "groupId": "group-id"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | Yes | not null | Tenant id owning the user. |
| `fullName` | string | Yes | not blank | User full name. |
| `emailAddress` | string | No | email string if present | User email address. |
| `phoneNumber` | string | Yes | not blank | User phone number. |
| `avatarUrl` | string | No | URL string | User avatar URL. |
| `role` | string | No | `OWNER` maps to tenant owner role; tenant-specific role codes accepted | Requested tenant role. |
| `groupId` | string | No | IAM/PMS group id | External group id. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### POST `/api/pt/saas-tenant/create-user`

Tạo SaaS tenant user qua PT API và trả username/password tạm.


**Request Body**: `SaasTenantUserRequest`.

**Request Fields**: giống `POST /api/v1/saas-tenant/create-user`.

**Response** `201 Created`:

```json
{
  "data": {
    "username": "user@example.com",
    "temporaryPassword": "temporary-password"
  }
}
```


---

#### POST `/api/v1/saas-tenant/tenant-user/search`

Tìm user theo tenant.


**Request Body**:

```json
{
  "tenantId": 123,
  "criteria": "nguyen",
  "page": 0,
  "size": 20,
  "sort": "id",
  "direction": "DESC"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | Yes | not null | Tenant id to search users in. |
| `criteria` | string | No | - | Free-text user search keyword. |
| `page`, `size`, `sort`, `direction` | BaseSearchRequest | No | pagination/sort fields | Pagination and sorting. |

**Response** `200 OK`: `PagedApiResponse<SaasTenantUserResponse>`.


---

#### POST `/api/v1/saas-tenant/tenant-users/search/basic`

Batch search tenant user theo phone/email/iamUserId.


**Request Body**:

```json
{
  "tenantId": 123,
  "phones": ["0900000000"],
  "emails": ["user@example.com"],
  "iamUserIds": ["iam-user-id"],
  "page": 0,
  "size": 20
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | Yes | not null | Tenant id to search users in. |
| `phones` | array<string> | No | phone numbers | Filter by phone numbers. |
| `emails` | array<string> | No | email addresses | Filter by email addresses. |
| `iamUserIds` | array<string> | No | IAM user ids | Filter by IAM user ids. |
| `page`, `size`, `sort`, `direction` | BaseSearchRequest | No | pagination/sort fields | Pagination and sorting. |

**Response** `200 OK`:

```json
{
  "data": [
    {
      "userName": "user@example.com",
      "fullName": "Nguyen Van A",
      "iamUserId": "iam-user-id"
    }
  ]
}
```


---

#### GET `/api/v1/tenant-users/search`

Tìm tenant user bằng query params.


Query params:

| Name | Type | Required | Ghi chú |
|---|---|---|---|
| `tenantId` | Long | No | Lọc theo tenant |
| `groupIds` | List<String> | No | Lọc theo group ids |
| `roleCodes` | List<String> | No | Lọc theo role codes |
| `tenantTypes` | List<TenantType> | No | Lọc theo tenant type |
| `keyword` | String | No | Tìm theo keyword |
| `page`, `size`, `sort`, `direction` | BaseSearchRequest | No | Pagination/sort |

**Response** `200 OK`: `PagedApiResponse<TenantUserSearchResponse>`.

### 3.4 Vehicle Profile, Transporter Registry và Import

#### POST `/api/v1/saas-tenant/tenant-vehicle-profile/search`

Tìm vehicle profile của tenant.


**Request Body**:

```json
{
  "tenantId": 123,
  "brandCode": "TOYOTA",
  "modelCode": "VIOS",
  "trimsLevelCode": "G",
  "yearOfManufactureCode": "2024",
  "typeCode": "SEDAN",
  "page": 0,
  "size": 20
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | Yes | not null | Tenant id. |
| `brandCode` | string | No | vehicle catalog brand code | Filter by vehicle brand. |
| `modelCode` | string | No | vehicle catalog model code | Filter by vehicle model. |
| `trimsLevelCode` | string | No | vehicle catalog trims level code | Filter by trims level. |
| `yearOfManufactureCode` | string | No | vehicle catalog year code | Filter by year of manufacture. |
| `typeCode` | string | No | vehicle catalog type code | Filter by vehicle type. |
| `page`, `size`, `sort`, `direction` | BaseSearchRequest | No | pagination/sort fields | Pagination and sorting. |

**Response** `200 OK`: `PagedApiResponse<SaasTenantVehicleProfileResponse>`.


---

#### POST `/api/v1/saas-tenant/edit-tenant-vehicle-profile`

Cập nhật vehicle profile của tenant.


**Request Body**:

```json
{
  "tenantId": 123,
  "removeTenantVehicleProfileIds": [1, 2],
  "removeTenantBrandCodes": ["FORD"],
  "addTenantVehicleProfile": [
    {
      "brandCode": "TOYOTA",
      "modelCodes": ["VIOS", "FORTUNER"]
    }
  ]
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | No | tenant id | Tenant id to edit. |
| `removeTenantVehicleProfileIds` | array<number> | No | existing vehicle profile ids | Vehicle profile records to remove. |
| `removeTenantBrandCodes` | array<string> | No | vehicle catalog brand codes | Brand groups to remove. |
| `addTenantVehicleProfile` | array<object> | No | `SaasTenantVehicleProfileDataRequest` | Vehicle profile groups to add. |
| `addTenantVehicleProfile[].brandCode` | string | Yes | not blank, vehicle catalog brand code | Brand code to add. |
| `addTenantVehicleProfile[].modelCodes` | array<string> | No | vehicle catalog model codes | Model codes under the brand. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### GET `/api/v1/saas-tenant/{tenantId}/search-vehicle-tenant`

Lấy danh sách xe theo tenant.


**Response** `200 OK`:

```json
{
  "data": [
    {
      "carBrand": "TOYOTA",
      "listCarModel": [
        {
          "id": 1,
          "ids": [1, 2],
          "carModel": "VIOS"
        }
      ]
    }
  ]
}
```


---

#### POST `/api/v1/saas-tenant/{tenantId}/all-vehicle`

Thêm toàn bộ vehicle profile cho tenant.


**Response** `200 OK`: empty body.


---

#### POST `/api/v1/saas-tenant/tenant-transporter-registry/search`

Tìm transporter registry của tenant.


**Request Body**:

```json
{
  "tenantId": 123,
  "criteria": "route",
  "statuses": ["ACTIVE"],
  "page": 0,
  "size": 20
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | Yes | not null | Tenant id. |
| `criteria` | string | No | - | Free-text transporter/route search keyword. |
| `statuses` | array<enum> | No | `ACTIVE`, `INACTIVE` | Filter by transporter registry statuses. |
| `page`, `size`, `sort`, `direction` | BaseSearchRequest | No | pagination/sort fields | Pagination and sorting. |

**Response** `200 OK`: `PagedApiResponse<SaasTenantTransporterRegistryResponse>`.


---

#### POST `/api/v1/saas-tenant/{tenantId}/transporter-registries`

Tạo một transporter registry cho tenant. Service kiểm tra tenant tồn tại, chống trùng `routeContactPhoneNumber` trong cùng tenant, lưu với `status=ACTIVE` mặc định và publish message `TENANT-TRANSPORTER-REGISTRY` / `TENANT_TRANSPORTER_REGISTRY_UPSERT_REQUESTED` sau khi transaction commit.

**Request Body**:

```json
{
  "transporterName": "Transporter A",
  "routeName": "HCM - DN",
  "routeContactPhoneNumber": "0900000000",
  "routeStartedAt": "08:00",
  "note": "Daily route",
  "shippingAddress": "Ho Chi Minh"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `transporterName` | string | Yes | not blank | Transporter name. |
| `routeName` | string | Yes | not blank | Route name. |
| `routeContactPhoneNumber` | string | Yes | not blank; unique within tenant | Contact phone number for the route. |
| `routeStartedAt` | string | Yes | not blank | Route start time/text. |
| `note` | string | No | - | Route note. |
| `shippingAddress` | string | Yes | not blank | Shipping address. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### POST `/api/v1/saas-tenant/edit-tenant-transporter-registry`

Cập nhật/xóa batch transporter registry.


**Request Body**:

```json
{
  "tenantId": 123,
  "removeTransporterRegistryIds": [1],
  "addTransporterRegistryData": [
    {
      "id": 2,
      "tenantId": 123,
      "tenantType": "GARAGE",
      "transporterName": "Transporter A",
      "routeName": "HCM - DN",
      "routeContactPhoneNumber": "0900000000",
      "routeStartedAt": "08:00",
      "note": "Daily route",
      "shippingAddress": "Ho Chi Minh"
    }
  ]
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | No | tenant id | Tenant id to edit. |
| `removeTransporterRegistryIds` | array<number> | No | existing transporter registry ids | Registry records to remove. |
| `addTransporterRegistryData` | array<object> | No | `SaasTenantTransporterRegistryDataRequest` | Registry records to add/update. |
| `addTransporterRegistryData[].id` | number | No | existing registry id | Registry id when updating an existing record. |
| `addTransporterRegistryData[].tenantId` | number | No | tenant id | Tenant id snapshot. |
| `addTransporterRegistryData[].tenantType` | string | No | `GARAGE`, `VENDOR` | Tenant type snapshot. |
| `addTransporterRegistryData[].transporterName` | string | Yes | not blank | Transporter name. |
| `addTransporterRegistryData[].routeName` | string | Yes | not blank | Route name. |
| `addTransporterRegistryData[].routeContactPhoneNumber` | string | Yes | not blank | Contact phone number for the route. |
| `addTransporterRegistryData[].routeStartedAt` | string | Yes | not blank | Route start time/text. |
| `addTransporterRegistryData[].note` | string | No | - | Route note. |
| `addTransporterRegistryData[].shippingAddress` | string | No | - | Shipping address. |

**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### POST `/api/v1/saas-tenant/import-transport-tenant`

Import transporter registry.


**Request Body**:

```json
[
  {
    "tenantCode": "TENANT001",
    "transportRegistryTenants": [
      {
        "transporterName": "Transporter A",
        "routeContactPhoneNumber": "0900000000",
        "invoiceCompanyEmailAddress": "invoice@example.com",
        "routeStartedAt": "08:00",
        "routeName": "HCM - DN",
        "isValid": true,
        "note": "OK"
      }
    ]
  }
]
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `body` | array<object> | Yes | `List<SaasImportTransportTenantRequest>` | Transport registry import rows grouped by tenant code. |
| `tenantCode` | string | Yes | not blank | Tenant code to import data for. |
| `transportRegistryTenants` | array<object> | No | transport registry rows | Transport registry rows for the tenant. |
| `transportRegistryTenants[].transporterName` | string | No | - | Transporter name from import file. |
| `transportRegistryTenants[].routeContactPhoneNumber` | string | No | - | Route contact phone from import file. |
| `transportRegistryTenants[].invoiceCompanyEmailAddress` | string | No | email string if present | Invoice email from import file. |
| `transportRegistryTenants[].routeStartedAt` | string | No | - | Route start time/text from import file. |
| `transportRegistryTenants[].routeName` | string | No | - | Route name from import file. |
| `transportRegistryTenants[].isValid` | boolean | No | `true`, `false` | Verification result flag. |
| `transportRegistryTenants[].note` | string | No | - | Import note/error message. |

**Response** `200 OK`: empty body.


---

#### POST `/api/v1/saas-tenant/verify-import-transport-tenant`

Verify dữ liệu transporter registry trước khi import.


**Request Body**: `List<SaasImportTransportTenantRequest>`.

**Request Fields**: giống `POST /api/v1/saas-tenant/import-transport-tenant`.

**Response** `200 OK`: `ApiResponse<List<SaasVerifyImportTransportTenantResponse>>`.


---

#### POST `/api/v1/saas-tenant/verify-import-vehicle-tenant`

Verify dữ liệu vehicle profile trước khi import.


**Request Body**:

```json
[
  {
    "brandCode": "TOYOTA",
    "modelCode": "VIOS",
    "yearOfManufactureCode": "2024",
    "trimsLevelCode": "G",
    "isValid": true,
    "note": "OK"
  }
]
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `body` | array<object> | Yes | `List<SaasImportVehicleTenantRequest>` | Vehicle profile import/verify rows. |
| `brandCode` | string | No | vehicle catalog brand code | Vehicle brand code. |
| `modelCode` | string | No | vehicle catalog model code | Vehicle model code. |
| `yearOfManufactureCode` | string | No | vehicle catalog year code | Year of manufacture code. |
| `trimsLevelCode` | string | No | vehicle catalog trims level code | Trims level code. |
| `isValid` | boolean | No | `true`, `false` | Verification result flag. |
| `note` | string | No | - | Import note/error message. |

**Response** `200 OK`: `ApiResponse<List<SaasVerifyImportVehicleTenantResponse>>`.


---

#### POST `/api/v1/saas-tenant/import-vehicle-tenant/{tenantCode}`

Import vehicle profile cho tenant code.


**Request Body**: `List<SaasImportVehicleTenantRequest>`.

**Request Fields**: giống `POST /api/v1/saas-tenant/verify-import-vehicle-tenant`.

**Response** `200 OK`: empty body.

### 3.5 Consultant Assignment

#### POST `/api/v1/saas-tenant/consultant-assignment`

Gán một consultant cho danh sách tenant. Public endpoint nhận trực tiếp object `Assignment` và service wrap thành `AssignConsultantRequest`.


**Request Body**:

```json
{
  "tenantIds": [123, 456],
  "consultantId": 1001
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantIds` | array<number> | Yes | not empty | Tenant ids to assign. |
| `consultantId` | number | Yes | not null | Consultant employee id. |

**Response** `201 Created`:

```json
{
  "data": [123, 456]
}
```

### 3.6 Branch, Warehouse và IAM

#### GET `/api/v1/saas-tenant/{tenantId}/default-branch`

Lấy thông tin chi nhánh mặc định và kho mặc định liên quan.


**Response** `200 OK`: `ApiResponse<DefaultBranchInfoResponse>`.


---

#### GET `/api/v1/saas-tenant/{tenantId}/default-warehouse`

Lấy thông tin kho mặc định.


**Response** `200 OK`: `ApiResponse<DefaultWarehouseInfoResponse>`.


---

#### POST `/api/v1/saas-tenant/{tenantId}/retry-iam`

Retry IAM creation cho tenant.


**Response** `200 OK`: empty body.


---

#### POST `/api/v1/saas-tenant/{tenantId}/retry-conversation-iam`

Retry conversation IAM creation cho tenant.


**Response** `200 OK`: empty body.

### 3.7 Protected SaaS Tenant

#### GET `/protected/v1/saas-tenant/vendors`

Lấy danh sách vendor.


**Response** `200 OK`: `ServiceStatus<List<SaasVendorResponse>>`.


---

#### POST `/protected/v1/saas-tenant/search-basic-info`

Tìm kiếm tenant basic info.


**Request Body**: `SaasTenantSearchRequest`.

**Request Fields**: giống `POST /api/v1/saas-tenant/search`.

**Response** `200 OK`: `PagedApiResponse<SaasTenantBasicInfoResponse>`.


---

#### GET `/protected/v1/saas-tenant/{tenantId}`

Lấy tenant basic info theo id.


**Response** `200 OK`: `ApiResponse<SaasTenantBasicResponse>`.


---

#### GET `/protected/v1/saas-tenant/{tenantId}/consultant-assignment`

Lấy consultant assignment của tenant.


**Response** `200 OK`: `ApiResponse<ConsultantAssignmentResponse>`.


---

#### POST `/protected/v1/saas-tenant/consultant-assignment`

Migrate/gán consultant assignment theo batch.


**Request Body**:

```json
{
  "assignments": [
    {
      "tenantIds": [123, 456],
      "consultantId": 1001
    }
  ]
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `assignments` | array<object> | Yes | not empty | Consultant assignment batches. |
| `assignments[].tenantIds` | array<number> | Yes | not empty | Tenant ids to assign. |
| `assignments[].consultantId` | number | Yes | not null | Consultant employee id. |

**Response** `200 OK`: empty body.


---

#### GET `/protected/v1/saas-tenant/users`

Lấy user IAM theo tenant ids.


Query params:

| Name | Type | Required | Ghi chú |
|---|---|---|---|
| `tenantIds` | List<Long> | Yes | Danh sách tenant id |
| `roleCode` | String | No | Lọc theo role code |

**Response** `200 OK`: `ApiResponse<List<SaasTenantIAMResponse>>`.


---

#### POST `/protected/v1/saas-tenant/update-tenant-status`

Trigger cập nhật trạng thái tenant.


**Response** `200 OK`: empty body.


---

#### POST `/protected/v1/saas-tenant/{tenantId}/tc-data-privacy-confirmed`

Xác nhận TC/data privacy cho tenant.


**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### POST `/protected/v1/saas-tenant/{tenantId}/ecommerce-confirmed`

Xác nhận ecommerce cho tenant.


**Response** `201 Created`:

```json
{
  "data": 123
}
```


---

#### GET `/protected/v1/saas-tenant/qc-vendors`

Lấy danh sách QC vendor.


**Response** `200 OK`: `ServiceStatus<List<SaasVendorResponse>>`.


---

#### GET `/protected/v1/saas-tenant/tenant-transporter-registry/{id}`

Lấy transporter registry theo id.


**Response** `200 OK`: `ApiResponse<SaasTenantTransporterRegistryResponse>`.


---

#### POST `/protected/v1/saas-tenant/tenant-transporter-registry`

Lấy transporter registry theo danh sách id.


**Request Body**:

```json
[1, 2, 3]
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `body` | array<number> | Yes | transporter registry ids | Registry ids to fetch. |

**Response** `200 OK`: `ApiResponse<List<SaasTenantTransporterRegistryResponse>>`.


---

#### PUT `/protected/v1/saas-tenant/{userId}/status`

Đổi trạng thái tenant user nội bộ.


**Request Body**:

```json
{
  "newStatus": "ACTIVE",
  "clientType": "GARAGE"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `newStatus` | enum | Yes | `ACTIVE`, `INACTIVE` | New SaaS user status. |
| `clientType` | enum | Yes | `CARDOCTOR`, `GARAGE`, `VENDOR`, `DRIVER` | IAM client type/user pool. |

**Response** `200 OK`: empty body.


---

#### POST `/protected/v1/saas-tenant/search`

Tìm kiếm tenant ở chế độ internal.


**Request Body**: `SaasTenantSearchRequest`.

**Request Fields**: giống `POST /api/v1/saas-tenant/search`.

**Response** `200 OK`: `PagedApiResponse<SaasTenantResponse>`.


---

#### GET `/protected/v1/saas-tenant/all-users`

Lấy tất cả users theo tenant type.


Query params:

| Name | Type | Required | Ghi chú |
|---|---|---|---|
| `tenantType` | String | Yes | `GARAGE`, `VENDOR` |

**Response** `200 OK`: `ServiceStatus<List<SaasTenantUserResponse>>`.


---

#### GET `/protected/v1/saas-tenant/cache/{tenantId}`

Lấy tenant basic info từ cache.


**Response** `200 OK`: `ApiResponse<SaasTenantBasicInfoResponse>`.


---

#### POST `/protected/v1/saas-tenant/cache/reload`

Reload tenant cache.


**Response** `200 OK`:

```json
{
  "data": "Tenant cache reloaded successfully"
}
```


---

#### POST `/protected/v1/saas-tenant/batch-update-subdomain`

Batch update subdomain.


**Request Body**:

```json
{
  "items": [
    {
      "tenantId": 123,
      "subdomain": "garage-a"
    }
  ]
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `items` | array<object> | Yes | not empty | Subdomain update items. |
| `items[].tenantId` | number | Yes | not null | Tenant id to update. |
| `items[].subdomain` | string | Yes | not blank, max 20 chars, unique | New subdomain. |

**Response** `200 OK`: `ApiResponse<BatchUpdateSubdomainResponse>`.

### 3.8 Protected Migration

#### POST `/protected/v1/tenant/update-location-and-create-branch`

Cập nhật city/ward cho tenant và tạo branch/warehouse mặc định nếu chưa tồn tại. Operation được mô tả là idempotent trong controller.


**Request Body**:

```json
{
  "tenantId": 123,
  "cityCode": "79",
  "wardCode": "26734"
}
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `tenantId` | number | Yes | not null | Tenant id to migrate/update. |
| `cityCode` | string | Yes | not null, location code | Province/city code. |
| `wardCode` | string | Yes | not null, location code | Ward code. |

**Response** `200 OK`:

```json
{
  "message": "Tenant location updated and branch creation initiated successfully",
  "status": "SUCCESS",
  "tenantId": 123
}
```


---

#### POST `/protected/v1/migration/tenant-users/{batchSize}`

Migrate tenant user từ `roleCode` sang `groupId` và gọi IAM để update `custom:groupRoles`.


Query params:

| Name | Type | Required | Ghi chú |
|---|---|---|---|
| `force` | boolean | No | Nếu `true`, lấy cả user đã có `groupId` trong batch |

**Request Body**:

```json
[1001, 1002]
```

**Request Fields**:

| Field | Type | Required | Allowed values / constraints | Description |
|---|---|---:|---|---|
| `body` | array<number> | No | tenant user ids | User ids to migrate; empty body means service fetches users by `batchSize`. |

Nếu body rỗng, API lấy batch user từ database theo `batchSize`.

**Response** `200 OK`:

```json
{
  "total": 20,
  "batchSize": 10,
  "failedCount": 1,
  "succeedCount": 9,
  "failedIds": [1002],
  "succeed": [
    {
      "userId": 1001,
      "userName": "Nguyen Van A",
      "iamUserId": "iam-user-id",
      "currentRole": "OWNER",
      "newGroupId": "group-id",
      "updateDbSuccess": true,
      "updateDbError": null,
      "updateIamSuccess": true,
      "updateIamError": null
    }
  ],
  "failed": []
}
```

---

## 4. Shared DTOs

### ApiResponse (single resource)

```json
{
  "data": { /* resource object */ },
  "timestamp": "2026-04-19T10:00:00Z"
}
```

### PageResponse (collection, paginated)

```json
{
  "data": [ /* resource objects */ ],
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "timestamp": "2026-04-19T10:00:00Z"
}
```

### ErrorResponse

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Mô tả lỗi bằng tiếng Việt.",
    "details": [
      {
        "field": "fieldName",
        "message": "Chi tiết lỗi cho field cụ thể"
      }
    ]
  },
  "timestamp": "2026-04-19T10:00:00Z"
}
```

---

## 5. Error Response Format

### Mã lỗi (Error Codes)

| Code | HTTP Status | Mô tả |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Dữ liệu đầu vào không hợp lệ |
| `UNAUTHORIZED` | 401 | Token bị thiếu hoặc đã hết hạn |
| `FORBIDDEN` | 403 | Không có quyền |
| `RESOURCE_NOT_FOUND` | 404 | Resource không tồn tại |
| `CONFLICT` | 409 | Dữ liệu trùng lặp hoặc resource đang được tham chiếu |
| `BUSINESS_RULE_VIOLATION` | 422 | Vi phạm quy tắc nghiệp vụ |
| `FEATURE_NOT_ENABLED` | 422 | Feature flag chưa được kích hoạt |
| `INTERNAL_ERROR` | 500 | Lỗi hệ thống nội bộ |

---

## 6. Quy ước Phân trang (Pagination Convention)

| Parameter | Mô tả | Mặc định | Giới hạn |
|---|---|---|---|
| `page` | Số trang, bắt đầu từ `0` | `0` | — |
| `size` | Số phần tử mỗi trang | `20` | Tối đa `100` |
| `sort` | Sắp xếp theo mẫu `{field},{direction}` | `createdAt,desc` | Chỉ cho phép sort theo các field đã được index |

Ví dụ: `GET /api/v1/resources?page=0&size=10&sort=createdAt,desc`

---

## Change Log

| Ngày | CR/ADR ID | Tóm tắt | Tác giả |
|---|---|---|---|
| 2026-05-15 | — | Cập nhật theo code mới: thêm invoice-info API, create transporter registry API, feature flags mới và bảng endpoint legacy còn tồn tại. | Codex |
| 2026-04-25 | — | Tạo REST API contract cho `tenant-service` từ các controller hiện có. | Codex |
| 2026-04-25 | — | Loại bỏ toàn bộ API không còn sử dụng khỏi contract. | Codex |
