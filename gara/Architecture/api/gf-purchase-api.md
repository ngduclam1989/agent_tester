---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-purchase
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-purchase-HLD.md"
---

# REST API - `gf-purchase`

> API contract cho boundary `gf-purchase`, quản lý cart, quotation ask/pricing, purchase request/order, direct purchase, supplier, dashboard, tenant/user support và checkout.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-purchase` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1`, `/api/v2`, `/api/v3` |
| Protected prefixes | `/protected/v1` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `GET` | `/api/v1/cart` | Cart | authenticated |
| 2 | `PUT` | `/api/v1/cart` | Cart | authenticated |
| 3 | `DELETE` | `/api/v1/cart/{id}` | Cart | authenticated |
| 4 | `POST` | `/api/v1/cart/add/{sparePartPriceLineItemId}` | Cart | authenticated |
| 5 | `GET` | `/api/v1/dashboard/spending-chart` | DashboardStatistics | authenticated |
| 6 | `GET` | `/api/v1/dashboard/spending-overview` | DashboardStatistics | authenticated |
| 7 | `GET` | `/api/v1/dashboard/stats` | DashboardStatistics | authenticated |
| 8 | `POST` | `/api/v1/direct-purchase-orders` | DirectPurchaseOrder | authenticated |
| 9 | `PUT` | `/api/v1/direct-purchase-orders/{poCode}` | DirectPurchaseOrder | authenticated |
| 10 | `PUT` | `/api/v1/direct-purchase-orders/{poCode}/attachments` | DirectPurchaseOrder | authenticated |
| 11 | `PUT` | `/api/v1/direct-purchase-orders/{poCode}/status` | DirectPurchaseOrder | authenticated |
| 12 | `GET` | `/api/v1/direct-purchase-orders/related-service-order/{serviceOrderCode}` | DirectPurchaseOrder | authenticated |
| 13 | `GET` | `/api/v1/purchase-order/{purchaseId}` | PurchaseOrder | authenticated |
| 14 | `POST` | `/api/v1/purchase-order/{purchaseOrderId}/confirm-received` | PurchaseOrder | authenticated |
| 15 | `POST` | `/api/v1/purchase-order/confirm-received/{code}` | PurchaseOrder | authenticated |
| 16 | `GET` | `/api/v1/purchase-order/detail/{code}` | PurchaseOrder | authenticated |
| 17 | `GET` | `/api/v1/purchase-order/search` | PurchaseOrder | authenticated |
| 18 | `POST` | `/api/v1/purchase-request` | PurchaseRequest | authenticated |
| 19 | `GET` | `/api/v1/purchase-request/{purchaseId}` | PurchaseRequest | authenticated |
| 20 | `PUT` | `/api/v1/purchase-request/cancel` | PurchaseRequest | authenticated |
| 21 | `GET` | `/api/v1/purchase-request/chat/{code}` | PurchaseRequest | authenticated |
| 22 | `PUT` | `/api/v1/purchase-request/confirm/{id}` | PurchaseRequest | authenticated |
| 23 | `GET` | `/api/v1/purchase-request/detail/{code}` | PurchaseRequest | authenticated |
| 24 | `GET` | `/api/v1/purchase-request/saas-tenant` | PurchaseRequest | authenticated |
| 25 | `GET` | `/api/v1/purchase-request/search` | PurchaseRequest | authenticated |
| 26 | `GET` | `/api/v1/quotation-asks` | QuotationAsk | authenticated |
| 27 | `POST` | `/api/v1/quotation-asks` | QuotationAsk | authenticated |
| 28 | `DELETE` | `/api/v1/quotation-asks/{id}` | QuotationAsk | authenticated |
| 29 | `GET` | `/api/v1/quotation-asks/{id}` | QuotationAsk | authenticated |
| 30 | `GET` | `/api/v1/quotation-asks/{quotationAskCode}/histories` | QuotationAsk | authenticated |
| 31 | `GET` | `/api/v1/quotation-asks/chat/{code}` | QuotationAsk | authenticated |
| 32 | `GET` | `/api/v1/quotation-asks/detail/{code}` | QuotationAsk | authenticated |
| 33 | `GET` | `/api/v1/quotation-asks/spare-parts` | QuotationAsk | authenticated |
| 34 | `POST` | `/api/v1/quotation-pricing/request` | QuotationAskPricing | authenticated |
| 35 | `DELETE` | `/api/v1/tenant/current-user` | Tenant | authenticated |
| 36 | `GET` | `/api/v1/tenant/current-user` | Tenant | authenticated |
| 37 | `POST` | `/api/v1/tenant/ecommerce-confirmed` | Tenant | authenticated |
| 38 | `GET` | `/api/v1/tenant/info` | Tenant | authenticated |
| 39 | `POST` | `/api/v1/tenant/tc-data-privacy-confirmed` | Tenant | authenticated |
| 40 | `POST` | `/api/v1/testing/decrypt/{text}` | Testing | authenticated |
| 41 | `POST` | `/api/v1/testing/encrypt/{text}` | Testing | authenticated |
| 42 | `GET` | `/api/v1/testing/payment-checksum/{prId}` | Testing | authenticated |
| 43 | `GET` | `/api/v1/user/preferences` | User | authenticated |
| 44 | `GET` | `/api/v1/variables/mobile` | Variables | authenticated |
| 45 | `GET` | `/api/v2/cart` | CartControllerV2 | authenticated |
| 46 | `PUT` | `/api/v2/cart` | CartControllerV2 | authenticated |
| 47 | `DELETE` | `/api/v2/cart/{id}` | CartControllerV2 | authenticated |
| 48 | `POST` | `/api/v2/cart/add/{sparePartPriceLineItemId}` | CartControllerV2 | authenticated |
| 49 | `GET` | `/api/v2/dashboard/realtime/purchase-orders-delivering-count` | DashboardRealTime | authenticated |
| 50 | `GET` | `/api/v2/dashboard/realtime/quotation-asks-asking-count` | DashboardRealTime | authenticated |
| 51 | `GET` | `/api/v2/dashboard/spending-chart` | DashboardStatisticsControllerV2 | authenticated |
| 52 | `GET` | `/api/v2/dashboard/spending-overview` | DashboardStatisticsControllerV2 | authenticated |
| 53 | `GET` | `/api/v2/dashboard/stats` | DashboardStatisticsControllerV2 | authenticated |
| 54 | `GET` | `/api/v2/feature-flags/mobile` | FeatureFlagControllerV2 | authenticated |
| 55 | `GET` | `/api/v2/purchase-order/{code}/for-receipt` | PurchaseOrderControllerV2 | authenticated |
| 56 | `GET` | `/api/v2/purchase-order/{purchaseId}` | PurchaseOrderControllerV2 | authenticated |
| 57 | `POST` | `/api/v2/purchase-order/{purchaseOrderId}/confirm-received` | PurchaseOrderControllerV2 | authenticated |
| 58 | `POST` | `/api/v2/purchase-order/confirm-received/{code}` | PurchaseOrderControllerV2 | authenticated |
| 59 | `GET` | `/api/v2/purchase-order/detail/{code}` | PurchaseOrderControllerV2 | authenticated |
| 60 | `GET` | `/api/v2/purchase-order/search` | PurchaseOrderControllerV2 | authenticated |
| 61 | `GET` | `/api/v2/purchase-order/search-web` | PurchaseOrderControllerV2 | authenticated |
| 62 | `POST` | `/api/v2/purchase-request` | PurchaseRequestControllerV2 | authenticated |
| 63 | `GET` | `/api/v2/purchase-request/{purchaseId}` | PurchaseRequestControllerV2 | authenticated |
| 64 | `PUT` | `/api/v2/purchase-request/cancel` | PurchaseRequestControllerV2 | authenticated |
| 65 | `PUT` | `/api/v2/purchase-request/change-payment-method/{id}` | PurchaseRequestControllerV2 | authenticated |
| 66 | `GET` | `/api/v2/purchase-request/chat/{code}` | PurchaseRequestControllerV2 | authenticated |
| 67 | `POST` | `/api/v2/purchase-request/checkout/cc/{prId}` | PurchaseRequestControllerV2 | authenticated |
| 68 | `POST` | `/api/v2/purchase-request/checkout/qr/{prId}` | PurchaseRequestControllerV2 | authenticated |
| 69 | `PUT` | `/api/v2/purchase-request/confirm/{id}` | PurchaseRequestControllerV2 | authenticated |
| 70 | `GET` | `/api/v2/purchase-request/detail/{code}` | PurchaseRequestControllerV2 | authenticated |
| 71 | `GET` | `/api/v2/purchase-request/payment-methods` | PurchaseRequestControllerV2 | authenticated |
| 72 | `POST` | `/api/v2/purchase-request/place-order/{prId}` | PurchaseRequestControllerV2 | authenticated |
| 73 | `GET` | `/api/v2/purchase-request/search` | PurchaseRequestControllerV2 | authenticated |
| 74 | `GET` | `/api/v2/purchase-request/search-for-web` | PurchaseRequestControllerV2 | authenticated |
| 75 | `GET` | `/api/v2/quotation-asks` | QuotationAskControllerV2 | authenticated |
| 76 | `POST` | `/api/v2/quotation-asks` | QuotationAskControllerV2 | authenticated |
| 77 | `GET` | `/api/v2/quotation-asks/{code}/preliminary-quotation` | QuotationAskControllerV2 | authenticated |
| 78 | `GET` | `/api/v2/quotation-asks/{id}` | QuotationAskControllerV2 | authenticated |
| 79 | `GET` | `/api/v2/quotation-asks/{quotationAskCode}/histories` | QuotationAskControllerV2 | authenticated |
| 80 | `GET` | `/api/v2/quotation-asks/chat/{code}` | QuotationAskControllerV2 | authenticated |
| 81 | `GET` | `/api/v2/quotation-asks/detail/{code}` | QuotationAskControllerV2 | authenticated |
| 82 | `POST` | `/api/v2/quotation-asks/ocr/upload` | QuotationAskControllerV2 | authenticated |
| 83 | `GET` | `/api/v2/quotation-asks/search-for-web` | QuotationAskControllerV2 | authenticated |
| 84 | `POST` | `/api/v2/quotation-pricing/request` | QuotationAskPricingControllerV2 | authenticated |
| 85 | `POST` | `/api/v2/suppliers` | SupplierControllerV2 | authenticated |
| 86 | `GET` | `/api/v2/suppliers/{supplierId}` | SupplierControllerV2 | authenticated |
| 87 | `PUT` | `/api/v2/suppliers/{supplierId}` | SupplierControllerV2 | authenticated |
| 88 | `POST` | `/api/v2/suppliers/{supplierId}/toggle-status` | SupplierControllerV2 | authenticated |
| 89 | `POST` | `/api/v2/suppliers/search` | SupplierControllerV2 | authenticated |
| 90 | `DELETE` | `/api/v2/tenant/current-user` | TenantControllerV2 | authenticated |
| 91 | `GET` | `/api/v2/tenant/current-user` | TenantControllerV2 | authenticated |
| 92 | `POST` | `/api/v2/tenant/ecommerce-confirmed` | TenantControllerV2 | authenticated |
| 93 | `GET` | `/api/v2/tenant/info` | TenantControllerV2 | authenticated |
| 94 | `POST` | `/api/v2/tenant/tc-data-privacy-confirmed` | TenantControllerV2 | authenticated |
| 95 | `GET` | `/api/v2/user/cards` | UserControllerV2 | authenticated |
| 96 | `DELETE` | `/api/v2/user/cards/{id}` | UserControllerV2 | authenticated |
| 97 | `GET` | `/api/v2/user/preferences` | UserControllerV2 | authenticated |
| 98 | `GET` | `/api/v2/variables/mobile` | VariablesControllerV2 | authenticated |
| 99 | `GET` | `/api/v3/purchase-order/detail/{code}` | PurchaseOrderControllerV3 | authenticated |
| 100 | `GET` | `/api/v3/purchase-order/search` | PurchaseOrderControllerV3 | authenticated |
| 101 | `POST` | `/api/v3/purchase-order/supplier-names` | PurchaseOrderControllerV3 | authenticated |
| 102 | `GET` | `/api/v3/purchase-order/tenant-transporter-registry/{id}/references` | PurchaseOrderControllerV3 | authenticated |
| 103 | `POST` | `/api/v3/quotation-asks` | QuotationAskControllerV3 | authenticated |
| 104 | `GET` | `/api/v3/quotation-asks/{id}` | QuotationAskControllerV3 | authenticated |
| 105 | `GET` | `/api/v3/quotation-asks/detail/{code}` | QuotationAskControllerV3 | authenticated |
| 106 | `GET` | `/api/v3/quotation-asks/tenant-invoice-info` | QuotationAskControllerV3 | authenticated |
| 107 | `POST` | `/protected/v1/batch/inbound` | InternalBatch | service-to-service |
| 108 | `POST` | `/protected/v1/batch/outbound` | InternalBatch | service-to-service |
| 109 | `DELETE` | `/protected/v1/cache/all` | Cache | service-to-service |
| 110 | `DELETE` | `/protected/v1/cache/dashboard-realtime-all` | Cache | service-to-service |
| 111 | `DELETE` | `/protected/v1/cache/dashboard-realtime-all/{tenantId}` | Cache | service-to-service |
| 112 | `DELETE` | `/protected/v1/cache/dashboard-realtime-po-delivering` | Cache | service-to-service |
| 113 | `DELETE` | `/protected/v1/cache/dashboard-realtime-po-delivering/{tenantId}` | Cache | service-to-service |
| 114 | `DELETE` | `/protected/v1/cache/dashboard-realtime-qa-asking` | Cache | service-to-service |
| 115 | `DELETE` | `/protected/v1/cache/dashboard-realtime-qa-asking/{tenantId}` | Cache | service-to-service |
| 116 | `DELETE` | `/protected/v1/cache/dashboard-stats` | Cache | service-to-service |
| 117 | `DELETE` | `/protected/v1/cache/dashboard-stats/{tenantId}` | Cache | service-to-service |
| 118 | `DELETE` | `/protected/v1/cache/purchase-order` | Cache | service-to-service |
| 119 | `DELETE` | `/protected/v1/cache/purchase-order/code/{purchaseOrderCode}` | Cache | service-to-service |
| 120 | `DELETE` | `/protected/v1/cache/purchase-order/id/{purchaseOrderId}` | Cache | service-to-service |
| 121 | `DELETE` | `/protected/v1/cache/purchase-request` | Cache | service-to-service |
| 122 | `DELETE` | `/protected/v1/cache/purchase-request/chat/{purchaseRequestCode}` | Cache | service-to-service |
| 123 | `DELETE` | `/protected/v1/cache/purchase-request/code/{purchaseRequestCode}` | Cache | service-to-service |
| 124 | `DELETE` | `/protected/v1/cache/purchase-request/id/{purchaseRequestId}` | Cache | service-to-service |
| 125 | `DELETE` | `/protected/v1/cache/quotation-ask` | Cache | service-to-service |
| 126 | `DELETE` | `/protected/v1/cache/quotation-ask/chat/{quotationAskCode}` | Cache | service-to-service |
| 127 | `DELETE` | `/protected/v1/cache/quotation-ask/code/{quotationAskCode}` | Cache | service-to-service |
| 128 | `DELETE` | `/protected/v1/cache/quotation-ask/id/{quotationAskId}` | Cache | service-to-service |
| 129 | `DELETE` | `/protected/v1/cache/spending-chart` | Cache | service-to-service |
| 130 | `DELETE` | `/protected/v1/cache/spending-chart/{tenantId}` | Cache | service-to-service |
| 131 | `DELETE` | `/protected/v1/cache/spending-overview` | Cache | service-to-service |
| 132 | `DELETE` | `/protected/v1/cache/spending-overview/{tenantId}` | Cache | service-to-service |
| 133 | `DELETE` | `/protected/v1/cache/user/cards` | Cache | service-to-service |
| 134 | `DELETE` | `/protected/v1/cache/user/cards/{userId}` | Cache | service-to-service |
| 135 | `DELETE` | `/protected/v1/cache/user/preferences` | Cache | service-to-service |
| 136 | `DELETE` | `/protected/v1/cache/user/preferences/{userId}` | Cache | service-to-service |
| 137 | `POST` | `/protected/v1/preliminary-quotation` | InternalQuotation | service-to-service |
| 138 | `POST` | `/protected/v1/pricing-proposals` | InternalQuotation | service-to-service |
| 139 | `GET` | `/protected/v1/purchase-orders` | InternalPurchase | service-to-service |
| 140 | `PUT` | `/protected/v1/purchase-orders` | InternalPurchase | service-to-service |
| 141 | `GET` | `/protected/v1/purchase-orders/{code}/items` | InternalPurchase | service-to-service |
| 142 | `PUT` | `/protected/v1/purchase-orders/cod-delivered` | InternalPurchase | service-to-service |
| 143 | `GET` | `/protected/v1/purchase-orders/code/{code}` | InternalPurchase | service-to-service |
| 144 | `PUT` | `/protected/v1/purchase-orders/stage` | InternalPurchase | service-to-service |
| 145 | `PUT` | `/protected/v1/purchase-orders/status` | InternalPurchase | service-to-service |
| 146 | `GET` | `/protected/v1/purchase-orders/transport-routes/{transportRouteId}/used` | InternalPurchase | service-to-service |
| 147 | `PUT` | `/protected/v1/purchase-requests/postpaid` | InternalPurchase | service-to-service |
| 148 | `PUT` | `/protected/v1/purchase-requests/prepaid` | InternalPurchase | service-to-service |
| 149 | `PUT` | `/protected/v1/purchase-requests/receive-vendor-confirmation` | InternalPurchase | service-to-service |
| 150 | `PUT` | `/protected/v1/purchase-requests/status` | InternalPurchase | service-to-service |
| 151 | `GET` | `/protected/v1/quotation-asks` | InternalQuotation | service-to-service |
| 152 | `PUT` | `/protected/v1/quotation-asks` | InternalQuotation | service-to-service |
| 153 | `POST` | `/protected/v1/quotation-bids` | InternalQuotation | service-to-service |

