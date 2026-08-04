# W04 Accounting Period APIs - Test Cases T?ng H?p

- Project: GARA / W04 Inventory V2 - Accounting Period
- Scope: 7 REST/S2S APIs c?a Accounting Period (AP).
- Input: 7 file test case ri?ng theo t?ng API trong c?ng th? m?c.
- Output schema: `TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data`.
- TC ID trong file t?ng h?p ???c chu?n h?a li?n t?c `GARA_AP_TC_001...`; b?ng mapping cu?i file gi? TC ID g?c theo t?ng API.

## API Scope

| API | File ngu?n | S? TC | TC ID t?ng h?p |
|---|---|---:|---|
| POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md | 12 | GARA_AP_TC_001-GARA_AP_TC_004, GARA_AP_TC_041-GARA_AP_TC_047, GARA_AP_TC_084 |
| POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md | 11 | GARA_AP_TC_005-GARA_AP_TC_012, GARA_AP_TC_048-GARA_AP_TC_049, GARA_AP_TC_085 |
| GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md | 9 | GARA_AP_TC_013-GARA_AP_TC_017, GARA_AP_TC_050, GARA_AP_TC_086-GARA_AP_TC_088 |
| POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md | 26 | GARA_AP_TC_018-GARA_AP_TC_024, GARA_AP_TC_051-GARA_AP_TC_065, GARA_AP_TC_089, GARA_AP_TC_095-GARA_AP_TC_097 |
| PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md | 18 | GARA_AP_TC_025-GARA_AP_TC_032, GARA_AP_TC_066-GARA_AP_TC_074, GARA_AP_TC_090 |
| DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md | 11 | GARA_AP_TC_033-GARA_AP_TC_037, GARA_AP_TC_075-GARA_AP_TC_077, GARA_AP_TC_091, GARA_AP_TC_098-GARA_AP_TC_099 |
| GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md | 14 | GARA_AP_TC_038-GARA_AP_TC_040, GARA_AP_TC_078-GARA_AP_TC_083, GARA_AP_TC_092-GARA_AP_TC_094, GARA_AP_TC_100-GARA_AP_TC_101 |

## Th?ng K?

| Metric | S? l??ng |
|---|---:|
| T?ng test cases | 101 |
| Risk High | 74 |
| Risk Medium | 27 |
| Risk Low | 0 |
| Priority P0 | 75 |
| Priority P1 | 20 |
| Priority P2 | 6 |
| Priority P3 | 0 |
| NH?M FUNCTION | 40 |
| NH?M VALIDATION | 43 |
| NH?M UI & BEHAVIOR | 0 |
| NH?M PH?N QUY?N | 11 |
| NH?M ?NH H??NG CH?C N?NG LI?N QUAN | 7 |

## Test Data Thi?t Y?u

| Nh?m d? li?u | Gi? tr? d?ng trong TC |
|---|---|
| Tenant A | `tenantId=133`, users `owner.ap.a@gara.test`, `accountant.ap.a@gara.test`, `viewer.ap.a@gara.test`, `no_ap_role.a@gara.test` |
| Tenant B | `tenantId=233`, user `owner.ap.b@gara.test` |
| Seed AP 2026 | YEAR `id=1000`, QUARTER `id=1010/1020`, MONTH `id=1011/1025/1026` |
| Delete seeds | MONTH `id=4099`, `4100`, `4101`, `4102`, `5001` |
| Protected API key | `qa-service-key-valid`, negative key `qa-service-key-invalid` |
| Feature flag | `Inventory:InventoryV2` ON m?c ??nh; OFF d?ng cho TC feature-gate |

## Traceability Matrix

| REQ ID | Requirement | API/Module ph? | TC ph? |
|---|---|---|---|
| REQ-01 | Auth, tenant isolation, feature/protected access | All APIs | Nh?m PH?N QUY?N; xem mapping theo API ? b?ng API Scope |
| REQ-02 | Search flat paged AP theo filter/paging/sort | Search | GARA_AP_TC_001-GARA_AP_TC_004, GARA_AP_TC_041-GARA_AP_TC_047, GARA_AP_TC_084 |
| REQ-03 | Tree YEAR->QUARTER->MONTH, search name, cap 500 | Tree | GARA_AP_TC_005-GARA_AP_TC_012, GARA_AP_TC_048-GARA_AP_TC_049, GARA_AP_TC_085 |
| REQ-04 | Detail AP, breadcrumb, audit, not-found | Detail | GARA_AP_TC_013-GARA_AP_TC_017, GARA_AP_TC_050, GARA_AP_TC_086-GARA_AP_TC_088 |
| REQ-05 | Create AP happy path, default, hierarchy, auto-generate | Create | GARA_AP_TC_018-GARA_AP_TC_024, GARA_AP_TC_051-GARA_AP_TC_065, GARA_AP_TC_089, GARA_AP_TC_095-GARA_AP_TC_097 |
| REQ-06 | Edit mutable fields, status transition, immutable guard | Edit | GARA_AP_TC_025-GARA_AP_TC_032, GARA_AP_TC_066-GARA_AP_TC_074, GARA_AP_TC_090 |
| REQ-07 | Delete AP guards OPEN/no-children, idempotency, known OB gap | Delete | GARA_AP_TC_033-GARA_AP_TC_037, GARA_AP_TC_075-GARA_AP_TC_077, GARA_AP_TC_091, GARA_AP_TC_098-GARA_AP_TC_099 |
| REQ-08 | Lock-check S2S date/tenant/period matching | Lock-check | GARA_AP_TC_038-GARA_AP_TC_040, GARA_AP_TC_078-GARA_AP_TC_083, GARA_AP_TC_092-GARA_AP_TC_094, GARA_AP_TC_100-GARA_AP_TC_101 |
| REQ-09 | Error handling common validation and AP/INV error codes | All APIs | Nh?m VALIDATION |

## Ambiguities & Assumptions ?? Ch?t

| ID | N?i dung | C?ch ?p d?ng trong TC |
|---|---|---|
| A-01 | Immutable update d?ng `ERR-AP-001` d? registry c?n pending | Edit immutable cases expect `ERR-AP-001` |
| A-02 | Blank `name` d?ng common validation | Create/Edit blank name expect HTTP 400 validation |
| A-03 | API create kh?ng block n?m qu? kh? n?u `year` kh?p `startDate.year` | Past-year create l? edge case expected 201 |
| A-04 | `availableYears` ch?a ch?t trong tree/search contract | Kh?ng coi thi?u `availableYears` l? fail |
| A-05 | Delete guard stock/OB ch?a enforce trong W04 | OPEN leaf c? OB v?n expected 204, ghi r? known gap |
| A-06 | Lock-check match precedence ?u ti?n MONTH khi nhi?u c?p c?ng cover date | Lock-check precedence case expect MONTH |
| A-07 | No-period lock-check response cho ph?p fields null/absent theo API doc | No-period case assert `locked=false`, period fields null/absent |

## Test Cases Chi Ti?t

