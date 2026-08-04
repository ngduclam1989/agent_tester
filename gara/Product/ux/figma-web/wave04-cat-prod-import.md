---
feat: FEAT-CAT-PROD-IMPORT
feat_file: Product/features/FEAT-CAT-PROD-IMPORT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87154
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87154"
fetched_at: "2026-07-08T04:15Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: ACTIVE
coverage_gaps:
  - "Figma emit 5 frames — canonical: Frame 1 (14601:133301 initial), Frame 2 (14601:133897 file_selected), Frame 3 (14601:134126 preview with data). Plus 2 detail table frames (14601:135303 + 14601:135395 stale 'Lỗi hiển thị nhiều cột dữ liệu' — designer marked for fix) + 1 dialog overlay frame (14601:135187). Spec covers 3 canonical."
  - "FEAT AC-1 explicit '2-bước wizard Tải Template → Kiểm tra dữ liệu'. Figma canonical PNG (Frame 3) shows SINGLE-PAGE pattern (không stepper) — parity với OB-IMPORT. Design đã converged sang single-page? Wording drift. Implementation follows PNG single-page (also aligns với OB-IMPORT UX pattern) + note gap."
  - "Figma preview table shows 'Phương pháp tính giá' column with 'Bình quân cuối kỳ' hardcoded value. FEAT AC-2 explicit 'template import không có cột phương pháp tính giá — mọi mã nhập luôn nhận mặc định Bình quân cuối kỳ per BR-CAT-PROD-010'. Col in Figma preview is drift; implementation follows FEAT (remove cột trong preview OR keep as read-only display 'Bình quân cuối kỳ' hardcoded per BR-CAT-PROD-010; BA confirm)."
  - "Section width 9393px trong metadata (bao gồm 2 detail table frames stale 'Lỗi hiển thị nhiều cột'). Per-frame screenshot 1440-wide safe (không G7 downscale trap)."
  - "Drop zone hint 'Hỗ trợ file: .xls, .xlsx, .csv' vs FEAT AC-3b '.xlsx only'. Implementation follows FEAT authoritative (.xlsx)."
  - "Header buttons: Frame 1 initial state PNG NO buttons visible. Per FEAT-parity + OB-IMPORT convention, buttons always visible with Xác nhận disabled until file parsed valid."
  - "Table col 'Quy cách sản phẩm' theo FEAT AC-2 template Tab 'Import Mã nội bộ' — Figma preview shows 'Nhóm sản phẩm' trailing (truncated at right edge — col may exist beyond visible portion). Implementation renders full col set per FEAT."
---

# FEAT-CAT-PROD-IMPORT — Spec (web)

> Page-level import flow cho danh mục mã sản phẩm nội bộ. Structure: PageHeader + Section "Thông tin cơ bản" + template link (.xlsx 4-tab) + drop zone + file card + preview inline (stats + 3-tab filter + Tải file lỗi + wide table với 13+ cols + pagination). Parity với FEAT-OB-IMPORT pattern (converged single-page from wizard).
>
> **Icon library**: `iconsax-reactjs` primary (v7.6).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/back-arrow | vuesax/linear/arrow-left | iconsax-reactjs | ArrowLeft | Linear | assets/wave04-cat-prod-import/14601-133301.png L143 back chevron ← |
| icon/template-file | vuesax/linear/document | iconsax-reactjs | Document | Linear | assets/wave04-cat-prod-import/14601-133301.png L245 document glyph leading template link |
| icon/upload-cta | vuesax/linear/document-upload | iconsax-reactjs | DocumentUpload | Linear | assets/wave04-cat-prod-import/14601-133301.png L320 upload arrow glyph in drop zone |
| icon/file-xls | vuesax/linear/document-text | iconsax-reactjs | DocumentText | Linear | assets/wave04-cat-prod-import/14601-134126.png L438 XLS icon leading file card |
| icon/file-delete | vuesax/linear/trash | iconsax-reactjs | Trash | Linear | assets/wave04-cat-prod-import/14601-134126.png L438 trash icon trailing file card |
| icon/search | vuesax/linear/search-normal | iconsax-reactjs | SearchNormal | Linear | assets/wave04-cat-prod-import/14601-134126.png L513 magnifying-glass leading search input |
| icon/download-error | vuesax/linear/document-download | iconsax-reactjs | DocumentDownload | Linear | assets/wave04-cat-prod-import/14601-134126.png L513 download glyph leading 'Tải file lỗi' button |
| icon/pagination-prev | vuesax/linear/arrow-left-2 | iconsax-reactjs | ArrowLeft2 | Linear | assets/wave04-cat-prod-import/14601-134126.png L897 pagination Trước chevron |
| icon/pagination-next | vuesax/linear/arrow-right-2 | iconsax-reactjs | ArrowRight2 | Linear | assets/wave04-cat-prod-import/14601-134126.png L897 pagination Tiếp chevron |

---

