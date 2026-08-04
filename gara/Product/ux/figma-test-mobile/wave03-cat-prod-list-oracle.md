---
feat: FEAT-CAT-PROD-LIST
feat_file: Product/features/FEAT-CAT-PROD-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21254-52585&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21254:52585"
fetched_at: 2026-06-29T03:14:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: MCP_OUTPUT_TOO_LARGE (153k chars; multi-screen frame quá lớn — bỏ qua, suy section từ _full.png visual)
  get_variable_defs: cached from sibling node (5YU4H3iY726P8KNxI9oCYF — App-Garage-V3 file vocab)
  get_design_context: skipped (rely on _full.png visual)
  get_screenshot: success (1 PNG: _full overview)
data_completeness:
  screen_inventory: complete (11 frames identified từ _full.png visual)
  component_inventory: partial (visual-only — không có node IDs per-frame; suy widget từ visual + sibling FEAT-CAT-PROD-DETAIL token vocab)
  variant_state: partial (3 tab states + 2 view modes — list/search/filter, suy từ visual)
  text_content: partial (verbatim từ _full.png visual; mock data sample)
  design_tokens: complete (variable_defs reuse từ App-Garage-V3 file)
  interaction_states: partial (Figma không render :pressed — suy theo Flutter Material baseline)
screenshots:
  - assets/wave03-cat-prod-list/_full.png
---

# Oracle — FEAT-CAT-PROD-LIST (mobile) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `App-Garage-V3` section `21254:52585`
> "FEAT-CAT-PROD-LIST". Section chứa **11 frame** đại diện đầy đủ state matrix màn danh sách sản
> phẩm (List default · Tab filter · Search input · Empty result · Search result 1-kết-quả · Filter
> sheet · Filter sheet expanded · Empty list state).
>
> **⚠️ Data caveat**: `get_metadata(21254:52585)` trả `MCP_OUTPUT_TOO_LARGE` (153k chars) — không
> drill được vào node IDs từng frame. 5-cấp dưới đây bóc từ `_full.png` visual + sibling FEAT-CAT-PROD-DETAIL
> token vocab + FEAT-CAT-PROD-LIST web oracle (sibling `wave03-cat-prod-list-oracle.md` web). Agent-test-ui
> verify component inventory với fallback baseline shadcn/iOS Material + FEAT AC.

---

## Screen Inventory

> 11 frame trong section đại diện 11 state. Layout 8 frame row 1 + 3 frame row 2. iPhone 375×812.

| Screen state | Frame index (in _full.png) | size (W×H) | screenshot |
|---|---|---|---|
| 1. Tab "Tất cả" — list default (3 product cards, 1 active + 1 active + 1 active) | row1-col1 | 375×812 | (xem _full.png cột 1) |
| 2. Tab "Đang hoạt động" active (filter applied — only active products) | row1-col2 | 375×812 | (xem _full.png cột 2) |
| 3. Tab "Ngưng hoạt động" active (filter — only inactive products) | row1-col3 | 375×812 | (xem _full.png cột 3) |
| 4. Search input opened — empty (placeholder "Tìm kiếm", focus state) — pre-typed hint copy | row1-col4 | 375×812 | (xem _full.png cột 4) |
| 5. Search — no results (icon search + "Không có kết quả phù hợp" / "Vui lòng thử lại") | row1-col5 | 375×812 | (xem _full.png cột 5) |
| 6. Search results — typed "IP-BP-..." → 1 match (badge "1 kết quả tìm kiếm cho 'IP-BP-0001'") | row1-col6 | 375×812 | (xem _full.png cột 6) |
| 7. Filter sheet — "Bộ lọc" opened (Tính chất + Nhóm hàng dropdowns, "Thiết lập lại" + "Áp dụng" footer) | row1-col7 | 375×812 | (xem _full.png cột 7) |
| 8. Filter sheet — "Nhóm hàng" dropdown expanded (3 options: Hệ thống phanh, 1 selected blue, 3rd disabled) | row1-col8 | 375×812 | (xem _full.png cột 8) |
| 9. Tab "Tất cả" + Empty list state — "Không có dữ liệu" centered icon | row2-col1 | 375×812 | (xem _full.png cột 9) |
| (Aggregate) Section full | `21254:52585` | 4783×2337 | `assets/wave03-cat-prod-list/_full.png` |

