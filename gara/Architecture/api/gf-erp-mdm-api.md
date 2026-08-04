---
type: architecture
artifact_kind: api-contract
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-erp-mdm
last_reviewed: "2026-05-07"
depends_on:
  - "../hld/gf-erp-mdm-HLD.md"
---

# REST API - `gf-erp-mdm`

> API contract cho boundary `gf-erp-mdm`, quản lý master data catalogue, car hierarchy, parts catalogue, pricing và các lookup protected phục vụ ERP/GMS.
>
> Trạng thái tài liệu: cập nhật ở version 2, chờ xác nhận chính thức trước khi nâng version tiếp theo.

---

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Service | `gf-erp-mdm` |
| Runtime | Java 21, Spring Boot 3.x |
| API style | REST / JSON |
| Public prefixes | `/api/v1` |
| Protected prefixes | `/protected/catalog`, `/protected/v1` |
| Auth | Public APIs dùng security context; protected APIs dùng service-to-service convention. |
| Response wrappers | `ApiResponse<T>`, `PagedApiResponse<T>` hoặc `ResponseEntity<T>` tùy endpoint. |
| Pagination | Các search/list endpoints dùng `page`, `size`, sort/filter theo request DTO của từng module. |
| Tenant resolution | Public APIs lấy tenant từ security context; protected APIs dùng service context hoặc request nội bộ tùy flow. |

---

## 2. Endpoint Summary

| # | Method | Path | Module | Auth |
|---:|---|---|---|---|
| 1 | `DELETE` | `/api/v1/catalog` | MdmCatalog | authenticated |
| 2 | `GET` | `/api/v1/catalog` | MdmCatalog | authenticated |
| 3 | `POST` | `/api/v1/catalog` | MdmCatalog | authenticated |
| 4 | `PUT` | `/api/v1/catalog` | MdmCatalog | authenticated |
| 5 | `POST` | `/api/v1/catalog/create-hierarchy` | MdmCatalog | authenticated |
| 6 | `POST` | `/api/v1/catalog/find-by-code` | MdmCatalog | authenticated |
| 7 | `POST` | `/api/v1/catalog/get-hierarchy` | MdmCatalog | authenticated |
| 8 | `POST` | `/api/v1/catalog/get-hierarchy-line` | MdmCatalog | authenticated |
| 9 | `POST` | `/api/v1/catalog/get-hierarchy-list` | MdmCatalog | authenticated |
| 10 | `POST` | `/api/v1/catalog/import` | ImportMdmCatalog | authenticated |
| 11 | `POST` | `/api/v1/catalog/import/common` | ImportMdmCatalog | authenticated |
| 12 | `POST` | `/api/v1/catalog/inquiry` | MdmCatalog | authenticated |
| 13 | `POST` | `/api/v1/catalog/inquiry-hierarchy` | MdmCatalog | authenticated |
| 14 | `POST` | `/api/v1/dynamic-data/{tableName}/{dataSet}` | DynamicMasterData | authenticated |
| 15 | `PUT` | `/api/v1/dynamic-data/{tableName}/{dataSet}/{id}` | DynamicMasterData | authenticated |
| 16 | `GET` | `/api/v1/dynamic-data/{tableName}/{id}` | DynamicMasterData | authenticated |
| 17 | `GET` | `/api/v1/dynamic-data/{tableName}/column` | DynamicMasterData | authenticated |
| 18 | `POST` | `/api/v1/dynamic-data/{tableName}/list` | DynamicMasterData | authenticated |
| 19 | `POST` | `/api/v1/dynamic-data/{tableName}/list-by-parent` | DynamicMasterData | authenticated |
| 20 | `POST` | `/api/v1/dynamic-data/{tableName}/search` | DynamicMasterData | authenticated |
| 21 | `POST` | `/api/v1/master-data` | MDM | authenticated |
| 22 | `POST` | `/protected/catalog/v1/create-hierarchy` | CatalogMdmContentInternal | service-to-service |
| 23 | `POST` | `/protected/catalog/v1/get-hierarchy` | CatalogMdmContentInternal | service-to-service |
| 24 | `POST` | `/protected/catalog/v1/get-hierarchy-codes` | CatalogMdmContentInternal | service-to-service |
| 25 | `POST` | `/protected/catalog/v1/get-parent` | CatalogMdmContentInternal | service-to-service |
| 26 | `POST` | `/protected/catalog/v1/get-parent-code` | CatalogMdmContentInternal | service-to-service |
| 27 | `POST` | `/protected/catalog/v1/inquiry` | CatalogMdmContentInternal | service-to-service |
| 28 | `GET` | `/protected/v1/dynamic-data/{tableName}/{id}` | DynamicMasterDataInternal | service-to-service |
| 29 | `GET` | `/protected/v1/dynamic-data/{tableName}/search-by-code` | DynamicMasterDataInternal | service-to-service |

