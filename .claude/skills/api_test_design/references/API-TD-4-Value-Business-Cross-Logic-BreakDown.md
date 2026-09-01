# Lệnh Thực Thi - Cấu Phần 3: Kiểm Thử Nghiệp Vụ, Logic Chéo & Database

> **Prompt Version:** 1.2.1 | **Last Updated:** 2026-06-10
>
> **Changelog v1.2.1:**
> - Removed SQL/XSS Injection from [EG] scope entirely
> - `EG_CHECK`: removed `INJECTION_ONLY` option
> - `EG_CHECK` DEFAULT: now Emoji only (was Injection + Emoji)
> - `EG_CHECK` FULL: now Emoji + Whitespace (was Injection + Emoji + Whitespace)
> - Removed TD_P3_014 (SQL Injection golden sample case)
> - Updated algorithm and Self-Audit accordingly

Sử dụng toàn bộ kiến thức, tài liệu (RSD & PTTK) và quy tắc Markmap đã ghi nhớ ở PROMPT 0.
Hãy thực thi sinh Test Design cho API chỉ định trong:
Mục III. GLOBAL RULES → 5. Giới hạn phạm vi dữ liệu (SCOPE LIMITATION - QUAN TRỌNG)

---

## Cấu Hình Kiểm Soát Cấu Phần (đọc trước khi thực thi)

```text
BVA_MODE : [DEFAULT]
# NEW v1.2.0
# Giá trị hợp lệ : DEFAULT | FULL | OFF
# DEFAULT         : Sinh 2 case NEGATIVE: Min-1 và Max+1. (hành vi cũ)
# FULL            : Sinh đầy đủ 6 case theo chuẩn ISTQB BVA:
#                   (1) [BVA]  Min-1  — dưới biên dưới         → NEGATIVE (lỗi)
#                   (2) [BVA+] Min    — tại biên dưới           → POSITIVE (thành công)
#                   (3) [BVA+] Min+1  — ngay trên biên dưới     → POSITIVE (thành công)
#                   (4) [BVA+] Max-1  — ngay dưới biên trên     → POSITIVE (thành công)
#                   (5) [BVA+] Max    — tại biên trên            → POSITIVE (thành công)
#                   (6) [BVA]  Max+1  — trên biên trên           → NEGATIVE (lỗi)
#                   Lưu ý: Case [BVA+] là POSITIVE — expected HTTP 200, KHÔNG phải 400.
# OFF             : Bỏ qua toàn bộ BVA.

EG_CHECK : [DEFAULT]
# Giá trị hợp lệ   : DEFAULT | EMOJI_ONLY | WHITESPACE_ONLY | FULL | OFF
# DEFAULT           : Sinh 1 case: Emoji và ký tự Unicode đặc biệt.
# EMOJI_ONLY        : Tương đương DEFAULT — chỉ sinh case Emoji.
# WHITESPACE_ONLY   : Chỉ sinh case Whitespace-only string.
# FULL              : Sinh cả 2 case: Emoji → Whitespace.
# OFF               : Bỏ qua toàn bộ Error Guessing.
```

> **Lưu ý:** `[ECP]`, `[DT]`, `[ST]` KHÔNG có tham số kiểm soát — BẮT BUỘC sinh đầy đủ.

---

## I. Mục Tiêu Và Độ Phủ

Giả định: Request đã PASS Cấu phần 1 và 2. Mục tiêu: bẻ gãy Business Rules trong RSD.

### 1. Lớp đơn trường (Single-Field)

**`[BVA]` Boundary Value Analysis:**
Phân tích giá trị biên cho Số học, Ngày tháng, Số tiền.

> **Quy tắc `[BVA/ECP]` khi Min = 0:**
> Nếu Min = 0 thì Min-1 = -1 trùng với ECP số âm.
> Chỉ sinh 1 case duy nhất với tag `[BVA/ECP]`. KHÔNG sinh 2 case riêng lẻ.

