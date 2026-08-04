---
feat: FEAT-CAT-PROD-LIST
feat_file: Product/features/FEAT-CAT-PROD-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21254-52585&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21254:52585"
fetched_at: 2026-06-29T15:00:00+07:00
transform_version: 7
status: ACTIVE
transform_mode: fresh-fetch
screenshots: true
screens_expected: 9
coverage_gaps: []
---

# FEAT-CAT-PROD-LIST — Mobile spec (v7)

> Section Figma `FEAT-CAT-PROD-LIST – Danh sách mã sản phẩm nội bộ` (id `21254:52585`, 4783×2337) chứa **9 top-level frame** = 9 state variant của màn danh sách Mã sản phẩm nội bộ (view-only mobile per CR-1782373204).
>
> ⚠️ **View-only mobile**: KHÔNG có FAB/BottomBar "Thêm sản phẩm" (NO Create action). Card tap → push FEAT-CAT-PROD-DETAIL screen. Web boundary mới CRUD đầy đủ.

## Icon Catalog (shared)
| Figma layer | source | Notes |
|---|---|---|
| chevron-back (AppBar leading) | `Icons.arrow_back_ios_new` (24px) | back nav |
| search (AppBar trailing-1) | `Icons.search` (24px) | open search bottom-sheet |
| filter (AppBar trailing-2) | `Icons.tune` (24px) | open filter bottom-sheet |
| chevron-down (Dropdown) | `Icons.keyboard_arrow_down` (24px) | dropdown indicator in filter sheet |
| empty-doc | `assets/illustrations/empty_data.svg` or `Icons.description_outlined` (large grey) | empty state illustration |
| search-magnifier | `Icons.search_off` or asset | "No Results" empty state |
| clear-x (Search input trailing, when filled) | `Icons.cancel` (filled circle, 20px, `AppColors.iconTertiary`) | clears query when SearchInput has text (per 21526:40447 search-results) |
| search-input-prefix (Search input leading) | `Icons.search` (20px, `AppColors.iconSecondary`) | prefix in search input field (separate from AppBar trailing search icon) |

## Screen: Danh sách sản phẩm - Tất cả (default) (21526:44347)
- Device frame: 375x812px (phone)
- Scaffold: `CustomScaffold`, bg=`AppColors.bgSecondary`
- AppBar: leading back chevron, title "Sản phẩm", trailing [search + filter] icons
- TabBar: 3 tabs (Tất cả / Đang hoạt động / Ngừng hoạt động) — selected "Tất cả"
- Body: `ListView` ProductListCard items
- KHÔNG BottomBar (view-only mobile)
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: ProductListAppBar]
      │   ├── leading: BackButton
      │   ├── title: Text "Sản phẩm"
      │   └── actions: [IconButton(Icons.search), IconButton(Icons.tune)]
      ├── TabBar/StatusFilter [identifier: ProductStatusTabBar, _children_count: 3]
      │   ├── Tab "Tất cả"
      │   ├── Tab "Đang hoạt động"
      │   └── Tab "Ngừng hoạt động"
      └── Expanded → ListView.separated [padding=EdgeInsets.all(AppSizes.spacing16), separator=Gap(AppSizes.spacing16)]
          └── ProductListCard (per item)
  ```

### CustomAppBar [identifier: ProductListAppBar]
- Bounds: w=fill h=FIXED(96px); BG `AppColors.bgBase`
- Title: "Sản phẩm" → `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
- Icons leading + trailing as per Catalog
→ flutter: `CustomAppBar(title: "Sản phẩm", leading: BackButton(), actions: [IconButton(Icons.search), IconButton(Icons.tune)])`
_png_verified: "asset 21526-44347-empty.png shows '<' + 'Sản phẩm' centered + search-icon + filter-funnel right"

### TabBar/StatusFilter [identifier: ProductStatusTabBar]
- 3 tabs verbatim "Tất cả" / "Đang hoạt động" / "Ngừng hoạt động"; selected has 2px blue underline indicator + blue text
- Selected: `AppTextStyle.textSubtitleS5` color=`AppColors.textActivePrimary`; Unselected: same style color=`AppColors.textSecondary`
→ flutter: `TabBar(tabs: [...3 Tabs], indicatorColor: AppColors.borderActive)`
_png_verified: "asset 21526-44347-empty.png shows 3-tab row 'Tất cả' (active blue) | 'Đang hoạt động' | 'Ngừng hoạt động'"

