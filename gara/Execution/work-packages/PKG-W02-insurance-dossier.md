---
type: execution
artifact_kind: work-package
status: PLANNED
version: 19
tier: T4
owner_authority: Delivery Authority
wave: "W02"
last_reviewed: "2026-06-18"
---

# PKG-W02 — Settlement Adjustments + Insurance Dossier

> Work package cho Wave 2 của EP-INSURANCE-SETTLEMENT — chạy **2 phase tuần tự**:
> **Phase A** (~2d) — FEAT-INS-STL-CREATE (màn Tạo phiếu QT) + cụm 6 CR APPROVED (CR-20260612-01 panel chi tiết per-payer · CR-20260616-01 phiếu in QT + "Phân bổ bảo hiểm" · CR-20260612-02 popup hoàn thành SO cảnh báo BH âm · CR-20260616-02 panel "Tổng giá dịch vụ" 2 cột · CR-20260618-01 sửa logic sinh phiếu QT khi BH 100% + KH chịu phân bổ · CR-20260618-02 template in PDV phân bổ BH).
> **Phase B** (~4d) — FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW (hồ sơ bảo hiểm).
> **Hard gate A → B** (xem WAVE-SEQUENCE §1.2): dossier Phase B auto-render Phiếu QT + Phiếu báo giá từ panel "Tổng giá dịch vụ" + template in mà cụm CR Phase A thay đổi → Phase A phải xong + stable trước.
> CR refs: [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md).
> Created tại PLANNING stage; sẽ update Actuals (§9) tại end-of-wave.

---

## 1. Overview

| Field | Value |
|---|---|
| Wave | W02 (2 phase tuần tự A → B) |
| Title | Settlement Adjustments + Insurance Dossier |
| Duration target | 6 ngày (~40h work, 4 dev parallel — web + mobile đồng thời). Phase A ~2d + Phase B ~4d |
| Phase | Feature delivery — EP-INSURANCE-SETTLEMENT slice 2/3 |
| CR updates (chạy đầu) | **CR-20260612-01** (gf-accounting — màn chi tiết phiếu QT tách hiển thị panel theo bên thanh toán) + **CR-20260612-02** (gf-sales — popup hoàn thành SO cảnh báo Tổng BH thanh toán âm) + **CR-20260616-01** (template in phiếu QT) + **CR-20260616-02** (panel "Tổng giá dịch vụ" 2 cột) + **CR-20260618-01** (sửa logic sinh phiếu QT khi BH 100% + KH chịu phân bổ — phiếu QT KH "chỉ phân bổ BH" 3 khoản dấu +; Figma web `13906-29632` · mobile `758-28571`) + **CR-20260618-02** (template in PDV bổ sung khối "Phân bổ bảo hiểm" 5 khoản × 2 cột + tách "Cần thanh toán" 3 dòng; mockup `print-service.html`) |
| Features (Phase A) | FEAT-INS-STL-CREATE (gf-accounting) + 6 CR: CR-20260612-01, CR-20260616-01, CR-20260612-02, CR-20260616-02, CR-20260618-01, CR-20260618-02 |
| Features (Phase B) | FEAT-INS-DOSSIER-CREATE (gf-accounting) + FEAT-INS-DOSSIER-VIEW (gf-accounting) |
| Epics | EP-INSURANCE-SETTLEMENT |
| Boundaries affected | `gf-accounting`, `gf-sales` (Phase A — CR-20260612-02 + phần in từ SO), `agg-garage-graph`, `garage-web`, `garage-mobile` + object storage (S3 — Phase B) |
| Lead boundary | `gf-accounting` (settlement create + dossier entity + PDF gen + S3 — path dài nhất; STL-CREATE là extension nhẹ cùng boundary) |

---

## 2. Scope

> **W02 chạy 2 phase tuần tự.** §2.0 = Phase A (settlement create + CR); §2.1–2.4 = Phase B (dossier, giữ nguyên). Hard gate A→B: WAVE-SEQUENCE §1.2.

### 2.0 Phase A — Settlement create + CR adjustments (~2 ngày)

**Business Goal**: chốt phần hiển thị **phân bổ bảo hiểm** trên màn Tạo phiếu QT + màn chi tiết QT + **bản in phiếu QT** trước khi build dossier — để dossier auto-render Phiếu QT/Phiếu báo giá đúng layout per-payer. Đồng thời nhắc cảnh báo BH thanh toán âm tại bước hoàn thành SO.

**Scope items** (7):

| # | Item | Boundary | Nội dung |
|---|---|---|---|
| A1 | **FEAT-INS-STL-CREATE** | gf-accounting (+ agg, web, mobile) | Màn **Tạo phiếu QT** thêm panel read-only "Tổng giá dịch vụ" (3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cần thanh toán) — snapshot từ phân bổ BH trên SO; "Tổng tiền bảo hiểm trả" read-only = computed (AC-6); snapshot block phân bổ vào cặp phiếu QT khi xác nhận (AC-7). Hiển thị có điều kiện theo SO có Bảo hiểm (BR-INS-STL-CRE-009). **Extend** màn `FEAT-STL-CREATE` production, KHÔNG rebuild. |
| A2 | **CR-20260612-01** | gf-accounting (+ agg, web, mobile) | Panel "Tổng giá dịch vụ" màn **chi tiết phiếu QT** tách per-payer: phiếu BH 1 cột "Bảo hiểm thanh toán" (bỏ cột KH, giữ "Tổng thanh toán"); phiếu KH từ SO có BH thêm section "Phân bổ Bảo hiểm" 3 khoản chuyển KH (dấu +), **ẩn** 2 khoản CK liên kết BH (chốt 2026-06-16). |
| A3 | **CR-20260616-01** | gf-accounting (OWNER template QT) + gf-sales (for-print snapshot extend) (+ web, mobile) | **Template in phiếu QT** bổ sung section "Phân bổ bảo hiểm": phiếu BH 5 khoản (dấu −) · phiếu KH từ SO có BH 3 khoản (dấu +, **ẩn** 2 khoản CK liên kết BH per chốt 2026-06-16) · phiếu QT từ SO **không** BH giữ bản in baseline. **Owner template**: `gf-accounting` (DocPrintService common-printing — `SettlementPrintStrategy` per-payer variant). **Data source**: snapshot từ `gf-sales` `/protected/v1/service-orders/{tenantId}/{code}/for-print` (extend response trả `breakdownByPayer` 5 khoản per-payer, đã có W01 server-side) + `settlement_records` fields (`related_settlement_code` xác định BH↔KH pair). **Template binding**: 2 variant `settlement-insurance.html` (5 khoản dấu −) + `settlement-customer.html` (3 khoản dấu +); SO không BH giữ template baseline. Khớp 2 mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance}.html`. |
| A4 | **CR-20260612-02** | gf-sales (+ web, mobile) | Popup "Hoàn thành phiếu dịch vụ" (FEAT-SO-DETAIL AC-16) thêm dòng cảnh báo khi Tổng "Bảo hiểm thanh toán" < 0 (`ERR-INS-003`, warn-and-allow, không chặn). |
| A5 | **CR-20260616-02** | garage-web + garage-mobile (+ agg) | Panel "Tổng giá dịch vụ" — tách khối "Phân bổ Bảo hiểm" + "Cần thanh toán" từ 1 cột → **2 cột (Bảo hiểm \| Khách hàng)** dóng thẳng theo bên thanh toán, mỗi khoản +/− đúng cột. **Display-only** (số liệu computed server-side). Áp 3 màn: Chỉnh sửa SO + Chi tiết SO (FEAT-INS-SO-ADJUSTMENT) + Tạo phiếu QT (FEAT-INS-STL-CREATE). **KHÔNG** áp màn chi tiết QT (1-cột per-payer theo CR-20260612-01). Figma GMS-v.3: SO Edit `13354-57960` · SO Detail `13354-58368` · Tạo QT `13535-159225`. |
| A6 | **CR-20260618-01** | gf-accounting + gf-sales (+ agg, web, mobile) | **Sửa logic sinh phiếu QT từ SO** — sinh phiếu QT KH khi (a) có phụ tùng/dịch vụ KH chi trả HOẶC (b) `Khấu trừ BH + Khấu hao vật tư-thay mới + Giảm trừ bồi thường > 0` (kể cả khi BH thanh toán 100% phụ tùng + dịch vụ). Case "BH 100% + KH chịu phân bổ" → 2 phiếu: phiếu QT BH đầy đủ + phiếu QT KH **"chỉ phân bổ BH"** (3 khoản dấu +, KHÔNG có dòng dịch vụ/phụ tùng; Tổng thanh toán = tổng 3 khoản phân bổ). Figma layout phiếu QT KH "chỉ phân bổ BH": web GMS-v.3 `13906-29632` · mobile App GMS-v3 New Design `758-28571`. BFF cờ "KH còn phân bổ BH > 0" dùng chung với A2/A3. KHÔNG re-evaluate phiếu QT cũ. |
| A7 | **CR-20260618-02** | gf-sales (OWNER template PDV) (+ web, mobile) | **Template in Phiếu dịch vụ (PDV)** bổ sung khối "Phân bổ bảo hiểm" 5 khoản × 2 cột (BH dấu − / KH dấu + hoặc 0) — `CK liên kết BH - Vật tư`, `CK liên kết BH - Công dịch vụ`, `Giảm trừ bồi thường`, `Khấu hao vật tư-thay mới`, `Khấu trừ BH`. Thay 1 dòng "Tổng thanh toán" → khối "Cần thanh toán" 3 dòng (`Bảo hiểm thanh toán` + `Khách hàng thanh toán` + `Tổng thanh toán` bold). Dòng "bằng chữ" bám **Khách hàng thanh toán** (KH chỉ trả phần KH). SO không Bảo hiểm giữ baseline (1 dòng "Tổng thanh toán", không có khối phân bổ). **Owner template**: `gf-sales` (DocPrintService common-printing — `ServiceOrderPrintStrategy` V3 variant). **Data source**: SO entity + `service_order_part` (line items `is_deleted=false`) + computed snapshot `breakdownByPayer` 5 khoản (server-side, đã có W01) + cờ `has_insurance` để bật/tắt section. **Template binding**: 1 template `service-order-v3.html` extend baseline — section "Phân bổ bảo hiểm" + 3-dòng "Cần thanh toán" conditional theo `has_insurance` (SO không BH giữ baseline 1 dòng). Mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-service.html`. |

**Phase A technical notes**:
- **Số liệu server-side một nguồn** (BR-INS-STL-CRE-003): panel + bản in QT + bản in PDV + popup + logic sinh phiếu QT tiêu thụ cùng snapshot phân bổ từ SO — KHÔNG tự tính lại logic mới. Khớp màn SO (FEAT-INS-SO-ADJUSTMENT) ↔ màn Tạo QT ↔ màn chi tiết QT ↔ bản in QT ↔ bản in PDV.
- **2 cờ BFF dùng chung** (`agg-garage-graph` expose):
  - Cờ **"SO có chọn Bảo hiểm"** + panel snapshot per-payer → web/mobile quyết render section "Phân bổ bảo hiểm" trên phiếu KH (panel + bản in QT + bản in PDV). Dùng chung A1/A2/A3/A7.
  - Cờ **"KH còn phân bổ BH > 0"** (tổng `Khấu trừ BH + Khấu hao + Giảm trừ`) → backend quyết sinh phiếu QT KH "chỉ phân bổ BH" (A6); FE quyết layout phiếu QT KH render.
- **Reuse-first**: tái dùng component panel "Tổng giá dịch vụ" + template in QT đã có từ W01 + baseline `common-printing` — KHÔNG dựng lại. Bản in QT + bản in PDV chỉ thêm 1 section "Phân bổ bảo hiểm" (conditional theo payer + cờ SO có BH). Phiếu QT KH "chỉ phân bổ BH" layout mới — dùng template riêng (KHÔNG dùng layout phiếu QT KH baseline).
- **Hard gate A → B**: panel per-payer + template in QT/báo giá stable trên staging trước khi start Phase B (dossier render từ đây).

**Phase A out of scope**: thay đổi công thức tính phân bổ BH (đã chốt W01 ADR-015); re-generate PDF dossier cũ (PRINT-INS-005 bất biến); 2 khoản CK liên kết BH trên phiếu KH (đã chốt **ẩn**); re-evaluate phiếu QT cũ đã tạo trước A6 (giữ snapshot lịch sử — kế toán xử lý thủ công nếu cần thu KH).

### 2.1 Business Goal (Phase B — Dossier)

**(0 — chạy đầu, FEAT-INS-STL-CREATE)** Cho kế toán **đối chiếu phân bổ bảo hiểm ngay trên màn xác nhận Tạo phiếu quyết toán** trước khi chốt: panel "Tổng giá dịch vụ" read-only (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm 5 khoản + Cần thanh toán) — snapshot từ phân bổ SO, giảm sai sót khi tạo cặp phiếu QT. Sau đó:

Cho phép kế toán **(a)** lập bộ hồ sơ bảo hiểm chuẩn 4 tài liệu (Phiếu QT auto-render + Phiếu báo giá auto-render + Biên bản nghiệm thu upload + Giấy ủy quyền upload), xuất bộ PDF gửi DN BH; và **(b)** xem lại các bộ đã xuất trong tab "Hồ sơ bảo hiểm đã xuất" với versioning (BH yêu cầu sửa → tạo bộ mới, không unlock bộ cũ). Loại bỏ thao tác Excel ngoài hệ thống + rút ngắn thời gian thu tiền BH.

### 2.2 Technical Scope (Phase B — Dossier)

> **CR updates (chạy ĐẦU wave — ngày 1, ~4h toàn stack, hấp thụ; xem [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md))**:
>
> - **CR-20260612-01 (gf-accounting + BFF + web + mobile)** — màn **chi tiết phiếu QT** tách hiển thị panel "Tổng giá dịch vụ" theo bên thanh toán:
>   - **gf-accounting/BFF**: response `GetSettlementDetail` — phiếu **BH** chỉ trả/ hiển thị cột "Bảo hiểm thanh toán" (bỏ KH); phiếu **KH** trả thêm **cờ `soHasInsurance`** + block "Phân bổ Bảo hiểm" (các khoản KH chịu) **chỉ khi SO gốc có chọn Bảo hiểm**.
>   - **garage-web/mobile**: phiếu BH panel chỉ 1 cột BH + bỏ **dòng "Khách hàng thanh toán"** ở "Cần thanh toán" (**giữ "Tổng thanh toán"** = BH — chốt 2026-06-12; giữ "Phân bổ Bảo hiểm"); phiếu KH 1 cột KH + render "Phân bổ Bảo hiểm" có điều kiện theo `soHasInsurance`. Reuse component panel hiện có (chỉ đổi chế độ cột/điều kiện).
>   - Reference: FEAT-INS-STL-DETAIL AC-6 (rewrite), BR-INS-STL-DET-009.
> - **CR-20260612-02 (gf-sales + web + mobile)** — popup **"Hoàn thành phiếu dịch vụ"**:
>   - **gf-sales/BFF**: cung cấp giá trị "Bảo hiểm thanh toán" computed cho popup hoàn thành (reuse tính server-side); không đổi luồng hoàn thành.
>   - **garage-web/mobile**: trong hộp thoại "Hoàn thành phiếu dịch vụ" (FEAT-SO-DETAIL AC-16) — nếu SO có BH và Tổng "Bảo hiểm thanh toán" < 0 → render dòng cảnh báo `ERR-INS-003`; nút "Xác nhận" **vẫn enable** (warn-and-allow).
>   - Reference: FEAT-INS-SO-ADJUSTMENT AC-17, BR-INS-SO-ADJ-010.

