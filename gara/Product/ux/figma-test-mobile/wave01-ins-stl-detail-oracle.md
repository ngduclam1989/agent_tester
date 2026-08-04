---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "81:39472"
fetched_at: 2026-06-04T11:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (confirmed inline by orchestrator)
  get_variable_defs: success
  get_design_context: success
  get_screenshot: success
screenshots:
  - assets/wave01-ins-stl-detail/_full.png
  - assets/wave01-ins-stl-detail/410-28748.png
  - assets/wave01-ins-stl-detail/407-19398.png
  - assets/wave01-ins-stl-detail/407-19436.png
  - assets/wave01-ins-stl-detail/407-19519.png
  - assets/wave01-ins-stl-detail/407-17222.png
coverage_gaps:
  - "AC-1: action bar mobile chỉ có 'Tạo hồ sơ bảo hiểm' + 'Thanh toán' — KHÔNG có 'Chỉnh sửa' / 'In toàn bộ hồ sơ' / nút primary '+ Tạo hồ sơ bảo hiểm' như FEAT mô tả. Có thêm nút 'Chỉnh sửa phiếu' (secondary) trong body. Mobile mock lệch FEAT — verify implementation theo FEAT AC + flag design drift."
  - "AC-1: tiêu đề màn = AppBar 'Chi tiết phiếu quyết toán' + mã hiển thị '#PHDV-240923-001' (placeholder data, không phải '#SET-...'). FEAT mô tả tiêu đề là mã phiếu QT BH."
  - "AC-2: header mobile hiển thị field rút gọn (Cập nhật / Phiếu dịch vụ liên kết / Bảo hiểm chi trả / Ghi chú quyết toán / Tổng tiền / Còn lại) — KHÔNG đủ field FEAT AC-2 (Người tạo, Ngày tạo, Bên thanh toán='Bảo hiểm', Cập nhật lần cuối). Verify theo FEAT."
  - "AC-3: khối 'Thông tin khách hàng' + 'Thông tin xe' ở trạng thái Collapse (accordion thu gọn) — nội dung chi tiết (Tên KH/SĐT/Loại KH/Hãng xe/Biển số/Số km) bị ẩn trong mock, không bóc được field. Verify field list theo FEAT AC-3."
  - "AC-5: bảng chi phí KHÔNG hiển thị các cột FEAT yêu cầu (Bên thanh toán / Chiết khấu / Thuế / phân trang). Mobile render card-row gọn (tên + người thực hiện + SL + đơn giá). Không thấy phân trang trong mock."
  - "AC-6/AC-9: panel 'Tổng giá dịch vụ' dùng segmented toggle 'KH thanh toán' / 'BH thanh toán' (chọn 1 bên) thay vì bảng side-by-side cột BH | KH như FEAT mô tả. Bảng 'Chi tiết theo bên thanh toán' chỉ 1 cột giá trị theo bên đang chọn."
  - "AC-7/AC-8/AC-9 (tab Chứng từ & hoá đơn / Hồ sơ BH đã xuất / Lịch sử thanh toán): chỉ tab 'Bảng chi phí' (active) có nội dung render trong mock; nội dung 3 tab còn lại không hiển thị ở screen state này — frames 407:19404 & 407:19576 hidden (collapsed). Không bóc được nội dung tab inactive."
  - "AC-11 (FEAT): nhãn khối cân thanh toán trong design = 'Cần thanh toán' (mock) ≠ 'Cân thanh toán' (FEAT). Verify wording chính xác với BA."
---

