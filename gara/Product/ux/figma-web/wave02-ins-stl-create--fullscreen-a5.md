---
feat: FEAT-INS-STL-CREATE
feat_file: Product/features/FEAT-INS-STL-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-159225&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13535:159225"
screen_slug: fullscreen-a5
fetched_at: 2026-06-23T04:41:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
related_specs:
  - Product/ux/figma-web/wave02-ins-stl-create--panel.md   # Panel state A — same content reused
coverage_gaps:
  - "fullscreen-a5 frame (1212×816) = A5-portrait reference layout cho Business review — wrap empty placeholder LEFT (600×816) + panel 'Tổng giá dịch vụ' RIGHT (600×764 reuse node 13692:113072). KHÔNG phải render context production."
  - "Panel content IDENTICAL với wave02-ins-stl-create--panel.md Screen A (state SO có BH) — same node 13692:113072. DEV reuse component đã spec ở --panel; spec này CHỈ document A5 frame wrapper."
  - "Panel demo data + drift annotations (AC-4 không màu, AC-5 chỉ 2 rows) — xem --panel spec; áp dụng same."
---

## Scope nhắc nhở — A5 frame là design reference, KHÔNG phải production layout

> Frame `13535:159225` (1212×816) là **design reference** cho mockup A5 portrait — Business Authority dùng để in giấy + ráp print template (CR-20260616-02 visual reference). KHÔNG phải production screen.
>
> **Panel "Tổng giá dịch vụ"** bên phải (x=612, w=600, h=764) reuse **đúng node 13692:113072** — same anatomy với wave02-ins-stl-create--panel.md `## Screen: Panel "Tổng giá dịch vụ" — state A: SO CÓ BẢO HIỂM`. Vùng trái (x=0, w=600, h=816) là **empty placeholder** trong design (để Business hình dung tỉ lệ trang A5).
>
> **DEV action**: KHÔNG spec/build riêng cho fullscreen-a5. Implement panel theo wave02-ins-stl-create--panel.md. A5 frame chỉ phục vụ visual review.

---

## Icon Catalog (shared)

Reuse từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) — không có icon nội tại trong panel.

---

## Screen: A5 frame wrapper — Panel "Tổng giá dịch vụ" (state A) (13535:159225)

> Frame `13535:159225` (Frame 1948757478, 1212×816) — outer A5 reference container.
> Composition: empty placeholder left (13535:159226, 600×816) + panel right (13692:113072, 600×764, x=612).

### §0 ASCII Mockup

```
┌──────────────────────────────────────────┬──────────────────────────────────────────┐
│                                          │  Tổng giá dịch vụ                        │ ← panel cloned từ node 13692:113072
│                                          │  (3 sections như wave02-ins-stl-create   │
│        empty placeholder                 │   --panel.md state A — KHÔNG lặp ở đây)  │
│        (600×816)                         │                                          │
│                                          │  [Chi tiết theo bên thanh toán]          │
│                                          │  [Phân bổ Bảo hiểm]                      │
│                                          │  [Cần thanh toán → Tổng 50.000.000 blue] │
│                                          │                                          │
└──────────────────────────────────────────┴──────────────────────────────────────────┘
  x=0, w=600                                  x=612, w=600 (gap=12)
```

### §1 Layout DSL

```yaml
A5FullscreenWrapper:                  # frame 13535:159225 — design reference only
  type: container
  direction: horizontal
  gap: 12
  width: 1212
  height: 816
  bg: bg-background
  children:
    - id: A5LeftPlaceholder           # design context, NOT production
      type: container
      width: 600
      height: 816
      bg: bg-background
      flex-grow: 0
      _note: "Empty design placeholder — KHÔNG render trong production"

    - id: A5RightPanel
      $ref: TotalServicePricePanel_StateA   # reuse wave02-ins-stl-create--panel.md
      _node: "13692:113072"
      _note: "Reuse exact panel from --panel spec, state A (SO có BH). DEV KHÔNG spec riêng."
```

### §2 Design Token Map

