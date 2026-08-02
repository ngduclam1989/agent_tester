# Test plan (aligned với ISTQB Foundation Level)

> Điền các phần còn thiếu theo project/release cụ thể.

## 1. Kiểm soát tài liệu

|Trường|Giá trị|
|---|---|
|Dự án|{{PROJECT}}|
|Release/Iteration|{{RELEASE}}|
|Phiên bản|0.1 (Draft)|
|Owner|{{OWNER}}|
|Ngày|{{DATE}}|
|Trạng thái|Draft / In review / Approved|
|Người phê duyệt|{{APPROVER}}|

### Revision history

|Version|Date|Author|Change|
|:---:|---|---|---|
|0.1|{{DATE}}|{{OWNER}}|Bản nháp ban đầu|

## 2. Giới thiệu

### 2.1 Mục đích

[Mô tả mục đích của test plan, phạm vi sử dụng và release/feature áp dụng.]

### 2.2 Test objectives

|Objective|Mô tả|Success criteria|
|---|---|---|
|Xác minh functional requirements|Đảm bảo feature hoạt động đúng theo requirements|Tất cả P0/P1 test cases pass|
|Xác thực user workflows|Xác nhận end-to-end user journeys hoạt động|UAT/sign-off đạt|
|Đánh giá quality characteristics|Đánh giá performance, security, usability, accessibility|Đáp ứng NFR đã thống nhất|
|Phát hiện defects sớm|Tìm vấn đề trước production release|Escaped defects dưới ngưỡng cho phép|

### 2.3 Test basis

|Nguồn|Vị trí|Version|
|---|---|---|
|Requirements/User stories|[Link/Jira filter]|[Version]|
|Acceptance criteria|[Link]|[Version]|
|Design specification|[Link]|[Version]|
|API contract|[Link]|[Version]|
|Risk register|[Link]|[Version]|

## 3. Phạm vi

### 3.1 In scope

|Feature/Area|Test level|Test types|Ghi chú|
|---|---|---|---|
|[Feature 1]|System|Functional, usability| |
|[Feature 2]|Integration|Functional, API| |
|[Feature 3]|System|Security, accessibility| |

### 3.2 Out of scope

|Feature/Area|Lý do|Alternative/Plan|
|---|---|---|
|[Feature X]|Không thuộc release này|Covered trong release sau|

### 3.3 Platform coverage

|Platform|Version|Priority|
|---|---|:---:|
|Chrome|Latest, Latest-1|P1|
|Firefox|Latest|P2|
|Safari|Latest (macOS/iOS)|P1|
|Edge|Latest|P2|
|iOS devices|16+|P1|
|Android devices|12+|P1|

## 4. Test approach

### 4.1 Test levels

|Level|Scope|Owner|Environment|
|---|---|---|---|
|Component|Individual functions/methods|Developer|Local|
|Integration|Component/API interaction|Dev/QA|Integration|
|System|Complete application|QA team|QA/Staging|
|Acceptance|Business validation|Users/PO|UAT|

### 4.2 Test types

|Type|Applicable|Approach|
|---|:---:|---|
|Functional|Yes|Black-box testing theo requirements|
|Regression|Yes|Automated suite + risk-based manual tests|
|Smoke|Yes|Critical paths|
|Performance|[Yes/No]|Load/stress/endurance testing|
|Security|[Yes/No]|Vulnerability scan, penetration testing|
|Usability|[Yes/No]|Heuristic evaluation, user testing|
|Accessibility|[Yes/No]|WCAG 2.1 AA checks|
|Compatibility|Yes|Cross-browser, cross-device|

### 4.3 Test design techniques

|Technique|Khi áp dụng|Coverage objective|
|---|---|---|
|Equivalence partitioning|Input validation, form fields|Tất cả partitions quan trọng|
|Boundary value analysis|Numeric input, date range, min/max length|Mọi boundary quan trọng|
|Decision table|Business rules, permissions|Tất cả rules quan trọng|
|State transition|Workflow, lifecycle, state changes|Tất cả transitions quan trọng|
|Use case testing|End-to-end scenarios|Main + alternative flows|
|Exploratory testing|Tính năng mới, khu vực risk cao|Sessions dựa trên charter|
|Error guessing|Cross-cutting|Dựa trên kinh nghiệm và defect history|

### 4.4 Test data strategy

|Aspect|Approach|
|---|---|
|Nguồn dữ liệu|Synthetic / production-like / anonymized data|
|Data management|[Cách tạo, maintain, refresh data]|
|Sensitive data|Masking/anonymization|
|Ownership|[Owner/team chịu trách nhiệm]|

### 4.5 Automation strategy

|Category|Automation approach|
|---|---|
|Unit testing|Coverage target 80%+|
|API testing|Critical endpoints + contract/schema validation|
|UI smoke testing|Critical user journeys|
|UI regression|Stable, high-value flows|
|Performance|Automated load testing trong CI nếu phù hợp|

**Automation criteria:**

- Chức năng ổn định, không thay đổi thường xuyên.
- Tần suất chạy cao, đặc biệt trong regression.
- Có expected result/test oracle rõ ràng.
- Test data có thể chuẩn bị và cleanup ổn định.
- Có performance baseline nếu là performance test.

**Manual testing focus:**

- Exploratory testing.
- Usability review.
- New/unstable features.
- Edge cases khó tự động hóa.
- Accessibility manual checks như keyboard navigation/screen reader.

