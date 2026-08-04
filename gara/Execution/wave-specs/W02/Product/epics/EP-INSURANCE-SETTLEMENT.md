---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W02"
last_reviewed: "2026-06-18"
source_ref: "Product/epics/EP-INSURANCE-SETTLEMENT.md"
source_version: 19
source_sha: "0330b64ee396cfb4e36c07aa6db1dbe492becce65ed304fbab0e91019051ca23"
generated_at: "2026-06-18T01:05:38+00:00"
parent_pkg: "PKG-W02-insurance-dossier"
features_in_wave:
  - FEAT-INS-STL-CREATE
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
boundaries_affected:
  - gf-accounting
  - gf-sales
  - agg-garage-graph
  - garage-web
  - garage-mobile
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
---

# EP-INSURANCE-SETTLEMENT — Execution Spec (W02)

> **Execution spec**, không phải nguồn BA. Nguồn gốc: `Product/epics/EP-INSURANCE-SETTLEMENT.md` v19.
> §1-§5 verbatim từ source. §6-§12 là DEV section do Delivery Authority + Architecture Authority soạn.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INSURANCE-SETTLEMENT.md`](../../../../Product/epics/EP-INSURANCE-SETTLEMENT.md) |
| Source version | 19 |
| Source SHA | `0330b64ee396cfb4e36c07aa6db1dbe492becce65ed304fbab0e91019051ca23` |
| Generated at | 2026-06-18T01:05:38+00:00 |
| Wave | W02 — Settlement Adjustments + Insurance Dossier |

---

## 1. Outcome / Hypothesis

Nếu garage có thể phân tách chi phí sửa chữa theo nguồn thanh toán (bảo hiểm vs khách hàng), tính chính xác số tiền bảo hiểm phải trả sau các khoản điều chỉnh, tạo phiếu quyết toán bảo hiểm độc lập, xuất bộ hồ sơ PDF gửi doanh nghiệp bảo hiểm và theo dõi công nợ phải thu từ BH trên dashboard — thì garage sẽ kiểm soát được dòng tiền bảo hiểm, giảm sai sót quyết toán hai phía (BH/KH), rút ngắn thời gian thu hồi tiền bảo hiểm và loại bỏ thao tác Excel ngoài hệ thống.

---

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Kế toán | PRIMARY | Phân bổ nguồn TT trên Phiếu dịch vụ, nhập điều chỉnh BH, tạo phiếu QT BH, lập & xuất bộ hồ sơ BH (4 tài liệu chuẩn), ghi nhận thanh toán từ BH nhiều đợt, tạo bộ hồ sơ mới khi BH yêu cầu sửa |
| Chủ garage | PRIMARY | Quyền tương đương kế toán; thêm nhiệm vụ kiểm soát doanh thu BH, chiết khấu liên kết BH, theo dõi công nợ BH qua widget Dashboard, review phiếu QT BH trước khi xuất hồ sơ, giải thích các khoản điều chỉnh BH cho khách hàng |

---

## 3. Vòng đời nghiệp vụ

```
  ┌────────────────────────┐
  │ Tạo SO + báo giá sơ bộ │  (Create — KHÔNG có phân bổ BH)
  └───────────┬────────────┘
              │ gửi báo giá sang BH duyệt (ngoài hệ thống)
              ▼
  ┌────────────────────────┐
  │ BH duyệt + đưa phân bổ │
  └───────────┬────────────┘
              │ garage chỉnh sửa SO (Edit)
              ▼
  ┌────────────────────────┐
  │ Phiếu dịch vụ (SO Edit)│
  │  nhập Nguồn TT per dòng│
  │  + 5 khoản điều chỉnh  │
  └───────────┬────────────┘
              │ (hoàn thành SO)
              ▼
  ┌────────────────────────┐         ┌──────────────────────┐
  │ Phiếu QT loại Bảo hiểm │────────▶│   Đã huỷ            │
  │  (DRAFT)               │  Huỷ    │  (CANCEL)           │
  └───────────┬────────────┘         └──────────────────────┘
              │ (kế toán hoàn thiện số liệu)
              ▼
  ┌────────────────────────┐
  │ Tạo Hồ sơ bảo hiểm     │
  │  (4 tài liệu chuẩn)    │
  └───────────┬────────────┘
              │ (in/xuất PDF)
              ▼
  ┌────────────────────────┐
  │ Hồ sơ đã xuất (PDF)    │  ───►  Tab "Hồ sơ BH đã xuất" (read-only)
  │  bản v1                │
  └───────────┬────────────┘
              │ (BH yêu cầu sửa → tạo bản mới)
              ▼
  ┌────────────────────────┐
  │ Hồ sơ v2, v3...        │  ───►  Lưu lịch sử tất cả bản
  └───────────┬────────────┘
              │
              ▼ (BH chuyển tiền — có thể nhiều đợt)
  ┌────────────────────────┐
  │ Ghi nhận thanh toán BH │  ───►  Tái sử dụng chức năng ghi nhận
  │  trên phiếu QT BH      │        thanh toán hiện có (FEAT-STL-DETAIL)
  └────────────────────────┘
