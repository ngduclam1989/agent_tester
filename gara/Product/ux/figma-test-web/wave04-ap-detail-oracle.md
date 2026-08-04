---
feat: FEAT-AP-DETAIL
feat_file: Product/features/FEAT-AP-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87552&t=W7XJPVvhmdBPtv2c-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87552"
fetched_at: 2026-07-08T03:26:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success
  get_screenshot: success (4 PNGs — 1 section overview + 3 screen frames)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete
  design_tokens: complete
  interaction_states: partial (design shows only default state — no hover/focus/disabled/loading variants surfaced in Figma; AC-1..AC-6 read-only view, action states verify against UX-FLOW + button primitive baseline)
screenshots:
  - assets/wave04-ap-detail/_full.png
  - assets/wave04-ap-detail/13523-69659.png
  - assets/wave04-ap-detail/13523-70227.png
  - assets/wave04-ap-detail/13523-70433.png
---

# Oracle — FEAT-AP-DETAIL (web · wave04)

> Design-conformance oracle cho `agent-test-ui` verify implementation khớp Figma (5 cấp).
> Section root `14146:87552` = "FEAT-AP-DETAIL" chứa 3 top-level screen frames (Năm / Quý / Tháng).
> Section width 4670 > 2048 → per-frame screenshots đã capture cho từng screen (không downscale, 1440×1024 native).

---

## Screen Inventory

| # | Screen state (loại kỳ) | Frame name | nodeId | size | screenshot |
|---|---|---|---|---|---|
| 1 | Chi tiết kỳ kế toán năm | FEAT-AP-DETAIL | `13523:69659` | 1440×1024 | `assets/wave04-ap-detail/13523-69659.png` |
| 2 | Chi tiết kỳ kế toán quý | FEAT-AP-DETAIL-2 | `13523:70227` | 1440×1024 | `assets/wave04-ap-detail/13523-70227.png` |
| 3 | Chi tiết kỳ kế toán tháng | FEAT-AP-DETAIL-3 | `13523:70433` | 1440×1024 | `assets/wave04-ap-detail/13523-70433.png` |
| — | Section overview | FEAT-AP-DETAIL | `14146:87552` | 4670×1224 → 2048×563 (downscaled overview only) | `assets/wave04-ap-detail/_full.png` |

**Structural differences across 3 screens**:
- Screen 1 (Năm): Row 1 = **3 fields** (Loại kỳ · Tên kỳ kế toán · Thứ tự hiển thị) + 1 empty col.
- Screen 2 (Quý) & Screen 3 (Tháng): Row 1 = **4 fields** (Loại kỳ · Tên kỳ kế toán · **Thuộc kỳ** · Thứ tự hiển thị).
- Row 2 & Row 3 identical structure across 3 screens.
- Screen 2/3 share the same figma mockup data — the only intended difference is the title label ("quý" vs "tháng"). Real runtime data will differ per BR-AP; oracle records verbatim Figma text.

---

## Component Inventory

### Screen 1 (Năm) — `13523:69659`
- **Navbar** × 1 (`13626:291750`, 1440×104 top; instance placeholder)
- **Page Header / 3** × 1 (`13523:69663`, 1216×80)
  - **Button** (Ghost, size=icon) × 1 — back arrow "←" (`I13523:69663;17478:20246`, 40×40, `bg-transparent` → shadcn:button variant="ghost" size="icon")
  - **Heading** (H1) × 1 — "Chi tiết kỳ kế toán năm" (24px semibold)
  - **Button** (Outline, size=default) × 1 — "Chỉnh sửa" + edit icon (h-10 px-8 → shadcn:button variant="outline")
- **Section title (H2)** × 1 — "Thông tin chung" (18px semibold)
- **Info Item** × 10 (label + value pairs; Row 1 shows 3 filled + 1 empty placeholder; Row 2 = 4; Row 3 = 4)
- **Section Footer / 2** × 1 (`13523:69683`, 1440×48; instance — copyright + Hướng dẫn/Hỗ trợ/Hotline)

