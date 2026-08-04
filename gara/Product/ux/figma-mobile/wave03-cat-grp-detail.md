---
feat: FEAT-CAT-GRP-DETAIL
feat_file: Product/features/FEAT-CAT-GRP-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24248&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24248"
fetched_at: 2026-06-29T09:21:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
coverage_gaps: []
---

# FEAT-CAT-GRP-DETAIL — Mobile spec (v7)

> Section Figma `FEAT-CAT-GRP-DETAIL` (id `21555:24248`) chứa 1 frame mobile = màn xem chi tiết Nhóm vật tư hàng hoá.

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| chevron-back (AppBar leading) | `Icons.arrow_back_ios_new` (24px) — color `AppColors.textPrimary` | _png_source: asset 21254-51661.png AppBar leading `<` chevron |

## Screen: Chi tiết nhóm vật tư hàng hoá (21254:51661)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgBase`
- AppBar: có — leading back chevron, title "Chi tiết nhóm vật tư hàng hoá" (verbatim 'hoá' from PNG). KHÔNG trailing action (Edit/Delete chuyển xuống BottomBar).
- Body layout: Column scrollable + BottomBar footer
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: GroupDetailAppBar]
      │   ├── leading: BackButton
      │   └── title: Text "Chi tiết nhóm vật tư hàng hoá"
      ├── Expanded → SingleChildScrollView
      │   └── Column
      │       ├── Container/HeaderCard [identifier: GroupSummaryHeader]
      │       │   └── Row [mainAxis=spaceBetween, crossAxis=start, padding=EdgeInsets.all(AppSizes.spacing16)]
      │       │       ├── Column [crossAxis=start]                                ← left block
      │       │       │   ├── Text "NK240516-001" → color textActivePrimary       ← group code (link-style blue)
      │       │       │   └── Text "Ngày tạo: 21/07/2025 20:12" → C7 textTertiary  ← create timestamp small
      │       │       └── Badge/DangHoatDong [identifier: ActiveStatusBadge]      ← green pill
      │       ├── Divider/SectionDivider                                          ← 6px thick grey strip (Rectangle 5628)
      │       └── Container/DetailSection [identifier: GroupDetailFieldList]
      │           └── Column [padding=EdgeInsets.all(AppSizes.spacing16)]
      │               ├── Text "Phụ tùng bảo dưỡng" → H3 bold textPrimary         ← group name big title (header label, hidden Edit button next)
      │               └── Gap(AppSizes.spacing16)
      │               └── Column/FieldsList [gap=Gap(AppSizes.spacing8), _children_count: 6]
      │                   ├── DetailRow "Thuộc nhóm" : "Vật tư hàng hoá"
      │                   ├── DetailRow "Mô tả" : "Nhóm phụ tùng thay thế định kỳ."
      │                   ├── DetailRow "Ngày tạo" : "10/10/2025 10:24"
      │                   ├── DetailRow "Người tạo" : "Nguyễn Ánh Tuyết"
      │                   ├── DetailRow "Ngày sửa" : "10/10/2025 10:24"
      │                   └── DetailRow "Người sửa" : "Nguyễn Ánh Tuyết"
      └── BottomBar/Footer [identifier: GroupDetailFooter]
          └── Row [gap=Gap(AppSizes.spacing8), _children_count: 2]
              ├── Expanded → AppButton/Xoá                                         ← secondary
              └── Expanded → AppButton/Sửa                                          ← primary
  ```
- BottomBar: có

### Container/HeaderCard [identifier: GroupSummaryHeader]
- Bounds: w=fill h=FIXED(~78px)
- Layout-mode: flex(Row, mainAxis=spaceBetween, crossAxis=start)
- BG: `AppColors.bgBase`
- Padding: `EdgeInsets.all(AppSizes.spacing16)`
→ flutter: `Container(padding: EdgeInsets.all(AppSizes.spacing16), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.start, children: [...]))`
_png_verified: "asset 21254-51661.png top section shows 2-column row: left has 'NK240516-001' blue text above 'Ngày tạo: 21/07/2025 20:12' small grey, right has green status badge"

### Text/GroupCode
- Text: "NK240516-001" 16px weight=700 → theme: `AppTextStyle.textHeadingH4` color=`#0052ff` → `AppColors.textActivePrimary`
- State: default
→ flutter: `Text(group.code, style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textActivePrimary))`
_png_verified: "asset 21254-51661.png upper-left shows blue 'NK240516-001' bold text (group code in primary blue, link-style)"

