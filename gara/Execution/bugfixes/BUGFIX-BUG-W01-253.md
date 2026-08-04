# BUGFIX BUG-W01-253 — SO Edit FE preview CK liên kết BH dùng cơ sở trước VAT

> **Status**: REOPEN (xem §0 — fix CK% đã merge 2026-06-12 nhưng chưa verify số liệu thực tế; Khấu hao VT FE ĐÃ ĐÚNG)
> **Priority**: P1
> **L1 ticket**: `Tracking/WAVE01/BUGS.md` row BUG-W01-253
> **L2 verify**: `Tracking/WAVE01/verify/BUG-W01-253.verify.md`
> **Assign**: agent-fix-garage-web
> **Codebase**: `frontend/gf-gms-web/`
> **Related**: BUG-W01-252 (gf-sales BE — cùng root cause family, scope riêng)

---

## §0. Tại sao REOPEN — agent PHẢI đọc trước

Fix CK% base đã được apply 2026-06-12 và Vitest 76/76 PASS. Tuy nhiên §0.6 status hiện là **REOPEN** vì hai lý do:

**Lý do A — Playwright C4 không verify số liệu thực tế (CRITICAL)**
Playwright C4 chỉ check "fill '5' → panel hiển thị '-5đ'". Đây là mode=AMOUNT (value=5 VND), KHÔNG phải mode=PERCENT với post-VAT base. Cần verify bằng số cụ thể:
- parts.bh (post-VAT) = A
- Nhập CK Vật tư = 10% → preview phải = 10% × A (không phải 10% × (A - VAT))

**Lý do B — Alignment với BUG-W01-252 (BLOCK)**
AC §3 item 3 của L2 verify: `Khi save → BE compute (BUG-W01-252) phải khớp FE preview` — unchecked `[ ]` vì BUG-W01-252 vẫn REOPEN cho Khấu hao VT scope. FE preview Khấu hao VT đã đúng (confirmed 2026-06-15) — bug Khấu hao VT chỉ ở BE (`computeDepreciationAmount` trong gf-sales).

**Nhiệm vụ của agent-fix-garage-web trong lần này:**
1. Verify fix CK% còn trong code (không bị revert)
2. Chạy manual verify với số liệu cụ thể (§6)
3. Update status sau khi verify đủ

---

## 1. Feature context — cái gì đang hiển thị ở đâu

### 1.1 Layout SO Edit có BH

```
SO Edit (tab "Hạng mục")
├── Bảng "Dịch vụ thực hiện"   ← mỗi dòng có [Bên TT] [Giá] [Thuế]
├── Bảng "Phụ tùng sử dụng"    ← mỗi dòng có [Bên TT] [SL] [Đơn giá] [Thuế] [Khấu hao VT %]
└── Section "Phân bổ quyết toán bảo hiểm"
    ├── CK liên kết BH Vật tư   [mode: PERCENT|AMOUNT] [value]
    ├── CK liên kết BH Công DV  [mode: PERCENT|AMOUNT] [value]
    ├── Giảm trừ bồi thường     [AMOUNT]
    └── Khấu trừ bảo hiểm       [AMOUNT]

Panel "Tổng giá dịch vụ" (render realtime, không cần save)
└── Sub-section "Phân bổ bảo hiểm"
    ├── CK liên kết BH — Vật tư:  [VND realtime] ← BUG ở đây (PERCENT mode)
    ├── CK liên kết BH — Công DV: [VND realtime] ← BUG ở đây (PERCENT mode)
    ├── Giảm trừ bồi thường:       [VND]
    ├── Khấu trừ BH:               [VND]
    └── Khấu hao VT (per dòng):   [VND] ← FE đã đúng (post-VAT); BE sai (BUG-W01-252)
```

### 1.2 Công thức theo BR-EP §7.1 (spec canonical)

| Khoản | Base (theo BR-EP §7.1) | Compute |
|---|---|---|
| CK liên kết BH Vật tư (PERCENT) | **Cộng sau VAT** = Σ(parts amount + taxAmount) payer=BH | value% × base |
| CK liên kết BH Công DV (PERCENT) | **Cộng sau VAT** = Σ(service amount + taxAmount) payer=BH | value% × base |
| CK (AMOUNT mode) | N/A — fixed amount | value (VND cố định) |
| Khấu hao VT per dòng (PERCENT) | **Cộng sau VAT** per part = part.amount + part.taxAmount | depreciationPercent% × (part.amount + part.taxAmount) |

