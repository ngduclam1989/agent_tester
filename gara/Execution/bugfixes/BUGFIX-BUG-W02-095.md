# BUGFIX BUG-W02-095 — Xuất hồ sơ BH: Biên bản nghiệm thu PDF trống do payload `acceptanceFormData = null` (lazy-mount accordion)

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web · Feature: FEAT-INS-DOSSIER-CREATE
> Source TC: Manual QC BA (2026-06-25, web SIT api.sit.saas.cardoctor.com.vn, tenant 467, settlement SET-20260625-00002, SO PDV-20260624-01118)
> Reporter: BA (anh Lương) qua agent-test-orchestrator
> Sibling: BUG-W02-061 / BUG-W02-062 (mobile BBNT/GUQ prefill), BUG-W02-049 (web BBNT modal fidelity)

## 1. Failure mode

Trên web SIT, kế toán mở modal "Tạo hồ sơ bảo hiểm" cho SET-20260625-00002 → tích Biên bản nghiệm thu (KHÔNG sửa, KHÔNG mở accordion) → bấm "Xuất hồ sơ bảo hiểm" → PDF kết quả `SETTLEMENTS-178236230269920299.pdf` **TRỐNG**: chỉ còn 3 dòng header cố định ("CỘNG HÒA…/Độc lập…/-o0o-"); toàn bộ BKS, Bên A, Bên B, Đại diện, Chức vụ, Địa chỉ, MST, Căn cứ phiếu báo giá, và 4 điều khoản nội dung nghiệm thu đều rỗng — dù preview phía trên CÓ prefill đầy đủ (Bên A "Mai Ngọc Minh", Bên B "Công ty Mai Lệ", Đại diện "Mai Ngọc Lệ 1", MST 0011223344, Căn cứ PDV-20260624-01118 ngày 25/06/2026, BKS 88C111111).

Chứng cứ network: mutation `ExportInsuranceDossier` gửi `variables.acceptanceFormData = null`; BE render template rỗng + trả `versionNo 4` + `pdfUrl` (đúng hợp đồng với input null). Query thứ 2 `GetInsuranceDossierVersions` chỉ refresh list version (page 0, size 10) — không mang form data. Tài liệu pháp lý gửi DN bảo hiểm không dùng được nếu kế toán không nhấp từng field; default-path hỏng → P1.

## 2. Root cause

`DossierTemplateForm` (`src/features/insurance-dossier/components/dossier-template-form.tsx:593-660`) là forward-ref component init `useForm` với `defaultValues` build từ `prefill` + expose `getAcceptanceValues()`/`getAuthorizationValues()` qua `useImperativeHandle`. Form chỉ chứa default state SAU KHI mount; trước đó `ref.current === null`.

`InsuranceDossierModal` (`src/features/insurance-dossier/components/insurance-dossier-modal.tsx:147-174`) render mỗi `DossierTemplateForm` bên trong `<DocumentRow>` → `<AccordionContent>` (`src/features/insurance-dossier/components/document-row.tsx:60`). Radix `AccordionContent` mặc định **LAZY-MOUNT** content: chỉ render khi accordion item ở state `open`. Khi user CHỈ tick checkbox mà không expand accordion (luồng default-path của BA), `DossierTemplateForm` chưa mount → `acceptanceFormRef.current = null` → guard `if (selected.includes(ACCEPTANCE_RECORD) && acceptanceFormRef.current)` rơi xuống → `payload.acceptanceFormData` giữ `undefined` → GraphQL biến thành `null` → BE trả PDF rỗng (đúng hợp đồng).

Cùng pattern cho `PAYMENT_AUTHORIZATION` (GUQ) — guard tại `insurance-dossier-modal.tsx:165-172` cùng failure mode.

## 3. Fix

Minimal 3-file fix, không đổi data contract, không sửa BE/BFF/schema.

### `frontend/gf-gms-web/src/features/insurance-dossier/components/document-row.tsx`

Thêm prop optional `forceMountContent?: boolean`. Khi `true`, spread `forceMount` xuống `<AccordionContent>` — Radix native support (`@radix-ui/react-accordion` 1.2.11 extends `CollapsibleContentProps.forceMount?: true`). `ui/accordion.tsx:60-74` đã spread `...props` xuống `AccordionPrimitive.Content`, không cần đụng wrapper layer.

