---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:469505"
screen_slug: edit
fetched_at: 2026-06-05T09:06:00+07:00
transform_version: 6
screenshots: true
screens_expected: 3
coverage_gaps:
  - "AC-12: cảnh báo \"BH thanh toán không thể âm\" — không có state nào chụp giá trị âm; ô \"Bảo hiểm thanh toán\" trong khối Cân thanh toán render bình thường ở mọi state đã chụp, verify intended error/highlight state"
  - "AC-14: thông báo lỗi validate per-field (vd \"Chiết khấu không thể lớn hơn 100%\") — không hiển thị ở state default đã chụp (các input ở giá trị hợp lệ); control nhập tồn tại, message error là runtime state"
---

# wave01 · FEAT-INS-SO-ADJUSTMENT — Web (garage-web) · Screen: Chỉnh sửa (Edit)

> Node link `13257:469505` là Figma **section** chứa 4 top-level frame. 3 frame là state của màn **"Chỉnh sửa | Dịch vụ xe"** (Edit — thuộc FEAT này, `screens_expected=3`); frame thứ 4 `13270:206807` "Chi tiết phiếu dịch vụ…" = màn **Detail** (gen ở `wave01-ins-so-adjustment--detail.md`, loại khỏi unit Edit này).
>
> 3 state Edit có **layout trang giống hệt nhau**; chỉ khác data-fill ở các section trên (Thông tin dịch vụ / Thông tin xe khác chiều cao). Toàn bộ nội dung MỚI của FEAT — panel **Nhóm B "Phân bổ quyết toán bảo hiểm"** + panel **Nhóm C "Tổng giá dịch vụ"** — **identical** giữa 3 state (M5 cross-frame consistency). State A là block canonical đầy đủ; State B/C chỉ ghi delta + reference canonical.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes |
|---|---|---|---|
| vuesax/linear/arrow-down | lucide-react (`ChevronDown`) | — | indicator dropdown đơn vị (VND/%) trong input 5 khoản điều chỉnh — Nhóm B |
| vuesax/bold/info-circle | iconsax-reactjs (`InfoCircle`) | Bold | tooltip info cạnh label "Bảo hiểm" (hidden ở state đã chụp) |

> `vuesax/*` trong Figma = bộ iconsax. Generic chevron dropdown → `lucide-react` `ChevronDown` (theo convention garage-web). Icon có variant rõ → `iconsax-reactjs` + `color` tường minh.

---

## Screen: Chỉnh sửa | Dịch vụ xe — State A (13257:546398)

- Layout: vertical, 1440x3516px, gap=0
- Background: #ffffff
- Padding: 0 (Page container 80px lề trái/phải qua `Page content`)
- Container: single-column (page-level) — Navbar → Page content → Section Footer; trong Page content có **2 panel FEAT (Nhóm C nằm phải dưới line-item, Nhóm B full-width dưới cùng)**, mỗi panel chứa zone multi-column riêng (xem Layout Tree + I-25).
  - Section gap (Container con): 24px (gap giữa các section info)
  - Fields gap: 16px (gap-4 trong panel Nhóm B)
