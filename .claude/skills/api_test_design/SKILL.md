---
name: api_test_design
description: Sinh Test Design (Markmap) cho API theo phương pháp 4-phase (Method&Header → Schema → Business/Cross-Logic/DB → Response) từ tài liệu PTTK/RSD/DB — dùng khi KHÔNG có Swagger/OpenAPI spec. Sau khi Test Design được user confirm, sinh tiếp Manual Test Case chi tiết (schema 19 cột, sẵn sàng chạy automation, bàn giao dạng .md+.xlsx) theo cơ chế Node Registry coverage 100%. Được rbt_manual_testing gọi tới khi Bước 5 phát hiện scope có API.
---

# API Test Design (4-Phase Method)

## Description

Skill sinh **Test Design** — danh sách Test Condition dạng Markmap, độ phủ cực chi tiết theo chuẩn ISTQB Advanced — cho 1 API cụ thể, dựa trên tài liệu kỹ thuật thông thường (không phải file Swagger/OpenAPI máy đọc được). Sau khi Test Design được user review & confirm, skill chạy tiếp bước sinh **Manual Test Case** chi tiết đến mức chạy automation được ngay, schema 19 cột, đảm bảo phủ 100% mọi Test Condition qua cơ chế Node Registry. Bản giao cuối là `.md` + `.xlsx` (TSV chỉ là định dạng sinh trung gian, xóa sau khi convert — xem mục "Lưu trữ").

## Khi nào dùng skill này

- Cần sinh test case cho API nhưng **không có** Swagger/OpenAPI spec — chỉ có tài liệu PTTK (API/Technical Spec), RSD (Use Case/nghiệp vụ), và có thể có DB Design
- Được `rbt_manual_testing` gọi tới ở Bước 5 khi Bước 1 đã xác định module/feature có phần API (API-only hoặc mixed UI+API)
- Cần độ phủ rất chi tiết cho từng field, từng lớp (Gateway/Parser/Business/Response) của 1 API

## Khi nào KHÔNG dùng

- Đã có Swagger/OpenAPI spec (URL hoặc file JSON/YAML) → dùng `/generate_api_tests_from_swagger` (skill `qa_automation_engineer`) — nhanh hơn, có thể tự sinh automation script luôn trong cùng workflow
- Test case cho UI/form → dùng `rbt_manual_testing` (flow gốc, không qua skill này)

## Input cần có

- **PTTK** (API/Technical Spec) — "Cấu trúc": endpoint, data type, max length, ràng buộc required, cấu trúc response
- **RSD** (Use Case/Nghiệp vụ) — "Luật chơi": luồng nghiệp vụ, business rules, expected messages. Khi PTTK và RSD mâu thuẫn về logic/validation → ưu tiên RSD; về tên trường/cấu trúc → ưu tiên PTTK
- **DB Design** (tùy chọn) — cấu trúc bảng, ERD, ràng buộc dữ liệu tầng DB. Nếu không có: ghi `[ASSUMPTION: Không có tài liệu DB — bỏ qua mọi assertion tầng Database]`

**Nguyên tắc scope:** Mỗi lượt chạy skill này **chỉ sinh Test Design cho 1 API** (1 method + 1 endpoint) được xác nhận trước khi bắt đầu — không trộn nhiều API trong cùng 1 lượt.

**Nguyên tắc REST vs BFF:** Nếu 1 API nghiệp vụ có cả bản REST gốc (backend service) và bản BFF (GraphQL passthrough qua `agg-garage-graph` hoặc tương đương) trỏ tới cùng REST đó, **chỉ sinh Test Design + Test Case cho bản REST** — **KHÔNG** sinh thêm bộ TC riêng cho bản BFF passthrough (tránh trùng lặp coverage khi BFF chỉ forward request/response, không có logic nghiệp vụ riêng). Chỉ sinh TC riêng cho BFF khi BFF có logic khác biệt thật sự so với REST gốc (ví dụ: enrich thêm field qua DataLoader, cache riêng ở tầng BFF, đổi shape response, hoặc tồn tại độc lập không map tới REST nào).

## Quy trình 5 bước

