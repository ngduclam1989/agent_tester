---
feat: FEAT-CAT-PROD-DETAIL
feat_file: Product/features/FEAT-CAT-PROD-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24017&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24017"
fetched_at: 2026-06-29T03:13:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (section + 2 child screen frames)
  get_variable_defs: success
  get_design_context: success (frame 21526:45088 — primary canonical "Đang hoạt động")
  get_screenshot: success (3 PNG: _full + 2 screen-state PNGs)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (2 state variants — Đang hoạt động / Ngưng hoạt động)
  text_content: complete (verbatim từ design_context)
  design_tokens: complete (variable_defs)
  interaction_states: partial (Figma không render :pressed/:hover; suy theo Flutter Material baseline)
screenshots:
  - assets/wave03-cat-prod-detail/_full.png
  - assets/wave03-cat-prod-detail/21526-45088.png
  - assets/wave03-cat-prod-detail/21528-24629.png
---

# Oracle — FEAT-CAT-PROD-DETAIL (mobile) · wave 03

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter). 5-cấp: Screen Inventory ·
> Component Inventory · Variant & State · Text Content · Design Tokens.
>
> **Figma SSOT**: file `5YU4H3iY726P8KNxI9oCYF` (App-Garage-V3), section `21555:24017`
> "FEAT-CAT-PROD-DETAIL". Section có **2 screen state** (Đang hoạt động · Ngưng hoạt động) —
> read-only màn chi tiết sản phẩm với 4 section cards (Header info · Thông tin chung · Thông số kĩ
> thuật · Quy cách mô tả).

---

## Screen Inventory

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Chi tiết sản phẩm — Đang hoạt động (badge xanh `#15aa2c`) | `21526:45088` | 375×812 | `assets/wave03-cat-prod-detail/21526-45088.png` |
| Chi tiết sản phẩm — Ngưng hoạt động (badge xám `#888c94`/`#f3f3f4`) | `21528:24629` | 375×812 | `assets/wave03-cat-prod-detail/21528-24629.png` |
| (Aggregate) Section full layout 2 screens side-by-side | `21555:24017` | 4774×1140 | `assets/wave03-cat-prod-detail/_full.png` |

> Status bar (`44px`) + Nav bar header "Sản phẩm" (`52px`) → tổng header 96px. Body 680px scroll
> region. Bottom indicator iOS home bar 20px. Bg toàn screen = `AppColors.bgSecondary` (`#f3f3f4`).
> 4 ProductInfomation card layered top→bottom, mỗi card bg trắng radius 12.

---

## Component Inventory

> Nguồn: `get_metadata(21555:24017)` + `get_design_context(21526:45088)`.

### Screen 1 — Đang hoạt động (`21526:45088`)

| Figma component | Số lượng | Brief | Flutter mapping (expected) |
|---|---|---|---|
| Status bar (Native / Status Bar) | 1 | h=44, system clock + signal + wifi + battery | `MediaQuery.padding.top` |
| AppBar (`Bars / Nav Bars: Standard`, mode=white) | 1 | h=52, title "Sản phẩm" center Semi Bold 16, left back arrow `vuesax/linear/arrow-left` 20px, right `vuesax/linear/copy` 20px (đoán: nhân bản/copy code SP) | `AppBar` / `custom_app_bar.dart` |
| Card "ProductInfomation" / Header (`21526:45090`) | 1 | h=152, p=16, radius=12, bg white. InformationSection 311×54 + Line + AttributesRows (2 col: ĐVT/Thương hiệu) | `Container` w/ `BoxDecoration` |
| InformationSection (header inside card 1) | 1 | Row [`#IP-BP-0001` Bold 16 brand-CD ↔ Badge "Đang hoạt động" h=26 bg `#f0fdf1` text `#15aa2c`] + "Lọc dầu động cơ Toyota" Semi Bold 16 màu `#262626` | Custom widget |
| Line divider (`Line` 1px) | 4 (1/card) | w=311 h=0 (1px border-top) | `Divider(height: 1)` |
| AttributesField (2-col row) | 5 instance | flex(1) col with label C7 12px tertiary + value B5 14px primary; gap=4 vertical | Custom |
| Card "Thông tin chung" (`21526:45105`) | 1 | h=176, p=16, radius=12, SectionTitle 127×24 + Line + 2× AttributesRows (4 fields) | `Container` |
| Card "Thông số kĩ thuật" (`21526:45123`) | 1 | h=120, p=16, radius=12, SectionTitle 136×24 + Line + AttributesRows 1 field (mô tả 1 dòng) | `Container` |
| Card "Quy cách mô tả" (`21526:45130`) | 1 | h=176, p=16, radius=12, SectionTitle 121×24 + Line + 2× AttributesField (Quy cách + Mô tả) | `Container` |
| Home indicator (iOS bottom bar) | 1 | bg=black, w=134 h=4 radius=100 | `Container` |

