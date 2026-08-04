---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-notification
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-notification-HLD.md"
---

# REST API - `gf-notification`

> API contract cho boundary `gf-notification`, quản lý notification creation, user notification inbox, target recipient resolution và message delivery tracking.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-notification` |
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
| 1 | `GET` | `/api/v1/notifications` | Notification | authenticated |
| 2 | `PUT` | `/api/v1/notifications/{id}/mark-as-read` | Notification | authenticated |
| 3 | `PUT` | `/api/v1/notifications/{requestId}/mark-as-read-push` | Notification | authenticated |
| 4 | `PUT` | `/api/v1/notifications/mark-all-as-read` | Notification | authenticated |
| 5 | `GET` | `/api/v1/notifications/unread-count` | Notification | authenticated |
| 6 | `POST` | `/protected/v1/notifications` | InternalNotification | service-to-service |
| 7 | `POST` | `/protected/v1/notifications/template` | InternalNotification | service-to-service |

---

## 3. Endpoint Details

### GET `/api/v1/notifications`

Lấy dữ liệu notification theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "tenantType": 10,
      "tenantId": 10,
      "userId": 1001,
      "title": "Notification mẫu",
      "content": "notification-sample-20260506",
      "targetClient": "notification-sample-20260506",
      "targetRoute": "notification-sample-20260506",
      "routeParams": "notification-sample-20260506",
      "sourceSystem": "notification-sample-20260506",
      "isRead": true,
      "readAt": "2026-05-06T10:30:00+07:00",
      "createdAt": "2026-05-06T10:30:00+07:00"
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
| `GMS.gf-notification.NOTIFICATION_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.NOTIFICATION_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-notification.NOTIFICATION_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.NOTIFICATION_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-notification.NOTIFICATION_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.NOTIFICATION_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/notifications/{id}/mark-as-read`

Cập nhật notification theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "NOTI-20260506-0001",
    "status": "ACTIVE",
    "name": "Notification mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-notification.NOTIFICATION_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/notifications/{requestId}/mark-as-read-push`

Cập nhật notification theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "requestId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "NOTI-20260506-0001",
    "status": "ACTIVE",
    "name": "Notification mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-notification.NOTIFICATION_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/notifications/mark-all-as-read`

Cập nhật notification theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "NOTI-20260506-0001",
    "status": "ACTIVE",
    "name": "Notification mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-notification.NOTIFICATION_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.NOTIFICATION_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/notifications/unread-count`

Đếm số lượng notification theo điều kiện hiện tại để phục vụ dashboard hoặc kiểm tra nhanh.

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
  "data": {
    "count": 12
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-notification.NOTIFICATION_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.NOTIFICATION_COUNT.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-notification.NOTIFICATION_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.NOTIFICATION_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-notification.NOTIFICATION_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.NOTIFICATION_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/notifications`

Tạo mới internal notification. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "NOTI-20260506-0001",
    "status": "ACTIVE",
    "name": "InternalNotification mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/notifications/template`

Tạo mới internal notification. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "NOTI-20260506-0001",
    "status": "ACTIVE",
    "name": "InternalNotification mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-notification.INTERNAL_NOTIFICATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-notification-HLD.md](../hld/gf-notification-HLD.md)
- Events: [gf-notification-events.md](../events/gf-notification-events.md)
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-notification`: REST/JSON với public APIs (`/api/v1`, bearer JWT/security-context) cho user notification inbox: list, unread-count, mark-as-read theo id, mark-as-read-push theo requestId, mark-all-as-read; cộng protected APIs (`/protected/v1`, service-to-service) cho notification creation: ad-hoc notification và template-based notification từ downstream services. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
