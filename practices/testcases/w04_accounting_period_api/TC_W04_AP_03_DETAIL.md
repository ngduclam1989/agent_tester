# W04 Accounting Period API - Detail

- API: `GET /api/v2/accounting-periods/{id}`
- Source: `gara/Architecture/api/gf-accounting-api.md` section 4.3; `gara/Execution/wave-specs/W04/Product/features/be/FEAT-AP-DETAIL.md`; `gara/Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`
- Scope: kiểm tra lấy chi tiết kỳ kế toán, breadcrumb, audit fields, tenant isolation, not found và auth.

## Luồng API cần kiểm thử

1. Client gửi JWT tenant user và path `id`.
2. BE validate path `id` là BIGINT, resolve tenant từ security context.
3. BE query `accounting_period` theo `tenantId + id`; tenant mismatch trả như not found.
4. BE build DTO chi tiết gồm parent info, breadcrumb và audit fields.
5. BE trả 200 nếu tìm thấy; trả 404 không leak existence nếu sai tenant/không tồn tại.

## Validate dữ liệu API

| Trường/Header | Rule cần kiểm tra | TC phủ |
|---|---|---|
| `Authorization` | Bắt buộc authenticated tenant user | `GARA_AP_DETAIL_TC_007` |
| `X-Tenant-Id` / tenant context | Lookup theo `tenantId + id`; tenant mismatch trả 404 | `GARA_AP_DETAIL_TC_005` |
| Path `id` | BIGINT hợp lệ | `GARA_AP_DETAIL_TC_006` |
| `id` không tồn tại | Trả `404 ERR-CMN-not-found`, không tạo dữ liệu mới | `GARA_AP_DETAIL_TC_004` |
| Response fields | Trả đủ `id`, `code`, `name`, `type`, `parentId`, `parentName`, `parentBreadcrumb`, `startDate`, `endDate`, `status`, `displayOrder`, `description`, audit fields | `GARA_AP_DETAIL_TC_001`, `GARA_AP_DETAIL_TC_002`, `GARA_AP_DETAIL_TC_003` |
| Feature flag `Inventory:InventoryV2` | Flag OFF trả 403 theo AP controller gate | `GARA_AP_DETAIL_TC_009` |

## Quyền/Auth coverage

| Loại quyền | Expected | TC phủ |
|---|---|---|
| `garage-owner` / owner tenant A | Được xem detail tenant A | `GARA_AP_DETAIL_TC_001` |
| `accountant` tenant A | Được xem detail ngang quyền owner | `GARA_AP_DETAIL_TC_008` |
| Thiếu JWT | HTTP 401 | `GARA_AP_DETAIL_TC_007` |
| Cross-tenant data | Trả 404, không leak existence | `GARA_AP_DETAIL_TC_005` |
| Feature flag OFF | HTTP 403 | `GARA_AP_DETAIL_TC_009` |
| Role gate riêng cho detail | Không có 403 role-based riêng ngoài authenticated + tenant + feature flag theo FEAT-AP-DETAIL | Covered by owner/accountant happy path |

## Dữ liệu nền

- Tenant A: `tenantId=133`, user `owner.ap.a@gara.test`, `accountant.ap.a@gara.test`, `viewer.ap.a@gara.test`.
- Seed tenant A:
  - YEAR `id=1000`, `name=Năm 2026`, `type=YEAR`, `status=OPEN`.
  - QUARTER `id=1020`, `name=Quý 2/2026`, `parentId=1000`, `status=OPEN`.
  - MONTH `id=1026`, `name=Tháng 6/2026`, `parentId=1020`, `status=OPEN`.
