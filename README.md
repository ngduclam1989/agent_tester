# Antigravity Testing Kit 🚀


## 🌟 Tính Năng Nổi Bật

- **🔁 Quy Trình AI Hoàn Thiện (End-to-End):** Được xây dựng thành một quy trình ứng dụng AI khép kín — từ phân tích yêu cầu (Requirements), thiết kế test cases (Manual), đến viết script tự động (Automation), tích hợp CI/CD và báo cáo kết quả — tất cả đều có AI hỗ trợ.
- **📋 Hỗ Trợ Cả Manual & Automation Testing:** Không chỉ dừng lại ở Automation, Kit còn trang bị đầy đủ quy trình, skill và prompt cho **Manual Tester** — bao gồm phân tích rủi ro (RBT), thiết kế test cases chất lượng cao và quản lý kết quả kiểm thử.
- **🧠 Tối ưu cho QA/Tester:** Tất cả các prompt, rule và workflow đều được tinh chỉnh dựa trên tư duy và quy trình làm việc thực tế của cả **Manual Tester** lẫn **Automation Engineer**.
- **🌐 Hỗ trợ Đa Nền Tảng:** Tương thích với các framework phổ biến như Web (Playwright, Selenium), Mobile (Appium), và API (Playwright, REST Assured).
- **🛡️ Tuân thủ Tiêu Chuẩn Cao (Strict Rules):** Đảm bảo AI luôn đi theo cấu trúc Page Object Model (POM), viết code rõ ràng, không đoán bừa locator và tự động sửa lỗi (Self-fix).
- **🇻🇳 Giao Tiếp Bằng Tiếng Việt:** AI được cấu hình để trao đổi, giải thích và báo cáo hoàn toàn bằng Tiếng Việt, thân thiện với người dùng Việt Nam.

---

## 📂 Cấu Trúc Thư Mục Chính

```
antigravity-testing-kit/
├── .agent/
│   ├── rules/           # Quy tắc bắt buộc AI phải tuân theo
│   ├── skills/          # 10 kỹ năng chuyên biệt cho AI
│   └── workflows/       # 16 kịch bản thực thi step-by-step (slash commands)
├── plans/
│   ├── manual/          # Quy trình 6 bước sinh Manual Test Cases (AI-RBT)
│   ├── automation/      # Quy trình 6 bước sinh Automation Scripts
│   └── cross-module/    # Quy trình phân tích Cross-Module & Ma trận kết hợp
├── practices/
│   ├── requirements/    # Lưu trữ requirements đã sinh
│   └── testcases/       # Lưu trữ testcases đã sinh (hoặc testcases mẫu)
├── prompt_templates/    # Prompt mẫu dùng nhanh (copy → paste → gửi)
├── scripts/
│   ├── convert_excel/   # Chuyển đổi Markdown Test Cases sang Excel
│   └── integrations/    # Tích hợp công cụ bên ngoài
│       ├── jira/        # Jira & Xray integration (self-contained)
│       └── google_sheet/# Đọc/ghi dữ liệu với Google Sheets
├── GEMINI.md            # Rule chung cho AI Agent
├── RULE_GLOBAL.md       # Quy tắc toàn cục cho toàn bộ tác vụ
└── TIPS_QUOTA.md        # Cẩm nang tối ưu quota token
```

### `.agent/` — Bộ não của AI Agent

