---
feat: FEAT-INS-STL-CREATE
feat_file: Product/features/FEAT-INS-STL-CREATE.md
wave_feat_file: Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-STL-CREATE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=553-27738&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "553:27738"
fetched_at: "2026-06-18T07:10:00+07:00"
oracle_version: 1
wave_focus: "Panel Tổng giá dịch vụ 3-block snapshot (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) — Figma rendered TAB-SWITCHER (KH thanh toán | BH thanh toán) thay vì 2-cột song hành như CR-20260616-02 mô tả — log drift cho BA/PO"
screenshots:
  - assets/wave02-ins-stl-create/_full.png
  - assets/wave02-ins-stl-create/553-26529.png
  - assets/wave02-ins-stl-create/553-26530.png
  - assets/wave02-ins-stl-create/553-28214.png
  - assets/wave02-ins-stl-create/553-28331.png
  - assets/wave02-ins-stl-create/553-28374.png
  - assets/wave02-ins-stl-create/553-28743.png
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (per-section: 553:28331, 553:28743, 553:26529, 553:26241, 553:26530 — main full-screen 553:25702 too large, drilled to children)
  get_screenshot: success (7 per-section PNGs + _full.png from previous run)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (Figma chỉ render 1 main state — "Xác nhận tạo phiếu quyết toán - full" có Bảo hiểm; compactNoInsurance variant suy luận từ AC-2 + BR-INS-STL-CRE-009 + sibling baseline FEAT-STL-CREATE — không có frame riêng compact trong section)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (panel read-only — không có hover/focus/pressed; button "Xác nhận" chỉ render default state)
---

# Oracle — FEAT-INS-STL-CREATE (mobile) · W02

> Re-fetched 2026-06-18 sau khi MCP settings patched. Đây là FULL oracle (Cấp 1-5 + screenshots).
> Status: **success** (không có `status` field — không phải `MCP_UNAVAILABLE`).
>
> **Discovery LỚN: Figma KHÔNG hiển thị layout 2-cột song hành như CR-20260616-02 mô tả.** Figma render
> **TAB-SWITCHER** (KH thanh toán | BH thanh toán) — user tap tab để chuyển giữa 2 cột. Đây là DRIFT
> nghiêm trọng cần BA/PO confirm. Xem §"Figma Drift Notes" bên dưới.

---

## Screen Inventory

> Section ID `553:27738` "FEAT-INS-STL-CREATE Tạo phiếu quyết toán" chứa **4 frame screen** top-level:

| # | Screen state | nodeId | size | screenshot |
|---|---|---|---|---|
| 1 | **"Xác nhận tạo phiếu quyết toán - full"** — màn xác nhận tạo phiếu QT (Dịch vụ xe, SO **có** Bảo hiểm), panel "Tổng giá dịch vụ" mode **fullInsurance** (3 khối đầy đủ, tab-switcher BH/KH); contains nested status bar (553:26528) + navbar (553:26529) + body sections + action bar (553:26530) | `553:25702` | 375×2194 | assets/wave02-ins-stl-create/_full.png |
| 2 | Sub-frame nested "Tạo mới yêu cầu báo giá" (variant naming carry-over từ scaffold màn khác — child của 553:25702) | `553:25703` | 375×2281 | (rendered as part of _full.png) |
| 3 | **"Tạo mới yêu cầu báo giá"** (sub-variant — Tạo phiếu QT loại đơn giản, có thể là chế độ compact?) | `553:25972` | 375×812 | (Figma render transparent — không có content nhìn thấy; bỏ qua) |
| 4 | **"Chi tiết phiếu dịch vụ"** — màn Chi tiết SO (entry point, screen trước màn tạo QT) — bao gồm Info DV + Thanh toán (553:28216) / Info KH (553:28218) / Info xe (553:28223). Dùng làm reference flow context. | `553:28214` | 375×1682 | assets/wave02-ins-stl-create/553-28214.png |

**Key section frames bên trong 553:25702 (màn fullInsurance)**:

| Section | nodeId | size | screenshot |
|---|---|---|---|
| Status bar (iOS) | `553:26528` | 375.5×44 | (in _full.png) |
| Navbar "Tạo phiếu quyết toán" (back arrow + title) | `553:26529` | 375.5×52 | assets/wave02-ins-stl-create/553-26529.png |
| **AC-9 block container**: "Bảng 'Chi tiết theo bên thanh toán'" — chứa Phân bổ BH + Tổng giá DV section (gồm Chi tiết theo bên thanh toán + Khoản mục + Cân thanh toán + Tổng thanh toán) | `553:28331` | 375×638 | assets/wave02-ins-stl-create/553-28331.png |
| **AC-10 standalone**: "Bảng 'Phân bổ Bảo hiểm'" (5 dòng điều chỉnh, có nút "Sửa" visible — nhưng AC-6/BR-INS-STL-CRE-009 yêu cầu read-only — drift?) | `553:28743` | 375×216 | assets/wave02-ins-stl-create/553-28743.png |
| **AC-11 standalone**: "Khối 'Cân thanh toán'" (chỉ section title + 1 dòng "Khách hàng thanh toán") | `553:28374` | 343×48 | assets/wave02-ins-stl-create/553-28374.png |
| Action bar variant 1 "Tiếp tục" (chỉ visible từ entry flow, 553:25703) | `553:26241` | 375×100 | (rendered transparent — skip) |
| Action bar variant 2 **"Xác nhận"** (primary action — 1 button full-width) | `553:26530` | 375×100 | assets/wave02-ins-stl-create/553-26530.png |

**Layout overview (theo _full.png + 553-28331.png)**:

Top-down stack trong 553:25702:
1. Status bar (iOS)
2. Navbar "Tạo phiếu quyết toán" (back + title)
3. Body (scroll):
   - Section SO snapshot (Info DV + Thanh toán + Info KH + Info xe — read-only — baseline FEAT-STL-CREATE)
   - Section "Khách hàng chi trả" + "Bảo hiểm chi trả" (baseline FEAT-STL-CREATE AC-8/AC-9, bảng dịch vụ + phụ tùng)
   - **Block "Phân bổ Bảo hiểm"** (553:28743 standalone OR 553:28333 nested in 553:28331) — 5 dòng điều chỉnh
   - **Block "Tổng giá dịch vụ"** (panel container 553:28335):
     - Section title "Tổng giá dịch vụ" (18px bold)
     - Section "Chi tiết theo bên thanh toán" (14px semibold label)
     - **Tabbar switcher** (553:28349) — 2 tabs: "KH thanh toán" (inactive) | "BH thanh toán" (active blue)
     - Bảng "Khoản mục" + 4 dòng: Dịch vụ / Phụ tùng / VAT / Cộng sau VAT (theo tab đang chọn)
     - Divider (line 553:28373)
     - Section "Cần thanh toán" (label — note spelling "Cần" trong Figma, không phải "Cân")
     - Dòng "Khách hàng thanh toán" — 15.000.000đ
   - **Highlight box "Tổng thanh toán"** (553:28384) — ô grey (`#f3f3f4`), giá trị **38.440.000đ** (text blue `#0052ff` bold)
4. Action bar — 1 nút **"Xác nhận"** (primary blue full-width, 553:26530)

---

## Component Inventory

> Mobile = Flutter widget catalog (`lib/ui/widgets/`). Mapping từ Figma → expected Flutter widgets.

### Screen: "Xác nhận tạo phiếu quyết toán" (`553:25702`)

**Chrome layer (statusbar + navbar)**:
- `Status bar` × 1 (iOS native — không touch, system overlay) — không cần Flutter widget riêng
- `CustomAppBar` × 1 (Flutter `lib/ui/widgets/app_bar/custom_app_bar.dart`)
  - leading: back icon (`vuesax/linear/arrow-left`, 20×20px)
  - center title: text "Tạo phiếu quyết toán" (16px Semi-Bold Inter, `#262626`)
  - trailing: empty 20×20 slot (placeholder)

**Body — Section snapshot SO (baseline FEAT-STL-CREATE — out of scope CR này)**:
- Section: "Info DV + Thanh toán" / "Info KH" / "Info xe" — read-only blocks (text + dropdown disabled)

**Body — Block "Phân bổ Bảo hiểm" (`553:28743` standalone)**:
- Container card × 1 — bg `#ffffff`, padding 16px, gap 16px column
- Header row × 1: text "Phân bổ bảo hiểm" (18px Bold Inter `#262626`) + nút "Sửa" với icon edit-2 (Figma render `opacity-0` — hidden trong context CREATE mode; same component reused từ adjustment mode)
- 5 adjustment rows (each row: `Row` justify-between, gap 8px column wrapper):
  - "CK liên kết BH — Vật tư" — value `540.000đ`
  - "CK liên kết BH — Công dịch vụ" — value `50.000đ`
  - "Giảm trừ bồi thường" — value `50.000đ`
  - "Khấu hao vật tư / thay mới" — value `45.000.000đ`
  - "Khấu trừ BH" — value `5.000.000đ`
- Labels: 12px Regular Inter `#262626` (color = base/text-cd-garage neutral)
- Values: 14px Medium Inter `#262626` (NO color highlighting in Figma — drift vs AC-4)

**Body — Block "Tổng giá dịch vụ" (`553:28335` container nested trong 553:28331)**:
- Container card × 1 — bg `#ffffff`, padding 16px, gap 16px column
- Header row × 1: text "Tổng giá dịch vụ" (18px Bold Inter `#262626`) + collapse-chevron icon `vuesax/linear/arrow-down` (24×24, `opacity-0` hidden — collapse affordance reserved)
- Sub-section "Chi tiết theo bên thanh toán":
  - Label "Chi tiết theo bên thanh toán" (14px Semi-Bold Inter `#262626`)
  - **TABBAR switcher** (`553:28349` — reuse `_Partials / Tabs 1` design-system component, `40:302` Slot):
    - bg `#f3f4f6` (tailwind gray/100), padding 4px, rounded 8px
    - tab "KH thanh toán" — inactive: text `#595e69` (base/text-secondary), bg transparent
    - tab "BH thanh toán" — active: text `#0052ff` (base/button-background-primary-cd-garage), bg `#ffffff` rounded 6px
- "Khoản mục" subsection:
  - Header row: label "Khoản mục" (14px Semi-Bold `#262626`)
  - 4 rows (Row justify-between):
    - "Dịch vụ" — `540.000đ`
    - "Phụ tùng" — `50.000đ`
    - "VAT" — `50.000đ`
    - "Cộng sau VAT" — `50.000đ`
  - Labels: 12px Regular `#262626`; values: 14px Medium `#262626` (all neutral)
- Divider line × 1 (Line 204 — img asset, full width 343px, 1px)
- "Cần thanh toán" subsection (note: Figma spelling "Cần" not "Cân" — confirmed drift):
  - Label "Cần thanh toán" (14px Semi-Bold `#262626`)
  - 1 row: "Khách hàng thanh toán" (12px Regular `#262626`) — `15.000.000đ` (14px Medium `#262626`)
- Bottom highlight box "Tổng thanh toán" (`553:28384`):
  - bg `#f3f3f4` (base/bg-secondary grey), padding 12px, rounded 8px
  - Row justify-between: "Tổng thanh toán" (14px Semi-Bold `#262626`) | `38.440.000đ` (14px Bold `#0052ff`)

**Footer — Action bar**:
- `AppButton` × 1 (full width):
  - Variant: `.primary()` — bg `#0052ff`, padding 12px×16px, rounded 8px
  - Label "Xác nhận" — 16px Bold Inter `#ffffff`
  - Container has shadow `0px -4px 12px rgba(0,0,0,0.06)` (above-the-bar drop shadow up)
  - Background container bg `#ffffff` rounded top 8px

**Section dividers**: 6px height bg `#e8e8ea` (base/bg-primary `Color(0xFFE8E8EA)`) horizontal strips between cards — observed at 553:28332 (before Phân bổ BH) + 553:28334 (between Phân bổ BH and Tổng giá DV).

---

## Variant & State

### `ServiceTotalPanelWidget` (block "Tổng giá dịch vụ" — `553:28335`)

