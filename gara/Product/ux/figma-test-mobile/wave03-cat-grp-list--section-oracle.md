---
feat: FEAT-CAT-GRP-LIST
feat_file: Product/features/FEAT-CAT-GRP-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "81:39472"
screen_slug: section
fetched_at: 2026-06-29T03:18:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: MCP_OUTPUT_TOO_LARGE (724k chars — section quá phức tạp với 4 màn chi tiết phiếu QT)
  get_variable_defs: success (file nAoFS33sTWj3ctWjZMUDEl)
  get_design_context: skipped (rely on _full.png + sibling kh-alloc-only metadata)
  get_screenshot: success (1 PNG: _full overview 1912×2048)
data_completeness:
  screen_inventory: complete (4 frame variants identified từ _full.png visual)
  component_inventory: partial (visual-only — bóc từ _full.png + sibling 758:28571 metadata)
  variant_state: complete (4 settlement scenario state)
  text_content: complete (verbatim từ visual + sibling)
  design_tokens: complete (variable_defs)
  interaction_states: partial (Figma không render :pressed/:focus)
screenshots:
  - assets/wave03-cat-grp-list--section/_full.png
---

# Oracle — FEAT-CAT-GRP-LIST (mobile · section) · wave 03

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter). Section `81:39472` trong
> file legacy `nAoFS33sTWj3ctWjZMUDEl` (App-GMS-v3 New Design).
>
> **⚠️ REGISTRY/SCOPE DRIFT**: Section name registry maps `FEAT-CAT-GRP-LIST` slug `section`, NHƯNG
> thực tế Figma content là **4 màn "Chi tiết phiếu quyết toán"** với matrix dữ liệu BH/KH chi trả —
> KHÔNG phải màn list nhóm vật tư. Agent-test-ui flag mạnh cho BA/PO + figma-links registry maintainer:
> `81:39472` thuộc về FEAT-INS-STL-DETAIL hoặc CR-20260612-01 (mobile mirror), không phải GRP-LIST.
> Verify implementation theo FEAT-CAT-GRP-LIST AC bằng UX-FLOW fallback (`Product/ux/UX-FLOW-*.md`)
> nếu agent-test-ui detect mismatch.
>
> Oracle dưới đây ghi nhận **content thực tế** trong Figma (settlement detail screens) để dev nếu
> nhận implementation cho luồng này có baseline.

---

## Screen Inventory

> 4 frame side-by-side trong section, mỗi frame 375×1703 (scroll). Mỗi frame = 1 variant "Chi tiết
> phiếu quyết toán" với combination khác nhau của BH/KH chi trả.

| Screen state | Frame col (in _full.png) | size (W×H) | screenshot |
|---|---|---|---|
| 1. Chi tiết phiếu QT — BH chi trả (Bảo hiểm BIDV) — tab "Bảng chi phí" với section Phân bổ BH | col 1 | 375×1703 | (xem _full.png col 1) |
| 2. Chi tiết phiếu QT — KH chi trả (Nguyễn Bình Minh), Bảo hiểm: Không | col 2 | 375×1703 | (xem _full.png col 2) |
| 3. Chi tiết phiếu QT — KH chi trả, Bảo hiểm: Có (Bảo Việt BVS) — Tab "Bảng chi phí" với section Phân bổ BH | col 3 | 375×1703 | (xem _full.png col 3) |
| 4. Chi tiết phiếu QT — KH chi trả only (no dịch vụ list, only "Hồ sơ bảo lãnh") | col 4 | 375×1703 | (xem _full.png col 4) |
| (Aggregate) Section full 4 screens | `81:39472` | 2390×2567 | `assets/wave03-cat-grp-list--section/_full.png` |

---

## Component Inventory

> **Visual-only extraction** từ `_full.png` (metadata too-large). Mapping suy theo `_ref-mobile-transform-figma.md §1.5`
> + sibling node `758:28571` metadata (đã có structure tham khảo cho col 4).

### Shared chrome (all 4 screens)

