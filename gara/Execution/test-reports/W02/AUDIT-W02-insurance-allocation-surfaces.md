# AUDIT W02 — Insurance "Phân bổ Bảo hiểm" cross-surface (5 khoản × 5 surface × {value, sign})

> **Mục đích**: bắt **mọi** ô sai trong 1 pass cho 5 khoản điều chỉnh BH, trên toàn bộ surface hiển thị, theo 2 chiều **value** (số tiền vs raw %) và **sign** (dấu). Consolidate các bug đã file (004/005/052/053) + surface các gap CHƯA file.
> **Nguồn**: design contracts (gf-accounting-api, INTEG-BFF §4.3.7b, data-models), print mockups `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html`, BR-EP-INSURANCE-SETTLEMENT §7.1/§7.2 + BR-INS-STL-DET-009 + PRINT-INS-001/007, screenshots (BA/PO 2026-06-24), bug records W02.
> **Lưu ý**: design repo NO source — verdict dựa contract + bug evidence + screenshot. Ô `❓` = cần runtime verify (không đủ evidence tĩnh).
> **Author**: agent-test-orchestrator · **Date**: 2026-06-24 · **Scope**: FEAT-INS-STL-DETAIL / STL-CREATE / DOSSIER-CREATE (print reuse)

---

## 1. Truth model

### 1.1 Năm khoản + nguồn `amount`

| # | Khoản | Mode | Số tiền (amount) đúng = |
|---|---|---|---|
| 1 | CK liên kết BH — Vật tư (`discountMaterial`) | PERCENT/AMOUNT | % × Cộng sau VAT vật tư BH |
| 2 | CK liên kết BH — Công dịch vụ (`discountLabor`) | PERCENT/AMOUNT | % × Cộng sau VAT công DV BH |
| 3 | Giảm trừ bồi thường (`claimReduction`) | PERCENT/AMOUNT | % × tổng Cộng sau VAT BH |
| 4 | Khấu hao vật tư/thay mới (`depreciation`) | **per-line %** | Σ(thành tiền phụ tùng BH × % khấu hao dòng) |
| 5 | Khấu trừ bảo hiểm (`insuranceDeductible`) | **AMOUNT** | số tiền nhập (value == amount) |

**VALUE rule (mọi surface)**: luôn hiển thị **số tiền** (amount), KHÔNG raw % (value).

### 1.2 Ba convention DẤU (gốc của lỗi chéo surface)

| Convention | Áp cho | CK Vật tư | CK CDV | Giảm trừ | Khấu hao | Khấu trừ | Nguồn |
|---|---|:--:|:--:|:--:|:--:|:--:|---|
| **Panel** | màn web/mobile detail + SO-edit | − | − | + | + | + | BR §7.1 "Dấu trên panel" |
| **Bản in BH** | `settlement-insurance.html` | − | − | **−** | **−** | **−** | PRINT-INS-001 + mockup |
| **Bản in KH** | `settlement-customer.html` (CK ẩn) | ➖ | ➖ | + | + | + | PRINT-INS-007 + mockup |

> Toán học (BR §7.2): **BH thanh toán = Cộng sau VAT(BH) − cả 5 khoản** → bản in BH all −. **KH thanh toán = Cộng sau VAT(KH) + 3 khoản transfer** → bản in KH 3 khoản +. Panel là view "semantic" (− = chỉ giảm BH; + = chuyển sang KH). ⚠️ **PRINT-INS-007 câu "dấu khớp panel" chỉ đúng cho phiếu KH** — phiếu BH KHÔNG khớp panel.

**API `sign` semantics** (INTEG §490-491): `sign: "-"|"+"`, invariant *"transferToCustomer=true ⟺ sign='+'"*. Web panel **tự derive** dấu (không đọc `sign`); **mobile render `allocation.sign` RAW** (TC-W02-MUI-CR618-01-002).

---

## 2. Ma trận audit (✅ OK · ❌ WRONG-đã-file · ⚠️ INHERIT-upstream · ❓ VERIFY · ➖ N/A)

### A. API detail — `getSettlementByCode` / gf-accounting `GET /api/v1/settlements/{code}`

