---
feat: FEAT-INS-STL-CREATE
feat_file: Product/features/FEAT-INS-STL-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-159225&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13535:159225"
screen_slug: fullscreen-a5
fetched_at: 2026-06-18T13:40:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (parent section structure đã capture trong DEV spec wave02-ins-stl-create--fullscreen-a5.md)
  get_variable_defs: success
  get_design_context: skipped (supplement từ DEV spec)
  get_screenshot: success (1 frame full + 3 section)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (supplemented từ DEV spec)
  variant_state: complete (panel mode full-insurance + no-insurance đều mô tả)
  text_content: complete (verbatim từ DEV spec)
  design_tokens: complete (variable_defs success — đầy đủ success/warning/error palette)
  interaction_states: partial (panel read-only — không có interactive state)
screenshots:
  - assets/wave02-ins-stl-create--fullscreen-a5/_full.png
  - assets/wave02-ins-stl-create--fullscreen-a5/13692-113074-payer-breakdown.png
  - assets/wave02-ins-stl-create--fullscreen-a5/13787-116665-insurance-allocation.png
  - assets/wave02-ins-stl-create--fullscreen-a5/13692-113139-payment-balance.png
design_vs_feat_notes:
  - "Figma annotations dùng AC-9/AC-10/AC-11 (FEAT-INS-SO-ADJUSTMENT AC) thay vì AC-3/AC-4/AC-5 (FEAT-INS-STL-CREATE AC) — panel là shared component (CR-20260616-02). Mapping: SO-ADJ AC-9 ⇄ STL-CRE AC-3 'Chi tiết theo bên thanh toán'; SO-ADJ AC-10 ⇄ STL-CRE AC-4 'Phân bổ Bảo hiểm'; SO-ADJ AC-11 ⇄ STL-CRE AC-5 'Cân thanh toán'."
  - "Node `13535:159225` capture PANEL HALF cột phải 600px trong layout 2-cột (1212×816 panel area). Cột trái 600px = form section nhập liệu phiếu QT (baseline FEAT-STL-CREATE). DEV: implement panel 600px wide trong right column của 2-col layout."
  - "AC-4 dấu +/màu (xanh = giảm BH, đỏ = chuyển sang KH): CK liên kết BH Vật tư/Công dịch vụ → '−' xanh ở cột BH (chỉ render cột BH, KH KHÔNG render). Giảm trừ bồi thường / Khấu hao / Khấu trừ BH → '+' đỏ ở cột KH (chỉ render cột KH, BH KHÔNG render)."
  - "AC-5 'Cân thanh toán' Row 1 (3 ô) gồm BH xanh + KH cam + cell 3 (Figma metadata có 3 cells × 200px nhưng nội dung thực = 2). Row 2 'Tổng thanh toán' full row đen — DEV verify với BA xem cell 3 có placeholder/ghost hay không."
  - "Mode `no-insurance` rút gọn (FEAT AC-2): AC-9 chỉ 2 cột (Khoản mục | KH) — bỏ cột BH 200px. KHÔNG render section AC-10. AC-11 chỉ 2 dòng (KH cam + Tổng đen) — bỏ ô BH xanh."
---

# Oracle — FEAT-INS-STL-CREATE (web) · wave 02 · screen "fullscreen-a5"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13535:159225`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Panel **"Tổng giá dịch vụ"** A5 2-cột (CR-20260616-02) —
> reflow BH | KH columns trong panel right-column 600px của layout 2-cột màn Tạo QT.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Panel A5 2-cột (full mode `full-insurance`) | 13535:159225 | 1212×816 | assets/wave02-ins-stl-create--fullscreen-a5/_full.png |

### Section-container in-scope

| Section | nodeId | size | screenshot |
|---|---|---|---|
| AC-3 Bảng "Chi tiết theo bên thanh toán" (PayerBreakdownTable) | 13692:113074 | 600×284 | assets/wave02-ins-stl-create--fullscreen-a5/13692-113074-payer-breakdown.png |
| AC-4 Bảng "Phân bổ Bảo hiểm" (InsuranceAllocation) | 13787:116665 | 600×296 | assets/wave02-ins-stl-create--fullscreen-a5/13787-116665-insurance-allocation.png |
| AC-5 Khối "Cân thanh toán" (PaymentBalance) | 13692:113139 | 600×140 | assets/wave02-ins-stl-create--fullscreen-a5/13692-113139-payment-balance.png |

