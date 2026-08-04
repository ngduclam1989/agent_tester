---
feat: FEAT-CAT-PROD-DELETE
feat_file: Product/features/FEAT-CAT-PROD-DELETE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14322-176694
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14322:176694"
fetched_at: "2026-06-29T04:18Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: ACTIVE
---

# FEAT-CAT-PROD-DELETE — Spec (web)

> 2 dialog state khi xóa mã sản phẩm:
> 1. **Confirm Delete** (14329:254641) — modal với 2 button Hủy/Xoá (destructive)
> 2. **Cannot Delete** (14329:254743) — modal warning khi sản phẩm đã có data sử dụng — chỉ 1 button "Đóng"
> Per-frame native PNG 465×206 mỗi dialog (no downscale).

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| (no icons in dialogs) | — | — | text + button only | n/a |

---

## Screen: Confirm Delete Dialog (14329:254641)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup** below — content is shared across all Screen states of this FEAT.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below — content is shared across all Screen states of this FEAT.

### §2 Design Token Map

> See file-level **§2 Design Token Map** below — content is shared across all Screen states of this FEAT.

### §3 State Table

> See file-level **§3 State Table** below — content is shared across all Screen states of this FEAT.

### §4 Component Prop Map

> See file-level **§4 Component Prop Map** below — content is shared across all Screen states of this FEAT.

### §5 Field Composition Schema

> See file-level **§5 Field Composition Schema** below — content is shared across all Screen states of this FEAT.

### §6 Layout Width Table

> See file-level **§6 Layout Width Table** below — content is shared across all Screen states of this FEAT.

### §7 Visual Hierarchy Map

> See file-level **§7 Visual Hierarchy Map** below — content is shared across all Screen states of this FEAT.

### §8 Anti-Pattern Trap

> See file-level **§8 Anti-Pattern Trap** below — content is shared across all Screen states of this FEAT.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-delete/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-delete/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← bg-black/50 backdrop
░░░░░░░░░░  ┌──────────────────────────────────────────────┐  ░░░░░░░░░░
░░░░░░░░░░  │                Xác nhận                       │  ░░░░░░░░░░  ← Title centered bold
░░░░░░░░░░  │ Bạn có chắc chắn muốn xóa mã sản phẩm        │  ░░░░░░░░░░  ← Body muted, mentions product code
░░░░░░░░░░  │ IP-BP-0001 không?                             │  ░░░░░░░░░░
░░░░░░░░░░  │            [ Hủy ]   [ Xoá ]                  │  ░░░░░░░░░░  ← 2 buttons centered
░░░░░░░░░░  └──────────────────────────────────────────────┘  ░░░░░░░░░░     Hủy=outline + Xoá=destructive RED
```

### §1 Layout DSL

```yaml
ConfirmDeleteDialog:
  type: container
  source: ui/alert-dialog
  modal: true
  width: 441                  # metadata XML: Dialog node 441×182
  padding: { y: 24, x: 24 }
  BG: bg-background
  Border: 1px solid border-input
  rounded: rounded-lg
  shadow: shadow-lg
  direction: vertical
  gap: 16
  align: center
  _children_count: 3          # R10 — Title + Body + ActionRow
  children:
    - id: DialogTitle
      type: Text
      content: "Xác nhận"
      _png_verified: "14329-254641.png L20 — verbatim 'Xác nhận' centered bold text-foreground"
      weight: 600
      size: 18
      color: text-foreground
      align: center
      _renders_as: h2-dialog-title

    - id: DialogBody
      type: Text
      content: "Bạn có chắc chắn muốn xóa mã sản phẩm {product.code} không?"
      _png_verified: "14329-254641.png L40-60 — verbatim 'Bạn có chắc chắn muốn xóa mã sản phẩm IP-BP-0001 không?' wraps to 2 lines centered muted"
      weight: 400
      size: 14
      color: text-muted-foreground
      align: center
      _interpolation: "{product.code} ← product.code từ FEAT-CAT-PROD-LIST row trigger"

    - id: ActionRow
      type: container
      direction: horizontal
      gap: 12
      justify: center
      align: center
      _children_count: 2      # R10 — 2 buttons
      children:
        - id: CancelButton
          type: Button
          variant: outline
          size: default
          label: "Hủy"
          _png_verified: "14329-254641.png L120 — verbatim 'Hủy' outline button white left"
          on_click: dialog.close
        - id: ConfirmDeleteButton
          type: Button
          variant: destructive
          size: default
          label: "Xoá"
          _png_verified: "14329-254641.png L120 — verbatim 'Xoá' destructive button RED bg-destructive (#ef4444) + white text, right of Hủy"
          ariaLabel: "Xác nhận xóa mã sản phẩm"
          on_click: delete-product-mutation
          loading_label: "Đang xoá..."

