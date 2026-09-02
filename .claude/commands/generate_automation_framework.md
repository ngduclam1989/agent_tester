---
description: Thiết kế và scaffold automation framework hoàn chỉnh cho Playwright (TypeScript) — Web, API.
skills:
  - framework_architect
  - qa_automation_engineer
---

# Workflow: Thiết Kế Automation Framework

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`framework_architect`** (tại `.claude/skills/framework_architect/SKILL.md`) trước khi bắt đầu. Ngoài ra, tham khảo thêm skill **`qa_automation_engineer`** để nắm các quy tắc automation chung.
> Với framework có API/hybrid/regression layer, đọc thêm `.claude/skills/qa_automation_engineer/references/AUTOTEST_REFERENCE_MAP.md` để chọn reference tối thiểu theo stack.


## ⚠️ Nơi lưu code (BẮT BUỘC)

Toàn bộ code Playwright sinh ra **PHẢI** nằm trong `TestScript/` ở gốc repo. Thư mục này là một
npm project độc lập — copy riêng nó sang repo khác phải chạy được ngay, không cần sửa gì.

- Spec API → `TestScript/tests/api/` · Spec Web → `TestScript/tests/web/`
- Page Object → `TestScript/pages/` · Helper dùng chung → `TestScript/common/`, `TestScript/utils/`
- Test data → `TestScript/test-data/` · Config + credentials → `TestScript/config/env.ts` và `TestScript/.env`

**TUYỆT ĐỐI KHÔNG** tạo `package.json` / `playwright.config.ts` / `tests/` ở gốc repo, không import
vượt ra ngoài `TestScript/`, và luôn neo đường dẫn file bằng `__dirname` thay cho `process.cwd()`.
Mọi lệnh chạy từ bên trong thư mục: `cd TestScript && npm install`, `cd TestScript && npm run test:api`.

> Định nghĩa đầy đủ: `.claude/skills/qa_automation_engineer/SKILL.md` → mục **Automation Project Root**.

Workflow này giúp agent thiết kế, scaffold và triển khai một automation framework hoàn chỉnh từ đầu, phù hợp với nhu cầu cụ thể của project.

## ⚠️ Nguyên tắc thực thi

- **Tất cả output bằng Tiếng Việt**
- **PHẢI tạo artifact `task.md`** để theo dõi tiến độ
- Mỗi file sinh ra phải **biên dịch/chạy được ngay** — không để placeholder `// TODO`
- Framework phải tuân thủ design principles trong skill `framework_architect`

## Stack hỗ trợ

| Platform | Stack | Ngôn ngữ | Runner | Report |
|---|---|---|---|---|
| 🌐 Web | Playwright | TypeScript | Playwright Test | monocart-reporter (mặc định), Allure (tuỳ chọn) |
| 🔌 API | Playwright API | TypeScript | Playwright Test | monocart-reporter (mặc định), Allure (tuỳ chọn) |

## Các bước thực hiện

### Bước 1: Thu thập yêu cầu (Requirements Gathering — ⏸️ CHECKPOINT)

1. **Hỏi user** các thông tin cần thiết:

   | Câu hỏi | Mục đích | Mặc định nếu không trả lời |
   |---|---|---|
   | Ứng dụng cần test là gì? (Web / API / Hybrid) | Chọn scope | Web |
   | Project name? | Đặt tên thư mục | `automation-framework` |
   | Có cần CI/CD pipeline không? | Sinh pipeline config | Có (GitHub Actions) |
   | Reporting tool? | Tích hợp report | monocart-reporter (mặc định) + Allure (tuỳ chọn) |
   | Có test API song song không? | Thêm API testing layer | Không |
   | Parallel execution? | Config parallel | Không |

2. **Xác nhận lại** với user trước khi scaffold:
   ```
   📋 Tóm tắt framework sẽ tạo:
   - Platform: Web
   - Framework: Playwright
   - Language: TypeScript
   - Runner: Playwright Test
   - Report: monocart-reporter (mặc định) + Allure (tuỳ chọn)
   - CI/CD: GitHub Actions
   - Project name: my-automation
   
   Bạn xác nhận để tôi bắt đầu scaffold không?
   ```

3. **Chờ user xác nhận** trước khi sang Bước 2

### Bước 2: Scaffold Project Structure (Foundation)

1. **Tạo artifact `task.md`** để theo dõi checklist:
   ```markdown
   # Framework Setup Progress
   - [x] Bước 1: Thu thập yêu cầu
   - [ ] Bước 2: Scaffold project structure
   - [ ] Bước 3: Sinh base classes
   - [ ] Bước 4: Sinh example tests
   - [ ] Bước 5: Cấu hình reporting & CI/CD
   - [ ] Bước 6: Verify & Deliver
   ```

2. **Tạo thư mục project** theo template trong skill `framework_architect`:
   - Tham khảo mục **Project Structure Templates** trong SKILL.md
   - Tạo toàn bộ thư mục + file cấu hình gốc

3. **Sinh file cấu hình build:**
   - `package.json` — dependencies: `@playwright/test`, devDependencies phù hợp
   - `playwright.config.ts` — baseURL, viewport (1920x1080), timeout, retries, reporter
   - `tsconfig.json` — paths, strict mode
   - `.env.example` — template environment variables

4. **Tạo file .gitignore** phù hợp (node_modules, playwright-report, test-results, .env...)
5. **Tạo README.md** với hướng dẫn:
   - Prerequisites (Node.js version)
   - Installation steps
   - Cách chạy test
   - Project structure overview
   - Conventions (naming, coding standards)

### Bước 3: Sinh Core Classes (Base Layer)

