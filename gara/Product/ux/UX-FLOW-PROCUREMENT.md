---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 2
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-20"
---

# UX-FLOW-PROCUREMENT: Mua hàng

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-PROCUREMENT` |
| Kind | FLOW |
| Referenced by | `FEAT-QR-LIST`, `FEAT-QR-CREATE`, `FEAT-QR-DETAIL`, `FEAT-PR-LIST`, `FEAT-PR-CREATE`, `FEAT-PR-DETAIL`, `FEAT-PO-LIST`, `FEAT-PO-CREATE`, `FEAT-PO-DETAIL`, `FEAT-PO-EDIT` |

## 1. Purpose

Luồng mua hàng qua sàn mô tả toàn bộ quy trình mua phụ tùng từ lúc tạo yêu cầu báo giá đến khi nhận hàng và hoàn tất đơn hàng — gồm 3 bước chính: Yêu cầu báo giá (QR) → Yêu cầu đặt hàng (PR) → Đơn hàng mua (PO).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng mua hàng.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage. Nhà cung cấp tương tác qua nền tảng CarDoctor (ngoài phạm vi luồng này).

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────────┐
│                  LUỒNG VẬN HÀNH MUA HÀNG QUA SÀN                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ① YÊU CẦU BÁO GIÁ (QR)                                           │
│     Tạo YCBG ─────────────────────────► Mở                         │
│     Mở ──── Gửi báo giá ─────────────► Đang hỏi giá               │
│     Đang hỏi giá ── Nhận báo giá ────► Đang chọn giá              │
│     Đang chọn giá ── Chốt giá ───────► Đã chốt giá               │
│     Mở / Đang hỏi giá / Đang chọn giá ── Huỷ ──► Đã huỷ          │
│     Đã chốt giá ── Tạo YCĐH ─────────► Đang xác nhận đơn hàng    │
│     Đang xác nhận đơn hàng ──────────► Đã đóng                    │
│                                                                     │
│  ② YÊU CẦU ĐẶT HÀNG (PR)                                          │
│     Từ QR đã chốt giá ── Gửi YCĐH ──► Chờ xác nhận               │
│     Chờ xác nhận ── NCC xác nhận ────► Chờ thanh toán             │
│     Chờ thanh toán ── Thanh toán ────► Chờ tạo đơn                │
│     Chờ tạo đơn ── NCC tạo đơn ─────► Đã tạo đơn                 │
│     NCC xác nhận thiếu hàng ─────────► Thiếu hàng                 │
│     Bất kỳ trạng thái (chưa tạo đơn) ► Đã huỷ                    │
│                                                                     │
│  ③ ĐƠN HÀNG MUA (PO)                                               │
│     Nguồn "Nền tảng": sinh từ PR                                   │
│     Nguồn "Mua ngoài": tạo trực tiếp                               │
│     Chờ xác nhận ──► Chuẩn bị hàng ──► Đang giao hàng             │
│     Đang giao hàng ──► Đã giao hàng ──► Hoàn thành                │
│     Bất kỳ trạng thái (chưa hoàn thành) ──► Đã huỷ               │
│     Hoàn thành ──► (có thể sinh phiếu nhập kho)                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-SERVICE-ORDER` | Phiếu dịch vụ cung cấp danh sách phụ tùng cần mua — yêu cầu báo giá có thể tham chiếu phiếu dịch vụ |
| Upstream | `EP-CATALOG` | Danh mục nhà cung cấp và nhà vận chuyển liên kết dùng khi tạo yêu cầu đặt hàng và đơn hàng mua |
| Downstream | `EP-INVENTORY-RECEIPT` | Đơn hàng mua hoàn tất nhận hàng có thể sinh phiếu nhập kho nguồn **"Nền tảng"** |
| Downstream | `EP-DASHBOARD` | Chỉ số mua hàng (tổng đơn, tổng chi phí, tỷ lệ chuyển đổi) hiển thị trên dashboard |
| Bên ngoài | CarDoctor (CSKH) | Hỗ trợ xử lý yêu cầu báo giá và yêu cầu đặt hàng qua chat |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu mua hàng trên Web GMS, mục yêu cầu báo giá | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách yêu cầu báo giá |
| 2 | Nút **"Thêm mới yêu cầu báo giá"** trên Danh sách YCBG | Đang ở Danh sách yêu cầu báo giá | Form tạo yêu cầu báo giá mới |
| 3 | Nhấn vào dòng yêu cầu báo giá trong danh sách | Đang ở Danh sách yêu cầu báo giá | Màn hình Chi tiết yêu cầu báo giá |
| 4 | Menu mua hàng trên Web GMS, mục yêu cầu đặt hàng | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách yêu cầu đặt hàng |
| 5 | Nhấn vào dòng yêu cầu đặt hàng trong danh sách | Đang ở Danh sách yêu cầu đặt hàng | Màn hình Chi tiết yêu cầu đặt hàng |
| 6 | Menu mua hàng trên Web GMS, mục đơn hàng | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách đơn hàng |
| 7 | Nút **"Tạo đơn hàng mới"** trên Danh sách đơn hàng | Đang ở Danh sách đơn hàng | Form tạo đơn hàng mới (nguồn "Mua ngoài") |
| 8 | Nhấn vào dòng đơn hàng trong danh sách | Đang ở Danh sách đơn hàng | Màn hình Chi tiết đơn hàng |
| 9 | Nút **"Gửi yêu cầu đặt hàng"** trên Chi tiết YCBG | YCBG đã có báo giá từ nhà cung cấp, đã chọn phụ tùng | Màn hình Xác nhận yêu cầu đặt hàng |

## 3. Layout / Wireframe

> Luồng mua hàng trên Web GMS gồm 3 module chính (Yêu cầu báo giá, Yêu cầu đặt hàng, Đơn hàng mua) với tổng cộng 10 màn hình. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

### Module 1: Yêu cầu báo giá (QR)

```
┌──────────────────┐    Thêm mới     ┌──────────────────┐
│  Danh sách       │────────────────►│  Form tạo        │
│  yêu cầu báo giá │                 │  yêu cầu báo giá │
│ (FEAT-QR-LIST)   │◄────────────────│ (FEAT-QR-CREATE) │
│                  │   Submit / Huỷ  │                  │
└──┬───────────────┘                 └──────────────────┘
   │
   │ Xem chi tiết
   ▼
┌──────────────────┐
│  Chi tiết        │
│  yêu cầu báo giá │
│ (FEAT-QR-DETAIL) │
│                  │
│ Hành động:       │    Nhân bản     ┌──────────────────┐
│ • Chọn phụ tùng  │────────────────►│  Form tạo YCBG   │
│ • Gửi YCĐH       │                 │  mới (dữ liệu   │
│ • Nhân bản       │                 │  sao chép)       │
│ • Thay đổi nhà xe│                 └──────────────────┘
│ • Hỗ trợ        │
│                  │    Gửi YCĐH    ┌──────────────────┐
│                  │────────────────►│  Xác nhận yêu    │
└──────────────────┘                 │  cầu đặt hàng   │
                                     │ (FEAT-PR-CREATE) │
                                     └──────────────────┘
```