### NH?M FUNCTION

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| GARA_AP_TC_001 | W04-AP Search | Medium | Mặc định năm hiện tại khi không truyền `year` | Ngày hệ thống trong năm 2026; đăng nhập tenant A | 1. Gửi search với body chỉ có `page=0`, `size=20`.<br>2. Kiểm tra các item trả về. | 1. HTTP 200.<br>2. API dùng năm hiện tại làm mặc định.<br>3. Các item trả về thuộc `year=2026` và tenant A. | P1 | Body: `{"page":0,"size":20}` |
| GARA_AP_TC_002 | W04-AP Search | Medium | Tìm kiếm theo `name` không phân biệt hoa thường | Có kỳ `Tháng 6/2026` trong tenant A | 1. Gửi search với `name="tháng 6"`, `year=2026`.<br>2. Kiểm tra danh sách trả về. | 1. HTTP 200.<br>2. Kết quả có kỳ `Tháng 6/2026` dù input dùng chữ thường.<br>3. Không trả kỳ của tenant khác. | P1 | Body: `{"name":"tháng 6","year":2026,"page":0,"size":20}` |
| GARA_AP_TC_003 | W04-AP Search | High | Cô lập tenant khi search | Đăng nhập `owner.ap.a@gara.test`; tenant B có dữ liệu `id=2000` | 1. Gửi search với `X-Tenant-Id=133`, `year=2026`, `name="Tenant B"`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. Không trả kỳ `Năm 2026 - Tenant B` hoặc bất kỳ dữ liệu nào thuộc tenant B. | P0 | Header: `X-Tenant-Id=133`<br>Body: `{"name":"Tenant B","year":2026,"page":0,"size":20}` |
| GARA_AP_TC_004 | W04-AP Search | High | Không cho search khi thiếu token | Không gửi `Authorization` | 1. Gửi search với `X-Tenant-Id=133` nhưng không có `Authorization`.<br>2. Kiểm tra response. | 1. HTTP 401.<br>2. Không trả dữ liệu kỳ kế toán. | P0 | Body: `{"year":2026,"page":0,"size":20}` |
| GARA_AP_TC_005 | W04-AP Tree | High | Lấy cây kỳ kế toán theo năm thành công | Đăng nhập `owner.ap.a@gara.test`; dữ liệu tenant A đã seed đủ YEAR/QUARTER/MONTH | 1. Gửi `POST /api/v2/accounting-periods/tree` với `X-Tenant-Id=133`.<br>2. Body truyền `year=2026`.<br>3. Kiểm tra cấu trúc cây. | 1. HTTP 200.<br>2. Response có root `Năm 2026` type `YEAR`.<br>3. YEAR có children là các QUARTER.<br>4. QUARTER có children là các MONTH.<br>5. Mỗi node có thông tin `id`, `name`, `type`, `year`, `startDate`, `endDate`, `status`, `children`. | P0 | Body: `{"year":2026}` |
| GARA_AP_TC_006 | W04-AP Tree | Medium | Mặc định năm hiện tại khi không truyền `year` | Ngày hệ thống trong năm 2026; tenant A có dữ liệu 2026 | 1. Gửi tree với body `{}`.<br>2. Kiểm tra root node. | 1. HTTP 200.<br>2. API trả cây của năm hiện tại 2026.<br>3. Không trả cây của năm khác. | P1 | Body: `{}` |
| GARA_AP_TC_007 | W04-AP Tree | High | Search theo tên trả node khớp kèm ancestor và descendant | Có `Tháng 1/2026` dưới `Quý 1/2026` dưới `Năm 2026` | 1. Gửi tree với `year=2026`, `name="Tháng 1"`.<br>2. Kiểm tra cây trả về. | 1. HTTP 200.<br>2. Cây có node `Tháng 1/2026`.<br>3. Response giữ đủ nhánh cha `Năm 2026` -> `Quý 1/2026` để UI hiển thị context.<br>4. Không trả node không liên quan nếu không nằm trong nhánh match. | P0 | Body: `{"year":2026,"name":"Tháng 1"}` |
| GARA_AP_TC_008 | W04-AP Tree | Medium | Không có dữ liệu phù hợp thì trả cây rỗng | Tenant A không có AP năm 2099 | 1. Gửi tree với `year=2099`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `data.periods=[]` và `data.summary.total=0`.<br>3. Không phát sinh 404. | P2 | Body: `{"year":2099}` |
| GARA_AP_TC_009 | W04-AP Tree | High | Trả 413 khi cây vượt quá 500 node | Tenant A có dataset test năm 2088 với hơn 500 node AP | 1. Gửi tree với `year=2088`.<br>2. Kiểm tra response. | 1. HTTP 413.<br>2. Response thông báo cây quá lớn theo API spec.<br>3. Không trả payload cây quá 500 node. | P0 | Body: `{"year":2088}` |
| GARA_AP_TC_010 | W04-AP Tree | High | Cô lập tenant trong toàn bộ cây | Đăng nhập tenant A; tenant B có `Năm 2026 - Tenant B` | 1. Gửi tree với `X-Tenant-Id=133`, `year=2026`.<br>2. Duyệt toàn bộ root và children. | 1. HTTP 200.<br>2. Không có node `id=2000` hoặc tên `Tenant B` ở bất kỳ cấp nào. | P0 | Header: `X-Tenant-Id=133`<br>Body: `{"year":2026}` |
| GARA_AP_TC_011 | W04-AP Tree | Medium | Không fail nếu response chưa có `availableYears` | FEAT có nhắc `availableYears`, API spec hiện chưa chốt field này | 1. Gửi tree với `year=2026`.<br>2. Kiểm tra response schema chính của tree. | 1. HTTP 200.<br>2. Test chỉ assert tree node chính; không coi thiếu `availableYears` là lỗi.<br>3. Nếu API trả `availableYears` thì giá trị phải là danh sách năm hợp lệ của tenant. | P2 | Body: `{"year":2026}` |
| GARA_AP_TC_012 | W04-AP Tree | Medium | Thiếu token thì không được lấy tree | Không gửi `Authorization` | 1. Gửi tree với `X-Tenant-Id=133`, `year=2026` nhưng không có token.<br>2. Kiểm tra response. | 1. HTTP 401.<br>2. Không trả dữ liệu tree. | P0 | Body: `{"year":2026}` |
| GARA_AP_TC_013 | W04-AP Detail | High | Lấy chi tiết MONTH thành công kèm breadcrumb | Đăng nhập `owner.ap.a@gara.test`; AP `id=1026` tồn tại trong tenant A | 1. Gửi `GET /api/v2/accounting-periods/1026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. Response đúng `id=1026`, `name=Tháng 6/2026`, `type=MONTH`, `parentId=1020`, `year=2026`, `status=OPEN`.<br>3. Breadcrumb thể hiện `Năm 2026` -> `Quý 2/2026` -> `Tháng 6/2026`. | P0 | Path: `/1026` |
| GARA_AP_TC_014 | W04-AP Detail | Medium | Lấy chi tiết YEAR root thành công | AP YEAR `id=1000` tồn tại | 1. Gửi `GET /api/v2/accounting-periods/1000`.<br>2. Kiểm tra field cha và breadcrumb. | 1. HTTP 200.<br>2. `type=YEAR`, `parentId=null`, `parentName=null`, `parentBreadcrumb=[]`.<br>3. Không có parent giả. | P1 | Path: `/1000` |
| GARA_AP_TC_015 | W04-AP Detail | Medium | Response có audit fields | AP `id=1026` đã được tạo bởi seed script | 1. Gửi detail `id=1026`.<br>2. Kiểm tra audit fields. | 1. HTTP 200.<br>2. Có `createdAt`, `createdBy`, `updatedAt`, `updatedBy` trong response.<br>3. Nếu AP chưa từng edit thì `updatedAt=null` và `updatedBy=null` nhưng field không bị omit.<br>4. Định dạng timestamp hợp lệ khi có giá trị. | P1 | Path: `/1026` |
| GARA_AP_TC_016 | W04-AP Detail | High | ID không tồn tại trả 404 | Không có AP `id=99999999` trong tenant A | 1. Gửi `GET /api/v2/accounting-periods/99999999`.<br>2. Kiểm tra response. | 1. HTTP 404.<br>2. Trả lỗi not found chuẩn.<br>3. Không lộ thông tin tenant khác. | P0 | Path: `/99999999` |
| GARA_AP_TC_017 | W04-AP Detail | High | Thiếu token thì không được xem detail | Không gửi `Authorization` | 1. Gửi `GET /api/v2/accounting-periods/1026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response. | 1. HTTP 401.<br>2. Không trả chi tiết AP. | P0 | Path: `/1026` |
| GARA_AP_TC_018 | W04-AP Create | High | Tạo YEAR hợp lệ với đầy đủ field | Đăng nhập `owner.ap.a@gara.test`; năm 2030 chưa tồn tại | 1. Gửi `POST /api/v2/accounting-periods` với `X-Tenant-Id=133`.<br>2. Body tạo YEAR năm 2030, `status=OPEN`, `displayOrder=1`, có `description`.<br>3. Kiểm tra response và gọi detail id mới. | 1. HTTP 201.<br>2. Response trả AP mới `type=YEAR`, `parentId=null`, `year=2030`, `status=OPEN`, `displayOrder=1`.<br>3. Detail id mới trả đúng dữ liệu vừa tạo và audit `createdBy`. | P0 | `{"name":"Năm 2030 - QA","type":"YEAR","parentId":null,"year":2030,"startDate":"2030-01-01","endDate":"2030-12-31","status":"OPEN","displayOrder":1,"description":"QA create full fields","autoGenerateChildren":false}` |
| GARA_AP_TC_019 | W04-AP Create | Medium | Tạo YEAR với các field optional bị thiếu thì dùng default | Đăng nhập owner tenant A; năm 2031 chưa tồn tại | 1. Gửi create YEAR chỉ gồm required fields.<br>2. Kiểm tra response. | 1. HTTP 201.<br>2. `status` default là `OPEN`.<br>3. `displayOrder` default là `0`.<br>4. `description` null/rỗng hợp lệ.<br>5. `autoGenerateChildren` mặc định false. | P1 | `{"name":"Năm 2031 - Minimal","type":"YEAR","year":2031,"startDate":"2031-01-01","endDate":"2031-12-31"}` |
| GARA_AP_TC_020 | W04-AP Create | High | Tạo QUARTER hợp lệ dưới YEAR | YEAR 2032 đã được tạo `id=3000`, chưa có quarter con | 1. Gửi create QUARTER với `parentId=3000`.<br>2. Kiểm tra response.<br>3. Gọi tree năm 2032. | 1. HTTP 201.<br>2. AP mới có `type=QUARTER`, `parentId=3000`, date range nằm trong YEAR cha.<br>3. Tree năm 2032 hiển thị QUARTER dưới YEAR cha. | P0 | `{"name":"Quý 1/2032","type":"QUARTER","parentId":3000,"year":2032,"startDate":"2032-01-01","endDate":"2032-03-31","status":"OPEN","displayOrder":1}` |
| GARA_AP_TC_021 | W04-AP Create | High | Tạo MONTH hợp lệ dưới QUARTER | QUARTER 2032 đã tồn tại `id=3010` | 1. Gửi create MONTH với `parentId=3010`.<br>2. Kiểm tra response.<br>3. Gọi detail id mới. | 1. HTTP 201.<br>2. AP mới có `type=MONTH`, `parentId=3010`, `year=2032`, range nằm trong QUARTER cha.<br>3. Detail trả đúng thông tin. | P0 | `{"name":"Tháng 2/2032","type":"MONTH","parentId":3010,"year":2032,"startDate":"2032-02-01","endDate":"2032-02-28","status":"OPEN","displayOrder":2}` |
| GARA_AP_TC_022 | W04-AP Create | Medium | Tạo kỳ quá khứ vẫn thành công khi date/year hợp lệ | Theo assumption: API không enforce rule UI chỉ cho năm hiện tại/tương lai; năm 2025 chưa tồn tại trong tenant A | 1. Gửi create YEAR năm 2025 hợp lệ.<br>2. Kiểm tra response. | 1. HTTP 201.<br>2. AP năm 2025 được tạo nếu không overlap và `year` khớp `startDate.year`.<br>3. Ghi nhận đây là edge/risk do UI có constraint khác. | P2 | `{"name":"Năm 2025 - Past API Edge","type":"YEAR","year":2025,"startDate":"2025-01-01","endDate":"2025-12-31","status":"OPEN"}` |
| GARA_AP_TC_023 | W04-AP Create | High | User không có quyền AP không được tạo AP | Đăng nhập `no_ap_role.a@gara.test` thuộc tenant A nhưng không có quyền AP | 1. Gửi create YEAR 2038 bằng token user không có quyền AP.<br>2. Kiểm tra response. | 1. HTTP 403.<br>2. Không tạo AP mới. | P0 | `{"name":"Năm 2038 Denied","type":"YEAR","year":2038,"startDate":"2038-01-01","endDate":"2038-12-31"}` |
| GARA_AP_TC_024 | W04-AP Create | High | Thiếu token thì không được tạo AP | Không gửi `Authorization` | 1. Gửi create YEAR hợp lệ với `X-Tenant-Id=133` nhưng không có token.<br>2. Kiểm tra response.<br>3. Search năm 2042 để xác nhận không tạo AP. | 1. HTTP 401.<br>2. Không tạo AP mới. | P0 | `{"name":"Năm 2042 No Token","type":"YEAR","year":2042,"startDate":"2042-01-01","endDate":"2042-12-31"}` |
| GARA_AP_TC_025 | W04-AP Edit | High | Cập nhật toàn bộ mutable fields thành công | Đăng nhập `owner.ap.a@gara.test`; AP `id=1026` thuộc tenant A | 1. Gửi `PUT /api/v2/accounting-periods/1026` với `name`, `description`, `displayOrder`, `status` mới.<br>2. Kiểm tra response.<br>3. Gọi detail `id=1026`. | 1. HTTP 200.<br>2. Các field mutable được cập nhật đúng.<br>3. `updatedAt`, `updatedBy` được ghi nhận.<br>4. Các field immutable giữ nguyên. | P0 | `{"name":"Tháng 6/2026 - Updated","description":"QA update mutable fields","displayOrder":60,"status":"OPEN"}` |
| GARA_AP_TC_026 | W04-AP Edit | Medium | Cập nhật description độ dài tối đa hợp lệ | AP `id=1026` tồn tại; chuẩn field cho phép 500 ký tự | 1. Gửi PUT với `description` dài 500 ký tự.<br>2. Kiểm tra response và detail. | 1. HTTP 200.<br>2. `description` được lưu đầy đủ 500 ký tự.<br>3. Không cắt chuỗi ngoài ý muốn. | P1 | `{"description":"D x 500"}` |
| GARA_AP_TC_027 | W04-AP Edit | High | Đổi trạng thái OPEN sang CLOSED thành công | AP `id=1026` đang `OPEN` | 1. Gửi PUT `status="CLOSED"`.<br>2. Gọi detail `id=1026`.<br>3. Gọi lock-check với date `2026-06-15`. | 1. HTTP 200.<br>2. Detail hiển thị `status=CLOSED`.<br>3. Lock-check cho ngày trong tháng 6 trả `locked=true`. | P0 | `{"status":"CLOSED"}` |
| GARA_AP_TC_028 | W04-AP Edit | High | Đổi trạng thái CLOSED sang OPEN thành công | AP `id=1025` đang `CLOSED` | 1. Gửi PUT `status="OPEN"` cho `id=1025`.<br>2. Gọi detail `id=1025`.<br>3. Gọi lock-check với date `2026-05-15`. | 1. HTTP 200.<br>2. Detail hiển thị `status=OPEN`.<br>3. Lock-check cho ngày trong tháng 5 trả `locked=false`. | P0 | Path: `/1025`<br>Body: `{"status":"OPEN"}` |
| GARA_AP_TC_029 | W04-AP Edit | High | ID không tồn tại trả 404 | Không có AP `id=99999999` trong tenant A | 1. Gửi PUT `/99999999` với body hợp lệ.<br>2. Kiểm tra response. | 1. HTTP 404.<br>2. Không tạo mới record theo kiểu upsert. | P0 | Path: `/99999999`<br>Body: `{"name":"Not Found Update"}` |
| GARA_AP_TC_030 | W04-AP Edit | High | Không được edit AP của tenant khác | Đăng nhập tenant A; AP `id=2026` thuộc tenant B | 1. Gửi PUT `/2026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response.<br>3. Đăng nhập tenant B và gọi detail `/2026`. | 1. Request tenant A trả HTTP 404.<br>2. Dữ liệu tenant B không đổi sau request. | P0 | Path: `/2026`<br>Body: `{"name":"Cross tenant update attempt"}` |
| GARA_AP_TC_031 | W04-AP Edit | High | User không có quyền AP không được edit AP | Đăng nhập `no_ap_role.a@gara.test`; AP `id=1026` tồn tại | 1. Gửi PUT `/1026` bằng token user không có quyền AP.<br>2. Kiểm tra response.<br>3. Gọi detail bằng owner. | 1. HTTP 403.<br>2. AP không bị thay đổi. | P0 | `{"name":"Denied update"}` |
| GARA_AP_TC_032 | W04-AP Edit | High | Thiếu token thì không được edit | Không gửi `Authorization` | 1. Gửi PUT `/1026` với `X-Tenant-Id=133` nhưng không có token.<br>2. Kiểm tra response. | 1. HTTP 401.<br>2. AP không bị thay đổi. | P0 | `{"name":"No token attempt"}` |
| GARA_AP_TC_033 | W04-AP Delete | High | Xóa OPEN leaf không có children thành công | Đăng nhập `owner.ap.a@gara.test`; AP `id=4099` đang `OPEN`, không có children | 1. Gửi `DELETE /api/v2/accounting-periods/4099` với `X-Tenant-Id=133`.<br>2. Kiểm tra response.<br>3. Gọi detail `/4099`. | 1. HTTP 204, body rỗng.<br>2. Detail sau xóa trả HTTP 404.<br>3. Tree/search không còn AP `id=4099`. | P0 | Path: `/4099` |
| GARA_AP_TC_034 | W04-AP Delete | High | Không được xóa AP của tenant khác | Đăng nhập tenant A; AP `id=2026` thuộc tenant B | 1. Gửi `DELETE /api/v2/accounting-periods/2026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response.<br>3. Đăng nhập tenant B và gọi detail `/2026`. | 1. Request tenant A trả HTTP 404.<br>2. AP tenant B vẫn tồn tại và không đổi. | P0 | Header: `X-Tenant-Id=133`<br>Path: `/2026` |
| GARA_AP_TC_035 | W04-AP Delete | High | ID không tồn tại trả 404 | Không có AP `id=99999999` trong tenant A | 1. Gửi DELETE `/99999999`.<br>2. Kiểm tra response. | 1. HTTP 404.<br>2. Không có side effect. | P0 | Path: `/99999999` |
| GARA_AP_TC_036 | W04-AP Delete | High | User không có quyền AP không được xóa AP | Đăng nhập `no_ap_role.a@gara.test`; AP test `id=4100` OPEN leaf tồn tại | 1. Gửi DELETE `/4100` bằng token user không có quyền AP.<br>2. Kiểm tra response.<br>3. Gọi detail `/4100` bằng owner. | 1. HTTP 403.<br>2. AP `id=4100` vẫn tồn tại. | P0 | Path: `/4100` |
| GARA_AP_TC_037 | W04-AP Delete | High | Thiếu token thì không được xóa | Không gửi `Authorization`; AP `id=4102` OPEN leaf tồn tại | 1. Gửi DELETE `/4102` với `X-Tenant-Id=133` nhưng không có token.<br>2. Kiểm tra response.<br>3. Gọi detail `/4102` bằng owner. | 1. HTTP 401.<br>2. AP `id=4102` vẫn tồn tại. | P0 | Path: `/4102` |
| GARA_AP_TC_038 | W04-AP Lock Check | High | Không có kỳ cover date trả unlocked và period null | Tenant A không có AP cover năm 2099 | 1. Gửi lock-check date `2099-01-01`, tenant A.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `locked=false`.<br>3. `period` null hoặc các field period optional vắng mặt/null theo API doc.<br>4. Không trả lỗi 404. | P0 | Query: `date=2099-01-01`, `tenantId=133` |
| GARA_AP_TC_039 | W04-AP Lock Check | High | Ưu tiên MONTH khi cùng ngày match YEAR/QUARTER/MONTH | Ngày `2026-01-15` nằm trong YEAR 2026, Q1/2026 và Tháng 1/2026 | 1. Gửi lock-check date `2026-01-15`, tenant A.<br>2. Kiểm tra period được chọn. | 1. HTTP 200.<br>2. Period match là MONTH `id=1011`, không phải YEAR hoặc QUARTER.<br>3. `locked=true` vì MONTH đang CLOSED. | P0 | Query: `date=2026-01-15`, `tenantId=133` |
| GARA_AP_TC_040 | W04-AP Lock Check | High | Cô lập tenant trong lock-check | Tenant A có AP cover `2026-06-15`; tenant B không có AP cover ngày này | 1. Gửi lock-check `date=2026-06-15&tenantId=233` với API key hợp lệ.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `locked=false` và period null/absent cho tenant B.<br>3. Không trả period `id=1026` của tenant A. | P0 | Query: `date=2026-06-15`, `tenantId=233` |