### Screen 2 (Quý) — `13523:70227`
- Same layout as Screen 1 với 4 khác biệt:
  - Heading text = "Chi tiết kỳ kế toán quý"
  - Row 1 có 4 Info Item (thêm "Thuộc kỳ" giữa "Tên kỳ kế toán" và "Thứ tự hiển thị")
  - Info Item × 12 tổng
- Còn lại (Navbar, Page Header, Section title, Row 2 layout, Row 3 audit, Footer) identical.

### Screen 3 (Tháng) — `13523:70433`
- Same layout as Screen 2 với 1 khác biệt:
  - Heading text = "Chi tiết kỳ kế toán tháng"
- Còn lại (Navbar, Page Header, 4-col Row 1, Row 2, Row 3 audit, Footer) identical.

### shadcn primitives count (per screen)
| Primitive | Screen 1 (Năm) | Screen 2 (Quý) | Screen 3 (Tháng) |
|---|---|---|---|
| Button (Ghost/icon back) | 1 | 1 | 1 |
| Button (Outline `Chỉnh sửa`) | 1 | 1 | 1 |
| Button (Ghost — footer links: Hướng dẫn / Hỗ trợ / Hotline) | 3 | 3 | 3 |
| Heading H1 (page title) | 1 | 1 | 1 |
| Heading H2 (`Thông tin chung`) | 1 | 1 | 1 |
| Info Item (label 14px regular muted + value 14px medium) | 10 (3+3+4) | 12 (4+4+4) | 12 (4+4+4) |
| Avatar (navbar) | 1 (instance) | 1 (instance) | 1 (instance) |
| Notification bell (navbar) | 1 (instance) | 1 (instance) | 1 (instance) |
| Icon (Edit — vuesax) | 1 (in `Chỉnh sửa` btn) | 1 | 1 |
| Icon (ArrowLeft — vuesax) | 1 (in back btn) | 1 | 1 |

---

## Variant & State

### Button "Chỉnh sửa" (`I13523:69663;17421:80020`) — top-right action
- variants: `variant="outline"` (border-input, drop-shadow-sm), `size="default"` (h-10 px-8 py-2)
- states observed: **default only** (Figma không render hover/focus/disabled variants trong 3 screen frames)
- expected runtime states (verify against shadcn/ui baseline §1.5):
  - hover: `bg-accent` per shadcn outline
  - focus-visible: `ring-1 ring-ring`
  - disabled: `opacity-50 cursor-not-allowed`

### Button icon back "←" (`I13523:69663;17478:20246`)
- variants: `variant="ghost"`, `size="icon"` (40×40, `bg-transparent`, `rounded-md`)
- states observed: **default only**
- expected: hover `bg-accent`, focus ring — per shadcn ghost/icon baseline

### Info Item (label + value pair) — cấu trúc chung
- variants: N/A (không có variant — static read-only display block)
- states observed: **default filled** (all 3 screens); empty-value state (khi chưa từng sửa) KHÔNG render trong Figma:
  - AC-3 (FEAT §2) yêu cầu: "Ngày sửa"/"Người sửa" khi kỳ chưa từng sửa → label hiển thị + value rỗng ("—" hoặc rỗng), KHÔNG ẩn field.
  - Oracle không có empty-state visual reference cho 2 field này — verify implementation bằng AC-3 (không được ẩn field).

### Section Footer / 2 links (Hướng dẫn / Hỗ trợ / Hotline)
- variants: `variant="ghost"`, size `h-10 p-2 rounded-lg` (custom size)
- states observed: **default only** (link-style, text `#474847` regular 14px/20px)

---

## Text Content

### Screen 1 (Năm) — `13523:69659`
**Page header**
- "Chi tiết kỳ kế toán năm" (H1 title)
- "Chỉnh sửa" (button label, top-right)

**Section**
- "Thông tin chung " (H2 — verbatim có trailing space từ Figma text node `I13523:69665;615:62543`)

**Row 1 — Info Items (label + value)**
- "Loại kỳ" → "Kỳ kế toán năm"
- "Tên kỳ kế toán" → "Năm 2027"
- "Thứ tự hiển thị" → "5"
- (col 4 empty placeholder — Figma node `15075:93426` không có label/value)

