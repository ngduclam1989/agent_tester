---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-INS-STL-CREATE.md"
source_version: 6
source: "manual-realign-pkg-v13"
source_feat_id: "FEAT-INS-STL-CREATE"
source_feat_sha: "d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 6
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
experience: "garage-web"
platform: web
modifies: ["FEAT-STL-CREATE"]
change_type: "brownfield-enhancement"
consumes_backend_feats: ["FEAT-INS-STL-CREATE"]
consumes_bff_feats: ["FEAT-INS-STL-CREATE"]
i18n_keys: []
screens_touched:
  - "src/features/settlement/pages/CreateSettlementPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave02-ins-stl-create--panel.md (node 13535:157815 — section parent với 3 variant: có BH 1440x2644 + không BH 1440x1482 + context SO Detail 1440x2084)"
  - "Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md (node 13535:159225 — Panel 'Tổng giá dịch vụ' A5 2-cột BH|KH reflow per CR-20260616-02, 1212x816)"
authoring_inputs:
  pkg_ref: "PKG-W02-insurance-dossier v13 §2.0 (Phase A) + §2.2 (slice 0)"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "9a804fe587a5fa306f6a2c65fe0d932dd5b394bd9fda02eb5b2e937b75fc2ec9"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-STL-CREATE.fe-web.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
revision: "REALIGN-pkg-v13-figma-spec"
---

# FEAT-INS-STL-CREATE (FE Web): Tạo phiếu QT — panel "Tổng giá dịch vụ" read-only + CR-20260616-02 2 cột

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma spec: [`Product/ux/figma-web/wave02-ins-stl-create--panel.md`](../../../../../Product/ux/figma-web/wave02-ins-stl-create--panel.md) (page layout) + [`Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md`](../../../../../Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md) (A5 panel 2-cột reflow). PKG-W02 §2.0 (Phase A) + §2.2 (slice 0) là arbiter. Cross-tier coordination ở §12.
> **i18n KHÔNG dùng** — toàn bộ label render fixed tiếng Việt inline (xem §4.3).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-STL-CREATE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 — Phase A slice 0 (chạy đầu wave, hấp thụ ngày 1) |
| Status | DRAFT |
| Screens touched | `CreateSettlementPage.tsx` (MODIFY — extend baseline FEAT-STL-CREATE) |
| Cross-tier consume | BE: `FEAT-INS-STL-CREATE` (gf-accounting) \| BFF: `FEAT-INS-STL-CREATE` (agg-garage-graph) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-STL-CREATE.md`](../../../../../Product/features/FEAT-INS-STL-CREATE.md) |
| Source version | v6 |
| Source SHA | `d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` |
| Figma spec | [`wave02-ins-stl-create--panel.md`](../../../../../Product/ux/figma-web/wave02-ins-stl-create--panel.md) (page layout 13535:157815) + [`wave02-ins-stl-create--fullscreen-a5.md`](../../../../../Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md) (A5 panel 2-cột 13535:159225) |
| PKG | [`Execution/work-packages/PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md) v13 §2.0 (Phase A) + §2.2 (slice 0) |

## 0bis. Phase A context (PKG-W02 §2.0)

> **W02 Phase A = 5 scope items** chạy tuần tự ngày 1 trước Phase B (dossier). FEAT-INS-STL-CREATE là **A1** trong cụm này. Hard gate A → B: panel + template in stable 24h staging mới start Phase B.

| Item | Boundary | Nội dung FE Web |
|---|---|---|
| **A1 FEAT-INS-STL-CREATE** (scope chính của file này) | gf-accounting + agg + web + mobile | Panel "Tổng giá dịch vụ" read-only trên màn **Tạo phiếu QT** (snapshot từ SO) — 3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán. Render có điều kiện theo `soHasInsurance` (BR-INS-STL-CRE-009). |
| **A2 CR-20260612-01** (related) | gf-accounting + agg + web + mobile | Panel màn **chi tiết phiếu QT** tách per-payer (phiếu BH 1 cột BH; phiếu KH thêm "Phân bổ BH" 3 khoản nếu SO có BH; ẩn 2 khoản CK liên kết BH trên phiếu KH). **Scope FEAT-INS-STL-DETAIL** — KHÔNG impl trong FEAT này, chỉ liên quan visual consistency. |
| **A3 CR-20260616-01** (related — BE/template) | gf-accounting + gf-sales | Template **in phiếu QT** + section "Phân bổ bảo hiểm" (BH 5 khoản / KH 3 khoản / không BH baseline). FE Web KHÔNG đụng template in (BE responsibility) — chỉ verify print trigger từ phiếu QT detail. |
| **A4 CR-20260612-02** (related — popup SO) | gf-sales + web + mobile | Popup **"Hoàn thành phiếu dịch vụ"** cảnh báo Tổng BH thanh toán < 0 (warn-and-allow). **Scope FEAT-INS-SO-ADJUSTMENT AC-17** — KHÔNG impl trong FEAT này. |
| **A5 CR-20260616-02** (scope chính của file này — visual reflow) | web + mobile | Panel "Tổng giá dịch vụ" — khối **"Phân bổ Bảo hiểm"** + **"Cân thanh toán"** reflow 1 cột → **2 cột (BH \| KH)** dóng thẳng với "Chi tiết theo bên thanh toán"; mỗi khoản +/− đúng cột. **Display-only** (số liệu computed server-side). Áp 3 màn: SO Edit (Figma `13354-57960`) + SO Detail (`13354-58368`) + **Tạo QT (`13535-159225`)**. KHÔNG áp chi tiết QT (1-cột per-payer theo A2). |

> **FE Web tier (file này) trực tiếp ship**: A1 (panel read-only Tạo QT) + A5 (reflow 2 cột Tạo QT — Figma `13535-159225`). A2/A3/A4 là context để DEV hiểu cụm.

## 1. Mục đích nghiệp vụ

Kế toán / chủ garage cần đối chiếu chính xác phần phân bổ bảo hiểm — bao gồm các khoản điều chỉnh và số tiền BH thực trả — ngay trên màn Tạo phiếu quyết toán trước khi chốt, thay vì phải mở lại Phiếu dịch vụ để tra cứu. Feature này mở rộng luồng `FEAT-STL-CREATE` production bằng cách hiển thị panel "Tổng giá dịch vụ" read-only (3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) snapshot từ SO, và đảm bảo số liệu BH thanh toán được tính server-side rồi snapshot vào cặp phiếu QT khi xác nhận — giảm sai sót và loại bỏ thao tác đối chiếu ngoài hệ thống.

## 2. Trách nhiệm FE Web (garage-web)

