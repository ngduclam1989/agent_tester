---
feat: FEAT-OB-IMPORT
feat_file: Product/features/FEAT-OB-IMPORT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89263&t=W7XJPVvhmdBPtv2c-4
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89263"
fetched_at: 2026-07-08T10:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: partial (screen 3 root exceeded token cap — fetched sub-frames instead: filter 14988:93458 + toast 14646:92398; screens 1, 2 full success)
  get_screenshot: success (4 frames, per-frame per _ref-figma-mcp-tools.md §3.1.1 — section root 6365×3077 > 2048)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (default state observed for all interactive elements; hover/focus/disabled/error not captured in this canvas — Figma only shows resting states)
  text_content: complete (verbatim VN transcription from PNG + design_context binding)
  design_tokens: complete (hex + token name from get_variable_defs)
  interaction_states: partial (drop zone dragging/error not shown in canvas; button hover not shown)
screenshots:
  - assets/wave04-ob-import/14646-92037.png    # S1 — Empty upload state (no file)
  - assets/wave04-ob-import/14646-93567.png    # S2 — File uploaded (before preview)
  - assets/wave04-ob-import/14646-93780.png    # S3 — File preview + validate table
  - assets/wave04-ob-import/14646-92297.png    # S4 — Success toast overlay
---

# Oracle — FEAT-OB-IMPORT (Import tồn đầu kỳ) · web · wave04

> Design-conformance oracle cho agent-test-ui verify implementation khớp Figma (5 cấp).
> Fetched from Figma node `14492:89263` (section root, 6365×3077). Per-frame screenshots (§3.1.1).
> Feature semantics: **single-page** (no wizard stepper) — drop zone → file card → filter+preview table inline → confirm/cancel in header.

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| S1 — Empty upload (no file selected) | `14646:92037` | 1440×822 | `assets/wave04-ob-import/14646-92037.png` |
| S2 — File uploaded (card visible, before validate/preview appears) | `14646:93567` | 1440×822 | `assets/wave04-ob-import/14646-93567.png` |
| S3 — File preview + validate table (filter + counters + rows) | `14646:93780` | 1440×992 | `assets/wave04-ob-import/14646-93780.png` |
| S4 — Success toast overlay (post-confirm, before redirect to LIST) | `14646:92297` (toast `14646:92398`) | 1440×900 (toast 360×56) | `assets/wave04-ob-import/14646-92297.png` |

**Note trap M-trap-1 (wizard step indicator)**: FEAT AC-1 explicitly says **"single page (không wizard stepper)"** — S1/S2/S3 are progressive **states of one page**, KHÔNG phải 3 wizard steps. No step numbers, no "Bước 1/2" text present in any frame. Verify absence of Stepper component.

---

## Component Inventory

### Screen: S1 — Empty upload (14646:92037)
- Navbar × 1 (top blue bar + sub-tab bar `Nav`)
- Page Header × 1 (back button IconButton + `h1` title "Tải lên danh sách tồn đầu kỳ")
- Button × 0 in header right area (`Button list` frame has `w=428, h=40` **empty** — Xác nhận + Huỷ bỏ hidden in this state per PNG L143)
- Section Title × 1 ("Thông tin cơ bản", h3 style)
- Link/Button ghost × 1 (`Mẫu file danh sách tồn đầu kỳ.xlsx` with `vuesax/linear/document-text` icon, foreground-brand-CD `#0052ff`)
- Upload / CTA dropzone × 1 (dashed border, upload icon in circle bg-process, drag-hint text, "nhấn để chọn tệp" link)
- Section Footer × 1 (copyright + `Hướng dẫn sử dụng` + `Hỗ trợ` + `Hotline: 0985135050` ghost buttons)

### Screen: S2 — File uploaded (14646:93567)
- Same as S1 +
- Upload / item × 1 (file card: XLS green format icon 40×40 + `Filename.format` (14px medium) + `1.3MB` (12px muted) + trash IconButton right)

### Screen: S3 — File preview + validate table (14646:93780)
- Same as S2 +
- Header right Button list × 2: **"Huỷ bỏ"** (outline default) + **"Xác nhận"** (default primary blue) — `w=428, h=40` container
- Filter bar (`14988:93458`):
  - Input / Basic × 1 (search with icon-left, placeholder "Tìm theo mã nội bộ, tên sản phẩm", `w=320, h=36`)
  - Button × 3 tab-style filters ("Tất cả" default primary selected, "Hợp lệ" outline, "Lỗi" outline) — `h=36`
  - Number Report frame × 1 with 3 inline label-value pairs: `Tổng cộng: 40` · `Hợp lệ: 40` (green) · `Lỗi: 0` (red)
  - Button (outline) × 1 "Tải file lỗi" with icon-left (`vuesax/linear/frame`/document-download), `w=119, h=36`, right-aligned