---

## 3. Endpoint Details

### GET `/api/v1/cart`

Lấy dữ liệu cart theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "C-20260506-0001",
      "status": "ACTIVE",
      "name": "Cart mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.CART_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/cart`

Cập nhật cart theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "C-20260506-0001",
    "status": "ACTIVE",
    "name": "Cart mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CART_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v1/cart/{id}`

Xóa hoặc vô hiệu hóa cart theo định danh được cung cấp.

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
    "code": "C-20260506-0001",
    "status": "ACTIVE",
    "name": "Cart mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CART_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/cart/add/{sparePartPriceLineItemId}`

Tạo mới cart. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "sparePartPriceLineItemId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "C-20260506-0001",
    "status": "ACTIVE",
    "name": "Cart mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CART_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/dashboard/spending-chart`

Lấy dữ liệu dashboard statistics theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "periodDisplayName": "DashboardStatistics mẫu",
    "timeRange": "2026-05-06T10:30:00+07:00",
    "totalSpent": 2500000,
    "totalSpentRounded": 2500000,
    "totalSpentDisplay": 2500000,
    "period": "dashboard-statistics-sample-20260506",
    "labels": [
      "dashboard-statistics-sample-20260506"
    ],
    "data": [
      "2026-05-06T10:30:00+07:00"
    ],
    "dataRounded": [
      "2026-05-06T10:30:00+07:00"
    ],
    "dataDisplay": [
      "2026-05-06T10:30:00+07:00"
    ],
    "maxValue": 2500000,
    "minValue": 2500000,
    "averageValue": 2500000
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/dashboard/spending-overview`

Lấy dữ liệu dashboard statistics theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "updateTime": "2026-05-06T10:30:00+07:00",
    "totalSpentThisWeek": 2500000,
    "totalSpentThisWeekRounded": 2500000,
    "totalSpentThisMonth": 2500000,
    "totalSpentThisMonthRounded": 2500000,
    "totalSpentThisYear": 2500000,
    "totalSpentThisYearRounded": 2500000,
    "totalSpentThisWeekDisplay": 2500000,
    "totalSpentThisMonthDisplay": 2500000,
    "totalSpentThisYearDisplay": 2500000,
    "percent": 10
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/dashboard/stats`

