# BUGFIX BUG-W01-277 — Mobile SO Edit (BH): tab "Xác nhận" không hiển thị Phân bổ BH từ tab "Hạng mục"

> **Status**: VERIFIED (2026-06-15) — implemented per §3; TODO INTEG-MOB resolved.
> **Severity**: P2.
> **Boundary**: garage-mobile.
> **Authored by**: agent-fix-garage-mobile (Wave 01).
> **Related**: BUG-W01-275 (cùng panel BH); FEAT-INS-SO-ADJUSTMENT allocation.

---

## 1. Failure mode

Màn SO Edit có Bảo hiểm: giá trị "Phân bổ quyết toán bảo hiểm" nhập ở tab "Hạng mục"
KHÔNG xuất hiện ở tab "Xác nhận" khi nhấn "Tiếp tục" — panel BH ở Confirmation render rỗng
(0đ). Reporter mô tả "state không flush vào BLoC".

## 2. Root cause

`lib/ui/service_order_v3/service_order_creation_v3/pages/confirmation_page_v3.dart` —
`InsuranceTotalPanel` được khởi tạo **không truyền** `breakdown` / `adjustments` /
`balance` (rơi về default rỗng). Có TODO tường minh (≈ dòng 51–60):

```dart
/// TODO(INTEG-MOB): bind breakdown / adjustments / balance từ V3 cubit state
/// hoặc detail snapshot ... Hiện panel render rỗng với 0 đến khi contract sẵn sàng.
```

Lưu ý: dữ liệu allocation **đã** được cache vào `ServiceOrderCreationV3Cubit` qua stream
listener ở `items_page_v3.dart:83` (`cacheInsuranceAllocation(s.input)`) — nên state **không
mất** khi chuyển step. Bản chất bug là **Confirmation không đọc lại** state đã cache để
compute/hiển thị (binding thiếu), không phải mất flush.

## 3. Fix spec

Trong `confirmation_page_v3.dart`:

1. `_buildInsuranceAllocationSummary()` (≈61–82): đọc `InsuranceAllocationInput` đã cache từ
   `ServiceOrderCreationV3Cubit.state`, rebuild `breakdown` + `partLines` từ items hiện tại
   (qua `InsuranceBreakdownMapper`), resolve `adjustments`/`balance`.
2. `_InsurancePanelSwitcher` (≈1088–1117): nhận và truyền `breakdown` / `adjustments` /
   `balance` xuống `InsuranceTotalPanel` (bỏ default rỗng).

## 4. Blast radius / don't-touch

- **Touched**: `confirmation_page_v3.dart` (≈61–82 summary builder; ≈1088–1117 panel switcher).
- **Don't-touch**: step navigation handler `service_order_creation_v3_page.dart:224–238`
  (hoạt động đúng); cache setup `items_page_v3.dart:70–84` (đúng — đừng đổi luồng cache).

## 5. Regression test

Widget test (group BUG-W01-277): SO Edit BH → nhập allocation ở tab Hạng mục → sang tab Xác
nhận → `InsuranceTotalPanel` hiển thị đúng giá trị đã nhập (≠ 0/rỗng), cả nhánh
view customer-side lẫn insurance-side.

## 6. Status

VERIFIED (2026-06-15). Implemented trong `confirmation_page_v3.dart`:
`_buildInsuranceAllocationSummary` đọc `cubit.initialInsuranceAllocation` + rebuild
breakdown/partLines qua `InsuranceBreakdownMapper`, dựng `InsuranceAllocationState` để
resolve adjustments/balance; `_InsurancePanelSwitcher` nhận + truyền breakdown/adjustments/
balance (+ showNegativeInsuranceWarning) xuống `InsuranceTotalPanel`. BlocSelector→BlocBuilder
để reactive theo items. `fvm flutter analyze` 0 error. L2: `Tracking/WAVE01/verify/BUG-W01-277.verify.md`.
