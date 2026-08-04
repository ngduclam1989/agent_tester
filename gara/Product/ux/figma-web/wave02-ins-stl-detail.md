---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13255:177002"
fetched_at: 2026-06-23T04:48:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 4
related_specs:
  - Product/ux/figma-web/wave01-ins-stl-detail.md      # W01 baseline spec v6 — full 4-screen anatomy
  - Product/ux/figma-web/wave02-ins-dossier-view.md    # W02 tab "Hồ sơ BH đã xuất" extension
  - Product/ux/figma-web/wave02-ins-dossier-create.md  # W02 modal "Tạo hồ sơ BH" trigger từ header
  - Product/ux/figma-web/wave02-ins-stl-create--panel.md  # Panel "Tổng giá dịch vụ" share component
coverage_gaps:
  - "STL-DETAIL trong W02 registry = CONTEXTUAL reference cho W02 cross-link (DOSSIER-CREATE/VIEW + CR-20260612-01 panel tách per-payer). Node 13255:177002 IDENTICAL với W01 entry."
  - "Spec full 4-screen anatomy (AC-1..AC-13) đã có ở wave01-ins-stl-detail.md (v6). W02 spec này CHỈ document deltas/W02 integration points + reference W01 cho chi tiết."
  - "W02 deltas vs W01 baseline: (a) CR-20260612-01 panel chi tiết QT tách per-payer (BH chỉ 1 cột BH; KH có section 'Phân bổ Bảo hiểm' 3 khoản dấu +); (b) AC-13 nút '+ Tạo hồ sơ bảo hiểm' header gate by payer=INSURANCE; (c) Tab thứ 3 'Hồ sơ bảo hiểm đã xuất' (FEAT-INS-DOSSIER-VIEW)."
  - "DEV W02 KHÔNG re-implement STL-DETAIL — extend existing wave01 implementation với (a) panel per-payer logic (FE conditional theo settlement.payer) + (b) accordion tab #3 thêm vào tab navigation + (c) header CTA button '+ Tạo hồ sơ bảo hiểm' gated. CR-20260612-01 áp dụng SHARED component panel 'Tổng giá dịch vụ' — cập nhật prop `payerSplit` to 'per-payer' khi route từ STL-DETAIL."
---

## Icon Catalog (shared)

Reuse từ [`wave01-ins-stl-detail.md`](./wave01-ins-stl-detail.md) Icon Catalog. W02 thêm:

| Figma layer | npm package | Variant prop | Notes |
|---|---|---|---|
| (no new icons — header CTA "+ Tạo hồ sơ bảo hiểm" reuse `Plus`/`Add` from wave01 baseline) | iconsax-reactjs `Add` Linear hoặc lucide-react `Plus` | Linear | Used in header action bar; gate visibility per payer |

---

## Scope nhắc nhở — W02 STL-DETAIL = thin wrapper cho W02 deltas

