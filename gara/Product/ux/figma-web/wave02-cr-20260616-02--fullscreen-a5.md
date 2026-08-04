---
cr_id: CR-20260616-02
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260616-02
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-159225&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13535:159225"
screen_slug: fullscreen-a5
fetched_at: 2026-06-26T02:45:00+07:00
transform_version: 7
transform_mode: fresh-fetch
status: ACTIVE
screenshots: true
screens_expected: 1
related_specs:
  - Product/ux/figma-web/wave02-ins-stl-create--panel.md             # Canonical panel anatomy (master spec)
  - Product/ux/figma-web/wave02-cr-20260616-02--a5-so-edit.md        # CR sibling — SO Edit context
  - Product/ux/figma-web/wave02-cr-20260616-02--a5-so-detail.md      # CR sibling — SO Detail context
  - Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md     # FEAT split mirror (same node, FEAT frontmatter)
coverage_gaps:
  - "CR-20260616-02 áp dụng cho 3 màn (SO Edit, SO Detail, Tạo QT). Spec này = nhánh Tạo QT (editable mode trên FEAT-INS-STL-CREATE)."
  - "Panel anatomy 100% identical với CR-20260616-02 a5-so-edit/a5-so-detail + canonical wave02-ins-stl-create--panel.md state A — chỉ khác context = Settlement Create (panel ở fullscreen mode khi composing new settlement)."
  - "A5 wrapper (1212×816) = design-reference cho Business review, KHÔNG production route."
---

## Scope — CR-20260616-02 / A5 fullscreen Tạo phiếu QT reference

