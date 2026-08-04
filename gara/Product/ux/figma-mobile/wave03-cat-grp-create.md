---
feat: FEAT-CAT-GRP-CREATE
feat_file: Product/features/FEAT-CAT-GRP-CREATE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24247&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24247"
fetched_at: 2026-06-29T09:18:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
coverage_gaps: []
---

# FEAT-CAT-GRP-CREATE — Mobile spec (v7)

> Section Figma `FEAT-CAT-GRP-CREATE` (id `21555:24247`) chứa 1 frame mobile screen-sized = màn tạo mới Nhóm vật tư hàng hóa (form).

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| chevron-back (AppBar leading) | `Icons.arrow_back_ios_new` (24px) | back navigation |
| chevron-down (Dropdown trailing) | `Icons.keyboard_arrow_down` (24px) | dropdown indicator on Thuộc nhóm + Trạng thái |

## Screen: Thêm nhóm vật tư hàng hóa (21252:51299)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgBase`
- AppBar: có — leading back chevron, title "Thêm nhóm vật tư hàng hóa" (verbatim, diacritic "hoá" trong Figma layer name + AppBar PNG "hoá" — preserve cả 2 form khi render dynamic). KHÔNG trailing action.
- Body layout: Column form + BottomBar footer
- Padding: form body padding `EdgeInsets.symmetric(horizontal: 16, vertical: 16)`
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: CreateGroupAppBar]
      │   ├── leading: IconButton(Icons.arrow_back_ios_new) → Navigator.pop
      │   └── title: Text "Thêm nhóm vật tư hàng hóa"
      ├── Expanded → SingleChildScrollView
      │   └── Column [gap=Gap(AppSizes.spacing16)]
      │       ├── SectionHeader/ThongTinChung [identifier: GeneralInfoSectionHeader]   ← chỉ có title "Thông tin chung", KHÔNG có Switch
      │       └── Column/FieldGroup [gap=Gap(AppSizes.spacing16)]                       ← _children_count: 5
      │           ├── AppTextField/MaNhomVTHH [identifier: GroupCodeField]               ← required *
      │           ├── AppTextField/TenNhomVTHH [identifier: GroupNameField]              ← required *
      │           ├── AppDropdown/ThuocNhom [identifier: ParentGroupField]               ← chevron-down
      │           ├── AppDropdown/TrangThai [identifier: StatusField]                    ← chevron-down
      │           └── AppTextarea/MoTa [identifier: DescriptionField]                    ← multi-line, char counter 0/250
      └── BottomBar/Footer [identifier: CreateGroupFooter]
          └── Row [gap=Gap(AppSizes.spacing8)]                                           ← _children_count: 2
              ├── Expanded → AppButton/Huỷ                                               ← secondary
              └── Expanded → AppButton/Lưu                                                ← primary
  ```
- BottomBar: có (Action bar instance 21252:51305 — y=708 h=104 — chứa 2 button Huỷ + Lưu)

### CustomAppBar [identifier: CreateGroupAppBar]
- Bounds: w=fill h=FIXED(96px) (status bar + nav bar combined frame `21252:51300`)
- BG: `AppColors.bgBase`
- Layout-mode: flex(Row)
- Padding: standard CustomAppBar padding
- Text: title "Thêm nhóm vật tư hàng hóa" 18px weight=700 → theme: `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
- Icons:
  - leading: `Icons.arrow_back_ios_new`, 24px, `AppColors.textPrimary`
→ flutter: `CustomAppBar(title: "Thêm nhóm vật tư hàng hóa", leading: BackButton())`
_png_verified: "asset 21252-51299.png L top shows '<' chevron + 'Thêm nhóm vật tư hàng hoá' title"

### SectionHeader/ThongTinChung [identifier: GeneralInfoSectionHeader]
- Bounds: w=fill h=FIXED(26px)
- Layout-mode: flex(Row, mainAxis=spaceBetween, crossAxis=center)
- BG: transparent
- Text: "Thông tin chung" 18px weight=700 → theme: `AppTextStyle.textHeadingH3` color=`#262626` → `AppColors.textPrimary`
- Padding: `EdgeInsets.only(top: 16, bottom: 16)`
→ flutter: `Padding(padding: EdgeInsets.symmetric(vertical: AppSizes.spacing16), child: Text("Thông tin chung", style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textPrimary)))`
_png_verified: "asset 21252-51299.png L upper-mid shows bold 'Thông tin chung' left-aligned, NO toggle/switch on right"

_negative_coverage:
  - "KHÔNG có Switch/Toggle trong section header (metadata khai `Controls / Switches` instance 21254:51565 nhưng PNG không render — M-24 anti-invent, không render thì không emit)"
  - "KHÔNG có icon ở section header (chỉ text title)"
  - "KHÔNG có badge / counter ở section header"