```

**Ghi chú:**
- Phiếu QT BH là **loại phiếu mới song song** với phiếu QT khách hàng — một SO có hạng mục BH + KH sẽ sinh ra **cặp** 2 phiếu QT (logic baseline đã có ở `EP-SETTLEMENT` AC-4, AC-5 của `FEAT-STL-CREATE`).
- Epic này **mở rộng** baseline `EP-SETTLEMENT` + `EP-SERVICE-ORDER` để thêm: (a) phân bổ nguồn TT per dòng, (b) section "Phân bổ quyết toán bảo hiểm" trên SO với 5 khoản điều chỉnh, (c) module Hồ sơ bảo hiểm với versioning, (d) widget công nợ BH trên Dashboard.
- **KHÔNG sửa nội dung baseline đã DONE** của `EP-SETTLEMENT`, `EP-SERVICE-ORDER`, `EP-DASHBOARD` — các feature mới của epic này chỉ extend.

---

## 4. Phạm vi nghiệp vụ

### 4.1 Trên Phiếu dịch vụ (mở rộng EP-SERVICE-ORDER)

> **Chỉ ở màn hình Chỉnh sửa (Edit) + Chi tiết (Detail) — KHÔNG ở Tạo (Create)** (chốt 2026-05-27). Luồng thực tế: `Xe đến → cố vấn khám + lên đầu mục → tạo SO + báo giá sơ bộ (Create) → gửi báo giá sang BH duyệt → BH duyệt + đưa thông tin phân bổ → garage chỉnh sửa SO (Edit) nhập phân bổ BH đã duyệt`. Tại thời điểm Create chưa biết BH duyệt gì nên không có dữ liệu phân bổ.

- Chọn **Nguồn thanh toán** (Bảo hiểm / Khách hàng tự thanh toán) cho từng dòng vật tư/phụ tùng và công dịch vụ — **đã có ở production (EP-SERVICE-ORDER baseline)**, là foundation, không dev lần này.
- **(MỚI — scope epic)** Nhập các khoản điều chỉnh bảo hiểm trong section "Phân bổ quyết toán bảo hiểm" (ở màn Edit):
  - **Chiết khấu liên kết BH — Vật tư**: nhập theo **% hoặc số tiền** (UI có toggle).
  - **Chiết khấu liên kết BH — Công dịch vụ**: nhập theo **% hoặc số tiền** (UI có toggle).
  - **Khấu hao vật tư / thay mới**: áp dụng đồng loạt hoặc chỉnh riêng từng dòng phụ tùng.
  - **Giảm trừ bồi thường**: nhập theo **% hoặc số tiền** (UI có toggle).
  - **Khấu trừ bảo hiểm**: **nhập tay số tiền** (không tra cứu hợp đồng/template).

### 4.2 Phiếu quyết toán bảo hiểm

> **Tạo phiếu quyết toán (gồm cặp KH+BH) đã có ở production** (FEAT-STL-CREATE baseline). Phần MỚI lần này gồm 2 phần bổ trợ: (a) **truyền thêm thông tin phân bổ bảo hiểm** (5 khoản điều chỉnh + Cộng sau VAT theo bên + BH thanh toán/KH chịu) vào payload khi tạo phiếu QT từ SO — để phiếu QT BH snapshot đúng dữ liệu phân bổ (gộp vào `FEAT-INS-SO-ADJUSTMENT` AC-15); (b) **hiển thị panel read-only "Tổng giá dịch vụ"** (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) ngay trên **màn xác nhận Tạo phiếu quyết toán** để kế toán đối chiếu trước khi chốt — thuộc `FEAT-INS-STL-CREATE` (CR mở rộng màn FEAT-STL-CREATE, hiển thị có điều kiện theo SO có/không Bảo hiểm). Không xây mới luồng tạo phiếu QT.

- Chỉ quyết toán các hạng mục có Nguồn thanh toán = Bảo hiểm trên SO liên kết (logic baseline).
- Bên thanh toán = Doanh nghiệp bảo hiểm.
- Hiển thị: Phiếu dịch vụ liên kết, thông tin khách hàng/xe, danh sách hạng mục thuộc BH, bảng phân bổ BH (mới truyền vào), BH thanh toán, Còn phải thu BH, KH chịu từ điều chỉnh BH.
- Theo dõi trạng thái thanh toán riêng so với phần khách hàng tự trả.
- **Ghi nhận thanh toán từ BH tái sử dụng chức năng ghi nhận thanh toán hiện hành** trên phiếu QT baseline — không phát triển thêm logic mới.

### 4.3 Hồ sơ bảo hiểm

- Bộ hồ sơ chuẩn **dùng chung cho tất cả doanh nghiệp BH (mẫu chung)**, gồm **4 tài liệu** theo thứ tự:
  1. **Phiếu quyết toán** — phiếu QT BH sinh từ hệ thống (auto, "Sẵn sàng").
  2. **Phiếu báo giá** — "PHIẾU BÁO GIÁ SỬA CHỮA" sinh từ phiếu QT BH (auto, "Sẵn sàng").
  3. **Biên bản nghiệm thu** — mẫu chung, kế toán hoàn tất ("Bổ sung").
  4. **Giấy ủy quyền nhận tiền bồi thường** — mẫu chung, cần chữ ký gốc KH ("Bổ sung").
- UI (modal): progress bar "{X}/4 tài liệu sẵn sàng", 4 thẻ ngang có checkbox + badge "Sẵn sàng"/"Bổ sung", preview + In phiếu/Lưu phiếu, footer "Huỷ bỏ"/"Xuất hồ sơ bảo hiểm".
- Sau khi xuất PDF, file lưu trong tab **"Hồ sơ bảo hiểm đã xuất"** — chế độ chỉ xem.
- Khi BH yêu cầu sửa → **tạo bộ hồ sơ mới** (versioning) — không unlock bộ cũ. Bộ cũ vẫn lưu trong tab "Hồ sơ đã xuất" để truy vết.

### 4.4 Công nợ BH trên Dashboard

- Mở rộng FEAT-DASH-VIEW của `EP-DASHBOARD` (không thay thế) với widget công nợ BH.
- Hiển thị (chốt 2026-05-27): 3 KPI (Tổng phải thu BH, Đã thu trong kỳ, Số phiếu chờ thu) + 2 top list (chờ thu theo số tiền, chậm thanh toán theo tuổi nợ) + filter kỳ (Hôm qua / Tuần này / Tuần trước / Tháng này / Tháng trước).
- **Bỏ khỏi scope**: biểu đồ lịch sử thanh toán BH + phân chia công nợ theo DN BH.

### 4.5 Danh sách công ty bảo hiểm (BASELINE — không phải feature của epic)

> **CHỐT 2026-05-27**: dropdown "Công ty bảo hiểm" + danh sách công ty BH **là system-seeded toàn platform** (list ABIC, AAA, Bảo Long, Bảo Minh, Bảo Việt, BHV... — garage chỉ chọn, KHÔNG tự thêm/sửa). Đây là **BASELINE production**, không dev lần này.
>
> → **Đã bỏ 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** (master data CRUD không cần — garage không quản lý danh sách).

- Công ty bảo hiểm được **chọn từ dropdown system-seeded** trên SO (toggle "Bảo hiểm = Có" — baseline production, xem §4.1).
- Tên công ty BH được snapshot vào phiếu QT BH + hồ sơ BH (in PDF) tại thời điểm tạo.
- **% chiết khấu liên kết** nhập trực tiếp per-SO trong section "Phân bổ quyết toán bảo hiểm" (không có config mặc định per công ty trong scope này).

---

## 5. Quy tắc tính toán nghiệp vụ

> **Chi tiết đầy đủ**: [`Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md`](../../../../Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md) — bao gồm 67 domain rules + 11 cross-boundary rules + 17 validation rules + công thức tính chi tiết (§7) + print/export rules (§8) + phân tích conflict & missing rules (§9).
>
> **Mã lỗi & thông báo**: [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../../../Product/error-code/ERROR-CODE-REGISTRY.md) — 18 mã (9 `ERR-CMN-*` common + 9 `ERR-INS-*` riêng) dùng chung BE/FE, kèm severity + hình thức hiển thị (TOAST/DIALOG/INLINE_*/EMPTY_STATE). Validation rules (BR §5) + Error UX (UX-FLOW §6/§8) đã map sang mã lỗi này.

```
Cơ sở tính = "Cộng sau VAT" theo bên thanh toán (xác nhận production screenshot 2026-05-27):

