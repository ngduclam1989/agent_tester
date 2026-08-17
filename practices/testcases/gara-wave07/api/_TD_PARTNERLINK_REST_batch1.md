# Test Design — M1 Partner Link (gf-system) — Batch 1: 6 REST Endpoints

> Quy ước numbering: vì batch này gộp 6 API riêng biệt trong 1 lượt (theo lựa chọn "Gộp theo lô" của user),
> mỗi API dùng TD_ID riêng để tránh đụng số khi sang bước Gen-TC: `LIST`, `DETAIL`, `APPROVE`, `REJECT`, `RESYNC`, `CANCEL`.
> Cấu hình mặc định toàn bộ batch: `AUTH_REQUIRED=DEFAULT(YES)` · `METHOD_CHECK=DEFAULT` · `CONTENT_TYPE_CHECK=DEFAULT` (chỉ áp dụng cho API có body) ·
> `ACCEPT_HEADER_CHECK=DEFAULT` · `MANDATORY_CHECK=DEFAULT` · `TYPE_CHECK=DEFAULT` · `LENGTH_CHECK=DEFAULT` ·
> `MALFORMED_JSON_CHECK=DEFAULT` (chỉ API có body) · `EXTRA_FIELDS_CHECK=DEFAULT` · `BVA_MODE=DEFAULT` · `EG_CHECK=DEFAULT` ·
> `RSP_SCHEMA_CHECK=DEFAULT` · `RSP_DATA_CHECK=DEFAULT` · `RSP_ERROR_CHECK=DEFAULT` · `RSP_PAGINATION_CHECK=AUTO` · `RSP_CONTENT_TYPE_CHECK=DEFAULT`.
> Tenant resolution: JWT (`SecurityUtils.getCurrentTenantIdAsLong()`) — header `X-Tenant-Id` KHÔNG dùng cho scoping (chỉ trace/log), theo Quy ước chung §3bis. Role cho phép: `garage-owner` | `accountant` (ngang quyền, `BR-DPL-CMN-004`).

---

# GET /api/v1/system/partner-links - Danh sách yêu cầu liên kết Driver Plus

## Method & Header

<!-- Happy Path chỉ verify lớp Gateway/Protocol. Không thay thế HP ở C2/C3/C4. -->
### TD_LIST_P1_001 - [Smoke] - Happy Path (Method và Header hoàn toàn hợp lệ)
- **Steps**: Gọi GET với JWT hợp lệ (role garage-owner), Accept: application/json, đầy đủ header.
- **Expected**: HTTP 200. Request vượt qua Gateway vào xử lý logic.

### TD_LIST_P1_002 - [Protocol] - Gọi sai HTTP Method (POST thay vì GET)
- **Steps**: Gửi request `/api/v1/system/partner-links` với Method POST.
- **Expected**: HTTP 405 'Method Not Allowed' hoặc 404.

### TD_LIST_P1_003 - [Security] - Header Authorization bị Missing
- **Steps**: Gửi request không có header Authorization.
- **Expected**: HTTP 401, Code `GMS.gf-system.PARTNER_LINK.AUTH_401`.

### TD_LIST_P1_004 - [Security] - Token sai format (thiếu prefix "Bearer ")
- **Steps**: Gửi Authorization: `<raw_token>` không có "Bearer ".
- **Expected**: HTTP 401, Code `GMS.gf-system.PARTNER_LINK.AUTH_401`.

### TD_LIST_P1_005 - [Security] - Token đã hết hạn (expired)
- **Steps**: Gửi Token hợp lệ về format nhưng đã expired.
- **Expected**: HTTP 401, Code `GMS.gf-system.PARTNER_LINK.AUTH_401`.

### TD_LIST_P1_006 - [Security] - Token hợp lệ nhưng role không thuộc garage-owner/accountant
- **Steps**: Gửi Token của role khác (vd `technician`) không nằm trong `garage-owner`|`accountant`.
- **Expected**: HTTP 403. `[PENDING_DOC: PTTK chỉ định nghĩa AUTH_403 cho case "không resolve được tenant", chưa có mã lỗi riêng cho case role sai — cần Backend Lead xác nhận có role-based guard riêng ở tầng nào không]`.

<!-- [Format] không áp dụng — GET không có Request Body -->

### TD_LIST_P1_007 - [Accept] - Sai Accept header (text/xml)
- **Steps**: Gửi Accept: text/xml trong khi API chỉ hỗ trợ application/json.
- **Expected**: HTTP 406 'Not Acceptable'. `[ASSUMPTION: PTTK không mô tả rõ hành vi Accept header — theo default Spring content negotiation]`.

### TD_LIST_P1_008 - [Basic] - Header X-Tenant-Id bị Missing
- **Steps**: Gửi request không có header X-Tenant-Id (header "Required: Yes" trong bảng Headers nhưng chỉ dùng trace/log, KHÔNG dùng cho scoping).
- **Expected**: HTTP 200 — request vẫn xử lý bình thường, tenant resolve từ JWT. `[ASSUMPTION: dựa theo Quy ước chung §3bis "server KHÔNG tin header này cho scoping"]`.

### TD_LIST_P1_009 - [Basic] - Header X-Tenant-Id sai định dạng (không phải số)
- **Steps**: Gửi X-Tenant-Id = "abc".
- **Expected**: HTTP 200 — không ảnh hưởng xử lý (cùng lý do TD_LIST_P1_008).

## Schema Validation

<!-- API không có Request Body. Chỉ có 2 query param, cả 2 đều Optional, không có ràng buộc Type/MaxLength phức tạp -->
### TD_LIST_P2_001 - [Smoke] - Happy Path (Query params hợp lệ hoặc bỏ trống)
- **Steps**: Gọi GET không truyền query param nào.
- **Expected**: HTTP 200, trả về toàn bộ 4 trạng thái (default `partnerCode=DRIVER_PLUS`, `statuses`=tất cả).

<!-- Optional field 'partnerCode' (enum, chỉ DRIVER_PLUS) -->
### TD_LIST_P2_002 - [Extra-Fields] - Query param lạ không định nghĩa trong PTTK (vd ?page=1&size=10)
- **Steps**: Gửi `?page=1&size=10` (params không được hỗ trợ theo `BR-DPL-LST-004` — no-pagination).
- **Expected**: HTTP 200, params lạ bị bỏ qua hoàn toàn, danh sách trả về không bị ảnh hưởng (không phân trang). `[ASSUMPTION: PTTK không định nghĩa hành vi — theo default Spring @RequestParam bỏ qua param không khai báo]`.

