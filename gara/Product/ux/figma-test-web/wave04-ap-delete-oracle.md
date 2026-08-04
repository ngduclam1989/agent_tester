---
feat: FEAT-AP-DELETE
feat_file: Product/features/FEAT-AP-DELETE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89258&t=W7XJPVvhmdBPtv2c-4
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89258"
fetched_at: 2026-07-08T03:26:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (both dialogs 13523:70835 + 13523:70937)
  get_screenshot: partial (4/5 — dialog 13523:70835 rate-limited; substituted by inline get_design_context output_image + parent frame 13523:70734 which shows the confirm dialog in context)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete
  design_tokens: complete
  interaction_states: partial (Figma variants captured Default only — hover/focus/disabled inherited từ shadcn baseline convention, không có variant riêng trong file)
screenshots:
  - assets/wave04-ap-delete/_full.png
  - assets/wave04-ap-delete/13523-70734.png
  - assets/wave04-ap-delete/13523-70836.png
  - assets/wave04-ap-delete/13523-70937.png
---

# FEAT-AP-DELETE — Web Oracle (Wave 04)

> **Design conformance oracle** cho agent-test-ui verify implementation garage-web khớp Figma.
> **CRITICAL**: FEAT-AP-DELETE là **2 modal/dialog** — KHÔNG có page mới. Trigger từ icon Xóa
> (thao tác row) trên trang `FEAT-AP-LIST` (Danh sách Kỳ kế toán, tab "Kỳ kế toán").
> Background trang trong Figma frame set `hidden=true` — dialog nổi lên trên page context của AP-LIST.

## Screen Inventory

| Screen state | nodeId (frame) | Dialog nodeId | Frame size | Dialog size | Screenshot |
|---|---|---|---|---|---|
| Xác nhận xóa (confirm delete) | 13523:70734 | 13523:70835 | 1440×900 | 441×210 | assets/wave04-ap-delete/13523-70734.png |
| Không thể xóa (cannot delete) | 13523:70836 | 13523:70937 | 1440×900 | 441×182 | assets/wave04-ap-delete/13523-70836.png · assets/wave04-ap-delete/13523-70937.png |

**Common structure cho cả 2 dialog**:
- Instance `Popup/Dialog Overlay` full-screen 1440×900 (backdrop) — nodeId 13523:70834 / 13523:70936.
- Instance `Dialog` centered — top=345/359 · left=500.
- Cover Figma component: `Dialog` (component nodeId 11850:104091 — shadcn dialog reference).

## Component Inventory

### Screen: Xác nhận xóa (13523:70734 → dialog 13523:70835)
- Overlay × 1 — semi-transparent backdrop full-screen.
- Dialog (shadcn primitive `Dialog`) × 1 — 441×210 card.
  - `_DialogHeader` (title + description block) × 1.
    - Title text × 1 (large/semibold, text-center).
    - Description text × 1 (small/regular, muted-foreground, text-center).
  - Button row (footer) × 1 — horizontal, gap 8px, justify-center.
    - Button variant=`secondary` × 1 — "Hủy".
    - Button variant=`destructive` × 1 — "Xoá".

### Screen: Không thể xóa (13523:70836 → dialog 13523:70937)
- Overlay × 1.
- Dialog × 1 — 441×182 card (thấp hơn dialog xác nhận 28px do title 1 dòng thay vì 2 dòng).
  - `_DialogHeader` × 1.
    - Title text × 1 (large/semibold, text-center) — "Không thể xóa".
    - Description text × 1 (small/regular, muted-foreground, text-center).
  - Button row × 1 — chỉ 1 nút.
    - Button variant=`secondary` × 1 — "Đóng". **KHÔNG có nút destructive**.

## Variant & State

### Dialog (shadcn `Dialog` primitive — cả 2 screen)
- variants observed: Default (open) — 1 state duy nhất trong Figma.
- Container: `bg-white`, `border 1px solid #e4e4e7`, `rounded-md` (calc 6px từ token `border-radius/md`), padding **24px** all sides (`spacing/6`), `gap-6` (24px) between `_DialogHeader` và button row, drop-shadow `shadow-lg` (`0px 10px 15px -3px #0000001A, 0px 4px 6px -2px #0000000D`).
- Header block: `flex-col`, `gap-1.5` (6px), `items-start`, `text-center`, `w-full`, `word-break: break-word`.
- Button row: `flex-row`, `gap-2` (8px), `items-center`, `justify-center`, `w-full`.

