---
feat: FEAT-OB-EDIT
feat_file: Product/features/FEAT-OB-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14854-94446&t=fabmGKlGamljM40l-4
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14854:94446"
fetched_at: 2026-07-08T10:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (root frame — clientFrameworks=react, forceCode=true)
  get_screenshot: partial (2/3 — rate limit hit on 3rd call for Page Header section)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (edit form default state chỉ được capture — hover/focus/error/disabled không có variant frame riêng trong Figma)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (missing: hover/focus/disabled variants for Select/Input/Button — infer từ shadcn baseline `_ref-web-transform-figma.md §1.5`)
screenshots:
  - assets/wave04-ob-edit/_full.png
  - assets/wave04-ob-edit/14854-93468.png
---

# Oracle — FEAT-OB-EDIT (web) · wave04

> Design-conformance oracle cho `agent-test-ui` verify implementation khớp Figma (5 cấp).
> KHÔNG có mapping code — chỉ facts để verify. Consumer: `rules-test-ui` + `design-traceability.md`.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Sửa chi tiết tồn kho vật tư hàng hoá (default, filled) | `14854:93461` | 1440×1024 | `assets/wave04-ob-edit/_full.png` |
| Section — Thông tin tồn đầu kỳ (form content) | `14854:93468` | 1216×250 | `assets/wave04-ob-edit/14854-93468.png` |

> Section-parent `FEAT-OB-EDIT` (14854:94446, 4248×1423) là container chứa **1 frame variant** (default filled state).
> KHÔNG có variant frame riêng cho error / focus / disabled state trong Figma → verify pixel-state → infer từ shadcn baseline.

---

## Component Inventory

### Screen: Sửa chi tiết tồn kho vật tư hàng hoá (14854:93461)

| Component (shadcn primitive) | Count | Brief |
|---|---|---|
| Navbar (top-level, GMS shell) | 1 | brand blue bar + secondary tab strip; tab "Tồn đầu kỳ" active (underline 2px `#0052ff`) |
| Page Header (title row) | 1 | back-icon + H1 "Sửa chi tiết tồn kho vật tư hàng hoá" + button group (Huỷ bỏ / Lưu) |
| Button — Ghost / icon-only (back) | 1 | `←` arrow, size=icon (40×40) |
| Button — Outline / size=lg | 1 | "Huỷ bỏ", h-10 px-8 |
| Button — Default (brand) / size=lg | 1 | "Lưu", h-10 px-8, bg-primary (`#0052ff`) |
| Section title (h2) | 1 | "Thông tin tồn đầu kỳ", text-lg semibold |
| Select | 4 | Sản phẩm nội bộ · Kho · Đơn vị tính · Tồn đến ngày (date-select with calendar icon) |
| Input / Basic | 2 | Số lượng tồn · Giá trị tồn |
| Section Footer / 2 | 1 | left copyright + right button-link group (Hướng dẫn sử dụng / Hỗ trợ / Hotline) |

**Form field grid** (Section `14854:93468`):
- Layout: 3 rows × 2 columns; row-gap = 16px; column-gap = 16px
- Each column: `flex-[1_0_0]` (600px wide at 1216px container)
- Row 1: [Select "Sản phẩm nội bộ *"] · [Select "Kho *"]
- Row 2: [Select "Đơn vị tính"] · [Input "Số lượng tồn *"]
- Row 3: [Select "Tồn đến ngày *" — with calendar icon] · [Input "Giá trị tồn"]

> W-R8 note (mode-conditional): edit-only components — pre-filled values visible in Figma default state (Sâm / K02 / kg / 825,00 / 30/04/2026 / 103.125.000). Component structure identical to create; DEV must annotate `_mode: edit-only` for prefilled data source (from `UpdateOpeningBalanceLine` GraphQL query hydration).

---

## Variant & State

### Select (`Sản phẩm nội bộ`, `Kho`, `Đơn vị tính`, `Tồn đến ngày`) — shadcn `Select`
- Variants observed in Figma: **default filled** (has selected value visible)
- States observed: default only (no error/focus/disabled variant frames)
- States expected (infer from shadcn baseline `_ref-web-transform-figma.md §1.5`):
  - `:focus` → focus-visible ring primary (`#0052ff`)
  - `:disabled` → bg-muted + cursor-not-allowed (for `Đơn vị tính` — BR "ĐVT readonly" auto-set by product)
  - `:error` → border-destructive (`#dc2626`) + `text-foreground-error` for validation msg
