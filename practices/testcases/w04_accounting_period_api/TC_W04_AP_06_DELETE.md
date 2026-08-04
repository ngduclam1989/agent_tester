# W04 Accounting Period API - Delete

- API: `DELETE /api/v2/accounting-periods/{id}`
- Source: `gara/Architecture/api/gf-accounting-api.md` section 4.6; `gara/Execution/wave-specs/W04/Product/features/be/FEAT-AP-DELETE.md`; `gara/Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`
- Scope: kiểm tra xóa kỳ kế toán theo guard status OPEN, không có children, tenant isolation, auth/role và known gap guard liên quan stock/opening balance.
- Assumption đã chốt: trong W04 backend chỉ enforce guard `OPEN` và `no children`; guard “has stock data” chưa enforce, nên OPEN leaf có OB liên quan vẫn expected 204.

## Luồng API cần kiểm thử

1. Client gửi JWT user có quyền xóa AP và path `id`.
2. BE validate path `id`, resolve tenant, tìm AP theo `tenantId + id`.
3. BE chạy guard theo thứ tự: AP phải `OPEN`, sau đó không được có children.
4. W04 không enforce guard dữ liệu kho/OB liên quan; case này được ghi rõ là known gap.
5. BE xóa AP nếu pass guard và trả 204; gọi lại detail/search/tree phải không còn AP.

## Validate dữ liệu API

| Trường/Header | Rule cần kiểm tra | TC phủ |
|---|---|---|
| `Authorization` | Bắt buộc JWT user được phép mutate AP | `GARA_AP_DELETE_TC_008`, `GARA_AP_DELETE_TC_010` |
| `X-Tenant-Id` / tenant context | Lookup theo `tenantId + id`; tenant mismatch trả 404 | `GARA_AP_DELETE_TC_005` |
| Path `id` | BIGINT hợp lệ; không tồn tại trả 404 | `GARA_AP_DELETE_TC_006`, `GARA_AP_DELETE_TC_011` |
| `status` guard | Chỉ được xóa kỳ `OPEN`; `CLOSED` trả `ERR-INV-025` | `GARA_AP_DELETE_TC_003` |
| Children guard | Kỳ cha còn children trả `ERR-INV-026` | `GARA_AP_DELETE_TC_004` |
| Idempotency | Xóa lại ID đã xóa trả 404, không side effect | `GARA_AP_DELETE_TC_002` |
| Stock/OB guard | W04 chưa enforce guard dữ liệu kho/OB, OPEN leaf có OB vẫn expected 204 theo assumption | `GARA_AP_DELETE_TC_007` |

## Quyền/Auth coverage

| Loại quyền | Expected | TC phủ |
|---|---|---|
| `garage-owner` / owner tenant A | Được xóa OPEN leaf không children | `GARA_AP_DELETE_TC_001` |
| `accountant` tenant A | Được xóa AP ngang quyền owner | `GARA_AP_DELETE_TC_009` |
| User ngoài nhóm mutate AP | HTTP 403, không xóa AP | `GARA_AP_DELETE_TC_008` |
| Thiếu JWT | HTTP 401, không xóa AP | `GARA_AP_DELETE_TC_010` |
| Cross-tenant data | Trả 404, không xóa tenant khác | `GARA_AP_DELETE_TC_005` |

## Dữ liệu nền

- Tenant A: `tenantId=133`, user `owner.ap.a@gara.test`, `accountant.ap.a@gara.test`, `viewer.ap.a@gara.test`, `no_ap_role.a@gara.test`.
- Seed tenant A:
  - YEAR `id=1000`, `name=Năm 2026`, `status=OPEN`, có children.
  - MONTH `id=1025`, `name=Tháng 5/2026`, `status=CLOSED`, không có children.
  - MONTH `id=4099`, `name=Tháng 12/2040 - Delete OK`, `status=OPEN`, không có children, không có OB/stock data.
  - MONTH `id=5001`, `name=Tháng 01/2041 - Has OB`, `status=OPEN`, không có children, có opening balance liên quan.