| Thư mục      | Vai trò |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rules/`     | Quy tắc bắt buộc: POM, locator strategy, smart waits, Playwright/Selenium/Appium rules |
| `skills/`    | 10 kỹ năng chuyên biệt giúp Agent thực hiện các tác vụ tự động hóa (Automation, Manual, UI Debug, Test Data...) |
| `workflows/` | 16 kịch bản thực thi dạng slash commands giúp Agent tự động hóa toàn bộ quy trình làm việc |

#### 🧠 Chi Tiết 10 Kỹ Năng Chuyên Biệt (Skills)

Dưới đây là danh sách chi tiết các kỹ năng chuyên biệt nằm trong thư mục [`.agent/skills/`](.agent/skills/) được thiết lập sẵn trong dự án:

| Tên Skill | Đường dẫn chi tiết | Vai trò & Chức năng |
| :--- | :--- | :--- |
| **QA Automation Engineer** | [`qa_automation_engineer`](.agent/skills/qa_automation_engineer/SKILL.md) | **Master Skill** điều phối toàn bộ quy trình viết và chạy automation test. |
| **RBT Manual Testing** | [`rbt_manual_testing`](.agent/skills/rbt_manual_testing/SKILL.md) | Thiết kế manual test cases theo 2 chế độ: **QUICK** (sinh nhanh) hoặc **FULL RBT** (quy trình AI-RBT 6 bước có đánh giá rủi ro). |
| **Requirements Analyzer** | [`requirements_analyzer`](.agent/skills/requirements_analyzer/SKILL.md) | Phân tích website hoặc module sản phẩm để tự động xây dựng tài liệu Yêu cầu (Requirements/User Stories) chuẩn mực. |
| **UI Debug Agent** | [`ui_debug_agent`](.agent/skills/ui_debug_agent/SKILL.md) | Inspect web/mobile bằng browser thật (headed mode), phân tích DOM, xác định locators và sinh cấu trúc Page Object Model (POM). |
| **Smart Locator Agent** | [`smart_locator_agent`](.agent/skills/smart_locator_agent/SKILL.md) | Sinh locator có độ tin cậy cao, ổn định và dễ bảo trì cho các framework Playwright, Selenium và Appium. |
| **Locator Healer Agent** | [`locator_healer_agent`](.agent/skills/locator_healer_agent/SKILL.md) | Tự động phát hiện và sửa chữa các locator bị hỏng (broken locator) khi code automation chạy thất bại. |
| **Test Data Generator** | [`test_data_generator`](.agent/skills/test_data_generator/SKILL.md) | Sinh test data có cấu trúc, unique, traceable để kiểm thử tích hợp nhiều bước hoặc kiểm thử ma trận kết hợp. |
| **Flaky Test Analyzer** | [`flaky_test_analyzer`](.agent/skills/flaky_test_analyzer/SKILL.md) | Phân tích các ca kiểm thử không ổn định (flaky tests), phát hiện nguyên nhân gốc rễ và tự động đề xuất/sửa đổi code. |
| **Framework Architect** | [`framework_architect`](.agent/skills/framework_architect/SKILL.md) | Thiết kế cấu trúc dự án (scaffold) và thiết lập ban đầu cho các automation framework (Playwright, Selenium, Appium). |
| **Jira Integration** | [`jira_integration`](.agent/skills/jira_integration/SKILL.md) | Kết nối hệ thống quản lý kiểm thử: Tải requirements từ Jira và đồng bộ/đẩy kết quả chạy automation lên Xray. |

#### ⚡ Chi Tiết 16 Kịch Bản Thực Thi (Workflows / Slash Commands)

Dưới đây là danh sách 16 workflow (kịch bản tự động hóa) được cấu hình dưới dạng slash commands trong thư mục [`.agent/workflows/`](.agent/workflows/):

| Slash Command | Đường dẫn kịch bản | Vai trò & Mục đích |
| :--- | :--- | :--- |
| `/generate_requirements_from_website` | [`generate_requirements_from_website`](.agent/workflows/generate_requirements_from_website.md) | Tự động phân tích giao diện và mã nguồn website để sinh tài liệu requirements chi tiết. |
| `/analyze_requirement_document` | [`analyze_requirement_document`](.agent/workflows/analyze_requirement_document.md) | Phân tích sâu các tài liệu yêu cầu (Jira Ticket, PDF, Word) và tạo tài liệu phân tích nghiệp vụ. |
| `/fetch_jira_requirements` | [`fetch_jira_requirements`](.agent/workflows/fetch_jira_requirements.md) | Lấy tài liệu yêu cầu/User Story trực tiếp từ Jira API. |
| `/generate_manual_testcases_rbt` | [`generate_manual_testcases_rbt`](.agent/workflows/generate_manual_testcases_rbt.md) | Sinh bộ Manual Test Cases chuẩn nghiệp vụ theo quy trình AI-RBT 6 bước. |
| `/generate_testcases_from_requirements` | [`generate_testcases_from_requirements`](.agent/workflows/generate_testcases_from_requirements.md) | Chế độ QUICK: Sinh nhanh test cases từ requirements có sẵn (không qua quy trình đánh giá rủi ro). |
| `/generate_automation_from_testcases` | [`generate_automation_from_testcases`](.agent/workflows/generate_automation_from_testcases.md) | Tự động chuyển đổi các bước kiểm thử manual (Manual Test Cases) sang automation test scripts. |
| `/generate_automation_from_ui_flow` | [`generate_automation_from_ui_flow`](.agent/workflows/generate_automation_from_ui_flow.md) | Dò quét (crawl) luồng nghiệp vụ trên UI thực tế, thu thập locators và viết thẳng kịch bản automation. |
| `/generate_application_test_plan` | [`generate_application_test_plan`](.agent/workflows/generate_application_test_plan.md) | Khám phá toàn bộ ứng dụng web để xây dựng Test Plan tổng thể hoặc khung xương (skeleton) automation. |
| `/generate_automation_framework` | [`generate_automation_framework`](.agent/workflows/generate_automation_framework.md) | Khởi tạo cấu trúc dự án test automation hoàn chỉnh từ ban đầu. |
| `/generate_locator` | [`generate_locator`](.agent/workflows/generate_locator.md) | Định vị và phân tích phần tử UI để sinh ra locator tối ưu nhất. |
| `/generate_test_data` | [`generate_test_data`](.agent/workflows/generate_test_data.md) | Sinh test data đầu vào có cấu trúc (JSON, CSV, JS Object) để nạp vào automation scripts. |
| `/generate_cross_module_test_plan` | [`generate_cross_module_test_plan`](.agent/workflows/generate_cross_module_test_plan.md) | Phân tích tích hợp đa module, sinh ma trận tổ hợp (Pairwise/Full Cartesian). |
| `/generate_combinatorial_test_data` | [`generate_combinatorial_test_data`](.agent/workflows/generate_combinatorial_test_data.md) | Sinh test data theo ma trận kết hợp bằng cách chạy pipeline thử nghiệm qua các trang UI. |
| `/generate_api_tests_from_swagger` | [`generate_api_tests_from_swagger`](.agent/workflows/generate_api_tests_from_swagger.md) | Sinh kịch bản và script kiểm thử API tự động từ tài liệu Swagger/OpenAPI. |
| `/analyze_flaky_tests` | [`analyze_flaky_tests`](.agent/workflows/analyze_flaky_tests.md) | Chạy chế độ phân tích và khắc phục lỗi của các ca kiểm thử hoạt động không ổn định. |
| `/import_test_results_xray` | [`import_test_results_xray`](.agent/workflows/import_test_results_xray.md) | Tự động tải lên (upload) kết quả kiểm thử từ các file báo cáo XML/JSON lên Xray Jira. |

---

### `scripts/` — Công Cụ Bổ Trợ & Tích Hợp

Chứa các công cụ tiện ích và kịch bản kết nối hệ thống. Mỗi công cụ/integration là một **thư mục độc lập** (tự quản dependencies, config, README riêng).

| Công cụ / Tích hợp         | Chức năng                                                                 | Docs                                                 |
| ------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| `convert_excel/`             | Chuyển đổi file Markdown Test Cases sang Excel có layout tối ưu       | [README](scripts/convert_excel/README.md)             |
| `integrations/jira/`         | Lấy Requirements từ Jira, xác thực Xray, đẩy kết quả test lên Xray | [README](scripts/integrations/jira/README.md)         |
| `integrations/google_sheet/` | Đồng bộ, đọc/ghi dữ liệu test từ Google Sheets qua API              | [README](scripts/integrations/google_sheet/README.md) |

```bash
# Cài đặt nhanh (ví dụ Jira)
cd scripts/integrations/jira
npm install
cp .env.example .env    # Điền credentials
```

---

### `plans/` — Quy Trình 6 Bước Chuyên Sâu

Dành cho các tác vụ phức tạp, cần thực hiện **tuần tự trong cùng 1 conversation**.

| Plan                    | Mô tả                                                                                              | Bắt đầu nhanh                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `plans/manual/`       | Sinh Manual Test Cases theo quy trình**AI-RBT 6 bước** (Risk-Based Testing)                 | Xem`plans/manual/QUICK_START.md`       |
| `plans/automation/`   | Sinh Automation Scripts theo**6 bước** từ context → review                                 | Xem`plans/automation/QUICK_START.md`   |
| `plans/cross-module/` | Phân tích tính năng**đa module** & sinh **ma trận kết hợp** (Pairwise/Cartesian) | Xem`plans/cross-module/QUICK_START.md` |

**Cách dùng:** Mở `QUICK_START.md` → Làm theo từng bước → Gửi prompt mỗi bước vào Antigravity.

### `prompt_templates/` — Prompt Mẫu Dùng Nhanh

Dành cho tác vụ **đơn lẻ**, chỉ cần copy → thay `[...]` bằng dữ liệu thực → paste → gửi.

| #  | Prompt                                         | Mục đích                           |
| -- | ---------------------------------------------- | ------------------------------------- |
| 01 | `prompt_01_generate_requirements.txt`        | Phân tích website sinh Requirements |
| 02 | `prompt_02_generate_test_cases.txt`          | Sinh test cases từ requirements      |
| 03 | `prompt_03_create_framework_playwright.txt`  | Dựng framework Playwright TS         |
| 03 | `prompt_03_create_framework_selenium.txt`    | Dựng framework Selenium Java         |
| 04 | `prompt_04_create_script_playwright.txt`     | Viết test script Playwright TS       |
| 04 | `prompt_04_create_script_selenium.txt`       | Viết test script Selenium Java       |
| 05 | `prompt_05_convert_manual_to_automation.txt` | Chuyển manual TC sang automation     |
| 06 | `prompt_06_review_automation_code.txt`       | Review code automation                |
| 07 | `prompt_07_generate_test_data.txt`           | Sinh test data có cấu trúc         |
| 08 | `prompt_08_analyze_flaky_tests.txt`          | Phân tích test không ổn định    |
| 09 | `prompt_09_create_api_tests.txt`             | Viết test API từ Swagger            |

> 💡 Thư mục `prompt_templates/prompt_workflow_template/` chứa phiên bản prompt ngắn gọn hơn, tối ưu cho workflow.

---

## ✳️ Hướng Dẫn Sử Dụng Trong Antigravity

1. **Clone Repo này về máy:**
   Hoặc bạn có thể copy trực tiếp thư mục `.agent` từ repo này.
2. **Tích hợp vào dự án của bạn:**
   Copy thư mục `.agent` vào thư mục gốc (root directory) của dự án Automation hoặc Manual Test mà bạn đang làm việc.
3. **Bắt đầu trò chuyện với AI trên Antigravity:**
   Khi mở dự án lên Antigravity, AI tự động nhận diện thư mục `.agent` và sẽ áp dụng ngay các Rule, Skill, Workflow của **Anh Tester** đã thiết lập sẵn.
4. **(Tùy chọn) Sử dụng Plan hoặc Prompt Template:**

   - Tác vụ phức tạp (1 module) → Mở `plans/manual/QUICK_START.md` hoặc `plans/automation/QUICK_START.md`
   - Tác vụ đa module (ma trận kết hợp) → Mở `plans/cross-module/QUICK_START.md`
   - Tác vụ nhanh → Copy prompt từ `prompt_templates/` → paste vào chat

---
