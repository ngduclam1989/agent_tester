---
type: execution-spec
artifact_kind: wave-overview
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W02"
last_reviewed: "2026-06-18"
source: "gen-execution-spec"
generated_at: "2026-06-18T01:05:38+00:00"
pkg_ref: "PKG-W02-insurance-dossier"
pkg_version: 13
features_in_wave:
  - FEAT-INS-STL-CREATE
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
epics_in_wave:
  - EP-INSURANCE-SETTLEMENT
brs_in_wave:
  - BR-EP-INSURANCE-SETTLEMENT
boundaries_in_wave:
  - gf-accounting
  - gf-sales
  - agg-garage-graph
  - garage-web
  - garage-mobile
fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
pre_conditions_satisfied:
  - "EP-INSURANCE-SETTLEMENT.md DRAFT ✓"
  - "BR-EP-INSURANCE-SETTLEMENT.md DRAFT ✓"
  - "FEAT-INS-STL-CREATE × {be,bff,fe-web,mobile} DRAFT ✓"
  - "FEAT-INS-DOSSIER-CREATE × {be,bff,fe-web,mobile} DRAFT ✓"
  - "FEAT-INS-DOSSIER-VIEW × {be,bff,fe-web,mobile} DRAFT ✓"
---

# W02 Wave Overview — Settlement Adjustments + Insurance Dossier

> Tài liệu tổng hợp wave-level từ 14 spec DRAFT (1 EP + 1 BR + 12 FEAT-tier). Không thay thế tier spec riêng — đây là điểm tra cứu cross-boundary cho Delivery Authority + Architecture Authority + REVIEW agents.
>
> Nguồn: `PKG-W02-insurance-dossier` v13 · `EP-INSURANCE-SETTLEMENT` v19 · `BR-EP-INSURANCE-SETTLEMENT` v30.

---

## §1 Wave Scope

### 1.1 Phạm vi tổng thể

| Trường | Giá trị |
|---|---|
| Wave | W02 |
| Tiêu đề | Settlement Adjustments + Insurance Dossier |
| Epic | EP-INSURANCE-SETTLEMENT (slice 2/3) |
| Cấu trúc | **2 Phase tuần tự**: Phase A (~2 ngày) → Hard Gate → Phase B (~4 ngày) |
| Thời lượng mục tiêu | 6 ngày (~40h work, 4 dev parallel) |

### 1.2 Boundaries affected

| Boundary | Tech | Role trong W02 |
|---|---|---|
| `gf-accounting` | Java / Spring Boot | **Lead boundary** — entity mới, 4 endpoint REST, PDF gen, logic phân bổ BH |
| `gf-sales` | Java / Spring Boot | Consumer / CR boundary — cảnh báo popup SO, phục vụ export-pdf QUOTATION |
| `agg-garage-graph` | Node.js / Apollo | BFF orchestrator — 1 mutation 4-phase + 1 query passthrough |
| `garage-web` | React 19 | UI consumer — modal accordion dọc, tab dossier, panel read-only |
| `garage-mobile` | Flutter 3.41 | UI consumer — full-screen flow, template editable, tab dossier |

### 1.3 Features trong wave

| Feature | Phase | Boundary chính | Loại thay đổi | Mô tả ngắn |
|---|---|---|---|---|
| FEAT-INS-STL-CREATE | A | gf-accounting | brownfield-enhancement | Thêm panel read-only "Tổng giá dịch vụ" (3 khối) trên màn Tạo phiếu QT; snapshot phân bổ vào cặp phiếu QT khi xác nhận |
| CR-20260612-01 (gắn A2) | A | gf-accounting + UI | brownfield-enhancement | Panel chi tiết QT tách per-payer: phiếu BH 1 cột BH; phiếu KH thêm "Phân bổ BH" khi `soHasInsurance` |
| CR-20260616-01 (gắn A3) | A | gf-accounting + gf-sales | brownfield-enhancement | Template in phiếu QT bổ sung section "Phân bổ bảo hiểm" per-payer (BH 5 khoản / KH 3 khoản) |
| CR-20260612-02 (gắn A4) | A | gf-sales + UI | brownfield-enhancement | Popup hoàn thành SO: cảnh báo BH thanh toán âm (warn-and-allow, `ERR-INS-003`) |
| CR-20260616-02 (gắn A5) | A | garage-web + garage-mobile | brownfield-enhancement | Panel 2 cột (BH \| KH) trên 3 màn SO Edit/Detail + Tạo QT |
| FEAT-INS-DOSSIER-CREATE | B | gf-accounting | new-capability | 2 aggregate mới + 4 endpoint dossier + PDF gen ③④ qua common-printing + BFF orchestrator 4-phase |
| FEAT-INS-DOSSIER-VIEW | B | gf-accounting | new-capability | List dossier paginated (POST /search Spring Pageable) + tab "Hồ sơ đã xuất" UI read-only |