| Component | Brief | Flutter mapping |
|---|---|---|
| Status bar | h=44 system | `MediaQuery.padding.top` |
| AppBar | h=52, left back arrow, title center **"Chi tiết phiếu quyết toán"** Semi Bold 16 `#262626`, right `vuesax/linear/more` 20px (3-dot menu) | `AppBar` |
| Tab bar (3 tab dưới header card) | "Bảng chi phí" · "Chứng từ & hóa đơn" · "Hồ sơ bảo hiểm" (4th tab "Lịch sử thanh toán" trong screen 1) — active tab "Bảng chi phí" underline 2px `#0052ff` text Bold 14 `#0052ff` | `TabBar` |

### Per-screen variant content

#### Screen 1 — BH chi trả + Phân bổ BH section
| Section | Brief |
|---|---|
| Header card | `#PHDV-240923-001` Bold 16 `#0052ff` + Badge "Chưa thanh toán" Red bg `#fff0f0` text `#ed1f42` |
| Sub info | Icon calendar "Cập nhật: 19/05/2034 12:20" · Icon note "Phiếu dịch vụ liên kết: #1234567" · Icon security "Bảo hiểm chi trả: Bảo hiểm BIDV" · Icon note "Ghi chú quyết toán: Chờ bảo hiểm duyệt giá lọc dầu" |
| Total row | "Tổng tiền: 55.000.000 VND" Blue + "Còn lại: 55.000.000 VND" Red Bold |
| Collapse card "Thông tin khách hàng" | Header row with chevron-right arrow |
| Collapse card "Thông tin xe" | Header row with chevron-right arrow |
| Tab bar 4-tab | Bảng chi phí (active) · Chứng từ & hóa đơn · Hồ sơ bảo hiểm · (4th — partial) |
| Dịch vụ thực hiện | Section header "Số lượng: 02" + 2 card row "1- Sửa chữa má phanh" + "2- Bảo dưỡng định kỳ" |
| Phụ tùng sử dụng | Section header "Số lượng: 02" + 2 card row "1- Má phanh" + "2- Gương" |
| Thông tin bảo hiểm | Icon shield "Bảo hiểm: Có" · "Công ty bảo hiểm: Bảo hiểm Bảo Việt - BVS" · "Số hợp đồng: 1923HD38223" · "Ngày hết hạn: 19/05/2034" · "SDT liên hệ bảo hiểm: 0912838091" · "Người giám định: Trương Diệu Ly" |
| Hồ sơ bảo lãnh | File card "Filename.format 1.3MB" |
| Phân bổ bảo hiểm | Section "CK liên kết BH — Vật tư -540.000đ" · "CK liên kết BH — Công dịch vụ -50.000đ" · "Giảm trừ bồi thường -50.000đ" · "Khấu hao vật tư / thay mới -45.000.000đ" · "Khấu trừ BH -5.000.000đ" |
| Tổng giá dịch vụ | "Chi tiết theo bên thanh toán" + sub "Bảo hiểm thanh toán" row 4 fields (Dịch vụ 540.000đ · Phụ tùng 50.000đ · VAT 50.000đ · Cộng sau VAT 50.000đ) |
| Cân thanh toán | "Bảo hiểm thanh toán 15.000.000đ" + "Tổng thanh toán 38.440.000đ" Bold Blue |
| Bottom actions | Button "Chỉnh sửa phiếu" secondary edit-icon · Button "Tạo hồ sơ bảo hiểm" outline `#edf7ff`/`#0052ff` · Button "Thanh toán" primary `#0052ff` |

#### Screen 2 — KH chi trả + Bảo hiểm Không
- Header identical structure (PHDV-240923-001).
- Sub info ROW thay đổi: "Khách hàng chi trả: Nguyễn Bình Minh" (thay BH chi trả).
- Tab "Bảng chi phí" active.
- "Thông tin bảo hiểm" → "Bảo hiểm: Không" + tất cả field BH = "--" (Em-dash placeholder).
- "Tổng chi phí" section: "Tổng thành tiền dịch vụ 440.000đ" · "Tổng thành tiền phụ tùng 38.000.000đ" · "Tổng thanh toán 38.440.000đ" Bold Blue + sub "(Dịch vụ + phụ tùng)".
- Bottom action: chỉ 2 button ("Chỉnh sửa phiếu" + "Thanh toán" primary).