---

## 3. Endpoint Details

### DELETE `/api/v1/catalog`

Xóa hoặc vô hiệu hóa mdm catalog theo định danh được cung cấp.

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
    "code": "MC-20260506-0001",
    "parentCode": "MC-20260506-0001",
    "name": "MdmCatalog mẫu",
    "directory": "mdm-catalog-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "parentId": 51001,
    "parentDirectory": "mdm-catalog-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_DELETE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_DELETE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_DELETE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_DELETE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_DELETE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_DELETE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/catalog`

Lấy dữ liệu mdm catalog theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
    "code": "MC-20260506-0001",
    "parentCode": "MC-20260506-0001",
    "name": "MdmCatalog mẫu",
    "directory": "mdm-catalog-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "parentId": 51001,
    "parentDirectory": "mdm-catalog-sample-20260506"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.MDM_CATALOG_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "MC-20260506-0001",
    "parentCode": "MC-20260506-0001",
    "name": "MdmCatalog mẫu",
    "directory": "mdm-catalog-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "parentId": 51001,
    "parentDirectory": "mdm-catalog-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/catalog`

Cập nhật mdm catalog theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

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
    "code": "MC-20260506-0001",
    "parentCode": "MC-20260506-0001",
    "name": "MdmCatalog mẫu",
    "directory": "mdm-catalog-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "parentId": 51001,
    "parentDirectory": "mdm-catalog-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/create-hierarchy`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "carBrand": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "carModel": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "yearOfManufacture": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "trimsLevel": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    }
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/find-by-code`

Lấy dữ liệu mdm catalog theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

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
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_EXECUTE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_EXECUTE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_EXECUTE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_EXECUTE.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.MDM_CATALOG_EXECUTE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_EXECUTE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/get-hierarchy`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "carBrand": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "carModel": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "yearOfManufacture": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "trimsLevel": {
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    }
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/get-hierarchy-line`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "id": 51001,
      "carBrands": [
        "Toyota"
      ],
      "carModels": [
        "Vios"
      ],
      "yearOfManufactures": [
        2024
      ],
      "trimsLevels": [
        "mdm-catalog-sample-20260506"
      ]
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/get-hierarchy-list`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "id": 51001,
      "code": "MC-20260506-0001",
      "status": "ACTIVE",
      "name": "MdmCatalog mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/import`

Tạo mới import mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "IMC-20260506-0001",
    "status": "ACTIVE",
    "name": "ImportMdmCatalog mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/import/common`

Tạo mới import mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "IMC-20260506-0001",
    "status": "ACTIVE",
    "name": "ImportMdmCatalog mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.IMPORT_MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/inquiry`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "id": 51001,
      "code": "MC-20260506-0001",
      "parentCode": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001,
      "parentDirectory": "mdm-catalog-sample-20260506"
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

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/catalog/inquiry-hierarchy`

Tạo mới mdm catalog. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "id": 51001,
      "code": "MC-20260506-0001",
      "name": "MdmCatalog mẫu",
      "directory": "mdm-catalog-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001,
      "parentDirectory": "mdm-catalog-sample-20260506",
      "children": "mdm-catalog-sample-20260506"
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

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CATALOG_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/dynamic-data/{tableName}/{dataSet}`

Tạo mới dynamic master data. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu",
    "dataSet": "2026-05-06T10:30:00+07:00"
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DMD-20260506-0001",
    "status": "ACTIVE",
    "name": "DynamicMasterData mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### PUT `/api/v1/dynamic-data/{tableName}/{dataSet}/{id}`

Cập nhật dynamic master data theo định danh trên path. Endpoint chỉ cập nhật dữ liệu thuộc tenant/ngữ cảnh hợp lệ.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu",
    "dataSet": "2026-05-06T10:30:00+07:00",
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DMD-20260506-0001",
    "status": "ACTIVE",
    "name": "DynamicMasterData mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_UPDATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_UPDATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_UPDATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_UPDATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_UPDATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_UPDATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/dynamic-data/{tableName}/{id}`

