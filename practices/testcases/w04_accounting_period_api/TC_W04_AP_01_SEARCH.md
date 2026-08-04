# W04 Accounting Period API - Search

- API: `POST /api/v2/accounting-periods/search`
- Source: `gara/Architecture/api/gf-accounting-api.md` section 4.1; `gara/Execution/wave-specs/W04/Product/features/be/FEAT-AP-LIST.md`; `gara/Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`
- Scope: kiểm tra tìm kiếm danh sách kỳ kế toán theo tenant, filter, paging, sorting, validation và phân quyền.

## Luồng API cần kiểm thử

1. Client gửi JWT tenant user kèm `X-Tenant-Id`.
2. BE resolve tenant từ security context, validate body search.
3. BE áp filter theo `tenantId`, `name`, `year`, `types`, `statuses`.
4. BE áp sort + paging, không tạo/sửa/xóa dữ liệu vì đây là read-only POST.
5. BE trả paged response và tuyệt đối không lộ kỳ kế toán của tenant khác.

## Validate dữ liệu API

| Trường/Header | Rule cần kiểm tra | TC phủ |
|---|---|---|
| `Authorization` | Bắt buộc JWT authenticated tenant user | `GARA_AP_SEARCH_TC_009` |
| `X-Tenant-Id` / tenant context | Query phải scope theo tenant hiện tại, không leak cross-tenant | `GARA_AP_SEARCH_TC_008` |
| `name` | Optional, LIKE search trên `name`, case-insensitive; rỗng/null nghĩa là không filter tên | `GARA_AP_SEARCH_TC_003` |
| `year` | Optional, default current year; nếu truyền phải trong khoảng 2000-2100 | `GARA_AP_SEARCH_TC_002`, `GARA_AP_SEARCH_TC_007` |
| `types` | Optional array enum `YEAR`, `QUARTER`, `MONTH`; default all | `GARA_AP_SEARCH_TC_004`, `GARA_AP_SEARCH_TC_011` |
| `statuses` | Optional array enum `OPEN`, `CLOSED` | `GARA_AP_SEARCH_TC_004`, `GARA_AP_SEARCH_TC_011` |
| `page` | Optional, default 0; phải `>= 0` | `GARA_AP_SEARCH_TC_005` |
| `size` | Optional, default 50; max 100 | `GARA_AP_SEARCH_TC_006` |
| `sort` | Optional, format `field,asc|desc`; default `startDate,desc` | `GARA_AP_SEARCH_TC_001`, `GARA_AP_SEARCH_TC_012` |

## Quyền/Auth coverage

| Loại quyền | Expected | TC phủ |
|---|---|---|
| `garage-owner` / owner tenant A | Được search dữ liệu tenant A | `GARA_AP_SEARCH_TC_001` |
| `accountant` tenant A | Được search ngang quyền owner trên danh mục AP | `GARA_AP_SEARCH_TC_010` |
| Thiếu JWT | HTTP 401 | `GARA_AP_SEARCH_TC_009` |
| Cross-tenant data | Không trả dữ liệu tenant khác | `GARA_AP_SEARCH_TC_008` |
| Role gate riêng cho read endpoint | Không có role gate ngoài authenticated tenant user theo FEAT-AP-LIST | Covered by owner/accountant happy path |

## Dữ liệu nền

- Tenant A: `tenantId=133`, user `owner.ap.a@gara.test`, `accountant.ap.a@gara.test`, `viewer.ap.a@gara.test`.
- Tenant B: `tenantId=233`, user `owner.ap.b@gara.test`.
- Seed tenant A:
  - `id=1000`, `name=Năm 2026`, `type=YEAR`, `year=2026`, `status=OPEN`, `startDate=2026-01-01`, `endDate=2026-12-31`.
  - `id=1010`, `name=Quý 1/2026`, `type=QUARTER`, `year=2026`, `status=CLOSED`.
  - `id=1026`, `name=Tháng 6/2026`, `type=MONTH`, `year=2026`, `status=OPEN`.
