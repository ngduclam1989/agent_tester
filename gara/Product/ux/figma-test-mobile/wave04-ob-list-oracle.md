---
feat: FEAT-OB-LIST
feat_file: Product/features/FEAT-OB-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21632-28894&t=30dKkXMi0PSOdK7b-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21632:28894"
fetched_at: 2026-07-08T10:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context:
    "21290:52697": success (persisted, 61.6KB)
    "21290:52992": success (inline)
    "21290:53004": success (persisted, 205.4KB — nested off-viewport "Tạo mới yêu cầu báo giá" frame from adjacent feature; visible content extracted)
    "21290:53556": success (persisted, 220.2KB — same nested off-viewport frame; visible content extracted)
    "21290:54167": success (inline)
    "21290:54179": success (inline)
  get_screenshot: success (7 PNGs — 1 root overview + 6 per-frame)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete
  design_tokens: complete
  interaction_states: partial (only default + one dropdown-open state captured — hover/pressed/disabled variants not in Figma variant set)
screenshots:
  - assets/wave04-ob-list/_full.png
  - assets/wave04-ob-list/21290-52697.png
  - assets/wave04-ob-list/21290-52992.png
  - assets/wave04-ob-list/21290-53004.png
  - assets/wave04-ob-list/21290-53556.png
  - assets/wave04-ob-list/21290-54167.png
  - assets/wave04-ob-list/21290-54179.png
---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Tồn đầu kỳ đã import (main list) | 21290:52697 | 375x812 | assets/wave04-ob-list/21290-52697.png |
| Tìm kiếm sản phẩm - Default | 21290:52992 | 375x812 | assets/wave04-ob-list/21290-52992.png |
| Tìm kiếm sản phẩm - No Results | 21290:53004 | 375x812 | assets/wave04-ob-list/21290-53004.png |
| Tìm kiếm sản phẩm - Results | 21290:53556 | 375x812 | assets/wave04-ob-list/21290-53556.png |
| Bộ lọc sản phẩm - Default | 21290:54167 | 375x812 | assets/wave04-ob-list/21290-54167.png |
| Bộ lọc sản phẩm - Filled (dropdown open) | 21290:54179 | 375x812 | assets/wave04-ob-list/21290-54179.png |

---

## Component Inventory

### Screen: Tồn đầu kỳ đã import (21290:52697)
- Native Status Bar × 1 — clock 9:41 + signal + wifi + battery (Inter Medium 16/16)
- AppBar (Bars/Nav Bars: Standard) × 1 — title "Tồn đầu kỳ" (SemiBold 16/24), leading `Icons.arrow_back` (20×20), trailing group [`Icons.search` 20×20, `Icons.filter` 20×20 with gap 12]
- Card × N (visible 2 full + 1 partial) — product card (rounded 12, drop shadow effect `s2`, white bg, padding 16, gap 12)
  - Product code text (Bold 16/24 Heading/H4) `#IP-BP-0001`
  - Product name text (Regular 14/20 Caption/C5) `Lọc dầu động cơ Toyota`
  - Divider row (1px border)
  - 5 detail rows each: leading icon (20×20 vuesax linear outline) + label (Medium 12/18 Body/B7 secondary) + value (Medium 12/18 Body/B7 primary)
  - Icons observed: `dollar-circle` (Giá trị tồn), `calendar` (Tồn đến ngày), `box` (ĐVT), `note` (Số lượng), `buildings` (Kho)
- Home Indicator × 1 (bottom system bar 375×20 with 4×134 black bar)
- **visual_note**: Metadata + JSX include a "Sản phẩm header row" (car icon + product-type label + Badge "Ghi sổ kho" success-green) at top of each card frame `21290:53008 > 21290:53014`. This row is NOT visible in the rendered PNG for the default variant — it appears hidden/opacity-suppressed in this state. Treat as hidden layer; do NOT invent in FEAT AC-tests.

