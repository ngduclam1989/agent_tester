---
feat: FEAT-CAT-GRP-LIST
feat_file: Product/features/FEAT-CAT-GRP-LIST.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=758-28571&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "758:28571"
screen_slug: kh-alloc-only
maps_cr: CR-20260618-01
fetched_at: 2026-06-29T03:19:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (deep tree with AC labels embedded — Nhóm A header + Nhóm B 4 tabs + AC-9/10/11 sections)
  get_variable_defs: cached (file nAoFS33sTWj3ctWjZMUDEl)
  get_design_context: skipped (metadata already exposes structure + AC mappings; rely on _full.png for visual verification)
  get_screenshot: success (1 PNG: _full single screen 375×1703)
data_completeness:
  screen_inventory: complete (1 screen — variant "Có BH - Khách hàng chi trả")
  component_inventory: complete (metadata structure exposes AC-mapped sections)
  variant_state: complete (single canonical "KH-thanh-toán với phân bổ BH" variant)
  text_content: complete (verbatim từ visual)
  design_tokens: complete (variable_defs)
  interaction_states: partial
screenshots:
  - assets/wave03-cat-grp-list--kh-alloc-only/_full.png
---

# Oracle — FEAT-CAT-GRP-LIST (mobile · kh-alloc-only) · wave 03 (maps CR-20260618-01)

> Design-conformance oracle cho `agent-test-ui`. Node `758:28571` trong file legacy `nAoFS33sTWj3ctWjZMUDEl`.
>
> **⚠️ REGISTRY/SCOPE DRIFT**: registry slug `cat-grp-list--kh-alloc-only` maps `FEAT-CAT-GRP-LIST`,
> NHƯNG content thực tế là **"Chi tiết phiếu quyết toán - Có BH - Khách hàng chi trả"** — màn settlement
> detail với panel "Phân bổ BH" + "Tổng giá dịch vụ" 2-cột BH|KH theo CR-20260618-01 (cũng được
> maps trong registry `maps: [CR-20260618-01]`). Cùng node ID, double-mapped FEAT + CR. Agent-test-ui
> verify implementation theo CR-20260618-01 AC, KHÔNG theo FEAT-CAT-GRP-LIST AC.

---

## Screen Inventory

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Chi tiết phiếu QT — Có BH, KH chi trả (`AC-1..AC-11` sections) | `758:28571` | 375×1703 | `assets/wave03-cat-grp-list--kh-alloc-only/_full.png` |

> Single canonical screen, scrollable 1703px height (1486 body + 96 header + 104 bottom bar +
> 17 indicator).

---

## Component Inventory

> Nguồn: `get_metadata(758:28571)` — metadata exposed AC labels in node names (designer-embedded
> traceability để dev biết section nào maps AC nào trong FEAT-INS-STL-DETAIL spec).

### Header chrome
| Component | Brief | Flutter mapping |
|---|---|---|
| Status bar | h=44 | `MediaQuery.padding.top` |
| AppBar | h=52, "Chi tiết phiếu quyết toán" + back arrow + right more icon | `AppBar` |

### Nhóm A — Header & thông tin chung (`758:28573`, 375×430)
| Component | Brief | Flutter mapping |
|---|---|---|
| Info DV + Phiếu quyết toán card (`758:28574`) | 375×302 — `#PHDV-240923-001` Bold 16 brand-CD + Badge "Chưa thanh toán" Red + sub info rows (Cập nhật, Phiếu liên kết, Khách hàng chi trả, Ghi chú QT) + Total row "Tổng tiền: 55.000.000 VND" / "Còn lại: 55.000.000 VND" | Custom card |
| Spacer divider | h=6 `#e8e8ea` | `Container(height: 6)` |
| **AC-3** Khối "Thông tin khách hàng & xe" (`758:28576`) | Collapse card 375×58 — "Thông tin khách hàng" + chevron right | Collapse `Tile` |
| Spacer divider | h=6 | `Container(height: 6)` |
| Info xe View (`758:28578`) | Collapse card 375×58 — "Thông tin xe" + chevron right | Collapse `Tile` |
| Spacer divider | h=6 | `Container(height: 6)` |

