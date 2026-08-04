---
type: execution
artifact_kind: work-package
status: PLANNED
version: 18
tier: T4
owner_authority: Delivery Authority
wave: "W01"
last_reviewed: "2026-06-07"
---

# PKG-W01 — Insurance Foundation

> Work package cho Wave 1 của EP-INSURANCE-SETTLEMENT: deliver 2 feature foundation FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL.
> Created tại PLANNING stage; sẽ update Actuals (§9) tại end-of-wave.

---

## 1. Overview

| Field | Value |
|---|---|
| Wave | W01 |
| Title | Insurance Foundation — SO Allocation + Phiếu QT BH Detail |
| Duration target | 5 ngày (~32h work — gf-sales ~7h + gf-accounting ~7h + agg-garage-graph ~5h + garage-web ~6h + garage-mobile ~7h; 5 dev parallel) |
| Phase | Feature delivery — EP-INSURANCE-SETTLEMENT slice 1/3 |
| Features | FEAT-INS-SO-ADJUSTMENT (gf-sales) + FEAT-INS-STL-DETAIL (gf-accounting) |
| Epics | EP-INSURANCE-SETTLEMENT |
| Boundaries affected | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` |
| Lead boundary | `gf-accounting` (settlement-master: pull snapshot + phiếu QT BH detail — anchor cho W02 dossier) |

---

## 2. Scope

### 2.1 Business Goal

Cho phép kế toán **(a)** nhập 5 khoản điều chỉnh bảo hiểm trên SO Edit/Detail (section "Phân bổ quyết toán bảo hiểm") sau khi DN BH đã duyệt + đưa thông tin phân bổ, và **(b)** xem chi tiết phiếu quyết toán bảo hiểm với panel "Tổng giá dịch vụ" đầy đủ phân bổ + lịch sử thanh toán. Đặt **foundation snapshot allocation** — gf-accounting **pull đồng bộ** snapshot (Nguồn TT + 8 scalar adjustment fields + 8 scalar breakdown fields) từ gf-sales qua REST `for-settlement` tại thời điểm tạo phiếu QT BH (CB-INS-002, ADR-014) — làm nền cho W02 dossier auto-render Phiếu báo giá + dashboard aggregate KPIs (FEAT-INS-DASH-DEBT, backlog ngoài 2 wave).

### 2.2 Technical Scope

**gf-sales** (FEAT-INS-SO-ADJUSTMENT — header level + payload):
- Extends `service_order` thêm 8 scalar adjustment columns (BR-EP §7.1: `discount_material_mode/value`, `discount_labor_mode/value`, `depreciation_default_percent`, `claim_reduction_mode/value`, `insurance_deductible_amount`). Cột `insurance_company` (VARCHAR baseline, đã lưu mã CTBH v.d. `INS_BSH`) — **KHÔNG thêm cột mới** `insurance_code`. Khấu hao vật tư % per dòng phụ tùng — extends `service_order_part` thêm `depreciation_percent` (NUMERIC(5,2), NULLABLE — chỉ phụ tùng BH, **KHÔNG** trên `service_order_item`/công DV, BR-INS-SO-ADJ-005).
- Schema sinh qua `ddl-auto=update` — entity thêm field tự sync DB. **KHÔNG cần Flyway migration**.
- Logic tính **inline trong SO service hiện hữu** (KHÔNG tách class riêng):
  - `breakdown_total_after_vat_insurance` = Σ (dịch vụ BH + phụ tùng BH + thuế các dòng BH)
  - `breakdown_total_after_vat_customer` = Σ (dịch vụ KH + phụ tùng KH + thuế các dòng KH)
  - `insurancePayable` = totalAfterVat.bh − CK liên kết VT − CK liên kết CDV − Giảm trừ bồi thường − Khấu hao vật tư − Khấu trừ BH
  - `customerPayable` = totalAfterVat.kh + Giảm trừ bồi thường + Khấu hao vật tư + Khấu trừ BH (CK liên kết KHÔNG cộng sang KH)
  - Unit test ≥ 8 case (5 case AC + 2 boundary + 1 ví dụ epic §5). **2 boundary = single-payer (BR-EP CALC-INS-006): (a) PDV toàn BH (0 dòng KH) → `customerPayable` = Σ khoản chuyển (giảm trừ + khấu hao + khấu trừ), `breakdownTotalAfterVatCustomer`=0 (không null); (b) PDV toàn KH (0 dòng BH) → tạo phiếu QT BH bị reject (VLD-INS-STL-001). Engine KHÔNG bỏ qua nhánh tính KH khi nhóm rỗng.**
  - **Validation (BR-EP §5.1)**: VLD-INS-SO-003 (% ∈ [0,100], reject `<0`/`>100`), VLD-INS-SO-004 (số tiền ≥0, ≤ cơ sở; 0 hợp lệ), **VLD-INS-SO-006 (mode ∈ {PERCENT,AMOUNT} server-side → `400 INVALID_ALLOCATION_MODE`)**. Unit/contract test thêm: reject số âm + reject mode sai (400).
- Snapshot provider (đồng bộ): extend `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement` (additive) trả 8 scalar breakdown fields + 8 scalar adjustment fields để gf-accounting **pull** tại thời điểm tạo phiếu QT BH (CB-INS-002, ADR-014). Thông tin CTBH đã có trong `insurance_company` baseline — **KHÔNG** thêm field mới `insuranceCode`. Callback `settle` / `reopen-from-settled` (CB-INS-003) tái dùng endpoint baseline — không thêm endpoint mới phía gf-sales.

**gf-accounting** (FEAT-INS-STL-DETAIL):
- Mở rộng aggregate `settlement_records` (settlement_type=INSURANCE) — **tái dùng pair model + code-gen + printing** (ADR-014), thêm cột additive: `insurance_policy_no`, 8 scalar adjustment columns (snapshot), 8 scalar breakdown columns (`breakdown_service_insurance/customer`, `breakdown_parts_insurance/customer`, `breakdown_vat_insurance/customer`, `breakdown_total_after_vat_insurance/customer`), `insurance_payable_amount` (NUMERIC — **nhận từ request, KHÔNG tự tính**, BR-GF-ACCOUNTING-006). **KHÔNG** thêm `insurance_code` / `insurance_company_name` — gf-accounting lấy thông tin CTBH qua REST `for-settlement` từ gf-sales (đã có `insurance_company` baseline).
- Schema entity-driven (ddl-auto=update) — KHÔNG Flyway. scalar typed columns.
- **Tạo phiếu QT BH** — **REUSE** `POST /api/v1/service-orders/{id}/settlements` (đã hỗ trợ cặp CUSTOMER+INSURANCE), request **additive** 8 scalar adjustment fields + 8 scalar breakdown fields + `insurancePayableAmount` (gf-accounting-api §3bis.0). Luồng: gf-accounting **pull** `GET …/for-settlement` từ gf-sales (snapshot Nguồn TT + 8 adjustment fields) → persist **cặp settlement CUSTOMER+INSURANCE atomic** qua `related_settlement_code` (CB-INS-004) → REST `settle` callback gf-sales (CB-INS-003). **Rollback nếu bất kỳ bước nào fail** — synchronous, KHÔNG saga/Temporal (ADR-014).
- **Chi tiết phiếu QT BH** — **REUSE** `GET /api/v1/settlements/{code}` (gf-accounting-api §3bis "tái dùng", #2), response **additive** block `insurance` + `debtPanel` — **KHÔNG** endpoint mới. Response shape:
  - header (mã phiếu, ngày tạo, trạng thái, action buttons)
  - thông tin quyết toán + khối thông tin KH/xe
  - 4 tab: Chi phí (line items + panel Tổng giá dịch vụ), Hồ sơ BH (placeholder cho W02), Chứng từ (placeholder), Lịch sử thanh toán (reuse FEAT-STL-DETAIL baseline data)

**agg-garage-graph** (BFF orchestration):
- GraphQL types: `InsuranceAllocation` (flat scalar fields), `InsuranceAllocationMode (PERCENT|AMOUNT)`, `InsuranceSettlement`, `InsuranceSettlementCostTab`, `InsuranceSettlementHeader`.
- Mutation **mới (1)**: `createInsuranceSettlement(id: Int!, input: CreateInsuranceSettlementRequest!)` (agg #44 → gf-accounting `POST /api/v1/service-orders/{id}/settlements` với pull snapshot — **KHÔNG** push from SO).
- **Additive trên op hiện hữu (KHÔNG op mới)**: lưu allocation = additive input trên `updateServiceOrderV3` (→ gf-sales `PUT /api/v3/service-orders/{id}`); đọc SO allocation = `getServiceOrderByCode` (additive); chi tiết phiếu QT BH = `getSettlementByCode` (additive block `insurance` — → gf-accounting `GET /api/v1/settlements/{code}`).
- DataLoader cho `InsuranceSettlement → ServiceOrder → LineItems` để tránh N+1.
- Auth header propagation (X-Tenant-Id, X-Branch-Id, Authorization) downstream.

**garage-web** (UI — feature trên design system hiện hữu):

- `<InsuranceAllocationSection>` render trên **SO Edit page** + SO Detail page — **NOT** trên SO Create page (AC-0; xem open-item Risk §8 về mockup create có toggle BH). Toggle "Bảo hiểm = Có" + chọn DN BH/HĐ/SĐT giám định hiển thị ở Create; chỉ panel 5 khoản phân bổ giới hạn Edit/Detail.
  - ⚠ **Figma coverage**: chỉ màn **Edit** đã có Figma DEV spec đầy đủ (`Product/ux/figma-web/wave01-ins-so-adjustment.md` — node `13257:469505`, 3 state: panel nhập "Phân bổ quyết toán bảo hiểm" + panel read-only "Tổng giá dịch vụ"). Màn **Detail** (hiển thị read-only 5 khoản + panel "Tổng giá dịch vụ") **CHƯA có Figma — sẽ bổ sung sau**. ⇒ DEV implement màn **Edit trước** (đủ spec); màn **Detail render read-only theo FEAT + UX-FLOW** và **gate phần visual Detail** tới khi có Figma (xem §2.4 Bước 3 + INTEG-FE §3.4b).
- 3 toggle %/số tiền (CK liên kết VT, CK liên kết CDV, Giảm trừ bồi thường); input số Khấu trừ BH; input % per dòng phụ tùng Khấu hao. Realtime preview "BH thanh toán" + "KH thanh toán" + "Tổng thanh toán".
- `<InsuranceSettlementDetailPage>` (page route) 4 tab (Chi phí + panel "Tổng giá dịch vụ" / Hồ sơ BH placeholder W02 / Chứng từ placeholder / Lịch sử thanh toán) + header + thông tin quyết toán + panel "Tổng giá dịch vụ" hiển thị phân bổ.
- Nút "+ Tạo hồ sơ bảo hiểm" hiển thị nhưng **disabled** với tooltip "Sẽ available ở W02" (feature flag toggle).
- Tạo/sửa SO + tạo phiếu QT giữ luồng trang (create/edit page) hiện hữu. Wire GraphQL/form/behavior theo `INTEG-FE-garage-web-agg-garage-graph.md §3.4b`.

**garage-mobile** (Flutter):
- `InsuranceAllocationSection` (inline Card trong ListView — **KHÔNG** phải bottom sheet; tên cũ "InsuranceAllocationBottomSheet" trong WP là sai, Figma `397:23265` vẽ section inline) — nhúng vào màn SO Edit + SO Detail, KHÔNG ở SO Create (AC-0). Xem DEV NOTE wiring dưới §2.2.
- BLoC `InsuranceAllocationCubit` quản lý state 5 trường + realtime preview BH thanh toán / KH thanh toán / Tổng.
- UI: toggle "%" / "Số tiền" qua `SegmentedButton` cho 3 trường (CK liên kết VT, CK liên kết CDV, Giảm trừ bồi thường); `TextField` (keyboard number) cho Khấu trừ BH; `TextField` % per dòng phụ tùng cho Khấu hao (trong list line item).
- Validation: % range 0-100, số tiền non-negative — hiển thị error inline.
- `InsuranceSettlementDetailScreen` với `DefaultTabController` 4 tab + `AppBar` header (mã phiếu + back + action buttons) + section "Thông tin quyết toán" (Card) + section KH/Xe (Card) + Tab "Chi phí" với panel "Tổng giá dịch vụ".
- Nút "+ Tạo hồ sơ bảo hiểm" trong AppBar action menu — `disabled` (greyed) với SnackBar message khi tap: "Tính năng sẽ available ở Wave 2".
- GraphQL operations qua `graphql_flutter` package — auth + tenant context propagate qua `Link` interceptor.
- Offline behavior: SO save với allocation cần network online (KHÔNG offline-first — match web behavior); show snackbar khi mất kết nối.

> **DEV NOTE — Conditional-display scope màn `InsuranceSettlementDetailScreen` (phát hiện ADLC run gen UI mobile W01; root-cause: agent dựng nhầm cổng điều kiện cấp-màn-hình `payerType==INSURANCE ? UI-mới : UI-cũ` cho cả màn).**
> Màn Chi tiết phiếu quyết toán dùng **chung 1 layout mới** cho cả 2 loại phiếu (Bảo hiểm + Khách hàng). Phân định rõ điều kiện render theo `payerType`:
> - **CHỈ** hai khối **"Phân bổ bảo hiểm"** (AC-6/AC-10) và **"Tổng giá dịch vụ"** (AC-6/AC-9/AC-11) là render **có điều kiện**: `payerType == INSURANCE` → hiển thị; phiếu QT loại **Khách hàng** → **ẩn** 2 khối. (Mirror tinh thần BR-INS-SO-ADJ-001 — vốn chỉ scope cho màn SO; FEAT-INS-STL-DETAIL không có rule conditional riêng cho màn Detail nên agent đoán sai.)
> - **TẤT CẢ phần layout còn lại** — header/Nhóm A (mã phiếu, meta, Tổng tiền/Còn lại), bộ **4 tab** (AC-4), nút **"Chỉnh sửa phiếu"** trong body (AC-10), **action bar / bottom button** sticky — áp dụng **layout mới cho MỌI loại phiếu**, **KHÔNG** gate theo `payerType`. **Cấm** đặt một cờ `isInsurance` bọc toàn màn.
> - **Ngoại lệ về _set nút_** (không phải layout): nút **"+ Tạo hồ sơ bảo hiểm"** trong action bar vẫn insurance-only (AC-13 / BR-INS-STL-DET-007) — style/layout action bar dùng chung, nhưng nút này chỉ hiện ở phiếu QT BH (DRAFT).
> - **Code shape khuyến nghị**: hạ biến điều kiện `isInsurance` xuống **chỉ bọc 2 widget** (`InsuranceAllocationPanel` + `TotalServicePricePanel`); phần còn lại render vô điều kiện. Để verify: mở phiếu QT loại Khách hàng → phải thấy layout mới (tab + nút sửa + bottom bar), chỉ thiếu 2 khối BH.
> - **Figma spec gate**: `Product/ux/figma-mobile/wave01-ins-stl-detail.md` dòng 24-25 mô tả màn là "biến thể loại BẢO HIỂM của màn baseline" — đọc đúng là *"chỉ THÊM phần BH (Phân bổ BH + Tổng giá DV)"*, **không** phải "cả màn là biến thể BH". Khi re-prefetch (`/prefetch-figma mobile 01`) nên bổ sung coverage note phân định baseline-new-UI vs insurance-only.

> **DEV NOTE — Wiring `InsuranceAllocationSection` vào màn SO Edit (FEAT-INS-SO-ADJUSTMENT; phát hiện ADLC run gen UI mobile W01: agent dựng widget `InsuranceAllocationSection` nhưng KHÔNG mount vào page nào — widget mồ côi, 0 reference).**
> Widget đã tồn tại + đúng nội dung; thiếu **bước integration cắm vào widget tree của page host**. Chỉ dẫn:
> - **Host page** = `lib/ui/service_order/service_order_creation/service_order_creation_page.dart` (`ServiceOrderCreationPage`) — dùng chung Create + Edit, phân biệt qua `isEdit => fromServiceOrderDetail != null`. Body dạng steps (`SOCreationStep`); ở Edit mode step thông tin dùng `CommonInfoPage()`.
> - **Mount** `InsuranceAllocationSection` (inline Card) vào body **CHỈ khi `isEdit == true`** (màn Chỉnh sửa) — Figma `397:23265` "Chỉnh sửa phiếu dịch vụ". **KHÔNG** mount ở Create (`isEdit == false`) per AC-0/BR-INS-SO-ADJ-001.
> - **Điều kiện hiển thị thứ 2 (trong Edit)**: chỉ render khi toggle **"Bảo hiểm" = "Có"** trên SO (BR-INS-SO-ADJ-001 — cùng trigger khu vực thông tin BH baseline). Toggle "Không" → ẩn section.
> - **Read-only ở màn Chi tiết** (`397:27621`): mount cùng widget nhưng chỉ panel kết quả (không 5 field nhập + nút "Áp dụng tất cả") — `InsuranceAllocationSection` đã hỗ trợ mode read-only (xem doc-comment widget).
> - **Verify**: mở 1 SO Edit có Bảo hiểm="Có" → section "Phân bổ quyết toán bảo hiểm" + panel "Tổng giá dịch vụ" phải hiện; SO Create → không có; toggle Bảo hiểm="Không" → ẩn.
> - **Lưu ý naming**: tên `InsuranceAllocationBottomSheet` trong bullet WP cũ là sai — design là **Section inline** (đã sửa bullet §2.2). Đừng tạo bottom sheet.

### 2.3 Out of Scope

- Dossier creation / view (W02 scope).
- Dashboard widget công nợ BH (W03 scope).
- Tích hợp realtime với DN BH (PRD OS-4, không trong epic).
- Master data CRUD DN BH (đã loại — system-seeded baseline).
- Workflow phê duyệt nội bộ phiếu QT BH trước khi xuất hồ sơ.
- Báo cáo lợi nhuận theo DN BH.
- Cập nhật chi tiết Phiếu báo giá template trên UI (PDF render ở W02).

### 2.4 garage-web — DEV Playbook (Pre-flight + Execution chi tiết)

> Mục tiêu: `agent-dev-garage-web` đọc xong §2.4 là đủ điều kiện bắt tay — không phải tự suy luận thứ tự đọc, component nào reuse/dựng mới, contract nào. Thực hiện tuần tự **Bước 0 → 6**. **KHÔNG code phần UI visual khi còn pre-flight blocker chưa clear** (đặc biệt: Figma bản đúng + GraphQL SDL types).

#### Bước 0 — Đọc hiểu yêu cầu (reading list bắt buộc, đúng thứ tự)

| # | Đọc | Trích xuất |
|---|---|---|
| 1 | `frontend/gf-gms-web/.claude/agents/agent-dev-garage-web.md` | Component Reuse Gate, Figma Workflow, Forbidden Actions, Output Contract |
| 2 | `Product/features/FEAT-INS-SO-ADJUSTMENT.md` (Nhóm A–E) + `FEAT-INS-STL-DETAIL.md` (Nhóm A–C) | Danh sách AC ID web-facing phải cover |
| 3 | `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` §7.2 (công thức) + §5 (validation) | Công thức realtime preview + message lỗi |
| 4 | `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.4b | UI action → GraphQL → REST mapping (10 op) |
| 5 | `Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md` §3 + §5 + §8 | States per screen (Hidden/Empty/Editing/Warning/Validation) + error UX |
| 6 | Figma DEV spec web (xem Bước 3 — **bản hiện tại CHƯA đúng**) | Layout/spacing — **chỉ tham chiếu khi đã có bản cập nhật đúng** |
| 7 | `frontend/gf-gms-web/knowledge-graph.yaml` → `implementation.components` / `implementation.pages` | Component/page đã đăng ký (Reuse Gate) |

