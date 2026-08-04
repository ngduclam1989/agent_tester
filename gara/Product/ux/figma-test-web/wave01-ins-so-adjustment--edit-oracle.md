---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:469505"
screen_slug: edit
fetched_at: 2026-06-04T07:35:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: success
  get_screenshot: success
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete
  design_tokens: complete
  interaction_states: partial (Figma chỉ có state Default — không có variant hover/focus/disabled/error trong frame đã chụp)
screenshots:
  - assets/wave01-ins-so-adjustment--edit/_full.png
  - assets/wave01-ins-so-adjustment--edit/13257-551696.png
  - assets/wave01-ins-so-adjustment--edit/13257-550991.png
  - assets/wave01-ins-so-adjustment--edit/13263-56449.png
  - assets/wave01-ins-so-adjustment--edit/13263-56447.png
  - assets/wave01-ins-so-adjustment--edit/13263-56448.png
design_vs_feat_notes:
  - "AC-5/AC-7 đơn vị: Figma hiển thị MỌI 5 trường nhập (kể cả Khấu hao + Khấu trừ BH) với suffix 'vnđ' + dropdown arrow. FEAT AC-5 nói Khấu hao nhập theo % (không có VND), AC-7 nói Khấu trừ chỉ VND (không dropdown). → Figma design hiện chưa phân biệt unit theo từng khoản. Oracle ghi fact Figma; verdict theo FEAT khi test."
  - "AC-10 Phân bổ Bảo hiểm: Figma KHÔNG hiển thị dấu +/− và màu xanh/đỏ (FEAT AC-10 yêu cầu CK liên kết dấu − màu xanh; giảm trừ/khấu hao/khấu trừ dấu + màu đỏ). Tất cả 5 dòng giá trị màu #18181b, không dấu."
  - "AC-11 Cân thanh toán: header Figma ghi 'Cần thanh toán' (typo) — FEAT/BR ghi 'Cân thanh toán'. 3 ô không có background highlight xanh/cam/đen (FEAT AC-11 mô tả ô xanh/cam/đen); chỉ giá trị 'Tổng thanh toán' tô màu brand #0052ff 20px."
  - "AC-9 header cột: Figma ghi đầy đủ 'Bảo hiểm thanh toán' / 'Khách hàng thanh toán' (FEAT mô tả cột BH | KH)."
---