- Table × 1 (Sản phẩm / Table, 1216×300 with 11 columns + 1 total row 1216×40)
- Row footer (total row) × 1

### Screen: S4 — Success toast (14646:92297, node 14646:92398)
- Popup/Dialog Overlay × 1 (`14646:92397`, hidden=false per metadata — page underneath dimmed/hidden)
- Toast message × 1 (Variant=Success, `360×56`, at `(1068, 116)` = **top-right position**)
  - Icon `vuesax/bold/tick-circle` (20×20, green fill matches border `#22c55e`)
  - Text semibold 14/20 `Tải tệp lên thành công!` (verbatim per FEAT AC-8)
  - Close IconButton (`X`, 16×16, opacity 50%)

---

## Variant & State

### Header buttons — S1/S2 vs S3
| Button | S1 present? | S2 present? | S3 present? | Notes |
|---|---|---|---|---|
| Back arrow (`←`, IconButton ghost 40×40) | Yes | Yes | Yes | Always present at header left |
| Huỷ bỏ (`variant=outline, size=default, h=40`) | No | No | **Yes** | Only appears after file has parsed (AC-1) |
| Xác nhận (`variant=default/primary blue, size=default, h=40`) | No | No | **Yes** | Disabled when errors > 0 (AC-6) — canvas shows enabled state (`Lỗi: 0`) |

### Filter tabs (S3 only, `14988:93460`)
| Tab | Variant | State observed | Notes |
|---|---|---|---|
| Tất cả | `variant=default (primary blue)` | selected | bg `#0052ff`, text white, `drop-shadow` |
| Hợp lệ | `variant=outline` | default (not selected) | bg white, border `#d4d4d8`, text `#18181b` |
| Lỗi | `variant=outline` | default (not selected) | bg white, border `#d4d4d8`, text `#18181b` |

### Table row status badge (S3 only)
| Badge value | Variant | Colors observed | Notes |
|---|---|---|---|
| Hợp lệ | success (green) | bg `#f0fdf4` (background-success) · border `#22c55e` (border-success) · text likely `#16a34a` (foreground-success) | Shown on rows 1, 2, 5 |
| Lỗi | error (red/destructive) | bg `#fef2f2` (background-error) · text `#dc2626` (foreground-error) | Shown on rows 3, 4 |

### Upload / CTA dropzone (`14646:93440`) — states observed
| State | Present in canvas | Design attributes |
|---|---|---|
| default (empty, awaiting file) | Yes (S1, S2 both show default) | dashed border `#d4d4d8`, bg transparent, icon-circle bg-process `#eff6ff` |
| dragging (drag-over) | Not in canvas | agent-test-ui — verify via oracle-supplement: FEAT AC-3 mentions "kéo thả hoặc nhấn" — dragging visual not enforced |
| uploading (progress) | Not in canvas | — |
| error (file rejected AC-3b: not `.xlsx`, empty, > 500 rows) | Not in canvas | agent-test-ui — verify error message wording from FEAT AC-3b (ERR-INV-048) via UX-FLOW / production baseline |

### File item card (`14646:93756`, `Upload / item`) — states
| State | Present in canvas | Design attributes |
|---|---|---|
| success (parsed, remove-enabled) | Yes (S2, S3) | white bg, border `#e4e4e7`, radius `lg` (8px), padding 12, XLS format icon 40×40, trash IconButton `h=40, w=40` |
| parsing/progress | Not in canvas | — |
| error (file-level reject) | Not in canvas | Verify via FEAT AC-3b + UX-FLOW |

### Row states (table)
| Row style | Observed | Notes |
|---|---|---|
| default (odd row) | Yes | white bg, border-bottom `#e4e4e7` |
| footer total row | Yes | slightly darker bg (canvas shows subtle shade); label "Tổng" (semibold) on left; SL tồn total `115` + Giá trị tồn total `48.000.000đ` right-aligned |
| hover / selected | Not in canvas | verify default behavior — no interactive per-row in Figma |

---

## Text Content (verbatim VN)