```diff
 interface DocumentRowProps {
   ...
+  forceMountContent?: boolean;
 }

 const DocumentRow = ({
-  type, subtitle, selected, onSelectedChange, children,
+  type, subtitle, selected, onSelectedChange, children, forceMountContent,
 }: DocumentRowProps) => {
   ...
-  <AccordionContent className="pb-0">{children}</AccordionContent>
+  <AccordionContent
+    className="pb-0"
+    {...(forceMountContent ? { forceMount: true } : {})}
+  >
+    {children}
+  </AccordionContent>
 }
```

`forceMount` chỉ mount sub-tree — Radix vẫn set `data-state=closed`, vẫn áp `animate-accordion-up` thu chiều cao về 0 + `overflow-hidden` → visually KHÔNG đổi (vẫn collapse khi tick checkbox không expand).

### `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.tsx`

Khai báo set 2 doc-type có form backed, pass `forceMountContent` khi render row tương ứng. Hai row Phiếu QT / Phiếu báo giá KHÔNG cần force-mount (chỉ chứa preview readonly, không có form ref).

```diff
+const FORM_BACKED_DOC_TYPES: ReadonlySet<InsuranceDossierDocType> = new Set([
+  INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD,
+  INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION,
+]);
 ...
 <DocumentRow
   key={type}
   type={type}
   subtitle={subtitleByType[type]}
   selected={selection[type]}
   onSelectedChange={handleToggle(type)}
+  forceMountContent={FORM_BACKED_DOC_TYPES.has(type)}
 >
```

### `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx` (NEW)

3 vitest cases assert behavior post-fix (mỗi case tick checkbox mà KHÔNG expand accordion):

1. Tick Biên bản nghiệm thu → onSubmit nhận payload với `acceptanceFormData.licensePlate = "88C111111"`, `customer.name = "Mai Ngọc Minh"`, `garage.name = "Công ty Mai Lệ"`, `garage.delegate`, `garage.address`, và `clauses.length === 4`.
2. Tick Giấy ủy quyền → payload với `authorizationFormData.compensation.amountNumeric = 5_000_000` + `garage.name`.
3. Tick cả 2 → cả `acceptanceFormData` lẫn `authorizationFormData` đều defined.

Mocks: `react-i18next`, `@/utils/file`, `use-print-settlement`, `use-print-service-order`, `use-render-acceptance-record-pdf`, `use-render-payment-authorization-pdf` (mirror pattern của `insurance-dossier-modal.bug-w02-065.test.tsx` đã có).

## 4. Verification

Chạy tại `frontend/gf-gms-web/`:

```bash
npx vitest run src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx
# ✓ 3 tests passed (481ms)

npx eslint src/features/insurance-dossier/components/document-row.tsx \
           src/features/insurance-dossier/components/insurance-dossier-modal.tsx \
           src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx
# clean

npx tsc --noEmit
# clean

bash .claude/scripts/check-comment-rules.sh
# PASS — no forbidden patterns in diff additions

npx vitest run src/features/insurance-dossier/
# 20 passed | 1 pre-existing fail (insurance-dossier-tab.bug-w02-064.test.tsx) — UNRELATED (file size display, different component)
```

Pre-existing failure trong `insurance-dossier-tab.bug-w02-064.test.tsx` đã verify reproduce cùng kết quả trước khi áp fix (git stash + vitest re-run) → KHÔNG do fix này gây ra; ghi vào Follow-ups.

## 5. Blast radius

