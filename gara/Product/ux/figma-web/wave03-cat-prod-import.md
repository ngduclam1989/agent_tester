---
feat: FEAT-CAT-PROD-IMPORT
feat_file: Product/features/FEAT-CAT-PROD-IMPORT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87154&t=fE3MKR6uAHS9vkKm-4
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87154"
fetched_at: "2026-06-29T06:43Z"
transform_version: 7
transform_mode: fresh-fetch
manual_annotations:
  - "2026-06-30: Reference implementation pointer added (/customers/import) — Delivery Authority directive (user)."
screenshots: true
screens_expected: 4
status: ACTIVE
coverage_gaps:
  - "AC-1: design loại bỏ wizard 2-bước (Tải Template → Kiểm tra dữ liệu) và nút 'Đóng' — thay bằng full-page layout với back-arrow + 'Huỷ bỏ'/'Xác nhận' khi sang preview. Tracker BR."
  - "AC-2: nút 'Tải template' thay bằng link icon 'Mẫu file danh sách sản phẩm.xlsx' (link variant)."
  - "AC-2/AC-3: design hỗ trợ '.xls, .xlsx, .csv' (text trên Dropzone) nhưng AC-3b chỉ chấp nhận .xlsx → drift label vs BR."
  - "AC-4: column header thứ 9 'Nhóm sản phẩm' khác canonical 'Nhóm vật tư/hàng hoá' (BR-CAT-PROD-018) — design drift."
  - "AC-8: design không có màn 'Kết quả import' với chỉ số Tạo mới/Cập nhật/Bỏ qua + nút 'Tải file lỗi' + 'Đóng'. Thay bằng Toast 'Tải tệp lên thành công!' top-right (Screen 4). Tracker BR — design under-covers AC-8 scope."
  - "AC-9: nút 'Tải file lỗi' không có trong design (do AC-8 collapse)."
---

# FEAT-CAT-PROD-IMPORT — Spec (web)

> Tải lên danh mục sản phẩm — full-page (KHÔNG còn dialog wizard) với 4 trạng thái: **Empty Upload** → **Uploaded File** (file đã chọn, chưa preview) → **Preview** (table 13 cột + StatsRow + Huỷ bỏ/Xác nhận buttons) → **Success Toast** (sau khi confirm).
>
> Per-frame PNG NATIVE 1440×822 / 1440×822 / 1440×990 / 1440×900 (root section width 9393 → per-frame mandatory per §3.1.1 chống G7 downscale trap). Spec emit theo v7.5: R9 verbatim labels + R10 `_children_count` per multi-instance container.
>
> Table có 13 cột (preview state). Toast là transient overlay state, không phải full page.

> **🔁 Reference implementation (manual annotation 2026-06-30)** — Pattern 2-step verify→confirm đã có sẵn ở `/customers/import`: route `frontend/gf-gms-web/src/routes/_modules/_customers/customers/import.tsx` + component `src/features/customers/components/import/index.tsx` + hooks `use-verify-import-customer.ts` / `use-import-customers.ts`. **DEV PHẢI đọc trước khi viết code** — copy structure (xlsx client parse, StatsRow, PreviewTable, error file download), thay schema cột + GraphQL ops + error code map (ERR-CUS-\* → ERR-INV-041/044/045). Khi visual Figma ở spec này đụng độ pattern reference: **Figma thắng visual** (token, label, layout), nhưng **state machine + naming + module structure bám reference**. Mục tiêu: prevent inconsistency giữa 2 import flow cùng repo.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | Back arrow leading H1 trong PageHeader | `14601-133301.png` L11 left of "Tải lên danh mục sản phẩm" |
| vuesax/linear/document-text-1 | lucide-react | — | File-doc icon leading TemplateLink "Mẫu file..." | `14601-133301.png` L14 left of "Mẫu file danh sách sản phẩm.xlsx" |
| vuesax/linear/document-upload | lucide-react | — | Cloud-upload icon centered trong Dropzone | `14601-133301.png` L19 centered above "Kéo thả hoặc nhấn để chọn tệp" |
| xls-file-badge | local asset | — | Green badge "XLS" leading UploadedFileItem | `14601-133897.png` L25 leading "Filename.format" |
| vuesax/linear/trash | lucide-react | — | Trash row-end icon trong UploadedFileItem | `14601-133897.png` L25 right of "1.3MB" |
| vuesax/bold/tick-circle | lucide-react | — | Filled check-circle icon trong Toast | `14601-135187.png` L8 leading "Tải tệp lên thành công!" |
| vuesax/linear/close | lucide-react | — | Close X icon trailing Toast | `14601-135187.png` L8 trailing toast message |
| vuesax/linear/arrow-left-2 | lucide-react | — | Pagination "Trước" leading | `14601-134126.png` L48 before "Trước" |
| vuesax/linear/arrow-right-2 | lucide-react | — | Pagination "Tiếp" trailing | `14601-134126.png` L48 after "Tiếp" |
| vuesax/linear/arrow-down-2 | lucide-react | — | Chevron trailing Select "5 mỗi trang" | `14601-134126.png` L48 trailing "5" in PageSize |

---

## Screen: Empty Upload (14601:133301)