### AppTextField/MaNhomVTHH [identifier: GroupCodeField]
- Bounds: w=fill h=FIXED(72px) (label 20 + gap 8 + input 44)
- Label: "Mã nhóm VTHH *" — text 14px weight=500 → theme: `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`; "*" red `#ed1f42` → `AppColors.textErrorPrimary`
- Input value: "MN1202012" (sample) — text 14px weight=500 → theme: `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
- BG: `AppColors.bgBase`
- Border: 1px solid `#e8e8ea` → `AppColors.borderPrimary` radius=`BorderRadius.circular(8)`
- Padding: handled by `AppTextField` widget factory (encapsulates internal cell padding per design system baseline)
- State: default; focused → border `AppColors.borderActive`; error → border `AppColors.borderError` + helper text
→ flutter: `AppTextField(label: "Mã nhóm VTHH", required: true, controller: bloc.groupCodeController, hint: "Nhập mã nhóm")`
_png_verified: "asset 21252-51299.png shows 'Mã nhóm VTHH *' label (red asterisk) + input box with sample text 'MN1202012'"

### AppTextField/TenNhomVTHH [identifier: GroupNameField]
- Bounds: w=fill h=FIXED(72px)
- Label: "Tên nhóm VTHH *" — text style same as MaNhomVTHH; "*" red `AppColors.textErrorPrimary`
- Input value: "Công ty CP Thanh toán Dịch Vụ Hưng Hà" (sample)
- BG/Border/Padding/State: identical to GroupCodeField above
→ flutter: `AppTextField(label: "Tên nhóm VTHH", required: true, controller: bloc.groupNameController, hint: "Nhập tên nhóm")`
_png_verified: "asset 21252-51299.png shows 'Tên nhóm VTHH *' (red asterisk) + input with sample text"

### AppDropdown/ThuocNhom [identifier: ParentGroupField]
- Bounds: w=fill h=FIXED(72px)
- Label: "Thuộc nhóm" (NO asterisk — optional field)
- Selected value: "Vật tư hàng hoá" — text 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
- BG: `AppColors.bgBase`
- Border: 1px solid `AppColors.borderPrimary` radius=`BorderRadius.circular(8)`
- Icons:
  - trailing: `Icons.keyboard_arrow_down`, 24px, `AppColors.textTertiary`
- State: default; opened → bottom sheet selector
→ flutter: `AppDropdown(label: "Thuộc nhóm", value: bloc.parentGroup, items: parentGroups, onChanged: bloc.setParentGroup)`
_png_verified: "asset 21252-51299.png shows 'Thuộc nhóm' label + dropdown cell with 'Vật tư hàng hoá' + chevron-down right (diacritic 'hoá' verbatim from PNG)"

### AppDropdown/TrangThai [identifier: StatusField]
- Bounds: w=fill h=FIXED(72px)
- Label: "Trạng thái" (NO asterisk)
- Selected value: "Đang hoạt động"
- BG/Border same as ThuocNhom
- Icons:
  - trailing: `Icons.keyboard_arrow_down`, 24px, `AppColors.textTertiary`
- State: default; opened → bottom sheet selector (2 options: "Đang hoạt động", "Đã ẩn" hoặc tương đương per FEAT AC)
→ flutter: `AppDropdown(label: "Trạng thái", value: bloc.status, items: statusOptions, onChanged: bloc.setStatus)`
_png_verified: "asset 21252-51299.png shows 'Trạng thái' label + dropdown with 'Đang hoạt động' + chevron-down"

### AppTextarea/MoTa [identifier: DescriptionField]
- Bounds: w=fill h=FIXED(152px) (label + multi-line input + char counter)
- Label: "Mô tả" (NO asterisk)
- Placeholder: "Nhập mô tả" 14px weight=400 → `AppTextStyle.textCaptionC5` color=`#b8babf` → `AppColors.textQuaternary`
- BG: `AppColors.bgBase`
- Border: 1px solid `AppColors.borderPrimary` radius=`BorderRadius.circular(8)`
- Padding: handled by `AppTextarea` widget factory (encapsulates internal cell padding)
- Char counter: bottom-right "0/250" → 12px weight=400 → `AppTextStyle.textCaptionC7` color=`AppColors.textTertiary`
- Constraint: maxLength=250
- State: default; focused → border `AppColors.borderActive`
→ flutter: `AppTextarea(label: "Mô tả", hint: "Nhập mô tả", maxLength: 250, controller: bloc.descController)`
_png_verified: "asset 21252-51299.png shows 'Mô tả' label + empty textarea with placeholder 'Nhập mô tả' + counter '0/250' bottom-right"

