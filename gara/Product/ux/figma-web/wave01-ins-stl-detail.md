---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13255:177002"
fetched_at: 2026-06-05T09:10:00+07:00
transform_version: 6
screenshots: true
screens_expected: 4
coverage_gaps:
  - "AC-1/AC-12: design label thanh hành động = 'Xuất hồ sơ bảo hiểm (PDF)' (layer name = 'In toàn bộ hồ sơ') — FEAT AC-1/AC-12 ghi 'In toàn bộ hồ sơ'. DEV theo label AC (hoặc confirm Business Authority). Nút primary cạnh = 'Tạo hồ sơ bảo hiểm' (AC-13)."
  - "AC-1/AC-2: nút 'In phiếu' (size sm, icon chevron-down, góc phải khối 'Thông tin quyết toán') — khả năng là 'Button placeholder' AC-1 nói bỏ qua, hoặc print-dropdown thật. Verify Business Authority."
  - "AC-3: design tách 'Dòng xe' (Camry) RIÊNG khỏi 'Hãng xe' (Toyota) — AC-3 chỉ liệt 'Hãng xe (vd Honda - Civic)'. Spec capture cả 2 trường (Dòng xe + Hãng xe)."
  - "AC-5: bảng line-item demo hiển thị TRỘN dòng 'C- Khách hàng' + 'I - Bảo hiểm' — PO chốt 2026-06-02: phiếu QT BH chỉ hiển thị hạng mục Nguồn TT = Bảo hiểm. DEV filter 'Bên thanh toán = Bảo hiểm' (design demo data chưa filter)."
  - "AC-5: phân trang (AC '10/trang') không thấy trong frame đã chụp (5 dòng + footer 'Tổng'). Verify pagination control khi >10 dòng."
  - "AC-6: header phần 3 trong design = 'Cần thanh toán'; FEAT AC-6 ghi 'Cân thanh toán'. DEV theo design ('Cần thanh toán') trừ khi Business Authority xác nhận khác. Dấu (+/−) + màu Phân bổ + highlight 3 ô Cân thanh toán = data-driven (demo data hiển thị giá trị thuần, chưa thấy ô xanh/cam/đen)."
  - "AC-9: tab 'Lịch sử thanh toán' frame đã chụp = empty-state ('Không tồn tại bản ghi!'). Cột AC-9 (Ngày/Số tiền/Phương thức/Ghi chú/File đính kèm) data-driven — render bảng baseline khi có dữ liệu."
  - "AC-8: tab 'Hồ sơ bảo hiểm đã xuất' nội dung thuộc FEAT-INS-DOSSIER-VIEW (out of scope STL-DETAIL) — capture structural, không spec sâu."
  - "Header status badge 'Chờ thanh toán' (warning #ea580c/#fff7ed) hiển thị cạnh mã phiếu — không nêu trong AC (settlement status baseline). Document làm context."
---

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes |
|---|---|---|---|
| vuesax/linear/arrow-left (back) | iconsax-reactjs (`ArrowLeft`) | Linear | nút back header (AC-1) |
| vuesax/linear/edit (Chỉnh sửa) | iconsax-reactjs (`Edit2`) | Linear | nút "Chỉnh sửa" (AC-1) |
| vuesax/linear/arrow-down (In phiếu) | iconsax-reactjs (`ArrowDown`) | Linear | nút "In phiếu" dropdown (AC-2) |
| pdf-file | (custom/asset SVG) | — | icon đỏ thẻ tài liệu PDF (tab Hồ sơ BH đã xuất) |
| empty-box illustration | (asset SVG) | — | empty-state "Không tồn tại bản ghi!" (tab Chứng từ / Lịch sử TT) |

> Garage web: `iconsax-reactjs` (⚠ KHÔNG `iconsax-react`) cho icon có variant; `lucide-react` cho generic.
> `iconsax-reactjs` cần `color` prop tường minh (vd `<Edit2 size="16" color="#18181b" />`).

