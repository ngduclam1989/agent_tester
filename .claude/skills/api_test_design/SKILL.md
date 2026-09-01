---
name: api_test_design
description: Sinh Test Design (Markmap) cho API theo phương pháp 4-phase (Method&Header → Schema → Business/Cross-Logic/DB → Response) từ tài liệu PTTK/RSD/DB — dùng khi KHÔNG có Swagger/OpenAPI spec. Sau khi Test Design được user confirm, sinh tiếp Manual Test Case chi tiết (schema 19 cột có Risk Level, chia block theo RBT, sẵn sàng chạy automation, bàn giao dạng .md+.xlsx) theo cơ chế Node Registry coverage 100%. Được rbt_manual_testing gọi tới khi Bước 5 phát hiện scope có API.
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
| 0. Setup Context | `references/API-TD-1-Setup-Context.md` | Nạp PTTK/RSD/DB, ghi nhớ 4-phase strategy, global rules (ưu tiên tài liệu, xử lý strikethrough = bỏ qua, chuyển "Backend Check" → "Input Data"), format Markmap chuẩn 3 tầng (`##` **nhóm rủi ro RBT** → `###` BLOCK + Risk → `####` Test Condition), quy tắc chia block & gán Risk Level (mục IV.1–IV.3) + bảng glossary tag. Sau khi nạp xong, hỏi user xác nhận đúng 1 API (Tên + Endpoint) trước khi sinh bất kỳ Test Condition nào |
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
- Bám sát **100%** mọi Test Condition (`####`) trong Test Design — 1 node = 1 hoặc nhiều TC (không tự thêm/bớt kỹ thuật ngoài Test Design).
- Không bịa endpoint/field/error code/message không có trong tài liệu — thiếu thì ghi `[PENDING_DOC]`.
- Không dùng từ chung chung ("như trên", "tương tự", "valid data"); MaxLength phải ghi chuỗi ký tự thật đúng độ dài, không viết tắt.
- Mọi TC đều phải có bước Verify; Test Steps chỉ ghi hành động kiểm tra, không giải thích business rule (giả định thì đưa vào cột `Notes`).

**Output — schema 19 cột (Contract cố định, copy chính xác header):**
```
"Test Case ID"	"Function"	"Group Tests"	"Risk Level"	"Test Case Title"	"Pre-conditions"	"Test Data"	"Test Steps"	"Expected result"	"Environment"	"Priority"	"Regression"	"Automation"	"Manual Test Results Round 1"	"Manual Test Results Round 2"	"Automation Test Results"	"Actual result"	"BugID"	"Notes"
```

> **Chuẩn hóa theo RBT (thay cho contract cũ):** thêm cột `Risk Level` ở vị trí 4;
> gộp `Scenario Outline` + `Test Case Summary` thành 1 cột `Test Case Title` ở vị trí 5;
> `Group Tests` mang **tên block** thay vì lặp lại `Function`; mỗi block có **1 dòng tiêu đề
> nhóm** in đậm đứng trước (giống `| **NHÓM FUNCTION** |` của TC UI); `Notes` bắt buộc chứa
> `TD: <Node ID>` để giữ traceability về Test Design.

**Định dạng file cuối cùng bàn giao là `.md` + `.xlsx`, KHÔNG phải `.tsv`.** TSV chỉ dùng làm **định dạng sinh trung gian tạm thời** (dễ escape/parse đúng 19 cột khi model viết tuần tự) — xem chi tiết quy trình convert + xóa TSV ở mục "Lưu trữ" bên dưới.

