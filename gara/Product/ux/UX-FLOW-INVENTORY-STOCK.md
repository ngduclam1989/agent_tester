---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-22"
---

# UX-FLOW-INVENTORY-STOCK: Tồn kho

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-STOCK` |
| Kind | FLOW |
| Referenced by | `FEAT-STK-LIST`, `FEAT-STK-DETAIL`, `FEAT-STK-ADJUST`, `FEAT-STK-PRICE` |

## 1. Purpose

Luồng tồn kho mô tả toàn bộ vận hành liên quan đến tồn kho tại garage — từ xem danh sách tồn kho, tra cứu chi tiết (thẻ kho) với lịch sử xuất nhập, điều chỉnh số lượng tồn khi phát hiện chênh lệch, đến cập nhật giá bán.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng tồn kho.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage.

### Sơ đồ luồng vận hành tổng quan

```
┌────────────────────────────────────────────────────────────────────┐
│                    LUỒNG VẬN HÀNH TỒN KHO                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ① DANH SÁCH TỒN KHO                                              │
│     Menu Tồn kho ──────► Danh sách tồn kho (tìm kiếm, lọc phân  │
│                          khúc, lọc trạng thái, phân trang)        │
│                                                                    │
│  ② CHI TIẾT TỒN KHO (THẺ KHO)                                    │
│     Nhấn vào sản phẩm ──► Chi tiết tồn kho                        │
│       ├── Thông tin tồn kho (số lượng tồn, giá vốn, giá bán gợi ý)│
│       └── Lịch sử xuất nhập (paginated)                           │
│                                                                    │
│  ③ CẬP NHẬT SỐ LƯỢNG TỒN KHO                                      │
│     Từ Chi tiết ────────► Modal "Cập nhật số lượng tồn kho"       │
│       ├── Tồn kho cũ (readonly), Tồn kho cập nhật (input)        │
│       ├── Lý do cập nhật (bắt buộc)                               │
│       └── Xác nhận ──► Thành công                                  │
│                                                                    │
│  ④ CẬP NHẬT GIÁ BÁN / GIÁ VỐN                                     │
│     Trên Danh sách tồn kho:                                        │
│       ├── Click cell Giá bán gợi ý ──► Modal giá bán mới ──► TC   │
│       └── Click cell Giá vốn ──► Modal giá vốn mới ──► Thành công  │
│                                                                    │
│  UPSTREAM (ảnh hưởng tồn kho):                                     │
│     Phiếu nhập kho (EP-INVENTORY-RECEIPT) ──────► tăng quantity    │
│     Phiếu xuất kho (EP-INVENTORY-DELIVERY) ─────► giảm quantity   │
│     Điều chỉnh tồn kho (FEAT-STK-ADJUST) ──────► thay đổi qty    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-INVENTORY-RECEIPT` | Phiếu nhập kho khi duyệt sẽ tăng tồn kho |
| Upstream | `EP-INVENTORY-DELIVERY` | Phiếu xuất kho khi duyệt sẽ giảm tồn kho |
| Related | `EP-INVENTORY-PERIOD` | Tồn kho theo kỳ dựa trên snapshot tồn kho; điều chỉnh tồn trigger điều chỉnh kỳ kho nếu kỳ đã đóng |
| Upstream | `EP-CATALOG` | Danh mục sản phẩm cung cấp thông tin sản phẩm hiển thị trên tồn kho |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu hệ thống, mục quản lý kho — Tồn kho | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách tồn kho |
| 2 | Nhấn vào dòng sản phẩm trên Danh sách tồn kho | Đang ở Danh sách tồn kho | Màn hình Chi tiết tồn kho |
| 3 | Nút **"Điều chỉnh tồn kho"** trên Chi tiết tồn kho | Đang ở Chi tiết tồn kho | Modal Cập nhật số lượng tồn kho |
| 4 | Click cell **"Giá bán gợi ý"** trên Danh sách tồn kho | Đang ở Danh sách tồn kho | Modal cập nhật giá bán gợi ý |
| 5 | Click cell **"Giá vốn"** trên Danh sách tồn kho | Đang ở Danh sách tồn kho | Modal cập nhật giá vốn |
| 6 | Nhấn **"Thao tác"** (Lịch sử) trên Danh sách tồn kho | Đang ở Danh sách tồn kho | Modal Lịch sử cập nhật tồn kho |

## 3. Layout / Wireframe

> Luồng tồn kho gồm 4 màn hình/component chính. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐   Nhấn vào dòng   ┌──────────────────┐
│  Danh sách       │─────────────────►│  Chi tiết         │
│  tồn kho         │                  │  tồn kho          │
│ (FEAT-STK-LIST)  │◄─────────────────│ (FEAT-STK-DETAIL) │
│                  │  Nút "Quay lại"  │                   │
│  ├── Tìm kiếm   │                  │  ├── Thông tin    │
│  ├── Lọc phân   │                  │  └── Lịch sử     │
│  │   khúc        │                  │      xuất nhập    │
│  ├── Lọc trạng  │                  │                   │
│  │   thái        │                  │  Hành động:       │
│  ├── Phân trang  │                  │  • Cập nhật SL tồn│
│  ├── Click giá   │                  │                   │
│  │   bán gợi ý   │                  │                   │
│  │    → modal    │                  │                   │
│  └── Click giá   │                  │                   │
│      vốn → modal │                  │                   │
└──────────────────┘                  └────────┬──────────┘
                                               │
                                               │ Nút "Điều chỉnh
                                               │  tồn kho"
┌──────────────────┐                           ▼
│ Modal cập nhật   │                  ┌──────────────────┐
│ giá bán gợi ý    │                  │ Modal cập nhật   │
│ (FEAT-STK-PRICE) │                  │ SL tồn kho       │
│ ├── Giá bán cũ   │                  │ (FEAT-STK-ADJUST)│
│ └── Giá bán mới  │                  │                  │
└──────────────────┘                  │ ├── Tồn kho cũ   │
┌──────────────────┐                  │ ├── Tồn kho c.nhật│
│ Modal cập nhật   │                  │ └── Lý do c.nhật │
│ giá vốn          │                  │                  │
│ (FEAT-STK-PRICE) │                  │                  │
│ ├── Giá vốn cũ   │                  │                  │
│ └── Giá vốn mới  │                  │                  │
└──────────────────┘                  └──────────────────┘
```

