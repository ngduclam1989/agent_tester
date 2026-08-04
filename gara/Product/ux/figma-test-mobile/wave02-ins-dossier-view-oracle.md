---
feat: FEAT-INS-DOSSIER-VIEW
feat_file: Product/features/FEAT-INS-DOSSIER-VIEW.md
wave_feat_file: Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-VIEW.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-43731&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "319:43731"
fetched_at: 2026-06-18T07:13:34+00:00
oracle_version: 1
screenshots:
  - assets/wave02-ins-dossier-view/_full.png
  - assets/wave02-ins-dossier-view/410-27794.png
  - assets/wave02-ins-dossier-view/410-27598.png
  - assets/wave02-ins-dossier-view/410-27966.png
  - assets/wave02-ins-dossier-view/410-27804.png
  - assets/wave02-ins-dossier-view/410-27845.png
  - assets/wave02-ins-dossier-view/410-27849.png
  - assets/wave02-ins-dossier-view/410-28015.png
  - assets/wave02-ins-dossier-view/410-28077.png
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success
  get_screenshot: success
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (Figma render chỉ có 1 active variant — selected highlight cho card, loading/error/skeleton state không có trong frame; suy từ FEAT AC + wave-spec §4.2)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (Figma không show pressed/hover variant — chỉ default state; tap target verified từ AppBar/tab/button bounds)
---

# Oracle — FEAT-INS-DOSSIER-VIEW · Tab "Hồ sơ bảo hiểm đã xuất" (mobile)

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter). 5-cấp: Screen Inventory ·
> Component Inventory · Variant & State · Text Content · Design Tokens.
>
> **Figma SSOT**: file `nAoFS33sTWj3ctWjZMUDEl` (App GMS v3 — New Design), section `319:43731`
> "FEAT-INS-DOSSIER-VIEW". Frame có **3 screen state** (Loaded · PDF Preview · Empty) + bộ section
> shared (AppBar, Tab bar, Bottom action bar). Toàn bộ dữ liệu Cấp 1-5 dưới đây verbatim từ Figma
> (`get_metadata` + `get_variable_defs` + `get_design_context`); 9 screenshot PNG (`_full.png` +
> 8 section PNG) phục vụ golden snapshot.
>
> **⚠️ Drift findings nhiều — xem `## Figma Drift Notes` cuối file.** Wave-spec mobile §11.1 ARB +
> §3 AC-mapping có 6+ wording/layout drift vs Figma. Agent-test-ui PHẢI flag drift khi verify
> implementation (FEAT spec / wave-spec / Figma không đồng bộ — BA/PO reconcile required).

---

## Screen Inventory

> Nguồn: `get_metadata(319:43731)` — section chứa 3 child frame screen-state. Mỗi frame 375×variable
> (iPhone reference) với status bar + AppBar shared.

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Tab "Hồ sơ bảo hiểm đã xuất" — Loaded (2 bộ hồ sơ, mỗi bộ 4 PDF cards stacked vertically) | `410:27794` | 375×1395 (scroll) | `assets/wave02-ins-dossier-view/410-27794.png` |
| Màn "Xem chi tiết hồ sơ" — PDF Preview full-page (sau khi tap card) | `410:27598` | 375×812 | `assets/wave02-ins-dossier-view/410-27598.png` |
| Tab "Hồ sơ bảo hiểm đã xuất" — Empty state ("Không tồn tại bản ghi!") | `410:27966` | 375×812 | `assets/wave02-ins-dossier-view/410-27966.png` |
| (Aggregate) Toàn bộ 3 screens layout side-by-side | `319:43731` | 1467×1840 (section) | `assets/wave02-ins-dossier-view/_full.png` |

> Screen state **Loading / Error** KHÔNG có frame riêng trong Figma — wave-spec §4.2 yêu cầu
> `initial | loading | loaded | empty | error` (5 state). Loading/Error visual phải fallback baseline
> (`CircularProgressIndicator` của Flutter Material / `firstPageErrorIndicatorBuilder` của
> `infinite_scroll_pagination`).

---

## Component Inventory

> Nguồn: `get_design_context(410:27794, 410:27966, 410:27598, 410:27845, 410:27804)` — XML hierarchy
> + reference code (JSX). Mapping sang Flutter widget catalog `gf-garage-app` theo
> `_ref-mobile-transform-figma.md §1.5`.

### Screen 1 — Loaded state (`410:27794`)

