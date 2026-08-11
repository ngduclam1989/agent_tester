---
description: Phân tích requirement document (Jira ticket, .doc, user story) — sinh tài liệu phân tích chi tiết, KHÔNG sinh test cases.
skills:
  - requirements_analyzer
---

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`requirements_analyzer`** (tại `.claude/skills/requirements_analyzer/SKILL.md`) để hiểu cách phân tích yêu cầu chuẩn trước khi bắt đầu.

# Workflow: Phân Tích Requirement Document

Workflow này phân tích requirement documents (Jira tickets, .doc files, user stories, design mockups) và sinh ra một tài liệu phân tích chi tiết. **KHÔNG sinh test cases** — chỉ tập trung vào hiểu, phân rã, và phát hiện rủi ro/mơ hồ trong yêu cầu.

## Khi nào sử dụng

- User cung cấp Jira ticket (.doc) hoặc requirement document và yêu cầu "phân tích"
- User muốn hiểu rõ scope, acceptance criteria, và dependencies trước khi viết test
- User cần danh sách các điểm mơ hồ (ambiguities) để clarify với PO/BA
- User nói: "phân tích requirement", "review yêu cầu", "analyze this ticket"

## Đầu vào (Input)

Agent cần thu thập từ user:

| # | Input | Bắt buộc | Mô tả |
|---|---|---|---|
| 1 | **Requirement document** | ✅ | File .doc, .md, URL Jira, hoặc text mô tả yêu cầu |
| 2 | **Mockup/Screenshot** | ⭕ Khuyến khích | Hình ảnh UI design, wireframe, hoặc screenshot hiện tại |
| 3 | **Related tickets** | ⭕ Tùy chọn | Các ticket phụ thuộc hoặc liên quan (dependencies) |
| 4 | **Context bổ sung** | ⭕ Tùy chọn | Thông tin về hệ thống hiện tại, business domain |

> [!NOTE]
> Nếu user chỉ cung cấp file .doc mà không có mockup, agent vẫn phải phân tích đầy đủ dựa trên nội dung document. Nếu có mockup/screenshot, agent phân tích UI chi tiết hơn.

## Các bước thực hiện

### Bước 1: Thu thập và đọc hiểu (Information Gathering)

1. **Đọc requirement document** được user cung cấp (file .docx, .doc, .md, hoặc URL)
   - **Tự động convert file Word (.docx):** Nếu tài liệu cung cấp là file `.docx` và chưa có file `.md` tương ứng trong workspace, Agent **bắt buộc** chạy lệnh Node.js sau để chuyển đổi trước khi phân tích:
     `node scripts/convert_doc/docx_to_md.js <đường_dẫn_tới_file_docx>`
   - Nếu là file `.doc` cũ, hướng dẫn người dùng "Save As" sang `.docx` trước.
   - Nếu file .doc format HTML (export từ Jira): parse HTML để trích xuất nội dung
   - Xác định: Ticket ID, Type, Priority, Status, Reporter, Assignee, Fix Version, Sprint, Labels
2. **Đọc mockup/screenshot** nếu có — phân tích UI layout, components, fields
3. **Kiểm tra related tickets** nếu có trong cùng thư mục hoặc được user cung cấp
   - Đọc và tóm tắt dependencies
4. **Xác nhận** đã nắm được bối cảnh → tiếp tục phân tích

### Bước 2: Trích xuất thông tin cốt lõi (Core Analysis)

1. **Tổng quan Ticket** — Bảng metadata (ID, Type, Priority, Status, Sprint, Assignee...)
2. **User Story** — Trích xuất format "As a... I want... So that..."
3. **Phạm vi áp dụng (Scope)** — Xác định rõ các module/page/component bị ảnh hưởng
4. **Acceptance Criteria** — Phân rã từng AC thành các nhóm logic, bao gồm:
   - Mô tả chi tiết từng AC
   - Bảng so sánh (nếu có cột mới, field mới, rule mới)
   - Phân biệt rõ **mặc định vs tùy chọn** (nếu applicable)

### Bước 3: Phân tích UI từ Mockup (nếu có)

Nếu user cung cấp mockup/screenshot:

1. **Mô tả layout** — Breadcrumb, header, sidebar, main content, footer
2. **Liệt kê components** — Tables, forms, modals, buttons, dropdowns, tabs
3. **Chi tiết fields** — Tên field, loại (input/dropdown/date picker), label, placeholder
4. **So sánh** mockup với document — phát hiện inconsistency
5. **Chụp quan sát** vào carousel trong artifact (nếu hình có sẵn)

### Bước 4: Phân tích Dependencies (Phụ thuộc)

