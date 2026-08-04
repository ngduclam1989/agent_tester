---
feat: FEAT-INS-STL-CREATE
feat_file: Product/features/FEAT-INS-STL-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-157815&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13535:157815"
screen_slug: panel
fetched_at: 2026-06-23T04:36:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
coverage_gaps:
  - "AC-4 'dấu và màu rõ ràng' (− xanh / + đỏ) — design KHÔNG show màu phân biệt; tất cả giá trị black, dấu +/− text-prefix duy nhất. DEV theo AC: + đỏ (#dc2626/text-foreground-error) / − xanh (#16a34a/text-foreground-success). Verify Business Authority."
  - "AC-5 'Cân thanh toán' 3 dòng (BH ô xanh / KH ô cam / Tổng ô đen) — design state-A chỉ show 2 dòng ('Thanh toán' single + 'Tổng thanh toán' blue), KHÔNG có ô màu BH/KH riêng. DEV theo AC implement 3 dòng với highlights theo bên thanh toán. Design layout có thể đã đơn giản hóa cho state minh hoạ — verify."
  - "Header bảng 'Cân thanh toán' — design dùng 'Cần thanh toán' (Cần = need) thay vì 'Cân' (Cân = balance) per AC-5/FEAT. DEV theo design label hiển thị (chốt PO 2026-06-02 trong wave01-ins-stl-detail spec)."
  - "AC-2 + BR-INS-STL-CRE-009: panel có 2 state (SO có BH = 3 sections | SO không BH = 2 sections + 1 col KH). Cả 2 state captured trong 2 screen riêng (13692:113072 + 13545:91244)."
  - "CR-20260612-01 NEED CONFIRMATION (FEAT §5 v6): màn Tạo phiếu QT có áp 'tách per-payer' (như chi tiết QT) không, hay giữ gộp 2 cột? Design hiện = gộp 2 cột (BH | KH). Spec emit theo design hiện hành."
  - "CR-20260616-02 áp panel: tách 'Phân bổ Bảo hiểm' + 'Cân thanh toán' từ 1 cột → 2 cột — design state-A đã 2 cột rõ ràng. ✓"
  - "Demo data column 'Cộng sau VAT' = 50.000 (BH) thay vì tổng 95.040+95.040+95.040=285.120 → có thể minh hoạ logic = max(BH actual paid). Verify với data binding server-side; spec doc theo BR-INS-STL-CRE-003 (server-side computed)."
---

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes |
|---|---|---|---|
| (no inline icons within panel) | — | — | Panel toàn text + table; icon nằm ở Page Header phía trên (xem wave01 baseline) |

> Garage web: panel này KHÔNG có icon nội tại. Icon Edit2/Settings/Refresh nếu cần đặt ở header màn (baseline FEAT-STL-CREATE — không thuộc scope CR).

---

## Scope nhắc nhở — đây là CR mở rộng FEAT-STL-CREATE

> **Spec này chỉ document panel MỚI "Tổng giá dịch vụ"** (cột phải, w-[600px], read-only) trên màn Tạo phiếu quyết toán (Xác nhận tạo QT). Navbar / Page Header / form "Khách hàng chi trả" + "Bảo hiểm chi trả" + trường "Tổng tiền khách trả/bảo hiểm trả" + nút "Hủy/Xác nhận" thuộc baseline `FEAT-STL-CREATE` production — DEV PHẢI đọc FEAT-STL-CREATE.md trước. Spec này CHỈ define panel mới (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) + integration point cho AC-6 (trường "Tổng tiền bảo hiểm trả" chuyển read-only = computed bind từ AC-5 "Bảo hiểm thanh toán").
>
> CR liên quan: **CR-20260612-01** (NEED CONFIRMATION tách per-payer cho màn tạo) + **CR-20260616-02** (2 cột BH|KH) + **CR-20260618-01** (sinh phiếu QT KH khi BH 100% + KH chịu phân bổ — affects logic upstream, không layout panel). Reuse component panel "Tổng giá dịch vụ" của FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL (same anatomy, khác read-only/editable mode).

---

## Screen: Panel "Tổng giá dịch vụ" — state A: SO CÓ BẢO HIỂM (13692:113072)

