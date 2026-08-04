---
feat: FEAT-CAT-GRP-DELETE
feat_file: Product/features/FEAT-CAT-GRP-DELETE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24250&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24250"
fetched_at: 2026-06-29T03:16:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (section + 2 popup frames)
  get_variable_defs: cached (App-Garage-V3)
  get_design_context: success (popovers 21254:52182 + 21254:52571)
  get_screenshot: success (3 PNG: _full + 2 popovers)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (2 popup variants)
  text_content: complete (verbatim)
  design_tokens: complete
  interaction_states: partial (no :pressed for buttons)
screenshots:
  - assets/wave03-cat-grp-delete/_full.png
  - assets/wave03-cat-grp-delete/21254-52182-confirm-popover.png
  - assets/wave03-cat-grp-delete/21254-52571-cannot-delete-popover.png
---

# Oracle — FEAT-CAT-GRP-DELETE (mobile) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Section `21555:24250` "FEAT-CAT-PROD-DELETE"
> (NOTE: section name dùng PROD — Figma legacy; thực chất là GRP-DELETE per registry).
>
> Section chứa **2 frame popup** đại diện 2 nhánh delete: **"Xác nhận" xoá** (happy path) vs
> **"Không thể xóa"** (blocked — group đã phát sinh mã SP nội bộ). Cả 2 đều render trên overlay
> đen mờ phủ màn nền.

---

## Screen Inventory

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Popup "Xác nhận" — xoá group (overlay) | `21254:52061` (overlay container) + `21254:52182` (popover card 343×202) | 375×812 overlay; 343×202 popup | `assets/wave03-cat-grp-delete/21254-52182-confirm-popover.png` |
| Popup "Không thể xóa" — group đã phát sinh SP | `21254:52450` (overlay) + `21254:52571` (popover card 343×222) | 375×812 overlay; 343×222 popup | `assets/wave03-cat-grp-delete/21254-52571-cannot-delete-popover.png` |
| (Aggregate) Section 2 popups | `21555:24250` | 4901×1100 | `assets/wave03-cat-grp-delete/_full.png` |

> Background screen (DetailContent + tabs + cards) ẩn (`hidden=true`) trong metadata — chỉ overlay
> + popover hiển thị. Background không phải scope FEAT-DELETE (đó là detail screen behind).

---

## Component Inventory

### Popover 1 — "Xác nhận" delete (`21254:52182`, 343×202)

| Component | Brief | Flutter mapping (expected) |
|---|---|---|
| Overlay scrim | `Views/Popovers/_Partials/Overlay`, full 375×812, bg semi-transparent dark | `Container(color: Colors.black54)` |
| Popover container | bg white `#ffffff`, radius 16, pt=24 px=16, overflow clip, flex col gap=16 center | `Container` w/ `BoxDecoration` |
| Text block (311×74) | Title "Xác nhận" Bold 18 `#262626` center + body "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Phụ tùng bảo dưỡng không?" Regular 14 `#262626` center (2 lines wrap) | `Column` |
| Hidden icon | `vuesax/bold/clipboard-close` 80×80 — hidden=true (legacy) | (skip) |
| Action bar (`21254:52187`, 343×88) | bg white, pb=24 pt=16 px=16, gap=8, radius top-left=8 top-right=8, shadow `0px -4px 12px rgba(0,0,0,0.06)`. 2 buttons flex equal | `Container` w/ `Row` |
| Button "Huỷ" (secondary) | flex=1, bg `#f3f3f4` (`bg-Secondary`), text `#262626` Bold 16, p=`px=16 py=12`, radius=8 | `AppButton.text` secondary |
| Button "Xác nhận" (primary brand-CD) | flex=1, bg `#0052ff` (`bg-Active-CD Garage`), text white Bold 16, same dims | `AppButton.text` primary |

### Popover 2 — "Không thể xóa" (`21254:52571`, 343×222)

| Component | Brief | Flutter mapping |
|---|---|---|
| Overlay scrim | Same — full 375×812 | `Container(color: Colors.black54)` |
| Popover container | bg white, radius 16, pt=24 px=16, overflow clip, flex col gap=16 center | `Container` |
| Text block (311×94) | Title "Không thể xóa" Bold 18 `#262626` center + body "Nhóm vật tư hàng hóa Phụ tùng bảo dưỡng đã phát sinh mã sản phẩm nội bộ nên không được xóa." Regular 14 `#262626` center (3 lines wrap) | `Column` |
| Hidden icon | `vuesax/bold/clipboard-close` 80×80 — hidden=true | (skip) |
| Action bar (`21254:52576`, 343×88) | Same dims, gap=8 — **1 button only** (full width) | `Container` w/ `Row` |
| Button "Đóng" (secondary) | flex=1 (single button stretches full width), bg `#f3f3f4`, text `#262626` Bold 16 | `AppButton.text` secondary |

