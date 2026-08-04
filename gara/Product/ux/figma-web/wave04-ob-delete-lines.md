---
feat: FEAT-OB-DELETE-LINES
feat_file: Product/features/FEAT-OB-DELETE-LINES.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89264
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89264"
fetched_at: "2026-07-08T03:32Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: ACTIVE
coverage_gaps:
  - "Screen 2 (13575:95000) 'Không thể xóa' body text trên Figma verbatim là 'Một số dòng tồn đầu kỳ thuộc kỳ đã khóa hoặc đã phát sinh phiếu xuất kho nên không được xóa' — MISMATCH với FEAT AC-4 v7 (2026-07-07) chốt 'Một số dòng tồn đầu kỳ thuộc kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm, nên không được xóa.' + AC-5 explicit 'chỉ chặn khi xóa làm tồn âm, KHÔNG chặn chỉ vì có phiếu xuất'. Design chưa sync AC-4 v7 guardrail rewrite. Implementation MUST theo FEAT AC-4 v7 (authoritative Business Authority), báo BA cập nhật Figma."
  - "Section frame 13575:94897 + 13575:95000 chứa stale 'Phiếu nhập kho' template background (hidden=true layers). Chỉ Dialog overlay là canonical UI (441×182 white card + shadow-lg centered). Spec emit dialog + backdrop only; template background ignored."
---

# FEAT-OB-DELETE-LINES — Spec (web)

> 2 modal confirmation dialog cho luồng xóa nhiều dòng tồn đầu kỳ đã chọn từ `FEAT-OB-LIST` (checkbox bulk-select → button "Xoá các dòng đã chọn"). (1) Success confirm "Xác nhận" — cho phép xóa khi cả lô thỏa guardrail; (2) Blocked "Không thể xóa" — chặn cả lô khi ≥1 dòng vi phạm kỳ khoá / tồn âm (AC-4/AC-5 + BR-OB-DEL-003/005).
>
> **Icon library**: `iconsax-reactjs` primary (garage-web convention v7.6). Dialog body này KHÔNG có icon glyph (text-only content).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| (no icons in dialogs) | — | — | — | — | Dialogs chỉ có title text + body text + 1-2 button — không có icon glyph nào visible trong 2 PNG dialogs |

---

## Screen: Confirm delete "Xác nhận" (13575:94897)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Confirm state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `dialogVariant: confirm` → Title "Xác nhận" + confirmation body + 2 buttons (Hủy secondary + Xoá destructive).

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
screenshot: assets/wave04-ob-delete-lines/13575-94897.png
verified_at: "2026-07-08T03:33Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Dialog card white bg centered on light overlay backdrop, ~441×182px per metadata dialog node dimensions"
    status: ✓
    evidence: "13575-94897.png shows white card centered horizontally + vertically, subtle backdrop tint around, shadow underneath card"
  - claim: "Title verbatim 'Xác nhận' centered bold — text large weight semibold"
    status: ✓
    evidence: "13575-94897.png L390 verbatim 'Xác nhận' — bold black text top of card, horizontally centered"
  - claim: "Body verbatim 'Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?' wraps to 2 lines, centered, muted color"
    status: ✓
    evidence: "13575-94897.png L425-450 verbatim 2-line wrap 'Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn / không?' — preserve dấu 'xóa' (dấu sắc, không phải 'xoá')"
  - claim: "2 button horizontal group centered — Hủy secondary (grey bg #f4f4f5) LEFT + Xoá destructive (red bg #dc2626 white text) RIGHT"
    status: ✓
    evidence: "13575-94897.png L490-510 shows [Hủy grey] [Xoá red] side-by-side horizontally centered below body. Xoá dùng dấu huyền 'á'."
  - claim: "Xoá button verbatim label 'Xoá' (dấu huyền 'á') — matches FEAT-OB-LIST v4 verbatim convention (KHÔNG 'Xóa' với dấu sắc)"
    status: ✓
    evidence: "13575-94897.png button label 'Xoá' character-by-character; body prose dùng 'xóa' (dấu sắc) — 2 orthographic variants COEXIST intentionally per Figma design"
