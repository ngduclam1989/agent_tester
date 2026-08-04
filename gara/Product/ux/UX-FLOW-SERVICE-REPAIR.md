---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 1
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-20"
---

# UX-FLOW-SERVICE-REPAIR: Tiếp nhận, sửa chữa xe

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-SERVICE-REPAIR` |
| Kind | FLOW |
| Referenced by | `FEAT-SO-LIST`, `FEAT-SO-CREATE`, `FEAT-SO-DETAIL`, `FEAT-SO-EDIT` |

## 1. Purpose

Luồng tiếp nhận, sửa chữa xe mô tả toàn bộ vòng đời vận hành phiếu dịch vụ xe (loại **"Dịch vụ xe"**) tại garage -- từ lúc phiếu được tạo (có hoặc không có lịch hẹn) đến khi hoàn thành sửa chữa và chuyển sang quyết toán. Bao gồm hành vi tự sinh lịch hẹn walk-in khi tạo phiếu không gắn lịch hẹn.

**Người thực hiện:** Chủ garage và Kế toán -- quyền ngang nhau trên toàn bộ luồng phiếu dịch vụ.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) -- giao diện vận hành cho garage. Khách hàng tương tác qua ứng dụng tài xế Driver+ (ngoài phạm vi luồng này).

**Phạm vi:** Luồng này chỉ bao gồm phiếu dịch vụ loại **"Dịch vụ xe"** (sửa chữa, bảo dưỡng, Car Spa). Phiếu bán lẻ phụ tùng thuộc luồng riêng.

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│              LUỒNG VẬN HÀNH PHIẾU DỊCH VỤ XE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TẠO PHIẾU DỊCH VỤ                                           │
│     Từ lịch hẹn (Xe đã đến) ────────────► Báo giá              │
│     Từ danh sách (Tạo mới) ─────────────► Báo giá              │
│     Walk-in (không gắn lịch hẹn) ────────► Báo giá             │
│       └─ Tự sinh lịch hẹn walk-in ──────► (Xe đã đến)          │
│                                                                 │
│  ② BÁO GIÁ (tại Chi tiết phiếu dịch vụ)                       │
│     Báo giá ──┬── Bắt đầu sửa chữa ────► Đang thực hiện       │
│               ├── Gửi báo giá ───────────► (Driver+)            │
│               ├── Chỉnh sửa ────────────► Form chỉnh sửa       │
│               └── Hủy phiếu (+ lý do) ──► Đã huỷ               │
│                                                                 │
│  ③ SỬA CHỮA                                                    │
│     Đang thực hiện ──┬── Hoàn thành ────► Hoàn thành            │
│                      ├── Chỉnh sửa ─────► Form chỉnh sửa       │
│                      ├── Gửi báo giá ───► (Driver+)             │
│                      └── Hủy phiếu ─────► Đã huỷ               │
│                                                                 │
│  ④ XÁC NHẬN TỪ DRIVER+ (tùy chọn)                              │
│     Báo giá ──── Khách xác nhận ────────► Đã xác nhận           │
│     Báo giá ──── Khách từ chối ─────────► Đã từ chối            │
│     Đã xác nhận ─── Hoàn thành ────────► Hoàn thành             │
│     Đã từ chối ──── Chỉnh sửa / Hủy ──► (tuỳ hành động)       │
│                                                                 │
│  ⑤ HOÀN THÀNH VÀ QUYẾT TOÁN                                    │
│     Hoàn thành ──── Tạo quyết toán ────► Đã tạo quyết toán     │
│                                          (→ EP-SETTLEMENT)      │
│                                                                 │
│  ⑥ CHỈNH SỬA (khi trạng thái cho phép)                         │
│     Báo giá / Đang thực hiện / Đã xác nhận / Đã từ chối        │
│     ── Form chỉnh sửa ─────────────────► Lưu / Gửi lại BG     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-BOOKING` | Lịch hẹn cung cấp thông tin khách hàng, xe và ghi chú ban đầu cho phiếu dịch vụ. Tự sinh lịch hẹn walk-in khi tạo phiếu không gắn lịch hẹn |
| Upstream | `EP-CUSTOMER` | Dữ liệu khách hàng và xe -- gợi ý khi tạo / chỉnh sửa phiếu |
| Upstream | `EP-CATALOG` | Danh mục dịch vụ và phụ tùng để thêm vào phiếu |
| Downstream | `EP-SETTLEMENT` | Tạo phiếu quyết toán từ phiếu dịch vụ đã hoàn thành |
| Downstream | `EP-INVENTORY-DELIVERY` | Xuất kho phụ tùng khi phiếu có phụ tùng nguồn từ kho |
| Bên ngoài | Driver+ | Gửi báo giá, nhận xác nhận/từ chối từ khách hàng |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu phiếu dịch vụ trên Web GMS | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách phiếu dịch vụ |
| 2 | Nút tạo phiếu dịch vụ trên Danh sách | Đang ở Danh sách phiếu dịch vụ, chọn loại **"Dịch vụ xe"** | Form tạo phiếu dịch vụ |
| 3 | Nhấn vào dòng phiếu dịch vụ xe trong danh sách | Đang ở Danh sách phiếu dịch vụ, phiếu loại **"Dịch vụ xe"** | Màn hình Chi tiết phiếu dịch vụ |
| 4 | Nút tạo phiếu dịch vụ trên Chi tiết lịch hẹn | Lịch hẹn ở trạng thái **"Xe đã đến"** và chưa có phiếu liên kết | Form tạo phiếu dịch vụ (thông tin lịch hẹn điền sẵn) |
| 5 | Tạo phiếu dịch vụ không gắn lịch hẹn (walk-in) | Từ Danh sách, không chọn lịch hẹn | Form tạo phiếu dịch vụ trống + tự sinh lịch hẹn walk-in |

