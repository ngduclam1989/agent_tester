---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-65571&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "319:65571"
fetched_at: 2026-06-04T11:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (output too large — read saved XML, top-level frame structure extracted)
  get_variable_defs: success
  get_design_context: success (per section-container: 397:24005, 400:23409)
  get_screenshot: success (4 PNG persisted)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (Figma component instances do not expose interaction-state variant props — hover/focus/pressed/error not present in this static design; states inferred from token roles + FEAT AC)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (missing: focus/error on TextField, pressed on "Áp dụng tất cả" / tab — not rendered as variants in this Figma file; verify against widget catalog defaults + FEAT AC-14)
coverage_gaps:
  - AC-10: mobile "Phân bổ Bảo hiểm" summary renders the 5 adjustment lines as neutral money values WITHOUT the +/− sign and red/green color that FEAT AC-10 specifies (web behavior). Mobile = plain "{label} … {amount}đ". Verify sign/color requirement applies to mobile or is web-only.
  - AC-11: mobile does NOT show 3 simultaneous result boxes (BH/KH/Tổng). Instead a 2-tab SegmentedButton ("KH thanh toán" / "BH thanh toán") switches the "Cần thanh toán" row between "Khách hàng thanh toán" and "Bảo hiểm thanh toán"; "Tổng thanh toán" shown once at bottom. AC-11 3-box layout is web; mobile uses tab+single-row.
  - AC-12: "BH thanh toán không thể âm" warning state not present as a Figma variant (no negative/red-highlight render captured). Verify against FEAT AC-12 + widget error styling.
  - AC-16: permission (no UI surface) — not verifiable from Figma; out of visual oracle scope.
notes:
  - Figma label typo: "Cần thanh toán" (should be "Cân thanh toán" per FEAT AC-11 / BR-005). Recorded verbatim below — flag as wording defect candidate, do NOT auto-correct in implementation; confirm with design.
  - Section heading rendered "Phân bổ bảo hiểm" (lowercase b) in summary card vs panel heading "Phân bổ quyết toán bảo hiểm". Both recorded verbatim.
screenshots:
  - assets/wave01-ins-so-adjustment/_full.png
  - assets/wave01-ins-so-adjustment/397-24005.png
  - assets/wave01-ins-so-adjustment/400-23409.png
  - assets/wave01-ins-so-adjustment/400-23120.png
---

# Oracle — FEAT-INS-SO-ADJUSTMENT (mobile) — "Phân bổ quyết toán bảo hiểm"

> Design-conformance oracle (5-cấp) cho `agent-test-ui` verify garage-mobile (Flutter) khớp Figma.
> Màn hình: section "Phân bổ quyết toán bảo hiểm" + panel "Tổng giá dịch vụ" trên **màn Chỉnh sửa (Edit) Phiếu dịch vụ** (mobile bottom-sheet/scroll). Node link `319:65571` là một **section spec-board** chứa nhiều screen-state (Edit có dữ liệu, Chi tiết read-only, panel standalone). Oracle tập trung **scope MỚI của FEAT**: panel nhập 5 khoản (Nhóm B) + panel kết quả "Tổng giá dịch vụ" (Nhóm C). Khu vực thông tin BH (toggle, dropdown công ty, hồ sơ bảo lãnh) là BASELINE production — KHÔNG nằm trong scope verify này (xem FEAT AC-2 / BR-008).
>
> **Mobile fetch caveat (G3)**: `get_design_context.code` trả JSX không tin được cho widget mapping; oracle dựa vào `get_metadata` (structure/size), `get_variable_defs` (token), screenshot (visual). "Expected token" cột Design Tokens là **gợi ý** (AppColors/AppTextStyle) — oracle ghi fact, không ghi code.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| SO Edit — section "Phân bổ quyết toán bảo hiểm" (panel nhập, 5 khoản + "Áp dụng tất cả") | `397:24005` | 375×822 | assets/wave01-ins-so-adjustment/397-24005.png |
| SO Edit — panel "Tổng giá dịch vụ" (Phân bổ Bảo hiểm summary + Chi tiết theo bên thanh toán [tab KH active] + Cân thanh toán + Tổng thanh toán) | `400:23409` | 375×632 | assets/wave01-ins-so-adjustment/400-23409.png |
| Panel "Tổng giá dịch vụ" standalone — tab **BH thanh toán** active (Chi tiết theo bên thanh toán + Cần thanh toán [Bảo hiểm thanh toán] + Tổng thanh toán) | `400:23120` | 375×410 | assets/wave01-ins-so-adjustment/400-23120.png |
| Spec-board full (toàn bộ screen-states + Detail read-only `397:27621`) — ground-truth tổng | `319:65571` | 1815×3814 (PNG 997×2048) | assets/wave01-ins-so-adjustment/_full.png |

