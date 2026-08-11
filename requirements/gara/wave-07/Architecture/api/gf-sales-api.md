---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 13
tier: T1
owner_authority: Architecture Authority
boundary: gf-sales
last_reviewed: "2026-08-10"
depends_on:
  - "../hld/gf-sales-HLD.md"
  - "../data/gf-sales-data-model.md"
  - "../decisions/ADR-014-insurance-settlement-ownership.md"
  - "../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md"
---

# REST API - `gf-sales`

> API contract cho boundary `gf-sales`, quản lý booking, service order, quotation handoff, customer/vehicle support, printing, dashboard và protected settlement handoff.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-sales` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v2`, `/api/v3` |
| Protected prefixes | `/protected/v1` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `POST` | `/api/v2/bookings` | Booking | authenticated |
| 2 | `GET` | `/api/v2/bookings/{id}` | Booking | authenticated |
| 3 | `PUT` | `/api/v2/bookings/{id}` | Booking | authenticated |
| 4 | `PUT` | `/api/v2/bookings/{id}/arrive` | Booking | authenticated |
| 5 | `PUT` | `/api/v2/bookings/{id}/cancel` | Booking | authenticated |
| 6 | `PUT` | `/api/v2/bookings/{id}/confirm` | Booking | authenticated |
| 7 | `PUT` | `/api/v2/bookings/{id}/decline` | Booking | authenticated |
| 8 | `GET` | `/api/v2/bookings/check-availability` | Booking | authenticated |
| 9 | `POST` | `/api/v2/bookings/search` | Booking | authenticated |
| 10 | `GET` | `/api/v2/customers/suggest` | Customer | authenticated |
| 11 | `GET` | `/api/v2/customers/suggest-by-name` | Customer | authenticated |
| 12 | `GET` | `/api/v2/dashboard/realtime/booking-arrived-without-so-count` | DashboardRealTime | authenticated |
| 13 | `GET` | `/api/v2/dashboard/realtime/so-in-progress-count` | DashboardRealTime | authenticated |
| 14 | `GET` | `/api/v2/dashboard/realtime/total-so-debt` | DashboardRealTime | authenticated |
| 15 | `POST` | `/api/v2/quotation-asks` | QuotationAsk | authenticated |
| 16 | `GET` | `/api/v2/quotation-asks/by-code/{code}/linked-service-order` | QuotationAsk | authenticated |
| 17 | `GET` | `/api/v2/quotation-asks/by-quotation-ask-id/{quotationAskId}/linked-service-order` | QuotationAsk | authenticated |
| 18 | `POST` | `/api/v2/service-orders` | ServiceOrder | authenticated |
| 19 | `GET` | `/api/v2/service-orders/{id}` | ServiceOrder | authenticated |
| 20 | `PUT` | `/api/v2/service-orders/{id}` | ServiceOrder | authenticated |
| 21 | `PUT` | `/api/v2/service-orders/{id}/cancel` | ServiceOrder | authenticated |
| 22 | `PUT` | `/api/v2/service-orders/{id}/complete` | ServiceOrder | authenticated |
| 23 | `GET` | `/api/v2/service-orders/{id}/export-image` | Printing | authenticated |
| 24 | `GET` | `/api/v2/service-orders/{id}/export-pdf` | Printing | authenticated |
| 25 | `POST` | `/api/v2/service-orders/{id}/payments` | ServiceOrder | authenticated |
| 26 | `GET` | `/api/v2/service-orders/{id}/print-preview` | Printing | authenticated |
| 27 | `PUT` | `/api/v2/service-orders/{id}/start` | ServiceOrder | authenticated |
| 28 | `POST` | `/api/v2/service-orders/ocr/upload` | ServiceOrder | authenticated |
| 29 | `POST` | `/api/v2/service-orders/search` | ServiceOrder | authenticated |
| 30 | `GET` | `/api/v2/vehicles/suggest` | Vehicle | authenticated |
| 31 | `POST` | `/api/v3/bookings` | BookingV3 | authenticated |
| 32 | `GET` | `/api/v3/bookings/{id}` | BookingV3 | authenticated |
| 33 | `PUT` | `/api/v3/bookings/{id}` | BookingV3 | authenticated |
| 34 | `PUT` | `/api/v3/bookings/{id}/arrive` | BookingV3 | authenticated |
| 35 | `PUT` | `/api/v3/bookings/{id}/cancel` | BookingV3 | authenticated |
| 36 | `PUT` | `/api/v3/bookings/{id}/confirm` | BookingV3 | authenticated |
| 37 | `PUT` | `/api/v3/bookings/{id}/decline` | BookingV3 | authenticated |
| 38 | `GET` | `/api/v3/bookings/check-availability` | BookingV3 | authenticated |
| 39 | `GET` | `/api/v3/bookings/detail/{code}` | BookingV3 | authenticated |
| 40 | `POST` | `/api/v3/bookings/search` | BookingV3 | authenticated |
| 41 | `POST` | `/api/v3/service-orders` | ServiceOrderV3 | authenticated |
| 42 | `POST` | `/api/v3/service-orders/{code}/record-payments` | ServiceOrderV3 | authenticated |
| 43 | `GET` | `/api/v3/service-orders/{id}` | ServiceOrderV3 | authenticated |
| 44 | `PUT` | `/api/v3/service-orders/{id}` | ServiceOrderV3 | authenticated |
| 45 | `PUT` | `/api/v3/service-orders/{id}/cancel` | ServiceOrderV3 | authenticated |
| 46 | `PUT` | `/api/v3/service-orders/{id}/complete` | ServiceOrderV3 | authenticated |
| 47 | `PUT` | `/api/v3/service-orders/{id}/confirm` | ServiceOrderV3 | authenticated |
| 48 | `POST` | `/api/v3/service-orders/{id}/payments` | ServiceOrderV3 | authenticated |
| 49 | `POST` | `/api/v3/service-orders/{id}/send-quotation` | ServiceOrderV3 | authenticated |
| 50 | `PUT` | `/api/v3/service-orders/{id}/start` | ServiceOrderV3 | authenticated |
| 51 | `GET` | `/api/v3/service-orders/code/{code}/for-delivery` | ServiceOrderV3 | authenticated |
| 52 | `POST` | `/api/v3/service-orders/completed-items/search` | ServiceOrderV3 | authenticated |
| 53 | `POST` | `/api/v3/service-orders/completed-parts/search` | ServiceOrderV3 | authenticated |
| 54 | `POST` | `/api/v3/service-orders/completed-vehicle-notes/search` | ServiceOrderV3 | authenticated |
| 55 | `POST` | `/api/v3/service-orders/customer-info` | ServiceOrderV3 | authenticated |
| 56 | `GET` | `/api/v3/service-orders/detail/{code}` | ServiceOrderV3 | authenticated |
| 57 | `POST` | `/api/v3/service-orders/find-by-codes` | ServiceOrderV3 | authenticated |
| 58 | `POST` | `/api/v3/service-orders/ocr/upload` | ServiceOrderV3 | authenticated |
| 59 | `POST` | `/api/v3/service-orders/search` | ServiceOrderV3 | authenticated |
| 60 | `GET` | `/api/v3/service-orders/vehicles/{vehicleId}/latest` | ServiceOrderV3 | authenticated |
| 61 | `POST` | `/protected/v1/bookings/auto-cancel` | InternalBooking | service-to-service |
| 62 | `DELETE` | `/protected/v1/cache/dashboard-all` | Cache | service-to-service |
| 63 | `DELETE` | `/protected/v1/cache/dashboard-all/{tenantId}` | Cache | service-to-service |
| 64 | `DELETE` | `/protected/v1/cache/dashboard-booking-arrived` | Cache | service-to-service |
| 65 | `DELETE` | `/protected/v1/cache/dashboard-booking-arrived/{tenantId}` | Cache | service-to-service |
| 66 | `DELETE` | `/protected/v1/cache/dashboard-customer-debt` | Cache | service-to-service |
| 67 | `DELETE` | `/protected/v1/cache/dashboard-customer-debt/{tenantId}` | Cache | service-to-service |
| 68 | `DELETE` | `/protected/v1/cache/dashboard-so-in-progress` | Cache | service-to-service |
| 69 | `DELETE` | `/protected/v1/cache/dashboard-so-in-progress/{tenantId}` | Cache | service-to-service |
| 70 | `DELETE` | `/protected/v1/printing/cache/all` | PrintingCache | service-to-service |
| 71 | `DELETE` | `/protected/v1/printing/cache/car-hierarchy` | PrintingCache | service-to-service |
| 72 | `DELETE` | `/protected/v1/printing/cache/tenant-info` | PrintingCache | service-to-service |
| 73 | `DELETE` | `/protected/v1/printing/cache/tenant-info/{tenantId}` | PrintingCache | service-to-service |
| 74 | `DELETE` | `/protected/v1/printing/cache/unit-catalog` | PrintingCache | service-to-service |
| 75 | `GET` | `/protected/v1/service-orders/{tenantId}/{code}/for-print` | ServiceOrderInternal | service-to-service |
| 76 | `PUT` | `/protected/v1/service-orders/{tenantId}/{code}/reopen-from-settled` | ServiceOrderInternal | service-to-service |
| 77 | `PUT` | `/protected/v1/service-orders/{tenantId}/{code}/settle` | ServiceOrderInternal | service-to-service |
| 78 | `GET` | `/protected/v1/service-orders/{tenantId}/{id}/for-settlement` | ServiceOrderInternal | service-to-service |
| 79 | `GET` | `/protected/v1/service-orders/{tenantId}/detail/{code}` | ProtectedServiceOrder | service-to-service |
| 80 | `POST` | `/protected/v1/service-orders/{tenantId}/vehicle-summaries` | ServiceOrderInternal | service-to-service |
| — | — | _DESIGN — Insurance Settlement (FEAT-INS-SO-ADJUSTMENT/DASH-DEBT, ADR-014). §3bis._ | — | — |
| 81 | `GET` | `/api/v2/dashboard/insurance-debt-widget` | DashboardRealTime | authenticated |