> **[NEW v1.2.0] Quy tắc đặc biệt cho field kiểu Date / DateTime:**
> Ngoài BVA Min-1/Max+1 thông thường, Date fields PHẢI kiểm thêm:
> - Ngày không hợp lệ về lịch: 30/02, 31/04, 31/11, 31/09 → tag `[BVA]` (invalid calendar)
> - Năm nhuận: 29/02 của năm không nhuận (VD: 29/02/2023) → tag `[BVA]`
> - Ngày quá khứ/tương lai nếu RSD có ràng buộc thời gian → tag `[ECP]`
>
> BẮT BUỘC sinh các case này cho mỗi Date field có business rule.

**`[ECP]` Equivalence Class Partitioning:**
Phân vùng invalid: số âm, sai enum, sai format nghiệp vụ, ID không tồn tại.

> **[NEW v1.2.0] Quy tắc `[IDOR]` cho field ID:**
> Với field ID (account_id, user_id, resource_id...) ngoài case ID không tồn tại `[ECP]`,
> BẮT BUỘC sinh thêm case `[IDOR]`: ID hợp lệ và tồn tại trong DB nhưng thuộc về
> user/resource KHÁC với người đang gọi API.
> Expected: HTTP 403 'ERR_FORBIDDEN' hoặc HTTP 404 'ERR_NOT_FOUND' (tùy thiết kế bảo mật).
> `[ASSUMPTION nếu PTTK không định nghĩa behavior]`: expect HTTP 403.

**`[EG]` Error Guessing — chỉ cho field Text tự do:**

> **Định nghĩa "Text tự do":**
> String/Text KHÔNG có ràng buộc format cố định. Không có regex, không phải enum, không
> phải ID/code có cấu trúc.
> ✅ ĐÚNG LÀ Text tự do: reason, description, note, comment, address_detail, remark.
> ❌ KHÔNG phải Text tự do: phone_number, email, account_id, status (enum),
>    transaction_code, date, otp_code, currency_code.

EG cases theo thứ tự (áp dụng `EG_CHECK`):

1. `[EG]` Emoji và ký tự Unicode đặc biệt.
2. `[Whitespace]` Chuỗi chỉ chứa khoảng trắng `"   "` (min 3 spaces). (NEW)
   Expected: HTTP 400 'ERR_INVALID_INPUT' HOẶC HTTP 200 với giá trị được trim/rejected.
   Lý do: `"   "` (whitespace only) không phải Empty nhưng thường fail business validation.

### 2. Lớp đa trường & Trạng thái (Cross-Field & State)

**`[DT]` Decision Table:**
Logic ràng buộc chéo ≥2 trường. Với ≥3 trường phụ thuộc: áp dụng quy trình tổ hợp 4 bước:

1. Liệt kê N trường, 2 trạng thái: VALID(V) / INVALID(I).
2. Tổ hợp lý thuyết 2^N. Loại bỏ tổ hợp không có nghĩa nghiệp vụ.
3. Chỉ giữ combination có Expected Result KHÁC NHAU thực tế.
4. Mỗi combination giữ lại → 1 test condition `[DT]`.

Ví dụ bảng tổ hợp 3 trường (min_value, max_value, daily_limit):

| Combination | min_value | max_value | daily_limit | Giữ lại? | Lý do |
|---|---|---|---|---|---|
| C1 | V | V | V | ✓ | Happy Path |
| C2 | I(min>max) | V | V | ✓ | Vi phạm rule min<max |
| C3 | V | I(max>limit) | V | ✓ | Vi phạm rule max<=limit |
| C4 | V | V | I(limit<min) | ✓ | Vi phạm rule limit>=min |
| C5-C8 | ≥2 Invalid | | | ✗ | Không thêm coverage, không định vị được nguyên nhân |

**`[ST]` State Transition:**
Điều kiện tiền quyết hệ thống/DB (VD: User phải Active, chưa có Pending request).
Tag `[ST]` CHỈ cho state pre-condition. KHÔNG dùng cho Happy Path.

> **Phân biệt tag quan trọng:**
> `[ST]` = State Transition (điều kiện tiền quyết hệ thống) — Cấu phần 3.
> `[Smoke]` = Happy Path — TẤT CẢ cấu phần. TUYỆT ĐỐI KHÔNG nhầm lẫn.

## II. Lệnh Cấm