### Screen: S1 — Empty upload (14646:92037)
**Navbar (top blue):**
- `Tổng quan`
- `Mua hàng`
- `Sửa chữa & Dịch vụ`
- `Tồn kho` (selected — white bg, blue text)
- `Khách hàng`
- `Marketing`
- `Nhân viên`
- `Danh mục ` (trailing space verbatim per metadata `Danh mục ` — 22438:2054)

**Sub-nav (Tồn kho tab bar):**
- `Phiếu nhập kho`
- `Phiễu xuất kho ` (verbatim typo "Phiễu" per metadata `18000:2598` + trailing space)
- `Tồn đầu kỳ` (active — foreground-brand-CD `#0052ff`, border-b-2 primary)
- `Tính giá xuất kho ` (trailing space)
- `Báo cáo tồn kho ` (trailing space)
- `Báo cáo NXT`

**Page:**
- `Tải lên danh sách tồn đầu kỳ` (page title, 2xl semibold `#18181b`)
- `Thông tin cơ bản` (section title, lg semibold `#18181b`)
- `Mẫu file danh sách tồn đầu kỳ.xlsx` (link, sm medium foreground-brand-CD `#0052ff`, prefixed with document-text icon)
- `Kéo thả hoặc` (dropzone text, sm regular `#18181b`)
- `nhấn để chọn tệp` (dropzone link, sm medium foreground-link `#1d4ed8`)
- `Hỗ trợ file: .xls, .xlsx, .csv` (dropzone hint, xs regular muted `#71717a`)

**Footer:**
- `Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0` (verbatim typo "Phầm" per metadata `17421:81927`)
- `Hướng dẫn sử dụng ` (trailing space)
- `Hỗ trợ`
- `Hotline: 0985135050`

### Screen: S2 — File uploaded (14646:93567)
Same as S1 +
- `Filename.format` (placeholder file name, sm regular `#18181b`)
- `1.3MB` (file size, xs regular muted `#71717a`, `leading-none`)

### Screen: S3 — File preview + validate (14646:93780)
Same as S2 +
- `Huỷ bỏ` (button label, sm medium — outline variant)
- `Xác nhận` (button label, sm medium — primary variant)
- **Search placeholder**: `Tìm theo mã nội bộ, tên sản phẩm` (sm regular muted `#71717a`)
- Filter tab labels: `Tất cả` · `Hợp lệ` · `Lỗi`
- Counter labels: `Tổng cộng:` · `Hợp lệ:` · `Lỗi:` (small bold `#18181b`)
- Counter values (canvas mock): `40` · `40` (green) · `0` (red)
- `Tải file lỗi` (right button, sm medium `#18181b`, with icon-left)
- **Table column headers** (11 columns, per FEAT AC-4 — canvas visible columns match):
  - `STT` · `Dòng` · `Tồn đến ngày` · `Kho` · `Mã nội bộ` · `Tên nội bộ` · `ĐVT` · `SL tồn` · `Giá trị tồn` · `Trạng thái` · `Lý do lỗi` (11th column may be truncated in canvas render — see Design Tokens > Layout notes)
- **Sample row values** (mock data, 5 rows):
  | STT | Dòng | Tồn đến ngày | Kho | Mã nội bộ | Tên nội bộ | ĐVT | SL tồn | Giá trị tồn | Trạng thái |
  |---|---|---|---|---|---|---|---|---|---|
  | 1 | 1 | 13/12/2026 | Kho chính | `AS78-1234-EDC9` (link blue) | Bộ má phanh | Cái | 23 | 12.000.000 | Hợp lệ |
  | 2 | 2 | 13/12/2026 | Kho chính | `MN56-4567-WSX6` | Lọc gió | Cái | 23 | 12.000.000 | Hợp lệ |
  | 3 | 3 | 13/12/2026 | Kho chính | `VB34-7890-QAZ3` | Bộ bugi | Cái | 23 | 12.000.000 | Lỗi |
  | 4 | 4 | 13/12/2026 | Kho chính | `XC12-0123-REW0` | Dây curoa cam | Cái | 23 | 12.000.000 | Lỗi |
  | 5 | 5 | 13/12/2026 | Kho chính | `ZA90-3456-UYT7` | Kim phun nhiên liệu | Cái | 23 | 12.000.000 | Hợp lệ |
- **Total row**: `Tổng` (label semibold) · SL tồn `115` · Giá trị tồn `48.000.000đ` (semibold `#18181b`)

