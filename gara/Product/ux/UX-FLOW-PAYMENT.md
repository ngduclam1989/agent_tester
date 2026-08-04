---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 1
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-20"
---

# UX-FLOW-PAYMENT: Thanh toán, ghi nhận công nợ

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-PAYMENT` |
| Kind | FLOW |
| Referenced by | `FEAT-STL-LIST`, `FEAT-STL-CREATE`, `FEAT-STL-DETAIL` |

## 1. Purpose

Luồng thanh toán & ghi nhận công nợ mô tả toàn bộ vòng đời vận hành phiếu quyết toán tại garage — từ lúc tạo phiếu quyết toán từ phiếu dịch vụ đã hoàn thành, quản lý chứng từ, theo dõi trạng thái thanh toán, đến khi hủy phiếu (nếu cần).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng quyết toán.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage.

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│              LUỒNG VẬN HÀNH QUYẾT TOÁN & CÔNG NỢ               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TẠO PHIẾU QUYẾT TOÁN                                       │
│     Phiếu dịch vụ (Dịch vụ xe)                                 │
│       ── Có cả KH & BH ────────► Cặp phiếu: Khách hàng        │
│                                    + Bảo hiểm (Nháp)           │
│       ── Chỉ KH hoặc chỉ BH ──► Phiếu đơn lẻ (Nháp)          │
│     Phiếu dịch vụ (Bán phụ tùng)                               │
│       ── Chỉ KH ───────────────► Phiếu đơn lẻ (Nháp)          │
│                                                                 │
│  ② XEM & QUẢN LÝ (tại Chi tiết phiếu quyết toán)              │
│     Tab Bảng chi phí ─── Xem dịch vụ + phụ tùng (chỉ đọc)     │
│     Tab Chứng từ & hóa đơn ─── Xem / thêm / xóa chứng từ     │
│     Tab Lịch sử thanh toán ─── Xem lịch sử giao dịch          │
│                                                                 │
│  ③ CHỈNH SỬA (khi trạng thái Hoạt động)                       │
│     Ghi chú quyết toán ── Sửa và Lưu                           │
│     Chứng từ & hóa đơn ── Thêm mới / Xóa                      │
│                                                                 │
│  ④ HỦY PHIẾU QUYẾT TOÁN                                       │
│     Hoạt động ──┬─ Chưa có thanh toán ──► Đã hủy               │
│                 │   (hủy cả cặp nếu có)                         │
│                 │   → Mở lại phiếu dịch vụ                      │
│                 └─ Đã có thanh toán ────► Chặn hủy              │
│                                                                 │
│  ⑤ IN PHIẾU QUYẾT TOÁN                                        │
│     Hoạt động ── In phiếu ──────► Bản xem trước in             │
│     (chỉ in hạng mục theo bên thanh toán tương ứng)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-SERVICE-ORDER` | Phiếu quyết toán được tạo từ phiếu dịch vụ đã hoàn thành (dịch vụ xe) hoặc đã xuất kho (bán phụ tùng). Hủy quyết toán mở lại phiếu dịch vụ. |
| Upstream | `EP-CUSTOMER` | Thông tin khách hàng và xe hiển thị trong phiếu quyết toán — dữ liệu snapshot từ phiếu dịch vụ. |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu quyết toán trên Web GMS | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách phiếu quyết toán |
| 2 | Nút tạo quyết toán trên Phiếu dịch vụ | Phiếu dịch vụ đã hoàn thành (dịch vụ xe) hoặc đã xuất kho (bán phụ tùng) | Màn hình Tạo phiếu quyết toán |
| 3 | Nhấn vào một phiếu quyết toán trong danh sách | Đang ở Danh sách phiếu quyết toán | Màn hình Chi tiết phiếu quyết toán |
| 4 | Nút sửa trong cột Thao tác trên Danh sách | Phiếu quyết toán trạng thái **"Hoạt động"** | Màn hình Chi tiết phiếu quyết toán ở chế độ chỉnh sửa |

## 3. Layout / Wireframe