1. CẤM test Header (Authorization, Token, Content-Type).
2. CẤM test lại lỗi Schema (Missing, Empty, Type, Max Length — đã có ở Cấu phần 2).
3. CẤM Verify DB cho case lỗi nghiệp vụ (HTTP 400, 403, 404).
4. BẮT BUỘC Verify DB cho Happy Path (TD_001) — mô tả rõ bảng, status, dữ liệu thay đổi.
5. HTTP 500 KHÔNG phải expected error trong Test Design. Nếu xảy ra → đây là bug.

## III. Thuật Toán Tư Duy (Internal Algorithm)

- **Bước 0:** Đọc CẤU HÌNH. Ghi nhớ `BVA_MODE` và `EG_CHECK`.
- **Bước 1:** Sinh TD_001 Happy Path `[Smoke]` + DB verification chi tiết.
- **Bước 2:** Vòng lặp Field-by-Field. Với mỗi field:
  a) Đối chiếu Business Rules trong RSD:
     - Có Min/Max (số hoặc ngày) → sinh BVA theo `BVA_MODE`.
       - `BVA_MODE=DEFAULT`: sinh `[BVA]` Min-1 và Max+1.
       - `BVA_MODE=FULL`: sinh đủ 6 case (`[BVA]` Min-1, `[BVA+]` Min, `[BVA+]` Min+1,
         `[BVA+]` Max-1, `[BVA+]` Max, `[BVA]` Max+1).
       - `[BVA/ECP]`: nếu Min=0 → gộp Min-1 và ECP âm thành 1 case.
     - Field là Date/DateTime → thêm date-specific BVA cases (invalid calendar, leap year).
     - Có Enum/Format/Existence rule → sinh `[ECP]`.
     - Có ID field (account_id, user_id...) → sinh `[ECP]` (ID không tồn tại)
       VÀ sinh `[IDOR]` (ID tồn tại nhưng thuộc user khác). (NEW)
  b) Field là Text tự do → áp dụng `EG_CHECK`:
     - DEFAULT: 1 case Emoji.
     - EMOJI_ONLY: 1 case Emoji (tương đương DEFAULT).
     - WHITESPACE_ONLY: 1 case Whitespace.
     - FULL: 2 case theo thứ tự Emoji → Whitespace.
     - OFF: không sinh case `[EG]`.
- **Bước 3:** Global Scan — Logic Chéo & Trạng thái:
  + Tìm "Điều kiện tiền quyết" trong RSD → sinh `[ST]`.
  + Tìm rules "Nếu... thì...", "phụ thuộc vào":
    - 2 trường phụ thuộc → sinh `[DT]` trực tiếp.
    - ≥3 trường → áp dụng tổ hợp 4 bước ở Mục I → sinh `[DT]` cho combination giữ lại.

## IV. Ví Dụ Mẫu Output (Golden Sample)

