# Lệnh Thực Thi - Cấu Phần 4: Kiểm Thử Phản Hồi (Response Validation)

> **Prompt Version:** 1.2.0 | **Last Updated:** 2026-06-10
>
> NEW FILE — Cấu phần 4 hoàn toàn mới trong v1.2.0.
> Mục đích: kiểm tra cấu trúc và tính chính xác của dữ liệu API trả về.

Sử dụng toàn bộ kiến thức, tài liệu (RSD & PTTK) và quy tắc Markmap đã ghi nhớ ở PROMPT 0.
Hãy thực thi sinh Test Design cho API chỉ định trong:
Mục III. GLOBAL RULES → 5. Giới hạn phạm vi dữ liệu (SCOPE LIMITATION - QUAN TRỌNG)

---

## Cấu Hình Kiểm Soát Cấu Phần (đọc trước khi thực thi)

```text
RSP_SCHEMA_CHECK : [DEFAULT]
# Giá trị hợp lệ : DEFAULT | ON | OFF
# DEFAULT / ON    : Verify response body của Success response có đầy đủ fields theo PTTK.
#                   Kiểm tra kiểu dữ liệu của từng field trong response.
# OFF             : Bỏ qua.

RSP_DATA_CHECK   : [DEFAULT]
# Giá trị hợp lệ : DEFAULT | ON | OFF
# DEFAULT / ON    : Verify các field quan trọng trong response phản ánh chính xác
#                   dữ liệu đã gửi vào hoặc trạng thái trong DB.
#                   VD: Gửi amount=50000 → response.data.amount phải = 50000.
# OFF             : Bỏ qua.

RSP_ERROR_CHECK  : [DEFAULT]
# Giá trị hợp lệ : DEFAULT | ON | OFF
# DEFAULT / ON    : Verify cấu trúc error response nhất quán với các loại lỗi khác nhau.
#                   Tối thiểu kiểm tra: HTTP 400, HTTP 401/403, HTTP 404.
#                   Error response BẮT BUỘC có: HTTP Status, error code, error message.
# OFF             : Bỏ qua.

RSP_PAGINATION_CHECK : [AUTO]
# Giá trị hợp lệ : AUTO | ON | OFF
# AUTO            : Tự động phát hiện từ PTTK. Nếu API là List/Search (trả về mảng dữ liệu)
#                   → sinh case pagination. Nếu API là Create/Update/Delete → bỏ qua.
# ON              : Bắt buộc sinh case pagination dù PTTK không ghi rõ.
# OFF             : Bỏ qua toàn bộ.

RSP_CONTENT_TYPE_CHECK : [DEFAULT]
# Giá trị hợp lệ : DEFAULT | ON | OFF
# DEFAULT / ON    : Verify response header Content-Type là application/json (hoặc giá trị
#                   PTTK quy định).
# OFF             : Bỏ qua.
```

---

## I. Mục Tiêu Và Độ Phủ

Giả định: Mọi request đã PASS Cấu phần 1, 2, 3. Mục tiêu: kiểm tra "những gì API TRẢ VỀ"
có đúng hợp đồng (contract) định nghĩa trong PTTK hay không.

5 lớp kiểm thử Response:

**`[RSP-Schema]` Response Schema Validation:**
Verify response body Success có đúng cấu trúc định nghĩa trong PTTK:

- Đầy đủ fields: không thiếu field, không có field thừa không định nghĩa.
- Đúng kiểu dữ liệu cho từng field (string, number, boolean, array, object).
- Giá trị nullable hợp lệ (field có thể null thì được trả null; field không null thì không được null).

**`[RSP-Data]` Response Data Accuracy:**
Verify dữ liệu trả về phản ánh chính xác input đã gửi và/hoặc trạng thái trong DB:

- Field trả về = field đã gửi vào (round-trip accuracy).
- Trạng thái (status) trong response khớp với trạng thái lưu trong DB.
- Timestamp, ID được sinh đúng và nhất quán.

**`[RSP-Error]` Error Response Consistency:**
Verify mọi loại lỗi đều trả về cùng một cấu trúc JSON nhất quán:

- BẮT BUỘC có: HTTP Status Code đúng, error code (string), error message (string).
- KHÔNG được: trả về HTML error page, stack trace, hoặc raw exception message.
- Kiểm tra ít nhất 3 loại lỗi đại diện: 400 (Validation), 401/403 (Auth), 404 (Not Found).

**`[RSP-Pagination]` Pagination Response (chỉ cho List/Search API):**
Verify response pagination có đầy đủ metadata và data:

- Fields bắt buộc: `total` (tổng số record), `page` (trang hiện tại), `size` (số record/trang),
  `data` (mảng dữ liệu). Tên field theo PTTK.
- `data` trả về đúng số lượng record theo `size`.
- `total` phản ánh đúng tổng số record trong DB (không phải số record trong trang).
- Edge case: trang cuối (`data.length < size`) và trang rỗng (page vượt total_pages).

**`[RSP-Content-Type]` Response Content-Type Header:**
Verify header Content-Type trong response đúng với PTTK (thường là `application/json; charset=utf-8`).

## II. Lệnh Cấm

1. KHÔNG test lại logic nghiệp vụ hay schema request (đã có ở Cấu phần 2, 3).
2. KHÔNG Verify Database ở đây ngoại trừ khi `RSP_DATA_CHECK` cần đối chiếu.
3. KHÔNG sinh case cho HTTP 500 — đây là bug, không phải test condition.
4. Với `RSP_SCHEMA_CHECK`: KHÔNG tự bịa cấu trúc response nếu PTTK không định nghĩa.
   Nếu PTTK không có Response Schema → ghi `[ASSUMPTION: Dựa trên Happy Path response thực tế]`.
5. Với `RSP_PAGINATION_CHECK`: Chỉ áp dụng khi API thực sự trả về danh sách.
   KHÔNG áp dụng cho API Create/Update/Delete trả về single object.

## III. Thuật Toán Tư Duy (Internal Algorithm)

- **Bước 0:** Đọc CẤU HÌNH. Ghi nhớ tất cả tham số.
  Phân loại API: là List/Search API hay Single-Record API (ảnh hưởng `RSP_PAGINATION_CHECK`).
- **Bước 1: `[RSP-Schema]`** — Áp dụng `RSP_SCHEMA_CHECK`.
  - ON/DEFAULT: Quét phần "Response" trong PTTK.
    a) Sinh TD_001: Happy Path — verify response body có đúng cấu trúc đầy đủ.
    b) Sinh case Missing field trong response: nếu PTTK định nghĩa field X là bắt buộc trong
       response nhưng logic có thể bỏ sót → verify field X luôn có mặt.
    c) Sinh case Type mismatch trong response: field Y trong response phải là Number nhưng
       implementation có thể trả về String → verify kiểu dữ liệu.
  - OFF: Bỏ qua.

- **Bước 2: `[RSP-Data]`** — Áp dụng `RSP_DATA_CHECK`.
  - ON/DEFAULT: Xác định 3-5 field quan trọng nhất (amount, status, id, created_at...).
    Sinh case: Gửi request với giá trị cụ thể → verify field đó trong response khớp chính xác.
    Đặc biệt: verify status trong response = status trong DB (không chỉ HTTP 200).
  - OFF: Bỏ qua.

- **Bước 3: `[RSP-Error]`** — Áp dụng `RSP_ERROR_CHECK`.
  - ON/DEFAULT: Chọn 3 loại lỗi đại diện (HTTP 400, HTTP 401/403, HTTP 404).
    Với mỗi loại: verify response body có đúng cấu trúc error nhất quán (code + message).
    Verify: KHÔNG có HTML, stack trace, hay raw Java/Python exception.
  - OFF: Bỏ qua.

- **Bước 4: `[RSP-Pagination]`** — Áp dụng `RSP_PAGINATION_CHECK`.
  - AUTO: Kiểm tra PTTK. Nếu API là List/Search → tiếp tục. Nếu không → bỏ qua.
  - ON: Tiếp tục.
    Sinh các case:
    a) Page hợp lệ giữa — verify `data.length` = size, `total` > 0.
    b) Trang cuối — verify `data.length` < size (khi tổng record không chia hết cho size).
    c) Page vượt quá total_pages — verify `data` = [] và `total` = số thực tế.
    d) size=0 hoặc size âm — verify API trả về lỗi hoặc default size.
  - OFF: Bỏ qua.