Cộng sau VAT (BH)            = Σ(dịch vụ BH) + Σ(phụ tùng BH) + Σ(thuế các dòng BH)
Cộng sau VAT (KH)            = Σ(dịch vụ KH) + Σ(phụ tùng KH) + Σ(thuế các dòng KH)
                            (Thuế do người dùng tự nhập per dòng — không cố định 10%)

BH thanh toán                = Cộng sau VAT (BH)
                               − CK liên kết BH (vật tư + công DV)
                               − Giảm trừ bồi thường
                               − Khấu hao vật tư/thay mới
                               − Khấu trừ bảo hiểm

Khách hàng thanh toán        = Cộng sau VAT (KH)
                               + Giảm trừ bồi thường
                               + Khấu hao vật tư/thay mới
                               + Khấu trừ bảo hiểm
                             (CK liên kết BH KHÔNG cộng sang KH — khoản giữa garage và BH)

Tổng thanh toán              = BH thanh toán + Khách hàng thanh toán

Còn phải thu BH              = BH thanh toán − Σ(các đợt BH đã thanh toán)

# Ví dụ: Cộng sau VAT BH 207.900.000 / KH 33.000.000; điều chỉnh −5.000.000 −2.500.000 +2.000.000 +200.000 +520.000
#   → BH thanh toán 197.680.000 + KH thanh toán 35.720.000 = Tổng 233.400.000
```

---

## §6 Service Impact Matrix

> Wave W02 — 3 features × 5 boundaries. Phase A (~2d): FEAT-INS-STL-CREATE + 4 CR. Phase B (~4d): FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW.

| Boundary | Role | FEATs touched (W02) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `gf-accounting` | **Lead boundary** | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | **MỚI**: `insurance_dossiers` + `insurance_dossier_documents` (ddl-auto=update, Phase B) | **MỚI** 4 endpoint: `POST render-pdf/acceptance-record`, `POST render-pdf/payment-authorization`, `POST /batch`, `POST /search` (Phase B). **Extend** existing `GET /settlements/{code}` trả thêm `insuranceAdjustment` block (Phase A). | — | Không có event mới; callback gf-sales tái dùng baseline (CB-INS-003) |
| `gf-sales` | Consumer / CR boundary | CR-20260612-02 (popup hoàn thành SO), FEAT-INS-STL-CREATE A3 (CR-20260616-01 SO print sub-scope) | Không thay đổi schema | Cung cấp `GET /api/v2/service-orders/{soId}/export-pdf?type=QUOTATION` (baseline) cho BFF Phase B render ①. Endpoint computed BH thanh toán phục vụ popup (reuse existing). **Extend SO print template** (common-printing render) bổ sung section "Phân bổ bảo hiểm" conditional theo `soHasInsurance` + print initiate từ gf-sales — CR-20260616-01. | — (server-side render template) | — |
| `agg-garage-graph` | BFF orchestrator | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | — | **MỚI** 2 ops (agg-garage-graph-graphql v7.7 #51-52): `exportInsuranceDossier` mutation (4-phase orchestrator) + `getInsuranceDossierVersions` query (passthrough). Phase A: extend query mở màn Tạo phiếu QT trả `insuranceAdjustment` block. | — | — |
| `garage-web` | UI consumer | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW, CR-20260612-01, CR-20260612-02, CR-20260616-02 | — | — | **Phase A**: gắn panel "Tổng giá dịch vụ" read-only trên màn Tạo phiếu QT (reuse component W01); panel per-payer trên chi tiết QT (CR-20260612-01); panel 2 cột SO (CR-20260616-02); cảnh báo popup hoàn thành SO (CR-20260612-02). **Phase B**: modal accordion dọc 4 tài liệu + `InsuranceDossierTab` + 3 component mới (`dossier-document-row`, `dossier-template-form`, `pdf-preview`). | — |
| `garage-mobile` | UI consumer | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW, CR-20260612-01, CR-20260612-02, CR-20260616-02 | — | — | **Phase A**: panel read-only màn Tạo phiếu QT (reuse panel W01); per-payer chi tiết QT; popup cảnh báo; panel 2 cột SO. **Phase B**: `InsuranceDossierScreen` (full-screen) + `DossierDocumentDetailScreen` + `DossierPreviewScreen` + tab "Hồ sơ đã xuất" thay placeholder W01. | — |

**Dependency arrows:**
- `garage-web` / `garage-mobile` → `agg-garage-graph` (GraphQL ops #51-52 + extended query).
- `agg-garage-graph` → `gf-accounting` (4 REST dossier endpoints + extended settlement GET).
- `agg-garage-graph` → `gf-sales` (export-pdf QUOTATION baseline — Phase B Phase B).
- `agg-garage-graph` → `ct-file-storage` (upload Phase C — external integration, không direct từ gf-accounting).
- `gf-accounting` → `gf-sales` (callback SO "đã quyết toán" baseline CB-INS-003, không thay đổi).
- **Hard gate Phase A → B**: panel per-payer + template in QT stable trên staging trước khi start Phase B.

---

## §7 Cross-boundary Contracts

> Nguồn: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` §1 Cross-boundary Rules.

