---
name: RBT Manual Testing
description: Skill sinh manual test cases với 2 modes — QUICK (sinh nhanh từ requirements) và FULL RBT (quy trình AI-RBT 6 bước có đánh giá rủi ro). Có reference ISTQB/RBT và optional grill review bổ trợ nhưng giữ nguyên schema mẫu TC cũ.
---
# RBT Manual Testing

## Description

Đây là **Master Skill** cho mọi tác vụ sinh manual test cases. Skill cung cấp **2 chế độ hoạt động** (modes) để phù hợp với mọi quy mô yêu cầu:

| Mode               | Khi nào dùng                                               | Thời gian                          |
| ------------------ | ------------------------------------------------------------ | ----------------------------------- |
| **QUICK**    | Module đơn giản, cần TC nhanh, requirements rõ ràng    | 1 lượt (không chờ user)         |
| **FULL RBT** | Module phức tạp, cần phân tích rủi ro, hệ thống lớn | 6 bước tuần tự (có checkpoint) |

**Nguyên tắc cốt lõi:**

- **Human Strategy:** Con người xác định chiến lược, mức độ rủi ro và tiêu chuẩn
- **AI Execution:** AI thực hiện phân tích, viết TCs và rà soát lỗ hổng
- **Human Verification:** Con người kiểm tra lại kết quả trước khi chốt

**Contract bất biến của mẫu TC:**

- **KHÔNG** đổi tên cột, thứ tự cột, số lượng cột hoặc format bảng TC hiện tại.
- **KHÔNG** thêm các cột mới như Technique, Automation Candidate, Test Type, Risk Score vào bảng TC chính nếu user không yêu cầu rõ.
- Các reference ISTQB/RBT chỉ dùng để cải thiện phân tích, độ phủ, risk, test data, test steps và expected result.
- Thông tin bổ sung ngoài schema TC phải đặt ở phần metadata/summary/ma trận/phụ lục của file Markdown tổng hợp.
- Trước khi sinh hoặc mapping TC, đọc `references/tc-output-contract.md` nếu có bất kỳ nghi ngờ nào về format output.

---

## When to Use

Sử dụng skill này khi:

- Sinh manual test cases từ requirements / user stories
- Phân tích requirements để phát hiện ambiguity
- Phân rã hệ thống thành modules / features
- Xây dựng traceability matrix
- Áp dụng Risk-Based Testing (đánh giá rủi ro cho test cases)
- Chuẩn hóa test cases sang bảng Markdown (Jira/Excel format)
- Sinh test cases nhanh từ requirements đơn giản

**KHÔNG** sử dụng skill này khi:

- Cần sinh automation code → dùng `qa_automation_engineer`
- Cần inspect DOM / sinh locator → dùng `ui_debug_agent` / `smart_locator_agent`
- Chỉ cần sinh test data → dùng `test_data_generator`

---

## Mode Routing — Cách chọn mode

Agent tự động chọn mode dựa trên **trigger keywords** và **ngữ cảnh**:

### → Mode QUICK

Kích hoạt khi:

- User dùng workflow `/generate_testcases_from_requirements`
- User nói: "sinh test cases nhanh", "tạo TC từ requirement này", "viết test cases cho form..."
- Requirements đã rõ ràng, scope nhỏ (1 module / 1 tính năng)
- User không yêu cầu phân tích rủi ro hay quy trình bài bản

### → Mode FULL RBT

Kích hoạt khi:

- User dùng workflow `/generate_manual_testcases_rbt`
- User nói: "quy trình 6 bước", "phân tích RBT", "sinh test cases đầy đủ", "sinh bộ TC bài bản"
- Scope lớn (nhiều modules, hệ thống phức tạp)
- User yêu cầu Traceability Matrix hoặc đánh giá Risk Level
- Requirements chưa rõ ràng, cần phân tích Ambiguity

### → Khi không rõ

Nếu không xác định được mode, agent **hỏi user**:

```
Bạn muốn sinh test cases theo chế độ nào?
1. QUICK — Sinh nhanh từ requirements (không qua bước phân tích)
2. FULL RBT — Quy trình 6 bước đầy đủ (phân tích → phân rã → RBT → sinh TC)
```

### → Bổ trợ ISTQB/RBT references

Khi user yêu cầu test plan, test strategy, entry/exit criteria, risk matrix, defect report, test summary,
estimation, monitoring metrics, exploratory charter hoặc regression governance, agent dùng tài nguyên trong
`references/` và `templates/` để bổ sung artifact. Việc bổ sung này **không được thay đổi schema bảng TC cũ**.

---

# Mode 1: QUICK — Sinh Test Cases Nhanh

## Mục đích

Sinh test cases **nhanh, đủ chất lượng** từ requirements/user stories đã rõ ràng, phù hợp cho module đơn giản hoặc khi cần kết quả ngay.

## Quy trình (1 lượt duy nhất)

**Agent phải:**

1. **Tiền xử lý file tài liệu (nếu áp dụng):** Nếu tài liệu requirements được cung cấp dưới dạng file Word (`.docx`) và chưa có file `.md` tương ứng trong workspace, Agent bắt buộc chạy `node scripts/convert_doc/docx_to_md.js <đường_dẫn_tới_file_docx>` để tạo file `.md` trước.
2. **Đọc và hiểu requirements** được cung cấp (sử dụng file `.md` đã được chuyển đổi nếu áp dụng)
3. **Xác định các luồng chính:**
   - Happy Path (luồng chính - bắt buộc gồm cả case nhập full thông tin và case chỉ nhập thông tin bắt buộc tối thiểu)
   - Negative Path (dữ liệu sai, thiếu - bao gồm cả kịch bản validate thiếu dần từ ít đến nhiều các thông tin bắt buộc)
   - Boundary Cases (giá trị biên)
4. **Áp dụng kỹ thuật thiết kế test case** tự động:
   - **Equivalence Partitioning (EP):** Chia input thành nhóm tương đương
   - **Boundary Value Analysis (BVA):** Test giá trị tại ranh giới
   - **Decision Table:** Liệt kê tổ hợp điều kiện (nếu có nhiều rules)
   - **State Transition:** Test chuyển đổi trạng thái (nếu có workflow)
5. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê **tất cả input fields** trên form/UI
   - Sinh validation test cases **riêng cho TỪNG trường** theo đặc tính riêng của nó
   - Áp dụng checklist validation theo loại field (xem bảng Field-Level Validation bên dưới)
   - **KHÔNG** gộp validation nhiều trường vào 1 test case
