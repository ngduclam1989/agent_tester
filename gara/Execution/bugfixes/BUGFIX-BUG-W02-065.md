# BUGFIX BUG-W02-065 — InsuranceDossierModal phải reset state checkbox + form khi reopen

> Wave: W02 · Severity: P2 · Status: OPEN → FIX_DONE
> Boundary: garage-web
> Source TC: Manual QC 2026-06-24 (BA anhluong screenshot SET-20260623-00002)
> Reporter: BA/PO → agent-test-orchestrator
> Fixer: agent-fix-garage-web (2026-06-24)

## 1. Failure mode

Modal "Tạo hồ sơ bảo hiểm" — sau khi user tích checkbox 1 tài liệu (vd `Biên bản nghiệm thu`), bấm "Xuất hồ sơ bảo hiểm", rồi mở lại modal → checkbox `Biên bản nghiệm thu` vẫn còn tích. Vi phạm AC-11 + BR-INS-DOSSIER-007 + AC-3 (checkbox default unchecked + mount fresh state). Hệ quả: kế toán không để ý → xuất nhầm tài liệu (tạo version thừa).

## 2. Root cause

`src/features/insurance-dossier/components/insurance-dossier-modal.tsx:105-106` — `useState<...>(defaultSelection)` persist qua các lần `open` toggle vì parent luôn mount modal, chỉ flip `open` prop. RHF form cũng giữ state qua lifecycle vì `<DossierTemplateForm>` không bị unmount khi accordion collapse.

## 3. Fix

`insurance-dossier-modal.tsx`:
- Import `useEffect`.
- Thêm `formInstanceKey` state + `useEffect` trigger khi `open === true`: reset `selection = defaultSelection` + bump `formInstanceKey`.
- Truyền React `key={`acceptance-${formInstanceKey}`}` và `key={`authorization-${formInstanceKey}`}` xuống `<DossierTemplateForm>` → mỗi lần reopen, key bumps → React remount form → `useMemo` defaults re-evaluate → RHF re-init fresh state.

Approach kết hợp 2 cơ chế (state reset + remount via key) đảm bảo cả checkbox và form state đều fresh; bám đúng spec line 344 fix path.

## 4. Regression test

`insurance-dossier-modal.bug-w02-065.test.tsx`:
- Tích `checkbox-doc-acceptance-record` → check state. Đóng (`open=false`) rồi mở lại (`open=true`). Assert checkbox `data-state="unchecked"`.
- "Xuất hồ sơ bảo hiểm" button enabled khi có doc tích; sau reopen → button disabled (selection clear).

## 5. Files changed

- `src/features/insurance-dossier/components/insurance-dossier-modal.tsx` — `useEffect` reset selection + `formInstanceKey` remount key.
- `src/features/insurance-dossier/components/insurance-dossier-modal.bug-w02-065.test.tsx` (NEW).

## 6. Status update

BUG-W02-065: OPEN → FIX_DONE (verify pending L2).
