# BUGFIX BUG-W02-101 — Xuất Giấy ủy quyền: amountNumeric String vs Float! contract mismatch

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual BA test (2026-06-24, web SIT SET-20260625-00002, exportInsuranceDossier curl PAYMENT_AUTHORIZATION)
> Reporter: BA (anh Lương) via agent-test-orchestrator

## 1. Failure mode

Mutation `exportInsuranceDossier` với `documentTypes=[PAYMENT_AUTHORIZATION]` FAIL với GraphQL `BAD_USER_INPUT`:

```
Variable "$authorizationFormData" got invalid value "27410045" at "authorizationFormData.compensation.amountNumeric"
GraphQLError: Float cannot represent non numeric value: "27410045"
```

FE payload gửi `compensation.amountNumeric = "27410045"` (STRING). SDL `agg-garage-graph-graphql.md:44412` khai `amountNumeric: Float!` → GraphQL scalar reject. Backend example + test specs đều dùng number → root cause FE serialize sai kiểu.

## 2. Root cause

Phần CÒN SÓT của BUG-W02-066 (FIX_DONE):

- BUG-W02-066 đã fix Zod schema `z.coerce.number()` để form-validation không báo đỏ "Expected number, received string".
- Tuy nhiên `getAuthorizationValues()` trong `DossierTemplateForm` chỉ return `authorizationForm.getValues()` — đây là raw RHF state, KHÔNG chạy qua zodResolver transform (`getValues` bypass schema coerce).
- `<Input>` (share/inputs/input.tsx) là text input → giữ user input dạng string.
- Modal `insurance-dossier-modal.tsx` consume `getAuthorizationValues()` rồi gửi nguyên vào `payload.authorizationFormData` mutation → string lọt vào payload.

`file:line` evidence:

- `src/features/insurance-dossier/components/dossier-template-form.tsx:621` — `getAuthorizationValues: () => authorizationForm.getValues()` (raw, không coerce).
- `src/features/insurance-dossier/interfaces/index.ts:75` — TS contract `AuthorizationCompensationInput.amountNumeric: number` (SDL Float!).

## 3. Fix

### `src/features/insurance-dossier/components/dossier-template-form.tsx`

Thêm helper `coerceCompensationAmountNumeric` và `normalizeAuthorizationGetValues` (top-level). Wrap `getAuthorizationValues` trong `useImperativeHandle` qua `normalizeAuthorizationGetValues(...)` → coerce `compensation.amountNumeric` thành `number` trước khi return cho consumer (modal + print handler).

Coerce strategy: `typeof === "number"` giữ nguyên; string `trim` + strip `,`/whitespace + `Number(...)`; non-finite/blank → `0`. Nhất quán với Zod schema `z.coerce.number().nonnegative()` đã có (cùng layer).

Sửa này:

- Fix BUG-W02-101 (export Giấy ủy quyền không còn BAD_USER_INPUT).
- KHÔNG sửa `insurance-dossier-modal.tsx` → tránh conflict với BUG-W02-095 in-flight (modal đang được sửa song song bởi subagent khác).
- Cover cả `handleSubmit` (exportInsuranceDossier mutation) lẫn `handlePrintAuthorization` (render PDF preview) vì cả hai consume cùng `getAuthorizationValues`.

## 4. Regression test

### `src/features/insurance-dossier/components/dossier-template-form.bug-w02-101.test.tsx` (NEW)

4 assertions:

1. Type `compensation.amountNumeric` = "27410045" (user typed string) → `getAuthorizationValues()` return `number 27410045`.
2. Type "27,410,045" (comma-grouped) → return `number 27410045`.
3. Blank input → return `number 0`.
4. Numeric prefill (baseline regression) → return `number` không đổi.

Cộng baseline: BUG-W02-066 schema tests (4/4) vẫn pass.

## 5. Verify

```bash
cd frontend/gf-gms-web
npx vitest run src/features/insurance-dossier/components/dossier-template-form.bug-w02-101.test.tsx
# ✓ 4 tests pass
npx eslint src/features/insurance-dossier/components/dossier-template-form.tsx
# clean
npx tsc --noEmit
# clean
```

## 6. Related

- BUG-W02-066 (FIX_DONE) — Zod form-validation; bug này là tầng serialize.
- BUG-W02-002 (date string type sibling).
- BUG-W02-022 (amountNumeric PDF format — khác layer).

## 7. Second-pass closure (2026-06-26 — bug re-opened as P1)

Pass 1 (mô tả §3) chỉ fix `getAuthorizationValues` ref method. Manual repro BA tiếp tục FAIL → bug re-opened.

Phân tích thêm: `InsuranceDossierModal.handleSubmit` không gọi ref method — nó đọc `authorizationSnapshot` state (lift-state pattern). Snapshot được set ban đầu trong `useEffect` tại modal:

```
src/features/insurance-dossier/components/insurance-dossier-modal.tsx:133
setAuthorizationSnapshot(buildAuthorizationFromPrefill(templatePrefill));
```

`buildAuthorizationFromPrefill` (top-level helper trong dossier-template-form.tsx) trước đây dùng `prefill.insuranceAmount ?? 0` trực tiếp → nếu BFF projection drift trả string (per BUG-W02-066 root cause family), initial snapshot có STRING.

Watcher `AuthorizationValuesWatcher` chỉ chạy khi form mount (= user expand accordion). Lazy-mount path (tick checkbox + Xuất KHÔNG expand) BYPASS watcher → snapshot giữ string từ prefill → mutation FAIL.

### Pass 2 fix (3 spots)

1. `dossier-template-form.tsx` — promote `coerceCompensationAmountNumeric` thành exported helper top-level (thay local function).
2. `dossier-template-form.tsx::buildAuthorizationFromPrefill` — gọi `coerceCompensationAmountNumeric(prefill.insuranceAmount)` cả 2 chỗ (defaults init + setDeep override) → initial snapshot luôn `number` regardless of prefill drift.
3. `insurance-dossier-modal.tsx::normalizeAuthorizationPayload` — thêm spread `compensation: { ...compensation, amountNumeric: coerceCompensationAmountNumeric(compensation?.amountNumeric) }` (defense-in-depth tại exit point trước khi gửi mutation).

### Pass 2 regression test

`src/features/insurance-dossier/components/insurance-dossier-modal.bug-w02-101.test.tsx` (NEW, 4 assertions):

1. Normal numeric prefill + lazy-mount submit → payload amountNumeric is `number`.
2. Prefill insuranceAmount as STRING "27410045" (BFF drift) + lazy-mount submit → payload coerced to `number` 27410045.
3. Prefill comma-grouped STRING "27,410,045" → coerced to `number` 27410045.
4. Prefill `null` → fallback `number` 0 (KHÔNG string "").

### Why pass 1 không sufficient

Pass 1 fix ref method (used by `handlePrintAuthorization` — PDF preview path). Modal submit path uses lift-state snapshot, không touch ref. Pass 2 closes 2 remaining serialization paths (prefill source + payload exit) → defense-in-depth coverage.
