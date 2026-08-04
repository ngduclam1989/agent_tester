---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "81:39472"
fetched_at: 2026-06-18T07:35:00+07:00
oracle_version: 1
wave_focus: "CR-20260612-01 — panel 'Tổng giá dịch vụ' tách per-payer (V1 BH / V2 KH+BH / V3 KH no-BH); Figma đã update đầy đủ 3 variant + 2026-06-18 designer bổ sung V2: section 'Thông tin xe' trong tab Bảng chi phí + nút 'Chỉnh sửa phiếu' standalone phía trên Action bar"
design_updates:
  - date: 2026-06-18
    scope: V2 — Chi tiết phiếu quyết toán KH (Có BH - Khách hàng chi trả) `563:27555`
    changes:
      - new_frame: "`563:27908` — 'Thông tin xe' 343×284 (sau cost blocks DV + Phụ tùng trong tab 'Bảng chi phí' AC-5 `563:27604`). Title 'Thông tin xe' 16px Semi Bold Inter `#262626`. Chứa 6 info rows iconified: Biển số xe (vuesax/linear/security 16×16) · Hãng/dòng xe (vuesax/linear/buildings) · Ghi chú (vuesax/linear/note) · Ngày (vuesax/linear/calendar) · SĐT KH (vuesax/linear/call) · Người tạo (vuesax/linear/user-tick) + 1 Upload item 343×50."
      - new_frame: "`563:27686` — Section 'Quyền & nghiệp vụ chỉnh sửa phiếu QT giữ nguyên' 375×52, padding `EdgeInsets.symmetric(horizontal: 16, vertical: 8)` — nằm GIỮA body content và Action bar (y=1730). Chứa Button `563:27687` secondary `Chỉnh sửa phiếu` (bg `var(--base/bg-secondary, #f3f3f4)`, radius 8px, padding `12h 8v`, vuesax/linear/edit icon 16×16 + text 'Chỉnh sửa phiếu' 14px Semi Bold Inter color `var(--base/text-primary, #273243)`)."
    resolves_coverage_gap: "Carry-over W01 V2 thiếu 'Chỉnh sửa' → giờ có (nằm dưới body, không nằm trong Action bar `563:27691`). Wave-spec ARB key + impl `Chỉnh sửa phiếu` cần align với Figma wording (không phải 'Chỉnh sửa' hay 'Sửa')."
    screenshot: assets/wave02-ins-stl-detail/563-27555.png (re-downloaded 2026-06-18 — 117KB, replaced 84KB version)
screenshots:
  - assets/wave02-ins-stl-detail/_full.png
  - assets/wave02-ins-stl-detail/407-17089.png
  - assets/wave02-ins-stl-detail/407-19519.png
  - assets/wave02-ins-stl-detail/407-17222.png
  - assets/wave02-ins-stl-detail/563-27555.png
  - assets/wave02-ins-stl-detail/563-28056.png
  - assets/wave02-ins-stl-detail/563-27691.png
  - assets/wave02-ins-stl-detail/437-18516.png
  - assets/wave02-ins-stl-detail/437-18565.png
  - assets/wave02-ins-stl-detail/563-27908.png   # NEW 2026-06-18 — V2 "Thông tin xe" section
  - assets/wave02-ins-stl-detail/563-27686.png   # NEW 2026-06-18 — V2 "Chỉnh sửa phiếu" standalone button
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (5 panel-level + 2 tab-bar calls)
  get_screenshot: success (1 _full + 8 per-section)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete
  design_tokens: complete
  interaction_states: partial (default-only — mock không show hover/pressed/disabled state cho read-only panel)
figma_drift_resolutions:
  CR-20260612-01a: APPLIED — Figma renders V1 (407:17089) "Có BH - Bảo hiểm chi trả" với panel 1-cột BH, KHÔNG có row "Khách hàng thanh toán" trong Cân TT, GIỮ "Tổng thanh toán".
  CR-20260612-01b: APPLIED — Figma renders V2 (563:27555 + 758:28571 "Có BH - Khách hàng chi trả") với panel 1-cột KH + section "Phân bổ Bảo hiểm" CHỈ 3 khoản dấu "+", 2 khoản "CK liên kết BH" ĐÃ ẨN. NEED CONFIRMATION FEAT v15 dòng 98 → RESOLVED: ẨN (Figma là evidence).
  CR-20260612-01c: APPLIED — Figma renders V3 (437:18516) "không BH" KHÔNG có panel "Tổng giá dịch vụ"/"Cân thanh toán"/"Phân bổ Bảo hiểm" — chỉ tab bar + bảng hạng mục (rút gọn hơn dự kiến: feature spec yêu cầu panel rút gọn 1 cột KH, nhưng Figma không render panel ở V3 → flag drift nhẹ vs FEAT AC-6 nhánh 3).
coverage_gaps:
  - "Figma V3 (437:18516) KHÔNG có panel 'Tổng giá dịch vụ' nào — FEAT AC-6 nhánh 3 yêu cầu panel rút gọn 1 cột KH + Cân TT. Có thể Figma cố tình bỏ panel (vì SO không BH → không cần phân bổ → panel = bảng giá hạng mục là đủ). NEED CONFIRMATION (Business Authority) — agent-test-ui verify theo FEAT là nguồn chốt."
  - "Tab bar V2 (563:27566) + V3 (437:18527) vẫn render đủ 4 tab incl. 'Hồ sơ bảo hiểm đã xuất' — TRÁI BR-INS-STL-DET-007 (KH payer chỉ có 3 tab, ẩn 'Hồ sơ bảo hiểm đã xuất'). Figma drift — agent-test-ui verify implementation theo FEAT v15 AC-4 + BR-INS-STL-DET-007."
  - "Mock vẫn dùng 'Cần thanh toán' (Figma 407:19565 / 563:28099 / 758:28807) thay vì 'Cân thanh toán' (FEAT AC-11 + BR-INS-STL-DET-009). Wording drift carry-over từ W01. Verify wording chính xác với BA — implementation theo FEAT là nguồn chốt."
  - "Header field set vẫn rút gọn (Cập nhật / Phiếu DV liên kết / Bảo hiểm chi trả / Ghi chú QT / Tổng tiền / Còn lại) — KHÔNG đủ field FEAT AC-2 (Người tạo, Ngày tạo, Bên thanh toán='Bảo hiểm', Cập nhật lần cuối). Carry-over từ W01 — W02 CR không sửa header."
  - "Action bar V1 (407:17222 — 'Có BH - Bảo hiểm chi trả') hiện 2 nút body 'Tạo hồ sơ bảo hiểm' + 'Thanh toán' — KHÔNG có 'Chỉnh sửa' / 'Xuất hồ sơ bảo hiểm (PDF)' / nút primary '+ Tạo hồ sơ bảo hiểm' như FEAT AC-1. Carry-over từ W01 — W02 CR không sửa action bar V1. **V2 đã được fix 2026-06-18**: thêm section 'Chỉnh sửa phiếu' standalone (`563:27686`) giữa body và action bar."
  - "V2alt (758:28571) chưa được re-fetch 2026-06-18 sau khi V2 (563:27555) được designer cập nhật — chưa biết có đồng bộ thêm 'Thông tin xe' + 'Chỉnh sửa phiếu' standalone không. agent-test-ui flag khi compare V2 vs V2alt visually."
---

# Oracle — FEAT-INS-STL-DETAIL · Chi tiết phiếu quyết toán bảo hiểm (mobile · Wave 02 · CR-20260612-01)

