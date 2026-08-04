---
feat: FEAT-INV-MOBILE-MENU
feat_file: Product/features/FEAT-INV-MOBILE-MENU.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21519-27371
file_key: 5YU4H3iY726P8KNxI9oCYF
node_id: "21519:27371"
fetched_at: 2026-07-08
transform_version: 9
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: ACTIVE
coverage_gaps: []
---

## Icon Catalog (shared)

| Alias | Source | _png_source | Note |
|---|---|---|---|
| `ic.back` | `Icons.arrow_back` (Vuesax linear/arrow-left) | 21519-27371.png (AppBar leading, black chevron) | AppBar leading |
| `ic.product` | SVG asset `assets/icons/inv_product.svg` (48×48 filled — figma `Icon` 21526:40036) | 21519-27371.png (row1 col1 — blue clipboard glyph) | Card "Sản phẩm" |
| `ic.material_group` | SVG asset `assets/icons/inv_material_group.svg` (48×48 filled — figma `Icon` 21526:40060) | 21519-27371.png (row1 col2 — orange folder with check-mark) | Card "Nhóm vật tư" |
| `ic.stock_in` | SVG asset `assets/icons/inv_stock_in.svg` (48×48 filled — figma `Icon` 21526:40079) | 21519-27371.png (row2 col1 — blue clipboard + down-arrow) | Card "Phiếu nhập" |
| `ic.stock_out` | SVG asset `assets/icons/inv_stock_out.svg` (48×48 filled — figma `Icon` 21526:40106) | 21519-27371.png (row2 col2 — blue clipboard + up-arrow) | Card "Phiếu xuất" |
| `ic.warehouse` | SVG asset `assets/icons/inv_warehouse.svg` (48×48 filled — figma `Icon` 21526:40133) | 21519-27371.png (row3 col1 — blue house/warehouse glyph) | Card "Tồn kho" |
| `ic.opening_balance` | SVG asset `assets/icons/inv_opening_balance.svg` (48×48 filled — figma `Icon` 21526:40187) | 21519-27371.png (row3 col2 — blue calendar glyph) | Card "Tồn đầu kỳ" |

> Icons hiện là filled multi-layer SVG asset (blue-tinted glyph on light-blue circle). Nếu `assets/icons/inv_*.svg` chưa tồn tại trong `gf-garage-app` → append `additions_needed:` khối cuối (NEED CONFIRMATION Design lead nếu Design system chưa expose named token).

---

## Screen: FEAT-INV-MOBILE-MENU (21519:27371)

- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=AppColors.bgSecondary (#f3f3f4)
- AppBar: có — title "Quản lý kho hàng" (16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary — M-28 hard rule) · leading `ic.back` · trailing rỗng · bg=AppColors.bgBase (#ffffff) · border-bottom 1px solid AppColors.borderPrimary (#e8e8ea)
- Body layout: Column (SingleChildScrollView `ListScrollView` fill), gap=Gap(AppSizes.spacing8)
- Padding: EdgeInsets.all(16) (top 16, right 16, bottom 16, left 16 → AppSizes.spacing16)
- Widget Tree:
  ```
  CustomScaffold (bg=bgSecondary)
  ├── CustomAppBar (title="Quản lý kho hàng")
  └── SingleChildScrollView (ListScrollView, padding=EdgeInsets.all(16))
      └── Column/FeatureList [gap=Gap(AppSizes.spacing8), radius=16]
          ├── Row/Row1 [gap=Gap(AppSizes.spacing8)]
          │   ├── FeatureCard "Sản phẩm"        → route=/inventory/products
          │   └── FeatureCard "Nhóm vật tư"     → route=/inventory/material-groups
          ├── Row/Row2 [gap=Gap(AppSizes.spacing8)]
          │   ├── FeatureCard "Phiếu nhập"      → route=/inventory/stock-in
          │   └── FeatureCard "Phiếu xuất"      → route=/inventory/stock-out
          └── Row/Row3 [gap=Gap(AppSizes.spacing8)]
              ├── FeatureCard "Tồn kho"         → route=/inventory/stock-on-hand
              └── FeatureCard "Tồn đầu kỳ"      → route=/inventory/opening-balance
  ```
- BottomBar / FAB: không

### Column/FeatureList

- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=stretch, mainAxis=start
- Radius: BorderRadius.circular(16) (visual grouping — 3 rows nested)
- _children_count: 3 (Row1, Row2, Row3 — from metadata)

#### Row/Row1

- Bounds: w=fill h=104px
- Layout: Row, gap=Gap(AppSizes.spacing8), crossAxis=start, mainAxis=spaceBetween (each child `flex(1)`)
- _children_count: 2

##### FeatureCard/product

- Bounds: w=flex(1) h=fill (self-stretch)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
  - _figma_binding: `Spacing - Border/12` (12px) rounded to `AppSizes.spacing8` (M-25 canonical scale — Figma 12 out-of-scale; nearest tighter)
- BG: #ffffff → AppColors.bgBase
- Border: none — radius=BorderRadius.circular(16)
- Padding: EdgeInsets.all(16) — approximated `AppSizes.spacing16` (Figma "Spacing - Border/12" = 12px rounded up to canonical 16)
- Icons:
  - standalone: `ic.product`, 48px, blue-tint (SVG multi-layer — icon glyph inherit color)
- Text: "Sản phẩm" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: label "Sản phẩm" first card top-left
- → flutter: `_FeatureCard(icon: SvgAssets.icInvProduct, label: 'Sản phẩm', onTap: () => context.push('/inventory/products'))`

##### FeatureCard/material_group

- Bounds: w=flex(1) h=fill (self-stretch)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
- BG: #ffffff → AppColors.bgBase
- Border: none — radius=BorderRadius.circular(16)
- Padding: EdgeInsets.all(16)
- Icons:
  - standalone: `ic.material_group`, 48px, orange-tint (SVG multi-layer)
- Text: "Nhóm vật tư" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: label "Nhóm vật tư" first card top-right (2 words, 1 line)
- → flutter: `_FeatureCard(icon: SvgAssets.icInvMaterialGroup, label: 'Nhóm vật tư', onTap: () => context.push('/inventory/material-groups'))`

#### Row/Row2

- Bounds: w=fill h=104px
- Layout: Row, gap=Gap(AppSizes.spacing8), crossAxis=start, mainAxis=spaceBetween (each child `flex(1)`)
- _children_count: 2

##### FeatureCard/stock_in

- Bounds: w=flex(1) h=fill (self-stretch)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
- BG: #ffffff → AppColors.bgBase
- Border: none — radius=BorderRadius.circular(16)
- Padding: EdgeInsets.all(16)
- Icons:
  - standalone: `ic.stock_in`, 48px, blue-tint (clipboard glyph + down-arrow)
- Text: "Phiếu nhập" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: label "Phiếu nhập"
- → flutter: `_FeatureCard(icon: SvgAssets.icInvStockIn, label: 'Phiếu nhập', onTap: () => context.push('/inventory/stock-in'))`

##### FeatureCard/stock_out

- Bounds: w=flex(1) h=fill (self-stretch)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
- BG: #ffffff → AppColors.bgBase
- Border: none — radius=BorderRadius.circular(16)
- Padding: EdgeInsets.all(16)
- Icons:
  - standalone: `ic.stock_out`, 48px, blue-tint (clipboard glyph + up-arrow)
- Text: "Phiếu xuất" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: label "Phiếu xuất"
- → flutter: `_FeatureCard(icon: SvgAssets.icInvStockOut, label: 'Phiếu xuất', onTap: () => context.push('/inventory/stock-out'))`

#### Row/Row3

- Bounds: w=fill h=104px
- Layout: Row, gap=Gap(AppSizes.spacing8), crossAxis=start, mainAxis=spaceBetween (each child `flex(1)`)
- _children_count: 2

##### FeatureCard/stock_on_hand

- Bounds: w=flex(1) h=fill (self-stretch)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
- BG: #ffffff → AppColors.bgBase
- Border: none — radius=BorderRadius.circular(16)
- Padding: EdgeInsets.all(16)
- Icons:
  - standalone: `ic.warehouse`, 48px, blue-tint (house glyph — warehouse)
- Text: "Tồn kho" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: label "Tồn kho"
- → flutter: `_FeatureCard(icon: SvgAssets.icInvWarehouse, label: 'Tồn kho', onTap: () => context.push('/inventory/stock-on-hand'))`

##### FeatureCard/opening_balance

- Bounds: w=flex(1) h=fill (self-stretch)
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=center, mainAxis=center
- BG: #ffffff → AppColors.bgBase
- Border: none — radius=BorderRadius.circular(16)
- Padding: EdgeInsets.all(16)
- Icons:
  - standalone: `ic.opening_balance`, 48px, blue-tint (calendar glyph — period)
- Text: "Tồn đầu kỳ" 14px weight=600 → theme: AppTextStyle.textSubtitleS5 color=#262626 → AppColors.textPrimary
  - _png_verified: label "Tồn đầu kỳ"
- → flutter: `_FeatureCard(icon: SvgAssets.icInvOpeningBalance, label: 'Tồn đầu kỳ', onTap: () => context.push('/inventory/opening-balance'))`

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-inv-mobile-menu/21519-27371.png
claims_verified:
  - claim: "AppBar shows leading back arrow + centered title 'Quản lý kho hàng', no trailing action"
    status: ✓
    evidence: "PNG top row: '<' arrow left, centered black 'Quản lý kho hàng' Semi-Bold, empty right area"
  - claim: "Body is a 3-row × 2-col grid of feature cards, each 48px icon above centered label"
    status: ✓
    evidence: "PNG shows 6 white rounded cards in 3 rows: (Sản phẩm | Nhóm vật tư), (Phiếu nhập | Phiếu xuất), (Tồn kho | Tồn đầu kỳ)"
  - claim: "Scaffold background is light neutral grey behind the white cards (not white)"
    status: ✓
    evidence: "PNG shows subtle grey gap around and between cards indicating bg #f3f3f4 (bgSecondary)"
  - claim: "Card labels are single-line, centered, Semi-Bold 14 px black text (textSubtitleS5)"
    status: ✓
    evidence: "All 6 labels render on one line, centered horizontally below their icon; consistent weight"
  - claim: "Icons are filled colored SVG glyphs (not monochrome outline) — blue clipboard/warehouse/calendar + orange folder"
    status: ✓
    evidence: "PNG shows multicolor SVG per card: 5 blue-tinted, 1 orange (Nhóm vật tư folder)"
  - claim: "No BottomBar, no FAB, no bottom sheet — plain scroll ends with system home indicator"
    status: ✓
    evidence: "PNG bottom shows only the black system home indicator pill, no persistent tab bar or button"
claims_unverified: []
```

---

## Screenshots

> assets/wave04-inv-mobile-menu/
- `21519-27371.png` — Screen: FEAT-INV-MOBILE-MENU / Quản lý kho hàng grid

## Additions needed

> NEED CONFIRMATION — Design lead: 6 SVG asset filenames dưới `assets/icons/` (`inv_product`, `inv_material_group`, `inv_stock_in`, `inv_stock_out`, `inv_warehouse`, `inv_opening_balance`) chưa được đăng ký trong `gf-garage-app/assets`. Nếu Design system giữ chung palette icon (Vuesax filled series) thì reuse; nếu asset độc lập thì spec DEV chờ Design export.
