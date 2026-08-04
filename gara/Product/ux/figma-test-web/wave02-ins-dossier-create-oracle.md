---
feat: FEAT-INS-DOSSIER-CREATE
feat_file: Product/features/FEAT-INS-DOSSIER-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-536880&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:536880"
fetched_at: 2026-06-18T13:20:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (parent section 13257:536880 > token limit; structure đọc qua file đã lưu + DEV spec)
  get_variable_defs: success (token table cho parent section)
  get_design_context: skipped (parent > limit; supplement từ DEV spec wave02-ins-dossier-create.md)
  get_screenshot: success (6 PNG fresh)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (supplemented from DEV spec — same FEAT, cùng file_key)
  variant_state: partial (Figma chỉ render state default + state 2/4 vs 4/4 cho checkbox enabled/disabled; không có hover/focus state per Figma variant)
  text_content: complete (Vietnamese verbatim từ DEV spec + visual reconcile screenshots)
  design_tokens: complete (variable_defs success — token map đầy đủ)
  interaction_states: partial (hover/focus/disabled — Figma không render variant; verify theo shadcn baseline)
screenshots:
  - assets/wave02-ins-dossier-create/_full.png
  - assets/wave02-ins-dossier-create/13257-555266-state-4_4.png
  - assets/wave02-ins-dossier-create/13257-537062-acc-quyettoan.png
  - assets/wave02-ins-dossier-create/13257-537243-acc-baogia.png
  - assets/wave02-ins-dossier-create/13257-537424-acc-bienban.png
  - assets/wave02-ins-dossier-create/13257-537605-acc-uyquyen.png
design_vs_feat_notes:
  - "AC-1 title modal hiển thị 'Hồ sơ bảo hiểm - {mã phiếu QT}' (vd 'Hồ sơ bảo hiểm - SET-20260326-00001') — FEAT AC-1 dùng template 'Hồ sơ bảo hiểm – [mã phiếu QT]' (kí tự en-dash); Figma dùng hyphen-minus '-'."
  - "AC-3 checkbox Biên bản + Giấy ủy quyền: enabled ngay khi modal mở — có thể tích chọn không phụ thuộc trạng thái điền template (FEAT v22 — gỡ EC-4 gate). Figma frame 'state 2/4' chỉ là design snapshot, không enforce disabled state."
  - "AC-6/AC-7: hint 'Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin.' (icon info + text muted-foreground) — không nêu nguyên văn trong FEAT, là design convention."
  - "Action footer (AC-9): hai nút 'Huỷ bỏ' (secondary) + 'Xuất hồ sơ bảo hiểm' (brand). Disabled state khi 0/4 checkbox tick (gate INS_DOSSIER_NO_DOC_SELECTED) — verify opacity 50% + cursor not-allowed."
---