> Trạng thái khởi tạo — chưa có file. PageHeader chỉ có back-arrow + H1, KHÔNG có action buttons. Section gồm SectionTitle + TemplateLink + Dropzone.

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [GMS] Tổng quan  Mua hàng  Sửa chữa & Dịch vụ  Tồn kho  Khách hàng  Marketing  Nhân viên  [Danh mục] 🔔│
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Danh sách sản phẩm]  Nhóm vật tư hàng hóa  Kỳ kế toán                                                │
│ ─────────────────                                                                                     │
│                                                                                                       │
│   ←  Tải lên danh mục sản phẩm                                                                        │
│                                                                                                       │
│   Thông tin cơ bản                                                                                    │
│                                                                                                       │
│   📄  Mẫu file danh sách sản phẩm.xlsx                                                                 │
│                                                                                                       │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   ┊                                  (☁ icon)                                                    ┊   │
│   ┊                       Kéo thả hoặc nhấn để chọn tệp                                          ┊   │
│   ┊                            Hỗ trợ file: .xls, .xlsx, .csv                                    ┊   │
│   └───────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                       │
│                                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0          Hướng dẫn sử dụng  Hỗ trợ  Hotline: 0985135050│
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
Page:
  layout: vertical-stack
  children:
    - Navbar:
        _children_count: 8  # 7 nav links + 1 active "Danh mục" button (per metadata 14601:133302)
        _png_verified: "14601-133301.png L1 — top blue bar"
        layout: horizontal
        children:
          - Logo: { label: "GMS", icon: "gms-mark" }
          - NavItem: { label: "Tổng quan",            _png_verified: "L1 second slot" }
          - NavItem: { label: "Mua hàng",              _png_verified: "L1" }
          - NavItem: { label: "Sửa chữa & Dịch vụ",   _png_verified: "L1" }
          - NavItem: { label: "Tồn kho",               _png_verified: "L1" }
          - NavItem: { label: "Khách hàng",            _png_verified: "L1" }
          - NavItem: { label: "Marketing",             _png_verified: "L1" }
          - NavItem: { label: "Nhân viên",             _png_verified: "L1" }
          - NavButton: { label: "Danh mục", variant: "active-white", _png_verified: "L1 right side white button" }
          - Bell: { variant: "icon-button", badge_dot: true }
          - Avatar: {}
    - TabStrip:
        _children_count: 3
        _png_verified: "14601-133301.png L4 below navbar"
        children:
          - Tab: { label: "Danh sách sản phẩm",    active: true, _png_verified: "L4 blue underline" }
          - Tab: { label: "Nhóm vật tư hàng hóa",  active: false, _png_verified: "L4" }
          - Tab: { label: "Kỳ kế toán",              active: false, _png_verified: "L4" }
    - PageContent:
        layout: vertical-stack
        children:
          - PageContainer:
              max_width: 1216
              padding_x: 32
              children:
                - PageHeader:
                    layout: horizontal-space-between
                    children:
                      - HeaderLeft:
                          layout: horizontal-gap-12
                          children:
                            - Icon: { name: "arrow-left", variant: "ghost-icon-button", _png_verified: "L11 ← arrow" }
                            - H1: { label: "Tải lên danh mục sản phẩm", weight: "semibold", size: "2x-large", _png_verified: "L11 verbatim" }
                      - HeaderActionGroup:
                          present: false  # Screen 1 NO action buttons in header
                - Section:
                    children:
                      - SectionTitle: { label: "Thông tin cơ bản", weight: "semibold", size: "base", _png_verified: "L13 verbatim" }
                      - TemplateLink:
                          variant: "link-brand"
                          icon: "document-text-1"
                          label: "Mẫu file danh sách sản phẩm.xlsx"
                          color_token: "base/foreground-link"
                          _png_verified: "L14 blue underlined link with leading doc icon"
                      - Dropzone:
                          _children_count: 1  # 1 Upload/CTA inner content block (metadata 14601:133855..56)
                          variant: "dashed-border"
                          height: 120
                          children:
                            - DropzoneInner:
                                layout: vertical-center
                                children:
                                  - Icon: { name: "document-upload", bg: "circular-light", _png_verified: "L19 cloud-up centered" }
                                  - Text: { label: "Kéo thả hoặc nhấn để chọn tệp", inline_link_part: "nhấn để chọn tệp", _png_verified: "L20 primary verbatim; 'nhấn để chọn tệp' rendered as inline link color base/foreground-link" }
                                  - Subtext: { label: "Hỗ trợ file: .xls, .xlsx, .csv", color: "muted-foreground", size: "extra-small", _png_verified: "L21 verbatim" }
                      - UploadedFileItem: { present: false }   # Screen 1
                      - StatsRow:             { present: false }   # Screen 1
                      - PreviewTable:         { present: false }   # Screen 1
                      - TablePagination:      { present: false }   # Screen 1
    - Footer:
        _children_count: 2  # FooterLeft + FooterRight
        layout: horizontal-space-between
        children:
          - FooterLeft: { label: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0", color: "muted-foreground", size: "extra-small", _png_verified: "L29 left bottom" }
          - FooterRight:
              _children_count: 3
              layout: horizontal-gap-24
              children:
                - Link: { label: "Hướng dẫn sử dụng",  _png_verified: "L29 right" }
                - Link: { label: "Hỗ trợ",                _png_verified: "L29 right" }
                - Text: { label: "Hotline: 0985135050", _png_verified: "L29 verbatim phone format" }
    - Toast: { present: false }  # Screen 1
```

### §2 Design Token Map

```yaml
tokens:
  background:
    Page:             "base/background = #ffffff"
    Navbar:           "base/background-brand-CD = #0052ff"
    Dropzone_border:  "base/input = #d4d4d8 (dashed)"
    SectionTitle_text:"base/foreground = #18181b"
  typography:
    H1:               "text 2x-large/leading-normal/semibold (24/32 semibold)"
    SectionTitle:     "text base/leading-normal/semibold (16/24 semibold)"
    DropzonePrimary:  "text small/leading-normal/regular (14/20 regular)"
    DropzoneSubtext:  "text extra-small/leading-normal/regular (12/16 regular) — muted"
    Footer:           "text extra-small/leading-normal/regular (12/16) — muted"
  link:
    TemplateLink:     "base/foreground-link = #1d4ed8 underline"
    InlineLink:       "base/foreground-link = #1d4ed8 (nhấn để chọn tệp)"
  spacing:
    SectionPadding:   "spacing/6 = 24 between SectionTitle/TemplateLink/Dropzone"
    PageContainerPad: "padding-x: spacing/8 = 32"
  border_radius:
    Dropzone:         "border radius/lg = 8 (dashed border-1)"
    Button:           "border radius/md = 6"
```

### §3 State Table

```yaml
states:
  - state: "Empty Upload"
    when: "Mở Tải lên (AC-1) lần đầu, chưa chọn file"
    visible: [Navbar, TabStrip, PageHeader_NoButtons, SectionTitle, TemplateLink, Dropzone, Footer]
    hidden:  [UploadedFileItem, StatsRow, PreviewTable, TablePagination, HeaderActionGroup, Toast]
  - state: "Dropzone hover (interaction)"
    when: "Hover hoặc drag-over Dropzone"
    visible: same as Empty
    hidden:  same
    note: "Visual change (border highlight) — không capture trong Figma; suy theo dropzone library default."
```

### §4 Component Prop Map

```yaml
PageHeader:
  props:
    onBack: "() => navigate('/danh-muc/san-pham')"
    title: "Tải lên danh mục sản phẩm"
    actions: null            # Empty Upload: KHÔNG có action group
    read_only: false
TemplateLink:
  props:
    href: "/templates/cat-prod-import-template.xlsx" # production: garage-web serve per ADR-018
    label: "Mẫu file danh sách sản phẩm.xlsx"
    icon: "document-text-1"
    variant: "link-brand"
    download: true
Dropzone:
  props:
    accept: "[design] .xls, .xlsx, .csv | [BR/AC-3b] chỉ .xlsx được chấp nhận"
    multiple: false
    maxSize: "no design label — theo BR ≤500 dòng (validate sau khi upload)"
    onDrop: "(files) => setFile(file)"
    primaryText: "Kéo thả hoặc nhấn để chọn tệp"
    inlineLinkPart: "nhấn để chọn tệp"
    subtitleText: "Hỗ trợ file: .xls, .xlsx, .csv"
    read_only: false
```

### §5 Field Composition Schema

```yaml
fields:
  - id: "file"
    type: "file"
    accept_design: ".xls,.xlsx,.csv"
    accept_business_rule: ".xlsx"     # AC-3b — drift, dev đối chiếu BR canonical
    required: true
    read_only: false
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| Page | 1440 | Frame width |
| PageContainer | 1280 | Frame container (x=80 left, padding-x=32) |
| Content | 1216 | Inside PageContainer |
| Section | 1216 | Full content width |
| Dropzone | 1216 | Full section width, height=120 |
| Navbar | 1440 | Full page width |
| TabStrip | 1440 | Full page width |
| Footer | 1440 | Full page width |
| PageHeader | 1216 | Inside container |
| H1 | auto | text content width |
| TemplateLink | auto | inline link |

### §7 Visual Hierarchy Map

```yaml
hierarchy:
  primary:
    - PageHeader.H1 "Tải lên danh mục sản phẩm"
    - Dropzone primary CTA
  secondary:
    - TemplateLink (mẫu file download)
    - SectionTitle "Thông tin cơ bản"
  tertiary:
    - Dropzone subtext (file types)
    - Footer info
```

### §8 Anti-Pattern Trap

```yaml
traps:
  - id: "TAP-1-EmptyHeaderActions"
    rule: "PageHeader Screen 1 KHÔNG có HeaderActionGroup (Huỷ bỏ / Xác nhận chỉ xuất hiện ở Screen 3 Preview)."
    _png_verified: "14601-133301.png L11 chỉ thấy ← + H1, KHÔNG có button bên phải"
  - id: "TAP-2-NoButtonTaiTemplate"
    rule: "Design KHÔNG dùng Button 'Tải template' — chỉ TemplateLink (icon + blue link text). AC-2 prose 'nút Tải template' = drift; theo design label verbatim 'Mẫu file danh sách sản phẩm.xlsx'."
    _png_verified: "14601-133301.png L14 — link, không phải button block"
  - id: "TAP-3-NoWizardStepper"
    rule: "KHÔNG render wizard stepper 'Tải Template → Kiểm tra dữ liệu' (AC-1 cũ). Design là full-page, transition Screen 1→2→3 inline, không có step indicator."
    _png_verified: "All 3 wizard PNGs — không có breadcrumb/stepper component"
  - id: "TAP-4-DropzoneAcceptDrift"
    rule: "Dropzone subtitle text verbatim '.xls, .xlsx, .csv' nhưng BR chỉ chấp nhận .xlsx. Dev: hiển thị label như design (verbatim), validate theo BR (reject non-.xlsx ở client-side trước upload)."
    _png_verified: "14601-133301.png L21 verbatim subtitle"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-import/14601-133301.png
verified_at: "2026-06-29T06:45Z"
claims_verified:
  - claim: "Navbar có 7 nav text + 1 active 'Danh mục' button white-bg + Bell + Avatar"
    png_source: "14601-133301.png L1"
    verified: true
  - claim: "TabStrip có 3 tabs: 'Danh sách sản phẩm' (active, blue underline) + 'Nhóm vật tư hàng hóa' + 'Kỳ kế toán'"
    png_source: "14601-133301.png L4"
    verified: true
  - claim: "PageHeader chỉ có back arrow + H1 'Tải lên danh mục sản phẩm', KHÔNG có action button bên phải"
    png_source: "14601-133301.png L11"
    verified: true
  - claim: "TemplateLink verbatim 'Mẫu file danh sách sản phẩm.xlsx' (blue, doc icon leading)"
    png_source: "14601-133301.png L14"
    verified: true
  - claim: "Dropzone dashed border, cloud-upload icon centered, primary text 'Kéo thả hoặc nhấn để chọn tệp' với 'nhấn để chọn tệp' là inline link, subtitle 'Hỗ trợ file: .xls, .xlsx, .csv'"
    png_source: "14601-133301.png L19-L21"
    verified: true
  - claim: "Footer left 'Phần mềm quản lý Garage (G.M.S), phiên bản 2.0' + right Hướng dẫn sử dụng | Hỗ trợ | Hotline: 0985135050"
    png_source: "14601-133301.png L29"
    verified: true
```

### §9 Container Hierarchy (legacy)

```
Page
└─ Navbar
└─ TabStrip
└─ PageContent
   └─ PageContainer
      └─ PageHeader (no actions)
      └─ Section
         ├─ SectionTitle "Thông tin cơ bản"
         ├─ TemplateLink "Mẫu file danh sách sản phẩm.xlsx"
         └─ Dropzone (icon + primary + subtitle)
└─ Footer
```

---

## Screen: Uploaded File (14601:133897)

> Sau khi user chọn file. UploadedFileItem xuất hiện DƯỚI Dropzone (Dropzone vẫn visible). PageHeader VẪN chưa có action buttons.

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [GMS] Tổng quan ... Nhân viên  [Danh mục]                                                          🔔│
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Danh sách sản phẩm]  Nhóm vật tư hàng hóa  Kỳ kế toán                                                │
│ ─────────────────                                                                                     │
│                                                                                                       │
│   ←  Tải lên danh mục sản phẩm                                                                        │
│                                                                                                       │
│   Thông tin cơ bản                                                                                    │
│                                                                                                       │
│   📄  Mẫu file danh sách sản phẩm.xlsx                                                                 │
│                                                                                                       │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   ┊                          (☁) Kéo thả hoặc nhấn để chọn tệp                                  ┊   │
│   ┊                              Hỗ trợ file: .xls, .xlsx, .csv                                  ┊   │
│   └───────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                       │
│   ┌───────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ [xls-green]  Filename.format                                                                   [🗑] │   │
│   │        1.3MB                                                                                  │   │
│   └───────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0          Hướng dẫn sử dụng  Hỗ trợ  Hotline: 0985135050│
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
Page:
  inherits: "Screen Empty Upload — same shell"
  override:
    - PageContent.Section.UploadedFileItem:
        present: true
        _children_count: 4  # Badge + Filename + Filesize + DeleteIcon (per metadata 14601:134102)
        layout: horizontal-row
        height: 64
        children:
          - FileBadge:    { label: "xls-green", variant: "xls-green", icon: "xls-doc", _png_verified: "14601-133897.png L25 green badge XLS leading" }
          - FileMeta:
              layout: vertical-stack-gap-2
              children:
                - Filename: { label: "Filename.format", weight: "medium", size: "small", _png_verified: "L25 main row" }
                - Filesize: { label: "1.3MB", color: "muted-foreground", size: "extra-small", _png_verified: "L25 sub row" }
          - Icon: { name: "trash", variant: "ghost-icon-button", aria_label: "Xoá tệp", _png_verified: "L25 right of 1.3MB" }
    - PageContent.Section.HeaderActionGroup:
        present: false  # Screen 2 vẫn chưa có buttons
