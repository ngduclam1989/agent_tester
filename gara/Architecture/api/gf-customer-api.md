---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-customer
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-customer-HLD.md"
---

# REST API - `gf-customer`

> API contract cho boundary `gf-customer`, quản lý customer profile, vehicle profile, interaction, maintenance segmentation và các API protected phục vụ đồng bộ customer/vehicle.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-customer` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1` |
| Protected prefixes | `/protected/v1`, `/protected/validation-cache` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `POST` | `/api/v1/customers` | Customer | authenticated |
| 2 | `POST` | `/api/v1/customers/{customerId}/interactions` | Interaction | authenticated |
| 3 | `GET` | `/api/v1/customers/{customerId}/interactions/{interactionId}` | Interaction | authenticated |
| 4 | `PUT` | `/api/v1/customers/{customerId}/interactions/{interactionId}` | Interaction | authenticated |
| 5 | `POST` | `/api/v1/customers/{customerId}/interactions/search` | Interaction | authenticated |
| 6 | `GET` | `/api/v1/customers/{customerId}/tags` | Tag | authenticated |
| 7 | `GET` | `/api/v1/customers/{id}` | Customer | authenticated |
| 8 | `PUT` | `/api/v1/customers/{id}` | Customer | authenticated |
| 9 | `GET` | `/api/v1/customers/birthdays-today` | Customer | authenticated |
| 10 | `POST` | `/api/v1/customers/import` | Customer | authenticated |
| 11 | `POST` | `/api/v1/customers/search` | Customer | authenticated |
| 12 | `GET` | `/api/v1/customers/suggest` | Customer | authenticated |
| 13 | `GET` | `/api/v1/customers/suggest-by-name` | Customer | authenticated |
| 14 | `POST` | `/api/v1/customers/verify-import` | Customer | authenticated |
| 15 | `POST` | `/api/v1/segments` | Segment | authenticated |
| 16 | `GET` | `/api/v1/segments/{id}` | Segment | authenticated |
| 17 | `PUT` | `/api/v1/segments/{id}` | Segment | authenticated |
| 18 | `GET` | `/api/v1/segments/{id}/customer-count` | Segment | authenticated |
| 19 | `PUT` | `/api/v1/segments/{id}/update-rules` | Segment | authenticated |
| 20 | `POST` | `/api/v1/segments/customers/search` | Segment | authenticated |
| 21 | `POST` | `/api/v1/segments/preview` | Segment | authenticated |
| 22 | `POST` | `/api/v1/segments/search` | Segment | authenticated |
| 23 | `GET` | `/api/v1/vehicles/{id}` | Vehicle | authenticated |
| 24 | `POST` | `/api/v1/vehicles/search` | Vehicle | authenticated |
| 25 | `GET` | `/api/v1/vehicles/suggest` | Vehicle | authenticated |
| 26 | `POST` | `/protected/v1/customers` | CustomerInternal | service-to-service |
| 27 | `POST` | `/protected/v1/customers/{customerId}/interactions` | InteractionInternal | service-to-service |
| 28 | `GET` | `/protected/v1/customers/{customerId}/segments` | CustomerInternal | service-to-service |
| 29 | `GET` | `/protected/v1/customers/{id}` | CustomerInternal | service-to-service |
| 30 | `PUT` | `/protected/v1/customers/{id}` | CustomerInternal | service-to-service |
| 31 | `GET` | `/protected/v1/customers/{segmentId}/customer-ids` | CustomerInternal | service-to-service |
| 32 | `POST` | `/protected/v1/customers/batch` | CustomerInternal | service-to-service |
| 33 | `GET` | `/protected/v1/customers/birthday` | CustomerInternal | service-to-service |
| 34 | `GET` | `/protected/v1/customers/birthday/segment/{segmentId}` | CustomerInternal | service-to-service |
| 35 | `GET` | `/protected/v1/customers/birthdays-today` | CustomerInternal | service-to-service |
| 36 | `PUT` | `/protected/v1/customers/by-code/{customerCode}/booking-count/decrement` | CustomerInternal | service-to-service |
| 37 | `PUT` | `/protected/v1/customers/by-code/{customerCode}/booking-count/increment` | CustomerInternal | service-to-service |
| 38 | `PUT` | `/protected/v1/customers/by-code/{customerCode}/spent` | CustomerInternal | service-to-service |
| 39 | `PUT` | `/protected/v1/customers/by-code/{customerCode}/visit` | CustomerInternal | service-to-service |
| 40 | `GET` | `/protected/v1/customers/by-phone/{phone}` | CustomerInternal | service-to-service |
| 41 | `GET` | `/protected/v1/customers/inactive` | CustomerInternal | service-to-service |
| 42 | `GET` | `/protected/v1/customers/inactive/segment/{segmentId}` | CustomerInternal | service-to-service |
| 43 | `GET` | `/protected/v1/customers/maintenance-due` | CustomerInternal | service-to-service |
| 44 | `GET` | `/protected/v1/customers/maintenance-due/segment/{segmentId}` | CustomerInternal | service-to-service |
| 45 | `POST` | `/protected/v1/customers/search` | CustomerInternal | service-to-service |
| 46 | `GET` | `/protected/v1/customers/segment/{segmentId}/count` | CustomerInternal | service-to-service |
| 47 | `POST` | `/protected/v1/customers/vehicles/upsert` | CustomerInternal | service-to-service |
| 48 | `GET` | `/protected/v1/segments/{id}` | SegmentInternal | service-to-service |
| 49 | `GET` | `/protected/v1/segments/{id}/customer-count` | SegmentInternal | service-to-service |
| 50 | `GET` | `/protected/v1/segments/{id}/customer-ids` | SegmentInternal | service-to-service |
| 51 | `POST` | `/protected/validation-cache/evict` | ValidationCache | service-to-service |
| 52 | `GET` | `/protected/validation-cache/info` | ValidationCache | service-to-service |
| 53 | `POST` | `/protected/validation-cache/reload` | ValidationCache | service-to-service |