## Screen: Initial state — no file (14601:133301)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Initial state** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Renders `hasFile: false` → No file card + no preview.
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
screenshot: assets/wave04-cat-prod-import/14601-133301.png
verified_at: "2026-07-08T04:15Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Sub-nav 'Danh sách sản phẩm' active (blue underline) — top nav 'Danh mục' active"
    status: ✓
    evidence: "14601-133301.png L80 shows Danh sách sản phẩm active blue underline; Danh mục filled top tab"
  - claim: "PageHeader ← + H1 'Tải lên danh mục sản phẩm' — NO Huỷ bỏ/Xác nhận in Frame 1 PNG"
    status: ⚠
    evidence: "14601-133301.png L143 only back+title; implementation adds buttons per FEAT-parity (Xác nhận disabled state)"
  - claim: "Section 'Thông tin cơ bản' + template link 'Mẫu file danh sách sản phẩm.xlsx' blue link + drop zone dashed border"
    status: ✓
    evidence: "14601-133301.png L198 section title + L245 template link with document icon + L280 drop zone with upload icon + centered prompt"
```

---

## Screen: File selected — parsing/parsed (14601:133897)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — File selected state** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Renders `hasFile: true, previewLoaded: false` (parsing) OR `previewLoaded: true` (parsed). File card visible; preview may follow.
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
screenshot: assets/wave04-cat-prod-import/14601-134126.png
verified_at: "2026-07-08T04:15Z"
verifier: main-agent (prefetch-figma web 04)
note: "Frame 2 (14601:133897) not fetched — visually equivalent to Frame 3 header+section+file-card portion. Reuse Frame 3 PNG."
claims_verified:
  - claim: "File card renders below drop zone with XLS icon + Filename.format + 1.3MB + trash delete"
    status: ✓
    evidence: "14601-134126.png L438 file card visible with all elements per OB-IMPORT parity"
  - claim: "Drop zone still visible above file card (replace file capability)"
    status: ✓
    evidence: "14601-134126.png L280-410 drop zone active even with file card mounted"
  - claim: "Metadata frame Content height 296 (Frame 2) vs 216 (Frame 1) — delta = file card row 64+16px per file-selected state"
    status: ✓
    evidence: "metadata Frame 14601:133902 Content h=296 = 44 title + 172 drop zone + 64 file card + 16 gap"
```

---

## Screen: Preview with data (14601:134126)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Preview state** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Renders `hasFile: true, previewLoaded: true` — all preview elements visible.
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
screenshot: assets/wave04-cat-prod-import/14601-134126.png
verified_at: "2026-07-08T04:15Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Header buttons [Huỷ bỏ outline + Xác nhận brand blue] visible top-right"
    status: ✓
    evidence: "14601-134126.png L143 both buttons visible top-right"
  - claim: "Preview stats + 3-tab filter + Tải file lỗi row per FEAT AC-4"
    status: ✓
    evidence: "14601-134126.png L513 shows [search 320] + [Tất cả filled] [Hợp lệ outline] [Lỗi outline] + 'Tổng cộng: 40  Hợp lệ: 40  Lỗi: 0' stats + [Tải file lỗi] button top-right"
  - claim: "Preview table renders with 13 cols per FEAT AC-2 (STT + Mã + Tên + ĐVT + [Phương pháp tính giá] + Thương hiệu + Xuất xứ + Tính chất + Nhóm sản phẩm + Quy cách sản phẩm + Trạng thái + Lý do lỗi) — Phương pháp tính giá col Figma-only drift"
    status: ⚠
    evidence: "14601-134126.png L575 table header visible: STT | Mã sản phẩm nội bộ | Tên sản phẩm | ĐVT chính | Phương pháp tính giá | Thương hiệu | Xuất xứ | Tính chất | Nhóm sản... (right-truncated in PNG); coverage_gap flag on Phương pháp tính giá col vs FEAT AC-2 explicit"
  - claim: "Rows show Mã nội bộ blue link + 'Bình quân cuối kỳ' hardcoded in Phương pháp tính giá col + ĐVT chính 'Thùng/Bình/Chiếc' + Thương hiệu 'Mazuda/Hyundai/Benzel/Amerix/Renault' + Xuất xứ 'Nhật Bản/Hàn Quốc/Đức/Mỹ/Pháp' + Tính chất 'Vật tư hàng hoá' per row"
    status: ✓
    evidence: "14601-134126.png rows show consistent data pattern; Phương pháp tính giá all 'Bình quân cuối kỳ' matches BR-CAT-PROD-010 hardcoded default"
  - claim: "Pagination visible: 'Hiển thị 5 mỗi trang' + '< Trước | 1 [2] 3 ... Tiếp >' — CAT-PROD-IMPORT HAS pagination (delta vs OB-IMPORT)"
    status: ✓
    evidence: "14601-134126.png L897 pagination row visible below table (unlike OB-IMPORT which has no pagination)"