### ProductListCard (per item)
- Bounds: w=fill h=hug (~190px when 2-row attrs)
- BG: `AppColors.bgBase`; Border: 0; radius=8; Shadow `AppShadows.itemBoxShadow`
- Padding: `EdgeInsets.all(AppSizes.spacing16)`
- Structure (Column):
  - Row [mainAxis=spaceBetween, _children_count: 2]: Text "#IP-BP-0001" blue link-style + Badge status
  - Text product name "Lọc dầu động cơ Toyota" → `textHeadingH4` color=`textPrimary`
  - Divider 1px `AppColors.borderPrimary`
  - Row [_children_count: 2 (equal split)]: AttributesField "Tính chất / Vật tư hàng hoá" | "Nhóm / Phụ tùng bảo dưỡng"
  - Row [_children_count: 2]: AttributesField "ĐVT / Cái" | "Thương hiệu / Toyota"
→ flutter: `ProductListCard(product: product, onTap: () => navigateToDetail(product.id))`
_png_verified: "asset 21526-44347-empty.png L mid shows 3 cards: each with blue '#IP-BP-0001' code + status badge + 'Lọc dầu động cơ Toyota' name + divider + 2-col 2-row attributes grid (Tính chất/Vật tư hàng hoá, Nhóm/Phụ tùng bảo dưỡng, ĐVT/Cái, Thương hiệu/Toyota). NO icon prefix on attr rows (khác GRP-LIST có floppy+note icons)"

#### Badge/StatusPill (in ProductListCard)
- Variants observed:
  - "Đang hoạt động" → BG `AppColors.bgBadgeSuccess` + text `AppColors.textSuccessPrimary` (GREEN)
  - "Ngừng hoạt động" → BG `AppColors.bgBadgeOpen` (NeutralColor.s50 light grey) + text `AppColors.textSecondary` (GREY — NOT orange)
- Padding/radius/typography same as Badge in GRP-DETAIL / GRP-LIST
→ flutter: `Badge.statusPill(label: product.statusLabel, color: product.statusColor)`
_png_verified: "asset 21526-44347-empty.png card1+card3 show green 'Đang hoạt động'; card2 shows GREY 'Ngừng hoạt động' (NOT orange like grp-list)"

_negative_coverage:
  - "KHÔNG có FAB / BottomBar primary 'Thêm sản phẩm' (view-only mobile per CR-1782373204 — khác GRP-LIST)"
  - "KHÔNG có IconButton edit/delete trên card"
  - "KHÔNG có Thumbnail / Image trên card"
  - "KHÔNG có icon prefix trên attribute rows (khác GRP-LIST)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21526-44347-empty.png
claims_verified:
  - claim: "AppBar shows '< Sản phẩm' centered + trailing [search-icon, filter-funnel-icon] (2 actions)"
    status: ✓
    evidence: "PNG top: back chevron + centered title + 2 right icons"
  - claim: "3 ProductListCard items visible, each with blue code + status badge + product name + 2-col 2-row attributes (no leading icons on attrs)"
    status: ✓
    evidence: "PNG mid: 3 cards in matching layout; card 2 shows GREY 'Ngừng hoạt động' badge (NOT orange)"
  - claim: "NO BottomBar / FAB present — page ends at last card (view-only)"
    status: ✓
    evidence: "PNG bottom area shows only safe-area indicator; no button bar"
  - claim: "Card attribute pairs in 2x2 grid: row1 = Tính chất + Nhóm; row2 = ĐVT + Thương hiệu"
    status: ✓
    evidence: "PNG cards show: 'Tính chất / Vật tư hàng hoá' | 'Nhóm / Phụ tùng bảo dưỡng' (row 1); 'ĐVT / Cái' | 'Thương hiệu / Toyota' (row 2)"
claims_unverified: []

