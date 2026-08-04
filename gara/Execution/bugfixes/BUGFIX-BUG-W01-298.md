# BUGFIX-BUG-W01-298 — SO Detail tab "Thông tin khác" — Section file đính kèm "Tài liệu khác" + "Hồ sơ bảo lãnh" thiếu placeholder khi rỗng (REOPENED)

| Field | Value |
|---|---|
| Bug ID | BUG-W01-298 (REOPENED) |
| Severity | P3 |
| Status | RESOLVED (pending TEST_GROUP / QA verify) |
| Wave | W01 (EP-INSURANCE-SETTLEMENT) |
| Feature(s) | FEAT-SO-DETAIL (tab "Thông tin khác") |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Fix Agent | agent-fix-garage-web |
| Fix Commit | `PENDING_USER_COMMIT` |
| Fix Branch | `feature/ep-insurance-settlement-w01` |
| Spec Version | 1 |
| Last Reviewed | 2026-06-17 |

## 1. Symptom (REOPEN — Manual QC 2026-06-17)

Trên SO Detail tab "Thông tin khác" (screenshot `PDV-20260617-01115`), 2 row file đính kèm bị render với cell value rỗng (cell collapse) khi không có document, mất alignment với grid:

- Row "Tài liệu khác" (trong `vehicleItems`, `col-span-2`) — render `<DocumentList documents={otherDocuments} />`. `DocumentList` return `null` khi `documents.length === 0`. Cell empty không có placeholder `"--"`.
- Row "Hồ sơ bảo lãnh" (trong `insuranceItems`) — render conditional `insuranceDocuments.length ? <DocumentList .../> : null`. Cùng vấn đề: `null` fallback làm cell trống.

Phần BUG-W01-298 ban đầu (Badge border + tab spacing trên STL Detail BH) đã được fix trước đó; bug REOPEN dùng cùng ID cho 1 defect khác do user explicitly map (USER CONTEXT 2026-06-17).

## 2. Root Cause

`frontend/gf-gms-web/src/features/service-order/components/detail/other-info.tsx`:

```tsx
const vehicleItems = [
  …,
  {
    label: "Tài liệu khác",
    value: <DocumentList documents={otherDocuments} />,   // L104-105
    className: "col-span-2",
  },
];

const insuranceItems = [
  …,
  {
    label: "Hồ sơ bảo lãnh",
    value: insuranceDocuments.length ? (                   // L134-138
      <DocumentList documents={insuranceDocuments} gridCols="grid-cols-1" />
    ) : null,
  },
];
```

`DocumentList` (`src/components/share/images/document-list.tsx` L40-41) returns `null` khi `documents.length === 0`. `DescriptionItem` (`src/components/share/displays/description-item.tsx` L31-34) khi nhận `children = <DocumentList …/>` (non-string non-falsy element) đi vào fallback `children` branch và render element as-is → kết quả render `null` trên DOM, làm cell trống (label "Tài liệu khác"/"Hồ sơ bảo lãnh" hiển thị 1 mình).

Pattern thiếu fallback `"--"` không chỉ chạm 2 row này — toàn map `vehicleItems` + `insuranceItems` đi qua `DescriptionItem` mà chỉ 2 row dùng React-node value (gây trigger null fallback gap).

## 3. Fix

### 3.1 Conditional render `"--"` placeholder khi list rỗng

`frontend/gf-gms-web/src/features/service-order/components/detail/other-info.tsx`:

```tsx
// vehicleItems entry "Tài liệu khác":
{
  label: "Tài liệu khác",
  value:
    otherDocuments.length > 0 ? (
      <DocumentList documents={otherDocuments} />
    ) : (
      "--"
    ),
  className: "col-span-2",
},

// insuranceItems entry "Hồ sơ bảo lãnh":
{
  label: "Hồ sơ bảo lãnh",
  value: insuranceDocuments.length ? (
    <DocumentList documents={insuranceDocuments} gridCols="grid-cols-1" />
  ) : (
    "--"
  ),
},
```

`"--"` là string nên `DescriptionItem` đi vào branch `typeof children === "string"` → render qua wrapper `<p>` với typography đúng (giống các row data khác trong grid).

### 3.2 Regression test

`frontend/gf-gms-web/src/features/service-order/components/detail/other-info.bug-298-reopen.test.ts` — 2 source-pin specs:

1. "Tài liệu khác" falls back to `"--"` khi `otherDocuments.length === 0` (pin `otherDocuments.length > 0 ? (<DocumentList …/>) : ("--")` shape).
2. "Hồ sơ bảo lãnh" falls back to `"--"` thay vì `null` khi `insuranceDocuments` rỗng (pin removal của old `: null,` shape).

## 4. Verification

```bash
cd frontend/gf-gms-web
npx vitest run --environment=node \
  src/features/service-order/components/detail/other-info.bug-298-reopen.test.ts
# → 2/2 passed

npm run build           # → exit 0 (built in 20.30s)

npx eslint --max-warnings=0 \
  src/features/service-order/components/detail/other-info.tsx \
  src/features/service-order/components/detail/other-info.bug-298-reopen.test.ts
# → clean
```

## 5. Files Changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/service-order/components/detail/other-info.tsx` | "Tài liệu khác" + "Hồ sơ bảo lãnh" entries: ternary fallback `"--"` thay vì null/missing |
| `frontend/gf-gms-web/src/features/service-order/components/detail/other-info.bug-298-reopen.test.ts` | NEW — 2-spec regression source-pin |

## 6. Constraints Honored

- FE-only (Layer 1 garage-web) — KHÔNG đụng BFF/BE/data layer.
- KHÔNG modify shared primitive `DocumentList` hoặc `DescriptionItem` — fix tại usage site only (anatomy-reuse discipline).
- Scope minimum: chỉ touch 2 entries declared trong issue. Pattern legacy thiếu fallback khác trong file (vd `Ghi chú` row nếu rỗng) — out of scope; ghi vào Follow-ups nếu QA flag tiếp.
- KHÔNG tạo component mới (FM-018 compliance).

## 7. Follow-ups

- Pattern `<DescriptionItem><DocumentList …/></DescriptionItem>` ở các page khác có thể có cùng defect (KH STL Detail `insurance-info.tsx` L56-65 cũng pass DocumentList trực tiếp không guard). Defer — KHÔNG widen scope BUG-298 reopen.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial REOPEN fix — fallback `"--"` placeholder cho "Tài liệu khác" + "Hồ sơ bảo lãnh" khi document list rỗng. |
