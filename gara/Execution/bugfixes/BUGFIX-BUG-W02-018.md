# BUGFIX BUG-W02-018 — payerType !== INSURANCE render info copy thay vì null

> Wave: W02 · Severity: P3 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding)
> Reporter: agent-review-garage-web

## 1. Failure mode

`insurance-dossier-tab.tsx:49-51`:

```ts
if (payerType !== undefined && payerType !== INSURANCE_PAYER_TYPE) {
  return null;
}
```

User mở settlement-voucher detail loại CUSTOMER, click tab "Hồ sơ bảo hiểm" → body hoàn toàn trống. UX confusing.

## 2. Root cause

DEV chốt early return null khi payerType không phải INSURANCE — không có info copy giải thích "Hồ sơ BH chỉ áp dụng cho phiếu QT bảo hiểm". Mặc dù tab có thể hidden khỏi tabItems khi `payerType !== INSURANCE`, hiện tại detail page render unconditionally → cần graceful handling.

## 3. Fix

`insurance-dossier-tab.tsx`:

- Replace `return null` với render info copy block:

```tsx
return (
  <div
    data-testid="dossier-tab-non-insurance"
    className="py-8 text-center text-sm text-muted-foreground"
  >
    {NON_INSURANCE_INFO}
  </div>
);
```

Constant `NON_INSURANCE_INFO = "Hồ sơ bảo hiểm chỉ áp dụng cho phiếu quyết toán bảo hiểm."`.

Scope discipline: KHÔNG tự ẩn tab khỏi `tabItems` (architectural change ngoài scope P3 bug; nếu PO muốn ẩn tab → CR riêng).

## 4. Regression test

`insurance-dossier-tab.bug-w02-009-018.test.tsx`:

- payerType="CUSTOMER" → render `dossier-tab-non-insurance` testid + info copy chứa "Hồ sơ bảo hiểm".
- payerType="INSURANCE" → render dossier list (no info copy).
- payerType="INSURANCE" + versions=[] → render empty state (unchanged behavior).

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.tsx`
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.bug-w02-009-018.test.tsx` (NEW — shared cho 09/14/18)

## 6. Status update

BUG-W02-018: OPEN → RESOLVED.
