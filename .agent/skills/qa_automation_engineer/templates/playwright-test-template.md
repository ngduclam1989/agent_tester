# Automated testing của Playwright: [Tên Feature/Module]

**File kiểm tra:** [tests/feature/test.spec.ts]
**Danh mục:** [Chức năng|UI/Visual|Xác thực mẫu|Điều hướng|Tích hợp API|Accessibility]
**Tính năng:** [Tên tính năng]
**Đã tạo:** [YYYY-MM-DD]
**Tác giả:** [Tên bạn]

---

## Mô tả kiểm tra

[Mô tả ngắn gọn về nội dung của test suite này]

---

## Quy ước đặt tên

- Bao gồm ID test case để traceability: `"TC-XXX [description]"`
- Thêm thẻ bộ cho các lần chạy `--grep`: `"@smoke"`, `"@regression"`, `"@critical"`

---

## Cấu trúc test suite

```typescript
import { test, expect } from "@playwright/test";

test.describe("[Feature/Module Name]", () => {
  // Common setup for all tests in this suite
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL
    await page.goto(process.env.BASE_URL || "BASE_URL_HERE");

    // Additional setup if needed
    // - Login with test credentials
    // - Set required cookies/localStorage
    // - Navigate to specific page
  });

  // Example test - replace with your actual tests
  test("TC-XXX @smoke @regression [Test Description]", async ({ page }) => {
    await test.step("Verify initial state", async () => {
      // Use role-based locators for accessibility
      await expect(
        page.getByRole("heading", { name: "Page Title" }),
      ).toBeVisible();
    });

    await test.step("Perform user action", async () => {
      // Prefer stable locators (data-testid) when available
      // await page.getByTestId('submit-button').click();

      // Or use role-based locators
      await page.getByRole("button", { name: "Submit" }).click();
    });

    await test.step("Verify expected outcome", async () => {
      // Use web-first assertions
      await expect(page).toHaveURL(/.*success/);
      await expect(page.getByRole("alert")).toContainText("Success");
    });
  });

  // Add more tests as needed
  // test('TC-XXX @regression [Test Description]', async ({ page }) => {
  //   // Test implementation
  // });

  // test('TC-XXX @critical [Test Description]', async ({ page }) => {
  //   // Test implementation
  // });
});
```

---

## Bảo mật

- Tải thông tin xác thực từ các biến môi trường
- Không bao giờ mã hóa bí mật hoặc test data
- Sử dụng tài khoản test được cung cấp để test

**Ví dụ:**

```typescript
const { TEST_USER_EMAIL, TEST_USER_PASSWORD } = process.env;
```

---

## Thực tiễn tốt nhất

### 1. Locator strategy

**Ưu tiên:**

- `getByRole()` - Dễ tiếp cận và ổn định nhất
- `getByTestId()` - Ổn định nhất khi có sẵn
- `getByLabel()` - Tốt cho các trường biểu mẫu

**Tránh:**

- Bộ chọn CSS - Dễ dàng thay đổi kiểu dáng
- XPath - Dễ vỡ và khó bảo trì

**Ví dụ:**

```typescript
// Good - Role-based
await page.getByRole("button", { name: "Submit" }).click();

// Good - Test ID
await page.getByTestId("submit-button").click();

// Good - Label
await page.getByLabel("Email").fill("test@example.com");

// Avoid - CSS selector
await page.locator(".btn.submit").click();
```

### 2. Assertions

**Sử dụng xác nhận đầu tiên trên web:**

```typescript
// Good
await expect(page.getByRole("heading")).toBeVisible();
await expect(page.getByRole("alert")).toHaveText("Success");
await expect(page).toHaveURL(/.*dashboard/);

// Avoid - Manual waits
await page.waitForSelector(".alert");
```

### 3. Tổ chức thi

**Nhóm các bước liên quan với test.step():**

```typescript
test("example test", async ({ page }) => {
  await test.step("Setup", async () => {
    // Setup code
  });

  await test.step("Execute", async () => {
    // Main test code
  });

  await test.step("Verify", async () => {
    // Verification code
  });
});
```

**Giữ các test độc lập:**

```typescript
test.beforeEach(async ({ page }) => {
  // Setup preconditions explicitly
  await page.goto("/login");
});

// Each test is independent and can run alone
test("test 1", async ({ page }) => {
  /* ... */
});
test("test 2", async ({ page }) => {
  /* ... */
});
```

### 4. Xử lý lỗi

**Playwright auto-wait các phần tử:**

```typescript
// No need for explicit waits
await page.getByRole("button", { name: "Submit" }).click();
await expect(page.getByRole("alert")).toBeVisible();

// Screenshots captured automatically on failure
```

### 5. Test data

**Tải từ các biến môi trường:**

```typescript
// .env file (never commit this)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
BASE_URL=http://localhost:3000

// In test file
const { TEST_USER_EMAIL, TEST_USER_PASSWORD, BASE_URL } = process.env;
```

**Sử dụng trình tạo test data:**

```typescript
// Example with Faker.js
import { faker } from "@faker-js/faker";

const testEmail = faker.internet.email();
const testName = faker.person.fullName();
```

---

## Chạy test

### Chạy tất cả các test

```bash
npx playwright test
```

### Chạy theo thẻ

```bash
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"
npx playwright test --grep "@critical"
```

### Chạy file cụ thể

```bash
npx playwright test tests/feature/test.spec.ts
```

### Chạy với UI

```bash
npx playwright test --ui
```

### Chạy ở chế độ gỡ lỗi

```bash
npx playwright test --debug
```

### Chạy trên các browser cụ thể

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Test case

|Test code|Mô tả|Thẻ|Trạng thái|
| ------- | ------------- | --------------------- | ------- |
|TC-XXX|[Mô tả]|@smoke @regression|Không chạy|
|TC-XXX|[Mô tả]|@regression @tiêu cực|Không chạy|
|TC-XXX|[Mô tả]|@regression @ranh giới|Không chạy|

---

## Ghi chú

- [Bối cảnh bổ sung]
- [Vấn đề đã biết]
- [Phụ thuộc vào các tính năng khác]
- [Cân nhắc cụ thể về tự động hóa]

---

## Các test case liên quan

- [TC-XXX: Test case liên quan]
- [TC-XXX: Test case liên quan]

---

## File đính kèm

- [ ] Screenshot
- [ ] Bản ghi màn hình
- [ ] Console log
- [ ] Network trace
- [ ] File trace của Playwright

---

## Tài liệu tham khảo

- [Tài liệu về Playwright](https://playwright.dev/docs/intro)
- [Instructions các phương pháp hay nhất](https://playwright.dev/docs/best-practices)
- [Locator strategy](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