## Value, Business Logic, Cross Logic

<!-- Happy Path verify Business Logic và DB. Không thay thế HP ở C1, C2, C4. -->
### TD_LIST_P3_001 - [Smoke] - Happy Path (statuses=PENDING&LINKED, có dữ liệu)
- **Steps**: Tenant có sẵn 2 record (1 PENDING, 1 LINKED). Gọi GET `?statuses=PENDING&statuses=LINKED`.
- **Expected**: HTTP 200. DB: trả đúng 2 record thuộc đúng tenant, sort `requestedAt DESC`.

### TD_LIST_P3_002 - [ECP] - `statuses` chứa giá trị ngoài enum (vd "ARCHIVED")
- **Steps**: Gọi GET `?statuses=ARCHIVED`.
- **Expected**: HTTP 400, Code `GMS.gf-system.PARTNER_LINK.VAL_400`.

### TD_LIST_P3_003 - [ECP] - `partnerCode` khác DRIVER_PLUS (vd "GRAB")
- **Steps**: Gọi GET `?partnerCode=GRAB`.
- **Expected**: HTTP 400, Code `GMS.gf-system.PARTNER_LINK.VAL_400`.

### TD_LIST_P3_004 - [ST] - Bỏ trống `statuses` — trả về đủ cả 4 trạng thái
- **Steps**: Tenant có đủ 4 record (PENDING/LINKED/REJECTED/UNLINKED). Gọi GET không truyền `statuses`.
- **Expected**: HTTP 200. DB: trả đủ cả 4 record (không phải chỉ PENDING+LINKED — đó là default riêng của FE).

### TD_LIST_P3_005 - [ST] - Danh sách rỗng, KHÔNG áp filter
- **Steps**: Tenant chưa từng có yêu cầu liên kết nào. Gọi GET không filter.
- **Expected**: HTTP 200, `items=[]`, `totalItems=0`. (Wording "Chưa có yêu cầu liên kết nào" — `ERR-DPL-008` — là message hiển thị FE, không phải mã lỗi HTTP, API vẫn trả 200).

### TD_LIST_P3_006 - [ST] - Danh sách rỗng, CÓ áp filter loại bỏ hết
- **Steps**: Tenant có record nhưng không thuộc trạng thái filter. Gọi GET `?statuses=REJECTED` khi tenant không có record REJECTED nào.
- **Expected**: HTTP 200, `items=[]`, `totalItems=0`. (Wording "Không có yêu cầu nào khớp bộ lọc" — `ERR-DPL-009` — cũng chỉ là message FE).

### TD_LIST_P3_007 - [ST] - Vượt cap phòng vệ 500 record
- **Steps**: Seed 501 record PENDING cho 1 tenant. Gọi GET không filter.
- **Expected**: HTTP 200. DB: trả đúng 500 record mới nhất (`ORDER BY requested_at DESC LIMIT 501`, dòng 501 chỉ dùng để set cờ), `data.truncated=true`.

### TD_LIST_P3_008 - [ST] - Dưới cap 500 record
- **Steps**: Seed 3 record cho 1 tenant. Gọi GET không filter.
- **Expected**: HTTP 200. `data.truncated=false`, `totalItems=3`.

### TD_LIST_P3_009 - [ST] - Feature flag `PartnerLink:DriverPlus` = off
- **Steps**: Tenant có flag `PartnerLink:DriverPlus=off`. Gọi GET.
- **Expected**: HTTP 403, Code `GMS.gf-system.PARTNER_LINK.FLAG_OFF`.

### TD_LIST_P3_010 - [ST] - Cô lập dữ liệu chéo tenant (tenant isolation)
- **Steps**: Tenant A có 2 record, Tenant B có 3 record. Đăng nhập JWT tenant A, gọi GET.
- **Expected**: HTTP 200, chỉ trả về 2 record của tenant A, không lẫn record tenant B.

### TD_LIST_P3_011 - [ST] - Lỗi đọc DB (giả lập infra failure)
- **Steps**: Giả lập DB không khả dụng khi query danh sách.
- **Expected**: HTTP 503, Code `ERR-DPL-007`.

## Response Validation

### TD_LIST_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ và đúng kiểu)
- **Steps**: Gọi GET hợp lệ, tenant có 1 record PENDING + 1 record UNLINKED (đã xử lý).
- **Expected**: HTTP 200. `data.items[]` mỗi phần tử có đủ 8 field: `requestCode`(String) `partnerCode`(String enum) `partnerAccountName`(String) `partnerAccountPhone`(String) `requestedAt`(String ISO-8601) `status`(String enum) `processedAt`(String|null) `processedByLabel`(String|null) `reason`(String|null); cộng `data.totalItems`(Number), `data.truncated`(Boolean). Record PENDING có `processedAt/processedByLabel/reason = null`; record UNLINKED có đủ giá trị non-null.

### TD_LIST_P4_002 - [RSP-Schema] - Field `data.truncated` luôn có mặt kể cả khi không vượt cap
- **Steps**: Gọi GET khi tenant chỉ có 1 record.
- **Expected**: `data.truncated` = `false` (Boolean, không phải null/thiếu field).

### TD_LIST_P4_003 - [RSP-Data] - `data.items[].status` khớp đúng trạng thái đã lưu DB
- **Steps**: Seed 1 record `status=REJECTED`. Gọi GET.
- **Expected**: `data.items[0].status` = "REJECTED" — khớp chính xác giá trị DB, không bị map sai.

### TD_LIST_P4_004 - [RSP-Data] - `data.items[]` sort đúng `requestedAt DESC`
- **Steps**: Seed 3 record với `requestedAt` khác nhau (không theo thứ tự insert). Gọi GET.
- **Expected**: `data.items[]` trả về theo thứ tự `requestedAt` giảm dần, không phụ thuộc thứ tự insert.

### TD_LIST_P4_005 - [RSP-Error] - Error response HTTP 400 có cấu trúc nhất quán
- **Steps**: Gọi GET `?statuses=INVALID`.
- **Expected**: Response JSON `{code: 'GMS.gf-system.PARTNER_LINK.VAL_400', message: '...'}`. Không HTML/stack trace.