## 3. Layout / Wireframe

> Luồng phiếu dịch vụ xe trên Web GMS gồm 4 màn hình chính. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình -- chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐     Tạo mới      ┌──────────────────┐
│  Danh sách       │─────────────────►│  Form tạo        │
│  phiếu dịch vụ   │                  │  phiếu dịch vụ   │
│ (FEAT-SO-LIST)   │◄─────────────────│ (FEAT-SO-CREATE) │
│                  │   Submit / Hủy   │                  │
└──┬───────────────┘                  └──────────────────┘
   │
   │ Xem chi tiết
   │ (nhấn vào dòng)
   ▼
┌──────────────────┐   Chỉnh sửa     ┌──────────────────┐
│  Chi tiết        │────────────────►│  Form chỉnh sửa  │
│  phiếu dịch vụ   │◄────────────────│  phiếu dịch vụ   │
│ (FEAT-SO-DETAIL) │   Lưu / Hủy    │ (FEAT-SO-EDIT)   │
│                  │                 └──────────────────┘
│ Tab:             │
│ • Dịch vụ &     │
│   phụ tùng      │
│ • Thông tin khác │   Tạo QT       ┌──────────────────┐
│ • Thông tin      │───────────────►│  Tạo quyết toán  │
│   liên kết      │                │ (→ EP-SETTLEMENT) │
│ • Lịch sử       │                └──────────────────┘
│   thanh toán    │
│                  │
│ Hành động:       │
│ • Bắt đầu SC    │
│ • Hoàn thành     │
│ • Hủy phiếu     │
│ • Gửi báo giá   │
│ • Ghi nhận TT   │
│ • In ấn         │
└──────────────────┘
```

**Nguồn tạo phiếu dịch vụ:**

```
┌──────────────────┐               ┌──────────────────┐
│  Lịch hẹn        │── Tạo PDV ──►│  Form tạo phiếu  │
│  (Xe đã đến)     │   (điền sẵn) │  dịch vụ         │
│  (→ EP-BOOKING)  │              │  (FEAT-SO-CREATE) │
├──────────────────┤              │                  │
│  Danh sách PDV   │── Tạo mới ──►│  + Walk-in:      │
│  (không gắn      │   (form trống)│  tự sinh lịch    │
│   lịch hẹn)      │              │  hẹn (Xe đã đến) │
└──────────────────┘              └──────────────────┘
```

### Cấu trúc tab trên màn hình Chi tiết

```
┌──────────────────────────────────────────────────────────┐
│  Chi tiết phiếu dịch vụ — {mã phiếu}     [badge TT]    │
├──────────────────────────────────────────────────────────┤
│  Thông tin dịch vụ và thanh toán                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Loại phiếu | TG dự kiến giao xe | Tổng tiền | TTTT │ │
│  └─────────────────────────────────────────────────────┘ │
│  Thông tin khách hàng                                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Tên KH | SĐT | Loại KH                             │ │
│  └─────────────────────────────────────────────────────┘ │
│  Thông tin xe                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Biển số | Hãng xe | Dòng xe | Số km đã chạy        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────┬──────────┬──────────┬──────────────────┐   │
│  │ Dịch vụ  │ Thông tin│ Thông tin│ Lịch sử          │   │
│  │ & phụ    │ khác     │ liên kết │ thanh toán       │   │
│  │ tùng     │          │          │                  │   │
│  └──────────┴──────────┴──────────┴──────────────────┘   │
│  (nội dung tab hiện tại)                                 │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [Chỉnh sửa] [Hủy] [Gửi báo giá] [Bắt đầu SC]     │ │
│  │ (các nút thay đổi theo trạng thái — xem §5.2)      │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu phiếu dịch vụ | Hiển thị bảng danh sách với 11 cột: Mã phiếu, Tên khách hàng, SĐT khách hàng, Biển số xe, Hãng xe, Dòng xe, Loại phiếu, Trạng thái phiếu, Trạng thái thanh toán, Ngày tạo, Thao tác |
| 2 | Nhập từ khóa vào ô tìm kiếm | Lọc theo mã phiếu, tên khách hàng, số điện thoại khách hàng hoặc biển số xe. Kết quả cập nhật tự động |
| 3 | Chọn bộ lọc trạng thái phiếu | Lọc theo một hoặc nhiều trạng thái: **"Báo giá"**, **"Đã xác nhận"**, **"Đã từ chối"**, **"Đang thực hiện"**, **"Hoàn thành"**, **"Đã huỷ"**, **"Đã xuất kho"**, **"Đã tạo quyết toán"** |
| 4 | Chọn bộ lọc loại phiếu | Lọc theo **"Dịch vụ xe"** hoặc **"Bán phụ tùng"** |
| 5 | Chọn bộ lọc trạng thái thanh toán | Lọc theo **"Chưa thanh toán"**, **"Thanh toán 1 phần"**, **"Đã thanh toán"** |
| 6 | Kết hợp nhiều bộ lọc và từ khóa đồng thời | Hệ thống áp dụng tất cả điều kiện đồng thời (AND) và hiển thị kết quả khớp |
| 7 | Nhấn vào dòng phiếu dịch vụ xe | Chuyển sang Chi tiết phiếu dịch vụ (xem §4.4) |
| 8 | Nhấn nút tạo phiếu dịch vụ mới | Chuyển sang Form tạo phiếu dịch vụ tương ứng loại phiếu (xem §4.2 cho loại **"Dịch vụ xe"**) |

