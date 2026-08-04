---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 12
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-07-08"
---

# UX-FLOW-INVENTORY-CATALOG: Danh mục vật tư kho (Mã sản phẩm nội bộ & Nhóm vật tư hàng hóa)

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-CATALOG` |
| Kind | FLOW |
| Referenced by | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-DETAIL`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DELETE`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT`, `FEAT-INV-MOBILE-MENU` |

## 1. Purpose

Luồng danh mục vật tư kho mô tả cách garage quản lý hai danh mục nền tảng cho nghiệp vụ kho V2:

- **Nhóm vật tư hàng hóa (VTHH)** — danh mục phân cấp đa tầng (cha–con qua trường "Thuộc nhóm") dùng để phân loại mã sản phẩm nội bộ.
- **Mã sản phẩm nội bộ** — mã chuẩn của garage dùng để tính tồn và mapping SKU, kèm khai báo ĐVT quy đổi, gắn mã SKU, đính kèm tệp.

Hai danh mục được tổ chức trên cùng một khu vực, điều hướng qua **tab**: **"Danh sách sản phẩm"** · **"Nhóm vật tư hàng hóa"** · **"Kỳ kế toán"** (kỳ kế toán thuộc epic khác — `EP-INVENTORY-ACCOUNTING-PERIOD`).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng.

**Nền tảng:** Garage Care — **Web GMS** (đầy đủ: tạo/sửa/xóa/import… cho cả nhóm VTHH lẫn mã sản phẩm) + **App Garage** (mobile, phạm vi khác nhau theo nhóm chức năng):
> - **Nhóm vật tư hàng hóa**: mobile **đầy đủ** — thêm / sửa / xóa / list / xem.
> - **Mã sản phẩm nội bộ**: mobile **chỉ list + xem (view-only)** — không tạo/sửa/xóa/import/export (chỉ trên web).

### Sơ đồ luồng vận hành tổng quan

