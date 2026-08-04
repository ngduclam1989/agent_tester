---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 13
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-07-08"
---

# UX-FLOW-INVENTORY-ACCOUNTING-PERIOD: Kỳ kế toán & Tính giá xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD` |
| Kind | FLOW |
| Referenced by | `FEAT-AP-LIST/CREATE/DETAIL/EDIT/DELETE` (Kỳ kế toán) + `FEAT-PRC-LIST/CREATE/DETAIL/RECALC/DELETE` (Tính giá xuất kho) |

## 1. Purpose

Luồng kỳ kế toán mô tả cách garage quản lý danh mục **kỳ kế toán** — dùng để kiểm soát đóng/mở kỳ kho, tính giá xuất kho và báo cáo tồn/NXT. Kỳ kế toán có cấu trúc phân cấp **Năm → Quý → Tháng**; khi đóng kỳ, các phiếu nhập/xuất có ngày chứng từ thuộc kỳ bị khóa chỉnh sửa.

Kỳ kế toán nằm trên tab **"Kỳ kế toán"** (cùng khu vực với tab **"Mã sản phẩm nội bộ"** và **"Nhóm vật tư hàng hóa"**).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau.

**Nền tảng:** Garage Care (Web GMS).

> **Phạm vi tài liệu**: gồm luồng **Kỳ kế toán (AP)** (§1–§5) + luồng **Tính giá xuất kho (PRC)** (§6).

### Sơ đồ luồng vận hành tổng quan

```
┌───────────────────────────────────────────────────────────────────┐
│                  LUỒNG KỲ KẾ TOÁN (ACCOUNTING PERIOD)             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Danh sách kỳ (cây Năm→Quý→Tháng)                                │
│     ├─ Thêm kỳ ──┬─ chọn Loại (năm/quý/tháng)                    │
│     │             ├─ [Tự động sinh kỳ] năm⇒4 quý+12 tháng,        │
│     │             │   quý⇒3 tháng                                  │
│     │             └─ nhập ngày / Thuộc kỳ ───► Chưa đóng          │
│     ├─ Xem chi tiết (read-only + audit)                           │
│     ├─ Sửa ──┬─ đổi thông tin / ngày                              │
│     │         └─ đổi "Đã đóng kỳ": Chưa đóng ⇄ Đã đóng           │
│     │             (không ràng buộc thứ tự; cho mở lại)            │
│     │             Đã đóng ⇒ khóa sửa phiếu nhập/xuất trong kỳ     │
│     └─ Xóa ──┬─ chưa đóng & chưa phát sinh dữ liệu & không con    │
│               │   ⇒ Xác nhận xóa                                   │
│               └─ đã đóng / có dữ liệu kho / còn kỳ con            │
│                   ⇒ Không thể xóa                                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Downstream | `EP-INVENTORY-RECEIPT-V2`, `EP-INVENTORY-DELIVERY-V2` | Đóng kỳ → khóa thêm/sửa/xóa phiếu nhập/xuất có ngày chứng từ trong kỳ |
| Downstream | `EP-INVENTORY-OPENING-BALANCE`, `EP-INVENTORY-STOCK-V2` | Import tồn đầu kỳ / báo cáo tồn theo kỳ kế toán |
| Upstream | `EP-INVENTORY-CATALOG` | (PRC) Tính giá xuất kho theo mã sản phẩm nội bộ |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Tab **"Kỳ kế toán"** | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách kỳ kế toán |
| 2 | Nút **"Thêm kỳ kế toán"** | Đang ở Danh sách | Form thêm kỳ kế toán |
| 3 | Icon **Xem / Sửa / Xóa** ở cột Thao tác | Theo trạng thái kỳ | Màn chi tiết / form sửa / popup xóa |

## 3. Layout / Wireframe

```
┌──────────────────────┐  Thêm kỳ    ┌──────────────────────┐
│  Danh sách kỳ        │────────────►│  Form Thêm kỳ        │
│  kế toán (cây        │             │  (FEAT-AP-CREATE)    │
│  Năm→Quý→Tháng)      │◄────────────│  Nút: [Tạo] [Huỷ bỏ] │
│  - sort theo         │ Tạo/Huỷ bỏ  └──────────────────────┘
│    display_order     │
│    (ẩn, auto-sinh:   │
│    Y=0, Q1=1..Q4=4,  │
│    tháng đầu=1..     │
│    cuối=3 in quarter)│
│  - empty state       │
│    "Không có dữ liệu"│
│ (FEAT-AP-LIST)       │
└──┬───────────────────┘
   │ Xem / Chỉnh sửa / Xóa (cột Thao tác)
   ▼
