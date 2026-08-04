---
feat: FEAT-CAT-GRP-EDIT
feat_file: Product/features/FEAT-CAT-GRP-EDIT.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24249&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24249"
fetched_at: 2026-06-29T09:21:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
coverage_gaps: []
---

# FEAT-CAT-GRP-EDIT — Mobile spec (v7)

> Section Figma `FEAT-CAT-GRP-EDIT` (id `21555:24249`) chứa 1 frame mobile = màn chỉnh sửa Nhóm vật tư hàng hoá.
>
> ⚠️ **Layout = identical sang FEAT-CAT-GRP-CREATE** (`wave03-cat-grp-create.md`). Khác biệt duy nhất: (1) AppBar title "Chỉnh sửa Nhóm vật tư hàng hoá" thay "Thêm nhóm vật tư hàng hoá"; (2) inputs pre-filled với existing group data từ API GET. Cùng 5 fields, cùng widget tree, cùng footer 2-button.

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| chevron-back (AppBar leading) | `Icons.arrow_back_ios_new` (24px) | back nav |
| chevron-down (Dropdown trailing) | `Icons.keyboard_arrow_down` (24px) | dropdown indicator on Thuộc nhóm + Trạng thái |

## Screen: Chỉnh sửa Nhóm vật tư hàng hoá (21254:51963)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgBase`
- AppBar: có — leading back chevron, title "Chỉnh sửa Nhóm vật tư hàng hoá" (verbatim 'hoá' from PNG — diacritic preserved per M-22). KHÔNG trailing action.
- Body layout: Column form + BottomBar footer (same as Create)
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: EditGroupAppBar]
      │   ├── leading: BackButton
      │   └── title: Text "Chỉnh sửa Nhóm vật tư hàng hoá"
      ├── Expanded → SingleChildScrollView
      │   └── Column [gap=Gap(AppSizes.spacing16)]
      │       ├── SectionHeader/ThongTinChung [identifier: GeneralInfoSectionHeader]   ← chỉ title, KHÔNG Switch
      │       └── Column/FieldGroup [gap=Gap(AppSizes.spacing16), _children_count: 5]
      │           ├── AppTextField/MaNhomVTHH [identifier: GroupCodeField]               ← required *, pre-filled "MN1202012"
      │           ├── AppTextField/TenNhomVTHH [identifier: GroupNameField]              ← required *, pre-filled
      │           ├── AppDropdown/ThuocNhom [identifier: ParentGroupField]               ← pre-selected "Vật tư hàng hoá"
      │           ├── AppDropdown/TrangThai [identifier: StatusField]                    ← pre-selected "Đang hoạt động"
      │           └── AppTextarea/MoTa [identifier: DescriptionField]                    ← pre-filled or empty
      └── BottomBar/Footer [identifier: EditGroupFooter]
          └── Row [gap=Gap(AppSizes.spacing8), _children_count: 2]
              ├── Expanded → AppButton/Huỷ
              └── Expanded → AppButton/Lưu
  ```
- BottomBar: có (Action bar instance 21254:51982)

### CustomAppBar [identifier: EditGroupAppBar]
- Bounds: w=fill h=FIXED(96px)
- BG: `AppColors.bgBase`
- Text: title "Chỉnh sửa Nhóm vật tư hàng hoá" 18px weight=700 → `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
- Icons:
  - leading: `Icons.arrow_back_ios_new`, 24px, `AppColors.textPrimary`
→ flutter: `CustomAppBar(title: "Chỉnh sửa Nhóm vật tư hàng hoá", leading: BackButton())`
_png_verified: "asset 21254-51963.png L top shows '<' chevron + 'Chỉnh sửa Nhóm vật tư hàng hoá' title"