**Trường hợp ngoại lệ:**
- Không có phiếu dịch vụ nào trong hệ thống → hiển thị thông báo **"Hiện chưa có phiếu dịch vụ nào trong hệ thống."**
- Tìm kiếm hoặc lọc không có kết quả → hiển thị thông báo **"Không tìm thấy phiếu dịch vụ phù hợp."**

### 4.2 Tạo phiếu dịch vụ (từ danh sách hoặc walk-in)

> FEAT tham chiếu: `FEAT-SO-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn nút tạo phiếu dịch vụ (loại **"Dịch vụ xe"**) trên Danh sách | Mở form trống **"Tạo phiếu dịch vụ"** gồm 7 mục: Thông tin chung, Thông tin khách hàng, Thông tin xe, Mô tả tình trạng xe & Ghi chú, Chi tiết dịch vụ thực hiện, Phụ tùng sử dụng, Tổng chi phí |
| 2 | Chọn nhân viên tạo phiếu (bắt buộc) | Ô chọn có tìm kiếm, placeholder: **"Chọn nhân viên tạo phiếu"** |
| 3 | Nhập thời gian dự kiến giao xe (không bắt buộc) | Ô nhập thời gian, placeholder: **"Nhập thời gian dự kiến giao xe"** |
| 4 | Chọn loại dịch vụ (bắt buộc) | Nhóm tùy chọn: **"Car Spa"**, **"Sửa chữa"**, **"Bảo dưỡng"** |
| 5 | Nhập SĐT khách hàng (bắt buộc) | Ô nhập có gợi ý, placeholder: **"Chọn/Nhập SĐT khách hàng"**. Gợi ý từ danh sách khách hàng đã có |
| 6 | Nhập tên khách hàng (bắt buộc) | Ô nhập có gợi ý, placeholder: **"Chọn/Nhập tên khách hàng"** |
| 7 | Chọn khách hàng từ gợi ý | Tự động điền SĐT và tên khách hàng. Nếu có xe đã lưu, gợi ý danh sách xe ở mục Thông tin xe |
| 8 | Chọn loại khách hàng | Mặc định **"Cá nhân"**. Nếu chọn **"Tổ chức"**: hiển thị thêm **"SĐT tổ chức"**, **"Tên tổ chức"** (placeholder: **"Nhập tên tổ chức"**), **"Mã số thuế"** |
| 9 | Nhập biển số xe (không bắt buộc) | Ô nhập có gợi ý xe từ khách hàng đã chọn. Chọn xe → tự điền Hãng xe, Dòng xe, Năm SX, Phiên bản, Số VIN |
| 10 | Chọn hãng xe (bắt buộc), dòng xe (bắt buộc) | Ô chọn có tìm kiếm. Dòng xe phụ thuộc hãng xe |
| 11 | Nhập thông tin xe bổ sung (không bắt buộc) | Năm sản xuất, Phiên bản xe, Số khung xe (Số VIN), Số km đã chạy (placeholder: **"Nhập số km đã chạy"**), Mức nhiên liệu (placeholder: **"Nhập mức nhiên liệu"**), Màu xe |
| 12 | Bật toggle bảo hiểm | Hiển thị thêm: Công ty bảo hiểm (bắt buộc), Số hợp đồng bảo hiểm (placeholder: **"Nhập số hợp đồng"**), Ngày hết hạn, SĐT liên hệ bảo hiểm, Người giám định (placeholder: **"Nhập tên người giám định"**) |
| 13 | Tải ảnh đăng kiểm (không bắt buộc) | Hệ thống nhận diện ảnh và tự động điền thông tin xe |
| 14 | Tải tài liệu đính kèm (không bắt buộc) | Tài liệu khác, Hồ sơ bảo lãnh, Biên bản bàn giao nhận xe |
| 15 | Nhập mô tả tình trạng xe, ghi chú (không bắt buộc) | Ô nhập dạng textarea |
| 16 | Thêm dòng dịch vụ | Mỗi dòng gồm: Tên dịch vụ, Người thực hiện, Bên thanh toán (C/I), SL, ĐVT, Đơn giá, CK% (mặc định **"0 %"**), Thành tiền (tự động). Cho phép thêm nhiều dòng |
| 17 | Thêm dòng phụ tùng | Mỗi dòng gồm: Tên phụ tùng, SL, ĐVT, Đơn giá, CK%, Thành tiền (tự động). Cho phép thêm nhiều dòng. Kiểm tra tồn kho (cảnh báo nếu không đủ, không chặn) |
| 18 | Nhấn nút submit (khi đủ trường bắt buộc) | Tạo phiếu thành công → trạng thái **"Báo giá"**, mã phiếu tự sinh. Toast: tiêu đề **"Thành công"**, mô tả **"Tạo phiếu dịch vụ thành công."**. Chuyển về Chi tiết phiếu vừa tạo |

**Trường hợp ngoại lệ:**
- Thiếu trường bắt buộc → nút submit bị mờ (disabled). Trường bắt buộc: Nhân viên tạo phiếu, Loại dịch vụ, SĐT khách hàng, Tên khách hàng, Hãng xe, Dòng xe.
- Biển số xe sai định dạng → thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.
- SĐT không đúng định dạng → thông báo lỗi: **"Số điện thoại không đúng định dạng"**.
- Bỏ trống nhân viên tạo phiếu → thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**.
- Bỏ trống SĐT khách hàng → thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
- Bỏ trống tên khách hàng → thông báo lỗi: **"Vui lòng nhập tên khách hàng."**.
- Bỏ trống hãng xe → thông báo lỗi: **"Vui lòng chọn hãng xe."**.
- Bỏ trống dòng xe → thông báo lỗi: **"Vui lòng chọn dòng xe."**.
- Bỏ trống công ty bảo hiểm (khi toggle bật) → thông báo lỗi: **"Vui lòng nhập tên công ty bảo hiểm."**.
- Chiết khấu ngoài khoảng 0%--100% → thông báo lỗi: **"Chiết khấu phải trong khoảng 0% - 100%"**.
- Số lượng bằng 0 hoặc âm → thông báo lỗi: **"Số lượng phải lớn hơn 0."**.
- Tạo thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút hủy bỏ → đóng form, quay về Danh sách. Dữ liệu không được lưu.

### 4.3 Tự sinh lịch hẹn walk-in khi tạo phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-CREATE` (AC-30), cross-module với `FEAT-BOOK-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage tạo phiếu dịch vụ loại **"Dịch vụ xe"** (sửa chữa / bảo dưỡng / Car Spa) mà không gắn lịch hẹn | Hệ thống tự động sinh lịch hẹn walk-in → trạng thái **"Xe đã đến"**, nguồn **"Walk-in"** |
| 2 | -- | Thời điểm xe đến = thời điểm tạo phiếu. Lịch hẹn liên kết tự động với phiếu dịch vụ vừa tạo |
| 3 | -- | Lịch hẹn walk-in xuất hiện trên Danh sách lịch hẹn Web GMS |

**Ghi chú:** Không áp dụng cho phiếu bán lẻ phụ tùng. Khi tạo phiếu từ lịch hẹn (trạng thái **"Xe đã đến"**) -- thông tin khách hàng và xe được điền sẵn, không tự sinh thêm lịch hẹn walk-in.

### 4.4 Xem chi tiết phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào dòng phiếu dịch vụ xe trên Danh sách | Mở Chi tiết phiếu dịch vụ với tiêu đề là mã phiếu |
| 2 | Màn hình được tải | Hiển thị mục **"Thông tin dịch vụ và thanh toán"**: Loại phiếu, Thời gian dự kiến giao xe, Tổng tiền, Trạng thái thanh toán. Nếu đã gửi báo giá → nhãn **"Đã gửi báo giá"** |
| 3 | -- | Hiển thị mục **"Thông tin khách hàng"**: Tên khách hàng, Số điện thoại, Loại khách hàng |
| 4 | -- | Hiển thị mục **"Thông tin xe"**: Biển số xe, Hãng xe, Dòng xe, Số km đã chạy |
| 5 | Chọn tab **"Dịch vụ & phụ tùng"** | Hiển thị bảng dịch vụ thực hiện và bảng phụ tùng sử dụng. Cuối bảng hiển thị dòng **"Tổng"**. Mục **"Tổng chi phí"** gồm: **"Tổng thành tiền dịch vụ"**, **"Tổng thành tiền phụ tùng"**, **"Tổng thành tiền"** kèm mô tả **"(Dịch vụ + Phụ tùng)"** |
| 6 | Chọn tab **"Thông tin khác"** | Hiển thị: Người tạo, Thời gian tạo phiếu. Tổ chức (nếu loại khách hàng **"Tổ chức"**). Bảo hiểm (nếu có). Thông tin xe bổ sung: Số VIN, Năm SX, Phiên bản, Mức nhiên liệu, Mô tả tình trạng xe, Ghi chú, Hình ảnh, Tài liệu |
| 7 | Chọn tab **"Thông tin liên kết"** | Hiển thị: Phiếu lịch hẹn liên kết, Yêu cầu báo giá liên kết, Đơn hàng ngoài sàn liên kết, Phiếu quyết toán liên kết, Phiếu xuất kho liên kết. Mỗi mục là liên kết dẫn đến chi tiết phiếu tương ứng (nếu có) |
| 8 | Chọn tab **"Lịch sử thanh toán"** | Hiển thị danh sách giao dịch thanh toán: Đã thanh toán, Còn lại. Nếu chưa có → thông báo **"Chưa có giao dịch thanh toán."** |
| 9 | -- | Hiển thị nút hành động phù hợp trạng thái (xem §5.2 ma trận hành động) |
| 10 | -- | Hiển thị các tùy chọn in: **"In báo giá"**, **"In lệnh sửa chữa"**, **"In phiếu dịch vụ"**, **"Tạo hình ảnh phiếu"** |

**Trường hợp ngoại lệ:**
- Phiếu không có lịch hẹn liên kết (walk-in) → tab **"Thông tin liên kết"** hiển thị trường **"Phiếu lịch hẹn liên kết"** trống.
- Phiếu không có bảo hiểm → mục bảo hiểm trong tab **"Thông tin khác"** không hiển thị.
- Phiếu không có dịch vụ hoặc phụ tùng → bảng hiển thị trống.

### 4.5 Bắt đầu sửa chữa

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-13, AC-14)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Báo giá"** | Hiển thị nút tiến hành (bắt đầu sửa chữa) |
| 2 | Nhấn nút tiến hành | Mở hộp thoại **"Xác nhận tiến hành dịch vụ"** với nội dung: **"Phiếu sẽ chuyển sang trạng thái"** **"Đang thực hiện"** kèm nút **"Hủy"** và **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** | Trạng thái → **"Đang thực hiện"**. Toast: tiêu đề **"Thành công"**, mô tả **"Tiến hành dịch vụ thành công."**. Các nút hành động cập nhật theo trạng thái mới |

**Trường hợp ngoại lệ:**
- Thất bại → toast **"Lỗi"**, trạng thái không thay đổi, hộp thoại đóng lại.

### 4.6 Hoàn thành phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-16, AC-17)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Đang thực hiện"** hoặc **"Đã xác nhận"** | Hiển thị nút **"Hoàn thành"** |
| 2 | Nhấn nút **"Hoàn thành"** | Mở hộp thoại **"Hoàn thành phiếu dịch vụ"** với nội dung: **"Bạn xác nhận hoàn thành phiếu dịch vụ?"** kèm dòng: **"Phiếu sẽ chuyển sang trạng thái"** **"Hoàn thành."** và nút **"Hủy"** / **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** | Trạng thái → **"Hoàn thành"**. Toast: tiêu đề **"Thành công"**, mô tả **"Hoàn thành dịch vụ thành công."**. Các nút hành động cập nhật theo trạng thái mới |

**Trường hợp ngoại lệ:**
- Thất bại → toast **"Lỗi"**, trạng thái không thay đổi, hộp thoại đóng lại.

### 4.7 Hủy phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-22, AC-23, AC-24)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái cho phép hủy (**"Báo giá"**, **"Đang thực hiện"**, **"Đã xác nhận"**, **"Đã từ chối"**) | Hiển thị nút **"Hủy"** |
| 2 | Nhấn nút **"Hủy"** | Mở hộp thoại **"Xác nhận hủy phiếu"** gồm trường **"Ghi chú"** với placeholder **"Nhập chi tiết lý do hủy"** (bắt buộc) và nút **"Hủy"** / **"Xác nhận"** |
| 3 | Nhập lý do và nhấn **"Xác nhận"** | Trạng thái → **"Đã huỷ"**. Toast: tiêu đề **"Thành công"**, mô tả **"Đã hủy phiếu thành công."**. Các nút hành động cập nhật theo trạng thái mới |

**Trường hợp ngoại lệ:**
- Bỏ trống lý do hủy → thông báo lỗi: **"Vui lòng nhập lý do hủy phiếu"**.
- Thất bại → toast **"Lỗi"**, trạng thái không thay đổi, hộp thoại đóng lại.

### 4.8 Gửi báo giá đến Driver+

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-25, AC-26)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái cho phép gửi báo giá (**"Báo giá"**, **"Đang thực hiện"**, **"Đã xác nhận"**) | Hiển thị nút **"Gửi báo giá"** |
| 2 | Nhấn nút **"Gửi báo giá"** | Mở hộp thoại **"Gửi báo giá đến Driver+"** với nội dung: **"Hệ thống sẽ gửi thông tin báo giá của phiếu dịch vụ {mã phiếu} đến ứng dụng của tài xế. Vui lòng kiểm tra các thông tin bắt buộc sau:"** kèm thông tin **"Tài xế"**, **"Xe"**, **"Mã lịch hẹn"** (nếu có), **"Tổng tiền"**. Nút **"Hủy"** và **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** | Toast: tiêu đề **"Thành công"**, mô tả **"Gửi báo giá thành công."**. Mục **"Thông tin dịch vụ và thanh toán"** hiển thị nhãn **"Đã gửi báo giá"** |

**Trường hợp ngoại lệ:**
- Phiếu không có dịch vụ hoặc phụ tùng đang hoạt động → gửi báo giá bị chặn.
- Phiếu không có lịch hẹn từ Driver+ → hộp thoại không hiển thị dòng **"Mã lịch hẹn"**.
- Thất bại → toast **"Lỗi"**, hộp thoại đóng lại.

### 4.9 Ghi nhận thanh toán

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-27, AC-28, AC-29, AC-30)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu có trạng thái thanh toán **"Chưa thanh toán"** hoặc **"Thanh toán 1 phần"** | Hiển thị nút ghi nhận thanh toán |
| 2 | Nhấn nút ghi nhận thanh toán | Mở hộp thoại ghi nhận thanh toán gồm: trường **"Số tiền"** (bắt buộc), trường **"Hình thức thanh toán"** (bắt buộc) |
| 3 | Nhập dữ liệu hợp lệ và xác nhận | Toast: tiêu đề **"Thành công"**, mô tả **"Ghi nhận thanh toán thành công."**. Tab **"Lịch sử thanh toán"** cập nhật giao dịch mới. Trạng thái thanh toán cập nhật tương ứng |

**Trường hợp ngoại lệ:**
- Bỏ trống số tiền → thông báo lỗi: **"Vui lòng nhập số tiền thanh toán."**.
- Số tiền không hợp lệ → thông báo lỗi: **"Số tiền thanh toán không hợp lệ."**.
- Số tiền lớn hơn số tiền còn lại → thông báo lỗi: **"Số tiền nhập vào lớn hơn số tiền khách cần trả."**.
- Không chọn hình thức thanh toán → thông báo lỗi: **"Vui lòng chọn hình thức thanh toán."**.
- Thất bại → toast **"Lỗi"**, hộp thoại giữ nguyên dữ liệu để thử lại.

### 4.10 Xác nhận / Từ chối báo giá từ Driver+

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-18, AC-21)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Khách hàng xác nhận báo giá trên Driver+ | Trạng thái phiếu chuyển sang **"Đã xác nhận"**. Danh sách và Chi tiết hiển thị trạng thái mới |
| 2 | Khách hàng từ chối báo giá trên Driver+ | Trạng thái phiếu chuyển sang **"Đã từ chối"**. Danh sách và Chi tiết hiển thị trạng thái mới |

**Ghi chú:** Không phải hành động trực tiếp của chủ garage/kế toán. Hệ thống nhận sự kiện từ Driver+ và cập nhật tự động.

### 4.11 Chỉnh sửa phiếu dịch vụ

> FEAT tham chiếu: `FEAT-SO-EDIT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái cho phép chỉnh sửa (**"Báo giá"**, **"Đang thực hiện"**, **"Đã xác nhận"**, **"Đã từ chối"**). Nhấn nút **"Chỉnh sửa"** | Chuyển sang form chỉnh sửa, dữ liệu hiện tại điền sẵn. Mã phiếu hiển thị chỉ đọc. Form gồm: Thông tin chung, Thông tin khách hàng, Thông tin xe, Chi tiết dịch vụ thực hiện, Phụ tùng sử dụng, Tổng chi phí |
| 2 | Thay đổi thông tin | Form hỗ trợ gợi ý khách hàng, xe, kiểm tra tồn kho -- tương tự form tạo |
| 3a | Nhấn nút lưu (phiếu chưa gửi báo giá, đủ trường bắt buộc) | Toast: tiêu đề **"Thành công"**, mô tả **"Cập nhật phiếu dịch vụ thành công."**. Quay về Chi tiết phiếu |
| 3b | Nhấn nút lưu (phiếu đã gửi báo giá trước đó) | Mở hộp thoại xác nhận: **"Bạn đã gửi báo giá trước đó. Mọi chỉnh sửa sẽ tạo báo giá mới và gửi lại cho khách hàng xác nhận. Bạn có chắc chắn muốn lưu?"** kèm nút **"Hủy"** và **"Lưu chỉnh sửa"** |
| 4 | Xác nhận gửi lại báo giá thành công | Toast: tiêu đề **"Thành công"**, mô tả **"Gửi báo giá thành công"**. Quay về Chi tiết phiếu |

