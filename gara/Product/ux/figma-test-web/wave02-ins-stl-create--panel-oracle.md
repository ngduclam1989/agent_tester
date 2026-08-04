---
feat: FEAT-INS-STL-CREATE
feat_file: Product/features/FEAT-INS-STL-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-157815&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13535:157815"
screen_slug: panel
fetched_at: 2026-06-18T13:35:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (parent section structure đã capture trong DEV spec wave02-ins-stl-create--panel.md)
  get_variable_defs: success
  get_design_context: skipped (parent > limit; supplement từ DEV spec)
  get_screenshot: success (2 PNG fresh — variant có BH + không BH)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (supplemented từ DEV spec)
  variant_state: complete (2 variant chính: có BH + không BH)
  text_content: complete
  design_tokens: complete (variable_defs success)
  interaction_states: partial (Figma không render hover/focus/disabled — verify shadcn baseline + AC-1 trigger flow)
screenshots:
  - assets/wave02-ins-stl-create--panel/_full.png
  - assets/wave02-ins-stl-create--panel/13545-91079-no-insurance.png
design_vs_feat_notes:
  - "Screen `13535:155254` (có BH 1440x2644) capture page layout đầy đủ; section AC-3/AC-4/AC-5 (Tổng giá dịch vụ panel) detail xem oracle wave02-ins-stl-create--fullscreen-a5-oracle.md."
  - "Screen `13545:91079` (không BH 1440x1482) là variant rút gọn AC-2: bỏ section 'Thông tin bảo hiểm' + 'Bảo hiểm chi trả' + AC-4 'Phân bổ Bảo hiểm' + ô 'Bảo hiểm thanh toán' trong AC-5."
  - "Screen `13535:157275` (SO Detail context — KH doanh nghiệp có BH) chỉ minh hoạ trigger AC-1 'Tạo phiếu quyết toán' từ SO hoàn thành; KHÔNG thuộc scope FEAT-INS-STL-CREATE (xem oracle wave02-ins-so-adjustment-oracle.md)."
  - "AC-6 'Tổng tiền bảo hiểm trả' read-only computed — Figma capture confirmation panel; baseline FEAT-STL-CREATE form input drill chưa đủ sâu (panel chỉ là display final)."
---

# Oracle — FEAT-INS-STL-CREATE (web) · wave 02 · screen "panel"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13535:157815`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **Tạo phiếu quyết toán bảo hiểm** — Confirmation page
> với panel "Tổng giá dịch vụ" read-only (AC-3/AC-4/AC-5). 2 variant chính: **có BH** + **không BH**.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Confirmation "Tạo phiếu QT" — Có BH & KH | 13535:155254 | 1440×2644 | assets/wave02-ins-stl-create--panel/_full.png |
| Confirmation "Tạo phiếu QT" — Không BH (rút gọn AC-2) | 13545:91079 | 1440×1482 | assets/wave02-ins-stl-create--panel/13545-91079-no-insurance.png |

> 2 frame = **cùng 1 page** với 2 mode `hasInsurance=true|false`. DEV implement với 1 component prop-driven.

### Section-container in-scope (overall page level)

| Section | nodeId (parent) | size (full page) | notes |
|---|---|---|---|
| Page header — Title "Tạo phiếu quyết toán" + breadcrumb | (instance baseline) | 1216×100 | shared component |
| Section/SO — "Thông tin phiếu dịch vụ" | (baseline) | 1216×~120 | baseline FEAT-STL-CREATE, không scope FEAT này |
| Section/Customer — "Thông tin khách hàng" | (baseline) | 1216×~100 | baseline |
| Section/Insurance — "Thông tin bảo hiểm" | (only mode `hasInsurance=true`) | 1216×~140 | conditional render |
| Section/CustomerPay — "Khách hàng chi trả" | (baseline) | 1216×~300 | baseline |
| Section/InsurancePay — "Bảo hiểm chi trả" | (only mode `hasInsurance=true`) | 1216×~280 | AC-6 read-only computed |
| Section/TotalServicePanel — "Tổng giá dịch vụ" | (scope FEAT) | 1216×~764 | xem oracle wave02-ins-stl-create--fullscreen-a5-oracle.md |
| Section/Footer Actions | 13692:113142, 113146 | — | 2 button: Hủy + Xác nhận |

---

## Component Inventory

### Screen: Confirmation Có BH & KH (13535:155254)
- PageHeader/3 × 1 — Heading (xlarge/semibold) "Tạo phiếu quyết toán" · Breadcrumb
- Section card × 5-6 — SO / Customer / Insurance (conditional) / CustomerPay / InsurancePay / TotalServicePanel
- TotalServicePanel (AC-3 + AC-4 + AC-5) — detail xem oracle `wave02-ins-stl-create--fullscreen-a5-oracle.md`
- Footer Actions × 1 — Button (secondary, h-9) "Hủy" + Button (brand, h-9) "Xác nhận"