**Done-reading gate**: viết được 1 đoạn tóm tắt scope + liệt kê đầy đủ AC ID (SO-ADJUSTMENT + STL-DETAIL) sẽ cover. Nguồn chuẩn nội dung/logic = FEAT + UX-FLOW + BR-EP; Figma chỉ chuẩn về **layout** (và phải là bản đúng).

#### Bước 1 — Reuse-First / Component-Inventory Gate

**Reuse-first**: trước MỌI UI task, search KG `implementation.components` + `src/components/{share,ui,customs}` theo functional keyword → **reuse/extend component sẵn có**. **CHỈ dựng mới nếu inventory xác nhận không đủ** (kèm lý do). Element thiếu phải dựng TRƯỚC + đăng ký KG, rồi mới compose feature. Liệt kê element UI → component reuse (path thật) → status:

| UI element | Component / path | Status |
|---|---|---|
| 4 tab (phiếu QT BH detail) | `src/components/ui/tabs.tsx` | REUSE |
| Toggle %/VNĐ (CK VT, CK CDV, giảm trừ) | `src/components/ui/toggle-group.tsx` (segmented) | REUSE |
| Input số tiền VND có format | `src/components/ui/input.tsx` (chưa có dedicated currency) | **WRAP → BUILD-FIRST** `currency-input` |
| Input % per dòng phụ tùng (khấu hao) | pattern `src/features/service-order/components/edit/` | COMPOSE |
| 3 box "BH/KH/Tổng thanh toán" | `src/components/ui/card.tsx` | COMPOSE |
| Badge trạng thái | `src/components/ui/badge.tsx` | REUSE |
| Bảng line item | `src/components/ui/table.tsx` | REUSE |
| Card "Thông tin QT" + "KH/Xe" | reuse `src/features/settlement-voucher/components/detail/overview-info.tsx` + `customer-vehicle-info.tsx` | REUSE |
| Nút "Tạo hồ sơ BH" (disabled W01) | `src/components/ui/button.tsx` + tooltip | REUSE |

