---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 3
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-10"
wave: "W01"
boundary: "garage-web"
---

# Implementation Checklist — W01 · garage-web

> Generate bởi orchestrator TRƯỚC `/spawn-dev garage-web`, từ `docs/Product/wave-01-tasks.md` +
> FEAT-INS-SO-ADJUSTMENT/STL-DETAIL ACs + **PKG §2.4 DEV Playbook (Bước 0→6)** + INTEG-FE §3.4b +
> `.harness/_REVIEW-CHECKLIST.md`. UI trên design system hiện hữu (KHÔNG V3).

## Tasks

- [x] T1 **Reuse-first/inventory gate** (Bước 1): search KG `implementation.components` + `src/components/{share,ui,customs}` theo functional keyword; reuse/extend; CHỈ dựng mới khi inventory xác nhận thiếu · scope:`knowledge-graph.yaml` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-1` · review:`R4`
- [x] T2 Dựng `currency-input` wrapper (format VND, parse, mode %/số tiền) + đăng ký KG · scope:`src/components/**/currency-input.tsx` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-7` · review:`R3,R4`
- [x] T3 `<InsuranceAllocationSection>` render trên **SO Edit + SO Detail**, ẩn ở SO Create (AC-0); dùng `Show` cho conditional · scope:`src/features/insurance-allocation/components/InsuranceAllocationSection.tsx` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-0,AC-1` · review:`R2,R3`
- [x] T4 3 toggle %/số tiền (CK liên kết VT, CK liên kết CDV, Giảm trừ bồi thường) + input số Khấu trừ BH + input % per dòng phụ tùng (Khấu hao) · scope:`src/features/insurance-allocation/components/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-5,AC-5b,AC-7` · review:`R3`
- [x] T5 Realtime preview "BH thanh toán" / "KH thanh toán" / "Tổng" (BR-EP §7.2; client preview, server authoritative); debounce + memoize (50+ line) · scope:`src/features/insurance-allocation/hooks/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-8,AC-9,AC-11` · review:`R3`
- [x] T6 `<InsuranceSettlementDetailPage>` 4 tab (Chi phí + panel "Tổng giá dịch vụ" / Hồ sơ BH placeholder W02 / Chứng từ placeholder / Lịch sử thanh toán) + header + panel phân bổ + Còn phải thu BH · scope:`src/features/insurance-settlement/components/detail/**`,`src/routes/**` · ac:`FEAT-INS-STL-DETAIL-AC-4,AC-5,AC-9` · review:`R3,R4`
- [x] T7 Nút "+ Tạo hồ sơ bảo hiểm" hiển thị nhưng **disabled** + tooltip "Sẽ available ở W02" · scope:`src/features/insurance-settlement/components/detail/**` · ac:`FEAT-INS-STL-DETAIL-AC-13` · review:`R3`
- [x] T8 Wire GraphQL: `updateServiceOrderV3` (additive), `getServiceOrderByCode`, `getSettlementByCode`, mutation mới `createInsuranceSettlement` qua `use-query.ts`/`use-mutation.ts`; header propagate · scope:`src/features/insurance-*/hooks/**`,`src/features/insurance-*/schemas/**` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R5,R6`
- [x] T9 Validation messages VLD-INS-SO-003 (%≤100), 004 (số ∈[0,cơ sở]), 006 (mode→400), 005 (BH<0 = warning, vẫn allow save AC-12) · scope:`src/features/insurance-*/schemas/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-12,AC-14` · review:`R6`
- [x] T10 Honor `coverage_gaps` (FEAT thắng Figma, flag drift PR): khấu hao %-only (AC-5), khấu trừ VND-only (AC-7), AC-10 dấu+màu, AC-11 highlight 3 ô, AC-12 BH<0 đỏ; layout đối chiếu Figma Edit (`13257:469505`) + Detail (`13270:206807`) · scope:`src/features/insurance-*/components/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-10,AC-11,AC-12` · review:`R11`
- [x] T11 Đăng ký pages + components mới vào `knowledge-graph.yaml` (gate `/dev-handoff` verify KG changed) · scope:`knowledge-graph.yaml` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-1` · review:`R4,R11`
- [ ] T12 **(FIX CR-1780980611) Bind error theo `code`**: FE đọc `errors[].extensions.code` (KHÔNG parse message) để render toast/field-error/redirect theo registry §5.5 — INS-1002/1003/1004/1005/1008 field-level, `INS_ADJ_BH_PAYMENT_NEGATIVE`(1006) cảnh báo non-block (vẫn lưu), `INS_STL_*` toast/error-state, INS-9001/9002 auth; message lấy theo `code` làm i18n key (không hardcode literal) · scope:`src/features/insurance-*/**`,`src/**/error*/**` · ac:`AC-12`,`STL-DETAIL AC-1` · review:`R11` · ref:`CR-1780980611` (flag #3: FE bind code trước khi BE đảo status)
- [ ] T13 **(FIX BUG-W01-209, gated on CR canonical-shape)** Migrate query `GetServiceOrderByCode` về shape FEAT-INS-SO-ADJUSTMENT §4: (a) BỎ block `insuranceAdjustment.header { hasInsurance, insuranceCompany, insuranceCompanyName, insurancePolicyNumber, assessorName, insuranceContactPhone, insuranceExpiryDate }` (đọc từ root SO detail thay vì nested); (b) đổi `breakdownByPayer.{service,parts,vat,totalAfterVat}.{insurance,customer}` → `.{bh,kh}` (4 metric × 2 payer); (c) thay 4 field flat `settlementBalance.{insurancePayment, customerPayment, totalPayment, insurancePaymentNegative}` bằng `{bhPayment, customerPayment, totalPayment}` + derive `insurancePaymentNegative` client-side (`bhPayment < 0`); (d) thay scalar 5 trường (`discountMaterial`, `discountLabor`, `depreciation`, `claimReduction`, `insuranceDeductible`) bằng array `adjustments [{key,label,mode,value,amount,sign,transferToCustomer}]` + update React component render `<InsuranceSettlementDetailPage>` + `<InsuranceAllocationSection>`. Regression: live test query không bị Apollo reject + TC-W01-API-042 PASS · scope:`src/features/insurance-*/**/use-query.ts`,`src/features/insurance-*/**/types.ts`,`src/features/insurance-settlement/components/detail/**`,`src/features/insurance-allocation/components/**` · ac:`FEAT-INS-SO-ADJUSTMENT-§4` · review:`R5,R6,R11` · ref:`BUG-W01-209` (gated on CR canonical-shape — option A recommended)

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md`; reuse-search evidence + layout-fidelity check
- [ ] `cd frontend/gf-gms-web && yarn build && yarn lint && yarn test --coverage` pass; coverage ≥ 60%
- [ ] Boundary clean (chỉ edit `frontend/gf-gms-web/**`); KG changed vs baseline
- [ ] 3-in-1 version bump KG; prefix `[dev]`

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-07 | 1 | Delivery Authority | Generated for W01/garage-web (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL). |
| 2026-06-09 | 2 | Delivery Authority (CR-1780980611) | +T12 bind error theo `extensions.code` (FIX): không parse message; INS-1006 cảnh báo non-block; message theo code i18n key. Flag #3 (FE bind code trước khi BE đảo status). |
| 2026-06-10 | 3 | agent-test-api (BUG-W01-209) | +T13 (FIX BUG-W01-209, gated on CR) — migrate query `GetServiceOrderByCode.insuranceAdjustment`: bỏ `header` block, đổi breakdown axis `service{insurance,customer}→service{bh,kh}`, đổi `insurancePayment→bhPayment` + derive `insurancePaymentNegative` client-side, thay 5 scalar bằng array `adjustments[]`. Regression: TC-W01-API-042. |
