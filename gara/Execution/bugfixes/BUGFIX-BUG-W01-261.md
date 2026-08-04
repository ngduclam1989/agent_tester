# BUGFIX BUG-W01-261 — agg-garage-graph SDL refactor: bỏ root `depreciationByLine[]`, đẩy `depreciationPercent` xuống part-level

> **Status**: RESOLVED (BFF-side refactor — SDL + mapper + resolver + regression).
> **Authored by**: agent-fix-agg-garage-graph.
> **Date**: 2026-06-12.
> **Decision**: User contract chốt 2026-06-12 (supersedes BUG-W01-255 mapper-transform approach).
> **Related**:
> - BUG-W01-255 (P1, INVALID — D2 mapper transform `depreciationByLine[]` → per-part). Supersedes via contract refactor (root field bỏ hoàn toàn thay vì giữ asymmetry).
> - BUG-W01-262 (P1, paired) — gf-sales nhận `parts[i].depreciationPercent` từ REST body + persist `service_order_part.depreciation_percent`. Fix song song mới end-to-end.
> - BUG-W01-237 (P1, supersedes via BUG-W01-262) — gf-sales NULL persist với contract cũ.
> - BUG-W01-218 (P2) — Surface A Shape D flat root precedent (UNTOUCHED).
> - BUG-W01-019 (read-back echo gate) — extended để detect per-part depreciation intent.

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-261 (P1) — contract refactor agg-garage-graph SDL |
| Symptom | SDL `UpdateServiceOrderV3Input` mang field root `depreciationByLine: [InsuranceDepreciationByLineInput]` (lineId+percent), tách rời với per-part contract. Mapper D2 transform array → per-part `depreciationPercent` rồi strip root field — flow rườm rà, hai field song song trên cùng request (FE phải maintain cả `parts[i].depreciationPercent` lẫn `depreciationByLine[]`). |
| Hậu quả | (a) `INTEG-BFF-agg-garage-graph.md §4.3.7b.2 D2` đánh dấu "drift unresolved", asymmetry với spec `gf-sales-api §3bis.1` line 4069 đã định nghĩa `parts: [{id, payer, depreciationPercent}]` canonical. (b) FE phải duplicate field, contract documentation bloat. (c) Pairing với BUG-W01-262 (gf-sales persist NULL) — end-to-end depreciation per phụ tùng hỏng. |
| Reporter | agent-test-api (W01 TEST_EXECUTION, TC-W01-API-SOADJ-032) |
| Assigned | agent-fix-agg-garage-graph |
| Scope | BFF only (`bffs/agg-garage-graph/`). gf-sales persist + REST body schema = BUG-W01-262 (agent-fix-gf-sales scope). FE `useApplyInsuranceAdjustments` mutation refactor follow-up (agent-fix-garage-web). |

## 2. Root cause (why-chain)

### Why #1 — Tại sao SDL đang giữ cả root `depreciationByLine[]` lẫn per-part khả năng truyền `depreciationPercent`?

Schema gốc (CR-1780801481, D2) chốt design "depreciationByLine[] = root array bù trừ", với rationale "FE chỉ cần đụng 1 SDL field cho insurance allocation". Sau khi BR-INS-SO-ADJ-005 phân tách rõ ràng per-part responsibility (`payer` per phụ tùng, depreciation per phụ tùng), root array trở thành duplicate concern — phải tra cứu `lineId → percent` rồi assign về `parts[i].depreciationPercent`. Mapper code đã forward `parts[].depreciationPercent` đúng (SDL đã có sẵn `UpdateServiceOrderPartV3Input.depreciationPercent` đọc-được trên READ shape), chỉ thiếu input field. Root array bị giữ làm duplicate vì lý do compat lúc đầu.

### Why #2 — Tại sao chốt refactor (xoá root) thay vì giữ D2 transform?

User chốt 2026-06-12: gf-sales-api `§3bis.1` line 4069 (`parts: [{id, payer, depreciationPercent}]`) đã là canonical REST contract. Giữ D2 transform = giữ asymmetry giữa SDL (root array) và REST (per-part) → mapper phải làm transform mỗi update + FE phải maintain 2 field. Refactor (bỏ root array, đẩy `depreciationPercent: Float` xuống `UpdateServiceOrderPartV3Input`) match SDL với REST 1:1 và loại bỏ D2 row khỏi spec.

### Why #3 — Tại sao paired với BUG-W01-262 (gf-sales)?