| CB ID | Mô tả | REST/Kafka/Temporal touchpoint | Integration file |
|---|---|---|---|
| CB-INS-001 | Tenant isolation strict cho toàn bộ EP-INSURANCE-SETTLEMENT data (phiếu QT BH, hồ sơ BH, điều chỉnh BH trên SO) | Header `X-Tenant-Id` mandatory mọi request; TenantFilter gf-accounting + gf-sales + agg-garage-graph | NEED CONFIRMATION: verify `Architecture/integrations/INTEG-BFF-gf-accounting.md` có tenant section |
| CB-INS-002 | Khi tạo phiếu QT BH, gf-accounting gọi gf-sales lấy snapshot SO kèm Nguồn TT per dòng + 5 khoản điều chỉnh BH header. Snapshot immutable sau khi tạo. | `GET /api/v1/settlements/for-settlement/{soId}` (hoặc extend `GET /api/v2/service-orders/{id}`) — gf-sales → gf-accounting REST (internal service-to-service) | `Architecture/integrations/INTEG-BFF-gf-accounting.md` (confirm endpoint tên chính xác — NEED CONFIRMATION) |
| CB-INS-003 | Sau khi tạo phiếu QT BH thành công, gf-accounting callback gf-sales chuyển SO sang "đã quyết toán". Phiếu QT BH KHÔNG có huỷ → SO khoá vĩnh viễn. | `POST /protected/v1/service-orders/{id}/mark-settled` hoặc existing callback endpoint — gf-accounting → gf-sales REST | Baseline; verify `Architecture/integrations/INTEG-BFF-gf-accounting.md` |
| CB-INS-004 | Phiếu QT BH + phiếu QT KH tạo atomic (cùng transaction trong gf-accounting). `relatedSettlementId` liên kết. | Internal transaction gf-accounting — không cross-boundary | — |
| CB-INS-005 | Ghi nhận thanh toán BH tái sử dụng `RecordSettlementPayment` mutation baseline (FEAT-STL-DETAIL). Không logic mới. | Mutation `RecordSettlementPayment(code, amount, paymentMethod, paymentDate)` — agg-garage-graph → gf-accounting | Baseline; `Architecture/integrations/INTEG-BFF-gf-accounting.md` |
| CB-INS-006 | Danh sách công ty BH = system-seeded (gf-erp-mdm catalog `directory='INSURANCE'`). gf-sales đã lưu mã `insurance_company` VARCHAR baseline. gf-accounting lấy thông tin CTBH qua REST `for-settlement`. KHÔNG thêm cột mới `insurance_code`. | `GET /api/v1/catalog/directory/INSURANCE` — gf-erp-mdm → (các consumer). gf-accounting đọc qua REST gf-sales không trực tiếp gf-erp-mdm | NEED CONFIRMATION: confirm integration path CTBH từ gf-erp-mdm qua gf-sales tới gf-accounting |
| CB-INS-008 | Widget công nợ BH (gf-sales/Dashboard) lấy số liệu từ gf-accounting qua REST (không cross-DB). | `GET /protected/v1/insurance-debt-summary` — gf-accounting → gf-sales (DEFERRED — W03) | NEED CONFIRMATION: endpoint name final + `Architecture/integrations/` file cho INTEG-INS-DEBT-SUMMARY chưa tồn tại |
| CB-INS-009 | Object storage (ct-file-storage, không direct S3 trong gf-accounting) lưu PDF hồ sơ BH theo path `{tenant}/insurance-dossiers/{settlementId}/v{N}/{tên file}`. Cross-boundary access qua ct-file-storage URL. | BFF orchestrate upload: `POST /api/v1/files/upload-files` multipart `folderType="SETTLEMENTS"` → ct-file-storage. gf-accounting chỉ lưu `pdf_url` (object key). | NEED CONFIRMATION: `Architecture/integrations/INTEG-BFF-CT-FILE-STORAGE.md` có tồn tại không |
| CB-INS-010 | Mọi GraphQL ops BH đi qua agg-garage-graph → gf-accounting / gf-sales. Frontend không truy cập trực tiếp backend. | GraphQL ops #51-52 (agg-garage-graph-graphql v7.7) + existing ops — agg-garage-graph → gf-accounting/gf-sales REST | `Architecture/integrations/INTEG-BFF-gf-accounting.md` |