```

### §2 Design Token Map

```yaml
tokens:
  inherits: "Empty Upload"
  add:
    UploadedFileItem:
      background:   "base/background = #ffffff"
      border:       "base/border = #e4e4e7 — 1px solid"
      border_radius:"border radius/md = 6"
      padding:      "spacing/4 = 16"
    FileBadge:
      background:   "green (#0F9D58-ish — XLS brand)"
      foreground:   "white"
    DeleteIcon:
      color:        "base/foreground = #18181b"
      hover_color:  "base/foreground-error = #dc2626"
```

### §3 State Table

```yaml
states:
  - state: "Uploaded File (file chọn xong, chờ preview)"
    when: "User drop/select file hợp lệ"
    visible: [Navbar, TabStrip, PageHeader_NoButtons, SectionTitle, TemplateLink, Dropzone, UploadedFileItem, Footer]
    hidden:  [StatsRow, PreviewTable, TablePagination, HeaderActionGroup, Toast]
  - state: "Auto-transition (1-2s)"
    when: "File hợp lệ — hệ thống parse & validate"
    note: "Sau khoảnh khắc này → Screen 3 Preview tự load (không cần button Next)."
```

### §4 Component Prop Map

```yaml
UploadedFileItem:
  props:
    fileName: "string từ File API name"
    fileSize: "human-readable, format '1.3MB'"
    fileType: "extension badge — green XLS"
    onDelete: "() => clearFile(); reset Screen → Empty"
    read_only: false