| Figma component | Số lượng | Brief | Flutter mapping (expected) |
|---|---|---|---|
| Status bar (Native / Status Bar `9:41` + signal/wifi/battery) | 1 | Height 44px, system bar | `MediaQuery.padding.top` (no custom widget) |
| Nav bar / Action bar (`Bars / Nav Bars: Standard`) | 1 | Height 52px, title center "Chi tiết phiếu quyết toán", left back arrow (vuesax/linear/arrow-left 20px), right more icon (vuesax/linear/more 20px) | `AppBar` (custom_app_bar) |
| Card "Info DV + Phiếu quyết toán" (header `#PHDV-...` + badge "Đã thanh toán" + meta) | 1 | Header info phiếu QT | Existing widget — out of scope feature mới |
| Spacer divider (bg-primary `#e8e8ea`, h=6px) | 3 | Section separator giữa cards | `Container(height: 6, color: AppColors.bgPrimary)` |
| Card "Info KH/ View" — "Thông tin khách hàng" | 1 | Collapse card | Existing widget |
| Card "Info xe/ View" — "Thông tin xe" | 1 | Collapse card | Existing widget |
| Tab bar (`Tabs - 2`, 4 tabs) | 1 | "Bảng chi phí · Chứng từ & hóa đơn · **Hồ sơ bảo hiểm đã xuất** (active) · Lịch sử thanh toán" — underline indicator dưới tab active | `TabBar` (Material) hoặc custom — width fit-content, scroll horizontal |
| Section "Nhóm A — Tab Hồ sơ bảo hiểm đã xuất" (`410:27845`) — container của tab content | 1 | padding `pb=16 pt=8 px=16`, gap=16 giữa các "Bộ hồ sơ" blocks | `Column(padding: EdgeInsets.fromLTRB(16, 8, 16, 16))` |
| "Bộ hồ sơ" header block (`410:27847`, `410:27904`) | 2 (mỗi bộ hồ sơ) | Title 18px Bold + subtitle 14px Regular | `Column` (gap=8) |
| **PDF card** (`410:27849`, `410:27862`, `410:27875`, `410:27890` × set 1; `738:28604`/`28614`/`28624`/`28636` × set 2) | 4 cards/set × 2 sets = 8 total | Container card 343×76, p=16, border solid + radius 12, **stacked vertically (NOT 2-col grid)** | `AppCard` (NEW) hoặc Container with InkWell |
| PDF badge — circular tag (`410:27851`, ...) | 4 × 2 = 8 | bg=`#f4f7fe` (dialog-primary-bg), size=44×44, p=10, rounded full (radius 9999) | `Container(decoration: BoxDecoration(color: ..., shape: BoxShape.circle))` |
| File name text (`410:27854`, ...) | 8 | Inter Bold 14px, color `#172554` (blue/950) | `Text` style=`AppTextStyle.textHeadingH5` ~ approx (need custom — see §Drift) |
| File size text (`410:27856`, ...) | 8 | Inter Regular 12px, color `#595e69` (text-secondary) | `AppTextStyle.textCaptionC7` |
| Eye icon (vuesax/bold/eye, `410:27861`...) | 8 | size 20×20, position absolute left=306 top=32 (right-aligned trong card 343×76) | `Icon(SvgPicture vuesax_bold_eye, size: 20)` |
| Bottom action bar (`410:28072`) | 1 (only empty state shows; Loaded shows "Chỉnh sửa phiếu" + same 2 buttons) | px=16 py=8 + button "Chỉnh sửa phiếu" (secondary, edit icon) + "Tạo hồ sơ bảo hiểm" + "Thanh toán" | `BottomSheet` / `Container` w/ `AppButton` |

### Screen 2 — PDF Preview (`410:27598`)

| Figma component | Số lượng | Brief | Flutter mapping |
|---|---|---|---|
| Status bar + Nav bar | 1 ea | Title center "Xem chi tiết hồ sơ", back arrow left | `AppBar` |
| Section "Nhóm B — Preview file PDF" (`410:27599`) container | 1 | px=16, content area | `Padding + Column` |
| PDF content container (`410:27601` "AC-4 Preview file PDF được chọn") | 1 | bg=white, p=16, w=343 h=485 (PDF rendered area) | `Container` |
| Garage header info (tên + địa chỉ + liên hệ + MST + email) | 1 group | Inter, 14-16px Bold/Regular, color `#262626` | Pure text widgets |
| "PHIẾU DỊCH VỤ" title | 1 | Inter Bold 16px center | `Text` |
| Customer info section (Tên KH / Địa chỉ / SĐT) | 1 | Inter Regular 14px | `Text` rows |
| Vehicle info table | 1 | Header row: Hãng xe / Dòng xe / Đời xe / Phiên bản / Số VIN / BKS / Số km / Ngày nhận xe / Ngày giao dự kiến | Custom Table |
| Service list table | 1 | STT / Tên CV / SL / Đơn giá / Thành tiền / Chiết khấu / Thuế / Tổng tiền | Custom Table |
| Parts table | 1 | STT / Tên PT / ĐVT / SL / ... | Custom Table |
| Totals section | 1 | Thành tiền / Tổng tiền chiết khấu / Tổng tiền thuế / Tổng tiền | Pure text rows |
| Signature row | 1 | "Khách hàng" left + "Cố vấn dịch vụ" right | Row |
| Bottom action — "Tải xuống tệp" button (full-width primary) | 1 | bg=#0052ff, text white Bold 16, p=16 | `AppButton.text` size=large color=primary |

### Screen 3 — Empty state (`410:27966`)

| Figma component | Số lượng | Brief | Flutter mapping |
|---|---|---|---|
| Status bar + Nav bar | 1 ea | Title "Chi tiết phiếu quyết toán" | `AppBar` |
| Same Card "Info DV / Info KH / Info xe" stack | 1 group | Identical với Loaded screen 1 | (reuse) |
| Tab bar (4 tabs, "Hồ sơ bảo hiểm đã xuất" active) | 1 | Identical với Loaded | `TabBar` |
| Empty state illustration (`410:28017` — image group, 196×196 px) | 1 | Stylized PDF stack with "?" mark — SVG art | `SvgPicture.asset(empty_dossier.svg)` (asset cần upload — get_design_context trả 22 sub-group SVG asset URLs) |
| Empty state title (`410:28070`) | 1 | "Không tồn tại bản ghi!" — Inter Semi Bold 16/24, color `#262626` | `Text` style=`AppTextStyle.textSubtitleS4` |
| Empty state subtitle (`410:28071`) | 1 | "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." — Inter Regular 12/18, color `#888c94` (text-tertiary), width 280px center | `Text` style=`AppTextStyle.textCaptionC7` |
| Bottom — "Chỉnh sửa phiếu" button (secondary) | 1 | bg=`#f3f3f4` (bg-secondary), edit icon 16+text Inter Semi Bold 14 color `#273243` (text-primary), radius 8 | `AppButton.textIcon` size=small color=`.custom(bgColor: bg-secondary, fgColor: text-primary)` |
| Bottom action bar 2-button stack (`410:28077`) | 1 | Same as Screen 1 — "Tạo hồ sơ bảo hiểm" (secondary outline `#edf7ff`/text `#0052ff`) + "Thanh toán" (primary fill `#0052ff`/text white) | 2× `AppButton.text` (large) |
| Home indicator (iOS bottom bar) | 1 | bg=black, w=134 h=4 radius=100 | `Container` |

---

## Variant & State