#### Screen 3 — KH chi trả + Bảo hiểm Có (Bảo Việt BVS)
- Identical chrome.
- Sub info: "Khách hàng chi trả: Nguyễn Bình Minh".
- "Thông tin bảo hiểm: Có" + Bảo Việt BVS + 1923HD38223 + ...
- Có thêm section "Phân bổ bảo hiểm" giảm trừ.
- "Tổng giá dịch vụ" → "Chi tiết theo bên thanh toán" → "Khách hàng thanh toán" 4 fields (cùng layout với screen 1 nhưng filter KH).
- "Cân thanh toán" Khách hàng thanh toán 15.000.000đ → Tổng thanh toán 38.440.000đ.
- Bottom: 2 button "Chỉnh sửa phiếu" + "Thanh toán".

#### Screen 4 — KH chi trả only (Số lượng 0 dịch vụ/phụ tùng)
- Identical chrome.
- "Dịch vụ thực hiện: Số lượng: 0" + "Phụ tùng sử dụng: Số lượng: 0".
- "Thông tin bảo hiểm: Có" + đầy đủ field BH như screen 3.
- "Hồ sơ bảo lãnh" file card.
- "Phân bổ bảo hiểm" Giảm trừ bồi thường +50.000đ / Khấu hao vật tư +45.000.000đ / Khấu trừ BH +5.000.000đ.
- "Tổng giá dịch vụ" → Chi tiết theo bên thanh toán → Khách hàng thanh toán → 0đ all 4 fields → Cần thanh toán 50.050.000đ → Tổng thanh toán 50.050.000đ Blue Bold.
- Bottom: "Chỉnh sửa phiếu" + "Thanh toán".

---

## Variant & State

> 4 screens = 4 state variants của FEAT-INS-STL-DETAIL (NOT GRP-LIST).

| State | Trigger | Visual diff |
|---|---|---|
| BH chi trả only | `settlement.payer = INSURANCE`, has insurance link | Sub info "Bảo hiểm chi trả: {company}"; bottom 3 buttons |
| KH chi trả + Bảo hiểm Không | `payer = CUSTOMER`, `insurance = null` | Sub "Khách hàng chi trả"; BH section "Không" + "--"; 2 buttons |
| KH chi trả + Bảo hiểm Có | `payer = CUSTOMER`, `insurance.exists = true` | Sub "Khách hàng chi trả"; BH section full data; Phân bổ BH section visible |
| KH chi trả + Empty SO | `payer = CUSTOMER`, `services.count = 0` | "Số lượng: 0" both sections; payment totals = 0 |

### Tab bar
- **Variants**: 3 (screen 2, 3, 4) hoặc 4 tab (screen 1).
- **Active state**: text `#0052ff` Bold 14, underline 2px `#0052ff`.
- **Non-active**: text `#262626` Regular 14.

### Badge "Chưa thanh toán"
- **Variant — Unpaid**: bg `#fff0f0` (`Red/50`), text `#ed1f42` (`text-Error`), B7 12 Medium.
- **States observed**: 1 unpaid state (paid/partial variants TBD trong FEAT AC).

### Bottom action button cluster
- **Variant 1 — 3 button stack** (screen 1, BH chi trả): "Chỉnh sửa phiếu" sec + "Tạo hồ sơ bảo hiểm" outline + "Thanh toán" primary.
- **Variant 2 — 2 button** (screens 2-4): "Chỉnh sửa phiếu" sec + "Thanh toán" primary.

---

## Text Content (verbatim từ visual)

### AppBar
- Title: **"Chi tiết phiếu quyết toán"**

### Header (all 4 screens)
- Code: **"#PHDV-240923-001"** (`#PHDV-` prefix, Bold 16 `#0052ff`)
- Badge: **"Chưa thanh toán"** (Medium 12 `#ed1f42`)
- Update: **"Cập nhật: 19/05/2034 12:20"**
- Linked: **"Phiếu dịch vụ liên kết: #1234567"**

