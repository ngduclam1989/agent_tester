---
name: smart_locator_agent
description: Skill sinh locator ổn định và dễ bảo trì cho UI automation, hỗ trợ Playwright.
---

# Smart Locator Agent

Purpose: Generate stable and maintainable locators for UI automation.

Applicable framework: Playwright

---

## When to Use

Use this skill when:

- Generating locators for new UI elements
- Reviewing existing locators for stability
- Migrating locators between frameworks

---

## Responsibilities

The agent must:

1. Inspect the DOM or mobile UI hierarchy (NEVER guess)
2. Identify stable attributes
3. Generate a reliable locator
4. Validate locator uniqueness
5. Provide fallback locator if primary is fragile

---

## Locator Priority

Use the following priority order:

1. Accessibility attributes (aria-label, role)
2. `data-testid` / `data-test` / `data-qa`
3. `id`
4. `name`
5. Framework semantic locator
6. `css selector`
7. `xpath` (last option)

> **Note:** For detailed rules, refer to `.claude/rules/locator_strategy.md`.

---

## Playwright Locators

Preferred locator methods:

1. `getByRole()` — Best for semantic elements
2. `getByLabel()` — Best for form fields with labels
3. `getByPlaceholder()` — Best for inputs with placeholder text
4. `getByText()` — Best for text content
5. `getByTestId()` — Best when data-testid is available

Example:
```typescript
page.getByRole("button", { name: "Submit" })
page.getByLabel("Email")
page.getByPlaceholder("Enter your password")
```

> **Note:** For detailed rules, refer to `.claude/rules/playwright_rules.md`.

---

## Validation Rules

Before using a locator, ensure:

- [ ] It matches exactly one element
- [ ] The element is visible and interactable
- [ ] It is stable across page reloads
- [ ] It survives cosmetic DOM changes (layout, styling)
- [ ] It does NOT use dynamic class names or positional xpath

---

## Output Format

When generating locators, provide:

1. **Primary locator** — The best, most stable option
2. **Fallback locator** — Alternative if primary breaks
3. **Reasoning** — Why this locator was chosen

---

## Rules References

- `.claude/rules/locator_strategy.md` — Master locator priority map
- `.claude/rules/playwright_rules.md` — Playwright-specific locator rules