```
┌───────────────────────────────────────────────────────────────────┐
│              LUỒNG DANH MỤC VẬT TƯ KHO (CATALOG)                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TAB 1 — NHÓM VẬT TƯ HÀNG HÓA                                     │
│     Danh sách (trải phẳng, có phân trang) ─┬─ Thêm nhóm ──► Đang HĐ │
│                       ├─ Xem chi tiết                              │
│                       ├─ Sửa ──┬─ đổi trạng thái / chuyển nhóm cha │
│                       │         └─ cha Ngừng HĐ ⇒ con Ngừng HĐ      │
│                       └─ Xóa ──┬─ chưa phát sinh PROD & không con  │
│                                 │   ⇒ Xác nhận xóa                  │
│                                 └─ đã có PROD / còn con            │
│                                     ⇒ Chặn xóa                      │
│                                                                   │
│  TAB 2 — DANH SÁCH SẢN PHẨM                                        │
│     Danh sách ─┬─ Thêm mã (4 tab: TT chung / ĐVT quy đổi /        │
│                 │            SKU / Đính kèm) ───► Đang hoạt động   │
│                 ├─ Xem chi tiết                                    │
│                 │     └─ Gắn SKU · Thêm ĐVT quy đổi                │
│                 ├─ Sửa (mã & ĐVT chính khóa nếu đã giao dịch)      │
│                 ├─ Xóa ─┬─ chưa giao dịch ⇒ Xác nhận xóa          │
│                 │        └─ đã giao dịch/tồn ⇒ Chặn xóa            │
│                 ├─ Import (Tải template → Kiểm tra → Kết quả)      │
│                 └─ Export (theo bộ lọc hiện tại)                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Tham chiếu | Danh mục ĐVT (master) | Nguồn đơn vị tính cho ĐVT chính + ĐVT quy đổi |
| Tham chiếu | Danh mục SKU (sẵn có) | Nguồn mã SKU để gắn vào mã sản phẩm nội bộ |
| Downstream | `EP-INVENTORY-RECEIPT-V2`, `EP-INVENTORY-DELIVERY-V2` | Phiếu nhập/xuất kho V2 chọn mã sản phẩm nội bộ + ĐVT |
| Downstream | `EP-INVENTORY-STOCK-V2`, `EP-INVENTORY-OPENING-BALANCE`, `EP-INVENTORY-ACCOUNTING-PERIOD` | Tồn kho / tồn đầu kỳ / tính giá tham chiếu mã sản phẩm nội bộ |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Tab **"Nhóm vật tư hàng hóa"** | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách nhóm VTHH |
| 2 | Tab **"Danh sách sản phẩm"** | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách sản phẩm |
| 3 | Nút **"Thêm Nhóm VT/HH"** trên Danh sách nhóm | Đang ở Danh sách nhóm VTHH | Form thêm nhóm VTHH |
| 4 | Nút **"Thêm sản phẩm"** trên Danh sách sản phẩm | Đang ở Danh sách sản phẩm | Form thêm mã sản phẩm nội bộ |
| 5 | Nhấn vào một dòng trong danh sách | Đang ở danh sách tương ứng | Màn hình chi tiết tương ứng |
| 6 | Icon **Xem / Sửa / Xóa** ở cột Thao tác | Theo trạng thái bản ghi | Màn chi tiết / form sửa / popup xóa |
| 7 | Nút **"Import"** trên Danh sách mã | Đang ở Danh sách mã sản phẩm | Wizard import (2 bước) |
| 8 | Nút **"Export"** trên Danh sách mã | Đang ở Danh sách mã sản phẩm | Tải file `.xlsx` theo bộ lọc hiện tại |
| 9 | **(Mobile only)** Mở **"Quản lý kho hàng"** từ **mission tile trên Home** của app | Đã đăng nhập app Garage; điểm vào chốt = **mission tile "Quản lý kho hàng"** trên màn Home (FEAT-INV-MOBILE-MENU v3, BA chốt 2026-07-07) | Màn **Hub điều hướng kho hàng** (`FEAT-INV-MOBILE-MENU`) — grid tile (2 cột phone, 3 cột tablet) tối đa 6 tile, chỉ render tile đã ship |
| 10 | **(Mobile only)** Tap tile **"Sản phẩm"** trên hub | Đang ở Hub kho hàng | Màn Danh sách mã sản phẩm nội bộ (`FEAT-CAT-PROD-LIST`, view-only mobile) |
| 11 | **(Mobile only)** Tap tile **"Nhóm vật tư"** trên hub | Đang ở Hub kho hàng | Màn Danh sách nhóm VTHH (`FEAT-CAT-GRP-LIST`, full CRUD mobile) |

## 3. Layout / Wireframe

> Khu vực danh mục gồm 2 luồng song song (Nhóm VTHH, Mã sản phẩm nội bộ). Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn — chi tiết nội dung từng màn xem tại FEAT tương ứng.
>
> **Web vs Mobile** — Web dùng **sidebar điều hướng** (tab "Danh sách sản phẩm" / "Nhóm vật tư hàng hóa" / "Kỳ kế toán" như §1). Mobile dùng **màn hub điều hướng** §3.0 dưới đây (vào hub → tap tile vào sub-module). KHÔNG triển khai hub trên web.

### 3.0 Hub điều hướng — Quản lý kho hàng (mobile only)

> Mobile-only entry hub xuyên 4 wave (W03–W06). Chi tiết AC: **`FEAT-INV-MOBILE-MENU`**.

```
┌─────────────────────────────────────────────┐
│  HEADER: ←  Quản lý kho hàng     🔔  📶 🔋  │
├─────────────────────────────────────────────┤
│                                              │
│    ┌──────────────┐   ┌──────────────┐      │
│    │   📦 Sản     │   │   📁 Nhóm    │      │
│    │     phẩm     │   │   vật tư     │      │
│    └──────────────┘   └──────────────┘      │
│                                              │
│    ┌──────────────┐   ┌──────────────┐      │
│    │   📥 Phiếu   │   │   📤 Phiếu   │      │
│    │     nhập     │   │     xuất     │      │
│    └──────────────┘   └──────────────┘      │
│                                              │
│    ┌──────────────┐   ┌──────────────┐      │
│    │   🏠 Tồn     │   │   📅 Tồn     │      │
│    │     kho      │   │   đầu kỳ     │      │
│    └──────────────┘   └──────────────┘      │
│                                              │
└─────────────────────────────────────────────┘
```

**Hành vi**:
- Hub là client-only navigation (không gọi BFF). Tap tile → push route tới màn list sub-module + preserve back stack.
- Tile chỉ render khi sub-module tương ứng đã GA — **ẨN HOÀN TOÀN** tile chưa GA (no placeholder, no badge).
- Cả 2 role (chủ garage + kế toán) thấy đủ tile đã enable. Permission per sub-module gate ở route đích.

**State matrix tile per wave** (theo `FEAT-INV-MOBILE-MENU` §3 + `Plan/WAVE-SEQUENCE.md` PART II):

| # | Tile | FEAT đích | W03 | W04 | W05 | W06 |
|---|---|---|---|---|---|---|
| 1 | **Sản phẩm** | `FEAT-CAT-PROD-LIST` | ✅ | ✅ | ✅ | ✅ |
| 2 | **Nhóm vật tư** | `FEAT-CAT-GRP-LIST` | ✅ | ✅ | ✅ | ✅ |
| 3 | **Phiếu nhập** | `FEAT-IR-LIST-V2` *(EP-INVENTORY-RECEIPT-V2)* | ❌ ẩn | ❌ ẩn | ✅ | ✅ |
| 4 | **Phiếu xuất** | `FEAT-ID-LIST-V2` *(EP-INVENTORY-DELIVERY-V2)* | ❌ ẩn | ❌ ẩn | ✅ | ✅ |
| 5 | **Tồn kho** | `FEAT-STK-LIST-V2` *(EP-INVENTORY-STOCK-V2)* | ❌ ẩn | ❌ ẩn | ❌ ẩn | ✅ |
| 6 | **Tồn đầu kỳ** | `FEAT-OB-LIST` *(EP-INVENTORY-OPENING-BALANCE)* | ❌ ẩn | ✅ | ✅ | ✅ |

> **Wave-by-wave visible count**:
> - **W03** → **2 tile** (Sản phẩm + Nhóm vật tư) — 1 hàng 2 cột.
> - **W04** → **3 tile** (Sản phẩm + Nhóm vật tư + **Tồn đầu kỳ**) — 2 hàng: hàng đầu 2 tile, hàng thứ 2 có 1 tile lệch trái (reflow giữ thứ tự gốc).
> - **W05** → **5 tile** (thêm Phiếu nhập + Phiếu xuất) — 3 hàng.
> - **W06** → **6 tile** (thêm Tồn kho) — 3 hàng đầy.
>
> Reflow tự động giữ thứ tự gốc khi tile ẩn. Tile ẩn = **KHÔNG có placeholder / disabled state / "coming soon" badge** — hoàn toàn không hiển thị (BR-INV-MENU-002).

### 3.1 Nhóm vật tư hàng hóa

```
┌──────────────────────┐   Thêm nhóm    ┌──────────────────────┐
│  Danh sách nhóm      │───────────────►│  Form thêm nhóm      │
│  VTHH (trải phẳng)   │                │  (FEAT-CAT-GRP-      │
│ (FEAT-CAT-GRP-LIST)  │◄───────────────│   CREATE)            │
│                      │  Lưu / Đóng    └──────────────────────┘
└──┬───────────────────┘
   │ Xem / Sửa / Xóa (cột Thao tác)
   ▼
