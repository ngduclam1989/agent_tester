# BUGFIX BUG-W02-010 — Wire BFF `getInsuranceDossierVersions` vào InsuranceDossierTab

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding)
> Reporter: agent-review-garage-web

## 1. Failure mode

`<InsuranceDossierTab versions={[]} payerType={detail.payerType} />` hardcode empty array → tab "Hồ sơ BH" luôn render `empty-state-dossier-history` ngay cả khi BFF đã có data. T14 deferred (`DEBT-W02-BFF-INS-DOSSIER-MUTATIONS`) nhưng BFF (agg-garage-graph) `getInsuranceDossierVersions` query đã SHIPPED (cycle 1) — defer wrong.

## 2. Root cause

`insurance-settlement-detail-page.tsx:243` — không gọi BFF query, không có hook wire.

## 3. Fix

Tạo `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-insurance-dossier-versions.ts`:

- `gql` query `GetInsuranceDossierVersions(settlementCode, page, size)` khớp SDL `bffs/agg-garage-graph/.../insurance-dossiers.schema.ts`.
- Default `page=0, size=10` per SDL default + ADR-016 v11 §List pagination.
- Map BFF response `{versionNo, dossierStatus, exportedAt, exportedBy, documents[]}` → `DossierVersion` (FE interface):
  - `id = "{settlementCode}-v{versionNo}"`
  - `files` map `pdfFileName → fileName`, `pdfUrl → pdfUrl`, `documentType → type`.
- Skip query khi `!settlementCode || enabled=false`.

Export hook qua `features/insurance-dossier/index.ts`.

`insurance-settlement-detail-page.tsx`:

- Compute `isInsuranceSettlement = detail?.payerType === "INSURANCE"`.
- Call hook `useInsuranceDossierVersions(code, { enabled: Boolean(code) && isInsuranceSettlement })`.
- Pass `versions={dossierVersions}` + `isLoading={dossierVersionsLoading}` xuống `<InsuranceDossierTab>`.
- Expose `refetchDossierVersions` cho mutation onSuccess (BUG-W02-011).

## 4. Regression test

`use-insurance-dossier-versions.bug-w02-010.test.tsx`:

- `MockedProvider` mock query + response.
- Assert query variables `{settlementCode, page=0, size=10}`.
- Assert response mapping `versionNo→id`, `pdfFileName→fileName`, `pdfUrl→pdfUrl`.
- Assert skip behavior khi settlementCode empty.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-insurance-dossier-versions.ts` (NEW)
- `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-insurance-dossier-versions.bug-w02-010.test.tsx` (NEW)
- `frontend/gf-gms-web/src/features/insurance-dossier/index.ts` (export hook)
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx` (wire hook + thread props)

## 6. Status update

BUG-W02-010: OPEN → RESOLVED (verify pending L2).
DEBT-W02-BFF-INS-DOSSIER-MUTATIONS (query side): can close.