# Oracle — FEAT-INS-SO-ADJUSTMENT (web) · wave 01

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13257:469505`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Scope conformance = phần **MỚI** của FEAT: section
> **"Phân bổ quyết toán bảo hiểm"** (panel nhập, Nhóm B) + panel **"Tổng giá dịch vụ"** (Nhóm C).
> Phần baseline (thông tin KH / dịch vụ / xe / bảo hiểm / upload) đã production — KHÔNG verify pixel ở oracle này.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Chỉnh sửa \| Dịch vụ xe (Edit SO — biến thể 1) | 13257:546398 | 1440×3516 | assets/wave01-ins-so-adjustment--edit/_full.png |
| Chỉnh sửa \| Dịch vụ xe (Edit SO — biến thể 2) | 13257:544849 | 1440×3474 | (cùng layout NEW section — không chụp riêng) |
| Chỉnh sửa \| Dịch vụ xe (Edit SO — biến thể 3) | 13257:478586 | 1440×3590 | (cùng layout NEW section — không chụp riêng) |

> 3 frame trong section đều là **cùng 1 màn "Chỉnh sửa \| Dịch vụ xe"**, khác nhau chỉ ở chiều cao
> các khối baseline (Thông tin KH 154/228, Thông tin dịch vụ 176/260, Thông tin xe 764/964 — do data SO khác nhau).
> **2 section MỚI (Nhóm B panel nhập + Nhóm C panel tổng) GIỐNG HỆT** ở cả 3 frame → oracle dùng frame 1 (13257:546398) làm canonical.
> Màn Tạo (Create) KHÔNG render 2 section này (AC-0). Màn **Chi tiết (Detail)** render Nhóm C read-only,
> KHÔNG có panel input Nhóm B (AC-1) → oracle riêng `wave01-ins-so-adjustment--detail-oracle.md`.

### Section-container in-scope (verify pixel-perfect)

| Section | nodeId | size | screenshot |
|---|---|---|---|
| Nhóm B — Panel nhập "Phân bổ quyết toán bảo hiểm" (5 khoản + nút Áp dụng tất cả) | 13257:551696 | 1216×382 | assets/wave01-ins-so-adjustment--edit/13257-551696.png |
| Nhóm C — Panel "Tổng giá dịch vụ" (toàn bộ) | 13257:550991 | 600×816 | assets/wave01-ins-so-adjustment--edit/13257-550991.png |
| ↳ AC-9 "Chi tiết theo bên thanh toán" (bảng 3 cột) | 13263:56449 | 600×284 | assets/wave01-ins-so-adjustment--edit/13263-56449.png |
| ↳ AC-10 "Phân bổ Bảo hiểm" (5 dòng) | 13263:56447 | 600×296 | assets/wave01-ins-so-adjustment--edit/13263-56447.png |
| ↳ AC-11 "Cân thanh toán" (3 dòng) | 13263:56448 | 600×192 | assets/wave01-ins-so-adjustment--edit/13263-56448.png |

---

## Component Inventory

### Section: Nhóm B — Panel nhập (13257:551696)
- Title text × 1 — "Phân bổ quyết toán bảo hiểm" (heading) + Badge (Variant=Success) "Bảo hiểm"
- Footer note (text) × 1 — 2 dòng công thức (BH thanh toán / KH thanh toán)
- Input (số + suffix unit "vnđ" + dropdown arrow-down) × 5 — shadcn `Input` (variant input-form) gắn unit-select
- Label (text 14px medium) × 5 — nhãn từng khoản
- Helper text (14px regular muted) × 5 — mô tả từng khoản
- Button (Variant=Outline, Size=default) × 1 — "Áp dụng tất cả"

### Section: Nhóm C — Panel "Tổng giá dịch vụ" (13257:550991)
- Title text × 1 — "Tổng giá dịch vụ"
- Section header (text 14px semibold) × 3 — "Chi tiết theo bên thanh toán" / "Phân bổ Bảo hiểm" / "Cần thanh toán"
- Table / Head × 3 — "Khoản mục" (trái) · "Bảo hiểm thanh toán" (phải) · "Khách hàng thanh toán" (phải)
- Table / Cell × (4 hàng × 3 cột) ở AC-9 + (5 dòng × 2) ở AC-10 + (3 dòng × 2) ở AC-11 — read-only, không control
- Không có button/input/icon trong panel Nhóm C (read-only)

---

## Variant & State

### Badge "Bảo hiểm" (I13257:551697;917:60607)
- variant: Success (shadcn Badge, doc ui.shadcn.com/docs/components/badge#default)
- state observed: default
- bg `#f0fdf4` (background-success) · text `#16a34a` (foreground-success) · rounded-lg 8px