```

---

# File-level shared sections

## §0 ASCII Mockup — Initial state (14601:133301)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   Tồn kho   Khách hàng   Marketing   Nhân viên   [Danh mục]      🔔● 👤 │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Danh sách sản phẩm]‾‾‾   Nhóm vật tư hàng hóa   Kỳ kế toán                                          │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ← Tải lên danh mục sản phẩm                                          [ Huỷ bỏ ]  [ Xác nhận disabled ] │  ← Header (Xác nhận disabled per FEAT-parity)
│                                                                                                       │
│  Thông tin cơ bản                                                                                     │
│                                                                                                       │
│  📄 Mẫu file danh sách sản phẩm.xlsx                                                                 │  ← Template link
│                                                                                                       │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │                                          ⤴                                                        │  │  ← Drop zone
│  │                            Kéo thả hoặc [nhấn để chọn tệp]                                        │  │
│  │                                  Hỗ trợ file: .xlsx                                               │  │     (FEAT authoritative .xlsx only)
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
[No file card, no preview — hasFile=false]
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — File selected state (14601:133897)

```text
[Header + Section + Template link + Drop zone IDENTICAL to Initial state]

│  📄 [Filename.format]                                                                           🗑   │  ← File card
│     1.3MB                                                                                            │
[Preview appears after parse]
```

## §0 ASCII Mockup — Preview state (14601:134126)

```text
[Header + Section + Template link + Drop zone + File card IDENTICAL to File selected]