### Module 2: Yêu cầu đặt hàng (PR)

```
┌──────────────────┐
│  Danh sách       │
│  yêu cầu đặt    │
│  hàng            │
│ (FEAT-PR-LIST)   │
└──┬───────────────┘
   │
   │ Xem chi tiết
   ▼
┌──────────────────┐   Thanh toán    ┌──────────────────┐
│  Chi tiết        │────────────────►│  Màn hình        │
│  yêu cầu đặt    │                 │  thanh toán      │
│  hàng            │                 │ (FEAT-PR-CREATE) │
│ (FEAT-PR-DETAIL) │                 └──────────────────┘
│                  │
│ Hành động:       │
│ • Thanh toán     │
│ • Huỷ YCĐH       │
│ • Hỗ trợ (chat)  │
└──────────────────┘
```

### Module 3: Đơn hàng mua (PO)

```
┌──────────────────┐    Tạo mới     ┌──────────────────┐
│  Danh sách       │────────────────►│  Form tạo        │
│  đơn hàng        │                 │  đơn hàng mới    │
│ (FEAT-PO-LIST)   │◄────────────────│ (FEAT-PO-CREATE) │
│                  │   Submit / Huỷ  │                  │
└──┬───────────────┘                 └──────────────────┘
   │
   │ Xem chi tiết
   ▼
┌──────────────────┐   Chỉnh sửa    ┌──────────────────┐
│  Chi tiết        │────────────────►│  Form chỉnh sửa  │
│  đơn hàng        │◄────────────────│  đơn hàng        │
│ (FEAT-PO-DETAIL) │   Lưu / Huỷ    │ (FEAT-PO-EDIT)   │
│                  │                 └──────────────────┘
│ Hành động:       │
│ • Chuyển TT      │
│ • Hoàn thành     │
│ • Huỷ đơn hàng   │
│ • Hoàn hàng      │
│ • Chỉnh sửa      │
│ • Cập nhật tài   │
│   liệu đính kèm │
└──────────────────┘
```

### Điều hướng liên module

```
┌──────────────────┐               ┌──────────────────┐
│  Chi tiết YCBG   │── Gửi YCĐH ─►│  Xác nhận YCĐH   │
│ (FEAT-QR-DETAIL) │               │ (FEAT-PR-CREATE) │
└──────────────────┘               └────────┬─────────┘
                                            │
                                   Đặt hàng thành công
                                            │
                                            ▼
┌──────────────────┐               ┌──────────────────┐
│  Danh sách YCĐH  │── Xem ──────►│  Chi tiết YCĐH   │
│ (FEAT-PR-LIST)   │               │ (FEAT-PR-DETAIL) │
└──────────────────┘               └──────────────────┘

┌──────────────────┐               ┌──────────────────┐
│  Chi tiết YCĐH   │── Đã tạo ───►│  Danh sách       │
│ (FEAT-PR-DETAIL) │   đơn         │  đơn hàng        │
└──────────────────┘               │ (FEAT-PO-LIST)   │
                                   └──────────────────┘
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách yêu cầu báo giá

> FEAT tham chiếu: `FEAT-QR-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu yêu cầu báo giá | Hiển thị màn hình **"Danh sách yêu cầu báo giá"** với mô tả **"Quản lý và xem chi tiết các yêu cầu báo giá của bạn."**. Bảng gồm các cột: **"Mã YCBG"**, **"Ngày tạo"**, **"Trạng thái đơn"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Thao tác"** |
| 2 | Nhập từ khoá vào ô tìm kiếm | Lọc theo mã yêu cầu báo giá hoặc biển số xe. Placeholder: **"Tìm kiếm theo mã YCBG, biển số xe"** |
| 3 | Chọn bộ lọc (trạng thái, ngày tạo) | Danh sách cập nhật theo tiêu chí đã chọn |
| 4 | Nhấn vào dòng yêu cầu báo giá | Chuyển sang Chi tiết yêu cầu báo giá (xem §4.3) |
| 5 | Nhấn nút **"Thêm mới yêu cầu báo giá"** | Chuyển sang Form tạo yêu cầu báo giá (xem §4.2) |
| 6 | Nhấn biểu tượng xem báo giá sơ bộ trong cột **"Thao tác"** | Hiển thị modal **"Thông tin báo giá sơ bộ"** với mô tả **"Báo giá sơ bộ được ước tính nhằm hỗ trợ tham khảo ban đầu."**. Bảng hiển thị: **"Tên phụ tùng"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá sơ bộ"**. Nút **"Đóng"** để đóng modal |

**Trường hợp ngoại lệ:**
- Không có yêu cầu báo giá nào → hiển thị thông báo danh sách trống.
- Tìm kiếm không có kết quả → hiển thị thông báo danh sách trống.
- Yêu cầu chưa có báo giá sơ bộ → không hiển thị biểu tượng xem báo giá trong cột **"Thao tác"**.

### 4.2 Tạo yêu cầu báo giá