Lấy dữ liệu dynamic master data theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu",
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DMD-20260506-0001",
    "status": "ACTIVE",
    "name": "DynamicMasterData mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/api/v1/dynamic-data/{tableName}/column`

Lấy dữ liệu dynamic master data theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "columnName": "DynamicMasterData mẫu",
      "dataType": "STANDARD",
      "length": 1001,
      "isNullable": true,
      "isUnique": true
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/dynamic-data/{tableName}/list`

Tạo mới dynamic master data. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "DMD-20260506-0001",
      "status": "ACTIVE",
      "name": "DynamicMasterData mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/dynamic-data/{tableName}/list-by-parent`

Tạo mới dynamic master data. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

**Auth**: authenticated tenant user.
**Idempotency**: Không yêu cầu header `Idempotency-Key`; chống gọi trùng được xử lý theo business key/trạng thái/unique constraint nội bộ nếu cơ chế nội bộ có hỗ trợ.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "DMD-20260506-0001",
      "status": "ACTIVE",
      "name": "DynamicMasterData mẫu"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/dynamic-data/{tableName}/search`

Tra cứu danh sách dynamic master data theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: authenticated tenant user.
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.example"
  },
  "path": {
    "tableName": "DynamicMasterData mẫu"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "DMD-20260506-0001",
      "status": "ACTIVE",
      "name": "DynamicMasterData mẫu"
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
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_SEARCH.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/api/v1/master-data`

Tạo mới mdm. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "M-20260506-0001",
    "status": "ACTIVE",
    "name": "MDM mẫu"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.MDM_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.MDM_CREATE.02` | 401 | Bearer token thiếu, hết hạn hoặc không resolve được tenant/user. |
| `GMS.gf-erp-mdm.MDM_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.MDM_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.MDM_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.MDM_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/catalog/v1/create-hierarchy`

Tạo mới catalog mdm content internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "carBrand": "Toyota",
    "carModel": "Vios",
    "yearOfManufacture": 2024,
    "trimsLevel": "catalog-mdm-content-internal-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/catalog/v1/get-hierarchy`

Tạo mới catalog mdm content internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "carBrand": {
      "id": 51001,
      "code": "CMCI-20260506-0001",
      "parentCode": "CMCI-20260506-0001",
      "name": "CatalogMdmContentInternal mẫu",
      "directory": "catalog-mdm-content-internal-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "carModel": {
      "id": 51001,
      "code": "CMCI-20260506-0001",
      "parentCode": "CMCI-20260506-0001",
      "name": "CatalogMdmContentInternal mẫu",
      "directory": "catalog-mdm-content-internal-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "yearOfManufacture": {
      "id": 51001,
      "code": "CMCI-20260506-0001",
      "parentCode": "CMCI-20260506-0001",
      "name": "CatalogMdmContentInternal mẫu",
      "directory": "catalog-mdm-content-internal-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    },
    "trimsLevel": {
      "id": 51001,
      "code": "CMCI-20260506-0001",
      "parentCode": "CMCI-20260506-0001",
      "name": "CatalogMdmContentInternal mẫu",
      "directory": "catalog-mdm-content-internal-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001
    }
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/catalog/v1/get-hierarchy-codes`

Tạo mới catalog mdm content internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "brandCode": "CMCI-20260506-0001",
      "modelCode": "CMCI-20260506-0001",
      "yearOfManufactureCode": "CMCI-20260506-0001",
      "trimsLevelCode": "CMCI-20260506-0001"
    }
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/catalog/v1/get-parent`

Tạo mới catalog mdm content internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "code": "CMCI-20260506-0001",
    "parentCode": "CMCI-20260506-0001",
    "name": "CatalogMdmContentInternal mẫu",
    "directory": "catalog-mdm-content-internal-sample-20260506",
    "description": "Ghi chú nghiệp vụ mẫu",
    "parentId": 51001,
    "parentDirectory": "catalog-mdm-content-internal-sample-20260506"
  }
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/catalog/v1/get-parent-code`

Tạo mới catalog mdm content internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
    "2026-05-06T10:30:00+07:00"
  ]
}
```

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### POST `/protected/catalog/v1/inquiry`