### Nhóm B — 4 tabs nội dung (`758:28580`, 375×998)

| Component | Brief | Flutter mapping |
|---|---|---|
| **AC-4** Tab bar (`758:28582`, 375×76) | Padding p=16, 4 tab: "Bảng chi phí" (active) · **AC-7** "Chứng từ & hóa đơn" · **AC-8** "Hồ sơ bảo hiểm đã xuất" · "Lịch sử thanh toán" | `TabBar` |
| **AC-5** Tab "Bảng chi phí" — bảng hạng mục (`758:28620`, 375×388) | Section header "Dịch vụ thực hiện" + count chip "Số lượng: 0" + section "Phụ tùng sử dụng" + count "Số lượng: 0" + section "Thông tin bảo hiểm" 6 row icon labels + section "Hồ sơ bảo lãnh" + file card | Column |

#### **AC-5** detail sections — Thông tin bảo hiểm (`758:28683`, 343×284)
- "Thông tin bảo hiểm" Subtitle title
- Row 1: shield icon + "Bảo hiểm:" + "Có" (Med 14)
- Row 2: buildings icon + "Công ty bảo hiểm:" + "Bảo hiểm Bảo Việt - BVS"
- Row 3: note icon + "Số hợp đồng:" + "1923HD38223"
- Row 4: calendar icon + "Ngày hết hạn:" + "19/05/2034"
- Row 5: call icon + "SDT liên hệ bảo hiểm:" + "0912838091"
- Row 6: user-tick icon + "Người giám định:" + "Trương Diệu Ly"
- "Hồ sơ bảo lãnh" label + Upload/item file card 343×50 "Filename.format 1.3MB"

### **AC-9** Bảng "Chi tiết theo bên thanh toán" (`758:28764`, 375×534)
| Component | Brief |
|---|---|
| Spacer divider 6 | `Container(height: 6)` |
| **AC-10** Bảng "Phân bổ Bảo hiểm" (`758:28766`, 375×160) | Section section title + 3 rows: "Giảm trừ bồi thường +50.000đ" · "Khấu hao vật tư / thay mới +45.000.000đ" · "Khấu trừ BH +5.000.000đ" |
| Spacer divider 6 | `Container(height: 6)` |
| **AC-6** Panel "Tổng giá dịch vụ" (`758:28768`, 375×362) | Section title "Tổng giá dịch vụ" + collapse chevron arrow-down 24px right |
| **AC-9** "Chi tiết theo bên thanh toán" (`758:28769`, 375×362) | Title "Khách hàng thanh toán" Body B5 + table rows: "Dịch vụ 0đ" / "Phụ tùng 0đ" / "VAT 0đ" / "Cộng sau VAT 0đ" |
| **AC-11** "Cân thanh toán" (`758:28803`, 343×48) | Title "Cân thanh toán" + row "Khách hàng thanh toán 50.050.000đ" |
| Total row (`758:28813`, 343×44) | "Tổng thanh toán" + value "50.050.000đ" Blue Bold |

### **AC-10** Quyền & nghiệp vụ chỉnh sửa (`758:28850`, 375×52)
| Component | Brief |
|---|---|
| Button "Chỉnh sửa phiếu" (`758:28851`) | secondary edit-icon, h=36 w=343 |

### Bottom — Action bar (`758:28855`, 375×104)
- Button "Thanh toán" primary `#0052ff` text white Bold 16

---

## Variant & State

> Đây là **single canonical state** "KH thanh toán toàn bộ + có BH allocation". CR-20260618-01
> reshape "Tổng giá dịch vụ" panel sang KH-only column. Khác với section `81:39472` col 1 (BH-only).

### Tab bar
- 4 tab — "Bảng chi phí" active. Underline 2px `#0052ff`.

### Badge "Chưa thanh toán"
- bg `#fff0f0` text `#ed1f42` B7 Medium 12.

### "Chỉnh sửa phiếu" button (small h=36)
- Variant secondary edit-icon. bg `#f3f3f4` text `#273243` Bold 14 (smaller hơn bottom bar 16 Bold).