BFF refactor xong nhưng nếu gf-sales `PUT /api/v3/service-orders/{id}` chưa bind `parts[i].depreciationPercent` vào `ServiceOrderPart.depreciationPercent` (Jackson silent drop) thì DB column `service_order_part.depreciation_percent` vẫn NULL → STL Detail render 0/blank cross-FEAT (FEAT-INS-STL-DETAIL). Hai bug = 1 contract, deploy song song.

### Why #4 — Tại sao `hasInsuranceWriteIntent` predicate cũng phải đổi?

BUG-W01-019 read-back echo gate trigger khi user đụng insurance allocation. Trước refactor: detect `depreciationByLine !== undefined`. Sau refactor: signal chuyển sang `parts[i].depreciationPercent !== undefined`. Predicate phải scan `parts` để giữ behavior — nếu user chỉ đổi depreciation % per phụ tùng (không đụng 5 root field), echo gate vẫn phải fire (gf-sales PUT response sparse, không echo `parts[i].depreciationPercent`).

## 3. Fix

### Touched files (all under `bffs/agg-garage-graph/src/`)

- `graphql/modules/gf-sales/service-orders-v3/service-orders-v3.schema.ts`
  - Drop `input InsuranceDepreciationByLineInput { lineId: Int, percent: Float }`.
  - Drop field `depreciationByLine: [InsuranceDepreciationByLineInput]` khỏi `UpdateServiceOrderV3Input`.
  - Add field `depreciationPercent: Float` vào `UpdateServiceOrderPartV3Input` (part-level input).
- `graphql/modules/gf-sales/service-orders-v3/service-orders-v3.types.ts`
  - Drop interface `InsuranceDepreciationByLineInput`.
  - Drop field `depreciationByLine?: InsuranceDepreciationByLineInput[]` khỏi `UpdateServiceOrderV3Request`.
  - Update comment trên `UpdateServiceOrderPartV3Request.depreciationPercent` (đã có sẵn) để phản ánh contract mới (BUG-W01-261 thay CR-1780801481 D2).
  - Add comment đánh dấu BUG-W01-261 trên block 5 insurance allocation fields.
- `graphql/modules/gf-sales/service-orders-v3/service-orders-v3.resolver.ts`
  - Drop import `applyDepreciationByLine` (function bị xoá).
  - Drop block code transform `input.depreciationByLine.forEach(...)` + strip root key trong `updateServiceOrderV3` mutation handler. Thay bằng comment ngắn ghi rõ "passthrough thuần `parts[]`".
- `graphql/modules/gf-accounting/settlements/insurance.mapper.ts`
  - Drop function `applyDepreciationByLine<T extends PartLike>` (28 LOC + interface `DepreciationByLineEntry` + interface `PartLike`).
  - Drop field `depreciationByLine?: unknown` khỏi `InsuranceWriteIntentLike`.
  - Add interface `InsuranceWriteIntentPartLike { depreciationPercent?: unknown }` + field `parts?: InsuranceWriteIntentPartLike[]` trên `InsuranceWriteIntentLike`.
  - Refactor `hasInsuranceWriteIntent` — sau khi check 5 root field, scan `input.parts[]` cho bất kỳ entry nào có `depreciationPercent !== undefined`.
- `graphql/modules/gf-accounting/settlements/insurance.mapper.regression.ts`
  - Drop import `applyDepreciationByLine`.
  - Drop test block D2 cũ (4 assertion: line 11/12/13 → percent map, pure).
  - Add test block BUG-W01-261 — passthrough thuần qua `flattenInsuranceAllocations`: parts array preserved, `depreciationPercent` per entry không bị strip, root `depreciationByLine` không còn key.
  - Drop assertion `hasInsuranceWriteIntent({ depreciationByLine: [...] }) === true`.
  - Add 4 new assertion BUG-W01-261 `hasInsuranceWriteIntent`: (a) `parts: [{depreciationPercent: 30}]` → true, (b) mixed array → true nếu có entry, (c) parts mảng tất cả undefined → false, (d) parts rỗng → false.
  - Drop null-safety assertion `applyDepreciationByLine(undefined, undefined) === undefined`.