> Luồng quyết toán trên Web GMS gồm 3 màn hình chính. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐                  ┌──────────────────┐
│  Phiếu dịch vụ   │── Tạo quyết ───►│  Tạo phiếu       │
│  (EP-SERVICE-     │    toán         │  quyết toán      │
│   ORDER)          │                 │ (FEAT-STL-CREATE) │
└──────────────────┘                  └────────┬─────────┘
                                               │
                                    Xác nhận / │ Hủy
                                               ▼
┌──────────────────┐                  ┌──────────────────┐
│  Danh sách phiếu │── Xem chi ─────►│  Chi tiết phiếu  │
│  quyết toán      │   tiết          │  quyết toán      │
│ (FEAT-STL-LIST)  │◄────────────────│ (FEAT-STL-DETAIL) │
│                  │   Quay về       │                  │
│  Tìm kiếm / Lọc │                 │ 3 tab:           │
│  Phân trang      │   Sửa (cột     │ • Bảng chi phí   │
│                  │── Thao tác) ───►│ • Chứng từ &     │
│                  │                 │   hóa đơn        │
└──────────────────┘                 │ • Lịch sử        │
                                     │   thanh toán     │
                                     │                  │
                                     │ Hành động:       │
                                     │ • Chỉnh sửa     │
                                     │ • Hủy            │
                                     │ • In phiếu       │
                                     └──────────────────┘
```

**Chi tiết cấu trúc màn hình Tạo phiếu quyết toán:**

```
┌─────────────────────────────────────────────────────┐
│  TẠO PHIẾU QUYẾT TOÁN                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Loại "Dịch vụ xe"          Loại "Bán phụ tùng"    │
│  ┌─────────────────┐        ┌─────────────────┐    │
│  │ Khách hàng      │        │ Phụ tùng        │    │
│  │ chi trả         │        │ sử dụng         │    │
│  │ ─ Dịch vụ      │        │ Ghi chú (KH)    │    │
│  │ ─ Phụ tùng     │        └─────────────────┘    │
│  │ ─ Ghi chú      │                                │
│  ├─────────────────┤        Tổng chi phí            │
│  │ Bảo hiểm       │        ┌─────────────────┐    │
│  │ chi trả (*)    │        │ Tổng chi phí    │    │
│  │ ─ Dịch vụ      │        │ PDV (chỉ đọc)   │    │
│  │ ─ Phụ tùng     │        └─────────────────┘    │
│  │ ─ TT bảo hiểm  │                                │
│  │ ─ Ghi chú      │                                │
│  └─────────────────┘                                │
│                                                     │
│  Tổng tiền khách trả / Tổng tiền bảo hiểm trả      │
│                                                     │
│  [ Hủy ]                      [ Xác nhận ]          │
└─────────────────────────────────────────────────────┘

(*) Mục Bảo hiểm chi trả chỉ hiển thị khi phiếu dịch vụ
    có hạng mục do bảo hiểm chi trả.
```

**Chi tiết cấu trúc màn hình Chi tiết phiếu quyết toán:**

```
┌─────────────────────────────────────────────────────┐
│  CHI TIẾT PHIẾU QUYẾT TOÁN         [Chỉnh sửa]    │
│                                     [Hủy QT]       │
│                                     [In phiếu]     │
├─────────────────────────────────────────────────────┤
│  Thông tin quyết toán (chỉ đọc)                    │
│  ─ Phiếu dịch vụ liên kết, Tổng Tiền, Còn lại     │
│  ─ Người tạo, Ngày tạo, Cập nhật lần cuối          │
│                                                     │
│  Ghi chú quyết toán                                │
│                                                     │
│  Thông tin khách hàng & xe (chỉ đọc)               │
│  ─ Tên KH, SĐT, Loại KH, Biển số, Hãng, Dòng, Km │
│                                                     │
│  Thông tin bảo hiểm (*) (chỉ đọc)                  │
│  ─ Đơn vị TT, Công ty BH, Số HĐ, Giám định, SĐT  │
│  ─ Mã số thuế BH, Ngày hết hạn, Hồ sơ bảo lãnh   │
│                                                     │
├────────────┬──────────────────┬─────────────────────┤
│ Bảng chi   │ Chứng từ &       │ Lịch sử             │
│ phí  [*]   │ hóa đơn          │ thanh toán           │
├────────────┴──────────────────┴─────────────────────┤
│  (Nội dung tab được chọn)                           │
│                                                     │
│  Tab "Bảng chi phí":                                │
│  ─ Bảng Dịch vụ thực hiện                          │
│  ─ Bảng Phụ tùng sử dụng                           │
│  ─ Tổng chi phí                                     │
│                                                     │
│  Tab "Chứng từ & hóa đơn":                         │
│  ─ Danh sách file đính kèm                         │
│  ─ Upload (khi chế độ chỉnh sửa)                   │
│                                                     │
│  Tab "Lịch sử thanh toán":                          │
│  ─ Bảng giao dịch thanh toán                       │
└─────────────────────────────────────────────────────┘