- Layout Tree:
  ```
  Frame/Chỉnh sửa | Dịch vụ xe [vertical, 1440x3516]
  ├── Navbar (13257:546399) [FIXED 1440x104]
  ├── Page content (13257:546400) [vertical, 1440x3412]
  │   └── Page container (13257:546401) [vertical, w-[1280px], x=80]
  │       ├── Page Header / 5 (13257:546402) [FIXED 1216x80]
  │       └── Container (13257:546403) [vertical, w-[1216px], x=32, gap=24]
  │           ├── Section/Bảo hiểm + Upload (13257:546404) [HIDDEN ở state này]
  │           ├── Thông tin KH (13257:546431) [INSTANCE, w-full h-[154px]]
  │           ├── Thông tin dịch vụ (13257:546432) [INSTANCE, w-full h-[176px]]
  │           ├── Thông tin xe (13257:546433) [INSTANCE, w-full h-[964px]]
  │           ├── Container/Phí dịch vụ (13257:546434) [Title + Service details input table]
  │           ├── Section/Phụ tùng (13257:546437) [Title + Parts details input table — có cột "Khấu hao VT" %]
  │           ├── Panel/Tổng giá dịch vụ — Nhóm C (13257:550991) [col, w-[600px], x=616 → nửa phải]
  │           │   ├── Title text "Tổng giá dịch vụ"
  │           │   ├── Table/Chi tiết theo bên thanh toán (AC-9) [3 cột — xem Row dưới]
  │           │   │   └── Row/Columns (13257:550995) [horizontal]
  │           │   │       ├── Column/Khoản mục [col, flex-1, x=0]
  │           │   │       ├── Column/Bảo hiểm thanh toán [col, w-[200px], x=200, cạnh Khoản mục]
  │           │   │       └── Column/Khách hàng thanh toán [col, w-[200px], x=400, cạnh BH]
  │           │   ├── Table/Phân bổ Bảo hiểm (AC-10) [5 dòng: label flex-1 | value w-[200px]]
  │           │   └── Block/Cân thanh toán (AC-11) [3 dòng footer: label | value w-[200px]]
  │           └── Section/Phân bổ quyết toán bảo hiểm — Nhóm B (13257:551696) [col, w-[1216px], x=0 → full-width]
  │               ├── Title text "Phân bổ quyết toán bảo hiểm" + Badge "Bảo hiểm"
  │               └── Content [vertical, gap=16]
  │                   ├── Footer Note (công thức) [text, w-[772px]]
  │                   ├── Row/Flex-1 (13257:551700) [horizontal, gap=16]
  │                   │   ├── Field/CK liên kết BH — Vật tư (AC-3) [col, flex-1 ≈ w-[600px], x=0]
  │                   │   └── Field/CK liên kết BH — Công dịch vụ (AC-4) [col, flex-1 ≈ w-[600px], x=616, cạnh AC-3]
  │                   ├── Row/Flex-2 (13257:551703) [horizontal, gap=16]
  │                   │   ├── Field/Khấu hao vật tư / thay mới (AC-5) [col, w-[600px], x=0]
  │                   │   └── Field/Áp dụng tất cả (AC-8) [col, w-[296px], x=616, pt-[22px], cạnh AC-5]
  │                   └── Row/Flex-3 (13257:551707) [horizontal, gap=16]
  │                       ├── Field/Giảm trừ bồi thường (AC-6) [col, flex-1 ≈ w-[600px], x=0]
  │                       └── Field/Khấu trừ bảo hiểm (AC-7) [col, flex-1 ≈ w-[600px], x=616, cạnh AC-6]
  └── Section Footer / 2 (13257:546441) [FIXED 1440x48]
  ```

> **Multi-column (I-25)** — 2 cụm side-by-side đã encode container ngang:
> - Nhóm B 3 Row: mỗi Row 2 cột x=0 và x=616 (mỗi cột flex-1 ≈ 600px; AC-8 = 296px). Σ = 600 + gap16 + 600 = 1216 ✓ (khớp container Nhóm B w-[1216px]).
> - Nhóm C AC-9 table: 3 cột x=0 / x=200 / x=400 (Khoản mục flex-1 + 200 + 200). Σ 2 cột phải = 400, cột trái lấp phần còn lại trong w-[600px] ✓.

> **Section/Bảo hiểm (13257:546404) HIDDEN ở cả 3 state đã chụp** nhưng là khu vực BASELINE production (toggle "Bảo hiểm" Không/Có + 4 Input + 4 Select + Radio "Bảo hiểm" + Upload "Hình ảnh xe"). KHÔNG dev lần này (AC-2). Structure giữ trong tree để context; KHÔNG ghi "hidden → không render" (M3) — đây là baseline, panel Nhóm B/C chỉ visible khi toggle = "Có".