# Oracle — FEAT-INS-STL-DETAIL · Chi tiết phiếu quyết toán bảo hiểm (mobile)

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter). 5-cấp: Screen Inventory ·
> Component Inventory · Variant & State · Text Content · Design Tokens. Mọi giá trị tiền/tên/mã là
> **placeholder data** trong mock Figma — verify cấu trúc/wording cố định, KHÔNG verify giá trị data động.
>
> **DRIFT WARNING**: mock mobile lệch FEAT ở action bar, header field set, layout panel "Tổng giá dịch vụ"
> (toggle thay cột), trạng thái collapse 2 khối info, cột bảng chi phí. Xem `coverage_gaps` frontmatter.
> agent-test-ui verify theo **FEAT AC là nguồn chốt** cho các điểm lệch; oracle ghi sự thật Figma để đối chiếu.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Chi tiết phiếu quyết toán (toàn screen, tab "Bảng chi phí" active) | `407:17089` (frame) / `81:39472` (section) | 375×1856 (section 715×2465) | assets/wave01-ins-stl-detail/_full.png |
| Nhóm A — Header & thông tin chung | `410:28748` | 375×430 | assets/wave01-ins-stl-detail/410-28748.png |
| Nhóm B — tab bar 4 tab (AC-4) | `407:19398` | 375×76 | assets/wave01-ins-stl-detail/407-19398.png |
| Nhóm B — tab "Bảng chi phí" bảng hạng mục (AC-5) | `407:19436` | 375×393 | assets/wave01-ins-stl-detail/407-19436.png |
| Nhóm B — Phân bổ BH + Tổng giá dịch vụ + Cân TT (AC-9/10/6/11) | `407:19519` | 375×638 | assets/wave01-ins-stl-detail/407-19519.png |
| Action bar (bottom) | `407:17222` | 375×176 | assets/wave01-ins-stl-detail/407-17222.png |

- Single-screen (phone 375 wide). Body cuộn dọc. Tab "Bảng chi phí" là trạng thái mặc định trong mock.
- Hidden frames (collapsed accordion): `407:19404`, `407:19576` — nội dung tab khác không hiển thị (M3: không fabricate).

---

## Component Inventory

### Screen: Chi tiết phiếu quyết toán (`407:17089`)
- AppBar (CustomAppBar) × 1 — back icon + title "Chi tiết phiếu quyết toán" + overflow menu (3-dot).
- Status bar (iOS mock) × 1 — "9:41" + signal/wifi/battery.
- Mã phiếu heading × 1 — "#PHDV-240923-001" (active-primary blue).
- Badge × 1 — "Đã thanh toán" (success green pill).
- Info row (icon + label + value) × ~5 — Cập nhật / Phiếu dịch vụ liên kết / Bảo hiểm chi trả / Ghi chú quyết toán; + 2-col row Tổng tiền / Còn lại.
- Divider (Line204) × 3 (header block) + 6px spacer bars (`#e8e8ea`) giữa các section-container.
- Accordion header (Collapse) × 2 — "Thông tin khách hàng" / "Thông tin xe" (mỗi cái có trailing arrow-right icon).
- Tabs (4-tab bar, `_Partials/Tabs 1`) × 1 — 4 mục, 1 active có underline.
- Section header (title + count) × 2 — "Dịch vụ thực hiện" / "Phụ tùng sử dụng" (mỗi cái "Số lượng: NN").
- Line-item card (Card row, h64, radius12, shadow s2) × 4 — 2 dịch vụ + 2 phụ tùng; mỗi card có trailing arrow-right.
- Section "Phân bổ bảo hiểm" × 1 — title + nút "Sửa" (text button + edit-2 icon) + 5 key-value rows.
- Panel "Tổng giá dịch vụ" × 1 — gồm: segmented toggle (Tabbar 2 slot) + bảng "Khoản mục" (4 row) + divider + "Cần thanh toán" (1 row) + ô "Tổng thanh toán" (highlight `#f3f3f4`).
- Segmented toggle (Tabbar, gray100 track) × 1 — 2 slot: "KH thanh toán" (active, white pill) / "BH thanh toán" (inactive).
- Action bar (bottom, rounded-top, top-shadow) × 1 — chứa 2 button full-width + Home Indicator bar.
- AppButton × 3 — "Tạo hồ sơ bảo hiểm" (tertiary `#edf7ff`), "Thanh toán" (primary `#0052ff`), "Chỉnh sửa phiếu" (secondary outline, trong body trên action bar).