Reuse từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §2 Design Token Map (state A). Không thêm token unique cho A5 wrapper.

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `A5FullscreenWrapper` | rendered (design reference only) | n/a | KHÔNG render production |
| `A5RightPanel` | state A | same as wave02-ins-stl-create--panel.md state A | `serviceOrder.hasInsurance === true` |
| Other states | NA | A5 frame chỉ capture state A demo | — |

### §4 Component Prop Map

Reuse 100% từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §4 state A. Không có component prop unique cho A5 wrapper.

### §5 Field Composition Schema

Reuse data_binding từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §5 — same `PrepareCreateSettlement` query với `insuranceAdjustment` block.

### §6 Layout Width Table

| Container | Max-width | Margin | Align-self | Notes |
|---|---|---|---|---|
| `A5FullscreenWrapper` (design ref only) | 1212 FIXED | 0 | start | Frame outer cho A5 portrait reference |
| `A5LeftPlaceholder` | 600 FIXED | 0 | start | Empty (design context only, NOT render) |
| `A5RightPanel` | 600 FIXED | 12 left (gap) | start | Reuse panel state A — same width 600 |

### §7 Visual Hierarchy Map

Reuse từ [`wave02-ins-stl-create--panel.md`](./wave02-ins-stl-create--panel.md) §7 — A5 wrapper KHÔNG thay đổi hierarchy panel.

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Đúng |
|---|---|---|---|
| AP-A5-1 | **DEV spec/build "A5 fullscreen view"** | Tạo route/page riêng cho 1212×816 wrapper với cột trái rỗng | A5 frame là design reference ONLY. KHÔNG có production route. Reuse panel từ --panel spec, không spec riêng. |
| AP-A5-2 | **Reuse leftPlaceholder làm production form** | Hiểu nhầm cột trái là form Khách hàng chi trả / Bảo hiểm chi trả | Cột trái = empty design placeholder. Form thực tế nằm trong màn Tạo QT baseline (FEAT-STL-CREATE) — KHÔNG ở đây. |
| AP-A5-3 | **Duplicate panel code (sao chép từ A5 wrapper)** | 2 nguồn panel code (1 từ --panel.md + 1 từ A5) → drift maintenance | Single source = wave02-ins-stl-create--panel.md. A5 spec chỉ document wrapper context. |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-stl-create/13535-159225_fullscreen-a5.png   # 1212×816 A5 wrapper
  pngs_read:
    - assets/wave02-ins-stl-create/13535-159225_fullscreen-a5.png   # 1212×816 A5 wrapper
    - assets/wave02-ins-stl-create/13692-113072.png                  # panel state A reuse evidence
  claims_verified:
    - claim: "Frame 1212×816 với 2 zones horizontal: empty placeholder left (600×816 trống) + panel 'Tổng giá dịch vụ' right (600×764 chứa 3 sections như state A)"
      evidence: "13535-159225_fullscreen-a5.png — quan sát cột trái all-white (~600px), cột phải có panel với title + 3 sections (đếm: Chi tiết + Phân bổ + Cần thanh toán)"
    - claim: "Panel content IDENTICAL với wave02-ins-stl-create--panel.md state A — same demo data (95.040đ rows, Tổng 50.000.000đ blue)"
      evidence: "13535-159225_fullscreen-a5.png vs 13692-113072.png — cùng layout, cùng numbers, cùng font weight, cùng blue total"
    - claim: "A5 wrapper KHÔNG có border / shadow / background phân biệt — purely composition reference"
      evidence: "13535-159225_fullscreen-a5.png — không thấy outer border around the 1212 frame, panel có border riêng (rounded-lg + border-input)"
```

### §9 Container Hierarchy (legacy)

```
A5FullscreenWrapper (13535:159225, 1212×816) [horizontal, gap=12]
├── A5LeftPlaceholder (13535:159226, 600×816, x=0) — EMPTY design placeholder, KHÔNG render production
└── A5RightPanel (13692:113072, 600×764, x=612)
    └── (reuse wave02-ins-stl-create--panel.md §9 state A)
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-stl-create/13535-159225_fullscreen-a5.png` | Frame 1948757478 (1212×816) | A5 wrapper evidence — empty-left + panel-right composition |
| `assets/wave02-ins-stl-create/13692-113072.png` | Panel state A (cross-ref) | Evidence panel reused = wave02-ins-stl-create--panel.md state A |