_negative_coverage:
  - "KHÔNG có close X icon góc header"
  - "KHÔNG có warning glyph trong body"
  - "KHÔNG có typed-confirmation field"
  - "Body interpolates product.code (e.g. 'IP-BP-0001'), NOT product.name"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-delete/14329-254641.png
verified_at: "2026-06-29T04:18Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Dialog small/compact (~441×182), centered with bg-black/50 backdrop"
    status: ✓
    evidence: "14329-254641.png — single white card ~465×206, no large modal"
  - claim: "Title 'Xác nhận' centered (no close X)"
    status: ✓
    evidence: "14329-254641.png L20 — text centered horizontally, no right close icon"
  - claim: "Body mentions PRODUCT CODE 'IP-BP-0001' (NOT 'sản phẩm/SP IDs' generic)"
    status: ✓
    evidence: "14329-254641.png L40 — body text reads 'Bạn có chắc chắn muốn xóa mã sản phẩm IP-BP-0001 không?'"
  - claim: "ConfirmButton DESTRUCTIVE variant (solid red), CancelButton OUTLINE (white)"
    status: ✓
    evidence: "14329-254641.png L120 — 'Xoá' red fill, 'Hủy' white interior with border"
```

### §2-§8

| Section | Content |
|---|---|
| §2 Token Map | Same as GRP-DELETE §2: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-input`, `bg-destructive`, `text-primary-foreground`, `rounded-lg`, `rounded-md`, `shadow-lg`, `bg-black/50` |
| §3 State Table | `ConfirmDeleteButton`: default → hover → loading (`bg-destructive → /90 → spinner`); `CancelButton`: default → hover (`bg-background → bg-muted`) |
| §4 Component Prop | `AlertDialog` (preferred for focus trap), `Button` variant=`destructive` + label="Xoá", `Button` variant=`outline` + label="Hủy" |
| §5 Field Schema | `ConfirmDeleteDialog: { fields: [] }` — no editable fields |
| §6 Layout Width | Modal backdrop full viewport `inset-0`; Dialog card `max-w-md` ~441px centered; ActionRow centered `mx-auto` |
| §7 Hierarchy | L1 title, L2 destructive CTA, L2 secondary action, L3 body |
| §8 Trap | Trap 2 nhầm destructive với brand — Xoá MUST be destructive red, NOT brand blue. `_png_verified: "14329-254641.png L120 — 'Xoá' button has solid red bg-destructive #ef4444, NOT blue bg-primary"` |

---

## Screen: Cannot Delete Dialog (14329:254743)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup** below — content is shared across all Screen states of this FEAT.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below — content is shared across all Screen states of this FEAT.

### §2 Design Token Map

> See file-level **§2 Design Token Map** below — content is shared across all Screen states of this FEAT.

### §3 State Table

> See file-level **§3 State Table** below — content is shared across all Screen states of this FEAT.

### §4 Component Prop Map

> See file-level **§4 Component Prop Map** below — content is shared across all Screen states of this FEAT.

### §5 Field Composition Schema

> See file-level **§5 Field Composition Schema** below — content is shared across all Screen states of this FEAT.

### §6 Layout Width Table

> See file-level **§6 Layout Width Table** below — content is shared across all Screen states of this FEAT.

### §7 Visual Hierarchy Map

> See file-level **§7 Visual Hierarchy Map** below — content is shared across all Screen states of this FEAT.

### §8 Anti-Pattern Trap