### Page Header / 5 (13257:546402)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(80px) → tw: h-20
- Layout-mode: auto-layout
- Text: "Chỉnh sửa phiếu dịch vụ" — tiêu đề trang (data-bound: tên SO + badge trạng thái). Action bên phải: nút **"Hủy"** (outline) + **"Lưu"** (brand) {/* label from FEAT AC-13 */}
- State: default
→ shadcn: page header — `<Button variant="outline">Hủy</Button>` `<Button variant="brand">Lưu</Button>`

---

### Section/Phân bổ quyết toán bảo hiểm — Nhóm B (13257:551696)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout (vertical)
- BG: #ffffff
- Layout: vertical, gap=0 (Title + Content); Content gap=16
- Maps: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8

#### Title text (13257:551697)
- Bounds: w=FILL h=FIXED(36px) → tw: h-9
- Layout: horizontal, gap=8, items=center, padding b=8px
- Text: "Phân bổ quyết toán bảo hiểm" 18px weight=600 lh=28px color=#18181b
→ shadcn: `<h2>`

##### Badge/Success — "Bảo hiểm"
- Bounds: w=HUG h=HUG
- BG: #f0fdf4 | radius=rounded-lg
- Padding: 2 10 2 10px
- Text: "Bảo hiểm" 14px weight=500 lh=20px color=#16a34a
→ shadcn: `<Badge variant="success">Bảo hiểm</Badge>`  {/* Variant=Success — shadcn badge */}

#### Footer Note — công thức (13257:551699)
- Bounds: w=FIXED(772px) → tw: w-[772px] h=HUG
- Text (2 dòng): "BH thanh toán = phần bảo hiểm duyệt sau chiết khấu liên kết - giảm trừ bồi thường - khấu hao vật tư - khấu trừ bảo hiểm." / "KH thanh toán = phần KH tự trả trên bảng + các khoản bị loại trừ chuyển sang KH." — 12px weight=400 lh=16px color=#71717a
→ shadcn: `<p className="text-muted-foreground">`

#### Row/Flex-1 (13257:551700) — AC-3 + AC-4 (side-by-side)
- Bounds: w=FILL h=HUG
- Layout: horizontal, gap=16, items=start
  ##### Field/CK liên kết BH — Vật tư (AC-3) (13257:551701)
  - Bounds: w=FILL(flex-1 ≈ w-[600px]) → tw: flex-1 [x=0] h=HUG
  - Layout: vertical, gap=8
  - Label: "Chiết khấu liên kết BH - Vật tư" 14px weight=500 lh=1 color=#18181b
  - Input (I…;65:523): h=FIXED(36px) → tw: h-9, BG=#ffffff, Border=1px solid #d4d4d8 radius=rounded-md, Shadow: shadow-sm, padding 4 12 4 12px, gap=4
    - Value text: "0" 14px weight=400 lh=20px color=#18181b (flex-1, truncate)
    - Unit text: "vnđ" 14px weight=400 lh=20px color=#71717a align=right
    - Icons:
      - trailing: lucide-react/ChevronDown, 20px, #71717a (dropdown đơn vị **VND / %**)
  - Helper: "Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần vật tư/phụ tùng" 14px weight=400 lh=20px color=#71717a
  - State: default (value 0, đơn vị VND)
  → shadcn: `<div><Label>Chiết khấu liên kết BH - Vật tư</Label><Input type="number" /><Select> {/* unit VND|% */} </Select><p className="text-muted-foreground">…</p></div>

  ##### Field/CK liên kết BH — Công dịch vụ (AC-4) (13257:551702)
  - Bounds: w=FILL(flex-1 ≈ w-[600px]) → tw: flex-1 [x=616, cạnh AC-3] h=HUG
  - Layout: vertical, gap=8
  - Label: "Chiết khấu liên kết BH - Công dịch vụ" 14px weight=500 lh=1 color=#18181b
  - Input: giống AC-3 (h-9, border #d4d4d8 rounded-md shadow-sm) — Value "0", Unit "vnđ", ChevronDown dropdown VND/%
  - Helper: "Khoản garage giảm trừ cho doanh nghiệp bao hiểm trên phần công sửa chữa" 14px weight=400 lh=20px color=#71717a
  → shadcn: `<div><Label>…</Label><Input type="number" /><Select> {/* unit VND|% */} </Select><p>…</p></div>