> **Slice 0 — FEAT-INS-STL-CREATE (chạy đầu wave, ~6h toàn stack, hấp thụ ngày 1)** — extension nhẹ, reuse panel W01, KHÔNG đụng dossier:
>
> - **gf-accounting**: query mở màn Tạo phiếu QT (loại Bảo hiểm) trả thêm block `insuranceAdjustment` **read-only** (breakdownByPayer + 5 khoản adjustments + settlementBalance) — **tái dùng logic tính server-side W01** (BR-INS-STL-CRE-003), KHÔNG tính lại. Trường "Tổng tiền bảo hiểm trả" bên BH = read-only = `settlementBalance.bhPayment` (CNF-INS-001). Không entity/migration mới (reuse snapshot fields W01).
> - **agg-garage-graph**: query mở màn tạo phiếu QT extend trả block `insuranceAdjustment` (reuse type `InsuranceAllocation` đã có W01).
> - **garage-web**: gắn panel "Tổng giá dịch vụ" read-only lên màn xác nhận Tạo phiếu QT — **reuse component panel W01** (`<InsuranceSettlementDetail>` panel / `<InsuranceAllocationSummary>`), hiển thị có điều kiện theo SO có/không BH (BR-INS-STL-CRE-009). **KHÔNG dựng component mới.**
> - **garage-mobile**: panel tương đương trên màn tạo phiếu QT (reuse panel screen W01). **NEED CONFIRMATION: Figma mobile link STL-CREATE.**
> - Reference: [`FEAT-INS-STL-CREATE`](../../Product/features/FEAT-INS-STL-CREATE.md) AC-1..8, BR-INS-STL-CRE-009, CNF-INS-001.

**gf-accounting** (FEAT-INS-DOSSIER-CREATE + VIEW):
- Entity tree (**2 aggregate** — đồng bộ data-model §2bis.2-2bis.3, ADR-016):
  - `insurance_dossiers` (header bộ Hồ sơ BH) — scalar FK `settlement_code` tới `settlement_records.code` (Phiếu QT BH INSURANCE), `version_no` (v1, v2…), `dossier_status` (`DRAFT`|`EXPORTED`|`REPLACED`), `replaced_by_version`, `copied_from_version`, `exported_at`, `exported_by`. Unique `(tenant_id, settlement_code, version_no)`.
  - `insurance_dossier_documents` (N row per version, N = số documentType được tích chọn xuất ≤ 4) — scalar FK `dossier_id`, `document_type` enum `InsuranceDossierDocType` (`QUOTATION_SHEET` ① | `SETTLEMENT_SHEET` ② | `ACCEPTANCE_RECORD` ③ | `PAYMENT_AUTHORIZATION` ④), `pdf_url` (ct-file-storage object key / relative path — KHÔNG scheme/domain), `pdf_file_name`, `is_selected`, `exported_at`, `exported_by`. Unique `(dossier_id, document_type)`. Row immutable.
  - ddl-auto=update; scalar FK only (ADR-009). **KHÔNG có** cột `form_data` JSONB (formData ③④ transient — BA chốt 2026-06-16, ADR-016 v11 + gf-accounting-data-model v8). **KHÔNG có** cột `uploaded_file_url` / value `UPLOAD` trong `input_mode` (FEAT v17 chốt B-3 bỏ upload ③).
- PDF generation server-side — **tái dùng `common-printing`** (ADR-016, KHÔNG thêm engine mới):
  - Phiếu quyết toán PDF (①) — render read-only "PHIẾU QUYẾT TOÁN SỬA CHỮA" từ snapshot scalar adjustment + breakdown columns on `settlement_records` + line items + customer/vehicle + khối "Phân bổ bảo hiểm" (CK liên kết / Giảm trừ bồi thường / Khấu hao / Khấu trừ BH / Tổng thanh toán).
  - Phiếu báo giá PDF (②) — render read-only "PHIẾU BÁO GIÁ SỬA CHỮA" từ snapshot cùng nguồn, layout mẫu chung Legal-approved.
  - Biên bản nghiệm thu (③) + Giấy ủy quyền (④) — `FORM_FILL` template (mẫu chung "Mẫu linh hoạt dùng cho các hãng chưa chuẩn hóa form"); kế toán điền trực tiếp trên template (prefill xe/DN BH/số tiền + chỉ Tên KH theo FEAT v21 AC-6/7, BR-INS-DOSSIER-003). **KHÔNG** hỗ trợ upload PDF scan / image (FEAT v17 chốt B-3).
- Endpoints (khớp gf-accounting-api v16 §3bis.1-3bis.4 — **4 endpoint canonical** sau realign Architecture; ADR-016 v11):
  - `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` (§3bis.1) — body `{settlementCode, formData}` (13 trường strict Figma State 4). Render byte[] PDF ③ Biên bản nghiệm thu qua common-printing (`AcceptanceRecordPrintStrategy` + template `acceptance-record.html` bind 100% `${formData.X}`). Transient render — KHÔNG persist `formData`.
  - `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` (§3bis.2) — body `{settlementCode, formData}` (22 trường nested 4 sections strict Figma State 5). Render byte[] PDF ④ Giấy ủy quyền qua common-printing (`PaymentAuthorizationPrintStrategy` + template `payment-authorization.html`). Transient render.
  - `POST /api/v1/insurance-dossier-documents/batch` (§3bis.3) — body `{settlementCode, documents:[{documentType, fileUrl, fileName, isSelected}]}` (N docs đã upload). Atomic transaction: INSERT `insurance_dossiers` vN+1 (auto-increment per settlement_code) + INSERT N row `insurance_dossier_documents` immutable + UPDATE vN cũ `dossier_status=REPLACED, replaced_by_version=N+1` → response `{dossierId, versionNo}`. KHÔNG render, KHÔNG upload — chỉ persist.
  - `POST /api/v1/insurance-dossiers/search` (§3bis.4) — body `{settlementCode, page=0, size=10}` (max `size=50`). **Paginated Spring Pageable** response `{content:[{versionNo, dossierStatus, exportedAt, exportedBy, replacedByVersion, documents:[{documentType, pdfUrl, pdfFileName, exportedAt}]}], page, size, totalElements, totalPages}` (descending by versionNo). `pdfUrl` = ct-file-storage object key / relative path (no scheme/domain) — FE nối domain config + dùng cơ chế download hiện tại. **KHÔNG có endpoint `/download` riêng** (không signed URL, không TTL — ADR-016 v11 supersede).
- PDF storage: **`ct-file-storage`** external integration (ADR-016 v11; KHÔNG direct S3 client trong gf-accounting). BFF (`agg-garage-graph`) orchestrate Phase C upload byte[] qua `POST /api/v1/files/upload-files` multipart với `folderType="SETTLEMENTS"` (reuse pattern `uploadMultipleFiles` existing). Mỗi `fileUrl` trỏ ct-file-storage object id duy nhất → immutable per version. Tenant isolation enforce qua header check + URL pattern khó đoán (Platform/Security verify trước go-live).
- Boundary isolation: gf-accounting KHÔNG gọi gf-sales (① do BFF resolve), KHÔNG chạm ct-file-storage (BFF upload). gf-accounting chỉ render ③④ + persist batch + list. Atomicity Phase D: 1 transaction; fail → rollback (orphan files Phase C có thể tồn tại ở ct-file-storage — cleanup TBD Open Q).

