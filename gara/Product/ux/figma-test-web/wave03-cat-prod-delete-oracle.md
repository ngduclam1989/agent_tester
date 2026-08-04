---
feat: FEAT-CAT-PROD-DELETE
feat_file: Product/features/FEAT-CAT-PROD-DELETE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14322-176694&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14322:176694"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (2 top-level frames + 2 dialog overlays — page chrome behind dialog is `hidden=true`, only dialog renders)
  get_variable_defs: cached (tokens identical with wave03-cat-prod-create-oracle.md cache — same file_key)
  get_design_context: skipped (PNG dialog content is unambiguous; no form data to extract)
  get_screenshot: success (3 PNG: _full + 2 dialog frames)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (dialog atomic — 2 button + 2 text)
  variant_state: complete (2 dialog variants captured)
  text_content: complete (verbatim from PNG)
  design_tokens: complete (cached)
  interaction_states: partial (Figma không render :hover/:focus — verify shadcn baseline)
screenshots:
  - assets/wave03-cat-prod-delete/_full.png
  - assets/wave03-cat-prod-delete/14329-254641-dialog-confirm.png
  - assets/wave03-cat-prod-delete/14329-254743-dialog-blocked.png
---

# Oracle — FEAT-CAT-PROD-DELETE (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14322:176694`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Tính năng **Xoá sản phẩm catalog** — 2 dialog overlay state:
> (A) confirm xoá (cho phép xoá), (B) chặn xoá (sản phẩm đã phát sinh giao dịch).
> Trang nền (Danh sách / Chi tiết sản phẩm) ẨN bằng `hidden=true` trong Figma — chỉ dialog render.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Dialog confirm xoá (cho phép, có nút Xoá destructive) | 14329:254641 | 441×182 | assets/wave03-cat-prod-delete/14329-254641-dialog-confirm.png |
| Dialog chặn xoá (không cho xoá, chỉ có nút Đóng) | 14329:254743 | 441×182 | assets/wave03-cat-prod-delete/14329-254743-dialog-blocked.png |

> **Note**: 2 dialog đặt trên cùng overlay scrim 1440×900 (`Popup/Dialog Overlay` instance). Page content bên dưới được Figma đánh dấu `hidden=true` (không liên quan đến delete flow — chỉ là background placeholder).

---

## Component Inventory

### Screen: Dialog confirm xoá (14329:254641)

- Overlay scrim × 1 (`Popup/Dialog Overlay` — full viewport 1440×900, bg overlay/90 = `#0000001A`)
- Dialog box × 1 (centered, w=441 h=182, bg white, radius lg, shadow lg)
  - DialogHeader text × 1: "Xác nhận" (text large/semibold, center-aligned)
  - DialogBody text × 1: "Bạn có chắc chắn muốn xoá mã sản phẩm IP-BP-0001 không?" (text small/regular, center-aligned, 2 dòng)
  - DialogFooter Row × 1 (horizontal, center, gap ~12px)
    - Button "Huỷ" (secondary outline, bg white, border input)
    - Button "Xoá" (destructive, bg red `#dc2626`, text white)

### Screen: Dialog chặn xoá (14329:254743)

- Overlay scrim × 1 (giống screen A)
- Dialog box × 1 (centered, w=441 h=182, bg white, radius lg, shadow lg)
  - DialogHeader text × 1: "Không thể xoá" (text large/semibold, center-aligned)
  - DialogBody text × 1: "Mã sản phẩm IP-BP-0001đã phát sinh dữ liệu sử dụng nên không được xoá." (text small/regular, center-aligned, 2 dòng)
  - DialogFooter Row × 1 (horizontal, center)
    - Button "Đóng" (secondary outline, bg white, border input — duy nhất, KHÔNG có button destructive)

---

## Variant & State

### Dialog box (shared shell)
- Bounds: w=441 h=182 (fixed)
- Layout: vertical stack (title → body → footer), padding ~24px (spacing/6), gap ~16px
- BG: white · Radius: lg (8px) · Shadow: lg
- Position: center viewport (x=499.5 y=359 cho screen A; x=500 y=359 cho screen B)

### Button "Xoá" (destructive — chỉ trên dialog A)
- variant: destructive · size: default (h-9 ≈ 36px)
- Default bg `#dc2626` (token `bg-destructive`) text white border-radius md
- :hover bg darker red (verify shadcn baseline) · :disabled opacity 50%

