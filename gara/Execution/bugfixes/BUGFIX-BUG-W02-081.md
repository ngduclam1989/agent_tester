# BUGFIX BUG-W02-081 — Preview Phiếu QT BH "Giảm trừ bồi thường" dấu + thay vì −

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-24, SET-20260624-00003)
> Reporter: BA via agent-test-orchestrator

## 1. Failure mode

Trong modal "Tạo hồ sơ bảo hiểm" → preview "Phiếu quyết toán sửa chữa" (phiếu BH) → khối "Phân bổ bảo hiểm": 4/5 khoản đã đúng dấu − (CK liên kết BH Vật tư/CDV, Khấu hao, Khấu trừ BH), CHỈ "Giảm trừ bồi thường" hiển thị **+3.508.090** thay vì **−3.508.090**.

Math nội bộ confirm: Tổng thanh toán 28.471.590 = Cộng sau VAT 35.080.900 − Σ5 khoản 6.609.310 → preview đang TRỪ "Giảm trừ bồi thường" nhưng hiển thị + → mâu thuẫn nội bộ. Theo PRINT-INS-001 bản in/preview phiếu BH all 5 khoản dấu −.

## 2. Root cause

`DOSSIER_ALLOCATION_SIGNS` map (`src/features/insurance-dossier/constants/index.ts`):

```ts
{
  discountMaterial: "-",
  discountLabor: "-",
  claimReduction: "+",  // ← SAI: claimReduction trên preview BH phải −
  depreciation: "-",
  insuranceDeductible: "-",
}
```

Map này được consume ở `QuotationDocumentPreview` (`quotation-document-preview.tsx:205` `formatVndWithSign(row.amount, DOSSIER_ALLOCATION_SIGNS[row.key])`) — render preview phiếu QT BH. `claimReduction: "+"` có lẽ legacy carry-over từ panel màn KH convention (transfer-to-customer), nhưng preview là PRINT-INS-001 context (phiếu BH all −).

## 3. Fix

### `src/features/insurance-dossier/constants/index.ts`

Đổi `DOSSIER_ALLOCATION_SIGNS.claimReduction: "+" → "-"`. Cả 5 khoản nay đều `-`, khớp PRINT-INS-001 + Figma node 13255-162759.

## 4. Regression test

### `src/features/insurance-dossier/components/quotation-document-preview.allocation-sign.test.tsx` (UPDATE)

Đổi 1 test case từ assert `+50.000đ` → `-50.000đ` (cùng tên test renamed để ghi nhận BR-EP PRINT-INS-001 phiếu BH all '-'). 4 case còn lại (discountMaterial, discountLabor, depreciation, insuranceDeductible) đều assert `-` — pass nguyên.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/constants/index.ts` (`claimReduction: "+" → "-"`)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/quotation-document-preview.allocation-sign.test.tsx` (case `claimReduction` flip + rename to reflect BUG-W02-081 fix)

## 6. Status update

BUG-W02-081: OPEN → RESOLVED (verify pending L2 — Playwright UI preview phiếu QT BH, assert all 5 khoản dấu `-`).

## 7. Follow-ups

- **Triage parity**: bản in PDF thật của gf-accounting (Thymeleaf template) — cần verify "Giảm trừ bồi thường" có cùng sai dấu không. Nếu có → đó là **BUG-W02-053** (gf-accounting), không phải FE. Preview FE đã đúng sau fix này.
- Verify preview các tài liệu khác trong hồ sơ (Báo giá, Phiếu DV, Lệnh thanh toán) — confirm không có cùng sign mismatch.
- Recurrence_of `BUG-W02-053-B`: bug này là biểu hiện CÒN SÓT — 053-B mô tả cả 3 transfer (Giảm trừ/Khấu hao/Khấu trừ) đều dấu +; nay chỉ còn `claimReduction` + → fix 053 chưa trọn ở FE side. Đã đóng nốt residual ở FE; bản in PDF cần verify ở gf-accounting.