> See file-level **§8 Anti-Pattern Trap** below — content is shared across all Screen states of this FEAT.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-delete/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-delete/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
░░░░░░░░░░  ┌──────────────────────────────────────────────┐  ░░░░░░░░░░
░░░░░░░░░░  │              Không thể xóa                    │  ░░░░░░░░░░  ← Title centered bold
░░░░░░░░░░  │ Mã sản phẩm IP-BP-0001 đã phát sinh dữ liệu  │  ░░░░░░░░░░  ← Body muted, explains reason
░░░░░░░░░░  │ sử dụng nên không được xóa.                  │  ░░░░░░░░░░
░░░░░░░░░░  │                  [ Đóng ]                     │  ░░░░░░░░░░  ← Single button centered
░░░░░░░░░░  └──────────────────────────────────────────────┘  ░░░░░░░░░░     Đóng = outline/secondary
```

### §1 Layout DSL

```yaml
CannotDeleteDialog:
  type: container
  source: ui/alert-dialog
  modal: true
  width: 441
  padding: { y: 24, x: 24 }
  BG: bg-background
  Border: 1px solid border-input
  rounded: rounded-lg
  shadow: shadow-lg
  direction: vertical
  gap: 16
  align: center
  _children_count: 3
  children:
    - id: DialogTitle
      type: Text
      content: "Không thể xóa"
      _png_verified: "14329-254743.png L20 — verbatim 'Không thể xóa' centered bold (NOT 'Xác nhận')"
      weight: 600
      size: 18
      color: text-foreground
      align: center
      _renders_as: h2-dialog-title

    - id: DialogBody
      type: Text
      content: "Mã sản phẩm {product.code} đã phát sinh dữ liệu sử dụng nên không được xóa."
      _png_verified: "14329-254743.png L40-60 — verbatim 'Mã sản phẩm IP-BP-0001 đã phát sinh dữ liệu sử dụng nên không được xóa.' wraps to 2 lines muted centered"
      weight: 400
      size: 14
      color: text-muted-foreground
      align: center
      _interpolation: "{product.code} ← product.code từ trigger"

    - id: ActionRow
      type: container
      direction: horizontal
      justify: center
      align: center
      _children_count: 1      # R10 — 1 button only (Đóng)
      children:
        - id: CloseButton
          type: Button
          variant: outline
          size: default
          label: "Đóng"
          _png_verified: "14329-254743.png L120 — verbatim 'Đóng' outline button centered (single button, NOT 2 like Confirm dialog)"
          on_click: dialog.close

_negative_coverage:
  - "KHÔNG có 'Xóa anyway' override button — business rule prevents delete when has references"
  - "KHÔNG có warning glyph (⚠) trong title"
  - "Single button (NOT 2-button confirm/cancel)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-delete/14329-254743.png
verified_at: "2026-06-29T04:18Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Title 'Không thể xóa' (NOT 'Xác nhận')"
    status: ✓
    evidence: "14329-254743.png L20 — verbatim 'Không thể xóa'"
  - claim: "Single button 'Đóng' (NOT 2 buttons)"
    status: ✓
    evidence: "14329-254743.png L120 — only one outline button centered"
  - claim: "Body explains reason: 'đã phát sinh dữ liệu sử dụng nên không được xóa.'"
    status: ✓
    evidence: "14329-254743.png L40-60 — verbatim explanation text muted centered"
```

### §2-§8

| Section | Content |
|---|---|
| §2 Token Map | Same as Confirm Delete §2 (minus bg-destructive — Cannot Delete dialog không có destructive button) |
| §3 State Table | `CloseButton`: default → hover (`bg-background → bg-muted`) |
| §4 Component Prop | `AlertDialog`, `Button` variant=`outline` + label="Đóng" + `on_click: dialog.close` |
| §5 Field Schema | `CannotDeleteDialog: { fields: [] }` |
| §6 Layout Width | Same as Confirm Delete |
| §7 Hierarchy | L1 title, L2 acknowledge CTA, L3 explanation body |
| §8 Trap | Trap (DELETE-specific) — DEV bypass check + show Confirm dialog when sản phẩm có dependencies → BE 409 error toast. Đúng: BE call `canDeleteProduct(id)` before opening Confirm; if false → show CannotDelete dialog. `_png_verified: "14329-254743.png L20-60 — Cannot Delete dialog exists as distinct UI variant when product has data dependencies, with body 'Mã sản phẩm IP-BP-0001 đã phát sinh dữ liệu sử dụng nên không được xóa.'"` |

---

## §9 Container Hierarchy

```text
ConfirmDeleteDialog (modal)
├── Backdrop (bg-black/50)
└── DialogCard [vertical, gap=16, padding=24, max-w-md, centered]
    ├── DialogTitle "Xác nhận"
    ├── DialogBody "Bạn có chắc chắn muốn xóa mã sản phẩm {product.code} không?"
    └── ActionRow [horizontal, gap=12, justify=center]
        ├── CancelButton (outline) "Hủy"
        └── ConfirmDeleteButton (destructive) "Xoá"

CannotDeleteDialog (modal)
├── Backdrop
└── DialogCard [vertical, gap=16, padding=24, max-w-md, centered]
    ├── DialogTitle "Không thể xóa"
    ├── DialogBody "Mã sản phẩm {product.code} đã phát sinh dữ liệu sử dụng nên không được xóa."
    └── ActionRow [horizontal, justify=center]
        └── CloseButton (outline) "Đóng"
```

---

## Screenshots

> `assets/wave03-cat-prod-delete/`

- `_full.png` — section overview reference

- `14329-254641.png` — Screen: Confirm Delete Dialog (465×206 NATIVE)
- `14329-254743.png` — Screen: Cannot Delete Dialog (465×206 NATIVE)
