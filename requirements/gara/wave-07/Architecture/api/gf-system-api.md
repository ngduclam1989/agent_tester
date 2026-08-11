---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 3.3
tier: T1
owner_authority: Architecture Authority
boundary: gf-system
last_reviewed: "2026-08-10"
depends_on:
  - "../hld/gf-system-HLD.md"
  - "../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md"
  - "../decisions/ADR-030-tenant-profile-sot-on-gf-system.md"
---

# REST API - `gf-system`

> API contract cho boundary `gf-system`, tập trung vào tenant master/support data: tenant transporter registry (CRUD + search) và tenant invoice info (read + upsert qua service-to-service). Branch và tenant subscription được seed từ Kafka event chứ không có REST endpoint.
>
> **§3bis (DESIGN — W07, EP-PARTNER-LINK)**: 6 endpoint mới cho màn "Liên kết" tab Driver Plus. Record `LKD-YYYY-NNN` **chỉ** sinh từ inbound Kafka event Driver Plus — KHÔNG có endpoint tạo (`BR-DPL-CMN-001`).

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-system` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1/system` |
| Protected prefixes | `/protected/v1` |
| Auth | Public APIs lấy tenant từ `SecurityUtils.getCurrentTenantIdAsLong()`; protected APIs đọc header `X-Tenant-Id` (service-to-service convention, không dùng `x-api-key`). |
| Idempotency | Không mặc định header `Idempotency-Key`. Transporter create chống trùng theo `(tenantId, routeContactPhoneNumber)`; invoice info upsert idempotent theo `tenantId` (unique). |
| Error envelope | Service hiện ném `IllegalArgumentException`, `DuplicateResourceException`, `ResourceNotFoundException` từ `actechx-common`; chưa emit mã `GMS.gf-system.*`. |
| Pagination | Search dùng `BaseSearchRequest` (`page`, `size`, `sort`); response đóng gói `PagedApiResponse<T>`. |
| Tenant resolution | Public: `SecurityUtils.getCurrentTenantIdAsLong()`; protected: header `X-Tenant-Id`. |
| Response wrappers | Public APIs dùng `ApiResponse<T>` / `PagedApiResponse<T>`; protected invoice info trả raw `TenantInvoiceInfoResponse` không bọc wrapper. |
| Persistence | PostgreSQL + Flyway (tenant_subscriptions, branches, tenant_invoice_info, tenant_transporter_registry, inbox_event, outbox_event, sequences). |
| Cache / async | Kafka outbox AFTER_COMMIT + scheduled relay; inbox idempotency cho command listener. Không có Redis cache. |
| Downstream | Gọi `gf-purchase` qua HTTP (`GET /protected/v1/purchase-orders/transport-routes/{id}/used`) để kiểm tra transporter route đang được sử dụng trước khi xóa. Tích hợp ra ngoài qua Kafka outbox (`tenant-invoice-info`, `tenant-transporter-registry`, `branch-lifecycle`). |
| Feature flag | Toàn bộ Transporter Registry controller được bọc bởi `@FeatureOn(value = "Purchase:PurchaseV02", fallback = THROW_EXCEPTION)`; nếu flag tắt, tất cả transporter endpoints trả exception. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `POST` | `/api/v1/system/tenant-transporter-registry` | TenantTransporterRegistry | authenticated tenant user |
| 2 | `POST` | `/api/v1/system/tenant-transporter-registry/search` | TenantTransporterRegistry | authenticated tenant user |
| 3 | `GET` | `/api/v1/system/tenant-transporter-registry/{id}` | TenantTransporterRegistry | authenticated tenant user |
| 4 | `GET` | `/api/v1/system/tenant-transporter-registry/cop-transporter-registry/{copTransporterRegistryId}` | TenantTransporterRegistry | authenticated tenant user |
| 5 | `PUT` | `/api/v1/system/tenant-transporter-registry/{id}` | TenantTransporterRegistry | authenticated tenant user |
| 6 | `DELETE` | `/api/v1/system/tenant-transporter-registry/{id}` | TenantTransporterRegistry | authenticated tenant user |
| 7 | `GET` | `/protected/v1/tenant-invoice-info` | TenantInvoiceInfo | service-to-service (`X-Tenant-Id`) |
| 8 | `PUT` | `/protected/v1/tenant-invoice-info` | TenantInvoiceInfo | service-to-service (`X-Tenant-Id`) |
| 9 | `GET` | `/api/v1/system/partner-links` | PartnerLink _(W07, DESIGN)_ | authenticated tenant user (`garage-owner` \| `accountant`) |
| 10 | `GET` | `/api/v1/system/partner-links/{requestCode}` | PartnerLink _(W07, DESIGN)_ | authenticated tenant user (`garage-owner` \| `accountant`) |
| 11 | `POST` | `/api/v1/system/partner-links/{requestCode}/approve` | PartnerLink _(W07, DESIGN)_ | authenticated tenant user (`garage-owner` \| `accountant`) |
| 12 | `POST` | `/api/v1/system/partner-links/{requestCode}/reject` | PartnerLink _(W07, DESIGN)_ | authenticated tenant user (`garage-owner` \| `accountant`) |
| 13 | `POST` | `/api/v1/system/partner-links/{requestCode}/resync` | PartnerLink _(W07, DESIGN)_ | authenticated tenant user (`garage-owner` \| `accountant`) |
| 14 | `POST` | `/api/v1/system/partner-links/{requestCode}/cancel` | PartnerLink _(W07, DESIGN)_ | authenticated tenant user (`garage-owner` \| `accountant`) |

> Chi tiết đầy đủ 6 endpoint `PartnerLink` (W07): xem **§3bis**.

---

## 3. Endpoint Details

### POST `/api/v1/system/tenant-transporter-registry`

Tạo entry transporter registry cho tenant hiện tại. Endpoint này dùng cho garage staff đăng ký nhà xe vận chuyển nội bộ; phone number phải duy nhất trong phạm vi tenant.

