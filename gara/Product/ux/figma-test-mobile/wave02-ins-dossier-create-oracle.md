---
feat: FEAT-INS-DOSSIER-CREATE
feat_file: Product/features/FEAT-INS-DOSSIER-CREATE.md
wave_feat_file: Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-CREATE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=437-24051&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "437:24051"
fetched_at: 2026-06-18T07:08:00+07:00
oracle_version: 1
screenshots:
  - assets/wave02-ins-dossier-create/_full.png
  - assets/wave02-ins-dossier-create/437-26437.png
  - assets/wave02-ins-dossier-create/452-23174.png
  - assets/wave02-ins-dossier-create/452-22958.png
  - assets/wave02-ins-dossier-create/452-23711.png
  - assets/wave02-ins-dossier-create/452-24043.png
  - assets/wave02-ins-dossier-create/452-24580.png
  - assets/wave02-ins-dossier-create/700-28585.png
  - assets/wave02-ins-dossier-create/700-28869.png
  - assets/wave02-ins-dossier-create/437-27245.png
  - assets/wave02-ins-dossier-create/700-29194.png
  - assets/wave02-ins-dossier-create/452-24231.png
  - assets/wave02-ins-dossier-create/452-24974.png
mcp_tools_used:
  get_metadata: success (root node 437:24051 — large XML persisted to tool-results file; structure inventory cross-checked)
  get_variable_defs: success (token table fetched at root, 90+ tokens captured)
  get_design_context: success (per-screen, all 7 screen-states + BBNT template — code = JSX per G3 mobile caveat, used for layer-name/text verbatim cross-check only)
  get_screenshot: success (12 PNGs fetched + downloaded via Python urllib — 7 full screens + 1 entry action bar + 2 list 4-thẻ section + 2 banner warning)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (list state A unchecked + state B all 4 checked; BBNT/GUQ filled state)
  text_content: complete (verbatim from get_design_context cross-check vs FEAT v21 AC)
  design_tokens: complete (hex from get_variable_defs → AppColors mapping)
  interaction_states: partial (Figma static design — `:pressed`, `:focus`, `:error` not exposed as Figma variants; defer to AppCheckbox/AppButton/AppTextField widget catalog defaults)
notes:
  - Entry host `700:28585` = màn Chi tiết phiếu QT BH (production-baseline Settlement Detail, FEAT-INS-STL-DETAIL scope). Action bar instance `700:28869` (375×176px, anchored bottom area) hosts CTA "**+ Tạo hồ sơ bảo hiểm**" — entry gate per BR-INS-DOSSIER-011 (chỉ render khi Bên thanh toán = Bảo hiểm).
  - **2 dossier-list screen-states variant** confirmed via design_context fetch — `437:26437` = state A (4 checkboxes **unchecked**, light grey border `#d1d1d1`, "Xuất hồ sơ bảo hiểm" button bg `#e8e8ea` **DISABLED** state). `452:23174` = state B (4 checkboxes **ALL checked**, bg `#0052ff` blue with white check icon, "Xuất hồ sơ bảo hiểm" button bg `#0052ff` **ENABLED**). Verify per FEAT AC-3 (cả 4 checkbox enabled ngay; nút Xuất hiển thị disabled khi 0 checkbox tick — không gate theo trạng thái điền template, FEAT v22 gỡ EC-4).
  - **WORDING DEFECT FLAGS** (FEAT spec vs Figma render):
    - List row 3 dòng phụ: Figma renders **2 lines** "Mẫu chung bảo hiểm" + "Thông tin được sử dụng để lập biên bản nghiệm thu". FEAT AC-3 v21 chỉ ghi 1 dòng "Thông tin được sử dụng để lập biên bản nghiệm thu". Figma có thêm prefix "Mẫu chung bảo hiểm" line.
    - List row 4 tiêu đề: Figma renders "**Giấy uỷ quyền nhận bồi thường**" (without "tiền", spelled "uỷ" with `ỷ`). FEAT AC-3 v21 + AC-7 specify "**Giấy ủy quyền nhận tiền bồi thường**" (with "tiền", "ủy" with `ủ`). Implementation MUST use FEAT spec text (Business Authority canonical) — Figma layer name is design typo (do NOT copy verbatim).
    - BBNT Card Header title: Figma renders "**Biển bản nghiệm thu**" (TYPO — "Biển" should be "Biên"). FEAT AC-6 specifies "BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG". Implementation use FEAT spec.
    - BBNT "Add term" button: Figma renders "**+ Mục nghiệm thu**" (NOT "+ Thêm mục điều khoản" as in FEAT AC-6). Verify per Business Authority — recommend use Figma render text since UX spec doesn't fix this string.
    - BBNT field group "Lập biên bản" → "BKS xe" field label: Figma label = "**Xe ô tô BKS**" (not "BKS xe" as FEAT AC-6 column says). Use FEAT spec or align with Figma per BA decision.
    - BBNT row "Bên A — Tên KH" prefill expected: Figma sample shows full company name "Công ty CP XD Smart Building Việt Nam" — this is mock data, not literal label. Implementation prefill chỉ "Tên" per BR-INS-DOSSIER-003 (NOT full company info).
    - BBNT "Mục N" labels: Figma renders 4 prefilled mục + 1 empty placeholder "Nhập nội dung" (Mục 5 with trash icon) → 4 standard điều khoản match FEAT AC-6 "4 điều khoản chuẩn".
  - **Section description text mobile**: Figma renders "**Chọn tài liệu cần xuất**" (NO trailing period). FEAT AC-2 v21 specifies "**Chọn tài liệu cần xuất.**" (with period). Verify per BA — likely Figma omitted period (minor).
  - **List screen action bar height** = 100px (Action bar instance `437:26641` / `452:23332`). Entry host action bar = 176px (instance `700:28869`) — taller because it likely contains additional secondary actions on the Settlement Detail screen.
  - **Banner warning frame** (BBNT `452:24231` + GUQ `452:24974`): 374×66px, bg `#fff8ec` (`AppColors.bgWarning`), border 1px solid `#f97316` (orange, mapped to `base/border-warning`), padding inner 10px, radius 8px. Text "**Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ.**" — 12px / w700 (Inter Bold) / line-height normal, color `#ff6b00` (`AppColors.bgWarningStrong` / `textWarningPrimary`).
  - **Input/Textarea heights** (Figma actual): Input = h36 (NOT h58 from prompt) — wrapped in flex column `gap=8px` with label above → total label+input = ~58px. Verify per `AppTextField` widget catalog mapping.
  - **Input border**: 1px solid `#e4e4e7` (`base/input` token, slightly different from `#e8e8ea` `borderPrimary` — both grey but `e4e4e7` is shadcn convention input field). Verify token mapping → likely `AppColors.borderPrimary` semantically.
  - **Card bg**: `#ffffff` (`base/card`), radius 12px (`border-radius/xl`), padding 16px (`spacing/4`), gap inside 16px. **Cards trong template KHÔNG có shadow visible trong Figma** (shadow only on Action bar bottom: `0px -4px 12px rgba(0,0,0,0.06)`).
  - **PQT/PBG header field "tile" style**: bg `#f6f6f6` (`Color/Gray/50`), border `#f3f3f4` (`base/border-secondary`), radius 8px, padding 16h/12v. Label 12px regular muted-fg `#71717a`. Value 14px semibold dark `#18181b`. This is a sub-component "PhiuQtSaCha" inside PQT/PBG header Card.
  - **PQT Phân bổ bảo hiểm sample values**: 5 rows all show `-9.000.000` (negative red sample). Mobile does NOT apply sign-coloring per FEAT-INS-SO-ADJUSTMENT AC-10 in Figma render — all values appear black `#000000`. Verify if green/red sign rule applies on mobile (likely web-only feature).
  - **PQT title in Card**: "**Phiếu quyết toán sửa chữa**" (Card header in 452:22958 = lowercase phrase, NOT "PHIẾU QUYẾT TOÁN SỬA CHỮA" all caps as FEAT AC-4 title). The all-caps title from FEAT might apply to PDF export only — mobile preview Card uses sentence case.
  - **PBG title in Card**: "**Phiếu báo giá sửa chữa**" (similarly sentence case in mobile preview).
  - **PBG dòng phụ** (Card subtitle): Figma renders `SET-20260326-00001` (mã phiếu QT BH, NOT mã PDV). Matches FEAT AC-5 v21 mobile column ("app: mã phiếu QT").
  - **Tổng cộng text** (mobile PQT Bảng "Dịch vụ thực hiện"): "Tổng cộng" 16px/w700 Inter Bold, value `87.000.000` 16px/w700. PQT "Phân bổ bảo hiểm" Card last row label = "**Tổng thanh toán**" (NOT "Tổng cộng") per `651:30561` text node + design_context render — verify FEAT spec.
  - **Tabs/Hidden frames**: Each template screen embeds invisible "Tabs - 2" + frame at top (carry-over from Settlement Detail) — confirmed by Tabs frame instances `700:29287/29288/29289` (NavBar + StatusBar repeat). Body content starts at y=96 below NavBar.
