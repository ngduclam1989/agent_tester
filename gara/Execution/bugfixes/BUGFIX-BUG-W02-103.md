# BUGFIX BUG-W02-103 — Zod validate message tiếng Anh trên form Giấy ủy quyền + BBNT

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual BA test (2026-06-24, web SET-20260625-00002 → Giấy ủy quyền → Số tiền bồi thường nhập "575757567f")
> Reporter: BA (anh Lương) via agent-test-orchestrator

## 1. Failure mode

Field "Số tiền bồi thường" (Giấy ủy quyền, Mục III Nội dung ủy quyền): khi user nhập sai (vd "575757567f") → form hiển thị message lỗi TIẾNG ANH:

```
Expected number, received nan
```

Yêu cầu BA: sản phẩm 100% tiếng Việt → message PHẢI tiếng Việt. GIỮ validate (vẫn bắt buộc số) vì SDL `amountNumeric: Float!` không cho phép free-text. CHỈ đổi message — KHÔNG đụng contract.

Cùng gốc: BUG-W02-066 đã gặp "Expected number, received string" trên cùng schema.

## 2. Root cause

`src/features/insurance-dossier/schemas/dossier-template.schema.ts`:

- `trimmedString` (helper string) dùng default Zod (`Required`, `Expected string, received undefined`) — tiếng Anh.
- `authorizationCompensationSchema.amountNumeric: z.coerce.number().nonnegative()` — không set `invalid_type_error` / `message` → tiếng Anh.
- `acceptanceFormSchema.clauses` + `authorizationFormSchema.commitmentClauses` `.min(N)` — không set message → tiếng Anh.

## 3. Fix

### `src/features/insurance-dossier/schemas/dossier-template.schema.ts`

Add Vietnamese messages constants:

- `REQUIRED_MESSAGE = "Vui lòng nhập thông tin"`
- `NUMBER_INVALID_MESSAGE = "Vui lòng nhập số hợp lệ"`
- `NUMBER_NONNEGATIVE_MESSAGE = "Vui lòng nhập số không âm"`
- `MIN_CLAUSES_ACCEPTANCE_MESSAGE = "Vui lòng nhập ít nhất 1 điều khoản nghiệm thu"`
- `MIN_CLAUSES_AUTHORIZATION_MESSAGE = "Vui lòng nhập ít nhất 3 điều khoản cam kết"`

Apply:

- `trimmedString` → `z.string({ required_error, invalid_type_error: REQUIRED_MESSAGE })` (sweep tất cả required string field).
- `amountNumeric` → `z.coerce.number({ required_error, invalid_type_error: NUMBER_INVALID_MESSAGE }).nonnegative({ message: NUMBER_NONNEGATIVE_MESSAGE })`.
- `acceptanceFormSchema.clauses` → `.min(1, { message: MIN_CLAUSES_ACCEPTANCE_MESSAGE })`.
- `authorizationFormSchema.commitmentClauses` → `.min(3, { message: MIN_CLAUSES_AUTHORIZATION_MESSAGE })`.

CONTRACT KHÔNG ĐỔI: cùng kiểu (number / string), cùng validation rule (nonnegative, min count). Chỉ message wording đổi từ tiếng Anh sang tiếng Việt. KHÔNG xung đột BUG-W02-101 (serialize layer độc lập).

## 4. Regression test

### `src/features/insurance-dossier/schemas/dossier-template.schema.bug-w02-103.test.ts` (NEW)

8 assertions:

1. `amountNumeric = "575757567f"` → fail, message contains "Vui lòng nhập số hợp lệ"; KHÔNG chứa "Expected number" / "received nan" / "received string".
2. `amountNumeric = -5` → fail, message "Vui lòng nhập số không âm".
3. `amountNumeric = 8447207` (number) → pass (regression baseline).
4. `amountNumeric = "8447207"` (numeric string) → pass (BUG-W02-066 coerce regression).
5. `placeIssued` missing → fail, message "Vui lòng nhập thông tin"; KHÔNG "Required" / "Expected string".
6. `commitmentClauses.length < 3` → fail, message "Vui lòng nhập ít nhất 3 điều khoản cam kết".
7. `acceptanceFormSchema.clauses = []` → fail, message "Vui lòng nhập ít nhất 1 điều khoản nghiệm thu".
8. `acceptanceFormSchema` thiếu `licensePlate` → fail, message "Vui lòng nhập thông tin".

Cộng baseline: BUG-W02-066 schema tests (4/4) vẫn pass.

## 5. Verify

```bash
cd frontend/gf-gms-web
npx vitest run src/features/insurance-dossier/schemas/
# ✓ 12 tests pass (BUG-066 4 + BUG-103 8)
npx eslint src/features/insurance-dossier/schemas/dossier-template.schema.ts
# clean
npx tsc --noEmit
# clean
```

## 6. Related

- BUG-W02-066 (FIX_DONE — cùng schema, đã fix `z.coerce.number()`; bug này đổi MESSAGE chứ không đổi rule).
- BUG-W02-101 (export Float! fail — KHÁC layer serialize, GIỮ validate ở đây không đụng 101).
- BUG-W02-003 (i18n family — hardcoded EN/thiếu locale; tương tự pattern).
