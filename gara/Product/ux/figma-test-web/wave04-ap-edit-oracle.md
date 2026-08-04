---
feat: FEAT-AP-EDIT
feat_file: Product/features/FEAT-AP-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87554&t=W7XJPVvhmdBPtv2c-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87554"
fetched_at: 2026-07-08T03:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (screen 3 retried once after transport drop)
  get_screenshot: success (per-frame + full — original_width=4670 > 2048 → per-frame mandatory)
screenshots:
  - assets/wave04-ap-edit/_full.png
  - assets/wave04-ap-edit/13523-68781.png
  - assets/wave04-ap-edit/13523-68806.png
  - assets/wave04-ap-edit/13523-68831.png
---

# Oracle — FEAT-AP-EDIT (web) — Wave 04

> Sửa Kỳ kế toán — 3 screen variants theo loại kỳ đang edit: **Năm / Quý / Tháng**.
> Form "Sửa Kỳ kế toán" bao gồm: 3 radio loại kỳ + (optional) checkbox "Tự động sinh kỳ" + Select/Input row năm|tên|thuộc-kỳ + 2 date + Thứ tự hiển thị + Trạng thái + Textarea mô tả.

---

## Screen Inventory

| # | Screen state | nodeId | size | screenshot |
|---|---|---|---|---|
| S1 | FEAT-AP-EDIT (edit Kỳ **Năm** — radio "Kỳ kế toán năm" selected) | `13523:68781` | 1440×1024 | `assets/wave04-ap-edit/13523-68781.png` |
| S2 | FEAT-AP-EDIT-2 (edit Kỳ **Quý** — radio "Kỳ kế toán quý" selected) | `13523:68806` | 1440×1024 | `assets/wave04-ap-edit/13523-68806.png` |
| S3 | FEAT-AP-EDIT-3 (edit Kỳ **Tháng** — radio "Kỳ kế toán tháng" selected) | `13523:68831` | 1440×1024 | `assets/wave04-ap-edit/13523-68831.png` |

Root section: `14146:87554` — 4670×1227 (3 screen frames laid horizontally). Root screenshot `_full.png` for overview only (downscaled 2.28× → per-frame mandatory per §3.1.1).

---

## Component Inventory

> Form edit-only mode (W-R8). Radio-group + Checkbox + Select + Input + DatePicker + Textarea + Button — mapped to shadcn primitives per `_ref-web-transform-figma.md §1.5`.

### S1 — FEAT-AP-EDIT (Kỳ Năm) — `13523:68781`
- Navbar × 1 (`13626:291465` — top, h=104)
- Page Header / 3 × 1 (`13523:68785` — chứa back Button icon + title H1 + button-list "Huỷ bỏ" + "Lưu")
- Button × 3 (icon back Ghost `I13523:68785;17478:20246` + Outline "Huỷ bỏ" + Default brand "Lưu")
- Section title × 1 ("Thông tin chung" — text large/semibold)
- RadioGroup × 1 với Radio / Item × 3 (`13523:68790..92`) — Năm | Quý | Tháng
- Checkbox × 1 (`13523:68793` — "Tự động sinh kỳ", checked, opacity 50%/70% → disabled+locked look)
- Select × 1 (`13523:68795` — label "Năm *", value "2026", trigger bg-accent → **disabled/locked**)
- Input / Basic (enabled) × 3 (`13523:68796` Tên kỳ kế toán *; `13523:68801` Thứ tự hiển thị; `13523:68802` Trạng thái — has chevron slot rendered w/ calendar icon asset)
- Input / Basic (disabled — bg-accent) × 2 (`13523:68798` Ngày bắt đầu *; `13523:68799` Ngày kết thúc *) — dùng biểu tượng lịch (DatePicker locked)
- Textarea × 1 (`13523:68804` "Mô tả" — placeholder "Nhập mô tả", min-h 60, h 126)
- Section Footer / 2 × 1 (`13523:68805` — copyright + 3 link buttons)

### S2 — FEAT-AP-EDIT-2 (Kỳ Quý) — `13523:68806`
Cùng cấu trúc S1 với 2 khác biệt:
- Radio selected: "Kỳ kế toán quý" (`13523:68816`)
- Row 2 Left = **Select "Tên kỳ kế toán *"** (enabled, `13523:68820`, value "Quý 1/2026") thay vì Select "Năm *"
- Row 2 Right = **Input "Thuộc kỳ *"** (disabled bg-accent, `13523:68821`, value "Năm 2026") thay vì Input "Tên kỳ kế toán *"
- Checkbox "Tự động sinh kỳ" × 1 (`13523:68818`, checked, opacity 50%/70%)