- **Direct surface**: `InsuranceDossierModal` (1 component, 1 use site). Cả 4 row dùng `<DocumentRow>` — chỉ 2 row (ACCEPTANCE_RECORD + PAYMENT_AUTHORIZATION) bật `forceMountContent`. Row Phiếu QT / Phiếu báo giá giữ nguyên lazy-mount (không có form ref → không hồi quy).
- **DocumentRow callers**: chỉ 1 (chính InsuranceDossierModal). Prop `forceMountContent` optional + default false → caller cũ (nếu có) không cần đổi.
- **Animation/UX**: `forceMount` không ảnh hưởng animation. Radix vẫn toggle `data-state=open/closed`, vẫn áp `animate-accordion-up/down` + `overflow-hidden` (xem `ui/accordion.tsx:68`) → user vẫn thấy accordion expand/collapse y như trước. Chỉ khác: DOM tree giữ children luôn (chi phí tăng minimal — 2 form instance ~30 field mỗi cái, đã render OK trong test 481ms).
- **Contract impact**: KHÔNG. Mutation `ExportInsuranceDossier` không đổi shape; chỉ đảm bảo FE LUÔN gửi `acceptanceFormData`/`authorizationFormData` khi user tick checkbox tương ứng (đúng AC-6 + EC-1).
- **Cascade fix**: Giấy ủy quyền (PAYMENT_AUTHORIZATION) cùng pattern → cùng được fix trong cùng patch (theo flag "Kiểm thêm" trong L2). BA check thêm mobile có pattern tương tự không (mobile = BUG-W02-061/062, scope khác — không chạm ở fix này).

## 6. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/components/document-row.tsx` (MOD — add prop `forceMountContent` + spread `forceMount` xuống `AccordionContent`)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.tsx` (MOD — declare `FORM_BACKED_DOC_TYPES` + pass `forceMountContent` vào 2 row form-backed)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx` (NEW — 3 regression cases)

Staged copies giữ trong `Execution/bugfixes/BUG-W02-095-patch/` để audit trail (workaround FM-012 design-repo subagent constraint).

## 7. Status update

- `Tracking/WAVE02/BUGS.md` row BUG-W02-095: OPEN → RESOLVED.
- `Tracking/WAVE02/verify/BUG-W02-095.verify.md`: status → FIX_DONE, retro frontmatter (`agent_origin: agent-fix-garage-web`, `root_cause_category: validation`, `recurrence_of: null`).

## 8. Follow-ups

- **Pre-existing fail (out of scope)**: `insurance-dossier-tab.bug-w02-064.test.tsx` 3/4 fail (`0kb`/`100kb` display). Reproduce trên `git stash` baseline → confirm KHÔNG do fix này. Mở ticket riêng nếu chưa có.
- **Mobile parity check (BUG-W02-061/062)**: mobile Flutter có cùng pattern lazy-mount form không? Mobile dùng widget tree khác (BLoC) — verify riêng (agent-fix-garage-mobile).
- **Default clause text drift**: Hiện `DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES` trong constants có 4 clause; spec FEAT-INS-DOSSIER-CREATE §AC-6:123 quy định verbatim wording. Recommend cross-check với BA: clause hiện FE wording khớp spec không (BUG-W02-049 sub-symptom (f) đã flag paraphrase risk). Nếu drift → fix riêng (không trong scope BUG-W02-095).

## 9. Follow-up — Regression re-fix (2026-06-25 by ninhnguyen)

> Wave: W02 · Status: REOPENED → RESOLVED

### 9.1 Regression symptom

Sau khi áp initial fix (`forceMount` cho 2 row form-backed), BA báo regression: trên modal Tạo hồ sơ BH, 2 accordion "Biên bản nghiệm thu" và "Giấy ủy quyền" tự động mở đồng thời ngay khi mở modal, KHÔNG đóng được — click trigger để đóng xong lại tự mở.

### 9.2 Root cause regression

`AccordionContent` wrapper (`src/components/ui/accordion.tsx:60-74`) áp class `data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden` nhưng KHÔNG có rule kiểu `display: none` cho closed state.

- Lazy-mount row (không `forceMount`): Radix unmount content khi closed → không có vấn đề.
- Force-mount row (BBNT + GUQ): content giữ trong DOM. Animation `animate-accordion-up` animate `from: var(--radix-accordion-content-height) to: 0`. Trên mount đầu với `data-state="closed"`, Radix đặt CSS var qua ResizeObserver async; nếu var chưa ready → animation degenerate thành `0→0` (no-op) → content giữ natural height → visually open.
- Click trigger → Radix toggle `data-state` đúng, nhưng thiếu `display: none` cho closed → visual không đổi → user cảm nhận như "đóng rồi tự mở".