### Button "Huỷ" / "Đóng" (secondary outline)
- variant: outline · size: default
- Default bg white text foreground border 1px `#d4d4d8` (`border-input`) radius md
- :hover bg `bg-accent` (`#f4f4f5`) · :focus ring 2px

### Overlay scrim
- bg `#0000001A` (overlay/90 token) · full viewport · z-index trên page content
- Click outside dismiss = NOT determined from Figma (verify product behavior)

---

## Text Content (verbatim)

### Screen A — Dialog confirm xoá (14329:254641)
- Header: "Xác nhận"
- Body: "Bạn có chắc chắn muốn xoá mã sản phẩm IP-BP-0001 không?"
- Buttons: "Huỷ" · "Xoá"

### Screen B — Dialog chặn xoá (14329:254743)
- Header: "Không thể xoá"
- Body: "Mã sản phẩm IP-BP-0001đã phát sinh dữ liệu sử dụng nên không được xoá."  
  ⚠️ **Note typo Figma**: "IP-BP-0001đã" (thiếu space giữa mã sản phẩm và "đã") — verify wording chuẩn với FEAT AC + business; DEV implementation phải có space. Oracle ghi verbatim từ PNG nhưng cờ TEXT_TYPO.
- Button: "Đóng"

### Sample placeholders
- Mã sản phẩm sample: `IP-BP-0001` — chỉ là mock data, runtime sẽ inject mã sản phẩm thực tế từ context (verify pattern `{Bạn có chắc chắn muốn xoá mã sản phẩm {productCode} không?}`).

---

## Design Tokens

> **Tokens identical với `wave03-cat-prod-create-oracle.md` cache** (cùng file_key `EMGjGsnAJzGoGwTSK7dTuZ` = GMS-v.3). Repeat ở đây những token THỰC TẾ dùng trong 2 dialog này:

### Colors
- `#ffffff` (base/background) → `bg-white` (dialog bg)
- `#18181b` (base/foreground) → `text-foreground` (title + body text)
- `#dc2626` (base/foreground-error / destructive) → `bg-destructive` (button Xoá) / `text-destructive-foreground` (white text on red)
- `#ffffff` (button text destructive)
- `#d4d4d8` (base/input) → `border-input` (Huỷ / Đóng button border)
- `#0000001A` (overlay/90) → `bg-black/10` (scrim)

### Typography (Inter)
- Header: `text-large/semibold` → `text-lg font-semibold` (16-18px) · color `text-foreground`
- Body: `text-small/regular` → `text-sm` (14px) · color `text-foreground` · center-aligned
- Button text: `text-small/medium` → `text-sm font-medium`

### Spacing
- Dialog padding: `spacing/6` = 24px (verify)
- Vertical gap title→body→footer: `spacing/4` = 16px (verify)
- Button gap footer: `spacing/3` = 12px (verify)
- Button padding y=8 x=16 (size default)

### Border radius / Shadow
- Dialog box: `radius/lg` = 8 · shadow `shadow-lg`
- Button: `radius/md` = 6

### Sizes
- Dialog: 441×182 fixed
- Button height: ~36px (h-9 default size)

---

## Notes (oracle interpretation, không phải fact để verify)

- 2 dialog đại diện **2 BUSINESS STATE riêng biệt** chứ không phải 2 visual variant:
  - Screen A = sản phẩm CHƯA phát sinh giao dịch → confirm + cho phép xoá (Xoá destructive)
  - Screen B = sản phẩm ĐÃ phát sinh giao dịch → chặn + chỉ có Đóng
- DEV implement phải distinguish 2 state dựa trên backend response (có thể là field `canDelete: boolean` + `blockedReason` string). Verify với FEAT AC + Business Rule (BR-CAT-PROD-DELETE).
- Mã sản phẩm `IP-BP-0001` chỉ là mock placeholder — runtime inject từ row được chọn trong DataTable.
- Typo "IP-BP-0001đã" trong screen B = lỗi Figma; DEV viết đúng có space. Verify final wording với BA/PO.
- Interaction states (`:hover`, `:focus`, `:active`) Figma không render → theo shadcn/ui Button baseline (destructive variant: hover darker, focus ring 2px destructive).
- Trigger dialog: từ trash icon ở row List, hoặc menu action trên Detail. Verify trigger path với UX-FLOW + FEAT AC.
- Click outside scrim dismiss: KHÔNG xác định từ Figma → verify product behavior với BA (thông thường confirm dialog disable click-outside, blocked dialog allow).
- KHÔNG có dialog "Đang xoá..." loading state trong Figma → DEV theo baseline (button loading spinner inline trên "Xoá" khi submit).