### Input (5 trường — I…;65:523)
- component: shadcn Input (doc ui.shadcn.com/docs/components/input#with-label)
- state observed: **default only** (giá trị "0", suffix "vnđ", dropdown arrow-down 20px)
- ⚠️ Figma frame KHÔNG có variant hover/focus/disabled/error → interaction states verify theo baseline shadcn + FEAT AC-14 (lỗi validate).

### Button "Áp dụng tất cả" (13257:551706)
- variant: Outline · size: default (h-36) — doc ui.shadcn.com/docs/components/button#outline
- state observed: default (border `#d4d4d8`, text `#18181b`, drop-shadow 0 1 1 rgba(0,0,0,.05))

---

## Text Content

### Section: Nhóm B — Panel nhập (13257:551696)
- "Phân bổ quyết toán bảo hiểm"   ← tiêu đề section
- "Bảo hiểm"                       ← badge
- "BH thanh toán = phần bảo hiểm duyệt sau chiết khấu liên kết - giảm trừ bồi thường - khấu hao vật tư - khấu trừ bảo hiểm."
- "KH thanh toán = phần KH tự trả trên bảng + các khoản bị loại trừ chuyển sang KH."
- "Chiết khấu liên kết BH - Vật tư"      ← label AC-3
- "Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần vật tư/phụ tùng"   ← helper AC-3 (⚠ "bao hiểm" thiếu dấu trong Figma)
- "Chiết khấu liên kết BH - Công dịch vụ"  ← label AC-4
- "Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần công sửa chữa"     ← helper AC-4
- "Khấu hao vật tư / thay mới"            ← label AC-5
- "Tỷ lệ khấu hao vật tư do KH chịu. Có thể áp dụng đồng loạt hoặc chỉnh riêng từng dòng phụ tùng."  ← helper AC-5
- "Áp dụng tất cả"                        ← button AC-8
- "Giảm trừ bồi thường"                   ← label AC-6
- "Khoản loại trừ hoặc giảm bồi thường theo quy tắc/hồ sơ bảo hiểm, chuyển sang KH chi trả"   ← helper AC-6
- "Khấu trừ bảo hiểm"                     ← label AC-7
- "Khoản khấu trừ bảo hiểm theo hợp đồng mà KH phải tự thanh toán"   ← helper AC-7
- "0"     ← giá trị mặc định mỗi input
- "vnđ"   ← suffix đơn vị mỗi input (kèm dropdown arrow)

### Section: Nhóm C — Panel "Tổng giá dịch vụ" (13257:550991)
- "Tổng giá dịch vụ"               ← tiêu đề panel
- "Chi tiết theo bên thanh toán"   ← header AC-9
- "Khoản mục" · "Bảo hiểm thanh toán" · "Khách hàng thanh toán"   ← 3 header cột AC-9
- "Dịch vụ" · "Phụ tùng" · "VAT" · "Cộng sau VAT"   ← 4 dòng AC-9 (dòng "Cộng sau VAT" in đậm)
- "Phân bổ Bảo hiểm"               ← header AC-10
- "CK liên kết BH — Vật tư" · "CK liên kết BH — Công dịch vụ" · "Giảm trừ bồi thường" · "Khấu hao vật tư / thay mới" · "Khấu trừ BH"   ← 5 dòng AC-10
- "Cần thanh toán"                 ← header AC-11 (⚠ Figma typo — FEAT: "Cân thanh toán")
- "Bảo hiểm thanh toán" · "Khách hàng thanh toán" · "Tổng thanh toán"   ← 3 dòng AC-11 ("Tổng thanh toán" in đậm + giá trị brand)
- Giá trị dummy trong design (data-bound, KHÔNG verify số): AC-9 "95.040đ"/"0đ"/"50.000đ"; AC-10/AC-11 "50.000.000đ". → verify format hiển thị `{số}đ` + canh phải, KHÔNG verify con số cụ thể.

---

## Design Tokens

### Section: Nhóm B — Panel nhập (13257:551696)
- typography:
  - Tiêu đề section: 18px / 600 / lh 28px / Inter → expected `text-lg font-semibold` · color `#18181b` → `text-foreground`
  - Badge text: 14px / 500 / lh 20px → `text-sm font-medium` · color `#16a34a` → `text-foreground-success`
  - Footer note: 12px / 400 / lh 16px → `text-xs` · color `#71717a` → `text-muted-foreground`
  - Label: 14px / 500 / lh 1 (leading-none) → `text-sm font-medium` · color `#18181b`
  - Input value: 14px / 400 / lh 20px → `text-sm` · color `#18181b`; suffix "vnđ" color `#71717a` → `text-muted-foreground`
  - Helper: 14px / 400 / lh 20px → `text-sm` · color `#71717a`
  - Button label: 14px / 500 / lh 20px → `text-sm font-medium` · `#18181b`
- colors:
  - Badge bg `#f0fdf4` → `bg-background-success`
  - Input bg `#ffffff` → `bg-background` · border `#d4d4d8` → `border-input` · suffix/icon `#71717a`
  - Button border `#d4d4d8` → `border-input`
- spacing:
  - Title text: pb=8 (`pb-2`), gap=8
  - Content: gap=16 (`gap-4`) giữa các block
  - Flex row 5-khoản: gap=16 (`gap-4`), 3 hàng (AC-3+AC-4 / AC-5+nút AC-8 / AC-6+AC-7)
  - Field: Label→Input gap=4 (`gap-1`), Input→helper gap=4
  - Input: h=36 (`h-9`), px=12 (`px-3`), py=4 (`py-1`), gap nội bộ=4
  - Button "Áp dụng tất cả": h=36 (`h-9`), px=16 (`px-4`), py=8 (`py-2`), wrapper pt=22 (canh đáy với input)
  - Footer note width 772px
- radius: Input `rounded-md` (6px) · Badge `rounded-lg` (8px) · Button `rounded-md` (6px)
- shadow: Input `shadow-sm` (0 1px 2px rgba(0,0,0,.05)) · Button drop-shadow 0 1px 1px rgba(0,0,0,.05)
- icon: dropdown `vuesax/linear/arrow-down` 20px (mỗi input)

### Section: Nhóm C — Panel "Tổng giá dịch vụ" (13257:550991)
- typography:
  - Tiêu đề "Tổng giá dịch vụ": 18px / 600 / lh 28px → `text-lg font-semibold` · `#18181b`
  - Section header (3 cái): 14px / 600 / lh 20px → `text-sm font-semibold` · color `#000000` (Color/Base/black)
  - Table Head: 14px / 500 / lh 20px → `text-sm font-medium` · `#18181b`
  - Table Cell label: 14px / 500 / lh 20px → `text-sm font-medium` · `#18181b`
  - Table Cell "Cộng sau VAT" / "Tổng thanh toán" label: 14px / 600 → `text-sm font-semibold`
  - Table Cell value: 14px / 500 / lh 20px → `text-sm font-medium` · `#000000`, canh phải (`text-right`)
  - "Tổng thanh toán" value: **20px / 600 / lh 28px** → `text-xl font-semibold` · color `#0052ff` → `text-primary` (brand)
- colors:
  - Table Head bg `#f4f4f5` → `bg-accent` (hoặc `bg-muted`) · border-b `#e4e4e7` → `border`
  - Row AC-10/AC-11 bg `rgba(255,255,255,0.5)` (alpha/50) · border-b cuối nhóm `#e4e4e7`
  - Value mặc định `#18181b`/`#000000`; "Tổng thanh toán" `#0052ff`
- spacing:
  - Title pb=16 (`pb-4`)
  - Section header container: p=8 (`p-2`), header width 250px
  - Table Head: h=40 (`h-10`), px=8 (`px-2`), gap=10
  - Table Cell: h=52, p=8 (`p-2`), min-w 85px; cột giá trị w=200 (`w-[200px]`), cột "Khoản mục" flex-1
- radius / shadow: panel không bo góc riêng / không shadow (table phẳng, chỉ border-b phân cách)

---

## Screenshots
> assets/wave01-ins-so-adjustment--edit/
- `_full.png` — toàn màn "Chỉnh sửa | Dịch vụ xe" (frame 13257:546398, 839×2048 scaled)
- `13257-551696.png` — Section Nhóm B: Panel nhập "Phân bổ quyết toán bảo hiểm" (5 khoản + Áp dụng tất cả)
- `13257-550991.png` — Section Nhóm C: Panel "Tổng giá dịch vụ" (toàn bộ 3 khối)
- `13263-56449.png` — AC-9: bảng "Chi tiết theo bên thanh toán"
- `13263-56447.png` — AC-10: bảng "Phân bổ Bảo hiểm"
- `13263-56448.png` — AC-11: khối "Cân thanh toán"

---

## Coverage notes (oracle — non-blocking)
- **Scope verify** = 2 section MỚI (Nhóm B + Nhóm C). Khối baseline (Thông tin KH/dịch vụ/xe, toggle Bảo hiểm, upload hồ sơ bảo lãnh) = production, ngoài phạm vi pixel-conformance oracle này.
- **AC-0 / AC-1** (ẩn/hiện theo màn Create/Edit/Detail + toggle "Bảo hiểm"): verify hành vi qua UX-FLOW + production baseline, KHÔNG có frame Figma cho state ẩn.
- **AC-5 % per dòng phụ tùng** (cột "Khấu hao (%)" trên từng dòng phụ tùng trong bảng vật tư): KHÔNG nằm trong 2 section đã chụp — cột này thuộc bảng "Phụ tùng" (baseline line-item table). Verify theo FEAT AC-5/BR-004.
- **AC-12** (cảnh báo BH thanh toán âm): không có state cảnh báo trong frame Figma → verify theo FEAT AC-12 + UX-FLOW.
- 3 design-vs-FEAT discrepancy (đơn vị %/VND, dấu+màu AC-10, highlight ô AC-11, typo "Cần thanh toán") ghi ở frontmatter `design_vs_feat_notes` — agent-test-ui đối chiếu cả Figma fact lẫn FEAT AC khi ra verdict.
