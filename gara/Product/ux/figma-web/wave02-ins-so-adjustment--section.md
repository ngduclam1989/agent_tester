---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:469505"
screen_slug: section
fetched_at: 2026-06-23T04:51:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
related_specs:
  - Product/ux/figma-web/wave01-ins-so-adjustment--edit.md      # W01 SO Edit (panel editable)
  - Product/ux/figma-web/wave01-ins-so-adjustment--detail.md    # W01 SO Detail (panel view)
  - Product/ux/figma-web/wave02-ins-stl-create--panel.md         # Shared panel anatomy (CR-20260616-02 2-col)
  - Product/ux/figma-web/wave02-ins-so-adjustment--a5-so-edit.md       # W02 CR-20260616-02 A5 ref Edit
  - Product/ux/figma-web/wave02-ins-so-adjustment--a5-so-detail.md     # W02 CR-20260616-02 A5 ref Detail
coverage_gaps:
  - "SO-ADJUSTMENT trong W02 registry = CONTEXTUAL reference. Node 13257:469505 IDENTICAL với W01 — full edit anatomy đã spec ở wave01-ins-so-adjustment--edit.md (v6) + wave01-ins-so-adjustment--detail.md (v6). KHÔNG re-document chi tiết."
  - "W02 deltas vs W01 baseline = CR-20260616-02 áp panel 'Tổng giá dịch vụ' 2 cột (BH | KH) cho phần 'Phân bổ Bảo hiểm' + 'Cân thanh toán'. Áp dụng cả 2 màn (SO Edit + SO Detail) + STL-CREATE. Verify via 2 A5 specs sibling."
  - "Per user guidance 'spec modal only / overlay only' — KHÔNG document underlying SO page; CR delta = panel anatomy duplicate với wave02-ins-stl-create--panel.md."
  - "PaymentBalance design drift vs AC-5 FEAT-INS-STL-CREATE: AC-5 viết '3 dòng (BH ô xanh + KH ô cam + Tổng ô đen)' — design A5 PNG-verified (13354-57960 + 13354-58368) chỉ có 2 rows: 'Thanh toán' (2-col BH | KH dóng thẳng) + 'Tổng thanh toán' (blue bold 1-col). KHÔNG có bg-success/30 / bg-warning/30 tint. DEV theo PNG (2 rows + 2-col layout); spec đã reconcile §1/§3/§4/§7/§8/§VV consistent. Verify với BA nếu intended là 3 rows + colored bg per AC."
---

## Icon Catalog (shared)

Reuse từ [`wave01-ins-so-adjustment--edit.md`](./wave01-ins-so-adjustment--edit.md) Icon Catalog. CR-20260616-02 không thêm icon mới — chỉ thay đổi layout panel.

---

## Scope nhắc nhở — W02 SO-ADJUSTMENT--section = thin wrapper cho W02 CR-20260616-02 deltas

> **Spec này KHÔNG re-document màn SO Edit / SO Detail** đã spec đầy đủ ở [`wave01-ins-so-adjustment--edit.md`](./wave01-ins-so-adjustment--edit.md) + [`wave01-ins-so-adjustment--detail.md`](./wave01-ins-so-adjustment--detail.md) (v6).
>
> **DEV W02 đọc**:
> 1. `wave01-ins-so-adjustment--{edit,detail}.md` cho full screen anatomy
> 2. Spec này §1-§9 cho W02 **delta** (CR-20260616-02 panel layout 2 cột BH|KH)
> 3. `wave02-ins-stl-create--panel.md` cho shared panel anatomy (panel "Tổng giá dịch vụ" — same component reused across SO Edit / SO Detail / STL Create)
> 4. `wave02-ins-so-adjustment--{a5-so-edit,a5-so-detail}.md` cho A5 portrait reference frames (Business design review)

---

## Screen: SO-ADJUSTMENT — W02 INTEGRATION POINTS ONLY (13257:469505)

> Same Figma node W01 → full SO Edit + SO Detail page anatomy (AC-1..AC-14). W02 spec này focus 1 integration point: CR-20260616-02 panel "Tổng giá dịch vụ" 2-cột layout.

### §0 ASCII Mockup — W02 delta only

