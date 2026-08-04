# BUGFIX BUG-W02-063 — Dossier FORM_FILL prefill fields must be editable (BBNT + GUQ)

> Wave: W02 · Severity: P2 · Status: OPEN → FIX_DONE
> Boundary: garage-web
> Source TC: Manual QC 2026-06-24 (BA anhluong screenshot SET-20260623-00002)
> Reporter: BA/PO → agent-test-orchestrator
> Fixer: agent-fix-garage-web (2026-06-24)

## 1. Failure mode

Modal "Hồ sơ bảo hiểm" → form FORM_FILL `Biên bản nghiệm thu` và `Giấy ủy quyền`: các trường prefill (BKS xe, Bên A, Bên B, MST/STK/NH, Căn cứ phiếu báo giá, garage info Mục II, vehicle info Mục III...) render `readonly` → user không sửa được. Trái với hint box trên cùng màn ("Các trường thông tin có thể chỉnh sửa trực tiếp") + FEAT-INS-DOSSIER-CREATE AC-6/AC-7 + BA chốt (anhluong 2026-06-24): prefill là giá trị mặc định, user phải sửa được.

## 2. Root cause

`src/features/insurance-dossier/constants/index.ts` — `DOSSIER_ACCEPTANCE_GROUPS` và `DOSSIER_AUTHORIZATION_GROUPS` khai báo `readOnly: true` cho field có prefill (15 fields total). `dossier-template-form.tsx:249` render `<Input readOnly>` khi `field.readOnly === true`. Decision set trong cycle W02-049/051 (prior fixes mapping prefill → readOnly).

## 3. Fix

Remove tất cả `readOnly: true` flags khỏi 2 group arrays. Chỉ giữ `prefillKey` (default value). Khối ký vẫn display-only vì rendered qua component riêng `SignatureBlock`, không qua group fields.

Files changed:
- `src/features/insurance-dossier/constants/index.ts` — remove 15 `readOnly: true` flags (acceptance: 6 fields, authorization Section I: 1, Section II: 8, Section III: vehicle.type + compensation.amountNumeric + vehicle.licensePlate + compensation.amountInWords).
- `src/features/insurance-dossier/components/dossier-template-form.test.tsx` — adjust 4 assertions `.toHaveAttribute("readonly")` → `.not.toHaveAttribute("readonly")` để khớp contract mới.

## 4. Regression test

`dossier-template-form.bug-w02-063.test.tsx`:
- Constants invariant: không field nào trong 2 group arrays có `readOnly: true`.
- Render acceptanceRecord variant: 6 prefill input không có `readonly`/`disabled` attribute.
- Render paymentAuthorization variant: 13 prefill input không có `readonly`/`disabled` attribute.

## 5. Out-of-scope / needs review

- Spec patch `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-CREATE.md` line 201 (Căn cứ phiếu báo giá ghi read-only) và line 232 (editable-list không liệt kê prefill fields) cần BA reconcile sang "prefill editable, chỉ Khối ký display-only". Flag trong `needs_review` — fix code chạy theo BA intent + FEAT AC-6/AC-7 + hint box.

## 6. Status update

BUG-W02-063: OPEN → FIX_DONE (verify pending L2).
