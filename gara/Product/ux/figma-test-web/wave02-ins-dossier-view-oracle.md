---
feat: FEAT-INS-DOSSIER-VIEW
feat_file: Product/features/FEAT-INS-DOSSIER-VIEW.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-480151&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:480151"
fetched_at: 2026-06-18T13:25:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (parent section structure đã capture trong DEV spec wave02-ins-dossier-view.md)
  get_variable_defs: success
  get_design_context: skipped (parent > limit; supplement từ DEV spec)
  get_screenshot: success (3 PNG fresh)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (supplemented từ DEV spec + screenshot reconcile)
  variant_state: complete (Populated vs Empty là 2 state chính của tab)
  text_content: complete (verbatim từ DEV spec — FEAT AC + Figma)
  design_tokens: complete (variable_defs success)
  interaction_states: partial (Figma không render hover/focus cho FileCard/Tab; verify shadcn baseline + open-new-tab pattern theo wave-spec)
screenshots:
  - assets/wave02-ins-dossier-view/_full.png
  - assets/wave02-ins-dossier-view/13257-481612-empty.png
  - assets/wave02-ins-dossier-view/13257-481064-dossier-sets.png
design_vs_feat_notes:
  - "Cả 2 screen Figma đặt tên 'FEAT-INS-STL-DETAIL' (parent boundary STL-DETAIL highlight tab 'Hồ sơ bảo hiểm đã xuất'). FEAT-INS-DOSSIER-VIEW chỉ định nghĩa **tab content** (AC-1..AC-7). Header/Section thông tin quyết toán/khách hàng & xe/Bảo hiểm → chung với FEAT-INS-STL-DETAIL — đã capture ở wave01-ins-stl-detail-oracle.md."
  - "AC-1 empty state: Figma render component 'Empty Data/instance' với title 'Không tồn tại bản ghi!' (generic baseline component). FEAT AC-1 quy định message **'Chưa có hồ sơ nào được xuất'** (ERR-INS-010 / EMPTY_STATE) — DEV phải override copy theo AC-1 chứ KHÔNG dùng generic Figma."
  - "AC-3 file card: 'Phiếu báo giá.pdf · 100kb' (filename + size cùng dòng, dấu chấm giữa). Reference row 12px = '#{mã phiếu QT}' (vd '#SET-20260326-00001'). DEV theo filename mapping: 'Phiếu quyết toán.pdf' / 'Phiếu báo giá.pdf' / 'Biên bản nghiệm thu.pdf' / 'Giấy ủy quyền nhận tiền bồi thường.pdf'."
  - "AC-4/AC-5 interaction (click file card → mở PDF tab mới + nút 'Tải PDF'): pattern wave-spec quyết định (PKG-W02 v15 §2.2 + wave-spec FEAT-INS-DOSSIER-VIEW v4 §3) — KHÔNG nằm trong Figma scope. Figma chỉ capture state 'selected' (border 2px brand-CD)."
  - "AC-6 multi-set: 3 instance DossierSet stack dọc (gap=24) — mỗi instance là 1 'Bộ hồ sơ #{mã phiếu QT}' với grid 2x2 file cards."
---