> Mobile widget catalog mapping (expected): AppBar→`CustomAppBar`; Badge→catalog `Badge`; Tabs→catalog tab widget hoặc `TabBar`; segmented→`SegmentedButton`/catalog Tabbar; line-item→`Container`+`Column`/`Row`; button→`AppButton.text`/`.textIcon`.

---

## Variant & State

### AppBar (`407:17219` group)
- variants: title + back + trailing overflow (3-dot menu).
- states observed: default.

### Badge "Đã thanh toán" (`I407:17091;16810:71025`)
- variant: Success (bg `#f0fdf1` + text `#15aa2c`).
- Note: data động — trạng thái phiếu (Đã thanh toán/…); mock = success.

### Accordion "Thông tin khách hàng" / "Thông tin xe" (`25:40144` / `407:16868`)
- variants: `property1 = "Collapse"` (thu gọn — chỉ title + arrow-right trailing).
- states observed: collapsed. **Expanded state KHÔNG có trong mock** → AC-3 field set không bóc được (coverage_gap).

### Tabs — 4 tab (`407:19399`)
- variants: tab active (underline 2px `#0052ff`, text medium `#0052ff`) vs inactive (text regular `#262626`, no underline).
- states observed: "Bảng chi phí" = active; "Chứng từ & hóa đơn" / "Hồ sơ bảo hiểm đã xuất" / "Lịch sử thanh toán" = inactive.

### Segmented toggle "KH thanh toán" / "BH thanh toán" (`407:19536`)
- variants: slot active (white pill `#ffffff`, radius 6, text `#0052ff`) vs inactive (transparent, text `#595e69`).
- states observed: "KH thanh toán" = active; "BH thanh toán" = inactive.
- Note: track bg = gray100 `#f3f4f6`, padding 4.

### Line-item card (`407:19444` …)
- variant: row gọn (tên + meta line + trailing arrow-right) — h64, radius12, drop-shadow s2.
- states observed: default (read-only, tap→detail implied bởi arrow-right).

### AppButton — action bar (`407:17222`)
- "Tạo hồ sơ bảo hiểm": tertiary — bg `#edf7ff`, text bold `#0052ff`, leading add-square icon.
- "Thanh toán": primary — bg `#0052ff`, text bold white.
- "Chỉnh sửa phiếu" (body, trên action bar): secondary outline — leading edit icon, text trung tính.
- states observed: default (mọi nút). Hover/pressed/disabled không có variant trong mock.

### Nút "Sửa" — Phân bổ bảo hiểm (`I407:19520;16514:316149`)
- variant: text button + edit-2 icon, text semibold `#0052ff`, bg white, radius 8, padding 12×8.
- states observed: default.

---

## Text Content
> Verbatim tiếng Việt (nguồn cho cấp 4 wording verify). Giá trị tiền/tên/mã = placeholder — verify wording cố định, không verify số liệu. Nhãn FEAT-named (M4 fallback) ghi chú khi mock thiếu.

### Screen header / AppBar (`410:28748`, `407:17219`)
- "Chi tiết phiếu quyết toán"  (AppBar title)
- "#PHDV-240923-001"  (mã phiếu — placeholder; FEAT: mã QT BH "#SET-...")
- "Đã thanh toán"  (badge trạng thái — data động)
- "Cập nhật:"  · "19/05/2034 12:20" (placeholder)
- "Phiếu dịch vụ liên kết:"  · "#1234567" (placeholder)
- "Bảo hiểm chi trả:"  · "Bảo hiểm BIDV" (placeholder)
- "Ghi chú quyết toán:"  · "Chờ bảo hiểm duyệt giá lọc dầu" (placeholder)
- "Tổng tiền:"  · "55.000.000 VND" (placeholder)
- "Còn lại:"  · "55.000.000 VND" (placeholder, đỏ)
- "Thông tin khách hàng"  (accordion — collapsed)
- "Thông tin xe"  (accordion — collapsed)
- FEAT AC-2 fields (M4 — không hiển thị trong mock, verify theo FEAT): "Người tạo", "Ngày tạo", "Bên thanh toán" = "Bảo hiểm", "Cập nhật lần cuối".
- FEAT AC-3 fields (M4 — collapsed, verify theo FEAT): "Tên khách hàng", "Số điện thoại", "Loại khách hàng", "Hãng xe", "Biển số xe", "Số km đã chạy".