```

---

## Screen: Blocked "Không thể xóa" (13575:95000)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Blocked state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `dialogVariant: blocked` → Title "Không thể xóa" + guardrail message body + 1 button (Đóng secondary).

### §2 Design Token Map

> See file-level **§2 Design Token Map** below.

### §3 State Table

> See file-level **§3 State Table** below (state = `blocked`).

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
screenshot: assets/wave04-ob-delete-lines/13575-95000.png
verified_at: "2026-07-08T03:33Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Dialog card ~441×182 white bg, same shape as Screen 1 confirm dialog"
    status: ✓
    evidence: "13575-95000.png dialog same size + centered position as 13575-94897.png"
  - claim: "Title verbatim 'Không thể xóa' centered semibold — chú ý 'xóa' dấu sắc"
    status: ✓
    evidence: "13575-95000.png L390 'Không thể xóa' — bold black centered top of card"
  - claim: "Body Figma verbatim 'Một số dòng tồn đầu kỳ thuộc kỳ đã khóa hoặc đã phát sinh phiếu xuất kho nên không được xóa' — MISMATCH FEAT AC-4 v7 (Business Authority chốt guardrail 'kỳ đóng OR tồn âm' NOT 'phát sinh phiếu xuất')"
    status: ⚠
    evidence: "13575-95000.png L425-450 verbatim body reads 'phát sinh phiếu xuất kho' — coverage_gaps flag; implementation theo FEAT AC-4 v7 authoritative wording 'kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm'"
  - claim: "1 button 'Đóng' centered secondary variant (grey bg), NO destructive button"
    status: ✓
    evidence: "13575-95000.png L490 single grey button 'Đóng' centered below body — no Xoá / no destructive button"
  - claim: "Blocked variant KHÔNG có destructive action — chỉ Đóng dismiss dialog, không thực hiện xóa"
    status: ✓
    evidence: "13575-95000.png single-button footer matches AC-4 explicit 'chỉ có nút Đóng, và không xóa dòng nào'"
```

---

# File-level shared sections

## §0 ASCII Mockup — Confirm state (13575:94897)

```text
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← Overlay backdrop overlay/90 #0000001a (very subtle light overlay)
░░░░░░░░░░░░░  ┌──────────────────────────────────────────┐  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░     Dialog card 441×182 centered
░░░░░░░░░░░░░  │              Xác nhận                    │  ░░░░░░░░░░░░░░░░░░░░░░░░  ← Title centered semibold 18px (text large)
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░     bg-background white + shadow-lg
░░░░░░░░░░░░░  │  Bạn có chắc chắn muốn xóa các dòng tồn  │  ░░░░░░░░░░░░░░░░░░░░░░░░  ← Body regular 14px muted-foreground
░░░░░░░░░░░░░  │            đầu kỳ đã chọn                │  ░░░░░░░░░░░░░░░░░░░░░░░░     2 lines centered
░░░░░░░░░░░░░  │              không?                      │  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │         [ Hủy ]   [  Xoá  ]              │  ░░░░░░░░░░░░░░░░░░░░░░░░  ← 2 buttons centered horizontal group
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░     Hủy secondary + Xoá destructive RED
░░░░░░░░░░░░░  └──────────────────────────────────────────┘  ░░░░░░░░░░░░░░░░░░░░░░░░
```

## §0 ASCII Mockup — Blocked state (13575:95000)

