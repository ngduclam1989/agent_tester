---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 1
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-20"
---

# UX-FLOW-RETAIL: Bán lẻ phụ tùng

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-RETAIL` |
| Kind | FLOW |
| Referenced by | `FEAT-SO-LIST`, `FEAT-SO-SALE-CREATE`, `FEAT-SO-SALE-DETAIL`, `FEAT-SO-SALE-EDIT` |

## 1. Purpose

Luồng bán lẻ phụ tùng mô tả toàn bộ vòng đời vận hành phiếu bán lẻ phụ tùng tại garage — từ lúc tạo phiếu (báo giá) đến khi kết thúc (quyết toán hoặc hủy).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng bán lẻ phụ tùng.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage.

**Đặc thù phiếu bán lẻ:** Phiếu bán lẻ không gắn với lịch hẹn, không tự sinh booking walk-in khi tạo (khác với phiếu dịch vụ xe). Form chỉ có 3 mục: Thông tin dịch vụ, Thông tin khách hàng, Phụ tùng sử dụng (không có mục Thông tin xe, Hình ảnh xe, Dịch vụ/công).

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│               LUỒNG VẬN HÀNH BÁN LẺ PHỤ TÙNG                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TẠO PHIẾU BÁN LẺ                                           │
│     Danh sách PDV ── Tạo phiếu bán lẻ ─────► Báo giá          │
│     (không tự sinh lịch hẹn walk-in)                            │
│                                                                 │
│  ② XÁC NHẬN ĐƠN HÀNG (tại Chi tiết phiếu)                     │
│     Báo giá ─────┬─ Xác nhận ──────────────► Đã xác nhận      │
│                   ├─ Hủy (+ lý do) ────────► Đã huỷ           │
│                   └─ Gửi báo giá * ────────► (giữ Báo giá)    │
│                                                                 │
│  ③ GIAO HÀNG / XUẤT KHO                                        │
│     Đã xác nhận ─┬─ Hoàn thành đơn hàng ──► Đã xuất kho      │
│                   └─ Hủy (+ lý do) ────────► Đã huỷ           │
│                                                                 │
│  ④ QUYẾT TOÁN                                                  │
│     Đã xuất kho ── Tạo quyết toán ─────────► Đã tạo quyết toán│
│                                        (→ EP-SETTLEMENT)       │
│                                                                 │
│  ⑤ CHỈNH SỬA (khi trạng thái cho phép)                         │
│     Báo giá / Đã xác nhận                                      │
│     ── Form chỉnh sửa ─────────────────────► Cập nhật phiếu   │
│                                                                 │
│  * Gửi báo giá chỉ hiển thị khi phiếu liên kết ứng dụng       │
│    tài xế.                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-FOUND` | Cấu hình garage, nhân viên (danh sách người tạo phiếu), phân quyền người dùng |
| Upstream | `EP-CUSTOMER` | Dữ liệu khách hàng — gợi ý khi tạo / chỉnh sửa phiếu bán lẻ |
| Upstream | `EP-CATALOG` | Danh mục phụ tùng để thêm vào phiếu |
| Downstream | `EP-SETTLEMENT` | Tạo phiếu quyết toán từ phiếu bán lẻ ở trạng thái **"Đã xuất kho"** |
| Downstream | `EP-INVENTORY-DELIVERY` | Xuất kho phụ tùng khi phiếu bán lẻ có phụ tùng nguồn từ kho |
| Downstream | `EP-PROCUREMENT` | Đặt hàng phụ tùng từ mục phụ tùng sử dụng trên phiếu |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu phiếu dịch vụ trên Web GMS | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách phiếu dịch vụ |
| 2 | Nút tạo phiếu bán lẻ phụ tùng trên Danh sách | Đang ở Danh sách phiếu dịch vụ | Form tạo phiếu bán lẻ phụ tùng |
| 3 | Nhấn vào dòng phiếu bán lẻ trong danh sách | Đang ở Danh sách phiếu dịch vụ, phiếu loại **"Bán phụ tùng"** | Màn hình Chi tiết phiếu bán lẻ |
| 4 | Nút **"Chỉnh sửa"** trên Chi tiết | Phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"** | Form chỉnh sửa phiếu bán lẻ |