- Trigger anatomy: `h-9 (36px) · border-1 solid #d4d4d8 · rounded-md (6px) · shadow-sm · pl-3 pr-2 · gap-1`
- Right-side icon: `vuesax/linear/arrow-down` 16×16 (all except `Tồn đến ngày`); `vuesax/linear/calendar` 16×16 for `Tồn đến ngày`
- Text: 14px, weight 400 (Inter Regular), color `#18181b`, line-height 20px

### Input / Basic (`Số lượng tồn`, `Giá trị tồn`)
- Variants observed: **default filled** (values "825,00", "103.125.000")
- States observed: default only
- States expected (infer):
  - `:focus` → focus ring primary
  - `:error` → border-destructive + helper text below
- Anatomy: `h-9 (36px) · border-1 solid #d4d4d8 · rounded-md (6px) · shadow-sm · px-3 · gap-1`
- Text: 14px Inter Regular, `#18181b`, line-height 20px

### Button — Default/Brand (Lưu)
- Variant: `default` (brand blue)
- Size: `lg` (h-10, px-8)
- BG: `#0052ff` (`base/foreground-brand-CD`)
- Text: 14px Inter Medium, `#ffffff`
- Shadow: `drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)]`
- Radius: `rounded-md` (6px)
- States expected: `:hover` slightly darker · `:disabled` opacity + no cursor · `:loading` spinner

### Button — Outline (Huỷ bỏ)
- Variant: `outline`
- Size: `lg` (h-10, px-8)
- BG: white · Border: 1px solid `#d4d4d8`
- Text: 14px Inter Medium, `#18181b`
- Shadow: `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]`
- Radius: `rounded-md`

### Button — Ghost / icon (back arrow)
- Variant: `ghost`
- Size: `icon` (40×40)
- BG: transparent
- Icon: `vuesax/linear/arrow-left` 20×20 (inferred — Figma shows chevron-back positioned before title)

### Label (all form fields)
- Text: 14px Inter Medium (weight 500), color `#18181b`, line-height 20px (leading-none for label element)
- Required indicator: red asterisk `*` in `#dc2626` — appears on Sản phẩm nội bộ, Kho, Số lượng tồn, Tồn đến ngày
- **NOT required** (no asterisk in Figma): Đơn vị tính, Giá trị tồn

---

## Text Content

### Screen: Sửa chi tiết tồn kho vật tư hàng hoá (14854:93461)

**Navbar (top blue bar)** — verbatim:
- Brand: "GMS"
- Nav links: "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · **"Tồn kho"** (active white bg + primary text) · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục "

**Sub-nav (secondary tab strip under navbar)** — verbatim:
- "Phiếu nhập kho" · "Phiễu xuất kho " · **"Tồn đầu kỳ"** (active — underline `border-b-2 solid #0052ff`, text color `#0052ff`) · "Tính giá xuất kho " · "Báo cáo tồn kho " · "Báo cáo NXT"

> Note: "Phiễu xuất kho" contains typo (Phiễu vs Phiếu) in Figma — verbatim from source.

**Page Header** — verbatim:
- Back button: ← (icon, no visible text)
- Title (H1, text-2xl semibold, `#18181b`): **"Sửa chi tiết tồn kho vật tư hàng hoá"**
- Button "Huỷ bỏ" (outline)
- Button **"Lưu "** (brand — verbatim includes trailing space)

**Section title** (text-lg semibold, `#18181b`): **"Thông tin tồn đầu kỳ"**

**Form field labels + placeholders/values** (verbatim from Figma, filled state):

| Row · Col | Label (verbatim) | Required | Value shown | Right-side icon |
|---|---|---|---|---|
| R1 · C1 | "Sản phẩm nội bộ " | * (red) | "Sâm" | arrow-down |
| R1 · C2 | "Kho " | * (red) | "K02" | arrow-down |
| R2 · C1 | "Đơn vị tính" | — | "kg" | arrow-down |
| R2 · C2 | "Số lượng tồn " | * (red) | "825,00" | (none) |
| R3 · C1 | "Tồn đến ngày" | * (red — text " *" appended) | "30/04/2026" | calendar |
| R3 · C2 | "Giá trị tồn" | — | "103.125.000" | (none) |

**Section Footer (bottom bar)** — verbatim:
- Left: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" *(Figma has "Phầm" typo — verbatim)*
- Right buttons (link style, text `#474847`): "Hướng dẫn sử dụng " · "Hỗ trợ" · "Hotline: 0985135050"