(*) Mục Thông tin bảo hiểm chỉ hiển thị khi bên thanh
    toán là "Bảo hiểm".
[*] Tab "Bảng chi phí" được chọn mặc định.
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách phiếu quyết toán

> FEAT tham chiếu: `FEAT-STL-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu quyết toán | Hiển thị bảng danh sách với 10 cột: Mã quyết toán, Phiếu dịch vụ, Tên khách hàng, Số điện thoại, Bên thanh toán, Tổng tiền, Trạng thái, Trạng thái thanh toán, Ngày tạo, Thao tác |
| 2 | Nhập từ khóa vào ô tìm kiếm | Lọc theo mã quyết toán, mã phiếu dịch vụ, tên khách hàng hoặc số điện thoại. Placeholder: **"Tìm mã quyết toán, mã phiếu dịch vụ, tên KH, SĐT khách hàng"** |
| 3 | Chọn bộ lọc (loại phiếu, trạng thái, trạng thái thanh toán, bên thanh toán, công ty bảo hiểm) | Danh sách cập nhật theo tiêu chí đã chọn. Nhiều bộ lọc có thể kết hợp đồng thời |
| 4 | Nhấn vào một phiếu quyết toán | Chuyển sang Chi tiết phiếu quyết toán (xem 4.4) |
| 5 | Nhấn icon sửa trong cột Thao tác | Chuyển sang Chi tiết phiếu quyết toán ở chế độ chỉnh sửa (xem 4.6) |

**Trường hợp ngoại lệ:**
- Chưa có phiếu quyết toán nào → hiển thị thông báo: **"Hiện chưa có phiếu quyết toán nào trong hệ thống."**
- Tìm kiếm / lọc không có kết quả → hiển thị thông báo: **"Không tìm thấy phiếu quyết toán phù hợp."**

### 4.2 Tạo phiếu quyết toán — loại dịch vụ xe

> FEAT tham chiếu: `FEAT-STL-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage nhấn tạo quyết toán từ phiếu dịch vụ loại dịch vụ xe | Mở màn hình **"Tạo phiếu quyết toán"**. Hệ thống tải snapshot phiếu dịch vụ |
| 2 | Snapshot tải thành công — có hạng mục khách hàng chi trả | Hiển thị mục **"Khách hàng chi trả"**: bảng Dịch vụ thực hiện, bảng Phụ tùng sử dụng, trường Ghi chú (placeholder: **"Nhập ghi chú..."**) |
| 3 | Snapshot tải thành công — có hạng mục bảo hiểm chi trả | Hiển thị thêm mục **"Bảo hiểm chi trả"**: bảng Dịch vụ thực hiện, bảng Phụ tùng sử dụng, thông tin bảo hiểm (Công ty bảo hiểm, Số hợp đồng bảo hiểm, Người giám định, Số điện thoại), trường Ghi chú |
| 4 | Chủ garage nhập Tổng tiền khách trả (bắt buộc) | Hệ thống ghi nhận số tiền do chủ garage nhập — không tự tính |
| 5 | Chủ garage nhập Tổng tiền bảo hiểm trả (bắt buộc khi có bảo hiểm) | Hệ thống ghi nhận số tiền do chủ garage nhập — không tự tính |
| 6 | Nhấn nút **"Xác nhận"** | Tạo phiếu quyết toán thành công → toast: tiêu đề **"Thành công"**, mô tả **"Tạo phiếu quyết toán thành công"**. Mã tự sinh. Trạng thái khởi tạo **"Nháp"** (hiển thị **"Hoạt động"** trên danh sách). Phiếu dịch vụ liên kết chuyển sang trạng thái đã quyết toán |
| 7 | Có cả KH & BH | Hệ thống tự động tạo cặp hai phiếu: **"Khách hàng"** và **"Bảo hiểm"**, liên kết qua mã phiếu quyết toán liên quan |
| 8 | Chỉ KH hoặc chỉ BH | Hệ thống tạo một phiếu quyết toán duy nhất với bên thanh toán tương ứng |

