---
feat: FEAT-CAT-GRP-EDIT
feat_file: Product/features/FEAT-CAT-GRP-EDIT.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21555-24249&t=4nMPkzz6Vhf93ZCC-4
file_key: "5YU4H3iY726P8KNxI9oCYF"
node_id: "21555:24249"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success
  get_variable_defs: cached (App-Garage-V3)
  get_design_context: success (frame 21254:51963)
  get_screenshot: success (2 PNG: _full + screen)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (1 default form state)
  text_content: complete (verbatim)
  design_tokens: complete
  interaction_states: partial
screenshots:
  - assets/wave03-cat-grp-edit/_full.png
  - assets/wave03-cat-grp-edit/21254-51963.png
---

# Oracle — FEAT-CAT-GRP-EDIT (mobile) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Section `21555:24249` "FEAT-CAT-GRP-EDIT" —
> màn "Chỉnh sửa Nhóm vật tư hàng hóa". **Structure identical với FEAT-CAT-GRP-CREATE** chỉ KHÁC ở
> AppBar title.

---

## Screen Inventory

| Screen state | nodeId | size (W×H) | screenshot |
|---|---|---|---|
| Chỉnh sửa Nhóm VTHH — form pre-filled (existing group data) | `21254:51963` | 375×812 | `assets/wave03-cat-grp-edit/21254-51963.png` |
| (Aggregate) Section single screen | `21555:24249` | 4901×1112 | `assets/wave03-cat-grp-edit/_full.png` |

> **Identical structure** với FEAT-CAT-GRP-CREATE — cùng card "Thông tin chung" với 4 field + textarea
> + bottom action bar (Huỷ / Lưu). Chỉ khác AppBar title.

---

## Component Inventory

### Screen — Chỉnh sửa Nhóm VTHH (`21254:51963`)

> **Tất cả component identical với `wave03-cat-grp-create-oracle.md §Component Inventory`** — agent-test-ui
> dùng widget tree reuse. Chỉ ghi khác biệt:

| Component | Diff vs CREATE | Flutter mapping |
|---|---|---|
| AppBar title | **"Chỉnh sửa Nhóm vật tư hàng hóa"** (16 SemiBold center) vs CREATE "Thêm nhóm vật tư hàng hóa" | `AppBar(title: Text(...))` |
| Form fields (pre-filled values) | Pre-load existing group: Mã="MN1202012", Tên="Công ty CP Thanh toán Dịch Vụ Hưng Hà", Thuộc nhóm="Vật tư hàng hoá", Trạng thái="Đang hoạt động", Mô tả="" (empty placeholder) | Same `AppTextField`/`AppDropdown` |
| Switch in header | opacity-0 hidden (same as CREATE) | Hidden |
| Bottom buttons | "Huỷ" + "Lưu" identical với CREATE | Same |

> See `wave03-cat-grp-create-oracle.md` cho full component list — không lặp lại ở đây.

---

## Variant & State

> **Identical với CREATE**. Khác biệt duy nhất:
> - **Pre-filled mode**: form fields render với value initial từ existing group entity (vs CREATE
>   empty/placeholder).
> - **"Save" semantics**: nút "Lưu" → API `updateProductGroup(id, payload)` thay vì `createProductGroup(payload)`.
> - **Dirty state**: agent-test-ui verify form tracking dirty/clean state (Lưu chỉ enable khi có
>   thay đổi — fallback baseline, Figma không show).

---

## Text Content

> Verbatim từ `get_design_context(21254:51963)` — gần như identical với CREATE trừ title.

### AppBar
- Title: **"Chỉnh sửa Nhóm vật tư hàng hóa"** (Semi Bold 16 `#262626` center, w=279)

### Section + form
- Section title: **"Thông tin chung"** (Bold 18 `#262626`)
- Label 1: **"Mã nhóm VTHH "** + ` *` — sample value: **"MN1202012"**
- Label 2: **"Tên nhóm VTHH "** + ` *` — sample value: **"Công ty CP Thanh toán Dịch Vụ Hưng Hà"**
- Label 3: **"Thuộc nhóm"** — value: **"Vật tư hàng hoá"**
- Label 4: **"Trạng thái"** — value: **"Đang hoạt động"**
- Label 5: **"Mô tả"** — placeholder: **"Nhập mô tả"** (empty trong sample), counter: **"0/250"**