### 1.3 Ví dụ số liệu cụ thể (BR-EP §7.2)

Seed SO PDV-20260611-00005:
- parts BH before VAT (breakdown.parts.bh) = 168,000,000
- VAT parts BH (breakdown.vatParts.bh) = 16,800,000 (10%)
- parts BH after VAT = 184,800,000
- service BH before VAT = 39,900,000
- VAT service BH = 3,990,000 (10%)
- service BH after VAT = 43,890,000

Nhập CK Vật tư = 5%:
- **Expected** (post-VAT base): 5% × 184,800,000 = **9,240,000**
- **Wrong** (pre-VAT base):     5% × 168,000,000 = **8,400,000**
- Chênh lệch: 840,000 VND (~10% × 5% × parts BH = VAT% × CK)

---

## 2. Codebase map — agent phải biết tìm ở đâu

### 2.1 Cây thư mục

```
frontend/gf-gms-web/src/
└── features/
    ├── insurance-allocation/           ← domain feature riêng
    │   ├── interfaces/
    │   │   └── index.ts               ← [TYPE] BreakdownByPayer, InsuranceAdjustmentInput
    │   ├── helper/
    │   │   ├── calc.ts                ← [BUG] computeAllocationAmounts() — xử lý PERCENT formula
    │   │   ├── index.ts               ← buildBreakdownByPayer() — tổng hợp data từ SO items
    │   │   ├── defaults.ts            ← emptyBreakdown() — giá trị mặc định
    │   │   └── calc.test.ts           ← [TEST] regression tests BUG-W01-253
    │   └── components/
    │       ├── allocation-section.tsx  ← render input form section "Phân bổ BH"
    │       └── allocation-totals/     ← render panel preview "Tổng giá dịch vụ"
    │           ├── allocation-totals-server.tsx   ← read-only từ server data
    │           └── allocation-totals-client.tsx   ← realtime từ RHF form values
    └── service-order/
        └── components/
            └── form/
                ├── index.tsx          ← SO Edit form root
                └── items-table-section.tsx  ← bảng Phụ tùng (có cột Khấu hao VT)
```

### 2.2 Grep commands để định vị code

```bash
cd frontend/gf-gms-web

# --- Locate calc.ts ---
find src -name "calc.ts" | grep -i insurance

# --- Verify current state của fix CK% ---
grep -n "vatParts\|vatService\|partsAfterVat\|serviceAfterVat" \
  src/features/insurance-allocation/helper/calc.ts

# --- Verify BreakdownByPayer type ---
grep -n "vatParts\|vatService\|BreakdownByPayer" \
  src/features/insurance-allocation/interfaces/index.ts

# --- Verify buildBreakdownByPayer accumulates VAT per type ---
grep -n "vatParts\|vatService\|taxAmount\|buildBreakdownByPayer" \
  src/features/insurance-allocation/helper/index.ts

# --- Tìm test file ---
find src -name "calc.test.ts" | grep insurance
grep -n "BUG-W01-253\|post-VAT\|discountMaterial.*9_240_000\|8_400_000" \
  src/features/insurance-allocation/helper/calc.test.ts
```

---

## 3. Root cause chi tiết

### 3.1 Code WRONG (pre-fix trạng thái) — computeAllocationAmounts

```typescript
// File: src/features/insurance-allocation/helper/calc.ts
// WRONG — dùng pre-VAT subtotal làm base cho PERCENT mode:

export function computeAllocationAmounts(
  input: InsuranceAdjustmentInput,
  breakdown: BreakdownByPayer,
): AllocationAmounts {
  // ...

  // ❌ breakdown.parts.bh là pre-VAT (Σ part.amount payer=BH)
  const discountMaterial = computeDiscount(
    input.discountMaterial,
    breakdown.parts.bh,          // ← SAI: pre-VAT base
  );

  // ❌ breakdown.service.bh là pre-VAT (Σ service.amount payer=BH)
  const discountLabor = computeDiscount(
    input.discountLabor,
    breakdown.service.bh,         // ← SAI: pre-VAT base
  );

  // ...
}

function computeDiscount(
  discount: DiscountInput | undefined,
  base: number,
): number {
  if (!discount) return 0;
  if (discount.mode === 'PERCENT') return base * (discount.value / 100); // base = pre-VAT → SAI
  if (discount.mode === 'AMOUNT')  return discount.value;                // AMOUNT mode OK
  return 0;
}
```

### 3.2 Code CORRECT (post-fix) — computeAllocationAmounts