### Tab bar (`410:27804`)
- **Variants**: 4 tab items (`_Partials / Tabs 1` non-active + `_Partials / Tabs 2` non-active + `_Partials / Tabs 1` active + `_Partials / Tabs 1` non-active).
- **Active state** (3rd tab "Hồ sơ bảo hiểm đã xuất"): border-bottom 2px solid `#0052ff` (`base/border-active-cd`), text color `#0052ff` (`base/text-active-primary-cd`), weight Medium (500).
- **Non-active state**: no underline, text color `#262626` (`base/text-cd-garage`) or `#273243` (Neutral/s900) for first tab, weight Regular (400).
- **Padding** per tab: `px=4 py=12`.
- **Tap target**: full tab area; horizontal scroll if overflow (4 tabs ≈ 343px fit).

### PDF card (`410:27849` and siblings)
- **Variant observed**: 1 default state (white bg, neutral border, no highlight).
- **NEED HIGHLIGHT VARIANT** (per FEAT AC-3 "Thẻ đang chọn highlight viền nổi bật. Mặc định chọn thẻ đầu tiên của bộ mới nhất."): Figma KHÔNG hiển thị variant "selected" — drift cần BA/UX cung cấp design cho selected state. Wave-spec mobile §3 AC-3 cũng không mô tả selected state vì assumption: tap → mở PDF native ngay (không có "select" intermediate). **Drift cross-doc**.
- **Tap state (implicit)**: ripple Material default (`InkWell`) — Figma không show pressed variant.
- **Disabled state**: không có.

### Bottom action bar (`410:28077`)
- **Variant 1 — "Tạo hồ sơ bảo hiểm"** (outline/secondary):
  - bg `#edf7ff` (CD Driver/P50)
  - icon `vuesax/linear/add-square` 24px color `#0052ff`
  - text "Tạo hồ sơ bảo hiểm" Inter Bold 16/24 color `#0052ff` center
  - p=`px=16 py=12`, gap=8, radius 8
- **Variant 2 — "Thanh toán"** (primary fill):
  - bg `#0052ff` (`button-Background-Primary-CD Garage`)
  - text "Thanh toán" Inter Bold 16/24 color white center
  - p=`px=16 py=12`, gap=8, radius 8
- **Disabled state**: không có trong Figma (suy: opacity 0.5 per `_ref-mobile-transform-figma.md`).
- **Press state**: ripple Material default.

### Empty state illustration (`410:28017`)
- **Variant**: 1 only — composite SVG (22 sub-groups, w=196 h=196).
- **Selected/disabled**: N/A (non-interactive).

### Cubit state (suy từ wave-spec §4.2 — KHÔNG có trong Figma)
- `InsuranceDossierHistoryCubit`: `initial | loading | loaded | empty | error`.
- `PagingController<int, InsuranceDossierVersion>`: `firstPageError | newPageError | listEnd | listLoading`.
- Visual mapping:
  - `initial` → blank
  - `loading` → CircularProgressIndicator (Figma không có skeleton)
  - `loaded` → Screen 1 (`410:27794`)
  - `empty` → Screen 3 (`410:27966`)
  - `error` → fallback `ErrorWidget` inline (Figma không có error variant — must follow Flutter Material default)

---

## Text Content

> Verbatim từ Figma `get_design_context.code` — tiếng Việt có dấu, KHÔNG paraphrase. So với
> FEAT/wave-spec ARB để flag drift (§Figma Drift Notes).

### Screen 1 — Loaded (`410:27794`)

**AppBar title**:
- "Chi tiết phiếu quyết toán"

**Tab labels** (4 tabs, left → right, Figma 410:27804):
- "Bảng chi phí"
- "Chứng từ & hóa đơn"
- **"Hồ sơ bảo hiểm đã xuất"** (active — full chữ "bảo hiểm", KHÔNG viết tắt "BH")
- "Lịch sử thanh toán"

**Bộ hồ sơ block — Set 1** (`410:27846` `410:27847`):
- Title: **"Bộ hồ sơ #SET-20260326-00001"** (uses settlement code with `#SET-...` prefix)
- Subtitle: **"Xuất ngày 26/03/2026 08:12 · 4 tài liệu PDF"**

**Bộ hồ sơ block — Set 2** (`410:27903` `410:27904`):
- Title: "Bộ hồ sơ #SET-20260326-00001" (Figma mock duplicates code — same code mặc dù đáng lẽ là 00002. Real impl: server cấp code khác per phiên xuất.)
- Subtitle: **"Xuất ngày 26/03/2026 08:02 · 4 tài liệu PDF"**

**PDF card filenames** (4 documents — verbatim Figma):
1. **"Phieuquyettoan_239239_v3.pdf"**
2. **"Phieubaogia_239239_v3.pdf"**
3. **"Bienbannghiemthu_239239_v3.pdf"**
4. **"Giayuyquyen_239239_v3.pdf"**

**PDF card file size** (verbatim, all 8 cards):
- **"200mb"** (lowercase "mb" — Figma sample; real impl theo BFF response field)

**Bottom button** (Loaded screen has 3 buttons stack):
- **"Chỉnh sửa phiếu"** (secondary edit, Inter Semi Bold 14)
- **"Tạo hồ sơ bảo hiểm"** (secondary outline, Inter Bold 16, with add-square icon)
- **"Thanh toán"** (primary fill, Inter Bold 16)

### Screen 2 — PDF Preview (`410:27598`)

**AppBar title**:
- **"Xem chi tiết hồ sơ"**

