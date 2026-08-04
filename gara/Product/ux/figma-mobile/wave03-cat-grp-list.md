---
feat: FEAT-CAT-GRP-LIST
feat_file: Product/features/FEAT-CAT-GRP-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21254-52586&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21254:52586"
fetched_at: 2026-06-29T15:30:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 9
coverage_gaps: []
---

# FEAT-CAT-GRP-LIST — Mobile spec (v7)

> Section Figma `FEAT-CAT-GRP-LIST` (id `21254:52586`, 4901×2183) chứa **9 top-level frame variant** = 9 state của màn danh sách Nhóm vật tư hàng hoá. Frame chính (default) = `21235:29061` "Danh sách nhóm vật tư hàng hoá" (375×812). 9 frames cover: 4 list states (Tất cả default / Đang hoạt động / Ngừng hoạt động / empty data) + 3 search states (Default keyword prompt / No Results / Results) + 2 filter states (Default blank / Filled with selection). Mobile = full CRUD per CR-1782373204 (BottomBar primary "Thêm nhóm vật tư" + tap card → Detail).

## Icon Catalog (shared)
- **chevron-back** (AppBar leading) → `Icons.arrow_back_ios_new` (24px, `AppColors.textPrimary`) — back nav
  _png_source: "asset 21235-29061.png AppBar L top-left shows `<` chevron"
- **search** (AppBar trailing-1, List page) → `Icons.search` (24px, `AppColors.textPrimary`) — search trigger
  _png_source: "asset 21235-29061.png AppBar L top-right area shows magnifier icon (search trigger)"
- **filter-funnel** (AppBar trailing-2, List page) → `Icons.tune` / funnel SVG (24px, `AppColors.textPrimary`) — filter trigger
  _png_source: "asset 21235-29061.png AppBar L top-right area shows funnel/tune icon adjacent to search"
- **search-input-prefix** (Search input leading) → `Icons.search` (20px, `AppColors.iconSecondary`) — prefix inside SearchInput field (separate from AppBar trailing search icon)
  _png_source: "asset 21252-48381-search-default.png L top shows grey-bg pill SearchInput with magnifier prefix"
- **chevron-down** (Dropdown trailing) → `Icons.keyboard_arrow_down` (24px, `AppColors.textTertiary`) — dropdown indicator on filter sheet
  _png_source: "asset 21252-49574-filter-default.png + 21252-49582-filter-filled.png dropdown cell trailing"
- **floppy-disk** (card "Thuộc nhóm" row leading) → `vuesax/linear/floppy-disk` → `Icons.save_outlined` (16px) — "Thuộc nhóm" row leading icon
  _png_source: "asset 21235-29061.png + 21252-47609-variant2.png + 21252-48117-variant3.png GroupListCard L row 1 shows floppy-disk style icon prefix"
- **note** (card "Mô tả" row leading) → `vuesax/linear/note` → `Icons.description_outlined` (16px) — "Mô tả" row leading icon
  _png_source: "asset 21235-29061.png + 21252-47609-variant2.png GroupListCard L row 2 shows note/document-outline icon prefix"
- **search-magnifier-illustration** (No Results empty-state) → `Icons.search_off` or SVG asset (~48px line-art, `AppColors.iconSecondary`) — search-specific empty illustration
  _png_source: "asset 21252-48401-search-no-results.png center shows magnifier line-art icon above 2-line message"
- **empty-data-illustration** (Tất cả empty state) → SVG asset (grey document/folder + sparkles, ~80x80px) — generic empty state
  _png_source: "asset 21581-24172-empty.png center shows document line-art illustration với sparkle decorations"

## Screen: Danh sách nhóm vật tư hàng hóa (21235:29061)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgSecondary` (light grey scroll bg behind white cards)
- AppBar: có — leading back chevron, title "Nhóm vật tư hàng hóa", trailing search + filter icons
- TabBar: 3 tabs (Tất cả / Đang hoạt động / Ngừng hoạt động) — segmented filter
- Body layout: `ListView` of `GroupListCard` items
- BottomBar: 1 full-width primary button "Thêm nhóm vật tư"
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: GroupListAppBar]
      │   ├── leading: BackButton
      │   ├── title: Text "Nhóm vật tư hàng hóa"
      │   └── actions: [IconButton(Icons.search), IconButton(Icons.tune)]
      ├── TabBar/StatusFilter [identifier: GroupStatusTabBar, _children_count: 3]
      │   ├── Tab "Tất cả" (default selected, blue underline)
      │   ├── Tab "Đang hoạt động"
      │   └── Tab "Ngừng hoạt động"
      ├── Expanded → ListView.separated [padding=EdgeInsets.all(AppSizes.spacing16), separator=Gap(AppSizes.spacing16)]
      │   └── GroupListCard (per item)
      └── BottomBar/Footer [identifier: GroupListFooter]
          └── AppButton/ThemNhomVatTu (full-width primary)
  ```

### CustomAppBar [identifier: GroupListAppBar]
- Bounds: w=fill h=FIXED(96px) (status bar + nav bar)
- BG: `AppColors.bgBase`
- Layout-mode: flex(Row)
- title: "Nhóm vật tư hàng hóa" 18px weight=700
  _renders_as: "Text + AppTextStyle.textHeadingH3 + AppColors.textPrimary (centered, 1-line, no truncation)"
- Icons:
  - leading: `Icons.arrow_back_ios_new`, 24px, `AppColors.textPrimary`
  - trailing 1: `Icons.search`, 24px, `AppColors.textPrimary`
  - trailing 2: `Icons.tune` (funnel), 24px, `AppColors.textPrimary`
→ flutter: `CustomAppBar(title: "Nhóm vật tư hàng hóa", leading: BackButton(), actions: [IconButton(Icons.search, onPressed: bloc.openSearch), IconButton(Icons.tune, onPressed: bloc.openFilter)])`
_png_verified: "asset 21235-29061.png L top shows '<' back + 'Nhóm vật tư hàng hóa' title + 2 right icons (magnifying glass search + funnel filter)"

### TabBar/StatusFilter [identifier: GroupStatusTabBar]
- Bounds: w=fill h=FIXED(44px) — frame 21235:29221 Tabs-2 wrapper
- Layout-mode: flex(Row, _children_count: 3)
- BG: `AppColors.bgBase`
- Tab items (verbatim from PNG):
  - "Tất cả" (49px wide in figma — default selected, has bottom indicator)
  - "Đang hoạt động" (135px wide)
  - "Ngừng hoạt động" (135px wide)
- Indicator: 2px blue underline `AppColors.borderActive` under selected tab
- Selected text: 14px weight=600 → `AppTextStyle.textSubtitleS5` color=`AppColors.textActivePrimary` (`#0052ff`)
- Unselected text: 14px weight=600 → `AppTextStyle.textSubtitleS5` color=`AppColors.textSecondary`
→ flutter: `TabBar(tabs: [Tab("Tất cả"), Tab("Đang hoạt động"), Tab("Ngừng hoạt động")], indicatorColor: AppColors.borderActive, labelColor: AppColors.textActivePrimary, unselectedLabelColor: AppColors.textSecondary)`
_png_verified: "asset 21235-29061.png L upper shows 3 horizontal tabs 'Tất cả' (active, blue underline + blue text) | 'Đang hoạt động' | 'Ngừng hoạt động' — 3 tabs total, NOT 2, NOT 4"