---

## Component Inventory

### Section: PanelCol/TotalServicePanel container (13535:159225 right column)
- Container × 1 — 600×764, BG `#ffffff`, border 1px `#e4e4e7`, radius lg
- Title text × 1 "Tổng giá dịch vụ" (large/semibold 18px) + border-bottom

### Section: AC-3 PayerBreakdownTable (13692:113074) — 600×284
- Container header × 1 — BG muted, height 36, padding 8 — text "Chi tiết theo bên thanh toán" (sm/medium muted)
- Table grid × 1 — 3 cột × 5 rows
  - Column 1 "Khoản mục" 200px wide: Header + 4 data rows (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT)
  - Column 2 "Bảo hiểm thanh toán" 200px wide right-aligned: Header + 4 data
  - Column 3 "Khách hàng thanh toán" 200px wide right-aligned: Header + 4 data
- Last row "Cộng sau VAT" bold (semibold 14px) + border-top

### Section: AC-4 InsuranceAllocation (13787:116665) — 600×296
- Container header × 1 — BG muted, height 36, padding 8 — text "Phân bổ Bảo hiểm" (sm/medium muted)
- AllocationGrid × 1 — 3 cột × 5 rows
  - Column 1 (Label 200px): 5 dòng adjustment
  - Column 2 (BH 200px right-aligned): rows 1-2 render `− {value}` xanh; rows 3-5 không render
  - Column 3 (KH 200px right-aligned): rows 3-5 render `+ {value}` đỏ; rows 1-2 không render

