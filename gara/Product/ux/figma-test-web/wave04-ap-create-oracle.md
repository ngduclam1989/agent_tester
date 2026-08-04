---
feat: FEAT-AP-CREATE
feat_file: Product/features/FEAT-AP-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87555&t=W7XJPVvhmdBPtv2c-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87555"
fetched_at: 2026-07-08T03:25:00+07:00
oracle_version: 1
screenshots:
  - assets/wave04-ap-create/_full.png
  - assets/wave04-ap-create/13521-66036.png
  - assets/wave04-ap-create/13523-68171.png
  - assets/wave04-ap-create/13523-68476.png
---

# Oracle — FEAT-AP-CREATE (web / garage-web)

Form tạo kỳ kế toán với 3 biến thể theo loại kỳ (Năm / Quý / Tháng). Layout full-page, container 1216px chia 2 cột 600px + gap 16px.

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| FEAT-AP-CREATE (Kỳ năm — auto-generate checked) | 13521:66036 | 1440x1024 | assets/wave04-ap-create/13521-66036.png |
| FEAT-AP-CREATE-2 (Kỳ quý — auto-generate checked) | 13523:68171 | 1440x1024 | assets/wave04-ap-create/13523-68171.png |
| FEAT-AP-CREATE-3 (Kỳ tháng — không có checkbox auto-generate) | 13523:68476 | 1440x1024 | assets/wave04-ap-create/13523-68476.png |

Cấu trúc chung mỗi screen: `Navbar (1440x104)` → `Page content` → `Page container (1280 max-width, padding-x 32)` → `Page Header / 3 (1216x80)` → `Frame 1948757406 (1216x424 — Thông tin chung block)` → `Frame 1948757389 (1216x142 — Mô tả block)` → `Section Footer / 2 (1440x48)`.

## Component Inventory

### Screen: FEAT-AP-CREATE — Kỳ năm (13521:66036)
- Navbar × 1 (top bar, chưa mở)
- Page Header / 3 × 1 — có nút back (icon-only ghost button, ArrowLeft), title `Thêm kỳ kế toán`, 2 action button (Huỷ bỏ + Tạo)
- Radio / Item × 3 — 3 loại kỳ (radio group)
- Checkbox × 1 — `Tự động sinh kỳ` (checked, brand blue)
- Select × 1 — `Năm *` (value hiển thị `2026`, dropdown ArrowDown)
- Input / Basic × 5 — `Tên kỳ kế toán *`, `Ngày bắt đầu *`, `Ngày kết thúc *`, `Thứ tự hiển thị`, `Trạng thái`
- Textarea × 1 — `Mô tả` (placeholder `Nhập mô tả`)
- Section Footer / 2 × 1 — copyright text + 3 link button (Hướng dẫn sử dụng · Hỗ trợ · Hotline: 0985135050)

### Screen: FEAT-AP-CREATE-2 — Kỳ quý (13523:68171)
- Giống Screen 1 nhưng khác Row 1:
  - Select × 1 — `Thuộc kỳ *` (value hiển thị `Năm 2026`)
  - Input / Basic × 1 — `Tên kỳ kế toán *` (value hiển thị `Quý 1/2026`)
- Checkbox `Tự động sinh kỳ` VẪN có (checked).

### Screen: FEAT-AP-CREATE-3 — Kỳ tháng (13523:68476)
- Radio / Item × 3 (KHÔNG có checkbox `Tự động sinh kỳ` — Radio Frame width chỉ 438px thay vì 593px)
- Select × 1 — `Thuộc kỳ *` (value hiển thị `Quý 1`)
- Input / Basic × 1 — `Tên kỳ kế toán *`
- Còn lại giống Screen 1 (date × 2, order + status, textarea).

## Variant & State