> Status bar (44px) + Nav bar "Sản phẩm" (52px) shared chrome. Search/filter icon trên AppBar right.
> Tab bar dưới AppBar (3 tab: Tất cả / Đang hoạt động / Ngưng hoạt động) — underline 2px blue cho
> active. List items render dạng card (`#IP-BP-0001` + name + ĐVT/Nhóm + Thương hiệu).

---

## Component Inventory

### Shared chrome (mọi screen)

| Component | Brief | Flutter mapping (expected) |
|---|---|---|
| Status bar | h=44 system | `MediaQuery.padding.top` |
| AppBar (`Bars/Nav Bars: Standard`) | h=52, title "Sản phẩm" center Semi Bold 16, left back arrow `vuesax/linear/arrow-left`, right cluster 2 icon: search `vuesax/linear/search-normal` + filter `vuesax/linear/filter` (cả 20×20) | `AppBar` / `custom_app_bar.dart` |
| Tab bar | 3 tab horizontal scroll: **"Tất cả"** · **"Đang hoạt động"** · **"Ngưng hoạt động"**. Active = text color `#0052ff` + underline 2px `#0052ff`. Non-active = text `#262626` / `#888c94`. Gap ~12px, py=12 | `TabBar` / custom |

### Screen 1-3 — List states

| Component | Brief | Flutter mapping |
|---|---|---|
| Product card (`ProductCard` widget) | Stacked vertical, full-width 343×variable (~120 estimate), p=12-16, radius=12, bg white, no border (chỉ bg nổi vs `bgSecondary` `#f3f3f4`) | Custom card |
| Card header row | `#IP-BP-0001` Bold 16 brand-CD (`#0052ff`) ↔ Badge "Đang hoạt động" (green) / "Ngưng hoạt động" (gray) | Row |
| Card title | "Lọc dầu động cơ Toyota" Semi Bold 16 `#262626` | Text |
| Card attributes row 1 | 2-col: "Tính chất" / "Nhóm" — label Caption C7 + value Body B5 | Row |
| Card attributes row 2 | 2-col: "ĐVT" / "Thương hiệu" — same pattern | Row |

### Screen 4 — Search input

| Component | Brief | Flutter mapping |
|---|---|---|
| AppBar (search mode) | Left back arrow + Search TextField full-width (no fixed title), input placeholder "Tìm kiếm" w/ leading magnifier icon | `AppBar(title: TextField(...))` |
| Body content | Text hint "Tìm kiếm sản phẩm theo từ khóa" (Subtitle S5 14px Semi Bold) + bullet list: "• Mã nội bộ", "• Tên sản phẩm", "• SKU liên kết" (Caption C5 14 Regular) | Column with Text widgets |

### Screen 5 — Empty search result

| Component | Brief | Flutter mapping |
|---|---|---|
| Empty illustration | Centered magnifier/search icon (SVG, ~64-80px) | `SvgPicture.asset(...)` |
| Empty title | **"Không có kết quả phù hợp"** Semi Bold 16 `#262626` center | `Text` Subtitle S4 |
| Empty subtitle | **"Vui lòng thử lại"** Regular 12 `#888c94` center | `Text` Caption C7 |

### Screen 6 — 1 result

| Component | Brief | Flutter mapping |
|---|---|---|
| Result count text | **"1 kết quả tìm kiếm cho 'IP-BP-0001'"** Caption C5 14 Regular | `Text` |
| Search input | Pre-typed "IP-BP-..." with clear (x) icon trailing | `TextField` |
| Product card | Same as Screen 1-3 (single result) | (reuse) |

### Screen 7 — Filter sheet

