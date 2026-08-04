---
feat: FEAT-OB-DELETE-LINES
feat_file: Product/features/FEAT-OB-DELETE-LINES.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89264&t=W7XJPVvhmdBPtv2c-4
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89264"
fetched_at: 2026-07-08T03:26:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success
  get_screenshot: success (5 PNGs — 1 full section + 2 frames + 2 dialogs)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (Figma cung cấp default state only — hover/focus/disabled states của Button/Overlay Close chưa có variant riêng; suy từ shadcn baseline `_ref-web-transform-figma.md §1.5`)
  text_content: partial (dialog "Không thể xóa" body verbatim Figma dùng wording CŨ "…hoặc đã phát sinh phiếu xuất kho…" — LỆCH với FEAT-OB-DELETE-LINES v7 AC-4 wording MỚI "…hoặc việc xóa làm tồn kho xuống âm…". Xem §Text Content note verify-vs-AC. Body content 2 page frames sau overlay là placeholder template phiếu nhập kho — hidden trong metadata, KHÔNG in-scope test)
  design_tokens: complete
  interaction_states: partial (state states Button/Overlay Close suy từ shadcn baseline, không có variant riêng trong Figma frame này)
screenshots:
  - assets/wave04-ob-delete-lines/_full.png
  - assets/wave04-ob-delete-lines/13575-94897.png
  - assets/wave04-ob-delete-lines/13575-95000.png
  - assets/wave04-ob-delete-lines/13575-94999.png
  - assets/wave04-ob-delete-lines/13575-95102.png
---

# Oracle — FEAT-OB-DELETE-LINES (web)

> Confirmation dialog cho luồng xóa nhiều dòng tồn đầu kỳ đã chọn. Section chứa 2 screen state đại diện 2
> outcome guardrail: (a) tất cả dòng hợp lệ → dialog `"Xác nhận"` (2 button) · (b) có ≥1 dòng vi phạm →
> dialog `"Không thể xóa"` (1 button). Nền phía sau (page frame) là **placeholder template phiếu nhập kho
> — hidden layer, KHÔNG in-scope test**; oracle chỉ verify Overlay + Dialog trên cùng.

## Screen Inventory

| Screen state | nodeId | Size | Dialog nodeId | Dialog size | Screenshot |
|---|---|---|---|---|---|
| Xác nhận xóa (all-valid) | `13575:94897` | 1440×900 | `13575:94999` | 441×182 (canvas 465×206 render) | `assets/wave04-ob-delete-lines/13575-94897.png` (frame) + `assets/wave04-ob-delete-lines/13575-94999.png` (dialog crop) |
| Không thể xóa (blocked, ≥1 vi phạm) | `13575:95000` | 1440×900 | `13575:95102` | 441×182 (canvas 465×206 render) | `assets/wave04-ob-delete-lines/13575-95000.png` (frame) + `assets/wave04-ob-delete-lines/13575-95102.png` (dialog crop) |

> Frame `Navbar`, `Page content` (chứa `Page container` → phiếu nhập kho placeholder) đều `hidden=true`
> trong Figma metadata → visible layers = `Popup/Dialog Overlay` (semi-transparent) + `Dialog` (441×182,
> căn giữa canvas tại x=500, y=359).

## Component Inventory

### Screen: Xác nhận xóa (`13575:94897`)

- Overlay × 2 (`Popup/Dialog Overlay`, 1440×900 semi-transparent black) — nested overlay pattern shadcn Dialog (backdrop + optional close-hitbox)
- Dialog × 1 (`shadcn/Dialog`, 441×182, centered) — chứa DialogHeader (title + description) + DialogFooter (buttons)
- Button × 2 — `Hủy` (variant=secondary, size=default) · `Xoá` (variant=destructive, size=default)

### Screen: Không thể xóa (`13575:95000`)

- Overlay × 2 (`Popup/Dialog Overlay`) — giống Screen 1
- Dialog × 1 (`shadcn/Dialog`, 441×182, centered) — chứa DialogHeader + DialogFooter
- Button × 1 — `Đóng` (variant=secondary, size=default)

> Component doc pointer (từ Figma component descriptions):
> - Dialog → https://ui.shadcn.com/docs/components/dialog
> - Button secondary → https://ui.shadcn.com/docs/components/button#secondary
> - Button destructive (chỉ screen 1) → https://ui.shadcn.com/docs/components/button#destructive

## Variant & State

### Dialog (`13575:94999`, `13575:95102`)

