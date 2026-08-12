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
- Tích hợp reporting (Playwright HTML Report, Allure)
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
| **Playwright + TypeScript** (Web UI) | TypeScript | Playwright Test | HTML Report, Allure | npm |
| **Playwright API** (API testing) | TypeScript | Playwright Test | HTML Report | npm |

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
- Tích hợp ít nhất 1 reporting tool
- Screenshot attach on failure
- Test execution summary (pass/fail/skip counts)

### 9. CI/CD Pipeline (Optional — nhưng khuyến khích)
- GitHub Actions / GitLab CI / Jenkins pipeline template
- Parallel execution config
- Artifact upload (reports, screenshots)

---

## Project Structure Templates

### Playwright + TypeScript

```
project-root/
├── playwright.config.ts        # Playwright configuration
├── package.json                # Dependencies + scripts
├── .env.example                # Environment template
├── .gitignore
├── README.md
├── src/
│   ├── pages/                  # Page Object classes
│   │   ├── base.page.ts        # Base page (common methods)
│   │   ├── login.page.ts
│   │   └── dashboard.page.ts
│   ├── fixtures/               # Custom fixtures
│   │   ├── auth.fixture.ts     # Authentication fixture
│   │   └── base.fixture.ts     # Extended test with all fixtures
│   ├── utils/                  # Helpers & utilities
│   │   ├── test-data.ts        # Data generators
│   │   ├── env.config.ts       # Environment config reader
│   │   └── helpers.ts          # Common helper functions
│   └── tests/                  # Test specs
│       ├── auth/
│       │   └── login.spec.ts
│       └── dashboard/
│           └── dashboard.spec.ts
├── test-data/                  # External test data (JSON/YAML)
│   └── users.json
└── .github/
    └── workflows/
        └── playwright.yml      # CI pipeline
```

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