- **Màn hình entry**: Extend `CreateSettlementPage.tsx` (baseline FEAT-STL-CREATE) — KHÔNG rebuild màn, chỉ inject panel "Tổng giá dịch vụ" read-only vào vị trí phù hợp trong layout hiện hữu (sau khối "Bảo hiểm chi trả" baseline, trước Footer).
- **Panel có điều kiện** (FEAT v6 AC-2 + BR-INS-STL-CRE-009):
  - Khi `soHasInsurance === true` → render **đầy đủ 3 khối**:
    - Khối "Chi tiết theo bên thanh toán" — bảng 2 cột (`"Bảo hiểm thanh toán"` | `"Khách hàng thanh toán"`) × 4 dòng (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT).
    - Khối "Phân bổ Bảo hiểm" — 5 dòng điều chỉnh với dấu +/− và màu (xem AC-4).
    - Khối "Cân thanh toán" — 3 ô highlight: "Bảo hiểm thanh toán" (xanh), "Khách hàng thanh toán" (cam), "Tổng thanh toán" (đen).
  - Khi `soHasInsurance === false` → render **rút gọn**:
    - Khối "Chi tiết theo bên thanh toán" — bảng **1 cột** "Khách hàng thanh toán" (bỏ cột BH).
    - **KHÔNG** render khối "Phân bổ Bảo hiểm".
    - Khối "Cân thanh toán" chỉ **2 ô**: "Khách hàng thanh toán" (cam) + "Tổng thanh toán" (đen).
  - Panel **KHÔNG ẩn hẳn** (luôn hiển thị ở 1 trong 2 mode).
- **A5 CR-20260616-02 — reflow 2 cột (Figma `13535-159225`)**: khối "Phân bổ Bảo hiểm" + "Cân thanh toán" trên màn Tạo QT mode `full-insurance` phải dóng thẳng 2 cột (BH | KH) với "Chi tiết theo bên thanh toán" — mỗi khoản +/− render đúng cột tương ứng. Cùng pattern với 2 màn SO Edit (`13354-57960`) + SO Detail (`13354-58368`) — share component panel.
- **Toàn bộ số liệu read-only**: Consume snapshot server-side từ BFF query — FE KHÔNG tự tính công thức phân bổ. Trường "Tổng tiền bảo hiểm trả" bên BH là **read-only computed** (FEAT v6 AC-6 + BR-INS-STL-CRE-003), KHÔNG editable input.
- **Reuse component W01 — priority `customs/` > `share/` > `ui/`** (PKG v14 §2.4 Bước 1 + §2.0 A1 explicit, cập nhật 2026-06-18): trước MỌI UI task, search KG + scan codebase theo thứ tự ưu tiên:
  1. `src/components/customs/` — domain-specific reusable components (ưu tiên cao nhất; foundation W01 với `<InsuranceSettlementDetail>` / `<InsuranceAllocationSummary>` thường ở đây).
  2. `src/components/share/` — cross-feature shared components.
  3. `src/components/ui/` — shadcn primitives (fallback cuối).
  → **Tái dùng component panel "Tổng giá dịch vụ" đã có từ FEAT-STL-CREATE baseline + W01 foundation** (`<InsuranceSettlementDetail>` panel / `<InsuranceAllocationSummary>` — đăng ký KG `implementation.components` ở `customs/`). Áp CR-20260616-02 để tách 2 cột. **KHÔNG dựng component mới nếu chỉ cần thêm prop/mode**.
- **GraphQL**: Consume BFF query `getSettlementCreateContext(soCode)` để lấy:
  - `soHasInsurance: Boolean!` — flag điều khiển mode panel.
  - `payerBreakdown` — số liệu 2 cột BH/KH cho "Chi tiết theo bên thanh toán".
  - `insuranceAllocation` — 5 khoản với amount/sign cho "Phân bổ Bảo hiểm".
  - `paymentBalance` — `{ insurancePayment?, customerPayment, total }` cho "Cân thanh toán".
- **Mutation `createInsuranceSettlement(input)`**: tên op canonical từ agg-garage-graph-graphql v7.7 (RESOLVED NC-W02-FEAT-STL-FE-001). Payload KHÔNG bao gồm panel snapshot — snapshot do BE tự động từ SO (BR-INS-STL-CRE-002).
- **RBAC**: Chỉ render màn với `accountant` / `garage-owner`. Route guard ở loader.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Mở màn Tạo phiếu QT

#### AC-1 → FE mở màn Tạo phiếu QT từ SO đã hoàn thành

- **Khi**: Người dùng click nút `"Tạo phiếu quyết toán"` từ màn chi tiết SO (trạng thái Hoàn thành).
- **FE phải**: Navigate đến route `/settlement/create?soCode={soCode}` (verify routeTree theo memory `garage-web-route-singular-vs-api-plural`). Loader prefetch context SO qua BFF query `getSettlementCreateContext(soCode)` — trả `soHasInsurance` flag + panel snapshot + line items theo payer.
- **State transition**: `idle → loading (skeleton toàn màn) → success (render form + panel) | error (toast + fallback)`.
- **Component**: `CreateSettlementPage.tsx` — MODIFY (baseline file).
- **GraphQL op**: `getSettlementCreateContext(soCode)` — NEED CONFIRMATION tên op chính xác trong BFF FEAT spec (pending BFF S5).
- **Label fixed**: `"Tạo phiếu quyết toán"` (button text trên SO detail trigger).
- **a11y**: Focus set vào tiêu đề màn khi navigate; không interrupt keyboard flow baseline.
- **Ref**: Figma spec §"## Screen: Chi tiết phiếu dịch vụ — Khách hàng doanh nghiệp — Có bảo hiểm (13535:157275)" (trigger context); FEAT v6 AC-1.

#### AC-8 → FE kiểm tra phân quyền trước khi render màn

- **Khi**: Route `/settlement/create` được truy cập.
- **FE phải**: Kiểm tra role user (`accountant` hoặc `garage-owner`). Nếu không có quyền → redirect về `/unauthorized` hoặc `/settlement`. KHÔNG render form rồi mới block.
- **State transition**: Guard chạy ở route loader trước render.
- **Component**: Route guard trong `settlement-routes.tsx`.
- **GraphQL op**: Dùng auth context hiện hữu (không cần op mới).
- **Label fixed**: `"Bạn không có quyền truy cập trang này."` (unauthorized page text).
- **a11y**: Redirect không cần announce thêm.
- **Ref**: Baseline RBAC pattern FEAT-STL-CREATE.

### Cluster B — Panel "Tổng giá dịch vụ" — hiển thị có điều kiện

#### AC-2 → FE render panel có điều kiện theo cờ soHasInsurance

- **Khi**: Data SO context đã load xong (`soHasInsurance` flag có mặt).
- **FE phải**:
  - Nếu `soHasInsurance === true` → render `<InsuranceSettlementDetail mode="full-insurance" data={panelSnapshot} />` (reuse component W01, thêm prop `mode`). 3 khối hiển thị đầy đủ + 2 cột BH|KH (A5 CR-20260616-02).
  - Nếu `soHasInsurance === false` → render `<InsuranceSettlementDetail mode="no-insurance" data={panelSnapshot} />`. 1 cột KH + bỏ "Phân bổ Bảo hiểm" + Cân thanh toán 2 dòng.
  - Panel KHÔNG ẩn hẳn — luôn hiện 1 trong 2 mode.