- Variants observed: **default open** (both screens). Modal size = 441×182 (shadcn `max-w-lg` = 512 baseline, HUG content).
- States observed: **open (default)**. Close (× icon top-right) KHÔNG có trong 2 dialog này — cả 2 buộc user chọn button (design intent: `Hủy` / `Đóng` = escape). Verify: KHÔNG có × icon → conformance TC assert absent.
- Overlay states observed: **visible** (backdrop semi-transparent). Overlay token `overlay/90 = #0000001a` (10% opacity black).

### Button "Hủy" / "Đóng" (`I13575:94999;17142:42651`, `I13575:95102;17142:42651`)

- Variants: `secondary` (bg-secondary `#f4f4f5` · text-secondary-foreground `#18181b`)
- States observed: **default**. Hover/focus/disabled/pressed **KHÔNG có variant trong Figma** — DEV suy theo shadcn baseline (`_ref-web-transform-figma.md §1.5`):
  - hover: `bg-secondary/80` (opacity 80%)
  - focus-visible: `ring-2 ring-ring/50` (offset 2)
  - disabled: `opacity-50 cursor-not-allowed`

### Button "Xoá" (`I13575:94999;17142:42652`) — only Screen 1

- Variants: `destructive` (bg-destructive `#dc2626` · text-destructive-foreground `#fef2f2`)
- States observed: **default**. Suy states shadcn baseline:
  - hover: `bg-destructive/90`
  - focus-visible: `ring-2 ring-destructive/50`
  - disabled: `opacity-50 cursor-not-allowed`
  - loading (nếu DELETE mutation pending): spinner + button disabled (không có variant Figma; suy từ pattern app)

## Text Content

> Verbatim label từ Figma design context — copy đúng từng ký tự, dấu, khoảng trắng, dấu chấm câu.

### Screen: Xác nhận xóa (`13575:94999`)

Dialog (`13575:94999` — `_DialogHeader` + footer):
- Title: `"Xác nhận"` (H3, 18px semibold, `#18181b`, text-center, w-full)
- Description: `"Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?"` (14px regular, `#71717a`, text-center, w-full)
- Button 1: `"Hủy"` (14px medium, `#18181b`)
- Button 2: `"Xoá"` (14px medium, `#fef2f2`)

> ⚠ Verify-vs-AC-1 conform: title + body + button labels match FEAT v7 AC-1 verbatim
> (`"Xác nhận"` · `"Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?"` · `"Xóa"` · `"Hủy"`).
> Chú ý: Figma render `"Xoá"` (á cuối), FEAT AC ghi `"Xóa"` (ó giữa). Hai dạng chính tả VN đều hợp lệ
> — với oracle verify: **assert theo FEAT AC-1 (`"Xóa"`)** vì FEAT là Business Authority; note diff visual
> chỉ để agent-test-ui nhận diện.

### Screen: Không thể xóa (`13575:95102`)

Dialog (`13575:95102` — `_DialogHeader` + footer):
- Title: `"Không thể xóa"` (H3, 18px semibold, `#18181b`, text-center, w-full)
- Description (Figma verbatim): `"Một số dòng tồn đầu kỳ thuộc kỳ đã khóa hoặc đã phát sinh phiếu xuất kho nên không được xóa"` (14px regular, `#71717a`, text-center, w-full)
- Button 1: `"Đóng"` (14px medium, `#18181b`)

