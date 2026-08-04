---
feat: FEAT-CAT-GRP-CREATE
feat_file: Product/features/FEAT-CAT-GRP-CREATE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24247&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24247"
fetched_at: 2026-06-29T03:14:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: cached from sibling (App-Garage-V3 vocab)
  get_design_context: success (frame 21252:51299)
  get_screenshot: success (2 PNG: _full + 21252-51299 screen)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (1 default form state — Figma không có error/loading/success variant)
  text_content: complete (verbatim từ design_context)
  design_tokens: complete (variable_defs)
  interaction_states: partial (Figma không render :focus/:error/:disabled — fallback baseline)
screenshots:
  - assets/wave03-cat-grp-create/_full.png
  - assets/wave03-cat-grp-create/21252-51299.png
---

# Oracle — FEAT-CAT-GRP-CREATE (mobile) · wave 03

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter). Section `21555:24247`
> "FEAT-CAT-PROD-CREATE" — màn "Thêm nhóm vật tư hàng hóa" form 4-field + textarea + bottom action
> bar (Huỷ / Lưu).

---

## Screen Inventory

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Thêm nhóm VTHH — form default (sample data filled) | `21252:51299` | 375×812 | `assets/wave03-cat-grp-create/21252-51299.png` |
| (Aggregate) Section single screen | `21555:24247` | 4901×1058 | `assets/wave03-cat-grp-create/_full.png` |

> Section chỉ có 1 frame chính (`21252:51299`). Status bar 44 + AppBar 52 = header 96. Body 568px
> scroll. Bottom action bar 104px (8 padtop + 36 button + safe area 20 + indicator 4×24 hover).

---

## Component Inventory

### Screen — Thêm nhóm VTHH (`21252:51299`)

**Header chrome**
| Component | Brief | Flutter mapping |
|---|---|---|
| Status bar | h=44 system | `MediaQuery.padding.top` |
| AppBar (`Bars/Nav Bars: Standard`) | h=52, p=`px=16 py=8`, left back arrow `vuesax/linear/arrow-left` 20px, title center "Thêm nhóm vật tư hàng hóa" Semi Bold 16 `#262626` w=279 | `AppBar` |
| Divider (AppBar border-bottom) | 1px solid `#e8e8ea` | `Border(bottom: ...)` |

**Body — "Info KH" Card** (`21254:51561`, full-width, p=16, bg white)
| Component | Brief | Flutter mapping |
|---|---|---|
| Spacer top | h=6 bg `#e8e8ea` (`bg-Primary`) — section divider | `Container(height: 6, color: AppColors.bgPrimary)` |
| Section header row | "Thông tin chung" Bold 18 `#262626` ↔ Switch toggle (opacity=0 hidden — not used) | Row |
| Input "Mã nhóm VTHH *" | Required label, sample value "MN1202012" | `AppTextField` |
| Input "Tên nhóm VTHH *" | Required label, sample "Công ty CP Thanh toán Dịch Vụ Hưng Hà" | `AppTextField` |
| Select "Thuộc nhóm" | dropdown w/ value "Vật tư hàng hoá" + chevron-down 20px | `AppDropdown` |
| Select "Trạng thái" | dropdown w/ value "Đang hoạt động" + chevron-down | `AppDropdown` |
| Textarea "Mô tả" | placeholder "Nhập mô tả" Regular 14 `#b8babf`, h=100, counter "0/250" right-bottom Regular 12 `#b8babf` | `AppTextField(maxLines: 4, maxLength: 250)` |

**Bottom action bar** (`21252:51305`)
| Component | Brief | Flutter mapping |
|---|---|---|
| Container | bg white, p=`px=16 pb=20 pt=16`, gap=8, radius top-left=8 top-right=8, shadow `0px -4px 12px rgba(0,0,0,0.06)` | `Container` |
| Button "Huỷ" (secondary) | flex=1, bg `#eaeaea` (Dark/100), text `#273243` Bold 16, radius 8, p=`px=16 py=12` | `AppButton.text` secondary |
| Button "Lưu" (primary) | flex=1, bg `#0052ff`, text white Bold 16, same dims | `AppButton.text` primary |
| Home indicator | bg=black w=134 h=4 radius=100 + container px=10 py=8 | `Container` |

---

## Variant & State

### Input field (`Input` / `_Partials/Text Field/Label`)
- **Variant 1 — required** (Mã nhóm VTHH / Tên nhóm VTHH): label Semi Bold 14 `#262626` + " *" suffix red `#ed1f42`. Text field h=44, p=12, border 1px solid `#e8e8ea`, radius 8.
- **Variant 2 — optional** (Thuộc nhóm / Trạng thái / Mô tả): label without "*".
- **States observed**: filled (with value). KHÔNG có :empty / :focus / :error / :disabled trong Figma → suy theo baseline.
  - `:focus` → border 1px `#0052ff` (`border-Active`).
  - `:error` → border 1px `#ed1f42` (`border-Error`), + helper text red bên dưới.
  - `:disabled` → bg `#f3f3f4`, text `#888c94`.

