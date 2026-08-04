---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13255:177002"
fetched_at: 2026-06-18T13:50:00+07:00
last_updated: 2026-06-18T14:30:00+07:00
oracle_version: 2
mcp_tools_used:
  get_metadata: success (cho new screen 13548:92509 — KH detail)
  get_variable_defs: success (cho 13548:92509)
  get_design_context: skipped (metadata + DEV spec đủ)
  get_screenshot: success (4 PNG: section _full + BH Primary + KH detail mới + panel KH zoom)
data_completeness:
  screen_inventory: complete (thêm KH detail screen vào in-scope)
  component_inventory: complete (BH = pointer wave01; KH = inline 5-cấp)
  variant_state: complete (BH variant + KH variant cùng FEAT-INS-STL-DETAIL)
  text_content: complete
  design_tokens: complete (variable_defs success)
  interaction_states: partial (Figma không render hover/focus; verify shadcn baseline)
screenshots:
  - assets/wave02-ins-stl-detail/_full.png
  - assets/wave02-ins-stl-detail/13256-45155-bh-primary.png
  - assets/wave02-ins-stl-detail/13548-92509-kh-detail.png
  - assets/wave02-ins-stl-detail/13548-92615-panel-kh.png
design_vs_feat_notes:
  - "**Update 2026-06-18 (oracle_version 2)**: Designer bổ sung screen KH detail `13548:92509` (tên frame Figma: 'FEAT-INS-STL-DETAIL: Chi tiết phiếu quyết toán khách hàng') — chính thức **trong scope FEAT-INS-STL-DETAIL** (frame name prefix confirm). Trước đó wave02-pointer xếp vào 'KH baseline context only' đã sai. Promote in-scope với full 5-cấp inline."
  - "Section node `13255:177002` chứa 5 top-level frame: 2 variant BH (13256:45155 primary + 13257:465756 variant B) + KH detail screens (13256:46273 + 13354:56440 + 13548:92509). Tất cả 5 đều **thuộc FEAT-INS-STL-DETAIL** (frame name xác nhận)."
  - "BH variant: design wave 02 = wave 01 (no change) — delegate canonical về `wave01-ins-stl-detail-oracle.md`. KH variant 13548:92509: NEW — inline 5-cấp dưới đây."
  - "KH variant `13548:92509` khác BH ở: KHÔNG có Section 'Thông tin bảo hiểm' (BH-specific block); Panel 'Tổng giá dịch vụ' (AC-6) render mode `no-insurance` — 2 cột (Khoản mục + Khách hàng thanh toán) thay vì 3 cột BH; KHÔNG có AC-4 InsuranceAllocation; 'Cân thanh toán' rút gọn 2 dòng (KH cam + Tổng đen — không có ô BH xanh). Pattern shared với FEAT-INS-STL-CREATE mode `no-insurance` (`wave02-ins-stl-create--panel-oracle.md`)."
  - "AC-2/AC-3 KH variant vẫn render 'Bảo hiểm: Có' (badge in 'Phiếu dịch vụ liên kết' + ô 'Bảo hiểm' trong Thông tin KH&xe) — đây là **thông tin tham chiếu** (KH có bảo hiểm trên hệ thống nhưng chọn pay-out-of-pocket cho phiếu QT này). Verify BA xem logic hiển thị: luôn hiển thị field 'Bảo hiểm' bất kể payer mode?"
  - "Cross-feature: Tab 'Hồ sơ bảo hiểm đã xuất' (BH variant 13257:480949 + empty 13257:481612) tab content thuộc FEAT-INS-DOSSIER-VIEW — xem `wave02-ins-dossier-view-oracle.md`."
  - "AC mapping (FEAT-INS-STL-DETAIL): AC-1 Header + actions · AC-2 Thông tin quyết toán · AC-3 Thông tin KH&xe · AC-4 Tab navigation · AC-5 Bảng chi phí · AC-6 Panel 'Tổng giá dịch vụ' read-only · AC-7 Tab Chứng từ & hoá đơn · AC-8 Tab Hồ sơ bảo hiểm đã xuất (→ DOSSIER-VIEW) · AC-9 Tab Lịch sử thanh toán."
---

