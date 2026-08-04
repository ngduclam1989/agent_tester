---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13270-206807&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13270:206807"
screen_slug: detail
fetched_at: 2026-06-05T09:05:00+07:00
transform_version: 6
screenshots: true
screens_expected: 1
coverage_gaps:
  - "AC-1 (MANUAL OVERRIDE): Figma Detail frame `13270:206807` CHƯA có section 'Phân bổ quyết toán bảo hiểm' (cột trái x=0 trống — verify `get_metadata` 2026-06-07). Section read-only được bổ sung thủ công vào spec này theo FEAT AC-1 + BR-INS-SO-ADJ-001 (anatomy mirror Edit Nhóm B `13257:551696`). Figma cần bổ sung section read-only → re-prefetch để gỡ override."
  - "AC-10: dấu (−/+) và màu (xanh/đỏ) của 5 dòng Phân bổ Bảo hiểm — Figma mock dùng giá trị placeholder 50.000.000đ render đen, không thể hiện dấu/màu; encode theo FEAT AC-10 (CK liên kết = − xanh; giảm trừ/khấu hao/khấu trừ = + đỏ)."
  - "AC-11: 3 ô Cân thanh toán theo FEAT phải highlight ô xanh (BH) / cam (KH) / đen (Tổng); Figma chỉ highlight 'Tổng thanh toán' bằng brand-blue 20px, 2 dòng còn lại render plain — verify intended box styling."
  - "AC-12: cảnh báo 'BH thanh toán không thể âm' — không có state hiển thị trong frame Detail đã chụp (chỉ xuất hiện khi giá trị < 0)."
---

> ⚠️ **MANUAL OVERRIDE (2026-06-07, PO directive)** — Section **"Phân bổ quyết toán bảo hiểm" (read-only)** dưới đây được thêm thủ công theo `FEAT-INS-SO-ADJUSTMENT` AC-1 + `BR-INS-SO-ADJ-001`. Figma snapshot `13270:206807` (prefetch 2026-06-05) **chưa có** section này — đã verify live qua `get_metadata` 2026-06-07. Anatomy canonical = panel Nhóm B của màn Edit (`13257:551696`), biến thể read-only (bỏ input/dropdown đơn vị/nút "Áp dụng tất cả"). **Reviewer khi re-prefetch:** designer phải bổ sung section vào Figma Detail frame trước, KHÔNG silent-revert override này.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes |
|---|---|---|---|
| chevron (In phiếu dropdown) | lucide-react | — | nút "In phiếu" có caret xổ |
| arrow-left (back) | lucide-react | — | nút quay lại cạnh mã phiếu |

> Read-only Detail screen — chỉ icon điều hướng/header (baseline). Cả section **"Phân bổ quyết toán bảo hiểm"** (recap 5 khoản, read-only) lẫn panel "Tổng giá dịch vụ" đều **không chứa icon control** (read-only): không chevron dropdown đơn vị, không nút "Áp dụng tất cả".

---

## Screen: Chi tiết phiếu dịch vụ — Khách hàng doanh nghiệp — Có bảo hiểm (13270:206807)

- Layout: vertical, 1440x2240px, gap=0
- Background: #ffffff
- Padding: 0 (Navbar full-bleed; Page content có Page container padding-x=80)
- Container: **panel-split** (zone trên = các Section full-width 1216px; zone "Bảng chi phí" tab = **2 cột ngang**: cột trái ~600px (cost-table, trống ở state Detail này) + cột phải panel "Tổng giá dịch vụ" w-[600px], x=616)
  - Page container: w=FIXED(1280) → tw: w-[1280px] padding-x=80 (canh giữa content 1216px)
  - Tab content row (y=768 trong Section 13270:206877): cột trái x=0 w≈600 + cột phải x=616 w=600, gap≈16
  - Section gap: 24–32px (giữa các Section)
  - Fields gap: 8px (gap dọc trong Infor Item: nhãn → giá trị)
