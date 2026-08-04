---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-INS-STL-CREATE.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-STL-CREATE"
source_feat_sha: "d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 4
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting", "gf-sales"]
modifies: ["FEAT-STL-CREATE"]
change_type: "brownfield-enhancement"
demo_signature: "Kế toán mở màn Tạo phiếu QT từ SO có Bảo hiểm → thấy panel 3 khối read-only → bấm Xác nhận → gf-accounting snapshot phân bổ vào cặp phiếu QT KH+BH thành công."
consumes_contracts: []
paired_bff_feats: ["FEAT-INS-STL-CREATE"]
paired_fe_web_feats: ["FEAT-INS-STL-CREATE"]
paired_mobile_feats: ["FEAT-INS-STL-CREATE"]
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "6b792ef863798bfeaf280cfcf512725585c8164268c876c44a1d185f44f44a0a"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-STL-CREATE.be.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-STL-CREATE (BE): Màn Tạo phiếu quyết toán — panel phân bổ bảo hiểm read-only

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-STL-CREATE` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 |
| Status | DRAFT |
| Demo signature | Kế toán mở màn Tạo phiếu QT từ SO có Bảo hiểm → panel 3 khối hiển thị read-only → xác nhận → snapshot phân bổ vào cặp phiếu QT atomic |
| Cross-tier pair | BFF: FEAT-INS-STL-CREATE \| Web: FEAT-INS-STL-CREATE \| Mobile: FEAT-INS-STL-CREATE |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-STL-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-STL-CREATE.md`](../../../../../Product/features/FEAT-INS-STL-CREATE.md) |
| Source version | v6 |
| Source SHA | `d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` |
| Generated at | 2026-06-18T01:05:38+00:00 |

---

## 1. Mục đích nghiệp vụ

Kế toán / chủ garage cần đối chiếu chính xác phần phân bổ bảo hiểm — bao gồm các khoản điều chỉnh và số tiền BH thực trả — ngay trên màn Tạo phiếu quyết toán trước khi chốt, thay vì phải mở lại Phiếu dịch vụ để tra cứu. Feature này mở rộng luồng `FEAT-STL-CREATE` production bằng cách hiển thị panel "Tổng giá dịch vụ" read-only (3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) snapshot từ SO, và đảm bảo số liệu BH thanh toán được tính server-side rồi snapshot vào cặp phiếu QT khi xác nhận — giảm sai sót và loại bỏ thao tác đối chiếu ngoài hệ thống.

---

## 2. Trách nhiệm backend (`gf-accounting`)

- **Extend API tạo settlement** (`POST /api/v1/service-orders/{id}/settlements`): tiếp nhận thêm block phân bổ BH trong request body khi SO có Bảo hiểm; validate và persist snapshot vào entity `SettlementRecord` (và `InsuranceSettlementRecord` nếu có entity riêng).
- **Expose API lấy dữ liệu panel** cho màn Tạo phiếu QT: trả về snapshot phân bổ BH (5 khoản điều chỉnh + bảng Chi tiết theo bên thanh toán + Cân thanh toán) được tính server-side từ SO hiện tại — BFF/FE/Mobile chỉ đọc, không tự tính lại.
- **Enforce BR-INS-STL-CRE-003** (primary SSOT): tính `insurancePayment` server-side theo công thức định nghĩa trong domain; KHÔNG nhận giá trị nhập tay từ client cho trường này khi payer là BH.
- **Enforce BR-INS-STL-CRE-001**: validate SO phải loại "Dịch vụ xe" và có ≥ 1 dòng Nguồn TT = `BH` trước khi sinh phiếu QT BH; nếu không có dòng BH → chỉ tạo phiếu QT KH (panel rút gọn).
- **Enforce BR-INS-STL-CRE-004**: tạo atomic cặp phiếu QT KH + BH trong một transaction; một phiếu lỗi → rollback cả hai.
- **Persistence**: `gf-accounting` dùng `ddl-auto=update` (không Flyway) — extend entity theo convention boundary; snapshot phân bổ bất biến sau khi tạo (immutable per CNF-INS-003).