> ⚠ **DIVERGENCE — Figma stale vs FEAT v7 AC-4**: Figma description dùng wording **CŨ**
> `"…hoặc đã phát sinh phiếu xuất kho…"`. FEAT-OB-DELETE-LINES **v7 AC-4** (last_reviewed 2026-07-07)
> wording **MỚI**:
> `"Một số dòng tồn đầu kỳ thuộc kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm, nên không được xóa."`
> Root cause: FEAT v2 change log 2026-06-15 sửa AC-4 để khớp BR-OB-DEL-003 (không chặn theo "có phiếu
> xuất" nữa; chỉ chặn khi làm tồn âm) — Figma chưa cập nhật.
> **Rule cho agent-test-ui**: **assert theo FEAT AC-4** (Business Authority thắng); log divergence
> `verdict=WRONG_TEXT severity=P1` **NHƯNG** target = Figma (không phải impl); flag stale-Figma cho design team.
> Impl WEB phải verbatim FEAT AC-4 mới đúng.

## Design Tokens

### Screen shared (cả 2 dialog dùng chung token set)

**Colors** (từ `get_variable_defs` — Figma variables):

| Token Figma | Hex | Role | Expected Tailwind (garage-web `_ref-web-transform-figma.md §1.5`) |
|---|---|---|---|
| `overlay/90` | `#0000001a` | Backdrop overlay | `bg-black/10` (tương đương 10% opacity); shadcn DialogOverlay dùng `bg-black/50` mặc định — **verify assert overlay opacity 10%** |
| `base/background` | `#ffffff` | Dialog panel BG | `bg-background` |
| `base/border` | `#e4e4e7` | Dialog panel border | `border-border` |
| `base/foreground` | `#18181b` | Title text | `text-foreground` |
| `base/muted-foreground` | `#71717a` | Description text | `text-muted-foreground` |
| `base/secondary` | `#f4f4f5` | Button `Hủy`/`Đóng` BG | `bg-secondary` |
| `base/secondary-foreground` | `#18181b` | Button `Hủy`/`Đóng` text | `text-secondary-foreground` |
| `base/destructive` | `#dc2626` | Button `Xoá` BG | `bg-destructive` |
| `base/destructive-foreground` | `#fef2f2` | Button `Xoá` text | `text-destructive-foreground` |
| `tailwind colors/neutral/600` | `#525252` | (available in token set — chưa dùng trong 2 dialog này) | `text-neutral-600` |

**Typography** (từ `styles contained in design` block — authoritative per G3 rule):

| Token Figma | Font-family | Size | Weight | Line-height | Letter-spacing | Áp cho |
|---|---|---|---|---|---|---|
| `text large/leading-normal/semibold` | Inter | 18px (`typography/base sizes/large/font-size`) | 600 (`font/weight/semibold`) | 28px (`typography/base sizes/large/line-height`) | 0 | Dialog title (`"Xác nhận"`, `"Không thể xóa"`) → expected `text-lg font-semibold` |
| `text small/leading-normal/regular` | Inter | 14px (`typography/base sizes/small/font-size`) | 400 (`font/weight/normal`) | 20px (`typography/base sizes/small/line-height`) | 0 | Dialog description → expected `text-sm font-normal` |
| `text small/leading-normal/medium` | Inter | 14px | 500 (`font/weight/medium`) | 20px | 0 | Button labels (`Hủy`, `Xoá`, `Đóng`) → expected `text-sm font-medium` |

**Spacing** (từ `get_variable_defs`):

| Token | Value | Áp cho |
|---|---|---|
| `spacing/1-5` | 6px | Gap giữa title ↔ description trong `_DialogHeader` (flex-col) |
| `spacing/2` | 8px | Button footer gap (buttons ngang cạnh nhau) · padding-y button (py-2) |
| `spacing/4` | 16px | Button padding-x (px-4) |
| `spacing/6` | 24px | Dialog panel padding (p-6, tất cả 4 cạnh) · Dialog gap giữa header ↔ footer (gap-6) |

**Sizing**:

| Token | Value | Áp cho |
|---|---|---|
| `height/h-9` | 36px | Button height (`h-9`) |
| `max-width/max-w-lg` | 512px | shadcn Dialog max-width baseline (dialog actual 441px < 512 — HUG content trong bound) |

**Radius**:

| Token | Value | Áp cho | Expected Tailwind |
|---|---|---|---|
| `border radius/md` | 6px | Button radius (rounded-md) · Dialog panel (shadcn default `rounded-lg`=10px — verify per implementation, Figma render dialog radius **cần Read PNG confirm**) | `rounded-md` (button); dialog panel `rounded-lg` (shadcn default, KHÔNG có variable Figma explicit — suy) |

**Shadows**:

| Token | Effect | Áp cho | Expected Tailwind |
|---|---|---|---|
| `shadow/sm` | drop-shadow `0 1px 2px #0000000d` (color #000 5% opacity) | Button (per button `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]` in code) | `shadow-sm` (approx) |
| `shadow/lg` | 2-layer: `0 4px 6px -2px #0000000d` + `0 10px 15px -3px #0000001a` | Dialog panel (`drop-shadow-[0px_10px_7.5px_rgba(0,0,0,0.1),0px_4px_3px_rgba(0,0,0,0.05)]`) | `shadow-lg` |

**Borders**:

| Áp cho | Width | Style | Color | Radius |
|---|---|---|---|---|
| Dialog panel | 1px | solid | `#e4e4e7` (`base/border`) | (rounded-lg suy) |
| Button (secondary/destructive) | 0 (no border) | — | — | 6px (rounded-md) |

### Dialog panel layout (both screens)

| Property | Value |
|---|---|
| Position | Centered, `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` (shadcn Dialog default) — canvas position x=500 y=359 (screen 1440×900) |
| Width | 441px (`w-[441px]` fixed — HUG content within max-w-lg) |
| Height | 182px (HUG content) |
| Padding | 24px all 4 sides (`p-6`) |
| Direction | flex-col |
| Gap | 24px (between DialogHeader ↔ DialogFooter) |
| Items | `items-end` (footer right-align) — nhưng footer inner `w-full justify-center` → button row centered |

### DialogHeader (`_DialogHeader` — I13575:94999;112:579 / I13575:95102;112:579)

| Property | Value |
|---|---|
| Direction | flex-col |
| Gap | 6px (title ↔ description) |
| Items | `items-start` (nhưng inner text `text-center w-full` → text visually centered) |
| Text-align | center (both title + description) |

### DialogFooter (button row)

| Property | Screen 1 (Xác nhận) | Screen 2 (Không thể xóa) |
|---|---|---|
| Direction | flex horizontal | flex horizontal |
| Gap | 8px | — (1 button) |
| Items | center · justify-center · w-full | center · justify-center · w-full |
| Button count | 2 (Hủy left, Xoá right) | 1 (Đóng, centered) |
| Button size | h-9 (36px) · px-4 · py-2 · rounded-md | same |

### Overlay

| Property | Value |
|---|---|
| Size | 1440×900 (full viewport in Figma canvas) |
| BG | `#0000001a` (`overlay/90` token = ~10% opacity black) |
| Position | fixed inset-0 |
| Behavior verify | click overlay → **verify per AC**: FEAT AC-3 (Hủy) chỉ tag button "Hủy"; AC không nói click overlay = hủy. Assert per shadcn default (click backdrop dismiss) hoặc theo impl decision — **flag for verify-vs-AC** clarify. |

### Interaction / Behavior (suy từ shadcn baseline — Figma không render riêng)

| Element | State | Expected behavior |
|---|---|---|
| Dialog | mount/unmount | shadcn Dialog default: fade + zoom (`data-state=open` `animate-in`) |
| Button "Hủy" | click | close dialog, no API call (AC-3) |
| Button "Xoá" | click | fire DELETE mutation `DeleteOpeningBalanceLines` (AC-2), disabled state during pending suy |
| Button "Đóng" | click | close dialog (AC-4 no delete performed) |
| Esc key | keydown | close dialog (shadcn default) — verify per AC nếu impl override |
| Focus trap | on open | shadcn Dialog default — first focusable = "Hủy" hoặc close btn. Không có close btn Figma → focus "Hủy" (screen 1) / "Đóng" (screen 2) |

## Screenshots

| # | Node | Type | Path | Notes |
|---|---|---|---|---|
| 1 | `14492:89264` | Section full | `assets/wave04-ob-delete-lines/_full.png` | Overview 4248×1914 → downscaled 2048×944 (2× shrink) — dùng để so bố cục 2 screen state; **KHÔNG** dùng làm nguồn text/color verify (downscale). |
| 2 | `13575:94897` | Frame Screen 1 | `assets/wave04-ob-delete-lines/13575-94897.png` | 1440×900 no-downscale — full frame với overlay + dialog "Xác nhận" centered. |
| 3 | `13575:95000` | Frame Screen 2 | `assets/wave04-ob-delete-lines/13575-95000.png` | 1440×900 no-downscale — full frame với overlay + dialog "Không thể xóa" centered. |
| 4 | `13575:94999` | Dialog only Screen 1 | `assets/wave04-ob-delete-lines/13575-94999.png` | 465×206 no-downscale — dialog "Xác nhận" crop (pixel-perfect verify title + buttons). |
| 5 | `13575:95102` | Dialog only Screen 2 | `assets/wave04-ob-delete-lines/13575-95102.png` | 465×206 no-downscale — dialog "Không thể xóa" crop (pixel-perfect verify title + button + wording divergence). |

## Verify Notes cho agent-test-ui

1. **Text divergence "Không thể xóa"** (P1 — assert theo FEAT AC-4, KHÔNG theo Figma). Log verdict `WRONG_TEXT` với target = Figma spec; flag design team refresh Figma.
2. **Chính tả "Xoá" vs "Xóa"** (P3 note). FEAT-authoritative: `"Xóa"`. Impl verbatim FEAT.
3. **Overlay opacity 10%** vs shadcn default 50% — verify implementation match Figma (`overlay/90 = #0000001a`) hoặc theo impl decision. Flag clarify nếu diff.
4. **Close × icon absent** — cả 2 dialog KHÔNG có × close btn. Assert absent trong impl (design intent: buộc chọn button).
5. **Background page frames hidden** — placeholder phiếu nhập kho KHÔNG in-scope. Assert overlay backdrop độc lập với route parent (dialog open trên route `/opening-balance/list` sau khi chọn ≥1 dòng).
6. **Guardrail order** (FEAT AC-4, BR-OB-DEL-005): kỳ đóng `ERR-INV-024` trước → tồn âm `ERR-INV-036` sau. Verify BE response order khi test integration; UI chỉ hiển thị 1 popup chung "Không thể xóa" — không phân biệt hex ERR code trong body (per AC-4 wording).
