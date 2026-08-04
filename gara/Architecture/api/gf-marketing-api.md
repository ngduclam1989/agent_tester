---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-marketing
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-marketing-HLD.md"
---

# REST API - `gf-marketing`

> API contract cho boundary `gf-marketing`, quản lý campaign, segment, voucher program, voucher usage và notification integration cho marketing flows.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-marketing` |
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
| 1 | `GET` | `/api/v1/campaigns` | Campaign | authenticated |
| 2 | `POST` | `/api/v1/campaigns` | Campaign | authenticated |
| 3 | `DELETE` | `/api/v1/campaigns/{campaignId}` | Campaign | authenticated |
| 4 | `GET` | `/api/v1/campaigns/{campaignId}` | Campaign | authenticated |
| 5 | `PUT` | `/api/v1/campaigns/{campaignId}` | Campaign | authenticated |
| 6 | `POST` | `/api/v1/campaigns/{campaignId}/cancel` | Campaign | authenticated |
| 8 | `POST` | `/api/v1/campaigns/{campaignId}/pause` | Campaign | authenticated |
| 9 | `POST` | `/api/v1/campaigns/{campaignId}/resume` | Campaign | authenticated |
| 12 | `POST` | `/api/v1/campaigns/{campaignId}/start` | Campaign | authenticated |
| 13 | `GET` | `/api/v1/campaigns/{campaignId}/stats` | Campaign | authenticated |
| 14 | `GET` | `/api/v1/campaigns/{campaignId}/waves` | CampaignWave | authenticated |
| 15 | `GET` | `/api/v1/campaigns/{campaignId}/waves/{waveId}` | CampaignWave | authenticated |
| 16 | `POST` | `/api/v1/campaigns/{campaignId}/waves/{waveId}/cancel` | CampaignWave | authenticated |
| 17 | `POST` | `/api/v1/campaigns/{campaignId}/waves/{waveId}/pause` | CampaignWave | authenticated |
| 18 | `POST` | `/api/v1/campaigns/{campaignId}/waves/{waveId}/resume` | CampaignWave | authenticated |
| 19 | `GET` | `/api/v1/campaigns/{campaignId}/waves/executions/{executionId}` | CampaignWave | authenticated |
| 20 | `GET` | `/api/v1/campaigns/code/{code}` | Campaign | authenticated |
| 21 | `GET` | `/api/v1/campaigns/messages/{messageId}` | Campaign | authenticated |
| 22 | `POST` | `/api/v1/campaigns/messages/search` | Campaign | authenticated |
| 23 | `POST` | `/api/v1/campaigns/search` | Campaign | authenticated |
| 24 | `GET` | `/api/v1/message-templates` | MessageTemplate | authenticated |
| 25 | `POST` | `/api/v1/message-templates` | MessageTemplate | authenticated |
| 26 | `DELETE` | `/api/v1/message-templates/{templateId}` | MessageTemplate | authenticated |
| 27 | `GET` | `/api/v1/message-templates/{templateId}` | MessageTemplate | authenticated |
| 28 | `PUT` | `/api/v1/message-templates/{templateId}` | MessageTemplate | authenticated |
| 29 | `POST` | `/api/v1/message-templates/{templateId}/activate` | MessageTemplate | authenticated |
| 30 | `POST` | `/api/v1/message-templates/{templateId}/deactivate` | MessageTemplate | authenticated |
| 31 | `GET` | `/api/v1/message-templates/active` | MessageTemplate | authenticated |
| 32 | `POST` | `/api/v1/message-templates/search` | MessageTemplate | authenticated |
| 33 | `POST` | `/api/v1/message-templates/send` | MessageTemplate | authenticated |
| 34 | `GET` | `/api/v1/notification-limits` | NotificationLimits | authenticated |
| 35 | `POST` | `/api/v1/voucher-programs` | VoucherProgram | authenticated |
| 36 | `DELETE` | `/api/v1/voucher-programs/{programId}` | VoucherProgram | authenticated |
| 37 | `GET` | `/api/v1/voucher-programs/{programId}` | VoucherProgram | authenticated |
| 38 | `PUT` | `/api/v1/voucher-programs/{programId}` | VoucherProgram | authenticated |
| 39 | `POST` | `/api/v1/voucher-programs/{programId}/activate` | VoucherProgram | authenticated |
| 40 | `POST` | `/api/v1/voucher-programs/{programId}/cancel` | VoucherProgram | authenticated |
| 41 | `POST` | `/api/v1/voucher-programs/{programId}/generate-qr` | VoucherProgram | authenticated |
| 42 | `POST` | `/api/v1/voucher-programs/{programId}/resume` | VoucherProgram | authenticated |
| 43 | `POST` | `/api/v1/voucher-programs/{programId}/suspend` | VoucherProgram | authenticated |
| 44 | `GET` | `/api/v1/voucher-programs/active` | VoucherProgram | authenticated |
| 45 | `POST` | `/api/v1/voucher-programs/claim-qr` | VoucherProgram | authenticated |
| 46 | `POST` | `/api/v1/voucher-programs/search` | VoucherProgram | authenticated |
| 47 | `GET` | `/api/v1/vouchers/{voucherCode}/voucher-redemption` | Voucher | authenticated |
| 48 | `GET` | `/api/v1/vouchers/{voucherId}` | Voucher | authenticated |
| 49 | `POST` | `/api/v1/vouchers/cancel-batch` | Voucher | authenticated |
| 51 | `GET` | `/api/v1/vouchers/code/{voucherCode}` | Voucher | authenticated |
| 52 | `GET` | `/api/v1/vouchers/customer/{customerId}` | Voucher | authenticated |
| 55 | `POST` | `/api/v1/vouchers/redeem-by-driver` | Voucher | authenticated |
| 57 | `POST` | `/api/v1/vouchers/search` | Voucher | authenticated |
| 58 | `GET` | `/api/v1/vouchers/validate` | Voucher | authenticated |
| 59 | `GET` | `/protected/v1/campaigns/segments/{segmentId}/linked` | CampaignInternal | service-to-service |
| 60 | `POST` | `/protected/v1/voucher-programs/claim-qr` | VoucherProgramInternal | service-to-service |
| 61 | `POST` | `/protected/v1/voucher-programs/redeem-by-driver` | VoucherProgramInternal | service-to-service |

---

## 3. Endpoint Details

### GET `/api/v1/campaigns`

Lấy dữ liệu campaign theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "CMP-20260506-0001",
      "status": "ACTIVE",
      "name": "Campaign mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns`