---

## §8 Implementation Sequence DAG

> Topological order: schema/entity producer trước → API trước → BFF wire → UI parallel cuối. Hard gate Phase A → B enforce giữa 2 phase.

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

## §9 Architecture References

- **ADR-016** (`Architecture/decisions/ADR-016-insurance-dossier-pdf-s3.md`) — PDF dossier storage; tái dùng `common-printing`, ct-file-storage; ddl-auto=update; immutable per version; 10 năm retention; KHÔNG signed URL TTL endpoint (supersede phiên bản trước).
- **ADR-015** (SO snapshot allocation contract) — contract đã ratified W01; gf-accounting đọc snapshot từ gf-sales.
- **ADR-009** (JPA no relationship mapping) — `insurance_dossiers` + `insurance_dossier_documents` chỉ dùng scalar FK, không `@ManyToOne`/`@OneToMany`.
- **ADR-004** (Outbox/inbox mandatory) — không áp dụng cho luồng này (gf-accounting không publish event BH mới; callback gf-sales là synchronous REST per baseline).
- **KG `gf-accounting`** (`Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml`) v6 — baseline APIs, entities; W02 sẽ extend (4 endpoints mới + 2 entities mới cần append).
- **agg-garage-graph-graphql v7.7** — ops #51-52 canonical (exportInsuranceDossier + getInsuranceDossierVersions).
- **`gf-accounting-api.md` v16** — 4 endpoint dossier canonical (§3bis.1-3bis.4).
- **PKG-W02** (`Execution/work-packages/PKG-W02-insurance-dossier.md`) — phase plan, entry criteria, DEV playbook.
- **BR-EP-INSURANCE-SETTLEMENT** v30 (`Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md`) — 11 CB rules + 67 domain rules + 17 validation rules.
- **`Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance}.html`** — 2 mockup template in QT (CR-20260616-01 target).
- **`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`** — fallback UX spec khi UX-FLOW dossier riêng chưa tồn tại.