```markdown
## Value, Business Logic, Cross Logic

### BLOCK: Common — Risk: High
<!-- Happy Path này verify Business Logic và DB. Không thay thế HP ở C1, C2, C4. -->
#### TD_P3_001 - [Smoke] - Happy Path (Dữ liệu và Trạng thái hợp lệ)
- **Steps**: Request hợp lệ với tài khoản Active, chưa có yêu cầu Pending.
- **Expected**:
  - HTTP 200, Code 'SUCCESS'.
  - DB bảng 'Threshold_Requests': lưu 1 record mới, status = 'PENDING'.

### BLOCK: Field 'amount' — Risk: High
<!-- VÒNG LẶP FIELD: 'amount' (Rule: Min 10,000 — Max 50,000,000) — BVA_MODE=FULL -->
#### TD_P3_002 - [BVA] - 'amount' dưới biên dưới (Min-1 = 9,999) — NEGATIVE
- **Steps**: Request với 'amount' = 9999.
- **Expected**: HTTP 400, Code 'ERR_AMOUNT_TOO_LOW'.
#### TD_P3_003 - [BVA+] - 'amount' tại biên dưới (Min = 10,000) — POSITIVE
- **Steps**: Request với 'amount' = 10000.
- **Expected**: HTTP 200, Code 'SUCCESS'. Giá trị được chấp nhận.
#### TD_P3_004 - [BVA+] - 'amount' ngay trên biên dưới (Min+1 = 10,001) — POSITIVE
- **Steps**: Request với 'amount' = 10001.
- **Expected**: HTTP 200, Code 'SUCCESS'. Giá trị được chấp nhận.
#### TD_P3_005 - [BVA+] - 'amount' ngay dưới biên trên (Max-1 = 49,999,999) — POSITIVE
- **Steps**: Request với 'amount' = 49999999.
- **Expected**: HTTP 200, Code 'SUCCESS'. Giá trị được chấp nhận.
#### TD_P3_006 - [BVA+] - 'amount' tại biên trên (Max = 50,000,000) — POSITIVE
- **Steps**: Request với 'amount' = 50000000.
- **Expected**: HTTP 200, Code 'SUCCESS'. Giá trị được chấp nhận.
#### TD_P3_007 - [BVA] - 'amount' trên biên trên (Max+1 = 50,000,001) — NEGATIVE
- **Steps**: Request với 'amount' = 50000001.
- **Expected**: HTTP 400, Code 'ERR_AMOUNT_TOO_HIGH'.

### BLOCK: Field 'quantity' — Risk: High
<!-- VÒNG LẶP FIELD: 'quantity' (Rule: Min 0) — Min=0 → BVA/ECP kết hợp -->
#### TD_P3_008 - [BVA/ECP] - 'quantity' dưới tối thiểu / số âm (Min=0 → nhập -1)
- **Steps**: Request với 'quantity' = -1.
- **Expected**: HTTP 400, Code 'ERR_INVALID_QUANTITY'.

### BLOCK: Field 'due_date' — Risk: High
<!-- VÒNG LẶP FIELD: 'due_date' (Type: Date, Rule: không được trong quá khứ) -->
#### TD_P3_009 - [BVA] - 'due_date' là ngày quá khứ
- **Steps**: Request với 'due_date' = ngày hôm qua (VD: 2026-06-09).
- **Expected**: HTTP 400, Code 'ERR_DATE_IN_PAST'.
#### TD_P3_010 - [BVA] - 'due_date' là ngày không hợp lệ theo lịch (30/02)
- **Steps**: Request với 'due_date' = "2026-02-30".
- **Expected**: HTTP 400, Code 'ERR_INVALID_DATE'.
#### TD_P3_011 - [BVA] - 'due_date' là 29/02 của năm không nhuận
- **Steps**: Request với 'due_date' = "2025-02-29" (2025 không phải năm nhuận).
- **Expected**: HTTP 400, Code 'ERR_INVALID_DATE'.

### BLOCK: Field 'account_id' — Risk: High
<!-- Block chứa [IDOR] → Risk High theo API-TD-1 mục IV.2. -->
<!-- VÒNG LẶP FIELD: 'account_id' (Type: ID) -->
#### TD_P3_012 - [ECP] - 'account_id' không tồn tại trong hệ thống
- **Steps**: Request với 'account_id' = "999999" (Fake ID).
- **Expected**: HTTP 404, Code 'ERR_ACCOUNT_NOT_FOUND'.
#### TD_P3_013 - [IDOR] - 'account_id' tồn tại nhưng thuộc về user khác (NEW v1.2.0)
- **Steps**: Request với 'account_id' hợp lệ trong DB nhưng là tài khoản của user B,
  trong khi đang authenticate bằng Token của user A.
- **Expected**: HTTP 403 'ERR_FORBIDDEN' [ASSUMPTION nếu PTTK không định nghĩa].

### BLOCK: Field 'reason_text' — Risk: Low
<!-- Block chỉ gồm [EG] và [Whitespace] → Risk Low theo API-TD-1 mục IV.2. -->
<!-- VÒNG LẶP FIELD: 'reason_text' (Text tự do ✅) — EG_CHECK=FULL → 2 cases -->
#### TD_P3_014 - [EG] - 'reason_text' chứa Emoji và Unicode đặc biệt
- **Steps**: Request với 'reason_text' = "Khẩn 🚨🔥 <script>alert(1)</script>".
- **Expected**: HTTP 400 'ERR_INVALID_INPUT' HOẶC HTTP 200 với giá trị được
  encode an toàn (HTML entities). Không trả HTTP 500.
#### TD_P3_015 - [Whitespace] - 'reason_text' chỉ chứa khoảng trắng (NEW v1.2.0)
- **Steps**: Request với 'reason_text' = "   " (3 spaces, không phải rỗng).
- **Expected**: HTTP 400 'ERR_INVALID_INPUT' HOẶC HTTP 200 nhưng hệ thống phải
  trim/reject — không được lưu chuỗi khoảng trắng thuần vào DB.

### BLOCK: Cross-Field & State — Risk: High
<!-- BƯỚC 3: TRẠNG THÁI VÀ LOGIC CHÉO -->
#### TD_P3_016 - [ST] - Tài khoản bị khóa (INACTIVE)
- **Steps**: Request với 'account_id' của tài khoản đã bị khóa.
- **Expected**: HTTP 403, Code 'ERR_ACCOUNT_LOCKED'.
#### TD_P3_017 - [ST] - Đã có yêu cầu đang Pending cho tài khoản này
- **Steps**: Request với 'account_id' đang có yêu cầu ở trạng thái PENDING.
- **Expected**: HTTP 409, Code 'ERR_DUPLICATE_REQUEST'.
#### TD_P3_018 - [DT] - 'min_value' lớn hơn 'max_value' (logic chéo 2 trường)
- **Steps**: Request với 'min_value' = 50000, 'max_value' = 10000.
- **Expected**: HTTP 400, Code 'ERR_MIN_GREATER_THAN_MAX'.
#### TD_P3_019 - [DT] - 'max_value' vượt 'daily_limit' (C3 — tổ hợp 3 trường)
- **Steps**: Request với min=10000, max=200000000, daily_limit=100000000 (max > limit).
- **Expected**: HTTP 400, Code 'ERR_MAX_EXCEEDS_DAILY_LIMIT'.
#### TD_P3_020 - [DT] - 'daily_limit' nhỏ hơn 'min_value' (C4 — tổ hợp 3 trường)
- **Steps**: Request với min=500000, max=10000000, daily_limit=100000 (limit < min).
- **Expected**: HTTP 400, Code 'ERR_DAILY_LIMIT_TOO_LOW'.
```