**Trường hợp ngoại lệ:**
- Không tìm thấy phiếu dịch vụ → thông báo: **"Không tìm thấy thông tin phiếu dịch vụ"**.
- Phiếu dịch vụ đã có phiếu quyết toán đang hoạt động cùng loại bên thanh toán → hệ thống từ chối tạo.
- Số tiền không hợp lệ → thông báo lỗi: **"Số tiền quyết toán không hợp lệ"**.
- Không chọn phiếu dịch vụ → thông báo lỗi: **"Phiếu dịch vụ là bắt buộc"**.
- Tạo thất bại → thông báo lỗi, form giữ nguyên dữ liệu.
- Nhấn nút **"Hủy"** → đóng form, quay về màn hình trước đó. Không tạo phiếu quyết toán.

### 4.3 Tạo phiếu quyết toán — loại bán phụ tùng

> FEAT tham chiếu: `FEAT-STL-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage nhấn tạo quyết toán từ phiếu dịch vụ loại bán phụ tùng | Mở màn hình **"Tạo phiếu quyết toán"**. Hệ thống tải snapshot phiếu dịch vụ |
| 2 | Snapshot tải thành công | Hiển thị mục **"Phụ tùng sử dụng"** và trường **"Ghi chú (Khách hàng)"** (placeholder: **"Nhập ghi chú..."**). Hiển thị tổng chi phí (chỉ đọc) |
| 3 | Nhấn nút **"Xác nhận"** | Tạo phiếu quyết toán thành công → toast: tiêu đề **"Thành công"**, mô tả **"Tạo phiếu quyết toán thành công"**. Mã tự sinh. Trạng thái **"Nháp"**. Chỉ tạo phiếu **"Khách hàng"** (loại bán phụ tùng không có bảo hiểm) |

**Trường hợp ngoại lệ:** Tương tự 4.2.

### 4.4 Xem chi tiết phiếu quyết toán

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào phiếu quyết toán trên Danh sách | Mở Chi tiết phiếu quyết toán với ba tab: **"Bảng chi phí"**, **"Chứng từ & hóa đơn"**, **"Lịch sử thanh toán"**. Tab **"Bảng chi phí"** được chọn mặc định |
| 2 | Màn hình được tải | Hiển thị mục Thông tin quyết toán (chỉ đọc): Phiếu dịch vụ liên kết, Tổng Tiền, Còn lại, Người tạo, Ngày tạo, Cập nhật lần cuối |
| 3 | — | Hiển thị trường Ghi chú quyết toán (chỉ đọc). Placeholder khi chưa có ghi chú: **"Nhập ghi chú quyết toán"** |
| 4 | — | Hiển thị mục Thông tin khách hàng & xe (chỉ đọc): Tên khách hàng, Số điện thoại, Loại khách hàng, Biển số xe, Hãng xe, Dòng xe, Số km đã chạy |
| 5 | Phiếu có bên thanh toán là **"Bảo hiểm"** | Hiển thị thêm mục Thông tin bảo hiểm (chỉ đọc): Đơn vị thanh toán, Công ty bảo hiểm, Số hợp đồng bảo hiểm, Người giám định, SĐT Liên hệ, Mã số thuế bảo hiểm, Ngày hết hạn, Hồ sơ bảo lãnh |
| 6 | Phiếu có bên thanh toán là **"Khách hàng"** | Mục Thông tin bảo hiểm không hiển thị |
| 7 | — | Hiển thị nút hành động phù hợp trạng thái (xem 5.2 ma trận hành động) |

**Trường hợp ngoại lệ:**
- Tải dữ liệu thất bại → thông báo lỗi.
- Trường thông tin tùy chọn không có dữ liệu → hiển thị trống hoặc placeholder tương ứng.

### 4.5 Xem tab Bảng chi phí

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn tab **"Bảng chi phí"** (hoặc mặc định khi mở chi tiết) | Hiển thị bảng **"Dịch vụ thực hiện"** với các cột: Tên dịch vụ, Bên thanh toán (**"Khách hàng"** hoặc **"Bảo hiểm"**), Người thực hiện, Đơn giá, Số lượng, Chiết khấu, Thuế, Thành tiền, Tổng |
| 2 | — | Hiển thị bảng **"Phụ tùng sử dụng"** với các cột: Tên phụ tùng, Phân khúc, Đơn vị tính, Đơn giá, Số lượng, Chiết khấu, Thuế, Thành tiền, Thành tiền phụ tùng |
| 3 | — | Hiển thị mục **"Tổng chi phí"** (chỉ đọc): Tổng thành tiền dịch vụ, Tổng thành tiền phụ tùng, Tổng thành tiền, Dịch vụ + Phụ tùng |

### 4.6 Xem tab Chứng từ & hóa đơn

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn tab **"Chứng từ & hóa đơn"** | Hiển thị danh sách chứng từ và hóa đơn đã đính kèm |
| 2 | Chưa có chứng từ nào | Hiển thị thông báo: **"Chưa có chứng từ & hóa đơn"** |
| 3 | Ở chế độ chỉnh sửa | Cho phép **"Upload file chứng từ / hóa đơn"** và xóa chứng từ đã có |

### 4.7 Xem tab Lịch sử thanh toán

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn tab **"Lịch sử thanh toán"** | Hiển thị bảng lịch sử thanh toán với các cột: Mã thanh toán, Ngày thanh toán, Số tiền, Phương thức, Ghi chú, Đã thanh toán, Còn lại |
| 2 | Chưa có lịch sử thanh toán nào | Hiển thị thông báo: **"Chưa có lịch sử thanh toán"** |

### 4.8 Chỉnh sửa phiếu quyết toán

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Hoạt động"** | Hiển thị nút **"Chỉnh sửa"** |
| 2 | Nhấn nút **"Chỉnh sửa"** | Chuyển sang chế độ chỉnh sửa. Cho phép sửa trường Ghi chú quyết toán và quản lý chứng từ trong tab **"Chứng từ & hóa đơn"** (thêm mới, xóa). Các thông tin khác (dịch vụ, phụ tùng, tổng tiền, thông tin khách hàng) không được phép sửa |
| 3 | Nhấn nút **"Lưu"** | Lưu thay đổi thành công → toast: tiêu đề **"Hóa đơn thanh toán"**, mô tả **"Cập nhật phiếu quyết toán thành công"**. Chế độ chỉnh sửa đóng, quay về chế độ xem |
| 4 | Nhấn nút **"Hủy"** | Bỏ qua thay đổi chưa lưu, quay về chế độ xem |

**Trường hợp ngoại lệ:**
- Lưu thất bại → thông báo lỗi. Chế độ chỉnh sửa giữ nguyên dữ liệu đã nhập.

### 4.9 Hủy phiếu quyết toán

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Hoạt động"** | Hiển thị hành động hủy phiếu quyết toán |
| 2 | Nhấn hành động hủy | Mở modal xác nhận với tiêu đề **"Xác nhận hủy quyết toán"** và nội dung: **"Bạn có chắc chắn muốn hủy phiếu quyết toán này không? Hệ thống sẽ mở lại Phiếu dịch vụ gốc để bạn có thể chỉnh sửa."**. Modal có hai nút: **"Đóng"** và **"Xác nhận"** |
| 3 | Nhấn nút **"Xác nhận"** — chưa có thanh toán | Hủy toàn bộ phiếu quyết toán cùng mã phiếu dịch vụ (nếu có cặp khách hàng/bảo hiểm thì hủy cả cặp). Trạng thái → **"Đã hủy"**. Phiếu dịch vụ liên kết được mở lại về trạng thái trước quyết toán |
| 4 | Nhấn nút **"Xác nhận"** — đã có thanh toán | Hệ thống từ chối hủy, hiển thị thông báo: **"Không thể hủy vì đã có phát sinh thanh toán."** |
| 5 | Nhấn nút **"Đóng"** | Đóng modal, quay về Chi tiết. Phiếu không bị thay đổi |

### 4.10 In phiếu quyết toán

> FEAT tham chiếu: `FEAT-STL-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Hoạt động"** | Hiển thị nút **"In phiếu"** |
| 2 | Nhấn nút **"In phiếu"** | Mở bản xem trước in phiếu quyết toán. Nội dung in chỉ bao gồm các hạng mục theo bên thanh toán tương ứng: phiếu **"Khách hàng"** chỉ in hạng mục khách hàng chi trả; phiếu **"Bảo hiểm"** chỉ in hạng mục bảo hiểm chi trả. Tổng tiền được hiển thị bằng chữ tiếng Việt |