**Badge wording (Trạng thái column)**:
- `Hợp lệ` (green badge — bg-success `#f0fdf4`, text/border success)
- `Lỗi` (red badge — bg-error `#fef2f2`, text-error `#dc2626`)

**Lý do lỗi column** — Not visibly rendered with wording in canvas mock (rows show badge only). Per FEAT AC-5, expected verbatim VN wording for error rows (rút gọn theo Figma):
- `Sai mã` (→ `ERR-INV-009` / `ERR-INV-010`)
- `Kỳ đã đóng` (→ `ERR-INV-024`)
- `ĐVT lệch` (→ `ERR-INV-019`)
- (+ additional per FEAT §AC-5: SL ≤ 0 `ERR-INV-032`, Giá trị < 0 `ERR-INV-033`, Kho không tồn tại `ERR-INV-020`, tồn âm point-in-time `ERR-INV-036`, sau/cùng phiếu `ERR-INV-035`, trùng mã+kho `ERR-INV-034`, thiếu/định dạng ngày `ERR-INV-017/018`, cap 500 dòng `ERR-INV-048`)
- **Supplement source**: `Product/features/FEAT-OB-IMPORT.md §2 AC-5` — canvas mock uses mostly "Hợp lệ"/"Lỗi" only.

### Screen: S4 — Success toast (14646:92297, toast 14646:92398)
- Toast body verbatim: **`Tải tệp lên thành công!`** (small semibold `#18181b` on bg-success `#f0fdf4`)
- Toast close IconButton `X` (16×16, opacity 50%)
- Icon: `vuesax/bold/tick-circle` (20×20)
- Match FEAT AC-8 wording exactly (character-by-character including `!` and diacritic `ệ`).

---

## Design Tokens

### Screen-wide Color tokens (from `get_variable_defs`)
| Token | Hex | Role / expected Tailwind class |
|---|---|---|
| `base/background` | `#ffffff` | `bg-background` (page bg) |
| `base/foreground` | `#18181b` | `text-foreground` (primary text) |
| `base/muted-foreground` | `#71717a` | `text-muted-foreground` (hint/placeholder) |
| `base/foreground-brand-CD` | `#0052ff` | `text-primary` / `bg-brand` / `bg-primary` (Xác nhận btn, Tồn đầu kỳ active tab, template link) |
| `base/background-brand-CD` | `#0052ff` | Navbar top bg + Xác nhận btn bg |
| `base/border-brand-CD` | `#0052ff` | active tab `border-b-2` |
| `base/foreground-link` | `#1d4ed8` | `text-blue-700` — "nhấn để chọn tệp" link |
| `base/border` | `#e4e4e7` | `border` — table row divider, sub-nav bottom border, file-card border |
| `base/input` | `#d4d4d8` | `border-input` — dropzone dashed border, input border, outline btn border |
| `base/accent` | `#f4f4f5` | `bg-accent` — table total row bg (canvas shows subtle shade) |
| `base/background-process` | `#eff6ff` | `bg-blue-50` — dropzone icon-circle bg |
| `base/background-success` | `#f0fdf4` | `bg-green-50` — toast bg, Hợp lệ badge bg |
| `base/border-success` | `#22c55e` | `border-green-500` — toast border, Hợp lệ badge border |
| `base/foreground-success` | `#16a34a` | `text-green-600` — Hợp lệ counter value + badge text |
| `base/background-error` | `#fef2f2` | `bg-red-50` — Lỗi badge bg |
| `base/foreground-error` | `#dc2626` | `text-red-600` — Lỗi counter + badge text |
| `base/background-error-reverse` | `#ef4444` | `bg-red-500` — reserved for destructive actions |
| `base/primary-foreground` | `#ffffff` | white text on brand bg (Xác nhận, Tất cả tab) |
| `Dark/3` | `#474847` | footer link text `text-[#474847]` |