### NH?M VALIDATION

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| GARA_AP_TC_041 | W04-AP Search | High | Tìm kiếm thành công với đầy đủ filter, paging và sort | Đăng nhập `owner.ap.a@gara.test`; dữ liệu tenant A đã seed | 1. Gửi `POST /api/v2/accounting-periods/search` với `Authorization` hợp lệ và `X-Tenant-Id=133`.<br>2. Body gồm `year=2026`, `types=["MONTH"]`, `statuses=["OPEN"]`, `page=0`, `size=50`, `sort="startDate,desc"`.<br>3. Kiểm tra response. | 1. HTTP 200.<br>2. Danh sách chỉ gồm kỳ `MONTH`, `OPEN`, `year=2026` của tenant A.<br>3. Có item `Tháng 6/2026`.<br>4. Response có thông tin paging đúng `page=0`, `size=50`; dữ liệu được sắp xếp theo `startDate desc`. | P0 | Body: `{"year":2026,"types":["MONTH"],"statuses":["OPEN"],"page":0,"size":50,"sort":"startDate,desc"}` |
| GARA_AP_TC_042 | W04-AP Search | Medium | Lọc đồng thời nhiều `types` và nhiều `statuses` | Tenant A có YEAR OPEN, QUARTER CLOSED, MONTH OPEN | 1. Gửi search với `types=["YEAR","QUARTER"]`, `statuses=["OPEN","CLOSED"]`, `year=2026`.<br>2. Kiểm tra từng item. | 1. HTTP 200.<br>2. Kết quả chỉ thuộc `YEAR` hoặc `QUARTER` và status thuộc `OPEN` hoặc `CLOSED`.<br>3. Không có `MONTH` trong kết quả. | P1 | Body: `{"year":2026,"types":["YEAR","QUARTER"],"statuses":["OPEN","CLOSED"],"page":0,"size":20}` |
| GARA_AP_TC_043 | W04-AP Search | High | Reject `page` âm | Đăng nhập tenant A | 1. Gửi search với `page=-1`, `size=20`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả lỗi validation theo chuẩn common error.<br>3. Không trả dữ liệu list. | P0 | Body: `{"year":2026,"page":-1,"size":20}` |
| GARA_AP_TC_044 | W04-AP Search | High | Reject `size` lớn hơn 100 | Đăng nhập tenant A | 1. Gửi search với `size=101`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả lỗi validation theo rule `size <= 100`.<br>3. Không trả dữ liệu list. | P0 | Body: `{"year":2026,"page":0,"size":101}` |
| GARA_AP_TC_045 | W04-AP Search | High | Reject `year` ngoài khoảng 2000-2100 | Đăng nhập tenant A | 1. Gửi search với `year=1999`.<br>2. Gửi lại với `year=2101`.<br>3. Kiểm tra lỗi của từng request. | 1. Cả 2 request trả HTTP 400.<br>2. Trả lỗi validation cho `year` ngoài khoảng hợp lệ. | P0 | Body 1: `{"year":1999,"page":0,"size":20}`<br>Body 2: `{"year":2101,"page":0,"size":20}` |
| GARA_AP_TC_046 | W04-AP Search | High | Reject enum không hợp lệ trong `types` hoặc `statuses` | Đăng nhập owner tenant A | 1. Gửi search với `types=["WEEK"]`.<br>2. Gửi search với `statuses=["LOCKED"]`.<br>3. Kiểm tra từng response. | 1. Mỗi request trả HTTP 400.<br>2. Response là common validation/enum parse error.<br>3. Không trả dữ liệu list. | P0 | Body 1: `{"year":2026,"types":["WEEK"],"page":0,"size":20}`<br>Body 2: `{"year":2026,"statuses":["LOCKED"],"page":0,"size":20}` |
| GARA_AP_TC_047 | W04-AP Search | Medium | Reject `sort` sai format hoặc field không hỗ trợ | Đăng nhập owner tenant A | 1. Gửi search với `sort="unknownField,desc"`.<br>2. Gửi search với `sort="startDate,down"`.<br>3. Kiểm tra từng response. | 1. Mỗi request trả HTTP 400.<br>2. Trả lỗi validation cho sort không hợp lệ.<br>3. Không trả dữ liệu list. | P1 | Body 1: `{"year":2026,"page":0,"size":20,"sort":"unknownField,desc"}`<br>Body 2: `{"year":2026,"page":0,"size":20,"sort":"startDate,down"}` |
| GARA_AP_TC_048 | W04-AP Tree | High | Reject `name` dài hơn 255 ký tự | Đăng nhập tenant A | 1. Gửi tree với `name` dài 256 ký tự.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả lỗi validation cho `name` vượt quá 255 ký tự. | P0 | Body: `{"year":2026,"name":"A x 256"}` |
| GARA_AP_TC_049 | W04-AP Tree | High | Reject `year` ngoài khoảng 2000-2100 | Đăng nhập tenant A | 1. Gửi tree với `year=1999`.<br>2. Gửi tree với `year=2101`.<br>3. Kiểm tra từng response. | 1. Cả 2 request trả HTTP 400.<br>2. Trả lỗi validation cho `year`. | P0 | Body 1: `{"year":1999}`<br>Body 2: `{"year":2101}` |
| GARA_AP_TC_050 | W04-AP Detail | Medium | Path id không hợp lệ bị reject | Đăng nhập tenant A | 1. Gửi `GET /api/v2/accounting-periods/abc`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Không trả chi tiết AP.<br>3. Response lỗi theo common validation format. | P2 | Path: `/abc` |
| GARA_AP_TC_051 | W04-AP Create | High | Reject blank `name` | Đăng nhập owner tenant A | 1. Gửi create YEAR với `name` chỉ gồm khoảng trắng.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả lỗi common validation cho `name` blank theo assumption đã chốt.<br>3. Không tạo AP mới. | P0 | `{"name":"   ","type":"YEAR","year":2033,"startDate":"2033-01-01","endDate":"2033-12-31"}` |
| GARA_AP_TC_052 | W04-AP Create | High | Reject `type` không thuộc enum | Đăng nhập owner tenant A | 1. Gửi create với `type="WEEK"`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả lỗi validation cho enum `type`.<br>3. Không tạo AP mới. | P0 | `{"name":"Tuần 1/2033","type":"WEEK","year":2033,"startDate":"2033-01-01","endDate":"2033-01-07"}` |
| GARA_AP_TC_053 | W04-AP Create | High | Reject YEAR có `parentId` | YEAR không được có parent | 1. Gửi create YEAR với `parentId=1000`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả lỗi `ERR-INV-022` cho parent không hợp lệ.<br>3. Không tạo AP mới. | P0 | `{"name":"Năm 2034 sai parent","type":"YEAR","parentId":1000,"year":2034,"startDate":"2034-01-01","endDate":"2034-12-31"}` |
| GARA_AP_TC_054 | W04-AP Create | High | Reject QUARTER thiếu parent | Đăng nhập owner tenant A | 1. Gửi create QUARTER không truyền `parentId`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả `ERR-INV-022` cho parent bắt buộc theo hierarchy.<br>3. Không tạo AP mới. | P0 | `{"name":"Quý 1/2034","type":"QUARTER","year":2034,"startDate":"2034-01-01","endDate":"2034-03-31"}` |
| GARA_AP_TC_055 | W04-AP Create | High | Reject MONTH có parent không phải QUARTER | AP `id=1000` là YEAR | 1. Gửi create MONTH với `parentId=1000`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả `ERR-INV-022` cho parent/type hierarchy không hợp lệ.<br>3. Không tạo MONTH. | P0 | `{"name":"Tháng sai parent","type":"MONTH","parentId":1000,"year":2026,"startDate":"2026-07-01","endDate":"2026-07-31"}` |
| GARA_AP_TC_056 | W04-AP Create | High | Reject `endDate` nhỏ hơn `startDate` | Đăng nhập owner tenant A | 1. Gửi create YEAR với `startDate=2034-12-31`, `endDate=2034-01-01`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả `ERR-INV-021` cho date range không hợp lệ.<br>3. Không tạo AP mới. | P0 | `{"name":"Năm 2034 invalid date","type":"YEAR","year":2034,"startDate":"2034-12-31","endDate":"2034-01-01"}` |
| GARA_AP_TC_057 | W04-AP Create | High | Reject child date range nằm ngoài parent | QUARTER Q2/2026 là `id=1020`, range `2026-04-01` đến `2026-06-30` | 1. Gửi create MONTH dưới `parentId=1020` nhưng `startDate=2026-07-01`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả `ERR-INV-022` cho child range ngoài parent.<br>3. Không tạo MONTH. | P0 | `{"name":"Tháng ngoài Q2","type":"MONTH","parentId":1020,"year":2026,"startDate":"2026-07-01","endDate":"2026-07-31"}` |
| GARA_AP_TC_058 | W04-AP Create | High | Reject overlap giữa các sibling cùng parent | Q1/2026 đã tồn tại dưới YEAR `id=1000`, range `2026-01-01` đến `2026-03-31` | 1. Gửi create QUARTER mới dưới `parentId=1000` với range overlap Q1.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả `ERR-INV-023` cho overlap sibling.<br>3. Không tạo QUARTER mới. | P0 | `{"name":"Quý overlap 2026","type":"QUARTER","parentId":1000,"year":2026,"startDate":"2026-02-01","endDate":"2026-04-30"}` |
| GARA_AP_TC_059 | W04-AP Create | High | Reject `year` không khớp `startDate.year` | Đăng nhập owner tenant A | 1. Gửi create YEAR với `year=2033`, `startDate=2034-01-01`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả common validation cho mismatch giữa `year` và năm của `startDate`.<br>3. Không tạo AP mới. | P0 | `{"name":"Mismatch year","type":"YEAR","year":2033,"startDate":"2034-01-01","endDate":"2034-12-31"}` |
| GARA_AP_TC_060 | W04-AP Create | High | Reject thiếu required `year` | Đăng nhập owner tenant A | 1. Gửi create YEAR không có field `year`.<br>2. Kiểm tra response.<br>3. Search năm 2039 để xác nhận không tạo nhầm. | 1. HTTP 400.<br>2. Trả common validation cho `year` required.<br>3. Không tạo AP mới. | P0 | `{"name":"Năm 2039 Missing Year","type":"YEAR","startDate":"2039-01-01","endDate":"2039-12-31"}` |
| GARA_AP_TC_061 | W04-AP Create | High | Reject `name` dài hơn 255 ký tự | Đăng nhập owner tenant A | 1. Gửi create YEAR với `name` dài 256 ký tự.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả common validation cho `name` vượt quá 255 ký tự.<br>3. Không tạo AP mới. | P0 | `{"name":"N x 256","type":"YEAR","year":2039,"startDate":"2039-01-01","endDate":"2039-12-31"}` |
| GARA_AP_TC_062 | W04-AP Create | Medium | Reject `description` dài hơn 500 ký tự | Đăng nhập owner tenant A | 1. Gửi create YEAR với `description` dài 501 ký tự.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả common validation cho `description` vượt quá 500 ký tự.<br>3. Không tạo AP mới. | P1 | `{"name":"Năm 2040 Desc Long","type":"YEAR","year":2040,"startDate":"2040-01-01","endDate":"2040-12-31","description":"D x 501"}` |
| GARA_AP_TC_063 | W04-AP Create | High | Reject `status` không thuộc enum | Đăng nhập owner tenant A | 1. Gửi create YEAR với `status="LOCKED"`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả common validation/enum parse error cho `status`.<br>3. Không tạo AP mới. | P0 | `{"name":"Năm 2041 Bad Status","type":"YEAR","year":2041,"startDate":"2041-01-01","endDate":"2041-12-31","status":"LOCKED"}` |
| GARA_AP_TC_064 | W04-AP Create | High | Reject `autoGenerateChildren=true` cho MONTH | QUARTER `id=1020` tồn tại trong tenant A | 1. Gửi create MONTH dưới `parentId=1020` với `autoGenerateChildren=true`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả validation generic cho `autoGenerateChildren` không hợp lệ với `type=MONTH`.<br>3. Không tạo MONTH và không sinh child. | P0 | `{"name":"Tháng auto invalid","type":"MONTH","parentId":1020,"year":2026,"startDate":"2026-07-01","endDate":"2026-07-31","autoGenerateChildren":true}` |
| GARA_AP_TC_065 | W04-AP Create | High | Reject dùng `parentId` thuộc tenant khác | Đăng nhập owner tenant A; `parentId=2000` là YEAR của tenant B | 1. Gửi create QUARTER với `X-Tenant-Id=133` và `parentId=2000`.<br>2. Kiểm tra response.<br>3. Đăng nhập tenant B và gọi detail `/2000` để xác nhận không đổi. | 1. HTTP 400.<br>2. Trả `ERR-INV-022` cho parent không hợp lệ trong tenant hiện tại.<br>3. Không tạo QUARTER trong tenant A và không leak thông tin chi tiết parent tenant B. | P0 | `{"name":"Quý cross tenant","type":"QUARTER","parentId":2000,"year":2026,"startDate":"2026-01-01","endDate":"2026-03-31"}` |
| GARA_AP_TC_066 | W04-AP Edit | High | Reject blank `name` khi edit | AP `id=1026` tồn tại | 1. Gửi PUT với `name=" "`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail để xác nhận dữ liệu cũ không đổi. | 1. HTTP 400.<br>2. Trả common validation cho `name` blank.<br>3. AP không bị cập nhật partial. | P0 | `{"name":" ","description":"Should not update"}` |
| GARA_AP_TC_067 | W04-AP Edit | High | Reject cập nhật immutable `type` | AP `id=1026` tồn tại | 1. Gửi PUT có field `type="QUARTER"`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail xác nhận `type` vẫn là `MONTH`. | 1. HTTP 400.<br>2. Trả `ERR-AP-001` cho immutable field.<br>3. Không cập nhật field nào trong request. | P0 | `{"type":"QUARTER","name":"Attempt immutable type"}` |
| GARA_AP_TC_068 | W04-AP Edit | High | Reject cập nhật immutable `parentId` | AP `id=1026` tồn tại | 1. Gửi PUT có `parentId=1010`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail xác nhận `parentId` không đổi. | 1. HTTP 400.<br>2. Trả `ERR-AP-001`.<br>3. `parentId` vẫn là `1020`. | P0 | `{"parentId":1010}` |
| GARA_AP_TC_069 | W04-AP Edit | High | Reject cập nhật immutable `startDate` và `endDate` | AP `id=1026` tồn tại | 1. Gửi PUT có `startDate` hoặc `endDate` mới.<br>2. Kiểm tra lỗi.<br>3. Gọi detail xác nhận date range không đổi. | 1. HTTP 400.<br>2. Trả `ERR-AP-001`.<br>3. `startDate=2026-06-01`, `endDate=2026-06-30` không đổi. | P0 | `{"startDate":"2026-06-02","endDate":"2026-06-29"}` |
| GARA_AP_TC_070 | W04-AP Edit | High | Reject cập nhật immutable `autoGenerateChildren` | AP `id=1026` tồn tại | 1. Gửi PUT có `autoGenerateChildren=true`.<br>2. Kiểm tra lỗi. | 1. HTTP 400.<br>2. Trả `ERR-AP-001`.<br>3. Không sinh thêm child và không cập nhật AP. | P0 | `{"autoGenerateChildren":true}` |
| GARA_AP_TC_071 | W04-AP Edit | High | Reject `name` dài hơn 255 ký tự | AP `id=1026` tồn tại | 1. Gửi PUT với `name` dài 256 ký tự.<br>2. Kiểm tra response.<br>3. Gọi detail để xác nhận tên cũ không đổi. | 1. HTTP 400.<br>2. Trả common validation cho `name` vượt quá 255 ký tự.<br>3. AP không bị cập nhật partial. | P0 | `{"name":"N x 256"}` |
| GARA_AP_TC_072 | W04-AP Edit | Medium | Reject `description` dài hơn 500 ký tự | AP `id=1026` tồn tại | 1. Gửi PUT với `description` dài 501 ký tự.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả common validation cho `description` vượt quá 500 ký tự.<br>3. AP không bị cập nhật. | P1 | `{"description":"D x 501"}` |
| GARA_AP_TC_073 | W04-AP Edit | High | Reject `status` không thuộc enum | AP `id=1026` tồn tại | 1. Gửi PUT với `status="LOCKED"`.<br>2. Kiểm tra response.<br>3. Gọi detail để xác nhận status cũ không đổi. | 1. HTTP 400.<br>2. Trả common validation/enum parse error cho `status`.<br>3. AP không bị cập nhật. | P0 | `{"status":"LOCKED"}` |
| GARA_AP_TC_074 | W04-AP Edit | Medium | Path id không hợp lệ bị reject | Đăng nhập owner tenant A | 1. Gửi `PUT /api/v2/accounting-periods/abc` với body hợp lệ.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Không cập nhật bất kỳ AP nào. | P2 | Path: `/abc`<br>Body: `{"name":"Invalid path id"}` |
| GARA_AP_TC_075 | W04-AP Delete | High | Reject xóa kỳ đã CLOSED | AP `id=1025` đang `CLOSED` và không có children | 1. Gửi `DELETE /api/v2/accounting-periods/1025`.<br>2. Kiểm tra lỗi.<br>3. Gọi detail `/1025`. | 1. HTTP 400.<br>2. Trả `ERR-INV-025` cho kỳ không ở trạng thái OPEN.<br>3. AP `id=1025` vẫn tồn tại. | P0 | Path: `/1025` |
| GARA_AP_TC_076 | W04-AP Delete | High | Reject xóa kỳ có children | YEAR `id=1000` đang có QUARTER/MONTH con | 1. Gửi `DELETE /api/v2/accounting-periods/1000`.<br>2. Kiểm tra lỗi.<br>3. Gọi tree năm 2026. | 1. HTTP 400.<br>2. Trả `ERR-INV-026` cho kỳ còn children.<br>3. YEAR và toàn bộ children vẫn tồn tại. | P0 | Path: `/1000` |
| GARA_AP_TC_077 | W04-AP Delete | Medium | Path id không hợp lệ bị reject | Đăng nhập owner tenant A | 1. Gửi `DELETE /api/v2/accounting-periods/abc`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Không xóa bất kỳ AP nào. | P2 | Path: `/abc` |
| GARA_AP_TC_078 | W04-AP Lock Check | High | Ngày thuộc MONTH CLOSED trả locked true | API key hợp lệ; MONTH `Tháng 1/2026` đang `CLOSED` | 1. Gửi `GET /protected/v1/accounting-periods/lock-check?date=2026-01-15&tenantId=133` với `X-API-Key=qa-service-key-valid`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `locked=true`.<br>3. Response xác định period match là `id=1011`, `type=MONTH`, `status=CLOSED`.<br>4. Có thông tin ngày/kỳ đủ cho caller quyết định chặn nghiệp vụ. | P0 | Query: `date=2026-01-15`, `tenantId=133` |
| GARA_AP_TC_079 | W04-AP Lock Check | High | Ngày thuộc MONTH OPEN trả locked false | API key hợp lệ; MONTH `Tháng 6/2026` đang `OPEN` | 1. Gửi lock-check date `2026-06-15`, tenant A.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `locked=false`.<br>3. Period match là `id=1026`, `type=MONTH`, `status=OPEN`. | P0 | Query: `date=2026-06-15`, `tenantId=133` |
| GARA_AP_TC_080 | W04-AP Lock Check | High | Thiếu `date` bị reject | API key hợp lệ | 1. Gửi `GET /protected/v1/accounting-periods/lock-check?tenantId=133`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả lỗi validation cho query param `date` bắt buộc. | P0 | Query: `tenantId=133` |
| GARA_AP_TC_081 | W04-AP Lock Check | High | `date` sai format bị reject | API key hợp lệ | 1. Gửi lock-check với `date=15-06-2026`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả lỗi validation cho định dạng ISO date.<br>3. Không thực hiện lookup period. | P0 | Query: `date=15-06-2026`, `tenantId=133` |
| GARA_AP_TC_082 | W04-AP Lock Check | High | Thiếu cả query `tenantId` và header tenant bị reject | API key hợp lệ; không gửi `X-Tenant-Id` | 1. Gửi `GET /protected/v1/accounting-periods/lock-check?date=2026-06-15`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả lỗi validation cho tenant scope bắt buộc. | P0 | Query: `date=2026-06-15` |
| GARA_AP_TC_083 | W04-AP Lock Check | High | `tenantId` sai format bị reject | API key hợp lệ | 1. Gửi lock-check với `tenantId=abc`.<br>2. Kiểm tra response. | 1. HTTP 400.<br>2. Trả validation cho `tenantId` không phải BIGINT.<br>3. Không thực hiện lookup period. | P0 | Query: `date=2026-06-15`, `tenantId=abc` |