- Layout Tree:
  ```
  Frame/Detail [vertical, gap=0, padding=0_0_0_0]
  ├── Navbar [absolute, w-full h-[104px]]
  └── Page content [vertical, gap=0]
      └── Page container [vertical, gap=0, w-[1280px], padding-x=80]
          ├── Section/Thông tin dịch vụ và thanh toán [vertical, gap=0]   ← 4 Infor Item ngang (grid 4-col)
          ├── Section/Thông tin khách hàng [vertical]                      ← 4 Infor Item ngang
          ├── Section/Thông tin xe [vertical]                              ← 4 Infor Item ngang
          └── Section/Tab "Dịch vụ & phụ tùng" (13270:206877) [vertical, gap=0]
              ├── Tab Nav Links [horizontal]
              ├── Section/Dịch vụ thực hiện (13270:206879) [vertical, w-[1216px] full-width]
              ├── Section/Phụ tùng sử dụng (13270:206882) [vertical, w-[1216px] full-width]
              ├── Row/Bảng chi phí [horizontal, gap=16, items=start]      ← ⚠ I-25 side-by-side
              │   ├── Column/Cost-table-left [col, w-[600px], x=0]        ← trống ở state Detail (no visible sibling)
              │   └── Column/Tổng giá dịch vụ (13270:207614) [col, w-[600px], x=616, "cạnh cột cost-table trái"]
              │       ├── Title text "Tổng giá dịch vụ"
              │       ├── Section/Chi tiết theo bên thanh toán (AC-9)     ← bảng 3 cột Khoản mục|BH|KH
              │       ├── Section/Phân bổ Bảo hiểm (AC-10)                 ← 5 dòng điều chỉnh (dấu/màu)
              │       └── Section/Cần thanh toán (AC-11)                   ← 3 dòng kết quả (highlight)
              └── Section/Phân bổ quyết toán bảo hiểm — read-only (AC-1) [vertical, w-[1216px] full-width]   ← ⚠ MANUAL OVERRIDE (vắng trong Figma `13270:206807`; mirror Edit Nhóm B `13257:551696` read-only)
                  ├── Title text "Phân bổ quyết toán bảo hiểm" + Badge "Bảo hiểm" (success)
                  ├── Footer Note (công thức BH/KH thanh toán)
                  └── 5 khoản điều chỉnh (read-only: label + value đã nhập + đơn vị, KHÔNG input/dropdown/nút)
  ```
  > Σ cross-check cột (Row/Bảng chi phí): 600 (trái) + 600 (panel phải) + 16 gap ≈ 1216 = content width. Panel "Tổng giá dịch vụ" **KHÔNG** full-width — encode là cột phải, KHÔNG flatten thành sibling dọc (đây là fix v6 cho bug v5).
  > Section **"Phân bổ quyết toán bảo hiểm" (read-only)** là **full-width 1216px** đặt **dưới** Row/Bảng chi phí — mirror cách màn Edit đặt Nhóm B full-width ở đáy. **KHÔNG** lấp vào cột trái trống của Row/Bảng chi phí (cột đó giữ nguyên placeholder cross-check Σ).

### Page Header / 3 — mã phiếu + actions
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(80px) → tw: h-20
- Layout-mode: auto-layout · horizontal, justify=between
- Text: "#PHDV-20240723-001" 24px weight=600 lh=32px color=#18181b · badge trạng thái "Báo giá" (purple) bên cạnh
- Icons:
  - leading: lucide-react/ArrowLeft, 20px, #18181b
- State: default (read-only Detail — các nút Hủy / Chỉnh sửa / Thực hiện dịch vụ + Gửi báo giá / In phiếu là baseline, ngoài scope)
→ shadcn: <PageHeader> (h1 + Badge + action group)

### Section/Thông tin dịch vụ và thanh toán
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout · vertical
- Layout: grid 4 cột Infor Item (mỗi item w=FIXED(292px) → tw: w-[292px], gap=16)
  #### Infor Item — Loại phiếu
  - Text nhãn: "Loại phiếu" 14px weight=400 lh=20px color=#71717a
  - Text giá trị: "Phiếu dịch vụ (Sửa chữa)" 14px weight=400 lh=20px color=#18181b
  #### Infor Item — Thời gian dự kiến giao xe
  - Text giá trị: "10:00 20/01/2026" 14px color=#18181b
  #### Infor Item — Tổng tiền
  - Text giá trị: "--" 20px weight=600 lh=28px color=#18181b {/* data-bound — placeholder ở mock */}
  #### Infor Item — Trạng thái thanh toán
  - Badge: "Chưa thanh toán" (error variant — text/bg error)
  → shadcn: <Badge variant="destructive">