- **State transition**: Panel chỉ render sau khi query success; khi loading → skeleton placeholder cùng vị trí (3-block cho mode full, 2-block cho mode no-insurance).
- **Component**: `src/features/settlement/components/TotalServiceCostPanel.tsx` hoặc reuse `<InsuranceSettlementDetail>` W01 — REUSE/MODIFY (thêm prop `mode`, áp 2 cột CR-20260616-02). **Figma node `13535-157815` (panel scope) + `13535-159225` (full screen 2 cột — A5)**.
- **GraphQL op**: field `soHasInsurance: Boolean!` + `payerBreakdown` + `insuranceAllocation` + `paymentBalance` từ `getSettlementCreateContext`.
- **Label fixed**:
  - Panel heading: `"Tổng giá dịch vụ"`.
  - Section heading: `"Chi tiết theo bên thanh toán"`, `"Phân bổ Bảo hiểm"`, `"Cân thanh toán"`.
- **a11y**: Panel heading `<h3>` semantic; screen reader phân biệt 1-col / 2-col qua `aria-label`.
- **Ref**: BR-INS-STL-CRE-009; Figma spec §"### Section/TotalServicePanel"; FEAT v6 AC-2.

#### AC-3 → FE render khối "Chi tiết theo bên thanh toán"

- **Khi**: `soHasInsurance === true` (mode `full-insurance`) hoặc `false` (mode `no-insurance`).
- **FE phải**:
  - **Mode `full-insurance`**: render bảng 2 cột (`"Bảo hiểm thanh toán"` | `"Khách hàng thanh toán"`) với 4 dòng:
    - `"Dịch vụ"` — Σ công dịch vụ theo từng bên.
    - `"Phụ tùng"` — Σ thành tiền phụ tùng theo từng bên.
    - `"VAT"` — Σ thuế các dòng theo từng bên.
    - `"Cộng sau VAT"` — tổng (Dịch vụ + Phụ tùng + VAT) theo từng bên (bold, border-top, cơ sở tính phân bổ BH).
  - **Mode `no-insurance`**: render bảng **1 cột** `"Khách hàng thanh toán"` × 4 dòng tương tự (KHÔNG có cột BH).
  - Tất cả read-only — không có interaction.
- **State transition**: Static sau khi data load.
- **Component**: `<PayerBreakdownTable>` sub-component trong `<InsuranceSettlementDetail>`.
- **GraphQL op**: `getSettlementCreateContext.payerBreakdown` — shape `{ insurancePayer: { parts, labor, vatAmount }, customerPayer: { parts, labor, vatAmount } }`.
- **Label fixed**:
  - Header cột: `"Khoản mục"`, `"Bảo hiểm thanh toán"`, `"Khách hàng thanh toán"` (mode full); `"Khoản mục"`, `"Khách hàng thanh toán"` (mode no).
  - Row label: `"Dịch vụ"`, `"Phụ tùng"`, `"VAT"`, `"Cộng sau VAT"`.
- **a11y**: `<table>` semantic + `<th scope="col">` cho header + `aria-label="Chi tiết theo bên thanh toán"`.
- **Ref**: BR-INS-STL-CRE-009 điều kiện (a)/(b); FEAT v6 AC-3; Figma spec §"#### AC-3: Bảng 'Chi tiết theo bên thanh toán'".

#### AC-4 → FE render section "Phân bổ Bảo hiểm" — chỉ khi SO có BH

