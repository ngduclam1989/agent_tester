# W04 Accounting Period API - Lock Check

- API: `GET /protected/v1/accounting-periods/lock-check?date={ISO}&tenantId={id}`
- Source: `gara/Architecture/api/gf-accounting-api.md` section 4.7; `gara/Execution/wave-specs/W04/Product/features/be/FEAT-AP-EDIT.md`; `gara/Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`; `gara/Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`
- Scope: kiểm tra API S2S xác định ngày có thuộc kỳ kế toán bị khóa hay không, gồm auth bằng API key, date/tenant validation, no-period response, tenant isolation và precedence khi nhiều cấp kỳ cùng match.
- Assumption đã chốt: nếu cùng ngày match YEAR/QUARTER/MONTH thì ưu tiên kỳ MONTH; response no-period cho phép optional fields null hoặc vắng mặt theo API doc.

## Luồng API cần kiểm thử

1. Consumer nội bộ gọi protected endpoint với `X-API-Key` và `date` + `tenantId`.
2. BE validate API key, validate query date/tenant.
3. BE tìm kỳ cover date theo tenant; nếu nhiều cấp match thì chọn kỳ cụ thể nhất, ưu tiên MONTH.
4. BE tính `locked=true` khi period match có `status=CLOSED`, ngược lại `locked=false`.
5. BE trả 200 cho cả no-period case; endpoint read-only, safe/idempotent.

## Validate dữ liệu API

| Trường/Header | Rule cần kiểm tra | TC phủ |
|---|---|---|
| `X-API-Key` | Bắt buộc S2S key hợp lệ; không dùng JWT user | `GARA_AP_LOCK_TC_005`, `GARA_AP_LOCK_TC_006` |
| `date` | Required ISO `YYYY-MM-DD` | `GARA_AP_LOCK_TC_007`, `GARA_AP_LOCK_TC_008` |
| `tenantId` query / `X-Tenant-Id` header | Required tenant scope qua query hoặc header theo protected contract | `GARA_AP_LOCK_TC_009`, `GARA_AP_LOCK_TC_010`, `GARA_AP_LOCK_TC_013`, `GARA_AP_LOCK_TC_014` |
| Period matching | Date trong CLOSED period => `locked=true`; date trong OPEN period => `locked=false` | `GARA_AP_LOCK_TC_001`, `GARA_AP_LOCK_TC_002` |
| No-period response | Không có kỳ cover date vẫn HTTP 200, `locked=false`, period fields null/absent | `GARA_AP_LOCK_TC_003` |
| Match precedence | Khi YEAR/QUARTER/MONTH cùng cover date, chọn MONTH | `GARA_AP_LOCK_TC_004` |
| Idempotency/read-only | Gọi lặp không đổi dữ liệu AP | `GARA_AP_LOCK_TC_011` |
| Status change reflection | Sau khi edit status, lock-check phản ánh giá trị mới | `GARA_AP_LOCK_TC_012` |

## Quyền/Auth coverage

| Loại quyền | Expected | TC phủ |
|---|---|---|
| S2S API key hợp lệ | Được gọi lock-check, không cần JWT user | `GARA_AP_LOCK_TC_001`, `GARA_AP_LOCK_TC_002` |
| Thiếu API key | HTTP 401 | `GARA_AP_LOCK_TC_005` |
| API key sai | HTTP 401 | `GARA_AP_LOCK_TC_006` |
| Tenant isolation | Chỉ trả period thuộc tenant được request | `GARA_AP_LOCK_TC_010` |
| Public/JWT user auth | Không áp dụng cho protected endpoint; quyền nằm ở S2S key | Covered by API-key negative/positive cases |

## Dữ liệu nền

