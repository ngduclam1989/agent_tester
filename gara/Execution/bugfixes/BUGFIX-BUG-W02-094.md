# BUGFIX-BUG-W02-094 — Preview Phiếu quyết toán BH: "Tổng thanh toán" bind nhầm field (trước khi trừ phân bổ)

> L3 sửa lỗi cho `BUG-W02-094` (P2, cân nhắc P1 — chứng từ gửi DN bảo hiểm). Boundary: `garage-mobile`. Feature: `FEAT-INS-DOSSIER-CREATE`.
> Trạng thái: ĐÃ CHẨN ĐOÁN **trực tiếp trên HEAD** (orchestrator self-read). Build/lint/test DEFERRED cho phiên `mobile/gf-garage-app/` tương tác.
> ⚠️ KHÔNG cập nhật `Tracking/WAVE02/BUGS.md` (orchestrator giữ — theo yêu cầu phiên này).

## 1. Root cause (HEAD)

`lib/ui/insurance_dossier/pages/dossier_settlement_sheet_page.dart` dòng **133-136**:
hàng "Tổng thanh toán" (`_TotalRow`) bind `settlement?.totalInsuranceAmount`:

```dart
_TotalRow(
  label: LocaleKeys.insuranceDossier_tableGrandTotal.tr(),
  amount: settlement?.totalInsuranceAmount ?? 0,   // ← SAI cho phiếu BH
),
```

`totalInsuranceAmount` (`settlement_extensions.dart:114`) = `totalInsuranceServiceAmount +
totalInsurancePartAmount` = tổng DV+PT bảo hiểm **TRƯỚC** khi trừ 5 khoản phân bổ (≈ Cộng sau VAT BH,
= 35.080.900). Ngay phía trên, section "Phân bổ Bảo hiểm" đã liệt kê 5 khoản dấu `−` (đang TRỪ) →
"Tổng thanh toán" lấy số TRƯỚC trừ ⇒ mâu thuẫn nội bộ, thổi phồng số claim.

Đúng phải = `insurancePayment` (`settlement_detail_response.dart:63`) = BH thanh toán **SAU** khi
trừ phân bổ. (Cùng defect web `BUG-W02-074`; field đúng do BA chỉ định: "lấy data từ insurancePayment".)

## 2. Fix (HEAD)

File: `mobile/gf-garage-app/lib/ui/insurance_dossier/pages/dossier_settlement_sheet_page.dart`

```diff
@@ dòng 133-136 (_TotalRow "Tổng thanh toán")
             _TotalRow(
               label: LocaleKeys.insuranceDossier_tableGrandTotal.tr(),
-              amount: settlement?.totalInsuranceAmount ?? 0,
+              amount: settlement?.settlementType == SettlementType.insurance
+                  ? (settlement?.insurancePayment ?? 0)
+                  : (settlement?.totalInsuranceAmount ?? 0),
             ),
```

- Chỉ đổi nhánh phiếu BH (`SettlementType.insurance`) → `insurancePayment` (sau phân bổ).
- Nhánh phiếu KH (else, hiện cũng dùng `totalInsuranceAmount`) GIỮ NGUYÊN — ngoài scope 094 (BA chỉ flag phiếu BH). `SettlementType` đã import sẵn (dòng 3).

## 3. Blast radius

- Chỉ surface preview "Phiếu quyết toán" trong Tạo hồ sơ bảo hiểm (1 page). Contract impact: NONE (BE đã trả `insurancePayment`).
- ⚠️ Cascade quan sát (KHÔNG fix ở đây): bản **PDF in thật** (gf-accounting template) + preview "Phiếu báo giá" có bind cùng field sai không → verify riêng; nếu PDF sai → escalate `agent-fix-gf-accounting`.

## 4. Regression test
- Seed settlement `settlementType=insurance`, `totalInsuranceAmount=35080900`, `insurancePayment=27410045` (sau trừ 5 khoản).
- Assert "Tổng thanh toán" hiện `insurancePayment` (27.410.045), KHÔNG phải 35.080.900.
- Phiếu `settlementType=customer`: không hồi quy (giữ giá trị cũ).

## 5. Áp dụng (interactive mobile session)
Tại root `mobile/gf-garage-app/`: áp diff §2 + test §4 → `fvm flutter analyze` + `fvm flutter test` (FAIL trước → PASS sau). Cập nhật BUGS.md do orchestrator/QA.

## Change Log
| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | orchestrator (self-read HEAD) | "Tổng thanh toán" preview Phiếu QT BH bind `totalInsuranceAmount` (trước trừ) → fix `insurancePayment` (sau trừ), chỉ nhánh insurance. Counterpart mobile của BUG-074. |