- **variants** (theo AC-2 + BR-INS-STL-CRE-009):
  - **`fullInsurance`** — SO có Bảo hiểm → 3 khối: Chi tiết theo bên thanh toán (với **tabbar switcher** BH/KH) + Phân bổ Bảo hiểm (5 dòng, render trong block standalone 553:28743 ở trên) + Cân thanh toán (3 dòng: BH+KH+Tổng). **Đây là variant Figma render trong 553:25702**.
  - **`compactNoInsurance`** — SO không có BH → suy luận: 1 cột KH (tabbar có thể ẩn vì chỉ có 1 tab) + ẨN khối Phân bổ Bảo hiểm + Cân thanh toán 2 dòng (KH + Tổng). **KHÔNG có frame riêng trong Figma — agent-test-ui phải verify dynamic render bằng widget test.**

- **states observed**:
  - `default` (Loaded — render từ snapshot SO, panel hiển thị đầy đủ data)
  - `loading` (suy luận từ wave spec §3 AC-1 — chưa render trong Figma; expected: skeleton hoặc CircularProgressIndicator)
  - `error` (suy luận từ wave spec §4.9 — chưa render; expected: SnackBar "Không tải được thông tin" + nút Thử lại)

- **interaction states**: 
  - Tabbar tab tap: chuyển active state giữa "KH thanh toán" và "BH thanh toán" (Figma render BH thanh toán = active blue). Tap feedback: Flutter default ripple.
  - Phần "5 dòng điều chỉnh" + "Khoản mục rows" + "Cần thanh toán" + "Tổng thanh toán" + values: **read-only** — không tap-edit, không có hover/focus.

### Tabbar switcher (`553:28349` — design-system component)

- **variants** (theo `_Partials / Tabs 1` shared component):
  - `KH thanh toán` tab inactive: bg transparent, text `#595e69`
  - `KH thanh toán` tab active: bg `#ffffff`, text `#0052ff`
  - `BH thanh toán` tab inactive: bg transparent, text `#595e69`
  - `BH thanh toán` tab active: bg `#ffffff`, text `#0052ff` ✓ (Figma render trạng thái này)
- **states observed**: `active` (BH thanh toán) + `inactive` (KH thanh toán). Hover/focus N/A trên mobile.

### `InsuranceAllocationWidget` (block "Phân bổ Bảo hiểm" — `553:28743`)

- **variants**:
  - Trong context **TẠO PHIẾU QT** (CREATE mode — feature này): nút "Sửa" **hidden** (`opacity-0`) — read-only mode.
  - Trong context **SO ADJUSTMENT** (FEAT-INS-SO-ADJUSTMENT sibling): cùng component, nút "Sửa" visible → tap mở dialog/sheet sửa allocation.
- **conditional render**: section ẨN HOÀN TOÀN khi `soHasInsurance == false` (compactNoInsurance variant).
- **states**: `default` read-only (Figma).

### `AppBar` (`553:26529`)

- **variants**: standard navbar with back + title (no trailing actions visible in Figma).
- **states**: `default`. Tap back → navigator pop (Flutter default).

### Nút "Xác nhận" (`I553:26530;3:18093`)

- **variants**: `primary` (full-width, bg `#0052ff`, label `#ffffff`).
- **states**:
  - `enabled` ✓ (Figma render)
  - `disabled` (suy luận từ wave spec §3 AC-7 — khi SubmittingState — chưa có Figma frame)
  - `pressed` — Flutter default `InkWell` ripple
- Tap target: 56px tổng (button content 48px + padding 16px×16px container) — ≥ 48dp WCAG OK.

### Field "Tổng tiền bảo hiểm trả" (CR change — AC-6 + BR-INS-STL-CRE-003 + CNF-INS-001)

- **Figma NOT rendered explicitly trong 553:25702** — feature mở rộng FEAT-STL-CREATE baseline. Frame baseline có field này nhưng KHÔNG nằm trong section 553:27738 fetch range.
- **Invariant verbal (từ AC-6)**: trường này phải render = `Text` widget (read-only) không phải `TextFormField`. agent-test-ui assert qua widget test: `find.byType(Text)` cho field này, `findsNothing` cho `TextFormField` mang tag/key tương ứng.

### Field "Tổng tiền khách trả" (baseline — giữ nguyên FEAT-STL-CREATE AC-10)

- Baseline behavior — `TextFormField` editable. KHÔNG đổi trong CR này.

---

## Text Content

> Verbatim tiếng Việt từ Figma render — tất cả node text đã verify trực tiếp từ MCP `get_design_context`.

### Chrome
- **"Tạo phiếu quyết toán"** — Navbar title (553:I26529;49:13009; subtitle/S4: 16px Semi-Bold lineHeight 24)

### Block "Phân bổ Bảo hiểm" (553:28743)
- **"Phân bổ bảo hiểm"** — section title (Heading/H3: 18px Bold lineHeight 26 `#262626`)
- **"Sửa"** — button label (hidden in CREATE mode, opacity-0; visible in SO-ADJ mode). 14px Semi-Bold `#0052ff`
- 5 dòng (label 12px Regular `#262626` | value 14px Medium `#262626`):
  - **"CK liên kết BH — Vật tư"** | `540.000đ`
  - **"CK liên kết BH — Công dịch vụ"** | `50.000đ`
  - **"Giảm trừ bồi thường"** | `50.000đ`
  - **"Khấu hao vật tư / thay mới"** | `45.000.000đ`
  - **"Khấu trừ BH"** | `5.000.000đ`

### Block "Tổng giá dịch vụ" (553:28335 nested trong 553:28331)
- **"Tổng giá dịch vụ"** — panel title (Heading/H3: 18px Bold lineHeight 26 `#262626`)
- **"Chi tiết theo bên thanh toán"** — subsection label (Subtitle/S5: 14px Semi-Bold lineHeight 20 `#262626`)
- Tabbar (Body/B5: 14px Medium):
  - **"KH thanh toán"** — tab inactive (`#595e69`)
  - **"BH thanh toán "** — tab active (`#0052ff`) — note: có trailing space trong text node `553:28348;40:292`
- **"Khoản mục"** — header label (Subtitle/S5: 14px Semi-Bold `#262626`)
- 4 dòng (label Caption/C7: 12px Regular `#262626` | value Body/B5: 14px Medium `#262626`):
  - **"Dịch vụ "** (trailing space) | `540.000đ`
  - **"Phụ tùng "** (trailing space) | `50.000đ`
  - **"VAT "** (trailing space) | `50.000đ`
  - **"Cộng sau VAT "** (trailing space) | `50.000đ`
