---
feat: FEAT-INS-DOSSIER-VIEW
feat_file: Product/features/FEAT-INS-DOSSIER-VIEW.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-480151&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:480151"
fetched_at: 2026-06-23T03:35:00+07:00
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
coverage_gaps:
  - "AC-1 drift: empty-state text trong design = 'Không tồn tại bản ghi!' (generic SharedEmptyData) — FEAT AC-1 yêu cầu 'Chưa có hồ sơ nào được xuất' (ERR-INS-010). DEV theo AC label."
  - "AC-3 drift: design KHÔNG hiển thị 'mã tham chiếu phiếu QT #SET-...' ở dòng dưới mỗi card — chỉ filename + size. Mã #SET nằm ở title bộ hồ sơ (AC-2). DEV theo design."
  - "AC-3 selection highlight: design screenshot KHÔNG show 'thẻ đang chọn highlight viền nổi bật' / 'mặc định chọn thẻ đầu tiên' — chưa thấy hover/active state. Verify với Figma interactive prototype hoặc Business Authority khi DEV implement selection."
  - "AC-4/AC-5 'Xem PDF' action: design card KHÔNG có nút 'Xem PDF' tường minh — click whole card open PDF (per AC-4). Badge 'Đã xuất' tồn tại trong component master nhưng opacity=0 trong instance design (hidden). DEV: click card → open PDF (AC-4), không render badge 'Đã xuất' theo design hiện tại."
  - "AC-1 'bộ mới nhất trên cùng' + EC-1 paginate 5 bộ/trang + 'Xem thêm' control — design chỉ show 3 bộ, KHÔNG capture được control 'Xem thêm'. DEV implement theo AC-1 + EC-1 (paginate)."
---

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes |
|---|---|---|---|
| pdf-file (image asset) | (asset SVG / lucide-react `FileText`) | — | icon đỏ thẻ tài liệu PDF (40×40) — file storage component image |
| empty-box illustration | (asset SVG hiện hành — share/empty-state) | — | empty-state "Không tồn tại bản ghi!" (tab Hồ sơ BH đã xuất, state empty) |

> Garage web: `iconsax-reactjs` cho icon variant; `lucide-react` cho generic. PDF icon hiện dùng image asset master "File Fomat" của design system.

---

## Scope nhắc nhở — đây là CR mở rộng FEAT-INS-STL-DETAIL

> **Spec này chỉ document tab MỚI "Hồ sơ bảo hiểm đã xuất"** (tab thứ 3 trên màn Chi tiết phiếu QT BH). Phần Navbar / Header AC-1 / Khối "Thông tin quyết toán" AC-2 / Khối "Thông tin khách hàng & xe" AC-3 / Khối "Thông tin bảo hiểm" / Tab bar AC-4 đã được spec đầy đủ trong [`Product/ux/figma-web/wave01-ins-stl-detail.md`](./wave01-ins-stl-detail.md) — DEV reuse component baseline, KHÔNG rebuild.
>
> Gate hiển thị tab: chỉ render khi `settlement.payer === 'INSURANCE'` (BR-INS-DOSSIER-VIEW-008 + BR-INS-STL-DET-007). Phiếu QT khách hàng giữ 3 tab baseline.

---

## Screen: Tab "Hồ sơ bảo hiểm đã xuất" — state CÓ DỮ LIỆU (13257:481064)