> Design-conformance oracle cho `agent-test-ui` (garage-mobile / Flutter) phục vụ **Wave 02**.
> Wave 02 áp dụng **CR-20260612-01** (FEAT v15, chốt 2026-06-15) — đảo logic panel "Tổng giá dịch vụ" từ 2-cột
> sang **per-payer** (1 cột theo bên thanh toán của phiếu) + **section "Phân bổ Bảo hiểm"** xuất hiện trên
> phiếu KH khi đi từ SO có BH (chỉ 3 khoản chuyển KH, ẩn 2 khoản CK liên kết BH).
>
> **Figma đã update đầy đủ CR-20260612-01**: file `nAoFS33sTWj3ctWjZMUDEl` node `81:39472` chứa **4 frame variant**
> riêng biệt (V1 + V2 + V2alt + V3) — KHÔNG còn dùng layout W01 2-cột nữa. NEED CONFIRMATION FEAT v15 dòng 98
> (2 khoản CK liên kết BH có hiển thị trên V2 không) **được resolve = ẨN** (Figma evidence). Conformance authority
> = **FEAT v15 AC-6 + BR-INS-STL-DET-009 + PKG-W02 §A2** (CR-APPROVED 2026-06-15); Figma đồng pha cho TÂM panel
> "Tổng giá dịch vụ" + "Phân bổ Bảo hiểm" + "Cân thanh toán".

---

## Screen Inventory

> Section root `81:39472` chứa **4 top-level variant frame** ứng với CR-20260612-01 V1/V2/V3 + 1 alt-state cho V2.
> Layout: section width=2390, các variant đặt cạnh nhau (Figma comparison view). Mỗi frame là phone 375 wide.

| Screen state | nodeId | size | screenshot | Maps |
|---|---|---|---|---|
| **V1** — Phiếu QT BH (`payerType=INSURANCE`) — CR-20260612-01a | `407:17089` | 375×2111 | `assets/wave02-ins-stl-detail/407-17089.png` | FEAT AC-1..9, AC-12, AC-13 + BR-INS-STL-DET-009(a) |
| **V2** — Phiếu QT KH từ SO có BH (`payerType=CUSTOMER ∧ soHasInsurance=true`) — CR-20260612-01b — full state | `563:27555` | 375×2034 | `assets/wave02-ins-stl-detail/563-27555.png` | FEAT AC-1..7, AC-9 + BR-INS-STL-DET-009(b) |
| **V2alt** — Phiếu QT KH từ SO có BH — alternate data state (giá trị tiền khác V2) | `758:28571` | 375×1703 | — (cấu trúc identical V2; verify visually qua _full.png so sánh) | FEAT AC-1..7, AC-9 + BR-INS-STL-DET-009(b) |
| **V3** — Phiếu QT KH từ SO không BH (`payerType=CUSTOMER ∧ soHasInsurance=false`) — CR-20260612-01c | `437:18516` | 375×1644 | `assets/wave02-ins-stl-detail/437-18516.png` | FEAT AC-1..7, AC-9 + BR-INS-STL-DET-009(c) |

### Section frames per-variant (nội dung trong screen)

| Frame | V1 (407:*) | V2 (563:*) | V2alt (758:*) | V3 (437:*) |
|---|---|---|---|---|
| Nhóm A — Header | `410:28748` (375×430) | `563:27557` (đồng cấu trúc) | `758:28572` | `437:18518` |
| AC-4 — Tab bar 4 tab | `407:19398` (375×76) | `563:27566` (375×76) | `758:28582` | `437:18527` (375×76) |
| AC-5 — Bảng hạng mục | `407:19436` (375×684) | `563:27604` (375×684) | `758:28620` (375×388) | `437:18565` (375×**858** — dài hơn vì không có panel dưới) |
| AC-9/AC-6 — Panel "Tổng giá dịch vụ" + AC-10 "Phân bổ Bảo hiểm" + AC-11 "Cân TT" | `407:19519` (375×**590** — đủ 5 khoản phân bổ) | `563:28056` (375×**534** — chỉ 3 khoản phân bổ) | `758:28764` (375×534) | **KHÔNG có** (panel ẩn — flag drift) |
| AC-10 — Phân bổ Bảo hiểm panel | `407:19520` (375×**216** — 5 rows) | `563:28058` (375×**160** — 3 rows) | `758:28766` (375×160) | KHÔNG có |
| AC-6 — Panel "Tổng giá dịch vụ" container | `407:19522` (375×362) | `563:28060` (375×362) | `758:28768` (375×362) | KHÔNG có |
| AC-11 — Cân thanh toán | `407:19561` (343×48) | `563:28095` (343×48) | `758:28803` (343×48) | KHÔNG có |
| **Thông tin xe** (NEW V2 2026-06-18) | KHÔNG có | `563:27908` (343×284) | (chưa fetch — verify) | KHÔNG có |
| **Quyền/Chỉnh sửa phiếu** (NEW V2 2026-06-18) | KHÔNG có | `563:27686` (375×52) | (chưa fetch — verify) | KHÔNG có |
| Action bar | `407:17222` (375×**160** — 2 nút BH) | `563:27691` (375×**104** — 1 nút KH) | `758:28855` (375×104) | `437:18720` (375×104) |

> **Update 2026-06-18 (V2)**: Designer bổ sung `563:27908` "Thông tin xe" (trong tab Bảng chi phí, sau cost blocks) + `563:27686` "Chỉnh sửa phiếu" button standalone (giữa body và Action bar). V2alt `758:28571` chưa được fetch lại — verify nếu cập nhật song song.

- Tab "Bảng chi phí" = active default trong mọi variant (underline 2px `#0052ff`, text `#0052ff` weight 500).
- V3 thiếu panel "Tổng giá dịch vụ" hoàn toàn — flag NEED CONFIRMATION (`coverage_gaps`); FEAT AC-6 nhánh 3 yêu cầu panel rút gọn 1 cột KH.

---

## Component Inventory

> Component set chia theo variant; widget catalog (Flutter `gf-garage-app/lib/ui/widgets/`) expected mapping
> giữ nguyên với W01 + bổ sung visibility-gate per CR-20260612-01.

### Common (mọi variant V1/V2/V2alt/V3)
- AppBar (CustomAppBar) × 1 — back + title "Chi tiết phiếu quyết toán" + 3-dot overflow.
- Mã phiếu heading × 1 — placeholder "#PHDV-240923-001" (FEAT v15 AC-1 yêu cầu "#SET-{YYYYMMDD}-{NNNNN}" — mock drift carry-over W01).
- Badge "Đã thanh toán" × 1 — success pill (bg `#f0fdf1` + text `#15aa2c`).
- Info row × 6 (Cập nhật / Phiếu DV liên kết / Bảo hiểm chi trả / Ghi chú QT / Tổng tiền / Còn lại) — header rút gọn, FEAT AC-2 yêu cầu 6 field khác (Phiếu DV liên kết, Người tạo, Ngày tạo, Bên thanh toán, Cập nhật lần cuối, Ghi chú QT).
- Divider Line204 × 3 + 6px spacer bar `#e8e8ea`.
- Accordion (Collapse) × 2 — "Thông tin khách hàng" / "Thông tin xe" (collapsed default — FEAT AC-3 expanded state ngầm).
- Tabs (4-tab bar) × 1 — 4 tab cứng (Bảng chi phí / Chứng từ & hóa đơn / Hồ sơ bảo hiểm đã xuất / Lịch sử thanh toán). **Figma drift V2/V3**: vẫn render đủ 4 tab — TRÁI BR-INS-STL-DET-007 (KH payer chỉ 3 tab).
- Tab "Bảng chi phí" — Section header × 2 ("Dịch vụ thực hiện" + "Phụ tùng sử dụng") + Line-item card × 4 (h64, radius12, shadow s2) + Empty/scroll affordance.

