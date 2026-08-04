---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-18"
wave: "W02"
boundary: "gf-accounting"
---

# Implementation Checklist — W02 · gf-accounting

> Generate bởi orchestrator TRƯỚC `/spawn-dev gf-accounting`, từ `docs/Product/wave-02-tasks.md` +
> `Product/features/FEAT-INS-STL-CREATE.md` + `FEAT-INS-DOSSIER-CREATE.md` + `FEAT-INS-DOSSIER-VIEW.md` +
> ACs + `BR-EP-INSURANCE-SETTLEMENT` + `ADR-016 v11` + 3 CR APPROVED (CR-20260612-01 + CR-20260616-01 + CR-20260618-01) +
> `.harness/_REVIEW-CHECKLIST.md`. **Lead boundary** (anchor settlement + dossier — Phase A ~6h + Phase B ~16h).

## Tasks — Phase A: Settlement create + CR adjustments (~6h)

- [x] T1 **A1 FEAT-INS-STL-CREATE** — extend response màn Tạo phiếu QT trả block `insuranceAdjustment` read-only (breakdownByPayer + 5 khoản adjustments + settlementBalance); tái dùng logic tính server-side W01 (BR-INS-STL-CRE-003), KHÔNG tính lại. Trường "Tổng tiền bảo hiểm trả" read-only = computed (CNF-INS-001). Extend màn production, KHÔNG rebuild · scope:`src/main/java/**/adapter/controller/**`,`src/main/java/**/app/service/**`,`src/main/java/**/app/dto/**` · ac:`FEAT-INS-STL-CREATE-AC-6,AC-7` · review:`R1,R19`
- [x] T2 Khi xác nhận tạo phiếu QT → snapshot block phân bổ vào cặp phiếu QT (CUSTOMER+INSURANCE atomic, reuse pattern W01); persist `insurance_adjustment_snapshot` JSON column hoặc 5 scalar col theo BR-INS-STL-CRE-007 · scope:`src/main/java/**/app/service/**`,`src/main/java/**/domain/model/Settlement*.java` · ac:`FEAT-INS-STL-CREATE-AC-7` · review:`R1,R5`
- [x] T3 **A2 CR-20260612-01** — panel chi tiết phiếu QT tách per-payer: response endpoint `GET /api/v1/settlements/{code}` extend cờ `soHasInsurance` + breakdown per-payer (3 khoản chuyển KH cho phiếu KH có BH, ẩn 2 khoản CK liên kết BH; phiếu BH chỉ 1 cột BH thanh toán) · scope:`src/main/java/**/adapter/controller/**`,`src/main/java/**/app/dto/**` · ac:`FEAT-INS-STL-DETAIL-AC-6`,`BR-INS-STL-DET-009` · review:`R1,R19`
- [x] T4 **A3 CR-20260616-01 — OWNER template QT** — update `SettlementPrintStrategy` (common-printing): 2 template variant `settlement-insurance.html` (5 khoản dấu −) + `settlement-customer.html` (3 khoản dấu +, ẩn 2 CK liên kết BH per chốt 2026-06-16); render context = `settlement_records` + `breakdownByPayer` từ `for-print` (gf-sales extend) — KHÔNG gọi gf-sales template; SO không BH giữ template baseline · scope:`src/main/resources/templates/settlement/**`,`src/main/java/**/printing/SettlementPrintStrategy.java` · ac:`FEAT-INS-STL-DETAIL-AC-6`,`CR-20260616-01` · review:`R1,R18`
- [x] T5 **Golden test** template QT: 2 file pass khớp mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html` · scope:`src/test/java/**/SettlementPrintStrategyIT.java`,`src/test/resources/golden/print-{insurance,customer}.html` · ac:`CR-20260616-01` · review:`R17,R18`
- [x] T6 **A6 CR-20260618-01** — sửa logic sinh phiếu QT từ SO: điều kiện sinh phiếu QT KH = (a) có phụ tùng/dịch vụ KH chi trả HOẶC (b) `Khấu trừ BH + Khấu hao + Giảm trừ > 0`. Case "BH 100% + KH chịu phân bổ" sinh 2 phiếu (QT BH đầy đủ + QT KH "chỉ phân bổ BH" 3 khoản dấu +, KHÔNG dòng dịch vụ/phụ tùng); Tổng QT KH = tổng 3 khoản. KHÔNG re-evaluate phiếu QT cũ · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**` · ac:`CR-20260618-01`,`BR-INS-STL-CRE-008` · review:`R1,R5`
- [x] T7 Validation Phase A: VLD-INS-SO-006 mode → `400 INVALID_ALLOCATION_MODE` (carry-over W01); breakdown/amount ≥ 0; reject case `Khấu trừ BH + Khấu hao + Giảm trừ < 0` với INS_STL_NEGATIVE_ALLOCATION · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**` · ac:`FEAT-INS-STL-CREATE-AC-14`,`CR-20260618-01` · review:`R14`
- [x] T8 Integration test `InsuranceSettlementCreatePanelIT.java` (snapshot SO → response panel per-payer correct) + `DualVoucherWhenInsuranceCoversAllIT.java` (case BH 100% sinh 2 phiếu) · scope:`src/test/java/**InsuranceSettlementCreate*IT.java` · ac:`FEAT-INS-STL-CREATE-AC-7`,`CR-20260618-01` · review:`R17`

## Tasks — Phase B: Insurance Dossier (~16h) — sau hard gate A→B

- [x] T9 **Entity additive** (ddl-auto=update — KHÔNG Flyway per gf-accounting baseline): `InsuranceDossier` (root, 1-n version) + `InsuranceDossierVersion` (state EXPORTED → REPLACED) + `InsuranceDossierDocument` (4 rows per version: Phiếu QT, Phiếu báo giá, Biên bản nghiệm thu, Giấy ủy quyền) + `InsuranceDossierFile` (1-n file per document, multi-file cho Biên bản + Giấy ủy quyền). Scalar FK only (ADR-009), KHÔNG @ManyToOne cross-boundary · scope:`src/main/java/**/domain/model/InsuranceDossier*.java`,`src/main/java/**/adapter/persistence/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1,AC-2`,`BR-INS-DOSSIER-006` · review:`R1,R11,R8`
- [x] T10 **State machine**: `EXPORTED` (mặc định khi publish) → `REPLACED` (khi version mới publish; bản cũ không unlock, vẫn truy vấn). Implement enum + transition guard · scope:`src/main/java/**/domain/enums/DossierState.java`,`src/main/java/**/app/service/InsuranceDossierService.java` · ac:`FEAT-INS-DOSSIER-CREATE-AC-9`,`BR-INS-DOSSIER-006` · review:`R5,R6`
- [x] T11 **4 endpoint canonical** (gf-accounting-api.md v16 §Dossier): `POST /api/v1/insurance-dossier-documents/quotation-sheet/render-pdf` + `POST /api/v1/insurance-dossier-documents/price-quote/render-pdf` (2 render-pdf reuse `SettlementPrintStrategy`) + `POST /api/v1/insurance-dossier-documents/batch` (batch persist 4 doc + N file với `pdfUrl` object key) + `POST /api/v1/settlements/search` (extend optional filter dossier) · scope:`src/main/java/**/adapter/controller/InsuranceDossier*.java` · ac:`FEAT-INS-DOSSIER-CREATE-AC-3,AC-4,AC-5,AC-6,AC-7,AC-8` · review:`R1,R2,R19`
- [x] T12 **Render PDF server-side** — reuse `common-printing` engine (Apache PDFBox / OpenHTMLtoPDF per ADR-016 quyết định); 2 mẫu auto (Phiếu QT + Phiếu báo giá) bind từ snapshot phiếu QT BH; 2 mẫu upload (Biên bản + Giấy ủy quyền) chỉ persist link object key · scope:`src/main/resources/templates/dossier/**`,`src/main/java/**/printing/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-3,AC-4` · review:`R18`
- [x] T13 **ct-file-storage integration** (per ADR-016 v11): nhận `pdfUrl` object key từ BFF batch persist payload, persist vào `InsuranceDossierFile`. **KHÔNG endpoint render-and-upload** ở gf-accounting; BFF orchestrator chịu trách nhiệm gọi `POST /api/v1/files/upload-files` ct-file-storage. KHÔNG signed URL TTL (FE compose download bằng env domain + pdfUrl) · scope:`src/main/java/**/app/service/InsuranceDossierService.java`,`src/main/java/**/adapter/controller/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-7,AC-8`,`ADR-016 v11` · review:`R2,R10`
- [x] T14 **Validation upload BE-side**: MIME whitelist (`application/pdf` + `image/jpeg` + `image/png`), max 10MB per file, max 4 file per document slot (Biên bản + Giấy ủy quyền multi). Reject với INS_DOSSIER_FILE_INVALID_MIME / INS_DOSSIER_FILE_TOO_LARGE. Virus scan strategy per NEED CONFIRMATION (block wire UX upload nếu chưa chốt) · scope:`src/main/java/**/app/service/**`,`src/main/java/**/adapter/controller/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-10,AC-11`,`BR-INS-DOSSIER-007` · review:`R14`
- [x] T15 **Versioning** (BR-INS-DOSSIER-006): tạo `InsuranceDossierVersion` mới (version+1) khi BH yêu cầu sửa, bản cũ chuyển `REPLACED` nhưng truy vấn được. Tab "Hồ sơ đã xuất" list cả v1+v2 · scope:`src/main/java/**/app/service/InsuranceDossierService.java`,`src/main/java/**/adapter/controller/**` · ac:`FEAT-INS-DOSSIER-VIEW-AC-1,AC-2,AC-3`,`BR-INS-DOSSIER-006` · review:`R5`
- [x] T16 Integration test `InsuranceDossierLifecycleIT.java` (tạo bộ v1 → upload 2 file → publish → tạo v2 độc lập → list v1+v2 đúng state); golden test 2 PDF auto-render khớp mockup HTML · scope:`src/test/java/**InsuranceDossier*IT.java`,`src/test/resources/golden/dossier-{quotation,price-quote}.html` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1,AC-2,AC-3,AC-4`,`FEAT-INS-DOSSIER-VIEW-AC-1,AC-2,AC-3` · review:`R17,R18`
- [x] T17 Cập nhật KG `gf-accounting.knowledge-graph.yaml` (dossier entities + state machine + 4 endpoints) + TenantFilter/OriginTenantId integrity + boundary scan exit 0 · scope:`knowledge-graph.yaml` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1` · review:`R2,R8`

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd services/gf-accounting && JAVA_HOME=<java-21+> ./gradlew build checkstyleMain test jacocoTestReport` pass; coverage ≥ 80%
- [ ] **Hard gate A → B**: Phase A merged + stable 24h staging trước Phase B start (WAVE-SEQUENCE §1.2)
- [ ] 3-in-1 version bump trên artifact chạm (KG + docs)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority | Generated for W02/gf-accounting (FEAT-INS-STL-CREATE + FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW + 3 CR APPROVED). Phase A ~6h + Phase B ~16h. |
