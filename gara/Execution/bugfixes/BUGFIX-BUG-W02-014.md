# BUGFIX BUG-W02-014 — Replace hardcoded hex `#e4e4e7` + `#dc2626` với design tokens

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding)
> Reporter: agent-review-garage-web

## 1. Failure mode

5 occurrence hex hardcode:
- `document-row.tsx:39` `border-[#e4e4e7]`
- `insurance-dossier-modal.tsx:89` `divide-[#e4e4e7] border-y border-[#e4e4e7]`
- `insurance-dossier-tab.tsx:143` `border-[#e4e4e7]`
- `insurance-dossier-tab.tsx:167,171` `stroke="#dc2626"` (PdfIcon SVG)

`.claude/rules/repo-rules.md §General` cấm magic value. `figma-workflow-rules.md §Visual Fidelity Checklist`: hex → map về design token. `index.css` đã có `--border: oklch(0.929 0.013 255.508)` (≈ #e4e4e7) wired thành `border-border`; `--destructive` wired thành `text-destructive`. Hex hardcode → drift dark-mode + theme.

## 2. Root cause

DEV gen từ Figma export raw hex chứ không lookup token tương ứng (skill `figma-workflow-rules.md §Body Interpretation`: "Hex trong `BG:`/`Text: color=` → map qua production theme tokens (KHÔNG hardcode hex)").

## 3. Fix

- `document-row.tsx`: `border-[#e4e4e7]` → `border-border`.
- `insurance-dossier-modal.tsx`: `divide-[#e4e4e7] border-y border-[#e4e4e7]` → `divide-border border-y border-border`.
- `insurance-dossier-tab.tsx` FileCard: `border-[#e4e4e7]` → `border-border`.
- `insurance-dossier-tab.tsx` PdfIcon SVG: stroke `#dc2626` → `currentColor`; `<svg>` carries `className="text-destructive"` → SVG inherits red từ theme token.

## 4. Regression test

`insurance-dossier-tab.bug-w02-009-018.test.tsx` (combined với BUG-W02-009/018):

- Assert FileCard className contains `border-border`.
- Assert className NOT contains `#e4e4e7` hoặc `[#` arbitrary-value pattern.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/components/document-row.tsx`
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.tsx`
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.tsx`
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.bug-w02-009-018.test.tsx` (NEW — shared cho 09/14/18)

## 6. Status update

BUG-W02-014: OPEN → RESOLVED.