1. Xác định các ticket/feature liên quan (referenced trong AC hoặc comments)
2. Đọc và tóm tắt nội dung ticket phụ thuộc
3. Nếu có mockup riêng cho dependency → phân tích UI chi tiết (fields, modals, interactions)
4. Tổng hợp **Business Rules** từ tất cả requirements + mockups
5. Đánh dấu rõ quy tắc nào từ ticket chính vs ticket phụ thuộc

### Bước 5: Phát hiện điểm thiếu/điểm mờ — Gap Review (Trọng tâm)

> [!IMPORTANT]
> Đây là phần **giá trị cao nhất** của workflow — mục tiêu là tìm được **càng nhiều điểm thiếu/mờ càng tốt**, có bằng chứng cụ thể, không bỏ sót bất kỳ điểm nào (kể cả LOW/cosmetic).

Bước này **PHẢI thực hiện theo đúng phương pháp ở mục 5 "Phát hiện điểm thiếu/điểm mờ (Requirement Gap Review)" của skill `requirements_analyzer`** (đã nạp bắt buộc ở đầu workflow này) — nghĩa là:

1. Đi qua đủ **6 dimension** (AC completeness, BR coverage, UX state coverage, Field/data match, Cross-source consistency, Missing dependency).
2. Với mỗi dimension, soi thêm **5 depth lens** (Biên & ngoại lệ, Nhất quán trạng thái, Tương tranh & xung đột, Bảo mật & dữ liệu, UX & khả năng tiếp cận).
3. Mỗi gap tìm được ghi thành 1 finding mã `RR-NNN` theo **đúng cấu trúc 8 mục bắt buộc ở mục 5.4** của `requirements_analyzer`: heading `## RR-NNN [Mức độ] Loại — Tóm tắt` (Loại là 1 trong 10 enum dạng nhãn tiếng Việt: Biên/Ngoại lệ/Trạng thái/Mơ hồ/Tương tranh/Bảo mật/Tuân thủ/UX/Khả năng tiếp cận/Thiếu phủ; Mức độ là 1 trong `[Chặn]`/`[Cao]`/`[Trung bình]`/`[Thấp]`) + 8 mục con: 1. Trích dẫn nguồn, 2. Bối cảnh nghiệp vụ, 3. Vấn đề cụ thể, 4. Ảnh hưởng nếu không giải quyết, 5. Đề xuất giải quyết, 6. Liên kết với các phát hiện khác, 7. Câu hỏi cho người dùng, 8. Trạng thái.
4. **Không được gộp nhiều gap vào 1 mã**, không được bỏ qua finding LOW/cosmetic dù nhỏ đến đâu.

Các hướng phát hiện gap thường gặp (không giới hạn, chỉ để gợi ý khi walk 6 dimension):
- Từ khóa mơ hồ: "where applicable", "as needed", "similar to", "etc."
- Quyền còn thiếu: VD hệ thống có 5 nhóm quyền, nhưng tài liệu chỉ nói tới 1 nhóm quyền cho chức năng đang phân tích
- Validation rule thiếu: min/max, format, required/optional
- Hành vi edge case: lỗi mạng, truy cập đồng thời, dữ liệu trống
- Inconsistency giữa document và mockup (tên cột, format, layout)
- Threshold/config chưa xác định (VD bao nhiêu ngày = "sắp tới hạn"?)
- Conflict giữa requirement cũ và mới

Cuối mục này, ghi 1 dòng khuyến nghị theo đúng mục 5.6 của `requirements_analyzer`: `SẴN SÀNG sinh TC` (0 finding mức `[Chặn]` mở) hoặc `CẦN LÀM RÕ TRƯỚC` (còn finding mức `[Chặn]` mở) — chỉ là khuyến nghị tham khảo, không chặn việc chạy workflow tiếp theo.

Sau đó, bắt buộc phân loại lại toàn bộ finding theo tác động đúng mục 5.7 của `requirements_analyzer`: gắn nhãn `TC` (ảnh hưởng trực tiếp tới viết Test Case — thiếu oracle hoặc mã lỗi/số liệu mâu thuẫn giữa các nguồn), `UX` (liên quan hành vi/trải nghiệm thực tế của end-user), hoặc `Khác` (compliance/vận hành/governance, không thuộc 2 nhóm trên) cho mỗi `RR-NNN` — 1 finding có thể mang cả 2 nhãn `TC` + `UX` nếu áp dụng cả hai.

### Bước 6: Tổng hợp và trình bày (Synthesis & Delivery)