#### Row/Flex-2 (13257:551703) — AC-5 + AC-8 (side-by-side)
- Bounds: w=FILL h=HUG
- Layout: horizontal, gap=16, items=start
  ##### Field/Khấu hao vật tư / thay mới (AC-5) (13257:551704)
  - Bounds: w=FIXED(600px) → tw: w-[600px] [x=0] h=HUG
  - Layout: vertical, gap=8
  - Label: "Khấu hao vật tư / thay mới" 14px weight=500 lh=1 color=#18181b
  - Input: h=FIXED(36px) → tw: h-9, BG=#ffffff, Border=1px solid #d4d4d8 radius=rounded-md, Shadow: shadow-sm
    - Value text: "0" 14px color=#18181b
    - Unit text: "%" 14px color=#71717a align=right (chỉ **% — không có VND**, theo AC-5)
    - Icons:
      - trailing: lucide-react/ChevronDown, 20px, #71717a
  - Helper: "Tỷ lệ khấu hao vật tư do KH chịu. Có thể áp dụng đồng loạt hoặc chỉnh riêng từng dòng phụ tùng." 14px weight=400 lh=20px color=#71717a
  → shadcn: `<div><Label>Khấu hao vật tư / thay mới</Label><Input type="number" suffix="%" /><p>…</p></div>

  ##### Field/Áp dụng tất cả (AC-8) (13257:551705)
  - Bounds: w=FIXED(296px) → tw: w-[296px] [x=616, cạnh AC-5] h=HUG
  - Layout: vertical, padding-top=22px (canh đáy input AC-5 — qua label spacer)
    ###### Button — "Áp dụng tất cả" (13257:551706)
    - Bounds: w=HUG h=FIXED(36px) → tw: h-9
    - BG: #ffffff | Border: 1px solid #d4d4d8 radius=rounded-md
    - Shadow: shadow-sm
    - Padding: 8 16 8 16px, gap=8
    - Text: "Áp dụng tất cả" 14px weight=500 lh=20px color=#18181b
    - State: default
    → shadcn: `<Button variant="outline" size="default">Áp dụng tất cả</Button>`  {/* Variant=Outline — riêng cho khấu hao đồng loạt (AC-8) */}

#### Row/Flex-3 (13257:551707) — AC-6 + AC-7 (side-by-side)
- Bounds: w=FILL h=HUG
- Layout: horizontal, gap=16, items=start
  ##### Field/Giảm trừ bồi thường (AC-6) (13257:551708)
  - Bounds: w=FILL(flex-1 ≈ w-[600px]) → tw: flex-1 [x=0] h=HUG
  - Layout: vertical, gap=8
  - Label: "Giảm trừ bồi thường" 14px weight=500 lh=1 color=#18181b
  - Input: giống AC-3 (h-9, border #d4d4d8 rounded-md shadow-sm) — Value "0", Unit "vnđ", ChevronDown dropdown VND/%
  - Helper: "Khoản loại trừ hoặc giảm bồi thường theo quy tắc/hồ sơ bảo hiểm, chuyển sang KH chi trả" 14px weight=400 lh=20px color=#71717a
  → shadcn: `<div><Label>…</Label><Input type="number" /><Select> {/* unit VND|% */} </Select><p>…</p></div>

  ##### Field/Khấu trừ bảo hiểm (AC-7) (13257:551709)
  - Bounds: w=FILL(flex-1 ≈ w-[600px]) → tw: flex-1 [x=616, cạnh AC-6] h=HUG
  - Layout: vertical, gap=8
  - Label: "Khấu trừ bảo hiểm" 14px weight=500 lh=1 color=#18181b
  - Input: h=FIXED(36px) → tw: h-9, border #d4d4d8 rounded-md shadow-sm — Value "0", Unit "vnđ" + ChevronDown
  - Helper: "Khoản khấu trừ bảo hiểm theo hợp đồng mà KH phải tự thanh toán" 14px weight=400 lh=20px color=#71717a
  - State: default
  → shadcn: `<div><Label>Khấu trừ bảo hiểm</Label><Input type="number" suffix="vnđ" /><p>…</p></div>  {/* AC-7: chỉ VND — ô screenshot có chevron nhưng theo AC-7/BR-003 không có chế độ % */}`