### Select dropdown (Thuộc nhóm / Trạng thái)
- **Variants**: collapsed only (Figma không show expanded). Field h=44, p=12, border 1px `#e8e8ea`, radius 8, trailing chevron-down 20×20 `#262626`.
- **States**: tap → open bottom sheet hoặc dropdown menu (Material default).

### Textarea (Mô tả)
- **Variant**: empty placeholder "Nhập mô tả" — counter "0/250" right-bottom.
- **States**: empty placeholder · typed (counter updates "{N}/250") · max-length (250 chars, hard limit).

### Button (Huỷ / Lưu)
- **Variant 1 — Huỷ (secondary)**: bg `#eaeaea`, text `#273243` Bold 16, radius 8, p=12.
- **Variant 2 — Lưu (primary)**: bg `#0052ff`, text white Bold 16, same.
- **States**: default observed. `:pressed` ripple Material. `:disabled` (form invalid) → opacity 0.5 — fallback baseline.

### Switch (`Controls / Switches`) — opacity=0 trong layout
- Variant `selected="True"`, `state="Default"`, bg `#0052ff` (`cardoctor/700`), knob white 20px right-aligned, h=24 w=46 radius=32.
- **Note**: trong screen này `opacity-0` (hidden) — NOT rendered. Bỏ qua trong impl.

---

## Text Content

> Verbatim từ `get_design_context(21252:51299)`.

### AppBar
- Title: **"Thêm nhóm vật tư hàng hóa"** (NOTE: "hóa" có dấu sắc trên ó — verbatim Figma)
- Hidden right label: "Cài đặt lại" (opacity=0 — not rendered)

### Section
- Section title: **"Thông tin chung"** (Bold 18 `#262626`)

### Form fields
- Label 1: **"Mã nhóm VTHH "** + ` *` (red asterisk) — sample value: **"MN1202012"**
- Label 2: **"Tên nhóm VTHH "** + ` *` (red asterisk) — sample value: **"Công ty CP Thanh toán Dịch Vụ Hưng Hà"**
- Label 3: **"Thuộc nhóm"** — sample value: **"Vật tư hàng hoá"**
- Label 4: **"Trạng thái"** — sample value: **"Đang hoạt động"**
- Label 5: **"Mô tả"** — placeholder: **"Nhập mô tả"**, counter: **"0/250"**

### Bottom buttons
- **"Huỷ"** (secondary; NOTE: dấu hỏi trên Hu — "Huỷ" KHÔNG phải "Hủy")
- **"Lưu"** (primary)

> **Verbatim trap**: label có trailing space trước "*" → giữ nguyên `"Mã nhóm VTHH "` + asterisk
> tách 2 span (font-weight giữ SemiBold cho label, red plain Regular cho `*`).

---

## Design Tokens

> **Cached from `get_variable_defs(21555:24017)`** — sibling cùng file App-Garage-V3.

### Colors

| Hex | Role | Expected Flutter token |
|---|---|---|
| `#ffffff` | Card bg, screen bg | `AppColors.bgBase` |
| `#262626` | Section title, label, AppBar title | `AppColors.textPrimary` (`#262626` variant) |
| `#273243` | "Huỷ" button text | `AppColors.textPrimary` (alias) |
| `#e8e8ea` | Input border, AppBar border-bottom | `AppColors.borderPrimary` |
| `#eaeaea` | "Huỷ" button bg (Dark/100) | (NOT in semantic baseline — drift, use raw `Color(0xFFeaeaea)` hoặc map `AppColors.bgSecondary` `#f3f3f4` — KHÁC nhau!) |
| `#0052ff` | "Lưu" button bg, switch bg active | `AppColors.buttonBackgroundPrimary` / `bgActive` |
| `#b8babf` | Placeholder text "Nhập mô tả", counter "0/250" | `AppColors.textQuaternary` |
| `#888c94` | Tertiary text | `AppColors.textTertiary` |
| `#ed1f42` | Required `*` asterisk | `AppColors.textErrorPrimary` |
| `#f3f3f4` | (`bg-Secondary`) | `AppColors.bgSecondary` |
| `#000000` | Home indicator | `BaseColor.black` |

### Typography

| Style | Used at | Token |
|---|---|---|
| `Heading/H3` Bold 18/26 | Section title "Thông tin chung" | `AppTextStyle.textHeadingH3` |
| `Heading/H4` Bold 16/24 | Button text "Huỷ"/"Lưu" | `AppTextStyle.textHeadingH4` |
| `Subtitle/S4` SB 16/24 | AppBar title "Thêm nhóm vật tư hàng hóa" | `AppTextStyle.textSubtitleS4` |
| `Subtitle/S5` SB 14/20 | Form labels "Mã nhóm VTHH"/"Tên nhóm VTHH"/"Thuộc nhóm"/"Trạng thái"/"Mô tả" | `AppTextStyle.textSubtitleS5` |
| `Body/B5` Med 14/20 | (none direct — input value uses Caption/C5 Regular instead) | `AppTextStyle.textBodyB5` |
| `Caption/C5` Reg 14/20 | Input value text (filled) | `AppTextStyle.textCaptionC5` |
| `Caption/C7` Reg 12/18 | Counter "0/250" | `AppTextStyle.textCaptionC7` |
| `Regular/None/Medium` Med 16/16 | Status bar "9:41" | (system) |

