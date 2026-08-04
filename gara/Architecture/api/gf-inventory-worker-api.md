---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory-worker
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-inventory-worker-HLD.md"
---

# REST API - `gf-inventory-worker`

> API contract cho boundary `gf-inventory-worker`, cung cấp protected worker APIs cho inventory aggregation, reservation, stock calculation và product summary.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-inventory-worker` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | Không có |
| Protected prefixes | `/protected/v2`, `/protected/workflows` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `POST` | `/protected/v2/period-closure/operator/cancel/{workflowId}` | PeriodClosureOperator | service-to-service |
| 2 | `POST` | `/protected/v2/period-closure/operator/mark-all-failed` | PeriodClosureOperator | service-to-service |
| 3 | `POST` | `/protected/v2/period-closure/operator/mark-for-retry` | PeriodClosureOperator | service-to-service |
| 4 | `GET` | `/protected/v2/period-closure/operator/result/{workflowId}` | PeriodClosureOperator | service-to-service |
| 5 | `GET` | `/protected/v2/period-closure/operator/stats` | PeriodClosureOperator | service-to-service |
| 6 | `GET` | `/protected/v2/period-closure/operator/status/{workflowId}` | PeriodClosureOperator | service-to-service |
| 7 | `POST` | `/protected/v2/period-closure/operator/trigger` | PeriodClosureOperator | service-to-service |
| 8 | `POST` | `/protected/workflows/reservation-expiry/{deliveryCode}/fulfill` | ReservationWorker | service-to-service |
| 9 | `POST` | `/protected/workflows/reservation-expiry/{deliveryCode}/release` | ReservationWorker | service-to-service |
| 10 | `POST` | `/protected/workflows/reservation-expiry/start` | ReservationWorker | service-to-service |

---

## 3. Endpoint Details

### POST `/protected/v2/period-closure/operator/cancel/{workflowId}`

Hủy period closure operator theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "workflowId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PCO-20260506-0001",
    "status": "ACTIVE",
    "name": "PeriodClosureOperator mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CANCEL.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/operator/mark-all-failed`

Tạo mới period closure operator. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PCO-20260506-0001",
    "status": "ACTIVE",
    "name": "PeriodClosureOperator mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/operator/mark-for-retry`

Tạo mới period closure operator. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PCO-20260506-0001",
    "status": "ACTIVE",
    "name": "PeriodClosureOperator mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/operator/result/{workflowId}`

Lấy dữ liệu period closure operator theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "workflowId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "totalWarehouses": 2500000,
    "successCount": 1001,
    "failedCount": 1001,
    "workflowId": 51001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/operator/stats`

Lấy dữ liệu period closure operator theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "periodCode": "PCO-20260506-0001",
    "totalWarehouses": 2500000,
    "totalRecordsClosed": 2500000,
    "totalRecordsCreated": "2026-05-06T10:30:00+07:00",
    "successCount": 1001,
    "failedCount": 1001,
    "pendingCount": 1001,
    "runningCount": 1001,
    "pendingRetryCount": 1001,
    "avgDurationMs": "2026-05-06T10:30:00+07:00",
    "message": "period-closure-operator-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v2/period-closure/operator/status/{workflowId}`

Lấy dữ liệu period closure operator theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "workflowId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "PCO-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_STATUS.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v2/period-closure/operator/trigger`

Tạo mới period closure operator. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "periodCode": "PCO-20260506-0001",
    "status": "ACTIVE",
    "workflowId": 51001,
    "message": "period-closure-operator-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.PERIOD_CLOSURE_OPERATOR_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/workflows/reservation-expiry/{deliveryCode}/fulfill`

Tạo mới reservation worker. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "deliveryCode": "RW-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "RW-20260506-0001",
    "status": "ACTIVE",
    "name": "ReservationWorker mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/workflows/reservation-expiry/{deliveryCode}/release`

Tạo mới reservation worker. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "deliveryCode": "RW-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "RW-20260506-0001",
    "status": "ACTIVE",
    "name": "ReservationWorker mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/workflows/reservation-expiry/start`

Lấy dữ liệu reservation worker theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "RW-20260506-0001",
    "status": "ACTIVE",
    "name": "ReservationWorker mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory-worker.RESERVATION_WORKER_START.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_START.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_START.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_START.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_START.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-inventory-worker.RESERVATION_WORKER_START.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md)
- Events: Chưa có tài liệu events tương ứng.
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-inventory-worker`: REST/JSON internal-only (không có public prefix), tất cả endpoint dưới `/protected/v2` và `/protected/workflows` dùng `x-api-key` service-to-service. Cung cấp period closure operator (trigger, status/result theo workflowId, stats, cancel, mark-for-retry, mark-all-failed) và reservation expiry workflow (start, fulfill/release theo deliveryCode) phục vụ inventory background processing. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