> FEAT tham chiếu: `FEAT-QR-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn **"Thêm mới yêu cầu báo giá"** trên Danh sách | Mở form trống gồm 3 mục: **"Thông tin xe"**, **"Thông tin phụ tùng cần báo giá"**, **"Thông tin xuất hoá đơn"** |
| 2 | Tải lên hình ảnh đăng kiểm (mục Thông tin xe) | Hệ thống xử lý OCR và tự động điền thông tin xe. Mô tả: **"Tải lên hình ảnh đăng kiểm để tự động điền thông tin xe"**. Quét thành công: toast **"Quét thông tin thành công!"**. Quét lỗi: toast tiêu đề **"Lỗi"**, mô tả **"Đã xảy ra lỗi khi xử lý ảnh"** |
| 3 | Chọn hãng xe và dòng xe | Ô chọn có tìm kiếm. Hãng xe và dòng xe bắt buộc. Dòng xe phụ thuộc hãng xe đã chọn |
| 4 | Nhập thông tin xe khác (năm SX, phiên bản, số VIN, biển số, công ty bảo hiểm, ghi chú, hình ảnh xe) | Tất cả không bắt buộc. Hình ảnh xe tối đa 3 ảnh |
| 5 | Thêm phụ tùng (tab Thêm phụ tùng) | Nhập tên phụ tùng. Placeholder: **"Nhập hoặc chọn phụ tùng có sẵn"**. Bảng: **"Tên phụ tùng"**, **"Đơn vị tính"**, **"Số lượng"**, **"Thao tác"**. Tên phụ tùng bắt buộc |
| 6 | Tạo nhanh phụ tùng (tab Tạo nhanh phụ tùng) | Nhập danh sách dạng text. Placeholder: **"Nhập danh sách phụ tùng ngăn cách nhau bởi dấu , ; . hoặc xuống dòng"** |
| 7 | Tải lên file phụ tùng (import Excel) | Chỉ chấp nhận file Excel, tối đa 30MB. Hiển thị xem trước với bảng: **"Tên phụ tùng"**, **"Số lượng"**, **"Đơn vị"**, **"Trạng thái"**, **"Lỗi (Nếu có)"**. Tải mẫu: **"Tải xuống File mẫu"** |
| 8 | Đánh dấu yêu cầu xuất hoá đơn (không bắt buộc) | Hiển thị thêm các trường: **"Tên công ty"** (bắt buộc khi đánh dấu), **"Mã số thuế"** (bắt buộc khi đánh dấu), **"Email công ty"** (không bắt buộc), **"Địa chỉ"** (bắt buộc khi đánh dấu). Ghi chú: **"Bạn không thể tự chỉnh sửa thông tin yêu cầu xuất hóa đơn, vui lòng liên hệ CSKH để được hỗ trợ."** |
| 9 | Nhấn nút **"Tạo yêu cầu báo giá"** | Tạo thành công → toast tiêu đề **"Thành công"**. Chuyển sang màn hình **"Đã tạo yêu cầu báo giá"** với mô tả **"Yêu cầu báo giá đã được khởi tạo, bạn sẽ nhận được thông báo khi có báo giá mới từ nhà cung cấp."** và nút **"Xem chi tiết"** |

**Trường hợp ngoại lệ:**
- Hãng xe để trống → lỗi: **"Hãng xe là trường bắt buộc"**.
- Dòng xe để trống → lỗi: **"Dòng xe là trường bắt buộc"**.
- Biển số xe sai định dạng → lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.
- Phụ tùng trùng tên → toast tiêu đề **"Lỗi"**, mô tả **"Không được tạo phụ tùng giống nhau trong một yêu cầu báo giá"**.
- File không đúng định dạng → toast **"File không hợp lệ"**, mô tả **"Định dạng file không hợp lệ. Vui lòng upload file Excel."**.
- File quá 30MB → toast mô tả **"Dung lượng file quá 30MB. Vui lòng chọn file nhỏ hơn."**.
- Tải lên thành công → toast **"Tải lên thành công."**.
- Tên phụ tùng để trống → lỗi: **"Vui lòng nhập Tên phụ tùng"**.
- Thông tin hoá đơn: tên công ty để trống → **"Vui lòng nhập tên công ty."**; mã số thuế để trống → **"Vui lòng nhập mã số thuế."**; email sai định dạng → **"Email công ty không đúng định dạng."**; địa chỉ để trống → **"Vui lòng nhập địa chỉ."**.
- Tạo thất bại → toast tiêu đề **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Hủy bỏ"** → quay về Danh sách yêu cầu báo giá, dữ liệu không được lưu.

### 4.3 Xem chi tiết yêu cầu báo giá

> FEAT tham chiếu: `FEAT-QR-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào dòng yêu cầu báo giá trên Danh sách | Mở Chi tiết yêu cầu báo giá gồm các mục: **"Thông tin chung"**, **"Thông tin xe"**, **"Thông tin phụ tùng cần báo giá"**, **"Yêu cầu xuất hóa đơn"**, **"Lịch sử cập nhật"** |
| 2 | Mục Thông tin chung | Hiển thị chỉ đọc: trạng thái yêu cầu, **"Phiếu dịch vụ liên kết"**, **"Mã yêu cầu đặt hàng liên kết"**, **"Ngày tạo"**, **"Ngày cập nhật"**, **"Yêu cầu xuất hóa đơn"** (**"Có"** hoặc **"Không"**) |
| 3 | Mục Thông tin xe | Hiển thị chỉ đọc: **"Hãng xe"**, **"Dòng xe"**, **"Loại xe"**, **"Năm sản xuất"**, **"Phiên bản xe"**, **"Số khung xe (Số VIN)"**, **"Biển số xe"**, **"Công ty bảo hiểm"**, **"Ghi chú"**, **"Hình ảnh xe"** |
| 4 | Mục Thông tin phụ tùng cần báo giá | Bảng: **"Tên phụ tùng"**, **"Đơn vị tính"**, **"Số lượng"**, **"Ảnh (Tối đa 3 ảnh)"**. Nếu chưa có dữ liệu: **"Không có dữ liệu"** |
| 5 | Mục Yêu cầu xuất hóa đơn (khi có đánh dấu) | Hiển thị: **"Tên công ty"**, **"Mã số thuế"**, **"Email công ty"**, **"Địa chỉ"** |
| 6 | Mục Yêu cầu xuất hóa đơn (khi không đánh dấu) | Hiển thị badge **"Không yêu cầu xuất hóa đơn"** |
| 7 | Mục Lịch sử cập nhật | Danh sách lịch sử theo thời gian. Nguồn cập nhật: **"từ nhà cung cấp"** hoặc **"từ CSKH CarDoctor"** |

**Trường hợp ngoại lệ:**
- Chưa có báo giá từ nhà cung cấp → không hiển thị khu vực chọn phụ tùng và nút đặt hàng.
- Chưa có hình ảnh xe → mục hình ảnh hiển thị trống.
- Tải dữ liệu thất bại → hiển thị thông báo lỗi.

### 4.4 Chọn phụ tùng và gửi yêu cầu đặt hàng từ YCBG

