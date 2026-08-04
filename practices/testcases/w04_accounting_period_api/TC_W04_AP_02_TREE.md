# W04 Accounting Period API - Tree

- API: `POST /api/v2/accounting-periods/tree`
- Source: `gara/Architecture/api/gf-accounting-api.md` section 4.2; `gara/Execution/wave-specs/W04/Product/features/be/FEAT-AP-LIST.md`; `gara/Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`
- Scope: kiểm tra cây YEAR -> QUARTER -> MONTH, filter theo năm/tên, giới hạn 500 node, tenant isolation và validation.

## Luồng API cần kiểm thử

1. Client gửi JWT tenant user kèm body `{year?, name?}`.
2. BE resolve tenant, default `year=currentYear` nếu không truyền.
3. BE validate `year` và `name`, sau đó query cây theo tenant ở mọi cấp.
4. Nếu có `name`, BE giữ matching node + ancestor path + descendant subtree.
5. BE sort theo `displayOrder`, áp size cap 500 node, rồi trả nested tree.

## Validate dữ liệu API

| Trường/Header | Rule cần kiểm tra | TC phủ |
|---|---|---|
| `Authorization` | Bắt buộc authenticated tenant user | `GARA_AP_TREE_TC_010` |
| `X-Tenant-Id` / tenant context | Mọi root/child đều phải thuộc tenant hiện tại | `GARA_AP_TREE_TC_008` |
| `year` | Optional, default current year; nếu truyền phải trong khoảng 2000-2100 | `GARA_AP_TREE_TC_002`, `GARA_AP_TREE_TC_006` |
| `name` | Optional, max 255 chars; search case-insensitive/unaccent theo prefix và giữ ancestor/descendant | `GARA_AP_TREE_TC_003`, `GARA_AP_TREE_TC_005` |
| Tree size | Nếu tổng node trong tree > 500 thì trả plain HTTP 413 | `GARA_AP_TREE_TC_007` |
| `availableYears` | Chưa chốt trong API contract; không assert bắt buộc | `GARA_AP_TREE_TC_009` |

## Quyền/Auth coverage

| Loại quyền | Expected | TC phủ |
|---|---|---|
| `garage-owner` / owner tenant A | Được lấy tree tenant A | `GARA_AP_TREE_TC_001` |
| `accountant` tenant A | Được lấy tree ngang quyền owner trên danh mục AP | `GARA_AP_TREE_TC_011` |
| Thiếu JWT | HTTP 401 | `GARA_AP_TREE_TC_010` |
| Cross-tenant data | Không có node tenant khác ở bất kỳ cấp nào | `GARA_AP_TREE_TC_008` |
| Role gate riêng cho read endpoint | Không có role gate ngoài authenticated tenant user theo FEAT-AP-LIST | Covered by owner/accountant happy path |

## Dữ liệu nền

- Tenant A: `tenantId=133`, user `owner.ap.a@gara.test`, `accountant.ap.a@gara.test`, `viewer.ap.a@gara.test`.
- Seed tenant A:
  - YEAR `id=1000`, `name=Năm 2026`, `year=2026`, `status=OPEN`.
  - QUARTER `id=1010`, `name=Quý 1/2026`, `parentId=1000`, `status=CLOSED`.
  - MONTH `id=1011`, `name=Tháng 1/2026`, `parentId=1010`, `status=CLOSED`.
  - MONTH `id=1026`, `name=Tháng 6/2026`, `parentId=1020`, `status=OPEN`.
