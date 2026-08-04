---
feat: FEAT-AP-DELETE
feat_file: Product/features/FEAT-AP-DELETE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89258
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89258"
fetched_at: "2026-07-08T03:36Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: ACTIVE
coverage_gaps:
  - "AC-5 kỳ-cha-còn-kỳ-con block variant CHƯA có riêng trong Figma. FEAT AC-5 yêu cầu popup 'Không thể xóa' với 'thông báo phải xóa hết kỳ con trước khi xóa kỳ cha' — Figma chỉ có 1 blocked variant (AC-4 wording). Implementation MUST render 2 variants blocked (AC-4 + AC-5) với body khác nhau; Figma designer cần bổ sung frame AC-5. Đề xuất body AC-5: 'Kỳ kế toán còn kỳ con. Vui lòng xóa các kỳ con trước khi xóa kỳ cha.' (draft — BA confirm)."
  - "AC-3 mention 'icon đóng ✕' như tùy chọn Hủy — Figma dialog KHÔNG có × close icon top-right (shadcn AlertDialog default omit). Implementation: nút Hủy đủ cho AC-3; không cần × icon. Nếu BA muốn thêm × phải update Figma + FEAT (currently ambiguous)."
  - "Section frame 13523:70734 + 13523:70836 chứa stale 'Phiếu nhập kho' template background (hidden=true). Chỉ dialog overlay là canonical. Spec emit dialog + navbar visible + backdrop only."
---

# FEAT-AP-DELETE — Spec (web)

> 2 modal confirmation dialog cho luồng xóa kỳ kế toán (Accounting Period) từ `FEAT-AP-LIST` (row action icon Xóa 🗑). (1) Confirm delete với hint guardrail; (2) Blocked "Không thể xóa" khi kỳ đã đóng / đã phát sinh dữ liệu kho / (theo AC-5) còn kỳ con.
>
> **Icon library**: `iconsax-reactjs` primary (garage-web convention v7.6). Dialog body KHÔNG có icon glyph.

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| (no icons in dialogs) | — | — | — | — | 2 PNG dialog chỉ có title + body + button, no icon glyph |

---

## Screen: Confirm delete (13523:70734)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Confirm state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `dialogVariant: confirm` → Title-as-question + hint body + 2 buttons.

### §2 Design Token Map

> See file-level **§2 Design Token Map** below.

### §3 State Table

> See file-level **§3 State Table** below (state = `confirm`).

### §4 Component Prop Map

> See file-level **§4 Component Prop Map** below.

### §5 Field Composition Schema

> See file-level **§5 Field Composition Schema** below.

### §6 Layout Width Table

> See file-level **§6 Layout Width Table** below.

### §7 Visual Hierarchy Map

> See file-level **§7 Visual Hierarchy Map** below.

### §8 Anti-Pattern Trap

> See file-level **§8 Anti-Pattern Trap** below.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ap-delete/13523-70734.png
verified_at: "2026-07-08T03:37Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Dialog card white bg centered on grey overlay, ~441×210 per Dialog node metadata (taller than OB-DELETE-LINES 182 due to hint text row)"
    status: ✓
    evidence: "13523-70734.png dialog card centered position (500, 345) size 441×210 per metadata; hint text pushes card 28px taller than confirm-only dialogs"
  - claim: "Title-as-question verbatim 'Bạn có chắc chắn muốn xóa kỳ kế toán Tháng 2/2027 không?' wraps to 2 lines centered semibold — KHÔNG có separate 'Xóa Kỳ kế toán' title header"
    status: ✓
    evidence: "13523-70734.png L380-410 verbatim title-as-question 2-line wrap. FEAT AC-1 popup name 'Xóa Kỳ kế toán' = identifier only, KHÔNG là literal title text"
  - claim: "Title interpolates period name '{period.displayName}' (e.g. 'Tháng 2/2027')"
    status: ✓
    evidence: "13523-70734.png shows literal 'Tháng 2/2027' — production will interpolate from row.displayName field per FEAT AC-1 '[tên kỳ]' placeholder"
  - claim: "Hint body verbatim 'Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan.' 2-line wrap centered muted"
    status: ✓
    evidence: "13523-70734.png L440-465 verbatim hint text 2-line wrap — matches FEAT AC-1 verbatim explicit"
  - claim: "2 button group centered — Hủy secondary LEFT + Xoá destructive RIGHT (dấu huyền 'á')"
    status: ✓
    evidence: "13523-70734.png L505-525 [Hủy grey] [Xoá red] side-by-side. Xoá button label verbatim 'Xoá' (dấu huyền)"
  - claim: "Navbar top row visible (page background not blacked out) — dialog overlay is LIGHT (#0000001a ≈ 10% opacity), not the shadcn Dialog default 80% dim"
    status: ✓
    evidence: "13523-70734.png top rows show blue navbar + active tab 'Danh mục' clearly visible; grey backdrop tint minimal (overlay/90 = #0000001a not #000000e6)"