### GroupListCard (per item) [identifier: GroupListCard]
- Bounds: w=fill h=hug (variable per Mô tả length — observed ~197px when 2-line, ~153px when 1-line)
- Layout-mode: flex(Column)
- BG: `AppColors.bgBase`
- Border: 0 (no outer border); radius=`BorderRadius.circular(8)`
- Shadow: `AppShadows.itemBoxShadow` (subtle card elevation)
- Padding: `EdgeInsets.all(AppSizes.spacing16)`
- Structure:
  - **CardHeader** Row [mainAxis=spaceBetween]
    - Label `#IP-BP-0001` (group code) 16px weight=700 → `AppTextStyle.textHeadingH4` color=`AppColors.textActivePrimary` (`#0052ff`, link-style)
    - Badge (status, 108x26 or 117x26)
  - **ItemNameRow** below header: group name e.g. "Bộ phanh đĩa điện tử" 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
  - **Separator** Divider 1px `AppColors.borderPrimary` full-width inside card
  - **CardBody** Column with 2 InfoRow:
    - InfoField "Thuộc nhóm: $value" with leading floppy-disk icon 16px
    - FieldsList "Mô tả: $value" with leading note icon 16px (multi-line possible, ~2 lines)
→ flutter: `GroupListCard(group: group, onTap: () => navigateToDetail(group.id))`
_png_verified: "asset 21235-29061.png shows 3 cards top-to-bottom: card1='#IP-BP-0001 / Bộ phanh đĩa điện tử / Đang hoạt động badge / Thuộc nhóm: Vật tư hàng hoá / Mô tả: Phụ kiện phanh điện tử...'; card2='#IP-BP-0001 / Dầu nhớt / Đang hoạt động / Thuộc nhóm: Vật tư tiêu hao / Mô tả: Dầu bôi trơn động cơ...'; card3='#IP-BP-0001 / Kính chắn gió / Ngừng hoạt động (orange) / Thuộc nhóm: Vật tư tiêu hao / Mô tả: Kính an toàn chắn gió...' (truncated)"

#### Badge/StatusPill (in GroupListCard header)
- Bounds: w=hug (~108-117px) h=FIXED(26px)
- Variants observed in PNG:
  - "Đang hoạt động" → BG `AppColors.bgBadgeSuccess` text `AppColors.textSuccessPrimary` (green)
  - "Ngừng hoạt động" → BG `AppColors.bgBadgeWarning` text `AppColors.textWarningPrimary` (orange) — observed card 3 visible orange pill
- Border: 0; radius=`BorderRadius.circular(13)` (pill)
- Text: 14px weight=600 → `AppTextStyle.textSubtitleS5`
- Padding: `EdgeInsets.symmetric(horizontal: AppSizes.spacing8, vertical: AppSizes.spacing4)`
→ flutter: `Badge.statusPill(label: group.statusLabel, color: group.statusColor)`
_png_verified: "asset 21235-29061.png card1+card2 show green pill 'Đang hoạt động'; card3 shows orange pill 'Ngừng hoạt động' (verbatim labels)"

#### InfoField/ThuocNhom (in CardBody)
- Layout-mode: flex(Row, gap=AppSizes.spacing8)
- Leading icon: `Icons.save_outlined` (or `vuesax/linear/floppy-disk` SVG) 16px `AppColors.textSecondary`
- Label-value Text: "Thuộc nhóm: $value" — label `AppColors.textSecondary`, value `AppColors.textPrimary`, both 14px weight=400/500 → `textCaptionC5` / `textBodyB5`
- e.g. "Thuộc nhóm: Vật tư hàng hoá" (card 1)
_png_verified: "asset 21235-29061.png card body row 1 shows floppy-disk-like icon + 'Thuộc nhóm: Vật tư hàng hoá'"

#### InfoField/MoTa (in CardBody, can wrap multi-line)
- Layout-mode: flex(Row, crossAxis=start, gap=AppSizes.spacing8)
- Leading icon: `Icons.description_outlined` 16px `AppColors.textSecondary`
- Text: "Mô tả: $value" 14px weight=400 → `textCaptionC5`
- Max lines: 2 with ellipsis on overflow
_png_verified: "asset 21235-29061.png card body row 2 shows note-like icon + 'Mô tả: ' label then 2-line description wrap (card1='Phụ kiện phanh điện tử, đảm bảo an toàn vận hành')"