### S3 — FEAT-AP-EDIT-3 (Kỳ Tháng) — `13523:68831`
Cùng cấu trúc S2 với 2 khác biệt:
- Radio selected: "Kỳ kế toán tháng" (`13523:68842`)
- **KHÔNG có checkbox "Tự động sinh kỳ"** — Frame `13523:68839` chỉ chứa 3 Radio / Item (width 438 vs 593 của S1/S2). Đây là design signal: kỳ Tháng không cho phép/hiển thị tuỳ chọn auto-sinh kỳ.

### Shared shadcn mappings
- Button (outline "Huỷ bỏ", default brand "Lưu") → `components/ui/button.tsx` variants `outline` / `default` size `lg` (h-10 = 40px, px-8 = 32px).
- Icon Ghost Button (back arrow 20×20) → `variant=ghost size=icon` (size-9→size-10 per figma 40×40).
- Radio / Item → `components/ui/radio-group.tsx` (shadcn Radio, size-4 = 16, filled has 10px inner dot via `imgIconCircle`).
- Checkbox → `components/ui/checkbox.tsx` (size-4 = 16, checked = bg-brand-CD `#0052ff` + white checkmark).
- Select trigger disabled → `_SelectTrigger` bg-accent (`#f4f4f5`) — dùng Select shadcn với `disabled` prop.
- Input disabled → Input variant với bg-accent `#f4f4f5`, cursor-not-allowed.
- DatePicker (disabled state) → Input + calendar-icon suffix, bg-accent.
- Textarea → `components/ui/textarea.tsx` (min-h 60px, resize=vertical, placeholder muted-foreground `#71717a`).
- Layer priority: khi implement, tra `.claude/references/web-component-registry.yaml` cho `share/customs` cover form-field-with-label + status-select trước fallback `ui/*` (FM-019).

---

## Variant & State

### Radio / Item (`Radio / Item` — 2043:88457)
- variants observed: `selected` (bg-white + border-e4e4e7 + 10px inner circle via `imgIconCircle`) · `unselected` (bg-canva `#f4f4f5` + border-e4e4e7, no inner dot)
- disabled state: S1/S2/S3 giữ nguyên visual — **KHÔNG tương tác được (AC-3)**; DEV phải set `disabled` cho toàn RadioGroup ở edit mode.

### Checkbox (`Checkbox` — 10150:113734)
- state observed: `checked+disabled` — bg-brand-CD `#0052ff` với `opacity/opacity-50 = 0.5`, label `opacity/opacity-70 = 0.7` → visual hint = locked (AC-3).
- S3 KHÔNG có checkbox.

### Button (`Button`)
- variants observed: `outline size=lg` ("Huỷ bỏ" — bg-white, border-input `#d4d4d8`, shadow-sm, h-10, px-8) · `default size=lg` ("Lưu" — bg-brand `#0052ff`, drop-shadow, text-white, h-10, px-8) · `ghost size=icon` (back arrow — bg transparent, size-10, icon 20×20).

### Select / Input
- states observed:
  - `enabled` (default): bg-white, border-input `#d4d4d8`, text `#18181b`
  - `disabled` (locked field per AC-3): bg-accent `#f4f4f5`, border-input, opacity-100, text muted `#71717a`
  - all lack focus/error states in this frame set (only default snapshots)
- states inferred required (must implement, not in Figma): `:focus` (ring primary), `:error` (border-error `#dc2626` + helper), `:hover` (subtle bg tint on trigger)

### Textarea (`Textarea` — 45:90900)
- state observed: `Default` (empty) — bg-white, border-input, placeholder text `#71717a`, min-h 60, current h 126.

### Field-level required (`*`)
- Marker verbatim: red asterisk `*` bằng foreground-error `#dc2626`, kề label với gap 4px.

---

## Text Content

> Verbatim VN, giữ nguyên khoảng trắng cuối chuỗi khi Figma render có trailing space.

### Shared (mọi screen S1/S2/S3)
- Header title (H1): "Sửa Kỳ kế toán"
- Header actions: "Huỷ bỏ" · "Lưu"
- Section title (H2): "Thông tin chung " (có trailing space trong node text)
- Radio labels: "Kỳ kế toán năm " · "Kỳ kế toán quý" · "Kỳ kế toán tháng"
- Field label "Thứ tự hiển thị" (không có `*`)
- Field label "Trạng thái " (có trailing space, không có `*`) — value hiển thị: "Đã đóng kỳ"
- Field label "Mô tả" — placeholder: "Nhập mô tả " (trailing space)
- Field labels với `*`: "Ngày bắt đầu *", "Ngày kết thúc *" (giá trị hiển thị "12/12/2026")
- Footer: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" (typo "Phầm" verbatim từ Figma)
- Footer buttons: "Hướng dẫn sử dụng " · "Hỗ trợ" · "Hotline: 0985135050"

