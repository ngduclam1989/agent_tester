# BUGFIX BUG-W02-064 — dossier-document-card display-name mapping (icon + filename); fileSize escalated to BFF/BE

> Wave: W02 · Severity: P2 · Status: OPEN → FIX_DONE (sub-a + sub-c); sub-b escalated
> Boundary: garage-web (primary) + agg-garage-graph / gf-accounting (sub-b verify)
> Source TC: Manual QC 2026-06-24 (BA anhluong 3 screenshot tab "Hồ sơ bảo hiểm đã xuất")
> Reporter: BA/PO → agent-test-orchestrator
> Fixer: agent-fix-garage-web (2026-06-24)

## 1. Failure mode

Tab "Hồ sơ bảo hiểm đã xuất" — file card (`FileCard` trong `insurance-dossier-tab.tsx`) 3 sub-symptom vs AC-3:
- (a) icon xám thay vì PDF đỏ (#dc2626 / text-destructive)
- (b) size luôn hiển thị "0kb"
- (c) filename hiển thị BE slug `phieu-quyet-toan.pdf` thay vì display name `Phiếu quyết toán.pdf`

## 2. Root cause

- (a) **NO BUG ở FE** — `PdfIcon` component (line 167-190) đã render `className="text-destructive"`. Render xám có thể do CSS theme drift hoặc Figma ground-truth khác. Code đã đúng spec.
- (c) `FileCard.displayName` (line 141) khai báo `file.fileName OR DOSSIER_DOCUMENT_FILE_NAMES[file.type]` → khi BFF trả `fileName = "phieu-quyet-toan.pdf"` (truthy slug), FE dùng slug raw thay vì mapping display name.
- (b) FE `formatFileSize` đã handle `fileSizeBytes <= 0` → "0kb". Symptom "tất cả file 0kb" nghĩa là **BFF/BE trả 0**. Có thể: (i) BFF `getInsuranceDossierVersions` không select fileSize, (ii) gf-accounting không persist fileSize, (iii) file thực sự rỗng. Sub-b cần verify out-of-boundary.

## 3. Fix

- (c) `src/features/insurance-dossier/components/insurance-dossier-tab.tsx:141` — flip ưu tiên: `DOSSIER_DOCUMENT_FILE_NAMES[file.type] ?? file.fileName`. Display name mapping luôn thắng; slug chỉ fallback khi type không có trong map (edge case).
- (a) **NO CODE CHANGE** — icon `text-destructive` token đã render đúng. Add regression test assert icon class hiện diện để fence visual regression nếu PdfIcon được refactor.
- (b) **ESCALATE** — log `bugs_escalated[]` cho agent-fix-agg-garage-graph / agent-fix-gf-accounting verify ownership fileSize.

## 4. Regression test

`insurance-dossier-tab.bug-w02-064.test.tsx`:
- (c) `card-file-settlement_sheet` chứa "Phiếu quyết toán.pdf", KHÔNG chứa "phieu-quyet-toan.pdf"; tương tự với PAYMENT_AUTHORIZATION.
- (a) Icon SVG có className chứa `text-destructive`.
- (b) `fileSizeBytes=102400` render "100kb"; `fileSizeBytes=0` render "0kb" (FE-side format đúng).

## 5. Out-of-scope / escalation

Sub-b (size 0kb) — escalated cross-boundary. Cần verify chain:
1. `bffs/agg-garage-graph` query `getInsuranceDossierVersions` — fileSize field có select không?
2. `gf-accounting` API trả fileSize không?
3. Nếu cả 2 OK → mở 1 PDF SIT để check file thực sự rỗng (sub-b sẽ thành P1 cho gf-accounting/ct-file-storage upload).

## 6. Status update

BUG-W02-064: OPEN → FIX_DONE (sub-a + sub-c). Sub-b → escalate riêng (bugs_escalated[]).