```text
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  ┌──────────────────────────────────────────┐  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │            Không thể xóa                 │  ░░░░░░░░░░░░░░░░░░░░░░░░  ← Title centered semibold
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │  Một số dòng tồn đầu kỳ thuộc kỳ kế toán │  ░░░░░░░░░░░░░░░░░░░░░░░░  ← Body verbatim theo FEAT AC-4 v7 authoritative
░░░░░░░░░░░░░  │ đã khóa, hoặc việc xóa làm tồn kho xuống │  ░░░░░░░░░░░░░░░░░░░░░░░░     (Figma design out-of-sync — coverage_gap)
░░░░░░░░░░░░░  │        âm, nên không được xóa.           │  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░  │              [ Đóng ]                    │  ░░░░░░░░░░░░░░░░░░░░░░░░  ← 1 button centered — secondary variant
░░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░     NO destructive action
░░░░░░░░░░░░░  └──────────────────────────────────────────┘  ░░░░░░░░░░░░░░░░░░░░░░░░
```

## §1 Layout DSL

```yaml
OpeningBalanceDeleteDialog:
  type: container                       # shadcn AlertDialog preferred (focus trap + role="alertdialog")
  source: ui/alert-dialog
  modal: true
  width: 441                             # metadata Dialog node 441×182
  padding: { y: 24, x: 24 }
  BG: bg-background                      # base/background #ffffff
  Border: none                           # relying on shadow for elevation
  rounded: rounded-lg                    # border radius/lg
  shadow: shadow-lg                      # shadow/lg two-drop-shadow effect
  direction: vertical
  gap: 16
  align: center
  justify: center
  _mode_switch: "props.variant === 'confirm' → 3 children (Title + Body + ActionRow[Hủy, Xoá]) · props.variant === 'blocked' → 3 children (Title + Body + ActionRow[Đóng])"
  _children_count: 3                     # R10 — Title + Body + ActionRow (both variants same length)
  children:

    - id: DialogTitle
      type: Text
      _mode_switch: "variant === 'confirm' → 'Xác nhận' · variant === 'blocked' → 'Không thể xóa'"
      content_confirm: "Xác nhận"
      content_blocked: "Không thể xóa"
      _png_verified_confirm: "13575-94897.png L390 verbatim 'Xác nhận' centered bold"
      _png_verified_blocked: "13575-95000.png L390 verbatim 'Không thể xóa' centered bold — 'xóa' dấu sắc"
      weight: 600                        # font/weight/semibold
      size: 18                           # typography/base sizes/large/font-size
      lineHeight: 28                     # typography/base sizes/large/line-height
      color: text-foreground             # base/foreground #18181b
      align: center
      _renders_as: h2-dialog-title

    - id: DialogBody
      type: Text
      _mode_switch: "variant === 'confirm' → confirm body · variant === 'blocked' → blocked body (FEAT AC-4 authoritative)"
      content_confirm: "Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?"
      content_blocked: "Một số dòng tồn đầu kỳ thuộc kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm, nên không được xóa."
      _png_verified_confirm: "13575-94897.png L425-450 verbatim 'Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?' 2-line wrap centered"
      _png_verified_blocked_source: "FEAT-OB-DELETE-LINES AC-4 v7 (2026-07-07) authoritative Business Authority — Figma design 13575-95000.png L425-450 reads 'thuộc kỳ đã khóa hoặc đã phát sinh phiếu xuất kho' which is OUT-OF-SYNC per coverage_gaps entry"
      _authoritative_source: "FEAT-OB-DELETE-LINES.md AC-4 v7 — DEV implement theo FEAT wording, KHÔNG theo Figma stale draft"
      weight: 400                        # font/weight/normal
      size: 14                           # typography/base sizes/small/font-size
      lineHeight: 20
      color: text-muted-foreground       # base/muted-foreground #71717a
      align: center
      _renders_as: dialog-description
      _interpolation: "no interpolation — plain static text per variant"

    - id: ActionRow
      type: container
      direction: horizontal
      gap: 8
      justify: center
      align: center
      _mode_switch: "variant === 'confirm' → 2 children [CancelButton, DestructiveDeleteButton] · variant === 'blocked' → 1 child [DismissButton]"
      _children_count_confirm: 2
      _children_count_blocked: 1
      children_confirm:
        - id: CancelButton
          type: Button
          variant: secondary                # bg-secondary #f4f4f5 + text-secondary-foreground #18181b
          size: default                     # h-9 (spacing/9 = 36)
          label: "Hủy"
          _png_verified: "13575-94897.png L490 verbatim button label 'Hủy' — grey bg secondary"
          onClick: "closeDialog()  # dismiss without action per AC-3"
          _renders_as: dialog-cancel-button

        - id: DestructiveDeleteButton
          type: Button
          variant: destructive              # bg-destructive #dc2626 + text-destructive-foreground #fef2f2
          size: default
          label: "Xoá"
          _png_verified: "13575-94897.png L490 verbatim button label 'Xoá' (dấu huyền 'á') — red bg destructive white text"
          onClick: "confirmDelete(selectedIds)  # → BulkDeleteOpeningBalances mutation per AC-2"
          _renders_as: dialog-destructive-cta

      children_blocked:
        - id: DismissButton
          type: Button
          variant: secondary                # bg-secondary — NO destructive per AC-4 explicit
          size: default
          label: "Đóng"
          _png_verified: "13575-95000.png L490 verbatim button label 'Đóng' — grey bg secondary, single button"
          onClick: "closeDialog()  # dismiss blocked notice; no action per AC-4 'không xóa dòng nào'"
          _renders_as: dialog-dismiss-button

_negative_coverage:
  - "không có × close icon top-right corner (default shadcn Dialog auto-adds; PNG shows NO ×, spec removes CloseButton) — matches D-1 pattern audit"
  - "không có destructive icon leading Xoá button (Trash icon KHÔNG có visible trong button label per PNG)"
  - "không có warning ⚠ icon leading title 'Không thể xóa' (blocked variant KHÔNG có warning icon in PNG)"
  - "không có secondary link 'Xem chi tiết' / 'Kiểm tra dòng vi phạm' — blocked variant chỉ dismiss, không có drill-down UI"
  - "không có input field trong dialog (confirm variant KHÔNG có 'Nhập XÓA để xác nhận' typed-confirmation pattern)"
  - "không có checkbox 'Không hiển thị lại' / 'Xác nhận đã đọc guardrail' — plain confirm + plain block"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Backdrop | background | overlay/90 | #0000001a | `bg-black/10` (approx — very subtle) |
| Dialog card | background | base/background | #ffffff | `bg-background` |
| Dialog card | border | (none) | — | `border-0` |
| Dialog card | radius | border radius/md | 6 | `rounded-lg` (design uses lg per shadcn convention) |
| Dialog card | shadow | shadow/lg | 0 4 6 -2 + 0 10 15 -3 | `shadow-lg` |
| Dialog card | max-width | max-width/max-w-lg | 512 | `max-w-lg` (design 441 within max-w-lg upper bound) |
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
| CancelButton / DismissButton | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| CancelButton / DismissButton | fontWeight | font/weight/medium | 500 | `font-medium` |
| DestructiveDeleteButton | background | base/destructive | #dc2626 | `bg-destructive` |
| DestructiveDeleteButton | color | base/destructive-foreground | #fef2f2 | `text-destructive-foreground` |
| DestructiveDeleteButton | height | height/h-9 | 36 | `h-9` |
| DestructiveDeleteButton | radius | border radius/md | 6 | `rounded-md` |
| DestructiveDeleteButton | shadow | shadow/sm | 0 1 2 #0000000D | `shadow-sm` |
| DestructiveDeleteButton | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| DestructiveDeleteButton | fontWeight | font/weight/medium | 500 | `font-medium` |

## §3 State Table

| State | Trigger | dialogVariant | Title | Body | ActionRow |
|---|---|---|---|---|---|
| `confirm` | User clicks "Xoá các dòng đã chọn" (FEAT-OB-LIST bulk-delete) + ALL selected rows pass guardrail check server-side | `confirm` | "Xác nhận" | "Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?" | [Hủy secondary, Xoá destructive] |
| `blocked` | User clicks "Xoá các dòng đã chọn" + ≥1 selected row FAILS guardrail (period locked OR would make stock negative) — pre-check API returns violation list per AC-4/AC-5/BR-OB-DEL-003/005 | `blocked` | "Không thể xóa" | "Một số dòng tồn đầu kỳ thuộc kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm, nên không được xóa." (FEAT AC-4 v7 authoritative) | [Đóng secondary only] |
| `success_toast` | User confirms + backend succeeds | (post-dialog; separate toast component) | (toast success) | "Đã xóa {N} dòng tồn đầu kỳ" per AC-2 | (no dialog) |
| `error_toast` | User confirms + backend fails (network / server error unrelated to guardrail) | (post-dialog; separate toast component) | (toast error) | (per BR-OB-DEL-005 error code registry, mã đầu tiên vi phạm) | (no dialog) |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| DialogRoot | `ui/alert-dialog` (shadcn AlertDialog) | `open`, `onOpenChange` | AlertDialog preferred over Dialog — role="alertdialog" auto + no × close icon + backdrop click dismiss disabled (mandatory action) |
| DialogContent | `ui/alert-dialog` AlertDialogContent | `showCloseButton={false}` (default for AlertDialog) | Preserve card BG + shadow-lg + rounded-lg via className |
| DialogTitle | `ui/alert-dialog` AlertDialogTitle | (variant-driven content) | Auto text-lg font-semibold per shadcn theme |
| DialogBody | `ui/alert-dialog` AlertDialogDescription | (variant-driven content) | Auto text-sm text-muted-foreground per shadcn theme |
| CancelButton | `ui/alert-dialog` AlertDialogCancel | `variant="secondary"` | Auto handles closing dialog on click |
| DestructiveDeleteButton | `ui/alert-dialog` AlertDialogAction | `variant="destructive"` + `onClick={confirmDelete}` | Explicit variant destructive (default shadcn AlertDialogAction is primary — override) |
| DismissButton (blocked) | `ui/alert-dialog` AlertDialogAction | `variant="secondary"` + `onClick={closeDialog}` | Blocked variant — no destructive action; use AlertDialogAction with secondary variant to keep autofocus |

## §5 Field Composition Schema

Dialog input contract:

```yaml
OpeningBalanceDeleteDialogProps:
  interface: OpeningBalanceDeleteDialogProps
  fields:
    - name: open
      type: boolean
      binding: parent controlled state (from FEAT-OB-LIST bulk-delete flow)
      combined: false
    - name: variant
      type: "'confirm' | 'blocked'"
      binding: server pre-check result (guardrail passed → 'confirm', violated → 'blocked')
      combined: false
      transform: "pre-check API returns { violations: [] } — empty violations → confirm; non-empty → blocked"
    - name: selectedIds
      type: uuid[]
      binding: FEAT-OB-LIST.selectedRowIds
      combined: false
    - name: violations
      type: BulkDeleteViolation[]?
      binding: pre-check API response (blocked variant only)
      combined: false
      _optional: true
      _renders: "violations list is NOT rendered in dialog per current PNG — could be rendered as bullet list under body in future FEAT iteration, but v7 spec keeps blocked body plain text"
    - name: onCancel
      type: "() => void"
      binding: closeDialog
      combined: false
    - name: onConfirm
      type: "(selectedIds: uuid[]) => Promise<void>"
      binding: confirm-flow trigger (variant='confirm' only)
      combined: false