**Validation error messages** (from FEAT §AC — not visible in Figma default state; agent-test-ui use as expected error text supplemented from FEAT):
- `ERR-INV-010` — Sản phẩm ngừng hoạt động
- `ERR-INV-020` — Kho không tồn tại
- `ERR-INV-024` — Kỳ kế toán đã đóng (Tồn đến ngày)
- `ERR-INV-032` — Số lượng tồn phải > 0
- `ERR-INV-033` — Giá trị tồn phải ≥ 0
- `ERR-INV-034` — (Mã + Kho) trùng dòng OB khác (BR-OB-012)
- `ERR-INV-035` — Tồn đến ngày ≥ ngày phiếu nhập/xuất đã ghi sổ (OB phải là điểm khởi đầu)
- `ERR-INV-036` — Tồn lũy kế < 0 point-in-time

---

## Design Tokens

### Screen: Sửa chi tiết tồn kho vật tư hàng hoá (14854:93461)

**Colors** (from `get_variable_defs`, resolved to hex → expected Tailwind token per `_ref-web-transform-figma.md §1.5`):

| Role | Hex | Figma variable | Expected token (Tailwind v4) |
|---|---|---|---|
| Page background | `#ffffff` | `base/background` | `bg-background` |
| Primary brand (nav active, button Lưu bg, focus ring, tab underline, required `*`… no this is destructive) | `#0052ff` | `base/foreground-brand-CD` / `base/background-brand-CD` / `base/border-brand-CD` | `bg-primary` / `text-primary` / `border-primary` |
| Foreground text (title, label, value) | `#18181b` | `base/foreground` | `text-foreground` |
| Muted text (inactive sub-nav) | `#71717a` | `base/muted-foreground` | `text-muted-foreground` |
| Input border | `#d4d4d8` | `base/input` | `border-input` |
| Divider / border | `#e4e4e7` | `base/border` | `border` |
| Required asterisk `*` / error text | `#dc2626` | `base/foreground-error` | `text-destructive` (or `text-foreground-error`) |
| Button-brand text on colored bg | `#ffffff` | `base/primary-foreground` | `text-primary-foreground` |
| Footer text (dark-3) | `#474847` | `Dark/3` | (raw hex — no dedicated token; DEV may map to `text-neutral-600` `#525252` if approx acceptable, else custom var) |
| Notification badge dot | `#ef4444` | `base/background-error-reverse` | `bg-destructive` (approx) |

**Typography** (from `get_variable_defs` + `get_design_context.styles`, verify per element):

| Role | Font | Size | Weight | Line-height | Letter-spacing | Expected class |
|---|---|---|---|---|---|---|
| Page H1 title (Sửa chi tiết…) | Inter | 24px | 600 (Semi Bold) | 32px | 0 | `text-2xl font-semibold` |
| Section H2 title (Thông tin tồn đầu kỳ) | Inter | 18px | 600 (Semi Bold) | 28px | 0 | `text-lg font-semibold` |
| Label (form field) | Inter | 14px | 500 (Medium) | 20px (leading-normal) or 0 (leading-none — see notes below) | 0 | `text-sm font-medium` |
| Input value (filled) | Inter | 14px | 400 (Regular) | 20px | 0 | `text-sm` |
| Button text (Huỷ bỏ, Lưu, Nav link) | Inter | 14px | 500 (Medium) | 20px | 0 | `text-sm font-medium` |
| Nav brand (GMS) | Inter | 16px | 600 (Semi Bold) | 24px | 0 | `text-base font-semibold` |
| Footer copyright | Inter | 14px | 300 (Light) | 20px | 0 | `text-sm font-light` |

> Label leading-none observation: `Sản phẩm nội bộ`, `Kho`, `Tồn đến ngày` labels use `leading-[0]` (compact); `Đơn vị tính`, `Số lượng tồn`, `Giá trị tồn` labels use `leading-none` (=1). Verify wraps text at 14px baseline uniformly across labels.

**Spacing** (from `get_variable_defs` — spacing/N scale = 4×N px):

| Role | Value | Token |
|---|---|---|
| Page-container padding-x | 32px | `px-8` (spacing/8) |
| Page-Header vertical padding (Flex row) | 20px top/bottom | `py-5` (spacing/5) |
| Page-Header gap between title row & content | 24px | `gap-6` (spacing/6) |
| Section vertical gap (title↔grid) | 16px (from Title text `pb-4`) | `pb-4` (spacing/4) |
| Form grid row-gap | 16px | `gap-4` |
| Form grid column-gap (between the 2 cols) | 16px | `gap-4` |
| Label ↔ input gap (within Select/Input) | 8px | `gap-2` (spacing/2) |
| Button internal gap (icon ↔ label) | 8px | `gap-2` |
| Button padding | 32px h · 8px v (size=lg) | `px-8 py-2` |
| Input/Select padding | 12px h · 8px v | `px-3 py-2` |
| Section Footer padding | 16px h · 4px v | `px-4 py-1` |
| Sub-nav link padding | 16px h · 12px v | `px-4 py-3` |