### BottomBar/Footer [identifier: CreateGroupFooter]
- Bounds: w=fill h=FIXED(104px) — Action bar instance 21252:51305
- Layout-mode: flex(Row, mainAxis=spaceBetween)
- BG: `AppColors.bgBase`
- Padding: `EdgeInsets.symmetric(horizontal: 16, vertical: 16)` + SafeArea bottom inset
- Children _children_count: 2 (Huỷ, Lưu)
- Border-top: 1px solid `AppColors.borderPrimary` (separator line above footer)

#### AppButton/Huỷ [identifier: CancelButton]
- Bounds: w=Expanded h=FIXED(48px) — `AppButtonSize.medium`
- BG: `#f3f3f4` → `AppColors.buttonBackgroundSecondary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Huỷ" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`AppColors.textPrimary`
- State: default; pressed → opacity overlay
→ flutter: `AppButton.text(title: "Huỷ", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => Navigator.pop(context))`
_png_verified: "asset 21252-51299.png L bottom-left shows light-grey button 'Huỷ' (diacritic 'Huỷ' KHÔNG 'Hủy')"

#### AppButton/Lưu [identifier: SaveButton]
- Bounds: w=Expanded h=FIXED(48px)
- BG: `#0052ff` → `AppColors.buttonBackgroundPrimary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Lưu" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`AppColors.textWhite`
- State: default; pressed → opacity overlay; loading (saving) → CircularProgressIndicator; disabled (validation fail) → opacity 0.5
→ flutter: `AppButton.text(title: "Lưu", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: bloc.submit)`
_png_verified: "asset 21252-51299.png L bottom-right shows BLUE button 'Lưu' with white text"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-create/21252-51299.png
claims_verified:
  - claim: "AppBar has back chevron leading + title 'Thêm nhóm vật tư hàng hoá' (no trailing action)"
    status: ✓
    evidence: "PNG top shows '<' icon + 'Thêm nhóm vật tư hàng hoá' centered/left, no right-side icon"
  - claim: "Section 'Thông tin chung' header has ONLY title text — NO Switch/Toggle on right (despite metadata)"
    status: ✓
    evidence: "PNG mid-upper shows bold 'Thông tin chung' with empty space on right; no toggle widget visible"
  - claim: "5 form fields in order: Mã nhóm VTHH * → Tên nhóm VTHH * → Thuộc nhóm → Trạng thái → Mô tả"
    status: ✓
    evidence: "PNG shows top-to-bottom: 'Mã nhóm VTHH *' input, 'Tên nhóm VTHH *' input, 'Thuộc nhóm' dropdown, 'Trạng thái' dropdown, 'Mô tả' textarea with counter"
  - claim: "Required fields marked with red asterisk '*': Mã nhóm VTHH + Tên nhóm VTHH only"
    status: ✓
    evidence: "PNG label rows: 'Mã nhóm VTHH *' and 'Tên nhóm VTHH *' show red '*', other 3 fields have no asterisk"
  - claim: "Footer Row has 2 buttons: [Huỷ light-grey | Lưu primary-blue] full-width split"
    status: ✓
    evidence: "PNG bottom shows 2 equal-width buttons; left light-grey 'Huỷ', right vivid-blue 'Lưu'"
  - claim: "Dropdowns (Thuộc nhóm, Trạng thái) have chevron-down trailing icon"
    status: ✓
    evidence: "PNG rows 3+4 show 'v' chevron on right end of cells; text inputs (rows 1+2) have no trailing icon"
claims_unverified: []

## Screenshots
> assets/wave03-cat-grp-create/
- `21252-51299.png` — Frame 1: Thêm nhóm vật tư hàng hóa (375x812)

## Notes
- Single screen — no states beyond default + loading/error variants (BLoC managed).
- Diacritic verbatim: AppBar title "hóa" (in metadata layer name "Thêm Nhóm vật tư hàng hóa") vs PNG "hoá" — preserve verbatim as **rendered in PNG** = "hoá". Same for Dropdown value "Vật tư hàng hoá".
- Switch instance in metadata `21254:51565 "Controls / Switches"` is rendered hidden — M-24 anti-invent rule: do NOT include in widget tree.
- BottomBar 2-button Row is the FEAT AC-1 save action; "Huỷ" pops navigation, "Lưu" triggers BLoC submit + validate + API call.
- Mã nhóm + Tên nhóm là required (per FEAT AC + PNG asterisk).
- Textarea Mô tả char counter "0/250" cấm vượt 250 ký tự.