Tạo mới catalog mdm content internal. Endpoint này ghi nhận dữ liệu nghiệp vụ và có thể kích hoạt xử lý liên quan trong boundary.

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
      "code": "CMCI-20260506-0001",
      "parentCode": "CMCI-20260506-0001",
      "name": "CatalogMdmContentInternal mẫu",
      "directory": "catalog-mdm-content-internal-sample-20260506",
      "description": "Ghi chú nghiệp vụ mẫu",
      "parentId": 51001,
      "parentDirectory": "catalog-mdm-content-internal-sample-20260506"
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

**Side-effect**: ghi hoặc cập nhật dữ liệu nghiệp vụ trong boundary và có thể phát sự kiện/cache invalidation liên quan.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.04` | 409 | Trùng business key hoặc trạng thái không cho phép chuyển tiếp hoặc dữ liệu đã tồn tại. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.CATALOG_MDM_CONTENT_INTERNAL_CREATE.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/dynamic-data/{tableName}/{id}`

Lấy dữ liệu dynamic master data internal theo định danh, bộ lọc hoặc ngữ cảnh nghiệp vụ của endpoint.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tableName": "DynamicMasterDataInternal mẫu",
    "id": 51001
  }
}
```

**Response 200/201**:
```json
{
  "data": {
    "id": 51001,
    "code": "DMDI-20260506-0001",
    "status": "ACTIVE",
    "name": "DynamicMasterDataInternal mẫu"
  }
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_READ.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_READ.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_READ.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_READ.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_READ.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_READ.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

### GET `/protected/v1/dynamic-data/{tableName}/search-by-code`

Tra cứu danh sách dynamic master data internal theo bộ lọc, phân trang và ngữ cảnh tenant hiện tại.

**Auth**: service-to-service (`x-api-key`).
**Idempotency**: Không áp dụng; endpoint read-only không yêu cầu header `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "x-api-key": "internal-api-key-example"
  },
  "path": {
    "tableName": "DynamicMasterDataInternal mẫu"
  }
}
```

**Response 200/201**:
```json
{
  "data": [
    {
      "id": 51001,
      "code": "DMDI-20260506-0001",
      "status": "ACTIVE",
      "name": "DynamicMasterDataInternal mẫu"
    }
  ]
}
```

**Side-effect**: không thay đổi state nghiệp vụ; chỉ đọc dữ liệu, kiểm tra điều kiện hoặc render output theo request.

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_SEARCH.01` | 400 | Path, query hoặc body không hợp lệ; enum/filter không parse được. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_SEARCH.02` | 403 | `x-api-key` thiếu, sai hoặc service không có quyền gọi endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_SEARCH.03` | 404 | Không tìm thấy resource theo định danh và tenant/ngữ cảnh hiện tại. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_SEARCH.04` | 422 | Filter, trạng thái hoặc tham số nghiệp vụ không được hỗ trợ cho endpoint. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_SEARCH.05` | 502 | Downstream service, cache, queue hoặc worker phụ trợ trả lỗi trong quá trình xử lý. |
| `GMS.gf-erp-mdm.DYNAMIC_MASTER_DATA_INTERNAL_SEARCH.06` | 500 | Lỗi xử lý nội bộ, repository hoặc mapping response. |

---

## 4. Forbidden Patterns

- Không nhận hoặc tin `tenantId` từ client cho public APIs nếu security context đã cung cấp tenant.
- Không hard-delete business records nếu domain cần audit hoặc lifecycle status.
- Không bypass authorization cho mutation endpoints.
- Không expose protected endpoints ra public gateway.
- Không thay đổi response wrapper mà chưa cập nhật client contract.

---

## 5. References

- HLD: [gf-erp-mdm-HLD.md](../hld/gf-erp-mdm-HLD.md)
- Events: [gf-erp-mdm-events.md](../events/gf-erp-mdm-events.md)
- ADR: Chưa xác định.
- BR: Chưa xác định.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial API spec cho `gf-erp-mdm`: REST/JSON với public APIs (`/api/v1`, bearer JWT/security-context) cho mdm catalog CRUD + hierarchy/inquiry/import, dynamic master data (`/dynamic-data/{tableName}/...`) và unified `/master-data` lookup; cộng protected APIs cho catalog content lookup (`/protected/catalog/v1` get-hierarchy/codes/parent/inquiry) và dynamic data internal lookup (`/protected/v1/dynamic-data/...`) phục vụ ERP/GMS downstream. Bao gồm Thông tin chung, Endpoint Summary, Endpoint Details, Forbidden Patterns và References. |