## 5. Entry và exit criteria

### 5.1 Entry criteria

|Criteria|Required|Verification|
|---|:---:|---|
|Test environment sẵn sàng và ổn định|Yes|Smoke check pass|
|Build đã deploy lên test environment|Yes|Deployment verified|
|Test data đã chuẩn bị|Yes|Data validation pass|
|Test cases đã review/sign-off|Yes|Review record|
|Unit tests pass|Yes|CI green|
|Known blockers đã xử lý|Yes|No open blocking issue|
|Tài khoản và permissions đã cấp|Yes|Team có thể đăng nhập và thực hiện test|

### 5.2 Exit criteria

|Criteria|Target|Measurement|
|---|:---:|---|
|Test case execution|100%|Executed / Planned|
|Test case pass rate|>= 95%|Passed / Executed|
|Open Critical defects|0|Defect tracker|
|Open Major defects|<= 3|Defect tracker|
|High-risk requirements covered|100%|Traceability matrix|
|Regression suite passed|100%|CI/test report|
|Performance targets đạt|All relevant NFR|Performance report|

### 5.3 Suspension and resumption

|Condition|Action|
|---|---|
|Critical blocker phát hiện|Tạm dừng testing, escalate tới owner|
|Environment downtime > 2 giờ|Tạm dừng testing, escalate tới DevOps|
|> 20% tests bị blocked|Tạm dừng execution, xử lý blocker trước|
|Blockers resolved|Resume testing, re-run affected tests|

## 6. Test deliverables

|Deliverable|Format|Frequency|Audience|
|---|---|---|---|
|Test plan|Markdown/Doc|Một lần, update khi cần|Stakeholders|
|Test cases|CSV/Test management tool|Trước execution|QA team|
|Traceability matrix|CSV|Duy trì liên tục|QA lead, PO|
|Daily status report|Email/Slack|Hằng ngày trong test execution|Team|
|Bug report|Jira|Khi phát hiện defect|Developer, QA, PO|
|Test summary report|Markdown/Doc|Kết thúc test cycle|Stakeholders|

## 7. Schedule and milestones

|Milestone|Start date|End date|Duration|Dependencies|
|---|---|---|:---:|---|
|Lập test plan| | | |Requirements sign-off|
|Test design| | | |Test plan approved|
|Environment setup| | | |Infrastructure ready|
|Test execution| | | |Entry criteria met|
|Regression testing| | | |Code freeze|
|UAT| | | |QA sign-off|
|Go-live| | | |Exit criteria met|

## 8. Roles and responsibilities

|Role|Name|Responsibilities|
|---|---|---|
|Test lead|{{OWNER}}|Lập kế hoạch, điều phối, theo dõi và báo cáo|
|QA engineer|[Name]|Test design, test execution, bug reporting|
|Automation engineer|[Name]|Phát triển và maintain automated tests|
|Developer|[Name]|Bug fix, unit tests, hỗ trợ triage|
|Product owner|[Name]|Làm rõ requirements, acceptance sign-off|
|DevOps|[Name]|Environment, deployment, CI/CD|

## 9. Test environment and tools

### 9.1 Environments

|Environment|Purpose|URL|Data|
|---|---|---|---|
|Development|Developer testing|[URL]|Developer data|
|QA|QA team testing|[URL]|Test data|
|Staging|Pre-production validation|[URL]|Production-like data|
|UAT|User acceptance testing|[URL]|UAT data|

### 9.2 Tools

|Category|Tool|Purpose|
|---|---|---|
|Test management|[Jira/TestRail/Zephyr]|Quản lý test cases|
|Automation|Playwright/Selenium|UI automation|
|API testing|[Postman/Playwright/REST Assured]|API testing|
|CI/CD|[GitHub Actions/Jenkins]|Run automated tests|
|Defect tracking|[Jira]|Bug tracking|
|Reporting|[Allure/HTML reporter]|Test reporting|

## 10. Risks and mitigations

|ID|Risk|Likelihood|Impact|Exposure|Mitigation|Owner|
|---|---|:---:|:---:|:---:|---|---|
|R1|Môi trường không ổn định|Medium|High|High|Monitoring, dedicated QA environment|DevOps|
|R2|Requirements thay đổi|High|Medium|High|Change control, re-estimation|PO|
|R3|Thiếu nhân sự/resource|Low|High|Medium|Cross-training, documentation|Lead|
|R4|Third-party integration issue|Medium|High|High|Mocking service, early testing|QA|
|R5|Timeline bị rút ngắn|Medium|High|High|Ưu tiên theo risk-based testing|Lead|

## 11. Monitoring and reporting

|Metric|Formula|Target|Frequency|
|---|---|---|---|
|Execution rate|Executed / Planned|100%|Daily|
|Pass rate|Passed / Executed|>= 95%|Daily|
|Blocked rate|Blocked / Planned|<= 5%|Daily|
|Defect fix rate|Fixed / Found|[Target]|Daily/Weekly|
|Requirements coverage|Covered / Total|100% for high-risk|Weekly|

## 12. Approval

|Role|Name|Decision|Date|
|---|---|---|---|
|QA Lead|{{OWNER}}|Approved / Rejected|{{DATE}}|
|Product Owner|[Name]|Approved / Rejected|[Date]|