> Inventory dựa trên FEAT + UX-FLOW (không phụ thuộc pixel Figma) → làm được trước. **Component thiếu duy nhất cần dựng trước ở W01: `currency-input` wrapper** (format VND, parse, mode % / số tiền).

#### Bước 2 — Kiểm tra contract GraphQL được bàn giao

- Nguồn: INTEG-FE §3.4b + `Architecture/api/agg-garage-graph-graphql.md`.
- Ops W01: `getServiceOrderByCode` (additive block `insuranceAdjustment` + breakdown), `updateServiceOrderV3` mang allocation input, `getSettlementByCode` (additive block `insurance` + `debtPanel`), mutation **mới** `createInsuranceSettlement(id, input)`.
- Verify: codegen types tồn tại; thao tác qua wrapper `src/hooks/use-query.ts` / `use-mutation.ts`; header `X-Tenant-Id` / `X-Branch-Id` / `Authorization` propagate.
- **Pre-flight blocker**: GraphQL insurance SDL types đang "P1 passthrough / TBD" — shape input/output chốt cùng BFF agent. Schema chưa stable → wire skeleton với typed mock + đồng bộ field name với BFF **trước khi finalize**; cross-check khớp INTEG §3.4b + enum `InsuranceAllocationMode (PERCENT|AMOUNT)`.

#### Bước 3 — Figma spec gate (Edit ✓ + Detail ✓ — đủ spec)

- **Bản Figma web ĐÚNG đã có** (GMS-v.3, file_key `EMGjGsnAJzGoGwTSK7dTuZ`): `Product/ux/figma-web/wave01-ins-so-adjustment.md` (node `13257:469505`, 3 state Edit **+ node `13270:206807` màn Chi tiết/Detail read-only**) + `wave01-ins-stl-detail.md` (node `13255:177002`, 4 state phiếu QT BH). Dùng làm chuẩn layout.
- ✅ **RESOLVED — màn Chi tiết Phiếu dịch vụ ĐÃ có Figma** (fetched 2026-06-04, node `13270:206807`): spec `wave01-ins-so-adjustment.md` thêm `## Screen: Chi tiết phiếu dịch vụ` — panel **"Tổng giá dịch vụ" read-only** (Chi tiết theo bên thanh toán AC-9 + Phân bổ Bảo hiểm 5 dòng AC-10 + Cân thanh toán AC-11), **KHÔNG** có panel nhập (Nhóm B chỉ ở Edit — AC-1). Gate visual màn Detail **ĐÃ GỠ** → implement Detail theo Figma. Bảng "Chi tiết phụ tùng" có cột read-only "Khấu hao VT" (AC-5). (`<InsuranceSettlementDetailPage>` = phiếu QT BH — khác màn SO Detail.) Vẫn honor `coverage_gaps` (AC-10 dấu/màu, AC-11 highlight — data-driven, FEAT thắng).
- **Honor `coverage_gaps` đã ghi trong spec** (FEAT AC thắng khi mâu thuẫn Figma, flag drift PR): khấu hao = **% only** (design có unit-selector "vnđ" — bỏ, AC-5); khấu trừ BH = **VND only** (AC-7); cột "Khấu hao (%)" per dòng phụ tùng (AC-5b, nằm trong bảng Parts baseline); "Phân bổ Bảo hiểm" apply **dấu +/− + màu** data-driven (AC-10); "Cân thanh toán" 3 ô highlight BH=xanh/KH=cam/Tổng=brand (AC-11); state cảnh báo "BH thanh toán < 0" chưa capture → render đỏ + warning, vẫn allow save (AC-12).
- Cho phép tiến hành **song song** phần không phụ thuộc pixel: scaffolding component (Bước 1), data wiring (Bước 2), calc/validation logic (Bước 5), state machine (UX-FLOW §5).