PageHeader:
  inherits: "Empty Upload (KHÔNG có HeaderActionGroup)"
```

### §5 Field Composition Schema

```yaml
fields:
  - id: "file"
    type: "file"
    state: "selected"        # đã chọn
    selectedFile:
      name: "Filename.format"  # placeholder design
      size: "1.3MB"            # placeholder design
    read_only: false
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| (inherits Empty Upload) | — | — |
| UploadedFileItem | 1216 | Full section width |
| FileBadge | 36 | Square badge |
| FileMeta | auto | takes remaining flex |
| DeleteIcon | 40 | Square hit area |

### §7 Visual Hierarchy Map

```yaml
hierarchy:
  primary:
    - PageHeader.H1
    - UploadedFileItem (newly added affordance)
  secondary:
    - Dropzone (still active for re-select)
    - TemplateLink
  tertiary:
    - Footer
```

### §8 Anti-Pattern Trap

```yaml
traps:
  - id: "TAP-5-NoExplicitNextButton"
    rule: "Sau khi upload, KHÔNG có button 'Tiếp tục' / 'Preview' — design giả định auto-transition sang Preview (Screen 3) khi file parse xong. Dev: spinner/loading state trong gap window."
    _png_verified: "14601-133897.png — chỉ Dropzone + UploadedFileItem, không có CTA button"
  - id: "TAP-6-DropzoneStillVisible"
    rule: "Dropzone VẪN visible sau khi upload — cho phép user drop file khác để replace. KHÔNG hide Dropzone."
    _png_verified: "14601-133897.png L17-L21 + L25 cả hai cùng visible"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-import/14601-133897.png
verified_at: "2026-06-29T06:45Z"
claims_verified:
  - claim: "PageHeader vẫn KHÔNG có action buttons (Huỷ bỏ / Xác nhận) ở Screen 2 — chỉ back arrow + H1"
    png_source: "14601-133897.png L11"
    verified: true
  - claim: "Dropzone vẫn visible (dashed border, cloud icon, label) — không bị hide sau khi upload"
    png_source: "14601-133897.png L17-L21"
    verified: true
  - claim: "UploadedFileItem 1 row: green XLS badge bên trái + 'Filename.format' (medium) + '1.3MB' (muted) + trash icon bên phải"
    png_source: "14601-133897.png L25"
    verified: true
```

### §9 Container Hierarchy (legacy)

```
Page
└─ (same as Empty Upload) + Section
   └─ UploadedFileItem
      ├─ FileBadge (XLS green)
      ├─ FileMeta (Filename.format + 1.3MB)
      └─ DeleteIcon (trash)
```

---

## Screen: Preview (14601:134126)