### Text/CreateTimestamp
- Text: "Ngày tạo: 21/07/2025 20:12" 12px weight=400 → theme: `AppTextStyle.textCaptionC7` color=`AppColors.textTertiary`
→ flutter: `Text("Ngày tạo: ${formatDateTime(group.createdAt)}", style: AppTextStyle.textCaptionC7.copyWith(color: AppColors.textTertiary))`
_png_verified: "asset 21254-51661.png upper-left, below code, shows small grey 'Ngày tạo: 21/07/2025 20:12'"

### Badge/DangHoatDong [identifier: ActiveStatusBadge]
- Bounds: w=FIXED(108px) h=FIXED(26px)
- BG: `AppColors.bgBadgeSuccess` (light green from GreenColor.s50)
- Border: 0; radius=`BorderRadius.circular(13)` (full pill)
- Text: "Đang hoạt động" 14px weight=600 → theme: `AppTextStyle.textSubtitleS5` color=`AppColors.textSuccessPrimary` (GreenColor.s600 `#15aa2c`)
- Padding: `EdgeInsets.symmetric(horizontal: AppSizes.spacing8, vertical: AppSizes.spacing4)`
- State variants: "Đang hoạt động" (success green), "Đã ẩn" (neutral grey — bgBadgeOpen / textSecondary)
→ flutter: `Badge.statusPill(label: group.statusLabel, color: group.statusColor)`
_png_verified: "asset 21254-51661.png upper-right shows green pill badge 'Đang hoạt động' with light-green fill + dark-green text"

### Text/GroupName
- Text: "Phụ tùng bảo dưỡng" 18px weight=700 → theme: `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
→ flutter: `Text(group.name, style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textPrimary))`
_png_verified: "asset 21254-51661.png mid-section shows bold large 'Phụ tùng bảo dưỡng' as primary heading"

### Column/FieldsList [identifier: GroupDetailFieldList]
- Bounds: w=fill h=hug (~160px = 6 rows × ~28px line-height)
- Layout-mode: flex(Column, gap=Gap(AppSizes.spacing8))
- `_children_count: 6` (matches metadata FieldsList 6 frames: 1948757093 + 1948757097 + 4 SummaryRow)
- Each row: Row [crossAxis=start] with Text label (grey) + Gap + Text value (dark)

#### DetailRow/Generic (6 instances)
- Layout-mode: flex(Row)
- Label text: e.g. "Thuộc nhóm" 14px weight=400 → `AppTextStyle.textCaptionC5` color=`AppColors.textSecondary` (NeutralColor.s700)
- Value text: e.g. "Vật tư hàng hoá" 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
- Separator: ":" + space, OR label right-padding + value left-padding (PNG uses label trailing colon)
→ flutter: `Row(children: [Text("$label:", style: ...secondary), Gap(AppSizes.spacing8), Expanded(child: Text(value, style: ...primary))])`
_png_verified: "asset 21254-51661.png mid-low shows 6 detail rows: 'Thuộc nhóm: Vật tư hàng hoá' / 'Mô tả: Nhóm phụ tùng thay thế định kỳ.' / 'Ngày tạo: 10/10/2025 10:24' / 'Người tạo: Nguyễn Ánh Tuyết' / 'Ngày sửa: 10/10/2025 10:24' / 'Người sửa: Nguyễn Ánh Tuyết'"

_negative_coverage:
  - "KHÔNG có Edit button trong section header (metadata layer `21254:51767 Button` ẩn hidden=true — anti-invent M-24)"
  - "KHÔNG có icon trên DetailRow nào"
  - "KHÔNG có Divider giữa các DetailRow (gap-based separator chỉ)"

### BottomBar/Footer [identifier: GroupDetailFooter]
- Bounds: w=fill h=FIXED(104px) — Action bar instance 21254:51680
- Layout-mode: flex(Row, mainAxis=spaceBetween)
- BG: `AppColors.bgBase`
- Padding: `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing16)` + SafeArea bottom
- Border-top: 1px solid `AppColors.borderPrimary`

#### AppButton/Xoá [identifier: DeleteButton]
- Bounds: w=Expanded h=FIXED(48px) — `AppButtonSize.medium`
- BG: `#f3f3f4` → `AppColors.buttonBackgroundSecondary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Xoá" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`AppColors.textPrimary`
- State: default; pressed → opacity; tap → open Confirm popover (FEAT-CAT-GRP-DELETE) or Cannot-delete popover (BR check)
→ flutter: `AppButton.text(title: "Xoá", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: bloc.requestDelete)`
_png_verified: "asset 21254-51661.png L bottom-left shows light-grey button 'Xoá' (NOT 'Xóa' — diacritic 'oá' verbatim from PNG; NOT danger-red despite delete action — M-24 anti-invent + matches GRP-DELETE confirm popover primary-blue style)"

