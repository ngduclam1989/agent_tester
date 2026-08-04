---
feat: FEAT-CAT-PROD-DETAIL
feat_file: Product/features/FEAT-CAT-PROD-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24017&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24017"
fetched_at: 2026-06-29T09:27:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
coverage_gaps: []
---

# FEAT-CAT-PROD-DETAIL — Mobile spec (v7)

> Section Figma `FEAT-CAT-PROD-DETAIL` (id `21555:24017`, 4774×1140) chứa 2 frame mobile screen-sized = 2 status variant của màn xem chi tiết Mã sản phẩm nội bộ.
>
> ⚠️ **View-only mobile** (per CR-1782373204 2026-06-25): mobile Mã SP nội bộ KHÔNG có Edit/Delete action. AppBar không trailing action; KHÔNG có BottomBar. Edit/Create CRUD chỉ trên web boundary.

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| chevron-back (AppBar leading) | `Icons.arrow_back_ios_new` (24px) | back nav |

## Screen: Chi tiết sản phẩm — Status active (21526:45088)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgSecondary` (light grey scroll bg behind white cards)
- AppBar: có — leading back chevron, title "Sản phẩm" (centered). KHÔNG trailing action.
- Body layout: `SingleChildScrollView` Column gap-separated cards
- KHÔNG BottomBar (view-only)
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: ProductDetailAppBar]
      │   ├── leading: BackButton
      │   └── title: Text "Sản phẩm"
      └── Expanded → SingleChildScrollView
          └── Column [padding=EdgeInsets.all(AppSizes.spacing16), gap=Gap(AppSizes.spacing8)]
              ├── Card/ProductHeaderInfo [identifier: ProductHeaderCard, _children_count: 3]
              │   ├── Row [mainAxis=spaceBetween]: Text "#IP-BP-0001" blue + Badge status
              │   ├── Text "Lọc dầu động cơ Toyota" H4 bold
              │   ├── Divider
              │   └── Row [_children_count: 2] AttributesField "ĐVT: Cái" | "Thương hiệu: Toyota"
              ├── Card/ThongTinChung [identifier: GeneralInfoCard]
              │   ├── Text "Thông tin chung" H4 bold
              │   ├── Divider
              │   ├── Row [_children_count: 2]: "Tính chất: Vật tư hàng hoá" | "Nhóm: Phụ tùng bảo dưỡng"
              │   └── Row [_children_count: 2]: "Xuất xứ: Trung Quốc" | "Phương pháp tính giá: Bình quân cuối kỳ"
              ├── Card/ThongSoKyThuat [identifier: TechnicalSpecCard]
              │   ├── Text "Thông số kĩ thuật" H4 bold
              │   ├── Divider
              │   └── Text "Đường kính 68mm, ren M20×1.5, chiều cao 75mm." (multi-line value)
              └── Card/QuyCachMoTa [identifier: SpecificationDescriptionCard]
                  ├── Text "Quy cách mô tả" H4 bold
                  ├── Divider
                  ├── AttributesField "Quy cách: Lọc dầu động cơ dùng cho Toyota Vios/Altis"
                  └── AttributesField "Mô tả: Phụ tùng bảo dưỡng định kỳ..."
  ```

### CustomAppBar [identifier: ProductDetailAppBar]
- Bounds: w=fill h=FIXED(96px)
- BG: `AppColors.bgBase`
- Text: title "Sản phẩm" 18px weight=700 → `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
- Icons:
  - leading: `Icons.arrow_back_ios_new`, 24px, `AppColors.textPrimary`
→ flutter: `CustomAppBar(title: "Sản phẩm", leading: BackButton())`
_png_verified: "asset 21526-45088.png L top shows '<' + centered 'Sản phẩm' title — no right-side action"

### Card/ProductHeaderInfo [identifier: ProductHeaderCard]
- Bounds: w=fill h=FIXED(152px)
- Layout-mode: flex(Column)
- BG: `AppColors.bgBase`
- Border: 0; radius=`BorderRadius.circular(8)`
- Shadow: `AppShadows.itemBoxShadow`
- Padding: `EdgeInsets.all(AppSizes.spacing16)`

#### Row/CodeBadge (in ProductHeaderCard)
- Layout-mode: flex(Row, mainAxis=spaceBetween, crossAxis=center)
- Children _children_count: 2
- Left: Text "#IP-BP-0001" 16px weight=700 → `AppTextStyle.textHeadingH4` color=`AppColors.textActivePrimary` (`#0052ff`, link-style)
- Right: Badge/StatusPill "Đang hoạt động" w=108 h=26 — BG `AppColors.bgBadgeSuccess` + text `AppColors.textSuccessPrimary`
_png_verified: "asset 21526-45088.png card1 header row shows blue '#IP-BP-0001' on left + green pill 'Đang hoạt động' on right"