## V. Thực Thi Cuối

1. **Self-Audit:**
   - Xóa hết case lỗi Schema (Missing/Empty/Type/MaxLen)?
   - Có verify DB cho case lỗi? (Xóa ngay).
   - Happy Path dùng `[ST]` thay vì `[Smoke]`? (Sửa ngay).
   - [NEW] `BVA_MODE=FULL` nhưng thiếu case `[BVA+]` POSITIVE? (Bổ sung ngay).
   - [NEW] ID field thiếu case `[IDOR]`? (Bổ sung ngay).
   - [NEW] `EG_CHECK=FULL` nhưng thiếu case `[Whitespace]`? (Bổ sung ngay).
   - Có case `[EG]` nào đang test SQL/XSS Injection? (Nếu có → Xóa ngay. Injection đã bị loại bỏ khỏi `[EG]` từ v1.2.1).
   - `EG_CHECK=DEFAULT/FULL` nhưng có nhiều hơn 1 case `[EG]` cho Emoji? (Mỗi mode chỉ sinh 1 Emoji case).
   - [NEW] Date field thiếu invalid calendar / leap year BVA? (Bổ sung ngay).
   - Min=0 nhưng sinh cả `[BVA]` và `[ECP]` số âm riêng lẻ? (Gộp thành `[BVA/ECP]`).
   - `[EG]` áp dụng sai cho non-Text-tự-do (phone, email, enum, ID, date)? (Xóa ngay).
   - `[DT]` với ≥3 trường chạy tổ hợp 4 bước và loại combination dư thừa chưa?
   - Còn thiếu case `[BVA]`, `[ECP]`, `[DT]`, `[ST]` nào? (Bổ sung ngay).
2. **Rendering:** MỘT FILE MARKDOWN DUY NHẤT trong code fence. Không có văn bản ngoài luồng.
