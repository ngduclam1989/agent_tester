 ---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 28
tier: T1
owner_authority: Architecture Authority
boundary: gf-accounting
last_reviewed: "2026-08-10"  # v28 Driver+ document sync (ADR-031) — xem Change Log.  # v26 CR-20260801-09 (MINOR, APPROVED — sonhoang) — §5.1 Semantics sửa sort key mặc định BR-PRC-018 của PRC LIST: index `idx_prc_run_tenant_garage_wh` cột cuối `created_at DESC` → `executed_at DESC`, khớp SSOT `gf-accounting-data-model.md:460`. v25 CR-20260801-02 (MINOR, self-approved) — §5.2 W06-2 DETAIL: thêm 1 dòng prose "Not found → 404 ERR-CMN-not-found" mirror §4.3 style, đóng NEED CONFIRMATION flag của FEAT-PRC-DETAIL (bff-tier) §4.5 phát hiện qua warm-up W06 Phase B GAP-W06-AGG-06. Documentation clarification thuần — KHÔNG đổi shape/behavior/error code. Prior: v24 mechanical rename BQGQ → PWA. v23 soft-delete filter fix (§5.1 LIST + §5.2 DETAIL exclude deleted_at) — see Change Log v23 row. Prior: v22 W06 Round 7 R6-F6 mechanical purge — §7 References label ADR-028 stale "(BG thread)" → "v2 (Temporal workflow)" cosmetic label; body §5.3/§5.4 already Temporal-accurate per v21. Also bump ADR-027 label to v3 for consistency with cascade. **KHÔNG đụng**: §5 endpoints (client contract HTTP 202 + polling 5s + `affectedSubsequentPeriods[]` + `aggregates` block Round 4/5 stable) + §6 Naming Registry + §1-§4 baseline. Pair với ADR-027 v4 + ADR-028 v3 + gf-accounting-HLD v14 + gf-accounting-data-model v13 + TECHSTACK v3. Prior notes: v20 W06 Round 5 BFF-vs-FE completeness fix — F-15 primary (§5.2 DETAIL response add `aggregates` block 8 fields openingQtyTotal/openingValueTotal/receiptQtyTotal/receiptValueTotal/deliveryQtyTotal/deliveryValueTotal/updatedDeliverySlipCountTotal/itemsCount — BE-computed across full filtered scope, post server-side filter `itemStatus`/`keyword`, pre-pagination; cover FEAT-PRC-DETAIL AC-3 "dòng Tổng"; §5.2 field description table extend 8 aggregate rows; §5.2 Semantics decision documented: aggregates **always non-null bất kể `includeItems` flag** — rationale payload nhỏ ~8 numbers + avoid double-fetch inefficient; SQL pattern single-pass same query pass as items, `SUM(delivery_value) FILTER (WHERE delivery_value IS NOT NULL)` skip ERROR items; §6.3 Naming Registry extend 9 rows (1 block header + 8 field mappings BE↔BFF↔FE, Mobile N/A since PRC web-only per §3f.4)). Cascade `agg-garage-graph-graphql.md v7.76` §3f.1 SDL new type `PriceCalcRunItemsAggregates` + §3f.6 DETAIL sample + §3f.3 resolver verbatim-passthrough note. **KHÔNG đụng**: (a) §1-§4 (Insurance/AP endpoints); (b) §5.1 LIST + §5.3 CREATE + §5.4 RECALC + §5.5 DELETE + §5.6 lookup (Round 4 F-01/F-05/F-08/F-11 stable); (c) §6.1 AP registry + §6.2 PriceCalcRun registry + §6.4 cross-boundary cost line writes; (d) §7 References. Round 5 mandate `Tracking/arch-design-W06-answers-5.md` — F-13 (BFF-side add `AffectedSubsequentPeriod` SDL — REST §5.3/§5.4 unchanged from v19 F-05, no touch here) + F-14 (INTEG-FE only) + F-16 (gf-inventory-api only) NOT touched in this file. Pair với `agg-garage-graph-graphql v7.76` (F-15 cascade SDL) + `gf-inventory-api v66` (F-16 unrelated) + `INTEG-FE v21` (F-14 unrelated).
depends_on:
  - "../hld/gf-accounting-HLD.md"
  - "../data/gf-accounting-data-model.md"
  - "../events/gf-accounting-events.md"
  - "../decisions/ADR-014-insurance-settlement-ownership.md"
  - "../decisions/ADR-015-insurance-debt-summary-strategy.md"
  - "../decisions/ADR-016-insurance-dossier-pdf-s3.md"
  - "../decisions/ADR-019-accounting-period-on-gf-accounting.md"
  - "../decisions/ADR-027-bqgq-engine-and-convergent-iteration.md"
  - "../decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md"
  - "../integrations/INTEG-EXT-gf-accounting-gf-inventory.md"
---

# REST API - `gf-accounting`

> API contract cho boundary `gf-accounting`, tập trung vào quyết toán service order, settlement documents, printing/export và đồng bộ trạng thái quyết toán với các boundary liên quan.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-accounting` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1` · `/api/v2` _(DESIGN — Accounting Period: `/api/v2/accounting-periods/*`, ADR-019)_ |
| Protected prefixes | `/protected/v1` _(DESIGN — Insurance Settlement: `insurance-debt-summary` cho gf-sales widget, x-api-key S2S; Accounting Period: `accounting-periods/lock-check` cho future RECEIPT-V2/DELIVERY-V2/PRC, x-api-key S2S, ADR-019)_ |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `POST` | `/api/v1/service-orders/{id}/settlements` | Settlement | authenticated |
| 2 | `GET` | `/api/v1/settlements/{code}` | Settlement | authenticated |
| 3 | `PUT` | `/api/v1/settlements/{code}` | Settlement | authenticated |
| 4 | `POST` | `/api/v1/settlements/{code}/cancel` | Settlement | authenticated |
| 5 | `GET` | `/api/v1/settlements/{id}/export-image` | SettlementPrinting | authenticated |
| 6 | `GET` | `/api/v1/settlements/{id}/export-pdf` | SettlementPrinting | authenticated |
| 7 | `GET` | `/api/v1/settlements/{id}/print-preview` | SettlementPrinting | authenticated |
| 8 | `POST` | `/api/v1/settlements/search` | Settlement | authenticated |
| — | — | _DESIGN — Insurance Settlement (EP-INSURANCE-SETTLEMENT, ADR-014). Chưa có trong source._ | — | — |
| 9 | `POST` | `/api/v1/insurance-dossier-documents/acceptance-record/render-pdf` | InsuranceDossier | authenticated |
| 10 | `POST` | `/api/v1/insurance-dossier-documents/payment-authorization/render-pdf` | InsuranceDossier | authenticated |
| 11 | `POST` | `/api/v1/insurance-dossier-documents/batch` | InsuranceDossier | authenticated |
| 12 | `POST` | `/api/v1/insurance-dossiers/search` | InsuranceDossier | authenticated |
| 15 | `POST` | `/api/v1/settlements/{code}/insurance-payments` | InsuranceSettlement | authenticated |
| 16 | `GET` | `/protected/v1/insurance-debt-summary` | InsuranceDebt | x-api-key (S2S, gf-sales) |
| — | — | _DESIGN — Accounting Period (EP-INVENTORY-ACCOUNTING-PERIOD, boundary correction Delivery Authority 2026-06-23, ADR-019). Chưa có trong source  ._ | — | — |
| 17 | `POST` | `/api/v2/accounting-periods/search` | AccountingPeriod | authenticated |
| 18 | `POST` | `/api/v2/accounting-periods/tree` | AccountingPeriod | authenticated |
| 19 | `GET` | `/api/v2/accounting-periods/{id}` | AccountingPeriod | authenticated |
| 20 | `POST` | `/api/v2/accounting-periods` | AccountingPeriod | authenticated |
| 21 | `PUT` | `/api/v2/accounting-periods/{id}` | AccountingPeriod | authenticated |
| 22 | `DELETE` | `/api/v2/accounting-periods/{id}` | AccountingPeriod | authenticated |
| 23 | `GET` | `/protected/v1/accounting-periods/lock-check` | AccountingPeriodLock | x-api-key (S2S, future RECEIPT-V2/DELIVERY-V2/PRC) |
| — | — | _DESIGN — PRC Tính giá xuất kho PWA (EP-INVENTORY-ACCOUNTING-PERIOD §3.2, W06, ADR-027 + ADR-028). Chưa có trong source._ | — | — |
| **W06-1** | `POST` | `/api/v2/price-calc-runs/search` | PriceCalcRun | authenticated |
| **W06-2** | `GET` | `/api/v2/price-calc-runs/{id}` | PriceCalcRun | authenticated |
| **W06-3** | `POST` | `/api/v2/price-calc-runs` | PriceCalcRun | authenticated |
| **W06-4** | `POST` | `/api/v2/price-calc-runs/{id}/recalc` | PriceCalcRun | authenticated |
| **W06-5** | `DELETE` | `/api/v2/price-calc-runs/{id}` | PriceCalcRun | authenticated |
| **W06-6** | `POST` | `/api/v2/price-calc-runs/lookup/items-for-cogs` | PriceCalcRun | authenticated |

> **Tái dùng (KHÔNG endpoint mới)**: tạo Phiếu QT BH dùng lại `POST /api/v1/service-orders/{id}/settlements` (đã hỗ trợ cặp CUSTOMER+INSURANCE) — request **bổ sung additive** 8 scalar adjustment fields + 8 scalar breakdown fields + `insurancePayableAmount`. Thông tin CTBH lấy từ `insuranceCompany` baseline trong SO (qua `for-settlement`) — **KHÔNG** thêm `insuranceCode`. Huỷ dùng `POST /api/v1/settlements/{code}/cancel`. Chi tiết Phiếu QT BH (FEAT-INS-STL-DETAIL) dùng lại `GET /api/v1/settlements/{code}` — response bổ sung block `insurance` + `debtPanel` (additive).
>
> **(DESIGN — Accounting Period, ADR-019)**: 7 endpoints AP CRUD + tree + lock-check là **entity hoàn toàn mới** (`accounting_period` table — xem [gf-accounting-data-model.md §6](../data/gf-accounting-data-model.md)); KHÔNG tái dùng settlement aggregate hay table hiện hữu. Prefix `/api/v2/*` coexist với baseline `/api/v1/*`. Chi tiết §4.

---

## 3. Endpoint Details

### POST `/api/v1/service-orders/{id}/settlements`

Tạo settlement cho service order đã hoàn tất hoặc đã đủ điều kiện quyết toán. Endpoint này ghi nhận phần khách hàng, phần bảo hiểm nếu có, và cập nhật trạng thái quyết toán liên quan.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống tạo trùng được xử lý theo service order, settlement type/trạng thái và rule nghiệp vụ nội bộ.

**Request**:
```json
{
  "path": {
    "id": 120045
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "serviceOrderId": 120045,
    "serviceOrderCode": "SO-20260506-0008",
    "customerSettlement": {
      "code": "SET-20260506-00001",
      "settlementType": "CUSTOMER",
      "settlementStatus": "DRAFT",
      "finalAmount": 2500000
    },
    "insuranceSettlement": {
      "code": "SET-20260506-00002",
      "settlementType": "INSURANCE",
      "settlementStatus": "DRAFT",
      "finalAmount": 1500000
    }
  }
}
```

**Side-effect**: tạo settlement record/document metadata và đồng bộ trạng thái quyết toán của service order.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.SETTLEMENT_CREATE.01` | 400 | Body không hợp lệ hoặc không parse được request. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.02` | 400 | Không resolve được tenant/user từ security context. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.03` | 404 | Service order không tồn tại hoặc downstream không trả dữ liệu quyết toán. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.04` | 409 | Service order đã có customer settlement active. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.05` | 409 | Service order đã có insurance settlement active. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.06` | 422 | Service order không có customer/insurance item nào để quyết toán. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.07` | 502 | Gọi `gf-sales` `for-settlement` hoặc `settle` thất bại. |
| `GMS.gf-accounting.SETTLEMENT_CREATE.08` | 500 | Không tạo được settlement code hoặc lưu settlement thất bại. |

### GET `/api/v1/settlements/{code}`

Lấy chi tiết settlement theo mã settlement để hiển thị, kiểm tra trạng thái hoặc chuẩn bị thao tác cập nhật/hủy.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "path": {
    "code": "SET-20260506-00001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "SET-20260506-00001",
    "serviceOrderCode": "SO-20260506-0008",
    "settlementType": "CUSTOMER",
    "settlementStatus": "DRAFT",
    "finalAmount": 2500000,
    "notes": "Khách thanh toán phần tự chi trả sau bảo hiểm",
    "documents": [
      {
        "id": 9001,
        "settlementId": 51001,
        "documentType": "SETTLEMENT",
        "documentUrl": "https://files.garage.example/settlements/SET-20260506-00001/bien-ban-quyet-toan.pdf",
        "fileName": "bien-ban-quyet-toan.pdf",
        "fileSize": 245760,
        "mimeType": "application/pdf",
        "description": "Biên bản quyết toán đã ký"
      }
    ]
  }
}
```

**Side-effect**: không có side-effect nghiệp vụ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.SETTLEMENT_READ.01` | 400 | Path `code` rỗng hoặc sai format. |
| `GMS.gf-accounting.SETTLEMENT_READ.02` | 400 | Không resolve được tenant từ security context. |
| `GMS.gf-accounting.SETTLEMENT_READ.03` | 404 | Không tìm thấy settlement theo `tenantId + code`. |
| `GMS.gf-accounting.SETTLEMENT_READ.04` | 500 | Lỗi đọc settlement document hoặc map response. |

### PUT `/api/v1/settlements/{code}`

Cập nhật ghi chú và danh sách document của settlement đã tồn tại. Endpoint này không dùng để đổi service order hoặc tạo settlement mới.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; cập nhật theo settlement code và trạng thái hiện tại.

**Request**:
```json
{
  "path": {
    "code": "SET-20260506-00001"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "code": "SET-20260506-00001",
    "settlementStatus": "DRAFT",
    "notes": "Cập nhật ghi chú sau khi bổ sung chứng từ thanh toán",
    "documents": [
      {
        "id": 9002,
        "settlementId": 51001,
        "documentType": "SETTLEMENT",
        "documentUrl": "https://files.garage.example/settlements/SET-20260506-00001/hoa-don-thanh-toan.pdf",
        "fileName": "hoa-don-thanh-toan.pdf",
        "fileSize": 189440,
        "mimeType": "application/pdf",
        "description": "Hóa đơn thanh toán bổ sung"
      }
    ]
  }
}
```

**Side-effect**: cập nhật settlement metadata và document list.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.SETTLEMENT_UPDATE.01` | 400 | Path `code` rỗng hoặc sai format. |
| `GMS.gf-accounting.SETTLEMENT_UPDATE.02` | 400 | Body không parse được hoặc document URL/file metadata không hợp lệ. |
| `GMS.gf-accounting.SETTLEMENT_UPDATE.03` | 404 | Không tìm thấy settlement theo `tenantId + code`. |
| `GMS.gf-accounting.SETTLEMENT_UPDATE.04` | 409 | Document list bị trùng `documentUrl` hoặc update conflict với trạng thái hiện tại. |
| `GMS.gf-accounting.SETTLEMENT_UPDATE.05` | 500 | Lỗi sync document: delete/save document thất bại. |

### POST `/api/v1/settlements/{code}/cancel`

Hủy settlement theo code và mở lại trạng thái quyết toán liên quan nếu domain cho phép. Dùng khi quyết toán bị nhập sai hoặc cần xử lý lại.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; hủy theo settlement code và trạng thái hiện tại.

**Request**:
```json
{
  "path": {
    "code": "SET-20260506-00001"
  }
}
```

**Response 200/201**:
```json
{
  "data": "SO-20260506-0008"
}
```

**Side-effect**: chuyển settlement sang trạng thái hủy và đồng bộ trạng thái service order liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.SETTLEMENT_CANCEL.01` | 400 | Path `code` rỗng hoặc sai format. |
| `GMS.gf-accounting.SETTLEMENT_CANCEL.02` | 400 | Không resolve được tenant từ security context. |
| `GMS.gf-accounting.SETTLEMENT_CANCEL.03` | 404 | Không tìm thấy settlement theo `tenantId + code`. |
| `GMS.gf-accounting.SETTLEMENT_CANCEL.04` | 409 | Settlement/service order đã ở trạng thái cancel hoặc không còn có thể reopen. |
| `GMS.gf-accounting.SETTLEMENT_CANCEL.05` | 502 | Gọi `gf-sales` `reopen-from-settled` thất bại. |
| `GMS.gf-accounting.SETTLEMENT_CANCEL.06` | 500 | Lỗi lưu trạng thái `CANCEL` cho các settlement cùng service order. |

### GET `/api/v1/settlements/{id}/export-image`

Export settlement thành image để tải xuống hoặc gửi cho người dùng cuối. Query `format` xác định định dạng ảnh trả về.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint export read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "contentType": "image/png",
  "fileName": "phieu-quyet-toan-SET-20260506-00001.png",
  "bodyPreview": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Side-effect**: render print template thành binary image; không thay đổi settlement state.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.PRINT_IMAGE.01` | 400 | Path `id` hoặc query `format` không hợp lệ. |
| `GMS.gf-accounting.PRINT_IMAGE.02` | 404 | Không tìm thấy settlement theo `tenantId + id`. |
| `GMS.gf-accounting.PRINT_IMAGE.03` | 422 | Không tìm thấy print strategy cho document type settlement. |
| `GMS.gf-accounting.PRINT_IMAGE.04` | 502 | Không lấy được garage/tenant info từ tenant service. |
| `GMS.gf-accounting.PRINT_IMAGE.05` | 500 | Render image hoặc generate filename thất bại. |

### GET `/api/v1/settlements/{id}/export-pdf`

Export settlement thành PDF để tải xuống, lưu trữ hoặc chia sẻ theo quy trình quyết toán.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint export read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "contentType": "application/pdf",
  "fileName": "phieu-quyet-toan-SET-20260506-00001.pdf",
  "bodyPreview": "JVBERi0xLjQKJcTl8uXr..."
}
```

**Side-effect**: render print template thành binary PDF; không thay đổi settlement state.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.PRINT_PDF.01` | 400 | Path `id` không hợp lệ. |
| `GMS.gf-accounting.PRINT_PDF.02` | 404 | Không tìm thấy settlement theo `tenantId + id`. |
| `GMS.gf-accounting.PRINT_PDF.03` | 422 | Không tìm thấy print strategy cho document type settlement. |
| `GMS.gf-accounting.PRINT_PDF.04` | 502 | Không lấy được garage/tenant info từ tenant service. |
| `GMS.gf-accounting.PRINT_PDF.05` | 500 | Render PDF hoặc generate filename thất bại. |

### GET `/api/v1/settlements/{id}/print-preview`

Tạo HTML preview của settlement trước khi export chính thức. Dùng cho màn hình xem trước chứng từ quyết toán.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint preview read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "path": {
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "contentType": "text/html",
  "body": "<html><body><h1>Settlement SET-20260506-00001</h1></body></html>"
}
```

**Side-effect**: render preview HTML; không thay đổi settlement state.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.PRINT_PREVIEW.01` | 400 | Path `id` không hợp lệ. |
| `GMS.gf-accounting.PRINT_PREVIEW.02` | 404 | Không tìm thấy settlement theo `tenantId + id`. |
| `GMS.gf-accounting.PRINT_PREVIEW.03` | 422 | Không tìm thấy print strategy cho document type settlement. |
| `GMS.gf-accounting.PRINT_PREVIEW.04` | 502 | Không lấy được garage/tenant info từ tenant service. |
| `GMS.gf-accounting.PRINT_PREVIEW.05` | 500 | Render HTML preview thất bại. |

### POST `/api/v1/settlements/search`

Tìm kiếm settlement theo filter và phân trang để phục vụ màn hình danh sách quyết toán.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint search không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "keyword": "SO-20260506",
  "settlementTypes": ["CUSTOMER", "INSURANCE"],
  "settlementStatuses": ["SETTLED"],
  "page": 0,
  "size": 20,
  "sort": "createdAt,desc"
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "SET-20260506-00001",
      "serviceOrderCode": "SO-20260506-0008",
      "settlementType": "CUSTOMER",
      "settlementStatus": "DRAFT",
      "finalAmount": 2500000
    },
    {
      "id": 51002,
      "code": "SET-20260506-00002",
      "serviceOrderCode": "SO-20260506-0008",
      "settlementType": "INSURANCE",
      "settlementStatus": "DRAFT",
      "finalAmount": 1500000
    }
  ],
  "pageInfo": {
    "page": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1
  },
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