**Sample PDF content** (from "Phiếu báo giá" template render):
- Header garage: "Garage BD Miền Bắc" · "205 Đường Hồ Tùng mậu" · "Liên hệ: 09333948382 - Pham Thi Huyen Trang" · "MST: 0192039483" · "Email: 0192039483"
- Title: "PHIẾU DỊCH VỤ"
- Subtitle: "Ngày 14 tháng 11 năm 2025"
- "Số phiếu: 1232BG001"
- Section "Thông tin khách hàng": "Tên khách hàng: Nguyen Xuan Anh" · "Địa chỉ: 136 Hồ Tùng Mậu" · "Số điện thoại: 0309393884"
- Section "Thông tin về xe" — table columns: "Hãng xe / Dòng xe / Đời xe / Phiên bản / Số VIN / BKS / Số km / Ngày nhận xe / Ngày giao dự kiến" → values: "Toyota / Vios / 2018 / 1.5E MT / G4NAJH049384 / 30K72845 / (blank) / 19-07-2025 / (blank)"
- Section "Yêu cầu khách hàng": "Bảo dưỡng"
- Section "Các hạng mục công việc" — columns: "STT / Tên CV / SL / Đơn giá / Thành tiền / Chiết khấu / Thuế / Tổng tiền" → row 1: "1 / Bảo dưỡng 50.000 km / 1 / 10.000.000 / 10.000.000 / 0% / 0% / 10.000.000"
- Section "Phụ tùng/Vật tư" — columns: "STT / Tên PT / ĐVT / SL / Đơn giá / Thành tiền / Chiết khấu / Thuế / Tổng tiền" → row 1: "1 / Thước lái / Chiếc / 1 / 10.000.000 / 10.000.000 / 0% / 0% / 10.000.000"
- "Ghi chú" empty
- Totals: "Thành tiền: 10.000.000" · "Tổng tiền chiết khấu: 0" · "Tổng tiền thuế: 0" · "Tổng tiền: 10.000.000"
- "Tổng số tiền khách hàng thanh toán bằng chữ: Mười triệu đồng"
- Signature: "Khách hàng" · "Cố vấn dịch vụ"

**Bottom action**:
- **"Tải xuống tệp"** (full-width primary button)

### Screen 3 — Empty state (`410:27966`)

**AppBar title**: "Chi tiết phiếu quyết toán"

**Tab labels**: same as Screen 1 (4 tabs, "Hồ sơ bảo hiểm đã xuất" active)

**Empty state copy** (`410:28069`):
- Title (16/24 Semi Bold center): **"Không tồn tại bản ghi!"**
- Subtitle (12/18 Regular center, max-width 280): **"Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị."**

**Bottom buttons** (`410:28072` + `410:28077`):
- **"Chỉnh sửa phiếu"** (with edit icon)
- **"Tạo hồ sơ bảo hiểm"**
- **"Thanh toán"**

---

## Design Tokens

### Colors (from `get_variable_defs(319:43731)`, mapped sang Flutter `AppColors`)