---

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Tiền điều kiện & truy xuất dữ liệu panel

#### AC-1 → N/A (UI trigger — mở màn phía client)

Khi client điều hướng sang màn Tạo phiếu QT từ SO đã hoàn thành, BE không có hành động trực tiếp cho bước mở màn. Tuy nhiên BE phải sẵn sàng phục vụ request lấy dữ liệu panel ngay sau đó (xem AC-2). Xem `fe-web/FEAT-INS-STL-CREATE.md §3 AC-1` và `mobile/FEAT-INS-STL-CREATE.md §3 AC-1`.

#### AC-2 → Trả dữ liệu panel "Tổng giá dịch vụ" có điều kiện theo SO có Bảo hiểm

- **Khi**: BFF gọi endpoint lấy dữ liệu khởi tạo màn Tạo phiếu QT (hoặc endpoint hiện hữu `GET /api/v1/settlements/{code}` trong flow tạo mới — có thể là endpoint GET SO-settlement-preview mới).
- **BE phải**: kiểm tra SO có dòng Nguồn TT = `BH` hay không → nếu có, tính và trả về block phân bổ BH đầy đủ (5 khoản điều chỉnh + Chi tiết theo bên thanh toán 2 cột BH+KH + Cân thanh toán 3 dòng); nếu không có dòng BH → trả về block rút gọn (1 cột KH, 2 dòng Cân thanh toán).
- **Output**: response field `settlementPanel` (hoặc tương đương) với cờ `soHasInsurance: boolean` + sub-object `insuranceAllocation` (conditional).
- **Failure mode**: SO không tồn tại → `404 NOT_FOUND`; SO không hợp lệ để tạo QT → `422 UNPROCESSABLE_ENTITY` + error `ERR-STL-001`.
- **Ref**: BR-INS-STL-CRE-009 (§9), BR-INS-SO-ADJ-009, entity `SettlementRecord` + `ServiceOrder` projection (§5.1), endpoint `GET /api/v1/service-orders/{id}/settlement-preview` (§6.1)

### Cluster B — Hiển thị bảng phân bổ (server-side compute)

#### AC-3 → Cung cấp dữ liệu bảng "Chi tiết theo bên thanh toán" server-side

- **Khi**: BE trả response cho request preview màn Tạo phiếu QT (xem AC-2).
- **BE phải**: aggregate line items SO theo `payerSource` (BH / KH) → tính tổng tiền vật tư, tổng tiền công DV, tổng VAT theo từng bên; trả về cấu trúc 2-cột với cờ `soHasInsurance` để BFF/FE quyết định hiển thị 1 hay 2 cột.
- **Output**: `payerBreakdown: { insurance: { parts, services, vat, subtotal }, customer: { parts, services, vat, subtotal } }` trong `settlementPanel`.
- **Failure mode**: lỗi aggregate → `500 INTERNAL_SERVER_ERROR` + log trace.
- **Ref**: BR-INS-STL-CRE-009, entity `ServiceOrderLineItem` projection (§5.1), endpoint §6.1

#### AC-4 → Trả section "Phân bổ Bảo hiểm" 5 khoản khi SO có Bảo hiểm

- **Khi**: `soHasInsurance = true` trong request hoặc kết quả kiểm tra SO.
- **BE phải**: đọc 5 khoản điều chỉnh BH đã lưu trên SO (`insuranceAdjustment` — từ `gf-sales` projection hoặc cross-boundary read) → trả về 5 khoản: chiết khấu liên kết BH vật tư, chiết khấu liên kết BH công DV, giảm trừ bồi thường, khấu hao vật tư/thay mới, khấu trừ bảo hiểm — kèm `mode` (PERCENT/AMOUNT) và `computedValue`.
- **Output**: `insuranceAdjustments: [{ type, mode, inputValue, computedValue }]` (5 phần tử).
- **Failure mode**: SO chưa có điều chỉnh BH → trả mảng rỗng hoặc giá trị 0; KHÔNG block.
- **Ref**: BR-INS-SO-ADJ-002..005, BR-INS-STL-CRE-009 §(a), endpoint §6.1