### Button variant=secondary ("Hủy" / "Đóng")
- variants observed: Default. States (từ shadcn baseline §1.5 — không có variant Figma).
- style: `bg-[#f4f4f5]` (`base/secondary`), `text-[#18181b]` (`base/secondary-foreground`), height 36px (`h-9`), px-4 py-2, `rounded-md` (6px), `drop-shadow-sm` (`0px 1px 2px #0000000D`).
- text: small/medium (14px / 500 / lh 20px).

### Button variant=destructive ("Xoá")
- variants observed: Default. States (từ shadcn baseline §1.5).
- style: `bg-[#dc2626]` (`base/destructive`), `text-[#fef2f2]` (`base/destructive-foreground`), height 36px, px-4 py-2, `rounded-md` (6px), `drop-shadow-sm`.
- text: small/medium (14px / 500 / lh 20px).

### Interaction states (baseline — NOT in Figma, verify via shadcn convention §1.5)
- secondary button: `:hover` bg-secondary/80 · `:focus-visible` ring-1 primary · `:disabled` opacity-50 cursor-not-allowed.
- destructive button: `:hover` bg-destructive/90 · `:focus-visible` ring-1 destructive · `:disabled` opacity-50.

## Text Content (verbatim VN — critical wording verify)

### Screen: Xác nhận xóa (13523:70835)
- Title: **"Bạn có chắc chắn muốn xóa kỳ kế toán Tháng 2/2027 không?"**
  - `Tháng 2/2027` = placeholder tên kỳ — DEV phải interpolate `{tên kỳ}` runtime. Wording cấu trúc verbatim: `"Bạn có chắc chắn muốn xóa kỳ kế toán {tên kỳ} không?"`
- Description: **"Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan."**
- Button 1 (secondary): **"Hủy"**
- Button 2 (destructive): **"Xoá"**  ← ⚠️ Figma dùng "Xoá" (dấu sắc trên á); FEAT §AC-1 spec dùng "Xóa" (dấu sắc trên o). Wave-04 rule W-R1 verbatim label — DEV MUST dùng verbatim từ Figma = **"Xoá"**. agent-test-ui verify literal "Xoá" trong DOM.

### Screen: Không thể xóa (13523:70937)
- Title: **"Không thể xóa"** (dấu sắc trên o — "xóa" chuẩn).
- Description: **"Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa."**
- Button (secondary): **"Đóng"**

### Notes — text alignment
- Cả title + description: `text-center` (spec `text-center` class trong `_DialogHeader`).
- Description khi wrap 2 dòng (screen "Không thể xóa"): dòng 2 "nên không được xóa." căn giữa với dòng 1.

### FEAT §AC-5 (Chặn xóa khi còn kỳ con) — text NOT in Figma
- FEAT §AC-5 spec 1 case "Không thể xóa" khi kỳ cha còn kỳ con với **thông báo phải xóa hết kỳ con trước khi xóa kỳ cha** — nhưng Figma CHỈ ship 1 variant text cho "Không thể xóa" (kịch bản đã đóng / đã phát sinh dữ liệu kho). agent-test-ui **coverage gap flag**: kịch bản kỳ cha còn kỳ con chưa có text verbatim trong Figma → verify bằng UX-FLOW-INVENTORY-ACCOUNTING-PERIOD §3 EC-6 hoặc BR-AP-014.

## Design Tokens

### Colors
| Hex | Figma token | Role | Expected Tailwind (garage-web) |
|---|---|---|---|
| `#ffffff` | `base/background` | Dialog card BG | `bg-background` / `bg-white` |
| `#e4e4e7` | `base/border` | Dialog card border | `border` / `border-input` |
| `#18181b` | `base/foreground` | Title text | `text-foreground` |
| `#71717a` | `base/muted-foreground` | Description text | `text-muted-foreground` |
| `#f4f4f5` | `base/secondary` | Secondary button BG ("Hủy" / "Đóng") | `bg-secondary` |
| `#18181b` | `base/secondary-foreground` | Secondary button text | `text-secondary-foreground` |
| `#dc2626` | `base/destructive` | Destructive button BG ("Xoá") | `bg-destructive` |
| `#fef2f2` | `base/destructive-foreground` | Destructive button text | `text-destructive-foreground` |
| `#0000001a` | `overlay/90` | Backdrop overlay | `bg-black/10` (overlay convention shadcn = `bg-black/80` — verify UX component library; Figma = 10% but shadcn default 80%) |

⚠️ Overlay opacity conflict: Figma token `overlay/90` = `#0000001a` (10% alpha) VS shadcn dialog convention `bg-black/80` (80% alpha). agent-test-ui: verify implementation matches Figma token if design-token pipeline propagates variable; else accept shadcn default and log as `oracle_verdict: WRONG_COLOR (backdrop) — Figma variable resolved as 10% opacity`.