1. **Configuration Management:** `src/utils/env.config.ts` — đọc `.env`, export typed config object
2. **Browser Management:** `playwright.config.ts` + fixtures — browser config trong config, auth trong fixtures
3. **Base Page class:**
   - Common methods: `navigate()`, `click()`, `type()`, `getText()`, `isVisible()`
   - Built-in smart waits (KHÔNG có hard sleep)
   - Screenshot on failure
   - Logging mỗi action
4. **Base Test / Fixtures:**
   - Setup: khởi tạo context/page, navigate to baseURL
   - Teardown: đóng context, capture screenshot nếu fail
   - Dùng custom Fixtures (`test.extend()`) thay vì khởi tạo Page Object thủ công trong mỗi test
5. **Utilities:**
   - `TestDataGenerator` — sinh email, username, phone unique + traceable
   - `WaitHelper` — custom wait conditions (nếu cần ngoài built-in)
   - `ScreenshotUtil` — capture + attach to report
   - `Logger` — structured logging (winston / pino)

### Bước 4: Sinh Example Tests (Validation Layer)

1. **Tạo ít nhất 1 example Page Object:**
   - `LoginPage` với locators + methods thực tế
   - Locator dùng placeholder mô tả rõ cần thay thế:
     ```typescript
     // REPLACE: Update locator after inspecting actual DOM
     readonly usernameInput = this.page.getByLabel('Username');
     readonly passwordInput = this.page.getByLabel('Password');
     readonly loginButton = this.page.getByRole('button', { name: 'Login' });
     ```

2. **Tạo ít nhất 1 example Test:**
   - `LoginTest` — demo happy path (login thành công)
   - Có đầy đủ: Arrange → Act → Assert
   - Assertion có message rõ ràng
   - Test data dùng TestDataGenerator (nếu applicable)

3. **Tạo 1 example data-driven test** (nếu phù hợp):
   - Đọc data từ file JSON
   - Parameterized test với nhiều bộ data

### Bước 5: Cấu hình Reporting & CI/CD (Integration Layer)

1. **Reporting setup:** `monocart-reporter` là reporter mặc định trong `playwright.config.ts`
   (xuất `TestScript/test-results/report.html`, xem bằng `cd TestScript && npm run report`).
   - **KHÔNG dùng `npx playwright show-report`** — config không bật reporter `html` nên lệnh đó
     không mở được gì; cũng không đưa lệnh này vào npm script.
   - Allure là tuỳ chọn, bật qua CLI override `npm run test:api:allure`, KHÔNG thêm vào mảng
     `reporter` mặc định. Render HTML cần Allure CLI riêng (`allure-commandline`), chưa cài sẵn.
   - `npm run clean` (rimraf) để dọn `test-results/`, `allure-results/`, `allure-report/`
   - Screenshot auto-attach on failure; đính request/response bằng `testInfo.attach()`
   - Test step logging trong report

2. **CI/CD Pipeline** (nếu user yêu cầu):

   **GitHub Actions template:**
   ```yaml
   # Sinh file .github/workflows/playwright.yml
   # Nội dung: install deps → run tests → upload report
   ```

   - Install dependencies
   - Run tests (headless mode cho CI)
   - Upload test report as artifact
   - Parallel execution (nếu được yêu cầu)
   - Environment variables từ GitHub Secrets

3. **Docker support** (optional — chỉ nếu user yêu cầu):
   - Dockerfile cho test execution environment

### Bước 6: Verify & Deliver (Quality Gate)

1. **Kiểm tra framework build được:**
   ```bash
   npm install && npx playwright install && npx playwright test --list
   ```

2. **Chạy example test** để verify framework hoạt động:
   - Nếu PASS → framework sẵn sàng
   - Nếu FAIL do thiếu app/URL → acceptable (ghi note trong README)
   - Nếu FAIL do lỗi code framework → sửa ngay

3. **Review checklist** trước khi bàn giao:
   - [ ] Project structure đúng template
   - [ ] Tất cả dependencies đã khai báo
   - [ ] Config management hoạt động (đọc .env)
   - [ ] Base Page/fixtures có đầy đủ common methods
   - [ ] POM pattern được tuân thủ
   - [ ] Smart waits — không có hard sleep
   - [ ] Example test chạy được (hoặc chạy được khi có app)
   - [ ] README.md hướng dẫn đầy đủ
   - [ ] .gitignore bao phủ đúng
   - [ ] Reporting tích hợp
   - [ ] Không có debug log, commented code, TODO placeholder

4. **Cập nhật `task.md`** với trạng thái hoàn thành

## Xử lý tình huống đặc biệt

| Tình huống | Cách xử lý |
|---|---|
| **User muốn hybrid (Web + API)** | Thêm API layer song song (api helpers + api tests folder) |
| **User có framework cũ cần refactor** | Đọc code hiện tại → đề xuất migration plan → refactor từng phần |
| **User muốn multi-browser** | Config parallel projects trong `playwright.config.ts` |
| **User không chắc scope** | Gợi ý dựa trên: project type, CI infra |

## Output

- **Project structure** đầy đủ (tất cả thư mục + files)
- **Build config** (`package.json`)
- **Framework config** (`playwright.config.ts`)
- **Base classes** (BasePage, fixtures)
- **Utilities** (TestDataGenerator, WaitHelper, ScreenshotUtil, Logger)
- **Example Page Object + Test** (LoginPage + LoginTest)
- **Reporting integration** (Allure / HTML Report)
- **CI/CD pipeline** (GitHub Actions template)
- **README.md** (setup guide + project overview)
- **Artifact `task.md`** (checklist tiến độ)