## 5. States

### 5.1 Bảng trạng thái phiếu quyết toán

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Nháp | **"Hoạt động"** | Phiếu quyết toán đã tạo, đang hoạt động | Cho phép chỉnh sửa (ghi chú + chứng từ), hủy, in |
| Đã hủy | **"Đã hủy"** | Phiếu quyết toán đã bị hủy | Trạng thái kết thúc — chỉ xem |

**Ghi chú:** Phiếu quyết toán không có trạng thái thanh toán riêng. Trạng thái thanh toán thuộc phiếu dịch vụ gốc.

### 5.2 Trạng thái thanh toán (hiển thị từ phiếu dịch vụ)

| Trạng thái thanh toán | Tên hiển thị | Mô tả |
|---|---|---|
| Chờ thanh toán | **"Chờ thanh toán"** | Phiếu dịch vụ chưa ghi nhận giao dịch nào |
| Chưa thanh toán | **"Chưa thanh toán"** | Phiếu dịch vụ chưa có thanh toán |
| Thanh toán một phần | **"Thanh toán một phần"** | Đã thanh toán nhưng chưa đủ tổng tiền |
| Đã thanh toán | **"Đã thanh toán"** | Đã thanh toán đủ tổng tiền |

### 5.3 Ma trận hành động theo trạng thái

