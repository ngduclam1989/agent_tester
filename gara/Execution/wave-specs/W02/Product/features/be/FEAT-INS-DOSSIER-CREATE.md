---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-INS-DOSSIER-CREATE.md"
source_version: 21
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-DOSSIER-CREATE"
source_feat_sha: "f04a51b87f035716574cecbd812eef3984b04d20458c4c82e48556cf25284eb0"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán mở modal Hồ sơ BH từ phiếu QT BH → điền biên bản nghiệm thu + giấy ủy quyền → bấm Xuất → BE render PDF ③④, persist batch atomic (INSERT vN+1 + UPDATE vN REPLACED) → trả {dossierId, versionNo}"
consumes_contracts:
  - "POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf (self)"
  - "POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf (self)"
  - "POST /api/v1/insurance-dossier-documents/batch (self)"
  - "POST /api/v1/insurance-dossiers/search (self)"
paired_bff_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_fe_web_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_mobile_feats: ["FEAT-INS-DOSSIER-CREATE"]
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "6b792ef863798bfeaf280cfcf512725585c8164268c876c44a1d185f44f44a0a"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-CREATE.be.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-CREATE (BE): Tạo bộ hồ sơ bảo hiểm — backend gf-accounting

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-CREATE` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 |
| Status | DRAFT |
| Demo signature | Kế toán xuất PDF ③④ → batch persist atomic vN+1 → `{dossierId, versionNo}` trả BFF |
| Cross-tier pair | BFF: `FEAT-INS-DOSSIER-CREATE` \| Web: `FEAT-INS-DOSSIER-CREATE` \| Mobile: `FEAT-INS-DOSSIER-CREATE` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/features/FEAT-INS-DOSSIER-CREATE.md) |
| Source version | v21 |
| Source SHA | `6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` |
| Generated at | 2026-06-18T01:05:38+00:00 |

---

## 1. Mục đích nghiệp vụ

Kế toán cần lập và xuất bộ hồ sơ bảo hiểm chuẩn (4 tài liệu) trực tiếp trong hệ thống thay vì thao tác ngoài Excel, nhằm gửi đầy đủ giấy tờ cho doanh nghiệp bảo hiểm ngay lần đầu. Feature cho phép kế toán xem trước từng tài liệu, điền nội dung vào template ③④, tích chọn tài liệu cần xuất, và nhận PDF sẵn sàng gửi BH — rút ngắn thời gian thu tiền và tránh bị trả lại hồ sơ.

---

## 2. Trách nhiệm backend (gf-accounting)

- **Render PDF ③④**: Expose 2 endpoint POST nhận `settlementCode` + `formData` từ BFF, dùng `DocPrintService` + `AcceptanceRecordPrintStrategy` / `PaymentAuthorizationPrintStrategy` + Thymeleaf template để sinh byte[] PDF — trả thẳng `application/pdf`, KHÔNG persist, KHÔNG gọi ct-file-storage.
- **Persist batch atomic**: Expose endpoint `POST /api/v1/insurance-dossier-documents/batch` nhận danh sách tài liệu đã upload (fileUrl, fileName, documentType, formData, isSelected); trong 1 transaction INSERT `insurance_dossier` vN+1 + INSERT N row `insurance_dossier_document` + UPDATE `insurance_dossier` vN cũ set `status=REPLACED, replaced_by_version=N+1`.
- **Search paginated**: Expose endpoint `POST /api/v1/insurance-dossiers/search` body `{settlementCode, page, size}` trả Spring Pageable wrapper — BFF/FE dùng cho tab "Hồ sơ BH đã xuất".
- **Enforce BR SSOT**: Validate settlement KHÔNG ở trạng thái CANCEL trước khi cho tạo hồ sơ mới (BR-INS-DOSSIER-010); enforce bộ hồ sơ cố định 4 loại tài liệu (BR-INS-DOSSIER-001); enforce immutability version đã export (BR-INS-DOSSIER-006); enforce naming convention file (BR-INS-DOSSIER-011).
- **Tenant isolation**: Mọi entity và endpoint enforce `tenant_id` qua `TenantFilter`; settlement lookup phải verify tenant scope.
- **Migration**: `gf-accounting` dùng `ddl-auto=update` (KHÔNG Flyway) — entity JPA mới `InsuranceDossier` + `InsuranceDossierDocument` sẽ auto-create table khi deploy.

---

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Mở & khởi tạo hồ sơ từ phiếu QT BH

#### AC-1 → BE validate phiếu QT BH hợp lệ trước khi BFF có thể render/batch

- **Khi**: BFF gọi `GET /api/v1/settlements/{settlementCode}` (endpoint baseline hiện hữu) để resolve context (Phase A của ADR-016 orchestrator flow).
- **BE phải**: Verify `settlementCode` tồn tại và thuộc đúng `tenant_id` (TenantFilter); trả `{id, serviceOrderId, tenantId, status}` đủ để BFF orchestrate phase B/C/D.
- **Output**: 200 với settlement detail object; 404 `INS_STL_NOT_FOUND` nếu không tồn tại / sai tenant.
- **Failure mode**: 404 → BFF abort toàn bộ orchestration, FE hiển thị lỗi.
- **Ref**: BR-INS-DOSSIER-010 (§9), endpoint `GET /api/v1/settlements/{code}` (§6.2), entity `SettlementRecord` (§5.1).

#### AC-2 → N/A (UI-only — modal/màn hồ sơ BH thuộc FE/Mobile tier)

- Source AC này mô tả layout modal / màn Hồ sơ BH. BE không touch. Xem `fe-web/FEAT-INS-DOSSIER-CREATE.md §3 AC-2` và `mobile/FEAT-INS-DOSSIER-CREATE.md §3 AC-2`.

#### AC-13 → BE enforce phân quyền accountant cho toàn bộ endpoint hồ sơ BH

- **Khi**: Bất kỳ request nào tới 4 endpoint mới (render-pdf ③, render-pdf ④, batch, search).
- **BE phải**: Xác thực JWT bearer có role `accountant` (Critical Rule #6 dual persona). Nếu thiếu role → 403 `ACCESS_DENIED`.
- **Output**: 403 nếu sai role; pass-through nếu hợp lệ.
- **Failure mode**: 403 → FE/BFF không retry.
- **Ref**: BR-EP (phân quyền), endpoint §6.1, `TenantFilter` + Spring Security role check.

---

### Cluster B — Render PDF tài liệu ③④ (auto-fill template)

#### AC-6 → BE render "Biên bản nghiệm thu" thành byte[] PDF theo formData

- **Khi**: BFF gọi `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` body `{settlementCode, formData:{licensePlate, billDate, quoteReference, customer, garage, clauses[]}}`.
- **BE phải**: (1) Lookup settlement + verify tenant scope; (2) Gọi `AcceptanceRecordPrintDataBuilder.buildContext(settlement, formData)` → `AcceptanceRecordPrintContext`; (3) Gọi `docPrintService.generatePdf(ctx, DocumentPrintType.ACCEPTANCE_RECORD)` → byte[].
- **Output**: HTTP 200 `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="bien-ban-nghiem-thu.pdf"`, body = byte[]. KHÔNG persist, KHÔNG gọi ct-file-storage.
- **Failure mode**: 400 `INS_DOSSIER_FORM_INCOMPLETE` nếu thiếu field bắt buộc (`licensePlate`, `billDate`, `customer.name`, `customer.address`, `garage.name`, `garage.address`, `clauses.length ≥ 1`); 404 `INS_STL_NOT_FOUND` nếu settlement không tồn tại / sai tenant; 500 `PDF_GENERATION_FAILED` nếu Thymeleaf render lỗi (AC-14).
- **Ref**: BR-INS-DOSSIER-003 (§9), endpoint `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` (§6.1), template `acceptance-record.html`.

#### AC-7 → BE render "Giấy ủy quyền nhận tiền bồi thường" thành byte[] PDF theo formData

- **Khi**: BFF gọi `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` body `{settlementCode, formData:{...guq fields}}`.
- **BE phải**: Lookup settlement + verify tenant; gọi `PaymentAuthorizationPrintDataBuilder.buildContext(settlement, formData)` → `PaymentAuthorizationPrintContext`; gọi `docPrintService.generatePdf(ctx, DocumentPrintType.PAYMENT_AUTHORIZATION)` → byte[].
- **Output**: HTTP 200 `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="uy-quyen-nhan-tien.pdf"`, body = byte[]. KHÔNG persist.
- **Failure mode**: 400 `INS_DOSSIER_FORM_INCOMPLETE` nếu thiếu field; 404 `INS_STL_NOT_FOUND`; 500 `PDF_GENERATION_FAILED` (AC-14).
- **Ref**: BR-INS-DOSSIER-004 (§9), endpoint `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` (§6.1), template `payment-authorization.html`.

#### AC-4 → N/A (render Phiếu quyết toán là gf-accounting GET /api/v1/settlements/{id}/export-pdf — reuse baseline, không phát triển mới)

- Source AC-4 mô tả "Phiếu quyết toán auto-sinh" — gf-accounting đã có endpoint baseline `GET /api/v1/settlements/{id}/export-pdf` (reuse `SettlementPrintingController:43`). BFF gọi endpoint này trực tiếp ở Phase B của orchestrator. KHÔNG cần endpoint mới. Xem `bff/FEAT-INS-DOSSIER-CREATE.md §3 AC-4` cho orchestration.

#### AC-5 → N/A (render Phiếu báo giá thuộc gf-sales — reuse baseline, không phát triển mới ở gf-accounting)

- Source AC-5 mô tả "Phiếu báo giá auto-sinh" — render từ gf-sales `GET /api/v2/service-orders/{serviceOrderId}/export-pdf?type=QUOTATION` (reuse baseline). BFF orchestrate. gf-accounting KHÔNG gọi gf-sales (boundary isolation ADR-016). Xem `bff/FEAT-INS-DOSSIER-CREATE.md §3 AC-5`.

#### AC-14 → BE trả lỗi có cấu trúc khi PDF render thất bại

- **Khi**: `docPrintService.generatePdf()` throw exception tại endpoint render-pdf ③ hoặc ④.
- **BE phải**: Catch exception, trả 500 `PDF_GENERATION_FAILED` với message mô tả loại tài liệu và nguyên nhân (log stack trace internal, KHÔNG expose stack ra response).
- **Output**: 500 JSON `{errorCode: "PDF_GENERATION_FAILED", documentType: "ACCEPTANCE_RECORD"|"PAYMENT_AUTHORIZATION"}`.
- **Failure mode**: BFF abort Phase B, KHÔNG gọi Phase C/D. User retry từ FE (AC-14 FE behaviour xem fe-web tier).
- **Ref**: BR-INS-DOSSIER-002 (§9), endpoint render-pdf ③④ (§6.1).

---

### Cluster C — Persist batch atomic (Phase D orchestrator)

#### AC-10 → BE persist batch tài liệu trong 1 transaction, tạo version mới và đánh dấu version cũ REPLACED

- **Khi**: BFF gọi `POST /api/v1/insurance-dossier-documents/batch` body `{settlementCode, documents:[{documentType, fileUrl, fileName, formData?, isSelected},...N]}` sau khi Phase B/C render + upload thành công.
- **BE phải**: Trong 1 database transaction: (1) Tìm `insurance_dossier` hiện tại có `status=EXPORTED` cho `settlementCode` này (nếu có); (2) UPDATE dossier đó set `status='REPLACED', replaced_by_version=N+1`; (3) INSERT `insurance_dossier` mới với `version_no=N+1, status='EXPORTED'`; (4) INSERT N row `insurance_dossier_document` liên kết dossier mới. Nếu chưa có dossier trước → `version_no=1`, không có UPDATE.
- **Output**: HTTP 201 `{dossierId: UUID, versionNo: int}`.
- **Failure mode**: Rollback toàn bộ nếu bất kỳ step nào fail → 500 `DOSSIER_PERSIST_FAILED`. Orphan file ở ct-file-storage có thể tồn tại (cleanup TBD — Open Q5 per ADR-016).
- **Ref**: BR-INS-DOSSIER-006 (immutability), BR-INS-DOSSIER-007 (versioning), BR-INS-DOSSIER-011 (file naming đã xử lý bởi BFF trước khi upload), endpoint `POST /api/v1/insurance-dossier-documents/batch` (§6.1), entity `InsuranceDossier` + `InsuranceDossierDocument` (§5.1).

#### AC-11 → BE cho phép tạo bộ hồ sơ mới bất kỳ lúc nào (không giới hạn số lần)

- **Khi**: BFF gọi batch endpoint với `settlementCode` đã có dossier EXPORTED.
- **BE phải**: Không block — chỉ tìm dossier EXPORTED hiện tại (nếu có) và REPLACED nó. Không validate số lần xuất tối đa. Validate duy nhất: settlement KHÔNG ở trạng thái CANCEL (BR-INS-DOSSIER-010) → 409 `INS_STL_CANCELLED`.
- **Output**: Cho phép INSERT vN+1 miễn settlement không CANCEL.
- **Failure mode**: 409 nếu settlement CANCEL.
- **Ref**: BR-INS-DOSSIER-007, BR-INS-DOSSIER-010, endpoint `POST /api/v1/insurance-dossier-documents/batch` (§6.1).

#### AC-12 → BE enforce immutability: version EXPORTED/REPLACED không thể update

- **Khi**: Bất kỳ request nào cố sửa row `insurance_dossier_document` hoặc `insurance_dossier` đã tồn tại.
- **BE phải**: Không expose PUT/PATCH endpoint cho document. Mọi "sửa" phải đi qua batch tạo version mới. Constraint DB: `insurance_dossier_document` không có endpoint UPDATE.
- **Output**: Không có action — enforce bằng thiếu endpoint (no PUT on documents).
- **Failure mode**: N/A — bảo vệ thụ động bằng thiếu route.
- **Ref**: BR-INS-DOSSIER-006 (§9).

---

### Cluster D — Tra cứu phân trang (tab "Hồ sơ đã xuất")

#### AC-9 → BE expose search paginated dossier theo settlementCode

- **Khi**: BFF/FE gọi `POST /api/v1/insurance-dossiers/search` body `{settlementCode, page=0, size=10}`.
- **BE phải**: Query `insurance_dossier` + `insurance_dossier_document` theo `settlement_code` và `tenant_id`; trả Spring Pageable wrapper `{content:[], page, size, totalElements, totalPages}`. `size` tối đa 50 (enforce ở service layer). Sắp xếp `version_no DESC` (bản mới nhất trước).
- **Output**: 200 Pageable với tất cả version (EXPORTED + REPLACED — BR-INS-DOSSIER-009), mỗi item gồm `{dossierId, versionNo, status, exportedAt, documents:[{documentType, fileUrl, fileName, isSelected}]}`.
- **Failure mode**: 400 nếu `settlementCode` null/rỗng; 404 `INS_STL_NOT_FOUND` nếu settlement không thuộc tenant.
- **Ref**: BR-INS-DOSSIER-009 (§9), endpoint `POST /api/v1/insurance-dossiers/search` (§6.1), entity `InsuranceDossier` (§5.1).

#### AC-3 → N/A (hiển thị 4 dòng tài liệu accordion/list thuộc FE-web/Mobile tier)

- Source AC-3 mô tả layout 4 dòng tài liệu trong modal (accordion web / list app). BE không touch UI. Xem `fe-web/FEAT-INS-DOSSIER-CREATE.md §3 AC-3`.

#### AC-8 → N/A (khu vực preview + thao tác từng tài liệu thuộc FE-web/Mobile tier)

- Source AC-8 mô tả PDF preview panel, download button. BE expose `pdfUrl` (relative path / ct-file-storage object key, KHÔNG signed URL TTL per ADR-016 chốt 2026-06-17). FE compose URL từ env domain config + `pdfUrl`. Xem `fe-web/FEAT-INS-DOSSIER-CREATE.md §3 AC-8`.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-INS-DOSSIER-001** (CORNERSTONE): Bộ hồ sơ phải cố định đúng 4 loại tài liệu (`QUOTATION_SHEET`, `SETTLEMENT_SHEET`, `ACCEPTANCE_RECORD`, `PAYMENT_AUTHORIZATION`); không cho phép thêm/bớt. Enforce tại `InsuranceDossierService.validateDocumentSet()`. Vi phạm → 400 `INS_DOSSIER_INVALID_DOCUMENT_SET`.
- **BR-INS-DOSSIER-002** (NORMAL): Tài liệu ① `QUOTATION_SHEET` và ② `SETTLEMENT_SHEET` là auto-render read-only — BE không nhận `formData` cho 2 loại này trong batch body; nếu có → ignore (không persist `form_data` cho 2 loại này). Enforce tại service trước persist.
- **BR-INS-DOSSIER-003** (NORMAL): `ACCEPTANCE_RECORD` render endpoint chấp nhận `formData` với 13 field; field bắt buộc phải pass validation trước khi gọi `DocPrintService`. Thiếu → 400 `INS_DOSSIER_FORM_INCOMPLETE`.
- **BR-INS-DOSSIER-004** (NORMAL): `PAYMENT_AUTHORIZATION` render endpoint tương tự — chấp nhận `formData` template điền; validate field bắt buộc. Thiếu → 400 `INS_DOSSIER_FORM_INCOMPLETE`.
- **BR-INS-DOSSIER-005** (NORMAL): Batch endpoint chấp nhận subset tài liệu được chọn (`isSelected=true`) — không bắt buộc đủ 4. Validate rằng mỗi item được chọn phải có `fileUrl` và `fileName` hợp lệ. Enforce tại `InsuranceDossierService.validateBatchInput()`.
- **BR-INS-DOSSIER-006** (CORNERSTONE): Row `insurance_dossier` và `insurance_dossier_document` sau khi INSERT không được UPDATE nội dung (`file_url`, `file_name`, `document_type`). Enforce bằng không có PUT endpoint + DB constraint `status` chỉ transition `DRAFT→EXPORTED` và `EXPORTED→REPLACED`. Vi phạm → thiếu route (không tìm thấy endpoint).
- **BR-INS-DOSSIER-007** (CORNERSTONE): "Tạo bộ mới" = INSERT row mới hoàn toàn (vN+1) + UPDATE vN cũ REPLACED. KHÔNG unlock/edit vN. KHÔNG có cơ chế "sao chép từ bản trước" (`formData` — BA chốt 2026-06-16 drop column; chỉ `pdf_url`/`pdf_file_name` được chain qua `replaced_by_version`). Enforce tại service atomic transaction.
- **BR-INS-DOSSIER-010** (CORNERSTONE): Trước mỗi operation tạo/render liên quan đến `settlementCode`, lookup settlement status — nếu `status=CANCEL` → 409 `INS_STL_CANCELLED`. Enforce tại `InsuranceDossierService` (đầu mọi write method).
- **BR-INS-DOSSIER-011** (NORMAL): File naming `{slug}_{settlementCode}_v{N}.pdf` — BE expose `fileName` trong response batch (sinh bởi BFF khi upload ct-file-storage; BE nhận `fileName` đã đặt sẵn từ BFF, store as-is). Validate `fileName` non-null non-blank trong batch request.
- **BR-INS-STL-DET-004**, **BR-INS-STL-DET-007**: Rule liên quan phiếu QT BH chi tiết — không trực tiếp ảnh hưởng endpoint hồ sơ (xem FEAT-INS-STL-DETAIL tier file).
- **BR-GF-ACCOUNTING-013**: Rule gf-accounting baseline — enforce tenant isolation trên mọi entity.

### 4.2 Tenant + auth

- Mọi endpoint truyền `X-Tenant-Id` qua `TenantFilter`; entity `InsuranceDossier` và `InsuranceDossierDocument` có cột `tenant_id NOT NULL`; mọi query phải filter `WHERE tenant_id = :tenantId`.
- Endpoint `/api/v1/insurance-dossier-documents/**` và `/api/v1/insurance-dossiers/search`: yêu cầu role `accountant` (JWT) — Critical Rule #6 dual persona.
- Settlement lookup cross-check: `settlement.tenant_id` phải match `TenantContext.current()`.

### 4.3 Idempotency + concurrency

- `POST /api/v1/insurance-dossier-documents/batch`: Không có client idempotency-key (batch là single-shot per export action từ BFF). Rollback khi fail bảo đảm không có partial state. Nếu BFF retry batch sau Phase D fail → sẽ tạo thêm một version mới (acceptable per BR-INS-DOSSIER-007, số lần không giới hạn).
- Render-pdf ③④: stateless, idempotent theo design (không persist).
- Search: safe (read-only).

### 4.4 Error code mapping

| Error code | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `INS_STL_NOT_FOUND` | 404 | AC-1, AC-6, AC-7, AC-9 | TOAST |
| `INS_STL_CANCELLED` | 409 | AC-10, AC-11 | TOAST / INLINE |
| `INS_DOSSIER_FORM_INCOMPLETE` | 400 | AC-6, AC-7 | INLINE (field-level) |
| `INS_DOSSIER_INVALID_DOCUMENT_SET` | 400 | AC-10 (batch) | TOAST |
| `PDF_GENERATION_FAILED` | 500 | AC-14 | TOAST + retry CTA |
| `DOSSIER_PERSIST_FAILED` | 500 | AC-10 | TOAST + retry CTA |
| `ACCESS_DENIED` | 403 | AC-13 | TOAST |

---

## 5. Schema delta (BE — contract focus)

> `gf-accounting` dùng `ddl-auto=update` (KHÔNG Flyway). Entity mới → JPA auto-create table khi deploy. KHÔNG viết migration SQL.

### 5.1 Entity changes — `gf-accounting`

#### Bảng `insurance_dossier` (NEW)

| Column | Type | Nullable | Default | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|
| `id` | `UUID` | N | `gen_random_uuid()` | — | AC-10 | PK |
| `tenant_id` | `VARCHAR(64)` | N | — | BR-GF-ACCOUNTING-013 | AC-13 | Tenant isolation |
| `settlement_code` | `VARCHAR(64)` | N | — | BR-INS-DOSSIER-001 | AC-1, AC-10 | FK ref (scalar, không JPA relation — ADR-009) |
| `version_no` | `INTEGER` | N | — | BR-INS-DOSSIER-007 | AC-10, AC-11 | Số lần xuất; 1-indexed |
| `status` | `VARCHAR(32)` | N | `'EXPORTED'` | BR-INS-DOSSIER-006 | AC-10, AC-12 | Enum: `EXPORTED`, `REPLACED` |
| `replaced_by_version` | `INTEGER` | Y | `NULL` | BR-INS-DOSSIER-007 | AC-10 | Điền khi REPLACED; chain to vN+1 |
| `exported_at` | `TIMESTAMP WITH TIME ZONE` | N | `NOW()` | BR-INS-DOSSIER-006 | AC-10 | Thời điểm xuất |
| `created_by` | `VARCHAR(255)` | Y | — | — | AC-13 | User thực hiện xuất |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | N | `NOW()` | — | — | Audit |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | N | `NOW()` | — | — | Audit |

#### Bảng `insurance_dossier_document` (NEW)

| Column | Type | Nullable | Default | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|
| `id` | `UUID` | N | `gen_random_uuid()` | — | AC-10 | PK |
| `dossier_id` | `UUID` | N | — | BR-INS-DOSSIER-006 | AC-10 | FK scalar tới `insurance_dossier.id` (ADR-009) |
| `tenant_id` | `VARCHAR(64)` | N | — | BR-GF-ACCOUNTING-013 | AC-13 | Tenant isolation (denormalized) |
| `document_type` | `VARCHAR(64)` | N | — | BR-INS-DOSSIER-001 | AC-3, AC-10 | Enum: `QUOTATION_SHEET`, `SETTLEMENT_SHEET`, `ACCEPTANCE_RECORD`, `PAYMENT_AUTHORIZATION` |
| `file_url` | `TEXT` | N | — | BR-INS-DOSSIER-006 | AC-10 | Relative path / ct-file-storage object key (KHÔNG domain, KHÔNG signed URL) |
| `file_name` | `VARCHAR(512)` | N | — | BR-INS-DOSSIER-011 | AC-10 | Tên file đặt theo quy tắc `{slug}_{settlementCode}_v{N}.pdf` |
| `is_selected` | `BOOLEAN` | N | `true` | BR-INS-DOSSIER-005 | AC-10 | Tài liệu có được chọn để xuất trong lần này |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | N | `NOW()` | — | — | Audit |

> **Note schema**: Cột `form_data` KHÔNG tồn tại (BA chốt 2026-06-16 — drop column). `formData` là transient — không persist vào DB. BFF render-pdf ③④ gửi formData → BE render byte[] → BFF upload ct-file-storage → BFF gửi batch chỉ với `fileUrl`/`fileName`.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `insurance_dossier` | `idx_ins_dossier_tenant_stl` | `(tenant_id, settlement_code)` | btree | Lookup dossier theo settlement — search endpoint | ADR-009 |
| `insurance_dossier` | `idx_ins_dossier_tenant_stl_version` | `(tenant_id, settlement_code, version_no)` | btree unique | Enforce uniqueness vN per settlement | BR-INS-DOSSIER-007 |
| `insurance_dossier_document` | `idx_ins_doc_dossier_id` | `(dossier_id)` | btree | Join documents by dossier | — |
| `insurance_dossier_document` | `idx_ins_doc_tenant_type` | `(tenant_id, document_type)` | btree | Future query by type | BR-INS-DOSSIER-001 |

---

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref |
|---|---|---|---|---|---|---|
| POST | `/api/v1/insurance-dossier-documents/acceptance-record/render-pdf` | JWT `accountant` | `{settlementCode, formData:{licensePlate, billDate, quoteReference, customer, garage, clauses[]}}` | `application/pdf` byte[] | stateless (safe to retry) | AC-6 |
| POST | `/api/v1/insurance-dossier-documents/payment-authorization/render-pdf` | JWT `accountant` | `{settlementCode, formData:{...guq fields}}` | `application/pdf` byte[] | stateless (safe to retry) | AC-7 |
| POST | `/api/v1/insurance-dossier-documents/batch` | JWT `accountant` | `{settlementCode, documents:[{documentType, fileUrl, fileName, formData?, isSelected}]}` | `{dossierId: UUID, versionNo: int}` | single-shot (no idempotency-key) | AC-10, AC-11 |
| POST | `/api/v1/insurance-dossiers/search` | JWT `accountant` | `{settlementCode, page: int, size: int}` | Spring Pageable `{content:[], page, size, totalElements, totalPages}` | safe (read) | AC-9 |

**Acceptance-record render-pdf — request body chi tiết (13 atomic fields)**:
```jsonc
{
  "settlementCode": "SET-20260530-00007",
  "formData": {
    "licensePlate": "30A-12345",
    "billDate": "26/04/2026",
    "quoteReference": { "code": "BG-240426-01", "date": "24/04/2026" },
    "customer": { "name": "...", "address": "..." },
    "garage": {
      "name": "...", "delegate": "...", "delegateTitle": "...",
      "address": "...", "taxId": "...", "bankAccount": "...", "bankName": "..."
    },
    "clauses": ["Hạng mục 1...", "Hạng mục 2..."]
  }
}
```

**Batch — request body chi tiết**:
```jsonc
{
  "settlementCode": "SET-20260530-00007",
  "documents": [
    {
      "documentType": "ACCEPTANCE_RECORD",
      "fileUrl": "/settlements/bien-ban-nghiem-thu_SET-20260530-00007_v1.pdf",
      "fileName": "bien-ban-nghiem-thu_SET-20260530-00007_v1.pdf",
      "isSelected": true
    },
    {
      "documentType": "PAYMENT_AUTHORIZATION",
      "fileUrl": "/settlements/uy-quyen-nhan-tien_SET-20260530-00007_v1.pdf",
      "fileName": "uy-quyen-nhan-tien_SET-20260530-00007_v1.pdf",
      "isSelected": true
    }
  ]
}
```

**Search — response item shape**:
```jsonc
{
  "content": [
    {
      "dossierId": "uuid",
      "versionNo": 2,
      "status": "EXPORTED",
      "exportedAt": "2026-06-18T10:00:00Z",
      "documents": [
        { "documentType": "ACCEPTANCE_RECORD", "fileUrl": "...", "fileName": "...", "isSelected": true }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1
}
```

### 6.2 Modified REST endpoints (additive — reuse baseline)

| Method | Path | Notes | AC ref |
|---|---|---|---|
| GET | `/api/v1/settlements/{code}` | Không thay đổi contract — BFF dùng ở Phase A để resolve context. Baseline hiện hữu đủ. | AC-1 |
| GET | `/api/v1/settlements/{id}/export-pdf` | Reuse baseline `SettlementPrintingController:43` — BFF gọi ở Phase B ②. Không thay đổi. | AC-4 |

### 6.3 Kafka topics

Không có event mới. Export đồng bộ — không publish event (ADR-016 chốt).

### 6.4 Cross-boundary REST — gf-accounting là provider

| Endpoint | Consumed by | Khi | Failure mode |
|---|---|---|---|
| `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` | `agg-garage-graph` (BFF Phase B ③) | Khi BFF orchestrate export | BFF abort; user retry |
| `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` | `agg-garage-graph` (BFF Phase B ④) | Khi BFF orchestrate export | BFF abort; user retry |
| `POST /api/v1/insurance-dossier-documents/batch` | `agg-garage-graph` (BFF Phase D) | Sau Phase B+C success | Rollback internal; orphan file ở ct-file-storage |
| `POST /api/v1/insurance-dossiers/search` | `agg-garage-graph` (BFF — tab "Hồ sơ đã xuất") | Load tab | 404 nếu settlement sai tenant |

> **Hand-off tới BFF**: BFF `FEAT-INS-DOSSIER-CREATE` wrap các endpoint này thành GraphQL mutation `exportInsuranceDossier` + query `insuranceDossiers`. Không describe GraphQL ở đây — đó là BFF tier territory.

---

## 7. File/module impact map (BE — Hexagonal)

> Tất cả path ⊆ `services/gf-accounting/**`. KHÔNG cross-boundary file path.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/model/InsuranceDossier.java` | NEW | JPA entity (scalar FK, ADR-009) | ~60 | AC-10 |
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/model/InsuranceDossierDocument.java` | NEW | JPA entity | ~50 | AC-10 |
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/enums/InsuranceDossierStatus.java` | NEW | Enum `EXPORTED, REPLACED` | ~10 | AC-10, AC-12 |
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/enums/InsuranceDocumentType.java` | NEW | Enum `QUOTATION_SHEET, SETTLEMENT_SHEET, ACCEPTANCE_RECORD, PAYMENT_AUTHORIZATION` | ~10 | AC-3, AC-10 |
| `domain/repository` | `services/gf-accounting/src/main/java/.../domain/repository/InsuranceDossierRepository.java` | NEW | JPA repository | ~20 | AC-9, AC-10 |
| `domain/repository` | `services/gf-accounting/src/main/java/.../domain/repository/InsuranceDossierDocumentRepository.java` | NEW | JPA repository | ~15 | AC-10 |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/InsuranceDossierService.java` | NEW | Service layer — batch atomic + search + BR enforce | ~200 | AC-9, AC-10, AC-11, AC-12 |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/AcceptanceRecordPrintDataBuilder.java` | NEW | Builder `formData → AcceptanceRecordPrintContext` | ~80 | AC-6 |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/PaymentAuthorizationPrintDataBuilder.java` | NEW | Builder `formData → PaymentAuthorizationPrintContext` | ~60 | AC-7 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/InsuranceDossierBatchRequest.java` | NEW | DTO batch request | ~40 | AC-10 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/InsuranceDossierSearchRequest.java` | NEW | DTO search request | ~20 | AC-9 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/InsuranceDossierSearchResponse.java` | NEW | DTO search response | ~40 | AC-9 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/AcceptanceRecordRenderRequest.java` | NEW | DTO render ③ | ~50 | AC-6 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/PaymentAuthorizationRenderRequest.java` | NEW | DTO render ④ | ~40 | AC-7 |
| `adapter/controller` | `services/gf-accounting/src/main/java/.../adapter/controller/InsuranceDossierController.java` | NEW | 4 endpoint `@RestController` | ~120 | AC-6, AC-7, AC-9, AC-10 |
| `adapter/persistence` | `services/gf-accounting/src/main/java/.../adapter/persistence/InsuranceDossierJpaRepository.java` | NEW | Spring Data JPA | ~20 | AC-9, AC-10 |
| `adapter/persistence` | `services/gf-accounting/src/main/java/.../adapter/persistence/InsuranceDossierDocumentJpaRepository.java` | NEW | Spring Data JPA | ~15 | AC-10 |
| `resources/templates` | `services/gf-accounting/src/main/resources/templates/acceptance-record.html` | NEW | Thymeleaf template | ~80 | AC-6 |
| `resources/templates` | `services/gf-accounting/src/main/resources/templates/payment-authorization.html` | NEW | Thymeleaf template | ~60 | AC-7 |
| `test/unit` | `services/gf-accounting/src/test/java/.../app/service/InsuranceDossierServiceTest.java` | NEW | Unit tests service + BR | ~200 | AC-9, AC-10, AC-11, AC-12 |
| `test/contract` | `services/gf-accounting/src/test/java/.../adapter/controller/InsuranceDossierControllerTest.java` | NEW | Contract tests 4 endpoint | ~150 | AC-6, AC-7, AC-9, AC-10 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Entity + enum + ddl-auto
    Entry: KG.entities stable, schema §5.1 reviewed
    Action: Tạo InsuranceDossier + InsuranceDossierDocument JPA entity; InsuranceDossierStatus + InsuranceDocumentType enum; verify ddl-auto=update tạo table đúng schema
    Exit: Local deploy tạo đúng 2 bảng + index; schema test green
    └─► S2

S2  Repository + Service logic + Builder (BR enforcement primary)
    Entry: S1
    Action: InsuranceDossierRepository + InsuranceDossierDocumentRepository; InsuranceDossierService (batch atomic + search + validate BR-001/005/006/007/010); AcceptanceRecordPrintDataBuilder + PaymentAuthorizationPrintDataBuilder; DocPrintService reuse gọi template render
    Exit: Unit test InsuranceDossierServiceTest ≥12 green (happy path batch, REPLACED chain, CANCEL guard, size>50 reject, form incomplete)
    └─► S3

S3  REST adapter (controller) + Thymeleaf templates
    Entry: S2
    Action: InsuranceDossierController 4 endpoint; AcceptanceRecordRenderRequest + PaymentAuthorizationRenderRequest DTO validate; templates acceptance-record.html + payment-authorization.html
    Exit: Contract test InsuranceDossierControllerTest ≥10 green (render PDF 200/400/404/500, batch 201/409/400, search 200/404)
    └─► S4

S4  Integration test (cross-boundary — BFF Phase D)
    Entry: S3 stable + BFF endpoint sẵn
    Action: Test end-to-end: BFF gọi render-pdf ③④ → upload ct-file-storage (sim) → batch → verify InsuranceDossier row + REPLACED chain; test CANCEL guard 409
    Exit: Integration test green; hand-off BFF tier S5
    └─► (BFF tier S5 — wire GraphQL mutation + resolver)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Entity + enum + ddl-auto verify | domain/model | KG stable | 2 bảng tồn tại local | — |
| S2 | Repository + Service + Builder | domain + app | S1 | Unit test ≥12 green | S1 |
| S3 | Controller + Templates | adapter/controller + resources | S2 | Contract test ≥10 green | S2 |
| S4 | Integration test | test/integration | S3 + BFF ready | Integ test green | S3 |

---

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-INS-DOSSIER-001` | CORNERSTONE | service | `InsuranceDossierService.validateDocumentSet()` | AC-10 (batch) | `TC-BR-INS-DOSSIER-001-*` |
| `BR-INS-DOSSIER-002` | NORMAL | service | `InsuranceDossierService.validateBatchInput()` (ignore formData for ①②) | AC-4, AC-5 (batch) | `TC-BR-INS-DOSSIER-002-*` |
| `BR-INS-DOSSIER-003` | NORMAL | controller (validation) | `AcceptanceRecordRenderRequest` `@Valid` + `InsuranceDossierController` | AC-6 | `TC-BR-INS-DOSSIER-003-*` |
| `BR-INS-DOSSIER-004` | NORMAL | controller (validation) | `PaymentAuthorizationRenderRequest` `@Valid` + `InsuranceDossierController` | AC-7 | `TC-BR-INS-DOSSIER-004-*` |
| `BR-INS-DOSSIER-005` | NORMAL | service | `InsuranceDossierService.validateBatchInput()` (isSelected check) | AC-10 | `TC-BR-INS-DOSSIER-005-*` |
| `BR-INS-DOSSIER-006` | CORNERSTONE | domain + no-PUT-endpoint | `InsuranceDossierDocument` immutable (no PUT route) | AC-10, AC-12 | `TC-BR-INS-DOSSIER-006-*` |
| `BR-INS-DOSSIER-007` | CORNERSTONE | service (atomic transaction) | `InsuranceDossierService.batchPersist()` TX block | AC-10, AC-11 | `TC-BR-INS-DOSSIER-007-*` |
| `BR-INS-DOSSIER-009` | NORMAL | repository | `InsuranceDossierRepository.searchBySettlementCode()` — trả tất cả version | AC-9 | `TC-BR-INS-DOSSIER-009-*` |
| `BR-INS-DOSSIER-010` | CORNERSTONE | service (guard trước mọi write) | `InsuranceDossierService.assertSettlementNotCancelled()` | AC-10, AC-11 | `TC-BR-INS-DOSSIER-010-*` |
| `BR-INS-DOSSIER-011` | NORMAL | service (validate input) | `InsuranceDossierService.validateBatchInput()` (fileName non-null) | AC-10 | `TC-BR-INS-DOSSIER-011-*` |
| `BR-GF-ACCOUNTING-013` | CORNERSTONE | TenantFilter (infra) | `TenantFilter` + entity `tenant_id` column | AC-13 | `TC-BR-GF-ACC-013-*` |

> **Enforcement layer priority**: Primary tại `InsuranceDossierService` (SSOT). Secondary tại `@Valid` DTO (UX feedback qua error response). DB unique constraint (defense-in-depth cho `version_no` uniqueness per settlement).

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (settlement lookup + tenant check) | test-api | 200/404 |
| AC-6 | API contract (render-pdf ③ — 200/400/404/500) + Unit (builder) | test-api | formData validation + PDF byte[] non-empty |
| AC-7 | API contract (render-pdf ④ — 200/400/404/500) + Unit (builder) | test-api | tương tự AC-6 |
| AC-9 | API contract (search pagination) | test-api | page/size/totalElements correct; trả cả EXPORTED + REPLACED |
| AC-10 | Unit (batch atomic) + Integration (REPLACED chain) | test-api | INSERT vN+1 + UPDATE vN REPLACED trong 1 TX; rollback on fail |
| AC-11 | Unit (no limit guard + CANCEL 409) | test-api | Multiple batch calls → multiple versions |
| AC-12 | API contract (no PUT endpoint — 404) | test-api | Verify không có PUT route |
| AC-13 | Isolation (role check 403) | test-isolation | Non-accountant → 403 |
| AC-14 | API contract (500 PDF_GENERATION_FAILED) | test-api | Mock DocPrintService throw → 500 + errorCode |
| AC-2, AC-3, AC-4 render, AC-5 render, AC-8 | N/A (UI-only / BFF-orchestrated) | — | Covered ở BFF/FE/Mobile tier test scope |

---

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-DOSSIER-CREATE.md` | PENDING | BFF orchestrate 4 phase (ADR-016); wrap §6.1 endpoints thành GraphQL `exportInsuranceDossier` mutation + `insuranceDossiers` query |
| FE Web | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-CREATE.md` | PENDING | Consume BFF GraphQL ops; compose PDF download URL từ env domain + `pdfUrl` (relative path) |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-CREATE.md` | PENDING | Consume BFF GraphQL ops; tương tự FE Web nhưng Flutter/BLoC |

**Cross-tier contracts (read-only từ BE perspective)**:
- BFF sẽ gọi 4 endpoint ở §6.1 — BFF phải respect request schema chính xác (đặc biệt 13 field `acceptance-record/render-pdf`).
- `pdfUrl` trong response batch = relative path / ct-file-storage object key (KHÔNG scheme/domain). FE/Mobile tự compose URL download.
- File naming convention `{slug}_{settlementCode}_v{versionNo}.pdf` do BFF đặt khi upload ct-file-storage — BE nhận và store as-is trong `file_name`.

**Source ID consistency** (item 18): Tất cả tier file phải có `source_feat_sha = 6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238`.

---

## 12. References

- **Source**: [`Product/features/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/features/FEAT-INS-DOSSIER-CREATE.md) v21
- **Parent EP**: `EP-INSURANCE-SETTLEMENT`
- **BR refs**: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md`, `Product/business-rules/BR-GF-ACCOUNTING.md` (BR-INS-DOSSIER-001..011, BR-GF-ACCOUNTING-013)
- **HLD**: `Architecture/hld/gf-accounting-HLD.md`
- **API contract**: `Architecture/api/gf-accounting-api.md`
- **Integration**: `Architecture/integrations/INTEG-BFF-gf-accounting.md`
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6 (sha: `f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d`)
- **PKG**: `Execution/wave-specs/W02/work-packages/PKG-W02-insurance-dossier.md`
- **ADR-009**: JPA no relationship mapping — scalar FK only
- **ADR-015**: gf-sales → gf-accounting REST sync (insurance debt summary)
- **ADR-016**: PDF sinh qua common-printing; BFF orchestrator 4-phase; pdfUrl relative path; search POST paginated; export sync no-event
- **Fan-out map**: `Execution/wave-specs/W02/_routing/FEAT-FAN-OUT-MAP.yaml`

---

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260622-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-01--ins-dossier-current-endpoint-contract) | Add `GET /api/v1/insurance-dossiers/current` endpoint | RAISED (pending Architecture) | Add `GET /api/v1/insurance-dossiers/current` |
| [CR-20260622-03](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-03--ins-dossier-create-nav-expansion-to-push) | Reconcile §5.2 ExpansionTile → push nav 4 màn chi tiết | APPROVED MINOR self | §5 widget breakdown đồng bộ push nav (cascade từ mobile) |

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-INS-DOSSIER-CREATE` W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map 14 AC-IDs (8 active + 6 N/A declared), §4 ràng buộc + error codes, §5 schema delta (ddl-auto, 2 entity mới), §6 API 4 endpoint REST mới, §7 file map hexagonal, §8 sequence DAG S1-S4, §9 BR SSOT 11 rules, §10 test scope, §11 cross-tier pair. Source FEAT audit only. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | Sync §1 byte-equal canonical per reviewer FAIL #18c — replace §1 với wording identical FE+Mobile tier. §2-§N (BE-specific) giữ nguyên. |
| 2026-06-22 | 3 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 2 CR liên quan tier BE: CR-20260622-01, CR-20260622-03. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
