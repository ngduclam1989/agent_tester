---
feat: FEAT-CAT-GRP-DELETE
feat_file: Product/features/FEAT-CAT-GRP-DELETE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24250&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24250"
fetched_at: 2026-06-29T09:15:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
coverage_gaps: []
---

# FEAT-CAT-GRP-DELETE — Mobile spec (v7)

> Section Figma `FEAT-CAT-GRP-DELETE` (id `21555:24250`) chứa 2 frame mobile screen-sized = 2 popover states của luồng xóa nhóm vật tư hàng hóa.

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| (none in popover bodies) | — | Popover hiển thị `vuesax/bold/clipboard-close` ở layer ẩn (`hidden="true"`); cả 2 màn KHÔNG hiển thị icon. M-24 anti-invent: KHÔNG add icon vào popover dialog. |

## Screen: Popup xác nhận (21254:52061)
- Device frame: 375x812px (phone)
- Scaffold: overlay popover (modal dialog), bg backdrop `rgba(0,0,0,~0.5)`
- AppBar: KHÔNG (popover overlay không có app bar — màn nền vẫn render bên dưới ẩn `DetailContent` hidden=true)
- Body layout: Stack — overlay backdrop full-screen + popover card căn giữa
- Padding: popover x=16, y=305, w=343, h=202 (figma frame `21254:52182 "Popover"`)
- Widget Tree:
  ```
  Scaffold (background screen ẩn — DetailContent hidden)
  └── Stack
      ├── ModalBarrier (backdrop bg=#000000 opacity ~0.5) [identifier: PopoverOverlay]
      └── Center
          └── Container/Popover [identifier: ConfirmDeleteGroupPopover]   ← w=343 h=202 radius=12 bg=AppColors.bgBase
              └── Column [crossAxis=stretch]
                  ├── Padding(EdgeInsets.symmetric(horizontal=16, vertical=24))
                  │   └── Column/Text [identifier: PopoverTextBlock]
                  │       ├── Text "Xác nhận"        ← title H3 center
                  │       └── Gap(AppSizes.spacing8)
                  │       └── Text "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Phụ tùng bảo dưỡng không?"   ← body C5 center
                  ├── Divider(thickness=1, color=AppColors.borderPrimary)
                  └── Padding(EdgeInsets.all(16))
                      └── Row [mainAxis=spaceBetween, gap=Gap(AppSizes.spacing8)]
                          ├── Expanded → AppButton/Huỷ                     ← secondary grey
                          └── Expanded → AppButton/XácNhận                 ← primary blue
  ```
- BottomBar / FAB: KHÔNG

### Container/Popover [identifier: ConfirmDeleteGroupPopover]
- Bounds: w=FIXED(343px) h=FIXED(202px)
- Layout-mode: flex(Column)
- BG: `#ffffff` → `AppColors.bgBase`
- Border: 0px (no border); radius=12 → `BorderRadius.circular(12)`
- Shadow: `AppShadows.boxShadow` (popover elevation)
- Padding: bao bọc bởi outer Stack
→ flutter: `Container(decoration: BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(12), boxShadow: AppShadows.boxShadow), child: Column(...))`
_png_verified: "asset 21254-52061-confirm-popover.png L mid-screen shows centered white card with rounded corners and 2-button footer"

### Text/Title-XacNhan
- Bounds: w=fill h=hug
- Text: "Xác nhận" 18px weight=700 → theme: `AppTextStyle.textHeadingH3` color=`#262626` → `AppColors.textPrimary`
- Padding: handled by parent Column
- State: default only
→ flutter: `Text("Xác nhận", style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textPrimary), textAlign: TextAlign.center)`
_png_verified: "asset 21254-52061-confirm-popover.png shows bold black 'Xác nhận' centered in popover top"

### Text/Body-ConfirmMessage
- Bounds: w=fill h=hug (~40px = 2 lines)
- Text: "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Phụ tùng bảo dưỡng không?" 14px weight=400 → theme: `AppTextStyle.textCaptionC5` color=`#262626` → `AppColors.textPrimary`
- Layout: TextAlign.center, max 2 lines visible (Phụ tùng bảo dưỡng là dữ liệu mẫu — tên nhóm động)
- State: default only
→ flutter: `Text("Bạn có chắc chắn muốn xóa nhóm vật tư hàng hoá $groupName không?", style: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary), textAlign: TextAlign.center)`
_png_verified: "asset 21254-52061-confirm-popover.png L mid shows 2-line text wrap 'Bạn có chắc chắn... Phụ tùng bảo dưỡng không?'"