### Screen 2 — Ngưng hoạt động (`21528:24629`)

| Figma component | Số lượng | Brief | Flutter mapping |
|---|---|---|---|
| (Identical structure với Screen 1) | — | Chỉ KHÁC ở badge "Ngưng hoạt động" trong InformationSection — bg xám `#f3f3f4` (`bg-Open`/`bg-Secondary`) + text xám `#888c94` Subtitle S7 12px | (reuse) — biến `status` flip variant |
| Badge "Ngưng hoạt động" | 1 | h=26, p=4/8, radius=8 | Badge widget — `state=inactive` variant |

> **Cấu trúc 4 card identical**, chỉ Header card và Badge khác. Implementer: 1 widget tree, badge =
> derived prop từ `product.status`. KHÔNG có scroll indicator / FAB / bottom action bar (read-only).

---

## Variant & State

### `BarsNavBarsStandard` (`Bars / Nav Bars: Standard`)
- **Variants observed**: `action="Tilte"`, `leftAction=true`, `leftAction1="Icon"` (arrow-left), `mode="white"`, `rightAction=true`, `rightAction1="Icon"` (copy), `text=true`, `title="Sản phẩm"`.
- **States**: default only (no pressed/disabled trong Figma).

### Badge "Đang hoạt động" / "Ngưng hoạt động" (`Badge` inside `InformationSection`)
- **Variant 1 — Active**: bg `#f0fdf1` (`bg-Success`), text `#15aa2c` (`text-Success`) "Đang hoạt động", Body B7 (Medium 12/18). Padding `px=8 py=4`, radius=8.
- **Variant 2 — Inactive**: bg `#f3f3f4` (`bg-Secondary` = `bg-Open`), text `#888c94` (`text-Tertiary` — confirm by visual) "Ngưng hoạt động". Same dimensions.
- **Tap state**: N/A (decorative).

### ProductInfomation Card
- **Variant**: 1 only (default). Border none, bg white `#ffffff`, radius=12, p=16.
- **States**: default only — no hover/pressed (read-only screen).

### AttributesField (label + value)
- **Variant 1 — 2-col flex (`flex:1 1 0`)**: w split equally (149.5×42). Label `Caption/C7` 12px `#888c94`, value `Body/B5` 14px Medium `#262626`. Gap=4 vertical.
- **Variant 2 — 1-col full-width**: w=311 (full), 1 col stacked. Used for "Thông số kĩ thuật" (single long value) + "Quy cách"/"Mô tả" sections.
- **No state**: read-only display.

### Line divider
- **Variant**: 1 — 1px horizontal, color `#e8e8ea` (`border-Primary`).

---

## Text Content

> Verbatim từ `get_design_context(21526:45088)` — tiếng Việt có dấu.

### Header card (`21526:45090`)
- Product code: **"#IP-BP-0001"** (prefix "#" + code; both Bold 16, brand-CD `#0052ff`)
- Badge text: **"Đang hoạt động"** (Screen 1) / **"Ngưng hoạt động"** (Screen 2)
- Product name: **"Lọc dầu động cơ Toyota"** (Semi Bold 16, color `#262626`)
- Label: **"ĐVT"** / Value: **"Cái"**
- Label: **"Thương hiệu"** / Value: **"Toyota"**

### Card "Thông tin chung" (`21526:45105`)
- Section title: **"Thông tin chung"** (Semi Bold 16 `#262626`)
- Label: **"Tính chất"** / Value: **"Vật tư hàng hoá"**
- Label: **"Nhóm"** / Value: **"Phụ tùng bảo dưỡng"**
- Label: **"Xuất xứ"** / Value: **"Trung Quốc"**
- Label: **"Phương pháp tính giá"** / Value: **"Bình quân cuối kỳ"**

### Card "Thông số kĩ thuật" (`21526:45123`)
- Section title: **"Thông số kĩ thuật"** (Semi Bold 16, NOTE: "kĩ" có dấu mũ — verbatim Figma; KHÔNG phải "kỹ")
- Body value (no label): **"Đường kính 68mm, ren M20x1.5, chiều cao 75mm."**

