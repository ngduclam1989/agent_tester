---
feat: FEAT-INV-MOBILE-MENU
feat_file: Product/features/FEAT-INV-MOBILE-MENU.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21729-24201&t=1wyfngHFoc9eXNsZ-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21729:24201"
fetched_at: 2026-06-29T09:51:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
coverage_gaps: []
---

# FEAT-INV-MOBILE-MENU — Mobile spec (v7)

> Section Figma `FEAT-INV-MOBILE` (id `21729:24201`, 1503×1323) chứa 1 frame mobile screen-sized `FEAT-INV-MOBILE-MENU` (id `21519:27371`, 375×812) = màn hub điều hướng "Quản lý kho hàng" với 6 tile menu (3 row × 2 col) cho mobile-only inventory entry-points (per CR-1782373204: mobile mở rộng Mã SP nội bộ view-only + Nhóm VTHH full CRUD + Phiếu nhập/xuất + Tồn kho + Tồn đầu kỳ).

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| chevron-back (AppBar leading) | `Icons.arrow_back_ios_new` (24px) — color `AppColors.textPrimary` | _png_source: asset 21519-27371.png AppBar leading `<` chevron |
| tile-icon Sản phẩm | `assets/icons/inventory-product.svg` (48×48, flutter_svg) | _png_source: asset 21519-27371.png tile 1 — blue document icon on light-blue circle bg |
| tile-icon Nhóm vật tư | `assets/icons/inventory-group.svg` (48×48, flutter_svg) | _png_source: asset 21519-27371.png tile 2 — orange folder with checkmark on light-blue circle |
| tile-icon Phiếu nhập | `assets/icons/inventory-import.svg` (48×48, flutter_svg) | _png_source: asset 21519-27371.png tile 3 — blue document with down arrow on light-blue circle |
| tile-icon Phiếu xuất | `assets/icons/inventory-export.svg` (48×48, flutter_svg) | _png_source: asset 21519-27371.png tile 4 — blue document with up arrow on light-blue circle |
| tile-icon Tồn kho | `assets/icons/inventory-stock.svg` (48×48, flutter_svg) | _png_source: asset 21519-27371.png tile 5 — orange house icon on light-blue circle |
| tile-icon Tồn đầu kỳ | `assets/icons/inventory-opening-stock.svg` (48×48, flutter_svg) | _png_source: asset 21519-27371.png tile 6 — blue calendar icon on light-blue circle |

> Note: 6 tile icons là illustration-style asset SVG (không phải Material Icons single-glyph) — designer asset, lưu trong `assets/icons/inventory-*.svg`. Asset path là proposed naming; verify với designer khi export.

## Screen: Quản lý kho hàng (21519:27371)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgSecondary` (light grey scroll bg behind white tiles)
- AppBar: có — leading back chevron, title "Quản lý kho hàng" (verbatim từ PNG). KHÔNG trailing action.
- Body layout: `ListScrollView` containing 1 `FeatureList` block với GridView 2-col 3-row 6 tiles
- KHÔNG BottomBar / FAB (hub navigation page)
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: InventoryMenuAppBar]
      │   ├── leading: BackButton
      │   └── title: Text "Quản lý kho hàng"
      └── Expanded → SingleChildScrollView
          └── Padding(EdgeInsets.all(AppSizes.spacing16))
              └── Column/FeatureList [identifier: InventoryFeatureGrid]
                  └── GridView.count(crossAxisCount=2, mainAxisSpacing=AppSizes.spacing8, crossAxisSpacing=AppSizes.spacing8, childAspectRatio≈1.61) [_children_count: 6]
                      ├── FeatureTile/SanPham      [identifier: ProductTile]      → push route /inventory/products (FEAT-CAT-PROD-LIST)
                      ├── FeatureTile/NhomVatTu    [identifier: GroupTile]        → push route /inventory/groups (FEAT-CAT-GRP-LIST)
                      ├── FeatureTile/PhieuNhap    [identifier: ImportNoteTile]   → push route /inventory/receipts (FEAT-INV-RECEIPT-LIST — pending future wave)
                      ├── FeatureTile/PhieuXuat    [identifier: ExportNoteTile]   → push route /inventory/deliveries (FEAT-INV-DELIVERY-LIST — pending future wave)
                      ├── FeatureTile/TonKho       [identifier: StockTile]        → push route /inventory/stock-balance (FEAT-INV-STOCK-BALANCE — pending future wave)
                      └── FeatureTile/TonDauKy     [identifier: OpeningStockTile] → push route /inventory/opening-stock (FEAT-INV-OPENING-STOCK — pending future wave)
  ```
- BottomBar: KHÔNG (Action bar instance 21519:27566 chỉ 20px = home indicator, not button bar)

### CustomAppBar [identifier: InventoryMenuAppBar]
- Bounds: w=fill h=FIXED(96px) (status bar 44 + nav bar 52, frame `21519:27558`)
- BG: `AppColors.bgBase`
- Layout-mode: flex(Row)
- Title: "Quản lý kho hàng" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`#262626` → `AppColors.textPrimary`
- Icons:
  - leading: `Icons.arrow_back_ios_new`, 24px, `AppColors.textPrimary`