---

## 3. Endpoint Details

### POST `/api/v1/customers`

Tạo mới customer. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CUS-20260506-0001",
    "fullName": "Customer mẫu",
    "dateOfBirth": "2026-05-06",
    "totalSpent": 2500000,
    "contactId": 51001,
    "tenantId": 10,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-sample-20260506",
    "ward": "customer-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/customers/{customerId}/interactions`

Tạo mới interaction. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "customerId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "interactionType": "CALL",
    "referenceType": "STANDARD",
    "customerId": 51001,
    "channel": "PHONE",
    "direction": "interaction-sample-20260506",
    "subject": "interaction-sample-20260506",
    "content": "interaction-sample-20260506",
    "referenceId": 51001,
    "performedBy": "interaction-sample-20260506",
    "interactionAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.INTERACTION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.INTERACTION_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.INTERACTION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.INTERACTION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.INTERACTION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.INTERACTION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/customers/{customerId}/interactions/{interactionId}`

Lấy dữ liệu interaction theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "customerId": 51001,
    "interactionId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "interactionType": "CALL",
    "referenceType": "STANDARD",
    "customerId": 51001,
    "channel": "PHONE",
    "direction": "interaction-sample-20260506",
    "subject": "interaction-sample-20260506",
    "content": "interaction-sample-20260506",
    "referenceId": 51001,
    "performedBy": "interaction-sample-20260506",
    "interactionAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.INTERACTION_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.INTERACTION_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.INTERACTION_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.INTERACTION_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.INTERACTION_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.INTERACTION_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/customers/{customerId}/interactions/{interactionId}`

Cập nhật interaction theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "customerId": 51001,
    "interactionId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "interactionType": "CALL",
    "referenceType": "STANDARD",
    "customerId": 51001,
    "channel": "PHONE",
    "direction": "interaction-sample-20260506",
    "subject": "interaction-sample-20260506",
    "content": "interaction-sample-20260506",
    "referenceId": 51001,
    "performedBy": "interaction-sample-20260506",
    "interactionAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.INTERACTION_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.INTERACTION_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.INTERACTION_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.INTERACTION_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.INTERACTION_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.INTERACTION_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/customers/{customerId}/interactions/search`