┌──────────────────────┐   Sửa         ┌──────────────────────┐
│  Xem nhóm VTHH       │──────────────►│  Form sửa nhóm       │
│ (FEAT-CAT-GRP-DETAIL)│◄──────────────│ (FEAT-CAT-GRP-EDIT)  │
│  + audit info        │   Lưu / Hủy   └──────────────────────┘
└──────────────────────┘
        │ Xóa
        ▼
┌──────────────────────────────────────────┐
│  Popup: Xác nhận xóa  |  Chặn xóa        │
│ (FEAT-CAT-GRP-DELETE)                    │
└──────────────────────────────────────────┘
```

### 3.2 Mã sản phẩm nội bộ

```
┌──────────────────────┐  Thêm mã / Import / Export
│  Danh sách mã SP     │──────────┬──────────┬───────────┐
│ (FEAT-CAT-PROD-LIST) │          │          │           │
└──┬───────────────────┘          ▼          ▼           ▼
   │                    ┌───────────────┐ ┌─────────┐ ┌────────┐
   │                    │ Form thêm mã  │ │ Import  │ │ Export │
   │                    │ (4 tab)       │ │ wizard  │ │ .xlsx  │
   │                    │ (CREATE)      │ │(IMPORT) │ │(EXPORT)│
   │                    └───────────────┘ └─────────┘ └────────┘
   │ Xem chi tiết
   ▼