#### Bước 4 — Reference patterns + file plan (đích danh)

- **Study FIRST**: `src/features/settlement-voucher/components/detail/` (`index.tsx`, `cost-tab.tsx`, `overview-info.tsx`, `customer-vehicle-info.tsx`, `payment-history-tab.tsx`, `insurance-info.tsx`) = template 4 tab + info card; `src/features/service-order/components/edit/retail-sale-edit.tsx` = pattern form edit + per-line.
- **Target (tạo/sửa)**:
  - `src/features/insurance-allocation/components/InsuranceAllocationSection.tsx` (new) + `currency-input.tsx` (wrapper)
  - `src/features/insurance-settlement/components/detail/` — `InsuranceSettlementDetailPage` + 4 tab (reuse pattern) + panel "Tổng giá dịch vụ"
  - `src/features/insurance-*/schemas/*.ts` (zod) + `hooks/*.ts` (graphql wrap)
  - route variant phiếu QT BH detail (TanStack file route)
  - `frontend/gf-gms-web/knowledge-graph.yaml` — đăng ký pages + components mới

#### Bước 5 — Validation + realtime calc rules phải wire

- **Realtime preview** (BR-EP §7.2): `insurancePayable` / `customerPayable` / `total` — client preview, **server authoritative** (CALC-INS-001). Debounce input + memoize calc (perf 50+ line item).
- **Validation messages**: VLD-INS-SO-003 (% ≤ 100), VLD-INS-SO-004 (số tiền ∈ [0, cơ sở]), VLD-INS-SO-006 (mode ∈ {PERCENT,AMOUNT} → 400), VLD-INS-SO-005 (BH < 0 = warning, vẫn allow save).
- **Conditional display**: section "Phân bổ quyết toán bảo hiểm" chỉ render ở **Edit + Detail, KHÔNG Create** (BR-INS-SO-PS-006 / AC-0). Nút "+ Tạo hồ sơ bảo hiểm" disabled + tooltip "Sẽ available ở W02".

#### Bước 6 — KG update + self-check + exit gate

- **KG mandatory**: đăng ký pages + components mới vào `knowledge-graph.yaml` (gate `/dev-handoff` verify KG changed vs baseline; nếu không đổi phải `kg_no_change=true`).
- **Self-check** qua `.harness/_REVIEW-CHECKLIST.md` (shift-left).
- **Exit**: `cd frontend/gf-gms-web && npm run build && npm run lint && npm test -- --coverage` (≥ 60%); boundary clean (chỉ edit `frontend/gf-gms-web/**`); 3-in-1 version bump KG; UI layout đối chiếu **bản Figma cập nhật** (không phải bản draft cũ).

---

## 3. Entry Criteria

- [ ] **MR design pre-wave merged** (SA approve): HLD-SALES + HLD-ACCOUNTING + HLD-MOBILE update §SO Edit + §Phiếu QT BH detail + 3 API contract + **6 INTEG** (2 FE-* web + 2 MOB-* mobile + 2 BFF-*) + ADR-014 (ownership + snapshot schema + synchronous workflow).
- [ ] **Mobile UX design** verified (NEED CONFIRMATION nếu chưa có): bottom sheet + full-screen detail mockup do BA + Mobile UX designer tạo. Figma DEV spec prefetched qua `/prefetch-figma mobile 01`.
- [ ] **PO sign-off** FEAT-INS-SO-ADJUSTMENT v12 + FEAT-INS-STL-DETAIL v3 — tất cả AC chốt, không còn NEED CONFIRMATION block.
- [x] **UX-FLOW production design** verified: `Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`. Figma DEV spec web (GMS-v.3) **đã prefetch**: `figma-web/wave01-ins-so-adjustment.md` (node `13257:469505`) + `wave01-ins-stl-detail.md` (node `13255:177002`).
- [x] ✅ **Figma màn Chi tiết Phiếu dịch vụ ĐÃ có** (node `13270:206807`, fetched 2026-06-04) — spec SO-ADJUSTMENT thêm `## Screen: Chi tiết phiếu dịch vụ` (panel "Tổng giá dịch vụ" read-only); **gate visual màn SO Detail ĐÃ GỠ** (implement Detail theo Figma; honor `coverage_gaps` AC-10/AC-11 — xem §2.4 Bước 3).
- [ ] **Figma oracle** prefetched qua `/prefetch-figma-oracle web 01` cho agent-test-ui.
- [ ] **garage-web pre-flight** (xem §2.4 DEV Playbook): (a) reuse-first/inventory gate done — reuse check bắt buộc (KG `implementation.components`), chỉ dựng mới khi inventory xác nhận thiếu; `currency-input` wrapper dựng trước + đăng ký KG; (b) GraphQL insurance SDL types confirm với BFF (field khớp INTEG §3.4b); (c) honor `coverage_gaps` trong figma spec (khấu hao % only AC-5 / khấu trừ VND only AC-7 / AC-10 sign+màu / AC-11 highlight / AC-12 warning — FEAT thắng); (d) **màn SO Detail ĐÃ có Figma** (node `13270:206807`) — implement read-only theo spec, honor cùng `coverage_gaps`.
- [ ] **Knowledge graphs** reviewed: `Execution/knowledge-graphs/gf-sales.knowledge-graph.yaml` + `gf-accounting.knowledge-graph.yaml` cập nhật entities mới (InsuranceAllocation, InsuranceSettlement snapshot).
- [ ] **Branch** `feature/ep-insurance-settlement-w01` tạo từ `feature/add-architecture-v3`.
- [ ] **STATE.json** `wave=01`, `stage=PLANNING`, `boundary_active=null`. CR-1748764800 approved + logged.
- [ ] **Feature flag** `insurance_settlement_enabled` mechanism ready (Platform team).
- [ ] **Docker compose** + selftest baseline pass trên dev local (luồng SO Create/Edit + Tạo phiếu QT baseline đã chạy được).

---

## 4. Agent Assignments

### 4.1 DEV Agents

| Agent | Boundary | Tasks | Estimated Effort |
|---|---|---|---|
| `agent-dev-gf-sales` | `gf-sales` | SO entity: 8 scalar adjustment columns (ddl-auto) trên `service_order` + `depreciation_percent` trên `service_order_part` + ddl-auto=update + inline calculation in SO service + 8 unit test case + extend `for-settlement` response (8 scalar breakdown fields + 8 scalar adjustment fields) cho gf-accounting pull đồng bộ. `insurance_company` baseline đã lưu mã CTBH — KHÔNG thêm `insurance_code` + **validate VLD-INS-SO-003/004/006 (số ≥0, % ∈[0,100], mode hợp lệ → 400) + 2 unit test single-payer (PDV toàn BH / toàn KH, CALC-INS-006)** | ~7h |
| `agent-dev-gf-accounting` | `gf-accounting` | `settlement_records` (INSURANCE) additive scalar fields + endpoint tạo phiếu QT BH (pull `for-settlement` → persist cặp atomic → `settle` callback) + endpoint detail (4 tab response) + integration test pull+pair+settle (rollback khi settle fail) + **validate mode VLD-INS-SO-006 (→ 400) + breakdown/amount ≥ 0** | ~7h |
| `agent-dev-agg-garage-graph` | `agg-garage-graph` | GraphQL types + **1 mutation mới** (`createInsuranceSettlement`) + additive fields trên `updateServiceOrderV3`/`getServiceOrderByCode`/`getSettlementByCode` hiện hữu + DataLoader + header propagation + Vitest contract test + **enforce enum `InsuranceAllocationMode` + propagate `400 INVALID_ALLOCATION_MODE`** | ~5h |
| `agent-dev-garage-web` | `garage-web` | `<InsuranceAllocationSection>` (SO Edit page + SO Detail, ẩn ở Create AC-0) + 3 toggle %/amount + realtime preview + `<InsuranceSettlementDetailPage>` 4 tab + panel "Tổng giá dịch vụ" + nút Tạo hồ sơ disabled tooltip "W02" + wire GraphQL (trên design system hiện hữu, luồng create/edit page) **→ chi tiết pre-flight + reuse-first/inventory gate (reuse component sẵn có; chỉ dựng mới nếu inventory xác nhận thiếu) + file plan đích danh: §2.4 DEV Playbook (dựng `currency-input` trước; màn Edit (node `13257:469505`) + **màn SO Detail (node `13270:206807`) đều đã có Figma** — implement Detail read-only theo spec)** | ~6h |
| `agent-dev-garage-mobile` | `garage-mobile` | `InsuranceAllocationBottomSheet` + `InsuranceAllocationCubit` (BLoC) + SegmentedButton toggle + realtime preview + `InsuranceSettlementDetailScreen` 4 tab + panel "Tổng giá dịch vụ" + GraphQL client setup + AppBar action disabled | ~7h |