### "Thanh toán" button (bottom bar)
- Variant primary bg `#0052ff` text white Bold 16, h=48.

### AC-mapped sections (designer-embedded traceability)
- Section names trong metadata bao gồm `**AC-3**`, `**AC-4**`, `**AC-5**`, `**AC-6**`, `**AC-7**`,
  `**AC-8**`, `**AC-9**`, `**AC-10**`, `**AC-11**` — Designer designed Figma frame to maps 1-1 với
  FEAT-INS-STL-DETAIL / FEAT-INS-SO-ADJUSTMENT AC. Agent-test-ui verify từng section khớp AC tương
  ứng (cross-check FEAT spec).

---

## Text Content (verbatim từ visual + metadata)

### AppBar
- Title: **"Chi tiết phiếu quyết toán"**

### Header card
- Code: **"#PHDV-240923-001"** (Bold 16 `#0052ff`)
- Badge: **"Chưa thanh toán"**
- Sub rows: **"Cập nhật: 19/05/2034 12:20"** · **"Phiếu dịch vụ liên kết: #1234567"** · **"Khách hàng chi trả: Nguyễn Bình Minh"** · **"Ghi chú quyết toán:"** + body "Chờ bảo hiểm duyệt giá lọc dầu"
- Total: **"Tổng tiền:"** value **"55.000.000 VND"** + **"Còn lại:"** value **"55.000.000 VND"** (Bold Red)

### Collapse cards
- **"Thông tin khách hàng"** + chevron right
- **"Thông tin xe"** + chevron right

### Tab bar
- **"Bảng chi phí"** (active) · **"Chứng từ & hóa đơn"** · **"Hồ sơ bảo hiểm"** · (potential 4th)

### Bảng chi phí content
- **"Dịch vụ thực hiện"** · **"Số lượng: 0"**
- **"Phụ tùng sử dụng"** · **"Số lượng: 0"**
- **"Thông tin bảo hiểm"**
  - **"Bảo hiểm:"** + **"Có"**
  - **"Công ty bảo hiểm:"** + **"Bảo hiểm Bảo Việt - BVS"**
  - **"Số hợp đồng:"** + **"1923HD38223"**
  - **"Ngày hết hạn:"** + **"19/05/2034"**
  - **"SDT liên hệ bảo hiểm:"** + **"0912838091"**
  - **"Người giám định:"** + **"Trương Diệu Ly"**
- **"Hồ sơ bảo lãnh"** + file: **"Filename.format"** + size **"1.3MB"**

### Phân bổ bảo hiểm
- Title: **"Phân bổ bảo hiểm"**
- Row: **"Giảm trừ bồi thường"** + value **"+50.000đ"**
- Row: **"Khấu hao vật tư / thay mới"** + value **"+45.000.000đ"**
- Row: **"Khấu trừ BH"** + value **"+5.000.000đ"**

### Tổng giá dịch vụ
- Section title: **"Tổng giá dịch vụ"** (Bold 18 with collapse arrow-down 24px)
- Sub: **"Chi tiết theo bên thanh toán"**
- Sub-section: **"Khách hàng thanh toán"** (Body B5)
  - **"Dịch vụ"** + **"0đ"**
  - **"Phụ tùng"** + **"0đ"**
  - **"VAT"** + **"0đ"**
  - **"Cộng sau VAT"** + **"0đ"**
- **"Cần thanh toán"**
  - **"Khách hàng thanh toán"** + **"50.050.000đ"**
- **"Tổng thanh toán"** + **"50.050.000đ"** (Bold Blue)

### Bottom buttons
- **"Chỉnh sửa phiếu"** (secondary edit-icon h=36)
- **"Thanh toán"** (primary h=48)

---

## Design Tokens

> **Cached from `get_variable_defs(319:65571)`** (file nAoFS33sTWj3ctWjZMUDEl).

### Colors