#### AppButton/Sửa [identifier: EditButton]
- Bounds: w=Expanded h=FIXED(48px)
- BG: `#0052ff` → `AppColors.buttonBackgroundPrimary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Sửa" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`AppColors.textWhite`
- State: default; pressed → opacity; tap → push EditScreen (FEAT-CAT-GRP-EDIT)
→ flutter: `AppButton.text(title: "Sửa", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: bloc.openEdit)`
_png_verified: "asset 21254-51661.png L bottom-right shows BLUE button 'Sửa' (NOT 'Chỉnh sửa' — verbatim 'Sửa' from PNG, no paraphrase expand per M-22)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-detail/21254-51661.png
claims_verified:
  - claim: "AppBar title 'Chi tiết nhóm vật tư hàng hoá' (diacritic 'hoá' verbatim, no trailing action button)"
    status: ✓
    evidence: "PNG top shows '<' + 'Chi tiết nhóm vật tư hàng hoá' centered, no right icon"
  - claim: "Header card: left column 'NK240516-001' (blue) + 'Ngày tạo: 21/07/2025 20:12' below; right column green status badge 'Đang hoạt động'"
    status: ✓
    evidence: "PNG top-section row shows blue code + small grey timestamp on left, green pill 'Đang hoạt động' on right"
  - claim: "Detail body shows large bold name 'Phụ tùng bảo dưỡng' THEN 6 label:value rows (Thuộc nhóm, Mô tả, Ngày tạo, Người tạo, Ngày sửa, Người sửa)"
    status: ✓
    evidence: "PNG mid-low shows H3 'Phụ tùng bảo dưỡng' followed by 6 rows with grey label and dark value text"
  - claim: "Footer Row: [Xoá light-grey | Sửa primary-blue] — NOT 'Chỉnh sửa', NOT 'Xóa' (diacritic preserved)"
    status: ✓
    evidence: "PNG bottom shows 2-button row with verbatim 'Xoá' (left, grey) and 'Sửa' (right, blue) — no paraphrase to 'Chỉnh sửa' nor diacritic drift to 'Xóa'"
  - claim: "NO inline Edit icon button next to group name (metadata Button hidden=true)"
    status: ✓
    evidence: "PNG mid-section near 'Phụ tùng bảo dưỡng' shows no inline Edit icon/button — edit action only via BottomBar 'Sửa'"
claims_unverified: []

## Screenshots
> assets/wave03-cat-grp-detail/
- `21254-51661.png` — Frame 1: Chi tiết nhóm vật tư hàng hoá (375x812)

## Notes
- Group code rendered in primary blue (`textActivePrimary`) — link-style; tap behavior tùy FEAT AC (có thể copy hoặc no-op).
- Status badge có 2 variant: "Đang hoạt động" (success green) vs "Đã ẩn" (neutral grey).
- BottomBar 2 actions: "Xoá" tap → spawn FEAT-CAT-GRP-DELETE confirm popover; "Sửa" tap → push FEAT-CAT-GRP-EDIT screen.
- "Xoá" verbatim diacritic 'oá' — PNG canonical (M-22 verbatim label rule).
- Edit button inline (layer 21254:51767) hidden — chỉ edit qua BottomBar "Sửa".
