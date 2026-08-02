# Autotest Reference Map

Use this map to choose the smallest useful reference set for an automation task. Do not load every
reference by default.

## Core Routing

| Task | First skill/workflow | References to load when needed |
| --- | --- | --- |
| Convert reviewed manual TC to automation | `generate_automation_from_testcases` | `playwright-e2e-page_object_model.md`, `playwright-e2e-locator_strategies.md`, `selenium-webapp-page_object_model.md`, `selenium-webapp-wait_strategies.md` |
| Automate observed UI flow | `generate_automation_from_ui_flow` | `webapp-playwright-common_patterns.md`, `webapp-playwright-locator_strategies.md`, `playwright-cli-running-code.md` |
| UI recon / inspect DOM / current behavior | `ui_debug_agent` | `webapp-playwright-common_patterns.md`, `playwright-cli-element-attributes.md`, `playwright-cli-test-generation.md` |
| Stable locator generation | `smart_locator_agent` | `playwright-e2e-locator_strategies.md`, `selenium-webapp-locator_strategies.md` |
| Locator healing after UI changes | `locator_healer_agent` | `playwright-e2e-debugging.md`, `webapp-playwright-common_patterns.md`, `selenium-webapp-wait_strategies.md` |
| Flaky test analysis | `flaky_test_analyzer` | `regression-flaky-management.md`, `playwright-e2e-debugging.md`, `selenium-webapp-wait_strategies.md` |
| API automation | `generate_api_tests_from_swagger` | `api-rest-api-patterns.md`, `api-schema-validation.md`, `api-contract-testing.md`, `api-playwright-api-testing.md`, `api-rest-assured-testing.md` |
| Regression suite strategy | `generate_application_test_plan` or RBT | `regression-regression-strategy.md`, `regression-ci-cd-integration.md`, `regression-flaky-management.md` |
| Accessibility automation | automation workflow + target stack | `a11y-playwright-wcag21aa-checklist.md`, `a11y-playwright-aria_patterns.md`, `a11y-selenium-axe_patterns.md` |
| Framework scaffold | `framework_architect` | `playwright-e2e-file-map-template.md`, `selenium-webapp-file-map-template.md`, `regression-ci-cd-integration.md` |

## Stack Selection

- Prefer Playwright TypeScript when the project already uses Playwright, needs browser contexts,
  API request fixtures, trace/video, or modern web-first assertions.
- Prefer Selenium Java when the project is already Java/Maven/JUnit/TestNG based or has existing
  Selenium Page Objects.
- Prefer API-only automation when validation can be done below UI, especially auth, schema,
  contract, pagination, sorting, filtering, and error handling.
- Prefer manual/RBT flow first when the input is still requirement-level and test cases are not
  reviewed yet.

## Required Recon Before Script Generation

Before generating UI automation code, confirm at least one of these is true:

- The provided manual test cases already include stable locators or enough UI detail.
- UI recon was performed by `ui_debug_agent`.
- The codebase already has Page Objects/selectors for the target page.

If none is true, add an optional UI recon step before script generation.

## Output Discipline

- Automation outputs should include code files or clear code blocks for Page Objects, test specs,
  helpers/fixtures, and test data setup as appropriate.
- Do not rewrite manual TC schemas; manual TC generation belongs to `rbt_manual_testing`.
- Link automation tests back to manual TC IDs when TC IDs exist.
- Keep generated code maintainable: no arbitrary sleeps, no fragile positional XPath, no hardcoded
  secrets, no debug logs left behind.