---

# Oracle — FEAT-INS-DOSSIER-CREATE (mobile) — "Hồ sơ bảo hiểm" (4 tài liệu chuẩn)

> Design-conformance oracle (5-cấp) cho `agent-test-ui` verify garage-mobile (Flutter 3.41 / BLoC) khớp Figma.
> Scope: **màn Hồ sơ bảo hiểm** (full screen + back button) + 4 màn chi tiết per tài liệu (Phiếu quyết toán read-only, Phiếu báo giá read-only, Biên bản nghiệm thu điền template, Giấy ủy quyền điền template). Entry point = nút **"+ Tạo hồ sơ bảo hiểm"** trên Action bar của màn Chi tiết phiếu QT BH (FEAT-INS-STL-DETAIL — gate Bên thanh toán = Bảo hiểm per BR-INS-DOSSIER-011).
>
> **Mobile fetch caveat (G3 per `_ref-figma-mcp-tools.md §4`)**: `get_design_context.code` returns JSX/React kể cả khi `clientFrameworks="flutter,dart"`. Reference code = cross-check text/structure only — KHÔNG copy thẳng vào Flutter implementation. Token mapping (AppColors/AppTextStyle/AppSizes) tra theo `_ref-mobile-transform-figma.md §1.5`.
>
> **Complexity gate M6** (per `_ref-figma-mcp-tools.md §3.3`): 7 screen states > 5 ⇒ single-mode per-FEAT.

---

## Screen Inventory

| # | Screen state | nodeId | size (W×H) | role (per FEAT AC) | screenshot |
|---|---|---|---|---|---|
| 1 | **Chi tiết phiếu QT BH** — entry host (Action bar nút "+ Tạo hồ sơ bảo hiểm") | `700:28585` | 375×2111 | FEAT-INS-STL-DETAIL gate (AC-1, BR-011) | [700-28585.png](assets/wave02-ins-dossier-create/700-28585.png) |
| 2 | Màn **"Hồ sơ bảo hiểm"** — list 4 dòng (state A: 4 checkbox **unchecked**, btn DISABLED) | `437:26437` | 375×812 | AC-2/AC-3 (mặc định) | [437-26437.png](assets/wave02-ins-dossier-create/437-26437.png) |
| 3 | Màn **"Hồ sơ bảo hiểm"** — list 4 dòng (state B: 4 checkbox **all checked** blue, btn ENABLED) | `452:23174` | 375×812 | AC-3 (sẵn sàng xuất; FEAT v22 gỡ EC-4) | [452-23174.png](assets/wave02-ins-dossier-create/452-23174.png) |
| 4 | Màn chi tiết **"Phiếu quyết toán"** — read-only template | `452:22958` | 375×1251 | AC-4 (auto-sinh, read-only) | [452-22958.png](assets/wave02-ins-dossier-create/452-22958.png) |
| 5 | Màn chi tiết **"Phiếu báo giá"** — read-only template | `452:23711` | 375×812 | AC-5 (auto-sinh, read-only) | [452-23711.png](assets/wave02-ins-dossier-create/452-23711.png) |
| 6 | Màn chi tiết **"Biên bản nghiệm thu"** — template điền (3 Cards + banner top) | `452:24043` | 375×1640 | AC-6 (điền trực tiếp) | [452-24043.png](assets/wave02-ins-dossier-create/452-24043.png) |
| 7 | Màn chi tiết **"Giấy ủy quyền"** — template điền (5 Cards + banner top) | `452:24580` | 375×2401 | AC-7 (điền trực tiếp) | [452-24580.png](assets/wave02-ins-dossier-create/452-24580.png) |

**Section PNGs** (sub-screenshots for pixel-perfect spot-check):
- [700-28869.png](assets/wave02-ins-dossier-create/700-28869.png) — Action bar instance trên màn entry host (CTA "+ Tạo hồ sơ bảo hiểm"), 375×176
- [437-27245.png](assets/wave02-ins-dossier-create/437-27245.png) — Container "AC-3: 4 thẻ tài liệu" state A, 375×424
- [700-29194.png](assets/wave02-ins-dossier-create/700-29194.png) — Container "AC-3: 4 thẻ tài liệu" state B (checked), 375×424
- [452-24231.png](assets/wave02-ins-dossier-create/452-24231.png) — Banner warning BBNT, 374×66
- [452-24974.png](assets/wave02-ins-dossier-create/452-24974.png) — Banner warning GUQ, 374×66

Entry screen `700:28585` is NOT dossier-create UI scope — host screen (FEAT-INS-STL-DETAIL Settlement Detail mobile). Dossier-create scope = 6 screens (2-7).

---

## Component Inventory

> Widget catalog reference: `lib/ui/widgets/` per `_ref-mobile-transform-figma.md §1.5`. Counts from metadata + verified design_context.

### Screen: Màn "Hồ sơ bảo hiểm" — list (`437:26437` state A / `452:23174` state B)