6. **Sinh test cases** với đầy đủ fields:
   - TC ID (format: `[DỰ_ÁN]_[MODULE]_TC_[SỐ]`)
   - Module
   - Test Case Title / Test Scenario
   - Pre-conditions
   - Test Steps (đánh số)
   - Expected Results (đánh số tương ứng)
   - Test Data (**phải cụ thể**, không placeholder)
   - Priority (Critical / High / Medium / Low)
7. **Xuất ra bảng Markdown** chuẩn, sẵn sàng copy sang Excel/Jira

## Bảng Output

```
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```

> Đây là schema QUICK mode cố định. Không thêm/xóa/sửa cột nếu user không yêu cầu rõ.

## Quy tắc Test Data (áp dụng cho cả 2 modes)

```
❌ Sai: "Nhập mã số hợp lệ"
✅ Đúng: "Nhập mã: KH-2026-0012"

❌ Sai: "Nhập email hợp lệ"
✅ Đúng: "Nhập email: test_khachhang_01@domain.com"

❌ Sai: "Nhập giá trị vượt giới hạn"
✅ Đúng: "Nhập 256 ký tự vào trường Name (max: 255)"
```

## Bảng Field-Level Validation (áp dụng cho cả 2 modes)

Khi form/UI có các input fields, agent **BẮT BUỘC** phải liệt kê từng trường và sinh validation TCs riêng theo loại:

| Loại Field                       | Validation cần test                                                                                                                                                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Text (Name, Address...)** | Required/Optional · Min length · Max length · Chỉ khoảng trắng (whitespace-only) · Ký tự đặc biệt (`<>&"'`) · XSS injection (`<script>alert(1)</script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email**                   | Format hợp lệ (`user@domain.com`) · Thiếu `@` · Thiếu domain · Domain không hợp lệ · Nhiều `@` · Ký tự đặc biệt trước `@` · Max length · Case sensitivity · Email đã tồn tại (nếu unique)                            |
| **Phone**                   | Chỉ chấp nhận số · Prefix hợp lệ (ví dụ:`+84`, `0`) · Min/Max length · Chữ cái xen lẫn · Dấu `-`, `.`, khoảng trắng · Mã vùng không hợp lệ                                                                               |
| **Date / DateTime**         | Format đúng (dd/MM/yyyy, ISO...) · Ngày không tồn tại (`31/02`, `30/02`) · Năm nhuận (`29/02/2024`) · Ngày quá khứ / tương lai (tùy business rule) · Giá trị min/max date · Timezone (nếu áp dụng)                         |
| **Number / Currency**       | Min/Max value · Số âm · Số 0 · Số thập phân · Ký tự không phải số · Overflow (số cực lớn) · Leading zeros · Định dạng currency (dấu phẩy, dấu chấm)                                                                          |
| **Dropdown / Select**       | Giá trị mặc định · Tất cả options hợp lệ · Option bị disabled · Thay đổi selection · Required validation (chưa chọn)                                                                                                                   |
| **Checkbox / Radio**        | Trạng thái mặc định · Check/Uncheck · Required validation · Nhóm radio (chỉ chọn 1)                                                                                                                                                           |
| **File Upload**             | File type hợp lệ/không hợp lệ · Max size · File rỗng (0 KB) · Tên file có ký tự đặc biệt · Multiple files (nếu cho phép) · Kéo thả vs nút chọn                                                                                   |
| **Password**                | Min/Max length · Yêu cầu ký tự đặc biệt · Yêu cầu chữ hoa/thường · Yêu cầu số · Copy-paste bị chặn? · Hiện/ẩn password · Confirm password khớp/không khớp                                                                    |
| **Textarea**                | Max length · Line breaks · HTML tags · Resize (nếu UI cho phép) · Character counter (nếu có)                                                                                                                                                     |

> **Nguyên tắc:** Mỗi trường có đặc tính riêng → validation riêng. Agent PHẢI phân tích từng field trước khi sinh TCs, không được dùng chung 1 bộ validation cho tất cả fields.

## Anti-Patterns (Mode QUICK)

- ❌ Sinh test data chung chung / placeholder
- ❌ Chỉ có Happy Path, thiếu Negative/Boundary
- ❌ Bỏ qua validation rules trong requirements
- ❌ Test Steps mơ hồ ("nhập dữ liệu" → phải ghi rõ nhập gì, ở đâu)
- ❌ Gộp validation nhiều trường vào 1 test case → mỗi trường phải có TC validation riêng
- ❌ Dùng chung 1 bộ validation cho tất cả fields (mỗi field type có checklist riêng)
- ❌ Bỏ qua security validation (XSS, SQL injection) cho text fields

---

# Mode 2: FULL RBT — Quy Trình AI-RBT 6 Bước

## Mục đích

Quy trình bài bản, tuần tự cho module phức tạp. Bao gồm phân tích Ambiguity, phân rã hệ thống, Traceability Matrix, đánh giá Risk Level, và sinh test cases chi tiết.

> ⚠️ **QUAN TRỌNG:** Quy trình này **BẮT BUỘC chạy tuần tự** từng bước. KHÔNG được gộp nhiều bước chạy 1 lần. Mỗi bước phải hoàn thành và được user xác nhận trước khi sang bước tiếp.

> [!NOTE]
> **2 luồng sử dụng riêng biệt:**
>
> - **Luồng Antigravity (slash command):** Agent thực hiện theo hướng dẫn tổng quát bên dưới. Agent KHÔNG cần đọc file prompt.txt.
> - **Luồng Copy-Paste (ChatGPT/Claude):** QA team copy nội dung prompt chi tiết từ `plans/manual/01-06/prompt.txt` vào chat AI, từng bước một.

### Bước 1: Context & Role-play (Khởi tạo ngữ cảnh & Tĩnh kiểm thử)

**Mục đích:** Thiết lập vai trò Senior QA Engineer, nạp bối cảnh dự án, xác định **Test Basis** và tiến hành **Static Testing (Tĩnh kiểm thử)** để phát hiện lỗi tài liệu sớm.

**Agent phải:**

1. Yêu cầu user cung cấp các tài liệu thuộc **Test Basis**:
   - Tên dự án / tính năng
   - Mô tả hệ thống hiện tại và bối cảnh tích hợp (downstream/upstream)
   - Mục tiêu kiểm thử (MVP, Regression, Smoke...)
   - Tài liệu yêu cầu (Requirements, User Stories, Figma link, API Swagger, PDF...)
2. **Tiền xử lý file tài liệu Word (.docx):**
   - Nếu tài liệu yêu cầu người dùng cung cấp có định dạng Word (`.docx`) và chưa có file `.md` tương ứng trong workspace, Agent **bắt buộc** phải tự động chạy script `node scripts/convert_doc/docx_to_md.js <path_to_docx>` để tạo file `.md` trước.
   - Nếu là file `.doc` cũ, thông báo người dùng Save As sang `.docx` trước khi chạy script.
3. **Đọc hiểu sâu tài liệu yêu cầu (sử dụng file `.md` đã được chuyển đổi nếu áp dụng) & Trích xuất:**
   - **Bắt buộc** trích xuất và liệt kê toàn bộ danh sách các trường dữ liệu (form/API fields), kiểu dữ liệu (data types), các ràng buộc validation tương ứng và các Feature Flags quy định trong requirements.
   - Xác định rõ **mục tiêu nghiệp vụ chính**, các tích hợp downstream/hệ thống bên thứ ba (ví dụ: IAM Keycloak, Database, Kafka Events) và các **ràng buộc kế thừa hệ thống cũ (legacy baseline)** để đảm bảo độ bao phủ.
4. **Thực hiện Static Testing (Tĩnh kiểm thử / Review đặc tả):**
   - Rà soát tài liệu yêu cầu bằng danh sách kiểm tra (Checklist) để phát hiện các lỗi chất lượng tài liệu sớm (phù hợp với ISTQB Static Testing):
     - Tính đầy đủ (Completeness): Yêu cầu có bị bỏ sót chi tiết nào không?
     - Tính nhất quán (Consistency): Các yêu cầu có mâu thuẫn lẫn nhau không?
     - Tính kiểm thử được (Testability): Các tiêu chí chấp nhận (Acceptance Criteria) có rõ ràng và đo lường được không?
5. **Vẽ nháp Diagram (nếu thiếu các sơ đồ nghiệp vụ cần thiết):**
   - Nếu tài liệu yêu cầu thiếu các diagram quan trọng như: **State Diagram** (Sơ đồ trạng thái), **Sequence Diagram** (Sơ đồ tuần tự), **Data Flow Diagram** (Sơ đồ luồng dữ liệu), hoặc **Activity Diagram** (Sơ đồ hoạt động)...
   - Agent có thể chủ động vẽ nháp các diagram này bằng định dạng Mermaid (hoặc text/yaml mô tả tương ứng) và lưu vào thư mục `practices/diagram/` với tên file tương ứng với chức năng (ví dụ: `practices/diagram/onboard_tenant_state.mermaid` hoặc `practices/diagram/onboard_tenant_activity.mermaid`).
   - Sau đó, yêu cầu người dùng (User) xem và confirm sơ đồ này trước khi tiếp tục.
6. Tóm tắt scope kiểm thử, bối cảnh nghiệp vụ, danh sách các tài liệu thuộc **Test Basis**, kết quả review tĩnh sơ bộ, các thông tin trường dữ liệu đã trích xuất, và danh sách các diagram đã vẽ nháp (nếu có).
7. **Chờ user xác nhận** trước khi sang Bước 2.

**Output:** Xác nhận hiểu bối cảnh + Danh sách Test Basis + Kết quả review tĩnh sơ bộ + các diagram đã vẽ nháp (nếu có).

---

### Bước 2: Analysis & QnA (Phân tích yêu cầu & Bóc tách Test Conditions)

**Mục đích:** Phân tích tài liệu, các diagram để xác định **Test Conditions (Điều kiện kiểm thử)**, phát hiện điểm mờ (Ambiguities) và bóc tách kịch bản rẽ nhánh.

**Agent phải:**

1. **Xác định Test Conditions (Cần kiểm thử cái gì):**
   - Chuyển đổi Requirements từ Test Basis thành các Test Conditions cụ thể (ví dụ: "Verify chức năng phân quyền truy cập", "Verify validation độ dài ký tự của trường Subdomain"). 
   - Tách biệt rõ ràng việc xác định "Cần test cái gì" (Test Conditions) trước khi đi vào chi tiết "Test như thế nào" (Test Cases).
2. **Đọc và phân tích các Diagram để làm rõ Test Conditions:**
   - Đọc kỹ các diagram (State Diagram, Sequence, Data Flow, Activity Diagram...) đã có sẵn hoặc các sơ đồ nháp được confirm ở Bước 1.
   - Phân tích các bước chuyển trạng thái (State transitions), các luồng tương tác giữa các hệ thống (Sequence), luồng dữ liệu (Data flow) và luồng hoạt động (Activity flow).
3. **Xác định và phân rã chi tiết các luồng kiểm thử (không được viết gộp chung):**
   - **Happy Path:** Bao gồm kịch bản nhập đầy đủ (Full fields), kịch bản chỉ nhập bắt buộc tối thiểu (Minimal fields), và các kịch bản kết hợp bỏ trống các trường tùy chọn (Optional fields combinations) - áp dụng với tất cả các trường hợp thêm, sửa thông tin dữ liệu bản ghi.
   - **Alternate Paths & Branching Scenarios:** Các luồng xử lý thành công khác theo Feature Flags, loại thực thể hoặc các điều kiện rẽ nhánh. **Bổ sung chi tiết các scenarios cho tất cả các phần rẽ nhánh, các trường hợp điều kiện (Conditional Logic)** dựa trên diagram và tài liệu (ví dụ: nếu điều kiện A đúng -> chạy luồng X, nếu điều kiện A sai -> chạy luồng Y).
   - **Exception & Validation Paths:** Bao gồm các kịch bản thiếu từng trường bắt buộc riêng lẻ, thiếu 2 trường, thiếu nhiều trường, vi phạm ràng buộc duy nhất (Unique Constraints), vi phạm trạng thái nghiệp vụ (State Constraints) (được bóc tách chi tiết từ State Diagram), vi phạm logic rẽ nhánh có điều kiện, và lỗi tích hợp hệ thống.
4. **Phát hiện Ambiguities (Điểm mờ, thiếu sót, mâu thuẫn) thông qua Static Testing nâng cao:**
   - Kiểm tra các yêu cầu bị thiếu sót (ví dụ: không quy định độ dài tối đa/tối thiểu của các trường textbox, định dạng regex của email/SĐT, timeout, hành vi xử lý khi mất kết nối mạng...).
   - Phát hiện các yêu cầu mâu thuẫn giữa các phần, giữa tài liệu mới và baseline legacy, hoặc giữa tài liệu đặc tả và diagram.
   - Phát hiện các điểm mô tả chưa rõ ràng về logic nghiệp vụ (Business Rules).
5. **Đặt câu hỏi Q&A có cấu trúc rõ ràng:**
   - Đặt câu hỏi Q&A có đánh số thứ tự (Q1, Q2...) cho user/PO/BA giải đáp.
   - **Bắt buộc** mỗi câu hỏi phải có cấu trúc gồm 3 phần: (1) Ngữ cảnh phát hiện điểm mờ (Ambiguity Context), (2) Giả định của QA (QA Assumption) nếu không được trả lời, và (3) Đề xuất phương án xử lý (Proposed solution).
   - **Tuyệt đối không tự ý phỏng đoán** logic nghiệp vụ để tự sinh test cases khi các điểm mờ cốt lõi chưa được làm rõ.
6. **DỪNG LẠI — Chờ user trả lời** các câu hỏi Q&A trước khi chuyển sang Bước 3.

**Output:** Danh sách Test Conditions + Danh sách luồng kiểm thử + Các kịch bản rẽ nhánh theo diagram + Ambiguities + Câu hỏi Q&A.

> [!IMPORTANT]
> **Đây là điểm nghẽn quan trọng nhất.** Nếu agent bỏ qua bước này và tự đoán logic, test cases sẽ sai nghiêm trọng. Agent PHẢI dừng lại và đợi user phản hồi.

---

### Bước 3: Decomposition (Phân rã hệ thống)

**Mục đích:** Chia tính năng phức tạp thành các Module / Sub-module nhỏ, dễ quản lý.

**Agent phải:**

1. Phân rã theo 1 trong 2 cách:
   - **Theo UI:** Header, Data Table, Form popup, Sidebar...
   - **Theo luồng:** Flow tạo mới, Flow chỉnh sửa, Flow xóa...
2. Mô tả ngắn gọn chức năng từng Module
3. Chỉ ra Dependencies giữa các Module

**Output:** Danh sách Modules/Sub-modules + Dependencies.

---

### Bước 4: Traceability (Đảm bảo độ bao phủ đa chiều)

**Mục đích:** Thiết lập ma trận truy vết (Traceability Matrix) đa chiều để đảm bảo 100% requirements từ Test Basis được phủ bởi Test Conditions và Test Scenarios.

**Agent phải:**

1. Xây dựng **Traceability Matrix** ánh xạ: `Requirements (REQ-ID) ↔ Test Conditions ↔ Test Scenarios / Test Cases`.
2. Cross-check xem có yêu cầu nào bị thiếu trong danh sách phân rã (Gap Analysis) để phát hiện lỗ hổng kiểm thử (Test coverage gaps).
3. Liệt kê High-Level Test Scenarios cho từng Module, tập trung vào các Test Conditions:
   - Security / phân quyền (Access Control & Roles)
   - UI Validation (Giao diện và định dạng)
   - Business Logic & State Transitions (Nghiệp vụ & Chuyển trạng thái)
   - Data Integrity (Tính toàn vẹn dữ liệu trong DB và Backend)
   - Error Handling (Xử lý lỗi hệ thống & Ngoại lệ)
4. **Chờ user review** danh sách scenarios và ma trận truy vết trước khi sinh test case chi tiết.

**Output:** Traceability Matrix đa chiều + High-Level Test Scenarios.

> [!WARNING]
> **Human Checkpoint:** User cần review danh sách scenarios để bổ sung các trường hợp đặc thù mà AI có thể bỏ sót. Đây là bước đánh giá rủi ro do con người thực hiện.

---

### Bước 5: RBT & TC Generation (Sinh Test Case chi tiết theo ISTQB)

**Mục đích:** Sinh test cases chi tiết theo chiến lược Risk-Based Testing (RBT) và áp dụng các kỹ thuật thiết kế kiểm thử tiêu chuẩn của ISTQB.

**Agent phải thực hiện nghiêm ngặt các quy tắc sau:**

1. **Đánh giá Risk Level cho mỗi Module/Chức năng:**

   - **High Risk:**
     - **Function:** Test kỹ, nhiều cases bao gồm cả Happy Path (bắt buộc gồm: (1) nhập đầy đủ tất cả thông tin bắt buộc + optional, và (2) chỉ nhập thông tin bắt buộc tối thiểu) và Unhappy Path của module đó để lần sau không bị thiếu nữa.
       - **Logic rẽ nhánh & Điều kiện (Conditional/Branching Logic):** Kiểm tra sự thay đổi thuộc tính/validate của các trường (bắt buộc/tùy chọn với tất cả các TH CRUD) dựa trên lựa chọn dữ liệu (ví dụ: khi loại Tenant là GARAGE thì các trường Invoice và Consultant là bắt buộc, còn khi là VENDOR thì là tùy chọn). Các TC phải đi từng điều kiện theo sơ đồ hình cây để có thể kết hợp đầy đủ không bị sót điều kiện kết hợp(với tất cả các case happy vs unhappy path).
       - **Ngoại lệ hệ thống & Môi trường (System Exceptions & Environment):** Bắt buộc viết kịch bản mất kết nối Internet, lỗi kết nối API/DB 500 để verify khả năng hiển thị lỗi và bảo toàn dữ liệu.
       - **Các Tab/Sub-modules mở rộng (Extended Sub-modules):** Đối với các thực thể lớn, phải bao phủ kịch bản kiểm thử các tab chức năng liên quan (ví dụ: tab chỉnh sửa hồ sơ năng lực, tab quản lý tài khoản con, tab liên kết đối tác/nhà xe).
     - **Phân quyền:** Kiểm tra phân quyền của các user khác nhau (vd: trong hệ thống có các role như sau System Admin, Admin, BD Head, BD Lead, User thường...) bắt buộc phải có test case với từng loại có quyền và không có quyền sử dụng chức năng.
     - **Ảnh hưởng chức năng liên quan (Dependencies & Database Integrity):** Bắt buộc có các kịch bản kiểm tra (các luồng liên quan có thể sẽ thêm 1 hoặc vài TC theo luồng chính của luồng liên quan):
       - Kiểm tra dữ liệu hiển thị trên màn hình danh sách (List) sau khi lưu thành công.
       - Kiểm tra dữ liệu hiển thị trên màn hình chi tiết (Detail) sau khi lưu thành công.
       - Kiểm tra database record được lưu chính xác (đủ các trường dữ liệu và đúng kiểu).
       - Kiểm tra logic kế thừa dữ liệu ngầm định (Backend Business Rules - ví dụ: tự động provisioning branch/warehouse mặc định).
       - Kiểm tra các trigger tự động (ví dụ: webhook, Jenkins trigger, message queue publish).
   - **Medium Risk:**
     - **Validate (Field-Level Validation):** Kiểm tra validation của **từng trường một**. Bắt buộc sinh kịch bản validate cho **tất cả các trường input trên form/UI**, không được gộp hay bỏ sót bất kỳ trường nào. Với mỗi trường, xác định loại trường (Text, Email, Phone, Date, Number, Dropdown, Checkbox, File, Password, Textarea) và áp dụng **đầy đủ checklist validation tương ứng** được định nghĩa chi tiết trong **Bảng Field-Level Validation (áp dụng cho cả 2 modes)** ở phía trên. Tuyệt đối không sử dụng một bộ validation chung chung hoặc gộp chung validation của các trường khác loại.
     - **UI (Giao diện):** Kiểm tra hiển thị giao diện cho **từng element cụ thể** trên form (không viết test case UI chung chung). Bao gồm kiểm tra nhãn hiển thị (label), placeholder, ký hiệu bắt buộc `*`, các block hiển thị động theo Feature Flag, layout cân đối, font chữ và màu sắc của từng element.
     - **Behavior & Accessibility (Hành vi & Tương tác):** Kiểm tra hành vi tương tác gồm:
       - Focus vào input field (đổi màu viền hoặc hiển thị con trỏ).
       - Nhấn phím `Tab` di chuyển focus tuần tự từ trên xuống dưới.
       - Nhấn phím `Shift + Tab` di chuyển focus tuần tự từ dưới lên trên.
       - Di chuột (Hover) qua các nút bấm, link liên kết.
       - Thay đổi kích thước trình duyệt (Resize) xem giao diện có bị vỡ.
       - Phóng to / Thu nhỏ trình duyệt (Zoom In/Out Ctrl + / Ctrl -).
       - Hủy bỏ thao tác bằng nút Hủy, Breadcrumb hoặc Browser Back.
       - Kiểm tra trạng thái điều khiển (Control States - ví dụ: trạng thái mặc định của nút Lưu bị disabled khi chưa điền đủ các trường bắt buộc).
   - **Low Risk:** Test cơ bản, các behaviors đơn giản không ảnh hưởng đến dữ liệu.

2. **Áp dụng 5 Kỹ thuật thiết kế kiểm thử tiêu chuẩn ISTQB để thiết kế Test Cases:**
   - **Equivalence Partitioning (EP):** Chia các giá trị đầu vào thành các phân vùng tương đương hợp lệ (Valid) và không hợp lệ (Invalid). Đảm bảo mỗi phân vùng được kiểm thử ít nhất một lần.
   - **Boundary Value Analysis (BVA):** Xác định các giá trị biên của phân vùng tương đương. Áp dụng kỹ thuật biên 2-point hoặc 3-point (ví dụ: với khoảng [1, 100], test các giá trị: 0, 1, 2, 99, 100, 101).
   - **Decision Table Testing (Bảng quyết định):** Thiết lập bảng quyết định cho các business rules phức tạp có sự kết hợp điều kiện (như logic rẽ nhánh, conditional fields). Mỗi cột trong bảng đại diện cho một rule kết hợp các điều kiện và hành động tương ứng.
   - **State Transition Testing (Chuyển đổi trạng thái):** Dựa trên State Diagram được xác định ở Bước 1 & 2 để viết các kịch bản kiểm thử việc chuyển đổi qua lại giữa các trạng thái, bao gồm cả việc cố gắng thực hiện transition không hợp lệ.
   - **Use Case Testing (Kiểm thử theo Use Case):** Thiết kế kịch bản dựa trên use case hoặc quy trình nghiệp vụ tổng thể (E2E) từ góc nhìn của người dùng cuối.

3. **Sinh test case với đầy đủ các trường (fields):**
   - Module / Sub-module
   - Test Case ID (Format: `[DỰ_ÁN]_[MODULE]_TC_[SỐ]`)
   - Test Case Title
   - Pre-conditions (Ghi rõ vai trò đăng nhập, trạng thái Feature Flag)
   - Test Steps (đánh số cụ thể 1, 2, 3...)
   - Expected Results (đánh số cụ thể 1, 2, 3... tương ứng 1-1 với từng Test Step, dựa trên **Test Oracle** rõ ràng từ đặc tả)
   - Test Data (phải cụ thể, không dùng placeholder chung chung)
   - Priority (Critical / High / Medium / Low)

   > Nếu cần đánh giá **Automation Candidate** hoặc **Test Type**, ghi vào phần summary/phụ lục/handoff note.
   > Không thêm các thông tin này thành cột trong bảng TC chính nếu user không yêu cầu đổi mẫu.

4. **Bao phủ đa dạng:** Happy Path (gồm case nhập full thông tin và case chỉ nhập thông tin bắt buộc tối thiểu), Negative Path (giá trị biên, vượt ký tự, validate thiếu dần các trường bắt buộc), Edge Cases.
5. **Nếu scenarios quá nhiều:** Sinh từng Module một, hỏi user để tiếp tục.

**Output:** Danh sách Test Cases chi tiết có Risk Level.

---

### Optional Grill Review (không phải bước riêng)

**Mục đích:** Chất vấn lại scenarios/test cases để lộ giả định ẩn, thiếu coverage, risk bị đánh giá thấp, ambiguity chưa chốt hoặc regression impact chưa được xem xét.

Chỉ dùng khi:

- User yêu cầu "grill", "hỏi lại", "challenge", "review ngược", "stress-test test cases/test plan".
- Tính năng có risk cao, nhiều integration, nhiều role/permission, hoặc update chức năng hiện có.
- Sau Bước 4 cần grill High-Level Scenarios trước khi sinh TC.
- Sau Bước 5 cần grill danh sách TC trước khi mapping sang Markdown/Excel ở Bước 6.

Quy tắc vận hành:

1. Đọc `references/grill-qa-decision-tree.md` để chọn nhóm câu hỏi phù hợp.
2. Nếu phần chất vấn liên quan AI-assisted testing/automation handoff, đọc thêm `references/grill-ai-testing-interrogation.md`.
3. Hỏi **một câu một lần**, kèm câu trả lời đề xuất và lý do.
4. Nếu có thể tự kiểm tra từ requirements, scenario list hoặc TC vừa sinh, hãy kiểm tra trước khi hỏi user.
5. Ghi kết quả vào phần **Grill Findings / Open Questions / Decisions** trong summary hoặc phụ lục.
6. Không thay đổi schema bảng TC chính. Nếu phát hiện cần thêm thông tin ngoài schema, đưa vào summary/phụ lục/handoff note.

Kết quả grill có thể dùng để:

- Bổ sung hoặc sửa Test Conditions trước Bước 5.
- Bổ sung TC còn thiếu trong Bước 5 nhưng vẫn theo schema cũ.
- Ghi nhận câu hỏi mở/assumption trước khi Bước 6 đóng gói.
- Tạo Test Strategy Decision Record bằng `templates/grill-test-strategy-decision-record.md` nếu user cần.

---

### Bước 6: Template Mapping & Excel Conversion (Đóng gói và Chuyển đổi Excel)

**Mục đích:** Tạo 1 file Markdown tổng hợp đầy đủ và chạy script tự động convert sang file Excel (.xlsx).

**Agent phải thực hiện chuẩn xác các bước sau:**

#### BƯỚC 1: TẠO FILE MARKDOWN TỔNG HỢP

Tạo 1 file Markdown duy nhất và **bắt buộc lưu trực tiếp vào thư mục con tương ứng của folder `practices/testcases/` dựa theo tên folder chứa tài liệu requirements** (ví dụ: nếu tài liệu requirements được đọc từ `practices/requirements/cardoctor/` -> file Test Cases bắt buộc phải lưu vào `practices/testcases/cardoctor/TC_[MODULE].md`).

> ⚠️ **QUY TẮC PHIÊN BẢN (VERSION CONTROL):**
>
> - **TUYỆT ĐỐI KHÔNG ĐƯỢC ghi đè (overwrite)** lên file Test Cases cũ đã tồn tại trong thư mục.
> - Agent phải kiểm tra xem file target đã tồn tại chưa. Nếu file `TC_[MODULE].md` đã có sẵn, hãy tự động tăng số thứ tự Version tiếp theo vào đuôi tên file (ví dụ: `TC_[MODULE] 2.md`, `TC_[MODULE] 3.md`, v.v.). Áp dụng quy tắc tương tự cho file Excel (.xlsx) convert tương ứng.
> - Không đặt `IsArtifact: true` khi ghi file này để tránh bị IDE ép buộc lưu vào thư mục brain tạm thời. Hãy ghi trực tiếp vào workspace với `IsArtifact: false`.

File Markdown phải chứa TOÀN BỘ các thông tin sau:

1. **Thông tin chung:** Dự án, Module, URL, Tổng số TC, Kỹ thuật áp dụng.
2. **Bảng tổng hợp Risk Level:** Thống kê rủi ro theo tính năng.
3. **Danh sách tài khoản Test / Test Data thiết yếu.**
4. **Traceability Matrix:** Bảng tham chiếu Requirements - Test Cases.
5. **Bảng tổng hợp Ambiguities & Câu hỏi Q&A (Assumptions).**
6. **Bảng thống kê:** Số lượng TC theo mức độ Priority và Kỹ thuật test.
7. **BẢNG TEST CASES CHI TIẾT** (dưới dạng Markdown Table) bắt buộc chia theo từng group riêng biệt theo đúng thứ tự:
   - **Function** (happy case, unhappy case) (High risk)
   - **Validation** (với mỗi field riêng biệt cần có TC riêng biệt, tuân thủ kiểm tra chéo các loại dữ liệu) (Medium risk)
   - **UI & Behavior** (UI layout, elements; behaviors: tab, shift tab, hover, focus, load, resize) (Medium risk)
   - **Phân quyền** hoặc liên quan tới tài khoản người dùng (High risk)
   - **Ảnh hưởng chức năng liên quan** (High risk)

*Các cột bắt buộc trong Bảng Test Cases:* `TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data`

- Đây là schema FULL RBT / Excel mapping cố định. Không thêm/xóa/sửa cột nếu user không yêu cầu rõ.
- **Quy tắc TC ID:** Bắt buộc tuân thủ nghiêm ngặt định dạng **`[DỰ_ÁN]_[MODULE]_TC_[SỐ]`** (Ví dụ: `CARDOCTOR_ONBOARD_TC_001`). Đánh số tuần tự, liên tiếp từ `001` đến hết cho toàn bộ test cases (không chèn thêm các ký tự phụ như `VAL`, `UI` giữa các nhóm test cases).
- **Phân nhóm trong Excel:** Để tạo các dòng tiêu đề phân nhóm trực quan trong file Excel Excel, hãy chèn một hàng rỗng chứa tiêu đề in đậm vào cột `TC ID` tại đầu mỗi nhóm, các cột khác để trống. Ví dụ:
  `| **NHÓM FUNCTION** | | | | | | | | |`
  `| **NHÓM VALIDATE** | | | | | | | | |`
  `| **NHÓM UI & BEHAVIOR** | | | | | | | | |`
  `| **NHÓM PHÂN QUYỀN** | | | | | | | | |`
  `| **NHÓM CÁC PHẦN ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN** | | | | | | | | |`
- Test Steps và Expected Result phải được đánh số cụ thể tương ứng 1-1, dùng `<br>` để xuống dòng trong ô.
- **TUYỆT ĐỐI không được bỏ sót** bất kỳ test case nào đã sinh ở Bước 5.

#### BƯỚC 2: CONVERT SANG EXCEL (TỰ ĐỘNG BẰNG SCRIPT)

Ngay sau khi sinh và lưu xong file Markdown ở Bước 1 vào thư mục `practices/testcases/[TÊN_FOLDER_REQUIREMENT]/` tương ứng, bạn (AI Agent) **BẮT BUỘC** phải tự động chạy lệnh Terminal trong Workspace để convert file Markdown đó sang file Excel (.xlsx) nằm trong cùng thư mục đó.

- Lệnh chạy: `node scripts/convert_excel/md_to_xlsx.js <đường_dẫn_tuyệt_đối_tới_file_markdown>`
  *(Lưu ý: Không tự xuất file CSV. File Excel sẽ do script này tự động tạo ra dựa trên các bảng Test Cases trong file Markdown. Hãy ghi rõ đường dẫn file Excel được tạo ra để người dùng dễ dàng truy cập).*

**Output:**

- Bảng Test Cases Markdown hoàn chỉnh được lưu tại `practices/testcases/[TÊN_FOLDER_REQUIREMENT]/TC_[MODULE].md`.
- File Excel (.xlsx) đã được tự động convert thành công tại `practices/testcases/[TÊN_FOLDER_REQUIREMENT]/TC_[MODULE].xlsx`.

---

## Quy định về độ chi tiết và phân rã (Test Case Granularity)

Để đáp ứng các tiêu chuẩn kiểm thử khác nhau của từng dự án (đặc biệt là các dự án yêu cầu kiểm thử chi tiết cực hạn như Cardoctor), Agent cần xác định và áp dụng mức độ phân rã test cases phù hợp:

### 1. Mức độ chi tiết cực hạn (Granular Testing - Khuyến nghị mặc định cho các dự án chi tiết)

* **NHÓM VALIDATE (Field-Level Validation):**
  * **BẮT BUỘC** viết test case **riêng biệt cho từng trường hợp lỗi (negative test case) của từng trường dữ liệu**. KHÔNG gộp nhiều điều kiện validate (như trống, quá dài, ký tự đặc biệt, unicode, XSS) của cùng một trường vào chung một test case.
  * *Ví dụ:* Với trường "Subdomain", phải tách thành: 1 TC check trống, 1 TC check độ dài > 20 ký tự, 1 TC check ký tự đặc biệt/chữ hoa, 1 TC check trùng lặp.
* **NHÓM UI & BEHAVIOR:**
  * **BẮT BUỘC** viết test case **riêng biệt cho giao diện hiển thị của từng element trên form/UI**. Mỗi trường nhập liệu, nút bấm, nhãn hiển thị (label), placeholder, ký hiệu bắt buộc `*` cần được verify riêng biệt về vị trí, màu sắc, font chữ và trạng thái hoạt động (enable/disable).
  * *Ví dụ:* 1 TC check UI nhãn và placeholder trường Tên Tenant, 1 TC check UI nhãn và placeholder trường SĐT, 1 TC check UI hiển thị và trạng thái mặc định của nút Lưu.
  * **Tách biệt** các hành vi tương tác phím (Tab, Shift + Tab, focus, hover, resize, zoom, hủy bỏ) thành các kịch bản riêng biệt để dễ dàng kiểm tra độc lập và gán lỗi (log bug) khi thực thi.

### 2. Mức độ tối ưu hóa (Optimized Testing)

* Chỉ áp dụng khi scope dự án nhỏ, có yêu cầu rõ ràng từ người dùng về việc tinh gọn bộ test case để đẩy nhanh tiến độ.
* Gộp các validate đơn giản của cùng một trường thành các bước nhỏ hoặc bộ test data trong 1 test case.
* Verify UI toàn bộ form bằng 1 test case tổng quát.

### 3. Quy tắc bắt buộc thiết kế Happy Path và Validation (Thiếu thông tin bắt buộc)

Để tránh hiện tượng sai lệch, thiếu sót dữ liệu, khi kiểm thử bất kỳ form nhập liệu/khởi tạo/cập nhật nào, Agent **bắt buộc** phải thiết kế đầy đủ các kịch bản sau:

* **Happy Path (Dữ liệu hợp lệ):**

  * **BẮT BUỘC** viết ít nhất 1 test case nhập **đầy đủ toàn bộ thông tin** (bao gồm cả trường bắt buộc và các trường tùy chọn/optional).
  * **BẮT BUỘC** viết ít nhất 1 test case **chỉ nhập thông tin bắt buộc tối thiểu** (bỏ trống hoàn toàn tất cả các trường tùy chọn/optional) để verify backend xử lý giá trị mặc định/null chính xác.
  * **BẮT BUỘC** viết các kịch bản kiểm thử Happy Path **chỉ bỏ trống 1 hoặc 2 hoặc 3 hoặc nhiều hơn các trường tùy chọn (optional fields) cho đến khi bao phủ toàn bộ các tổ hợp kết hợp của chúng** (ví dụ: bỏ trống từng trường độc lập, bỏ trống cặp 2 trường, 3 trường,... cho tới khi hết các trường tùy chọn). Các trường tùy chọn này phải được liệt kê đầy đủ và kết hợp với nhau một cách chi tiết để verify backend và UI xử lý độc lập hoặc phối hợp chính xác khi thiếu một phần dữ liệu tùy chọn (không được gộp chung hay làm tắt các kịch bản này).
  * **BẮT BUỘC** phân rã theo các nhánh chọn dữ liệu khác nhau nếu form/UI có các trường lựa chọn giá trị (dropdown, radio, checkbox, combobox, enum...). Các kịch bản Happy Path phải được thiết kế kết hợp để bao phủ tất cả các nhánh lựa chọn này (ví dụ: kết hợp các loại Tenant khác nhau với các mô hình kinh doanh, gói dịch vụ và giải pháp khác nhau) để đảm bảo mọi giá trị lựa chọn hợp lệ đều được bao phủ ít nhất một lần.
* **Unhappy Path & Validation (Thiếu thông tin bắt buộc từ ít đến nhiều):**

  * **BẮT BUỘC** viết test case **thiếu từng trường bắt buộc riêng lẻ** (mỗi trường có 1 test case báo lỗi validate riêng).
  * **BẮT BUỘC** viết test case **thiếu đồng thời 2 trường bắt buộc** ngẫu nhiên hoặc liên quan.
  * **BẮT BUỘC** viết test case **thiếu nhiều trường bắt buộc cùng lúc** (từ 3-4 trường bắt buộc) để verify khả năng hiển thị đồng thời các lỗi validate trên UI mà không bị sót.
  * **BẮT BUỘC** viết test case **để trống hoàn toàn form** và nhấn Lưu.
  * Đối với các **trường bắt buộc có điều kiện (Conditional fields)** theo Feature Flag hoặc Business Rules (ví dụ: chỉ bắt buộc khi flag bật hoặc khi chọn loại tenant là Garage):
    * Viết 1 test case nhập đầy đủ thông tin khác nhưng **chỉ thiếu 1 trường bắt buộc** trong nhóm conditional.
    * Viết 1 test case **thiếu toàn bộ** các trường trong nhóm conditional đó.
* **Unhappy Path & Logic Errors (Nghiệp vụ lỗi & Logic thất bại):**
  Để kiểm thử toàn diện các kịch bản nghiệp vụ chính bị thất bại hoặc bị chặn bởi logic hệ thống (Business Rules), Agent **bắt buộc** phải thiết kế đầy đủ các kịch bản sau:

  * **BẮT BUỘC** viết test case vi phạm **ràng buộc duy nhất (Unique Constraints)** của tất cả các trường quy định duy nhất trên hệ thống (ví dụ: trùng subdomain, trùng số điện thoại, trùng email).
  * **BẮT BUỘC** viết test case vi phạm **logic rẽ nhánh/điều kiện (Conditional Branching)** khi người dùng chọn một nhánh nghiệp vụ nhưng truyền dữ liệu vi phạm quy tắc của nhánh đó (ví dụ: chọn loại Tenant là GARAGE nhưng truyền thiếu trường bắt buộc của GARAGE như MST/Tên công ty xuất hóa đơn khi bật flag Purchase).
  * **BẮT BUỘC** viết test case vi phạm **trạng thái nghiệp vụ (State/Lifecycle Constraints)** khi cố gắng thực hiện hành động trên một thực thể đang ở trạng thái không cho phép (ví dụ: cố tình cập nhật thông tin hóa đơn khi Tenant đang ở trạng thái tạm khóa `stage=INACTIVE` và `status=DEACTIVATING`).
  * **BẮT BUỘC** viết test case kiểm tra việc xử lý lỗi khi **tích hợp hệ thống bên thứ ba (Third-party Integration failures)** hoặc lỗi hệ thống backend (ví dụ: lỗi provisioning tài khoản IAM Keycloak, lỗi kết nối cơ sở dữ liệu, lỗi gửi message sang Kafka topic) để đảm bảo dữ liệu không bị sai lệch và hệ thống hiển thị mã lỗi chính xác.

> **Quy tắc vàng:** Khi phân tích tài liệu yêu cầu (Requirements), Agent **bắt buộc** phải trích xuất và liệt kê đầy đủ danh sách tất cả các trường thông tin (form fields) cùng các validation rules tương ứng của chúng. Nếu phát hiện trong workspace đã có sẵn file test cases dạng Granular (ví dụ có file `TC_... 2.xlsx` chứa hàng trăm test cases cho một form đơn giản), Agent **phải tự động áp dụng Mức độ chi tiết cực hạn (Granular Testing)** để đảm bảo đồng nhất về chất lượng và độ phủ kiểm thử.

---

- ❌ Gộp nhiều bước chạy 1 lần trong FULL RBT (PHẢI tuần tự)
- ❌ Tự đoán business logic khi chưa hỏi user (Bước 2 - FULL RBT)
- ❌ Bỏ qua bước phân tích Ambiguity (FULL RBT)
- ❌ Sinh test data chung chung / placeholder
- ❌ Rút gọn hoặc bỏ sót test case khi mapping sang bảng
- ❌ Sinh tất cả test cases 1 lần cho hệ thống lớn (phải chia module)
- ❌ Chỉ có Happy Path, thiếu Negative/Boundary cases (QUICK)
- ❌ Test Steps mơ hồ, không ghi rõ dữ liệu nhập
- ❌ Gộp validation nhiều trường vào 1 test case → mỗi trường phải có TC validation riêng
- ❌ Dùng chung 1 bộ validation cho tất cả fields (Email ≠ Phone ≠ Date ≠ Text)
- ❌ Bỏ qua security validation (XSS, SQL injection) cho text/textarea fields
- ❌ Không liệt kê danh sách fields trước khi sinh validation TCs
- ❌ Thêm/xóa/đổi tên/đổi thứ tự cột của mẫu TC cũ khi áp dụng reference ISTQB/RBT
- ❌ Ép chạy Grill Review khi user không yêu cầu và risk không đủ cao

---

## ISTQB/RBT References

Các tài nguyên này là playbook tham chiếu để enrich workflow RBT. Agent chỉ đọc file cần thiết theo ngữ cảnh:

| Nhu cầu | File tham chiếu |
| --- | --- |
| Bảo vệ schema mẫu TC cũ | `references/tc-output-contract.md` |
| Biết khi nào handoff sang skill khác | `references/cross-skill-handoff-map.md` |
| Test process và deliverables | `references/test-process-and-deliverables.md` |
| Risk-based testing formal | `references/risk-based-testing.md` |
| Kỹ thuật thiết kế test | `references/test-design-techniques.md` |
| Static testing/review checklist | `references/static-testing.md` |
| Test levels/types và entry/exit | `references/test-levels-types.md` |
| Test estimation | `references/test-estimation.md` |
| Monitoring/metrics/reporting | `references/test-monitoring-metrics.md` |
| Defect lifecycle/bug quality | `references/defect-lifecycle.md`, `references/bug-report-quality.md` |
| Exploratory/checklist-based testing | `references/experience-based-techniques.md` |
| Regression governance | `references/regression-suite-strategy.md` |
| Automation handoff | `references/automation-playwright-best-practices.md` |
| Optional grill/challenge scenarios & TC | `references/grill-qa-decision-tree.md` |
| Optional AI-assisted testing challenge | `references/grill-ai-testing-interrogation.md` |

## ISTQB/RBT Templates

Các template này chỉ dùng khi user yêu cầu artifact tương ứng hoặc khi cần đưa vào phụ lục/summary. Không dùng chúng
để thay bảng TC chính:

| Artifact | Template |
| --- | --- |
| Test plan / strategy | `templates/test-plan.md` |
| Risk assessment matrix | `templates/risk-assessment-matrix.md` |
| Test conditions | `templates/test-conditions.md` |
| Traceability matrix | `templates/traceability-matrix.csv` |
| Test environment readiness | `templates/test-environment-checklist.md` |
| Exploratory charter | `templates/exploratory-charter.md` |
| Bug report / defect log | `templates/bug-report.md`, `templates/bug-log.csv` |
| Regression suite definition | `templates/regression-suite.md` |
| Test summary report | `templates/test-summary-report.md` |
| Optional grill decision record | `templates/grill-test-strategy-decision-record.md` |
| Optional QA artifact source | `templates/test-cases.csv`, `templates/playwright-spec.ts` |

Nếu template tham chiếu có schema khác với mẫu TC cũ của project, chỉ dùng nội dung đó làm gợi ý phân tích; không thay thế
schema bảng TC chính.

## Prompt Templates

Các prompt template mẫu cho quy trình FULL RBT nằm tại:

```
plans/manual/
├── 01_context_and_roleplay/prompt.txt
├── 02_analysis_and_qna/prompt.txt
├── 03_decomposition/prompt.txt
├── 04_traceability/prompt.txt
├── 05_rbt_and_tc_generation/prompt.txt
└── 06_template_mapping/prompt.txt
```

Agent cần đọc prompt template tương ứng **trước khi** thực hiện mỗi bước (FULL RBT mode).

Mode QUICK không yêu cầu đọc prompt templates — agent áp dụng trực tiếp các kỹ thuật EP/BVA/Decision Table.

---

## Output Format

### Mode QUICK

| Output            | Mô tả                                                |
| ----------------- | ------------------------------------------------------ |
| Bảng TC Markdown | Test Cases đầy đủ, sẵn sàng copy sang Excel/Jira |

### Mode FULL RBT

| Bước | Output                                        |
| ------ | --------------------------------------------- |
| 1      | Xác nhận bối cảnh                         |
| 2      | Luồng + Ambiguities + Câu hỏi Q&A          |
| 3      | Module Decomposition + Dependencies           |
| 4      | Traceability Matrix + High-Level Scenarios    |
| 5      | Test Cases chi tiết (Risk Level + Test Data) |
| 6      | Bảng Markdown chuẩn (Jira/Excel ready)      |

Tất cả output phải bằng **Tiếng Việt**, format **Markdown**, sử dụng **Artifact** nếu nội dung dài.