> Tab thứ 3 của bộ tab màn Chi tiết phiếu QT BH (FEAT-INS-STL-DETAIL AC-4). Container `tab` (1216×979) gồm: instance `Tab navigation links` 1216×56 (4 tab — đã spec ở wave01-ins-stl-detail.md) + nội dung tab "AC-8: Tab Hồ sơ bảo hiểm đã xuất" (1216×923 trong frame 13257:480949).
>
> Layout đã chốt 2026-06-16 (FEAT-INS-DOSSIER-VIEW v15): **danh sách dọc các bộ hồ sơ**, mỗi bộ = title #SET + subtitle "Xuất ngày … · N tài liệu PDF" + **grid 2 cột × N/2 hàng** thẻ file PDF. Bộ mới nhất trên cùng. Design screenshot capture 3 bộ liên tiếp (v3 → v2 → v1) cho cùng `#SET-20260326-00001`.

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Bảng chi phí    Chứng từ & hóa đơn    [Hồ sơ bảo hiểm đã xuất]    Lịch sử thanh toán                │ ← Tab bar (AC-4 baseline)
│ ─────────────  ──────────────────  ═══════════════════════════  ──────────────────                    │ ← active blue underline
│                                                                                                       │
│  Bộ hồ sơ #SET-20260326-00001                                                        ◂ title L2 18/600│ ← AC-2 set #1 (mới nhất)
│  Xuất ngày 26/03/2026 08:30 · 4 tài liệu PDF                                         ◂ subtitle muted │
│  ┌──────────────────────────────────────────┐ ┌──────────────────────────────────────────┐           │
│  │ [PDF] phieuquyettoan_239239_v3.pdf       │ │ [PDF] phieubaogia_239239_v3.pdf          │           │ ← AC-3 grid 2 cột
│  │       100kb                              │ │       100kb                              │           │
│  └──────────────────────────────────────────┘ └──────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────┐ ┌──────────────────────────────────────────┐           │
│  │ [PDF] bienbannghiemthu_239239_v3.pdf     │ │ [PDF] giayuyquyen_239239_v3.pdf          │           │
│  │       100kb                              │ │       100kb                              │           │
│  └──────────────────────────────────────────┘ └──────────────────────────────────────────┘           │
│                                                                                                       │
│  Bộ hồ sơ #SET-20260326-00001                                                                         │ ← AC-7 set #2 (cũ hơn)
│  Xuất ngày 26/03/2026 08:12 · 4 tài liệu PDF                                                          │
│  ┌────────── 4 PDF cards _v2 (grid 2×2) ─────────────────────────────────────────────────────┐       │
│                                                                                                       │
│  Bộ hồ sơ #SET-20260326-00001                                                                         │ ← AC-7 set #3 (cũ nhất)
│  Xuất ngày 26/03/2026 08:06 · 4 tài liệu PDF                                                          │
│  ┌────────── 4 PDF cards _v1 (grid 2×2) ─────────────────────────────────────────────────────┐       │
│                                                                                                       │
│  [Xem thêm]  ← chỉ render khi hasMore (EC-1, paginate 5 bộ/lần — KHÔNG show trong frame Figma)        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
   ↑ container 1216px wide                                                                               
   ↑ gap dọc giữa các bộ ≈ 32px (set block kế tiếp = title + grid)                                       
   ↑ grid: col-gap 20px (cột-trái x=0 w=578 | cột-phải x=598 w=578 = 1216), row-gap 16px                
```

> Empty state (khi `dossierSets.length === 0`) render SharedEmptyData (xem screen tiếp).

### §1 Layout DSL

```yaml
DossierListTab:
  type: container
  direction: vertical
  gap: 32                         # gap-8 giữa các bộ hồ sơ
  padding: { t: 0, r: 0, b: 0, l: 0 }
  bg: bg-transparent              # inherit container parent (Tab Content panel)
  children:
    - id: DossierSetList
      type: container
      direction: vertical
      gap: 32
      flex-grow: 1
      children:
        - $ref: DossierSetBlock   # iterate cho mỗi `set` trong response, bộ mới nhất TRÊN CÙNG (AC-1)

    - id: LoadMoreButton          # EC-1 — paginate 5 bộ/lần
      type: Button
      variant: outline
      size: default
      label: "Xem thêm"
      visible_when: "hasMore === true"
      flex-grow: 0

DossierSetBlock:                  # 1 bộ hồ sơ = 1 lần xuất (AC-2)
  type: container
  direction: vertical
  gap: 16
  flex-grow: 0
  children:
    - id: SetHeader
      type: container
      direction: vertical
      gap: 4
      flex-grow: 0
      children:
        - id: SetTitle
          type: Text
          content: "Bộ hồ sơ #{settlementCode}"   # vd "Bộ hồ sơ #SET-20260326-00001"
          weight: 600                              # font-semibold
          size: 18                                 # text-lg
          line_height: 28
          color: text-card-foreground              # #09090b
        - id: SetSubtitle
          type: Text
          content: "Xuất ngày {exportedAt:dd/MM/yyyy HH:mm} · {pdfCount} tài liệu PDF"
          weight: 400
          size: 14                                 # text-sm
          line_height: 20
          color: text-muted-foreground             # #71717a

    - id: PdfGrid
      type: container
      direction: grid
      cols: 2                                      # AC-3 grid 2 cột
      gap: { row: 16, col: 20 }                    # row-gap 16, col-gap 20 (theo design x=0 / x=598)
      children:
        - $ref: PdfCard                            # iterate pdfFiles[], tối đa 4 (BR-007)