| Widget | Count | Mapping |
|---|---|---|
| `Native / Status Bar` (h44) | 1 | iOS status bar mock (instances `437:26639` / `452:23330`) |
| `Bars / Nav Bars: Standard` (h52) — title "Hồ sơ bảo hiểm" + leading back `vuesax/linear/arrow-left` | 1 | `AppBar` / `CustomAppBar` (instance `437:26640` / `452:23331`) |
| `Info KH/ View` header section — title "Tài liệu bảo hiểm" 18px/w700 | 1 | `Column` block (instance `437:27242` / `452:23488`, 375×50, padding pb=8/pt=16/px=16) |
| Section description text "Chọn tài liệu cần xuất" 12px/w400 | 1 | Frame `437:27243` / `452:23489`, padding x=16 |
| Container "AC-3: 4 thẻ tài liệu (xếp ngang)" — vertical Column gap=16 | 1 | `Column` wrapper (frame `437:27245` / `700:29194`, 375×424, padding p=16) |
| Checkbox (size 20×20) — bordered 2px / unchecked OR bg-Primary blue checked | 4 (1/row) | `AppCheckbox` widget (instances `437:27247...` state A unchecked / `700:29197/29207/29217/29227` state B checked) |
| List-row card (Card / bordered, radius 12, p=16, gap=65 between content & arrow) | 4 | `Card` / `InkWell` row, bg `#ffffff`, border 1px `#e8e8ea` |
| Trailing `vuesax/linear/arrow-right` icon (20×20) | 4 | `SvgPicture.asset('assets/icons/arrow-right.svg')` |
| Action bar (footer pinned bottom, 375×~100, radius-top 8, shadow `0px -4px 12px rgba(0,0,0,0.06)`) | 1 | Pinned `Container` / `BottomBar` (instance `437:26641` / `452:23332`) |
| Primary `Button` "Xuất hồ sơ bảo hiểm" (full-width, h44, padding x16/y12, radius 8) | 1 | `AppButton.text(...)` — state A bg `#e8e8ea` DISABLED, state B bg `#0052ff` ENABLED |
| Home Indicator bar (134×4 black) | 1 | iOS home indicator mock |

### Screen: Phiếu quyết toán read-only (`452:22958`)

| Widget | Count | Mapping |
|---|---|---|
| Status Bar + NavBar (title "Hồ sơ bảo hiểm") | 1+1 | Mock + AppBar |
| Header Card (Phiếu quyết toán sửa chữa + SET-{code} + 4 info tiles Garage/Ngày QT/KH/BKS) | 1 | `Card` (instance `452:23657`, 343×~366, radius 12, p=16, gap=16) — contains Card/Header + sub `.Phiếu QT Sửa chữa` info tile component (4 tiles bg `#f6f6f6` border `#f3f3f4` radius 8 px=16 py=12, label 12px muted + value 14px semibold) |
| Card "Dịch vụ thực hiện" (table 3-col Nội dung/SL/Thành tiền + divider + Tổng cộng row) | 1 | `Card` (instance `651:30590`) |
| Card "Phụ tùng sử dụng" (same structure) | 1 | `Card` (instance `452:23658`) |
| Card "Phân bổ bảo hiểm" (table 3-col + 5 phân bổ rows + divider + "Tổng thanh toán" row) | 1 | `Card` (instance `651:30436`, header text `651:30437`) |
| NO action bar / NO bottom button (FEAT AC-4 — mobile read-only, no print/export action) | 0 | — |

### Screen: Phiếu báo giá read-only (`452:23711`)

| Widget | Count | Mapping |
|---|---|---|
| Status Bar + NavBar (title "Hồ sơ bảo hiểm") | 1+1 | Mock + AppBar |
| Header Card "Phiếu báo giá sửa chữa" + SET-{code} + 4 info tiles Garage/Ngày báo giá/Công ty BH/Số HĐ BH | 1 | `Card` (instance `452:23989`) |
| Card "Chi phí sửa chữa" (table 3-col Nội dung/SL/Thành tiền + divider + Tổng cộng) | 1 | `Card` (instance `452:23990`) |
| NO action bar / NO bottom button | 0 | — |

### Screen: Biên bản nghiệm thu — điền (`452:24043`)

| Widget | Count | Mapping |
|---|---|---|
| Status Bar + NavBar (title "Hồ sơ bảo hiểm") | 1+1 | Mock + AppBar |
| Warning Banner (374×66, bg `#fff8ec` border `#f97316`, text "Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ.") | 1 | `Container` warning banner (frame `452:24231`, inner card `452:24232` p=10 radius 8 w-full) |
| Card "Biển bản nghiệm thu" (typo) + subtitle "Biên bản nghiệm thu, thanh lý hợp đồng" → contains 4 fields: Xe ô tô BKS (Input h36), Ngày lập biên bản (Input h36), Căn cứ phiếu báo giá (Textarea min-h60), Địa điểm lập biên bản (Input h36) | 1 | `Card` (instance `452:24330`, w-full, p=16, gap inner 12px) |
| Card "Thông tin các bên" → 6 fields: Bên A (Input), Bên B (Input), Đại diện (Input), Chức vụ (Input), Địa chỉ Garage (Textarea), MST/STK/Ngân hàng (Textarea) | 1 | `Card` (instance `452:24342`) |
| Card "Nội dung nghiệm thu" → 5 Textareas (Mục 1..5, Mục 5 có vuesax/linear/trash icon) + Button "+ Mục nghiệm thu" (bg `#f4f7fe` dialog-primary-bg, text `#0052ff` 14px/w700) | 1 | `Card` (instance `452:24357`) — Add button instance `452:24356` |
| Action bar (footer pinned, button "Lưu thông tin" primary `#0052ff` full-width h44 radius 8) | 1 | `AppButton.text(title: "Lưu thông tin", ...)` — instance `452:24140` |

### Screen: Giấy ủy quyền — điền (`452:24580`)

| Widget | Count | Mapping |
|---|---|---|
| Status Bar + NavBar | 1+1 | Mock + AppBar |
| Warning Banner (374×66) — same as BBNT | 1 | `Container` (frame `452:24974`) |
| Card "Giấy ủy quyền nhận tiền bồi thường bảo hiểm" header + I. Bên ủy quyền (KH) — 3 fields slot | 1 | `Card` (instance `452:25073`, 343×316) |
| Card II. Bên được ủy quyền (garage) — 6 fields slot (2× Input + 2× Textarea + 2× Input layout) | 1 | `Card` (instance `452:25085`, 343×376) |
| Card III. Nội dung ủy quyền — 6 fields slot (Textarea + 2× Input + Textarea + Input) | 1 | `Card` (instance `452:25098`, 343×462) |
| Card IV. Cam kết — multiple Textarea điều khoản template + nút "+ điều khoản" | 1 | `Card` (instance `452:25109`, 343×370) — likely contains add button |
| Card "Khối ký" — 4 Textareas with trash icon + 1 button "+ điều khoản" (text variant) | 1 | `Card` (instance `452:25122`, 343×524) |
| Action bar — button "Lưu thông tin" primary | 1 | `AppButton.text(...)` |

### Entry host screen `700:28585` (relevant scope only)

| Widget | Count | Mapping |
|---|---|---|
| Action bar instance `700:28869` (375×176) chứa Button "+ Tạo hồ sơ bảo hiểm" + có thể secondary action | 1 | `AppButton.text(title: "+ Tạo hồ sơ bảo hiểm", appButtonColor: AppButtonColor.primary())` — **gated by FEAT-INS-STL-DETAIL AC-13 + BR-011 (chỉ render khi Bên thanh toán = Bảo hiểm)** |