**Side-effect**: không có side-effect nghiệp vụ.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-accounting.SETTLEMENT_SEARCH.01` | 400 | Body không parse được hoặc enum filter không hợp lệ. |
| `GMS.gf-accounting.SETTLEMENT_SEARCH.02` | 400 | Page/size/sort không hợp lệ. |
| `GMS.gf-accounting.SETTLEMENT_SEARCH.03` | 400 | Không resolve được tenant từ security context. |
| `GMS.gf-accounting.SETTLEMENT_SEARCH.04` | 500 | Query specification hoặc repository search thất bại. |

---

## 3bis. Insurance Settlement Endpoints (DESIGN — EP-INSURANCE-SETTLEMENT)

> ⚠️ Thiết kế (ADR-014/015/016), chưa có trong source. Headers chung: `Authorization`, `X-Tenant-Id`, `X-Branch-Id` (public); `x-api-key` + path `{tenantId}` (protected S2S). Response wrapper `ApiResponse<T>`. Tất cả query scope theo tenant (Critical Rule #4). Amount nhận từ request (KHÔNG tự tính — BR-GF-ACCOUNTING-006).

### 3bis.0 Additive — `POST /api/v1/service-orders/{id}/settlements` (tạo Phiếu QT BH)

Tái dùng endpoint create. Request bổ sung (additive, chỉ cho cặp INSURANCE). Thông tin CTBH lấy từ SO `insuranceCompany` baseline qua `for-settlement` — **KHÔNG** truyền `insuranceCode`:
```json
{
  "insurancePayableAmount": 197680000,
  "discountMaterialMode": "AMOUNT", "discountMaterialValue": 5000000,
  "discountLaborMode": "AMOUNT", "discountLaborValue": 2500000,
  "depreciationDefaultPercent": 0,
  "claimReductionMode": "AMOUNT", "claimReductionValue": 2000000,
  "insuranceDeductibleAmount": 520000,
  "breakdownServiceInsurance": 21000000, "breakdownServiceCustomer": 0,
  "breakdownPartsInsurance": 168000000, "breakdownPartsCustomer": 30000000,
  "breakdownVatInsurance": 18900000, "breakdownVatCustomer": 3000000,
  "breakdownTotalAfterVatInsurance": 207900000, "breakdownTotalAfterVatCustomer": 33000000
}
```
**Validation**: VLD-INS-STL-001 (SO có ≥1 dòng payer=BH — **chặn tạo phiếu QT BH cho SO toàn KH**), VLD-INS-STL-002 (đã chọn công ty BH), VLD-INS-STL-003 (chưa có Phiếu QT BH DRAFT trùng), **VLD-INS-SO-006 (mode `discountMaterialMode`/`discountLaborMode`/`claimReductionMode` ∈ {PERCENT, AMOUNT} — mode sai → `400 INS_ADJ_MODE_INVALID` [INS-1008], CR-1781085632 partial-supersedes CR-1780980611 (status 422→400, code giữ); KHÔNG còn 500 Jackson / `INVALID_ALLOCATION_MODE` cũ)**, số tiền + breakdown fields `≥ 0`. **Single-payer (CALC-INS-006)**: request có thể có `breakdown*Customer` = 0 (SO toàn BH) — hợp lệ, persist nguyên (amount nhận từ request, KHÔNG tự tính — BR-GF-ACCOUNTING-006). Snapshot immutable (CB-INS-002); pair atomic (CB-INS-004); callback gf-sales settle (CB-INS-003).

### 3bis.1 `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf`

**Render ③ Biên bản nghiệm thu, thanh lý hợp đồng** — trả byte[] PDF trực tiếp. KHÔNG persist, KHÔNG upload ct-file-storage (BFF orchestrate sẽ làm các step đó).

> **Field list strict theo Figma State 4** (frame 13257:537424, `Product/ux/figma-web/wave02-ins-dossier-create.md` §State 4) — template-driven: BE Thymeleaf `acceptance-record.html` bind đúng các keys dưới. **KHÔNG có** `placeIssued` / `insuranceCompany` / `additionalNotes` vì template biên bản nghiệm thu KHÔNG render các trường này. formData là transient (KHÔNG persist DB) — BA chốt 2026-06-16.

**Request body** (13 atomic fields):
```jsonc
{
  "settlementCode": "SET-20260530-00007",
  "formData": {
    "licensePlate": "30A-12345",                                // "Nhập biển kiểm soát xe" — prefill SO.vehicle
    "billDate": "26/04/2026",                                   // "Ngày lập biên bản" — dd/MM/yyyy
    "quoteReference": {                                          // "Căn cứ phiếu báo giá"
      "code": "BG-240426-01",
      "date": "24/04/2026"
    },
    "customer": {                                                // Bên A — khách hàng (prefill Settlement.customer)
      "name": "Công ty CP XD Smart Building Việt Nam",
      "address": "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải Phòng"
    },
    "garage": {                                                  // Bên B — xưởng sửa chữa (prefill Tenant/Branch)
      "name": "Công ty TNHH Sơn Quân (Green Auto)",
      "delegate": "Nguyễn Văn A",                                // "Đại diện" — nhập tay
      "delegateTitle": "Tổng Giám Đốc",                          // "Chức vụ" — nhập tay
      "address": "...",
      "taxId": "0201972206",                                     // "MST" — prefill garage master
      "bankAccount": "19134464547018",                           // "STK"
      "bankName": "Techcombank Kiến An"                          // "Tên ngân hàng"
    },
    "clauses": [                                                 // ClauseList ≥ 1 — prefill 4 mục từ SO line items, allow add
      "Bên B đã hoàn thành sửa chữa hạng mục 1...",
      "Bên B đã hoàn thành sửa chữa hạng mục 2..."
    ]
  }
}
```

**Flow nội bộ**:
1. Resolve settlement + SO + customer + vehicle + quoteRef + garageInfo từ DB (đối chiếu tenant scope; KHÔNG dùng để override formData — FE đã snapshot giá trị final cho template).
2. `AcceptanceRecordPrintDataBuilder.buildContext(settlement, formData)` → `AcceptanceRecordPrintContext`.
3. `docPrintService.generatePdf(ctx, DocumentPrintType.ACCEPTANCE_RECORD)` → byte[] (reuse `DocPrintService` + common-printing với template `acceptance-record.html` ship resource).

**Validation**:
- 400 `INS_DOSSIER_FORM_INCOMPLETE` (thiếu field bắt buộc: `licensePlate`, `billDate`, `customer.name`, `customer.address`, `garage.name`, `garage.address`, `clauses.length ≥ 1`).
- 404 `INS_STL_NOT_FOUND` (settlementCode không tồn tại / khác tenant).

**Response 200**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="bien-ban-nghiem-thu.pdf"`, body = byte[]. (Cùng pattern baseline `SettlementPrintingController.exportPdf:43`.)

### 3bis.2 `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf`

**Render ④ Giấy ủy quyền nhận tiền bồi thường** — trả byte[] PDF trực tiếp. KHÔNG persist.

> **Field list strict theo Figma State 5** (frame 13257:537605, `Product/ux/figma-web/wave02-ins-dossier-create.md` §State 5) — 4 sections (I. Bên ủy quyền, II. Bên được ủy quyền, III. Nội dung ủy quyền, IV. Cam kết). BE Thymeleaf `payment-authorization.html` bind đúng các keys dưới. formData là transient (KHÔNG persist DB) — BA chốt 2026-06-16.

**Request body** (23 atomic fields, 4 sections):
```jsonc
{
  "settlementCode": "SET-20260530-00007",
  "formData": {
    "placeIssued": "An Lão",                                    // header "An Lão, ngày 24/04/2026" — text input
    "dateIssued":  "24/04/2026",                                // header date — dd/MM/yyyy
    "customer": {                                                // I. Bên ủy quyền (prefill KH từ phiếu QT BH)
      "name": "Công ty CP XD Smart Building Việt Nam",
      "address": "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải Phòng",
      "nationality": "Việt Nam",
      "delegate": "Nguyễn Văn A",                                // I.4 "Đại diện"
      "delegateTitle": "Tổng Giám Đốc",                          // I.4 "Chức vụ"
      "nationalId": "132302342332",                              // I.5 Số CMND/CCCD
      "nationalIdIssueDate": "02/12/2023",                       // I.6 Ngày cấp (CMND/CCCD)
      "nationalIdIssuer": "Cục Cảnh sát Quản lý hành chính về Trật tự xã hội",  // I.7 Nơi cấp (CMND/CCCD)
      "insuranceCertNo": "BHTN912-0289390"                       // I.8 GCN bảo hiểm tự nguyện/bắt buộc
    },
    "garage": {                                                  // II. Bên được ủy quyền (prefill Tenant/Branch)
      "name": "Công ty TNHH Sơn Quân (Green Auto)",
      "taxId": "0201972206 / 0971.863.090",                      // II.2 Mã số thuế
      "delegate": "Nguyễn Văn B",                                // II.3 Đại diện
      "delegateTitle": "Giám đốc",                               // II.4 Chức vụ (đồng nhất naming với Form 1 garage)
      "bankAccount": "19134464547018 - Techcombank Kiến An"     // II.5 Số tài khoản (string bao gồm tên NH)
    },
    "vehicle": {                                                 // III.1-2 (prefill SO.vehicle)
      "type": "Honda Civic TypeR 2021",
      "licensePlate": "30A-123.45"
    },
    "accidentDate": "12/05/2026",                                // III.3 Ngày tai nạn
    "compensation": {                                            // III.4-6 (prefill Settlement.insurance amount)
      "amountNumeric": 330000000,                                // III.4 Số tiền (decimal)
      "amountInWords": "Ba trăm ba mươi triệu đồng",            // III.5 Bằng chữ (FE/BE auto-convert TBD)
      "content": "Bảo hiểm thanh toán theo hợp đồng"            // III.6 Nội dung
    },
    "commitmentClauses": [                                       // IV. Cam kết ≥ 3 mục (prefill 3 template, allow add)
      "Bên ủy quyền cam kết...",
      "Bên được ủy quyền cam kết...",
      "Hai bên cam kết..."
    ]
  }
}
```

**Flow nội bộ**:
1. Resolve settlement + customerInfo + vehicleInfo + insuranceInfo + garageInfo từ DB (đối chiếu tenant scope; FE đã snapshot formData final).
2. `PaymentAuthorizationPrintDataBuilder.buildContext(settlement, formData)` → `PaymentAuthorizationPrintContext`.
3. `docPrintService.generatePdf(ctx, DocumentPrintType.PAYMENT_AUTHORIZATION)` → byte[] (template `payment-authorization.html`).

**Validation**: 400 `INS_DOSSIER_FORM_INCOMPLETE` (thiếu field bắt buộc: `placeIssued`, `dateIssued`, `customer.name`, `customer.address`, `garage.name`, `vehicle.type`, `vehicle.licensePlate`, `accidentDate`, `compensation.amountNumeric`, `compensation.amountInWords`, `compensation.content`, `commitmentClauses.length ≥ 3`); 404 `INS_STL_NOT_FOUND`.