- **Bước 5: `[RSP-Content-Type]`** — Áp dụng `RSP_CONTENT_TYPE_CHECK`.
  - ON/DEFAULT: Sinh 1 case verify response header Content-Type là application/json
    (hoặc giá trị PTTK quy định). Kiểm tra với cả Success và Error response.
  - OFF: Bỏ qua.

## IV. Ví Dụ Mẫu Output (Golden Sample)

Ví dụ cho: `POST /v1/trans/minval` — tạo yêu cầu cập nhật ngưỡng (Single-Record API).

```markdown
## Response Validation

### BLOCK: Common — Risk: Medium
<!-- Happy Path này chỉ verify lớp Response. Không thay thế HP ở C1, C2, C3. -->

<!-- BƯỚC 1: RSP-SCHEMA — Cấu trúc response body -->
#### TD_P4_001 - [Smoke] - Happy Path (Response Schema đầy đủ và đúng kiểu)
- **Steps**: Gửi request hợp lệ hoàn toàn.
- **Expected**:
  - HTTP 200.
  - Response body có đầy đủ fields: `code` (String), `message` (String),
    `data.request_id` (String/UUID), `data.status` (String = 'PENDING'),
    `data.created_at` (String ISO8601), `data.amount` (Number).
  - KHÔNG có field lạ không định nghĩa trong PTTK.

#### TD_P4_002 - [RSP-Schema] - Field bắt buộc 'data.request_id' luôn có trong response
- **Steps**: Gửi nhiều request hợp lệ khác nhau (amount thấp, amount cao, lý do khác nhau).
- **Expected**: Mỗi response đều có 'data.request_id' là chuỗi UUID không rỗng,
  không bao giờ null hoặc undefined.

#### TD_P4_003 - [RSP-Schema] - Field 'data.amount' trong response là Number (không phải String)
- **Steps**: Gửi request với 'amount' = 50000.
- **Expected**: Response 'data.amount' = 50000 (kiểu Number/Integer), KHÔNG phải "50000" (String).

<!-- BƯỚC 5: RSP-CONTENT-TYPE — thuộc cấu trúc chung nên gom vào block Common -->
#### TD_P4_004 - [RSP-Schema] - Response header Content-Type là application/json
- **Steps**: Gửi request hợp lệ (Success) và gửi request lỗi (HTTP 400).
- **Expected**: Cả 2 response đều có header Content-Type = 'application/json' hoặc
  'application/json; charset=utf-8'. Không được trả 'text/html' hoặc 'text/plain'.

### BLOCK: Response Data — Risk: High
<!-- Block chứa [RSP-Data] → Risk High theo API-TD-1 mục IV.2. -->
<!-- BƯỚC 2: RSP-DATA — Tính chính xác dữ liệu trả về -->
#### TD_P4_005 - [RSP-Data] - Giá trị 'amount' trong response khớp chính xác với input
- **Steps**: Gửi request với 'amount' = 123456.
- **Expected**: Response 'data.amount' = 123456. Đối chiếu DB: bảng 'Threshold_Requests'
  lưu amount = 123456. Không được làm tròn hay format lại.

#### TD_P4_006 - [RSP-Data] - Trạng thái 'status' trong response khớp với trạng thái DB
- **Steps**: Gửi request hợp lệ → ghi nhận 'data.request_id' → query DB trực tiếp.
- **Expected**: Response 'data.status' = 'PENDING' = status trong DB. Không được trả
  'APPROVED' hay status sai trạng thái ban đầu.

### BLOCK: Response Error — Risk: Medium
<!-- BƯỚC 3: RSP-ERROR — Cấu trúc error response nhất quán -->
#### TD_P4_007 - [RSP-Error] - Error response HTTP 400 có cấu trúc nhất quán
- **Steps**: Gửi request thiếu field bắt buộc để trigger HTTP 400.
- **Expected**: Response body là JSON (không phải HTML) với đúng cấu trúc:
  `{"code": "ERR_*", "message": "<mô tả lỗi>"}`. Không có stack trace, không có HTML.
  Header Content-Type = application/json.

#### TD_P4_008 - [RSP-Error] - Error response HTTP 401 có cấu trúc nhất quán
- **Steps**: Gửi request không có Authorization header để trigger HTTP 401.
- **Expected**: Response body JSON với `{"code": "ERR_UNAUTHORIZED", "message": "..."}`.
  Cùng cấu trúc với TD_P4_007 (nhất quán).

#### TD_P4_009 - [RSP-Error] - Error response HTTP 404 có cấu trúc nhất quán
- **Steps**: Gửi request với account_id không tồn tại để trigger HTTP 404.
- **Expected**: Response body JSON với `{"code": "ERR_NOT_FOUND", "message": "..."}`.
  Cùng cấu trúc với TD_P4_007 và TD_P4_008 (nhất quán).
```