#### AC-5 → Trả khối "Cân thanh toán" server-side (3 dòng khi có BH, 2 dòng khi không BH)

- **Khi**: BE tổng hợp preview settlement panel.
- **BE phải**: tính `insurancePayment` (BH thanh toán), `customerPayment` (KH chịu), `totalPayment` theo công thức server-side (BR-INS-STL-CRE-003); khi `soHasInsurance = true` → trả 3 dòng (BH + KH + Tổng); khi `false` → 2 dòng (KH + Tổng).
- **Output**: `balanceSummary: { insurancePayment?: number, customerPayment: number, totalPayment: number }`.
- **Failure mode**: công thức tính ra số âm → KHÔNG block (warn-and-allow per BR-INS-SO-ADJ-010); trả giá trị âm thực tế + cờ `insurancePaymentNegative: true` để BFF/FE hiển thị cảnh báo.
- **Ref**: BR-INS-STL-CRE-003, BR-INS-STL-CRE-009 §(a), endpoint §6.1

### Cluster C — Trường tính toán read-only

#### AC-6 → Enforce "Tổng tiền bảo hiểm trả" là computed, từ chối nhập tay

- **Khi**: request tạo settlement (`POST /api/v1/service-orders/{id}/settlements`) có trường `insuranceTotalAmount` trong body khi `payerType = INSURANCE`.
- **BE phải**: bỏ qua / ghi đè giá trị nhập tay; tính lại `insurancePayment` server-side theo công thức BR-INS-STL-CRE-003; persist giá trị tính được (không phải giá trị client gửi).
- **Output**: response `insuranceSettlement.insuranceTotalAmount` = giá trị computed (có thể khác input).
- **Failure mode**: nếu công thức thiếu dữ liệu SO → `422` + `ERR-INS-004 "Thiếu dữ liệu phân bổ bảo hiểm để tính toán"`.
- **Ref**: BR-INS-STL-CRE-003, CNF-INS-001 (RESOLVED), endpoint `POST /api/v1/service-orders/{id}/settlements` (§6.1)

### Cluster D — Xác nhận tạo & snapshot

#### AC-7 → Snapshot block phân bổ BH vào cặp phiếu QT khi xác nhận

- **Khi**: BFF gọi `POST /api/v1/service-orders/{id}/settlements` với `settlementType = CUSTOMER_AND_INSURANCE`.
- **BE phải**: trong cùng một DB transaction — (a) persist `SettlementRecord` loại `CUSTOMER` + `SettlementRecord` loại `INSURANCE`; (b) snapshot toàn bộ phân bổ BH vào cả hai record: line items BH, 5 khoản điều chỉnh, thông tin DN BH (tên), số hợp đồng, người giám định, SĐT, bảng Chi tiết theo bên thanh toán (Cộng sau VAT + BH thanh toán/KH chịu); (c) liên kết hai chiều qua `relatedSettlementId` (BR-INS-STL-CRE-007); (d) snapshot bất biến — sau khi tạo KHÔNG cập nhật từ SO (CNF-INS-003).
- **Output**: response `{ customerSettlement: SettlementResponse, insuranceSettlement: SettlementResponse }` với `insuranceAllocationSnapshot` populated.
- **Failure mode**: một trong hai phiếu lỗi persist → rollback toàn bộ (BR-INS-STL-CRE-004); trả `409 CONFLICT` nếu đã tồn tại phiếu QT cho SO này.
- **Ref**: BR-INS-STL-CRE-002, BR-INS-STL-CRE-004, BR-INS-STL-CRE-007, endpoint §6.2

### Cluster E — Phân quyền

#### AC-8 → Phân quyền giữ nguyên baseline FEAT-STL-CREATE

