# BUGFIX BUG-W02-096 — Modal Tạo hồ sơ bảo hiểm → accordion "Phiếu báo giá sửa chữa" sai cấu trúc cột

> Wave: W02 · Severity: P2 · Status: OPEN → FIX_DONE (pending L2 verify)
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-25, SET-20260624-00003)
> Reporter: BA via agent-test-orchestrator

> **ID history** (collision rename 2026-06-25): originally filed as `BUG-W02-083`
> by local orchestrator session; renamed to `BUG-W02-096` to avoid
> collision with parallel session's mobile bug `BUG-W02-083`
> (`agent-fix-garage-mobile` — "Chi tiết phiếu dịch vụ thiếu tab KH/BH thanh toán")
> after `git pull`. Frontend repo regression test file
> `estimate-document-preview.bug-w02-083.test.tsx` retains the old slug because
> commit `efec0fa6` (frontend/gf-gms-web @ main) was already pushed; the test
> filename should be read as the artifact slug, not the canonical design-repo ID.

## 1. Failure mode

Modal "Tạo hồ sơ bảo hiểm" (vd `SET-20260624-00003`) → accordion "Phiếu báo giá sửa chữa" render bảng items với 5 cột:

```
STT | Nội dung sửa chữa | Phụ tùng | Đơn giá | Thành tiền
```

Mỗi row chỉ điền 1 trong 2 cột "Nội dung sửa chữa" (cho services) hoặc "Phụ tùng" (cho parts) — cột còn lại trống, KHÔNG có cột "Số lượng".

Bản in chuẩn standalone Phiếu báo giá (vd `PDV-20260320-00639`) có 5 cột:

```
STT | Nội dung sửa chữa (merged services + parts) | Số lượng | Đơn giá | Thành tiền
```

Drift = preview FE không khớp bản in chuẩn → chứng từ gửi DN bảo hiểm trông khác bản in.

## 2. Root cause

3 vị trí drift cùng họ:

### 2.1 `DossierEstimateRow` interface (`src/features/insurance-dossier/interfaces/index.ts:186-192`)

Shape tách `serviceName: string` + `parts: string` — implicitly model "1 row = 1 SERVICE hoặc 1 PART, cột còn lại trống". KHÔNG có `quantity` field.

### 2.2 `buildEstimateItems` (`src/features/insurance-dossier/helper/build-dossier-props.ts:136-155`)

Map services → `{ serviceName: line.name, parts: "" }`; map parts → `{ serviceName: "", parts: line.name }`. Concat 2 list → output row "split" theo loại item. KHÔNG carry `line.quantity` (mặc dù `InsuranceSettlementLineItem.quantity` có sẵn).

### 2.3 `buildEstimateColumns` (`src/features/insurance-dossier/components/estimate-document-preview.tsx:37-68`)

Column definition list 5 entries: STT / Nội dung sửa chữa / Phụ tùng / Đơn giá / Thành tiền. Header thứ 3 = "Phụ tùng" thay vì "Số lượng".

Hypothesis hệ thống: agent-dev follow Figma spec `wave02-ins-dossier-create.md` §1 Layout DSL (line 1019-1023) — spec mô tả cột 3 = `{ key: parts, label: "Phụ tùng", width: 80, align: right }`. Tuy nhiên BA xác nhận bản in chuẩn standalone Phiếu báo giá là source of truth nghiệp vụ → orchestrator resolved spec gap (per prompt "Lưu ý triage": "Bản in standalone Phiếu báo giá là source of truth"). Spec drift cần follow-up CR cho Business Authority cập nhật Figma + FEAT-INS-DOSSIER-CREATE AC.

## 3. Fix

### 3.1 `src/features/insurance-dossier/interfaces/index.ts`

```diff
 export interface DossierEstimateRow {
   index: number;
-  serviceName: string;
-  parts: string;
+  name: string;
+  quantity: number;
   unitPrice: number;
   amount: number;
 }
```

Merge 2 string fields → 1 `name` field; add `quantity: number`.

### 3.2 `src/features/insurance-dossier/helper/build-dossier-props.ts`

```diff
 const buildEstimateItems = (
   detail: InsuranceSettlementDetail,
 ): DossierEstimateRow[] => {
   const services: DossierEstimateRow[] = detail.services.map((line, index) => ({
     index: index + 1,
-    serviceName: line.name,
-    parts: "",
+    name: line.name,
+    quantity: line.quantity ?? 0,
     unitPrice: line.unitPrice ?? 0,
     amount: line.finalAmount ?? 0,
   }));
   const partOffset = services.length;
   const parts: DossierEstimateRow[] = detail.parts.map((line, index) => ({
     index: partOffset + index + 1,
-    serviceName: "",
-    parts: line.name,
+    name: line.name,
+    quantity: line.quantity ?? 0,
     unitPrice: line.unitPrice ?? 0,
     amount: line.finalAmount ?? 0,
   }));
   return [...services, ...parts];
 };
```