### Radio / Item (13523:66426, 13523:66427, 13523:66428)
- variants: `Selected` (border brand-CD `#0052ff`, inner filled circle radius 5px) · `Unselected` (border neutral `#e4e4e7`, hollow)
- state observed: Screen 1 → `Kỳ kế toán năm` = Selected; Screen 2 → `Kỳ kế toán quý` = Selected; Screen 3 → `Kỳ kế toán tháng` = Selected
- size: 16×16 px, radius `rounded-full` (9999px), shadow `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)]`

### Checkbox (13523:66429)
- variants: `Checked` (bg brand-CD `#0052ff`, border brand-CD, icon check white) · `Unchecked` (bg white, border neutral)
- state observed: Screen 1 + Screen 2 → Checked; Screen 3 → không có control (missing element)
- size: 16×16 px, radius `rounded-[4px]` (border-radius/default)

### Button "Huỷ bỏ" (I13521:66040;17421:80016)
- variants (shadcn): `outline` size `lg` (h=40, px=32, py=8) — bg white, border `#d4d4d8`, radius `rounded-md` (6px), shadow `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]`
- text: 14px / weight 500 / lh 20 / color `#18181b`
- states observed: `default` only

### Button "Tạo" (I13521:66040;17421:80006)
- variants (shadcn): `default` (brand primary) size `lg` (h=40, px=32, py=8) — bg brand-CD `#0052ff`, radius `rounded-md` (6px), shadow `drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)]`
- text: 14px / weight 500 / lh 20 / color white
- states observed: `default` only

### Button back (I13521:66040;17478:20246)
- variants (shadcn): `ghost` size `icon` — bg transparent, size 40×40, rounded-md, icon 20×20 vuesax/linear/arrow-left
- states observed: `default`

### Select (13521:66047 / 13523:68185 / 13523:68490)
- shape: `_SelectTrigger` bg white, border `#d4d4d8`, h=36, radius `rounded-md` (6px), padding-x 12, padding-y 8, shadow `shadow-[0px_1px_2px_rgba(0,0,0,0.05)]`, icon vuesax/linear/arrow-down 16×16 aligned end
- states observed: `default filled`
- required marker: `*` red `#dc2626`

### Input / Basic (text, date, order, status)
- shape: bg white, border `#d4d4d8`, h=36, radius `rounded-md` (6px), padding-x 12, padding-y 4, shadow `shadow-[0px_1px_2px_rgba(0,0,0,0.05)]`
- date variant: có icon vuesax/linear/calendar 20×20 trailing (Ngày bắt đầu / Ngày kết thúc)
- status variant: có icon trailing 20×20 (Figma binding trả `imgVuesaxLinearCalendar` — likely dropdown chevron per Trạng thái = Select semantic; DEV render bằng shadcn Select với chevron)
- states observed: `default filled`
- required marker: `*` `#dc2626` (bắt buộc trên Tên kỳ / Năm / Ngày bắt đầu / Ngày kết thúc / Thuộc kỳ)

### Textarea (13521:66053)
- shape: bg white, border `#d4d4d8`, min-h 60, height 126, radius `rounded-md` (6px), padding-x 12, padding-y 8, shadow `shadow-[0px_1px_2px_rgba(0,0,0,0.05)]`
- placeholder color: `#71717a` (muted-foreground)
- states observed: `empty with placeholder`

## Text Content

Verbatim (tiếng Việt có dấu, giữ nguyên trailing space nếu có trong Figma).