> Panel right-column 600×764 trên màn Tạo phiếu QT khi `serviceOrder.hasInsurance === true`. 3 sections vertical: Chi tiết theo bên thanh toán (table 3-col) + Phân bổ Bảo hiểm (5-row × 2-col) + Cần thanh toán (3 row highlight). Read-only — snapshot từ phân bổ SO (`FEAT-INS-SO-ADJUSTMENT` AC-9..11), KHÔNG cho nhập/sửa.

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────┐
│  Tổng giá dịch vụ                                            │ ← title L1 18/600
│ ──────────────────────────────────────────────────────────── │
│  Chi tiết theo bên thanh toán                                │ ← section header L2 14/600
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Khoản mục          │ Bảo hiểm thanh toán │ Khách hàng tt│ │ ← header row bg-accent
│ │────────────────────│─────────────────────│──────────────│ │
│ │ Dịch vụ            │              95.040đ│           0đ │ │
│ │ Phụ tùng           │              95.040đ│      95.040đ │ │
│ │ VAT                │              95.040đ│      95.040đ │ │
│ │ Cộng sau VAT       │              50.000đ│      95.040đ │ │ ← bold
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  Phân bổ Bảo hiểm                                            │ ← section header L2
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ CK liên kết BH — Vật tư           │      0đ│         0đ  │ │
│ │ CK liên kết BH — Công dịch vụ     │ −50.000│         0đ  │ │ ← dấu − (xanh per AC, đen theo design)
│ │ Giảm trừ bồi thường               │ −50.000│   +50.000   │ │ ← dấu − BH / + KH
│ │ Khấu hao vật tư / thay mới        │ −50.000│   +50.000   │ │
│ │ Khấu trừ BH                       │ −95.040│   +50.000   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  Cần thanh toán                                              │ ← AC-5 "Cân"→"Cần" design label
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Thanh toán                        │ 50.000.000│       0đ│ │ ← AC-5 spec 3 rows (BH ô xanh / KH ô cam) — design show 2 rows only
│ │ Tổng thanh toán                                          │ │
│ │                                                50.000.000│ │ ← bold blue #0052ff right-aligned
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
  ↑ panel container w=600 h=hug (~764 px theo demo data)
```

### §1 Layout DSL

```yaml
TotalServicePricePanel:
  type: container
  direction: vertical
  gap: 24                              # gap-6 giữa sections
  padding: 0                           # panel parent inherit card surface
  bg: bg-transparent
  width: 600                           # FIXED 600px (right column màn Tạo QT)
  flex-grow: 0
  children:
    - id: PanelTitle
      type: Text
      content: "Tổng giá dịch vụ"
      size: 18
      weight: 600
      line_height: 28
      color: text-foreground            # #18181b
      flex-grow: 0

    - id: BreakdownByPayerTable
      $ref: AC9_BreakdownTable

    - id: InsuranceAllocationTable        # state A — visible_when SO có BH
      $ref: AC10_InsuranceAllocation
      visible_when: "serviceOrder.hasInsurance === true"

    - id: PaymentBalanceBlock
      $ref: AC5_PaymentBalance

# ─────────────────────────────────────────────────────────────
AC9_BreakdownTable:                  # AC-3 (FEAT) / AC-9 (Figma layer)
  type: Table
  title: "Chi tiết theo bên thanh toán"
  title_props: { size: 14, weight: 600, color: text-foreground, mb: 8 }
  columns:                            # 3 cols (state A); state B = 2 cols (drop bhPayment)
    - { key: itemName, label: "Khoản mục", flex: 1, align: left }
    - { key: bhPayment, label: "Bảo hiểm thanh toán", width: 180, align: right, format: vnd, visible_when: "hasInsurance" }
    - { key: khPayment, label: "Khách hàng thanh toán", width: 180, align: right, format: vnd }
  header_props:
    bg: bg-accent                     # bg-muted/light grey
    color: text-foreground
    size: 14
    weight: 500
  rows:                               # data-bound; static row order
    - { itemName: "Dịch vụ",        bhPayment: "services.bh",   khPayment: "services.kh" }
    - { itemName: "Phụ tùng",       bhPayment: "parts.bh",      khPayment: "parts.kh" }
    - { itemName: "VAT",            bhPayment: "vat.bh",        khPayment: "vat.kh" }
    - { itemName: "Cộng sau VAT",   bhPayment: "totalAfterVat.bh", khPayment: "totalAfterVat.kh", emphasis: bold }
  row_props:
    border_bottom: "1px solid border-input"
    padding: { y: 16, x: 16 }
  data_source: "breakdownByPayer"     # FEAT §4 BFF query

