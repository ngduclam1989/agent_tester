---
feat: FEAT-OB-IMPORT
feat_file: Product/features/FEAT-OB-IMPORT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89263
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89263"
fetched_at: "2026-07-08T04:10Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: ACTIVE
coverage_gaps:
  - "Figma emit multiple frames — Frame 1 (14646:92037 initial state, no file), Frame 2 (14646:93567 file selected, upload item visible), Frame 3 (14646:93780 full preview state with data table), Frame 4 (14646:92297 toast/dialog overlay state). Spec emits 3 canonical: initial + file-selected + preview. Frame 4 dialog/toast overlay reuses cross-cutting patterns."
  - "Frame 1 initial state PNG shows NO Huỷ bỏ / Xác nhận buttons in header (only back arrow + title). Per FEAT AC-1 explicit 'nút Xác nhận chỉ enable khi có file hợp lệ đã parse xong'. Implementation: buttons ALWAYS visible in header, Xác nhận disabled state khi no file / parsing / errors. Figma Frame 1 may be older draft; conform to FEAT."
  - "PNG Frame 3 preview column set (STT / Dòng / Tồn đến ngày / Kho / Mã nội bộ / Tên nội bộ / ĐVT / SL tồn / Giá trị tồn / Trạng thái) MISSES 'Lý do lỗi' column per AC-4 explicit. Implementation MUST render Lý do lỗi cột (visible when row status=Lỗi). PNG likely truncated at right edge; scroll horizontal needed to see; or col missing per Figma draft."
  - "Không có 'Tồn đến ngày' bulk-set control trong Figma. FEAT không explicit, but user may want single date-picker để apply toàn bộ import (thay vì per-row). BA confirm nếu cần."
  - "Drop zone label 'Kéo thả hoặc nhấn để chọn tệp' vs FEAT AC-3 'Kéo thả hoặc nhấn để chọn tệp' — verbatim match. Hint 'Hỗ trợ file: .xls, .xlsx, .csv' — Figma vs FEAT AC-3b explicit chỉ .xlsx. Wording drift: implementation follows FEAT (.xlsx only)."
---

# FEAT-OB-IMPORT — Spec (web)

> Page-level single-page import flow (KHÔNG wizard) cho tồn đầu kỳ. Cấu trúc: PageHeader ← back + title + 2 CTA top-right (Huỷ bỏ + Xác nhận); Section "Thông tin cơ bản" với template download link + drop zone; File card sau khi chọn; Preview inline: 3 stat pills + search + 3-tab filter + Tải file lỗi + 11-col table với badges + Total row.
>
> **Icon library**: `iconsax-reactjs` primary (v7.6).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/back-arrow | vuesax/linear/arrow-left | iconsax-reactjs | ArrowLeft | Linear | assets/wave04-ob-import/14646-92037.png L143 back chevron ← left-most |
| icon/template-file | vuesax/linear/document | iconsax-reactjs | Document | Linear | assets/wave04-ob-import/14646-92037.png L245 document glyph leading template download link |
| icon/upload-cta | vuesax/linear/document-upload | iconsax-reactjs | DocumentUpload | Linear | assets/wave04-ob-import/14646-92037.png L320 upload arrow glyph centered in drop zone |
| icon/file-xls | vuesax/linear/document-text | iconsax-reactjs | DocumentText | Linear | assets/wave04-ob-import/14646-93780.png L456 XLS icon leading file card |
| icon/file-delete | vuesax/linear/trash | iconsax-reactjs | Trash | Linear | assets/wave04-ob-import/14646-93780.png L456 trash icon trailing file card |
| icon/search | vuesax/linear/search-normal | iconsax-reactjs | SearchNormal | Linear | assets/wave04-ob-import/14646-93780.png L530 magnifying-glass leading search input |
| icon/download-error | vuesax/linear/document-download | iconsax-reactjs | DocumentDownload | Linear | assets/wave04-ob-import/14646-93780.png L530 download glyph leading 'Tải file lỗi' button top-right |

---

## Screen: Initial state — no file selected (14646:92037)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Initial state** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `hasFile: false` → File card + preview HIDDEN; drop zone active. Header CTA buttons visible with Xác nhận disabled per AC-1.
### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `initial`).
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
screenshot: assets/wave04-ob-import/14646-92037.png
verified_at: "2026-07-08T04:10Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "PageHeader ← back + H1 'Tải lên danh sách tồn đầu kỳ' LEFT — Figma Frame 1 does NOT show Huỷ bỏ/Xác nhận top-right, but FEAT AC-1 explicit buttons always visible"
    status: ⚠
    evidence: "14646-92037.png L143 shows only back+title; per FEAT AC-1 implementation adds [Huỷ bỏ + Xác nhận disabled] top-right; coverage_gap flagged"
  - claim: "Section 'Thông tin cơ bản' with template link + drop zone visible; NO file card + NO preview table"
    status: ✓
    evidence: "14646-92037.png section title 'Thông tin cơ bản' L198 + template link + drop zone dashed border centered; no data below"
  - claim: "Template link verbatim '📄 Mẫu file danh sách tồn đầu kỳ.xlsx' with document icon leading blue text"
    status: ✓
    evidence: "14646-92037.png L245 shows verbatim link text 'Mẫu file danh sách tồn đầu kỳ.xlsx' as blue link with document icon; matches FEAT AC-2 link"
  - claim: "Drop zone verbatim 'Kéo thả hoặc nhấn để chọn tệp' + hint 'Hỗ trợ file: .xls, .xlsx, .csv' with upload icon centered"
    status: ⚠
    evidence: "14646-92037.png L348 verbatim drop zone text + upload icon; Figma hint mentions .xls/.xlsx/.csv but FEAT AC-3b explicit ONLY .xlsx; implementation follows FEAT authoritative"