### Chung — mọi screen
- Header title: `Thêm kỳ kế toán`
- Button back: (icon only, không có label)
- Button `Huỷ bỏ`
- Button `Tạo`
- Section title: `Thông tin chung ` (có 1 trailing space)
- Radio labels: `Kỳ kế toán năm `, `Kỳ kế toán quý`, `Kỳ kế toán tháng`
- Checkbox label: `Tự động sinh kỳ ` (chỉ có ở Screen 1 + Screen 2)
- Label required suffix: `*` (color `#dc2626`)
- Label `Tên kỳ kế toán ` + `*`
- Label `Ngày bắt đầu` + `*`
- Label `Ngày kết thúc` + `*`
- Label `Thứ tự hiển thị` (không required)
- Label `Trạng thái ` (không required, có trailing space)
- Label `Mô tả`
- Textarea placeholder: `Nhập mô tả ` (có trailing space)
- Footer text 1: `Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0` (verbatim — Figma dùng `Phầm` không phải `Phần`; DEV cần confirm chính tả trước khi ship — R9 verbatim)
- Footer link 1: `Hướng dẫn sử dụng ` (có trailing space)
- Footer link 2: `Hỗ trợ`
- Footer link 3: `Hotline: 0985135050`

### Screen: FEAT-AP-CREATE — Kỳ năm (13521:66036)
- Radio state: `Kỳ kế toán năm ` = SELECTED
- Checkbox state: `Tự động sinh kỳ ` = CHECKED
- Label Row 1 col-left: `Năm ` + `*` (Select — dropdown năm)
- Value Row 1 col-left: `2026`
- Label Row 1 col-right: `Tên kỳ kế toán ` + `*`
- Value Row 1 col-right: `Năm 2026`
- Value Row 2: `12/12/2026` (cả 2 date input — đây là placeholder dữ liệu Figma, không phải default)
- Value Row 3 col-left `Thứ tự hiển thị`: `0`
- Value Row 3 col-right `Trạng thái`: `Đã đóng kỳ` (chú ý: FEAT §AC-7 default = `Chưa đóng` — Figma hiển thị example `Đã đóng kỳ`; DEV cần render default `Chưa đóng` theo AC, dropdown options: `Chưa đóng` / `Đã đóng`)

### Screen: FEAT-AP-CREATE-2 — Kỳ quý (13523:68171)
- Radio state: `Kỳ kế toán quý` = SELECTED
- Checkbox state: `Tự động sinh kỳ ` = CHECKED
- Label Row 1 col-left: `Thuộc kỳ ` + `*` (Select — dropdown năm)
- Value Row 1 col-left: `Năm 2026`
- Label Row 1 col-right: `Tên kỳ kế toán ` + `*`
- Value Row 1 col-right: `Quý 1/2026`

### Screen: FEAT-AP-CREATE-3 — Kỳ tháng (13523:68476)
- Radio state: `Kỳ kế toán tháng` = SELECTED
- Checkbox: **ABSENT** (Row radio width = 438px, không có checkbox slot — khớp AC-8: kỳ tháng KHÔNG có `Tự động sinh kỳ`)
- Label Row 1 col-left: `Thuộc kỳ ` + `*` (Select — dropdown quý)
- Value Row 1 col-left: `Quý 1`
- Label Row 1 col-right: `Tên kỳ kế toán ` + `*`

## Design Tokens

### Colors (Figma variables → tailwind expected)
| Figma token | Hex | Role | Expected tailwind token (garage-web `src/index.css` §1.5) |
|---|---|---|---|
| `base/background` | `#ffffff` | page bg, input bg, button outline bg, section footer bg | `bg-background` |
| `base/foreground` | `#18181b` | primary text (labels, headings, button text outline) | `text-foreground` |
| `base/foreground-brand-CD` | `#0052ff` | radio selected border, checkbox filled bg, primary button bg | `bg-primary` / `text-primary` (Tailwind v4 `@theme` maps `--primary: #0052ff`) |
| `base/background-brand-CD` | `#0052ff` | checkbox bg, button "Tạo" bg | `bg-primary` |
| `base/primary-foreground` | `#ffffff` | text button "Tạo" | `text-primary-foreground` |
| `base/border` | `#e4e4e7` | radio unselected border | `border-border` |
| `base/input` | `#d4d4d8` | select/input/textarea border, button outline border | `border-input` |
| `base/muted-foreground` | `#71717a` | textarea placeholder text | `text-muted-foreground` |
| `base/foreground-error` | `#dc2626` | required `*` marker | `text-destructive` (map lên `--destructive`) hoặc arbitrary `text-[#dc2626]` |
| `Dark/3` | `#474847` | footer link text | arbitrary — hoặc token `text-foreground/70` gần nhất |
| `tailwind colors/base/transparent` | `#ffffff00` | ghost button back bg, footer button bg | `bg-transparent` |