### 3.1 Màn hình Danh sách tồn kho

```
┌────────────────────────────────────────────────────────────────────┐
│ Danh sách tồn kho                                                  │
├────────────────────────────────────────────────────────────────────┤
│ [Tìm kiếm: "Tìm kiếm theo mã SKU, mã Genuine, tên..."          ]  │
│ [Phân khúc: ▼ Tất cả]  [Trạng thái: ▼ Tất cả]                    │
├────────────────────────────────────────────────────────────────────┤
│ Tên phụ tùng │ SKU │ Mã Genuine │ Nguồn gốc │ Phân khúc │           │
│ Tồn kho khả dụng │ Dự kiến nhập │ Dự kiến xuất │ Đơn vị tính │      │
│ Giá vốn (click) │ Giá bán gợi ý (click) │ Ngày cập nhật │ Thao tác│
├────────────────────────────────────────────────────────────────────┤
│ Lọc dầu 5W30 │OIL01│ GEN-001   │ Nhật Bản  │ Hàng xịn  │           │
│ 25              │ 10           │ 5            │ Lít         │          │
│ [120.000]       │ [180.000]              │ 20/05/2026    │ [Lịch sử]│
├────────────────────────────────────────────────────────────────────┤
│ Bugi NGK     │SPK02│ GEN-002   │ Thái Lan  │ Hàng TH   │           │
│ -2              │ 0            │ 0            │ Cái         │          │
│ [45.000]        │ [75.000]               │ 18/05/2026    │ [Lịch sử]│
├────────────────────────────────────────────────────────────────────┤
│                        < 1 2 3 ... >                               │
└────────────────────────────────────────────────────────────────────┘

Ghi chú:
- Tồn kho khả dụng âm hiển thị bình thường (vd: -2), không cảnh báo
- Click vào cell "Giá bán gợi ý" → mở modal cập nhật giá bán gợi ý (1 sản phẩm)
- Click vào cell "Giá vốn" → mở modal cập nhật giá vốn (1 sản phẩm)
- Cột "Thao tác" → nhấn để xem Lịch sử cập nhật tồn kho (modal)
```

### 3.2 Màn hình Chi tiết tồn kho

