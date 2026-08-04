---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: gf-system
last_reviewed: "2026-05-20"
depends_on:
  - "../hld/gf-system-HLD.md"
---

# REST API - `gf-system`

> API contract cho boundary `gf-system`, tập trung vào tenant master/support data: tenant transporter registry (CRUD + search) và tenant invoice info (read + upsert qua service-to-service). Branch và tenant subscription được seed từ Kafka event chứ không có REST endpoint.

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

## 4. Forbidden Patterns

- Không bypass `SecurityUtils.getCurrentTenantIdAsLong()` ở public APIs để đọc `tenantId` từ body/header — phá vỡ tenant isolation của transporter registry.
- Không hard-delete `tenant_transporter_registry` hoặc `tenant_invoice_info` — domain dùng soft delete + version, audit/event downstream phụ thuộc record còn lại.
- Không overwrite tenant invoice info đã có trong luồng `upsertFromGarage` (chỉ fill missing); logic patch đầy đủ là trách nhiệm của command listener `upsertFromCop`, không phải REST endpoint garage.
- Không expose protected endpoints `/protected/v1/*` ra public gateway hoặc cho client end-user.
- Không thay đổi tên topic Kafka mà chưa cập nhật consumer ở downstream services (gf-purchase, gf-accounting, gf-inventory) và cấu hình môi trường tương ứng (`kafka.topics.*`).
- Không thay đổi shape `ApiResponse<T>` / `PagedApiResponse<T>` cho transporter endpoints, hoặc thêm wrapper cho invoice info endpoints, mà chưa cập nhật client contract.
- Không emit transporter event mà bỏ qua outbox (publish trực tiếp Kafka) — phá vỡ guarantee atomic với DB transaction.

---

## 5. References

- HLD: [gf-system-HLD.md](../hld/gf-system-HLD.md)
- Events: Chưa có tài liệu events tương ứng. Topic Kafka: `tenant-transporter-registry`, `tenant-invoice-info`, `branch-lifecycle`.
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-20 | v2 | Source audit: bổ sung 2 GET endpoints thiếu (`GET /{id}`, `GET /cop-transporter-registry/{copTransporterRegistryId}`); sửa DELETE response từ `null` → trả entity đã xóa; thêm error code `TRANSPORTER_DELETE.03` (409 — route đang dùng trong purchase order, check qua `gf-purchase` HTTP call); cập nhật Downstream (gọi `gf-purchase` qua HTTP); thêm row Feature flag (`Purchase:PurchaseV02`). Endpoint count 6 → 8. |
| 2026-05-07 | v1 | Initial API spec cho `gf-system`: REST/JSON với public APIs (`/api/v1/system`, authenticated qua `SecurityUtils.getCurrentTenantIdAsLong()`) cho tenant transporter registry CRUD + search (chống trùng theo `tenantId+routeContactPhoneNumber`); cộng protected APIs (`/protected/v1`, service-to-service qua header `X-Tenant-Id` thay vì `x-api-key`) cho tenant invoice info read/upsert (idempotent theo `tenantId`). Branch và tenant subscription được seed từ Kafka event chứ không có REST endpoint. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