BulkDeleteViolation:
  fields:
    - { name: obLineId, type: uuid }
    - { name: errorCode, type: "'ERR-INV-024' | 'ERR-INV-036'" }   # per BR-OB-DEL-005 mã lỗi order
    - { name: reason, type: string }
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Backdrop overlay | 100vw × 100vh | — | (full-screen fixed) | z-50 layer |
| Dialog card | 441 | { y: 24, x: 24 } | Title (variable text width, centered) + Body (variable multi-line, centered) + ActionRow | Metadata: dialog 441×182 |
| Dialog card content area | 441 - 48 = 393 | 0 | Title full-width center + Body full-width center + ActionRow center | Gap 16 vertical between children |
| ActionRow confirm | (intrinsic width of 2 buttons + gap) | 0 | Hủy (approx 64) + gap(8) + Xoá (approx 76) = ~148 | Centered horizontally within dialog content area |
| ActionRow blocked | (intrinsic width of 1 button) | 0 | Đóng (approx 76) | Single button centered |
| Button Hủy | intrinsic | px-4 (16) | "Hủy" text ≈ 32 + px-4×2 = 64 | h-9 |
| Button Xoá | intrinsic | px-4 (16) | "Xoá" text ≈ 44 + px-4×2 = 76 | h-9 |
| Button Đóng | intrinsic | px-4 (16) | "Đóng" text ≈ 44 + px-4×2 = 76 | h-9 |

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - confirm variant: DestructiveDeleteButton "Xoá" (red bg — strongest visual weight for irreversible action)
  - blocked variant: Title "Không thể xóa" (semantic emphasis via wording; no visual red because blocked = advisory)