**Row 2 — Info Items**
- "Trạng thái" → "Đã đóng kỳ"
- "Ngày bắt đầu" → "01/01/2027"
- "Ngày kết thúc" → "31/12/2027"
- "Mô tả" → "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."

**Row 3 — Info Items (audit)**
- "Ngày tạo" → "07/05/2026 09:55"
- "Người tạo" → "Nguyễn Văn Kho"
- "Ngày sửa" → "07/05/2026 09:55"
- "Người sửa" → "Nguyễn Văn Kho"

**Footer**
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" (verbatim từ Figma — LƯU Ý typo "Phầm" thay vì "Phần" là **verbatim design text**; xác định là ẩu design hay chủ ý cần confirm với BA — oracle ghi nguyên văn)
- "Hướng dẫn sử dụng " (verbatim có trailing space)
- "Hỗ trợ"
- "Hotline: 0985135050"

### Screen 2 (Quý) — `13523:70227`
**Header + Section + Footer identical Screen 1**, khác:
- H1: "Chi tiết kỳ kế toán quý"

**Row 1 — Info Items (4 cols, thêm "Thuộc kỳ")**
- "Loại kỳ" → "Kỳ kế toán năm"
- "Tên kỳ kế toán" → "Quý 1 năm 2027"
- "Thuộc kỳ" → "Năm 2026"
- "Thứ tự hiển thị" → "5"

**Row 2, Row 3 identical Screen 1** (Trạng thái/Ngày bắt đầu/Ngày kết thúc/Mô tả · Ngày tạo/Người tạo/Ngày sửa/Người sửa với cùng sample values).

### Screen 3 (Tháng) — `13523:70433`
**Identical Screen 2**, khác duy nhất:
- H1: "Chi tiết kỳ kế toán tháng"
- Row 1..Row 3 sample values giữ y hệt Screen 2 (Figma dùng chung mock data — chưa cập nhật cho tháng).
- Runtime data (verify implementation) theo AC-2: Tên = "Tháng {M}/{YYYY}" hoặc tương tự (không có Figma reference); Thuộc kỳ = "Quý {n} năm YYYY" hoặc "Năm YYYY" per BR — cần fallback UX-FLOW hoặc AC.

---

## Design Tokens

> Nguồn: `get_variable_defs` cho section `14146:87552` (áp dụng chung 3 screen — cùng token set).
> Expected token = Tailwind v4 semantic tokens cho `garage-web` (tra `_ref-web-transform-figma.md §1.5`).

### Colors
| Figma variable | Hex | Role | Expected Tailwind token |
|---|---|---|---|
| `base/background` | `#ffffff` | Page/card BG | `bg-background` |
| `base/foreground` | `#18181b` | Text chính (title, value, foreground default) | `text-foreground` |
| `base/muted-foreground` | `#71717a` | Text phụ (Info Item label) | `text-muted-foreground` |
| `base/input` | `#d4d4d8` | Border input/button outline | `border-input` |
| `base/border` | `#e4e4e7` | Divider/border baseline | `border-border` |
| `base/foreground-brand-CD` | `#0052ff` | Brand primary (Navbar active tab) | `text-primary` / `bg-primary` |
| `base/background-brand-CD` | `#0052ff` | Brand BG | `bg-primary` |
| `base/primary-foreground` | `#ffffff` | Foreground trên nền brand | `text-primary-foreground` |
| `Dark/3` | `#474847` | Footer link text (Hướng dẫn/Hỗ trợ/Hotline) | (custom — không match token — verify hoặc map `text-muted-foreground` gần đúng) |
| `base/background-error-reverse` | `#ef4444` | Notification badge (chấm đỏ) | `bg-destructive` |
| `tailwind-colors/base/transparent` | `#ffffff00` | Ghost button BG | `bg-transparent` |