- Tenant B: MONTH `id=2026`, `name=Tháng 6/2026 - Tenant B`.

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---:|---|---|---|---|---:|---|
| GARA_AP_DETAIL_TC_001 | W04-AP Detail | High | Lấy chi tiết MONTH thành công kèm breadcrumb | Đăng nhập `owner.ap.a@gara.test`; AP `id=1026` tồn tại trong tenant A | 1. Gửi `GET /api/v2/accounting-periods/1026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response. | HTTP 200.<br>Response đúng `id=1026`, `name=Tháng 6/2026`, `type=MONTH`, `parentId=1020`, `year=2026`, `status=OPEN`.<br>Breadcrumb thể hiện `Năm 2026` -> `Quý 2/2026` -> `Tháng 6/2026`. | P0 | Path: `/1026` |
| GARA_AP_DETAIL_TC_002 | W04-AP Detail | Medium | Lấy chi tiết YEAR root thành công | AP YEAR `id=1000` tồn tại | 1. Gửi `GET /api/v2/accounting-periods/1000`.<br>2. Kiểm tra field cha và breadcrumb. | HTTP 200.<br>`type=YEAR`, `parentId=null`, `parentName=null`, `parentBreadcrumb=[]`.<br>Không có parent giả. | P1 | Path: `/1000` |
| GARA_AP_DETAIL_TC_003 | W04-AP Detail | Medium | Response có audit fields | AP `id=1026` đã được tạo bởi seed script | 1. Gửi detail `id=1026`.<br>2. Kiểm tra audit fields. | HTTP 200.<br>Có `createdAt`, `createdBy`, `updatedAt`, `updatedBy` trong response.<br>Nếu AP chưa từng edit thì `updatedAt=null` và `updatedBy=null` nhưng field không bị omit.<br>Định dạng timestamp hợp lệ khi có giá trị. | P1 | Path: `/1026` |
| GARA_AP_DETAIL_TC_004 | W04-AP Detail | High | ID không tồn tại trả 404 | Không có AP `id=99999999` trong tenant A | 1. Gửi `GET /api/v2/accounting-periods/99999999`.<br>2. Kiểm tra response. | HTTP 404.<br>Trả lỗi not found chuẩn.<br>Không lộ thông tin tenant khác. | P0 | Path: `/99999999` |
| GARA_AP_DETAIL_TC_005 | W04-AP Detail | High | Không lộ dữ liệu cross-tenant | Đăng nhập tenant A; AP `id=2026` thuộc tenant B | 1. Gửi `GET /api/v2/accounting-periods/2026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response. | HTTP 404.<br>Không trả dữ liệu `Tháng 6/2026 - Tenant B`.<br>Không thông báo rằng record thuộc tenant khác. | P0 | Header: `X-Tenant-Id=133`<br>Path: `/2026` |
| GARA_AP_DETAIL_TC_006 | W04-AP Detail | Medium | Path id không hợp lệ bị reject | Đăng nhập tenant A | 1. Gửi `GET /api/v2/accounting-periods/abc`.<br>2. Kiểm tra response. | HTTP 400.<br>Không trả chi tiết AP.<br>Response lỗi theo common validation format. | P2 | Path: `/abc` |
| GARA_AP_DETAIL_TC_007 | W04-AP Detail | High | Thiếu token thì không được xem detail | Không gửi `Authorization` | 1. Gửi `GET /api/v2/accounting-periods/1026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response. | HTTP 401.<br>Không trả chi tiết AP. | P0 | Path: `/1026` |
| GARA_AP_DETAIL_TC_008 | W04-AP Detail | Medium | Accountant được xem chi tiết AP | Đăng nhập `accountant.ap.a@gara.test` có quyền AP | 1. Gửi detail `id=1026` bằng token accountant.<br>2. Kiểm tra response. | HTTP 200.<br>Trả đúng chi tiết AP tenant A. | P1 | User: `accountant.ap.a@gara.test`<br>Path: `/1026` |
| GARA_AP_DETAIL_TC_009 | W04-AP Detail | High | Feature flag `Inventory:InventoryV2` OFF thì bị chặn | Tenant A hợp lệ; feature flag `Inventory:InventoryV2` đang OFF trong môi trường test | 1. Gửi detail `id=1026` bằng token owner tenant A.<br>2. Kiểm tra response.<br>3. Bật lại feature flag sau test. | HTTP 403.<br>Không trả chi tiết AP.<br>Sau cleanup, feature flag được restore ON. | P0 | Feature flag: `Inventory:InventoryV2=OFF`<br>Path: `/1026` |