### V1 (Phiếu BH `407:17089`) — additional
- **Section "Phân bổ bảo hiểm"** (`407:19520`) × 1 — title H3 + nút "Sửa" (text button + edit-2 icon `opacity-0` = ẩn trong mock) + **5 key-value rows**:
  - "CK liên kết BH — Vật tư" · `-540.000đ`
  - "CK liên kết BH — Công dịch vụ" · `-50.000đ`
  - "Giảm trừ bồi thường" · `-50.000đ` *(Figma mock value SAI sign — FEAT AC-6 yêu cầu dấu `+` cho 3 khoản chuyển KH. Mock vẫn dùng `-` chung. Verify implementation theo FEAT: V1 → "+" hay "−" cho 3 khoản này cần BA confirm)*
  - "Khấu hao vật tư / thay mới" · `-45.000.000đ`
  - "Khấu trừ BH" · `-5.000.000đ`
- **Panel "Tổng giá dịch vụ"** (`407:19522`) × 1:
  - Title "Tổng giá dịch vụ" (H3, 18px w700)
  - Subtitle "Chi tiết theo bên thanh toán" (S5, 14px w600)
  - Cột giá trị label: **"Bảo hiểm thanh toán"** (S5, 14px w600) — single column
  - 4 rows: "Dịch vụ " · "Phụ tùng " · "VAT " · "Cộng sau VAT " (note trailing space — Figma có ký tự space)
  - Divider 343px ngang.
  - "Cần thanh toán" header (S5) — *Figma typo: "Cần" thay vì "Cân" FEAT AC-11*
  - Row "Bảo hiểm thanh toán" (C7 label) · value 14px w500 = `15.000.000đ`
  - **KHÔNG có row "Khách hàng thanh toán"** (CR-20260612-01a applied).
  - Ô "Tổng thanh toán" (bg `#f3f3f4` highlighted, padding 12, radius 8) · label S5 + value H5 14px w700 `#0052ff` blue `38.440.000đ`.
- Action bar × 1 (`407:17222` h=160): 2 nút full-width body — "Tạo hồ sơ bảo hiểm" (tertiary `#edf7ff`) + "Thanh toán" (primary `#0052ff`) + Home Indicator. **Drift W01 carry-over**: FEAT AC-1 yêu cầu 3 nút header bar — "Chỉnh sửa" / "Xuất hồ sơ bảo hiểm (PDF)" / "+ Tạo hồ sơ bảo hiểm".
- AppButton × 2 ở action bar (kích thước large h56).

### V2 (Phiếu KH từ SO có BH `563:27555`) — CR-20260612-01b
- **Section "Phân bổ bảo hiểm"** (`563:28058`) × 1 — **CHỈ 3 key-value rows dấu `+`**:
  - "Giảm trừ bồi thường" · `+50.000đ`
  - "Khấu hao vật tư / thay mới" · `+45.000.000đ`
  - "Khấu trừ BH" · `+5.000.000đ`
  - **2 khoản "CK liên kết BH — Vật tư" + "CK liên kết BH — Công dịch vụ" KHÔNG render** — Figma confirm ẨN (NEED CONFIRMATION FEAT v15 dòng 98 → resolved).
- **Panel "Tổng giá dịch vụ"** (`563:28060`) × 1:
  - Title + Subtitle như V1.
  - Cột giá trị label: **"Khách hàng thanh toán"** (S5) — single column
  - 4 rows: "Dịch vụ " · "Phụ tùng " · "VAT " · "Cộng sau VAT " (values: 540.000đ / 50.000đ / 50.000đ / 50.000đ — placeholder)
  - Divider 343px.
  - "Cần thanh toán" header.
  - Row "Khách hàng thanh toán" (C7) · value 14px w500 = `15.000.000đ`
  - **KHÔNG có row "Bảo hiểm thanh toán"**.
  - Ô "Tổng thanh toán" (bg `#f3f3f4`) · value `38.440.000đ` `#0052ff`.
- **NEW 2026-06-18 — Section "Thông tin xe"** (`563:27908`) × 1 trong tab "Bảng chi phí" (sau cost blocks DV/Phụ tùng):
  - Container 343×284, padding 0, gap 12 column
  - Title "Thông tin xe" 16px Semi Bold Inter `#262626` (24h)
  - 6 info rows iconified (mỗi row gap 8, padding 0):
    - Biển số xe — `vuesax/linear/security` 16×16 + label + value `30A-12345` (mock — chỉ ví dụ; verify FEAT)
    - Hãng/dòng xe — `vuesax/linear/buildings` 16×16 (314×20)
    - Ghi chú — `vuesax/linear/note` 16×16 (189×20)
    - Ngày (nhận xe / hẹn giao) — `vuesax/linear/calendar` 16×16 (175×20)
    - SĐT KH — `vuesax/linear/call` 16×16 (231×20)
    - Người tạo — `vuesax/linear/user-tick` 16×16 (217×20)
  - Upload item section 343×50 (label "Filename.format" + size "1.3MB" + icon — likely chỗ đính kèm hợp đồng/giấy tờ xe).
  - **Flutter mapping**: `Column` + `IconRow` × 6 (semantic widget — reuse pattern từ FEAT-SO-DETAIL info xe section) + `UploadAttachmentItem`.
- **NEW 2026-06-18 — Section "Chỉnh sửa phiếu" standalone** (`563:27686`) × 1 — full-width 375×52, padding `EdgeInsets.symmetric(horizontal: 16, vertical: 8)`, đặt GIỮA body content và Action bar (y=1730):
  - Button `563:27687` secondary `Chỉnh sửa phiếu`: bg `var(--base/bg-secondary, #f3f3f4)`, radius 8px, padding `12h 8v`, gap 4, full-width.
  - Icon `vuesax/linear/edit` 16×16 left.
  - Text "**Chỉnh sửa phiếu**" 14px Semi Bold Inter color `var(--base/text-primary, #273243)`.
  - **Flutter mapping**: `Padding(EdgeInsets.symmetric(horizontal: 16, vertical: 8))` wrap `AppButton.textIcon(size: small, color: AppButtonColor.custom(bg: AppColors.bgSecondary, fg: AppColors.textPrimary), icon: edit, label: 'Chỉnh sửa phiếu')`.
  - **Visibility gate**: kế thừa V2 (KH payer) — chỉ render khi user có quyền (BR-INS-STL-DET-008 / FEAT AC-1 "Chỉnh sửa" action). Còn V1 BH payer: vẫn dùng action bar theo carry-over W01 layout; FEAT v15 yêu cầu cả V1 cũng phải có (drift remaining).
- Action bar × 1 (`563:27691` h=104): 1 nút full-width body "Thanh toán" (primary `#0052ff`) + Home Indicator. **KHÔNG có** "Tạo hồ sơ bảo hiểm" / "Xuất hồ sơ bảo hiểm (PDF)" — đúng BR-INS-STL-DET-007 (action gate theo bên TT). "Chỉnh sửa" tách RA section riêng `563:27686` (new 2026-06-18).