Lấy dữ liệu dashboard statistics theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "totalQuotationRequestsThisWeek": "2026-05-06T10:30:00+07:00",
    "quotationRequestsPricingThisWeek": "2026-05-06T10:30:00+07:00",
    "purchaseOrdersDelivering": 1001,
    "purchaseOrdersCompletedThisWeek": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/direct-purchase-orders`

Tạo mới direct purchase order. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PO-20260506-0001",
    "relatedServiceOrderCode": "PO-20260506-0001",
    "supplierTaxCode": "PO-20260506-0001",
    "supplierName": "DirectPurchaseOrder mẫu",
    "status": "ACTIVE",
    "expectedDeliveryDate": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "PO-20260506-0001",
        "productName": "DirectPurchaseOrder mẫu",
        "unitPrice": 2500000,
        "discountAmount": 2500000,
        "taxAmount": 2500000,
        "lineAmount": 2500000
      }
    ],
    "source": "direct-purchase-order-sample-20260506",
    "stage": "direct-purchase-order-sample-20260506",
    "directSupplierId": 51001,
    "paymentMethod": "direct-purchase-order-sample-20260506",
    "priority": "direct-purchase-order-sample-20260506",
    "supplierContactPhone": "0909123456"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/direct-purchase-orders/{poCode}`

Cập nhật direct purchase order theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "poCode": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PO-20260506-0001",
    "relatedServiceOrderCode": "PO-20260506-0001",
    "supplierTaxCode": "PO-20260506-0001",
    "supplierName": "DirectPurchaseOrder mẫu",
    "status": "ACTIVE",
    "expectedDeliveryDate": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "PO-20260506-0001",
        "productName": "DirectPurchaseOrder mẫu",
        "unitPrice": 2500000,
        "discountAmount": 2500000,
        "taxAmount": 2500000,
        "lineAmount": 2500000
      }
    ],
    "source": "direct-purchase-order-sample-20260506",
    "stage": "direct-purchase-order-sample-20260506",
    "directSupplierId": 51001,
    "paymentMethod": "direct-purchase-order-sample-20260506",
    "priority": "direct-purchase-order-sample-20260506",
    "supplierContactPhone": "0909123456"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/direct-purchase-orders/{poCode}/attachments`

Cập nhật direct purchase order theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "poCode": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PO-20260506-0001",
    "relatedServiceOrderCode": "PO-20260506-0001",
    "supplierTaxCode": "PO-20260506-0001",
    "supplierName": "DirectPurchaseOrder mẫu",
    "status": "ACTIVE",
    "expectedDeliveryDate": "2026-05-06",
    "items": [
      {
        "id": 51001,
        "genuineCode": "PO-20260506-0001",
        "productName": "DirectPurchaseOrder mẫu",
        "unitPrice": 2500000,
        "discountAmount": 2500000,
        "taxAmount": 2500000,
        "lineAmount": 2500000
      }
    ],
    "source": "direct-purchase-order-sample-20260506",
    "stage": "direct-purchase-order-sample-20260506",
    "directSupplierId": 51001,
    "paymentMethod": "direct-purchase-order-sample-20260506",
    "priority": "direct-purchase-order-sample-20260506",
    "supplierContactPhone": "0909123456"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/direct-purchase-orders/{poCode}/status`

Cập nhật direct purchase order theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "poCode": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/direct-purchase-orders/related-service-order/{serviceOrderCode}`

Lấy dữ liệu direct purchase order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "serviceOrderCode": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PO-20260506-0001",
    "purchaseOrders": [
      {
        "id": 51001,
        "code": "PO-20260506-0001",
        "stage": "WAIT_TO_CONFIRM"
      }
    ],
    "stage": "WAIT_TO_CONFIRM"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DIRECT_PURCHASE_ORDER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-order/{purchaseId}`

Lấy dữ liệu purchase order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "purchaseId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseOrder mẫu",
    "vendorName": "PurchaseOrder mẫu",
    "requestProductName": "PurchaseOrder mẫu",
    "carName": "PurchaseOrder mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/purchase-order/{purchaseOrderId}/confirm-received`

Xác nhận purchase order, chuyển trạng thái sang bước xử lý tiếp theo.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "purchaseOrderId": 51001
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
    "name": "PurchaseOrder mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/purchase-order/confirm-received/{code}`

Xác nhận purchase order, chuyển trạng thái sang bước xử lý tiếp theo.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
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
    "name": "PurchaseOrder mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-order/detail/{code}`

Lấy dữ liệu purchase order theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseOrder mẫu",
    "vendorName": "PurchaseOrder mẫu",
    "requestProductName": "PurchaseOrder mẫu",
    "carName": "PurchaseOrder mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-order/search`

Tra cứu danh sách purchase order theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "supplierName": "PurchaseOrder mẫu",
      "requestedProductName": "PurchaseOrder mẫu",
      "paymentStatus": "PENDING",
      "totalPrice": 2500000,
      "vin": "RLHGD1850NY000001",
      "stage": "WAIT_TO_CONFIRM",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "source": "QUOTATION_ASK",
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_ORDER_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/purchase-request`

Tạo mới purchase request. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PO-20260506-0001",
    "status": "OPEN",
    "statusTransitionData": [
      "ACTIVE"
    ],
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "purchaserId": 51001,
    "purchaseRequestDataList": [
      {
        "id": 51001,
        "quotationAskCode": "PO-20260506-0001",
        "requestedProductName": "PurchaseRequest mẫu",
        "salesStatus": "OPEN",
        "updatedAt": "2026-05-06",
        "updatedBy": "2026-05-06",
        "detailedPrice": 2500000
      }
    ],
    "note": "Ghi chú nghiệp vụ mẫu",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "paymentMethod": "COD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-request/{purchaseId}`

Lấy dữ liệu purchase request theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "purchaseId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseRequest mẫu",
    "vendorName": "PurchaseRequest mẫu",
    "requestProductName": "PurchaseRequest mẫu",
    "carName": "PurchaseRequest mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/purchase-request/cancel`