# ─────────────────────────────────────────────────────────────
AC10_InsuranceAllocation:             # AC-4 (FEAT) — only when hasInsurance
  type: Table
  title: "Phân bổ Bảo hiểm"
  title_props: { size: 14, weight: 600, color: text-foreground, mb: 8 }
  columns:                            # 2 cols cho BH | KH (CR-20260616-02)
    - { key: itemName, label: "", flex: 1, align: left }
    - { key: bhDelta, label: "", width: 180, align: right, format: signed_vnd }
    - { key: khDelta, label: "", width: 180, align: right, format: signed_vnd }
  header_props:
    visible: false                    # design không có header row riêng cho section này (label đã ở title)
  rows:                               # 5 khoản (BR-EP-INSURANCE-SETTLEMENT §7)
    - { itemName: "CK liên kết BH — Vật tư",        bhDelta: "ckLinkedParts.bh",       khDelta: "ckLinkedParts.kh",    sign_color: { neg: success_green, pos: error_red } }
    - { itemName: "CK liên kết BH — Công dịch vụ",  bhDelta: "ckLinkedService.bh",     khDelta: "ckLinkedService.kh",  sign_color: { neg: success_green, pos: error_red } }
    - { itemName: "Giảm trừ bồi thường",            bhDelta: "compensationReduction.bh", khDelta: "compensationReduction.kh", sign_color: { neg: success_green, pos: error_red } }
    - { itemName: "Khấu hao vật tư / thay mới",     bhDelta: "depreciation.bh",        khDelta: "depreciation.kh",     sign_color: { neg: success_green, pos: error_red } }
    - { itemName: "Khấu trừ BH",                    bhDelta: "deductible.bh",          khDelta: "deductible.kh",       sign_color: { neg: success_green, pos: error_red } }
  data_source: "adjustments"           # FEAT §4 BFF query
  _note: "AC-4 yêu cầu '+ đỏ / − xanh' theo dấu. Design hiện chỉ render dấu text-prefix, không màu — DEV apply token text-foreground-error (đỏ) cho +, text-foreground-success (xanh) cho − theo AC."

# ─────────────────────────────────────────────────────────────
AC5_PaymentBalance:                   # AC-5 (FEAT) Cân/Cần thanh toán
  type: container
  direction: vertical
  gap: 8
  children:
    - id: PaymentBalanceTitle
      type: Text
      content: "Cần thanh toán"        # ⚠️ DEV theo design label ("Cần" not "Cân") per coverage_gaps
      size: 14
      weight: 600
      color: text-foreground

    - id: BalanceRow_Insurance        # AC-5 row 1 — "Bảo hiểm thanh toán" (ô xanh per AC)
      type: container
      direction: horizontal
      justify: between
      align: center
      padding: { y: 16, x: 16 }
      bg: bg-background-success/30    # AC-5 "ô xanh" override (design state-A simplified to single row 'Thanh toán'; per AC-5 implement 3 rows)
      children:
        - { type: Text, content: "Bảo hiểm thanh toán", size: 14, weight: 500 }
        - { type: Text, content: "{settlementBalance.bhPayment}", size: 14, weight: 600, format: vnd, color: text-foreground }

    - id: BalanceRow_Customer         # AC-5 row 2 — "Khách hàng thanh toán" (ô cam)
      type: container
      direction: horizontal
      justify: between
      align: center
      padding: { y: 16, x: 16 }
      bg: bg-background-warning/30    # AC-5 "ô cam"
      children:
        - { type: Text, content: "Khách hàng thanh toán", size: 14, weight: 500 }
        - { type: Text, content: "{settlementBalance.customerPayment}", size: 14, weight: 600, format: vnd }

    - id: BalanceRow_Total            # AC-5 row 3 — "Tổng thanh toán" (ô đen + blue per design)
      type: container
      direction: horizontal
      justify: between
      align: center
      padding: { y: 16, x: 16 }
      border_top: "1px solid border-input"
      children:
        - { type: Text, content: "Tổng thanh toán", size: 14, weight: 600 }
        - { type: Text, content: "{settlementBalance.totalPayment}", size: 18, weight: 700, format: vnd, color: text-primary }   # design dùng blue #0052ff cho total