### Spacing

| Element | Value | Token |
|---|---|---|
| Card "Info KH" inner p | `p=16` all | `AppSizes.spacing16` |
| Section header ↔ form gap | `gap=16` vertical | `Gap(AppSizes.spacing16)` |
| Form row gap (between fields) | `gap=12` vertical | `Gap(AppSizes.spacing12)` |
| Inside Frame 1948757491 (nested wrapper for last 3 fields) gap | `gap=12` | `Gap(AppSizes.spacing12)` |
| Input label ↔ field gap | `gap=8` vertical | `Gap(AppSizes.spacing8)` |
| Textarea label ↔ field gap | `gap=8` vertical | `Gap(AppSizes.spacing8)` |
| Textarea field ↔ counter gap | `gap=4` vertical | `Gap(AppSizes.spacing4)` |
| Input field padding | `p=12` all | `EdgeInsets.all(12)` (not match scale → literal) |
| Bottom bar gap | `gap=8` between 2 buttons | `Gap(AppSizes.spacing8)` |
| Bottom bar padding | `pb=20 pt=16 px=16` | mixed literal |
| Button inner padding | `px=16 py=12` | mixed literal |
| Spacer divider top | h=6 | `Container(height: 6)` |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| Input border | 1px solid `#e8e8ea` | `Border.all(color: AppColors.borderPrimary, width: 1)` |
| Input radius | `8px` | `BorderRadius.circular(8)` |
| Textarea border + radius | same as Input | (reuse) |
| Button radius | `8px` | `BorderRadius.circular(8)` |
| Bottom bar top radius | `top-left=8 top-right=8` | `BorderRadius.only(topLeft: 8, topRight: 8)` |
| Bottom bar shadow | `0px -4px 12px rgba(0,0,0,0.06)` | `BoxShadow(offset: Offset(0,-4), blurRadius: 12, color: Colors.black.withOpacity(0.06))` |
| AppBar bottom border | 1px solid `#e8e8ea` | `Border(bottom: BorderSide(color: AppColors.borderPrimary, width: 1))` |
| Home indicator radius | 100 (pill) | `BorderRadius.circular(100)` |

### Icons

| Name | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20×20 | `#262626` | AppBar back |
| `vuesax/linear/arrow-down` | 20×20 | `#262626` | Select dropdown chevron |

### Bounds

| Element | W × H |
|---|---|
| Screen frame | 375 × 812 |
| AppBar | 375 × 52 |
| Card "Info KH" | 375 × 562 |
| Card inner content area | 343 × 488 |
| Input field | 343 × 44 (label ~24 + gap 8 + field 44 = total ~72 per "Input" instance per metadata) |
| Textarea | 343 × 152 (label 24 + gap 8 + body 100 + gap 4 + counter 16) |
| Bottom action bar | 375 × 104 |
| Button (Huỷ / Lưu) | (375-16-16-8)/2 ≈ 167.5 × 48 |

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-grp-create/_full.png` | `21555:24247` | Section full single screen (4901×1058) |
| `assets/wave03-cat-grp-create/21252-51299.png` | `21252:51299` | Screen — Thêm nhóm VTHH form (375×812, golden reference) |

---

## Notes (oracle interpretation)

1. **Switch toggle hidden** (`opacity-0`) trong section header → KHÔNG render trong impl. Có thể
   legacy mockup leftover. Confirm BA nếu cần switch (active/inactive group toggle?).
2. **"Tên nhóm VTHH" sample value too long** ("Công ty CP Thanh toán Dịch Vụ Hưng Hà" = 36 char) —
   visual overflow trong 343px → impl phải hỗ trợ text wrap/scroll trong input.
3. **Counter "0/250"** — initial state empty. Live update khi user type, hit 250 max-length → block
   further input. Test edge case Vietnamese diacritic counting (1 char or grapheme cluster).
4. **Button "Huỷ" bg `#eaeaea`** ≠ `bg-Secondary` `#f3f3f4` — 2 hex khác nhau. Implementer cần
   confirm BA chọn token nào (likely `#f3f3f4` semantic; Figma `#eaeaea` từ Dark/100 legacy variable).
5. **Required label format** verbatim trap: label string = `"Mã nhóm VTHH "` (trailing space) +
   span ` *` red. Đừng paraphrase thành "Mã nhóm VTHH*" (sticky asterisk).
6. **Bottom action bar variant**: 2-button stack flex equal. FEAT có thể yêu cầu disable "Lưu" khi
   form invalid → suy `:disabled` opacity 0.5 baseline.
7. **AppBar title font weight DRIFT**: Figma `Bars/Nav Bars: Standard` shows Semi Bold 16, nhưng
   instance "Thêm nhóm vật tư hàng hóa" trong screen này được override left/right alignment (absolute
   positioning center+26px top). Verify implementation render giữa AppBar đúng vertical center.