```
┌────────────────────────────────────────────────────────────────────┐
│ [<< Quay lại]                                                      │
│ Chi tiết tồn kho — Lọc dầu 5W30 (OIL01)                          │
├────────────────────────────────────────────────────────────────────┤
│ THÔNG TIN TỒN KHO                                                  │
├────────────────────────────────────────────────────────────────────┤
│ Tên phụ tùng    : Lọc dầu 5W30        SKU       : OIL01           │
│ Phân khúc       : Dầu nhớt            Đơn vị    : Lít             │
│ Kho             : Kho chính                                        │
│ Số lượng tồn    : 25                  SL đặt trước : 3            │
│ Giá vốn         : 120.000            Giá bán gợi ý: 180.000       │
├────────────────────────────────────────────────────────────────────┤
│                                        [Điều chỉnh tồn kho]       │
├────────────────────────────────────────────────────────────────────┤
│ LỊCH SỬ XUẤT NHẬP (THẺ KHO)                                       │
├────────────────────────────────────────────────────────────────────┤
│ Ngày       │ Loại GD     │ Mã chứng từ │ SL thay đổi│ SL tồn sau │
│            │             │             │            │ GD          │
│            │ Giá vốn     │ Ghi chú     │            │             │
├────────────────────────────────────────────────────────────────────┤
│ 20/05/2026 │ Nhập kho    │ NK-00012    │ +50        │ 25          │
│            │ 120.000     │             │            │             │
├────────────────────────────────────────────────────────────────────┤
│ 18/05/2026 │ Xuất kho    │ XK-00008    │ -10        │ -25         │
│            │ 120.000     │ Xuất cho PDV│            │             │
├────────────────────────────────────────────────────────────────────┤
│ 15/05/2026 │ Điều chỉnh  │ DC-00003    │ +5         │ -15         │
│            │ 120.000     │ Kiểm kê     │            │             │
├────────────────────────────────────────────────────────────────────┤
│                        < 1 2 3 ... >                               │
└────────────────────────────────────────────────────────────────────┘

Ghi chú:
- Lịch sử trống hiển thị: "Chưa có lịch sử xuất nhập"
- 3 loại giao dịch: nhập kho, xuất kho, điều chỉnh
```

### 3.3 Modal cập nhật số lượng tồn kho

```
┌──────────────────────────────────────────┐
│ Cập nhật số lượng tồn kho                │
├──────────────────────────────────────────┤
│ Tồn kho cũ      : 25            [readonly]│
│ Tồn kho cập nhật: [___________] [bắt buộc]│
│ Lý do cập nhật  : [Nhập lý do cập nhật] [bắt buộc]│
│                                          │
│               [Hủy]     [Xác nhận]       │
└──────────────────────────────────────────┘
```

### 3.4 Modal cập nhật giá bán gợi ý

```
┌──────────────────────────────────────────┐
│ Cập nhật giá bán gợi ý                   │
├──────────────────────────────────────────┤
│ Giá bán cũ      : 180.000    [readonly]  │
│ Giá bán mới     : [___________] [bắt buộc]│
│                                          │
│               [Hủy]     [Xác nhận]       │
└──────────────────────────────────────────┘
```

### 3.5 Modal cập nhật giá vốn