Cả services và parts đều map `line.name` → `name`, bind `line.quantity` → `quantity`. Concat preserved (services rồi parts) → match bản in chuẩn (services thường đứng trước).

### 3.3 `src/features/insurance-dossier/components/estimate-document-preview.tsx`

```diff
 const buildEstimateColumns = (): ColumnDef<DossierEstimateRow>[] => [
   { id: "index", accessorKey: "index", header: "STT", ... },
   {
-    id: "serviceName",
-    accessorKey: "serviceName",
+    id: "name",
+    accessorKey: "name",
     header: "Nội dung sửa chữa",
   },
   {
-    id: "parts",
-    accessorKey: "parts",
-    header: "Phụ tùng",
+    id: "quantity",
+    accessorKey: "quantity",
+    header: "Số lượng",
+    meta: { headerClassName: "text-right", cellClassName: "text-right" },
   },
   { id: "unitPrice", ... },
   { id: "amount", ... },
 ];
```

Replace cột "Phụ tùng" (accessor=parts) → cột "Số lượng" (accessor=quantity), right-aligned khớp pattern cột số. `itemsFooter` 5 cells giữ nguyên (vẫn match 5 columns).

## 4. Regression test

### `src/features/insurance-dossier/components/estimate-document-preview.bug-w02-083.test.tsx` (NEW — 5 tests)

1. **Header set assertion**: `headers.map(h => h.textContent)` === `['STT', 'Nội dung sửa chữa', 'Số lượng', 'Đơn giá', 'Thành tiền']`.
2. **No "Phụ tùng" column**: `queryByRole("columnheader", { name: "Phụ tùng" })` === null.
3. **Merged content**: both service names ("Thay dầu xe", "Công sơn + tháo lắp") and part names ("Tay nắm cửa", "Đèn led nội thất xe") render trong cùng cột "Nội dung sửa chữa".
4. **Quantity binding**: cells column 3 = ['1', '2', '1', '4'] khớp `items[].quantity`.
5. **Footer total**: `itemsTotal=1.400.000đ` render đúng.

Fixture: 4 items (2 services + 2 parts), realistic Vietnamese names + numeric quantities + total = 1.4M VND.

Vitest result: **5/5 PASS** (run isolated).

Full insurance-dossier suite: 89 pass + 3 fail. 3 failures (`insurance-dossier-tab.bug-w02-064.test.tsx`) PRE-EXISTING — confirmed via `git stash` baseline; unrelated to estimate component.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/interfaces/index.ts` (DossierEstimateRow shape: serviceName+parts → name+quantity)
- `frontend/gf-gms-web/src/features/insurance-dossier/helper/build-dossier-props.ts` (buildEstimateItems: bind quantity, merge name field)
- `frontend/gf-gms-web/src/features/insurance-dossier/components/estimate-document-preview.tsx` (buildEstimateColumns: "Phụ tùng" → "Số lượng")
- `frontend/gf-gms-web/src/features/insurance-dossier/components/estimate-document-preview.bug-w02-083.test.tsx` (NEW regression test 5 cases)

Scope: 4 files, all trong `src/features/insurance-dossier/`. Zero cross-feature impact.

## 6. Status update

BUG-W02-096: OPEN → FIX_DONE (verify pending L2 — Playwright UI accordion Phiếu báo giá, assert 5 columns header + merged content + quantity binding).

## 7. Follow-ups

- **CR-RAISE MINOR cho Business Authority** (BLOCKED — spec drift): Figma spec `wave02-ins-dossier-create.md` §1 Layout DSL line 1019-1023 hiện vẽ cột "Phụ tùng" (key=parts) — không khớp bản in chuẩn standalone (PDV-20260320-00639 với cột "Số lượng"). Cần update spec md (re-prefetch Figma) + FEAT-INS-DOSSIER-CREATE AC để khớp business contract đã chốt. Orchestrator resolution dựa "bản in standalone = source of truth" (per prompt "Lưu ý triage") cần BA cập nhật chính thức.
- **Audit kế tiếp accordion preview khác** trong dossier modal: BBNT, GUQ, Phiếu QT — cấu trúc cột có cần align với bản in standalone không? Có thể là pattern chung "preview drift vs bản in" cần audit hệ thống.
- **Verify cross-boundary**: bản in PDF thật của Phiếu báo giá xuất từ dossier (gf-accounting Thymeleaf render → PDF) — nếu CŨNG sai cấu trúc cột thì cross-boundary, escalate `agent-fix-gf-accounting` riêng. Nếu PDF đúng → drift duy nhất ở FE preview component (đã fix).
- **Pre-existing test failures** (`insurance-dossier-tab.bug-w02-064.test.tsx` — 3 cases về `'0kb' fallback` không match `'PDFGiấy ủy quyền nhận tiền bồi thường.pdf'`) — KHÔNG liên quan fix này; cần follow-up bug riêng cho dossier-tab card text rendering.