# Oracle — FEAT-INS-DOSSIER-CREATE (web) · wave 02

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13257:536880`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **Modal "Hồ sơ bảo hiểm"** — tạo & quản lý 4 tài liệu
> chuẩn (Phiếu quyết toán + Phiếu báo giá + Biên bản nghiệm thu + Giấy ủy quyền) khi xuất hồ sơ
> bảo hiểm từ phiếu quyết toán bảo hiểm.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Modal state 2/4 tài liệu sẵn sàng (default) | 13257:536881 | 1440×1983 | assets/wave02-ins-dossier-create/_full.png |
| Modal state 4/4 tài liệu sẵn sàng | 13257:555266 | 1440×1983 | assets/wave02-ins-dossier-create/13257-555266-state-4_4.png |
| Accordion "Phiếu quyết toán" expanded | 13257:537062 | 1440×1983 | assets/wave02-ins-dossier-create/13257-537062-acc-quyettoan.png |
| Accordion "Phiếu báo giá" expanded | 13257:537243 | 1440×1983 | assets/wave02-ins-dossier-create/13257-537243-acc-baogia.png |
| Accordion "Biên bản nghiệm thu" expanded | 13257:537424 | 1440×2232 | assets/wave02-ins-dossier-create/13257-537424-acc-bienban.png |
| Accordion "Giấy ủy quyền" expanded | 13257:537605 | 1440×2560 | assets/wave02-ins-dossier-create/13257-537605-acc-uyquyen.png |

> 6 frame = **cùng 1 modal** ở các state khác nhau (header + 4 accordion items + footer giống hệt mọi state).
> 4 frame "accordion expanded" thể hiện cấu trúc nội dung mỗi item — DEV implement 1 modal duy nhất
> với accordion type=single collapsible.

### Section-container in-scope

| Section | nodeId | size | screenshot |
|---|---|---|---|
| Modal panel (header + 4 accordions + footer) — state 2/4 | 13257:536881 | 1440×1983 | assets/wave02-ins-dossier-create/_full.png |
| Modal panel — state 4/4 | 13257:555266 | 1440×1983 | assets/wave02-ins-dossier-create/13257-555266-state-4_4.png |
| Accordion content #1 — Phiếu quyết toán (AC-4) | 13257:537062 | 1440×1983 | assets/wave02-ins-dossier-create/13257-537062-acc-quyettoan.png |
| Accordion content #2 — Phiếu báo giá (AC-5) | 13257:537243 | 1440×1983 | assets/wave02-ins-dossier-create/13257-537243-acc-baogia.png |
| Accordion content #3 — Biên bản nghiệm thu (AC-6) | 13257:537424 | 1440×2232 | assets/wave02-ins-dossier-create/13257-537424-acc-bienban.png |
| Accordion content #4 — Giấy ủy quyền (AC-7) | 13257:537605 | 1440×2560 | assets/wave02-ins-dossier-create/13257-537605-acc-uyquyen.png |

---

## Component Inventory

### Screen: Modal panel state 2/4 (13257:536881)
- **ModalHeader** × 1 — Title (xlarge/600 semibold) "Hồ sơ bảo hiểm - SET-20260326-00001" · CloseButton (icon ghost, optional)
- **AccordionItem** × 4 (PhieuQuyetToan / PhieuBaoGia / BienBanNghiemThu / GiayUyQuyen)
  - per item: Checkbox × 1 (size 20) · Title text × 1 (base/600) · Subtitle text × 1 (small/400 muted) · Chevron icon × 1 (chevron-down 20)
- **ModalFooter** × 1 — Button (secondary, h-9) × 1 "Huỷ bỏ" · Button (brand, h-9) × 1 "Xuất hồ sơ bảo hiểm"

### Screen: Modal panel state 4/4 (13257:555266)
- Identical với state 2/4 — chỉ khác state checkbox (4 checkbox enabled, không disabled) + Button "Xuất hồ sơ bảo hiểm" enabled.

### Screen: Accordion "Phiếu quyết toán" expanded (13257:537062) — AC-4
- Heading × 1 "PHIẾU QUYẾT TOÁN SỬA CHỮA" + Subheading "{mã phiếu QT}"
- Info row × 4 (Garage, Ngày quyết toán, Khách hàng, Biển số xe) — Label (small/400 muted) + Value (small/600)
- Table × 2 ("Dịch vụ thực hiện" + "Phụ tùng sử dụng") — cột: STT / Nội dung / ĐVT / SL / Đơn giá / Thành tiền + dòng Tổng (read-only)
- Section block × 1 "Phân bổ bảo hiểm" — list các dòng CK Vật tư/Công, Giảm trừ bồi thường, Khấu hao VT/thay mới, Khấu trừ BH, Tổng thanh toán
- Button (secondary outline) × 1 — "In phiếu" (printer icon iconsax-reactjs/Printer/Linear 20px)

### Screen: Accordion "Phiếu báo giá" expanded (13257:537243) — AC-5
- Heading × 1 "PHIẾU BÁO GIÁ SỬA CHỮA" + Subheading "{mã PDV} · Bảo hiểm đã duyệt giá"
- Info row × 4 (Garage, Ngày báo giá, Công ty BH, Số hợp đồng BH)
- Table × 1 — cột: STT / Nội dung sửa chữa / Phụ tùng / Đơn giá / Thành tiền + dòng Tổng (read-only)
- Button (secondary outline) × 1 "In phiếu"

### Screen: Accordion "Biên bản nghiệm thu" expanded (13257:537424) — AC-6
- Heading × 1 "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM" / Subheading "Độc lập - Tự do - Hạnh phúc" / Underline "-----o0o-----"
- Hint info × 1 — icon info + text muted "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."
- Section "Lập biên bản" × 1 — Inline-editable input × 4 (BKS xe / Ngày lập / Địa điểm / Căn cứ phiếu báo giá)
- Section "Thông tin các bên" × 1 — Bên A (KH) Inline-editable × N + Bên B (garage prefill) × N
- Section "Nội dung nghiệm thu" × 1 — Editable list × 4 điều khoản + Button (text/ghost) × 1 "+ Thêm mục điều khoản"
- Section "Ký" × 1 (2 cột — KH | Garage)
- Button (secondary outline) × 1 "In biên bản"

### Screen: Accordion "Giấy ủy quyền" expanded (13257:537605) — AC-7
- Heading × 1 "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM" / Subheading "Độc lập - Tự do - Hạnh phúc" / Underline "-----o0o-----"
- Hint info × 1 — icon info + text muted "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."
- Heading × 1 "GIẤY ỦY QUYỀN"
- Inline-editable input × 2 (Địa danh / Ngày lập)
- Section "I. Bên ủy quyền" × 1 — Inline-editable × N (Họ tên prefill chỉ Tên + Địa chỉ/Quốc tịch/Đại diện/Chức vụ/GCN BH/CMND-CCCD)
- Section "II. Bên được ủy quyền" × 1 — Inline-editable × N (Tên garage/Địa chỉ/MST/Điện thoại/Đại diện/Chức vụ/STK/Ngân hàng — prefill)
- Section "III. Nội dung ủy quyền" × 1 — Inline-editable × N (Loại xe + BKS prefill, Số tiền bồi thường + Bằng chữ prefill, Ngày tai nạn + Nội dung nhập tay)
- Section "IV. Cam kết" × 1 — Editable list × 3 điều khoản + Button (text/ghost) × 1 "+ Thêm mục điều khoản"
- Section "Ký" × 1 (2 cột)
- Button (secondary outline) × 1 "In giấy ủy quyền"

---

## Variant & State

### Checkbox (shadcn Checkbox, 20×20)
- variants: unchecked (default) · checked
- states observed (FEAT v22 — gỡ EC-4 gate):
  - default state: cả 4 = unchecked enabled (user chủ động tick — không phụ thuộc trạng thái điền template)
  - Figma frame "state 2/4 disabled" và "state 4/4 enabled" chỉ là design snapshot lịch sử, không enforce — implementation render cùng 1 enabled state cho cả 4 checkbox.

### AccordionItem trigger row
- variants: collapsed (default) · expanded (chevron rotate 180)
- states observed: default · expanded
- hover/focus: KHÔNG có trong Figma variant → verify shadcn baseline (`hover:bg-accent`, `focus-visible:ring-ring`)

### Button (footer)
- "Huỷ bỏ" — variant=secondary outline · size=sm (h-9 = 36px)
- "Xuất hồ sơ bảo hiểm" — variant=brand-CD (#0052ff) · size=sm
- states observed: default · disabled (state 2/4 + 0 checkbox tick = disabled, opacity 50%)
- hover/focus: KHÔNG có Figma variant → verify shadcn baseline

### Inline-editable input (Biên bản + Giấy ủy quyền)
- variants: default (border-bottom dashed muted) · focus (ring brand)
- states observed: default
- focus/error: KHÔNG có Figma variant → verify FEAT AC-6/AC-7

---

## Text Content

### Screen: Modal panel state 2/4 (13257:536881)
- "Hồ sơ bảo hiểm - SET-20260326-00001" (title)
- "Phiếu quyết toán"
- "SET-20260326-00001" (subtitle)
- "Phiếu báo giá"
- "PDV-20260320-00639" (subtitle)
- "Biên bản nghiệm thu"
- "Thông tin được sử dụng để lập biên bản nghiệm thu" (subtitle)
- "Giấy ủy quyền nhận tiền bồi thường"
- "Áp dụng cho garage chưa ký liên kết với bảo hiểm" (subtitle)
- "Huỷ bỏ" (button)
- "Xuất hồ sơ bảo hiểm" (button)

### Screen: Modal panel state 4/4 (13257:555266)
- Identical với state 2/4 — checkbox 4/4 enabled.

### Screen: Accordion "Phiếu quyết toán" (13257:537062)
- "PHIẾU QUYẾT TOÁN SỬA CHỮA" (heading)
- "SET-20260326-00001" (subheading)
- "Garage" · "Ngày quyết toán" · "Khách hàng" · "Biển số xe" (info labels)
- "Dịch vụ thực hiện" · "Phụ tùng sử dụng" (table headings)
- "STT" · "Nội dung" · "ĐVT" · "SL" · "Đơn giá" · "Thành tiền" (table column headers)
- "Tổng" (table footer)
- "Phân bổ bảo hiểm" (section heading)
- "CK liên kết BH - Vật tư" · "CK liên kết BH - Công dịch vụ" · "Giảm trừ bồi thường" · "Khấu hao vật tư/thay mới" · "Khấu trừ bảo hiểm" · "Tổng thanh toán" (section labels)
- "In phiếu" (button)

### Screen: Accordion "Phiếu báo giá" (13257:537243)
- "PHIẾU BÁO GIÁ SỬA CHỮA" (heading)
- "PDV-20260320-00639 · Bảo hiểm đã duyệt giá" (subheading)
- "Garage" · "Ngày báo giá" · "Công ty bảo hiểm" · "Số hợp đồng BH" (info labels)
- "STT" · "Nội dung sửa chữa" · "Phụ tùng" · "Đơn giá" · "Thành tiền" (table column headers)
- "Tổng" (table footer)
- "In phiếu" (button)

### Screen: Accordion "Biên bản nghiệm thu" (13257:537424)
- "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM" (heading)
- "Độc lập - Tự do - Hạnh phúc" (subheading)
- "-----o0o-----" (underline)
- "BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG" (template heading)
- "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin." (hint)
- "Lập biên bản" (section heading)
- "BKS xe" · "Ngày lập" · "Địa điểm lập" · "Căn cứ phiếu báo giá" (field labels)
- "Thông tin các bên" (section heading)
- "Bên A" · "Bên B" (party labels)
- "Tên" · "Đại diện" · "Chức vụ" · "Địa chỉ" · "CCCD" · "MST" · "STK" · "Ngân hàng" (field labels)
- "Nội dung nghiệm thu" (section heading)
- "+ Thêm mục điều khoản" (button)
- "Đại diện khách hàng (Ký, ghi rõ họ tên)" · "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)" (signature labels)
- "In biên bản" (button)

### Screen: Accordion "Giấy ủy quyền" (13257:537605)
- "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM" (heading)
- "Độc lập - Tự do - Hạnh phúc" (subheading)
- "-----o0o-----" (underline)
- "GIẤY ỦY QUYỀN" (template heading)
- "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin." (hint)
- "I. Bên ủy quyền" · "II. Bên được ủy quyền" · "III. Nội dung ủy quyền" · "IV. Cam kết" (section headings)
- "Họ tên" · "Địa chỉ" · "Quốc tịch" · "Đại diện" · "Chức vụ" · "GCN bảo hiểm" · "CMND/CCCD" (field labels — Bên ủy quyền)
- "Tên garage" · "Địa chỉ" · "MST" · "Điện thoại" · "Đại diện" · "Chức vụ" · "STK" · "Ngân hàng" (field labels — Bên được ủy quyền)
- "Loại xe" · "Biển số xe" · "Số tiền bồi thường" · "Bằng chữ" · "Ngày tai nạn" · "Nội dung" (field labels — Nội dung ủy quyền)
- "+ Thêm mục điều khoản" (button)
- "In giấy ủy quyền" (button)

---

## Design Tokens

### Screen: Modal panel — chung mọi state (13257:536881 / 13257:555266)
- colors:
  - `#ffffff` (modal panel BG) → `bg-background` (token `base/background`)
  - `#18181b` (title text, primary text) → `text-foreground` (token `base/foreground`)
  - `#71717a` (subtitle muted text) → `text-muted-foreground` (token `base/muted-foreground`)
  - `#e4e4e7` (border-bottom accordion, border header/footer) → `border-border` (token `base/border`)
  - `#0052ff` (button brand BG "Xuất hồ sơ bảo hiểm") → `bg-primary` brand custom (token `base/background-brand-CD`)
  - `#ffffff` (button brand text) → `text-primary-foreground` (token `base/primary-foreground`)
  - overlay: `#00000033` (overlay modal backdrop, alpha 0.2) → `bg-overlay` (token `overlay/80`)