---

## Variant & State

### Popover container
- **Variant 1 — Confirm**: 2-button footer (Huỷ + Xác nhận). Title "Xác nhận" + body Q-style.
- **Variant 2 — Blocked**: 1-button footer (Đóng). Title "Không thể xóa" + body explanation.
- **States**: shown (overlay full opacity) · dismissed (tap scrim — flag, baseline UX).

### Confirm popover button "Xác nhận" (primary destructive intent)
- **Variant**: bg `#0052ff` brand-CD primary (NOT red destructive — semantic destructive thực hiện trong handler).
- **States**: default. `:pressed` ripple Material. `:disabled` (during delete API call) → opacity 0.5 + loading spinner inline — baseline UX.

### Blocked popover button "Đóng"
- **Variant**: bg `#f3f3f4` secondary, single button full-width.
- **States**: default · `:pressed` ripple.

### Confirm popover button "Huỷ" (secondary)
- **Variant**: bg `#f3f3f4` (`bg-Secondary`), text `#262626` (textPrimary CD Garage), Bold 16.
- **States**: default · `:pressed` ripple.

> **DRIFT vs CREATE/EDIT bottom bar**: Trong DELETE popover, button "Huỷ" bg = `#f3f3f4` (`bg-Secondary`).
> Trong CREATE/EDIT/DETAIL bottom bar, button "Huỷ"/"Xoá " bg = `#eaeaea` (Dark/100). Implementer
> verify đúng token theo context (popover dùng semantic `bgSecondary`, screen bottom bar dùng legacy
> `Dark/100`). Flag BA chuẩn hoá.

---

## Text Content

> Verbatim từ `get_design_context(21254:52182)` + `get_design_context(21254:52571)`.

### Popover 1 — "Xác nhận" delete
- Title: **"Xác nhận"** (Bold 18 `#262626` center)
- Body: **"Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Phụ tùng bảo dưỡng không?"** (Regular 14 `#262626` center)
- Button cancel: **"Huỷ"** (Bold 16 `#262626`)
- Button confirm: **"Xác nhận"** (Bold 16 white)

### Popover 2 — "Không thể xóa"
- Title: **"Không thể xóa"** (Bold 18 `#262626` center) — NOTE: "xóa" (dấu sắc trên o)
- Body: **"Nhóm vật tư hàng hóa Phụ tùng bảo dưỡng đã phát sinh mã sản phẩm nội bộ nên không được xóa."** (Regular 14 `#262626` center)
- Button: **"Đóng"** (Bold 16 `#262626`)

> **Wording drift trap**:
> - "xóa" in title body (dấu sắc trên ó) — verbatim Figma.
> - "Bạn có chắc chắn muốn xóa..." có thể bind `{groupName}` placeholder runtime: "Bạn có chắc chắn
>   muốn xóa nhóm vật tư hàng hóa **{groupName}** không?" — verify FEAT ARB.
> - Tương tự "Nhóm vật tư hàng hóa {groupName} đã phát sinh..." popup 2.
> - Body popup 2 nhắc "mã sản phẩm nội bộ" — domain ràng buộc: group đã được link với product cản
>   xoá. Verify BR cho rule này.

---

## Design Tokens

> **Cached from `get_variable_defs(21555:24017)`** sibling.

### Colors

| Hex | Role | Token |
|---|---|---|
| `#ffffff` | Popover bg + action bar bg | `AppColors.bgBase` |
| `#262626` | Title + body text + "Huỷ"/"Đóng" button text | `AppColors.textPrimary` |
| `#f3f3f4` | "Huỷ" / "Đóng" button bg (`bg-Secondary`) | `AppColors.bgSecondary` |
| `#0052ff` | "Xác nhận" button bg (`bg-Active-CD Garage`) | `AppColors.bgActive` / `buttonBackgroundPrimary` |
| `#ffffff` | "Xác nhận" button text (`text-White`) | `AppColors.textWhite` |
| (overlay) | Semi-transparent black | `Colors.black54` (baseline — Figma overlay variable not exposed in vocab) |

### Typography

