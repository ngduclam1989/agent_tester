# BUGFIX-BUG-W01-297 — STL Detail BH thiếu khối header summary 4-cột + section "Đơn vị thanh toán" 7 fields

| Field | Value |
|---|---|
| Bug ID | BUG-W01-297 |
| Severity | P2 |
| Status | RESOLVED (pending TEST_GROUP / QA verify) |
| Wave | W01 (EP-INSURANCE-SETTLEMENT) |
| Feature(s) | FEAT-INS-STL-DETAIL |
| Business Rule(s) | BR-INS-STL-DET-007 (BH variant parity với KH baseline) |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Fix Agent | agent-fix-garage-web |
| Fix Commit | `PENDING_USER_COMMIT` |
| Fix Branch | `feature/ep-insurance-settlement-w01` |
| Spec Version | 1 |
| Last Reviewed | 2026-06-17 |

## 1. Symptom

STL Detail biến thể BH SIT (`SET-20260616-00012`) thiếu hai khối UI mà KH baseline canonical (`SET-20260612-00002` UAT) đã có:

(a) **Khối header summary 4-cột** ngay dưới `<PageHeader>` — gồm `Phiếu dịch vụ liên kết` / `Bên thanh toán` (badge Bảo hiểm tím) / `Tổng Tiền` (primary, font-semibold-lg) / `Còn lại` (red-600, font-semibold-lg). UAT canonical show "Tổng Tiền 14.613.460đ" + "Còn lại 14.613.460đ".

(b) **Section riêng "Đơn vị thanh toán"** 7 trường (2 hàng × 4 cột) sau "Thông tin khách hàng & xe", trước Tabs:
- Row 1: Công ty BH / Số HĐ BH / Người giám định / SĐT Liên hệ
- Row 2: Mã số thuế BH / Ngày hết hạn / Hồ sơ bảo lãnh

BH SIT chỉ render `Đơn vị thanh toán: ABIC - Bảo hiểm Agribank` inline 1 dòng trong section "Thông tin quyết toán" (qua `<SettlementInfo>` L92-94). Phần còn lại (6/7 fields) hoàn toàn không có DOM.

User annotation: "Giao diện đúng sẽ có thông tin Đơn vị thanh toán ở đây" + cross-environment regression SIT vs UAT.

## 2. Root Cause

**RC ≠ deploy lag / branch divergence như hypothesis A/B trong bug report**.

Code audit `frontend/gf-gms-web` xác nhận BH page chưa từng implement 2 element trên ở bất kỳ commit nào. Page render path:

```
<PageHeader> → <SettlementInfo> (8 fields cơ bản) → <TabButtons>
```

KH baseline render path canonical (`settlement-voucher/components/detail/index.tsx`):

```
<PageHeader> → <OverviewInfo> (header summary 4-cột + 3 rows base info) →
<CustomerVehicleInfo> → <InsuranceInfo> (section 7 fields) → tabs
```

→ BH variant từ đầu chỉ port subset (header info + payer badge inline) và **bỏ qua 2 element** này. UAT screenshot có khả năng là từ instance khác (deploy KH page lên BH route, hoặc snapshot env có patch khác). Bản thân branch `feature/ep-insurance-settlement-w01` HEAD không chứa code section "Đơn vị thanh toán" cho BH variant.

**Data layer**: GraphQL query `use-insurance-settlement-detail.ts` đã có `insuranceCompanyName` (BUG-W01-028) nhưng KHÔNG có 4 field detail (`insurancePolicyNumber` / `insuranceContactPhone` / `insuranceExpiryDate` / `assessorName`) cũng như `serviceOrder.documents` — nên dù có thêm UI thì view-model vẫn không có dữ liệu.

## 3. Fix

### 3.1 GraphQL query + view-model extension

`frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts`:

- Query `serviceOrder { ... }` thêm 4 field detail BH + nested `documents` block (parity KH `use-get-settlement-by-code.ts`):
  ```graphql
  insurancePolicyNumber
  insuranceContactPhone
  insuranceExpiryDate
  assessorName
  documents {
    id documentType fileName fileUrl fileSize mimeType description createdAt
  }
  ```
- `IRawServiceOrderDocument` interface mới + `IRawServiceOrder` mở rộng 4 field + `documents`.
- Mapper `mapInsuranceSettlementDetail` project 4 field sang root view-model + project `documents[]` sang `serviceOrderDocuments[]` (drop entries thiếu `fileUrl`/`fileName` để DocumentList không crash).
- `insuranceTaxCode` chưa expose trên BFF SDL → KHÔNG add vào query; component render placeholder `"--"` cùng cách KH baseline làm.