> Sau khi file parse xong: PageHeader xuất hiện 2 buttons (Huỷ bỏ + Xác nhận), StatsRow hiển thị Hợp lệ/Không hợp lệ, PreviewTable 13 cột × 5 rows/page, TablePagination phân trang. Đây là trạng thái CORE của FEAT.

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [GMS] Tổng quan ... Nhân viên  [Danh mục]                                                          🔔│
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Danh sách sản phẩm]  Nhóm vật tư hàng hóa  Kỳ kế toán                                                │
│ ─────────────────                                                                                     │
│                                                                                                       │
│   ←  Tải lên danh mục sản phẩm                                       [Huỷ bỏ]  [Xác nhận]            │
│                                                                                                       │
│   Thông tin cơ bản                                                                                    │
│   📄  Mẫu file danh sách sản phẩm.xlsx                                                                 │
│   ┌─── Dropzone (vẫn visible) ─────────────────────────────────────────────────────────────────────┐  │
│   └────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│   ┌── [xls-green] Filename.format … 1.3MB                                                            [🗑] ┐  │
│   └────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                       │
│   Hợp lệ: 40    Không hợp lệ: 0                                                                       │
│                                                                                                       │
│   ┌───┬──────────────────┬─────────────┬──────────┬──────────────────┬───────────┬────────────────┐   │
│   │STT│ Mã sản phẩm nội bộ│ Tên sản phẩm│ ĐVT chính│Phương pháp tính giá│Thương hiệu│Xuất xứ│Tính chất│   │
│   │   │                   │             │          │                  │           │       │         │   │
│   │   │  + Nhóm sản phẩm │ Quy cách sp │ TSKT     │ Trạng thái       │ Lý do lỗi │       │         │   │
│   │   │                   │             │          │                  │           │       │         │   │
│   │ 1 │ AS78-1234-EDC9   │ Bộ má phanh │ Thùng    │ Bình quân cuối kỳ│ Mazuda    │ Nhật Bản│Vật tư hh│   │
│   │ 2 │ MN56-4567-WSX6   │ Lọc gió     │ Bình     │ Bình quân cuối kỳ│ Hyundai   │ Hàn Quốc│ ...     │   │
│   │ 3 │ VB34-7890-QAZ3   │ Bộ bugi     │ Thùng    │ Bình quân cuối kỳ│ Benzel    │ Đức    │ ...     │   │
│   │ 4 │ XC12-0123-REW0   │ Dây curoa cam│ Thùng   │ Bình quân cuối kỳ│ Amerix    │ Mỹ     │ ...     │   │
│   │ 5 │ ZA90-3456-UYT7   │ Kim phun NL │ Chiếc    │ Bình quân cuối kỳ│ Renault   │ Pháp   │ ...     │   │
│   └───┴──────────────────┴─────────────┴──────────┴──────────────────┴───────────┴────────────────┘   │
│                                                                                                       │
│   Hiển thị 5 ▾ mỗi trang                                         < Trước  1  [2]  3  …  Tiếp >        │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0          Hướng dẫn sử dụng  Hỗ trợ  Hotline: 0985135050│
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
Page:
  inherits: "Screen Uploaded File — same shell + add HeaderActionGroup, StatsRow, PreviewTable, TablePagination"
  override:
    - PageContent.PageHeader.HeaderActionGroup:
        present: true
        _children_count: 2  # Huỷ bỏ + Xác nhận (per metadata 14601:135194..15)
        layout: horizontal-gap-12
        children:
          - Button: { label: "Huỷ bỏ", variant: "outline", _png_verified: "14601-134126.png L11 right side first" }
          - Button: { label: "Xác nhận", variant: "brand", _png_verified: "14601-134126.png L11 right side second, blue bg #0052ff" }
    - PageContent.Section.StatsRow:
        present: true
        _children_count: 2
        layout: horizontal-gap-24
        children:
          - Stat:
              children:
                - Label: { label: "Hợp lệ:",         weight: "medium", _png_verified: "14601-134126.png L29 left" }
                - Value: { label: "40",                  color: "base/foreground-success = #16a34a", _png_verified: "L29 verbatim 40 in green" }
          - Stat:
              children:
                - Label: { label: "Không hợp lệ:", weight: "medium", _png_verified: "L29 second" }
                - Value: { label: "0",                   color: "base/foreground-error = #dc2626", _png_verified: "L29 verbatim 0 in red" }
    - PageContent.Section.PreviewTable:
        present: true
        layout: horizontal-scroll  # table width 1981 > section 1216
        children:
          - TableHead:
              _children_count: 13   # 13 columns per metadata (60+185+178+120+180+120+120+180+180+168+168+154+168 = 1981)
              columns:
                - { id: "stt",            label: "STT",                       width: 60,  align: "center", _png_verified: "14601-135303-table.png header L1" }
                - { id: "ma_san_pham",    label: "Mã sản phẩm nội bộ",    width: 185, _png_verified: "14601-135303-table.png header L1 verbatim incl diacritic 'phẩm'" }
                - { id: "ten_san_pham",   label: "Tên sản phẩm",            width: 178, _png_verified: "14601-135303-table.png header L1" }
                - { id: "dvt_chinh",      label: "ĐVT chính",                width: 120, _png_verified: "14601-135303-table.png header L1 verbatim suffix 'chính'" }
                - { id: "phuong_phap",    label: "Phương pháp tính giá",  width: 180, _png_verified: "14601-135303-table.png header L1 verbatim" }
                - { id: "thuong_hieu",    label: "Thương hiệu",              width: 120, _png_verified: "14601-135303-table.png header L1" }
                - { id: "xuat_xu",        label: "Xuất xứ",                    width: 120, _png_verified: "14601-135303-table.png header L1 verbatim 'Xuất xứ'" }
                - { id: "tinh_chat",      label: "Tính chất",                  width: 180, _png_verified: "14601-135303-table.png header L1" }
                - { id: "nhom_san_pham",  label: "Nhóm sản phẩm",            width: 180, _png_verified: "14601-135303-table.png header L1 verbatim; NOTE: BR canonical là 'Nhóm vật tư/hàng hoá' — design drift, dev follow design label" }
                - { id: "quy_cach",       label: "Quy cách sản phẩm",        width: 168, _png_verified: "14601-135303-table.png header L1 (cell content truncates với '...')" }
                - { id: "thong_so",       label: "Thông số kỹ thuật",       width: 168, _png_verified: "14601-135303-table.png header L1 (cell content truncates với '...')" }
                - { id: "trang_thai",     label: "Trạng thái",               width: 154, _png_verified: "14601-135303-table.png header L1; cell renders as Hợp lệ (green pill) hoặc Lỗi (red text)" }
                - { id: "ly_do_loi",      label: "Lý do lỗi",                width: 168, _png_verified: "14601-135303-table.png header L1 verbatim; cell empty cho row hợp lệ, '<reason>' cho row lỗi" }
          - TableBody:
              _children_count: 5  # 5 rows visible per page (per metadata 14601:134765..69 = 5 cells per column)
              rows:
                - { id: "row-template", placeholder: "Theo data từ AC-5 — mỗi row có 13 cells theo column order" }
              row_states:
                - state: "valid"
                  bg: "base/background = #ffffff"
                  status_cell: "Hợp lệ — green pill (base/background-success #f0fdf4 + foreground-success #16a34a + border-success #22c55e), border radius/full"
                  ly_do_loi: "empty"
                - state: "invalid"
                  bg: "base/background-error = #fef2f2 (light pink row tint)"
                  status_cell: "Lỗi — base/foreground-error #dc2626 text (NO badge background)"
                  ly_do_loi: "verbatim reason text — vd 'Sai mã'"
                  _png_verified: "14601-135303-table.png rows L3, L4 (background pink + 'Lỗi' red text + 'Sai mã' lý do)"
    - PageContent.Section.TablePagination:
        present: true
        _children_count: 2  # PageSize control + Pager
        layout: horizontal-space-between
        children:
          - PageSize:
              layout: horizontal-gap-2
              children:
                - Label: { label: "Hiển thị", color: "muted-foreground", _png_verified: "14601-134126.png L48 left" }
                - Select: { options: [5, 10, 20, 50], selected: 5, trailing_icon: "arrow-down-2", _png_verified: "L48 verbatim '5' + chevron" }
                - Label: { label: "mỗi trang", color: "muted-foreground", _png_verified: "L48 verbatim 'mỗi trang'" }
          - Pager:
              _children_count: 7   # Prev + 1 + 2 + 3 + ellipsis + Next + (selected indicator integrated)
              layout: horizontal-gap-4
              children:
                - PagerButton: { variant: "outline", icon: "arrow-left-2", label: "Trước", _png_verified: "L48 verbatim 'Trước'" }
                - PagerButton: { label: "1",  variant: "ghost" }
                - PagerButton: { label: "2",  variant: "active-outline", selected: true, _png_verified: "L48 page 2 has outline highlight" }
                - PagerButton: { label: "3",  variant: "ghost" }
                - Ellipsis:    { label: "…", _png_verified: "L48" }
                - PagerButton: { label: "Tiếp", trailing_icon: "arrow-right-2", variant: "ghost", _png_verified: "L48 verbatim 'Tiếp'" }
