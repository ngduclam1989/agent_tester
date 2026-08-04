# BUGFIX BUG-W02-013 — Testid prefix `button-` thay vì `btn-` (PKG-W02 §3.C.1)

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding)
> Reporter: agent-review-garage-web

## 1. Failure mode

`create-dossier-button.tsx:30` `data-testid="btn-tao-ho-so-bh"`. PKG-W02 §3.C.1 matrix yêu cầu `button-{slug}` — `button-tao-ho-so-bh`. TC artifact (test-cases ep-insurance-settlement-w02-ui.md) grep theo `button-` → miss → orphan testid ↔ implementation cross-ref fail (PKG-W02 §3.C.3 exit gate).

## 2. Root cause

Pre-existing legacy `btn-{slug}` convention (W01 dùng `btn-chinh-sua`, `btn-in-ho-so`, `btn-them-thanh-toan`) drift sang DEV W02. PKG-W02 §3.C.1 canonical là `button-{slug}`.

## 3. Fix

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/create-dossier-button.tsx`:

- `data-testid="btn-tao-ho-so-bh"` → `data-testid="button-tao-ho-so-bh"`.

Scope hẹp đúng matrix W02 cluster: chỉ rename testid của dossier button. W01 button testids (`btn-chinh-sua`, `btn-in-ho-so`, `btn-them-thanh-toan`) KHÔNG đổi → preserve W01 TC; W02 matrix chỉ yêu cầu prefix `button-` cho component **new/modified W02**.

## 4. Regression test

`create-dossier-button.bug-w02-013.test.tsx`:

- Assert `button-tao-ho-so-bh` rendered.
- Assert `btn-tao-ho-so-bh` NOT rendered (legacy guard).

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/create-dossier-button.tsx`
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/create-dossier-button.bug-w02-013.test.tsx` (NEW)

## 6. Status update

BUG-W02-013: OPEN → RESOLVED.