```

---

## Screen: Blocked "Không thể xóa" (13523:70836)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Blocked state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `dialogVariant: blocked` → Title "Không thể xóa" + guardrail message + 1 button "Đóng".

### §2 Design Token Map

> See file-level **§2 Design Token Map** below.

### §3 State Table

> See file-level **§3 State Table** below (state = `blocked_closed_or_data` — Figma-covered).

### §4 Component Prop Map

> See file-level **§4 Component Prop Map** below.

### §5 Field Composition Schema

> See file-level **§5 Field Composition Schema** below.

### §6 Layout Width Table

> See file-level **§6 Layout Width Table** below.

### §7 Visual Hierarchy Map

> See file-level **§7 Visual Hierarchy Map** below.

### §8 Anti-Pattern Trap

> See file-level **§8 Anti-Pattern Trap** below.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ap-delete/13523-70836.png
verified_at: "2026-07-08T03:37Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Dialog card 441×182 white bg, shorter than Screen 1 confirm (no hint text row)"
    status: ✓
    evidence: "13523-70836.png dialog same width but shorter — matches Dialog instance metadata 441×182 at (500, 359)"
  - claim: "Title verbatim 'Không thể xóa' centered semibold ('xóa' dấu sắc)"
    status: ✓
    evidence: "13523-70836.png L390 'Không thể xóa' — bold black centered"
  - claim: "Body verbatim 'Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa.' matches FEAT AC-4 exactly"
    status: ✓
    evidence: "13523-70836.png L425-450 verbatim body 2-line wrap — 1:1 với FEAT AC-4 wording (không giống OB-DELETE-LINES Screen 2 which has stale wording)"
  - claim: "1 button 'Đóng' secondary variant centered — NO destructive"
    status: ✓
    evidence: "13523-70836.png L490 single 'Đóng' grey button centered below body"
  - claim: "AC-5 kỳ-cha-còn-kỳ-con block variant KHÔNG có riêng trong Figma — coverage_gap flagged"
    status: ⚠
    evidence: "Figma chỉ có 1 blocked variant (AC-4 wording); AC-5 requires separate popup wording — designer cần bổ sung. Implementation phải render 2 blocked variants."
```

---

# File-level shared sections

## §0 ASCII Mockup — Confirm state (13523:70734)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   Tồn kho   Khách hàng   Marketing   Nhân viên   [Danh mục]      🔔● 👤 │  ← Navbar bg-brand visible under overlay
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   Nhóm vật tư hàng hóa   [Kỳ kế toán]‾‾‾                                          │  ← Sub-nav active tab underline
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← LIGHT overlay backdrop overlay/90 #0000001a
░░░░░░░░░░░░░  ┌──────────────────────────────────────────┐  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     Dialog card 441×210 centered
░░░░░░░░░░░░░  │  Bạn có chắc chắn muốn xóa kỳ kế         │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← Title-as-question 18px semibold
░░░░░░░░░░░░░  │       toán Tháng 2/2027 không?           │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     2 lines centered; period name interpolated
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │  Chỉ xóa được kỳ chưa đóng và chưa phát  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← Hint body 14px regular muted
░░░░░░░░░░░░░  │        sinh dữ liệu kho liên quan.       │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     2 lines centered
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │         [ Hủy ]   [  Xoá  ]              │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← 2 button centered
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     Hủy secondary + Xoá destructive RED
░░░░░░░░░░░░░  └──────────────────────────────────────────┘  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