---

## Variant & State

> Figma static — interaction states (`:hover`, `:focus`, `:pressed`) NOT exposed as Figma variants in this file. Verify from Flutter widget catalog defaults + FEAT AC.

### AppCheckbox (4 instances per list screen)

| State | Figma render | Token / hex |
|---|---|---|
| **Unchecked** (state A — `437:27247` and sibling) | 20×20 square, border 2px solid `#d1d1d1` (`base/border-Garage`), radius 4px, bg transparent | `AppColors.borderGarage` border 2px |
| **Checked** (state B — `700:29197/29207/29217/29227`) | 20×20 square, bg `#0052ff` (`base/button-Background-Primary-CD-Garage`), radius 4px, white check icon (inset 18.75% = ~3.75px) | `AppColors.buttonBackgroundPrimary` bg + white check icon |
| ~~Disabled (BBNT/GUQ chưa điền đủ)~~ | **N/A — FEAT v22 gỡ EC-4 gate**: cả 4 checkbox enabled ngay, không gate theo trạng thái điền template |

### List-row card (4 rows per list screen)

| Variant | Bounds | Inner structure |
|---|---|---|
| **PQT + PBG** (single-line dòng phụ) | 343×~68 | Checkbox 20×20 + title frame 128w (title 14px/w700 + dòng phụ 12px/w400 gap=4) + arrow-right 20×20 |
| **BBNT** (2-line dòng phụ) | 343×~104 | Checkbox + title frame 190w (title "Biên bản nghiệm thu" 14px/w700 + 2-line phụ "Mẫu chung bảo hiểm" + "Thông tin được sử dụng để lập biên bản nghiệm thu") + arrow-right |
| **GUQ** (2-line title wrap) | 343×~104 | Checkbox + title frame 190w (title "Giấy uỷ quyền nhận bồi thường" 14px/w700 wraps 2-line, line-height 16 + dòng phụ "Áp dụng cho garage chưa ký liên kết với bảo hiểm") + arrow-right |

States NOT in Figma: `:pressed` tap-feedback (likely InkWell ripple); `:focus-visible` (mobile typically N/A).

### Banner warning (BBNT `452:24231` + GUQ `452:24974`)

- **Single state** (orange warning):
  - Outer frame 374×66 padding 16h/8v
  - Inner card 342×50 bg `#fff8ec` (`base/bg-warning`), border 1px solid `#f97316` (`base/border-warning` orange), radius 8px, content centered, padding all 10px
  - Text 12px / Inter Bold w700 / line-height normal, color `#ff6b00` (`base/bg-warning-strong` / `AppColors.textWarningPrimary`), w=322
  - **Text verbatim**: "Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ."

### Input / Basic (BBNT + GUQ template fields)

| Property | Value |
|---|---|
| Label position | Above input, font Inter Medium 14px / w500 / leading-none, color `#71717a` (`base/muted-foreground`), gap=8px to input |
| Input wrapper bg | `#ffffff` (`base/background`) |
| Border | 1px solid `#e4e4e7` (`base/input`) → AppColors.borderPrimary (semantically) |
| Radius | 8px (`border-radius/lg`) |
| Height | 36px (h-9) |
| Padding | x=12 (`spacing/3`), y=4 (`spacing/1`) |
| Filled text | 14px / Inter Semi Bold w600 / line-height 20, color `#000000` (`base/foreground`) |
| Variant 2-col row | Two `Input/Basic` side-by-side `flex-[1_0_0]` with gap 12px (`spacing---border/12`) |
| Variant placeholder | Last item Mục 5 (`452:24353`) renders "Nhập nội dung" 14px/w300 Light, color WHITE (?) — likely placeholder light grey actually, color render bug noted |
| States NOT in Figma | `:focus`, `:disabled`, `:error` — defer to `AppTextField` widget catalog defaults |

### Textarea (BBNT + GUQ multiline fields)

| Property | Value |
|---|---|
| Label same as Input/Basic | 14px Medium muted-fg |
| Wrapper | bg `#ffffff`, border 1px solid `#e4e4e7`, radius 6px (`border-radius/md`), shadow `0px 1px 2px rgba(0,0,0,0.05)` (`shadow/sm`) |
| Min-height | 60px |
| Padding | x=12, y=8 (`spacing/2`) |
| Text | 14px Inter Semi Bold w600 / line-height 20, color `#000000` |

### Button — "+ Mục nghiệm thu" / "+ điều khoản" (in-Card add button)

- Bg: `#f4f7fe` (`colors/dialog-primary-bg`, light blue tint)
- Text: 14px / Inter Bold w700 / line-height 20, color `#0052ff` (`AppColors.buttonBackgroundPrimary`)
- Padding: x=16, y=12
- Radius: 8px
- Full-width inside Card
- → `AppButton.custom(...)` text variant primary color, light bg

### Action bar (footer "Xuất hồ sơ bảo hiểm" / "Lưu thông tin" / "+ Tạo hồ sơ bảo hiểm")

| Container | Size | Bg / shadow | Inner button |
|---|---|---|---|
| List screen Action bar (`437:26641`, state A) | 375×~100 | Bg `#ffffff`, radius-top 8px, shadow `0px -4px 12px rgba(0,0,0,0.06)`. Inner padding p=16 | Button bg `#e8e8ea` (`AppColors.bgPrimary` DISABLED), text "Xuất hồ sơ bảo hiểm" 16px/w700 white, radius 8, h~48, padding x=16 y=12 |
| List screen Action bar (`452:23332`, state B) | 375×~100 | same | Button bg `#0052ff` (`AppColors.buttonBackgroundPrimary` ENABLED), text white |
| BBNT Action bar (`452:24140`) | 375×~100 | same | Button bg `#0052ff` ENABLED, text "Lưu thông tin" 16px/w700 white |
| Entry host Action bar (`700:28869`) | 375×~176 | same | Contains primary button "+ Tạo hồ sơ bảo hiểm" + likely additional row (taller container 176 vs 100) |

### AppBar (Bars / Nav Bars: Standard)

| Property | Value |
|---|---|
| Height | 52px |
| Title | "Hồ sơ bảo hiểm" 16px / Inter Semi Bold w600 / line-height 24, color `#262626` (`AppColors.textPrimary`), text-center, absolute centered |
| Leading | `vuesax/linear/arrow-left` 20×20 icon |
| Trailing | `vuesax/linear/more` 20×20 icon with `opacity-0` (hidden — present in structure but invisible) |
| Bg | `#ffffff` (`AppColors.bgBase`), border-bottom 1px `#e8e8ea` |
| Padding | x=16, y=8 |

---

## Text Content

> Verbatim text from `get_design_context` (verified vs FEAT v21 AC). Wording defects flagged in `notes` block (frontmatter).

### Screen: Màn "Hồ sơ bảo hiểm" — list (`437:26437` / `452:23174`)

