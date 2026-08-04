---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 11
tier: T1
owner_authority: Architecture Authority
boundary: "gf-accounting"
last_reviewed: "2026-06-17"
---
# ADR-016: Insurance Dossier — PDF per-document via common-printing + ct-file-storage versioned immutable + FE-composed URL

## Status

ACCEPTED — 2026-06-01

## Context

`FEAT-INS-DOSSIER-CREATE` + `FEAT-INS-DOSSIER-VIEW`: bộ Hồ sơ BH gồm **4 tài liệu chuẩn** (① Phiếu báo giá, ② Phiếu quyết toán — auto read-only; ③ Biên bản nghiệm thu — điền/upload; ④ Giấy ủy quyền — template fill), có **versioning** (v1, v2… khi BH yêu cầu sửa), xuất **PDF**. Câu hỏi: sinh PDF thế nào, lưu ở đâu, xử lý version/immutability/access ra sao?

**Constraints:**

- BR-INS-DOSSIER-006 / PRINT-INS-002: sinh **PDF riêng cho mỗi tài liệu được tích chọn** (tối đa 4) — **KHÔNG gộp 1 file**; tên file cố định (`phieu-bao-gia.pdf`, `phieu-quyet-toan.pdf`, `bien-ban-nghiem-thu.pdf`, `giay-uy-quyen-nhan-tien-boi-thuong.pdf`).
- BR-INS-DOSSIER-005: export chỉ tài liệu tích chọn — KHÔNG bắt buộc 4/4 (chốt 2026-05-27).
- CB-INS-009: object storage (S3) lưu theo path `{tenant}/insurance-dossiers/{settlementId}/v{N}/{filename}`; cross-boundary access dùng **signed URL** TTL hợp lý.
- gf-accounting đã có **common-printing 0.0.2-SNAPSHOT** (HTML/PDF/PNG/JPG) + payer-filter render.
- Version **immutable** sau xuất (BR-EP §3.3); vN+1 tạo mới (option copy từ vN); vN cũ `REPLACED` nhưng vẫn xem được.

## Decision

**Sinh PDF từng tài liệu qua common-printing (tái dùng), lưu ct-file-storage versioned immutable, BE expose `pdfUrl` = relative path / object key; FE compose download URL từ env domain config + cơ chế download hiện hữu. List endpoint paginated Spring Pageable. Export đồng bộ — không publish event.**

- **Orchestrator** = **BFF `agg-garage-graph`** (chốt 2026-06-15): FE-only modal thu thập input (selectedDocs + formData ③④) trong state local. Khi bấm "Xuất hồ sơ" → 1 GraphQL mutation → BFF orchestrate **4 phase** parallel call. gf-accounting KHÔNG gọi gf-sales, KHÔNG chạm ct-file-storage — boundary isolation rõ ràng.

**4 phase BFF orchestrator** (`exportInsuranceDossier` resolver):
1. **Phase A — Resolve context**: BFF gọi gf-accounting `GET /api/v1/settlements/{settlementCode}` → `{id, serviceOrderId, tenantId}`.
2. **Phase B — Parallel render** (Promise.all theo `documentTypes[]`):
   - ① `QUOTATION_SHEET` → gf-sales `GET /api/v2/service-orders/{serviceOrderId}/export-pdf?type=QUOTATION` (reuse baseline `PrintingController:74` + `V1PrintStrategy` + template `serviceorder/quotation.html`) → byte[].
   - ② `SETTLEMENT_SHEET` → gf-accounting `GET /api/v1/settlements/{id}/export-pdf` (reuse baseline `SettlementPrintingController:43` + `SettlementPrintStrategy` + template `settlement.html`) → byte[].
   - ③ `ACCEPTANCE_RECORD` → gf-accounting `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` body `{settlementCode, formData: bbnt}` (NEW endpoint, reuse `DocPrintService` + `AcceptanceRecordPrintStrategy` + template `acceptance-record.html`) → byte[].
   - ④ `PAYMENT_AUTHORIZATION` → gf-accounting `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` body `{settlementCode, formData: guq}` (NEW endpoint, `PaymentAuthorizationPrintStrategy` + template `payment-authorization.html`) → byte[].