## §0 ASCII Mockup — Blocked state (13523:70836)

```text
[Navbar + Sub-nav IDENTICAL to Confirm state — visible through light overlay]

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  ┌──────────────────────────────────────────┐  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     Dialog card 441×182
░░░░░░░░░░░░░  │            Không thể xóa                 │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← Title semibold centered
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │ Kỳ kế toán đã đóng hoặc đã phát sinh dữ  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← Body verbatim FEAT AC-4
░░░░░░░░░░░░░  │        liệu kho liên quan nên            │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │            không được xóa.               │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │              [ Đóng ]                    │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← 1 button centered secondary
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  └──────────────────────────────────────────┘  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

## §1 Layout DSL

```yaml
AccountingPeriodDeleteDialog:
  type: container                       # shadcn AlertDialog
  source: ui/alert-dialog
  modal: true
  width: 441
  padding: { y: 24, x: 24 }
  BG: bg-background                      # base/background #ffffff
  Border: none
  rounded: rounded-lg
  shadow: shadow-lg
  direction: vertical
  gap: 16
  align: center
  justify: center
  _mode_switch: "variant='confirm' → 3 children (TitleAsQuestion + HintBody + ActionRow[Hủy, Xoá])  ·  variant='blocked_closed' → 3 children (Title + Body + ActionRow[Đóng])  ·  variant='blocked_has_children' → 3 children (Title + Body-AC5 + ActionRow[Đóng]) — AC-5 draft body"
  _children_count: 3                     # R10 — always 3 children per variant
  _height_switch: "variant='confirm' → 210px card (hint row adds 28px)  ·  blocked_* → 182px card"
  children:

    - id: DialogTitle
      type: Text
      _mode_switch: "confirm → title-as-question interpolated  ·  blocked_closed → static 'Không thể xóa'  ·  blocked_has_children → static 'Không thể xóa'"
      content_confirm: "Bạn có chắc chắn muốn xóa kỳ kế toán {period.displayName} không?"
      content_blocked_closed: "Không thể xóa"
      content_blocked_has_children: "Không thể xóa"
      _png_verified_confirm: "13523-70734.png L380-410 verbatim 2-line wrap 'Bạn có chắc chắn muốn xóa kỳ kế toán Tháng 2/2027 không?' — period name interpolated"
      _png_verified_blocked: "13523-70836.png L390 verbatim 'Không thể xóa'"
      _interpolation_confirm: "{period.displayName} ← row.displayName từ FEAT-AP-LIST row action per AC-1 '[tên kỳ]' placeholder"
      weight: 600
      size: 18
      lineHeight: 28
      color: text-foreground
      align: center
      _renders_as: h2-dialog-title

    - id: DialogBody
      type: Text
      _mode_switch: "confirm → hint body  ·  blocked_closed → FEAT AC-4 body  ·  blocked_has_children → AC-5 body (draft)"
      content_confirm: "Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan."
      content_blocked_closed: "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa."
      content_blocked_has_children: "Kỳ kế toán còn kỳ con. Vui lòng xóa các kỳ con trước khi xóa kỳ cha."
      _png_verified_confirm: "13523-70734.png L440-465 verbatim 'Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan.' 2-line wrap centered"
      _png_verified_blocked_closed: "13523-70836.png L425-450 verbatim 'Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa.' — matches FEAT AC-4"
      _authoritative_source_blocked_has_children: "AC-5 body wording là DRAFT trong spec này (Figma chưa có frame) — BA phải confirm exact wording trước khi ACTIVE spec + design cần bổ sung frame"
      weight: 400
      size: 14
      lineHeight: 20
      color: text-muted-foreground
      align: center
      _renders_as: dialog-description

    - id: ActionRow
      type: container
      direction: horizontal
      gap: 8
      justify: center
      align: center
      _mode_switch: "confirm → 2 children [CancelButton, DestructiveDeleteButton]  ·  blocked_* → 1 child [DismissButton]"
      _children_count_confirm: 2
      _children_count_blocked: 1
      children_confirm:
        - id: CancelButton
          type: Button
          variant: secondary
          size: default
          label: "Hủy"
          _png_verified: "13523-70734.png L510 verbatim 'Hủy' grey button"
          onClick: "closeDialog()  # AC-3 dismiss"
          _renders_as: dialog-cancel-button

        - id: DestructiveDeleteButton
          type: Button
          variant: destructive
          size: default
          label: "Xoá"
          _png_verified: "13523-70734.png L510 verbatim 'Xoá' (dấu huyền) red destructive"
          onClick: "confirmDelete(row.id)  # AC-2 → DeleteAccountingPeriod mutation"
          _renders_as: dialog-destructive-cta

      children_blocked:
        - id: DismissButton
          type: Button
          variant: secondary
          size: default
          label: "Đóng"
          _png_verified: "13523-70836.png L490 verbatim 'Đóng' single grey button centered"
          onClick: "closeDialog()  # AC-4/AC-5 dismiss blocked notice"
          _renders_as: dialog-dismiss-button