#### Text/ProductName
- Text: "Lọc dầu động cơ Toyota" 16px weight=700 → `AppTextStyle.textHeadingH4` color=`AppColors.textPrimary`
- Padding: `EdgeInsets.only(top: AppSizes.spacing8)`
_png_verified: "asset 21526-45088.png card1 below code shows bold 'Lọc dầu động cơ Toyota' as product name"

#### Divider (in ProductHeaderCard)
- 1px solid `AppColors.borderPrimary`

#### Row/Attributes (in ProductHeaderCard)
- Layout-mode: flex(Row, _children_count: 2, equal split)
- Each AttributesField: Column [label-on-top, value-below]
  - Label "ĐVT" 12px weight=400 → `AppTextStyle.textCaptionC7` color=`AppColors.textTertiary`
  - Value "Cái" 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
- 2 fields: "ĐVT: Cái" | "Thương hiệu: Toyota"
_png_verified: "asset 21526-45088.png card1 bottom row shows 2-col attributes: 'ĐVT / Cái' on left, 'Thương hiệu / Toyota' on right (label above value, label grey small, value bold/regular larger)"

### Card/ThongTinChung [identifier: GeneralInfoCard]
- Bounds: w=fill h=FIXED(176px)
- Layout-mode: flex(Column)
- BG/Border/Padding identical to ProductHeaderCard
- Children: SectionTitle "Thông tin chung" + Divider + 2× AttributesRows (each row = 2-col)

#### SectionTitle/ThongTinChung
- Text: "Thông tin chung" 16px weight=700 → `AppTextStyle.textHeadingH4` color=`AppColors.textPrimary`
_png_verified: "asset 21526-45088.png card2 top shows bold 'Thông tin chung' title"

#### AttributesRows (2 rows × 2 cols, _children_count per row: 2)
- Row 1: "Tính chất: Vật tư hàng hoá" | "Nhóm: Phụ tùng bảo dưỡng"
- Row 2: "Xuất xứ: Trung Quốc" | "Phương pháp tính giá: Bình quân cuối kỳ"
- Each cell: 14.5×42 (per metadata) — label above value
- Label style: `textCaptionC7` color=`textTertiary`
- Value style: `textBodyB5` color=`textPrimary`
_png_verified: "asset 21526-45088.png card2 shows 4 attributes in 2-col 2-row grid: 'Tính chất / Vật tư hàng hoá' | 'Nhóm / Phụ tùng bảo dưỡng' (row 1); 'Xuất xứ / Trung Quốc' | 'Phương pháp tính giá / Bình quân cuối kỳ' (row 2)"

### Card/ThongSoKyThuat [identifier: TechnicalSpecCard]
- Bounds: w=fill h=FIXED(120px)
- Layout-mode: flex(Column)
- BG/Border/Padding same as other cards

#### SectionTitle/ThongSoKyThuat
- Text: "Thông số kĩ thuật" 16px weight=700 → `AppTextStyle.textHeadingH4` color=`AppColors.textPrimary`
_png_verified: "asset 21526-45088.png card3 top shows 'Thông số kĩ thuật' (verbatim 'kĩ' NOT 'kỹ' — preserve diacritic)"

#### Text/SpecValue (multi-line, no label)
- Text: "Đường kính 68mm, ren M20×1.5, chiều cao 75mm." 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
- maxLines: ~2-3
_png_verified: "asset 21526-45088.png card3 body shows technical spec text 'Đường kính 68mm, ren M20×1.5, chiều cao 75mm.' (2-line wrap)"

### Card/QuyCachMoTa [identifier: SpecificationDescriptionCard]
- Bounds: w=fill h=FIXED(176px)
- BG/Border/Padding same

#### SectionTitle/QuyCachMoTa
- Text: "Quy cách mô tả" 16px weight=700 → `textHeadingH4` color=`textPrimary`
_png_verified: "asset 21526-45088.png card4 top shows 'Quy cách mô tả' title"

#### AttributesField/QuyCach (single-col 1-row)
- Label "Quy cách" 12px weight=400 → `textCaptionC7` color=`textTertiary`
- Value "Lọc dầu động cơ dùng cho Toyota Vios/Altis" 14px weight=500 → `textBodyB5` color=`textPrimary` (max 2 lines)
_png_verified: "asset 21526-45088.png card4 row1 shows 'Quy cách' grey label + 'Lọc dầu động cơ dùng cho Toyota Vios/Altis' value"

#### AttributesField/MoTa (single-col 1-row)
- Label "Mô tả" 12px weight=400 → `textCaptionC7` color=`textTertiary`
- Value "Phụ tùng bảo dưỡng định kỳ..." (truncated in PNG) → `textBodyB5` color=`textPrimary`
_png_verified: "asset 21526-45088.png card4 row2 shows 'Mô tả' grey label + 'Phụ tùng bảo dưỡng định kỳ...' (truncated ellipsis visible)"

_negative_coverage:
  - "KHÔNG có BottomBar Edit/Delete (view-only mobile per CR-1782373204)"
  - "KHÔNG có IconButton trailing trong AppBar (no menu, no share)"
  - "KHÔNG có Thumbnail/Image (text-only data display)"
  - "KHÔNG có Switch toggle anywhere"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-detail/21526-45088.png
