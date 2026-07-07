---
name: QA Automation Engineer
description: Skill hỗ trợ agent thực hiện QA automation testing: generate automation scripts, API/a11y/regression tests, UI recon, locators, flaky analysis, test data và framework handoff. Dùng reference Playwright/Selenium/API bổ trợ khi cần.
---

# QA Automation Engineer

## Description

This skill enables the agent to assist with software testing and automation tasks.

The agent can:

- Generate manual test cases from requirements
- Generate test automation scripts from test cases or UI flows
- Generate API tests from Swagger/OpenAPI specifications
- Explore applications and discover test scenarios
- Generate automation frameworks
- Generate test data
- Analyze flaky tests
- Generate stable locators
- Generate requirements from website analysis

This skill is designed for modern QA workflows and automation development.

---

# Routing Principles

- Treat this skill as the **automation router**, not the owner of every testing activity.
- Manual TC generation and TC schema belong to `rbt_manual_testing`.
- UI/DOM inspection belongs to `ui_debug_agent`; use it as optional recon before script generation when UI details are missing.
- Locator creation/healing belongs to `smart_locator_agent` and `locator_healer_agent`.
- Flaky investigation belongs to `flaky_test_analyzer`.
- Framework scaffold belongs to `framework_architect`.
- Test data generation belongs to `test_data_generator`.
- Jira/Xray integration belongs to `jira_integration`.
- Requirement extraction from a running website belongs to `requirements_analyzer`.
- Before doing complex automation work, read `references/AUTOTEST_HANDOFF_CONTRACT.md`.
- To choose detailed Playwright/Selenium/API/a11y/regression references, read `references/AUTOTEST_REFERENCE_MAP.md`.

---

# When to Use

Use this skill when the user asks about:

- Test automation
- Manual testing
- Automation frameworks
- API testing
- UI testing
- Test data generation
- Flaky test debugging
- Locator generation
- Requirements analysis from website
- Jira integration (fetch requirements, push test results)
- Xray test management

Typical prompts include:

- Generate test cases from requirement
- Generate Selenium automation from test case
- Generate automation from UI steps
- Generate API tests from Swagger
- Generate regression suite → _(redirect sang `generate_application_test_plan` hoặc `generate_manual_testcases_rbt`)_
- Generate accessibility automation checks
- Generate test data
- Analyze flaky test
- Generate locator for element
- Generate requirements from website

---

# Workflow Routing

When the user request matches a specific task, select the appropriate workflow file from `.agent/workflows/`.

### Generate test cases from requirements

> **Delegate:** Tác vụ này thuộc skill **`rbt_manual_testing`** — không phải `qa_automation_engineer`.

Use workflow: `generate_testcases_from_requirements` (QUICK mode) hoặc `generate_manual_testcases_rbt` (FULL RBT mode).

Triggers when user asks:

- generate test cases → **delegate to `rbt_manual_testing` (QUICK mode)**
- write manual test cases → **delegate to `rbt_manual_testing` (QUICK mode)**
- test scenarios from requirement → **delegate to `rbt_manual_testing` (QUICK mode)**
- sinh test cases đầy đủ / quy trình 6 bước → **delegate to `rbt_manual_testing` (FULL RBT mode)**

---

### Generate automation from manual test case

Use workflow: `generate_automation_from_testcases`

Before generating code:

- Confirm the manual TC has been reviewed or is accepted by the user.
- Preserve TC IDs in generated test names when available.
- If the TC lacks UI details/locators, run optional UI recon through `ui_debug_agent` first.
- Select the target stack (Playwright, Selenium, Appium, API) from the project context or ask if unclear.
- Load only the relevant references from `references/AUTOTEST_REFERENCE_MAP.md`.

Triggers when user asks:

- convert test case to automation
- generate Selenium automation
- generate Playwright automation from test case

---

### Generate automation from UI steps

Use workflow: `generate_automation_from_ui_flow`

Use optional UI recon when the flow is described in natural language and not backed by current DOM/locator evidence.

Triggers when user asks:

- automate this UI flow
- generate automation from steps
- run UI steps and generate Selenium script

---

### Generate API tests

Use workflow: `generate_api_tests_from_swagger`

Reference guidance:

- REST/API patterns: `references/api-rest-api-patterns.md`
- Schema validation: `references/api-schema-validation.md`
- Contract testing: `references/api-contract-testing.md`
- Playwright API: `references/api-playwright-api-testing.md`
- REST Assured: `references/api-rest-assured-testing.md`

Triggers when user provides:

- Swagger URL
- OpenAPI specification

Also use this route when user asks for auth tests, schema validation, contract checks, pagination/sorting/filtering, or negative API tests.