### Typography tokens (all `Inter` family, `--font-primary`)
| Token | Size / weight / line-height | Used on |
|---|---|---|
| `text 2x large/leading-normal/semibold` | 24px / 600 / 32px | Page title `Tải lên danh sách tồn đầu kỳ` |
| `text large/leading-normal/semibold` | 18px / 600 / 28px | Section title `Thông tin cơ bản` |
| `text base/leading-normal/semibold` | 16px / 600 / 24px | Navbar `GMS` logo text |
| `text small/leading-normal/medium` | 14px / 500 / 20px | Navbar links, tab labels, button labels, template link, file name, filter tab labels, `Tải file lỗi`, table headers, badges |
| `text small/leading-normal/regular` | 14px / 400 / 20px | Dropzone `Kéo thả hoặc`, search placeholder, file card body cells, footer, table cell values |
| `text small/leading-normal/semibold` | 14px / 600 / 20px | Toast body `Tải tệp lên thành công!` |
| `text small/leading-none/bold` | 14px / 700 / 1 (px = 14) | Counter row `Tổng cộng:` `Hợp lệ:` `Lỗi:` labels + values |
| `text extra small/leading-normal/regular` | 12px / 400 / 16px | Dropzone hint `Hỗ trợ file: .xls, .xlsx, .csv`, footer version light |
| `text extra small/leading-none/regular` | 12px / 400 / 1 (px = 12) | File card `1.3MB` |

**letter-spacing**: All text tokens have `letterSpacing: 0` (checked in `get_variable_defs` — no `--letter-spacing` variables emitted).

### Spacing tokens
| Token | Value | Used on |
|---|---|---|
| `spacing/0` | 0 | — reset padding on flex/Nav |
| `spacing/0-5` | 2 | dropzone text-block inner gap |
| `spacing/1` | 4 | gap in `Kéo thả hoặc {link}` row, dropzone icon-text gap, file card processing gap |
| `spacing/1-5` | 6 | navbar link inner gap |
| `spacing/2` | 8 | Section title gap, file card content gap, filter tabs gap, drop zone icon padding |
| `spacing/2-5` | 10 | — |
| `spacing/3` | 12 | file card padding, navbar horizontal spacing, filter action row gap |
| `spacing/4` | 16 | Section title bottom pad, Content gap, dropzone text row gap, Number Report inner gap, button padding-x |
| `spacing/5` | 20 | header top/bottom pad (`py-[var(--spacing/5,20px)]`) |
| `spacing/6` | 24 | dropzone padding-y, gap in Content between section + card |
| `spacing/8` | 32 | Page container padding-x (`px-[32px]`), Filter Left group gap |
| `spacing/12` | 48 | Dropzone padding-x |

### Height / Width tokens
| Token | Value | Used on |
|---|---|---|
| `height/h-10` | 40 | Avatar, header buttons list `h-10`, back button, file card trash button |
| `height/h-9` | 36 | Button size=default `h-9`, filter tab buttons |
| `height/h-5` | 20 | icon default 20×20 |
| `height/h-4` | 16 | small icons 16×16 |
| `width/w-24` | 96 | reserved |
| `width/w-10` | 40 | Avatar w |
| `width/w-9` | 36 | Button icon size |
| `width/w-4` | 16 | small icon w |
| `width/w-5` | 20 | icon w |

### Radius / Shadow
| Token | Value | Used on |
|---|---|---|
| `border radius/md` | 6 | Buttons `rounded-md`, input `rounded-md`, navbar link `rounded-md`, toast `rounded-md`, dropzone `rounded-[6px]` |
| `border radius/lg` | 8 | File card `rounded-lg`, footer buttons `rounded-lg` |
| `radius/rounded-full` | 9999 | Avatar circle, dropzone icon-circle, `rounded-full` |
| `border radius/full` | 9999 | same |
| `shadow/sm` | drop `#0000000D` (0,1) blur 2 | Input, buttons |
| `shadow/base` | drop `#0000000F`+`#0000001A` | file card / stronger container |
| `shadow/lg` | drop `#0000000D`(0,4) blur 6 + `#0000001A`(0,10) blur 15 | Toast |

### Layout (Screen: S3 — table region)
- Page container `max-w-[1280px]`, inner padding `px-8` (32px) → content width 1216px.
- Table `w=1216` split into 11 columns:

  | # | Column | Width (px) | nodeId `Collum` |
  |---|---|---|---|
  | 1 | STT | 60 | `14646:94002` |
  | 2 | Dòng | 60 | `14646:94009` |
  | 3 | Tồn đến ngày | 168 | `14646:94016` |
  | 4 | Kho | 120 | `14646:94023` |
  | 5 | Mã nội bộ | 185 | `14646:94030` |
  | 6 | Tên nội bộ | 178 | `14646:94037` |
  | 7 | ĐVT | 120 | `14646:94044` |
  | 8 | SL tồn | 120 | `14646:94051` |
  | 9 | Giá trị tồn | 130 | `14646:94058` |
  | 10 | Trạng thái | 154 | `14646:94065` |
  | 11 | Lý do lỗi | 168 | `14646:94072` |
  Σ = 60+60+168+120+185+178+120+120+130+154+168 = **1463** — this exceeds 1216 by 247px → table container is wider than page container OR internally scroll-x. Per FEAT AC-4 pagination + FEAT wording implies **horizontal scroll** on narrow viewports. Also compare with the same tables in the detail subframes `14646:94337` / `14646:94422` which are 1463 wide (see metadata) — those are the **native** table extracts.