```
┌──────────────────────────────────────────┐
│ Cập nhật giá vốn                          │
├──────────────────────────────────────────┤
│ Giá vốn cũ      : 120.000    [readonly]  │
│ Giá vốn mới     : [___________] [bắt buộc]│
│                                          │
│               [Hủy]     [Xác nhận]       │
└──────────────────────────────────────────┘
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách tồn kho

> FEAT tham chiếu: `FEAT-STK-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu tồn kho | Hiển thị bảng danh sách với các cột: **"Tên phụ tùng"**, **"SKU"**, **"Mã Genuine"**, **"Nguồn gốc"**, **"Phân khúc"**, **"Tồn kho khả dụng"**, **"Dự kiến nhập"**, **"Dự kiến xuất"**, **"Đơn vị tính"**, **"Giá vốn"**, **"Giá bán gợi ý"**, **"Ngày cập nhật"**, **"Thao tác"** (xem Lịch sử cập nhật tồn kho). Dữ liệu được phân trang |
| 2 | Nhập từ khóa vào ô tìm kiếm (placeholder: **"Tìm kiếm theo mã SKU, mã Genuine, tên..."**) | Lọc danh sách theo từ khóa khớp với tên phụ tùng, SKU hoặc mã Genuine. Kết quả cập nhật tự động |
| 3 | Chọn giá trị từ bộ lọc **"Phân khúc"** | Danh sách cập nhật theo phân khúc đã chọn. Giá trị: Hàng xịn, Hàng thương hiệu, Hàng liên doanh, Hàng bãi, Khác. Mặc định hiển thị tất cả |
| 4 | Chọn giá trị từ bộ lọc **"Trạng thái"** | Danh sách cập nhật theo trạng thái tồn kho. Giá trị: Còn hàng, Hết hàng. Mặc định hiển thị tất cả |
| 5 | Danh sách vượt quá số lượng hiển thị trên một trang | Hiển thị phân trang cho phép chuyển giữa các trang |
| 6 | Nhấn vào dòng sản phẩm | Chuyển sang màn hình Chi tiết tồn kho (xem §4.2) |

**Trường hợp ngoại lệ:**
- Không có sản phẩm tồn kho nào (garage mới hoặc bộ lọc không khớp) -> hiển thị thông báo danh sách trống.
- Sản phẩm có số lượng tồn âm -> hiển thị giá trị âm bình thường, không cảnh báo, không chặn hiển thị.

### 4.2 Xem chi tiết tồn kho (thẻ kho)

> FEAT tham chiếu: `FEAT-STK-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào sản phẩm trên Danh sách tồn kho | Chuyển sang màn hình **"Chi tiết tồn kho"** với tiêu đề tên sản phẩm kèm SKU |
| 2 | Màn hình được tải | Hiển thị mục **"Thông tin tồn kho"**: **"Tên phụ tùng"**, **"SKU"**, **"Phân khúc"**, **"Đơn vị"**, **"Kho"**, **"Số lượng tồn"**, **"Số lượng đặt trước"**, **"Giá vốn"**, **"Giá bán gợi ý"** |
| 3 | — | Hiển thị mục **"Lịch sử xuất nhập"** với bảng paginated: **"Ngày"**, **"Loại giao dịch"**, **"Mã chứng từ"**, **"Số lượng thay đổi"**, **"Số lượng tồn sau giao dịch"**, **"Giá vốn"**, **"Ghi chú"** |
| 4 | — | Hiển thị nút **"Điều chỉnh tồn kho"** |
| 5 | Nhấn nút **"Quay lại"** | Quay về màn hình Danh sách tồn kho |

**Trường hợp ngoại lệ:**
- Sản phẩm không tồn tại (mã không hợp lệ hoặc đã bị xóa) -> hiển thị thông báo **"Không tìm thấy thông tin tồn kho"**.
- Sản phẩm chưa có lịch sử xuất nhập -> hiển thị thông báo **"Chưa có lịch sử xuất nhập"**.
- Tồn kho âm -> hiển thị giá trị âm bình thường.

### 4.3 Phân trang lịch sử xuất nhập

> FEAT tham chiếu: `FEAT-STK-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tải màn hình Chi tiết tồn kho | Hiển thị trang đầu của lịch sử xuất nhập |
| 2 | Lịch sử có nhiều hơn một trang | Hiển thị phân trang cuối bảng |
| 3 | Nhấn chuyển trang | Tải và hiển thị trang lịch sử tương ứng |

### 4.4 Cập nhật số lượng tồn kho

