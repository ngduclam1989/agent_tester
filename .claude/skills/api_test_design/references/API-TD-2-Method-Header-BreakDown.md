# Lệnh Thực Thi - Cấu Phần 1: Kiểm Thử Phương Thức & Header (Markmap Format)

> **Prompt Version:** 1.2.0 | **Last Updated:** 2026-06-10
>
> **Changelog v1.2.0:**
> - Added `ACCEPT_HEADER_CHECK` config parameter
> - Added Step 4 (Accept header) in algorithm between Format and Basic
> - Updated Self-Audit with Accept header check

Sử dụng toàn bộ kiến thức, tài liệu (RSD & PTTK) và quy tắc Markmap đã ghi nhớ ở PROMPT 0.
Hãy thực thi sinh Test Design cho API chỉ định trong:
Mục III. GLOBAL RULES → 5. Giới hạn phạm vi dữ liệu (SCOPE LIMITATION - QUAN TRỌNG)

---

## Cấu Hình Kiểm Soát Cấu Phần (đọc trước khi thực thi)

```text
AUTH_REQUIRED      : [DEFAULT]
# Giá trị hợp lệ  : DEFAULT | YES | NO
# DEFAULT          : Tự động phát hiện từ PTTK.
#                    Nếu PTTK có Authorization/Bearer/Token → sinh đầy đủ case.
#                    Nếu PTTK không đề cập → bỏ qua, chuyển sang bước tiếp theo.
# YES              : Bắt buộc sinh đầy đủ case Authorization dù PTTK không ghi rõ.
# NO               : Bỏ qua toàn bộ [Security] (Public API). Ghi comment vào output.

METHOD_CHECK       : [DEFAULT]
# Giá trị hợp lệ  : DEFAULT | ON | OFF
# DEFAULT / ON     : Sinh case gọi sai HTTP Method (HTTP 405 / 404).
# OFF              : Bỏ qua.

CONTENT_TYPE_CHECK : [DEFAULT]
# Giá trị hợp lệ  : DEFAULT | ON | OFF
# DEFAULT / ON     : Sinh case sai Content-Type (HTTP 415).
# OFF              : Bỏ qua.

ACCEPT_HEADER_CHECK : [DEFAULT]
# NEW v1.2.0
# Giá trị hợp lệ  : DEFAULT | ON | OFF
# DEFAULT          : Tự động phát hiện từ PTTK.
#                    Nếu PTTK định nghĩa Accept header hoặc chỉ hỗ trợ application/json →
#                    sinh case gửi Accept: text/xml hoặc Accept: text/plain.
#                    Nếu PTTK không đề cập Accept → bỏ qua.
# ON               : Bắt buộc sinh case sai Accept header.
# OFF              : Bỏ qua toàn bộ kiểm thử Accept header.
```

> **Lưu ý:**
> - Custom Headers (`[Basic]`) BẮT BUỘC sinh đầy đủ, không có tham số kiểm soát.
> - `AUTH_REQUIRED=NO` chỉ tắt `[Security]`. `[Basic]` vẫn BẮT BUỘC.
> - `ACCEPT_HEADER_CHECK` kiểm tra header Accept trong request (phía client gửi lên),
>   không phải Content-Type trong response (đó là việc của Cấu phần 4).

---

## I. Mục Tiêu Và Độ Phủ

Giả định Request Body đã hợp lệ hoàn toàn. Focus 100% vào giao thức & quyền truy cập:

- `[Protocol]`  HTTP Method: Gọi sai phương thức.
- `[Security]`  Authorization: Token Missing, Invalid, Expired, Forbidden.
- `[Format]`    Content-Type: Sai Media Type request.
- `[Accept]`    Accept Header: Client yêu cầu format response không được hỗ trợ. (NEW)
- `[Basic]`     Custom Headers: Missing và Invalid Format cho header bắt buộc khác.

## II. Lệnh Cấm

1. CẤM test field trong Request Body/Payload (dành cho Cấu phần 2).
2. CẤM test logic nghiệp vụ, giá trị biên, logic chéo (dành cho Cấu phần 3).
3. CẤM Verify Database (request bị chặn tại Gateway, không chạm DB).

## III. Thuật Toán Tư Duy (Internal Algorithm)

- **Bước 0:** Đọc CẤU HÌNH. Ghi nhớ `AUTH_REQUIRED`, `METHOD_CHECK`, `CONTENT_TYPE_CHECK`,
  `ACCEPT_HEADER_CHECK`.
- **Bước 1:** Quét PTTK → xác định HTTP Method chuẩn và danh sách Header yêu cầu.
  Khởi tạo TD_001 Happy Path `[Smoke]`.
- **Bước 2: `[Protocol]`** — Áp dụng `METHOD_CHECK`.
  - ON/DEFAULT: sinh case sai Method (HTTP 405/404).
  - OFF: bỏ qua.
- **Bước 3: `[Security]`** — Áp dụng `AUTH_REQUIRED`.
  - DEFAULT: tự kiểm PTTK. Nếu có Auth → sinh 4 case: Missing(401), Invalid-format(401),
    Expired(401), Forbidden(403). Nếu không có → bỏ qua.
  - YES: bắt buộc sinh đủ 4 case trên.
  - NO: bỏ qua. Thêm comment `<!-- [Public API - No Auth Required] -->`.