### Typography (Inter, letter-spacing = 0 mọi text)
| Figma style | Size | Weight | Line-height | Dùng cho | Expected tailwind |
|---|---|---|---|---|---|
| text 2x large / leading-normal / semibold | 24 | 600 | 32 | Header title `Thêm kỳ kế toán` | `text-2xl font-semibold leading-8` |
| text large / leading-normal / semibold | 18 | 600 | 28 | Section heading `Thông tin chung ` | `text-lg font-semibold leading-7` |
| text small / leading-normal / medium | 14 | 500 | 20 | Button label (Huỷ bỏ, Tạo) | `text-sm font-medium leading-5` |
| text small / leading-none / medium | 14 | 500 | 1 (14) | Field labels + radio/checkbox labels | `text-sm font-medium leading-none` |
| text small / leading-normal / regular | 14 | 400 | 20 | Field values, placeholder, footer text | `text-sm font-normal leading-5` |
| Footer light (`Inter:Light`) | 14 | 300 | 20 | Copyright text | `text-sm font-light leading-5` |
| Footer link | 14 | 400 | 20 | 3 footer link buttons | `text-sm font-normal leading-5` |

### Spacing (Tailwind v4 4px scale)
| Figma variable | Value | Dùng cho | Tailwind class |
|---|---|---|---|
| `spacing/0` | 0 | padding container | `p-0` |
| `spacing/1` | 4 | label→required-star gap, input padding-y (4), footer button gap | `gap-1` / `p-1` |
| `spacing/1-5` | 6 | radio/checkbox label wrapper gap-y | `gap-1.5` |
| `spacing/2` | 8 | radio/checkbox row gap, select/input gap-y label→input, select/button gap, page-header title gap | `gap-2` / `p-2` |
| `spacing/3` | 12 | button-list gap, input/select padding-x | `gap-3` / `px-3` |
| `spacing/4` | 16 | title-text pb, Flex row gap, header-title Frame gap, footer padding-x | `gap-4` / `p-4` |
| `spacing/5` | 20 | Header container padding-y | `py-5` |
| `spacing/6` | 24 | Header container gap, radio row gap | `gap-6` |
| `spacing/8` | 32 | Page container padding-x, button "Huỷ bỏ" + "Tạo" padding-x | `px-8` |

### Layout dimensions
- Frame FEAT-AP-CREATE: `1440×1024`
- Page container: max-width `1280px`, padding-x `32px` → inner `1216px`
- Section `Frame 1948757406` (Thông tin chung): `1216×424`, Title text height `44`, form area `1216×238`, description block `1216×142`
- Radio-row: Screen1/2 `593×16`, Screen3 `438×16`
- Radio inner spacing (từ metadata x): item1 (0→130), item2 (154→277), item3 (301→438), checkbox (462→593) — inter-radio gap ~24px
- Flex row (2 col): `1216×58`, mỗi col `600×58`, gap `16px`
- Row Y-offset trong form area: Row radio y=0, Row 1 y=32, Row 2 y=106, Row 3 y=180
- Header block (Page Header / 3): `1216×80` — back-button 40×40 + title 24px + button list (Huỷ bỏ + Tạo)
- Button back: `40×40` (icon 20×20)
- Button "Huỷ bỏ" / "Tạo": h=40, padding-x=32, padding-y=8