Tra cứu danh sách interaction theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "customerId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "interactionType": "CALL",
      "referenceType": "STANDARD",
      "customerId": 51001,
      "channel": "PHONE",
      "direction": "interaction-sample-20260506",
      "subject": "interaction-sample-20260506",
      "content": "interaction-sample-20260506",
      "referenceId": 51001,
      "performedBy": "interaction-sample-20260506",
      "interactionAt": "2026-05-06T10:30:00+07:00"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.INTERACTION_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.INTERACTION_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.INTERACTION_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.INTERACTION_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.INTERACTION_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.INTERACTION_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/customers/{customerId}/tags`

Lấy dữ liệu tag theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "customerId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    "2026-05-06T10:30:00+07:00"
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.TAG_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.TAG_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.TAG_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.TAG_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.TAG_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.TAG_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/customers/{id}`

Lấy dữ liệu customer theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "code": "CUS-20260506-0001",
    "fullName": "Customer mẫu",
    "dateOfBirth": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "totalSpent": 2500000,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-sample-20260506",
    "ward": "customer-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/customers/{id}`

Cập nhật customer theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "code": "CUS-20260506-0001",
    "fullName": "Customer mẫu",
    "dateOfBirth": "2026-05-06",
    "totalSpent": 2500000,
    "contactId": 51001,
    "tenantId": 10,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-sample-20260506",
    "ward": "customer-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/customers/birthdays-today`

Lấy dữ liệu customer theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "Customer mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/customers/import`

Tạo mới customer. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "totalRecords": 2500000,
    "successCount": 1001,
    "failedCount": 1001,
    "skippedCount": 1001,
    "errors": [
      {
        "rowNumber": "CUS-20260506-0001",
        "phone": "0909123456",
        "message": "customer-sample-20260506"
      }
    ],
    "rowNumber": "CUS-20260506-0001",
    "phone": "0909123456",
    "message": "customer-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/customers/search`

Tra cứu danh sách customer theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "fullName": "Customer mẫu",
      "dateOfBirth": "2026-05-06",
      "totalSpent": 2500000,
      "contactId": 51001,
      "tenantId": 10,
      "phone": "0909123456",
      "email": "nguyen.van.a@example.com",
      "gender": "MALE",
      "address": "123 Le Loi, Quan 1, TP HCM",
      "city": "customer-sample-20260506",
      "ward": "customer-sample-20260506",
      "leadSource": "DRIVER_APP"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/customers/suggest`

Gợi ý customer phục vụ autocomplete hoặc chọn nhanh trong luồng nghiệp vụ.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "Customer mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_SUGGEST.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/customers/suggest-by-name`

Gợi ý customer phục vụ autocomplete hoặc chọn nhanh trong luồng nghiệp vụ.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "Customer mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_SUGGEST.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_SUGGEST.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/customers/verify-import`