```

### §2 Design Token Map

```yaml
tokens:
  inherits: "Empty Upload + Uploaded File"
  add:
    HeaderActionGroup_Huybo:
      background:   "base/background = #ffffff"
      border:       "base/border = #e4e4e7"
      foreground:   "base/foreground = #18181b"
      border_radius:"border radius/md = 6"
      height:       "height/h-10 = 40"
    HeaderActionGroup_Xacnhan:
      background:   "base/background-brand-CD = #0052ff"
      foreground:   "base/primary-foreground = #ffffff"
      border_radius:"border radius/md = 6"
      height:       "height/h-10 = 40"
    StatsRow_Hople:
      label:        "base/foreground = #18181b"
      value:        "base/foreground-success = #16a34a"
    StatsRow_Khonghople:
      label:        "base/foreground = #18181b"
      value:        "base/foreground-error = #dc2626"
    TableHead:
      background:   "base/background = #ffffff"
      foreground:   "base/muted-foreground = #71717a"
      typography:   "text small/leading-normal/medium (14/20 medium)"
      border_bottom:"base/border = #e4e4e7"
    TableRow_Valid:
      background:   "base/background = #ffffff"
    TableRow_Invalid:
      background:   "base/background-error = #fef2f2"
    TrangThai_Hople:
      background:   "base/background-success = #f0fdf4"
      foreground:   "base/foreground-success = #16a34a"
      border:       "base/border-success = #22c55e"
      border_radius:"border radius/full = 9999 (pill)"
      typography:   "text extra-small/leading-normal/regular"
    TrangThai_Loi:
      foreground:   "base/foreground-error = #dc2626"
      background:   "transparent — NO pill"
      typography:   "text small/leading-normal/medium"
    TableLink_Ma:
      foreground:   "base/foreground-link = #1d4ed8"
      decoration:   "underline-none (only color)"
    Pagination_active:
      border:       "base/border = #e4e4e7 (outline)"
      foreground:   "base/foreground = #18181b"
      background:   "base/background = #ffffff"
```

### §3 State Table

```yaml
states:
  - state: "Preview — all valid"
    when: "File parse OK + tất cả rows hợp lệ"
    visible: [PageHeader_WithButtons, SectionTitle, TemplateLink, Dropzone, UploadedFileItem, StatsRow, PreviewTable, TablePagination]
    stats: { hop_le: 40, khong_hop_le: 0 }
    table_row_state: "all valid (white bg)"
  - state: "Preview — mixed valid + invalid"
    when: "File parse OK nhưng có rows lỗi (AC-5 violations)"
    visible: same
    stats: { hop_le: N, khong_hop_le: M }
    table_row_state: "invalid rows pink bg + 'Lỗi' red text + lý do trong column 13"
    _png_verified: "14601-135303-table.png L3, L4 — rows 3, 4 với pink bg + Lỗi text + 'Sai mã' lý do"
  - state: "Preview — all invalid"
    when: "Tất cả rows lỗi"
    note: "Xác nhận sẽ ghi 0 dòng (AC-6). Behavior tham chiếu EC-2."
  - state: "Confirm in-flight"
    when: "User nhấn Xác nhận"
    note: "Sau confirm → Toast (Screen 4)."
```

### §4 Component Prop Map

```yaml
PageHeader:
  override:
    actions:
      - { label: "Huỷ bỏ",  variant: "outline", onClick: "() => confirm-discard-then-back-to-list" }
      - { label: "Xác nhận", variant: "brand",   onClick: "() => callConfirmInternalProductImport()" }
StatsRow:
  props:
    valid_count:   "number — derived từ ValidateInternalProductImport response"
    invalid_count: "number — derived từ ValidateInternalProductImport response"
    read_only: true
PreviewTable:
  props:
    columns: "13 columns theo §1 column list"
    rows:    "array<RowDto> từ ValidateInternalProductImport.previewRows"
    rowKey:  "stt | id-derived"
    horizontalScroll: true  # table width 1981 > section 1216
    read_only: true
TablePagination:
  props:
    page_size: 5
    page_index: 2     # design state
    total_pages: "ceil(total / page_size)"
    options: [5, 10, 20, 50]
    read_only: false
```

### §5 Field Composition Schema

```yaml
preview_row:
  fields:
    - { id: "stt",           type: "number",  derived: true, label: "STT" }
    - { id: "ma_san_pham",   type: "link",     readonly_in_preview: true, label: "Mã sản phẩm nội bộ", color_token: "base/foreground-link" }
    - { id: "ten_san_pham",  type: "text",     readonly_in_preview: true, label: "Tên sản phẩm" }
    - { id: "dvt_chinh",     type: "text",     readonly_in_preview: true, label: "ĐVT chính" }
    - { id: "phuong_phap",   type: "text",     readonly_in_preview: true, label: "Phương pháp tính giá", default: "Bình quân cuối kỳ", system_derived: true, note: "AC-2 + BR-CAT-PROD-010 — luôn Bình quân cuối kỳ, không trong template" }
    - { id: "thuong_hieu",   type: "text",     readonly_in_preview: true, label: "Thương hiệu", validate: "free-text per AC-2 (no master validate)" }
    - { id: "xuat_xu",       type: "text",     readonly_in_preview: true, label: "Xuất xứ", validate: "master per BR-CAT-PROD-023" }
    - { id: "tinh_chat",     type: "enum",     readonly_in_preview: true, label: "Tính chất", enum: ["Vật tư hàng hoá", "CCDC", "Dịch vụ", "Khác"], validate: "BR-CAT-PROD-019" }
    - { id: "nhom_san_pham", type: "text",     readonly_in_preview: true, label: "Nhóm sản phẩm", validate: "master per BR-CAT-PROD-022 (canonical name: Nhóm vật tư/hàng hoá; design header drift)" }
    - { id: "quy_cach",      type: "text",     readonly_in_preview: true, label: "Quy cách sản phẩm", display_overflow: "truncate-ellipsis" }
    - { id: "thong_so",      type: "text",     readonly_in_preview: true, label: "Thông số kỹ thuật", display_overflow: "truncate-ellipsis" }
    - { id: "trang_thai",    type: "enum",     readonly_in_preview: true, label: "Trạng thái", enum: ["Hợp lệ", "Lỗi"], render: "pill-green if Hợp lệ; red-text if Lỗi" }
    - { id: "ly_do_loi",     type: "text",     readonly_in_preview: true, label: "Lý do lỗi", render: "empty if Hợp lệ; verbatim reason if Lỗi (vd 'Sai mã', 'Mã nội bộ đã tồn tại', 'ĐVT không khớp')" }
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| HeaderActionGroup | auto | Right-aligned 2 buttons |
| Button_Huybo | ~96 | "Huỷ bỏ" outline |
| Button_Xacnhan | ~104 | "Xác nhận" brand |
| StatsRow | 1216 | Full section width |
| PreviewTable | 1981 | OVERFLOWS section 1216 → horizontal scroll |
| Column widths | 60, 185, 178, 120, 180, 120, 120, 180, 180, 168, 168, 154, 168 | Sum=1981 verified per metadata |
| TablePagination | 1216 | Full section width |
| PageSize_Select | ~64 | "5" + chevron |
| Pager | auto | gap-4 between buttons |

