---
name: Flaky Test Analyzer
description: Skill phân tích và khắc phục các automation test không ổn định (flaky tests), xác định root cause và đề xuất fix.
---

# Flaky Test Analyzer

Purpose: Identify and resolve unstable automation tests.

---

## When to Use

Use this skill when:

- A test passes and fails intermittently
- Test results are inconsistent across runs
- CI/CD pipeline has unreliable test results

---

## Responsibilities

Detect flaky tests caused by:

- Unstable locators (dynamic classes, positional xpath)
- Timing issues (race conditions, slow page loads)
- Incorrect waits (hard sleep instead of smart waits)
- Environment dependency (browser version mismatch local vs CI, network latency, viewport size differences, external service down, data not cleaned up)
- Test data conflicts (shared data between parallel tests)
- Test design issues (test quá phức tạp/quá nhiều steps, setup/teardown không cleanup đúng, assertion không chính xác)

---

## Analysis Workflow

1. **Detect** — Identify the failing test and reproduce the failure
2. **Inspect** — Read error logs, stack traces, and screenshots
3. **Classify** — Categorize the root cause (locator / timing / data / environment)
4. **Fix** — Apply the appropriate fix strategy
5. **Verify** — Re-run test multiple times to confirm stability

---

## Common Flaky Causes & Fixes

### Unstable Locator

**Problem:**
```
//div[3]/button
.css-1n2xyz-btn
```

**Fix:** Replace with stable locator following priority in `.claude/rules/locator_strategy.md`:
- `id`, `data-testid`, `name`, `css selector` (stable), `xpath` (relative)

---

### Timing Issues

**Problem:**
```java
Thread.sleep(3000);       // Hard sleep — BAD
page.waitForTimeout(2000); // Fixed delay — BAD
```

**Fix:** Use smart waits as defined in `.claude/rules/selenium_rules.md` and `.claude/rules/playwright_rules.md`:
```java
// Selenium
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("result")));

// Playwright
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
```

---

### Test Data Conflicts

**Problem:** Tests share mutable data → parallel runs conflict.

**Fix:** Use unique, traceable random data:
```
<testName>_<timestamp>@test.com
```

---

## Analysis Output Format

Khi báo cáo kết quả phân tích, trả về bảng:

| # | Nguyên nhân | Mức độ | Dòng code/File | Giải pháp |

Kèm theo:
1. Root cause chính (1 câu)
2. Code fix đề xuất
3. Checklist phòng ngừa flaky trong tương lai (xem Stability Checklist bên dưới)

---

## Stability Checklist

After fixing a flaky test, verify:

- [ ] Locator is unique and stable across reloads
- [ ] No hard sleep or fixed delays
- [ ] Test data is unique and deterministic
- [ ] Test is independent (no dependency on other tests)
- [ ] Test passes 5+ consecutive runs

---

## Rules References

The agent MUST follow these rules when analyzing flaky tests:

- `.claude/rules/locator_strategy.md` — Locator stability rules
- `.claude/rules/automation_rules.md` — General automation best practices
- `.claude/rules/selenium_rules.md` — Selenium wait strategy
- `.claude/rules/playwright_rules.md` — Playwright auto-waiting