### V2alt (Phiếu KH từ SO có BH `758:28571`) — alternate data state
- Cấu trúc identical V2 (cùng `407:1932*` parent component instance set).
- Khác V2 ở values: panel value `50.050.000đ` (vs V2 `38.440.000đ`).
- Có thể đại diện trạng thái "đã tính toán" khác (eg. phiếu khác thời điểm).
- Panel "Phân bổ Bảo hiểm" (`758:28766`) cùng cấu trúc 3 rows dấu `+`.

### V3 (Phiếu KH từ SO không BH `437:18516`) — CR-20260612-01c (rút gọn)
- **KHÔNG có panel "Tổng giá dịch vụ"** (entire `407:19519`/`563:28056` analog absent).
- **KHÔNG có section "Phân bổ Bảo hiểm"** — đúng CR-20260612-01c.
- **KHÔNG có "Cân thanh toán"** — flag NEED CONFIRMATION vs FEAT AC-6 nhánh 3 (yêu cầu "Cân thanh toán" = KH + Tổng TT).
- Tab "Bảng chi phí" có bảng hạng mục dài hơn (h=858 vs V1/V2 h=684) — chiếm hết content area vì không có panel dưới.
- Action bar × 1 (`437:18720` h=104): 1 nút "Thanh toán" — giống V2.
- Tab bar (`437:18527`): vẫn đủ 4 tab incl. "Hồ sơ bảo hiểm đã xuất" — **drift vs BR-INS-STL-DET-007** (yêu cầu KH payer chỉ 3 tab).

### Widget catalog mapping (expected, Flutter)
- AppBar → `CustomAppBar`
- Badge → `Badge` (success variant) · BG `bgBadgeSuccess` + text `textSuccessPrimary`
- Tabs → `TabBar` (active underline 2px `#0052ff`, inactive text `#262626`)
- Accordion → custom `ExpansionTile`-style hoặc `Container` + tap-to-expand
- Line-item card → `Container` + `Column` / `Row` + `BoxShadow(AppShadows.boxShadow)` + radius 12
- Panel container → `Container` + `Column`, white bg `#ffffff`, padding 16
- Action bar button → `AppButton.text(appButtonSize: AppButtonSize.large(), appButtonColor: AppButtonColor.primary())` cho "Thanh toán"; `.custom(...)` hoặc factory tertiary cho "Tạo hồ sơ bảo hiểm" (bg `#edf7ff` `buttonBackgroundTertiary`)
- Ô tổng "Tổng thanh toán" → `Container` + `EdgeInsets.all(12)`, bg `#f3f3f4` `bgSecondary`, radius 8

---

## Variant & State

### Panel "Tổng giá dịch vụ" — W02 CR-20260612-01 (TÂM ĐỔI)

#### V1 — Bảo hiểm (`407:19519` ↘ `407:19522`)
- Layout: bảng **1 cột** `Khoản mục | Bảo hiểm thanh toán`.
- Section "Phân bổ bảo hiểm" (panel anh em `407:19520`): **GIỮ**, 5 khoản đầy đủ (CK liên kết BH × 2, Giảm trừ bồi thường, Khấu hao, Khấu trừ BH).
- "Cân thanh toán" section (`407:19561`):
  - Row "Bảo hiểm thanh toán" — text label C7 12px w400, value B5 14px w500 `#262626`.
  - **KHÔNG có** row "Khách hàng thanh toán" (CR-20260612-01a bỏ).
- Ô "Tổng thanh toán" (`407:19571`):
  - bg `#f3f3f4` (`AppColors.bgSecondary`)
  - label "Tổng thanh toán" S5 (`AppTextStyle.textSubtitleS5`)
  - value `38.440.000đ` H5 (`AppTextStyle.textHeadingH5` 14px w700) — color `#0052ff` (`AppColors.textActivePrimary` / blue)
- **KHÔNG có** segmented toggle "KH thanh toán / BH thanh toán" (W01 có; W02 CR bỏ).
- states observed: default (read-only, no interactive variants in mock).

#### V2 — Khách hàng từ SO có BH (`563:28056` ↘ `563:28060`)
- Layout: bảng **1 cột** `Khoản mục | Khách hàng thanh toán`.
- Section "Phân bổ bảo hiểm" (`563:28058`): **HIỂN THỊ** với **chỉ 3 khoản chuyển KH (dấu +)**:
  - "Giảm trừ bồi thường" (+)
  - "Khấu hao vật tư / thay mới" (+)
  - "Khấu trừ BH" (+)
- **ẨN** 2 khoản "CK liên kết BH — Vật tư" + "CK liên kết BH — Công dịch vụ" — confirmed Figma ẨN (NEED CONFIRMATION resolved).
- "Cân thanh toán" section (`563:28095`):
  - Row "Khách hàng thanh toán" — label C7, value B5 `#262626` `15.000.000đ`.
  - **KHÔNG có** row "Bảo hiểm thanh toán".
- Ô "Tổng thanh toán" (`563:28105`):
  - bg `#f3f3f4`, value `38.440.000đ` color **`#0052ff`** (blue — same as V1, KHÔNG dùng cam).
  - *(Note: FEAT AC-6 mô tả "ô cam" cho Khách hàng thanh toán — Figma hiện dùng blue cho mọi variant. Có thể là design choice hoặc carry-over. Flag nếu BA muốn ô cam thuần khiết.)*
- states observed: default.

#### V2alt — Khách hàng từ SO có BH (`758:28571` ↘ `758:28764` ↘ `758:28768`)
- Cấu trúc identical V2. Phân bổ BH (`758:28766`) cùng 3 rows dấu `+`.
- Khác V2 ở dữ liệu: value rows = `0đ` (chưa nhập hạng mục), "Khách hàng thanh toán" Cân TT = `50.050.000đ`, "Tổng thanh toán" = `50.050.000đ`.
- Có thể đại diện state khi user xem phiếu chưa có hạng mục KH (vẫn render đủ visual).

#### V3 — Khách hàng từ SO không BH (`437:18516`)
- **KHÔNG render panel "Tổng giá dịch vụ" / "Phân bổ Bảo hiểm" / "Cân thanh toán" / "Ô Tổng thanh toán"** — toàn bộ block từ `*:19519` analog absent.
- Đặc trưng V3 vs V2: kết thúc content area sau bảng hạng mục — không có panel dưới.
- **Flag NEED CONFIRMATION**: FEAT AC-6 nhánh 3 yêu cầu panel rút gọn "1 cột Khách hàng thanh toán + Cân thanh toán = KH + Tổng TT". Figma không render → có 2 hướng:
  1. Figma cố tình bỏ panel khi SO không BH → cập nhật FEAT AC-6 nhánh 3 cho khớp.
  2. Figma chưa cập nhật panel rút gọn → bổ sung Figma.
  agent-test-ui verify theo FEAT là nguồn chốt.

### Tabs — 4 tab (`407:19399` / `563:27567` / `758:28583` / `437:18528`)
- variants: active (underline 2px `#0052ff`, text `#0052ff` Inter Medium 14px) vs inactive (text `#262626` Inter Regular 14px, no underline).
- Mock active = "Bảng chi phí" cho mọi variant.
- **Figma drift V2 + V3**: vẫn render đủ 4 tab (incl. "Hồ sơ bảo hiểm đã xuất") — vi phạm BR-INS-STL-DET-007 (KH payer ẩn tab). agent-test-ui verify implementation: V2/V3 phải có 3 tab.

