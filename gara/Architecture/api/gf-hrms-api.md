---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-hrms
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-hrms-HLD.md"
---

# REST API - `gf-hrms`

> API contract cho boundary `gf-hrms`, quản lý employee profile, SSO provisioning state, protected employee lookup/migration và validation cache.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-hrms` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1` |
| Protected prefixes | `/protected/v1` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `GET` | `/api/v1/employees` | Employee | authenticated |
| 2 | `POST` | `/api/v1/employees` | Employee | authenticated |
| 3 | `GET` | `/api/v1/employees/{id}` | Employee | authenticated |
| 4 | `PUT` | `/api/v1/employees/{id}` | Employee | authenticated |
| 5 | `POST` | `/api/v1/employees/{id}/disable-sso` | Employee | authenticated |
| 6 | `POST` | `/api/v1/employees/{id}/enable-sso` | Employee | authenticated |
| 7 | `POST` | `/api/v1/employees/{id}/provision-sso` | Employee | authenticated |
| 8 | `POST` | `/api/v1/employees/{id}/reactivate` | Employee | authenticated |
| 9 | `PUT` | `/api/v1/employees/{id}/role` | Employee | authenticated |
| 10 | `POST` | `/api/v1/employees/{id}/suspend` | Employee | authenticated |
| 11 | `POST` | `/api/v1/employees/{id}/terminate` | Employee | authenticated |
| 12 | `GET` | `/api/v1/employees/detail/{code}` | Employee | authenticated |
| 13 | `GET` | `/protected/v1/employees/{tenantId}/{id}` | ProtectedEmployee | service-to-service |
| 14 | `POST` | `/protected/v1/employees/migrate-employee-from-tenant` | ProtectedEmployee | service-to-service |
| 15 | `POST` | `/protected/v1/employees/migrate-user-to-iam` | ProtectedEmployee | service-to-service |
| 16 | `POST` | `/protected/v1/validation-cache/evict` | ValidationCache | service-to-service |
| 17 | `GET` | `/protected/v1/validation-cache/info` | ValidationCache | service-to-service |
| 18 | `POST` | `/protected/v1/validation-cache/reload` | ValidationCache | service-to-service |

---

## 3. Endpoint Details

### GET `/api/v1/employees`

Lấy dữ liệu employee theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "employeeCode": "EMP-20260506-0001",
      "firstName": "Employee mẫu",
      "lastName": "Employee mẫu",
      "primaryRoleDisplayName": "Employee mẫu",
      "employmentStatus": "ACTIVE",
      "ssoStatus": "ACTIVE",
      "birthDate": "2026-05-06",
      "phone": "0909123456",
      "primaryRole": "employee-sample-20260506",
      "hiredAt": "2026-05-06T10:30:00+07:00"
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
| `GMS.gf-hrms.EMPLOYEE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-hrms.EMPLOYEE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/employees/{id}`

Lấy dữ liệu employee theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-hrms.EMPLOYEE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/employees/{id}`

Cập nhật employee theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees/{id}/disable-sso`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees/{id}/enable-sso`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees/{id}/provision-sso`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees/{id}/reactivate`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/employees/{id}/role`

Cập nhật employee theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees/{id}/suspend`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/employees/{id}/terminate`

Tạo mới employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/employees/detail/{code}`

Lấy dữ liệu employee theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "EMP-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "employeeCode": "EMP-20260506-0001",
    "firstName": "Employee mẫu",
    "lastName": "Employee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.EMPLOYEE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.EMPLOYEE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-hrms.EMPLOYEE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.EMPLOYEE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-hrms.EMPLOYEE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.EMPLOYEE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/employees/{tenantId}/{id}`

Lấy dữ liệu protected employee theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10,
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "employeeCode": "EMP-20260506-0001",
    "firstName": "ProtectedEmployee mẫu",
    "lastName": "ProtectedEmployee mẫu",
    "employmentStatus": "ACTIVE",
    "ssoStatus": "ACTIVE",
    "birthDate": "2026-05-06",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "email": "nguyen.van.a@example.com",
    "phone": "0909123456",
    "nationalId": 51001,
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/employees/migrate-employee-from-tenant`

Tạo mới protected employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "totalUpdated": "2026-05-06",
    "totalProcessed": 2500000,
    "totalCreated": "2026-05-06T10:30:00+07:00",
    "totalFailed": 2500000,
    "errorDetails": "protected-employee-sample-20260506",
    "success": true,
    "message": "protected-employee-sample-20260506",
    "durationMs": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/employees/migrate-user-to-iam`

Tạo mới protected employee. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "totalUpdated": "2026-05-06",
    "totalProcessed": 2500000,
    "totalCreated": "2026-05-06T10:30:00+07:00",
    "totalFailed": 2500000,
    "errorDetails": "protected-employee-sample-20260506",
    "success": true,
    "message": "protected-employee-sample-20260506",
    "durationMs": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.PROTECTED_EMPLOYEE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/validation-cache/evict`

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
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/validation-cache/info`

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
| `GMS.gf-hrms.VALIDATION_CACHE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.VALIDATION_CACHE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-hrms.VALIDATION_CACHE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.VALIDATION_CACHE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-hrms.VALIDATION_CACHE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.VALIDATION_CACHE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/validation-cache/reload`

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
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-hrms.VALIDATION_CACHE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md)
- Events: Chưa có tài liệu events tương ứng.
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-hrms`: REST/JSON với public APIs (`/api/v1`, bearer JWT/security-context) cho employee CRUD/list/detail-by-code, employee role change, lifecycle (suspend/reactivate/terminate) và SSO provisioning (provision/enable/disable); cộng protected APIs (`/protected/v1`, service-to-service) cho employee lookup theo `tenantId+id`, migration từ tenant sang IAM và validation cache (evict/info/reload). Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