> FEAT tham chiếu: `FEAT-QR-DETAIL` (AC-7, AC-8), `FEAT-PR-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết YCBG, khi có báo giá từ nhà cung cấp | Hiển thị bảng chọn phụ tùng: **"Tên phụ tùng"**, **"Đơn vị tính"**, **"Phân khúc"**, **"Số lượng"**, **"Giá"**. Phụ tùng có **"Giá tốt nhất!"** được đánh dấu. Placeholder: **"Chọn phụ tùng đi kèm"**. Phụ tùng hết hàng hiển thị **"Hết hàng"** |
| 2 | Chọn phụ tùng và nhấn **"Gửi yêu cầu đặt hàng"** | Chuyển sang màn hình **"Xác nhận yêu cầu đặt hàng"** gồm các mục: **"Thông tin người đặt"**, **"Phụ tùng đã chọn"**, **"Thông tin nhà xe"**, **"Thanh toán"** |
| 3 | Màn hình Xác nhận — mục Thông tin người đặt | Hiển thị thông tin garage: tên, số điện thoại, địa chỉ (tự động lấy từ hồ sơ garage) |
| 4 | Màn hình Xác nhận — mục Phụ tùng đã chọn | Bảng: **"Nhà cung cấp"**, **"Tên phụ tùng"**, **"Thông tin phụ tùng"**, **"ĐVT"**, **"Số lượng"**, **"Giá hàng hoá"**, **"Giá dịch vụ"** |
| 5 | Màn hình Xác nhận — mục Thông tin nhà xe | Hiển thị: **"Nhà xe"**, **"Thời gian xe chạy"**. Cho phép thay đổi nhà xe liên kết |
| 6 | Màn hình Xác nhận — mục Thanh toán | Chọn phương thức thanh toán. **"Chi tiết thanh toán"**: **"Tổng tiền hàng hoá"**, **"Tổng tiền thanh toán"**. Ghi chú: **"Chưa bao gồm chi phí vận chuyển giữa Garage và nhà xe"** |
| 7 | Nhấn **"Xác nhận đặt hàng"** | Thông báo: **"Sau khi xác nhận đặt hàng, bạn sẽ không thể thay đổi phương thức thanh toán"**. Xác nhận → tạo yêu cầu đặt hàng. Thành công: **"Đã gửi yêu cầu đặt hàng!"** với mô tả **"Bạn sẽ nhận được thông báo khi nhà cung cấp xác nhận."** |

**Trường hợp ngoại lệ:**
- Tất cả phụ tùng hết hàng → nút **"Gửi yêu cầu đặt hàng"** không khả dụng.
- Thanh toán thất bại hoặc hết thời gian → **"Hết thời gian thanh toán"**, mô tả **"Giao dịch đã quá thời gian chờ thanh toán. Quý khách vui lòng tạo lại mã QR."** và nút **"Tạo lại QR"**.
- Phương thức thanh toán tạm không hỗ trợ → **"Hình thức thanh toán này tạm thời không hỗ trợ. Vui lòng đặt lại đơn hàng và chọn hình thức thanh toán khác!"**.

### 4.5 Nhân bản yêu cầu báo giá

> FEAT tham chiếu: `FEAT-QR-DETAIL` (AC-9)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết YCBG, nhấn nút **"Nhân bản"** | Hiển thị 3 tuỳ chọn: **"Nhân bản toàn bộ"**, **"Chỉ nhân bản thông tin phụ tùng"**, **"Chỉ nhân bản thông tin xe"** |
| 2 | Chọn tuỳ chọn nhân bản | Chuyển sang form tạo yêu cầu báo giá mới với dữ liệu được sao chép tương ứng |

### 4.6 Thay đổi nhà xe liên kết

> FEAT tham chiếu: `FEAT-QR-DETAIL` (AC-10)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết YCBG, nhấn **"Thay đổi nhà xe liên kết"** | Hiển thị modal với các trường: **"Nhà xe"** (placeholder: **"Chọn nhà xe"**), **"Địa chỉ"** (placeholder: **"Nhập địa chỉ"**), **"Số điện thoại"** (placeholder: **"Nhập số điện thoại"**), **"Thời gian xe chạy"** (placeholder: **"Nhập thời gian xe chạy"**). Hai nút **"Hủy"** / **"Xác nhận"** |
| 2 | Nhập thông tin và nhấn **"Xác nhận"** | Cập nhật nhà xe liên kết thành công |

### 4.7 Xem và tìm kiếm danh sách yêu cầu đặt hàng

> FEAT tham chiếu: `FEAT-PR-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu yêu cầu đặt hàng | Hiển thị màn hình **"Danh sách yêu cầu đặt hàng"** với mô tả **"Quản lý và xem chi tiết các yêu cầu đặt hàng của bạn."**. Bảng gồm các cột: **"Mã đặt hàng"**, **"Ngày tạo"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Trạng thái yêu cầu đặt hàng"**, **"Trạng thái thanh toán"**, **"Hỗ trợ"** |
| 2 | Nhập từ khoá vào ô tìm kiếm | Lọc theo mã yêu cầu đặt hàng. Placeholder: **"Tìm kiếm theo mã yêu cầu đặt hàng"** |
| 3 | Chọn bộ lọc (trạng thái yêu cầu đặt hàng, trạng thái thanh toán, ngày tạo) | Danh sách cập nhật theo tiêu chí đã chọn |
| 4 | Nhấn vào dòng yêu cầu đặt hàng | Chuyển sang Chi tiết yêu cầu đặt hàng (xem §4.8) |
| 5 | Nhấn biểu tượng chat trong cột **"Hỗ trợ"** | Mở chat hỗ trợ cho yêu cầu đặt hàng đó |

**Trường hợp ngoại lệ:**
- Không có yêu cầu đặt hàng nào → hiển thị thông báo danh sách trống.
- Yêu cầu chưa có biển số xe → cột **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"** hiển thị trống.

### 4.8 Xem chi tiết yêu cầu đặt hàng