- **Khi**: mọi endpoint liên quan đến FEAT-INS-STL-CREATE.
- **BE phải**: áp dụng cùng RBAC check như baseline `FEAT-STL-CREATE` — chỉ `accountant` hoặc `garage-owner` (Critical Rule #6) mới được tạo/xem phiếu QT; tenant isolation enforce qua `TenantFilter` + `X-Tenant-Id` (Critical Rule #4).
- **Output**: unauthorized → `403 FORBIDDEN`; unauthenticated → `401 UNAUTHORIZED`.
- **Failure mode**: missing tenant header → `400 BAD_REQUEST` + `ERR-AUTH-001`.
- **Ref**: ADR-009, Critical Rule #4, #6, endpoint §6.1

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-INS-STL-CRE-001** (CORNERSTONE): chỉ tạo phiếu QT BH từ SO loại "Dịch vụ xe" có ≥ 1 dòng `payerSource = BH`; SO bán phụ tùng không được → enforce tại `app/service/SettlementService.java::validateInsuranceEligibility()`. Vi phạm → `ERR-STL-002` + HTTP 422.
- **BR-INS-STL-CRE-002** (CORNERSTONE): snapshot phân bổ BH tại thời điểm tạo — immutable sau đó; enforce tại `app/service/SettlementService.java::snapshotInsuranceAllocation()`. Vi phạm (sửa snapshot sau tạo) → không expose API update cho block này.
- **BR-INS-STL-CRE-003** (CORNERSTONE): `insurancePayment` tính server-side, không nhận giá trị tay từ client; enforce tại `domain/model/SettlementRecord.java` + `app/service/InsuranceAllocationCalculator.java`. Vi phạm → override input silently + log warning.
- **BR-INS-STL-CRE-004** (CORNERSTONE): tạo cặp KH+BH atomic; enforce tại `app/service/SettlementService.java` với `@Transactional`; một phiếu lỗi → rollback cả hai → `ERR-STL-003` + HTTP 409/500.
- **BR-INS-STL-CRE-009** (NORMAL): conditional display logic (có/không BH) được server encode qua cờ `soHasInsurance`; BE trả đúng cấu trúc data theo điều kiện này.
- **CNF-INS-001** (RESOLVED): `insurancePayment` của phiếu QT BH = computed read-only; baseline `BR-STL-CRE-005` (nhập tay) chỉ còn áp dụng cho phiếu QT KH.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` trong event header phải match `data.tenantId` (Critical Rule #4).
- Chỉ persona `accountant` và `garage-owner` được phép tạo / xem settlement (Critical Rule #6 dual persona only).
- Endpoint protected: `POST /api/v1/service-orders/{id}/settlements` — JWT auth; `GET /api/v1/service-orders/{id}/settlement-preview` — JWT auth.

### 4.3 Idempotency + concurrency

- `POST /api/v1/service-orders/{id}/settlements`: kiểm tra unique constraint `(service_order_id, payer_type, tenant_id)` trên `settlement_records`; duplicate → `409 CONFLICT` + `ERR-STL-004 "Phiếu quyết toán đã tồn tại cho Phiếu dịch vụ này"`.
- Snapshot phân bổ bất biến sau khi tạo: KHÔNG có endpoint update `insuranceAllocationSnapshot`.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-STL-001` | 422 | AC-2 | TOAST — "SO không hợp lệ để tạo phiếu quyết toán" |
| `ERR-STL-002` | 422 | AC-1, AC-8 (validate) | TOAST — "Phiếu dịch vụ phải loại Dịch vụ xe và có dòng Bảo hiểm" |
| `ERR-STL-003` | 409/500 | AC-7 | TOAST — "Không thể tạo cặp phiếu quyết toán, vui lòng thử lại" |
| `ERR-STL-004` | 409 | AC-7 | TOAST — "Phiếu quyết toán đã tồn tại cho Phiếu dịch vụ này" |
| `ERR-INS-004` | 422 | AC-6 | TOAST — "Thiếu dữ liệu phân bổ bảo hiểm để tính toán" |
| `ERR-AUTH-001` | 400 | AC-8 | TOAST — "Thiếu thông tin tenant" |

---

## 5. Schema delta (BE — contract focus)

> `gf-accounting` dùng `ddl-auto=update` — KHÔNG dùng Flyway. Entity extend bằng cách thêm field vào class JPA; schema tự cập nhật khi deploy.

### 5.1 Entity changes — `gf-accounting`

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `settlement_records` | `insurance_allocation_snapshot` | `JSONB` | Y | `null` | ddl-auto=update | BR-INS-STL-CRE-002 | AC-7 | Snapshot toàn bộ phân bổ BH tại thời điểm tạo phiếu QT BH; null nếu `payer_type = CUSTOMER` và SO không có BH |
| `settlement_records` | `insurance_payment_computed` | `NUMERIC(15,2)` | Y | `null` | ddl-auto=update | BR-INS-STL-CRE-003 | AC-6 | Giá trị `insurancePayment` tính server-side; bất biến sau khi persist |
| `settlement_records` | `so_has_insurance` | `BOOLEAN` | N | `false` | ddl-auto=update | BR-INS-STL-CRE-009 | AC-2 | Cờ đánh dấu SO gốc có dòng BH — dùng cho BFF/FE quyết định hiển thị panel mode |
| `settlement_records` | `payer_breakdown_snapshot` | `JSONB` | Y | `null` | ddl-auto=update | BR-INS-STL-CRE-002 | AC-3, AC-5, AC-7 | Snapshot bảng Chi tiết theo bên thanh toán (BH cột + KH cột) + Cân thanh toán |

> **ADR-009 compliance**: KHÔNG dùng `@ManyToOne`/`@OneToMany` trong entity. Quan hệ với `ServiceOrder` biểu diễn qua scalar `service_order_id` (đã có baseline).

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `settlement_records` | `uq_settlement_so_payer_tenant` | `(service_order_id, payer_type, tenant_id)` | UNIQUE | Prevent duplicate settlement per SO per payer per tenant (idempotency AC-7) | ADR-009 |

---

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| GET | `/api/v1/service-orders/{serviceOrderId}/settlement-preview` | JWT (`X-Tenant-Id`) | — | `SettlementPreviewResponse { soHasInsurance, payerBreakdown, insuranceAdjustments, balanceSummary }` | safe (read) | AC-2, AC-3, AC-4, AC-5, AC-6 | — |

> Endpoint này phục vụ màn Tạo phiếu QT — BFF gọi khi user mở màn; trả snapshot phân bổ BH hiện tại từ SO (không phải settlement đã tạo). BFF wrap thành GraphQL query `settlementPreview(serviceOrderId)`.

### 6.2 Modified REST endpoints (additive) — `gf-accounting`

| Method | Path | Change | Backward-compat? | AC ref |
|---|---|---|---|---|
| POST | `/api/v1/service-orders/{id}/settlements` | Additive request fields: `insuranceAllocationInput { adjustments[5], payerBreakdown }` (optional — ignored nếu SO không có BH); server tính lại `insurancePayment` từ SO data (không dùng client-supplied value) | Pha có, optional fields (null-safe) | AC-6, AC-7 |

> Baseline endpoint `POST /api/v1/service-orders/{id}/settlements` (KG: `create-settlements`) giữ nguyên contract; chỉ thêm optional block. BFF truyền thêm block khi `soHasInsurance = true`.

### 6.3 Kafka topics

Không có Kafka event mới cho FEAT-INS-STL-CREATE. Việc tạo settlement đã có sẵn ở baseline và không phát sinh event mới ở slice A1 này.

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /api/v1/service-orders/{id}/settlement-preview` | `agg-garage-graph` (BFF) | Khi mở màn Tạo phiếu QT | BFF trả error → FE hiển thị TOAST | sync, fail fast (no retry) |
| `POST /api/v1/service-orders/{id}/settlements` | `agg-garage-graph` (BFF) | Khi xác nhận Tạo phiếu QT | Rollback cả cặp → BFF trả error → FE TOAST | sync, fail fast |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-INS-STL-CREATE.md`) sẽ wrap `GET /settlement-preview` → GraphQL query và `POST /settlements` → GraphQL mutation. KHÔNG describe GraphQL tại đây.

