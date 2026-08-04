---
feat: FEAT-CAT-GRP-DETAIL
feat_file: Product/features/FEAT-CAT-GRP-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24248&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24248"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: cached (App-Garage-V3)
  get_design_context: success (frame 21254:51661)
  get_screenshot: success (2 PNG: _full + screen)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (1 active state + audit fields)
  text_content: complete (verbatim)
  design_tokens: complete
  interaction_states: partial
screenshots:
  - assets/wave03-cat-grp-detail/_full.png
  - assets/wave03-cat-grp-detail/21254-51661.png
---

# Oracle — FEAT-CAT-GRP-DETAIL (mobile) · wave 03

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter). Section `21555:24248`
> "FEAT-CAT-GRP-DETAIL" — màn "Chi tiết nhóm vật tư hàng hoá" read-only với header + audit fields
> + bottom action bar (Xoá / Sửa).

---

## Screen Inventory

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Chi tiết nhóm VTHH — Đang hoạt động (audit info) | `21254:51661` | 375×812 | `assets/wave03-cat-grp-detail/21254-51661.png` |
| (Aggregate) Section single screen | `21555:24248` | 4901×1112 | `assets/wave03-cat-grp-detail/_full.png` |

> Status bar 44 + AppBar "Chi tiết nhóm vật tư hàng hoá" 52 = 96 header. Body 612px (header card +
> audit fields card). Bottom action bar 104px.

---

## Component Inventory

### Screen — Chi tiết nhóm VTHH (`21254:51661`)

**Header chrome**
| Component | Brief | Flutter mapping |
|---|---|---|
| Status bar | h=44 system | `MediaQuery.padding.top` |
| AppBar (`Bars/Nav Bars: Standard`) | h=52, p=`px=16 py=8`, left back arrow, title center **"Chi tiết nhóm vật tư hàng hoá"** Semi Bold 16 `#262626` (NOTE: "hoá" có dấu sắc — KHÁC với CREATE/EDIT screen dùng "hóa") | `AppBar` |
| Bottom border | 1px solid `#e8e8ea` | `Border(bottom: ...)` |

**Body — Container** (`21254:51757`, py=16, w=375, flex column gap=20 center)
| Component | Brief | Flutter mapping |
|---|---|---|
| Header row (`21254:51758`, 343×42) | Left flex col: `NK240516-001` Bold 16 brand-CD `#0052ff` + "Ngày tạo: 21/07/2025 20:12" Caption C7 12 `#888c94` ↔ Right Badge "Đang hoạt động" h=26 bg `#f0fdf1` text `#15aa2c` | Row |
| Spacer divider | h=6 bg `#e8e8ea` w=375 | `Container(height: 6, color: AppColors.bgPrimary)` |
| FieldsList card (`21254:51764`, 343×200, flex col gap=12) | Title "Phụ tùng bảo dưỡng" Bold 20 `#262626` + 6 SummaryRow fields | Column |
| Button (hidden) | `Edit/Sửa` button trong FieldsList header — `hidden=true` (60×26) | (skip) |

**FieldsList rows** (`21254:51768`, w=343, gap=8 vertical)
| Row | Brief | Sample value |
|---|---|---|
| 1. Thuộc nhóm | Label "Thuộc nhóm:" Caption C5 14 Regular `#888c94` + value "Vật tư hàng hoá" Body B5 Medium 14 `#262626` | "Vật tư hàng hoá" |
| 2. Mô tả | Label "Mô tả:" + value "Nhóm phụ tùng thay thế định kỳ." | "Nhóm phụ tùng thay thế định kỳ." |
| 3. Ngày tạo | Label "Ngày tạo:" + value "10/10/2025 10:24" | "10/10/2025 10:24" |
| 4. Người tạo | Label "Người tạo:" + value "Nguyễn Ánh Tuyết" | "Nguyễn Ánh Tuyết" |
| 5. Ngày sửa | Label "Ngày sửa:" + value "10/10/2025 10:24" | "10/10/2025 10:24" |
| 6. Người sửa | Label "Người sửa:" + value "Nguyễn Ánh Tuyết" | "Nguyễn Ánh Tuyết" |

**Bottom action bar** (`21254:51680`)
| Component | Brief | Flutter mapping |
|---|---|---|
| Container | bg white, p=`px=16 pb=20 pt=16`, gap=8, radius top-left=8 top-right=8, shadow `0px -4px 12px rgba(0,0,0,0.06)` | `Container` |
| Button "Xoá " (secondary) | flex=1, bg `#eaeaea` (Dark/100), text `#273243` Bold 16, radius 8 (NOTE: trailing space `"Xoá "` — verbatim Figma) | `AppButton.text` secondary |
| Button "Sửa" (primary) | flex=1, bg `#0052ff`, text white Bold 16 | `AppButton.text` primary |
| Home indicator | bg=black w=134 h=4 radius=100 + container px=10 py=8 | `Container` |

---

## Variant & State