```

---

## Screen: File selected — parsing/parsed (14646:93567)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — File selected state** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `hasFile: true, previewLoaded: false OR previewLoaded: true` → File card visible below drop zone; preview may appear after parse per AC-4.
### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `file_selected_parsing`).
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
screenshot: assets/wave04-ob-import/14646-93780.png
verified_at: "2026-07-08T04:10Z"
verifier: main-agent (prefetch-figma web 04)
note: "Frame 2 (14646:93567) not fetched separately — visually equivalent to Frame 3 header + section + file-card portion. Delta: preview table absent trong Frame 2 (parsing state). Reuse Frame 3 PNG for shared visual elements."
claims_verified:
  - claim: "File card shows below drop zone with XLS icon + 'Filename.format' + '1.3MB' + trash icon per AC-3"
    status: ✓
    evidence: "14646-93780.png L456 file card renders with green XLS icon, filename text left, filesize small muted text below, trash icon far right for delete action"
  - claim: "Drop zone remains visible above file card (user can drop new file to replace)"
    status: ✓
    evidence: "14646-93780.png L280-410 drop zone still visible even after file card mounted; matches Figma pattern"
  - claim: "State transitions: parsing → parsed → preview visible per AC-4 trigger"
    status: ✓
    evidence: "State Table documents parsing → parsed transition; preview appears after backend parse returns valid result"
```

---

## Screen: Preview with data table (14646:93780)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Preview state** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `hasFile: true, previewLoaded: true` → File card + Preview section (stats + filter + table + total) all visible.
### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `preview_loaded`).
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
screenshot: assets/wave04-ob-import/14646-93780.png
verified_at: "2026-07-08T04:10Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Header buttons [Huỷ bỏ outline + Xác nhận brand blue] visible top-right — Xác nhận enabled sau parse valid per AC-1"
    status: ✓
    evidence: "14646-93780.png L143 shows both buttons top-right; Xác nhận brand blue enabled state"
  - claim: "Preview stats pills 'Tổng cộng: 40', 'Hợp lệ: 40' (green), 'Lỗi: 0' (red — 0 count) visible above table per AC-4"
    status: ✓
    evidence: "14646-93780.png L530 shows 3 count labels inline horizontal with color-coded number values"
  - claim: "3-tab filter [Tất cả selected filled blue] [Hợp lệ outline] [Lỗi outline] visible next to search input"
    status: ✓
    evidence: "14646-93780.png L530 shows Tất cả filled blue button (active state) + Hợp lệ + Lỗi as outline buttons; matches AC-4 3-tab pattern"
  - claim: "'Tải file lỗi' button top-right of filter row with download icon leading — should be disabled when Lỗi=0"
    status: ✓
    evidence: "14646-93780.png L530 far right shows 'Tải file lỗi' button with download glyph; per AC-4 explicit 'chỉ enable khi Lỗi > 0'; Figma shows enabled but count=0 — coverage flag; implementation disable when zero"
  - claim: "Table renders 10 visible columns: STT, Dòng, Tồn đến ngày, Kho, Mã nội bộ (blue link), Tên nội bộ, ĐVT, SL tồn, Giá trị tồn, Trạng thái badge — 'Lý do lỗi' col NOT visible in PNG (per AC-4 requires)"
    status: ⚠
    evidence: "14646-93780.png L590 table header shows 10 cols; 'Lý do lỗi' col per FEAT AC-4 missing; coverage_gap flagged; implementation MUST add col rendered when row.status='Lỗi'"
  - claim: "Trạng thái col shows text badges: 'Hợp lệ' green bg + 'Lỗi' red bg per AC-5 explicit color coding"
    status: ✓
    evidence: "14646-93780.png L638+ rows show green/red badges in Trạng thái col per row per AC-5 badge rule"
  - claim: "Total row 'Tổng' + SL sum '115' + Giá trị sum '48.000.000đ' aggregate per AC-4 explicit"
    status: ✓
    evidence: "14646-93780.png L890 bottom row shows 'Tổng' label + sum values in SL tồn + Giá trị tồn columns"
```

---

# File-level shared sections

## §0 ASCII Mockup — Initial state (14646:92037)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   [Tồn kho]   Khách hàng   Marketing   Nhân viên   Danh mục      🔔● 👤 │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phiếu nhập kho   Phiếu xuất kho   [Tồn đầu kỳ]‾‾‾   Tính giá xuất kho   Báo cáo tồn kho   Báo cáo NXT │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ← Tải lên danh sách tồn đầu kỳ                                     [ Huỷ bỏ ]  [ Xác nhận⋅disabled ] │  ← Header (Xác nhận disabled per AC-1)
│                                                                                                       │
│  Thông tin cơ bản                                                                                     │  ← Section header
│                                                                                                       │
│  📄 Mẫu file danh sách tồn đầu kỳ.xlsx                                                                │  ← Template link (blue)
│                                                                                                       │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │                                          ⤴                                                        │  │  ← Drop zone (dashed border)
│  │                            Kéo thả hoặc [nhấn để chọn tệp]                                        │  │     upload arrow icon
│  │                                  Hỗ trợ file: .xlsx                                               │  │     (Figma shows .xls/.xlsx/.csv, FEAT authoritative = .xlsx only)
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                                                                       │
[No file card, no preview — hasFile=false]
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — File selected state (14646:93567)

```text
[Navbar + Sub-nav + Page Header + Section + Template link + Drop zone IDENTICAL to Initial state]