### Screen: Tìm kiếm sản phẩm - Default (21290:52992)
- Native Status Bar × 1
- AppBar row × 1 — leading `Icons.arrow_back` 20×20 + Search Bar (bg `#f3f3f4` = Base/bg-Secondary, radius 8, h40, padding 8, gap 8) with leading `Icons.search` 20×20 + placeholder text "Tìm kiếm" (Regular 14/20 color `#71717a` muted-foreground)
- Hint block (below AppBar, padding-x 16, gap 12):
  - Section heading text (SemiBold 14/20 Subtitle/S5) `Tìm kiếm sản phẩm theo từ khoá`
  - Bullet list (Regular 14/20 Caption/C5 tertiary `#888c94`): `• Mã sản phẩm`, `• Tên sản phẩm`
- Home Indicator × 1

### Screen: Tìm kiếm sản phẩm - No Results (21290:53004)
- Native Status Bar × 1
- AppBar row × 1 — leading `Icons.arrow_back` + Search Bar with filled value text `IP-BP-0001` (Regular 14/20 primary `#262626`)
- Empty state group (center, vertical): search icon (large ~60px `Icons.search_normal` grey outline) + text "Không có kết quả phù hợp" (SemiBold 16/24 Subtitle/S4 primary) + subtitle "Vui lòng thử lại" (Regular 12/18 Caption/C7 tertiary `#888c94`)
- Home Indicator × 1

### Screen: Tìm kiếm sản phẩm - Results (21290:53556)
- Native Status Bar × 1
- AppBar row × 1 — leading `Icons.arrow_back` + Search Bar with filled value `IP-BP-0001` primary
- Result count header (SemiBold 14/20 Subtitle/S5 primary) — rich text: `2 kết quả tìm kiếm cho "` (SemiBold) + `IP-BP-0001` (Regular 14/20) + `"` (Regular 14/20)
- Result Card × 2 (simplified vs main list; rounded 12, shadow, padding 16, gap 12):
  - Product code (Bold 16/24 H4) `#IP-BP-0001`
  - Product name (Regular 14/20 C5) `Lọc dầu động cơ Toyota`
  - Divider
  - 2 detail rows only: `Kho: Kho chính` + `Giá trị tồn: 1.760.000` (with leading icons `note` + `dollar-circle`)
- Home Indicator × 1
- **visual_note**: Same nested "Sản phẩm header row" (Badge "Ghi sổ kho") from JSX not visible in default render — hidden layer.

### Screen: Bộ lọc sản phẩm - Default (21290:54167)
- Native Status Bar × 1
- AppBar (Bars/Nav Bars: Standard) × 1 — leading `Icons.arrow_back` 20×20 + centered title "Bộ lọc" (SemiBold 16/24 Subtitle/S4 primary); trailing text "Cài đặt lại" defined but rendered with `opacity: 0` (hidden — visual_note)
- Filter form (padding 16, gap 16):
  - Field: `Ngày import` label (SemiBold 14/20 Subtitle/S5 primary `#262626`) + Date range input (h44, border `#e8e8ea`, radius 8, padding 12, gap 8) with leading `Icons.calendar` 20×20 + placeholder "dd/mm/yyyy - dd/mm/yyyy" (Regular 14/20 color `#b8babf` Base/text-Quaternary)
  - Field: `Kho` label (SemiBold 14/20 Subtitle/S5 primary `#273243` Base/text-Primary) + Dropdown input (h44, border `#e8e8ea`, radius 8, padding 12, gap 8) with placeholder text "Chọn kho" (Regular 14/20 Quaternary `#b8babf`) + trailing `Icons.arrow_down` 20×20
- Bottom Action Bar (fixed bottom, w=375, bg white, radius-top 8, shadow `0 -4 12 rgba(0,0,0,0.06)`)
  - Row: pt 16, pb 20, px 16, gap 8 — two flex-1 buttons
    - Secondary button (Base bg `#eaeaea` Dark/100, radius 8, py 12, px 16) — text `Thiết lập lại` (Bold 16/24 H4 color `#273243` Neutral/Text)
    - Primary button (bg `#0052ff` CD Driver/P600-Main, radius 8, py 12, px 16) — text `Áp dụng` (Bold 16/24 H4 white)
- Home Indicator × 1

