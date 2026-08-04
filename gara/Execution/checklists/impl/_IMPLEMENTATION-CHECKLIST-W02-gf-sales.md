---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-18"
wave: "W02"
boundary: "gf-sales"
---

# Implementation Checklist — W02 · gf-sales

> Generate bởi orchestrator TRƯỚC `/spawn-dev gf-sales`, từ `docs/Product/wave-02-tasks.md` +
> `Product/features/FEAT-INS-SO-ADJUSTMENT.md` (W02 popup retrofit) + `FEAT-INS-STL-CREATE.md` (for-print support) +
> ACs + 3 CR APPROVED (CR-20260612-02 + CR-20260618-02 + CR-20260616-01 support) +
> `.harness/_REVIEW-CHECKLIST.md`. **Phase A only** (~6h) — no Phase B work.

## Tasks — Phase A: Settlement adjustments support (~6h)

- [x] T1 **A4 CR-20260612-02** — extend popup "Hoàn thành phiếu dịch vụ" (FEAT-SO-DETAIL AC-16): thêm dòng cảnh báo khi Tổng "Bảo hiểm thanh toán" < 0 với `ERR-INS-003` (warn-and-allow, KHÔNG chặn). Response endpoint complete SO trả giá trị `insurancePayment` computed + flag `negativeInsuranceWarn` cho FE/BFF render · scope:`src/main/java/**/adapter/controller/ServiceOrder*Controller.java`,`src/main/java/**/app/service/ServiceOrderCompleteService.java` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-17`,`BR-INS-SO-ADJ-010`,`CR-20260612-02` · review:`R1,R19`
- [x] T2 Compute giá trị "Bảo hiểm thanh toán" inline (reuse logic W01 BR-EP §7.2 — KHÔNG tính lại); 3 case test: BH > 0 không warn / BH = 0 không warn / BH < 0 warn-and-allow · scope:`src/main/java/**/app/service/**`,`src/test/java/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-17`,`BR-INS-SO-ADJ-010` · review:`R5,R17`
- [x] T3 **A7 CR-20260618-02 — OWNER template PDV** — update `ServiceOrderPrintStrategy` V3 (common-printing): extend template `service-order-v3.html` baseline thêm section "Phân bổ bảo hiểm" 5 khoản × 2 cột (BH dấu − / KH dấu + hoặc 0) — 5 khoản: CK liên kết BH - Vật tư, CK liên kết BH - Công dịch vụ, Giảm trừ bồi thường, Khấu hao vật tư-thay mới, Khấu trừ BH · scope:`src/main/resources/templates/service-order/service-order-v3.html`,`src/main/java/**/printing/ServiceOrderPrintStrategy.java` · ac:`CR-20260618-02` · review:`R18`
- [x] T4 Template PDV — thay 1 dòng "Tổng thanh toán" baseline → khối "Cần thanh toán" 3 dòng: `Bảo hiểm thanh toán` + `Khách hàng thanh toán` + `Tổng thanh toán` (bold). Dòng "bằng chữ" bám **Khách hàng thanh toán** (KH chỉ trả phần KH) · scope:`src/main/resources/templates/service-order/service-order-v3.html` · ac:`CR-20260618-02` · review:`R18`
- [x] T5 Template PDV — **conditional** theo cờ `has_insurance`: SO không BH giữ baseline 1 dòng "Tổng thanh toán" + KHÔNG section phân bổ. Render context: SO entity + `service_order_part` (line items `is_deleted=false`) + computed snapshot `breakdownByPayer` 5 khoản (server-side, đã có W01) · scope:`src/main/java/**/printing/ServiceOrderPrintStrategy.java` · ac:`CR-20260618-02` · review:`R18`
- [x] T6 **Golden test** template PDV khớp `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-service.html` mockup: 2 case (SO có BH → 5 khoản + 3 dòng / SO không BH → baseline) · scope:`src/test/java/**/ServiceOrderPrintStrategyIT.java`,`src/test/resources/golden/print-service.html` · ac:`CR-20260618-02` · review:`R17,R18`
- [x] T7 **A3 support CR-20260616-01** — extend response `GET /protected/v1/service-orders/{tenantId}/{code}/for-print`: thêm field `breakdownByPayer` per-payer 5 khoản (input cho gf-accounting `SettlementPrintStrategy`). Additive — KHÔNG breaking; SO không BH vẫn trả response baseline · scope:`src/main/java/**/adapter/controller/ServiceOrderForPrintController.java`,`src/main/java/**/app/dto/ForPrintResponse.java` · ac:`CR-20260616-01`,`FEAT-INS-STL-CREATE-AC-6` · review:`R1,R19`
- [x] T8 Idempotent: `for-print` gọi nhiều lần cùng SO trả cùng snapshot (carry-over W01 design); test verify · scope:`src/main/java/**/app/service/**`,`src/test/java/**` · ac:`CR-20260616-01` · review:`R5,R17`
- [x] T9 Contract test cross-boundary: gf-accounting consume `for-print` extend response shape khớp common-printing context schema — verify field name + nullability không siết · scope:`src/test/java/**/ForPrintContractIT.java` · ac:`CR-20260616-01` · review:`R17`
- [x] T10 Cập nhật KG `gf-sales.knowledge-graph.yaml` (popup warn + PDV template extension + for-print extend) + TenantFilter/OriginTenantId integrity + boundary scan exit 0 · scope:`knowledge-graph.yaml` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-17`,`CR-20260618-02` · review:`R2,R8`

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd services/gf-sales && JAVA_HOME=<java-21> ./gradlew build checkstyleMain test jacocoTestReport` pass; coverage ≥ 80%
- [ ] Phase A merged + stable 24h staging trước Phase B start (gate cho gf-accounting Phase B — WAVE-SEQUENCE §1.2)
- [ ] 3-in-1 version bump trên artifact chạm (KG + docs)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority | Generated for W02/gf-sales (FEAT-INS-SO-ADJUSTMENT popup retrofit + FEAT-INS-STL-CREATE for-print support + 3 CR APPROVED). Phase A only ~6h. |