### Radius
| Figma variable | Value | Dùng cho | Tailwind |
|---|---|---|---|
| `border radius/default` | 4 | Checkbox | `rounded-[4px]` (không có mặc định trong `--radius`; dùng arbitrary hoặc `rounded-sm`) |
| `border radius/md` | 6 | Button, Select, Input, Textarea, Back button | `rounded-md` (Tailwind `--radius` = 0.625rem → `rounded-md` = calc(radius - 2px) ≈ 8px; nếu strict 6px thì arbitrary `rounded-[6px]`) |
| `border radius/lg` | 8 | Footer link button | `rounded-lg` |
| `border radius/full` / `radius/rounded-full` | 9999 | Avatar (navbar), Radio | `rounded-full` |

### Shadows
| Figma variable | Value | Dùng cho | Tailwind |
|---|---|---|---|
| `shadow/sm` | `DROP_SHADOW color=#0000000D offset=(0,1) radius=2 spread=0` | Select trigger, Input, Textarea, Button "Huỷ bỏ" (variant khác) | `shadow-sm` / `shadow-[0px_1px_2px_rgba(0,0,0,0.05)]` |
| `shadow/base` | `DROP_SHADOW color=#0000000F offset=(0,1) radius=2` + `#0000001A offset=(0,1) radius=3` | Radio, Checkbox | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)]` (custom) |
| Custom drop-shadow "Huỷ bỏ" | `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]` | Button outline | inline arbitrary |
| Custom drop-shadow "Tạo" | `drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)]` | Button primary | inline arbitrary |

### Icons (vuesax/linear — map iconsax-reactjs per R4.1)
| Figma layer | iconsax-reactjs component | Size | Color | Dùng cho |
|---|---|---|---|---|
| `vuesax/linear/arrow-left` | `<ArrowLeft variant="Linear" />` | 20 | `#18181b` | Back button (Page Header / 3) |
| `vuesax/linear/arrow-down` | `<ArrowDown variant="Linear" />` | 16 | `#18181b` | Select trigger chevron |
| `vuesax/linear/calendar` | `<Calendar variant="Linear" />` | 20 | `#18181b` | Trailing icon Ngày bắt đầu, Ngày kết thúc, **và Trạng thái** (Figma bind sai — DEV render Trạng thái với `ArrowDown` per shadcn Select convention, cross-check với AC-7 dropdown 2-value semantic) |

## Screenshots

> assets/wave04-ap-create/
- `_full.png` — toàn Section FEAT-AP-CREATE (3 frames cạnh nhau, overview reference)
- `13521-66036.png` — Screen 1: Kỳ năm (auto-generate checked)
- `13523-68171.png` — Screen 2: Kỳ quý (auto-generate checked, `Thuộc kỳ` = Năm 2026)
- `13523-68476.png` — Screen 3: Kỳ tháng (không có checkbox, `Thuộc kỳ` = Quý 1)

## Data Completeness

Full success (E1) — không có supplementation, không có gap.

```yaml
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (Screen 1 full + Screen 2/3 Row 1 spot-check)
  get_screenshot: success (per-frame, 4 PNGs)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (default states only — Figma chỉ có 1 frame per loại kỳ, chưa capture hover/focus/error/disabled variant; agent-test-ui verify các state runtime bằng UX-FLOW hoặc code inspection)
  text_content: complete (verbatim từ Figma binding; footer text "Phầm" — Figma typo, không supplement)
  design_tokens: complete
  interaction_states: partial (missing: hover, focus, disabled — Figma frame không capture state variant)
```

Note:
- Trạng thái field icon: Figma binding trả `imgVuesaxLinearCalendar` cho slot `data-node-id="17791:165848"` — semantic mismatch với AC-7 "dropdown 2 giá trị". DEV expected render `Select` với chevron/arrow-down; agent-test-ui verify hiển thị dropdown chứ không phải calendar picker.
- Footer chính tả `Phầm mềm quản lý Garage` — verbatim từ Figma. Cần Business Authority confirm typo trước khi ship (không tự sửa trong oracle).
- Screen 3 (kỳ tháng) verify absence of "Tự động sinh kỳ" checkbox — chốt AC-8 gate.