### Typography
| Figma text style | Family | Size | Line-height | Weight | Letter-spacing | Áp dụng cho | Expected class |
|---|---|---|---|---|---|---|---|
| `text 2x large/leading-normal/semibold` | Inter | 24px | 32px | 600 | 0 | H1 page title ("Chi tiết kỳ kế toán {loại}") | `text-2xl font-semibold leading-8` |
| `text large/leading-normal/semibold` | Inter | 18px | 28px | 600 | 0 | H2 section title ("Thông tin chung ") | `text-lg font-semibold leading-7` |
| `text small/leading-normal/regular` | Inter | 14px | 20px | 400 | 0 | Info Item **label** + Footer copyright/link text | `text-sm font-normal leading-5` |
| `text small/leading-normal/medium` | Inter | 14px | 20px | 500 | 0 | Info Item **value** + Button "Chỉnh sửa" label | `text-sm font-medium leading-5` |
| `text base/leading-normal/semibold` | Inter | 16px | 24px | 600 | 0 | (available, không dùng trong 3 screen) | `text-base font-semibold leading-6` |

Footer copyright dùng **`Inter Light` 300** (`font/weight/light`) — 14px/20px `#000000` (`base/foreground`).

### Spacing
| Figma variable | px | Áp dụng cho | Expected Tailwind |
|---|---|---|---|
| `spacing/0` | 0 | Padding baseline khi = 0 | `p-0` |
| `spacing/0-5` | 2 | Gap 0.5 (Info Item value wrapper) | `gap-0.5` |
| `spacing/1` | 4 | Gap 1 · Footer btn list gap · Page Header title-block gap | `gap-1` / `py-1` |
| `spacing/1-5` | 6 | (available) | `gap-1.5` |
| `spacing/2` | 8 | Info Item label→value gap · Header title↔button gap · Button horiz gap | `gap-2` / `py-2` |
| `spacing/3` | 12 | Page Header button list gap-y | `gap-3` |
| `spacing/4` | 16 | Row-inner spacing · Content vertical gap · Footer horiz padding | `gap-4` / `p-4` |
| `spacing/5` | 20 | Header block vertical padding | `py-5` |
| `spacing/6` | 24 | Page Header container gap · Section Footer container gap | `gap-6` |
| `spacing/8` | 32 | Page container horiz padding · Page content top-gap · Btn `Chỉnh sửa` horiz padding | `px-8` |

### Border radius / Shadow / Sizes
| Figma variable | Value | Áp dụng cho | Expected Tailwind |
|---|---|---|---|
| `border radius/md` | 6 | Button back (icon-ghost) · Button `Chỉnh sửa` outline | `rounded-md` |
| `border radius/lg` | 8 | Footer link buttons | `rounded-lg` |
| `radius/rounded-full` | 9999 | Avatar | `rounded-full` |
| `shadow/sm` | `DROP_SHADOW(#0000000D, 0/1, 2, 0)` | Button `Chỉnh sửa` (drop-shadow) | `shadow-sm` |
| `width/w-4` × `height/h-4` | 16×16 | Edit icon inside `Chỉnh sửa` btn | `size-4` |
| `width/w-5` × `height/h-5` | 20×20 | ArrowLeft icon back · Notification bell | `size-5` |
| `width/w-9` | 36 | (available) | `size-9` |
| `width/w-10` × `height/h-10` | 40×40 | Button back (40×40) · Avatar 40 · Btn `Chỉnh sửa` h-10 · Footer link btn h-10 | `size-10` / `h-10` |

### Page layout dimensions
| Element | Width | Height | Notes |
|---|---|---|---|
| Viewport | 1440 | 1024 | Fixed desktop frame |
| Navbar | 1440 | 104 | Full-width |
| Page container | 1280 (max-w) + 80px side margins | 839 | `max-w-[1280px] px-8` |
| Content inner | 1216 | — | (`Page container` 1280 − 32×2 padding = 1216) |
| Page Header / 3 | 1216 | 80 | title + button row |
| Info Item column | 298 | 48 (Row 1, Row 3) / 68 (Row 2 — Mô tả wraps 2 lines) | 4 cols × 298 + 3 gaps × 8 = 1216 ✔ (306 pitch) |
| Content rows vertical rhythm | — | 16 (gap between 3 rows) | Wrap gap = 16 ("Content" `gap-4`) |
| Section Footer | 1440 | 48 | `px-4 py-1` |