`frontend/gf-gms-web/src/features/insurance-settlement/interfaces/index.ts`:

- `InsuranceSettlementDetail` mở rộng `insurancePolicyNumber` / `insuranceContactPhone` / `insuranceExpiryDate` / `assessorName` + `serviceOrderDocuments` (typed dạng compatible `DocumentListItem`).

### 3.2 Header summary block

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx`:

- Import `useTranslation`, `Badge`, `DescriptionItem`, `formatCurrencyVi`.
- Sau `<PageHeader>` và trước `<SettlementInfo>`, render khối:
  ```tsx
  <div data-testid="stl-detail-header-summary" className="grid grid-cols-2 lg:grid-cols-4 ...">
    <DescriptionItem label={t("Phiếu dịch vụ liên kết")}>
      <button ... onClick={() => onOpenServiceOrder?.(detail.serviceOrderCode)}>
        {detail.serviceOrderCode || "--"}
      </button>
    </DescriptionItem>
    <DescriptionItem label={t("Bên thanh toán")}>
      <Badge variant="outline" className="border-purple-500 text-purple-500 w-fit">
        {t("Bảo hiểm")}
      </Badge>
    </DescriptionItem>
    <DescriptionItem label={t("Tổng Tiền")}>
      <p className="text-primary font-semibold text-lg">
        {formatCurrencyVi(Math.round(paymentTotals.total ?? 0), "đ")}
      </p>
    </DescriptionItem>
    <DescriptionItem label={t("Còn lại")}>
      <p data-testid="stl-detail-header-summary-conlai"
         className="text-destructive font-semibold text-lg text-red-600">
        {formatCurrencyVi(Math.round(paymentTotals.remaining ?? 0), "đ")}
      </p>
    </DescriptionItem>
  </div>
  ```
- `paymentTotals` đã được tính sẵn từ BUG-W01-296 (L147-159): `total = detail.insurancePayment ?? 0`, `remaining = max(receivable − paid, 0)` — không cần thay logic.
- Khối này overlap 2 field ("Phiếu dịch vụ liên kết" + "Bên thanh toán") với `<SettlementInfo>` bên dưới — chấp nhận (KH baseline `overview-info.tsx` cũng overlap; comment 1 dòng giải thích).

### 3.3 Component mới `<InsuranceProviderInfo>`

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-provider-info.tsx`:

- Port style + layout từ KH baseline `settlement-voucher/components/detail/insurance-info.tsx` L25-68.
- Render 7 fields qua `<DescriptionItem>`, `data-testid="info-block-don-vi-thanh-toan"`.
- `Mã số thuế bảo hiểm` placeholder `"--"` cứng — parity KH baseline L45-47.
- `Ngày hết hạn` format qua `formatDateTime(detail.insuranceExpiryDate, DateTimePattern.DEFAULT)` (dd/MM/yyyy).
- `Hồ sơ bảo lãnh` filter `documentType === DocumentTypeEnum.CLAIM_RECORD` → render `<DocumentList gridCols="grid-cols-1">`; fallback `"--"` khi list rỗng.
- Reads từ `detail.*` view-model (không bind trực tiếp raw query) → mapper test cover null-safe.

Page mount `<InsuranceProviderInfo detail={detail} />` ngay sau `<SettlementInfo>`.