> **Parallel safety**: 5 boundary disjoint repos. Contract-first (ADR-014 `for-settlement` snapshot contract chốt cuối ngày 1) cho phép start cùng lúc với mock/skeleton. Web + mobile share GraphQL schema từ agg-garage-graph contract — không double work BFF.

### 4.2 REVIEW Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-review-backend` | Java code gf-sales + gf-accounting + Node code agg-garage-graph | Post-DEV mỗi boundary handoff xong |
| `agent-review-garage-web` | React code + a11y + contract conformance | Post-DEV garage-web handoff |
| `agent-review-garage-mobile` | Flutter code + BLoC pattern + platform-specific (iOS/Android) + a11y + contract conformance với cùng GraphQL schema | Post-DEV garage-mobile handoff |

### 4.3 TEST Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-test-api` | API contract: SO save với allocation payload + `for-settlement` snapshot response + tạo phiếu QT BH (pull → cặp atomic → settle) + phiếu QT BH detail response + error 400 invalid allocation mode | TEST_PLANNING |
| `agent-test-e2e` | Cross-boundary: SO Edit → save allocation → BFF mutation → gf-sales calculate → tạo phiếu QT BH → gf-accounting **pull** `for-settlement` + cặp atomic + settle → detail render khớp | TEST_PLANNING |
| `agent-test-ui` | Section "Phân bổ quyết toán bảo hiểm" form behavior (toggle %/amount, validate min/max, realtime preview) + 4 tab phiếu QT BH layout + responsive | TEST_PLANNING |
| `agent-test-isolation` | Tenant filter trên SO + phiếu QT BH + cross-tenant query reject | TEST_PLANNING (periodic) |
| `agent-test-performance` | SO Edit save latency p99 < 800ms với allocation; GET phiếu QT BH detail p99 < 600ms | TEST_PLANNING (periodic) |
| `agent-test-security` | Snapshot payload không leak PII; OriginTenantId header integrity; authz phiếu QT BH detail per persona | TEST_PLANNING (periodic) |

---

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests

- [ ] **gf-sales**: 8 scalar adjustment columns trên `service_order` + `depreciation_percent` trên `service_order_part`. ddl-auto=update apply success trên staging. `insurance_company` baseline đã lưu mã CTBH — KHÔNG thêm cột mới.
- [ ] **gf-sales**: inline calculation method + 8 unit test pass (epic §5 công thức + ví dụ 197,680,000 BH), **gồm 2 boundary single-payer (PDV toàn BH / toàn KH) — engine KHÔNG bỏ qua nhánh tính KH khi nhóm rỗng (CALC-INS-006)**.
- [ ] **gf-sales + gf-accounting**: validate `VLD-INS-SO-003/004/006` — unit/contract test **reject số âm, % > 100, mode sai (`400 INVALID_ALLOCATION_MODE`)**; số `0` hợp lệ (không reject). agg-garage-graph enforce enum `InsuranceAllocationMode` + propagate 400.
- [ ] **gf-sales**: `for-settlement` response trả 8 scalar breakdown fields + 8 scalar adjustment fields (contract golden file); idempotent pull (gọi 2 lần cùng SO → cùng snapshot). Thông tin CTBH từ `insurance_company` baseline.
- [ ] **gf-accounting**: `settlement_records` additive fields (INSURANCE), ddl-auto=update apply success. Cặp settlement CUSTOMER+INSURANCE persist atomic qua `related_settlement_code`; `settle` callback gf-sales success; **rollback khi settle fail** verified.
- [ ] **gf-accounting**: endpoint detail trả 4 tab + panel — response golden file test.
- [ ] **agg-garage-graph**: 1 mutation mới `createInsuranceSettlement` + additive fields (`updateServiceOrderV3`/`getServiceOrderByCode`/`getSettlementByCode`) GraphQL — contract test pass.
- [ ] **garage-web**: `<InsuranceAllocationSection>` + `<InsuranceSettlementDetailPage>` implemented theo UX-FLOW + INTEG §3.4b, trên design system hiện hữu; luồng create/edit page giữ nguyên.
- [ ] **garage-web**: `<InsuranceAllocationSection>` render trên SO Edit page (theo Figma) + SO Detail (read-only theo FEAT/UX-FLOW — **Figma Detail pending**), **không** trên SO Create (E2E assert).
- [ ] **garage-web**: realtime preview BH thanh toán / KH thanh toán đổi khi nhập 5 trường.
- [ ] **garage-web**: 4 tab phiếu QT BH render đúng + panel hiển thị 5 dòng phân bổ + Còn phải thu BH.
- [ ] **garage-web**: reuse-first/inventory gate thỏa — reuse component sẵn có, không tạo dup; chỉ dựng mới khi inventory xác nhận thiếu; `currency-input` wrapper dựng + đăng ký KG (§2.4 Bước 1).
- [ ] **garage-web**: màn **Edit** (node `13257:469505`) + màn **SO Detail** (node `13270:206807`) layout đối chiếu Figma GMS-v.3 (`wave01-ins-so-adjustment.md`) + honor `coverage_gaps` (khấu hao % only / khấu trừ VND only / AC-10 sign+màu / AC-11 highlight / AC-12 BH<0) per-FEAT, flag PR. Màn SO Detail render **read-only** panel "Tổng giá dịch vụ" theo `## Screen: Chi tiết phiếu dịch vụ` (§2.4 Bước 3).
- [ ] **garage-mobile**: `InsuranceAllocationBottomSheet` không mở từ SO Create screen (E2E assert qua `integration_test`).
- [ ] **garage-mobile**: realtime preview BH/KH thanh toán đổi khi nhập (BLoC state test).
- [ ] **garage-mobile**: `InsuranceSettlementDetailScreen` 4 tab render đúng + panel phân bổ; tested cả Android API 28+ + iOS 14+ trên device thật.
- [ ] **Build + lint + test pass per boundary** với coverage ≥ threshold:
  - `cd services/gf-sales && ./gradlew build checkstyleMain test jacocoTestReport` — coverage ≥ 80%
  - `cd services/gf-accounting && ./gradlew build checkstyleMain test jacocoTestReport` — coverage ≥ 80%
  - `cd garage-functions/agg-garage-graph && npm run build && npm run typecheck && npm test -- --coverage` — coverage ≥ 80%
  - `cd frontend/gf-gms-web && npm run build && npm run lint && npm test -- --coverage` — coverage ≥ 60%
  - `cd mobile/gf-garage-app && flutter analyze && flutter test --coverage && flutter build apk --debug` — coverage ≥ 60%
- [ ] **Integration test** `InsuranceSettlementCreateIT.java` (gf-accounting **pull** `for-settlement` đồng bộ → persist cặp atomic → REST `settle`; assert **rollback khi settle fail**).
- [ ] **Automated TCs** registered: `Execution/test-cases/ep-insurance-settlement-w01-{api,e2e,ui,isolation,performance,security}.md`.

### 5.2 Architecture & Docs

- [ ] Knowledge graph updated: gf-sales + gf-accounting + agg-garage-graph + garage-web (entities, events, permissions, last_verified). **garage-web KG**: đăng ký SO + settlement insurance pages/components.
- [ ] HLD-SALES + HLD-ACCOUNTING + 3 API contract + 4 INTEG + ADR-014 markdown các open item → CLOSED + reference FEAT-INS-* ID.
- [ ] CLAUDE.md không thay đổi (rule mới không cần — đã cover bởi rule §3.2 hiện hữu).
- [ ] **Version bump 3-in-1** mọi file đã sửa: `version + last_reviewed + Change Log entry`.

### 5.3 Quality Gates

- [ ] `agent-review-backend` finding P1=0; P2 ≤ 3 với follow-up ticket.
- [ ] `agent-review-garage-web` finding P1=0; P2 ≤ 3.
- [ ] `agent-review-garage-mobile` finding P1=0; P2 ≤ 3.
- [ ] `bash scripts/scan-boundary.sh` exit 0 (hoặc manual review boundary matrix — 0 cross-boundary direct DB call).
- [ ] Security scan (SAST + dependency) clean trên 4 repo: 0 CRITICAL/HIGH.
- [ ] Tenant isolation test pass: 2 tenant concurrent CREATE SO + tạo phiếu QT → mỗi tenant chỉ thấy data của mình.
- [ ] AC coverage 100% FEAT-INS-SO-ADJUSTMENT (Nhóm A-G) + FEAT-INS-STL-DETAIL (Nhóm A-D).
- [ ] Audit trail: PR commit message reference `FEAT-INS-SO-ADJUSTMENT` / `FEAT-INS-STL-DETAIL` ID.