- Tenant B: MONTH `id=2026`, `name=Tháng 6/2026 - Tenant B`.

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---:|---|---|---|---|---:|---|
| GARA_AP_DELETE_TC_001 | W04-AP Delete | High | Xóa OPEN leaf không có children thành công | Đăng nhập `owner.ap.a@gara.test`; AP `id=4099` đang `OPEN`, không có children | 1. Gửi `DELETE /api/v2/accounting-periods/4099` với `X-Tenant-Id=133`.<br>2. Kiểm tra response.<br>3. Gọi detail `/4099`. | HTTP 204, body rỗng.<br>Detail sau xóa trả HTTP 404.<br>Tree/search không còn AP `id=4099`. | P0 | Path: `/4099` |
| GARA_AP_DELETE_TC_002 | W04-AP Delete | Medium | Xóa lại cùng ID sau khi đã xóa trả 404 | Đã chạy thành công `GARA_AP_DELETE_TC_001` | 1. Gửi lại `DELETE /api/v2/accounting-periods/4099`.<br>2. Kiểm tra response. | HTTP 404.<br>Không có side effect phát sinh. | P1 | Path: `/4099` |
| GARA_AP_DELETE_TC_003 | W04-AP Delete | High | Reject xóa kỳ đã CLOSED | AP `id=1025` đang `CLOSED` và không có children | 1. Gửi `DELETE /api/v2/accounting-periods/1025`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail `/1025`. | HTTP 400.<br>Trả `ERR-INV-025` cho kỳ không ở trạng thái OPEN.<br>AP `id=1025` vẫn tồn tại. | P0 | Path: `/1025` |
| GARA_AP_DELETE_TC_004 | W04-AP Delete | High | Reject xóa kỳ có children | YEAR `id=1000` đang có QUARTER/MONTH con | 1. Gửi `DELETE /api/v2/accounting-periods/1000`.<br>2. Kiểm tra lỗi.<br>3. Gọi tree năm 2026. | HTTP 400.<br>Trả `ERR-INV-026` cho kỳ còn children.<br>YEAR và toàn bộ children vẫn tồn tại. | P0 | Path: `/1000` |
| GARA_AP_DELETE_TC_005 | W04-AP Delete | High | Không được xóa AP của tenant khác | Đăng nhập tenant A; AP `id=2026` thuộc tenant B | 1. Gửi `DELETE /api/v2/accounting-periods/2026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response.<br>3. Đăng nhập tenant B và gọi detail `/2026`. | Request tenant A trả HTTP 404.<br>AP tenant B vẫn tồn tại và không đổi. | P0 | Header: `X-Tenant-Id=133`<br>Path: `/2026` |
| GARA_AP_DELETE_TC_006 | W04-AP Delete | High | ID không tồn tại trả 404 | Không có AP `id=99999999` trong tenant A | 1. Gửi DELETE `/99999999`.<br>2. Kiểm tra response. | HTTP 404.<br>Không có side effect. | P0 | Path: `/99999999` |
| GARA_AP_DELETE_TC_007 | W04-AP Delete | High | OPEN leaf có OB liên quan vẫn bị xóa trong W04 | AP `id=5001` đang `OPEN`, không có children, có opening balance liên quan | 1. Gửi DELETE `/5001`.<br>2. Kiểm tra response.<br>3. Gọi detail AP `/5001`.<br>4. Kiểm tra dữ liệu OB liên quan theo module OB nếu có endpoint hỗ trợ. | HTTP 204 theo known gap W04.<br>AP bị xóa dù có OB liên quan.<br>Ghi nhận đây là coverage cho gap guard “has stock data” chưa enforce, không coi là defect trong W04 nếu đúng assumption. | P0 | Path: `/5001` |
| GARA_AP_DELETE_TC_008 | W04-AP Delete | High | User không có quyền AP không được xóa AP | Đăng nhập `no_ap_role.a@gara.test`; AP test `id=4100` OPEN leaf tồn tại | 1. Gửi DELETE `/4100` bằng token user không có quyền AP.<br>2. Kiểm tra response.<br>3. Gọi detail `/4100` bằng owner. | HTTP 403.<br>AP `id=4100` vẫn tồn tại. | P0 | Path: `/4100` |
| GARA_AP_DELETE_TC_009 | W04-AP Delete | Medium | Accountant được xóa AP | Đăng nhập `accountant.ap.a@gara.test` có quyền quản lý AP; AP test `id=4101` OPEN leaf tồn tại | 1. Gửi DELETE `/4101` bằng token accountant.<br>2. Kiểm tra response.<br>3. Gọi detail `/4101`. | HTTP 204.<br>Detail sau xóa trả 404. | P1 | Path: `/4101` |
| GARA_AP_DELETE_TC_010 | W04-AP Delete | High | Thiếu token thì không được xóa | Không gửi `Authorization`; AP `id=4102` OPEN leaf tồn tại | 1. Gửi DELETE `/4102` với `X-Tenant-Id=133` nhưng không có token.<br>2. Kiểm tra response.<br>3. Gọi detail `/4102` bằng owner. | HTTP 401.<br>AP `id=4102` vẫn tồn tại. | P0 | Path: `/4102` |
| GARA_AP_DELETE_TC_011 | W04-AP Delete | Medium | Path id không hợp lệ bị reject | Đăng nhập owner tenant A | 1. Gửi `DELETE /api/v2/accounting-periods/abc`.<br>2. Kiểm tra response. | HTTP 400.<br>Không xóa bất kỳ AP nào. | P2 | Path: `/abc` |