### Tab bar (`407:19398`)
- "Bảng chi phí"  (active)
- "Chứng từ & hóa đơn"  (mock dùng "hóa đơn"; FEAT AC-4 viết "hoá đơn" — verify wording với BA)
- "Hồ sơ bảo hiểm đã xuất"
- "Lịch sử thanh toán"

### Tab "Bảng chi phí" — bảng hạng mục (`407:19436`)
- "Dịch vụ thực hiện"  · "Số lượng:" · "02" (placeholder count)
- "1-" · "Sửa chữa má phanh" · "Tống Hoàng Giang" · "x2" · "140.000đ"  (placeholder line-item)
- "2-" · "Bảo dưỡng định kỳ" · "Tống Hoàng Giang" · "x1" · "140.000đ"
- "Phụ tùng sử dụng"  · "Số lượng:" · "02"
- "1-" · "Má phanh" · "Chính hãng" · "x2" · "140.000đ"
- "2-" · "Gương" · "Chính hãng" · "x2" · "140.000đ"
- FEAT AC-5 cột (M4 — không có trong card-row mock): "STT", "Tên dịch vụ/phụ tùng", "Bên thanh toán", "Người thực hiện", "Đơn giá", "Số lượng", "Chiết khấu", "Thuế" + phân trang — verify theo FEAT.

### Phân bổ bảo hiểm (`407:19520`)
- "Phân bổ bảo hiểm"  (title)  — FEAT AC-10 dùng "Phân bổ Bảo hiểm"
- "Sửa"  (nút text)
- "CK liên kết BH — Vật tư"  · "540.000đ"
- "CK liên kết BH — Công dịch vụ"  · "50.000đ"
- "Giảm trừ bồi thường"  · "50.000đ"
- "Khấu hao vật tư / thay mới"  · "45.000.000đ"
- "Khấu trừ BH"  · "5.000.000đ"

### Panel "Tổng giá dịch vụ" (`407:19522`)
- "Tổng giá dịch vụ"  (title)
- "Chi tiết theo bên thanh toán"  (subtitle)
- "KH thanh toán"  (toggle, active)  · "BH thanh toán"  (toggle, inactive)
- "Khoản mục"  (bảng header)
- "Dịch vụ"  · "540.000đ"
- "Phụ tùng"  · "50.000đ"
- "VAT"  · "50.000đ"
- "Cộng sau VAT"  · "50.000đ"
- "Cần thanh toán"  (FEAT AC-11 dùng "Cân thanh toán" — verify wording)
- "Khách hàng thanh toán"  · "15.000.000đ"
- "Tổng thanh toán"  · "38.440.000đ"  (highlight blue)
- FEAT AC-6 (M4 — mock dùng toggle 1 bên, FEAT mô tả cột BH | KH): "BH thanh toán" (ô xanh), "Khách hàng thanh toán" (ô cam), "Tổng thanh toán" (ô đen) — verify theo FEAT.

### Action bar (`407:17222`) + nút body
- "Chỉnh sửa phiếu"  (button body, trên action bar)
- "Tạo hồ sơ bảo hiểm"  (FEAT AC-1/AC-13: "+ Tạo hồ sơ bảo hiểm")
- "Thanh toán"  (button primary — KHÔNG khớp FEAT; FEAT AC-1 mô tả "Chỉnh sửa" / "In toàn bộ hồ sơ" / "+ Tạo hồ sơ bảo hiểm")
- FEAT AC-1/AC-12 (M4 — không có trong mock action bar): "Chỉnh sửa", "In toàn bộ hồ sơ" — verify theo FEAT.