> **Additive (KHÔNG endpoint mới)**: SO Edit/Detail (`PUT /api/v3/service-orders/{id}`, `GET /api/v3/service-orders/detail/{code}`) + `GET /protected/v1/.../for-settlement` bổ sung 8 flat adjustment fields + 8 flat breakdown fields + `payer` — xem §3bis.1–3bis.2.

---

## 3. Endpoint Details

### POST `/api/v2/bookings`

Tạo mới booking. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/bookings/{id}`

Lấy dữ liệu booking theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/bookings/{id}`

Cập nhật booking theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/bookings/{id}/arrive`

Lấy dữ liệu booking theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_ARRIVE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_ARRIVE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_ARRIVE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_ARRIVE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_ARRIVE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_ARRIVE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/bookings/{id}/cancel`

Hủy booking theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/bookings/{id}/confirm`

Xác nhận booking, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/bookings/{id}/decline`

Lấy dữ liệu booking theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "actorFullName": "Booking mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_DECLINE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_DECLINE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_DECLINE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_DECLINE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_DECLINE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_DECLINE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/bookings/check-availability`

Lấy dữ liệu booking theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerName": "Booking mẫu",
    "status": "CANCELLED",
    "requestedTime": "2026-05-06T10:30:00+07:00",
    "nearbyBookingCount": 1001,
    "nearbyBookings": [
      {
        "code": "BK-20260506-0001",
        "customerName": "Booking mẫu",
        "status": "CANCELLED",
        "vehiclePlate": "2026-05-06T10:30:00+07:00",
        "bookedAt": "2026-05-06T10:30:00+07:00"
      }
    ],
    "isRecommended": true,
    "vehiclePlate": "2026-05-06T10:30:00+07:00",
    "bookedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/bookings/search`

Tra cứu danh sách booking theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "BK-20260506-0001",
      "customerCode": "BK-20260506-0001",
      "customerName": "Booking mẫu",
      "status": "CANCELLED",
      "serviceType": "STANDARD",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "customerId": 51001,
      "vehicleId": 51001,
      "customerPhone": "0909123456",
      "vehiclePlate": "2026-05-06T10:30:00+07:00",
      "bookedAt": "2026-05-06T10:30:00+07:00",
      "leadSource": "booking-sample-20260506"
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
| `GMS.gf-sales.BOOKING_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/customers/suggest`

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
| `GMS.gf-sales.CUSTOMER_SUGGEST.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/customers/suggest-by-name`

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
| `GMS.gf-sales.CUSTOMER_SUGGEST.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CUSTOMER_SUGGEST.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/realtime/booking-arrived-without-so-count`

Lấy dữ liệu dashboard real time theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
| `GMS.gf-sales.DASHBOARD_REAL_TIME_ARRIVE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_ARRIVE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_ARRIVE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_ARRIVE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_ARRIVE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_ARRIVE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/realtime/so-in-progress-count`

Đếm số lượng dashboard real time theo điều kiện hiện tại để phục vụ dashboard hoặc kiểm tra nhanh.

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
| `GMS.gf-sales.DASHBOARD_REAL_TIME_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_COUNT.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/realtime/total-so-debt`

Lấy dữ liệu dashboard real time theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "timestamp": "2026-05-06T10:30:00+07:00",
    "totalSoDebt": 2500000
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.DASHBOARD_REAL_TIME_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.DASHBOARD_REAL_TIME_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/quotation-asks`

Tạo mới quotation ask. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "QA-20260506-0001",
    "status": "ACTIVE",
    "tenantId": 10,
    "serviceOrderId": 51001,
    "requestedParts": "quotation-ask-sample-20260506",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "quotationAskId": 51001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.QUOTATION_ASK_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.QUOTATION_ASK_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.QUOTATION_ASK_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.QUOTATION_ASK_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.QUOTATION_ASK_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.QUOTATION_ASK_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/by-code/{code}/linked-service-order`

Lấy dữ liệu quotation ask theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "QA-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "serviceOrderCode": "QA-20260506-0001",
    "serviceOrderStatus": "CONFIRMED",
    "serviceOrderPaymentStatus": "ACTIVE",
    "orderType": "SERVICE",
    "serviceOrderId": 51001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/by-quotation-ask-id/{quotationAskId}/linked-service-order`

Lấy dữ liệu quotation ask theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "quotationAskId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "serviceOrderCode": "QA-20260506-0001",
    "serviceOrderStatus": "CONFIRMED",
    "serviceOrderPaymentStatus": "ACTIVE",
    "orderType": "SERVICE",
    "serviceOrderId": 51001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/service-orders`

Tạo mới service order. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/service-orders/{id}`

Lấy dữ liệu service order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/service-orders/{id}`

Cập nhật service order theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/service-orders/{id}/cancel`

Hủy service order theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/service-orders/{id}/complete`

Hoàn tất service order, cập nhật trạng thái nghiệp vụ và dữ liệu liên quan.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: cập nhật trạng thái hoàn tất và đồng bộ dữ liệu tồn kho/tài chính/liên quan nếu có.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_COMPLETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_COMPLETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_COMPLETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_COMPLETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_COMPLETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_COMPLETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/service-orders/{id}/export-image`

Lấy dữ liệu printing theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
  "data": [
    {
      "fileName": "so-20260506-0001.pdf",
      "contentType": "application/pdf",
      "downloadUrl": "https://files.garage.example/documents/sample.pdf"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.PRINTING_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.PRINTING_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.PRINTING_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/service-orders/{id}/export-pdf`