| Style | Used at | Token |
|---|---|---|
| `Heading/H3` Inter Bold 18/26 | Title "Xác nhận" / "Không thể xóa" | `AppTextStyle.textHeadingH3` |
| `Heading/H4` Inter Bold 16/24 | Button text "Huỷ"/"Xác nhận"/"Đóng" | `AppTextStyle.textHeadingH4` |
| `Caption/C5` Inter Regular 14/20 | Body text (Bạn có chắc chắn... / Nhóm VTHH... đã phát sinh...) | `AppTextStyle.textCaptionC5` |

### Spacing

| Element | Value | Token |
|---|---|---|
| Popover container | pt=24, px=16, gap=16 vertical | `EdgeInsets.fromLTRB(16, 24, 16, 0)` |
| Text block inner gap (title↔body) | `gap=8` vertical | `Gap(AppSizes.spacing8)` |
| Action bar | pb=24 pt=16 px=16, gap=8 buttons | mixed |
| Button inner padding | `px=16 py=12` | mixed |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| Popover container radius | `16px` | `BorderRadius.circular(16)` |
| Button radius | `8px` | `BorderRadius.circular(8)` |
| Action bar top radius | `top-left=8 top-right=8` | `BorderRadius.only(topLeft: 8, topRight: 8)` |
| Action bar shadow | `0px -4px 12px rgba(0,0,0,0.06)` | `BoxShadow(offset: Offset(0,-4), blurRadius: 12, color: Colors.black.withOpacity(0.06))` |
| Popover border | none | — |
| Overflow | `overflow-clip` on popover container | `clipBehavior: Clip.hardEdge` |

### Bounds

| Element | W × H |
|---|---|
| Overlay scrim | 375 × 812 (full screen) |
| Popover 1 (Confirm) | 343 × 202 |
| Popover 2 (Blocked) | 343 × 222 (taller — 3-line body) |
| Text block popover 1 | 311 × 74 (title 26 + gap 8 + body 40) |
| Text block popover 2 | 311 × 94 (title 26 + gap 8 + body 60) |
| Action bar (popover 1) | 343 × 88 (2 button row) |
| Action bar (popover 2) | 343 × 88 (1 button full-width) |
| Button (popover 1, 2-button) | flex=1 each ≈ 159.5 × 48 |
| Button (popover 2, 1-button) | flex=1 ≈ 327 × 48 |

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-grp-delete/_full.png` | `21555:24250` | Section full 2 popups side-by-side (4901×1100) |
| `assets/wave03-cat-grp-delete/21254-52182-confirm-popover.png` | `21254:52182` | Popover "Xác nhận" delete (343×202, golden) |
| `assets/wave03-cat-grp-delete/21254-52571-cannot-delete-popover.png` | `21254:52571` | Popover "Không thể xóa" blocked (343×222, golden) |

---

## Notes (oracle interpretation)

1. **2-branch UX flow**: tap "Xoá " trong DETAIL → API check ràng buộc → render popover 1 (allow)
   hoặc popover 2 (blocked).
2. **Section name "FEAT-CAT-PROD-DELETE" — Figma drift**: registry maps node sang `FEAT-CAT-GRP-DELETE`.
   Section name dùng "PROD" có thể là copy-paste legacy. Agent-test-ui không verify name; verify
   UI behavior + text content.
3. **Background "behind" popovers** (DetailContent + Info DV + Info xe + tabs + cards) thuộc product
   detail (PROD-DETAIL legacy) — hidden trong frame, KHÔNG phải GRP-DETAIL. Implementer mobile khi
   render popover từ GRP-DETAIL screen sẽ overlay trên GRP-DETAIL layout (different from this Figma
   mock background). Verify chỉ phần popover + scrim, KHÔNG verify background.
4. **Destructive button color drift**: "Xác nhận" dùng brand-CD blue `#0052ff` thay vì red `#ed1f42`
   destructive convention. Mobile design pattern — verify FEAT có alternative pattern không (vd
   red Xác nhận xoá để cảnh báo strong). Flag BA.
5. **"Đóng" button đứng riêng full-width** popover 2 — implementer dùng `Row(children: [Expanded(...)])`
   với single child stretches.
6. **Overlay scrim opacity** — Figma overlay variable không expose hex chính xác; agent-test-ui
   verify `Colors.black54` (50% opacity) hoặc `Colors.black.withOpacity(0.5)` baseline.
7. **Popover dismiss UX**: tap outside scrim → close (baseline `Navigator.pop`). Figma không show
   this UX, verify FEAT yêu cầu tap-outside-to-dismiss hay buộc dùng button.
8. **Group name binding**: title/body chứa "Phụ tùng bảo dưỡng" hardcoded — runtime bind từ `{groupName}`.
   Test edge case empty/very-long group name (wrap correctly).
