# BUGFIX BUG-W02-066 — Zod schema `compensation.amountNumeric` phải coerce string → number

> Wave: W02 · Severity: P2 · Status: OPEN → FIX_DONE
> Boundary: garage-web
> Source TC: Manual QC 2026-06-24 (screenshot "Giấy ủy quyền" - SET-20260623-00002)
> Reporter: BA/PO → agent-test-orchestrator
> Fixer: agent-fix-garage-web (2026-06-24)

## 1. Failure mode

Preview "Giấy ủy quyền" mở ra hiển thị validation error đỏ "Expected number, received string" ngay bên dưới field "Số tiền bồi thường" (Mục III. Nội dung ủy quyền). Prefill value `8447207` bị reject. Form không clean → có thể block nút "Xuất hồ sơ bảo hiểm".

## 2. Root cause

`src/features/insurance-dossier/schemas/dossier-template.schema.ts:73` —
`authorizationCompensationSchema.amountNumeric: z.number().nonnegative()`.

`buildAuthorizationDefaults` (`dossier-template-form.tsx:154`) đặt initial value bằng `prefill.insuranceAmount ?? 0` (number OK), NHƯNG render `<Input>` HTML input có giá trị `value="5000000"` (string DOM). RHF với `mode: "onChange"` trigger validate → Zod gọi `.parse(stringValue)` → fail `Expected number, received string`. (Plus sau khi fix BUG-W02-063, field này editable → user gõ → confirm string flow.)

## 3. Fix

`schemas/dossier-template.schema.ts:73` — đổi `z.number().nonnegative()` → `z.coerce.number().nonnegative()`. Zod sẽ tự coerce string `"8447207"` → `8447207`, NaN/non-numeric/negative vẫn fail.

Approach này khớp pattern Zod-recommended cho HTML input number → form schema. Không cần thay đổi `<Input>`, FieldRenderer hoặc buildDefaults logic.

## 4. Regression test

`schemas/dossier-template.schema.bug-w02-066.test.ts`:
- amountNumeric là number `8447207` → pass, data preserves number.
- amountNumeric là numeric string `"8447207"` → pass, output coerced thành number.
- amountNumeric `"-5"` → fail (nonnegative guard).
- amountNumeric `"abc"` → fail (NaN guard).

## 5. Files changed

- `src/features/insurance-dossier/schemas/dossier-template.schema.ts` (1 dòng — z.number → z.coerce.number).
- `src/features/insurance-dossier/schemas/dossier-template.schema.bug-w02-066.test.ts` (NEW).

## 6. Status update

BUG-W02-066: OPEN → FIX_DONE (verify pending L2). Tương tác với BUG-W02-063 (fix 063 + 066 phải go together): post-fix-063 field editable + post-fix-066 schema accept string → user có thể edit + xuất bình thường.