PdfCard:                          # AC-3 thẻ file PDF (component "Upload / item" reused)
  type: container
  direction: horizontal
  align: center
  gap: 12
  padding: 12
  bg: bg-background                # white #ffffff
  border: "1px solid border (border-input #e4e4e7)"
  rounded: rounded-lg              # 8px (border-radius/lg)
  overflow: hidden
  cursor: pointer                  # AC-4 click whole card → open PDF
  hover_bg: bg-muted/30            # subtle hover feedback (drift: design KHÔNG capture, theo pattern share/card)
  selected_border: border-primary  # AC-3 "thẻ đang chọn highlight viền nổi bật" — DEV add cho card được click
  on_click: "openPdf(pdfFile.url)" # AC-4 → AC-5 mở PDF gốc qua signed URL
  children:
    - id: PdfIcon
      type: Image                  # asset SVG PDF (40×40) — image asset master "File Fomat"
      src: "@/assets/file-pdf.svg" # placeholder — Figma export asset; DEV thay path thật
      size: { w: 40, h: 40 }
      flex-grow: 0

    - id: PdfMeta
      type: container
      direction: vertical
      gap: 4
      flex-grow: 1                 # ← chống bug filename bị truncate sát icon
      align: start
      min_width: 0                 # cho word-break filename
      children:
        - id: PdfFilename
          type: Text
          content: "{pdfFile.filename}"   # vd "phieuquyettoan_239239_v3.pdf"
          weight: 400
          size: 14
          line_height: 20
          color: text-foreground          # #18181b
          word_break: break-word
          width: 100%
        - id: PdfSize
          type: Text
          content: "{pdfFile.sizeKb}kb"   # vd "100kb"
          weight: 400
          size: 12
          line_height: 12                 # leading-none (1.0)
          color: text-muted-foreground    # #71717a
          width: 100%

    - id: BadgeExported              # ⚠️ component master có nhưng instance opacity=0 (hidden) trong design hiện tại
      type: Badge                    # → @/components/share/badge — variant=success
      variant: success
      label: "Đã xuất"
      visible_when: false            # design ẩn → DEV KHÔNG render
      flex-grow: 0
      _note: "Component anatomy giữ trong DSL để document Figma master; runtime KHÔNG render (opacity=0). Verify Business Authority nếu muốn show."
```

### §2 Design Token Map

| Token (Figma) | Tailwind class (garage-web) | Hex / value | Khi dùng |
|---|---|---|---|
| `base/card-foreground` | `text-card-foreground` | `#09090b` | SetTitle text (Bộ hồ sơ #SET-...) |
| `base/foreground` | `text-foreground` | `#18181b` | PdfFilename text |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | SetSubtitle + PdfSize text |
| `base/background` | `bg-background` | `#ffffff` | PdfCard background |
| `base/border` | `border-border` (border-input) | `#e4e4e7` | PdfCard border 1px solid |
| `border radius/lg` | `rounded-lg` | `8px` | PdfCard corners |
| `spacing/3` | `gap-3` / `p-3` | `12px` | PdfCard padding + gap children |
| `spacing/4` | `gap-4` | `16px` | row-gap giữa cards trong grid; gap SetHeader↔Grid |
| `spacing/5` | `gap-5` | `20px` | col-gap giữa 2 cột grid |
| `spacing/8` | `gap-8` | `32px` | gap dọc giữa các bộ hồ sơ |
| `spacing/1` | `gap-1` | `4px` | gap SetTitle↔SetSubtitle (vertical) |
| `typography/large/font-size + line-height` | `text-lg leading-7` | `18px / 28px` | SetTitle |
| `typography/small/font-size + line-height` | `text-sm leading-5` | `14px / 20px` | SetSubtitle, PdfFilename |
| `typography/extra-small/font-size` | `text-xs leading-none` | `12px / 1.0` | PdfSize |
| `font/weight/semibold` | `font-semibold` | `600` | SetTitle |
| `font/weight/normal` | `font-normal` | `400` | SetSubtitle, PdfFilename, PdfSize |
| `base/background-success` | `bg-background-success` | `#f0fdf4` | BadgeExported bg (component master only — hidden) |
| `base/foreground-success` | `text-foreground-success` | `#16a34a` | BadgeExported text (hidden) |

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `PdfCard` | default | `bg-background border border-input rounded-lg` | render |
| `PdfCard` | hover | + `bg-muted/30` (subtle) | mouse-enter |
| `PdfCard` | selected | + `border-primary` (2px) hoặc `ring-2 ring-primary` | click — DEV add state cho card đang chọn (AC-3) |
| `PdfCard` | loading (when click → opening PDF) | + `opacity-70 cursor-wait` | AC-4 click chờ signed URL refresh |
| `PdfCard` | error (file mất) | toast `ERR-INS-009` "Không tải được hồ sơ — vui lòng liên hệ quản trị" + re-generate fallback | AC-9 |
| `Tab "Hồ sơ bảo hiểm đã xuất"` | hidden | `display: none` (KHÔNG render tab item) | `settlement.payer !== 'INSURANCE'` (BR-008) |
| `Tab "Hồ sơ bảo hiểm đã xuất"` | active | underline-blue (`border-b-2 border-primary`) | URL `?tab=insurance-dossier` (route param theo TanStack Router pattern) |
| `LoadMoreButton` | visible | `inline-flex` | `hasMore === true` (response meta) |
| `LoadMoreButton` | hidden | `hidden` | `hasMore === false` |
| `LoadMoreButton` | loading | + `disabled cursor-wait` | đang gọi `ListInsuranceDossierSets(offset, limit=5)` |