# Oracle — FEAT-INS-DOSSIER-VIEW (web) · wave 02

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13257:480151`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **STL-DETAIL · Tab "Hồ sơ bảo hiểm đã xuất"** (Populated +
> Empty) — phần content thuộc scope FEAT-INS-DOSSIER-VIEW (xem list file PDF đã xuất).

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Tab "Hồ sơ bảo hiểm đã xuất" — Populated (3 bộ hồ sơ × 4 file cards) | 13257:480949 | 1440×1887 | assets/wave02-ins-dossier-view/_full.png |
| Tab "Hồ sơ bảo hiểm đã xuất" — Empty | 13257:481612 | 1440×1364 | assets/wave02-ins-dossier-view/13257-481612-empty.png |

> 2 frame = **cùng 1 màn STL-DETAIL** với tab 'Hồ sơ bảo hiểm đã xuất' active, khác nhau ở state populated vs empty
> của tab content. Header + SettlementInfo + CustomerVehicle + Insurance section dùng chung với FEAT-INS-STL-DETAIL.

### Section-container in-scope (scope của DOSSIER-VIEW)

| Section | nodeId | size | screenshot |
|---|---|---|---|
| TabContent populated — DossierList × 3 sets | 13257:481064 | 1216×923 | assets/wave02-ins-dossier-view/13257-481064-dossier-sets.png |
| TabContent empty — EmptyData component | 13257:481725 | 1216×400 | assets/wave02-ins-dossier-view/13257-481612-empty.png (zoom panel cuối) |

---

## Component Inventory

### Section: TabContent Populated — DossierList (13257:481064) — AC-1/AC-2/AC-3/AC-6
- **DossierSet** × 3 (stack vertical gap 24) — AC-6 multi-set pattern
- per DossierSet:
  - Heading (large/semibold 18px) × 1 "Bộ hồ sơ #{mã phiếu QT}"
  - Subtitle text (extra-small/regular 12px muted) × 1 "Xuất ngày {dd/mm/yyyy hh:mm} · {N} tài liệu PDF"
  - **FileGrid** (2 cột × 2 hàng) × 1
    - **FileCard** × 4 (Phiếu quyết toán / Phiếu báo giá / Biên bản nghiệm thu / Giấy ủy quyền)
      - per FileCard: Icon PDF (DocumentText 24px #dc2626) × 1 · Filename text (sm/medium) × 1 · Reference text (xs/regular muted) × 1
- AC-3: 1 FileCard có state **selected** (border 2px #0052ff) — thẻ "Phiếu báo giá.pdf" của bộ mới nhất theo screenshot.

### Section: TabContent Empty — EmptyData (13257:481725) — AC-1
- EmptyState (component baseline) × 1:
  - Icon illustration × 1 (120×120 — empty data illustration)
  - Title text (xlarge/semibold 20px) × 1 — Figma render "Không tồn tại bản ghi!" (DEV override theo AC-1 → "Chưa có hồ sơ nào được xuất")
  - Description text (small/regular muted) × 1

### Section shared (verbatim STL-DETAIL — reference)
- TabNav/links × 1 (4 tab: Bảng chi phí | Chứng từ & hoá đơn | Lịch sử thanh toán | Hồ sơ bảo hiểm đã xuất=active)
- Detail của Header/SettlementInfo/CustomerVehicle/Insurance → xem oracle wave01-ins-stl-detail-oracle.md (cùng pattern, không re-spec).

---

## Variant & State

### Tab (shadcn Tabs)
- variants: 4 tab "Bảng chi phí" / "Chứng từ & hoá đơn" / "Lịch sử thanh toán" / "Hồ sơ bảo hiểm đã xuất"
- states observed:
  - Tab "Hồ sơ bảo hiểm đã xuất" active — text color `#0052ff`, border-bottom 2px `#0052ff`
  - 3 tab khác inactive — text color `#71717a`, không border
- hover/focus: KHÔNG có Figma variant — verify shadcn baseline (`data-[state=active]`)

### FileCard (shadcn Card / outline)
- variants: default · selected · empty (không render khi empty)
- states observed:
  - default — border 1px `#e4e4e7` + shadow-sm + radius 8px (rounded-lg)
  - selected — border 2px `#0052ff` (ring brand) + shadow-sm
- hover/click: KHÔNG có Figma variant — wave-spec PKG-W02 §2.2 quy định click → open PDF tab mới + nút "Tải PDF" riêng.

### EmptyState
- variants: empty (chỉ 1 state)
- states observed: empty (icon + title + description canh giữa, padding 24, BG `#ffffff`)

### TabContent
- variants: populated (FileGrid render) · empty (EmptyState render)
- states observed: cả 2

---

## Text Content

### Section: TabNav (chung mọi state) — 1216×56
- "Bảng chi phí"
- "Chứng từ & hoá đơn"
- "Lịch sử thanh toán"
- "Hồ sơ bảo hiểm đã xuất"  ← active

### Section: TabContent Populated (13257:481064)
- "Bộ hồ sơ #SET-20260326-00001" (DossierSet 1 — mới nhất)
- "Xuất ngày 26/03/2026 10:15 · 4 tài liệu PDF" (sample subtitle)
- "Phiếu quyết toán.pdf · 100kb"
- "Phiếu báo giá.pdf · 100kb"
- "Biên bản nghiệm thu.pdf · 100kb"
- "Giấy ủy quyền nhận tiền bồi thường.pdf · 100kb"
- "#SET-20260326-00001" (reference)
- "Bộ hồ sơ #SET-20260326-00002" (DossierSet 2)
- "Bộ hồ sơ #SET-20260326-00003" (DossierSet 3 — cũ nhất)