### Section/Thông tin khách hàng
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout · vertical · grid 4 cột Infor Item (w-[292px], gap=16)
  #### Infor Item — Tên khách hàng → "Nguyễn Minh Tâm"
  #### Infor Item — Số điện thoại → "0942328562"
  #### Infor Item — Loại khách hàng → "Tổ chức"
  #### Infor Item — Bảo hiểm → "Có"
  - Text nhãn 14px color=#71717a; giá trị 14px color=#18181b
  > AC-1: giá trị "Bảo hiểm = Có" là trigger hiển thị panel "Tổng giá dịch vụ" + section phân bổ. Read-only ở Detail.

### Section/Thông tin xe
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout · vertical · grid 4 cột Infor Item (w-[292px], gap=16)
  #### Biển số xe → "25B2-09284" · Dòng xe → "Camry" · Hãng xe → "Toyota" · Số km đã chạy → "1.000"
  - Text nhãn 14px color=#71717a; giá trị 14px color=#18181b

### Section/Tab "Dịch vụ & phụ tùng" (13270:206877)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=FIXED(1584px) → tw: h-[1584px]
- Layout-mode: auto-layout · vertical, gap=0
  #### Tab Nav Links
  - Layout: horizontal, gap=24
  - Tabs: "Dịch vụ & phụ tùng" (active, underline #18181b) · "Thông tin khác" · "Tài liệu đính kèm" · "Thông tin liên kết" · "Lịch sử thanh toán"
  - Text active 14px weight=600 color=#18181b; inactive color=#71717a
  → shadcn: <Tabs> / <TabsList><TabsTrigger>

#### Section/Dịch vụ thực hiện (13270:206879) — bảng line-item DV (full-width)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout · vertical, gap=0
- Text title: "Dịch vụ thực hiện" 18px weight=600 lh=28px color=#18181b padding-b=16
- Table head: BG=#f4f4f5 border-b 1px solid #e4e4e7, h=FIXED(40px) → tw: h-10, px=8
  - Cột: STT (w-[44px], center) · Tên dịch vụ (FILL) · Bên thanh toán (w-[144px]) · Người thực hiện (w-[144px]) · Đơn giá (w-[120px], right) · Số lượng (w-[85px], right) · Chiết khấu (w-[120px], right) · Thuế (w-[120px], right) · Thành tiền (w-[120px], right)
  - Head text: 14px weight=500 lh=20px color=#18181b
- Table cell: h=FIXED(52px) → tw: h-13 px=8 py=12, border-b 1px solid #e4e4e7; text 14px weight=400 color=#18181b; "--" {/* data-bound */}
- Row "Tổng": BG=#f4f4f5, h=FIXED(40px) → tw: h-10; nhãn "Tổng" 14px weight=700; giá trị "--" weight=700 right
- Overflow: hidden (clip)
→ shadcn: <Table><TableHeader><TableRow><TableHead> + <TableBody> + footer row

#### Section/Phụ tùng sử dụng (13270:206882) — bảng line-item phụ tùng (full-width)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout · vertical, gap=0
- Text title: "Phụ tùng sử dụng" 18px weight=600 lh=28px color=#18181b padding-b=16
- Table head: BG=#f4f4f5 border-b 1px solid #e4e4e7, h=FIXED(40px) → tw: h-10, px=8; text 14px weight=500 color=#18181b
  - Cột: STT · Tên phụ tùng · Bên thanh toán · Phân khúc · Đơn vị tính · Đơn giá (right) · Số lượng (right) · Chiết khấu (right) · **Khấu hao VT** (right) · Thuế (right) · Thành tiền (right)
  > Cột **"Khấu hao VT"** = cột "Khấu hao (%)" per dòng phụ tùng (AC-5 cách b / AC-9 cơ sở khấu hao). Ở Detail hiển thị read-only.
- Table cell: h=FIXED(52px) → tw: h-13 px=8 py=12, border-b 1px solid #e4e4e7; text 14px weight=400 color=#18181b; "--" / "0%" {/* data-bound */}; "Phân khúc"="Cao cấp" (mock)
- Row "Tổng": BG=#f4f4f5 h=FIXED(40px) → tw: h-10; weight=700; giá trị "1.000.000đ" {/* data-bound */}
- Overflow: hidden (clip)
- Trailing action (header): Button "Đặt hàng"
  - Bounds: h=FIXED(32px) → tw: h-8 px=12 py=8; BG=#ffffff border 1px solid #d4d4d8 radius=rounded-md
  - Shadow: shadow-sm
  - State: disabled (opacity-30 — read-only Detail / không có dòng)
  → shadcn: <Button variant="outline" size="sm" disabled>Đặt hàng</Button>
→ shadcn: <Table> (line-item phụ tùng)

#### Row/Bảng chi phí — side-by-side (⚠ I-25 multi-column)
- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG
- Layout-mode: auto-layout · **horizontal**, gap=16, items=start
- Detect: panel `13270:207614` ở x=616 (right half), overlap dọc với cột trái (cost-table). KHÔNG flatten thành sibling dọc.
  ##### Column/Cost-table-left
  - Bounds: w=FIXED(600px) → tw: w-[600px] x=0 h=HUG
  - Layout-mode: auto-layout · vertical
  - Nội dung: trống ở state Detail này (cột trái "Bảng chi phí" không có sibling visible — chỉ panel phải render). Drill metadata: không có child visible dưới row này ngoài panel.
  > Giữ làm placeholder cột trái để cross-check Σ width (600+600+16≈1216). Section read-only **"Phân bổ quyết toán bảo hiểm"** (AC-1) KHÔNG đặt vào ô trống này — render full-width **dưới** Row/Bảng chi phí (xem section block riêng bên dưới). Ở màn Edit, Nhóm B cũng full-width ở đáy (không phải cột trái).

  ##### Column/Tổng giá dịch vụ (13270:207614)
  - Bounds: w=FIXED(600px) → tw: w-[600px] x=616 h=FIXED(816px) → tw: h-[816px] · "cạnh cột cost-table trái"
  - Layout-mode: auto-layout · vertical, items=start
  - BG: #ffffff
  - Text title: "Tổng giá dịch vụ" 18px weight=600 lh=28px color=#18181b padding-b=16
  - State: read-only (Detail) — toàn panel hiển thị, không có input

  ###### Section/Chi tiết theo bên thanh toán (AC-9)
  - Bounds: w=FILL h=HUG
  - Sub-header: "Chi tiết theo bên thanh toán" 14px weight=600 lh=20px color=#000000 padding=8
  - Layout: bảng 3 cột — Khoản mục (FILL, left) · "Bảo hiểm thanh toán" (w-[200px], right) · "Khách hàng thanh toán" (w-[200px], right)
  - Head: BG=#f4f4f5 border-b 1px solid #e4e4e7 h=FIXED(40px) → tw: h-10 px=8; text 14px weight=500 color=#18181b
  - Cell: h=FIXED(52px) → tw: h-13 px=8; text 14px weight=500 color=#000000
  - Dòng: "Dịch vụ" · "Phụ tùng" · "VAT" · "Cộng sau VAT" (dòng cuối weight=600, border-b)
  - Giá trị mock (data-bound): BH 95.040đ / KH 0đ (Dịch vụ); BH/KH 95.040đ (Phụ tùng, VAT); Cộng sau VAT BH 50.000đ / KH 95.040đ {/* data-bound — real: AC-9 ví dụ BH 207.900.000 / KH 33.000.000 */}
  - Overflow: hidden (clip)
  → shadcn: <Table> 3-col (read-only)

  ###### Section/Phân bổ Bảo hiểm (AC-10)
  - Bounds: w=FILL h=HUG
  - Sub-header: "Phân bổ Bảo hiểm" 14px weight=600 lh=20px color=#000000 padding=8
  - Layout: 5 Footer row, mỗi row 2 cột — nhãn (FILL, left) · số tiền (w-[200px], right). BG row=rgba(255,255,255,0.5) (alpha/50). Row cuối border-b 1px solid #e4e4e7.
  - Cell: h=FIXED(52px) → tw: h-13 px=8; text 14px weight=500 color=#18181b
  - 5 dòng điều chỉnh (nhãn + dấu/màu theo FEAT AC-10):
    - "CK liên kết BH — Vật tư" → dấu **−**, màu xanh (giảm BH, không sang KH)
    - "CK liên kết BH — Công dịch vụ" → dấu **−**, màu xanh
    - "Giảm trừ bồi thường" → dấu **+**, màu đỏ (chuyển sang KH)
    - "Khấu hao vật tư / thay mới" → dấu **+**, màu đỏ
    - "Khấu trừ BH" → dấu **+**, màu đỏ
  - visual_note: Figma mock render mọi dòng = "50.000.000đ" màu đen (placeholder) → dấu (−/+) và màu (xanh/đỏ) KHÔNG quan sát được trên ảnh; encode theo FEAT AC-10. {/* data-bound — real từ adjustments[] response, BR-INS-SO-ADJ-005 */}
  - Overflow: hidden (clip)
  → shadcn: <Table> 2-col read-only; số âm/dương render màu (xanh −, đỏ +) theo dấu

  ###### Section/Cần thanh toán (AC-11)
  - Bounds: w=FILL h=HUG
  - Sub-header: "Cần thanh toán" 14px weight=600 lh=20px color=#000000 padding=8
  > Figma dùng nhãn "Cần thanh toán"; FEAT AC-11 gọi "Cân thanh toán" — cùng khối kết quả (BH thanh toán / Khách hàng thanh toán / Tổng thanh toán).
  - Layout: 3 Footer row, mỗi row 2 cột — nhãn (FILL, left) · số tiền (w-[200px], right). BG row=rgba(255,255,255,0.5).
  - Dòng 1 "Bảo hiểm thanh toán": text 14px weight=500 color=#18181b (FEAT: ô xanh)
  - Dòng 2 "Khách hàng thanh toán": text 14px weight=500 color=#18181b (FEAT: ô cam)
  - Dòng 3 "Tổng thanh toán": nhãn 14px weight=600 color=#18181b; **giá trị 20px weight=600 lh=28px color=#0052ff (brand-CD)** — highlight nổi bật (FEAT: ô đen)
  - visual_note: Figma chỉ highlight "Tổng thanh toán" bằng brand-blue 20px; 2 dòng trên render plain (không thấy ô xanh/cam). Encode theo Figma + giữ AC-11 expected box-color trong coverage_gaps.
  - Giá trị mock: "50.000.000đ" mọi dòng {/* data-bound — real: AC-11 BH 197.680.000đ / KH 35.720.000đ / Tổng 233.400.000đ */}
  - Overflow: hidden (clip)
  → shadcn: <Table> 2-col read-only; dòng Tổng emphasized (text-primary, text-xl, semibold)

### Section/Phân bổ quyết toán bảo hiểm — read-only (AC-1)  ⚠ MANUAL OVERRIDE
> **Vắng trong Figma `13270:206807`** (verify `get_metadata` 2026-06-07). Spec encode theo FEAT AC-1 + BR-INS-SO-ADJ-001. **Anatomy canonical = panel Nhóm B màn Edit (`13257:551696`)** — xem `wave01-ins-so-adjustment--edit.md` §"Section/Phân bổ quyết toán bảo hiểm — Nhóm B" để lấy bounds/token chi tiết. Dưới đây là **biến thể read-only**: giữ nguyên cấu trúc 5 khoản + nhãn + helper, nhưng **bỏ mọi control nhập**.

- Bounds: w=FIXED(1216px) → tw: w-[1216px] h=HUG, full-width, đặt dưới Row/Bảng chi phí
- Layout-mode: auto-layout · vertical, gap=0 (Title + Content); Content gap=16
- BG: #ffffff
- Maps: AC-1 (read-only recap), AC-3, AC-4, AC-5, AC-6, AC-7

#### Title text
- Layout: horizontal, gap=8, items=center, padding-b=8px
- Text: "Phân bổ quyết toán bảo hiểm" 18px weight=600 lh=28px color=#18181b
- Badge "Bảo hiểm" (success): BG=#f0fdf4 radius=rounded-lg, padding 2/10; text "Bảo hiểm" 14px weight=500 color=#16a34a
→ shadcn: `<h2>` + `<Badge variant="success">Bảo hiểm</Badge>`

#### Footer Note — công thức
- Text (2 dòng): "BH thanh toán = phần bảo hiểm duyệt sau chiết khấu liên kết - giảm trừ bồi thường - khấu hao vật tư - khấu trừ bảo hiểm." / "KH thanh toán = phần KH tự trả trên bảng + các khoản bị loại trừ chuyển sang KH." — 12px weight=400 lh=16px color=#71717a
→ shadcn: `<p className="text-muted-foreground">`

#### 5 khoản điều chỉnh (read-only) — 3 Row × 2 cột (mirror Edit, gap=16, items=start)
- Mỗi field read-only: Label 14px weight=500 color=#18181b + giá trị đã nhập (14px color=#18181b) + đơn vị (color=#71717a) + Helper 14px color=#71717a. **KHÔNG** input border editable, **KHÔNG** chevron dropdown đơn vị, **KHÔNG** nút "Áp dụng tất cả".
  - Row 1: "Chiết khấu liên kết BH - Vật tư" (AC-3, đơn vị VND/%) · "Chiết khấu liên kết BH - Công dịch vụ" (AC-4, VND/%)
  - Row 2: "Khấu hao vật tư / thay mới" (AC-5, **%** — không VND) · *(ô "Áp dụng tất cả" của Edit → BỎ ở read-only)*
  - Row 3: "Giảm trừ bồi thường" (AC-6, VND/%) · "Khấu trừ bảo hiểm" (AC-7, **chỉ VND**)
- visual_note: giá trị + đơn vị hiển thị đúng những gì kế toán đã nhập ở Edit (data-bound từ `insuranceAdjustment` — §4 API). Đây là **recap giá trị nhập**, KHÁC bảng "Phân bổ Bảo hiểm" (Nhóm C, AC-10) hiển thị **số tiền đã tính dấu ±/màu**. Hai khối cùng xuất hiện ở Detail, không trùng nội dung.
→ shadcn: grid 3 row × 2 col, mỗi field `<div><Label/> <span>{value} {unit}</span> <p className="text-muted-foreground">{helper}</p></div>` — không `<Input>`/`<Select>`/`<Button>`

[P] self-scan Screen: I-1..I-17 + I-22 + I-25 pass — multi-column encode đúng (Row/Bảng chi phí horizontal, panel w-[600px] x=616 cạnh cột trái w-[600px], Σ≈1216); placeholder số tiền đánh dấu data-bound (không vi phạm I-1b vì là dữ liệu động, không phải "Label"/"Button"); hex chỉ ở color fields; w/h FIXED có → tw.

---

## Screenshots
> assets/wave01-ins-so-adjustment/
- `_full-detail.png` — toàn screen Chi tiết phiếu dịch vụ (13270:206807)
- `13270-206879.png` — Section: Dịch vụ thực hiện (bảng line-item dịch vụ)
- `13270-206882.png` — Section: Phụ tùng sử dụng (bảng line-item phụ tùng, cột "Khấu hao VT")
- `13270-207614.png` — Panel: Tổng giá dịch vụ (cột phải side-by-side — AC-9/10/11)
- _(không có ảnh)_ Section "Phân bổ quyết toán bảo hiểm" read-only (AC-1) — ⚠ vắng trong Figma Detail frame; tham chiếu ảnh Edit `13257-551696.png` (Nhóm B) cho anatomy, render read-only.
