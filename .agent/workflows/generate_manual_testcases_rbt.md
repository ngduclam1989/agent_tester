---
description: Sinh manual test cases chất lượng cao theo quy trình AI-RBT 6 bước (Risk-Based Testing) từ requirements.
skills:
  - rbt_manual_testing
  - requirements_analyzer
---

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`rbt_manual_testing`** (tại `.agent/skills/rbt_manual_testing/SKILL.md`) trước khi bắt đầu thực hiện tác vụ này. Sử dụng **Mode FULL RBT** của skill. Ngoài ra, tham khảo thêm skill **`requirements_analyzer`** để hiểu cách phân tích giao diện nếu cần.
> Trước khi mapping hoặc xuất bảng TC, đọc thêm `.agent/skills/rbt_manual_testing/references/tc-output-contract.md` để giữ đúng schema FULL RBT.

# Workflow: Sinh Manual Test Cases theo AI-RBT Framework (FULL RBT Mode)

Workflow này sử dụng **Mode FULL RBT** của skill `rbt_manual_testing` — quy trình **AI-RBT (AI-Driven Risk-Based Testing)** gồm 6 bước tuần tự để sinh manual test cases từ tài liệu yêu cầu.

> [!NOTE]
> **Luồng này dành cho Antigravity (slash command).** Agent tự đọc skill và **phải đọc prompt template tương ứng trong `plans/manual/` trước mỗi bước** để giữ đủ độ chi tiết.
> QA team không cần tự copy-paste prompt nếu dùng slash command; agent sẽ tự dùng các prompt đó làm checklist thực thi.

## ⚠️ Nguyên tắc thực thi

- **Mode:** FULL RBT (6 bước tuần tự)
- **BẮT BUỘC chạy tuần tự** từng bước, KHÔNG gộp nhiều bước
- **PHẢI đọc prompt template tương ứng trước mỗi bước** trong `plans/manual/`
- **PHẢI dừng lại sau mỗi bước** để user xác nhận trước khi sang bước tiếp theo
- Checkpoint cứng: Bước 2 (Q&A), Bước 4 (Review Scenarios), Bước 5 (Review Test Cases trước khi mapping)
- Nếu user chưa cung cấp requirements, hỏi user cung cấp trước khi bắt đầu
- Tất cả output bằng **Tiếng Việt**

## Các bước thực hiện

Thực hiện theo hướng dẫn chi tiết trong skill `rbt_manual_testing` → phần **Mode 2: FULL RBT**.

### Bước 1: Khởi tạo ngữ cảnh (Context & Role-play)
> Trước khi làm: đọc `plans/manual/01_context_and_roleplay/prompt.txt`.

1. Yêu cầu user cung cấp: tên dự án, mô tả hệ thống, mục tiêu MVP, tài liệu yêu cầu.
2. Đọc kỹ tài liệu, xác nhận hiểu bối cảnh.
3. **Vẽ nháp Diagram (nếu thiếu các sơ đồ nghiệp vụ cần thiết):** Nếu tài liệu thiếu các diagram cần thiết (State Diagram, Sequence Diagram, Data Flow Diagram, Activity Diagram...), chủ động vẽ nháp bằng Mermaid và lưu vào thư mục `practices/diagram/`, yêu cầu người dùng confirm.
4. **Chờ user xác nhận** → sang Bước 2.

### Bước 2: Phân tích yêu cầu (Analysis & QnA)
> Trước khi làm: đọc `plans/manual/02_analysis_and_qna/prompt.txt`.

1. **Đọc và phân tích các Diagram:** Xem kỹ các diagram đã có hoặc các diagram vẽ nháp được confirm ở Bước 1.
2. **Xác định các luồng kiểm thử:** Phân rã Happy Path, Alternate Paths (bổ sung chi tiết kịch bản rẽ nhánh theo sơ đồ nghiệp vụ), Exception Paths (gồm vi phạm ràng buộc trạng thái từ State Diagram).
3. Phát hiện Ambiguities (thiếu sót, mâu thuẫn giữa đặc tả và sơ đồ, chưa rõ ràng).
4. Đặt câu hỏi Q&A có đánh số (Q1, Q2...) cho user/PO/BA với cấu trúc 3 phần (ngữ cảnh, giả định, giải pháp đề xuất).
5. **DỪNG LẠI — Chờ user trả lời câu hỏi** → sang Bước 3.