Level 2 (secondary):
  - Title "Xác nhận" (both variants; bold centered)

Level 3 (tertiary):
  - Body text (muted color signals informational, not actionable)

Level 4 (utility):
  - CancelButton "Hủy" / DismissButton "Đóng" (grey bg — recessive, safe path)

Backdrop overlay = ambient (semi-transparent, non-interactive except click-outside handler which AlertDialog disables)
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-OB-DEL-1 | Assume shadcn Dialog `showCloseButton: true` default → render × close icon top-right | AlertDialog variant (not Dialog) is preferred + explicit `showCloseButton={false}` — PNG shows NO × icon | `_png_verified`: 13575-94897.png + 13575-95000.png both dialogs corner right show plain edge, no × icon; matches D-1 pattern audit spec action "design omits" |
| AP-OB-DEL-2 | Xoá button uses variant="brand" (blue) or variant="primary" | Xoá button MUST be `variant="destructive"` (red #dc2626) per PNG evidence — irreversible action visual cue | `_png_verified`: 13575-94897.png Xoá button red bg destructive not brand blue |
| AP-OB-DEL-3 | Confirm dialog body paraphrased to "Xóa {N} dòng?" or "Xác nhận xóa?" | Body verbatim "Bạn có chắc chắn muốn xóa các dòng tồn đầu kỳ đã chọn không?" per FEAT AC-1 explicit + PNG | `_png_verified`: 13575-94897.png L425-450 verbatim body; FEAT AC-1 explicit verbatim wording. |
| AP-OB-DEL-4 | Blocked dialog body use Figma stale wording "phát sinh phiếu xuất kho" | Body MUST verbatim FEAT AC-4 v7 authoritative: "Một số dòng tồn đầu kỳ thuộc kỳ kế toán đã khóa, hoặc việc xóa làm tồn kho xuống âm, nên không được xóa." per BR-OB-DEL-003 (chỉ chặn khi tồn âm, KHÔNG chặn vì "có phiếu xuất") | FEAT AC-4 v7 explicit + AC-5 v7 clarify + coverage_gaps entry (Figma design out-of-sync) |
| AP-OB-DEL-5 | Blocked variant include Xoá button (with disabled state) | Blocked variant has ONLY Đóng button — no destructive action available per AC-4 explicit "chỉ có nút 'Đóng', và không xóa dòng nào" | `_png_verified`: 13575-95000.png single button footer, no Xoá visible even disabled |
| AP-OB-DEL-6 | Confirm button label uses "Xóa" (dấu sắc) | Verbatim "Xoá" (dấu huyền 'á') per PNG — matches FEAT-OB-LIST v4 verbatim convention 2026-07-06 (nút trigger label + confirm dialog action label 2 vị trí orthographic consistency) | `_png_verified`: 13575-94897.png button text 'Xoá' character-by-character |
| AP-OB-DEL-7 | Body text paraphrase 'xóa' → 'xoá' or vice-versa | Body prose dùng 'xóa' (dấu sắc), Button labels dùng 'Xoá' (dấu huyền) — 2 orthographic variants COEXIST intentionally per Figma design (button label vs prose text distinct convention) | `_png_verified`: 13575-94897.png body 'xóa' dấu sắc + button 'Xoá' dấu huyền |
| AP-OB-DEL-8 | Show violations list under blocked body (bullet list of {rowId, errorCode, reason}) | Current v7 spec keeps blocked body plain text; violations list NOT rendered in dialog — matches PNG. Future FEAT iteration may add "Xem chi tiết" drill-down (out of current scope) | `_png_verified`: 13575-95000.png body is single paragraph, no bullet list; FEAT §7 out-of-scope note |
| AP-OB-DEL-9 | Use `lucide-react` for internal icons (though this dialog has zero icons) | If future revision adds icons (vd warning ⚠), use `iconsax-reactjs` PascalCase per convention v7.6 — see FEAT-OB-LIST spec Icon Catalog for pattern | `_ref-web-transform-figma.md v7.6 R4.1` |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 13575:94897 | confirm (Xác nhận + Hủy/Xoá) | assets/wave04-ob-delete-lines/13575-94897.png | 1440×900 |
| 13575:95000 | blocked (Không thể xóa + Đóng) | assets/wave04-ob-delete-lines/13575-95000.png | 1440×900 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Popup xác nhận "Xác nhận" + body + Xóa/Hủy khi guardrail pass | DialogTitle "Xác nhận" + DialogBody + ActionRow variant=confirm | 13575:94897 | ✓ |
| AC-2 | Nhấn Xóa → xóa + thông báo thành công + update danh sách | DestructiveDeleteButton.onClick → confirmDelete mutation | 13575:94897 | ✓ (post-dialog toast in state table) |
| AC-3 | Nhấn Hủy → đóng popup, không xóa | CancelButton.onClick → closeDialog | 13575:94897 | ✓ |
| AC-4 | ≥1 dòng vi phạm → popup "Không thể xóa" + body guardrail wording + Đóng only + không xóa dòng nào | DialogTitle "Không thể xóa" + DialogBody FEAT AC-4 v7 authoritative + ActionRow variant=blocked (Đóng only) | 13575:95000 | ✓ (Figma stale wording flagged in coverage_gaps + AP-OB-DEL-4) |
| AC-5 | Tồn ≥ 0 rule — không chặn chỉ vì có phiếu xuất | (backend concern — encoded trong BulkDeleteViolation.errorCode logic pre-check API) | — | ⚠ (backend logic; UI wording in AC-4 body reflects rule) |
| AC-6 | Phân quyền — chủ garage + kế toán xóa với quyền ngang nhau | (backend concern — RBAC; no client-side gating beyond authenticated session) | — | ⚠ (backend) |

## Coverage Gaps

- **Figma design ↔ FEAT AC-4 v7 wording drift**: Screen 2 body Figma verbatim "phát sinh phiếu xuất kho" vs FEAT AC-4 v7 authoritative "việc xóa làm tồn kho xuống âm". Implementation follows FEAT (Business Authority T2 wins over T3 UX design). Figma designer đã báo sync khi có sprint UX.
- **Stale section background layers** (`Phiếu nhập kho` template, hidden=true trong metadata cả 2 frames): ignored in spec — dialog overlay only.