### Screen 1 variants (BH)
- **"Bảo hiểm chi trả: Bảo hiểm BIDV"**
- **"Ghi chú quyết toán: Chờ bảo hiểm duyệt giá lọc dầu"**
- **"Tổng tiền: 55.000.000 VND"** / **"Còn lại: 55.000.000 VND"**

### Screen 2-4 variants (KH)
- **"Khách hàng chi trả: Nguyễn Bình Minh"**

### Collapse cards
- **"Thông tin khách hàng"** (Semi Bold 16)
- **"Thông tin xe"** (Semi Bold 16)

### Tab labels
- **"Bảng chi phí"** (active) · **"Chứng từ & hóa đơn"** · **"Hồ sơ bảo hiểm"** · **"Lịch sử thanh toán"** (screen 1 only)

### Section labels
- **"Dịch vụ thực hiện"** · **"Số lượng: 02"** (or 0)
- **"Phụ tùng sử dụng"** · **"Số lượng: 02"** (or 0)
- **"Thông tin bảo hiểm"** + sub rows: **"Bảo hiểm: Có"** / **"Bảo hiểm: Không"** · **"Công ty bảo hiểm: Bảo hiểm Bảo Việt - BVS"** / **"--"** · **"Số hợp đồng: 1923HD38223"** / **"--"** · **"Ngày hết hạn: 19/05/2034"** / **"--"** · **"SDT liên hệ bảo hiểm: 0912838091"** / **"--"** · **"Người giám định: Trương Diệu Ly"** / **"--"**
- **"Hồ sơ bảo lãnh"** + file card name "Filename.format" 1.3MB
- **"Phân bổ bảo hiểm"** + rows: **"CK liên kết BH — Vật tư"** · **"CK liên kết BH — Công dịch vụ"** · **"Giảm trừ bồi thường"** · **"Khấu hao vật tư / thay mới"** · **"Khấu trừ BH"**
- **"Tổng giá dịch vụ"** · **"Chi tiết theo bên thanh toán"** · **"Bảo hiểm thanh toán"** / **"Khách hàng thanh toán"** · **"Dịch vụ"** · **"Phụ tùng"** · **"VAT"** · **"Cộng sau VAT"**
- **"Cần thanh toán"** · **"Bảo hiểm thanh toán"** / **"Khách hàng thanh toán"** · **"Tổng thanh toán"**
- **"Tổng chi phí"** (screen 2) + sub: **"Tổng thành tiền dịch vụ"** · **"Tổng thành tiền phụ tùng"** · **"(Dịch vụ + phụ tùng)"**

### Bottom buttons
- **"Chỉnh sửa phiếu"** (secondary edit-icon)
- **"Tạo hồ sơ bảo hiểm"** (outline) — chỉ screen 1
- **"Thanh toán"** (primary)

---

## Design Tokens

> **From `get_variable_defs(319:65571)` (cached, file nAoFS33sTWj3ctWjZMUDEl)** — vocab khác file
> App-Garage-V3 nhưng phần lớn semantic giống.

### Colors

| Hex | Role | Token |
|---|---|---|
| `#ffffff` | Bg base | `AppColors.bgBase` |
| `#262626` | Title, body | `AppColors.textPrimary` |
| `#273243` | Button "Chỉnh sửa phiếu" text | `AppColors.textPrimary` (alias) |
| `#0052ff` | Code `#PHDV-...`, tab active text+underline, "Tạo hồ sơ bảo hiểm" text, "Thanh toán" bg, "Tổng tiền" text | `AppColors.textActivePrimary` / `bgActive` / `borderActive` |
| `#edf7ff` (NOT in this file vocab — from FEAT-CAT-PROD-DETAIL inheritance) | "Tạo hồ sơ bảo hiểm" button bg outline | `PrimaryColor.s50` |
| `#15aa2c` | Success text (paid badge if shown) | `AppColors.textSuccessPrimary` |
| `#f0fdf1` | Success bg | `AppColors.bgBadgeSuccess` |
| `#ed1f42` | "Chưa thanh toán" badge text, "Còn lại" red value | `AppColors.textErrorPrimary` |
| `#fff0f0` | "Chưa thanh toán" badge bg | `RedColor.s50` |
| `#888c94` | Muted text (icon labels, secondary info), placeholder | `AppColors.textTertiary` |
| `#595e69` | (`Color/Neutral/700`) secondary text | `AppColors.textSecondary` |
| `#b8babf` | Quaternary | `AppColors.textQuaternary` |
| `#e8e8ea` | Border, divider 6px spacer | `AppColors.borderPrimary` / `bgPrimary` |
| `#f3f3f4` | Secondary bg | `AppColors.bgSecondary` |
| `#000000` | Home indicator | `BaseColor.black` |
| `#ff6b00` | Warning text | `AppColors.textWarningPrimary` |
| `#fff8ec` | Warning bg | `OrangeColor.s50` |
| `#2946e7` | Processing text | (Blue variant — custom) |
| `#eff3ff` | Processing bg | (Blue variant — custom) |