### 5.4 Demo

- [ ] Demo script `Tracking/demos/ep-insurance-settlement-w01-demo.md` chuẩn bị xong, 5 scenarios:
  1. SO Create → section "Phân bổ" KHÔNG hiển thị (AC-0).
  2. SO Edit toggle Bảo hiểm = Có → section render, nhập 5 khoản → realtime preview đổi.
  3. Save SO → calculation chính xác công thức epic §5 (verify 197,680,000 BH).
  4. Tạo phiếu QT BH → snapshot allocation truyền sang gf-accounting → phiếu QT BH có dữ liệu.
  5. Mở chi tiết phiếu QT BH → 4 tab + panel "Tổng giá dịch vụ" với phân bổ + Còn phải thu BH = 197,680,000. Nút "Tạo hồ sơ bảo hiểm" disabled tooltip "Available ở W02".
- [ ] PO + BA stakeholder acceptance captured (sign-off note trong Change Log Audit).

---

## 6. Demo Target

Live trên staging — full kịch bản:

1. Login kế toán → mở SO `#SO-20260601-00010` (DRAFT, loại "Dịch vụ xe") → vào Chỉnh sửa.
2. Bật toggle "Bảo hiểm = Có" → chọn DN BH "Bảo Việt" từ dropdown system-seeded → nhập số hợp đồng, ngày hết hạn, SĐT giám định.
3. Thêm 5 line item: 2 phụ tùng (Nguồn TT = BH) + 1 dịch vụ (BH) + 1 phụ tùng (KH) + 1 dịch vụ (KH). Cộng sau VAT BH 207,900,000 / KH 33,000,000.
4. Section "Phân bổ quyết toán bảo hiểm" hiển thị. Nhập:
   - CK liên kết VT = 5,000,000 (mode AMOUNT)
   - CK liên kết CDV = 2,500,000 (mode AMOUNT)
   - Khấu hao 5% per 2 phụ tùng (per-line) → 2,000,000
   - Giảm trừ bồi thường = 200,000 (mode AMOUNT)
   - Khấu trừ BH = 520,000
5. Realtime preview: BH thanh toán 197,680,000 + KH thanh toán 35,720,000 + Tổng 233,400,000. ✓
6. Save SO → backend persist (KHÔNG outbox cho snapshot).
7. Bấm "Tạo phiếu quyết toán" → gf-accounting **pull** snapshot từ gf-sales (`for-settlement`) → tạo **cặp 2 phiếu QT atomic** (KH `#SET-20260601-00001K` + BH `#SET-20260601-00001`) → `settle` SO.
8. Mở phiếu QT BH `#SET-20260601-00001`:
   - Header: mã phiếu + 3 nút (Chỉnh sửa / In toàn bộ hồ sơ / + Tạo hồ sơ bảo hiểm — disabled).
   - Khối "Thông tin quyết toán" + Khối KH/Xe.
   - Tab "Chi phí" active: bảng 5 line item BH + panel "Tổng giá dịch vụ" 5 dòng phân bổ + Còn phải thu BH 197,680,000.
   - Tab "Hồ sơ bảo hiểm đã xuất": empty state "Chưa có hồ sơ nào được xuất".
   - Tab "Chứng từ" + "Lịch sử thanh toán" placeholder.

---

## 7. Dependencies (External to Wave)

| Dependency | Type | Source | Deadline | Risk |
|---|---|---|---|---|
| MR design pre-wave (HLD + API + INTEG + ADR-014) | Artifact | Leader → SA approve | Day -1 | MED — nếu SA review chậm > 1d, block wave-start |
| Object storage decision (cho W02) | Decision | Platform + Security | Day 4 (cuối W01) | LOW — không block W01 nhưng cần để W02 không bị delay |
| PDF template engine decision (ADR-016) | Decision | SA + Backend Lead | Day 4 (cuối W01) | LOW — block W02 không block W01 |
| Legal review PDF template | Approval | Legal + BA | Day 4 (cuối W01) | MED — Legal turnaround có thể chậm |
| Feature flag system | Infra | Platform | Day 1 | LOW — chỉ cần cho rollout, dev không block |

---

## 8. Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ddl-auto=update trên SO table lớn (nhiều triệu row) thêm column chậm | LOW | 0.5d delay | Benchmark trên staging dump prod-like trước; ddl-auto chỉ `ADD COLUMN ... NULL` (no default = fast); schema diff review trước prod |
| `for-settlement` response contract drift (gf-sales → gf-accounting) sau ADR-014 ratified | MED | Rework cuối wave | Contract test golden file ở cả 2 side; CI fail nếu schema không khớp ADR-014 |
| ddl-auto=update gf-accounting fail khi entity change lớn | LOW | Block deploy | Schema diff review trên staging trước prod; rollback strategy = restore backup (manual — gf-accounting không Flyway) |
| Realtime preview UI lag với SO nhiều line item (50+) | LOW | UX regression | Debounce input 300ms; memoize calculation; performance test 100 line item < 100ms |
| AC coverage không đủ — UX flow production có edge case chưa document | MED | Test fail cuối wave | UX flow design verified trước wave + Figma oracle check tại TEST_PLANNING |
| Khấu hao % per line item UI confuse (vs % header) | MED | User error sản phẩm | UX flow chốt clear: per-line input — bullet "Áp dụng đồng loạt 5% cho tất cả phụ tùng" + per-line override; demo cuối wave |
| REST `settle` fail sau khi persist cặp settlement | LOW | Phiếu QT BH dở dang | Transaction rollback (KHÔNG saga/Temporal); `settle` idempotent theo settlementCode; user retry thủ công; dead-letter cho settle-fail hiếm (ADR-014 §Consequences) |
| Backward compat — SO cũ (NULL allocation) hiển thị section trống | LOW | UX confusion | Section render NULL = "Chưa có phân bổ"; SO cũ có toggle BH=Có nhưng allocation NULL hiển thị empty placeholder |
| **OPEN ITEM — mockup Create SO có toggle "Bảo hiểm"** (ảnh user) vs AC-0 (allocation chỉ Edit/Detail) | MED | Spec conflict | Cần PO confirm: toggle BH hiển thị ở Create nhưng **panel 5 khoản chỉ active ở Edit/Detail**? Raise tại Entry (PO sign-off) — KG-first, không tự quyết |

---

## 9. Post-Wave Actuals

_Filled end-of-wave._

| Metric | Target | Actual |
|---|---|---|
| Duration | 5d | — |
| DEV retries | 0 | — |
| Review findings (P1/P2) | 0 / ≤ 3 | — / — |
| TC pass rate | ≥ 95% | — |
| Bugs open at demo | 0 (P1), ≤ 2 (P2+) | — |
| SO Edit save latency p99 (post-deploy 24h) | < 800ms | — |
| GET phiếu QT BH detail p99 | < 600ms | — |
| Phiếu QT BH create success rate (pull → cặp atomic → settle) | ≥ 99.5% | — |
| AC coverage | 100% | — |
| Build success rate | 100% | — |

---