### TD_LIST_P4_006 - [RSP-Error] - Error response HTTP 401 có cấu trúc nhất quán
- **Steps**: Gọi GET không có Authorization.
- **Expected**: Response JSON `{code: 'GMS.gf-system.PARTNER_LINK.AUTH_401', message: '...'}`. Cùng cấu trúc với TD_LIST_P4_005.

### TD_LIST_P4_007 - [RSP-Error] - Error response HTTP 403 (flag off) có cấu trúc nhất quán
- **Steps**: Gọi GET khi flag off.
- **Expected**: Response JSON `{code: 'GMS.gf-system.PARTNER_LINK.FLAG_OFF', message: '...'}`. Cùng cấu trúc với 2 case trên.

### TD_LIST_P4_008 - [RSP-Pagination] - Không có field pagination chuẩn (page/size) — chỉ có totalItems/truncated
- **Steps**: Gọi GET.
- **Expected**: Response KHÔNG có field `page`/`size`/`totalPages` (API design cố ý không phân trang, `BR-DPL-LST-004`) — chỉ có `totalItems` + `truncated`. `[ASSUMPTION: đây là kiểm tra phủ định — xác nhận API KHÔNG áp dụng chuẩn pagination thông thường]`.

### TD_LIST_P4_009 - [RSP-Content-Type] - Response header Content-Type là application/json
- **Steps**: Gọi GET hợp lệ và gọi GET lỗi (400).
- **Expected**: Cả 2 response đều có Content-Type = `application/json`.

---

# GET /api/v1/system/partner-links/{requestCode} - Chi tiết yêu cầu liên kết

## Method & Header

### TD_DETAIL_P1_001 - [Smoke] - Happy Path (Method và Header hoàn toàn hợp lệ)
- **Steps**: Gọi GET với JWT hợp lệ, `requestCode` tồn tại.
- **Expected**: HTTP 200.

### TD_DETAIL_P1_002 - [Protocol] - Gọi sai HTTP Method (DELETE thay vì GET)
- **Steps**: Gửi Method DELETE tới cùng path.
- **Expected**: HTTP 405 hoặc 404.

### TD_DETAIL_P1_003 - [Security] - Header Authorization bị Missing
- **Steps**: Gửi request không có Authorization.
- **Expected**: HTTP 401, Code `AUTH_401`.

### TD_DETAIL_P1_004 - [Security] - Token sai format
- **Steps**: Authorization không có prefix "Bearer ".
- **Expected**: HTTP 401, Code `AUTH_401`.

### TD_DETAIL_P1_005 - [Security] - Token hết hạn
- **Steps**: Token expired.
- **Expected**: HTTP 401, Code `AUTH_401`.

### TD_DETAIL_P1_006 - [Security] - Role không thuộc garage-owner/accountant
- **Steps**: Token role khác.
- **Expected**: HTTP 403. `[PENDING_DOC: như TD_LIST_P1_006]`.

### TD_DETAIL_P1_007 - [Accept] - Sai Accept header (text/xml)
- **Steps**: Accept: text/xml.
- **Expected**: HTTP 406. `[ASSUMPTION: như TD_LIST_P1_007]`.

### TD_DETAIL_P1_008 - [Basic] - Header X-Tenant-Id Missing
- **Steps**: Không gửi X-Tenant-Id.
- **Expected**: HTTP 200 (không ảnh hưởng, cùng lý do TD_LIST_P1_008).

## Schema Validation

### TD_DETAIL_P2_001 - [Smoke] - Happy Path (`requestCode` đúng pattern)
- **Steps**: GET với `requestCode`="LKD-2026-001".
- **Expected**: HTTP 200.

<!-- Path param 'requestCode' (String, Required=Y, pattern ^LKD-\d{4}-\d{3,}$) -->
### TD_DETAIL_P2_002 - [Type] - `requestCode` sai pattern (không đúng định dạng LKD-YYYY-NNN)
- **Steps**: GET với `requestCode`="ABC-123".
- **Expected**: HTTP 400, Code `VAL_400`.

## Value, Business Logic, Cross Logic

### TD_DETAIL_P3_001 - [Smoke] - Happy Path (record LINKED, đủ profile/invoice)
- **Steps**: `requestCode` thuộc tenant hiện tại, `status=LINKED`, `tenant_profile`+`tenant_invoice_info` đã có dữ liệu.
- **Expected**: HTTP 200. DB: 3 lookup unique-key (record + tenant_profile + tenant_invoice_info) đọc real-time, không cache.

### TD_DETAIL_P3_002 - [ECP] - `requestCode` không tồn tại
- **Steps**: GET với `requestCode`="LKD-2026-999" (chưa từng tồn tại).
- **Expected**: HTTP 404, Code `NF_404`.

### TD_DETAIL_P3_003 - [IDOR] - `requestCode` tồn tại nhưng thuộc tenant khác
- **Steps**: `requestCode` hợp lệ, thuộc tenant B; đăng nhập JWT tenant A gọi GET.
- **Expected**: HTTP 404, Code `NF_404` (theo thiết kế — cố ý KHÔNG phân biệt với case không tồn tại, tránh lộ thông tin cross-tenant).

### TD_DETAIL_P3_004 - [ST] - `status=PENDING` → `availableActions=[APPROVE, REJECT]`
- **Steps**: `requestCode` đang `PENDING`. Gọi GET.
- **Expected**: `data.availableActions` = `["APPROVE","REJECT"]`.

### TD_DETAIL_P3_005 - [ST] - `status=LINKED` → `availableActions=[RESYNC, CANCEL]`
- **Steps**: `requestCode` đang `LINKED`. Gọi GET.
- **Expected**: `data.availableActions` = `["RESYNC","CANCEL"]`.

### TD_DETAIL_P3_006 - [ST] - `status=REJECTED` → `availableActions=[]`
- **Steps**: `requestCode` đang `REJECTED`. Gọi GET.
- **Expected**: `data.availableActions` = `[]`.

### TD_DETAIL_P3_007 - [ST] - `status=UNLINKED` → `availableActions=[]`
- **Steps**: `requestCode` đang `UNLINKED`. Gọi GET.
- **Expected**: `data.availableActions` = `[]`.

### TD_DETAIL_P3_008 - [ST] - `tenant_profile` chưa tồn tại (garage cũ chưa backfill)
- **Steps**: `requestCode` hợp lệ nhưng tenant chưa có row `tenant_profile` (theo Q3/RR-005).
- **Expected**: HTTP 200. `data.garageProfile` = null (toàn bộ 5 field null-safe), KHÔNG chặn response.

