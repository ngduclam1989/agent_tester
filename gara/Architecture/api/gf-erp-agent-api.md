---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-erp-agent
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-erp-agent-HLD.md"
---

# REST API - `gf-erp-agent`

> API contract cho boundary `gf-erp-agent`, cung cấp các protected APIs để tiếp nhận purchase request, quotation ask và preliminary quotation từ các service nghiệp vụ.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-erp-agent` |
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
| 1 | `POST` | `/protected/v1/batch/inbound` | InternalBatch | service-to-service |
| 2 | `POST` | `/protected/v1/batch/inbound-notification` | InternalBatch | service-to-service |
| 3 | `POST` | `/protected/v1/batch/outbound` | InternalBatch | service-to-service |
| 4 | `POST` | `/protected/v1/batch/outbound-notification` | InternalBatch | service-to-service |
| 5 | `POST` | `/protected/v1/pricing` | PricingRequest | service-to-service |
| 6 | `POST` | `/protected/v1/purchases` | PurchaseRequest | service-to-service |
| 7 | `PUT` | `/protected/v1/purchases/cancel` | PurchaseRequest | service-to-service |
| 8 | `POST` | `/protected/v1/purchases/confirm` | PurchaseRequest | service-to-service |
| 9 | `POST` | `/protected/v1/purchases/confirm-received` | PurchaseRequest | service-to-service |
| 10 | `POST` | `/protected/v1/quotation-asks` | QuotationAsk | service-to-service |

---

## 3. Endpoint Details

### POST `/protected/v1/batch/inbound`

Tạo mới internal batch. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
  "data": [
    {
      "id": 51001,
      "code": "IB-20260506-0001",
      "status": "ACTIVE",
      "name": "InternalBatch mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/batch/inbound-notification`

Tạo mới internal batch. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
  "data": [
    {
      "id": 51001,
      "code": "NOTI-20260506-0001",
      "status": "ACTIVE",
      "name": "InternalBatch mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/batch/outbound`

Tạo mới internal batch. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
  "data": [
    {
      "id": 51001,
      "code": "IB-20260506-0001",
      "status": "ACTIVE",
      "name": "InternalBatch mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/batch/outbound-notification`

Tạo mới internal batch. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
  "data": [
    {
      "id": 51001,
      "code": "NOTI-20260506-0001",
      "status": "ACTIVE",
      "name": "InternalBatch mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.INTERNAL_BATCH_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/pricing`

Tạo mới pricing request. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PR-20260506-0001",
    "status": "ACTIVE",
    "name": "PricingRequest mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.PRICING_REQUEST_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.PRICING_REQUEST_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.PRICING_REQUEST_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.PRICING_REQUEST_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.PRICING_REQUEST_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.PRICING_REQUEST_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/purchases`

Tạo mới purchase request. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequest mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchases/cancel`

Hủy purchase request theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequest mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CANCEL.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/purchases/confirm`

Xác nhận purchase request, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequest mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/purchases/confirm-received`

Xác nhận purchase request, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequest mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.PURCHASE_REQUEST_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/quotation-asks`

Tạo mới quotation ask. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "QA-20260506-0001",
    "status": "ACTIVE",
    "name": "QuotationAsk mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-agent.QUOTATION_ASK_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-agent.QUOTATION_ASK_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-agent.QUOTATION_ASK_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-agent.QUOTATION_ASK_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-agent.QUOTATION_ASK_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-agent.QUOTATION_ASK_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md)
- Events: [gf-erp-agent-events.md](../events/gf-erp-agent-events.md)
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-erp-agent`: REST/JSON internal-only (không có public prefix), tất cả endpoint dưới `/protected/v1` dùng `x-api-key` service-to-service convention. Bao phủ inbound/outbound batch và batch-notification (`/batch/...`), pricing request, purchase request lifecycle (create, confirm, confirm-received, cancel) và quotation ask intake từ ERP downstream. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