---

## §10 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker for |
|---|---|---|---|
| NC-W02-EP-001 | Figma mobile link FEAT-INS-STL-CREATE chưa chốt (source EP v18: node `553-27738` đã thêm v19 nhưng PKG vẫn ghi NEED CONFIRMATION — confirm bản mobile W02 đã prefetch hay còn pending) | Business Authority + Mobile UX | Phase A garage-mobile UI |
| NC-W02-EP-002 | Endpoint name chính xác để gf-accounting lấy snapshot SO kèm fields BH (CB-INS-002): `GET /api/v2/service-orders/{id}` extend hay endpoint riêng `for-settlement`? | Architecture Authority | gf-accounting Phase B |
| NC-W02-EP-003 | Integration file `Architecture/integrations/INTEG-BFF-CT-FILE-STORAGE.md` có tồn tại không? Nếu chưa → cần tạo trước Phase B start (BFF upload orchestration) | Architecture Authority | agg-garage-graph Phase B |
| NC-W02-EP-004 | CB-INS-006: integration path lấy thông tin CTBH từ gf-erp-mdm → gf-sales → gf-accounting — confirm endpoint `for-settlement` đã include `insuranceCompanyName`/`insuranceCompanyCode` | Architecture Authority | gf-accounting Phase A/B |
| NC-W02-EP-005 | CB-INS-008 (DEFERRED W03): endpoint `/protected/v1/insurance-debt-summary` tên cuối + integration file `INTEG-INS-DEBT-SUMMARY` — resolve khi FEAT-INS-DASH-DEBT vào scope | Delivery Authority | W03 planning |
| NC-W02-EP-006 | PDF library Mobile decision: `pdfx` / `flutter_pdfview` / `syncfusion_flutter_pdfviewer` — Mobile Lead chốt license + perf | Mobile Lead | garage-mobile Phase B |
| NC-W02-EP-007 | Virus scan strategy chốt (ClamAV sidecar / Lambda S3 trigger / client-side) — Security concern trước ct-file-storage upload Phase C | Security / Platform | Phase B go-live gate |
| NC-W02-EP-008 | BR-INS-STL-DET-009 NEED CONFIRMATION còn mở: 2 khoản "CK liên kết BH" trên phiếu QT KH — hiển thị để tham chiếu hay ẩn hoàn toàn? (PKG §3.A ghi chốt "ẩn" 2026-06-16 nhưng BR vẫn có NEED CONFIRMATION — resolve trước CR-20260612-01 impl) | Business Authority | garage-web/mobile Phase A CR |

