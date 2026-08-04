---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13354-58368&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13354:58368"
screen_slug: a5-so-detail
fetched_at: 2026-06-23T04:51:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
related_specs:
  - Product/ux/figma-web/wave02-ins-stl-create--panel.md         # Shared panel anatomy state A
  - Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md # Pattern parallel
  - Product/ux/figma-web/wave02-ins-so-adjustment--section.md    # Sibling W02 SO-ADJUSTMENT
  - Product/ux/figma-web/wave02-ins-so-adjustment--a5-so-edit.md # Sibling A5 (Edit mode)
coverage_gaps:
  - "a5-so-detail frame (1212×816) = A5-portrait design reference cho CR-20260616-02 panel layout (Business design review). KHÔNG phải production layout."
  - "Panel 'Tổng giá dịch vụ' bên phải (600×764) reuse node 13692:113072 — IDENTICAL với wave02-ins-stl-create--panel.md state A."
  - "Context = SO Detail (panel view mode — read-only display)."
  - "DEV KHÔNG spec/build A5 wrapper riêng. Implement panel theo wave02-ins-stl-create--panel.md + wave02-ins-so-adjustment--section.md."
---

## Icon Catalog (shared)

Reuse từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md).

---

## Scope — A5 SO Detail reference (design review only)

> Frame `13354:58368` (1212×816) — design reference cho CR-20260616-02 panel layout, hiển thị context **SO Detail** (panel view mode — read-only). Composition: empty left placeholder (600×816) + panel right (600×764, x=612).
>
> Panel content IDENTICAL với:
> - [`wave02-ins-stl-create--fullscreen-a5.md`](./wave02-ins-stl-create--fullscreen-a5.md) (STL Create context)
> - [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) state A (panel anatomy source)
> - [`wave02-ins-so-adjustment--a5-so-edit.md`](./wave02-ins-so-adjustment--a5-so-edit.md) (SO Edit context — editable mode)
>
> **Khác biệt giữa A5-detail và A5-edit** = chỉ ở `mode` prop (view vs editable); panel layout/anatomy 100% identical.

---

## Screen: A5 frame — SO Detail context (13354:58368)

### §0 ASCII Mockup

```
┌──────────────────────────────────────────┬──────────────────────────────────────────┐
│                                          │  Tổng giá dịch vụ                        │
│                                          │  (panel reuse từ wave02-ins-stl-create   │
│        empty placeholder                 │   --panel.md state A — KHÔNG lặp ở đây)  │
│        (600×816)                         │                                          │
│                                          │  [Chi tiết theo bên thanh toán]          │
│                                          │  [Phân bổ Bảo hiểm — 5 rows × 2 col]     │
│                                          │  [Cần thanh toán → Tổng 50.000.000 blue] │
│                                          │                                          │
└──────────────────────────────────────────┴──────────────────────────────────────────┘
  Context: SO Detail (panel mode=view, read-only)
  x=0, w=600                                  x=612, w=600 (gap=12)
```

### §1 Layout DSL

```yaml
A5SODetailWrapper:                    # frame 13354:58368 — design reference only
  type: container
  direction: horizontal
  gap: 12
  width: 1212
  height: 816
  bg: bg-background
  context: "SO Detail page reference"
  children:
    - id: A5LeftPlaceholder
      type: container
      width: 600
      height: 816
      bg: bg-background
      flex-grow: 0
      _note: "Empty design placeholder — KHÔNG render production"

    - id: A5RightPanel
      $ref: TotalServicePricePanel_StateA   # reuse wave02-ins-stl-create--panel.md state A
      _node: "13692:113072"
      mode: view                              # ← khác A5-edit: SO Detail read-only
      _note: "Reuse exact panel; mode=view per SO Detail context (no user input)"
```

### §2 Design Token Map

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §2.

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `A5SODetailWrapper` | rendered (design reference only) | n/a | KHÔNG render production |
| `A5RightPanel` | view (read-only) | adjustment values displayed as text, không có inputs | SO Detail context |

### §4 Component Prop Map

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §4 with override:
| Prop | Override (A5-so-detail) |
|---|---|
| `mode` | `view` |

### §5 Field Composition Schema

Reuse data_binding từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §5.

```yaml
mode_override:
  context: SO Detail
  editable_fields: none (read-only)
  computed_fields: all (display from server response)
  mutation: none (view-only screen)
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| A5SODetailWrapper | 1212 FIXED | design reference frame |
| A5LeftPlaceholder | 600 FIXED | empty |
| A5RightPanel | 600 FIXED | panel reuse |

### §7 Visual Hierarchy Map

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §7.

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Đúng |
|---|---|---|---|
| AP-A5-DETAIL-1 | **DEV spec/build "A5 SO Detail view"** | Tạo route/page 1212×816 với cột trái rỗng | A5 frame = design reference ONLY. KHÔNG có production route. |
| AP-A5-DETAIL-2 | **Panel rendered editable thay vì view-only** | SO Detail user thấy form fields enabled → confuse | `mode: view` cho SO Detail context — display-only, không có inputs |
| AP-A5-DETAIL-3 | **Duplicate panel code (sao chép từ A5 wrapper)** | Drift maintenance | Single source = wave02-ins-stl-create--panel.md (mode prop dispatches) |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-so-adjustment/13354-58368_a5-detail.png   # 1212×816 A5 SO Detail ref
  pngs_read:
    - assets/wave02-ins-so-adjustment/13354-58368_a5-detail.png   # 1212×816 A5 SO Detail ref
  claims_verified:
    - claim: "Frame 1212×816 với 2 zones horizontal: empty placeholder left (600×816) + panel 'Tổng giá dịch vụ' right (600×764)"
      evidence: "13354-58368_a5-detail.png — cột trái all-white, cột phải có panel 3 sections"
    - claim: "Panel content visually IDENTICAL với A5-so-edit + STL fullscreen-a5 — same panel anatomy reused"
      evidence: "13354-58368_a5-detail.png ≡ 13354-57960_a5-edit.png ≡ wave02-ins-stl-create/13535-159225_fullscreen-a5.png"
    - claim: "A5 wrapper purely composition reference for Business design review (CR-20260616-02 mockup)"
      evidence: "13354-58368_a5-detail.png — no outer chrome / no interactive controls visible"
```

### §9 Container Hierarchy (legacy)

```
A5SODetailWrapper (13354:58368, 1212×816) [horizontal, gap=12]
├── A5LeftPlaceholder (600×816, x=0) — EMPTY design placeholder
└── A5RightPanel (13692:113072, 600×764, x=612)
    └── (delegate to wave02-ins-stl-create--panel.md state A — mode=view)
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-so-adjustment/13354-58368_a5-detail.png` | Frame 13354:58368 (1212×816) | A5 SO Detail wrapper evidence |