### Screen: Bộ lọc sản phẩm - Filled (dropdown open) (21290:54179)
- All chrome identical to Default screen
- `Ngày import` field FILLED value `13/12/2002 - 13/12/2002` (Regular 14/20 color `#273243` Base/text-Primary — no longer quaternary placeholder)
- `Kho` field still shows placeholder `Chọn kho` (Quaternary)
- Dropdown Menu overlay (positioned below `Kho` input, w=343, bg white, border `#f3f3f4` Base/border-Secondary, radius 8, shadow `0 4 8 rgba(0,0,0,0.1)`)
  - 3 option rows (Nav Link, w=full, px 12, py 8):
    - `Tất cả kho` — Regular 14/20 Caption/C5 color `#273243` Neutral/900 (default)
    - `Kho chính` — Regular 14/20 Caption/C5 color `#0667ff` CarDoctor/600, bg `#edf7ff` CarDoctor/50 (selected state)
    - `Kho phụ tùng Hưng Yên` — Regular 14/20 Caption/C5 color `#273243` (default)
  - 1px separator at bottom (`#e8e8ea` Base/border-Primary)
- Action bar (Thiết lập lại + Áp dụng) unchanged
- Home Indicator × 1

---

## Variant & State

### AppBar (Bars/Nav Bars: Standard) — used in all 6 screens
- variants: `Standard` (title-centered + leading + trailing group)
- states observed: default (all screens); title uses `textSubtitleS4` (16/SemiBold/24) per binding — **hard rule confirmed**
- trailing action variance:
  - Main list (21290:52697): `[Icons.search, Icons.filter]` gap 12
  - Search screens (52992, 53004, 53556): search bar embedded (no separate trailing group)
  - Filter screens (54167, 54179): text "Cài đặt lại" declared but `opacity=0` (hidden)

### Search Bar (Bars/Search Bars)
- variants: `Default` (empty placeholder) vs `Filled` (query text)
- states observed: default (52992), filled + no-results (53004), filled + results (53556)

### Card (Product / ListItemCard)
- variants: `main-list` (full 5 detail rows) vs `results-list` (2 detail rows compact)
- shadow token: `s2` (Drop shadow triple-layer `#9C9C9C33/1A/14` offset 0,1 radius 20)

### Button Set (bottom action bar)
- variants: `Secondary` (Thiết lập lại) + `Primary` (Áp dụng)
- states observed: default only

### Dropdown Menu (Kho)
- variants: `Nav Link` × 3 options
- states observed: default (Tất cả kho, Kho phụ tùng Hưng Yên) + selected (Kho chính bg CarDoctor/50, text CarDoctor/600)

### Input (Date + Dropdown Kho)
- variants: `Text Fields` w/ leading icon (calendar) + `Text Fields` w/ trailing icon (arrow-down)
- states observed: empty (placeholder Quaternary `#b8babf`) + filled (text Primary `#273243`)

### Empty State (No Results)
- variants: single default state
- icon: large `Icons.search_normal` grey outline (~60px)

---

## Text Content

### Screen: Tồn đầu kỳ đã import (21290:52697) — verbatim VN
- `9:41` (status bar clock)
- `Tồn đầu kỳ` (AppBar title)
- `#IP-BP-0001` (product code, repeated per card)
- `Lọc dầu động cơ Toyota` (product name, repeated per card)
- `Kho:` (label) · `Kho chính` (value)
- `Tồn đến ngày:` (label) · `31/12/2025` (value)
- `Số lượng:` (label) · `10` (value)
- `Giá trị tồn:` (label) · `1.760.000` (value)
- `ĐVT:` (label) · `Cái` (value)
- (hidden in metadata but NOT rendered in default PNG: badge text `Ghi sổ kho`)

### Screen: Tìm kiếm sản phẩm - Default (21290:52992)
- `Tìm kiếm` (search bar placeholder)
- `Tìm kiếm sản phẩm theo từ khoá` (hint heading)
- `Mã sản phẩm` (bullet 1)
- `Tên sản phẩm` (bullet 2)