│  [🔍 Tìm theo mã nội bộ, tên sản phẩm ]  [Tất cả] [Hợp lệ] [Lỗi]  Tổng cộng: 40  Hợp lệ: 40  Lỗi: 0  [⬇ Tải file lỗi] │  ← Filter + stats + download
│                                                                                                       │
│  ┌────┬───────────────┬─────────────┬─────────┬────────────────┬──────────┬──────────┬──────────────┬────────────┬───────────────┬─────────┬──────────┐ │
│  │STT │Mã sản phẩm    │Tên sản phẩm │ĐVT chính│Phương pháp     │Thương hiệu│Xuất xứ  │Tính chất     │Nhóm sản    │Quy cách sản   │Trạng    │Lý do lỗi │ │  ← 13-col table header
│  │    │nội bộ          │              │          │tính giá        │            │          │              │phẩm        │phẩm            │thái     │           │ │     (Phương pháp tính giá coverage_gap)
│  ├────┼───────────────┼─────────────┼─────────┼────────────────┼──────────┼──────────┼──────────────┼────────────┼───────────────┼─────────┼──────────┤ │
│  │ 1  │AS78-1234-EDC9│Bộ má phanh  │Thùng    │Bình quân cuối  │Mazuda    │Nhật Bản  │Vật tư hàng   │Phụ tùng    │...            │[Hợp lệ] │          │ │
│  │ 2  │MN56-4567-WSX6│Lọc gió       │Bình     │Bình quân cuối  │Hyundai   │Hàn Quốc  │Vật tư hàng   │Phụ tùng    │...            │[Hợp lệ] │          │ │
│  │ 3  │VB34-7890-QAZ3│Bộ bugi       │Thùng    │Bình quân cuối  │Benzel    │Đức       │Vật tư hàng   │Phụ tùng    │...            │[Lỗi]    │Sai mã    │ │
│  │ 4  │XC12-0123-REW0│Dây curoa cam │Thùng    │Bình quân cuối  │Amerix    │Mỹ        │Vật tư hàng   │Phụ tùng    │...            │[Hợp lệ] │          │ │
│  │ 5  │ZA90-3456-UYT7│Kim phun nhiên│Chiếc    │Bình quân cuối  │Renault   │Pháp      │Vật tư hàng   │Phụ tùng    │...            │[Hợp lệ] │          │ │
│  └────┴───────────────┴─────────────┴─────────┴────────────────┴──────────┴──────────┴──────────────┴────────────┴───────────────┴─────────┴──────────┘ │
│                                                                                                       │
│  Hiển thị [5 ▾] mỗi trang                                     < Trước   1  [2]  3  …   Tiếp >        │  ← Pagination
```

## §1 Layout DSL

```yaml
CatalogProductImportPage:
  type: page
  route: "/inventory/catalog/products/import"
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
      _children_count: 3
      children:
        - { type: TabLink, label: "Danh sách sản phẩm", state: active, _png_verified: "14601-133301.png L80 blue underline" }
        - { type: TabLink, label: "Nhóm vật tư hàng hóa", state: default, _png_verified: "14601-133301.png L80 verbatim" }
        - { type: TabLink, label: "Kỳ kế toán", state: default, _png_verified: "14601-133301.png L80 verbatim" }

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
                  onClick: "navigate('/inventory/catalog/products')  # back to FEAT-CAT-PROD-LIST"
                - id: PageTitle
                  type: Text
                  content: "Tải lên danh mục sản phẩm"
                  _png_verified: "14601-133301.png L143 verbatim H1"
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
              _visibility_rule: "always visible per FEAT-parity"
              children:
                - id: CancelButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Huỷ bỏ"
                  _png_verified: "14601-134126.png L143 outline button 'Huỷ bỏ'"
                  onClick: "navigate('/inventory/catalog/products')"

                - id: ConfirmButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Xác nhận"
                  _png_verified: "14601-134126.png L143 brand blue 'Xác nhận'"
                  _enabled_rule: "hasFile && previewLoaded && !isValidating"
                  onClick: "submitImport() → CreateProductCatalogBatch mutation per AC-8"

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
              _png_verified: "14601-133301.png L198 verbatim 'Thông tin cơ bản' semibold"
              size: 16
              weight: 600
              color: text-foreground
              _renders_as: h2-section-header

            - id: TemplateDownloadLink
              type: Link
              icon: { source: iconsax-reactjs, name: Document, variant: Linear, size: 20, color: text-brand }
              label: "Mẫu file danh sách sản phẩm.xlsx"
              _png_verified: "14601-133301.png L245 verbatim link — matches FEAT AC-2 template file"
              color: text-brand
              href: "GET /api/v1/inventory/catalog/products/import/template"
              onClick: "downloadTemplate() → server returns 4-tab xlsx per AC-2 (Import Mã nội bộ + Xuất xứ + Tính chất + ĐVT reference tabs)"

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
              _png_verified: "14601-133301.png L280 drop zone dashed border"
              _children_count: 3
              children:
                - { type: Icon, source: iconsax-reactjs, name: DocumentUpload, variant: Linear, size: 32, color: text-muted-foreground }
                - id: DropZonePrompt
                  type: Text
                  content: "Kéo thả hoặc [nhấn để chọn tệp]"
                  _png_verified: "14601-133301.png L348 verbatim 'Kéo thả hoặc nhấn để chọn tệp'"
                  size: 14
                - id: DropZoneHint
                  type: Text
                  content: "Hỗ trợ file: .xlsx"
                  _png_verified: "14601-133301.png L368 Figma shows '.xls, .xlsx, .csv' — FEAT AC-3b authoritative .xlsx ONLY; implementation follows FEAT"
                  size: 12
                  color: text-muted-foreground
              onDrop: "handleFileUpload per AC-3"
              onClick: "openFilePicker per AC-3"

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
              _png_verified: "14601-134126.png L438 file card XLS icon + Filename + size + trash"
              _children_count: 2
              children:
                - id: FileInfoGroup
                  type: container
                  direction: horizontal
                  gap: 12
                  align: center
                  children:
                    - { type: Icon, source: iconsax-reactjs, name: DocumentText, variant: Linear, size: 32, color: text-success }
                    - id: FileMetaStack
                      type: container
                      direction: vertical
                      gap: 2
                      children:
                        - { type: Text, content: "{file.name}", size: 14, weight: 500, _png_verified: "14601-134126.png L438 'Filename.format'" }
                        - { type: Text, content: "{file.sizeFormatted}", size: 12, color: text-muted-foreground, _png_verified: "14601-134126.png L438 '1.3MB'" }
                - id: FileDeleteButton
                  type: IconButton
                  icon: { source: iconsax-reactjs, name: Trash, variant: Linear, size: 20, color: text-muted-foreground }
                  onClick: "clearFile()"

        - id: PreviewSection
          type: container
          width: 1216
          direction: vertical
          gap: 16
          _visibility_rule: "hasFile && previewLoaded"
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
                      placeholder: "Tìm theo mã nội bộ, tên sản phẩm"
                      _png_verified: "14601-134126.png L513 verbatim placeholder"
                      leadingIcon: { source: iconsax-reactjs, name: SearchNormal, variant: Linear, size: 16, color: text-muted-foreground }

                    - id: StatusTabFilter
                      type: container
                      direction: horizontal
                      gap: 4
                      _children_count: 3
                      children:
                        - { type: Button, variant: brand, size: default, label: "Tất cả", state: "active-when selected", _png_verified: "14601-134126.png L513 filled brand blue" }
                        - { type: Button, variant: outline, size: default, label: "Hợp lệ", _png_verified: "14601-134126.png L513 outline" }
                        - { type: Button, variant: outline, size: default, label: "Lỗi", _png_verified: "14601-134126.png L513 outline" }

                    - id: StatsPills
                      type: container
                      direction: horizontal
                      gap: 12
                      align: center
                      _children_count: 3
                      children:
                        - { type: Text, content: "Tổng cộng: {totalCount}", _png_verified: "14601-134126.png L513 'Tổng cộng: 40'" }
                        - { type: Text, content: "Hợp lệ: {validCount}", color: text-success, weight: 500, _png_verified: "14601-134126.png L513 'Hợp lệ: 40' green" }
                        - { type: Text, content: "Lỗi: {errorCount}", color: text-destructive, weight: 500, _png_verified: "14601-134126.png L513 'Lỗi: 0' red" }

                - id: DownloadErrorButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Tải file lỗi"
                  _png_verified: "14601-134126.png L513 verbatim 'Tải file lỗi' outline with download icon leading"
                  _enabled_rule: "errorCount > 0 per AC-4 explicit"
                  leadingIcon: { source: iconsax-reactjs, name: DocumentDownload, variant: Linear, size: 16, color: text-foreground }
                  onClick: "downloadErrorFile()"

            - id: PreviewTable
              type: container
              width: 1216
              direction: vertical
              gap: 0
              _children_count: 3
              children:
                - id: TableHeader
                  type: TableHeadRow
                  height: 40
                  BG: bg-background
                  Border: 1px bottom border
                  _children_count: 13     # R10 — FEAT AC-2 columns + Trạng thái + Lý do lỗi + Dòng (per AC-5)
                  _png_verified_columns_visible: 9   # PNG shows 9 cols visible (right edge truncation for Quy cách + Trạng thái + Lý do lỗi)
                  columns:
                    - { id: STT, label: "STT", width: 60, align: left, _png_verified: "14601-134126.png L575 verbatim col header" }
                    - { id: MaSanPhamNoiBo, label: "Mã sản phẩm nội bộ", width: 185, align: left, _renders_as: "cells blue text-link", _png_verified: "14601-134126.png L575 verbatim + rows show blue-link cells 'AS78-1234-EDC9' etc" }
                    - { id: TenSanPham, label: "Tên sản phẩm", width: 178, align: left, _png_verified: "14601-134126.png L575 verbatim" }
                    - { id: DVTChinh, label: "ĐVT chính", width: 120, align: left, _png_verified: "14601-134126.png L575 verbatim + values 'Thùng/Bình/Chiếc'" }
                    - { id: PhuongPhapTinhGia, label: "Phương pháp tính giá", width: 180, align: left, _renders_as: "hardcoded 'Bình quân cuối kỳ' per BR-CAT-PROD-010", _png_verified: "14601-134126.png L575 shown in Figma but FEAT AC-2 explicit template KHÔNG có col này (coverage_gap; implementation may hide col hoặc render read-only default 'Bình quân cuối kỳ')" }
                    - { id: ThuongHieu, label: "Thương hiệu", width: 120, align: left, _png_verified: "14601-134126.png L575 verbatim + values 'Mazuda/Hyundai/Benzel/Amerix/Renault' — free-text no validate per AC-2" }
                    - { id: XuatXu, label: "Xuất xứ", width: 120, align: left, _png_verified: "14601-134126.png L575 verbatim + values 'Nhật Bản/Hàn Quốc/Đức/Mỹ/Pháp'" }
                    - { id: TinhChat, label: "Tính chất", width: 180, align: left, _png_verified: "14601-134126.png L575 verbatim + value 'Vật tư hàng hoá' per row" }
                    - { id: NhomSanPham, label: "Nhóm sản phẩm", width: 180, align: left, _png_verified: "14601-134126.png L575 verbatim (right-truncated in PNG)" }
                    - { id: QuyCachSanPham, label: "Quy cách sản phẩm", width: 168, align: left, _png_not_visible: "col at right edge of PNG — extends beyond visible; implementation MUST render per FEAT AC-2" }
                    - { id: TrangThai, label: "Trạng thái", width: 154, align: left, _renders_as: "badge chip cell per AC-5", _png_not_visible: "col at far right of PNG beyond visible; implementation renders green/red badges" }
                    - { id: LyDoLoi, label: "Lý do lỗi", width: 168, align: left, _renders_as: "text visible when TrangThai='Lỗi'; wording rút gọn per AC-5", _png_not_visible: "col beyond visible portion" }
                    # Note: 'Dòng' col in preview data not visible in this table version (STT already provides ordinal)

                - id: TableBody
                  type: TableBody
                  rowHeight: 52
                  rowContent:
                    - STTCell: { field: index, format: "1-based" }
                    - MaSanPhamCell: { field: product.internalCode, _renders_as: "blue link — drill product edit or preview" }
                    - TenSanPhamCell: { field: product.name }
                    - DVTChinhCell: { field: unit }
                    - PhuongPhapTinhGiaCell: { field: costingMethod, _default: "'Bình quân cuối kỳ' hardcoded per BR-CAT-PROD-010; server enforces regardless of file value" }
                    - ThuongHieuCell: { field: brand }
                    - XuatXuCell: { field: origin }
                    - TinhChatCell: { field: nature, validate: "4 giá trị hợp lệ per BR-CAT-PROD-019: Vật tư hàng hóa | CCDC | Dịch vụ | Khác" }
                    - NhomSanPhamCell: { field: group, validate: "khớp danh mục nhóm master per BR-CAT-PROD-022; empty OK per AC-5" }
                    - QuyCachSanPhamCell: { field: specification }
                    - TrangThaiCell:
                        type: BadgeCell
                        _mode_switch: "row.status='Hợp lệ' → green badge  ·  row.status='Lỗi' → red badge"
                        variant_valid: { BG: bg-success-subtle, color: text-success, label: "Hợp lệ" }
                        variant_error: { BG: bg-destructive-subtle, color: text-destructive, label: "Lỗi" }
                    - LyDoLoiCell:
                        type: Cell
                        field: errorReason
                        _visibility_rule: "row.status === 'Lỗi'"
                        _wording: "shortened per AC-5 (e.g. 'Sai mã', 'ĐVT lệch', 'Trùng mã', 'Tính chất sai', 'Xuất xứ không khớp')"

                - id: PaginationRow
                  type: TablePagination
                  height: 36
                  direction: horizontal
                  justify: space-between
                  align: center
                  padding: { y: 8 }
                  _children_count: 2
                  _png_verified: "14601-134126.png L897 pagination visible — CAT-PROD-IMPORT HAS pagination unlike OB-IMPORT"
                  children:
                    - id: PageSizeSelector
                      direction: horizontal
                      align: center
                      gap: 8
                      children:
                        - { type: Text, content: "Hiển thị", _png_verified: "14601-134126.png L897 verbatim 'Hiển thị'" }
                        - { type: Select, options: [5, 10, 20, 50], default: 5, width: 72, trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16 } }
                        - { type: Text, content: "mỗi trang", _png_verified: "14601-134126.png L897 verbatim 'mỗi trang'" }
                    - id: PageNavigator
                      direction: horizontal
                      align: center
                      gap: 4
                      children:
                        - { type: IconButton, icon: { source: iconsax-reactjs, name: ArrowLeft2, variant: Linear, size: 16 }, label: "Trước" }
                        - { type: PageNumber, value: 1 }
                        - { type: PageNumber, value: 2, active: true }
                        - { type: PageNumber, value: 3 }
                        - { type: Text, content: "…" }
                        - { type: IconButton, icon: { source: iconsax-reactjs, name: ArrowRight2, variant: Linear, size: 16 }, label: "Tiếp", trailingIcon: true }

    - id: SectionFooter
      type: instance
      source: share/section-footer/02
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px top border