**Các điểm mapping quan trọng** (chi tiết đầy đủ nằm trong file reference, mục V–VII):
- **Test Case ID**: `<DỰ_ÁN>_<MODULE>_TC_<NNN>` (VD: `MSB_AMLSCREEN_TC_042`) — cùng quy tắc TC ID của `rbt_manual_testing`. `<NNN>` đánh số **liên tục toàn file, KHÔNG reset**. Node Test Design chuyển sang cột `Notes` dạng `TD: TD_P1_005`.
- **Function**: là **nhóm rủi ro RBT** — `NHÓM FUNCTION` / `NHÓM VALIDATE` / `NHÓM PHÂN QUYỀN` / `NHÓM ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN` (bản API của 5 nhóm rủi ro TC UI, bỏ nhóm *UI & Behavior*). KHÔNG ghi tên 4 cấu phần kỹ thuật vào cột này — 4-phase là cách **sinh** Test Condition, không phải cách **trình bày** Test Case; lớp kỹ thuật vẫn truy được qua `TD_P1..TD_P4` ở cột `Notes`.
- **Group Tests / Risk Level**: đọc từ Header `### BLOCK: <tên> — Risk: <mức>` của Test Design. `Risk Level` là enum sạch High/Medium/Low, gán ở **mức block**, khác trục với `Priority` (gán theo tag kỹ thuật).
- **Test Case Title**: cột tiêu đề duy nhất của TC (đã gộp `Scenario Outline` + `Test Case Summary` cũ), bắt buộc theo convention `Kiểm tra <hành động> <đối tượng> với <dữ liệu/điều kiện>` — dùng chung khuôn đặt tên với cột `Test Title` của TC UI. Giả định/`[ASSUMPTION]` ghi ở cột `Notes`.
- **Pre-conditions**: đúng 3 thành phần (User/Quyền · Trạng thái hệ thống · Dữ liệu có sẵn cụ thể), mỗi thành phần 1 dòng bắt đầu bằng `- ` — **không đánh số**. Endpoint/Headers/Base URL/DB connection chuyển hết sang cột `Test Data`.
- **Test Data**: là **nơi duy nhất** chứa URL / Headers / file `.json` / Body / DB connection. Test Steps KHÔNG lặp lại 4 thông tin này. Mỗi thành phần 1 dòng bắt đầu bằng `- ` — **không đánh số** (nội dung body giữ nguyên định dạng gốc, không thêm gạch đầu dòng vào từng dòng body).
- **Test Steps** rút gọn, chỉ ghi hành động thực thi — dùng 1 trong **2 Skeleton**:
  | Skeleton | Áp dụng khi | Nội dung |
  |---|---|---|
  | 1 | Toàn bộ TD_P1; mọi Negative case; API read-only; TD_P4 `[RSP-Schema]`/`[RSP-Error]`/`[RSP-Pagination]`/`[Smoke]` | **2 bước**: `1. Gửi <METHOD> request tới API <tên> với <tóm gọn case đang test>.` → `2. Kiểm tra thông tin HTTP Status và Response Body trả về.` |
  | 2 | Write API Happy Path P2/P3; `[BVA+]`; `[Extra-Fields]`/`[Whitespace]` expected HTTP 200; TD_P4 `[RSP-Data]` | **4 bước**: bước 1–2 như Skeleton 1, thêm `3. Truy vấn bảng <tên> với điều kiện <where>.` → `4. Verify thông tin dữ liệu trong Database.` |
  Phần `<tóm gọn case đang test>` bám sát `Scenario Outline`, nêu rõ field override + giá trị — không viết mơ hồ ("dữ liệu không hợp lệ"), không giải thích business rule.
- **Expected result** mở đầu bằng đúng số bước verify (`2.` cho response, `4.` cho DB), mỗi khối response gồm đủ 3 dòng: `2. Kiểm tra thông tin HTTP Status trả về: <mã + tên>` → `- Json trả về có <thông báo/thông tin>: ...` → `- Json có dạng theo format:` + FULL JSON body.
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
3. **Bổ sung mục 1–6 vào file `.md`** — script convert chỉ sinh phần bảng TC; agent PHẢI viết thêm 6 mục đầu để file `.md` API có cùng cấu trúc tài liệu với TC UI của `rbt_manual_testing` (Bước 6 mục 1):

   | Mục | Nội dung | Nguồn |
   |---|---|---|
   | 1. Thông tin chung | Dự án, endpoint, Base URL, link file Test Design, nguồn PTTK/RSD/TC gốc, tổng số TC, kỹ thuật áp dụng, có/không verify DB | Test Design + tài liệu đầu vào |
   | 2. Bảng tổng hợp Risk Level | Cấu phần × Block × Risk Level × Số TC + tổng theo High/Medium/Low | **Đếm lại từ file TSV cuối cùng**, không viết ước lượng |
   | 3. Test Data thiết yếu | Tài khoản/token gọi API, endpoint, header bắt buộc & optional, giá trị enum, max length, bảng mã lỗi, thông tin DB (nếu có) | PTTK |
   | 4. Traceability Matrix | Mỗi node Test Design ↔ dải TC ID phủ nó ↔ ID TC gốc (nếu tái sử dụng bộ TC có sẵn). Kèm dòng kết luận `N/N node có TC phủ` | Node Registry (PHASE 1) |
   | 5. Ambiguities & Assumptions | Mọi `[PENDING_DOC]` và `[ASSUMPTION: ...]` phát sinh khi đọc tài liệu, kèm cách xử lý đã chọn | Bước 0 Setup Context |
   | 6. Bảng thống kê | Số TC theo Priority; nếu có tái sử dụng TC cũ thì thêm bảng nguồn TC (giữ nguyên / bổ sung) | **Đếm lại từ file TSV cuối cùng** |

   Mục 7 là bảng TC chi tiết do script sinh. Đặt heading các cấu phần trong mục 7 ở mức `###` để nằm đúng dưới `## 7.`.

