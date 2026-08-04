---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-65571&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "319:65571"
fetched_at: 2026-06-18T07:07:00+07:00
oracle_version: 1
wave_focus: "CR-20260616-02 — panel Tổng giá dịch vụ 2-cột (Bảo hiểm | Khách hàng)"
screenshots:
  - assets/wave02-ins-so-adjustment/_full.png
  - assets/wave02-ins-so-adjustment/400-23409.png   # AC-9 toàn panel "Tổng giá dịch vụ" (Edit) — drift baseline (W01 layout)
  - assets/wave02-ins-so-adjustment/400-22571.png   # AC-10 "Phân bổ bảo hiểm" card (Edit) — 1 cột, KHÔNG có dấu/màu
  - assets/wave02-ins-so-adjustment/400-23217.png   # AC-9 card "Tổng giá dịch vụ" inner (header + Tabbar + Chi tiết + AC-11)
  - assets/wave02-ins-so-adjustment/400-23231.png   # Tabbar (KH thanh toán | BH thanh toán) — vẫn tồn tại trong Figma
  - assets/wave02-ins-so-adjustment/400-23256.png   # AC-11 "Cần thanh toán" (typo) — 1 dòng KH duy nhất
  - assets/wave02-ins-so-adjustment/400-23266.png   # "Tổng thanh toán" highlight box
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (AC-9 panel `400:23409` + AC-10 card `400:22571`)
  get_screenshot: success (6 section PNGs + 1 _full)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (read-only display — interaction states inherited per widget catalog default; Tabbar 2 variants observed: active/inactive)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (no :focus/:hover/:pressed snapshots — mobile read-only)
figma_drift:
  detected: true
  cr_id: CR-20260616-02
  cr_date: 2026-06-16
  fetched_at: 2026-06-18
  observation: |
    Figma file (App GMS v3 — New Design, file_key nAoFS33sTWj3ctWjZMUDEl, node 319:65571) tại thời điểm
    fetch (2026-06-18) VẪN render layout W01: panel "Tổng giá dịch vụ" 1-cột + Tabbar switch
    "KH thanh toán | BH thanh toán". Section "Cân thanh toán" (typo "Cần thanh toán") chỉ có 1 dòng
    payer (theo tab active). Section "Phân bổ bảo hiểm" 1 cột 5 dòng plain amount KHÔNG có dấu/màu
    +/− phân biệt cột.
  evidence_nodes:
    - "400:23231 (Tabbar) — instance `KH thanh toán ` active (#0052ff bg) + `BH thanh toán` inactive (#595e69 text)"
    - "400:22571 (AC-10 Phân bổ Bảo hiểm) — 5 dòng plain text amount `540.000đ` etc., không có sign/color column"
    - "400:23256 (AC-11 Cân thanh toán) height=48 — chỉ chứa header `Cần thanh toán` + 1 row `Khách hàng thanh toán = 15.000.000đ`"
    - "Tất cả 4 BH-applicable screens (400:23409 Edit, 400:23762 Detail, 555:29938 Edit-alt, 444:29490 Detail-alt) đều có Tabbar + AC-11 height=48 = single-row"
  cr_required_layout: |
    Per PKG-W02 §A5 + FEAT-INS-SO-ADJUSTMENT v25:
    1. GỠ Tabbar — hiển thị 2 cột (Bảo hiểm | Khách hàng) đồng thời.
    2. "Phân bổ Bảo hiểm" 5 dòng × 2 cột — sign `−` xanh cột BH + sign `+` đỏ cột KH (với 3 khoản chuyển sang KH), `—` cho 2 khoản CK liên kết KHÔNG cộng KH.
    3. "Cân thanh toán" 2 dòng song song: "Bảo hiểm thanh toán" (cột BH) + "Khách hàng thanh toán" (cột KH).
    4. "Tổng thanh toán" 1 ô full-width (không split cột).
    5. Section label fix typo "Cần thanh toán" → "Cân thanh toán".
    6. Áp Edit + Detail SO.
  impact_on_oracle: |
    Oracle conformance verdict cho W02 KHÔNG so impl vs Figma trực tiếp — Figma render W01, dev impl W02.
    agent-test-ui verify impl theo:
    a. CR-20260616-02 Conformance invariants I1-I8 (block deterministic dưới body) — authoritative per FEAT + PKG-W02.
    b. Screenshot W01 Figma layout (assets/) chỉ làm REFERENCE-BASELINE để hiểu cấu trúc gốc trước reflow + verify wording/token UNCHANGED items (font, hex, padding, Header H3, Sub S5, Caption C7…).
    c. FEAT-INS-SO-ADJUSTMENT.md v25 §2 AC-9/10/11 + §5 BR + §8 v22 (CR description) + PKG-W02 §A5 = source-of-truth wording + layout.
  follow_up_action: |
    Raise drift trên design channel: yêu cầu Designer update Figma file (319:65571 BH-applicable variants — `400:23409`, `400:23762`, `555:29938`, `444:29490`)
    sang layout 2-cột per CR-20260616-02. Cho đến khi update, oracle này document W01 baseline + CR invariants deterministic.