### 9.3 Re-fix — 3 file minimal

#### `src/components/ui/accordion.tsx`

Thêm prop optional `hideWhenClosed?: boolean`. Khi `true`, swap animation class sang `data-[state=closed]:hidden` (Tailwind `display: none`). Default behavior giữ nguyên animation (cho mọi caller cũ).

```diff
 function AccordionContent({
-  className, children, ...props
+  className, children, hideWhenClosed, ...props
 }: React.ComponentProps<typeof AccordionPrimitive.Content>
+  & { hideWhenClosed?: boolean }
 ) {
   return (
     <AccordionPrimitive.Content
       data-slot="accordion-content"
-      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
+      className={cn(
+        "overflow-hidden text-sm",
+        hideWhenClosed
+          ? "data-[state=closed]:hidden"
+          : "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
+      )}
       {...props}
     >
```

`display: none` giữ DOM mount (React không unmount → form ref vẫn live → original prefill fix vẫn hoạt động) đồng thời ẩn visual + remove khỏi layout (chỉ hiện trigger row khi closed). Lost height-animation tradeoff chấp nhận được cho forceMount form-backed rows.

#### `src/features/insurance-dossier/components/document-row.tsx`

Pass `hideWhenClosed={forceMountContent}` xuống `<AccordionContent>` cùng với `forceMount` đã có:

```diff
 <AccordionContent
   className="pb-0"
+  hideWhenClosed={forceMountContent}
   {...(forceMountContent ? { forceMount: true } : {})}
 >
```

#### `src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx`

Thêm case 4 assert force-mounted accordion render content với `data-state="closed"` + className chứa `data-[state=closed]:hidden`. 3 case cũ (prefill payload) giữ nguyên + PASS — validate original fix preserved.

### 9.4 Verification (re-run)

```bash
cd frontend/gf-gms-web
npx eslint <3 files>                       # clean
npx vitest run src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx
# ✓ 4 tests passed (531ms)
npx tsc --noEmit                           # clean
bash .claude/scripts/check-comment-rules.sh # PASS
```

### 9.5 Blast radius re-fix

- Prop `hideWhenClosed` optional + default `false` → tất cả caller `AccordionContent` hiện hữu (settlement-sheet, quotation-sheet preview rows, page-level accordion khác) KHÔNG đổi behavior. Chỉ DocumentRow force-mounted opt-in.
- Animation cho non-forceMount accordion giữ nguyên (vẫn `animate-accordion-up/down`).
- Tradeoff: 2 force-mounted rows mất height animation khi expand/collapse — chấp nhận được; bù lại form ref luôn live (giải quyết original bug).

### 9.6 Files changed (re-fix)

- `frontend/gf-gms-web/src/components/ui/accordion.tsx` (MOD — add `hideWhenClosed` prop + conditional className)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/document-row.tsx` (MOD — pass `hideWhenClosed={forceMountContent}`)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx` (MOD — add 4th case asserting closed + hidden CSS)

Staged copies giữ trong `Execution/bugfixes/BUG-W02-095-patch/` (audit trail FM-012 workaround, overwrite từ initial patch).

## 11. Follow-up Re-fix (lift state) — 2026-06-25 lần 3

### 11.1 Lý do reopen lần 2

Attempt 2 (`hideWhenClosed` → `data-[state=closed]:hidden`) giải quyết được "auto-open + cannot close" nhưng đẻ ra defect UX mới: 2 row force-mount (BBNT + GUQ) mất height animation, đóng/mở snap instantly trong khi 2 row lazy-mount (SETTLEMENT_SHEET + QUOTATION_SHEET) vẫn animate mượt. User báo "UI giật", inconsistent giữa 4 row.

Lý do gốc: `display: none` toggle bypass animation hoàn toàn — không có frame transition khi data-state đổi closed↔open. `forceMount` keep DOM mount để form ref live → đó là tradeoff cố hữu, không có CSS trick nào vừa keep DOM mount + animate height + ẩn khi closed cùng lúc cho usecase này (`--radix-accordion-content-height` không reliable khi mount-and-hide vì ResizeObserver chưa fire trước initial state).