## 3. Layout / Wireframe

> Luồng bán lẻ phụ tùng trên Web GMS chia sẻ màn hình Danh sách phiếu dịch vụ với phiếu dịch vụ xe. Từ danh sách, có 3 màn hình riêng cho bán lẻ. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐     Tạo bán lẻ   ┌──────────────────┐
│  Danh sách       │─────────────────►│  Form tạo        │
│  phiếu dịch vụ   │                  │  phiếu bán lẻ    │
│ (FEAT-SO-LIST)   │◄─────────────────│ (FEAT-SO-SALE-   │
│                  │   Submit / Hủy   │  CREATE)          │
│ * Dùng chung cho │                  └──────────────────┘
│   cả Dịch vụ xe  │
│   và Bán phụ tùng│
└──┬───────────────┘
   │
   │ Xem chi tiết
   │ (phiếu loại
   │  "Bán phụ tùng")
   ▼
┌──────────────────┐   Chỉnh sửa     ┌──────────────────┐
│  Chi tiết        │────────────────►│  Form chỉnh sửa  │
│  phiếu bán lẻ    │◄────────────────│  phiếu bán lẻ    │
│ (FEAT-SO-SALE-   │   Lưu / Hủy    │ (FEAT-SO-SALE-   │
│  DETAIL)         │                 │  EDIT)            │
│                  │                 └──────────────────┘
│ Hành động:       │
│ • Xác nhận       │
│ • Hoàn thành     │
│   đơn hàng       │
│ • Hủy            │
│ • Gửi báo giá *  │
│ • In phiếu       │
└──────────────────┘

(*) Gửi báo giá chỉ hiển thị khi phiếu liên kết với ứng dụng tài xế.
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu phiếu dịch vụ | Hiển thị bảng danh sách với 11 cột: Mã phiếu, Tên khách hàng, SĐT khách hàng, Biển số xe, Hãng xe, Dòng xe, Loại phiếu, Trạng thái phiếu, Trạng thái thanh toán, Ngày tạo, Thao tác |
| 2 | Nhập từ khóa vào ô tìm kiếm | Lọc theo mã phiếu, tên khách hàng, số điện thoại hoặc biển số xe |
| 3 | Chọn bộ lọc (trạng thái phiếu, loại phiếu, trạng thái thanh toán) | Danh sách cập nhật theo tiêu chí đã chọn. Các bộ lọc kết hợp đồng thời (giao) |
| 4 | Lọc loại phiếu = **"Bán phụ tùng"** | Danh sách chỉ hiển thị phiếu bán lẻ phụ tùng |
| 5 | Nhấn vào dòng phiếu loại **"Bán phụ tùng"** | Chuyển sang Chi tiết phiếu bán lẻ (xem §4.3) |
| 6 | Nhấn nút tạo phiếu bán lẻ phụ tùng | Chuyển sang Form tạo phiếu bán lẻ (xem §4.2) |

**Trường hợp ngoại lệ:**
- Không có phiếu dịch vụ nào → hiển thị thông báo **"Hiện chưa có phiếu dịch vụ nào trong hệ thống."**
- Tìm kiếm / lọc không có kết quả → hiển thị thông báo **"Không tìm thấy phiếu dịch vụ phù hợp."**

### 4.2 Tạo phiếu bán lẻ phụ tùng