| Hex | Role | Token |
|---|---|---|
| `#ffffff` | bg | `AppColors.bgBase` |
| `#262626` | Title, value text | `AppColors.textPrimary` |
| `#273243` | "Chỉnh sửa phiếu" button text | `AppColors.textPrimary` (alias) |
| `#0052ff` | Code, tab active, Total Blue, "Thanh toán" bg | `AppColors.textActivePrimary` / `bgActive` |
| `#888c94` | Label text | `AppColors.textTertiary` |
| `#595e69` | Secondary label | `AppColors.textSecondary` |
| `#15aa2c` | Success | `AppColors.textSuccessPrimary` |
| `#f0fdf1` | Success bg | `AppColors.bgBadgeSuccess` |
| `#ed1f42` | "Chưa thanh toán" text, "Còn lại" Red value | `AppColors.textErrorPrimary` |
| `#fff0f0` | "Chưa thanh toán" bg | `RedColor.s50` |
| `#e8e8ea` | Divider, border | `AppColors.borderPrimary` / `bgPrimary` |
| `#f3f3f4` | Secondary bg, button "Chỉnh sửa phiếu" bg | `AppColors.bgSecondary` |
| `#000000` | Home indicator | `BaseColor.black` |

### Typography

| Style | Used at | Token |
|---|---|---|
| `Heading/H3` Bold 18/26 | Section titles (Tổng giá dịch vụ, Phân bổ bảo hiểm, Cân thanh toán) | `AppTextStyle.textHeadingH3` |
| `Heading/H4` Bold 16/24 | Code `#PHDV-...`, "Thanh toán" button text, "Tổng thanh toán" value | `AppTextStyle.textHeadingH4` |
| `Heading/H5` Bold 14/20 | Sub-headers | `AppTextStyle.textHeadingH5` |
| `Subtitle/S4` SB 16/24 | AppBar title, "Thông tin khách hàng" / "Thông tin xe" collapse title, "Thông tin bảo hiểm" header | `AppTextStyle.textSubtitleS4` |
| `Subtitle/S5` SB 14/20 | "Dịch vụ thực hiện" / "Phụ tùng sử dụng" / "Khách hàng thanh toán" labels | `AppTextStyle.textSubtitleS5` |
| `Body/B5` Med 14/20 | Row values "Có" / "Bảo hiểm Bảo Việt - BVS" / "1923HD38223" / "19/05/2034", "Chỉnh sửa phiếu" button text (h=36 smaller) | `AppTextStyle.textBodyB5` |
| `Body/B7` Med 12/18 | "Chưa thanh toán" badge, count chip "Số lượng: 0" | `AppTextStyle.textBodyB7` |
| `Caption/C5` Reg 14/20 | Row label "Bảo hiểm:" / "Công ty bảo hiểm:" / "Số hợp đồng:" etc | `AppTextStyle.textCaptionC5` |
| `Caption/C7` Reg 12/18 | Sub info text "Cập nhật: 19/05/2034 12:20", file size "1.3MB" | `AppTextStyle.textCaptionC7` |

### Spacing

| Element | Value | Token |
|---|---|---|
| Section padding ngoài | `EdgeInsets.symmetric(horizontal: 16)` | `AppSizes.spacing16` |
| Section divider (between Nhóm) | h=6 `#e8e8ea` | `Container(height: 6)` |
| Row gap (info section, FieldsList) | `gap=8` vertical | `Gap(AppSizes.spacing8)` |
| Field row inner gap (icon ↔ label) | `gap=8` horizontal | `Gap(AppSizes.spacing8)` |
| Card inner padding | `p=12` or `p=16` | `EdgeInsets.all(AppSizes.spacing12)` |
| Tab bar inner | `px=16 py=16` | `EdgeInsets.symmetric(horizontal: 16, vertical: 16)` |
| Bottom action bar | `pb=20 pt=16 px=16`, gap=8 | mixed |

### Border / Radius / Shadow

| Element | Value | Token |
|---|---|---|
| Card radius | `8px` | `BorderRadius.circular(8)` |
| File card border | 1px solid `#e8e8ea` radius 8 | `Border.all(...)` |
| Button radius | `8px` | `BorderRadius.circular(8)` |
| Tab active underline | 2px solid `#0052ff` | `Border(bottom: BorderSide(...))` |
| Bottom bar shadow | `0px -4px 12px rgba(0,0,0,0.06)` | `BoxShadow(...)` |
| Drop shadow effect (`drop 0`) | `0px 4px 8px rgba(0,0,0,0.06)` | `BoxShadow(...)` |