> **Spec này KHÔNG re-document 4 screens STL-DETAIL** đã spec đầy đủ ở [`wave01-ins-stl-detail.md`](./wave01-ins-stl-detail.md) (v6, ~500 lines). 
>
> **DEV W02 đọc**:
> 1. `wave01-ins-stl-detail.md` cho 4 screens anatomy (Chi tiết phiếu QT BH — tab "Bảng chi phí" / "Chứng từ & hoá đơn" / "Hồ sơ bảo hiểm đã xuất" / "Lịch sử thanh toán")
> 2. Spec này §1-§9 cho W02 **deltas** (CR-20260612-01 panel tách per-payer + nút CTA + tab #3 integration)
> 3. `wave02-ins-dossier-view.md` cho chi tiết tab "Hồ sơ bảo hiểm đã xuất" content
> 4. `wave02-ins-dossier-create.md` cho modal mở từ nút "+ Tạo hồ sơ bảo hiểm"
> 5. `wave02-ins-stl-create--panel.md` cho shared panel "Tổng giá dịch vụ" component (CR-20260612-01 per-payer mode khi route từ STL-DETAIL)
>
> **Source-of-truth structural** = wave01-ins-stl-detail.md. W02 chỉ extend ở 3 điểm: (a) panel per-payer mode, (b) header CTA gating, (c) tab #3.

---

## Screen: Chi tiết phiếu QT BH — W02 INTEGRATION POINTS ONLY (13255:177002)

> Same node W01 → same 4 screens (tab "Bảng chi phí" default + 3 other tabs). W02 spec này focus 3 integration points; full screen anatomy ở [`wave01-ins-stl-detail.md`](./wave01-ins-stl-detail.md).

### §0 ASCII Mockup — W02 integration points only

```
┌─ Chi tiết phiếu QT BH ─────────────────────────────────────────────────────┐
│  ← #SET-20260326-00001  [Chờ thanh toán]                                    │
│                          [Chỉnh sửa] [Xuất hồ sơ BH (PDF)] [+ Tạo hồ sơ BH] │ ← AC-13 nút W02 — gate by payer
│                                                              ↑                │
│                                                              W02 entry point  │
│ ─ Thông tin quyết toán + KH&xe (baseline AC-1..AC-3 W01) ─────────────────── │
│                                                                              │
│   [Bảng chi phí]  [Chứng từ & hóa đơn]  [Hồ sơ BH đã xuất]  [Lịch sử TT]    │ ← Tab #3 W02 (DOSSIER-VIEW)
│ ─────────────────────────────────────────  ▲ gate by payer=INSURANCE         │
│                                                                              │
│   Tab "Bảng chi phí" (active default) — AC-4 W01:                            │
│     ┌─ AC-5 bảng hạng mục (W01 anatomy giữ nguyên) ─────────────────┐       │
│     │ STT │ Nội dung │ ĐVT │ SL │ Đơn giá │ Thành tiền               │       │
│     │  …                                                              │       │
│     └────────────────────────────────────────────────────────────────┘       │
│     ┌─ AC-6 panel "Tổng giá dịch vụ" (CR-20260612-01 per-payer) ────┐       │
│     │ Phiếu QT BH = 1 cột "Bảo hiểm thanh toán" only                 │       │ ← W02 CR delta
│     │   (drop cột "Khách hàng thanh toán" + "Phân bổ Bảo hiểm")      │       │
│     │ Phiếu QT KH = 1 cột "Khách hàng thanh toán" + section          │       │
│     │   "Phân bổ Bảo hiểm" (3 khoản dấu +, ẨN 2 khoản CK liên kết)   │       │
│     └────────────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL — W02 deltas only

```yaml
# ── Delta 1: Header action bar — nút "+ Tạo hồ sơ bảo hiểm" gated ────────────
HeaderActionBar:                     # extend wave01-ins-stl-detail.md AC-1 right-group
  $ref: "wave01-ins-stl-detail.md::HeaderActionBar"
  add_children:
    - id: CreateDossierButton        # AC-13 W02 — entry point cho DOSSIER-CREATE modal
      type: Button
      variant: brand                  # primary blue per design
      size: lg
      icon_leading: { source: iconsax-reactjs, name: Add, variant: Linear, size: 16, color: white }
      label: "+ Tạo hồ sơ bảo hiểm"
      visible_when: "settlement.payer === 'INSURANCE'"   # BR-INS-STL-DET-007
      enabled_always: true            # gate CHỈ theo payer, KHÔNG theo trạng thái phiếu (no DRAFT in UI)
      on_click: "openDossierCreateModal({ settlementId: settlement.id })"  # → wave02-ins-dossier-create.md modal

# ── Delta 2: Tab navigation — tab #3 "Hồ sơ bảo hiểm đã xuất" ────────────────
TabNavigation:                       # extend wave01-ins-stl-detail.md AC-4 tab list
  $ref: "wave01-ins-stl-detail.md::TabNavigation"
  tabs:                               # W01 baseline = 3 tabs (Bảng chi phí + Chứng từ + Lịch sử TT)
    - { id: cost-table, label: "Bảng chi phí", default: true }                # W01 baseline
    - { id: documents, label: "Chứng từ & hóa đơn" }                          # W01 baseline
    - { id: insurance-dossier, label: "Hồ sơ bảo hiểm đã xuất",               # W02 NEW (FEAT-INS-DOSSIER-VIEW)
        visible_when: "settlement.payer === 'INSURANCE'" }                    # BR-INS-DOSSIER-VIEW-008
    - { id: payment-history, label: "Lịch sử thanh toán" }                    # W01 baseline
  default_tab: cost-table
  url_param: "?tab={tab.id}"          # TanStack Router param pattern

# ── Delta 3: AC-6 panel "Tổng giá dịch vụ" — CR-20260612-01 per-payer ─────────
TotalServicePricePanel:              # SHARED component — extend wave02-ins-stl-create--panel.md
  $ref: "wave02-ins-stl-create--panel.md::TotalServicePricePanel"
  context: "STL-DETAIL view (read-only post-snapshot)"
  payerSplit: per-payer               # CR-20260612-01 OVERRIDE — khác với màn Tạo QT (giữ dual-column)
  variants:
    - id: panel_phieuQT_BH            # khi xem chi tiết phiếu QT BH
      condition: "settlement.payer === 'INSURANCE'"
      layout:
        BreakdownByPayerTable.columns: 
          # CR-20260612-01: BỎ cột "Khách hàng thanh toán", chỉ giữ "Bảo hiểm thanh toán"
          - { key: itemName, label: "Khoản mục", flex: 1 }
          - { key: bhPayment, label: "Bảo hiểm thanh toán", width: 200, format: vnd }
        InsuranceAllocationTable: { visible: false }   # CR-20260612-01: BỎ section trong phiếu BH
        PaymentBalance: 
          rows:
            - { label: "Bảo hiểm thanh toán", value: "{settlementBalance.bhPayment}", style: bg-background-success/30 }
            - { label: "Tổng thanh toán", value: "{settlementBalance.totalPayment}", style: bold blue }
    - id: panel_phieuQT_KH            # khi xem chi tiết phiếu QT KH (từ SO có BH)
      condition: "settlement.payer === 'CUSTOMER' && relatedInsuranceSettlement != null"
      layout:
        BreakdownByPayerTable.columns:
          # CR-20260612-01: BỎ cột "Bảo hiểm thanh toán", chỉ giữ "Khách hàng thanh toán"
          - { key: itemName, label: "Khoản mục", flex: 1 }
          - { key: khPayment, label: "Khách hàng thanh toán", width: 200, format: vnd }
        InsuranceAllocationTable:
          visible: true
          rows:
            # CR-20260612-01: PHIẾU KH chỉ 3 khoản dấu + (chuyển KH); 2 khoản CK liên kết BH ẨN
            - { label: "Giảm trừ bồi thường",  bhDelta: hidden, khDelta: "{adjustments.compensationReduction.kh}", sign_color: error_red }
            - { label: "Khấu hao vật tư / thay mới", bhDelta: hidden, khDelta: "{adjustments.depreciation.kh}", sign_color: error_red }
            - { label: "Khấu trừ BH",          bhDelta: hidden, khDelta: "{adjustments.deductible.kh}", sign_color: error_red }
            # ⚠️ CK liên kết BH — Vật tư + CK liên kết BH — Công dịch vụ = ẨN trong phiếu KH (chốt 2026-06-16)
        PaymentBalance:
          rows:
            - { label: "Khách hàng thanh toán", value: "{settlementBalance.customerPayment}", style: bg-background-warning/30 }
            - { label: "Tổng thanh toán", value: "{settlementBalance.totalPayment}", style: bold blue }
    - id: panel_phieuQT_KH_no_BH      # khi xem chi tiết phiếu QT KH (từ SO không BH) — baseline W01
      condition: "settlement.payer === 'CUSTOMER' && relatedInsuranceSettlement == null"
      $ref: "wave01-ins-stl-detail.md::TotalServicePricePanel"   # giữ W01 baseline anatomy
```

### §2 Design Token Map — W02 deltas

Reuse [`wave01-ins-stl-detail.md`](./wave01-ins-stl-detail.md) tokens. W02 thêm:

| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `bg-brand` / `bg-primary` | `bg-brand` | `#0052ff` | "+ Tạo hồ sơ bảo hiểm" CTA button (W02 AC-13) |
| `bg-background-success/30` | — | `#f0fdf4` light | PaymentBalance row "Bảo hiểm thanh toán" highlight (per-payer panel BH) |
| `bg-background-warning/30` | — | `#fff7ed` light | PaymentBalance row "Khách hàng thanh toán" highlight (per-payer panel KH) |
| `text-foreground-error` | — | `#dc2626` oklch | Số dương "+" trong panel KH 3 khoản (AC-4 sign color) |

### §3 State Table — W02 deltas

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `CreateDossierButton` (header) | hidden | display:none | `settlement.payer !== 'INSURANCE'` |
| `CreateDossierButton` | visible enabled | bg-brand text-white | `settlement.payer === 'INSURANCE'` |
| `CreateDossierButton` | loading (after click → modal opening) | + spinner | `dossierModal.isOpening` |
| `Tab insurance-dossier` | hidden | tabs.filter out | `settlement.payer !== 'INSURANCE'` |
| `Tab insurance-dossier` | visible inactive | text-muted-foreground hover:text-foreground | default render khi `payer === INSURANCE` |
| `Tab insurance-dossier` | active | border-bottom-2 border-primary text-foreground font-medium | URL `?tab=insurance-dossier` |
| `TotalServicePricePanel` | per-payer BH | drop khPayment col + hide AllocationTable + 1-row balance | `payer === INSURANCE` |
| `TotalServicePricePanel` | per-payer KH (with related BH) | drop bhPayment col + show AllocationTable 3 rows + 2-row balance | `payer === CUSTOMER && relatedInsuranceSettlement != null` |
| `TotalServicePricePanel` | baseline KH (no BH) | W01 baseline 1-col (Khách hàng) + 2-row balance | `payer === CUSTOMER && relatedInsuranceSettlement == null` |

### §4 Component Prop Map — W02 deltas

| Component | Layer | Prop | Default (W01) | Override (W02) | Lý do |
|---|---|---|---|---|---|
| `TotalServicePricePanel` (shared) | customs/insurance | `payerSplit` | `dual-column` (gộp BH+KH) | `per-payer` (CR-20260612-01) | Chỉ áp khi route từ STL-DETAIL (NOT STL-CREATE) |
| `CreateDossierButton` (new) | share/buttons | n/a (mới W02) | — | `variant: brand, size: lg, icon: Add` | AC-13 entry CTA cho DOSSIER-CREATE |
| `TabNavigation` | share/tabs | `tabs` | 3 W01 tabs | + insurance-dossier conditional | W02 thêm tab #3 (DOSSIER-VIEW) |
| Tab insurance-dossier content | — | `content` | — | inline tab panel = `<InsuranceDossierTab settlementId={settlement.id} />` | Load FEAT-INS-DOSSIER-VIEW component |

### §5 Field Composition Schema — W02 integration

```yaml
data_extensions_vs_w01:
  GetSettlementDetail.response:        # extend W01 baseline query
    settlement:
      # ... W01 baseline fields (id, code, payer, status, customer, vehicle, items, etc.)
      payer: enum                      # 'INSURANCE' | 'CUSTOMER' — W01 already returns; W02 gate tab #3 + CTA on this
      relatedInsuranceSettlement:      # W02 NEW — populated khi viewing phiếu QT KH có cặp BH
        id: ID
        code: string
        # used by per-payer panel to detect "KH có phân bổ BH" mode
    insuranceAdjustment:               # W02 ensure populated for per-payer panel (CR-20260612-01)
      # ... per wave02-ins-stl-create--panel.md §5 (breakdownByPayer + adjustments + settlementBalance)

action_bindings:
  CreateDossierButton.on_click:
    args: { settlementId: "{settlement.id}", initialVersion: "{dossiers.maxVersion + 1}" }
    target: openDossierCreateModal     # → wave02-ins-dossier-create.md modal
  TabSwitch_insurance-dossier:
    on_change: "router.navigate('?tab=insurance-dossier')"
    query: "ListInsuranceDossierSets({ settlementId, limit: 5, offset: 0 })"   # FEAT-INS-DOSSIER-VIEW query
```

### §6 Layout Width Table — W02 deltas

Reuse W01 layout widths. W02 changes:

| Container | Width | Notes |
|---|---|---|
| HeaderActionBar | FILL (1216) | + CreateDossierButton (size lg = h-10 px-6) — verify total width fit |
| TabNavigation | FILL (1216) | + 1 tab item (insurance-dossier) khi visible — distribute equally |
| TotalServicePricePanel | 600 FIXED (giữ W01) | per-payer chỉ ảnh hưởng columns/rows inner, KHÔNG container width |

### §7 Visual Hierarchy Map — W02 deltas

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 (action) | CreateDossierButton "+ Tạo hồ sơ bảo hiểm" | bg-brand text-primary-foreground | Primary CTA (W02 entry to DOSSIER-CREATE flow) |
| L1 (nav) | Tab "Hồ sơ bảo hiểm đã xuất" (W02 #3) | text-sm/500 active text-primary border-b-2 | Section tab nav — W02 addition |
| L3 (panel content per-payer) | Panel column "Bảo hiểm thanh toán" only (phiếu BH) | text-sm/500 + numeric right-aligned | Per-payer simplified table |
| L3 (panel content per-payer KH) | Panel section "Phân bổ Bảo hiểm" 3 rows | text-sm/400 + sign color text-foreground-error red "+" | Per-payer KH allocation (3 khoản chuyển KH) |

### §8 Anti-Pattern Trap — W02 deltas

| # | Trap | Triệu chứng | Đúng |
|---|---|---|---|
| AP-W02-1 | **CreateDossierButton render trên phiếu QT KH** | Nút "+ Tạo hồ sơ bảo hiểm" hiển thị trên phiếu KH → user click → mở modal cho KH? sai | `visible_when: payer === 'INSURANCE'` — gate tại Header action bar |
| AP-W02-2 | **Tab insurance-dossier render cho phiếu QT KH** | Tab #3 hiện trên phiếu KH → 4 tabs thay vì 3 (W01 baseline) | `tabs.filter(t => t.id !== 'insurance-dossier' \|\| payer === 'INSURANCE')` — gate ở level tab config |
| AP-W02-3 | **Apply per-payer panel cho màn Tạo QT (STL-CREATE)** | CR-20260612-01 chỉ áp STL-DETAIL; STL-CREATE giữ dual-column | Pass `payerSplit="dual-column"` khi render từ STL-CREATE; `"per-payer"` chỉ khi từ STL-DETAIL (verify NEED CONFIRMATION FEAT-INS-STL-CREATE §5 v6 với BA) |
| AP-W02-4 | **Phiếu KH per-payer show all 5 allocation rows (gồm CK liên kết BH)** | Sau CR-20260612-01 chốt 2026-06-16: CK liên kết BH (Vật tư + Công DV) PHẢI ẨN trong phiếu KH | Filter `adjustments` keys: phiếu KH chỉ render `compensationReduction + depreciation + deductible` (3 khoản) |
| AP-W02-5 | **Tab #3 active state KHÔNG persist trong URL** | User refresh trang → mất context tab → quay về default tab "Bảng chi phí" | TanStack Router `?tab={id}` param + restore from URL on mount |
| AP-W02-6 | **CreateDossierButton variant=outline thay vì brand** | UI mất emphasis cho primary CTA | `variant: brand` (bg-#0052ff) per design — KHÔNG outline secondary |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-stl-detail/_full.png             # 2400×812 — overview multi-state composition
  pngs_read:
    - assets/wave02-ins-stl-detail/_full.png             # 2400×812 — overview multi-state composition
    - assets/wave02-ins-dossier-view/13257-481064.png    # cross-ref Tab #3 content
    - assets/wave02-ins-dossier-view/13257-481725.png    # cross-ref Tab #3 empty
  claims_verified:
    - claim: "Node 13255:177002 = same Figma node W01 — full screen composition with multiple state frames horizontally arranged (4 frames visible in 9407×3126 source — width = 4 viewport widths)"
      evidence: "_full.png — scaled to 2400×812; visible 4 column-like screens depicting different states (tab states + payer variants)"
    - claim: "Header action bar có nút thêm '+ Tạo hồ sơ bảo hiểm' (W02 AC-13) — primary blue button right of header"
      evidence: "_full.png — header rows show primary blue button in action group (consistent với design AC-13 spec)"
    - claim: "Tab bar 4 tabs (W02 with payer=INSURANCE) — tab thứ 3 'Hồ sơ bảo hiểm đã xuất' visible"
      evidence: "_full.png — tab navigation row shows 4 tab items"
    - claim: "Panel 'Tổng giá dịch vụ' per-payer (CR-20260612-01) visible trong các state frames — BH chỉ 1 cột BH, KH chỉ 1 cột KH + section 'Phân bổ Bảo hiểm' 3 khoản"
      evidence: "_full.png + cross-ref wave01-ins-stl-detail.md baseline panel; W02 spec encodes per-payer override"
    - claim: "Cross-ref evidence: Tab #3 content matches wave02-ins-dossier-view.md spec (3 dossier sets + grid 2×2 PDF cards) + empty state"
      evidence: "wave02-ins-dossier-view/13257-481064.png + 13257-481725.png — DOSSIER-VIEW spec validated separately"
```

### §9 Container Hierarchy (legacy — W02 deltas only)

```
PageContainer (1280) [vertical]
└── Container (1216) [vertical, gap=32]
    ├── ### Nhóm A — Header & thông tin chung
    │   ├── AC-1 Header phiếu QT BH + thanh hành động (1216×80) [horizontal, justify-between]
    │   │   ├── Left: back + #SET-... + status badge (W01 baseline)
    │   │   └── Right group [horizontal, gap=12]:
    │   │       ├── Chỉnh sửa (W01 baseline)
    │   │       ├── Xuất hồ sơ BH (PDF) (W01 baseline)
    │   │       └── ✨ + Tạo hồ sơ bảo hiểm (W02 AC-13 — gate by payer)
    │   ├── AC-2 Thông tin quyết toán (W01 baseline)
    │   └── AC-3 Thông tin KH&xe (W01 baseline)
    └── ### Nhóm B — Tabs & content
        ├── AC-4 Tab navigation:
        │   ├── Bảng chi phí (W01 baseline default)
        │   ├── Chứng từ & hóa đơn (W01 baseline)
        │   ├── ✨ Hồ sơ bảo hiểm đã xuất (W02 — FEAT-INS-DOSSIER-VIEW, gate by payer)
        │   └── Lịch sử thanh toán (W01 baseline)
        └── Tab content (per active tab):
            ├── Bảng chi phí tab content:
            │   ├── AC-5 bảng hạng mục (W01 baseline anatomy)
            │   └── ✨ AC-6 panel "Tổng giá dịch vụ" — CR-20260612-01 per-payer
            │       └── (delegate to wave02-ins-stl-create--panel.md anatomy + per-payer override)
            ├── Chứng từ & hoá đơn (W01 baseline)
            ├── ✨ Hồ sơ bảo hiểm đã xuất (W02 — delegate to wave02-ins-dossier-view.md)
            └── Lịch sử thanh toán (W01 baseline)
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-stl-detail/_full.png` | section 13255:177002 (9407×3126 → 2400×812 scaled) | Multi-state overview (composition) |

> **Cross-ref evidence**: full screen-by-screen details documented in wave01-ins-stl-detail.md (4 screens v6). W02 deltas validated against wave02-ins-dossier-view.md (Tab #3) + wave02-ins-stl-create--panel.md (shared panel component, per-payer override).