Hủy purchase request theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
| `GMS.gf-purchase.PURCHASE_REQUEST_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-request/chat/{code}`

Lấy dữ liệu purchase request theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PO-20260506-0001",
    "status": "OPEN",
    "sparePartNumber": "PO-20260506-0001",
    "supplierNumber": "PO-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/purchase-request/confirm/{id}`

Xác nhận purchase request, chuyển trạng thái sang bước xử lý tiếp theo.

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
| `GMS.gf-purchase.PURCHASE_REQUEST_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-request/detail/{code}`

Lấy dữ liệu purchase request theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseRequest mẫu",
    "vendorName": "PurchaseRequest mẫu",
    "requestProductName": "PurchaseRequest mẫu",
    "carName": "PurchaseRequest mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-request/saas-tenant`

Lấy dữ liệu purchase request theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "PO-20260506-0001",
    "taxCode": "PO-20260506-0001",
    "branchCode": "PO-20260506-0001",
    "operationRegionCode": "PO-20260506-0001",
    "operationAreaCode": "PO-20260506-0001",
    "name": "PurchaseRequest mẫu",
    "representativeName": "PurchaseRequest mẫu",
    "chiefAccountantName": "PurchaseRequest mẫu",
    "invoiceCompanyName": "PurchaseRequest mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/purchase-request/search`

Tra cứu danh sách purchase request theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "requestedProductName": "PurchaseRequest mẫu",
      "status": "OPEN",
      "paymentStatus": "PENDING",
      "vin": "RLHGD1850NY000001",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "paymentMethod": "COD",
      "purchaserRequestDataList": [
        {
          "id": 51001,
          "quotationAskCode": "PO-20260506-0001",
          "requestedProductName": "PurchaseRequest mẫu"
        }
      ],
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_REQUEST_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/quotation-asks`

Lấy dữ liệu quotation ask theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "QA-20260506-0001",
      "partNameInput": "QuotationAsk mẫu",
      "partNameUnit": "QuotationAsk mẫu",
      "status": "OPEN",
      "carType": "STANDARD",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "tenantId": 10,
      "askNote": "Ghi chú nghiệp vụ mẫu",
      "isInvoiceRequired": true
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
| `GMS.gf-purchase.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/quotation-asks`

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
    "refCode": "QA-20260506-0001",
    "tenantName": 10,
    "partNameInput": "QuotationAsk mẫu",
    "partNameUnit": "QuotationAsk mẫu",
    "status": "ACTIVE",
    "carType": "STANDARD",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v1/quotation-asks/{id}`

Xóa hoặc vô hiệu hóa quotation ask theo định danh được cung cấp.

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
| `GMS.gf-purchase.QUOTATION_ASK_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/quotation-asks/{id}`

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
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "QA-20260506-0001",
    "insuranceCode": "QA-20260506-0001",
    "purchaseRequestCode": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "genuineCode": "QA-20260506-0001",
    "parentCode": "QA-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/quotation-asks/{quotationAskCode}/histories`

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
    "quotationAskCode": "QA-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "quotationAskCode": "QA-20260506-0001",
      "fieldName": "QuotationAsk mẫu",
      "updatedType": "STANDARD",
      "type": "STANDARD",
      "updatedRole": "GARAGE",
      "updatedByTenantId": 10,
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "items": [
        {
          "id": 51001,
          "fieldName": "QuotationAsk mẫu",
          "type": "STANDARD",
          "oldData": "2026-05-06T10:30:00+07:00",
          "newData": "2026-05-06T10:30:00+07:00",
          "note": "Ghi chú nghiệp vụ mẫu",
          "tier": "quotation-ask-sample-20260506"
        }
      ],
      "createdAt": "2026-05-06T10:30:00+07:00",
      "createdBy": "2026-05-06T10:30:00+07:00",
      "oldData": "2026-05-06T10:30:00+07:00"
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
| `GMS.gf-purchase.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/quotation-asks/chat/{code}`

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
    "code": "QA-20260506-0001",
    "status": "OPEN",
    "carBrand": "Toyota",
    "carModel": "Vios",
    "yearOfManufacture": 2024,
    "trimsLevel": "quotation-ask-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/quotation-asks/detail/{code}`

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
    "id": 51001,
    "code": "QA-20260506-0001",
    "insuranceCode": "QA-20260506-0001",
    "purchaseRequestCode": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "genuineCode": "QA-20260506-0001",
    "parentCode": "QA-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/quotation-asks/spare-parts`

Lấy dữ liệu quotation ask theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "partNameInput": "QuotationAsk mẫu",
      "partNameUnit": "QuotationAsk mẫu",
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
| `GMS.gf-purchase.QUOTATION_ASK_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/quotation-pricing/request`

Tạo mới quotation ask pricing. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "quotationAskCode": "QA-20260506-0001",
    "code": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "partNameInput": "QuotationAskPricing mẫu",
    "partNameUnit": "QuotationAskPricing mẫu",
    "bidPrice": 2500000,
    "originTenantId": 10,
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "askedSpareParts": [
      {
        "id": 51001,
        "code": "QA-20260506-0001",
        "refCode": "QA-20260506-0001",
        "partNameInput": "QuotationAskPricing mẫu",
        "partNameUnit": "QuotationAskPricing mẫu",
        "bidPrice": 2500000,
        "quantity": 2
      }
    ],
    "quotationAsk": {
      "code": "QA-20260506-0001",
      "taxCode": "QA-20260506-0001",
      "quotationRefCode": "QA-20260506-0001",
      "insuranceCode": "QA-20260506-0001",
      "tenantName": 10,
      "invoiceCompanyName": "QuotationAskPricing mẫu",
      "status": "OPEN"
    },
    "quantity": 2
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v1/tenant/current-user`

Xóa hoặc vô hiệu hóa tenant theo định danh được cung cấp.

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
    "code": "T-20260506-0001",
    "status": "ACTIVE",
    "name": "Tenant mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TENANT_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/tenant/current-user`

Lấy dữ liệu tenant theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "fullName": "Tenant mẫu",
    "emailAddress": "nguyen.van.a@example.com",
    "phoneNumber": "0909123456",
    "role": "tenant-sample-20260506",
    "avatarUrl": "2026-05-06T10:30:00+07:00",
    "iamUserId": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.TENANT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/tenant/ecommerce-confirmed`

Xác nhận tenant, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "T-20260506-0001",
    "status": "ACTIVE",
    "name": "Tenant mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TENANT_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/tenant/info`

Lấy dữ liệu tenant theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "T-20260506-0001",
    "taxCode": "T-20260506-0001",
    "branchCode": "T-20260506-0001",
    "operationRegionCode": "T-20260506-0001",
    "operationAreaCode": "T-20260506-0001",
    "name": "Tenant mẫu",
    "representativeName": "Tenant mẫu",
    "chiefAccountantName": "Tenant mẫu",
    "invoiceCompanyName": "Tenant mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.TENANT_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/tenant/tc-data-privacy-confirmed`

Xác nhận tenant, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "T-20260506-0001",
    "status": "ACTIVE",
    "name": "Tenant mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TENANT_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/testing/decrypt/{text}`

Tạo mới testing. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "text": "testing-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "T-20260506-0001",
    "status": "ACTIVE",
    "name": "Testing mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TESTING_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TESTING_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TESTING_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TESTING_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TESTING_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TESTING_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/testing/encrypt/{text}`

Tạo mới testing. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "text": "testing-sample-20260506"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "T-20260506-0001",
    "status": "ACTIVE",
    "name": "Testing mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TESTING_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TESTING_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TESTING_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TESTING_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TESTING_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TESTING_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/testing/payment-checksum/{prId}`

Lấy dữ liệu testing theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "prId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "T-20260506-0001",
    "status": "ACTIVE",
    "name": "Testing mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TESTING_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TESTING_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TESTING_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TESTING_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.TESTING_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TESTING_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/user/preferences`

Lấy dữ liệu user theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "preferences": "user-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.USER_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.USER_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.USER_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.USER_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.USER_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.USER_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/variables/mobile`

Lấy dữ liệu variables theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "paymentProvider": "variables-sample-20260506",
    "paymentReadyMaxWaitSecs": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.VARIABLES_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.VARIABLES_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.VARIABLES_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.VARIABLES_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.VARIABLES_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.VARIABLES_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/cart`

Lấy dữ liệu cart controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "CCV-20260506-0001",
      "status": "ACTIVE",
      "name": "CartControllerV2 mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/cart`

Cập nhật cart controller v2 theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "CCV-20260506-0001",
    "status": "ACTIVE",
    "name": "CartControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_CONTROLLER_V2_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v2/cart/{id}`