### Icons

| Name | Size | Color | Usage |
|---|---|---|---|
| `vuesax/linear/arrow-left` | 20 | `#262626` | AppBar back |
| `vuesax/linear/more` | 20 | `#262626` | AppBar right 3-dot |
| `vuesax/linear/security` | 16 | `#0052ff` | "Bảo hiểm:" row |
| `vuesax/linear/buildings` | 16 | `#0052ff` | "Công ty bảo hiểm:" row |
| `vuesax/linear/note` | 16 | `#0052ff` | "Số hợp đồng:" row |
| `vuesax/linear/calendar` | 16 | `#0052ff` | "Ngày hết hạn:" row |
| `vuesax/linear/call` | 16 | `#0052ff` | "SDT liên hệ bảo hiểm:" row |
| `vuesax/linear/user-tick` | 16 | `#0052ff` | "Người giám định:" row |
| `vuesax/linear/arrow-down` | 24 | `#262626` | "Tổng giá dịch vụ" collapse chevron |
| `vuesax/linear/arrow-right` | 20 | `#262626` | "Thông tin khách hàng" / "Thông tin xe" collapse chevron |
| `vuesax/linear/edit` | 16 | `#273243` | "Chỉnh sửa phiếu" button leading |

### Bounds

| Element | W × H |
|---|---|
| Screen frame | 375 × 1703 (scroll) |
| AppBar | 375 × 96 (status + nav) |
| Header card "Info DV + Phiếu QT" | 375 × 302 |
| Collapse card | 375 × 58 |
| Tab bar container | 375 × 76 |
| AC-5 "Bảng chi phí" tab content | 375 × 388 |
| "Thông tin bảo hiểm" section | 343 × 284 |
| "Phân bổ Bảo hiểm" section | 375 × 160 |
| "Tổng giá dịch vụ" panel | 375 × 362 |
| "Cân thanh toán" row | 343 × 48 |
| "Tổng thanh toán" final row | 343 × 44 |
| "Chỉnh sửa phiếu" button row | 375 × 52 |
| Bottom action bar | 375 × 104 |

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-grp-list--kh-alloc-only/_full.png` | `758:28571` | Full screen scroll capture (375×1703) — golden reference cho toàn screen |

---

## Notes for agent-test-ui

1. **REGISTRY DRIFT**: như `wave03-cat-grp-list--section-oracle.md` — node thuộc settlement detail
   scope, không phải catalog group list. Agent-test-ui verify FEAT-CAT-GRP-LIST mobile bằng
   UX-FLOW + production baseline; verify CR-20260618-01 bằng oracle này.
2. **AC-labeled sections** trong metadata = designer-embedded traceability cho FEAT-INS-STL-DETAIL +
   CR-20260618-01. Section name `**AC-X**` (`<frame name="**AC-3**: Khối ...">`) map 1-1 với AC
   trong FEAT spec — agent-test-ui dùng để verify từng AC implementation.
3. **CR-20260618-01 scope (Khách hàng thanh toán column only)**: panel "Tổng giá dịch vụ" trong
   screen này chỉ render "Khách hàng thanh toán" sub-column (vì payer = KH). Compare với section
   `81:39472` col 1 (Bảo hiểm thanh toán only) hoặc col 3 (cả 2 column KH+BH). Implementer mobile
   conditional render dựa `settlement.payerType + insurance.exists`.
4. **Số lượng 0** trong screen này = scenario empty SO services/parts. Verify edge case rendering
   (không hide section, vẫn show count chip "Số lượng: 0").
5. **"Tổng thanh toán" Bold Blue** = total final amount `#0052ff`. Visual prominence highest trong
   panel.
6. **"Còn lại: 55.000.000 VND" Red Bold** in header — đại diện outstanding amount chưa thanh toán
   (= total chưa trừ partial payment). Compute logic verify với BR-INS-STL.
7. **"Chỉnh sửa phiếu" h=36 nhỏ hơn "Thanh toán" h=48** — visual hierarchy: payment is primary
   action, edit is secondary.