┌──────────────────────┐  Chỉnh sửa ┌──────────────────────┐
│  Xem kỳ kế toán      │───────────►│  Form Sửa kỳ         │
│ (FEAT-AP-DETAIL)     │◄───────────│ (FEAT-AP-EDIT)       │
│  Header: back-arrow ←│  Lưu /     │  Nút: [Lưu] [Huỷ bỏ] │
│  + audit info (4     │  Huỷ bỏ    └──────────────────────┘
│    field cho cả 3    │
│    loại; empty → "—")│
│    · Người tạo       │
│    · Ngày tạo        │
│    · Người sửa       │
│    · Ngày sửa        │
└──────────────────────┘
        │ Xóa
        ▼
┌──────────────────────────────────────────┐
│  Popup: Xác nhận xóa  |  Không thể xóa   │
│ (FEAT-AP-DELETE)                         │
└──────────────────────────────────────────┘
```

### 3.1 Form Thêm/Sửa theo loại kỳ

| Loại kỳ | Field đặc thù |
|---|---|
| **Năm** | Có field **"Năm"** — **dropdown năm rời (single-select), KHÔNG phải date picker full**: liệt kê **`[currentYear, currentYear + 49]`** = **50 giá trị** sort ascending (VD hiện tại 2026 → dropdown `2026..2075`), **default = năm hiện tại** khi mở form, KHÔNG cho chọn năm quá khứ (BR-AP-003a); **không có** "Thuộc kỳ". Có checkbox **"Tự động sinh kỳ"**. |
| **Quý** | Có **"Thuộc kỳ"** (chọn kỳ năm). Có checkbox **"Tự động sinh kỳ"**. |
| **Tháng** | Có **"Thuộc kỳ"** (chọn kỳ quý). **Không có** checkbox tự động sinh kỳ. |

Field chung mọi loại: Tên kỳ kế toán (bắt buộc), Ngày bắt đầu (bắt buộc), Ngày kết thúc (bắt buộc), Thứ tự hiển thị (mặc định 0), Đã đóng kỳ (mặc định "Chưa đóng"), Mô tả.

> **Khác biệt giữa Thêm và Sửa**: form **Thêm** cho nhập mọi field, buttons **[Tạo]** + **[Huỷ bỏ]** (FEAT-AP-CREATE AC-1). Form **Sửa** chỉ cho sửa **Tên kỳ, Mô tả, Thứ tự hiển thị, Trạng thái** (dropdown "Chưa đóng"/"Đã đóng"), buttons **[Lưu]** + **[Huỷ bỏ]**; các trường **Loại kỳ, Năm (kỳ Năm), Thuộc kỳ, Ngày bắt đầu, Ngày kết thúc, Tự động sinh kỳ** bị **khóa** (cố định sau khi tạo — xem `FEAT-AP-EDIT` v7 · BR-AP-016).

### 3.2 Sort rule `display_order`

- Danh sách sort theo cột ẩn `display_order` (không hiển thị trên UI).
- Auto-sinh khi tạo:
  - **Kỳ Năm**: `display_order = 0`.
  - **Kỳ Quý**: `Q1 = 1`, `Q2 = 2`, `Q3 = 3`, `Q4 = 4` (trong cùng năm cha).
  - **Kỳ Tháng**: tháng đầu quý = 1, tháng giữa = 2, tháng cuối = 3 (trong cùng quý cha) — không dùng số tháng dương lịch.
- User có thể sửa `display_order` qua form Sửa (Nhóm "Thứ tự hiển thị") để override; edit thứ tự hiển thị mọi loại kỳ đều được (FEAT-AP-EDIT AC-2 · FEAT-AP-CREATE AC-8).

### 3.3 Chi tiết kỳ (audit fields)

- Cả 3 loại kỳ (Năm/Quý/Tháng) đều hiển thị 4 field audit ở màn Chi tiết:
  - **Người tạo** (username hoặc "—" nếu chưa có giá trị)
  - **Ngày tạo** (dd/mm/yyyy hoặc "—")
  - **Người sửa** (hoặc "—" nếu chưa từng sửa)
  - **Ngày sửa** (hoặc "—")
- Header màn Chi tiết dùng **back-arrow ←** để quay về danh sách (không có nút "Đóng" riêng — FEAT-AP-DETAIL AC-1 v3).

## 4. Trạng thái & quy tắc hiển thị

| Trạng thái | Hiển thị (cột "Trạng thái") |
|---|---|
| Chưa đóng (OPEN) | Badge chip **"Chưa đóng kỳ"** (nền xanh) — FEAT-AP-LIST AC-4 v5 |
| Đã đóng (CLOSED) | Badge chip **"Đã đóng kỳ"** (nền đỏ) — FEAT-AP-LIST AC-4 v5 |

> Wording legacy "Icon ✗ đỏ / ✓ xanh" (v11 trước) đã bỏ — chuyển sang **text badge chip** để improve readability + a11y.

Bộ lọc: ô tìm kiếm theo **Tên kỳ kế toán** (LIKE) + dropdown lọc theo **năm** (mặc định năm hiện tại).

**Empty state**: khi danh sách rỗng → hiển thị "**Không có dữ liệu**" giữa vùng bảng (FEAT-AP-LIST AC-4b).

## 5. Edge Cases & Error States

| # | Tình huống | Xử lý UX |
|---|---|---|
| EC-1 | Bỏ trống Tên kỳ kế toán | Báo lỗi **"Tên kỳ kế toán là bắt buộc"** dưới trường |
| EC-2 | Ngày kết thúc < ngày bắt đầu | Chặn lưu, báo lỗi ngày |
| EC-3 | Kỳ con ngoài khoảng kỳ cha (không tính trùng biên) | Chặn lưu, báo lỗi phạm vi ngày |
| EC-4 | Kỳ cùng cấp chồng lấn ngày trong cùng kỳ cha | Chặn lưu, báo lỗi chồng lấn |
| EC-5 | Tự động sinh kỳ năm/quý | Sinh cây con tương ứng (năm⇒4 quý+12 tháng, quý⇒3 tháng), ngày tính tự động |
| EC-6 | Xóa kỳ đã đóng / có dữ liệu kho / còn kỳ con | Popup **"Không thể xóa"** với lý do tương ứng |
| EC-7 | Đóng kỳ rồi thao tác phiếu nhập/xuất trong kỳ | Bị chặn (chi tiết tại RECEIPT-V2/DELIVERY-V2) |
| EC-7a | Đóng kỳ & tương tác với **Tính giá xuất kho (PRC)** | **BR-PRC-008** — đóng kỳ chặn **RECALC** (`FEAT-PRC-RECALC`), KHÔNG chặn tính giá lần đầu (`FEAT-PRC-CREATE` vẫn chạy được), KHÔNG auto-cascade khi mở lại kỳ (user phải chủ động RECALC lại kỳ đó + kỳ sau bị ảnh hưởng theo thứ tự — xem §6 PRC + FEAT-AP-EDIT AC-4/AC-5). |
| EC-8 | EDIT kỳ Năm | Field **"Năm"** khóa (read-only) — muốn đổi năm phải xóa kỳ + tạo lại (BR-AP-016 · FEAT-AP-EDIT AC-3 v7). |

## 6. Luồng Tính giá xuất kho (PRC)

> Tab **"Tính giá xuất kho"** — UI tính giá vốn BQGQ cuối kỳ. Referenced by `FEAT-PRC-LIST/CREATE/DETAIL/RECALC/DELETE`.

### Sơ đồ luồng

```
┌─────────────────────────────────────────────────────────────────┐
│              LUỒNG TÍNH GIÁ XUẤT KHO (PRC)                       │
├─────────────────────────────────────────────────────────────────┤
│  Danh sách lịch sử tính giá (FEAT-PRC-LIST)                      │
│     ├─ Tính giá ──► Form thực hiện (FEAT-PRC-CREATE)             │
│     │     chọn Kỳ (khóa Từ/Đến) + Kho + mã cụ thể                │
│     │     → Thực hiện: LƯU PHIẾU TRƯỚC (trạng thái "Đang        │
│     │       tính") ─► chạy nền: tính BQ, điền giá vốn phiếu      │
│     │       xuất, cập nhật sổ tồn, cập nhật dần từng mã, log      │
│     │     (KHÔNG bắt tính tuần tự · chặn chạy trùng kỳ+kho)       │
│     ├─ Xem ──► Chi tiết lần tính (FEAT-PRC-DETAIL)               │
│     │     bảng theo mã + bảng "Sản phẩm chạy giá lỗi" (ẩn nếu    │
│     │     không lỗi)                                              │
│     │     └─ Tính lại (FEAT-PRC-RECALC): chạy NỀN, ghi đè tại    │
│     │        chỗ (giữ số cũ tới khi tính tới từng mã); chặn nếu   │
│     │        kỳ đã đóng / đang có job "Đang tính" cùng kỳ+kho     │
│     └─ Xóa ──► Xóa log (FEAT-PRC-DELETE): không rollback giá     │
│        vốn; chặn nếu kỳ đã đóng                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Form thực hiện tính giá

- Thông tin kỳ: **Kỳ kế toán*** (chọn → tự điền + khóa Từ/Đến) · **Từ ngày*** · **Đến ngày*** · **Kho*** · **Phương pháp*** (BQ cuối kỳ) · **Chọn vật tư** (Tất cả mã / Chọn mã cụ thể).
- Bảng "Vật tư hàng hóa cần tính giá": Mã nội bộ · Tên · ĐVT chính · **Có phát sinh xuất** (info) · **Lần tính gần nhất** (info) · Thao tác. Nút **Thêm phụ tùng**.
- Ghi chú: tính theo kho; không nên thêm/sửa chứng từ trong lúc tính.

### Chi tiết lần tính

- Thẻ: Từ ngày · Đến ngày · Kho · **Trạng thái** (Đang tính / Thành công / Hoàn thành có lỗi — không có "Thất bại" riêng). Khi "Đang tính" → bảng thể hiện tiến độ từng mã.
- Bảng: Mã nội bộ · Tên · ĐVT chính · **Tồn đầu kỳ (SL, GT) · Nhập (SL, GT) · Xuất (SL, GT) · SL cuối kỳ · Giá trị cuối kỳ · Đơn giá bình quân · Số phiếu xuất cập nhật · Trạng thái (Đã tính/Lỗi)**. (Cột "Đơn giá bình quân" = (GT đầu + GT nhập)/(SL đầu + SL nhập) — kết quả chạy giá, **hiển thị 2 số lẻ**; đơn giá=0 hợp lệ (mã chưa nhập/nhập tiền 0); dòng lỗi để trống. Không ẩn dòng nào — kết quả khớp danh sách đã chạy.)
- Bảng "Sản phẩm chạy giá lỗi" (ẩn nếu không lỗi): mã / tên / **lý do** / hướng xử lý. Lý do hiện chỉ có **"Do tồn âm"** (`ERR-INV-030`); "Lệch hạch toán" (`ERR-INV-031`) thuộc [MỞ RỘNG TƯƠNG LAI] — hạch toán chưa làm.

### Edge cases PRC

| # | Tình huống | Xử lý |
|---|---|---|
| PRC-EC-1 | Kỳ trước chưa tính (kể cả có nhập/xuất ở khoảng giữa) | **KHÔNG chặn** — tồn đầu lấy theo tồn kho đến "Từ ngày" − 1 nên đã phản ánh mọi biến động nhập/xuất kỳ trước (phiếu xuất chưa tính → tiền vốn=0); tính/tính lại kỳ → kỳ sau cần tính lại |
| PRC-EC-2 | Mã có SL tồn âm trong kỳ | Mã lỗi **"Do tồn âm"** (`ERR-INV-030`); không cập nhật mã đó; vào bảng lỗi |
| PRC-EC-3 | Tính lại / Xóa khi kỳ đã đóng | Chặn |
| PRC-EC-4 | Bấm Tính giá lại cùng phạm vi | Tạo log mới |
| PRC-EC-5 | Bấm Tính giá khi đang có lần tính "Đang tính" cùng (kỳ+kho) | **Chặn** — `ERR-INV-029` |
| PRC-EC-6 | Mở DETAIL khi lần tính đang chạy | Trạng thái "Đang tính", thấy tiến độ từng mã |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-ACCOUNTING-PERIOD (file mới) — luồng Kỳ kế toán (AP): cây Năm→Quý→Tháng, form thêm/sửa theo 3 loại kỳ, tự động sinh kỳ, đóng/mở kỳ (cho mở lại), xóa có chặn. Luồng Tính giá xuất kho (PRC) sắp bổ sung. |
| 2026-06-03 | 2 | Business Authority | Bổ sung §4B — luồng Tính giá xuất kho (PRC): danh sách lịch sử → form thực hiện (chọn kỳ khóa ngày + kho + mã) → chi tiết (bảng theo mã + bảng lỗi) → tính lại / xóa log; tính tuần tự, chặn kỳ đã đóng. |
| 2026-06-15 | 3 | Business Authority | Tái thiết kế PRC: diagram + form bỏ "snapshot/tuần tự" → **cập nhật giá trị sổ tồn, KHÔNG bắt tính tuần tự**; bảng chi tiết đổi cột **Tồn đầu/Nhập/Xuất (SL,GT) + SL cuối + GT cuối** (bỏ Đơn giá BQ); PRC-EC-1 đổi sang không chặn. |
| 2026-06-16 | 4 | Business Authority | **Chạy nền**: diagram thêm "lưu phiếu trước (Đang tính) → chạy nền → cập nhật dần · chặn chạy trùng"; thẻ Trạng thái nêu enum mới (Đang tính / Thành công / Hoàn thành có lỗi — bỏ "Thất bại"); thêm PRC-EC-5 (chặn chạy trùng `PRICING_RUN_IN_PROGRESS`) + PRC-EC-6 (mở DETAIL lúc đang chạy). |
| 2026-06-16 | 5 | Business Authority | **Mã lỗi chạy giá**: bảng lỗi + PRC-EC-2 nêu lý do **"Do tồn âm"** (`PRICING_NEGATIVE_STOCK`, đang áp dụng) / "Lệch hạch toán" (`PRICING_ACCOUNTING_MISMATCH`, [MỞ RỘNG TƯƠNG LAI]). |
| 2026-06-16 | 6 | Business Authority | **Giữ lại cột "Đơn giá bình quân"** ở bảng chi tiết = (GT đầu+GT nhập)/(SL đầu+SL nhập), kết quả chạy giá, hiển thị **2 số lẻ**; đơn giá=0 hợp lệ; không ẩn dòng nào. |
| 2026-06-16 | 7 | Business Authority | Đăng ký mã lỗi: đổi mã bare → ERR-INV-NNN (ERROR-CODE-REGISTRY §4). |
| 2026-06-16 | 8 | Business Authority | Sắp lại thứ tự section: §4B (Luồng PRC, đang nằm sau §5) → đánh số lại cho liền mạch thành **§6** (Change Log dời xuống cuối thành §7); đồng bộ tham chiếu §1 Phạm vi tài liệu (§4B → §6) và 5 FEAT-PRC (§4B → §6). |
| 2026-06-16 | 9 | Business Authority | **G2 ý 2** — diagram nhánh Tính lại: RECALC **chạy nền, ghi đè tại chỗ** (giữ số cũ tới khi tính tới từng mã); chặn nếu đang có job "Đang tính" cùng kỳ+kho. |
| 2026-06-16 | 10 | Business Authority | Đồng bộ công thức carry-over PRC-EC-1: tồn đầu trừ cả Σ xuất kỳ giữa chưa tính (cộng nhập − trừ xuất; xuất chưa tính → tiền vốn=0) — khớp BR-PRC-002/004 mới. |
| 2026-06-16 | 11 | Business Authority | Đồng bộ PRC-EC-1 theo mô tả tồn đầu mới: tồn đầu = tồn kho đến "Từ ngày" − 1 (đã phản ánh biến động kỳ trước; phiếu xuất chưa tính → tiền vốn=0). Bỏ diễn đạt dồn. Khớp BR-PRC-002/006. |
| 2026-07-08 | 12 | Business Authority (quannn) + main agent | **F4 W04 audit sync — đồng bộ AP-* FEAT** (audit W04 FEAT↔UX drift 2026-07-08): (1) §3 wireframe rewrite button labels: "Lưu / Đóng" → **"Tạo / Huỷ bỏ"** cho Form Thêm (FEAT-AP-CREATE AC-1 v4) + "Chỉnh sửa" entry (FEAT-AP-EDIT AC-1 v5); màn Chi tiết chuyển **back-arrow ←** thay vì nút "Đóng" (FEAT-AP-DETAIL AC-1 v3); thêm section audit fields (4 field cho cả 3 loại kỳ, empty → "—"). (2) §3.1 rewrite "Khác biệt Thêm/Sửa": Sửa dùng field **"Trạng thái"** (dropdown), thêm **"Năm (kỳ Năm)"** vào danh sách trường khóa (đồng bộ FEAT-AP-EDIT AC-3 v7 · BR-AP-016). (3) §3.2 mới — **Sort rule `display_order`** (cột ẩn, auto-sinh Q1=1..Q4=4, tháng đầu=1..cuối=3, user override được — FEAT-AP-LIST AC-6/6b · FEAT-AP-CREATE AC-8). (4) §3.3 mới — **Chi tiết kỳ (audit fields)** liệt kê 4 field + empty "—" cho cả 3 loại kỳ. (5) §4 rewrite trạng thái hiển thị: bỏ **Icon ✗ đỏ / ✓ xanh**, chuyển sang **Badge chip text** "Chưa đóng kỳ" (xanh) / "Đã đóng kỳ" (đỏ) — FEAT-AP-LIST AC-4 v5. Thêm empty state "Không có dữ liệu" (FEAT-AP-LIST AC-4b). (6) §5 thêm **EC-7a**: đóng kỳ tương tác PRC (**BR-PRC-008** — chặn RECALC, KHÔNG chặn tính giá lần đầu, KHÔNG auto-cascade khi mở lại; back-link §6 PRC) — resolve gap FEAT-AP-EDIT AC-4/AC-5. Thêm **EC-8**: EDIT kỳ Năm → field "Năm" khóa, muốn đổi phải xóa + tạo lại. |
| 2026-07-08 | 13 | Business Authority (quannn) + main agent | **Tả widget field "Năm" khi tạo kỳ Năm** (BA quannn quyết 2026-07-08 sau khi rà Figma dropdown). §3.1 row "Năm" rewrite: bỏ mô tả "date picker" (sai với Figma), chốt **dropdown năm rời single-select** liệt kê **`[currentYear, currentYear + 49]`** = 50 giá trị sort ascending, default = năm hiện tại, không cho chọn năm quá khứ. Ref BR-AP-003a mới (BR-GF-INVENTORY-ACCOUNTING-PERIOD v27) + FEAT-AP-CREATE AC-2 v6. Không đổi field "Thuộc kỳ" của Quý/Tháng (vẫn dropdown kỳ cha). |