---

## §2 Cross-boundary Service Impact Matrix

> Tổng hợp từ §6 EP-INSURANCE-SETTLEMENT.

| Boundary | Schema delta | API delta | UI delta | Event delta | Phụ thuộc |
|---|---|---|---|---|---|
| `gf-accounting` | **MỚI** `insurance_dossiers` + `insurance_dossier_documents` (ddl-auto=update, Phase B). `settlement_records` +17 cột additive (Phase A — snapshot phân bổ BH). | **MỚI Phase B** 4 endpoint canonical: `POST acceptance-record/render-pdf`, `POST payment-authorization/render-pdf`, `POST /batch`, `POST /search`. **Extend Phase A** `GET /settlements/{code}` → trả `insuranceAdjustment` block + cờ `soHasInsurance`. | — | Không event mới. `gf-accounting → gf-sales` callback baseline CB-INS-003 (giữ nguyên). | Phụ thuộc gf-sales: `for-settlement` REST (snapshot SO). Phụ thuộc ct-file-storage: chỉ lưu `pdf_url` object key. |
| `gf-sales` | Không thay đổi schema. | Expose "BH thanh toán" computed cho popup hoàn thành SO (CR-20260612-02). Serve `GET /api/v2/service-orders/{soId}/export-pdf?type=QUOTATION` (baseline) cho BFF Phase B render ①. | — | — | Nhận callback từ gf-accounting (CB-INS-003 baseline). |
| `agg-garage-graph` | — | **MỚI Phase B** 2 ops: mutation `exportInsuranceDossier` (4-phase orchestrator A→B→C→D→E), query `getInsuranceDossierVersions` (passthrough POST /search). **Extend Phase A** query mở màn Tạo QT → trả `insuranceAdjustment` block + cờ `soHasInsurance`. | — | — | → gf-accounting (4 REST dossier + settlement). → gf-sales (export-pdf QUOTATION). → ct-file-storage (upload Phase C, `POST /api/v1/files/upload-files`, `folderType=SETTLEMENTS`). |
| `garage-web` | — | — | **Phase A** Panel read-only Tạo QT (reuse component W01) + panel per-payer chi tiết QT (CR-20260612-01) + panel 2 cột SO Edit/Detail (CR-20260616-02) + cảnh báo popup SO (CR-20260612-02). **Phase B** Modal accordion dọc 4 tài liệu + `InsuranceDossierTab` (layout 2 cột). 3 component mới: `dossier-document-row`, `dossier-template-form`, `pdf-preview` (chờ PDF lib). | — | → agg-garage-graph (GraphQL ops #51-52 + extended query). |
| `garage-mobile` | — | — | **Phase A** Panel read-only Tạo QT (reuse panel W01) + per-payer chi tiết QT + popup cảnh báo + panel 2 cột SO. **Phase B** `InsuranceDossierScreen` full-screen + `DossierDocumentDetailScreen` (template editable ③④ + "Lưu thông tin" cục bộ phiên) + `DossierPreviewScreen` + tab "Hồ sơ đã xuất" thay placeholder W01. | — | → agg-garage-graph (GraphQL ops #51-52 + extended query). |

**Dependency arrows tóm tắt:**
- `garage-web` / `garage-mobile` → `agg-garage-graph` → `gf-accounting` → (gf-sales, ct-file-storage)
- `agg-garage-graph` → `gf-sales` (export-pdf ① Phase B)
- `gf-accounting` → `gf-sales` (callback SO settled CB-INS-003 baseline)

---

## §3 Implementation Sequence DAG

> Copy từ §8 EP-INSURANCE-SETTLEMENT.

```
PHASE A (~2 ngày):

[Day 1 — parallel]
  gf-accounting (A)  : Extend GET settlement response → trả insuranceAdjustment block
  gf-sales (A)       : Cung cấp computed "Bảo hiểm thanh toán" cho popup hoàn thành SO (CR-20260612-02)

  Entry  : W01 hard gate pass (phiếu QT BH detail stable 24h staging)
  Exit   : Extended settlement response verified + gf-sales endpoint available

[Day 1-2 — depends on gf-accounting A]
  agg-garage-graph (A): Extend query mở màn Tạo phiếu QT → trả insuranceAdjustment block
                        Wire CR-20260612-01 cờ soHasInsurance + block phân bổ per-payer

  Entry  : gf-accounting extended response available
  Exit   : GraphQL response includes insuranceAdjustment + soHasInsurance

[Day 1-2 — parallel với agg-garage-graph A]
  garage-web (A)     : Panel read-only "Tổng giá dịch vụ" trên màn Tạo phiếu QT (FEAT-INS-STL-CREATE reuse component W01)
                       Panel per-payer chi tiết QT (CR-20260612-01)
                       Panel 2 cột SO Edit/Detail (CR-20260616-02)
                       Cảnh báo popup hoàn thành SO (CR-20260612-02)
  garage-mobile (A)  : Equivalent Phase A (parallel với garage-web)

  Entry  : agg-garage-graph A done
  Exit   : Phase A merged + stable trên staging ≥ 24h

══════ HARD GATE A → B ══════════════════════════════════════════════

PHASE B (~4 ngày):

[Day 3 — gf-accounting B]
  gf-accounting (B1) : Entity/table provisioning: insurance_dossiers + insurance_dossier_documents
                       (ddl-auto=update — không Flyway migration)
  gf-accounting (B2) : 4 new REST endpoints:
                       POST render-pdf/acceptance-record (transient)
                       POST render-pdf/payment-authorization (transient)
                       POST /insurance-dossier-documents/batch (atomic persist)
                       POST /insurance-dossiers/search (paginated)
                       common-printing strategies: AcceptanceRecordPrintStrategy + PaymentAuthorizationPrintStrategy

  Entry  : ct-file-storage provisioned + PDF template Legal approval + Hard Gate A pass
  Exit   : 4 endpoints available + schema stable

[Day 3-4 — depends on gf-accounting B2]
  agg-garage-graph (B): Mutation exportInsuranceDossier (4-phase orchestrator)
                         Query getInsuranceDossierVersions (passthrough)

  Entry  : gf-accounting B2 done + ct-file-storage upload API available
  Exit   : ops #51-52 deployed + integration tested

[Day 4-6 — parallel, depends on agg-garage-graph B]
  garage-web (B)     : Modal accordion dọc + InsuranceDossierTab
                       3 new components: dossier-document-row, dossier-template-form, pdf-preview (sau khi chốt PDF lib)
  garage-mobile (B)  : InsuranceDossierScreen + DossierDocumentDetailScreen + DossierPreviewScreen
                       Tab "Hồ sơ bảo hiểm đã xuất" thay placeholder W01

  Entry  : agg-garage-graph B done + PDF lib decision + Figma W02 prefetched
  Exit   : E2E dossier flow pass + KG updated
```

---

## §4 Hard Gate

> Copy từ PKG-W02-insurance-dossier §7 Dependencies.

### Hard Gate W01 → W02 (Phase A Entry)

| Dependency | Deadline | Risk |
|---|---|---|
| Phiếu QT BH detail stable 24h staging | Day 0 (Phase A) | HIGH — block start |
| SO snapshot allocation contract ADR-015 ratified | Day 0 | HIGH |
| ≥ 5 phiếu QT BH test data trên staging | Day 0 | MED |
| 3 CR APPROVED + FEAT-INS-STL-CREATE PO sign-off | Day 0 | LOW (đã APPROVED) |

### Hard Gate Phase A → B

| Dependency | Deadline | Risk |
|---|---|---|
| Panel "Tổng giá dịch vụ" per-payer stable trên staging ≥ 24h | Day 2-3 | HIGH — block Phase B |
| Template in phiếu QT/Phiếu báo giá stable | Day 2-3 | HIGH |
| `ct-file-storage` provisioned (`POST /api/v1/files/upload-files` + `folderType="SETTLEMENTS"` + tenant header + 10 năm retention) | Day 0 (Phase B) | HIGH — block dev Phase B |
| PDF template Legal approval (4 tài liệu) | Day 0 (entry) | MED |
| ADR-016 ratify | Day 0 | MED |
| MR design pre-wave merged (HLD-ACCOUNTING + gf-accounting-api v16 + INTEG + ADR-016) | Day 0 | MED |
| Figma W02 prefetched (`/prefetch-figma web 02` + `/prefetch-figma mobile 02`) | Day 0 (Phase B) | HIGH — block visual dev |
| Mobile PDF library decision | Day 0 (Phase B) | HIGH — block mobile Phase B |

---

## §5 Cross-boundary Contracts (consolidated)

> Tổng hợp từ §7 EP-INSURANCE-SETTLEMENT + BR-EP-INSURANCE-SETTLEMENT §1.1.

| CB ID | Mô tả | Touchpoint | Scope W02 |
|---|---|---|---|
| CB-INS-001 | Tenant isolation strict — `tenantId` filter mọi request; header `X-Tenant-Id` mandatory | TenantFilter gf-accounting + gf-sales + agg-garage-graph | Toàn wave |
| CB-INS-002 | gf-accounting → gf-sales: REST snapshot SO kèm Nguồn TT per dòng + 5 khoản điều chỉnh BH (endpoint `for-settlement` — tên chính xác NEED CONFIRMATION). Snapshot immutable sau tạo. | REST gf-accounting → gf-sales | Phase A+B |
| CB-INS-003 | gf-accounting → gf-sales: callback sau tạo phiếu QT BH → SO "đã quyết toán". Không có cancel phiếu QT BH. | `POST /protected/v1/service-orders/{id}/mark-settled` (baseline) | Phase A |
| CB-INS-004 | Atomic pair phiếu QT (INSURANCE + CUSTOMER) trong 1 `@Transactional` gf-accounting. | Internal gf-accounting | Phase A |
| CB-INS-006 | Công ty BH = system-seeded (gf-erp-mdm catalog). gf-sales lưu `insurance_company` (baseline). gf-accounting đọc CTBH qua `for-settlement`. | gf-erp-mdm → gf-sales → gf-accounting (qua REST) | Phase A+B |
| CB-INS-009 | ct-file-storage lưu PDF hồ sơ BH theo path `{tenant}/insurance-dossiers/{settlementId}/v{N}/{filename}`. BFF orchestrate upload; gf-accounting chỉ lưu `pdf_url` (object key, no scheme/domain). | BFF `POST /api/v1/files/upload-files` multipart `folderType="SETTLEMENTS"` → ct-file-storage | Phase B |
| CB-INS-010 | Mọi GraphQL ops BH → agg-garage-graph → gf-accounting/gf-sales. Frontend không gọi trực tiếp backend. | ops #51-52 (agg-garage-graph-graphql v7.7) | Toàn wave |

**Contracts mới Phase B (BFF orchestrator — ADR-016 v11):**

| Phase | Call | Protocol |
|---|---|---|
| A — resolve ctx | `GET /api/v1/settlements/{settlementCode}` → gf-accounting | REST (BFF) |
| B — parallel render | `GET /api/v2/service-orders/{soId}/export-pdf?type=QUOTATION` (gf-sales) + `GET /api/v1/settlements/{id}/export-pdf` (gf-accounting) + `POST render-pdf/acceptance-record` + `POST render-pdf/payment-authorization` | REST (BFF → gf-accounting/gf-sales) |
| C — parallel upload | `POST /api/v1/files/upload-files` multipart | BFF → ct-file-storage |
| D — persist atomic | `POST /api/v1/insurance-dossier-documents/batch` | BFF → gf-accounting |
| E — aggregate | response `{versionNo, exports[]}` | GraphQL → FE/Mobile |

---

## §6 Open Items (wave-level aggregated)

> Tổng hợp NEED CONFIRMATION từ 14 spec DRAFT: EP-INSURANCE-SETTLEMENT §10 (8 items) + BR-EP §7 (5 items, 3 unique) + FEAT tier specs. Ưu tiên theo blocker.

### 6.1 Blocker — Phase A start

| ID | Nguồn | Mô tả | Owner |
|---|---|---|---|
| NC-W02-EP-008 | EP §10 | BR-INS-STL-DET-009: 2 khoản "CK liên kết BH" trên phiếu QT KH — ẩn hay hiển thị? PKG chốt "ẩn" (2026-06-16) nhưng BR vẫn có NEED CONFIRMATION. Confirm với BA trước khi impl CR-20260612-01. | Business Authority |
| NC-W02-FEAT-STL-FE-001 | FEAT-INS-STL-CREATE fe-web | GraphQL op names cho query mở màn Tạo QT — đánh dấu NEED CONFIRMATION, block S6 FE cho đến khi BFF tier S5 stable. | Architecture Authority + BFF Lead |
| NC-W02-FEAT-STL-MOB-001 | FEAT-INS-STL-CREATE mobile | Figma mobile node-id cho màn Tạo phiếu QT chưa có (tạm dùng Web node `13535-159225`). Block visual impl S6.3. | Business Authority + Mobile UX |
| NC-W02-EP-001 | EP §10 | Figma mobile link FEAT-INS-STL-CREATE: node `553-27738` (v19) — confirm bản mobile W02 đã prefetch hay còn pending. | Business Authority + Mobile UX |

### 6.2 Blocker — Phase B entry

| ID | Nguồn | Mô tả | Owner |
|---|---|---|---|
| NC-W02-EP-003 | EP §10 | `INTEG-BFF-CT-FILE-STORAGE.md` có tồn tại không? Nếu chưa → tạo trước Phase B (BFF upload orchestration Phase C). | Architecture Authority |
| NC-W02-EP-006 | EP §10 | Mobile PDF library: `pdfx` / `flutter_pdfview` / `syncfusion_flutter_pdfviewer` — Mobile Lead chốt license + perf. Block mobile Phase B. | Mobile Lead |
| NC-W02-BR-004 | BR §7 | Virus scan strategy (ClamAV sidecar / Lambda S3 trigger / client-side) — chưa chốt, block Phase B go-live gate. | Security / Platform |
| NC-W02-BR-005 | BR §7 | Mobile PDF library (đồng với NC-W02-EP-006 — xác nhận chung). | Mobile Lead |
| NC-W02-FEAT-DC-FE-001 | FEAT-INS-DOSSIER-CREATE fe-web | Figma node-id màn Hồ sơ bảo hiểm Phase B web chưa có (`[FIGMA-TBD]`). Cần `/prefetch-figma web 02` trước S6.2. Block visual impl. | Business Authority + UX |
| NC-W02-FEAT-DC-MOB-001 | FEAT-INS-DOSSIER-CREATE mobile | Figma node-id màn Hồ sơ bảo hiểm mobile Phase B chưa có. Cần `/prefetch-figma mobile 02` trước S6.2. | Business Authority + Mobile UX |
| NC-W02-FEAT-DV-FE-001 | FEAT-INS-DOSSIER-VIEW fe-web | Figma node-id tab "Hồ sơ bảo hiểm đã xuất" chưa có — dev implement theo AC + BR layout 2 cột, cập nhật khi Figma ref được cung cấp. | Business Authority + UX |
| NC-W02-FEAT-DV-MOB-001 | FEAT-INS-DOSSIER-VIEW mobile | Figma node-id màn "Hồ sơ BH đã xuất" mobile chưa có. Block S6.3 widget golden test. | Business Authority + Mobile UX |

### 6.3 Cần xác nhận (không block ngay)

| ID | Nguồn | Mô tả | Owner |
|---|---|---|---|
| NC-W02-EP-002 | EP §10 | Endpoint name gf-accounting lấy snapshot SO (CB-INS-002): `GET /api/v2/service-orders/{id}` extend hay riêng `for-settlement`? | Architecture Authority |
| NC-W02-EP-004 | EP §10 | CB-INS-006: integration path CTBH từ gf-erp-mdm qua gf-sales tới gf-accounting — confirm `for-settlement` đã include `insuranceCompanyName`/`insuranceCompanyCode`. | Architecture Authority |
| NC-W02-BR-001 | BR §7 | `INS_STL_NO_BH_ITEMS` error code: ERROR-CODE-REGISTRY chưa list canonical `INS-2004` conflict với `INS_STL_SO_NOT_COMPLETED`. DEV confirm với BA trước implement. | Business Authority + DEV gf-accounting |
| NC-W02-BR-003 | BR §7 | BR-INS-STL-DET-009 (đồng NC-W02-EP-008): PKG chốt "ẩn" — verify final với BA trước sprint start. | Business Authority |
| NC-W02-BFF-001 | FEAT-INS-STL-CREATE bff | Persisted query allowlist W02 — bật hay dùng dynamic query (pattern W01)? | Architecture Authority |
| NC-W02-BFF-002 | FEAT-INS-DOSSIER-VIEW bff | `PaginationMeta` type trong schema agg-garage-graph — đã có convention reusable hay cần tạo mới? | Architecture Authority |
| NC-W02-EP-005 | EP §10 | CB-INS-008 (DEFERRED W03): endpoint `/protected/v1/insurance-debt-summary` + INTEG file — resolve khi FEAT-INS-DASH-DEBT vào scope W03. | Delivery Authority |

---

## §7 References

| Artifact | Path | Notes |
|---|---|---|
| Work package | `Execution/work-packages/PKG-W02-insurance-dossier.md` v13 | Phase plan, entry criteria, DEV playbook, hard gate |
| Epic execution spec | `Execution/wave-specs/W02/Product/epics/EP-INSURANCE-SETTLEMENT.md` | §6 Impact Matrix, §7 Contracts, §8 DAG |
| BR execution spec | `Execution/wave-specs/W02/Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` | §1 rules, §3 enforcement, §6 error codes, §7 open items |
| FEAT-INS-STL-CREATE (BE) | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-STL-CREATE.md` | |
| FEAT-INS-STL-CREATE (BFF) | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-STL-CREATE.md` | |
| FEAT-INS-STL-CREATE (FE-web) | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-STL-CREATE.md` | |
| FEAT-INS-STL-CREATE (Mobile) | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-STL-CREATE.md` | |
| FEAT-INS-DOSSIER-CREATE (BE) | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-CREATE.md` | |
| FEAT-INS-DOSSIER-CREATE (BFF) | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-DOSSIER-CREATE.md` | |
| FEAT-INS-DOSSIER-CREATE (FE-web) | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-CREATE.md` | |
| FEAT-INS-DOSSIER-CREATE (Mobile) | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-CREATE.md` | |
| FEAT-INS-DOSSIER-VIEW (BE) | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-VIEW.md` | |
| FEAT-INS-DOSSIER-VIEW (BFF) | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-DOSSIER-VIEW.md` | |
| FEAT-INS-DOSSIER-VIEW (FE-web) | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-VIEW.md` | |
| FEAT-INS-DOSSIER-VIEW (Mobile) | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-VIEW.md` | |
| ADR-016 | `Architecture/decisions/ADR-016-insurance-dossier-pdf-s3.md` | PDF dossier storage; ct-file-storage; common-printing; no signed URL TTL |
| ADR-015 | `Architecture/decisions/ADR-015-*.md` | SO snapshot allocation contract |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| KG gf-accounting | `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6 | Baseline APIs + entities |
| Wave sequence | `Plan/WAVE-SEQUENCE.md §1.2` | Hard gate A→B definition |
| Change requests | `Tracking/CHANGE-REQUESTS.md` | CR-20260612-01/02, CR-20260616-01/02 |
| Print mockup BH | `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance}.html` | CR-20260616-01 template đích |
| UX-FLOW fallback | `Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md` | Fallback khi UX-FLOW dossier riêng chưa tồn tại |
| Decision log | `Execution/wave-specs/W02/_decisions.md` | 44 quyết định non-trivial đã log |

---

## §8 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT wave overview W02 từ 14 spec DRAFT (1 EP + 1 BR + 12 FEAT-tier). §1 Wave scope (PKG v13). §2 Cross-boundary Service Impact Matrix (tổng hợp EP §6). §3 Implementation sequence DAG (copy EP §8). §4 Hard gate (PKG §7 Dependencies). §5 Cross-boundary contracts (EP §7 + BR §1.1). §6 Open items aggregated: 4 blocker Phase A + 8 blocker Phase B + 7 cần xác nhận. |