| Bước | File tham chiếu | Nội dung |
|---|---|---|
| 0. Setup Context | `references/API-TD-1-Setup-Context.md` | Nạp PTTK/RSD/DB, ghi nhớ 4-phase strategy, global rules (ưu tiên tài liệu, xử lý strikethrough = bỏ qua, chuyển "Backend Check" → "Input Data"), format Markmap chuẩn + bảng glossary tag. Sau khi nạp xong, hỏi user xác nhận đúng 1 API (Tên + Endpoint) trước khi sinh bất kỳ Test Condition nào |
| 1. Cấu phần 1 — Method & Header | `references/API-TD-2-Method-Header-BreakDown.md` | `[Protocol]` `[Security]` `[Format]` `[Accept]` `[Basic]` — lớp Gateway/quyền truy cập |
| 2. Cấu phần 2 — Schema Validation | `references/API-TD-3-Schema-Validation-BreakDown.md` | `[Missing]` `[Empty]` `[Type]` `[Max Length]` `[Malformed]` `[Extra-Fields]` — lớp Parser/Validator cấu trúc request |
| 3. Cấu phần 3 — Business/Cross-Logic/DB | `references/API-TD-4-Value-Business-Cross-Logic-BreakDown.md` | `[BVA]` `[BVA+]` `[ECP]` `[IDOR]` `[EG]` `[Whitespace]` `[DT]` `[ST]` — lớp Business Logic & trạng thái |
| 4. Cấu phần 4 — Response Validation | `references/API-TD-5-Response-Validation-BreakDown.md` | `[RSP-Schema]` `[RSP-Data]` `[RSP-Error]` `[RSP-Pagination]` `[RSP-Content-Type]` — lớp phản hồi |

**Bắt buộc:** đọc đúng file tham chiếu tương ứng trước khi thực thi từng bước — không tự nhớ lại quy tắc của cấu phần trước để áp cho cấu phần sau (mỗi cấu phần có LỆNH CẤM riêng, tránh lẫn lộn phạm vi).

Mỗi cấu phần có Happy Path (`[Smoke]`) riêng — Happy Path của cấu phần này KHÔNG thay thế Happy Path của cấu phần khác vì mỗi cấu phần verify một lớp độc lập của cùng API.

## Checkpoint bắt buộc

Sau khi xong đủ 4 cấu phần → gộp toàn bộ Test Condition thành **1 file Test Design duy nhất** (Markmap, theo đúng format ở `references/API-TD-1-Setup-Context.md` mục IV) → trình cho user review → **CHỜ user confirm** trước khi sang bước sinh Test Case. Tuyệt đối không tự ý generate TC khi chưa có xác nhận Test Design.

## Bước tiếp theo (sau khi TD được confirm): Gen Manual Test Case từ Test Design

Đây là một **prompt/bước riêng biệt**, dùng file tham chiếu `references/API-Gen-TC-From-TD-v4.md` — đọc toàn bộ file này trước khi thực thi, không tự suy diễn lại từ trí nhớ.

**Input:** Test Design Markdown vừa confirm (Primary Input — nguồn coverage duy nhất) + tài liệu RSD/PTTK (nguồn dữ liệu chi tiết hóa: JSON body, endpoint, DB schema, error code/message, response structure) + tài liệu DB connection (nếu có).

**Nguyên tắc cốt lõi:**
- Bám sát **100%** mọi Test Condition (`###`) trong Test Design — 1 node = 1 hoặc nhiều TC (không tự thêm/bớt kỹ thuật ngoài Test Design).
- Không bịa endpoint/field/error code/message không có trong tài liệu — thiếu thì ghi `[PENDING_DOC]`.
- Không dùng từ chung chung ("như trên", "tương tự", "valid data"); MaxLength phải ghi chuỗi ký tự thật đúng độ dài, không viết tắt.
- Mọi TC đều phải có bước Verify; Test Steps chỉ ghi hành động kiểm tra, không giải thích business rule (giả định thì đưa vào Test Case Summary).

**Output — schema 19 cột (Contract cố định, copy chính xác header):**
```
"Test Case ID"	"Function"	"Group Tests"	"Scenario Outline"	"Test Case Summary"	"Pre-conditions"	"Test Data"	"Test Steps"	"Expected result"	"Environment"	"Priority"	"Regression"	"Automation"	"Manual Test Results Round 1"	"Manual Test Results Round 2"	"Automation Test Results"	"Actual result"	"BugID"	"Notes"
```

**Định dạng file cuối cùng bàn giao là `.md` + `.xlsx`, KHÔNG phải `.tsv`.** TSV chỉ dùng làm **định dạng sinh trung gian tạm thời** (dễ escape/parse đúng 19 cột khi model viết tuần tự) — xem chi tiết quy trình convert + xóa TSV ở mục "Lưu trữ" bên dưới.