| Component | Brief | Flutter mapping |
|---|---|---|
| Header | Left arrow-left back + title "Bộ lọc" center Semi Bold 16 | `AppBar` |
| "Tính chất" dropdown | Label Semi Bold 14 + Select dropdown w/ placeholder "Chọn tính chất hàng hoá" + chevron-down right | `AppDropdown` |
| "Nhóm hàng" dropdown | Label + Select placeholder "Chọn nhóm hàng" + chevron | `AppDropdown` |
| Footer 2 buttons | Left: "Thiết lập lại" (secondary `bg-Secondary` `#f3f3f4`) · Right: "Áp dụng" (primary `#0052ff`) flex=1 each, gap=8 | 2× `AppButton.text` |

### Screen 8 — Dropdown expanded

| Component | Brief | Flutter mapping |
|---|---|---|
| Dropdown items list | 3 row: "Hệ thống phanh" non-selected · "Hệ thống phanh" selected (bg `#edf7ff` light blue + text `#0052ff`) · "Hệ thống phanh" non-selected | `DropdownMenuItem` list |

### Screen 9 — Empty list

| Component | Brief | Flutter mapping |
|---|---|---|
| Empty illustration | Document/list-empty SVG icon centered | `SvgPicture` |
| Empty title | **"Không có dữ liệu"** Subtitle S4 16 Semi Bold `#262626` | `Text` |

---

## Variant & State

### Tab bar
- **Variants**: 3 tab — "Tất cả" / "Đang hoạt động" / "Ngưng hoạt động".
- **Active state**: text `#0052ff` Body B5 Medium 14, border-bottom 2px solid `#0052ff` (`border-Active`).
- **Non-active**: text `#262626` (first tab Tất cả) hoặc `#888c94` (other tabs); no underline.
- **Tap target**: full tab area.

### Product card
- **Variants observed**: 1 default state (badge variant flips Active/Inactive).
- **Tap state**: ripple Material default → navigate to FEAT-CAT-PROD-DETAIL.
- **Disabled state**: N/A.

### Search input (TextField)
- **States**: empty placeholder · typed (clear x icon trailing) · focused.

### Filter dropdown (Select)
- **Variants**: collapsed (placeholder) · expanded (3 item options).
- **Item states**: default (white bg, text `#262626`) · selected (bg `#edf7ff`, text `#0052ff` Medium 14 + checkmark right?) · disabled (opacity 0.5?).

### Bottom action button (Filter sheet)
- **Variant 1 — "Thiết lập lại"** (secondary): bg `#f3f3f4`, text `#273243` Bold 16, p=`px=16 py=12`, radius=8.
- **Variant 2 — "Áp dụng"** (primary): bg `#0052ff`, text white Bold 16, same dims.

### Badge (in product card)
- **Active**: bg `#f0fdf1`, text `#15aa2c` "Đang hoạt động".
- **Inactive**: bg `#f3f3f4`, text `#888c94` "Ngưng hoạt động".

---

## Text Content (verbatim from visual)

### AppBar
- Title: **"Sản phẩm"** (Semi Bold 16 center)

### Tab labels
- **"Tất cả"**
- **"Đang hoạt động"**
- **"Ngưng hoạt động"**

### Search input
- Placeholder: **"Tìm kiếm"**
- Hint copy (Screen 4): **"Tìm kiếm sản phẩm theo từ khóa"** (title)
- Hint bullets: **"Mã nội bộ"** · **"Tên sản phẩm"** · **"SKU liên kết"**
- Result count: **"1 kết quả tìm kiếm cho 'IP-BP-0001'"**

### Empty states
- Search empty title: **"Không có kết quả phù hợp"**
- Search empty subtitle: **"Vui lòng thử lại"**
- List empty title: **"Không có dữ liệu"**

### Filter sheet
- Title: **"Bộ lọc"**
- Field 1 label: **"Tính chất"** · Placeholder: **"Chọn tính chất hàng hoá"**
- Field 2 label: **"Nhóm hàng"** · Placeholder: **"Chọn nhóm hàng"**
- Dropdown option (sample): **"Hệ thống phanh"** (x3)
- Footer button 1: **"Thiết lập lại"**
- Footer button 2: **"Áp dụng"**