| Trạng thái | Chỉnh sửa | Hủy | In phiếu |
|---|---|---|---|
| Hoạt động | ✓ | ✓ * | ✓ |
| Đã hủy | — | — | ✓ ** |

\* Hủy bị chặn khi phiếu dịch vụ liên kết đã có giao dịch thanh toán.

\** Nút **"In phiếu"** hiển thị nếu có (theo FEAT-STL-DETAIL AC-20).

### 5.4 Bên thanh toán và loại phiếu

| Loại phiếu dịch vụ | Bên thanh toán | Số phiếu quyết toán |
|---|---|---|
| Dịch vụ xe — chỉ khách hàng | **"Khách hàng"** | 1 phiếu |
| Dịch vụ xe — chỉ bảo hiểm | **"Bảo hiểm"** | 1 phiếu |
| Dịch vụ xe — cả khách hàng và bảo hiểm | **"Khách hàng"** + **"Bảo hiểm"** | 2 phiếu (cặp liên kết) |
| Bán phụ tùng | **"Khách hàng"** | 1 phiếu |

## 6. Validation Rules

> Áp dụng cho màn hình Tạo phiếu quyết toán (`FEAT-STL-CREATE`).

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Phiếu dịch vụ | Có | Phải chọn phiếu dịch vụ đã hoàn thành hoặc đã xuất kho | **"Phiếu dịch vụ là bắt buộc"** |
| Tổng tiền khách trả | Có | Số tiền hợp lệ | **"Số tiền quyết toán không hợp lệ"** |
| Tổng tiền bảo hiểm trả | Có (khi có bảo hiểm) | Số tiền hợp lệ | **"Số tiền quyết toán không hợp lệ"** |
| Ghi chú | Không | — | — |

**Điều kiện nút "Xác nhận" (Tạo phiếu quyết toán):**
- Khả dụng (enabled): phiếu dịch vụ đã được tải thành công và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): phiếu dịch vụ chưa được tải hoặc đang gửi yêu cầu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-PAYMENT từ EP-SETTLEMENT v1 và 3 FEAT: LIST v1, CREATE v1, DETAIL v1. Luồng tạo quyết toán (dịch vụ xe + bán phụ tùng), chi tiết 3 tab, chỉnh sửa ghi chú/chứng từ, hủy cascading, in phiếu. |