### Section "Phân bổ bảo hiểm" — nút "Sửa" (`*16514:316149`)
- variant: text button + edit-2 icon, text Semi Bold 14px `#0052ff`, bg `#ffffff`, radius 8, padding `8px 12px`.
- **Note Figma**: instance này có `opacity-0` (ẩn) trong mọi variant — nút "Sửa" KHÔNG hiển thị trong mock current. Có thể design intent là cho phép chỉnh sửa trong tương lai. Verify với BA — FEAT chưa quy định.
- states observed: default (hidden).

### AppBar / Badge / Accordion / Line-item card — không đổi vs W01
- Variants + states **giữ W01** (xem `wave01-ins-stl-detail-oracle.md §Variant & State`).

### Action bar — gate theo BR-INS-STL-DET-007
- **V1** (h=160): 2 button "Tạo hồ sơ bảo hiểm" (tertiary `#edf7ff`) + "Thanh toán" (primary `#0052ff`). *Vẫn drift FEAT AC-1 (yêu cầu 3 nút ở thanh hành động header) — carry-over W01.*
- **V2/V2alt/V3** (h=104): 1 button "Thanh toán" (primary `#0052ff`). Đúng BR-INS-STL-DET-007 (KH payer ẩn nút BH).

---

## Text Content

> Verbatim tiếng Việt. Giá trị tiền/tên/mã là placeholder mock — verify wording cố định, KHÔNG verify số liệu.

### Header / AppBar / Tab bar — không đổi vs W01
- AppBar title: **"Chi tiết phiếu quyết toán"**
- Mã phiếu placeholder: `#PHDV-240923-001` (mock — FEAT v15: `#SET-{YYYYMMDD}-{NNNNN}`).
- Badge: **"Đã thanh toán"**
- Info labels (mock): "Cập nhật:" · "Phiếu dịch vụ liên kết:" · "Bảo hiểm chi trả:" · "Ghi chú quyết toán:" · "Tổng tiền:" · "Còn lại:"
- Accordion: **"Thông tin khách hàng"** · **"Thông tin xe"**
- Tab labels: **"Bảng chi phí"** · **"Chứng từ & hóa đơn"** *(Figma "ó" mock vs FEAT AC-4 "ó" — same)* · **"Hồ sơ bảo hiểm đã xuất"** · **"Lịch sử thanh toán"**

### Tab "Bảng chi phí" — bảng hạng mục (không đổi vs W01)
- Section header: **"Dịch vụ thực hiện"** · **"Số lượng:"** / **"Phụ tùng sử dụng"** · **"Số lượng:"**
- Line-item placeholder: tên dịch vụ + người thực hiện + "x{SL}" + "{giá}đ".

### Section "Phân bổ bảo hiểm" — W02 per-variant