### 6.5 Cross-boundary print scope — `gf-sales` (A3 CR-20260616-01)

Per PKG-W02 §2.0 A3 (cột Boundary = `gf-accounting + gf-sales (print)`) và §4.1 DEV row `agent-dev-gf-sales` Phase A: `gf-sales` có sub-scope SO print template extension.

| Aspect | Nội dung |
|---|---|
| Owner boundary | `gf-sales` (parallel với gf-accounting QT print) |
| CR ref | CR-20260616-01 (đã APPROVED) |
| Scope | Template **in từ phiếu dịch vụ (SO)** trên `gf-sales` — bổ sung section "Phân bổ bảo hiểm" tương đương bản in QT |
| Condition | NẾU print initiate từ gf-sales UI (SO detail/print action) **VÀ** SO có Bảo hiểm (`soHasInsurance == true`) |
| Data source | Reuse cùng snapshot phân bổ BH server-side (BR-INS-STL-CRE-003) — KHÔNG tự tính lại logic mới |
| Mockup ref | `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance}.html` (cùng mockup QT print — wording tương đương cho SO context) |
| BE impact | Extend print rendering ở common-printing module phía `gf-sales`; **KHÔNG** modify gf-sales entity / migration / schema |
| Cross-boundary contract | gf-sales đọc `insuranceAllocationSnapshot` qua existing READ path (REST hoặc projection, theo baseline gf-sales architecture). KHÔNG endpoint mới ở gf-accounting cho mục đích này. |
| Out of scope (spec này) | Implementation chi tiết template engine của gf-sales — thuộc `agent-dev-gf-sales` ở stage DEV (per PKG §4.1 effort assignment). Spec gf-sales code-level sẽ tham chiếu mockup + BR-INS-STL-CRE-003 + soHasInsurance flag. |