### `Badge` (Active status indicator)
- **Variant — Active**: bg `#f0fdf1` (`bg-Success`), text `#15aa2c` (`text-Success`) "Đang hoạt động", h=26, p=`px=8 py=4`, radius=8.
- **Inactive variant**: bg `#f3f3f4`, text `#888c94` "Ngưng hoạt động" — không có trong Figma frame này nhưng implementer flip theo `group.status`.

### FieldsList row (`SummaryRow`)
- **Variant**: 1 (label + value inline, both single line).
- **States**: static — read-only.

### Button (Xoá / Sửa)
- **Variant 1 — Xoá (secondary destructive intent)**: bg `#eaeaea`, text `#273243` Bold 16 (NOT red destructive — color giữ neutral; semantic destructive thực hiện trong action handler).
- **Variant 2 — Sửa (primary)**: bg `#0052ff`, text white Bold 16.
- **States**: default. `:pressed` ripple. Xoá có thể `:disabled` nếu group có ràng buộc data (trigger popover "Không thể xoá" — xem `wave03-cat-grp-delete-oracle.md`).

### Implicit state
- **Audit fields** (Ngày tạo/Người tạo/Ngày sửa/Người sửa) — display từ entity audit metadata.
- **"Edit" button hidden** trong FieldsList header (`21254:51767` hidden=true) — placeholder cho future inline edit; ignore.

---

## Text Content

> Verbatim từ `get_design_context(21254:51661)`.

### AppBar
- Title: **"Chi tiết nhóm vật tư hàng hoá"** (NOTE: "hoá" có dấu sắc — KHÁC với CREATE/EDIT/DELETE screens dùng "hóa" — verbatim Figma drift)

### Header
- Group code: **"NK240516-001"** (Bold 16 `#0052ff`)
- Created timestamp: **"Ngày tạo: 21/07/2025 20:12"** (Regular 12 `#888c94`)
- Badge: **"Đang hoạt động"** (Medium 12 `#15aa2c`)

### Body
- Group name: **"Phụ tùng bảo dưỡng"** (Bold 20 `#262626`)
- Row 1 label: **"Thuộc nhóm:"** + 2-space gap + value **"Vật tư hàng hoá"** (Medium 14)
- Row 2 label: **"Mô tả:"** + 2-space gap + value **"Nhóm phụ tùng thay thế định kỳ."**
- Row 3 label: **"Ngày tạo:"** + 2-space gap + value **"10/10/2025 10:24"**
- Row 4 label: **"Người tạo:"** + 2-space gap + value **"Nguyễn Ánh Tuyết"**
- Row 5 label: **"Ngày sửa:"** + 2-space gap + value **"10/10/2025 10:24"**
- Row 6 label: **"Người sửa:"** + 2-space gap + value **"Nguyễn Ánh Tuyết"**

### Bottom buttons
- **"Xoá "** (trailing space verbatim — `text-[#273243]` text-center, secondary)
- **"Sửa"** (primary)

> **Verbatim trap**: row text dùng `whitespace-pre` với "2-space" gap label↔value (`{`  `}`).
> Implementer dùng `Text.rich` với 2 TextSpan label (color tertiary) + value (color primary) thay
> vì Row 2-col, hoặc `RichText` với non-breaking space. KHÔNG paraphrase thành "Thuộc nhóm: Vật tư
> hàng hoá" single string vì font weight + color khác nhau.
>
> **Header vs row drift**: header "Ngày tạo: 21/07/2025 20:12" hardcoded prefix "Ngày tạo:" vs row 3
> cũng "Ngày tạo:" với value "10/10/2025 10:24" — sample data inconsistent (2 ngày khác nhau cho
> same field). Likely Figma mock; real impl bind single value.

---

## Design Tokens

> **Cached from `get_variable_defs(21555:24017)`** sibling.

### Colors

| Hex | Role | Token |
|---|---|---|
| `#ffffff` | Body bg | `AppColors.bgBase` |
| `#262626` | Group name "Phụ tùng bảo dưỡng", row value, AppBar title | `AppColors.textPrimary` |
| `#273243` | Button "Xoá " text | `AppColors.textPrimary` (alias) |
| `#888c94` | Row label "Thuộc nhóm:" etc., header timestamp | `AppColors.textTertiary` |
| `#0052ff` | Group code "NK240516-001", "Sửa" button bg | `AppColors.textActivePrimary` / `buttonBackgroundPrimary` |
| `#15aa2c` | Badge text "Đang hoạt động" | `AppColors.textSuccessPrimary` |
| `#f0fdf1` | Badge bg | `AppColors.bgBadgeSuccess` |
| `#e8e8ea` | Spacer divider 6px | `AppColors.bgPrimary` |
| `#eaeaea` | "Xoá " button bg | (Dark/100 — drift) |
| `#000000` | Home indicator | `BaseColor.black` |

### Typography