Xóa hoặc vô hiệu hóa cart controller v2 theo định danh được cung cấp.

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
    "code": "CCV-20260506-0001",
    "status": "ACTIVE",
    "name": "CartControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_CONTROLLER_V2_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/cart/add/{sparePartPriceLineItemId}`

Tạo mới cart controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "sparePartPriceLineItemId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "CCV-20260506-0001",
    "status": "ACTIVE",
    "name": "CartControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.CART_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CART_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/realtime/purchase-orders-delivering-count`

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
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/realtime/quotation-asks-asking-count`

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
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_REAL_TIME_COUNT.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/spending-chart`

Lấy dữ liệu dashboard statistics controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "periodDisplayName": "DashboardStatisticsControllerV2 mẫu",
    "timeRange": "2026-05-06T10:30:00+07:00",
    "totalSpent": 2500000,
    "totalSpentRounded": 2500000,
    "totalSpentDisplay": 2500000,
    "period": "dashboard-statistics-controller-v2-sample-20260506",
    "labels": [
      "dashboard-statistics-controller-v2-sample-20260506"
    ],
    "data": [
      "2026-05-06T10:30:00+07:00"
    ],
    "dataRounded": [
      "2026-05-06T10:30:00+07:00"
    ],
    "dataDisplay": [
      "2026-05-06T10:30:00+07:00"
    ],
    "maxValue": 2500000,
    "minValue": 2500000,
    "averageValue": 2500000
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/spending-overview`

Lấy dữ liệu dashboard statistics controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "updateTime": "2026-05-06T10:30:00+07:00",
    "totalSpentThisWeek": 2500000,
    "totalSpentThisWeekRounded": 2500000,
    "totalSpentThisMonth": 2500000,
    "totalSpentThisMonthRounded": 2500000,
    "totalSpentThisYear": 2500000,
    "totalSpentThisYearRounded": 2500000,
    "totalSpentThisWeekDisplay": 2500000,
    "totalSpentThisMonthDisplay": 2500000,
    "totalSpentThisYearDisplay": 2500000,
    "percent": 10
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/dashboard/stats`

Lấy dữ liệu dashboard statistics controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "totalQuotationRequestsThisWeek": "2026-05-06T10:30:00+07:00",
    "quotationRequestsPricingThisWeek": "2026-05-06T10:30:00+07:00",
    "purchaseOrdersDelivering": 1001,
    "purchaseOrdersCompletedThisWeek": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.DASHBOARD_STATISTICS_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/feature-flags/mobile`

Lấy dữ liệu feature flag controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "FFCV-20260506-0001",
      "status": "ACTIVE",
      "name": "FeatureFlagControllerV2 mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.FEATURE_FLAG_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.FEATURE_FLAG_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.FEATURE_FLAG_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.FEATURE_FLAG_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.FEATURE_FLAG_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.FEATURE_FLAG_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-order/{code}/for-receipt`

Lấy dữ liệu purchase order controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "poCode": "PO-20260506-0001",
    "updatedAt": "2026-05-06",
    "items": [
      {
        "genuineCode": "PO-20260506-0001",
        "productName": "PurchaseOrderControllerV2 mẫu",
        "costPrice": 2500000,
        "suggestedPrice": 2500000,
        "productId": 51001,
        "sku": "purchase-order-controller-v2-sample-20260506",
        "tier": "TIER1"
      }
    ],
    "createdAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-order/{purchaseId}`

Lấy dữ liệu purchase order controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "purchaseId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseOrderControllerV2 mẫu",
    "vendorName": "PurchaseOrderControllerV2 mẫu",
    "requestProductName": "PurchaseOrderControllerV2 mẫu",
    "carName": "PurchaseOrderControllerV2 mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/purchase-order/{purchaseOrderId}/confirm-received`

Xác nhận purchase order controller v2, chuyển trạng thái sang bước xử lý tiếp theo.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "purchaseOrderId": 51001
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
    "name": "PurchaseOrderControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/purchase-order/confirm-received/{code}`

Xác nhận purchase order controller v2, chuyển trạng thái sang bước xử lý tiếp theo.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
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
    "name": "PurchaseOrderControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-order/detail/{code}`

Lấy dữ liệu purchase order controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseOrderControllerV2 mẫu",
    "vendorName": "PurchaseOrderControllerV2 mẫu",
    "requestProductName": "PurchaseOrderControllerV2 mẫu",
    "carName": "PurchaseOrderControllerV2 mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-order/search`

Tra cứu danh sách purchase order controller v2 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "supplierName": "PurchaseOrderControllerV2 mẫu",
      "requestedProductName": "PurchaseOrderControllerV2 mẫu",
      "paymentStatus": "PENDING",
      "totalPrice": 2500000,
      "vin": "RLHGD1850NY000001",
      "stage": "WAIT_TO_CONFIRM",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "source": "QUOTATION_ASK",
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-order/search-web`

Tra cứu danh sách purchase order controller v2 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "supplierName": "PurchaseOrderControllerV2 mẫu",
      "requestedProductName": "PurchaseOrderControllerV2 mẫu",
      "paymentStatus": "PENDING",
      "totalPrice": 2500000,
      "vin": "RLHGD1850NY000001",
      "stage": "WAIT_TO_CONFIRM",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "source": "QUOTATION_ASK",
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V2_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/purchase-request`

Tạo mới purchase request controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "PO-20260506-0001",
    "status": "OPEN",
    "statusTransitionData": [
      "ACTIVE"
    ],
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06",
    "purchaserId": 51001,
    "purchaseRequestDataList": [
      {
        "id": 51001,
        "quotationAskCode": "PO-20260506-0001",
        "requestedProductName": "PurchaseRequestControllerV2 mẫu",
        "salesStatus": "OPEN",
        "updatedAt": "2026-05-06",
        "updatedBy": "2026-05-06",
        "detailedPrice": 2500000
      }
    ],
    "note": "Ghi chú nghiệp vụ mẫu",
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "paymentMethod": "COD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-request/{purchaseId}`

Lấy dữ liệu purchase request controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "purchaseId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseRequestControllerV2 mẫu",
    "vendorName": "PurchaseRequestControllerV2 mẫu",
    "requestProductName": "PurchaseRequestControllerV2 mẫu",
    "carName": "PurchaseRequestControllerV2 mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/purchase-request/cancel`

Hủy purchase request controller v2 theo định danh hiện tại và ghi nhận lý do hủy để phục vụ đối soát.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequestControllerV2 mẫu"
  }
}
```

**Side-effect**: cập nhật trạng thái hủy, ghi nhận lý do và có thể phát sự kiện nội bộ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CANCEL.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CANCEL.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CANCEL.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CANCEL.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CANCEL.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CANCEL.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/purchase-request/change-payment-method/{id}`

Cập nhật purchase request controller v2 theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequestControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi nhận thanh toán và cập nhật tổng tiền/trạng thái liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-request/chat/{code}`

Lấy dữ liệu purchase request controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "PO-20260506-0001",
    "status": "OPEN",
    "sparePartNumber": "PO-20260506-0001",
    "supplierNumber": "PO-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/purchase-request/checkout/cc/{prId}`

Lấy dữ liệu purchase request controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "prId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "providerCode": "PO-20260506-0001",
    "swiftCode": "PO-20260506-0001",
    "bankName": "PurchaseRequestControllerV2 mẫu",
    "accountName": "PurchaseRequestControllerV2 mẫu",
    "status": "ACTIVE",
    "providerStatus": "ACTIVE",
    "type": "STANDARD",
    "amount": {
      "value": 2500000,
      "paymentFee": 2500000,
      "fixedCost": 2500000,
      "variableCost": 2500000,
      "currency": "purchase-request-controller-v2-sample-20260506"
    },
    "paymentOrderId": 51001,
    "presentation": {
      "type": "STANDARD",
      "invoiceQrVietQR": "purchase-request-controller-v2-sample-20260506",
      "invoiceQrBase64": "purchase-request-controller-v2-sample-20260506",
      "paymentUrl": "https://files.garage.example/documents/sample.pdf",
      "createdAt": "2026-05-06T10:30:00+07:00"
    },
    "bankAccount": {
      "swiftCode": "PO-20260506-0001",
      "bankName": "PurchaseRequestControllerV2 mẫu",
      "accountName": "PurchaseRequestControllerV2 mẫu",
      "bankNumber": "PO-20260506-0001"
    },
    "references": {
      "userId": 1001,
      "userReference": "purchase-request-controller-v2-sample-20260506",
      "invoiceId": 51001,
      "invoiceReference": "purchase-request-controller-v2-sample-20260506"
    },
    "startAt": "2026-05-06T10:30:00+07:00",
    "validTo": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/purchase-request/checkout/qr/{prId}`

Lấy dữ liệu purchase request controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "prId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "providerCode": "PO-20260506-0001",
    "swiftCode": "PO-20260506-0001",
    "bankName": "PurchaseRequestControllerV2 mẫu",
    "accountName": "PurchaseRequestControllerV2 mẫu",
    "status": "ACTIVE",
    "providerStatus": "ACTIVE",
    "type": "STANDARD",
    "amount": {
      "value": 2500000,
      "paymentFee": 2500000,
      "fixedCost": 2500000,
      "variableCost": 2500000,
      "currency": "purchase-request-controller-v2-sample-20260506"
    },
    "paymentOrderId": 51001,
    "presentation": {
      "type": "STANDARD",
      "invoiceQrVietQR": "purchase-request-controller-v2-sample-20260506",
      "invoiceQrBase64": "purchase-request-controller-v2-sample-20260506",
      "paymentUrl": "https://files.garage.example/documents/sample.pdf",
      "createdAt": "2026-05-06T10:30:00+07:00"
    },
    "bankAccount": {
      "swiftCode": "PO-20260506-0001",
      "bankName": "PurchaseRequestControllerV2 mẫu",
      "accountName": "PurchaseRequestControllerV2 mẫu",
      "bankNumber": "PO-20260506-0001"
    },
    "references": {
      "userId": 1001,
      "userReference": "purchase-request-controller-v2-sample-20260506",
      "invoiceId": 51001,
      "invoiceReference": "purchase-request-controller-v2-sample-20260506"
    },
    "startAt": "2026-05-06T10:30:00+07:00",
    "validTo": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/purchase-request/confirm/{id}`