### Card "Quy cách mô tả" (`21526:45130`)
- Section title: **"Quy cách mô tả"** (Semi Bold 16)
- Label: **"Quy cách"** / Value: **"Lọc dầu động cơ dùng cho Toyota Vios/Altis"**
- Label: **"Mô tả"** / Value: **"Phụ tùng bảo dưỡng định kỳ..."** (truncate ellipsis trong Figma)

### Nav bar
- Title: **"Sản phẩm"** (Semi Bold 16 center `#273243`)

> **Mock data**: tất cả giá trị trên là sample Figma. Real impl bind từ response API (productCode,
> productName, status, unitOfMeasure, brand, productNature, productGroup, origin, costingMethod,
> technicalSpec, specification, description).

---

## Design Tokens

### Colors (from `get_variable_defs(21555:24017)`)

| Figma variable | Hex | Role / where used | Expected Flutter token |
|---|---|---|---|
| `Base/bg-Base` | `#ffffff` | Card bg | `AppColors.bgBase` |
| `Base/bg-Secondary` | `#f3f3f4` | Screen bg + badge inactive bg | `AppColors.bgSecondary` |
| `Base/bg-Open` | `#f3f3f4` | (alias) badge inactive bg | `AppColors.bgSecondary` |
| `Base/bg-Success` | `#f0fdf1` | Badge "Đang hoạt động" bg | `AppColors.bgBadgeSuccess` |
| `Base/text-CD Garage` | `#262626` | Product name, section title, value text | `AppColors.textPrimary` |
| `Base/text-Primary` | `#273243` | Nav bar title text | `AppColors.textPrimary` (note: 2 hex variants — `#262626` vs `#273243`; tách theo nhóm semantic) |
| `Base/text-Tertiary` | `#888c94` | AttributesField label (Caption C7) | `AppColors.textTertiary` |
| `Base/text-Active-Primary-CD Garage` | `#0052ff` | Product code `#IP-BP-0001` brand-CD | `AppColors.textActivePrimary` |
| `Base/text-Success` | `#15aa2c` | Badge "Đang hoạt động" text | `AppColors.textSuccessPrimary` |
| `Base/border-Primary` | `#e8e8ea` | Line divider 1px | `AppColors.borderPrimary` |
| `Neutral/Black` | `#000000` | Home indicator iOS bar | `BaseColor.black` |
| `Color/Base/white` | `#ffffff` | Card bg | `AppColors.bgBase` |
| `Dark/800` | `#2E2E2E` | (legacy — unused trong canonical screen) | — |

### Typography

| Figma style | Spec | Used at | Expected Flutter token |
|---|---|---|---|
| `Heading/H4` | Inter Bold 16/24 ls=0 | Product code `#IP-BP-0001` Bold 16 | `AppTextStyle.textHeadingH4` |
| `Subtitle/S4` | Inter Semi Bold 16/24 | Product name "Lọc dầu...", section titles "Thông tin chung"/"Thông số kĩ thuật"/"Quy cách mô tả", AppBar title "Sản phẩm" | `AppTextStyle.textSubtitleS4` |
| `Subtitle [NEW]/S4` | (alias Subtitle/S4) | — | `AppTextStyle.textSubtitleS4` |
| `Body/B5` | Inter Medium 14/20 | AttributesField value, single value (Thông số kĩ thuật) | `AppTextStyle.textBodyB5` |
| `Body/B7` | Inter Medium 12/18 | Badge "Đang hoạt động" text | `AppTextStyle.textBodyB7` |
| `Caption/C7` | Inter Regular 12/18 | AttributesField label (ĐVT/Thương hiệu/Tính chất/Nhóm/Xuất xứ/...) | `AppTextStyle.textCaptionC7` |
| `Regular/None/Medium` | Inter Medium 16/16 | Status bar time "9:41" | (system) |

### Spacing

