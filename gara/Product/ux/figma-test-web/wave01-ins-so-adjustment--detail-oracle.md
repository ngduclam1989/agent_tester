---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13270-206807&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13270:206807"
screen_slug: detail
fetched_at: 2026-06-04T08:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success (excludeScreenshot=true — screenshot lấy riêng qua get_screenshot)
  get_screenshot: success
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (màn read-only — không có control tương tác trong scope Nhóm C; đúng kỳ vọng AC-1)
  text_content: complete
  design_tokens: complete
  interaction_states: n/a (Detail = read-only; Nhóm C không có input/button/dropdown để verify hover/focus/disabled/error)
screenshots:
  - assets/wave01-ins-so-adjustment--detail/_full.png
  - assets/wave01-ins-so-adjustment--detail/13270-207614.png
  - assets/wave01-ins-so-adjustment--detail/13270-207618.png
design_vs_feat_notes:
  - "AC-1 (CORRECTION 2026-06-07, PO directive) — màn Chi tiết PHẢI render section 'Phân bổ quyết toán bảo hiểm' (Nhóm B) ở chế độ READ-ONLY: badge 'Bảo hiểm' + footer công thức + 5 khoản điều chỉnh (label + giá trị đã nhập + đơn vị). KHÁC BIỆT vs Edit = chỉ ở chỗ KHÔNG có CONTROL NHẬP (không input editable, không dropdown đơn vị, không nút 'Áp dụng tất cả') — chứ KHÔNG phải vắng section. → agent-test-ui assert PRESENCE của section read-only + assert ABSENCE của control nhập. ⚠ Figma Detail frame `13270:206807` HIỆN CHƯA có section này (verify get_metadata 2026-06-07) → conformance theo FEAT AC-1, KHÔNG theo Figma snapshot; designer phải bổ sung Figma → re-prefetch. Đây là MANUAL OVERRIDE — đảo ngược assertion âm cũ ('Detail không có Nhóm B')."
  - "Phân biệt 2 khối cùng có ở Detail (KHÔNG trùng): (a) section 'Phân bổ quyết toán bảo hiểm' (Nhóm B, read-only) = RECAP 5 giá trị kế toán đã nhập + đơn vị; (b) bảng 'Phân bổ Bảo hiểm' trong panel 'Tổng giá dịch vụ' (Nhóm C, AC-10) = 5 SỐ TIỀN ĐÃ TÍNH dấu ±/màu. Khác nội dung — cùng hiển thị."
  - "AC-10 Phân bổ Bảo hiểm: Figma KHÔNG hiển thị dấu +/− và màu xanh/đỏ (FEAT AC-10 yêu cầu CK liên kết dấu − màu xanh; giảm trừ/khấu hao/khấu trừ dấu + màu đỏ). Tất cả 5 dòng giá trị #18181b (label) / không dấu, value dummy '50.000.000đ'. Giống hệt màn Edit."
  - "AC-11 Cân thanh toán: header Figma ghi 'Cần thanh toán' (typo) — FEAT/BR ghi 'Cân thanh toán'. 3 dòng không có background highlight xanh/cam/đen (FEAT AC-11 mô tả ô xanh/cam/đen); chỉ 'Tổng thanh toán' value tô brand #0052ff 20px. Giống hệt màn Edit."
  - "AC-9 header cột: Figma ghi đầy đủ 'Bảo hiểm thanh toán' / 'Khách hàng thanh toán' (FEAT mô tả cột BH | KH)."
  - "AC-5 read-only: bảng 'Phụ tùng sử dụng' (baseline) có cột 'Khấu hao VT' hiển thị read-only (giá trị '0%' trong design). Ở màn Detail cột này read-only — không nhập được. Verify theo FEAT AC-5/BR-004 (ngoài 2 section pixel-conformance)."
---