**Radius**:

| Role | Value | Token |
|---|---|---|
| Input / Select / Button rounded | 6px | `rounded-md` |
| Nav link background rounded | 6px | `rounded-md` |
| Avatar | 9999px | `rounded-full` |
| Footer link button | 8px | `rounded-lg` |

**Shadow**:

| Role | Value | Token |
|---|---|---|
| Input / Select | `0px 1px 2px 0px rgba(0,0,0,0.05)` | `shadow-sm` |
| Button outline (Huỷ bỏ) | `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]` | ≈ `shadow-sm` |
| Button brand (Lưu) | `drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)]` | ≈ `shadow-sm` (2-layer) |

**Sizing** (from `get_variable_defs` — width/height/N scale = 4×N px):

| Role | Value | Token |
|---|---|---|
| Input / Select trigger height | 36px | `h-9` (height/h-9) |
| Button (Huỷ bỏ / Lưu) height | 40px | `h-10` (height/h-10) |
| Button icon-only (back / notification / avatar wrapper) | 40×40 | `size-10` |
| Icon inside button | 20×20 | `size-5` |
| Icon inside input/select right slot | 16×16 | `size-4` |
| Navbar logo icon | 36×36 | `size-9` |
| Avatar | 40×40 | `size-10` |
| Separator (vertical, in navbar) | 0×20 | `h-5 w-0` (1px inset border-line) |
| Page-container max-width | 1280px | `max-w-[1280px]` |
| Form section content width | 1216px (1280 − 2·32 padding) | intrinsic from container |
| Form column width (each of 2 side-by-side) | 600px each · gap 16px | `flex-[1_0_0]` split; container 1216 = 2×600 + 16 |

---

## Screenshots

> `assets/wave04-ob-edit/` — 2 PNGs captured (rate limit hit on 3rd request; `_full.png` covers whole screen including header)

- `_full.png` — toàn screen edit (1440×1024) — header row + form section + footer
- `14854-93468.png` — Section: Thông tin tồn đầu kỳ (form content, 1216×250) — 3 rows × 2 cols grid

**Not captured (rate-limited)**: dedicated PNG for Page Header section `14854:93465`. Header content fully covered by `_full.png` — pixel-perfect header verify still viable từ `_full.png` (native resolution, no downscale since root width 1440 ≤ 2048).

---

## Notes for `agent-test-ui`

- **Screen-coverage gate**: 1 conformance TC minimum for edit screen (default filled state).
- **Variant coverage supplement**: hover/focus/disabled/error variants NOT in Figma → agent-test-ui verify these state transitions against shadcn baseline defaults + FEAT AC error scenarios (AC-5..AC-9). Missing hover/focus/disabled Figma variants ≠ oracle failure — `data_completeness.interaction_states = partial`.
- **Header text verbatim (W-R1)**: "Sửa chi tiết tồn kho vật tư hàng hoá" (note "hoá" not "hoà"/"hóa"), "Huỷ bỏ" (not "Hủy bỏ"), "Lưu " (trailing space in Figma), "Thông tin tồn đầu kỳ".
- **Field label verbatim (W-R1)**: "Sản phẩm nội bộ " (trailing space + red `*`), "Kho " (trailing space + red `*`), "Đơn vị tính" (no `*` — readonly per BR), "Số lượng tồn " (trailing space + red `*`), "Tồn đến ngày" (red " *" appended), "Giá trị tồn" (no `*`).
- **Sub-nav tab verify**: "Tồn đầu kỳ" tab MUST be active (underline `border-b-2 solid #0052ff` + text `#0052ff`); other tabs muted `#71717a`.
- **Datepicker component**: `Tồn đến ngày` uses Select-style trigger with `vuesax/linear/calendar` icon 16×16 — verify DEV renders as date-picker (with popover calendar) not plain input.
- **Đơn vị tính auto-set**: readonly per BR "ĐVT readonly" — Select trigger renders in disabled/read state (not editable dropdown). Value derives from selected `Sản phẩm nội bộ` (=ĐVT chính of product).
- **Layout structure**: 2-column grid, KHÔNG flatten thành 1 column. Each row's 2 fields side-by-side, 16px gap. Container width 1216px = 600 + 16 + 600. Panel-split confirmed.
- **Absent from Figma default state (verify absence intentional)**: no empty-state, no delete button, no image upload, no unsaved-changes prompt (may exist as separate flow — cross-check FEAT §6 EC-7 for stale-record scenario).