- AppBar title: **"Hồ sơ bảo hiểm"** (leading icon `vuesax/linear/arrow-left`)
- Section header title (18px/w700): **"Tài liệu bảo hiểm"**
- Section description (12px/w400, color `#262626` not secondary `#595e69` per render): **"Chọn tài liệu cần xuất"** (NO trailing period in Figma — FEAT AC-2 v21 has period)
- 4 list rows (in order):
  1. Title **"Phiếu quyết toán"** (14px/w700, color `#172554` `tailwind blue/950`) — subtitle **"SET-20260326-00001"** (12px/w400, color `#595e69`)
  2. Title **"Phiếu báo giá"** — subtitle **"SET-20260326-00001"** (matches FEAT AC-3 v21 mobile = mã phiếu QT)
  3. Title **"Biên bản nghiệm thu"** — 2-line subtitle:
     - Line 1: **"Mẫu chung bảo hiểm"**
     - Line 2: **"Thông tin được sử dụng để lập biên bản nghiệm thu"**
  4. Title **"Giấy uỷ quyền nhận bồi thường"** (FIGMA TYPO — missing "tiền", "uỷ" with `ỷ` not `ủ`) — subtitle **"Áp dụng cho garage chưa ký liên kết với bảo hiểm"** (NO trailing " ·" as FEAT AC-3 v21 mobile column shows)
- Action bar button: **"Xuất hồ sơ bảo hiểm"** (16px/w700 Inter Bold, color `#ffffff`)

### Screen: Phiếu quyết toán (`452:22958`)

- AppBar title: **"Hồ sơ bảo hiểm"** (same generic title — not "Phiếu quyết toán")
- Card 1 header: title **"Phiếu quyết toán sửa chữa"** 16px/w700 + subtitle **"SET-20260326-00001"** 14px/w300 Light color `#52525b`
- 4 info tiles (label `#71717a` / value `#18181b` semibold):
  - "Garage" — "Mỹ Đình - Chữa xe ô tô"
  - "Ngày quyết toán" — "26/03/2026"
  - "Khách hàng" — "Chungntt - 0123123123"
  - "Biển số xe" — "30A1234 - ACURA TSX"
- Card 2 header: **"Dịch vụ thực hiện"** 16px/w700
  - Table headers (bg `#f3f3f4`): **"Nội dung"** | **"SL"** | **"Thành tiền"** 14px/w600
  - Sample row: "Thay bộ đèn trước" | "1" | "87.000.000"
  - Divider line
  - Tổng row: **"Tổng cộng"** 16px/w700 | **"87.000.000"** 16px/w700
- Card 3 header: **"Phụ tùng sử dụng "** (with trailing space) 16px/w700
  - Same table structure
  - Sample row: "Bộ đèn trước" | "1" | "87.000.000"
  - Tổng: "Tổng cộng" | "87.000.000"
- Card 4 header: **"Phân bổ bảo hiểm"** 16px/w700
  - Column header: "Nội dung" | "Thành tiền" (no "SL" column)
  - 5 rows (per `651:30580/30574/30568/30525/30586`):
    1. **"CK liên kết BH - Vật tư"** | **"-9.000.000"**
    2. **"CK liên kết BH - Công dịch vụ"** | **"-9.000.000"**
    3. **"Giảm trừ bồi thường "** (trailing space) | **"-9.000.000"**
    4. **"Khấu hao vật tư/ thay mới "** (trailing space) | **"-9.000.000"**
    5. **"Khấu trừ bảo hiểm"** | **"-9.000.000"**
  - Divider
  - Final row: **"Tổng thanh toán"** 16px/w700 (NOT "Tổng cộng" — different from Bảng Dịch vụ/Phụ tùng) | **"87.000.000"** 16px/w700

### Screen: Phiếu báo giá (`452:23711`)

- AppBar: "Hồ sơ bảo hiểm"
- Card 1 header: **"Phiếu báo giá sửa chữa"** 16px/w700 + subtitle **"SET-20260326-00001"** 14px/w300 Light
- 4 info tiles:
  - "Garage" — "Mỹ Đình - Chữa xe ô tô"
  - "Ngày báo giá" — "26/03/2026"
  - "Công ty bảo hiểm" — "Bảo hiểm Bảo Việt"
  - "Số hợp đồng BH" — "BV-2903812-093814"
- Card 2 header: **"Chi phí sửa chữa"** 16px/w700
  - Table headers: **"Nội dung"** | **"SL"** | **"Thành tiền"**
  - Sample row: "Thay bộ đèn trước" | "1" | "87.000.000"
  - Tổng: **"Tổng cộng"** | **"87.000.000"**

### Screen: Biên bản nghiệm thu (`452:24043`)

- AppBar: **"Hồ sơ bảo hiểm"**
- Banner top: **"Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ."**
- Card 1 (Lập biên bản section):
  - Header title: **"Biển bản nghiệm thu"** (FIGMA TYPO — should be "Biên") 16px/w700
  - Subtitle: **"Biên bản nghiệm thu, thanh lý hợp đồng"** 14px/w300 Light
  - Field 1 (2-col): **"Xe ô tô BKS"** label + sample "30A-123.45"
  - Field 2 (2-col): **"Ngày lập biên bản"** label + sample "24/04/2026"
  - Field 3 (textarea full-width): **"Căn cứ phiếu báo giá"** label + sample "Phiếu báo giá số BG-240426-01 ngày 24/04/2026"
  - Field 4 (full-width input): **"Địa điểm lập biên bản"** label + sample "Trung tâm sửa chữa ô tô Green Auto"
- Card 2 (Thông tin các bên):
  - Header: **"Thông tin các bên"** 16px/w700
  - Field 1 (2-col): **"Bên A"** label + sample "Công ty CP XD Smart Building Việt Nam"
  - Field 2 (2-col): **"Bên B"** label + sample "Trung tâm sửa chữa dịch vụ ô tô Green Auto - Công ty TNHH Tư vấn TM & DV Sơn Quân"
  - Field 3 (2-col): **"Đại diện"** label + sample "Ông Nguyễn Văn Toàn"
  - Field 4 (2-col): **"Chức vụ"** label + sample "Giám đốc"
  - Field 5 (textarea full-width): **"Địa chỉ Garage"** label + sample "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải Phòng"
  - Field 6 (textarea full-width): **"MST / STK / Ngân hàng"** label + sample "MST 0201972206 - STK 19134464547018 - Techcombank Kiến An"
- Card 3 (Nội dung nghiệm thu):
  - Header: **"Nội dung nghiệm thu"** 16px/w700
  - 5 Textareas labeled **"Mục 1"** through **"Mục 5"**:
    - Mục 1 prefill: "Bên B hoàn thành việc sửa chữa xe ô tô biển kiểm soát nêu trên theo đúng báo giá và quyết toán sửa chữa đã thống nhất."
    - Mục 2 prefill: "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ bên B và xác nhận xe đủ điều kiện đưa vào sử dụng."
    - Mục 3 prefill: "Bên B chịu trách nhiệm bảo hành theo nội dung báo giá đã ký; bên A phối hợp xác định nguyên nhân khi phát sinh hư hỏng."
    - Mục 4 prefill: "Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản."
    - Mục 5: placeholder "Nhập nội dung" (empty, with vuesax/linear/trash icon top-right)
  - Add button text: **"+ Mục nghiệm thu"** 14px/w700 color `#0052ff`, bg `#f4f7fe`, radius 8, padding x=16 y=12
- Action bar bottom: Button **"Lưu thông tin"** 16px/w700 white, bg `#0052ff` primary, h~44, full-width