---

## Design Tokens
> Hex + expected `AppColors.*`; typography size/weight/lineHeight + expected `AppTextStyle.*`; spacing/radius/shadow.
> Token nguồn `get_variable_defs` (Inter font, lineHeight px). Expected token tra `_ref-mobile-transform-figma.md §1.5`.

### Global / palette (toàn screen)
- Color `#262626` (text chính / cd-garage) → expected `AppColors.textPrimary`
- Color `#595e69` (text secondary) → expected `AppColors.textSecondary`
- Color `#888c94` (text tertiary — label) → expected `AppColors.textTertiary`
- Color `#0052ff` (active primary / link / button primary) → expected `AppColors.textActivePrimary` / `AppColors.buttonBackgroundPrimary` / `PrimaryColor.s700`
- Color `#15aa2c` (success text) → expected `AppColors.textSuccessPrimary`
- Color `#ed1f42` (error text — "Còn lại") → expected `AppColors.textErrorPrimary`
- Color `#ffffff` (bg base) → expected `AppColors.bgBase`
- Color `#f0fdf1` (badge success bg) → expected `AppColors.bgBadgeSuccess`
- Color `#e8e8ea` (border / 6px spacer bar / bg-primary) → expected `AppColors.borderPrimary` / `AppColors.bgPrimary`
- Color `#f3f3f4` (bg secondary — ô "Tổng thanh toán") → expected `AppColors.bgSecondary`
- Color `#f3f4f6` (gray100 — track segmented) → expected gray100 (no exact semantic; `NeutralColor.s100`/`Color(0xFFf3f4f6)` + log)
- Color `#edf7ff` (button tertiary bg — "Tạo hồ sơ bảo hiểm") → expected `AppColors.buttonBackgroundTertiary` / `PrimaryColor.s50`
- Typography tokens:
  - 18px / w700 / lh26 (Heading/H3 — mã phiếu, "Phân bổ bảo hiểm", "Tổng giá dịch vụ", accordion title) → expected `AppTextStyle.textHeadingH3`
  - 16px / w700 / lh24 (Heading/H4 — button action bar text) → expected `AppTextStyle.textHeadingH4`
  - 16px / w600 / lh24 (Subtitle/S4 — "Dịch vụ thực hiện" / "Phụ tùng sử dụng") → expected `AppTextStyle.textSubtitleS4`
  - 14px / w700 / lh20 (Heading/H5) → expected `AppTextStyle.textHeadingH5`
  - 14px / w600 / lh20 (Subtitle/S5 — "Chi tiết theo bên thanh toán", "Khoản mục", "Cần thanh toán", "Tổng thanh toán", "Sửa") → expected `AppTextStyle.textSubtitleS5`
  - 14px / w500 / lh20 (Body/B5 — value rows, toggle label, "Số lượng") → expected `AppTextStyle.textBodyB5`
  - 14px / w400 / lh20 (Caption/C5 — info label/value header block) → expected `AppTextStyle.textCaptionC5`
  - 13px / w600 / lh18 (Subtitle/S6 — line-item card tên hạng mục "1- Sửa chữa má phanh") → expected `AppTextStyle.textSubtitleS6`
  - 12px / w500 / lh18 (Body/B7 — đơn giá meta line) → expected `AppTextStyle.textBodyB7`
  - 12px / w400 / lh18 (Caption/C7 — meta line "Tống Hoàng Giang", key-value rows phân bổ/khoản mục) → expected `AppTextStyle.textCaptionC7`
  - 12px / w500 / lh18 (Badge "Đã thanh toán") → expected `AppTextStyle.textBodyB7`
- Spacing tokens (Spacing-Border): 0, 4, 8, 12, 16, 24 → expected `AppSizes.zeroSize / spacing4 / spacing8 / (12 literal) / spacing16 / (24 literal)`
- Radius: 6 (segmented pill — border-radius/md), 8 (badge / button / card phân bổ / ô tổng), 12 (line-item card) → expected `BorderRadius.circular(6/8/12)`
- Shadow s2 (line-item card): DROP_SHADOW `#9C9C9C` opacity stack, offset (0,1), radius 20 → expected `AppShadows.boxShadow` (verify với owner; 3-layer soft shadow)