> Frame `13535:159225` (1212×816) — A5 design-reference frame thuộc CR-20260616-02 ([Tracking/CHANGE-REQUESTS.md#CR-20260616-02](../../Tracking/CHANGE-REQUESTS.md#CR-20260616-02)) cho panel **"Tổng giá dịch vụ" layout 2 cột** (Bảo hiểm thanh toán | Khách hàng thanh toán) trong context **Tạo phiếu QT** (panel fullscreen mode trên màn FEAT-INS-STL-CREATE — kế toán compose phiếu quyết toán mới).
>
> Composition: empty placeholder left (600×816 x=0) + panel right (600×764 x=612, gap=12). **Panel content** = node `13692:113072` — identical layout với canonical [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) state A + 2 CR siblings. Khác biệt: context = `STL_CREATE` (panel fullscreen layout khi compose phiếu mới — không gắn với form SO inline).
>
> CR scope = chuẩn hoá panel "Tổng giá dịch vụ" thành **2 cột giá trị** cho 2 khối "Phân bổ Bảo hiểm" (5 rows, BH dấu − / KH dấu +) + "Cần thanh toán" (Thanh toán + Tổng thanh toán). Dóng thẳng với header "Chi tiết theo bên thanh toán" (BH | KH cùng trục).

---

## Screen: A5 fullscreen Tạo QT panel — CR-20260616-02 (13535:159225)

### §0 ASCII Mockup

```
┌──────────────────────────────────────────┬──────────────────────────────────────────┐
│                                          │  Tổng giá dịch vụ                        │
│                                          │  ─────────────────────────────────────   │
│                                          │  Chi tiết theo bên thanh toán            │
│                                          │  ┌─────────┬──────────┬────────────┐    │
│                                          │  │ Khoản m │ Bảo hiểm │ Khách hàng │    │
│        empty placeholder                 │  │ Dịch vụ │ 95.040đ  │ 0đ         │    │
│        (600×816)                         │  │ Phụ tùng│ 95.040đ  │ 95.040đ    │    │
│                                          │  │ VAT     │ 95.040đ  │ 95.040đ    │    │
│                                          │  │ Cộng VAT│ 50.000đ  │ 95.040đ    │    │
│                                          │  └─────────┴──────────┴────────────┘    │
│                                          │                                          │
│                                          │  Phân bổ Bảo hiểm                        │
│                                          │  ┌──────────────────┬────────┬─────────┐ │
│                                          │  │ CK liên kết — VT │     0đ │      0đ │ │
│                                          │  │ CK liên kết — CV │-50.000d│      0đ │ │
│                                          │  │ Giảm trừ b/thg   │-50.000d│ +50.000d│ │
│                                          │  │ Khấu hao VT/mới  │-50.000d│ +50.000d│ │
│                                          │  │ Khấu trừ BH      │-95.040d│ +50.000d│ │
│                                          │  └──────────────────┴────────┴─────────┘ │
│                                          │                                          │
│                                          │  Cần thanh toán                          │
│                                          │  ┌──────────┬─────────────┬───────────┐  │
│                                          │  │ Thanh toán│ 50.000.000đ │       0đ │  │
│                                          │  └──────────┴─────────────┴───────────┘  │
│                                          │  ┌──────────────────────┬─────────────┐ │
│                                          │  │ Tổng thanh toán      │ 50.000.000đ │ │
│                                          │  └──────────────────────┴─────────────┘ │
└──────────────────────────────────────────┴──────────────────────────────────────────┘
  Context: Tạo phiếu QT (panel fullscreen, mode=editable per STL Create)
  x=0, w=600                                  x=612, w=600 (gap=12)

Tổng thanh toán = blue brand color (50.000.000đ right-aligned, font-weight: 600)
Phân bổ Bảo hiểm — value cell: BH cột giữa (dấu − giảm BH), KH cột phải (dấu + thu KH)
Cần thanh toán — 2 dòng: Thanh toán 3-col (label + BH + KH), Tổng thanh toán 2-col (label fullwidth + KH/total)
```

### §1 Layout DSL

```yaml
A5FullscreenSTLCreateWrapper:           # frame 13535:159225 — design reference only
  type: container
  direction: horizontal
  gap: 12
  width: 1212
  height: 816
  bg: bg-background
  context: "CR-20260616-02 A5 reference for STL Create (Tạo phiếu QT)"
  children:
    - id: A5LeftPlaceholder
      type: container
      width: 600
      height: 816
      bg: bg-background
      flex-grow: 0
      _note: "Empty design placeholder — KHÔNG render production"

    - id: A5RightPanel
      $ref: TotalServicePricePanel_StateA   # reuse canonical wave02-ins-stl-create--panel.md state A
      _node: "13692:113072"
      mode: editable                          # ← STL Create context: compose new settlement
      _note: "Reuse exact panel anatomy; mode=editable per CR-20260616-02 STL Create (fullscreen)"
      text_entries:                          # R7 §1 rendering decisions cho heading texts (CR-20260616-02 delta)
        - id: PanelTitle
          title: "Tổng giá dịch vụ"
          _renders_as: "h2 bold semibold text, mb-3, color text-foreground"
          _node: "13692:113073"
        - id: AC9Header
          title: "Chi tiết theo bên thanh toán"
          _renders_as: "section header bold semibold text inside 36px container, color text-foreground"
          _node: "13692:113075"
        - id: AC10Header
          title: "Phân bổ Bảo hiểm"
          _renders_as: "section header bold semibold text inside 36px container, color text-foreground"
          _node: "13787:116666"
        - id: AC11Header
          title: "Cần thanh toán"
          _renders_as: "section header bold semibold text inside 36px container, color text-foreground"
          _node: "13692:113140"
      sections:
        - id: PaymentBreakdownTable          # AC-9
          _node: "13692:113074"
          columns: 3                          # Khoản mục | Bảo hiểm | Khách hàng
          rows: 4                             # Dịch vụ, Phụ tùng, VAT, Cộng sau VAT
          header_row:
            BG: bg-muted/30                   # R1 — gray strip header row
            Border: border-b-muted
            font-weight: 600
          body_row:
            BG: transparent
            Border: border-b-muted/40
        - id: InsuranceAllocationTable        # AC-10 — CR-20260616-02 core
          _node: "13787:116665"
          columns: 3                          # Label | Bảo hiểm (signed −) | Khách hàng (signed +)
          rows: 5                             # CK liên kết VT, CK liên kết CV, Giảm trừ, Khấu hao, Khấu trừ
          body_row:
            BG: transparent
            Border: border-b-muted/40
        - id: PaymentRequiredFooter           # AC-11 — CR-20260616-02 core
          _node: "13692:113139"
          rows:
            - id: PaymentRow                  # 3-col (label + BH + KH)
              cols: [label, bh_value, kh_value]
              BG: transparent
              Border: border-b-muted/40
            - id: GrandTotalRow               # 2-col (label fullwidth + total)
              cols: [label_fullwidth, total_value]
              color: brand-blue
              align: right
              font-weight: 600
              BG: transparent
              Border: border-b-transparent
      _negative_coverage:                    # R8 — explicit NOT-rendered elements
        - "Không có border outer panel (panel flat, không card)"
        - "Không có icon trong các section headers"
        - "Không có CTA button trong panel (read-only display panel)"
        - "Không render red/green color cho dấu +/− values (plain text color)"
```

### §2 Design Token Map

Delegate to [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §2 (canonical).

Override / explicit (CR-20260616-02):
| Token | Value | Usage |
|---|---|---|
| `color-brand-blue` | #1A73E8 (approx) | Tổng thanh toán giá trị final |
| `color-text-negative` | text-default | Phân bổ BH cột Bảo hiểm (dấu − hiển thị plain, không red) |
| `color-text-positive` | text-default | Phân bổ BH cột Khách hàng (dấu + hiển thị plain, không green) |
| `font-weight-section-title` | 600 (semibold) | Title sections |
| `align-value-cells` | right | Tất cả cell value (số tiền) |
| `align-label-cells` | left | Cell label |

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `A5FullscreenSTLCreateWrapper` | rendered (design reference only) | n/a | KHÔNG render production |
| `A5RightPanel` | editable | adjustments inputs accept user input (5 rows AC-10) | STL Create — kế toán compose phiếu mới với 5 adjustment fields per FEAT-INS-STL-CREATE |
| `PaymentBreakdownTable` | read-only | n/a | Computed server-side, derived từ SO line items selected for settlement |
| `InsuranceAllocationTable` | editable | mode=editable → numeric input per row | Kế toán chỉnh 5 adjustment khi compose phiếu (debounced settlement.adjustments mutation) |
| `PaymentRequiredFooter` | read-only | n/a | Computed server-side post-adjustments |
| `GrandTotalRow value` | brand-blue + bold | `text-brand-blue font-semibold` | Final settlement total preview |

### §4 Component Prop Map

Delegate to [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §4 với override:

| Prop | Override (fullscreen-a5) |
|---|---|
| `mode` | `editable` |
| `context` | `STL_CREATE` |
| `data_source` | `settlement.draft.totalPricePanel` (live, debounced trên draft) |

### §5 Field Composition Schema

Delegate to [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §5 với STL Create context override:

```yaml
mode_override:
  context: STL_CREATE
  editable_fields:
    - adjustments.ckLinkedParts          # CK liên kết BH — Vật tư
    - adjustments.ckLinkedService        # CK liên kết BH — Công dịch vụ
    - adjustments.compensationReduction  # Giảm trừ bồi thường
    - adjustments.depreciation           # Khấu hao vật tư / thay mới
    - adjustments.deductible             # Khấu trừ BH
  computed_fields:
    - breakdownByPayer                   # AC-9 table (always server-side per-payer)
    - allocationByPayer                  # AC-10 BH cột (− signed) + KH cột (+ signed)
    - settlementBalance                  # AC-11 footer (always server-side post-adjustments)
  mutation: UpdateSettlementDraftAdjustments
  debounce: 400ms
  finalize: CreateSettlement              # Submit phiếu sau khi adjustments confirmed
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| `A5FullscreenSTLCreateWrapper` | 1212 FIXED | design reference frame |
| `A5LeftPlaceholder` | 600 FIXED | empty |
| `A5RightPanel` | 600 FIXED | panel canonical |
| `PaymentBreakdownTable` (AC-9) | 600 inner | 3 col × 200 |
| `InsuranceAllocationTable` (AC-10) | 600 inner | 3 col × 200 |
| `PaymentRequiredFooter row 1` (AC-11 Thanh toán) | 600 inner | 3 col × 200 |
| `PaymentRequiredFooter row 2` (AC-11 Tổng thanh toán) | 600 inner | 2 col (400 label + 200 value) |

### §7 Visual Hierarchy Map

Delegate to [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §7 (canonical).

CR-20260616-02 specific emphasis (fullscreen-a5):
- **2-column value alignment** (Bảo hiểm | Khách hàng) trong "Phân bổ Bảo hiểm" + "Cần thanh toán" phải dóng thẳng theo trục với 2-column header "Chi tiết theo bên thanh toán" phía trên.
- **Tổng thanh toán** = single visual focal point (brand blue + bold), right-aligned in last row 2-column.
- **STL Create context**: panel hiển thị preview tổng tiền theo real-time draft adjustments (live update khi user thay đổi 5 adjustment fields).

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Đúng | `_png_verified` |
|---|---|---|---|---|
| AP-CR16-FULLSCREEN-1 | **Render Phân bổ Bảo hiểm 1 cột giá trị duy nhất** | Bỏ qua tách BH | KH; mỗi row chỉ 1 giá trị tổng | CR-20260616-02 yêu cầu 2 cột song song: BH cột (dấu − giảm BH) + KH cột (dấu + thu KH). | `13787-116665.png` — 5 rows render với 2 value cols (BH cột giữa | KH cột phải), KHÔNG phải 1 col tổng |
| AP-CR16-FULLSCREEN-2 | **Render Cần thanh toán 1 cột (chỉ tổng cuối)** | Bỏ dòng "Thanh toán" 3-col (BH 50.000.000đ \| KH 0đ) | 2 dòng: Thanh toán per-payer 3-col + Tổng thanh toán 2-col (label fullwidth + value brand-blue). | `13692-113139.png` — row 1 "Thanh toán" 3 cells (label \| 50.000.000đ \| 0đ), row 2 "Tổng thanh toán" 2 cells (label fullwidth \| 50.000.000đ blue right) |
| AP-CR16-FULLSCREEN-3 | **Color value cells red/green theo dấu** | BH cột red (− = âm) hoặc KH cột green (+ = dương) | Plain text color cho mọi value cells (theo Figma). Dấu +/− để math semantic, không phải status semantic. | `_full_fullscreen-a5.png` + `13787-116665.png` — KHÔNG thấy red/green; chỉ "Tổng thanh toán" 50.000.000đ blue |
| AP-CR16-FULLSCREEN-4 | **Đảo trục dóng thẳng** | Cột BH ở phải, KH ở giữa (sai vs header) | Cột BH ở giữa (cùng trục "Bảo hiểm thanh toán" của AC-9), KH ở phải (cùng trục "Khách hàng thanh toán" của AC-9). | `13692-113074.png` (AC-9 header) + `13787-116665.png` (AC-10) — cùng cấu trúc 3-col: label | BH value (middle) | KH value (right) |
| AP-CR16-FULLSCREEN-5 | **DEV spec/build "A5 STL Create view" route riêng** | Tạo route /settlement/a5-create 1212×816 với cột trái rỗng | A5 frame = design reference ONLY. Panel render trong STL Create page per FEAT-INS-STL-CREATE. | design-intent trap, no PNG contradict (A5 wrapper là design composition reference frame) |
| AP-CR16-FULLSCREEN-6 | **mode=read-only khi context=STL Create** | User compose phiếu QT nhưng 5 adjustments fields disabled | `mode: editable` cho STL Create context — kế toán nhập adjustments khi compose draft. | design-intent trap, no PNG contradict (mode prop = behavioral metadata override per context) |
| AP-CR16-FULLSCREEN-7 | **Submit settlement KHÔNG dùng final adjustments preview** | Nút "Tạo phiếu" submit raw input không qua live computed preview | Settlement.create phải dùng `settlement.draft.totalPricePanel.{breakdownByPayer, allocationByPayer, settlementBalance}` đã computed server-side preview qua mutation `UpdateSettlementDraftAdjustments`. | design-intent trap, no PNG contradict (behavioral submit flow trap — preview state visible trong panel) |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-cr-20260616-02/_full_fullscreen-a5.png   # panel 600×764 — CR layout evidence
  pngs_read:
    - assets/wave02-cr-20260616-02/_full_fullscreen-a5.png           # panel 600×764 (node 13692:113072)
    - assets/wave02-cr-20260616-02/13692-113074.png                  # AC-9 Chi tiết theo bên thanh toán
    - assets/wave02-cr-20260616-02/13787-116665.png                  # AC-10 Phân bổ Bảo hiểm — CR-20260616-02 core
    - assets/wave02-cr-20260616-02/13692-113139.png                  # AC-11 Cần thanh toán — CR-20260616-02 core
  claims_verified:
    - claim: "Panel 'Tổng giá dịch vụ' 600px wide với 3 sections vertically stacked: Chi tiết theo bên thanh toán → Phân bổ Bảo hiểm → Cần thanh toán"
      evidence: "_full_fullscreen-a5.png (600×764) — title 'Tổng giá dịch vụ' top, 3 section titles 'Chi tiết theo bên thanh toán' / 'Phân bổ Bảo hiểm' / 'Cần thanh toán' visible vertical order"
    - claim: "Panel content identical với a5-so-edit + a5-so-detail variants (cùng anatomy, chỉ khác context prop)"
      evidence: "_full_fullscreen-a5.png ≡ _full_a5-so-edit.png ≡ _full_a5-so-detail.png pixel-similar — cùng 3 sections, cùng giá trị example, cùng layout 600×764"
    - claim: "AC-10 'Phân bổ Bảo hiểm' = bảng 3 cột × 5 rows với value cells per-payer (BH cột giữa dấu −, KH cột phải dấu +)"
      evidence: "13787-116665.png — 5 rows: CK liên kết BH—Vật tư (0đ | 0đ), CK liên kết BH—Công dịch vụ (−50.000đ | 0đ), Giảm trừ bồi thường (−50.000đ | +50.000đ), Khấu hao vật tư/thay mới (−50.000đ | +50.000đ), Khấu trừ BH (−95.040đ | +50.000đ)"
    - claim: "AC-11 'Cần thanh toán' = 2 rows: Thanh toán (3-col: label + BH + KH) + Tổng thanh toán (2-col: label fullwidth + total brand-blue right-aligned)"
      evidence: "13692-113139.png — row 1 'Thanh toán' 3 cells (label | 50.000.000đ | 0đ), row 2 'Tổng thanh toán' 2 cells (label fullwidth | 50.000.000đ blue right)"
    - claim: "Value cells plain text color (không red/green theo dấu), trừ Tổng thanh toán brand-blue"
      evidence: "_full_fullscreen-a5.png + 13787-116665.png — không thấy red/green; chỉ Tổng thanh toán blue"
```

### §9 Container Hierarchy (legacy)

```
A5FullscreenSTLCreateWrapper (13535:159225, 1212×816) [horizontal, gap=12]
├── A5LeftPlaceholder (600×816, x=0) — EMPTY design placeholder
└── A5RightPanel (13692:113072, 600×764, x=612)
    ├── PanelTitle "Tổng giá dịch vụ" (44h)
    ├── PaymentBreakdownTable AC-9 (13692:113074, 600×284) — 3-col × 4-row
    ├── InsuranceAllocationTable AC-10 (13787:116665, 600×296) — 3-col × 5-row
    └── PaymentRequiredFooter AC-11 (13692:113139, 600×140) — 3-col + 2-col rows
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-cr-20260616-02/_full_fullscreen-a5.png` | 13692:113072 (600×764) | Panel "Tổng giá dịch vụ" full content evidence (STL Create context) |
| `assets/wave02-cr-20260616-02/13692-113074.png` | 13692:113074 (600×284) | AC-9 Chi tiết theo bên thanh toán (3-col × 4-row) |
| `assets/wave02-cr-20260616-02/13787-116665.png` | 13787:116665 (600×296) | AC-10 Phân bổ Bảo hiểm — CR-20260616-02 core (3-col × 5-row, signed values per-payer) |
| `assets/wave02-cr-20260616-02/13692-113139.png` | 13692:113139 (600×140) | AC-11 Cần thanh toán — CR-20260616-02 core (Thanh toán 3-col + Tổng thanh toán 2-col brand-blue) |