### Section: AC-5 PaymentBalance (13692:113139) — 600×140
- Container header × 1 — BG muted, height 36, padding 8 — text "Cân thanh toán" (sm/medium muted)
- Row 1 (3 ô highlight × 52px each):
  - Cell BH 200×52: BG `bg-background-success` (#f0fdf4) — label + value xanh (#16a34a)
  - Cell KH 200×52: BG `bg-background-warning` (#fff7ed) — label + value cam (#ea580c)
  - Cell 3 200×52: empty/ghost (verify BA)
- Row 2 (Tổng full row × 52px):
  - Cell label 400×52: text "Tổng thanh toán" (sm/semibold đen)
  - Cell value 200×52: value (large/bold đen)
  - Border-top giữa Row 1 và Row 2

---

## Variant & State

### TotalServicePanel
- variants: `full-insurance` (3 cột AC-3, render AC-4, AC-5 3 ô) · `no-insurance` (1 cột AC-3, không AC-4, AC-5 2 dòng — bỏ ô BH xanh)
- states observed: `full-insurance` (Figma chính)

### AC-4 AllocationRow signs
- variants: `BH-` (xanh, dấu −) cho rows 1-2 ở cột BH · `KH+` (đỏ, dấu +) cho rows 3-5 ở cột KH
- states observed: cả 2

### AC-5 Cân thanh toán ô highlight
- variants: success (BH xanh) · warning (KH cam) · neutral (Tổng đen)
- states observed: cả 3

---

## Text Content

### Section: Panel container (13535:159225)
- "Tổng giá dịch vụ" (panel title)

### Section: AC-3 PayerBreakdownTable (13692:113074)
- "Chi tiết theo bên thanh toán" (section header — muted)
- "Khoản mục" (col 1 header)
- "Bảo hiểm thanh toán" (col 2 header — right-aligned)
- "Khách hàng thanh toán" (col 3 header — right-aligned)
- "Dịch vụ" (row 1 label)
- "Phụ tùng" (row 2 label)
- "VAT" (row 3 label)
- "Cộng sau VAT" (row 4 label — bold)

### Section: AC-4 InsuranceAllocation (13787:116665)
- "Phân bổ Bảo hiểm" (section header — muted)
- "CK liên kết BH — Vật tư" (row 1 label)
- "CK liên kết BH — Công dịch vụ" (row 2 label)
- "Giảm trừ bồi thường" (row 3 label)
- "Khấu hao vật tư / thay mới" (row 4 label)
- "Khấu trừ BH" (row 5 label)
- "− {value}" (cột BH rows 1-2 — dấu trừ Unicode '−' U+2212, prefix tiền tệ)
- "+ {value}" (cột KH rows 3-5 — dấu cộng)

### Section: AC-5 PaymentBalance (13692:113139)
- "Cân thanh toán" (section header — muted)
- "Bảo hiểm thanh toán" (row 1 cell 1 label — xanh)
- "Khách hàng thanh toán" (row 1 cell 2 label — cam)
- "Tổng thanh toán" (row 2 label — đen)

---

## Design Tokens

### Section: Panel container (13535:159225)
- colors:
  - Panel BG: `#ffffff` → `bg-background`
  - Panel border: 1px solid `#e4e4e7` → `border-border`
  - Title text: `#18181b` → `text-foreground`
- typography:
  - Panel title: 18px / lh 28px / weight 600 → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
- spacing:
  - Title row padding: 12/16 (v/h) → `py-3 px-4`
  - Section gap (giữa AC-3/AC-4/AC-5): 0 (sát nhau, divider qua border)
- radius:
  - Panel: 8px → `rounded-lg` (token `border radius/lg`)
- size:
  - Panel: 600×764

### Section: Section header (chung AC-3/AC-4/AC-5)
- colors:
  - Header BG: `#f4f4f5` → `bg-muted` (token `base/muted`)
  - Header text: `#71717a` → `text-muted-foreground` (token `base/muted-foreground`)
- typography:
  - Header text: 14px / weight 500 / leading 1 → `text-sm font-medium` (token `text small/leading-none/medium`)
- spacing:
  - Header padding: 8/8 → `px-2 py-2`
- size:
  - Header h: 36 → `h-9`

### Section: AC-3 Table cells
- colors:
  - Cell BG: `#ffffff`
  - Cell border-top "Cộng sau VAT": 1px solid `#e4e4e7`
  - Cell value `#18181b`
- typography:
  - Header col 14px / weight 500 muted-foreground
  - Data cell 14px / weight 400 foreground
  - Total row 14px / weight 600 → `font-semibold`
- spacing:
  - Cell padding (verify with screenshot — approx 8/8 hoặc 8/16)
- size:
  - 3 cols × 200px wide, 5 rows total height 248px

### Section: AC-4 Allocation
- colors:
  - Row label `#18181b`
  - BH negative value: `#16a34a` → `text-foreground-success` (token `base/foreground-success`)
  - KH positive value: `#dc2626` → `text-foreground-error` (token `base/foreground-error`)
  - BH BG (verify with screenshot)
- typography:
  - Label 14px / weight 400 → `text-sm`
  - Value 14px / weight 400 → `text-sm` (right-aligned)
- size:
  - 3 cols × 200px wide × 5 rows; total height 260px

### Section: AC-5 PaymentBalance — 3 ô highlight
- colors (Cell BH):
  - BG `#f0fdf4` → `bg-background-success` (token `base/background-success`)
  - Label `#16a34a` → `text-foreground-success`
  - Value `#16a34a`
- colors (Cell KH):
  - BG `#fff7ed` → `bg-background-warning` (token `base/background-warning`)
  - Label `#ea580c` → `text-foreground-warning` (token `base/foreground-warning`)
  - Value `#ea580c`
- colors (Cell 3 / Tổng):
  - BG `#ffffff` → `bg-background`
  - Label `#18181b` → `text-foreground` (weight 600)
  - Value `#18181b` (weight 700)
- typography:
  - Label: 14px / weight 500 → `text-sm font-medium`
  - Value: 18px / weight 600 → `text-lg font-semibold` (BH/KH) hoặc 18px / 700 → `text-lg font-bold` (Tổng)
- spacing:
  - Cell padding: 12/16 (v/h) → `py-3 px-4`
- size:
  - Row 1 height: 52px; Row 2 height: 52px → `h-13`

---

## Screenshots
> assets/wave02-ins-stl-create--fullscreen-a5/
- `_full.png` — Panel A5 2-cột full frame (13535:159225, 1212×816)
- `13692-113074-payer-breakdown.png` — AC-3 PayerBreakdownTable (3 cols × 5 rows)
- `13787-116665-insurance-allocation.png` — AC-4 InsuranceAllocation (5 dòng × 3 cols với dấu/màu)
- `13692-113139-payment-balance.png` — AC-5 PaymentBalance (Row 1 3 ô + Row 2 Tổng full)
