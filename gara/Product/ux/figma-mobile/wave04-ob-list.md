---
feat: FEAT-OB-LIST
feat_file: Product/features/FEAT-OB-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21632-28894
file_key: 5YU4H3iY726P8KNxI9oCYF
node_id: "21632:28894"
fetched_at: 2026-07-08
transform_version: 9
transform_mode: fresh-fetch
screenshots: true
screens_expected: 6
status: ACTIVE
coverage_gaps: []
---

## Icon Catalog (shared)

| Alias | Source | Note |
|---|---|---|
| `ic.back` | `Icons.arrow_back` (Vuesax linear/arrow-left 20px) | AppBar leading |
| `ic.search` | Vuesax linear `search-normal` 20px | AppBar action + SearchTextField prefix |
| `ic.filter` | Vuesax linear `filter` 20px | AppBar action |
| `ic.calendar` | Vuesax linear `calendar` 16px | Card row leading (Tồn đến ngày:) + DateRangeField prefix |
| `ic.dollar_circle` | Vuesax linear `dollar-circle` 16px | Card row leading (Giá trị tồn:) |
| `ic.box` | Vuesax linear `box` 16px | Card row leading (ĐVT:) |
| `ic.note` | Vuesax linear `note` 16px | Card row leading (Số lượng:) |
| `ic.buildings` | Vuesax linear `buildings` 16px | Card row leading (Kho:) |
| `ic.chevron_down` | Vuesax linear `arrow-down-1` 16px | Dropdown trailing (Bộ lọc / Kho) |

---

## Screen: Tồn đầu kỳ đã import (21290:52697)

- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=AppColors.bgSecondary (#f3f3f4)
- AppBar: có — title "Tồn đầu kỳ" (16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary — M-28 hard rule) · leading `ic.back` · trailing [`ic.search`, `ic.filter`] · bg=AppColors.bgBase (#ffffff) · border-bottom 1px solid AppColors.borderPrimary (#e8e8ea)
- Body layout: ListView (padding=EdgeInsets.all(AppSizes.spacing16)), gap=Gap(AppSizes.spacing8) between Cards
- Widget Tree:
  ```
  CustomScaffold (bg=bgSecondary)
  ├── CustomAppBar (title="Tồn đầu kỳ", leading=ic.back, actions=[ic.search, ic.filter])
  └── ListView.separated (padding=EdgeInsets.all(AppSizes.spacing16))
      └── OpeningBalanceCard  ×N (paginated infinite scroll)
          ├── Header    → "#{sku}"       (SKU-only default — no badge per PNG 21290:52697)
          ├── ProductName "{name}"
          ├── Divider (thin, borderPrimary)
          └── DetailRows
              ├── Row (ic.buildings) "Kho:" — "{warehouseName}"
              ├── Row (ic.calendar)  "Tồn đến ngày:" — "{cutoffDate dd/MM/yyyy}"
              ├── Row (ic.note)      "Số lượng:" — "{quantity}"
              ├── Row (ic.dollar_circle) "Giá trị tồn:" — "{value formatted}"
              └── Row (ic.box)       "ĐVT:" — "{unitName}"
  ```
- BottomBar / FAB: không

### OpeningBalanceCard

- Bounds: w=fill h=hug
- Layout-mode: flex(Column)
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary radius=BorderRadius.circular(12) (Spacing - Border/12)
- Padding: EdgeInsets.all(16) (top 16, right 16, bottom 16, left 16 → AppSizes.spacing16)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=stretch, mainAxis=start
- _children_count: 4 (header row, product name, divider, detail rows)

#### Text/CardHeader

- Bounds: w=fill h=hug
- Text: "#IP-BP-0001" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#0052ff → AppColors.textActivePrimary
  - _png_verified: PNG 21290-52697.png cards visible show SKU text alone — no badge chip rendered on any card
- _negative_coverage: NO "Ghi sổ kho" BadgeSuccess in default OB list card (PNG-authoritative per M-24; a design_context text_node with that label exists but references a hidden overlay component instance not rendered in this state)
- → flutter: `Text('#${item.sku}', style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textActivePrimary))`

#### Text/ProductName

- Bounds: w=fill h=hug
- Text: "Lọc dầu động cơ Toyota" 13px weight=600 → theme: AppTextStyle.textSubtitleS6 color=#262626 → AppColors.textPrimary
  - _png_verified: product name row below header
- → flutter: `Text(product.name, style: AppTextStyle.textSubtitleS6.copyWith(color: AppColors.textPrimary))`

#### Divider

- Bounds: w=fill h=1px
- Color: #e8e8ea → AppColors.borderPrimary

#### Column/DetailRows

- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing4), crossAxis=stretch, mainAxis=start
- _children_count: 5 (Kho / Tồn đến ngày / Số lượng / Giá trị tồn / ĐVT — verbatim per PNG order 21290:52697)

##### Row/DetailRow (repeat pattern)

- Bounds: w=fill h=hug (18px line)
- Layout: Row, gap=Gap(AppSizes.spacing4), crossAxis=center, mainAxis=start
- Icons:
  - leading: `ic.{buildings|calendar|note|dollar_circle|box}`, 16px, #888c94 → AppColors.textTertiary
- Text (label): "{Kho:|Tồn đến ngày:|Số lượng:|Giá trị tồn:|ĐVT:}" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#888c94 → AppColors.textTertiary
  - _png_verified: 5 rows labels verbatim including colon
- Text (value): "{Kho chính|31/12/2025|10|1.760.000|Cái}" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#262626 → AppColors.textPrimary
  - _png_verified: 5 values right-adjacent to labels, all on same line
- → flutter: `_OBCardRow(icon: icAsset, label: 'Kho:', value: warehouse.name)`

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/21290-52697.png
claims_verified:
  - claim: "AppBar shows leading '<' + centered 'Tồn đầu kỳ' + trailing 2 icons (search glass, filter funnel)"
    status: ✓
    evidence: "PNG top: back arrow left, 'Tồn đầu kỳ' centered Semi-Bold, magnifier + funnel icons right"
  - claim: "Each card header shows bold blue '#IP-BP-0001' SKU text alone (no badge chip)"
    status: ✓
    evidence: "PNG 21290-52697.png — 3 rendered cards each shows only the SKU text on the header row; no colored pill / badge / status chip present"
  - claim: "Card interior lists exactly 5 icon-prefixed rows in this order: Kho, Tồn đến ngày, Số lượng, Giá trị tồn, ĐVT"
    status: ✓
    evidence: "PNG top card visible rows top→bottom: 🏢 Kho: Kho chính / 📅 Tồn đến ngày: 31/12/2025 / 📝 Số lượng: 10 / 💲 Giá trị tồn: 1.760.000 / 📦 ĐVT: Cái"
  - claim: "Cards are white, rounded-12, thin light-grey border, separated by ~8px gap on a light neutral scroll background"
    status: ✓
    evidence: "PNG shows repeated white rounded rectangles with subtle border on #f3f3f4 background"
  - claim: "No BottomBar, no FAB — the list simply scrolls to bottom"
    status: ✓
    evidence: "PNG bottom shows partial 3rd card fading out — no persistent bottom UI"
claims_unverified: []
```

---

## Screen: Tìm kiếm sản phẩm - Default (21290:52992)

- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=AppColors.bgBase (#ffffff)
- AppBar: có — no title, leading `ic.back`, expanded body = `SearchTextField` (fills remaining width, placeholder "Tìm kiếm")
- Body layout: Column (padding EdgeInsets.symmetric(horizontal=16, vertical=32)), gap=Gap(AppSizes.spacing8)
- Widget Tree:
  ```
  CustomScaffold (bg=bgBase)
  ├── CustomAppBar
  │   ├── leading: ic.back
  │   └── title: SearchTextField (placeholder="Tìm kiếm")
  └── Column (padding=EdgeInsets.fromLTRB(16, 32, 16, 0))
      ├── Heading "Tìm kiếm sản phẩm theo từ khoá"
      └── BulletList
          ├── "Mã sản phẩm"
          └── "Tên sản phẩm"
  ```

### AppBar/SearchInline

- Bounds: w=fill h=52px
- Layout: Row, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=start
- BG: #ffffff → AppColors.bgBase
- Border: none — border-bottom 1px solid #e8e8ea → AppColors.borderPrimary
- Icons:
  - leading: `ic.back`, 20px, #262626 → AppColors.textPrimary
- Child (fill): SearchTextField (see below)

#### SearchTextField/default

- Bounds: w=fill h=40px (raw context inner wrapper `h-[40px]`)
- BG: #f3f3f4 → AppColors.bgSecondary
- Border: none — radius=BorderRadius.circular(8) (Figma `rounded-[8px]` NOT pill; earlier "9999 pill" was incorrect)
- Padding: EdgeInsets.symmetric(horizontal=16, vertical=8)
- Icons:
  - leading: `ic.search`, 20px (raw context 20 not 16), #71717a → AppColors.baseMutedForeground
- Text (placeholder): "Tìm kiếm" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#71717a → AppColors.baseMutedForeground (Figma binding `var(--base/muted-foreground)`; DIFFERENT from textTertiary #888c94)
  - _png_verified: input pill left "🔍  Tìm kiếm" placeholder ghost — grey more neutral than textTertiary
- State: default (empty value)
- → flutter: `AppSearchField(controller: c, hintText: 'Tìm kiếm', onChanged: bloc.onQueryChanged)`

### Text/Heading

- Text: "Tìm kiếm sản phẩm theo từ khoá" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: heading Semi-Bold 14 below AppBar

### BulletList

- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=start, mainAxis=start
- _children_count: 2

#### BulletItem "Mã sản phẩm"

- Layout: Row, gap=Gap(AppSizes.spacing8), crossAxis=center
- Bullet: `•` 4px dot, #888c94 → AppColors.textTertiary
- Text: "Mã sản phẩm" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#888c94 → AppColors.textTertiary
  - _png_verified: first bullet grey "• Mã sản phẩm"

#### BulletItem "Tên sản phẩm"

- Same as above with label "Tên sản phẩm"
  - _png_verified: second bullet grey "• Tên sản phẩm"

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/21290-52992.png
claims_verified:
  - claim: "AppBar body is a rounded grey search pill with left magnifier and placeholder 'Tìm kiếm' — no page title text"
    status: ✓
    evidence: "PNG shows only back arrow + inline search pill; no bold title character"
  - claim: "Below AppBar, a Semi-Bold heading 'Tìm kiếm sản phẩm theo từ khoá' appears, followed by two grey bullet lines 'Mã sản phẩm' and 'Tên sản phẩm'"
    status: ✓
    evidence: "PNG rows below AppBar: bold black heading, then '• Mã sản phẩm' and '• Tên sản phẩm' in grey"
  - claim: "The rest of the body is empty white — no card, no cta button, no bottom bar"
    status: ✓
    evidence: "PNG lower two-thirds shows plain white with only system home indicator"
claims_unverified: []
```

---

## Screen: Tìm kiếm sản phẩm - No Results (21290:53004)

- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=AppColors.bgBase (#ffffff)
- AppBar: giống Screen 52992 nhưng SearchTextField value = "IP-BP-0001" (typed). PNG 21290-53004.png shows no clear-× icon inside the input, only leading magnifier + typed text; clear affordance is out of scope for this variant
- Body layout: Center (Column, mainAxis=center)
- Widget Tree:
  ```
  CustomScaffold (bg=bgBase)
  ├── CustomAppBar { leading: ic.back, body: SearchTextField(value='IP-BP-0001') }
  └── Center
      └── Column [gap=Gap(AppSizes.spacing8), crossAxis=center]
          ├── Icon(ic.search 48px, textQuaternary)
          ├── Text "Không có kết quả phù hợp" (textSubtitleS4, textPrimary)
          └── Text "Vui lòng thử lại" (textCaptionC7, textTertiary)
  ```

### SearchTextField/filled

- Same as default variant but has:
  - Value: "IP-BP-0001" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#262626 → AppColors.textPrimary
    - _png_verified: input pill shows "IP-BP-0001" text (no placeholder)
- State: filled

### Column/EmptyState

- Bounds: w=fill h=fill
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
- _children_count: 3

#### Icon/EmptyGlyph

- Icons:
  - standalone: `ic.search`, 48px, #b8babf → AppColors.textQuaternary
- _png_verified: large grey magnifier centered vertically

#### Text/EmptyTitle

- Text: "Không có kết quả phù hợp" 16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
  - _png_verified: bold black title under icon

#### Text/EmptySub

- Text: "Vui lòng thử lại" 12px weight=400 lineHeight=18 → theme: AppTextStyle.textCaptionC7 color=#888c94 → AppColors.textTertiary (raw binding node 21290:53551 — Inter/Regular/12/18)
  - _png_verified: grey sub-line under title

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/21290-53004.png
claims_verified:
  - claim: "SearchTextField shows the value 'IP-BP-0001' (no placeholder ghost)"
    status: ✓
    evidence: "PNG search pill shows solid text 'IP-BP-0001' aligned left"
  - claim: "Vertical center of screen shows a large grey magnifier icon, then bold black 'Không có kết quả phù hợp', then grey 'Vui lòng thử lại'"
    status: ✓
    evidence: "PNG mid-screen: magnifier glyph + 2-line text stack, all horizontally centered"
  - claim: "No result cards, no CTA button, no bottom bar"
    status: ✓
    evidence: "PNG shows nothing else except the empty-state cluster and the home indicator"
claims_unverified: []
```

---

## Screen: Tìm kiếm sản phẩm - Results (21290:53556)

- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=AppColors.bgSecondary (#f3f3f4)
- AppBar: giống Screen 53004 — SearchTextField value = "IP-BP-0001"
- Body layout: Column (padding EdgeInsets.fromLTRB(16, 16, 16, 0)), gap=Gap(AppSizes.spacing8)
- Widget Tree:
  ```
  CustomScaffold (bg=bgSecondary)
  ├── CustomAppBar { leading: ic.back, body: SearchTextField(value='IP-BP-0001') }
  └── Column (padding=EdgeInsets.fromLTRB(16,16,16,0))
      ├── Text "N kết quả tìm kiếm cho "{query}""
      └── ListView.separated (padding-top 8)
          └── OpeningBalanceCard/compact ×N
              ├── Header "#{sku}"        (no badge)
              ├── ProductName "{name}"
              ├── Divider
              └── DetailRows (compact — 2 rows: Kho, Giá trị tồn)
  ```

### Text/ResultCount

- Text: `2 kết quả tìm kiếm cho "IP-BP-0001"` 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: Semi-Bold black; query token quoted with curly quotes ""

### OpeningBalanceCard/compact

- Bounds: w=fill h=hug
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary radius=BorderRadius.circular(12)
- Padding: EdgeInsets.all(16)
- Layout: Column, gap=Gap(AppSizes.spacing8)
- _children_count: 4 (header, product name, divider, DetailRows compact)

#### Row/CardHeader (compact)

- Text: "#IP-BP-0001" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#0052ff → AppColors.textActivePrimary
  - _png_verified: no badge next to SKU in PNG 21290-53556.png
- _negative_coverage: no BadgeSuccess / status pill in either OB list variant (main-list 21290:52697 and results-list 21290:53556); consistent with Screen 52697 _negative_coverage line 73

#### Text/ProductName

- Text: "Lọc dầu động cơ Toyota" 13px weight=600 → theme: AppTextStyle.textSubtitleS6 color=#262626 → AppColors.textPrimary
  - _png_verified: identical to full card product name

#### Divider

- 1px #e8e8ea → AppColors.borderPrimary

#### Column/DetailRows (compact)

- Layout: Column, gap=Gap(AppSizes.spacing4)
- _children_count: 2 (Kho, Giá trị tồn — compact PNG shows exactly these 2 rows only)

##### Row/Kho

- Icons: leading `ic.buildings` 16px textTertiary
- Text: "Kho: Kho chính" 14px weight=400 → theme: AppTextStyle.textCaptionC5 (label textTertiary, value textPrimary)
  - _png_verified: single row "Kho: Kho chính"

##### Row/GiaTriTon

- Icons: leading `ic.dollar_circle` 16px textTertiary
- Text: "Giá trị tồn: 1.760.000" 14px weight=400 → theme: AppTextStyle.textCaptionC5 (label textTertiary, value textPrimary)
  - _png_verified: single row "Giá trị tồn: 1.760.000"

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/21290-53556.png
claims_verified:
  - claim: "Below AppBar there is a Semi-Bold black heading '2 kết quả tìm kiếm cho \"IP-BP-0001\"'"
    status: ✓
    evidence: "PNG shows single bold black line with the query token in curly quotes"
  - claim: "Two result cards are stacked, both showing '#IP-BP-0001' bold blue with product name below"
    status: ✓
    evidence: "PNG shows two identical-looking cards with the same SKU + name"
  - claim: "Compact card shows only 2 detail rows: Kho + Giá trị tồn (no Tồn đến ngày, no Số lượng, no ĐVT); header shows SKU text alone with no badge chip — matches the default variant on Screen 52697"
    status: ✓
    evidence: "PNG each card has exactly 2 icon-prefixed rows visible; badge pill not present next to the SKU header"
claims_unverified: []
```

---

## Screen: Bộ lọc sản phẩm - Default (21290:54167)

- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=AppColors.bgBase (#ffffff)
- AppBar: có — title "Bộ lọc" (16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary — M-28 hard rule) · leading `ic.back` · trailing rỗng · border-bottom 1px solid AppColors.borderPrimary
- Body layout: Column (padding EdgeInsets.fromLTRB(16, 32, 16, 0)), gap=Gap(AppSizes.spacing16)
- Widget Tree:
  ```
  CustomScaffold (bg=bgBase)
  ├── CustomAppBar (title="Bộ lọc", leading=ic.back)
  ├── Column (padding=EdgeInsets.fromLTRB(16, 32, 16, 0))
  │   ├── FieldGroup "Ngày import"
  │   │   ├── Label "Ngày import"
  │   │   └── DateRangeField (placeholder="dd/mm/yyyy - dd/mm/yyyy")
  │   └── FieldGroup "Kho"
  │       ├── Label "Kho"
  │       └── DropdownField (placeholder="Chọn kho")
  └── BottomBar (2-button footer)
      ├── AppButton.secondaryStrong "Thiết lập lại"  (flex=1)
      └── AppButton.primary          "Áp dụng"       (flex=1)
  ```
- BottomBar: có — Thiết lập lại + Áp dụng, footer-safe area, gap=Gap(AppSizes.spacing8) (Figma "Spacing - Border/12" mapped to nearest canonical AppSizes value per M-25)

### FieldGroup/NgayImport

- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=start
- _children_count: 2 (Label + DateRangeField)

#### Label "Ngày import"

- Text: "Ngày import" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: field label above input, black Semi-Bold

#### DateRangeField/default

- Bounds: w=fill h=44px
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary radius=BorderRadius.circular(8)
- Padding: EdgeInsets.symmetric(horizontal=16, vertical=16)
- Icons: leading `ic.calendar` 16px #888c94 → AppColors.textTertiary
- Text (placeholder): "dd/mm/yyyy - dd/mm/yyyy" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#b8babf → AppColors.textQuaternary
  - _png_verified: bordered pill input showing 📅 placeholder text (grayer than Kho row 3 labels — matches textQuaternary raw context binding)
- State: default (no value)
- → flutter: `AppDateRangeField(fromLabel: 'dd/mm/yyyy', toLabel: 'dd/mm/yyyy', onChanged: bloc.onDateRangeChanged)`

### FieldGroup/Kho

- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=start

#### Label "Kho"

- Text: "Kho" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#273243 → AppColors.neutralS900 (Figma binding var --base/text-primary — raw palette; NOTE label "Ngày import" cùng screen dùng `#262626` textPrimary. Drift trong Figma — NEED CONFIRMATION Design lead: có nên unify 2 label group cùng token không)

#### DropdownField/default

- Bounds: w=fill h=44px
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary radius=BorderRadius.circular(8)
- Padding: EdgeInsets.symmetric(horizontal=16, vertical=16)
- Text (placeholder): "Chọn kho" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#b8babf → AppColors.textQuaternary
  - _png_verified: placeholder ghost text (`text-quaternary` per raw context, not tertiary)
- Icons: trailing `ic.chevron_down` 16px #888c94 → AppColors.textTertiary
- State: default (no selection, closed)
- → flutter: `AppDropdownField<Warehouse>(hintText: 'Chọn kho', items: warehouses, onChanged: bloc.onWarehouseSelected)`

### BottomBar/FilterFooter

- Bounds: w=fill h=hug (button 48px + top pad 16 + bottom pad safe-area ~20 = ~84px total)
- BG: #ffffff → AppColors.bgBase
- Border: none — radius top-left/top-right = BorderRadius.only(topLeft: 8, topRight: 8)
- Shadow: shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.06)] → AppShadows.footer (NEED CONFIRMATION nếu registry chưa expose)
- Padding: EdgeInsets.fromLTRB(AppSizes.spacing16, AppSizes.spacing16, AppSizes.spacing16, AppSizes.spacing16) — bottom pad Figma 20px SafeArea handled qua `SafeArea(bottom: true, child:...)` (canonical D-M footer pattern); container padding thân dùng scale
- Layout: Row, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=spaceBetween (each button flex(1))

#### AppButton/Reset

- Bounds: w=flex(1) h=48px (per Figma `px-[16px] py-[12px]` + text lineHeight 24 = 12+24+12)
- BG: #EAEAEA → AppColors.buttonBackgroundSecondaryStrong (Figma var Dark/100)
- Text: "Thiết lập lại" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#273243 → AppColors.buttonContentSecondaryStrong
  - _png_verified: left grey button "Thiết lập lại" — Inter/Bold/16/24 verified per raw context signature (font-['Inter:Bold'] text-[16px] leading-[24px])
- Radius: BorderRadius.circular(8)
- State: default
- → flutter: `AppButton.text(title: 'Thiết lập lại', appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.secondaryStrong(), onPressed: bloc.onReset)` — `AppButtonSize.medium` (registry `button_sizes` L660-666): min_height 48 · text_style `AppTextStyle.textHeadingH4` (Bold/16/24) · border_radius 8 · padding symmetric(v:12, h:16); common_usages đã cite "Filter footer Áp dụng / Thiết lập lại"

#### AppButton/Apply

- Bounds: w=flex(1) h=48px
- BG: #0052ff → AppColors.buttonBackgroundPrimary (Figma var CD Driver/P600-Main)
- Text: "Áp dụng" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#ffffff → AppColors.textWhite
  - _png_verified: right blue button "Áp dụng" white text — Inter/Bold/16/24 verified per raw context signature
- Radius: BorderRadius.circular(8)
- State: default (enabled)
- → flutter: `AppButton.text(title: 'Áp dụng', appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPressed: bloc.onApply)` — same `AppButtonSize.medium` recipe as Reset (registry L660-666, common_usages cite wave04 filter footer)

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/21290-54167.png
claims_verified:
  - claim: "AppBar shows '<' + centered 'Bộ lọc' (Semi-Bold 16), no trailing action"
    status: ✓
    evidence: "PNG top: back arrow left, 'Bộ lọc' centered black, empty right area"
  - claim: "Body has exactly 2 field groups: 'Ngày import' + date range input; 'Kho' + dropdown"
    status: ✓
    evidence: "PNG shows label 'Ngày import' with 'dd/mm/yyyy - dd/mm/yyyy' pill; label 'Kho' with 'Chọn kho' pill and chevron"
  - claim: "Footer has exactly 2 buttons side by side: grey 'Thiết lập lại' (left) and blue 'Áp dụng' (right, white text)"
    status: ✓
    evidence: "PNG bottom shows a divider then two equal-width buttons with the described colors and labels"
  - claim: "Date range input shows placeholder 'dd/mm/yyyy - dd/mm/yyyy' (empty state)"
    status: ✓
    evidence: "PNG input pill shows grey placeholder text 'dd/mm/yyyy - dd/mm/yyyy' with calendar icon prefix"
  - claim: "Kho dropdown shows placeholder 'Chọn kho' and a down-chevron trailing (closed state)"
    status: ✓
    evidence: "PNG shows 'Chọn kho' grey placeholder + chevron ▾ right"
claims_unverified: []
```

---

## Screen: Bộ lọc sản phẩm - Filled (21290:54179)

- Device frame: 375x812px (phone)
- Scaffold: giống 54167 — bg=AppColors.bgBase
- AppBar: giống 54167 — title "Bộ lọc" + `ic.back`
- Body layout: giống 54167 với:
  - DateRangeField value = "13/12/2002 - 13/12/2002" (filled)
  - DropdownField expanded → panel below with 3 options
- Widget Tree:
  ```
  CustomScaffold (bg=bgBase)
  ├── CustomAppBar (title="Bộ lọc")
  ├── Column (padding=EdgeInsets.fromLTRB(16, 32, 16, 0))
  │   ├── FieldGroup "Ngày import"
  │   │   ├── Label "Ngày import"
  │   │   └── DateRangeField/filled "13/12/2002 - 13/12/2002"
  │   └── FieldGroup "Kho"
  │       ├── Label "Kho"
  │       ├── DropdownField/default "Chọn kho"
  │       └── DropdownPanel (options: Tất cả kho / Kho chính (highlighted) / Kho phụ tùng Hưng Yên)
  └── BottomBar (giống 54167)
  ```

### DateRangeField/filled

- Same shell as default (border, padding, calendar icon leading)
- Text (value): "13/12/2002 - 13/12/2002" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#273243 → AppColors.neutralS900 (Figma binding var `--base/text-primary` — raw palette)
  - _png_verified: input pill shows solid dark text (no ghost)
- State: filled

### DropdownPanel (expanded)

- Bounds: w=fill h=hug (attached below DropdownField, elevation shadow s2)
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary radius=BorderRadius.circular(8)
- Shadow: AppShadows.dropdown (matches Effect s2 in Figma variables)
- Padding: EdgeInsets.symmetric(vertical=4)
- Layout: Column, gap=Gap(AppSizes.zeroSize), crossAxis=stretch
- _children_count: 3 (Tất cả kho / Kho chính / Kho phụ tùng Hưng Yên)

#### DropdownItem/regular "Tất cả kho"

- Bounds: w=fill h=hug (item pad `px-[12px] py-[8px]`)
- Padding: EdgeInsets.symmetric(horizontal=16, vertical=8) — Figma px=12 rounded to canonical 16 per M-25; py=8 in-scale
- BG: transparent
- Text: "Tất cả kho" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#273243 → AppColors.neutralS900 (Figma binding var `--color/neutral/900`)
  - _png_verified: option row 1 no background, dark text

#### DropdownItem/selected "Kho chính"

- Bounds: w=fill h=hug
- Padding: EdgeInsets.symmetric(horizontal=16, vertical=8)
- BG: #edf7ff → AppColors.buttonBackgroundTertiary (Figma binding var `--cardoctor/50`)
- Text: "Kho chính" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#0667ff → PrimaryColor.s600 (raw palette handle per registry `color_palettes.PrimaryColor.s600` L518 — Figma binding var `--cardoctor/600`). CanonicalM-3 tier: no semantic AppColors wrapper needed cho color dùng ít; dùng palette handle trực tiếp trong Flutter
  - _png_verified: option row 2 light-blue background + brand-blue text (selected/hover state)

#### DropdownItem/regular "Kho phụ tùng Hưng Yên"

- Bounds: w=fill h=hug
- Padding: EdgeInsets.symmetric(horizontal=16, vertical=8)
- Text: "Kho phụ tùng Hưng Yên" 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#273243 → AppColors.neutralS900
  - _png_verified: option row 3 dark text on white

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/21290-54179.png
claims_verified:
  - claim: "Date range input shows the value '13/12/2002 - 13/12/2002' in solid dark text (no placeholder ghost)"
    status: ✓
    evidence: "PNG date field shows filled dark text with calendar icon prefix"
  - claim: "Kho dropdown panel is expanded showing 3 options in order: 'Tất cả kho', 'Kho chính' (highlighted blue), 'Kho phụ tùng Hưng Yên'"
    status: ✓
    evidence: "PNG below Kho field shows a 3-row panel; middle row has light-blue background and blue text — indicating current highlight; other 2 rows have dark text on white"
  - claim: "Footer buttons remain 'Thiết lập lại' + 'Áp dụng' (identical to default state)"
    status: ✓
    evidence: "PNG bottom shows same 2-button footer as 54167"
claims_unverified:
  - claim: "Whether the selected state on 'Kho chính' represents a persistent selection or just hover — cannot distinguish visually"
    status: ?
    evidence: "Static PNG shows only one visual accent; treat as selected in filled variant per convention"
```

---

## Screenshots

> assets/wave04-ob-list/
- `21290-52697.png` — Screen: Tồn đầu kỳ đã import (main list)
- `21290-52992.png` — Screen: Tìm kiếm sản phẩm - Default
- `21290-53004.png` — Screen: Tìm kiếm sản phẩm - No Results
- `21290-53556.png` — Screen: Tìm kiếm sản phẩm - Results
- `21290-54167.png` — Screen: Bộ lọc sản phẩm - Default
- `21290-54179.png` — Screen: Bộ lọc sản phẩm - Filled