1. **Ma trận trạng thái** (nếu có state transitions) — bảng mapping trạng thái → hành vi
2. **Checklist AC** — Tóm tắt tất cả AC dạng checkbox, nhóm theo chức năng
3. **Khuyến nghị kiểm thử** — Gợi ý top 10 điều cần quan tâm nhất khi test
4. **Xuất Artifact** — Lưu toàn bộ phân tích vào file `.md`

## Cấu trúc Output (Template Artifact)

Agent PHẢI xuất artifact theo cấu trúc sau:

```markdown
# 📋 Phân Tích Requirement: [TICKET-ID]
## [Ticket Title]

## 1. Tổng Quan Ticket
(Bảng metadata)

## 2. User Story
(As a... I want... So that...)

## 3. Phạm Vi Áp Dụng (Scope)
(Bảng liệt kê modules/pages bị ảnh hưởng)

## 4. Acceptance Criteria — Phân Tích Chi Tiết
### 4.1. [Nhóm AC 1]
### 4.2. [Nhóm AC 2]
### 4.N. [Nhóm AC N]

## 5. Phụ Thuộc (Dependencies)
### 5.1. [Ticket phụ thuộc]
#### 5.1.1. [Chi tiết UI nếu có mockup]
#### 5.1.N. Business Rules tổng hợp

## 6. Phân Tích Mockup/Screenshot
### 6.1. [Mockup 1]
### 6.N. [Mockup N]

## 7. Điểm Thiếu/Điểm Mờ — Gap Review
### 7.1. Bảng tổng hợp
(Bảng: Mã RR-NNN, Loại, Mức độ, Tóm tắt 1 dòng)
### 7.2. Chi tiết từng finding
(Mỗi RR-NNN viết đầy đủ 8 mục theo cấu trúc mục 5.4 skill `requirements_analyzer`: Trích dẫn nguồn, Bối cảnh nghiệp vụ, Vấn đề cụ thể, Ảnh hưởng nếu không giải quyết, Đề xuất giải quyết, Liên kết với các phát hiện khác, Câu hỏi cho người dùng, Trạng thái)
### 7.3. Khuyến nghị
(`SẴN SÀNG sinh TC` hoặc `CẦN LÀM RÕ TRƯỚC` theo mục 5.6 skill `requirements_analyzer`)
### 7.4. Phân loại theo tác động
(Bảng/danh sách finding gắn nhãn `TC` / `UX` / `Khác` theo mục 5.7 skill `requirements_analyzer`)

## 8. Ma Trận Trạng Thái (nếu applicable)
(Bảng state → behavior)

## 9. Tóm Tắt Acceptance Criteria (Checklist)
(Checkbox nhóm theo chức năng)

## 10. Khuyến Nghị Cho Kiểm Thử
(Danh sách gợi ý, KHÔNG phải test cases)
```

## Quy tắc quan trọng

- ❌ **KHÔNG sinh test cases** — workflow này chỉ phân tích, không tạo TC
- ❌ **KHÔNG tự đoán** business logic nếu document không nói rõ → đưa vào Gap Review (`RR-NNN`, 8 mục)
- ❌ **KHÔNG bỏ sót** finding mức `[Thấp]`/cosmetic — mọi gap phát hiện được đều phải emit đủ 8 mục, không gộp vào tóm tắt
- ❌ **KHÔNG ghi finding thiếu trích dẫn nguồn** (file/dòng/quote hoặc vị trí UI cụ thể) — finding thiếu citation coi như không hợp lệ
- ❌ **KHÔNG bỏ qua mục 7.4 Phân loại theo tác động** — mọi finding phải được gắn nhãn `TC`/`UX`/`Khác` theo mục 5.7 skill `requirements_analyzer`, kể cả khi tài liệu chỉ có vài finding
- ❌ **KHÔNG bỏ qua comments** trong Jira ticket — comments thường chứa thông tin quan trọng bổ sung
- ✅ **PHẢI đọc related tickets** nếu được reference trong AC
- ✅ **PHẢI phân tích mockup** chi tiết nếu được cung cấp (fields, layout, interactions)
- ✅ **PHẢI ghi rõ inconsistency** giữa document và mockup
- ✅ **PHẢI viết bằng Tiếng Việt**, format Markdown, xuất Artifact
- ✅ **PHẢI copy hình ảnh** vào thư mục artifacts nếu cần embed trong artifact

## Mối quan hệ với workflows khác

| Sau khi phân tích xong | Workflow tiếp theo |
|---|---|
| Cần sinh test cases nhanh | `/generate_testcases_from_requirements` |
| Cần sinh test cases bài bản (RBT 6 bước) | `/generate_manual_testcases_rbt` |
| Cần sinh automation scripts | `/generate_automation_from_testcases` |
| Cần phân tích cross-module | `/generate_cross_module_test_plan` |