# Oracle — FEAT-INS-STL-DETAIL (web) · wave 02 (single-mode pointer)

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13255:177002`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Section chứa **5 frame** (2 BH + 3 KH baseline context)
> cho FEAT-INS-STL-DETAIL. **Wave 02 design = Wave 01 design** (registry simplification, không
> phải design change). agent-test-ui dùng wave01 oracle làm canonical.

---

## Screen Inventory

| Screen state | nodeId | size | source | screenshot |
|---|---|---|---|---|
| Chi tiết phiếu QT BH — Primary (canonical BH) | 13256:45155 | 1440×2584 | wave01-ins-stl-detail-oracle.md (pointer) | assets/wave02-ins-stl-detail/13256-45155-bh-primary.png |
| Chi tiết phiếu QT BH — Variant B (state tab khác) | 13257:465756 | 1440×1168 | wave01-ins-stl-detail-oracle.md (pointer) | (không re-shoot — verify wave01 oracle Tab "Lịch sử thanh toán" empty) |
| **Chi tiết phiếu QT KH — Detail (NEW 2026-06-18)** | **13548:92509** | **1440×2052** | **inline 5-cấp (oracle_version 2)** | **assets/wave02-ins-stl-detail/13548-92509-kh-detail.png** |
| Chi tiết phiếu QT KH — Variant context 1 | 13256:46273 | 1440×1168 | KH baseline reference (state khác) | (không re-shoot) |
| Chi tiết phiếu QT KH — Variant context 2 | 13354:56440 | 1440×2244 | KH baseline reference | (không re-shoot) |

> Section full canvas (5 frames laid out): assets/wave02-ins-stl-detail/_full.png — 7850×3126 (panoramic).

### Section-container in-scope cho KH detail screen 13548:92509

| Section | nodeId | size | screenshot |
|---|---|---|---|
| Nhóm A — Header + AC-2 Thông tin QT + AC-3 Thông tin KH&xe | 13548:92513 | 1216×480 | (subset của 13548-92509-kh-detail.png) |
| AC-1 Header phiếu QT + thanh hành động | 13688:111703 (instance) | 1216×80 | — |
| AC-2 Khối "Thông tin quyết toán" | 13548:92515 | 1216×172 | — |
| AC-3 Khối "Thông tin khách hàng & xe" | 13548:92576 | 1216×164 | — |
| Nhóm B — 4 tab nội dung | 13548:92606 | 1216×1364 | — |
| AC-4 Bộ 4 tab navigation | 13548:92607 (instance) | 1216×56 | — |
| AC-5 Tab "Bảng chi phí" — bảng hạng mục | 13548:92608 | 1216×792 | — |
| AC-6 Tab "Bảng chi phí" — panel "Tổng giá dịch vụ" (mode no-insurance) | 13548:92615 | 600×468 | assets/wave02-ins-stl-detail/13548-92615-panel-kh.png |

---

## Pointer to canonical oracle (wave01)

### BH Primary screen (Tab "Bảng chi phí" canonical)
- **Canonical**: `Product/ux/figma-test-web/wave01-ins-stl-detail-oracle.md`
- Covers:
  - AC-1 Header (mã phiếu + Badge "Chờ thanh toán" + 3 action button)
  - AC-2 Khối "Thông tin quyết toán" (13256:45161)
  - AC-3 Khối "Thông tin khách hàng & xe" (13256:45222)
  - AC-4 TabNav 4 tab (Bảng chi phí | Chứng từ & hoá đơn | Lịch sử thanh toán | Hồ sơ bảo hiểm đã xuất)
  - AC-5 Tab "Bảng chi phí" bảng line-item 12 cột (13262:56411)
  - AC-6 Panel "Tổng giá dịch vụ" right column (13257:550593) — read-only mirror SO-ADJ Nhóm C
  - AC-7 Tab "Chứng từ & hoá đơn" empty
  - AC-8 Tab "Hồ sơ bảo hiểm đã xuất" (link → FEAT-INS-DOSSIER-VIEW)
  - AC-9 Tab "Lịch sử thanh toán" empty/populated

### Cross-feature delegate
- AC-8 Tab content "Hồ sơ bảo hiểm đã xuất" → **wave02-ins-dossier-view-oracle.md** (DOSSIER-VIEW scope)
- AC-6 Panel pattern (allocation sign/color) → mirror wave02-ins-stl-create--fullscreen-a5-oracle.md (panel cùng component shared SO-ADJ/STL-CRE/STL-DETAIL)

---

## Component / Variant / Text / Tokens — BH variant

> **DELEGATE**: Toàn bộ 5 cấp conformance cho BH variant → `wave01-ins-stl-detail-oracle.md`.
> Wave 02 không duplicate content (tránh drift). Wave-pointer pattern cùng style DEV spec
> `wave02-ins-stl-detail.md`.

---

## Component / Variant / Text / Tokens — KH variant (13548:92509) · inline

### Component Inventory

#### Section: Nhóm A — Header + Thông tin chung (13548:92513) — 1216×480
- **AC-1 Header** × 1 (instance Header phiếu QT + thanh hành động, 1216×80)
  - Button (Ghost, icon back) × 1 · Heading × 1 (mã phiếu) · Badge × 1 (trạng thái thanh toán)
  - Button × 2-3 action bar (Chỉnh sửa / Xuất PDF / Tạo hồ sơ bảo hiểm) — verify per AC-1 KH
- **AC-2 Thông tin quyết toán** × 1 (13548:92515)
  - Title text × 1 (1216×48)
  - Phiếu dịch vụ liên kết khối × 1 (1216×124) gồm 2 Content rows × 4 column:
    - Row 1 (1216×52): Service Note (cột 1) · Payer + Badge (cột 2) · Creator (cột 3) · Creation Date (cột 4)
    - Row 2 (1216×48): Last Updated (cột 1) · Settlement Note (cột 2 wide 900px) · Bảo hiểm = "Có" (cột nested cuối)
- **AC-3 Thông tin khách hàng & xe** × 1 (13548:92576)
  - Title text × 1 (1216×44)
  - Section × 1 (1216×120) gồm 2 Content rows × 4 column:
    - Row 1 (1216×48): Customer Name · Phone Number · Customer Type · Bảo hiểm = "Có"
    - Row 2 (1216×48): License Plate · Car Type · Car Brand · Kilometers Driven

#### Section: Nhóm B — 4 tab nội dung (13548:92606) — 1216×1364
- **AC-4 TabNav** × 1 (instance, 1216×56) — 4 tab giống BH variant: Bảng chi phí | Chứng từ & hoá đơn | Lịch sử thanh toán | Hồ sơ bảo hiểm đã xuất
- **AC-5 Tab "Bảng chi phí" — bảng hạng mục** × 1 (13548:92608, 1216×792)
  - "Dịch vụ thực hiện" section × 1 (1216×384): Title text + Service details table (12 cột giống BH)
  - "Phụ tùng sử dụng" section × 1 (1216×384): Title text + Spare part details table
- **AC-6 Panel "Tổng giá dịch vụ"** × 1 (13548:92615, 600×468) — **mode `no-insurance`**:
  - Title text × 1 (600×44) "Tổng giá dịch vụ"
  - "Payer details" header × 1 (600×36, BG muted) — text "Chi tiết theo bên thanh toán"
  - Columns table × 1 (600×248) — **2 cột visible** (400 Khoản mục + 200 Khách hàng thanh toán), 5 rows (header + 4 data)
  - "Payment required" header × 1 (600×36, BG muted) — text "Cân thanh toán"
  - Footer Row 1 × 1 (600×52): cell label 400px + cell value 200px — "Khách hàng thanh toán" cam
  - Footer Row 2 × 1 (600×52): cell label 400px + cell value 200px — "Tổng thanh toán" đen

### Variant & State

#### Screen variant
- **BH** (13256:45155, có Section "Thông tin bảo hiểm" + Panel 3 cột + AC-4 InsuranceAllocation)
- **KH** (13548:92509, KHÔNG Section "Thông tin bảo hiểm" + Panel 2 cột + KHÔNG AC-4)
- states observed: cả 2

#### Panel "Tổng giá dịch vụ" mode
- variants: `full-insurance` (BH — 3 cột + AC-4 + AC-5 3 ô) · `no-insurance` (KH — 2 cột + AC-5 2 dòng)
- states observed: KH variant render `no-insurance` (verify in screenshot)

#### AC-2/AC-3 field "Bảo hiểm"
- variants: "Có" (KH có BH trên hệ thống) · "Không" (verify với BA)
- states observed: KH variant render "Có" (informational — KH chọn pay-out-of-pocket)

### Text Content — KH variant (13548:92509)

#### Section: AC-2 Thông tin quyết toán (13548:92515)
- "Thông tin quyết toán" (title text)
- "Phiếu dịch vụ liên kết" (sub-section heading)
- "Service Note" (label — vị trí cột 1 Row 1)
- "Service ID" (label sub-row)
- "Payer" (label cột 2 Row 1)
- "Creator" (label cột 3)
- "Creation Date" (label cột 4)
- "Last Updated" (label cột 1 Row 2)
- "Settlement Note" (label cột 2 wide Row 2)
- "Bảo hiểm" (label cột cuối Row 2)
- "Có" (value field Bảo hiểm)

#### Section: AC-3 Thông tin KH&xe (13548:92576)
- "Thông tin khách hàng & xe" (title text)
- "Customer Name" (label cột 1 Row 1)
- "Phone Number" (label cột 2)
- "Customer Type" (label cột 3)
- "Bảo hiểm" (label cột 4)
- "Có" (value)
- "License Plate" (label cột 1 Row 2)
- "Car Type" (label cột 2)
- "Car Brand" (label cột 3)
- "Kilometers Driven" (label cột 4)

#### Section: AC-4 TabNav
- "Bảng chi phí" · "Chứng từ & hoá đơn" · "Lịch sử thanh toán" · "Hồ sơ bảo hiểm đã xuất"

#### Section: AC-5 Bảng chi phí
- "Dịch vụ thực hiện" (title section 1)
- "Phụ tùng sử dụng" (title section 2)

#### Section: AC-6 Panel "Tổng giá dịch vụ" (13548:92615)
- "Tổng giá dịch vụ" (panel title)
- "Chi tiết theo bên thanh toán" (Payer details header — muted) — verify exact wording trong screenshot
- "Khoản mục" (col 1 header)
- "Khách hàng thanh toán" (col 2 header — right-aligned)
- "Dịch vụ" / "Phụ tùng" / "VAT" / "Cộng sau VAT" (4 row labels col 1)
- "Cân thanh toán" (Payment required header — muted)
- "Khách hàng thanh toán" (Footer Row 1 label — cam)
- "Tổng thanh toán" (Footer Row 2 label — đen)

### Design Tokens — KH variant (13548:92509)

#### Page-level layout
- colors:
  - Page content BG: `#ffffff` → `bg-background` (token `base/background`)
  - Section heading text: `#18181b` → `text-foreground` (token `base/foreground`)
  - Field label muted: `#71717a` → `text-muted-foreground` (token `base/muted-foreground`)
  - Section border: `#e4e4e7` → `border-border` (token `base/border`)