> FEAT tham chiếu: `FEAT-SO-SALE-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn nút tạo phiếu bán lẻ trên Danh sách | Mở form **"Tạo phiếu dịch vụ"** với loại phiếu **"Bán phụ tùng"**. Form gồm 3 mục: Thông tin dịch vụ, Thông tin khách hàng, Phụ tùng sử dụng |
| 2 | Chọn người tạo phiếu (bắt buộc) | Ô chọn có tìm kiếm, placeholder: **"Chọn nhân viên tạo phiếu"** |
| 3 | Nhập ghi chú (không bắt buộc) | Textarea, placeholder: **"Nhập yêu cầu khách hàng hoặc ghi chú nội bộ"** |
| 4 | Tải lên tài liệu khác (không bắt buộc) | Khu vực tải lên tệp |
| 5 | Nhập SĐT khách hàng (bắt buộc) | Ô nhập có tìm kiếm, placeholder: **"Chọn/Nhập SĐT khách hàng"**. Nếu khớp khách hàng trong hệ thống → tự động điền tên |
| 6 | Nhập tên khách hàng (bắt buộc) | Ô nhập có tìm kiếm, placeholder: **"Chọn/Nhập tên khách hàng"** |
| 7 | Chọn loại khách hàng | Mặc định **"Cá nhân"**. Nếu chọn **"Tổ chức"** → hiển thị thêm Tên tổ chức, SĐT tổ chức, Mã số thuế (placeholder: **"Nhập mã số thuế"**) |
| 8 | Thêm dòng phụ tùng (bắt buộc ít nhất 1 dòng) | Bảng với các cột: Tên phụ tùng, Bên thanh toán, Phân khúc, Người thực hiện, Đơn vị tính, Đơn giá, Số lượng, Chiết khấu, Thuế, Thành tiền, Thao tác |
| 9 | Nhấn nút **"Tạo mới"** (khi đủ trường bắt buộc + ít nhất 1 dòng phụ tùng) | Tạo phiếu → trạng thái **"Báo giá"**, mã tự sinh. Toast: tiêu đề **"Thành công"**, mô tả **"Tạo phiếu dịch vụ thành công."** |

**Trường hợp ngoại lệ:**
- Bỏ trống người tạo phiếu → thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**
- Bỏ trống SĐT khách hàng → thông báo lỗi: **"Vui lòng nhập số điện thoại."**
- SĐT không đúng định dạng → thông báo lỗi: **"Số điện thoại không đúng định dạng"**
- Bỏ trống tên khách hàng → thông báo lỗi: **"Vui lòng nhập tên khách hàng."**
- Thiếu trường bắt buộc hoặc chưa có dòng phụ tùng → nút **"Tạo mới"** bị mờ (disabled).
- Tạo thất bại → toast tiêu đề **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → đóng form, quay về Danh sách phiếu dịch vụ. Dữ liệu không được lưu.

### 4.3 Xem chi tiết phiếu bán lẻ

> FEAT tham chiếu: `FEAT-SO-SALE-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào dòng phiếu bán lẻ trên Danh sách | Mở **"Chi tiết phiếu dịch vụ"** với tiêu đề gồm mã phiếu |
| 2 | Màn hình được tải | Hiển thị mục **"Thông tin dịch vụ và thanh toán"**: Loại phiếu (hiển thị **"Phiếu bán hàng"**), Thời gian dự kiến giao xe, Tổng tiền, Trạng thái thanh toán (badge) |
| 3 | — | Hiển thị trạng thái phiếu dưới dạng badge: **"Báo giá"**, **"Đã xác nhận"**, **"Đã xuất kho"**, **"Đã tạo quyết toán"**, **"Đã huỷ"**, **"Đã từ chối"** |
| 4 | — | Hiển thị mục **"Thông tin khách hàng"**: Tên khách hàng, Số điện thoại, Loại khách hàng |
| 5 | — | Hiển thị mục **"Phụ tùng sử dụng"**: bảng với các cột Tên phụ tùng, Bên thanh toán, Phân khúc, Đơn vị tính, Đơn giá, Số lượng, Chiết khấu, Thuế, Thành tiền, Tổng |
| 6 | — | Hiển thị mục **"Tổng chi phí"**: Tổng thành tiền |
| 7 | — | Hiển thị mục **"Thông tin khác"**: Người tạo, Thời gian tạo phiếu, Tổ chức (nếu loại khách hàng là **"Tổ chức"**), Ghi chú, Tài liệu khác |
| 8 | — | Hiển thị mục **"Thông tin liên kết"**: Phiếu lịch hẹn liên kết, Yêu cầu báo giá liên kết, Đơn hàng ngoài sàn liên kết, Phiếu quyết toán liên kết, Phiếu xuất kho liên kết (nếu có) |
| 9 | — | Hiển thị mục **"Lịch sử thanh toán"**: danh sách giao dịch gồm Ngày thanh toán, Phương thức, Số tiền, Đã thanh toán, Còn lại |
| 10 | — | Hiển thị nút hành động phù hợp trạng thái (xem §5.2 ma trận hành động) |