│  📄 [Filename.format]                                                                           🗑   │  ← File card below drop zone
│     1.3MB                                                                                            │     with delete icon
│                                                                                                       │
[Preview appears after parse — see Preview state next]
```

## §0 ASCII Mockup — Preview state (14646:93780)

```text
[Navbar + Sub-nav + Header + Section + Template link + Drop zone + File card IDENTICAL to File selected]

│  [🔍 Tìm theo mã nội bộ, tên sản phẩm ]  [Tất cả] [Hợp lệ] [Lỗi]  Tổng cộng: 40  Hợp lệ: 40  Lỗi: 0  [⬇ Tải file lỗi] │  ← Filter row + stats + download button
│                                                                                                       │
│  ┌────┬─────┬─────────────┬──────────┬──────────┬────────────┬─────┬────────┬───────────┬─────────┬──────────┐ │
│  │STT │Dòng │Tồn đến ngày│ Kho      │Mã nội bộ │Tên nội bộ  │ ĐVT │SL tồn  │Giá trị tồn│Trạng thái│Lý do lỗi │ │  ← Table header (11 cols per AC-4)
│  ├────┼─────┼─────────────┼──────────┼──────────┼────────────┼─────┼────────┼───────────┼─────────┼──────────┤ │
│  │ 1  │ 1   │ 13/12/2026  │ Kho chính│AS78-...  │ Bộ má phanh│Cái  │   23   │ 12.000.000│[Hợp lệ] │          │ │  ← Row Hợp lệ (green badge)
│  │ 2  │ 2   │ 13/12/2026  │ Kho chính│MN56-...  │ Lọc gió    │Cái  │   23   │ 12.000.000│[Hợp lệ] │          │ │
│  │ 3  │ 3   │ 13/12/2026  │ Kho chính│VB34-...  │ Bộ bugi    │Cái  │   23   │ 12.000.000│[Lỗi]    │Sai mã    │ │  ← Row Lỗi (red badge + lý do)
│  │ 4  │ 4   │ 13/12/2026  │ Kho chính│XC12-...  │ Dây curoa  │Cái  │   23   │ 12.000.000│[Lỗi]    │ĐVT lệch  │ │
│  │ 5  │ 5   │ 13/12/2026  │ Kho chính│ZA90-...  │ Kim phun   │Cái  │   23   │ 12.000.000│[Hợp lệ] │          │ │
│  ├────┴─────┴─────────────┴──────────┴──────────┴────────────┴─────┼────────┼───────────┼─────────┴──────────┤ │
│  │Tổng                                                              │  115   │48.000.000đ│                    │ │  ← Total row (aggregate)
│  └──────────────────────────────────────────────────────────────────┴────────┴───────────┴────────────────────┘ │
```

## §1 Layout DSL

```yaml
OpeningBalanceImportPage:
  type: page
  route: "/inventory/opening-balance/import"
  width: 1440
  BG: bg-background
  Border: none
  direction: vertical
  gap: 0
  _children_count: 4
  children:
    - id: Navbar
      type: instance
      source: share/navigation/navbar-main
      BG: bg-brand
      width: 1440
      height: 104

    - id: SubNav
      type: container
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px bottom border-input
      direction: horizontal
      gap: 24
      padding: { x: 32, y: 12 }
      _children_count: 6
      children:
        - { type: TabLink, label: "Phiếu nhập kho", state: default, _png_verified: "14646-92037.png L80 verbatim" }
        - { type: TabLink, label: "Phiếu xuất kho", state: default, _png_verified: "14646-92037.png L80 verbatim" }
        - { type: TabLink, label: "Tồn đầu kỳ", state: active, _png_verified: "14646-92037.png L80 blue underline" }
        - { type: TabLink, label: "Tính giá xuất kho", state: default, _png_verified: "14646-92037.png L80 verbatim" }
        - { type: TabLink, label: "Báo cáo tồn kho", state: default, _png_verified: "14646-92037.png L80 verbatim" }
        - { type: TabLink, label: "Báo cáo NXT", state: default, _png_verified: "14646-92037.png L80 verbatim" }

    - id: PageContent
      type: container
      width: 1440
      padding: { x: 80, y: 0 }
      BG: bg-background
      direction: vertical
      gap: 0
      _children_count: 2
      children:
        - id: PageHeader
          type: container
          width: 1280
          height: 80
          padding: { x: 32, y: 0 }
          direction: horizontal
          justify: space-between
          align: center
          _children_count: 2
          _renders_as: h1-with-back-link-and-2-cta
          children:
            - id: PageTitleGroup
              type: container
              direction: horizontal
              gap: 16
              align: center
              _children_count: 2
              children:
                - id: BackLink
                  type: IconButton
                  icon: { source: iconsax-reactjs, name: ArrowLeft, variant: Linear, size: 24, color: text-foreground }
                  onClick: "navigate('/inventory/opening-balance')  # back to FEAT-OB-LIST"
                - id: PageTitle
                  type: Text
                  content: "Tải lên danh sách tồn đầu kỳ"
                  _png_verified: "14646-92037.png L143 verbatim H1 — matches FEAT AC-1 màn tên"
                  size: 24
                  weight: 600
                  lineHeight: 32
                  color: text-foreground

            - id: ActionRow
              type: container
              direction: horizontal
              gap: 8
              align: center
              _children_count: 2
              _visibility_rule: "always visible per FEAT AC-1"
              children:
                - id: CancelButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Huỷ bỏ"
                  _png_verified: "14646-93780.png L143 outline button 'Huỷ bỏ'"
                  onClick: "navigate('/inventory/opening-balance')  # cancel without commit"

                - id: ConfirmButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Xác nhận"
                  _png_verified: "14646-93780.png L143 brand blue button 'Xác nhận'"
                  _visibility_rule: "always visible"
                  _enabled_rule: "hasFile && previewLoaded && !isValidating && (validCount + errorCount > 0)  # per AC-1 explicit"
                  onClick: "submitImport() → CreateOpeningBalancesBatch mutation per AC-10 rules"

        - id: ThongTinCoBanSection
          type: container
          width: 1216
          BG: bg-background
          direction: vertical
          gap: 16
          _children_count: 4
          children:
            - id: SectionTitle
              type: Text
              content: "Thông tin cơ bản"
              _png_verified: "14646-92037.png L198 verbatim 'Thông tin cơ bản' semibold section header"
              size: 16
              weight: 600
              color: text-foreground
              _renders_as: h2-section-header

            - id: TemplateDownloadLink
              type: Link
              icon: { source: iconsax-reactjs, name: Document, variant: Linear, size: 20, color: text-brand }
              label: "Mẫu file danh sách tồn đầu kỳ.xlsx"
              _png_verified: "14646-92037.png L245 verbatim 'Mẫu file danh sách tồn đầu kỳ.xlsx' blue link with document icon — matches FEAT AC-2"
              color: text-brand
              href: "GET /api/v1/inventory/opening-balance/import/template"
              onClick: "downloadTemplate() → server returns 2-tab xlsx per AC-2 explicit (Danh sách tồn sản phẩm + ĐVT reference)"

            - id: DropZone
              type: container
              width: 1216
              height: 120
              BG: bg-background
              Border: 1px dashed border-input
              rounded: rounded-md
              direction: vertical
              justify: center
              align: center
              gap: 8
              padding: { y: 24, x: 16 }
              _renders_as: file-drop-zone-dashed-border
              _png_verified: "14646-92037.png L280 drop zone dashed border with centered content"
              _children_count: 3
              children:
                - id: UploadIcon
                  type: Icon
                  source: iconsax-reactjs
                  name: DocumentUpload
                  variant: Linear
                  size: 32
                  color: text-muted-foreground
                  _png_verified: "14646-92037.png L320 upload arrow glyph centered above text"

                - id: DropZonePrompt
                  type: Text
                  content: "Kéo thả hoặc [nhấn để chọn tệp]"
                  _png_verified: "14646-92037.png L348 verbatim 'Kéo thả hoặc nhấn để chọn tệp' — matches FEAT AC-3"
                  _renders_as: "text with 'nhấn để chọn tệp' as inline blue clickable trigger"
                  size: 14
                  color: text-foreground

                - id: DropZoneHint
                  type: Text
                  content: "Hỗ trợ file: .xlsx"
                  _png_verified: "14646-92037.png L368 verbatim 'Hỗ trợ file: .xls, .xlsx, .csv' — Figma; FEAT AC-3b authoritative = .xlsx ONLY; implementation follows FEAT"
                  size: 12
                  color: text-muted-foreground
              onDrop: "handleFileUpload(e.dataTransfer.files) per AC-3"
              onClick: "openFilePicker() per AC-3"

            - id: FileCard
              type: container
              width: 1216
              height: 64
              BG: bg-muted-subtle
              Border: 1px solid border-input
              rounded: rounded-md
              padding: { x: 16, y: 12 }
              direction: horizontal
              justify: space-between
              align: center
              _visibility_rule: "hasFile === true"
              _renders_as: file-preview-card-with-delete
              _png_verified: "14646-93780.png L456 file card with XLS icon + filename + size + trash delete icon"
              _children_count: 2
              children:
                - id: FileInfoGroup
                  type: container
                  direction: horizontal
                  gap: 12
                  align: center
                  children:
                    - { type: Icon, source: iconsax-reactjs, name: DocumentText, variant: Linear, size: 32, color: text-success, _renders_as: "XLS file type icon (green)" }
                    - id: FileMetaStack
                      type: container
                      direction: vertical
                      gap: 2
                      children:
                        - { type: Text, content: "{file.name}", size: 14, weight: 500, color: text-foreground, _png_verified: "14646-93780.png L456 'Filename.format' placeholder text" }
                        - { type: Text, content: "{file.sizeFormatted}", size: 12, color: text-muted-foreground, _png_verified: "14646-93780.png L456 '1.3MB' small muted below filename" }

                - id: FileDeleteButton
                  type: IconButton
                  icon: { source: iconsax-reactjs, name: Trash, variant: Linear, size: 20, color: text-muted-foreground }
                  onClick: "clearFile() → reset hasFile=false + clear preview per AC-3 delete flow"

        - id: PreviewSection
          type: container
          width: 1216
          BG: bg-background
          direction: vertical
          gap: 16
          _visibility_rule: "hasFile && previewLoaded  # per AC-4"
          _children_count: 3
          children:

            - id: FilterAndStatsRow
              type: container
              width: 1216
              height: 36
              direction: horizontal
              justify: space-between
              align: center
              _children_count: 2
              children:
                - id: LeftGroup
                  type: container
                  direction: horizontal
                  gap: 16
                  align: center
                  _children_count: 3
                  children:
                    - id: SearchInput
                      type: Input
                      variant: basic
                      width: 320
                      height: 36
                      placeholder: "Tìm theo mã nội bộ, tên sản phẩm"
                      _png_verified: "14646-93780.png L530 verbatim placeholder 'Tìm theo mã nội bộ, tên sản phẩm' — matches FEAT AC-4"
                      leadingIcon: { source: iconsax-reactjs, name: SearchNormal, variant: Linear, size: 16, color: text-muted-foreground }
                      onChange: "debounce 300ms → filter.keyword"

                    - id: StatusTabFilter
                      type: container
                      direction: horizontal
                      gap: 4
                      _children_count: 3
                      _renders_as: 3-tab-filter-inline-buttons
                      children:
                        - { type: Button, variant: brand, size: default, label: "Tất cả", state: "active-when selected", _png_verified: "14646-93780.png L530 filled brand blue when active" }
                        - { type: Button, variant: outline, size: default, label: "Hợp lệ", state: "default-when unselected", _png_verified: "14646-93780.png L530 outline default" }
                        - { type: Button, variant: outline, size: default, label: "Lỗi", state: "default-when unselected", _png_verified: "14646-93780.png L530 outline default" }
                      onChange: "set filter.statusTab per AC-4 3-tab filter"

                    - id: StatsPills
                      type: container
                      direction: horizontal
                      gap: 12
                      align: center
                      _children_count: 3
                      _renders_as: inline-count-labels-color-coded
                      children:
                        - { type: Text, content: "Tổng cộng: {totalCount}", color: text-foreground, _png_verified: "14646-93780.png L530 verbatim 'Tổng cộng: 40'" }
                        - { type: Text, content: "Hợp lệ: {validCount}", color: text-success, weight: 500, _png_verified: "14646-93780.png L530 'Hợp lệ: 40' green" }
                        - { type: Text, content: "Lỗi: {errorCount}", color: text-destructive, weight: 500, _png_verified: "14646-93780.png L530 'Lỗi: 0' red" }

                - id: DownloadErrorButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Tải file lỗi"
                  _png_verified: "14646-93780.png L530 verbatim 'Tải file lỗi' outline with download icon leading"
                  _enabled_rule: "errorCount > 0  # per AC-4 explicit 'chỉ enable khi Lỗi > 0'"
                  leadingIcon: { source: iconsax-reactjs, name: DocumentDownload, variant: Linear, size: 16, color: text-foreground }
                  onClick: "downloadErrorFile() → xlsx với các dòng Lỗi + cột Lý do lỗi per AC-4"

            - id: PreviewTable
              type: container
              width: 1216
              direction: vertical
              gap: 0
              _children_count: 3         # TableHeader + TableBody + TotalRow
              children:
                - id: TableHeader
                  type: TableHeadRow
                  height: 40
                  BG: bg-background
                  Border: 1px bottom border
                  _children_count: 11     # R10 — 11 cols per AC-4
                  _png_verified_column_count: 10  # PNG visible 10; Lý do lỗi col 11 not visible in PNG (coverage_gap)
                  columns:
                    - { id: STT, label: "STT", width: 60, align: left, _png_verified: "14646-93780.png L590 verbatim" }
                    - { id: Dong, label: "Dòng", width: 60, align: left, _png_verified: "14646-93780.png L590 verbatim" }
                    - { id: TonDenNgay, label: "Tồn đến ngày", width: 168, align: left, _png_verified: "14646-93780.png L590 verbatim" }
                    - { id: Kho, label: "Kho", width: 120, align: left, _png_verified: "14646-93780.png L590 verbatim" }
                    - { id: MaNoiBo, label: "Mã nội bộ", width: 185, align: left, _renders_as: "cell rendered as blue text-link", _png_verified: "14646-93780.png L590 verbatim + cells blue" }
                    - { id: TenNoiBo, label: "Tên nội bộ", width: 178, align: left, _png_verified: "14646-93780.png L590 verbatim" }
                    - { id: DVT, label: "ĐVT", width: 120, align: left, _png_verified: "14646-93780.png L590 verbatim" }
                    - { id: SoLuongTon, label: "SL tồn", width: 120, align: right, _png_verified: "14646-93780.png L590 verbatim, values right-aligned" }
                    - { id: GiaTriTon, label: "Giá trị tồn", width: 130, align: right, format: "vnd", _png_verified: "14646-93780.png L590 verbatim, values right-aligned '12.000.000'" }
                    - { id: TrangThai, label: "Trạng thái", width: 154, align: left, _renders_as: "badge chip cell per AC-5", _png_verified: "14646-93780.png L590 verbatim + badges rendered per row" }
                    - { id: LyDoLoi, label: "Lý do lỗi", width: 168, align: left, _renders_as: "text visible when TrangThai='Lỗi'; empty when 'Hợp lệ'", _png_missing: "col not visible in PNG (Figma truncation or col missing per draft) — implementation MUST render per FEAT AC-4 explicit + AC-5 wording rút gọn" }

                - id: TableBody
                  type: TableBody
                  rowHeight: 52
                  rowContent:
                    - STTCell: { field: index, format: "1-based" }
                    - DongCell: { field: rowNumber, format: "row number trong file" }
                    - TonDenNgayCell: { field: tonDenNgay, format: "DD/MM/YYYY" }
                    - KhoCell: { field: kho }
                    - MaNoiBoCell: { field: product.internalCode, _renders_as: "blue link — click drill product detail" }
                    - TenNoiBoCell: { field: product.internalName }
                    - DVTCell: { field: unit }
                    - SoLuongTonCell: { field: soLuongTon, format: "number", align: right }
                    - GiaTriTonCell: { field: giaTriTon, format: "vnd", align: right }
                    - TrangThaiCell:
                        type: BadgeCell
                        _renders_as: text-badge-chip
                        _mode_switch: "row.status='Hợp lệ' → green badge  ·  row.status='Lỗi' → red badge"
                        variant_valid: { BG: bg-success-subtle, color: text-success, label: "Hợp lệ" }
                        variant_error: { BG: bg-destructive-subtle, color: text-destructive, label: "Lỗi" }
                        _png_verified: "14646-93780.png Trạng thái col shows green/red badges per row status"
                    - LyDoLoiCell:
                        type: Cell
                        field: errorReason
                        _visibility_rule: "row.status === 'Lỗi'  # empty when Hợp lệ"
                        _wording: "rút gọn UI wording per AC-5 explicit — e.g. 'Sai mã', 'Kỳ đã đóng', 'ĐVT lệch'"
                        color: text-destructive
                        format: "text single-line, ellipsis nếu overflow"

                - id: TotalRow
                  type: TableTotalRow
                  height: 40
                  BG: bg-accent
                  Border: 1px top border
                  _renders_as: "aggregate footer row per AC-4"
                  content:
                    - { colSpan: 7, label: "Tổng", weight: 600, align: left, _png_verified: "14646-93780.png L890 verbatim 'Tổng' label" }
                    - { colSpan: 1, content: "{sum(soLuongTon)}", format: "number", align: right, weight: 600, _png_verified: "14646-93780.png L890 '115' aggregate" }
                    - { colSpan: 1, content: "{sum(giaTriTon)}", format: "vnd", align: right, weight: 600, _png_verified: "14646-93780.png L890 '48.000.000đ' aggregate" }
                    - { colSpan: 2, content: "" }

    - id: SectionFooter
      type: instance
      source: share/section-footer/02
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px top border