**Response 200**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="giay-uy-quyen-nhan-tien-boi-thuong.pdf"`, body = byte[].

### 3bis.3 `POST /api/v1/insurance-dossier-documents/batch`

**Persist dossier history** — atomic transaction INSERT dossier vN+1 + N row docs + UPDATE vN cũ REPLACED. BFF gọi endpoint này sau khi đã có N fileUrl từ ct-file-storage (Phase D trong orchestrator). KHÔNG render, KHÔNG upload.

**Request body**:
```json
{
  "settlementCode": "SET-20260530-00007",
  "documents": [
    {
      "documentType": "QUOTATION_SHEET",
      "fileUrl": "http://ct-file-storage:8888/files/aaa",
      "fileName": "phieu-bao-gia.pdf",
      "isSelected": true
    },
    {
      "documentType": "SETTLEMENT_SHEET",
      "fileUrl": "http://ct-file-storage:8888/files/bbb",
      "fileName": "phieu-quyet-toan.pdf",
      "isSelected": true
    },
    {
      "documentType": "ACCEPTANCE_RECORD",
      "fileUrl": "http://ct-file-storage:8888/files/ccc",
      "fileName": "bien-ban-nghiem-thu.pdf",
      "isSelected": true
    },
    {
      "documentType": "PAYMENT_AUTHORIZATION",
      "fileUrl": "http://ct-file-storage:8888/files/ddd",
      "fileName": "giay-uy-quyen-nhan-tien-boi-thuong.pdf",
      "isSelected": true
    }
  ]
}
```

**Flow nội bộ (1 atomic transaction)**:
1. INSERT `insurance_dossiers` vN+1 (auto-increment `version_no` per `settlement_code`), `dossier_status=EXPORTED`, `exported_at=now()`, `exported_by=currentUserId()`.
2. INSERT N row `insurance_dossier_documents` (1 per doc) — lưu `documentType` + `pdf_url` (URL ct-file-storage) + `pdf_file_name` + `is_selected` + `exported_at` + `exported_by`. Row immutable. **KHÔNG persist `formData`** — form chỉ là transient render input (BA chốt 2026-06-16).
3. Nếu có version cũ (vN) → UPDATE vN: `dossier_status=REPLACED`, `replaced_by_version=N+1`.
4. COMMIT transaction.

**Validation**:
- 400 `INS_DOSSIER_NO_DOC_SELECTED` (`documents` rỗng).
- 404 `INS_STL_NOT_FOUND`.
- 400 `INS_DOSSIER_VERSION_CONFLICT` (concurrent insert — rare, retry safe).

**Response 200**: `{ "data": { "dossierId": 7001, "versionNo": 1 } }`.

### 3bis.4 `POST /api/v1/insurance-dossiers/search`

**Search/list versions bộ hồ sơ** theo `settlementCode` (FEAT-INS-DOSSIER-VIEW) — read-only, **paginated** theo Spring Pageable convention (giống `POST /api/v1/settlements/search` §3 row 8). Immutability từ URL ct-file-storage object id.

**Request body**:
```json
{
  "settlementCode": "SET-20260530-00007",
  "page": 0,
  "size": 10
}
```

Validation:
- `settlementCode` required (404 `INS_STL_NOT_FOUND` nếu không tồn tại).
- `page ≥ 0` (default 0).
- `size ∈ [1, 50]` (default 10).

**Response 200** (Spring Pageable wrapper):
```json
{
  "data": {
    "content": [
      {
        "versionNo": 2,
        "dossierStatus": "EXPORTED",
        "exportedAt": "...",
        "exportedBy": "...",
        "replacedByVersion": null,
        "documents": [
          { "documentType": "QUOTATION_SHEET", "pdfUrl": "...", "pdfFileName": "...", "exportedAt": "..." },
          { "documentType": "ACCEPTANCE_RECORD", "pdfUrl": "...", "pdfFileName": "...", "exportedAt": "..." }
        ]
      },
      {
        "versionNo": 1,
        "dossierStatus": "REPLACED",
        "replacedByVersion": 2,
        "documents": [ ... ]
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

Ordered descending by `versionNo` (mới nhất trên cùng). Documents row chỉ trả PDF metadata (`documentType` + `pdfUrl` + `pdfFileName` + `exportedAt`) — **KHÔNG còn snapshot `form_data`** (BA chốt 2026-06-16: form transient, KHÔNG persist; muốn re-edit form thì xuất bản mới).

**`pdfUrl` format**: relative path / ct-file-storage object key (KHÔNG scheme, KHÔNG domain). FE compose download URL bằng cách nối domain config (env-driven) + `pdfUrl`, dùng cơ chế download hiện tại (pattern reuse từ phiếu QT in / settlement print). **KHÔNG có endpoint `/download` riêng**, **KHÔNG signed URL TTL** (đơn giản hoá per user feedback 2026-06-17).

### 3bis.5 Template Binding Map — ③④ (DEV contract cho BE Thymeleaf + FE form)

Template Thymeleaf bind **100% từ `${formData.X}`** — KHÔNG dùng `context.{customerInfo,vehicleInfo,garageInfo,insuranceInfo,quoteRef,serviceItems,partItems}.X` resolve từ Settlement entity.

**Rationale**: schema formData ③④ (§3bis.1-2) đã unify per strict Figma State 4&5 — bao gồm cả prefill data (FE prefill từ Settlement context trước khi user edit). Template render pure từ formData = "what user sees in modal → what gets printed" (Figma intent "click vào ô để sửa mọi field"). KHÔNG fallback context tránh override silent khi user clear field.

**Java implementation contract** (DEV W02 builds):
- `AcceptanceRecordPrintContext` Java class **chỉ wrap `formData`** (single field), không resolve thêm domain object từ Settlement.
- `PaymentAuthorizationPrintContext` tương tự.
- `AcceptanceRecordPrintDataBuilder.buildContext(settlement, formData)` chỉ tenant-scope validate + wrap formData → context (KHÔNG enrich từ Settlement).
- Cùng pattern cho `PaymentAuthorizationPrintDataBuilder`.

**Template files**: `Product/ux/assets/{bien-ban-nghiem-thu,giay-uy-quyen}.html` (Legal-approved, đã rewrite 2026-06-16 v? để dùng `${formData.X}` pure) — sync sang `services/gf-accounting/src/main/resources/templates/insurance-dossier/{acceptance-record,payment-authorization}.html` qua build/CI (ADR-016 §References).

**Field binding contract**:
- ③ `bien-ban-nghiem-thu.html`: 13 atomic `${formData.X}` paths theo §3bis.1 (`licensePlate`, `billDate`, `quoteReference.{code,date}`, `customer.{name,address}`, `garage.{name,delegate,delegateTitle,address,taxId,bankAccount,bankName}`, `clauses[]`).
- ④ `giay-uy-quyen.html`: 23 atomic `${formData.X}` paths theo §3bis.2 (`placeIssued`, `dateIssued`, `customer.{name,address,nationality,delegate,delegateTitle,nationalId,nationalIdIssueDate,nationalIdIssuer,insuranceCertNo}`, `garage.{name,taxId,delegate,delegateTitle,bankAccount}`, `vehicle.{type,licensePlate}`, `accidentDate`, `compensation.{amountNumeric,amountInWords,content}`, `commitmentClauses[]`).

**Verification**: `grep -nE 'context\.' Product/ux/assets/{bien-ban-nghiem-thu,giay-uy-quyen}.html` → 0 hit; `grep -nE 'formData\.' ...` → ③ 15+ hits, ④ 23+ hits (atomic field count + duplicates ở signature).

### 3bis.7 `POST /api/v1/settlements/{code}/insurance-payments`

Ghi nhận 1 đợt thanh toán BH (tái dùng baseline record-payment — CB-INS-005). Không publish event — debt widget dùng TTL cache (ADR-015).
**Request**: `{ "amount": 100000000, "paymentDate": "2026-05-30", "paymentMethod": "BANK_TRANSFER", "referenceCode": "..." }`.
**Validation**: huỷ Phiếu QT BH bị chặn sau khi có payment (BR-EP §3.1). Overpayment: **cho phép + `derivedStatus=OVERPAID`, KHÔNG chặn** (✅ chốt 2026-05-31 — BR-INS-STL-DET-008).
**Response 200**: `{ "data": { "settlementCode":"...", "totalPaid":..., "remainingReceivable":..., "derivedStatus":"PARTIAL|FULLY_PAID|OVERPAID" } }`.

### 3bis.8 `GET /protected/v1/insurance-debt-summary` (S2S — gf-sales widget)

Cung cấp số liệu công nợ BH cho widget Dashboard (CB-INS-008, ADR-015). Cache TTL = **5 phút** (✅ chốt 2026-05-31).
**Query**: `?period=YESTERDAY|THIS_WEEK|LAST_WEEK|THIS_MONTH|LAST_MONTH` (BR-INS-DASH-006), header `x-api-key`, path/header tenant.
**Response 200**:
```json
{ "data": {
  "totalReceivable": 980000000,
  "collectedInPeriod": 350000000,
  "pendingVoucherCount": 12,
  "topPendingByAmount": [ {"settlementCode":"...","insuranceCompanyName":"...","remainingReceivable":...,"createdAt":"...","debtAgeDays":18} ],
  "topOverdueByAge": [ {"settlementCode":"...","insuranceCompanyName":"...","debtAgeDays":45,"remainingReceivable":...} ]
} }
```
**Rules**: chỉ phiếu `payerType=INSURANCE` + `status=DRAFT` chưa "Đã thu đủ" (BR-INS-DASH-001/003); tuổi nợ tính **từ ngày tạo phiếu** (✅ chốt 2026-05-31 — BR-INS-DASH-004); threshold cảnh báo = **30 ngày** (✅ chốt — MISS-INS-001).

### 3bis.9 Error codes — Insurance Settlement (canonical `INS_*` — CR-1780980611, HTTP cập nhật CR-1781085632)

> **Contract**: gf-accounting **emit `INS_*` code trực tiếp** (registry `BR-EP-INSURANCE-SETTLEMENT.md` §5.5) cho luồng Phiếu QT BH (tạo/đọc/huỷ + insurance-payments + dossier export), đúng HTTP status; agg-garage-graph passthrough vào GraphQL `extensions.code`; FE bind theo `code`. Thay mã `GMS.gf-accounting.SETTLEMENT_*` cho **đường insurance** (đường customer/baseline giữ nguyên mã GMS hiện có). FIX: agent-fix-gf-accounting.
>
> **HTTP status update (CR-1781085632, 2026-06-10)**: 3 mã VALIDATION FE-facing (INS-2002/2004/1008) + 2 mã dossier (INS-3003/3004) đổi từ `422 → 400`. Registry codes giữ. Lý do: FE/Mobile error boundary treat 422 như crash → đổi 400 để FE bắt vào nhánh field-error. Partial-supersedes CR-1780980611 cột HTTP. Internal SETTLEMENT_CREATE.06 giữ 422 (không vào registry FE).

| Code (`INS_*`) | Num | HTTP | Điều kiện | Mã GMS cũ (insurance path — thay thế) | Nguồn |
|---|---|---|---|---|---|
| `INS_STL_COMPANY_REQUIRED` | INS-2002 | 400 | SO chưa chọn công ty BH khi tạo Phiếu QT BH. | (mới) | AC-15 · VLD-INS-STL-002 |
| `INS_STL_DUPLICATE_DRAFT` | INS-2003 | 400 | SO đã có Phiếu QT BH active. | `GMS.gf-accounting.SETTLEMENT_CREATE.05` (409) | AC-15 · VLD-INS-STL-003 |
| `INS_STL_SO_NOT_COMPLETED` | INS-2004 | 400 | SO chưa ở trạng thái cho phép quyết toán. | (mới) | AC-15 · VLD-INS-STL-004 |
| `INS_STL_PAIR_ATOMIC_FAILED` | INS-2005 | 500 | Tạo cặp settlement / callback settle thất bại → rollback. | `GMS.gf-accounting.SETTLEMENT_CREATE.08` (500) | AC-15 · CB-INS-004 |
| `INS_STL_NOT_FOUND` | INS-2006 | 404 | Không tìm thấy Phiếu QT BH theo `tenantId + code`. | `GMS.gf-accounting.SETTLEMENT_READ.03` (404) | STL-DETAIL AC-1 |
| `INS_ADJ_MODE_INVALID` | INS-1008 | 400 | `mode` điều chỉnh ∉ {PERCENT, AMOUNT} (nhận qua REST trực tiếp). 500 Jackson parse → 400 + emit code (handler enum). | `GMS...SETTLEMENT_CREATE` 500 / `INVALID_ALLOCATION_MODE` | AC-14 · VLD-INS-SO-006 |
| `INS_DOSSIER_NO_DOC_SELECTED` | INS-3003 | 400 | Request export dossier không có `documentTypes` (rỗng). | (mới) | DOSSIER-CREATE AC-9 · VLD-INS-DOSSIER-003 |
| `INS_DOSSIER_DOCS_INCOMPLETE` | INS-3004 | 400 | Một số tài liệu được tích chọn chưa hoàn tất → không export được. | (mới) | DOSSIER-CREATE AC-9 · VLD-INS-DOSSIER-003 |

**Internal (flag #2 — KHÔNG vào registry FE)**: "SO không có hạng mục bảo hiểm để quyết toán" (VLD-INS-STL-001) giữ mã nội bộ `GMS.gf-accounting.SETTLEMENT_CREATE.06` (422). Không surface code FE-facing — KHÔNG đổi (out-of-scope CR-1781085632).

Cross-cutting: `INS_FORBIDDEN_TENANT` (INS-9001/403), `INS_UNAUTHENTICATED` (INS-9002/401), `INS_INTERNAL_ERROR` (INS-9000/500). Xem registry §5.5.

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.
- **(Insurance — CR-1780980611)** Không trả 500 (Jackson parse) cho enum/mode sai — phải map về `INS_ADJ_MODE_INVALID` (422). Luồng insurance Phiếu QT BH phải emit `INS_*` registry code (§3bis.9, BR-EP §5.5), không dùng mã `GMS.gf-accounting.SETTLEMENT_*` cho FE-facing insurance error.

---

## 4. Accounting Period (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019)

> ⚠️ Thiết kế (Delivery Authority boundary correction 2026-06-23, CLAUDE override 2026-06-24, ADR-019). Chưa có trong source. 5 FEAT-AP-* (LIST/CREATE/DETAIL/EDIT/DELETE). Web GMS only per UX-FLOW-INVENTORY-ACCOUNTING-PERIOD. Error codes giữ `ERR-INV-021..026` verbatim per D2 micro-decision (xem §4.8 + ADR-019 Decision D).

### 4.1 POST `/api/v2/accounting-periods/search` — FEAT-AP-LIST (paged search by name + year filter)

**Auth**: authenticated tenant user. **Idempotency**: N/A (read-only). **Headers**: `Authorization`, `X-Tenant-Id` (resolved from security context).

**Request**:
```json
{
  "name": "Tháng 6",
  "year": 2026,
  "types": ["YEAR", "QUARTER", "MONTH"],
  "statuses": ["OPEN", "CLOSED"],
  "page": 0,
  "size": 50,
  "sort": "startDate,desc"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | NO | LIKE search trên `name` (BR-AP-015 — LIKE prefix/contains, case-insensitive). |
| `year` | integer | NO (nullable — `null` = không filter, trả mọi năm) | Filter periods trong năm dương lịch chỉ định. **v16 fix (2026-07-09)**: bỏ auto-default currentYear (spec cũ xung đột với picker use case §6.1 — filter `type=YEAR AND year=currentYear` luôn = 1 row do BR-AP-008 sibling non-overlap). FE main list view phải explicit truyền `year: currentYear` nếu cần default cũ. |
| `types` | array<enum> | NO | Filter `YEAR | QUARTER | MONTH`. Mặc định all. |
| `statuses` | array<enum> | NO | Filter `OPEN | CLOSED`. |
| `page` / `size` | int | NO | Default `page=0, size=50, max size=100`. |
| `sort` | string | NO | Format `field,asc|desc`. Default `startDate,desc`. |

**Response 200**:
```json
{
  "data": {
    "content": [
      {
        "id": 1024,
        "code": "AP-MONTH-133-202606",
        "name": "Tháng 6/2026",
        "type": "MONTH",
        "parentId": 1020,
        "parentName": "Quý 2/2026",
        "startDate": "2026-06-01",
        "endDate": "2026-06-30",
        "status": "OPEN",
        "displayOrder": 6,
        "description": null,
        "createdAt": "2026-01-15T03:00:00Z",
        "createdBy": "user:42",
        "updatedAt": "2026-01-15T03:00:00Z",
        "updatedBy": "user:42"
      }
    ],
    "pageable": {"page": 0, "size": 50, "total": 12}
  }
}
```

**Validation**: `page >= 0`, `size <= 100`, `year` in plausible range (2000–2100 defensive). Vi phạm → `400 ERR-CMN-validation`.

### 4.2 POST `/api/v2/accounting-periods/tree` — FEAT-AP-LIST (cây phân cấp Năm→Quý→Tháng + name search)

**Auth**: authenticated. **Idempotency**: N/A (read-only search — POST chỉ vì search body composite, KHÔNG side-effect). **Cache**: client-side reasonable cho stable filter; FE invalidate khi user create/delete kỳ.

**Request**: `POST /api/v2/accounting-periods/tree` với body:

```json
{ "year": 2026, "name": "Quý 2" }
```

| Body field | Type | Required | Description |
|---|---|---|---|
| `year` | integer | NO (default current year) | Filter root YEAR period cover năm chỉ định. |
| `name` | string | NO | LIKE search trên cột `accounting_period.name` (single column). Match `WHERE LOWER(unaccent(name)) LIKE LOWER(unaccent(:name)) || '%'` — case-insensitive Vietnamese-unaccent (consistent với V2-24 flat search; leverage existing index `idx_ap_tenant_name`). Match bất kỳ row nào của bất kỳ type Năm/Quý/Tháng. |

**Search semantics khi `name` provided**:
- Tree result giữ structure nested
- Include: matching node + **full ancestor path** (đảm bảo tree hợp lệ từ root YEAR xuống) + **full descendant subtree** của matching node (UX search-expand intuitive)
- Khi `name` rỗng/null → return full tree theo `year` only (behavior cũ)
- Khi cả `year` + `name` provided → match phải cùng nằm trong YEAR scope (ancestor path bắt đầu từ root YEAR matching `year`)

> **Impl note**: unaccent + prefix match + ancestor/descendant expand thực hiện **application-side** trong `AccountingPeriodQueryService` (fetch full year subtree qua `findByTenantIdAndYear` → in-memory filter với `java.text.Normalizer` NFD strip + explicit `đ→d`/`Đ→D`). V1 migration cố ý KHÔNG require PostgreSQL `unaccent` extension (xem `db/migration/V1__accounting_v1_accounting_period.sql:47-50`) — `idx_ap_tenant_name` là functional index trên `LOWER(name)` only. Cap 500 nodes vẫn kiểm pre-filter làm memory guard. Client-facing contract (SQL-equivalent semantic ở dòng LIKE trên) không đổi.

**Validation**: `year` trong plausible range (2000–2100 defensive); `name` ≤ 255 chars. Vi phạm → `400 ERR-CMN-validation`.

**Response 200**:
```json
{
  "data": {
    "periods": [
      {
        "id": 1000,
        "code": "AP-YEAR-133-2026",
        "name": "Năm 2026",
        "type": "YEAR",
        "parentId": null,
        "startDate": "2026-01-01",
        "endDate": "2026-12-31",
        "status": "OPEN",
        "displayOrder": 0,
        "children": [
          {
            "id": 1010,
            "code": "AP-QUARTER-133-2026Q1",
            "name": "Quý 1/2026",
            "type": "QUARTER",
            "parentId": 1000,
            "startDate": "2026-01-01",
            "endDate": "2026-03-31",
            "status": "OPEN",
            "displayOrder": 1,
            "children": [
              { "id": 1011, "name": "Tháng 1/2026", "type": "MONTH", "startDate": "2026-01-01", "endDate": "2026-01-31", "status": "CLOSED", "children": [] }
            ]
          }
        ]
      }
    ],
    "summary": {"total": 17}
  }
}
```

**Size cap (defensive — PL5 + ADR-019, R2 F2 fix)**: backend reject với plain `HTTP 413` (no specific error code) nếu `summary.total > 500` per tenant (mirror pattern R3 F10 dùng cho MaterialGroup tree). BFF layer translates sang user-facing GraphQL error `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (BFF-only code, không emit registry error code — xem `agg-garage-graph-graphql.md §3e.3`). **R2 fix rationale**: tránh resurrect deprecated `ERR-INV-027` (registry:125 = "Tính giá xuất kho thất bại" HTTP 500, deprecated per BR-PRC-007); BFF defense-in-depth layer là single point cho user-facing tree-cap error.

### 4.3 GET `/api/v2/accounting-periods/{id}` — FEAT-AP-DETAIL

**Auth**: authenticated. **Idempotency**: N/A. **Headers**: `Authorization`, `X-Tenant-Id`.

**Path**: `id` BIGINT.

**Response 200**:
```json
{
  "data": {
    "id": 1024,
    "code": "AP-MONTH-133-202606",
    "name": "Tháng 6/2026",
    "type": "MONTH",
    "parentId": 1020,
    "parentName": "Quý 2/2026",
    "parentBreadcrumb": [
      {"id": 1000, "name": "Năm 2026", "type": "YEAR"},
      {"id": 1020, "name": "Quý 2/2026", "type": "QUARTER"}
    ],
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "status": "OPEN",
    "displayOrder": 6,
    "description": null,
    "createdAt": "2026-01-15T03:00:00Z",
    "createdBy": "user:42",
    "updatedAt": "2026-01-15T03:00:00Z",
    "updatedBy": "user:42"
  }
}
```

**Not found** → `404 ERR-CMN-not-found`. Tenant mismatch → `404` (KHÔNG leak existence cross-tenant).

### 4.4 POST `/api/v2/accounting-periods` — FEAT-AP-CREATE (single + optional auto-generate children)

**Auth**: authenticated. **Idempotency**: KHÔNG yêu cầu `Idempotency-Key` (BA spec không yêu cầu); chống trùng qua BR-AP-008 overlap check.

**Request**:
```json
{
  "name": "Năm 2027",
  "type": "YEAR",
  "parentId": null,
  "year": 2027,
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "status": "OPEN",
  "displayOrder": 0,
  "description": "Kỳ kế toán năm 2027",
  "autoGenerateChildren": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | YES | BR-AP-002 — tên bắt buộc, không bắt unique. ≤255 chars. |
| `type` | enum | YES | `YEAR | QUARTER | MONTH`. |
| `parentId` | BIGINT | YES if type ≠ YEAR (BR-AP-004) | Phải point tới period cùng tenant với type cha hợp lệ (YEAR cho QUARTER, QUARTER cho MONTH). NULL bắt buộc khi type=YEAR. |
| `year` | integer | YES | **v15 add** per user quannn 2026-07-08 + FEAT-AP-CREATE AC-4 form field "Năm" (bắt buộc cho type=YEAR — user picks year dropdown). QUARTER/MONTH: FE derive từ parent chain client-side hoặc backend derive + validate consistency với parent.year. Backend persist column `accounting_period.year INTEGER NOT NULL` (per `gf-accounting-data-model.md §2ter.1 v10`) — CHECK constraint `year = EXTRACT(YEAR FROM start_date)` enforce cross-consistency với startDate. Auto-generate children propagate `year` từ YEAR row xuống 4 QUARTER + 12 MONTH (không cần user provide riêng). |
| `startDate` / `endDate` | DATE (ISO `YYYY-MM-DD`) | YES (BR-AP-005) | `endDate >= startDate` (BR-AP-006); range ⊆ parent range (cho trùng biên — BR-AP-007). Cross-check với `year`: EXTRACT(YEAR FROM startDate) == year (CHECK constraint). |
| `status` | enum | NO (default `OPEN` — BR-AP-001) | `OPEN | CLOSED`. |
| `displayOrder` | integer | NO (default 0 — BR-AP-005) | Sort hint. |
| `description` | string | NO | ≤500 chars. |
| `autoGenerateChildren` | boolean | NO (default `false`) | **Chỉ hợp lệ khi `type=YEAR` hoặc `type=QUARTER`** (BR-AP-009 — kỳ tháng không có tùy chọn). YEAR → sinh 4 quý + 12 tháng atomic; QUARTER → sinh 3 tháng atomic. Skip existing siblings (overlap check BR-AP-008). **v15**: children inherit `year` từ YEAR parent (auto-propagate). |

**Response 201**:
```json
{
  "data": {
    "createdPeriod": {
      "id": 2000,
      "code": "AP-YEAR-133-2027",
      "name": "Năm 2027",
      "type": "YEAR",
      "year": 2027,
      "status": "OPEN",
      "startDate": "2027-01-01",
      "endDate": "2027-12-31"
    },
    "generated": {
      "created": 16,
      "skipped": 0,
      "skippedDetails": []
    }
  },
  "code": "ACCOUNTING_PERIOD_CREATED"
}
```

> Nếu `autoGenerateChildren=true` nhưng có sibling đã tồn tại trùng khoảng ngày (BR-AP-008) → skip + ghi `skippedDetails: [{type, startDate, endDate, conflictWithId}]`; UI hiển thị toast tóm tắt **"Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại"** (AC-8 FEAT-AP-CREATE).

**Validation errors**:

| Trigger | HTTP | Code |
|---|---|---|
| `name` blank | 400 | `ERR-CMN-001` (placeholder — propose AP-specific code if needed, OQ5) |
| `endDate < startDate` | 400 | `ERR-INV-021` (BR-AP-006) |
| Child range outside parent (BR-AP-007) | 400 | `ERR-INV-022` |
| Sibling overlap (BR-AP-008) | 400 | `ERR-INV-023` |
| `type=YEAR` + `parentId != null` hoặc `type=QUARTER/MONTH` + invalid parent type (BR-AP-003/004) | 400 | `ERR-INV-022` (reuse) hoặc propose new |
| `autoGenerateChildren=true` + `type=MONTH` | 400 | invalid request (validation generic) |
| `year` mismatch với `startDate` — `year != EXTRACT(YEAR FROM startDate)` (v15 add, CHECK constraint violation) | 400 | `ERR-CMN-validation` (hoặc propose `ERR-AP-002` — OQ8 pending BA register) |
| `type=QUARTER/MONTH` + `year` mismatch với parent.year (v15 add) | 400 | `ERR-CMN-validation` (hoặc propose `ERR-AP-002`) |

**Atomicity**: entire create + auto-generate trong single `@Transactional`; partial failure → rollback all. `SELECT FOR UPDATE` lock on `parent_id` row trước overlap check để chống race với concurrent POST.

### 4.5 PUT `/api/v2/accounting-periods/{id}` — FEAT-AP-EDIT (mutable fields per BR-AP-016)

**Auth**: authenticated. **Idempotency**: N/A (PUT idempotent by nature).

**Path**: `id` BIGINT. **Request**:
```json
{
  "name": "Tháng 6/2026 — đã chốt",
  "description": "Đã chốt số liệu kho",
  "displayOrder": 6,
  "status": "CLOSED"
}
```

| Field | Mutable per BR-AP-016 | Description |
|---|---|---|
| `name` | YES | Required, ≤255 chars. |
| `description` | YES | Optional, ≤500 chars. |
| `displayOrder` | YES | Integer. |
| `status` | YES | `OPEN | CLOSED` — đối xứng (BR-AP-011 cho mở lại). Transitions tracked via standard `updated_at`/`updated_by` audit pair (no separate close/reopen audit cols — close/reopen = special case of status update). |

**Immutable fields (rejected)**: `type`, `parentId`, `startDate`, `endDate`, `autoGenerateChildren`. Request payload chứa các field này → reject `400 ERR-AP-001` (**NEW namespace `ERR-AP-*` — pending Business Authority register trong ERROR-CODE-REGISTRY.md; flag OQ7**). **R2 F1 fix rationale**: code ban đầu propose `ERR-INV-032` collide với existing registry:130 (`ERR-INV-032` = "Số lượng tồn phải lớn hơn 0", BR-OB-008, FEAT-OB-IMPORT) → vi phạm registry §1.1 "đổi semantics → cấp mã mới". Cleanly separate sang namespace `ERR-AP-*` dedicated cho Accounting Period domain trên gf-accounting boundary.

**Response 200**:
```json
{
  "data": {
    "id": 1024,
    "code": "AP-MONTH-133-202606",
    "name": "Tháng 6/2026 — đã chốt",
    "status": "CLOSED",
    "updatedAt": "2026-07-05T08:30:00Z",
    "updatedBy": "user:42"
  },
  "code": "ACCOUNTING_PERIOD_UPDATED"
}
```

> **Status transition note (BR-AP-012 + ADR-019 Decision C)**: khi `status` chuyển OPEN→CLOSED hoặc CLOSED→OPEN, future outbox sẽ ghi 1 row `AccountingPeriodClosed` / `AccountingPeriodReopened` (PROPOSED contract — KHÔNG publish trong batch; ACTIVE flip = future wave). Hiện tại update DB-only; downstream consumers chưa exist nên không có notification cascade.

### 4.6 DELETE `/api/v2/accounting-periods/{id}` — FEAT-AP-DELETE (3-guard)

**Auth**: authenticated. **Idempotency**: idempotent (delete same id twice → second returns 404).

**Path**: `id` BIGINT.

**Guards (BR-AP-013/014)**:
1. `status = OPEN` (CLOSED → `400 ERR-INV-025`).
2. Không còn children (recursive CTE check on `accounting_period.parent_id`) (có children → `400 ERR-INV-026`).
3. Không có stock transaction (phiếu nhập/xuất với ngày chứng từ trong `[startDate, endDate]`; tồn đầu kỳ với "Tồn đến ngày" rơi vào kỳ — gián tiếp; bản ghi tính giá trong kỳ) → `400 ERR-INV-025`. **Enforcement chi tiết ở downstream `EP-INVENTORY-RECEIPT-V2`/`EP-INVENTORY-DELIVERY-V2`/`EP-INVENTORY-OPENING-BALANCE`/`FEAT-PRC-*`** khi build sau (cross-boundary check qua REST query về downstream backend hoặc reverse lock-check). **Batch hiện tại enforce guard (1) + (2) trong `accounting_period`; guard (3) declared ở BR/ADR và là responsibility của downstream consumers khi commit transactions.**

**Response 204** (no content) khi delete thành công.

**Response 400**:
```json
{
  "error": {
    "code": "ERR-INV-025",
    "message": "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa.",
    "details": {
      "guardViolated": "STATUS_CLOSED",
      "periodStatus": "CLOSED"
    }
  }
}
```

### 4.7 GET `/protected/v1/accounting-periods/lock-check` — Future RECEIPT-V2/DELIVERY-V2/PRC (advisory)

**Auth**: x-api-key S2S (`INTERNAL_API_KEY`). **Idempotency**: idempotent (read-only). **Cacheable**: yes — caller-side LRU 30s recommended.

**Request**: `GET /protected/v1/accounting-periods/lock-check?date=2026-06-15&tenantId=133`

| Query param | Type | Required | Description |
|---|---|---|---|
| `date` | DATE (ISO `YYYY-MM-DD`) | YES | Ngày chứng từ cần check. |
| `tenantId` | BIGINT | YES (S2S — header `X-Tenant-Id` cũng accept) | Tenant scope. |

**Response 200** — when locked:
```json
{
  "data": {
    "locked": true,
    "periodId": 1024,
    "periodCode": "AP-MONTH-133-202606",
    "periodName": "Tháng 6/2026",
    "periodType": "MONTH",
    "status": "CLOSED",
    "startDate": "2026-06-01",
    "endDate": "2026-06-30"
  }
}
```

**Response 200** — when not locked (no CLOSED period covers date):
```json
{
  "data": {
    "locked": false,
    "periodId": 1024,
    "periodCode": "AP-MONTH-133-202606",
    "periodName": "Tháng 6/2026",
    "periodType": "MONTH",
    "status": "OPEN",
    "startDate": "2026-06-01",
    "endDate": "2026-06-30"
  }
}
```

**Response 200** — when no period covers date (chưa có kỳ nào include date này):
```json
{
  "data": {
    "locked": false,
    "periodId": null,
    "periodCode": null,
    "status": null
  }
}
```

> **Advisory only** — authoritative enforcement ở downstream backend commit guard. Lock-check fail-fast UX. Caller phải re-check authoritative trước khi commit final transaction.

### 4.8 Error codes (Accounting Period — D2 keep ERR-INV-* verbatim)

| Code | HTTP | Trigger | BR | Note |
|---|---|---|---|---|
| `ERR-INV-021` | 400 | `endDate < startDate` | BR-AP-006 | Existing registry entry. |
| `ERR-INV-022` | 400 | Child period date outside parent range | BR-AP-007 | Existing registry entry. Reuse cho invalid hierarchy (parentType mismatch BR-AP-003/004). |
| `ERR-INV-023` | 400 | Sibling period date overlap | BR-AP-008 | Existing registry entry. |
| `ERR-INV-024` | 400 | Write attempt vào CLOSED period (lock-check returns `locked=true`; advisory used by downstream backends) | BR-AP-012 | Existing registry entry — **already cross-boundary used by RECEIPT-V2/DELIVERY-V2/OB** per ERROR-CODE-REGISTRY:122/532. **Mismatch namespace** (ERR-INV-* trên gf-accounting boundary) tolerated per D2 micro-decision; flag OQ2 cho BA + Architect. |
| `ERR-INV-025` | 400 | Delete blocked: CLOSED hoặc has stock transactions | BR-AP-013 | Existing registry entry. |
| `ERR-INV-026` | 400 | Delete blocked: has children | BR-AP-014 | Existing registry entry. |
| _(no code)_ | 413 | Tree size cap exceeded (>500 periods/tenant) — backend trả plain HTTP 413, no registry error code | PL5 + ADR-019 | **R2 F2 fix**: KHÔNG reuse `ERR-INV-027` (deprecated registry:125, HTTP 500 "Tính giá xuất kho thất bại" BR-PRC-007 — zombie revival + HTTP shift = registry contract break). BFF layer translates sang `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (BFF-only code per `agg-garage-graph-graphql.md §3e.3`). |
| _(propose)_ `ERR-AP-001` | 400 | Update field immutable (`type`, `parentId`, `startDate`, `endDate`, `autoGenerateChildren`) | BR-AP-016 | **R2 F1 fix — NEW namespace `ERR-AP-*`** (dedicated cho Accounting Period domain trên gf-accounting boundary). Pending Business Authority register trong ERROR-CODE-REGISTRY.md (flag OQ7); placeholder cho đến khi BA + Architect approve. **Switched từ `ERR-INV-032` đã collide với registry:130 (BR-OB-008 "Số lượng tồn phải > 0" FEAT-OB-IMPORT)** — vi phạm own ADR-019 §D2 spirit "đổi semantics → cấp mã mới". |

> **D2 micro-decision** (ADR-019): error codes giữ verbatim `ERR-INV-021..026` không rename sang `ERR-ACC-*` mặc dù boundary đã đổi sang gf-accounting. Lý do: `ERR-INV-024` đã được dùng cross-boundary (registry §1.1: "đổi semantics → cấp mã mới, deprecate mã cũ"); rename = registry cascade cost cao. Cosmetic mismatch documented trong open_questions OQ2 — BA + Architect quyết định reclassify khi BA fix Product frontmatter.

## 5. PRC — Tính giá xuất kho PWA (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD §3.2, W06, ADR-027 + ADR-028)

> **Scope**: 6 endpoints mới cho luồng PRC (5 FEAT-PRC-* mapping): LIST, DETAIL (polling), CREATE (kick-off HTTP 202), RECALC, DELETE, LOOKUP items-for-cogs (scope "Chọn mã cụ thể"). Prefix `/api/v2/price-calc-runs/*`. Feature flag `Inventory:InventoryV2` gate class-level trên `PriceCalcRunController` (mirror pattern OB §3b). Tenant chưa enable → 403; web/mobile ẩn tile.
>
> **Cross-boundary REST S2S** cho phase 1/3/4: xem [INTEG-EXT-gf-accounting-gf-inventory.md](../integrations/INTEG-EXT-gf-accounting-gf-inventory.md) — endpoint list nằm ở `gf-inventory` side.
>
> **Coverage rule (Phase 5 v5 completeness)**: mỗi row #24-29 §2 có 1 detail sub-section riêng với đủ 6 khối (Headers · Path/Query params · Request body · Response 2xx · Response 4xx/5xx · Semantics). Naming Registry §6 canonical cross-tier BE↔BFF↔FE↔Mobile.

### 5.1 W06-1 — POST `/api/v2/price-calc-runs/search`

**Headers**: `Authorization: Bearer <jwt>` · `X-Tenant-Id: <int>` · `X-Branch-Id: <int>` (garage scope).

**Path / Query params**: (none — POST body carries filter).

**Request body**:
```json
{
  "warehouseId": 12,
  "pricingMethod": "PWA",
  "executedFrom": "2026-06-01",
  "executedTo": "2026-07-22",
  "page": 0,
  "size": 20,
  "sort": "executedAt,desc"
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `warehouseId` | int64 | NO | Filter theo kho (tenant-scoped); null = mọi kho. **Note**: Product FEAT-PRC-LIST AC-4 quy định UI chỉ 2 filter (Phương pháp + Ngày thực hiện). API vẫn giữ `warehouseId` optional cho API consumer khác (S2S / future filter), nhưng FE Web KHÔNG render "Kho" như UI filter control — kho là tenant-context-derived (single warehouse tenant thấy log tenant đó thôi; multi-warehouse tenant thấy hết mọi kho). Xem `INTEG-FE §3.6d` cho FE binding thực tế. | FEAT-PRC-LIST AC-4 (F-08 v19 clarify) |
| `pricingMethod` | enum `PWA` | NO | Default `PWA` (chỉ 1 method hỗ trợ) | FEAT-PRC-LIST AC-4 |
| `executedFrom` / `executedTo` | date (ISO-8601) | NO | Range on `price_calc_run.executed_at` | FEAT-PRC-LIST AC-4 "Ngày thực hiện" filter |
| `page` / `size` | int | NO | Default 0/20, max size 100 | FEAT-PRC-LIST AC-5 |
| `sort` | string | NO | Default `executedAt,desc` (BR-PRC-018 — lần mới nhất lên đầu) | BR-PRC-018 |

**Response 2xx** (200 OK):
```json
{
  "content": [
    {
      "id": 90123,
      "periodId": 5001,
      "periodName": "Tháng 6/2026",
      "fromDate": "2026-06-01",
      "toDate": "2026-06-30",
      "warehouseId": 12,
      "warehouseCode": "WH-01",
      "warehouseName": "Kho tổng",
      "pricingMethod": "PWA",
      "executedBy": "operator@garage.com",
      "executedByName": "Nguyễn Văn A",
      "executedAt": "2026-07-22T10:15:00Z",
      "scope": "ALL",
      "itemsResolvedCount": 42,
      "itemsDoneCount": 40,
      "itemsErrorCount": 2,
      "status": "COMPLETED_WITH_ERRORS"
    },
    {
      "id": 90124,
      "periodId": 5002,
      "periodName": "Tháng 7/2026",
      "fromDate": "2026-07-01",
      "toDate": "2026-07-31",
      "warehouseId": 12,
      "warehouseCode": "WH-01",
      "warehouseName": "Kho tổng",
      "pricingMethod": "PWA",
      "executedBy": "operator@garage.com",
      "executedByName": "Nguyễn Văn A",
      "executedAt": "2026-07-22T10:16:00Z",
      "scope": "ALL",
      "itemsResolvedCount": 42,
      "itemsDoneCount": 0,
      "itemsErrorCount": 0,
      "status": "PENDING"
    }
  ],
  "totalElements": 132,
  "totalPages": 7,
  "page": 0,
  "size": 20
}
```

| Field | Type | Cite |
|---|---|---|
| `content[].id` | int64 | data-model §7 `price_calc_run.id` |
| `content[].periodId`, `periodName` | int64, string | FEAT-PRC-LIST AC-2 "Kỳ kế toán" |
| `content[].fromDate`, `toDate` | date | FEAT-PRC-LIST AC-2 "Từ ngày" / "Đến ngày" |
| `content[].warehouseId`, `warehouseCode`, `warehouseName` | int64, string, string | FEAT-PRC-LIST AC-2 "Kho" |
| `content[].pricingMethod` | enum | FEAT-PRC-LIST AC-2 "Phương pháp tính giá vốn" |
| `content[].executedBy`, `executedByName` | string | FEAT-PRC-LIST AC-2 "Tài khoản thực hiện" (byName BFF-enrich pattern §3g gf-inventory OB per §3g) |
| `content[].executedAt` | timestamp | FEAT-PRC-LIST AC-2 "Ngày giờ thực hiện" |
| `content[].scope` | enum `ALL \| SPECIFIC` | data-model §7 `scope` |
| `content[].itemsResolvedCount` | int | FEAT-PRC-LIST AC-2 "Số mã" — mã đã resolve (PWA + Đang hoạt động, per BR-PRC-016 v33 + BR-PRC-009 v34) |
| `content[].itemsDoneCount`, `itemsErrorCount` | int | Aggregate (mỗi mã có 1 status) — computed via COUNT of `price_calc_run_item.status` |
| `content[].status` | enum `PENDING \| RUNNING \| SUCCEEDED \| COMPLETED_WITH_ERRORS` | FEAT-PRC-LIST AC-2 "Trạng thái" (BR-PRC-014). **F-01 v19 widen 3→4 enum**: matches §5.3 CREATE 202 response + §6.2 canonical + BFF SDL (source-of-truth full enum, LIST is not narrower). UI mapping in §6.2: `PENDING` + `RUNNING` both render **"Đang tính"** (transient async states between INSERT row and executor pick-up per ADR-028 §2). BR-PRC-014 v17 "3 giá trị hiển thị" = UI-visible state count remains 3 (Đang tính / Thành công / Hoàn thành có lỗi); `PENDING` is a BE transient sub-state of "Đang tính", not a 4th UI-visible state. |

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body validation invalid (dates malformed, size > 100) |
| 401 | Missing/invalid JWT |
| 403 | `X-Tenant-Id` mismatch (tenant-mismatch) HOẶC feature flag `Inventory:InventoryV2` off |
| 5xx | Unexpected error |

**Semantics**:
- **Soft-delete exclusion (mandatory)**: WHERE clause luôn kèm `AND deleted_at IS NULL` — log đã xóa (per §5.5 DELETE `deleted_at = now()`) KHÔNG được trả về ở danh sách này. Tránh UX confusion: kế toán xóa xong reload vẫn thấy row → tưởng xóa thất bại → xóa lại. Data soft-deleted vẫn giữ nguyên trong DB cho audit/reporting nội bộ (ngoài phạm vi API công khai này) — chỉ ẩn khỏi list-facing response.
- Pagination: offset-based (default per §12.2 HLD); cursor fallback nếu tenant > 10k runs (unlikely for monthly cadence).
- Permission gate: `accountant` + `garage-owner` (BR-AP-CMN-002 dual persona equal rights).
- Index used: `idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, executed_at DESC)` cho default sort BR-PRC-018.
- p95 target: ≤ 300ms (dashboard).
- `executedByName` enrichment: BFF-side qua Pattern TENANT-USERS (mirror OB pattern §3g agg-garage-graph); nullable defensive.

### 5.2 W06-2 — GET `/api/v2/price-calc-runs/{id}`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id`.

**Path / Query params**:
| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `id` | int64 | YES | Path param `price_calc_run.id`, tenant-scoped | data-model §7 |
| `includeItems` | bool | NO (query) | Default `true`; `false` = skip `items[]` (header only, faster polling) | FEAT-PRC-DETAIL AC-2c polling optimization |
| `itemStatus` | enum | NO (query) | Filter items: `DONE \| ERROR \| RUNNING`; multi via comma | FEAT-PRC-DETAIL AC-2b filter "Trạng thái" |
| `keyword` | string | NO (query) | Filter items: LIKE productCode OR productName (client-side per AC-2b but supported here for large logs) | FEAT-PRC-DETAIL AC-2b search |

**Request body**: N/A (GET).

**Response 2xx** (200 OK):
```json
{
  "id": 90123,
  "periodId": 5001,
  "periodName": "Tháng 6/2026",
  "fromDate": "2026-06-01",
  "toDate": "2026-06-30",
  "warehouseId": 12,
  "warehouseCode": "WH-01",
  "warehouseName": "Kho tổng",
  "pricingMethod": "PWA",
  "executedBy": "operator@garage.com",
  "executedByName": "Nguyễn Văn A",
  "executedAt": "2026-07-22T10:15:00Z",
  "scope": "ALL",
  "scopePredicate": { "pricingMethod": "PWA", "productStatus": "ACTIVE", "garageId": 42 },
  "status": "RUNNING",
  "progressPercent": 45,
  "progressItemsTotal": 42,
  "progressItemsDone": 19,
  "warningsSkippedItems": 3,
  "items": [
    {
      "id": 500001,
      "productCode": "SP-NB-000123",
      "productName": "Lốp xe 175/70R13",
      "mainUnitCode": "PCS",
      "openingQty": 100.000000,
      "openingValue": 1000000,
      "receiptQty": 80.000000,
      "receiptValue": 910000,
      "deliveryQty": 40.000000,
      "deliveryValue": 424444,
      "averageUnitPrice": 10611.11,
      "updatedDeliverySlipCount": 3,
      "status": "DONE",
      "errorReason": null,
      "iterationsApplied": 1
    },
    {
      "id": 500002,
      "productCode": "SP-NB-000456",
      "productName": "Dầu nhớt 5W-30",
      "mainUnitCode": "LITRE",
      "openingQty": 0,
      "openingValue": 0,
      "receiptQty": 20.000000,
      "receiptValue": 400000,
      "deliveryQty": 30.000000,
      "deliveryValue": null,
      "averageUnitPrice": null,
      "updatedDeliverySlipCount": 0,
      "status": "ERROR",
      "errorReason": "NEGATIVE_STOCK",
      "iterationsApplied": 0
    }
  ],
  "aggregates": {
    "openingQtyTotal": 100.000000,
    "openingValueTotal": 1000000,
    "receiptQtyTotal": 100.000000,
    "receiptValueTotal": 1310000,
    "deliveryQtyTotal": 70.000000,
    "deliveryValueTotal": 424444,
    "updatedDeliverySlipCountTotal": 3,
    "itemsCount": 42
  }
}
```

| Field | Type | Cite |
|---|---|---|
| `scopePredicate` | JSON | data-model §7 `price_calc_run.scope_predicate` — cho RECALC ALL re-resolve (BR-PRC-016) |
| `progressPercent` | int 0..100 | ADR-028 §4 — `round(items_done / items_total × 100)` |
| `warningsSkippedItems` | int | Mã "Ngừng hoạt động" bỏ qua (BR-PRC-012 v34); KHÔNG vào enum lỗi |
| `items[].averageUnitPrice` | Decimal(scale=2, HALF_UP) | BR-PRC-013 v22 (dùng chính giá trị 2 lẻ tính tiền vốn); FEAT-PRC-DETAIL AC-3 cột "Giá bình quân" (rename từ "Đơn giá bình quân" per v17); nullable khi item ERROR |
| `items[].updatedDeliverySlipCount` | int | FEAT-PRC-DETAIL AC-3 "Số phiếu xuất cập nhật" |
| `items[].status` | enum `RUNNING \| DONE \| ERROR` | BR-PRC-014 (từng mã) |
| `items[].errorReason` | enum `NEGATIVE_STOCK \| ACCOUNTING_MISMATCH \| SYSTEM_ERROR` \| null | BR-PRC-007 v30 (3 giá trị); UI hiển thị "Do tồn âm" / "Lệch hạch toán" / "Do sự cố hệ thống" |
| `items[].iterationsApplied` | int | Audit (ADR-027 §Phase 2); DEV verify convergence typical 3-8, cap 100 |
| `aggregates` (F-15 v20 add) | object | FEAT-PRC-DETAIL AC-3 "dòng **Tổng**" — BE-computed **across full filtered scope** (post server-side filter `itemStatus`/`keyword`, **before pagination**). FE KHÔNG tự SUM `items[]` (chỉ current page → sai Tổng dưới filter). **Always non-null** (empty filtered scope → all zeros + `itemsCount: 0`). |
| `aggregates.openingQtyTotal` / `.openingValueTotal` | Decimal(18,6) / Decimal(18,2) | Σ `items[].openingQty` / `.openingValue` across filtered scope (BR-PRC-002) |
| `aggregates.receiptQtyTotal` / `.receiptValueTotal` | Decimal(18,6) / Decimal(18,2) | Σ `items[].receiptQty` / `.receiptValue` across filtered scope (BR-PRC-001 v20) |
| `aggregates.deliveryQtyTotal` / `.deliveryValueTotal` | Decimal(18,6) / Decimal(18,2) | Σ `items[].deliveryQty` / `.deliveryValue`. **ERROR item `deliveryValue=null` → BE excludes từ SUM** (không cộng null; tránh corrupt total). SL vẫn full-scope SUM (deliveryQty non-null). |
| `aggregates.updatedDeliverySlipCountTotal` | int | Σ `items[].updatedDeliverySlipCount` (BR-PRC-005 tổng phiếu xuất đã cập nhật giá vốn cross-boundary) |
| `aggregates.itemsCount` | int | Tổng số mã trong filtered scope (before pagination). Khác `run.itemsResolvedCount` (post-Phase-1 resolve — có thể bao gồm scope predicate resolve trước filter). FE dùng cho "Tổng X mã" hiển thị. |

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Query params invalid |
| 401 | Auth |
| 403 | Tenant mismatch / feature flag |
| 404 | `id` không tồn tại HOẶC không thuộc tenant HOẶC log đã bị xóa (`deleted_at IS NOT NULL`) |
| 5xx | Unexpected |

**Not found** → `404 ERR-CMN-not-found`. Tenant mismatch → `404` (KHÔNG leak existence cross-tenant). Log đã soft-delete (`deleted_at IS NOT NULL`) → `404` cùng error code — KHÔNG phân biệt "chưa từng tồn tại" vs "đã xóa" (nhất quán §5.1 LIST soft-delete exclusion).

**Semantics**:
- **Soft-delete exclusion (mandatory)**: query luôn kèm `AND deleted_at IS NULL`, cùng nguyên tắc với §5.1 LIST — sau khi xóa (§5.5), log không còn truy cập được kể cả qua direct link/id trực tiếp (tránh lộ thông tin log đã xóa qua URL, nhất quán với việc log biến mất khỏi danh sách).
- Read-only; **NO state change**; safe cho FE polling AC-2c 5s interval.
- Cache Redis 3s TTL (per §12.4 HLD); invalidation trigger on state flip in `PriceCalcRunService.commit()`.
- Permission: dual persona.
- Index used: `idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, id)` PK lookup + `idx_prc_item_run (tenant_id, run_id, status)` filter.
- p95 target: ≤ 100ms (dashboard polling — single-row + items batch).
- `executedByName` BFF-enrich (mirror OB pattern).
- **`aggregates` block always non-null bất kể `includeItems` flag** (F-15 v20 decision — Round 5 fix): kể cả khi `includeItems: false` (progress-only polling), aggregates VẪN trả (payload nhỏ ~8 numbers, không đáng kể so với `items[]` batch). **Rationale**: FE cần Tổng bar rendered đồng thời với progress bar; nếu bỏ aggregates khi `includeItems: false` → FE phải re-poll với `includeItems: true` chỉ để render Tổng → double-fetch inefficient. Trade-off chấp nhận thêm ~200 bytes/poll cho polling optimization gain. Aggregates compute is cheap (single GROUP BY same query pass as items — no extra DB round-trip).
- **Aggregates compute pattern**: single SQL pass qua `price_calc_run_item` sau server-side filter (`itemStatus`/`keyword`), aggregate BEFORE pagination LIMIT/OFFSET. Query pattern reuse existing `idx_prc_item_run` index (v20 F-15 — no new index needed). Postgres `SUM()` với `FILTER (WHERE delivery_value IS NOT NULL)` cho `deliveryValueTotal` để skip ERROR items.

### 5.3 W06-3 — POST `/api/v2/price-calc-runs` (CREATE / kick-off)

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id` · **`X-Idempotency-Key: PRC-CREATE-{tenantId}-{periodId}-{warehouseId}-{clientNonce}`** (per ADR-028 §1).

**Path / Query params**: (none).

**Request body**:
```json
{
  "periodId": 5001,
  "warehouseId": 12,
  "pricingMethod": "PWA",
  "scope": "ALL",
  "items": null
}
```

Ví dụ `scope=SPECIFIC`:
```json
{
  "periodId": 5001,
  "warehouseId": 12,
  "pricingMethod": "PWA",
  "scope": "SPECIFIC",
  "items": [
    { "productCode": "SP-NB-000123" },
    { "productCode": "SP-NB-000456" }
  ]
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `periodId` | int64 | YES | Existing accounting_period row, tenant-scoped, `status=OPEN`; CLOSED → 409 `ERR-INV-024` | FEAT-PRC-CREATE AC-2 · BR-PRC-008 |
| `warehouseId` | int64 | YES | Existing warehouse, tenant-scoped | FEAT-PRC-CREATE AC-3 "Kho" |
| `pricingMethod` | enum `PWA` | YES | Currently only `PWA`; other methods `[MỞ RỘNG TƯƠNG LAI]` per BR-PRC-012 | FEAT-PRC-CREATE AC-3 "Phương pháp tính giá" |
| `scope` | enum `ALL \| SPECIFIC` | YES | `SPECIFIC` requires `items[]` non-empty | FEAT-PRC-CREATE AC-4 |
| `items[]` | array | Conditional | Required when `scope=SPECIFIC`; ≤ 500 items; each `productCode` must resolve to PWA + ACTIVE product (BR-PRC-012); Ngừng hoạt động → skip warning (BR-PRC-009 v34 — KHÔNG lỗi) | FEAT-PRC-CREATE AC-4/6/6b |
| `items[].productCode` | string | YES | Match `internal_product.code` tenant-scoped | BR-PRC-012 |

**Response 202** (Accepted — kick-off async per ADR-028 §1):
```json
{
  "runId": 90123,
  "status": "PENDING",
  "createdAt": "2026-07-22T10:15:00Z",
  "pollingUrl": "/api/v2/price-calc-runs/90123",
  "pollingIntervalHint": 5000,
  "warningsSkippedItems": 3,
  "warningsMessages": [
    { "type": "PRODUCT_INACTIVE_SKIPPED", "count": 2 },
    { "type": "PRODUCT_NON_PWA_SKIPPED", "count": 1 }
  ],
  "affectedSubsequentPeriods": [
    {
      "periodId": 5002,
      "periodName": "Tháng 7/2026",
      "lastRunId": 90050,
      "lastRunStatus": "SUCCEEDED"
    }
  ]
}
```

| Field | Type | Cite |
|---|---|---|
| `affectedSubsequentPeriods` (F-05 v19) | array | FEAT-PRC-CREATE AC-9b + BR-PRC-015 — kỳ sau đã tính giá cần recompute vì kỳ hiện tại thay đổi giá vốn/sổ tồn (BR-PRC-002 cascade). **Non-blocking warning**: CREATE vẫn 202 thành công; danh sách này FE render toast/panel để user tự trigger RECALC cho các period liệt kê. Empty `[]` = không có kỳ sau nào đã tính (case thường: kỳ đang tính là kỳ gần nhất). |
| `affectedSubsequentPeriods[].periodId` / `.periodName` | int64 / string | Kỳ sau đã có PRC run thành công (cùng warehouse) |
| `affectedSubsequentPeriods[].lastRunId` | int64 | Run gốc của kỳ sau (link cho UI "Xem chi tiết" hoặc "RECALC") |
| `affectedSubsequentPeriods[].lastRunStatus` | enum `SUCCEEDED \| COMPLETED_WITH_ERRORS` | Trạng thái run gốc kỳ sau |

**Response 200** (idempotent replay — same X-Idempotency-Key within 5min):
```json
{
  "runId": 90123,
  "status": "RUNNING",
  "createdAt": "2026-07-22T10:15:00Z",
  "pollingUrl": "/api/v2/price-calc-runs/90123",
  "pollingIntervalHint": 5000,
  "idempotentReplay": true,
  "affectedSubsequentPeriods": []
}
```

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body invalid: `periodId` không tồn tại; `warehouseId` không tồn tại; `items[]` empty khi scope=SPECIFIC; items > 500 |
| 401 | Auth |
| 403 | Tenant mismatch / feature flag |
| 404 | Period / warehouse không tenant scope |
| 409 | (a) `ERR-INV-024` — period CLOSED (BR-PRC-008 + AC-13b); (b) `ERR-INV-029` — run-in-progress cùng (period+warehouse) (BR-PRC-016 + AC-13) |
| 503 | Temporal Cloud outage — `WorkflowClient.start()` fail (rare); compensating DELETE row + client retry with backoff (ADR-028 v2 §Negative-3) |
| 5xx | Unexpected |

**Semantics**:
- **HTTP 202 vs 200**: 202 khi tạo run mới; 200 khi idempotent replay (không tạo mới, trả run hiện hữu).
- **Idempotency window**: 5 phút (per ADR-028 §1); ngoài window → new runId (audit BR-PRC-010 log mới chồng lên).
- Permission: dual persona.
- State-changing endpoint: INSERT `price_calc_run` row + `WorkflowClient.start(PriceCalcRunWorkflow::execute, input)` (Q2 v3 2026-07-23 — Temporal workflow thay `PriceCalcExecutorService.submit()` cũ per ADR-028 v2). WorkflowId = `prc-{tenantId}-{runId}` (Critical Rule #14 deterministic format). `WorkflowOptions.setTaskQueue("PRC_TASK_QUEUE").setWorkflowIdReusePolicy(REJECT_DUPLICATE).setWorkflowExecutionTimeout(Duration.ofMinutes(60))`. UPDATE `price_calc_run.temporal_workflow_id = workflowId` sau start (audit link).
- p95 target: ≤ 300ms (kick-off là INSERT + `WorkflowClient.start()` fire-and-forget; heavy work chạy trong workflow trên `PRC_TASK_QUEUE` worker).
- Guards Phase 0 (ADR-027 §5) áp trước INSERT: CLOSED period check + `SELECT FOR UPDATE` run-in-progress guard (Layer 1 concurrency) + `WorkflowIdReusePolicy.REJECT_DUPLICATE` (Layer 2 defense-in-depth).
- **Post-commit BR-PRC-015 cascade detection** (F-05 v19 add per FEAT-PRC-CREATE AC-9b): sau Phase 5 commit (ADR-027 §2), service query `price_calc_run` cho các period sau (`period.start_date > current_period.end_date`, cùng `warehouse_id`, cùng `tenant_id`, có successful run status ∈ `{SUCCEEDED, COMPLETED_WITH_ERRORS}`) → populate response `affectedSubsequentPeriods[]`. Query pattern reuse existing index `idx_prc_run_tenant_garage_wh` + `idx_ap_tenant_dates` (§12.3 HLD — no new index). Non-blocking advisory: CREATE vẫn 202 thành công bất kể detection kết quả. UI FE render toast/panel: "Kỳ [tên] cần chạy tính giá lại vì kỳ [current] đã đổi giá vốn/sổ tồn (BR-PRC-015)". Xem `gf-accounting-HLD.md §11` cho detection step description.

### 5.4 W06-4 — POST `/api/v2/price-calc-runs/{id}/recalc`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id` · **`X-Idempotency-Key: PRC-RECALC-{runId}-{clientNonce}`**.

**Path / Query params**:
| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `id` | int64 | YES | Existing run, tenant-scoped, `status ∈ {SUCCEEDED, COMPLETED_WITH_ERRORS}` (terminal); RUNNING/PENDING → 409 `ERR-INV-029` | FEAT-PRC-RECALC AC-3b |

**Request body**:
```json
{
  "runScope": "ALL"
}
```

Ví dụ `ERROR_ONLY`:
```json
{
  "runScope": "ERROR_ONLY"
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `runScope` | enum `ALL \| ERROR_ONLY` | YES | `ALL` per FEAT-PRC-RECALC AC-1 / `ERROR_ONLY` per AC-1b (chỉ chạy items status=ERROR còn Đang hoạt động) | BR-PRC-008 v29 |

**Response 202** (Accepted):
```json
{
  "runId": 90124,
  "sourceRunId": 90123,
  "runScope": "ERROR_ONLY",
  "status": "PENDING",
  "createdAt": "2026-07-22T11:30:00Z",
  "pollingUrl": "/api/v2/price-calc-runs/90124",
  "pollingIntervalHint": 5000,
  "warningsSkippedItems": 1,
  "affectedSubsequentPeriods": [
    {
      "periodId": 5002,
      "periodName": "Tháng 7/2026",
      "lastRunId": 90050,
      "lastRunStatus": "SUCCEEDED"
    }
  ]
}
```

- `sourceRunId` = run gốc (audit trail BR-PRC-010 log mới chồng lên); RECALC = NEW row, không reopen.
- `affectedSubsequentPeriods` (F-05 v19 add — same shape as §5.3 CREATE): kỳ sau đã tính giá bị ảnh hưởng cascade vì source run recompute (BR-PRC-015 + AC-9b). Non-blocking warning; FE liệt kê cho user tự RECALC. Empty `[]` = không có kỳ sau nào đã tính.

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body invalid (`runScope` không thuộc enum); `ERROR_ONLY` khi source run không có item ERROR (button disabled per AC-5b, nhưng defensive check) |
| 401 | Auth |
| 403 | Tenant mismatch / feature flag |
| 404 | Source run không tồn tại |
| 409 | (a) `ERR-INV-024` — period của source run đã CLOSED (BR-PRC-008 + AC-3); (b) `ERR-INV-029` — có run active cùng (period+warehouse) (BR-PRC-016 + AC-3b) |
| 503 | Temporal Cloud outage — `WorkflowClient.start()` fail (rare); compensating DELETE row + client retry with backoff (ADR-028 v2 §Negative-3) |

**Semantics**:
- **Creates NEW `price_calc_run` row** với `source_run_id = {id}` — audit trail giữ nguyên (BR-PRC-010). **KHÔNG mutate row source** (source run status/items intact — chỉ đọc).
- **Copy-forward Phase 0 step** (F-11 v19 clarify per ADR-027 v2 §4): TRƯỚC khi Phase 1/2/3 chạy, bulk INSERT `price_calc_run_item` cho new run bằng cách clone items từ source run:
  - `runScope='ALL'` → clone tất cả items (DONE + ERROR); mọi item mark `status='RUNNING'` sẵn sàng recompute Phase 2 ghi đè.
  - `runScope='ERROR_ONLY'` → clone tất cả items; items `DONE` giữ `status='DONE'` + values nguyên vẹn (satisfies BR-PRC-008 "mã Đã tính giữ nguyên, KHÔNG recompute"); items `ERROR` mark `status='RUNNING'` chờ Phase 2.
- Copy `scope_predicate` hoặc `items_snapshot` từ source run vào new run; ADR-027 §4 v2 applies (revalidate ACTIVE status filter; ALL scope re-resolve từ predicate cho phép mã mới xuất hiện).
- **Post-commit BR-PRC-015 cascade detection** (F-05 v19 add per FEAT-PRC-CREATE AC-9b — RECALC cũng propagate cascade tương tự CREATE): sau Phase 5 commit, service query `price_calc_run` cho các period sau (`period.start_date > current_period.end_date`, cùng `warehouse_id`, cùng `tenant_id`, có successful run status ∈ `{SUCCEEDED, COMPLETED_WITH_ERRORS}`) → populate response `affectedSubsequentPeriods[]`. Query pattern reuse existing index `idx_prc_run_tenant_garage_wh` + `idx_ap_tenant_dates` (§12.3 HLD — không cần index mới). Non-blocking (advisory warning; RECALC vẫn thành công bất kể có kỳ sau hay không).
- Permission: dual persona.
- p95 target: ≤ 300ms (kick-off pattern per §5.3 — INSERT row + `WorkflowClient.start(PriceCalcRunWorkflow::execute, input)` với `sourceRunId` field non-null; `workflowId = prc-{tenantId}-{newRunId}` per Rule #14 — mỗi RECALC = new workflow, không reuse workflow của source run).
- Concurrent guard shared với CREATE (BR-PRC-016 chặn cùng period+warehouse bất kể CREATE hoặc RECALC — Layer 1 DB `FOR UPDATE` + Layer 2 Temporal `WorkflowIdReusePolicy` + Layer 3 partial unique index).

### 5.5 W06-5 — DELETE `/api/v2/price-calc-runs/{id}`

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id`.

**Path / Query params**:
| Name | Type | Required | Constraint | Cite |
|---|---|---|---|---|
| `id` | int64 | YES | Existing run, tenant-scoped | FEAT-PRC-DELETE AC-1 |

**Request body**: N/A.

**Response 200**:
```json
{
  "runId": 90123,
  "deleted": true,
  "message": "Log tính giá đã được xóa. Giá vốn phiếu xuất giữ nguyên (không rollback)."
}
```

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 401 | Auth |
| 403 | Tenant mismatch / feature flag |
| 404 | Run không tồn tại |
| 409 | (a) `ERR-INV-024` — period CLOSED (BR-PRC-011 + AC-4); (b) `ERR-INV-029` — run `status ∈ {PENDING, RUNNING}` (BR-PRC-011 v13 + AC-4b) |
| 5xx | Unexpected |

**Semantics**:
- **KHÔNG rollback giá vốn** (BR-PRC-011 + AC-2) — phiếu xuất giữ nguyên `cost_unit_price` + `cost_value` đã điền.
- Soft delete pattern (audit): `price_calc_run.deleted_at = now(), deleted_by = actor` — audit query historical vẫn thấy.
- Permission: dual persona.
- p95 target: ≤ 100ms.
- Idempotency: repeat DELETE cùng runId → response 200 `{deleted: true}` với cached message (state đã terminal).

### 5.6 W06-6 — POST `/api/v2/price-calc-runs/lookup/items-for-cogs`

**Purpose**: Hỗ trợ form FEAT-PRC-CREATE scope "Chọn mã cụ thể" — dropdown "Thêm phụ tùng" (AC-6). Trả về mã PWA Đang hoạt động của garage, kèm info "Có phát sinh xuất" + "Lần tính gần nhất" (AC-5).

**Headers**: `Authorization` · `X-Tenant-Id` · `X-Branch-Id`.

**Path / Query params**: (none — POST body carries filter).

**Request body**:
```json
{
  "periodId": 5001,
  "warehouseId": 12,
  "keyword": "Lốp",
  "page": 0,
  "size": 20
}
```

| Field | Type | Required | Validation | Cite |
|---|---|---|---|---|
| `periodId` | int64 | YES | Context — cho "Lần tính gần nhất" lookup + BR-PRC-009 v34 "Đang hoạt động" filter | FEAT-PRC-CREATE AC-5 |
| `warehouseId` | int64 | YES | Context — cho "Có phát sinh xuất" count | FEAT-PRC-CREATE AC-5 |
| `keyword` | string | NO | LIKE mã/tên sản phẩm | FEAT-PRC-CREATE AC-6 dropdown search |
| `page` / `size` | int | NO | Default 0/20, max size 100 | Standard pagination |

**Response 200**:
```json
{
  "content": [
    {
      "productCode": "SP-NB-000123",
      "productName": "Lốp xe 175/70R13",
      "mainUnitCode": "PCS",
      "hasDeliveryInPeriod": true,
      "deliveryCountInPeriod": 3,
      "lastCalculatedAt": "2026-06-15T14:20:00Z"
    },
    {
      "productCode": "SP-NB-000789",
      "productName": "Bugi CR8E",
      "mainUnitCode": "PCS",
      "hasDeliveryInPeriod": false,
      "deliveryCountInPeriod": 0,
      "lastCalculatedAt": null
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "page": 0,
  "size": 20
}
```

| Field | Type | Cite |
|---|---|---|
| `content[].hasDeliveryInPeriod` | bool | FEAT-PRC-CREATE AC-5 "Có phát sinh xuất" — flag |
| `content[].deliveryCountInPeriod` | int | AC-5 chi tiết số phiếu xuất |
| `content[].lastCalculatedAt` | timestamp \| null | AC-5 "Lần tính gần nhất" (null = "Chưa tính trong kỳ") |

**Response 4xx/5xx**:
| Code | Meaning |
|---|---|
| 400 | Body invalid |
| 401 | Auth |
| 403 | Tenant mismatch / feature flag |
| 404 | Period / warehouse không tenant scope |
| 5xx | Unexpected |

**Semantics**:
- Read-only, idempotent.
- Cross-boundary REST composition: internal call `gf-erp-mdm` catalog search (PWA + ACTIVE filter) + `gf-inventory` slips-in-period count (§4.2 INTEG doc).
- Result cached BFF-side 60s (query fluctuates với new delivery slips — short TTL OK).
- Permission: dual persona.
- p95 target: ≤ 500ms (composition of 2 downstream calls; cache warm ≤ 100ms).

## 6. Naming Registry (cross-tier canonical names — BE ↔ BFF ↔ FE ↔ Mobile)

> Prevents drift BE ↔ BFF ↔ FE ↔ Mobile khi `/spawn-dev` fan-out song song. **1 concept ↔ 1 canonical name across 4 tiers**. Alien field trong Request/Response mà không có row §6 → Reviewer G11 P0.
>
> BFF file `agg-garage-graph-graphql.md` KHÔNG lặp registry — reference `See gf-accounting-api.md §6`.

### 6.1 Accounting Period (W04, ADR-019 — pre-existing baseline)

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Kỳ kế toán (bản ghi) | `AccountingPeriod` (entity) | `type AccountingPeriod` | `type AccountingPeriod` | `class AccountingPeriod` | `KG.gf-accounting.entities.AccountingPeriod` (needs_kg_update) |
| ID kỳ | `id: Long` | `id: Int!` | `id: number` | `id: int` | data-model §6 |
| Mã kỳ (defensive) | `code: String` | `code: String!` | `code: string` | `code` | data-model §6 |
| Tên kỳ | `name: String` | `name: String!` | `name: string` | `name` | BR-AP-002 |
| Loại kỳ | `type: AccountingPeriodType` enum `YEAR \| QUARTER \| MONTH` | `enum AccountingPeriodType { YEAR QUARTER MONTH }` | `type AccountingPeriodType = 'YEAR' \| 'QUARTER' \| 'MONTH'` | `enum AccountingPeriodType { year, quarter, month }` | BR-AP-003 |
| Trạng thái kỳ | `status: AccountingPeriodStatus` enum `OPEN \| CLOSED` | `enum AccountingPeriodStatus { OPEN CLOSED }` | `type AccountingPeriodStatus = 'OPEN' \| 'CLOSED'` | `enum AccountingPeriodStatus { open, closed }` | BR-AP-010 |
| Kỳ cha | `parentId: Long \| null` | `parentId: Int` | `parentId: number \| null` | `parentId: int?` | BR-AP-004 |
| Năm (kỳ Năm) | `year: Integer` | `year: Int!` | `year: number` | `year: int` | BR-AP-003a (v15 add) |
| Ngày bắt đầu | `startDate: LocalDate` | `startDate: Date!` | `startDate: string (YYYY-MM-DD)` | `startDate: DateTime` | BR-AP-005 |
| Ngày kết thúc | `endDate: LocalDate` | `endDate: Date!` | `endDate: string (YYYY-MM-DD)` | `endDate: DateTime` | BR-AP-005 |
| Thứ tự hiển thị | `displayOrder: Integer` | `displayOrder: Int!` | `displayOrder: number` | `displayOrder: int` | UX-FLOW §3.2 |
| Path param kỳ | `{id}` | `{id: Int!}` | `${id}` | `{id}` | §4 endpoints |

### 6.2 Price Calc Run (W06 — PRC, ADR-027 v3 + ADR-028 v2)

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Lần tính giá (log) | `PriceCalcRun` (entity) | `type PriceCalcRun` | `type PriceCalcRun` | `class PriceCalcRun` | ADR-027; data-model §7 (needs_kg_update) |
| ID lần tính | `id: Long` | `id: Int!` | `id: number` | `id: int` | data-model §7 |
| Kỳ kế toán ref | `periodId: Long` | `periodId: Int!` | `periodId: number` | `periodId: int` | FEAT-PRC-CREATE AC-2 |
| Tên kỳ (denorm snapshot) | `periodName: String` | `periodName: String!` | `periodName: string` | `periodName` | FEAT-PRC-LIST AC-2 "Kỳ kế toán" |
| Từ ngày | `fromDate: LocalDate` | `fromDate: Date!` | `fromDate: string (YYYY-MM-DD)` | `fromDate: DateTime` | FEAT-PRC-LIST AC-2 · BR-PRC-002 |
| Đến ngày | `toDate: LocalDate` | `toDate: Date!` | `toDate: string (YYYY-MM-DD)` | `toDate: DateTime` | FEAT-PRC-LIST AC-2 · BR-PRC-002 |
| ID kho | `warehouseId: Long` | `warehouseId: Int!` | `warehouseId: number` | `warehouseId: int` | FEAT-PRC-CREATE AC-3 |
| Mã kho (denorm) | `warehouseCode: String` | `warehouseCode: String!` | `warehouseCode: string` | `warehouseCode` | FEAT-PRC-LIST AC-2 |
| Tên kho (denorm) | `warehouseName: String` | `warehouseName: String!` | `warehouseName: string` | `warehouseName` | FEAT-PRC-LIST AC-2 |
| Phương pháp tính giá | `pricingMethod: PricingMethod` enum `PWA` | `enum PricingMethod { PWA }` | `type PricingMethod = 'PWA'` | `enum PricingMethod { pwa }` | FEAT-PRC-CREATE AC-3 · BR-PRC-012 (chỉ PWA) |
| Tài khoản thực hiện | `executedBy: String` | `executedBy: String!` | `executedBy: string` | `executedBy` | FEAT-PRC-LIST AC-2 · BR-PRC-009 |
| Tên tài khoản (BFF-enriched) | ~~N/A~~ (BE không expose) | `executedByName: String` (BFF-populated nullable) | `executedByName: string \| null` | `executedByName: String?` | Pattern TENANT-USERS (mirror OB pattern §3g agg-garage-graph) |
| Ngày giờ thực hiện | `executedAt: OffsetDateTime` | `executedAt: DateTime!` | `executedAt: string (ISO-8601)` | `executedAt: DateTime` | FEAT-PRC-LIST AC-2 · BR-PRC-018 sort key |
| Phạm vi mã | `scope: PriceCalcScope` enum `ALL \| SPECIFIC` | `enum PriceCalcScope { ALL SPECIFIC }` | `type PriceCalcScope = 'ALL' \| 'SPECIFIC'` | `enum PriceCalcScope { all, specific }` | FEAT-PRC-CREATE AC-4 · BR-PRC-009 |
| Trạng thái lần tính | `status: PriceCalcRunStatus` enum `PENDING \| RUNNING \| SUCCEEDED \| COMPLETED_WITH_ERRORS` | `enum PriceCalcRunStatus { PENDING RUNNING SUCCEEDED COMPLETED_WITH_ERRORS }` | Same TS union | Same Dart enum | BR-PRC-014 v17 (3 UI-facing + PENDING transient) |
| **UI mapping** (v19 F-01 explicit) — presentation-only, NOT contract | `PENDING` → **"Đang tính"** · `RUNNING` → **"Đang tính"** (cùng label) · `SUCCEEDED` → "Thành công" · `COMPLETED_WITH_ERRORS` → "Hoàn thành có lỗi" | Same mapping (BFF/FE presentation layer) | Same TS mapping | Same Dart mapping | BR-PRC-014 v17 "3 giá trị hiển thị"; `PENDING` = BE transient sub-state của "Đang tính" (row INSERTed nhưng executor chưa pick per ADR-028 §2), KHÔNG là 4th UI-visible state. FE ổn định UI trong window PENDING→RUNNING flip (< 5s typical). |
| Scope predicate (JSON) | `scopePredicate: JsonNode` | `scopePredicate: JSON` | `scopePredicate: Record<string, any>` | `scopePredicate: Map<String, dynamic>` | ADR-027 §Phase 0 (persist cho RECALC ALL reproduce) |
| Số mã đã resolve | `itemsResolvedCount: Integer` | `itemsResolvedCount: Int!` | `itemsResolvedCount: number` | `itemsResolvedCount: int` | FEAT-PRC-LIST AC-2 "Số mã" v11 |
| Số mã DONE | `itemsDoneCount: Integer` | `itemsDoneCount: Int!` | `itemsDoneCount: number` | `itemsDoneCount: int` | AC-8 aggregate |
| Số mã ERROR | `itemsErrorCount: Integer` | `itemsErrorCount: Int!` | `itemsErrorCount: number` | `itemsErrorCount: int` | AC-8 aggregate |
| Cảnh báo mã bị bỏ qua | `warningsSkippedItems: Integer` | `warningsSkippedItems: Int!` | `warningsSkippedItems: number` | `warningsSkippedItems: int` | AC-8 v27 (mã Ngừng hoạt động — không lỗi) |
| Progress % | `progressPercent: Integer` | `progressPercent: Int!` | `progressPercent: number` | `progressPercent: int` | ADR-028 §4 |
| Source run (RECALC) | `sourceRunId: Long \| null` | `sourceRunId: Int` | `sourceRunId: number \| null` | `sourceRunId: int?` | BR-PRC-010 audit trail |
| **Temporal workflow ID (audit link)** (v20 Q2 v3 add) | `temporalWorkflowId: String \| null` | ~~N/A~~ (BFF không expose — audit-only, internal Temporal identifier) | ~~N/A~~ | ~~N/A~~ | ADR-028 v2 §2 (workflowId = `prc-{tenantId}-{runId}` per Critical Rule #14); data-model §2quater.1 |
| Path param lần tính | `{id}` | `{id: Int!}` | `${id}` route path | `{id}` | §5 endpoints |
| Idempotency key header | `X-Idempotency-Key` | `X-Idempotency-Key` | `X-Idempotency-Key` | `X-Idempotency-Key` | ADR-028 v2 §1 |

### 6.3 Price Calc Run Item (W06 — chi tiết per mã)

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Dòng chi tiết mã | `PriceCalcRunItem` (entity) | `type PriceCalcRunItem` | `type PriceCalcRunItem` | `class PriceCalcRunItem` | data-model §7 (needs_kg_update) |
| ID dòng | `id: Long` | `id: Int!` | `id: number` | `id: int` | data-model §7 |
| Mã sản phẩm nội bộ | `productCode: String` | `productCode: String!` | `productCode: string` | `productCode` | FEAT-PRC-DETAIL AC-3 "Mã nội bộ" |
| Tên sản phẩm nội bộ | `productName: String` | `productName: String!` | `productName: string` | `productName` | FEAT-PRC-DETAIL AC-3 (v17 rename từ "Tên hàng hóa") |
| ĐVT chính | `mainUnitCode: String` | `mainUnitCode: String!` | `mainUnitCode: string` | `mainUnitCode` | FEAT-PRC-DETAIL AC-3 |
| SL tồn đầu kỳ | `openingQty: BigDecimal` | `openingQty: Decimal!` | `openingQty: number` | `openingQty: double` | FEAT-PRC-DETAIL AC-3 "Tồn đầu kỳ (SL, GT)" · BR-PRC-002 |
| GT tồn đầu kỳ | `openingValue: BigDecimal` | `openingValue: Decimal!` | `openingValue: number` | `openingValue: double` | BR-PRC-002 |
| SL nhập trong kỳ | `receiptQty: BigDecimal` | `receiptQty: Decimal!` | `receiptQty: number` | `receiptQty: double` | FEAT-PRC-DETAIL AC-3 "Nhập trong kỳ" · BR-PRC-001 v20 |
| GT nhập trong kỳ | `receiptValue: BigDecimal` | `receiptValue: Decimal!` | `receiptValue: number` | `receiptValue: double` | BR-PRC-001 v20 |
| SL xuất trong kỳ | `deliveryQty: BigDecimal` | `deliveryQty: Decimal!` | `deliveryQty: number` | `deliveryQty: double` | FEAT-PRC-DETAIL AC-3 "Xuất trong kỳ" |
| GT xuất trong kỳ | `deliveryValue: BigDecimal \| null` | `deliveryValue: Decimal` | `deliveryValue: number \| null` | `deliveryValue: double?` | Nullable khi item ERROR; DONE = `round(averageUnitPrice × deliveryQty, 0)` VND |
| **Giá bình quân** (UI microcopy per v17 rename) — internal concept "Đơn giá BQ" | `averageUnitPrice: BigDecimal(scale=2) \| null` | `averageUnitPrice: Decimal` | `averageUnitPrice: number \| null` | `averageUnitPrice: double?` | FEAT-PRC-DETAIL AC-3 cột **"Giá bình quân"** (rename từ "Đơn giá bình quân" per v17); BR-PRC-013 (round 2 lẻ HALF_UP); BR-PRC-001 công thức; nullable khi ERROR |
| Số phiếu xuất cập nhật | `updatedDeliverySlipCount: Integer` | `updatedDeliverySlipCount: Int!` | `updatedDeliverySlipCount: number` | `updatedDeliverySlipCount: int` | FEAT-PRC-DETAIL AC-3 · BR-PRC-005 |
| Trạng thái mã | `status: PriceCalcItemStatus` enum `RUNNING \| DONE \| ERROR` | `enum PriceCalcItemStatus { RUNNING DONE ERROR }` | Same TS union | Same Dart enum | FEAT-PRC-DETAIL AC-3 · BR-PRC-014 |
| Lí do lỗi | `errorReason: PriceCalcErrorReason \| null` enum `NEGATIVE_STOCK \| ACCOUNTING_MISMATCH \| SYSTEM_ERROR` | `enum PriceCalcErrorReason { NEGATIVE_STOCK ACCOUNTING_MISMATCH SYSTEM_ERROR }` | Same TS union | Same Dart enum | FEAT-PRC-DETAIL AC-4 · BR-PRC-007 v30 (3 giá trị) |
| Số vòng lặp áp dụng | `iterationsApplied: Integer` | `iterationsApplied: Int!` | `iterationsApplied: number` | `iterationsApplied: int` | ADR-027 §Phase 2 audit |

**Items Aggregates (F-15 v20 add — DETAIL response only, `PriceCalcRunItemsAggregates` block)** — BE-computed dòng Tổng across full filtered scope (post `itemStatus`/`keyword`, pre-pagination):

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Block "dòng Tổng" items | ~~N/A~~ (DETAIL only, response envelope field) | `type PriceCalcRunItemsAggregates` + `PriceCalcRunDetail.aggregates: PriceCalcRunItemsAggregates!` | `type PriceCalcRunItemsAggregates` (embedded trong DETAIL) | ~~N/A mobile~~ (PRC web-only per §3f.4) | FEAT-PRC-DETAIL AC-3 "dòng **Tổng**" |
| Σ tồn đầu kỳ (SL) | `openingQtyTotal: BigDecimal` | `openingQtyTotal: Decimal!` | `openingQtyTotal: number` | — | §5.2 aggregates block · BR-PRC-002 |
| Σ tồn đầu kỳ (GT) | `openingValueTotal: BigDecimal` | `openingValueTotal: Decimal!` | `openingValueTotal: number` | — | §5.2 aggregates block · BR-PRC-002 |
| Σ nhập trong kỳ (SL) | `receiptQtyTotal: BigDecimal` | `receiptQtyTotal: Decimal!` | `receiptQtyTotal: number` | — | §5.2 aggregates block · BR-PRC-001 v20 |
| Σ nhập trong kỳ (GT) | `receiptValueTotal: BigDecimal` | `receiptValueTotal: Decimal!` | `receiptValueTotal: number` | — | §5.2 aggregates block · BR-PRC-001 v20 |
| Σ xuất trong kỳ (SL) | `deliveryQtyTotal: BigDecimal` | `deliveryQtyTotal: Decimal!` | `deliveryQtyTotal: number` | — | §5.2 aggregates block · full-scope SUM (deliveryQty non-null bất kể ERROR) |
| Σ xuất trong kỳ (GT) | `deliveryValueTotal: BigDecimal` | `deliveryValueTotal: Decimal!` | `deliveryValueTotal: number` | — | §5.2 aggregates block · `SUM(delivery_value) FILTER (WHERE delivery_value IS NOT NULL)` (BE-skip ERROR items để tránh corrupt total per BR-PRC-013) |
| Σ số phiếu xuất cập nhật | `updatedDeliverySlipCountTotal: Integer` | `updatedDeliverySlipCountTotal: Int!` | `updatedDeliverySlipCountTotal: number` | — | §5.2 aggregates block · BR-PRC-005 |
| Tổng số mã (post-filter, pre-pagination) | `itemsCount: Integer` | `itemsCount: Int!` | `itemsCount: number` | — | §5.2 aggregates block · FEAT-PRC-DETAIL AC-3 "Tổng X mã" hiển thị (khác `run.itemsResolvedCount` post-Phase-1 resolve) |

> **UI label mapping VN** (presentation-layer only — NOT backend contract): `item.status.RUNNING`→"Đang tính", `item.status.DONE`→"Đã tính", `item.status.ERROR`→"Lỗi"; `errorReason.NEGATIVE_STOCK`→"Do tồn âm", `errorReason.ACCOUNTING_MISMATCH`→"Lệch hạch toán", `errorReason.SYSTEM_ERROR`→"Do sự cố hệ thống"; `run.status.SUCCEEDED`→"Thành công", `run.status.COMPLETED_WITH_ERRORS`→"Hoàn thành có lỗi", `run.status.PENDING`→"Đang tính", `run.status.RUNNING`→"Đang tính" (**F-01 v19 canonical row now in §6.2**). Handled at BFF/FE presentation layer. Backend contract giữ ENUM English.

### 6.4 Cost line writes (cross-boundary — mapping sang `gf-inventory` bulk endpoints, xem INTEG-EXT-gf-accounting-gf-inventory §4.3-4.5)

| Concept | BE | BFF | FE | Mobile | Cite |
|---|---|---|---|---|---|
| Delivery line cost per unit | `costUnitPrice: BigDecimal(scale=2)` | — (BFF không expose write) | — | — | INTEG §4.3; matches `gf-inventory-api.md §5.4.3` `costUnitPrice` canonical |
| Delivery line cost total | `costValue: Integer` (VND) | — | — | — | INTEG §4.3; matches gf-inventory canonical |
| Receipt line inherited unit price | `inheritedUnitPrice: BigDecimal(scale=2)` | — | — | — | INTEG §4.4; specific to PRC context (BR-PRC-001 v20 kế thừa) |
| Iteration cap | `SAFETY_ITERATION_CAP: 100` (constant) | — | — | — | ADR-027 §3 |

### 6.5 Đồng bộ chứng từ Driver+ (ad-hoc 2026-08-10, ADR-031)

> Field **event payload** của step `DOCUMENT.SETTLEMENT.SYNC` ([`gf-accounting-events.md`](../events/gf-accounting-events.md) §3.3). Tên canonical **dùng chung** với `gf-sales` ([`gf-sales-api.md`](gf-sales-api.md) §5.2bis) — 2 producer, 1 topic, Driver+ parse 1 shape.

| Concept (Product term VI) | BE (Java camelCase) | BFF (GraphQL SDL) | FE (TS type field) | Mobile (Dart field) | Cite |
|---|---|---|---|---|---|
| Mã chứng từ | `documentCode` | *(không expose)* | *(không expose)* | *(không expose)* | `FEAT-STL-CREATE` AC-3 |
| Loại chứng từ | `documentType` | — | — | — | `BR-STL-CRE-008` |
| Mã phiếu quyết toán | `settlementCode` | `settlementCode: String!` | `settlementCode: string` | `settlementCode` | `KG.gf-accounting.entities.SettlementRecord.code` |
| Bên thanh toán | `settlementType` | `settlementType: SettlementType!` | `settlementType: SettlementType` | `settlementType` | `FEAT-STL-CREATE` AC-4/AC-5 |
| Mã phiếu quyết toán liên quan (cặp) | `relatedSettlementCode` | `relatedSettlementCode: String` | `relatedSettlementCode: string \| null` | `relatedSettlementCode` | `FEAT-STL-CREATE` AC-4 |
| Mã phiếu dịch vụ gốc | `serviceOrderCode` | `serviceOrderCode: String!` | `serviceOrderCode: string` | `serviceOrderCode` | `FEAT-STL-CREATE` AC-3 ("phiếu dịch vụ gốc") |
| Mã lịch hẹn | `bookingCode` | `bookingCode: String` | `bookingCode: string` | `bookingCode` | `BR-STL-CRE-008` · nguồn: `gf-sales-api.md` §3bis.2 (`for-settlement` v13) |
| Cờ nguồn Driver+ | `isDriverPlusSource` | — | — | — | `gf-sales-api.md` §3bis.2 — điều kiện emit |
| Mã lịch hẹn phía Driver+ | `externalBookingId` | `externalBookingId: String` | `externalBookingId: string` | `externalBookingId` | `gf-sales-api.md` §5.1 |
| Đường dẫn tệp / tên tệp / MIME / checksum / hạn tải | `file.fileUrl` · `file.fileName` · `file.mimeType` · `file.checksum` · `file.expiresAt` | — | — | — | ADR-031 D4 |

| Enum type | Values | Cite |
|---|---|---|
| `DocumentType` | `SERVICE_ORDER \| SETTLEMENT` | ADR-031 D3 |
| `SettlementType` (đã có, tái dùng) | `CUSTOMER \| INSURANCE` | `FEAT-STL-CREATE` AC-4/AC-5 · data-model §2 |
| `DocumentMessageStep` | `DOCUMENT.SERVICE_ORDER.SYNC \| DOCUMENT.SETTLEMENT.SYNC \| DOCUMENT.SERVICE_ORDER.REVOKED` | ADR-031 D3 — `gf-accounting` chỉ phát step `DOCUMENT.SETTLEMENT.SYNC`; **không có** `SETTLEMENT.REVOKED` (mandate Q8) |

> **Không expose ra BFF/FE/Mobile**: chứng từ đi thẳng GMS → Driver+ qua Kafka; **không thêm endpoint REST nào** trong đợt này (§2 Endpoint Summary không đổi). Cột "—" là có chủ đích.

## 7. References

- HLD: [gf-accounting-HLD.md](../hld/gf-accounting-HLD.md) §9 (Accounting Period) + **§11 PRC subsystem (W06)** + **§12 Performance & Scale (W06)**
- Events: [gf-accounting-events.md](../events/gf-accounting-events.md) _(Insurance Settlement DESIGN + AP PROPOSED events; PRC NO events per ADR-028 §Alt-3)_
- Data model: [gf-accounting-data-model.md](../data/gf-accounting-data-model.md) §6 (`accounting_period` entity) + **§7 `price_calc_run` + `price_calc_run_item` (W06)**
- ADR: ADR-014 (insurance ownership), ADR-015 (debt-summary), ADR-016 (dossier PDF+S3), **ADR-019 (Accounting Period on gf-accounting)**, **ADR-027 v3 (PWA engine + convergent iteration + Temporal activity taxonomy §1.x)**, **ADR-028 v2 (PRC async execution — sync HTTP 202 + Temporal workflow, Q2 v3 reversal 2026-07-23)**
- BR: BR-EP-INSURANCE-SETTLEMENT; BR-GF-ACCOUNTING-006/013; **BR-GF-INVENTORY-ACCOUNTING-PERIOD (BR-AP-001..016 + BR-PRC-001..018 + BR-AP-CMN-001/002 + CB-AP-001 v25)** — frontmatter `boundary: gf-accounting` post-fix per Q1=A 2026-07-22
- Product: EP-INVENTORY-ACCOUNTING-PERIOD v21 + 5 FEAT-AP-* + **5 FEAT-PRC-* (v11-v29)** + UX-FLOW-INVENTORY-ACCOUNTING-PERIOD v19
- Integration: [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md) §6 (lock-check consumer pattern) + **[INTEG-EXT-gf-accounting-gf-inventory.md](../integrations/INTEG-EXT-gf-accounting-gf-inventory.md) (W06 PRC cross-boundary — read stock-ledger + slips + write bulk-fill-cost + bulk-recompute)**
- BFF: [agg-garage-graph-graphql.md §3e](agg-garage-graph-graphql.md) (AP) + **§3f PRC module (W06 new)**
- ERROR-CODE-REGISTRY: `ERR-INV-021..026` (AP baseline); `ERR-INV-024` (kỳ CLOSED — reused cross-boundary), `ERR-INV-029` (run-in-progress — reused BR-PRC-016), `ERR-INV-030` (tồn âm — invariant BR-PRC-007), `ERR-INV-031` (lệch hạch toán — [MỞ RỘNG TƯƠNG LAI]), `ERR-INV-052` (job gián đoạn — BR-PRC-014). Tree-cap = plain HTTP 413 no code.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-10 | v28 | **Round 2 fix (mandate Q7 + Q8)** — §6.5: gỡ 2 row `revokedReason` + `correlation.syncEventId` và thu hẹp enum `DocumentMessageStep` (boundary này **không** phát `SETTLEMENT.REVOKED` — `FEAT-STL-DETAIL` EC-7 đã bị Business Authority gỡ 2026-08-03); thêm row `isDriverPlusSource` + ghi nguồn `bookingCode` = snapshot `for-settlement` (`gf-sales-api.md` §3bis.2 v13) đóng P0 boundary isolation. v27 → v28. |
| 2026-08-10 | v27 | **§6.5 MỚI — Naming Registry cho đồng bộ chứng từ Driver+ (ADR-031)**: field payload 2 step `DOCUMENT.SETTLEMENT.*` + 3 enum (`DocumentType`, `SettlementType` tái dùng, `DocumentMessageStep`), dùng chung tên canonical với `gf-sales-api.md` §5.2bis. **KHÔNG thêm endpoint REST** — §2 Endpoint Summary + §3/§3bis/§4/§5 không đổi. v26 → v27. |
| 2026-08-02 | v26 | **CR-20260801-09 (MINOR, APPROVED) — §5.1 sort key drift `created_at DESC` → `executed_at DESC`** (`GAP-W06-GAC-09`). Root cause: giá trị đúng đã chốt từ trước ở SSOT `Architecture/data/gf-accounting-data-model.md:460` (`idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, executed_at DESC)`, ghi rõ "FEAT-PRC-LIST default sort BR-PRC-018") và exec spec `FEAT-PRC-LIST.md:203` + `FEAT-PRC-CREATE.md §5.2` đều đã dùng `executed_at DESC` — nhưng file này (nằm trong reading list bắt buộc của agent DEV) chưa nhận cascade, vẫn ghi `created_at DESC`. `created_at` là thời điểm tạo row, KHÔNG phải sort key nghiệp vụ (thời điểm thực hiện tính giá). Sửa 1 dòng tại §5.1 Semantics. Companion cùng CR: `gf-accounting-HLD.md` v15→v16 (2 chỗ, §12.3) + `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-DETAIL.md` §5.2 (cột index `id` → `executed_at DESC`). **KHÔNG đụng**: BR-PRC-018 gốc trong `Product/**`, data-model (đã đúng), §5.2-§5.6, §6 Naming Registry. v25 → v26. |
| 2026-08-01 | v25 | **§5.2 W06-2 DETAIL — bổ sung error-code tường minh cho case 404 (CR-20260801-02, MINOR self-approved)**. Root cause: bảng "Response 4xx/5xx" của §5.2 chỉ liệt kê HTTP code + mô tả nguyên nhân, KHÔNG nêu error code canonical — trong khi endpoint chị em `GET /api/v2/accounting-periods/{id}` (§4.3, cùng file) đã có sẵn dòng prose `**Not found** → 404 ERR-CMN-not-found`. Khoảng trống này khiến `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-DETAIL.md` (bff-tier) §4.5 phải suy luận code theo convention platform và tự gắn cờ "NEED CONFIRMATION (budget 1/5)"; warm-up W06 Phase B `agg-garage-graph` raise `GAP-W06-AGG-06` vì không có defer chính thức nào trong FEAT §11 hay PKG-W06 §2.3. Fix: thêm đúng 1 dòng prose sau bảng 4xx/5xx §5.2, mirror verbatim style §4.3 — `**Not found** → 404 ERR-CMN-not-found` + tenant mismatch KHÔNG leak existence cross-tenant + soft-deleted log trả cùng error code (KHÔNG phân biệt "chưa từng tồn tại" vs "đã xóa", nhất quán §5.1 LIST soft-delete exclusion v23). **KHÔNG đụng**: bảng 4xx/5xx (giữ nguyên 5 row), Response 2xx shape, field description table, Semantics block, §5.1/§5.3/§5.4/§5.5/§5.6, §4.x AP endpoints, §6 Naming Registry, §7 References. Documentation clarification thuần — additive, non-breaking, KHÔNG đổi API shape/behavior/error code đang có. v24 → v25. |
| 2026-07-24 | v24 | **Mechanical rename `BQGQ` → `PWA`** (thống nhất pricing-method code với convention đã ratify tại `gf-inventory-data-model.md` v14 R13, 2026-06-24, Delivery Authority feedback). Đổi mọi technical enum/code occurrence (`pricingMethod` value, compound identifiers, prose shorthand, heading text) — KHÔNG đổi business meaning/behavior/error codes khác, KHÔNG đổi mô tả tiếng Việt "Bình quân cuối kỳ", KHÔNG rename file `ADR-027-bqgq-engine-and-convergent-iteration.md` (giữ nguyên làm historical identifier — chỉ đổi title/body bên trong). |
| 2026-07-24 | v23 | **Soft-delete filter fix ("Điểm 5" QC finding)** — §5.1 W06-1 `POST /price-calc-runs/search` (LIST) Semantics: add mandatory `AND deleted_at IS NULL` WHERE-clause bullet — data model đã có `deleted_at`/`deleted_by` (data-model §7) và §5.5 DELETE đã set `deleted_at = now()`, nhưng LIST spec quên loại trừ soft-deleted rows → kế toán xóa xong reload vẫn thấy log, tưởng xóa thất bại. §5.2 W06-2 GET detail-by-id: cùng root cause — 404 condition mở rộng thêm "HOẶC log đã bị xóa" + Semantics bullet tương ứng (nhất quán, tránh truy cập log đã xóa qua direct link/id). **KHÔNG đụng**: response envelope/field shape/error codes khác, §5.3/§5.4/§5.5/§5.6, §6 Naming Registry, §1-§4 baseline — mechanical addition only. v22 → v23. |
| 2026-07-23 | v22 | **Round 7 R6-F6 mechanical purge — §7 References label stale "(BG thread)"**. Per `Tracking/arch-design-W06-answers-7.md`. §7 References ADR list: label `ADR-028 (PRC async execution — sync HTTP 202 + BG thread)` → `ADR-028 v2 (PRC async execution — sync HTTP 202 + Temporal workflow, Q2 v3 reversal 2026-07-23)`; also bump companion label `ADR-027` → `ADR-027 v3 (PWA engine + convergent iteration + Temporal activity taxonomy §1.x)` for cascade consistency (post-Round-6 semantics). Cosmetic label fix only — body §5.3/§5.4 Temporal-accurate per v21 Round 6 (Semantics blocks describe `WorkflowClient.start()` + workflow ID + task queue + 503 = Temporal Cloud outage; §6.2 Naming Registry has `temporalWorkflowId` row). **KHÔNG đụng**: (a) §1-§4 (Insurance/AP endpoints); (b) §5.1 LIST + §5.2 DETAIL + §5.3 CREATE + §5.4 RECALC + §5.5 DELETE + §5.6 lookup (Round 4/5/6 stable — endpoint body incl. HTTP 202 client contract + `affectedSubsequentPeriods[]` + `aggregates` block untouched); (c) §6.1 AP registry + §6.2 PriceCalcRun registry (`temporalWorkflowId` row from v21 kept intact per Round 7 mandate G11 verify) + §6.3 PriceCalcRunItem + §6.4 cross-boundary. Pair với ADR-027 v4 + ADR-028 v3 + gf-accounting-HLD v14 + gf-accounting-data-model v13 + TECHSTACK v3. v21 → v22. |
| 2026-07-23 | v21 | **Q2 v3 reversal cascade — §5.3 CREATE + §5.4 RECALC + §6.2 Naming Registry Temporal workflow note**. Per ADR-027 v3 + ADR-028 v2 (Temporal workflow thay background thread cho PRC async execution). §5.3 Semantics: "State-changing endpoint" description flip `PriceCalcExecutorService.submit()` → `WorkflowClient.start(PriceCalcRunWorkflow::execute, input)` + `WorkflowOptions.setTaskQueue("PRC_TASK_QUEUE").setWorkflowIdReusePolicy(REJECT_DUPLICATE).setWorkflowExecutionTimeout(Duration.ofMinutes(60))` + workflowId `prc-{tenantId}-{runId}` (Critical Rule #14 deterministic format) + UPDATE audit column `temporal_workflow_id`; Guards Phase 0 add Layer 2 `WorkflowIdReusePolicy.REJECT_DUPLICATE` defense-in-depth; 503 error meaning flip "Thread pool exhausted" → "Temporal Cloud outage — compensating DELETE + client retry". §5.4 same cascade (workflowId new per RECALC — không reuse source workflow); 503 flip; Concurrent guard layers 1/2/3 spelled out. §6.2 header `ADR-027 + ADR-028` → `ADR-027 v3 + ADR-028 v2`; add new row `temporalWorkflowId` (BE only, audit-only, BFF/FE/Mobile không expose — internal Temporal identifier). ADR-028 §1 citation bump v1 → v2 in `X-Idempotency-Key` row. **KHÔNG đụng**: (a) §1-§4 (Insurance / AP endpoints); (b) §5.1 LIST + §5.2 DETAIL + §5.5 DELETE + §5.6 lookup (F-15 aggregates block Round 5 stable); (c) §5.3/§5.4 request body + response 202 body shape (client contract HTTP 202 + polling 5s unchanged — implementation note only); (d) §5.3/§5.4 `affectedSubsequentPeriods[]` Round 4 F-05 stable; (e) §6.1 AP registry + §6.3 PriceCalcRunItem + §6.4 cross-boundary cost line writes; (f) §7 References. Pair với ADR-027 v3 + ADR-028 v2 + gf-accounting-HLD v13 + gf-accounting-data-model §2quater.1 v-bump + CLAUDE.md v16 (Common Gotcha #7 cascade 5 → 6 services) + Tracking/arch-design-W06-answers-6.md Q2 v3 audit. v20 → v21. |
| 2026-07-23 | v20 | **W06 Round 5 BFF-vs-FE completeness fix — F-15 primary (aggregates block for FEAT-PRC-DETAIL AC-3 "dòng Tổng")**. Round 5 mandate `Tracking/arch-design-W06-answers-5.md` — 1 P1 + 3 P2 total; F-15 = REST primary here (BE canonical for aggregate shape), F-13/F-14/F-16 in other 3 files (agg-garage-graph-graphql v7.76 F-13/F-15 cascade + INTEG-FE v21 F-14 + gf-inventory-api v66 F-16). All Round 4 F-01..F-12 CLOSED prior; Round 5 does NOT re-open Round 1-4 decisions. (**F-15 P2 — Missing `aggregates` block for FEAT-PRC-DETAIL AC-3 "dòng Tổng"**) FEAT-PRC-DETAIL v23 AC-3 requires Tổng summary row across items (Σ openingQty/Value + receiptQty/Value + deliveryQty/Value + updatedDeliverySlipCount) across the **full filtered scope**. Currently `priceCalcRunGet` only returns paginated `items[]` — FE must compute totals client-side. For scope SPECIFIC (≤500 items in one payload) this works, but when server-side `itemStatus`/`keyword` filter applies, FE-computed totals only sum the visible current-page subset → wrong Tổng. Q1/Q2/Q3 (Stock V2 reports) already have BE-computed `aggregates` block per pattern; DETAIL diverges. Fix §5.2 (REST source-of-truth): (1) Response 2xx JSON sample append 8-field `aggregates: {openingQtyTotal, openingValueTotal, receiptQtyTotal, receiptValueTotal, deliveryQtyTotal, deliveryValueTotal, updatedDeliverySlipCountTotal, itemsCount}` with realistic totals mirroring 2 items[] sample rows (openingQtyTotal=100 from first row + itemsCount=42 illustrating filtered scope > paginated items[] size); (2) Field description table extend 8 rows explaining semantics — BE computes across full filtered scope (post server-side filter, pre-pagination); explicit note `deliveryValueTotal` uses `SUM(delivery_value) FILTER (WHERE delivery_value IS NOT NULL)` to skip ERROR items (null → excluded → avoid corrupt total per BR-PRC-013); `itemsCount` distinct from `run.itemsResolvedCount` (post-filter vs post-Phase-1 resolve); (3) Semantics block extend explicit **`aggregates` always non-null bất kể `includeItems` flag** decision — rationale: payload nhỏ ~8 numbers, FE cần render Tổng đồng thời với progress bar, tránh double-fetch inefficient khi poll với `includeItems: false`; SQL pattern single-pass reuse existing `idx_prc_item_run` index (no new index); (4) §6.3 Naming Registry extend 9 rows — 1 block header (`PriceCalcRunItemsAggregates` type — response envelope field, `PriceCalcRunDetail.aggregates: PriceCalcRunItemsAggregates!` non-null) + 8 field rows BE↔BFF↔FE (Mobile marked `—` since PRC web-only per §3f.4); rows placed after `PriceCalcRunItem` fields, before UI label mapping VN footer; cite `§5.2 aggregates block` + BR-PRC-002/BR-PRC-001 v20/BR-PRC-013 as appropriate. Cross-artifact consistency: field names + types match verbatim BFF SDL `agg-garage-graph-graphql.md v7.76 §3f.1 type PriceCalcRunItemsAggregates` (openingQtyTotal Decimal! ↔ BE BigDecimal, itemsCount Int! ↔ BE Integer). BFF resolver = verbatim passthrough per §3f.3 discipline v7.76 (BFF không SUM lại from paginated `items[]` — sai vì only current page). **KHÔNG đụng**: (a) §1-§4 (Insurance endpoints, AP endpoints); (b) §5.1 LIST — Round 4 F-01 status enum + F-08 warehouseId clarify stable; (c) §5.3 CREATE — Round 4 F-05 `affectedSubsequentPeriods[]` stable (F-13 Round 5 is BFF-side sync only, REST unchanged); (d) §5.4 RECALC — Round 4 F-05/F-11 stable; (e) §5.5 DELETE + §5.6 lookup; (f) §6.1 AP registry + §6.2 PriceCalcRun registry + §6.4 cross-boundary cost line writes; (g) §7 References + non-W06 Change Log rows. Pair với `agg-garage-graph-graphql v7.76` (F-15 cascade `PriceCalcRunItemsAggregates` SDL + DETAIL sample + §3f.3 resolver note + F-13 `AffectedSubsequentPeriod` SDL + F-16 §3j.3 identifier note) + `gf-inventory-api v66` (F-16 wire format `warehouseIds` multi-value alignment) + `INTEG-FE v21` (F-14 modal foundational lookup citations). v19 → v20. |
| 2026-07-23 | v19 | **W06 Round 4 Product-coverage audit fix — F-01 + F-05 + F-08 + F-11 cascade**. 4 findings fixed here (7 total in round; other 8 fix in other files). (F-01 P1 — PriceCalcRunStatus enum drift) §5.1 LIST response `content[].status` enum widen 3→4 values `PENDING | RUNNING | SUCCEEDED | COMPLETED_WITH_ERRORS` (match §5.3 CREATE 202 canonical + §6.2 + BFF SDL); §5.1 response sample add 2nd row với `status: "PENDING"` example. §6.2 Naming Registry: add explicit UI-mapping row `PENDING + RUNNING → "Đang tính"` (F-01 D2 per user AskUserQuestion 2026-07-23 — user chose "expose PENDING with explicit UI mapping" over "hide PENDING"). BR-PRC-014 v17 "3 giá trị hiển thị" clarification: UI-visible state count remains 3; `PENDING` is BE transient sub-state of "Đang tính" (row INSERTed nhưng executor chưa pick per ADR-028 §2), KHÔNG là 4th UI-visible state. §6.3 footer UI-mapping ambiguous fragment cleaned up (item.status vs run.status disambiguation). (F-05 P1 — BR-PRC-015 "kỳ sau cần tính lại" warning missing) §5.3 CREATE 202 response add `affectedSubsequentPeriods[{periodId, periodName, lastRunId, lastRunStatus}]` field + field description table; §5.3 Semantics block extend với post-commit detection step description (query pattern reuse `idx_prc_run_tenant_garage_wh` + `idx_ap_tenant_dates` — no new index needed). §5.4 RECALC 202 response symmetric add same field + Semantics extend. (F-08 P2 — LIST filter count mismatch với FEAT AC-4) §5.1 `warehouseId` param description extend: giữ API param optional (backward compat + S2S consumer) nhưng clarify FE Web KHÔNG render "Kho" như UI filter control per FEAT-PRC-LIST AC-4 (Product spec 2 filter: Phương pháp + Ngày thực hiện). Kho là tenant-context-derived. (F-11 P2 — RECALC new-row vs carry-over semantics) §5.4 Semantics block rewrite: add explicit "Copy-forward Phase 0 step" description per ADR-027 v2 §4 (RECALC always creates NEW row; before Phase 1/2/3, bulk INSERT price_calc_run_item cloned from source: ALL scope clones all + marks RUNNING; ERROR_ONLY clones DONE with values intact + marks ERROR RUNNING — satisfies BR-PRC-008 "mã Đã tính giữ nguyên KHÔNG recompute"). Cross-ref ADR-027 v2 §4. **KHÔNG đụng**: §1-§4 (Insurance/AP endpoints) + §5.2 DETAIL + §5.5 DELETE + §5.6 lookup + §6.1 AP registry + §6.3 PriceCalcRunItem + §6.4 cross-boundary + §7 References. Pair với ADR-027 v2 + gf-accounting-HLD v12 + gf-inventory-api v65 + agg-garage-graph-graphql v7.75 + garage-web-HLD v14 + INTEG-FE v20 + gf-inventory-HLD v30. Round 4 mandate `Tracking/arch-design-W06-answers-4.md` + D1/D2 user ratified. v18 → v19. |
| 2026-07-22 | v18 | **+§5 PRC Endpoints + §6 Naming Registry (W06 arch-design — ADR-027 + ADR-028, Q1/Q2/Q3=A ratify 2026-07-22)**: (1) §2 Endpoint Summary rows 24-29 mới (6 endpoints: W06-1 search / W06-2 detail-polling / W06-3 CREATE HTTP 202 kick-off / W06-4 RECALC / W06-5 DELETE / W06-6 lookup items-for-cogs). (2) §5 mới — PRC subsystem 6 endpoint detail sub-section với đủ 6 khối (Headers · Path/Query params · Request body · Response 2xx · Response 4xx/5xx · Semantics) per Phase 5 v5 COMPLETENESS requirement. (3) §6 mới — Naming Registry cross-tier BE↔BFF↔FE↔Mobile (§6.1 AP W04 baseline; §6.2 PriceCalcRun W06; §6.3 PriceCalcRunItem W06 — bao gồm canonical resolution "Đơn giá bình quân" (BR internal) vs "Giá bình quân" (UI microcopy per FEAT-PRC-DETAIL v17) = BE field `averageUnitPrice`; §6.4 cost line writes cross-boundary tham chiếu gf-inventory canonical). (4) §7 References (renumber từ old §5) +ADR-027 + ADR-028 + INTEG-EXT-gf-accounting-gf-inventory + BFF §3f PRC module. `depends_on` +3 files. HTTP 202 semantic cho kick-off (ADR-028 §1); polling GET §5.2 với `includeItems` + `itemStatus` filter (AC-2c polling 5s); RECALC creates NEW run row với `source_run_id` audit trail (BR-PRC-010). Error codes reuse `ERR-INV-024/029/030/031/052` — no new codes needed. Feature flag `Inventory:InventoryV2` gate class-level trên `PriceCalcRunController`. v17 → v18. |
| 2026-07-10 | v17 | **§4.2 tree endpoint — impl-alignment fix (behavior no change ở doc, code aligned về spec)**. Root cause: JPA `findForTree` (nay đã xoá) chỉ `LIKE '%:name%'` một-row-cùng-lúc, không expand ancestor/descendant, không unaccent, không prefix — trái §4.2 "Search semantics" bullets. User quannn 2026-07-10 báo query `{year:2026, name:"quý 2"}` trả về đúng Q2 với `children:[]`, mất Năm 2026 (ancestor) + Tháng 4/5/6 (descendant). Fix: `AccountingPeriodQueryService.tree()` fetch full year subtree qua `findByTenantIdAndYear` → in-memory expand matched + ancestor chain + descendant BFS + Java-side `Normalizer.NFD` unaccent + prefix `startsWith`. Xoá JPA `findForTree`; `AccountingPeriodRepository.findByYearForTree` bỏ arg `nameFilter`. Add §4.2 "Impl note" explain application-side unaccent per V1 migration decision (extension không require). Cascade DTO: `AccountingPeriodTreeNode` add `code` field (spec §4.2 response example đã có; DTO thiếu — response trả `"code": null`); `toTreeNode()` set `.code(p.getCode())`. Test: 4 new AC-5 case (matched+ancestor+descendant, unaccent, leaf prefix keeps ancestors, no-match empty); xoá 1 test `tree_orphanChild_promotedToRoot` premise sai với flow mới. Build + 46 test AP green. **KHÔNG đổi**: envelope response (`nodes[] + availableYears[]` giữ nguyên — drift với API doc `periods[] + summary.total` là pre-existing scope riêng, không đụng lần này); BFF resolver; migration SQL. v16 → v17. |
| 2026-07-09 | v16 | **§4.1 POST `/api/v2/accounting-periods/search` — bỏ auto-default `year=currentYear`** khi request.year null. Root cause: spec v11 default xung đột với picker use case §6.1 (FEAT-AP-LIST) — filter `type=YEAR AND year=currentYear` luôn = 1 row do BR-AP-008 sibling non-overlap → picker không enumerate được cross-year (user báo `types=["YEAR"]` chỉ trả 1 row khi DB có 2 năm). Fix: `year=null` semantic đổi từ "default currentYear" → "no filter, trả mọi năm". FE main list view phải explicit truyền `year: currentYear` nếu cần default cũ. Cascade: DTO `AccountingPeriodSearchRequest` javadoc + `AccountingPeriodQueryService.search()` xoá `LocalDate.now().getYear()` fallback. Tree endpoint `/api/v2/accounting-periods/tree` KHÔNG đụng (year vẫn `@NotNull` per §4.2). v15 → v16. |
| 2026-05-07 | v1 | Initial API spec cho `gf-accounting`: REST/JSON authenticated qua security context (public `/api/v1`, không có protected prefix), tập trung vào settlement lifecycle (create từ service order, get/update/cancel theo code, search), settlement printing (export PDF/image, print preview HTML) và đồng bộ trạng thái quyết toán với `gf-sales`. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
| 2026-05-30 | v2 | **Insurance Settlement endpoints (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014/015/016)**: thêm §3bis — 8 endpoint mới (insurance-dossiers CRUD + versions + export + download, insurance-payments, protected debt-summary S2S) + additive request/response cho create/get settlement hiện hữu (insuranceAdjustments, breakdownByPayer, debtPanel). Thêm protected prefix `/protected/v1`. Validation VLD-INS-STL/DOSSIER. Update §1, §2 summary, §5 references. Amount nhận từ request (BR-GF-ACCOUNTING-006). |
| 2026-05-31 | v3 | **Resolve Open Questions (Delivery Lead)**: overpayment = cho phép + `OVERPAID` (không chặn); debt-summary cache TTL = 5′; tuổi nợ từ ngày tạo phiếu; threshold cảnh báo 30 ngày. |
| 2026-05-31 | v4 | **ADR renumber 4→3** (gộp ADR-015 workflow vào ADR-014): cập nhật tham chiếu — debt-summary = ADR-015, dossier PDF/S3 = ADR-016 (depends_on + §5 references). |
| 2026-06-01 | v5 | **Đổi request field `insuranceCompanyId` (id) → `insuranceCode` (code, `mdm_catalog.code`, `directory='INSURANCE'`)** trên create settlement INSURANCE (§3bis + §1 reuse note) — khớp convention baseline code-based (ADR-014 v4). |
| 2026-06-02 | v6 | **Bỏ `insuranceCode`** khỏi create request (§3bis.0) + reuse note (§2): `insurance_company` baseline đã lưu mã CTBH. gf-accounting lấy thông tin CTBH qua `for-settlement`. ADR-014 v5. |
| 2026-06-03 | v7 | **Flatten JSONB → scalar fields + xoá events**: §3bis.0 thay `insuranceAdjustments`/`breakdownByPayer` nested → 16 flat scalar fields; §2 reuse note cập nhật. §3bis.4 xoá `insurance-dossier-exported` event publish. §3bis.7 xoá `insurance-payment-recorded` event publish → TTL cache (ADR-015). |
| 2026-06-04 | v8 | **Đóng spec-gap validate (root-cause W01)**: §3bis.0 thêm **VLD-INS-SO-006** (mode ∈ {PERCENT,AMOUNT} → `400 INVALID_ALLOCATION_MODE`) + ràng buộc `≥0` cho amount/breakdown; note single-payer (breakdown nhóm rỗng = 0 hợp lệ, persist nguyên — CALC-INS-006). Đồng bộ BR-EP v19, gf-sales-api v8, PKG-W01 v11. |
| 2026-06-09 | v9 | **+§3bis.9 Error codes Insurance (`INS_*` canonical — CR-1780980611)**: luồng Phiếu QT BH emit registry code trực tiếp (INS-2002/2003/2004/2005/2006 + INS-1008), thay `GMS.gf-accounting.SETTLEMENT_*` cho đường insurance. **VLD-INS-SO-006: 500 Jackson → 422 `INS_ADJ_MODE_INVALID`** (handler enum). "no-insurance-item" (VLD-INS-STL-001) giữ mã internal (flag #2). Thêm Forbidden Pattern. Nguồn BR-EP §5.5 v21. FIX: agent-fix-gf-accounting. |
| 2026-06-24 | v11 | **+§4 Accounting Period endpoints (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)**: 7 endpoint mới (rows 17-23 trong §2): POST/search + GET/tree (cap 500 → 413) + GET/{id} + POST (single + `autoGenerateChildren=true` atomic) + PUT (mutable fields per BR-AP-016) + DELETE (3-guard) + GET /protected/v1/lock-check (S2S advisory). Prefix `/api/v2/accounting-periods/*` mới coexist với baseline `/api/v1/*`. §1 thêm v2 prefix + protected note. §2 reuse note cho AP. §4.8 error codes: giữ ERR-INV-021..026 verbatim (D2 — cosmetic mismatch namespace; tolerated per ADR-019); ERR-INV-027 (tree cap reuse); placeholder ERR-INV-032 (immutable field — OQ5). §5 References +ADR-019, AP product files (BR/UX/EP/5 FEAT), Tracking, BFF §3e. `depends_on` +ADR-019. v10 → v11. |
| 2026-07-08 | v15 | **W04 add — `year` field vào §4.4 POST /api/v2/accounting-periods** per user quannn 2026-07-08 "createAccountingPeriod, phần tạo kỳ kế toán đang thiếu trường năm do FE chuyền lên" + "cần update cả gf-accounting-api.md, gf-accounting-data-model.md liên quan đến year khi createAccountingPeriod". Root cause: FEAT-AP-CREATE AC-4 form field "Năm" bắt buộc cho type=YEAR nhưng backend request body + BFF SDL đều thiếu → drift. AskUserQuestion resolved 2026-07-08 Option C — add column `year` INT **NOT NULL** cho MỌI row trong `accounting_period` (per `gf-accounting-data-model.md §2ter.1 v10`). Cascade 4 sub-edits §4.4: (1) Request body sample thêm `"year": 2027` sau `"parentId"`; (2) Request field table add row `year integer YES` với description cite user quannn + FEAT-AP-CREATE AC-4 + column ref v10 + CHECK constraint + auto-generate propagate note; extend `startDate/endDate` row description thêm cross-check `EXTRACT(YEAR FROM startDate) == year`; extend `autoGenerateChildren` row description thêm "children inherit year từ YEAR parent"; (3) Response 201 sample `createdPeriod` thêm `"year": 2027`; (4) Validation errors table add 2 row: `year mismatch với startDate` (CHECK constraint violation) + `type=QUARTER/MONTH + year mismatch với parent.year` — 2 case dùng `ERR-CMN-validation` hoặc propose new `ERR-AP-002` pending BA register OQ8. **KHÔNG đụng**: §4.5 PUT (year immutable per BR-AP-016); §4.2 tree search (đã có year filter khác semantics); §4.3 detail GET (response shape follow-up nếu cần expose year field — hiện chưa scope); §4.6 delete; §4.7 lock-check. Cascade pair với `agg-garage-graph-graphql.md v7.55` SDL add `year: Int!` field + `gf-accounting-data-model.md §2ter.1 v10` column add. Design decision (user Option C): year persisted NOT NULL — YEAR row từ user input, QUARTER/MONTH derive parent.year recursive up chain; CHECK constraint enforce consistency với start_date. Backend implement: parse `year` từ request → validate cross-check với startDate/endDate (CHECK constraint layer) → persist column. Auto-generate children inherit year từ YEAR parent (không cần user provide riêng cho QUARTER/MONTH auto-generated). v14 → v15. |
| 2026-06-24 | v14 | **R4 tree endpoint GET→POST + name search (per Delivery Authority feedback 2026-06-24)**: §2 endpoint summary row 18 method `GET` → `POST`. §4.2 full rewrite — POST body `{year, name}` thay query string. `name` LIKE unaccent search trên cột `accounting_period.name` (single column, match bất kỳ type Năm/Quý/Tháng); leverage existing index `idx_ap_tenant_name`. Search semantics: matching node + ancestor path + descendant subtree preserved; empty name → behavior cũ (full tree by year). Size cap 500 unchanged. Rationale: FEAT-AP-LIST AC combine year filter + name LIKE search trong cùng cây UX; POST body cleaner cho Vietnamese characters + composite filter. v13 → v14. |
| 2026-06-24 | v13 | **R3 audit-col strip — `accounting_period` (per Delivery Authority feedback 2026-06-24)**: §4.1 search response sample (line 600 block) remove 4 fields `closedAt/By/reopenedAt/By: null`. §4.3 detail response sample (line 693 block) remove same 4 fields. §4.5 PUT update — status field description thay "Transition set closed_at/by..." → "tracked via standard updated_at/by audit pair". §4.5 sample response (line 813 block) remove `closedAt/By`. Rationale: close/reopen = status update = standard audit pair tracks; events derive timestamp từ envelope `occurredAt` + actor từ headers. v12 → v13. |
| 2026-06-24 | v12 | **R2 surgical fix F1 + F2 (Round 2 arch-review)**: §4.2 tree-cap — strip backend `ERR-INV-027` emit (zombie revival of deprecated registry:125 "Tính giá xuất kho thất bại" HTTP 500 BR-PRC-007 — vi phạm registry contract + HTTP shift); thay bằng plain `HTTP 413` no code; BFF translates qua `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (BFF-only single point cho user-facing tree-cap error). §4.5 + §4.8 immutable-field — replace `ERR-INV-032` (collide với registry:130 "Số lượng tồn phải > 0" BR-OB-008 FEAT-OB-IMPORT) → **NEW namespace `ERR-AP-001`** (Accounting Period dedicated, pending BA register — OQ7 new). §5 References cập nhật. v11 → v12. |
| 2026-06-10 | v10 | **§3bis.9 HTTP status `422 → 400` cho 3 mã FE-facing + add 2 dossier rows** (CR-1781085632): INS-2002/2004/1008 đổi 422→400; thêm INS-3003/3004 (dossier export VALIDATION) với HTTP 400. Registry codes giữ. §3bis.0 Validation note cập nhật INS-1008 status. Internal SETTLEMENT_CREATE.06 giữ 422 (out-of-scope). Lý do: FE/Mobile error boundary treat 422 như crash → đổi 400. Partial-supersedes CR-1780980611. Đồng bộ BR-EP §5.5 v22, INTEG-BFF-GF-ACCOUNTING-INSURANCE §6 v5, agent-test-api. FIX: agent-fix-gf-accounting (BE emit status 400). |
| 2026-06-15 | v11 | **Rewrite dossier endpoints theo ADR-016 v5 — BFF orchestrate + ct-file-storage persist**. (Superseded by v12.) |
| 2026-06-15 | v13 | **Tách endpoint granular theo ADR-016 v7 (BFF orchestrator)**: §2 Endpoint Summary dossier 2 → **4 row** (#9 render ③ + #10 render ④ + #11 persist batch + #12 list). §3bis dossier rewrite: §3bis.1 NEW `POST /insurance-dossier-documents/acceptance-record/render-pdf` (render ③ trả byte[], reuse `AcceptanceRecordPrintStrategy` + template `acceptance-record.html`); §3bis.2 NEW `POST /insurance-dossier-documents/payment-authorization/render-pdf` (render ④ trả byte[], reuse `PaymentAuthorizationPrintStrategy` + template `payment-authorization.html`); §3bis.3 NEW `POST /insurance-dossier-documents/batch` (persist atomic transaction: INSERT dossier vN+1 + N row docs immutable + UPDATE vN cũ REPLACED); §3bis.4 keep list versions. BỎ §3bis batch monolithic `/export`. **Boundary isolation**: gf-accounting KHÔNG còn gọi gf-sales, KHÔNG chạm ct-file-storage — chỉ render ③④ + persist + list; BFF orchestrate parallel call (xem agg-garage-graph-graphql §3c resolver behavior). |
| 2026-06-15 | v12 | **Simplify dossier endpoints theo ADR-016 v6 — 1 batch endpoint duy nhất**: §2 Endpoint Summary còn **2 row** dossier (#9 batch export + #10 list versions). §3bis.1 NEW `POST /api/v1/insurance-dossiers/{settlementCode}/export` — batch 1-shot: nhận `{documentTypes[], acceptanceFormData?, authorizationFormData?}` → INSERT dossier vN+1 + N row docs + parallel render (① cross gf-sales, ② local SETTLEMENT, ③④ NEW Thymeleaf qua extend `DocumentPrintType` enum) + push ct-file-storage + finalize EXPORTED + mark vN cũ REPLACED, atomic transaction → trả `{versionNo, exports:[{documentType, fileUrl, fileName}]}`. §3bis.2 keep list versions với pdfUrl direct + formData snapshot per doc. §3bis.3-6 (form / scan / dispatcher / download) REMOVED — FE-only modal giữ state local, KHÔNG endpoint riêng. Errors: INS_DOSSIER_NO_DOC_SELECTED/400, INS_DOSSIER_FORM_INCOMPLETE/400, INS_DOSSIER_QUOTATION_REMOTE_FAIL/502, INS_DOSSIER_STORAGE_UPLOAD_FAIL/502. Atomicity: 1 doc fail → rollback batch. |
| 2026-06-16 | v15 | **Add §3bis.5 Template Binding Map (DEV contract)**: codify template Thymeleaf bind 100% `${formData.X}` (no context resolve); `*PrintContext` Java class minimal wrap formData; field binding contract liệt kê 13 paths (③) + 22 paths (④) match §3bis.1-2. Reference template files `Product/ux/assets/{bien-ban-nghiem-thu,giay-uy-quyen}.html` đã rewrite cùng ngày (drop drift sections + drop customerType branching + rewrite all bindings). Cross-ref ADR-016 v10 (Print Context architecture). |
| 2026-06-17 | v16 | **§3bis.4 list endpoint: `GET /{settlementCode}` → `POST /search` + pagination Spring Pageable** per user feedback. Request body `{settlementCode, page=0, size=10}` (max size=50, theo convention `POST /settlements/search`); response wrapper `{content[], page, size, totalElements, totalPages}` thay flat `versions[]`. §2 Endpoint Summary row #12 cập nhật method/path. Note rõ `pdfUrl` = relative path / ct-file-storage object key (no scheme/domain) — FE compose download URL từ env domain config + dùng cơ chế download hiện tại; **KHÔNG có endpoint `/download` riêng**, **KHÔNG signed URL TTL** (đơn giản hoá; trước đây ADR-016 v10 mandate signed URL 300s qua BFF query `getInsuranceDossierDownloadUrl` — supersede tại ADR-016 v11). Cross-ref agg-garage-graph-graphql (update `getInsuranceDossierVersions` paginated input + bỏ `getInsuranceDossierDownloadUrl` query) + ADR-016 v11 + PKG-W02 v13. |
| 2026-06-19 | v17 | **§3bis.2 split CMND/CCCD ra khỏi GCN bảo hiểm — semantic alignment template `giay-uy-quyen.html`**: `customer` object 8 → **9 fields** (22 → 23 atomic total). REMOVE `insuranceCertIssueDate` + `insuranceCertIssuer` (vốn được dùng nhầm cho "Ngày cấp"/"Nơi cấp" CCCD trong template). ADD `nationalId` (I.5 Số CMND/CCCD) + `nationalIdIssueDate` (I.6 Ngày cấp CCCD) + `nationalIdIssuer` (I.7 Nơi cấp CCCD). KEEP `insuranceCertNo` (I.8 GCN bảo hiểm — chỉ số GCN, không kèm issue date/issuer trong design mới). Template `giay-uy-quyen.html` rebind đúng semantic (Ngày cấp / Nơi cấp dưới CCCD, không dưới GCN bảo hiểm). DTO `PaymentAuthorizationRenderRequest.Customer` cập nhật cùng commit. Cross-ref FE `frontend/gf-gms-web/src/features/insurance-dossier/interfaces/index.ts` (`AuthorizationBenUyQuyen.soCmnd/ngayCap/noiCap` ↔ BE 3 field mới). BFF chưa wire endpoint này (per CHARTER §3 — wait ADR-014 ACTIVE). Mobile chỉ display PDF, không có form input — không impact. |
| 2026-06-16 | v14 | **EXPAND formData strict Figma + DROP DB persistence per BA clarification 2026-06-16**: §3bis.1 + §3bis.2 rewrite formData schema match strict Figma State 4/5 (template-driven; 4 layer alignment BE Thymeleaf ↔ FE form ↔ BFF Input ↔ REST body). §3bis.1 acceptance-record: 9 → **13 fields** (`licensePlate`, `billDate`, `quoteReference{code,date}`, `customer{name,address}`, `garage{name,delegate,delegateTitle,address,taxId,bankAccount,bankName}`, `clauses[]`); BỎ thừa `placeIssued`/`insuranceCompany`/`additionalNotes` (Figma không render). §3bis.2 payment-authorization: 4 → **22 fields** nested 4 sections (`placeIssued+dateIssued`, `customer` 8 fields, `garage` 5 fields, `vehicle` 2 fields, `accidentDate`, `compensation` 3 fields, `commitmentClauses[]`); naming generic `claimant/authorized` → semantic `customer/garage`. §3bis.3 batch persist body: REMOVE `formData` per document (chỉ giữ `fileUrl/fileName/documentType/isSelected`). §3bis.4 list endpoint: REMOVE form_data snapshot trong response (BA chốt: form chỉ là transient render input, KHÔNG persist DB). Validation `INS_DOSSIER_FORM_INCOMPLETE` mở rộng required field set per form. Cross-ref data-model v8 (drop form_data column) + agg-garage-graph v7.6 (expand input types match Figma) + ADR-016 v7 (copyFromVersion clone PDF URL only). |