### AppButton/Huỷ [identifier: CancelButton]
- Bounds: w=Expanded h=FIXED(36px) — `AppButtonSize.small`
- BG: `#f3f3f4` → `AppColors.bgSecondary` (= `buttonBackgroundSecondary`)
- Border: 0; radius=4
- Text: "Huỷ" 14px weight=600 → theme: `AppTextStyle.textSubtitleS5` color=`#262626` → `AppColors.textPrimary`
- Padding: handled by AppButton.small
- State: default; pressed → opacity overlay
→ flutter: `AppButton.text(title: "Huỷ", appButtonSize: AppButtonSize.small(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => Navigator.pop(context))`
_png_verified: "asset 21254-52061-confirm-popover.png L bottom-left shows light-grey button 'Huỷ' with dark text (no diacritic drift: 'Huỷ' KHÔNG 'Hủy')"

### AppButton/XácNhận [identifier: ConfirmButton]
- Bounds: w=Expanded h=FIXED(36px) — `AppButtonSize.small`
- BG: `#0052ff` → `AppColors.bgActive` (= `buttonBackgroundPrimary`)
- Border: 0; radius=4
- Text: "Xác nhận" 14px weight=600 → theme: `AppTextStyle.textSubtitleS5` color=`#ffffff` → `AppColors.textWhite`
- State: default; pressed → opacity overlay; loading (in-flight delete) → spinner
→ flutter: `AppButton.text(title: "Xác nhận", appButtonSize: AppButtonSize.small(), appButtonColor: AppButtonColor.primary(), onPress: bloc.confirmDelete)`
_png_verified: "asset 21254-52061-confirm-popover.png L bottom-right shows BLUE button 'Xác nhận' with white text — NOT danger-red (M-24 anti-invent: confirm delete = neutral primary, NOT destructive variant)"

_negative_coverage:
  - "KHÔNG có icon trong popover (clipboard-close layer 21254:52183 ẩn hidden=true) — anti-invent M-24"
  - "KHÔNG có danger-red color cho nút Xác nhận — primary blue per palette (DELETE confirmation pattern dùng confirm-not-destructive style)"
  - "KHÔNG có 3rd button (chỉ Huỷ + Xác nhận)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-delete/21254-52061-confirm-popover.png
claims_verified:
  - claim: "Popover centered on dark backdrop, white rounded card ~343x202"
    status: ✓
    evidence: "PNG mid-screen shows white card centered on grey overlay backdrop with rounded corners"
  - claim: "Title 'Xác nhận' bold center, then 2-line body text, then divider, then 2-button Row"
    status: ✓
    evidence: "PNG shows from top: bold 'Xác nhận' → body 'Bạn có chắc chắn... không?' → thin horizontal line → footer with 2 buttons"
  - claim: "Left button 'Huỷ' has light-grey bg + dark text (NOT red); right button 'Xác nhận' has bright blue bg + white text"
    status: ✓
    evidence: "PNG bottom Row: left button light fill #f3f3f4, right button vivid blue #0052ff — no destructive red"
  - claim: "Body text verbatim 'Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Phụ tùng bảo dưỡng không?' wraps to 2 lines"
    status: ✓
    evidence: "PNG body shows wrapping 'xóa nhóm vật tư hàng hóa' → 'hóa Phụ tùng bảo dưỡng không?'"
claims_unverified: []

## Screen: Popup không thể xoá (21254:52450)
- Device frame: 375x812px (phone)
- Scaffold: overlay popover (modal dialog), bg backdrop `rgba(0,0,0,~0.5)`
- AppBar: KHÔNG
- Body layout: Stack — overlay + popover card căn giữa
- Padding: popover x=16, y=295, w=343, h=222 (figma frame `21254:52571 "Popover"`)
- Widget Tree:
  ```
  Scaffold (background screen ẩn)
  └── Stack
      ├── ModalBarrier (backdrop bg=#000000 opacity ~0.5)
      └── Center
          └── Container/Popover [identifier: CannotDeleteGroupPopover]    ← w=343 h=222 radius=12 bg=AppColors.bgBase
              └── Column [crossAxis=stretch]
                  ├── Padding(EdgeInsets.symmetric(horizontal=16, vertical=24))
                  │   └── Column/Text
                  │       ├── Text "Không thể xóa"                                                   ← H3 bold center
                  │       └── Gap(AppSizes.spacing8)
                  │       └── Text "Nhóm vật tư hàng hóa Phụ tùng bảo dưỡng đã phát sinh mã sản phẩm nội bộ nên không được xóa."  ← body C5 center (3 lines)
                  ├── Divider(thickness=1, color=AppColors.borderPrimary)
                  └── Padding(EdgeInsets.all(16))
                      └── AppButton/Đóng                                  ← full-width secondary grey
  ```
- BottomBar / FAB: KHÔNG

### Container/Popover [identifier: CannotDeleteGroupPopover]
- Bounds: w=FIXED(343px) h=FIXED(222px)
- Layout-mode: flex(Column)
- BG: `#ffffff` → `AppColors.bgBase`
- Border: 0; radius=12 → `BorderRadius.circular(12)`
- Shadow: `AppShadows.boxShadow`
→ flutter: `Container(decoration: BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(12), boxShadow: AppShadows.boxShadow), child: Column(...))`
_png_verified: "asset 21254-52450-cannot-delete-popover.png L mid shows white rounded card with title + 3-line body + full-width button"

