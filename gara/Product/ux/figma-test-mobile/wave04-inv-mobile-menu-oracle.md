---
feat: FEAT-INV-MOBILE-MENU
feat_file: Product/features/FEAT-INV-MOBILE-MENU.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21729-24201&t=1wyfngHFoc9eXNsZ-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21729:24201"
fetched_at: 2026-07-08T10:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success
  get_screenshot: success
screenshots:
  - assets/wave04-inv-mobile-menu/_full.png
  - assets/wave04-inv-mobile-menu/21519-27558.png
  - assets/wave04-inv-mobile-menu/21521-72299.png
  - assets/wave04-inv-mobile-menu/21521-70903.png
---

# Oracle — FEAT-INV-MOBILE-MENU (Wave 04)

> Oracle Figma design cho màn hub **"Quản lý kho hàng"** (garage-mobile). Figma tương ứng trạng thái đầy đủ 6 tile (state W06). Wave 04 chỉ render 3 tile theo AC-4 state matrix (Sản phẩm · Nhóm vật tư · Tồn đầu kỳ). Oracle bao gồm cả 6 tile để agent-test-ui verify Figma binding gốc + wave gating conditional rendering.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| FEAT-INV-MOBILE-MENU (default, 6-tile Figma baseline) | 21519:27371 | 375x812 | assets/wave04-inv-mobile-menu/_full.png |
| Header (Status bar + Nav bar) | 21519:27558 | 375x96 | assets/wave04-inv-mobile-menu/21519-27558.png |
| FeatureList (3 rows × 2 tiles) | 21521:72299 | 343x328 | assets/wave04-inv-mobile-menu/21521-72299.png |
| Row (Features tile) reference | 21521:70903 | 167.5x104 | assets/wave04-inv-mobile-menu/21521-70903.png |