> FEAT tham chiếu: `FEAT-STK-ADJUST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết tồn kho, nhấn nút **"Điều chỉnh tồn kho"** | Mở modal **"Cập nhật số lượng tồn kho"** với: **"Tồn kho cũ"** (readonly, số lượng hiện tại), **"Tồn kho cập nhật"** (input, bắt buộc), **"Lý do cập nhật"** (input, bắt buộc, placeholder: **"Nhập lý do cập nhật"**) |
| 2 | Nhập đủ thông tin và nhấn **"Xác nhận"** | Hệ thống gọi API điều chỉnh tồn kho. Thành công → toast tiêu đề **"Thành công"**, mô tả **"Điều chỉnh tồn kho thành công."**. Đóng modal, số lượng tồn kho được cập nhật |
| 3 | Nhấn **"Hủy"** | Đóng modal, không thay đổi dữ liệu |

**Trường hợp ngoại lệ:**
- Bỏ trống **"Tồn kho cập nhật"** → hiển thị lỗi validation **"Vui lòng nhập số lượng tồn kho cập nhật"**.
- Bỏ trống **"Lý do cập nhật"** → hiển thị lỗi validation **"Vui lòng nhập lý do cập nhật"**.
- Nhập tồn kho cập nhật là giá trị âm → hệ thống chấp nhận (negative stock allowed).
- Cập nhật khi kỳ kho đã đóng → hệ thống tự động trigger điều chỉnh kỳ kho, không cần thao tác thêm từ user.

### 4.5 Cập nhật giá bán gợi ý

> FEAT tham chiếu: `FEAT-STK-PRICE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Danh sách tồn kho, click vào cell **"Giá bán gợi ý"** của một sản phẩm | Hệ thống mở modal **"Cập nhật giá bán gợi ý"** với: **"Giá bán cũ"** (readonly, giá trị hiện tại) và **"Giá bán mới"** (input, bắt buộc) |
| 2 | Nhập giá bán mới và nhấn **"Xác nhận"** | Hệ thống gọi mutation `UpdateStockPrice` cho sản phẩm đó. Thành công -> toast **"Thành công"**. Đóng modal, giá bán mới hiển thị trên danh sách |
| 3 | Nhấn **"Hủy"** trên modal | Đóng modal, giữ nguyên giá cũ |

**Trường hợp ngoại lệ:**
- Bỏ trống trường giá bán gợi ý mới -> hiển thị lỗi validation **"Vui lòng nhập giá bán gợi ý mới"**.

### 4.6 Cập nhật giá vốn

> FEAT tham chiếu: `FEAT-STK-PRICE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Danh sách tồn kho, click vào cell **"Giá vốn"** của một sản phẩm | Hệ thống mở modal **"Cập nhật giá vốn"** với: **"Giá vốn cũ"** (readonly, giá trị hiện tại) và **"Giá vốn mới"** (input, bắt buộc) |
| 2 | Nhập giá vốn mới và nhấn **"Xác nhận"** | Hệ thống gọi mutation `UpdateStockPrice` cho sản phẩm đó. Thành công -> toast **"Điều chỉnh giá vốn thành công."**. Đóng modal, giá vốn mới hiển thị trên danh sách |
| 3 | Nhấn **"Hủy"** trên modal | Đóng modal, giữ nguyên giá cũ |

**Trường hợp ngoại lệ:**
- Bỏ trống trường giá vốn mới -> hiển thị lỗi validation **"Vui lòng nhập giá vốn mới"**.

### 4.7 Xem lịch sử cập nhật tồn kho

> FEAT tham chiếu: `FEAT-STK-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Danh sách tồn kho, nhấn cột **"Thao tác"** của một sản phẩm | Hệ thống mở modal **"Lịch sử cập nhật tồn kho"** hiển thị: **"Tên sản phẩm"**, **"SKU"** (header), và danh sách lịch sử với các cột: **"Loại"** (Nhập kho / Xuất kho / Điều chỉnh / Hoàn trả), **"SL trước"**, **"SL sau"**, **"Ngày cập nhật"**, **"Người cập nhật"**, **"Nội dung"** |
| 2 | Nhấn **"Đóng"** | Đóng modal, quay lại Danh sách tồn kho |

## 5. States

### 5.1 Tồn kho — không có vòng đời trạng thái

Tồn kho (InventoryStock) không có trạng thái chuyển đổi truyền thống. Thay vào đó, tồn kho là bản ghi số lượng được cập nhật bởi các giao dịch:

| Loại giao dịch | Tác động lên số lượng tồn | Nguồn |
|---|---|---|
| Nhập kho | Tăng quantity | Phiếu nhập kho duyệt thành công (`EP-INVENTORY-RECEIPT`) |
| Xuất kho | Giảm quantity | Phiếu xuất kho duyệt thành công (`EP-INVENTORY-DELIVERY`) |
| Điều chỉnh | Tăng hoặc giảm quantity | Điều chỉnh tồn kho (`FEAT-STK-ADJUST`) |