Tạo mới campaign. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v1/campaigns/{campaignId}`

Xóa hoặc vô hiệu hóa campaign theo định danh được cung cấp.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "status": "ACTIVE",
    "name": "Campaign mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/{campaignId}`

Lấy dữ liệu campaign theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/campaigns/{campaignId}`

Cập nhật campaign theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/cancel`

Hủy campaign theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/pause`

Tạo mới campaign. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/resume`

Tạo mới campaign. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/start`

Lấy dữ liệu campaign theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_START.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_START.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_START.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_START.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_START.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_START.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/{campaignId}/stats`

Lấy dữ liệu campaign theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "totalRecipients": 2500000,
    "campaignId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001,
    "deliveryRate": "2026-05-06T10:30:00+07:00",
    "openRate": "2026-05-06T10:30:00+07:00",
    "clickRate": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/{campaignId}/waves`

Lấy dữ liệu campaign wave theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "name": "CampaignWave mẫu",
      "status": "ACTIVE",
      "tenantId": 10,
      "campaignId": 51001,
      "waveNumber": "CMP-20260506-0001",
      "sentCount": 1001
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/{campaignId}/waves/{waveId}`

Lấy dữ liệu campaign wave theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001,
    "waveId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "CampaignWave mẫu",
    "status": "ACTIVE",
    "tenantId": 10,
    "campaignId": 51001,
    "waveNumber": "CMP-20260506-0001",
    "sentCount": 1001,
    "deliveredCount": 1001,
    "failedCount": 1001,
    "scheduledAt": "2026-05-06T10:30:00+07:00",
    "startedAt": "2026-05-06T10:30:00+07:00",
    "completedAt": "2026-05-06T10:30:00+07:00",
    "templateId": 51001,
    "delayDays": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/waves/{waveId}/cancel`

Hủy campaign wave theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001,
    "waveId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "CampaignWave mẫu",
    "status": "ACTIVE",
    "tenantId": 10,
    "campaignId": 51001,
    "waveNumber": "CMP-20260506-0001",
    "sentCount": 1001,
    "deliveredCount": 1001,
    "failedCount": 1001,
    "scheduledAt": "2026-05-06T10:30:00+07:00",
    "startedAt": "2026-05-06T10:30:00+07:00",
    "completedAt": "2026-05-06T10:30:00+07:00",
    "templateId": 51001,
    "delayDays": 1001
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_WAVE_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/waves/{waveId}/pause`