### §7 Visual Hierarchy Map

```yaml
hierarchy:
  primary:
    - HeaderActionGroup.Button "Xác nhận" (brand, primary CTA)
    - StatsRow (numeric scorecard — important affordance)
    - PreviewTable (core data confirmation)
  secondary:
    - HeaderActionGroup.Button "Huỷ bỏ" (outline)
    - TablePagination
  tertiary:
    - Footer
```

### §8 Anti-Pattern Trap

```yaml
traps:
  - id: "TAP-7-TableOverflow"
    rule: "PreviewTable width=1981 > Section 1216 → MUST horizontal-scroll. KHÔNG ép columns vào 1216 (sẽ cắt header text)."
    _png_verified: "14601-134126.png — chỉ thấy ~8 cols, các cột 9-13 cần horizontal scroll; 14601-135303-table.png shows full 13 cols at 1981 width"
  - id: "TAP-8-TrangThaiBadgeVsText"
    rule: "Status 'Hợp lệ' = pill badge (green pill). Status 'Lỗi' = red text only (NO badge background). KHÔNG render Lỗi như badge."
    _png_verified: "14601-135303-table.png rows: L1, L2, L5 Hợp lệ = green pill; L3, L4 Lỗi = red text no pill"
  - id: "TAP-9-NhomSanPhamLabel"
    rule: "Column header label verbatim 'Nhóm sản phẩm' theo design. BR canonical là 'Nhóm vật tư/hàng hoá' (BR-CAT-PROD-018). Drift design ↔ BR — dev follow design label cho UI; backend field name follow BR canonical."
    _png_verified: "14601-135303-table.png header L1 column 9 verbatim 'Nhóm sản phẩm'"
  - id: "TAP-10-PhuongPhapDerived"
    rule: "Column 'Phương pháp tính giá' hiển thị 'Bình quân cuối kỳ' cho mọi row — đây là DERIVED VALUE (template KHÔNG có column này per AC-2 v10). Backend gắn default per BR-CAT-PROD-010 trước khi response."
    _png_verified: "14601-135303-table.png column 5 all rows = 'Bình quân cuối kỳ'"
  - id: "TAP-11-InvalidRowBg"
    rule: "Invalid row bg = base/background-error #fef2f2 (light pink). KHÔNG đổi text color của entire row sang đỏ (chỉ 'Lỗi' cell + 'Lý do lỗi' cell)."
    _png_verified: "14601-135303-table.png L3, L4 — pink bg, text color giữ nguyên dark cho hầu hết cells, chỉ Trạng thái 'Lỗi' đỏ"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-import/14601-134126.png
verified_at: "2026-06-29T06:45Z"
claims_verified:
  - claim: "PageHeader Screen 3 có 2 buttons right side: 'Huỷ bỏ' (outline) + 'Xác nhận' (brand blue)"
    png_source: "14601-134126.png L11 right"
    verified: true
  - claim: "StatsRow có 2 stats: 'Hợp lệ: 40' (40 green) + 'Không hợp lệ: 0' (0 red), labels verbatim với dấu colon"
    png_source: "14601-134126.png L29"
    verified: true
  - claim: "PreviewTable có 13 cột: STT, Mã sản phẩm nội bộ, Tên sản phẩm, ĐVT chính, Phương pháp tính giá, Thương hiệu, Xuất xứ, Tính chất, Nhóm sản phẩm, Quy cách sản phẩm, Thông số kỹ thuật, Trạng thái, Lý do lỗi"
    png_source: "14601-135303-table.png header row L1 — full 1981×40 annotation"
    verified: true
  - claim: "TableBody 5 rows visible per page (page 2 active); row 3, 4 trạng thái 'Lỗi' với pink bg + 'Sai mã' trong Lý do lỗi"
    png_source: "14601-135303-table.png L3, L4 + 14601-134126.png L40-L45 cho preview view all-valid"
    verified: true
  - claim: "TablePagination: 'Hiển thị 5 mỗi trang' (left) + '< Trước | 1 | [2] | 3 | … | Tiếp >' (right, page 2 active)"
    png_source: "14601-134126.png L48"
    verified: true
  - claim: "Mã sản phẩm nội bộ cells render as blue link (color #1d4ed8)"
    png_source: "14601-134126.png rows L40-L45 + 14601-135303-table.png L1-L5 column 2"
    verified: true
```

### §9 Container Hierarchy (legacy)

```
Page
└─ (same shell)
└─ PageHeader
   └─ HeaderActionGroup
      ├─ Button "Huỷ bỏ"
      └─ Button "Xác nhận"
└─ Section
   ├─ (... template link + dropzone + uploaded item ...)
   └─ StatsRow
      ├─ Stat "Hợp lệ: 40"
      └─ Stat "Không hợp lệ: 0"
   └─ PreviewTable
      ├─ TableHead (13 cols)
      └─ TableBody (5 rows × 13 cols)
   └─ TablePagination
      ├─ PageSize "Hiển thị 5 mỗi trang"
      └─ Pager (Prev | 1 | 2 | 3 | … | Next)
```

---

## Screen: Success Toast (14601:135187)

