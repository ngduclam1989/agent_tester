# BUGFIX-BUG-W02-085 — "Tổng thanh toán" chỉ hiện 1 bên, thiếu cộng BH + KH

> L3 sửa lỗi cho `BUG-W02-085` (P2). Boundary: `garage-mobile`. Feature: `FEAT-INS-SO-ADJUSTMENT`.
> Trạng thái: ĐÃ CHẨN ĐOÁN trên **source HEAD hiện hành** (re-verify sau khi panel bị rework — subagent đọc bản stale nên kết luận "không tái hiện" SAI). Diff apply-ready, build/lint/test DEFERRED.
> ⚠️ KHÔNG cập nhật `Tracking/WAVE02/BUGS.md` (orchestrator giữ — theo yêu cầu phiên này).

## 1. Root cause (current HEAD — REAL, tái hiện được)

`lib/ui/service_order/insurance/widgets/insurance_total_panel.dart` :: `_buildTotalCard()` (dòng 251-265):
card "Tổng thanh toán" render giá trị **theo bên đang xem**, KHÔNG phải tổng:

```dart
Text(
  formatVNCurrency(
    viewCustomerSide ? _balance.customerPayment : _balance.insurancePayment,   // ← SAI: 1 bên
    hasSymbol: true,
  ),
  ...
)
```

→ SO Edit mặc định `viewCustomerSide = true` → card hiện `customerPayment` (vd 16.948.165) =
**đúng số BA báo**. Đáng lẽ "Tổng thanh toán" = `insurancePayment + customerPayment` (BR §7.1,
worked example 197.680.000 + 35.720.000 = 233.400.000).

Model đã có sẵn `SettlementBalance.totalPayment` = `insurance + customer`
(`insurance_allocation_models.dart:253` calculator + SO Detail snapshot dòng 470-473) → chỉ cần dùng nó.

(Lưu ý: trước rework, card đã từng dùng `_balance.totalPayment` đúng; commit rework đổi sang per-side → regression.)

## 2. Fix (current HEAD — 1 dòng, shared panel)

File: `mobile/gf-garage-app/lib/ui/service_order/insurance/widgets/insurance_total_panel.dart`

```diff
@@ _buildTotalCard
           Text(LocaleKeys.settlement_panel_total_payment_label.tr(), style: AppTextStyle.textHeadingH5),
           Text(
-            formatVNCurrency(viewCustomerSide ? _balance.customerPayment : _balance.insurancePayment, hasSymbol: true),
+            formatVNCurrency(_balance.totalPayment, hasSymbol: true),
             style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textActivePrimary),
           ),
```

> Card này nhãn "Tổng thanh toán" → phải là TỔNG (không lật theo tab). `_buildCanThanhToan()` (dòng 215)
> mới là chỗ hiển thị theo-bên ("Cân thanh toán") — KHÔNG đụng.

## 3. Blast radius

- Shared panel → fix phủ luôn `BUG-W02-088` (Tạo phiếu QT, qua `InsuranceSettlementDetailView` → `InsuranceTotalPanel`).
- Mọi caller (SO Detail, SO Edit, Settlement Detail/Create, Confirmation): card "Tổng thanh toán" → tổng BH+KH (đúng nhãn). Contract impact: NONE.

## 4. Regression test

Thêm vào `test/ui/service_order/insurance/` (widget test):
- `SettlementBalance(insurancePayment: 197680000, customerPayment: 35720000, totalPayment: 233400000)`.
- Pump `InsuranceTotalPanel(balance: …)` với `viewCustomerSide=true` và `false`.
- Assert card "Tổng thanh toán" = `233.400.000` ở CẢ 2 tab (không lật, không = customerPayment).
- Unit: `InsuranceAllocationCalculator.balance(...).totalPayment == insurance + customer`.

## 5. Áp dụng (interactive mobile session)

Tại root `mobile/gf-garage-app/`: áp diff §2 + test §4 → `fvm flutter analyze` + `fvm flutter test` (FAIL trước → PASS sau). Cập nhật BUGS.md do orchestrator/QA.

## 6. Cập nhật (2026-06-25 v2) — "Tổng thanh toán" TYPE-AWARE theo loại chứng từ (BA chốt)

BA làm rõ: card "Tổng thanh toán" có ngữ nghĩa KHÁC theo loại chứng từ → KHÔNG luôn `totalPayment`:
- **Phiếu dịch vụ (SO)** — SO Edit/Detail/Confirmation dùng `InsuranceTotalPanel` trực tiếp → `totalPayment` (giữ nguyên fix §2, không đổi outcome).
- **Phiếu quyết toán** — qua `InsuranceSettlementDetailView` theo `lockToCustomerSide`/settlementType:
  - phiếu BH (`lockToCustomerSide == false`) → `insurancePayment`
  - phiếu KH (`lockToCustomerSide == true`) → `customerPayment`
  - Tạo combined (`lockToCustomerSide == null`) → `totalPayment` (giữ BUG-088)

Cách làm: thêm param `double? totalPaymentDisplay` vào `InsuranceTotalPanel` (`_buildTotalCard` dùng `totalPaymentDisplay ?? _balance.totalPayment`); `InsuranceSettlementDetailView` tự suy theo `lockToCustomerSide` rồi truyền vào. SO callers omit → fallback `totalPayment` (085 không hồi quy). File: `insurance_total_panel.dart` + `insurance_settlement_detail_view.dart`. Test: `test/ui/settlement/insurance_total_payment_by_doc_type_test.dart` (5 test, finder card phải scope theo Row vì phiếu type-specific trùng số với dòng "Cân thanh toán").

## Change Log

| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | orchestrator (re-verify HEAD) | Re-verify trên source hiện hành: `_buildTotalCard` hiện render per-side (regression từ rework) → fix dùng `_balance.totalPayment`. Phủ 088. (Đảo kết luận "non-repro" của subagent — bản subagent đọc đã stale.) |
| 2026-06-25 | 2 | agent-fix-garage-mobile (BA chốt) | Total card TYPE-AWARE: param `totalPaymentDisplay`; SO=totalPayment, phiếu QT type-specific (BH→insurancePayment, KH→customerPayment), Tạo=totalPayment. Tinh chỉnh §2 (không còn "luôn totalPayment" cho mọi caller). |