### §4 Component Prop Map

> Layer priority `customs > share > ui` — tra `.claude/references/web-component-registry.yaml`.

| Component | Layer | Prop | Default | Override (W02-DOSSIER-VIEW) | Lý do |
|---|---|---|---|---|---|
| `Card` (PdfCard wrapper) | share/cards (nếu tồn tại) hoặc compose từ `ui/card` | `padding` | `p-6` | `p-3` (12px) | thẻ list-item nhỏ, không phải content-card |
| `Card` | — | `border` | `border` (1px) | giữ default `border border-input` | spec design 1px #e4e4e7 |
| `Card` | — | `rounded` | `rounded-xl` (12px) | `rounded-lg` (8px) | spec design 8px (border-radius/lg) |
| `Badge` (BadgeExported, hidden) | share/badges hoặc `ui/badge` | `variant` | `default` | `success` | bg #f0fdf4 + text #16a34a — token success |
| `Button` (LoadMoreButton) | share/buttons/button | `variant` | `default` | `outline` | secondary action (paginate) |
| `Button` (LoadMoreButton) | — | `size` | `default` (h-9) | `default` | giữ baseline |
| `SharedEmptyData` (empty state — screen 2) | share/empty-state | `title` | "Không tồn tại bản ghi!" (component default) | `"Chưa có hồ sơ nào được xuất"` per AC-1 / ERR-INS-010 | drift design ↔ AC; theo AC |
| `SharedEmptyData` | — | `subtitle` | "Vui lòng thêm mới bản ghi…" (component default) | override hoặc remove (AC không yêu cầu) | AC-1 chỉ yêu cầu title |
| `SharedEmptyData` | — | `illustration` | empty-box default | giữ default illustration | design dùng box default |

### §5 Field Composition Schema

> ⚠️ Tab này **read-only** (AC-6) — KHÔNG có form field input. §5 NA trừ `LoadMoreButton` (paginate trigger). Schema dưới chỉ document **data binding** (FE consume từ BFF query).

```yaml
data_binding:
  query: ListInsuranceDossierSets
  args:
    settlementId: "{currentSettlement.id}"
    limit: 5                       # EC-1 page size = 5 bộ
    offset: "{paginationState.offset}"  # default 0, increment 5 mỗi lần click "Xem thêm"
  response_shape:
    dossierSets:
      - id: ID
        settlementCode: string     # vd "SET-20260326-00001" — bind SetTitle
        exportedAt: ISO8601        # bind SetSubtitle (format dd/MM/yyyy HH:mm)
        exportedBy: string         # AC không hiển thị; metadata
        pdfCount: int              # bind SetSubtitle (N tài liệu PDF)
        pdfFiles:
          - id: ID
            filename: string       # vd "phieuquyettoan_239239_v3.pdf" — bind PdfFilename
            sizeKb: int            # vd 100 — bind PdfSize ("{n}kb")
            signedUrl: string      # AC-5 mở PDF gốc (KHÔNG re-generate)
            documentType: enum     # PHIEU_QUYET_TOAN | PHIEU_BAO_GIA | BIEN_BAN_NGHIEM_THU | GIAY_UY_QUYEN
    totalCount: int                # AC-7 metadata
    hasMore: boolean               # EC-1 control LoadMoreButton visibility

ordering:
  - bộ mới nhất TRÊN CÙNG (AC-1) — server sort `exportedAt DESC`

action_bindings:
  PdfCard.on_click: "openPdf(pdfFile.signedUrl)"      # AC-4 → AC-5
  LoadMoreButton.on_click: "loadNextPage()"           # increment offset += 5
```

### §6 Layout Width Table