### NH?M UI & BEHAVIOR

_Kh?ng c? TC API-only thu?c nh?m n?y. UI & Behavior ???c cover ? FE Web/Mobile test suite ri?ng n?u c?n._

### NH?M PH?N QUY?N

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| GARA_AP_TC_084 | W04-AP Search | Medium | Accountant có thể search AP | Đăng nhập `accountant.ap.a@gara.test` có quyền AP | 1. Gửi search với `Authorization` của accountant và `X-Tenant-Id=133`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. Dữ liệu chỉ thuộc tenant A. | P1 | Body: `{"year":2026,"page":0,"size":20}` |
| GARA_AP_TC_085 | W04-AP Tree | Medium | Accountant có thể lấy tree AP | Đăng nhập `accountant.ap.a@gara.test` có quyền AP | 1. Gửi tree với token accountant, `X-Tenant-Id=133`, `year=2026`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. Tree chỉ chứa dữ liệu tenant A.<br>3. Response shape giống owner với cùng filter. | P1 | User: `accountant.ap.a@gara.test`<br>Body: `{"year":2026}` |
| GARA_AP_TC_086 | W04-AP Detail | High | Không lộ dữ liệu cross-tenant | Đăng nhập tenant A; AP `id=2026` thuộc tenant B | 1. Gửi `GET /api/v2/accounting-periods/2026` với `X-Tenant-Id=133`.<br>2. Kiểm tra response. | 1. HTTP 404.<br>2. Không trả dữ liệu `Tháng 6/2026 - Tenant B`.<br>3. Không thông báo rằng record thuộc tenant khác. | P0 | Header: `X-Tenant-Id=133`<br>Path: `/2026` |
| GARA_AP_TC_087 | W04-AP Detail | Medium | Accountant được xem chi tiết AP | Đăng nhập `accountant.ap.a@gara.test` có quyền AP | 1. Gửi detail `id=1026` bằng token accountant.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. Trả đúng chi tiết AP tenant A. | P1 | User: `accountant.ap.a@gara.test`<br>Path: `/1026` |
| GARA_AP_TC_088 | W04-AP Detail | High | Feature flag `Inventory:InventoryV2` OFF thì bị chặn | Tenant A hợp lệ; feature flag `Inventory:InventoryV2` đang OFF trong môi trường test | 1. Gửi detail `id=1026` bằng token owner tenant A.<br>2. Kiểm tra response.<br>3. Bật lại feature flag sau test. | 1. HTTP 403.<br>2. Không trả chi tiết AP.<br>3. Sau cleanup, feature flag được restore ON. | P0 | Feature flag: `Inventory:InventoryV2=OFF`<br>Path: `/1026` |
| GARA_AP_TC_089 | W04-AP Create | Medium | Accountant được tạo AP | Đăng nhập `accountant.ap.a@gara.test`; năm 2043 chưa tồn tại | 1. Gửi create YEAR 2043 bằng token accountant.<br>2. Kiểm tra response.<br>3. Gọi detail id mới. | 1. HTTP 201.<br>2. AP mới được tạo trong tenant A.<br>3. Audit `createdBy` ghi user accountant. | P1 | `{"name":"Năm 2043 Accountant","type":"YEAR","year":2043,"startDate":"2043-01-01","endDate":"2043-12-31"}` |
| GARA_AP_TC_090 | W04-AP Edit | Medium | Accountant được edit mutable fields | Đăng nhập `accountant.ap.a@gara.test` có quyền quản lý AP | 1. Gửi PUT `/1026` với `description` mới.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `description` được cập nhật và audit ghi user accountant. | P1 | `{"description":"Updated by accountant role"}` |
| GARA_AP_TC_091 | W04-AP Delete | Medium | Accountant được xóa AP | Đăng nhập `accountant.ap.a@gara.test` có quyền quản lý AP; AP test `id=4101` OPEN leaf tồn tại | 1. Gửi DELETE `/4101` bằng token accountant.<br>2. Kiểm tra response.<br>3. Gọi detail `/4101`. | 1. HTTP 204.<br>2. Detail sau xóa trả 404. | P1 | Path: `/4101` |
| GARA_AP_TC_092 | W04-AP Lock Check | High | Thiếu API key bị chặn | Không gửi `X-API-Key` | 1. Gửi lock-check date `2026-06-15`, tenant A nhưng thiếu API key.<br>2. Kiểm tra response. | 1. HTTP 401.<br>2. Không trả thông tin kỳ kế toán. | P0 | Query: `date=2026-06-15`, `tenantId=133` |
| GARA_AP_TC_093 | W04-AP Lock Check | High | API key sai bị chặn | Gửi `X-API-Key=qa-service-key-invalid` | 1. Gửi lock-check date `2026-06-15`, tenant A với API key sai.<br>2. Kiểm tra response. | 1. HTTP 401.<br>2. Không trả thông tin kỳ kế toán. | P0 | Header: `X-API-Key=qa-service-key-invalid` |
| GARA_AP_TC_094 | W04-AP Lock Check | Medium | Dùng `X-Tenant-Id` header khi không truyền query `tenantId` | API key hợp lệ; header `X-Tenant-Id=133` được protected contract chấp nhận | 1. Gửi lock-check với query chỉ có `date=2026-06-15` và header `X-Tenant-Id=133`.<br>2. Kiểm tra response. | 1. HTTP 200.<br>2. `locked=false`.<br>3. Period match là `id=1026` của tenant A.<br>4. Không cần JWT user. | P1 | Header: `X-API-Key=qa-service-key-valid`, `X-Tenant-Id=133`<br>Query: `date=2026-06-15` |