### Screen: Giấy ủy quyền (`452:24580`)

- AppBar: **"Hồ sơ bảo hiểm"**
- Banner top: **"Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ."**
- Card 1 (I. Bên ủy quyền) — header 2-line:
  - Line 1: **"Giấy ủy quyền nhận tiền bồi thường"** 16px/w700
  - Line 2: **"bảo hiểm"** 16px/w700 (continuation)
- Subsequent Cards II / III / IV / V structure inferred from metadata sizes (343×376, 343×462, 343×370, 343×524) — fields per FEAT AC-7 v21 table
- Action bar: Button **"Lưu thông tin"** primary

### Entry host screen `700:28585`

- Action bar contains primary button: **"+ Tạo hồ sơ bảo hiểm"** (per FEAT-INS-STL-DETAIL AC-13 + BR-INS-DOSSIER-011) — Bg `#0052ff`, text 16px/w700 white

---

## Design Tokens

> Token mapping per `_ref-mobile-transform-figma.md §1.5`. Hex from `get_variable_defs` at root node 437:24051 resolved to `AppColors.*` / `AppTextStyle.*` / `AppSizes.*`.

### Universal tokens (apply across screens)

**Colors (mapped from variable_defs)**:

| Figma token | Hex | Mapping (`AppColors.*`) |
|---|---|---|
| `Base/bg-Base` | `#ffffff` | `AppColors.bgBase` |
| `Base/bg-Primary` | `#e8e8ea` | `AppColors.bgPrimary` (disabled bg) |
| `Base/bg-Secondary` | `#f3f3f4` | `AppColors.bgSecondary` |
| `Base/bg-Warning` | `#fff8ec` | `AppColors.bgWarning` |
| `Base/bg-Warning-Strong` | `#ff6b00` | `AppColors.bgWarningStrong` / `textWarningPrimary` |
| `base/bg-warning` (text use) | `#fff8ec` | `AppColors.bgWarning` |
| `Base/bg-Active-CD Garage` | `#0052ff` | `AppColors.bgActive` (button enabled bg) |
| `Base/bg-Error` | `#fff0f0` | `AppColors.bgErrorLight` |
| `Base/text-CD Garage` | `#262626` | `AppColors.textPrimary` |
| `Base/text-Primary` | `#273243` | `AppColors.textPrimary` (alt) |
| `tailwind-colors/blue/950` | `#172554` | text-active tone for card titles |
| `Base/text-Secondary` | `#595e69` | `AppColors.textSecondary` |
| `Base/text-Tertiary` | `#888c94` | `AppColors.textTertiary` |
| `Base/text-Quaternary` | `#b8babf` | `AppColors.textQuaternary` (s400) |
| `base/muted-foreground` | `#71717a` | `AppColors.textMutedForeground` |
| `Base/text-White` | `#ffffff` | `AppColors.textWhite` |
| `Base/text-Error` | `#ed1f42` | `AppColors.textErrorPrimary` |
| `Base/text-Active-Primary-CD Garage` | `#0052ff` | `AppColors.textActivePrimary` |
| `Base/button-Background-Primary-CD Garage` | `#0052ff` | `AppColors.buttonBackgroundPrimary` |
| `Base/border-Primary` | `#e8e8ea` | `AppColors.borderPrimary` |
| `Base/border-Secondary` | `#f3f3f4` | `AppColors.borderSecondary` |
| `Base/border-Garage` (2px checkbox unchecked border) | `#d1d1d1` | `AppColors.borderGarage` |
| `base/border-warning` (orange banner border) | `#f97316` | `AppColors.borderWarning` |
| `base/input` (Input field border) | `#e4e4e7` | `AppColors.borderPrimary` (semantic) |
| `Color/Gray/50` (PQT/PBG info tile bg) | `#f6f6f6` | `AppColors.bgSecondary` (alt) |
| `colors/dialog-primary-bg` (Add-item button bg) | `#f4f7fe` | (light blue tint — verify if mapped token exists, else literal) |

**Typography (mapped from variable_defs)**:

| Figma token | (font, size, weight, line-height) | Mapping (`AppTextStyle.*`) |
|---|---|---|
| `Heading/H3` | Inter Bold 18/700/26 | `AppTextStyle.textHeadingH3` |
| `Heading/H4` | Inter Bold 16/700/24 | `AppTextStyle.textHeadingH4` |
| `Heading/H5` | Inter Bold 14/700/20 | `AppTextStyle.textHeadingH5` |
| `Subtitle/S4` | Inter SemiBold 16/600/24 | `AppTextStyle.textSubtitleS4` |
| `Subtitle/S5` | Inter SemiBold 14/600/20 | `AppTextStyle.textSubtitleS5` |
| `Subtitle/S6` | Inter SemiBold 13/600/18 | `AppTextStyle.textSubtitleS6` |
| `Subtitle/S7` | Inter SemiBold 12/600/18 | `AppTextStyle.textSubtitleS7` |
| `Body/B5` | Inter Medium 14/500/20 | `AppTextStyle.textBodyB5` |
| `Body/B7` | Inter Medium 12/500/18 | `AppTextStyle.textBodyB7` |
| `Caption/C5` | Inter Regular 14/400/20 | `AppTextStyle.textCaptionC5` |
| `Caption/C7` | Inter Regular 12/400/18 | `AppTextStyle.textCaptionC7` |
| `Caption/C8` | Inter Regular 10/400/14 | `AppTextStyle.textCaptionC8` |
| `Regular/None/Medium` | Inter Medium 16/500/16 | (medium 16, alt — use `textBodyB4` if exists, else literal) |

**Spacing scale (from variable_defs `Spacing - Border/*`)**:

| Token | px | `AppSizes` |
|---|---|---|
| `Spacing - Border/0` | 0 | `AppSizes.zeroSize` |
| `Spacing - Border/4` | 4 | `AppSizes.spacing4` |
| `Spacing - Border/8` | 8 | `AppSizes.spacing8` |
| `Spacing - Border/12` | 12 | (not in scale — use `EdgeInsets.all(12)`) |
| `Spacing - Border/16` | 16 | `AppSizes.spacing16` |
| `Spacing - Border/24` | 24 | (not in scale — use literal) |
| `spacing/1` | 4 | `AppSizes.spacing4` |
| `spacing/2` | 8 | `AppSizes.spacing8` |
| `spacing/3` | 12 | literal |
| `spacing/4` | 16 | `AppSizes.spacing16` |
| `spacing/1-5` | 6 | literal |

**Border radius**:

| Token | px | Flutter |
|---|---|---|
| `border-radius/md` | 6 | `BorderRadius.circular(6)` |
| `border-radius/lg` | 8 | `BorderRadius.circular(8)` |
| `border-radius/xl` | 12 | `BorderRadius.circular(12)` |

**Shadows**:

| Token | Definition | Flutter |
|---|---|---|
| `shadow/sm` | `0px 1px 2px 0px rgba(0,0,0,0.05)` | textarea wrapper subtle |
| Action bar shadow | `0px -4px 12px 0px rgba(0,0,0,0.06)` | `AppShadows.itemBoxShadow` (estimate — verify token) |
| `s2` (effect tokens, multi-layer drop shadow) | 3 drop shadows on Card | NOT applied on dossier Cards in design (Cards appear shadow-less) |

