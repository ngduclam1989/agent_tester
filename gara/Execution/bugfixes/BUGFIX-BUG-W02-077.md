# BUGFIX BUG-W02-077 — BBNT "Đại diện"/"Chức vụ" garage không prefill (mapping thiếu)

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-24, SET-20260624-00003)
> Reporter: BA via agent-test-orchestrator

## 1. Failure mode

Trong modal "Tạo hồ sơ bảo hiểm" → tài liệu "Biên bản nghiệm thu" (BBNT) → mục "Thông tin các bên":

- Bên A, Bên B "Công ty Mai Lệ", Địa chỉ, MST — prefill đúng.
- Ô **"Đại diện"** (đại diện garage — Bên B) — **trống** (placeholder "Nhập"), dù API trả `representativeName: "Mai Ngọc Lệ 1"`.
- Ô **"Chức vụ"** cùng nhóm cũng trống (cùng cause — DEV không gán prefillKey).

Theo `FEAT-INS-DOSSIER-CREATE` AC-6 + `BR-INS-DOSSIER-003`: các trường garage (Bên B / Đại diện / Chức vụ / Địa chỉ / MST) đều prefill từ hồ sơ garage.

## 2. Root cause

`DOSSIER_ACCEPTANCE_GROUPS` table (`src/features/insurance-dossier/constants/index.ts`) cho group `parties` có entry `garage.delegate` + `garage.delegateTitle` nhưng **thiếu `prefillKey`** → `buildAcceptanceDefaults` gọi `resolvePrefillValue(undefined, context)` returns empty string → input render empty placeholder.

Đối chiếu prefill `garage.name`, `garage.address`, `garage.taxId` đều có `prefillKey` → đúng. Hai field `delegate` + `delegateTitle` bị bỏ sót trong mapping table.

## 3. Fix

### `src/features/insurance-dossier/constants/index.ts`

Trong `DOSSIER_ACCEPTANCE_GROUPS[id=parties].fields`:

- `garage.delegate` → thêm `prefillKey: "garage.delegate"`.
- `garage.delegateTitle` → thêm `prefillKey: "garage.delegateTitle"`.

`buildPrefillContext` đã expose `garage.delegate` + `garage.delegateTitle` từ `DossierTemplatePrefill.garage.{delegate,delegateTitle}` → mapping table không cần đụng helper.

## 4. Regression test

### `src/features/insurance-dossier/components/dossier-template-form.bug-w02-077.test.tsx` (NEW)

4 assertions:

- Constants table assert `garage.delegate.prefillKey == "garage.delegate"`.
- Constants table assert `garage.delegateTitle.prefillKey == "garage.delegateTitle"`.
- Render BBNT với prefill → input `#garage\.delegate` value = "Mai Ngọc Lệ 1".
- Render BBNT với prefill → input `#garage\.delegateTitle` value = "Giám đốc".

(Test query qua `id` vì `share/inputs/input` chỉ truyền `name` xuống FormField, HTML input có `id={name}` chứ không có `name` attribute.)

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/constants/index.ts` (+2 prefillKey)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/dossier-template-form.bug-w02-077.test.tsx` (NEW, 4 assertions)

## 6. Status update

BUG-W02-077: OPEN → RESOLVED (verify pending L2 — Playwright UI mở BBNT, assert ô "Đại diện" + "Chức vụ" prefill).

## 7. Follow-ups

- Verify form "Giấy ủy quyền" (mục II Bên được ủy quyền garage) cùng có ô "Đại diện" prefill từ hồ sơ garage không — BA cảnh báo cùng cause. (Đã reuse component DossierTemplateForm + AUTHORIZATION_GROUPS — nếu mapping table có gap tương tự thì cùng pattern fix.) Out-of-scope cho BUG-077 vì BA chỉ confirm BBNT.
- Pattern lesson: mọi field garage trong `DOSSIER_*_GROUPS` cần `prefillKey` matching `garage.{key}` cùng nhánh `buildPrefillContext` — thêm checklist khi author dossier form mới.