4. Sau khi xác nhận `.md` + `.xlsx` đã sinh đúng (đúng số TC, coverage seal khớp, đủ 7 mục) → **xóa file `.tsv` trung gian**. **File `.tsv` KHÔNG được coi là bản giao cuối** — chỉ `.md` + `.xlsx` mới là output chính thức lưu lại trong `practices/testcases/`.
5. **Chạy `python scripts/validate_testcases/validate_tc.py <file .md>`** trước khi báo hoàn thành — script có nhánh riêng cho schema 19 cột (kiểm đủ cột, TC ID liên tục 1 prefix, `Group Tests` không copy `Function`, Risk Level nhất quán trong block, `Test Case Title` đúng convention, `Notes` có `TD:`, `Pre-conditions` sạch Env/URL/Endpoint/Header, tổng số TC khớp). Sửa hết lỗi rồi chạy lại tới khi exit 0.

## Định dạng file .xlsx bàn giao (bảng màu)

File `.xlsx` do `scripts/convert_excel/api_tsv_to_md_xlsx.js` sinh ra được tô màu **tự động**.
Agent **không phải ghi thông tin màu vào TSV** — script tự suy ra từ cột `Function` và từ dạng
dòng. File mẫu để đối chiếu mắt thường:
`.claude/skills/rbt_manual_testing/templates/TC_mau_API.xlsx` (4 TC, đủ 4 mức định dạng):

| Dòng | Nền | Chữ | Căn |
|---|---|---|---|
| Header (tên cột) | `2F5597` navy | Arial 10 đậm, trắng | giữa · trên · wrap |
| Dòng nhóm mở đầu 1 **NHÓM RỦI RO** | `9DC3E6` xanh vừa | Arial 10 đậm | trái · trên · wrap |
| Dòng nhóm của các **block** tiếp theo trong cùng nhóm | `BDD7EE` xanh nhạt | Arial 10 đậm | trái · trên · wrap |
| Dòng Test Case | trắng | Arial 10 thường | trên · wrap; cột ID/Risk/Priority/kết quả căn giữa |

Viền mảnh `4472C4` cho mọi ô; freeze dòng header; bật AutoFilter. Nhãn dòng nhóm bỏ dấu `**`
khi ghi sang Excel (chỉ `.md` mới cần `**` để in đậm).

> **Điều kiện tiên quyết:** lần đầu dùng phải chạy `cd scripts/convert_excel && npm install`.
> Converter dùng `xlsx-js-style` (fork SheetJS **ghi** được style) — bản `xlsx` community chỉ
> đọc được màu, ghi ra sẽ mất sạch định dạng.

## Cross-reference

- Không có Swagger → dùng skill này (`api_test_design`), 2 bước: sinh Test Design (5 sub-step) → sinh TC (theo `API-Gen-TC-From-TD-v4.md`)
- Có Swagger → dùng `qa_automation_engineer` (`/generate_api_tests_from_swagger`) — schema TC khác (bảng Markdown, không phải schema 19 cột này), có thể tự sinh automation script luôn

## Rules References

- `.claude/rules/automation_rules.md` — Test data generation rules