```

### §2 Design Token Map

| Token (Figma) | Tailwind (garage-web) | Hex | Khi dùng |
|---|---|---|---|
| `base/foreground` | `text-foreground` | `#18181b` | Title, section header, body text |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | (NA panel này, dùng cho hint text) |
| `base/accent` | `bg-accent` | `#f4f4f5` | Header row bảng Chi tiết theo bên thanh toán |
| `base/border` | `border-input` | `#e4e4e7` | Border cell + divider |
| `base/background` | `bg-background` | `#ffffff` | Panel surface |
| `base/foreground-success` | `text-foreground-success` | `#16a34a` | Số âm BH ("−50.000") per AC-4 |
| `base/foreground-error` | `text-foreground-error` | `#dc2626` (oklch) | Số dương KH ("+50.000") per AC-4 |
| `base/background-success` | `bg-background-success/30` | `#f0fdf4` | AC-5 "Bảo hiểm thanh toán" ô xanh nhạt |
| `base/background-warning` | `bg-background-warning/30` | `#fff7ed` | AC-5 "Khách hàng thanh toán" ô cam nhạt |
| `base/foreground-brand-CD` / `text-primary` | `text-primary` | `#0052ff` | "Tổng thanh toán" value (blue) |
| `font/weight/semibold` | `font-semibold` | `600` | Title, section header, "Cộng sau VAT" |
| `font/weight/medium` | `font-medium` | `500` | Cell label "Bảo hiểm/Khách hàng thanh toán" |
| `font/weight/bold` | `font-bold` | `700` | "Tổng thanh toán" value emphasis |
| `typography/large/font-size+lh` | `text-lg leading-7` | `18/28` | Panel title, Total value |
| `typography/small/font-size+lh` | `text-sm leading-5` | `14/20` | Body cell, section header |
| `spacing/6` | `gap-6` | `24px` | gap dọc giữa sections |
| `spacing/4` | `p-4`/`py-4` | `16px` | row padding |
| `spacing/2` | `gap-2` / `mb-2` | `8px` | gap title↔table |

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `TotalServicePricePanel` | full (state A) | Render 3 children (Breakdown + Allocation + Balance 3 rows) | `serviceOrder.hasInsurance === true` |
| `TotalServicePricePanel` | reduced (state B) | Render 2 children (Breakdown 1-col + Balance 2 rows); hide AllocationTable | `serviceOrder.hasInsurance === false` |
| `AC9_BreakdownTable.bhPayment column` | hidden | `display:none` (drop column) | state B |
| `AC10_InsuranceAllocation` | hidden | `display:none` (drop entire section) | state B |
| `AC5_PaymentBalance.BalanceRow_Insurance` | hidden | drop row | state B |
| Cell value (negative) | rendered red | `text-foreground-success` (xanh per AC-4 cho dấu −) | value < 0 in AC-10 |
| Cell value (positive sign in allocation) | rendered red | `text-foreground-error` (đỏ per AC-4 cho dấu +) | value > 0 in AC-10 |
| Whole panel | read-only | KHÔNG có form input, checkbox, button trong panel | luôn |
| Trigger "Tổng tiền bảo hiểm trả" (baseline AC-6) | read-only | + `disabled bg-muted` | state A — value bind = `settlementBalance.bhPayment` computed |
| Trigger "Tổng tiền bảo hiểm trả" | editable (baseline) | giữ baseline | state B (SO không BH — không có phiếu QT BH để tính) |

### §4 Component Prop Map

> Layer priority `customs > share > ui`. Panel "Tổng giá dịch vụ" được **reuse** từ FEAT-INS-SO-ADJUSTMENT (màn SO) + FEAT-INS-STL-DETAIL (màn chi tiết QT). Khác biệt duy nhất ở màn Tạo QT: **read-only** (snapshot, không editable).

| Component | Layer | Prop | Default (SO/STL-DETAIL) | Override (STL-CREATE) | Lý do |
|---|---|---|---|---|---|
| `TotalServicePricePanel` (shared) | customs/insurance hoặc share/panel | `mode` | `editable` (SO) / `view` (STL-DETAIL) | `snapshot` | Tạo QT là read-only snapshot, KHÔNG cho sửa adjustment tại màn này |
| `TotalServicePricePanel` | — | `payerSplit` | `dual-column` (SO + STL-CREATE) hoặc `per-payer` (STL-DETAIL post-CR-20260612-01) | `dual-column` (BH \| KH) | CR-20260612-01 chỉ áp chi tiết QT; màn Tạo giữ gộp 2 cột (NEED CONFIRMATION — verify nếu BA chốt tách) |
| `BreakdownTable` (sub) | share/tables | `columns.bhPayment.visible` | `true` | `hasInsurance` | drop cột BH khi state B |
| `InsuranceAllocationTable` (sub) | — | `visible` | `true` | `hasInsurance` | hide entire section khi state B |
| `PaymentBalance` (sub) | — | `rows` | 3 (BH + KH + Total) | giữ 3 rows | AC-5 mandate (design state A chỉ show 2 — đây là spec drift) |
| `Currency` (`format: vnd`) | share/format | output | `1.000.000đ` | giữ default | demo data theo `de-DE`/`vi-VN` separator |

### §5 Field Composition Schema

> Panel **read-only** — KHÔNG có form field input. Schema dưới chỉ document **data binding** (snapshot từ server-side computed BFF response).