### Section: TabContent Empty (13257:481725)
- "Không tồn tại bản ghi!" (Figma component default) — **DEV override theo AC-1**: "Chưa có hồ sơ nào được xuất"
- "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." (Figma default) — **DEV override**: (verify FEAT AC-1 description copy)

---

## Design Tokens

### Section: TabContent Populated (13257:481064)
- colors:
  - DossierSet BG: `#ffffff` → `bg-background` (token `base/background`)
  - FileCard BG: `#ffffff`
  - FileCard border default: 1px solid `#e4e4e7` → `border-border` (token `base/border`)
  - FileCard border selected: 2px solid `#0052ff` → `ring-2 ring-primary` (token `base/border-brand-CD`)
  - PDF icon color: `#dc2626` → `text-destructive` (token `base/foreground-error`)
  - Filename text: `#18181b` → `text-foreground` (token `base/foreground`)
  - Reference text muted: `#71717a` → `text-muted-foreground` (token `base/muted-foreground`)
  - Heading "Bộ hồ sơ": `#18181b` → `text-foreground`
- typography:
  - DossierSet heading: 18px / lh 28px / weight 600 / Inter → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
  - DossierSet subtitle: 12px / lh 16px / weight 400 / Inter → `text-xs` (token `typography/base sizes/extra small`)
  - FileCard filename: 14px / lh 20px / weight 500 / Inter → `text-sm font-medium` (token `text small/leading-normal/medium`)
  - FileCard reference: 12px / lh 16px / weight 400 → `text-xs`
- spacing:
  - DossierList gap (giữa sets): 24px → `gap-6` (token `spacing/6`)
  - DossierSet gap (header → grid): 20px → `gap-5` (token `spacing/5`)
  - DossierSet header gap (title → subtitle): 4px → `gap-1` (token `spacing/1`)
  - FileGrid col gap: 20px → `gap-x-5` · row gap: 12px → `gap-y-3` (token `spacing/3`)
  - FileCard padding: 12 / 16 (vertical / horizontal) → `py-3 px-4`
  - FileCard gap (icon → text block): 12px → `gap-3`
  - TabContent padding: 28 / 20 / 0 / 20 → `pt-7 px-5` (token `spacing/5`)
- radius:
  - FileCard: 8px → `rounded-lg` (token `border radius/lg`)
- shadow:
  - FileCard: `shadow-sm` (token `shadow/sm` = drop-shadow #0000000D offset(0,1) blur 2)
- size:
  - PDF icon: 24×24 → `w-6 h-6`
  - FileCard: 578×64 → `w-[578px] h-16`

### Section: TabContent Empty (13257:481725)
- colors:
  - BG: `#ffffff`
  - Title: `#18181b`
  - Description: `#71717a`
- typography:
  - Title: 20px / lh 28px / weight 600 → `text-xl font-semibold` (token `typography/base sizes/xlarge`)
  - Description: 14px / lh 20px / weight 400 → `text-sm`
- spacing:
  - EmptyData padding: 24px all → `p-6`
  - Content gap (icon → text block): 24px → `gap-6`
  - Text block gap (title → description): 4px → `gap-1`
- size:
  - EmptyData: 1216×400 → `w-[1216px] h-[400px]`
  - Icon illustration: 120×120

### Section: TabNav (13257:480949 inside)
- colors:
  - Tab active text: `#0052ff` → `text-primary` (brand-CD)
  - Tab active border-bottom: 2px solid `#0052ff` → `border-b-2 border-primary`
  - Tab inactive text: `#71717a`
  - TabNav border-bottom: 1px solid `#e4e4e7`
- typography:
  - Tab label: 14px / weight 500 → `text-sm font-medium`
- spacing:
  - TabNav: 1216×56 → `h-14`
  - Tab item gap: 24px → `gap-6`

---

## Screenshots
> assets/wave02-ins-dossier-view/
- `_full.png` — STL-DETAIL · Tab "Hồ sơ bảo hiểm đã xuất" Populated (13257:480949, full screen 1440×1887)
- `13257-481612-empty.png` — STL-DETAIL · Tab Empty state (13257:481612, full screen 1440×1364)
- `13257-481064-dossier-sets.png` — Tab content populated zoom vào DossierList với 3 bộ hồ sơ × 4 file cards (13257:481064, 1216×923)