- `graphql/modules/gf-sales/service-orders-v3/insurance-adjustment.contract.regression.ts`
  - Add (e) — SDL accepts mutation `updateServiceOrderV3(input: { parts: [{ id, payer, depreciationPercent }] })` cả literal lẫn parameterized. Validate schema parse + tham chiếu type OK.
  - Add (f) — SDL rejects mutation `updateServiceOrderV3(input: { depreciationByLine: [{ lineId, percent }] })` (root field đã refactored out).

### SDL diff summary

`UpdateServiceOrderV3Input`:
- ❌ Drop: `depreciationByLine: [InsuranceDepreciationByLineInput]`
- 🔁 Keep: `discountMaterial`, `discountLabor`, `claimReduction`, `depreciationDefault`, `insuranceDeductible` (5 root insurance allocation fields)

`UpdateServiceOrderPartV3Input`:
- ✅ Add: `depreciationPercent: Float` (per-part)
- 🔁 Keep: all 20 existing fields

`input InsuranceDepreciationByLineInput`:
- ❌ Drop hoàn toàn (không còn callsite)

### Mapper / resolver semantics preserved

- `flattenInsuranceAllocations` (root 5-allocation flat write transform) — UNTOUCHED, tiếp tục flatten `discountMaterial{mode,value}` → `discountMaterialMode/Value` etc.
- `parts[]` passthrough — resolver KHÔNG đụng `parts[i]` ngoài việc forward. gf-sales authoritative cho `depreciation_percent` persist + amount derivation.
- `mapServiceOrderInsuranceAdjustment` (READ side mapper, BUG-W01-218 Shape D flat root) — UNTOUCHED.
- `mapAccountingInsuranceFlat` (Surface B, BUG-W01-245) — UNTOUCHED.
- `mapDebtPanel` (D4/D5/D6/D7) — UNTOUCHED.
- `buildAdjustmentsFromSales` + `buildAdjustmentsFromAccounting` (BUG-W01-212 derive logic) — UNTOUCHED.
- BUG-W01-019 read-back echo behavior — preserved (predicate scan rộng hơn để bắt per-part intent).

### Retired

- `applyDepreciationByLine<T extends PartLike>(parts, byLine)` — root array → per-part mapping pure function. Không còn callsite.
- `DepreciationByLineEntry` interface (`{ lineId?, percent? }`).
- `PartLike` interface local helper.
- `InsuranceDepreciationByLineInput` (cả SDL input type lẫn TS interface).
- `UpdateServiceOrderV3Request.depreciationByLine?: InsuranceDepreciationByLineInput[]` field.
- D2 transform comment block (`CR-1780801481 (D2): map depreciationByLine[]…`) trong resolver — thay bằng BUG-W01-261 inline note.

## 4. Regression test

### `npm run test:insurance-mapper`