### Screen: Tìm kiếm sản phẩm - No Results (21290:53004)
- `IP-BP-0001` (search bar filled query)
- `Không có kết quả phù hợp` (empty state heading)
- `Vui lòng thử lại` (empty state subtitle)

### Screen: Tìm kiếm sản phẩm - Results (21290:53556)
- `IP-BP-0001` (search bar filled query)
- `2 kết quả tìm kiếm cho "IP-BP-0001"` (result count header — rich text with `IP-BP-0001` in Regular weight, rest in SemiBold; quote marks are the smart-quotes `"..."`)
- `#IP-BP-0001` (result product code)
- `Lọc dầu động cơ Toyota` (result product name)
- `Kho:` · `Kho chính`
- `Giá trị tồn:` · `1.760.000`

### Screen: Bộ lọc sản phẩm - Default (21290:54167)
- `Bộ lọc` (AppBar title)
- `Cài đặt lại` (opacity=0 hidden trailing action — do NOT surface)
- `Ngày import` (field label)
- `dd/mm/yyyy - dd/mm/yyyy` (date range placeholder)
- `Kho` (field label)
- `Chọn kho` (dropdown placeholder)
- `Thiết lập lại` (secondary button)
- `Áp dụng` (primary button)

### Screen: Bộ lọc sản phẩm - Filled (21290:54179)
- `Bộ lọc` (AppBar title)
- `Ngày import ` (field label — trailing space observed in binding `{`Ngày import `}`)
- `13/12/2002 - 13/12/2002` (date range filled value)
- `Kho` (field label)
- `Chọn kho` (dropdown placeholder)
- `Tất cả kho` (dropdown option 1)
- `Kho chính` (dropdown option 2 — selected)
- `Kho phụ tùng Hưng Yên` (dropdown option 3)
- `Thiết lập lại` / `Áp dụng`

---

## Design Tokens

### Screen: Tồn đầu kỳ đã import (21290:52697)

**Colors** (from binding / var resolution):
- `#ffffff` (Base/bg-Base) → `AppColors.bgBase` (scaffold + card bg)
- `#262626` (Base/text-CD Garage) → `AppColors.textPrimary` (AppBar title, product code, product name, all label/value text)
- `#334155` (Neutral/Text Color) → resolve near `AppColors.textSecondary ≈ #595e69` (delta > 8 — flag near-miss; used on some secondary text bindings)
- `#15aa2c` (Base/text-Success / Green/600) → `AppColors.textSuccessPrimary` (badge "Ghi sổ kho" — hidden)
- `#e8e8ea` (Base/border-Primary) → `AppColors.borderPrimary` (divider inside card)

**Typography** (binding-deterministic per §1.5a):
- AppBar title `Tồn đầu kỳ` → `(600, 16, 24)` = Subtitle/S4 → `AppTextStyle.textSubtitleS4` [hard rule confirmed]
- Product code `#IP-BP-0001` → `(700, 16, 24)` = Heading/H4 → `AppTextStyle.textHeadingH4`
- Product name `Lọc dầu động cơ Toyota` → `(400, 14, 20)` = Caption/C5 → `AppTextStyle.textCaptionC5`
- Detail row label/value (`Kho:`, `Kho chính`, `31/12/2025`, …) → `(500, 12, 18)` = Body/B7 → `AppTextStyle.textBodyB7`
- Status bar clock `9:41` → `(500, 16, 16)` = Regular/None/Medium → `AppTextStyle.textBodyB4.copyWith(height: 16/16)` (lh drift; built-in H4 lh=24, override to 1.0)

**Spacing**:
- Card padding: 16 → `EdgeInsets.all(AppSizes.spacing16)`
- Card inner gap: 12 (out-of-scale — literal `Gap(12)` + comment)
- Card outer gap (list separator): 16 → `Gap(AppSizes.spacing16)`
- Detail row leading icon size: 20×20, gap-to-text: 8 → `AppSizes.spacing8`
- AppBar right trailing group gap: 12 (out-of-scale)

**Radius**:
- Card `borderRadius: 12` (out-of-scale — literal `BorderRadius.circular(12)`)
- Home Indicator bar radius 100 (`BorderRadius.circular(100)`)