- **Khi**: `soHasInsurance === true` (mode `full-insurance` only).
- **FE phải**: Render section "Phân bổ Bảo hiểm" gồm **5 dòng** điều chỉnh với **dấu và màu** rõ ràng (FEAT v6 AC-4 + Figma spec). **A5 CR-20260616-02**: dóng thẳng 2 cột (BH | KH), mỗi khoản +/− render đúng cột.
  - **5 dòng**:
    1. `"CK liên kết BH — Vật tư"` — dấu `−`, **màu xanh** (`text-foreground-success` #16a34a hoặc `bg-brand-CD` #0052ff per Figma).
    2. `"CK liên kết BH — Công dịch vụ"` — dấu `−`, **màu xanh** (giảm "BH thanh toán", không chuyển sang KH).
    3. `"Giảm trừ bồi thường"` — dấu `+`, **màu đỏ** (`text-foreground-error` #dc2626) (chuyển sang KH).
    4. `"Khấu hao vật tư / thay mới"` — dấu `+`, **màu đỏ** (% khấu hao, chỉ áp dụng phụ tùng).
    5. `"Khấu trừ BH"` — dấu `+`, **màu đỏ**.
  - Khi `soHasInsurance === false` → KHÔNG render section này.
- **State transition**: Static, read-only.
- **Component**: `<InsuranceAllocationSection>` sub-component (reuse W01 `<InsuranceAllocationSummary>` — đăng ký KG).
- **GraphQL op**: `getSettlementCreateContext.insuranceAllocation` — array shape `[{ label: string, amount: number, sign: '+' | '-', payer: 'INSURANCE' | 'CUSTOMER' }]`.
- **Label fixed**: section heading `"Phân bổ Bảo hiểm"` + 5 row label như liệt kê trên.
- **a11y**: Section `<h4>` heading + `role="region"` + `aria-label="Phân bổ Bảo hiểm"`.
- **Ref**: BR-INS-STL-CRE-009 điều kiện (a); BR-INS-SO-ADJ-002/003/004/005 (display only); FEAT v6 AC-4; Figma spec §"#### AC-4: Bảng 'Phân bổ Bảo hiểm'".

#### AC-5 → FE render khối "Cân thanh toán" với highlight ô màu

- **Khi**: Data load xong — luôn render (cả 2 mode).
- **FE phải**:
  - **Mode `full-insurance`** → render **3 ô highlight** dọc/grid:
    - `"Bảo hiểm thanh toán"` — **ô xanh** (`bg-background-success` #dcfce7 oklch + label/value color `text-foreground-success` #16a34a).
    - `"Khách hàng thanh toán"` — **ô cam** (`bg-background-warning` #fff7ed + label/value color `text-foreground-warning` #ea580c).
    - `"Tổng thanh toán"` — **ô đen** (`bg-background` #ffffff + label/value color `text-foreground` #18181b, font weight=600).
  - **Mode `no-insurance`** → render **2 ô**: `"Khách hàng thanh toán"` (cam) + `"Tổng thanh toán"` (đen). KHÔNG có ô BH.
  - Mỗi ô: label `<dt>` (text-sm weight=500) + value `<dd>` formatted number (text-lg weight=600).
  - Padding mỗi ô: `12_16`, radius `rounded-lg`, border 1px solid (match BG variant).
- **State transition**: Static.
- **Component**: `<PaymentBalanceSection>` sub-component.
- **GraphQL op**: `getSettlementCreateContext.paymentBalance` — shape `{ insurancePayment?: number, customerPayment: number, total: number }`.
- **Label fixed**:
  - `"Bảo hiểm thanh toán"`, `"Khách hàng thanh toán"`, `"Tổng thanh toán"` (3 ô label).
- **a11y**: Dòng "Tổng thanh toán" dùng `<strong>` semantic + larger font; `<dl>` semantic cho cụm definition list.
- **Ref**: BR-INS-STL-CRE-009 (a)/(b); FEAT v6 AC-5; Figma spec §"#### AC-5: Khối 'Cân thanh toán'".

#### AC-6 → FE đảm bảo "Tổng tiền bảo hiểm trả" read-only computed

- **Khi**: Panel ở mode `full-insurance` — trường "Bảo hiểm thanh toán" trong khối "Cân thanh toán".
- **FE phải**: Render trường này dạng `<span>` semantic hoặc `<input readOnly disabled>` (ưu tiên `<span>` để tránh focus trap). Giá trị từ `paymentBalance.insurancePayment` (server-computed). KHÔNG cho user override.
- **Cross-reference baseline**: trường "Tổng tiền bảo hiểm trả" trên form baseline `FEAT-STL-CREATE` (mục "Bảo hiểm chi trả" — nhập tay theo AC-11 baseline). Khi SO có BH → trường này CHUYỂN read-only = computed = `paymentBalance.insurancePayment`. KHÔNG nhập tay. Trường "Tổng tiền khách trả" giữ hành vi baseline (BR-STL-CRE-005).
- **State transition**: Static. Không có edit event.
- **Component**: `<PaymentBalanceSection>` với prop `insurancePaymentReadOnly={true}` + cập nhật form baseline section "Bảo hiểm chi trả" để trường này render read-only.
- **GraphQL op**: Từ `getSettlementCreateContext.paymentBalance.insurancePayment`.
- **Label fixed**: `"Tổng tiền bảo hiểm trả"` (trường baseline) + `"Bảo hiểm thanh toán"` (ô panel).
- **a11y**: `aria-readonly="true"` nếu dùng input; nếu dùng span thì không cần.
- **Ref**: AC-6 giải quyết CNF-INS-001; BR-INS-STL-CRE-003; FEAT v6 AC-6.

#### AC-7 → FE trigger tạo phiếu QT — snapshot panel là BE responsibility

- **Khi**: Người dùng click `"Xác nhận"` tạo phiếu QT.
- **FE phải**: Invoke mutation `createInsuranceSettlement(input)` — payload KHÔNG bao gồm panel snapshot (snapshot do BE tự động từ SO — BR-INS-STL-CRE-002). FE chỉ truyền `serviceOrderCode` + các field form baseline (mã KH, mã xe, ghi chú…).
- **State transition**: `idle → loading (button disabled + spinner) → success (navigate đến chi tiết phiếu QT BH + toast) | error (toast theo error code §4.7)`.
- **Component**: Submit button trong `CreateSettlementPage.tsx`; mutation hook `useCreateInsuranceSettlement`.
- **GraphQL op**: `createInsuranceSettlement(input)` (mutation) — tên op canonical từ agg-garage-graph-graphql v7.7 (RESOLVED NC-W02-FEAT-STL-FE-001).
- **Label fixed**:
  - Submit button: `"Xác nhận"`.
  - Cancel button: `"Hủy"`.
  - Success toast: `"Tạo phiếu quyết toán thành công"`.
  - Error toast: `"Tạo phiếu quyết toán thất bại"`.
- **a11y**: Button `aria-label="Xác nhận tạo phiếu quyết toán"`; loading state `aria-busy="true"`.
- **Ref**: BE tier spec §8 (snapshot xảy ra server-side); BR-INS-STL-CRE-002 (snapshot immutable sau tạo); BR-INS-STL-CRE-004 (atomic pair); FEAT v6 AC-7; Figma spec §"### Section/Footer (Actions)".

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Panel "Tổng giá dịch vụ" bám Figma spec:
  - `13535-157815` (panel scope chính — màn Tạo QT, 3 frame variant).
  - `13535-159225` (Panel "Tổng giá dịch vụ" A5 2-cột — CR-20260616-02). **Đã add vào registry** `figma-links.yaml` waves["02"].FEAT-INS-STL-CREATE.web.screens (slug "fullscreen-a5") 2026-06-18; Figma spec generated tại `Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md`.
- **A5 CR-20260616-02 — tách 2 cột** (BH | KH) dọc theo "Chi tiết theo bên thanh toán" + "Phân bổ Bảo hiểm" + "Cân thanh toán" — số tiền dóng thẳng theo payer; dấu +/− đúng cột.
- **Color tokens cho "Cân thanh toán"** (Figma + FEAT AC-5):
  - Ô xanh BH: `bg-background-success` + `text-foreground-success` (#16a34a).
  - Ô cam KH: `bg-background-warning` (#fff7ed) + `text-foreground-warning` (#ea580c).
  - Ô đen Tổng: `bg-background` (#ffffff) + `text-foreground` (#18181b).
- **Dấu/màu 5 dòng "Phân bổ Bảo hiểm"** (Figma + FEAT AC-4):
  - 2 dòng "CK liên kết BH" — dấu `−`, màu xanh (giảm BH).
  - 3 dòng "Giảm trừ" / "Khấu hao" / "Khấu trừ BH" — dấu `+`, màu đỏ (chuyển sang KH).
- Design tokens từ `tailwind.config.js` / `src/index.css` — không hardcode hex/px.
- Panel rút gọn (mode `no-insurance`) KHÔNG ẩn hoàn toàn — vẫn hiển thị 1 cột KH + 2 ô Cân thanh toán.

### 4.2 State machine + error handling

- State tường minh: `idle | loading | success | error` cho query level + mutation level.
- Query `getSettlementCreateContext` fail → toast `"Không tải được dữ liệu phiếu dịch vụ. Vui lòng thử lại."` + cho phép retry (không block nút "Xác nhận" nếu form hợp lệ từ trước).
- Mutation `createInsuranceSettlement` fail → toast error theo error code §4.7. KHÔNG silent fail.
- Panel chỉ render ở trạng thái `success` của query; loading → skeleton; error → empty state + retry button.

### 4.3 Labels (fixed tiếng Việt — KHÔNG i18n)

> Quyết định 2026-06-18 (user request): toàn bộ label hardcode tiếng Việt inline. KHÔNG dùng `i18next`.

**Catalog label fixed**:

| Vị trí | Label tiếng Việt |
|---|---|
| Panel heading | `"Tổng giá dịch vụ"` |
| Section "Chi tiết theo bên thanh toán" heading | `"Chi tiết theo bên thanh toán"` |
| Header cột (mode full) | `"Khoản mục"`, `"Bảo hiểm thanh toán"`, `"Khách hàng thanh toán"` |
| Header cột (mode no-insurance) | `"Khoản mục"`, `"Khách hàng thanh toán"` |
| Row label section "Chi tiết theo bên thanh toán" | `"Dịch vụ"`, `"Phụ tùng"`, `"VAT"`, `"Cộng sau VAT"` |
| Section "Phân bổ Bảo hiểm" heading | `"Phân bổ Bảo hiểm"` |
| 5 dòng "Phân bổ Bảo hiểm" | `"CK liên kết BH — Vật tư"`, `"CK liên kết BH — Công dịch vụ"`, `"Giảm trừ bồi thường"`, `"Khấu hao vật tư / thay mới"`, `"Khấu trừ BH"` |
| Section "Cân thanh toán" heading | `"Cân thanh toán"` |
| 3 ô "Cân thanh toán" | `"Bảo hiểm thanh toán"`, `"Khách hàng thanh toán"`, `"Tổng thanh toán"` |
| Trường form baseline "Tổng tiền bảo hiểm trả" | `"Tổng tiền bảo hiểm trả"` (giữ baseline) |
| Submit button | `"Xác nhận"` |
| Cancel button | `"Hủy"` |
| Submit success toast | `"Tạo phiếu quyết toán thành công"` |
| Submit error toast | `"Tạo phiếu quyết toán thất bại"` |
| Query fail toast | `"Không tải được dữ liệu phiếu dịch vụ. Vui lòng thử lại."` |
| Atomic pair fail toast | `"Tạo cặp phiếu quyết toán thất bại. Vui lòng thử lại."` |
| Unauthorized | `"Bạn không có quyền truy cập trang này."` |

### 4.4 a11y

- Panel heading `<h3>` + `aria-label="Tổng giá dịch vụ"` semantic hierarchy.
- Table `role="table"`, `<th scope="col">` cho header cột (Bảo hiểm / Khách hàng).
- Section "Phân bổ Bảo hiểm" `role="region"` + `aria-label="Phân bổ Bảo hiểm"`.
- Dòng "Tổng thanh toán" dùng `<strong>` semantic + font-weight distinct.
- Read-only span có `aria-label` = label tương ứng — KHÔNG dùng `input disabled` (avoid focus trap).
- Submit button `aria-busy="true"` khi loading + `aria-label="Xác nhận tạo phiếu quyết toán"`.
- Form keyboard accessible (Enter trigger submit).
- Color contrast WCAG AA cho ô highlight (đặc biệt ô cam #ea580c trên bg #fff7ed).

### 4.5 RBAC render + feature flag

- Route guard: chỉ `accountant` và `garage-owner` được truy cập `/settlement/create`. Redirect về `/unauthorized` nếu thiếu role.
- Panel read-only không cần role riêng — cùng quyền tạo phiếu QT.
- Không thêm feature flag mới — extension baseline (BR-INS-STL-CRE-009).

### 4.6 Business rule secondary (UI hint)

| BR ID | Severity | UI behavior | Where | Touchpoint AC |
|---|---|---|---|---|
| `BR-INS-STL-CRE-009` | CORNERSTONE | Render panel mode `full-insurance` khi `soHasInsurance=true`; mode `no-insurance` khi false | `<InsuranceSettlementDetail mode={...} />` | AC-2 |
| `BR-INS-STL-CRE-003` | CORNERSTONE | "Tổng tiền BH trả" render read-only (không editable) | `<PaymentBalanceSection>` + form baseline trường "Tổng tiền bảo hiểm trả" | AC-6 |
| `BR-INS-STL-CRE-008` | CORNERSTONE | Disable nút "Xác nhận" hoặc inline error nếu server trả thiếu thông tin công ty BH | `CreateSettlementPage.tsx::submitGuard` | AC-8 (pre-condition từ FEAT-INS-SO-ADJUSTMENT) |
| `BR-INS-STL-CRE-004` | CORNERSTONE | Atomic pair: mutation fail → toast toàn bộ pair thất bại, KHÔNG partial success | `useCreateInsuranceSettlement.onError` | AC-7 |
| `BR-INS-STL-CRE-001` | NORMAL | Nếu SO loại "Bán phụ tùng" → không có route tạo QT BH (routing guard) | `settlement-routes.tsx` | AC-1 |
| `BR-INS-STL-CRE-002` | CORNERSTONE | Snapshot panel xảy ra server-side khi tạo phiếu QT — FE KHÔNG truyền panel data trong mutation input | `useCreateInsuranceSettlement` input shape | AC-7 |

> **Primary enforcement** = BE tier (`features/be/FEAT-INS-STL-CREATE.md §9`).

### 4.7 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Label fixed | Source AC |
|---|---|---|---|---|
| `ERR-INS-STL-001` (SO không đủ điều kiện tạo QT BH) | TOAST | `CreateSettlementPage.tsx` | `"Phiếu dịch vụ không đủ điều kiện tạo phiếu quyết toán bảo hiểm."` | AC-1 |
| `ERR-INS-STL-002` (thiếu thông tin công ty BH) | INLINE_ERROR | form section công ty BH | `"Thiếu thông tin công ty bảo hiểm. Vui lòng cập nhật trên Phiếu dịch vụ."` | AC-8 |
| `ERR-INS-STL-003` (atomic pair create fail) | TOAST | global toaster | `"Tạo cặp phiếu quyết toán thất bại. Vui lòng thử lại."` | AC-7 (BR-INS-STL-CRE-004) |
| `ERR-CMN-001` (query context fail) | TOAST + retry | `<InsuranceSettlementDetail>` | `"Không tải được dữ liệu phiếu dịch vụ. Vui lòng thử lại."` | AC-2 |
| `ERR-CMN-002` (mutation timeout) | TOAST | submit button area | `"Hệ thống chậm. Vui lòng thử lại."` | AC-7 |
| `ERR-CMN-NETWORK` | TOAST | global toaster | `"Không có kết nối. Vui lòng kiểm tra mạng và thử lại."` | AC-1, AC-7 |

> NEED CONFIRMATION: Mã lỗi chính xác từ BFF spec — bundle §G truncated. Verify khi BFF tier ACTIVE.

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node | AC ref |
|---|---|---|---|---|
| `CreateSettlementPage` | `/settlement/create` (baseline — verify routeTree theo memory `garage-web-route-singular-vs-api-plural`) | MODIFY (inject panel + loader update) | `13535-157815` (panel) + `13535-159225` (full screen 2 cột A5) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 |

### 5.2 Components new/modified

| Component | Path | Change type | Props thêm | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `InsuranceSettlementDetail` (component panel W01) | `src/components/customs/InsuranceSettlementDetail.tsx` hoặc `src/features/settlement/components/InsuranceSettlementDetail.tsx` (đăng ký KG W01 — verify location) | MODIFY (thêm prop `mode` + tách 2 cột A5) | `mode: "full-insurance" \| "no-insurance"` | **REUSE W01 baseline (priority `customs/` > `share/` > `ui/`) — KHÔNG dựng lại** | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `InsuranceAllocationSummary` (W01) | `src/components/customs/InsuranceAllocationSummary.tsx` hoặc `src/features/settlement/components/InsuranceAllocationSummary.tsx` (KG W01 — verify location) | MODIFY (tách 2 cột BH\|KH cho A5 nếu chưa có) | `splitByPayer: boolean` | REUSE W01 (priority `customs/` > `share/` > `ui/`) | AC-4 |
| `PayerBreakdownTable` (sub-component) | `src/features/settlement/components/PayerBreakdownTable.tsx` | MODIFY hoặc extract | `data: PayerBreakdown`, `showInsuranceCol: boolean` | Reuse/refactor | AC-3 |
| `PaymentBalanceSection` (sub-component) | `src/features/settlement/components/PaymentBalanceSection.tsx` | MODIFY | `mode`, `insurancePayment?: number`, `customerPayment: number`, `total: number`, `insurancePaymentReadOnly: true` | Reuse | AC-5, AC-6 |
| `CreateSettlementPage` | `src/features/settlement/pages/CreateSettlementPage.tsx` | MODIFY (inject panel + form trường "Tổng tiền bảo hiểm trả" read-only khi `soHasInsurance`) | — | Extend baseline | AC-1, AC-6, AC-7, AC-8 |

> **PKG v14 §2.0 A1 + §2.4 Bước 1 reuse-first — priority `customs/` > `share/` > `ui/`** (cập nhật 2026-06-18): trước MỌI UI task, scan codebase theo thứ tự ưu tiên — (1) `src/components/customs/` (domain-specific W01 — ưu tiên cao nhất; `<InsuranceSettlementDetail>` + `<InsuranceAllocationSummary>` thường đăng ký KG ở đây); (2) `src/components/share/` (cross-feature); (3) `src/components/ui/` (shadcn primitives — fallback). **KHÔNG dựng `TotalServiceCostPanel` mới nếu W01 đã có panel tương đương trong `customs/` — đăng ký KG xác nhận**. Nếu W01 KG chưa có component panel "Tổng giá dịch vụ" canonical → consult KG + cập nhật trước, KHÔNG silent dựng mới.

### 5.3 Design tokens

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `text-foreground` (#18181b) | `src/index.css` | body text mặc định, ô Tổng thanh toán | AC-3, AC-5 |
| `text-muted-foreground` (#71717a) | `src/index.css` | header cột, label phụ | AC-3 |
| `bg-background-success` + `text-foreground-success` (#16a34a) | `src/index.css` | ô "Bảo hiểm thanh toán" xanh + dấu `−` xanh | AC-4, AC-5 |
| `bg-background-warning` (#fff7ed) + `text-foreground-warning` (#ea580c) | `src/index.css` | ô "Khách hàng thanh toán" cam | AC-5 |
| `bg-background` (#ffffff) | `src/index.css` | ô "Tổng thanh toán" đen | AC-5 |
| `bg-background-error` / `text-foreground-error` (#dc2626) | `src/index.css` | dấu `+` đỏ trong "Phân bổ Bảo hiểm" + inline error | AC-4, AC-7, AC-8 |
| `border` / `border-input` (#e4e4e7) | `src/index.css` | bảng border + section divider | AC-2, AC-3 |
| `rounded-lg` (8px) | Tailwind | ô highlight Cân thanh toán radius | AC-5 |
| `grid-cols-2` (2 cột) | Tailwind | A5 reflow 2 cột panel | AC-2, AC-4, AC-5 |

> **Figma SSOT**: nodes `13535-157815` (panel page layout) + `13535-159225` (A5 panel 2-cột reflow). Figma specs: `Product/ux/figma-web/wave02-ins-stl-create--panel.md` + `Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md`.

---

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack key | AC ref |
|---|---|---|---|---|
| `getSettlementCreateContext` | query | `src/api/graphql/getSettlementCreateContext.graphql` | `['settlementCreateContext', soCode]` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |
| `createInsuranceSettlement` | mutation | `src/api/graphql/createInsuranceSettlement.graphql` | — (TanStack mutation) | AC-7 |

**Schema `getSettlementCreateContext` response**:
```graphql
type SettlementCreateContext {
  soCode: String!
  soHasInsurance: Boolean!         # cờ điều khiển mode panel (AC-2)
  payerBreakdown: PayerBreakdown!  # 2 cột BH/KH data (AC-3)
  insuranceAllocation: [AllocationItem!]!  # 5 khoản dấu +/- (AC-4, render khi soHasInsurance=true)
  paymentBalance: PaymentBalance!  # 3 ô Cân thanh toán (AC-5)
  # ... các field form baseline khác
}

type PayerBreakdown {
  insurancePayer: { parts: Float, labor: Float, vatAmount: Float, totalAfterVat: Float }
  customerPayer: { parts: Float, labor: Float, vatAmount: Float, totalAfterVat: Float }
}

type AllocationItem {
  label: String!         # vd "CK liên kết BH — Vật tư"
  amount: Float!         # số tiền tuyệt đối
  sign: String!          # "+" hoặc "-"
  payer: String!         # "INSURANCE" hoặc "CUSTOMER" — xác định cột nào
}

type PaymentBalance {
  insurancePayment: Float    # ô xanh BH (null khi soHasInsurance=false)
  customerPayment: Float!    # ô cam KH
  total: Float!              # ô đen Tổng
}
```

**Mutation `createInsuranceSettlement` input**:
```graphql
input CreateInsuranceSettlementInput {
  serviceOrderCode: String!
  # ... các field form baseline (mã KH, mã xe, ghi chú, các trường nhập tay khác)
  # KHÔNG bao gồm panel snapshot (BE auto-snapshot từ SO — BR-INS-STL-CRE-002)
}

type CreateInsuranceSettlementResponse {
  insuranceSettlement: Settlement!     # phiếu QT BH vừa tạo
  customerSettlement: Settlement!      # phiếu QT KH vừa tạo (atomic pair — BR-INS-STL-CRE-004)
}
```

> **Op `createInsuranceSettlement`**: RESOLVED (NC-W02-FEAT-STL-FE-001) — tên canonical từ agg-garage-graph-graphql v7.7.
> **Op `getSettlementCreateContext`**: NEED CONFIRMATION tên chính xác từ BFF tier spec — FE block S6.1 cho đến khi BFF S5 stable.

### 6.2 REST endpoints consumed direct

Không có — FE chỉ consume qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (panel data + context) | TanStack Query | — | `['settlementCreateContext', soCode]` | AC-2, AC-3, AC-4, AC-5, AC-6 |
| Form state (tạo QT baseline) | react-hook-form | local trong `CreateSettlementPage` | — | AC-7 |
| Mutation state | TanStack mutation | `useCreateInsuranceSettlement` | — | AC-7 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/settlement/create?soCode={soCode}` (baseline — verify routeTree) | `CreateSettlementPage` | `loader({ params }) => prefetch getSettlementCreateContext(soCode)` | RBAC: `accountant \| garage-owner` | AC-1, AC-8 |

---

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (Critical Rule #19).

| Layer | Path | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/settlement/pages/` | `CreateSettlementPage.tsx` | MODIFY (inject panel + loader update + form field read-only) | Extend baseline | ~40 | AC-1, AC-6, AC-7, AC-8 |
| `src/features/settlement/components/` | `InsuranceSettlementDetail.tsx` (W01) | MODIFY (thêm prop `mode` + reflow 2 cột A5) | **REUSE W01 baseline** | ~100 (incremental) | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `src/features/settlement/components/` | `InsuranceAllocationSummary.tsx` (W01) | MODIFY (tách 2 cột BH\|KH — A5) | REUSE W01 | ~60 (incremental) | AC-4 |
| `src/features/settlement/components/` | `PayerBreakdownTable.tsx` | MODIFY hoặc extract sub-component | Reuse/refactor | ~50 | AC-3 |
| `src/features/settlement/components/` | `PaymentBalanceSection.tsx` | MODIFY (3 ô highlight + insurancePaymentReadOnly prop) | Reuse | ~60 | AC-5, AC-6 |
| `src/features/settlement/hooks/` | `useCreateInsuranceSettlement.ts` | NEW | TanStack mutation wrapper | ~50 | AC-7 |
| `src/features/settlement/hooks/` | `useSettlementCreateContext.ts` | NEW | TanStack query wrapper | ~40 | AC-2..AC-6 |
| `src/api/graphql/` | `getSettlementCreateContext.graphql` | ADDITIVE hoặc MODIFY (thêm field `soHasInsurance` + `payerBreakdown` + `insuranceAllocation` + `paymentBalance`) | persisted query | ~30 | AC-2..AC-6 |
| `src/api/graphql/` | `createInsuranceSettlement.graphql` | ADDITIVE (nếu chưa có) | persisted query | ~20 | AC-7 |
| `src/api/generated/` | `*.generated.ts` | AUTO-GEN | graphql-codegen | — | — |
| `src/routes/` | `settlement-routes.tsx` | MODIFY (loader update + route guard) | TanStack Router | ~15 | AC-1, AC-8 |
| `tests/features/settlement/` | `InsuranceSettlementDetail.test.tsx` | NEW (test mode prop + 2 cột reflow) | Vitest + RTL | ~150 | AC-2..AC-6 |
| `tests/features/settlement/` | `CreateSettlementPage.test.tsx` | MODIFY (test loader + form + submit) | Vitest + RTL | ~50 | AC-1, AC-7, AC-8 |

> **i18n directory KHÔNG đụng** — quyết định 2026-06-18 hardcode VN labels.

---

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable + op names confirmed). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + `getSettlementCreateContext` + `createInsuranceSettlement` resolver stable)
(← Figma node 13535-157815 verified — ✅ Product/ux/figma-web/wave02-ins-stl-create--panel.md)
(← Figma node 13535-159225 — ✅ Đã add registry + prefetch Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md 2026-06-18)
(← W01 KG `implementation.components` verify panel "Tổng giá dịch vụ" canonical đăng ký)

S6-1  Cập nhật TanStack Router loader (CreateSettlementPage) — prefetch getSettlementCreateContext
      Entry: BFF op confirmed + route baseline stable
      Exit: loader trả data đúng shape

S6-2  Modify InsuranceSettlementDetail W01 — thêm prop `mode` + reflow 2 cột (CR-20260616-02)
      Entry: S6-1 done + Figma confirmed + W01 component KG verify
      Exit: Storybook / unit test coverage AC-2/3/4/5/6

S6-3  Wire form submit → createInsuranceSettlement mutation
      Entry: BFF mutation op confirmed
      Exit: mutation call đúng, response navigate đúng chi tiết phiếu QT BH

S6-4  Color tokens + a11y pass
      Entry: S6-2 done
      Exit: WCAG AA color contrast verify (đặc biệt ô cam #ea580c trên #fff7ed)

S6-5  E2E happy path (Playwright)
      Entry: S6-1/2/3/4 done + BE staging có data SO hoàn thành với BH
      Exit: E2E smoke green
      └─► hand-off QA E2E
```

| Step | Hành động | Layer | Depends |
|---|---|---|---|
| S6-1 | Loader update + route guard | routes + pages | BFF S5 |
| S6-2 | Panel component modify (mode + 2 cột A5) | components | S6-1 + Figma + W01 KG |
| S6-3 | Mutation hook + submit handler | hooks + pages | BFF S5 |
| S6-4 | Color tokens + a11y | tokens + markup | S6-2 |
| S6-5 | E2E smoke | tests/e2e | S6-1..4 |

---

## 9. Business Rules to enforce (FE — UI hint secondary)

Bảng BR liệt ở §4.6 trên — không lặp lại. Primary enforcement = BE tier.

---

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (route navigate + loader) | test-ui | Navigate từ SO detail, loader prefetch |
| AC-2 | UI (conditional render mode) | test-ui | `soHasInsurance=true` → 3 khối + 2 cột; `false` → rút gọn 1 cột |
| AC-3 | UI (table 2 cột vs 1 cột) | test-ui | Mock data BH+KH, verify column headers + row labels |
| AC-4 | UI (section hiển thị/ẩn + dấu/màu) | test-ui | `soHasInsurance=false` → KHÔNG render; assert 2 dòng CK liên kết BH dấu `−` xanh + 3 dòng còn lại dấu `+` đỏ |
| AC-5 | UI (3 ô vs 2 ô + màu highlight) | test-ui | Mode full → 3 ô (xanh/cam/đen); mode no → 2 ô (cam/đen); assert color token correct |
| AC-6 | UI (read-only enforce + form baseline trường) | test-ui | Verify không có editable input cho insurancePayment; form baseline "Tổng tiền bảo hiểm trả" disable khi soHasInsurance=true |
| AC-7 | UI (mutation + navigate atomic pair) | test-ui + test-e2e | Submit → navigate tới chi tiết phiếu QT BH; error → toast |
| AC-8 | UI (RBAC guard) | test-ui + test-isolation | Unauthorized role → redirect |
| (smoke) | E2E happy path | test-e2e | Playwright: SO BH hoàn thành → "Tạo phiếu QT" → màn xác nhận với panel 3 khối 2 cột → "Xác nhận" → pair created → navigate phiếu QT BH detail |

---

## 11. a11y (KHÔNG có §i18n)

§4.4 trên đã cover. Bảng cụ thể per-AC:

| AC | a11y requirement |
|---|---|
| AC-2 | Panel heading `<h3>` + `aria-label="Tổng giá dịch vụ"`; mode 1-col / 2-col phân biệt qua `aria-label` |
| AC-3 | Table `role="table"`, `<th scope="col">` cho Bảo hiểm / Khách hàng; `aria-label="Chi tiết theo bên thanh toán"` |
| AC-4 | Section `role="region"` + `aria-label="Phân bổ Bảo hiểm"`; dấu +/− có text alt (vd `aria-label="Cộng 1.000.000 đồng"`) |
| AC-5 | Dòng "Tổng thanh toán" dùng `<strong>` + font-weight distinct; `<dl>` semantic cho cụm |
| AC-6 | Read-only span có `aria-label` = label tương ứng — KHÔNG dùng `input disabled` (avoid focus trap) |
| AC-7 | Submit button `aria-busy="true"` khi loading + `aria-label="Xác nhận tạo phiếu quyết toán"` |
| AC-8 | Redirect không trigger announcement (single SPA nav) — TanStack Router built-in |

> **Color contrast WCAG AA verify** (S6-4): đặc biệt ô cam `#ea580c` trên `#fff7ed` + dấu `+` đỏ `#dc2626` trên bg trắng.

---

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-STL-CREATE.md` | NOT YET (pending) | BR primary enforcement, snapshot logic server-side (BR-INS-STL-CRE-003 + 002), atomic pair create (BR-INS-STL-CRE-004) |
| BFF | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-STL-CREATE.md` | NOT YET (pending) | GraphQL op names + SDL fragments — FE block S6 cho đến khi BFF S5 stable |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-STL-CREATE.md` | NOT YET (pending) | Mirror — Flutter Bloc, cùng panel logic 2 cột (A5 mobile responsive thu gọn label / wrap) |

**Source ID consistency**: `source_feat_sha = d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` — IDENTICAL cross-tier.

**Critical dependency**:
- `createInsuranceSettlement` RESOLVED (NC-W02-FEAT-STL-FE-001, agg-graphql v7.7).
- `getSettlementCreateContext` op name NEED CONFIRMATION từ BFF tier spec.
- W01 component panel "Tổng giá dịch vụ" canonical đăng ký KG verify (PKG §2.0 A1 explicit reuse-first).
- Figma node `13535-159225` (A5 panel 2 cột) — ✅ đã add registry + prefetch xong: `Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md`.

**Sau khi BFF spec ACTIVE**, FE dev chạy `graphql-codegen` để generate types.

---

## 13. References

- **Source**: [`Product/features/FEAT-INS-STL-CREATE.md`](../../../../../Product/features/FEAT-INS-STL-CREATE.md) v6
- **Figma spec**: [`Product/ux/figma-web/wave02-ins-stl-create--panel.md`](../../../../../Product/ux/figma-web/wave02-ins-stl-create--panel.md) (page layout) + [`Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md`](../../../../../Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md) (A5 panel reflow)
- **PKG**: [`Execution/work-packages/PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md) v13 §2.0 (Phase A) + §2.2 (slice 0) + §6.A (demo)
- **Paired BE**: [`features/be/FEAT-INS-STL-CREATE.md`](../be/FEAT-INS-STL-CREATE.md) (pending)
- **Paired BFF**: [`features/bff/FEAT-INS-STL-CREATE.md`](../bff/FEAT-INS-STL-CREATE.md) (pending)
- **Paired Mobile**: [`features/mobile/FEAT-INS-STL-CREATE.md`](../mobile/FEAT-INS-STL-CREATE.md) (pending)
- **BR source**: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` (BR-INS-STL-CRE-001..009)
- **Figma**: GMS-v.3 nodes `13535-157815` (panel) + `13535-159225` (full screen 2 cột A5) — base URL từ `Product/ux/figma/figma-links.yaml`
- **ADR-016 v11**: orchestrator pattern (dùng khi xuất hồ sơ Phase B — không phải scope A1)
- **CR-20260612-01**: panel chi tiết QT tách per-payer (FEAT-INS-STL-DETAIL scope — related)
- **CR-20260612-02**: popup hoàn thành SO cảnh báo BH âm (FEAT-INS-SO-ADJUSTMENT AC-17 scope — related)
- **CR-20260616-01**: template in QT + section "Phân bổ bảo hiểm" (BE/template scope — related)
- **CR-20260616-02**: panel 2 cột BH|KH — áp 3 màn SO Edit/Detail + Tạo QT — **scope A5 của file này**
- **Memory `garage-web-route-singular-vs-api-plural`**: verify route path với `routeTree.gen.ts`

---

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260612-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260612-01--ins-stl-detail-panel-split-by-payer) | Panel chi tiết QT tách per-payer | APPROVED | Panel chi tiết QT tách per-payer (share component với Tạo QT) |
| [CR-20260612-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260612-02--ins-so-complete-popup-negative-bh-warn) | Popup hoàn thành SO cảnh báo Tổng BH âm | APPROVED | Render warning line trong popup `ERR-INS-003` |
| [CR-20260616-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column) | Panel "Tổng giá dịch vụ" 2 cột (BH \| KH) | APPROVED | Layout 2 cột (BH \| KH) cho khối Phân bổ + Cân thanh toán |
| [CR-20260618-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all) | Sinh phiếu QT KH khi BH 100% + KH chịu phân bổ | APPROVED | Render phiếu QT KH "chỉ phân bổ BH" layout (3 khoản dấu +) |

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec. Scope A1: panel "Tổng giá dịch vụ" read-only Tạo phiếu QT. NEED CONFIRMATION: op names BFF + route + Figma base URL. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix #18c + #17: §1 byte-equal; đổi `createSettlementPair` → `createInsuranceSettlement`. Resolve NC-W02-FEAT-STL-FE-001. |
| 2026-06-18 | 5 | User request | **Resolve NEED CONFIRMATION node 13535:159225** (user request 2026-06-18 "hãy thêm vào"): Đã add node 13535:159225 vào registry `figma-links.yaml` waves["02"].FEAT-INS-STL-CREATE.web.screens — split mode 2 screens (slug "panel" cho 13535:157815 + slug "fullscreen-a5" cho 13535:159225). Existing figma spec `wave02-ins-stl-create.md` rename → `wave02-ins-stl-create--panel.md` (preserve content + assets). New figma spec `wave02-ins-stl-create--fullscreen-a5.md` generated với prefetch transform v6 (3 section-container PNG + _full.png). §13 References + §12 + §5.1 + §5.3 + §8 DAG entry gate + §0 Metadata Figma spec links update tới 2 files. KHÔNG đổi AC business / GraphQL contract / file paths / i18n policy. Đồng bộ PKG-W02 v15. |
| 2026-06-22 | 6 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 4 CR liên quan tier FE-web: CR-20260612-01, CR-20260612-02, CR-20260616-02, CR-20260618-01. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
| 2026-06-18 | 4 | User request | **Reuse priority update 2026-06-18 (later same day)** — đồng bộ PKG-W02 v14: §2 + §5.2 + §5.2 footer reuse-first đổi sang **priority `customs/` > `share/` > `ui/`** (PKG v14 §2.4 Bước 1 — `customs/` ưu tiên cao nhất domain-specific với `<InsuranceSettlementDetail>` + `<InsuranceAllocationSummary>` W01; `ui/` shadcn primitives fallback). Verify location của W01 components qua KG (có thể ở `customs/` hoặc `features/`). KHÔNG đổi AC business / GraphQL contract / file paths / i18n policy / Phase A scope. |
| 2026-06-18 | 3 | User request | **Realign hoàn toàn với PKG-W02 v13 §2.0 (Phase A 5 scope) + §2.2 (slice 0) + FEAT v6 + Figma spec wave02-ins-stl-create.md**. Major changes: **(a)** THÊM §0bis Phase A context — explicit liệt kê 5 scope items (A1-A5) + map FE Web ship A1 + A5 (file này) vs A2/A3/A4 related; **(b)** THÊM A5 CR-20260616-02 explicit — reflow panel 2 cột (BH|KH) trên 3 màn (SO Edit/Detail + Tạo QT) với Figma node `13535-159225` (chưa có registry — flag); **(c)** THÊM color tokens specifics cho khối "Cân thanh toán" (ô xanh `bg-background-success` BH / ô cam `bg-background-warning` KH / ô đen `bg-background` Tổng) + dấu/màu 5 dòng "Phân bổ Bảo hiểm" (CK liên kết BH dấu `−` xanh / 3 khoản còn lại dấu `+` đỏ) per FEAT v6 AC-4/5 + Figma; **(d)** SỬA reuse component policy — chỉ định **REUSE `<InsuranceSettlementDetail>` + `<InsuranceAllocationSummary>` W01** thay vì dựng `TotalServiceCostPanel` mới (per PKG §2.0 A1 explicit reuse-first); **(e)** SỬA component naming PascalCase giữ nguyên cho W01 components (do đã đăng ký KG), mới build kebab-case nếu cần extract; **(f)** GỠ HOÀN TOÀN i18n keys + namespace `settlement.panel.*` — hardcode fixed VN labels inline (user request 2026-06-18); §4.3 thay bằng catalog label fixed; (g) Thêm error code mapping với label fixed VN; (h) Section heading + row labels + 3 ô highlight Cân thanh toán + 5 dòng Phân bổ BH đều liệt label fixed catalog; (i) Verify route path `/settlement/create` (NEED CONFIRMATION qua memory `garage-web-route-singular-vs-api-plural` + `routeTree.gen.ts`). Status tier-authoritative READY khi BFF S5 stable + Figma `13535-159225` add registry. |