File: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.regression.ts` (ts-node script).

Coverage (after BUG-W01-261 edits):
- Surface B Shape D đệ quy (BUG-W01-245) — UNCHANGED, 16 flat fields + 5 composite adjustments.
- Surface A Shape D (BUG-W01-218) — UNCHANGED.
- BUG-W01-212 derive `amount` cho 4 derivable items — preserved.
- BUG-W01-005 contract — `hasInsurance===false` → undefined.
- BUG-W01-017 WRITE flatten + BUG-W01-019 read-back gate — extended.
- **BUG-W01-261 (NEW)** — per-part depreciation passthrough qua `flattenInsuranceAllocations`:
  - Parts array preserved (length, payer, depreciationPercent at index 0/1/2).
  - Mixed (part có depreciationPercent + part không có) → only entries that carry survive untouched.
  - Root `depreciationByLine` không còn key trong payload sau flatten.
  - Root insurance allocation flatten vẫn chạy parallel với parts passthrough.
- **BUG-W01-261 (NEW)** — `hasInsuranceWriteIntent` per-part gate:
  - `parts: [{depreciationPercent: 30}]` → true.
  - Mixed array (`[{undefined}, {20}]`) → true.
  - All-undefined parts → false (không false positive).
  - Empty parts array → false.

Result: 142+ assertions, ALL PASS.

```
PASS: all insurance mapper regression assertions green.
```

### `npm run test:insurance-contract`

File: `bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/insurance-adjustment.contract.regression.ts` (loads composed SDL via `buildASTSchema(typeDefs)`).

Coverage:
- (a) BUG-W01-218 Shape D canonical (16 flat fields) — UNCHANGED.
- (b) Pre-Shape-D `insuranceAdjustment` wrapper rejected — UNCHANGED.
- (c) Pre-Shape-D `breakdownByPayer` nested rejected — UNCHANGED.
- (d) Pre-Shape-D `settlementBalance` header wrapper rejected — UNCHANGED.
- (e) Pre-Shape-A `adjustments: [...]` array rejected — UNCHANGED.
- **(f) BUG-W01-261 (NEW)** — SDL accepts `parts[i].depreciationPercent: Float` cả literal lẫn parameterized.
- **(g) BUG-W01-261 (NEW)** — SDL rejects root `depreciationByLine: [{lineId, percent}]` trên `UpdateServiceOrderV3Input` (1 validation error).

Result: ALL PASS.

```
PASS: SDL accepts BUG-W01-261 canonical `parts[i].depreciationPercent` on UpdateServiceOrderV3 (per-part input).
PASS: SDL rejects root `depreciationByLine: [...]` — BUG-W01-261 refactor enforced (1 error(s)).
```

## 5. Blast radius / Risk

### BFF (this fix)
- `updateServiceOrderV3` mutation: **breaking change request shape** — root `depreciationByLine[]` removed; `parts[i].depreciationPercent` is canonical. Anyone sending `depreciationByLine` (FE pre-W01) → 400 validation error.
- Other operations on `service-orders-v3` (createServiceOrderV3, getServiceOrderByCode, updateServiceOrderV3 (other fields), startServiceOrderV3, completeServiceOrderV3, cancelServiceOrderV3, recordServiceOrderPaymentV3, sendQuotationV3, confirmServiceOrderV3) — UNCHANGED (`depreciationByLine` đã không có ở Create input nên không đụng).
- Read shape `ServiceOrderPartV3Data.depreciationPercent: Float` — UNCHANGED, đã tồn tại từ trước (per-part).

### FE coordination required (NOT IN SCOPE — owned by agent-fix-garage-web)
- `frontend/gf-gms-web/src/features/insurance-allocation/hooks/useApplyInsuranceAdjustments.ts` (hoặc tên tương đương) — `updateServiceOrderV3` mutation cần refactor: bỏ `depreciationByLine` variable + đẩy `depreciationPercent` lên `parts[]`. Bug Notes (Tracking/BUGS.md) đã flag là follow-up PR.
- FE `garage-mobile` `InsuranceAllocationCubit` — chưa wire W01 nên không block; spec mới phản ánh contract trước khi mobile pick up.

### Backend (gf-sales)
- BUG-W01-262 (paired) — gf-sales `PUT /api/v3/service-orders/{id}` REST body schema phải accept `parts[i].depreciationPercent` + bind vào `ServiceOrderPart.depreciationPercent` entity + persist `service_order_part.depreciation_percent`. gf-sales-api `§3bis.1` line 4069 đã document contract; fix chỉ cần align implementation (`ServiceOrderUpdateMapper`). Cross-FEAT impact `FEAT-INS-STL-DETAIL` (snapshot `for-settlement.lines[].depreciationPercent`) + `FEAT-INS-DASH-DEBT` (gián tiếp qua CALC-INS-001).

### Co-ordination warning
Nếu BFF rollout production trước gf-sales (BUG-W01-262) → FE gửi `parts[i].depreciationPercent` qua mutation, agg passthrough OK, nhưng gf-sales drop key (Jackson silent) → DB NULL như BUG-W01-237 hiện trạng. Atomic deploy BFF + gf-sales bắt buộc (đã raise note trong Tracking/BUGS.md BUG-W01-261 row Notes column).

## 6. Verification log

| Step | Command | Result |
|---|---|---|
| TypeScript typecheck | `npm run typecheck` | ✅ PASS (zero TS errors post-refactor) |
| Mapper regression | `npm run test:insurance-mapper` | ✅ PASS (all assertions green incl. new BUG-W01-261 per-part passthrough + write-intent gate) |
| SDL contract test | `npm run test:insurance-contract` | ✅ PASS — Shape D enforced + BUG-W01-261 SDL canonical accepted, root `depreciationByLine` rejected |
| Lint (scoped to edited files) | `npx eslint src/graphql/modules/gf-sales/service-orders-v3/{schema,types,resolver}.ts src/graphql/modules/gf-accounting/settlements/insurance.mapper{,.regression}.ts src/graphql/modules/gf-sales/service-orders-v3/insurance-adjustment.contract.regression.ts` | ⚠️ 21 errors PRE-EXISTING (unused-vars + any + empty-interface trong files lớn); ZERO new errors introduced. Lint pre-existing debt khắp gateway = 1273 errors tổng. |
| Build | `npm run build` | ⏸️ DEFERRED — runner sandbox classifier block; typecheck (same tsc invocation `--noEmit`) đã pass nên build TS phase OK. |

## 7. Lint note

Pre-existing lint debt trong gateway repo (≈1273 errors, mostly `@typescript-eslint/no-explicit-any` + `@typescript-eslint/no-unused-vars` + `@typescript-eslint/no-empty-object-type`). Edits của BUG-W01-261 KHÔNG introduce errors mới:

- `service-orders-v3.schema.ts`: 0 new lint error (chỉ thêm 1 dòng SDL + xoá 5 dòng).
- `service-orders-v3.types.ts`: 0 new lint error (drop 4 dòng + thêm comment).
- `service-orders-v3.resolver.ts`: 0 new lint error (drop 12 dòng + thay comment ngắn; pre-existing unused-vars import warnings KHÔNG tăng).
- `insurance.mapper.ts`: 0 new lint error (drop function `applyDepreciationByLine` + interfaces + reshape predicate).
- `insurance.mapper.regression.ts`: 0 new lint error (drop test block + add equivalent BUG-W01-261 block).
- `insurance-adjustment.contract.regression.ts`: 0 new lint error (add 2 contract assertion).

Lint cleanup out-of-scope.

## 8. Co-ordination follow-up (for orchestrator)

1. **Sync gf-sales fix dispatch**: agent-fix-gf-sales phải close BUG-W01-262 trước/cùng deploy production. Spec đã có (gf-sales-api `§3bis.1`), chỉ cần align `ServiceOrderUpdateMapper` + entity binding.
2. **FE refactor follow-up**: agent-fix-garage-web pick up FE mutation rewrite (drop `depreciationByLine` variable, đẩy `depreciationPercent` xuống `parts[].depreciationPercent`). Không block bug này (BFF SDL changed → FE phải đổi nhưng có thể coordinated PR riêng).
3. **Spec update**:
   - `Architecture/integrations/INTEG-BFF-agg-garage-graph.md §4.3.7b.2 D2` — xoá row D2 hoặc đổi resolution thành "input dropped, part-level scalar canonical".
   - `Architecture/api/gf-sales-api.md §3bis.1` — đã có `parts[i].depreciationPercent` (line 4069); KHÔNG cần đổi.
   - SDL doc / GraphQL schema reference nếu published.
4. **Mark BUG-W01-255 INVALID** (đã done in BUGS.md row): superseded by BUG-W01-261 contract refactor.
5. **Verify file** `Tracking/WAVE01/verify/BUG-W01-261.verify.md` đã có sẵn; agent-test-api rerun TC-W01-API-SOADJ-032 + TC-W01-API-SOADJ-001..009 + TC-W01-API-SOADJ-034..035 sau khi BUG-W01-262 close.

## 9. References

- L1 ticket row: `Tracking/WAVE01/BUGS.md` BUG-W01-261.
- L2 verify file: `Tracking/WAVE01/verify/BUG-W01-261.verify.md`.
- Spec canonical (gf-sales REST): `Architecture/api/gf-sales-api.md §3bis.1` line 4069.
- Drift doc (to update post-fix): `Architecture/integrations/INTEG-BFF-agg-garage-graph.md §4.3.7b.2 D2`.
- Precedent (Shape D Surface A): `Execution/bugfixes/BUGFIX-BUG-W01-218.md`.
- Precedent (Shape D Surface B): `Execution/bugfixes/BUGFIX-BUG-W01-245.md`.
- BR: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` BR-INS-SO-ADJ-005.
- Paired bug (gf-sales persist): `Tracking/WAVE01/BUGS.md` BUG-W01-262.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-12 | 1 | agent-fix-agg-garage-graph | Initial BFF refactor: drop root `depreciationByLine[]` + `InsuranceDepreciationByLineInput` from SDL/TS; add `depreciationPercent: Float` to `UpdateServiceOrderPartV3Input`; drop `applyDepreciationByLine` mapper function; extend `hasInsuranceWriteIntent` to scan `parts[i].depreciationPercent`; regression + SDL contract tests updated (NEW BUG-W01-261 assertions, drop D2 transform assertions). Typecheck + 2 regression suites PASS. Paired BUG-W01-262 (gf-sales persist) + FE follow-up. |