- S2S API key hợp lệ: `qa-service-key-valid`.
- Tenant A: `tenantId=133`.
- Tenant B: `tenantId=233`.
- Seed tenant A:
  - YEAR `id=1000`, `name=Năm 2026`, `status=OPEN`, `startDate=2026-01-01`, `endDate=2026-12-31`.
  - QUARTER `id=1010`, `name=Quý 1/2026`, `status=CLOSED`, `startDate=2026-01-01`, `endDate=2026-03-31`.
  - QUARTER `id=1020`, `name=Quý 2/2026`, `status=OPEN`, `startDate=2026-04-01`, `endDate=2026-06-30`.
  - MONTH `id=1011`, `name=Tháng 1/2026`, `status=CLOSED`, `startDate=2026-01-01`, `endDate=2026-01-31`.
  - MONTH `id=1026`, `name=Tháng 6/2026`, `status=OPEN`, `startDate=2026-06-01`, `endDate=2026-06-30`.
- Tenant B không có AP cover ngày `2026-06-15`.

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---:|---|---|---|---|---:|---|
| GARA_AP_LOCK_TC_001 | W04-AP Lock Check | High | Ngày thuộc MONTH CLOSED trả locked true | API key hợp lệ; MONTH `Tháng 1/2026` đang `CLOSED` | 1. Gửi `GET /protected/v1/accounting-periods/lock-check?date=2026-01-15&tenantId=133` với `X-API-Key=qa-service-key-valid`.<br>2. Kiểm tra response. | HTTP 200.<br>`locked=true`.<br>Response xác định period match là `id=1011`, `type=MONTH`, `status=CLOSED`.<br>Có thông tin ngày/kỳ đủ cho caller quyết định chặn nghiệp vụ. | P0 | Query: `date=2026-01-15`, `tenantId=133` |
| GARA_AP_LOCK_TC_002 | W04-AP Lock Check | High | Ngày thuộc MONTH OPEN trả locked false | API key hợp lệ; MONTH `Tháng 6/2026` đang `OPEN` | 1. Gửi lock-check date `2026-06-15`, tenant A.<br>2. Kiểm tra response. | HTTP 200.<br>`locked=false`.<br>Period match là `id=1026`, `type=MONTH`, `status=OPEN`. | P0 | Query: `date=2026-06-15`, `tenantId=133` |
| GARA_AP_LOCK_TC_003 | W04-AP Lock Check | High | Không có kỳ cover date trả unlocked và period null | Tenant A không có AP cover năm 2099 | 1. Gửi lock-check date `2099-01-01`, tenant A.<br>2. Kiểm tra response. | HTTP 200.<br>`locked=false`.<br>`period` null hoặc các field period optional vắng mặt/null theo API doc.<br>Không trả lỗi 404. | P0 | Query: `date=2099-01-01`, `tenantId=133` |
| GARA_AP_LOCK_TC_004 | W04-AP Lock Check | High | Ưu tiên MONTH khi cùng ngày match YEAR/QUARTER/MONTH | Ngày `2026-01-15` nằm trong YEAR 2026, Q1/2026 và Tháng 1/2026 | 1. Gửi lock-check date `2026-01-15`, tenant A.<br>2. Kiểm tra period được chọn. | HTTP 200.<br>Period match là MONTH `id=1011`, không phải YEAR hoặc QUARTER.<br>`locked=true` vì MONTH đang CLOSED. | P0 | Query: `date=2026-01-15`, `tenantId=133` |
| GARA_AP_LOCK_TC_005 | W04-AP Lock Check | High | Thiếu API key bị chặn | Không gửi `X-API-Key` | 1. Gửi lock-check date `2026-06-15`, tenant A nhưng thiếu API key.<br>2. Kiểm tra response. | HTTP 401.<br>Không trả thông tin kỳ kế toán. | P0 | Query: `date=2026-06-15`, `tenantId=133` |
| GARA_AP_LOCK_TC_006 | W04-AP Lock Check | High | API key sai bị chặn | Gửi `X-API-Key=qa-service-key-invalid` | 1. Gửi lock-check date `2026-06-15`, tenant A với API key sai.<br>2. Kiểm tra response. | HTTP 401.<br>Không trả thông tin kỳ kế toán. | P0 | Header: `X-API-Key=qa-service-key-invalid` |
| GARA_AP_LOCK_TC_007 | W04-AP Lock Check | High | Thiếu `date` bị reject | API key hợp lệ | 1. Gửi `GET /protected/v1/accounting-periods/lock-check?tenantId=133`.<br>2. Kiểm tra response. | HTTP 400.<br>Trả lỗi validation cho query param `date` bắt buộc. | P0 | Query: `tenantId=133` |
| GARA_AP_LOCK_TC_008 | W04-AP Lock Check | High | `date` sai format bị reject | API key hợp lệ | 1. Gửi lock-check với `date=15-06-2026`.<br>2. Kiểm tra response. | HTTP 400.<br>Trả lỗi validation cho định dạng ISO date.<br>Không thực hiện lookup period. | P0 | Query: `date=15-06-2026`, `tenantId=133` |
| GARA_AP_LOCK_TC_009 | W04-AP Lock Check | High | Thiếu cả query `tenantId` và header tenant bị reject | API key hợp lệ; không gửi `X-Tenant-Id` | 1. Gửi `GET /protected/v1/accounting-periods/lock-check?date=2026-06-15`.<br>2. Kiểm tra response. | HTTP 400.<br>Trả lỗi validation cho tenant scope bắt buộc. | P0 | Query: `date=2026-06-15` |
| GARA_AP_LOCK_TC_010 | W04-AP Lock Check | High | Cô lập tenant trong lock-check | Tenant A có AP cover `2026-06-15`; tenant B không có AP cover ngày này | 1. Gửi lock-check `date=2026-06-15&tenantId=233` với API key hợp lệ.<br>2. Kiểm tra response. | HTTP 200.<br>`locked=false` và period null/absent cho tenant B.<br>Không trả period `id=1026` của tenant A. | P0 | Query: `date=2026-06-15`, `tenantId=233` |
| GARA_AP_LOCK_TC_011 | W04-AP Lock Check | Medium | API idempotent, gọi lặp không thay đổi dữ liệu AP | API key hợp lệ; date `2026-06-15` match MONTH OPEN | 1. Gọi lock-check cùng query 2 lần liên tiếp.<br>2. So sánh response chính.<br>3. Gọi detail AP `id=1026` bằng API quản trị. | Cả 2 lần HTTP 200 và cùng giá trị `locked=false`, same period id.<br>Detail AP không thay đổi audit/status do lock-check chỉ đọc. | P1 | Query: `date=2026-06-15`, `tenantId=133` |
| GARA_AP_LOCK_TC_012 | W04-AP Lock Check | High | Sau khi edit status, lock-check phản ánh trạng thái mới | AP `id=1026` đang OPEN; có quyền edit AP để đổi status | 1. Gọi lock-check `2026-06-15`, xác nhận `locked=false`.<br>2. PUT AP `id=1026` sang `CLOSED`.<br>3. Gọi lại lock-check cùng date.<br>4. Restore status về `OPEN` sau test. | Lần 1 trả `locked=false`.<br>Sau khi status CLOSED, lần 2 trả `locked=true` với period `id=1026`.<br>Sau cleanup, AP trở lại OPEN. | P0 | Date: `2026-06-15`<br>AP: `id=1026` |
| GARA_AP_LOCK_TC_013 | W04-AP Lock Check | High | `tenantId` sai format bị reject | API key hợp lệ | 1. Gửi lock-check với `tenantId=abc`.<br>2. Kiểm tra response. | HTTP 400.<br>Trả validation cho `tenantId` không phải BIGINT.<br>Không thực hiện lookup period. | P0 | Query: `date=2026-06-15`, `tenantId=abc` |
| GARA_AP_LOCK_TC_014 | W04-AP Lock Check | Medium | Dùng `X-Tenant-Id` header khi không truyền query `tenantId` | API key hợp lệ; header `X-Tenant-Id=133` được protected contract chấp nhận | 1. Gửi lock-check với query chỉ có `date=2026-06-15` và header `X-Tenant-Id=133`.<br>2. Kiểm tra response. | HTTP 200.<br>`locked=false`.<br>Period match là `id=1026` của tenant A.<br>Không cần JWT user. | P1 | Header: `X-API-Key=qa-service-key-valid`, `X-Tenant-Id=133`<br>Query: `date=2026-06-15` |