## Screen: Danh sách sản phẩm - Tất cả (empty data) (21579:23956)
- Empty state khi không có sản phẩm
- AppBar + TabBar identical to default variant
- Body: Center widget with empty illustration + label "Không có dữ liệu"
- Widget Tree:
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar (same as default)
      ├── TabBar (same)
      └── Expanded → Center
          └── Column [mainAxis=center, gap=Gap(AppSizes.spacing16)]
              ├── Image/EmptyIllustration (asset SVG ~80x80)
              └── Text "Không có dữ liệu" → textSubtitleS4 color=textPrimary
  ```
_png_verified: "asset 21579-23956-default.png shows AppBar + 3-tab + center area with grey document/folder illustration + bold 'Không có dữ liệu' text — no cards, no FAB"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21579-23956-default.png
claims_verified:
  - claim: "Empty state shows centered illustration (grey document icon) + 'Không có dữ liệu' label"
    status: ✓
    evidence: "PNG center area shows simple line-art folder/document illustration with bold label below"
  - claim: "AppBar + 3-tab row remain visible (sticky header)"
    status: ✓
    evidence: "PNG top section identical to default-list AppBar + tabs"
  - claim: "NO action button visible — view-only state, user must adjust filter to get data"
    status: ✓
    evidence: "PNG renders without floating action button or footer button"
claims_unverified: []
_negative_coverage: "KHÔNG có ProductListCard (empty state); KHÔNG có FAB (view-only CR-1782373204); KHÔNG có 'Tạo mới' button bất kỳ ở empty state (web có nút Tạo mới ở empty — mobile KHÔNG); KHÔNG có search-icon prefix trong illustration."

## Screen: Danh sách sản phẩm - Đang hoạt động (21528:25362)
- Identical structure to default frame, with "Đang hoạt động" tab selected (only Đang hoạt động cards visible).
- All cards show green status badge "Đang hoạt động".
_png_verified: "asset 21528-25362-list-active.png shows AppBar 'Sản phẩm' + 3-tab row với 'Đang hoạt động' active (blue underline tab 2) + 3 cards all with green 'Đang hoạt động' badge"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21528-25362-list-active.png
claims_verified:
  - claim: "Tab indicator moves to 'Đang hoạt động' (blue underline on tab 2)"
    status: ✓
    evidence: "21528-25362-list-active.png top shows tab 2 'Đang hoạt động' with blue underline (vs 'Tất cả' active in default frame)"
  - claim: "All visible cards have green 'Đang hoạt động' badge"
    status: ✓
    evidence: "21528-25362-list-active.png 3 cards all render green pill 'Đang hoạt động' (no grey/inactive mixed)"
  - claim: "Card content otherwise identical to default variant"
    status: ✓
    evidence: "21528-25362-list-active.png cards repeat default layout: blue '#IP-BP-0001' code + 'Lọc dầu động cơ Toyota' name + divider + 2-col 2-row attrs (Tính chất/Vật tư hàng hoá, Nhóm/Phụ tùng bảo dưỡng, ĐVT/Cái, Thương hiệu/Toyota)"
claims_unverified: []
_negative_coverage: "KHÔNG có FAB; KHÔNG có grey 'Ngừng hoạt động' badge (filter logic excludes inactive); KHÔNG có row-level action icons (Sửa/Xóa) — view-only per CR-1782373204; KHÔNG có search/filter trailing icons disabled (vẫn enabled, chỉ TabBar đổi)."

## Screen: Danh sách sản phẩm - Ngừng hoạt động (21528:25516)
- Tab "Ngừng hoạt động" filter applied; cards filter to inactive only with grey badge.
- ⚠ **Figma source anomaly**: per-frame PNG `21528-25516-list-inactive.png` shows tab 2 "Đang hoạt động" still highlighted (blue underline NOT moved to tab 3 "Ngừng hoạt động"). Cards correctly render grey "Ngừng hoạt động" badges → filter logic is Ngừng hoạt động. DEV implement: when filter=Ngừng hoạt động, underline MUST be on tab 3 (correct design intent; Figma frame visual lag is non-canonical for tab indicator).
_png_verified: "asset 21528-25516-list-inactive.png shows AppBar 'Sản phẩm' + tab row (Figma source still has tab 2 'Đang hoạt động' active visually — anomaly) + 3 cards all with GREY 'Ngừng hoạt động' badge (neutral fill, NOT orange)"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21528-25516-list-inactive.png
claims_verified:
  - claim: "Cards visible all show GREY 'Ngừng hoạt động' badge (neutral fill, NOT orange) — filter logic = Ngừng hoạt động"
    status: ✓
    evidence: "21528-25516-list-inactive.png 3 cards consistently render grey 'Ngừng hoạt động' pill"
  - claim: "AppBar + card layout identical to active variant — only badge color + tab indicator differ"
    status: ✓
    evidence: "21528-25516-list-inactive.png reuses same '#IP-BP-0001 / Lọc dầu động cơ Toyota / 2x2 attrs' structure"
  - claim: "Empty state may apply if no inactive products (per FEAT BR)"
    status: ✓
    evidence: "21528-25516-list-inactive.png shows populated cards in this sample; empty-state fallback per BR-CAT-* applies otherwise"
claims_unverified:
  - claim: "Tab indicator on 'Ngừng hoạt động' (rightmost), blue underline"
    reason: "Figma source frame 21528:25516 still shows tab 2 'Đang hoạt động' visually active — Figma design lag. DEV MUST implement underline-on-tab-3 per filter logic; do NOT mirror Figma anomaly."
_negative_coverage: "KHÔNG có FAB; KHÔNG có green 'Đang hoạt động' badge (filter logic excludes active); KHÔNG có row-level action icons (Sửa/Xóa) — view-only; KHÔNG có 'Khôi phục' / 'Activate' action (mobile view-only — không có activate flow)."

## Screen: Tìm kiếm sản phẩm - Default (21235:24802)
- **Full-page route** (NOT bottom-sheet) — tap AppBar search icon → push search page; TabBar persists at top per PNG (parent route's TabBar carried into search state, NOT modal sheet).
- Empty input shows keyword prompt: "Tìm kiếm sản phẩm theo từ khoá" + bulleted list of search fields:
  - Mã nội bộ
  - Tên sản phẩm
  - SKU liên kết
- Widget Tree (compressed):
  ```
  Scaffold
  └── Column [crossAxis=stretch]
      ├── CustomAppBar [identifier: ProductSearchAppBar] (search input replaces title; BG: AppColors.bgPrimary)
      │   ├── leading: BackButton (cancel search → pop to list)
      │   └── title: AppTextField/SearchInput
      │       ├── prefix: Icon clear-x-replaced-by-search-prefix → Icons.search (20px, AppColors.iconSecondary)
      │       ├── placeholder: "Tìm kiếm"
      │       └── (state: empty — no clear-× shown)
      ├── TabBar/StatusFilter [identifier: ProductStatusTabBar, _children_count: 3] (persisted from parent list route — BG: AppColors.bgPrimary)
      │   ├── Tab "Tất cả" (active — blue underline)
      │   ├── Tab "Đang hoạt động"
      │   └── Tab "Ngừng hoạt động"
      └── Expanded → Padding(EdgeInsets.all(AppSizes.spacing16))
          └── Column [crossAxis=start, gap=Gap(AppSizes.spacing8)]
              ├── Text "Tìm kiếm sản phẩm theo từ khoá" → textSubtitleS5 textSecondary
              └── BulletList [_children_count: 3]
                  ├── "Mã nội bộ"
                  ├── "Tên sản phẩm"
                  └── "SKU liên kết"
  ```
_negative_coverage: "KHÔNG có ProductListCard render (state là prompt/keyword guide); KHÔNG có FAB; KHÔNG có 'Hủy' text button trailing (back chevron là cancel); KHÔNG có clear-× icon trong SearchInput (input empty)."
_png_verified: "asset 21235-24802-search-default.png shows AppBar `< [🔍 Tìm kiếm placeholder]` (back chevron + grey-bg pill search input with magnifier prefix + 'Tìm kiếm' placeholder) + 3-tab row with 'Tất cả' active + body header 'Tìm kiếm sản phẩm theo từ khoá' (bold) + 3 grey bullet items (Mã nội bộ / Tên sản phẩm / SKU liên kết) + lower half empty"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21235-24802-search-default.png
claims_verified:
  - claim: "AppBar replaced by search input field with magnifier prefix + back button to cancel"
    status: ✓
    evidence: "21235-24802-search-default.png top shows '<' + grey-bg rounded search field with magnifier icon + 'Tìm kiếm' placeholder (NO 'Sản phẩm' title)"
  - claim: "Body shows 'Tìm kiếm sản phẩm theo từ khoá' header followed by 3 bullets enumerating searchable fields"
    status: ✓
    evidence: "21235-24802-search-default.png body L16 shows bold heading 'Tìm kiếm sản phẩm theo từ khoá' followed by 3-bullet vertical list: 'Mã nội bộ', 'Tên sản phẩm', 'SKU liên kết' (all grey text)"
  - claim: "TabBar persists between AppBar and body (3-tab Tất cả/Đang/Ngừng — Tất cả active)"
    status: ✓
    evidence: "21235-24802-search-default.png mid shows 3-tab row Tất cả (active blue underline) | Đang hoạt động | Ngừng hoạt động"
  - claim: "NO cards visible — pure prompt/keyword guide state"
    status: ✓
    evidence: "21235-24802-search-default.png lower 2/3 of viewport is empty grey bg"
claims_unverified: []

## Screen: Tìm kiếm sản phẩm - No Results (21235:24823)
- Empty results state của full-page search route khi query không match. TabBar persists from parent list route (per PNG observation + claim 4).
- Body: magnifying-glass illustration + label "Không có kết quả phù hợp / Vui lòng thử lại"
- Widget Tree inherits from search-default (21235:24802) — same Scaffold→Column→[CustomAppBar(SearchInput) → TabBar/StatusFilter(_children_count: 3) → Expanded(body)] skeleton; body replaces BulletList với centered illustration + 2-line message column.
_png_verified: "asset 21235-24823-search-no-results.png shows AppBar (back + grey search field 'Tìm kiếm' placeholder) + 3-tab (Tất cả active) + centered magnifying-glass line-art icon + bold 'Không có kết quả phù hợp' + thin grey 'Vui lòng thử lại' caption below"
_negative_coverage: "KHÔNG có ProductListCard render; KHÔNG có FAB; KHÔNG có result-count header; KHÔNG có clear-× icon trong SearchInput (mặc dù state là 'sau khi typed' — PNG shows input visually empty, có thể là rendering choice cho frame variant — DEV implement: clear-× visible khi input.text != empty)."

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21235-24823-search-no-results.png
claims_verified:
  - claim: "Empty illustration is magnifying-glass line-art (search-specific, NOT generic document like 'Không có dữ liệu')"
    status: ✓
    evidence: "21235-24823-search-no-results.png center shows line-art magnifier icon (circle + handle, thin stroke)"
  - claim: "Two-line message 'Không có kết quả phù hợp' bold + 'Vui lòng thử lại' caption below"
    status: ✓
    evidence: "21235-24823-search-no-results.png mid shows bold dark 'Không có kết quả phù hợp' then thinner grey 'Vui lòng thử lại' centered"
  - claim: "AppBar retains search input field (state after typed query produced 0 hits)"
    status: ✓
    evidence: "21235-24823-search-no-results.png top shows search input pill still present with magnifier prefix"
  - claim: "TabBar still rendered between search input and body"
    status: ✓
    evidence: "21235-24823-search-no-results.png shows 3-tab row preserved below search bar"
claims_unverified: []

## Screen: Tìm kiếm sản phẩm - Results (21526:40447)
- 1+ search result cards below input. Header counter "1 kết quả tìm kiếm cho “IP-BP-0001”" + ProductListCard like default list.
- Widget Tree inherits from search-default (21235:24802) — same Scaffold→Column→[CustomAppBar(SearchInput WITH clear-× trailing visible since input.text != empty) → TabBar/StatusFilter(_children_count: 3) → Expanded(body)] skeleton; body = [Text result-count header → ListView/ProductListCards (1..N)].
_png_verified: "asset 21526-40447-search-results.png shows AppBar search input filled with 'IP-BP-...' (truncated) + clear (×) icon trailing + 3-tab (Tất cả active) + result-count line '1 kết quả tìm kiếm cho “IP-BP-0001”' (curly double quotes) + 1 ProductListCard below (green Đang hoạt động badge)"
_negative_coverage: "KHÔNG có FAB; KHÔNG có empty-state illustration; KHÔNG có 'Hủy' text button trailing AppBar (back chevron là cancel)."

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21526-40447-search-results.png
claims_verified:
  - claim: "Search bar shows truncated/active query 'IP-BP-...' with clear (×) icon trailing"
    status: ✓
    evidence: "21526-40447-search-results.png top shows search input filled 'IP-BP-...' (ellipsis truncation visible) + grey × clear-button at right edge of pill"
  - claim: "Result count header '1 kết quả tìm kiếm cho “IP-BP-0001”' rendered above card (curly double quotes around query)"
    status: ✓
    evidence: "21526-40447-search-results.png below tab row shows '1 kết quả tìm kiếm cho “IP-BP-0001”' single-line text; quotes are curly typographic (“ ”), NOT straight ASCII"
  - claim: "Result cards use same ProductListCard layout as default list (code + badge + name + 2x2 attrs)"
    status: ✓
    evidence: "21526-40447-search-results.png shows 1 card identical to default: blue '#IP-BP-0001' + green 'Đang hoạt động' + 'Lọc dầu động cơ Toyota' + 2x2 attr grid (Tính chất/Nhóm/ĐVT/Thương hiệu)"
claims_unverified: []

## Screen: Bộ lọc sản phẩm - Default (21235:25937)
- Filter bottom-sheet (full-screen modal) — 2 dropdown fields blank.
- AppBar: "< Bộ lọc" centered title.
- Footer 2-button: "Thiết lập lại" secondary + "Áp dụng" primary.
_png_verified: "asset 21235-25937-filter-default.png shows AppBar `< Bộ lọc` centered title (NOT 'Bộ lọc sản phẩm') + 2 stacked form rows: 'Tính chất' label above grey-bordered field with placeholder 'Chọn tính chất hàng hoá' + chevron-down trailing; 'Nhóm hàng' label above grey-bordered field with placeholder 'Chọn nhóm hàng' + chevron-down trailing + bottom action bar: [Thiết lập lại grey-bg button | Áp dụng blue primary button] 2-col row"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21235-25937-filter-default.png
claims_verified:
  - claim: "AppBar centered title 'Bộ lọc' (verbatim — NOT 'Bộ lọc sản phẩm') with back chevron leading"
    status: ✓
    evidence: "21235-25937-filter-default.png top shows '<' + centered bold 'Bộ lọc' (2-syllable Vietnamese) — confirms M-trap label drift"
  - claim: "2 dropdown fields stacked vertically: 'Tính chất' label + placeholder 'Chọn tính chất hàng hoá' (with diacritic 'hoá' — NOT 'hóa'); 'Nhóm hàng' label + placeholder 'Chọn nhóm hàng'; both with chevron-down trailing"
    status: ✓
    evidence: "21235-25937-filter-default.png body L24 shows bold 'Tính chất' label + grey-outlined input with 'Chọn tính chất hàng hoá' placeholder text + right chevron; L120 shows bold 'Nhóm hàng' label + grey-outlined input with 'Chọn nhóm hàng' placeholder + right chevron"
  - claim: "Footer 2-button row: 'Thiết lập lại' secondary grey (left, narrower) + 'Áp dụng' primary blue (right, wider) — NOT vertically stacked"
    status: ✓
    evidence: "21235-25937-filter-default.png bottom shows side-by-side buttons; left grey-bg 'Thiết lập lại' ~30% width, right blue-bg 'Áp dụng' ~60% width with white text"
  - claim: "Filter sheet has EXACTLY 2 field rows (NOT 3) — Trạng thái does NOT appear in filter sheet (only in TabBar of list page)"
    status: ✓
    evidence: "21235-25937-filter-default.png body shows only 2 dropdown rows then empty space until footer; no 'Trạng thái' / 'Status' segmented control / dropdown anywhere"
claims_unverified: []
_negative_coverage: "KHÔNG có TabBar/StatusFilter (filter page là full-page route riêng, NOT inherit TabBar từ list); KHÔNG có search-icon hoặc filter-icon trailing trong AppBar (chỉ có back chevron + centered title); KHÔNG có 3rd 'Trạng thái' dropdown (status filter chỉ ở TabBar parent); KHÔNG có ProductListCard."

## Screen: Bộ lọc sản phẩm - Filled (21235:27908)
- Filter sheet with selections + dropdown menu open showing 3 options.
- Dropdown selected: "Tính chất: Vật tư tiêu hao"; "Nhóm hàng: Hệ thống phanh" with menu showing 3 "Hệ thống phanh" options (one highlighted blue background = currently selected/hover).
- Footer same as default variant.

### Widget Tree (Filter Filled)
```
Scaffold
└── Column [crossAxis=stretch]
    ├── CustomAppBar [identifier: ProductFilterAppBar]
    │   ├── leading: BackButton
    │   └── title: Text "Bộ lọc"
    ├── Expanded → SingleChildScrollView
    │   └── Column [padding=EdgeInsets.all(AppSizes.spacing16), gap=Gap(AppSizes.spacing16)]
    │       ├── AppDropdown/TinhChat [identifier: PropertyFilterField]
    │       │   ├── Label "Tính chất"
    │       │   └── Selected "Vật tư tiêu hao" + chevron-down
    │       └── AppDropdown/NhomHang [identifier: GroupFilterField]
    │           ├── Label "Nhóm hàng"
    │           └── Selected "Hệ thống phanh" + chevron-down
    │           └── (open) → DropdownMenu/options [_children_count: 3]
    │               ├── Option "Hệ thống phanh"
    │               ├── Option "Hệ thống phanh" (highlighted)
    │               └── Option "Hệ thống phanh"
    └── BottomBar/Footer [identifier: FilterFooter]
        └── Row [_children_count: 2]
            ├── Expanded → AppButton/ThietLapLai (secondary)
            └── Expanded → AppButton/ApDung (primary blue)