┌──────────────────────┐   Sửa        ┌──────────────────────┐
│  Chi tiết mã SP      │─────────────►│  Form sửa mã SP      │
│ (FEAT-CAT-PROD-      │◄─────────────│ (FEAT-CAT-PROD-EDIT) │
│  DETAIL)             │   Lưu / Hủy  └──────────────────────┘
│  Tabs: ĐVT quy đổi · │   Gắn SKU → modal Gắn/bỏ gắn SKU
│  Mã SKU · Đính kèm   │   Thêm ĐVT quy đổi → modal ĐVT quy đổi
│  Actions: Sửa / Gắn  │
│  SKU / Thêm ĐVT /    │   Xóa → popup Xác nhận | Chặn xóa
│  Xóa                 │            (FEAT-CAT-PROD-DELETE)
└──────────────────────┘
```

### 3.3 Modal phụ trợ

| Modal | Thuộc màn | Mô tả |
|---|---|---|
| **Gắn / bỏ gắn SKU** | Chi tiết / Form mã SP, tab Mã SKU | Tìm SKU theo mã/tên/nguồn; hiển thị trạng thái **"Chưa mapping"** / **"Đã mapping mã khác"**; chọn checkbox → Gắn SKU. SKU đã mapping mã khác không chọn được. |
| **Thêm / sửa ĐVT quy đổi** | Chi tiết / Form mã SP, tab ĐVT quy đổi | Chọn ĐVT (từ master) + nhập tỷ lệ quy đổi (**> 0, cho số lẻ tối đa 6 chữ số sau dấu phẩy, không trùng ĐVT** — `ERR-INV-013`/`ERR-INV-047`/`ERR-INV-014`). |

### 3.4 Luồng Import danh mục (wizard 2 bước — Web GMS)

> Mở từ nút **"Import"** trên Danh sách mã sản phẩm. Mục tiêu: tạo nhanh nhiều mã từ file `.xlsx`, có preview trước khi ghi. Chi tiết AC: **FEAT-CAT-PROD-IMPORT**.

1. **Bước 1 — Tải Template**: tải file `.xlsx` mẫu (cột chuẩn — KHÔNG có "phương pháp tính giá"/"trạng thái"; cột nhóm = "Nhóm vật tư/hàng hóa"). Chọn/kéo-thả file đã điền.
   - *Nhánh lỗi cấp file (EC-9/EC-10)*: file không phải `.xlsx` / không đọc được / rỗng → báo lỗi, không qua bước 2. File **> 500 dòng** → từ chối toàn bộ (`ERR-INV-041`).
2. **Bước 2 — Kiểm tra dữ liệu (preview)**: hiển thị **Tổng dòng / Hợp lệ / Lỗi** + bảng từng dòng (Trạng thái + Lý do lỗi) + phân trang.
   - *Nhánh lỗi cấp dòng (EC-7)*: trùng mã / thiếu trường / ĐVT-nhóm-xuất xứ-tính chất không khớp master → đánh dấu dòng "Lỗi" (không ghi dòng đó). *(Thương hiệu nhập tay — không validate.)*
   - Nhấn **"Xác nhận import"** → chỉ ghi dòng hợp lệ (chỉ tạo mới, mặc định trạng thái "Đang hoạt động" + giá "Bình quân cuối kỳ").
3. **Kết quả**: màn "Kết quả import" (Tạo mới / Bỏ qua-lỗi / Thời gian) + nút **"Tải file lỗi"** (chứa dòng lỗi + lý do để sửa và import lại).

## 4. Trạng thái & quy tắc hiển thị

| Trạng thái | Hiển thị | Hành động khả dụng |
|---|---|---|
| Nhóm/Mã **"Đang hoạt động"** | Badge xanh **"Đang hoạt động"** | Xem / Sửa / Xóa |
| Nhóm/Mã **"Ngừng hoạt động"** | Badge cam **"Ngừng hoạt động"** | Chỉ **Xem** (không Sửa/Xóa trực tiếp từ danh sách; mã ngừng hoạt động không dùng trong phiếu mới) |
| Bộ lọc trạng thái (danh sách) | 3 lựa chọn: **Tất cả** / **Đang hoạt động** (mặc định) / **Ngừng hoạt động** | — |

## 5. Edge Cases & Error States

| # | Tình huống | Xử lý UX |
|---|---|---|
| EC-1 | Trùng mã nhóm / mã sản phẩm trong cùng garage | Báo lỗi tại trường mã (**"Mã nhóm đã tồn tại"** / mã sản phẩm đã tồn tại), không cho lưu |
| EC-2 | Mã chứa ký tự đặc biệt `~!@#$%^&*` | Báo lỗi validation tại trường mã |
| EC-3 | Chuyển nhóm vào chính nó hoặc nhóm con / hậu duệ của nó (Sửa nhóm) | Chặn, báo lỗi vòng lặp phân cấp. Cho phép chuyển sang mọi nhóm khác (cấp cha hoặc nhóm con của nhánh khác). |
| EC-4 | Xóa nhóm còn nhóm con hoặc đã có mã sản phẩm | Popup **"Không thể xóa"** với lý do tương ứng |
| EC-5 | Xóa mã sản phẩm đã phát sinh giao dịch / có tồn | Popup **"Không thể xóa"** (đã phát sinh dữ liệu sử dụng) |
| EC-6 | Sửa ĐVT chính / ĐVT quy đổi đã phát sinh giao dịch | Field khóa (disabled) kèm helper text giải thích |
| EC-7 | Import có dòng lỗi | Bước "Kiểm tra dữ liệu" hiển thị số dòng hợp lệ / lỗi + lý do; chỉ ghi dòng hợp lệ; cho **Tải file lỗi** sau khi import. Loại lỗi dòng: trùng mã (`ERR-INV-007`), thiếu trường bắt buộc, ký tự đặc biệt (`ERR-INV-006`), **ĐVT không khớp master** (`ERR-INV-042`), **nhóm VTHH không tồn tại/ngừng hoạt động** (`ERR-INV-043`), **xuất xứ không khớp** (`ERR-INV-044`), tính chất sai (`ERR-INV-012`) |
| EC-8 | Gắn SKU đã mapping mã nội bộ khác | SKU hiển thị **"Đã mapping mã khác"**, không cho chọn |
| EC-9 | Import: file **sai định dạng** (không `.xlsx`) hoặc **rỗng** (0 dòng) | Báo lỗi ngay bước chọn file, **không** chuyển sang bước kiểm tra; file rỗng → thông báo "File không có dữ liệu" |
| EC-10 | Import: file **> 500 dòng** | **Từ chối toàn bộ** ngay bước kiểm tra (không ghi dòng nào), banner `ERR-INV-041` "Vượt giới hạn 500 dòng/lần — vui lòng tách file" (BR-CAT-PROD-020) |
| EC-11 | **Danh sách rỗng — chưa có dữ liệu** (garage mới, cả nhóm VTHH lẫn mã sản phẩm) | Vùng danh sách hiển thị **empty state** (`EMPTY_STATE`, không phải lỗi): icon placeholder + text **"Không có dữ liệu"** ở giữa; **vẫn giữ** thanh tìm kiếm + bộ lọc + nút Thêm (mã SP có thêm Import/Export) để tạo bản ghi đầu tiên |
| EC-12 | **Danh sách rỗng — tìm kiếm/bộ lọc không khớp** (có dữ liệu nhưng không dòng nào thỏa) | Empty state với text **"Không tìm thấy kết quả phù hợp"** (phân biệt EC-11); giữ thanh tìm kiếm + bộ lọc để người dùng điều chỉnh/xóa điều kiện |