### S1 — Kỳ Năm (`13523:68781`)
- Checkbox label: "Tự động sinh kỳ " (checked+disabled)
- Row 2 Left — Select label: "Năm " + `*` — trigger value: "2026"
- Row 2 Right — Input label: "Tên kỳ kế toán " + `*` — value: "Năm 2026"

### S2 — Kỳ Quý (`13523:68806`)
- Checkbox label: "Tự động sinh kỳ " (checked+disabled)
- Row 2 Left — Select label: "Tên kỳ kế toán " + `*` — trigger value: "Quý 1/2026"
- Row 2 Right — Input label: "Thuộc kỳ " + `*` — value: "Năm 2026" (disabled)

### S3 — Kỳ Tháng (`13523:68831`)
- (KHÔNG có checkbox "Tự động sinh kỳ" trong row 1)
- Row 2 Left — Select label: "Tên kỳ kế toán " + `*` — trigger value: "Quý 1/2026" (Figma test data, DEV thực dụng "Tháng NN/2026" theo BR)
- Row 2 Right — Input label: "Thuộc kỳ " + `*` — value: "Năm 2026" (disabled)

### Validation / error text (KHÔNG có trong Figma — supplement từ FEAT §AC-2)
- Tên bỏ trống → "Tên kỳ kế toán là bắt buộc"

### Trạng thái dropdown options (KHÔNG có trong Figma — supplement từ FEAT §AC-2)
- Options: "Chưa đóng" · "Đã đóng"

---

## Design Tokens

> Colors verbatim từ `get_variable_defs` + `get_design_context.styles` (authoritative theo `_ref-figma-mcp-tools.md §G3`). Expected token cột web → tra `_ref-web-transform-figma.md §1.5`.

### Colors
| Hex | Role (Figma var) | Expected Tailwind token (garage-web) |
|---|---|---|
| `#ffffff` | `base/background` | `bg-background` / `bg-white` |
| `#18181b` | `base/foreground` | `text-foreground` |
| `#71717a` | `base/muted-foreground` | `text-muted-foreground` |
| `#e4e4e7` | `base/border` | `border-border` |
| `#d4d4d8` | `base/input` | `border-input` |
| `#f4f4f5` | `base/accent` + `base/background-canva` | `bg-accent` / `bg-muted` (disabled field bg) |
| `#0052ff` | `base/foreground-brand-CD` + `base/background-brand-CD` | `bg-primary` / `bg-brand` / `text-primary` |
| `#dc2626` | `base/foreground-error` (asterisk `*`) | `text-foreground-error` / `text-destructive` |
| `#ffffff` | `base/primary-foreground` (text "Lưu") | `text-primary-foreground` / `text-white` |
| `#474847` | `Dark/3` (footer link text) | tạo token semantic mới hoặc `text-neutral-700` |
| `#525252` | `tailwind colors/neutral/600` | `text-neutral-600` |

### Typography (Font "Inter")
| Style | size / lineHeight / weight | Use | Expected |
|---|---|---|---|
| `text 2x large/leading-normal/semibold` | 24 / 32 / 600 | H1 "Sửa Kỳ kế toán" | `text-2xl font-semibold leading-8` |
| `text large/leading-normal/semibold` | 18 / 28 / 600 | H2 "Thông tin chung" | `text-lg font-semibold leading-7` |
| `text small/leading-normal/medium` | 14 / 20 / 500 | Field label, Button label | `text-sm font-medium leading-5` |
| `text small/leading-none/medium` | 14 / 1 / 500 | Radio/Checkbox label, some inline labels | `text-sm font-medium leading-none` |
| `text small/leading-normal/regular` | 14 / 20 / 400 | Input/Textarea value + placeholder + footer copy | `text-sm font-normal leading-5` |
| `Inter Light 300` | 14 / 20 / 300 | Footer copyright ("Phầm mềm quản lý…") | `text-sm font-light leading-5` |
| letter-spacing | 0 (mọi style) | — | default (không set `tracking-*`) |

### Spacing
| Token | Value | Use |
|---|---|---|
| `spacing/0` | 0 | reset padding |
| `spacing/1` | 4 | label↔asterisk gap · input gap-x · footer button list gap |
| `spacing/1-5` | 6 | radio label wrapper gap · textarea internal gap |
| `spacing/2` | 8 | radio/checkbox↔label gap · button internal gap · title text gap |
| `spacing/3` | 12 | input px · button-list column gap · select px |
| `spacing/4` | 16 | button px · field row gap-y · title text pb · textarea pt · footer px |
| `spacing/5` | 20 | header flex py |
| `spacing/6` | 24 | radio-row gap-x (giữa radio items) · header container gap-y |
| `spacing/8` | 32 | button px (Huỷ bỏ / Lưu) · page container px · page content gap-y |