_negative_coverage:
  - "không có wizard stepper multi-step (converged single-page pattern parity với OB-IMPORT — FEAT AC-1 mentions 2-step nhưng Figma canonical single-page)"
  - "không có bulk-action toolbar (khi rows selected) — 'Xóa các dòng đã chọn' pattern from OB-LIST not applicable to preview context"
  - "không có 'Bỏ qua dòng lỗi' checkbox pre-submit (implementation may add flag; not spec'd in Figma)"
  - "không có tooltip lên Mã sản phẩm nội bộ link (link direct to drill; no popover preview)"
  - "không có sort UI trên cột (order fixed as file input order — STT preserves row order)"
  - "không có progress bar khi parsing file / import committing (implementation add spinner)"
  - "không có dialog error khi > 500 rows (AC-3b ERR-INV-041) — Figma frame missing"
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
| FileCard | background | base/muted-subtle | #f9fafb | `bg-muted/50` |
| Filter tab active | background | base/background-brand-CD | #0052ff | `bg-brand text-primary-foreground` |
| Filter tab default | background | base/background | #ffffff | `bg-background border-input` |
| Stat pill Hợp lệ | color | success-token | ~#16a34a | `text-green-600` |
| Stat pill Lỗi | color | base/destructive | #dc2626 | `text-destructive` |
| Table Header | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| Table Row | color | base/foreground | #18181b | `text-foreground` |
| MaSanPham (link) | color | base/foreground-brand-CD | #0052ff | `text-brand` |
| Badge Hợp lệ | background | success-subtle | ~#dcfce7 | `bg-green-100 text-green-700` |
| Badge Lỗi | background | destructive-subtle | ~#fee2e2 | `bg-red-100 text-red-700` |