- **"Cần thanh toán"** — subsection label (Subtitle/S5: 14px Semi-Bold `#262626`) — **NOTE Figma typo: "Cần" not "Cân"**
- 1 dòng: **"Khách hàng thanh toán"** (12px Regular `#262626`) | `15.000.000đ` (14px Medium `#262626`)
- Highlight box "Tổng thanh toán" (553:28384):
  - **"Tổng thanh toán"** (Subtitle/S5: 14px Semi-Bold `#262626`)
  - `38.440.000đ` — Heading/H5 (14px Bold lineHeight 20 `#0052ff` — base/text-active-primary-cd-vendor)

### Action bar
- **"Xác nhận"** — primary button label (Heading/H4: 16px Bold lineHeight 24 `#ffffff`)

### Action bar variant alt (553:26241 — entry flow context)
- **"Tiếp tục "** (trailing space) — primary button label same style as Xác nhận

### Text NOT rendered in 553:27738 section (suy luận từ FEAT + wave spec):
- "Hủy" — secondary button (FEAT AC mention 2 buttons but Figma render only 1 button "Xác nhận")
- "Tổng tiền khách trả" / "Tổng tiền bảo hiểm trả" — baseline FEAT-STL-CREATE labels (out of CR scope frame)
- "Tạo phiếu quyết toán thành công" — toast post-action (out of frame)
- Error messages — out of frame

---

## Design Tokens

> Hex values verified directly from `get_variable_defs(553:27738)`. Token map sang Flutter `AppColors`/`AppTextStyle` per `_ref-mobile-transform-figma.md §1.5`.

### Colors (verified hex from Figma)

| Role | Hex | Figma token | Expected Flutter token |
|---|---|---|---|
| Text primary (heading, label, value 14px) | `#262626` | `Base/text-CD Garage` | `AppColors.textPrimary` |
| Text secondary (tab inactive) | `#595e69` | `Base/text-Secondary` / `Color/Neutral/700` | `AppColors.textSecondary` (NeutralColor.s700) |
| Text tertiary | `#888c94` | `Base/text-Tertiary` / `Color/Neutral/500` | `AppColors.textTertiary` |
| Text active blue (Tổng thanh toán value + tab active + Sửa label) | `#0052ff` | `Base/text-Active-Primary-CD Garage` / `Base/button-Background-Primary-CD Garage` | `AppColors.textActivePrimary` / `AppColors.buttonBackgroundPrimary` |
| Text white (button label) | `#ffffff` | `Color/Base/white` | `AppColors.textWhite` |
| Bg base (panel cards) | `#ffffff` | `Base/bg-Base` | `AppColors.bgBase` |
| Bg primary (divider strips 6px) | `#e8e8ea` | `Base/bg-Primary` / `Color/Neutral/100` | `AppColors.bgPrimary` |
| Bg secondary (Tổng thanh toán highlight box) | `#f3f3f4` | `Base/bg-Secondary` / `Color/Neutral/50` | `AppColors.bgSecondary` |
| Bg tabbar container | `#f3f4f6` | `tailwind colors/gray/100` | (close to `bgSecondary`; verify) |
| Bg active blue (Xác nhận button) | `#0052ff` | `Base/bg-Active-CD Garage` | `AppColors.bgActive` / `buttonBackgroundPrimary` |
| Border primary | `#e8e8ea` | `Base/border-Primary` | `AppColors.borderPrimary` |

> **Tokens NOT used / available but unused in this frame** (cho reference):
> - `Base/text-Success` `#15aa2c` — green (text success / green color s600) — **KHÔNG dùng** trong frame này
> - `Base/text-Warning` `#ff6b00` — orange — **KHÔNG dùng**
> - `Base/text-Error` `#ed1f42` — red — **KHÔNG dùng**
> - `Base/bg-Success` `#f0fdf1` — **KHÔNG dùng**

### Typography (verified styles from Figma)

| Role | Style spec | Figma token | Expected Flutter token |
|---|---|---|---|
| Panel title (18px Bold) — "Tổng giá dịch vụ", "Phân bổ bảo hiểm" | Inter Bold 18 / lineHeight 26 / letterSpacing 0 | `Heading/H3` | `AppTextStyle.textHeadingH3` |
| Navbar title (16px SemiBold) — "Tạo phiếu quyết toán" | Inter Semi Bold 16 / lineHeight 24 / ls 0 | `Subtitle/S4` | `AppTextStyle.textSubtitleS4` |
| Button label primary (16px Bold) — "Xác nhận" / "Tiếp tục" | Inter Bold 16 / lineHeight 24 / ls 0 | `Heading/H4` | `AppTextStyle.textHeadingH4` |
| Subsection header (14px SemiBold) — "Chi tiết theo bên thanh toán", "Khoản mục", "Cần thanh toán", "Tổng thanh toán" | Inter Semi Bold 14 / lineHeight 20 / ls 0 | `Subtitle/S5` | `AppTextStyle.textSubtitleS5` |
| Body value (14px Medium) — amount text `540.000đ`, `38.440.000đ` (BH amount = Bold variant) | Inter Medium 14 / lineHeight 20 / ls 0 | `Body/B5` | `AppTextStyle.textBodyB5` |
| Highlight value blue (14px Bold) — `38.440.000đ` (Tổng thanh toán) | Inter Bold 14 / lineHeight 20 / ls 0 | `Heading/H5` | `AppTextStyle.textHeadingH5` |
| Caption label (12px Regular) — "CK liên kết BH...", "Dịch vụ", "Khách hàng thanh toán" row labels | Inter Regular 12 / lineHeight 18 / ls 0 | `Caption/C7` | `AppTextStyle.textCaptionC7` |
| Tab label (14px Medium) — "KH thanh toán", "BH thanh toán" | Inter Medium 14 / lineHeight 20 / ls 0 | `Body/B5` | `AppTextStyle.textBodyB5` |
| Sửa label (14px SemiBold) — button "Sửa" | Inter Semi Bold 14 / lineHeight 20 / ls 0 | `Subtitle/S5` | `AppTextStyle.textSubtitleS5` |