### Typography
| Style | Figma binding | Tailwind expected |
|---|---|---|
| Title (Dialog) | `text large/leading-normal/semibold` — Inter · 18px · 600 · lh 28px · ls 0 | `text-lg font-semibold leading-7` |
| Description (Dialog) | `text small/leading-normal/regular` — Inter · 14px · 400 · lh 20px · ls 0 | `text-sm font-normal leading-5` |
| Button label | `text small/leading-normal/medium` — Inter · 14px · 500 · lh 20px · ls 0 | `text-sm font-medium leading-5` |

### Spacing
| Element | Figma token | Value |
|---|---|---|
| Dialog padding | `spacing/6` | 24px all sides |
| Dialog gap (header ↔ footer row) | `spacing/6` | 24px |
| Header inner gap (title ↔ description) | `spacing/1-5` | 6px |
| Button row gap (2 buttons) | `spacing/2` | 8px |
| Button padding-x | `spacing/4` | 16px |
| Button padding-y | `spacing/2` | 8px |

### Sizing
| Element | Figma binding | Value |
|---|---|---|
| Dialog width | fixed | 441px (`max-w-lg` shadcn = 512 → override to 441 hoặc content-hug) |
| Dialog height | HUG (varies by content) | 210px (confirm) · 182px (cannot delete) |
| Button height | `height/h-9` | 36px |
| Button min width | HUG content + px-4 padding | (Hủy ≈ 48px · Xoá ≈ 52px · Đóng ≈ 54px based on 14px medium text) |

### Radius
- Dialog card: `border radius/md` = 6px → Tailwind `rounded-md` (shadcn default matches — token `--radius: 0.625rem` calc-md = 6px effective for cards; `_ref-web-transform-figma.md §1.5` bảng radius).
- Button: `border radius/md` = 6px → `rounded-md`.

### Shadow
- Dialog: `shadow/lg` = `0px 10px 15px -3px #0000001A, 0px 4px 6px -2px #0000000D` → Tailwind `shadow-lg` (matches).
- Button (both variants): `shadow/sm` = `0px 1px 2px 0px #0000000D` → `shadow-sm` / `drop-shadow-sm` (variant applied).

### Border
- Dialog: 1px solid `#e4e4e7` (`base/border`) → `border border-input` / `border` với default theme.
- Buttons: no border (background-only differentiation).

## Screenshots

- `assets/wave04-ap-delete/_full.png` — section overview 3366×1350 (downscaled 2048×850, both screens side by side).
- `assets/wave04-ap-delete/13523-70734.png` — Screen 1 "Xác nhận xóa" full frame 1440×900 (backdrop + dialog visible against AP-LIST navbar+tab context).
- `assets/wave04-ap-delete/13523-70836.png` — Screen 2 "Không thể xóa" full frame 1440×900.
- `assets/wave04-ap-delete/13523-70937.png` — Dialog 2 close-up 465×206 (crisp text).
- Dialog 1 close-up (13523:70835) NOT persisted — rate-limited during fetch. Fallback: verify via parent frame 13523-70734.png (dialog centrally rendered against clean AP-LIST context, text readable) + inline `output_image` captured in fetch session.

## Coverage Notes

- ✅ AC-1 (popup xác nhận xóa): Screen 1 full oracle — text verbatim, tokens, layout.
- ✅ AC-2 (nút "Xoá" thực hiện xóa): Button destructive variant + verbatim label "Xoá".
- ✅ AC-3 (nút "Hủy" đóng popup): Button secondary variant + verbatim label "Hủy".
- ✅ AC-4 (popup "Không thể xóa" khi đã đóng / đã phát sinh dữ liệu kho): Screen 2 full oracle với description verbatim.
- ⚠️ AC-5 (popup "Không thể xóa" khi kỳ cha còn kỳ con): text VARIANT KHÁC AC-4 — Figma CHỈ ship 1 variant text (kịch bản AC-4). agent-test-ui verify wording AC-5 dùng UX-FLOW §3 EC-6 fallback + BR-AP-014.
- ✅ AC-6 (phân quyền cả 2 role): permission-based visibility — verify qua behavior test, không có visual variant riêng.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | main agent (session-1 oracle prefetch) | Khởi tạo oracle wave04 FEAT-AP-DELETE web — 2 dialog (Xác nhận xóa · Không thể xóa) full 5-cấp. 4/5 screenshots persisted (dialog 13523:70835 rate-limited, fallback parent frame + inline capture). Cờ 2 điểm cần verify runtime: (1) verbatim "Xoá" trong dialog confirm dùng dấu sắc trên á — khác FEAT §AC-1 "Xóa" — W-R1 rule: verbatim Figma thắng; (2) AC-5 wording (kỳ con) không có trong Figma — fallback UX-FLOW/BR-AP-014. |