### Screen: Confirmation Không BH (13545:91079) — AC-2 rút gọn
- PageHeader/3 × 1 — identical
- Section card × 3-4 — SO / Customer / CustomerPay / TotalServicePanel (rút gọn)
- **Bỏ** Section/Insurance + Section/InsurancePay (AC-2)
- TotalServicePanel mode `no-insurance`:
  - AC-3 bảng 1 cột "Khách hàng thanh toán" (bỏ cột BH)
  - **KHÔNG** render AC-4 "Phân bổ Bảo hiểm"
  - AC-5 chỉ 2 dòng (KH cam + Tổng đen)
- Footer Actions × 1 — identical

---

## Variant & State

### TotalServicePanel
- variants: `full-insurance` (có BH — 3 cột AC-3, render AC-4, AC-5 3 ô) · `no-insurance` (rút gọn — 1 cột AC-3, không AC-4, AC-5 2 dòng)
- states observed: cả 2 (read-only — không có editable state)

### Button (Footer)
- "Hủy" — variant=secondary outline · size=sm (h-9)
- "Xác nhận" — variant=brand-CD (#0052ff) · size=sm
- states observed: default (enabled)
- disabled/hover/focus: KHÔNG có Figma variant — verify shadcn baseline

### Section card (chung)
- variants: default · conditional (Insurance + InsurancePay render khi hasInsurance=true)

---

## Text Content

### Screen: Confirmation Có BH (13535:155254)
- "Tạo phiếu quyết toán" (page heading)
- "Thông tin phiếu dịch vụ" (section heading)
- "Thông tin khách hàng" (section heading)
- "Thông tin bảo hiểm" (section heading — conditional)
- "Khách hàng chi trả" (section heading)
- "Bảo hiểm chi trả" (section heading — conditional)
- "Tổng giá dịch vụ" (panel heading — scope FEAT)
- "Tổng tiền khách trả" (field label — baseline)
- "Tổng tiền bảo hiểm trả" (field label — AC-6 read-only computed)
- "Hủy" (button)
- "Xác nhận" (button)

### Screen: Confirmation Không BH (13545:91079)
- "Tạo phiếu quyết toán"
- "Thông tin phiếu dịch vụ"
- "Thông tin khách hàng"
- "Khách hàng chi trả"
- "Tổng giá dịch vụ"
- "Tổng tiền khách trả"
- "Hủy"
- "Xác nhận"

(Detail copy của panel "Tổng giá dịch vụ" → wave02-ins-stl-create--fullscreen-a5-oracle.md)

---

## Design Tokens

### Page-level layout
- colors:
  - Page content BG: `#ffffff` → `bg-background` (token `base/background`)
  - Page outer BG: `#f4f4f5` → `bg-muted` (token `base/muted`)
  - Section heading text: `#18181b` → `text-foreground` (token `base/foreground`)
  - Field label muted: `#71717a` → `text-muted-foreground` (token `base/muted-foreground`)
- typography:
  - Page heading: 24px / lh 32px / weight 600 → `text-2xl font-semibold` (token `text 2x large/leading-normal/semibold`)
  - Section heading: 18px / lh 28px / weight 600 → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
  - Field label: 14px / lh 20px / weight 500 → `text-sm font-medium` (token `text small/leading-normal/medium`)
- spacing:
  - PageContainer width: 1280px (80px margin) → `w-[1280px]`
  - Section gap: 24px → `gap-6` (token `spacing/6`)
  - PageContainer padding: 24/32 → `py-6 px-8`
- radius:
  - Section card: 8px → `rounded-lg` (token `border radius/lg`)
- border:
  - Section card: 1px solid `#e4e4e7` → `border border-border`

### Footer Actions
- spacing:
  - gap: 12px → `gap-3` (token `spacing/3`)
  - justify=end
- size:
  - Button h: 36px → `h-9` (token `height/h-9`)
  - Button padding: 16/8 (h/v) → `px-4 py-2`
- radius:
  - Button: 6px → `rounded-md` (token `border radius/md`)
- colors (Hủy):
  - BG `#ffffff` · text `#18181b` · border 1px `#e4e4e7`
- colors (Xác nhận):
  - BG `#0052ff` (token `base/background-brand-CD`) · text `#ffffff` (token `base/primary-foreground`)

---

## Screenshots
> assets/wave02-ins-stl-create--panel/
- `_full.png` — Confirmation "Tạo phiếu QT" có BH & KH (13535:155254, 1440×2644)
- `13545-91079-no-insurance.png` — Confirmation "Tạo phiếu QT" không BH (13545:91079, 1440×1482, rút gọn AC-2)