### Typography

| Style | Used at | Token |
|---|---|---|
| `Heading/H3` Bold 18/26 | Section titles ("Phân bổ bảo hiểm", "Tổng giá dịch vụ", "Cần thanh toán") | `AppTextStyle.textHeadingH3` |
| `Heading/H4` Bold 16/24 | Code `#PHDV-...`, button text "Chỉnh sửa phiếu"/"Thanh toán"/"Tạo hồ sơ bảo hiểm" | `AppTextStyle.textHeadingH4` |
| `Heading/H5` Bold 14/20 | (Sub title) | `AppTextStyle.textHeadingH5` |
| `Subtitle/S4` SB 16/24 | "Thông tin khách hàng" / "Thông tin xe" collapse header, AppBar title | `AppTextStyle.textSubtitleS4` |
| `Subtitle/S5` SB 14/20 | "Dịch vụ thực hiện" / "Phụ tùng sử dụng" section labels | `AppTextStyle.textSubtitleS5` |
| `Subtitle/S6` SB 13/18 | (smaller subtitle) | `AppTextStyle.textSubtitleS6` |
| `Subtitle/S7` SB 12/18 | Tag/chip small | `AppTextStyle.textSubtitleS7` |
| `Body/B5` Med 14/20 | Row values, info text | `AppTextStyle.textBodyB5` |
| `Body/B7` Med 12/18 | Badge "Chưa thanh toán", small chip | `AppTextStyle.textBodyB7` |
| `Body/B8` Med 10/14 | Tiny text | `AppTextStyle.textBodyB8` |
| `Caption/C5` Reg 14/20 | Row label "Khách hàng thanh toán" et al, descriptive text | `AppTextStyle.textCaptionC5` |
| `Caption/C7` Reg 12/18 | Sample data sub-text "x2 • 140.000đ" | `AppTextStyle.textCaptionC7` |
| `Caption/C8` Reg 10/14 | (alt) | `AppTextStyle.textCaptionC8` |
| `14px/Bold` Bold 14/20 | Heading variant | (alias) |
| `14px/Medium` Med 14/20 | (alias B5) | `AppTextStyle.textBodyB5` |
| `14px/Regular` Reg 14/20 | (alias C5) | `AppTextStyle.textCaptionC5` |
| `14px/SemiBold` SB 14/20 | (alias S5) | `AppTextStyle.textSubtitleS5` |

### Spacing

| Element | Value | Token |
|---|---|---|
| Section outer padding | `EdgeInsets.symmetric(horizontal: 16)` | `AppSizes.spacing16` |
| Section divider | h=6 `#e8e8ea` | `Container(height: 6)` |
| Row gap (inside info section) | `gap=8` vertical | `Gap(AppSizes.spacing8)` |
| Field row inner gap (icon ↔ label) | `gap=8` horizontal | `Gap(AppSizes.spacing8)` |
| Card inner padding | `p=12` or `p=16` | `EdgeInsets.all(AppSizes.spacing12)` |
| Bottom action bar | `pb=20 pt=16 px=16`, gap=8 buttons | mixed |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| Card border | none (sections rely on bg + divider) | — |
| Card radius | `8px` (info cards trong tab) | `BorderRadius.circular(8)` |
| Button radius | `8px` | `BorderRadius.circular(8)` |
| File card border | 1px solid `#e8e8ea` radius 8 | `Border.all(...)` |
| Tab active underline | 2px solid `#0052ff` | `Border(bottom: BorderSide(...))` |
| Bottom bar shadow | drop shadow `0px -4px 12px rgba(0,0,0,0.06)` | `BoxShadow(...)` |