---

## §11 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INSURANCE-SETTLEMENT.md` v19 | BA source-of-truth |
| Business rules | `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` v30 | 11 CB rules + 67 domain rules + 17 validation |
| Work package | `Execution/work-packages/PKG-W02-insurance-dossier.md` v13 | Phase A/B plan, entry criteria, DEV playbook |
| KG gf-accounting | `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6 | Entity baseline, APIs baseline |
| ADR-016 | `Architecture/decisions/ADR-016-insurance-dossier-pdf-s3.md` | PDF storage architecture |
| ADR-015 | `Architecture/decisions/ADR-015-*.md` | SO snapshot allocation contract |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| GraphQL ops | `agg-garage-graph-graphql v7.7` | ops #51-52 canonical |
| API spec | `gf-accounting-api.md v16` | 4 dossier endpoints §3bis.1-3bis.4 |
| UX-FLOW | `Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md` | Fallback UX spec |
| Print mockup | `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance}.html` | CR-20260616-01 template đích |
| Wave sequence | `Plan/WAVE-SEQUENCE.md §1.2` | Hard gate A→B definition |
| Change requests | `Tracking/CHANGE-REQUESTS.md` | CR-20260612-01/02, CR-20260616-01/02 |
| FEAT-INS-STL-CREATE | `Product/features/FEAT-INS-STL-CREATE.md` | Phase A feature |
| FEAT-INS-DOSSIER-CREATE | `Product/features/FEAT-INS-DOSSIER-CREATE.md` | Phase B feature |
| FEAT-INS-DOSSIER-VIEW | `Product/features/FEAT-INS-DOSSIER-VIEW.md` | Phase B feature |

---

## §12 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W02 từ EP-INSURANCE-SETTLEMENT v19. §1-§5 verbatim copy. §6 Service Impact Matrix (3 FEAT × 5 boundary). §7 Cross-boundary contracts từ BR §1 (11 CB rules). §8 Implementation sequence DAG (Phase A → hard gate → Phase B). §9 Architecture references. §10 Open items (8 NC markers). |
| 2026-06-18 | 2 | Delivery Authority | v2 — §6 row `gf-sales` cập nhật: thêm "FEAT-INS-STL-CREATE A3 (CR-20260616-01 SO print sub-scope)" vào cột FEATs touched + cột API note extend SO print template (common-printing render) bổ sung section "Phân bổ bảo hiểm" conditional. Phát hiện gap sau /manifest-rebuild 02 gf-sales 0/0 — sync với BE tier FEAT-INS-STL-CREATE v3 + PKG §2.0 A3 line 54 (cột Boundary "gf-accounting + gf-sales (print)") + §4.1 line 300 (gf-sales DEV row "phần in từ SO nếu print khởi từ gf-sales"). |