### Product card sample
- Code: **"#IP-BP-0001"**
- Name: **"Lọc dầu động cơ Toyota"**
- Labels: **"Tính chất"** / **"Nhóm"** / **"ĐVT"** / **"Thương hiệu"**
- Values (sample): **"Vật tư hàng hoá"** / **"Phụ tùng bảo dưỡng"** / **"Cái"** / **"Toyota"**
- Badge: **"Đang hoạt động"** / **"Ngưng hoạt động"**

---

## Design Tokens

> **Token vocab cached** từ `get_variable_defs(21555:24017)` (sibling FEAT-CAT-PROD-DETAIL — cùng
> file App-Garage-V3) — full table xem `wave03-cat-prod-detail-oracle.md §Design Tokens`. Key tokens
> dùng trong list screen:

### Colors

| Hex | Role | Expected Flutter token |
|---|---|---|
| `#ffffff` | Screen + card bg | `AppColors.bgBase` |
| `#f3f3f4` | Page bg (behind cards), badge inactive bg, "Thiết lập lại" button bg | `AppColors.bgSecondary` |
| `#0052ff` | Tab active text+underline, brand-CD `#IP-BP-0001` code, "Áp dụng" button bg, selected dropdown text | `AppColors.textActivePrimary` / `bgActive` / `borderActive` |
| `#edf7ff` | Selected dropdown item bg (light blue) | `PrimaryColor.s50` |
| `#262626` | Product name, tab "Tất cả" non-active text, body text | `AppColors.textPrimary` |
| `#273243` | "Thiết lập lại" button text | `AppColors.textPrimary` (alias) |
| `#888c94` | Caption label, "Ngưng hoạt động" badge text, secondary tab text | `AppColors.textTertiary` |
| `#15aa2c` | "Đang hoạt động" badge text | `AppColors.textSuccessPrimary` |
| `#f0fdf1` | "Đang hoạt động" badge bg | `AppColors.bgBadgeSuccess` |
| `#e8e8ea` | Divider, border | `AppColors.borderPrimary` |
| `#b8babf` | Placeholder text (search "Tìm kiếm", dropdown "Chọn...") | `AppColors.textQuaternary` (derived) |

### Typography

| Style | Used at | Token |
|---|---|---|
| `Heading/H4` Inter Bold 16/24 | Product code `#IP-BP-0001` | `AppTextStyle.textHeadingH4` |
| `Subtitle/S4` Inter SB 16/24 | Product name, empty title, AppBar title, filter sheet title | `AppTextStyle.textSubtitleS4` |
| `Subtitle/S5` Inter SB 14/20 | Search hint title, filter labels "Tính chất"/"Nhóm hàng" | `AppTextStyle.textSubtitleS5` |
| `Body/B5` Inter Med 14/20 | Tab active text, button label "Thiết lập lại"/"Áp dụng" (16/24 Bold — confirm); selected dropdown item | `AppTextStyle.textBodyB5` |
| `Body/B7` Inter Med 12/18 | Badge text "Đang hoạt động"/"Ngưng hoạt động" | `AppTextStyle.textBodyB7` |
| `Caption/C5` Inter Reg 14/20 | Tab non-active text, search bullets, result count | `AppTextStyle.textCaptionC5` |
| `Caption/C7` Inter Reg 12/18 | Card attributes label (Tính chất/Nhóm/ĐVT/Thương hiệu), placeholder, empty subtitle | `AppTextStyle.textCaptionC7` |

### Spacing

| Element | Value | Token |
|---|---|---|
| Screen padding (list container) | `EdgeInsets.symmetric(horizontal: 16, vertical: 12)` | `AppSizes.spacing16` / `spacing12` |
| Card gap | `gap=12` vertical between cards | `Gap(AppSizes.spacing12)` |
| Card inner p | `p=12` hoặc `p=16` | `EdgeInsets.all(AppSizes.spacing12)` |
| Card row gap | `gap=8` vertical between header/title/attrs | `Gap(AppSizes.spacing8)` |
| Tab bar inner | `px=4 py=12`, gap=12 between tabs | literal |
| Filter sheet inner | `EdgeInsets.all(16)` | `AppSizes.spacing16` |
| Filter sheet field gap | `gap=16` vertical | `Gap(AppSizes.spacing16)` |
| Filter sheet button bar | `gap=8`, p=`px=16 pb=20 pt=16` | `Gap(AppSizes.spacing8)` |
| Empty state vertical center | flex space; gap=8 illustration↔title↔subtitle | `Gap(AppSizes.spacing8)` |

