---
feat: FEAT-CAT-GRP-DELETE
feat_file: Product/features/FEAT-CAT-GRP-DELETE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88840&t=g9GrqfVRsuvDYwl3-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14423:88840"
fetched_at: 2026-06-29T03:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (2 frames + 1 small Dialog node 13501:138001 — section overlays dialog trên template detail screen)
  get_variable_defs: cached (identical token vocab cross wave 03 FEATs)
  get_design_context: success (Dialog node 13501:138001 — canonical delete confirm)
  get_screenshot: success (2 PNG: _full section + dialog isolated 465×206)
data_completeness:
  screen_inventory: complete (1 dialog state; background page = previous DETAIL/LIST screen)
  component_inventory: complete
  variant_state: complete
  text_content: complete (verbatim from design_context)
  design_tokens: complete (variable_defs cached)
  interaction_states: partial (Figma không render :hover/:focus; verify shadcn baseline)
screenshots:
  - assets/wave03-cat-grp-delete/_full.png
  - assets/wave03-cat-grp-delete/13501-138001-dialog.png
---

# Oracle — FEAT-CAT-GRP-DELETE (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14423:88840`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Xác nhận xoá nhóm vật tư hàng hoá"** — confirm
> dialog overlay (441×182) trên background page (typically LIST hoặc DETAIL). Chỉ 1 dialog
> với title + body message + 2 button (Hủy + Xoá destructive).

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Delete confirm dialog (canonical) | 13501:138001 | 441×182 (rendered 465×206 with padding) | assets/wave03-cat-grp-delete/13501-138001-dialog.png |
| Section background (template detail screen, dialog overlays) | 13501:137900 + 13501:138002 | 1440×900 mỗi frame | assets/wave03-cat-grp-delete/_full.png |

> **Section context**: Figma section 14423:88840 chứa 2 frame "FEAT-CAT-GRP-DELETE" mock-up — mỗi frame
> có 1 page template (sample "Phiếu nhập kho" — KHÔNG phải cat-grp content, chỉ là placeholder background)
> + 1 Popup/Dialog Overlay scrim + 1 Dialog popup ở giữa (x=500 y=359 441×182). DEV chỉ implement
> Dialog component; background = previous page route (LIST hoặc DETAIL) tại thời điểm user click "Xóa".
> Template page content KHÔNG phải spec for cat-grp DELETE — bỏ qua.

---

## Component Inventory

### Dialog "Xác nhận xoá" (13501:138001)

- **Dialog box** × 1 (size 441×182, centered viewport)
  - Container: bg white, border 1px `#e4e4e7` (base/border), radius lg (8), shadow lg (drop-shadow `0 4 6 -2 rgba(0,0,0,0.05), 0 10 15 -3 rgba(0,0,0,0.10)`), padding 24 (spacing/6), flex-col gap 24, items-end (button cluster right-aligned)

- **DialogHeader** (full-width, gap 6, text-center column)
  - Title text "Xác nhận" — text large/semibold 18px/28px weight 600 color foreground `#18181b`
  - Description text "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Hệ thống phanh không?" — text small/regular 14px/20px weight 400 color muted-foreground `#71717a`

- **DialogFooter** (full-width, flex row, items-center, justify-center, gap 8 — buttons centered horizontally)
  - Button "Hủy" — Variant=Secondary size=default — h=36, px=16 py=8, bg `#f4f4f5` (base/secondary), text `#18181b` (secondary-foreground), radius md, drop-shadow `0 1 1 rgba(0,0,0,0.05)`
  - Button "Xoá" — Variant=Destructive size=default — h=36, px=16 py=8, bg `#dc2626` (base/destructive), text `#fef2f2` (destructive-foreground — very pale red/white), radius md, drop-shadow `0 1 1 rgba(0,0,0,0.05)`

### Backdrop scrim (Popup/Dialog Overlay × 2 layered)
- Full viewport 1440×900 (covers entire screen behind dialog)
- Bg overlay (verify shadcn Dialog overlay token — typically `bg-black/80` hoặc `bg-background/80 backdrop-blur-sm`)
- Click outside → dismiss (verify per FEAT AC — usually NO dismiss for destructive confirm)

---

## Variant & State

### Dialog box
- Size: 441×182 (rendered) — `max-w-md` or fixed `w-[441px]` per spec
- Position: centered viewport, z-index above page content + above scrim
- Padding 24, gap 24 (between header + footer), items-end (footer right? — actually content shows centered; verify alignment) ← **important**: design_context shows `items-end` for outer box but inner footer is `justify-center` → buttons centered, not right-aligned

### Button "Hủy" (Variant=Secondary)
- Bg `#f4f4f5` (base/secondary) — pale gray
- Text `#18181b` (secondary-foreground) — black
- Border none (no outline — different vs "Huỷ bỏ" Outline trên CREATE/EDIT)
- Drop-shadow `0 1 1 rgba(0,0,0,0.05)`
- :hover bg secondary/80 (verify shadcn baseline)
- :focus ring brand-CD

### Button "Xoá" (Variant=Destructive)
- Bg `#dc2626` (base/destructive) — red
- Text `#fef2f2` (base/destructive-foreground) — near-white pale red
- Border none
- Drop-shadow `0 1 1 rgba(0,0,0,0.05)`
- :hover bg destructive/90 (verify shadcn baseline)
- :focus ring destructive

### Title "Xác nhận"
- Text 18/28 weight 600 (text large/semibold) color foreground
- Center-aligned (text-center within DialogHeader w-full)