### Padding cụ thể
- Page container: `px-8` (32) · h-839
- Page Header Flex: `py-5` (20)
- Title text row: `pb-4` (16)
- Radio row (Frame 1948757407): gap 24
- Field row (Flex): gap 16
- Input trigger: `px-3 py-2` (12/8) · h-9 (36)
- Textarea Input: `px-3 py-2` (12/8) · min-h 60
- Textarea label wrapper: gap-1.5 (6)
- Button (Huỷ bỏ / Lưu): `px-8 py-2` (32/8) · h-10 (40)
- Button icon back: size 40 · icon 20

### Border
- width: `1px solid` mọi input/select/checkbox/radio/button-outline
- color: `base/border #e4e4e7` (radio/checkbox) hoặc `base/input #d4d4d8` (input/select/button-outline)
- style: `solid`

### Radius
| Token | Value | Use |
|---|---|---|
| `border radius/md` = `6` | 6 | Button, Input, Select trigger, Textarea, back-button |
| `border radius/lg` = `8` | 8 | Footer button |
| `border radius/default` = `4` | 4 | Checkbox |
| `border radius/full` = `9999` | 9999 | Radio · Avatar |

### Shadow
| Token | Value | Use |
|---|---|---|
| `shadow/sm` | `0 1px 2px #0000000D` (5% α) | Input · Select trigger · Textarea |
| `shadow/base` | `0 1px 2px #0000000F` + `0 1px 3px #0000001A` | Radio · Checkbox |
| drop-shadow custom | `0 1px 1px rgba(0,0,0,0.05)` | Button "Huỷ bỏ" (outline) |
| drop-shadow custom | `0 1px 1.5px rgba(0,0,0,0.1), 0 1px 1px rgba(0,0,0,0.06)` | Button "Lưu" (primary) |

### Icons (asset URLs, ephemeral)
- Back arrow: `imgVuesaxLinearArrowLeft` (Vuesax linear arrow-left, size 20)
- Radio inner dot: `imgIconCircle` (size 10)
- Checkbox mark: `imgIconCheck` (size 16)
- Date/Status field suffix icon: `imgVuesaxLinearCalendar` (size 20) — **Note**: Figma dùng cùng calendar asset cho cả date input và Trạng thái field; DEV kỳ vọng thay bằng chevron-down cho Trạng thái theo semantic dropdown (per AC-2).

### Sizes (small components)
- Radio: 16×16 · inner dot 10×10 · border 1px
- Checkbox: 16×16 · check icon 16×16 · border 1px
- Icon container (calendar/chevron in input trailing): 20×20
- Button back-icon: 40×40 · icon 20×20
- Button standard: h=40 · px=32 · py=8 · gap=8
- Input/Select trigger: h=36 · px=12 · py=8/4
- Textarea: min-h 60 · rendered h 126

---

## Screenshots

- `assets/wave04-ap-edit/_full.png` — root section (4670×1227 → 2048×564, 2.28× downscale — overview only)
- `assets/wave04-ap-edit/13523-68781.png` — S1 Kỳ Năm full frame (1440×1024, no downscale)
- `assets/wave04-ap-edit/13523-68806.png` — S2 Kỳ Quý full frame (1440×1024, no downscale)
- `assets/wave04-ap-edit/13523-68831.png` — S3 Kỳ Tháng full frame (1440×1024, no downscale)

---

## Notes (design ↔ FEAT reconcile — ORACLE non-blocking)

Ghi lại để agent-test-ui hiểu bối cảnh khi so implementation vs oracle; **KHÔNG phải verdict**.

1. **Field "Năm" khoá cho kỳ Năm** — Figma render `bg-accent` (disabled) khớp FEAT v7 AC-3 (đã resolve confirmation 2026-07-08).
2. **Checkbox "Tự động sinh kỳ" S3 vắng mặt** — Figma design signal: kỳ Tháng không expose auto-sinh. FEAT AC-3 nói "hiển thị giá trị hiện tại nhưng không cho chỉnh" cho mọi loại kỳ — có mâu thuẫn nhẹ khi Tháng vốn không có toggle. TC nên assert S3 KHÔNG render checkbox, các loại khác render checkbox disabled.
3. **Icon suffix Trạng thái = calendar (Figma) vs expected chevron** — semantic Trạng thái là dropdown → DEV nên dùng chevron-down. Oracle ghi verbatim calendar để TC không false-positive; TC design-conformance chấp nhận cả hai (best-effort tolerance).
4. **Options Trạng thái + error text** — không có trong Figma; supplement từ FEAT AC-2 ("Chưa đóng"/"Đã đóng" + "Tên kỳ kế toán là bắt buộc").
5. **Trailing space trong labels** — nhiều label Figma có ký tự space thừa cuối chuỗi (verbatim). Implementation có thể trim; agent-test-ui coi `WRONG_TEXT` tolerance = 1 trailing whitespace.