- typography:
  - Section title text: 18px / lh 28px / weight 600 → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
  - Field label: 14px / weight 500 → `text-sm font-medium` (token `text small/leading-normal/medium`)
  - Field value: 14px / weight 400 → `text-sm` (token `text small/leading-normal/regular`)
- spacing:
  - PageContainer width: 1280px (80px margin) → `w-[1280px]`
  - PageContainer padding inner: 32px gutter → `px-8` (token `spacing/8`)
  - Nhóm A → Nhóm B gap: 32px → `gap-8` (Section block 480 + 512 offset)
  - Info row column gap: ~16px (4 cột × 292px wide + gap) → `gap-4` (token `spacing/4`)
  - Field label → value gap: 8px (28 - 20 = 8) → `gap-2` (token `spacing/2`)

#### Section: AC-6 Panel "Tổng giá dịch vụ" KH variant (13548:92615) — 600×468
- colors:
  - Panel BG: `#ffffff` → `bg-background`
  - Panel border: 1px solid `#e4e4e7` → `border-border`
  - Header section BG (Payer details + Payment required): `#f4f4f5` → `bg-muted` (token `base/accent` / `base/muted`)
  - Header section text: `#71717a` → `text-muted-foreground`
  - Footer Row 1 cell "Khách hàng thanh toán" BG: `#fff7ed` → `bg-background-warning` (token `base/background-warning`)
  - Footer Row 1 cell text: `#ea580c` → `text-foreground-warning` (token `base/foreground-warning`)
  - Footer Row 2 cell "Tổng thanh toán" BG: `#ffffff` → `bg-background`
  - Footer Row 2 cell text: `#18181b` (label semibold + value bold)