> Transient overlay state — Toast notification "Tải tệp lên thành công!" xuất hiện top-right sau khi user click Xác nhận trên Screen 3. Underlying page (Preview) bị fade với overlay/90 scrim (#0000001a — barely visible).
>
> **NOTE**: Đây KHÔNG phải full page. Underlying Navbar/TabStrip/Section bị hidden trong Figma frame (hidden=true) — render thực tế giữ underlying page visible nhưng Toast nằm trên cùng.

### §0 ASCII Mockup

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ (Underlying Preview state — Navbar, TabStrip, Section, Pagination, Footer)              ┌─────────┐ │
│                                                                                          │✓ Tải tệp │ │
│                                                                                          │  lên     │ │
│                                                                                          │  thành   │ │
│                                                                                          │  công! ✕│ │
│                                                                                          └─────────┘ │
│                                                                                                       │
│                                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
Page:
  inherits: "Screen Preview"  # Underlying state
  override:
    - Toast:
        present: true
        position: "absolute top-right"
        offset_top: 116
        offset_right: 12  # 1440 - 1068 - 360 = 12
        width: 360
        height: 56
        _children_count: 3   # IconCheck + Message + IconClose
        layout: horizontal-gap-12
        padding: "spacing/3 = 12"
        children:
          - Icon: { name: "tick-circle (filled)", color: "base/foreground-success = #16a34a", bg: "base/background-success light", size: 24, _png_verified: "14601-135187.png L4 green check leading" }
          - Message: { label: "Tải tệp lên thành công!", weight: "medium", size: "small", color: "base/foreground = #18181b", _png_verified: "14601-135187.png L4 verbatim incl exclamation" }
          - Icon: { name: "close", aria_label: "Đóng", variant: "ghost-icon-button", _png_verified: "14601-135187.png L4 X trailing right" }
```

### §2 Design Token Map

```yaml
tokens:
  Toast:
    background:    "base/background-success = #f0fdf4 (light green)"
    border:        "base/border-success = #22c55e (1px solid)"
    border_radius: "border radius/lg = 8"
    shadow:        "shadow/lg = Effect(DROP_SHADOW, color: #0000000D, offset (0,4), radius 6) + (color: #0000001A, offset (0,10), radius 15)"
    padding:       "spacing/3 = 12"
    foreground:    "base/foreground = #18181b"
  ToastIcon_Check:
    color:         "base/foreground-success = #16a34a"
  Overlay (background scrim):
    background:    "overlay/90 = #0000001a (very light)"
```

### §3 State Table

```yaml
states:
  - state: "Success Toast — auto-dismiss"
    when: "Confirm import thành công"
    visible: [Toast, Underlying_Preview_partial]
    timeout: "design KHÔNG label — default UX 3-5s auto-dismiss"
    actions: { onClose: "() => dismissToast(); navigate(/danh-muc/san-pham)?" }
  - state: "Success Toast — manual dismiss"
    when: "User click X icon"
    action: "Dismiss + navigate back to product list (per AC-6 implied behavior)"
```

### §4 Component Prop Map

```yaml
Toast:
  props:
    variant: "success"
    title: null
    message: "Tải tệp lên thành công!"
    icon: "tick-circle-filled"
    onDismiss: "() => closeToast()"
    duration: "design unlabelled — UX default 3000-5000ms"
    position: "top-right"
    read_only: false
```

### §5 Field Composition Schema

```yaml
fields:
  - id: "toast_message"
    type: "static-text"
    value: "Tải tệp lên thành công!"
    read_only: true
```

### §6 Layout Width Table

| Container | Width | Notes |
|---|---|---|
| Toast | 360 | Fixed width per metadata |
| Toast.Height | 56 | Per metadata |
| Toast.Offset_top | 116 | Per metadata 14601:135288.x=1068 y=116 |
| ToastIcon | 24 | Square |
| CloseIcon | 24 | Square |

### §7 Visual Hierarchy Map

```yaml
hierarchy:
  primary:
    - Toast.Message "Tải tệp lên thành công!" (success confirmation)
  secondary:
    - Toast.IconCheck (visual cue)
  tertiary:
    - Toast.IconClose (manual dismiss)
```

### §8 Anti-Pattern Trap

```yaml
traps:
  - id: "TAP-12-ToastNotFullScreen"
    rule: "Toast là OVERLAY transient, KHÔNG phải full page replacement. Underlying Preview vẫn render dưới (Figma frame hidden=true chỉ là designer-only optimization — runtime vẫn show underlying)."
    _png_verified: "14601-135187.png — gray background = scrim, không phải actual empty page"
  - id: "TAP-13-ToastReplacesKetQua"
    rule: "Design này CHỌN Toast thay vì màn 'Kết quả import' đầy đủ (AC-8 với chỉ số Tạo mới/Cập nhật/Bỏ qua + nút Tải file lỗi). Drift design ↔ AC-8 — Toast under-covers metrics + missing 'Tải file lỗi' affordance (AC-9). Dev: nếu BR yêu cầu Tải file lỗi → thêm vào Toast extension hoặc redirect tới list view với inline summary."
    _png_verified: "14601-135187.png — chỉ có toast, không có panel Kết quả import"
  - id: "TAP-14-NotaiTepLenVsImportThanhCong"
    rule: "Message verbatim 'Tải tệp lên thành công!' — refers to FILE UPLOAD success, NOT IMPORT success. Designer ambiguity — có thể đây là toast cho upload step (Screen 1→2) thay vì confirm step (Screen 3→done). Dev clarify với BA: timing trigger của toast này."
    _png_verified: "14601-135187.png L4 verbatim — note word 'tệp' (file) not 'dữ liệu' (data) or 'danh mục' (catalog)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-import/14601-135187.png
verified_at: "2026-06-29T06:45Z"
claims_verified:
  - claim: "Toast positioned top-right, ~360×56, light green bg với green border"
    png_source: "14601-135187.png L4"
    verified: true
  - claim: "Toast nội dung: filled green check icon (leading) + 'Tải tệp lên thành công!' (center) + X close icon (trailing)"
    png_source: "14601-135187.png L4 — left to right reading"
    verified: true
  - claim: "Toast message verbatim 'Tải tệp lên thành công!' bao gồm dấu chấm than"
    png_source: "14601-135187.png L4 — character-by-character"
    verified: true
  - claim: "Underlying page gray scrim (light overlay/90) — không có panel/dialog content"
    png_source: "14601-135187.png L1-L29 — predominantly gray background"
    verified: true
```

### §9 Container Hierarchy (legacy)

```
Page (underlying Preview, hidden frame in Figma)
└─ Overlay (scrim #0000001a)
└─ Toast (top-right, 360×56)
   ├─ IconCheck (green fill, leading)
   ├─ Message "Tải tệp lên thành công!"
   └─ IconClose (trailing X)
```

---

## Screenshots

| Screen | Section / Node | PNG file |
|---|---|---|
| Empty Upload | 14601:133301 (full frame) | `assets/wave03-cat-prod-import/14601-133301.png` |
| Uploaded File | 14601:133897 (full frame) | `assets/wave03-cat-prod-import/14601-133897.png` |
| Preview | 14601:134126 (full frame) | `assets/wave03-cat-prod-import/14601-134126.png` |
| Preview Table (full-width annotation) | 14601:135303 (designer annotation showing all 13 columns + mixed row states) | `assets/wave03-cat-prod-import/14601-135303-table.png` |
| Success Toast | 14601:135187 (full frame) | `assets/wave03-cat-prod-import/14601-135187.png` |
| Section overview | 14146:87154 | `assets/wave03-cat-prod-import/_full.png` |

- `_full.png` — section overview reference