- typography:
  - Modal title: 20px / lh 28px / weight 600 / Inter → `text-xl font-semibold` (token `text extra large/leading-normal/semibold`)
  - Accordion title: 16px / lh 24px / weight 600 / Inter → `text-base font-semibold` (token `text base/leading-normal/semibold`)
  - Accordion subtitle: 14px / lh 20px / weight 400 / Inter → `text-sm` (token `typography/base sizes/small`)
  - Button label: 14px / lh 20px / weight 500 / Inter → `text-sm font-medium` (token `text small/leading-normal/medium`)
- spacing:
  - ModalHeader padding: 24 / 24 / 16 / 24px (t/r/b/l) → `pt-6 pr-6 pb-4 pl-6` (token `spacing/6` / `spacing/4`)
  - ModalBody padding: 0 / 24 / 0 / 24px → `px-6`
  - ModalFooter padding: 16 / 24 / 24 / 24px → `pt-4 px-6 pb-6`
  - ModalFooter gap: 12px → `gap-3` (token `spacing/3`)
  - Accordion trigger row padding: 16 / 24 (vertical / horizontal) → `py-4 px-6`
  - Accordion trigger row gap: 12px → `gap-3`
- radius:
  - Modal panel: 8px → `rounded-lg` (token `border radius/lg`)
  - Button: 6px → `rounded-md` (token `border radius/md`)