### NH?M ?NH H??NG CH?C N?NG LI?N QUAN

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
| GARA_AP_TC_095 | W04-AP Create | High | Auto-generate children cho YEAR thành công và atomic | Năm 2035 chưa tồn tại; không có AP con liên quan | 1. Gửi create YEAR 2035 với `autoGenerateChildren=true`.<br>2. Gọi tree năm 2035.<br>3. Kiểm tra số node và hierarchy. | 1. HTTP 201.<br>2. Tree năm 2035 có 1 YEAR, 4 QUARTER và 12 MONTH được sinh tự động.<br>3. Các child có date range đúng theo quý/tháng.<br>4. Nếu bất kỳ child lỗi thì transaction rollback toàn bộ. | P0 | `{"name":"Năm 2035 Auto","type":"YEAR","year":2035,"startDate":"2035-01-01","endDate":"2035-12-31","autoGenerateChildren":true}` |
| GARA_AP_TC_096 | W04-AP Create | High | Auto-generate MONTH cho QUARTER thành công | YEAR 2036 đã tồn tại `id=3600`; chưa có child trong Q3 | 1. Gửi create QUARTER Q3/2036 với `autoGenerateChildren=true`.<br>2. Gọi tree năm 2036.<br>3. Kiểm tra children dưới Q3. | 1. HTTP 201.<br>2. QUARTER mới được tạo dưới YEAR 2036.<br>3. API tự sinh 3 MONTH tương ứng tháng 7, 8, 9/2036.<br>4. Các child có parent là QUARTER mới. | P0 | `{"name":"Quý 3/2036 Auto","type":"QUARTER","parentId":3600,"year":2036,"startDate":"2036-07-01","endDate":"2036-09-30","autoGenerateChildren":true}` |
| GARA_AP_TC_097 | W04-AP Create | High | Concurrent create overlap chỉ một request được thành công | YEAR 2037 tồn tại `id=3700`; chưa có QUARTER con | 1. Gửi đồng thời 2 request create QUARTER dưới `parentId=3700` với date range overlap nhau.<br>2. Kiểm tra cả 2 response.<br>3. Gọi tree năm 2037. | 1. Chỉ một request HTTP 201.<br>2. Request còn lại HTTP 400 với `ERR-INV-023`.<br>3. Tree không có 2 sibling overlap. | P0 | Req A: `2037-01-01` đến `2037-03-31`<br>Req B: `2037-02-01` đến `2037-04-30` |
| GARA_AP_TC_098 | W04-AP Delete | Medium | Xóa lại cùng ID sau khi đã xóa trả 404 | Đã chạy thành công `GARA_AP_DELETE_TC_001` | 1. Gửi lại `DELETE /api/v2/accounting-periods/4099`.<br>2. Kiểm tra response. | 1. HTTP 404.<br>2. Không có side effect phát sinh. | P1 | Path: `/4099` |
| GARA_AP_TC_099 | W04-AP Delete | High | OPEN leaf có OB liên quan vẫn bị xóa trong W04 | AP `id=5001` đang `OPEN`, không có children, có opening balance liên quan | 1. Gửi DELETE `/5001`.<br>2. Kiểm tra response.<br>3. Gọi detail AP `/5001`.<br>4. Kiểm tra dữ liệu OB liên quan theo module OB nếu có endpoint hỗ trợ. | 1. HTTP 204 theo known gap W04.<br>2. AP bị xóa dù có OB liên quan.<br>3. Ghi nhận đây là coverage cho gap guard “has stock data” chưa enforce, không coi là defect trong W04 nếu đúng assumption. | P0 | Path: `/5001` |
| GARA_AP_TC_100 | W04-AP Lock Check | Medium | API idempotent, gọi lặp không thay đổi dữ liệu AP | API key hợp lệ; date `2026-06-15` match MONTH OPEN | 1. Gọi lock-check cùng query 2 lần liên tiếp.<br>2. So sánh response chính.<br>3. Gọi detail AP `id=1026` bằng API quản trị. | 1. Cả 2 lần HTTP 200 và cùng giá trị `locked=false`, same period id.<br>2. Detail AP không thay đổi audit/status do lock-check chỉ đọc. | P1 | Query: `date=2026-06-15`, `tenantId=133` |
| GARA_AP_TC_101 | W04-AP Lock Check | High | Sau khi edit status, lock-check phản ánh trạng thái mới | AP `id=1026` đang OPEN; có quyền edit AP để đổi status | 1. Gọi lock-check `2026-06-15`, xác nhận `locked=false`.<br>2. PUT AP `id=1026` sang `CLOSED`.<br>3. Gọi lại lock-check cùng date.<br>4. Restore status về `OPEN` sau test. | 1. Lần 1 trả `locked=false`.<br>2. Sau khi status CLOSED, lần 2 trả `locked=true` với period `id=1026`.<br>3. Sau cleanup, AP trở lại OPEN. | P0 | Date: `2026-06-15`<br>AP: `id=1026` |