**Trường hợp ngoại lệ:**
- Thiếu trường bắt buộc → nút lưu bị mờ (disabled). Trường bắt buộc: SĐT khách hàng, Tên khách hàng, Biển số xe, Hãng xe, Dòng xe, Nhân viên tạo phiếu.
- Biển số xe sai định dạng → thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.
- Bỏ trống biển số xe → thông báo lỗi: **"Vui lòng nhập biển số xe."**.
- Số VIN không hợp lệ → thông báo lỗi: **"Số VIN không hợp lệ"**.
- Thay đổi hãng xe → trường dòng xe và phiên bản xe được reset.
- Cập nhật thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Hủy bỏ"** → đóng form, quay về Chi tiết. Dữ liệu không được lưu.

### 4.12 Đặt hàng phụ tùng

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-32)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, tab **"Dịch vụ & phụ tùng"**, phiếu ở trạng thái cho phép đặt hàng | Hiển thị nút **"Đặt hàng"** trong mục **"Phụ tùng sử dụng"** |
| 2 | Nhấn nút **"Đặt hàng"** | Tạo yêu cầu báo giá phụ tùng (cross-module với `EP-PROCUREMENT`) |

**Trường hợp ngoại lệ:**
- Nút **"Đặt hàng"** không hiển thị khi phiếu ở trạng thái **"Hoàn thành"**, **"Đã tạo quyết toán"**, **"Đã huỷ"** hoặc **"Đã từ chối"**.
- Chưa chọn phụ tùng → thông báo **"Vui lòng chọn ít nhất một phụ tùng"**.
- Chưa chọn nhà cung cấp → thông báo **"Vui lòng chọn nhà cung cấp"**.