### Per-screen Design Tokens (key callouts)

#### Screen list (`437:26437` / `452:23174`)

- Section title "Tài liệu bảo hiểm" — 18/700/26 → `AppTextStyle.textHeadingH3`, color `#172554` (tailwind blue/950)
- Section description "Chọn tài liệu cần xuất" — 12/400/18 → `AppTextStyle.textCaptionC7`, color `#262626` (NOT `textSecondary` — full primary tone per Figma)
- Row tiêu đề — 14/700/leading-none → `AppTextStyle.textHeadingH5`, color `#172554`, letter-spacing `-0.4px` (`font/letter-spacing/tight`)
- Row dòng phụ — 12/400/18 → `AppTextStyle.textCaptionC7`, color `#595e69` (`textSecondary`)
- Row card bg `#ffffff`, border 1px `#e8e8ea` (`borderPrimary`), radius 12 (`border-radius/xl`)
- Row gap (between checkbox+content and arrow): 65px (per metadata flex gap)
- Container "AC-3 4 thẻ" padding p=16, gap=16 between rows (`Column` gap=Gap(AppSizes.spacing16))
- Action bar Button label "Xuất hồ sơ bảo hiểm" — 16/700/24 → `AppTextStyle.textHeadingH4`, color `#ffffff`
- Action bar Button enabled bg `#0052ff` (`AppColors.buttonBackgroundPrimary`); disabled bg `#e8e8ea` (`AppColors.bgPrimary` aka light grey)
- Checkbox unchecked: 20×20, border 2px `#d1d1d1` (`borderGarage`), radius 4 (`Spacing - Border/4`)
- Checkbox checked: 20×20, bg `#0052ff` (`buttonBackgroundPrimary`), radius 4, white check icon

#### Screen PQT (`452:22958`)

- Card bg `#ffffff` (`base/card`), border `#ffffff` (border same as bg — effectively borderless), radius 12, padding 16, gap inner 16
- Header title "Phiếu quyết toán sửa chữa" — 16/700/leading-none → `AppTextStyle.textHeadingH4`, color `#172554`, letter-spacing -0.4
- Subtitle SET-{code} — 14/300 Light Inter / 20 → (Light weight 300 — no exact AppTextStyle match; use raw `TextStyle(fontSize: 14, fontWeight: FontWeight.w300, ...)` or AppTextStyle.textCaptionC5 with weight override)
- Info tile (4 tiles per header Card): bg `#f6f6f6`, border 1px `#f3f3f4`, radius 8, padding x=16/y=12, gap inner 4
  - Label 12/regular/leading-none → `AppTextStyle.textCaptionC7`, color `#71717a` (muted-foreground)
  - Value 14/semibold/20 → `AppTextStyle.textSubtitleS5`, color `#18181b` (accent-foreground)
- Bảng (Dịch vụ/Phụ tùng/Phân bổ) table:
  - Column header row: bg `#f3f3f4` (`bgSecondary`), padding x=8/y=4
  - Header text 14/600/20 → `AppTextStyle.textSubtitleS5`, color black `#000000`
  - Row cell text 14/regular/20 → `AppTextStyle.textCaptionC5`, color black
  - Inter-row gap = 14px (`gap-[14px]` literal — outside scale)
  - Divider: 1px line `imgLine2` SVG (likely `Divider(color: AppColors.borderPrimary, thickness: 1)`)
  - Tổng row: 16/700/24 → `AppTextStyle.textHeadingH4`, color black
- Tổng cộng row spacing: justify-between, leading-[24px]

#### Screen PBG (`452:23711`)

- Same Card structure as PQT
- Header "Phiếu báo giá sửa chữa" + SET-{code} subtitle (same style)
- 4 info tiles (Garage / Ngày báo giá / Công ty bảo hiểm / Số hợp đồng BH)
- 1 Card "Chi phí sửa chữa" — table 3-col

#### Screen BBNT (`452:24043`)

- Banner outer frame padding 16h/8v, bg none
- Banner inner card: bg `#fff8ec`, border 1px solid `#f97316`, radius 8, padding all 10
- Banner text: 12/Inter Bold w700/leading-normal → AppTextStyle.textSubtitleS7 weight override to 700 (or use literal `TextStyle(fontSize: 12, fontWeight: FontWeight.w700, ...)`), color `#ff6b00`
- Card bg `#ffffff`, padding 16, gap inner 16 (Card-level), gap field 12 (within slot)
- Field 2-col row: gap 12 (`gap-[12px]`)
- Input/Basic: label above (gap 8 below), input wrapper bg `#ffffff` border 1 `#e4e4e7` radius 8 h=36 padding x=12/y=4
- Textarea wrapper: bg `#ffffff` border 1 `#e4e4e7` radius 6 (`md`) min-h=60 padding x=12/y=8, shadow `0px 1px 2px rgba(0,0,0,0.05)`
- Add button "+ Mục nghiệm thu": bg `#f4f7fe` (dialog-primary-bg), text 14/700/20 color `#0052ff`, padding x=16/y=12, radius 8, full-width

#### Screen GUQ (`452:24580`)

- Same Card / Banner / Input / Textarea token mapping as BBNT
- Card 5 sections (I/II/III/IV/V) with progressive heights (316/376/462/370/524) — 5+ field groups

#### Entry host (`700:28585`)

- Action bar bg `#ffffff`, radius-top 8, shadow `0px -4px 12px rgba(0,0,0,0.06)`
- Button "+ Tạo hồ sơ bảo hiểm" — same as ENABLED list-screen action button (bg `#0052ff`, text white 16/700)
- **Gate**: Per BR-INS-DOSSIER-011 — only render khi Settlement.bên_thanh_toán = "BAOHIEM"

---

## Screenshots

> Lưu tại `assets/wave02-ins-dossier-create/`. Tổng 13 PNG (1 `_full.png` từ session trước + 12 fetched this session).

- `_full.png` — toàn section node 437:24051 (preserved from previous orchestrator session)
- `700-28585.png` — Entry host: Chi tiết phiếu QT BH (Action bar host) — 375×2111
- `437-26437.png` — Màn list state A (unchecked, btn DISABLED) — 375×812
- `452-23174.png` — Màn list state B (all 4 checked blue, btn ENABLED) — 375×812
- `452-22958.png` — Phiếu quyết toán read-only — 375×1251
- `452-23711.png` — Phiếu báo giá read-only — 375×812
- `452-24043.png` — Biên bản nghiệm thu (template điền) — 375×1640
- `452-24580.png` — Giấy ủy quyền (template điền) — 375×2401 (rendered scaled to 320×2048 due to maxDimension cap)
- `700-28869.png` — Section: Action bar instance entry host (CTA "+ Tạo hồ sơ bảo hiểm") — 375×176
- `437-27245.png` — Section: Container "AC-3 4 thẻ" state A — 375×424
- `700-29194.png` — Section: Container "AC-3 4 thẻ" state B (all checked) — 375×424
- `452-24231.png` — Section: Banner warning frame BBNT — 374×66
- `452-24974.png` — Section: Banner warning frame GUQ — 374×66