---

## Tokens (variable_defs — node 13256:45155)

| Token | Value | Dùng cho |
|---|---|---|
| `base/foreground` | #18181b | text chính |
| `base/muted-foreground` | #71717a | label phụ, meta |
| `base/foreground-brand-CD` / `base/background-brand-CD` | #0052ff | link "Phiếu DV liên kết", value Tổng thanh toán, nút primary |
| `base/primary-foreground` | #ffffff | text nút primary |
| `base/background` | #ffffff | nền |
| `base/input` | #d4d4d8 | viền button outline |
| `base/foreground-warning` | #ea580c | text badge status "Chờ thanh toán" |
| `base/background-warning` | #fff7ed | nền badge status "Chờ thanh toán" |
| `tailwind colors/purple/500` | #a855f7 | text badge "Bảo hiểm" (Bên thanh toán) |
| `tailwind colors/purple/50` | #faf5ff | nền badge "Bảo hiểm" |
| `base/accent` | #f4f4f5 | nền Table/Head |
| `base/border` | #e4e4e7 | viền cell/divider |
| `alpha/50` | #ffffff80 | nền row "Phân bổ BH" + "Cân thanh toán" (panel AC-6) |
| `Color/Base/black` | #000000 | text value đậm |
| radius | md=6 → `rounded-md` (button/input) · lg=8 → `rounded-lg` (badge) | — |
| shadow | `shadow/sm`=0 1px 2px #0000000D · `shadow/base`=0 1px 2px #0000000F + 0 1px 3px #0000001A | input / card |
| typography | Inter · 2xlarge 24/32 · xlarge 20/28 · large 18/28 · small 14/20 · extra-small 12/16 · weight 400/500/600/700 | — |
| spacing | 0·0.5=2·1=4·1.5=6·2=8·2.5=10·3=12·4=16·5=20·6=24·8=32 (4px scale) | — |

---

## Screen: Chi tiết phiếu QT BH — Tab "Bảng chi phí" (mặc định) (13256:45155)

> Màn **Chi tiết phiếu quyết toán bảo hiểm**. Tab "Bảng chi phí" active (mặc định). Screen canonical (1440×2400) — chứa **Nhóm A** (Header AC-1 + Thông tin quyết toán AC-2 + Thông tin KH&xe AC-3) + **Tab bar** (AC-4) + nội dung tab Bảng chi phí (**AC-5** bảng hạng mục full-width + **AC-6** panel "Tổng giá dịch vụ" right-aligned, dưới bảng).

- Layout: vertical, 1440x2400px, gap=0
- Background: #ffffff
- Container: single-column (Navbar → Page content → Page container 1280 → Container 1216)
- Layout Tree:
  ```
  Page container (1280) [vertical]
  └── Container (1216) [vertical, gap=32, padding=0_32_0_32]
      ├── ### Nhóm A — Header & thông tin chung (13262:56407) [vertical, gap=32, w-[1216px]]
      │   ├── AC-1 Header phiếu QT BH + thanh hành động (1216×80) [horizontal, justify-between]
      │   ├── AC-2 Khối "Thông tin quyết toán" (1216×172) [vertical]
      │   └── AC-3 Khối "Thông tin khách hàng & xe" (1216×164) [vertical]
      └── ### Nhóm B — 4 tabs nội dung (13256:45315) [vertical, w-[1216px]]
          ├── AC-4 Bộ 4 tab (1216×56) [horizontal tab list]
          └── tab "Bảng chi phí" active (stacked dọc — KHÔNG side-by-side):
              ├── AC-5 bảng hạng mục (13262:56411) [vertical, w-[1216px], h-[792px], x=0 y=80]
              │   ├── Section "Dịch vụ thực hiện" (1216×384)
              │   └── Section "Phụ tùng sử dụng" (1216×384)
              └── AC-6 panel "Tổng giá dịch vụ" (13257:550593) [vertical, w-[600px], x=616 y=896 — right-aligned, DƯỚI bảng AC-5]
                  ├── "Chi tiết theo bên thanh toán" → Row/Columns [horizontal, 3 cột × w-[200px], Σ=600]
                  │   ├── Column "Khoản mục" [w-[200px], x=0]
                  │   ├── Column "Bảo hiểm thanh toán" [w-[200px], x=200, cạnh Khoản mục]
                  │   └── Column "Khách hàng thanh toán" [w-[200px], x=400, cạnh Bảo hiểm]
                  ├── "Phân bổ Bảo hiểm" → 5 row [label FILL | value w-[200px]]
                  └── "Cần thanh toán" → 3 row [label FILL | value w-[200px]]
  ```
  > **I-25 note**: AC-5 (w=1216, y=80..872) và AC-6 (w=600, x=616, y=896..1712) **stacked dọc** — KHÔNG overlap dọc → đúng vertical; AC-6 chỉ right-aligned (x=616) dưới bảng (xem `_full.png`). Side-by-side THẬT chỉ ở: (1) Row/Columns trong AC-6 (3 cột 200+200+200=600); (2) AC-8 tab (cột list 460 + preview 756 = 1216, screen "Hồ sơ BH đã xuất").