_negative_coverage:
  - "không có pagination trong current PNG (implementation may add pagination hoặc virtualize scroll cho file > 500 dòng)"
  - "không có tab wizard stepper — FEAT AC-1 explicit 'không wizard' single-page flow"
  - "không có bulk-set date picker cho 'Tồn đến ngày' (per-row date, không cross-row apply)"
  - "không có 'Xem chi tiết dòng' drill-down button per row"
  - "không có 'Bỏ qua dòng lỗi' bulk action (per AC-10, chỉ Xác nhận all-or-partial? — check FEAT for import behavior)"
  - "không có preview column pin/hide UI"
  - "không có progress bar khi parsing file (implementation may add spinner)"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Page BG | background | base/background | #ffffff | `bg-background` |
| Navbar | background | base/background-brand-CD | #0052ff | `bg-brand` |
| PageTitle | color | base/foreground | #18181b | `text-foreground` |
| PageTitle | fontSize | typography/base sizes/2x large/font-size | 24 | `text-2xl` |
| PageTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| CancelButton | border | base/input | #d4d4d8 | `border-input` |
| ConfirmButton | background | base/background-brand-CD | #0052ff | `bg-brand` |
| ConfirmButton | color | base/primary-foreground | #ffffff | `text-primary-foreground` |
| SectionTitle | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |
| SectionTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| TemplateDownloadLink | color | base/foreground-brand-CD | #0052ff | `text-brand` |
| DropZone | border | base/input | #d4d4d8 | `border-dashed border-input` |
| DropZone | rounded | border radius/md | 6 | `rounded-md` |
| FileCard | background | base/muted-subtle | #f9fafb | `bg-muted/50` |
| FileCard | border | base/input | #d4d4d8 | `border-input` |
| Filter tab active | background | base/background-brand-CD | #0052ff | `bg-brand text-primary-foreground` |
| Filter tab default | background | base/background | #ffffff | `bg-background border-input` |
| Stat pill Tổng cộng | color | base/foreground | #18181b | `text-foreground` |
| Stat pill Hợp lệ | color | success-token | ~#16a34a | `text-green-600` |
| Stat pill Lỗi | color | base/destructive | #dc2626 | `text-destructive` |
| Table Header | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| Table Row | color | base/foreground | #18181b | `text-foreground` |
| MaNoiBoCell (link) | color | base/foreground-brand-CD | #0052ff | `text-brand` |
| Badge Hợp lệ | background | success-subtle | ~#dcfce7 | `bg-green-100 text-green-700` |
| Badge Lỗi | background | destructive-subtle | ~#fee2e2 | `bg-red-100 text-red-700` |
| TotalRow | background | base/accent | #f4f4f5 | `bg-accent` |