- Tenant B có YEAR `id=2000`, `name=Năm 2026 - Tenant B`.

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---:|---|---|---|---|---:|---|
| GARA_AP_TREE_TC_001 | W04-AP Tree | High | Lấy cây kỳ kế toán theo năm thành công | Đăng nhập `owner.ap.a@gara.test`; dữ liệu tenant A đã seed đủ YEAR/QUARTER/MONTH | 1. Gửi `POST /api/v2/accounting-periods/tree` với `X-Tenant-Id=133`.<br>2. Body truyền `year=2026`.<br>3. Kiểm tra cấu trúc cây. | HTTP 200.<br>Response có root `Năm 2026` type `YEAR`.<br>YEAR có children là các QUARTER.<br>QUARTER có children là các MONTH.<br>Mỗi node có thông tin `id`, `name`, `type`, `year`, `startDate`, `endDate`, `status`, `children`. | P0 | Body: `{"year":2026}` |
| GARA_AP_TREE_TC_002 | W04-AP Tree | Medium | Mặc định năm hiện tại khi không truyền `year` | Ngày hệ thống trong năm 2026; tenant A có dữ liệu 2026 | 1. Gửi tree với body `{}`.<br>2. Kiểm tra root node. | HTTP 200.<br>API trả cây của năm hiện tại 2026.<br>Không trả cây của năm khác. | P1 | Body: `{}` |
| GARA_AP_TREE_TC_003 | W04-AP Tree | High | Search theo tên trả node khớp kèm ancestor và descendant | Có `Tháng 1/2026` dưới `Quý 1/2026` dưới `Năm 2026` | 1. Gửi tree với `year=2026`, `name="Tháng 1"`.<br>2. Kiểm tra cây trả về. | HTTP 200.<br>Cây có node `Tháng 1/2026`.<br>Response giữ đủ nhánh cha `Năm 2026` -> `Quý 1/2026` để UI hiển thị context.<br>Không trả node không liên quan nếu không nằm trong nhánh match. | P0 | Body: `{"year":2026,"name":"Tháng 1"}` |
| GARA_AP_TREE_TC_004 | W04-AP Tree | Medium | Không có dữ liệu phù hợp thì trả cây rỗng | Tenant A không có AP năm 2099 | 1. Gửi tree với `year=2099`.<br>2. Kiểm tra response. | HTTP 200.<br>`data.periods=[]` và `data.summary.total=0`.<br>Không phát sinh 404. | P2 | Body: `{"year":2099}` |
| GARA_AP_TREE_TC_005 | W04-AP Tree | High | Reject `name` dài hơn 255 ký tự | Đăng nhập tenant A | 1. Gửi tree với `name` dài 256 ký tự.<br>2. Kiểm tra lỗi. | HTTP 400.<br>Trả lỗi validation cho `name` vượt quá 255 ký tự. | P0 | Body: `{"year":2026,"name":"A x 256"}` |
| GARA_AP_TREE_TC_006 | W04-AP Tree | High | Reject `year` ngoài khoảng 2000-2100 | Đăng nhập tenant A | 1. Gửi tree với `year=1999`.<br>2. Gửi tree với `year=2101`.<br>3. Kiểm tra từng response. | Cả 2 request trả HTTP 400.<br>Trả lỗi validation cho `year`. | P0 | Body 1: `{"year":1999}`<br>Body 2: `{"year":2101}` |
| GARA_AP_TREE_TC_007 | W04-AP Tree | High | Trả 413 khi cây vượt quá 500 node | Tenant A có dataset test năm 2088 với hơn 500 node AP | 1. Gửi tree với `year=2088`.<br>2. Kiểm tra response. | HTTP 413.<br>Response thông báo cây quá lớn theo API spec.<br>Không trả payload cây quá 500 node. | P0 | Body: `{"year":2088}` |
| GARA_AP_TREE_TC_008 | W04-AP Tree | High | Cô lập tenant trong toàn bộ cây | Đăng nhập tenant A; tenant B có `Năm 2026 - Tenant B` | 1. Gửi tree với `X-Tenant-Id=133`, `year=2026`.<br>2. Duyệt toàn bộ root và children. | HTTP 200.<br>Không có node `id=2000` hoặc tên `Tenant B` ở bất kỳ cấp nào. | P0 | Header: `X-Tenant-Id=133`<br>Body: `{"year":2026}` |
| GARA_AP_TREE_TC_009 | W04-AP Tree | Medium | Không fail nếu response chưa có `availableYears` | FEAT có nhắc `availableYears`, API spec hiện chưa chốt field này | 1. Gửi tree với `year=2026`.<br>2. Kiểm tra response schema chính của tree. | HTTP 200.<br>Test chỉ assert tree node chính; không coi thiếu `availableYears` là lỗi.<br>Nếu API trả `availableYears` thì giá trị phải là danh sách năm hợp lệ của tenant. | P2 | Body: `{"year":2026}` |
| GARA_AP_TREE_TC_010 | W04-AP Tree | Medium | Thiếu token thì không được lấy tree | Không gửi `Authorization` | 1. Gửi tree với `X-Tenant-Id=133`, `year=2026` nhưng không có token.<br>2. Kiểm tra response. | HTTP 401.<br>Không trả dữ liệu tree. | P0 | Body: `{"year":2026}` |
| GARA_AP_TREE_TC_011 | W04-AP Tree | Medium | Accountant có thể lấy tree AP | Đăng nhập `accountant.ap.a@gara.test` có quyền AP | 1. Gửi tree với token accountant, `X-Tenant-Id=133`, `year=2026`.<br>2. Kiểm tra response. | HTTP 200.<br>Tree chỉ chứa dữ liệu tenant A.<br>Response shape giống owner với cùng filter. | P1 | User: `accountant.ap.a@gara.test`<br>Body: `{"year":2026}` |