### Nhóm A — Header & thông tin chung (13262:56407)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout (vertical, gap=32)

#### AC-1 — Header phiếu QT BH + thanh hành động (13256:45160)
- Bounds: w=FILL h=FIXED(80px) → tw: h-20
- Layout-mode: auto-layout
- Layout: horizontal, justify=between, items=center, padding y=20
- Left group (gap=8, items=center):
  - Button/Ghost size=icon (back): w=FIXED(40px) → tw: size-10; BG transparent radius=rounded-md
    - Icons: standalone: iconsax-reactjs/ArrowLeft/Linear, 20px, #18181b
    → shadcn: `<Button variant="ghost" size="icon"><ArrowLeft size="20" color="#18181b" /></Button>`
  - Text: "#SET-20260326-00001" 24px weight=600 lh=32px color=#18181b
  - Badge status "Chờ thanh toán": BG #fff7ed border transparent radius=rounded-lg px=10 py=2; Text 14px weight=500 lh=20px color=#ea580c `{/* settlement status baseline — không nêu AC */}`
    → shadcn: `<Badge variant="warning">Chờ thanh toán</Badge>`
- Right group (Button list, gap=12 outer / 8 inner, items=end):
  - Button "Chỉnh sửa": outline; Bounds h=FIXED(40px) → tw: h-10; BG #ffffff border 1px solid #d4d4d8 radius=rounded-md px=32 py=8 shadow=shadow-sm; Icons: leading iconsax-reactjs/Edit2/Linear, 16px, #18181b; Text 14px w500 lh=20px color=#18181b
    → shadcn: `<Button variant="outline" size="lg"><Edit2 size="16" color="#18181b" />Chỉnh sửa</Button>` (AC-1)
  - Button "Xuất hồ sơ bảo hiểm (PDF)": outline; h=FIXED(40px) → tw: h-10; BG #ffffff border 1px solid #d4d4d8 radius=rounded-md px=32 py=8 shadow=shadow-sm; Text 14px w500 lh=20px color=#18181b
    → shadcn: `<Button variant="outline" size="lg">Xuất hồ sơ bảo hiểm (PDF)</Button>` `{/* AC-1/AC-12 ghi "In toàn bộ hồ sơ" — layer name = "In toàn bộ hồ sơ" — follow AC label, verify */}`
  - Button "Tạo hồ sơ bảo hiểm": **primary/brand**; h=FIXED(40px) → tw: h-10; BG #0052ff radius=rounded-md px=32 py=8 shadow=shadow-base; Text 14px w500 lh=20px color=#ffffff
    → shadcn: `<Button variant="brand" size="lg">Tạo hồ sơ bảo hiểm</Button>` (AC-13 — chỉ enable khi DRAFT, BR-INS-STL-DET-004)