### TD_DETAIL_P3_009 - [ST] - `tenant_invoice_info` chưa tồn tại
- **Steps**: `requestCode` hợp lệ nhưng tenant chưa có `tenant_invoice_info`.
- **Expected**: HTTP 200. `data.invoiceInfo` = null.

### TD_DETAIL_P3_010 - [ST] - Feature flag off
- **Steps**: Flag `PartnerLink:DriverPlus=off`.
- **Expected**: HTTP 403, Code `FLAG_OFF`.

### TD_DETAIL_P3_011 - [ST] - Lỗi đọc DB
- **Steps**: Giả lập DB unavailable.
- **Expected**: HTTP 503, Code `ERR-DPL-007`.

## Response Validation

### TD_DETAIL_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ)
- **Steps**: GET record LINKED đầy đủ dữ liệu.
- **Expected**: HTTP 200. Response có 9 field cấp 1 giống item của list + `availableActions`(Array) + `garageProfile`(Object, 5 field) + `invoiceInfo`(Object, 4 field). Không thiếu, không thừa field.

### TD_DETAIL_P4_002 - [RSP-Schema] - `garageProfile`/`invoiceInfo` = null khi chưa có hồ sơ (không phải object rỗng `{}`)
- **Steps**: GET tenant chưa có `tenant_profile`.
- **Expected**: `data.garageProfile` = `null` (không phải `{}` hay thiếu field).

### TD_DETAIL_P4_003 - [RSP-Data] - `availableActions` derive đúng theo `status` hiện tại trong DB (không cache)
- **Steps**: GET 2 lần liên tiếp — giữa 2 lần, record chuyển từ `PENDING` sang `LINKED` (do action khác).
- **Expected**: Lần gọi thứ 2 trả `availableActions=["RESYNC","CANCEL"]` — phản ánh đúng state mới nhất, không phải cache của lần gọi trước.

### TD_DETAIL_P4_004 - [RSP-Error] - Error response HTTP 400 nhất quán
- **Steps**: GET `requestCode` sai pattern.
- **Expected**: JSON `{code:'VAL_400', message:'...'}`.

### TD_DETAIL_P4_005 - [RSP-Error] - Error response HTTP 404 nhất quán
- **Steps**: GET `requestCode` không tồn tại.
- **Expected**: JSON `{code:'NF_404', message:'...'}`. Cùng cấu trúc TD_DETAIL_P4_004.

### TD_DETAIL_P4_006 - [RSP-Error] - Error response HTTP 401 nhất quán
- **Steps**: GET không Authorization.
- **Expected**: JSON `{code:'AUTH_401', message:'...'}`. Cùng cấu trúc.

### TD_DETAIL_P4_007 - [RSP-Content-Type] - Content-Type application/json
- **Steps**: GET hợp lệ và GET lỗi 404.
- **Expected**: Cả 2 đều Content-Type = application/json.

<!-- RSP_PAGINATION_CHECK: N/A — Single-Record API -->

---

# POST /api/v1/system/partner-links/{requestCode}/approve - Duyệt yêu cầu liên kết

## Method & Header

### TD_APPROVE_P1_001 - [Smoke] - Happy Path (Method và Header hoàn toàn hợp lệ)
- **Steps**: POST với JWT hợp lệ, Content-Type: application/json, body `{"termsAccepted":true}`.
- **Expected**: HTTP 200.

### TD_APPROVE_P1_002 - [Protocol] - Gọi sai HTTP Method (GET thay vì POST)
- **Steps**: Method GET tới cùng path.
- **Expected**: HTTP 405 hoặc 404.

### TD_APPROVE_P1_003 - [Security] - Authorization Missing
- **Steps**: Không gửi Authorization.
- **Expected**: HTTP 401, `AUTH_401`.

### TD_APPROVE_P1_004 - [Security] - Token sai format
- **Steps**: Thiếu prefix "Bearer ".
- **Expected**: HTTP 401, `AUTH_401`.

### TD_APPROVE_P1_005 - [Security] - Token hết hạn
- **Steps**: Token expired.
- **Expected**: HTTP 401, `AUTH_401`.

### TD_APPROVE_P1_006 - [Security] - Role không thuộc garage-owner/accountant
- **Steps**: Token role khác.
- **Expected**: HTTP 403. `[PENDING_DOC: như TD_LIST_P1_006]`.

### TD_APPROVE_P1_007 - [Format] - Sai Content-Type (text/plain)
- **Steps**: Content-Type: text/plain, body vẫn JSON hợp lệ.
- **Expected**: HTTP 415 'Unsupported Media Type'.

### TD_APPROVE_P1_008 - [Accept] - Sai Accept header
- **Steps**: Accept: text/xml.
- **Expected**: HTTP 406. `[ASSUMPTION]`.

### TD_APPROVE_P1_009 - [Basic] - X-Tenant-Id Missing
- **Steps**: Không gửi X-Tenant-Id.
- **Expected**: HTTP 200 (không ảnh hưởng, dùng JWT). `[ASSUMPTION: như nhóm GET]`.

## Schema Validation

### TD_APPROVE_P2_001 - [Smoke] - Happy Path (body hợp lệ)
- **Steps**: Body `{"termsAccepted": true}`, `requestCode` đúng pattern.
- **Expected**: HTTP 200.

### TD_APPROVE_P2_002 - [Malformed] - Body JSON sai cú pháp
- **Steps**: Gửi body `{"termsAccepted": true` (thiếu dấu đóng ngoặc).
- **Expected**: HTTP 400, Code `ERR_BAD_REQUEST` hoặc tương đương. `[ASSUMPTION: PTTK không định nghĩa mã cụ thể cho malformed JSON]`.

<!-- Field 'requestCode' (path param, String, Required=Y, pattern LKD-YYYY-NNN) -->
### TD_APPROVE_P2_003 - [Type] - `requestCode` sai pattern
- **Steps**: `requestCode`="INVALID".
- **Expected**: HTTP 400, Code `VAL_400`.

<!-- Field 'termsAccepted' (body, Boolean, Required=Y) — Boolean → [Empty] không áp dụng, chỉ [Missing]/[Type] -->
### TD_APPROVE_P2_004 - [Missing] - Field `termsAccepted` bị Missing
- **Steps**: Body `{}` (không có key `termsAccepted`).
- **Expected**: HTTP 400, Code `VAL_400`.