**Shadow**:
- Card `s2` = triple drop-shadow: (0,1) blur 20 color `#9C9C9C33` + (0,1) blur 20 `#9C9C9C1A` + (0,1) blur 20 `#9C9C9C14` — no matching `AppShadows` token; literal `BoxShadow` list required.

### Screen: Tìm kiếm sản phẩm - Default (21290:52992)

**Colors**:
- `#ffffff` scaffold + AppBar bg → `AppColors.bgBase`
- `#e8e8ea` AppBar bottom border → `AppColors.borderPrimary`
- `#262626` primary text → `AppColors.textPrimary`
- `#f3f3f4` (Base/bg-Secondary) → `AppColors.bgSecondary` (search bar bg — visible token is `bg-secondary`; binding class also references `rgba(0,0,0,0.1)` outer wrapper, treat as internal composition — final visible bg = `#f3f3f4`)
- `#71717a` (base/muted-foreground) → `AppColors.textMutedForeground` (search placeholder)
- `#888c94` (Base/text-Tertiary) → `AppColors.textTertiary` (bullet list text)

**Typography**:
- Hint heading `Tìm kiếm sản phẩm theo từ khoá` → `(600, 14, 20)` = Subtitle/S5 → `AppTextStyle.textSubtitleS5`
- Bullet items `Mã sản phẩm`, `Tên sản phẩm` → `(400, 14, 20)` = Caption/C5 → `AppTextStyle.textCaptionC5`
- Search bar placeholder `Tìm kiếm` → `(400, 14, 20)` = Caption/C5 → `AppTextStyle.textCaptionC5` (color muted-foreground)

**Spacing**:
- Body padding: `EdgeInsets.symmetric(horizontal: 16, vertical: 0)` from top=112 (AppBar 96 + gap 16) → outer offset
- Hint block gap: 12
- Search bar internal gap 8, padding 8; radius 8 → `AppSizes.spacing8` + `BorderRadius.circular(AppSizes.spacing8)`
- AppBar row: `padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8)`, gap 8

**Radius**: search bar 8 → `spacing8`

### Screen: Tìm kiếm sản phẩm - No Results (21290:53004)

**Colors** (visible-only):
- `#ffffff` scaffold, `#e8e8ea` AppBar border, `#262626` primary, `#888c94` tertiary
- `#f3f3f4` search bar bg (filled variant), `#262626` filled query text

**Typography** (visible-only):
- Search bar filled value `IP-BP-0001` → Caption/C5 (Regular 14/20) → `AppTextStyle.textCaptionC5`
- Empty state heading `Không có kết quả phù hợp` → `(600, 16, 24)` = Subtitle/S4 → `AppTextStyle.textSubtitleS4`
- Empty state subtitle `Vui lòng thử lại` → `(400, 12, 18)` = Caption/C7 → `AppTextStyle.textCaptionC7`

**Spacing**: empty state vertically centered, gap between icon + heading + subtitle observed ~12–16 (PNG measurement only — Figma binding not extracted for this sub-block due to nested off-viewport frame)

### Screen: Tìm kiếm sản phẩm - Results (21290:53556)

**Colors + Typography**: same tokens as main list + Default search combined:
- Result count `2 kết quả tìm kiếm cho "…"` → SemiBold 14/20 (`textSubtitleS5`) mixed with Regular 14/20 (`textCaptionC5`) for the query term span
- Result Card same tokens as main list (H4 code + C5 name + B7 details); shadow `s2`; radius 12
- Divider `#e8e8ea` borderPrimary
- List gap 16, card padding 16, card inner gap 12

### Screen: Bộ lọc sản phẩm - Default (21290:54167)