### Icons

| Name | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20×20 | `#262626` | AppBar back |
| `vuesax/linear/more` | 20×20 | `#262626` | AppBar right 3-dot menu |
| `vuesax/linear/calendar` | 16×16 | `#0052ff` | "Cập nhật:" row |
| `vuesax/linear/note` | 16×16 | `#0052ff` | "Phiếu dịch vụ liên kết:" / "Ghi chú quyết toán:" rows |
| `vuesax/linear/security` | 16×16 | `#0052ff` | "Bảo hiểm chi trả:" row, "Bảo hiểm:" sub row |
| `vuesax/linear/user-tick` | 16×16 | `#0052ff` | "Khách hàng chi trả:" / "Người giám định:" rows |
| `vuesax/linear/buildings` | 16×16 | `#0052ff` | "Công ty bảo hiểm:" row |
| `vuesax/linear/call` | 16×16 | `#0052ff` | "SDT liên hệ bảo hiểm:" row |
| `vuesax/linear/document-text` | 16×16 | `#0052ff` | "Số hợp đồng:" / "Hồ sơ bảo lãnh" row |
| `vuesax/linear/arrow-right` | 20×20 | `#262626` | Collapse card chevron (Thông tin khách hàng / Thông tin xe) |
| `vuesax/linear/arrow-down` | 24×24 | `#262626` | "Chi tiết theo bên thanh toán" collapse arrow |
| `vuesax/linear/edit` | 16×16 | `#273243` | "Chỉnh sửa phiếu" button leading icon |
| `vuesax/linear/add-square` | 24×24 | `#0052ff` | "Tạo hồ sơ bảo hiểm" button leading icon |

### Bounds

| Element | W × H |
|---|---|
| Screen frame | 375 × 1703 (scroll) |
| AppBar | 375 × 52 |
| Header info card | 343 × ~210 |
| Tab bar | 375 × 44-76 (depending on tab count) |
| Section card | 343 × variable |
| Bottom action bar | 375 × 104 (with safe-area) |
| Button (3-stack) | 343 × 36-48 each |

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-grp-list--section/_full.png` | `81:39472` | Section full 4 settlement detail screens (1912×2048 scaled) |

> **Per-screen PNG miss**: do `get_metadata` failed (TOO_LARGE), agent-test-ui dùng `_full.png`
> crop theo column 1-4 cho golden snapshot từng variant. Recommend re-fetch frame IDs riêng nếu
> implementation cần pixel-perfect compare.

---

## Notes for agent-test-ui (consume-side)

1. **REGISTRY DRIFT — CRITICAL**: `81:39472` registry slug `cat-grp-list--section` thuộc FEAT-CAT-GRP-LIST,
   NHƯNG content thực tế là **chi tiết phiếu quyết toán** (settlement). Agent-test-ui khi verify
   FEAT-CAT-GRP-LIST mobile implementation phải SKIP oracle này + fallback UX-FLOW + production
   baseline. Đồng thời flag registry maintainer fix entry.
2. **4 screen variants** thực sự là FEAT-INS-STL-DETAIL coverage matrix. Agent-test-ui dev cho
   INS-STL-DETAIL có thể reuse oracle này (cross-ref `wave03-ins-stl-detail-oracle.md`).
3. **Settlement payer matrix** = (BH-only · KH-only-NoBH · KH-WithBH · KH-EmptyServices) → 4
   widget tree branches.
4. **3-button vs 2-button bottom bar** depends on settlement type + scope context. Verify BR rule.
5. **Token vocab khác file App-Garage-V3** (sibling catalog FEATs). Implementer mobile dùng single
   `AppColors` semantic — token names khớp, hex hex giống — không cần dual mapping.
6. **Visual extraction caveat**: dimensions, padding, gap số chính xác phải verify bằng metadata
   riêng từng frame (currently MCP TOO_LARGE blocks). Agent-test-ui dùng `_full.png` cho golden
   verification với tolerance ±2px.