- Row height: 40 (header) + 5×52 (data rows) + 40 (total row) = 340.
- Filter bar: `h=36`, Left group `w=820` (Action `w=552` + Number Report `w=236`) + Action Right `w=119`.

### Dropzone (S1/S2/S3 all show same idle dropzone)
- Full-width `w=1216, h=120`, `border-dashed` `border-input` `#d4d4d8`, `border-width=1px`, `rounded-[6px]`.
- Padding: `px-12 py-6` (48 / 24).
- Icon: `bg-blue-50 #eff6ff` circle, `p-2`, contains `vuesax/linear/export` (16×16) icon.
- Text stack: gap 2px, centered.

### File card (S2/S3, `14646:93756`)
- `w=1216 (full), h=64`, `bg-white`, `border #e4e4e7 solid 1px`, `rounded-lg` (8px), `p-3` (12).
- Layout: horizontal, gap 12; left icon 40×40 (XLS format), center flex-1 stack (name + size), right trash IconButton (h=40, w=40, ghost).
- Trash icon: `vuesax/linear/notification-bing` per metadata reference **but** PNG shows a trash/delete icon — likely `vuesax/linear/trash` (metadata may reuse a placeholder ref; DEV should map to `Trash` variant).

### Toast (S4, `14646:92398`)
- `w=360, h=56`, `bg-background-success #f0fdf4`, `border 1px solid #22c55e`, `rounded-md`.
- Padding: `pl-4 pr-6 py-4`.
- Position: `top-right`, offset `x=1068, y=116` from viewport (per `14646:92398` bounds).
- Icon: `vuesax/bold/tick-circle` (20×20, filled).
- Body text: `text small/leading-normal/semibold` `#18181b`.
- Close X: 16×16 with `opacity-50` container padding `p-1` `rounded-md`.
- Shadow: `shadow-lg`.

### Interaction states — not present in canvas (verify via defaults)
- `:hover` / `:focus-visible` / `:active` for buttons (Huỷ bỏ, Xác nhận, filter tabs, Tải file lỗi, back arrow, template link) — canvas shows default only. **Verify agent-test-ui**: match shadcn baseline defaults (`_ref-web-transform-figma.md §1.5` — `default` variant, `outline` variant, ghost buttons).
- `:disabled` for `Xác nhận` — expected per FEAT AC-6 when `Lỗi > 0`. Canvas shows enabled state (`Lỗi: 0`). Verify wording `Còn dòng lỗi — vui lòng sửa file rồi kiểm tra lại trước khi import.` (FEAT AC-6) exists as tooltip or below.
- `dragging` / `error` / `uploading` for dropzone — not in canvas.
- Table row `:hover` — not in canvas.

---

## Screenshots

> `assets/wave04-ob-import/`

- `14646-92037.png` — S1 Empty upload (1440×822, no file selected)
- `14646-93567.png` — S2 File uploaded (1440×822, file card visible, no confirm buttons yet)
- `14646-93780.png` — S3 File preview + validate (1440×992, filter + 5-row mock table + total row + Huỷ bỏ/Xác nhận buttons)
- `14646-92297.png` — S4 Success toast overlay (1440×900, only toast + gray dim)

> **Per-frame rule applied** (`_ref-figma-mcp-tools.md §3.1.1`): section root `14492:89263` = 6365×3077 > 2048 → screenshots taken per-frame at native 1440-wide, no downscale.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | main agent (session-1 orchestrator, /prefetch-figma-oracle web 04 FEAT-OB-IMPORT) | Initial oracle gen. Section root 6365×3077 → per-frame screenshots (§3.1.1). 4 screens captured: S1 empty, S2 file uploaded, S3 preview+validate table (filter + 11-col table), S4 success toast. Screen 3 root design_context exceeded token cap → supplemented with metadata + sub-frame fetch (filter `14988:93458` + toast `14646:92398`). Text 100% verbatim from PNG + design_context binding. Design tokens complete from `get_variable_defs`. Interaction states partial (drop-dragging / button hover / disabled not in Figma canvas — flag `data_completeness.interaction_states: partial`). |