Conclusion: hướng `forceMount` + CSS-hide là **không thể đồng tồn** với "smooth lazy animation match 2 row gốc". Phải đổi architecture.

### 11.2 Approach lần 3 — Lift form state lên modal

Tư tưởng: tách "form state ownership" ra khỏi "form mount lifecycle". Modal own snapshot state, DossierTemplateForm chỉ là controlled view sync với modal.

- Modal khởi tạo `acceptanceSnapshot` + `authorizationSnapshot` ngay khi `open=true` bằng helper `buildAcceptanceFromPrefill` / `buildAuthorizationFromPrefill` (helper export từ dossier-template-form, dùng chung mapping logic với form defaults — không duplicate).
- `DossierTemplateForm` nhận prop `onValuesChange?: (values) => void` (variant-discriminated union: acceptance vs authorization). Bên trong: `useWatch({ control })` + `useEffect` propagate values lên modal mỗi khi form thay đổi.
- `handleSubmit` đọc payload từ `acceptanceSnapshot` / `authorizationSnapshot` thay vì ref. Khi user chỉ tick checkbox không expand → snapshot vẫn = prefill (init ở step 1) → payload đủ. Khi user expand + edit → onValuesChange đồng bộ snapshot → payload reflect edit.
- Drop `forceMount` + `FORM_BACKED_DOC_TYPES` + `hideWhenClosed`. Revert `accordion.tsx` + `document-row.tsx` về pre-attempt-1 state. Cả 4 row giờ lazy-mount tự nhiên → Radix `animate-accordion-up/down` hoạt động uniform.
- `useImperativeHandle` cũ giữ nguyên (`getAcceptanceValues` / `getAuthorizationValues`) cho `handlePrintAcceptance` / `handlePrintAuthorization` (chỉ fire khi expand, ref valid).

### 11.3 Files changed (lần 3)

- `frontend/gf-gms-web/src/components/ui/accordion.tsx` — REVERT: drop `hideWhenClosed?: boolean` prop. AccordionContent về pre-attempt-1 state (chỉ apply `data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down`).
- `frontend/gf-gms-web/src/features/insurance-dossier/components/document-row.tsx` — REVERT: drop `forceMountContent?: boolean` prop. AccordionContent receive `className` only.
- `frontend/gf-gms-web/src/features/insurance-dossier/components/dossier-template-form.tsx` — MODIFY: rename `buildAcceptanceDefaults` → `buildAcceptanceFromPrefill` (export), `buildAuthorizationDefaults` → `buildAuthorizationFromPrefill` (export). Add variant-discriminated union props `AcceptanceVariantProps` / `AuthorizationVariantProps` với `onValuesChange?` typed per variant. Add 2 sub-component `AcceptanceValuesWatcher` / `AuthorizationValuesWatcher` dùng `useWatch + useEffect` propagate values lên parent (mount inside `FormProvider`, render null). Existing `useImperativeHandle` + BUG-W02-101 coerce + BUG-W02-102 default clauses + BUG-W02-103 schema giữ nguyên.
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.tsx` — REFACTOR: drop `FORM_BACKED_DOC_TYPES`. Add 2 `useState` cho snapshot (`acceptanceSnapshot`, `authorizationSnapshot`). Init trong `useEffect(open, prefillKey)` bằng helper export. Pass `onValuesChange={setAcceptanceSnapshot}` / `onValuesChange={setAuthorizationSnapshot}` xuống form. `handleSubmit` build payload từ snapshot (extract `buildAcceptancePayloadFromSnapshot` helper drop `recordPlace` + `bankInfo`). `handlePrintAcceptance` / `handlePrintAuthorization` giữ nguyên dùng ref.
- `frontend/gf-gms-web/src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx` — REWRITE 4 case: case 1-3 = tick checkbox không expand → snapshot path; case 4 (mới) = expand + edit field `customer.name` → assert payload reflects edit via onValuesChange sync. Drop case "force-mount visibility" cũ.

### 11.4 Verification (re-run lần 3)

```bash
cd frontend/gf-gms-web
npx eslint <5 files>                                                                   # clean
npx vitest run src/features/insurance-dossier/components/insurance-dossier-modal.lazy-mount-form-payload.test.tsx
#  ✓ 4 tests passed (376ms) — snapshot path + sync path
npx vitest run src/features/insurance-dossier/components/dossier-template-form.bug-w02-101.test.tsx \
               src/features/insurance-dossier/components/dossier-template-form.bug-w02-102.test.tsx \
               src/features/insurance-dossier/schemas/dossier-template.schema.bug-w02-103.test.ts