### Description body
- Text 14/20 weight 400 (text small/regular) color muted-foreground
- Center-aligned
- Word-break: break-word (handles long group name)

### Scrim
- Full-viewport overlay (cover 1440×900) — actual implementation `fixed inset-0`
- Bg semi-transparent dark (shadcn Dialog default `bg-black/80`)
- Click → typically dismiss; for destructive can be disabled (verify AC)

---

## Text Content (verbatim)

### Dialog
- Title: "Xác nhận"
- Body: "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Hệ thống phanh không?"
  - Note: "Hệ thống phanh" = sample group name placeholder. Implementation = dynamic interpolation `Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa {groupName} không?`
- Button left: "Hủy" (note: "Hủy" KHÔNG có "bỏ" — khác CREATE/EDIT "Huỷ bỏ")
- Button right: "Xoá" (note: dấu "Xoá" với "á" — verify Vietnamese spelling)

### Required wording rules
- "Xác nhận" — title MUST exact (capitalize first letter only)
- Body interpolation pattern MUST include `nhóm vật tư hàng hóa` prefix + name + trailing "không?"
- Buttons MUST be "Hủy" (NOT "Huỷ bỏ") + "Xoá" (NOT "Xóa" — note vowel marker position)

---

## Design Tokens

### Colors
- `#ffffff` (base/background) → Dialog box bg
- `#18181b` (base/foreground, base/secondary-foreground) → Title text, "Hủy" button text
- `#71717a` (base/muted-foreground) → Body description text
- `#e4e4e7` (base/border) → Dialog border 1px
- `#f4f4f5` (base/secondary) → "Hủy" button bg
- `#dc2626` (base/destructive) → "Xoá" button bg
- `#fef2f2` (base/destructive-foreground) → "Xoá" button text (very pale)
- Scrim overlay: assume `bg-black/80` shadcn Dialog default (NOT explicit trong design_context)

### Typography (Inter font-sans)
- `text large/leading-normal/semibold` 18/28 weight 600 → Title "Xác nhận"
- `text small/leading-normal/regular` 14/20 weight 400 → Body description
- `text small/leading-normal/medium` 14/20 weight 500 → Button text "Hủy" + "Xoá"

### Spacing
- Dialog padding 24 (spacing/6)
- Dialog gap (header → footer) 24 (spacing/6)
- DialogHeader gap (title → description) 6 (spacing/1-5)
- DialogFooter gap (button → button) 8 (spacing/2)
- Button padding y=8 (spacing/2) x=16 (spacing/4) — size=default
- Button gap (text only, no icon) 8 (spacing/2)

### Border radius
- `border-radius/lg` = 8 → Dialog box
- `border-radius/md` = 6 → Button (Hủy + Xoá)

### Shadow
- `shadow/lg` → Dialog box: `0 4 6 -2 rgba(0,0,0,0.05); 0 10 15 -3 rgba(0,0,0,0.10)` (or shadcn equivalent)
- `shadow/sm` → Buttons: `0 1 1 rgba(0,0,0,0.05)` (light raise)

### Sizes
- Dialog: 441×182 fixed (or `max-w-md` Tailwind ≈ 448px)
- Button: h=36 (height/h-9) — size=default
- No icons trong dialog (text-only buttons)

### Effects
- Dialog backdrop blur: typical shadcn Dialog overlay `data-[state=open]:fade-in` animation
- Dialog enter animation: `data-[state=open]:zoom-in-95 fade-in-0` (shadcn default — verify implementation)

---

## Notes (oracle interpretation, không phải fact để verify)

- Dialog component MUST use shadcn `<Dialog>` (Component descriptions confirm: `## Dialog Node ID: 11850:104091 — https://ui.shadcn.com/docs/components/dialog`).
- "Hủy" button uses Variant=Secondary (NOT Variant=Outline as on CREATE/EDIT "Huỷ bỏ") — different visual: gray solid bg vs white-with-border. DEV must distinguish per component descriptions: `## Variant=Secondary State=Default Size=default Node ID: 10613:123326`.
- "Xoá" button uses Variant=Destructive (red solid) — confirmed via component descriptions: `## Variant=Destructive State=Default Size=default Node ID: 10613:123383`.
- Background page underneath dialog = previous route at time user clicks "Xóa" (typically LIST row trash icon OR DETAIL action). Figma section template shows "Phiếu nhập kho" sample page — IGNORE, KHÔNG phải spec for cat-grp DELETE background.
- Body text Vietnamese spelling rules:
  - "Hủy" (cancel button) — 1 syllable, ngắn
  - "Xoá" — note specific vowel marker (verify with Vietnamese typography — both "Xóa" and "Xoá" appear in Garage codebase; Figma chooses "Xoá"). agent-test-ui verify EXACT text.
  - "Huỷ bỏ" (CREATE/EDIT) ≠ "Hủy" (DELETE dialog) — different button labels per context.
- Dynamic group name interpolation: implementation MUST replace `Hệ thống phanh` placeholder với actual group name being deleted. Test data với `Hệ thống phanh` confirms template; verify other names render correctly.
- Click outside / Esc behavior: shadcn Dialog default DOES dismiss on outside-click + Esc. For destructive confirm, may want to disable outside-click via `onPointerDownOutside={e => e.preventDefault()}` — verify per FEAT AC.
- Focus trap: shadcn Dialog auto-focuses first focusable element; for destructive confirm should focus "Hủy" by default (safer) — verify implementation.
- No explicit error state (validation N/A for destructive confirm). Loading state during async delete = optional shadcn pattern (disable both buttons + spinner trong "Xoá").