## Mapping TC ID G?c

| TC ID t?ng h?p | TC ID g?c | API | File ngu?n |
|---|---|---|---|
| GARA_AP_TC_001 | GARA_AP_SEARCH_TC_002 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_002 | GARA_AP_SEARCH_TC_003 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_003 | GARA_AP_SEARCH_TC_008 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_004 | GARA_AP_SEARCH_TC_009 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_005 | GARA_AP_TREE_TC_001 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_006 | GARA_AP_TREE_TC_002 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_007 | GARA_AP_TREE_TC_003 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_008 | GARA_AP_TREE_TC_004 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_009 | GARA_AP_TREE_TC_007 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_010 | GARA_AP_TREE_TC_008 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_011 | GARA_AP_TREE_TC_009 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_012 | GARA_AP_TREE_TC_010 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_013 | GARA_AP_DETAIL_TC_001 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_014 | GARA_AP_DETAIL_TC_002 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_015 | GARA_AP_DETAIL_TC_003 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_016 | GARA_AP_DETAIL_TC_004 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_017 | GARA_AP_DETAIL_TC_007 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_018 | GARA_AP_CREATE_TC_001 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_019 | GARA_AP_CREATE_TC_002 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_020 | GARA_AP_CREATE_TC_003 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_021 | GARA_AP_CREATE_TC_004 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_022 | GARA_AP_CREATE_TC_014 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_023 | GARA_AP_CREATE_TC_018 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_024 | GARA_AP_CREATE_TC_023 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_025 | GARA_AP_EDIT_TC_001 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_026 | GARA_AP_EDIT_TC_003 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_027 | GARA_AP_EDIT_TC_004 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_028 | GARA_AP_EDIT_TC_005 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_029 | GARA_AP_EDIT_TC_010 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_030 | GARA_AP_EDIT_TC_011 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_031 | GARA_AP_EDIT_TC_012 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_032 | GARA_AP_EDIT_TC_014 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_033 | GARA_AP_DELETE_TC_001 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_034 | GARA_AP_DELETE_TC_005 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_035 | GARA_AP_DELETE_TC_006 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_036 | GARA_AP_DELETE_TC_008 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_037 | GARA_AP_DELETE_TC_010 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_038 | GARA_AP_LOCK_TC_003 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_039 | GARA_AP_LOCK_TC_004 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_040 | GARA_AP_LOCK_TC_010 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_041 | GARA_AP_SEARCH_TC_001 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_042 | GARA_AP_SEARCH_TC_004 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_043 | GARA_AP_SEARCH_TC_005 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_044 | GARA_AP_SEARCH_TC_006 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_045 | GARA_AP_SEARCH_TC_007 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_046 | GARA_AP_SEARCH_TC_011 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_047 | GARA_AP_SEARCH_TC_012 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_048 | GARA_AP_TREE_TC_005 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_049 | GARA_AP_TREE_TC_006 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_050 | GARA_AP_DETAIL_TC_006 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_051 | GARA_AP_CREATE_TC_005 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_052 | GARA_AP_CREATE_TC_006 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_053 | GARA_AP_CREATE_TC_007 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_054 | GARA_AP_CREATE_TC_008 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_055 | GARA_AP_CREATE_TC_009 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_056 | GARA_AP_CREATE_TC_010 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_057 | GARA_AP_CREATE_TC_011 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_058 | GARA_AP_CREATE_TC_012 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_059 | GARA_AP_CREATE_TC_013 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_060 | GARA_AP_CREATE_TC_019 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_061 | GARA_AP_CREATE_TC_020 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_062 | GARA_AP_CREATE_TC_021 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_063 | GARA_AP_CREATE_TC_022 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_064 | GARA_AP_CREATE_TC_024 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_065 | GARA_AP_CREATE_TC_026 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_066 | GARA_AP_EDIT_TC_002 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_067 | GARA_AP_EDIT_TC_006 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_068 | GARA_AP_EDIT_TC_007 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_069 | GARA_AP_EDIT_TC_008 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_070 | GARA_AP_EDIT_TC_009 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_071 | GARA_AP_EDIT_TC_015 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_072 | GARA_AP_EDIT_TC_016 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_073 | GARA_AP_EDIT_TC_017 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_074 | GARA_AP_EDIT_TC_018 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_075 | GARA_AP_DELETE_TC_003 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_076 | GARA_AP_DELETE_TC_004 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_077 | GARA_AP_DELETE_TC_011 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_078 | GARA_AP_LOCK_TC_001 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_079 | GARA_AP_LOCK_TC_002 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_080 | GARA_AP_LOCK_TC_007 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_081 | GARA_AP_LOCK_TC_008 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_082 | GARA_AP_LOCK_TC_009 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_083 | GARA_AP_LOCK_TC_013 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_084 | GARA_AP_SEARCH_TC_010 | POST /api/v2/accounting-periods/search | TC_W04_AP_01_SEARCH.md |
| GARA_AP_TC_085 | GARA_AP_TREE_TC_011 | POST /api/v2/accounting-periods/tree | TC_W04_AP_02_TREE.md |
| GARA_AP_TC_086 | GARA_AP_DETAIL_TC_005 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_087 | GARA_AP_DETAIL_TC_008 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_088 | GARA_AP_DETAIL_TC_009 | GET /api/v2/accounting-periods/{id} | TC_W04_AP_03_DETAIL.md |
| GARA_AP_TC_089 | GARA_AP_CREATE_TC_025 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_090 | GARA_AP_EDIT_TC_013 | PUT /api/v2/accounting-periods/{id} | TC_W04_AP_05_EDIT.md |
| GARA_AP_TC_091 | GARA_AP_DELETE_TC_009 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_092 | GARA_AP_LOCK_TC_005 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_093 | GARA_AP_LOCK_TC_006 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_094 | GARA_AP_LOCK_TC_014 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_095 | GARA_AP_CREATE_TC_015 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_096 | GARA_AP_CREATE_TC_016 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_097 | GARA_AP_CREATE_TC_017 | POST /api/v2/accounting-periods | TC_W04_AP_04_CREATE.md |
| GARA_AP_TC_098 | GARA_AP_DELETE_TC_002 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_099 | GARA_AP_DELETE_TC_007 | DELETE /api/v2/accounting-periods/{id} | TC_W04_AP_06_DELETE.md |
| GARA_AP_TC_100 | GARA_AP_LOCK_TC_011 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |
| GARA_AP_TC_101 | GARA_AP_LOCK_TC_012 | GET /protected/v1/accounting-periods/lock-check | TC_W04_AP_07_LOCK_CHECK.md |