| Style | Used at | Token |
|---|---|---|
| `Heading/H2` Inter Bold 20/28 | Group name "Phụ tùng bảo dưỡng" | `AppTextStyle.textHeadingH2` |
| `Heading/H4` Bold 16/24 | Group code "NK240516-001", button text "Xoá "/"Sửa" | `AppTextStyle.textHeadingH4` |
| `Subtitle/S4` SB 16/24 | AppBar title | `AppTextStyle.textSubtitleS4` |
| `Body/B5` Med 14/20 | Row value (Vật tư hàng hoá / Nhóm phụ tùng thay thế định kỳ / 10/10/2025 10:24 / Nguyễn Ánh Tuyết) | `AppTextStyle.textBodyB5` |
| `Body/B7` Med 12/18 | Badge "Đang hoạt động" text | `AppTextStyle.textBodyB7` |
| `Caption/C5` Reg 14/20 | Row label "Thuộc nhóm:"/"Mô tả:"/"Ngày tạo:"/... | `AppTextStyle.textCaptionC5` |
| `Caption/C7` Reg 12/18 | Header "Ngày tạo: 21/07/2025 20:12" | `AppTextStyle.textCaptionC7` |

### Spacing

| Element | Value | Token |
|---|---|---|
| Body outer | `py=16`, container w=375 centered | `EdgeInsets.symmetric(vertical: 16)` |
| Body flex col gap | `gap=20` between Header row ↔ FieldsList card | `Gap(20)` (literal — not in scale) |
| Header row | w=343, gap=8 between text col ↔ badge | `Gap(AppSizes.spacing8)` |
| Header inner text col | gap=0 between code line ↔ timestamp line | `Gap(AppSizes.zeroSize)` |
| FieldsList card | w=343, gap=12 between title ↔ rows list | `Gap(AppSizes.spacing12)` |
| Rows list inner gap | `gap=8` vertical between rows | `Gap(AppSizes.spacing8)` |
| Spacer divider | h=6 | `Container(height: 6)` |
| Bottom bar | `px=16 pb=20 pt=16`, gap=8 buttons | mixed |
| Badge | `px=8 py=4` | `EdgeInsets.symmetric(horizontal: 8, vertical: 4)` |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| Card border | none | — |
| Card radius | none (flat — body uses spacer divider instead of card outline) | — |
| Badge radius | 8 | `BorderRadius.circular(8)` |
| Button radius | 8 | `BorderRadius.circular(8)` |
| Bottom bar top radius | 8 (both top corners) | `BorderRadius.only(topLeft: 8, topRight: 8)` |
| Bottom bar shadow | `0px -4px 12px rgba(0,0,0,0.06)` | `BoxShadow(...)` |
| AppBar bottom border | 1px solid `#e8e8ea` | `Border(bottom: ...)` |

### Icons

| Name | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20×20 | `#262626` | AppBar back |

> KHÔNG có dropdown chevron / form input → ít icon hơn CREATE/EDIT.

### Bounds

| Element | W × H |
|---|---|
| Screen frame | 375 × 812 |
| AppBar | 375 × 52 |
| Body container | 375 × 320 (header + spacer + fields list, vertical center py=16) |
| Header row | 343 × 42 |
| FieldsList card | 343 × 200 (title 28 + gap 12 + rows 160) |
| Each row | 343 × 20 (single line text) |
| Bottom action bar | 375 × 104 |
| Button | (375-16-16-8)/2 ≈ 167.5 × 48 |

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-grp-detail/_full.png` | `21555:24248` | Section full single screen (4901×1112) |
| `assets/wave03-cat-grp-detail/21254-51661.png` | `21254:51661` | Screen — Chi tiết nhóm VTHH (375×812, golden reference) |

---

## Notes (oracle interpretation)

1. **AppBar title drift "hoá" vs "hóa"**: DETAIL screen dùng "hàng hoá" (dấu sắc trên o), CREATE/EDIT
   dùng "hàng hóa" (dấu sắc trên a). Đây là Figma drift — agent-test-ui flag để BA chuẩn hoá ARB.
2. **No card outline** — body design dùng flat layout với spacer 6px divider thay vì card border.
   Khác với product DETAIL screen (`wave03-cat-prod-detail-oracle.md`) dùng nhiều card với radius 12.
3. **"Edit" button hidden** trong row header (`21254:51767`) — có thể là placeholder inline-edit
   pattern legacy. Ignore.
4. **Row format `Text.rich` with 2-space gap**: Verbatim trap — KHÔNG dùng 2-col Row (label flex
   left + value flex right) vì Figma render label+value cùng wrap inline với 2-space gap.
5. **Group name as H2 (20px Bold)** — section heading, larger hơn product DETAIL (Subtitle S4 16
   SemiBold). FEAT yêu cầu group name prominent hơn product name.
6. **"Xoá " trailing space** verbatim Figma — implementer dùng exact string trong AppLocalizations
   để tránh test wording fail.
7. **Audit fields role** — display only. Permission check (chỉ owner / admin xem ngày sửa?) — flag
   BA. Time format "DD/MM/YYYY HH:MM" verbatim — verify timezone handling (local vs UTC).
8. **Tap "Xoá " → opens popover** "Xác nhận" hoặc "Không thể xoá" — xem `wave03-cat-grp-delete-oracle.md`
   cho luồng tiếp theo.
9. **Tap "Sửa" → navigate sang FEAT-CAT-GRP-EDIT** (`wave03-cat-grp-edit-oracle.md`) với pre-filled
   data.