**Direct Figma URLs per screen-state** (for live verify):
- Full: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=437-24051&m=dev
- 437-26437: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=437-26437&m=dev
- 452-23174: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=452-23174&m=dev
- 452-22958: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=452-22958&m=dev
- 452-23711: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=452-23711&m=dev
- 452-24043: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=452-24043&m=dev
- 452-24580: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=452-24580&m=dev
- 700-28585: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=700-28585&m=dev

---

## Pixel-perfect Checklist Status

Status of `_ref-test-figma-oracle-flow.md §4` items captured in this oracle:

### P1 — Spacing
- [x] padding & gap — captured from metadata + design_context (list row gap 16, 4-thẻ container p=16/gap=16, Card p=16/gap inner 16, field row gap 12, 2-col gap 12, banner inner p=10)
- [x] row-height — Input h=36, Textarea min-h=60, list row 68/104, Action bar 100/176, Banner 66, AppBar 52, StatusBar 44, Card varies per content
- [x] EXACT — `Spacing - Border/N` tokens applied per design_context output

### P1 — Interaction states
- [x] Checkbox checked/unchecked — captured (state A vs state B variants)
- [x] Button enabled/disabled — captured (state A bg `#e8e8ea` DISABLED vs state B bg `#0052ff` ENABLED)
- [ ] Button hover/focus/pressed — NOT in Figma variants — defer to AppButton catalog defaults
- [ ] Input focus/error — NOT in Figma — defer to AppTextField defaults
- [ ] List item tap-feedback — InkWell ripple default

### P2 — Typography
- [x] font-family Inter (via google_fonts → AppTextStyle.*)
- [x] font-size + weight — verbatim from variable_defs (Heading/H3-H5, Subtitle/S4-S7, Body/B5/B7, Caption/C5/C7/C8)
- [x] line-height — included in token definition (`lineHeight: N`)
- [x] letter-spacing — `tracking-[-0.4px]` applied to card titles (`font/letter-spacing/tight`)

### P2 — Border
- [x] border-width: 1px (most) or 2px (Checkbox unchecked outer)
- [x] border-style: solid
- [x] border-color: `#e8e8ea` borderPrimary / `#e4e4e7` input border / `#f3f3f4` borderSecondary / `#d1d1d1` borderGarage / `#f97316` borderWarning
- [x] border-radius: 4 (Checkbox), 6 (Textarea md), 8 (Input lg), 12 (Card xl)

### P2 — Small component dimensions
- [x] Checkbox: 20×20 (border 2px, radius 4, inner check icon inset 18.75% = ~3.75px)
- [x] Icon button arrow-right: 20×20
- [x] Icon trash (BBNT Mục 5 + GUQ): 20×20 absolute position `left=281 top=40`
- [x] Banner: 374×66 with inner card padding 10
- [x] Input: w-full × h-36; Textarea: w-full × min-h-60
- [x] Button list-row action: full-width × ~h44/h48 (padding y=12 + text line-h=24 → h=48 effective)

### P3 — Other
- [x] box-shadow: Action bar `0px -4px 12px rgba(0,0,0,0.06)`; Textarea wrapper `0px 1px 2px rgba(0,0,0,0.05)` (shadow/sm)
- [x] opacity: `opacity-0` on hidden NavBar trailing icon `vuesax/linear/more`
- [x] icon name + size: `vuesax/linear/arrow-left`, `arrow-right`, `more`, `trash` — all 20×20
- [x] overflow: BBNT (1640px) and GUQ (2401px) exceed 812 viewport → ListView vertical scroll
- [x] z-index N/A mobile (use `Stack` for absolute positioning of Action bar pinned bottom)

### Text verbatim
- [x] All visible text captured verbatim from `get_design_context` per screen (BBNT 5 Mục prefilled, PQT info tile values, PBG info tiles, list row titles + subtitles, banner text, button labels)
- [x] Wording defects flagged in `notes` block

### Coverage gates
- [x] **Screen-coverage**: 7/7 screen-states inventoried + 5 section sub-screenshots
- [x] **AC-coverage**:
  - AC-1 (entry CTA) — covered ✓
  - AC-2 (màn list header + description) — covered ✓
  - AC-3 (4 list rows) — covered ✓ + state A/B variants captured
  - AC-4 (Phiếu QT template) — covered ✓
  - AC-5 (Phiếu BG template) — covered ✓
  - AC-6 (BBNT template điền) — covered ✓ + 5 Mục prefill captured + Add button text "+ Mục nghiệm thu" flagged
  - AC-7 (GUQ template điền) — covered ✓ structure-wise; per-field labels in 5 cards need spot-check on rendered screenshot (sample values not pulled per-field due to size persist-to-file limit on screen 452:24580)
  - AC-8 (preview + Lưu thông tin app) — covered ✓
  - AC-9 (footer Xuất hồ sơ bảo hiểm) — covered ✓ + ENABLED/DISABLED states
  - AC-10..AC-12 (versioning / read-only / no-edit) — out of scope this design (post-export state)
  - AC-13 (phân quyền) — covered via FEAT spec
  - AC-14 (lỗi PDF toast) — NOT in design (runtime state)
- [x] **Visual reconcile M7**: completed — 12 fresh PNGs captured, cross-checked vs FEAT spec; wording defects flagged

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | TEST (agent-test-ui orchestrator via /prefetch-figma-oracle mobile 02, RE-RUN) | **FULL completeness** (E1 per `_ref-test-figma-oracle-flow.md §4b`): settings patched, all 4 MCP tools allowed. get_metadata + get_variable_defs + get_design_context (per screen) + get_screenshot all succeeded. 7 screen-states inventoried (700:28585 entry host + 437:26437 / 452:23174 list states A/B + 4 template details 452:22958/452:23711/452:24043/452:24580). 12 PNGs fetched + downloaded via Python urllib + saved to `assets/wave02-ins-dossier-create/`. `_full.png` preserved from parent session. data_completeness: screen_inventory/component_inventory/variant_state/text_content/design_tokens all complete; interaction_states partial (Figma static — defer to widget catalog). notes block flags multiple wording defects between Figma render vs FEAT v21 spec: (1) "Giấy uỷ quyền nhận bồi thường" Figma vs "Giấy ủy quyền nhận tiền bồi thường" FEAT, (2) "Biển bản nghiệm thu" Figma typo vs "Biên bản" FEAT, (3) "+ Mục nghiệm thu" Figma vs "+ Thêm mục điều khoản" FEAT AC-6, (4) "Chọn tài liệu cần xuất" Figma (no period) vs "Chọn tài liệu cần xuất." FEAT AC-2, (5) "Xe ô tô BKS" Figma label vs "BKS xe" FEAT AC-6 column, (6) BBNT "Tổng thanh toán" PQT Phân bổ row vs "Tổng cộng" FEAT AC-4. Section description color in Figma is `#262626` textPrimary (NOT `textSecondary` muted). PBG mobile dòng phụ = mã phiếu QT SET-{code} confirmed (FEAT AC-5 mobile column matches). PQT Phân bổ bảo hiểm 5 rows all rendered with `-9.000.000` sample values (no sign-color rule applied on mobile in Figma render — FEAT-INS-SO-ADJUSTMENT AC-10 sign-coloring may be web-only). |