## 6. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-CATALOG (file mới) — luồng danh mục vật tư kho V2: Nhóm VTHH (cây phân cấp, cascade ngừng hoạt động) + Mã sản phẩm nội bộ (4 tab, gắn SKU, ĐVT quy đổi, import/export, lịch sử). Tham chiếu bởi 12 feature của EP-INVENTORY-CATALOG. |
| 2026-06-16 | 2 | Business Authority | Fix: sửa tham chiếu sai ID epic EP-ACCOUNTING-PERIOD → EP-INVENTORY-ACCOUNTING-PERIOD |
| 2026-06-16 | 3 | Business Authority | Bỏ hẳn lịch sử: gỡ "theo dõi lịch sử", "Xem chi tiết (+ tab Lịch sử)" → "Xem chi tiết", và bỏ "Lịch sử" khỏi sơ đồ tab chi tiết. Đồng bộ bỏ tab Lịch sử. |
| 2026-06-16 | 4 | Business Authority | **Mở mobile (view-only)**: dòng "Nền tảng" → Web GMS (đầy đủ) + **App Garage (chỉ XEM** danh sách sản phẩm & nhóm VTHH). Mở scope mobile cho Catalog — đảo "Web GMS only". (Bước 1 CR mobile kho V2.) |
| 2026-06-24 | 7 | Business Authority | Thêm **empty state cho danh sách** (rà soát wave 3): §5 **EC-11** (rỗng — chưa có dữ liệu → "Không có dữ liệu" + giữ tìm kiếm/lọc/nút Thêm) + **EC-12** (rỗng — tìm/lọc không khớp → "Không tìm thấy kết quả phù hợp"). Áp cho cả nhóm VTHH lẫn mã sản phẩm. Đồng bộ FEAT-CAT-GRP-LIST v4 + FEAT-CAT-PROD-LIST v6. |
| 2026-06-26 | 8 | Business Authority | **Đồng bộ render Nhóm VTHH = trải phẳng (theo Figma web mới + FEAT-CAT-GRP-LIST v6)**: (1) §1 Purpose — wording "(cây cha–con)" → **"(cha–con qua trường 'Thuộc nhóm')"** (data hierarchy giữ, bỏ từ "cây" để không bị hiểu nhầm sang display); (2) §1 sơ đồ vận hành tổng quan — `Danh sách (cây)` → **`Danh sách (trải phẳng, có phân trang)`**; (3) §3.1 wireframe — `VTHH (dạng cây)` → **`VTHH (trải phẳng)`**. CHỈ áp cho nhóm VTHH; **Kỳ kế toán giữ nguyên dạng cây Năm→Quý→Tháng** (FEAT-AP-LIST, ngoài scope). |
| 2026-06-26 | 9 | Business Authority | **Chuẩn hoá precision tỷ lệ quy đổi** (theo BR-CAT-PROD-011 v15): §3.3 modal "Thêm / sửa ĐVT quy đổi" — bổ sung "**tối đa 6 chữ số sau dấu phẩy**" + cross-ref mã lỗi (`ERR-INV-013` ≤0, `ERR-INV-047` vượt 6 chữ số, `ERR-INV-014` trùng ĐVT). Đồng bộ FEAT-CAT-PROD-CREATE v10 + FEAT-CAT-PROD-DETAIL v8 + FEAT-CAT-PROD-EDIT v8 + FEAT-IR-CREATE-V2 v19 + FEAT-ID-CREATE-V2 v14 + ERROR-CODE-REGISTRY v16. |
| 2026-06-24 | 6 | Business Authority | **Đính chính phạm vi mobile** (BA làm rõ): §1 Nền tảng — **Nhóm VTHH** mobile **đầy đủ** (thêm/sửa/xóa/list/xem); **Mã sản phẩm nội bộ** mobile **chỉ list+xem** (view-only). Trước đó ghi nhầm "mobile chỉ XEM cả 2". Đồng bộ FEAT-CAT-GRP-LIST/DETAIL (gỡ AC view-only → AC phạm vi nền tảng đầy đủ). |
| 2026-06-24 | 5 | Business Authority | **Bổ sung luồng Import (rà soát wave 3)**: thêm **§3.4 Luồng Import wizard 2 bước** (Tải template → Kiểm tra → Kết quả) + nhánh lỗi; mở rộng **EC-7** liệt kê đủ loại lỗi dòng (ĐVT/nhóm/xuất xứ/tính chất không khớp master → ERR-INV-042/043/044/012); thêm **EC-9** (file sai định dạng/rỗng) + **EC-10** (>500 dòng → ERR-INV-041). Đồng bộ FEAT-CAT-PROD-IMPORT v9 + BR v12. |
| 2026-06-29 | 10 | Business Authority | **Bổ sung Hub điều hướng mobile** "Quản lý kho hàng" (`FEAT-INV-MOBILE-MENU` mới). §Metadata Referenced by +1 FEAT. §2 Entry Points thêm 3 entry mobile (#9 mở hub, #10 tap "Sản phẩm", #11 tap "Nhóm vật tư"). §3 thêm note **Web vs Mobile** (web sidebar, mobile hub) + §3.0 mới — ASCII wireframe grid 2 cột 6 tile + hành vi + state matrix tile per wave (W03 ✅2 tile · W04 ✅3 · W05 ✅5 · W06 ✅6). **BA decision 2026-06-29 ẨN HOÀN TOÀN tile chưa ship** (no badge). Hub mobile-only — web KHÔNG có FEAT tương đương. NEED CONFIRMATION: Figma node-id hub + điểm vào hub từ đâu trên app. |
| 2026-07-02 | 11 | Business Authority | **Đồng bộ tab name theo Figma web** (verbatim screenshot 2026-07-01): tab "Mã sản phẩm nội bộ" → **"Danh sách sản phẩm"** tại 4 chỗ — §1 dòng 30 (tab list), §1 sơ đồ dòng 55 (TAB 2 heading), §2 Entry Points #2 (tab name + output), §3 note Web vs Mobile (sidebar tab list). Đồng bộ FEAT-CAT-PROD-LIST v9 AC-1 (đã sửa trước). FEAT title + EP/README title giữ nguyên "Danh sách mã sản phẩm nội bộ" (tên nghiệp vụ nội bộ, không phải UI label). |
| 2026-07-08 | 12 | Business Authority (quannn) + main agent | **F7 W04 audit sync — hub entry point + state matrix W04** (audit W04 FEAT↔UX drift 2026-07-08): (1) §2 Entry Points #9 — **bỏ NEED CONFIRMATION** điểm vào hub (v10 legacy), chốt **mission tile "Quản lý kho hàng" trên màn Home** (FEAT-INV-MOBILE-MENU v3 BA chốt 2026-07-07); wording grid update "2 cột phone, 3 cột tablet". (2) §3.0 note dưới state matrix — mở rộng từ chỉ note W03 → **wave-by-wave visible count** (W03 = 2 · W04 = 3 · W05 = 5 · W06 = 6) với reflow behavior explicit; thêm nhấn mạnh rule "tile ẩn = KHÔNG có placeholder / disabled / coming-soon badge" (BR-INV-MENU-002). State matrix table không đổi (đã có W04 = 3 tile với Tồn đầu kỳ ✅ từ v10). |
