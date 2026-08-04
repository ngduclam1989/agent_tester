# BUGFIX BUG-W01-275 — Mobile SO Detail (BH): thừa mục "Tổng chi phí"

> **Status**: VERIFIED (2026-06-15) — implemented per §3.
> **Severity**: P3.
> **Boundary**: garage-mobile.
> **Authored by**: agent-fix-garage-mobile (Wave 01).
> **Related**: BR-INS-SO-ADJ-010; BUG-W01-277 (cùng màn nhóm panel BH).

---

## 1. Failure mode

Màn Chi tiết Phiếu dịch vụ có Bảo hiểm (SO Detail, hasInsurance=true) hiển thị **thừa**
mục "Tổng chi phí" (`CostSummaryWidget`). Theo BR-INS-SO-ADJ-010, mục "Tổng chi phí" chỉ
được hiển thị khi SO **KHÔNG** có Bảo hiểm; khi có BH thì panel "Phân bổ bảo hiểm"
(`InsuranceTotalPanel`) thay thế.

## 2. Root cause

`lib/ui/service_order_v3/service_order_detail_v3/service_order_detail_v3_page.dart:443–448`
render `CostSummaryWidget` vô điều kiện khi `state.detail != null`:

```dart
if (state.detail != null) ...[
  WrapperGroup(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    showDivider: state.canCancel || (state.detail?.hasInsurance ?? false),
    children: [CostSummaryWidget(detail: state.detail!)],
  ),
],
```

Block `InsuranceTotalPanel` (≈450–483) đã gate đúng `if (hasInsurance == true)`; chỉ
`CostSummaryWidget` thiếu gate ngược lại.

## 3. Fix spec

`service_order_detail_v3_page.dart:443` — đổi điều kiện:

```dart
// before
if (state.detail != null) ...[
// after
if (state.detail != null && state.detail?.hasInsurance != true) ...[
```

Rà lại `showDivider` cho block còn lại để divider giữa các section vẫn đúng khi
`CostSummaryWidget` ẩn.

## 4. Blast radius / don't-touch

- **Touched**: `service_order_detail_v3_page.dart:443–448` (1 block).
- **Don't-touch**: block `InsuranceTotalPanel` (≈450–483 — đã gate đúng `hasInsurance==true`,
  là pattern tham chiếu); logic compute trong `CostSummaryWidget`.

## 5. Regression test

Widget test (group BUG-W01-275): (1) SO Detail hasInsurance=true → KHÔNG có "Tổng chi phí",
CÓ panel Phân bổ BH; (2) hasInsurance=false → CÓ "Tổng chi phí", KHÔNG panel BH.

## 6. Status

VERIFIED (2026-06-15). Implemented: `service_order_detail_v3_page.dart:443` gate đổi sang
`if (state.detail != null && state.detail?.hasInsurance != true)`, `showDivider` hạ về
`state.canCancel`. `fvm flutter analyze` 0 error. L2: `Tracking/WAVE01/verify/BUG-W01-275.verify.md`.