**Colors**:
- `#ffffff` scaffold + input bg + AppBar bg
- `#e8e8ea` (Base/border-Primary) → `AppColors.borderPrimary` (input border, AppBar bottom border)
- `#262626` (Base/text-CD Garage) → `AppColors.textPrimary` (AppBar title, `Ngày import` label)
- `#273243` (Base/text-Primary / Neutral/Text) → `AppColors.textPrimary` (`Kho` label — note: this uses `text-primary` token which resolves to `#273243`; distinct from `text-cd-garage` `#262626`)
- `#b8babf` (Base/text-Quaternary) → `AppColors.textQuaternary` (placeholder text `dd/mm/yyyy…`, `Chọn kho`)
- `#eaeaea` (Dark/100) → literal `Color(0xFFEAEAEA)` (secondary button bg — no exact `AppColors` match; near-miss `borderPrimary ≈ #e8e8ea` delta ≤ 8 → `AppColors.borderPrimary ≈ #eaeaea`)
- `#0052ff` (CD Driver/P600-Main / Base/bg-Active-CD Garage) → `AppColors.buttonBackgroundPrimary` (primary button bg)
- `#273243` secondary button text → `AppColors.textPrimary`
- `#ffffff` primary button text → `AppColors.textWhite`

**Typography**:
- AppBar title `Bộ lọc` → `(600, 16, 24)` Subtitle/S4 → `AppTextStyle.textSubtitleS4` [hard rule]
- Field label `Ngày import` → `(600, 14, 20)` Subtitle/S5 → `AppTextStyle.textSubtitleS5`
- Field label `Kho` → `(600, 14, 20)` Subtitle/S5 → `AppTextStyle.textSubtitleS5` (color textPrimary `#273243`)
- Input placeholder `dd/mm/yyyy - dd/mm/yyyy` → `(400, 14, 20)` Caption/C5 → `AppTextStyle.textCaptionC5` (color Quaternary)
- Input placeholder `Chọn kho` → `(400, 14, 20)` Caption/C5 → `AppTextStyle.textCaptionC5` (Quaternary)
- Button labels `Thiết lập lại` + `Áp dụng` → `(700, 16, 24)` Heading/H4 → `AppTextStyle.textHeadingH4`

**Spacing**:
- Filter form padding: 16 → `EdgeInsets.all(AppSizes.spacing16)`
- Filter form vertical gap: 16 → `Gap(AppSizes.spacing16)`
- Field internal gap (label + input): 8 → `Gap(AppSizes.spacing8)`
- Input padding: 12 (out-of-scale) — literal `EdgeInsets.all(12)`
- Input gap between icon + text: 8 → `AppSizes.spacing8`
- Action bar row: `pt 16, pb 20, px 16, gap 8` (pt=16, pb=20 both in scale of {4,8,16,32,52} → pt `spacing16`; pb=20 out-of-scale → literal `20`)
- Button padding: `px 16, py 12` → 16 in-scale, 12 out-of-scale

**Radius**:
- Input radius 8 → `AppSizes.spacing8`
- Button radius 8 → `spacing8`
- Action bar top corners radius 8 (rounded-tl-8 + rounded-tr-8)

**Shadow**:
- Action bar top-shadow: `BoxShadow(offset: (0,-4), blur: 12, color: rgba(0,0,0,0.06))` — no `AppShadows` match; literal.

### Screen: Bộ lọc sản phẩm - Filled (21290:54179)

All tokens above +:
- Selected dropdown option bg `#edf7ff` (CarDoctor/50 / Primary CarDoctor/s50) → `AppColors.buttonBackgroundTertiary` (bgTertiary — Primary/50 hex match)
- Selected dropdown option text `#0667ff` (CarDoctor/600) → **near-miss** `AppColors.textActivePrimary ≈ #0052ff` (delta ~13 on G channel — flag `≈` annotation OR use `Color(0xFF0667FF)` literal; recommend near-miss `≈ textActivePrimary` for design-system consistency)
- Default dropdown option text `#273243` (Color/Neutral/900) → `AppColors.textPrimary`
- Dropdown separator `#e8e8ea` → `AppColors.borderPrimary`
- Dropdown shadow: `BoxShadow(offset: (0,4), blur: 8, color: rgba(0,0,0,0.1))` — literal
- Dropdown border `#f3f3f4` (Base/border-Secondary) → `AppColors.borderSecondary` (⚠ no `borderSecondary` semantic in §1.5 palette — use `Color(0xFFF3F3F4)` literal or add token; near-miss `bgSecondary #f3f3f4` exact match — reuse hex only, not role)
- Filled date value `13/12/2002 - 13/12/2002` → `(400, 14, 20)` Caption/C5 color `#273243` textPrimary