> **visual_note (AC-7)**: ảnh screenshot ô "Khấu trừ bảo hiểm" hiển thị icon chevron-down giống các ô khác (component dùng chung), nhưng FEAT AC-7 + BR-INS-SO-ADJ-003 chốt khấu trừ **chỉ nhập số tiền VND, không có chế độ %**. DEV: vô hiệu/ẩn dropdown đơn vị ở ô này.

---

### Panel/Tổng giá dịch vụ — Nhóm C (13257:550991)
- Bounds: w=FIXED(600px) → tw: w-[600px] [x=616 → nửa phải trang] h=HUG
- Layout-mode: auto-layout (vertical)
- BG: #ffffff
- Layout: vertical, gap=0 (Title + 3 section AC-9/AC-10/AC-11)
- Maps: AC-9, AC-10, AC-11, AC-12

#### Title text — "Tổng giá dịch vụ" (13257:550992)
- Bounds: w=FILL h=HUG, padding b=16px
- Text: "Tổng giá dịch vụ" 18px weight=600 lh=28px color=#18181b
→ shadcn: `<h2>`

#### Table/Chi tiết theo bên thanh toán — AC-9 (13263:56449)
- Bounds: w=FILL h=HUG
- Layout: vertical
- Sub-title (Container 13257:550993): "Chi tiết theo bên thanh toán" 14px weight=600 lh=20px color=#000000, padding=8px
  ##### Row/Columns (13257:550995) — 3-cột (side-by-side)
  - Bounds: w=FILL h=HUG
  - Layout: horizontal, items=center
  - Overflow: hidden
    ###### Column/Khoản mục (13257:550996)
    - Bounds: w=FILL(flex-1) → tw: flex-1 [x=0] h=HUG
    - Head (Table/Head): h=FIXED(40px) → tw: h-10, BG=#f4f4f5, Border-b 1px #e4e4e7 — Text "Khoản mục" 14px weight=500 color=#18181b
    - Cells (h=FIXED(52px) → tw: h-[52px], padding=8px):
      - "Dịch vụ " 14px weight=400 color=#18181b
      - "Phụ tùng " 14px weight=400 color=#18181b
      - "VAT " 14px weight=400 color=#18181b  {/* nhãn % phản ánh thuế người dùng nhập per dòng (AC-9) */}
      - "Cộng sau VAT" 14px weight=600 color=#18181b (border-b 1px #e4e4e7)
    → shadcn: `<TableHead>Khoản mục</TableHead>` + `<TableCell>` rows
    ###### Column/Bảo hiểm thanh toán (13257:551023)
    - Bounds: w=FIXED(200px) → tw: w-[200px] [x=200, cạnh Khoản mục] h=FILL
    - Head: h-10, BG=#f4f4f5, justify=end — Text "Bảo hiểm thanh toán" 14px weight=500 color=#18181b
    - Cells (h-[52px], items=end, align=right): giá trị data-bound đ — vd (screenshot) Dịch vụ / Phụ tùng / VAT / **Cộng sau VAT** (semibold dòng cuối, border-b)
    → shadcn: `<TableHead className="text-right">Bảo hiểm thanh toán</TableHead>` + `<TableCell className="text-right">{bh.*}</TableCell>`
    ###### Column/Khách hàng thanh toán (13257:551029)
    - Bounds: w=FIXED(200px) → tw: w-[200px] [x=400, cạnh BH] h=FILL
    - Head: h-10, BG=#f4f4f5, justify=end — Text "Khách hàng thanh toán" 14px weight=500 color=#18181b
    - Cells (h-[52px], align=right): giá trị data-bound đ (Cộng sau VAT semibold, border-b)
    → shadcn: `<TableHead className="text-right">Khách hàng thanh toán</TableHead>` + `<TableCell className="text-right">{kh.*}</TableCell>`