Tạo mới campaign wave. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001,
    "waveId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "CampaignWave mẫu",
    "status": "ACTIVE",
    "tenantId": 10,
    "campaignId": 51001,
    "waveNumber": "CMP-20260506-0001",
    "sentCount": 1001,
    "deliveredCount": 1001,
    "failedCount": 1001,
    "scheduledAt": "2026-05-06T10:30:00+07:00",
    "startedAt": "2026-05-06T10:30:00+07:00",
    "completedAt": "2026-05-06T10:30:00+07:00",
    "templateId": 51001,
    "delayDays": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/{campaignId}/waves/{waveId}/resume`

Tạo mới campaign wave. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001,
    "waveId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "CampaignWave mẫu",
    "status": "ACTIVE",
    "tenantId": 10,
    "campaignId": 51001,
    "waveNumber": "CMP-20260506-0001",
    "sentCount": 1001,
    "deliveredCount": 1001,
    "failedCount": 1001,
    "scheduledAt": "2026-05-06T10:30:00+07:00",
    "startedAt": "2026-05-06T10:30:00+07:00",
    "completedAt": "2026-05-06T10:30:00+07:00",
    "templateId": 51001,
    "delayDays": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/{campaignId}/waves/executions/{executionId}`

Lấy dữ liệu campaign wave theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "campaignId": 51001,
    "executionId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "executionNumber": "CMP-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_WAVE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/code/{code}`

Lấy dữ liệu campaign theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "CMP-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CMP-20260506-0001",
    "name": "Campaign mẫu",
    "status": "ACTIVE",
    "type": "STANDARD",
    "totalRecipients": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "triggerEvent": "campaign-sample-20260506",
    "voucherProgramId": 51001,
    "sentCount": 1001,
    "deliveredCount": 1001,
    "openedCount": 1001,
    "clickedCount": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/campaigns/messages/{messageId}`

Lấy dữ liệu campaign theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "messageId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "customerName": "Campaign mẫu",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "executionId": 51001,
    "waveId": 51001,
    "waveNumber": "CMP-20260506-0001",
    "customerId": 51001,
    "customerPhone": "0909123456",
    "channel": "campaign-sample-20260506",
    "renderedContent": "campaign-sample-20260506",
    "errorMessage": "campaign-sample-20260506",
    "sentAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/messages/search`

Tra cứu danh sách campaign theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "customerName": "Campaign mẫu",
      "status": "ACTIVE",
      "updatedAt": "2026-05-06",
      "tenantId": 10,
      "executionId": 51001,
      "waveId": 51001,
      "waveNumber": "CMP-20260506-0001",
      "customerId": 51001,
      "customerPhone": "0909123456",
      "channel": "campaign-sample-20260506",
      "renderedContent": "campaign-sample-20260506",
      "errorMessage": "campaign-sample-20260506",
      "sentAt": "2026-05-06T10:30:00+07:00"
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
| `GMS.gf-marketing.CAMPAIGN_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/campaigns/search`

Tra cứu danh sách campaign theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "CMP-20260506-0001",
      "name": "Campaign mẫu",
      "status": "ACTIVE",
      "type": "STANDARD",
      "totalRecipients": 2500000,
      "tenantId": 10,
      "description": "Ghi chú nghiệp vụ mẫu",
      "sentCount": 1001,
      "deliveredCount": 1001,
      "scheduledAt": "2026-05-06T10:30:00+07:00",
      "startedAt": "2026-05-06T10:30:00+07:00",
      "completedAt": "2026-05-06T10:30:00+07:00",
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
| `GMS.gf-marketing.CAMPAIGN_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/message-templates`