→ flutter: `CustomAppBar(title: "Quản lý kho hàng", leading: BackButton())`
_png_verified: "asset 21519-27371.png L top shows '<' chevron leading + 'Quản lý kho hàng' centered title — no trailing right-side action"

### Column/FeatureList [identifier: InventoryFeatureGrid]
- Bounds: w=fill h=FIXED(328px = 3 rows × 104 + 2 gaps × 8) per metadata `21521:72299` 343×328
- Layout-mode: flex(Column, gap=Gap(AppSizes.spacing8))
- BG: transparent (parent scroll bg shows through)
- `_children_count: 6` (matches metadata: 3 Row containers × 2 Features = 6 tiles)
- Row containers (3): each Row [_children_count: 2] with mainAxisSpacing AppSizes.spacing8
→ flutter: `GridView.count(crossAxisCount: 2, mainAxisSpacing: AppSizes.spacing8, crossAxisSpacing: AppSizes.spacing8, padding: EdgeInsets.zero, shrinkWrap: true, physics: NeverScrollableScrollPhysics(), children: [...6 FeatureTile])`
_png_verified: "asset 21519-27371.png body shows 6 white tile cards arranged 2-col × 3-row, equal width ~167.5px × 104px height, small gap between row/col"

### FeatureTile [shared widget pattern for all 6 tiles]
- Bounds: w=FIXED(167.5px) h=FIXED(104px) per metadata `21521:70903 Features` etc.
- Layout-mode: flex(Column, mainAxis=center, crossAxis=center)
- BG: `#ffffff` → `AppColors.bgBase`
- Border: 0 (no border); radius=`BorderRadius.circular(8)`
- Shadow: subtle elevation (per design system `AppShadows.itemBoxShadow`)
- Padding: `EdgeInsets.symmetric(vertical: AppSizes.spacing8)` (icon top 12 + label bottom 12 in metadata)
- Structure (Column):
  - Container/IconCircle (48×48, BG light-blue circle `LightBlue`/`PrimaryColor.s50` `#edf7ff` → `AppColors.bgBadgeProcessing` or close palette, icon centered inside)
    - Icon asset SVG 48×48 (per Catalog)
  - Gap(AppSizes.spacing8)
  - Text label (14px weight=600 → `AppTextStyle.textSubtitleS5` color=`AppColors.textPrimary`, center-aligned, max 1 line)
- State: default; pressed → opacity overlay or InkWell ripple; tap → push respective FEAT screen
→ flutter: `FeatureTile(icon: SvgPicture.asset('assets/icons/inventory-product.svg', width: 48, height: 48), label: "Sản phẩm", onTap: () => Navigator.push(...))`

_png_verified per tile labels:
- Tile 1: "Sản phẩm" — _png_verified: "asset 21519-27371.png tile row1 col1 shows blue paper/document icon on light-blue circle + label 'Sản phẩm'"
- Tile 2: "Nhóm vật tư" — _png_verified: "asset 21519-27371.png tile row1 col2 shows orange folder with checkmark + label 'Nhóm vật tư'"
- Tile 3: "Phiếu nhập" — _png_verified: "asset 21519-27371.png tile row2 col1 shows blue doc with down arrow + label 'Phiếu nhập' (verbatim — NOT 'Nhập phiếu')"
- Tile 4: "Phiếu xuất" — _png_verified: "asset 21519-27371.png tile row2 col2 shows blue doc with up arrow + label 'Phiếu xuất' (verbatim — NOT 'Xuất phiếu')"
- Tile 5: "Tồn kho" — _png_verified: "asset 21519-27371.png tile row3 col1 shows orange house icon + label 'Tồn kho'"
- Tile 6: "Tồn đầu kỳ" — _png_verified: "asset 21519-27371.png tile row3 col2 shows blue calendar icon + label 'Tồn đầu kỳ' (verbatim 'đầu kỳ' — 'đ' + 'k' diacritic preserved)"

