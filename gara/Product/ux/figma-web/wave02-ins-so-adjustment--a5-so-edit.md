---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13354-57960&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13354:57960"
screen_slug: a5-so-edit
fetched_at: 2026-06-23T04:51:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
related_specs:
  - Product/ux/figma-web/wave02-ins-stl-create--panel.md         # Shared panel anatomy state A
  - Product/ux/figma-web/wave02-ins-stl-create--fullscreen-a5.md # Pattern parallel (same A5 wrapper)
  - Product/ux/figma-web/wave02-ins-so-adjustment--section.md    # Sibling W02 SO-ADJUSTMENT
  - Product/ux/figma-web/wave02-ins-so-adjustment--a5-so-detail.md
coverage_gaps:
  - "a5-so-edit frame (1212×816) = A5-portrait design reference cho CR-20260616-02 panel layout (Business design review). KHÔNG phải production layout."
  - "Panel 'Tổng giá dịch vụ' bên phải (600×764) reuse node 13692:113072 — IDENTICAL với wave02-ins-stl-create--panel.md state A + wave02-ins-stl-create--fullscreen-a5.md."
  - "Context = SO Edit (panel editable mode — adjustments accept user input per W01 SO Edit anatomy)."
  - "DEV KHÔNG spec/build A5 wrapper riêng. Implement panel theo wave02-ins-stl-create--panel.md + wave02-ins-so-adjustment--section.md W02 deltas."
---

## Icon Catalog (shared)

Reuse từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md).

---

## Scope — A5 SO Edit reference (design review only)

> Frame `13354:57960` (1212×816) — design reference cho CR-20260616-02 panel layout, hiển thị context **SO Edit** (panel editable mode). Composition: empty left placeholder (600×816) + panel right (600×764, x=612).
>
> Panel content IDENTICAL với:
> - [`wave02-ins-stl-create--fullscreen-a5.md`](./wave02-ins-stl-create--fullscreen-a5.md) (STL Create context)
> - [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) state A (panel anatomy source)
> - [`wave02-ins-so-adjustment--a5-so-detail.md`](./wave02-ins-so-adjustment--a5-so-detail.md) (SO Detail context — view mode)
>
> **Khác biệt giữa A5-edit và A5-detail** = chỉ ở `mode` prop (editable vs read-only); panel layout/anatomy 100% identical.

---

## Screen: A5 frame — SO Edit context (13354:57960)

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
  Context: SO Edit (panel mode=editable)
  x=0, w=600                                  x=612, w=600 (gap=12)
```

### §1 Layout DSL

```yaml
A5SOEditWrapper:                      # frame 13354:57960 — design reference only
  type: container
  direction: horizontal
  gap: 12
  width: 1212
  height: 816
  bg: bg-background
  context: "SO Edit page reference"
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
      mode: editable                          # ← khác A5-detail: SO Edit cho user nhập adjustments
      _note: "Reuse exact panel; mode=editable per SO Edit context"
```

### §2 Design Token Map

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §2.

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `A5SOEditWrapper` | rendered (design reference only) | n/a | KHÔNG render production |
| `A5RightPanel` | editable | adjustment inputs accept user input (5 rows) | SO Edit context |

### §4 Component Prop Map

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §4 with override:
| Prop | Override (A5-so-edit) |
|---|---|
| `mode` | `editable` |

### §5 Field Composition Schema

Reuse data_binding từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §5.

```yaml
mode_override:
  context: SO Edit
  editable_fields: adjustments.{ckLinkedParts, ckLinkedService, compensationReduction, depreciation, deductible} (5 rows)
  computed_fields: breakdownByPayer (always server-side), settlementBalance (always server-side after each user edit)
  mutation: UpdateServiceOrderAdjustments (debounced)
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| A5SOEditWrapper | 1212 FIXED | design reference frame |
| A5LeftPlaceholder | 600 FIXED | empty |
| A5RightPanel | 600 FIXED | panel reuse |

### §7 Visual Hierarchy Map

Reuse [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §7.

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Đúng |
|---|---|---|---|
| AP-A5-EDIT-1 | **DEV spec/build "A5 SO Edit view"** | Tạo route/page 1212×816 với cột trái rỗng | A5 frame = design reference ONLY. KHÔNG có production route. |
| AP-A5-EDIT-2 | **Panel rendered read-only thay vì editable** | User mở SO Edit nhưng adjustments fields disabled | `mode: editable` cho SO Edit context — adjustments accept input |
| AP-A5-EDIT-3 | **Duplicate panel code (sao chép từ A5 wrapper)** | 2 nguồn panel code → drift maintenance | Single source = wave02-ins-stl-create--panel.md (mode prop dispatches editable vs view) |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-so-adjustment/13354-57960_a5-edit.png   # 1212×816 A5 SO Edit ref
  pngs_read:
    - assets/wave02-ins-so-adjustment/13354-57960_a5-edit.png   # 1212×816 A5 SO Edit ref
  claims_verified:
    - claim: "Frame 1212×816 với 2 zones horizontal: empty placeholder left (600×816 trống) + panel 'Tổng giá dịch vụ' right (600×764)"
      evidence: "13354-57960_a5-edit.png — cột trái all-white ~600px, cột phải có panel 3 sections"
    - claim: "Panel content IDENTICAL với wave02-ins-stl-create--fullscreen-a5.png (same panel reused across A5 frames cho 3 contexts: SO Edit + SO Detail + STL Create)"
      evidence: "13354-57960_a5-edit.png ≡ wave02-ins-stl-create/13535-159225_fullscreen-a5.png ≡ wave02-ins-so-adjustment/13354-58368_a5-detail.png pixel-similar"
    - claim: "A5 wrapper KHÔNG có border / outer chrome — purely composition reference for Business review"
      evidence: "13354-57960_a5-edit.png — không thấy outer frame border around 1212 frame"
```

### §9 Container Hierarchy (legacy)

```
A5SOEditWrapper (13354:57960, 1212×816) [horizontal, gap=12]
├── A5LeftPlaceholder (600×816, x=0) — EMPTY design placeholder
└── A5RightPanel (13692:113072, 600×764, x=612)
    └── (delegate to wave02-ins-stl-create--panel.md state A — mode=editable)
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-so-adjustment/13354-57960_a5-edit.png` | Frame 13354:57960 (1212×816) | A5 SO Edit wrapper evidence |