```typescript
// File: src/features/insurance-allocation/helper/calc.ts
// CORRECT — dùng post-VAT (before + vat) làm base cho PERCENT mode:

export function computeAllocationAmounts(
  input: InsuranceAdjustmentInput,
  breakdown: BreakdownByPayer,
): AllocationAmounts {
  // ✅ post-VAT = pre-VAT + VAT per category per payer
  const partsAfterVatBh    = breakdown.parts.bh   + (breakdown.vatParts?.bh   ?? 0);
  const serviceAfterVatBh  = breakdown.service.bh  + (breakdown.vatService?.bh ?? 0);
  // Fallback khi vatParts/vatService absent (non-edit pages): dùng pre-VAT (graceful degrade)

  const discountMaterial = computeDiscount(input.discountMaterial, partsAfterVatBh);   // ✅
  const discountLabor    = computeDiscount(input.discountLabor,    serviceAfterVatBh); // ✅

  // ... rest unchanged
}
```

### 3.3 Type extension cần có — BreakdownByPayer

```typescript
// File: src/features/insurance-allocation/interfaces/index.ts

export interface PayerPair {
  bh: number;  // insurance payer
  kh: number;  // customer payer
}

export interface BreakdownByPayer {
  parts:   PayerPair;    // Σ part.amount per payer (PRE-VAT)
  service: PayerPair;    // Σ service.amount per payer (PRE-VAT)
  vat:     PayerPair;    // Σ (part.taxAmount + service.taxAmount) per payer (AGGREGATE VAT)

  // Phải có (thêm cho post-VAT base):
  vatParts?:   PayerPair;  // ✅ Σ part.taxAmount per payer
  vatService?: PayerPair;  // ✅ Σ service.taxAmount per payer

  totalAfterVat: PayerPair;
  // ...
}
```

### 3.4 Populate trong buildBreakdownByPayer

```typescript
// File: src/features/insurance-allocation/helper/index.ts
// buildBreakdownByPayer phải accumulate vatParts + vatService riêng biệt:

function buildBreakdownByPayer(items: SOLineItem[]): BreakdownByPayer {
  const result = emptyBreakdown(); // must init vatParts + vatService

  for (const item of items) {
    const isInsurance = item.payer === 'BH';

    if (item.type === 'PART') {
      result.parts[isInsurance ? 'bh' : 'kh']    += item.amount;       // pre-VAT
      result.vatParts[isInsurance ? 'bh' : 'kh']  += item.taxAmount ?? 0; // VAT per type ✅
    } else {
      result.service[isInsurance ? 'bh' : 'kh']   += item.amount;
      result.vatService[isInsurance ? 'bh' : 'kh'] += item.taxAmount ?? 0; // ✅
    }

    result.vat[isInsurance ? 'bh' : 'kh'] += item.taxAmount ?? 0; // aggregate (still needed)
  }

  return result;
}
```

---

## 4. Khấu hao VT FE — ĐÃ ĐÚNG (confirmed 2026-06-15, không cần fix)

FE preview Khấu hao VT per dòng đã sử dụng post-VAT base (`part.amount + part.taxAmount`).
Bug Khấu hao VT chỉ tồn tại ở BE: `computeDepreciationAmount(part, percent)` trong
`ServiceOrderInternalService.java` dùng `part.getAmount()` (pre-VAT) thay vì `part.getFinalAmount()`
— scope thuộc BUG-W01-252, không phải BUG-W01-253.

Hệ quả: sau khi user save, giá trị BE compute sẽ lệch với FE preview cho Khấu hao VT
cho đến khi BUG-W01-252 (gf-sales) được fix hoàn chỉnh.

---

## 5. Fix checklist cho agent-fix-garage-web

Thực hiện theo thứ tự:

- [ ] **Step 1** — Đọc `calc.ts`: confirm `vatParts`/`vatService` đang được dùng làm post-VAT base (fix CK% vẫn còn) hoặc phát hiện bị revert.
  - Nếu còn: sang Step 2.
  - Nếu revert: apply lại fix §3.2 + verify §5.

- [ ] **Step 2** — Đọc `interfaces/index.ts`: confirm `vatParts?: PayerPair` và `vatService?: PayerPair` có trong `BreakdownByPayer`.
  - Nếu không có: thêm (additive, optional — không breaking).

- [ ] **Step 3** — Đọc `helper/index.ts`: confirm `buildBreakdownByPayer` populate `vatParts` + `vatService`.
  - Nếu không: thêm accumulate line per §3.4.