**Dropdown Menu spacing**:
- Menu width: 343 (matches input width; positioned below field with vertical offset)
- Menu padding: `py 4` → `spacing4`
- Option row padding: `px 12, py 8` (12 out-of-scale + 8 in-scale)
- Options gap 0
- Menu radius 8 → `spacing8`

---

## Screenshots

> assets/wave04-ob-list/

- `_full.png` — root section overview (3550×1325 downscaled 1.73× to 2048×793; overview reference only per §3.1.1)
- `21290-52697.png` — Tồn đầu kỳ đã import (main list, 375×812 native — no downscale)
- `21290-52992.png` — Tìm kiếm sản phẩm - Default (375×812)
- `21290-53004.png` — Tìm kiếm sản phẩm - No Results (375×812)
- `21290-53556.png` — Tìm kiếm sản phẩm - Results (375×812)
- `21290-54167.png` — Bộ lọc sản phẩm - Default (375×812)
- `21290-54179.png` — Bộ lọc sản phẩm - Filled + dropdown open (375×812)

---

## Notes for agent-test-ui (mobile design conformance verify)

1. **AppBar title token — hard rule**: cross-check every screen renders AppBar title with `AppTextStyle.textSubtitleS4` (16/SemiBold/24). Any implementation using `textHeadingH4` (Bold) or `textSubtitleS3` (18) fails Cấp 5 WRONG_TYPOGRAPHY.
2. **Hidden "Ghi sổ kho" badge**: JSX/metadata declares Badge with text `Ghi sổ kho` (color `#15aa2c` Green/600) in main-list + results-list card headers, but visual PNG shows it hidden. **Verdict**: implementation MUST NOT render this badge in W04 default state. If implementation shows it → STATE_MISSING / element-invent (mirror to FEAT AC — clarify with BA before flagging).
3. **Filter "Cài đặt lại" trailing text**: declared in AppBar right slot with `opacity: 0`. Implementation MUST hide it (do NOT render, or render invisible). Any visible "Cài đặt lại" in AppBar top-right = WRONG_STATE.
4. **Filter buttons semantic**: `Thiết lập lại` (secondary, grey bg `Dark/100 #EAEAEA`, primary text) + `Áp dụng` (primary, blue `#0052ff`, white text). Both use `textHeadingH4` (Bold 16/24). Do not swap colors.
5. **Selected dropdown option**: `Kho chính` shown as selected via bg `CarDoctor/50 #edf7ff` + text `CarDoctor/600 #0667ff`. Near-miss to `AppColors.textActivePrimary #0052ff` — accept either exact literal or near-miss token per palette policy.
6. **Empty state text hierarchy**: "Không có kết quả phù hợp" = SemiBold 16/24 (S4, NOT H4). "Vui lòng thử lại" = Regular 12/18 (C7). Verify tokens.
7. **Rich text "2 kết quả tìm kiếm cho ..."**: 3 spans (SemiBold prefix, Regular query IP-BP-0001, Regular closing quote). Uses smart quotes `"` and `"` (U+201C / U+201D), NOT straight ASCII quotes.
8. **Search bar bg #f3f3f4** = `Base/bg-Secondary`. Do NOT use `AppColors.bgPrimary #e8e8ea` (near-miss but wrong role).
9. **Card shadow `s2`** is triple-layer — implementation with single BoxShadow may fail visual reconcile; use exact triple-layer BoxShadow list.
10. **Text color naming ambiguity**: `Base/text-CD Garage` = `#262626` vs `Base/text-Primary` = `#273243`. Both map to `AppColors.textPrimary` in §1.5 semantic palette (near-miss delta ≤ 9), but bindings differ per screen. AppBar titles + hint headings use `#262626`; filter form `Kho` label uses `#273243`. Both acceptable to token `AppColors.textPrimary`.