| Container | Max-width | Margin | Align-self | Notes |
|---|---|---|---|---|
| `DossierListTab` (root) | 1216px (inherit Container) | 0 | stretch | width inherit từ Page container 1216 |
| `DossierSetBlock` | FILL (1216px) | 0 | stretch | mỗi block chiếm full width container |
| `SetHeader` | FILL | 0 | start | text-block, không cần align center |
| `PdfGrid` | FILL (1216px) | 0 | stretch | grid 2 cột × 578px + gap 20 + 0 padding = 1216 |
| `PdfCard` (each) | 578px (FILL trong grid col) | 0 | stretch | grid cell w=578 (1216-20)/2 |
| `PdfIcon` | 40px FIXED | 0 | start | size-10 |
| `PdfMeta` | FILL (flex-1) | 0 | start | `min-width: 0` cho word-break filename |
| `BadgeExported` | HUG (auto) | 0 | center | opacity-0 hidden, vẫn nằm trong layout (chiếm 0 space khi không render) |
| `LoadMoreButton` | HUG | center | center | center-align trong list |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Tab "Hồ sơ bảo hiểm đã xuất" (nav item) | text-sm font-medium text-foreground / active border-primary | Section-level navigation (tab thứ 3) |
| L2 | SetTitle "Bộ hồ sơ #SET-..." | text-lg font-semibold text-card-foreground | Group header — 1 lần xuất (versioning unit) |
| L3 | SetSubtitle "Xuất ngày … · N PDF" | text-sm font-normal text-muted-foreground | Metadata phụ trợ group header |
| L4 | PdfCard (container) | bg-background border rounded-lg | Item container — 1 PDF file (clickable surface) |
| L5 | PdfFilename | text-sm font-normal text-foreground | Item primary text — tên file |
| L5 | PdfSize | text-xs font-normal text-muted-foreground | Item secondary text — kích thước |
| L4 (hidden) | BadgeExported "Đã xuất" | text-sm font-medium text-foreground-success bg-background-success | Status indicator — opacity=0 hiện tại |
| L3 | LoadMoreButton "Xem thêm" | outline button-default | Pagination control |

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Root cause | Đúng |
|---|---|---|---|---|
| AP-1 | **Render tab cho phiếu QT Khách hàng** | tab "Hồ sơ BH đã xuất" hiện trên phiếu QT KH → user click → empty + confusion | Quên gate `settlement.payer === 'INSURANCE'` (BR-008) | `tabs.filter(tab => tab.id !== 'insurance-dossier' || settlement.payer === 'INSURANCE')` — gate ở level tabs config, KHÔNG ở level tab content |
| AP-2 | **Hardcode bộ mới nhất ở dưới (server không sort)** | UI hiển thị bộ cũ nhất TRÊN CÙNG | FE assume server return ASC | FE assume server sort DESC theo `exportedAt`; thêm fallback FE sort `[...sets].sort((a,b)=>b.exportedAt-a.exportedAt)` |
| AP-3 | **Render badge "Đã xuất" dù design ẩn** | badge xanh "Đã xuất" hiện trên mỗi card → noise visual | Copy verbatim component master (opacity=0 = vẫn render trong DOM nhưng invisible) → DEV thấy bỏ check opacity → unhide | Bỏ luôn `<Badge>` instance khỏi JSX hoặc set `hidden` rõ ràng — KHÔNG render khi spec ghi `visible_when: false` |
| AP-4 | **PdfFilename truncate vì thiếu `flex-1 min-w-0`** | filename dài bị tràn sang badge / cắt giữa chừng không đẹp | `PdfMeta` thiếu `flex-grow: 1` + `min-width: 0` → word-break không kích hoạt | Apply `flex-1 min-w-0` cho PdfMeta + `break-words` cho PdfFilename |
| AP-5 | **Empty state dùng default text "Không tồn tại bản ghi!"** | tab empty hiển thị câu generic | DEV reuse `<SharedEmptyData>` quên override `title` prop | Override `title="Chưa có hồ sơ nào được xuất"` (AC-1 / ERR-INS-010) |
| AP-6 | **Click action gắn vào filename text thay vì card** | chỉ click trúng text mới mở PDF, click vùng trống card không hoạt động | DEV gắn `onClick` vào `<p>` filename | Gắn `onClick + role="button" + tabIndex=0` vào `PdfCard` container; cả card là clickable surface (AC-4) |
| AP-7 | **Bỏ paginate "Xem thêm" — load all sets** | với phiếu có >50 versions → load chậm | DEV không read EC-1 (paginate 5/lần) | `useInfiniteQuery` hoặc state pagination; chỉ render `LoadMoreButton` khi `hasMore=true` |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator (Claude opus 4.7) đọc PNG TRƯỚC khi emit §0-§8
  screenshot: assets/wave02-ins-dossier-view/13257-481064.png    # AC-8 tab có content (1216×923)
  pngs_read:
    - assets/wave02-ins-dossier-view/13257-481064.png    # AC-8 tab có content (1216×923)
    - assets/wave02-ins-dossier-view/13257-481725.png    # AC-8 tab empty (1216×456)
    - assets/wave02-ins-dossier-view/_full.png           # section overview (1440×… 2 frame)
  claims_verified:
    - claim: "3 bộ hồ sơ stacked dọc, mỗi bộ = title 'Bộ hồ sơ #SET-...' + subtitle 'Xuất ngày … · 4 tài liệu PDF' + grid 2×2 thẻ"
      evidence: "13257-481064.png — đếm trực tiếp: 3 title block, mỗi title theo sau bởi 4 cards trong 2 columns"
    - claim: "PdfCard layout = [PDF icon đỏ 40×40] [filename + size column] — KHÔNG có badge 'Đã xuất' visible"
      evidence: "13257-481064.png — quan sát từng card: chỉ thấy 2 element bên trong (icon + 2-line meta), KHÔNG có badge xanh"
    - claim: "Filename + size 2 dòng riêng: line 1 filename text-sm foreground, line 2 size text-xs muted"
      evidence: "13257-481064.png — 'phieuquyettoan_239239_v3.pdf' đậm hơn '100kb' bên dưới (color contrast khác biệt)"
    - claim: "Empty state = 4-tab bar + opened-box illustration center + title 'Không tồn tại bản ghi!' + subtitle 'Vui lòng thêm mới…' — KHÔNG khớp AC-1 'Chưa có hồ sơ nào được xuất'"
      evidence: "13257-481725.png — text khớp generic SharedEmptyData, không phải custom AC-1 text → flag drift"
    - claim: "Tab active 'Hồ sơ bảo hiểm đã xuất' có underline blue dày + text blue (#0052ff foreground-brand-CD), 3 tab còn lại text muted không underline"
      evidence: "13257-481725.png — tab thứ 3 có gạch chân xanh đậm, 3 tab khác chỉ hover-able text"
  visual_decisions_encoded:
    - "§0 ASCII shows tab bar at top với active 3rd tab, 3 set blocks stacked, last block + Xem thêm placeholder"
    - "§1 PdfGrid direction=grid cols=2 row-gap=16 col-gap=20 — derived from design positions x=0 (col-left) / x=598 (col-right) cho frame 13734:199420 vs 13257:481070"
    - "§3 BadgeExported visible_when=false — derived từ design_context output `opacity-0` trên component instance"
    - "§5 ordering 'bộ mới nhất TRÊN CÙNG' — design screenshot rõ ràng v3 → v2 → v1 thứ tự (semver suffix văn bản)"