**agg-garage-graph** (BFF — **Orchestrator pattern** per ADR-016 v11, agg-garage-graph-graphql v7.7 #51-52):
- GraphQL ops: **1 mutation + 1 query** (4 phase orchestrator pattern thay passthrough).
  - **Mutation `exportInsuranceDossier(settlementCode, documentTypes, acceptanceFormData?, authorizationFormData?): DossierExportBatchResponse!`** — orchestrator **4 phase**:
    - **Phase A** Resolve context: `GET /api/v1/settlements/{settlementCode}` (gf-accounting) → `{id, serviceOrderId, tenantId}`.
    - **Phase B** Parallel render N byte[] (Promise.all theo `documentTypes[]`): ① `GET /api/v2/service-orders/{soId}/export-pdf?type=QUOTATION` (gf-sales baseline) + ② `GET /api/v1/settlements/{id}/export-pdf` (gf-accounting baseline) + ③ POST render-pdf acceptance-record (formData transient) + ④ POST render-pdf payment-authorization (formData transient).
    - **Phase C** Parallel push ct-file-storage: mỗi byte[] → `POST /api/v1/files/upload-files` multipart `files=<bytes>` + `folderType="SETTLEMENTS"` → `{fileUrl, fileName}`.
    - **Phase D** Persist atomic: `POST /api/v1/insurance-dossier-documents/batch` (gf-accounting) body `{settlementCode, documents:[{documentType, fileUrl, fileName, isSelected}]}` → `{dossierId, versionNo}`.
    - **Phase E** Aggregate → trả FE `{versionNo, exports:[{documentType, fileUrl, fileName}]}`.
  - **Query `getInsuranceDossierVersions(settlementCode: String!, page: Int = 0, size: Int = 10): InsuranceDossierVersionsResponse!`** — passthrough thuần `POST /api/v1/insurance-dossiers/search` body `{settlementCode, page, size}` (max `size=50`). Response Spring Pageable wrapper `{content[], page, size, totalElements, totalPages}`. KHÔNG cache.
- Auth header propagation + tenant context (forward `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống cả gf-accounting + gf-sales + ct-file-storage).
- Atomicity per phase: B/C fail → BFF abort, KHÔNG gọi Phase D (user retry từ FE); D fail → atomic rollback nội bộ gf-accounting (orphan files Phase C cleanup TBD).
- Error codes (`extensions.code` mapping): `INS_STL_NOT_FOUND` (404 Phase A), `INS_DOSSIER_RENDER_FAIL` (502 Phase B), `INS_DOSSIER_STORAGE_UPLOAD_FAIL` (502 Phase C), `INS_DOSSIER_PERSIST_FAIL` (500 Phase D), `INS_DOSSIER_NO_DOC_SELECTED` (400 validation), `INS_DOSSIER_FORM_INCOMPLETE` (400 validation thiếu formData required).

**garage-mobile** (Flutter — UI equivalent web, FEAT v21 layout):
- `InsuranceDossierPage` (full-screen flow, KHÔNG modal vì mobile UX) triggered từ action "+ Tạo hồ sơ bảo hiểm" trên `InsuranceSettlementDetailPage`.
- AppBar: back button ‹ + title "Hồ sơ bảo hiểm" + subtitle "Tài liệu bảo hiểm" / "Chọn tài liệu cần xuất."
- `ListView` dọc 4 dòng tài liệu (FEAT v21 AC-3 — KHÔNG progress bar, KHÔNG badge "Sẵn sàng"/"Bổ sung"):
  - Mỗi dòng = `Checkbox` (mặc định **bỏ trống**) + tiêu đề + dòng phụ mô tả trạng thái + mũi tên ›.
  - Tap dòng → điều hướng sang `DossierDocumentDetailPage` (full-screen per tài liệu).
- `DossierDocumentDetailPage`:
  - ①② (Phiếu quyết toán / Phiếu báo giá — `AUTO_RENDER`): preview read-only template tương ứng (đồng bộ FEAT AC-4/5).
  - ③④ (Biên bản nghiệm thu / Giấy ủy quyền — `FORM_FILL`): template editable inline (mẫu "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM…"); banner cảnh báo cam "Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ." (FEAT AC-6/7). Nút **"Lưu thông tin"** = lưu cục bộ trong phiên/màn (áp nội dung điền vào form khi quay lại danh sách), **KHÔNG persist server** — nội dung chỉ persist thật khi nhấn "Xuất hồ sơ bảo hiểm" (đồng bộ EC-1; đóng app trước khi xuất → mất dữ liệu).
- Bottom action bar: "Xuất hồ sơ bảo hiểm" (primary, **enable khi ≥1 checkbox tích** )
- Tab "Hồ sơ bảo hiểm đã xuất" trong `InsuranceSettlementDetailPage` (thay placeholder W01):
  - `ListView` bộ hồ sơ (mới nhất trên cùng) với card "Bộ hồ sơ {code} · Xuất ngày {dd/mm/yyyy hh:mm} · {N} tài liệu PDF".
  - Tap card mở `DossierPreviewPage` — PDF embedded inline (qua PDF viewer lib — NEED CONFIRMATION) + nút "Tải PDF" (FE nối domain config + `pdfUrl` ct-file-storage object key → dùng cơ chế download hiện hữu).
- Versioning UX: tap "+ Tạo hồ sơ bảo hiểm" lần 2 = tạo bộ v+1 (điền lại template từ đầu, không có "Sao chép từ bản trước"); bộ v1 vẫn xem trong tab.
- Offline: dossier flow yêu cầu network online; show banner khi offline.

**garage-web** (UI — feature trên design system hiện hữu, FEAT v21 layout):

> Dossier create = **modal accordion dọc** trên phiếu QT BH detail (luồng modal/dialog hiện hữu). Versioning: bộ v2 = mở lại modal tạo hồ sơ lần nữa (bộ mới), không sửa v1.

#### Feature UI (FEAT-INS-DOSSIER-CREATE + VIEW)

- Modal "+ Tạo hồ sơ bảo hiểm" triggered từ nút trên phiếu QT BH:
  - Title: "Hồ sơ bảo hiểm - {mã phiếu QT}" (vd "Hồ sơ bảo hiểm - #SET-20260326-00001").
  - **Layout accordion dọc** — 4 dòng tài liệu (FEAT v21 AC-3 — KHÔNG progress bar, KHÔNG badge "Sẵn sàng"/"Bổ sung"):
    - Mỗi dòng = checkbox (mặc định **bỏ trống**) + tiêu đề + dòng phụ mô tả trạng thái + mũi tên ▾.
    - Click dòng → **mở rộng accordion** hiển thị preview/template **inline** trong dòng (dòng đang mở highlight + đổi mũi tên ▴). KHÔNG có preview panel riêng.
  - Tài liệu ①② Phiếu quyết toán / Phiếu báo giá (`AUTO_RENDER`): preview read-only template ("PHIẾU QUYẾT TOÁN SỬA CHỮA" + "PHIẾU BÁO GIÁ SỬA CHỮA") snapshot từ phiếu QT BH; nút **"In phiếu" + "Tải PDF"**. Sẵn sàng tích chọn ngay khi mở.
  - Tài liệu ③④ Biên bản nghiệm thu / Giấy ủy quyền (`FORM_FILL`): template editable inline (mẫu "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM…") + hint "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin." Nút **"In biên bản" / "In giấy ủy quyền"**. **KHÔNG có** nút "Upload", "Lưu phiếu". **Khối ký = display-only** (chốt 2026-06-18): chỉ render label `"Đại diện khách hàng / (Ký, ghi rõ họ tên)"` + `"Đại diện xưởng sửa chữa / (Ký, ghi rõ họ tên)"` — KHÔNG có signature canvas, KHÔNG có e-signature, KHÔNG cho ký trực tiếp trên UI. Ký giấy ngoài hệ thống (in ra rồi ký tay).
  - Footer: "Huỷ bỏ" + "Xuất hồ sơ bảo hiểm" (primary, **enable khi ≥1 checkbox tích**, BR-INS-DOSSIER-005 — KHÔNG buộc 4/4). Nội dung ③④ chỉ persist thật khi nhấn "Xuất hồ sơ bảo hiểm" (đồng bộ EC-1; KHÔNG auto-save server).
- Tab `<InsuranceDossierTab>` trong phiếu QT BH detail (thay placeholder W01):
  - **Layout 1 cột (cập nhật 2026-06-18 theo design mới — gỡ preview pane inline)**: list dọc bộ hồ sơ (mới nhất trên cùng) + grid 2-cột file PDF cards trong mỗi bộ. **KHÔNG** có preview panel inline (đã bỏ).
  - Click file card → **mở PDF trong tab mới của trình duyệt** (`<a href={url} target="_blank" rel="noopener noreferrer">` — browser native PDF viewer hiển thị). Mỗi card có thêm nút "Tải PDF" riêng (`<a download={fileName}>`) cho luồng download (không mở tab).
  - Tiêu đề bộ: "Bộ hồ sơ {mã phiếu QT}" + sub "Xuất ngày {dd/mm/yyyy hh:mm} · {N} tài liệu PDF" (N = số tài liệu được tích chọn khi xuất, ≤4).
  - Empty state: "Chưa có hồ sơ nào được xuất" (`ERR-INS-010`).
- Versioning UX: tạo bộ v2 = mở lại modal tạo hồ sơ lần mới (điền lại template từ đầu, không có "Sao chép từ bản trước"). v1 vẫn xem trong tab.
- Nút "+ Tạo hồ sơ bảo hiểm" enable khi feature flag `insurance_settlement_enabled` ON cho tenant + Bên thanh toán phiếu QT = Bảo hiểm (BR-INS-DOSSIER-011).

### 2.3 Out of Scope

- Tích hợp realtime với DN BH (PRD OS-4).
- Workflow phê duyệt nội bộ trước khi xuất hồ sơ.
- Edit nội dung 2 tài liệu auto-render (Phiếu QT + Phiếu báo giá) — read-only per epic v2.
- Master data CRUD DN BH.
- Báo cáo phân tích theo DN BH.
- Dashboard widget công nợ BH (W03).
- Xuất file XML/EDI per DN BH (PRD OS-3 out of scope).
- Native camera capture cho mobile (chỉ pick từ file system — KHÔNG capture trực tiếp trong scope này, có thể add wave sau).

### 2.4 garage-web — DEV Playbook (Pre-flight + Execution chi tiết)

> Áp dụng cùng nguyên tắc §2.4 PKG-W01. Thực hiện tuần tự **Bước 0 → 6**. **Pre-flight blockers đã GIẢI hết (2026-06-18)**: (a) Figma web đã prefetch (`Product/ux/figma-web/wave02-*.md` — đã chạy 2026-06-18 v6). DOSSIER-VIEW figma spec **KHÔNG stale** — Figma chỉ mô tả visual/layout; pattern interaction "open new tab" là decision wave-spec level (PKG §2.2 + wave-spec v4 §3 AC-4/AC-5), KHÔNG nằm trong scope Figma. (b) Upload-to-S3 blocker GIẢI (FEAT v17 chốt B-3 bỏ upload). (c) PDF preview lib blocker GIẢI (chốt 2026-06-18: gỡ inline preview pane — dùng pattern open-new-tab thay thế, không cần PDF lib trong tab).

#### Bước 0 — Đọc hiểu yêu cầu (reading list)

| # | Đọc | Trích xuất |
|---|---|---|
| 1 | `frontend/gf-gms-web/.claude/agents/agent-dev-garage-web.md` | Component Reuse Gate, Figma Workflow, Forbidden Actions |
| 2 | `Product/features/FEAT-INS-DOSSIER-CREATE.md` (Nhóm A–E) + `FEAT-INS-DOSSIER-VIEW.md` (Nhóm A–E) | AC ID web-facing (modal 4 thẻ, export subset, versioning, tab xem lại) |
| 3 | `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` — BR-INS-DOSSIER-005 (export subset) | Rule export ≥1 doc, không buộc 4/4 |
| 4 | `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.4b (op dossier) | UI action → GraphQL → REST (create/version/update-doc/export/versions/download) |
| 5 | `Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md` §3 (màn Hồ sơ BH) + §5 (states modal: Draft/Đang điền/Sẵn sàng xuất/Đang xuất/Đã xuất/Error) | Fallback khi UX-FLOW dossier riêng còn thiếu |
| 6 | Figma DEV spec web W02 (xem Bước 3 — **chưa prefetch**) | Layout — chỉ khi đã prefetch bản đúng |
| 7 | `frontend/gf-gms-web/knowledge-graph.yaml` | Component/page đã đăng ký (Reuse Gate) — reuse foundation W01 |

#### Bước 1 — Reuse-First / Component-Inventory Gate

**Reuse-first (priority order — cập nhật 2026-06-18)**: trước MỌI UI task, search KG `implementation.components` + scan codebase theo **thứ tự ưu tiên**:

1. **`src/components/customs/`** — domain-specific reusable components (ưu tiên cao nhất; thường đã đăng ký KG W01).
2. **`src/components/share/`** — cross-feature shared components.
3. **`src/components/ui/`** — shadcn primitives (ưu tiên thấp nhất; chỉ dùng khi customs/share không có).

→ **Reuse/extend component sẵn có** (ưu tiên foundation W01). **CHỈ dựng mới nếu inventory xác nhận không đủ** ở cả 3 layer (kèm lý do). Element thiếu dựng TRƯỚC + đăng ký KG rồi mới compose feature.

| UI element | Component / path (priority order: customs > share > ui) | Status |
|---|---|---|
| **Panel "Tổng giá dịch vụ" trên màn Tạo phiếu QT (STL-CREATE)** | `src/components/customs/` hoặc `src/features/.../components/` — `<InsuranceSettlementDetail>` / `<InsuranceAllocationSummary>` W01 (KG `implementation.components`) | **REUSE (read-only mode) — KHÔNG dựng mới** |
| Checkbox per dòng tài liệu | check `customs/` → `share/` → `src/components/ui/checkbox.tsx` (shadcn fallback) | REUSE |
| Modal "+ Tạo hồ sơ bảo hiểm" | check `customs/` → `share/` → `src/components/ui/dialog.tsx` (shadcn fallback) | REUSE |
| Accordion 4 dòng tài liệu | check `customs/` → `share/` → `src/components/ui/accordion.tsx` (shadcn fallback) | REUSE — verify KG inventory |
| Button "In phiếu" / "In biên bản" / "In giấy ủy quyền" / "Xuất hồ sơ bảo hiểm" / "Huỷ bỏ" / "Tải PDF" | check `customs/` → `share/` → `src/components/ui/button.tsx` (shadcn fallback) | REUSE |
| Input / Textarea (③④ editable fields) | check `customs/` → `share/` → `src/components/ui/{input,textarea}.tsx` (shadcn fallback) | REUSE |
| Pagination (tab "đã xuất") | check `customs/` → `share/` (baseline `Pagination` component) → `src/components/ui/` | REUSE |
| EmptyState (tab "đã xuất" empty) | check `customs/` → `share/` (baseline `EmptyState`) → `src/components/ui/` | REUSE |
| Template editable inline (③④) | compose Input/Textarea + display-only signature block (KHÔNG canvas/e-signature) | **BUILD-NEW `dossier-template-form`** |
| Dòng accordion (FEAT v21 — checkbox + tiêu đề + dòng phụ + mũi tên ▾) | compose accordion trigger + checkbox | **BUILD-NEW `dossier-document-row`** |
| File card (tab "đã xuất") | compose Card + icon PDF + 2 action (`<a target="_blank">` + `<a download>`) | **BUILD-NEW `dossier-document-card`** |
| Version card (tab "đã xuất") | compose Card + title + grid 2-cột file cards | **BUILD-NEW `dossier-version-card`** |
| ~~PDF preview inline (tab "đã xuất")~~ | **GỠ 2026-06-18** — pattern open-new-tab thay thế, KHÔNG cần component | **GỠ** |

> 4 component phải dựng (cập nhật 2026-06-18): `dossier-document-row` + `dossier-template-form` + `dossier-document-card` + `dossier-version-card`. **Gỡ `pdf-preview` build-new** (PDF lib blocker không còn — pattern open-new-tab thay thế). Các component còn lại reuse từ `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. **Không có** `drop-zone` upload + `badge "Sẵn sàng"/"Bổ sung"` (FEAT v21 gỡ).

#### Bước 2 — Kiểm tra contract GraphQL được bàn giao

- Ops #51-52 (agg-garage-graph-graphql v7.7): **1 mutation + 1 query** sau realign Architecture.
  - `exportInsuranceDossier(settlementCode, documentTypes, acceptanceFormData?, authorizationFormData?): DossierExportBatchResponse!` — **Orchestrator 4-phase** (BFF gọi gf-accounting/gf-sales/ct-file-storage parallel, xem §2.2). Input `acceptanceFormData` 13 nested fields strict Figma State 4 (typed); `authorizationFormData` 22 nested fields 4 sections strict Figma State 5 (typed). formData transient — KHÔNG persist.
  - `getInsuranceDossierVersions(settlementCode, page=0, size=10): InsuranceDossierVersionsResponse!` — passthrough `POST /api/v1/insurance-dossiers/search`. Response Spring Pageable `{content[], page, size, totalElements, totalPages}`. Default `page=0, size=10`, max `size=50`.
- FE consume `fileUrl` (Phase E response) hoặc `pdfUrl` (list response) trực tiếp pattern hiện hữu (anchor `<a href download>` / browser `window.open`). KHÔNG có wrapper "get file by docId" / signed URL on-demand.

#### Bước 3 — Figma spec gate (⚠ chưa prefetch + bản web chờ cập nhật)

- **Figma W02 chưa prefetch** → **BLOCK**: chạy `/prefetch-figma web 02` (FEAT-INS-DOSSIER-CREATE + VIEW) trước dev start. Bản web cũng phải là **bản đúng** (đồng bộ với cập nhật Figma đang chờ ở W01).
- `UX-FLOW-INS-DOSSIER-{CREATE,VIEW}.md` thiếu → fallback §3/§5 `UX-FLOW-INSURANCE-SETTLEMENT.md`, hoặc raise blocker nếu không đủ.

#### Bước 4 — Reference patterns + file plan (đích danh)

- **Study FIRST**: `src/features/settlement-voucher/components/detail/documents-tab.tsx` (upload pattern) + tab pattern + modal `dialog.tsx` đã dùng ở W01.
- **Target (tạo/sửa)** (cập nhật 2026-06-18 — gỡ pdf-preview):
  - `src/features/insurance-settlement/components/dossier/` — `InsuranceDossierModal.tsx`, `InsuranceDossierTab.tsx`, `dossier-document-row.tsx`, `dossier-template-form.tsx`, `dossier-document-card.tsx`, `dossier-version-card.tsx`
  - `src/features/insurance-settlement/hooks/*.ts` (dossier ops — `useExportInsuranceDossier`, `useInsuranceDossierVersions`)
  - `frontend/gf-gms-web/knowledge-graph.yaml` — đăng ký components/page dossier

#### Bước 5 — Rules phải wire

- **Export subset**: nút "Xuất hồ sơ bảo hiểm" enable khi **≥1 checkbox tích** (BR-INS-DOSSIER-005 — KHÔNG buộc 4/4; KHÔNG có progress bar).
- **Versioning UX**: modal "+ Tạo hồ sơ" lần 2 = tạo bộ **v2** (điền lại template từ đầu, KHÔNG có "Sao chép từ bản trước"; v1 vẫn xem trong tab "Hồ sơ đã xuất").
- **Form-fill ③④**: nội dung điền chỉ persist khi nhấn "Xuất hồ sơ bảo hiểm" (KHÔNG auto-save server — đồng bộ EC-1). Đóng modal trước khi xuất → mất dữ liệu.
- Feature flag `insurance_settlement_enabled` ON + Bên thanh toán phiếu QT = Bảo hiểm mới enable nút "+ Tạo hồ sơ" (BR-INS-DOSSIER-011).

#### Bước 6 — KG update + self-check + exit gate

- Như §2.4 PKG-W01 Bước 6 (KG mandatory + `.harness/_REVIEW-CHECKLIST.md` + `npm run build && lint && test --coverage` ≥ 60% + boundary clean + 3-in-1 KG). Thêm: UI layout đối chiếu **Figma W02 bản đúng đã prefetch**; upload UX chỉ wire sau khi chốt cơ chế upload-to-S3.

---

## 3. Entry Criteria

### 3.A Phase A Entry (settlement create + CR)

- [ ] **Hard Gate W01 → W02 pass**: phiếu QT BH detail stable 24h staging + SO snapshot allocation contract ADR-015 ratified + ≥ 5 phiếu QT BH test data trên staging.
- [ ] **PO sign-off** cụm 6 CR + feature Phase A: CR-20260612-01 / CR-20260612-02 / CR-20260616-01 / CR-20260616-02 / **CR-20260618-01** / **CR-20260618-02** (tất cả APPROVED, [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md)) + FEAT-INS-STL-CREATE v6. NEED CONFIRMATION đã resolve: 2 khoản "CK liên kết BH" **ẩn** trên phiếu KH (2026-06-16).
- [ ] **Print mockup chuẩn**: **3 file** `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance,service}.html` — `customer.html` + `insurance.html` cho CR-20260616-01 (phiếu QT BH/KH); **`service.html` mới (2026-06-18)** cho CR-20260618-02 (phiếu dịch vụ PDV).
- [ ] **2 cờ BFF dùng chung** confirm với BFF: (1) cờ **"SO có chọn Bảo hiểm"** + panel snapshot per-payer (A1/A2/A3/A7) → web/mobile quyết render "Phân bổ bảo hiểm" trên panel/bản in QT/bản in PDV; (2) cờ **"KH còn phân bổ BH > 0"** (`Khấu trừ BH + Khấu hao + Giảm trừ`) → backend (gf-accounting) quyết sinh phiếu QT KH "chỉ phân bổ BH" (A6); FE đọc cờ để decide layout phiếu QT KH render.
- [ ] **UX/Figma**: panel "Tổng giá dịch vụ" per-payer (3 Figma node CR-20260612-01 web GMS-v.3: 13256-45155 / 13354-56440 / 13548-92509) + panel 2 cột (A5 CR-20260616-02): SO Edit `13354-57960` / SO Detail `13354-58368` / Tạo QT `13535-159225` + **phiếu QT KH "chỉ phân bổ BH" (A6 CR-20260618-01): web GMS-v.3 `13906-29632` · mobile App GMS-v3 New Design `758-28571`** + popup hoàn thành SO + **3 print mockup HTML (`customer` + `insurance` + `service`)** — đối chiếu `UX-FLOW-INSURANCE-SETTLEMENT.md`.
- [ ] **Reuse-first** (web/mobile): tái dùng component panel "Tổng giá dịch vụ" + template in QT/PDV từ W01 + `common-printing`; chỉ thêm section "Phân bổ bảo hiểm" conditional (QT + PDV). KHÔNG dựng lại panel/template baseline. Phiếu QT KH "chỉ phân bổ BH" (A6) — template riêng (NEW, KHÔNG dùng baseline phiếu QT KH).

### 3.B Phase B Entry (dossier) — gate sau khi Phase A merged + stable

- [ ] **Hard Gate Phase A → B pass**: panel "Tổng giá dịch vụ" per-payer + template in QT + Phiếu báo giá stable trên staging (WAVE-SEQUENCE §1.2). Dossier auto-render từ snapshot Phase A.
- [ ] **Hard Gate W01 → W02 pass**: phiếu QT BH detail stable 24h staging + SO snapshot allocation contract ADR-015 ratified + ≥ 5 phiếu QT BH test data trên staging.
- [ ] **`ct-file-storage` provisioned** (Platform team — external integration):
  - Endpoint `POST /api/v1/files/upload-files` multipart available, accept `folderType="SETTLEMENTS"`.
  - Tenant header check enforce isolation per upload + fetch.
  - Lifecycle: **10 năm** retention (Luật Kế toán VN ≥10 năm — ADR-016 v11) + legal-hold flag.
  - URL pattern khó đoán; FE compose download bằng env domain config + `pdfUrl` object key. KHÔNG cần signed URL TTL endpoint.
- [ ] **MR design pre-wave merged** (SA approve):
  - HLD-ACCOUNTING update §Dossier entity tree (2 aggregate) + state machine (EXPORTED → REPLACED).
  - `gf-accounting-api.md` v16 section Dossier (**4 endpoint canonical**: 2 render-pdf POST + 1 batch POST + 1 search POST paginated).
  - INTEG-FE-INS-DOSSIER (modal + tab contract — web).
  - INTEG-MOB-INS-DOSSIER (full-screen list + màn chi tiết per tài liệu + ③④ template editable "Lưu thông tin" cục bộ + tab "Hồ sơ đã xuất" — mobile).
  - INTEG-BFF-GF-ACCOUNTING-DOSSIER (BFF orchestrator 4-phase: resolve ctx → render parallel → upload ct-file-storage → batch persist; KHÔNG signed URL — ADR-016 v11).
  - `ADR-016-insurance-dossier-pdf-s3.md` v11 RATIFIED — orchestrator pattern + ct-file-storage external + KHÔNG signed URL TTL (FE compose download bằng env domain config + pdfUrl object key); 10 năm retention. Tái dùng `common-printing`.
- [ ] **PDF template Legal approval**: mẫu 4 tài liệu (Phiếu QT + Phiếu báo giá + Biên bản nghiệm thu + Giấy ủy quyền nhận tiền bồi thường) — Legal sign-off bố cục + điều khoản chuẩn.
- [ ] **PO sign-off** FEAT-INS-DOSSIER-CREATE v7 + FEAT-INS-DOSSIER-VIEW v3 + **FEAT-INS-STL-CREATE v1**.
- [ ] **FEAT-INS-STL-CREATE (slice 0)**: web Figma node `13535-157815` thêm vào `/prefetch-figma web 02`; **Figma mobile link — NEED CONFIRMATION** (BA + Mobile UX). Reuse panel component W01 (KG confirm) — KHÔNG dựng mới.
- [ ] **Virus scan strategy** chốt (ClamAV sidecar / Lambda S3 trigger / client-side) — NEED CONFIRMATION Security.
- [ ] **Cơ chế upload file scan ③** chốt (architecture gap §2.2 — pre-signed PUT URL hoặc multipart gateway) + size limit align toàn stack (nginx 50MB, agg 50MB, gf-accounting 50MB). **Block** wire UX upload nếu chưa chốt.
- [ ] **UX-FLOW production design**: `Product/ux/UX-FLOW-INS-DOSSIER-CREATE.md` + `UX-FLOW-INS-DOSSIER-VIEW.md` verified cho **cả web + mobile**. Figma prefetched (`/prefetch-figma web 02` + `/prefetch-figma mobile 02`). ⚠ **2 file UX-FLOW dossier hiện CHƯA tồn tại + Figma web W02 chưa prefetch (bản web đang chờ cập nhật đúng) → gate phần UI visual (xem §2.4 Bước 3)**.
- [ ] **garage-web pre-flight** (xem §2.4 DEV Playbook — cập nhật 2026-06-18): (a) reuse-first/inventory gate **theo priority customs > share > ui** — reuse component foundation W01 (KG `implementation.components`), chỉ dựng mới khi inventory xác nhận thiếu ở cả 3 layer: `dossier-document-row` + `dossier-template-form` + `dossier-document-card` + `dossier-version-card` (~~`pdf-preview` GỠ — pattern open-new-tab thay thế~~) + đăng ký KG; (b) **Figma web W02** đã prefetched 2026-06-18 (`Product/ux/figma-web/wave02-*.md`); DOSSIER-VIEW có thể cần re-prefetch sau update design "open new tab"; (c) GraphQL dossier ops #51-52 confirm với BFF (1 mut + 1 query — ADR-016 v11).
- [ ] **Mobile PDF library decision**: `pdfx` / `flutter_pdfview` / `syncfusion_flutter_pdfviewer` — Mobile Lead chốt theo license + perf trên Android/iOS. **Web KHÔNG cần** (open-new-tab dùng browser native).
- [ ] **Mobile file picker + permission strategy**: iOS Photo Library + Files; Android Storage Access Framework — rationale UI confirmed.
- [ ] **Knowledge graph** gf-accounting + garage-mobile cập nhật dossier entities + screens.
- [ ] **Branch** `feature/ep-insurance-settlement-w02` tạo sau khi W01 merge.
- [ ] **PKG-W02** populated (file này).

### 3.C Testing Conventions + Harness Readiness Gate (cross-phase, áp dụng cả Phase A + B)

> **Trigger** (lesson W01): `CR-1781160847` — 53 TC `agent-test-ui` BLOCKED do `garage-web` thiếu 61 `data-testid` → stage rollback `TEST_EXECUTION → DEV`; `CR-1781166951` — `TC-W01-MOB-025` BLOCKED-by-harness (no Xcode trên Linux host); `CR-20260617-01` — exit override 3 criteria + scope-out SECURITY/MOBILE-* (W02 MUST re-enable). Tham chiếu lesson: [TL-W01-ALL-002], [TL-W01-UI-005], [TL-W01-ISO-002], [TL-W01-MUI-001/002/003], [TL-W01-MOB-E2E-001/002/003], [TL-W01-API-006], [TL-W01-UI-008], [TL-W01-PERF-003].

#### 3.C.1 Testid naming convention (W02 cluster Insurance)

Áp dụng MỌI component mới + component sửa đổi trong Phase A + B. DEV (`agent-dev-garage-web` + `agent-dev-garage-mobile` Semantics labels) wire ĐỒNG THỜI với render — KHÔNG để TEST stage phát hiện.

| Element | Pattern | Ví dụ W02 |
|---|---|---|
| Section root | `section-{slug}` | `section-tong-gia-dich-vu`, `section-phan-bo-bh`, `section-dossier-history` |
| Panel | `panel-{slug}` | `panel-can-thanh-toan`, `panel-allocation-2col` (A5) |
| Tab | `tab-{slug}` | `tab-chi-phi`, `tab-ho-so-bh-da-xuat` |
| Field input/read-only | `field-{slug}` | `field-tong-tien-bh-tra` (read-only computed CNF-INS-001), `field-acceptance-customer-name` |
| Button | `button-{slug}` | `button-tao-ho-so-bh`, `button-xuat-ho-so`, `button-tai-pdf`, `button-huy-bo`, `button-in-phieu` |
| Dialog/modal | `dialog-{slug}` | `dialog-tao-ho-so-bh`, `dialog-hoan-thanh-pdv` (CR-20260612-02) |
| Accordion row | `row-doc-{type}` | `row-doc-quotation-sheet`, `row-doc-settlement-sheet`, `row-doc-acceptance-record`, `row-doc-payment-authorization` |
| Checkbox subset | `checkbox-doc-{type}` | `checkbox-doc-quotation-sheet` … (BR-INS-DOSSIER-005 — default unchecked) |
| File card (tab "đã xuất") | `card-file-{type}` | `card-file-acceptance-record` (mỗi card có `button-open-pdf` + `button-tai-pdf`) |
| Version card | `card-version-v{N}` | `card-version-v1`, `card-version-v2` |
| Empty state | `empty-state-{scope}` | `empty-state-dossier-history` (`ERR-INS-010`) |
| Inline warning | `warning-{code}` | `warning-err-ins-003` (popup hoàn thành SO — BH thanh toán âm) |
| Signature block (display-only) | `signature-display-{role}` | `signature-display-customer`, `signature-display-workshop` (chốt 2026-06-18: KHÔNG canvas/e-signature) |
| Allocation row | `row-alloc-{slug}` | `row-alloc-ck-vat-tu`, `row-alloc-giam-tru`, `row-alloc-khau-hao`, `row-alloc-khau-tru` (×2 cột BH \| KH cho A5) |

**Cross-feature reuse rule**: panel "Tổng giá dịch vụ" (3 khối: Chi tiết per-payer + Phân bổ Bảo hiểm + Cần thanh toán) DÙNG CÙNG testid trên 4 màn (SO Edit / SO Detail / Tạo phiếu QT / Chi tiết QT) — KHÔNG đặt testid mới khi tái dụng component. TEST agent dùng PARENT scope locator để phân biệt context (vd `[data-page="so-edit"] [data-testid="panel-can-thanh-toan"]`).

#### 3.C.2 Harness Readiness Gate (pre-/test-exec preflight — block entry nếu fail)

TEST agents chạy preflight ở Step 0 trước khi spawn TC suite. Output preflight report `Execution/test-reports/W02/preflight-report.md`.

**Web** (`agent-test-ui` + `agent-test-e2e`)
- [ ] `garage-web` reachable trên staging port; route smoke `/service-order/{code}/{edit}`, `/settlement-voucher/create`, `/settlement-voucher/{code}` (singular path per memory [garage-web-route-singular-vs-api-plural]).
- [ ] Auth probe: sso-stub `GET /dev/token?identifier=accountant@demo.local` → `accessToken` non-empty ([TL-W01-PERF-003]).
- [ ] **Testid coverage probe**: grep components in-scope W02 — `frontend/gf-gms-web/src/components/customs/insurance-*`, `frontend/gf-gms-web/src/features/insurance-settlement/components/dossier/` — coverage matrix §3.C.1 ≥ 95%; missing testid block `/test-exec` ([TL-W01-UI-005], [TL-W01-ALL-002]).
- [ ] DOM probe post-login: sidebar/nav selector verified (KHÔNG assume — [TL-W01-E2E-004]); tab buttons dùng `getByRole('tab', { name })` không `getByText()` ([TL-W01-E2E-005]).

**Mobile** (`agent-test-mobile-ui` + `agent-test-mobile-e2e`)
- [ ] `flutter --version` ≥ 3.41 ([TL-W01-MUI-001], [TL-W01-MOB-E2E-001]); `dart --version` ≥ 3.11.
- [ ] `patrol --version` ≥ 2.8.0; harness `Execution/auto/harness/patrol/` đủ `android/gradlew` + `lib/main.dart` + `integration_test/` + `android/app/src/androidTest/MainActivityTest.java` ([TL-W01-MOB-E2E-003]).
- [ ] `alchemist` pinned `0.10.0` + Flutter SDK upper bound `<3.44.0` trong harness pubspec ([TL-W01-MUI-002]).
- [ ] Package probe: `mobile/gf-garage-app/pubspec.yaml` `name: cardoctor_garage_v3` (KHÔNG `garage_mobile`); lib path `lib/ui/service_order/insurance/` + `lib/ui/insurance_settlement/dossier/` ([TL-W01-MUI-003]).
- [ ] Android emulator booted (`adb devices` non-empty) HOẶC physical device.
- [ ] BFF URL: Android emulator `http://10.0.2.2:45401`, iOS simulator `http://localhost:45401` ([TL-W01-MOB-E2E-002]).
- [ ] **iOS scope decision UPFRONT**: nếu host = Linux (no Xcode) → mọi TC iOS-specific PHẢI mark `SKIPPED-out-of-wave-by-CR` ngay tại TEST_PLANNING ([CR-1781166951] precedent); nếu macOS CI runner ready → re-enable. KHÔNG để BLOCKED đến /test-exec.

**API** (`agent-test-api`)
- [ ] `agg-garage-graph` reachable; SDL introspection smoke verify field shape match spec — BFF reshape sau spec submit triggers re-review ([TL-W01-API-006]).
- [ ] gf-accounting + gf-sales `/actuator/health` 200.
- [ ] Seed verify: ≥3 SO BH `status=COMPLETED` + ≥3 SO BH `status=PRICING` với `has_insurance=true` + INSURANCE parts `is_deleted=false` ([TL-W01-API-004], [TL-W01-UI-011]); precondition state machine theo endpoint ([TL-W01-API-001]).
- [ ] Error code registry final read (`BR-EP-INSURANCE-SETTLEMENT §5.5` + `Product/error-code/ERROR-CODE-REGISTRY.md`) — verify HTTP status mapping current ([TL-W01-API-002]).

**Security** (`agent-test-security`) — re-enable per [CR-20260617-01]
- [ ] Security agent IN-SCOPE cho W02 (KHÔNG default scope-out như W01 override).
- [ ] OWASP top-10 + tenant isolation matrix + ct-file-storage URL leak check (Phase B) ready.

**Isolation** (`agent-test-isolation`)
- [ ] sso-stub multi-tenant mint check: nếu `SIM_TENANT_ID=1` cố định → forge HS256 cho tenant 2 ([TL-W01-ISO-001]).

#### 3.C.3 TC artifact ↔ implementation cross-ref (TEST_PLANNING exit gate)

- [ ] TC artifact (`Execution/test-cases/ep-insurance-settlement-w02-{api,e2e,ui,mobile-ui,mobile-e2e,isolation,security,performance}.md`) reference EXACT testid từ §3.C.1.
- [ ] Cross-ref grep: mỗi `data-testid="..."` trong TC spec PHẢI tồn tại trong codebase (`grep -r 'data-testid="X"' frontend/gf-gms-web/src`); orphan testid trong TC → BLOCK handoff sang TEST_EXECUTION.
- [ ] **Spec count == TC count** trước handoff ([TL-W01-UI-008]) — defer label `auto-miss` không `BLOCKED-by-*`.
- [ ] **Defer-upfront**: TC không runnable do harness gap (iOS-only, macOS toolchain, mobile native plugin path dep) → mark `SKIPPED-out-of-wave-by-CR` + raise CR ngay tại TEST_PLANNING; KHÔNG đẩy đến /test-exec ([CR-1781166951] precedent).
- [ ] **Worked-example formula gate** ([TL-W01-API-007]): BR worked example với số cụ thể (vd 197,680,000 BH / 35,720,000 KH) PHẢI có ≥1 TC assert computed output cuối (`insurancePayable`, `customer_amount`, `total_amount`) — KHÔNG stop ở "input persisted".
- [ ] TR (Test Report) verdict template reflect L1 BUGS.md (không stale FAIL/NO-GO khi L1 VERIFIED — [CR-20260617-01] lesson).

#### 3.C.4 DEV exit gate (DEV → REVIEW handoff)

- [ ] `agent-dev-garage-web` self-check: `grep -rE 'data-testid' frontend/gf-gms-web/src/features/insurance-settlement frontend/gf-gms-web/src/components/customs/insurance-*` — coverage ≥ 95% theo matrix §3.C.1.
- [ ] `agent-dev-garage-mobile` self-check: `grep -rE 'Semantics\(label:|key:.*Key' mobile/gf-garage-app/lib/ui/insurance_settlement mobile/gf-garage-app/lib/ui/service_order/insurance` — semantic labels phủ interactive widgets.
- [ ] REVIEW gate (`agent-review-garage-web`, `agent-review-garage-mobile`): testid/Semantics coverage check — missing trên interactive component = REVIEW FAIL không merge.

---

## 4. Agent Assignments

### 4.1 DEV Agents

#### Phase A — Settlement create + CR (~2 ngày)

| Agent | Boundary | Tasks | Estimated Effort |
|---|---|---|---|
| `agent-dev-gf-accounting` | `gf-accounting` | A1 FEAT-INS-STL-CREATE: panel "Tổng giá DV" read-only màn Tạo phiếu QT (snapshot SO) + "Tổng tiền bảo hiểm trả" read-only computed (AC-6) + snapshot phân bổ vào cặp QT (AC-7). A2 CR-20260612-01: panel chi tiết QT tách per-payer (ẩn 2 khoản CK liên kết BH trên phiếu KH). **A3 CR-20260616-01 — OWNER template QT**: update `SettlementPrintStrategy` (common-printing) — 2 variant `settlement-insurance.html` (5 khoản dấu −) + `settlement-customer.html` (3 khoản dấu +, **ẩn** 2 CK liên kết BH); render context lấy từ `settlement_records` + for-print snapshot (gf-sales) — KHÔNG gọi gf-sales template. SO không BH giữ template baseline. **Golden test** 2 mockup HTML `print-{insurance,customer}.html`. Extend màn production, KHÔNG rebuild. | ~6h |
| `agent-dev-gf-sales` | `gf-sales` | **A4 CR-20260612-02**: popup "Hoàn thành phiếu dịch vụ" cảnh báo Tổng BH thanh toán < 0 (`ERR-INS-003`, warn-and-allow); cung cấp giá trị "Bảo hiểm thanh toán" computed cho popup (~1h). **A7 CR-20260618-02 — OWNER template PDV**: update `ServiceOrderPrintStrategy` V3 (common-printing) — extend template `service-order-v3.html` thêm section "Phân bổ bảo hiểm" 5 khoản × 2 cột + 3-dòng "Cần thanh toán" (BH/KH/Tổng) + dòng "bằng chữ" bám `customerPayment`; conditional theo cờ `has_insurance` (SO không BH giữ baseline 1 dòng "Tổng thanh toán"). **Golden test** khớp `print-service.html` (~2h). **A3 support CR-20260616-01**: extend response `/protected/v1/service-orders/{tenantId}/{code}/for-print` trả thêm `breakdownByPayer` per-payer 5 khoản (input cho gf-accounting `SettlementPrintStrategy`); contract test verify shape khớp common-printing context schema (~1h). | ~6h |
| `agent-dev-agg-garage-graph` | `agg-garage-graph` | Expose cờ "SO có chọn Bảo hiểm" + panel snapshot per-payer + giá trị "Bảo hiểm thanh toán" computed cho popup; mở rộng response màn Tạo QT / chi tiết QT. **A5**: đảm bảo response trả **giá trị từng khoản phân bổ tách theo BH và KH** (không chỉ tổng) để FE render 2 cột. Contract test. | ~2h |
| `agent-dev-garage-web` | `garage-web` | Render panel "Tổng giá DV" per-payer (màn Tạo QT + chi tiết QT) + popup cảnh báo BH âm + bản in QT mới (web print) theo cờ SO có BH. **A5**: reflow khối "Phân bổ Bảo hiểm" + "Cần thanh toán" → 2 cột (BH \| KH) trên 3 màn (SO Edit/Detail + Tạo QT) theo Figma `13354-57960`/`13354-58368`/`13535-159225`. **Reuse-first**: tái dùng component panel + template in W01, chỉ thêm section "Phân bổ bảo hiểm" conditional + reflow 2 cột — KHÔNG dựng lại. | ~4h |
| `agent-dev-garage-mobile` | `garage-mobile` | Tương đương web: panel per-payer + popup cảnh báo BH âm + bản in/share-PDF QT. **A5**: reflow "Phân bổ Bảo hiểm" + "Cần thanh toán" → 2 cột, xử lý responsive màn hẹp (thu gọn nhãn / wrap). Reuse component panel + template in W01. | ~4h |

> **Parallel safety Phase A**: 5 boundary song song ngày 1; `agg-garage-graph` cờ + panel snapshot + giá trị per-payer từng khoản (A5) ngày 1 (gate cho web/mobile render); web/mobile populate ngày 1-2. Phần lớn reuse từ W01. Panel "Tổng giá dịch vụ" dùng chung 3 màn (SO Edit/Detail + Tạo QT) — sửa 1 component áp cả 3.

#### Phase B — Insurance Dossier (~4 ngày)

| Agent | Boundary | Tasks | Estimated Effort |
|---|---|---|---|
| `agent-dev-gf-accounting` | `gf-accounting` | **[CR-01, ngày 1] `GetSettlementDetail`: phiếu BH chỉ trả cột BH; phiếu KH trả cờ `soHasInsurance` + block "Phân bổ Bảo hiểm" có điều kiện — ~1.5h.** **[slice 0 STL-CREATE] response màn Tạo phiếu QT trả block `insuranceAdjustment` read-only (reuse tính server-side W01, BR-INS-STL-CRE-003) + "Tổng tiền bảo hiểm trả" bên BH read-only = computed (CNF-INS-001) — ~2h.** [dossier] 2 aggregate (`insurance_dossiers` + `insurance_dossier_documents`) + state machine EXPORTED→REPLACED (no DRAFT) + **4 endpoint canonical** §3bis (2 render-pdf + 1 batch + 1 search paginated Spring Pageable) + PDF gen ③④ qua common-printing + **export subset** (is_selected) + ct-file-storage external integration (KHÔNG direct S3, KHÔNG signed URL TTL — ADR-016 v11) + integration test lifecycle | ~8h |
| `agent-dev-gf-sales` | `gf-sales` | **[CR-02, ngày 1] cung cấp giá trị "Bảo hiểm thanh toán" computed cho popup hoàn thành SO (reuse tính server-side); không đổi luồng hoàn thành — ~0.5h** | ~0.5h |
| `agent-dev-agg-garage-graph` | `agg-garage-graph` | **[CR-01] `getSettlementDetail` trả cờ `soHasInsurance` + block "Phân bổ Bảo hiểm" cho phiếu KH — ~0.5h.** **[slice 0] query mở màn tạo phiếu QT extend block `insuranceAdjustment` (reuse type W01) — ~1h.** [dossier] **1 mutation + 1 query** GraphQL (agg #51-52, ADR-016 v11): `exportInsuranceDossier` orchestrator 4-phase (Phase A resolve ctx → B parallel render N byte[] → C upload ct-file-storage → D batch persist → E aggregate) + `getInsuranceDossierVersions` passthrough `POST /search` Spring Pageable + contract test (happy + 4 abort scenarios) | ~5h |
| `agent-dev-garage-web` | `garage-web` | **[CR-01] phiếu BH panel chỉ 1 cột BH (bỏ cột/dòng KH); phiếu KH render "Phân bổ Bảo hiểm" có điều kiện `soHasInsurance` — reuse component panel, ~1h. [CR-02] popup hoàn thành SO render cảnh báo BH âm (warn-and-allow) — ~0.5h.** **[slice 0] gắn panel "Tổng giá dịch vụ" read-only lên màn Tạo phiếu QT — REUSE component panel W01, hiển thị có điều kiện SO có/không BH (BR-INS-STL-CRE-009); KHÔNG dựng mới — ~1.5h.** [dossier] Dossier create modal (accordion dọc 4 dòng + footer export subset, ③④ khối ký display-only) + `<InsuranceDossierTab>` (list bộ + grid file cards + open-new-tab PDF, KHÔNG preview pane) + versioning UX + wire GraphQL dossier ops **→ pre-flight + reuse-first/inventory gate priority customs > share > ui (reuse foundation W01; chỉ dựng mới `dossier-document-row` + `dossier-template-form` + `dossier-document-card` + `dossier-version-card` nếu inventory xác nhận thiếu — GỠ `pdf-preview` build-new) + file plan đích danh: §2.4 DEV Playbook** | ~6h |
| `agent-dev-garage-mobile` | `garage-mobile` | **[CR-01] phiếu BH/KH panel tách hiển thị tương đương web (NEED CONFIRMATION Figma mobile). [CR-02] popup hoàn thành SO cảnh báo BH âm — ~1.5h tổng.** **[slice 0] panel "Tổng giá dịch vụ" read-only trên màn tạo phiếu QT (reuse panel screen W01) — ~1.5h; NEED CONFIRMATION Figma mobile.** [dossier] `InsuranceDossierScreen` full-screen (AppBar + ListView dọc 4 dòng tài liệu, checkbox mặc định bỏ trống — KHÔNG progress bar/badge per FEAT v21) + `DossierDocumentDetailScreen` per tài liệu (①② AUTO_RENDER preview, ③④ FORM_FILL template editable + nút "Lưu thông tin" cục bộ phiên, KHÔNG persist server — EC-1) + bottom action "Xuất hồ sơ bảo hiểm" + tab "Hồ sơ bảo hiểm đã xuất" + `DossierPreviewScreen` PDF embedded (NEED CONFIRMATION PDF lib) + download PDF (KHÔNG file picker / upload / permission — FEAT v17 chốt B-3 bỏ upload) | ~5h |

> **Parallel safety Phase B**: 4 boundary. **Chỉ start sau hard gate Phase A → B** (panel + template in stable). **Slice 0 STL-CREATE chạy ngày 1 đầu wave** (reuse panel W01, không phụ thuộc dossier entity → không bị gate bởi schema dossier). gf-accounting dossier entity schema phải chốt cuối ngày 1 Phase B → BFF + Web + Mobile wire skeleton dossier trước rồi populate ngày 2-4. Mobile cần buffer 0.5d cho permission handling.

### 4.2 REVIEW Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-review-backend` | Java code gf-accounting (entity + PDF + S3 + endpoints) + Node code agg-garage-graph | Post-DEV handoff |
| `agent-review-garage-web` | React modal + tab + a11y + file upload UX (scan ③) | Post-DEV handoff |
| `agent-review-garage-mobile` | Flutter screen + BLoC + template editable inline ③④ + "Lưu thông tin" cục bộ (không persist server) + PDF preview (tab "Hồ sơ đã xuất") + a11y | Post-DEV handoff |

### 4.3 TEST Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-test-api` | **Phase A contract**: (a) **`/protected/v1/service-orders/{tenantId}/{code}/for-print`** (gf-sales) — response trả `breakdownByPayer` 5 khoản per-payer (BH/KH values) khớp computed snapshot W01 (BR-INS-STL-CRE-003); là input cho gf-accounting `SettlementPrintStrategy`. **Phase B**: 4 endpoint canonical (2 render-pdf + 1 batch + 1 search) + **search pagination Spring Pageable** (`{settlementCode, page, size}` body; max `size=50`; `content[]` + `totalElements/totalPages/page/size`); BFF orchestrator 4-phase happy + abort scenarios (Phase B render fail → no batch, Phase D persist fail → atomic rollback); error cases (settlement không tồn tại 404, ③④ thiếu trường bắt buộc 400, export với 0 tài liệu 400) | TEST_PLANNING |
| `agent-test-e2e` | Tạo dossier → click accordion 4 dòng (web) / tap list+detail (mobile) → điền template ③④ → tích chọn subset → xuất PDF (riêng từng file qua ct-file-storage) → vào tab xem lại (paginated list — verify nhiều trang nếu > 10 versions) → tải PDF (FE nối domain + ct-file-storage URL); flow versioning v1 → v2 (v1 `REPLACED`); mobile "Lưu thông tin" cục bộ trong phiên (đóng app trước xuất → mất) | TEST_PLANNING |
| `agent-test-ui` | **Phase A print assertions**: (a) **bản in QT BH/KH** (gf-accounting `SettlementPrintStrategy`) — section "Phân bổ bảo hiểm" phiếu BH 5 khoản dấu − / phiếu KH 3 khoản dấu + (ẩn 2 CK liên kết BH) / SO không BH = baseline (no section) — khớp `print-{insurance,customer}.html`; (b) **bản in PDV** (gf-sales `ServiceOrderPrintStrategy` V3) — section "Phân bổ bảo hiểm" 5 khoản × 2 cột + 3-dòng "Cần thanh toán" + "bằng chữ" bám Khách hàng thanh toán; SO không BH = baseline (no section, 1 dòng "Tổng thanh toán") — khớp `print-service.html`. **Phase B dossier**: Modal accordion dọc (web) — click dòng mở rộng preview/template inline + checkbox state + footer enable rule (≥1 tích chọn + tài liệu hoàn tất); ③④ khối ký display-only (KHÔNG canvas, KHÔNG e-signature); list+detail (mobile); tab list bộ với pagination (load more / page indicator) + **click file card → open new tab PDF** (browser native — không assert preview iframe) + responsive; a11y keyboard nav | TEST_PLANNING |
| `agent-test-isolation` | Tenant A không thấy dossier tenant B trong response `POST /search`; ct-file-storage tenant header check; cross-tenant `pdfUrl` không truy cập được | TEST_PLANNING (periodic) |
| `agent-test-security` | Bucket/ct-file-storage access policy enforce tenant prefix; authz dossier per persona; SSRF nếu PDF render fetch external; XSS template injection trong formData ③④ (Thymeleaf sanitization) | TEST_PLANNING (periodic) |
| `agent-test-performance` | PDF gen 4 tài liệu/bộ p95 < 5s; concurrent export 5 bộ song song no contention; ct-file-storage upload latency p99 < 2s | TEST_PLANNING (periodic) |

---

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests

#### Phase A — Settlement create + CR

- [ ] **gf-accounting (A1 FEAT-INS-STL-CREATE)**: panel "Tổng giá dịch vụ" read-only màn Tạo phiếu QT (3 khối, snapshot SO) + "Tổng tiền bảo hiểm trả" read-only computed (AC-6) + snapshot phân bổ vào cặp QT khi xác nhận (AC-7). Hiển thị có điều kiện theo SO có BH (BR-INS-STL-CRE-009). Extend màn baseline, KHÔNG rebuild. response màn Tạo phiếu QT (Bảo hiểm) trả block `insuranceAdjustment` read-only (breakdownByPayer + 5 adjustments + settlementBalance) — reuse logic server-side W01 (BR-INS-STL-CRE-003), unit test khớp ví dụ 197,680,000 BH / 35,720,000 KH (CNF-INS-001). KHÔNG entity/migration mới.
- [ ] **gf-accounting (A2 CR-20260612-01)**: panel chi tiết QT tách per-payer — phiếu **BH** 1 cột "Bảo hiểm thanh toán" + bỏ dòng KH ở "Cần thanh toán" + giữ "Tổng thanh toán" + giữ "Phân bổ Bảo hiểm"; phiếu **KH** từ SO có BH thêm "Phân bổ Bảo hiểm" 3 khoản (dấu +) render **chỉ khi `soHasInsurance`**, **ẩn** 2 khoản CK liên kết BH; BFF trả cờ `soHasInsurance`. AC coverage FEAT-INS-STL-DETAIL AC-6 (rewrite) — web + mobile. (Reuse component, không tạo dup.)
- [ ] **gf-accounting (A3 OWNER template QT — CR-20260616-01)**: `SettlementPrintStrategy` (common-printing) — 2 variant `settlement-insurance.html` (5 khoản dấu −) + `settlement-customer.html` (3 khoản dấu +, ẩn 2 CK liên kết BH per chốt 2026-06-16). Render context từ `settlement_records` + for-print snapshot gf-sales (cross-ref deliverable A3-support gf-sales). Phiếu QT từ SO không BH giữ template baseline. **Golden test khớp 2 mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html`**.
- [ ] **gf-sales (A7 OWNER template PDV — CR-20260618-02)**: `ServiceOrderPrintStrategy` V3 (common-printing) — extend `service-order-v3.html` với section "Phân bổ bảo hiểm" 5 khoản × 2 cột (BH dấu − / KH dấu + hoặc 0) + khối "Cần thanh toán" 3 dòng (Bảo hiểm thanh toán / Khách hàng thanh toán / Tổng thanh toán bold) + dòng "bằng chữ" bám Khách hàng thanh toán. Conditional theo cờ `has_insurance`; SO không BH giữ baseline 1 dòng "Tổng thanh toán". **Golden test khớp `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-service.html`**.
- [ ] **gf-sales (A3 support — CR-20260616-01 data extend)**: response `/protected/v1/service-orders/{tenantId}/{code}/for-print` trả thêm `breakdownByPayer` 5 khoản per-payer (BH/KH allocation values) — input cho gf-accounting `SettlementPrintStrategy`. **Contract test** verify shape khớp common-printing context schema; total = computed snapshot W01 (BR-INS-STL-CRE-003).
- [ ] **gf-sales (A4 CR-20260612-02)**: popup "Hoàn thành phiếu dịch vụ" render cảnh báo `ERR-INS-003` khi Tổng "Bảo hiểm thanh toán" < 0; nút "Xác nhận" vẫn enable (warn-and-allow, không chặn); vẫn hoàn thành SO. AC coverage FEAT-INS-SO-ADJUSTMENT AC-17 — web + mobile.
- [ ] **garage-web + garage-mobile (A5 CR-20260616-02)**: panel "Tổng giá dịch vụ" — khối "Phân bổ Bảo hiểm" + "Cần thanh toán" reflow 1 cột → **2 cột (BH \| KH)** dóng thẳng, mỗi khoản +/− đúng cột, trên 3 màn (SO Edit/Detail + Tạo QT). Khớp Figma `13354-57960` / `13354-58368` / `13535-159225`. Display-only (không đổi số liệu); mobile xử lý responsive màn hẹp. KHÔNG áp màn chi tiết QT (1-cột per-payer).
- [ ] **agg-garage-graph (Phase A)**: response trả cờ "SO có chọn Bảo hiểm" (`soHasInsurance`) + panel snapshot per-payer + giá trị "Bảo hiểm thanh toán" computed cho popup + block `insuranceAdjustment` (reuse type W01) + **giá trị từng khoản phân bổ tách BH/KH** (A5 — render 2 cột). Contract test.
- [ ] **garage-web + garage-mobile (Phase A)**: render panel "Tổng giá DV" per-payer (màn Tạo QT + chi tiết QT) + panel "Tổng giá dịch vụ" read-only trên màn Tạo phiếu QT (reuse component panel W01, hiển thị có điều kiện SO có/không BH — BR-INS-STL-CRE-009; mobile gate bởi Figma mobile NEED CONFIRMATION) + popup cảnh báo BH âm + bản in QT mới theo cờ SO có BH. **Reuse-first**: tái dùng component panel + template in W01, chỉ thêm section "Phân bổ bảo hiểm" conditional + reflow 2 cột (A5) — KHÔNG dựng lại (đối chiếu KG `implementation.components`).
- [ ] **AC coverage Phase A** 100% FEAT-INS-STL-CREATE (Nhóm A-D) + scope 4 CR — web + mobile; reuse-first gate thỏa (panel reuse, không dup).
- [ ] **Build/lint/test pass** các boundary chạm Phase A (gf-accounting, gf-sales, agg-garage-graph, garage-web, garage-mobile) — threshold như §5.1 Phase B.
- [ ] **Hard gate A → B verified**: panel per-payer + template in QT/báo giá stable trên staging trước khi start Phase B.

#### Phase B — Insurance Dossier

- [ ] **gf-accounting**: 2 aggregate (`insurance_dossiers` + `insurance_dossier_documents`) + state machine `EXPORTED → REPLACED` (immutable + `replaced_by_version`) + **4 endpoint canonical** §3bis: (1) `POST /insurance-dossier-documents/acceptance-record/render-pdf`, (2) `POST /insurance-dossier-documents/payment-authorization/render-pdf`, (3) `POST /insurance-dossier-documents/batch` (atomic persist N docs), (4) `POST /insurance-dossiers/search` (paginated Spring Pageable). ddl-auto=update apply success staging. **KHÔNG** có cột `form_data` JSONB / `uploaded_file_url` / enum value `UPLOAD`.
- [ ] **gf-accounting**: PDF render ①② baseline reuse (gf-sales `service-orders/{id}/export-pdf?type=QUOTATION` + gf-accounting `settlements/{id}/export-pdf`) — KHÔNG dev mới. ③④ render qua common-printing + 2 PrintStrategy + 2 PrintContext (minimal wrap formData) + 2 template Thymeleaf bind 100% `${formData.X}` — golden file test 3 case per template (trường prefill vs nhập tay vs clauses[]).
- [ ] **gf-accounting**: **export subset** — batch chỉ persist tài liệu `is_selected=true` (KHÔNG bắt buộc 4/4, BR-INS-DOSSIER-005); `pdf_url` lưu ct-file-storage object key (no scheme/domain); retention 10 năm metadata ở ct-file-storage Platform config.
- [ ] **gf-accounting**: list `POST /search` pagination contract test — body `{settlementCode, page, size}`; response `{content[], page, size, totalElements, totalPages}`; default page=0, size=10; reject size>50 with 400; verify descending by versionNo.
- [ ] **agg-garage-graph**: **1 mutation + 1 query** (đúng tên agg #51-52) — Vitest contract test pass. Mutation `exportInsuranceDossier` orchestrator 4-phase: contract test happy + 4 abort scenarios (Phase B render fail, Phase C upload fail, Phase D persist fail, validation fail). Query `getInsuranceDossierVersions` pagination input pass-through `POST /search`.
- [ ] **garage-web**: dossier create modal **accordion dọc** + `<InsuranceDossierTab>` implemented theo Figma DEV spec, trên design system hiện hữu. Click dòng accordion mở rộng preview/template inline; checkbox mặc định bỏ trống; ③④ template editable.
- [ ] **garage-web**: versioning UX — bộ v2 tạo độc lập (điền lại template từ đầu, không "Sao chép từ bản trước"), tab list hiển thị cả v1 và v2.
- [ ] **garage-web**: reuse-first/inventory gate thỏa **theo priority customs > share > ui** — reuse foundation W01, không tạo dup; chỉ dựng mới khi inventory xác nhận thiếu ở cả 3 layer; `dossier-document-row` + `dossier-template-form` + `dossier-document-card` + `dossier-version-card` dựng ngay; **GỠ `pdf-preview`** (cập nhật 2026-06-18: open-new-tab pattern thay thế); 4 component build-new đăng ký KG (§2.4 Bước 1).
- [ ] **garage-web**: UI layout đối chiếu **Figma W02 bản đúng** đã prefetch.
- [ ] **garage-mobile**: `InsuranceDossierScreen` full-screen list 4 dòng + `DossierDocumentDetailScreen` per tài liệu per Figma DEV spec; bottom action "Xuất hồ sơ bảo hiểm" enable theo subset rule.
- [ ] **garage-mobile**: ③④ template editable inline + nút **"Lưu thông tin"** = lưu cục bộ trong phiên/màn (KHÔNG persist server, đồng bộ EC-1). Test lifecycle: điền → back → re-tap dòng → giữ nội dung trong phiên; đóng app trước "Xuất hồ sơ" → mất.
- [ ] **garage-mobile**: PDF embedded preview qua `pdfx` (hoặc lib chốt) cho tab "Hồ sơ đã xuất" — render OK trên Android API 28+ + iOS 14+.
- [ ] **garage-mobile**: tab "Hồ sơ bảo hiểm đã xuất" — `ListView` bộ hồ sơ + preview PDF + download về Downloads folder qua `path_provider`.
- [ ] **garage-mobile**: versioning UX tương đương web.
- [ ] **AC coverage** 100% FEAT-INS-DOSSIER-CREATE (Nhóm A-D) + FEAT-INS-DOSSIER-VIEW (Nhóm A-C) — cả web + mobile.
- [ ] **Build/lint/test pass per boundary** với coverage threshold:
  - `cd services/gf-accounting && ./gradlew build checkstyleMain test jacocoTestReport` — coverage ≥ 80%
  - `cd garage-functions/agg-garage-graph && npm run build && npm run typecheck && npm test -- --coverage` — coverage ≥ 80%
  - `cd frontend/gf-gms-web && npm run build && npm run lint && npm test -- --coverage` — coverage ≥ 60%
  - `cd mobile/gf-garage-app && flutter analyze && flutter test --coverage && flutter build apk --debug` — coverage ≥ 60%
- [ ] **Integration test** `InsuranceDossierLifecycleIT.java` — full lifecycle (BFF orchestrator: resolve ctx → render ③④ qua render-pdf endpoints → upload ct-file-storage → batch persist N docs → list `POST /search` paginated → versioning v2 + v1 `REPLACED`). Verify `pdfUrl` field carry ct-file-storage object key (no scheme/domain).
- [ ] **Mobile integration test** `mobile/gf-garage-app/integration_test/insurance_dossier_test.dart` — full lifecycle trên Android + iOS device thật.
- [ ] **Automated TCs** registered: `Execution/test-cases/ep-insurance-settlement-w02-{api,e2e,ui,isolation,performance,security}.md`.

### 5.2 Architecture & Docs

- [ ] Knowledge graph updated: gf-accounting (2 aggregate dossier) + agg-garage-graph (mutations/queries) + garage-web (components).
- [ ] HLD-ACCOUNTING + API + INTEG + ADR-016 markdown open item → CLOSED + reference FEAT-INS-DOSSIER-* ID.
- [ ] **Version bump 3-in-1** mọi file đã sửa.
- [ ] Operational runbook `Tracking/runbooks/insurance-dossier-ops.md` — recovery steps khi ct-file-storage fail / PDF gen fail / BFF orchestrator phase abort.

### 5.3 Quality Gates

- [ ] `agent-review-backend` finding P1=0; P2 ≤ 3 với ticket.
- [ ] `agent-review-garage-web` finding P1=0; P2 ≤ 3.
- [ ] `agent-review-garage-mobile` finding P1=0; P2 ≤ 3 (đặc biệt: template editable inline ③④ + "Lưu thông tin" cục bộ phiên + lifecycle EC-1).
- [ ] `bash scripts/scan-boundary.sh` exit 0.
- [ ] Security scan clean: 0 CRITICAL/HIGH; ct-file-storage tenant prefix enforce isolation; cross-tenant `pdfUrl` request → 403; XSS template injection trên formData ③④ bị Thymeleaf sanitize.
- [ ] Tenant isolation: cross-tenant `pdfUrl` request → 403 Forbidden (ct-file-storage tenant prefix enforce).
- [ ] Performance: PDF gen 4 tài liệu p95 < 5s; concurrent 5 export no DB contention.
- [ ] AC coverage 100%.
- [ ] PR commit message reference `FEAT-INS-DOSSIER-CREATE` / `FEAT-INS-DOSSIER-VIEW` ID.

### 5.4 Demo

- [ ] Demo script `Tracking/demos/ep-insurance-settlement-w02-demo.md` chuẩn bị xong, **9 scenarios** (2 CR + slice 0 mở màn):
  - **[CR-01]** Phiếu QT BH panel chỉ cột BH (không lẫn KH); phiếu QT KH (từ SO có BH) có "Phân bổ Bảo hiểm"; phiếu QT KH (từ SO không BH) không có "Phân bổ Bảo hiểm".
  - **[CR-02]** SO có BH thanh toán âm → popup hoàn thành hiện cảnh báo nhưng vẫn cho "Xác nhận" hoàn thành.
  0. **[STL-CREATE]** Mở SO có dòng Bảo hiểm (đã hoàn thành) → "Tạo phiếu quyết toán" → màn xác nhận hiển thị panel "Tổng giá dịch vụ" read-only (số khớp panel SO W01) → "Tổng tiền bảo hiểm trả" read-only computed → "Xác nhận" tạo cặp phiếu QT. (SO không BH → panel rút gọn 1 cột KH.)
  1. Mở phiếu QT BH → "+ Tạo hồ sơ bảo hiểm" → modal mở với 2/4 sẵn sàng.
  2. Preview Phiếu báo giá auto-render — verify snapshot phân bổ chính xác.
  3. Upload Biên bản (PDF 2MB) + Giấy ủy quyền (PDF 1.5MB) → progress 4/4.
  4. Xuất hồ sơ → PDF (subset is_selected) generated + uploaded S3 + bộ `EXPORTED` v1.
  5. Tab "Hồ sơ bảo hiểm đã xuất" → list bộ v1 + click file card mở PDF tab mới + nút "Tải PDF" download (ct-file-storage URL, KHÔNG signed URL TTL).
  6. Simulate BH yêu cầu sửa → tạo bộ v2 → tab hiển thị cả v2 và v1.
- [ ] PO + Legal stakeholder acceptance (Legal xác nhận PDF render khớp template approved).

---

## 6. Demo Target

Live trên staging — demo theo **2 phase**.

### 6.A Phase A demo (settlement create + CR)

0. **(A5)** Mở màn **Chỉnh sửa phiếu dịch vụ** SO có BH → panel "Tổng giá dịch vụ": khối "Phân bổ Bảo hiểm" + "Cần thanh toán" hiển thị **2 cột (Bảo hiểm \| Khách hàng)** dóng thẳng với "Chi tiết theo bên thanh toán"; mỗi khoản +/− đúng cột. Mở **Chi tiết phiếu dịch vụ** → panel 2 cột tương tự (read-only). Verify khớp Figma `13354-57960` / `13354-58368`.
1. Kế toán mở SO có Bảo hiểm (đã Hoàn thành) → bấm "Tạo phiếu quyết toán" → màn Tạo phiếu QT hiển thị panel "Tổng giá dịch vụ" 3 khối (snapshot từ SO) — **"Phân bổ Bảo hiểm" + "Cần thanh toán" 2 cột (A5, Figma `13535-159225`)**; "Tổng tiền bảo hiểm trả" read-only = computed → xác nhận → tạo cặp phiếu QT (KH + BH).
2. Mở **phiếu QT BH** → panel chi tiết chỉ 1 cột "Bảo hiểm thanh toán" + section "Phân bổ Bảo hiểm" (giữ "Tổng thanh toán"). **In phiếu QT BH** → bản in có "Phân bổ bảo hiểm" 5 khoản (dấu −) — khớp `SETTLEMENT-INSURANCE-001-print-insurance.html`.
3. Mở **phiếu QT KH** (từ SO có BH) → panel + bản in có "Phân bổ Bảo hiểm" 3 khoản chuyển KH (dấu +); **không** thấy 2 khoản CK liên kết BH — khớp `SETTLEMENT-INSURANCE-001-print-customer.html`.
4. Mở phiếu QT từ **SO không BH** → bản in baseline (KHÔNG có "Phân bổ bảo hiểm").
5. Mở SO có Tổng BH thanh toán âm → bấm "Hoàn thành phiếu dịch vụ" → popup hiển thị dòng cảnh báo `ERR-INS-003` (vẫn cho "Xác nhận").
6. Verify cross-platform: lặp bước 1-5 trên mobile → số liệu + hiển thị khớp web.
7. **Hard gate A → B**: panel per-payer + template in QT/báo giá stable 24h staging → mới start Phase B.

### 6.B Phase B demo (dossier — FEAT v21 flow)

Live trên staging — full kịch bản:

0. **[FEAT-INS-STL-CREATE]** Login kế toán → mở SO "Dịch vụ xe" có dòng Nguồn TT = Bảo hiểm (đã hoàn thành) → bấm "Tạo phiếu quyết toán" → màn xác nhận tạo phiếu QT hiển thị panel "Tổng giá dịch vụ" read-only: Chi tiết theo bên thanh toán (2 cột BH/KH) + Phân bổ Bảo hiểm (5 khoản) + Cần thanh toán (BH 197,680,000 / KH 35,720,000 / Tổng 233,400,000) — khớp panel SO W01; trường "Tổng tiền bảo hiểm trả" read-only = 197,680,000 → "Xác nhận" → tạo cặp phiếu QT `#SET-20260601-00001` (snapshot phân bổ). Tiếp tục:
1. Login kế toán → vào phiếu QT BH `#SET-20260601-00001` (từ W01 / vừa tạo ở bước 0) → tab "Chi phí" hiển thị panel phân bổ → Bấm "+ Tạo hồ sơ bảo hiểm".
2. Modal "Hồ sơ bảo hiểm - #SET-20260601-00001" mở:
   - Progress bar "2/4 tài liệu sẵn sàng".
   - 4 thẻ:
     - Phiếu quyết toán — Badge "Sẵn sàng" + checkbox ON.
     - Phiếu báo giá — Badge "Sẵn sàng" + checkbox ON.
     - Biên bản nghiệm thu — Badge "Bổ sung" + nút "Upload".
     - Giấy ủy quyền nhận tiền bồi thường — Badge "Bổ sung" + nút "Upload".
3. Click thẻ Phiếu báo giá → preview panel hiển thị PDF render với snapshot phân bổ (đúng số BH 197,680,000).
4. Upload Biên bản nghiệm thu (PDF 2MB) → loading → upload success → Badge → "Sẵn sàng" + checkbox ON → progress "3/4 tài liệu sẵn sàng".
5. Upload Giấy ủy quyền (PDF 1.5MB) → progress "4/4 tài liệu sẵn sàng" → nút "Xuất hồ sơ bảo hiểm" enable.
6. Bấm "Xuất hồ sơ bảo hiểm":
   - Server gen Phiếu quyết toán PDF + Phiếu báo giá PDF (subset `is_selected`).
   - Server upload PDF lên S3 (key `t1/insurance-dossiers/SET-20260601-00001/v1/phieu-bao-gia.pdf` …).
   - Bộ marked `EXPORTED` version 1.
   - Modal close → toast "Hồ sơ bảo hiểm xuất thành công".
7. Click tab "Hồ sơ bảo hiểm đã xuất":
   - **Layout 1 cột** (cập nhật 2026-06-18 — gỡ preview pane inline).
   - "Bộ hồ sơ #SET-20260601-00001" / "Xuất ngày 01/06/2026 14:32 · 4 tài liệu PDF" + grid 2-cột 4 file cards (mỗi card có Filename + size + reference + nút "Tải PDF").
   - **Click 1 file card → mở PDF trong tab mới của trình duyệt** (browser native PDF viewer hiển thị). Click nút "Tải PDF" trên card → download file gốc về máy.
8. Simulate BH yêu cầu sửa Biên bản:
   - Bấm "+ Tạo hồ sơ bảo hiểm" lần 2 → modal v2 mở (Phiếu QT + Phiếu báo giá auto-fresh; Biên bản + Giấy ủy quyền `doc_status=PENDING`).
   - Upload Biên bản mới + Giấy ủy quyền cũ giữ nguyên (re-upload hoặc reference từ v1 — TBD UX).
   - Xuất → v2 `EXPORTED`; v1 set `REPLACED` (replaced_by_version=2).
9. Tab "Hồ sơ đã xuất" hiển thị 2 khối:
   - "Bộ hồ sơ #SET-20260601-00001" (v2 — Xuất ngày 02/06/2026 09:15 · 4 tài liệu PDF) — trên cùng.
   - "Bộ hồ sơ #SET-20260601-00001" (v1 — Xuất ngày 01/06/2026 14:32 · 4 tài liệu PDF) — dưới.

---

## 7. Dependencies (External to Wave)

| Dependency | Type | Source | Deadline | Risk |
|---|---|---|---|---|
| Hard Gate W01 pass (24h soak staging) | Wave dep | Delivery Authority | Day 0 (Phase A) | HIGH (block start) |
| Cờ "SO có chọn Bảo hiểm" + panel snapshot per-payer (BFF) | Contract | Backend Lead + BFF | Day 0 (Phase A) | MED (block web/mobile render) |
| 3 CR APPROVED + FEAT-INS-STL-CREATE PO sign-off | Approval | Business Authority | Day 0 (Phase A) | LOW (đã APPROVED) |
| **Hard Gate Phase A → B** (panel + template in stable 24h) | Phase dep | Delivery Authority | Day 2-3 (gate B) | HIGH (block Phase B start) |
| `ct-file-storage` external integration ready (multipart `POST /api/v1/files/upload-files` + `folderType="SETTLEMENTS"` + tenant header enforce + 10 năm retention lifecycle) | Infra | Platform | Day 0 (Phase B) | HIGH (block dev) |
| PDF template Legal approval | Approval | Legal + BA | Day 0 (entry) | MED — Legal turnaround |
| ADR-016 (dossier PDF/S3/versioning — PROPOSED, common-printing) ratify | Decision | SA (Bước 2.5) | Day 0 (entry) | MED |
| Feature flag mechanism live trên staging | Infra | Platform | Day 2 | LOW |

---

## 8. Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **(Phase A)** Lệch số/nhãn giữa màn ↔ bản in ↔ PDF dossier | MED | Data inconsistency | Số liệu server-side một nguồn (BR-INS-STL-CRE-003); panel + bản in + popup + dossier cùng tiêu thụ 1 snapshot; golden test khớp 2 print mockup HTML |
| **(Phase A)** Template PDV (gf-sales `ServiceOrderPrintStrategy` V3) ↔ template QT (gf-accounting `SettlementPrintStrategy`) data drift | MED | Số liệu lệch giữa 2 phiếu in cho cùng SO | Cả 2 template tiêu thụ cùng nguồn snapshot `breakdownByPayer` server-side (BR-INS-STL-CRE-003); gf-sales = single source-of-truth cho computation (gf-accounting consume qua `/protected/v1/.../for-print`, KHÔNG tự tính); golden test cross-check tổng phân bổ 2 template = nhau cho cùng SO test data |
| **(Phase A)** DEV áp section "Phân bổ bảo hiểm" cho cả phiếu từ SO không BH | MED | Sai layout in | Conditional theo cờ "SO có chọn Bảo hiểm"; test case phiếu QT từ SO không BH = bản in baseline (NEED CONFIRMATION đã chốt) |
| **(Phase A→B)** Phase B start sớm → dossier render layout cũ rồi rework | MED | Rework | Hard gate A→B: panel per-payer + template in stable 24h staging trước khi start Phase B (§1.2 WAVE-SEQUENCE) |
| PDF render performance kém với snapshot phức tạp | MED | Demo fail | Benchmark PDF gen với snapshot 50 line item; tuning template; cache rendered PDF per dossier version |
| ct-file-storage cost / availability cho 10 năm retention | MED | Budget overrun + service dependency | Platform forecast cost dựa trên 100 dossier/ngày × 4 PDF × 2MB = 800MB/ngày; legal-hold không xoá trong 10 năm (ADR-016 v11). ct-file-storage degradation → BFF Phase C abort, user retry; orphan files cleanup TBD. |
| Form-fill ③④ nội dung dài (vd > 50 trường + danh sách điều khoản) khi mobile network kém | LOW | UX regression | Lưu cục bộ trong phiên qua "Lưu thông tin"; debounce render template; toast "không có kết nối — vẫn lưu local" |
| ~~Signed URL expiry~~ | — | — | **GỠ 2026-06-17** (ADR-016 v11 supersede: KHÔNG signed URL TTL — FE nối env domain config + pdfUrl object key dùng cơ chế download hiện hữu) |
| Dossier versioning data growth | MED | DB/S3 cost | Quarterly review; archive bộ > 2 năm sang Glacier |
| ddl-auto=update fail với 2 aggregate + additive columns | MED | Block deploy | Schema diff review staging trước prod; backup-restore as rollback (no Flyway) |
| **Pagination response > 50 items request** | LOW | Client error | BE validate `size ∈ [1,50]`; FE pre-validate; reject 400 với message rõ |
| **`pdfUrl` leak (no signed URL TTL)** | LOW | Data exposure | ct-file-storage tenant prefix obscurity + URL pattern khó đoán + Platform/Security verify production tenant header check; nếu cần tăng security → revisit signed URL ở post-W02 (out of scope) |
| Concurrent export 2 user cùng dossier → race | LOW | Data corruption | Optimistic lock `@Version` trên `insurance_dossiers`; 1 success + 1 → 409 |
| Phiếu báo giá template không khớp Legal expectation cuối wave | MED | Rework | Legal review tại Day 1 với mock data; iterate ngày 2 |
| Snapshot từ phiếu QT BH stale nếu phiếu QT BH bị edit sau khi export v1 | LOW | Data inconsistency | Snapshot frozen tại export time; bộ v2 dùng snapshot mới |

---

## 9. Post-Wave Actuals

_Filled end-of-wave._

| Metric | Target | Actual |
|---|---|---|
| Duration | 4d | — |
| DEV retries | 0 | — |
| Review findings (P1/P2) | 0 / ≤ 3 | — / — |
| TC pass rate | ≥ 95% | — |
| Bugs open at demo | 0 (P1), ≤ 2 (P2+) | — |
| Dossier export success rate (post-deploy 24h) | ≥ 99% | — |
| PDF gen latency p95 (4 tài liệu) | < 5s | — |
| ct-file-storage upload error rate | < 0.1% | — |
| pdfUrl access success | ≥ 99.5% | — |
| AC coverage | 100% | — |

---

## 10. Change Log

| Date | Summary | Author |
| 2026-06-18 | v19 — **Bổ sung mô tả update phiếu in PDV + QT theo đầu việc gf-sales/gf-accounting** (user feedback: PKG chưa rõ chia việc print template giữa 2 boundary). §2.0 A3/A7 thêm owner template + data source + template binding: A3 owner = `gf-accounting` `SettlementPrintStrategy` (2 variant `settlement-{insurance,customer}.html`) consume `breakdownByPayer` snapshot từ gf-sales for-print; A7 owner = `gf-sales` `ServiceOrderPrintStrategy V3` (1 template `service-order-v3.html` extend baseline). §4.1 DEV table: gf-accounting A3 effort ~5h→~6h (OWNER template QT + golden test); gf-sales rewrite 3 task tách rõ (A4 popup ~1h + A7 NEW OWNER PDV template ~2h + A3-support for-print extend `breakdownByPayer` ~1h) effort ~3h→~6h. §5.1 Deliverables: tách dòng A3 (gf-accounting QT) + A7 NEW (gf-sales PDV golden test khớp `print-service.html`) + A3-support NEW (gf-sales for-print contract test). §4.3 test-ui thêm assertion bản in PDV (5 khoản × 2 cột + 3-dòng "Cần thanh toán"); test-api thêm assertion for-print `breakdownByPayer` contract. §8 Risk thêm row "PDV↔QT data drift" mitigated bằng single-source snapshot from gf-sales (gf-accounting consume qua for-print, không tự tính). KHÔNG đổi wave scope / Phase B / FEAT AC / source code. | Delivery Authority |
| 2026-06-18 | v18 — **Thêm 2 CR mới vào W02 Phase A** (cụm CR phân bổ BH 4→6 CR). **A6 = CR-20260618-01** (gf-accounting + gf-sales + UI) — sửa logic sinh phiếu QT từ SO: sinh phiếu QT KH "chỉ phân bổ BH" (3 khoản dấu +, không có dịch vụ/phụ tùng) khi BH thanh toán 100% phụ tùng + dịch vụ NẾU `Khấu trừ BH + Khấu hao + Giảm trừ > 0`; Figma layout phiếu QT KH "chỉ phân bổ BH" web `13906-29632` · mobile `758-28571`; KHÔNG re-evaluate phiếu QT cũ. **A7 = CR-20260618-02** (gf-sales print + UI) — template in **Phiếu dịch vụ (PDV)** bổ sung khối "Phân bổ bảo hiểm" 5 khoản × 2 cột (BH dấu − / KH dấu + hoặc 0) + thay 1 dòng "Tổng thanh toán" → khối "Cần thanh toán" 3 dòng (BH/KH/Tổng); dòng "bằng chữ" bám KH thanh toán; SO không BH giữ baseline; mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-service.html` (mới thêm 2026-06-18). Header scope 4→6 CR; §2.0 Scope items 5→7 (+A6/A7); Phase A technical notes thêm cờ "KH còn phân bổ BH > 0" BFF + layout phiếu QT KH "chỉ phân bổ BH" template riêng; §3.A entry update PO sign-off 6 CR + 3 print mockup + 2 Figma node A6. Đồng bộ Tracking/CHANGE-REQUESTS.md v14, WAVE-SEQUENCE v8. KHÔNG đổi Phase B / hard gate A→B / FEAT AC / source code. | Delivery Authority |
| 2026-06-18 | v17 — **Thêm §3.C Testing Conventions + Harness Readiness Gate (cross-phase)** để close 2 gap W01 (`CR-1781160847` testability rollback + `CR-1781166951` mobile harness BLOCKED + `CR-20260617-01` exit override). 4 sub-section: (3.C.1) testid naming convention W02 cluster Insurance — 13 element pattern + cross-feature reuse rule cho panel "Tổng giá dịch vụ" 4 màn; (3.C.2) harness readiness gate pre-/test-exec — Web/Mobile/API/Security/Isolation preflight checklist với cross-ref 13 lesson `TL-W01-*`; (3.C.3) TC artifact ↔ implementation cross-ref + defer-upfront rule (iOS scope-out tại TEST_PLANNING, KHÔNG đẩy đến /test-exec) + worked-example formula gate; (3.C.4) DEV exit gate testid self-check + REVIEW gate enforcement. KHÔNG đổi wave scope / Phase A / Phase B / FEAT AC / source code. | Delivery Authority |
| 2026-06-18 | v16 — **Gỡ gate "③④ chỉ tích chọn được sau khi điền đủ trường bắt buộc (EC-4)"** (user request: rule không chính xác). §2.4 Bước 1 web: bỏ câu "Chỉ tích chọn được sau khi điền đủ trường bắt buộc (EC-4)" khỏi mô tả ③④; footer modal sửa "enable khi ≥1 checkbox tích + tài liệu được chọn đã hoàn tất per BR-INS-DOSSIER-005" → "enable khi ≥1 checkbox tích (BR-INS-DOSSIER-005 — KHÔNG buộc 4/4)". §2.4 Bước 5 export rule sửa "≥1 checkbox tích + các tài liệu được chọn đã hoàn tất" → "≥1 checkbox tích" (no readiness gate). Đồng bộ FEAT-INS-DOSSIER-CREATE v22, BR-EP v31, UX-FLOW v21. KHÔNG đổi wave scope / Phase A / FEAT AC / source code. | Delivery Authority |
|---|---|---|
| 2026-06-18 | v15 — **Consistency cleanup audit pass** (user request "đảm bảo đồng nhất + agent dev garage web có thể đọc và thực thi chính xác"). §4.1 Phase B rewrite 3 row legacy: (a) **gf-accounting** "6 endpoint + S3 upload + virus scan + signed URL 300s" → **"4 endpoint canonical §3bis + ct-file-storage external + KHÔNG signed URL (ADR-016 v11)"** (effort 13.5h → 8h); (b) **agg-garage-graph** "4 mutation + 2 query + updateDossierDocument + uploadedFileUrl + signed URL relay" → **"1 mutation + 1 query: exportInsuranceDossier orchestrator 4-phase + getInsuranceDossierVersions passthrough Spring Pageable"** (effort 6.5h → 5h); (c) **garage-mobile** legacy "progress + 4 thẻ + file picker + permission iOS/Android + PDF embedded preview" (out-of-sync với v12 gỡ upload) → **"ListView dọc 4 dòng + checkbox bỏ trống + ③④ Lưu thông tin cục bộ phiên + KHÔNG file picker/upload/permission"** (effort 9h → 5h). §2.4 Bước 0 line reading: "signed URL refresh" → gỡ. §3.B Entry MR design: ADR-016 description sync v11 + gỡ "signed URL 300s + S3". §4.3 test-performance + §5.2 runbook + §5.3 quality gate + §6.B demo bước 5 + §8 risk Signed URL row (gỡ) + §9 metric: tất cả "S3" / "signed URL" → "ct-file-storage" / "pdfUrl". §2.4 Bước 1 button list "In giấy uỷ quyền" → "In giấy ủy quyền" (canonical FEAT v21 spelling). KHÔNG đổi wave scope / Phase A / FEAT AC / GraphQL contract / route paths. | Delivery Authority |
| 2026-06-18 | v14 — **Reuse priority + open-new-tab pattern + ③④ signature display-only** (user-driven update 2026-06-18). §2.2 web: (a) `<InsuranceDossierTab>` layout 2 cột → **1 cột list dọc** + grid 2-cột file cards trong mỗi bộ — GỠ preview pane inline; click file card → mở PDF trong tab mới của trình duyệt (`<a target="_blank">`); mỗi card có nút "Tải PDF" riêng. (b) ③④ khối ký explicit "display-only" — chỉ render label `"Đại diện khách hàng / (Ký, ghi rõ họ tên)"` + `"Đại diện xưởng sửa chữa / (Ký, ghi rõ họ tên)"`, KHÔNG signature canvas / e-signature / cho ký trực tiếp; ký giấy ngoài hệ thống. §2.4 Bước 1: (c) đổi reuse priority **`customs/` > `share/` > `ui/`** thay vì duyệt 3 dir ngang hàng — `customs/` ưu tiên cao nhất (domain-specific W01); `ui/` chỉ shadcn primitives fallback. (d) **GỠ `pdf-preview` build-new** (PDF lib blocker không còn); thêm `dossier-document-card` + `dossier-version-card` build-new; 4 component build-new tổng: `dossier-document-row`, `dossier-template-form`, `dossier-document-card`, `dossier-version-card`. §2.4 Bước 3 / Bước 4 / §3.B Entry / §4.1 web cell / §4.3 test-ui / §5.1 web deliverable / §6.B demo bước 7 update đồng bộ open-new-tab + reuse priority + ③④ signature display-only. Web effort ~7h → ~6h (gỡ pdf-preview build). Mobile PDF lib decision vẫn cần (mobile vẫn dùng inline PDF embedded — không impact). KHÔNG đổi wave scope / Phase A / FEAT AC / source code. | Delivery Authority |
| 2026-06-01 | Initial work package — Wave 2 EP-INSURANCE-SETTLEMENT (FEAT-INS-DOSSIER-CREATE + VIEW), 3 boundary + object storage, 4d | Delivery Authority |
| 2026-06-01 | v2 — Add `garage-mobile` boundary per user feedback. Boundaries 3→4 + object storage. Effort 20h→26h. Add `agent-dev-garage-mobile` (~6h) + `agent-review-garage-mobile`. Mobile-specific: full-screen flow thay modal, `file_picker` + permission handling iOS/Android, PDF lib chốt (NEED CONFIRMATION). INTEG-MOB-INS-DOSSIER bổ sung. Out-of-scope clarify: bỏ "Mobile" out — mobile is now IN scope; native camera capture vẫn out scope. | Delivery Authority |
| 2026-06-01 | v3 — **Conform ADR-016** (post-consolidation) + data-model §2bis. Sửa sai lệch: (B1) signed URL 1h→**300s**; (B2) retention 7→**10 năm** + legal-hold; (B3) S3 key → `{tenant}/insurance-dossiers/{settlementCode}/v{N}/{filename}` tên file cố định; (B4) event `INSURANCE_DOSSIER_PUBLISHED`→`insurance-dossier-exported`, MessageGroup `insurance-dossier`→`INSURANCE_SETTLEMENT`, topic `AC-DEV-ACCOUNTING-EVENTS`, mang `s3Prefix` không signed URL/PII; (B5) bỏ cổng buộc 4/4 → **export subset** theo `is_selected` (BR-INS-DOSSIER-005); (B6) status `PUBLISHED`→`EXPORTED`/`REPLACED` + `replaced_by_version`; (B7) sửa ADR refs (bỏ ADR-016-pdf-template-engine + ADR-017 không tồn tại → ADR-016 đã gộp, common-printing); (B8) entity tree 4→**2 aggregate** canonical (`insurance_dossiers` + `insurance_dossier_documents`, enum `InsuranceDossierDocType`). Endpoint `/publish`→`/export`. Cập nhật §2.2/3/4.1/5.1/5.2/6/7/8. | Delivery Authority |
| 2026-06-01 | v4 — **Align đầu API với architecture contract** (audit): 6 endpoint dossier → đúng canonical gf-accounting-api §3bis.1-3bis.6 — thêm `POST /{settlementCode}/versions`; PUT `documents/{docId}` (bỏ `{id}/documents/{docType}`); **bỏ endpoint `/upload` multipart** (file ở S3, PUT mang `uploadedFileUrl`); export `{dossierId}` + `documentTypes[]`; GET `/{settlementCode}` (bỏ `by-settlement/.../versions`). BFF op → đúng tên agg #51-56 (`createInsuranceDossierVersion` thêm; `getInsuranceDossierVersions`/`getInsuranceDossierDownloadUrl`; bỏ `uploadDossierFile`; `updateDossierDocument(docId)`). Flag **architecture gap**: cơ chế đưa file scan lên S3 (pre-signed URL) chưa định nghĩa. Cập nhật §2.2/3/4.1/5.1. | Delivery Authority |
| 2026-06-03 | v6 — **Decomposition component-first A1→B→C cho garage-web** (CHỐT user conversation, đồng bộ PKG-W01 v9). §2.2 restructure: A1 (chỉ component MỚI — Progress / Checkbox / Upload / PDF-preview / Badge "Bổ sung", reuse Registry W01 §2.2) / B (migrate màn dossier sheet + tab) / C (feature compose). §4.1 tách `agent-dev-garage-web` thành A1~2h + B~1h + C~2h (web giữ ~5h — reuse foundation W01, KHÔNG dựng lại A0). §5.1 exit-check per phase. Sửa drift "search-param routing" → "store-only routing" (khớp W01 v8). Sửa gate path → `.claude/scripts/check-v3-sourcing.sh` (per-service, chạy trong `frontend/gf-gms-web`). KHÔNG đổi wave scope. | Delivery Authority |
| 2026-06-02 | v5 — **Align garage-web với V3 architecture từ W01** (consistency). Dossier "modal" → **bottom sheet** `CREATE_DOSSIER` qua Global Sheet Manager đã dựng W01 (KHÔNG `<Dialog>` legacy, KHÔNG dựng lại infra). Thêm: đăng ký sheet type vào registry, in-screen V3 cho dossier, dirty-guard cho upload dở. Settlement detail page + tab inherit shell V3 + in-screen V3 từ W01. Effort web giữ ~5h (foundation đã amortize ở W01). | Delivery Authority + SA |
| 2026-06-03 | v6 — **Flatten JSONB refs + xoá event**: PDF gen reference scalar columns thay JSONB; xoá `insurance-dossier-exported` outbox event (export đồng bộ, không publish). Giữ `form_data` JSONB (dynamic template). §2.2/4.3/5.1/5.2 cập nhật. | Delivery Authority |
| 2026-06-04 | v7 — **Bỏ V3 frontend architecture cho garage-web — giữ design system cũ** (CHỐT user conversation, đồng bộ PKG-W01 v10). Gỡ component-first A1→B→C + Registry component V3 + gate `check-v3-sourcing.sh` + dependency vào Global Bottom Sheet Manager W01. Dossier create về **modal** trên phiếu QT BH detail (luồng modal/dialog hiện hữu, KHÔNG sheet). §2.2 rút gọn về feature UI; §4.1 gộp 3 sub-task web (A1/B/C) → 1 (~4h); §5.1 bỏ deliverable Phase A1/B. §1 Duration ~26h→~24h (web ~5h→~4h). Không thay thế bằng kiến trúc mới. KHÔNG đổi wave scope / feature AC. | Delivery Authority |
| 2026-06-04 | v8 — **Thêm §2.4 garage-web DEV Playbook (pre-flight + execution chi tiết)** để bàn giao `agent-dev-garage-web` (đồng bộ PKG-W01 v12): 7 bước (đọc hiểu yêu cầu → component inventory & gap analysis [dựng `document-card` ngay + `pdf-preview` chờ PDF lib] → kiểm GraphQL dossier ops #51–56 + **blocker upload-to-S3 chưa định nghĩa** → **Figma spec gate — W02 chưa prefetch, bản web chờ cập nhật đúng** → reference patterns + file plan đích danh → rules export subset/versioning/upload validation → KG + self-check + exit). Cross-ref §3 Entry (web pre-flight + flag UX-FLOW dossier thiếu + Figma gate), §4.1 (cell garage-web trỏ §2.4), §5.1 (exit-check reuse gate + 2 component dựng mới + upload-to-S3 gate). KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-05 | v9 — **Rename component-first → Reuse-First / Component-Inventory Gate (FB-1, feedback agent web wave 1)**: §2.4 Bước 1 heading + thêm intro reuse-first dẫn đầu ("search KG + `src/components/{share,ui,customs}` theo functional keyword → reuse foundation W01; CHỈ dựng mới nếu inventory xác nhận thiếu"); §3 Entry + §4.1 cell garage-web + §5.1 deliverable đổi cụm "component-first/component inventory" → "reuse-first/inventory gate". Fix gốc lỗi duplicate component. Đồng bộ skill `gen-wave-plan` v2 + PKG-W01 v16. KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-12 | v10 (step) — **Thêm FEAT-INS-STL-CREATE vào W02 — slice 0 chạy ĐẦU wave** (panel "Tổng giá dịch vụ" read-only trên màn Tạo phiếu QT). Features 2→3. §1 Overview (Title/Features/Duration ~24h→~30h, +6h hấp thụ ngày 1), §2.1 Business Goal (+mục 0), §2.2 Technical Scope (+block slice 0: gf-accounting response insuranceAdjustment read-only reuse logic W01 + BFF + web/mobile reuse panel W01), §2.4 inventory (+row panel REUSE W01, KHÔNG dựng mới), §3 Entry (+PO sign-off v1 + Figma web 13535-157815 / mobile NEED CONFIRMATION), §4.1 DEV (4 boundary +task slice 0, effort +), §5.1 Deliverables (+exit slice 0), §5.4/§6 Demo (+scenario 0). **Duration giữ 4d** (hấp thụ). Reuse-first: panel reuse W01, KHÔNG dựng component mới. Đồng bộ WAVE-SEQUENCE v4, FEAT-INS-STL-CREATE v1, BR-EP v28. NEED CONFIRMATION: Figma mobile link STL-CREATE. | Delivery Authority |
| 2026-06-12 | v11 (step) — **Thêm 2 CR update vào ĐẦU W02 (ngày 1, trước slice 0)**: CR-20260612-01 (gf-accounting+BFF+web+mobile — màn chi tiết phiếu QT tách hiển thị panel theo bên thanh toán: phiếu BH chỉ cột BH, phiếu KH thêm "Phân bổ BH" nếu SO có BH) + CR-20260612-02 (gf-sales+web+mobile — popup hoàn thành SO cảnh báo Tổng BH thanh toán âm, warn-and-allow). §1 Overview (Title/CR row/Features/Boundaries +gf-sales/Duration ~30h→~34h) + §2.2 (CR block) + §4.1 (gf-accounting +CR-01, +`agent-dev-gf-sales` CR-02, BFF/web/mobile +CR tasks) + §5.1 (CR exit) + §5.4 demo (9 scenarios). Hấp thụ 4d. Đồng bộ WAVE-SEQUENCE v5, FEAT-INS-STL-DETAIL v14, FEAT-INS-SO-ADJUSTMENT v22, BR-EP v29, Tracking/CHANGE-REQUESTS.md v1. | Delivery Authority |
| 2026-06-16 | v10 — **Front-load cụm CR + FEAT-INS-STL-CREATE vào đầu W02 (Phase A → Phase B)** per BA/PO (scope grant tại stage TEST_EXECUTION). Title "Insurance Dossier" → "Settlement Adjustments + Insurance Dossier". **Phase A** (~2d, mới): §2.0 scope 4 item (A1 FEAT-INS-STL-CREATE panel màn Tạo QT · A2 CR-20260612-01 panel chi tiết per-payer · A3 CR-20260616-01 template in QT + "Phân bổ bảo hiểm" theo 2 print mockup HTML · A4 CR-20260612-02 popup hoàn thành SO cảnh báo BH âm); §3.A Phase A Entry; §4.1 Phase A DEV table (+`agent-dev-gf-sales`); §5.1 Phase A deliverables; §6.A Phase A demo. **Phase B** (dossier, giữ nguyên): relabel §2.1/2.2/§3.B/§5.1/§6.B + thêm hard gate A→B. §7 Dependencies +cờ SO có BH + gate A→B; §8 Risk +3 risk Phase A/gate. Duration 4d→6d (~24h→~40h). Boundary +`gf-sales`. NEED CONFIRMATION CR-20260616-01 resolved (ẩn 2 khoản CK liên kết BH trên phiếu KH). KHÔNG đổi nội dung Phase B dossier / source code. | Delivery Authority |
| 2026-06-16 | v11 — **Thêm A5 CR-20260616-02 vào W02 Phase A** per BA/PO. §2.0 scope 4→**5 item** (A5: panel "Tổng giá dịch vụ" reflow khối "Phân bổ Bảo hiểm" + "Cần thanh toán" 1 cột → 2 cột BH\|KH trên 3 màn SO Edit/Detail + Tạo QT; display-only; KHÔNG áp chi tiết QT; Figma `13354-57960`/`13354-58368`/`13535-159225`). §4.1 web/mobile effort 3h→4h + agg trả giá trị per-payer từng khoản; §5.1 +deliverable A5; §3.A Figma A5; §6.A demo bước 0 (SO Edit/Detail panel 2 cột) + bước 1 (Tạo QT 2 cột). §1 Overview Features Phase A 3→4 CR. KHÔNG đổi Phase B / source code. | Delivery Authority |
| 2026-06-17 | v12 — **Sync Phase B với FEAT-INS-DOSSIER-CREATE v21 + UX-FLOW v20 (commit BA c65bea8b)**: gỡ progress bar `{X}/4` + badge "Sẵn sàng"/"Bổ sung" khỏi §2.2 web/mobile + §2.4 Reuse-First inventory + §6.B demo; gỡ upload file scan ③ + permission iOS/Android + virus scan + `uploadedFileUrl`/`UPLOAD` khỏi §2.2 (data model + endpoints + architecture gap) + §2.4 + §3.B + §4.1 + §5.1 + §5.3 + §7 + §8 (FEAT v17 chốt B-3 bỏ upload — drift cũ vẫn nằm trong PKG); §2.2 endpoint PUT `documents/{docId}` body → `{inputMode: FORM_FILL, formData, isSelected}` only; data model enum `input_mode` chỉ còn `AUTO_RENDER` + `FORM_FILL`; §2.2 web layout đổi 4 thẻ ngang → **modal accordion dọc** (click mở rộng preview/template inline); §2.2 mobile đổi ListView 4 thẻ + Upload → list dọc → **màn chi tiết per tài liệu** + nút "Lưu thông tin" cục bộ phiên (KHÔNG persist server, đồng bộ EC-1); §2.4 Reuse-First inventory cập nhật (`dossier-document-row` + `dossier-template-form` build-new thay `document-card` + `drop-zone` + `badge`); §3.B Entry gỡ "Virus scan strategy" + "Cơ chế upload-to-S3" + "Mobile file picker + permission strategy"; §4.1 Phase B task rewrite + mobile effort ~6h → ~5h; §4.2 review-garage-mobile + §4.3 test-api/e2e/ui/security gỡ upload/permission; §5.1 + §5.3 deliverables/quality gates gỡ upload validation/virus scan/eicar; §6.B demo rewrite 15 bước (accordion dọc + checkbox mặc định bỏ trống + tích subset + ③④ template editable + mobile lifecycle "Lưu thông tin" mất khi kill app); §7 gỡ Virus scan decision; §8 gỡ 2 risk upload + virus scan, thêm risk form-fill mobile. PO sign-off rows update lên FEAT v21 + VIEW v14. KHÔNG đổi wave scope / Phase A / hard gate A→B. **Out of scope (follow-up riêng)**: BR-EP §4 Permission Rules còn drift "4/4 Sẵn sàng" + "DRAFT condition" (3 blocker đã flag tại review) + FEAT-INS-DOSSIER-VIEW.md cần bump version (đã touched trong c65bea8b nhưng không bump — vi phạm Critical Rule #9). | Delivery Authority |
| 2026-06-17 | v13 — **Realign Phase B Architecture-canonical (gf-accounting-api v16 + agg-graphql v7.7 + ADR-016 v11)** per user feedback. Endpoint shape rewrite hoàn toàn: ❌ 6 endpoint CRUD-style cũ (create/version/PUT-doc/export/GET-list/GET-download) → ✅ **4 endpoint Architecture canonical**: (1) `POST /insurance-dossier-documents/acceptance-record/render-pdf` body `{settlementCode, formData}` (13 trường Figma State 4) → byte[] PDF; (2) `POST /insurance-dossier-documents/payment-authorization/render-pdf` body 22 trường nested 4 sections → byte[] PDF; (3) `POST /insurance-dossier-documents/batch` atomic persist N docs (INSERT vN+1 + N rows + UPDATE vN cũ REPLACED); (4) **`POST /insurance-dossiers/search`** body `{settlementCode, page=0, size=10}` (max size=50) **paginated Spring Pageable** response `{content[], page, size, totalElements, totalPages}` (theo convention `POST /settlements/search`). BFF rewrite từ 4 mutation + 2 query → **1 mutation + 1 query**: `exportInsuranceDossier` = **orchestrator 4-phase** (Phase A resolve ctx → B parallel render N byte[] qua gf-sales ① + gf-accounting ②③④ → C parallel upload ct-file-storage `POST /files/upload-files` `folderType=SETTLEMENTS` → D batch persist → E aggregate); `getInsuranceDossierVersions(settlementCode, page, size)` passthrough `POST /search` Spring Pageable. PDF storage S3 direct → **`ct-file-storage` external integration** (ADR-016 v11). Data model: bỏ cột `form_data` JSONB (formData ③④ transient, BA chốt 2026-06-16) + `doc_status` (atomic batch luôn EXPORTED) + `copied_from_version` (`copyFromVersion` chỉ clone pdf_url). State machine `DRAFT→EXPORTED→REPLACED` → `EXPORTED→REPLACED` (no DRAFT). Bỏ endpoint `/download` riêng + signed URL TTL 300s (ADR-016 v11 supersede chốt 2026-05-31); FE consume `pdfUrl` từ list response = ct-file-storage object key (no scheme/domain) → nối domain config + cơ chế download hiện hữu. §2.4 ops count 4mut+2qry → 1mut+1qry; §4.1 gf-accounting task 9h→8h (gỡ S3 upload + virus scan), agg ~4h→~5h (orchestrator 4-phase); §4.3 test-api thêm pagination contract + abort scenarios; §5.1 deliverables sync 4 endpoint + ct-file-storage; §5.3 quality gate đổi sang ct-file-storage tenant prefix; §6.B demo thêm bước 10b pagination verify (>10 versions); §7 Object storage → ct-file-storage availability; §8 risks thêm pagination size validate + pdfUrl leak. **Out of scope (follow-up riêng)**: BR-EP CB-INS-009 ("signed URL TTL hợp lý") còn drift; FEAT-INS-DOSSIER-VIEW.md cần bump version + sync §4 API (signed URL refresh → pagination); HLD-ACCOUNTING + INTEG-FE/BFF còn drift signed URL — cần CR riêng. | Delivery Authority |