### TD_APPROVE_P2_005 - [Type] - `termsAccepted` sai kiểu (String thay vì Boolean)
- **Steps**: Body `{"termsAccepted": "true"}`.
- **Expected**: HTTP 400, Code `VAL_400`. `[ASSUMPTION: PTTK không nói rõ Jackson có coerce string "true" hay reject — giả định reject theo strict binding]`.

### TD_APPROVE_P2_006 - [Extra-Fields] - Payload có field lạ ngoài PTTK
- **Steps**: Body `{"termsAccepted": true, "injectedField": "x"}`.
- **Expected**: HTTP 200, field lạ bị bỏ qua hoàn toàn (không lưu DB, không xuất hiện response). `[ASSUMPTION: theo default Jackson deserialize bỏ qua unknown field]`.

## Value, Business Logic, Cross Logic

### TD_APPROVE_P3_001 - [Smoke] - Happy Path (record PENDING, termsAccepted=true, không có PENDING khác)
- **Steps**: `requestCode` đang `PENDING`, `termsAccepted=true`, tenant không có record `PENDING` nào khác.
- **Expected**: HTTP 200. DB: `partner_link_request.status='LINKED'`, `processed_at`/`processed_by_label` set. Outbox: 2 event ghi trong cùng transaction (`PROFILE.SYNC` + `STATUS.CHANGED` APPROVED).

### TD_APPROVE_P3_002 - [ECP] - `termsAccepted=false`
- **Steps**: Body `{"termsAccepted": false}`.
- **Expected**: HTTP 400, Code `VAL_400`.

### TD_APPROVE_P3_003 - [ECP] - `requestCode` không tồn tại
- **Steps**: `requestCode`="LKD-2026-999" chưa từng có.
- **Expected**: HTTP 404, Code `NF_404`.

### TD_APPROVE_P3_004 - [IDOR] - `requestCode` tồn tại nhưng thuộc tenant khác
- **Steps**: `requestCode` hợp lệ thuộc tenant B, JWT tenant A gọi approve.
- **Expected**: HTTP 404, Code `NF_404`.

### TD_APPROVE_P3_005 - [ST] - Record không còn ở `PENDING` (đã LINKED/REJECTED/UNLINKED)
- **Steps**: `requestCode` đang `LINKED` (đã xử lý trước đó). Gọi approve lần nữa.
- **Expected**: HTTP 409, Code `ERR-DPL-004`.

### TD_APPROVE_P3_006 - [ST] - Cascade auto-reject các PENDING khác cùng tenant
- **Steps**: Tenant có 3 record `PENDING` (A, B, C). Approve record A.
- **Expected**: HTTP 200. DB: A→`LINKED`; B, C→`REJECTED` (cùng transaction). Response `data.autoRejectedRequestCodes` = [B, C]. Outbox: 1 `STATUS.CHANGED APPROVED` (A) + 2 `STATUS.CHANGED AUTO_REJECTED` (B, C).

### TD_APPROVE_P3_007 - [ST] - Cascade KHÔNG động tới record đã terminal trước đó
- **Steps**: Tenant có record D đã `REJECTED` từ trước + record A đang `PENDING`. Approve A.
- **Expected**: HTTP 200. Record D giữ nguyên `REJECTED`, KHÔNG bị cascade chạm vào (mệnh đề cascade chỉ áp `status='PENDING'`).

### TD_APPROVE_P3_008 - [ST] - Race condition — 2 user approve 2 record khác nhau cùng tenant gần đồng thời
- **Steps**: Tenant có 2 record PENDING (A, B). 2 request approve A và approve B gửi gần như đồng thời.
- **Expected**: Đúng 1 request thành công (HTTP 200, record → `LINKED`); request commit sau nhận HTTP 409, Code `ERR-DPL-006` (vi phạm `uk_plr_tenant_active_link`), record của request thua tự động chuyển `REJECTED`.

### TD_APPROVE_P3_009 - [ST] - Tenant đã có 1 record LINKED từ trước (single-active guard tại approve)
- **Steps**: Tenant đã có record LINKED (E). Approve thêm record F đang PENDING.
- **Expected**: HTTP 409, Code `ERR-DPL-006` (vi phạm partial unique index), F tự động chuyển `REJECTED`.

### TD_APPROVE_P3_010 - [ST] - Feature flag off
- **Steps**: Flag `PartnerLink:DriverPlus=off`.
- **Expected**: HTTP 403, Code `FLAG_OFF`. Theo Q2: check flag NGAY SAU khi xác định `requestCode` hợp lệ, TRƯỚC khi kiểm tra state PENDING.

### TD_APPROVE_P3_011 - [ST] - Publish outbox event thất bại (không rollback)
- **Steps**: Giả lập lỗi publish Kafka ngay sau khi transaction DB đã commit thành công.
- **Expected**: HTTP 200 (transaction DB đã commit, record vẫn `LINKED`) — outbox event ở trạng thái `PENDING`/retry, KHÔNG rollback state nghiệp vụ.

### TD_APPROVE_P3_012 - [ST] - Lỗi hệ thống khi xử lý
- **Steps**: Giả lập lỗi DB write.
- **Expected**: HTTP 503, Code `ERR-DPL-005`. Modal/state giữ nguyên (không có thay đổi nửa vời).

## Response Validation

### TD_APPROVE_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ)
- **Steps**: Approve thành công, có 2 record bị auto-reject.
- **Expected**: HTTP 200. Response có: `requestCode`(String) `status`(String="LINKED") `processedAt`(String ISO) `processedByLabel`(String) `reason`(null) `availableActions`(Array=["RESYNC","CANCEL"]) `autoRejectedRequestCodes`(Array[String]).

### TD_APPROVE_P4_002 - [RSP-Data] - `processedByLabel` đúng format `{Tên nhân viên} ({Tên hiển thị role})`
- **Steps**: Approve bằng user "Đăng Vinh", role `garage-owner`.
- **Expected**: `data.processedByLabel` = "Đăng Vinh (Chủ garage)" — đúng mapping role→nhãn hiển thị.

### TD_APPROVE_P4_003 - [RSP-Data] - `autoRejectedRequestCodes` rỗng khi không có record PENDING nào khác
- **Steps**: Tenant chỉ có 1 record PENDING (record đang approve). Approve.
- **Expected**: `data.autoRejectedRequestCodes` = `[]` (mảng rỗng, không phải null).

### TD_APPROVE_P4_004 - [RSP-Error] - Error HTTP 400 nhất quán
- **Steps**: Body thiếu `termsAccepted`.
- **Expected**: JSON `{code:'VAL_400', message:'...'}`.