font-family: **Inter** (mọi text) · letter-spacing: **0** (mọi token verified).

### Spacing (verified from Figma)

| Element | Value | Figma token | Expected Flutter token |
|---|---|---|---|
| Card padding (Phân bổ BH, Tổng giá DV) | 16px all | `Spacing - Border/16` | `EdgeInsets.all(AppSizes.spacing16)` |
| Gap dọc giữa header row và body trong card | 16px | `Spacing - Border/16` | `Gap(AppSizes.spacing16)` |
| Gap giữa các adjustment rows (5 dòng Phân bổ + 4 dòng Khoản mục) | 8px | `Spacing - Border/8` | `Gap(AppSizes.spacing8)` |
| Gap nội tabbar (giữa 2 tab) | 10px (Slot gap) | (no token) | literal 10 (or `Gap(AppSizes.spacing8)` close match) |
| Padding nội tabbar container | 4px | `Spacing - Border/4` | `EdgeInsets.all(AppSizes.spacing4)` |
| Padding nội tab (mỗi tab) | 24px×4px (px×py) | `Spacing - Border/24`, `/4` | `EdgeInsets.symmetric(horizontal: spacing24, vertical: spacing4)` (note spacing24 not in scale §1.5 — use literal 24) |
| Padding Button (Sửa) | 12px×8px | `Spacing - Border/12`, `/8` | `EdgeInsets.symmetric(horizontal: spacing12 (literal), vertical: spacing8)` |
| Padding Tổng thanh toán highlight box | 12px all | `Spacing - Border/12` | literal 12 (no spacing12 token §1.5) |
| Padding Action bar Xác nhận button | 12px×16px (py×px) | — | `EdgeInsets.symmetric(horizontal: spacing16, vertical: 12)` |
| Padding container ngoài action bar | 16px all | — | `EdgeInsets.all(AppSizes.spacing16)` |
| Section divider strip height | 6px | (literal) | `Container(height: 6, color: AppColors.bgPrimary)` |
| Tap target Xác nhận button | h≥48dp | — | `AppButtonSize.medium` |

### Radius / Shadow / Border

| Element | Value | Figma token | Expected Flutter |
|---|---|---|---|
| Tabbar container radius | 8px | `Spacing - Border/8` | `BorderRadius.circular(8)` |
| Tabbar tab radius | 6px | `border radius/md` | `BorderRadius.circular(6)` |
| Card row inner (allocation row container) radius | 8px | — | `BorderRadius.circular(8)` |
| Button Sửa radius | 8px | — | `BorderRadius.circular(8)` |
| Tổng thanh toán box radius | 8px | — | `BorderRadius.circular(8)` |
| Xác nhận button radius | 8px | — | `BorderRadius.circular(8)` |
| Action bar container radius (top) | 8px top-left + 8px top-right | — | `BorderRadius.only(topLeft: 8, topRight: 8)` |
| Action bar drop shadow | `0px -4px 12px rgba(0,0,0,0.06)` | (literal) | `BoxShadow(offset: Offset(0,-4), blurRadius: 12, color: Colors.black.withOpacity(0.06))` |
| Divider line (line 204 in panel) | 1px solid img asset | — | `Divider(height: 1, thickness: 1)` hoặc `Container(height: 1, color: borderPrimary)` |
| Border-width tabbar/cards | not visible (no border, only bg color) | — | — |

---

## Screenshots

| Section | Node ID | Path | Status |
|---|---|---|---|
| Full screen (entry _full preserved) | `553:25702` | `assets/wave02-ins-stl-create/_full.png` | success (220KB, retained from previous run) |
| Navbar "Tạo phiếu quyết toán" | `553:26529` | `assets/wave02-ins-stl-create/553-26529.png` | success (2.1KB, 375×52) |
| Action bar "Xác nhận" primary button | `553:26530` | `assets/wave02-ins-stl-create/553-26530.png` | success (3.0KB, 375×116) |
| Entry context — Chi tiết phiếu dịch vụ (Info DV+KH+xe) | `553:28214` | `assets/wave02-ins-stl-create/553-28214.png` | success (100KB, 375×1682) |
| AC-9 panel "Chi tiết theo bên thanh toán" + nested Khoản mục + Cần thanh toán + Tổng thanh toán | `553:28331` | `assets/wave02-ins-stl-create/553-28331.png` | success (32KB, 375×638) |
| AC-11 standalone "Cân thanh toán" subsection | `553:28374` | `assets/wave02-ins-stl-create/553-28374.png` | success (3.3KB, 343×48) |
| AC-10 standalone "Phân bổ Bảo hiểm" (5 dòng) | `553:28743` | `assets/wave02-ins-stl-create/553-28743.png` | success (11KB, 375×216) |
| Action bar "Tiếp tục" variant (entry flow) | `553:26241` | — | skipped — Figma rendered transparent 1×1 (no visible content in isolation) |
| Tạo mới yêu cầu báo giá sub-variant | `553:25972` | — | skipped — Figma rendered transparent 1×1 |

**Total: 7 PNGs (1 full + 6 sections) — retained `_full.png` + 6 new section PNGs.**

---

## Conditional Render Invariants

> Mục này = nơi agent-test-ui assert behavior conditional (Figma chỉ render 1 main variant fullInsurance — compact variant phải verify dynamic).

### CR-1 — Hiển thị có điều kiện panel "Tổng giá dịch vụ" theo SO có BH (AC-2 + BR-INS-STL-CRE-009)

| Điều kiện | Render |
|---|---|
| SO có ≥ 1 dòng Nguồn TT = Bảo hiểm | Panel mode **`fullInsurance`**: 3 khối đầy đủ — (a) Block "Phân bổ Bảo hiểm" 5 dòng (render trên), (b) Block "Tổng giá dịch vụ" với **TABBAR switcher** BH/KH + Khoản mục 4 rows + Cần thanh toán + Tổng thanh toán box |
| SO **không** có dòng BH (toàn bộ KH tự trả) | Panel mode **`compactNoInsurance`**: (a) ẨN block "Phân bổ Bảo hiểm" hoàn toàn, (b) Block "Tổng giá dịch vụ" giữ Khoản mục + Cần thanh toán nhưng **ẨN tabbar** (chỉ 1 bên KH, không có switcher) + Tổng thanh toán box; **không có frame Figma cho variant này** — agent-test-ui verify bằng widget test với fixture `soHasInsurance=false`. |

