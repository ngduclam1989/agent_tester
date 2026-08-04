# BUGFIX BUG-W02-080 — Panel "Phân bổ BH" phiếu BH dấu hỗn hợp → all −

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-24, SET-20260624-00003)
> Reporter: BA via agent-test-orchestrator

## 1. Failure mode

Panel "Phân bổ Bảo hiểm" trên phiếu QT **BH** hiển thị dấu **hỗn hợp** (CK liên kết BH × 2 dấu −, Giảm trừ bồi thường / Khấu hao / Khấu trừ BH dấu +). Math xác nhận cả 5 đều TRỪ tiền BH (BH thanh toán = Cộng sau VAT − Σ5 khoản) → BA yêu cầu cả 5 dấu −, khớp Figma node `13255-162759` (BH all − / KH transfer +) + PRINT-INS-001.

## 2. Root cause

`TotalServicePricePanel.allocationSignOverride` (`src/features/insurance-allocation/components/total-service-price-panel.tsx`) chỉ override `+` cho `KH-1col-with-alloc` mode; mọi mode khác (BH-1col, 2-col) fallback `ALLOCATION_SIGNS[key]` — bảng có `claimReduction/depreciation/insuranceDeductible: "+"` (semantic transfer-to-customer mặc định cho KH context). Cho phiếu BH dùng convention chung này → 3 khoản transfer hiển thị `+` thay vì `−`.

Spec authoritative oracle = **Figma node 13255-162759** (BA cung cấp 2026-06-24): BH column all `−` / KH column 3 transfer `+`. BR-EP §7.1 text "panel = − − + + +" là **doc DRIFT vs Figma** — reconcile = doc-fix song song (Business Authority), KHÔNG block FE fix.

## 3. Fix

### `src/features/insurance-allocation/components/total-service-price-panel.tsx`

Mở rộng `allocationSignOverride(key)`:

- `isKhWithAlloc` → `+` (giữ behavior cũ, KH transfer dương).
- `isBhOnly` → `−` (new, BH all âm).
- Else (2-col, KH-1col-no-alloc khi nào mode đó render alloc) → `ALLOCATION_SIGNS[key]` (giữ default).

KHÔNG đụng `ALLOCATION_SIGNS` const (giữ semantic transfer-to-customer cho 2-col fallback default).

## 4. Regression test

### `src/features/insurance-allocation/components/total-service-price-panel.bug-w02-080.test.tsx` (NEW)

3 assertions:

- Mode `BH-1col` → cả 5 sign testid (`phan-bo-{ck-vt,ck-cdv,giam-tru,khau-hao,khau-tru}-sign`) match `/^-/`.
- Mode `KH-1col-with-alloc` → 3 transfer (`giam-tru, khau-hao, khau-tru`) match `/^\+/` (regression guard, không bị over-correct).
- Mode `2-col` → CK `−`, 3 transfer `+` (default ALLOCATION_SIGNS — fallback giữ nguyên).

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.tsx` (extend allocationSignOverride với BH branch)
- `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.bug-w02-080.test.tsx` (NEW, 3 assertions)

## 6. Status update

BUG-W02-080: OPEN → RESOLVED (verify pending L2 — Playwright UI re-run TC-CR3-02 + TC-R06 + new TC-PANEL-SIGN-BY-TYPE).

## 7. Follow-ups (Business Authority)

- **Doc reconcile**: BR-EP-INSURANCE-SETTLEMENT §7.1 + BR-INS-STL-DET-009(a) + audit matrix `Execution/test-reports/W02/AUDIT-W02-insurance-allocation-surfaces.md:28` cần update khớp Figma node 13255-162759 (BH all − / KH transfer +). Bug `recurrence_of: null` nhưng SPEC CONFLICT (BR §7.1 text drift) cần update song song để không re-flag regression (per BUG-058/073 landmine pattern).
- Verify cross-surface: SO edit panel (PDV) dùng chung `TotalServicePricePanel` — confirm mode khi `<InsuranceAllocationSection>` render trên SO edit là `2-col` hay `BH-1col`; nếu render BH-only thì fix này tự cascade, nếu 2-col thì giữ default mixed (BA chỉ nêu phiếu QT BH).
- Mobile parity (BUG-W02-054): mobile sign field cũng phải align convention BH all −.