### Nhóm A — Header (`410:28748`, 375×430)
- Container bg `#ffffff` (bg-base) → `AppColors.bgBase`; padding 16 (EdgeInsets.all(16)) → `AppSizes.spacing16`; gap 16 giữa block, gap 8 trong sub-list.
- Mã phiếu "#PHDV-240923-001": 18px/w700/lh26 color `#0052ff` → `AppTextStyle.textHeadingH3` + `AppColors.textActivePrimary`.
- Badge "Đã thanh toán": bg `#f0fdf1` → `AppColors.bgBadgeSuccess`; text 12px/w500/lh18 `#15aa2c` → `AppColors.textSuccessPrimary`; padding 8×4 (px8 py4); radius 8.
- Info label (Cập nhật/Phiếu DV liên kết/Bảo hiểm chi trả/Ghi chú QT/Tổng tiền/Còn lại): 14px/w400 `#888c94` → `AppColors.textTertiary`; gap icon-text 8.
- Info value: 14px/w400 `#262626` → `AppColors.textPrimary` (Tổng tiền value 14px/w700 `#0052ff`; Còn lại value 14px/w700 `#ed1f42`).
- Icon info: vuesax/linear calendar / document-text / security — size 16 (color tertiary-ish; verify).
- Divider (Line204): h0 border-top 1px → `AppColors.borderPrimary` `#e8e8ea`.
- 6px spacer bar giữa section: bg `#e8e8ea` → `AppColors.bgPrimary`.
- Accordion "Thông tin khách hàng" / "Thông tin xe": title 18px/w700/lh26 `#262626` → `AppTextStyle.textHeadingH3`; trailing arrow-right icon size 20; padding 16.

### Tab bar (`407:19398`, 375×76)
- Container bg `#ffffff`; padding 16; gap 16. Tab strip gap 12 (Spacing-Border/12).
- Tab active "Bảng chi phí": text 14px/w500/lh20 `#0052ff` → `AppTextStyle.textBodyB5` + `AppColors.textActivePrimary`; underline border-bottom 2px solid `#0052ff`; padding 4×12 (px4 py12).
- Tab inactive: text 14px/w400/lh20 `#262626` → `AppColors.textPrimary`; no underline; padding 4×12.

### Tab "Bảng chi phí" — bảng hạng mục (`407:19436`, 375×393)
- Container padding 16×12 (px16 py12); gap 16 giữa nhóm dịch vụ/phụ tùng; gap 12 trong nhóm; gap 8 giữa card.
- Section header title "Dịch vụ thực hiện"/"Phụ tùng sử dụng": 16px/w600/lh24 `#262626` → `AppTextStyle.textSubtitleS4`.
- "Số lượng:" + count: 14px/w500/lh20 `#595e69` → `AppTextStyle.textBodyB5` + `AppColors.textSecondary`.
- Line-item card: bg `#ffffff` → `AppColors.bgBase`; h64; radius 12 → `BorderRadius.circular(12)`; shadow s2 → `AppShadows.boxShadow`; padding 16×12; gap 16.
  - Tên hạng mục ("1- Sửa chữa má phanh"): 13px/w600/lh18 `#262626` → `AppTextStyle.textSubtitleS6`; gap "1-" và tên = 4.
  - Meta line (Tống Hoàng Giang • x2 • 140.000đ): 12px/w400/lh18 `#888c94` → `AppTextStyle.textCaptionC7` + `AppColors.textTertiary`; "140.000đ" 12px/w500 (B7). Dot separator Ellipse4 size 4. gap 4.
  - Trailing arrow-right icon size 20.