## 10. Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-06-01 | Initial work package — Wave 1 EP-INSURANCE-SETTLEMENT (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL), 4 boundary parallel, 5d | Delivery Authority |
| 2026-06-01 | v2 — Add `garage-mobile` boundary (Flutter equivalent) per user feedback. Boundaries 4→5. Effort 25h→32h. Add `agent-dev-garage-mobile` (~7h) + `agent-review-garage-mobile`. INTEG contracts 4→6 (thêm 2 MOB-*). Build command thêm Flutter. Out of scope clarify: bỏ "Mobile UI" out — mobile is now IN scope. | Delivery Authority |
| 2026-06-01 | v3 — **Conform ADR-014** (post-consolidation). Sửa sai lệch kiến trúc: (A1) đảo chiều snapshot — bỏ outbox push `from-so` + inbox dedup, đổi sang gf-accounting **pull đồng bộ** `for-settlement` (CB-INS-002); (A2) entity model — thay `InsuranceSettlementEntity` riêng bằng mở rộng `settlement_records` (settlement_type=INSURANCE) với field canonical `insurance_adjustments`/`breakdown_by_payer`/`insurance_payable_amount`; (A3) bổ sung cặp settlement atomic (CB-INS-004) + `settle`/`reopen` callback (CB-INS-003) + rollback (no saga/Temporal); (A4) sửa tham chiếu ADR-015→ADR-014 cho snapshot schema. Cập nhật §2.1/2.2/4.1/5.1/6/7/8 + IT rename `…SnapshotIT`→`…CreateIT`. | Delivery Authority |
| 2026-06-01 | v4 — **Đổi tham chiếu DN BH `insurance_company_id` (FK `mdm_catalog.id`) → `insurance_code` (VARCHAR(255), FK `mdm_catalog.code`, `directory='INSURANCE'`); snapshot field `insuranceCompanyId` → `insuranceCode`** (§2.2/4.1/5.1) — đồng bộ ADR-014 v4 (convention baseline code-based). `insurance_company_name` snapshot giữ nguyên. | Delivery Authority |
| 2026-06-02 | v7 — **Bỏ `insurance_code` khỏi gf-sales + gf-accounting; bỏ `insurance_company_name` khỏi gf-accounting**. Lý do: `insurance_company` (VARCHAR baseline) trên `service_order` đã lưu mã CTBH (v.d. `INS_BSH`) — KHÔNG phải free-text như architecture docs v1.2 giả định. gf-accounting lấy thông tin CTBH qua REST `for-settlement` — không cần lưu riêng. Sửa §2.2 (gf-sales: bỏ `insurance_code` additive column + `insuranceCode` trong `for-settlement` response; gf-accounting: bỏ `insurance_code` + `insurance_company_name` additive columns + `insuranceCode` trong create request), §4.1 (agent tasks), §5.1 (deliverables). Đồng bộ sửa 8 upstream docs: ADR-014 v5, gf-sales-data-model v1.5, gf-accounting-data-model v6, gf-sales-api v6, gf-accounting-api v6, INTEG-EXT-gf-sales v5, gf-accounting-events v6, BR-EP v17. | Delivery Authority |
| 2026-06-01 | v6 — **Align đầu API với architecture contract** (audit): chi tiết phiếu QT BH `GET /protected/v1/insurance-settlements/{id}/detail` (tự chế) → **REUSE** `GET /api/v1/settlements/{code}` (additive `insurance`+`debtPanel`); tạo phiếu QT BH ghi rõ **REUSE** `POST /api/v1/service-orders/{id}/settlements`; BFF bỏ 3 op tự chế (`updateServiceOrderInsuranceAllocation`/`serviceOrderInsuranceAllocation`/`insuranceSettlementDetail`) → chỉ **1 mutation mới** `createInsuranceSettlement(id,input)` (agg #44) + additive trên `updateServiceOrder`/`getServiceOrder`/`getSettlement`; sửa count "2 mutation+2 query" (§2.2/4.1/5.1). | Delivery Authority |
| 2026-06-01 | v5 — **Sửa tên trường entity gf-sales khớp data-model §2bis** (sai quy chuẩn, lẫn Việt-Anh): thay 7 cột rời tiếng Việt (`ck_lien_ket_*`/`giam_tru_*`/`khau_tru_*`) trên `ServiceOrderEntity` bằng **1 cột `insurance_adjustments` JSONB** (key Anh: discountMaterial/discountLabor/depreciationDefaultPercent/claimReduction/insuranceDeductible) + `insurance_code` trên `service_order`; chuyển `khau_hao_percent`@`ServiceOrderItemEntity` → `depreciation_percent`@`service_order_part` (BR-INS-SO-ADJ-005); calculator var Việt → `breakdownByPayer.totalAfterVat.{bh,kh}`/`insurancePayable`/`customerPayable`; migration `add_so_insurance_allocation` → `V1.0.15__insurance_adjustments.sql`. Cập nhật §2.2/4.1/5.1. | Delivery Authority |
| 2026-06-02 | v8 — **Chốt Bottom Sheet Manager contract — resolve BLOCKER #4 garage-web** (SA + Web Lead, conversation 2026-06-02). Verify contract vs codebase thật (`frontend/gf-gms-web`): deps đủ (vaul 1.1.2/zustand 5.0.6/tanstack-router 1.124), 5 route file cần xoá khớp 100%, [protected.ts](../../frontend/gf-gms-web/src/utils/protected.ts) permission-check đang **comment (no-op)** → 77 route hở authz UI. Chốt 3 quyết định mở: (1) **store-only, BỎ URL search-param sync** (reload mất sheet — ưu tiên đơn giản) thay cho "search-param sync" ở v7; (2) **Back = `closeAll()`** qua 1 `history.pushState` entry + `popstate` listener (depth>1 vẫn closeAll, không pop từng tầng); (3) **permission-at-open wire thật** qua `useAccessActions().canAccess({resource,action})` — KHÔNG mirror `protectedRoute` no-op. Dirty-guard: store-only ⇒ `useNavigationBlocker` không fire → guard custom 2 trigger (overlay/X + popstate), reuse confirm UI. Sửa §2.2 (routing + permission + dirty-guard), §3 Entry (tick `[x]` — RESOLVED), §5.1 Exit (routing assert), §8 Risk (2 row: lật mitigation "bỏ URL" + dirty-guard). Entry criterion #4 hết block → đủ điều kiện spawn `agent-dev-garage-web`. | Delivery Authority + SA + Web Lead |
| 2026-06-03 | v9 — **Decomposition component-first A0→A1→B→C cho garage-web** (CHỐT user conversation). Tách scope web một-cục thành 4 bước: A0 shared infra one-time (shell + sheet manager + token + routing) / A1 registry primitive V3 on-demand (§2.2 bảng **canonical**, W02 reference) / B migrate CHỈ màn feat sang primitive / C feature compose. §2.2 restructure 4 phase + bảng registry 10 primitive; §3 Entry thêm component inventory; §4.1 tách `agent-dev-garage-web` thành 4 sub-task (A0~7h + A1~6h + B~4h + C~6h = ~23h, trước gộp ~13h — A1+B lộ ra khi tách); §1 Duration ~39h→~49h; §5.1 exit-check per phase; §5.3 + §2.2 **sửa gate path sai** `scripts/check-v3-sourcing.sh` → `.claude/scripts/check-v3-sourcing.sh` (per-service, chạy trong `frontend/gf-gms-web`); §8 thêm Risk regression migrate. KHÔNG đổi wave scope (`Plan/WAVE-SEQUENCE` bất biến). | Delivery Authority |
| 2026-06-02 | v7 — **Fold Figma V3 frontend architecture vào garage-web scope** (Delivery Authority + SA conversation). (a) Layout shell V3 (header/main-nav/footer) áp **toàn app**; (b) **Global Bottom Sheet Manager** (typed registry + zustand stack + lazy + dirty-guard + permission-at-open) thay page create/edit; (c) routing **search-param sync** (xoá route file SO/settlement create/edit, giữ detail page); (d) in-screen V3 chỉ SO + settlement. garage-web effort ~6h→~13h (one-time foundation amortize). Thêm Entry (Figma V3 spec + manager contract), Deliverables (shell/manager/routing/v3-sourcing), gate `check-v3-sourcing.sh`, 6 Risk row (mixed-version shell, dirty-guard, permission gate, bundle, deep-link, OPEN ITEM v3 create toggle vs AC-0). Out of scope: in-screen V3 + create/edit→sheet cho module ngoài SO/settlement (wave sau); detail giữ page; mobile không trong scope V3 web. Rebase merge: giữ nguyên v3-v6 (ADR-014 pull-snapshot, settlement_records, code-based FK, REUSE endpoints). | Delivery Authority + SA |
| 2026-06-03 | v9 — **Flatten JSONB + xoá events + inline calc + ddl-auto**: (A) `insurance_adjustments` JSONB → 8 scalar columns, `breakdownByPayer` → 8 scalar columns (`breakdown_*_insurance/customer`); (B) xoá `insurance-settlement-created` outbox publish — REST-only flow; (C) `InsuranceAllocationCalculator` → inline trong SO service; (D) Flyway V1.0.15 → ddl-auto=update. §2.2/3/4.1/4.3/5.1 cập nhật. | Delivery Authority |
| 2026-06-04 | v10 — **Bỏ V3 frontend architecture cho garage-web — giữ design system cũ** (CHỐT user conversation). Gỡ toàn bộ scope V3: component-first A0→A1→B→C, layout shell V3, Global Bottom Sheet Manager + routing change (create/edit → sheet, store-only, Back=closeAll, dirty-guard, permission-at-open), Registry component V3, gate `check-v3-sourcing.sh`. garage-web về **feature UI trên design system hiện hữu**, luồng create/edit page giữ nguyên. §1 Duration ~49h→~32h (web ~23h→~6h); §2.2 garage-web rút gọn về feature; §2.3 bỏ 4 out-of-scope V3; §3 Entry bỏ Figma V3 spec + Sheet Manager contract + component inventory V3; §4.1 gộp 4 sub-task web → 1 (~6h); §5.1 bỏ deliverable shell/sheet/routing/Phase A1-B-C; §5.2 KG bỏ `design_version: v3` + bottom-sheet-manager; §5.3 bỏ gate `check-v3-sourcing.sh`; §8 Risk bỏ 6 row V3 (mixed-version shell, bỏ URL, dirty-guard, bundle, permission gate, migrate regression). Không thay thế bằng kiến trúc mới. KHÔNG đổi wave scope / feature AC. Đồng bộ HLD garage-web v8 + KG garage-web v8. |
| 2026-06-04 | v11 — **Đóng spec-gap validate + single-payer (root-cause review W01 — agent lần đầu bỏ sót validate + nhánh tính 1 bên thanh toán)**: (A) §2.2 gf-sales — định nghĩa rõ "2 boundary" unit test = (a) PDV toàn BH, (b) PDV toàn KH (single-payer, CALC-INS-006) + thêm bullet validation (VLD-INS-SO-003/004/006); (B) §4.1 — thêm deliverable validate vào task gf-sales / gf-accounting / agg-garage-graph (trước chỉ có ở garage-mobile); (C) §5.1 Exit — gf-sales unit test gồm 2 boundary single-payer + dòng validate (reject số âm / % >100 / mode sai 400; 0 hợp lệ). KHÔNG đổi wave scope / feature AC. Đồng bộ BR-EP v19 (VLD-INS-SO-006 + CALC-INS-006), FEAT-INS-SO-ADJUSTMENT v16 (AC-14 matrix + EC-6), gf-sales-api v8, gf-accounting-api v8. | Delivery Authority | Delivery Authority |
| 2026-06-04 | v13 — **Cập nhật Figma gate sau khi spec ĐÚNG (GMS-v.3) được bổ sung + flag GAP màn Chi tiết Phiếu dịch vụ (user conversation)**: (A) Figma web Edit spec đã có (`wave01-ins-so-adjustment.md` node `13257:469505` 3 state + `wave01-ins-stl-detail.md` node `13255:177002`) — §2.4 Bước 3 đổi từ "bản chưa đúng → gate toàn visual" sang "Edit ✓ có spec, honor coverage_gaps; **màn SO Detail CHƯA có Figma (sẽ bổ sung sau) → gate visual riêng màn Detail**"; (B) §2.2 garage-web bullet 1 + §3 Entry + §4.1 cell + §5.1 exit-check: ghi rõ Edit implement theo Figma, SO Detail render read-only theo FEAT/UX-FLOW tới khi có Figma Detail; (C) đồng bộ INTEG-FE v4 (tách row Edit/Detail + flag Figma Detail pending). KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-04 | v14 — **GỠ gate Figma màn Chi tiết Phiếu dịch vụ — Figma Detail ĐÃ có (user conversation)**: Business Authority cung cấp node Detail `13270:206807` (file `GMS-v.3`). Spec figma-web `wave01-ins-so-adjustment.md` gen `## Screen: Chi tiết phiếu dịch vụ` (panel "Tổng giá dịch vụ" read-only Nhóm C, không panel nhập). Đổi §2.4 Bước 3 (Edit ✓ + Detail ✓), §3 Entry, §4.1 cell garage-web, §5.1 exit-check: bỏ "gate visual màn SO Detail / sẽ bổ sung sau" → implement Detail theo Figma + honor `coverage_gaps` (AC-10 dấu/màu, AC-11 highlight). Đồng bộ FEAT-INS-SO-ADJUSTMENT v17 + EP v15 + UX-FLOW v12 + registry comment. KHÔNG đổi wave scope / feature AC / source code. (CR-1780561614) | Delivery Authority |
| 2026-06-04 | v15 — **Reconcile op-name + bỏ hallucinate (Blocker 1+2, verified vs committed HEAD agg graph)**: (1) §2.2/§4.1/§5.1 + body — tên op canonical: `updateServiceOrder`→`updateServiceOrderV3` (op V2 ≠ V3), `getServiceOrder`→`getServiceOrderByCode`, `getSettlement`→`getSettlementByCode`. (2) Gỡ hedge "hoặc `applyInsuranceAdjustments`" (line Ops W01) — write điều chỉnh BH = additive trên `updateServiceOrderV3`, KHÔNG op riêng (op này không có trong agg graph). `createInsuranceSettlement` giữ "mutation mới" (đúng — chưa có trong HEAD). KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-04 | v12 — **Thêm §2.4 garage-web DEV Playbook (pre-flight + execution chi tiết)** để bàn giao `agent-dev-garage-web`: 7 bước (Bước 0 đọc hiểu yêu cầu + reading list → Bước 1 component inventory & gap analysis [component-first gate, dựng `currency-input` trước] → Bước 2 kiểm GraphQL contract → **Bước 3 Figma spec gate — bản web hiện tại CHƯA đúng, gate phần UI visual cho tới khi re-prefetch `/prefetch-figma web 01`** → Bước 4 reference patterns + file plan đích danh → Bước 5 validation + realtime calc → Bước 6 KG + self-check + exit). Cross-ref §3 Entry (web pre-flight + Figma-bản-đúng gate), §4.1 (cell garage-web trỏ §2.4), §5.1 (exit-check reuse gate + currency-input + drift re-verify per-FEAT). KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-05 | v17 — **Đóng wiring-gap `InsuranceAllocationSection` mobile** (root-cause ADLC run gen UI W01 — `agent-dev-garage-mobile` dựng widget nhưng KHÔNG mount vào page nào, 0 reference): §2.2 garage-mobile (A) sửa bullet 1 `InsuranceAllocationBottomSheet`→`InsuranceAllocationSection` (inline Card, KHÔNG bottom sheet — khớp Figma `397:23265`); (B) thêm **DEV NOTE wiring** chỉ host page `ServiceOrderCreationPage` (Create+Edit chung, `isEdit=fromServiceOrderDetail!=null`), mount section CHỈ khi `isEdit==true` + toggle Bảo hiểm="Có" (AC-0/BR-INS-SO-ADJ-001), read-only ở màn Chi tiết, verify steps. KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-05 | v16 — **Đóng spec-gap conditional-display màn `InsuranceSettlementDetailScreen` mobile** (root-cause ADLC run gen UI W01 — `agent-dev-garage-mobile` dựng nhầm cổng điều kiện cấp-màn-hình `payerType==INSURANCE ? UI-mới : UI-cũ`): §2.2 garage-mobile thêm **DEV NOTE** phân định — chỉ 2 khối "Phân bổ bảo hiểm" + "Tổng giá dịch vụ" gate theo `payerType`; header/4-tab/nút "Chỉnh sửa phiếu"/action bar = layout mới cho MỌI loại phiếu (cấm cờ `isInsurance` bọc toàn màn); ngoại lệ set nút "Tạo hồ sơ bảo hiểm" insurance-only (AC-13/BR-INS-STL-DET-007) + code shape khuyến nghị + figma spec gate. KHÔNG đổi wave scope / feature AC / source code. (Gap nằm ở FEAT/BR — flag Business Authority bổ sung rule chính thức.) | Delivery Authority |
| 2026-06-05 | v16b — **Rename component-first → Reuse-First / Component-Inventory Gate (FB-1, feedback agent web wave 1)**: §2.4 Bước 1 heading + intro reword dẫn đầu bằng reuse ("search KG + `src/components/{share,ui,customs}` theo functional keyword → reuse/extend; CHỈ dựng mới nếu inventory xác nhận thiếu"); §3 Entry + §4.1 cell garage-web + §5.1 deliverable đổi cụm "component-first gate" → "reuse-first/inventory gate". Fix gốc lỗi duplicate component (task phát biểu "build X first" đảo ngược reuse-first). Đồng bộ skill `gen-wave-plan` v2. KHÔNG đổi wave scope / feature AC / source code. | Delivery Authority |
| 2026-06-07 | v18 — **Resolve merge conflict** (branch merge để lại conflict marker committed trong file — frontmatter `version` + changelog tail; body đã merge đầy đủ): giữ cả 3 entry lịch sử (v17 mobile wiring + v16 conditional-display + v16b reuse-first rename — đổi nhãn v16 thứ 2 → v16b tránh trùng số), frontmatter version 16/17 → 18, `last_reviewed` → 2026-06-07. KHÔNG đổi nội dung scope / feature AC / source code. | Delivery Authority |