### 4.13 Chuyển tiếp: Tạo quyết toán

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-19), cross-module với `EP-SETTLEMENT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Hoàn thành"** | Hiển thị nút **"Tạo quyết toán"** |
| 2 | Nhấn nút **"Tạo quyết toán"** | Chuyển sang luồng tạo phiếu quyết toán (`EP-SETTLEMENT`). Sau khi tạo thành công → trạng thái phiếu chuyển sang **"Đã tạo quyết toán"** |

## 5. States

### 5.1 Bảng trạng thái phiếu dịch vụ xe

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Báo giá | **"Báo giá"** | Phiếu mới tạo, chờ bắt đầu sửa chữa hoặc gửi báo giá | Cho phép chỉnh sửa |
| Đang thực hiện | **"Đang thực hiện"** | Đang sửa chữa/bảo dưỡng/Car Spa | Cho phép chỉnh sửa |
| Đã xác nhận | **"Đã xác nhận"** | Khách hàng xác nhận báo giá qua Driver+ | Cho phép chỉnh sửa |
| Đã từ chối | **"Đã từ chối"** | Khách hàng từ chối báo giá qua Driver+ | Cho phép chỉnh sửa |
| Hoàn thành | **"Hoàn thành"** | Sửa chữa hoàn tất, sẵn sàng quyết toán | Không cho phép chỉnh sửa |
| Đã tạo quyết toán | **"Đã tạo quyết toán"** | Đã chuyển sang phiếu quyết toán | Trạng thái kết thúc |
| Đã huỷ | **"Đã huỷ"** | Phiếu bị hủy (bắt buộc nhập lý do) | Trạng thái kết thúc |

### 5.2 Ma trận hành động theo trạng thái

| Trạng thái | Bắt đầu SC | Hoàn thành | Hủy | Chỉnh sửa | Gửi BG | Tạo QT | Đặt hàng PT |
|---|---|---|---|---|---|---|---|
| Báo giá | ✓ | -- | ✓ | ✓ | ✓ | -- | ✓ |
| Đang thực hiện | -- | ✓ | ✓ | ✓ | ✓ | -- | ✓ |
| Đã xác nhận | -- | ✓ | ✓ | ✓ | ✓ | -- | ✓ |
| Đã từ chối | -- | -- | ✓ | ✓ | -- | -- | -- |
| Hoàn thành | -- | -- | -- | -- | -- | ✓ | -- |
| Đã tạo quyết toán | -- | -- | -- | -- | -- | -- | -- |
| Đã huỷ | -- | -- | -- | -- | -- | -- | -- |

**Ghi chú:**
- **Bắt đầu SC**: Chỉ từ trạng thái **"Báo giá"** sang **"Đang thực hiện"**.
- **Hoàn thành**: Từ **"Đang thực hiện"** hoặc **"Đã xác nhận"** sang **"Hoàn thành"**.
- **Tạo QT**: Chỉ từ **"Hoàn thành"** sang **"Đã tạo quyết toán"**.
- **Đặt hàng PT**: Không hiển thị khi phiếu ở trạng thái **"Hoàn thành"**, **"Đã tạo quyết toán"**, **"Đã huỷ"** hoặc **"Đã từ chối"**.

### 5.3 Bảng trạng thái thanh toán

| Trạng thái | Tên hiển thị | Mô tả |
|---|---|---|
| Chưa thanh toán | **"Chưa thanh toán"** | Chưa ghi nhận khoản thanh toán nào |
| Thanh toán 1 phần | **"Thanh toán 1 phần"** | Đã thanh toán một phần nhưng chưa đủ |
| Đã thanh toán | **"Đã thanh toán"** | Đã thanh toán đủ |

**Ghi chú:** Trạng thái thanh toán và trạng thái phiếu hoạt động độc lập -- phiếu có thể **"Đã thanh toán"** nhưng chưa **"Hoàn thành"**.

## 6. Validation Rules

> Áp dụng cho Form tạo (`FEAT-SO-CREATE`) và Form chỉnh sửa (`FEAT-SO-EDIT`).

### 6.1 Trường bắt buộc

| Trường | Form tạo | Form chỉnh sửa | Quy tắc | Thông báo lỗi |
|---|---|---|---|---|
| Nhân viên tạo phiếu | Bắt buộc | Bắt buộc | -- | **"Vui lòng chọn nhân viên tạo phiếu."** |
| Loại dịch vụ | Bắt buộc | Không bắt buộc | Chọn 1 trong 3: **"Car Spa"**, **"Sửa chữa"**, **"Bảo dưỡng"** | -- |
| SĐT khách hàng | Bắt buộc | Bắt buộc | Kiểm tra định dạng | **"Vui lòng nhập số điện thoại."** / **"Số điện thoại không đúng định dạng"** |
| Tên khách hàng | Bắt buộc | Bắt buộc | -- | **"Vui lòng nhập tên khách hàng."** |
| Hãng xe | Bắt buộc | Bắt buộc | -- | **"Vui lòng chọn hãng xe."** |
| Dòng xe | Bắt buộc | Bắt buộc | Phụ thuộc hãng xe | **"Vui lòng chọn dòng xe."** |
| Biển số xe | Không bắt buộc | Bắt buộc | Kiểm tra định dạng, tự chuyển chữ in hoa | **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"** / **"Vui lòng nhập biển số xe."** |

### 6.2 Trường không bắt buộc

| Trường | Quy tắc | Thông báo lỗi |
|---|---|---|
| Thời gian dự kiến giao xe | -- | -- |
| Năm sản xuất | -- | -- |
| Phiên bản xe | -- | -- |
| Số khung xe (Số VIN) | Kiểm tra định dạng (form chỉnh sửa) | **"Số VIN không hợp lệ"** |
| Số km đã chạy | -- | -- |
| Mức nhiên liệu | -- | -- |
| Màu xe | -- | -- |
| Mô tả tình trạng xe | -- | -- |
| Ghi chú | -- | -- |
| Hình ảnh xe | -- | -- |
| Tài liệu đính kèm | -- | -- |

### 6.3 Validation bảo hiểm

| Trường | Quy tắc | Thông báo lỗi |
|---|---|---|
| Công ty bảo hiểm | Bắt buộc khi toggle bảo hiểm bật | **"Vui lòng nhập tên công ty bảo hiểm."** |
| Số hợp đồng bảo hiểm | Không bắt buộc | -- |
| Ngày hết hạn | Không bắt buộc | -- |
| SĐT liên hệ bảo hiểm | Không bắt buộc | -- |
| Người giám định | Không bắt buộc | -- |
| Hồ sơ bảo lãnh | Không bắt buộc | -- |

### 6.4 Validation dịch vụ và phụ tùng

| Trường | Quy tắc | Thông báo lỗi |
|---|---|---|
| SL (số lượng) | Phải lớn hơn 0 | **"Số lượng phải lớn hơn 0."** |
| CK% (chiết khấu) | Từ 0% đến 100% | **"Chiết khấu phải trong khoảng 0% - 100%"** |
| Bên thanh toán | Tùy chọn I (bảo hiểm) chỉ hiển thị khi toggle bảo hiểm bật | -- |
| Thành tiền | Tự động tính = SL x Đơn giá x (1 - CK%) | -- |

### 6.5 Điều kiện nút submit

**Form tạo (nút tạo phiếu dịch vụ):**
- Khả dụng (enabled): 6 trường bắt buộc đã điền đủ (Nhân viên tạo phiếu, Loại dịch vụ, SĐT khách hàng, Tên khách hàng, Hãng xe, Dòng xe) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

**Form chỉnh sửa (nút lưu):**
- Khả dụng (enabled): 6 trường bắt buộc đã điền đủ (SĐT khách hàng, Tên khách hàng, Biển số xe, Hãng xe, Dòng xe, Nhân viên tạo phiếu) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-SERVICE-REPAIR từ EP-SERVICE-ORDER v1 và 4 FEAT: SO-LIST v1, SO-CREATE v1, SO-DETAIL v1, SO-EDIT v1. Phạm vi: phiếu dịch vụ xe (SERVICE) -- sửa chữa, bảo dưỡng, Car Spa. Bao gồm walk-in booking, gửi báo giá Driver+, ghi nhận thanh toán, đặt hàng phụ tùng, in ấn, chuyển tiếp quyết toán. |