### SectionHeader/ThongTinChung [identifier: GeneralInfoSectionHeader]
- Bounds: w=fill h=FIXED(26px)
- Text: "Thông tin chung" 18px weight=700 → `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
- Padding: `EdgeInsets.symmetric(vertical: AppSizes.spacing16)`
→ flutter: `Padding(padding: EdgeInsets.symmetric(vertical: AppSizes.spacing16), child: Text("Thông tin chung", style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textPrimary)))`
_png_verified: "asset 21254-51963.png upper-mid shows bold 'Thông tin chung' left-aligned, NO switch/toggle on right"

_negative_coverage:
  - "KHÔNG có Switch/Toggle trong section header (metadata `Controls / Switches` 21254:51970 nhưng PNG không render — M-24 anti-invent identical to GRP-CREATE pattern)"

### AppTextField/MaNhomVTHH [identifier: GroupCodeField]
- Bounds: w=fill h=FIXED(72px)
- Label: "Mã nhóm VTHH *"; "*" red `AppColors.textErrorPrimary`
- Value: pre-filled with existing `group.code` (e.g. "MN1202012")
- BG/Border/State: identical to GroupCodeField in `wave03-cat-grp-create.md` (same form pattern)
→ flutter: `AppTextField(label: "Mã nhóm VTHH", required: true, controller: bloc.groupCodeController..text = group.code)`
_png_verified: "asset 21254-51963.png shows 'Mã nhóm VTHH *' label with red asterisk + pre-filled 'MN1202012'"

> **Field spec note** [identifier: SharedFieldRefBlock]: Các field còn lại (GroupNameField, ParentGroupField, StatusField, DescriptionField) — visual spec identical to GRP-CREATE counterparts (cùng Bounds, BG, Border, Padding, Label style, State variants). Khác biệt duy nhất: pre-filled vs empty. Skip duplicate block để tránh divergence — reference `wave03-cat-grp-create.md` cho chi tiết widget tree từng field. Verbatim labels từ PNG:
> - "Tên nhóm VTHH *" (red asterisk, pre-filled "Công ty CP Thanh toán Dịch Vụ Hưng Hà")
> - "Thuộc nhóm" (no asterisk, pre-selected "Vật tư hàng hoá" + chevron-down)
> - "Trạng thái" (no asterisk, pre-selected "Đang hoạt động" + chevron-down)
> - "Mô tả" (no asterisk, empty textarea with placeholder "Nhập mô tả" + counter "0/250")

### BottomBar/Footer [identifier: EditGroupFooter]
- Bounds: w=fill h=FIXED(104px)
- Layout-mode: flex(Row, mainAxis=spaceBetween, _children_count: 2)
- BG: `AppColors.bgBase`; Border-top: 1px solid `AppColors.borderPrimary`
- Padding: `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing16)` + SafeArea bottom

#### AppButton/Huỷ
- Bounds: w=Expanded h=FIXED(48px); BG `AppColors.buttonBackgroundSecondary`; Text "Huỷ" → `textSubtitleS4` color `textPrimary`
→ flutter: `AppButton.text(title: "Huỷ", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => Navigator.pop(context))`
_png_verified: "asset 21254-51963.png L bottom-left shows light-grey 'Huỷ' (diacritic preserved)"

#### AppButton/Lưu
- Bounds: w=Expanded h=FIXED(48px); BG `AppColors.buttonBackgroundPrimary`; Text "Lưu" → `textSubtitleS4` color `textWhite`
- State: default; loading → CircularProgressIndicator; disabled (validation fail) → opacity 0.5
→ flutter: `AppButton.text(title: "Lưu", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: bloc.submitEdit)`
_png_verified: "asset 21254-51963.png L bottom-right shows BLUE 'Lưu' button"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-edit/21254-51963.png
claims_verified:
  - claim: "AppBar title 'Chỉnh sửa Nhóm vật tư hàng hoá' (NOT 'Sửa' nor 'Edit' — verbatim full phrase from PNG)"
    status: ✓
    evidence: "PNG top shows '<' + 'Chỉnh sửa Nhóm vật tư hàng hoá' title (capital N in 'Nhóm' verbatim)"
  - claim: "Form has 5 fields in same order as GRP-CREATE: Mã nhóm VTHH * → Tên nhóm VTHH * → Thuộc nhóm → Trạng thái → Mô tả"
    status: ✓
    evidence: "PNG mid-section shows same field order as GRP-CREATE; first 2 marked '*' required"
  - claim: "Section header 'Thông tin chung' has NO Switch widget on right (despite metadata) — identical anti-invent pattern to GRP-CREATE"
    status: ✓
    evidence: "PNG upper-mid shows 'Thông tin chung' bold left-aligned with empty right-side; no toggle visible"
  - claim: "Footer 2-button Row [Huỷ light-grey | Lưu primary-blue] identical to GRP-CREATE"
    status: ✓
    evidence: "PNG bottom shows same 2-button split-row pattern as GRP-CREATE"
  - claim: "Pre-filled values visible: Mã nhóm 'MN1202012', Tên nhóm 'Công ty CP Thanh toán Dịch Vụ Hưng Hà', Thuộc nhóm 'Vật tư hàng hoá', Trạng thái 'Đang hoạt động'"
    status: ✓
    evidence: "PNG shows input boxes pre-filled (text visible, not placeholder grey) — matches edit-mode pattern with existing data"
claims_unverified: []

## Screenshots
> assets/wave03-cat-grp-edit/
- `21254-51963.png` — Frame 1: Chỉnh sửa Nhóm vật tư hàng hoá (375x812)

## Notes
- Layout identical to GRP-CREATE — DEV implement với shared form widget + create/edit mode flag.
- Pre-fill: BLoC load existing group on mount (GET /api/v1/inventory/groups/{id}), populate fields.
- Submit: PUT /api/v1/inventory/groups/{id} via BFF GraphQL mutation; navigate back on success.
- Mã nhóm VTHH có thể read-only trong edit mode (per FEAT AC — confirm với BA nếu allow change).
- "Lưu" button trigger validate + save; "Huỷ" pops navigation (warn if dirty per FEAT AC).
