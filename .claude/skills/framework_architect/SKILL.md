---
name: framework_architect
description: Skill thiết kế và scaffold automation framework hoàn chỉnh cho Playwright (TypeScript) — bao gồm project structure, base classes, config management, reporting, và CI/CD integration.
---

# Framework Architect

## Description

Skill chuyên biệt giúp agent thiết kế, scaffold và triển khai automation framework Playwright (TypeScript) từ đầu, cho cả Web UI và API.

Agent có thể:

- Thiết kế project structure theo best practices
- Sinh base classes, config management, browser management
- Tích hợp reporting (`monocart-reporter` mặc định, `allure-playwright` tuỳ chọn)
- Cấu hình CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins)
- Sinh template Page Object Model, fixtures, helpers
- Tạo file cấu hình (package.json, playwright.config.ts)

---

## When to Use

Sử dụng skill này khi:

- User yêu cầu tạo/thiết kế automation framework mới
- User cần scaffold project structure cho test automation
- User muốn chuẩn hóa framework hiện tại
- User cần tích hợp reporting hoặc CI/CD vào framework
- User hỏi về best practices cho framework design

Trigger keywords: "create framework", "design framework", "scaffold project", "thiết kế framework", "tạo project mới"

---

## Supported Stack

| Stack | Ngôn ngữ | Runner | Report | Build Tool |
|---|---|---|---|---|
| **Playwright + TypeScript** (Web UI) | TypeScript | Playwright Test | monocart-reporter (mặc định), Allure (tuỳ chọn) | npm |
| **Playwright API** (API testing) | TypeScript | Playwright Test | monocart-reporter (mặc định), Allure (tuỳ chọn) | npm |

---

## Framework Components

Mỗi framework PHẢI bao gồm các thành phần sau (tùy chỉnh theo stack):

### 1. Project Structure (Mandatory)
- Cấu trúc thư mục rõ ràng, phân tách pages/tests/utils/config
- File README.md hướng dẫn setup + chạy test
- File .gitignore phù hợp

### 2. Configuration Management (Mandatory)
- Quản lý environment (dev/staging/prod) qua config file hoặc .env
- Centralized config — không hardcode giá trị trong test
- Sensitive data (credentials) qua environment variables, KHÔNG commit vào repo

### 3. Browser Management (Mandatory)
- **Playwright:** playwright.config.ts với browser setup

### 4. Base Classes (Mandatory)
- Base Page — chứa common methods (wait, click, type, screenshot)
- Base Test — chứa setup/teardown, test lifecycle hooks
- Không hardcode waits — chỉ dùng smart waits
- **Playwright:** dùng custom Fixtures (`test.extend()`) để tự động khởi tạo/hủy Page Object và inject vào từng test, thay vì gọi `new` thủ công lặp lại trong `beforeEach`.

### 5. Page Object Model (Mandatory)
- Mỗi page/screen → 1 Page class
- Locators khai báo ở đầu class, không inline trong test
- Methods mô tả hành vi người dùng (không phải thao tác DOM)

### 6. Test Data Management (Mandatory)
- Data factory / builder pattern cho test data
- Data external (JSON/YAML/CSV) cho data-driven tests
- Data unique + traceable (timestamp/random prefix)

### 7. Utilities (Mandatory)
- Wait helpers (smart waits, custom conditions)
- Screenshot utilities (capture on failure)
- Logger (structured logging, không dùng print/console.log)
- Date/Time helpers, String generators

### 8. Reporting (Mandatory)

Stack report đã chốt cho project này, KHÔNG tự đổi sang tool khác:

- **Mặc định: `monocart-reporter`** → `TestScript/test-results/report.html`.
  Xem báo cáo bằng `cd TestScript && npm run report`.
- **TUYỆT ĐỐI KHÔNG dùng `npx playwright show-report`** — lệnh đó chỉ mở reporter `html`
  có sẵn của Playwright, mà config này không bật `html` nên sẽ không có gì để mở.
