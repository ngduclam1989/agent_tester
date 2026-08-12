# Schema Validation

Schema validation patterns for TypeScript (Zod). Ensures API responses match expected structure on every test.

## Zod (TypeScript)

### User Schema

```typescript
import { z } from "zod";

// Strict schema — no extra fields allowed
const UserSchema = z.strictObject({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "viewer"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});
```

### Pagination Response Schema

```typescript
const PaginatedUsersSchema = z.strictObject({
  data: z.array(UserSchema),
  pagination: z.strictObject({
    total: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    has_more: z.boolean(),
  }),
});

// Usage in test
test("paginated response matches schema", async ({ request }) => {
  const response = await request.get("/api/users?offset=0&limit=10");
  const body = await response.json();
  const result = PaginatedUsersSchema.parse(body); // throws if invalid
});
```

### Error Response Schema

```typescript
const ErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z.strictObject({
          field: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  }),
});
```

## Strict vs Loose Validation

| Scenario                                  | TypeScript                        |
| ----------------------------------------- | --------------------------------- |
| **Your API** (you control the contract)   | `z.strictObject()`                |
| **Third-party API** (fields may be added) | `z.object()`                      |
| **Hybrid** (some required, some optional) | `z.object()` with optional fields |

**Rule of thumb:** Use strict for APIs you own, loose for APIs you consume.