---

### Generate test data

Use workflow: `generate_test_data`

Triggers when user asks:

- generate test data
- generate boundary test data

---

### Analyze cross-module feature & generate combinatorial matrix

Use workflow: `generate_cross_module_test_plan`

> Workflow dành cho **tính năng phức tạp đi qua nhiều modules nối tiếp**. Sinh Data Flow Map + Ma trận kết hợp đa chiều (Pairwise / Business-critical / Full Cartesian).

Triggers when user asks:

- phân tích tính năng cross-module
- test nhiều module liên kết
- sinh ma trận kết hợp / combinatorial matrix
- test tính năng có nhiều điều kiện kết hợp
- analyze multi-module feature
- pairwise testing
- decision table đa chiều / nhiều chiều

---

### Generate combinatorial test data (multi-module pipeline)

Use workflow: `generate_combinatorial_test_data`

> Sinh test data cho ma trận kết hợp. Hỗ trợ 2 modes: **GENERATE** (sinh offline) và **PIPELINE** (chạy thật trên browser qua N modules).

Triggers when user asks:

- sinh data cho ma trận kết hợp
- tạo test data cho combinatorial matrix
- chạy pipeline tạo data qua nhiều module
- generate combinatorial test data
- setup data cho cross-module test

---

### Generate regression suite

> **Không có workflow riêng.** Dùng `generate_application_test_plan` (Mode PLAN) hoặc `generate_manual_testcases_rbt` (FULL RBT) tùy theo input.

Reference guidance:

- Strategy/tier/tagging: `references/regression-regression-strategy.md`
- CI/CD integration: `references/regression-ci-cd-integration.md`
- Flaky management: `references/regression-flaky-management.md`

Triggers when user asks:

- create regression test suite
- generate regression scenarios
- organize smoke/sanity/regression/full tiers
- tag Playwright regression tests

---

### Generate accessibility automation checks

Use target-stack automation workflow and references. This is an add-on to UI/API automation, not a replacement for manual accessibility review.

Reference guidance:

- Playwright + axe/WCAG: `references/a11y-playwright-wcag21aa-checklist.md`
- ARIA/focus/keyboard patterns: `references/a11y-playwright-aria_patterns.md`
- Selenium + axe: `references/a11y-selenium-axe_patterns.md`

Triggers when user asks:

- add accessibility tests
- add axe-core checks
- test keyboard navigation
- validate WCAG / ARIA / focus management
- accessibility regression tests

---

### Generate automation framework

> **Delegate:** Tác vụ này sử dụng skill **`framework_architect`** để thiết kế framework.

Use workflow: `generate_automation_framework`

Triggers when user asks:

- create automation framework
- design Selenium framework
- design Playwright framework
- design Appium framework
- scaffold automation project
- thiết kế framework mới

---

### Explore application and generate test plan

Use workflow: `generate_application_test_plan`

> Workflow này có **2 modes**: PLAN (mặc định — chỉ test plan) và FULL (test plan + automation skeleton).
> Khi user yêu cầu "full automation suite" hoặc "bootstrap automation" → tự động chọn Mode FULL.
> Nếu user đã có requirements và chỉ muốn so sánh current web behavior, use optional UI recon / `requirements_analyzer` output as reference. Do not replace the existing requirements unless user asks.

Triggers when user asks:

- explore application
- discover test scenarios
- generate test plan
- generate full automation suite
- bootstrap automation for project

---

### Analyze flaky tests

Use workflow: `analyze_flaky_tests`

Delegate root-cause analysis to `flaky_test_analyzer`; use `references/regression-flaky-management.md` for quarantine/retry/suite health policy.

Triggers when user asks:

- why is this test flaky
- analyze unstable automation

---

### Generate stable locators

Use workflow: `generate_locator`

Delegate locator selection to `smart_locator_agent`. If an existing locator broke after UI changes, use `locator_healer_agent` instead.

Triggers when user asks:

- generate locator for this element
- find stable selector
- create automation locator

---

### Generate requirements from website

Use workflow: `generate_requirements_from_website`

Triggers when user asks:

- generate requirements from website
- analyze website module and create requirements
- extract user stories from web page

---

### Analyze requirement document

> **Delegate:** Tác vụ này sử dụng skill **`requirements_analyzer`** để phân tích requirement documents.

Use workflow: `analyze_requirement_document`

> Workflow chỉ **phân tích** requirement — KHÔNG sinh test cases. Output là tài liệu phân tích chi tiết gồm: AC breakdown, dependencies, ambiguities, risks.

Triggers when user asks:

- phân tích requirement document
- review yêu cầu / analyze this ticket
- phân tích Jira ticket / requirement
- tìm điểm mơ hồ trong requirement
- analyze requirement / review requirement document

---

### Fetch requirements from Jira

Use workflow: `fetch_jira_requirements`

Triggers when user asks:

- fetch jira requirements
- lấy requirement từ jira
- get jira ticket
- import user stories from jira

---

### Import test results to Xray

Use workflow: `import_test_results_xray`

Triggers when user asks:

- push test results to xray
- đẩy kết quả test lên xray
- import test execution to jira
- upload playwright results to xray

---

# Automation Framework

Default automation stack:

- **Language:** Java
- **UI automation:** Selenium WebDriver or Playwright
- **Test framework:** TestNG
- **API automation:** REST Assured
- **Mobile automation:** Appium
- **Design pattern:** Page Object Model (POM)

Stack-specific references:

| Stack / concern | References |
|---|---|
| Playwright E2E | `playwright-e2e-page_object_model.md`, `playwright-e2e-locator_strategies.md`, `playwright-e2e-debugging.md`, `playwright-e2e-snippets.md` |
| Playwright browser/CLI recon | `playwright-cli-running-code.md`, `playwright-cli-test-generation.md`, `playwright-cli-storage-state.md`, `playwright-cli-tracing.md` |
| Webapp Playwright MCP | `webapp-playwright-common_patterns.md`, `webapp-playwright-page_object_model.md`, `webapp-playwright-api_testing.md` |
| Selenium webapp | `selenium-webapp-page_object_model.md`, `selenium-webapp-locator_strategies.md`, `selenium-webapp-wait_strategies.md` |
| API | `api-rest-api-patterns.md`, `api-schema-validation.md`, `api-contract-testing.md`, `api-playwright-api-testing.md`, `api-rest-assured-testing.md` |
| Accessibility | `a11y-playwright-wcag21aa-checklist.md`, `a11y-playwright-aria_patterns.md`, `a11y-selenium-axe_patterns.md` |
| Regression / CI | `regression-regression-strategy.md`, `regression-ci-cd-integration.md`, `regression-flaky-management.md` |

---

# Locator Strategy

## Selenium Locator Priority

1. `id`
2. `data-testid`
3. `name`
4. `css selector`
5. `xpath` (last resort)

Avoid fragile locators such as auto-generated class names or positional xpaths.

## Playwright Locator Priority

1. `getByRole()`
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. `css selector`
7. `xpath` (last resort)

Avoid fragile selectors such as dynamic class names.

> **Note:** For detailed locator rules, refer to `.agent/rules/locator_strategy.md`.

---

# Rules References

The agent MUST also follow the detailed rules defined in `.agent/rules/`:

- [automation_rules.md](.agent/rules/automation_rules.md) — General automation best practices
- [locator_strategy.md](.agent/rules/locator_strategy.md) — Detailed locator selection rules
- [playwright_rules.md](.agent/rules/playwright_rules.md) — Playwright-specific rules
- [selenium_rules.md](.agent/rules/selenium_rules.md) — Selenium-specific rules
- [appium_rules.md](.agent/rules/appium_rules.md) — Appium mobile automation rules

---

# References

The agent may consult additional documentation in the `references/` folder:

- `AUTOTEST_HANDOFF_CONTRACT.md` — ownership boundaries and end-to-end automation handoff flow
- `AUTOTEST_REFERENCE_MAP.md` — which references to load for Playwright, Selenium, API, a11y, regression, locator, flaky, framework tasks
- `PROJECT_CONTEXT.md` — Project domain, tech stack, key modules
- `TEST_STRATEGY.md` — Testing objectives, scope, execution plan
- `PROMPT_TEMPLATES.md` — Reusable prompt templates for common QA tasks

External references (thay thế cho các file đã gộp):

- `plans/automation/project_architecture/README.md` — Repository structure & project architecture (thay thế REPOSITORY_MAP.md)
- `GEMINI.md` > "Cleanup & Delivery" — Quality checklist / Definition of Done (thay thế SELF_CHECK.md)

---

# Output

Depending on the request, the agent may return:

- Manual test cases (structured format)
- Automation scripts (Java/TypeScript)
- API tests (REST Assured)
- Locator recommendations
- Test data (structured, randomized, traceable)
- Automation framework design
- Requirements documents

Automation outputs should include:

- Page Object classes
- Test classes
- Assertions validating expected behavior
- Clean, readable, maintainable code (no debug logs, no commented code)
- Stable locators or a note that UI recon is required before finalizing locators
- Test data setup/cleanup strategy when the scenario mutates data
- Run command and expected report/artifact locations when applicable
