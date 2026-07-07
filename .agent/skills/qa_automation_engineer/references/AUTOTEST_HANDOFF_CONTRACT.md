# Autotest Handoff Contract

This skill is the automation router. It should delegate to specialist skills instead of absorbing
all responsibilities.

## Ownership

| Area | Owner |
| --- | --- |
| Manual TC generation, RBT, TC schema | `rbt_manual_testing` |
| Automation script generation | `qa_automation_engineer` |
| UI/DOM inspection and screenshots | `ui_debug_agent` |
| Proactive locator generation | `smart_locator_agent` |
| Reactive locator repair | `locator_healer_agent` |
| Flaky test root-cause analysis | `flaky_test_analyzer` |
| Framework scaffold/design | `framework_architect` |
| Test data generation | `test_data_generator` |
| Jira/Xray fetch/import | `jira_integration` |
| Requirement extraction from current web | `requirements_analyzer` |

## Manual to Automation Flow

1. Start from reviewed manual TC or a confirmed UI flow.
2. If UI details are insufficient, run optional UI recon using `ui_debug_agent`.
3. Generate or reuse Page Objects/Screen Objects.
4. Generate tests in the selected stack.
5. Add deterministic test data setup/cleanup.
6. Add assertions based on expected results, not implementation details.
7. Run or describe the exact command to run tests.
8. If tests fail because of locators, hand off to `locator_healer_agent`.
9. If tests pass/fail inconsistently, hand off to `flaky_test_analyzer`.
10. If results need test-management upload, hand off to `jira_integration`.

## Regression / A11y / API Add-ons

- Regression tagging and suite tiers are add-ons to generated tests, not a replacement for TC IDs.
- A11y automation should supplement manual accessibility checks; automated scans do not prove full
  WCAG compliance.
- API tests should be preferred for business rules that can be validated faster and more reliably
  below the UI.

## Safety Rules

- Never commit secrets, tokens, passwords, or live customer data into generated tests.
- Never use arbitrary waits (`sleep`, `waitForTimeout`) unless there is no deterministic signal and
  the reason is documented.
- Never guess locators when a browser/DOM inspection path is available.
- Never change manual TC output format while generating automation.