fallback_for_w02_invariants:
  primary: Execution/work-packages/PKG-W02-insurance-dossier.md §2.0 A5 + §4.1 web/mobile row (CR-20260616-02 description authoritative)
  secondary: Product/features/FEAT-INS-SO-ADJUSTMENT.md §2 AC-9/10/11 + §5 BR-INS-SO-ADJ-005/009 + §8 v22-v25 changelog
  tertiary: Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md §3 (panel "Tổng giá dịch vụ") + §4 Bước 4
  baseline_reference: Product/ux/figma-test-mobile/wave01-ins-so-adjustment-oracle.md (W01 oracle — same node, layout-prior reference)
---

# Oracle — FEAT-INS-SO-ADJUSTMENT (mobile, W02)

> **W02 wave focus**: CR-20260616-02 reflow panel "Tổng giá dịch vụ" — từ **1 cột + Tabbar switch (W01)** sang **2 cột (Bảo hiểm | Khách hàng) dóng thẳng đồng thời** (W02). Display-only. Áp cả Edit + Detail SO.
>
> **FIGMA DRIFT DETECTED** (xem frontmatter `figma_drift`). Figma file fetch ngày 2026-06-18 vẫn render layout W01 — CR chốt 2026-06-16 chưa được Designer update vào file. agent-test-ui treat:
> - **Layout / sign / color / column-stable** → verify per CR-20260616-02 invariants I1-I8 (DETERMINISTIC, dưới Body) + FEAT v25 + PKG-W02 §A5.
> - **Wording UNCHANGED items** (font Inter, hex `#262626`/`#0052ff`/…, header H3 "Tổng giá dịch vụ" / "Phân bổ bảo hiểm" / "Sửa" / "Chi tiết theo bên thanh toán" / "Khoản mục" / "Tổng thanh toán" / 4 dòng "Dịch vụ"/"Phụ tùng"/"VAT"/"Cộng sau VAT") → verify per Figma snapshots (assets/) — đây là REFERENCE-BASELINE.
> - **Wording WORDING-CHANGE** ("Cần thanh toán" → **"Cân thanh toán"**, MỚI: "Bảo hiểm" / "Khách hàng" column headers, MỚI: "Bảo hiểm thanh toán" row) → verify per FEAT v25 + CR-20260616-02 verbatim, KHÔNG theo Figma drift.
> - **Sample amounts trong Figma** (`540.000đ`, `15.000.000đ`, `38.440.000đ`, `45.000.000đ`, etc.) = static W01 mock — KHÔNG dùng làm production reference; sau impl, verify công thức theo FEAT BR §7.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Spec-board full FEAT (overview, 8 màn variants) | `319:65571` | 3581×4813 | `assets/wave02-ins-so-adjustment/_full.png` |
| **Tạo phiếu dịch vụ (Edit) — có BH** (`397:23265`) → panel "Tổng giá dịch vụ" | `400:23409` | 375×632 | `assets/wave02-ins-so-adjustment/400-23409.png` |
| **Tạo phiếu dịch vụ (Edit alt v2) — có BH** | `555:29938` | 375×632 | — (cùng cấu trúc, đã cover qua 400:23409) |
| **Tạo phiếu dịch vụ (Edit) — KHÔNG BH** | (frame `397:25040` / `437:18975` — AC-9 dạng `437:21539` h=438, không có AC-10 card BH) | 375×438 | — (out of CR scope — không có panel "Phân bổ bảo hiểm") |
| **Chi tiết phiếu dịch vụ (Detail) — có BH** | `400:23762` / `444:29490` | 375×632/638 | — (cùng cấu trúc Edit, mirror read-only) |
| **Chi tiết phiếu dịch vụ (Detail) — KHÔNG BH** | `437:23598` h=438 | 375×438 | — (out of CR scope) |

> **Phạm vi CR-20260616-02 trong oracle này**: 4 màn BH-applicable (2 Edit + 2 Detail). Variant KHÔNG-BH KHÔNG render panel "Phân bổ bảo hiểm" — không có 2-cột.

### Sub-section nodes (Edit có-BH, baseline `400:23409` — W01 layout in Figma)

| Section | nodeId | size | screenshot |
|---|---|---|---|
| AC-10 "Phân bổ Bảo hiểm" card (read-only, 1 cột W01) | `400:22571` | 375×216 | `400-22571.png` |
| AC-9 inner card "Tổng giá dịch vụ" (header + Tabbar + Chi tiết 4 dòng + AC-11) | `400:23217` | 375×410 | `400-23217.png` |
| Tabbar (KH | BH) **— retired bởi CR-20260616-02** | `400:23231` | 343×36 | `400-23231.png` |
| AC-11 "Cân thanh toán" (W01: 1 dòng theo tab active) | `400:23256` | 343×48 | `400-23256.png` |
| "Tổng thanh toán" highlight box | `400:23266` | 343×44 | `400-23266.png` |

---

## Component Inventory

