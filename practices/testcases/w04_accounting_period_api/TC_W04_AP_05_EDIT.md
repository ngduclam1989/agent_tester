# W04 Accounting Period API - Edit

- API: `PUT /api/v2/accounting-periods/{id}`
- Source: `gara/Architecture/api/gf-accounting-api.md` section 4.5; `gara/Execution/wave-specs/W04/Product/features/be/FEAT-AP-EDIT.md`; `gara/Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`
- Scope: kiểm tra cập nhật field mutable, đổi trạng thái OPEN/CLOSED, chặn immutable fields, not found, tenant isolation và phân quyền.
- Assumption đã chốt: immutable field dùng `ERR-AP-001`; blank `name` dùng common validation.

## Luồng API cần kiểm thử

1. Client gửi JWT user có quyền sửa AP, path `id` và body update.
2. BE validate path `id`, resolve tenant, tìm AP theo `tenantId + id`.
3. BE reject nếu body chứa field immutable trước khi persist.
4. BE validate 4 mutable fields `name`, `description`, `displayOrder`, `status`.
5. BE cập nhật trong transaction, bump `updatedAt/updatedBy`; status transition phản ánh qua lock-check.

## Validate dữ liệu API

| Trường/Header | Rule cần kiểm tra | TC phủ |
|---|---|---|
| `Authorization` | Bắt buộc JWT user được phép mutate AP | `GARA_AP_EDIT_TC_012`, `GARA_AP_EDIT_TC_014` |
| `X-Tenant-Id` / tenant context | Lookup theo `tenantId + id`; tenant mismatch trả 404 | `GARA_AP_EDIT_TC_011` |
| Path `id` | BIGINT hợp lệ; không tồn tại trả 404 | `GARA_AP_EDIT_TC_010`, `GARA_AP_EDIT_TC_018` |
| `name` | Mutable; required nếu gửi; non-blank, max 255 | `GARA_AP_EDIT_TC_001`, `GARA_AP_EDIT_TC_002`, `GARA_AP_EDIT_TC_015` |
| `description` | Mutable; optional, max 500 | `GARA_AP_EDIT_TC_003`, `GARA_AP_EDIT_TC_016` |
| `displayOrder` | Mutable integer | `GARA_AP_EDIT_TC_001` |
| `status` | Mutable enum `OPEN`, `CLOSED`; transition không thêm guard hierarchy | `GARA_AP_EDIT_TC_004`, `GARA_AP_EDIT_TC_005`, `GARA_AP_EDIT_TC_017` |
| Immutable fields | `type`, `parentId`, `startDate`, `endDate`, `autoGenerateChildren` nếu xuất hiện trong payload thì reject toàn request với `ERR-AP-001` | `GARA_AP_EDIT_TC_006`, `GARA_AP_EDIT_TC_007`, `GARA_AP_EDIT_TC_008`, `GARA_AP_EDIT_TC_009` |

## Quyền/Auth coverage

| Loại quyền | Expected | TC phủ |
|---|---|---|
| `garage-owner` / owner tenant A | Được edit mutable fields | `GARA_AP_EDIT_TC_001` |
| `accountant` tenant A | Được edit mutable fields ngang quyền owner | `GARA_AP_EDIT_TC_013` |
| User ngoài nhóm mutate AP | HTTP 403, không cập nhật AP | `GARA_AP_EDIT_TC_012` |
| Thiếu JWT | HTTP 401, không cập nhật AP | `GARA_AP_EDIT_TC_014` |
| Cross-tenant data | Trả 404, không cập nhật tenant khác | `GARA_AP_EDIT_TC_011` |

## Dữ liệu nền

- Tenant A: `tenantId=133`, user `owner.ap.a@gara.test`, `accountant.ap.a@gara.test`, `viewer.ap.a@gara.test`, `no_ap_role.a@gara.test`.
- Seed tenant A:
  - MONTH `id=1026`, `name=Tháng 6/2026`, `type=MONTH`, `parentId=1020`, `status=OPEN`, `displayOrder=6`.
  - MONTH `id=1025`, `name=Tháng 5/2026`, `type=MONTH`, `parentId=1020`, `status=CLOSED`, `displayOrder=5`.