```

### §9 Container Hierarchy (legacy — backward compat)

```
Tab Content panel (1216) [vertical]
└── Tab navigation links (1216×56) [horizontal — tab list]
└── AC-8 Tab "Hồ sơ bảo hiểm đã xuất" (1216×923) [vertical, gap=32]
    └── ### Nhóm A — Tab "Hồ sơ bảo hiểm đã xuất" (13257:481065) [vertical]
        └── **AC-2** Khối "Bộ hồ sơ" (cột trái) (13263:57505) [vertical, w-[1176px], gap=24, padding y=28]
            ├── **AC-3** Bộ #1 (13257:481066) [vertical, w-[1176px], gap=20]
            │   ├── title card [vertical, gap=8]
            │   │   ├── Label "Bộ hồ sơ #SET-20260326-00001" (text-lg/600)
            │   │   └── DialogTitle "Xuất ngày 26/03/2026 08:30 · 4 tài liệu PDF" (text-sm/400 muted)
            │   └── Frame grid (13734:199469) [grid cols=2, row-gap=16, col-gap=20]
            │       ├── Column-left (13734:199420) [vertical, w-[578px], x=0]
            │       │   ├── Upload/item #1 (PdfCard "phieuquyettoan_239239_v3.pdf · 100kb")
            │       │   └── Upload/item #2 (PdfCard "bienbannghiemthu_239239_v3.pdf · 100kb")
            │       └── Column-right (13257:481070) [vertical, w-[578px], x=598]
            │           ├── Upload/item #3 (PdfCard "phieubaogia_239239_v3.pdf · 100kb")
            │           └── Upload/item #4 (PdfCard "giayuyquyen_239239_v3.pdf · 100kb")
            ├── **AC-3** Bộ #2 (13257:481074) [same anatomy — v2 files]
            └── **AC-3** Bộ #3 (13257:481081) [same anatomy — v1 files]
