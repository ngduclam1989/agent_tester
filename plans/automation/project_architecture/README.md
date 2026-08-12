# Master Framework for E2E Automation (Playwright + TypeScript)

**Workflow:** `/generate_automation_from_testcases` hoặc `/generate_automation_from_ui_flow`
**Skill:** `qa_automation_engineer` + `framework_architect`

---

## Mục tiêu

Xây dựng hệ thống Automation có khả năng mở rộng, dễ bảo trì và báo cáo chuyên nghiệp. Thay vì "viết test đơn lẻ", chúng ta xây dựng **Framework gốc** vững chãi từ đầu.

## Cách sử dụng

Cung cấp kiến trúc phù hợp cho AI **ở Bước 0/1** để AI biết nơi chứa file mã nguồn.
- **Project mới:** AI sử dụng template bên dưới để scaffold.
- **Project có sẵn:** Mô tả cấu trúc hiện tại, AI sẽ tuân theo.

---

## Stack

| Stack | Ngôn ngữ | Runner | Report | Build Tool |
|---|---|---|---|---|
| **Playwright + TypeScript** (Web UI) | TypeScript | Playwright Test | HTML Report, Allure | npm |
| **Playwright API** (API testing) | TypeScript | Playwright Test | HTML Report | npm |

---

## Kiến Trúc Chuẩn

### Playwright + TypeScript

```text
project-root/
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies + npm scripts
├── .env.example                  # Environment template (KHÔNG chứa credentials thật)
├── .gitignore
├── README.md
├── src/
│   ├── pages/                    # Page Object classes
│   │   ├── base.page.ts          # Base page — common methods (wait, click, type, screenshot)
│   │   ├── login.page.ts
│   │   └── dashboard.page.ts
│   ├── fixtures/                 # Custom fixtures
│   │   ├── auth.fixture.ts       # Authentication fixture
│   │   └── base.fixture.ts       # Extended test with all fixtures
│   ├── utils/                    # Helpers & utilities
│   │   ├── test-data.ts          # Data generators (unique + traceable)
│   │   ├── env.config.ts         # Environment config reader
│   │   └── helpers.ts            # Common helper functions
│   ├── tests/                    # Test specs (grouped by feature)
│   │   ├── auth/
│   │   │   └── login.spec.ts
│   │   └── dashboard/
│   │       └── dashboard.spec.ts
│   └── api/                      # API testing layer (nếu có)
│       ├── helpers/
│       │   ├── base-api.ts       # Base request context, auth
│       │   └── user-api.ts       # API methods per resource
│       └── user.api.spec.ts
├── test-data/                    # External test data (JSON)
│   └── users.json
└── .github/
    └── workflows/
        └── playwright.yml        # CI pipeline template
```

---

## Component Checklist (Bắt Buộc)

Framework PHẢI bao gồm các thành phần sau:

| # | Component | Bắt buộc | Mô tả |
|---|-----------|----------|--------|
| 1 | **Project Structure** | ✅ | Thư mục rõ ràng, phân tách pages/tests/utils/config |
| 2 | **Config Management** | ✅ | Environment qua `.env` + config file — KHÔNG hardcode |
| 3 | **Browser Management** | ✅ | `playwright.config.ts` + fixtures |
| 4 | **Base Classes** | ✅ | BasePage chứa common methods |
| 5 | **Page Object Model** | ✅ | Mỗi page → 1 class, locators khai báo ở đầu class |
| 6 | **Test Data Management** | ✅ | Data factory + external data (JSON) + unique/traceable |
| 7 | **Utilities** | ✅ | Wait helpers, screenshot utils, logger, string generators |
| 8 | **Reporting** | ✅ | HTML Report / Allure + screenshot on failure |
| 9 | **CI/CD Pipeline** | 🟡 Khuyến khích | GitHub Actions / GitLab CI / Jenkins template |

---

## Design Principles

1. **DRY** — Mỗi logic chỉ viết 1 lần, tái sử dụng qua Base classes và Utils
2. **Single Responsibility** — Page chỉ chứa UI interaction, Test chỉ chứa test logic
3. **Open/Closed** — Dễ mở rộng (thêm page, thêm test) mà không sửa core
4. **Configuration over Code** — Env, browser, timeout quản lý qua config, không hardcode
5. **Fail Fast, Log Rich** — Screenshot on failure, structured logging, clear assertion messages

---

## Anti-Patterns (CẤM)

| ❌ Anti-Pattern | ✅ Đúng cách |
|---|---|
| Hardcode URL/credentials trong code | Đọc từ `.env` hoặc config file |
| Locator inline trong test | Khai báo trong Page class |
| `waitForTimeout()` | Smart waits (`expect()`) |
| Global mutable state | Isolated fixtures/setup per test |
| Monolithic test file (1 file 500+ dòng) | Tách theo module/feature |
| `console.log()` | Logger framework (winston, pino) |
| Đoán locator không inspect DOM | Mở browser inspect DOM thực tế |

---

## Tham chiếu

- **Skill chi tiết:** `.claude/skills/framework_architect/SKILL.md`
- **Rules:** `.claude/rules/automation_rules.md`, `.claude/rules/locator_strategy.md`
- **Workflow scaffold:** `/generate_automation_framework`