- Tenant B: MONTH `id=2026`, `name=Tháng 6/2026 - Tenant B`.

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---:|---|---|---|---|---:|---|
| GARA_AP_EDIT_TC_001 | W04-AP Edit | High | Cập nhật toàn bộ mutable fields thành công | Đăng nhập `owner.ap.a@gara.test`; AP `id=1026` thuộc tenant A | 1. Gửi `PUT /api/v2/accounting-periods/1026` với `name`, `description`, `displayOrder`, `status` mới.<br>2. Kiểm tra response.<br>3. Gọi detail `id=1026`. | HTTP 200.<br>Các field mutable được cập nhật đúng.<br>`updatedAt`, `updatedBy` được ghi nhận.<br>Các field immutable giữ nguyên. | P0 | `{"name":"Tháng 6/2026 - Updated","description":"QA update mutable fields","displayOrder":60,"status":"OPEN"}` |
| GARA_AP_EDIT_TC_002 | W04-AP Edit | High | Reject blank `name` khi edit | AP `id=1026` tồn tại | 1. Gửi PUT với `name=" "`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail để xác nhận dữ liệu cũ không đổi. | HTTP 400.<br>Trả common validation cho `name` blank.<br>AP không bị cập nhật partial. | P0 | `{"name":" ","description":"Should not update"}` |
| GARA_AP_EDIT_TC_003 | W04-AP Edit | Medium | Cập nhật description độ dài tối đa hợp lệ | AP `id=1026` tồn tại; chuẩn field cho phép 500 ký tự | 1. Gửi PUT với `description` dài 500 ký tự.<br>2. Kiểm tra response và detail. | HTTP 200.<br>`description` được lưu đầy đủ 500 ký tự.<br>Không cắt chuỗi ngoài ý muốn. | P1 | `{"description":"D x 500"}` |
| GARA_AP_EDIT_TC_004 | W04-AP Edit | High | Đổi trạng thái OPEN sang CLOSED thành công | AP `id=1026` đang `OPEN` | 1. Gửi PUT `status="CLOSED"`.<br>2. Gọi detail `id=1026`.<br>3. Gọi lock-check với date `2026-06-15`. | HTTP 200.<br>Detail hiển thị `status=CLOSED`.<br>Lock-check cho ngày trong tháng 6 trả `locked=true`. | P0 | `{"status":"CLOSED"}` |
| GARA_AP_EDIT_TC_005 | W04-AP Edit | High | Đổi trạng thái CLOSED sang OPEN thành công | AP `id=1025` đang `CLOSED` | 1. Gửi PUT `status="OPEN"` cho `id=1025`.<br>2. Gọi detail `id=1025`.<br>3. Gọi lock-check với date `2026-05-15`. | HTTP 200.<br>Detail hiển thị `status=OPEN`.<br>Lock-check cho ngày trong tháng 5 trả `locked=false`. | P0 | Path: `/1025`<br>Body: `{"status":"OPEN"}` |
| GARA_AP_EDIT_TC_006 | W04-AP Edit | High | Reject cập nhật immutable `type` | AP `id=1026` tồn tại | 1. Gửi PUT có field `type="QUARTER"`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail xác nhận `type` vẫn là `MONTH`. | HTTP 400.<br>Trả `ERR-AP-001` cho immutable field.<br>Không cập nhật field nào trong request. | P0 | `{"type":"QUARTER","name":"Attempt immutable type"}` |
| GARA_AP_EDIT_TC_007 | W04-AP Edit | High | Reject cập nhật immutable `parentId` | AP `id=1026` tồn tại | 1. Gửi PUT có `parentId=1010`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail xác nhận `parentId` không đổi. | HTTP 400.<br>Trả `ERR-AP-001`.<br>`parentId` vẫn là `1020`. | P0 | `{"parentId":1010}` |
| GARA_AP_EDIT_TC_008 | W04-AP Edit | High | Reject cập nhật immutable `startDate` và `endDate` | AP `id=1026` tồn tại | 1. Gửi PUT có `startDate` hoặc `endDate` mới.<br>2. Kiểm tra lỗi.<br>3. Gọi detail xác nhận date range không đổi. | HTTP 400.<br>Trả `ERR-AP-001`.<br>`startDate=2026-06-01`, `endDate=2026-06-30` không đổi. | P0 | `{"startDate":"2026-06-02","endDate":"2026-06-29"}` |
| GARA_AP_EDIT_TC_009 | W04-AP Edit | High | Reject cập nhật immutable `autoGenerateChildren` | AP `id=1026` tồn tại | 1. Gửi PUT có `autoGenerateChildren=true`.<br>2. Kiểm tra lỗi. | HTTP 400.<br>Trả `ERR-AP-001`.<br>Không sinh thêm child và không cập nhật AP. | P0 | `{"autoGenerateChildren":true}` |
| GARA_AP_EDIT_TC_010 | W04-AP Edit | High | ID không tồn tại trả 404 | Không có AP `id=99999999` trong tenant A | 1. Gửi PUT `/99999999` với body hợp lệ.<br>2. Kiểm tra response. | HTTP 404.<br>Không tạo mới record theo kiểu upsert. | P0 | Path: `/99999999`<br>Body: `{"name":"Not Found Update"}` |
| GARA_AP_EDIT_TC_011 | W04-AP Edit | High | Không được edit AP của tenant khác | Đăng nhập tenant A; AP `id=2026` thuộc tenant B | 1. Gửi PUT `/2026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response.<br>3. Đăng nhập tenant B và gọi detail `/2026`. | Request tenant A trả HTTP 404.<br>Dữ liệu tenant B không đổi sau request. | P0 | Path: `/2026`<br>Body: `{"name":"Cross tenant update attempt"}` |
| GARA_AP_EDIT_TC_012 | W04-AP Edit | High | User không có quyền AP không được edit AP | Đăng nhập `no_ap_role.a@gara.test`; AP `id=1026` tồn tại | 1. Gửi PUT `/1026` bằng token user không có quyền AP.<br>2. Kiểm tra response.<br>3. Gọi detail bằng owner. | HTTP 403.<br>AP không bị thay đổi. | P0 | `{"name":"Denied update"}` |
| GARA_AP_EDIT_TC_013 | W04-AP Edit | Medium | Accountant được edit mutable fields | Đăng nhập `accountant.ap.a@gara.test` có quyền quản lý AP | 1. Gửi PUT `/1026` với `description` mới.<br>2. Kiểm tra response. | HTTP 200.<br>`description` được cập nhật và audit ghi user accountant. | P1 | `{"description":"Updated by accountant role"}` |
| GARA_AP_EDIT_TC_014 | W04-AP Edit | High | Thiếu token thì không được edit | Không gửi `Authorization` | 1. Gửi PUT `/1026` với `X-Tenant-Id=133` nhưng không có token.<br>2. Kiểm tra response. | HTTP 401.<br>AP không bị thay đổi. | P0 | `{"name":"No token attempt"}` |
| GARA_AP_EDIT_TC_015 | W04-AP Edit | High | Reject `name` dài hơn 255 ký tự | AP `id=1026` tồn tại | 1. Gửi PUT với `name` dài 256 ký tự.<br>2. Kiểm tra response.<br>3. Gọi detail để xác nhận tên cũ không đổi. | HTTP 400.<br>Trả common validation cho `name` vượt quá 255 ký tự.<br>AP không bị cập nhật partial. | P0 | `{"name":"N x 256"}` |
| GARA_AP_EDIT_TC_016 | W04-AP Edit | Medium | Reject `description` dài hơn 500 ký tự | AP `id=1026` tồn tại | 1. Gửi PUT với `description` dài 501 ký tự.<br>2. Kiểm tra response. | HTTP 400.<br>Trả common validation cho `description` vượt quá 500 ký tự.<br>AP không bị cập nhật. | P1 | `{"description":"D x 501"}` |
| GARA_AP_EDIT_TC_017 | W04-AP Edit | High | Reject `status` không thuộc enum | AP `id=1026` tồn tại | 1. Gửi PUT với `status="LOCKED"`.<br>2. Kiểm tra response.<br>3. Gọi detail để xác nhận status cũ không đổi. | HTTP 400.<br>Trả common validation/enum parse error cho `status`.<br>AP không bị cập nhật. | P0 | `{"status":"LOCKED"}` |
| GARA_AP_EDIT_TC_018 | W04-AP Edit | Medium | Path id không hợp lệ bị reject | Đăng nhập owner tenant A | 1. Gửi `PUT /api/v2/accounting-periods/abc` với body hợp lệ.<br>2. Kiểm tra response. | HTTP 400.<br>Không cập nhật bất kỳ AP nào. | P2 | Path: `/abc`<br>Body: `{"name":"Invalid path id"}` |