| Khoản | VALUE | SIGN | Ghi chú |
|---|:--:|:--:|---|
| CK Vật tư | ✅ | ✅ | value 494.950 (BUG-004 computed); sign "-"/transfer=false consistent |
| CK CDV | ✅ | ✅ | value 266.475/242.250; sign "-"/transfer=false consistent |
| Giảm trừ | ✅ | ❓**F2** | value 1.075.476; **sign="-" nhưng transfer=true → vi phạm invariant §491** |
| Khấu hao | ❌ **052** | ❌ **052** | `depreciation = null` khi per-line (header=0) |
| Khấu trừ | ✅ | ❓**F2** | value 100.000; **sign="-" nhưng transfer=true** |

### B. Panel web — garage-web settlement-detail "Phân bổ Bảo hiểm"

| Khoản | VALUE | SIGN | Ghi chú |
|---|:--:|:--:|---|
| CK Vật tư | ✅ | ✅ (−) | screenshot 2026-06-24 |
| CK CDV | ✅ | ✅ (−) | |
| Giảm trừ | ✅ | ✅ (+) | web tự derive dấu (không đọc API `sign`) |
| Khấu hao | ⚠️ **052** | ✅ (+) | settlement-detail đọc API → inherit 052 null; *(SO-edit panel realtime = OK)* |
| Khấu trừ | ✅ | ✅ (+) | |

### C. Panel mobile — garage-mobile `InsuranceSettlementDetailScreen` — **RUNTIME CONFIRMED 2026-06-24 (phiếu KH)**

> Screenshot phiếu KH có BH (Tổng 13.053.019đ): Giảm trừ −1.075.476đ, Khấu hao 0đ, Khấu trừ −100.000đ. Phiếu KH dấu phải all +.

| Khoản | VALUE | SIGN | Ghi chú |
|---|:--:|:--:|---|
| CK Vật tư | ➖ | ➖ | ẩn trên phiếu KH (như bản in KH) |
| CK CDV | ➖ | ➖ | ẩn |
| Giảm trừ | ✅ | ❌ **054/055** | value 1.075.476 đúng; **dấu − (phải +)** — render `sign` raw |
| Khấu hao | ❌ **052** | — | **0đ** (phải 323.076) — inherit 052; dấu moot khi =0 |
| Khấu trừ | ✅ | ❌ **054/055** | value 100.000 đúng; **dấu − (phải +)** |

> *(Phiếu BH mobile chưa có screenshot — value/sign vẫn ❓ VERIFY; suy đoán inherit 052 + render sign theo BH convention.)*

### D. Bản in BH — `settlement-insurance.html` (PRINT-INS-001, dấu phải all −)

| Khoản | VALUE | SIGN | Ghi chú |
|---|:--:|:--:|---|
| CK Vật tư | ❌ **053-A** | ✅ (−) | print -10 (raw %) |
| CK CDV | ❌ **053-A** | ✅ (−) | print -5 (raw %) |
| Giảm trừ | ❌ **053-A** | ❌ **053-B** | print +10 → phải số tiền **và** dấu − |
| Khấu hao | ✅ (005) | ❌ **053-B** | value OK; **dấu + → phải −** |
| Khấu trừ | ✅ | ❌ **053-B** | value OK; **dấu + → phải −** |

### E. Bản in KH — `settlement-customer.html` (PRINT-INS-007, 3 khoản dấu +, CK ẩn)

| Khoản | VALUE | SIGN | Ghi chú |
|---|:--:|:--:|---|
| CK Vật tư | ➖ | ➖ | ẩn trên phiếu KH |
| CK CDV | ➖ | ➖ | ẩn |
| Giảm trừ | ❌ **053-A** | ✅ (+) | print +10 (raw %) → phải số tiền |
| Khấu hao | ✅ | ✅ (+) | |
| Khấu trừ | ✅ | ✅ (+) | |

---

## 3. Findings

### 3.1 Đã file (consolidate)

| ID | Surface×Khoản×Dim | Status |
|---|---|---|
| BUG-W02-004 | A · all · value compute (raw % → money) | VERIFIED |
| BUG-W02-005 | D · Khấu hao · value | VERIFIED |
| BUG-W02-052 | A · Khấu hao · value (= null khi per-line) | OPEN |
| BUG-W02-053-A | D/E · CK Vật tư+CDV+Giảm trừ · **value** (raw %) | OPEN |
| BUG-W02-053-B | D · Giảm trừ+Khấu hao+Khấu trừ · **sign** (+ → −) | OPEN |

### 3.2 MỚI — chưa file