- Field signal: `soHasInsurance: bool` từ BFF query (FEAT §4 `PrepareCreateSettlement`).
- Widget API: `ServiceTotalPanelWidget(mode: FullInsuranceMode | CompactMode, readOnly: true)`.
- Panel **KHÔNG ẩn hẳn** — luôn render ít nhất chế độ rút gọn (wave spec §3 AC-2).

### CR-2 — Trường "Tổng tiền bảo hiểm trả" read-only computed (AC-6 · BR-INS-STL-CRE-003 · CNF-INS-001)

| Điều kiện | Render |
|---|---|
| SO có BH (phiếu QT BH) | Trường "Tổng tiền bảo hiểm trả" = **`Text` widget** read-only (KHÔNG `TextFormField`). Giá trị = `balanceSummary.bhPayment` server-computed. |
| SO không BH | Section "Bảo hiểm chi trả" không render → field này không tồn tại. |
| (Baseline) "Tổng tiền khách trả" | Giữ `TextFormField` editable. |

- **Widget invariant**: Mobile agent-test-ui assert `find.byType(TextFormField)` cho field này → `findsNothing`; assert `find.byType(Text)` chứa formatted amount.
- **Semantic invariant**: `Semantics(readOnly: true, value: formattedAmount, label: 'Tổng tiền bảo hiểm trả')`.
- **NOTE**: Field này KHÔNG nằm trong frame Figma 553:25702 fetched — verify bằng baseline FEAT-STL-CREATE production screenshot + DEV mobile spec (khi prefetch xong).

### CR-3 — Snapshot block phân bổ BH khi xác nhận (AC-7 · BR-INS-STL-CRE-002)

| Bước | Hành vi |
|---|---|
| User tap "Xác nhận" (button bottom bar) | Mobile dispatch mutation `CreateSettlement(serviceOrderId, ..., insuranceAdjustment: {...})` → BFF/BE |
| BE snapshot block | Server-side immutable snapshot: `payerBreakdown` + `adjustments[5 dòng]` + `settlementBalance` vào phiếu QT BH (atomic cùng phiếu QT KH) |
| Mobile UI | `LoadedState → SubmittingState → SuccessState`: button "Xác nhận" disabled khi submitting; success → toast "Tạo phiếu quyết toán thành công" + navigate về list/SO |

- Invariant: Mobile **KHÔNG** tự snapshot — BE là SSOT.
- Error mapping (wave spec §4.9):
  - `ERR-INS-STL-001` → AlertDialog "SO không hợp lệ"
  - `ERR-INS-STL-008` → AlertDialog "SO chưa có công ty BH"
  - `ERR-INS-STL-004` → SnackBar atomic rollback fail
  - `ERR-INS-003` → SnackBar warn-and-allow (BH thanh toán âm)
  - `ERR-NETWORK` → SnackBar + nút "Thử lại"

### CR-4 — RBAC (AC-8 · BR-STL-CRE-004)

| User role | Hành vi |
|---|---|
| `accountant` hoặc `garage-owner` | Route `/settlement/create/:serviceOrderId` cho phép; nút "Xác nhận" enabled |
| Role khác | Redirect → "không có quyền" hoặc nút "Xác nhận" ẩn |

- Permission check: `settlement.create` từ JWT claims (wave spec §4.6).

### CR-5 — Số liệu khớp cross-panel (FEAT §AC-5 lưu ý)

Mobile invariant: số liệu trên panel này **KHỚP** với:
- Panel "Tổng giá dịch vụ" trên màn SO chỉnh sửa (FEAT-INS-SO-ADJUSTMENT AC-11)
- Panel trên chi tiết phiếu QT BH (FEAT-INS-STL-DETAIL AC-6) sau khi tạo

agent-test-ui có thể assert qua e2e (SO → Tạo QT → Chi tiết QT) với fixture cố định.

### CR-6 — Edge cases (FEAT §6)

- **EC-1**: SO không BH → panel rút gọn (CR-1).
- **EC-2**: SO có BH nhưng "BH thanh toán" ≤ 0 → vẫn render + cho tạo (warn-and-allow `ERR-INS-003`, kế thừa FEAT-INS-SO-ADJUSTMENT).
- **EC-3**: Phân bổ chưa nhập (5 khoản = 0) → 5 dòng giá trị 0; "Bảo hiểm thanh toán" = Cộng sau VAT (BH).
- **EC-4**: SO đã có phiếu QT BH → BE block → AlertDialog `ERR-INS-STL-001`/`ERR-INS-STL-004`.

---

## Figma Drift Notes

> Các điểm Figma render KHÁC với FEAT spec / CR / wave-spec — agent-test-ui phải flag để BA/PO/Design confirm:

### DRIFT-1 — Layout "Chi tiết theo bên thanh toán": TABBAR vs 2-COLUMN ⚠️ HIGH

- **FEAT-INS-STL-CREATE.md AC-3**: "hiển thị bảng **2 cột** Khoản mục | 'Bảo hiểm thanh toán' | 'Khách hàng thanh toán'"
- **CR-20260616-02** (wave_focus): "áp 2-cột BH|KH"
- **Wave spec FEAT-INS-STL-CREATE.md mobile §3 AC-3**: "Mobile phải: hiển thị bảng dòng line item với 2 cột"
- **Figma render thực tế (553:28349, 553:28350)**: **TABBAR switcher** với 2 tabs "KH thanh toán" / "BH thanh toán" — user tap chuyển 1 cột active, KHÔNG render 2 cột song hành.
- **Impact**: Widget architecture khác hoàn toàn — `TabBar` + `IndexedStack` vs side-by-side `Row` 2-cột. agent-test-ui case PixelPerfect-verify phải dùng tabbar pattern.
- **Action**: Flag CR-20260616-02 sai gốc HOẶC Figma cần redesign. BA/PO confirm.

### DRIFT-2 — Color coding 5 dòng "Phân bổ Bảo hiểm": ALL NEUTRAL vs RED/GREEN ⚠️ HIGH