## §3 State Table

| State | Trigger | hasFile | previewLoaded | Xác nhận enabled | Pagination visible |
|---|---|---|---|---|---|
| `initial` | Page mount, no file | false | false | disabled | hidden |
| `file_selected_parsing` | User selects file, parse in progress | true | false | disabled | hidden |
| `preview_loaded_no_errors` | Parse success, all valid | true | true | enabled | visible |
| `preview_loaded_with_errors` | Parse success, some errors | true | true | enabled (partial commit possible per FEAT/BA) | visible |
| `file_rejected` | Format wrong / empty / > 500 rows per AC-3b ERR-INV-041 | true | false | disabled | hidden |
| `submitting` | User clicks Xác nhận | true | true | disabled (spinner) | visible |
| `success` | Backend commit → navigate FEAT-CAT-PROD-LIST | (unmount) | — | — | — |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| PageHeader | `share/page-header/3` | `{ title, backLink, actions: [cancel, confirm] }` | Header variant 3 |
| BackLink / IconButton | `ui/button` variant="ghost" size="icon" | (icon) | Ghost |
| CancelButton | `ui/button` variant="outline" | `{ children: "Huỷ bỏ" }` | Outline |
| ConfirmButton | `ui/button` variant="brand" | `{ children: "Xác nhận", disabled }` | Brand |
| SectionTitle | `share/section/title-text` | `{ text }` | Reuse |
| TemplateDownloadLink | `ui/link` with icon | `{ href, icon }` | Anchor |
| DropZone | `share/dropzone/file-upload` | `{ accept: ".xlsx", multiple: false, onDrop, onClick }` | Custom |
| FileCard | `share/file-card` | `{ name, size, onDelete }` | Reuse from OB-IMPORT parity |
| Filter tabs | `ui/tabs` or 3 `ui/button` toggle | `{ value, onValueChange }` | 3-tab |
| Stats pills | inline `<Text>` | (§2 tokens) | No wrapper |
| DownloadErrorButton | `ui/button` variant="outline" | `{ leadingIcon, disabled }` | Outline |
| Table | `ui/table` (shadcn) | `{ columns, rows, sticky-header: true }` | shadcn Table with horizontal scroll for wide cols |
| Badge | `ui/badge` | `{ variant: "success" \| "destructive" }` | shadcn Badge |
| Pagination | `share/table-pagination` | `{ pageSize, currentPage, totalCount, onPageChange }` | Reuse |