- typography:
  - Panel title: 18px / weight 600 → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
  - Header section text: 14px / weight 500 / leading 1 → `text-sm font-medium`
  - Table head: 14px / weight 500 → `text-sm font-medium`
  - Table cell: 14px / weight 400 → `text-sm`
  - Footer Row 1 label: 14px / weight 500 → `text-sm font-medium`
  - Footer Row 1 value: 18px / weight 600 → `text-lg font-semibold`
  - Footer Row 2 label "Tổng thanh toán": 14px / weight 600 → `text-sm font-semibold`
  - Footer Row 2 value Tổng: 18px / weight 700 → `text-lg font-bold` (token `text small/leading-normal/bold`)
- spacing:
  - Panel padding inner: 0 (sections sát nhau)
  - Title row padding: 8/8 (verify with zoom screenshot)
  - Header section padding: 8/8 → `px-2 py-2` (token `spacing/2`)
  - Cell padding: ~8/8 hoặc 12/16 (verify with screenshot)
- radius:
  - Panel: 8px → `rounded-lg` (token `border radius/lg`)
- size:
  - Panel: 600×468 → `w-[600px] h-[468px]`
  - Title row: 600×44 → `h-11`
  - Header section: 600×36 → `h-9` (token `height/h-9`)
  - Columns table: 600×248 (2 cols: 400+200)
  - Footer Row 1/2: 600×52 each → `h-13`
  - Col 1 "Khoản mục": 400px → `w-[400px]`
  - Col 2 "Khách hàng": 200px → `w-[200px]`

---

## Screenshots
> assets/wave02-ins-stl-detail/
- `_full.png` — Section full canvas 5 frames laid out (13255:177002, 7850×3126)
- `13256-45155-bh-primary.png` — BH Primary canonical (13256:45155, 1440×2584)
- `13548-92509-kh-detail.png` — **NEW** KH detail screen (13548:92509, 1440×2052)
- `13548-92615-panel-kh.png` — KH variant panel "Tổng giá dịch vụ" zoom (13548:92615, 600×468 — mode no-insurance)