### Bước 3: Phân rã hệ thống (Decomposition)
> Trước khi làm: đọc `plans/manual/03_decomposition/prompt.txt`.

1. Chia tính năng thành Modules / Sub-modules
2. Mô tả chức năng từng Module + Dependencies giữa chúng
3. **DỪNG LẠI — Chờ user xác nhận decomposition** → sang Bước 4

### Bước 4: Đảm bảo độ bao phủ (Traceability)
> Trước khi làm: đọc `plans/manual/04_traceability/prompt.txt`.

1. Map Module → mã Yêu cầu (REQ-01, REQ-02...)
2. Cross-check thiếu sót (Gap Analysis), liệt kê High-Level Scenarios
3. **Chờ user review** scenarios → sang Bước 5

### Bước 5: Sinh Test Case chi tiết (RBT & TC Generation)
> Trước khi làm: đọc `plans/manual/05_rbt_and_tc_generation/prompt.txt`.

1. **Đánh giá Risk Level (High/Medium/Low) cho mỗi Module:**
   - **High Risk:**
     - **Function:** Test kỹ, nhiều cases bao gồm cả Happy Path và Unhappy Path của module đó. không được gộp chung hay bỏ qua bất cứ testcase nào, phân tách rõ theo các yêu cầu và scenario đã sinh, tất cả đều phải riêng rẽ và cực kì rõ ràng.
     - **Phân quyền:** Kiểm tra phân quyền của các user khác nhau (System Admin, Admin, BD Head, BD Lead, User thường...) có quyền và không có quyền sử dụng chức năng.
     - **Ảnh hưởng chức năng liên quan (Dependencies & Database Integrity):** Bắt buộc kiểm tra dữ liệu hiển thị trên List/Detail sau khi lưu, database record ghi nhận chính xác, các logic kế thừa dữ liệu ngầm định (Backend BR), các trigger tự động (Jenkins, queue message).
   - **Medium Risk:**
     - **Validate (Field-Level Validation):** Kiểm tra validation của **từng trường một** trên form/UI, không được gộp hay bỏ sót bất kỳ trường nào. Với mỗi trường, đi qua checklist: *Bỏ trống (Required), Nhập toàn khoảng trắng (whitespace-only), Độ dài tối đa (Max length), Chứa ký tự đặc biệt, Kết hợp chữ và số, Bảo mật (XSS, SQL Injection), Trim space đầu/cuối*.
     - **UI (Giao diện):** Kiểm tra hiển thị giao diện cho **từng element cụ thể** trên form (không viết test case UI chung chung) gồm nhãn hiển thị (label), placeholder, ký hiệu bắt buộc `*`, các block hiển thị động theo Feature Flag, layout, font chữ, màu sắc.
     - **Behavior & Accessibility (Hành vi & Tương tác):** Kiểm tra hành vi tương tác gồm: *Focus vào input field, di chuyển focus bằng phím Tab (từ trên xuống), phím Shift + Tab (từ dưới lên), Hover qua nút/link, thay đổi kích thước trình duyệt (Resize), phóng to/thu nhỏ (Zoom In/Out Ctrl + / -), hủy bỏ thao tác bằng nút Hủy, Breadcrumb hoặc Browser Back*.
   - **Low Risk:** Test cơ bản, các behaviors đơn giản không ảnh hưởng đến dữ liệu.
2. **Sinh test case đầy đủ:** Module, TC ID, Title, Pre-condition, Steps (đánh số), Expected (đánh số tương ứng 1-1), Test Data (cụ thể), Priority.
3. **Bao phủ đa dạng:** Happy Path, Negative Path (giá trị biên, vượt ký tự), Edge Cases.
4. **Kỹ thuật thiết kế test case:** EP, BVA, Decision Table, State Transition.
5. **Nếu scenarios quá nhiều:** Sinh từng Module một, hỏi user để tiếp tục.
6. **DỪNG LẠI — Chờ user review Test Cases** trước khi sang Bước 6 mapping/Excel.

