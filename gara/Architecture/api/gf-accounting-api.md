 ---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 15
tier: T1
owner_authority: Architecture Authority
boundary: gf-accounting
last_reviewed: "2026-07-08"
depends_on:
  - "../hld/gf-accounting-HLD.md"
  - "../data/gf-accounting-data-model.md"
  - "../events/gf-accounting-events.md"
  - "../decisions/ADR-014-insurance-settlement-ownership.md"
  - "../decisions/ADR-015-insurance-debt-summary-strategy.md"
  - "../decisions/ADR-016-insurance-dossier-pdf-s3.md"
  - "../decisions/ADR-019-accounting-period-on-gf-accounting.md"
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
- 409 `INS_DOSSIER_VERSION_CONFLICT` (concurrent insert — rare, retry safe).

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
| `INS_STL_DUPLICATE_DRAFT` | INS-2003 | 409 | SO đã có Phiếu QT BH active. | `GMS.gf-accounting.SETTLEMENT_CREATE.05` (409) | AC-15 · VLD-INS-STL-003 |
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
| `year` | integer | NO (default = current year per AC-6 / BR-AP-015) | Filter periods overlap với năm dương lịch chỉ định. |
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

## 5. References

- HLD: [gf-accounting-HLD.md](../hld/gf-accounting-HLD.md) §9 (Accounting Period extension)
- Events: [gf-accounting-events.md](../events/gf-accounting-events.md) _(Insurance Settlement DESIGN + AP PROPOSED events)_
- Data model: [gf-accounting-data-model.md](../data/gf-accounting-data-model.md) §6 (`accounting_period` entity)
- ADR: ADR-014 (insurance ownership), ADR-015 (debt-summary), ADR-016 (dossier PDF+S3), **ADR-019 (Accounting Period on gf-accounting)**
- BR: BR-EP-INSURANCE-SETTLEMENT (CB-INS-*, VLD-INS-*, BR-INS-DASH-*, BR-INS-DOSSIER-*); BR-GF-ACCOUNTING-006/013; **BR-GF-INVENTORY-ACCOUNTING-PERIOD (BR-AP-001..016, BR-AP-CMN-001/002, CB-AP-001)** — frontmatter `boundary: gf-inventory` mismatch (OQ1)
- Product: EP-INVENTORY-ACCOUNTING-PERIOD + 5 FEAT-AP-* + UX-FLOW-INVENTORY-ACCOUNTING-PERIOD (web-only)
- Integration: [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md) §6 (lock-check consumer pattern)
- BFF: [agg-garage-graph-graphql.md §3e](agg-garage-graph-graphql.md)
- ERROR-CODE-REGISTRY: ERR-INV-021..026 (existing entries reused for AP); **NEW namespace `ERR-AP-*` proposed cho immutable-field violation** (placeholder `ERR-AP-001` — pending BA registry entry — OQ7); tree-cap = plain HTTP 413 no code (R2 F2 — BFF translates qua `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE`)

## Change Log

| Date | Version | Summary |
|---|---|---|
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