### Bottom buttons
- **"Huỷ"** (secondary bg `#eaeaea` text `#273243`)
- **"Lưu"** (primary bg `#0052ff` text white)

### Implicit semantic
- Initial form state PRE-FILLED với existing group data. User chỉnh sửa → tap "Lưu" gọi API update.
- Tap "Huỷ" → discard changes, navigate back (confirm dialog nếu form dirty — baseline UX, không thấy trong Figma).

---

## Design Tokens

> **Identical với `wave03-cat-grp-create-oracle.md §Design Tokens`** — same file App-Garage-V3.
> Key tokens (recap):

### Colors
- `#ffffff` bg, `#262626` text primary, `#273243` text alt, `#888c94` tertiary, `#b8babf` quaternary
- `#0052ff` brand-CD (Lưu bg + active border), `#ed1f42` error/required asterisk
- `#e8e8ea` border, `#eaeaea` Huỷ bg, `#f3f3f4` bg secondary

### Typography
- `Heading/H3` 18 Bold — "Thông tin chung"
- `Heading/H4` 16 Bold — Button text
- `Subtitle/S4` 16 SB — AppBar title "Chỉnh sửa Nhóm vật tư hàng hóa"
- `Subtitle/S5` 14 SB — Form labels
- `Caption/C5` 14 Reg — Input values
- `Caption/C7` 12 Reg — Counter "0/250"

### Spacing
- Card p=16, field gap=12, label↔field gap=8, button gap=8

### Border
- Input border 1px `#e8e8ea` radius 8
- Button radius 8
- Bottom bar shadow `0px -4px 12px rgba(0,0,0,0.06)`

### Icons
- `vuesax/linear/arrow-left` 20×20 AppBar back
- `vuesax/linear/arrow-down` 20×20 Select chevron

### Bounds
- Screen 375×812, Card "Info KH" 375×562 (h=562 nhỏ hơn CREATE's 568 do top spacer h=6 + content 562; same outer dim)

---

## Screenshots

| Asset path | Node | Brief |
|---|---|---|
| `assets/wave03-cat-grp-edit/_full.png` | `21555:24249` | Section full single screen (4901×1112) |
| `assets/wave03-cat-grp-edit/21254-51963.png` | `21254:51963` | Screen — Chỉnh sửa Nhóm VTHH form (375×812, golden reference) |

---

## Notes (oracle interpretation)

1. **Structure 1-1 với CREATE**: implementer có thể share widget tree (cùng `ProductGroupFormScreen`)
   với mode prop `create | edit`. AppBar title + submit handler + initial values khác.
2. **Pre-filled vs empty placeholder**: Figma show pre-fill "Mã nhóm VTHH" = "MN1202012" (typical
   existing group). Verify impl chuyển data từ navigation argument (productGroup object).
3. **Read-only Mã nhóm VTHH?**: Theo nghiệp vụ MDM thông thường mã (code) NOT editable sau khi tạo.
   FEAT cần specify field này có readonly trong edit mode không. Figma KHÔNG show readonly visual
   (border vẫn `#e8e8ea`, text vẫn `#273243`) → flag BA.
4. **Lưu disabled khi form unchanged**: baseline UX practice — Figma không có disabled state.
   Implementer suy theo Material `:disabled` opacity 0.5.
5. **Confirm dialog on Huỷ when dirty**: baseline UX — Figma không show. Có thể gọi popover xác
   nhận (giống FEAT-CAT-GRP-DELETE pattern) trước khi navigate back.
6. **No date/audit fields visible**: Edit form không show "Người tạo / Ngày tạo / Ngày sửa" (chỉ
   hiện trong DETAIL screen `wave03-cat-grp-detail-oracle.md`). Verify FEAT.