> FEAT tham chiếu: `FEAT-PR-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào dòng yêu cầu đặt hàng trên Danh sách | Mở Chi tiết yêu cầu đặt hàng gồm các mục: **"Thông tin chung"**, **"Thông tin người đặt"**, **"Phụ tùng đã chọn"**, **"Thông tin nhà xe"**, **"Thanh toán"** |
| 2 | Mục Thông tin chung | Hiển thị chỉ đọc: **"Mã yêu cầu báo giá liên kết"**, **"Ngày tạo"**, **"Trạng thái thanh toán"**, **"Yêu cầu xuất hóa đơn"**. Nếu đã huỷ: hiển thị thêm **"Lý do hủy"** |
| 3 | Mục Thông tin người đặt | Hiển thị: **"Người đặt"**, **"Số điện thoại"**, **"Địa chỉ"** |
| 4 | Mục Phụ tùng đã chọn | Bảng: **"STT"**, **"Nhà cung cấp"**, **"Tên phụ tùng"**, **"Thông tin phụ tùng"**, **"ĐVT"**, **"Số lượng"**, **"Giá hàng hoá"**, **"Giá dịch vụ"**, **"Giá"** |
| 5 | Mục Thông tin nhà xe | Hiển thị: **"Nhà xe"**, **"Thời gian xe chạy"** |
| 6 | Mục Thanh toán | Hiển thị: **"Phương thức thanh toán"**, **"Chi tiết thanh toán"** (gồm **"Tổng tiền hàng hoá"**, **"Tổng tiền thanh toán"**) |

**Trường hợp ngoại lệ:**
- Yêu cầu đã huỷ → hiển thị **"Lý do hủy"**, không cho phép thao tác.
- Yêu cầu thiếu hàng → trạng thái **"Thiếu hàng"**, chờ nhà cung cấp cập nhật.
- Tải dữ liệu thất bại → hiển thị thông báo lỗi.

### 4.9 Thanh toán yêu cầu đặt hàng

> FEAT tham chiếu: `FEAT-PR-DETAIL` (AC-7), `FEAT-PR-CREATE` (AC-7)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết YCĐH, trạng thái **"Chờ thanh toán"** | Hiển thị nút **"Thanh toán đơn hàng"** |
| 2 | Nhấn nút **"Thanh toán đơn hàng"** | Chuyển sang màn hình **"Thanh toán"** với phương thức tương ứng (QR chuyển khoản, thẻ tín dụng). Hiển thị: **"Số tiền"**, **"Ngân hàng"**, **"Số tài khoản"**, **"Tên tài khoản"** |
| 3 | Thanh toán thành công | Hiển thị **"Thanh toán thành công"** |

**Trường hợp ngoại lệ:**
- Thanh toán thất bại hoặc hết thời gian → **"Hết thời gian thanh toán"**, mô tả **"Giao dịch đã quá thời gian chờ thanh toán. Quý khách vui lòng tạo lại mã QR."** và nút **"Tạo lại QR"**.
- Phương thức thanh toán tạm không hỗ trợ → **"Hình thức thanh toán này tạm thời không hỗ trợ. Vui lòng đặt lại đơn hàng và chọn hình thức thanh toán khác!"**.

### 4.10 Huỷ yêu cầu đặt hàng

> FEAT tham chiếu: `FEAT-PR-CREATE` (AC-9), `FEAT-PR-DETAIL` (AC-8)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết YCĐH, nhấn nút **"Hủy yêu cầu đặt hàng"** | Hiển thị modal **"Xác nhận hủy yêu cầu đặt hàng"** với mô tả **"Bạn có chắc chắn muốn hủy yêu cầu đặt hàng không? Hành động này không thể hoàn tác."** và hai nút **"Đóng"** / **"Xác nhận hủy"** |
| 2 | Nhấn **"Xác nhận hủy"** | Trạng thái chuyển sang **"Đã hủy"** |

### 4.11 Xem và tìm kiếm danh sách đơn hàng

> FEAT tham chiếu: `FEAT-PO-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu đơn hàng | Hiển thị màn hình **"Danh sách đơn hàng"** với mô tả **"Quản lý và xem chi tiết các đơn hàng của bạn."**. Bảng gồm các cột: **"Mã đơn hàng"**, **"Ngày tạo"**, **"Nguồn đơn"**, **"Nhà cung cấp"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Trạng thái đơn"**, **"Trạng thái thanh toán"**, **"Hỗ trợ"** |
| 2 | Nhập từ khoá vào ô tìm kiếm | Lọc theo mã đơn hàng hoặc biển số xe. Placeholder: **"Tìm kiếm theo mã đơn hàng, biển số xe"** |
| 3 | Chọn bộ lọc (trạng thái đơn, trạng thái thanh toán, nguồn đơn, ngày tạo, nhà cung cấp) | Danh sách cập nhật theo tiêu chí đã chọn |
| 4 | Nhấn vào dòng đơn hàng | Chuyển sang Chi tiết đơn hàng (xem §4.13) |
| 5 | Nhấn nút **"Tạo đơn hàng mới"** | Chuyển sang Form tạo đơn hàng mới (xem §4.12) |

**Trường hợp ngoại lệ:**
- Không có đơn hàng nào → hiển thị thông báo danh sách trống.
- Đơn hàng chưa có biển số xe → cột **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"** hiển thị trống.

### 4.12 Tạo đơn hàng mua ngoài