### Bước 6: Chuẩn hóa Format & Excel Conversion (Template Mapping & Chuyển đổi Excel)
> Trước khi làm: đọc `plans/manual/06_template_mapping/prompt.txt` và `.agent/skills/rbt_manual_testing/references/tc-output-contract.md`.

1. **Tạo file Markdown tổng hợp:** Chứa thông tin chung, Bảng tổng hợp Risk Level, Test Data thiết yếu, Traceability Matrix, Bảng Ambiguities & Q&A, Bảng thống kê số lượng TC, và Bảng Test Cases chi tiết chia theo 5 nhóm rủi ro:
   - **Function** (High risk - happy/unhappy)
   - **Validation** (Medium risk - kiểm tra chéo các loại dữ liệu của từng field)
   - **UI & Behavior** (Medium risk - elements, font, màu; behavior: tab, hover, resize, focus, load)
   - **Phân quyền** (High risk)
   - **Ảnh hưởng chức năng liên quan** (High risk)
   
   *Bảng Test Cases chi tiết dạng Markdown Table:* `| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |`
   - **Quy tắc TC ID:** Bắt buộc tuân thủ định dạng **`[DỰ_ÁN]_[MODULE]_TC_[SỐ]`** (Ví dụ: `CARDOCTOR_ONBOARD_TC_001`), đánh số tuần tự liên tục từ `001` cho toàn bộ test cases (không chèn thêm `VAL` hay `UI`).
   - **Phân nhóm trong Excel:** Để tạo các dòng tiêu đề phân nhóm trực quan trong Excel, chèn một hàng rỗng chứa tiêu đề in đậm vào cột `TC ID` tại đầu mỗi nhóm, các cột khác để trống. Ví dụ:
     `| **NHÓM FUNCTION** | | | | | | | | |`
     `| **NHÓM VALIDATE** | | | | | | | | |`
     `| **NHÓM UI & BEHAVIOR** | | | | | | | | |`
     `| **NHÓM PHÂN QUYỀN** | | | | | | | | |`
     `| **NHÓM CÁC PHẦN ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN** | | | | | | | | |`
   - Test Steps và Expected Result đánh số cụ thể, tương thích 1-1, dùng `<br>` để xuống dòng.
   - Không được bỏ sót bất kỳ test case nào đã sinh ở Bước 5.
   - **Yêu cầu lưu trữ & Tránh ghi đè (Version Control):** Bắt buộc lưu trực tiếp vào thư mục con tương ứng của folder **`practices/testcases/[TÊN_FOLDER_REQUIREMENT]/`** của workspace. **TUYỆT ĐỐI KHÔNG ĐƯỢC ghi đè (overwrite)** lên file Test Cases cũ đã có sẵn. Hãy kiểm tra nếu file `TC_[MODULE].md` đã tồn tại, tự động tăng số thứ tự Version tiếp theo vào tên file (ví dụ: `TC_[MODULE] 2.md`, `TC_[MODULE] 3.md`, v.v.). Sử dụng `IsArtifact: false` khi ghi file để tránh lưu vào thư mục brain tạm thời của IDE.
2. **Convert sang file Excel (.xlsx) tự động:**
   - Bạn (Agent) **BẮT BUỘC** phải tự động chạy lệnh Terminal trong Workspace để convert file Markdown sang Excel:
     `node scripts/convert_excel/md_to_xlsx.js <đường_dẫn_tuyệt_đối_tới_file_markdown>`
   - Báo cáo rõ ràng đường dẫn file Excel mới được tạo ra trong cùng thư mục `practices/testcases/[TÊN_FOLDER_REQUIREMENT]/` cho user.

## Output

- Bảng Test Cases Markdown hoàn chỉnh được lưu tại `practices/testcases/[TÊN_FOLDER_REQUIREMENT]/TC_[MODULE].md`
- File Excel (.xlsx) được convert tự động tại `practices/testcases/[TÊN_FOLDER_REQUIREMENT]/TC_[MODULE].xlsx`
- Traceability Matrix và Danh sách Ambiguities đã giải quyết trong file.
