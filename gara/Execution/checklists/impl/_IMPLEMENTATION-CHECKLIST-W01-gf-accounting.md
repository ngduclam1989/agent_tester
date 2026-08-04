---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 3
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-10"
wave: "W01"
boundary: "gf-accounting"
---

# Implementation Checklist — W01 · gf-accounting

> Generate bởi orchestrator TRƯỚC `/spawn-dev gf-accounting`, từ `docs/Product/wave-01-tasks.md` +
> `Product/features/FEAT-INS-STL-DETAIL.md` ACs + BR-GF-ACCOUNTING-006 + ADR-014 +
> `.harness/_REVIEW-CHECKLIST.md`. Feature: **FEAT-INS-STL-DETAIL**. Lead boundary (anchor W02).

## Tasks

- [x] T1 Mở rộng aggregate `settlement_records` (settlement_type=INSURANCE) thêm **additive** scalar cols: `insurance_policy_no`, 8 adjustment, 8 breakdown (`breakdown_service/parts/vat/total_after_vat _insurance/customer`), `insurance_payable_amount` (**nhận từ request, KHÔNG tự tính**); KHÔNG thêm `insurance_code`/`insurance_company_name`; ddl-auto=update · scope:`src/main/java/**/domain/model/Settlement*.java` · ac:`FEAT-INS-STL-DETAIL-AC-2,AC-3` · review:`R1,R11`
- [x] T2 Tạo phiếu QT BH — **REUSE** `POST /api/v1/service-orders/{id}/settlements` (additive request 8 adjustment + 8 breakdown + `insurancePayableAmount`); **pull** `GET …/for-settlement` từ gf-sales · scope:`src/main/java/**/adapter/controller/**`,`src/main/java/**/adapter/client/**` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R1,R2`
- [x] T3 Persist **cặp settlement CUSTOMER+INSURANCE atomic** qua `related_settlement_code` (CB-INS-004); REST `settle` callback gf-sales (CB-INS-003); **rollback nếu bất kỳ bước fail** (synchronous, KHÔNG saga/Temporal) · scope:`src/main/java/**/app/service/**` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R1,R2,R5`
- [x] T4 Chi tiết phiếu QT BH — **REUSE** `GET /api/v1/settlements/{code}`, response additive block `insurance` + `debtPanel` + 4 tab (Chi phí + panel "Tổng giá dịch vụ" / Hồ sơ BH placeholder W02 / Chứng từ placeholder / Lịch sử thanh toán reuse baseline); KHÔNG endpoint mới · scope:`src/main/java/**/adapter/controller/**`,`src/main/java/**/app/dto/**` · ac:`FEAT-INS-STL-DETAIL-AC-4,AC-5,AC-6,AC-7,AC-8,AC-9` · review:`R1,R19`
- [x] T5 Validation: mode VLD-INS-SO-006 (→ `400 INVALID_ALLOCATION_MODE`) + breakdown/amount ≥ 0 · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**` · ac:`FEAT-INS-STL-DETAIL-AC-2` · review:`R14`
- [x] T6 Integration test `InsuranceSettlementCreateIT.java`: pull `for-settlement` → persist cặp atomic → `settle`; **assert rollback khi settle fail** · scope:`src/test/java/**InsuranceSettlementCreateIT.java` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R17`
- [x] T7 Detail response golden file test (4 tab + panel) · scope:`src/test/java/**` · ac:`FEAT-INS-STL-DETAIL-AC-4` · review:`R17,R18`
- [x] T8 Cập nhật KG `knowledge-graph.yaml` + TenantFilter/OriginTenantId integrity + boundary scan exit 0 · scope:`knowledge-graph.yaml` · ac:`FEAT-INS-STL-DETAIL-AC-2` · review:`R2,R8`
- [ ] T9 **(FIX CR-1780980611 + CR-1781085632) Error-code contract `INS_*`**: luồng Phiếu QT BH emit registry code trực tiếp + đúng status — thay `GMS.gf-accounting.SETTLEMENT_*` (đường insurance): `INS_STL_DUPLICATE_DRAFT`(2003/409), `INS_STL_PAIR_ATOMIC_FAILED`(2005/500), `INS_STL_NOT_FOUND`(2006/404); thêm `INS_STL_COMPANY_REQUIRED`(2002/**400**), `INS_STL_SO_NOT_COMPLETED`(2004/**400**); **mode sai 500 Jackson → 400 `INS_ADJ_MODE_INVALID`** (handler enum, CR-1781085632 đổi 422→400); 'no-insurance-item' giữ internal (flag #2, 422). Add dossier export validation: `INS_DOSSIER_NO_DOC_SELECTED`(3003/400), `INS_DOSSIER_DOCS_INCOMPLETE`(3004/400). Note: CR-1781085632 (2026-06-10) đổi HTTP `422→400` cho 5 mã FE-facing (2002/2004/1008/3003/3004) vì FE/Mobile treat 422 như crash. Registry codes giữ. Update test assert `code`+status · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**`,`src/test/java/**` · ac:`VLD-INS-STL-002,003,004,006`,`STL-DETAIL AC-1` · review:`R14` · bug:`BUG-W01-204/205/206/207`

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd services/gf-accounting && JAVA_HOME=<java-21+> ./gradlew build checkstyleMain test jacocoTestReport` pass; coverage ≥ 80%
- [ ] 3-in-1 version bump trên artifact chạm (KG + docs)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-07 | 1 | Delivery Authority | Generated for W01/gf-accounting (FEAT-INS-STL-DETAIL). |
| 2026-06-09 | 2 | Delivery Authority (CR-1780980611) | +T9 error-code contract `INS_*` (FIX): emit INS_STL_* thay GMS.* (đường insurance); mode 500→422 INS_ADJ_MODE_INVALID; no-insurance-item giữ internal. Bug BUG-W01-204/205/206/207. |
| 2026-06-10 | 3 | agent-test-api (CR-1781085632) | T9 status update: 5 mã FE-facing INS-2002/2004/1008/3003/3004 đổi `422→400` (registry codes giữ); add 2 row dossier validation INS-3003/3004 (400). Internal SETTLEMENT_CREATE.06 giữ 422. Lý do: FE/Mobile error boundary treat 422 như crash. Update unit test assert status=400. Partial-supersedes CR-1780980611 cột HTTP. |