- **FEAT-INS-STL-CREATE.md AC-4**: 
  - "CK liên kết BH — Vật tư": dấu **−**, **màu xanh**
  - "CK liên kết BH — Công dịch vụ": dấu **−**, **màu xanh**
  - "Giảm trừ bồi thường": dấu **+**, **màu đỏ**
  - "Khấu hao vật tư / thay mới": dấu **+**, **màu đỏ**
  - "Khấu trừ BH": dấu **+**, **màu đỏ**
- **Figma render thực tế (553:28743 + nested in 553:28331)**: **TẤT CẢ 5 dòng** value text = `#262626` (neutral `Base/text-CD Garage`). **KHÔNG dấu +/−** prefix. **KHÔNG color coding** xanh/đỏ.
- **Sibling check** (W01 oracle FEAT-INS-STL-DETAIL/FEAT-INS-SO-ADJUSTMENT): W01 oracle ghi xanh/cam — nhưng đây là **panel màn TẠO**, Figma TẠO không có color coding.
- **Impact**: Visual contract spec mismatch. Test verify "color = red" sẽ fail.
- **Action**: BA/PO confirm: panel TẠO có cần color coding như FEAT viết KHÔNG, hay giữ neutral như Figma. Nếu giữ neutral → update FEAT AC-4 (loại bỏ "màu đỏ"/"màu xanh" text).

### DRIFT-3 — Color coding khối "Cân thanh toán": NO BLUE-GREEN/ORANGE BOXES vs SPEC ⚠️ HIGH

- **FEAT-INS-STL-CREATE.md AC-5**:
  - "Bảo hiểm thanh toán" (ô **xanh**)
  - "Khách hàng thanh toán" (ô **cam**)
  - "Tổng thanh toán" (ô **đen**)
- **Figma render thực tế**: 
  - "Khách hàng thanh toán" — text neutral `#262626`, no box wrap
  - "Tổng thanh toán" — bg `#f3f3f4` (grey), value `#0052ff` (blue text)
  - "Bảo hiểm thanh toán" — KHÔNG render explicit row trong frame (chỉ có 1 dòng "Khách hàng thanh toán" vì tab đang chọn BH; tabbar pattern => số liệu BH ở tab BH thanh toán)
- **Action**: BA/PO confirm: layout cân thanh toán giữ 1 row + tabbar pattern HAY 3 rows + colored boxes như AC-5 mô tả.

### DRIFT-4 — Spelling "Cần" vs "Cân" thanh toán ⚠️ MEDIUM

- **FEAT AC-5 + wave spec ARB**: "**Cân** thanh toán"
- **Figma text (553:28378)**: "**Cần** thanh toán"
- **Impact**: i18n key `settlement_balance_section_label` (wave spec §11 — chưa định nghĩa) nhưng wording mặc định khác.
- **Action**: BA confirm wording chuẩn. Suy đoán: "Cân thanh toán" (balance) đúng nghiệp vụ; "Cần thanh toán" có thể là Figma typo.

### DRIFT-5 — Action bar: 1 BUTTON vs 2 BUTTONS ⚠️ MEDIUM

- **Wave spec mobile §3 + sibling FEAT-STL-CREATE baseline**: 2 buttons "Hủy" (secondary) + "Xác nhận" (primary)
- **Figma render (553:26530)**: **1 button full-width "Xác nhận"** primary only. Không có nút "Hủy" trong action bar.
- **Action**: BA/PO confirm — "Hủy" có thể thay bằng back arrow trên AppBar (553:26529 có back icon).

### DRIFT-6 — Wording "BH thanh toán" / "KH chịu" (wave ARB) vs "Bảo hiểm thanh toán" / "Khách hàng thanh toán" (FEAT AC) ⚠️ LOW

- **FEAT AC-3 & AC-5**: "Bảo hiểm thanh toán" / "Khách hàng thanh toán"
- **Wave spec ARB §11**: `settlement_balance_insurance_row` = "BH thanh toán"; `settlement_balance_customer_row` = "KH chịu"
- **Figma render**:
  - Tabbar (553:28349): "KH thanh toán" / "BH thanh toán" (rút gọn — matches wave ARB tab)
  - Cần thanh toán row (553:28381): "Khách hàng thanh toán" (matches FEAT full wording)
- **Impact**: Trộn 2 conventions trong cùng frame. ARB key `settlement_balance_customer_row="KH chịu"` không khớp Figma render "Khách hàng thanh toán".
- **Action**: Wave spec ARB cần update để khớp Figma render (Khách hàng thanh toán cho row label; BH/KH thanh toán cho tab label).

### DRIFT-7 — Nút "Sửa" (553:I28743;16514:316149) visible trong Figma ⚠️ LOW

- **AC-6 + BR-INS-STL-CRE-009**: Panel "read-only" — không cho nhập/sửa tại màn này.
- **Figma render**: Frame 553:28743 standalone có button "Sửa" với edit-2 icon visible (opacity normal). Nhưng frame 553:28333 (nested trong 553:28331 main screen) cùng cấu trúc, button "Sửa" cũng visible.
- **Verify từ code context**: Button "Sửa" dùng cùng component `InsuranceAllocationWidget` shared với FEAT-INS-SO-ADJUSTMENT (sửa được). Trong context CREATE Figma render full opacity, KHÔNG ẩn nó.
- **Action**: DEV phải ẩn nút Sửa (`Visibility(visible: false)` hoặc opacity 0) khi component dùng trong CREATE mode (read-only). agent-test-ui verify `find.text('Sửa')` → `findsNothing` trong màn TẠO.

---

## Pixel-perfect Checklist Status

> Theo `_ref-test-figma-oracle-flow.md §4` — kiểm tra mỗi cấp sau khi fetch xong.

### P1 — Spacing — **COMPLETE**
- [x] Card padding 16px (Phân bổ BH + Tổng giá DV containers)
- [x] Gap 16px giữa header và body trong card
- [x] Gap 8px giữa các adjustment rows (5 dòng) + Khoản mục rows (4 dòng)
- [x] Padding tabbar 4px outer; tab 24px×4px
- [x] Padding Tổng thanh toán box 12px all
- [x] Padding action bar container 16px; button content 12px×16px
- [x] Section divider 6px height (between blocks)
- [x] Action bar shadow `0px -4px 12px rgba(0,0,0,0.06)`