_negative_coverage:
  - "KHÔNG có search bar / filter trên hub screen (chỉ navigation tiles)"
  - "KHÔNG có Badge / counter trên tile (vd 'New' badge hoặc số lượng) — pure navigation"
  - "KHÔNG có Switch / toggle anywhere"
  - "KHÔNG có additional Row beyond 3 (6 tile total, không hidden tile)"
  - "KHÔNG có inline action button (Edit/Delete) — tile = tap target only"
  - "KHÔNG có separator/divider giữa các row tile (gap-based)"

### §VV Visual Verification Pass
screenshot: assets/wave03-inv-mobile-menu/21519-27371.png
claims_verified:
  - claim: "AppBar shows '< Quản lý kho hàng' centered title + no trailing action"
    status: ✓
    evidence: "PNG top section: back chevron icon on left + 'Quản lý kho hàng' centered title (no right-side icon present)"
  - claim: "Body has 6 tiles arranged in 2-col × 3-row grid (NOT 1-col list, NOT 3-col, NOT 4 tiles)"
    status: ✓
    evidence: "PNG body shows clear 2×3 grid: row1=[Sản phẩm, Nhóm vật tư], row2=[Phiếu nhập, Phiếu xuất], row3=[Tồn kho, Tồn đầu kỳ]"
  - claim: "Each tile has 48×48 illustration icon (NOT single-glyph Material icon) centered top + label below"
    status: ✓
    evidence: "PNG tiles show colorful illustration-style icons (paper/folder/house/calendar with blue/orange tones) inside light-blue circles — distinct from monochrome Material icon style"
  - claim: "Verbatim tile labels: 'Sản phẩm' / 'Nhóm vật tư' / 'Phiếu nhập' / 'Phiếu xuất' / 'Tồn kho' / 'Tồn đầu kỳ' (NO label drift like 'Nhập phiếu' or 'Đầu kỳ tồn')"
    status: ✓
    evidence: "PNG each tile label readable verbatim with Vietnamese diacritics preserved (Sản/đầu/kỳ/Phiếu all show correct accent marks)"
  - claim: "Tile order top→bottom: row1 has Catalog (Sản phẩm + Nhóm vật tư); row2 has Document movements (Phiếu nhập + Phiếu xuất); row3 has Stock state (Tồn kho + Tồn đầu kỳ)"
    status: ✓
    evidence: "PNG row1=catalog, row2=transactions, row3=stock — logical grouping by inventory domain phase"
  - claim: "No FAB / BottomBar / FloatingActionButton visible — hub page is pure navigation, no primary CTA"
    status: ✓
    evidence: "PNG bottom area below row3 shows large empty space + safe-area home indicator; no buttons or FAB"
claims_unverified: []

## Screenshots
> assets/wave03-inv-mobile-menu/
- `21519-27371.png` — Frame chính: Quản lý kho hàng — 6-tile hub (375x812)

## Notes
- Hub menu navigation page — entry-point cho 6 inventory sub-features per CR-1782373204 (mobile inventory scope expansion 2026-06-25).
- 6 tiles map to 6 inventory features:
  1. Sản phẩm → FEAT-CAT-PROD-LIST (view-only mobile per CR-1782373204) — ACTIVE wave 03
  2. Nhóm vật tư → FEAT-CAT-GRP-LIST (full CRUD mobile) — ACTIVE wave 03
  3. Phiếu nhập → FEAT-INV-RECEIPT-LIST (receipt list — pending future wave; route stub returns 'Coming soon' state until FEAT lands)
  4. Phiếu xuất → FEAT-INV-DELIVERY-LIST (delivery list — pending future wave; route stub)
  5. Tồn kho → FEAT-INV-STOCK-BALANCE (stock balance — pending future wave; route stub)
  6. Tồn đầu kỳ → FEAT-INV-OPENING-STOCK (opening period stock — pending future wave; route stub)
- Icon assets: 6 illustration-style SVG cần designer export sang `assets/icons/inventory-*.svg`. Naming verify với designer.
- Section container "FEAT-INV-MOBILE" là inventory domain parent (sẽ chứa thêm các FEAT mobile-only khác trong tương lai); inner frame `21519:27371` là FEAT-INV-MOBILE-MENU canonical screen.
- Tap mỗi tile = `Navigator.push` đến respective FEAT screen; back chevron pops về parent (drawer hoặc tab navigation).
- Layout-identical-to-Garage-Web counterpart: NA (mobile-only hub per CR-1782373204).