Xác nhận purchase request controller v2, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "name": "PurchaseRequestControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-request/detail/{code}`

Lấy dữ liệu purchase request controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "name": "PurchaseRequestControllerV2 mẫu",
    "vendorName": "PurchaseRequestControllerV2 mẫu",
    "requestProductName": "PurchaseRequestControllerV2 mẫu",
    "carName": "PurchaseRequestControllerV2 mẫu",
    "purchaseRequestStatus": "OPEN",
    "paymentStatus": "PENDING",
    "updatedAt": "2026-05-06",
    "updateAt": "2026-05-06",
    "timeReceive": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-request/payment-methods`

Lấy dữ liệu purchase request controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "enabledMethods": [
      "COD"
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/purchase-request/place-order/{prId}`

Tạo mới purchase request controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "prId": 51001
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
    "name": "PurchaseRequestControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-request/search`

Tra cứu danh sách purchase request controller v2 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "requestedProductName": "PurchaseRequestControllerV2 mẫu",
      "status": "OPEN",
      "paymentStatus": "PENDING",
      "vin": "RLHGD1850NY000001",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "paymentMethod": "COD",
      "purchaserRequestDataList": [
        {
          "id": 51001,
          "quotationAskCode": "PO-20260506-0001",
          "requestedProductName": "PurchaseRequestControllerV2 mẫu"
        }
      ],
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/purchase-request/search-for-web`

Tra cứu danh sách purchase request controller v2 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "requestedProductName": "PurchaseRequestControllerV2 mẫu",
      "status": "OPEN",
      "paymentStatus": "PENDING",
      "vin": "RLHGD1850NY000001",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "paymentMethod": "COD",
      "purchaserRequestDataList": [
        {
          "id": 51001,
          "quotationAskCode": "PO-20260506-0001",
          "requestedProductName": "PurchaseRequestControllerV2 mẫu"
        }
      ],
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_REQUEST_CONTROLLER_V2_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks`

Lấy dữ liệu quotation ask controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "QA-20260506-0001",
      "partNameInput": "QuotationAskControllerV2 mẫu",
      "partNameUnit": "QuotationAskControllerV2 mẫu",
      "status": "OPEN",
      "carType": "STANDARD",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "tenantId": 10,
      "askNote": "Ghi chú nghiệp vụ mẫu",
      "isInvoiceRequired": true
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
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/quotation-asks`

Tạo mới quotation ask controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "refCode": "QA-20260506-0001",
    "tenantName": 10,
    "partNameInput": "QuotationAskControllerV2 mẫu",
    "partNameUnit": "QuotationAskControllerV2 mẫu",
    "status": "ACTIVE",
    "carType": "STANDARD",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/{code}/preliminary-quotation`

Lấy dữ liệu quotation ask controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "QA-20260506-0001",
    "quotationAskCode": "QA-20260506-0001",
    "consultantName": "QuotationAskControllerV2 mẫu",
    "status": "DRAFT",
    "updatedAt": "2026-05-06",
    "totalAmount": 2500000,
    "tenantId": 10,
    "consultantId": 51001,
    "consultantPhoneNumber": "0909123456",
    "spareParts": [
      {
        "sparePartCode": "QA-20260506-0001",
        "sparePartName": "QuotationAskControllerV2 mẫu",
        "estimatedPrice": "2026-05-06T10:30:00+07:00",
        "priceNote": 2500000,
        "quantity": 2,
        "unit": "quotation-ask-controller-v2-sample-20260506",
        "segment": "TIER1"
      }
    ],
    "note": "Ghi chú nghiệp vụ mẫu",
    "version": 1001,
    "createdAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/{id}`

Lấy dữ liệu quotation ask controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "QA-20260506-0001",
    "insuranceCode": "QA-20260506-0001",
    "purchaseRequestCode": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "genuineCode": "QA-20260506-0001",
    "parentCode": "QA-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/{quotationAskCode}/histories`

Lấy dữ liệu quotation ask controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "quotationAskCode": "QA-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "quotationAskCode": "QA-20260506-0001",
      "fieldName": "QuotationAskControllerV2 mẫu",
      "updatedType": "STANDARD",
      "type": "STANDARD",
      "updatedRole": "GARAGE",
      "updatedByTenantId": 10,
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "items": [
        {
          "id": 51001,
          "fieldName": "QuotationAskControllerV2 mẫu",
          "type": "STANDARD",
          "oldData": "2026-05-06T10:30:00+07:00",
          "newData": "2026-05-06T10:30:00+07:00",
          "note": "Ghi chú nghiệp vụ mẫu",
          "tier": "quotation-ask-controller-v2-sample-20260506"
        }
      ],
      "createdAt": "2026-05-06T10:30:00+07:00",
      "createdBy": "2026-05-06T10:30:00+07:00",
      "oldData": "2026-05-06T10:30:00+07:00"
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
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/chat/{code}`

Lấy dữ liệu quotation ask controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "QA-20260506-0001",
    "status": "OPEN",
    "carBrand": "Toyota",
    "carModel": "Vios",
    "yearOfManufacture": 2024,
    "trimsLevel": "quotation-ask-controller-v2-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/detail/{code}`

Lấy dữ liệu quotation ask controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "id": 51001,
    "code": "QA-20260506-0001",
    "insuranceCode": "QA-20260506-0001",
    "purchaseRequestCode": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "genuineCode": "QA-20260506-0001",
    "parentCode": "QA-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/quotation-asks/ocr/upload`

Tạo mới quotation ask controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "errorDetails": "quotation-ask-controller-v2-sample-20260506",
    "message": "quotation-ask-controller-v2-sample-20260506",
    "vehicleInfo": {
      "carType": "ELECTRIC_CAR",
      "carBrand": "Toyota",
      "carModel": "Vios",
      "yearOfManufacture": 2024,
      "trimsLevel": "quotation-ask-controller-v2-sample-20260506",
      "vin": "RLHGD1850NY000001",
      "licensePlate": "2026-05-06T10:30:00+07:00"
    },
    "carBrand": "Toyota",
    "carModel": "Vios",
    "yearOfManufacture": 2024,
    "trimsLevel": "quotation-ask-controller-v2-sample-20260506",
    "vin": "RLHGD1850NY000001",
    "licensePlate": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/quotation-asks/search-for-web`

Tra cứu danh sách quotation ask controller v2 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "QA-20260506-0001",
      "partNameInput": "QuotationAskControllerV2 mẫu",
      "partNameUnit": "QuotationAskControllerV2 mẫu",
      "status": "OPEN",
      "carType": "STANDARD",
      "updatedAt": "2026-05-06",
      "updatedBy": "2026-05-06",
      "tenantId": 10,
      "askNote": "Ghi chú nghiệp vụ mẫu",
      "isInvoiceRequired": true
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
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V2_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/quotation-pricing/request`