```

> **I-25 note**: 2 column (w=578, x=0 và x=598) **overlap dọc** → đúng layout horizontal/grid. Σ widths = 578 + 20 (gap) + 578 = 1176 ≈ container w-1176. Cards bên trong mỗi cột stack dọc.

### PdfCard component detail (Upload / item — 13734:199687)

- Bounds: w=FILL (578px trong grid col) h=HUG (64px khi 2 dòng text)
- Layout-mode: auto-layout (horizontal, gap=12, items=center)
- BG: #ffffff (`bg-background`) | Border: 1px solid #e4e4e7 (`border-input`) radius=`rounded-lg` (8px)
- Overflow: hidden (`overflow-clip`)
- Padding: 12 12 12 12 (`p-3`)
- Children (3):
  - `PdfIcon` (Image 40×40, `shrink-0`) — image asset master "File Fomat"
  - `PdfMeta` (vertical, gap=4, `flex-[1_0_0] min-w-px items-start`):
    - `PdfFilename` Text 14px/400 lh=20px color=#18181b word-break=break-word
    - `PdfSize` Text 12px/400 lh=12px (leading-none) color=#71717a
  - `BadgeExported` (Badge variant=success, opacity=0 → hidden) — bg-[#f0fdf4] text-[#16a34a] text-sm/500 rounded-lg px-2.5 py-0.5 — DEV KHÔNG render

→ shadcn: `<div role="button" tabIndex={0} onClick={() => openPdf(pdf.signedUrl)} className="flex items-center gap-3 p-3 bg-background border border-input rounded-lg hover:bg-muted/30 cursor-pointer">
  <FilePdfIcon className="size-10 shrink-0" />
  <div className="flex flex-col gap-1 flex-1 min-w-0 items-start">
    <p className="text-sm leading-5 text-foreground break-words w-full">{pdf.filename}</p>
    <p className="text-xs leading-none text-muted-foreground w-full">{pdf.sizeKb}kb</p>
  </div>
</div>`

---

## Screen: Tab "Hồ sơ bảo hiểm đã xuất" — state EMPTY (13257:481725)

> Tab content khi `dossierSets.length === 0`. Container `Tab Content` (1216×456) = `Tab navigation links` (1216×56) + `Empty Data` instance (1216×400).
>
> Design dùng `Empty Data` component instance (share/empty-state) — chứa illustration "open-box" + 2 dòng text default. ⚠️ Text default = "Không tồn tại bản ghi!" / "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." — **KHÔNG khớp AC-1** "Chưa có hồ sơ nào được xuất" (ERR-INS-010 EMPTY_STATE 🔵 Thông tin). DEV **override** prop `title` (và optionally remove subtitle).

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Bảng chi phí    Chứng từ & hóa đơn    [Hồ sơ bảo hiểm đã xuất]    Lịch sử thanh toán                │ ← Tab bar (active)
│ ─────────────  ──────────────────  ═══════════════════════════  ──────────────────                    │
│                                                                                                       │
│                                                                                                       │
│                                                                                                       │
│                                  ┌──────────────────────┐                                             │
│                                  │     [ open-box       │  ← illustration center (120×120)            │
│                                  │       illustration ] │                                             │
│                                  └──────────────────────┘                                             │
│                                                                                                       │
│                          Chưa có hồ sơ nào được xuất                                                  │ ← AC-1 / ERR-INS-010 (override)
│                          (subtitle optional — AC không yêu cầu)                                       │
│                                                                                                       │
│                                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
   ↑ panel w=1216, h=400, content centered vertically + horizontally
```

### §1 Layout DSL

```yaml
DossierEmptyTab:
  type: container
  direction: vertical
  justify: center
  align: center
  flex-grow: 1
  min_height: 400                  # = component Empty Data default height
  bg: bg-transparent
  children:
    - id: EmptyState
      type: SharedEmptyData         # → @/components/share/empty-state (verify lookup key trong registry)
      title: "Chưa có hồ sơ nào được xuất"   # AC-1 / ERR-INS-010 override
      subtitle: null                # AC không yêu cầu — verify BA; if drop component requires non-null, dùng ""
      illustration: "open-box"      # default — share component
      flex-grow: 0
```

### §2 Design Token Map

Reuse §2 từ Screen 1 (text-foreground / text-muted-foreground / spacing). Không có token unique.

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `DossierEmptyTab` | rendered | `flex flex-col justify-center items-center min-h-[400px]` | `dossierSets.length === 0` |
| `DossierEmptyTab` | NOT rendered | — | `dossierSets.length > 0` (switch sang Screen 1 layout) |