```

### AppButton/ThietLapLai [identifier: ResetButton]
- BG `AppColors.buttonBackgroundSecondary` + Text "Thiết lập lại" → `textSubtitleS4` color=`textPrimary`
→ flutter: `AppButton.text(title: "Thiết lập lại", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: bloc.resetFilters)`
_png_verified: "asset 21235-27908-filter-filled.png bottom-left shows light-grey button 'Thiết lập lại' (verbatim with diacritic)"

### AppButton/ApDung [identifier: ApplyButton]
- BG `AppColors.buttonBackgroundPrimary` + Text "Áp dụng" → `textSubtitleS4` color=`textWhite`
→ flutter: `AppButton.text(title: "Áp dụng", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: bloc.applyFilters)`
_png_verified: "asset 21235-27908-filter-filled.png bottom-right shows BLUE button 'Áp dụng' (verbatim diacritic 'Á' + 'ụ')"

### §VV Visual Verification Pass
screenshot: assets/wave03-cat-prod-list/21235-27908-filter-filled.png
claims_verified:
  - claim: "AppBar centered title 'Bộ lọc' with back chevron, no trailing action"
    status: ✓
    evidence: "PNG top shows '<' + centered 'Bộ lọc' title"
  - claim: "Tính chất dropdown shows selected value 'Vật tư tiêu hao' with chevron-down"
    status: ✓
    evidence: "PNG mid-upper shows 'Tính chất' label + 'Vật tư tiêu hao' value cell with right chevron"
  - claim: "Nhóm hàng dropdown shows selected 'Hệ thống phanh' + EXPANDED menu with 3 'Hệ thống phanh' options (1 highlighted with light-blue bg)"
    status: ✓
    evidence: "PNG mid shows 'Nhóm hàng' field + open dropdown below with 3 menu items; middle item has light-blue bg + blue text indicating selected/hover state"
  - claim: "Footer 2-button [Thiết lập lại grey | Áp dụng primary-blue] (verbatim labels with diacritic preserved)"
    status: ✓
    evidence: "PNG bottom shows 2 buttons with verbatim Vietnamese text including 'Thiết lập lại' (5-syllable) + 'Áp dụng' (diacritic 'Á' + 'ụ')"
  - claim: "NO checkbox/radio visible in dropdown menu items — pure text rows"
    status: ✓
    evidence: "PNG dropdown menu shows text-only rows, no leading checkbox/radio circles"
claims_unverified: []
_negative_coverage: "KHÔNG có TabBar/StatusFilter (full-page filter route, NOT inherit từ list); KHÔNG có search/filter icons trailing AppBar; KHÔNG có 3rd 'Trạng thái' dropdown; KHÔNG có ProductListCard; KHÔNG có checkbox/radio trong dropdown options (text-only rows)."

## Screenshots
> assets/wave03-cat-prod-list/
- `_section-overview.png` — Overview của 9 frame variants (2048×1018, downscaled from 4783×2337) — section enumeration only, NOT per-§VV evidence
- `21526-44347-empty.png` — Frame: Danh sách sản phẩm - Tất cả (default with 3 cards, 375×812)
- `21579-23956-default.png` — Frame: Danh sách sản phẩm - Tất cả (empty data state, 375×812)
- `21528-25362-list-active.png` — Frame: Danh sách sản phẩm - Đang hoạt động (filter Đang hoạt động, 3 cards green badge, 375×812)
- `21528-25516-list-inactive.png` — Frame: Danh sách sản phẩm - Ngừng hoạt động (filter Ngừng hoạt động, 3 cards grey badge; Figma tab indicator anomaly — see screen §VV, 375×812)
- `21235-24802-search-default.png` — Frame: Tìm kiếm sản phẩm - Default (search overlay với keyword prompt + 3 bullets, 375×812)
- `21235-24823-search-no-results.png` — Frame: Tìm kiếm sản phẩm - No Results (empty result với magnifier icon + 2-line message, 375×812)
- `21526-40447-search-results.png` — Frame: Tìm kiếm sản phẩm - Results (1 result card + count header với curly quotes, 375×812)
- `21235-25937-filter-default.png` — Frame: Bộ lọc sản phẩm - Default (2 empty dropdown rows + footer 2-button, 375×812)
- `21235-27908-filter-filled.png` — Frame: Bộ lọc sản phẩm - Filled (filter sheet với dropdown open showing 3 options, 375×812)

> **Per-frame fidelity**: 9/9 top-level frames đều có per-frame PNG (NATIVE 375×812 res). §VV blocks cite per-frame asset (NOT `_section-overview.png`) per skill v7 §2c.5 rule (chống G7 downscale trap — wave03-cat-prod-* incident root cause đã đóng).

## Notes
- View-only mobile (per CR-1782373204): no FAB/BottomBar Create, no card-row actions. Tap card = navigate to PROD-DETAIL.
- Status badge "Ngừng hoạt động" trên PROD-LIST = **GREY** (neutral) — KHÁC GRP-LIST (orange). M-22 + M-trap-3 enforce: dùng `AppColors.bgBadgeOpen` + `AppColors.textSecondary`.
- PROD-LIST card có 4 attribute fields (Tính chất / Nhóm / ĐVT / Thương hiệu) trong 2-col 2-row layout — KHÔNG có icon prefix (khác GRP-LIST có floppy + note icons).
- 3-tab StatusTabBar identical pattern across GRP-LIST + PROD-LIST.
- AppBar 2 trailing icons (search + filter) trigger respective **full-page routes** (NOT bottom-sheets per PNG observation). Search route persists parent TabBar; filter route is standalone full-page (no TabBar).
- Filter route: 2 dropdown ("Tính chất", "Nhóm hàng") + footer (Reset + Apply). Selected values display as text in dropdown cell + chevron-down. NO 3rd "Trạng thái" dropdown (status filter is in TabBar of list page).
- Search route has 3 states (Default keyword prompt / No Results with magnifier-icon + 'Vui lòng thử lại' / Results with count header in curly quotes). All 3 inherit AppBar(SearchInput) + TabBar from list parent.
- Empty data state: grey document illustration + "Không có dữ liệu" — distinct from "Không có kết quả phù hợp" (search-specific).