# Oracle — FEAT-INS-SO-ADJUSTMENT (web) · wave 01 · màn **Chi tiết (Detail, read-only)**

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13270:206807`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`) — frame **"Chi tiết phiếu dịch vụ - Khách hàng doanh nghiệp - Có bảo hiểm"**.
> Scope conformance = phần **MỚI** của FEAT hiển thị ở màn **Chi tiết (read-only)**: section **"Phân bổ quyết toán bảo hiểm"** (Nhóm B, read-only) + panel **"Tổng giá dịch vụ"** (Nhóm C, read-only).
> Phần baseline (header phiếu, thông tin KH / xe, tab nav, bảng dịch vụ / phụ tùng read-only) đã production — KHÔNG verify pixel ở oracle này.
>
> ⚠️ **MANUAL OVERRIDE (2026-06-07, PO directive)** — Figma Detail frame `13270:206807` **chưa có** section "Phân bổ quyết toán bảo hiểm" (verify `get_metadata` 2026-06-07). Oracle này đảo ngược assertion âm cũ: theo FEAT AC-1, màn Detail **PHẢI** render section đó read-only. Conformance theo **FEAT AC-1**, không theo Figma snapshot; designer bổ sung Figma → re-prefetch để gỡ override.
>
> ⚠️ **Phân biệt với màn Edit** (`wave01-ins-so-adjustment--edit-oracle.md`): màn Edit có **panel input Nhóm B** (nhập 5 khoản) + **panel kết quả Nhóm C**.
> Màn Chi tiết có **cả Nhóm B lẫn Nhóm C nhưng READ-ONLY** — section "Phân bổ quyết toán bảo hiểm" hiển thị giá trị đã nhập nhưng KHÔNG có control nhập. Assertion trọng tâm: (1) **PRESENCE** section read-only; (2) **ABSENCE** control nhập (input editable / dropdown đơn vị / nút "Áp dụng tất cả").

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Chi tiết phiếu dịch vụ — KH doanh nghiệp — Có bảo hiểm (Detail, read-only) | 13270:206807 | 1440×2240 | assets/wave01-ins-so-adjustment--detail/_full.png |

> Layout dọc: Navbar → Page Header (`#PHDV-…` + badge "Báo giá" + nút Hủy / Chỉnh sửa / Thực hiện dịch vụ / Gửi báo giá / In phiếu) →
> "Thông tin dịch vụ và thanh toán" → "Thông tin khách hàng" → "Thông tin xe" → Tab Nav (Dịch vụ & phụ tùng | Thông tin khác | Tài liệu đính kèm | Thông tin liên kết | Lịch sử thanh toán) →
> tab "Dịch vụ & phụ tùng": bảng "Dịch vụ thực hiện" + bảng "Phụ tùng sử dụng" (read-only) → **panel "Tổng giá dịch vụ" (Nhóm C, bên phải dưới)** → **section "Phân bổ quyết toán bảo hiểm" (Nhóm B, read-only, full-width dưới cùng)**.
> Frame là biến thể **KH doanh nghiệp + Bảo hiểm = Có** → cả Nhóm B (recap nhập, read-only) lẫn Nhóm C (kết quả) hiển thị theo AC-1.
> ⚠ Nhóm B read-only **chưa có trong Figma snapshot** — verify theo FEAT AC-1 (xem MANUAL OVERRIDE).

### Section-container in-scope (verify pixel-perfect)

| Section | nodeId | size | screenshot |
|---|---|---|---|
| Nhóm C — Panel "Tổng giá dịch vụ" (toàn bộ, read-only) | 13270:207614 | 600×816 | assets/wave01-ins-so-adjustment--detail/13270-207614.png |
| ↳ AC-9 "Chi tiết theo bên thanh toán" (bảng 3 cột) | 13270:207618 | 600×248 | assets/wave01-ins-so-adjustment--detail/13270-207618.png |
| ↳ AC-10 "Phân bổ Bảo hiểm" (header 13270:207658 + 5 dòng Footer 13270:207660…207674) | — | — | (trong 13270-207614.png) |
| ↳ AC-11 "Cân thanh toán" (header 13270:207675 + 3 dòng Footer 13270:207677…207685) | — | — | (trong 13270-207614.png) |
| Nhóm B — Section "Phân bổ quyết toán bảo hiểm" (READ-ONLY) | ⚠ vắng Figma — mirror Edit `13257:551696` | — | (Edit `13257-551696.png`) |