### TD_APPROVE_P4_005 - [RSP-Error] - Error HTTP 409 nhất quán
- **Steps**: Approve record đã terminal.
- **Expected**: JSON `{code:'ERR-DPL-004', message:'...'}`. Cùng cấu trúc TD_APPROVE_P4_004.

### TD_APPROVE_P4_006 - [RSP-Error] - Error HTTP 404 nhất quán
- **Steps**: `requestCode` không tồn tại.
- **Expected**: JSON `{code:'NF_404', message:'...'}`.

### TD_APPROVE_P4_007 - [RSP-Content-Type] - Content-Type application/json
- **Steps**: Request thành công và request lỗi 409.
- **Expected**: Cả 2 đều application/json.

---

# POST /api/v1/system/partner-links/{requestCode}/reject - Từ chối yêu cầu liên kết

## Method & Header

### TD_REJECT_P1_001 - [Smoke] - Happy Path
- **Steps**: POST JWT hợp lệ, body `{"reason":"SĐT không đúng"}`.
- **Expected**: HTTP 200.

### TD_REJECT_P1_002 - [Protocol] - Sai Method (PUT thay vì POST)
- **Steps**: Method PUT.
- **Expected**: HTTP 405/404.

### TD_REJECT_P1_003 - [Security] - Authorization Missing
- **Expected**: HTTP 401 `AUTH_401`.

### TD_REJECT_P1_004 - [Security] - Token sai format
- **Expected**: HTTP 401 `AUTH_401`.

### TD_REJECT_P1_005 - [Security] - Token hết hạn
- **Expected**: HTTP 401 `AUTH_401`.

### TD_REJECT_P1_006 - [Security] - Role không thuộc garage-owner/accountant
- **Expected**: HTTP 403. `[PENDING_DOC]`.

### TD_REJECT_P1_007 - [Format] - Sai Content-Type
- **Steps**: Content-Type: text/plain.
- **Expected**: HTTP 415.

### TD_REJECT_P1_008 - [Accept] - Sai Accept header
- **Expected**: HTTP 406. `[ASSUMPTION]`.

### TD_REJECT_P1_009 - [Basic] - X-Tenant-Id Missing
- **Expected**: HTTP 200 (không ảnh hưởng). `[ASSUMPTION]`.

## Schema Validation

### TD_REJECT_P2_001 - [Smoke] - Happy Path
- **Steps**: Body `{"reason": "SĐT không đúng, nghi nhầm garage khác."}`.
- **Expected**: HTTP 200.

### TD_REJECT_P2_002 - [Malformed] - Body JSON sai cú pháp
- **Expected**: HTTP 400. `[ASSUMPTION: mã lỗi không định nghĩa]`.

### TD_REJECT_P2_003 - [Type] - `requestCode` sai pattern
- **Expected**: HTTP 400, `VAL_400`.

<!-- Field 'reason' (body, String, Required=Y, max 2000 ký tự, no min) -->
### TD_REJECT_P2_004 - [Missing] - Field `reason` bị Missing
- **Steps**: Body `{}`.
- **Expected**: HTTP 400, Code `ERR-DPL-001`.

### TD_REJECT_P2_005 - [Empty] - `reason` = ""
- **Steps**: Body `{"reason": ""}`.
- **Expected**: HTTP 400, Code `ERR-DPL-001`.

### TD_REJECT_P2_006 - [Type] - `reason` sai kiểu (Number)
- **Steps**: Body `{"reason": 12345}`.
- **Expected**: HTTP 400, Code `VAL_400`.

### TD_REJECT_P2_007 - [Max Length] - `reason` vượt 2000 ký tự (2001 ký tự)
- **Steps**: Body `reason` = chuỗi 2001 ký tự.
- **Expected**: HTTP 400, Code `ERR-DPL-012`.

### TD_REJECT_P2_008 - [Extra-Fields] - Payload có field lạ
- **Steps**: Body `{"reason":"hợp lệ", "extra": 1}`.
- **Expected**: HTTP 200, field lạ bị bỏ qua. `[ASSUMPTION]`.

## Value, Business Logic, Cross Logic

### TD_REJECT_P3_001 - [Smoke] - Happy Path (record PENDING)
- **Steps**: `requestCode` đang `PENDING`, `reason` hợp lệ.
- **Expected**: HTTP 200. DB: `status='REJECTED'` (terminal), `processed_at`/`processed_by_label`/`reason` set. Outbox: 1 event `STATUS.CHANGED REJECTED`. KHÔNG cascade, KHÔNG publish `PROFILE.SYNC`.

### TD_REJECT_P3_002 - [Whitespace] - `reason` chỉ chứa khoảng trắng "   "
- **Steps**: Body `{"reason": "   "}`.
- **Expected**: HTTP 400, Code `ERR-DPL-001` (sau `trim` rỗng).

### TD_REJECT_P3_003 - [EG] - `reason` chứa Emoji/Unicode đặc biệt
- **Steps**: Body `{"reason": "Sai SĐT 🚨🔥"}`.
- **Expected**: HTTP 200 — `reason` lưu nguyên văn (theo Q5: API không tự sanitize, trách nhiệm escape ở tầng render UI).

### TD_REJECT_P3_004 - [ECP] - `requestCode` không tồn tại
- **Expected**: HTTP 404, `NF_404`.

### TD_REJECT_P3_005 - [IDOR] - `requestCode` thuộc tenant khác
- **Expected**: HTTP 404, `NF_404`.

### TD_REJECT_P3_006 - [ST] - Record không còn `PENDING`
- **Steps**: `requestCode` đang `LINKED`. Gọi reject.
- **Expected**: HTTP 409, `ERR-DPL-004`.

### TD_REJECT_P3_007 - [ST] - Feature flag off
- **Expected**: HTTP 403, `FLAG_OFF`.

### TD_REJECT_P3_008 - [ST] - Lỗi hệ thống khi xử lý
- **Expected**: HTTP 503, `ERR-DPL-005`.

## Response Validation

### TD_REJECT_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ)
- **Expected**: HTTP 200. Response: `requestCode`(String) `status`(String="REJECTED") `processedAt`(String) `processedByLabel`(String) `reason`(String — echo đúng input) `availableActions`(Array=[]).

### TD_REJECT_P4_002 - [RSP-Data] - `reason` trong response khớp chính xác input đã gửi
- **Steps**: Body `reason`="Lý do XYZ 123".
- **Expected**: `data.reason` = "Lý do XYZ 123" — không bị cắt/format lại.