> Σ cột phải = 200 + 200 = 400; Column "Khoản mục" flex-1 lấp phần còn lại trong w-[600px] ✓ (I-25). Cột 2 & 3 trong Figma có thêm 3 frame "Column" HIDDEN (13257:551002/551009/551016 — biến thể layout 4–6 dòng không dùng); state visible = 3 cột ở trên.

#### Table/Phân bổ Bảo hiểm — AC-10 (13263:56447)
- Bounds: w=FILL h=HUG
- Layout: vertical
- Sub-title (13257:551035): "Phân bổ Bảo hiểm" 14px weight=600 lh=20px color=#000000, padding=8px
- 5 dòng (mỗi dòng: label flex-1 [x=0] + value w-[200px] [x=400], h=FIXED(52px) → tw: h-[52px], BG=alpha/50 #ffffff80, padding cell=8px):
  - "CK liên kết BH — Vật tư" → value (dấu **−**, **màu xanh** #16a34a — giảm BH, không sang KH) — AC-3
  - "CK liên kết BH — Công dịch vụ" → value (dấu **−**, màu xanh) — AC-4
  - "Giảm trừ bồi thường" → value (dấu **+**, **màu đỏ** #dc2626 — chuyển sang KH) — AC-6
  - "Khấu hao vật tư / thay mới" → value (dấu **+**, màu đỏ) — AC-5
  - "Khấu trừ BH" → value (dấu **+**, màu đỏ; dòng cuối border-b 1px #e4e4e7) — AC-7
- Value text: 14px weight=500 lh=20px align=right, truncate
→ shadcn: `<Table>` 5 `<TableRow>`; mỗi value `<TableCell className="text-right">` màu theo dấu (xanh `text-foreground-success` cho −; đỏ `text-destructive` cho +)

> **visual_note (AC-10 màu/dấu)**: screenshot state default hiển thị các value ở màu foreground (#18181b) chưa tô màu dấu vì là số mẫu dương 50.000.000đ. Dấu+màu (− xanh / + đỏ) là **runtime formatting** theo FEAT AC-10 — DEV bind màu theo loại khoản (M3/M4: nhãn + ý nghĩa lấy từ AC-10, không silent drop).

#### Block/Cân thanh toán — AC-11 (13263:56448)
- Bounds: w=FILL h=HUG
- Layout: vertical
- Sub-title (13257:551053): "Cần thanh toán" 14px weight=600 lh=20px color=#000000, padding=8px  {/* Figma label "Cần thanh toán"; FEAT AC-11 dùng "Cân thanh toán" — đồng nghĩa khối kết quả */}
- 3 dòng footer (label flex-1 [x=0] + value w-[200px] [x=400], h=FIXED(52px) → tw: h-[52px], BG=alpha/50 #ffffff80):
  - "Bảo hiểm thanh toán" → value 14px weight=500 align=right color=#18181b  {/* ô xanh theo AC-11 — highlight runtime */}
  - "Khách hàng thanh toán" → value 14px weight=500 align=right color=#18181b  {/* ô cam theo AC-11 */}
  - "Tổng thanh toán" (label weight=600) → value **20px weight=600 lh=28px color=#0052ff align=right** (nổi bật brand)  {/* ô đen theo AC-11; Figma render giá trị tổng màu brand #0052ff */}
→ shadcn: `<Table>` footer 3 `<TableRow>`; "Tổng thanh toán" value `<TableCell className="text-right text-primary text-xl font-semibold">`

> **visual_note (AC-11 màu ô)**: AC-11 mô tả "ô xanh / ô cam / ô đen" cho 3 kết quả; Figma state đã chụp render label trái + value phải dạng footer table, value "Tổng thanh toán" tô brand #0052ff. Highlight nền theo màu (xanh/cam/đen) là intent AC — DEV áp background highlight theo AC-11. AC-12 (cảnh báo BH thanh toán âm) → coverage_gaps (không có state âm để reconcile).

---

## Screen: Chỉnh sửa | Dịch vụ xe — State B (13257:544849)

- Layout: vertical, 1440x3474px, gap=0
- Background: #ffffff
- Container: single-column (page-level) — giống State A.
- Layout Tree (delta vs State A):
  ```
  Frame/Chỉnh sửa | Dịch vụ xe (13257:544849) [vertical, 1440x3474]
  ├── Navbar (13257:544850)
  ├── Page content (13257:544851) → Page container (13257:544852)
  │   ├── Page Header / 6 (13270:78174)
  │   └── Container (13257:544854) [vertical, w-[1216px], gap=24]
  │       ├── Section/Bảo hiểm (13257:544855) [HIDDEN]
  │       ├── Thông tin KH (13257:544882) [h-[228px] — khác A]
  │       ├── Thông tin dịch vụ (13257:544883) [h-[260px] — khác A: nhiều dòng DV hơn]
  │       ├── Thông tin xe (13257:544884) [h-[764px] — khác A: ít ảnh/dòng hơn]
  │       ├── Container/Phí dịch vụ (13257:544885)
  │       ├── Section/Phụ tùng (13257:544888)
  │       ├── Panel/Tổng giá dịch vụ — Nhóm C (13263:56885) [w-[600px], x=616] ≡ canonical State A
  │       └── Section/Phân bổ quyết toán bảo hiểm — Nhóm B (13263:57289) [w-[1216px], x=0] ≡ canonical State A
  └── Section Footer / 2 (13257:544892)
  ```

> **Nhóm B (13263:57289) + Nhóm C (13263:56885) identical canonical State A** (M5) — cùng anatomy/token/multi-column. Khác duy nhất là data-fill các section info phía trên (Thông tin KH/dịch vụ/xe khác chiều cao do số dòng dữ liệu). Không lặp lại detail block — xem State A.

---

## Screen: Chỉnh sửa | Dịch vụ xe — State C (13257:478586)

- Layout: vertical, 1440x3590px, gap=0
- Background: #ffffff
- Container: single-column (page-level) — giống State A.
- Layout Tree (delta vs State A):
  ```
  Frame/Chỉnh sửa | Dịch vụ xe (13257:478586) [vertical, 1440x3590]
  ├── Navbar (13257:478587)
  ├── Page content (13257:478588) → Page container (13257:478589)
  │   ├── Page Header / 6 (13270:78210)
  │   └── Container (13257:478591) [vertical, w-[1216px], gap=24]
  │       ├── Section/Bảo hiểm (13257:478592) [HIDDEN]
  │       ├── Thông tin KH (13257:478619) [h-[228px]]
  │       ├── Thông tin dịch vụ (13257:478620) [h-[176px]]
  │       ├── Thông tin xe (13257:478621) [h-[964px]]
  │       ├── Container/Phí dịch vụ (13257:478622)
  │       ├── Section/Phụ tùng (13257:478625)
  │       ├── Panel/Tổng giá dịch vụ — Nhóm C (13263:57087) [w-[600px], x=616] ≡ canonical State A
  │       └── Section/Phân bổ quyết toán bảo hiểm — Nhóm B (13263:57397) [w-[1216px], x=0] ≡ canonical State A
  └── Section Footer / 2 (13257:478629)
  ```

> **Nhóm B (13263:57397) + Nhóm C (13263:57087) identical canonical State A** (M5). State C là biến thể data-fill khác (chiều cao section info khác A/B). Không lặp detail — xem State A.

---

## Screenshots
> assets/wave01-ins-so-adjustment/
- `13257-546398_full-edit.png` — toàn screen Edit State A
- `13257-544849_full-edit.png` — toàn screen Edit State B
- `13257-478586_full-edit.png` — toàn screen Edit State C
- `13257-551696.png` — Section: Phân bổ quyết toán bảo hiểm (Nhóm B — panel nhập 5 khoản điều chỉnh, 3 Row side-by-side)
- `13257-550991.png` — Panel: Tổng giá dịch vụ (Nhóm C — AC-9 bảng Chi tiết theo bên thanh toán 3 cột + AC-10 Phân bổ Bảo hiểm + AC-11 Cân thanh toán)
