# BUGFIX BUG-W02-102 — BBNT 4 điều khoản "Nội dung nghiệm thu" SAI vai Bên A/Bên B + paraphrase

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual BA test (2026-06-25, web SET-20260625-00002 garage Mai Lệ MN1)
> Reporter: BA (anh Lương) via agent-test-orchestrator

## 1. Failure mode

Form Biên bản nghiệm thu (Tạo hồ sơ bảo hiểm) prefill 4 điều khoản "Nội dung nghiệm thu" SAI vs template oracle `Product/ux/assets/bien-ban-nghiem-thu.html` dòng 198-201:

| # | FE legacy (SAI) | Template oracle (ĐÚNG) |
|---|---|---|
| 1 | "Bên A đã hoàn thành sửa chữa xe theo phiếu báo giá đã duyệt." | "Bên B hoàn thành việc sửa chữa xe ô tô biển kiểm soát {BKS} theo đúng báo giá và quyết toán sửa chữa đã thống nhất." |
| 2 | "Bên B (khách hàng) đã nhận bàn giao xe trong tình trạng kỹ thuật đảm bảo." | "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng." |
| 3 | "Bảo hành theo quy định của garage." | "Bên B chịu trách nhiệm bảo hành theo nội dung báo giá đã ký kết từ ngày bàn giao; Bên A có trách nhiệm bảo dưỡng, kiểm tra định kỳ và phối hợp xác định nguyên nhân khi có phát sinh." |
| 4 | "Biên bản này được lập thành 02 bản — mỗi bên giữ 01 bản, có giá trị pháp lý như nhau." | "Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản." |

Vai trò pháp lý: Bên A = chủ xe (khách); Bên B = garage. FE clause 1 gán "Bên A hoàn thành sửa chữa" (sai vai); clause 2 gọi "Bên B (khách hàng)" (sai chủ thể).

## 2. Root cause

4 điều khoản default được **FE seed** trong `src/features/insurance-dossier/constants/index.ts:51-56` (`DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES`). Hardcode legacy text + sai vai Bên A/Bên B. Khi xuất hồ sơ, FE gửi nguyên `acceptanceFormData.clauses` cho BFF → PDF render đúng cái FE seed (sai).

Theo `figma-workflow-rules.md §Verbatim Copy Rule (v7.4)`: default clauses arrays PHẢI copy verbatim spec text — KHÔNG paraphrase, KHÔNG synonym, KHÔNG abbreviation.

## 3. Fix

### `src/features/insurance-dossier/constants/index.ts`

- Đổi `DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES` thành 4 clause verbatim theo template oracle.
- Clause 1 chứa placeholder `{vehiclePlate}` (qua `DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN` exported constant) — substitute tại build-time với BKS thực.
- Clause 4 thứ tự vế đảo lại theo template ("có giá trị pháp lý như nhau" trước "mỗi bên giữ 01 bản").

### `src/features/insurance-dossier/components/dossier-template-form.tsx`

- Thêm helper `substituteAcceptanceClausePlaceholders` (top-level) — `clause.split(TOKEN).join(prefill.vehiclePlate ?? "")`.
- `buildAcceptanceDefaults` map clauses qua substitute trước khi seed `clauses` field array.
- Import `DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN` từ `../constants`.

### Test updates (existing tests locked OLD legacy text):

- `dossier-template-form.bug-w02-049.test.tsx` sub-(f) — update expected default clauses array + replace `getByDisplayValue` assertion về clause 2 (Bên A đồng ý...) vì clause 1 giờ có placeholder substituted theo prefill vehiclePlate.
- `dossier-template-form.test.tsx` "renders acceptanceRecord with prefilled customer + garage fields" — update `getByDisplayValue` về clause 2 verbatim.

Lý do update existing tests: tests cũ assert OLD wrong text — chính là regression mà BUG-W02-102 phát hiện. Bản fix yêu cầu update test expectation theo new spec.

## 4. Regression test

### `src/features/insurance-dossier/components/dossier-template-form.bug-w02-102.test.tsx` (NEW)

10 assertions:

1. `DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES.length === 4`.
2-5. Clause 1-4 string equality verbatim template oracle.
6. Không còn legacy text ("Bên A đã hoàn thành sửa chữa", "Bên B (khách hàng)", "Bảo hành theo quy định của garage").
7. Render: clause 1 đã substitute `{vehiclePlate}` = "15A-456.78".
8. Render: clause 2/3/4 verbatim trong form.
9. `getAcceptanceValues().clauses` array dài 4, clause 1 chứa BKS đã substitute, không leak token.
10. Edge case: `vehiclePlate=""` → substitute empty string, không leak `{vehiclePlate}` token.

## 5. Verify

```bash
cd frontend/gf-gms-web
npx vitest run src/features/insurance-dossier/components/dossier-template-form
# ✓ 49 tests pass (8 files: 049/051/063/077/101/102/test/fidelity)
npx eslint src/features/insurance-dossier/constants/index.ts src/features/insurance-dossier/components/dossier-template-form.tsx
# clean
npx tsc --noEmit
# clean
```

## 6. Related

- BUG-W02-095 (cùng flow Xuất BBNT — FE acceptanceFormData null trong lazy-mount; khác defect; in-flight by another subagent).
- BUG-W02-100 (cùng BBNT bản in — BE template bỏ nhãn trường rỗng; khác layer).
- BUG-W02-063 (cùng form BBNT web — prefill read-only; khác defect).
- BUG-W02-049 omnibus BBNT modal cũ (sub-symptom f paraphrase→verbatim — mất số do renumber, BUG-W02-102 là re-log standalone).
- ⚠️ Follow-up gợi ý: Giấy ủy quyền 3 điều khoản default (AC-7) + mobile BBNT default clauses (BUG-061) cùng tài liệu — verify riêng.