### P1 — Interaction states — **PARTIAL**
- [x] Tabbar tab active/inactive — verified from Figma render (BH active, KH inactive)
- [ ] Tabbar tap feedback ripple — N/A trong Figma (Flutter default)
- [x] Nút "Xác nhận" enabled state (Figma render)
- [ ] Nút "Xác nhận" disabled state — N/A (not rendered, suy luận tap target 56px container, button content 48px)
- [ ] Tap target Xác nhận button ≥48dp — confirm via `AppButtonSize.medium`
- [x] Panel + 5 rows read-only — verified (no input field rendered)
- [ ] Sửa button hover — N/A mobile

### P2 — Typography đầy đủ — **COMPLETE**
- [x] font-family: Inter ✓ all texts
- [x] font-size: verified per element (10/12/14/16/18 from token map)
- [x] font-weight: verified (400/500/600/700)
- [x] line-height: verified per token (14/18/20/24/26)
- [x] letter-spacing: verified = 0 for all tokens

### P2 — Border / Radius — **COMPLETE**
- [x] Border-width: 0 (no border, chỉ bg color) — verified
- [x] Border-color: N/A (no border) — verified
- [x] Border-radius: 8px (cards, button, Tổng thanh toán box, allocation row); 6px (tab); 8px top-left+right (action bar container)
- [x] Divider line trong panel: 1px solid via img asset (Line 204)
- [x] Section divider strip: 6px height bg `#e8e8ea`

### P2 — Small component dimensions — **COMPLETE**
- [x] Sửa button: h ~32px (12px×8px padding + 16×16 icon + text)
- [x] Tab dimensions: h ~28px (24×4 padding + 14×20 text)
- [x] AppBar h 52px (375.5×52)
- [x] Action bar h 116px (375×116 — including home indicator + button container)
- [x] Status bar h 44px (iOS standard)
- [x] Icon size: back-arrow 20×20, edit-2 16×16, arrow-down 24×24 (hidden)

### P3 — Other — **COMPLETE**
- [x] box-shadow: action bar `0px -4px 12px rgba(0,0,0,0.06)`; cards no shadow
- [x] opacity: edit-2 button rendered opacity-0 in some variants (553:28743 nested in 553:28333 in main screen — opacity-0; 553:28743 standalone — full opacity) — see DRIFT-7
- [x] icon assets: arrow-left (back navbar), edit-2 (Sửa button), arrow-down (collapse chevron hidden)
- [x] z-index: action bar (Material default elevation via shadow), status bar (system)
- [x] overflow: panel content scroll → parent `SingleChildScrollView`

### Text verbatim — **COMPLETE**

Verified directly from Figma `get_design_context` text nodes — see "Text Content" section above. All text strings verbatim (including trailing spaces in "Dịch vụ ", "Phụ tùng ", "VAT ", "Cộng sau VAT ", "BH thanh toán ", "Tiếp tục ") and the spelling "Cần thanh toán" (vs FEAT "Cân").

---

## Notes for agent-test-ui (Session 2)

1. **Oracle status = SUCCESS** (no `status` field). agent-test-ui Case A1 (full oracle) per `rules-test-ui/references/design-traceability.md`.
2. **Conditional render coverage = priority** (CR-1..6) — coverage gate `≥1 conformance TC mỗi screen in-scope`.
3. **Cross-panel parity TC** (CR-5): so số liệu cross 3 panel (SO Edit / Tạo QT / Chi tiết QT BH) cùng fixture → snapshot immutable đồng nhất (BR-INS-STL-CRE-002).
4. **DRIFTS** — file BUGs với severity:
   - DRIFT-1 (HIGH): tabbar vs 2-column — BA confirm pattern.
   - DRIFT-2 (HIGH): color coding 5 dòng adjustment — BA confirm.
   - DRIFT-3 (HIGH): khối Cân thanh toán pattern.
   - DRIFT-4 (MED): "Cần" vs "Cân" spelling.
   - DRIFT-5 (MED): 1 vs 2 buttons action bar.
   - DRIFT-6 (LOW): wording ARB drift.
   - DRIFT-7 (LOW): nút Sửa hidden trong CREATE mode.
5. **CR-2 invariant** (Tổng tiền bảo hiểm trả = `Text` read-only): verify bằng widget test `find.byType(TextFormField)` → `findsNothing` cho field này. Field này KHÔNG nằm trong frame Figma 553:25702 — verify với baseline production + DEV spec.
6. **Compact variant** (compactNoInsurance): KHÔNG có Figma frame riêng — verify dynamic render bằng widget test fixture `soHasInsurance=false`.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 2 | TEST (agent-test-ui re-run — `/prefetch-figma-oracle mobile wave 02` FEAT-INS-STL-CREATE) | **REPLACE partial oracle với FULL oracle** sau MCP settings patched. Tất cả 4 MCP tool (`get_metadata`, `get_variable_defs`, `get_design_context`, `get_screenshot`) success. 5 cấp conformance complete (Screen/Component/Variant/Text/Tokens). 6 section PNGs + 1 `_full.png` (retained). 7 DRIFT notes documented (DRIFT-1 HIGH tabbar vs 2-col, DRIFT-2 HIGH color coding adjustments, DRIFT-3 HIGH Cân thanh toán pattern, DRIFT-4 MED Cần vs Cân, DRIFT-5 MED 1 vs 2 buttons, DRIFT-6 LOW ARB wording, DRIFT-7 LOW Sửa button hidden). CR-20260616-02 2-cột verdict = **MISMATCH** Figma (Figma renders tabbar switcher). CR-2 read-only Text widget invariant = **verified verbal** (field out-of-frame, depends on baseline + DEV spec). |
| 2026-06-18 | 1 | TEST (agent-test-ui session 1 — `/prefetch-figma-oracle mobile 02`) | Khởi tạo oracle cho FEAT-INS-STL-CREATE mobile (W02). Status `MCP_UNAVAILABLE` — 4 tool MCP Figma denied. Partial oracle theo §4b E4 supplementation. Cấp 1-5 partial. Screenshots: 0. CR-1..6 conditional render invariants documented làm coverage gate cho fallback. |