**Trường hợp ngoại lệ:**
- Chưa có giao dịch thanh toán → hiển thị thông báo **"Chưa có giao dịch thanh toán."**
- Phiếu ở trạng thái **"Đã huỷ"** → hiển thị thông báo **"Phiếu dịch vụ đã hủy"**, tất cả nút hành động ẩn.

### 4.4 Xác nhận đơn hàng

> FEAT tham chiếu: `FEAT-SO-SALE-DETAIL` (AC-10, AC-11, AC-12)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Báo giá"** | Hiển thị nút **"Xác nhận"** |
| 2 | Nhấn nút **"Xác nhận"** | Mở hộp thoại **"Xác nhận đơn hàng"** với nội dung **"Xác nhận đơn hàng?"**. Gồm nút **"Hủy"** và **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** trong hộp thoại | Trạng thái → **"Đã xác nhận"** |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Xác nhận đơn hàng thành công."**. Các nút hành động cập nhật theo trạng thái mới |

**Trường hợp ngoại lệ:**
- Xác nhận thất bại → toast tiêu đề **"Lỗi"**. Trạng thái phiếu không thay đổi.

### 4.5 Hoàn thành đơn hàng (xuất kho / giao hàng)

> FEAT tham chiếu: `FEAT-SO-SALE-DETAIL` (AC-13, AC-14, AC-15)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Đã xác nhận"** | Hiển thị nút **"Hoàn thành đơn hàng"** |
| 2 | Nhấn nút **"Hoàn thành đơn hàng"** | Mở hộp thoại **"Xác nhận hoàn thành"** với nội dung xác nhận. Gồm nút **"Hủy"** và **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** trong hộp thoại | Trạng thái → **"Đã xuất kho"** |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Hoàn thành dịch vụ thành công."**. Các nút hành động cập nhật theo trạng thái mới |

**Trường hợp ngoại lệ:**
- Hoàn thành thất bại → toast tiêu đề **"Lỗi"**. Trạng thái phiếu không thay đổi.

### 4.6 Hủy phiếu bán lẻ

> FEAT tham chiếu: `FEAT-SO-SALE-DETAIL` (AC-19, AC-20)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"** | Hiển thị nút **"Hủy"** |
| 2 | Nhấn nút **"Hủy"** | Mở hộp thoại **"Xác nhận hủy phiếu"** gồm trường **"Ghi chú"** (placeholder: **"Nhập chi tiết lý do hủy"**, bắt buộc). Gồm nút **"Đóng"** và **"Xác nhận"** |
| 3 | Nhập lý do hủy và nhấn **"Xác nhận"** | Trạng thái → **"Đã huỷ"** |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Đã hủy phiếu thành công."**. Các nút hành động cập nhật theo trạng thái mới |

**Trường hợp ngoại lệ:**
- Bỏ trống lý do hủy → thông báo lỗi: **"Vui lòng nhập lý do hủy phiếu"**
- Hủy thất bại → toast tiêu đề **"Lỗi"**. Trạng thái phiếu không thay đổi.

### 4.7 Gửi báo giá

> FEAT tham chiếu: `FEAT-SO-SALE-DETAIL` (AC-21, AC-22)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Báo giá"**, phiếu liên kết với ứng dụng tài xế | Hiển thị nút **"Gửi báo giá"** |
| 2 | Nhấn nút **"Gửi báo giá"** | Mở hộp thoại xác nhận gồm thông tin: **"Tài xế"**, **"Tổng tiền"**. Gồm nút **"Hủy"** và **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** trong hộp thoại | Toast: tiêu đề **"Thành công"**, mô tả **"Gửi báo giá thành công."**. Trạng thái **"Đã gửi báo giá"** được cập nhật trên mục thông tin dịch vụ |

**Trường hợp ngoại lệ:**
- Gửi báo giá thất bại → toast tiêu đề **"Lỗi"**. Hộp thoại đóng lại.

### 4.8 In phiếu