### Text/Title-KhongTheXoa
- Bounds: w=fill h=hug
- Text: "Không thể xóa" 18px weight=700 → theme: `AppTextStyle.textHeadingH3` color=`#262626` → `AppColors.textPrimary`
- State: default only
→ flutter: `Text("Không thể xóa", style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textPrimary), textAlign: TextAlign.center)`
_png_verified: "asset 21254-52450-cannot-delete-popover.png shows bold 'Không thể xóa' centered above body text"

### Text/Body-CannotDeleteMessage
- Bounds: w=fill h=hug (~60px = 3 lines)
- Text: "Nhóm vật tư hàng hóa Phụ tùng bảo dưỡng đã phát sinh mã sản phẩm nội bộ nên không được xóa." 14px weight=400 → theme: `AppTextStyle.textCaptionC5` color=`#262626` → `AppColors.textPrimary`
- Layout: TextAlign.center, 3 lines visible
→ flutter: `Text("Nhóm vật tư hàng hoá $groupName đã phát sinh mã sản phẩm nội bộ nên không được xóa.", style: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary), textAlign: TextAlign.center, maxLines: 3)`
_png_verified: "asset 21254-52450-cannot-delete-popover.png shows 3-line body 'Nhóm vật tư hàng hóa Phụ tùng bảo dưỡng đã phát sinh mã sản phẩm nội bộ nên không được xóa.' center-aligned"

### AppButton/Đóng [identifier: CloseButton]
- Bounds: w=fill (full popover width minus padding) h=FIXED(36px) — `AppButtonSize.small`
- BG: `#f3f3f4` → `AppColors.bgSecondary` (= `buttonBackgroundSecondary`)
- Border: 0; radius=4
- Text: "Đóng" 14px weight=600 → theme: `AppTextStyle.textSubtitleS5` color=`#262626` → `AppColors.textPrimary`
- State: default; pressed → opacity overlay
→ flutter: `AppButton.text(title: "Đóng", appButtonSize: AppButtonSize.small(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => Navigator.pop(context))`
_png_verified: "asset 21254-52450-cannot-delete-popover.png shows single full-width light-grey button 'Đóng' with dark text — no Confirm pair (single-action dismissal)"

_negative_coverage:
  - "KHÔNG có icon clipboard-close (layer 21254:52572 hidden=true) — anti-invent M-24"
  - "KHÔNG có cặp button (chỉ 1 nút Đóng full-width — info-only dialog, không có destructive action)"
  - "KHÔNG có danger-red color (info dialog dùng neutral grey)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-delete/21254-52450-cannot-delete-popover.png
claims_verified:
  - claim: "Popover centered on dark backdrop, white rounded card ~343x222 (taller than confirm-popover do body 3-line)"
    status: ✓
    evidence: "PNG mid-screen shows white card slightly taller than confirm-variant due to 3-line body wrap"
  - claim: "Title 'Không thể xóa' bold center, then 3-line body, then divider, then SINGLE full-width 'Đóng' button"
    status: ✓
    evidence: "PNG shows 'Không thể xóa' → 3-line message → horizontal divider → 1 full-width light-grey 'Đóng' button"
  - claim: "Single button 'Đóng' has light-grey bg + dark text (NOT primary blue, NOT red) — neutral dismiss style"
    status: ✓
    evidence: "PNG bottom shows single button full-width with light fill #f3f3f4 + dark text 'Đóng' — no primary or destructive variant"
  - claim: "Body text verbatim 'Nhóm vật tư hàng hóa Phụ tùng bảo dưỡng đã phát sinh mã sản phẩm nội bộ nên không được xóa.' wraps 3 lines"
    status: ✓
    evidence: "PNG body shows 3-line wrap with explicit phrase 'phát sinh mã sản phẩm nội bộ nên không được xóa' — matches FEAT AC-3 (block delete khi group có product)"
claims_unverified: []

## Screenshots
> assets/wave03-cat-grp-delete/
- `21254-52061-confirm-popover.png` — Frame 1: popover xác nhận xóa (375x812)
- `21254-52450-cannot-delete-popover.png` — Frame 2: popover không thể xóa (group có sản phẩm)

## Notes
- 2 popover variants per AC: confirm-delete (group rỗng → cho phép xóa) + cannot-delete (group đã phát sinh mã SP nội bộ → block).
- Cả 2 popover dùng `AppDialog`/`AppPopover` widget catalog của repo (hoặc raw `showDialog` + `Dialog`).
- Body text dynamic: `$groupName` thay thế "Phụ tùng bảo dưỡng" (mẫu data trong Figma).
- Confirm popover: primary blue button cho "Xác nhận" — NOT danger-red (per Figma palette + M-trap-3 AppColors enforcement).
- AppShadows.boxShadow áp dụng cho popover elevation (mặc dù không bắt buộc Figma — `AppDialog` factory tự apply).