- shadow:
  - Modal panel: `shadow-lg` (token `shadow/lg` = drop-shadow #0000000D offset(0,4) blur 6 spread -2 + drop-shadow #0000001A offset(0,10) blur 15 spread -3)
- size:
  - Checkbox: 20×20 → `w-5 h-5` (token `width/w-5` / `height/h-5`)
  - Chevron icon: 20×20 → `w-5 h-5`
  - Button h-9: 36px → `h-9` (token `height/h-9`)
  - Button padding: 16 / 8px (horizontal / vertical) → `px-4 py-2`
- border:
  - Accordion border-bottom: 1px solid `#e4e4e7` → `border-b border-border`
  - Header border-bottom: 1px solid `#e4e4e7`
  - Footer border-top: 1px solid `#e4e4e7` → `border-t border-border`
  - Button secondary border: 1px solid `#e4e4e7` → `border border-border`

### Screen: Accordion content area (chung mọi expanded screen)
- colors:
  - Content BG: `#ffffff`
  - Section heading text: `#18181b`
  - Field label muted: `#71717a`
  - Table row border: `#e4e4e7`
- typography:
  - Section heading: 16px / 600 → `text-base font-semibold`
  - Field label: 14px / 400 → `text-sm`
  - Field value: 14px / 600 → `text-sm font-semibold`
  - Template heading (BIÊN BẢN / GIẤY ỦY QUYỀN): 18px / 600 → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
- spacing:
  - Accordion content padding: 24 / 24 / 24 / 24 → `p-6`
  - Section gap: 16-24px (theo block)
  - Info row gap: 12px → `gap-3`

---

## Screenshots
> assets/wave02-ins-dossier-create/
- `_full.png` — Modal state 2/4 tài liệu sẵn sàng (13257:536881)
- `13257-555266-state-4_4.png` — Modal state 4/4 tài liệu sẵn sàng
- `13257-537062-acc-quyettoan.png` — Accordion "Phiếu quyết toán" expanded (AC-4)
- `13257-537243-acc-baogia.png` — Accordion "Phiếu báo giá" expanded (AC-5)
- `13257-537424-acc-bienban.png` — Accordion "Biên bản nghiệm thu" expanded (AC-6)
- `13257-537605-acc-uyquyen.png` — Accordion "Giấy ủy quyền" expanded (AC-7)