**Title verbatim**: `"Phân bổ bảo hiểm"` (chữ **b thường** ở "bảo hiểm" — Figma current; FEAT v15 AC-6 + BR-INS-STL-DET-009 dùng `"Phân bổ Bảo hiểm"` chữ **B hoa**. Wording drift — verify với BA: implementation theo wording FEAT (B hoa) — Figma cần cập nhật chữ B hoa.

#### V1 (Phiếu BH `407:19520`) — 5 khoản
- "CK liên kết BH — Vật tư" · `-540.000đ`
- "CK liên kết BH — Công dịch vụ" · `-50.000đ`
- "Giảm trừ bồi thường" · `-50.000đ` *(Figma mock dấu `-` — FEAT AC-6 V1 không quy định dấu cụ thể cho 3 khoản này trên phiếu BH; chỉ V2 quy định dấu `+`. Verify BA.)*
- "Khấu hao vật tư / thay mới" · `-45.000.000đ`
- "Khấu trừ BH" · `-5.000.000đ`
- Nút "Sửa" (text button) — ẩn `opacity-0` trong mock.

#### V2 + V2alt (Phiếu KH từ SO có BH `563:28058` / `758:28766`) — 3 khoản dấu `+`
- "Giảm trừ bồi thường" · `+50.000đ` (V2) / `+50.000đ` (V2alt)
- "Khấu hao vật tư / thay mới" · `+45.000.000đ` / `+45.000.000đ`
- "Khấu trừ BH" · `+5.000.000đ` / `+5.000.000đ`
- **ẨN** "CK liên kết BH — Vật tư" + "CK liên kết BH — Công dịch vụ" — confirmed.

#### V3 (Phiếu KH từ SO không BH) — KHÔNG render
- Section KHÔNG hiển thị — không có text.

### Panel "Tổng giá dịch vụ" — W02 per-variant

#### V1 (Phiếu BH `407:19522`) — CR-20260612-01a
- Title: **"Tổng giá dịch vụ"**
- Subtitle: **"Chi tiết theo bên thanh toán"**
- Cột giá trị label: **"Bảo hiểm thanh toán"** (single column — MỚI W02; W01 có 2 cột BH+KH)
- Bảng rows: **`Dịch vụ `** · **`Phụ tùng `** · **`VAT `** · **`Cộng sau VAT `** *(trailing space sau text — Figma source dùng template literal `{`Dịch vụ `}`)*
- Values placeholder: `540.000đ` · `50.000đ` · `50.000đ` · `50.000đ`
- Divider Line204 343px.
- "Cân thanh toán" header — **Figma render "Cần thanh toán"** (typo); FEAT v15 + BR-INS-STL-DET-009 yêu cầu **"Cân thanh toán"**. Drift — agent-test-ui verify theo FEAT.
- Row "Bảo hiểm thanh toán" · value `15.000.000đ`
- **KHÔNG có** "Khách hàng thanh toán" row (CR-20260612-01a bỏ).
- Ô tổng: **"Tổng thanh toán"** · value `38.440.000đ` `#0052ff` (highlighted `#f3f3f4`).

#### V2 (Phiếu KH từ SO có BH `563:28060`) — CR-20260612-01b
- Title + Subtitle: y V1.
- Cột giá trị label: **"Khách hàng thanh toán"**
- Bảng rows: y V1 (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT) — values placeholder.
- "Cần thanh toán" header — same drift.
- Row "Khách hàng thanh toán" · value `15.000.000đ`
- **KHÔNG có** "Bảo hiểm thanh toán" row.
- Ô tổng: "Tổng thanh toán" · `38.440.000đ` `#0052ff`.

#### V2alt (`758:28768`) — alternate data
- Identical V2 structurally; values: bảng rows = `0đ` (chưa nhập), Cân TT = `50.050.000đ`, Tổng TT = `50.050.000đ`.

#### V3 (Phiếu KH từ SO không BH) — KHÔNG render panel
- Panel "Tổng giá dịch vụ" + AC-9 + AC-10 + AC-11 không tồn tại.
- agent-test-ui verify theo FEAT v15 AC-6 nhánh 3 (panel rút gọn 1 cột KH + Cân TT).

### Action bar text content
- **V1** (`407:17222`): "Tạo hồ sơ bảo hiểm" (tertiary button text) + "Thanh toán" (primary button text).
- **V2/V2alt/V3** (`563:27691` / `758:28855` / `437:18720`): "Thanh toán" (primary button text).
- Common Home Indicator: bottom safe-area bar (44px iOS native).
- FEAT AC-1 yêu cầu nhãn header bar (drift carry-over W01): **"Chỉnh sửa"** · **"Xuất hồ sơ bảo hiểm (PDF)"** · **"+ Tạo hồ sơ bảo hiểm"**.

---

## Design Tokens

> Token nguồn `get_variable_defs` (success). Đầy đủ từ Figma variables — không supplement.

### Color tokens — semantic mapping

| Figma variable | Hex | → `AppColors.*` (mobile) | Vai trò |
|---|---|---|---|
| `Base/text-CD Garage` | `#262626` | `textPrimary` | Text chính, AppBar title, body text |
| `Base/text-Primary` | `#273243` | (fallback `textPrimary`) | Text alternate |
| `Base/text-Secondary` | `#595e69` | `textSecondary` | Text phụ |
| `Base/text-Tertiary` | `#888c94` | `textTertiary` | Label nhỏ, caption mờ |
| `Base/text-Quaternary` | `#b8babf` | (fallback `textTertiary`) | Placeholder |
| `Base/text-Active-Primary-CD Garage` | `#0052ff` | `textActivePrimary` | Active tab text, primary CTA text |
| `Base/text-Active-Primary-CD Vendor` | `#0052ff` | `textActivePrimary` (alias) | Value "Tổng thanh toán" + "Tổng giá dịch vụ" highlights |
| `Base/text-Error` | `#ed1f42` | `textErrorPrimary` | Error text, "Còn lại" highlight |
| `Base/text-Open` | `#273243` | (no semantic match — fallback `textPrimary`) | — |
| `Base/bg-Base` | `#ffffff` | `bgBase` | Container white bg |
| `Base/bg-Primary` | `#e8e8ea` | `bgPrimary` / `borderPrimary` | 6px spacer bar |
| `Base/bg-Secondary` | `#f3f3f4` | `bgSecondary` | Ô "Tổng thanh toán" highlight |
| `Base/bg-Error` | `#fff0f0` | (no match — flag) | — |
| `Base/border-Primary` | `#e8e8ea` | `borderPrimary` | Divider, border container |
| `CD Driver/P600-Main` | `#0052ff` | `buttonBackgroundPrimary` / `PrimaryColor.s700` | Button primary bg |
| `CD Driver/P50` | `#edf7ff` | `buttonBackgroundTertiary` / `PrimaryColor.s50` | Button tertiary bg "Tạo hồ sơ bảo hiểm" |
| `Neutral/Text Color` | `#334155` | (fallback `textSecondary`) | — |
| `Neutral/White` | `#ffffff` | `textWhite` | Button primary text |
| `Neutral/Black` | `#000000` | (no semantic — raw) | — |
| `base/muted-foreground` | `#71717a` | `textMutedForeground` | Muted state |

### Color tokens — global (token map từ get_variable_defs)
- `#262626` → `AppColors.textPrimary`
- `#595e69` → `AppColors.textSecondary`
- `#888c94` → `AppColors.textTertiary`
- `#0052ff` → `AppColors.textActivePrimary` / `AppColors.buttonBackgroundPrimary` / `PrimaryColor.s700`
- `#ed1f42` → `AppColors.textErrorPrimary`
- `#ffffff` → `AppColors.bgBase` / `AppColors.textWhite`
- `#e8e8ea` → `AppColors.borderPrimary` / `AppColors.bgPrimary`
- `#f3f3f4` → `AppColors.bgSecondary`
- `#edf7ff` → `AppColors.buttonBackgroundTertiary` / `PrimaryColor.s50`
- `#f0fdf1` → `AppColors.bgBadgeSuccess` (badge "Đã thanh toán" bg) *(không trong variable_defs hiện hành — supplement W01)*
- `#15aa2c` → `AppColors.textSuccessPrimary` (badge "Đã thanh toán" text) *(supplement W01)*
- `#9C9C9C33` / `1A` / `14` → shadow s2 color stops (drop shadow)
- *(Note: V2 panel value `Khách hàng thanh toán` Figma dùng `#0052ff` blue — KHÔNG dùng cam `#ff6b00` / `OrangeColor.s600` như W01 mock toggle. FEAT AC-6 mô tả "ô cam" — verify BA.)*

### Typography tokens — Inter font family
| Figma variable | Definition | → `AppTextStyle.*` |
|---|---|---|
| `Heading/H3` | 18px / Bold / lh26 / w700 | `textHeadingH3` |
| `Heading/H4` | 16px / Bold / lh24 / w700 | `textHeadingH4` |
| `Heading/H5` | 14px / Bold / lh20 / w700 | `textHeadingH5` |
| `Subtitle/S4` | 16px / Semi Bold / lh24 / w600 | `textSubtitleS4` |
| `Subtitle/S5` | 14px / Semi Bold / lh20 / w600 | `textSubtitleS5` |
| `Subtitle/S6` | 13px / Semi Bold / lh18 / w600 | `textSubtitleS6` |
| `Subtitle/S7` | 12px / Semi Bold / lh18 / w600 | `textSubtitleS7` |
| `Body/B5` | 14px / Medium / lh20 / w500 | `textBodyB5` |
| `Body/B7` | 12px / Medium / lh18 / w500 | `textBodyB7` |
| `Caption/C5` | 14px / Regular / lh20 / w400 | `textCaptionC5` |
| `Caption/C7` | 12px / Regular / lh18 / w400 | `textCaptionC7` |
| `Caption/C8` | 10px / Regular / lh14 / w400 | `textCaptionC8` |
| `14px/Medium` | 14px / Medium / lh20 / w500 (= B5 alias) | `textBodyB5` |
| `Regular/None/Medium` | 16px / Medium / lh16 / w500 | (fallback raw, không match catalog) |

### Application per role (Panel "Tổng giá dịch vụ")
- "Tổng giá dịch vụ" title → `Heading/H3` (`textHeadingH3` 18px w700)
- "Chi tiết theo bên thanh toán" subtitle → `Subtitle/S5` (`textSubtitleS5` 14px w600)
- Cột giá trị label ("Bảo hiểm thanh toán" / "Khách hàng thanh toán") → `Subtitle/S5`
- Row labels (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT) → `Caption/C7` (`textCaptionC7` 12px w400)
- Row values → `Body/B5` (`textBodyB5` 14px w500)
- "Cân thanh toán" / "Cần thanh toán" header → `Subtitle/S5`
- "Tổng thanh toán" label → `Subtitle/S5`
- "Tổng thanh toán" value → `Heading/H5` (`textHeadingH5` 14px w700) color `#0052ff`

### Spacing tokens
- `Spacing - Border/0` = 0 → `AppSizes.zeroSize`
- `Spacing - Border/4` = 4 → `AppSizes.spacing4`
- `Spacing - Border/8` = 8 → `AppSizes.spacing8`
- `Spacing - Border/12` = 12 / `spacing/3` = 12 → literal 12 (`AppSizes` không có 12 → `EdgeInsets`/`Gap(12)`)
- `Spacing - Border/16` = 16 → `AppSizes.spacing16`
- Padding container panel: `EdgeInsets.all(16)` → `AppSizes.spacing16`
- Gap between rows inside Phân bổ panel: `Gap(8)` → `AppSizes.spacing8`
- Gap between "Cân thanh toán" + "Tổng thanh toán" sections: `Gap(12)`

### Radius / Border
- `border radius/lg` = 8 → `BorderRadius.circular(8)` — badge / button / card phân bổ / ô tổng
- 12 (line-item card) → `BorderRadius.circular(12)`
- Divider Line204 SVG = 1px line color `#e8e8ea`
- 6px spacer bar (separator giữa section-container) → height 6 + bg `#e8e8ea`

### Shadow tokens
- `s2`:
  - `DROP_SHADOW(#9C9C9C33, 0 1, 20, 0)`
  - `DROP_SHADOW(#9C9C9C1A, 0 1, 20, 0)`
  - `DROP_SHADOW(#9C9C9C14, 0 1, 20, 0)`
  - → `AppShadows.boxShadow` (line-item card depth)

---

## Screenshots

> PNG per-section lưu tại `Product/ux/figma-test-mobile/assets/wave02-ins-stl-detail/`. 9 files total.

- `_full.png` — toàn view section `81:39472` (1296×2048, comparison view 3 variants V1 + V2 + V3)
- `407-17089.png` — **V1** full screen "Có BH - Bảo hiểm chi trả" (CR-20260612-01a) — 364×2048
- `407-19519.png` — V1 panel "Tổng giá dịch vụ" + "Phân bổ Bảo hiểm" + "Cân thanh toán" — 375×590 — **TÂM CR-20260612-01a**
- `407-17222.png` — V1 action bar (2 nút "Tạo hồ sơ bảo hiểm" + "Thanh toán") — 375×176
- `563-27555.png` — **V2** full screen "Có BH - Khách hàng chi trả" (CR-20260612-01b) — 375×2034
- `563-28056.png` — V2 panel "Tổng giá dịch vụ" + "Phân bổ Bảo hiểm" (3 khoản dấu `+`) + "Cân thanh toán" — 375×534 — **TÂM CR-20260612-01b**
- `563-27691.png` — V2 action bar (1 nút "Thanh toán") — 375×120
- `437-18516.png` — **V3** full screen "không BH" (CR-20260612-01c, rút gọn) — 375×1644
- `437-18565.png` — V3 bảng hạng mục (chiếm full content area, không có panel dưới) — 375×858

---

## CR-20260612-01 Conformance Focus

> **Invariants W02 phải verify** — agent-test-ui dùng làm conformance checklist.
> Nguồn: FEAT-INS-STL-DETAIL v15 §AC-6 + §BR-INS-STL-DET-009 + Figma 4 variant frame (verified inline).

### INV-1 — Variant V1: Phiếu QT BH (`payerType=INSURANCE`) — CR-20260612-01a

- [INV-1.1] Panel "Tổng giá dịch vụ" — bảng "Chi tiết theo bên thanh toán" hiển thị **đúng 1 cột "Bảo hiểm thanh toán"**.
- [INV-1.2] **KHÔNG có cột "Khách hàng thanh toán"** trong bảng "Chi tiết theo bên thanh toán".
- [INV-1.3] Section "Cân thanh toán" có **đúng 1 row "Bảo hiểm thanh toán"** + ô tổng "Tổng thanh toán". **KHÔNG có row "Khách hàng thanh toán"** (CR-20260612-01a bỏ).
- [INV-1.4] **GIỮ ô "Tổng thanh toán"** (highlight `#f3f3f4`, padding 12, radius 8), value blue `#0052ff` — **giá trị = "Bảo hiểm thanh toán"** (chốt 2026-06-12).
- [INV-1.5] **GIỮ section "Phân bổ Bảo hiểm"** với đủ 5 khoản:
  - "CK liên kết BH — Vật tư" (dấu `−`)
  - "CK liên kết BH — Công dịch vụ" (dấu `−`)
  - "Giảm trừ bồi thường" (dấu ?, Figma `−` — verify BA)
  - "Khấu hao vật tư / thay mới" (dấu `−`)
  - "Khấu trừ BH" (dấu `−`)
- [INV-1.6] **KHÔNG có segmented toggle** "KH thanh toán / BH thanh toán" trong panel (W01 có; W02 CR bỏ).
- [INV-1.7] Tab bar: **4 tab** đầy đủ — "Bảng chi phí" (active) · "Chứng từ & hoá đơn" · "Hồ sơ bảo hiểm đã xuất" · "Lịch sử thanh toán" (BR-INS-STL-DET-007 — BH payer hiển thị đủ).
- [INV-1.8] Action bar: phải có 3 nút theo FEAT AC-1 — "Chỉnh sửa" · "Xuất hồ sơ bảo hiểm (PDF)" · "+ Tạo hồ sơ bảo hiểm". *(Figma drift carry-over W01: chỉ 2 nút body "Tạo hồ sơ bảo hiểm" + "Thanh toán" — agent-test-ui verify theo FEAT.)*

### INV-2 — Variant V2: Phiếu QT KH từ SO có BH (`payerType=CUSTOMER ∧ soHasInsurance=true`) — CR-20260612-01b

- [INV-2.1] Panel "Tổng giá dịch vụ" — bảng "Chi tiết theo bên thanh toán" hiển thị **đúng 1 cột "Khách hàng thanh toán"**.
- [INV-2.2] **KHÔNG có cột "Bảo hiểm thanh toán"** trong bảng "Chi tiết theo bên thanh toán".
- [INV-2.3] Section "Cân thanh toán" có **đúng 1 row "Khách hàng thanh toán"** + ô tổng "Tổng thanh toán". **KHÔNG có** row "Bảo hiểm thanh toán".
- [INV-2.4] **HIỂN THỊ section "Phân bổ Bảo hiểm"** với **chỉ 3 khoản chuyển KH chịu (dấu +)**:
  - "Giảm trừ bồi thường" (+)
  - "Khấu hao vật tư / thay mới" (+)
  - "Khấu trừ BH" (+)
- [INV-2.5] **ẨN** 2 khoản "CK liên kết BH — Vật tư" + "CK liên kết BH — Công dịch vụ" — **CONFIRMED Figma**: NEED CONFIRMATION FEAT v15 dòng 98 resolved = ẨN (2 khoản chỉ giảm BH, không sang KH).
- [INV-2.6] Tab bar: **3 tab baseline** — "Bảng chi phí" · "Chứng từ & hoá đơn" · "Lịch sử thanh toán" (BR-INS-STL-DET-007 — ẨN "Hồ sơ bảo hiểm đã xuất" với KH payer). *(Figma drift: vẫn render 4 tab — agent-test-ui verify implementation đúng 3 tab.)*
- [INV-2.7] Action bar: **baseline KH** — chỉ "Thanh toán" (primary). **KHÔNG có** "+ Tạo hồ sơ bảo hiểm" / "Xuất hồ sơ bảo hiểm (PDF)" (BR-INS-STL-DET-007 ẩn hoàn toàn). *(Figma đúng — confirmed.)*

### INV-3 — Variant V3: Phiếu QT KH từ SO không BH (`payerType=CUSTOMER ∧ soHasInsurance=false`) — CR-20260612-01c (rút gọn)

- [INV-3.1] Panel "Tổng giá dịch vụ" — bảng "Chi tiết theo bên thanh toán" hiển thị **đúng 1 cột "Khách hàng thanh toán"** (như V2). *(Figma drift: V3 không có panel — agent-test-ui verify FEAT yêu cầu panel rút gọn.)*
- [INV-3.2] Section "Cân thanh toán" có row "Khách hàng thanh toán" + "Tổng thanh toán" (= V2). *(Figma drift: V3 không render — flag.)*
- [INV-3.3] **KHÔNG có section "Phân bổ Bảo hiểm"** ở bất kỳ vị trí nào trong screen (đặc trưng V3 vs V2). *(Figma confirmed.)*
- [INV-3.4] Tab bar: **3 tab baseline** (như V2 — agent-test-ui verify implementation đúng 3 tab; Figma vẫn 4 tab drift).
- [INV-3.5] Action bar: **baseline KH** (như V2). *(Figma đúng — confirmed.)*

### Common verbatim wording (đúng FEAT v15)

- Section title: **"Phân bổ Bảo hiểm"** (chữ **B hoa** — FEAT AC-6, BR-INS-STL-DET-009). *(Figma mock dùng "Phân bổ bảo hiểm" — b thường; verify implementation theo FEAT B hoa.)*
- Panel title: **"Tổng giá dịch vụ"**.
- Panel subtitle: **"Chi tiết theo bên thanh toán"**.
- Section bottom header: **"Cân thanh toán"** (FEAT AC-11 / BR-INS-STL-DET-009). *(Figma mock "Cần thanh toán" — verify theo FEAT.)*
- Bảng "Chi tiết theo bên thanh toán" rows: "Dịch vụ" · "Phụ tùng" · "VAT" · **"Cộng sau VAT"**.
- Cột giá trị label: **"Bảo hiểm thanh toán"** (V1 only) · **"Khách hàng thanh toán"** (V2/V2alt/V3).
- Row "Cân thanh toán" labels:
  - V1: **"Bảo hiểm thanh toán"** (1 row)
  - V2/V2alt/V3: **"Khách hàng thanh toán"** (1 row)
- Ô tổng: **"Tổng thanh toán"** (giữ ở mọi variant có panel).
- Phân bổ Bảo hiểm rows:
  - V1 (đủ 5): "CK liên kết BH — Vật tư" (`−`) · "CK liên kết BH — Công dịch vụ" (`−`) · "Giảm trừ bồi thường" · "Khấu hao vật tư / thay mới" · "Khấu trừ BH"
  - V2/V2alt (chỉ 3 dấu `+`): "Giảm trừ bồi thường" (+) · "Khấu hao vật tư / thay mới" (+) · "Khấu trừ BH" (+)
  - V3: KHÔNG render.

---

## Figma Drift Notes

> Tổng hợp drift Figma vs FEAT v15 + BR-INS-STL-DET-007/009 — agent-test-ui verify implementation theo **FEAT là nguồn chốt**.

| ID | Item | Figma render | FEAT/BR yêu cầu | Severity |
|---|---|---|---|---|
| D-1 | Section title "Phân bổ ..." casing | "Phân bổ bảo hiểm" (b thường) | "Phân bổ Bảo hiểm" (B hoa) | minor — wording verify |
| D-2 | "Cần thanh toán" vs "Cân thanh toán" header | "Cần thanh toán" | "Cân thanh toán" | minor — wording verify |
| D-3 | V2 + V3 tab bar | 4 tab (incl. "Hồ sơ bảo hiểm đã xuất") | 3 tab baseline (ẩn "Hồ sơ bảo hiểm đã xuất" cho KH payer) | major — BR-INS-STL-DET-007 violation |
| D-4 | V3 panel "Tổng giá dịch vụ" | KHÔNG render panel | Render panel rút gọn (1 cột KH + Cân TT "KH" + "Tổng TT") | major — FEAT AC-6 nhánh 3 |
| D-5 | V1 mã phiếu | "#PHDV-240923-001" (placeholder) | "#SET-{YYYYMMDD}-{NNNNN}" | minor — data placeholder OK trong mock |
| D-6 | V1 action bar | 2 nút body "Tạo hồ sơ bảo hiểm" + "Thanh toán" | 3 nút header "Chỉnh sửa" / "Xuất hồ sơ bảo hiểm (PDF)" / "+ Tạo hồ sơ bảo hiểm" | major — FEAT AC-1 mismatch (carry-over W01) |
| D-7 | V1 dấu "+/−" cho Phân bổ Bảo hiểm 5 khoản | Tất cả `−` | 2 CK liên kết BH `−` chắc chắn; 3 khoản (Giảm trừ / Khấu hao / Khấu trừ) — FEAT không quy định dấu trên phiếu BH | minor — verify BA |
| D-8 | V2 "Khách hàng thanh toán" cell color | `#0052ff` blue | "ô cam" theo FEAT AC-6 (orange) | minor — verify BA visual choice |
| D-9 | Header field set | rút gọn 6 field (Cập nhật / Phiếu DV liên kết / Bảo hiểm chi trả / Ghi chú QT / Tổng tiền / Còn lại) | 6 field FEAT AC-2 (Phiếu DV liên kết / Người tạo / Ngày tạo / Bên thanh toán / Cập nhật lần cuối / Ghi chú QT) | major — FEAT AC-2 mismatch (carry-over W01) |
| D-10 | Accordion "Thông tin khách hàng" + "Thông tin xe" | Collapsed (không bóc được field) | Expanded với 6 field (Tên KH / SĐT / Loại KH / Hãng xe / Biển số / Số km) | minor — visibility state |
| D-11 | "Sửa" button trong Phân bổ Bảo hiểm | `opacity-0` (ẩn) | FEAT chưa quy định nút "Sửa" cho Phân bổ Bảo hiểm | info — verify intent BA |

**Verdict tổng**: Figma đã update CR-20260612-01 ĐẦY ĐỦ cho TÂM CR (panel "Tổng giá dịch vụ" + "Phân bổ Bảo hiểm" + "Cân thanh toán" per variant V1/V2/V3 visibility); các drift còn lại là carry-over W01 (action bar, header, accordion state) hoặc edge case không tâm CR (tab bar visibility cho KH payer, V3 panel).

---

## Pixel-perfect Checklist Status

| Cấp | Trạng thái | Nguồn | Verify by |
|---|---|---|---|
| 1. Screen Inventory | complete | get_metadata (4 variant frame) | FEAT v15 AC-6 + Figma confirmed |
| 2. Component Inventory | complete | get_design_context (V1/V2/V2alt/V3 panel) | FEAT AC-6 + BR-INS-STL-DET-009 + Figma |
| 3. Variant & State | complete | get_design_context per panel + variant frame | FEAT v15 AC-6 (3 variant rules) + Figma confirmed |
| 4. Text Content | complete | get_design_context verbatim | FEAT v15 + Figma drift D-1/D-2 |
| 5. Design Tokens | complete | get_variable_defs | `_ref-mobile-transform-figma.md §1.5` |
| Pixel-perfect (P1-P3 §4) | complete | 1 _full + 8 per-section screenshots | Visual verify against PNGs |
| Interaction states | partial (default-only) | get_design_context (read-only mock) | Mock không show hover/pressed — agent-test-ui verify implementation default + supplement |

### Action items khi run tests

1. agent-test-ui consume oracle này + verify implementation theo **FEAT v15 + BR-INS-STL-DET-007/009 là nguồn chốt**.
2. Drift D-3 (tab bar) + D-4 (V3 panel) + D-6/D-9 (action bar + header) **flag CR Business Authority** nếu implementation theo Figma → vi phạm FEAT.
3. NEED CONFIRMATION resolved (NEED CONFIRMATION FEAT v15 dòng 98 = 2 khoản CK liên kết BH ẨN trên V2 — Figma evidence) — cập nhật FEAT để dứt điểm note.
4. Carry-over W01 drift (D-5/D-6/D-9/D-10) không thuộc tâm W02 — vẫn flag riêng để follow-up W03+ nếu BA quyết sửa Figma.