> **Note**: Sub-scope này conditional (per "nếu print khởi từ gf-sales" — PKG §4.1 line 300). Nếu user flow W02 không trigger SO print initiate từ gf-sales → effort gf-sales A3 ≈ 0; nhưng template logic vẫn phải sẵn sàng cho future flow.

---

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-accounting/**` (Critical Rule #1). Cross-boundary touch chỉ qua §6 REST.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/SettlementRecord.java` | MODIFY | extend (+4 fields: `insuranceAllocationSnapshot`, `insurancePaymentComputed`, `soHasInsurance`, `payerBreakdownSnapshot`) | ~30 | AC-2, AC-6, AC-7 |
| `domain/model` | `src/main/java/.../domain/model/InsuranceAllocationSnapshot.java` | NEW | value object (embed trong JSONB) | ~60 | AC-7 |
| `domain/model` | `src/main/java/.../domain/model/SettlementPreview.java` | NEW | read model / projection | ~50 | AC-2..AC-6 |
| `app/service` | `src/main/java/.../app/service/SettlementService.java` | MODIFY | extend: `generatePreview()`, `snapshotInsuranceAllocation()`, `computeInsurancePayment()` | ~120 | AC-2..AC-7 |
| `app/service` | `src/main/java/.../app/service/InsuranceAllocationCalculator.java` | NEW | extractor: công thức BR-INS-STL-CRE-003 | ~80 | AC-5, AC-6 |
| `adapter/controller` | `src/main/java/.../adapter/controller/SettlementController.java` | MODIFY | thêm endpoint `GET /{serviceOrderId}/settlement-preview` | ~30 | AC-2..AC-6 |
| `app/dto` | `src/main/java/.../app/dto/SettlementPreviewResponse.java` | NEW | DTO response | ~60 | AC-2..AC-6 |
| `app/dto` | `src/main/java/.../app/dto/CreateSettlementRequest.java` | MODIFY | additive: `insuranceAllocationInput` optional field | ~20 | AC-7 |
| `test/unit` | `src/test/java/.../app/service/SettlementServiceTest.java` | ADDITIVE | test cases: preview generation, compute override, atomic rollback | ~200 | AC-2..AC-8 |
| `test/unit` | `src/test/java/.../app/service/InsuranceAllocationCalculatorTest.java` | NEW | unit: công thức per BR-INS-STL-CRE-003, edge case âm | ~120 | AC-5, AC-6 |
| `test/contract` | `src/test/java/.../adapter/controller/SettlementContractTest.java` | ADDITIVE | thêm contract test cho endpoint `/settlement-preview` + modified POST | ~100 | AC-2, AC-7 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Entity extend + value objects
    Entry: KG.entities stable (gf-accounting v6)
    Action: Thêm 4 fields vào SettlementRecord; tạo InsuranceAllocationSnapshot VO; tạo SettlementPreview read model
    Exit: ddl-auto=update test local pass; entity compile
    └─► S2

S2  Service logic + calculator
    Entry: S1
    Action: InsuranceAllocationCalculator (công thức BR-INS-STL-CRE-003); extend SettlementService::generatePreview(), snapshotInsuranceAllocation(), computeInsurancePayment(); enforce BR-001..004
    Exit: unit test ≥10 green (calculator + service); edge case âm pass
    └─► S3

S3  REST adapter (controller + DTO)
    Entry: S2
    Action: Thêm GET /settlement-preview endpoint; extend CreateSettlementRequest DTO (additive); extend SettlementController
    Exit: contract test green (preview + modified POST); Postman collection pass
    └─► S4

S4  Integration test
    Entry: S3 + gf-sales SO data stable (cross-boundary read via REST nếu cần SO adjustment data)
    Action: Test tạo cặp QT atomic; test rollback khi 1 phiếu lỗi; test idempotency (duplicate → 409)
    Exit: integ test green; 409 edge case verified
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Entity extend + value object | domain/model | KG stable | Entity compile, local schema update | — |
| S2 | Service logic + BR enforce | domain + app/service | S1 | Unit test ≥10 green | S1 |
| S3 | REST adapter + DTO | adapter/controller + app/dto | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green, idempotency verified | S3 |

---

## 9. Business Rules to enforce (BE — SSOT)

> BE là primary SSOT cho BR enforcement. BFF/FE/Mobile chỉ secondary (UX hint).

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-INS-STL-CRE-001` | CORNERSTONE | app/service (primary) | `app/service/SettlementService.java::validateInsuranceEligibility()` | AC-1, AC-8 | `TC-BR-accounting-CRE001-*` |
| `BR-INS-STL-CRE-002` | CORNERSTONE | app/service (primary) | `app/service/SettlementService.java::snapshotInsuranceAllocation()` | AC-7 | `TC-BR-accounting-CRE002-*` |
| `BR-INS-STL-CRE-003` | CORNERSTONE | domain + app/service (primary) | `app/service/InsuranceAllocationCalculator.java` + `domain/model/SettlementRecord.java` | AC-5, AC-6 | `TC-BR-accounting-CRE003-*` |
| `BR-INS-STL-CRE-004` | CORNERSTONE | app/service (primary) via `@Transactional` | `app/service/SettlementService.java::createSettlementPair()` | AC-7 | `TC-BR-accounting-CRE004-*` |
| `BR-INS-STL-CRE-007` | NORMAL | app/service | `app/service/SettlementService.java::linkSettlementPair()` | AC-7 | `TC-BR-accounting-CRE007-*` |
| `BR-INS-STL-CRE-009` | NORMAL | app/service (primary) | `app/service/SettlementService.java::generatePreview()` | AC-2, AC-3, AC-4, AC-5 | `TC-BR-accounting-CRE009-*` |
| `CNF-INS-001` | RESOLVED | app/service — override input | `InsuranceAllocationCalculator` (compute) + `SettlementService` (ignore client value) | AC-6 | `TC-BR-accounting-CNF001-*` |

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | N/A (UI trigger) | — | Không có BE test cho mở màn; validate SO eligibility là pre-condition của AC-2/AC-7 |
| AC-2 | API contract + Unit | test-api | GET `/settlement-preview` — SO có BH (3 khối) vs không BH (rút gọn); `soHasInsurance` flag |
| AC-3 | Unit (aggregate) + API contract | test-api | `payerBreakdown` tính đúng theo `payerSource`; 2 cột BH+KH |
| AC-4 | Unit (conditional) + API contract | test-api | `insuranceAdjustments` 5 khoản khi `soHasInsurance=true`; mảng rỗng khi không có |
| AC-5 | Unit (calc) + API contract | test-api | `balanceSummary` — 3 dòng vs 2 dòng; edge case âm (insurancePaymentNegative flag) |
| AC-6 | Unit (override) + Integration | test-api | Input tay bị ghi đè bởi computed; `TC-BR-accounting-CRE003-*` |
| AC-7 | Integration (atomic) | test-api | Tạo cặp KH+BH — snapshot populated; rollback khi 1 phiếu lỗi; duplicate 409 |
| AC-8 | Isolation (RBAC) | test-isolation | `accountant` + `garage-owner` pass; invalid role → 403; missing tenant → 400 |

---

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-STL-CREATE.md` | DRAFT (pending) | BFF wrap `GET /settlement-preview` → GraphQL query `settlementPreview`; wrap `POST /settlements` → mutation `createSettlement` (additive). BFF KHÔNG tự tính công thức — chỉ pass-through data từ BE. |
| FE Web | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-STL-CREATE.md` | DRAFT (pending) | FE consume GraphQL query `settlementPreview` để render panel 3 khối read-only; consume mutation `createSettlement` khi xác nhận. |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-STL-CREATE.md` | DRAFT (pending) | Mobile consume cùng BFF ops; render panel theo `soHasInsurance` flag. |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd`.

---

## 12. References

- **Source**: [`Product/features/FEAT-INS-STL-CREATE.md`](../../../../../Product/features/FEAT-INS-STL-CREATE.md) v6
- **Parent EP**: `EP-INSURANCE-SETTLEMENT`
- **BR refs**: `BR-EP-INSURANCE-SETTLEMENT.md`, `Product/business-rules/BR-INS-STL-CREATE.md`
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md)
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md)
- **Integration**: [`Architecture/integrations/INTEG-BFF-gf-accounting.md`](../../../../../Architecture/integrations/INTEG-BFF-gf-accounting.md)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6
- **PKG**: [`PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md)
- **ADR-009**: JPA no relationship mapping — scalar FK only
- **ADR-015**: gf-sales → gf-accounting REST đồng bộ (debt summary); pattern reuse cho preview call
- **ADR-016**: PDF + BFF orchestrator pattern (Phase B context)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **CNF-INS-001** (RESOLVED): insurancePayment computed overrides baseline BR-STL-CRE-005

---

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260612-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260612-02--ins-so-complete-popup-negative-bh-warn) | Popup hoàn thành SO cảnh báo Tổng BH âm | APPROVED | BE compute + expose `insurancePaymentNegative` flag |
| [CR-20260616-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column) | Panel "Tổng giá dịch vụ" 2 cột (BH \| KH) | APPROVED | Response per-payer field cho từng khoản phân bổ |
| [CR-20260618-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all) | Sinh phiếu QT KH khi BH 100% + KH chịu phân bổ | APPROVED | Logic sinh phiếu QT KH khi BH 100% + KH còn phân bổ > 0 |

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-INS-STL-CREATE` W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map per 8 AC-IDs, §4 ràng buộc + error code, §5-§11 BE-specific (entity ddl-auto extend / REST preview endpoint / Hexagonal file map / sequence DAG S1-S4 / BR CORNERSTONE primary / test hand-off / cross-tier pair). Source FEAT chỉ audit. gf-accounting ddl-auto=update (không Flyway). |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | v2 — retry slot 1/2: sync §1 byte-equal canonical wording per reviewer item #18c FAIL. |
| 2026-06-18 | 3 | Delivery Authority | v3 — Reflect A3 CR-20260616-01 gf-sales sub-scope (SO print template) sau /manifest-rebuild 02 gf-sales 0/0 phát hiện gap. (a) Frontmatter `boundaries_affected` thêm `gf-sales`; (b) §6.5 mới mô tả cross-boundary print scope gf-sales conditional theo `soHasInsurance` + print initiate từ gf-sales (per PKG §2.0 A3 line 54 cột Boundary + §4.1 line 300 DEV row). KHÔNG đụng code, KHÔNG thêm endpoint mới; chỉ document cross-boundary intent. |
| 2026-06-22 | 4 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 3 CR liên quan tier BE: CR-20260612-02, CR-20260616-02, CR-20260618-01. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