| Figma variable / hex | Role / where used | Expected Flutter token (`_ref-mobile-transform-figma.md §1.5`) |
|---|---|---|
| `Base/text-CD Garage` = **`#262626`** | Title màn, set title, tab label non-active | `AppColors.textPrimary` (`#262626`) ✓ |
| `Base/text-Primary` = **`#273243`** | "Chỉnh sửa phiếu" button text, tab "Bảng chi phí" first | `AppColors.textPrimary` ≈ — Figma có hai variant text-primary (#262626 vs #273243); chọn theo nhóm semantic |
| `Base/text-Secondary` = **`#595e69`** | Set subtitle "Xuất ngày...", file size "200mb" | `AppColors.textSecondary` (`#595e69`) ✓ |
| `Base/text-Tertiary` = **`#888c94`** | Empty subtitle "Vui lòng thêm mới...", "Cập nhật:" label | `AppColors.textTertiary` (`#888c94`) ✓ |
| `Base/text-Active-Primary-CD Garage` = **`#0052ff`** | Tab active text, "Tạo hồ sơ bảo hiểm" text | `AppColors.textActivePrimary` (`#0052ff`) ✓ |
| `Base/text-Success` = **`#15aa2c`** | Badge "Đã thanh toán" text (out of feat scope) | `AppColors.textSuccessPrimary` ✓ |
| `Base/text-Error` = **`#ed1f42`** | "Còn lại: 55.000.000 VND" red (out of feat scope) | `AppColors.textErrorPrimary` ✓ |
| **`#172554`** (`tailwind/blue/950`) | **PDF filename text** color | NOT in `AppColors` semantic baseline — **drift**, possibly use raw `Color(0xFF172554)` hoặc add new `AppColors.textPdfFilename` |
| `Base/button-Background-Primary-CD Garage` = **`#0052ff`** | "Thanh toán" button bg | `AppColors.buttonBackgroundPrimary` ✓ |
| `Base/bg-Base` = **`#ffffff`** | Screen bg, card bg | `AppColors.bgBase` ✓ |
| `Base/bg-Primary` = **`#e8e8ea`** | Spacer divider 6px height | `AppColors.bgPrimary` ✓ |
| `Base/bg-Secondary` = **`#f3f3f4`** | "Chỉnh sửa phiếu" button bg | `AppColors.bgSecondary` (= `NeutralColor.s50`) ✓ |
| `Base/bg-Success` = **`#f0fdf1`** | Badge "Đã thanh toán" bg | `AppColors.bgBadgeSuccess` ✓ |
| `Base/border-Primary` = **`#e8e8ea`** | PDF card border (1px solid) | `AppColors.borderPrimary` ✓ |
| `Base/border-Active-CD` = **`#0052ff`** | Tab active underline 2px | `AppColors.borderActive` ✓ |
| `colors/dialog-primary-bg` = **`#f4f7fe`** | PDF circular badge bg (44×44 circle) | NOT in `AppColors` semantic — **drift**, possibly add `AppColors.bgPdfBadge` hoặc reuse `PrimaryColor.s50` (`#edf7ff`) — KHÁC nhau, BA cần chọn |
| `CD Driver/P600-Main` = **`#0052FF`** | (alias of primary) | `AppColors.textActivePrimary` |
| `CD Driver/P50` = **`#EDF7FF`** | "Tạo hồ sơ bảo hiểm" button bg (outline secondary) | `PrimaryColor.s50` (`#edf7ff`) ✓ |
| `Neutral/Black` = **`#000000`** | Home indicator iOS bar | `BaseColor.black` ✓ |
| `Neutral/White` = **`#FFFFFF`** | Button "Thanh toán" text, card bg | `AppColors.textWhite` / `BaseColor.white` ✓ |

### Typography (from `get_variable_defs` + `get_design_context`)

| Figma style | Spec | Used at | Expected Flutter token |
|---|---|---|---|
| **`Heading/H3`** | Inter Bold 18/26 letterSpacing=0 | "Bộ hồ sơ #SET-..." title, "Thông tin xe" collapse title, "Thông tin khách hàng" title | `AppTextStyle.textHeadingH3` |
| **`Heading/H4`** | Inter Bold 16/24 | "PHIẾU DỊCH VỤ" title (PDF preview), `#PHDV-...` header (Info DV) | `AppTextStyle.textHeadingH4` |
| **`Heading/H5`** | Inter Bold 14/20 | (none on this feat — listed by variable_defs) | `AppTextStyle.textHeadingH5` |
| **`Subtitle/S4`** | Inter Semi Bold 16/24 | "Không tồn tại bản ghi!" title, button text "Tạo hồ sơ bảo hiểm"/"Thanh toán" (16/24 Bold ~ same family) | `AppTextStyle.textSubtitleS4` (BA cần xác nhận: Subtitle vs Heading H4) |
| **`Subtitle/S5`** | Inter Semi Bold 14/20 | "Chỉnh sửa phiếu" button text | `AppTextStyle.textSubtitleS5` |
| **`Body/B5`** | Inter Medium 14/20 | Tab active "Hồ sơ bảo hiểm đã xuất" (font-weight 500) | `AppTextStyle.textBodyB5` |
| **`Body/B7`** | Inter Medium 12/18 | Badge "Đã thanh toán" text | `AppTextStyle.textBodyB7` |
| **`Caption/C5`** | Inter Regular 14/20 | Tab non-active text, set subtitle "Xuất ngày...", "Cập nhật:" label, body text PDF preview | `AppTextStyle.textCaptionC5` |
| **`Caption/C7`** | Inter Regular 12/18 | File size "200mb", empty subtitle "Vui lòng thêm mới..." | `AppTextStyle.textCaptionC7` |
| **`14px/Regular`** | Inter Regular 14/20 letterSpacing=0 | (alias of Caption/C5) | `AppTextStyle.textCaptionC5` |
| **`Regular/None/Medium`** | Inter Medium 16/16 | "9:41" status bar time | (system text — no token needed) |
| **PDF filename** (custom) | Inter Bold 14/auto-leading, letterSpacing=-0.4px | "Phieuquyettoan_239239_v3.pdf" filename | NOT in baseline — drift — need `AppTextStyle.textHeadingH5` (size match) + custom letterSpacing=-0.4 |
| **PDF badge label "PDF"** | Inter Extra Bold (weight 800) 12/18 | Badge text "PDF" inside circular tag | NOT in baseline `AppTextStyle` (no extrabold variant) — **drift** — likely raw `TextStyle(fontWeight: FontWeight.w800)` |

### Spacing (from metadata + design_context)

| Element | Value | Token |
|---|---|---|
| Section "Nhóm A" outer padding | `EdgeInsets.fromLTRB(16, 8, 16, 16)` (px=16 pt=8 pb=16) | `AppSizes.spacing16` |
| Bộ hồ sơ blocks gap | `gap=16` between blocks | `Gap(AppSizes.spacing16)` |
| "Bộ hồ sơ" header gap (title ↔ subtitle) | `gap=8` | `Gap(AppSizes.spacing8)` |
| "Bộ hồ sơ" header padding | `pt=16 pb=8` | mixed |
| PDF cards gap (vertical stack) | `gap=16` between cards | `Gap(AppSizes.spacing16)` |
| PDF card padding | `p=16` all sides | `EdgeInsets.all(AppSizes.spacing16)` |
| PDF card flex gap inside (badge ↔ text) | `gap=16` (Figma reports `gap-[65px]` for outer flex but inner gap=16 between badge group ↔ text group) | `Gap(AppSizes.spacing16)` |
| PDF badge inner padding | `p=10` | NOT exact spacing16/8 — use literal `EdgeInsets.all(10)` |
| Empty state inner gap (illustration ↔ title) | `gap=12` | `Gap(12)` (no token, use literal) |
| Empty state title ↔ subtitle gap | `gap=4` (Padding/padding_1=4) | `Gap(AppSizes.spacing4)` |
| Empty state vertical padding (Y of illustration container) | `py=80` | literal `EdgeInsets.symmetric(vertical: 80)` |
| Bottom button stack gap | `gap=8` between 2 buttons | `Gap(AppSizes.spacing8)` |
| Bottom action bar padding | `pb=20 pt=16 px=16` (safe area at bottom) | literal |
| Spacer divider height | `h=6` | `Container(height: 6)` |
| Tab bar gap between tabs | `gap=12` | `Gap(12)` |
| Tab inner padding | `px=4 py=12` | literal |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| PDF card border | 1px solid `#e8e8ea` (`border-Primary`) | `Border.all(color: AppColors.borderPrimary, width: 1)` |
| PDF card radius | `12px` | `BorderRadius.circular(12)` (`AppSizes.spacing12` if mapped) |
| PDF badge circular radius | `9999px` (full) | `BoxDecoration(shape: BoxShape.circle)` |
| Tab active underline | `border-bottom: 2px solid #0052ff` | `Border(bottom: BorderSide(color: AppColors.borderActive, width: 2))` |
| Button radius (Tạo hồ sơ / Thanh toán / Chỉnh sửa phiếu) | `8px` | `BorderRadius.circular(8)` |
| Bottom action bar top radius | `8px top-left + 8px top-right` (`rounded-tl-[8px] rounded-tr-[8px]`) | `BorderRadius.only(topLeft: ..., topRight: ...)` |
| Bottom action bar shadow | `0px -4px 12px 0px rgba(0,0,0,0.06)` | `BoxShadow(offset: Offset(0, -4), blurRadius: 12, color: Colors.black.withOpacity(0.06))` — match `AppShadows.boxShadow` (need verify) |
| AppBar bottom border | `1px solid border-Primary` (`#e8e8ea`) | `Border(bottom: BorderSide(...))` |
| Home indicator (iOS) | `radius=100, w=134 h=4, bg=black` | iOS native — skip Flutter render |

### Icons

| Name (Figma asset) | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20×20 | `#262626` | AppBar back button |
| `vuesax/linear/more` (3 dots vertical, rotated 90°) | 20×20 | `#262626` | AppBar right menu |
| `vuesax/linear/arrow-right` | 20×20 | `#262626` | Collapse card right arrow ("Thông tin xe" / "Thông tin khách hàng") |
| `vuesax/linear/arrow-up` | (16-20)? | `#0052ff` | "Info DV" expanded indicator |
| `vuesax/linear/calendar` | 16×16 | `#0052ff` | "Cập nhật:" row icon |
| `vuesax/linear/document-text` | 16×16 | `#0052ff` | "Phiếu dịch vụ liên kết:" + "Ghi chú quyết toán:" |
| `vuesax/linear/security` | 16×16 | `#0052ff` | "Bảo hiểm chi trả:" |
| `vuesax/linear/edit` | 16×16 | `#273243` | "Chỉnh sửa phiếu" button leading |
| `vuesax/linear/trash` | (16)? | (red?) | "Info DV" trash action (out of scope) |
| `vuesax/linear/add-square` | 24×24 | `#0052ff` | "Tạo hồ sơ bảo hiểm" button leading |
| `vuesax/bold/eye` | 20×20 | `#888c94` (gray, based on screenshot) | PDF card right action (view PDF) |
| Empty state SVG illustration (composite, 22 sub-groups) | 196×196 | multi-color stylized | Empty state main visual — save as 1 SVG asset `empty_dossier.svg` |

### Bounds (key dimensions)

| Element | W × H |
|---|---|
| Screen frame | 375 × variable |
| PDF card | 343 × 76 (full-width minus 16px padding sides) |
| PDF badge circular | 44 × 44 |
| Eye icon container | 20 × 20 (absolute right, top=32 of card) |
| Empty illustration | 196 × 196 |
| Empty title text width | 341 |
| Empty subtitle text width | 280 |
| Bottom button | full-width minus 16px sides → ~343 × 48 |
| AppBar | 375 × 52 (nav) + 44 (status bar) = 96 total |
| Tab bar | 375 × 44 (px=4 py=12 with 14px text + line-height 20) |

---

## Screenshots

> Tất cả PNG lưu tại `Product/ux/figma-test-mobile/assets/wave02-ins-dossier-view/`. Agent-test-ui
> dùng làm reference cho golden snapshot (Flutter `alchemist` package).

| Asset path | Node (Figma) | Brief |
|---|---|---|
| `assets/wave02-ins-dossier-view/_full.png` | `319:43731` | Section full layout (1467×1840, 3 screens side-by-side) — overview |
| `assets/wave02-ins-dossier-view/410-27794.png` | `410:27794` | Screen 1 — Loaded state (375×1395 scroll) |
| `assets/wave02-ins-dossier-view/410-27598.png` | `410:27598` | Screen 2 — PDF Preview full-page (375×812) |
| `assets/wave02-ins-dossier-view/410-27966.png` | `410:27966` | Screen 3 — Empty state (375×812) |
| `assets/wave02-ins-dossier-view/410-27845.png` | `410:27845` | Section "Nhóm A — Tab Hồ sơ bảo hiểm đã xuất" — full tab content with 2 sets × 4 cards (375×932) |
| `assets/wave02-ins-dossier-view/410-27804.png` | `410:27804` | Tab bar 4-tab horizontal scroll bar (359×44) |
| `assets/wave02-ins-dossier-view/410-27849.png` | `410:27849` | Single PDF card detail (343×76) — golden reference cho `InsuranceDossierFileTile` |
| `assets/wave02-ins-dossier-view/410-28015.png` | `410:28015` | Empty state illustration + title + subtitle (375×432) |
| `assets/wave02-ins-dossier-view/410-28077.png` | `410:28077` | Bottom action bar — "Tạo hồ sơ bảo hiểm" + "Thanh toán" stack (375×176) |

---

## Pixel-perfect Checklist Status

> Tra theo `_ref-test-figma-oracle-flow.md §4`.

### P1 — Spacing
- [x] PDF card padding `p=16` (Figma `p-[var(--spacing---border\/16,16px)]`) — verified
- [x] Tab bar inner padding `px=4 py=12` — verified
- [x] Bottom button padding `px=16 py=12` — verified
- [x] Set header gap `pt=16 pb=8`, title↔subtitle gap=8 — verified
- [x] List item row height: PDF card = 76px (fixed) — verified

### P1 — Interaction states
- [ ] **MISSING** — Figma không có variant `:hover`/`:pressed`/`:disabled` cho PDF card → Flutter `InkWell` ripple Material default; agent-test-ui flag nếu impl không có feedback.
- [x] Button "Thanh toán" / "Tạo hồ sơ bảo hiểm" default state verified.
- [ ] **MISSING** — Button disabled state không trong Figma (no payment block scenario).
- [x] Tab active state border-bottom 2px `#0052ff` — verified.
- [ ] **MISSING** — Tab pressed/focus state không trong Figma.

### P2 — Typography (5 properties đầy đủ)
- [x] `font-family = Inter` cho tất cả text — verified.
- [x] `font-size + font-weight + line-height + letterSpacing` cho 11 token (H3..C7) — verified từ `get_variable_defs`.
- [x] PDF filename: `Inter Bold 14 letterSpacing=-0.4` — verified custom.

### P2 — Border
- [x] PDF card: width=1, style=solid, color=`#e8e8ea`, radius=12 — verified.
- [x] Button: width=0, radius=8 — verified.
- [x] Tab active: border-bottom=2 solid `#0052ff` — verified.

### P2 — Small component dimensions
- [x] PDF badge: 44×44 (h=44 p=10 rounded full) — verified.
- [x] Eye icon button: 20×20 — verified.
- [x] AppBar icons: 20×20 — verified.
- [x] Section icons (calendar/security/document-text): 16×16 — verified.
- [x] Tab bar height implicit: 44 (line-height 20 + py=12×2) — verified.

### P3 — Khác
- [x] `box-shadow` bottom action bar: `0px -4px 12px rgba(0,0,0,0.06)` — verified.
- [ ] `opacity` (only on empty state SVG sub-groups `opacity-50`) — irrelevant for impl (use SVG as-is).
- [x] Icons documented per §Design Tokens.
- [ ] `z-index` (AppBar `absolute top-0 left-0`, bottom bar `absolute bottom-0`) — verified.
- [x] Overflow (PDF preview content) — `overflow-clip` — verified.

### Text verbatim
- [x] 4 PDF filenames verbatim — verified (Phieuquyettoan / Phieubaogia / Bienbannghiemthu / Giayuyquyen).
- [x] Set title "Bộ hồ sơ #SET-20260326-00001" verbatim — verified.
- [x] Set subtitle "Xuất ngày 26/03/2026 08:12 · 4 tài liệu PDF" verbatim — verified.
- [x] Empty title/subtitle verbatim — verified.
- [x] Tab labels verbatim — verified.
- [x] Bottom button labels verbatim — verified.

---

## Figma Drift Notes

> **Quan trọng**: Figma SSOT thực tế **lệch nhiều** so với `FEAT-INS-DOSSIER-VIEW.md v15` và
> `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-VIEW.md v2`. Agent-test-ui khi
> verify implementation phải:
> 1. Chọn nguồn primary theo policy v2 — **wave-spec mobile = authoritative cho dev**;
> 2. Flag drift với BA/PO khi impl khớp wave-spec nhưng lệch Figma (hoặc ngược lại);
> 3. Đề xuất reconcile qua `/cr-raise MINOR` để align Figma + FEAT + wave-spec.

### Drift D1 — Layout: 2-col grid (FEAT/wave-spec) vs 1-col stack (Figma)
- **FEAT AC-3**: "lưới (grid) các thẻ file PDF xếp 2 cột"
- **Wave-spec mobile §2 / §3 AC-3 / §4.1**: `CrossAxisCount=2` `SliverGridDelegateWithFixedCrossAxisCount`
- **Figma actual** (`410:27845` + `410:27849`): PDF cards stacked **VERTICALLY 1 COLUMN**, mỗi card full-width 343px, height 76 fixed.
- **Severity**: CRITICAL — toàn bộ widget tree khác.
- **Decision needed**: BA/UX có cập nhật Figma sang 2-col chưa? Hoặc Figma đúng và FEAT/wave-spec cần reword sang "list dọc" (giống AC-2 đã reword theo design 2026-06-16)?

### Drift D2 — Empty state copy
- **FEAT AC-1 + wave-spec §11.1 ARB key `insurance_dossier_empty_state`**: "Chưa có bộ hồ sơ nào được xuất." / "No dossiers have been exported yet."
- **FEAT v15 AC-1 + Change Log v12**: "Chưa có hồ sơ nào được xuất" (ERR-INS-010 EMPTY_STATE 🔵)
- **Figma actual** (`410:28070`/`410:28071`): Title "**Không tồn tại bản ghi!**" + subtitle "**Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị.**"
- **Severity**: HIGH — wording khác nhau (Figma generic empty pattern vs FEAT-specific copy).
- **Decision needed**: FEAT copy đúng (user-facing wording) hay Figma copy đúng (designer-chosen)?

### Drift D3 — Set title format
- **Wave-spec §3 AC-2 ARB key `insurance_dossier_version_title`**: `"Bộ hồ sơ #{version}"` (vi) / `"Dossier #{version}"` (en)
- **Figma actual**: "Bộ hồ sơ **#SET-20260326-00001**" — uses settlement code prefix `#SET-...`, NOT version number.
- **FEAT AC-2**: "**'Bộ hồ sơ {mã phiếu QT}'** (vd 'Bộ hồ sơ #SET-20260326-00001')" — matches Figma.
- **Severity**: HIGH — wave-spec ARB khác FEAT + Figma.
- **Decision needed**: Wave-spec ARB phải đổi sang `"Bộ hồ sơ #{settlementCode}"` để khớp FEAT + Figma.

### Drift D4 — Tab label viết tắt
- **Wave-spec §11.1 ARB key `insurance_dossier_tab_exported_label`**: "Hồ sơ **BH** đã xuất"
- **Figma actual** (`410:27807`): "Hồ sơ **bảo hiểm** đã xuất" (full word)
- **FEAT AC-1**: "tab '**Hồ sơ bảo hiểm đã xuất**'" — matches Figma.
- **Severity**: MEDIUM — Wave-spec viết tắt "BH" không khớp FEAT + Figma.
- **Decision needed**: Wave-spec ARB phải dùng "bảo hiểm" đầy đủ.

### Drift D5 — PDF card content (file size location + missing settlement reference)
- **FEAT AC-3**: "Tên file + kích thước trên **cùng một dòng** (vd 'Phiếu quyết toán.pdf · 100kb')" + "**Mã tham chiếu phiếu QT** (vd #SET-20260326-00001) ở dòng dưới"
- **Figma actual** (`410:27849`): Filename line 1 (Bold 14) + size "200mb" line 2 (Regular 12); **KHÔNG có** dòng "Mã tham chiếu #SET-..." nào.
- **Wave-spec §3 AC-3**: "icon PDF + `documentType` label (i18n) + tên file (theo BR-INS-DOSSIER-011: `{slug}_{code}_v{N}.pdf`)" — gần khớp Figma (filename + ?) nhưng thêm `documentType` label trên Figma không thấy.
- **Severity**: HIGH — 3 nguồn FEAT/wave-spec/Figma cùng khác nhau.
- **Decision needed**: BA chốt card layout final (line 1 = filename? hay = doc type label? line 2 = size? hay = #SET reference?).

### Drift D6 — File name format (sample vs real)
- **FEAT AC-3**: 4 tên file chuẩn "Phiếu báo giá.pdf", "Phiếu quyết toán.pdf", "Biên bản nghiệm thu.pdf", "Giấy ủy quyền nhận tiền bồi thường.pdf" (tiếng Việt có dấu).
- **Figma actual**: "Phieuquyettoan_239239_v3.pdf", "Phieubaogia_239239_v3.pdf", "Bienbannghiemthu_239239_v3.pdf", "Giayuyquyen_239239_v3.pdf" (no diacritics, includes code + version suffix).
- **Wave-spec §3 AC-3** + **BR-INS-DOSSIER-011**: `{slug}_{code}_v{N}.pdf` → matches Figma format.
- **Severity**: MEDIUM — Figma dùng technical slug, FEAT dùng Vietnamese display name; BR-011 (canonical) khớp Figma.
- **Decision needed**: FEAT AC-3 cần cập nhật wording để match BR-011 slug format (technical file name) hoặc clarify đó là **display title** (tiếng Việt), tên file = slug.

### Drift D7 — Selected card highlight
- **FEAT AC-3**: "Thẻ đang chọn highlight **viền nổi bật**. Mặc định chọn thẻ đầu tiên của bộ mới nhất."
- **Figma actual**: KHÔNG có variant "selected" — tất cả 8 PDF cards cùng style default border `#e8e8ea`.
- **Wave-spec §3 AC-4**: tap → mở PDF native (`launchUrl`) → không có intermediate "select" state.
- **Severity**: LOW — wave-spec impl bypass "select" by going straight to native intent (logical với mobile UX); Figma confirm không có select highlight. FEAT AC-3 có thể đang reference legacy 2-pane web design.
- **Decision needed**: FEAT AC-3 reword bỏ phần "highlight viền nổi bật" cho mobile context (apply web-only).

### Drift D8 — PDF Preview screen separate (Figma) vs native intent (wave-spec)
- **Wave-spec §3 AC-4 / AC-5 / §4.3**: tap card → `url_launcher.launchUrl(mode: LaunchMode.externalApplication)` → mở **PDF native** (Adobe / Google Drive / iOS Document Interaction Controller). **KHÔNG render in-app**.
- **Figma actual** (Screen 2 `410:27598` "Xem chi tiết hồ sơ"): có **dedicated in-app PDF preview screen** với header "Xem chi tiết hồ sơ", PDF content rendered inside Container 343×485, bottom button "Tải xuống tệp".
- **Severity**: CRITICAL — toàn bộ navigation pattern khác nhau (native intent vs in-app preview screen).
- **Decision needed**: BA/Architect chốt — mobile dùng native intent (wave-spec) hay in-app preview screen (Figma)? Nếu native intent, Figma Screen 2 → out-of-scope cho mobile; nếu in-app, wave-spec phải bổ sung `DossierPdfPreviewScreen` + flutter_pdfview package.

### Drift D9 — Bottom action bar buttons
- **FEAT**: không quy định button "Chỉnh sửa phiếu" trên màn chi tiết phiếu QT BH.
- **Wave-spec mobile**: không có mention button "Chỉnh sửa phiếu".
- **Figma actual** (Loaded + Empty state): bottom bar có **3 buttons** stack vertically: "Chỉnh sửa phiếu" (secondary) + "Tạo hồ sơ bảo hiểm" (outline) + "Thanh toán" (primary).
- **Note**: "Chỉnh sửa phiếu" likely thuộc baseline `FEAT-STL-DETAIL` (production), không phải FEAT-INS-DOSSIER-VIEW scope. "Tạo hồ sơ bảo hiểm" thuộc FEAT-INS-DOSSIER-CREATE.
- **Severity**: LOW — boundary scope clarification; agent-test-ui chỉ verify scope FEAT-INS-DOSSIER-VIEW (= tab content + empty state + PDF tile), không verify bottom buttons.

### Drift D10 — Section title duplicate (Figma mock data)
- **Figma actual** (Loaded): cả 2 "Bộ hồ sơ" blocks đều có title "Bộ hồ sơ **#SET-20260326-00001**" (cùng mã) — chỉ subtitle khác (08:12 vs 08:02).
- **Real impl**: server cấp mã `#SET-...` riêng per phiên xuất.
- **Severity**: LOW — Figma mock data inconsistency; impl phải dùng `settlementCode` per response.
- **Action**: agent-test-ui dùng `{settlementCode}` placeholder, KHÔNG hardcode "#SET-20260326-00001".

---

## Notes for agent-test-ui (consume-side)

1. **Source priority**: Wave-spec mobile (T4, authoritative cho dev) > FEAT v15 (T2, BA-owned) > Figma (visual SSOT). Drift D2-D8 cần reconcile qua CR.
2. **Layout decision (D1)**: nếu impl theo wave-spec (2-col grid) → verify implementation as-is; tạo conformance TC `WRONG_LAYOUT` flag với Figma. Nếu impl theo Figma (1-col stack) → flag wave-spec đã out-of-date.
3. **Empty state copy (D2)**: text TC phải verify hardcoded text từ **wave-spec ARB** (`insurance_dossier_empty_state` = "Chưa có bộ hồ sơ nào được xuất."), KHÔNG verify Figma copy ("Không tồn tại bản ghi!").
4. **PDF Preview (D8)**: nếu impl native intent → no in-app preview screen verify (screen `410:27598` ngoài scope mobile feature); chỉ verify `url_launcher` invoke.
5. **Selected highlight (D7)**: KHÔNG verify "viền nổi bật" cho mobile (FEAT AC-3 mobile-irrelevant).
6. **Golden snapshot**: dùng PNG `410-27849.png` làm reference cho `InsuranceDossierFileTile` widget golden test (`alchemist`).
7. **Wave-spec `getInsuranceDossierVersions` response field**: `documents[].documentType` không thấy trong Figma render. Verify implementation render documentType label theo `doc_type_*` ARB key (4 keys cho 4 documents).

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | agent-test-ui (re-run after MCP permission fix) | **REPLACE PARTIAL → FULL oracle**: re-fetch Figma `nAoFS33sTWj3ctWjZMUDEl` node `319:43731` qua 4 MCP tools (get_metadata/get_variable_defs/get_design_context/get_screenshot). 3 screen states bóc đủ (Loaded `410:27794` / PDF Preview `410:27598` / Empty `410:27966`). 8 section PNG saved + giữ `_full.png` original. 5-cấp data complete; flag **10 drift** giữa FEAT v15 + wave-spec mobile v2 + Figma (CRITICAL: D1 grid layout, D8 native intent vs in-app preview; HIGH: D2 empty copy, D3 set title, D5 card content). |