3. **Phase C — Parallel push ct-file-storage** (Promise.all): mỗi byte[] → `POST /api/v1/files/upload-files` multipart `files=<bytes>` + **`folderType="SETTLEMENTS"`** (reuse folder chung) → `{fileUrl, fileName, id, size}`.
4. **Phase D — Persist history** (1 atomic call): BFF → gf-accounting `POST /api/v1/insurance-dossier-documents/batch` body `{settlementCode, documents:[{documentType, fileUrl, fileName, formData?, isSelected}, … N]}` → atomic transaction nội bộ gf-accounting: INSERT dossier vN+1 (auto-increment) + INSERT N row docs immutable + UPDATE vN cũ `replaced_by_version=N+1, status=REPLACED` → `{dossierId, versionNo}`.
5. **Phase E — Aggregate** → BFF trả FE `{versionNo, exports:[{documentType, fileUrl, fileName}]}`.

- **Atomicity per phase**:
  - Phase B/C fail (render/upload) → BFF abort, KHÔNG gọi Phase D. User retry từ FE.
  - Phase D fail → atomic rollback nội bộ gf-accounting. Orphan files có thể tồn tại ở ct-file-storage (cleanup TBD — Open Q).
- **Phân tách boundary**:
  - gf-accounting: render ③④ + persist batch + list. KHÔNG gọi gf-sales/ct-file-storage.
  - gf-sales: render ① baseline (reuse, không dev mới).
  - ct-file-storage: upload + serve (external, folderType=SETTLEMENTS).