Lấy dữ liệu printing theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
  "data": [
    {
      "fileName": "so-20260506-0001.pdf",
      "contentType": "application/pdf",
      "downloadUrl": "https://files.garage.example/documents/sample.pdf"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.PRINTING_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.PRINTING_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.PRINTING_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/service-orders/{id}/payments`

Tạo mới service order. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi nhận thanh toán và cập nhật tổng tiền/trạng thái liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/service-orders/{id}/print-preview`

Lấy dữ liệu printing theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
  "data": [
    "2026-05-06T10:30:00+07:00"
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.PRINTING_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.PRINTING_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.PRINTING_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/service-orders/{id}/start`

Lấy dữ liệu service order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_START.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_START.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_START.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_START.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_START.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_START.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/service-orders/ocr/upload`

Tạo mới service order. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "status": "ACTIVE",
    "carType": "ELECTRIC_CAR",
    "processingTime": "2026-05-06T10:30:00+07:00",
    "errorDetails": "service-order-sample-20260506",
    "message": "service-order-sample-20260506",
    "vehicleInfo": {
      "carType": "ELECTRIC_CAR",
      "carBrand": "Toyota",
      "carModel": "Vios",
      "yearOfManufacture": 2024,
      "trimsLevel": "service-order-sample-20260506",
      "vin": "RLHGD1850NY000001",
      "licensePlate": "2026-05-06T10:30:00+07:00"
    },
    "carBrand": "Toyota",
    "carModel": "Vios",
    "yearOfManufacture": 2024,
    "trimsLevel": "service-order-sample-20260506",
    "vin": "RLHGD1850NY000001",
    "licensePlate": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/service-orders/search`

Tra cứu danh sách service order theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "SO-20260506-0001",
      "customerCode": "SO-20260506-0001",
      "customerName": "ServiceOrder mẫu",
      "status": "CONFIRMED",
      "paymentStatus": "ACTIVE",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "totalServiceAmount": 2500000,
      "totalPartsAmount": 2500000,
      "discountAmount": 2500000,
      "taxAmount": 2500000,
      "finalAmount": 2500000,
      "paidAmount": 2500000
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
| `GMS.gf-sales.SERVICE_ORDER_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/vehicles/suggest`

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
| `GMS.gf-sales.VEHICLE_SUGGEST.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.VEHICLE_SUGGEST.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.VEHICLE_SUGGEST.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.VEHICLE_SUGGEST.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.VEHICLE_SUGGEST.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.VEHICLE_SUGGEST.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/bookings`

Tạo mới booking v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/bookings/{id}`

Lấy dữ liệu booking v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/bookings/{id}`

Cập nhật booking v3 theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_V3_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/bookings/{id}/arrive`

Lấy dữ liệu booking v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_ARRIVE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_ARRIVE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_ARRIVE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_ARRIVE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_V3_ARRIVE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_ARRIVE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/bookings/{id}/cancel`

Hủy booking v3 theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_V3_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/bookings/{id}/confirm`

Xác nhận booking v3, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_V3_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/bookings/{id}/decline`

Lấy dữ liệu booking v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_DECLINE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_DECLINE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_DECLINE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_DECLINE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.BOOKING_V3_DECLINE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_DECLINE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/bookings/check-availability`

Lấy dữ liệu booking v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "requestedTime": "2026-05-06T10:30:00+07:00",
    "nearbyBookingCount": 1001,
    "nearbyBookings": [
      {
        "code": "BK-20260506-0001",
        "customerName": "BookingV3 mẫu",
        "status": "CANCELLED",
        "vehiclePlate": "2026-05-06T10:30:00+07:00",
        "bookedAt": "2026-05-06T10:30:00+07:00"
      }
    ],
    "isRecommended": true,
    "vehiclePlate": "2026-05-06T10:30:00+07:00",
    "bookedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/bookings/detail/{code}`

Lấy dữ liệu booking v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "BK-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "BK-20260506-0001",
    "customerCode": "BK-20260506-0001",
    "linkedServiceOrderCode": "BK-20260506-0001",
    "customerName": "BookingV3 mẫu",
    "actorFullName": "BookingV3 mẫu",
    "status": "CANCELLED",
    "statusHistory": [
      {
        "fromStatus": "CANCELLED",
        "toStatus": "CANCELLED",
        "reason": "Ghi chú nghiệp vụ mẫu",
        "changedAt": "2026-05-06T10:30:00+07:00",
        "changedBy": "booking-v3-sample-20260506"
      }
    ],
    "linkedServiceOrderStatus": "CONFIRMED",
    "fromStatus": "CANCELLED",
    "toStatus": "CANCELLED",
    "serviceType": "STANDARD",
    "historyType": "STANDARD"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.BOOKING_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/bookings/search`

Tra cứu danh sách booking v3 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "BK-20260506-0001",
      "customerCode": "BK-20260506-0001",
      "customerName": "BookingV3 mẫu",
      "status": "CANCELLED",
      "serviceType": "STANDARD",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "customerId": 51001,
      "vehicleId": 51001,
      "customerPhone": "0909123456",
      "vehiclePlate": "2026-05-06T10:30:00+07:00",
      "bookedAt": "2026-05-06T10:30:00+07:00",
      "leadSource": "booking-v3-sample-20260506"
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
| `GMS.gf-sales.BOOKING_V3_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.BOOKING_V3_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.BOOKING_V3_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.BOOKING_V3_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.BOOKING_V3_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.BOOKING_V3_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders`

Tạo mới service order v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/{code}/record-payments`

Tạo mới service order v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi nhận thanh toán và cập nhật tổng tiền/trạng thái liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/service-orders/{id}`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/service-orders/{id}`

Cập nhật service order v3 theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/service-orders/{id}/cancel`

Hủy service order v3 theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/service-orders/{id}/complete`

Hoàn tất service order v3, cập nhật trạng thái nghiệp vụ và dữ liệu liên quan.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: cập nhật trạng thái hoàn tất và đồng bộ dữ liệu tồn kho/tài chính/liên quan nếu có.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_COMPLETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_COMPLETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_COMPLETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_COMPLETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_COMPLETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_COMPLETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/service-orders/{id}/confirm`

Xác nhận service order v3, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/{id}/payments`

Tạo mới service order v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi nhận thanh toán và cập nhật tổng tiền/trạng thái liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/{id}/send-quotation`

Tạo mới service order v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "quoteSentCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v3/service-orders/{id}/start`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_START.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_START.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_START.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_START.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_START.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_START.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/service-orders/code/{code}/for-delivery`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "serviceOrderCode": "SO-20260506-0001",
    "genuineCode": "SO-20260506-0001",
    "partName": "ServiceOrderV3 mẫu",
    "costPrice": 2500000,
    "items": [
      {
        "genuineCode": "SO-20260506-0001",
        "partName": "ServiceOrderV3 mẫu",
        "costPrice": 2500000,
        "partId": 51001,
        "sku": "service-order-v3-sample-20260506",
        "tier": "service-order-v3-sample-20260506",
        "origin": "service-order-v3-sample-20260506"
      }
    ],
    "serviceOrderId": 51001,
    "partId": 51001,
    "sku": "service-order-v3-sample-20260506",
    "tier": "service-order-v3-sample-20260506",
    "origin": "service-order-v3-sample-20260506",
    "unit": "service-order-v3-sample-20260506",
    "soQuantity": 2,
    "deliveredQuantity": 2,
    "inputableQuantity": 2
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/completed-items/search`

Tra cứu danh sách service order v3 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "serviceOrderCode": "SO-20260506-0001",
      "serviceName": "ServiceOrderV3 mẫu",
      "technicianName": "ServiceOrderV3 mẫu",
      "serviceCompletedAt": "2026-05-06T10:30:00+07:00",
      "technicianId": 51001,
      "unit": "service-order-v3-sample-20260506",
      "quantity": 2
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
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/completed-parts/search`

Tra cứu danh sách service order v3 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "serviceOrderCode": "SO-20260506-0001",
      "partName": "ServiceOrderV3 mẫu",
      "finalAmount": 2500000,
      "completedAt": "2026-05-06T10:30:00+07:00",
      "vehicleOdo": 1001,
      "quantity": 2
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
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/completed-vehicle-notes/search`

Tra cứu danh sách service order v3 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
    "items": [
      {
        "id": 51001,
        "serviceOrderCode": "SO-20260506-0001",
        "content": "service-order-v3-sample-20260506",
        "createdAt": "2026-05-06T10:30:00+07:00"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/customer-info`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "soCode": "SO-20260506-0001",
      "customerCode": "SO-20260506-0001",
      "organizationTaxCode": "SO-20260506-0001",
      "customerName": "ServiceOrderV3 mẫu",
      "organizationName": "ServiceOrderV3 mẫu",
      "customerType": "INDIVIDUAL",
      "customerId": 51001
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/service-orders/detail/{code}`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/find-by-codes`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "SO-20260506-0001",
      "customerCode": "SO-20260506-0001",
      "customerName": "ServiceOrderV3 mẫu",
      "assessorName": "ServiceOrderV3 mẫu",
      "status": "CONFIRMED",
      "paymentStatus": "ACTIVE"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/ocr/upload`

Tạo mới service order v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "status": "ACTIVE",
    "carType": "ELECTRIC_CAR",
    "processingTime": "2026-05-06T10:30:00+07:00",
    "errorDetails": "service-order-v3-sample-20260506",
    "message": "service-order-v3-sample-20260506",
    "vehicleInfo": {
      "carType": "ELECTRIC_CAR",
      "carBrand": "Toyota",
      "carModel": "Vios",
      "yearOfManufacture": 2024,
      "trimsLevel": "service-order-v3-sample-20260506",
      "vin": "RLHGD1850NY000001",
      "licensePlate": "2026-05-06T10:30:00+07:00"
    },
    "carBrand": "Toyota",
    "carModel": "Vios",
    "yearOfManufacture": 2024,
    "trimsLevel": "service-order-v3-sample-20260506",
    "vin": "RLHGD1850NY000001",
    "licensePlate": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/service-orders/search`

Tra cứu danh sách service order v3 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "SO-20260506-0001",
      "customerCode": "SO-20260506-0001",
      "customerName": "ServiceOrderV3 mẫu",
      "assessorName": "ServiceOrderV3 mẫu",
      "status": "CONFIRMED",
      "paymentStatus": "ACTIVE",
      "orderType": "SERVICE",
      "serviceType": "STANDARD",
      "insuranceExpiryDate": "2026-05-06",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "totalServiceAmount": 2500000,
      "totalPartsAmount": 2500000
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
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/service-orders/vehicles/{vehicleId}/latest`

Lấy dữ liệu service order v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "vehicleId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "SO-20260506-0001",
      "customerCode": "SO-20260506-0001",
      "customerName": "ServiceOrderV3 mẫu",
      "assessorName": "ServiceOrderV3 mẫu",
      "status": "CONFIRMED",
      "paymentStatus": "ACTIVE"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/bookings/auto-cancel`

Hủy internal booking theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "BK-20260506-0001",
    "status": "ACTIVE",
    "name": "InternalBooking mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.INTERNAL_BOOKING_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.INTERNAL_BOOKING_CANCEL.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.INTERNAL_BOOKING_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.INTERNAL_BOOKING_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.INTERNAL_BOOKING_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.INTERNAL_BOOKING_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-all`

Xóa hoặc vô hiệu hóa cache theo định danh được cung cấp.

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
| `GMS.gf-sales.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-all/{tenantId}`

Xóa hoặc vô hiệu hóa cache theo định danh được cung cấp.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10
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
| `GMS.gf-sales.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-booking-arrived`

Lấy dữ liệu cache theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
| `GMS.gf-sales.CACHE_ARRIVE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_ARRIVE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_ARRIVE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_ARRIVE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_ARRIVE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_ARRIVE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-booking-arrived/{tenantId}`

Lấy dữ liệu cache theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10
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
| `GMS.gf-sales.CACHE_ARRIVE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_ARRIVE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_ARRIVE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_ARRIVE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_ARRIVE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_ARRIVE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-customer-debt`

Xóa hoặc vô hiệu hóa cache theo định danh được cung cấp.

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
| `GMS.gf-sales.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-customer-debt/{tenantId}`

Xóa hoặc vô hiệu hóa cache theo định danh được cung cấp.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10
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
| `GMS.gf-sales.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-so-in-progress`

Xóa hoặc vô hiệu hóa cache theo định danh được cung cấp.

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
| `GMS.gf-sales.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-so-in-progress/{tenantId}`

Xóa hoặc vô hiệu hóa cache theo định danh được cung cấp.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10
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
| `GMS.gf-sales.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/printing/cache/all`

Xóa hoặc vô hiệu hóa printing cache theo định danh được cung cấp.

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
| `GMS.gf-sales.PRINTING_CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/printing/cache/car-hierarchy`

Xóa hoặc vô hiệu hóa printing cache theo định danh được cung cấp.

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
| `GMS.gf-sales.PRINTING_CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/printing/cache/tenant-info`

Xóa hoặc vô hiệu hóa printing cache theo định danh được cung cấp.

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
| `GMS.gf-sales.PRINTING_CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/printing/cache/tenant-info/{tenantId}`

Xóa hoặc vô hiệu hóa printing cache theo định danh được cung cấp.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10
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
| `GMS.gf-sales.PRINTING_CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/printing/cache/unit-catalog`

Xóa hoặc vô hiệu hóa printing cache theo định danh được cung cấp.

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
| `GMS.gf-sales.PRINTING_CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PRINTING_CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/service-orders/{tenantId}/{code}/for-print`

Lấy dữ liệu service order internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "organizationTaxCode": "SO-20260506-0001",
    "organizationName": "ServiceOrderInternal mẫu",
    "serviceName": "ServiceOrderInternal mẫu",
    "technicianName": "ServiceOrderInternal mẫu",
    "partName": "ServiceOrderInternal mẫu",
    "serviceType": "STANDARD",
    "orderType": "STANDARD",
    "customerType": "STANDARD",
    "items": [
      {
        "serviceName": "ServiceOrderInternal mẫu",
        "price": 2500000,
        "serviceId": 51001,
        "currency": "service-order-internal-sample-20260506"
      }
    ],
    "vehiclePlate": "2026-05-06T10:30:00+07:00",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Vios",
    "vehicleVersion": "service-order-internal-sample-20260506",
    "vehicleYear": 2024
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/service-orders/{tenantId}/{code}/reopen-from-settled`

Cập nhật service order internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10,
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "SO-20260506-0001",
    "status": "ACTIVE",
    "name": "ServiceOrderInternal mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/service-orders/{tenantId}/{code}/settle`

Cập nhật service order internal theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10,
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "SO-20260506-0001",
    "status": "ACTIVE",
    "name": "ServiceOrderInternal mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/service-orders/{tenantId}/{id}/for-settlement`

Lấy dữ liệu service order internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001",
    "customerName": "ServiceOrderInternal mẫu",
    "customerAmounts": {
      "totalServiceAmount": 2500000,
      "totalPartsAmount": 2500000,
      "discountAmount": 2500000,
      "taxAmount": 2500000,
      "hasItems": true
    },
    "insuranceAmounts": {
      "totalServiceAmount": 2500000,
      "totalPartsAmount": 2500000,
      "discountAmount": 2500000,
      "taxAmount": 2500000,
      "hasItems": true
    },
    "totalServiceAmount": 2500000,
    "totalPartsAmount": 2500000,
    "discountAmount": 2500000,
    "taxAmount": 2500000,
    "hasItems": true,
    "customerPhone": "0909123456",
    "hasInsurance": true
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/service-orders/{tenantId}/detail/{code}`

Lấy dữ liệu protected service order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "SO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "SO-20260506-0001",
    "customerCode": "SO-20260506-0001",
    "organizationTaxCode": "SO-20260506-0001",
    "settlementCode": "SO-20260506-0001",
    "serviceCode": "SO-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.PROTECTED_SERVICE_ORDER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.PROTECTED_SERVICE_ORDER_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.PROTECTED_SERVICE_ORDER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.PROTECTED_SERVICE_ORDER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-sales.PROTECTED_SERVICE_ORDER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.PROTECTED_SERVICE_ORDER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/service-orders/{tenantId}/vehicle-summaries`

Tạo mới service order internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tenantId": 10
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "totalSpent": 2500000,
      "vehicleId": 51001,
      "lastServiceAt": "2026-05-06T10:30:00+07:00",
      "visitCount": 1001
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-sales.SERVICE_ORDER_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 3bis. Insurance Settlement — additive changes (DESIGN — FEAT-INS-SO-ADJUSTMENT, FEAT-INS-DASH-DEBT)

> ⚠️ Thiết kế (ADR-014), chưa có trong source. Tất cả **additive, backward-compat** (cùng major version). Headers `Authorization`, `X-Tenant-Id`, `X-Branch-Id`.

### 3bis.1 Additive — SO Edit/Detail (`PUT /api/v3/service-orders/{id}`, `GET /api/v3/service-orders/detail/{code}`)

Request/response bổ sung block điều chỉnh BH + Nguồn TT per dòng. **Chỉ Edit + Detail — KHÔNG Create** (BR-INS-SO-PS-006: Create = báo giá sơ bộ gửi BH duyệt). Mỗi `items[]`/`parts[]` có `payer: "BH"|"KH"` (đã có enum `Payer`). Bổ sung:
```json
{
  "discountMaterialMode": "PERCENT|AMOUNT",
  "discountMaterialValue": 0,
  "discountLaborMode": "PERCENT|AMOUNT",
  "discountLaborValue": 0,
  "depreciationDefaultPercent": 0,
  "claimReductionMode": "PERCENT|AMOUNT",
  "claimReductionValue": 0,
  "insuranceDeductibleAmount": 0,
  "parts": [ { "id": 1, "payer": "BH", "depreciationPercent": 30 } ]
}
```
**Response (Detail)** trả thêm `settlementSummary` (derived realtime — BR-EP §7.2):
```json
{ "settlementSummary": {
  "breakdownServiceInsurance": 21000000, "breakdownServiceCustomer": 0,
  "breakdownPartsInsurance": 168000000, "breakdownPartsCustomer": 30000000,
  "breakdownVatInsurance": 18900000, "breakdownVatCustomer": 3000000,
  "breakdownTotalAfterVatInsurance": 207900000, "breakdownTotalAfterVatCustomer": 33000000,
  "insurancePayable": 197680000, "customerPayable": 35720000, "totalPayable": 233400000
} }
```
**Validation**: VLD-INS-SO-001 (mỗi dòng có payer), VLD-INS-SO-002 (chọn công ty BH), VLD-INS-SO-003 (% ∈ [0,100] — reject `<0`/`>100`), VLD-INS-SO-004 (số tiền ≥0 — reject `<0`, `0` hợp lệ, ≤ cơ sở), VLD-INS-SO-005 (BH payable <0 → **cảnh báo, vẫn cho lưu** — ✅ chốt 2026-05-31), **VLD-INS-SO-006 (mode ∈ {PERCENT, AMOUNT} — validate server-side; mode rỗng/sai → `400 INVALID_ALLOCATION_MODE`)**. Khấu hao chỉ phụ tùng BH (BR-INS-SO-ADJ-005). **Single-payer (BR-EP CALC-INS-006)**: nếu chỉ có dòng BH hoặc chỉ có dòng KH, `breakdown*Insurance`/`breakdown*Customer` của nhóm rỗng = `0` (KHÔNG null) — server vẫn trả đủ 8 breakdown fields.

**Error 400 (mode sai)**:
```json
{ "code": "INVALID_ALLOCATION_MODE", "message": "Chế độ phân bổ không hợp lệ — chỉ chấp nhận 'PERCENT' hoặc 'AMOUNT'", "field": "discountMaterialMode" }
```

### 3bis.2 Additive — `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement`

Endpoint snapshot (gf-accounting gọi khi tạo Phiếu QT BH — CB-INS-002). Response bổ sung (giữ nguyên `customerAmounts`/`insuranceAmounts` + `insuranceCompany` hiện có — `insuranceCompany` baseline đã lưu mã CTBH):
```json
{
  "discountMaterialMode": "PERCENT|AMOUNT", "discountMaterialValue": 0,
  "discountLaborMode": "PERCENT|AMOUNT", "discountLaborValue": 0,
  "depreciationDefaultPercent": 0,
  "claimReductionMode": "PERCENT|AMOUNT", "claimReductionValue": 0,
  "insuranceDeductibleAmount": 0,
  "breakdownServiceInsurance": 21000000, "breakdownServiceCustomer": 0,
  "breakdownPartsInsurance": 168000000, "breakdownPartsCustomer": 30000000,
  "breakdownVatInsurance": 18900000, "breakdownVatCustomer": 3000000,
  "breakdownTotalAfterVatInsurance": 207900000, "breakdownTotalAfterVatCustomer": 33000000,
  "insurancePayableAmount": 197680000,
  "customerPayableAmount": 35720000,
  "lines": [ { "lineId":1, "type":"PART|SERVICE", "payer":"BH", "depreciationPercent":30 } ],
  "bookingCode": "LH-20260810-00007",
  "externalBookingId": "DP-BK-99001",
  "isDriverPlusSource": true
}
```

**Additive 2026-08-10 (ADR-031 — đồng bộ chứng từ Driver+)**: 3 field cuối cho phép `gf-accounting` biết phiếu QT có thuộc booking nguồn Driver+ hay không **mà không đọc DB `gf-sales`** (Critical Rule #1).

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `bookingCode` | String | ➖ | Mã lịch hẹn GMS liên kết SO; `null` nếu SO không có booking | `FEAT-STL-CREATE` AC-3 · `BR-STL-CRE-008` |
| `externalBookingId` | String | ➖ | Mã lịch hẹn phía Driver+; `null` nếu booking không có nguồn D+ | `gf-sales-events.md` §3.8 (field production) |
| `isDriverPlusSource` | Boolean | ✅ | `true` khi booking liên kết có nguồn Driver+ — **điều kiện emit** `DOCUMENT.SETTLEMENT.SYNC`. Consumer cũ bỏ qua field này | `BR-STL-CRE-008` · ADR-031 D3 |

Backward-compat: thuần additive, không đổi field hiện hữu (ADR-013).

gf-accounting snapshot các scalar fields này vào `settlement_records` (immutable). Amount đã tính ở gf-sales — gf-accounting KHÔNG tự tính (BR-GF-ACCOUNTING-006).

### 3bis.3 NEW — `GET /api/v2/dashboard/insurance-debt-widget` (FEAT-INS-DASH-DEBT)

| | |
|---|---|
| Method/Path | `GET /api/v2/dashboard/insurance-debt-widget?period=...` |
| Module | DashboardRealTime | Auth | authenticated |

Widget công nợ BH: 3 KPI + 2 top-list. gf-sales **aggregation/UI** — gọi REST gf-accounting `/protected/v1/insurance-debt-summary` (CB-INS-008), cache Redis TTL 5 phút (ADR-015 — KHÔNG event eviction). KHÔNG query DB cross-boundary.
**Query**: `period=YESTERDAY|THIS_WEEK|LAST_WEEK|THIS_MONTH|LAST_MONTH` (default THIS_MONTH — BR-INS-DASH-006).
**Response 200**: `{ "data": { "totalReceivable":..., "collectedInPeriod":..., "pendingVoucherCount":..., "topPendingByAmount":[...top5], "topOverdueByAge":[...top5] } }` (passthrough/shape từ debt-summary).

### 3bis.4 Error codes — Insurance allocation (canonical `INS_*` — CR-1780980611, HTTP cập nhật CR-1781085632)

> **Contract**: gf-sales **emit `INS_*` code trực tiếp** (registry `BR-EP-INSURANCE-SETTLEMENT.md` §5.5 — single source of truth) trong error body, đúng HTTP status; agg-garage-graph passthrough vào GraphQL `extensions.code`; FE bind theo `code` (KHÔNG parse message). Áp dụng cho `PUT /api/v3/service-orders/{id}` + `GET .../for-settlement` (validation khoản điều chỉnh BH). Thay thế mã ad-hoc cũ (`INVALID_ADJUSTMENT_PERCENT`/`INVALID_ADJUSTMENT_AMOUNT`/`INVALID_ALLOCATION_MODE`/`NEGATIVE_*`). FIX: agent-fix-gf-sales.
>
> **HTTP status update (CR-1781085632, 2026-06-10)**: 5 mã VALIDATION (INS-1002/1003/1004/1005/1008) đổi từ `422 → 400`. Registry codes giữ. Lý do pragmatic: FE/Mobile error boundary treat 422 như crash. Partial-supersedes CR-1780980611 cột HTTP. INS-1006 (200 warning) không đổi.

| Code (`INS_*`) | Num | HTTP | Điều kiện | Mã ad-hoc cũ (thay thế) | Nguồn |
|---|---|---|---|---|---|
| `INS_SO_COMPANY_REQUIRED` | INS-1002 | 400 | Chưa chọn công ty BH trước khi nhập điều chỉnh. | (mới) | AC-2 · VLD-INS-SO-002 |
| `INS_ADJ_PERCENT_OUT_OF_RANGE` | INS-1003 | 400 | `%` ngoài [0,100] (discount/depreciation/claim). | `INVALID_ADJUSTMENT_PERCENT` (400) | AC-14 · VLD-INS-SO-003 |
| `INS_ADJ_AMOUNT_EXCEEDS_BASE` | INS-1004 | 400 | Số tiền điều chỉnh > cơ sở Cộng sau VAT của bên BH. | `INVALID_ADJUSTMENT_AMOUNT` (400) | AC-14 · VLD-INS-SO-004 |
| `INS_ADJ_VALUE_NEGATIVE` | INS-1005 | 400 | Giá trị điều chỉnh/khấu trừ < 0. | `INVALID_ADJUSTMENT_AMOUNT`/generic (400) | AC-14 · VLD-INS-SO-004 |
| `INS_ADJ_BH_PAYMENT_NEGATIVE` | INS-1006 | **200 (warning, non-block)** | BH thanh toán tính ra < 0 → **cho lưu kèm cảnh báo**, KHÔNG reject. | `INVALID_ADJUSTMENT_AMOUNT` (400 reject) — **đổi hành vi** | AC-12 · CALC-INS-004 |
| `INS_ADJ_MODE_INVALID` | INS-1008 | 400 | `mode` ∉ {PERCENT, AMOUNT}. gf-sales validate enum (SDL enum chặn sớm ở agg; REST trực tiếp emit code này). | `INVALID_ALLOCATION_MODE` (400) | AC-14 · VLD-INS-SO-006 |

Cross-cutting (mọi endpoint): `INS_FORBIDDEN_TENANT` (INS-9001/403), `INS_UNAUTHENTICATED` (INS-9002/401), `INS_INTERNAL_ERROR` (INS-9000/500). Xem registry §5.5.

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.
- **(Insurance — CR-1780980611)** Không throw raw exception / mã ad-hoc cho lỗi nghiệp vụ BH; phải map về `INS_*` registry code (§3bis.4, BR-EP §5.5) + đúng HTTP status. Không reject (4xx) trường hợp BH thanh toán < 0 — phải trả 200 + warning `INS_ADJ_BH_PAYMENT_NEGATIVE` (non-block).
- ❌ **(W07 Driver+)** Rename canonical field Driver+ ở BFF/FE/Mobile — 1 concept ↔ 1 name across 4 tier (§5 Naming Registry).
- ❌ **(W07 Driver+)** Dùng field không có row trong §5 Naming Registry cho payload Driver+ (alien field) — Reviewer G11 P0.

---

## 5. Naming Registry (cross-tier canonical names)

> **Rule (Reviewer G11 enforce — P0)**: 1 concept ↔ 1 canonical name across BE / BFF / FE / Mobile.
>
> **Phạm vi hiện tại: domain tích hợp Driver+ (W07)**. Các module baseline (booking/SO/settlement) chưa backfill registry — nợ kỹ thuật riêng, ngoài scope W07.
>
> **Lưu ý surface**: W07 **không** thêm REST endpoint nào cho `gf-sales` — tích hợp Driver+ thuần Kafka (ADR-029). Registry dưới đây tồn tại để field **event payload** ([`gf-sales-events.md`](../events/gf-sales-events.md) §3.1/§3.3/§3.8/§3.9/§3.9bis) và **DB column** ([`gf-sales-data-model.md`](../data/gf-sales-data-model.md) §2ter) dùng chung 1 tên canonical, và để FE/Mobile hiển thị đúng tên field khi render booking nguồn Driver+.

### 5.1. DTO / event payload fields

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Mã lịch hẹn phía Driver+ | `externalBookingId` | `externalBookingId: String` | `externalBookingId: string` | `externalBookingId` | `gf-sales-events.md` §3.8 (field production) |
| Số điện thoại (khách) | `customerPhone` | `customerPhone: String!` | `customerPhone: string` | `customerPhone` | INBOUND AC-2 (1/5 bắt buộc) |
| Tên (khách) | `customerName` | `customerName: String!` | `customerName: string` | `customerName` | INBOUND AC-2 |
| Ngày hẹn | `appointmentDate` | `appointmentDate: Date!` | `appointmentDate: string` | `appointmentDate` | INBOUND AC-2 |
| Giờ hẹn | `appointmentTime` | `appointmentTime: String!` | `appointmentTime: string` | `appointmentTime` | INBOUND AC-2 (bước 15 phút) |
| Loại dịch vụ (macro Driver+) | `driverPlusServiceType` | `driverPlusServiceType: String` | `driverPlusServiceType: string \| null` | `driverPlusServiceType` | INBOUND AC-2, **AC-3** — **khác** `serviceType` (danh mục GMS) |
| Biển số xe | `vehiclePlate` | `vehiclePlate: String` | `vehiclePlate: string \| null` | `vehiclePlate` | INBOUND AC-2 |
| Số VIN | `vehicleVin` | `vehicleVin: String` | `vehicleVin: string \| null` | `vehicleVin` | INBOUND AC-2 |
| Số km | `vehicleOdo` | `vehicleOdo: Int` | `vehicleOdo: number \| null` | `vehicleOdo` | INBOUND AC-2 |
| Hãng xe | `vehicleBrand` | `vehicleBrand: String` | `vehicleBrand: string \| null` | `vehicleBrand` | INBOUND AC-2 |
| Dòng xe | `vehicleModel` | `vehicleModel: String` | `vehicleModel: string \| null` | `vehicleModel` | INBOUND AC-2 |
| Năm sản xuất | `vehicleYear` | `vehicleYear: String` | `vehicleYear: string \| null` | `vehicleYear` | INBOUND AC-2 |
| Phiên bản xe | `vehicleVersion` | `vehicleVersion: String` | `vehicleVersion: string \| null` | `vehicleVersion` | INBOUND AC-2 |
| Hình ảnh xe | `vehicleImages` | `vehicleImages: [String!]` | `vehicleImages: string[] \| null` | `vehicleImages` | INBOUND AC-2 |
| Mô tả tình trạng xe/Ghi chú | `vehicleConditionDescription` | `vehicleConditionDescription: String` | `vehicleConditionDescription: string \| null` | `vehicleConditionDescription` | INBOUND AC-2 (1 trường gộp) |
| Nguồn hủy | `cancelSource` | `cancelSource: CancelSource` | `cancelSource: CancelSource \| null` | `cancelSource` | `BR-BOOK-023` · OUTBOUND AC-4 |
| Trạng thái chuẩn hoá gửi Driver+ | `driverPlusStatus` | `driverPlusStatus: String` | `driverPlusStatus: string` | `driverPlusStatus` | OUTBOUND AC-1..AC-5 |
| Khoá đối chiếu request gốc | `correlation.requestEventId` | `requestEventId: String!` | `requestEventId: string` | `requestEventId` | ADR-029 |

**Cross-artifact check** — DB column ([`gf-sales-data-model.md`](../data/gf-sales-data-model.md)): `cancel_source` ↔ `cancelSource`; `driverplus_service_type` ↔ `driverPlusServiceType`; 13 trường còn lại map vào cột **đã tồn tại** của `booking`/`booking_details` (bảng mapping: `gf-sales-events.md` §3.8) — tên cột legacy **không đổi** trong W07, mapping do adapter đảm nhiệm.

### 5.2. Enums (full values verbatim)

| Enum type | Values | Cite |
|---|---|---|
| `CancelSource` | `DRIVERPLUS_USER \| GARAGE_INTERNAL \| NO_SHOW_AUTO` | `BR-BOOK-023` (liệt kê đủ 3) |
| `DriverPlusServiceType` (giá trị wire, verbatim tiếng Việt — **không** map sang code) | `Car Spa \| Bảo dưỡng \| Sửa chữa` | INBOUND AC-2, AC-3 · `FEAT-DP-034` §7 |
| `DriverPlusBookingStatus` (5 nhãn chuẩn hoá gửi D+, verbatim) | `Chờ xác nhận \| Đã xác nhận \| Từ chối \| Xe đã đến \| Đã hủy` | OUTBOUND AC-1..AC-5 |
| `BookingStatus` (enum kỹ thuật nội bộ, **không đổi** W07) | `BOOKING \| BOOKED \| ARRIVED \| CANCELLED \| DECLINED \| NO_SHOW` | `gf-sales-events.md` §3.1 (payload production) |
| `BookingMessageStep` (Driver+ scope) | `BOOKING.CREATE.REQUEST \| BOOKING.CREATE.RESPONSE \| BOOKING.CANCELLED \| BOOKING.CHANGE.STATUS \| BOOKING.CANCEL.RESPONSE` *(step cuối mới W07)* | `gf-sales-events.md` §2bis.1 D2/D6 |

**Mapping `BookingStatus` → `DriverPlusBookingStatus`** (bắt buộc, 1 chiều): `BOOKING`→`Chờ xác nhận` · `BOOKED`→`Đã xác nhận` · `DECLINED`→`Từ chối` · `ARRIVED`→`Xe đã đến` · `CANCELLED`→`Đã hủy` · `NO_SHOW`→`Đã hủy` (`BR-BOOK-018` — NO_SHOW và CANCELLED cùng hiển thị "Đã hủy").

### 5.2bis. Đồng bộ chứng từ Driver+ (ad-hoc 2026-08-10, ADR-031)

> Field **event payload** của 2 step `DOCUMENT.SERVICE_ORDER.*` ([`gf-sales-events.md`](../events/gf-sales-events.md) §3.10/§3.11). Dùng chung tên canonical với `gf-accounting` ([`gf-accounting-api.md`](gf-accounting-api.md) §6.5) — 2 producer, 1 topic, D+ parse 1 shape.

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Mã chứng từ | `documentCode` | *(không expose BFF)* | *(không expose FE)* | *(không expose Mobile)* | `FEAT-SO-DETAIL` AC-17 · `FEAT-STL-CREATE` AC-3 |
| Loại chứng từ | `documentType` | — | — | — | `BR-STL-CRE-008` (2 loại giữ riêng) |
| Mã phiếu dịch vụ | `serviceOrderCode` | `serviceOrderCode: String!` | `serviceOrderCode: string` | `serviceOrderCode` | `KG.gf-sales.entities.ServiceOrder.code` |
| Mã lịch hẹn | `bookingCode` | `bookingCode: String` | `bookingCode: string` | `bookingCode` | `FEAT-SO-DETAIL` AC-17 |
| Mã lịch hẹn phía Driver+ | `externalBookingId` | `externalBookingId: String` | `externalBookingId: string` | `externalBookingId` | §5.1 (đã có, tái dùng) |
| Đường dẫn tệp | `file.fileUrl` | — | — | — | ADR-031 D4 |
| Tên tệp | `file.fileName` | — | — | — | ADR-016 (`pdf_file_name`) |
| Kiểu MIME | `file.mimeType` | — | — | — | ADR-016 §Phase B |
| Mã kiểm tra toàn vẹn | `file.checksum` | — | — | — | ADR-031 D4 |
| Hạn tải tệp | `file.expiresAt` | — | — | — | ADR-031 D4 |
| Lý do thu hồi | `revokedReason` | — | — | — | `FEAT-SO-DETAIL` AC-22/AC-23 (Ghi chú bắt buộc) |
| Khoá đối chiếu bản đồng bộ gốc | `correlation.syncEventId` | — | — | — | ADR-031 D3 |

| Enum type | Values | Cite |
|---|---|---|
| `DocumentType` | `SERVICE_ORDER \| SETTLEMENT` | ADR-031 D3 (2 loại phiếu) |
| `DocumentMessageStep` | `DOCUMENT.SERVICE_ORDER.SYNC \| DOCUMENT.SETTLEMENT.SYNC \| DOCUMENT.SERVICE_ORDER.REVOKED` | ADR-031 D3 (3 step — `SETTLEMENT.REVOKED` gỡ round 2: `FEAT-STL-DETAIL` EC-7 đã bị Business Authority gỡ 2026-08-03, không có luồng hủy phiếu QT) |

> **Không expose ra BFF/FE/Mobile**: chứng từ đi thẳng GMS → Driver+ qua Kafka, không có màn hình GMS nào hiển thị các field này. Cột "—" là có chủ đích, không phải thiếu sót.

### 5.3. Path params

Không áp dụng cho W07 và cho đợt document sync (ADR-031) — tích hợp Driver+ thuần Kafka, không có REST path param mới. Path param baseline (`/api/v3/bookings/{id}`) **không đổi**.

---

## 6. References

- HLD: [gf-sales-HLD.md](../hld/gf-sales-HLD.md)
- Events: [gf-sales-events.md](../events/gf-sales-events.md) — **§2bis DELTA W07 Driver+ · §3.1/§3.3/§3.8/§3.9/§3.9bis**
- Data model: [gf-sales-data-model.md](../data/gf-sales-data-model.md) — **§2ter additive columns W07**
- ADR: ADR-014 (Insurance Settlement ownership), ADR-015 (debt-summary), **ADR-029 (giao thức Driver Plus — W07)**
- BR: BR-EP-INSURANCE-SETTLEMENT (VLD-INS-SO-*, BR-INS-SO-ADJ-*, BR-INS-SO-PS-*, BR-INS-DASH-*, §7 calculation); BR-GF-SALES-014/016; **`BR-GF-SALES.md` §1 BR-CROSS-006 + §2.1 BR-BOOK-005/013/022/023/024/025 + §3.1 (W07)**
- Product (document sync, ADR-031): `FEAT-SO-DETAIL` AC-17/AC-22..24 + `BR-SO-DTL-007`
- Product (W07): `FEAT-BOOK-DRIVERPLUS-INBOUND` · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` · `ERROR-CODE-REGISTRY.md` §6 (`ERR-BOOK-001/002`)
- Integration: [INTEG-EXT-gf-sales.md](../integrations/INTEG-EXT-gf-sales.md), [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md), **[INTEG-EXT-driver-plus.md](../integrations/INTEG-EXT-driver-plus.md)**

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-10 | v13 | **P0 fix round 2 (mandate Q7) — §3bis.2 `for-settlement` +3 field additive** `bookingCode` + `externalBookingId` + `isDriverPlusSource`, cho phép `gf-accounting` xác định phiếu QT thuộc booking nguồn Driver+ **mà không đọc DB gf-sales** (đóng vi phạm Critical Rule #1 — trước đó payload `DOCUMENT.SETTLEMENT.SYNC` đánh `bookingCode` Required nhưng snapshot không mang được trường nào). Backward-compat thuần additive (ADR-013). Kèm mandate Q8: §5.2bis enum `DocumentMessageStep` gỡ `DOCUMENT.SETTLEMENT.REVOKED` (còn 3 step). **KHÔNG thêm endpoint** — §2 Endpoint Summary không đổi. v12 → v13. |
| 2026-08-10 | v12 | **§5.2bis MỚI — Naming Registry cho đồng bộ chứng từ Driver+ (ADR-031)**: 12 field payload + 2 enum (`DocumentType`, `DocumentMessageStep`) dùng chung với `gf-accounting-api.md` §6.5. Ghi rõ các field **không** expose BFF/FE/Mobile (Kafka-only, không có màn hình GMS). §5.3 note mở rộng (vẫn không có REST path param mới), §6 References +Product. **KHÔNG thêm endpoint REST nào** — §2 Endpoint Summary không đổi. v11 → v12. |
| 2026-08-05 | v11 | **W07 Driver+ integration rewrite (DESIGN)** — thêm **§5 Naming Registry** (5.1 DTO/event payload 18 concept · 5.2 enum 5 loại full values verbatim + bảng mapping `BookingStatus`→`DriverPlusBookingStatus` · 5.3 path param N/A); §5 References cũ renumber → **§6** (+ADR-029, +INTEG-EXT-driver-plus, +Product/BR W07). §4 Forbidden +2 rule naming. **KHÔNG thêm endpoint REST** — tích hợp Driver+ thuần Kafka per ADR-029; §1/§2/§3/§3bis giữ nguyên toàn bộ. v10 → v11. |
| 2026-05-07 | v1 | Initial API spec cho `gf-sales`: REST/JSON với public APIs (`/api/v2` + `/api/v3`, bearer JWT/security-context) cho booking CRUD/lifecycle (confirm/decline/cancel/arrive, check-availability, search) ở cả v2 và v3, service order CRUD/lifecycle (start/complete/cancel, payments, OCR upload, search), quotation ask handoff (linked-service-order theo id/code), customer/vehicle suggest, dashboard realtime metrics (so-in-progress, booking-arrived-without-so, total-so-debt) và service order printing (export PDF/image, print preview); cộng protected APIs (`/protected/v1`) cho settlement handoff sang `gf-accounting`. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
| 2026-05-30 | v2 | **Insurance Settlement additive (DESIGN — FEAT-INS-SO-ADJUSTMENT/DASH-DEBT, CR-1780147390, ADR-014)**: thêm §3bis — SO Edit/Detail bổ sung `insuranceAdjustments` + `payer`/`depreciationPercent` per dòng (Edit/Detail only, KHÔNG Create); `for-settlement` bổ sung `breakdownByPayer`/adjustments/insurancePayableAmount (snapshot cho gf-accounting CB-INS-002); endpoint mới `GET /api/v2/dashboard/insurance-debt-widget` (gọi REST gf-accounting debt-summary, CB-INS-008). VLD-INS-SO-*. Update §2 summary, §5 references. Additive backward-compat. |
| 2026-05-31 | v3 | **Resolve Open Question (Delivery Lead)**: VLD-INS-SO-005 — BH payable < 0 → cảnh báo, vẫn cho lưu (không block). |
| 2026-05-31 | v4 | **ADR renumber 4→3** (gộp ADR-015 workflow vào ADR-014): debt-summary = ADR-015 (§5 references). |
| 2026-06-01 | v5 | **Đổi field `insuranceCompanyId` (id) → `insuranceCode` (code, `mdm_catalog.code`, `directory='INSURANCE'`)** trong SO Edit/Detail request + `for-settlement` response (§3bis.1, §3bis.2) — khớp convention baseline code-based (ADR-014 v4). |
| 2026-06-02 | v6 | **Bỏ `insuranceCode`** khỏi SO Edit/Detail request (§3bis.1) + `for-settlement` response (§3bis.2): `insurance_company` (VARCHAR baseline) đã lưu mã CTBH (v.d. `INS_BSH`). ADR-014 v5. |
| 2026-06-03 | v7 | **Flatten JSONB → scalar fields**: §3bis.1 thay `insuranceAdjustments` nested → 8 flat fields; `breakdownByPayer` nested → 8 flat fields (`breakdownServiceInsurance`, etc.). §3bis.2 `for-settlement` cùng flatten. §3bis.3 widget cache → TTL-only (xoá event eviction `insurance-payment-recorded`). |
| 2026-06-04 | v8 | **Đóng spec-gap validate (root-cause W01)**: §3bis.1 thêm **VLD-INS-SO-006** (mode ∈ {PERCENT,AMOUNT} validate server-side → `400 INVALID_ALLOCATION_MODE`) + ví dụ response 400; làm rõ VLD-003/004 (reject `<0`); note single-payer (breakdown nhóm rỗng = 0, không null — CALC-INS-006). Đồng bộ BR-EP v19, FEAT-INS-SO-ADJUSTMENT v16, PKG-W01 v11. |
| 2026-06-09 | v9 | **+§3bis.4 Error codes Insurance (`INS_*` canonical — CR-1780980611)**: gf-sales emit registry code trực tiếp + đúng HTTP status (INS-1002/1003/1004/1005/1006/1008), thay mã ad-hoc cũ (`INVALID_ADJUSTMENT_PERCENT/AMOUNT/ALLOCATION_MODE`). Đổi hành vi INS-1006 (BH payment < 0): reject 400 → **warning 200 non-block**. % & amount: 400 → **422**. Thêm Forbidden Pattern (no raw exception, map về INS_*). Nguồn BR-EP §5.5 (v21, +`INS_ADJ_MODE_INVALID` INS-1008). FIX: agent-fix-gf-sales. |
| 2026-06-10 | v10 | **§3bis.4 HTTP status `422 → 400` cho 5 mã VALIDATION** (CR-1781085632): INS-1002/1003/1004/1005/1008. Registry codes giữ. Lý do: FE/Mobile error boundary treat 422 như crash → đổi 400 cho FE bắt vào nhánh field-error. Partial-supersedes CR-1780980611 cột HTTP. INS-1006 (200 warning) unchanged. Đồng bộ BR-EP §5.5 v22, INTEG-BFF-GF-SALES-INSURANCE §6 v5, agent-test-api. FIX: agent-fix-gf-sales (BE emit status 400). |