- [ ] **Step 4** — Đọc `defaults.ts`: confirm `emptyBreakdown()` init `vatParts` + `vatService` = zero pairs.

- [ ] **Step 5** — Run tests:
  ```bash
  npx vitest run src/features/insurance-allocation/helper/calc.test.ts
  npx vitest run   # full suite
  npm run build
  npm run typecheck
  ```

- [ ] **Step 6** — Manual verify với số liệu cụ thể (§6 dưới đây).

- [ ] **Step 7** — Update L1 BUGS.md + L2 verify.md + L3 BUGFIX.md status sau khi PASS.

---

## 6. Manual verify bắt buộc — với số liệu cụ thể

### 6.1 Setup

```
URL: http://localhost:3000/service-order/PDV-20260611-00005/edit
Login: accountant 0810000002
SO: PDV-20260611-00005 (hasInsurance=true — KHÔNG dùng PDV-20260611-00010 hasInsurance=false)
```

### 6.2 Verify CK Vật tư PERCENT

1. Mở SO Edit → tab Hạng mục → bảng Phụ tùng sử dụng.
2. Ghi lại: Tổng tiền phụ tùng BH trước thuế = **A**, tổng thuế BH = **B**, tổng sau thuế = **A+B**.
3. Section "Phân bổ BH" → nhập CK Vật tư: chọn PERCENT, nhập `10`.
4. Quan sát panel "Tổng giá dịch vụ" → "Phân bổ bảo hiểm" → "CK liên kết BH - Vật tư".
5. Tính tay: Expected = 10% × (A+B).
6. **PASS** nếu preview = Expected (±1 VND làm tròn).
7. **FAIL** nếu preview = 10% × A (pre-VAT) → fix CK% chưa áp đúng.

### 6.3 Khấu hao VT PERCENT — FE đã đúng (không cần verify)

FE preview Khấu hao VT đã dùng post-VAT base (confirmed 2026-06-15).
Bug Khấu hao VT chỉ ở BE scope (BUG-W01-252 / gf-sales) — ngoài scope BUG-W01-253.

### 6.4 Verify AMOUNT mode không bị ảnh hưởng (regression)

1. Nhập CK Vật tư: chọn AMOUNT, nhập `5000000`.
2. Preview "CK liên kết BH - Vật tư" phải = 5,000,000 (cố định, không phụ thuộc base).

---

## 7. Regression tests trong calc.test.ts

File: `src/features/insurance-allocation/helper/calc.test.ts`

```typescript
describe('BUG-W01-253 — CK PERCENT uses post-VAT base', () => {

  it('CK Vật tư PERCENT 5%: base = parts.bh + vatParts.bh (post-VAT)', () => {
    // parts BH 168M + VAT 16.8M (10%)
    const breakdown = mockBreakdown({
      parts:    { bh: 168_000_000, kh: 0 },
      vatParts: { bh:  16_800_000, kh: 0 },
    });
    const input = mockInput({ discountMaterial: { mode: 'PERCENT', value: 5 } });

    const result = computeAllocationAmounts(input, breakdown);

    // 5% × (168M + 16.8M) = 5% × 184.8M = 9,240,000
    expect(result.discountMaterial).toBe(9_240_000);
    expect(result.discountMaterial).not.toBe(8_400_000); // regression: must NOT be pre-VAT
  });

  it('CK CDV PERCENT 5%: base = service.bh + vatService.bh (post-VAT)', () => {
    const breakdown = mockBreakdown({
      service:    { bh: 39_900_000, kh: 0 },
      vatService: { bh:  3_990_000, kh: 0 },
    });
    const input = mockInput({ discountLabor: { mode: 'PERCENT', value: 5 } });

    const result = computeAllocationAmounts(input, breakdown);

    // 5% × (39.9M + 3.99M) = 5% × 43.89M = 2,194,500
    expect(result.discountLabor).toBe(2_194_500);
  });

  it('CK AMOUNT mode: fixed value, không phụ thuộc base (regression)', () => {
    const breakdown = mockBreakdown({ parts: { bh: 168_000_000, kh: 0 } });
    const input = mockInput({ discountMaterial: { mode: 'AMOUNT', value: 5_000_000 } });

    const result = computeAllocationAmounts(input, breakdown);
    expect(result.discountMaterial).toBe(5_000_000); // cố định
  });

  it('vatParts absent (Detail page / old mapper): graceful fallback to pre-VAT, no NaN', () => {
    const breakdown = mockBreakdown({
      parts: { bh: 168_000_000, kh: 0 },
      // vatParts: undefined — simulates Detail page without per-type VAT split
    });
    const input = mockInput({ discountMaterial: { mode: 'PERCENT', value: 5 } });

    const result = computeAllocationAmounts(input, breakdown);

    // Falls back to pre-VAT base (acceptable degrade for non-edit views)
    expect(result.discountMaterial).toBe(8_400_000); // 5% × 168M
    expect(Number.isNaN(result.discountMaterial)).toBe(false);
    expect(result.discountMaterial).toBeGreaterThan(0);
  });
});

// NOTE: Khấu hao VT FE đã đúng (post-VAT) — không cần test thêm trong BUG-W01-253.
// Test Khấu hao VT BE: xem InsuranceSettlementCalculationTest.java::bug252_depreciation_usesPostVatBase (BUG-W01-252).
```