> Detail (read-only) screen `397:27621` chứa bản mirror read-only của cùng panel AC-9/10/11 (`400:23762`) — cùng text/token, khác mode (không nhập). Verify Detail = read-only render của cùng cấu trúc.

---

## Component Inventory

### Screen: SO Edit — panel nhập "Phân bổ quyết toán bảo hiểm" (`397:24005`)
- Section header (Text H3 "Phân bổ quyết toán bảo hiểm" + formula description Text) × 1
- AppTextField (input số + trailing unit selector) × 5 — AC-3 Vật tư, AC-4 Công DV, AC-5 Khấu hao, AC-6 Giảm trừ, AC-7 Khấu trừ
  - mỗi field = Label (S5) + Text Fields box (border, radius 8, padding 12, placeholder) + trailing divider line + unit chip + helper Caption
  - unit selector: **VNĐ + dropdown caret** (AC-3/4/6/7) | **% (no caret)** (AC-5 khấu hao)
- AppButton (text, full-width) × 1 — "Áp dụng tất cả" (giữa AC-5 và AC-6)
- Helper caption text (muted) × 5 (1 per field)

### Screen: panel "Tổng giá dịch vụ" (`400:23409` / `400:23120`)
- Summary card "Phân bổ bảo hiểm" × 1 — header (H3) + AppButton.textIcon "Sửa" (icon edit-2 + label, primary) + 5 dòng read-only (label C7 + amount B5)
- Divider strip (bg #e8e8ea, h6) × 1 (giữa 2 card)
- Card "Tổng giá dịch vụ" × 1 — header (H3) + arrow-down icon (opacity 0, collapse affordance)
- SegmentedButton / Tabbar × 1 — 2 tab: "KH thanh toán" | "BH thanh toán" (1 active highlight trắng)
- "Chi tiết theo bên thanh toán" group: section label (S5) + 4 dòng (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT — label C7 + amount B5)
- Divider line (dashed/solid hairline) × 1
- "Cân thanh toán" group (label Figma="Cần thanh toán"): section label (S5) + 1 dòng theo tab active (Khách hàng thanh toán | Bảo hiểm thanh toán)
- "Tổng thanh toán" highlight box × 1 (bg #f3f3f4, radius 8, label S5 + amount H5 primary)

> Mobile widget mapping (gợi ý — agent-test-ui verify với catalog `lib/ui/widgets/`): AppTextField (input/), AppButton (button/), Tabbar→SegmentedButton/custom tab, Dropdown unit (dropdown/). Money rows = Row(spaceBetween) text pairs.

---

## Variant & State

### AppTextField (5 instances — `399:28928`, `400:22407`, `400:22426`, `400:22533`, `400:22552`)
- variants observed (Figma static): **default/empty** với placeholder "Nhập chiết khấu" (AC-3/4/6/7) — placeholder color #b8babf.
- unit selector variant: **VNĐ + caret dropdown** (AC-3 Vật tư, AC-4 Công DV, AC-6 Giảm trừ, AC-7 Khấu trừ) vs **% no-caret fixed** (AC-5 Khấu hao). → khấu hao chỉ %, không đổi đơn vị (khớp FEAT AC-5 / BR-003 cho khấu trừ chỉ VND — **lưu ý**: Figma render AC-7 Khấu trừ với caret VNĐ dropdown, nhưng FEAT BR-003 nói Khấu trừ chỉ VND không có % → verify dropdown AC-7 có disable đổi % hay chỉ hiển thị VNĐ tĩnh).
- states **NOT in Figma** (verify từ widget default + FEAT AC-14): `:focus` ring, `:error` border (#ed1f42) + message ("Chiết khấu không thể lớn hơn 100%" / "Số tiền chiết khấu không thể lớn hơn Cộng sau VAT vật tư thuộc BH"), `:disabled` (EC-1: SO không có phụ tùng BH → khấu hao disable/ẩn).

### AppButton "Áp dụng tất cả" (`400:22445`)
- variant: text button full-width, bg #eaeaea (neutral, không primary).
- states NOT in Figma: `:pressed`, `:disabled`. Verify pressed feedback.

### Tabbar / SegmentedButton (`400:23231`)
- variants observed: 2 tab. **Active=KH thanh toán** (bg trắng + text #0052ff) trong `400:23409`; **Active=BH thanh toán** (bg trắng + text #0052ff) trong `400:23120`. Tab inactive: text #595e69, no bg.
- container bg #f3f4f6 (gray/100), padding 4, radius 8; tab active pill radius 6.

### AppButton.textIcon "Sửa" (`I400:22571;16514:316149`)
- variant: text+icon button, icon edit-2 16px + label "Sửa", text #0052ff, bg trắng, px12 py8 radius 8.

### "Tổng thanh toán" box (`400:23266`)
- variant: highlight box bg #f3f3f4; amount text #0052ff Bold. (Không thấy variant cảnh báo âm AC-12 — coverage_gap.)

---

## Text Content

> Verbatim tiếng Việt — nguồn cho wording verification (Cấp 4). Số tiền là **placeholder/mock data** trong Figma (không phải giá trị test bắt buộc).

### Panel nhập "Phân bổ quyết toán bảo hiểm" (`397:24005`)
- "Phân bổ quyết toán bảo hiểm"  *(section header)*
- "BH thanh toán = phần bảo hiểm duyệt sau CK liên kết, giảm trừ bồi thường, khấu hao vật tư và khấu trừ bảo hiểm. KH thanh toán = phần KH tự trả + khoản bị loại trừ."  *(formula description — NOTE: bản rút gọn so với FEAT Nhóm B header copy)*
- "Chiết khấu liên kết BH - Vật tư"  *(label AC-3)*
- "Nhập chiết khấu"  *(placeholder — chung cho cả 5 field)*
- "VNĐ"  *(unit AC-3)*
- "Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần vật tư/phụ tùng"  *(helper AC-3 — NOTE typo "bao hiểm" thiếu dấu)*
- "Chiết khấu liên kết BH - Công dịch vụ"  *(label AC-4)*
- "Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần công sửa chữa"  *(helper AC-4 — typo "bao hiểm")*
- "Khấu hao vật tư / thay mới"  *(label AC-5)*
- "%"  *(unit AC-5 — fixed, no caret)*
- "Tỷ lệ khấu hao vật tư do KH chịu. Có thể áp dụng đồng loạt hoặc chỉnh riêng từng dòng phụ tùng."  *(helper AC-5)*
- "Áp dụng tất cả"  *(button AC-8)*
- "Giảm trừ bồi thường "  *(label AC-6 — trailing space verbatim)*
- "Khoản loại trừ hoặc giảm bồi thường theo quy tắc/hồ sơ bảo hiểm, chuyển sang KH chi trả"  *(helper AC-6)*
- "Khấu trừ bảo hiểm"  *(label AC-7)*
- "Khoản khấu trừ bảo hiểm theo hợp đồng mà KH phải tự thanh toán"  *(helper AC-7)*

### Panel "Tổng giá dịch vụ" (`400:23409` + `400:23120`)
**Card "Phân bổ bảo hiểm" (summary read-only):**
- "Phân bổ bảo hiểm"  *(header — lowercase b, khác panel nhập)*
- "Sửa"  *(edit button)*
- "CK liên kết BH — Vật tư"  *(AC-10 line 1 — em dash "—")*
- "CK liên kết BH — Công dịch vụ"  *(AC-10 line 2)*
- "Giảm trừ bồi thường"  *(AC-10 line 3)*
- "Khấu hao vật tư / thay mới"  *(AC-10 line 4)*
- "Khấu trừ BH"  *(AC-10 line 5)*
- amounts (mock): "540.000đ" / "50.000đ" / "50.000đ" / "45.000.000đ" / "5.000.000đ"

**Card "Tổng giá dịch vụ":**
- "Tổng giá dịch vụ"  *(header)*
- "Chi tiết theo bên thanh toán"  *(AC-9 section label)*
- "KH thanh toán "  *(tab 1 — trailing space verbatim)*
- "BH thanh toán"  *(tab 2)*
- "Khoản mục"  *(AC-9 column label)*
- "Dịch vụ "  *(AC-9 row — trailing space)*
- "Phụ tùng "  *(AC-9 row — trailing space)*
- "VAT "  *(AC-9 row — trailing space)*
- "Cộng sau VAT "  *(AC-9 row — trailing space)*
- "Cần thanh toán"  *(AC-11 section label — **typo: nên là "Cân thanh toán"** theo FEAT)*
- "Khách hàng thanh toán"  *(AC-11 row — tab KH active, `400:23409`)*
- "Bảo hiểm thanh toán"  *(AC-11 row — tab BH active, `400:23120`)*
- "Tổng thanh toán"  *(AC-11 total label)*
- amounts (mock): Dịch vụ/Phụ tùng/VAT/Cộng sau VAT = "540.000đ"/"50.000đ"/"50.000đ"/"50.000đ"; "Khách hàng thanh toán"/"Bảo hiểm thanh toán" = "15.000.000đ"; "Tổng thanh toán" = "38.440.000đ"

> **Wording cross-check (M4 fallback — FEAT AC verbatim, nếu impl khác Figma)**: AC-12 warning message = "BH thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh"; AC-14 errors = "Chiết khấu không thể lớn hơn 100%", "Số tiền chiết khấu không thể lớn hơn Cộng sau VAT vật tư thuộc BH". Các message này KHÔNG có trong Figma static — verify implementation theo FEAT.

---

## Design Tokens

> hex từ `get_variable_defs` (`319:65571`). "expected token" = gợi ý mobile (`AppColors.*` / `AppTextStyle.*`) per `_ref-mobile-transform-figma.md §1.5`. Hex không match semantic → ghi `Color(0xFF…)` literal.

### Colors (file-wide tokens — áp dụng cả 2 panel)
| Hex | Figma role | expected token (mobile) |
|---|---|---|
| `#262626` | Base/text-CD Garage (text chính label/header) | `AppColors.textPrimary` |
| `#273243` | Base/text-Primary, Neutral/Text ("Áp dụng tất cả" label) | no exact semantic → `Color(0xFF273243)` (gần `textPrimary`) |
| `#595e69` | Base/text-Secondary (tab inactive) | `AppColors.textSecondary` |
| `#888c94` | Base/text-Tertiary (formula description) | `AppColors.textTertiary` |
| `#71717a` | base/muted-foreground (helper caption) | `AppColors.textMutedForeground` |
| `#b8babf` | Base/text-Quaternary (placeholder "Nhập chiết khấu", unit "VNĐ"/"%") | no exact semantic → `Color(0xFFB8BABF)` |
| `#0052ff` | text-Active-Primary / button-bg-primary (tab active, "Sửa", "Tổng thanh toán" amount) | `AppColors.textActivePrimary` / `AppColors.buttonBackgroundPrimary` |
| `#ffffff` | Base/bg-Base, text-White (card bg, tab active pill bg) | `AppColors.bgBase` / `AppColors.textWhite` |
| `#d1d1d1` | Base/border-Garage (TextField border) | no exact semantic → `Color(0xFFD1D1D1)` (gần `borderPrimary` #e8e8ea — verify) |
| `#e8e8ea` | Base/border-Primary, bg-Primary (divider strip h6 giữa 2 card) | `AppColors.borderPrimary` / `AppColors.bgPrimary` |
| `#f3f3f4` | Base/bg-Secondary, Neutral/50 ("Tổng thanh toán" box bg) | `AppColors.bgSecondary` |
| `#f3f4f6` | tailwind gray/100 (Tabbar container bg) | no exact semantic → `Color(0xFFF3F4F6)` |
| `#eaeaea` | Dark/100 ("Áp dụng tất cả" button bg) | no exact semantic → `Color(0xFFEAEAEA)` |
| `#ed1f42` | Base/text-Error (error state — verify AC-14, không render trong Figma) | `AppColors.textErrorPrimary` / `AppColors.borderError` |

### Typography (Inter; size/weight/lineHeight → AppTextStyle)
| Size/Weight/LH | Figma style | Dùng ở | expected token |
|---|---|---|---|
| 18/700/26 | Heading/H3 | section header "Phân bổ quyết toán bảo hiểm", "Phân bổ bảo hiểm", "Tổng giá dịch vụ" | `AppTextStyle.textHeadingH3` |
| 16/700/24 | Heading/H4 | (token có trong file — verify nếu dùng) | `AppTextStyle.textHeadingH4` |
| 14/700/20 | Heading/H5 | "Tổng thanh toán" amount | `AppTextStyle.textHeadingH5` |
| 14/600/20 | Subtitle/S5 | field Label (Chiết khấu liên kết…), "Chi tiết theo bên thanh toán", "Khoản mục", "Cần thanh toán", "Tổng thanh toán" label, "Sửa" | `AppTextStyle.textSubtitleS5` |
| 14/500/20 | Body/B5 | amount values (money), tab text | `AppTextStyle.textBodyB5` |
| 14/400/20 | Caption/C5 | placeholder "Nhập chiết khấu", unit "VNĐ"/"%", formula description, helper caption | `AppTextStyle.textCaptionC5` |
| 12/400/18 | Caption/C7 | dòng label trong summary & Chi tiết ("CK liên kết BH…", "Dịch vụ", "Phụ tùng", "VAT", "Cộng sau VAT", "Khách hàng thanh toán") | `AppTextStyle.textCaptionC7` |
| 12/600/18 | Subtitle/S7 | (token có trong file) | `AppTextStyle.textSubtitleS7` |
| 12/500/18 | Body/B7 | (token có trong file) | `AppTextStyle.textBodyB7` |

### Spacing / Radius / Shadow — panel nhập (`397:24005`)
- Container padding: `EdgeInsets.all(16)` → `AppSizes.spacing16`
- Header group gap: `Gap(12)` (header row → formula description)
- Fields group gap: `Gap(8)` giữa các field block; trong field: label→box gap `Gap(4)`, box→helper gap `Gap(4)`
- TextField box: padding `EdgeInsets.all(12)` (spacing 12), radius `BorderRadius.circular(8)` (Spacing-Border/8), border 1px solid `#d1d1d1`
- Unit chip gap: `Gap(4)` (VNĐ ↔ caret); inner auto-layout gap `Gap(12)`
- "Áp dụng tất cả" button: padding `EdgeInsets.symmetric(horizontal: 12, vertical: 8)`, radius `BorderRadius.circular(8)`, gap `Gap(4)`, full-width

### Spacing / Radius / Shadow — panel "Tổng giá dịch vụ" (`400:23409`)
- Card padding: `EdgeInsets.all(16)` → `AppSizes.spacing16`
- Summary card content gap: `Gap(16)`; line group gap `Gap(8)`
- Divider strip giữa 2 card: bg `#e8e8ea`, height 6px, full-width
- Tổng giá card content gap: `Gap(16)`; sub-group gap `Gap(12)`; money rows gap `Gap(8)`
- Tabbar: container padding `EdgeInsets.all(4)`, radius `BorderRadius.circular(8)`; tab pill padding `EdgeInsets.symmetric(horizontal: 24, vertical: 4)`, radius `BorderRadius.circular(6)` (border-radius/md)
- "Tổng thanh toán" box: padding `EdgeInsets.all(12)`, radius `BorderRadius.circular(8)`, bg `#f3f3f4`
- Hairline divider (Cộng sau VAT → Cân thanh toán): 1px, full-width 343px
- File shadow tokens (verify nếu card có elevation): `drop 0` = DROP_SHADOW #0000000F offset(0,4) blur8 → `AppShadows.boxShadow`; `s2` = stacked #9C9C9C* offset(0,1) blur20 → `AppShadows.menuBoxShadow`/`itemBoxShadow`. (Panel trong screenshot không thấy shadow rõ — verify flat vs elevated.)

### Icons
| Figma layer | source (gợi ý mobile) | dùng ở |
|---|---|---|
| vuesax/linear/arrow-down (`397:24008`, `400:23221`) | `assets/icons/arrow-down.svg` (flutter_svg) — **opacity 0** (collapse affordance ẩn) | header panel (size 24) |
| vuesax/linear/edit-2 (`I400:22571;16514:316149;1:749`) | `assets/icons/edit-2.svg` | "Sửa" button (size 16, #0052ff) |
| unit caret Icon/Vector (`I399:28928;2538:19764`) | `assets/icons/chevron-down.svg` | unit selector VNĐ dropdown (size 12) |

---

## Screenshots
> assets/wave01-ins-so-adjustment/
- `_full.png` — toàn spec-board (1815×3814 → PNG 997×2048): tất cả screen-state Edit + Detail read-only + popup, ground-truth tổng.
- `397-24005.png` — Section "Phân bổ quyết toán bảo hiểm" (panel nhập 5 khoản + "Áp dụng tất cả"), 375×822.
- `400-23409.png` — Panel "Tổng giá dịch vụ": summary "Phân bổ bảo hiểm" + "Chi tiết theo bên thanh toán" (tab **KH thanh toán** active) + "Cần thanh toán" (Khách hàng thanh toán) + "Tổng thanh toán", 375×632.
- `400-23120.png` — Panel "Tổng giá dịch vụ" standalone, tab **BH thanh toán** active ("Cần thanh toán" → Bảo hiểm thanh toán), 375×410.