> **Wave 04 gating**: Figma baseline hiển thị 6 tile; wave 04 hiển thị **3 tile** — Sản phẩm (#1), Nhóm vật tư (#2), Tồn đầu kỳ (#6). Tile Phiếu nhập / Phiếu xuất / Tồn kho **ẨN HOÀN TOÀN** trong wave 04 (AC-4). Grid 2-cột reflow: row 1 = [Sản phẩm | Nhóm vật tư]; row 2 = [Tồn đầu kỳ | (empty slot)].

---

## Component Inventory

### Screen: FEAT-INV-MOBILE-MENU (21519:27371)

- **CustomScaffold** × 1 — bg=`AppColors.bgSecondary` (#f3f3f4)
- **CustomAppBar** × 1 — title "Quản lý kho hàng", leading back arrow, no trailing action
- **Native / Status Bar** instance × 1 — top 44px (framework template)
- **Home Indicator (Action bar)** instance × 1 — bottom 20px (framework template)
- **ListView / Column body** × 1 — padding 16, gap 8, list scroll
- **FeatureList container** × 1 — bg trong suốt (transparent), gap `Gap(AppSizes.spacing8)`, radius `BorderRadius.circular(16)`
- **Row (grid row)** × 3 — layout Row, gap 8, mainAxis start, crossAxis stretch (Figma baseline; wave 04 chỉ 2 row sau reflow)
- **Features Tile** × 6 (Figma baseline) — wave 04 render × 3 (Sản phẩm, Nhóm vật tư, Tồn đầu kỳ)
- **Tile icon slot** × 6 — 48x48 SVG asset (mỗi tile 1 icon custom)
- **Tile label Text** × 6 — Inter Semi Bold 14/20, centered

---

## Variant & State

### CustomAppBar (nav bar 21519:27560)
- variants: single default
- title: "Quản lý kho hàng" verbatim
- leading: `Icons.arrow_back_ios_new` hoặc SVG asset `vuesax/linear/arrow-left` (20×20)
- trailing: none (Figma khai `Left Actionable` 20×20 + trailing group empty 20×52 nhưng không render icon)
- states observed: default

### Features Tile (21521:70903 canonical)
- variants: `default (enabled)` — Figma chỉ khai 1 variant
- states observed: default. Interactive states (pressed/disabled) không khai trong Figma — implement dùng ripple/InkWell chuẩn Flutter (fallback M-trap: không dùng InkWell nếu code chuẩn Garage — dùng `SingleTapDetector` per R-TAP rules-mobile §2).
- wave gating state: `hidden` per AC-4 khi sub-module chưa GA (không placeholder, không "Sắp ra mắt" badge)

### Header (21519:27558)
- background: `AppColors.bgBase` white
- border-bottom: 1px `AppColors.borderPrimary` (#e8e8ea)
- Status bar: 44px (native template — time "9:41", mobile signal, wifi, battery)
- Nav bar: 52px, padding EdgeInsets.symmetric(horizontal: 16, vertical: 8)

---

## Text Content

### Screen: FEAT-INV-MOBILE-MENU (21519:27371)

**AppBar / Header**
- "Quản lý kho hàng" (nav bar title — verbatim Figma, đồng bộ label sidebar web per AC-2 + BR-INV-MENU-001)

**Tile labels** (verbatim, thứ tự grid từ trên xuống dưới, trái sang phải theo Figma baseline)
- "Sản phẩm" (tile #1 — 21521:70927) — wave 04 hiển thị
- "Nhóm vật tư" (tile #2 — 21521:70947) — wave 04 hiển thị
- "Phiếu nhập" (tile #3 — 21521:71024) — **ẨN trong wave 04** (W05 ship)
- "Phiếu xuất" (tile #4 — 21526:24176) — **ẨN trong wave 04** (W05 ship)
- "Tồn kho" (tile #5 — 21521:71095) — **ẨN trong wave 04** (W06 ship)
- "Tồn đầu kỳ" (tile #6 — 21521:71150) — wave 04 hiển thị

**Empty state (EC-2)**
- "Chưa có module nào khả dụng" (hypothetical — không xảy ra wave 04 vì >0 tile, nguồn: FEAT §6 EC-2)

---

## Design Tokens

### Screen-level

- **Scaffold background**: `#f3f3f4` (`Base/bg-Secondary`) → expected token: `AppColors.bgSecondary`
- **Screen padding (body)**: EdgeInsets.all(16) → `AppSizes.spacing16`
- **Grid gap (row + column)**: 8px (`Spacing - Border/8`) → `Gap(AppSizes.spacing8)`
- **FeatureList container radius**: 16px (`Spacing - Border/16`) → `BorderRadius.circular(AppSizes.spacing16)`

### Header (21519:27558)

- **Background**: `#ffffff` (`Base/bg-Base`) → `AppColors.bgBase`
- **Border-bottom**: 1px solid `#e8e8ea` (`Base/border-Primary`) → `AppColors.borderPrimary`
- **Nav bar padding**: EdgeInsets.symmetric(horizontal: 16, vertical: 8) → `AppSizes.spacing16` / `AppSizes.spacing8`
- **Nav bar title typography**: Inter Semi Bold 16/24 letterSpacing=0 (`Subtitle/S4`) → `AppTextStyle.textSubtitleS4` (M-28 hard rule: AppBar title nav-bar = textSubtitleS4)
- **Nav bar title color**: `#262626` (`Base/text-CD Garage`) → `AppColors.textPrimary`
- **Back arrow icon**: 20×20 SVG (`vuesax/linear/arrow-left`) → `AppColors.textPrimary` tint (không có binding màu explicit — inherit)
- **Status bar time text**: Inter Medium 16/16 letterSpacing=0 (`Regular/None/Medium`) — framework template, không app-owned

### Features Tile (21521:70903 canonical — cả 6 tile share)

- **Background**: `#ffffff` (`Base/bg-Base`) → `AppColors.bgBase`
- **Border-radius**: 16px (`Spacing - Border/16`) → `BorderRadius.circular(AppSizes.spacing16)`
- **Padding**: EdgeInsets.all(12) — 12px (`Spacing - Border/12`) — out-of-scale AppSizes (M-25 flag) → literal `EdgeInsets.all(12) // out-of-scale (Figma Spacing-Border/12)`
- **Inner gap (icon → label)**: 12px (`Spacing - Border/12`) → literal `Gap(12) // out-of-scale (Figma Spacing-Border/12)` — flag M-25 out-of-scale (scale AppSizes = {0, 4, 8, 16, 32, 52}). Design system decision cần escalate: bump lên 16 hoặc thêm `spacing12` vào AppSizes.
- **Icon slot size**: 48×48
- **Icon slot background**: circle nhạt xanh nhẹ (observed) — icon là SVG asset composite (không phải solid fill token). Icon composite tile-#1 (Sản phẩm — clipboard) / tile-#2 (Nhóm vật tư — box với check) / tile-#3 (Phiếu nhập — clipboard + arrow down) / tile-#4 (Phiếu xuất — clipboard + arrow up) / tile-#5 (Tồn kho — warehouse building) / tile-#6 (Tồn đầu kỳ — calendar). **Export mỗi icon là SVG asset riêng vào `assets/icons/inventory_menu_{tile_slug}.svg`** — flutter_svg render.
- **Label typography**: Inter Semi Bold 14/20 letterSpacing=0 (`Subtitle/S5`) → `AppTextStyle.textSubtitleS5`
- **Label color**: `#262626` (`Base/text-CD Garage`) → `AppColors.textPrimary`
- **Label alignment**: `TextAlign.center`

### FeatureList (21521:72299)

- **Layout**: Column, gap 8, items stretch, radius 16 (container, nhưng bg transparent)
- **Row height (each row)**: 104 hug (theo tile height)
- **Column count**: 2 (fixed grid)
- **Tile flex**: `Expanded(flex: 1)` per tile (Figma `flex-[1_0_0]`)
- **Row → Row gap**: 8px → `Gap(AppSizes.spacing8)`
- **Tile → Tile (in row) gap**: 8px → `Gap(AppSizes.spacing8)`

### Action bar (Home Indicator 21519:27566)

- **Height**: 20px total (framework native)
- **Home indicator bar**: 134×4, radius 100, bg `#000000` (`Neutral/Black`) — framework, không app-owned

---

## Screenshots

> assets/wave04-inv-mobile-menu/
- `_full.png` — toàn screen (375×812) — 6-tile Figma baseline
- `21519-27558.png` — Header (Status bar + Nav bar, 375×96)
- `21521-72299.png` — FeatureList (3 rows × 2 tiles, 343×328)
- `21521-70903.png` — Row / Features tile canonical (167.5×104)

---

## Notes cho agent-test-ui

1. **Wave gating verify (AC-4)**: cross-check spec Wave 04 chỉ render 3 tile — Sản phẩm, Nhóm vật tư, Tồn đầu kỳ. Nếu implementation render tile Phiếu nhập / Phiếu xuất / Tồn kho trong wave 04 = **STATE_MISSING / WRONG_VARIANT** severity P1. Nếu render badge "Sắp ra mắt" thay vì ẨN = **WRONG_TEXT / WRONG_VARIANT** (BA quyết định hide-only, không badge).
2. **Verbatim label (M-22)**: 3 tile enabled phải verbatim "Sản phẩm" / "Nhóm vật tư" / "Tồn đầu kỳ" — không paraphrase ("Kho sản phẩm" / "Nhóm hàng hóa" / "Tồn kho đầu kỳ" đều FAIL).
3. **AppBar title (M-28 hard rule)**: "Quản lý kho hàng" phải là `textSubtitleS4` (16/SemiBold/24) — không được resolve khác token dù screenshot có vẻ giống. Kiểm binding.
4. **Icon fidelity**: mỗi tile 1 SVG asset custom composite (clipboard / box-check / clipboard-arrow-down / clipboard-arrow-up / warehouse / calendar). Không phải Material `Icons.*`. Verify assets tồn tại `assets/icons/inventory_menu_*.svg`.
5. **Tap behavior (AC-5)**: tap tile push route sub-module (Wave 04 mapping: Sản phẩm → `FEAT-CAT-PROD-LIST` list; Nhóm vật tư → `FEAT-CAT-GRP-LIST` list; Tồn đầu kỳ → `FEAT-OB-LIST` list). Back preserved.
6. **Empty state (EC-2)**: nếu test simulate cả 6 tile ẩn → verify empty state "Chưa có module nào khả dụng" render + icon placeholder. Wave 04 không hit case này (3 tile enabled).
7. **Reflow grid**: khi 1 tile ẩn (Wave 04 case: 3 tile ẩn) → tile còn lại giữ thứ tự gốc, reflow 2-col grid (row 1 = [Sản phẩm | Nhóm vật tư], row 2 = [Tồn đầu kỳ | empty]). Không đẩy tile lên slot của tile ẩn phía trước.
8. **AppSizes.spacing12 out-of-scale**: Figma dùng padding + gap 12px. Scale AppSizes hiện có `{0, 4, 8, 16, 32, 52}`. DEV có 2 lựa chọn: (a) escalate design system thêm `spacing12`, (b) literal `EdgeInsets.all(12)` / `Gap(12)` với comment. Test verify layout khớp — không cần verify token name (nếu (b)).
9. **Interaction state**: Figma không khai pressed/disabled. Verify tap có ripple/highlight feedback (per `SingleTapDetector` R-TAP rules-mobile).
10. **Wave gating source of truth**: state matrix trong FEAT §3 + BR-INV-MENU-002. Wave 04 mapping cross-ref với `Plan/WAVE-SEQUENCE.md` W04 scope.