_negative_coverage:
  - "không có × close icon top-right (matches D-1 pattern audit — AlertDialog default omit; PNG confirms absent both dialogs)"
  - "không có destructive icon leading Xoá button (no Trash glyph visible in PNG)"
  - "không có warning ⚠ icon leading title 'Không thể xóa' (blocked variant KHÔNG có warning icon)"
  - "không có input field xác nhận typed-delete pattern (vd 'Nhập XÓA để xác nhận') — plain confirm click"
  - "không có checkbox 'Không hiển thị lại' — plain 1-shot confirm"
  - "không có secondary link 'Xem chi tiết kỳ' / 'Kiểm tra dữ liệu liên quan' — blocked variant chỉ dismiss"
  - "không có period metadata preview (vd 'Kỳ: {mã}, Ngày bắt đầu: {date}, Ngày kết thúc: {date}, Trạng thái: {state}') trong body — confirm dialog chỉ interpolate displayName trong title"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Backdrop | background | overlay/90 | #0000001a | `bg-black/10` (light overlay, không phải shadcn default 80%) |
| Dialog card | background | base/background | #ffffff | `bg-background` |
| Dialog card | radius | border radius/md | 6 | `rounded-lg` |
| Dialog card | shadow | shadow/lg | drop-shadow 0 4 6 -2 + 0 10 15 -3 | `shadow-lg` |
| Dialog card | max-width | max-width/max-w-lg | 512 | `max-w-lg` (design 441 within upper bound) |
| DialogTitle | color | base/foreground | #18181b | `text-foreground` |
| DialogTitle | fontSize | typography/base sizes/large/font-size | 18 | `text-lg` |
| DialogTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| DialogTitle | lineHeight | typography/base sizes/large/line-height | 28 | `leading-7` |
| DialogBody | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| DialogBody | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| DialogBody | fontWeight | font/weight/normal | 400 | `font-normal` |
| DialogBody | lineHeight | typography/base sizes/small/line-height | 20 | `leading-5` |
| CancelButton / DismissButton | background | base/secondary | #f4f4f5 | `bg-secondary` |
| CancelButton / DismissButton | color | base/secondary-foreground | #18181b | `text-secondary-foreground` |
| CancelButton / DismissButton | height | height/h-9 | 36 | `h-9` |
| CancelButton / DismissButton | padding-x | spacing/4 | 16 | `px-4` |
| CancelButton / DismissButton | radius | border radius/md | 6 | `rounded-md` |
| CancelButton / DismissButton | shadow | shadow/sm | 0 1 2 #0000000D | `shadow-sm` |
| CancelButton / DismissButton | fontWeight | font/weight/medium | 500 | `font-medium` |
| DestructiveDeleteButton | background | base/destructive | #dc2626 | `bg-destructive` |
| DestructiveDeleteButton | color | base/destructive-foreground | #fef2f2 | `text-destructive-foreground` |
| DestructiveDeleteButton | height | height/h-9 | 36 | `h-9` |
| DestructiveDeleteButton | radius | border radius/md | 6 | `rounded-md` |
| DestructiveDeleteButton | shadow | shadow/sm | 0 1 2 #0000000D | `shadow-sm` |
| DestructiveDeleteButton | fontWeight | font/weight/medium | 500 | `font-medium` |