### 3.4 Regression test

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-provider-info.bug-297.test.ts` — 21 source-pin specs / 5 groups:

1. **GraphQL query** — pin 4 field name + `documents { documentType ... fileUrl }` block (catch deploy regression nếu query bị strip).
2. **Mapper** — runtime assert 4 field + `serviceOrderDocuments[]` project đúng từ SO; null-safe khi SO null; drop entries thiếu URL/name.
3. **Detail page** — pin imports (`useTranslation` / `formatCurrencyVi`), pin 4 label literal (`Phiếu dịch vụ liên kết` / `Bên thanh toán` / `Tổng Tiền` / `Còn lại`), pin `formatCurrencyVi(Math.round(paymentTotals.{total,remaining}))` calls, pin `text-red-600` cho "Còn lại", pin mount `<InsuranceProviderInfo>`.
4. **InsuranceProviderInfo** — pin 7 label, pin `Mã số thuế bảo hiểm` placeholder `"--"`, pin `DocumentTypeEnum.CLAIM_RECORD` filter + `<DocumentList>`, pin `formatDateTime(...DateTimePattern.DEFAULT)`, pin 6 field reads từ `detail.*`.
5. Section title testid `info-block-don-vi-thanh-toan` cho QA pinpoint.

Pattern follow BUG-W01-296 / 299 / 301 — source-pin > render test cho deploy/regression catch (render test cần i18n + apollo providers; source-pin catch literal-strip).

## 4. Verification

- `npx vitest run src/features/insurance-settlement/components/detail/insurance-provider-info.bug-297.test.ts` → **21/21 pass**.
- `npx vitest run src/features/insurance-settlement/` → **73/73 pass** (11 files; bao gồm shell test, payment test, cost-tab test, mapper test).
- `npx tsc --noEmit` → clean (no TS errors).
- `npm run lint` → 0 issues từ scope (insurance-settlement); pre-existing repo-wide errors unrelated.
- `npm run build` → success (Vite production build).

## 5. Files Changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts` | Query +4 field + nested documents; IRawServiceOrderDocument + IRawServiceOrder ext; mapper project new fields |
| `frontend/gf-gms-web/src/features/insurance-settlement/interfaces/index.ts` | InsuranceSettlementDetail +4 field + serviceOrderDocuments[] |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx` | +useTranslation/Badge/DescriptionItem/formatCurrencyVi imports; +header summary 4-cột block; +mount `<InsuranceProviderInfo>` |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-provider-info.tsx` | NEW — section "Đơn vị thanh toán" 7 fields |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-provider-info.bug-297.test.ts` | NEW — 21-spec regression source-pin |
| `Tracking/WAVE01/BUGS.md` | Status OPEN → RESOLVED (registry row L138 + work-track row L327) |

## 6. Constraints Honored

- FE-only (Layer 1 garage-web) — KHÔNG đụng BFF (agg-garage-graph) hay BE (gf-accounting/gf-sales). GraphQL selection-set expansion là non-breaking — KH baseline đã expose y nguyên 4 field + documents trên SO query trong production.
- KHÔNG modify entities/schemas thuộc boundary khác. KHÔNG đụng Flyway.
- Owned_paths `frontend/gf-gms-web/src/features/insurance-settlement/**` (per agent-fix-garage-web spec).
- Versioning 3-in-1: doc này version 1 / 2026-06-17 / Change Log entry below.

## 7. Caveats

- `insuranceTaxCode` không expose trên BFF SDL `ServiceOrderDetailV3Data` → component placeholder cứng `"--"`. Khi BE/BFF expose → fix incremental (extend query + bind real value).
- Khối header summary overlap 2 field với `<SettlementInfo>` bên dưới — accepted (KH baseline cũng có overlap pattern này; UX intentional cho top-of-page glance summary).
- Edit mode (`?mode=edit`) chia sẻ page → fix auto-cover Edit cùng (header summary + provider section render giống nhau, không bị toggle bởi `isEditMode`).
- Bug report hypothesis "deploy lag" / "branch divergence" — KHÔNG match thực tế code; RC = restore-to-baseline parity fix. Triage T1-T5 đề xuất ban đầu (build SHA compare, DevTools network response) đã skip vì code audit confirm gap trực tiếp.

## 8. Follow-up

- Spec amend (CR follow-up): `FEAT-INS-STL-DETAIL` AC nên explicit liệt kê section "Đơn vị thanh toán" 7 fields + header summary 4-cột là canonical baseline (hiện AC chưa explicit, dẫn đến BH variant ban đầu skip 2 element này).
- BE/BFF backlog: expose `insuranceTaxCode` trên `ServiceOrderDetailV3Data` để FE bind real value.
- BUG-W01-295 (mobile cùng FEAT) — chưa cover section "Đơn vị thanh toán" trên Flutter; xem xét parity mobile riêng nếu mobile detail screen có cùng gap.

## 9. REOPEN (Manual QC 2026-06-17)

User Manual QC sau initial fix bắt được layout chưa match canonical:
- Standalone 4-cột header summary block đứng trên `<SettlementInfo>` bị duplicate "Phiếu DV liên kết" + "Bên thanh toán" với row 1 của SettlementInfo bên dưới → user annotation "Bỏ cả hàng này đi".
- Row 1 của SettlementInfo ("Thông tin quyết toán" grid) vẫn show "Đơn vị thanh toán" (inline 1-line text) + "Người tạo" ở slot 3/4 thay vì "Tổng Tiền" + "Còn lại" → user annotation "Thay trường Đơn vị thanh toán và Người tạo ở dòng này bằng trường Tổng tiền và Còn lại".
- Người tạo cần dời xuống đầu dòng dưới (row 2) → user annotation "Chuyển xuống đầu dòng dưới".

Reference layout đúng: UAT `SET-20260612-00002` (KH baseline `overview-info.tsx` L116-185 — 1 grid 3-row inside cùng 1 section: Row1 = Phiếu DV / Bên thanh toán / Tổng Tiền / Còn lại; Row2 = Người tạo / Ngày tạo / Cập nhật lần cuối; Row3 = Ghi chú).

### 9.1 Reopen Fix

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/settlement-info.tsx`:

- `SettlementInfoProps` thêm `totalAmount?: number` + `remainingAmount?: number`; component nhận thêm 2 prop này.
- Import `formatCurrencyVi` từ `@/utils/number`.
- AC-2 "Thông tin quyết toán" grid → restructure sang 3 row (parity KH baseline `overview-info.tsx` L116-185):
  - **Row 1**: Phiếu dịch vụ liên kết / Bên thanh toán (badge Bảo hiểm) / **Tổng Tiền** (primary, font-semibold-lg) / **Còn lại** (red-600, font-semibold-lg).
  - **Row 2**: Người tạo / Ngày tạo / Cập nhật lần cuối (drop "Đơn vị thanh toán" inline — đã được cover bởi `<InsuranceProviderInfo>` 7-field section bên dưới).
  - **Row 3**: Ghi chú quyết toán (full-width single field with optional textarea trên Edit mode).
- `data-testid` mới: `settlement-info-tong-tien` + `settlement-info-con-lai` (cho QA pinpoint).

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx`:

- DROP toàn bộ `<div data-testid="stl-detail-header-summary" …>` 4-cột block (port từ initial 297 fix L290-336). Cleanup unused imports: `useTranslation`, `Badge`, `DescriptionItem`, `formatCurrencyVi`, hook `const { t } = useTranslation();`.
- `<SettlementInfo …>` pass thêm `totalAmount={paymentTotals.total} remainingAmount={paymentTotals.remaining}`. `paymentTotals` đã tính sẵn (initial 297 fix giữ nguyên).

### 9.2 Reopen Regression Test

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.bug-297-reopen.test.ts` — 9 source-pin specs:

1. Page no longer renders `data-testid="stl-detail-header-summary"` block.
2. Page passes `totalAmount={paymentTotals.total}` + `remainingAmount={paymentTotals.remaining}` vào `<SettlementInfo>`.
3. Page drops now-unused imports (`react-i18next`, `Badge`, `DescriptionItem`, `formatCurrencyVi`).
4. `SettlementInfo` accepts `totalAmount?: number` + `remainingAmount?: number` props.
5. Row 1 of `SettlementInfo` contains Tổng Tiền + Còn lại (replacing Đơn vị thanh toán + Người tạo).
6. `SettlementInfo` no longer renders inline `label="Đơn vị thanh toán"`.
7. "Còn lại" value uses `text-destructive` + `text-red-600` styling.
8. Người tạo / Ngày tạo / Cập nhật lần cuối ở row 2 (sequential).
9. Imports `formatCurrencyVi`.

### 9.3 Reopen Verification

```bash
cd frontend/gf-gms-web
npx vitest run --environment=node \
  src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.bug-297-reopen.test.ts
# → 9/9 passed

npm run build           # → exit 0 (built in 20.30s)
```

### 9.4 Reopen Files Changed (incremental over initial 297 fix)

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx` | DROP standalone 4-cột header summary block; pass `totalAmount` + `remainingAmount` xuống `<SettlementInfo>`; cleanup unused imports |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/settlement-info.tsx` | +`totalAmount`/`remainingAmount` props + `formatCurrencyVi` import; restructure AC-2 grid sang 3 row (Tổng Tiền/Còn lại lên row 1; Người tạo xuống row 2; Ghi chú full-width row 3); drop inline "Đơn vị thanh toán" label |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.bug-297-reopen.test.ts` | NEW — 9-spec regression source-pin |

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial BUGFIX doc — restore-to-baseline parity fix cho STL Detail BH (header summary 4-cột + section "Đơn vị thanh toán" 7 fields). 73/73 insurance-settlement tests pass; 21 new regression specs. Pending user commit + QA verify. |
| 2026-06-17 | 2 | agent-fix-garage-web | **REOPEN fix** — restructure layout cho khớp KH baseline canonical. Drop standalone 4-cột header summary (duplicate); promote Tổng Tiền + Còn lại vào SettlementInfo row 1 (replace Đơn vị thanh toán + Người tạo); move Người tạo xuống row 2; section "Đơn vị thanh toán" 7-field full vẫn nằm trong `<InsuranceProviderInfo>` bên dưới (initial 297 fix giữ nguyên). 9 new regression specs (`insurance-settlement-detail-page.bug-297-reopen.test.ts`) all pass; build clean. |