**Quy tắc hiển thị:**
- Số lượng tồn âm -> hiển thị giá trị âm bình thường, không cảnh báo, không chặn.
- Số lượng đặt trước là tracking marker — không trừ khỏi số lượng tồn hiển thị (availableQuantity = quantity).

### 5.2 Ma trận hành động khả dụng

| Màn hình | Hành động | Điều kiện khả dụng |
|---|---|---|
| Danh sách tồn kho | Tìm kiếm, lọc theo phân khúc, lọc theo trạng thái, phân trang | Luôn khả dụng |
| Danh sách tồn kho | Nhấn vào dòng -> chi tiết | Luôn khả dụng |
| Danh sách tồn kho | Click cell **"Giá bán gợi ý"** → modal cập nhật giá bán gợi ý | Luôn khả dụng |
| Danh sách tồn kho | Click cell **"Giá vốn"** → modal cập nhật giá vốn | Luôn khả dụng |
| Danh sách tồn kho | Nhấn **"Thao tác"** → modal Lịch sử cập nhật tồn kho | Luôn khả dụng |
| Chi tiết tồn kho | Nút **"Điều chỉnh tồn kho"** → modal Cập nhật số lượng tồn kho | Luôn hiển thị trên Chi tiết tồn kho |
| Chi tiết tồn kho | Nút **"Quay lại"** | Luôn hiển thị |
| Modal cập nhật SL tồn | Nút **"Xác nhận"** | Khả dụng khi **"Tồn kho cập nhật"** và **"Lý do cập nhật"** đã nhập |
| Modal cập nhật SL tồn | Nút **"Hủy"** | Luôn khả dụng |
## 6. Validation Rules

### 6.1 Modal cập nhật số lượng tồn kho (`FEAT-STK-ADJUST`)

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Tồn kho cập nhật | Có | Phải nhập giá trị số; cho phép giá trị âm (negative stock) | **"Vui lòng nhập số lượng tồn kho cập nhật"** |
| Lý do cập nhật | Có | Không được để trống | **"Vui lòng nhập lý do cập nhật"** |

### 6.2 Modal cập nhật giá bán gợi ý (`FEAT-STK-PRICE`)

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Giá bán mới | Có | Phải nhập giá trị số | **"Vui lòng nhập giá bán gợi ý mới"** |

### 6.3 Modal cập nhật giá vốn (`FEAT-STK-PRICE`)

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Giá vốn mới | Có | Phải nhập giá trị số | **"Vui lòng nhập giá vốn mới"** |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-STOCK từ EP-INVENTORY-STOCK v1 và 5 FEAT: STK-LIST v1, STK-DETAIL v1, STK-ADJUST v1, STK-PRICE v1, WH-LIST v1. |
| 2026-05-21 | 2 | Business Authority | Đổi tên "Quản lý kho hàng & tồn kho" → "Tồn kho". |
| 2026-05-21 | 3 | Business Authority | Xóa toàn bộ phần kho hàng (FEAT-WH-LIST). Thay bộ lọc "Kho" bằng "Phân khúc" + "Trạng thái". Sửa cập nhật giá: xóa checkbox/batch/inline edit — thay bằng click cell → modal đơn lẻ (giá bán + giá vốn) đúng theo KG (adjust-suggested-price-modal, adjust-cost-price-modal, editable cells). Thêm luồng cập nhật giá vốn (§3.5, §4.6, §6.3) — KG có nhưng UX chưa mô tả. |
| 2026-05-22 | 4 | Business Authority | Cập nhật cột danh sách tồn kho đúng KG garage-web (13 cột): thêm Mã Genuine, Nguồn gốc, Dự kiến nhập, Dự kiến xuất, Ngày cập nhật. Đổi tên: "SL tồn"→"Tồn kho khả dụng", "Giá bán"→"Giá bán gợi ý", "Đơn vị"→"Đơn vị tính". Xóa cột "SL đặt trước". Ghi rõ Thao tác = xem Lịch sử cập nhật tồn kho. Thêm §4.7 behavior lịch sử cập nhật tồn kho. Sửa §3.3/§4.4/§6.1 điều chỉnh tồn kho: form 2 bước → modal đơn "Cập nhật số lượng tồn kho", xóa trường Sản phẩm/Kho/Chênh lệch, đổi tên trường đúng KG, thêm validation messages cụ thể. |