### Screen: Edit có-BH panel "Tổng giá dịch vụ" (`400:23409`) — **W01 baseline in Figma + W02 deltas in invariants**

Observed (Figma current — W01 layout):
- **Card 1 — "Phân bổ bảo hiểm" (read-only summary)** (`400:22571`) — bg white, padding 16, gap-16:
  - Header row: H3 text "Phân bổ bảo hiểm" + Button (text+icon "Sửa", icon edit-2 16px, text #0052ff S5)
  - 2 sub-groups (gap-8 giữa group, gap-8 trong group, mỗi dòng justify-between):
    - Group 1 (3 rows): "CK liên kết BH — Vật tư" / "CK liên kết BH — Công dịch vụ" / "Giảm trừ bồi thường" — label C7 + amount B5 (plain, **không sign/color phân cột — W01**)
    - Group 2 (2 rows): "Khấu hao vật tư / thay mới" / "Khấu trừ BH" — label C7 + amount B5
- **Divider strip** (`397:25587`) — bg `#e8e8ea`, full-width 375 × 6px
- **Card 2 — "Tổng giá dịch vụ"** (`400:23217`/`400:23218`) — bg white, padding 16, gap-16:
  - Header row: H3 "Tổng giá dịch vụ" + arrow-down icon 24px opacity-0 (collapse affordance hidden)
  - Inner stack gap-12:
    - Sub-group "Chi tiết theo bên thanh toán" (gap-12):
      - Row header: S5 "Chi tiết theo bên thanh toán" + dummy 0đ opacity-0
      - **Tabbar W01** (`400:23231`) — 2 tab full-width, bg `#f3f4f6`, padding 4, radius 8:
        - Tab 1 (active): bg white, radius 6 (md), px-24 py-4, text B5 #0052ff `KH thanh toán ` (trailing space)
        - Tab 2 (inactive): no bg, text B5 #595e69 `BH thanh toán`
    - Sub-group "Khoản mục table" (gap-8):
      - Row header: S5 "Khoản mục" + dummy 0đ opacity-0
      - 4 row money (gap-8): "Dịch vụ " / "Phụ tùng " / "VAT " / "Cộng sau VAT " — label C7 + amount B5 (mỗi row có dummy frame "Frame 1948756950" wrap amount)
    - Hairline divider (`400:23255`) — full-width 343px, 1px (rotate-180 image)
    - **AC-11 "Cân thanh toán"** (`400:23256`) — gap-8 (W01: chỉ 1 row payer theo tab):
      - Row header: S5 **"Cần thanh toán"** (Figma typo) + dummy 0đ opacity-0
      - 1 row (theo tab active = KH): label C7 "Khách hàng thanh toán" + amount B5 "15.000.000đ"
  - **"Tổng thanh toán" box** (`400:23266`) — bg `#f3f3f4`, radius 8, padding 12, label S5 "Tổng thanh toán" + amount H5/Bold `#0052ff` "38.440.000đ"

### Mobile widget mapping (suggested — agent-test-ui verify với `mobile/gf-garage-app/lib/ui/widgets/`)
- AppButton.textIcon (`button/app_button.dart`, factory `.textIcon`) — "Sửa" button
- TabBar / SegmentedButton custom (Figma `Tabbar` component) — **W02: REMOVE** per I8
- Money-row pattern = `Row(mainAxisAlignment: spaceBetween, children: [labelText, amountText])` (W01) → W02: `Row(children: [Text label, Expanded amountBH, Expanded amountKH])` hoặc layout cha kiểu Table với 3 col
- Highlight box = `Container(decoration: BoxDecoration(color: AppColors.bgSecondary, borderRadius: 8), padding: EdgeInsets.all(12))`
- Divider strip h6 = `Container(height: 6, color: AppColors.bgPrimary)`

### Mobile responsive — narrow-width handling (PKG-W02 §4.1 hint, NOT in Figma static)
- Phone narrow (≤375px width baseline − padding `EdgeInsets.all(16)` ≈ 343px usable): 2 cột amount có thể wrap label multiline hoặc thu gọn nhãn (vd "CK liên kết BH — Vật tư" → "CK BH Vật tư"). agent-test-ui verify NO horizontal overflow / NO ellipsis cụt mất nghĩa.

---

## Variant & State

### `Button` ("Sửa" — text+icon) — verbatim Figma
- variant: text+icon (factory `AppButton.textIcon`), size `small` (h≈36)
- color: text `#0052ff` (Active Primary), icon edit-2 16px primary, bg white, padding 12×8, radius 8, gap 4
- states observed: default only (`:pressed`/`:disabled` not in static Figma — verify per widget catalog default)

### `Tabbar` (`400:23231`) — **W01 ONLY — RETIRED W02**
- variants observed: active (left tab "KH thanh toán" — bg white, text #0052ff) + inactive (right tab "BH thanh toán" — no bg, text #595e69)
- container bg `#f3f4f6` (gray/100), padding 4, radius 8
- inner tab: px-24 py-4, radius 6 (md), text B5 medium
- **W02 invariant I8**: KHÔNG render Tabbar trong panel "Tổng giá dịch vụ" sau CR-20260616-02. Nếu impl giữ Tabbar → conformance miss.

### Money-row (Caption C7 label + Body B5 amount) — UNCHANGED W01→W02 for typography
- W01 Figma: amount plain text `#262626` Body B5 (no sign, no color split)
- **W02 invariant I2 (CR)**: amount split 2 cột BH/KH với sign + color per cột:
  - cột BH: sign `−` + color `AppColors.textSuccessPrimary` (`#15aa2c` / Green/600)
  - cột KH: sign `+` + color `AppColors.textErrorPrimary` (`#ed1f42` / Red base text-Error) cho 3 khoản chuyển KH (Giảm trừ bồi thường / Khấu hao / Khấu trừ BH)
  - cột KH: `—` / 0 cho 2 khoản CK liên kết KHÔNG cộng KH

### "Tổng thanh toán" highlight box — UNCHANGED W01→W02
- bg `#f3f3f4` (Secondary/Neutral 50), radius 8, padding 12
- label S5 "Tổng thanh toán" #262626 + amount H5 Bold `#0052ff`
- W02: **1 ô full-width** (KHÔNG split cột)

---

## Text Content

> Verbatim tiếng Việt. Figma current = W01 baseline. Wording cho W02 (column headers MỚI + section label fix typo) lấy từ FEAT v25 + CR-20260616-02 verbatim.

### Card "Phân bổ bảo hiểm" (`400:22571`) — read-only summary

- "Phân bổ bảo hiểm" *(header — lowercase b, khác panel nhập "Phân bổ quyết toán bảo hiểm")*
- "Sửa" *(edit button label)*
- "CK liên kết BH — Vật tư" *(AC-10 line 1, em-dash `—`)*  → Figma sample amount: `540.000đ`
- "CK liên kết BH — Công dịch vụ" *(AC-10 line 2)*  → `50.000đ`
- "Giảm trừ bồi thường" *(AC-10 line 3)*  → `50.000đ`
- "Khấu hao vật tư / thay mới" *(AC-10 line 4)*  → `45.000.000đ`
- "Khấu trừ BH" *(AC-10 line 5)*  → `5.000.000đ`

### Card "Tổng giá dịch vụ" (`400:23217`)

- "Tổng giá dịch vụ" *(card header H3)*
- "Chi tiết theo bên thanh toán" *(AC-9 section label S5)*
- Tabbar tab 1: `"KH thanh toán "` *(trailing space — active)*
- Tabbar tab 2: `"BH thanh toán"` *(inactive)*
- "Khoản mục" *(table header S5)*
- `"Dịch vụ "` *(row label C7 — trailing space)*  → `540.000đ`
- `"Phụ tùng "` *(row label C7 — trailing space)*  → `50.000đ`
- `"VAT "` *(row label C7 — trailing space)*  → `50.000đ`
- `"Cộng sau VAT "` *(row label C7 — trailing space)*  → `50.000đ`
- **"Cần thanh toán"** *(AC-11 section label S5 — TYPO in Figma, MUST be fixed to **"Cân thanh toán"** per FEAT v25)*
- "Khách hàng thanh toán" *(AC-11 row label C7 — W01: chỉ render theo tab active)*  → `15.000.000đ`
- "Tổng thanh toán" *(highlight box label S5)*
- amount H5 Bold #0052ff: `38.440.000đ`

### W02 wording MỚI (NOT in Figma — CR-20260616-02 + FEAT v25)
- **"Bảo hiểm"** *(column header MỚI, cột trái — S5)*
- **"Khách hàng"** *(column header MỚI, cột phải — S5)*
- **"Bảo hiểm thanh toán"** *(AC-11 row MỚI, cột BH)*  → amount tính theo BR §7
- **"Cân thanh toán"** *(AC-11 section label — fix typo Figma)*

### Wording cross-check FEAT verbatim (NOT in Figma static — verify impl theo FEAT)
- AC-12 warning: "BH thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh"
- AC-14 errors: "Chiết khấu không thể lớn hơn 100%" / "Khấu hao không thể lớn hơn 100%" / "Số tiền vượt quá số lượng cho phép"
- AC-17 popup hoàn thành: "Bảo hiểm thanh toán đang âm — kiểm tra lại các khoản điều chỉnh trước khi hoàn thành"

### Production reference amounts (FEAT BR §7 worked example — KHÔNG phải Figma mock)
- BH thanh toán: `197.680.000đ`
- Khách hàng thanh toán: `35.720.000đ`
- Tổng thanh toán: `233.400.000đ`
- Phân bổ 5 dòng BH (cột BH): `−5.000.000` / `−2.500.000` / `−2.000.000` / `−200.000` / `−520.000`
- Phân bổ 5 dòng KH (cột KH): `—` / `—` / `+2.000.000` / `+200.000` / `+520.000`

---

## Design Tokens

> Tokens lấy từ `get_variable_defs(319:65571)` — file-wide, scope-stable, UNCHANGED W01→W02.

### Colors

| Hex | Figma role | expected token (mobile) |
|---|---|---|
| `#262626` | Base/text-CD Garage (text chính label/header) | `AppColors.textPrimary` |
| `#273243` | Base/text-Primary, Neutral/Text | `Color(0xFF273243)` (no exact semantic match) |
| `#595e69` | Base/text-Secondary, Color/Neutral/700 | `AppColors.textSecondary` |
| `#888c94` | Base/text-Tertiary, Color/Neutral/500 | `AppColors.textTertiary` |
| `#70757e` | Color/Neutral/600 | (no exact) → `Color(0xFF70757E)` |
| `#71717a` | base/muted-foreground | `AppColors.textMutedForeground` |
| `#a0a3a9` | Color/Neutral/400 | — |
| `#b8babf` | Base/text-Quaternary (placeholder) | `Color(0xFFB8BABF)` |
| `#cfd1d4` | Base/text-Disabled | — |
| `#0052ff` | Base/text-Active-Primary-CD Garage, button-Background-Primary, "Tổng thanh toán" amount | `AppColors.textActivePrimary` / `AppColors.buttonBackgroundPrimary` |
| `#0667ff` | CarDoctor/600 | — |
| `#ffffff` | Base/bg-Base, text-White | `AppColors.bgBase` / `AppColors.textWhite` |
| `#e8e8ea` | Base/border-Primary, bg-Primary, Color/Neutral/100 (divider strip h6) | `AppColors.borderPrimary` / `AppColors.bgPrimary` |
| `#f3f3f4` | Base/bg-Secondary, Color/Neutral/50, button-Background-Secondary ("Tổng thanh toán" box bg) | `AppColors.bgSecondary` |
| `#f3f4f6` | tailwind colors/gray/100 (Tabbar container bg) | (no exact) → `Color(0xFFF3F4F6)` |
| `#f9fafb` | Color/Neutral/25 | — |
| `#d1d1d1` | Base/border-Garage | (no exact) → `Color(0xFFD1D1D1)` |
| `#f3f3f4` | Base/border-Secondary | (= Neutral/50) |
| `#ed1f42` | Base/text-Error, bg-Error-Strong → **sign `+` đỏ cột KH** (W02 CR) | `AppColors.textErrorPrimary` |
| `#15aa2c` | Base/text-Success, Color/Green/600 → **sign `−` xanh cột BH** (W02 CR) | `AppColors.textSuccessPrimary` |
| `#f0fdf1` | Base/bg-Success | — |
| `#ff6b00` | Base/text-Warning, bg-Warning-Strong | `AppColors.textWarningPrimary` |
| `#fff8ec` | Base/bg-Warning | — |
| `#2946e7` | Base/text-Processing | — |
| `#ecf0ff` | Base/button-Background-Tertiary DriverPlus | — |
| `#EDF7FF` | Primary CarDoctor/s50 | — |
| `#EAEAEA` | Dark/100 ("Áp dụng tất cả" button bg trong panel nhập — out of CR scope) | (no exact) → `Color(0xFFEAEAEA)` |
| `#fff0f0` | Color/Red/50 | — |

### Typography (Inter; UNCHANGED W01→W02)

| Size/Weight/LH | Figma style name | Dùng ở (current observed) | expected token |
|---|---|---|---|
| 18/700/26 | Heading/H3 | "Phân bổ bảo hiểm" / "Tổng giá dịch vụ" card header | `AppTextStyle.textHeadingH3` |
| 16/700/24 | Heading/H4 | (token in file, not directly observed in panel) | `AppTextStyle.textHeadingH4` |
| 16/600/24 | Subtitle/S4 | (file token) | `AppTextStyle.textSubtitleS4` |
| 14/700/20 | Heading/H5 | "Tổng thanh toán" amount + 14px/Bold | `AppTextStyle.textHeadingH5` |
| 14/600/20 | Subtitle/S5 + 14px/SemiBold | Section labels, "Khoản mục", "Cần thanh toán" (W01 typo), "Sửa", "Tổng thanh toán" label, **column headers "Bảo hiểm"/"Khách hàng" MỚI W02** | `AppTextStyle.textSubtitleS5` |
| 14/500/20 | Body/B5 + 14px/Medium + text small/leading-normal/medium | Tab labels, amount values, money B5 | `AppTextStyle.textBodyB5` |
| 14/400/20 | Caption/C5 + 14px/Regular + text small/leading-normal/regular | (file token) | `AppTextStyle.textCaptionC5` |
| 13/600/18 | Subtitle/S6 | (file token) | `AppTextStyle.textSubtitleS6` |
| 12/600/18 | Subtitle/S7 | (file token) | `AppTextStyle.textSubtitleS7` |
| 12/500/18 | Body/B7 | (file token) | `AppTextStyle.textBodyB7` |
| 12/400/18 | Caption/C7 | Row labels "CK liên kết BH — Vật tư"…, "Dịch vụ"/"Phụ tùng"/"VAT"/"Cộng sau VAT", "Khách hàng thanh toán", "Bảo hiểm thanh toán" (W02 mới) | `AppTextStyle.textCaptionC7` |
| 10/500/14 | Body/B8 | — | `AppTextStyle.textBodyB8` |
| 10/400/14 | Caption/C8 | — | `AppTextStyle.textCaptionC8` |
| 16/500/16 | Regular/None/Medium | — | — |

### Spacing / Radius / Shadow (file vars + observed)

- File-wide spacing tokens: `Spacing - Border/0` = 0, `/4` = 4, `/8` = 8, `/12` = 12, `/16` = 16, `/24` = 24, `/9999` = 9999 (full radius)
- Border radius tokens: `border radius/md` = 6, `border radius/lg` = 8
- Card padding: `EdgeInsets.all(16)` → `AppSizes.spacing16`
- Card content gap: `Gap(16)` (between header row & body); inner sub-group gap `Gap(12)` (Chi tiết group)
- Money rows gap: `Gap(8)` (inter-row)
- Divider strip giữa 2 card: bg `#e8e8ea`, height 6px, full-width 375
- Hairline divider (giữa "Cộng sau VAT" và AC-11): 1px, full-width 343, color suy từ asset Line 204 (border `#e8e8ea` / borderPrimary)
- "Tổng thanh toán" box: padding 12, radius 8, bg `#f3f3f4`
- "Sửa" Button: px-12 py-8, radius 8, gap 4
- Tabbar: padding 4, radius 8 (lg) outer; inner tab radius 6 (md), px-24 py-4
- **W02 INFERRED (no Figma evidence — verify khi Designer update file)**:
  - 2-cột column gap: likely `Gap(AppSizes.spacing16)` or similar (verify)
  - column width: likely `Expanded(flex: 1)` mỗi cột (BH ≈ KH balanced)
- File shadow tokens: `drop 0` = DROP_SHADOW #0000000F offset(0,4) blur8 → `AppShadows.boxShadow` (verify nếu card có elevation)
- File `s2` shadow: DROP_SHADOW combo (#9C9C9C33/1A/14, offset 0,1, radius 20) → menu/dropdown elevation

### Icons (observed in current Figma)

| Figma layer | source (gợi ý mobile) | dùng ở |
|---|---|---|
| `vuesax/linear/edit-2` | `assets/icons/edit-2.svg` (`flutter_svg`) | "Sửa" button (size 16, color `#0052ff`) |
| `vuesax/linear/arrow-down` | `assets/icons/arrow-down.svg` | Card header "Tổng giá dịch vụ" (size 24, **opacity 0** — collapse affordance hidden) |
| Line 204 (image, hairline) | render as `Divider(height: 1, color: AppColors.borderPrimary)` | Giữa "Cộng sau VAT" và AC-11 |

---

## Screenshots

> PNG persisted dưới `Product/ux/figma-test-mobile/assets/wave02-ins-so-adjustment/`. Note: ảnh capture **Figma current = W01 layout** (drift). Dùng làm baseline-reference + verify token/wording UNCHANGED items.

| File | nodeId | size | purpose |
|---|---|---|---|
| `_full.png` | `319:65571` | full spec-board | Tổng quan 8 variants màn FEAT |
| `400-23409.png` | `400:23409` | 375×632 | AC-9 toàn panel "Tổng giá dịch vụ" Edit có-BH (W01 layout) |
| `400-22571.png` | `400:22571` | 375×216 | AC-10 "Phân bổ bảo hiểm" card 1-cột W01 |
| `400-23217.png` | `400:23217` | 375×410 | AC-9 inner card "Tổng giá dịch vụ" (header + Tabbar + Chi tiết + AC-11) |
| `400-23231.png` | `400:23231` | 343×36 | Tabbar W01 (KH active | BH inactive) |
| `400-23256.png` | `400:23256` | 343×48 | AC-11 "Cần thanh toán" W01 (1 row) |
| `400-23266.png` | `400:23266` | 343×44 | "Tổng thanh toán" highlight box |

---

## CR-20260616-02 Conformance Focus

> **Authoritative block** cho agent-test-ui verify implementation panel "Tổng giá dịch vụ" trên Edit + Detail SO sau khi DEV xong A5. Derive deterministic từ FEAT v25 + PKG-W02 §A5 + §6.A demo bước 0 — KHÔNG cần fetch Figma (Figma drift). Sau khi Designer update Figma → invariants vẫn đúng (CR description = source-of-truth wording + layout).

### Invariant I1 — Layout 2-cột column-stable
- [ ] Panel "Tổng giá dịch vụ" hiển thị **3 section đồng thời** (KHÔNG tab switch): "Chi tiết theo bên thanh toán" + "Phân bổ Bảo hiểm" + "Cân thanh toán".
- [ ] Mỗi section có cấu trúc 2 cột: cột trái = **Bảo hiểm**, cột phải = **Khách hàng**.
- [ ] Cột BH và cột KH dóng thẳng theo trục dọc xuyên 3 section (column-stable — cùng width per cột từ "Cộng sau VAT" xuống "Bảo hiểm thanh toán"/"Khách hàng thanh toán").

### Invariant I2 — Section "Phân bổ Bảo hiểm" 5 dòng × 2 cột
- [ ] Render đủ 5 dòng AC-10 (CK Vật tư / CK Công DV / Giảm trừ / Khấu hao / Khấu trừ).
- [ ] Mỗi dòng có 2 cell amount: cell BH + cell KH.
- [ ] **Sign + color per cột** (theo BR §7 + AC-10):
  - CK liên kết BH — Vật tư: BH `−` xanh `#15aa2c` / `AppColors.textSuccessPrimary`; KH `—` / 0 (CK liên kết KHÔNG cộng KH).
  - CK liên kết BH — Công dịch vụ: BH `−` xanh; KH `—` / 0.
  - Giảm trừ bồi thường: BH `−` xanh; KH `+` đỏ `#ed1f42` / `AppColors.textErrorPrimary`.
  - Khấu hao vật tư / thay mới: BH `−` xanh; KH `+` đỏ.
  - Khấu trừ BH: BH `−` xanh; KH `+` đỏ.

### Invariant I3 — Section "Cân thanh toán" 2 dòng + 1 tổng
- [ ] "Bảo hiểm thanh toán" hiển thị ở cột BH (label C7 + amount B5 cùng cột).
- [ ] "Khách hàng thanh toán" hiển thị ở cột KH (label C7 + amount B5 cùng cột).
- [ ] 2 dòng song song đồng thời (NO tab switch như W01).
- [ ] "Tổng thanh toán" = 1 ô full-width (bg `#f3f3f4`, amount `#0052ff` H5/Bold) bên dưới — KHÔNG split theo cột.

### Invariant I4 — Display-only (KHÔNG đổi số liệu, công thức server-side)
- [ ] CR-20260616-02 là display-only (PKG-W02 §A5: "số liệu computed server-side"). KHÔNG có input editable trong panel này.
- [ ] Verify amounts khớp công thức BR §7:
  - BH thanh toán = Cộng sau VAT (BH) − CK liên kết BH (vật tư + công DV) − Giảm trừ bồi thường − Khấu hao − Khấu trừ BH
  - Khách hàng thanh toán = Cộng sau VAT (KH) + Giảm trừ bồi thường + Khấu hao + Khấu trừ BH
  - Tổng thanh toán = BH thanh toán + Khách hàng thanh toán
- [ ] Worked example: BH `197.680.000`đ / KH `35.720.000`đ / Tổng `233.400.000`đ (FEAT BR §7).

### Invariant I5 — Phạm vi 4 màn BH-applicable
- [ ] CR-20260616-02 áp **cả màn Chỉnh sửa SO (Edit có-BH: `400:23409` + `555:29938`)** và **màn Chi tiết SO (Detail có-BH: `400:23762` + `444:29490`)**.
- [ ] CR-20260616-02 KHÔNG áp variant SO KHÔNG-BH (`437:21539` / `437:23598` — không có panel "Phân bổ bảo hiểm").
- [ ] (Áp cả màn Tạo phiếu QT FEAT-INS-STL-CREATE — out of oracle này; verify riêng `wave02-ins-stl-create-oracle.md`.)
- [ ] KHÔNG áp màn chi tiết phiếu QT (CR-20260612-01 — 1 cột per-payer).
- [ ] Mode Detail = read-only 100%. Verify với design: nút "Sửa" trên card "Phân bổ bảo hiểm" có hiển thị ở Detail không (W01 baseline có; theo FEAT v25 Detail = read-only — clarify với design).

### Invariant I6 — Mobile responsive narrow-width
- [ ] Phone narrow (≤375px width): 2 cột amount KHÔNG horizontal overflow.
- [ ] Long label (vd "CK liên kết BH — Công dịch vụ") wrap multiline hoặc thu gọn nhãn — KHÔNG ellipsis cụt mất nghĩa.
- [ ] Column width ratio cân đối (BH ≈ KH) — verify visual.

### Invariant I7 — Wording verbatim (FEAT v25 — fix typo + add MỚI)
- [ ] Header cột MỚI: **"Bảo hiểm"** / **"Khách hàng"** (verbatim, không viết tắt).
- [ ] Section label **"Cân thanh toán"** — fix typo Figma "Cần thanh toán". agent-test-ui flag conformance miss nếu impl render "Cần thanh toán".
- [ ] Row MỚI cột BH: **"Bảo hiểm thanh toán"** — đối xứng với "Khách hàng thanh toán" cột KH.
- [ ] Wording UNCHANGED: "Tổng giá dịch vụ" / "Phân bổ bảo hiểm" / "Sửa" / "Chi tiết theo bên thanh toán" / "Khoản mục" / "Tổng thanh toán" / 4 dòng AC-9 ("Dịch vụ"/"Phụ tùng"/"VAT"/"Cộng sau VAT") / 5 dòng AC-10 ("CK liên kết BH — Vật tư"/"CK liên kết BH — Công dịch vụ"/"Giảm trừ bồi thường"/"Khấu hao vật tư / thay mới"/"Khấu trừ BH") — verbatim.
- [ ] Trailing space trong Figma ("Dịch vụ ", "Phụ tùng ", "VAT ", "Cộng sau VAT ", "KH thanh toán ") — verify impl strip-or-keep theo widget catalog default (Flutter Text mặc định giữ string verbatim).

### Invariant I8 — KHÔNG còn Tabbar / SegmentedButton
- [ ] KHÔNG render Tabbar / SegmentedButton 2 tab "KH thanh toán" | "BH thanh toán" trong panel "Tổng giá dịch vụ" sau W02.
- [ ] Nếu impl vẫn giữ Tabbar → conformance miss CR-20260616-02 (CR mục đích bỏ tab thay bằng 2 cột simultaneous).
- [ ] (Exception: nếu design giữ lại Tabbar cho mục đích khác — flag verify với design trước khi raise bug.)

---

## Pixel-perfect Checklist Status (§4 P1/P2/P3)

> Self-verify Status sau fetch — Figma drift đã document, invariants W02 deterministic. agent-test-ui verify theo CR description + FEAT verbatim, KHÔNG so pixel exact vs Figma drift screenshots.

### P1 — Spacing
- [x] Panel `400:23409` overall padding/gap — captured (16 padding, 16 gap, 8 row gap, 12 sub-group gap).
- [x] Card "Phân bổ bảo hiểm" `400:22571` — padding 16, gap-8 trong group.
- [x] Card "Tổng giá dịch vụ" `400:23217` — padding 16, gap-12.
- [x] Divider strip h=6 between 2 cards.
- [x] Hairline divider 1px between "Cộng sau VAT" và AC-11.
- [x] Tabbar padding 4, inner tab px-24 py-4 (W01 — RETIRED W02).
- [x] "Tổng thanh toán" box padding 12, radius 8.
- [ ] 2-cột column gap + column width (W02 layout) — partial (NOT in Figma current — INFERRED; verify sau khi Designer update).

### P1 — Interaction states
- [x] "Sửa" Button — default observed; `:pressed`/`:disabled` per widget catalog default (not in Figma static).
- [x] Tabbar — active/inactive variants observed (W01 only).
- [x] Money rows — read-only display, no interaction.

### P2 — Typography
- [x] Font family Inter (file token `typography/font family/font-sans`).
- [x] Size + weight + lineHeight per token table (H3 18/700/26, S5 14/600/20, B5 14/500/20, C7 12/400/18, H5 14/700/20).
- [x] Letter-spacing — observed `0` cho mọi token (Figma var defs).

### P2 — Border / radius / small dims
- [x] Card radius 8 (lg), divider strip h=6, hairline 1px, button radius 8, Tabbar outer 8 / inner 6.
- [x] Edit icon 16×16, arrow-down 24×24.
- [ ] Money-row 2-cột border (W02 column-stable visual) — partial (NOT in Figma).

### P3 — Box-shadow / opacity / z-index
- [x] arrow-down icon opacity-0 (hidden collapse affordance).
- [x] Dummy `0đ` opacity-0 (table header spacing placeholders — 3 instances).
- [x] File shadow tokens: `drop 0` (DROP_SHADOW #0000000F y4 blur8), `s2` (DROP_SHADOW combo y1 blur20).

### Text verbatim
- [x] Wording UNCHANGED items captured per Figma current (W01).
- [x] Wording W02 deltas captured per FEAT v25 + CR-20260616-02 (column headers MỚI, "Cân thanh toán" fix typo, "Bảo hiểm thanh toán" row MỚI).
- [x] FEAT AC-12/14/17 messages NOT in Figma — captured for verify.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | TEST (agent-test-ui — `/prefetch-figma-oracle mobile wave 02` re-fetch) | Khởi tạo W02 oracle FEAT-INS-SO-ADJUSTMENT mobile sau khi MCP permission patched. Fetch thành công `get_metadata` / `get_variable_defs` / `get_design_context` (`400:23409`, `400:22571`) / 6 `get_screenshot` per-section. **Figma drift DETECTED**: file (319:65571) vẫn render layout W01 (Tabbar `400:23231` còn, AC-11 `400:23256` height=48 với 1 row "Khách hàng thanh toán" + section label "Cần thanh toán" typo) — CR-20260616-02 (chốt 2026-06-16) chưa được Designer update vào Figma. Oracle document: (a) Figma W01 baseline (component inventory + wording UNCHANGED + tokens + screenshots) làm reference-baseline; (b) CR-20260616-02 invariants I1-I8 deterministic per FEAT v25 + PKG-W02 §A5 (authoritative wording + layout cho impl). agent-test-ui verify W02 theo CR description, KHÔNG theo Figma drift. Follow-up: raise drift trên design channel xin Designer update 4 BH-applicable variants (`400:23409`/`400:23762`/`555:29938`/`444:29490`) sang 2-cột. |