claims_verified:
  - claim: "AppBar centered title 'Sản phẩm' with back chevron leading, NO trailing action button (view-only)"
    status: ✓
    evidence: "PNG top shows '<' on left + 'Sản phẩm' centered + empty right area"
  - claim: "4 distinct cards stacked vertically: ProductHeader / Thông tin chung / Thông số kĩ thuật / Quy cách mô tả"
    status: ✓
    evidence: "PNG body shows 4 white rounded cards on light-grey background, each separated by gap"
  - claim: "Card 1 ProductHeader shows blue '#IP-BP-0001' code + green 'Đang hoạt động' status badge + 'Lọc dầu động cơ Toyota' name + 2-col attrs (ĐVT/Cái + Thương hiệu/Toyota)"
    status: ✓
    evidence: "PNG card 1 layout exactly: code left + green pill right, then name bold, then 2-col attributes split"
  - claim: "Card 2 'Thông tin chung' has 4 attributes in 2-col 2-row grid"
    status: ✓
    evidence: "PNG card 2 shows 4 label/value pairs in 2x2 grid layout (Tính chất/Vật tư hàng hoá, Nhóm/Phụ tùng bảo dưỡng, Xuất xứ/Trung Quốc, Phương pháp tính giá/Bình quân cuối kỳ)"
  - claim: "NO BottomBar — page ends at last card (view-only confirmed)"
    status: ✓
    evidence: "PNG bottom area shows ONLY safe-area indicator strip; no button bar above"
  - claim: "Section titles use 'Thông số kĩ thuật' (verbatim 'kĩ' not 'kỹ') and 'Quy cách mô tả' verbatim"
    status: ✓
    evidence: "PNG card 3 title shows 'Thông số kĩ thuật' with 'kĩ' diacritic; card 4 title 'Quy cách mô tả' (preserved)"
claims_unverified: []

## Screen: Chi tiết sản phẩm — Status inactive (21528:24629)
- Device frame: 375x812px (phone)
- Identical layout to active variant — only Badge variant changes.

### Badge/StatusPill (delta only)
- Text: "Ngưng hoạt động" (verbatim PNG — NOT "Ngừng hoạt động" diacritic — observe carefully)
- BG: `AppColors.bgBadgeOpen` (NeutralColor.s50 light grey) (NOT warning orange — observe PNG)
- Text color: `AppColors.textSecondary` (grey)
_png_verified: "asset 21528-24629.png card 1 header shows GREY pill 'Ngưng hoạt động' (NOT orange like grp-list ngừng variant — PROD-DETAIL ngưng = neutral grey, observe character 'Ngưng' vs 'Ngừng' — PNG shows 'Ngưng' with 'ư' diacritic)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-detail/21528-24629.png
claims_verified:
  - claim: "All structure identical to active variant — same 4 cards, same AppBar, same content. Only badge state changes."
    status: ✓
    evidence: "PNG side-by-side comparable with 21526-45088.png; layout, fields, values all match"
  - claim: "Status badge shows 'Ngưng hoạt động' (grey neutral fill + grey text) instead of green Đang hoạt động"
    status: ✓
    evidence: "PNG card 1 header right shows GREY pill with text 'Ngưng hoạt động' (verbatim, NOT 'Ngừng')"
  - claim: "Product code, name, all attribute values identical between two variants (same sample data — only status differs)"
    status: ✓
    evidence: "PNG both show '#IP-BP-0001' / 'Lọc dầu động cơ Toyota' / same Tính chất / Nhóm / Xuất xứ values"
  - claim: "NO additional UI elements appear in inactive variant (no banner, no warning, no overlay)"
    status: ✓
    evidence: "PNG renders cleanly — only badge color/text differs; no extra disclaimer ribbon for inactive state"
claims_unverified: []

## Screenshots
> assets/wave03-cat-prod-detail/
- `21526-45088.png` — Frame 1: status active (Đang hoạt động — green badge, 375×812)
- `21528-24629.png` — Frame 2: status inactive (Ngưng hoạt động — grey badge, 375×812)

## Notes
- View-only screen — KHÔNG có Sửa/Xoá BottomBar. Edit/Create chỉ trên garage-web boundary (per CR-1782373204).
- 2 frame trong section = 2 status variant; same widget tree, only Badge label + color differs.
- "Ngưng hoạt động" (PROD-DETAIL) sử dụng diacritic 'ư' và badge GREY (neutral), khác "Ngừng hoạt động" (GRP-LIST) dùng 'ừ' và badge ORANGE — đây là 2 label/variant khác nhau dù cùng concept "inactive". Preserve verbatim per M-22.
- Section title "Thông số kĩ thuật" dùng diacritic 'kĩ' (per Figma) — KHÔNG đổi 'kỹ'.
- Cards layout vertically scrollable; tăng số card khi BE mở rộng spec PIM.