```yaml
data_binding:
  query: PrepareCreateSettlement     # reuse query tải snapshot SO baseline (FEAT §4)
  args:
    serviceOrderId: "{currentSO.id}"
  response_shape:
    insuranceAdjustment:              # FEAT §4
      breakdownByPayer:
        service: { bh: number, kh: number }   # → row "Dịch vụ"
        parts: { bh: number, kh: number }     # → row "Phụ tùng"
        vat: { bh: number, kh: number }       # → row "VAT"
        totalAfterVat: { bh: number, kh: number }  # → row "Cộng sau VAT" (bold)
      adjustments:                    # → 5 rows section "Phân bổ Bảo hiểm"
        ckLinkedParts: { bh: number, kh: number }   # CK liên kết BH — Vật tư
        ckLinkedService: { bh: number, kh: number } # CK liên kết BH — Công dịch vụ
        compensationReduction: { bh: number, kh: number }   # Giảm trừ bồi thường
        depreciation: { bh: number, kh: number }    # Khấu hao vật tư/thay mới
        deductible: { bh: number, kh: number }      # Khấu trừ BH
      settlementBalance:              # → 3 rows section "Cần thanh toán"
        bhPayment: number             # "Bảo hiểm thanh toán" (ô xanh per AC)
        customerPayment: number       # "Khách hàng thanh toán" (ô cam per AC)
        totalPayment: number          # "Tổng thanh toán" (bold blue)
    serviceOrder:
      hasInsurance: boolean           # gate state A vs B (BR-INS-STL-CRE-009)

# ⚠️ panel KHÔNG mutate; AC-7 snapshot khi user click "Xác nhận" → mutation CreateSettlement payload bao gồm
# `insuranceAdjustment` block (BR-INS-STL-CRE-002) — handled bởi baseline form, NOT panel
integration_with_baseline_form:
  AC-6_bhPaymentField:
    target_field: "Tổng tiền bảo hiểm trả"    # baseline FEAT-STL-CREATE AC-11 trường nhập tay
    binding: "settlementBalance.bhPayment"     # read-only computed = AC-5 row 1 value
    state: disabled                             # read-only via input prop `readOnly={true}` + visual bg-muted
    when: "serviceOrder.hasInsurance === true"
    when_else: "giữ hành vi baseline (nhập tay)"   # state B — phiếu QT KH only
```

### §6 Layout Width Table