> Panel Detail (13270:207614) cấu trúc **phẳng** hơn panel Edit (13257:550991): AC-10 / AC-11 là các dòng `Footer` sibling
> (label flex-1 trái + value w-200 phải), không bọc trong container con riêng như màn Edit (13263:56447/56448) → chụp gộp trong PNG panel.

### Section "Phân bổ quyết toán bảo hiểm" (Nhóm B) PHẢI có ở Detail — READ-ONLY (AC-1)

> ⚠ **MANUAL OVERRIDE** — đảo ngược bảng "assertion âm" cũ. Section PHẢI hiển thị read-only; chỉ các **control nhập** mới phải vắng mặt.

| PHẢI hiển thị (read-only) ở Detail | ABSENCE bắt buộc (control nhập) |
|---|---|
| Title "Phân bổ quyết toán bảo hiểm" + Badge "Bảo hiểm" (Success) | — |
| Footer 2 dòng công thức BH/KH thanh toán | — |
| 5 khoản: label + giá trị đã nhập + đơn vị (VND/%) | 5 ô **Input editable** (`I…;65:523`) |
| — | **Dropdown đơn vị** (chevron VND/%) |
| — | Nút **"Áp dụng tất cả"** (Outline, `13257:551706`) |

> Anatomy/token lấy từ Edit Nhóm B (`13257:551696`) — xem oracle `--edit`. agent-test-ui: **FAIL** nếu thiếu section read-only HOẶC nếu render bất kỳ control nhập nào (input editable / dropdown đơn vị / nút "Áp dụng tất cả").

---

## Component Inventory

### Section: Nhóm C — Panel "Tổng giá dịch vụ" (13270:207614) — read-only
- Title text × 1 — "Tổng giá dịch vụ " (heading, **không** có badge/toggle như Nhóm B)
- Section header (text 14px semibold) × 3 — "Chi tiết theo bên thanh toán" / "Phân bổ Bảo hiểm" / "Cần thanh toán"
- Table / Head × 3 — "Khoản mục" (trái) · "Bảo hiểm thanh toán" (phải) · "Khách hàng thanh toán" (phải)
- Table / Cell × (4 hàng × 3 cột) ở AC-9 + (5 dòng × 2) ở AC-10 + (3 dòng × 2) ở AC-11 — **read-only, không control**
- **KHÔNG có** button / input / icon / dropdown / badge trong panel (đặc trưng read-only)