| Element | Value | Token |
|---|---|---|
| Screen edge padding (DetailContent) | `EdgeInsets.all(16)` | `AppSizes.spacing16` |
| Gap giữa các ProductInfomation card | `gap=8` vertical | `Gap(AppSizes.spacing8)` |
| Card inner padding | `p=16` all sides | `EdgeInsets.all(AppSizes.spacing16)` |
| Card inner gap (giữa rows) | `gap=12` vertical | `Gap(AppSizes.spacing12)` |
| AttributesRows gap (between 2 cols) | `gap=12` horizontal | `Gap(AppSizes.spacing12)` |
| AttributesField inner gap (label↔value) | `gap=4` vertical | `Gap(AppSizes.spacing4)` |
| InformationSection inner gap | `gap=4` vertical | `Gap(AppSizes.spacing4)` |
| Badge padding | `px=8 py=4` | `EdgeInsets.symmetric(horizontal: 8, vertical: 4)` |
| AppBar padding | `px=16 py=8` | `EdgeInsets.symmetric(horizontal: 16, vertical: 8)` |
| Home indicator container padding | `px=10 py=8` | literal |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| Card border | none | — |
| Card radius | `12px` (`Spacing - Border/12`) | `BorderRadius.circular(12)` |
| Badge radius | `8px` | `BorderRadius.circular(8)` |
| Home indicator radius | `100px` (rounded pill) | `BorderRadius.circular(100)` |
| AppBar bottom border | `1px solid #e8e8ea` (`border-Primary`) | `Border(bottom: BorderSide(color: AppColors.borderPrimary, width: 1))` |
| Line divider | `1px solid #e8e8ea` h=0 (1px border-top trên empty container) | `Divider(height: 1, color: AppColors.borderPrimary)` |
| Shadow | none on cards | — |

### Icons

| Name (Figma asset) | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20×20 | `#262626` | AppBar back button |
| `vuesax/linear/copy` | 20×20 | `#262626` | AppBar right action (copy code SP — đoán; FEAT cần xác nhận semantic) |

### Bounds (key dimensions)

| Element | W × H |
|---|---|
| Screen frame | 375 × 812 |
| Header chrome (status + nav) | 375 × 96 |
| DetailContent container | 375 × 680 |
| ProductInfomation card | 343 × variable (152 / 176 / 120 / 176) |
| Inner content (after p=16) | 311 × variable |
| InformationSection | 311 × 54 |
| AttributesField (2-col) | 149.5 × 42 |
| AttributesField (1-col full) | 311 × 40 hoặc 42 |
| Badge "Đang hoạt động" | ~108 × 26 |
| Home indicator | 134 × 4 |

---

## Screenshots

> PNG lưu tại `Product/ux/figma-test-mobile/assets/wave03-cat-prod-detail/`.

| Asset path | Node (Figma) | Brief |
|---|---|---|
| `assets/wave03-cat-prod-detail/_full.png` | `21555:24017` | Section full — 2 screens side-by-side (4774×1140) |
| `assets/wave03-cat-prod-detail/21526-45088.png` | `21526:45088` | Screen 1 — Đang hoạt động (375×812, golden reference) |
| `assets/wave03-cat-prod-detail/21528-24629.png` | `21528:24629` | Screen 2 — Ngưng hoạt động (375×812, golden reference cho badge variant) |

---

## Notes (oracle interpretation)

1. **Read-only screen** — không có form input, không edit action. Bottom area chỉ có iOS home
   indicator (status bar mock); KHÔNG có FAB / bottom action bar (verify FEAT AC).
2. **2 status variant** = source-of-truth cho badge state mapping (active/inactive). Implementer
   PHẢI flip cả badge bg + text color theo `product.status`.
3. **AppBar right icon `copy`** — Figma không có FEAT description; có thể: (a) copy product code to
   clipboard, (b) duplicate product, (c) share. Agent-test-ui flag để BA/PO confirm semantic.
4. **Section "Thông số kĩ thuật"** dùng 1-col full-width (không phải 2-col) vì value dài 1 dòng.
   Implementer phải render single text widget, KHÔNG label/value 2-col pattern.
5. **Section "Quy cách mô tả"** có 2 field full-width (Quy cách + Mô tả) — cùng pattern 2-col label
   inside nhưng wrapped 100% width row, không split cột.
6. **"Mô tả"** trong Figma bị truncate "Phụ tùng bảo dưỡng định kỳ..." — agent-test-ui flag wrapping
   strategy (truncate vs expand-on-tap) — FEAT cần specify.
7. **Token alias warning**: `Base/bg-Open` = `Base/bg-Secondary` = `#f3f3f4`. `Subtitle [NEW]/S4`
   = `Subtitle/S4`. Implementer dùng semantic name nhất quán.
8. **Hex drift**: `#262626` vs `#273243` cùng map `AppColors.textPrimary` — 2 token khác nhau trong
   palette. Verify Flutter codebase chọn token nào cho nav bar title vs body content.