> FEAT tham chiếu: `FEAT-SO-SALE-DETAIL` (AC-23)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết phiếu bán lẻ | Hiển thị các tùy chọn in: **"In báo giá"**, **"In lệnh sửa chữa"**, **"In phiếu dịch vụ"**, **"Tạo hình ảnh phiếu"** |
| 2 | Nhấn một tùy chọn in | Hệ thống tạo bản in hoặc hình ảnh tương ứng |

### 4.9 Chỉnh sửa phiếu bán lẻ

> FEAT tham chiếu: `FEAT-SO-SALE-EDIT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"** | Hiển thị nút **"Chỉnh sửa"** |
| 2 | Nhấn nút **"Chỉnh sửa"** | Chuyển sang form **"Chỉnh sửa phiếu dịch vụ"** với dữ liệu điền sẵn. Mã phiếu chỉ đọc. Form gồm 3 mục: Thông tin dịch vụ, Thông tin khách hàng, Phụ tùng sử dụng |
| 3 | Chỉnh sửa thông tin | Form hỗ trợ gợi ý khách hàng, thêm/xóa dòng phụ tùng — tương tự form tạo |
| 4 | Nhấn nút lưu (khi đủ trường bắt buộc + ít nhất 1 dòng phụ tùng) | Cập nhật phiếu thành công |
| 5 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Cập nhật phiếu dịch vụ thành công."**. Quay về Chi tiết phiếu bán lẻ với dữ liệu đã cập nhật |

**Trường hợp ngoại lệ:**
- Bỏ trống người tạo phiếu → thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**
- Bỏ trống SĐT khách hàng → thông báo lỗi: **"Vui lòng nhập số điện thoại."**
- SĐT không đúng định dạng → thông báo lỗi: **"Số điện thoại không đúng định dạng"**
- Bỏ trống tên khách hàng → thông báo lỗi: **"Vui lòng nhập tên khách hàng."**
- Thiếu trường bắt buộc hoặc chưa có dòng phụ tùng → nút lưu bị mờ (disabled).
- Cập nhật thất bại → toast tiêu đề **"Lỗi"**, form giữ nguyên dữ liệu.
- Phiếu đã bị chuyển trạng thái bởi người dùng khác trong lúc chỉnh sửa → toast tiêu đề **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → đóng form, quay về Chi tiết phiếu bán lẻ. Dữ liệu đã thay đổi không được lưu.

### 4.10 Lưu và gửi báo giá từ form chỉnh sửa

> FEAT tham chiếu: `FEAT-SO-SALE-EDIT` (AC-3)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại form chỉnh sửa phiếu bán lẻ, phiếu liên kết với ứng dụng tài xế | Hiển thị nút gửi báo giá |
| 2 | Nhấn nút gửi báo giá | Hệ thống lưu chỉnh sửa và gửi báo giá |
| 3 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Gửi báo giá thành công"**. Quay về Chi tiết phiếu bán lẻ |

## 5. States

### 5.1 Bảng trạng thái

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Báo giá | **"Báo giá"** | Phiếu vừa tạo, chờ xác nhận đơn hàng | Cho phép chỉnh sửa |
| Đã xác nhận | **"Đã xác nhận"** | Đơn hàng đã được xác nhận, chờ xuất kho / giao hàng | Cho phép chỉnh sửa |
| Đã xuất kho | **"Đã xuất kho"** | Đã hoàn thành giao hàng, chờ quyết toán | Chỉ xem |
| Đã tạo quyết toán | **"Đã tạo quyết toán"** | Đã tạo quyết toán cho phiếu | Trạng thái kết thúc |
| Đã huỷ | **"Đã huỷ"** | Phiếu đã bị hủy (bắt buộc có lý do) | Trạng thái kết thúc |
| Đã từ chối | **"Đã từ chối"** | Khách hàng từ chối báo giá qua ứng dụng tài xế | Trạng thái kết thúc |

### 5.2 Ma trận hành động theo trạng thái

| Trạng thái | Xác nhận | Hoàn thành đơn hàng | Hủy | Chỉnh sửa | Gửi báo giá * | In phiếu | Đặt hàng ** |
|---|---|---|---|---|---|---|---|
| Báo giá | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Đã xác nhận | — | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| Đã xuất kho | — | — | — | — | — | ✓ | — |
| Đã tạo quyết toán | — | — | — | — | — | ✓ | — |
| Đã huỷ | — | — | — | — | — | — | — |
| Đã từ chối | — | — | — | — | — | — | — |

\* Gửi báo giá chỉ hiển thị khi phiếu liên kết với ứng dụng tài xế.

\** Đặt hàng nằm trong mục **"Phụ tùng sử dụng"** trên Chi tiết.

### 5.3 Trạng thái thanh toán

| Trạng thái thanh toán | Tên hiển thị | Mô tả |
|---|---|---|
| Chưa thanh toán | **"Chưa thanh toán"** | Phiếu chưa có giao dịch thanh toán nào |
| Thanh toán 1 phần | **"Thanh toán 1 phần"** | Đã thanh toán nhưng chưa đủ tổng tiền |
| Đã thanh toán | **"Đã thanh toán"** | Đã thanh toán đủ tổng tiền |

## 6. Validation Rules

> Áp dụng cho Form tạo (`FEAT-SO-SALE-CREATE`) và Form chỉnh sửa (`FEAT-SO-SALE-EDIT`).

### 6.1 Mục Thông tin dịch vụ

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Người tạo phiếu | Có | Chọn từ danh sách nhân viên garage | **"Vui lòng chọn nhân viên tạo phiếu."** |
| Ghi chú | Không | — | — |
| Tài liệu khác | Không | — | — |

### 6.2 Mục Thông tin khách hàng

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| SĐT khách hàng | Có | Đúng định dạng số điện thoại | **"Vui lòng nhập số điện thoại."** (trống) / **"Số điện thoại không đúng định dạng"** (sai định dạng) |
| Tên khách hàng | Có | — | **"Vui lòng nhập tên khách hàng."** |
| Loại khách hàng | Có | Mặc định **"Cá nhân"** | — |
| Tên tổ chức | Không | Chỉ hiển thị khi loại khách hàng = **"Tổ chức"** | — |
| SĐT tổ chức | Không | Chỉ hiển thị khi loại khách hàng = **"Tổ chức"** | — |
| Mã số thuế | Không | Chỉ hiển thị khi loại khách hàng = **"Tổ chức"** | — |

### 6.3 Mục Phụ tùng sử dụng

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Dòng phụ tùng | Có (ít nhất 1 dòng) | Phiếu bán lẻ yêu cầu ít nhất một dòng phụ tùng | Nút submit bị mờ khi chưa có dòng nào |
| Tên phụ tùng | Có | — | — |
| Bên thanh toán | Không | Placeholder: **"Chọn bên thanh toán"**. Giá trị: **"C - Khách hàng"**, **"I - Bảo hiểm"** | — |
| Phân khúc | Không | Placeholder: **"Chọn phân khúc"** | — |
| Người thực hiện | Không | Placeholder: **"Chọn người thực hiện"** | — |
| Đơn vị tính | Không | Placeholder: **"Chọn"** | — |
| Đơn giá | Không | — | — |
| Số lượng | Không | — | — |
| Chiết khấu | Không | Placeholder: **"0 %"** | — |

### 6.4 Điều kiện nút submit

**Form tạo — nút "Tạo mới":**
- Khả dụng (enabled): 3 trường bắt buộc đã điền đủ (SĐT khách hàng, Tên khách hàng, Người tạo phiếu), đã thêm ít nhất một dòng phụ tùng, và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc, chưa có dòng phụ tùng, hoặc đang gửi yêu cầu.

**Form chỉnh sửa — nút lưu:**
- Khả dụng (enabled): 3 trường bắt buộc đã điền đủ (SĐT khách hàng, Tên khách hàng, Người tạo phiếu), có ít nhất một dòng phụ tùng, và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc, chưa có dòng phụ tùng, hoặc đang gửi yêu cầu.

**Hủy phiếu — trường lý do hủy:**
- Nút **"Xác nhận"** trong hộp thoại hủy yêu cầu trường **"Ghi chú"** đã được điền.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-RETAIL từ EP-SERVICE-ORDER v1 (§3.2 RETAIL lifecycle) và 4 FEAT: SO-LIST v1, SO-SALE-CREATE v1, SO-SALE-DETAIL v1, SO-SALE-EDIT v1. |