### Section: Nhóm B — "Phân bổ quyết toán bảo hiểm" (READ-ONLY) — ⚠ vắng Figma, theo FEAT AC-1
- Title text × 1 — "Phân bổ quyết toán bảo hiểm" (heading 18px/600) + **Badge "Bảo hiểm"** (Success, #16a34a)
- Footer note × 1 — 2 dòng công thức BH/KH thanh toán (12px muted)
- 5 field read-only × 1 mỗi khoản — Label + giá trị đã nhập + đơn vị (VND/%) + helper text. **KHÔNG** có ô input editable, **KHÔNG** chevron dropdown đơn vị, **KHÔNG** nút "Áp dụng tất cả".
- Anatomy canonical = Edit Nhóm B `13257:551696` (biến thể read-only). agent-test-ui assert **PRESENCE** section + **ABSENCE** control nhập.

### Read-only context (baseline — KHÔNG verify pixel, chỉ xác nhận trạng thái)
- Bảng "Phụ tùng sử dụng" có cột **"Khấu hao VT"** hiển thị read-only (design dummy "0%") — cột AC-5 per-dòng phụ tùng ở chế độ xem.
- Bảng "Dịch vụ thực hiện" + "Phụ tùng sử dụng": toàn bộ cell read-only (không input, không nút Đặt hàng active — nút "Đặt hàng" disabled).

---

## Variant & State

### Toàn màn = READ-ONLY
- Panel Nhóm C + section Nhóm B đều không chứa component **interactive** → **không có** state hover/focus/pressed/disabled/error để observe (đúng kỳ vọng AC-1 read-only).
- Table / Head: bg `#f4f4f5` (base/accent), border-b `#e4e4e7` — state tĩnh.
- Table / Cell (AC-10 / AC-11): bg `rgba(255,255,255,0.5)` (alpha/50) — state tĩnh.
- "Tổng thanh toán" value: 20px / 600, color brand `#0052ff` — state tĩnh (nhấn mạnh tổng).
- Nhóm B (read-only): Badge "Bảo hiểm" (Success) là **hiển thị tĩnh** (không phải toggle); 5 khoản chỉ là text giá trị + đơn vị (không có ô nhập/dropdown).

> ⚠️ Phân biệt **read-only ≠ vắng mặt**: section Nhóm B PHẢI hiển thị (giá trị đã nhập) NHƯNG KHÔNG có **control nhập**.
> Nếu implementation render bất kỳ **ô input editable / nút "Áp dụng tất cả" / dropdown đơn vị** ở màn Detail → **FAIL** (sai chế độ read-only).
> Nếu implementation **thiếu** section "Phân bổ quyết toán bảo hiểm" read-only ở màn Detail (khi Bảo hiểm = Có) → **FAIL** (vi phạm AC-1).

---

## Text Content

### Section: Nhóm C — Panel "Tổng giá dịch vụ" (13270:207614)
- "Tổng giá dịch vụ "              ← tiêu đề panel (có khoảng trắng đuôi trong design)
- "Chi tiết theo bên thanh toán"   ← header AC-9
- "Khoản mục" · "Bảo hiểm thanh toán" · "Khách hàng thanh toán"   ← 3 header cột AC-9
- "Dịch vụ " · "Phụ tùng " · "VAT " · "Cộng sau VAT"   ← 4 dòng AC-9 (dòng "Cộng sau VAT" in đậm `font-semibold`)
- "Phân bổ Bảo hiểm"               ← header AC-10
- "CK liên kết BH — Vật tư" · "CK liên kết BH — Công dịch vụ" · "Giảm trừ bồi thường" · "Khấu hao vật tư / thay mới" · "Khấu trừ BH"   ← 5 dòng AC-10
  - ⚠ label "Khấu trừ BH" render `Inter:Regular` (400) trong design — 4 label còn lại `Inter:Medium` (500). Sai khác nhỏ trong Figma.
- "Cần thanh toán"                 ← header AC-11 (⚠ Figma typo — FEAT: "Cân thanh toán")
- "Bảo hiểm thanh toán" · "Khách hàng thanh toán" · "Tổng thanh toán"   ← 3 dòng AC-11 ("Tổng thanh toán" in đậm + giá trị brand)
- Giá trị dummy trong design (data-bound, **KHÔNG verify số**): AC-9 BH "95.040đ/95.040đ/95.040đ/50.000đ", KH "0đ/95.040đ/95.040đ/95.040đ"; AC-10/AC-11 mọi dòng "50.000.000đ". → verify format hiển thị `{số}đ` + canh phải, KHÔNG verify con số cụ thể.

### Section: Nhóm B — "Phân bổ quyết toán bảo hiểm" (READ-ONLY) — ⚠ vắng Figma, text theo FEAT AC-1 + Edit
- "Phân bổ quyết toán bảo hiểm"    ← tiêu đề section + Badge "Bảo hiểm"
- Công thức (2 dòng): "BH thanh toán = phần bảo hiểm duyệt sau chiết khấu liên kết - giảm trừ bồi thường - khấu hao vật tư - khấu trừ bảo hiểm." / "KH thanh toán = phần KH tự trả trên bảng + các khoản bị loại trừ chuyển sang KH."
- 5 nhãn khoản: "Chiết khấu liên kết BH - Vật tư" · "Chiết khấu liên kết BH - Công dịch vụ" · "Khấu hao vật tư / thay mới" · "Giảm trừ bồi thường" · "Khấu trừ bảo hiểm"
- Mỗi khoản: giá trị đã nhập + đơn vị ("vnđ" cho VND, "%" cho khoản %) — data-bound, **KHÔNG verify số**, chỉ verify có hiển thị giá trị read-only (không ô nhập).

### Read-only context text (baseline — verify wording nếu trong scope test, không pixel)
- Header: "#PHDV-20240723-001" + badge "Báo giá" · nút "Hủy" / "Chỉnh sửa" / "Thực hiện dịch vụ" / "Gửi báo giá" / "In phiếu"
- "Thông tin dịch vụ và thanh toán": "Loại phiếu" → "Phiếu dịch vụ (Sửa chữa)" · "Thời gian dự kiến giao xe" → "10:00 20/01/2026" · "Tổng tiền" → "--" · "Trạng thái thanh toán" → badge "Chưa thanh toán"
- "Thông tin khách hàng": "Tên khách hàng" → "Nguyễn Minh Tâm" · "Số điện thoại" → "0942328562" · "Loại khách hàng" → "Tổ chức" · "Bảo hiểm" → "Có"
- "Thông tin xe": "Biển số xe" → "25B2-09284" · "Dòng xe" → "Camry" · "Hãng xe" → "Toyota" · "Số km đã chạy" → "1.000"
- Tab Nav: "Dịch vụ & phụ tùng" · "Thông tin khác" · "Tài liệu đính kèm" · "Thông tin liên kết" · "Lịch sử thanh toán"
- Bảng "Dịch vụ thực hiện" header: STT · Tên dịch vụ · Bên thanh toán · Người thực hiện · Đơn giá · Số lượng · Chiết khấu · Thuế · Thành tiền
- Bảng "Phụ tùng sử dụng" header: STT · Tên phụ tùng · Bên thanh toán · Phân khúc · Đơn vị tính · Đơn giá · Số lượng · Chiết khấu · **Khấu hao VT** · Thuế · Thành tiền

---

## Design Tokens

### Section: Nhóm C — Panel "Tổng giá dịch vụ" (13270:207614)
- typography:
  - Tiêu đề "Tổng giá dịch vụ": 18px / 600 / lh 28px / Inter → `text-lg font-semibold` · color `#18181b` → `text-foreground`
  - Section header (3 cái): 14px / 600 / lh 20px → `text-sm font-semibold` · color `#000000` (Color/Base/black)
  - Table Head: 14px / 500 / lh 20px → `text-sm font-medium` · `#18181b`
  - Table Cell label (AC-9 Dịch vụ/Phụ tùng/VAT): 14px / 400 / lh 20px → `text-sm` · `#18181b`
  - Table Cell label (AC-10/AC-11): 14px / 500 / lh 20px → `text-sm font-medium` · `#18181b` (riêng "Khấu trừ BH" = 400)
  - "Cộng sau VAT" / "Tổng thanh toán" label: 14px / 600 → `text-sm font-semibold`
  - Table Cell value: 14px / 500 / lh 20px → `text-sm font-medium` · `#000000`, canh phải (`text-right`)
  - "Tổng thanh toán" value: **20px / 600 / lh 28px** → `text-xl font-semibold` · color `#0052ff` → `text-primary` (brand, token `base/foreground-brand-CD`)
- colors:
  - Table Head bg `#f4f4f5` → `bg-accent` · border-b `#e4e4e7` → `border`
  - Row AC-10/AC-11 bg `rgba(255,255,255,0.5)` (token alpha/50 `#ffffff80`) · border-b cuối nhóm AC-10 (sau "Khấu trừ BH") `#e4e4e7`
  - Value mặc định `#18181b`/`#000000`; "Tổng thanh toán" `#0052ff`
- spacing:
  - Title `Title text`: pb=16 (`pb-4`, spacing/4), gap=8 (spacing/2)
  - Section header container ("Payer details"/"Insurance distribution"/"Payment required"): p=8 (`p-2`), text width 250px
  - Table Head: h=40 (`h-10`, height/h-10), px=8 (`px-2`), gap=10
  - Table Cell: h=52, p=8 (`p-2`), min-w 85px; cột giá trị w=200 (`w-[200px]`), cột "Khoản mục" flex-1
  - AC-10/AC-11 Footer row: label cell flex-1 (canh trái), value cell w=200 (canh phải)
- radius / shadow: panel không bo góc riêng / không shadow (table phẳng, chỉ border-b phân cách nhóm)
- ⚠ Token cho **control nhập** (input editable / dropdown đơn vị / nút) **KHÔNG áp dụng** ở Detail (read-only). Token cho **section Nhóm B read-only** (Title 18px/600, Badge Success #16a34a, label 14px, helper muted) lấy từ oracle `--edit` (Nhóm B `13257:551696`).

---

## Screenshots
> assets/wave01-ins-so-adjustment--detail/  (folder riêng theo screen — split mode; oracle `--edit` dùng folder `--edit/`)
- `_full-detail.png` — toàn màn "Chi tiết phiếu dịch vụ" (frame 13270:206807, 926×1440 scaled) — ⚠ snapshot này VẮNG section Nhóm B read-only (Figma gap); section phải có theo AC-1, anatomy tham chiếu Edit `13257-551696.png`
- `13270-207614.png` — Section Nhóm C: Panel "Tổng giá dịch vụ" read-only (toàn bộ 3 khối)
- `13270-207618.png` — AC-9: bảng "Chi tiết theo bên thanh toán" (3 cột × 4 dòng)

---

## Coverage notes (oracle — non-blocking)
- **Scope verify** = section "Phân bổ quyết toán bảo hiểm" (Nhóm B, read-only) + panel "Tổng giá dịch vụ" (Nhóm C) read-only. Khối baseline (header phiếu, thông tin KH/xe, tab nav, bảng dịch vụ/phụ tùng) = production, ngoài phạm vi pixel-conformance.
- **Assertion trọng tâm (AC-1) — ĐÃ ĐẢO (MANUAL OVERRIDE 2026-06-07)**: ở màn Detail **PHẢI** render section "Phân bổ quyết toán bảo hiểm" (Nhóm B) ở chế độ **read-only** (badge "Bảo hiểm" + công thức + 5 khoản giá trị đã nhập). agent-test-ui verify: (1) **PRESENCE** section read-only — thiếu = FAIL (vi phạm AC-1); (2) **ABSENCE control nhập** — render input editable / dropdown đơn vị / nút "Áp dụng tất cả" = FAIL (sai read-only). ⚠ Figma Detail frame chưa có section → verify theo FEAT AC-1, không theo Figma snapshot.
- **AC-1 hiển thị có điều kiện** (toggle Bảo hiểm = Có): frame Detail là biến thể "Có bảo hiểm" → cả Nhóm B (read-only) lẫn Nhóm C hiển thị. State "Không bảo hiểm" (ẩn cả 2) không có frame Figma → verify theo UX-FLOW + production baseline.
- **AC-12** (cảnh báo "BH thanh toán" âm): không có state cảnh báo trong frame Figma read-only → verify theo FEAT AC-12 + UX-FLOW (state động).
- **AC-5 cột "Khấu hao VT"** read-only trên bảng phụ tùng: nằm trong bảng baseline, ngoài 2 section pixel-conformance — verify theo FEAT AC-5/BR-004.
- **Figma gap (Nhóm B vắng)**: section "Phân bổ quyết toán bảo hiểm" read-only chưa có trong Figma Detail frame `13270:206807` → MANUAL OVERRIDE theo FEAT AC-1; designer bổ sung Figma → re-prefetch để gỡ override. Anatomy/token tham chiếu Edit Nhóm B `13257:551696`.
- 3 design-vs-FEAT discrepancy còn lại (dấu+màu AC-10, highlight ô + typo "Cần thanh toán" AC-11, header cột AC-9) ghi ở frontmatter `design_vs_feat_notes` — agent-test-ui đối chiếu cả Figma fact lẫn FEAT AC khi ra verdict. Các discrepancy AC-10/AC-11 **đồng nhất** với oracle `--edit` (cùng component panel "Tổng giá dịch vụ").
