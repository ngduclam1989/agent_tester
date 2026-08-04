---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-worker
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-worker-HLD.md"
---

# REST API - `gf-worker`

> API contract cho boundary `gf-worker`, cung cấp protected worker APIs cho policy sync, cache validation và background integration operations.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-worker` |
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
| 1 | `GET` | `/protected/v1/jobs` | JobConfig | service-to-service |
| 2 | `POST` | `/protected/v1/jobs` | JobConfig | service-to-service |
| 3 | `DELETE` | `/protected/v1/jobs/{id}` | JobConfig | service-to-service |
| 4 | `PUT` | `/protected/v1/jobs/{id}` | JobConfig | service-to-service |
| 5 | `POST` | `/protected/v1/jobs/emergency/disable-all` | JobConfig | service-to-service |
| 6 | `POST` | `/protected/v1/jobs/emergency/enable-all` | JobConfig | service-to-service |
| 7 | `POST` | `/protected/v1/jobs/reload` | JobConfig | service-to-service |
| 8 | `POST` | `/protected/v1/jobs/schedule/disable` | JobConfig | service-to-service |
| 9 | `POST` | `/protected/v1/jobs/schedule/enable` | JobConfig | service-to-service |

---

## 3. Endpoint Details

### GET `/protected/v1/jobs`

Lấy dữ liệu job config theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
  "data": [
    {
      "id": 51001,
      "code": "JOB-20260506-0001",
      "status": "ACTIVE",
      "name": "JobConfig mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-worker.JOB_CONFIG_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/jobs`

Tạo mới job config. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "jobName": "JobConfig mẫu",
    "contentType": "STANDARD",
    "timeoutSeconds": "2026-05-06T10:30:00+07:00",
    "cronExpression": "job-config-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "isActive": true,
    "retryCount": 1001,
    "baseUrl": "https://files.garage.example/documents/sample.pdf",
    "httpMethod": "job-config-sample-20260506",
    "endpointPath": "2026-05-06T10:30:00+07:00",
    "requestHeaders": "job-config-sample-20260506",
    "targetService": "job-config-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/jobs/{id}`

Xóa hoặc vô hiệu hóa job config theo định danh được cung cấp.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "JOB-20260506-0001",
    "status": "ACTIVE",
    "name": "JobConfig mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/jobs/{id}`

Cập nhật job config theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "jobName": "JobConfig mẫu",
    "contentType": "STANDARD",
    "timeoutSeconds": "2026-05-06T10:30:00+07:00",
    "cronExpression": "job-config-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "isActive": true,
    "retryCount": 1001,
    "baseUrl": "https://files.garage.example/documents/sample.pdf",
    "httpMethod": "job-config-sample-20260506",
    "endpointPath": "2026-05-06T10:30:00+07:00",
    "requestHeaders": "job-config-sample-20260506",
    "targetService": "job-config-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/jobs/emergency/disable-all`

Tạo mới job config. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "JOB-20260506-0001",
    "status": "ACTIVE",
    "name": "JobConfig mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/jobs/emergency/enable-all`

Tạo mới job config. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "JOB-20260506-0001",
    "status": "ACTIVE",
    "name": "JobConfig mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/jobs/reload`

Tạo mới job config. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "executed": true,
    "affectedKeys": 12
  }
}
```

**Side-effect**: làm mới hoặc xóa cache nội bộ phục vụ đồng bộ dữ liệu.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/jobs/schedule/disable`

Tạo mới job config. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "JOB-20260506-0001",
    "status": "ACTIVE",
    "name": "JobConfig mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/jobs/schedule/enable`

Tạo mới job config. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "JOB-20260506-0001",
    "status": "ACTIVE",
    "name": "JobConfig mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-worker.JOB_CONFIG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-worker.JOB_CONFIG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-worker-HLD.md](../hld/gf-worker-HLD.md)
- Events: Chưa có tài liệu events tương ứng.
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-worker`: REST/JSON internal-only (không có public prefix), tất cả endpoint dưới `/protected/v1` dùng `x-api-key` service-to-service convention. Cung cấp job config CRUD (`/jobs`), reload config, schedule enable/disable từng job và emergency enable-all/disable-all để vận hành policy sync, cache validation và background integration jobs. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