## §3 State Table

| State | Trigger | hasFile | previewLoaded | Xác nhận enabled | Lý do lỗi col |
|---|---|---|---|---|---|
| `initial` | Page mount, no file | false | false | disabled | (col hidden — no data) |
| `file_selected_parsing` | User selects file, parse in progress | true | false | disabled (parsing) | (col hidden — no data yet) |
| `preview_loaded_no_errors` | Parse success, all rows valid | true | true | enabled | (col empty — no errors) |
| `preview_loaded_with_errors` | Parse success, some rows invalid | true | true | enabled (per AC-5 partial import), Tải file lỗi enabled | (col visible with rút gọn wording per row status=Lỗi) |
| `file_rejected` | File format wrong / > 500 rows / empty per AC-3b | true | false | disabled | (n/a — dialog error) |
| `submitting` | User clicks Xác nhận | true | true | disabled (spinner) | (col unchanged) |
| `success` | Backend commit | (form unmounts → navigate back) | — | — | — |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| PageHeader | `share/page-header/3` | `{ title, backLink, actions: [cancel, confirm] }` | Header variant 3 |
| BackLink / File action icons | `ui/button` variant="ghost" size="icon" | (icon) | Ghost |
| CancelButton | `ui/button` variant="outline" | `{ children: "Huỷ bỏ", onClick }` | Outline |
| ConfirmButton | `ui/button` variant="brand" | `{ children: "Xác nhận", disabled, onClick }` | Brand |
| SectionTitle | `share/section/title-text` | `{ text }` | Reuse |
| TemplateDownloadLink | `ui/link` (or plain `<a>`) with leading icon | `{ href, children, icon }` | Anchor with icon |
| DropZone | `share/dropzone/file-upload` | `{ accept: ".xlsx", multiple: false, onDrop, onClick }` | Custom drop zone; accept per AC-3b .xlsx only |
| FileCard | `share/file-card` | `{ name, size, onDelete }` | Reuse |
| Filter tabs | `ui/tabs` or 3 `ui/button` toggle group | `{ value, onValueChange, options }` | 3-tab toggle |
| Stats pills | inline `<Text>` + `<span>` styling | (via §2 tokens) | No wrapper component |
| DownloadErrorButton | `ui/button` variant="outline" | `{ children, leadingIcon, disabled, onClick }` | Outline with download icon |
| Table | `ui/table` (shadcn) | `{ columns, rows, totalRow, sticky-total: true }` | shadcn Table with sticky total footer |
| Row Trạng thái badge | `ui/badge` | `{ variant: "success" \| "destructive", children: label }` | shadcn Badge with 2 variants |
| SectionFooter | `share/section-footer/02` | (static) | Layout |