Tạo mới quotation ask pricing controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "quotationAskCode": "QA-20260506-0001",
    "code": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "partNameInput": "QuotationAskPricingControllerV2 mẫu",
    "partNameUnit": "QuotationAskPricingControllerV2 mẫu",
    "bidPrice": 2500000,
    "originTenantId": 10,
    "createdAt": "2026-05-06T10:30:00+07:00",
    "createdBy": "2026-05-06T10:30:00+07:00",
    "askedSpareParts": [
      {
        "id": 51001,
        "code": "QA-20260506-0001",
        "refCode": "QA-20260506-0001",
        "partNameInput": "QuotationAskPricingControllerV2 mẫu",
        "partNameUnit": "QuotationAskPricingControllerV2 mẫu",
        "bidPrice": 2500000,
        "quantity": 2
      }
    ],
    "quotationAsk": {
      "code": "QA-20260506-0001",
      "taxCode": "QA-20260506-0001",
      "quotationRefCode": "QA-20260506-0001",
      "insuranceCode": "QA-20260506-0001",
      "tenantName": 10,
      "invoiceCompanyName": "QuotationAskPricingControllerV2 mẫu",
      "status": "OPEN"
    },
    "quantity": 2
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_PRICING_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/suppliers`

Tạo mới supplier controller v2. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "supplierCode": "SCV-20260506-0001",
    "taxCode": "SCV-20260506-0001",
    "preferredWarehouseCode": "SCV-20260506-0001",
    "supplierName": "SupplierControllerV2 mẫu",
    "updatedAt": "2026-05-06",
    "contactPhone": "0909123456",
    "privatePhone": "0909123456",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001",
    "commune": "supplier-controller-v2-sample-20260506",
    "paymentTerms": "COD",
    "isActive": true,
    "onboardSource": "GARAGE"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/suppliers/{supplierId}`

Lấy dữ liệu supplier controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "supplierId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "supplierCode": "SCV-20260506-0001",
    "taxCode": "SCV-20260506-0001",
    "preferredWarehouseCode": "SCV-20260506-0001",
    "supplierName": "SupplierControllerV2 mẫu",
    "updatedAt": "2026-05-06",
    "contactPhone": "0909123456",
    "privatePhone": "0909123456",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001",
    "commune": "supplier-controller-v2-sample-20260506",
    "paymentTerms": "COD",
    "isActive": true,
    "onboardSource": "GARAGE"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v2/suppliers/{supplierId}`

Cập nhật supplier controller v2 theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "supplierId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "supplierCode": "SCV-20260506-0001",
    "taxCode": "SCV-20260506-0001",
    "preferredWarehouseCode": "SCV-20260506-0001",
    "supplierName": "SupplierControllerV2 mẫu",
    "updatedAt": "2026-05-06",
    "contactPhone": "0909123456",
    "privatePhone": "0909123456",
    "address": "123 Le Loi, Quan 1, TP HCM",
    "province": "RLHGD1850NY000001",
    "commune": "supplier-controller-v2-sample-20260506",
    "paymentTerms": "COD",
    "isActive": true,
    "onboardSource": "GARAGE"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/suppliers/{supplierId}/toggle-status`

Lấy dữ liệu supplier controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "supplierId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "SCV-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_STATUS.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_STATUS.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_STATUS.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_STATUS.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_STATUS.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_STATUS.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/suppliers/search`

Tra cứu danh sách supplier controller v2 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "supplierCode": "SCV-20260506-0001",
      "taxCode": "SCV-20260506-0001",
      "preferredWarehouseCode": "SCV-20260506-0001",
      "supplierName": "SupplierControllerV2 mẫu",
      "updatedAt": "2026-05-06",
      "contactPhone": "0909123456",
      "privatePhone": "0909123456",
      "address": "123 Le Loi, Quan 1, TP HCM",
      "province": "RLHGD1850NY000001",
      "commune": "supplier-controller-v2-sample-20260506",
      "paymentTerms": "COD",
      "isActive": true,
      "onboardSource": "GARAGE"
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
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.SUPPLIER_CONTROLLER_V2_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v2/tenant/current-user`

Xóa hoặc vô hiệu hóa tenant controller v2 theo định danh được cung cấp.

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
    "code": "TCV-20260506-0001",
    "status": "ACTIVE",
    "name": "TenantControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/tenant/current-user`

Lấy dữ liệu tenant controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "fullName": "TenantControllerV2 mẫu",
    "emailAddress": "nguyen.van.a@example.com",
    "phoneNumber": "0909123456",
    "role": "tenant-controller-v2-sample-20260506",
    "avatarUrl": "2026-05-06T10:30:00+07:00",
    "iamUserId": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/tenant/ecommerce-confirmed`

Xác nhận tenant controller v2, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "TCV-20260506-0001",
    "status": "ACTIVE",
    "name": "TenantControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/tenant/info`

Lấy dữ liệu tenant controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "TCV-20260506-0001",
    "taxCode": "TCV-20260506-0001",
    "branchCode": "TCV-20260506-0001",
    "operationRegionCode": "TCV-20260506-0001",
    "operationAreaCode": "TCV-20260506-0001",
    "name": "TenantControllerV2 mẫu",
    "representativeName": "TenantControllerV2 mẫu",
    "chiefAccountantName": "TenantControllerV2 mẫu",
    "invoiceCompanyName": "TenantControllerV2 mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v2/tenant/tc-data-privacy-confirmed`

Xác nhận tenant controller v2, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "code": "TCV-20260506-0001",
    "status": "ACTIVE",
    "name": "TenantControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.TENANT_CONTROLLER_V2_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/user/cards`

Lấy dữ liệu user controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "UCV-20260506-0001",
      "status": "ACTIVE",
      "name": "UserControllerV2 mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/api/v2/user/cards/{id}`

Xóa hoặc vô hiệu hóa user controller v2 theo định danh được cung cấp.

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
    "code": "UCV-20260506-0001",
    "status": "ACTIVE",
    "name": "UserControllerV2 mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.USER_CONTROLLER_V2_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/user/preferences`

Lấy dữ liệu user controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "preferences": "user-controller-v2-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.USER_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v2/variables/mobile`

Lấy dữ liệu variables controller v2 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "paymentProvider": "variables-controller-v2-sample-20260506",
    "paymentReadyMaxWaitSecs": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.VARIABLES_CONTROLLER_V2_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.VARIABLES_CONTROLLER_V2_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.VARIABLES_CONTROLLER_V2_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.VARIABLES_CONTROLLER_V2_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.VARIABLES_CONTROLLER_V2_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.VARIABLES_CONTROLLER_V2_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/purchase-order/detail/{code}`

Lấy dữ liệu purchase order controller v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "purchaseRequestCode": "PO-20260506-0001",
    "purchaseOrderCode": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "qrCodeReady": "PO-20260506-0001",
    "code": "PO-20260506-0001",
    "relatedServiceOrderCode": "PO-20260506-0001",
    "supplierTaxCode": "PO-20260506-0001",
    "name": "PurchaseOrderControllerV3 mẫu",
    "vendorName": "PurchaseOrderControllerV3 mẫu",
    "requestProductName": "PurchaseOrderControllerV3 mẫu",
    "carName": "PurchaseOrderControllerV3 mẫu",
    "supplierName": "PurchaseOrderControllerV3 mẫu",
    "purchaseRequestStatus": "OPEN"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/purchase-order/search`

Tra cứu danh sách purchase order controller v3 theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

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
      "code": "PO-20260506-0001",
      "quotationAskCode": "PO-20260506-0001",
      "supplierName": "PurchaseOrderControllerV3 mẫu",
      "requestedProductName": "PurchaseOrderControllerV3 mẫu",
      "paymentStatus": "PENDING",
      "totalPrice": 2500000,
      "vin": "RLHGD1850NY000001",
      "stage": "WAIT_TO_CONFIRM",
      "createdAt": "2026-05-06T10:30:00+07:00",
      "source": "QUOTATION_ASK",
      "carBrand": "Toyota",
      "carModel": "Vios"
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
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/purchase-order/supplier-names`

Tạo mới purchase order controller v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
  "data": [
    {
      "code": "PO-20260506-0001",
      "supplierCode": "PO-20260506-0001",
      "taxCode": "PO-20260506-0001",
      "supplierName": "PurchaseOrderControllerV3 mẫu",
      "supplierId": 51001,
      "contactPhone": "0909123456",
      "privatePhone": "0909123456"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/purchase-order/tenant-transporter-registry/{id}/references`

Lấy danh sách purchase request code và purchase order code đang tham chiếu tới một tenant transporter registry. Endpoint dùng cho UI/các flow kiểm tra tác động trước khi chỉnh sửa hoặc vô hiệu hóa cấu hình vận chuyển.

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
    "purchaseRequestCodes": [
      "PR-20260506-0001"
    ],
    "purchaseOrderCodes": [
      "PO-20260506-0001"
    ]
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu theo tenant hiện tại.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_REFERENCES.01` | 400 | Path `id` không hợp lệ. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_REFERENCES.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_REFERENCES.03` | 404 | Không tìm thấy tenant transporter registry hoặc reference theo tenant hiện tại. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_REFERENCES.04` | 422 | Tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_REFERENCES.05` | 502 | Downstream service, cache hoặc repository phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.PURCHASE_ORDER_CONTROLLER_V3_REFERENCES.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v3/quotation-asks`

Tạo mới quotation ask controller v3. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "refCode": "QA-20260506-0001",
    "taxCode": "QA-20260506-0001",
    "tenantName": 10,
    "partNameInput": "QuotationAskControllerV3 mẫu",
    "partNameUnit": "QuotationAskControllerV3 mẫu",
    "invoiceCompanyName": "QuotationAskControllerV3 mẫu",
    "status": "ACTIVE",
    "carType": "STANDARD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/quotation-asks/{id}`