---

## 8. Blast radius

| Surface | Ảnh hưởng | Ghi chú |
|---|---|---|
| Preview CK Vật tư PERCENT | **YES — target** | Fix: post-VAT base |
| Preview CK Công DV PERCENT | **YES — target** | Symmetric fix |
| Preview Khấu hao VT per dòng | KHÔNG | FE đã đúng (post-VAT base, confirmed 2026-06-15) — bug Khấu hao VT chỉ ở BE (BUG-W01-252/gf-sales) |
| CK AMOUNT mode | KHÔNG | Fixed VND, base không dùng |
| Panel "Tổng giá dịch vụ" table rows | KHÔNG | Các row khác (Tổng sau VAT, Chi tiết theo BH/KH) không đổi |
| `allocation-totals-server.tsx` (Detail page) | KHÔNG | Read-only từ server; vatParts optional → fallback |
| Save payload → gf-sales | KHÔNG | FE chỉ gửi raw input values (mode + value); server recomputes |
| BUG-W01-252 (gf-sales BE) | KHÔNG | Scope riêng; fix FE preview ≠ fix BE authoritative compute |

---

## 9. Don't-touch

| Component | Lý do |
|---|---|
| `allocation-totals-server.tsx` | Read-only non-edit view; vatParts optional → graceful fallback đủ |
| `computeDiscount()` inner function | Logic đúng — chỉ đổi `base` truyền vào, không đổi function |
| CK AMOUNT mode path | Không dùng base → không liên quan |
| `breakdown.vat` aggregate field | Vẫn cần cho các row khác trong panel; không remove |
| BFF/gf-sales save payload | FE gửi raw input, server recompute — không sửa payload |
| BUG-W01-236 validation (% range 0–100) | Giữ nguyên |

---

## 10. Cross-reference

| Bug | Relationship |
|---|---|
| BUG-W01-252 | BE counterpart: `computeDiscount()` + `computeDepreciationAmount()` trong `ServiceOrderInternalService.java` dùng pre-VAT base. Fix FE+BE mới làm preview align với save result. |
| BUG-W01-260 | Cùng wave: panel CK Chiết khấu display mode-aware (PERCENT→`%`, AMOUNT→`đ`) — đã VERIFIED. |
| BUG-W01-263 | "Áp dụng tất cả" không propagate depreciation per dòng — đã RESOLVED. |
| BUG-W01-254 | Cột "Khấu hao VT" bảng Phụ tùng header + editable — đã VERIFIED. |

---

## Changelog

| Date | By | Change |
|---|---|---|
| 2026-06-12 | agent-fix-garage-web | Initial fix: enrich BreakdownByPayer vatParts/vatService, post-VAT base for CK%. RESOLVED. |
| 2026-06-12 | agent-fix-garage-web | Initial fix RESOLVED: enrich BreakdownByPayer vatParts/vatService, post-VAT base for CK%; files touched — interfaces/index.ts, helper/defaults.ts, helper/index.ts, helper/calc.ts, helper/calc.test.ts. Verify: `npx vitest run` 76/76 PASS (4 new BUG-W01-260 specs included), `npm run build` (tsc -b && vite build) exit 0. |
| 2026-06-15 | agent-meta | Rewrite BUGFIX doc (chi tiết hóa cho dev-fix). Thêm §0 REOPEN analysis, §4 Khấu hao VT FE check, §6 manual verify với số liệu, §3 code diff wrong vs correct. Status: REOPEN pending §4 verify + §6.2 numeric validation. |