### Border / Radius

| Element | Value | Token |
|---|---|---|
| Card radius | `12px` | `BorderRadius.circular(12)` |
| Card border | none | — |
| Badge radius | `8px` | `BorderRadius.circular(8)` |
| Button radius | `8px` | `BorderRadius.circular(8)` |
| Search TextField radius | `8px` | `BorderRadius.circular(8)` |
| Dropdown Select radius | `8px` | `BorderRadius.circular(8)` |
| Tab active underline | `border-bottom: 2px solid #0052ff` | `Border(bottom: BorderSide(color: AppColors.borderActive, width: 2))` |

### Icons

| Name | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20×20 | `#262626` | AppBar back |
| `vuesax/linear/search-normal` | 20×20 | `#262626` | AppBar right search trigger; TextField leading icon |
| `vuesax/linear/filter` | 20×20 | `#262626` | AppBar right filter trigger |
| `vuesax/linear/close-circle` (x clear) | 16×16 | `#888c94` | Search clear button (Screen 6) |
| `vuesax/linear/arrow-down` | 20×20 | `#262626` | Dropdown chevron |
| Empty SVG (search) | ~64-80 | (multi) | Screen 5 empty illustration |
| Empty SVG (list) | ~64-80 | (multi) | Screen 9 empty illustration |

### Bounds (key dimensions)

| Element | W × H |
|---|---|
| Screen frame | 375 × 812 |
| Product card | 343 × ~120 (variable theo content) |
| Tab bar | 343 × ~44 |
| AppBar | 375 × 52 |
| Filter sheet field (dropdown) | 343 × ~48 |
| Bottom button | (343-8)/2 × 48 ≈ 167.5 × 48 (flex stack 2 cột) |

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-prod-list/_full.png` | `21254:52585` | Section full 11 screens (4783×2337) — overview matrix tất cả state |

> **Per-screen PNG miss**: do `get_metadata` failed (TOO_LARGE), agent-test-ui dùng `_full.png` crop
> theo column 1-9 cho golden snapshot riêng per state. Recommend ưu tiên capture lại 9 frame riêng
> nếu fetch lại được node IDs.

---

## Notes (oracle interpretation)

1. **11 frame trong section** đại diện complete state matrix UI; map 1-1 sang BLoC states:
   `initial` · `loading` · `loaded(filterTab)` × 3 · `searching` · `searchEmpty` · `searchResults` ·
   `filterSheetOpen` · `filterDropdownExpanded` · `emptyList`.
2. **Sort/filter sticky state**: Screen 2 + 3 = filter tab persistence. Empty state (Screen 9) là
   "Không có dữ liệu" KHÁC với search empty "Không có kết quả phù hợp" → 2 widget khác nhau.
3. **No FAB "+"** — Figma không show button thêm sản phẩm trên màn list mobile. Verify FEAT có
   require add-from-list flow không (có thể nằm trong AppBar right cluster hoặc bottom sheet —
   không thấy trong Figma frame này).
4. **Search input mode**: Screen 4 + 6 cho thấy AppBar transform thành full TextField → KHÔNG phải
   icon → modal overlay. Implementer dùng `showSearch` hoặc inline AppBar replacement.
5. **Filter sheet** (Screen 7-8) = bottom sheet hoặc full-screen — Figma không clear. Có header
   "Bộ lọc" + 2 dropdown + footer 2 button → suggest bottom sheet modal (Material `showModalBottomSheet`)
   hoặc dedicated route. Implementer chọn theo FEAT AC.
6. **Token vocab consistent với FEAT-CAT-PROD-DETAIL** (cùng file App-Garage-V3) — không cần bóc lại.
7. **Data caveat repeated**: bóc 5-cấp dưới đây dựa visual + token vocab; component dimension chính
   xác (padding cardlist, card height) chỉ ước lượng — agent-test-ui kết hợp Flutter widget golden
   test (alchemist) tolerance ±2px khi compare snapshot.
