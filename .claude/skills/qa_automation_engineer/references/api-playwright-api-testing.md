# Playwright API Testing

Detailed reference for API testing with Playwright's request fixture, Supertest, and Zod schema validation in TypeScript.

## Using Request Fixture

The `request` fixture from `@playwright/test` provides an isolated HTTP client for API testing:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Users API", () => {
  test("creates a user", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: {
        name: "Test User",
        email: "test@example.com",
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.name).toBe("Test User");
  });

  test("returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/admin/users");
    expect(response.status()).toBe(401);
  });
});
```

## Auth-Scoped API Tests

Use Playwright's `storageState` to pre-authenticate API tests:

```typescript
test.use({ storageState: ".auth/admin.json" });

test("admin can list all users", async ({ request }) => {
  const response = await request.get("/api/admin/users");
  expect(response.ok()).toBeTruthy();
});
```

## Custom API Fixtures

Create typed fixtures for API testing with dependency injection:

```typescript
// tests/fixtures/api.fixture.ts
import { test as base, APIRequestContext } from "@playwright/test";

type ApiFixtures = {
  apiContext: APIRequestContext;
  authToken: string;
};

export const apiTest = base.extend<ApiFixtures>({
  authToken: async ({ request }, use) => {
    const response = await request.post("/api/auth/login", {
      data: { username: "admin", password: "password" },
    });
    const { token } = await response.json();
    await use(token);
  },
});
```

## Using Supertest (Alternative)

Supertest is useful for testing Express/fastify apps directly without HTTP:

```typescript
import request from "supertest";
import { app } from "../src/app";

test("POST /api/users validates input", async () => {
  const response = await request(app)
    .post("/api/users")
    .send({ name: "", email: "invalid" });
  expect(response.status).toBe(400);
  expect(response.body.error.details).toHaveLength(2);
});
```

## Schema Validation with Zod

Validate response structure on every test:

```typescript
import { z } from "zod";

const UserSchema = z.strictObject({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  created_at: z.string().datetime(),
});

test("response matches user schema", async ({ request }) => {
  const response = await request.get("/api/users/1");
  const body = await response.json();
  const user = UserSchema.parse(body); // throws if invalid
  expect(user.id).toBeDefined();
});
```

## Data-Driven API Tests

Use parameterized tests for multiple scenarios:

```typescript
const invalidEmails = [
  "",
  "not-an-email",
  "@missing.com",
  "missing@",
  "spaces in@email.com",
];

for (const email of invalidEmails) {
  test(`rejects invalid email: "${email}"`, async ({ request }) => {
    const response = await request.post("/api/users", {
      data: { name: "Test", email },
    });
    expect(response.status()).toBe(400);
  });
}
```

## Pagination Testing Pattern

```typescript
test.describe("Pagination", () => {
  test("returns paginated results", async ({ request }) => {
    const page1 = await request.get("/api/users?offset=0&limit=5");
    const body1 = await page1.json();

    expect(page1.status()).toBe(200);
    expect(body1.data.length).toBeLessThanOrEqual(5);

    if (body1.pagination.has_more) {
      const page2 = await request.get(`/api/users?offset=5&limit=5`);
      expect(page2.status()).toBe(200);
    }
  });

  test("returns 400 for negative offset", async ({ request }) => {
    const response = await request.get("/api/users?offset=-1&limit=10");
    expect(response.status()).toBe(400);
  });
});
```

---

## Pattern chuẩn của project: Data-Driven từ Excel + validate 3 tầng

> Đây là pattern **đang chạy thật** trong repo, ưu tiên dùng thay cho các ví dụ hardcode ở trên
> khi số lượng test case lớn (hàng chục — hàng trăm TC cùng endpoint).
> Code tham chiếu: `tests/api/`, `utils/api-function.ts`, `utils/excel-reader.ts`,
> `common/api-common.ts`, `config/env.ts`. Template: `templates/api-playwright-api-spec.ts`.

### Vì sao data-driven

Test case API sinh ra từ skill `api_test_design` (schema 19 cột) thường lên tới vài chục TC cho
1 endpoint. Viết mỗi TC thành 1 khối `test()` riêng làm file phình và trùng lặp gần như hoàn toàn.
Cách làm: đưa TC vào file Excel, spec đọc file rồi sinh test động trong vòng lặp.

**Cấu trúc cột Excel:**

| Cột | Ý nghĩa |
|---|---|
| `${STT}` | Số thứ tự — trống là hết vùng data |
| `${Name}` | Tên test case hiển thị trong report |
| `${Domain}` | Base URL — để trống thì lấy từ `config/env.ts` |
| `${EndPoint}` | Path của API |
| `${Method}` | GET/POST/PUT/DELETE... |
| `${Data}` | Request body dạng JSON string |
| `${StatusCode}` | HTTP status mong đợi |
| `${ResponseStructure}` | Đường dẫn file JSON Schema để validate |
| `${ResponseParam}` | Danh sách node cần check, cách nhau bằng `;` (VD `code;data.id`) |
| `${ResponseValue}` | Giá trị mong đợi tương ứng, để trống = chỉ check node tồn tại |

### Validate 3 tầng bằng `expect.soft`

```typescript
validateStatusCode(response, Number(row[COL.STATUS]));   // Tầng 1
await validateSchema(response, schema);                   // Tầng 2
validateJsonNodes(responseBody, row[COL.PARAM], row[COL.VALUE]); // Tầng 3
```

**BẮT BUỘC dùng `expect.soft()` bên trong 3 hàm này, KHÔNG tự `throw new Error`.** Nếu throw thủ công,
fail ở tầng 1 (status) làm tầng 2 và 3 không bao giờ chạy — mỗi lần chạy chỉ biết 1 lỗi, phải sửa và
chạy lại nhiều vòng. Với soft assertion, 1 lần chạy báo đủ cả 3 tầng và test vẫn được đánh FAIL.

### JSON Schema với Ajv

Project dùng **Ajv + file JSON Schema** (`test-data/json_schema/*.json`) thay vì Zod, vì schema
là file dữ liệu tách rời — người viết test case khai đường dẫn ngay trong cột Excel, không cần sửa code.

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv); // BẮT BUỘC
```

⚠️ **Thiếu `addFormats(ajv)` là bug âm thầm:** mọi `"format": "email"`, `"date-time"`, `"uri"` trong
schema sẽ bị Ajv bỏ qua hoàn toàn mà không báo gì — schema trông như có validate nhưng thực tế không.
`allErrors: true` để báo hết lỗi schema trong 1 lần thay vì dừng ở lỗi đầu.

### Không `console.log` — dùng `testInfo.attach()`

Rule Cleanup trong `CLAUDE.md` cấm để lại `console.log`. Với API test vẫn cần xem request/response
khi debug, cách đúng là đính kèm vào report:

```typescript
await testInfo.attach('request', {
    body: JSON.stringify({ method, url, headers, body: requestData }, null, 2),
    contentType: 'application/json',
});
```

Log vào report thì xem được ngay tại TC bị fail, không trôi mất trong stdout khi chạy parallel.

### Credentials và base URL

**KHÔNG hardcode** username/password/URL trong spec hay file common. Đọc qua `config/env.ts` lấy từ
`.env` (đã nằm trong `.gitignore`), có `.env.example` làm mẫu. `config/env.ts` throw message rõ ràng
khi thiếu biến, để lỗi thiếu cấu hình lộ ra ngay thay vì gửi `Bearer undefined` lên server.