| Container | Max-width | Margin | Align-self | Notes |
|---|---|---|---|---|
| `TotalServicePricePanel` (root) | 600px FIXED | margin-left auto (right-column trên màn Tạo QT) | end | Cột phải side-by-side với form chính (cột trái baseline) |
| `PanelTitle` | FILL (600) | 0 | start | text-block |
| `BreakdownByPayerTable` | FILL (600) | 0 | stretch | table full-width trong panel |
| `AC9_BreakdownTable.itemName col` | FLEX-1 | — | left | grow chiếm space còn lại sau bhPayment + khPayment |
| `AC9_BreakdownTable.bhPayment col` | 180px FIXED | — | right | numeric col right-align (state A only) |
| `AC9_BreakdownTable.khPayment col` | 180px FIXED | — | right | numeric col right-align |
| `AC10_InsuranceAllocation` | FILL (600) | 0 | stretch | same 3-col grid (label + bhDelta + khDelta) |
| `AC5_PaymentBalance` | FILL (600) | 0 | stretch | container của 3 BalanceRow |
| `BalanceRow_*` | FILL (600) | 0 | stretch | mỗi row horizontal split (label \| value) |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | PanelTitle "Tổng giá dịch vụ" | text-lg/600 text-foreground | Panel header (top of right column) |
| L2 | Section header "Chi tiết theo bên thanh toán" | text-sm/600 text-foreground | Sub-section 1 (breakdown by payer) |
| L3 | Table header row "Khoản mục \| BH \| KH" | text-sm/500 bg-accent | Column labels |
| L4 | Body row label (Dịch vụ, Phụ tùng, VAT) | text-sm/400 text-foreground | Item description |
| L4 | Body row value (numeric) | text-sm/400 text-foreground right-aligned format=vnd | Item value |
| L3 (emphasis) | "Cộng sau VAT" row | text-sm/600 (bold) | Subtotal — basis for allocation |
| L2 | Section header "Phân bổ Bảo hiểm" | text-sm/600 text-foreground | Sub-section 2 (allocation, state A only) |
| L4 | Allocation row label | text-sm/400 | 5 adjustment items |
| L4 | Allocation row value (signed) | text-sm/400 + sign color (green/red per AC) | Adjustment amount per payer |
| L2 | Section header "Cần thanh toán" | text-sm/600 text-foreground | Sub-section 3 (balance) |
| L3 | BalanceRow_Insurance ("Bảo hiểm thanh toán") | bg-background-success/30 | BH payment (highlighted xanh per AC-5) |
| L3 | BalanceRow_Customer ("Khách hàng thanh toán") | bg-background-warning/30 | KH payment (highlighted cam per AC-5) |
| L1 (emphasis) | "Tổng thanh toán" value | text-lg/700 text-primary (blue #0052ff) | Final total — semantic highlight |

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Root cause | Đúng |
|---|---|---|---|---|
| AP-1 | **Render panel khi SO không có BH (vi phạm BR-009)** | Panel show 3 sections với cột BH all-zero, gây confuse | DEV không check `hasInsurance` flag | `<Panel state={so.hasInsurance ? 'A' : 'B'} />`; state B → drop bhPayment column + skip AllocationTable + 2 rows Balance |
| AP-2 | **AC-5 "Cân thanh toán" render 1 dòng theo design state-A** | UI chỉ show "Thanh toán" gộp, vi phạm AC-5 (3 dòng riêng BH/KH/Total) | DEV copy design 1:1 thay vì theo AC | Implement 3 BalanceRow như §1 DSL (BH ô xanh + KH ô cam + Total bold blue) — design có thể đã simplify cho minh hoạ |
| AP-3 | **Render AC-4 không màu (dấu text-prefix only)** | "−50.000" / "+50.000" black on white — không phân biệt BH giảm vs KH chuyển sang | DEV copy design tone (đều black) | Apply `text-foreground-success` (xanh) cho value < 0, `text-foreground-error` (đỏ) cho value > 0 per AC-4; signed_vnd format helper render prefix + color |
| AP-4 | **Panel editable (input/checkbox) thay vì read-only snapshot** | User sửa số trên panel, tưởng commit về DB | DEV copy panel SO (editable) verbatim, quên `mode="snapshot"` | Panel render text-only, NO Input/Select/Checkbox; trường "Tổng tiền BH trả" baseline cũng phải read-only (AC-6) khi state A |
| AP-5 | **Quên bind "Tổng tiền bảo hiểm trả" = settlementBalance.bhPayment (AC-6 missed)** | Trường baseline vẫn cho nhập tay → user nhập số ≠ computed → phiếu QT BH số tiền sai | DEV không update baseline trường này khi state A | Override baseline trường: `<Input value={settlementBalance.bhPayment} readOnly disabled className="bg-muted" />` khi `hasInsurance === true` |
| AP-6 | **Render "Cộng sau VAT" KHÔNG bold** | Subtotal row không phân biệt với data rows → user khó scan | DEV không apply `emphasis: bold` cho row "Cộng sau VAT" | `<tr className="font-semibold">` cho subtotal row |
| AP-7 | **Header bảng Phân bổ Bảo hiểm render header row (label "Khoản mục \| BH \| KH" lặp)** | Header dup phía dưới Breakdown table → vô nghĩa | DEV apply chung component Table với header default | Set `header.visible: false` cho AllocationTable; labels đã ở title "Phân bổ Bảo hiểm" + section trên đã có column labels |
| AP-8 | **Panel width responsive (FILL) thay vì 600 FIXED** | Trên screen lớn panel quá rộng / nhỏ panel bị shrink → mất alignment với form bên trái | DEV apply `w-full` thay vì `w-[600px]` | `<div className="w-[600px] ml-auto">` — right-column FIXED 600px, ml-auto đẩy về phải |
| AP-9 | **Demo data 'Cộng sau VAT BH = 50.000' hiểu lầm là tổng (95.040×3 = 285.120)** | DEV implement local sum thay vì bind server-side | DEV không tin BR-003 "server-side" | LUÔN bind `totalAfterVat.bh` từ response; KHÔNG tự sum dịch vụ + phụ tùng + VAT trong FE |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-stl-create/13692-113072.png    # panel state A — 600×764
  pngs_read:
    - assets/wave02-ins-stl-create/13692-113072.png    # panel state A — 600×764
    - assets/wave02-ins-stl-create/_full.png            # full screen — 1308×2400 (scaled from 1440×2644)
  claims_verified:
    - claim: "Panel right-column 600px wide với 3 sections vertical: 'Chi tiết theo bên thanh toán' (table 3-col), 'Phân bổ Bảo hiểm' (5 rows × 2 numeric cols), 'Cần thanh toán' (header + 1 row 'Thanh toán' + 'Tổng thanh toán' blue bold)"
      evidence: "13692-113072.png — quan sát 3 sub-headers in bold, phân tách rõ với gap dọc"
    - claim: "Table 'Chi tiết theo bên thanh toán' có header row bg-grey (bg-accent) với 3 columns 'Khoản mục | Bảo hiểm thanh toán | Khách hàng thanh toán'; 4 rows data, hàng cuối 'Cộng sau VAT' bold"
      evidence: "13692-113072.png — header row có background lighter than body; cell 'Cộng sau VAT' visibly heavier weight"
    - claim: "Section 'Phân bổ Bảo hiểm' KHÔNG có header row riêng — labels ('CK liên kết BH — Vật tư', etc.) là leftmost cell mỗi row"
      evidence: "13692-113072.png — section bắt đầu trực tiếp với row data, không có header xám"
    - claim: "5 allocation rows hiển thị giá trị với dấu +/− text-prefix, KHÔNG có màu phân biệt (tất cả black)"
      evidence: "13692-113072.png — '−50.000đ' / '+50.000đ' đều render black, không xanh không đỏ → drift vs AC-4"
    - claim: "'Tổng thanh toán' value = 50.000.000đ render blue (#0052ff) bold lớn, right-aligned"
      evidence: "13692-113072.png — value blue rõ ràng vs body text đen"
    - claim: "Design 'Cần thanh toán' chỉ show 2 dòng ('Thanh toán' với 2 cells BH=50.000.000 + KH=0, then 'Tổng thanh toán') — KHÔNG có 3 ô BH/KH/Total tách như AC-5"
      evidence: "13692-113072.png — đếm rows trong section 'Cần thanh toán': 2 rows visible → drift vs AC-5"
```

### §9 Container Hierarchy (legacy)

```
TotalServicePricePanel (13692:113072) [vertical, w-[600px], h-hug]
├── PanelTitle "Tổng giá dịch vụ" (text-lg/600)
├── ### Nhóm C — Panel "Tổng giá dịch vụ" (panel kết quả, bên phải) — read-only
│   ├── AC-9 BreakdownByPayerTable (13692:113074, 600×284)
│   │   ├── Header row (bg-accent, "Khoản mục | Bảo hiểm thanh toán | Khách hàng thanh toán")
│   │   └── 4 body rows (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT bold)
│   ├── AC-10 InsuranceAllocationTable (13787:116665, 600×296)
│   │   └── 5 rows (CK Vật tư / CK Công DV / Giảm trừ bồi thường / Khấu hao / Khấu trừ BH)
│   └── AC-11 PaymentBalanceBlock (13692:113139, 600×140)
│       ├── Section header "Cần thanh toán"
│       ├── Row 'Thanh toán' (BH | KH values) — DEV expand thành 2 rows (BH + KH separate) per AC-5
│       └── Row 'Tổng thanh toán' (bold blue right)
```

---

## Screen: Panel "Tổng giá dịch vụ" — state B: SO KHÔNG CÓ BẢO HIỂM (13545:91244)

> Panel right-column 600×468 trên màn Tạo phiếu QT khi `serviceOrder.hasInsurance === false`. Hiển thị **rút gọn**: 1 cột "Khách hàng thanh toán" + KHÔNG có section "Phân bổ Bảo hiểm" + "Cân thanh toán" chỉ 2 dòng (Khách hàng + Tổng). Đây là state baseline FEAT-STL-CREATE giữ nguyên (panel chỉ thêm context cho khi có BH).

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────┐
│  Tổng giá dịch vụ                                            │ ← title L1
│                                                              │
│  Chi tiết theo bên thanh toán                                │ ← section header L2
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Khoản mục          │      Khách hàng thanh toán          │ │ ← 2-col only
│ │────────────────────│──────────────────────────────────── │ │
│ │ Dịch vụ            │                                  0đ │ │
│ │ Phụ tùng           │                            95.040đ  │ │
│ │ VAT                │                            95.040đ  │ │
│ │ Cộng sau VAT       │                            95.040đ  │ │ ← bold
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  Cần thanh toán                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Khách hàng thanh toán              │     50.000.000đ     │ │
│ │ Tổng thanh toán                    │     50.000.000đ     │ │ ← bold blue
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
TotalServicePricePanel_StateB:
  $ref: TotalServicePricePanel       # reuse master DSL above
  state: B                            # serviceOrder.hasInsurance === false
  overrides:
    AC9_BreakdownTable.columns:
      - { key: itemName, label: "Khoản mục", flex: 1, align: left }
      - { key: khPayment, label: "Khách hàng thanh toán", width: 180, align: right, format: vnd }
      # bhPayment column DROPPED
    InsuranceAllocationTable:
      visible: false                  # entire section hidden
    AC5_PaymentBalance.rows:
      # BalanceRow_Insurance DROPPED
      - BalanceRow_Customer
      - BalanceRow_Total
```

### §2 Design Token Map

Reuse §2 từ state A. Token unique state B: KHÔNG có `bg-background-success/30` (BH row hidden).

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `TotalServicePricePanel` | state B | shrink panel height (468 vs 764) | `serviceOrder.hasInsurance === false` |
| `bhPayment` column | hidden | column dropped | state B |
| `InsuranceAllocationTable` | hidden | entire section dropped | state B |
| `BalanceRow_Insurance` | hidden | row dropped | state B |
| Baseline trường "Tổng tiền bảo hiểm trả" | hidden hoặc disabled (no BH form section) | giữ baseline FEAT-STL-CREATE flow phiếu KH single | state B |

### §4 Component Prop Map

Reuse §4 state A. Override:
| Prop | Override state B |
|---|---|
| `hasInsurance` | `false` → state B branch |
| `AC9_BreakdownTable.columns` | 2 cols (drop bhPayment) |
| `InsuranceAllocationTable.visible` | `false` |
| `AC5_PaymentBalance.rows.length` | 2 (drop BalanceRow_Insurance) |

### §5 Field Composition Schema

Same data binding shape, but `breakdownByPayer.*.bh` ignored (column hidden) và `adjustments`/`settlementBalance.bhPayment` không render.

### §6 Layout Width Table

| Container | Max-width | Notes |
|---|---|---|
| Panel | 600 FIXED | giống state A |
| BreakdownTable cols | itemName flex-1 / khPayment 180 fixed | state B 2-col |
| Balance rows | FILL | 2 rows only |

### §7 Visual Hierarchy Map

Same as state A minus rows/sections hidden.

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Đúng |
|---|---|---|---|
| AP-B1 | **Render panel rỗng / placeholder cho state B** | Panel hiện "—" hoặc "Không có" cho cột BH | Đúng = DROP cột BH hoàn toàn (đừng render với value `-`/null) |
| AP-B2 | **Vẫn render AllocationTable rỗng** | Section "Phân bổ Bảo hiểm" với 5 dòng all-zero | DROP entire `<InsuranceAllocationTable />` block khi `!hasInsurance` |
| AP-B3 | **BalanceRow_Insurance render với value 0** | "Bảo hiểm thanh toán: 0đ" gây user nghĩ phiếu BH tạo nhưng 0 | DROP row hoàn toàn; phiếu QT BH không tạo khi state B (baseline FEAT-STL-CREATE flow phiếu KH single) |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-stl-create/13545-91244.png      # panel state B — 600×468
  pngs_read:
    - assets/wave02-ins-stl-create/13545-91244.png      # panel state B — 600×468
  claims_verified:
    - claim: "Panel state B chỉ 2 sections: 'Chi tiết theo bên thanh toán' (2-col table, only khPayment) + 'Cần thanh toán' (2 rows)"
      evidence: "13545-91244.png — đếm rõ 2 sub-headers, KHÔNG có 'Phân bổ Bảo hiểm'"
    - claim: "BreakdownTable state B chỉ 2 cols: 'Khoản mục | Khách hàng thanh toán' (header bg-accent, body 4 rows + bold Cộng sau VAT)"
      evidence: "13545-91244.png — header row visible với 2 columns, không có 'Bảo hiểm thanh toán'"
    - claim: "'Cần thanh toán' chỉ 2 rows: 'Khách hàng thanh toán' (value 50.000.000) + 'Tổng thanh toán' (blue bold 50.000.000)"
      evidence: "13545-91244.png — 2 rows clear, value 'Tổng thanh toán' blue dominant"
```

### §9 Container Hierarchy (legacy)

```
TotalServicePricePanel_StateB (13545:91244) [vertical, w-[600px], h-hug ~468]
├── PanelTitle "Tổng giá dịch vụ"
├── ### Nhóm C — Panel "Tổng giá dịch vụ" (panel kết quả) — read-only (state B)
│   ├── AC-9 BreakdownTable (13545:91246, 600×284) [2-col only]
│   │   ├── Header row (Khoản mục | Khách hàng thanh toán)
│   │   └── 4 body rows (Dịch vụ 0 / Phụ tùng 95.040 / VAT 95.040 / Cộng sau VAT 95.040 bold)
│   └── AC-11 PaymentBalanceBlock (13545:91307, 600×140) [2 rows only]
│       ├── Row 'Khách hàng thanh toán' 50.000.000
│       └── Row 'Tổng thanh toán' 50.000.000 (blue bold)
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-stl-create/_full.png` | frame 13535:155254 (1440×2644) | Full màn Tạo QT state A — context panel-trong-màn |
| `assets/wave02-ins-stl-create/13692-113072.png` | panel state A (600×764) | AC-3/AC-4/AC-5 state A (with insurance) evidence |
| `assets/wave02-ins-stl-create/13545-91244.png` | panel state B (600×468) | AC-2/AC-5 state B (no insurance, reduced) evidence |