### Interaction states — P1/P2 (per §4 checklist)
Figma design **chỉ render default state** cho 3 screen frames. Đây là read-only detail view — không có form input.

**P1 states inherit từ shadcn/ui baseline (verify implementation, oracle KHÔNG có Figma reference)**:
- Button `Chỉnh sửa` (variant=outline size=default): hover `bg-accent`, focus `outline-none ring-1 ring-ring`, disabled `opacity-50 pointer-events-none`
- Button back "←" (variant=ghost size=icon): hover `bg-accent`, focus ring, no disabled state expected
- Footer links (Hướng dẫn/Hỗ trợ/Hotline — ghost h-10 p-2 rounded-lg): hover `bg-accent`, focus ring

**Empty audit fields** (AC-3 empty state): Ngày sửa/Người sửa khi kỳ chưa từng sửa — label vẫn hiển thị, value dạng "—" hoặc rỗng. Không có Figma visual — verify AC-3 wording ("—" hoặc rỗng theo pattern shadcn).

---

## Screenshots

| Path | Purpose | Note |
|---|---|---|
| `assets/wave04-ap-detail/_full.png` | Section overview (3 screens side-by-side) | 2048×563 (downscaled 2.28× — overview only, KHÔNG dùng làm primary visual ingest cho per-screen claims) |
| `assets/wave04-ap-detail/13523-69659.png` | Screen 1 — Chi tiết kỳ kế toán năm | 1440×1024 native (no downscale) — primary visual truth |
| `assets/wave04-ap-detail/13523-70227.png` | Screen 2 — Chi tiết kỳ kế toán quý | 1440×1024 native — primary visual truth |
| `assets/wave04-ap-detail/13523-70433.png` | Screen 3 — Chi tiết kỳ kế toán tháng | 1440×1024 native — primary visual truth |

---

## Notes for agent-test-ui (consume-side)

1. **Screen coverage gate**: ≥1 conformance TC per screen state (3 screens = 3 TC minimum) — Năm variant có 3-col Row 1, Quý/Tháng có 4-col.
2. **Row 1 count assertion**: Kỳ Năm = 3 filled Info Item; Kỳ Quý/Tháng = 4 filled Info Item với "Thuộc kỳ" chèn giữa.
3. **AC-1 button set assertion**: EXACT 2 buttons trong header (back icon "←" bên trái title + `Chỉnh sửa` bên phải). KHÔNG có nút "Đóng" (AC-1 §FEAT-AP-DETAIL).
4. **AC-2 field label verbatim**: exact string match (case + diacritic) cho Loại kỳ / Tên kỳ kế toán / Thuộc kỳ (chỉ Quý+Tháng) / Ngày bắt đầu / Ngày kết thúc / Thứ tự hiển thị / Trạng thái / Mô tả.
5. **AC-3 audit fields assertion**: 4 field (Ngày tạo / Người tạo / Ngày sửa / Người sửa) present trên cả 3 loại kỳ; empty state (kỳ chưa từng sửa) → 2 field Ngày sửa/Người sửa vẫn render label + value "—"/rỗng (KHÔNG ẩn — theo AC-3 v5 resolved 2026-07-07).
6. **AC-4 button click** → navigate `FEAT-AP-EDIT` form.
7. **AC-5 back arrow click** → navigate danh sách.
8. **Data placeholder discrepancy**: Screen 3 (Tháng) Figma dùng cùng mock data như Screen 2 (Quý) — "Kỳ kế toán năm" ở Loại kỳ + "Quý 1 năm 2027" ở Tên kỳ. Runtime data cho Tháng verify bằng BR-AP thay vì Figma verbatim.
9. **Footer typo "Phầm mềm"**: verbatim từ Figma — nếu implementation sửa thành "Phần mềm" → oracle diff cần confirm business intent (không auto-fail).
10. **Interaction states**: Figma chỉ render default → sử dụng shadcn baseline (§1.5 web-transform ref) cho hover/focus/disabled verify — KHÔNG có Figma pixel reference.