> FEAT tham chiếu: `FEAT-PO-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn **"Tạo đơn hàng mới"** trên Danh sách | Mở form trống gồm 2 mục: **"Thông tin đơn hàng"** và **"Danh sách phụ tùng cần mua"** |
| 2 | Chọn nhà cung cấp (bắt buộc) | Ô chọn có tìm kiếm. Placeholder: **"Chọn nhà cung cấp"**. Khi chọn, tự động điền: **"Số điện thoại liên hệ"**, **"Mã số thuế"**, **"Địa chỉ"**, **"Phương thức thanh toán"** |
| 3 | Chọn trạng thái đơn hàng (bắt buộc) | Ô chọn: **"Chờ xác nhận"**, **"Chuẩn bị hàng"**, **"Đang giao hàng"**, **"Đã giao hàng"**, **"Hoàn thành"**, **"Đã hủy"** |
| 4 | Chọn mức ưu tiên (bắt buộc) | Ô chọn: **"Bình thường"**, **"Gấp"**, **"Khẩn cấp"** |
| 5 | Chọn ngày giao dự kiến (bắt buộc) | Bộ chọn ngày (date picker). Ngày >= ngày hiện tại |
| 6 | Nhập các trường không bắt buộc | **"Phiếu dịch vụ liên kết"** (placeholder: **"Chọn phiếu dịch vụ liên kết"**), **"Số điện thoại liên hệ"** (placeholder: **"Nhập số điện thoại"**), **"Mã số thuế"** (placeholder: **"Nhập mã số thuế"**), **"Địa chỉ"** (placeholder: **"Nhập địa chỉ"**), **"Phương thức thanh toán"**, **"Ghi chú"** (placeholder: **"Nhập ghi chú"**) |
| 7 | Thêm phụ tùng vào đơn hàng | Nhấn **"Thêm phụ tùng"**. Tìm kiếm phụ tùng: placeholder **"Tìm kiếm phụ tùng"**. Bảng: **"Tên phụ tùng"**, **"Mã chính hãng"**, **"Phân khúc"**, **"Nguồn gốc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Thao tác"** |
| 8 | Tạo sản phẩm mới (khi không tìm thấy) | Modal **"Thêm sản phẩm mới"**: **"Tên sản phẩm"** (bắt buộc, placeholder: **"Nhập tên sản phẩm"**), **"Phân khúc"** (placeholder: **"Chọn phân khúc"**), **"Đơn vị"** (bắt buộc, placeholder: **"Chọn đơn vị"**), **"Xuất xứ"** (placeholder: **"Nhập xuất xứ"**). Tạo thành công: toast **"Tạo sản phẩm thành công."** |
| 9 | Nhấn nút tạo đơn hàng | Tạo thành công → toast tiêu đề **"Thành công"**, mô tả **"Tạo đơn hàng mới thành công."**. Chuyển về Danh sách đơn hàng |

**Trường hợp ngoại lệ:**
- Nhà cung cấp để trống → lỗi: **"Nhà cung cấp là bắt buộc"**.
- Trạng thái để trống → lỗi: **"Trạng thái đơn hàng là bắt buộc"**.
- Mức ưu tiên để trống → lỗi: **"Mức ưu tiên là bắt buộc"**.
- Ngày giao dự kiến để trống → lỗi: **"Ngày giao dự kiến là bắt buộc"**.
- Ngày giao dự kiến < ngày hiện tại → lỗi: **"Ngày giao dự kiến không được nhỏ hơn ngày hiện tại"**.
- Chưa thêm phụ tùng → toast tiêu đề **"Lỗi"**, mô tả **"Đơn hàng phải có ít nhất một phụ tùng"**.
- Phụ tùng chưa có đơn giá → toast tiêu đề **"Lỗi"**, mô tả **"Vui lòng nhập đơn giá"**.
- Tên sản phẩm để trống → lỗi: **"Tên sản phẩm không được để trống"**.
- Đơn vị để trống → lỗi: **"Đơn vị không được để trống"**.
- Tạo thất bại → toast tiêu đề **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → modal tiêu đề **"Tiếp tục tạo đơn hàng?"**, mô tả **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."** với hai nút **"Hủy"** và **"Tiếp tục"**.
- Hiển thị tổng hợp: **"Tạm tính"**, **"Chiết khấu"**, **"Thuế"**, **"Tổng cộng"**. Ghi chú: **"Kiểm tra lại thông tin nhà cung cấp & danh sách phụ tùng trước khi đặt đơn"**.

### 4.13 Xem chi tiết đơn hàng

> FEAT tham chiếu: `FEAT-PO-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào dòng đơn hàng trên Danh sách | Mở Chi tiết đơn hàng. Hiển thị **"Mã đơn mua hàng"**, trạng thái đơn, và các mục thông tin |
| 2 | Mục Thông tin chung | Hiển thị chỉ đọc: **"Nguồn đơn"**, **"Mức ưu tiên"**, **"Ngày giao dự kiến"**, **"Phiếu dịch vụ liên kết"**, **"Ghi chú"** |
| 3 | Mục Nhà cung cấp | Hiển thị chỉ đọc: **"Tên nhà cung cấp"**, **"Số điện thoại"**, **"Mã số thuế"**, **"Địa chỉ"**, **"Phương thức thanh toán"** |
| 4 | Mục Phụ tùng đã chọn | Bảng: **"Tên phụ tùng"**, **"Mã chính hãng"**, **"Phân khúc"**, **"Nguồn gốc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**. Tổng hợp: **"Tạm tính"**, **"Chiết khấu"**, **"Thuế"**, **"Tổng cộng"** |
| 5 | Mục Tài liệu đính kèm | Hai phân mục: **"Hoá đơn"** và **"Tài liệu khác"**. Cho phép xem và cập nhật |
| 6 | Mục Phiếu nhập kho liên kết | Danh sách phiếu nhập kho liên kết (nếu có): **"Mã phiếu nhập kho"**, **"Trạng thái"**, **"Ngày tạo phiếu"**, **"Cập nhật mới nhất"** |
| 7 | Mục Lịch sử ghi nhận | Danh sách lịch sử thay đổi trạng thái theo thời gian. Nếu đơn huỷ: hiển thị **"Lý do hủy:"**. Nếu đơn hoàn hàng: hiển thị **"Lý do hoàn hàng:"** |

**Trường hợp ngoại lệ:**
- Đơn hàng chưa có tài liệu đính kèm → mục tài liệu hiển thị trống.
- Đơn hàng chưa liên kết phiếu nhập kho → mục phiếu nhập kho hiển thị trống.
- Đơn hàng đã huỷ → hiển thị **"Lý do hủy"**, không cho phép thao tác.
- Tải dữ liệu thất bại → hiển thị thông báo lỗi.

### 4.14 Chuyển trạng thái đơn hàng

> FEAT tham chiếu: `FEAT-PO-DETAIL` (AC-9)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết đơn hàng, khu vực **"Chuyển trạng thái"** | Chọn trạng thái mới từ ô chọn (placeholder: **"Chọn trạng thái"**) và nhấn **"Áp dụng"** |
| 2 | Chuyển sang **"Chuẩn bị hàng"** | Toast: **"Đơn hàng đã được chuyển sang trạng thái chuẩn bị hàng."** |
| 3 | Chuyển sang **"Đang giao hàng"** | Toast: **"Đơn hàng đã được chuyển sang trạng thái đang giao hàng."** |

### 4.15 Hoàn thành đơn hàng

> FEAT tham chiếu: `FEAT-PO-DETAIL` (AC-10)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết đơn hàng, nhấn nút hoàn thành | Modal **"Hoàn thành đơn hàng"** với mô tả **"Đơn mua hàng sẽ được đánh dấu Hoàn thành và không thể chỉnh sửa lại."** và hai nút **"Hủy"** / **"Hoàn thành"** |
| 2 | Nhấn **"Hoàn thành"** | Toast: **"Đơn hàng đã được hoàn thành."** |

### 4.16 Huỷ đơn hàng

> FEAT tham chiếu: `FEAT-PO-DETAIL` (AC-11)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết đơn hàng, nhấn nút huỷ | Modal **"Hủy đơn hàng"** với mô tả **"Hành động này không thể hoàn tác."** và trường **"Lý do hủy đơn"** (bắt buộc, placeholder: **"Nhập lý do hủy đơn"**). Hai nút **"Đóng"** / **"Xác nhận"** |
| 2 | Nhập lý do và nhấn **"Xác nhận"** | Trạng thái chuyển sang **"Đã hủy"**. Toast: **"Đơn hàng đã được huỷ."** |

**Trường hợp ngoại lệ:**
- Không nhập lý do → lỗi: **"Vui lòng nhập lý do hủy đơn"**.

### 4.17 Hoàn hàng đơn hàng

> FEAT tham chiếu: `FEAT-PO-DETAIL` (AC-12)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết đơn hàng, nhấn nút hoàn hàng | Modal **"Hoàn đơn hàng"** với mô tả **"Hành động này không thể hoàn tác."** và trường **"Lý do hoàn hàng"** (bắt buộc, placeholder: **"Nhập lý do hoàn hàng"**). Hai nút **"Đóng"** / **"Xác nhận"** |
| 2 | Nhập lý do và nhấn **"Xác nhận"** | Toast: **"Đơn hàng đã được ghi nhận hoàn hàng."** |