### Phân bổ bảo hiểm + Tổng giá dịch vụ (`407:19519`, 375×638)
- Section "Phân bổ bảo hiểm" container bg `#ffffff`; padding 16; gap 16.
  - Title 18px/w700/lh26 `#262626` → `textHeadingH3`.
  - Nút "Sửa": bg `#ffffff`; padding 12×8; radius 8; text 14px/w600/lh20 `#0052ff` → `textSubtitleS5` + `textActivePrimary`; leading edit-2 icon size 16.
  - Key-value rows (CK liên kết BH — Vật tư …): label 12px/w400/lh18 `#262626` → `textCaptionC7` + `textPrimary`; value 14px/w500/lh20 `#262626` → `textBodyB5`; gap 8 giữa rows; row layout space-between.
- Panel "Tổng giá dịch vụ" container bg `#ffffff`; padding 16; gap 16.
  - Title 18px/w700/lh26 → `textHeadingH3`.
  - Subtitle "Chi tiết theo bên thanh toán": 14px/w600/lh20 → `textSubtitleS5`.
  - Segmented toggle (Tabbar): track bg `#f3f4f6` (gray100); padding 4; gap slot 10; pill active bg `#ffffff` radius 6 padding 24×4 text 14px/w500 `#0052ff`; slot inactive text 14px/w500 `#595e69` → `textBodyB5`.
  - Bảng "Khoản mục": header "Khoản mục" 14px/w600 → `textSubtitleS5`; row label 12px/w400 `#262626` (C7); row value 14px/w500 `#262626` (B5); gap 8.
  - Divider 343px Line204 → border `#e8e8ea`.
  - "Cần thanh toán" header 14px/w600 → `textSubtitleS5`; "Khách hàng thanh toán" row label 12px/w400 (C7) value 14px/w500 (B5).
  - Ô "Tổng thanh toán": bg `#f3f3f4` → `AppColors.bgSecondary`; padding 12; radius 8; label 14px/w600 `#262626` (S5); value 14px/w700/lh20 `#0052ff` → `textHeadingH5` + `textActivePrimary`.
  - 6px spacer bars `#e8e8ea` giữa Phân bổ / panel.

### Action bar (`407:17222`, 375×176)
- Container bg `#ffffff`; rounded-top 8 (radius-tl/tr 8); top shadow `0px -4px 12px rgba(0,0,0,0.06)`; overflow-clip.
- "Tab Button" group: padding pt16 pb20 px16; gap 8.
- Nút "Tạo hồ sơ bảo hiểm": bg `#edf7ff` → `AppColors.buttonBackgroundTertiary`; padding 16×12 (px16 py12); radius 8; text 16px/w700/lh24 `#0052ff` → `textHeadingH4` + `textActivePrimary`; leading add-square icon size 24; full width.
  - expected flutter: `AppButton.textIcon(...)` tertiary, `AppButtonSize.medium()/large()`.
- Nút "Thanh toán": bg `#0052ff` → `AppColors.buttonBackgroundPrimary`; padding 16×12; radius 8; text 16px/w700/lh24 white → `textHeadingH4` + `AppColors.textWhite`; full width.
  - expected flutter: `AppButton.text(...)` primary.
- Home Indicator: bar bg `#000000`, h4, w134, radius 100; container padding 10×8.

---

## Screenshots
> assets/wave01-ins-stl-detail/
- `_full.png` — toàn screen (375×1856 nội dung, tab "Bảng chi phí" active)
- `410-28748.png` — Nhóm A: Header & thông tin chung (mã phiếu + badge + info + 2 accordion)
- `407-19398.png` — Tab bar 4 tab (AC-4)
- `407-19436.png` — Tab "Bảng chi phí": Dịch vụ thực hiện + Phụ tùng sử dụng (AC-5)
- `407-19519.png` — Phân bổ bảo hiểm + panel Tổng giá dịch vụ + Cân thanh toán (AC-9/10/6/11)
- `407-17222.png` — Action bar (Tạo hồ sơ bảo hiểm + Thanh toán + Home Indicator)
