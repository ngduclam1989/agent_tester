# BUGFIX BUG-W02-009 — FE compose pdfUrl với env CT_FILE_STORAGE_DOMAIN (ADR-016 v11)

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding)
> Reporter: agent-review-garage-web

## 1. Failure mode

`InsuranceDossierTab` (FileCard) gọi `window.open(file.pdfUrl, ...)` với `pdfUrl` là relative path / object key của ct-file-storage. URL không có scheme/domain → browser resolve về app domain (`https://gms.cardoctor.vn/...pdf`) → 404. ADR-016 v11 §Access yêu cầu FE compose `domain (env-driven) + pdfUrl`.

## 2. Root cause

`frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.tsx:133-136`:

```ts
const handleOpen = () => {
  if (!file.pdfUrl) return;
  window.open(file.pdfUrl, "_blank", "noopener,noreferrer");
};
```

DEV T12 đánh [x] nhưng env composition step bị skip. Existing repo pattern cho ct-file-storage download: `src/utils/func.ts getPreviewUrl()` dùng `ENV.PUBLIC_IMAGE_URL` (env var đã set sẵn cho tất cả env: dev/local/prod trỏ về public ct-file-storage public domain) — tái sử dụng pattern này thay vì introduce `CT_FILE_STORAGE_DOMAIN` mới.

## 3. Fix

`insurance-dossier-tab.tsx`:

- Import `ENV` từ `@/config/env.config`.
- Add helper `composeFileStorageUrl(pdfUrl)`:
  - Empty → return empty (caller no-op).
  - Absolute URL (matches `/^https?:\/\//i`) → pass through (resilient cho legacy data đã absolute).
  - Otherwise: prepend `ENV.PUBLIC_IMAGE_URL` + ensure single slash separator.
- `FileCard.handleOpen` gọi `composeFileStorageUrl(file.pdfUrl)` trước khi `window.open`.

KHÔNG add env mới: `VITE_PUBLIC_IMAGE_URL` đã trỏ về ct-file-storage public domain trong 3 env (dev/local/prod). Adding `VITE_CT_FILE_STORAGE_DOMAIN` duplicate nhau → drift risk.

## 4. Regression test

`insurance-dossier-tab.bug-w02-009-018.test.tsx`:

- Click card → `window.open` called với full URL `{ENV.PUBLIC_IMAGE_URL}/{pdfUrl}` (NOT raw pdfUrl).
- Absolute pdfUrl passes through unchanged (resilient).
- Empty pdfUrl → no `window.open` call.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.tsx` (FileCard.handleOpen + helper)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-tab.bug-w02-009-018.test.tsx` (NEW)

## 6. Status update

BUG-W02-009: OPEN → RESOLVED (verify pending L2).