### §4 Component Prop Map

Đã spec ở Screen 1 §4 (`SharedEmptyData`). Lặp ngắn:

| Component | Prop | Override | Lý do |
|---|---|---|---|
| `SharedEmptyData` | `title` | `"Chưa có hồ sơ nào được xuất"` | AC-1 / ERR-INS-010 |
| `SharedEmptyData` | `subtitle` | drop / `""` | AC chỉ yêu cầu title |
| `SharedEmptyData` | `illustration` | giữ default open-box | design dùng default |

### §5 Field Composition Schema

NA — chỉ render empty state, không có data binding ngoài check `dossierSets.length === 0`.

### §6 Layout Width Table

| Container | Max-width | Margin | Align-self | Notes |
|---|---|---|---|---|
| `DossierEmptyTab` (root) | 1216 (FILL panel) | 0 | stretch | min-h-[400px] để illustration không sát top |
| `EmptyState` (SharedEmptyData) | HUG (auto) | center | center | center cả ngang dọc |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Tab "Hồ sơ bảo hiểm đã xuất" (active) | text-sm font-medium text-foreground / border-primary | Section nav (tab thứ 3) |
| L2 | EmptyState illustration | `share/empty-state` open-box default | Visual cue empty |
| L3 | EmptyState title | text-lg/font-semibold text-foreground | Primary message (override "Chưa có hồ sơ nào được xuất") |
| L4 | EmptyState subtitle (optional) | text-sm text-muted-foreground | Phụ trợ — bỏ trong scope này |

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Root cause | Đúng |
|---|---|---|---|---|
| AP-E1 | **Render empty state với text default Figma "Không tồn tại bản ghi!"** | UX không khớp AC | DEV copy `<EmptyData />` verbatim, không override `title` | Override `title="Chưa có hồ sơ nào được xuất"` per AC-1 |
| AP-E2 | **Render cả empty state + loading skeleton song song** | flicker khi data fetching | Thiếu check `isLoading` trước khi check `length === 0` | `if (isLoading) <Skeleton /> else if (sets.length === 0) <Empty /> else <List />` |
| AP-E3 | **Subtitle dài "Vui lòng thêm mới bản ghi…" đè lên CTA** | confuse user (tab read-only, không có CTA thêm mới ở đây) | Giữ default subtitle | Bỏ subtitle hoặc set `subtitle=""` — AC-1 không yêu cầu CTA inline (CTA "+ Tạo hồ sơ bảo hiểm" nằm ở header phiếu QT BH per FEAT-INS-DOSSIER-CREATE) |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-view/13257-481725.png   # AC-8 empty (1216×456)
  pngs_read:
    - assets/wave02-ins-dossier-view/13257-481725.png   # AC-8 empty (1216×456)
  claims_verified:
    - claim: "Tab bar 4 items, 'Hồ sơ bảo hiểm đã xuất' active (underline blue)"
      evidence: "13257-481725.png — tab thứ 3 highlighted với border-bottom xanh"
    - claim: "Center của panel hiển thị illustration open-box màu xanh nhạt + 2 dòng text (title đậm + subtitle nhạt)"
      evidence: "13257-481725.png — quan sát illustration ở center, text 'Không tồn tại bản ghi!' bold center, 'Vui lòng thêm mới…' subtitle below"
    - claim: "Text default không khớp AC-1 → DEV override title"
      evidence: "AC-1 specifies 'Chưa có hồ sơ nào được xuất' (ERR-INS-010); design renders generic SharedEmptyData default"
```

### §9 Container Hierarchy (legacy)

```
Tab Content panel (1216×456) [vertical]
├── Tab navigation links (1216×56) [horizontal tab list — active=Hồ sơ BH đã xuất]
└── Empty Data instance (1216×400) [centered]
    ├── Icon slot (120×120) — illustration open-box
    └── Content (1168×52) [vertical, centered]
        ├── Text "Không tồn tại bản ghi!" (1168×28) — DEV override → "Chưa có hồ sơ nào được xuất"
        └── Text "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." (1168×20) — DEV drop/empty
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-dossier-view/_full.png` | section 13257:480151 | Overview 2 frames (with-content + empty) cạnh nhau |
| `assets/wave02-ins-dossier-view/13257-481064.png` | tab content with 3 dossier sets | AC-1/AC-2/AC-3/AC-7 evidence — grid 2-col, 3 versioned sets |
| `assets/wave02-ins-dossier-view/13257-481725.png` | tab content empty state | AC-1 evidence — empty + tab bar active |