Lấy dữ liệu message template theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "MT-20260506-0001",
      "status": "ACTIVE",
      "name": "MessageTemplate mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/message-templates`

Tạo mới message template. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "name": "MessageTemplate mẫu",
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "category": "2026-05-06T10:30:00+07:00",
    "active": true,
    "supportedChannels": [
      "message-template-sample-20260506"
    ],
    "channels": [
      {
        "id": 51001,
        "channel": "message-template-sample-20260506",
        "subject": "message-template-sample-20260506",
        "content": "message-template-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v1/message-templates/{templateId}`

Xóa hoặc vô hiệu hóa message template theo định danh được cung cấp.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "templateId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "MT-20260506-0001",
    "status": "ACTIVE",
    "name": "MessageTemplate mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/message-templates/{templateId}`

Lấy dữ liệu message template theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "templateId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "MessageTemplate mẫu",
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "category": "2026-05-06T10:30:00+07:00",
    "active": true,
    "supportedChannels": [
      "message-template-sample-20260506"
    ],
    "channels": [
      {
        "id": 51001,
        "channel": "message-template-sample-20260506",
        "subject": "message-template-sample-20260506",
        "content": "message-template-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/message-templates/{templateId}`

Cập nhật message template theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "templateId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "MessageTemplate mẫu",
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "category": "2026-05-06T10:30:00+07:00",
    "active": true,
    "supportedChannels": [
      "message-template-sample-20260506"
    ],
    "channels": [
      {
        "id": 51001,
        "channel": "message-template-sample-20260506",
        "subject": "message-template-sample-20260506",
        "content": "message-template-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/message-templates/{templateId}/activate`

Tạo mới message template. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "templateId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "MessageTemplate mẫu",
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "category": "2026-05-06T10:30:00+07:00",
    "active": true,
    "supportedChannels": [
      "message-template-sample-20260506"
    ],
    "channels": [
      {
        "id": 51001,
        "channel": "message-template-sample-20260506",
        "subject": "message-template-sample-20260506",
        "content": "message-template-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/message-templates/{templateId}/deactivate`

Tạo mới message template. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "templateId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "name": "MessageTemplate mẫu",
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "category": "2026-05-06T10:30:00+07:00",
    "active": true,
    "supportedChannels": [
      "message-template-sample-20260506"
    ],
    "channels": [
      {
        "id": 51001,
        "channel": "message-template-sample-20260506",
        "subject": "message-template-sample-20260506",
        "content": "message-template-sample-20260506"
      }
    ]
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/message-templates/active`

Lấy dữ liệu message template theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "MT-20260506-0001",
      "status": "ACTIVE",
      "name": "MessageTemplate mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/message-templates/search`

Tra cứu danh sách message template theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "name": "MessageTemplate mẫu",
      "tenantId": 10,
      "description": "Ghi chú nghiệp vụ mẫu",
      "category": "2026-05-06T10:30:00+07:00",
      "active": true,
      "supportedChannels": [
        "message-template-sample-20260506"
      ],
      "channels": [
        {
          "id": 51001,
          "channel": "message-template-sample-20260506",
          "subject": "message-template-sample-20260506",
          "content": "message-template-sample-20260506"
        }
      ]
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
| `GMS.gf-marketing.MESSAGE_TEMPLATE_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/message-templates/send`

Tạo mới message template. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "MT-20260506-0001",
    "status": "ACTIVE",
    "name": "MessageTemplate mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.MESSAGE_TEMPLATE_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/notification-limits`

Lấy dữ liệu notification limits theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "period": "notification-limits-sample-20260506",
    "channels": [
      {
        "totalSent": 2500000,
        "channel": "notification-limits-sample-20260506",
        "configuredLimit": 20,
        "percentageUsed": 10
      }
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.NOTIFICATION_LIMITS_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.NOTIFICATION_LIMITS_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.NOTIFICATION_LIMITS_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.NOTIFICATION_LIMITS_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.NOTIFICATION_LIMITS_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.NOTIFICATION_LIMITS_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs`

Tạo mới voucher program. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v1/voucher-programs/{programId}`

Xóa hoặc vô hiệu hóa voucher program theo định danh được cung cấp.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "status": "ACTIVE",
    "name": "VoucherProgram mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/voucher-programs/{programId}`

Lấy dữ liệu voucher program theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/voucher-programs/{programId}`

Cập nhật voucher program theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/{programId}/activate`

Tạo mới voucher program. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/{programId}/cancel`

Hủy voucher program theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/{programId}/generate-qr`

Tạo mới voucher program. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "programName": "VoucherProgram mẫu",
    "programId": 51001,
    "campaignId": 51001,
    "qrContent": "voucher-program-sample-20260506",
    "expiresAt": "2026-05-06T10:30:00+07:00",
    "availableCount": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/{programId}/resume`

Tạo mới voucher program. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/{programId}/suspend`

Tạo mới voucher program. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "programId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "VP-20260506-0001",
    "name": "VoucherProgram mẫu",
    "status": "ACTIVE",
    "voucherType": "STANDARD",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "totalQuantity": 2500000,
    "tenantId": 10,
    "description": "Ghi chú nghiệp vụ mẫu",
    "discountValue": 2500000,
    "redeemedQuantity": 2,
    "remainingQuantity": 2,
    "maxClaimsPerCycle": 1001
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/voucher-programs/active`

Lấy dữ liệu voucher program theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "VP-20260506-0001",
      "status": "ACTIVE",
      "name": "VoucherProgram mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/claim-qr`

Tạo mới voucher program. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "voucherCode": "VP-20260506-0001",
    "programName": "VoucherProgram mẫu",
    "discountType": "STANDARD",
    "expiryDate": "2026-05-06",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "discountValue": 2500000,
    "termsAndConditions": "voucher-program-sample-20260506",
    "customerId": 51001,
    "claimedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/voucher-programs/search`

Tra cứu danh sách voucher program theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "VP-20260506-0001",
      "name": "VoucherProgram mẫu",
      "status": "ACTIVE",
      "voucherType": "STANDARD",
      "maxDiscountAmount": 2500000,
      "minOrderAmount": 2500000,
      "totalQuantity": 2500000,
      "tenantId": 10,
      "description": "Ghi chú nghiệp vụ mẫu",
      "discountValue": 2500000,
      "redeemedQuantity": 2,
      "remainingQuantity": 2,
      "maxClaimsPerCycle": 1001
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
| `GMS.gf-marketing.VOUCHER_PROGRAM_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vouchers/{voucherCode}/voucher-redemption`

Lấy dữ liệu voucher theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "voucherCode": "V-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "voucherCode": "V-20260506-0001",
    "customerName": "Voucher mẫu",
    "originalAmount": 2500000,
    "discountAmount": 2500000,
    "finalAmount": 2500000,
    "serviceOrderId": 51001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vouchers/{voucherId}`

Lấy dữ liệu voucher theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "voucherId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "voucherCode": "V-20260506-0001",
    "qrCode": "V-20260506-0001",
    "customerName": "Voucher mẫu",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "voucherProgramId": 51001,
    "customerId": 51001,
    "distributedAt": "2026-05-06T10:30:00+07:00",
    "redeemedAt": "2026-05-06T10:30:00+07:00",
    "expiredAt": "2026-05-06T10:30:00+07:00",
    "claimedAt": "2026-05-06T10:30:00+07:00",
    "claimSource": "voucher-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/vouchers/cancel-batch`

Hủy voucher theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "V-20260506-0001",
    "status": "ACTIVE",
    "name": "Voucher mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vouchers/code/{voucherCode}`

Lấy dữ liệu voucher theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "voucherCode": "V-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "voucherCode": "V-20260506-0001",
    "qrCode": "V-20260506-0001",
    "customerName": "Voucher mẫu",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "voucherProgramId": 51001,
    "customerId": 51001,
    "distributedAt": "2026-05-06T10:30:00+07:00",
    "redeemedAt": "2026-05-06T10:30:00+07:00",
    "expiredAt": "2026-05-06T10:30:00+07:00",
    "claimedAt": "2026-05-06T10:30:00+07:00",
    "claimSource": "voucher-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vouchers/customer/{customerId}`

Lấy dữ liệu voucher theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "voucherCode": "V-20260506-0001",
      "qrCode": "V-20260506-0001",
      "customerName": "Voucher mẫu",
      "status": "ACTIVE",
      "updatedAt": "2026-05-06",
      "tenantId": 10
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/vouchers/redeem-by-driver`

Tạo mới voucher. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "voucherCode": "V-20260506-0001",
    "qrCode": "V-20260506-0001",
    "customerName": "Voucher mẫu",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "voucherProgramId": 51001,
    "customerId": 51001,
    "distributedAt": "2026-05-06T10:30:00+07:00",
    "redeemedAt": "2026-05-06T10:30:00+07:00",
    "expiredAt": "2026-05-06T10:30:00+07:00",
    "claimedAt": "2026-05-06T10:30:00+07:00",
    "claimSource": "voucher-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/vouchers/search`

Tra cứu danh sách voucher theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "voucherCode": "V-20260506-0001",
      "qrCode": "V-20260506-0001",
      "customerName": "Voucher mẫu",
      "status": "ACTIVE",
      "updatedAt": "2026-05-06",
      "tenantId": 10,
      "voucherProgramId": 51001,
      "customerId": 51001,
      "distributedAt": "2026-05-06T10:30:00+07:00",
      "redeemedAt": "2026-05-06T10:30:00+07:00",
      "expiredAt": "2026-05-06T10:30:00+07:00",
      "claimedAt": "2026-05-06T10:30:00+07:00",
      "claimSource": "voucher-sample-20260506"
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
| `GMS.gf-marketing.VOUCHER_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/vouchers/validate`

Lấy dữ liệu voucher theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "id": 51001,
    "voucherCode": "V-20260506-0001",
    "qrCode": "V-20260506-0001",
    "customerName": "Voucher mẫu",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "voucherProgramId": 51001,
    "customerId": 51001,
    "distributedAt": "2026-05-06T10:30:00+07:00",
    "redeemedAt": "2026-05-06T10:30:00+07:00",
    "expiredAt": "2026-05-06T10:30:00+07:00",
    "claimedAt": "2026-05-06T10:30:00+07:00",
    "claimSource": "voucher-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-marketing.VOUCHER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.VOUCHER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/campaigns/segments/{segmentId}/linked`

Lấy dữ liệu campaign internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "id": 51001,
    "code": "CMP-20260506-0001",
    "status": "ACTIVE",
    "name": "CampaignInternal mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.CAMPAIGN_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.CAMPAIGN_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-marketing.CAMPAIGN_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.CAMPAIGN_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-marketing.CAMPAIGN_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.CAMPAIGN_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/voucher-programs/claim-qr`

Tạo mới voucher program internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "voucherCode": "VPI-20260506-0001",
    "programName": "VoucherProgramInternal mẫu",
    "discountType": "STANDARD",
    "expiryDate": "2026-05-06",
    "maxDiscountAmount": 2500000,
    "minOrderAmount": 2500000,
    "discountValue": 2500000,
    "termsAndConditions": "voucher-program-internal-sample-20260506",
    "customerId": 51001,
    "claimedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/voucher-programs/redeem-by-driver`

Tạo mới voucher program internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "voucherCode": "VPI-20260506-0001",
    "qrCode": "VPI-20260506-0001",
    "customerName": "VoucherProgramInternal mẫu",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "voucherProgramId": 51001,
    "customerId": 51001,
    "distributedAt": "2026-05-06T10:30:00+07:00",
    "redeemedAt": "2026-05-06T10:30:00+07:00",
    "expiredAt": "2026-05-06T10:30:00+07:00",
    "claimedAt": "2026-05-06T10:30:00+07:00",
    "claimSource": "voucher-program-internal-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-marketing.VOUCHER_PROGRAM_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-marketing-HLD.md](../hld/gf-marketing-HLD.md)
- Events: [gf-marketing-events.md](../events/gf-marketing-events.md)
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-marketing`: REST/JSON với public APIs (`/api/v1`, bearer JWT/security-context) cho campaign CRUD/search/lifecycle (start/pause/resume/cancel), campaign wave (lifecycle, executions), campaign messages, message template CRUD/activate/deactivate/send, notification limits và voucher program CRUD/lifecycle (activate/cancel/resume, generate-qr); cộng protected APIs (`/protected/v1`) phục vụ marketing service-to-service flows. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