→ shadcn: `<header className="flex justify-between items-center">` (left: back + h1 + Badge | right: action bar)

#### AC-2 — Khối "Thông tin quyết toán" (13256:45161)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(172px) → tw: h-[172px]
- Layout-mode: auto-layout (vertical)
- Title row (pb=16, items=center, justify=between):
  - Text "Thông tin quyết toán" 18px weight=600 lh=28px color=#18181b
  - Button "In phiếu": outline size=sm; h=FIXED(32px) → tw: h-8; BG #ffffff border 1px solid #d4d4d8 radius=rounded-md px=12 py=8 shadow=shadow-sm; Icons: leading iconsax-reactjs/ArrowDown/Linear, 16px, #18181b; Text 12px w500 lh=16px color=#18181b
    → shadcn: `<Button variant="outline" size="sm"><ArrowDown size="16" color="#18181b" />In phiếu</Button>` `{/* possible AC-1 placeholder — verify Business Authority */}`
- Info grid (4 cột × 2 hàng — InforItem: label 14px w400 #71717a trên + value 14px w500 #18181b dưới, gap=8, hàng gap=24):
  - "Phiếu dịch vụ liên kết": value "#PHDV-20240723-001" → **link color=#0052ff** (clickable → SO)
  - "Bên thanh toán": Badge "Bảo hiểm" — BG #faf5ff border transparent radius=rounded-lg px=10 py=2; Text 14px w500 color=#a855f7 (purple)
    → shadcn: `<Badge variant="new">Bảo hiểm</Badge>` (purple)
  - "Người tạo": value (vd "Chủ doanh nghiệp")
  - "Ngày tạo": value (vd "29/01/2026 13:00")
  - "Cập nhật lần cuối": value (vd "29/01/2026 13:00 (Nguyễn Văn A)")
  - "Ghi chú quyết toán": value (vd "Chờ bảo hiểm duyệt giá lọc dầu"; — nếu trống)
→ shadcn: `<section>` Title row (h3 + Button In phiếu) + grid InfoItem; "Phiếu DV liên kết" = `<a className="text-primary">`; "Bên thanh toán" = `<Badge>` purple

#### AC-3 — Khối "Thông tin khách hàng & xe" (13256:45222)
- Bounds: w=FILL h=FIXED(164px) → tw: h-[164px]
- Layout-mode: auto-layout (vertical)
- Title: "Thông tin khách hàng & xe" 18px weight=600 lh=28px color=#18181b (pb=16)
- Info grid (snapshot từ SO, read-only — InforItem label 14px w400 #71717a / value 14px w500 #18181b, gap=8; 2 hàng gap=24):
  - Hàng 1 (w-[292px]/cột): "Tên khách hàng" (vd "Nguyễn Minh Tâm") · "Số điện thoại" (vd "0942328562") · "Loại khách hàng" (vd "Tổ chức")
  - Hàng 2 (FILL/cột, 4 cột): "Biển số xe" (vd "25B2-09284") · "Dòng xe" (vd "Camry") · "Hãng xe" (vd "Toyota") · "Số km đã chạy" (vd "1.000")
  > AC-3 liệt "Hãng xe (vd Honda - Civic)"; design tách "Dòng xe" + "Hãng xe" riêng → capture cả 2. Xem coverage_gaps.
→ shadcn: `<section>` + grid InfoItem (read-only)

### Nhóm B — 4 tabs nội dung (13256:45315)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout (vertical)

#### AC-4 — Bộ 4 tab (tab bar) (13256:45316)
- Bounds: w=FILL h=FIXED(56px) → tw: h-14
- Layout-mode: auto-layout
- Layout: horizontal (tab list); tab active có underline/foreground nhấn
- Tabs: **"Bảng chi phí"** (active) · "Chứng từ & hoá đơn" · "Hồ sơ bảo hiểm đã xuất" · "Lịch sử thanh toán"
- Text tab 14px weight=500 lh=20px; active color=#18181b/brand, inactive color=#71717a
→ shadcn: `<Tabs><TabsList><TabsTrigger>…×4</TabsList></Tabs>` (AC-4; tab "Hồ sơ BH đã xuất" + "Lịch sử thanh toán" mở rộng vs phiếu QT KH baseline 3 tab)

#### Tab "Bảng chi phí" — nội dung (AC-5 bảng full-width TRÊN + AC-6 panel right-aligned w-[600px] x=616 DƯỚI — stacked dọc, KHÔNG side-by-side)

##### AC-5 — Bảng hạng mục (13262:56411) — read-only, snapshot
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(792px) → tw: h-[792px]; Position: top=80 left=0
- Layout-mode: auto-layout (vertical, gap=24)
- **Bảng "Dịch vụ thực hiện" (13256:45317, 1216×384)**: cột STT | Tên dịch vụ | Bên thanh toán | Người thực hiện | Đơn giá | Số lượng | Chiết khấu | Thuế | Thành tiền
  - Head row: BG #f4f4f5, border-b 1px #e4e4e7, 14px w500 #18181b; cột số/tiền right-align
  - Cell 14px w400 #18181b; "Bên thanh toán" = "C- Khách hàng" / "I - Bảo hiểm" (text/badge)
  - Footer "Tổng": Số lượng=Σ (vd 5), Đơn giá=Σ (1.000.000đ), Thuế=Σ (1.000.000đ), Thành tiền=Σ (5.000.000đ) — weight=600
- **Bảng "Phụ tùng sử dụng" (13256:45320, 1216×384)**: cột STT | Tên phụ tùng | Bên thanh toán | Phân khúc | Đơn vị tính | Đơn giá | Số lượng | Chiết khấu | **Khấu hao VT** | Thuế | Thành tiền
  - Tên phụ tùng truncate (`text-ellipsis`); cột "Khấu hao VT" (%) = neo per-line khấu hao (FEAT-INS-SO-ADJUSTMENT AC-5b)
  - Text overflow: truncate (tên PT cell)
  - Footer "Tổng" tương tự (5 / 1.000.000đ / 1.000.000đ / 5.000.000đ) — weight=600
- ⚠️ **AC-5 (PO chốt)**: phiếu QT BH chỉ hiển thị hạng mục **Nguồn TT = Bảo hiểm** — DEV filter `Bên thanh toán = Bảo hiểm` (design demo trộn C/I chưa filter). Phân trang (10/trang) khi >10 dòng. Xem coverage_gaps.
→ shadcn: 2× `<Table>` (Dịch vụ thực hiện / Phụ tùng sử dụng) read-only + footer "Tổng" + `<Pagination>`; data filter payer=Bảo hiểm

##### AC-6 — Panel "Tổng giá dịch vụ" (13257:550593) — read-only
- Bounds: w=FIXED(600px) → tw: w-[600px] h=FIXED(816px) → tw: h-[816px]; Position: top=896 left=616 (right-aligned trong Container 1216, DƯỚI bảng AC-5)
- Layout-mode: auto-layout (vertical)
- BG: #ffffff
- Title: "Tổng giá dịch vụ" 18px weight=600 lh=28px color=#18181b (pb=16)

###### "Chi tiết theo bên thanh toán" → Row/Columns (13257:550597) — bảng 3 cột side-by-side (I-25)
- Subheader: "Chi tiết theo bên thanh toán" 14px weight=600 color=#000000 (padding=8)
- Bounds: w=FIXED(600px) → tw: w-[600px]; overflow=hidden
- Layout: horizontal (3 cột × w-[200px], Σ=600 = container width ✓)
  ####### Column "Khoản mục" (13257:550598)
  - Bounds: w=FIXED(200px) → tw: w-[200px], x=0; overflow=hidden
  - Head: BG #f4f4f5 border-b 1px #e4e4e7 h=FIXED(40px) → tw: h-10 px=8; Text "Khoản mục" 14px w500 #18181b (left-align)
  - Cell ×4 (h=FIXED(52px) → tw: h-13, p8, 14px w400 #18181b): "Dịch vụ" · "Phụ tùng" · "VAT" · **"Cộng sau VAT"** (w600, border-b #e4e4e7)
  ####### Column "Bảo hiểm thanh toán" (13257:550625)
  - Bounds: w=FIXED(200px) → tw: w-[200px], x=200, cạnh "Khoản mục"; overflow=hidden
  - Head: BG #f4f4f5 border-b 1px #e4e4e7 h-10 px=8 justify=end; Text "Bảo hiểm thanh toán" 14px w500 #18181b (right-align)
  - Cell ×4 (h-13, p8, 14px w500 #000000, text-right, truncate): value tiền (vd "95.040đ" · "95.040đ" · "95.040đ" · "50.000đ") — Cộng sau VAT border-b
  ####### Column "Khách hàng thanh toán" (13257:550631)
  - Bounds: w=FIXED(200px) → tw: w-[200px], x=400, cạnh "Bảo hiểm thanh toán"; overflow=hidden
  - Head: BG #f4f4f5 border-b 1px #e4e4e7 h-10 px=8 justify=end; Text "Khách hàng thanh toán" 14px w500 #18181b (right-align)
  - Cell ×4 (h-13, p8, 14px w500 #000000, text-right, truncate): value tiền (vd "0đ" · "95.040đ" · "95.040đ" · "95.040đ") — Cộng sau VAT border-b
  → shadcn: `<Table>` 3 cột (Khoản mục | Bảo hiểm thanh toán | Khách hàng thanh toán) × 4 row (Dịch vụ/Phụ tùng/VAT/Cộng sau VAT)

###### "Phân bổ Bảo hiểm" (13257:550637) — 5 row
- Subheader: "Phân bổ Bảo hiểm" 14px weight=600 color=#000000 (padding=8)
- Row pattern (Footer 13257:550639..550651, h=FIXED(52px) → tw: h-13, BG #ffffff80 [alpha/50]): label cell FILL (14px w500 #18181b, left) | value cell w=FIXED(200px) → tw: w-[200px] (14px w500, text-right)
  - "CK liên kết BH — Vật tư" → value (vd "50.000.000đ") `{/* dấu (−) data-driven — xem coverage_gaps */}`
  - "CK liên kết BH — Công dịch vụ" → value (−)
  - "Giảm trừ bồi thường" → value (+)
  - "Khấu hao vật tư / thay mới" → value (+)
  - "Khấu trừ BH" → value (+ ; row border-b #e4e4e7, label w400)
→ shadcn: 5× row [label FILL | value w-[200px] text-right] — dấu/màu data-driven theo AC-6

###### "Cần thanh toán" (13257:550654) — 3 row (Cân thanh toán)
- Subheader: "Cần thanh toán" 14px weight=600 color=#000000 (padding=8) `{/* AC-6 ghi "Cân thanh toán" — design = "Cần thanh toán" — xem coverage_gaps */}`
- Row pattern (Footer 13257:550656..550662, h-13, BG #ffffff80): label FILL | value w-[200px] text-right
  - "Bảo hiểm thanh toán" → value 14px w500 #18181b (vd "50.000.000đ") `{/* AC-6: ô xanh — highlight data-driven */}`
  - "Khách hàng thanh toán" → value 14px w500 #18181b (vd "50.000.000đ") `{/* AC-6: ô cam */}`
  - "Tổng thanh toán" → label w600; value **20px weight=600 lh=28px color=#0052ff** (vd "50.000.000đ") `{/* AC-6: ô đen — design highlight = brand blue value */}`
- ⚠️ read-only (BR-INS-STL-DET-001: "BH thanh toán" computed snapshot, không sửa tay).
→ shadcn: 3× row [label | value text-right]; "Tổng thanh toán" value text-primary 20px w600
→ shadcn (panel tổng): tái dùng component panel "Tổng giá dịch vụ" của SO-ADJUSTMENT (read-only variant, M5 cross-spec consistency với `wave01-ins-so-adjustment.md` §Nhóm C)

---

## Screen: Chi tiết phiếu QT BH — Tab "Chứng từ & hoá đơn" (13256:46273)

> State variant (1440×1168) — tab "Chứng từ & hoá đơn" active (AC-7). Nhóm A (13262:56408 — Header AC-1 + Thông tin quyết toán AC-2 + Thông tin KH&xe AC-3) **giống hệt** screen "Bảng chi phí" (M5 cross-frame consistency). Khác: nội dung tab.

- Layout: vertical, 1440x1168px, gap=0; Background: #ffffff; Container: single-column
- Layout-mode: auto-layout (vertical)
- Nhóm A (13262:56408): identical screen "Bảng chi phí" §Nhóm A (canonical block ở trên).
- Nhóm B (13256:46433, w=1216 h=480) → AC-4 tab bar (tab "Chứng từ & hoá đơn" active) + nội dung:

### AC-7 — Tab "Chứng từ & hoá đơn" (13256:48512) — empty-state
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(400px) → tw: h-[400px]
- Layout-mode: auto-layout (vertical, items=center, justify=center)
- Empty illustration (open-box SVG asset) + Text "Không tồn tại bản ghi!" 18px weight=600 lh=28px color=#18181b + subtitle "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." 14px w400 color=#71717a
- ⚠️ AC-7: reuse cơ chế baseline FEAT-STL-DETAIL (xem/thêm/xoá chứng từ); frame đã chụp = empty. Khi có dữ liệu → bảng chứng từ/hoá đơn baseline.
→ shadcn: `<EmptyState illustration title="Không tồn tại bản ghi!" desc="Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." />` (component baseline)

## Screen: Chi tiết phiếu QT BH — Tab "Hồ sơ bảo hiểm đã xuất" (13256:47395)

> State variant (1440×1667) — tab "Hồ sơ bảo hiểm đã xuất" active (AC-8). Nhóm A (13262:56409) **giống hệt** (M5). **Nội dung tab thuộc FEAT-INS-DOSSIER-VIEW** (out of scope STL-DETAIL) — capture structural.

- Layout: vertical, 1440x1667px, gap=0; Background: #ffffff; Container: single-column
- Layout-mode: auto-layout (vertical)
- Nhóm A (13262:56409): identical screen "Bảng chi phí" §Nhóm A.
- Nhóm B (13256:47555, w=1216 h=979) → AC-4 tab bar (tab "Hồ sơ bảo hiểm đã xuất" active) + nội dung:

### AC-8 — Tab "Hồ sơ bảo hiểm đã xuất" (13256:230242) — Row/2-column (list + PDF preview) (I-25)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(923px) → tw: h-[923px]
- Layout-mode: auto-layout
- Layout: horizontal (2 cột side-by-side, Σ=460+756=1216 = container width ✓)
  #### Column/"Bộ hồ sơ" (cột trái) (13256:230243)
  - Bounds: w=FIXED(460px) → tw: w-[460px] h=FILL, x=0
  - Layout: vertical (list các nhóm "Document set container", scroll-y khi tràn)
  - Mỗi Document set:
    - Title card: "Bộ hồ sơ #SET-20260326-00001" 14px w500 #18181b + meta "Xuất ngày 26/03/2026 08:12 · 5 tài liệu PDF" 12px w400 #71717a
    - Document card (mỗi tài liệu): icon PDF đỏ + "Phiếu quyết toán.pdf - 100kb" 14px #18181b + "#SET-20260326-00001" 12px #71717a + Badge "Đã xuất" (success green) bên phải; card selected có border 1px #0052ff radius=rounded-lg
  - Overflow: scroll-y
  #### Column/"Preview file PDF" (cột phải) (13256:230266)
  - Bounds: w=FIXED(756px) → tw: w-[756px] h=FILL, x=460, cạnh "Bộ hồ sơ"
  - Layout: vertical
  - Header: "Phiếu quyết toán.pdf" 18px w600 #18181b + meta "2 trang · 348 KB · Chỉ xem" 14px #71717a + (góc phải) Button "Xem PDF" outline
    → shadcn: `<Button variant="outline">Xem PDF</Button>`
  - Khung preview render PDF (Phiếu dịch vụ — Garage BD Miền Bắc…): nền nhạt, document mock canh giữa
- ⚠️ **Out of scope STL-DETAIL** — nội dung versioning hồ sơ BH thuộc `FEAT-INS-DOSSIER-VIEW`. Spec capture structural; chi tiết xem spec DOSSIER-VIEW.
→ shadcn: 2-col layout `<div className="flex"><aside className="w-[460px]">…document-set list…</aside><main className="w-[756px]">…PDF viewer…</main></div>` — component FEAT-INS-DOSSIER-VIEW

## Screen: Chi tiết phiếu QT BH — Tab "Lịch sử thanh toán" (13257:465756)

> State variant (1440×1168) — tab "Lịch sử thanh toán" active (AC-9). Nhóm A (13262:56410) **giống hệt** (M5).

- Layout: vertical, 1440x1168px, gap=0; Background: #ffffff; Container: single-column
- Layout-mode: auto-layout (vertical)
- Nhóm A (13262:56410): identical screen "Bảng chi phí" §Nhóm A.
- Nhóm B (13257:465916, w=1216 h=480) → AC-4 tab bar (tab "Lịch sử thanh toán" active) + nội dung:

### AC-9 — Tab "Lịch sử thanh toán" (13257:465918) — empty-state (frame đã chụp)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(400px) → tw: h-[400px]
- Layout-mode: auto-layout (vertical, items=center, justify=center)
- Empty illustration (open-box SVG) + "Không tồn tại bản ghi!" 18px w600 lh=28px #18181b + "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị." 14px w400 #71717a
- ⚠️ **AC-9 (data-driven)**: khi có dữ liệu → bảng lịch sử thanh toán BH (component baseline, **read-only**) cột: **Ngày · Số tiền · Phương thức · Ghi chú · File đính kèm**, sắp xếp giảm dần theo ngày. Frame đã chụp = empty-state. Xem coverage_gaps.
→ shadcn: `<Table>` lịch sử thanh toán (read-only) khi có data; fallback `<EmptyState>` khi rỗng. *(Ghi nhận thanh toán = baseline production, ngoài scope — chỉ hiển thị read-only.)*

---

## Screenshots
> assets/wave01-ins-stl-detail/
- `13256-45155_full.png` — Screen tab "Bảng chi phí" (toàn màn, 1440×2400, canonical)
- `13256-46273_full.png` — Screen tab "Chứng từ & hoá đơn" (1440×1168)
- `13256-47395_full.png` — Screen tab "Hồ sơ bảo hiểm đã xuất" (1440×1667)
- `13257-465756_full.png` — Screen tab "Lịch sử thanh toán" (1440×1168)
- `13262-56407.png` — Section: Nhóm A (Header AC-1 + Thông tin quyết toán AC-2 + Thông tin KH&xe AC-3)
- `13262-56411.png` — Section: AC-5 bảng hạng mục (Dịch vụ thực hiện + Phụ tùng sử dụng)
- `13257-550593.png` — Section: AC-6 panel "Tổng giá dịch vụ" (= SO-ADJ Nhóm C; gồm Row/Columns 3 cột side-by-side)
- `13256-48512.png` — Section: AC-7 tab "Chứng từ & hoá đơn" (empty-state)
- `13256-230242.png` — Section: AC-8 tab "Hồ sơ bảo hiểm đã xuất" (Row/2-column: list 460 + PDF preview 756 — DOSSIER-VIEW)
- `13257-465918.png` — Section: AC-9 tab "Lịch sử thanh toán" (empty-state)