**Auth**: authenticated tenant user (tenantId resolve qua `SecurityUtils.getCurrentTenantIdAsLong()`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống trùng dựa trên `existsByTenantIdAndRouteContactPhoneNumber`.

**Request**:
```json
{
  "transporterName": "Nhà xe Phương Trang",
  "routeName": "TP.HCM - Đà Lạt",
  "routeContactPhoneNumber": "0901234567",
  "routeStartedAt": "08:00,14:00,20:00",
  "shippingAddress": "123 Lê Lợi, Q1, TP.HCM",
  "note": "Liên hệ chú Tâm",
  "status": "ACTIVE"
}
```

**Response 201**:
```json
{
  "data": {
    "id": 1001,
    "copTransporterRegistryId": null,
    "tenantId": 5001,
    "tenantType": "GARAGE",
    "transporterName": "Nhà xe Phương Trang",
    "routeName": "TP.HCM - Đà Lạt",
    "routeContactPhoneNumber": "0901234567",
    "routeStartedAt": "08:00,14:00,20:00",
    "shippingAddress": "123 Lê Lợi, Q1, TP.HCM",
    "note": "Liên hệ chú Tâm",
    "status": "ACTIVE",
    "isDeleted": false,
    "version": 0,
    "createdAt": "2026-05-07T03:14:22.000Z",
    "updatedAt": "2026-05-07T03:14:22.000Z",
    "createdBy": "garage-staff",
    "updatedBy": "garage-staff"
  }
}
```

**Side-effect**: persist `tenant_transporter_registry`; publish `TenantTransporterRegistryEvent` (action=`UPSERTED`, source=garage) lên Kafka topic `${kafka.topics.tenant-transporter-registry:TENANT-TRANSPORTER-REGISTRY}` qua outbox AFTER_COMMIT.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.TRANSPORTER_CREATE.01` | 400 | Body không parse được hoặc Bean Validation fail (`transporterName`, `routeName`, `routeContactPhoneNumber`, `routeStartedAt`, `shippingAddress` blank). |
| `GMS.gf-system.TRANSPORTER_CREATE.02` | 400 | `routeContactPhoneNumber` không match `^\d{10}$`. |
| `GMS.gf-system.TRANSPORTER_CREATE.03` | 400 | `routeStartedAt` không match regex giờ `hh:mm` (sau khi tách dấu phẩy). |
| `GMS.gf-system.TRANSPORTER_CREATE.04` | 400 | Không resolve được tenant từ security context. |
| `GMS.gf-system.TRANSPORTER_CREATE.05` | 409 | Tenant đã có transporter active với cùng `routeContactPhoneNumber` (`DuplicateResourceException`). |
| `GMS.gf-system.TRANSPORTER_CREATE.06` | 500 | Lưu DB hoặc publish outbox event thất bại. |

### POST `/api/v1/system/tenant-transporter-registry/search`

Tìm kiếm transporter registry theo từ khóa và status, có phân trang. Dùng cho màn hình quản lý nhà xe.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint search read-only.

**Request**:
```json
{
  "keyword": "Phương Trang",
  "status": ["ACTIVE"],
  "page": 0,
  "size": 20,
  "sort": "createdAt,desc"
}
```

**Response 200**:
```json
{
  "data": [
    {
      "id": 1001,
      "tenantId": 5001,
      "tenantType": "GARAGE",
      "transporterName": "Nhà xe Phương Trang",
      "routeName": "TP.HCM - Đà Lạt",
      "routeContactPhoneNumber": "0901234567",
      "routeStartedAt": "08:00,14:00,20:00",
      "shippingAddress": "123 Lê Lợi, Q1, TP.HCM",
      "status": "ACTIVE",
      "isDeleted": false,
      "version": 0,
      "createdAt": "2026-05-07T03:14:22.000Z",
      "updatedAt": "2026-05-07T03:14:22.000Z"
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

**Side-effect**: không có side-effect nghiệp vụ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.TRANSPORTER_SEARCH.01` | 400 | Body không parse được hoặc enum `status` không hợp lệ. |
| `GMS.gf-system.TRANSPORTER_SEARCH.02` | 400 | Page/size/sort không hợp lệ. |
| `GMS.gf-system.TRANSPORTER_SEARCH.03` | 400 | Không resolve được tenant từ security context. |
| `GMS.gf-system.TRANSPORTER_SEARCH.04` | 500 | Repository search thất bại. |

### GET `/api/v1/system/tenant-transporter-registry/{id}`

Lấy chi tiết một transporter registry theo ID. Scoped theo tenant hiện tại; chỉ trả record thuộc tenant của user.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only.

**Request**:
```
GET /api/v1/system/tenant-transporter-registry/1001
```

**Response 200**:
```json
{
  "data": {
    "id": 1001,
    "copTransporterRegistryId": null,
    "tenantId": 5001,
    "tenantType": "GARAGE",
    "transporterName": "Nhà xe Phương Trang",
    "routeName": "TP.HCM - Đà Lạt",
    "routeContactPhoneNumber": "0901234567",
    "routeStartedAt": "08:00,14:00,20:00",
    "shippingAddress": "123 Lê Lợi, Q1, TP.HCM",
    "note": "Liên hệ chú Tâm",
    "status": "ACTIVE",
    "isDeleted": false,
    "version": 0,
    "createdAt": "2026-05-07T03:14:22.000Z",
    "updatedAt": "2026-05-07T03:14:22.000Z",
    "createdBy": "garage-staff",
    "updatedBy": "garage-staff"
  }
}
```

**Side-effect**: không có side-effect nghiệp vụ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.TRANSPORTER_GET.01` | 400 | Path `id` không phải số hoặc tenant không resolve được. |
| `GMS.gf-system.TRANSPORTER_GET.02` | 404 | Không tìm thấy registry theo `(tenantId, id)` (`ResourceNotFoundException`). |
| `GMS.gf-system.TRANSPORTER_GET.03` | 500 | Lỗi đọc DB hoặc map response. |

### GET `/api/v1/system/tenant-transporter-registry/cop-transporter-registry/{copTransporterRegistryId}`

Lấy chi tiết transporter registry theo `copTransporterRegistryId` — ID gốc từ hệ thống COP. Dùng khi cần tra cứu ngược từ COP ID về tenant registry record.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only.

**Request**:
```
GET /api/v1/system/tenant-transporter-registry/cop-transporter-registry/2001
```

**Response 200**:
```json
{
  "data": {
    "id": 1001,
    "copTransporterRegistryId": 2001,
    "tenantId": 5001,
    "tenantType": "GARAGE",
    "transporterName": "Nhà xe Phương Trang",
    "routeName": "TP.HCM - Đà Lạt",
    "routeContactPhoneNumber": "0901234567",
    "routeStartedAt": "08:00,14:00,20:00",
    "shippingAddress": "123 Lê Lợi, Q1, TP.HCM",
    "note": "Liên hệ chú Tâm",
    "status": "ACTIVE",
    "isDeleted": false,
    "version": 0,
    "createdAt": "2026-05-07T03:14:22.000Z",
    "updatedAt": "2026-05-07T03:14:22.000Z",
    "createdBy": "garage-staff",
    "updatedBy": "garage-staff"
  }
}
```

**Side-effect**: không có side-effect nghiệp vụ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.TRANSPORTER_GET_BY_COP.01` | 400 | Path `copTransporterRegistryId` không phải số hoặc tenant không resolve được. |
| `GMS.gf-system.TRANSPORTER_GET_BY_COP.02` | 404 | Không tìm thấy registry theo `(tenantId, copTransporterRegistryId)` (`ResourceNotFoundException`). |
| `GMS.gf-system.TRANSPORTER_GET_BY_COP.03` | 500 | Lỗi đọc DB hoặc map response. |

### PUT `/api/v1/system/tenant-transporter-registry/{id}`

Cập nhật transporter registry hiện có. Field nào null trong request thì giữ nguyên giá trị cũ; phone number phải vẫn duy nhất trong tenant.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header; cập nhật theo `(tenantId, id)` và optimistic lock qua `version`.

**Request**:
```json
{
  "transporterName": "Nhà xe Phương Trang VIP",
  "routeName": "TP.HCM - Đà Lạt",
  "routeContactPhoneNumber": "0901234567",
  "routeStartedAt": "08:00,14:00,20:00,02:00",
  "shippingAddress": "456 Nguyễn Huệ, Q1, TP.HCM",
  "note": null,
  "status": "ACTIVE"
}
```

**Response 200**:
```json
{
  "data": {
    "id": 1001,
    "tenantId": 5001,
    "tenantType": "GARAGE",
    "transporterName": "Nhà xe Phương Trang VIP",
    "routeName": "TP.HCM - Đà Lạt",
    "routeContactPhoneNumber": "0901234567",
    "routeStartedAt": "08:00,14:00,20:00,02:00",
    "shippingAddress": "456 Nguyễn Huệ, Q1, TP.HCM",
    "status": "ACTIVE",
    "isDeleted": false,
    "version": 1,
    "updatedAt": "2026-05-07T04:10:00.000Z",
    "updatedBy": "garage-staff"
  }
}
```

**Side-effect**: persist update; publish `TenantTransporterRegistryEvent` (action=`UPSERTED`, source=garage) qua outbox AFTER_COMMIT.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.TRANSPORTER_UPDATE.01` | 400 | Body validate fail: phone format hoặc các field bắt buộc sau merge trở thành blank. |
| `GMS.gf-system.TRANSPORTER_UPDATE.02` | 400 | `routeStartedAt` không match `hh:mm`. |
| `GMS.gf-system.TRANSPORTER_UPDATE.03` | 404 | Không tìm thấy registry theo `(tenantId, id)` (`ResourceNotFoundException`). |
| `GMS.gf-system.TRANSPORTER_UPDATE.04` | 409 | Phone mới đã được tenant dùng cho registry khác (`DuplicateResourceException`). |
| `GMS.gf-system.TRANSPORTER_UPDATE.05` | 409 | Optimistic lock conflict trên `@Version`. |
| `GMS.gf-system.TRANSPORTER_UPDATE.06` | 500 | Lưu DB hoặc publish outbox event thất bại. |

### DELETE `/api/v1/system/tenant-transporter-registry/{id}`

Soft-delete transporter registry. Aggregate được mark `isDeleted=true`; record vẫn lưu trong DB để giữ audit và phát event downstream. Trước khi xóa, service kiểm tra xem transporter route có đang được sử dụng trong purchase order không (gọi `gf-purchase` qua HTTP).

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header; xóa theo `(tenantId, id)`. Repeat call trên record đã xóa trả 404 vì `findByTenantIdAndId` chỉ tìm record chưa soft-delete.

**Request**:
```
DELETE /api/v1/system/tenant-transporter-registry/1001
```

**Response 200**:
```json
{
  "data": {
    "id": 1001,
    "copTransporterRegistryId": null,
    "tenantId": 5001,
    "tenantType": "GARAGE",
    "transporterName": "Nhà xe Phương Trang",
    "routeName": "TP.HCM - Đà Lạt",
    "routeContactPhoneNumber": "0901234567",
    "routeStartedAt": "08:00,14:00,20:00",
    "shippingAddress": "123 Lê Lợi, Q1, TP.HCM",
    "note": "Liên hệ chú Tâm",
    "status": "ACTIVE",
    "isDeleted": true,
    "version": 0,
    "createdAt": "2026-05-07T03:14:22.000Z",
    "updatedAt": "2026-05-07T05:00:00.000Z",
    "createdBy": "garage-staff",
    "updatedBy": "garage-staff"
  }
}
```

**Side-effect**: mark `isDeleted=true`; publish `TenantTransporterRegistryEvent` (action=`DELETED`, source=garage) qua outbox AFTER_COMMIT.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.TRANSPORTER_DELETE.01` | 400 | Path `id` không phải số hoặc tenant không resolve được. |
| `GMS.gf-system.TRANSPORTER_DELETE.02` | 404 | Không tìm thấy registry theo `(tenantId, id)` hoặc record đã soft-delete. |
| `GMS.gf-system.TRANSPORTER_DELETE.03` | 409 | Transporter route đang được sử dụng trong purchase order (`BusinessException(TTR_01)`); không cho phép xóa. |
| `GMS.gf-system.TRANSPORTER_DELETE.04` | 500 | Lưu trạng thái delete hoặc publish outbox event thất bại. |

### GET `/protected/v1/tenant-invoice-info`

Lấy thông tin xuất hóa đơn của tenant; nếu chưa có thì trả aggregate empty (`invoiceInfo=null`). Endpoint này dùng cho gf-purchase, gf-accounting và các service nội bộ cần thông tin pháp nhân khi in chứng từ.

**Auth**: service-to-service. Caller phải gửi header `X-Tenant-Id`.
**Idempotency**: Không áp dụng; endpoint read-only.

**Request**:
```json
{
  "headers": {
    "X-Tenant-Id": "5001"
  }
}
```

**Response 200** (đã có invoice info):
```json
{
  "tenantId": 5001,
  "invoiceInfo": {
    "companyName": "Công ty TNHH Garage ABC",
    "taxCode": "0312345678",
    "companyEmailAddress": "ketoan@garage-abc.vn",
    "companyAddress": "789 Hai Bà Trưng, Q3, TP.HCM"
  },
  "version": 4,
  "updatedAt": "2026-05-06T08:00:00.000Z"
}
```

**Response 200** (tenant chưa cấu hình invoice info):
```json
{
  "tenantId": 5001,
  "invoiceInfo": null,
  "version": null,
  "updatedAt": null
}
```

**Side-effect**: không có side-effect nghiệp vụ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.INVOICE_READ.01` | 400 | Thiếu hoặc parse fail header `X-Tenant-Id` (`IllegalArgumentException: "Thiếu tenantId"`). |
| `GMS.gf-system.INVOICE_READ.02` | 500 | Lỗi đọc DB hoặc map response. |

### PUT `/protected/v1/tenant-invoice-info`

Upsert thông tin xuất hóa đơn của tenant từ luồng garage. Logic `fillMissingFromGarage` chỉ điền các field còn rỗng; field đã có giá trị KHÔNG bị overwrite. Khi có thay đổi thực sự, service emit `TenantInvoiceInfoUpdatedEvent` qua outbox.

**Auth**: service-to-service. Caller phải gửi header `X-Tenant-Id`.
**Idempotency**: Repeat call với cùng nội dung không tạo event mới — service so sánh và return early khi `changed=false`.

**Request**:
```json
{
  "headers": {
    "X-Tenant-Id": "5001"
  },
  "body": {
    "companyName": "Công ty TNHH Garage ABC",
    "taxCode": "0312345678",
    "companyEmailAddress": "ketoan@garage-abc.vn",
    "companyAddress": "789 Hai Bà Trưng, Q3, TP.HCM",
    "updatedBy": "garage-admin"
  }
}
```

**Response 200**:
```json
{
  "tenantId": 5001,
  "invoiceInfo": {
    "companyName": "Công ty TNHH Garage ABC",
    "taxCode": "0312345678",
    "companyEmailAddress": "ketoan@garage-abc.vn",
    "companyAddress": "789 Hai Bà Trưng, Q3, TP.HCM"
  },
  "version": 5,
  "updatedAt": "2026-05-07T03:20:00.000Z"
}
```

**Side-effect**: persist `tenant_invoice_info` (insert nếu chưa có, update nếu thay đổi); publish `TenantInvoiceInfoUpdatedEvent` lên Kafka topic `${kafka.topics.tenant-invoice-info:AC-TENANT-INVOICE-INFO}` qua outbox với `partitionKey=tenantId`.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-system.INVOICE_UPSERT.01` | 400 | Thiếu header `X-Tenant-Id`. |
| `GMS.gf-system.INVOICE_UPSERT.02` | 400 | Body fail Bean Validation: `companyName` >255, `taxCode` >50, email không đúng định dạng, `updatedBy` >100. |
| `GMS.gf-system.INVOICE_UPSERT.03` | 400 | Tất cả 4 field invoice info blank (`@AssertTrue isHasInvoiceField` fail). |
| `GMS.gf-system.INVOICE_UPSERT.04` | 409 | Optimistic lock conflict trên `@Version` của `TenantInvoiceInfo`. |
| `GMS.gf-system.INVOICE_UPSERT.05` | 500 | Lưu DB hoặc lưu outbox event thất bại. |

---

## 3bis. Partner Link — Driver Plus (DESIGN — W07, EP-PARTNER-LINK / FEAT-SYS-DRIVERPLUS-LINK)

> **Status**: DESIGN — 6 endpoint dưới đây **chưa có trong source**. Cite: [ADR-029](../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md) · [ADR-030](../decisions/ADR-030-tenant-profile-sot-on-gf-system.md) · `Product/features/FEAT-SYS-DRIVERPLUS-LINK.md` · `Product/business-rules/BR-GF-SYSTEM.md` §2.5.
>
> **Quy ước chung §3bis** (áp cho cả 6 endpoint, không lặp lại từng mục):
> - **Base path**: `/api/v1/system/partner-links` (public prefix `/api/v1/system` sẵn có, kebab-case).
> - **Tenant resolution**: `SecurityUtils.getCurrentTenantIdAsLong()` (public API convention của boundary). `X-Tenant-Id` vẫn được gửi từ BFF để trace/log — server **KHÔNG** tin header này cho scoping.
> - **Phân quyền**: `garage-owner` **và** `accountant` quyền **ngang nhau**, không ngoại lệ (`BR-DPL-CMN-004`, `BR-GF-SYSTEM.md` §4.2). KHÔNG có role mới.
> - **Error envelope**: các mã nghiệp vụ dùng **trực tiếp** `ERR-DPL-*` theo `Product/Commons/ERROR-CODE-REGISTRY.md` §5 (FE/mobile bind message theo mã này — 1 nguồn duy nhất, tránh double-mapping). Mã hạ tầng (auth/validation/tenant) giữ pattern `GMS.gf-system.*` sẵn có của boundary.
> - **Idempotency**: KHÔNG dùng header `Idempotency-Key` (nhất quán §1). 4 endpoint hành động idempotent nhờ **state guard** — conditional update `WHERE tenant_id=? AND request_code=? AND status=<expected>`; `rowsAffected=0` → `409 ERR-DPL-004`. Gọi lặp trên record đã terminal luôn trả 409, không tạo side-effect thứ hai.
> - **Feature flag**: `PartnerLink:DriverPlus` (`FEAT` §8, default `on` mọi tenant). Flag `off` → toàn bộ 6 endpoint trả `403 GMS.gf-system.PARTNER_LINK.FLAG_OFF`; FE/mobile ẩn menu/tab.
> - **Không có endpoint tạo**: `POST /partner-links` **KHÔNG tồn tại** — record chỉ sinh từ inbound Kafka `PARTNER_LINK.REQUEST.CREATE` (`BR-DPL-CMN-001`, `BR-GF-SYSTEM.md` §4.2 row "Tự tạo yêu cầu liên kết = KHÔNG").

### GET `/api/v1/system/partner-links`

Danh sách yêu cầu liên kết của garage hiện tại, lọc theo trạng thái. Nguồn dữ liệu cho panel trái (web AC-3/AC-4) và danh sách card (mobile AC-41).

**(1) Headers**

| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | User JWT của garage staff |
| `X-Tenant-Id` | Yes | Numeric tenant id — dùng cho trace/log; scoping lấy từ security context |
| `X-Branch-Id` | No | Không branch-scoped — yêu cầu liên kết ở phạm vi **garage/tenant** (`BR-DPL-LST-001`) |

**(2) Path / Query params**

| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `partnerCode` | String (enum) | No | Chỉ `DRIVER_PLUS`; default `DRIVER_PLUS` khi bỏ trống (giai đoạn 1 hard-code 1 đối tác) | `FEAT` §4 · §7 Out of Scope |
| `statuses` | String[] (multi-value repeated key `?statuses=PENDING&statuses=LINKED`) | No | Subset của `PENDING\|LINKED\|REJECTED\|UNLINKED`; bỏ trống = **tất cả 4**. FE gửi mặc định `PENDING` + `LINKED` | `BR-DPL-LST-003` · `FEAT` AC-5 / AC-42 |

> **KHÔNG có** `page` / `size` / `keyword`: `BR-DPL-LST-004` chốt bỏ tìm kiếm + phân trang cho **cả 2 platform** (deviation có chủ đích so với `BR-COMMON#SYS-RETRY-004/008/022`, lý do: mỗi garage tối đa 1 tài khoản D+ active nên danh sách luôn ngắn). Server áp **cap phòng vệ 500 row** — vượt cap thì trả 500 row mới nhất + `truncated=true` (xem Semantics).

**(3) Request body**: N/A (GET).

**(4) Response 2xx** — `200 OK`

```json
{
  "data": {
    "items": [
      {
        "requestCode": "LKD-2026-002",
        "partnerCode": "DRIVER_PLUS",
        "partnerAccountName": "Trần Thị Mai",
        "partnerAccountPhone": "0912345678",
        "requestedAt": "2026-08-05T03:09:58Z",
        "status": "PENDING",
        "processedAt": null,
        "processedByLabel": null,
        "reason": null
      },
      {
        "requestCode": "LKD-2026-001",
        "partnerCode": "DRIVER_PLUS",
        "partnerAccountName": "Nguyễn Văn Sơn",
        "partnerAccountPhone": "0901234567",
        "requestedAt": "2026-08-04T02:00:00Z",
        "status": "UNLINKED",
        "processedAt": "2026-08-05T06:00:00Z",
        "processedByLabel": "Driver Plus",
        "reason": "Hủy từ ứng dụng Driver Plus."
      }
    ],
    "totalItems": 2,
    "truncated": false
  }
}
```

| Field | Type | Note | Cite |
|---|---|---|---|
| `data.items[].requestCode` | String | Mã `LKD-YYYY-NNN` — canonical, xem §5 | `FEAT` AC-4 |
| `data.items[].partnerCode` | Enum `PartnerCode` | `DRIVER_PLUS` | `FEAT` §4 |
| `data.items[].partnerAccountName` | String | Tên tài khoản Driver Plus | `FEAT` AC-4, AC-9 |
| `data.items[].partnerAccountPhone` | String | Số điện thoại | `FEAT` AC-4, AC-9 |
| `data.items[].requestedAt` | ISO-8601 | Ngày gửi yêu cầu; sort DESC | `FEAT` AC-4 · `BR-DPL-LST-002` |
| `data.items[].status` | Enum `PartnerLinkStatus` | Badge trạng thái | `BR-GF-SYSTEM` §3.2 |
| `data.items[].processedAt` | ISO-8601 \| null | `null` khi `PENDING` | `FEAT` AC-10 |
| `data.items[].processedByLabel` | String \| null | Snapshot text; **mobile card hiển thị trực tiếp field này** | `BR-DPL-CMN-005` · `BR-DPL-LST-005` |
| `data.items[].reason` | String \| null | Lý do; mobile card hiển thị trực tiếp | `BR-DPL-LST-005` |
| `data.totalItems` | Integer | Số lượng sau filter — mobile render "{N} yêu cầu" | `FEAT` AC-41 |
| `data.truncated` | Boolean | `true` khi vượt cap 500 | Design (xem Semantics) |

Empty list → `200` với `items: []`, `totalItems: 0`. FE phân biệt 2 empty state bằng bộ filter đang áp: không filter mà rỗng → `ERR-DPL-008`; có filter mà rỗng → `ERR-DPL-009` (`FEAT` AC-7 vs EC-1).

**(5) Response 4xx/5xx**

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-system.PARTNER_LINK.AUTH_401` | 401 | Thiếu/không hợp lệ JWT |
| `GMS.gf-system.PARTNER_LINK.AUTH_403` | 403 | Không resolve được tenant từ security context |
| `GMS.gf-system.PARTNER_LINK.FLAG_OFF` | 403 | Feature flag `PartnerLink:DriverPlus` = off |
| `GMS.gf-system.PARTNER_LINK.VAL_400` | 400 | `statuses` chứa giá trị ngoài enum, hoặc `partnerCode` ≠ `DRIVER_PLUS` |
| `ERR-DPL-007` | 503 | Lỗi đọc DB — FE render banner "Không tải được danh sách yêu cầu liên kết. Vui lòng thử lại." + nút "Tải lại" |

**(6) Semantics**

- **Idempotency**: read-only, không áp dụng.
- **Permission gate**: `garage-owner` + `accountant` ngang quyền (`BR-DPL-CMN-004`).
- **Performance**: p95 ≤ 200ms. **Không phân trang** theo `BR-DPL-LST-004`; cap phòng vệ 500 row (`ORDER BY requested_at DESC LIMIT 501`, phần tử thứ 501 chỉ dùng để set `truncated=true`). Index dùng: `idx_plr_tenant_status_requested (tenant_id, status, requested_at DESC)`.
- **Side-effect**: không.

### GET `/api/v1/system/partner-links/{requestCode}`

Chi tiết 1 yêu cầu + khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS" đọc **real-time** từ hồ sơ garage hiện tại. Nguồn dữ liệu cho panel phải (web AC-8..AC-11) và màn chi tiết full-screen (mobile).

**(1) Headers**

| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | User JWT |
| `X-Tenant-Id` | Yes | Trace/log |
| `X-Branch-Id` | No | Không branch-scoped |

**(2) Path / Query params**

| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `requestCode` | String | Yes | Pattern `^LKD-\d{4}-\d{3,}$`; scoped theo tenant hiện tại | `EP-PARTNER-LINK` §3 · `FEAT` AC-4 |

**(3) Request body**: N/A (GET).

**(4) Response 2xx** — `200 OK`

```json
{
  "data": {
    "requestCode": "LKD-2026-001",
    "partnerCode": "DRIVER_PLUS",
    "partnerAccountName": "Nguyễn Văn Sơn",
    "partnerAccountPhone": "0901234567",
    "requestedAt": "2026-08-04T02:00:00Z",
    "status": "LINKED",
    "processedAt": "2026-08-05T04:00:00Z",
    "processedByLabel": "Đăng Vinh (Chủ garage)",
    "reason": null,
    "availableActions": ["RESYNC", "CANCEL"],
    "garageProfile": {
      "businessName": "Garage Đăng Vinh",
      "contactPhoneNumber": "0287654321",
      "addressDetail": "12 Trần Não",
      "ward": "Phường An Khánh",
      "city": "TP.HCM"
    },
    "invoiceInfo": {
      "companyName": "Công ty CP Garage Đăng Vinh",
      "taxCode": "0309876543",
      "companyAddress": "12 Trần Não, Phường An Khánh, TP.HCM",
      "companyEmailAddress": "invoice@dangvinh.vn"
    }
  }
}
```

| Field | Type | Note | Cite |
|---|---|---|---|
| 9 field đầu | — | Giống item của endpoint list | (như trên) |
| `data.availableActions` | Enum[] `APPROVE\|REJECT\|RESYNC\|CANCEL` | **Server-derived theo `status`** — FE render nút theo mảng này thay vì tự suy từ status: `PENDING`→`[APPROVE, REJECT]`, `LINKED`→`[RESYNC, CANCEL]`, `REJECTED`/`UNLINKED`→`[]` | `FEAT` AC-8 · `BR-DPL-APV-001`/`REJ-001`/`SYN-001`/`CAN-001` |
| `data.garageProfile.*` | 5 field, nullable | Đọc **real-time** `tenant_profile`; `null` khi tenant chưa có hồ sơ (ADR-030 Gap 2) → UI render rỗng, **KHÔNG** chặn action | `FEAT` AC-11 · CB-SYS-006 |
| `data.invoiceInfo.*` | 4 field, nullable | Đọc **real-time** `tenant_invoice_info` | `FEAT` AC-11 (4 field cố định) |

Section "THÔNG TIN XỬ LÝ" ẩn/hiện ở FE theo `status` (`PENDING` → ẩn) — server luôn trả đủ field, giá trị `null` (`FEAT` AC-10).

**(5) Response 4xx/5xx**

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-system.PARTNER_LINK.AUTH_401` | 401 | Thiếu/không hợp lệ JWT |
| `GMS.gf-system.PARTNER_LINK.AUTH_403` | 403 | Không resolve được tenant |
| `GMS.gf-system.PARTNER_LINK.FLAG_OFF` | 403 | Feature flag off |
| `GMS.gf-system.PARTNER_LINK.VAL_400` | 400 | `requestCode` sai pattern |
| `GMS.gf-system.PARTNER_LINK.NF_404` | 404 | Không tìm thấy `(tenantId, requestCode)` — **bao gồm** case record thuộc tenant khác (không phân biệt để tránh lộ tồn tại cross-tenant) |
| `ERR-DPL-007` | 503 | Lỗi đọc DB |

**(6) Semantics**

- **Idempotency**: read-only.
- **Permission gate**: `garage-owner` + `accountant` ngang quyền.
- **Performance**: p95 ≤ 250ms. 3 lookup theo unique key trong 1 request (`uk_plr_tenant_request_code`, `uk_tenant_profile_tenant_id`, `idx_tenant_invoice_info_tenant_id`) — **không N+1**, không nested collection. KHÔNG cache khối profile/invoice (CB-SYS-006 cấm cache trung gian).
- **Side-effect**: không.

### POST `/api/v1/system/partner-links/{requestCode}/approve`

Duyệt yêu cầu đang "Chờ liên kết". Trong **cùng 1 transaction**: chuyển record sang `LINKED`, cascade auto-reject mọi record `PENDING` khác của garage, ghi outbox 2 loại event outbound.

**(1) Headers**

| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | User JWT — dùng để dựng snapshot `processedByLabel` |
| `X-Tenant-Id` | Yes | Trace/log |
| `X-Branch-Id` | No | Không branch-scoped |

**(2) Path / Query params**

| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `requestCode` | String | Yes | Pattern `^LKD-\d{4}-\d{3,}$`; phải đang ở `status=PENDING` | `FEAT` AC-12 · `BR-DPL-APV-001` |

**(3) Request body** — `application/json`

```json
{ "termsAccepted": true }
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `termsAccepted` | Boolean | Yes | Phải `true`; `false`/thiếu → 400. Server-side guard cho consent, độc lập với gate UI (checkbox + scroll-to-end là guard client) | `BR-DPL-APV-002` · `FEAT` AC-13, AC-14 |

> Nội dung "Điều khoản chia sẻ thông tin" **không** đến từ API — DEV dùng bản tóm tắt 2 mục dựng sẵn ở FE, Legal thay câu chữ sau qua CR (`FEAT` AC-12 + §7 Out of Scope). Server chỉ ghi nhận sự đồng ý.

**(4) Response 2xx** — `200 OK`

```json
{
  "data": {
    "requestCode": "LKD-2026-001",
    "status": "LINKED",
    "processedAt": "2026-08-05T04:00:00Z",
    "processedByLabel": "Đăng Vinh (Chủ garage)",
    "reason": null,
    "availableActions": ["RESYNC", "CANCEL"],
    "autoRejectedRequestCodes": ["LKD-2026-002", "LKD-2026-003"]
  }
}
```

| Field | Type | Note | Cite |
|---|---|---|---|
| `data.status` | Enum | Luôn `LINKED` khi 200 | `FEAT` AC-15(a) |
| `data.processedByLabel` | String | Snapshot `{Tên nhân viên} ({Tên hiển thị role})` — role map `garage-owner`→"Chủ garage", `accountant`→"Kế toán" | `BR-DPL-CMN-005` · `FEAT` AC-15(b) |
| `data.autoRejectedRequestCodes` | String[] | Danh sách record bị cascade auto-reject (rỗng nếu không có) — FE dùng để refresh danh sách trái/card mà không cần re-fetch toàn bộ | `FEAT` AC-16 · `BR-DPL-APV-004` |

FE hiển thị toast `Đã liên kết thành công với tài khoản Driver Plus {Tên}.` (`FEAT` AC-15(d)).

**(5) Response 4xx/5xx**

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-system.PARTNER_LINK.AUTH_401` | 401 | Thiếu/không hợp lệ JWT |
| `GMS.gf-system.PARTNER_LINK.AUTH_403` | 403 | Không resolve được tenant |
| `GMS.gf-system.PARTNER_LINK.FLAG_OFF` | 403 | Feature flag off |
| `GMS.gf-system.PARTNER_LINK.VAL_400` | 400 | `termsAccepted` ≠ `true` hoặc `requestCode` sai pattern |
| `GMS.gf-system.PARTNER_LINK.NF_404` | 404 | Không tìm thấy `(tenantId, requestCode)` |
| `ERR-DPL-004` | 409 | Record **không còn** ở `PENDING` (đã bị người khác xử lý) → FE toast "Yêu cầu liên kết này đã được xử lý bởi người dùng khác. Vui lòng làm mới trang." |
| `ERR-DPL-006` | 409 | Vi phạm `uk_plr_tenant_active_link` — 2 user Duyệt 2 record khác nhau gần như đồng thời; request commit sau bị chặn → FE toast "Đã có tài khoản Driver Plus khác vừa được liên kết. Yêu cầu của bạn tự động chuyển 'Từ chối'." + record của user đó đã ở `REJECTED` |
| `ERR-DPL-005` | 503 | Lỗi hệ thống khi xử lý — modal giữ nguyên dữ liệu, FE toast "Không thể xử lý yêu cầu. Vui lòng thử lại sau." |

**(6) Semantics**

- **Idempotency**: state-guarded. `UPDATE … WHERE tenant_id=? AND request_code=? AND status='PENDING'`; `rowsAffected=0` → `409 ERR-DPL-004`. Gọi lặp không tạo link thứ hai.
- **Atomicity (trả lời `FEAT` AC-31 + EC-3 `NEED CONFIRMATION Architecture`)**: transition + cascade auto-reject + ghi outbox nằm trong **1 transaction** (all-or-nothing). Invariant `BR-DPL-CMN-002` được enforce ở tầng DB bằng partial unique index `uk_plr_tenant_active_link (tenant_id) WHERE status='LINKED'` — 2 transaction đồng thời thì transaction sau nhận constraint violation, service map sang `ERR-DPL-006` và tự chuyển record của mình sang `REJECTED` (đúng hành vi AC-31). Cascade dùng mệnh đề `status='PENDING'` nên **bỏ qua** record vừa bị người khác chuyển terminal (thoả AC-28).
- **Permission gate**: `garage-owner` + `accountant` ngang quyền (`BR-DPL-CMN-004`).
- **Performance**: p95 ≤ 500ms (write + N cascade update trong cùng transaction; N thực tế ≤ 5). Index dùng: `uk_plr_tenant_request_code`, `idx_plr_tenant_status_requested`.
- **Side-effect**: ghi `outbox_events` 2 loại — `PARTNER_LINK.PROFILE.SYNC` (`syncTrigger=APPROVED`, 1 event) + `PARTNER_LINK.STATUS.CHANGED` (1 event `APPROVED` + **1 event `AUTO_REJECTED` cho mỗi** record trong `autoRejectedRequestCodes`). Publish fail **KHÔNG** rollback (`FEAT` AC-32). Xem [`gf-system-events.md`](../events/gf-system-events.md) §3.13/§3.14.

### POST `/api/v1/system/partner-links/{requestCode}/reject`

Từ chối yêu cầu đang "Chờ liên kết", kèm lý do bắt buộc. **KHÔNG** trigger cascade single-active-link.

**(1) Headers**

| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | User JWT — dựng `processedByLabel` |
| `X-Tenant-Id` | Yes | Trace/log |
| `X-Branch-Id` | No | Không branch-scoped |

**(2) Path / Query params**

| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `requestCode` | String | Yes | Pattern `^LKD-\d{4}-\d{3,}$`; phải đang ở `status=PENDING` | `BR-DPL-REJ-001` · `FEAT` AC-17 |

**(3) Request body** — `application/json`

```json
{ "reason": "SĐT không đúng, nghi nhầm garage khác." }
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `reason` | String | Yes | Sau `trim` phải **không rỗng** (`BR-COMMON#SYS-RETRY-005`). Không có min-length; tối đa **2.000 ký tự**. Vượt giới hạn trả `ERR-DPL-012` | `BR-DPL-REJ-002` · `FEAT` AC-18 |

**(4) Response 2xx** — `200 OK`

```json
{
  "data": {
    "requestCode": "LKD-2026-002",
    "status": "REJECTED",
    "processedAt": "2026-08-05T04:05:00Z",
    "processedByLabel": "Lan Anh (Kế toán)",
    "reason": "SĐT không đúng, nghi nhầm garage khác.",
    "availableActions": []
  }
}
```

| Field | Type | Note | Cite |
|---|---|---|---|
| `data.status` | Enum | Luôn `REJECTED` (terminal) | `FEAT` AC-19(a) |
| `data.availableActions` | Enum[] | Luôn `[]` — header form không còn nút | `FEAT` AC-19(d) |

FE toast `Đã từ chối yêu cầu liên kết {LKD-xxx}.` (`FEAT` AC-19(c)).

**(5) Response 4xx/5xx**

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-system.PARTNER_LINK.AUTH_401` / `.AUTH_403` | 401 / 403 | Auth / tenant |
| `GMS.gf-system.PARTNER_LINK.FLAG_OFF` | 403 | Feature flag off |
| `ERR-DPL-001` | 400 | `reason` rỗng hoặc chỉ khoảng trắng (`VLD-DPL-001`) — FE đã disable nút, đây là guard server |
| `ERR-DPL-012` | 400 | `reason` vượt 2.000 ký tự (`VLD-DPL-006`) |
| `GMS.gf-system.PARTNER_LINK.VAL_400` | 400 | `requestCode` sai pattern |
| `GMS.gf-system.PARTNER_LINK.NF_404` | 404 | Không tìm thấy `(tenantId, requestCode)` |
| `ERR-DPL-004` | 409 | Record không còn ở `PENDING` |
| `ERR-DPL-005` | 503 | Lỗi hệ thống |

**(6) Semantics**

- **Idempotency**: state-guarded `WHERE status='PENDING'`; gọi lặp → `409 ERR-DPL-004`.
- **Permission gate**: dual persona ngang quyền.
- **Performance**: p95 ≤ 400ms. Index: `uk_plr_tenant_request_code`.
- **Side-effect**: 1 outbox event `PARTNER_LINK.STATUS.CHANGED` `notificationType=REJECTED` (wording `BR-DPL-NOTI-002` kèm lý do). **KHÔNG** cascade (`FEAT` AC-19(e)). **KHÔNG** publish `PARTNER_LINK.PROFILE.SYNC`.

### POST `/api/v1/system/partner-links/{requestCode}/resync`

Gửi lại hồ sơ garage hiện tại sang Driver Plus. **KHÔNG** đổi trạng thái, **KHÔNG** ghi đè khối "THÔNG TIN XỬ LÝ".

**(1) Headers**

| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | User JWT |
| `X-Tenant-Id` | Yes | Trace/log |
| `X-Branch-Id` | No | Không branch-scoped |

**(2) Path / Query params**

| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `requestCode` | String | Yes | Pattern `^LKD-\d{4}-\d{3,}$`; phải đang ở `status=LINKED` | `BR-DPL-SYN-001` · `FEAT` AC-20 |

**(3) Request body**: N/A — modal chỉ có nút xác nhận, không thu thập dữ liệu (`FEAT` AC-20).

**(4) Response 2xx** — `200 OK`

```json
{
  "data": {
    "requestCode": "LKD-2026-001",
    "status": "LINKED",
    "processedAt": "2026-08-05T04:00:00Z",
    "processedByLabel": "Đăng Vinh (Chủ garage)",
    "reason": null,
    "availableActions": ["RESYNC", "CANCEL"],
    "syncedAt": "2026-08-05T09:30:00Z",
    "garageProfile": {
      "businessName": "Garage Đăng Vinh",
      "contactPhoneNumber": "0287654321",
      "addressDetail": "12 Trần Não",
      "ward": "Phường An Khánh",
      "city": "TP.HCM"
    },
    "invoiceInfo": {
      "companyName": "Công ty CP Garage Đăng Vinh",
      "taxCode": "0309876543",
      "companyAddress": "12 Trần Não, Phường An Khánh, TP.HCM",
      "companyEmailAddress": "invoice@dangvinh.vn"
    }
  }
}
```

| Field | Type | Note | Cite |
|---|---|---|---|
| `data.status` | Enum | Vẫn `LINKED` — **không đổi** | `FEAT` AC-21(b) · `BR-DPL-SYN-002` |
| `data.processedAt` / `processedByLabel` / `reason` | — | **Giữ nguyên** giá trị lúc Duyệt — KHÔNG ghi đè | `FEAT` AC-21(c) · `BR-DPL-SYN-002` |
| `data.syncedAt` | ISO-8601 | Thời điểm ghi outbox lần này — **không** persist vào `partner_link_request`, chỉ echo cho UI; không có AC nào yêu cầu hiển thị lịch sử đồng bộ | `FEAT` AC-21(a) |
| `data.garageProfile` / `invoiceInfo` | — | Bản **vừa đọc real-time** và vừa đẩy đi — FE dùng để refresh section C | `FEAT` AC-21(a) · CB-SYS-006 |

FE toast `Đã đồng bộ thông tin sang Driver Plus thành công.` (`FEAT` AC-21(c)).

**(5) Response 4xx/5xx**

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-system.PARTNER_LINK.AUTH_401` / `.AUTH_403` | 401 / 403 | Auth / tenant |
| `GMS.gf-system.PARTNER_LINK.FLAG_OFF` | 403 | Feature flag off |
| `GMS.gf-system.PARTNER_LINK.VAL_400` | 400 | `requestCode` sai pattern |
| `GMS.gf-system.PARTNER_LINK.NF_404` | 404 | Không tìm thấy `(tenantId, requestCode)` |
| `ERR-DPL-004` | 409 | Record không còn ở `LINKED` (vừa bị Hủy hoặc D+ unlink) |
| `ERR-DPL-005` | 503 | Lỗi hệ thống |

**(6) Semantics**

- **Idempotency**: **an toàn khi gọi lặp** — không đổi state, mỗi lần gọi ghi thêm 1 outbox event `PROFILE.SYNC`; Driver Plus áp last-write-wins theo `occurredAt`. State guard `WHERE status='LINKED'`.
- **Permission gate**: dual persona ngang quyền.
- **Performance**: p95 ≤ 400ms. 3 lookup unique-key (record + `tenant_profile` + `tenant_invoice_info`) + 1 insert outbox. KHÔNG cache — bắt buộc real-time (CB-SYS-006).
- **Side-effect**: 1 outbox event `PARTNER_LINK.PROFILE.SYNC` `syncTrigger=MANUAL_RESYNC`. **KHÔNG** publish `STATUS.CHANGED` (không có state change → không có noti, `BR-DPL-NOTI-*` chỉ liệt kê 4 loại state-change).

### POST `/api/v1/system/partner-links/{requestCode}/cancel`

Garage hủy liên kết đang hoạt động, kèm lý do bắt buộc. Khối "THÔNG TIN XỬ LÝ" bị **ghi đè**.

**(1) Headers**

| Header | Required | Note |
|---|---|---|
| `Authorization: Bearer <jwt>` | Yes | User JWT — dựng `processedByLabel` |
| `X-Tenant-Id` | Yes | Trace/log |
| `X-Branch-Id` | No | Không branch-scoped |

**(2) Path / Query params**

| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `requestCode` | String | Yes | Pattern `^LKD-\d{4}-\d{3,}$`; phải đang ở `status=LINKED` | `BR-DPL-CAN-001` · `FEAT` AC-22 |

**(3) Request body** — `application/json`

```json
{ "reason": "Đổi sang tài khoản Driver Plus khác." }
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `reason` | String | Yes | Sau `trim` phải không rỗng; không có min-length; tối đa **2.000 ký tự**. Vượt giới hạn trả `ERR-DPL-012` | `BR-DPL-CAN-002` · `FEAT` AC-23 |

**(4) Response 2xx** — `200 OK`

```json
{
  "data": {
    "requestCode": "LKD-2026-001",
    "status": "UNLINKED",
    "processedAt": "2026-08-05T10:00:00Z",
    "processedByLabel": "Đăng Vinh (Chủ garage)",
    "reason": "Đổi sang tài khoản Driver Plus khác.",
    "availableActions": []
  }
}
```

| Field | Type | Note | Cite |
|---|---|---|---|
| `data.status` | Enum | Luôn `UNLINKED` (terminal) | `FEAT` AC-24(a) |
| `data.processedAt` / `processedByLabel` / `reason` | — | **Ghi ĐÈ** thông tin lúc Duyệt (record chỉ giữ action gần nhất) | `FEAT` AC-24(b) · `BR-DPL-CAN-003` |
| `data.availableActions` | Enum[] | Luôn `[]` | `FEAT` AC-24(d) |

FE toast `Đã hủy liên kết Driver Plus.` (`FEAT` AC-24(c)). Sau khi 200, garage trở về trạng thái trống → Driver Plus gửi được yêu cầu mới (`FEAT` AC-24(e)).

**(5) Response 4xx/5xx**

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-system.PARTNER_LINK.AUTH_401` / `.AUTH_403` | 401 / 403 | Auth / tenant |
| `GMS.gf-system.PARTNER_LINK.FLAG_OFF` | 403 | Feature flag off |
| `ERR-DPL-002` | 400 | `reason` rỗng hoặc chỉ khoảng trắng (`VLD-DPL-002`) |
| `ERR-DPL-012` | 400 | `reason` vượt 2.000 ký tự (`VLD-DPL-006`) |
| `GMS.gf-system.PARTNER_LINK.VAL_400` | 400 | `requestCode` sai pattern |
| `GMS.gf-system.PARTNER_LINK.NF_404` | 404 | Không tìm thấy `(tenantId, requestCode)` |
| `ERR-DPL-004` | 409 | Record không còn ở `LINKED` (D+ vừa unlink, hoặc user khác vừa hủy) |
| `ERR-DPL-005` | 503 | Lỗi hệ thống |

**(6) Semantics**

- **Idempotency**: state-guarded `WHERE status='LINKED'`; gọi lặp → `409 ERR-DPL-004`.
- **Permission gate**: dual persona ngang quyền.
- **Performance**: p95 ≤ 400ms. Index: `uk_plr_tenant_request_code`. Sau transaction, partial unique `uk_plr_tenant_active_link` tự giải phóng slot cho tenant.
- **Side-effect**: 1 outbox event `PARTNER_LINK.STATUS.CHANGED` `notificationType=UNLINKED` (wording `BR-DPL-NOTI-004` kèm lý do + mốc thời gian). **KHÔNG** publish `PROFILE.SYNC` (không còn liên kết để đồng bộ dữ liệu).

---

## 4. Forbidden Patterns

- Không bypass `SecurityUtils.getCurrentTenantIdAsLong()` ở public APIs để đọc `tenantId` từ body/header — phá vỡ tenant isolation của transporter registry.
- Không hard-delete `tenant_transporter_registry` hoặc `tenant_invoice_info` — domain dùng soft delete + version, audit/event downstream phụ thuộc record còn lại.
- Không overwrite tenant invoice info đã có trong luồng `upsertFromGarage` (chỉ fill missing); logic patch đầy đủ là trách nhiệm của command listener `upsertFromCop`, không phải REST endpoint garage.
- Không expose protected endpoints `/protected/v1/*` ra public gateway hoặc cho client end-user.
- Không thay đổi tên topic Kafka mà chưa cập nhật consumer ở downstream services (gf-purchase, gf-accounting, gf-inventory) và cấu hình môi trường tương ứng (`kafka.topics.*`).
- Không thay đổi shape `ApiResponse<T>` / `PagedApiResponse<T>` cho transporter endpoints, hoặc thêm wrapper cho invoice info endpoints, mà chưa cập nhật client contract.
- Không emit transporter event mà bỏ qua outbox (publish trực tiếp Kafka) — phá vỡ guarantee atomic với DB transaction.
- ❌ **(W07)** Expose endpoint tạo `partner_link_request` từ garage (`POST /partner-links`) — record chỉ sinh từ inbound Kafka Driver Plus (`BR-DPL-CMN-001`, `BR-GF-SYSTEM.md` §4.2).
- ❌ **(W07)** Snapshot khối `garageProfile`/`invoiceInfo` vào `partner_link_request` lúc Duyệt rồi trả lại từ snapshot — phải đọc real-time mỗi request (CB-SYS-006, `BR-DPL-SYN-002`).
- ❌ **(W07)** Cache (Redis/in-process) khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS" — CB-SYS-006 cấm cache trung gian.
- ❌ **(W07)** Thực hiện cascade auto-reject ở transaction riêng sau khi commit Duyệt — phải all-or-nothing trong 1 transaction (`BR-DPL-APV-004`, `FEAT` EC-3).
- ❌ **(W07)** Hard-delete / archive record terminal `REJECTED`/`UNLINKED` — giữ vĩnh viễn trong DB active (`BR-DPL-CMN-006`).
- ❌ **(W07)** Ghi `processedByLabel` bằng reference động vào bảng nhân viên — phải snapshot text tại thời điểm xử lý (`BR-DPL-CMN-005`, `FEAT` AC-30).
- ❌ Field không có trong §5 Naming Registry (alien field) — Reviewer G11 P0.
- ❌ Rename canonical field ở BFF/FE/Mobile — 1 concept ↔ 1 name across 4 tier.

---

## 5. Naming Registry (cross-tier canonical names)

> **Rule (Reviewer G11 enforce — P0)**: 1 concept ↔ 1 canonical name across BE / BFF / FE / Mobile. BFF file [`agg-garage-graph-graphql.md`](agg-garage-graph-graphql.md) **KHÔNG lặp** registry — reference `See gf-system-api.md §5`.
>
> Phạm vi hiện tại: **domain Partner Link (W07)**. Các module baseline (transporter registry, invoice info) chưa backfill registry — nợ kỹ thuật riêng, không thuộc scope W07.

### 5.1. DTO fields

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Mã yêu cầu liên kết (`LKD-YYYY-NNN`) | `requestCode` | `requestCode: String!` | `requestCode: string` | `requestCode` | `FEAT-SYS-DRIVERPLUS-LINK` AC-4 · `EP-PARTNER-LINK` §3 |
| Đối tác | `partnerCode` | `partnerCode: PartnerCode!` | `partnerCode: PartnerCode` | `partnerCode` | `FEAT` §4 |
| Tên tài khoản Driver Plus | `partnerAccountName` | `partnerAccountName: String!` | `partnerAccountName: string` | `partnerAccountName` | `FEAT` AC-4, AC-9 |
| Số điện thoại (tài khoản D+) | `partnerAccountPhone` | `partnerAccountPhone: String!` | `partnerAccountPhone: string` | `partnerAccountPhone` | `FEAT` AC-4, AC-9 |
| Ngày gửi yêu cầu | `requestedAt` | `requestedAt: DateTime!` | `requestedAt: string` | `requestedAt` | `FEAT` AC-4, AC-9 · `BR-DPL-LST-002` |
| Trạng thái liên kết | `status` | `status: PartnerLinkStatus!` | `status: PartnerLinkStatus` | `status` | `BR-GF-SYSTEM` §3.2 |
| Ngày xử lý | `processedAt` | `processedAt: DateTime` | `processedAt: string \| null` | `processedAt` | `FEAT` AC-10 |
| Người thực hiện | `processedByLabel` | `processedByLabel: String` | `processedByLabel: string \| null` | `processedByLabel` | `BR-DPL-CMN-005` · `BR-DPL-LST-005` (mobile card) |
| Lý do | `reason` | `reason: String` | `reason: string \| null` | `reason` | `FEAT` AC-10, AC-18, AC-23 |
| Nút hành động khả dụng | `availableActions` | `availableActions: [PartnerLinkAction!]!` | `availableActions: PartnerLinkAction[]` | `availableActions` | `FEAT` AC-8 (state guard) |
| Danh sách bị auto-reject | `autoRejectedRequestCodes` | `autoRejectedRequestCodes: [String!]!` | `autoRejectedRequestCodes: string[]` | `autoRejectedRequestCodes` | `FEAT` AC-16 · `BR-DPL-APV-004` |
| Đồng ý điều khoản | `termsAccepted` | `termsAccepted: Boolean!` | `termsAccepted: boolean` | `termsAccepted` | `BR-DPL-APV-002` · `FEAT` AC-13/AC-14 |
| Tên doanh nghiệp | `businessName` | `businessName: String` | `businessName: string \| null` | `businessName` | `FEAT` AC-11 (block THÔNG TIN DOANH NGHIỆP) |
| SĐT liên hệ | `contactPhoneNumber` | `contactPhoneNumber: String` | `contactPhoneNumber: string \| null` | `contactPhoneNumber` | `FEAT` AC-11 |
| Địa chỉ chi tiết | `addressDetail` | `addressDetail: String` | `addressDetail: string \| null` | `addressDetail` | `FEAT` AC-11 (block ĐỊA CHỈ) |
| Xã/Phường | `ward` | `ward: String` | `ward: string \| null` | `ward` | `FEAT` AC-11 · `gf-system-events.md` §3.1 |
| Tỉnh/Thành phố | `city` | `city: String` | `city: string \| null` | `city` | `FEAT` AC-11 · `gf-system-events.md` §3.1/§3.2 (canonical boundary vocabulary — **KHÔNG** dùng `province`) |
| Tên công ty (hoá đơn) | `companyName` | `companyName: String` | `companyName: string \| null` | `companyName` | `FEAT` AC-11 (i) · `gf-system-data-model.md` §2 `tenant_invoice_info` |
| Mã số thuế | `taxCode` | `taxCode: String` | `taxCode: string \| null` | `taxCode` | `FEAT` AC-11 (ii) |
| Địa chỉ xuất HĐ | `companyAddress` | `companyAddress: String` | `companyAddress: string \| null` | `companyAddress` | `FEAT` AC-11 (iii) — 1 chuỗi đơn, **khác** `addressDetail` |
| Email nhận HĐ | `companyEmailAddress` | `companyEmailAddress: String` | `companyEmailAddress: string \| null` | `companyEmailAddress` | `FEAT` AC-11 (iv) |
| Thời điểm đồng bộ | `syncedAt` | `syncedAt: DateTime!` | `syncedAt: string` | `syncedAt` | `FEAT` AC-21(a) |
| Tổng số yêu cầu (sau filter) | `totalItems` | `totalItems: Int!` | `totalItems: number` | `totalItems` | `FEAT` AC-41 ("{N} yêu cầu") |
| Danh sách bị cắt bởi cap | `truncated` | `truncated: Boolean!` | `truncated: boolean` | `truncated` | Design guard cho `BR-DPL-LST-004` (no-pagination) |

**Event payload cross-check** — field trong [`gf-system-events.md`](../events/gf-system-events.md) §3.11–§3.14 dùng **cùng** canonical name: `requestCode`, `partnerCode`, `partnerAccountName`, `partnerAccountPhone`, `requestedAt`, `status`/`fromStatus`/`toStatus`, `processedAt`, `reason`, `businessName`, `contactPhoneNumber`, `addressDetail`, `ward`, `city`, `companyName`, `taxCode`, `companyAddress`, `companyEmailAddress`. **DB column cross-check** ([`gf-system-data-model.md`](../data/gf-system-data-model.md) §2bis): `request_code`, `partner_code`, `partner_account_name`, `partner_account_phone`, `requested_at`, `status`, `processed_at`, `processed_by_label`, `reason`, `business_name`, `contact_phone_number`, `address_detail`, `ward`, `city`.

### 5.2. Enums (full values verbatim)

| Enum type | Values | Cite |
|---|---|---|
| `PartnerLinkStatus` | `PENDING \| LINKED \| REJECTED \| UNLINKED` | `BR-GF-SYSTEM.md` §3.2 (diagram ghi rõ 4 mã) |
| `PartnerLinkStatus` — nhãn hiển thị VN (FE/Mobile) | `PENDING`→"Chờ liên kết" (badge cam) · `LINKED`→"Đã liên kết" (xanh lá) · `REJECTED`→"Từ chối" (đỏ) · `UNLINKED`→"Đã hủy liên kết" (đỏ đậm) | `FEAT` AC-4 · `EP-PARTNER-LINK` §3 |
| `PartnerCode` | `DRIVER_PLUS` | `FEAT` §4 · §7 Out of Scope (giai đoạn 1 hard-code 1 đối tác) |
| `PartnerLinkAction` | `APPROVE \| REJECT \| RESYNC \| CANCEL` | `FEAT` AC-8 (4 nút hành động) |
| `PartnerLinkNotificationType` | `APPROVED \| REJECTED \| AUTO_REJECTED \| UNLINKED` | `BR-DPL-NOTI-001..004` · `FEAT` AC-36..AC-39 |
| `PartnerLinkSyncTrigger` | `APPROVED \| MANUAL_RESYNC` | `FEAT` AC-15(c) vs AC-21(a) |

> **Naming note (T6 resolved, Product sync 2026-08-10)**: hành động "Từ chối" dùng **`REJECT`/`REJECTED`** thống nhất ở cả 4 tier + GraphQL `rejectPartnerLinkRequest` + REST path `/reject` + status enum + mã lỗi `ERR-DPL-001` + prefix BR `BR-DPL-REJ-*`. `FEAT` §4 đã bỏ tên đề xuất `DeclinePartnerLinkRequest` và đồng bộ đủ 6 operation canonical.

### 5.3. Path params

| Path param | Type | Canonical name (mọi tier) | Cite |
|---|---|---|---|
| `{requestCode}` | String (`LKD-YYYY-NNN`) | `requestCode` — **KHÔNG** viết tắt thành `code`/`lkdCode`/`id` ở tier khác; **KHÔNG** dùng numeric `id` (business key là mã LKD, hiển thị trực tiếp trên UI) | `FEAT` AC-4, AC-8 · `EP-PARTNER-LINK` §3 |

---

## 6. References

- HLD: [gf-system-HLD.md](../hld/gf-system-HLD.md)
- Events: [gf-system-events.md](../events/gf-system-events.md) — §3.7 invoice info · §3.8 transporter registry · **§3.11–§3.14 Partner Link (W07)**. Topic Kafka: `tenant-transporter-registry`, `tenant-invoice-info`, `branch-lifecycle`, **`partner-link-events`**.
- Data model: [gf-system-data-model.md](../data/gf-system-data-model.md) — **§2bis `partner_link_request` + `tenant_profile` (W07, V7/V8)**
- Integration: [INTEG-EXT-driver-plus.md](../integrations/INTEG-EXT-driver-plus.md) · [INTEG-BFF-agg-garage-graph.md](../integrations/INTEG-BFF-agg-garage-graph.md)
- ADR: **ADR-029** (giao thức Driver Plus) · **ADR-030** (tenant profile SoT) · ADR-004 (Kafka) · ADR-006 (Flyway) · ADR-009 (JPA no relationship)
- BR: **`BR-GF-SYSTEM.md` §1 CB-SYS-004..009 · §2.5 BR-DPL-* · §3.2 · §4.2 · §5.5** · `Product/Commons/ERROR-CODE-REGISTRY.md` §5 (`ERR-DPL-001..012`)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-10 | v3.3 | Chốt validation `reason` cho reject/cancel tối đa 2.000 ký tự theo Product v31/BR v21; thay generic `VAL_400` bằng domain code `ERR-DPL-012` cho case vượt giới hạn. Không đổi min-length. |
| 2026-08-10 | v3.2 | Đồng bộ Product API naming: `FEAT-SYS-DRIVERPLUS-LINK` §4 đã chốt 6 GraphQL operation/REST path canonical; xóa ghi chú stale rằng Product còn `NEED NAMING` và đề xuất `DeclinePartnerLinkRequest`. Canonical giữ `rejectPartnerLinkRequest`/`/reject`. Cập nhật error registry cite đến `ERR-DPL-011`. |
| 2026-08-07 | v3.1 | **ARCH-REVIEW-W07 P2 fix** — 3 cite `gf-system-events.md §3.10–§3.13`/`§3.12/§3.13` → **§3.11–§3.14**/`§3.13/§3.14` (§3bis approve endpoint side-effect note, §5.1 event payload cross-check, §6 References), theo renumber gf-system-events.md v5. |
| 2026-08-05 | v3 | **W07 EP-PARTNER-LINK (DESIGN)** — thêm §3bis với **6 endpoint** partner-link (`GET /partner-links` · `GET /{requestCode}` · `POST /{requestCode}/approve` · `/reject` · `/resync` · `/cancel`), mỗi endpoint đủ **6 khối** (Headers · Params · Request + JSON example · Response 2xx + schema table · Response 4xx/5xx · Semantics). §2 Endpoint Summary +6 row (9-14). Thêm **§5 Naming Registry** (5.1 DTO 24 concept · 5.2 enum 6 loại full values · 5.3 path param) — §5 References cũ renumber → **§6**. §4 Forbidden +8 pattern W07. Quyết định kiến trúc chốt trong đợt này: (a) trả lời `FEAT` AC-31 + EC-3 `NEED CONFIRMATION Architecture` — invariant `BR-DPL-CMN-002` enforce bằng **partial unique index** `uk_plr_tenant_active_link (tenant_id) WHERE status='LINKED'` + cascade all-or-nothing trong 1 transaction; (b) `availableActions` server-derived thay vì FE tự suy từ status; (c) mã lỗi nghiệp vụ dùng trực tiếp `ERR-DPL-*` từ registry (1 nguồn cho FE/mobile), mã hạ tầng giữ pattern `GMS.gf-system.*`; (d) canonical `reject` (không `decline`) + `city` (không `province`). Cite ADR-029 + ADR-030. **KHÔNG đụng**: §1 Thông tin chung, §2 rows 1-8, §3 (8 endpoint baseline transporter + invoice info). v2 → v3. |
| 2026-05-20 | v2 | Source audit: bổ sung 2 GET endpoints thiếu (`GET /{id}`, `GET /cop-transporter-registry/{copTransporterRegistryId}`); sửa DELETE response từ `null` → trả entity đã xóa; thêm error code `TRANSPORTER_DELETE.03` (409 — route đang dùng trong purchase order, check qua `gf-purchase` HTTP call); cập nhật Downstream (gọi `gf-purchase` qua HTTP); thêm row Feature flag (`Purchase:PurchaseV02`). Endpoint count 6 → 8. |
| 2026-05-07 | v1 | Initial API spec cho `gf-system`: REST/JSON với public APIs (`/api/v1/system`, authenticated qua `SecurityUtils.getCurrentTenantIdAsLong()`) cho tenant transporter registry CRUD + search (chống trùng theo `tenantId+routeContactPhoneNumber`); cộng protected APIs (`/protected/v1`, service-to-service qua header `X-Tenant-Id` thay vì `x-api-key`) cho tenant invoice info read/upsert (idempotent theo `tenantId`). Branch và tenant subscription được seed từ Kafka event chứ không có REST endpoint. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