**Trường hợp ngoại lệ:**
- Không nhập lý do → lỗi: **"Vui lòng nhập lý do hoàn hàng"**.

### 4.18 Chỉnh sửa đơn hàng

> FEAT tham chiếu: `FEAT-PO-EDIT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết đơn hàng, nhấn nút **"Chỉnh sửa"** | Chuyển sang form **"Chỉnh sửa đơn hàng"** với dữ liệu hiện tại điền sẵn, gồm 2 mục: **"Thông tin đơn hàng"** và **"Danh sách phụ tùng cần mua"** |
| 2 | Chỉnh sửa thông tin đơn hàng và phụ tùng | Form hỗ trợ chỉnh sửa tương tự form tạo (xem §4.12). Các trường bắt buộc và validation giống form tạo |
| 3 | Nhấn nút **"Lưu"** (khi đủ trường bắt buộc) | Cập nhật thành công → toast tiêu đề **"Thành công"**, mô tả **"Cập nhật đơn hàng thành công."**. Chuyển về Chi tiết đơn hàng |

**Trường hợp ngoại lệ:**
- Đơn hàng đã hoàn thành hoặc đã huỷ → nút **"Chỉnh sửa"** không hiển thị.
- Xoá hết phụ tùng rồi lưu → toast tiêu đề **"Lỗi"**, mô tả **"Đơn hàng phải có ít nhất một phụ tùng"**.
- Phụ tùng chưa có đơn giá → toast tiêu đề **"Lỗi"**, mô tả **"Vui lòng nhập đơn giá"**.
- Cập nhật thất bại → toast tiêu đề **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → modal tiêu đề **"Tiếp tục chỉnh sửa đơn hàng?"**, mô tả **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."** với hai nút **"Hủy"** và **"Tiếp tục"**.

### 4.19 Cập nhật tài liệu đính kèm

> FEAT tham chiếu: `FEAT-PO-DETAIL` (AC-14)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết đơn hàng, mục **"Tài liệu đính kèm"** | Nhấn nút **"Cập nhật tài liệu đính kèm"** và tải lên tài liệu |
| 2 | Tải lên thành công | Toast: **"Cập nhật tài liệu đính kèm thành công"** |

## 5. States

### 5.1 Bảng trạng thái Yêu cầu báo giá (QR)

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Mở | **"Mở"** | Yêu cầu vừa tạo, chưa gửi báo giá | Cho phép huỷ |
| Đang hỏi giá | **"Đang hỏi giá"** | Đã gửi cho nhà cung cấp, đang chờ báo giá | Cho phép huỷ |
| Đang chọn giá | **"Đang chọn giá"** | Đã nhận báo giá, đang chọn phụ tùng | Cho phép chọn phụ tùng, huỷ |
| Đã chốt giá | **"Đã chốt giá"** | Đã chốt giá, sẵn sàng tạo yêu cầu đặt hàng | Cho phép tạo YCĐH |
| Đang xác nhận đơn hàng | **"Đang xác nhận đơn hàng"** | Yêu cầu đặt hàng đã được tạo, đang chờ xác nhận | Chờ chuyển trạng thái |
| Đã đóng | **"Đã đóng"** | Yêu cầu báo giá đã hoàn tất | Trạng thái kết thúc |
| Đã huỷ | **"Đã huỷ"** | Yêu cầu báo giá đã bị huỷ | Trạng thái kết thúc |

### 5.2 Bảng trạng thái Yêu cầu đặt hàng (PR)

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Chờ xác nhận | **"Chờ xác nhận"** | Chờ nhà cung cấp xác nhận | Cho phép huỷ |
| Chờ thanh toán | **"Chờ thanh toán"** | NCC đã xác nhận, chờ garage thanh toán | Cho phép thanh toán, huỷ |
| Chờ tạo đơn | **"Chờ tạo đơn"** | Đã thanh toán, chờ NCC tạo đơn hàng | Chờ chuyển trạng thái |
| Đã tạo đơn | **"Đã tạo đơn"** | NCC đã tạo đơn hàng mua tương ứng | Trạng thái kết thúc |
| Thiếu hàng | **"Thiếu hàng"** | NCC xác nhận thiếu hàng | Chờ NCC cập nhật |
| Đã huỷ | **"Đã hủy"** | Yêu cầu đặt hàng đã bị huỷ | Trạng thái kết thúc |

### 5.3 Trạng thái thanh toán Yêu cầu đặt hàng (PR)

| Trạng thái | Tên hiển thị |
|---|---|
| Chưa thanh toán | **"Chưa thanh toán"** |
| Đã thanh toán | **"Đã thanh toán"** |

### 5.4 Bảng trạng thái Đơn hàng mua (PO)

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Chờ xác nhận | **"Chờ xác nhận"** | Đơn hàng mới tạo, chờ xử lý | Cho phép chỉnh sửa, huỷ |
| Chuẩn bị hàng | **"Chuẩn bị hàng"** | Nhà cung cấp đang chuẩn bị hàng | Cho phép chỉnh sửa, huỷ, chuyển trạng thái |
| Đang giao hàng | **"Đang giao hàng"** | Hàng đang được vận chuyển | Cho phép chỉnh sửa, huỷ, chuyển trạng thái |
| Đã giao hàng | **"Đã giao hàng"** | Hàng đã giao đến garage | Cho phép chỉnh sửa, hoàn thành, hoàn hàng |
| Hoàn thành | **"Hoàn thành"** | Đơn hàng đã hoàn tất | Trạng thái kết thúc — không cho chỉnh sửa |
| Đã huỷ | **"Đã hủy"** | Đơn hàng đã bị huỷ | Trạng thái kết thúc — không cho chỉnh sửa |

### 5.5 Trạng thái thanh toán Đơn hàng mua (PO)

| Trạng thái | Tên hiển thị |
|---|---|
| Chưa thanh toán | **"Chưa thanh toán"** |
| Đã thanh toán | **"Đã thanh toán"** |

### 5.6 Nguồn đơn hàng mua (PO)

| Nguồn | Tên hiển thị | Mô tả |
|---|---|---|
| Mua ngoài | **"Mua ngoài"** | Đơn hàng garage tạo trực tiếp, không qua nền tảng |
| Nền tảng | **"Nền tảng"** | Đơn hàng sinh từ yêu cầu đặt hàng qua sàn |

### 5.7 Ma trận hành động theo trạng thái — Yêu cầu báo giá (QR)

| Trạng thái | Xem báo giá sơ bộ | Chọn phụ tùng | Gửi YCĐH | Nhân bản | Thay đổi nhà xe | Hỗ trợ |
|---|---|---|---|---|---|---|
| Mở | \* | — | — | ✓ | ✓ | ✓ |
| Đang hỏi giá | \* | — | — | ✓ | ✓ | ✓ |
| Đang chọn giá | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Đã chốt giá | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Đang xác nhận ĐH | ✓ | — | — | ✓ | ✓ | ✓ |
| Đã đóng | ✓ | — | — | ✓ | — | ✓ |
| Đã huỷ | — | — | — | ✓ | — | ✓ |

\* Xem báo giá sơ bộ chỉ hiển thị khi yêu cầu đã có báo giá sơ bộ.

### 5.8 Ma trận hành động theo trạng thái — Yêu cầu đặt hàng (PR)

| Trạng thái | Thanh toán | Huỷ YCĐH | Hỗ trợ (chat) |
|---|---|---|---|
| Chờ xác nhận | — | ✓ | ✓ |
| Chờ thanh toán | ✓ | ✓ | ✓ |
| Chờ tạo đơn | — | ✓ | ✓ |
| Đã tạo đơn | — | — | ✓ |
| Thiếu hàng | — | — | ✓ |
| Đã huỷ | — | — | ✓ |

### 5.9 Ma trận hành động theo trạng thái — Đơn hàng mua (PO)

| Trạng thái | Chỉnh sửa | Chuyển TT | Hoàn thành | Huỷ | Hoàn hàng | Cập nhật tài liệu |
|---|---|---|---|---|---|---|
| Chờ xác nhận | ✓ | ✓ | — | ✓ | — | ✓ |
| Chuẩn bị hàng | ✓ | ✓ | — | ✓ | — | ✓ |
| Đang giao hàng | ✓ | ✓ | — | ✓ | — | ✓ |
| Đã giao hàng | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Hoàn thành | — | — | — | — | — | ✓ |
| Đã huỷ | — | — | — | — | — | — |

## 6. Validation Rules

### 6.1 Form tạo yêu cầu báo giá (`FEAT-QR-CREATE`)

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Hãng xe | Có | — | **"Hãng xe là trường bắt buộc"** |
| Dòng xe | Có | Phụ thuộc hãng xe đã chọn | **"Dòng xe là trường bắt buộc"** |
| Năm sản xuất | Không | — | — |
| Phiên bản xe | Không | — | — |
| Số khung xe (Số VIN) | Không | — | — |
| Biển số xe | Không | Kiểm tra định dạng | **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"** |
| Công ty bảo hiểm | Không | — | — |
| Ghi chú | Không | — | — |
| Hình ảnh xe | Không | Tối đa 3 ảnh | — |
| Tên phụ tùng | Có (khi thêm) | Không được trùng | **"Vui lòng nhập Tên phụ tùng"** / **"Không được tạo phụ tùng giống nhau trong một yêu cầu báo giá"** |
| File import phụ tùng | Không | Chỉ file Excel, tối đa 30MB | **"Định dạng file không hợp lệ. Vui lòng upload file Excel."** / **"Dung lượng file quá 30MB. Vui lòng chọn file nhỏ hơn."** |
| Tên công ty (khi xuất HĐ) | Có (khi đánh dấu) | Tối đa 255 ký tự | **"Vui lòng nhập tên công ty."** |
| Mã số thuế (khi xuất HĐ) | Có (khi đánh dấu) | Tối đa 50 ký tự | **"Vui lòng nhập mã số thuế."** |
| Email công ty | Không | Định dạng email, tối đa 255 ký tự | **"Email công ty không đúng định dạng."** |
| Địa chỉ (khi xuất HĐ) | Có (khi đánh dấu) | Tối đa 255 ký tự | **"Vui lòng nhập địa chỉ."** |

**Điều kiện nút submit (Tạo yêu cầu báo giá):**
- Khả dụng (enabled): Hãng xe và dòng xe đã chọn, có ít nhất một phụ tùng hợp lệ, và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

### 6.2 Form tạo / chỉnh sửa đơn hàng (`FEAT-PO-CREATE`, `FEAT-PO-EDIT`)

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Nhà cung cấp | Có | Ô chọn có tìm kiếm | **"Nhà cung cấp là bắt buộc"** |
| Trạng thái | Có | 6 giá trị | **"Trạng thái đơn hàng là bắt buộc"** |
| Mức ưu tiên | Có | 3 giá trị: Bình thường, Gấp, Khẩn cấp | **"Mức ưu tiên là bắt buộc"** |
| Ngày giao dự kiến | Có | >= ngày hiện tại | **"Ngày giao dự kiến là bắt buộc"** / **"Ngày giao dự kiến không được nhỏ hơn ngày hiện tại"** |
| Phiếu dịch vụ liên kết | Không | Ô chọn có tìm kiếm | — |
| Số điện thoại liên hệ | Không | Tự động điền khi chọn NCC | — |
| Mã số thuế | Không | Tự động điền khi chọn NCC | — |
| Địa chỉ | Không | Tự động điền khi chọn NCC | — |
| Phương thức thanh toán | Không | Tự động điền khi chọn NCC | — |
| Ghi chú | Không | — | — |
| Tên phụ tùng | Có (khi thêm) | — | — |
| Đơn giá | Có | >= 0 | **"Vui lòng nhập đơn giá"** |
| Số lượng | Có | > 0 | — |
| Chiết khấu | Không | >= 0 và <= 100% | — |
| Tên sản phẩm (tạo mới) | Có | — | **"Tên sản phẩm không được để trống"** |
| Đơn vị (tạo mới) | Có | — | **"Đơn vị không được để trống"** |

**Điều kiện nút submit (Tạo / Lưu):**
- Khả dụng (enabled): Nhà cung cấp, trạng thái, mức ưu tiên, ngày giao dự kiến đã điền đủ; có ít nhất một phụ tùng với đơn giá; và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc, chưa có phụ tùng, hoặc đang gửi yêu cầu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-PROCUREMENT từ EP-PROCUREMENT v1 và 10 FEAT: QR-LIST v1, QR-CREATE v1, QR-DETAIL v1, PR-LIST v1, PR-CREATE v1, PR-DETAIL v1, PO-LIST v1, PO-CREATE v1, PO-DETAIL v1, PO-EDIT v1. Luồng 3 bước: QR → PR → PO. |
| 2026-05-20 | 2 | Business Authority | Sửa tiêu đề: "Mua hàng qua sàn" → "Mua hàng". |
