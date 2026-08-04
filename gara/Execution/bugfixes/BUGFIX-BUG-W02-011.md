# BUGFIX BUG-W02-011 — Wire BFF `exportInsuranceDossier` vào InsuranceDossierModal

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding)
> Reporter: agent-review-garage-web

## 1. Failure mode

`InsuranceDossierModal onSubmit={() => setIsDossierModalOpen(false)}` — bấm "Xuất hồ sơ bảo hiểm" chỉ đóng modal, KHÔNG call mutation. User không có hồ sơ; không error feedback.

## 2. Root cause

`insurance-settlement-detail-page.tsx:326` — onSubmit handler no-op. T14 deferred (`DEBT-W02-BFF-INS-DOSSIER-MUTATIONS`) wrong vì BFF mutation `exportInsuranceDossier` đã SHIPPED ở agg-garage-graph (cycle 1, SDL `insurance-dossiers.schema.ts` lines 168-183).

## 3. Fix

Tạo `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-export-insurance-dossier.ts`:

- `gql` mutation `ExportInsuranceDossier($settlementCode, $documentTypes, $acceptanceFormData, $authorizationFormData)` khớp SDL.
- Hook wrap `useMutation` (custom wrapper từ `@/hooks`):
  - onSuccess: `toastCustom` "Xuất hồ sơ bảo hiểm thành công"; propagate batch tới caller.
  - return `{mutation, loading, error, data}`.
- Phase A scope: `acceptanceFormData` + `authorizationFormData` truyền `null` (form ④③ chưa wire UI input layer — đó là OUT-OF-SCOPE-FEAT-INS-DOSSIER-CREATE-v17 — wire khi form 4 thẻ implement).

Export qua `features/insurance-dossier/index.ts`.

`insurance-settlement-detail-page.tsx`:

- Hook `useExportInsuranceDossier({ onSuccess: () => { setIsDossierModalOpen(false); refetchDossierVersions(); } })`.
- Callback `handleSubmitDossier(selected)` → call mutation với `settlementCode=detail.code`, `documentTypes=selected`, form data null.
- Pass `onSubmit={handleSubmitDossier}` + `isSubmitting={isExportingDossier}` xuống `<InsuranceDossierModal>`.

`insurance-dossier-modal.tsx`:

- Update `onSubmit` type → `(selected: DossierDocumentType[]) => void | Promise<void>` (caller có thể async).

## 4. Regression test

`use-export-insurance-dossier.bug-w02-011.test.tsx`:

- `MockedProvider` mock mutation.
- Call `result.current.mutation({settlementCode, documentTypes: [...], acceptanceFormData: null, authorizationFormData: null})`.
- Assert mutation called với expected variables.
- Assert onSuccess callback fired với batch response shape.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-export-insurance-dossier.ts` (NEW)
- `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-export-insurance-dossier.bug-w02-011.test.tsx` (NEW)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.tsx` (onSubmit type)
- `frontend/gf-gms-web/src/features/insurance-dossier/index.ts` (export hook)
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx` (wire mutation)

## 6. Status update

BUG-W02-011: OPEN → RESOLVED (verify pending L2).
DEBT-W02-BFF-INS-DOSSIER-MUTATIONS (mutation side): can close. Form ③④ wiring vẫn defer dưới `OUT-OF-SCOPE-FEAT-INS-DOSSIER-CREATE-v17`.