## §5 Field Composition Schema

Upload + preview payload:

```yaml
UploadOpeningBalanceFileInput:
  interface: UploadOpeningBalanceFileInput
  fields:
    - name: file
      type: File
      binding: DropZone.selectedFile
      combined: false
      validate: "MIME check .xlsx per AC-3b → ERR-INV-* if wrong; size ≤ 500 rows per AC-3b → ERR-INV-048 if exceed"

UploadOpeningBalanceFileResult:
  interface: PreviewResult
  fields:
    - name: rows
      type: PreviewRow[]
    - name: totalCount
      type: int
    - name: validCount
      type: int
    - name: errorCount
      type: int
    - name: aggregates
      type: { totalSoLuong: number, totalGiaTri: number }

PreviewRow:
  fields:
    - { name: rowNumber, type: int, _renders: "Dòng column" }
    - { name: tonDenNgay, type: date }
    - { name: kho, type: string }
    - { name: product, type: { internalCode: string, internalName: string } }
    - { name: unit, type: string }
    - { name: soLuongTon, type: number }
    - { name: giaTriTon, type: number }
    - { name: status, type: "'Hợp lệ' | 'Lỗi'" }
    - { name: errorReason, type: string?, _renders: "shortened wording (Sai mã / ĐVT lệch / Kỳ đã đóng...) per AC-5" }
    - { name: errorCodes, type: string[]?, _renders: "API contract full codes (ERR-INV-009/010/017/018/019/020/032/033/024/036) per AC-5" }

ConfirmImportInput:
  fields:
    - name: fileHash
      type: string
      binding: uploaded file hash returned from preview
      combined: false
    - name: importOptions
      type: "{ skipErrors?: boolean }?"
      _optional: true
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Page | 1440 | — | Navbar + SubNav + PageContent + Footer | Full-bleed |
| PageContent | 1440 | { x: 80, y: 0 } | 1280 content | Consistent với AP-EDIT |
| PageHeader | 1280 | { x: 32, y: 0 } | TitleGroup + ActionRow (~150) | space-between |
| ThongTinCoBanSection | 1216 | 0 | SectionTitle + TemplateLink + DropZone(1216) + FileCard(1216) | 1280 - 64 |
| DropZone | 1216 | { y: 24, x: 16 } | Icon (32) + Prompt (~250) + Hint (~200) centered vertical | Dashed border |
| FileCard | 1216 | { y: 12, x: 16 } | FileInfoGroup (~300) + DeleteButton (32) | space-between |
| PreviewSection | 1216 | 0 | FilterAndStatsRow + PreviewTable | Vertical stack |
| FilterAndStatsRow | 1216 | 0 | LeftGroup (search + tabs + stats ~950) + DownloadErrorButton (~120) | space-between |
| PreviewTable | 1216 | 0 | 11 cols sum = 60+60+168+120+185+178+120+120+130+154+168 = 1463 | ⚠ EXCEEDS 1216 — horizontal scroll needed; alternatively resize cols; Figma table wider than viewport (1463) suggests scroll or overflow-x |
| TotalRow | 1216 | 0 | colSpan 7 (Tổng) + 1 (SL) + 1 (Giá trị) + 2 (blank) | Sticky footer |

**Note**: Sum of cols exceeds 1216 → table has horizontal scroll or Lý do lỗi col wraps. Implementation: `overflow-x: auto` on table container.

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - ConfirmButton "Xác nhận" (brand blue, top-right — final commit action)
  - PageTitle "Tải lên danh sách tồn đầu kỳ" (H1)

Level 2 (secondary):
  - CancelButton "Huỷ bỏ" (outline)
  - SectionTitle "Thông tin cơ bản"
  - TemplateDownloadLink (blue link — key prerequisite action)
  - DropZone (dashed border, prominent for interaction)

Level 3 (tertiary):
  - FileCard + FileDeleteButton (post-upload state indicator)
  - StatsPills (color-coded counts — quick health-check summary)

Level 4 (data):
  - PreviewTable rows với badges (Trạng thái colored badges high-visibility)

Level 5 (utility):
  - SearchInput + StatusTabFilter + DownloadErrorButton (secondary UI actions)
  - TotalRow aggregate
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-OB-IMP-1 | Render wizard stepper multi-step (Choose file → Preview → Confirm) | FEAT AC-1 explicit "single page (không wizard stepper)" — all in 1 page + inline preview | FEAT AC-1 explicit no wizard |
| AP-OB-IMP-2 | Enable Xác nhận before parse completes | Xác nhận MUST disabled until previewLoaded && hasFile per AC-1 | FEAT AC-1 explicit "chỉ enable khi có file hợp lệ đã parse xong" |
| AP-OB-IMP-3 | Accept .xls / .csv (assume Figma hint) | Only .xlsx per AC-3b explicit; Figma hint 'Hỗ trợ file: .xls, .xlsx, .csv' is stale draft | FEAT AC-3b authoritative + coverage_gap |
| AP-OB-IMP-4 | Ghi (write) dữ liệu khi chọn file | KHÔNG ghi ở bước chọn file per AC-3 explicit — parse only + preview inline; commit only on Xác nhận | FEAT AC-3 explicit "Không ghi dữ liệu ở bước này" |
| AP-OB-IMP-5 | Cho phép > 500 dòng | AC-3b explicit reject file > 500 dòng ngay + báo mã ERR-INV-048 + không ghi dòng nào | FEAT AC-3b + BR-OB-004b |
| AP-OB-IMP-6 | Skip 'Lý do lỗi' column | AC-4 explicit 11 cols include Lý do lỗi (wording rút gọn per AC-5) — Figma PNG col missing = coverage_gap; implementation MUST render | FEAT AC-4/AC-5 + coverage_gap |
| AP-OB-IMP-7 | Badge chip có icon | Text-only badge per AC-5 (Hợp lệ green + Lỗi red text đậm) — no icon | FEAT AC-5 + `_png_verified` badges text-only |
| AP-OB-IMP-8 | Tải file lỗi enabled khi errorCount=0 | Enabled ONLY when errorCount > 0 per AC-4 explicit | FEAT AC-4 explicit enable rule |
| AP-OB-IMP-9 | Verbatim template link 'Mẫu file' shortened | Verbatim '📄 Mẫu file danh sách tồn đầu kỳ.xlsx' per PNG + FEAT AC-2 | `_png_verified`: 14646-92037.png L245 verbatim |
| AP-OB-IMP-10 | Use `lucide-react` | `iconsax-reactjs` per convention v7.6 | R4.1 |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 14646:92037 | initial (no file) | assets/wave04-ob-import/14646-92037.png | 1440×822 |
| 14646:93567 | file_selected (parsing/parsed pre-preview) | (reuses assets/wave04-ob-import/14646-93780.png for shared parts) | 1440×822 |
| 14646:93780 | preview_loaded (full preview) | assets/wave04-ob-import/14646-93780.png | 1440×992 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Single-page + Header ← + title + Huỷ bỏ + Xác nhận (Xác nhận enabled sau parse) | PageHeader + ActionRow + ConfirmButton.enabled_rule | 14646:92037 + 14646:93780 | ✓ (Frame 1 PNG missing buttons — coverage_gap) |
| AC-2 | Template link 2-tab xlsx | TemplateDownloadLink + href | 14646:92037 | ✓ (server contract) |
| AC-3 | Drop zone .xlsx + file card + delete + preview inline | DropZone + FileCard + PreviewSection.visibility_rule | 14646:93780 | ✓ |
| AC-3b | Reject wrong format / empty / > 500 rows với ERR-INV-048 | (backend concern + client MIME check) | (dialog error missing from Figma) | ⚠ (backend + error UI needed) |
| AC-4 | Preview 3 stats + search + 3-tab filter + Tải file lỗi + 11-col table + total | FilterAndStatsRow + PreviewTable | 14646:93780 | ✓ (Lý do lỗi col Figma missing — coverage_gap) |
| AC-5 | Badge 2-variant (Hợp lệ green + Lỗi red) + Lý do lỗi text wording rút gọn per row | TrangThaiCell BadgeCell + LyDoLoiCell | 14646:93780 | ✓ |
| AC-6+ | Detailed validation rules, error codes ERR-INV-* | (backend guardrail + client renders errorReason) | — | ⚠ (backend errcode-lookup registry) |
| AC-10 | Xác nhận commit → CreateOpeningBalancesBatch mutation | ConfirmButton.onClick | 14646:93780 | ✓ |

## Coverage Gaps

- **Frame 1 header buttons**: Figma initial state does NOT show Huỷ bỏ / Xác nhận top-right. FEAT AC-1 explicit both buttons always visible. Implementation follows FEAT.
- **Lý do lỗi col**: PNG shows 10 cols; AC-4 requires 11 (thêm Lý do lỗi). Implementation MUST render; horizontal scroll on table container.
- **File format accept**: Figma hint '.xls/.xlsx/.csv' vs FEAT AC-3b '.xlsx only'. Implementation follows FEAT.
- **Error dialog (AC-3b file rejected)**: File > 500 rows / empty / wrong format → Figma frame missing. Implementation shows toast/dialog error với ERR-INV-048 message.
- **Frame 2 (file_selected pre-preview)**: Same visual elements as Frame 3 minus preview section. No dedicated PNG.