## §3 State Table

| State | Trigger | dialogVariant | Title | Body | ActionRow |
|---|---|---|---|---|---|
| `confirm` | User clicks row Delete icon on FEAT-AP-LIST + row.status="Chưa đóng" + row.hasWarehouseData=false + row.hasChildren=false (guardrail pre-check pass) | `confirm` | "Bạn có chắc chắn muốn xóa kỳ kế toán {period.displayName} không?" | "Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan." | [Hủy secondary, Xoá destructive] |
| `blocked_closed` | User clicks Delete + row.status="Đã đóng" OR row.hasWarehouseData=true | `blocked_closed` | "Không thể xóa" | "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa." | [Đóng secondary] |
| `blocked_has_children` | User clicks Delete + row.hasChildren=true (kỳ cha còn kỳ con) — AC-5 | `blocked_has_children` | "Không thể xóa" | "Kỳ kế toán còn kỳ con. Vui lòng xóa các kỳ con trước khi xóa kỳ cha." (DRAFT — Figma chưa có frame) | [Đóng secondary] |
| `success_toast` | User confirms + backend succeeds | (post-dialog toast) | (toast success) | "Đã xóa kỳ {name}" per AC-2 | (no dialog) |
| `error_toast` | User confirms + backend fails (unrelated to guardrail) | (post-dialog toast) | (toast error) | (per BR-AP error registry) | (no dialog) |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| DialogRoot | `ui/alert-dialog` | `open`, `onOpenChange` | AlertDialog preferred over Dialog — role="alertdialog" + no × close + no backdrop-click dismiss |
| DialogContent | `ui/alert-dialog` AlertDialogContent | `showCloseButton={false}` | className overrides bg + shadow-lg + rounded-lg per §2 tokens |
| DialogTitle | `ui/alert-dialog` AlertDialogTitle | (variant-driven text with interpolation confirm variant only) | Auto text-lg font-semibold |
| DialogBody | `ui/alert-dialog` AlertDialogDescription | (variant-driven static text) | Auto text-sm text-muted-foreground |
| CancelButton | `ui/alert-dialog` AlertDialogCancel | `variant="secondary"` | Auto handles closing dialog |
| DestructiveDeleteButton | `ui/alert-dialog` AlertDialogAction | `variant="destructive"` + `onClick={confirmDelete}` | Override default primary variant |
| DismissButton | `ui/alert-dialog` AlertDialogAction | `variant="secondary"` + `onClick={closeDialog}` | Blocked variants — Autofocus stays here |

## §5 Field Composition Schema

Dialog input contract:

```yaml
AccountingPeriodDeleteDialogProps:
  interface: AccountingPeriodDeleteDialogProps
  fields:
    - name: open
      type: boolean
      binding: parent controlled state (from FEAT-AP-LIST row Delete icon click)
      combined: false
    - name: variant
      type: "'confirm' | 'blocked_closed' | 'blocked_has_children'"
      binding: server pre-check result
      combined: false
      transform: "pre-check API GetPeriodDeletionEligibility returns { canDelete, reason: 'CLOSED_OR_HAS_DATA' | 'HAS_CHILDREN' | null } — null → confirm; CLOSED_OR_HAS_DATA → blocked_closed; HAS_CHILDREN → blocked_has_children"
    - name: period
      type: AccountingPeriodSummary
      binding: row.summary from FEAT-AP-LIST
      combined: false
    - name: onCancel
      type: "() => void"
      binding: closeDialog
      combined: false
    - name: onConfirm
      type: "(periodId: uuid) => Promise<void>"
      binding: confirm-flow trigger (variant='confirm' only)
      combined: false

AccountingPeriodSummary:
  fields:
    - { name: id, type: uuid }
    - { name: displayName, type: string, _note: "vd 'Tháng 2/2027' — interpolated vào TitleAsQuestion confirm variant" }
    - { name: status, type: "'Chưa đóng' | 'Đã đóng'" }
    - { name: hasWarehouseData, type: boolean }
    - { name: hasChildren, type: boolean }
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Backdrop overlay | 100vw × 100vh | — | (full-screen fixed) | z-50 |
| Dialog card confirm | 441 × 210 | { y: 24, x: 24 } | Title (2-line wrap ~350) + Body (2-line wrap ~350) + ActionRow (2 buttons ~148) | Metadata Dialog node 441×210 (28px taller than blocked due to hint row) |
| Dialog card blocked | 441 × 182 | { y: 24, x: 24 } | Title (1-line ~120) + Body (2-line wrap ~350) + ActionRow (1 button ~76) | Metadata Dialog node 441×182 |
| Dialog content area confirm | 393 | 0 | Title + gap(16) + Body + gap(16) + ActionRow | 441 - 48 padding |
| ActionRow confirm | intrinsic centered | 0 | Hủy (~64) + gap(8) + Xoá (~76) = ~148 | Centered within dialog content |
| ActionRow blocked | intrinsic centered | 0 | Đóng (~76) | Single button centered |

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - confirm: DestructiveDeleteButton "Xoá" (red bg — irreversible action visual cue)
  - blocked_*: Title "Không thể xóa" (semantic emphasis; no red because blocked = advisory not action)

Level 2 (secondary):
  - confirm: TitleAsQuestion (semibold bold, primary user prompt)
  - blocked_*: (title serves both L1 + L2 in blocked variants)

Level 3 (tertiary):
  - Body/Hint text (muted color signals informational)

Level 4 (utility):
  - CancelButton "Hủy" / DismissButton "Đóng" (grey bg recessive safe path)

Backdrop = ambient light overlay (~10% opacity — page background still visible)
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-AP-DEL-1 | Render shadcn Dialog `showCloseButton: true` default → × icon top-right | AlertDialog + `showCloseButton={false}` — PNG shows NO × both variants; matches D-1 audit "design omits" | `_png_verified`: 13523-70734.png + 13523-70836.png top-right corners plain, no × icon |
| AP-AP-DEL-2 | Xoá button uses variant="brand" (blue) instead of destructive | MUST `variant="destructive"` (red #dc2626) per PNG + irreversible action semantic | `_png_verified`: 13523-70734.png Xoá button red bg destructive |
| AP-AP-DEL-3 | Render literal "Xóa Kỳ kế toán" as separate dialog title header | FEAT AC-1 wording "popup 'Xóa Kỳ kế toán'" = popup identifier (colloquial), NOT literal H1. Figma uses title-as-question pattern (question is the title) | `_png_verified`: 13523-70734.png no separate H1 above question; question IS title top-of-card |
| AP-AP-DEL-4 | Confirm body use hint wording of blocked variant (mix up) | Confirm body verbatim "Chỉ xóa được kỳ chưa đóng và chưa phát sinh dữ liệu kho liên quan." (advisory hint, positive framing "Chỉ xóa được"). Blocked body verbatim "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa." (blocking, negative framing) — CANNOT swap | FEAT AC-1 confirm + AC-4 blocked, both verbatim explicit |
| AP-AP-DEL-5 | Skip AC-5 blocked_has_children variant (assume 1 blocked covers all) | Implementation MUST render 3 variants total (confirm + 2 blocked variants). AC-5 body wording DRAFT per coverage_gaps; BA confirm before ACTIVE | FEAT AC-5 explicit separate popup; coverage_gaps entry flags Figma missing frame |
| AP-AP-DEL-6 | Interpolate period.id or period.code instead of period.displayName | Confirm title interpolates `{period.displayName}` (vd "Tháng 2/2027") per PNG + FEAT AC-1 "[tên kỳ]" | `_png_verified`: 13523-70734.png shows "Tháng 2/2027" human-readable |
| AP-AP-DEL-7 | Backdrop uses shadcn default 80% dim (bg-black/80) | Design uses LIGHT overlay `#0000001a` (~10% opacity) — page background still visible through overlay | `_png_verified`: 13523-70734.png navbar + subnav clearly visible under dialog card, not blacked out |
| AP-AP-DEL-8 | Xoá button label uses "Xóa" (dấu sắc) | Verbatim "Xoá" (dấu huyền) per PNG — orthographic convention: button label uses dấu huyền, body prose uses dấu sắc | `_png_verified`: 13523-70734.png button 'Xoá' dấu huyền; body 'xóa' dấu sắc coexist |
| AP-AP-DEL-9 | Use `lucide-react` for any future icon addition | Use `iconsax-reactjs` per convention v7.6 R4.1 (currently zero icons in dialog) | `_ref-web-transform-figma.md v7.6` |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 13523:70734 | confirm (title-as-question + hint + Hủy/Xoá) | assets/wave04-ap-delete/13523-70734.png | 1440×900 |
| 13523:70836 | blocked_closed (Không thể xóa AC-4 + Đóng) | assets/wave04-ap-delete/13523-70836.png | 1440×900 |
| (Figma frame chưa có) | blocked_has_children (AC-5) | (khong-co-frame — xem coverage_gaps entry AC-5) | — |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Popup xác nhận + hint guardrail + Hủy/Xóa | DialogTitle (title-as-question) + DialogBody hint + ActionRow variant=confirm | 13523:70734 | ✓ |
| AC-2 | Xóa button → xóa + toast success + update list | DestructiveDeleteButton.onClick → DeleteAccountingPeriod mutation | 13523:70734 | ✓ |
| AC-3 | Hủy → đóng popup không xóa (kể cả icon ✕ nếu có) | CancelButton.onClick → closeDialog | 13523:70734 | ✓ (× icon absent per PNG; button đủ cho AC-3) |
| AC-4 | Popup blocked "Không thể xóa" khi đã đóng / đã phát sinh dữ liệu kho + chỉ Đóng | DialogTitle "Không thể xóa" + DialogBody FEAT AC-4 verbatim + ActionRow variant=blocked_closed | 13523:70836 | ✓ |
| AC-5 | Popup blocked "Không thể xóa" khi còn kỳ con + wording khác + chỉ Đóng | DialogTitle "Không thể xóa" + DialogBody AC-5 draft body + ActionRow variant=blocked_has_children | (missing Figma frame) | ⚠ (frame missing per coverage_gap; DRAFT wording pending BA) |
| AC-6 | Phân quyền — chủ garage + kế toán ngang nhau | (backend RBAC) | — | ⚠ (backend) |

## Coverage Gaps

- **AC-5 blocked-has-children variant**: Figma thiếu frame riêng. Spec đưa draft body "Kỳ kế toán còn kỳ con. Vui lòng xóa các kỳ con trước khi xóa kỳ cha." Designer + BA cần bổ sung Figma frame + confirm exact wording trước ACTIVE.
- **× close icon on AC-3**: FEAT AC-3 mention "icon đóng ✕" như trigger Hủy — Figma không có × per shadcn AlertDialog convention. AC-3 satisfied bởi Hủy button. Nếu BA muốn giữ × thì bổ sung Figma + đổi component từ AlertDialog sang Dialog.
- **Stale section background layers** (`Phiếu nhập kho` template, hidden=true trong metadata cả 2 frames): ignored trong spec — dialog overlay + navbar visible only.