### TD_REJECT_P4_003 - [RSP-Data] - `availableActions` luôn `[]` sau reject (terminal)
- **Expected**: `data.availableActions` = `[]`.

### TD_REJECT_P4_004 - [RSP-Error] - Error HTTP 400 nhất quán
- **Expected**: JSON `{code:'ERR-DPL-001', message:'...'}`.

### TD_REJECT_P4_005 - [RSP-Error] - Error HTTP 409 nhất quán
- **Expected**: JSON `{code:'ERR-DPL-004', message:'...'}`.

### TD_REJECT_P4_006 - [RSP-Content-Type] - Content-Type application/json
- **Expected**: application/json cho cả success và error.

---

# POST /api/v1/system/partner-links/{requestCode}/resync - Đồng bộ lại thông tin garage

## Method & Header

### TD_RESYNC_P1_001 - [Smoke] - Happy Path
- **Steps**: POST JWT hợp lệ, không có body (modal chỉ có nút xác nhận).
- **Expected**: HTTP 200.

### TD_RESYNC_P1_002 - [Protocol] - Sai Method (GET thay vì POST)
- **Expected**: HTTP 405/404.

### TD_RESYNC_P1_003 - [Security] - Authorization Missing
- **Expected**: HTTP 401 `AUTH_401`.

### TD_RESYNC_P1_004 - [Security] - Token sai format
- **Expected**: HTTP 401 `AUTH_401`.

### TD_RESYNC_P1_005 - [Security] - Token hết hạn
- **Expected**: HTTP 401 `AUTH_401`.

### TD_RESYNC_P1_006 - [Security] - Role không thuộc garage-owner/accountant
- **Expected**: HTTP 403. `[PENDING_DOC]`.

<!-- [Format]/[Malformed] không áp dụng — API không nhận Request Body (PTTK: "N/A — modal chỉ có nút xác nhận") -->

### TD_RESYNC_P1_007 - [Accept] - Sai Accept header
- **Expected**: HTTP 406. `[ASSUMPTION]`.

### TD_RESYNC_P1_008 - [Basic] - X-Tenant-Id Missing
- **Expected**: HTTP 200 (không ảnh hưởng). `[ASSUMPTION]`.

## Schema Validation

<!-- Không có Request Body — chỉ path param 'requestCode' -->
### TD_RESYNC_P2_001 - [Smoke] - Happy Path (`requestCode` đúng pattern)
- **Expected**: HTTP 200.

### TD_RESYNC_P2_002 - [Type] - `requestCode` sai pattern
- **Expected**: HTTP 400, `VAL_400`.

## Value, Business Logic, Cross Logic

### TD_RESYNC_P3_001 - [Smoke] - Happy Path (record LINKED)
- **Steps**: `requestCode` đang `LINKED`.
- **Expected**: HTTP 200. DB: `status` KHÔNG đổi (vẫn `LINKED`); `processed_at`/`processed_by_label`/`reason` giữ nguyên giá trị cũ (KHÔNG ghi đè). Outbox: 1 event `PROFILE.SYNC` (`syncTrigger=MANUAL_RESYNC`). KHÔNG publish `STATUS.CHANGED`.

### TD_RESYNC_P3_002 - [ECP] - `requestCode` không tồn tại
- **Expected**: HTTP 404, `NF_404`.

### TD_RESYNC_P3_003 - [IDOR] - `requestCode` thuộc tenant khác
- **Expected**: HTTP 404, `NF_404`.

### TD_RESYNC_P3_004 - [ST] - Record không còn `LINKED` (vd đã UNLINKED)
- **Steps**: `requestCode` đang `UNLINKED`.
- **Expected**: HTTP 409, `ERR-DPL-004`.

### TD_RESYNC_P3_005 - [ST] - Gọi lặp lại nhiều lần liên tiếp (idempotent an toàn)
- **Steps**: Gọi resync 3 lần liên tiếp trên cùng 1 record `LINKED`.
- **Expected**: Cả 3 lần đều HTTP 200, state không đổi; mỗi lần ghi thêm 1 outbox event `PROFILE.SYNC` riêng biệt (không dedupe, D+ tự áp last-write-wins theo `occurredAt`).

### TD_RESYNC_P3_006 - [ST] - `tenant_profile` rỗng lúc resync
- **Steps**: Tenant chưa có `tenant_profile`. Resync record LINKED.
- **Expected**: HTTP 200, `data.garageProfile=null`, vẫn publish `PROFILE.SYNC` với khối profile rỗng.

### TD_RESYNC_P3_007 - [ST] - Feature flag off
- **Expected**: HTTP 403, `FLAG_OFF`.

### TD_RESYNC_P3_008 - [ST] - Lỗi hệ thống khi xử lý
- **Expected**: HTTP 503, `ERR-DPL-005`.

## Response Validation

### TD_RESYNC_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ)
- **Expected**: HTTP 200. Response có đủ 9 field như detail + `syncedAt`(String ISO — timestamp ghi outbox lần này, KHÔNG persist DB).

### TD_RESYNC_P4_002 - [RSP-Data] - `processedAt`/`processedByLabel`/`reason` giữ nguyên giá trị lúc Duyệt (không đổi)
- **Steps**: Record đã Duyệt trước đó bởi "Lan Anh". Gọi resync bởi user khác "Đăng Vinh".
- **Expected**: `data.processedByLabel` vẫn = "Lan Anh (...)" — KHÔNG bị ghi đè bởi người gọi resync.

### TD_RESYNC_P4_003 - [RSP-Data] - `garageProfile`/`invoiceInfo` phản ánh đúng dữ liệu real-time hiện tại
- **Steps**: Sửa `tenant_profile.business_name` ngay trước khi gọi resync.
- **Expected**: `data.garageProfile.businessName` = giá trị MỚI nhất (đọc real-time, không phải snapshot cũ).

### TD_RESYNC_P4_004 - [RSP-Error] - Error HTTP 409 nhất quán
- **Expected**: JSON `{code:'ERR-DPL-004', message:'...'}`.

### TD_RESYNC_P4_005 - [RSP-Error] - Error HTTP 404 nhất quán
- **Expected**: JSON `{code:'NF_404', message:'...'}`.

### TD_RESYNC_P4_006 - [RSP-Content-Type] - Content-Type application/json
- **Expected**: application/json cho cả success và error.