| ID | Mô tả | Surface | Severity | Trạng thái |
|---|---|---|---|---|
| **F1** | Panel **mobile** "Phân bổ Bảo hiểm" — phiếu KH render dấu − (phải +) + Khấu hao 0đ (inherit 052). **RUNTIME CONFIRMED 2026-06-24** (screenshot). | C | **P2** | **FILED BUG-W02-054** (CONFIRMED) |
| **F2** | API `getSettlementByCode` field **`sign`** = "-" cho khoản transfer (Giảm trừ/Khấu trừ) dù `transferToCustomer=true` → **vi phạm invariant §491**. Web tự derive (OK) nhưng **mobile render raw → sai dấu** (đã confirm qua F1 screenshot). Cross-surface divergence (web≠mobile). | A→C | **P2** | **FILED BUG-W02-055** (downstream confirmed) |
| **F3** | Web **settlement-detail** panel Khấu hao inherit 052 (≠ SO-edit realtime panel). | B | — | track dưới 052 |
| **F4** | **(ngoài matrix 5 khoản)** Dossier "Phiếu quyết toán" preview (mobile) — bảng "Dịch vụ thực hiện" + "Phụ tùng sử dụng" liệt kê **cả hạng mục payer=KH** (phải BH-only) + "Tổng thanh toán" = tổng all (phải = BH payment). Vi phạm AC-4 / BR-INS-STL-CRE-002 / PRINT-INS-001. **CONFIRMED 2026-06-24** (screenshot). | Dossier QT preview (mobile) | **P1** | **FILED BUG-W02-059** |

### 3.3 Coverage gaps (test)

- **Print value**: không TC nào assert 3 khoản PERCENT (CK Vật tư/CDV/Giảm trừ) = monetary trên bản in (053-A gap). `TC-W02-E2E-A03/A04` chỉ assert Khấu hao.
- **Print sign**: không TC nào assert dấu per-convention (BH all − / KH all +) (053-B gap).
- **Golden `SettlementPrintGoldenRenderIT`**: blocklist chỉ `-20/-50/+20/+50` (% khấu hao fixture) → không bắt `-10/-5/+10` + không assert dấu.
- **Mobile panel**: không TC assert value=amount + sign-per-settlement-type real (F1).
- **API sign**: không TC assert invariant §491 (`sign` ⟺ `transferToCustomer`) (F2).

---

## 4. Khuyến nghị — fix 1 lần (không vá lẻ)

| Owner | Hành động | Đóng |
|---|---|---|
| agent-fix-gf-accounting | `SettlementService.computeDepreciationAmount` = Σ per-line + snapshot per-line vào `settlement_records` | 052, A.Khấu hao, D/E.Khấu hao value, ⚠️ B/C inherit |
| agent-fix-gf-accounting | `SettlementPrintDataBuilder.buildInsuranceAllocation`: (a) 3 khoản PERCENT → monetary (như đã làm cho depreciation), (b) dấu theo `settlementType` (INSURANCE→all −, CUSTOMER→all +), KHÔNG theo `transferToCustomer` | 053-A, 053-B |
| agent-fix-gf-accounting + BFF | Chuẩn hoá field `sign` getSettlementByCode theo invariant §491 / convention; HOẶC document rõ "consumer phải derive, KHÔNG đọc `sign`" | F2 |
| agent-fix-garage-mobile | Map settlement-detail panel: render `amount` + dấu đúng convention màn (không render `sign` raw nếu API sign chưa chuẩn) | F1 |
| agent-test-* | Thêm assertion **value + sign** per surface (API/web/mobile/print BH/print KH); mở rộng golden IT (value 3 khoản + dấu); thêm mobile panel TC | gaps §3.3 |
| Business Authority | Reconcile câu chữ PRINT-INS-007 "dấu khớp panel" (chỉ áp phiếu KH; phiếu BH = all −) | spec drift |

---

## 5. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-24 | 1 | agent-test-orchestrator | Initial cross-surface audit (5 khoản × 5 surface × {value,sign}); consolidate BUG-004/005/052/053; surface F1 (mobile panel), F2 (API sign), F3 (web detail inherit). |
| 2026-06-24 | 2 | agent-test-orchestrator | F1+F2 filed → BUG-W02-054 (mobile) + BUG-W02-055 (API sign). **Runtime CONFIRMED** qua screenshot mobile phiếu KH (Giảm trừ −1.075.476đ/Khấu trừ −100.000đ dấu sai phải +; Khấu hao 0đ inherit 052). Matrix C·Mobile cập nhật ❓→❌ CONFIRMED + cross-ref 052/054/055 verdict logs. |