- Seed tenant B: `id=2000`, `name=Năm 2026 - Tenant B`, `type=YEAR`, `year=2026`, `status=OPEN`.

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---:|---|---|---|---|---:|---|
| GARA_AP_SEARCH_TC_001 | W04-AP Search | High | Tìm kiếm thành công với đầy đủ filter, paging và sort | Đăng nhập `owner.ap.a@gara.test`; dữ liệu tenant A đã seed | 1. Gửi `POST /api/v2/accounting-periods/search` với `Authorization` hợp lệ và `X-Tenant-Id=133`.<br>2. Body gồm `year=2026`, `types=["MONTH"]`, `statuses=["OPEN"]`, `page=0`, `size=50`, `sort="startDate,desc"`.<br>3. Kiểm tra response. | HTTP 200.<br>Danh sách chỉ gồm kỳ `MONTH`, `OPEN`, `year=2026` của tenant A.<br>Có item `Tháng 6/2026`.<br>Response có thông tin paging đúng `page=0`, `size=50`; dữ liệu được sắp xếp theo `startDate desc`. | P0 | Body: `{"year":2026,"types":["MONTH"],"statuses":["OPEN"],"page":0,"size":50,"sort":"startDate,desc"}` |
| GARA_AP_SEARCH_TC_002 | W04-AP Search | Medium | Mặc định năm hiện tại khi không truyền `year` | Ngày hệ thống trong năm 2026; đăng nhập tenant A | 1. Gửi search với body chỉ có `page=0`, `size=20`.<br>2. Kiểm tra các item trả về. | HTTP 200.<br>API dùng năm hiện tại làm mặc định.<br>Các item trả về thuộc `year=2026` và tenant A. | P1 | Body: `{"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_003 | W04-AP Search | Medium | Tìm kiếm theo `name` không phân biệt hoa thường | Có kỳ `Tháng 6/2026` trong tenant A | 1. Gửi search với `name="tháng 6"`, `year=2026`.<br>2. Kiểm tra danh sách trả về. | HTTP 200.<br>Kết quả có kỳ `Tháng 6/2026` dù input dùng chữ thường.<br>Không trả kỳ của tenant khác. | P1 | Body: `{"name":"tháng 6","year":2026,"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_004 | W04-AP Search | Medium | Lọc đồng thời nhiều `types` và nhiều `statuses` | Tenant A có YEAR OPEN, QUARTER CLOSED, MONTH OPEN | 1. Gửi search với `types=["YEAR","QUARTER"]`, `statuses=["OPEN","CLOSED"]`, `year=2026`.<br>2. Kiểm tra từng item. | HTTP 200.<br>Kết quả chỉ thuộc `YEAR` hoặc `QUARTER` và status thuộc `OPEN` hoặc `CLOSED`.<br>Không có `MONTH` trong kết quả. | P1 | Body: `{"year":2026,"types":["YEAR","QUARTER"],"statuses":["OPEN","CLOSED"],"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_005 | W04-AP Search | High | Reject `page` âm | Đăng nhập tenant A | 1. Gửi search với `page=-1`, `size=20`.<br>2. Kiểm tra lỗi. | HTTP 400.<br>Trả lỗi validation theo chuẩn common error.<br>Không trả dữ liệu list. | P0 | Body: `{"year":2026,"page":-1,"size":20}` |
| GARA_AP_SEARCH_TC_006 | W04-AP Search | High | Reject `size` lớn hơn 100 | Đăng nhập tenant A | 1. Gửi search với `size=101`.<br>2. Kiểm tra lỗi. | HTTP 400.<br>Trả lỗi validation theo rule `size <= 100`.<br>Không trả dữ liệu list. | P0 | Body: `{"year":2026,"page":0,"size":101}` |
| GARA_AP_SEARCH_TC_007 | W04-AP Search | High | Reject `year` ngoài khoảng 2000-2100 | Đăng nhập tenant A | 1. Gửi search với `year=1999`.<br>2. Gửi lại với `year=2101`.<br>3. Kiểm tra lỗi của từng request. | Cả 2 request trả HTTP 400.<br>Trả lỗi validation cho `year` ngoài khoảng hợp lệ. | P0 | Body 1: `{"year":1999,"page":0,"size":20}`<br>Body 2: `{"year":2101,"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_008 | W04-AP Search | High | Cô lập tenant khi search | Đăng nhập `owner.ap.a@gara.test`; tenant B có dữ liệu `id=2000` | 1. Gửi search với `X-Tenant-Id=133`, `year=2026`, `name="Tenant B"`.<br>2. Kiểm tra response. | HTTP 200.<br>Không trả kỳ `Năm 2026 - Tenant B` hoặc bất kỳ dữ liệu nào thuộc tenant B. | P0 | Header: `X-Tenant-Id=133`<br>Body: `{"name":"Tenant B","year":2026,"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_009 | W04-AP Search | High | Không cho search khi thiếu token | Không gửi `Authorization` | 1. Gửi search với `X-Tenant-Id=133` nhưng không có `Authorization`.<br>2. Kiểm tra response. | HTTP 401.<br>Không trả dữ liệu kỳ kế toán. | P0 | Body: `{"year":2026,"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_010 | W04-AP Search | Medium | Accountant có thể search AP | Đăng nhập `accountant.ap.a@gara.test` có quyền AP | 1. Gửi search với `Authorization` của accountant và `X-Tenant-Id=133`.<br>2. Kiểm tra response. | HTTP 200.<br>Dữ liệu chỉ thuộc tenant A. | P1 | Body: `{"year":2026,"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_011 | W04-AP Search | High | Reject enum không hợp lệ trong `types` hoặc `statuses` | Đăng nhập owner tenant A | 1. Gửi search với `types=["WEEK"]`.<br>2. Gửi search với `statuses=["LOCKED"]`.<br>3. Kiểm tra từng response. | Mỗi request trả HTTP 400.<br>Response là common validation/enum parse error.<br>Không trả dữ liệu list. | P0 | Body 1: `{"year":2026,"types":["WEEK"],"page":0,"size":20}`<br>Body 2: `{"year":2026,"statuses":["LOCKED"],"page":0,"size":20}` |
| GARA_AP_SEARCH_TC_012 | W04-AP Search | Medium | Reject `sort` sai format hoặc field không hỗ trợ | Đăng nhập owner tenant A | 1. Gửi search với `sort="unknownField,desc"`.<br>2. Gửi search với `sort="startDate,down"`.<br>3. Kiểm tra từng response. | Mỗi request trả HTTP 400.<br>Trả lỗi validation cho sort không hợp lệ.<br>Không trả dữ liệu list. | P1 | Body 1: `{"year":2026,"page":0,"size":20,"sort":"unknownField,desc"}`<br>Body 2: `{"year":2026,"page":0,"size":20,"sort":"startDate,down"}` |