**Các điểm mapping quan trọng** (chi tiết đầy đủ nằm trong file reference, mục V–VII):
- **Test Case ID**: `<TD_ID>_TC_<NNN>` (VD: `TD_P1_005_TC_003`) — `<NNN>` là bộ đếm **riêng theo từng nhóm** TD_P1/P2/P3/P4, **reset về 001** mỗi khi chuyển nhóm.
- **Test Steps** dùng 1 trong 4 Skeleton tùy có cần verify DB hay không:
  | Skeleton | Áp dụng khi | Số bước |
  |---|---|---|
  | A1 | TD_P1 mọi case; TD_P2/P3 Negative; Read-only API | 5 bước, verify response = bước 5 |
  | A2 | Write API Happy Path P2/P3; `[BVA+]`; `[Extra-Fields]`/`[Whitespace]` expected HTTP 200 | 8 bước, verify response = bước 6, verify DB = bước 8 |
  | B1 | TD_P4 `[RSP-Schema]`/`[RSP-Error]`/`[RSP-Pagination]`/`[Smoke]` | 5 bước, verify response = bước 5 |
  | B2 | TD_P4 `[RSP-Data]` (query đối chiếu, không phải verify ghi) | 7 bước, verify response = bước 5, DB comparison = bước 7 |
- **Verify DB**: mặc định KHÔNG verify cho mọi Negative case, toàn bộ TD_P1, và TD_P4 (trừ `[RSP-Data]` — chỉ query đối chiếu). BẮT BUỘC verify DB cho Happy Path/`[BVA+]` trên Write API. Xem bảng đầy đủ ở file reference mục V.3.
- **Priority** map theo tag: `[Smoke]` `[BVA]` `[BVA+]` `[IDOR]` `[RSP-Schema]` `[RSP-Data]` `[Security]` → High; `[ECP]` `[DT]` `[ST]` `[Accept]` `[Format]` `[Basic]` `[Malformed]` `[Extra-Fields]` `[BVA/ECP]` `[RSP-Error]` `[RSP-Pagination]` → Medium; `[EG]` `[Whitespace]` → Low.
- **Environment** = `"SIT"`, **Regression** = `"Yes"`, **Automation** = `"Yes"` (cố định). Cột 14–19 để trống.

**Cơ chế đảm bảo phủ 100% (bắt buộc thực hiện đủ 4 phase, xem mục V.5 của file reference):**
1. **Phase 1 — Build Node Registry**: quét toàn bộ Test Design, lập danh sách node nội bộ (không in ra).
2. **Phase 2 — Generate**: sinh TC tuần tự theo registry, đánh dấu từng node đã xong.
3. **Phase 3 — Self-Audit**: chạy đủ checklist (không sót node, NNN không nhảy số/reset đúng, không verify DB sai chỗ, không dùng từ chung chung, mọi Error Code thiếu phải là `[PENDING_DOC]`...). Nếu còn gap → sinh bổ sung rồi audit lại.
4. **Phase 4 — Coverage Seal**: chỉ in kết quả khi Phase 3 pass 100%, kèm dòng comment `-- COVERAGE SEAL: 100% | Nodes converted: X/X | TCs generated: N | Gaps resolved: N --` và thông báo tổng kết cuối.

## Lưu trữ

1. Ghi tạm nội dung TC ra `practices/testcases/[folder]/api/TC_[MODULE]_API.tsv` (thư mục con `api/` riêng, tách biệt khỏi TC UI cùng feature khi feature là mixed UI+API — xem rule cấu trúc thư mục chung ở mục "Lưu trữ" của skill `rbt_manual_testing`), không ghi đè file cũ — tự tăng version nếu đã tồn tại.
2. **Bắt buộc convert ngay sang bản giao cuối:** chạy `node scripts/convert_excel/api_tsv_to_md_xlsx.js practices/testcases/[folder]/api/TC_[MODULE]_API.tsv` để sinh `TC_[MODULE]_API.md` + `TC_[MODULE]_API.xlsx` trong cùng thư mục `api/`.
3. Sau khi xác nhận `.md` + `.xlsx` đã sinh đúng (đúng số TC, coverage seal khớp) → **xóa file `.tsv` trung gian**. **File `.tsv` KHÔNG được coi là bản giao cuối** — chỉ `.md` + `.xlsx` mới là output chính thức lưu lại trong `practices/testcases/`.

## Cross-reference

- Không có Swagger → dùng skill này (`api_test_design`), 2 bước: sinh Test Design (5 sub-step) → sinh TC (theo `API-Gen-TC-From-TD-v4.md`)
- Có Swagger → dùng `qa_automation_engineer` (`/generate_api_tests_from_swagger`) — schema TC khác (bảng Markdown, không phải schema 19 cột này), có thể tự sinh automation script luôn

## Rules References

- `.claude/rules/automation_rules.md` — Test data generation rules