Tạo mới customer. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "fullName": "Customer mẫu",
    "dateOfBirth": "2026-05-06",
    "customers": [
      {
        "fullName": "Customer mẫu",
        "dateOfBirth": "2026-05-06",
        "rowNumber": "CUS-20260506-0001",
        "phone": "0909123456",
        "email": "nguyen.van.a@example.com",
        "gender": "MALE",
        "address": "123 Le Loi, Quan 1, TP HCM"
      }
    ],
    "rowNumber": "CUS-20260506-0001",
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-sample-20260506",
    "ward": "customer-sample-20260506",
    "leadSource": "DRIVER_APP",
    "notes": "Ghi chú nghiệp vụ mẫu",
    "isValid": 51001,
    "errors": [
      "customer-sample-20260506"
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.CUSTOMER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/segments`

Tạo mới segment. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "Segment mẫu",
    "status": "ACTIVE",
    "segmentType": "STATIC",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "description": "Ghi chú nghiệp vụ mẫu",
    "criteria": [
      {
        "type": "STANDARD",
        "registrationDate": "2026-05-06",
        "totalSpent": 2500000,
        "city": "segment-sample-20260506",
        "vehicleInfo": "segment-sample-20260506",
        "inactiveDays": "segment-sample-20260506",
        "bookingCount": "segment-sample-20260506"
      }
    ],
    "memberCount": 1001,
    "isLinkedToCampaign": "https://files.garage.example/documents/sample.pdf",
    "lastEvaluatedAt": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.SEGMENT_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/segments/{id}`

Lấy dữ liệu segment theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "name": "Segment mẫu",
    "status": "ACTIVE",
    "segmentType": "STATIC",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "description": "Ghi chú nghiệp vụ mẫu",
    "criteria": [
      {
        "type": "STANDARD",
        "registrationDate": "2026-05-06",
        "totalSpent": 2500000,
        "city": "segment-sample-20260506",
        "vehicleInfo": "segment-sample-20260506",
        "inactiveDays": "segment-sample-20260506",
        "bookingCount": "segment-sample-20260506"
      }
    ],
    "memberCount": 1001,
    "isLinkedToCampaign": "https://files.garage.example/documents/sample.pdf",
    "lastEvaluatedAt": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/segments/{id}`

Cập nhật segment theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "name": "Segment mẫu",
    "status": "ACTIVE",
    "segmentType": "STATIC",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "description": "Ghi chú nghiệp vụ mẫu",
    "criteria": [
      {
        "type": "STANDARD",
        "registrationDate": "2026-05-06",
        "totalSpent": 2500000,
        "city": "segment-sample-20260506",
        "vehicleInfo": "segment-sample-20260506",
        "inactiveDays": "segment-sample-20260506",
        "bookingCount": "segment-sample-20260506"
      }
    ],
    "memberCount": 1001,
    "isLinkedToCampaign": "https://files.garage.example/documents/sample.pdf",
    "lastEvaluatedAt": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.SEGMENT_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/segments/{id}/customer-count`

Đếm số lượng segment theo điều kiện hiện tại để phục vụ dashboard hoặc kiểm tra nhanh.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "count": 12
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_COUNT.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/segments/{id}/update-rules`

Cập nhật segment theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "name": "Segment mẫu",
    "status": "ACTIVE",
    "segmentType": "STATIC",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "description": "Ghi chú nghiệp vụ mẫu",
    "criteria": [
      {
        "type": "STANDARD",
        "registrationDate": "2026-05-06",
        "totalSpent": 2500000,
        "city": "segment-sample-20260506",
        "vehicleInfo": "segment-sample-20260506",
        "inactiveDays": "segment-sample-20260506",
        "bookingCount": "segment-sample-20260506"
      }
    ],
    "memberCount": 1001,
    "isLinkedToCampaign": "https://files.garage.example/documents/sample.pdf",
    "lastEvaluatedAt": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.SEGMENT_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/segments/customers/search`

Tra cứu danh sách segment theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "fullName": "Segment mẫu",
      "phone": "0909123456",
      "email": "nguyen.van.a@example.com",
      "city": "segment-sample-20260506",
      "isActive": true
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/segments/preview`

Lấy dữ liệu segment theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "fullName": "Segment mẫu",
      "phone": "0909123456",
      "email": "nguyen.van.a@example.com"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_EXECUTE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/segments/search`

Tra cứu danh sách segment theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "name": "Segment mẫu",
      "status": "ACTIVE",
      "segmentType": "STATIC",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "description": "Ghi chú nghiệp vụ mẫu",
      "criteria": [
        {
          "type": "STANDARD",
          "registrationDate": "2026-05-06",
          "totalSpent": 2500000,
          "city": "segment-sample-20260506",
          "vehicleInfo": "segment-sample-20260506",
          "inactiveDays": "segment-sample-20260506",
          "bookingCount": "segment-sample-20260506"
        }
      ],
      "memberCount": 1001,
      "isLinkedToCampaign": "https://files.garage.example/documents/sample.pdf",
      "lastEvaluatedAt": "2026-05-06T10:30:00+07:00",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "createdBy": "2026-05-06T10:30:00+07:00"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.SEGMENT_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vehicles/{id}`

Lấy dữ liệu vehicle theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
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
    "customerName": "Vehicle mẫu",
    "nextMaintenanceDate": "2026-05-06",
    "totalSpent": 2500000,
    "tenantId": 10,
    "customerId": 51001,
    "licensePlate": "2026-05-06T10:30:00+07:00",
    "brand": "Toyota",
    "model": "Vios",
    "version": "vehicle-sample-20260506",
    "year": 2024,
    "color": "vehicle-sample-20260506",
    "vin": "RLHGD1850NY000001",
    "engineNumber": "VEH-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.VEHICLE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.VEHICLE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.VEHICLE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.VEHICLE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.VEHICLE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.VEHICLE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/vehicles/search`

Tra cứu danh sách vehicle theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "customerName": "Vehicle mẫu",
      "totalSpent": 2500000,
      "licensePlate": "2026-05-06T10:30:00+07:00",
      "vin": "RLHGD1850NY000001",
      "brand": "Toyota",
      "model": "Vios",
      "year": 2024,
      "lastOdo": 1001,
      "lastServiceAt": "2026-05-06T10:30:00+07:00"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.VEHICLE_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.VEHICLE_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.VEHICLE_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.VEHICLE_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.VEHICLE_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.VEHICLE_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vehicles/suggest`

Gợi ý vehicle phục vụ autocomplete hoặc chọn nhanh trong luồng nghiệp vụ.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "VEH-20260506-0001",
      "status": "ACTIVE",
      "name": "Vehicle mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.VEHICLE_SUGGEST.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.VEHICLE_SUGGEST.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-customer.VEHICLE_SUGGEST.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.VEHICLE_SUGGEST.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.VEHICLE_SUGGEST.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.VEHICLE_SUGGEST.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/customers`

Tạo mới customer internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "CUS-20260506-0001",
    "fullName": "CustomerInternal mẫu",
    "dateOfBirth": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "totalSpent": 2500000,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-internal-sample-20260506",
    "ward": "customer-internal-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/customers/{customerId}/interactions`

Tạo mới interaction internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "customerId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "interactionType": "CALL",
    "referenceType": "STANDARD",
    "customerId": 51001,
    "channel": "PHONE",
    "direction": "interaction-internal-sample-20260506",
    "subject": "interaction-internal-sample-20260506",
    "content": "interaction-internal-sample-20260506",
    "referenceId": 51001,
    "performedBy": "interaction-internal-sample-20260506",
    "interactionAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.INTERACTION_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.INTERACTION_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.INTERACTION_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.INTERACTION_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.INTERACTION_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.INTERACTION_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/{customerId}/segments`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "customerId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    "2026-05-06T10:30:00+07:00"
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/{id}`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

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
    "code": "CUS-20260506-0001",
    "fullName": "CustomerInternal mẫu",
    "dateOfBirth": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "totalSpent": 2500000,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-internal-sample-20260506",
    "ward": "customer-internal-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/customers/{id}`

Cập nhật customer internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "CUS-20260506-0001",
    "fullName": "CustomerInternal mẫu",
    "dateOfBirth": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "totalSpent": 2500000,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-internal-sample-20260506",
    "ward": "customer-internal-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/{segmentId}/customer-ids`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "segmentId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/customers/batch`

Tạo mới customer internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/birthday`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/birthday/segment/{segmentId}`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "segmentId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/birthdays-today`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/customers/by-code/{customerCode}/booking-count/decrement`

Cập nhật customer internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "customerCode": "CUS-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "count": 12
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/customers/by-code/{customerCode}/booking-count/increment`

Cập nhật customer internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "customerCode": "CUS-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "count": 12
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/customers/by-code/{customerCode}/spent`

Cập nhật customer internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "customerCode": "CUS-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CUS-20260506-0001",
    "fullName": "CustomerInternal mẫu",
    "dateOfBirth": "2026-05-06",
    "totalSpent": 2500000,
    "contactId": 51001,
    "tenantId": 10,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-internal-sample-20260506",
    "ward": "customer-internal-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/customers/by-code/{customerCode}/visit`

Cập nhật customer internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "customerCode": "CUS-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CUS-20260506-0001",
    "fullName": "CustomerInternal mẫu",
    "dateOfBirth": "2026-05-06",
    "totalSpent": 2500000,
    "contactId": 51001,
    "tenantId": 10,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-internal-sample-20260506",
    "ward": "customer-internal-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/by-phone/{phone}`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "phone": "0909123456"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CUS-20260506-0001",
    "fullName": "CustomerInternal mẫu",
    "dateOfBirth": "2026-05-06",
    "totalSpent": 2500000,
    "contactId": 51001,
    "tenantId": 10,
    "phone": "0909123456",
    "email": "nguyen.van.a@example.com",
    "gender": "MALE",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "city": "customer-internal-sample-20260506",
    "ward": "customer-internal-sample-20260506",
    "leadSource": "DRIVER_APP"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/inactive`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/inactive/segment/{segmentId}`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "segmentId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/maintenance-due`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/maintenance-due/segment/{segmentId}`

Lấy dữ liệu customer internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "segmentId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "CUS-20260506-0001",
      "status": "ACTIVE",
      "name": "CustomerInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/customers/search`

Tra cứu danh sách customer internal theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "CUS-20260506-0001",
      "fullName": "CustomerInternal mẫu",
      "dateOfBirth": "2026-05-06",
      "totalSpent": 2500000,
      "contactId": 51001,
      "tenantId": 10,
      "phone": "0909123456",
      "email": "nguyen.van.a@example.com",
      "gender": "MALE",
      "address": "123 Le Loi, Quan 1, TP HCM",
      "city": "customer-internal-sample-20260506",
      "ward": "customer-internal-sample-20260506",
      "leadSource": "DRIVER_APP"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_SEARCH.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/customers/segment/{segmentId}/count`

Đếm số lượng customer internal theo điều kiện hiện tại để phục vụ dashboard hoặc kiểm tra nhanh.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "segmentId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "count": 12
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_COUNT.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/customers/vehicles/upsert`

Tạo mới customer internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "nextMaintenanceDate": "2026-05-06",
    "isPrimary": true,
    "vin": "RLHGD1850NY000001",
    "engineNumber": "CUS-20260506-0001",
    "licensePlate": "2026-05-06T10:30:00+07:00",
    "brand": "Toyota",
    "model": "Vios",
    "version": "customer-internal-sample-20260506",
    "year": 2024,
    "color": "customer-internal-sample-20260506",
    "nextMaintenanceOdo": 1001,
    "maintenanceIntervalKm": 1001,
    "maintenanceIntervalMonths": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.CUSTOMER_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/segments/{id}`

Lấy dữ liệu segment internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

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
    "name": "SegmentInternal mẫu",
    "status": "ACTIVE",
    "segmentType": "STATIC",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "description": "Ghi chú nghiệp vụ mẫu",
    "criteria": [
      {
        "type": "STANDARD",
        "registrationDate": "2026-05-06",
        "totalSpent": 2500000,
        "city": "segment-internal-sample-20260506",
        "vehicleInfo": "segment-internal-sample-20260506",
        "inactiveDays": "segment-internal-sample-20260506",
        "bookingCount": "segment-internal-sample-20260506"
      }
    ],
    "memberCount": 1001,
    "isLinkedToCampaign": "https://files.garage.example/documents/sample.pdf",
    "lastEvaluatedAt": "2026-05-06T10:30:00+07:00",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/segments/{id}/customer-count`

Đếm số lượng segment internal theo điều kiện hiện tại để phục vụ dashboard hoặc kiểm tra nhanh.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

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
    "count": 12
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_INTERNAL_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_INTERNAL_COUNT.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.SEGMENT_INTERNAL_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_INTERNAL_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_INTERNAL_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_INTERNAL_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/segments/{id}/customer-ids`

Lấy dữ liệu segment internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

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
  "data": [
    {
      "id": 51001,
      "code": "SI-20260506-0001",
      "status": "ACTIVE",
      "name": "SegmentInternal mẫu"
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

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.SEGMENT_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/validation-cache/evict`

Tạo mới validation cache. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/validation-cache/info`

Lấy dữ liệu validation cache theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "executed": true,
    "affectedKeys": 12
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-customer.VALIDATION_CACHE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.VALIDATION_CACHE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.VALIDATION_CACHE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.VALIDATION_CACHE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-customer.VALIDATION_CACHE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.VALIDATION_CACHE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/validation-cache/reload`

Tạo mới validation cache. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-customer.VALIDATION_CACHE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-customer-HLD.md](../hld/gf-customer-HLD.md)
- Events: [gf-customer-events.md](../events/gf-customer-events.md)
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-customer`: REST/JSON với public APIs (`/api/v1`, security-context auth) cho customer CRUD/import/search/suggest, vehicle profile, customer interaction, customer tag và segment management (rules, customer-count, preview, customer search); cộng protected APIs (`/protected/v1`, service-to-service) cho customer lookup theo phone/code, segment customer-ids, batch upsert, maintenance-due/inactive/birthday segment scans, vehicle upsert và validation cache (`/protected/validation-cache`). Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