Lấy dữ liệu quotation ask controller v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "QA-20260506-0001",
    "insuranceCode": "QA-20260506-0001",
    "purchaseRequestCode": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "genuineCode": "QA-20260506-0001",
    "parentCode": "QA-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/quotation-asks/detail/{code}`

Lấy dữ liệu quotation ask controller v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "id": 51001,
    "code": "QA-20260506-0001",
    "insuranceCode": "QA-20260506-0001",
    "purchaseRequestCode": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "genuineCode": "QA-20260506-0001",
    "parentCode": "QA-20260506-0001"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v3/quotation-asks/tenant-invoice-info`

Lấy dữ liệu quotation ask controller v3 theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "taxCode": "QA-20260506-0001",
    "invoiceCompanyName": "QuotationAskControllerV3 mẫu",
    "updatedAt": "2026-05-06",
    "tenantId": 10,
    "invoiceCompanyEmailAddress": "nguyen.van.a@example.com",
    "invoiceCompanyAddress": "123 Le Loi, Quan 1, TP HCM",
    "version": 1001
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.QUOTATION_ASK_CONTROLLER_V3_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

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
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

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
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_BATCH_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/all`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-realtime-all`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-realtime-all/{tenantId}`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-realtime-po-delivering`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-realtime-po-delivering/{tenantId}`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-realtime-qa-asking`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-realtime-qa-asking/{tenantId}`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-stats`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/dashboard-stats/{tenantId}`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-order`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-order/code/{purchaseOrderCode}`

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
    "purchaseOrderCode": "PO-20260506-0001"
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-order/id/{purchaseOrderId}`

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
    "purchaseOrderId": 51001
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-request`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-request/chat/{purchaseRequestCode}`

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
    "purchaseRequestCode": "PO-20260506-0001"
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-request/code/{purchaseRequestCode}`

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
    "purchaseRequestCode": "PO-20260506-0001"
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/purchase-request/id/{purchaseRequestId}`

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
    "purchaseRequestId": 51001
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/quotation-ask`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/quotation-ask/chat/{quotationAskCode}`

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
    "quotationAskCode": "QA-20260506-0001"
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/quotation-ask/code/{quotationAskCode}`

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
    "quotationAskCode": "QA-20260506-0001"
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/quotation-ask/id/{quotationAskId}`

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
    "quotationAskId": 51001
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/spending-chart`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/spending-chart/{tenantId}`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/spending-overview`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/spending-overview/{tenantId}`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/user/cards`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/user/cards/{userId}`

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
    "userId": 1001
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/user/preferences`

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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### DELETE `/protected/v1/cache/user/preferences/{userId}`

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
    "userId": 1001
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
| `GMS.gf-purchase.CACHE_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.CACHE_DELETE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.CACHE_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.CACHE_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.CACHE_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.CACHE_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/preliminary-quotation`

Tạo mới internal quotation. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "name": "InternalQuotation mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/pricing-proposals`

Tạo mới internal quotation. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "type": "STANDARD",
    "updateNumber": "IQ-20260506-0001",
    "createNumber": "IQ-20260506-0001"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/purchase-orders`

Lấy dữ liệu internal purchase theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "PO-20260506-0001",
      "status": "ACTIVE",
      "name": "InternalPurchase mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-orders`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "purchaseRequestCode": "PO-20260506-0001",
    "code": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "supplierName": "InternalPurchase mẫu",
    "status": "WAIT_TO_CONFIRM",
    "isBestPrice": 2500000,
    "purchaseRequestId": 51001,
    "source": "QUOTATION_ASK",
    "transportOrderId": 51001,
    "transportRouteId": 51001,
    "purchaserId": 51001,
    "supplierId": 51001,
    "paymentMethod": "COD"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/purchase-orders/{code}/items`

Lấy dữ liệu internal purchase theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "productId": 51001,
      "sku": "internal-purchase-sample-20260506",
      "quantity": 2,
      "unitOfMeasure": "internal-purchase-sample-20260506"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-orders/cod-delivered`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "name": "InternalPurchase mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/purchase-orders/code/{code}`

Lấy dữ liệu internal purchase theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "code": "PO-20260506-0001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "purchaseRequestCode": "PO-20260506-0001",
    "code": "PO-20260506-0001",
    "quotationAskCode": "PO-20260506-0001",
    "supplierName": "InternalPurchase mẫu",
    "status": "WAIT_TO_CONFIRM",
    "isBestPrice": 2500000,
    "purchaseRequestId": 51001,
    "source": "QUOTATION_ASK",
    "transportOrderId": 51001,
    "transportRouteId": 51001,
    "purchaserId": 51001,
    "supplierId": 51001,
    "paymentMethod": "COD"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-orders/stage`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "name": "InternalPurchase mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-orders/status`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/purchase-orders/transport-routes/{transportRouteId}/used`

Kiểm tra một transport route đã từng được purchase order sử dụng trong tenant hay chưa. Endpoint phục vụ kiểm tra an toàn trước khi service khác cập nhật hoặc vô hiệu hóa transport route.

**Auth**: service-to-service (`x-api-key`) và header tenant nội bộ.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example",
    "X-Tenant-ID": 10
  },
  "path": {
    "transportRouteId": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": true
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ kiểm tra usage reference theo tenant.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_TRANSPORT_ROUTE_USED.01` | 400 | Path `transportRouteId` hoặc header `X-Tenant-ID` không hợp lệ. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_TRANSPORT_ROUTE_USED.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_TRANSPORT_ROUTE_USED.03` | 404 | Không tìm thấy transport route hoặc dữ liệu usage trong tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_TRANSPORT_ROUTE_USED.04` | 422 | Tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_TRANSPORT_ROUTE_USED.05` | 502 | Downstream service, cache hoặc repository phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_TRANSPORT_ROUTE_USED.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-requests/postpaid`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "name": "InternalPurchase mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-requests/prepaid`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "name": "InternalPurchase mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-requests/receive-vendor-confirmation`

Xác nhận internal purchase, chuyển trạng thái sang bước xử lý tiếp theo.

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
    "name": "InternalPurchase mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_CONFIRM.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_CONFIRM.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_CONFIRM.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_CONFIRM.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_CONFIRM.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_CONFIRM.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/purchase-requests/status`

Cập nhật internal purchase theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "PO-20260506-0001",
    "status": "ACTIVE",
    "updatedAt": "2026-05-06T10:30:00+07:00"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_PURCHASE_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/quotation-asks`

Lấy dữ liệu internal quotation theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "QA-20260506-0001",
      "status": "ACTIVE",
      "name": "InternalQuotation mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_QUOTATION_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/protected/v1/quotation-asks`

Cập nhật internal quotation theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "refCode": "QA-20260506-0001",
    "tenantName": 10,
    "partNameInput": "InternalQuotation mẫu",
    "partNameUnit": "InternalQuotation mẫu",
    "status": "ACTIVE",
    "carType": "STANDARD",
    "updatedAt": "2026-05-06",
    "updatedBy": "2026-05-06"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_QUOTATION_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_UPDATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/v1/quotation-bids`

Tạo mới internal quotation. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "quotationAskCode": "QA-20260506-0001",
    "sparePartInputCode": "QA-20260506-0001",
    "code": "QA-20260506-0001",
    "refCode": "QA-20260506-0001",
    "partNameInput": "InternalQuotation mẫu",
    "partNameUnit": "InternalQuotation mẫu",
    "status": "ACTIVE",
    "tenantType": 10,
    "bidType": "STANDARD",
    "updatedInformation": "2026-05-06",
    "updatedAt": "2026-05-06"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-purchase.INTERNAL_QUOTATION_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md)
- Events: [gf-purchase-events.md](../events/gf-purchase-events.md)
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-purchase`: REST/JSON với public APIs (`/api/v1`, `/api/v2`, `/api/v3`, bearer JWT/security-context) cho cart (get/update/delete/add-spare-part), dashboard statistics (spending overview/chart/stats), direct purchase order (CRUD, attachments, status, related-service-order), purchase order (search/detail/confirm-received), purchase request (create/cancel/confirm/chat/detail/search), quotation ask CRUD/histories/chat/spare-parts, quotation pricing request, tenant context (current-user, ecommerce/tc-data-privacy confirm) và supplier; cộng protected APIs (`/protected/v1`) cho service-to-service purchase flows. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