## §5 Field Composition Schema

Upload + preview payload:

```yaml
UploadProductCatalogFileInput:
  interface: UploadProductCatalogFileInput
  fields:
    - name: file
      type: File
      binding: DropZone.selectedFile
      combined: false
      validate: "MIME .xlsx per AC-3b → ERR-INV-* if wrong; ≤ 500 rows per AC-3b → ERR-INV-041 if exceed"

UploadProductCatalogFileResult:
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

PreviewRow:
  fields:
    - { name: rowNumber, type: int }
    - { name: product, type: { internalCode: string, name: string, unit: string } }
    - { name: costingMethod, type: string, _default: "'Bình quân cuối kỳ' hardcoded per BR-CAT-PROD-010" }
    - { name: brand, type: string?, _validate: "free-text no validate" }
    - { name: origin, type: string?, _validate: "khớp master per BR-CAT-PROD-023 → ERR-INV-044 if mismatch" }
    - { name: nature, type: string, _validate: "4 hợp lệ per BR-CAT-PROD-019 → ERR-INV-012 if mismatch" }
    - { name: group, type: string?, _validate: "khớp master per BR-CAT-PROD-022 → ERR-INV-043; empty OK" }
    - { name: specification, type: string? }
    - { name: status, type: "'Hợp lệ' | 'Lỗi'" }
    - { name: errorReason, type: string?, _renders: "shortened wording (Sai mã / ĐVT lệch / Trùng mã / Tính chất sai / Xuất xứ không khớp) per AC-5" }
    - { name: errorCodes, type: string[]?, _renders: "API contract full codes (ERR-INV-006/007/012/041/042/043/044) per AC-5" }
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Page | 1440 | — | Navbar + SubNav + PageContent + Footer | Full-bleed |
| PageContent | 1440 | { x: 80, y: 0 } | 1280 content | Consistent với AP + OB-IMPORT |
| PageHeader | 1280 | { x: 32, y: 0 } | TitleGroup + ActionRow | space-between |
| ThongTinCoBanSection | 1216 | 0 | SectionTitle + TemplateLink + DropZone + FileCard | 1280 - 64 |
| DropZone | 1216 | { y: 24, x: 16 } | Icon + Prompt + Hint centered | Dashed border |
| FileCard | 1216 | { y: 12, x: 16 } | FileInfoGroup + DeleteButton | space-between |
| PreviewSection | 1216 | 0 | FilterAndStatsRow + PreviewTable + Pagination | Vertical stack |
| FilterAndStatsRow | 1216 | 0 | LeftGroup (~950) + DownloadErrorButton (~120) | space-between |
| PreviewTable | 1216 | 0 | 12 cols sum ~1981 (60+185+178+120+180+120+120+180+180+168+154+168+168) | ⚠ EXCEEDS 1216 — horizontal scroll required |
| PaginationRow | 1216 | 0 | PageSizeSelector + PageNavigator | space-between |

**Table overflow**: Sum of cols = 1981 > 1216 viewport. Implementation `overflow-x: auto` on `<div class="table-scroll-container">` wrapping table.

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - ConfirmButton "Xác nhận" (brand blue top-right — final commit)
  - PageTitle "Tải lên danh mục sản phẩm" (H1)

Level 2 (secondary):
  - CancelButton "Huỷ bỏ" (outline)
  - SectionTitle "Thông tin cơ bản"
  - TemplateDownloadLink (blue link — key prerequisite)
  - DropZone (prominent for interaction)

Level 3 (tertiary):
  - FileCard (post-upload indicator)
  - StatsPills (color-coded counts — health summary)

Level 4 (data):
  - PreviewTable rows với badges (Trạng thái colored high visibility)

Level 5 (utility):
  - Filter tabs + search + Tải file lỗi + Pagination
  - SectionFooter
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-CAT-PROD-IMP-1 | Render wizard stepper multi-step "Tải Template → Kiểm tra dữ liệu" per FEAT AC-1 | Figma canonical PNG single-page pattern (parity với OB-IMPORT); FEAT wording drift. Implementation follows PNG single-page + note gap for BA to reconcile | FEAT AC-1 vs PNG divergence |
| AP-CAT-PROD-IMP-2 | Enable Xác nhận before parse completes | Xác nhận disabled until previewLoaded per FEAT-parity | State Table + OB-IMPORT convention |
| AP-CAT-PROD-IMP-3 | Accept .xls / .csv per Figma hint | Only .xlsx per AC-3b explicit; Figma hint stale draft | FEAT AC-3b authoritative |
| AP-CAT-PROD-IMP-4 | Render 'Phương pháp tính giá' as editable col in preview | Per FEAT AC-2 explicit template KHÔNG có col này; server hardcode 'Bình quân cuối kỳ' per BR-CAT-PROD-010. Implementation may HIDE col hoặc render read-only default (Figma shows col — coverage_gap) | FEAT AC-2 + BR-CAT-PROD-010/018 |
| AP-CAT-PROD-IMP-5 | > 500 rows accepted | Per AC-3b + BR-CAT-PROD-020 reject 500+ rows với ERR-INV-041 | FEAT AC-3b explicit |
| AP-CAT-PROD-IMP-6 | Validate 'Thương hiệu' against master danh mục | Thương hiệu FREE-TEXT no validate per AC-2 explicit | FEAT AC-2 explicit |
| AP-CAT-PROD-IMP-7 | Tính chất free-text | 4 giá trị hợp lệ ENUM per BR-CAT-PROD-019: Vật tư hàng hóa / CCDC / Dịch vụ / Khác → ERR-INV-012 if mismatch | FEAT AC-5 + BR |
| AP-CAT-PROD-IMP-8 | Skip 'Lý do lỗi' col | AC-4/AC-5 require 'Lý do lỗi' + shortened wording (Sai mã / ĐVT lệch / Trùng mã / Tính chất sai / Xuất xứ không khớp) | FEAT AC-4 + AC-5 |
| AP-CAT-PROD-IMP-9 | Skip 'Nhóm sản phẩm' validation (assume optional field skip) | Group VALIDATE against master per BR-CAT-PROD-022 → ERR-INV-043 nếu 'Ngừng hoạt động'; empty OK per AC-5 | FEAT AC-5 explicit "Bỏ trống nhóm = hợp lệ" nhưng validate nếu điền |
| AP-CAT-PROD-IMP-10 | Use `lucide-react` | `iconsax-reactjs` per convention v7.6 | R4.1 |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 14601:133301 | initial (no file) | assets/wave04-cat-prod-import/14601-133301.png | 1440×822 |
| 14601:133897 | file_selected (parsing/parsed pre-preview) | (reuses assets/wave04-cat-prod-import/14601-134126.png for shared parts) | 1440×822 |
| 14601:134126 | preview_loaded (full preview + pagination) | assets/wave04-cat-prod-import/14601-134126.png | 1440×1020 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Màn 'Tải lên danh mục sản phẩm' + template link + drop zone + Đóng button | PageHeader + Section | 14601:133301 + 14601:134126 | ✓ (wizard vs single-page divergence — coverage_gap; implementation single-page per PNG) |
| AC-2 | Template 4-tab xlsx (Import Mã nội bộ + Xuất xứ + Tính chất + ĐVT) + no Phương pháp tính giá col | TemplateDownloadLink (server contract) | 14601:133301 | ✓ (server 4-tab) — Phương pháp tính giá col drift in Figma preview |
| AC-3 | Drop zone .xlsx + file card + không ghi ở bước chọn file | DropZone + FileCard + no auto-commit | 14601:134126 | ✓ |
| AC-3b | Reject wrong format / empty / > 500 rows với ERR-INV-041 | (client MIME + backend guardrail) | (dialog error missing from Figma) | ⚠ |
| AC-4 | Preview 3 stats + search + 3-tab filter + Tải file lỗi + wide table + pagination | FilterAndStatsRow + PreviewTable + Pagination | 14601:134126 | ✓ |
| AC-5 | Validation rules + shortened errorReason per row | LyDoLoiCell + backend guardrail | 14601:134126 | ✓ |
| AC-6..AC-8 | Detailed rules (whitelist ký tự / ERR-INV-* codes) | (backend guardrail + errorReason render) | — | ⚠ (backend errcode registry) |

## Coverage Gaps

- **Wizard vs single-page**: FEAT AC-1 explicit 2-step wizard; Figma canonical single-page. Implementation follows Figma single-page (also OB-IMPORT parity). BA reconcile FEAT wording.
- **Phương pháp tính giá col**: Figma preview shows col; FEAT AC-2 explicit template KHÔNG có. Implementation options: (a) hide col in preview, (b) render read-only 'Bình quân cuối kỳ' hardcoded default. Recommend (b) for transparency. BA confirm.
- **Header buttons in Frame 1**: Figma initial state PNG NO Huỷ bỏ/Xác nhận. Implementation adds per FEAT-parity + OB-IMPORT convention.
- **Frame 4 dialog overlay + Frames 5-6 detail tables**: Figma has extras (14601:135187 dialog + 2 stale 'Lỗi hiển thị nhiều cột' table frames marked for fix by designer). Not covered in canonical spec.
- **File format**: Figma hint '.xls/.xlsx/.csv' vs FEAT AC-3b '.xlsx only'. Follow FEAT.
- **Error dialog (ERR-INV-041)**: File > 500 rows / empty / wrong format → dialog error; Figma frame missing.