---

# POST /api/v1/system/partner-links/{requestCode}/cancel - Hủy liên kết Driver Plus

## Method & Header

### TD_CANCEL_P1_001 - [Smoke] - Happy Path
- **Steps**: POST JWT hợp lệ, body `{"reason":"Đổi sang tài khoản khác"}`.
- **Expected**: HTTP 200.

### TD_CANCEL_P1_002 - [Protocol] - Sai Method (PATCH thay vì POST)
- **Expected**: HTTP 405/404.

### TD_CANCEL_P1_003 - [Security] - Authorization Missing
- **Expected**: HTTP 401 `AUTH_401`.

### TD_CANCEL_P1_004 - [Security] - Token sai format
- **Expected**: HTTP 401 `AUTH_401`.

### TD_CANCEL_P1_005 - [Security] - Token hết hạn
- **Expected**: HTTP 401 `AUTH_401`.

### TD_CANCEL_P1_006 - [Security] - Role không thuộc garage-owner/accountant
- **Expected**: HTTP 403. `[PENDING_DOC]`.

### TD_CANCEL_P1_007 - [Format] - Sai Content-Type
- **Expected**: HTTP 415.

### TD_CANCEL_P1_008 - [Accept] - Sai Accept header
- **Expected**: HTTP 406. `[ASSUMPTION]`.

### TD_CANCEL_P1_009 - [Basic] - X-Tenant-Id Missing
- **Expected**: HTTP 200 (không ảnh hưởng). `[ASSUMPTION]`.

## Schema Validation

### TD_CANCEL_P2_001 - [Smoke] - Happy Path
- **Steps**: Body `{"reason": "Đổi sang tài khoản Driver Plus khác."}`.
- **Expected**: HTTP 200.

### TD_CANCEL_P2_002 - [Malformed] - Body JSON sai cú pháp
- **Expected**: HTTP 400. `[ASSUMPTION]`.

### TD_CANCEL_P2_003 - [Type] - `requestCode` sai pattern
- **Expected**: HTTP 400, `VAL_400`.

<!-- Field 'reason' (body, String, Required=Y, max 2000, no min) -->
### TD_CANCEL_P2_004 - [Missing] - Field `reason` bị Missing
- **Expected**: HTTP 400, Code `ERR-DPL-002`.

### TD_CANCEL_P2_005 - [Empty] - `reason` = ""
- **Expected**: HTTP 400, Code `ERR-DPL-002`.

### TD_CANCEL_P2_006 - [Type] - `reason` sai kiểu (Boolean)
- **Steps**: Body `{"reason": true}`.
- **Expected**: HTTP 400, `VAL_400`.

### TD_CANCEL_P2_007 - [Max Length] - `reason` vượt 2000 ký tự (2001)
- **Expected**: HTTP 400, Code `ERR-DPL-012`.

### TD_CANCEL_P2_008 - [Extra-Fields] - Payload có field lạ
- **Expected**: HTTP 200, field lạ bị bỏ qua. `[ASSUMPTION]`.

## Value, Business Logic, Cross Logic

### TD_CANCEL_P3_001 - [Smoke] - Happy Path (record LINKED)
- **Steps**: `requestCode` đang `LINKED`, `reason` hợp lệ.
- **Expected**: HTTP 200. DB: `status='UNLINKED'` (terminal), `processed_at`/`processed_by_label`/`reason` **ghi đè** giá trị cũ (khác reject/approve — record chỉ giữ action gần nhất). `uk_plr_tenant_active_link` tự giải phóng slot cho tenant. Outbox: 1 event `STATUS.CHANGED UNLINKED`. KHÔNG publish `PROFILE.SYNC`.

### TD_CANCEL_P3_002 - [Whitespace] - `reason` chỉ chứa khoảng trắng
- **Expected**: HTTP 400, Code `ERR-DPL-002`.

### TD_CANCEL_P3_003 - [EG] - `reason` chứa Emoji/Unicode
- **Expected**: HTTP 200, lưu nguyên văn (Q5).

### TD_CANCEL_P3_004 - [ECP] - `requestCode` không tồn tại
- **Expected**: HTTP 404, `NF_404`.

### TD_CANCEL_P3_005 - [IDOR] - `requestCode` thuộc tenant khác
- **Expected**: HTTP 404, `NF_404`.

### TD_CANCEL_P3_006 - [ST] - Record không còn `LINKED`
- **Steps**: `requestCode` đang `REJECTED`.
- **Expected**: HTTP 409, `ERR-DPL-004`.

### TD_CANCEL_P3_007 - [ST] - Sau khi Hủy, garage có thể nhận request mới (slot giải phóng)
- **Steps**: Hủy record E (LINKED). Sau đó gửi Kafka `PARTNER_LINK.REQUEST.CREATE` mới cho cùng garage.
- **Expected**: HTTP 200 cho cancel; request CREATE mới sau đó được chấp nhận (không bị chặn bởi single-active guard vì slot đã trống).

### TD_CANCEL_P3_008 - [ST] - Feature flag off
- **Expected**: HTTP 403, `FLAG_OFF`.

### TD_CANCEL_P3_009 - [ST] - Lỗi hệ thống khi xử lý
- **Expected**: HTTP 503, `ERR-DPL-005`.

## Response Validation

### TD_CANCEL_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ)
- **Expected**: HTTP 200. Response: `requestCode` `status`(="UNLINKED") `processedAt` `processedByLabel` `reason`(echo input) `availableActions`(=[]).

### TD_CANCEL_P4_002 - [RSP-Data] - `processedAt`/`processedByLabel`/`reason` bị GHI ĐÈ so với lần Duyệt trước đó
- **Steps**: Record đã Duyệt bởi "Lan Anh" trước đó. Hủy bởi "Đăng Vinh".
- **Expected**: `data.processedByLabel` = "Đăng Vinh (...)" — đè lên giá trị Duyệt cũ (khác hành vi resync ở endpoint trước).

### TD_CANCEL_P4_003 - [RSP-Error] - Error HTTP 400 nhất quán
- **Expected**: JSON `{code:'ERR-DPL-002', message:'...'}`.

### TD_CANCEL_P4_004 - [RSP-Error] - Error HTTP 409 nhất quán
- **Expected**: JSON `{code:'ERR-DPL-004', message:'...'}`.

### TD_CANCEL_P4_005 - [RSP-Content-Type] - Content-Type application/json
- **Expected**: application/json cho cả success và error.