```
┌─ SO Edit / SO Detail page (W01 baseline anatomy giữ nguyên) ──────────────────┐
│  ← #PDV-20260326-00639  [Đang xử lý]                                          │
│   (W01 spec edit/detail screens unchanged)                                    │
│ ─────────────────────────────────────────────────────────────────────────── │
│  ┌─ AC-1..AC-8 SO form (W01 baseline) ──────────────────────────────────┐   │
│  │ Customer info / Vehicle info / Service items / Parts items / etc.    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─ AC-9..AC-11 panel "Tổng giá dịch vụ" (CR-20260616-02 2-cột) ────────┐   │
│  │  Title "Tổng giá dịch vụ"                                              │   │ ← W02 delta
│  │   Chi tiết theo bên thanh toán (table 3-col: Khoản mục | BH | KH)     │   │
│  │   Phân bổ Bảo hiểm (5 rows × 2 numeric cols — CR-20260616-02 mới)     │   │ ← W02 delta
│  │   Cần thanh toán (2 rows: Thanh toán 2-col BH|KH + Tổng thanh toán blue bold) │ ← W02 delta (PNG-verified)
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL — W02 delta only

```yaml
# ── CR-20260616-02 delta: panel "Tổng giá dịch vụ" 2-col layout ──────────────
TotalServicePricePanel:               # extend wave01-ins-so-adjustment--edit.md / --detail.md panel
  $ref: "wave02-ins-stl-create--panel.md::TotalServicePricePanel"
  context: "SO Edit / SO Detail view"
  payerSplit: dual-column              # CR-20260616-02 — gộp 2 cột BH | KH (KHÔNG per-payer)
  mode: editable                       # SO Edit: editable adjustments
                                       # SO Detail: read-only view
  layout:
    BreakdownByPayerTable:
      columns: 3                       # Khoản mục | BH | KH
    InsuranceAllocationTable:
      visible: true                    # luôn show 5 rows × 2 numeric cols (BH delta | KH delta)
      rows: 5                          # CK Vật tư / CK Công DV / Giảm trừ bồi thường / Khấu hao / Khấu trừ BH
    PaymentBalance:
      rows: 2                          # PNG-verified: row "Thanh toán" (2-col BH|KH dóng thẳng) + row "Tổng thanh toán" (blue bold)
      _design_state: |
        Design A5 PNG (13354-57960 + 13354-58368 + wave02-ins-stl-create/13535-159225_fullscreen-a5)
        capture 2 rows visible: "Thanh toán" với 2 cột giá trị (50.000.000đ BH | 0đ KH) dóng thẳng theo column header
        từ section "Chi tiết theo bên thanh toán" — KHÔNG có bg-success/30 (BH) hoặc bg-warning/30 (KH) tint.
        "Tổng thanh toán" row riêng với value blue (#0052ff) bold right-aligned dưới cùng.
      _spec_drift_note: |
        AC-5 FEAT-INS-STL-CREATE viết "3 dòng (BH ô xanh + KH ô cam + Total ô đen)" — design hiện hành SIMPLIFY
        thành 2 rows + 2-col layout (per-payer dóng thẳng theo column header thay vì row-highlight).
        DEV theo PNG (2 rows + 2-col); verify với Business Authority nếu intended là 3 rows + colored bg per AC.
  difference_from_w01:
    w01_layout: "Khối 'Phân bổ Bảo hiểm' + 'Cân thanh toán' = 1 cột (chỉ 1 giá trị aggregate per row)"
    w02_layout: "Khối 'Phân bổ Bảo hiểm' = 5 rows × 2 numeric cols (BH delta | KH delta) + Khối 'Cân thanh toán' = 2 rows (Thanh toán 2-col + Tổng thanh toán 1-col blue bold)"
    rationale: "Hỗ trợ kế toán đối chiếu phân bổ per-payer trực quan; số liệu display-only (computed server-side)"
```

### §2 Design Token Map — W02 deltas

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §2 (shared panel tokens). W02 không thêm token unique vs STL-CREATE panel.

### §3 State Table — W02 deltas

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `TotalServicePricePanel` | SO Edit mode | `mode=editable` — 5 allocation rows có inputs (per W01 baseline) | route = SO Edit |
| `TotalServicePricePanel` | SO Detail mode | `mode=view` — 5 allocation rows read-only display | route = SO Detail |
| `InsuranceAllocationTable` | CR-20260616-02 layout | 2 cols (bhDelta | khDelta) thay vì 1 col (W01) | always sau CR-20260616-02 APPROVED |
| `PaymentBalance` | CR-20260616-02 PNG-verified layout | 2 rows total: "Thanh toán" (2-col BH|KH dóng thẳng) + "Tổng thanh toán" (blue bold 1-col right) — KHÔNG có bg-success/bg-warning tint per design | always sau CR-20260616-02 APPROVED |
| Other states (AC-1..AC-8 form) | giữ W01 baseline | n/a | unchanged |

### §4 Component Prop Map — W02 deltas

| Component | Layer | Prop | W01 baseline | W02 override | Lý do |
|---|---|---|---|---|---|
| `TotalServicePricePanel` (shared) | customs/insurance | `payerSplit` | `single-column` (W01 panel chỉ 1 numeric col) | `dual-column` (CR-20260616-02 BH \| KH) | Hỗ trợ đối chiếu per-payer |
| `InsuranceAllocationTable` | — | `columnsCount` | 1 (just bhDelta hoặc khDelta) | 2 (bhDelta + khDelta) | CR-20260616-02 |
| `PaymentBalance` | — | `rowsCount` | 2 (W01: Aggregate "Thanh toán" + Total) | 2 (W02 PNG-verified: "Thanh toán" 2-col BH|KH + Total 1-col blue) | CR-20260616-02 changes COLUMN structure within "Thanh toán" row (1-col → 2-col), KHÔNG add row |
| `PaymentBalance.ThanhToanRow` | — | `columnLayout` | 1-col (Aggregate value) | 2-col (BH | KH dóng thẳng theo column header) | CR-20260616-02 — đối chiếu per-payer trực quan |
| `TotalServicePricePanel` | — | `mode` | depends on screen (editable in SO Edit, view in SO Detail) | giữ baseline | mode per route, không thay đổi by CR |

### §5 Field Composition Schema — W02 deltas

Same data binding shape as wave02-ins-stl-create--panel.md (`insuranceAdjustment` block). W02 không yêu cầu field mới.

```yaml
data_binding:
  query: GetServiceOrderDetail | UpdateServiceOrderAdjustments  # baseline FEAT-INS-SO-ADJUSTMENT §4
  response_shape:
    insuranceAdjustment:               # same as STL-CREATE — computed server-side per BR-INS-SO-ADJ-003
      breakdownByPayer: { service, parts, vat, totalAfterVat }
      adjustments: { ckLinkedParts, ckLinkedService, compensationReduction, depreciation, deductible }   # 5 rows
      settlementBalance: { bhPayment, customerPayment, totalPayment }
  mode_per_route:
    SO_Edit: "editable — adjustments accept user input (excluding totalAfterVat which is computed)"
    SO_Detail: "read-only view"
```

### §6 Layout Width Table — W02 deltas

Reuse W01 layout widths (page container + form layout unchanged). W02 chỉ ảnh hưởng panel inner layout:

| Container | Width | Notes |
|---|---|---|
| Panel "Tổng giá dịch vụ" (right column) | 600 FIXED (giữ W01) | container width unchanged |
| Inner InsuranceAllocationTable | FILL 600 | 2 cols (200 + 200) = 400 + label flex-1 = 600 |
| Inner PaymentBalance rows | FILL 600 | each row label flex-1 + value 200 right-aligned |

### §7 Visual Hierarchy Map — W02 deltas

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L3 | InsuranceAllocation rows BH delta | text-sm/400 + sign color (per AC-4 theory: − xanh) | Per-payer adjustment (BH side); per PNG = black, drift flagged |
| L3 | InsuranceAllocation rows KH delta | text-sm/400 + sign color (per AC-4 theory: + đỏ) | Per-payer adjustment (KH side); per PNG = black, drift flagged |
| L3 | PaymentBalance "Thanh toán" row | 2-col layout: text-sm/500 label + text-sm/600 BH value + text-sm/600 KH value (right-aligned mỗi col) | Per-payer payment row (CR-20260616-02 — 2 cột thay vì 1) |
| L3 | PaymentBalance "Tổng thanh toán" row | text-sm/600 label + text-lg/700 text-primary blue value right-aligned | Final total row (giữ W01 visual emphasis) |

### §8 Anti-Pattern Trap — W02 deltas

| # | Trap | Triệu chứng | Đúng |
|---|---|---|---|
| AP-W02-SO-1 | **Giữ W01 panel 1-col cho SO Edit/Detail sau CR-20260616-02** | Panel chỉ show 1 cột aggregate, không tách per-payer | Apply `payerSplit: dual-column` sau CR APPROVED |
| AP-W02-SO-2 | **Apply per-payer split (CR-20260612-01) cho SO Edit/Detail** | Nhầm CR-20260612-01 (STL-DETAIL only) với CR-20260616-02 (SO + STL-CREATE) → SO panel chỉ 1 cột | CR-20260612-01 ONLY applies to chi tiết phiếu QT (STL-DETAIL); CR-20260616-02 = SO Edit/Detail + STL-CREATE = dual-column |
| AP-W02-SO-3 | **PaymentBalance render 1-col aggregate (W01 baseline) thay vì 2-col per-payer (W02)** | Sau CR-20260616-02 vẫn render "Thanh toán" 1-col aggregate | Render row "Thanh toán" với 2 cột (BH | KH) dóng thẳng theo column header section "Chi tiết theo bên thanh toán"; KHÔNG add 3rd row + KHÔNG apply bg-success/30 hoặc bg-warning/30 tint (design KHÔNG có per PNG-verified 2026-06-23). AC-5 FEAT-INS-STL-CREATE viết "3 rows + colored" — design simplify thành 2-col; verify với BA. |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-so-adjustment/_full.png             # 1140×1600 — overview multi-state composition (4 frames scaled from 4837×6822)
  pngs_read:
    - assets/wave02-ins-so-adjustment/_full.png             # 1140×1600 — overview multi-state composition (4 frames scaled from 4837×6822)
    - assets/wave02-ins-so-adjustment/13354-57960_a5-edit.png     # A5 panel Edit reference
    - assets/wave02-ins-so-adjustment/13354-58368_a5-detail.png   # A5 panel Detail reference
  claims_verified:
    - claim: "Node 13257:469505 = same Figma node W01 — full SO page composition with multiple state frames horizontally arranged (visible 4 columns in 4837×6822 source — multiple state captures)"
      evidence: "_full.png — scaled 1140×1600; 4 distinct column-like screens visible (Edit / Detail / variants)"
    - claim: "A5 references (a5-so-edit + a5-so-detail) show SAME panel layout = identical to wave02-ins-stl-create--fullscreen-a5 → CR-20260616-02 panel anatomy shared across 3 contexts"
      evidence: "13354-57960_a5-edit.png + 13354-58368_a5-detail.png — pixel-identical với wave02-ins-stl-create/13535-159225_fullscreen-a5.png"
    - claim: "Panel anatomy = 3 sections (Chi tiết theo bên thanh toán 3-col + Phân bổ Bảo hiểm 5×2 + Cần thanh toán 2 rows visible với Tổng blue)"
      evidence: "A5 references — confirm composition; full panel anatomy documented in wave02-ins-stl-create--panel.md state A"
```

### §9 Container Hierarchy (legacy — W02 deltas only)

```
SO Edit / SO Detail page (W01 baseline) [vertical]
└── (full anatomy in wave01-ins-so-adjustment--{edit,detail}.md)
    └── ✨ Panel "Tổng giá dịch vụ" (CR-20260616-02 dual-column)
        └── (delegate to wave02-ins-stl-create--panel.md state A anatomy)
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-so-adjustment/_full.png` | section 13257:469505 (4837×6822 → 1140×1600 scaled) | Multi-state overview |
| `assets/wave02-ins-so-adjustment/13354-57960_a5-edit.png` | A5 SO Edit panel ref (1212×816) | CR-20260616-02 panel evidence |
| `assets/wave02-ins-so-adjustment/13354-58368_a5-detail.png` | A5 SO Detail panel ref (1212×816) | CR-20260616-02 panel evidence |