_negative_coverage:
  - "KHÔNG có IconButton edit/delete trên mỗi card (chỉ tap card → push Detail; metadata layer hidden `Text 21235:29068` không render)"
  - "KHÔNG có Switch toggle trên card"
  - "KHÔNG có Thumbnail/Image trên card (text-only data display)"
  - "KHÔNG có row checkbox / multi-select state visible"

### BottomBar/Footer [identifier: GroupListFooter]
- Bounds: w=fill h=FIXED(~80px = 100px Action bar - SafeArea adjust)
- Layout-mode: flex(Column)
- BG: `AppColors.bgBase`
- Padding: `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing8)` (hoặc `spacing16` tuỳ container — theo canonical R-CTA recipe) + SafeArea bottom
- Border-top: **KHÔNG có** — Figma primary CTA pill full-width KHÔNG có top separator. (CORRECTED 2026-07-01, CR-20260701-06: dòng "Border-top: 1px solid AppColors.borderPrimary" ở transform_version 7 KHÔNG có `_png_verified` citation kèm theo — không xác nhận được qua screenshot, và mâu thuẫn với `rules-mobile SKILL.md §2 R-CTA` anti-pattern #2 [đã root-cause từ chính defect màn này] + mechanical gate `scripts/check-mobile-canonical-primitives.py`. Coi là lỗi transcribe tại fetch — sửa lại khớp canonical recipe: `SafeArea(top:false) + Padding + AppButton.text`, không Container/Border wrap.)

#### AppButton/ThemNhomVatTu [identifier: AddGroupButton]
- Bounds: w=fill h=FIXED(48px) — `AppButtonSize.medium`
- BG: `#0052ff` → `AppColors.buttonBackgroundPrimary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Thêm nhóm vật tư" 16px weight=600 → `AppTextStyle.textSubtitleS4` color=`AppColors.textWhite` (centered)
- State: default; pressed → opacity overlay; tap → push FEAT-CAT-GRP-CREATE screen
→ flutter: `AppButton.text(title: "Thêm nhóm vật tư", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: bloc.openCreate)`
_png_verified: "asset 21235-29061.png L bottom shows wide blue button 'Thêm nhóm vật tư' full-width — TEXT-ONLY (NO leading + glyph, NO Icons.add icon); verbatim Vietnamese 'Thêm nhóm vật tư' centered in pill"
_negative_coverage: "KHÔNG có leading `+` / Icons.add glyph (text-only per PNG — anti-invent Item 14 + Trap 14); KHÔNG có trailing icon; KHÔNG có badge / count chip trên button."

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21235-29061.png
claims_verified:
  - claim: "AppBar has back leading + title 'Nhóm vật tư hàng hóa' + 2 trailing icons (search + filter funnel)"
    status: ✓
    evidence: "PNG top shows '<' + centered 'Nhóm vật tư hàng hóa' + magnifying-glass icon + funnel icon right-aligned"
  - claim: "3-tab segmented bar below AppBar: 'Tất cả' (selected blue underline) / 'Đang hoạt động' / 'Ngừng hoạt động'"
    status: ✓
    evidence: "PNG upper shows 3 horizontal tabs with 'Tất cả' active (blue text + blue underline indicator)"
  - claim: "Card list with each card showing: group code blue (#IP-BP-0001) + status badge (green Đang hoạt động OR orange Ngừng hoạt động) + group name + Separator + 2 info rows (Thuộc nhóm + Mô tả) with leading icons"
    status: ✓
    evidence: "PNG mid section shows 3 cards in matching pattern; card 3 explicitly has orange 'Ngừng hoạt động' badge proving warning variant"
  - claim: "BottomBar single full-width primary blue button 'Thêm nhóm vật tư' (verbatim Vietnamese, TEXT-ONLY — NO leading + icon)"
    status: ✓
    evidence: "PNG bottom shows wide blue button spanning screen width with centered white text 'Thêm nhóm vật tư' — NO + glyph, NO Icons.add prefix"
  - claim: "Cards have NO inline action icons (no edit, no delete on card body) — tap navigates to Detail"
    status: ✓
    evidence: "PNG card bodies show only icons for InfoRow markers (floppy + note 16px) — no large action icons (no eye/trash/edit)"
  - claim: "Status badge has 2 variants: green success + orange warning (NOT red, NOT blue, NOT grey for these 3 sample cards)"
    status: ✓
    evidence: "PNG card1+card2 green badge, card3 orange badge — no other colors"
claims_unverified: []

## Screen: Danh sách nhóm vật tư hàng hoá — Đang hoạt động tab (21252:47609)
- Identical structure to default frame; tab indicator switches to "Đang hoạt động" tab (col 2 active). Cards filtered to active-only — 2 green badge cards visible (PNG fidelity).
- AppBar (title "Nhóm vật tư hàng hóa" + search + filter trailing) + TabBar + BottomBar "Thêm nhóm vật tư" identical to default.
_png_verified: "asset 21252-47609-variant2.png shows AppBar 'Nhóm vật tư hàng hóa' centered + 3-tab row 'Đang hoạt động' (tab 2) active blue underline + 2 cards each with green 'Đang hoạt động' badge + bottom BLUE primary 'Thêm nhóm vật tư' full-width button"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-47609-variant2.png
claims_verified:
  - claim: "Tab indicator on 'Đang hoạt động' (tab 2, blue underline + blue text — distinct from default which had 'Tất cả' active)"
    status: ✓
    evidence: "21252-47609-variant2.png top shows tab 2 'Đang hoạt động' with blue underline indicator below + blue text color"
  - claim: "All visible cards have green 'Đang hoạt động' badge (filter applied)"
    status: ✓
    evidence: "21252-47609-variant2.png 2 cards both render green pill 'Đang hoạt động' top-right; NO grey/orange/red badges"
  - claim: "Card content otherwise identical to default variant — '#IP-BP-0001' code + 'Bộ phanh đĩa điện tử' name + 2 attr rows (💾 'Thuộc nhóm: Vật tư hàng hoá' + 📋 'Mô tả: Phụ kiện phanh điện tử...')"
    status: ✓
    evidence: "21252-47609-variant2.png cards repeat default GroupListCard structure with icon-prefixed attribute rows"
  - claim: "BottomBar primary 'Thêm nhóm vật tư' (verbatim diacritic) remains visible (CRUD entry retained per CR-1782373204)"
    status: ✓
    evidence: "21252-47609-variant2.png bottom shows BLUE full-width button 'Thêm nhóm vật tư' (4-syllable Vietnamese)"
claims_unverified: []
_negative_coverage: "KHÔNG có grey/orange badges (filter chỉ active); KHÔNG có 'Sửa/Xóa' inline trên card (action vào Detail); KHÔNG có FAB icon ở góc (CRUD entry là BottomBar full-width button, NOT FAB)."

## Screen: Danh sách nhóm vật tư hàng hoá — Ngừng hoạt động tab (21252:48117)
- Identical structure; tab "Ngừng hoạt động" selected (rightmost, tab 3 — CORRECTLY moved, no Figma anomaly here unlike PROD-LIST inactive). Filter shows only inactive cards (1 visible orange badge card "Kính chắn gió").
- AppBar + TabBar + BottomBar identical to default.
_png_verified: "asset 21252-48117-variant3.png shows AppBar 'Nhóm vật tư hàng hóa' + 3-tab row với 'Ngừng hoạt động' (tab 3, rightmost) active blue underline + 1 card '#IP-BP-0001 Kính chắn gió' với ORANGE 'Ngừng hoạt động' badge + 💾 'Thuộc nhóm: Vật tư tiêu hao' + 📋 'Mô tả: Kính an toàn chắn gió phía trước xe' + bottom BLUE 'Thêm nhóm vật tư' button"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-48117-variant3.png
claims_verified:
  - claim: "Tab indicator on 'Ngừng hoạt động' (tab 3, rightmost) with blue underline + blue text — Figma source CORRECT (no anomaly like PROD-LIST inactive frame)"
    status: ✓
    evidence: "21252-48117-variant3.png top shows tab 3 'Ngừng hoạt động' with blue underline ACTIVE — distinct from PROD-LIST inactive frame `21528:25516` which had stale Đang hoạt động indicator"
  - claim: "Card visible shows ORANGE 'Ngừng hoạt động' badge (NOT red, NOT grey, NOT green) — GRP-LIST inactive uses warning orange (per AppColors.bgBadgeWarning + textWarningPrimary)"
    status: ✓
    evidence: "21252-48117-variant3.png single card has orange pill badge top-right — distinct from PROD-LIST inactive which uses GREY (M-trap-3 enforces this divergence)"
  - claim: "Cards visible count = 1 (filter narrows from default 3-card variant; less inactive data than active)"
    status: ✓
    evidence: "21252-48117-variant3.png body shows only 1 card with grey empty space below (vs default frame with 3+ cards)"
claims_unverified: []
_negative_coverage: "KHÔNG có green badges (filter excludes Đang); KHÔNG có 'Khôi phục/Activate' action (mobile cannot activate from list — phải qua Detail); KHÔNG có icon prefix khác ngoài 💾 + 📋 (no calendar/user/clock prefix); KHÔNG có grey badge (orange là canonical cho GRP, grey chỉ PROD)."

## Screen: Tìm kiếm nhóm vật tư hàng hóa - Default (21252:48381)
- **Full-page search route** (NOT bottom-sheet): tap AppBar search icon → push search page; parent TabBar persists at top (per PNG observation).
- AppBar replaced by search input bar with magnifier prefix + back button to cancel.
- Empty input shows keyword prompt below — bulleted list of searchable fields.
- ⚠ **Figma copy bug**: header text says "Tìm kiếm **phiếu dịch vụ** theo từ khoá" instead of expected "Tìm kiếm **nhóm vật tư** theo từ khoá" — designer used placeholder text shared from another FEAT; bullets correctly say "Mã nhóm" + "Tên nhóm". **DEV implement**: header should read "Tìm kiếm nhóm vật tư theo từ khoá" (context-correct); raise BA confirm if must mirror Figma verbatim — `_png_verified` captures observed Figma text but DEV note flags semantic mismatch.
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: GroupSearchAppBar] (BG: AppColors.bgPrimary)
      │   ├── leading: BackButton (cancel search → pop to list)
      │   └── title: AppTextField/SearchInput
      │       ├── prefix: Icons.search (20px, AppColors.iconSecondary)
      │       ├── placeholder: "Tìm kiếm"
      │       └── (state: empty — no clear-× shown)
      ├── TabBar/StatusFilter [identifier: GroupStatusTabBar, _children_count: 3] (persists from parent list route; BG: AppColors.bgPrimary)
      │   ├── Tab "Tất cả" (active blue underline)
      │   ├── Tab "Đang hoạt động"
      │   └── Tab "Ngừng hoạt động"
      └── Expanded → Padding(EdgeInsets.all(AppSizes.spacing16))
          └── Column [crossAxis=start, gap=Gap(AppSizes.spacing8)]
              ├── Text "Tìm kiếm nhóm vật tư theo từ khoá" → textSubtitleS5 textSecondary
              │   _png_verified: "Figma frame 21252:48381 hiện hiển thị 'Tìm kiếm phiếu dịch vụ theo từ khoá' — Figma copy bug; DEV implement context-correct version"
              └── BulletList [_children_count: 2]
                  ├── "Mã nhóm"
                  └── "Tên nhóm"
  ```
_png_verified: "asset 21252-48381-search-default.png shows AppBar `< [🔍 Tìm kiếm placeholder]` (back chevron + grey-bg pill search input + magnifier prefix + 'Tìm kiếm' placeholder) + 3-tab row 'Tất cả' active + body header BOLD 'Tìm kiếm phiếu dịch vụ theo từ khoá' (Figma copy bug — should be 'nhóm vật tư') + 2 grey bullets (Mã nhóm, Tên nhóm) + lower body empty"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-48381-search-default.png
claims_verified:
  - claim: "AppBar replaced by active search input bar with magnifier prefix + back-button leading (cancel)"
    status: ✓
    evidence: "21252-48381-search-default.png top shows '<' + grey-bg rounded search input with 🔍 magnifier prefix + 'Tìm kiếm' placeholder (NO 'Nhóm vật tư hàng hóa' static title)"
  - claim: "TabBar/StatusFilter persists below search input (3-tab row, 'Tất cả' active blue underline)"
    status: ✓
    evidence: "21252-48381-search-default.png mid shows 3-tab row Tất cả (active) | Đang hoạt động | Ngừng hoạt động below the search input — confirms full-page route NOT bottom-sheet"
  - claim: "Body shows search keyword prompt header followed by 2-bullet list (Mã nhóm, Tên nhóm)"
    status: ✓
    evidence: "21252-48381-search-default.png body L16 shows bold heading text followed by 2-bullet vertical list grey text"
  - claim: "Header text Figma observed = 'Tìm kiếm phiếu dịch vụ theo từ khoá' (NOT 'nhóm vật tư') — copy bug to flag"
    status: ✓
    evidence: "21252-48381-search-default.png body header line reads 'Tìm kiếm phiếu dịch vụ theo từ khoá' — semantically mismatched with FEAT context (group not service); bullets DO match (Mã nhóm + Tên nhóm); confirms designer placeholder leak"
  - claim: "Lower body empty — pure keyword-guide state, no cards yet"
    status: ✓
    evidence: "21252-48381-search-default.png lower 2/3 of viewport is empty grey bg"
claims_unverified: []
_negative_coverage: "KHÔNG có GroupListCard render (pure keyword guide state); KHÔNG có FAB / BottomBar 'Thêm nhóm vật tư' (full-page search hides parent CRUD action); KHÔNG có clear-× icon trong SearchInput (input empty); KHÔNG có result count header."

## Screen: Tìm kiếm nhóm vật tư hàng hóa - No Results (21252:48401)
- Search empty-results state của full-page search route — user typed query "IP-BP-0001", 0 hits. TabBar persists.
- Body: magnifying-glass illustration + 2-line label "Không có kết quả phù hợp" bold + "Vui lòng thử lại" caption.
- Widget Tree inherits search-default (21252:48381) skeleton — same Scaffold→Column→[CustomAppBar(SearchInput filled with query) → TabBar/StatusFilter(_children_count: 3) → Expanded(body)]; body replaces BulletList với centered Column [illustration + 2-line message].
_png_verified: "asset 21252-48401-search-no-results.png shows AppBar (back chevron + grey search field filled with 'IP-BP-0001' query — NO clear-× visible per Figma observation) + 3-tab (Tất cả active) + centered magnifying-glass line-art icon + bold 'Không có kết quả phù hợp' + thin grey 'Vui lòng thử lại' caption below"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-48401-search-no-results.png
claims_verified:
  - claim: "Empty illustration is magnifying-glass line-art icon (search-specific, NOT generic document like Tất cả empty state)"
    status: ✓
    evidence: "21252-48401-search-no-results.png center shows clear magnifier line-art icon (circle + handle stroke)"
  - claim: "Two-line message: 'Không có kết quả phù hợp' (bold heading) + 'Vui lòng thử lại' (caption below)"
    status: ✓
    evidence: "21252-48401-search-no-results.png mid shows bold dark line 'Không có kết quả phù hợp' then thinner grey line 'Vui lòng thử lại' centered"
  - claim: "Search bar retains active query 'IP-BP-0001' (user-typed text persisted) — distinguishes from initial Default state"
    status: ✓
    evidence: "21252-48401-search-no-results.png top search input shows 'IP-BP-0001' filled text"
  - claim: "TabBar/StatusFilter persists below search input (full-page route inherits parent's TabBar)"
    status: ✓
    evidence: "21252-48401-search-no-results.png shows 3-tab row Tất cả/Đang/Ngừng with Tất cả active between search bar and empty illustration"
claims_unverified: []
_negative_coverage: "KHÔNG có GroupListCard render; KHÔNG có FAB / BottomBar 'Thêm nhóm vật tư'; KHÔNG có result-count header; KHÔNG có clear-× icon visible mặc dù input has text (Figma rendering choice; DEV implement: clear-× visible whenever input.text != empty)."

## Screen: Tìm kiếm nhóm vật tư hàng hóa - Results (21252:48958)
- Search with hits — header counter "2 kết quả tìm kiếm cho "IP-BP-0001"" (curly quotes) + 2 matching cards.
- Widget Tree inherits search-default skeleton — body becomes [Text result-count → ListView/GroupListCards].
_png_verified: "asset 21252-48958-search-results.png shows AppBar search input filled với 'IP-BP-0001' + 3-tab (Tất cả active) + result-count line '2 kết quả tìm kiếm cho “IP-BP-0001”' (curly double quotes) + 2 GroupListCard items below, BOTH with ORANGE 'Ngừng hoạt động' badges (search ignores Trạng thái tab filter for matching) + same '#IP-BP-0001 Kính chắn gió' code/name with icon-prefixed attrs"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-48958-search-results.png
claims_verified:
  - claim: "Search input shows active query 'IP-BP-0001' (not truncated, fits inline)"
    status: ✓
    evidence: "21252-48958-search-results.png top search input shows 'IP-BP-0001' verbatim with magnifier prefix (no clear-× visible in this Figma frame variant)"
  - claim: "Result count header above cards: '2 kết quả tìm kiếm cho “IP-BP-0001”' (curly typographic double quotes — NOT straight ASCII)"
    status: ✓
    evidence: "21252-48958-search-results.png below tab row shows '2 kết quả tìm kiếm cho “IP-BP-0001”' single-line text; quotes are curly (“ ”)"
  - claim: "Result cards (×2) use SAME GroupListCard layout — code '#IP-BP-0001' + orange 'Ngừng hoạt động' badge + name 'Kính chắn gió' + icon-prefixed attrs (💾 'Thuộc nhóm: Vật tư tiêu hao' + 📋 'Mô tả: Kính an toàn chắn gió phía trước xe')"
    status: ✓
    evidence: "21252-48958-search-results.png shows 2 cards matching default GroupListCard structure with orange badges; cards are exact duplicates (designer placeholder data)"
  - claim: "Search results include INACTIVE items (orange badge present) — search ignores TabBar status filter, matches all"
    status: ✓
    evidence: "21252-48958-search-results.png shows orange Ngừng hoạt động badges even though 'Tất cả' tab is active — design intent: search returns all matches regardless of tab"
claims_unverified: []
_negative_coverage: "KHÔNG có FAB; KHÔNG có empty-state illustration; KHÔNG có 'Hủy' text button trailing AppBar (back chevron là cancel); KHÔNG có per-card action icons (Sửa/Xóa inline) — tap card mở Detail."

## Screen: Bộ lọc nhóm vật tư hàng hóa - Default (21252:49574)
- **Full-page filter route** (NOT bottom-sheet) — tap AppBar filter icon → push filter page. No TabBar (filter is standalone full-page, unlike search which inherits TabBar).
- Single dropdown blank: "Thuộc nhóm" label + "Chọn nhóm hàng" placeholder.
- AppBar: back chevron + "Bộ lọc" centered (NOT "Bộ lọc nhóm vật tư hàng hóa").
- Footer: [Thiết lập lại secondary grey | Áp dụng primary blue].
_png_verified: "asset 21252-49574-filter-default.png shows AppBar '< Bộ lọc' centered title + SINGLE dropdown row: 'Thuộc nhóm' label above + grey-bordered field with placeholder 'Chọn nhóm hàng' + chevron-down trailing + bottom action bar [Thiết lập lại grey-bg button (~30% width) | Áp dụng blue primary button (~60% width)]"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-49574-filter-default.png
claims_verified:
  - claim: "AppBar centered title 'Bộ lọc' (verbatim — NOT 'Bộ lọc nhóm vật tư hàng hóa') with back chevron leading; no trailing action"
    status: ✓
    evidence: "21252-49574-filter-default.png top shows '<' + centered bold 'Bộ lọc' (2-syllable Vietnamese) — same pattern as PROD-LIST filter title"
  - claim: "ONE dropdown only — 'Thuộc nhóm' label + placeholder 'Chọn nhóm hàng' với chevron-down trailing (NO second 'Tính chất' dropdown like PROD-LIST — GRP-LIST filter is simpler)"
    status: ✓
    evidence: "21252-49574-filter-default.png body L24 shows bold 'Thuộc nhóm' label + grey-outlined input row with placeholder 'Chọn nhóm hàng' + right chevron; rest of body until footer is empty (no second field)"
  - claim: "Footer 2-button row: 'Thiết lập lại' secondary grey (left, narrower ~30%) + 'Áp dụng' primary blue (right, wider ~60%) — same proportional split as PROD-LIST filter"
    status: ✓
    evidence: "21252-49574-filter-default.png bottom shows side-by-side buttons; left grey-bg 'Thiết lập lại' + right blue-bg 'Áp dụng' with white text"
  - claim: "No TabBar in filter page (full-page route, NOT inherit list TabBar) — distinct from search route which DOES persist TabBar"
    status: ✓
    evidence: "21252-49574-filter-default.png between AppBar and 'Thuộc nhóm' field there is NO 3-tab row — confirms filter is standalone full-page"
claims_unverified: []
_negative_coverage: "KHÔNG có TabBar/StatusFilter (filter là full-page route riêng, NOT inherit từ list); KHÔNG có 'Tính chất' dropdown (chỉ 1 dropdown 'Thuộc nhóm' — đơn giản hơn PROD-LIST filter có 2 dropdown); KHÔNG có 3rd 'Trạng thái' dropdown; KHÔNG có search/filter trailing icons trong AppBar; KHÔNG có GroupListCard."

## Screen: Bộ lọc nhóm vật tư hàng hóa - Filled (21252:49582)
- Filter sheet with selection: "Thuộc nhóm: Hệ thống phanh" dropdown selected.
- AppBar + Footer identical to Default variant.

### Widget Tree (Filter Filled)
```
Scaffold
└── Column [crossAxis=stretch]
    ├── CustomAppBar [identifier: GroupFilterAppBar]
    │   ├── leading: BackButton
    │   └── title: Text "Bộ lọc"
    ├── Expanded → SingleChildScrollView
    │   └── Column [padding=EdgeInsets.all(AppSizes.spacing16), gap=Gap(AppSizes.spacing16)]
    │       └── AppDropdown/ThuocNhom [identifier: ParentGroupFilterField]
    │           ├── Label "Thuộc nhóm"
    │           └── Selected "Hệ thống phanh" + chevron-down
    └── BottomBar/Footer [identifier: GroupFilterFooter]
        └── Row [_children_count: 2]
            ├── Expanded → AppButton/ThietLapLai (secondary grey)
            └── Expanded → AppButton/ApDung (primary blue)
```

### CustomAppBar [identifier: GroupFilterAppBar]
- Bounds: w=fill h=FIXED(96px)
- BG: `AppColors.bgBase`
- title: "Bộ lọc" 18px weight=700
  _renders_as: "Text + AppTextStyle.textHeadingH3 + AppColors.textPrimary (centered, 1-line, no trailing action)"
- Icons:
  - leading: `Icons.arrow_back_ios_new`, 24px, `AppColors.textPrimary`
→ flutter: `CustomAppBar(title: "Bộ lọc", leading: BackButton())`
_png_verified: "asset 21252-49582-filter-filled.png L top shows '<' chevron + centered 'Bộ lọc' title (no trailing action)"

### AppDropdown/ThuocNhom [identifier: ParentGroupFilterField]
- Bounds: w=fill h=FIXED(72px) (label 20 + gap 8 + cell 44)
- Label: "Thuộc nhóm" 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary` (NO asterisk — optional filter)
- Selected value: "Hệ thống phanh" 14px weight=500 → `AppTextStyle.textBodyB5` color=`AppColors.textPrimary`
- BG: `AppColors.bgBase`
- Border: 1px solid `#e8e8ea` → `AppColors.borderPrimary` radius=`BorderRadius.circular(8)`
- Padding: handled by `AppDropdown` widget factory (internal cell padding)
- Icons:
  - trailing: `Icons.keyboard_arrow_down`, 24px, `AppColors.textTertiary`
- State: default; opened → bottom sheet selector with options
→ flutter: `AppDropdown(label: "Thuộc nhóm", value: bloc.parentGroupFilter, items: parentGroups, onChanged: bloc.setParentGroupFilter)`
_png_verified: "asset 21252-49582-filter-filled.png shows 'Thuộc nhóm' label + dropdown cell with 'Hệ thống phanh' value + chevron-down right end"

### BottomBar/Footer [identifier: GroupFilterFooter]
- Bounds: w=fill h=FIXED(~80px)
- Layout-mode: flex(Row, mainAxis=spaceBetween)
- BG: `AppColors.bgBase`; rounded top corners (`BorderRadius.only(topLeft: Radius.circular(8), topRight: Radius.circular(8))`) + subtle elevation shadow — **KHÔNG có Border-top separator** (CORRECTED 2026-07-02, BUG-W03-035: dòng "Border-top: 1px solid AppColors.borderPrimary" trước đó KHÔNG có `_png_verified` citation, cùng lỗi transcription như CR-20260701-06 đã sửa cho GroupListFooter — lần đó bỏ sót phần Filter footer. Đối chiếu trực tiếp PNG `21252-49582-filter-filled.png` xác nhận góc bo tròn phía trên, giống style "elevated card" của `lib/ui/booking/widgets/bottom_actions.dart`, KHÔNG phải đường kẻ thẳng)
- Padding: `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing16)` + SafeArea
- Children _children_count: 2 (Thiết lập lại + Áp dụng)

#### AppButton/ThietLapLai [identifier: ResetFilterButton]
- Bounds: w=Expanded h=FIXED(48px) — `AppButtonSize.medium`
- BG: `#f3f3f4` → `AppColors.buttonBackgroundSecondary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Thiết lập lại" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`AppColors.textPrimary`
- State: default; pressed → opacity overlay; tap → bloc.resetFilters
→ flutter: `AppButton.text(title: "Thiết lập lại", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: bloc.resetFilters)`
_png_verified: "asset 21252-49582-filter-filled.png L bottom-left shows light-grey button 'Thiết lập lại' (verbatim 5-syllable diacritic preserved)"

#### AppButton/ApDung [identifier: ApplyFilterButton]
- Bounds: w=Expanded h=FIXED(48px)
- BG: `#0052ff` → `AppColors.buttonBackgroundPrimary`
- Border: 0; radius=`BorderRadius.circular(4)`
- Text: "Áp dụng" 16px weight=600 → theme: `AppTextStyle.textSubtitleS4` color=`AppColors.textWhite`
- State: default; pressed → opacity; tap → bloc.applyFilters → pop + apply
→ flutter: `AppButton.text(title: "Áp dụng", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: bloc.applyFilters)`
_png_verified: "asset 21252-49582-filter-filled.png L bottom-right shows BLUE button 'Áp dụng' (diacritic 'Á' + 'ụ' preserved)"

_negative_coverage:
  - "KHÔNG có 'Tính chất' dropdown (khác PROD-LIST filter sheet có 2 dropdown — GRP-LIST chỉ có 'Thuộc nhóm')"
  - "KHÔNG có sort options / date range / additional filter fields trên hub"
  - "KHÔNG có dropdown menu inline (filter Filled state KHÔNG mở menu — chỉ display selected value)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21252-49582-filter-filled.png
claims_verified:
  - claim: "AppBar centered title 'Bộ lọc' (verbatim) with back chevron leading; no trailing action"
    status: ✓
    evidence: "PNG top shows '<' + 'Bộ lọc' centered title only"
  - claim: "ONE dropdown 'Thuộc nhóm' with selected 'Hệ thống phanh' + trailing chevron-down (NO second filter field)"
    status: ✓
    evidence: "PNG mid-upper shows single dropdown row with label above + cell below containing 'Hệ thống phanh' text + chevron-down icon right; rest of body empty (no second dropdown)"
  - claim: "Footer 2-button [Thiết lập lại grey | Áp dụng primary-blue] split-row (verbatim Vietnamese labels with diacritics preserved)"
    status: ✓
    evidence: "PNG bottom Row shows 2 buttons; left grey 'Thiết lập lại' (5-syllable), right blue 'Áp dụng' (Á+ụ diacritics)"
  - claim: "Filter Filled state does NOT show open dropdown menu (closed display only) — differs from PROD-LIST filter Filled which has menu open"
    status: ✓
    evidence: "PNG dropdown cell displays selected value 'Hệ thống phanh' as static text; no overlay menu visible"
claims_unverified: []

## Screen: Danh sách nhóm vật tư hàng hoá — empty data (21581:24172)
- Empty state: same AppBar + 3-tab header, body has empty illustration + label, BottomBar still present (CRUD entry-point retained).
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar (same as default — title 'Nhóm vật tư hàng hóa', search + filter trailing)
      ├── TabBar (same 3 tabs)
      ├── Expanded → Center
      │   └── Column [mainAxis=center, gap=Gap(AppSizes.spacing16)]
      │       ├── Image/EmptyIllustration (grey document line-art ~80x80)
      │       └── Text "Không có dữ liệu" → textSubtitleS4 color=textPrimary
      └── BottomBar/Footer (same — full-width primary 'Thêm nhóm vật tư')
  ```
_png_verified: "asset 21581-24172-empty.png shows AppBar + 3-tab + center empty illustration (line-art document/folder + sparkles) + bold 'Không có dữ liệu' label centered + BottomBar 'Thêm nhóm vật tư' still visible"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-grp-list/21581-24172-empty.png
claims_verified:
  - claim: "Empty state retains full chrome (AppBar + 3-tab + BottomBar) — only body content empty"
    status: ✓
    evidence: "PNG top shows AppBar 'Nhóm vật tư hàng hóa' + 3-tab row; bottom shows BottomBar 'Thêm nhóm vật tư'; middle is empty placeholder"
  - claim: "Center body shows grey document illustration + bold 'Không có dữ liệu' label (NOT 'Không có kết quả phù hợp' — distinct from search-no-results)"
    status: ✓
    evidence: "PNG center area shows simple line-art document icon with sparkle decorations + bold 'Không có dữ liệu' below"
  - claim: "BottomBar primary 'Thêm nhóm vật tư' REMAINS visible (CRUD entry-point per mobile full-CRUD CR-1782373204) — user can add new group from empty state"
    status: ✓
    evidence: "PNG bottom shows BLUE button 'Thêm nhóm vật tư' full-width — NOT hidden in empty state"
claims_unverified: []
_negative_coverage: "KHÔNG có GroupListCard (empty state); KHÔNG có 'Tạo mới' button ngoài BottomBar (BottomBar 'Thêm nhóm vật tư' là CRUD entry duy nhất); KHÔNG có search-icon prefix illustration; KHÔNG có hint 'Bấm + để tạo nhóm đầu tiên' text (chỉ illustration + label 'Không có dữ liệu')."

## Screenshots
> assets/wave03-cat-grp-list/
- `_section-overview.png` — Overview của 9 frame variants (2048×931, downscaled from 4901×2183) — section enumeration only, NOT per-§VV evidence
- `21235-29061.png` — Frame 1: Danh sách Tất cả (default, 3 cards visible, 375×812)
- `21252-47609-variant2.png` — Frame 2: Đang hoạt động tab (2 cards green badge, 375×812)
- `21252-48117-variant3.png` — Frame 3: Ngừng hoạt động tab (1 card ORANGE badge — distinct from PROD-LIST grey, 375×812)
- `21252-48381-search-default.png` — Frame 4: Search default (keyword prompt + 2 bullets; ⚠ Figma copy bug — header text 'phiếu dịch vụ', 375×812)
- `21252-48401-search-no-results.png` — Frame 5: Search no results (magnifier icon + 2-line message, query 'IP-BP-0001', 375×812)
- `21252-48958-search-results.png` — Frame 6: Search results (2 ORANGE cards + count header với curly quotes, 375×812)
- `21252-49574-filter-default.png` — Frame 7: Filter default (1 dropdown 'Thuộc nhóm' empty + footer 2-button — đơn giản hơn PROD-LIST filter 2-dropdown, 375×812)
- `21252-49582-filter-filled.png` — Frame 8: Bộ lọc Filled (1 dropdown 'Hệ thống phanh' selected, 375×812)
- `21581-24172-empty.png` — Frame 9: Empty data (Không có dữ liệu, BottomBar retained, 375×812)

> **Per-frame fidelity**: 9/9 top-level frames đều có per-frame PNG (NATIVE 375×812 res). §VV blocks cite per-frame asset (NOT `_section-overview.png`) per skill v7 §2c.5 rule (chống G7 downscale trap — wave03-cat-prod-* incident root cause đã đóng).

## Notes
- 9 frame variants cover full FEAT-CAT-GRP-LIST UX surface area (list + search + filter + empty data).
- Status badge variants: success (Đang hoạt động — green) + warning (Ngừng hoạt động — ORANGE per AppColors.bgBadgeWarning + textWarningPrimary) — different from PROD-LIST inactive which uses GREY (M-trap-3 enforcement).
- Filter sheet: GRP-LIST has SINGLE dropdown ("Thuộc nhóm" only) — simpler than PROD-LIST which has TWO ("Tính chất" + "Nhóm hàng"). Reflect business: nhóm = thuộc parent group only; product = property + group.
- Search bottom-sheet 3 states: Default (keyword prompt + 2-bullet field guide), No Results (magnifying glass illustration), Results (count header + GroupListCard list).
- Empty data state KEEPS BottomBar — user can add first group from empty state (CRUD entry retained).
- "Mô tả" multi-line wrap → card height variable; ListView builder phải handle dynamic item height.
- Status badge variants: success (Đang hoạt động) + warning (Ngừng hoạt động) — NOT error/danger red (M-24 anti-invent confirmed by orange-not-red in PNG card 3).
- Tap card → push FEAT-CAT-GRP-DETAIL screen with group.id.
- "Thêm nhóm vật tư" tap → push FEAT-CAT-GRP-CREATE screen.
- **CORRECTION 2026-07-01 (CR-20260701-06)**: §BottomBar/Footer "Border-top: 1px solid AppColors.borderPrimary" line (transform_version 7) removed — unverified claim (no `_png_verified` citation), contradicted established `rules-mobile SKILL.md §2 R-CTA` anti-pattern + `scripts/check-mobile-canonical-primitives.py` mechanical gate (both born from this exact screen's prior footer defect). GroupListFooter canonical = no border-top separator.
