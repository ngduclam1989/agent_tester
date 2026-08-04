---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-shipment
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-shipment-HLD.md"
---

# REST API - `gf-shipment`

> API contract cho boundary `gf-shipment`, cung cấp protected shipment order lookup và status update cho các service nội bộ.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-shipment` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | Không có |
| Protected prefixes | `/protected/v1` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `POST` | `/protected/v1/shipment-orders` | InternalShipmentOrder | service-to-service |
| 2 | `POST` | `/protected/v1/shipment-orders/status` | InternalShipmentOrder | service-to-service |

---

## 3. Endpoint Details

### POST `/protected/v1/shipment-orders`

Tạo mới internal shipment order. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "SHP-20260506-0001",
    "status": "ACTIVE",
    "name": "InternalShipmentOrder mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/shipment-orders/status`

Lấy dữ liệu internal shipment order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SHP-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-shipment.INTERNAL_SHIPMENT_ORDER_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-shipment-HLD.md](../hld/gf-shipment-HLD.md)
- Events: Chưa có tài liệu events tương ứng.
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-shipment`: REST/JSON internal-only (không có public prefix), tất cả endpoint dưới `/protected/v1` dùng `x-api-key` service-to-service convention. Cung cấp internal shipment order create và shipment order status update phục vụ inventory/purchase downstream khi cần phối hợp giao nhận hàng. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