- **Storage**: file PDF lưu ở **ct-file-storage** (external integration đã production). KHÔNG direct S3 client trong gf-accounting. URL persistent từ ct-file-storage (sim public, production tùy Platform — xem Open Q tier-2 #2/#3).
- **Immutability**: mỗi `fileUrl` từ ct-file-storage trỏ object id duy nhất (KHÔNG bị overwrite). Bộ vN bị `REPLACED` vẫn xem được qua URL cũ. State machine DB: `DRAFT → EXPORTED → REPLACED` + `replaced_by_version` chain. vN+1 = NEW dossier row + N doc row mới — **`copyFromVersion` chỉ clone `pdf_url`/`pdf_file_name` từ vN cũ** (KHÔNG còn `form_data` snapshot vì BA chốt 2026-06-16 drop column khỏi schema). User muốn re-render với nội dung khác phải fill lại form trong modal trước khi xuất bản mới.
- **Access**: BE expose **`pdfUrl` = relative path / ct-file-storage object key** (no scheme, no domain). FE compose download URL bằng cách nối domain config (env-driven) + `pdfUrl`, dùng cơ chế download hiện tại (browser `<a href download>` / mobile share-PDF — pattern reuse từ phiếu QT in / settlement print). **KHÔNG có endpoint `/download` riêng**, **KHÔNG signed URL TTL** (đơn giản hoá per user feedback 2026-06-17 — supersede chốt 2026-05-31 "signed URL TTL 300s"). Tier-1 simulator trả URL ct-file-storage public; production tenant isolation qua header check + URL pattern khó đoán (xem Risks).
- **List pagination** (chốt 2026-06-17): endpoint list versions đổi từ `GET /api/v1/insurance-dossiers/{settlementCode}` flat → **`POST /api/v1/insurance-dossiers/search`** body `{settlementCode, page=0, size=10}`, response Spring Pageable wrapper `{content[], page, size, totalElements, totalPages}` (max `size=50`). Convention reuse từ `POST /api/v1/settlements/search` baseline.
- **Retention**: PDF Hồ sơ BH giữ **10 năm** (Luật Kế toán VN ≥10 năm cho chứng từ kế toán; MISS-INS-005). Cleanup orphan + lifecycle policy tùy ct-file-storage capabilities (Open Question Q5).
- **Nội dung snapshot DN BH vào PDF**: **chỉ tên** (✅ chốt 2026-05-31 — KHÔNG snapshot địa chỉ/SĐT/MST).
- **Event**: export đồng bộ, không publish event `insurance-dossier-exported`. Output = URL ct-file-storage trả về client.
- **Input ③④**: chỉ **FORM_FILL** — 2 object `acceptanceFormData` (③, 13 fields strict Figma State 4) + `authorizationFormData` (④, 22 fields strict Figma State 5) gửi trong body endpoint render-pdf (transient render input, **KHÔNG persist DB** — BA chốt 2026-06-16). KHÔNG có endpoint `PUT /form` riêng (FE giữ state local trong modal). KHÔNG có nhánh UPLOAD scan giấy ký tay. Field schema chi tiết: [gf-accounting-api v14 §3bis.1-2](../api/gf-accounting-api.md) + [agg-garage-graph-graphql v7.6 §3c.bis](../api/agg-garage-graph-graphql.md).
- **Print infrastructure ③④** (chốt user 2026-06-15; revised 2026-06-16): tái dùng pattern `DocumentPrintType.SETTLEMENT` baseline — extend enum với 2 doc type mới (`ACCEPTANCE_RECORD`, `PAYMENT_AUTHORIZATION`); 2 template Thymeleaf ship từ `Product/ux/assets/`. **Template bind từ `${formData.X}` pure** (không resolve `customerInfo`/`vehicleInfo`/`garageInfo`/`insuranceInfo` từ Settlement) — formData ③④ (§3bis.1-2 gf-accounting-api v14) đã chứa cả prefill data per strict Figma State 4/5 (FE prefill từ Settlement context trước khi user edit, snapshot vào formData). `AcceptanceRecordPrintContext` + `PaymentAuthorizationPrintContext` Java class **minimal wrap formData** (1 field), KHÔNG enrich từ Settlement entity. Chi tiết implementation + binding contract — xem [gf-accounting-api v15 §3bis.5](../api/gf-accounting-api.md) + PKG-W02 §2.2 DEV task.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
| --- | --- | --- | --- |
| **Gộp 4 tài liệu 1 PDF** | 1 file dễ gửi | Vi phạm BR-INS-DOSSIER-006/PRINT-INS-002 (mỗi tài liệu 1 file); không cho export subset | Trái spec (chốt 2026-05-27) |
| **Lưu PDF trong DB (bytea) / settlement_documents URL hiện hữu** | Không cần S3 mới | Phình DB; không versioned-immutable rõ ràng; không signed-URL access | S3 phù hợp object lớn + versioning + signed URL |
| **Generate on-the-fly mỗi lần xem (không lưu)** | Không tốn storage | Phá immutability (số liệu đổi → PDF đổi); chậm; không audit bản đã gửi BH | BH cần bản cố định đã gửi; immutability bắt buộc |
| **Public URL (không signed)** | Đơn giản | Lộ tài liệu BH/PII | Vi phạm bảo mật; signed URL bắt buộc (CB-INS-009) → trade-off ở v5: ct-file-storage sim trả URL public; production move sang signed nếu Security yêu cầu (Open Question Q2). |
| **1 endpoint aggregate ở gf-accounting `POST /export documentTypes[]`** | Atomic 1 call BFF→BE | Orchestration logic chôn trong gf-accounting; ① cross-boundary call ẩn (debug khó); khó parallel internal; mở rộng thêm docType phải sửa endpoint. | Chuyển sang **BFF orchestrate dispatch** (v5): BFF parallel call dispatcher endpoint /export-pdf cho từng `docId`, gf-accounting chỉ care 1 doc/call. Tách orchestration ra khỏi domain service. |
| **Direct S3 client trong gf-accounting** | Self-contained, không phụ thuộc external service | Phải mint bucket + IAM + lifecycle riêng; duplicate file-storage logic | Tái dùng **ct-file-storage** đã có production + sim (giảm boundary breakdown). |

## Consequences

**Positive:**

- Tái dùng common-printing + extend `DocumentPrintType` enum cho ③④ → không thêm thư viện render.
- Versioned immutable (URL ct-file-storage object id duy nhất per version) + audit bản đã gửi BH; subset export linh hoạt (BR-INS-DOSSIER-005).
- Boundary isolation rõ: gf-accounting chỉ render ③④ + persist; BFF orchestrate; gf-sales render ①; ct-file-storage external.
- KHÔNG event publish (export đồng bộ).

**Negative:**

- **Phụ thuộc ct-file-storage** (external integration). **Mitigation**: ct-file-storage đã production cho các op khác (`uploadMultipleFiles`); reuse pattern multipart sẵn có.
- **Storage tăng theo version**. **Mitigation**: retention policy = **10 năm** (Luật Kế toán VN ≥10 năm; MISS-INS-005) qua ct-file-storage lifecycle (Platform cấu hình).
- **BFF cầm binary tạm trong memory** (Phase B→C → giữ N byte[] cho tới khi upload xong). **Mitigation**: parallel upload sớm, không persist binary; size PDF ước tính ~1-3MB/file × 4 = ~12MB peak — chấp nhận được.

**Risks:**

- **Orphan files trong ct-file-storage** (Phase D persist fail nhưng Phase C upload đã thành công). **Mitigation**: cleanup TBD (Platform job hoặc TTL ngắn cho file chưa được claim — Open Q).
- **ct-file-storage tenant isolation** (URL public, đoán được id có thể leak). **Mitigation**: Platform/Security xác nhận tenant header check + URL pattern khó đoán (Open Q).
- **PDF render lỗi (thiếu data snapshot)**. **Mitigation**: validate Phiếu QT BH DRAFT + required formData ③④ tại render endpoint (VLD-INS-DOSSIER-003/004).

**Trade-off accept:** dependency ct-file-storage + BFF cầm binary tạm → đổi lấy boundary isolation rõ + immutability per version + reuse external file-storage thay vì dựng S3 client riêng.

**Quyết định (✅ chốt 2026-05-31, Delivery Lead; ⚠️ SUPERSEDED phần signed URL tại v11 2026-06-17):**
- ~~signed URL TTL = **300s**~~ → **SUPERSEDED 2026-06-17 v11**: BE expose `pdfUrl` path; FE compose domain. Không signed URL on-demand. Không TTL.
- retention policy PDF = **10 năm** (ct-file-storage lifecycle + legal-hold — MISS-INS-005) — **giữ**.
- snapshot DN BH vào PDF = **chỉ tên** (KHÔNG snapshot địa chỉ/SĐT/MST — IMPROVEMENT-1 KHÔNG adopt; nếu mẫu tài liệu sau cần thì mở rộng có kiểm soát) — **giữ**.
- **List pagination Spring Pageable** (✅ chốt 2026-06-17 — POST /search, page+size body, max size=50).

## References

- Related ADRs: ADR-014 (ownership), ADR-007 (Redis), ADR-004 (Kafka — event không mang URL)
- API: [gf-accounting-api.md §3bis](../api/gf-accounting-api.md) (5 endpoint dossier v5: create / versions / form / export-pdf dispatcher / list)
- Data model: [gf-accounting-data-model.md §2bis.2-2bis.3](../data/gf-accounting-data-model.md) (bỏ column `uploaded_file_url`; `input_mode` còn `AUTO_RENDER`/`FORM_FILL`; v8 2026-06-16 **bỏ column `form_data` JSONB** — form ③④ transient, KHÔNG persist)
- Events: [gf-accounting-events.md §3.4](../events/gf-accounting-events.md)
- External integration: `ct-file-storage` — sim `infra/sim/apps/file-storage.js`; endpoint `POST /api/v1/files/upload-files` (multipart) + `GET /files/{id}` (download). HLD §4 `agg-garage-graph` đã document Upload pattern.
- Templates ③④: `Product/ux/assets/bien-ban-nghiem-thu.html` + `giay-uy-quyen.html` (Thymeleaf, Legal-approved) — sync sang `gf-accounting/src/main/resources/templates/insurance-dossier/` qua build/CI.
- Baseline reuse: gf-sales `PrintingController:74` + `V1PrintStrategy` + template `serviceorder/quotation.html` (cho ①). gf-accounting `SettlementPrintingController:43` + `DocPrintService.generatePdf(SETTLEMENT)` + template `settlement.html` (cho ②).
- BR: BR-EP-INSURANCE-SETTLEMENT §2.5, §3.3; CB-INS-009; BR-INS-DOSSIER-001..006; PRINT-INS-002; VLD-INS-DOSSIER-002/003/004
- Change Request: `CR-1780147390`

## Change Log

| Date | Version | Author | Description |
| --- | --- | --- | --- |
| 2026-05-30 | 1 | Architecture Author (Delivery Lead) | Initial — PDF per-document (common-printing) + S3 versioned immutable + signed URL; event mang s3Prefix không mang URL. Staged in Tracking. |
| 2026-05-31 | 2 | Delivery Lead | Resolve open questions: signed URL TTL = 300s; retention PDF = 10 năm (S3 lifecycle + legal-hold); snapshot DN BH = chỉ tên (IMPROVEMENT-1 không adopt). Relocate canonical từ `Tracking/insurance-settlement-ADR-drafts.md` sau khi STATE unlock ADR path (CR-1780147390). PROPOSED — pending SA ratification (Bước 2.5). |
| 2026-06-03 | 4 | Delivery Authority | **Xoá `insurance-dossier-exported` event reference**: export đồng bộ, không publish event. |
| 2026-06-15 | 5 | Delivery Authority | **Rewrite §Decision §Render** theo chuỗi clarify với user: BFF dispatch + 1 endpoint dispatcher gf-accounting + ct-file-storage push + bỏ scan upload. (Superseded by v6.) |
| 2026-06-15 | 8 | Delivery Authority | **Cleanup drift sau chuỗi v4→v7 + reconcile Consequences/Risks với ct-file-storage**: (1) §Decision §Print infrastructure ③④ giảm 6 bullet implementation chi tiết (class name, file path, method signature) → 1 paragraph summary + ref PKG-W02 §2.2 DEV task; (2) §Consequences §Positive bỏ "Signed URL TTL ngắn" stale, thêm "Boundary isolation rõ" + "KHÔNG event publish"; (3) §Consequences §Negative thay "S3 client/lifecycle rule" → "ct-file-storage external + BFF cầm binary tạm memory pressure"; (4) §Risks thay "Signed URL leak TTL" → "Orphan files Phase D fail" + "ct-file-storage tenant isolation"; (5) §Trade-off cập nhật reflecting ct-file-storage thay S3 direct. Vai trò ADR giữ đúng (high-level decision + rationale, không implementation). |
| 2026-06-15 | 7 | Delivery Authority | **BFF orchestrator + tách endpoint granular gf-accounting + folderType="SETTLEMENTS"** (chốt user 2026-06-15 cuối): (1) **gf-accounting KHÔNG còn endpoint batch `/export` monolithic** — tách thành 4 endpoint riêng: 2 render endpoint (③ POST `/insurance-dossier-documents/acceptance-record/render-pdf` + ④ POST `/insurance-dossier-documents/payment-authorization/render-pdf` trả byte[]) + 1 persist endpoint (POST `/insurance-dossier-documents/batch` body chứa N documents với fileUrl) + 1 list endpoint (GET `/insurance-dossiers/{settlementCode}`); (2) **BFF (`agg-garage-graph`) là orchestrator chính** — 4 phase: A resolve ctx → B parallel render 4 byte[] (① gọi gf-sales baseline + ② gọi gf-accounting baseline + ③④ gọi 2 endpoint render mới gf-accounting) → C parallel push ct-file-storage với `folderType="SETTLEMENTS"` (reuse pattern uploadMultipleFiles đã có) → D call persist batch endpoint gf-accounting atomic → E aggregate response trả FE; (3) **Boundary isolation rõ**: gf-accounting KHÔNG gọi gf-sales, KHÔNG chạm ct-file-storage — chỉ render ③④ + persist; (4) Atomicity per phase: B/C fail → BFF abort, không gọi D; D fail → atomic rollback gf-accounting (orphan files cleanup TBD). Effort: gf-accounting ~7h giữ; agg-garage-graph ~3h → ~5h (orchestrator 4 phase). Supersedes v6. |
| 2026-06-15 | 6 | Delivery Authority | **Simplify thành 1 batch endpoint duy nhất + extend `DocumentPrintType` enum cho ③④** (chốt user 2026-06-15 chuỗi clarify cuối): (1) "Tạo hồ sơ bảo hiểm" là **FE-only modal** — KHÔNG API create; (2) FormData ③④ giữ FE state local trong modal — KHÔNG endpoint `/form` riêng; (3) Khi user bấm Xuất → **1 GraphQL mutation** gửi tất cả → BFF passthrough thẳng **1 REST endpoint batch** `POST /api/v1/insurance-dossiers/{settlementCode}/export` body `{documentTypes[], acceptanceFormData?, authorizationFormData?}` → gf-accounting xử lý transaction: INSERT dossier vN+1 + parallel render N PDF + push ct-file-storage + INSERT N row docs + finalize + mark vN cũ REPLACED → trả `{versionNo, exports:[{documentType, fileUrl, fileName}]}`; (4) ③④ render qua **extend `DocumentPrintType` enum** + 2 strategy + 2 data builder + 2 print context + 2 template (theo CÙNG pattern `SETTLEMENT` baseline `SettlementPrintStrategy`/`SettlementPrintDataBuilder`/`SettlementPrintContext`/`settlement.html`); (5) Atomicity: 1 doc fail → rollback batch; user retry; (6) Versioning auto-increment trong endpoint export, KHÔNG endpoint `/versions` riêng. Tổng còn 2 endpoint gf-accounting (batch export + list versions) + 2 BFF op (passthrough). Effort DEV gf-accounting ~10h→~7h, agg-garage-graph ~6h→~3h. |
| 2026-05-31 | 3 | Delivery Lead | **Renumber ADR-017 → ADR-016** (do hợp nhất ADR-015 cũ vào ADR-014). Nội dung không đổi; file rename `ADR-017-…` → `ADR-016-insurance-dossier-pdf-s3.md`. |
| 2026-06-16 | 10 | Delivery Authority | **Template binding model + Print Context architecture (post-template-rewrite 2026-06-16)**: (1) §Decision §Print infrastructure ③④: clarify template Thymeleaf bind **100% từ `${formData.X}`** (no resolve customerInfo/vehicleInfo/garageInfo/insuranceInfo từ Settlement) — phù hợp formData ③④ đã chứa cả prefill data per strict Figma State 4/5 (FE prefill từ Settlement context trước khi user edit, snapshot vào formData). (2) `AcceptanceRecordPrintContext` + `PaymentAuthorizationPrintContext` Java class **minimal wrap formData** (1 field), KHÔNG enrich từ Settlement entity → simpler builder, no domain coupling. (3) Templates `Product/ux/assets/{bien-ban-nghiem-thu,giay-uy-quyen}.html` đã rewrite cùng ngày: drop 3 drift sections trong bbnt (3-col Đại diện + Mô tả hạng mục table + Ghi chú), drop customerType branching trong guq, rewrite ~38 bindings sang formData paths. Reference: gf-accounting-api v15 §3bis.5 Template Binding Map. |
| 2026-06-16 | 9 | Delivery Authority | **Form data drop persistence + expand schema strict Figma (BA clarification 2026-06-16)**: (1) Form fields ③④ chỉ là transient render input cho BE Thymeleaf template, **KHÔNG persist DB** (BR-INS-DOSSIER-002/003). §Decision §Immutability: `copyFromVersion` chỉ clone PDF URL (KHÔNG còn `form_data` snapshot vì cột bị drop khỏi `insurance_dossier_documents`). §Decision §Input ③④: clarify formData typed nested (13 fields ③ / 22 fields ④), strict Figma State 4&5 — link sang gf-accounting-api v14 + agg-garage-graph-graphql v7.6. §References data-model thêm note drop `form_data` JSONB. (2) Hệ quả UX: copy-from-version chỉ tái sử dụng PDF cũ; user muốn re-render với nội dung khác phải fill lại form trong modal. Cross-ref gf-accounting-api v14 (formData schema match Figma) + gf-accounting-data-model v8 (drop form_data column) + agg-garage-graph-graphql v7.6 (typed nested Input + drop snapshot Output). |
| 2026-06-17 | 11 | Delivery Authority | **SUPERSEDE signed URL TTL 300s + add list pagination Spring Pageable** per user feedback 2026-06-17. (1) §Title đổi "+ signed URL" → "+ FE-composed URL". (2) §Decision headline bỏ "access qua signed URL TTL ngắn" → "BE expose `pdfUrl` = path; FE compose download URL từ env domain config + cơ chế hiện hữu"; thêm "List endpoint paginated Spring Pageable". (3) §Decision §Access bullet rewrite: pdfUrl = relative path / ct-file-storage object key (no scheme/domain); FE nối domain config; KHÔNG endpoint `/download` riêng; KHÔNG signed URL TTL (supersede chốt 2026-05-31 "signed URL TTL 300s"). (4) §Decision thêm bullet §List pagination: `GET /{settlementCode}` → `POST /search` body `{settlementCode, page, size}` Spring Pageable (max size=50, default page=0, size=10), reuse convention `POST /settlements/search` baseline. (5) §Trade-off line "Quyết định 2026-05-31": signed URL TTL = ~~300s~~ → SUPERSEDED, đánh dấu rõ; retention 10 năm + chỉ-tên DN BH giữ; thêm chốt list pagination. Cross-ref gf-accounting-api v16 (POST /search + pagination response) + agg-garage-graph-graphql v7.7 (Query input + Response Spring Pageable wrapper) + PKG-W02 v13. **Rationale**: đơn giản hoá download flow — FE đã có cơ chế nối domain config + browser download pattern reuse từ phiếu QT in / settlement print; tránh overhead BFF query signed URL on-demand. Trade-off security: bucket public-read prefix lộ file nếu pdfUrl leak — mitigation qua tenant prefix obscurity + Platform/Security xác nhận production. |