- **Bước 4: `[Format]`** — Áp dụng `CONTENT_TYPE_CHECK`.
  - ON/DEFAULT: sinh case Content-Type sai (HTTP 415).
  - OFF: bỏ qua.
- **Bước 4.5: `[Accept]`** — Áp dụng `ACCEPT_HEADER_CHECK`. (NEW)
  - DEFAULT: tự kiểm PTTK. Nếu API chỉ trả JSON hoặc PTTK định nghĩa Accept →
    sinh case Accept: text/xml hoặc Accept: text/plain (HTTP 406 Not Acceptable).
  - ON: bắt buộc sinh case.
  - OFF: bỏ qua.
- **Bước 5: `[Basic]`** — BẮT BUỘC (không phụ thuộc `AUTH_REQUIRED`).
  Duyệt Custom Header khác trong PTTK. Sinh case Missing và Invalid-format cho mỗi header.

## IV. Ví Dụ Mẫu Output (Golden Sample)

```markdown
# POST /v1/trans/minval - Tạo yêu cầu cập nhật ngưỡng
## Method & Header
<!-- Happy Path này chỉ verify lớp Gateway/Protocol.
     Không thay thế Happy Path ở Cấu phần 2, 3, 4. -->
### TD_P1_001 - [Smoke] - Happy Path (Method và Header hoàn toàn hợp lệ)
- **Steps**: Gọi POST với Token hợp lệ, Content-Type: application/json,
  Accept: application/json, và đầy đủ Custom Headers.
- **Expected**: HTTP 200. Request vượt qua Gateway vào xử lý logic.

<!-- BƯỚC 1: HTTP METHOD -->
### TD_P1_002 - [Protocol] - Gọi sai HTTP Method (GET thay vì POST)
- **Steps**: Gửi request với Method là GET.
- **Expected**: HTTP 405 'Method Not Allowed' hoặc HTTP 404.

<!-- BƯỚC 2: AUTHORIZATION -->
### TD_P1_003 - [Security] - Header Authorization bị Missing
- **Steps**: Gửi request không có header Authorization.
- **Expected**: HTTP 401, Code 'ERR_UNAUTHORIZED'.
### TD_P1_004 - [Security] - Token sai format (thiếu prefix "Bearer ")
- **Steps**: Gửi request với Authorization: "<raw_token>" (không có "Bearer ").
- **Expected**: HTTP 401, Code 'ERR_TOKEN_INVALID'.
### TD_P1_005 - [Security] - Token đã hết hạn (expired)
- **Steps**: Gửi request với Token hợp lệ về format nhưng đã expired.
- **Expected**: HTTP 401, Code 'ERR_TOKEN_EXPIRED'.
### TD_P1_006 - [Security] - Token hợp lệ nhưng role không đủ quyền
- **Steps**: Gửi request với Token của role không được phép gọi endpoint này.
- **Expected**: HTTP 403, Code 'ERR_FORBIDDEN'.

<!-- BƯỚC 3: CONTENT-TYPE -->
### TD_P1_007 - [Format] - Sai Content-Type (text/plain)
- **Steps**: Gửi request với Content-Type: text/plain.
- **Expected**: HTTP 415 'Unsupported Media Type'.

<!-- BƯỚC 4: ACCEPT HEADER (NEW v1.2.0) -->
### TD_P1_008 - [Accept] - Sai Accept header (text/xml)
- **Steps**: Gửi request với Accept: text/xml trong khi API chỉ hỗ trợ application/json.
- **Expected**: HTTP 406 'Not Acceptable'.

<!-- BƯỚC 5: CUSTOM HEADERS -->
### TD_P1_009 - [Basic] - Thiếu Custom Header 'X-Client-ID' bắt buộc
- **Steps**: Gửi request thiếu header 'X-Client-ID'.
- **Expected**: HTTP 400, Code 'ERR_MISSING_CLIENT_ID'.
### TD_P1_010 - [Basic] - 'X-Client-ID' có giá trị sai định dạng
- **Steps**: Gửi request với 'X-Client-ID' không đúng format quy định trong PTTK.
- **Expected**: HTTP 400, Code 'ERR_INVALID_CLIENT_ID'.
```

## V. Thực Thi Cuối

1. **Self-Audit:**
   - Có field Request Body nào bị test không? (Nếu có → Xóa ngay).
   - Có dòng verify DB không? (Nếu có → Xóa ngay).
   - `AUTH_REQUIRED=NO` nhưng còn case `[Security]`? (Nếu có → Xóa ngay).
   - `AUTH_REQUIRED=DEFAULT/YES` nhưng thiếu 1 trong 4 case? (Nếu có → Bổ sung).
   - `ACCEPT_HEADER_CHECK=DEFAULT/ON` nhưng không có case `[Accept]`? (Nếu có → Bổ sung).
   - Happy Path dùng `[ST]` thay vì `[Smoke]`? (Nếu có → Sửa ngay).
   - Còn thiếu case `[Basic]` nào? (Nếu có → Bổ sung).
2. **Rendering:** MỘT FILE MARKDOWN DUY NHẤT trong code fence. Không có văn bản ngoài luồng.