#  ✓ 22 tests passed (W02-101 4 + W02-102 10 + W02-103 8) — sibling fixes preserved
npx tsc --noEmit                                                                       # clean
bash .claude/scripts/check-comment-rules.sh                                             # PASS
```

Broader `npx vitest run src/features/insurance-dossier/` — 115/118 PASS. 3 fail là pre-existing trong `insurance-dossier-tab.bug-w02-064.test.tsx` (test display-name + file-size formatting cho `dossier-document-card` — KHÔNG touch file trong fix này, confirmed via stash pop test).

### 11.5 Blast radius re-fix

- `accordion.tsx` revert về pre-attempt-1 → tất cả caller `AccordionContent` cross-feature KHÔNG đổi (settlement-sheet, quotation-sheet preview, page-level accordion khác).
- `document-row.tsx` revert → consumer chỉ có `insurance-dossier-modal.tsx`, prop bị drop nhưng caller cũng đã drop usage cùng commit.
- `dossier-template-form.tsx`: `onValuesChange` optional (default undefined → no-op effect). 6 existing test caller (W02-049/051/063/077/101/102 + dossier-template-form.test.tsx + fidelity-residual) KHÔNG truyền `onValuesChange` → behavior identical. Discriminated union typing đảm bảo modal pass đúng signature per variant.
- Helper export `buildAcceptanceFromPrefill` / `buildAuthorizationFromPrefill` là rename + export (refactor internal). Logic không đổi → form defaults vẫn nguyên prefill mapping.

Staged copies overwrite tại `Execution/bugfixes/BUG-W02-095-patch/` (audit trail FM-012 workaround).

## 12. Change Log

| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | agent-fix-garage-web (Opus 4.7 [1m] subagent) | Initial fix doc — root cause Radix accordion lazy-mount; minimal 3-file patch + 3 regression cases; verify clean (vitest + eslint + tsc + comment-rules); 1 pre-existing fail confirmed not regression. |
| 2026-06-25 | 2 | agent-fix-garage-web (Opus 4.7 [1m] subagent) | Regression re-fix — initial `forceMount` patch introduced UI regression (2 accordion auto-open + cannot close) do `AccordionContent` wrapper thiếu hide-when-closed CSS pair. Re-fix: add `hideWhenClosed?: boolean` prop vào AccordionContent, swap animation → `data-[state=closed]:hidden` khi flag true (display:none giữ DOM mount + ref live, lost animation acceptable cho forceMount case). Wired qua document-row.tsx. Test extended case 4 (4/4 PASS). Verify clean across eslint/vitest/tsc/comment-rules. |
| 2026-06-25 | 3 | agent-fix-garage-web (Opus 4.7 [1m] subagent) | Re-fix lần 3 — `display:none` toggle kill animation cho 2 force-mount row → UI giật, inconsistent với 2 row gốc lazy-mount mượt. Drop hẳn `forceMount` + `hideWhenClosed` (revert accordion.tsx + document-row.tsx về pre-attempt-1). Approach mới: lift form state lên modal — modal init `acceptanceSnapshot` + `authorizationSnapshot` từ `templatePrefill` khi mở; DossierTemplateForm thêm prop `onValuesChange` (useWatch + useEffect propagate); handleSubmit đọc snapshot thay ref. Export 2 helper `buildAcceptanceFromPrefill` / `buildAuthorizationFromPrefill` (refactor defaults dùng chung). Test rewrite 4 case: 3 snapshot + 1 sync. Verify: vitest 4/4 PASS (376ms); BUG-W02-101+102+103 regression 22/22 PASS; eslint+tsc+comment-rules clean. Cả 4 accordion giờ lazy-mount uniform animate. §11. |
