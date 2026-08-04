---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 3
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-10"
wave: "W01"
boundary: "gf-sales"
---

# Implementation Checklist — W01 · gf-sales

> Generate bởi orchestrator TRƯỚC `/spawn-dev gf-sales`, từ `docs/Product/wave-01-tasks.md` +
> `Product/features/FEAT-INS-SO-ADJUSTMENT.md` ACs + BR-EP-INSURANCE-SETTLEMENT §5/§7 +
> `.harness/_REVIEW-CHECKLIST.md`. DEV maintain như todo; Stop hook chặn handoff khi còn `[ ]`.
> Feature: **FEAT-INS-SO-ADJUSTMENT** · ADR-014 (pull-snapshot, REST-only).

## Tasks

- [x] T1 Thêm 8 scalar adjustment columns vào entity `service_order` (`discount_material_mode/value`, `discount_labor_mode/value`, `depreciation_default_percent`, `claim_reduction_mode/value`, `insurance_deductible_amount`) qua **ddl-auto=update** — KHÔNG Flyway; KHÔNG thêm `insurance_code` (dùng `insurance_company` baseline) · scope:`src/main/java/**/domain/model/ServiceOrder*.java` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-1,AC-2` · review:`R1,R3`
- [x] T2 Thêm `depreciation_percent` (NUMERIC(5,2), NULLABLE — chỉ phụ tùng BH) vào entity `service_order_part`; KHÔNG trên `service_order_item`/công DV · scope:`src/main/java/**/domain/model/ServiceOrderPart*.java` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-5,AC-5b` · review:`R1,R3`
- [x] T3 Inline calc trong SO service hiện hữu: `breakdown_total_after_vat_insurance/customer`, `insurancePayable`, `customerPayable` theo công thức BR-EP §7.2 (KHÔNG tách class riêng) · scope:`src/main/java/**/app/service/*ServiceOrder*Service.java` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-6,AC-7,AC-8,AC-9,AC-10,AC-11` · review:`R1`
- [x] T4 Nhánh single-payer CALC-INS-006: PDV toàn BH → `customerPayable` = Σ khoản chuyển, `breakdownTotalAfterVatCustomer`=0 (không null); PDV toàn KH → KHÔNG bỏ nhánh tính (engine không skip khi nhóm rỗng) · scope:`src/main/java/**/app/service/*ServiceOrder*Service.java` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-14` · review:`R1,R17`
- [x] T5 Validation server-side VLD-INS-SO-003 (% ∈ [0,100]), VLD-INS-SO-004 (số ≥0, ≤ cơ sở; 0 hợp lệ), VLD-INS-SO-006 (mode ∈ {PERCENT,AMOUNT} → `400 INVALID_ALLOCATION_MODE`) · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-14` · review:`R14`
- [x] T6 Extend (additive) `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement` trả 8 scalar breakdown + 8 scalar adjustment fields; **idempotent** (gọi 2 lần cùng SO → cùng snapshot) · scope:`src/main/java/**/adapter/controller/**`,`src/main/java/**/app/dto/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-2` · review:`R2,R19`
- [x] T7 Unit test ≥ 8 case: 5 AC + 2 single-payer (toàn BH / toàn KH) + 1 ví dụ epic §5 (197,680,000 BH / 35,720,000 KH); + test reject số âm / %>100 / mode sai (400), 0 hợp lệ · scope:`src/test/java/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-14` · review:`R17`
- [x] T8 `for-settlement` golden file contract test (khớp ADR-014); verify response shape · scope:`src/test/java/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-2` · review:`R18,R19`
- [x] T9 Cập nhật KG `knowledge-graph.yaml` (entities/fields mới) + verify TenantFilter/OriginTenantId integrity + boundary scan exit 0 · scope:`knowledge-graph.yaml` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-1` · review:`R2,R8`
- [ ] T10 **(FIX CR-1780980611 + CR-1781085632) Error-code contract `INS_*`**: emit registry code trực tiếp + đúng HTTP status (BR-EP §5.5) — `INVALID_ADJUSTMENT_PERCENT`(400)→`INS_ADJ_PERCENT_OUT_OF_RANGE`(**400** per CR-1781085632); `INVALID_ADJUSTMENT_AMOUNT`(400)→`INS_ADJ_AMOUNT_EXCEEDS_BASE`/`INS_ADJ_VALUE_NEGATIVE`(**400**); `INVALID_ALLOCATION_MODE`(400)→`INS_ADJ_MODE_INVALID`(**400**); thêm `INS_SO_COMPANY_REQUIRED`(**400**); **BH thanh toán < 0: reject 400 → warning 200 non-block `INS_ADJ_BH_PAYMENT_NEGATIVE`**. Note: CR-1781085632 (2026-06-10) đổi HTTP `422→400` cho 5 mã VALIDATION (FE/Mobile treat 422 như crash). Registry codes giữ. Update unit test assert `code`+status · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**`,`src/test/java/**` · ac:`VLD-INS-SO-002,003,004,006`,`AC-12` · review:`R14` · bug:`BUG-W01-201/202/203/204/208`

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd services/gf-sales && JAVA_HOME=<java-21> ./gradlew build checkstyleMain test jacocoTestReport` pass; coverage ≥ 80%
- [ ] 3-in-1 version bump trên artifact chạm (KG + docs)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-07 | 1 | Delivery Authority | Generated for W01/gf-sales (FEAT-INS-SO-ADJUSTMENT). |
| 2026-06-09 | 2 | Delivery Authority (CR-1780980611) | +T10 error-code contract `INS_*` (FIX): emit registry code + đúng status; mode 400→422; %/amount 400→422; BH<0 reject→warning 200. Drive per-service FIX (BUG-W01-201/202/203/204/208). |
| 2026-06-10 | 3 | agent-test-api (CR-1781085632) | T10 status update: 5 mã VALIDATION INS-1002/1003/1004/1005/1008 đổi `422→400` (registry codes giữ). Lý do: FE/Mobile error boundary treat 422 như crash. Update unit test assert status=400 cho 5 mã. Partial-supersedes CR-1780980611 cột HTTP. |