Ví dụ bổ sung cho List/Search API khi `RSP_PAGINATION_CHECK=AUTO/ON`:

```markdown
### BLOCK: Response Pagination — Risk: Medium
<!-- BƯỚC 4: RSP-PAGINATION (chỉ khi là List/Search API) -->
#### TD_P4_010 - [RSP-Pagination] - Trang giữa: data.length = size và total chính xác
- **Steps**: Gọi API với page=1, size=10. DB có 25 records.
- **Expected**: `data.length` = 10, `total` = 25, `page` = 1, `size` = 10.

#### TD_P4_011 - [RSP-Pagination] - Trang cuối: data.length < size
- **Steps**: Gọi API với page=3, size=10. DB có 25 records (trang 3 chỉ có 5 records).
- **Expected**: `data.length` = 5, `total` = 25, `page` = 3.

#### TD_P4_012 - [RSP-Pagination] - Trang vượt quá tổng số trang (empty page)
- **Steps**: Gọi API với page=99, size=10. DB có 25 records (chỉ có 3 trang).
- **Expected**: `data` = [] (mảng rỗng), `total` = 25. KHÔNG trả HTTP 404 hoặc HTTP 400.
```

## V. Thực Thi Cuối

1. **Self-Audit:**
   - Có test lại logic nghiệp vụ Request không? (Xóa ngay — thuộc C2, C3).
   - `RSP_SCHEMA_CHECK=ON/DEFAULT` nhưng không verify kiểu dữ liệu field nào? (Bổ sung).
   - `RSP_DATA_CHECK=ON/DEFAULT` nhưng chỉ kiểm HTTP 200 không kiểm data value? (Bổ sung).
   - `RSP_ERROR_CHECK=ON/DEFAULT` nhưng thiếu ít nhất 1 trong 3 loại lỗi đại diện? (Bổ sung).
   - `RSP_PAGINATION_CHECK=AUTO` nhưng không phát hiện đây là List API khi PTTK có mảng
     data trả về? (Kiểm tra lại PTTK và sinh case nếu cần).
   - `RSP_CONTENT_TYPE_CHECK=ON/DEFAULT` nhưng không có case verify Content-Type? (Bổ sung).
   - Case RSP-Error có verify cả Success và Error đều trả Content-Type đúng không?
   - Happy Path dùng `[ST]` thay vì `[Smoke]`? (Sửa ngay).
   - Có tự bịa cấu trúc Response khi PTTK không định nghĩa không? (Thêm `[ASSUMPTION]`).
2. **Rendering:** MỘT FILE MARKDOWN DUY NHẤT trong code fence. Không có văn bản ngoài luồng.

---

## VI. Ghi Chú Tích Hợp

Cấu phần 4 là lớp cuối cùng trong bộ 4-phase. Khi chạy đầy đủ cả 4 cấu phần, mỗi cấu phần
verify một lớp độc lập:

- C1: Giao thức & quyền truy cập (Gateway layer).
- C2: Cấu trúc request (Parser/Validator layer).
- C3: Nghiệp vụ & trạng thái (Business Logic layer).
- C4: Phản hồi (Serializer/Response layer).

Happy Path của mỗi cấu phần KHÔNG thay thế Happy Path của cấu phần khác.
Mỗi cấu phần cần Happy Path riêng vì chúng verify các lớp khác nhau của cùng API.
