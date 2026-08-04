# BUGFIX BUG-W02-076 — VND format dư phần lẻ thập phân (formatCurrencyVi no-round)

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-24, PDV-20260624-01120/edit)
> Reporter: BA via agent-test-orchestrator

## 1. Failure mode

Trên panel "Phân bổ Bảo hiểm" + "Cần thanh toán" (SO detail/edit + phiếu QT detail/create/edit) các ô tiền VND hiển thị phần lẻ thập phân: `4.731.912,5đ`, `42.587.212,5đ` — không khớp yêu cầu BA "VND số nguyên đồng, round-half-up away-from-zero".

## 2. Root cause

`formatCurrencyVi` (`src/utils/number.ts`) truyền value thẳng vào `formatValue` (react-currency-input-field) với `decimalSeparator: ","` mà KHÔNG round trước. Caller panel BH không tự bọc `Math.round`. Riêng `cost-tab.tsx` (detail baseline) có `Math.round` nên không lộ defect; panel insurance + edit/create surfaces thì lộ.

Ngoài ra, `Math.round` JS round-half-to-positive-infinity (`-0.5 → -0`), không phải half-up-away-from-zero → khoản âm bị sai chiều magnitude.

## 3. Fix

### `src/utils/number.ts`

Bake round-VND vào `formatCurrencyVi`:

- Helper nội bộ `roundVndHalfUpAwayFromZero(value)`: với `value < 0` dùng `-Math.round(Math.abs(value))` để giữ semantic half-up-away-from-zero (KHÔNG dùng `Math.round` raw, sai chiều cho `-0.5`).
- Convert string → number qua `Number(num)`, round → format. Empty/null/undefined giữ behavior cũ.

→ Mọi caller toàn app tự động hết phần lẻ; KHÔNG cần audit từng caller.

## 4. Regression test

### `src/utils/number.bug-w02-076.test.ts` (NEW)

9 assertions covering:

- `4_731_912.5 → "4.731.913đ"` (positive half-up).
- `42_587_212.5 → "42.587.213đ"` (BA expected number).
- `-4_731_912.5 → "-4.731.913đ"` (negative half-up away-from-zero).
- `100.4 → "100đ"` (round down), `-100.4 → "-100đ"`.
- Whole numbers, zero literal, undefined/empty string, custom suffix override.
- String input with decimal `"4731912.5" → "4.731.913đ"`.

## 5. Files changed

- `frontend/gf-gms-web/src/utils/number.ts` (bake round into formatCurrencyVi)
- `frontend/gf-gms-web/src/utils/number.bug-w02-076.test.ts` (NEW, 9 assertions)

## 6. Status update

BUG-W02-076: OPEN → RESOLVED (verify pending L2). Note: cross-screen consistency (edit vs detail vs print) còn phụ thuộc round-at-source per-line ở BE/BFF (`gf-sales`/`agg-garage-graph`) — out-of-scope cho fix FE-only này; flag follow-up nếu QC bắt ±1đ drift cross-màn.

## 7. Follow-ups

- `gf-sales`/`agg-garage-graph` round adjustment amounts per-line tại source để cross-screen consistency tuyệt đối (BUG-W02-022 / BUG-W02-053 cùng họ money format).
- Audit caller `formatCurrencyVi` với value đã pre-decimal intentional (vd display %): nếu có, đổi sang `formatNumber` để giữ decimal.