- **Tuỳ chọn: `allure-playwright`** — bật qua CLI override trong `npm run test:api:allure`,
  ghi JSON thô vào `TestScript/allure-results/`. Render ra HTML cần Allure CLI riêng
  (`allure-commandline`), hiện chưa cài trong project.
- **Dọn kết quả cũ:** `npm run clean` (dùng `rimraf`) trước mỗi lần chạy full.
- Screenshot attach on failure; đính request/response bằng `testInfo.attach()`, KHÔNG `console.log`.
- Test execution summary (pass/fail/skip counts).
- `test-results/`, `allure-results/`, `allure-report/` đều đã gitignore — không commit.

### 9. CI/CD Pipeline (Optional — nhưng khuyến khích)
- GitHub Actions / GitLab CI / Jenkins pipeline template
- Parallel execution config
- Artifact upload (reports, screenshots)

---

## Project Structure Templates

### Playwright + TypeScript

> **BẮT BUỘC:** scaffold vào thư mục `TestScript/` ở gốc repo, KHÔNG scaffold ra gốc repo.
> `TestScript/` là một npm project độc lập — copy riêng nó sang repo khác phải chạy được ngay.
> Định nghĩa đầy đủ: `.claude/skills/qa_automation_engineer/SKILL.md` → mục **Automation Project Root**.

```
TestScript/                     # Gốc npm project (mọi lệnh npm/playwright chạy từ đây)
├── playwright.config.ts        # Playwright configuration (projects: api / web)
├── package.json                # Dependencies + scripts
├── tsconfig.json               # TypeScript config
├── .env                        # Credentials thật — gitignored, KHÔNG commit
├── .env.example                # Environment template
├── .gitignore
├── config/
│   └── env.ts                  # Đọc biến môi trường + resolveUrl (không hardcode URL/credentials)
├── common/                     # Login, tạo header, sinh data random traceable
│   ├── api-common.ts
│   └── ui-common.ts
├── pages/                      # Page Object classes
│   ├── base.page.ts            # Base page (common methods)
│   └── login.page.ts
├── utils/                      # Helpers & utilities
│   ├── api-function.ts         # Validate status code / JSON schema / JSON node
│   └── excel-reader.ts         # Đọc test data từ Excel
├── tests/
│   ├── api/
│   │   └── product-add.spec.ts # Test specs API
│   ├── web/
│   │   └── login.spec.ts       # Test specs UI
│   └── fixtures/               # Custom fixtures (auth token, base test mở rộng)
└── test-data/
    ├── data/                   # File Excel cho test data-driven
    └── json_schema/            # JSON Schema dùng validate response
```

CI pipeline (`.github/workflows/playwright.yml`) đặt ở gốc repo và phải `cd TestScript` trước
khi chạy `npm ci` / `npx playwright test`.

---

## Design Principles

1. **DRY (Don't Repeat Yourself)** — Mỗi logic chỉ viết 1 lần, tái sử dụng qua Base classes và Utils
2. **Single Responsibility** — Mỗi class/module làm 1 việc (Page chỉ chứa UI interaction, Test chỉ chứa test logic)
3. **Open/Closed** — Framework dễ mở rộng (thêm page, thêm test) mà không sửa core
4. **Configuration over Code** — Env, browser, timeout... quản lý qua config, không hardcode
5. **Fail Fast, Log Rich** — Screenshot on failure, structured logging, clear assertion messages

---

## Anti-Patterns (FORBIDDEN)

| ❌ Anti-Pattern | ✅ Đúng cách |
|---|---|
| Hardcode URL/credentials trong code | Đọc từ .env hoặc config file |
| Locator inline trong test | Khai báo trong Page class |
| `waitForTimeout()` | Smart waits (`expect()`) |
| Global mutable state | Isolated fixtures/setup per test |
| Monolithic test file (1 file 500+ dòng) | Tách theo module/feature |
| `console.log()` | Logger framework (winston, pino) |

---

## Rules References

Agent PHẢI tuân thủ các rules chi tiết:

- `.claude/rules/automation_rules.md` — General automation best practices
- `.claude/rules/locator_strategy.md` — Locator selection priority
- `.claude/rules/playwright_rules.md` — Playwright-specific rules
