# Cross-Skill Handoff Map

Dung file nay de biet khi nao RBT manual nen tham chieu hoac chuyen tiep sang skill khac ma khong
lam thay doi schema TC hien co.

## Giu RBT manual lam master

- `rbt_manual_testing`: phan tich requirement, ambiguity, test condition, risk, traceability,
  manual test case va package Markdown/Excel.
- Moi skill khac chi la bo tro theo ngu canh. Khong de skill bo tro thay doi cot TC.

## Handoff noi bo

| Nhu cau | Skill/nguon bo tro | Cach dung trong RBT |
| --- | --- | --- |
| Sinh automation tu TC da chot | `qa_automation_engineer` | Chuyen sau khi bang TC da duoc user review. |
| Sinh test data rieng, unique, boundary | `test_data_generator` | Lay data cu the de dien vao cot `Test Data`. |
| Inspect UI/DOM, tim locator | `ui_debug_agent`, `smart_locator_agent` | Chi dung khi can bang chung UI/locator; khong doi manual TC schema. |
| Sua locator/flaky automation | `locator_healer_agent`, `flaky_test_analyzer` | Chi dung sau khi da co automation. |
| Tao/cap nhat Jira/Xray | `jira_integration` | Map TC/defect sang tool quan ly, giu bang TC goc. |
| Thiet ke automation framework | `framework_architect` | Dung khi chuyen sang automation project. |

## Reference tu test-automation-skills-agents

| Mien bo sung | Nguon nen tham chieu | Cach ap dung vao RBT |
| --- | --- | --- |
| ISTQB manual QA | `qa-manual-istqb` | Test plan, test condition, risk matrix, static testing, defect, metrics. |
| QA planning | `qa-test-planner` | Bo sung test plan/regression/bug-report thinking khi user can artifact. |
| Regression strategy | `playwright-regression-testing` | Dung de xay tier smoke/sanity/regression/full trong summary/phu luc. |
| API coverage | `api-testing` | Them API/auth/schema/contract conditions neu requirement co API. |
| Accessibility | `a11y-playwright-testing`, `accessibility-selenium-testing` | Them keyboard/focus/WCAG manual checks vao scenarios hoac TC theo schema cu. |
| Strategy/testcase stress-test | `grill-me-qa` | Dung optional de chat van scenarios, TC coverage, risk, regression impact, tool, CI/CD, maintainability truoc khi chot plan hoac mapping. |

## Quy tac chen thong tin

- Neu thong tin giup sinh noi dung TC, dien vao cac cot hien co.
- Neu thong tin la governance/artifact, dua vao metadata, summary, matrix hoac phu luc.
- Neu thong tin can automation, tao handoff note sau bang TC, khong sua bang TC.
- Neu thong tin den tu Grill Review, ghi vao `Grill Findings / Decisions / Open Questions`; chi sua/bổ sung TC khi van giu schema TC cu.
