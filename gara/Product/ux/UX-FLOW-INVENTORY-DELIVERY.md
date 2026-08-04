---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-21"
---

# UX-FLOW-INVENTORY-DELIVERY: Xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-DELIVERY` |
| Kind | FLOW |
| Referenced by | `FEAT-ID-LIST`, `FEAT-ID-CREATE`, `FEAT-ID-DETAIL`, `FEAT-ID-EDIT` |

## 1. Purpose

Luồng xuất kho mô tả toàn bộ vòng đời vận hành phiếu xuất kho tại garage — từ lúc phiếu được tạo đến khi hoàn tất xuất kho hoặc hủy, với khả năng hoàn tác khi phát hiện sai sót. Phiếu xuất kho liên kết với phiếu dịch vụ để đối soát sản phẩm khi hoàn tất.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng xuất kho.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage.

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                  LUỒNG VẬN HÀNH XUẤT KHO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TẠO PHIẾU XUẤT KHO                                          │
│     Tạo thủ công qua form ── chọn phiếu dịch vụ                │
│     Hệ thống tự tạo ── từ phiếu dịch vụ                        │
│     (Nguồn xuất kế thừa từ phiếu dịch vụ: Mua ngoài / Nền tảng)│
│     Liên kết phiếu dịch vụ ── Bắt buộc                         │
│     Thêm sản phẩm xuất kho ── Ít nhất 1 sản phẩm              │
│     Tạo mới ──────────────────────────► Chờ duyệt              │
│                                                                 │
│  ② XỬ LÝ (tại Chi tiết phiếu xuất kho)                         │
│     Chờ duyệt ───┬─ Hoàn tất xuất kho ──► Đã duyệt            │
│                   │  (trừ tồn kho, đối                          │
│                   │   soát với PDV)                              │
│                   ├─ Hủy (+ lý do) ──────► Đã hủy              │
│                   └─ Chỉnh sửa ─────────► Chờ duyệt            │
│                                                                 │
│  ③ HOÀN TÁC (khi phát hiện sai sót)                            │
│     Đã duyệt ──── Hoàn tác ─────────────► Hoàn tác             │
│                    (cộng lại tồn kho,                           │
│                     điều chỉnh kỳ nếu                           │
│                     đã chốt)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-SERVICE-ORDER` | Phiếu xuất kho liên kết phiếu dịch vụ — đối soát sản phẩm khi hoàn tất xuất kho |
| Upstream | `EP-CATALOG` | Danh mục sản phẩm (phụ tùng) để thêm vào phiếu xuất kho |
| Downstream | `EP-INVENTORY-PERIOD` | Tồn kho theo kỳ được tính từ phiếu xuất kho đã duyệt. Hoàn tác phiếu sau khi chốt kỳ → điều chỉnh tồn kho kỳ |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu quản lý kho trên Web GMS | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách phiếu xuất kho |
| 2 | Nút **"Tạo phiếu xuất kho mới"** trên Danh sách | Đang ở Danh sách phiếu xuất kho | Form tạo phiếu xuất kho |
| 3 | Nhấn vào một phiếu xuất kho trong danh sách | Đang ở Danh sách phiếu xuất kho | Màn hình Chi tiết phiếu xuất kho |
| 4 | Nút sửa trong cột Thao tác trên Danh sách | Phiếu ở trạng thái **"Chờ duyệt"** | Form chỉnh sửa phiếu xuất kho |
| 5 | Nút **"Chỉnh sửa"** trên Chi tiết | Phiếu ở trạng thái **"Chờ duyệt"** | Form chỉnh sửa phiếu xuất kho |
| 6 | Nút **"Tạo phiếu"** trên Chi tiết | Đang ở Chi tiết phiếu xuất kho | Form tạo phiếu xuất kho mới |

## 3. Layout / Wireframe

> Luồng xuất kho trên Web GMS gồm 4 màn hình chính. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐     Tạo mới      ┌──────────────────┐
│  Danh sách       │─────────────────►│  Form tạo        │
│  phiếu xuất kho  │                  │  phiếu xuất kho  │
│ (FEAT-ID-LIST)   │◄─────────────────│ (FEAT-ID-CREATE) │
│                  │  Tạo mới / Huỷ bỏ│                  │
└──┬───────────────┘                  └──────────────────┘
   │
   │ Xem chi tiết
   │ (hoặc Chỉnh sửa
   │  từ cột Thao tác *)
   ▼
┌──────────────────┐   Chỉnh sửa     ┌──────────────────┐
│  Chi tiết        │────────────────►│  Form chỉnh sửa  │
│  phiếu xuất kho  │◄────────────────│  phiếu xuất kho  │
│ (FEAT-ID-DETAIL) │   Lưu / Huỷ bỏ │ (FEAT-ID-EDIT)   │
│                  │                 └──────────────────┘
│ Hành động:       │
│ • Hoàn tất       │   Tạo phiếu     ┌──────────────────┐
│ • Hủy            │────────────────►│  Form tạo        │
│ • Hoàn tác       │                 │  phiếu xuất kho  │
│ • In phiếu       │                 │ (FEAT-ID-CREATE) │
│ • Tạo phiếu      │                 └──────────────────┘
└──────────────────┘

(*) Chỉnh sửa từ cột Thao tác trên Danh sách đi thẳng đến
    Form chỉnh sửa; sau khi Lưu → quay về Chi tiết phiếu xuất kho.
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu quản lý kho, mục xuất kho | Hiển thị bảng danh sách với 10 cột: Mã phiếu xuất kho, Nguồn xuất, Mã phiếu dịch vụ, Trạng thái, Phụ tùng xuất, Tên khách hàng, Người tạo, Người duyệt, Ngày tạo, Thao tác |
| 2 | Nhập từ khóa vào ô tìm kiếm | Lọc theo mã phiếu xuất kho hoặc mã phiếu dịch vụ. Placeholder: **"Tìm theo mã phiếu xuất kho, mã phiếu dịch vụ"** |
| 3 | Chọn bộ lọc (trạng thái, nguồn xuất, ngày tạo) | Danh sách cập nhật theo tiêu chí đã chọn |
| 4 | Nhấn vào một phiếu xuất kho | Chuyển sang Chi tiết phiếu xuất kho (xem 4.4) |
| 5 | Nhấn nút **"Tạo phiếu xuất kho mới"** | Chuyển sang Form tạo phiếu xuất kho (xem 4.2) |
| 6 | Nhấn nút sửa trong cột Thao tác | Chuyển sang Form chỉnh sửa (xem 4.8) — chỉ hiển thị khi trạng thái **"Chờ duyệt"** |
| 7 | Nhấn vào giá trị Phụ tùng xuất của một phiếu | Mở modal **"Danh sách sản phẩm trong phiếu xuất kho"** với các cột: Tên phụ tùng, Mã Genuine, Phân khúc, Xuất xứ, Đơn vị kho, SL xuất, Đơn vị bán, Quy đổi. Nút **"Đóng"** để đóng modal |
| 8 | Nhấn nút **"Xuất file"** | Tải xuống file danh sách phiếu xuất kho theo điều kiện lọc hiện tại |

**Trường hợp ngoại lệ:**
- Không có phiếu xuất kho nào → hiển thị thông báo danh sách trống.
- Tìm kiếm không có kết quả → hiển thị thông báo danh sách trống.
- Phiếu xuất kho không gắn phiếu dịch vụ → cột **"Mã phiếu dịch vụ"** hiển thị trống.
- Phiếu xuất kho không gắn khách hàng → cột **"Tên khách hàng"** hiển thị trống.

### 4.2 Tạo phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn **"Tạo phiếu xuất kho mới"** trên Danh sách (hoặc **"Tạo phiếu"** trên Chi tiết) | Mở form trống gồm 2 mục: Thông tin phiếu xuất kho, Danh sách sản phẩm xuất kho. Form không có trường chọn nguồn — nguồn xuất kế thừa từ phiếu dịch vụ liên kết |
| 2 | Nhập hoặc tìm kiếm mã phiếu dịch vụ | Ô chọn có tìm kiếm. Placeholder: **"Tìm kiếm mã phiếu dịch vụ"**. Bắt buộc |
| 3 | Nhập mã lô hàng (không bắt buộc) | Ô nhập text. Placeholder: **"Nhập mã lô hàng"** |
| 4 | Nhập ghi chú (không bắt buộc) | Ô nhập textarea. Placeholder: **"Nhập ghi chú"** |
| 5 | Tải tệp đính kèm (không bắt buộc) | Tối đa 5 tệp, mỗi tệp tối đa 30 MB. Thông báo: **"(Tối đa 5 tệp (30mb/tệp))"** |
| 6 | Chọn sản phẩm từ danh mục | Placeholder: **"Chọn"**. Sản phẩm thêm vào bảng với cột: Tên phụ tùng, Mã Genuine, Phân khúc, Xuất xứ, Đơn vị kho, Giá vốn, Số lượng, Số lượng theo đơn vị kho, Giá vốn trên 1 đơn vị kho, Thao tác |
| 7 | Nhập số lượng, đơn vị kho, giá vốn cho từng sản phẩm | Bắt buộc cho mỗi sản phẩm. Tổng giá trị tự động cập nhật cuối bảng |
| 8 | Nhấn nút **"Tạo mới"** (khi đủ trường bắt buộc) | Tạo phiếu xuất kho → trạng thái **"Chờ duyệt"**, mã tự sinh |
| 9 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Tạo phiếu xuất kho thành công."** |

**Trường hợp ngoại lệ:**
- Bỏ trống mã phiếu dịch vụ → thông báo lỗi: **"Vui lòng nhập mã phiếu dịch vụ."**.
- Danh sách sản phẩm trống → thông báo lỗi: **"Vui lòng thêm ít nhất một sản phẩm."**.
- Sản phẩm thiếu thông tin bắt buộc → thông báo lỗi: **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."**.
- Số lượng trống hoặc không hợp lệ → thông báo lỗi: **"Vui lòng nhập số lượng."** hoặc **"Số lượng phải lớn hơn hoặc bằng 0."**.
- Đơn vị kho trống → thông báo lỗi: **"Vui lòng nhập đơn vị kho."**.
- Giá vốn không hợp lệ → thông báo lỗi: **"Vui lòng nhập giá vốn."** hoặc **"Vui lòng nhập giá vốn lớn hơn hoặc bằng 0"**.
- Nguồn xuất là **"Nền tảng"** và số lượng xuất vượt quá số lượng đặt hàng → thông báo lỗi: **"Số lượng xuất không được vượt quá số lượng đặt hàng."**.
- Thiếu trường bắt buộc → nút **"Tạo mới"** bị mờ (disabled).
- Tạo thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → đóng form, quay về Danh sách. Dữ liệu đã nhập không được lưu.

### 4.3 Xem sản phẩm trong phiếu từ danh sách

> FEAT tham chiếu: `FEAT-ID-LIST` (AC-10)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào giá trị phụ tùng xuất của một phiếu trên Danh sách | Mở modal **"Danh sách sản phẩm trong phiếu xuất kho"** |
| 2 | — | Hiển thị bảng sản phẩm với các cột: Tên phụ tùng, Mã Genuine, Phân khúc, Xuất xứ, Đơn vị kho, SL xuất, Đơn vị bán, Quy đổi |
| 3 | Nhấn nút **"Đóng"** | Đóng modal, quay về Danh sách |

### 4.4 Xem chi tiết phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào phiếu xuất kho trên Danh sách | Mở Chi tiết phiếu xuất kho |
| 2 | Màn hình được tải | Hiển thị mục **"Thông tin phiếu xuất kho"** gồm: Mã phiếu dịch vụ, Mã lô hàng, Nguồn, Tên khách hàng, Ghi chú nội bộ. Trạng thái hiển thị dưới dạng badge |
| 3 | — | Hiển thị danh sách sản phẩm xuất kho (tên phụ tùng, mã genuine, phân khúc, xuất xứ, đơn vị kho, số lượng xuất, giá vốn khi xuất) |
| 4 | — | Hiển thị mục **"Tổng kết"**: **"Tổng số sản phẩm"** và **"Tổng giá trị phiếu xuất"** |
| 5 | — | Hiển thị nút hành động phù hợp trạng thái (xem 5.2 ma trận hành động) |

**Trường hợp ngoại lệ:**
- Mã phiếu xuất kho không tồn tại → thông báo: **"Không tìm thấy phiếu xuất kho"**.
- Phiếu có sản phẩm đã bị xóa khỏi danh mục → thông tin sản phẩm vẫn hiển thị theo dữ liệu đã lưu tại thời điểm tạo phiếu.

### 4.5 Hoàn tất xuất kho

> FEAT tham chiếu: `FEAT-ID-DETAIL` (Nhóm B)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở **"Chờ duyệt"** | Hiển thị nút **"Hoàn tất"** |
| 2 | Nhấn nút **"Hoàn tất"** và xác nhận hành động | Trạng thái → **"Đã duyệt"**. Số lượng tồn kho của các sản phẩm trong phiếu giảm tương ứng |
| 3 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Xác nhận xuất kho thành công."** |
| 4 | — | Nút **"Hoàn tất"** và **"Hủy"** biến mất → hiển thị nút **"Hoàn tác"** |

**Đối soát phiếu dịch vụ:** Khi hoàn tất, hệ thống kiểm tra phiếu dịch vụ liên kết — phiếu dịch vụ phải tồn tại và không bị hủy, sản phẩm và số lượng phải khớp. Nếu không khớp, hệ thống trả kết quả với cờ cảnh báo chênh lệch (không chặn thao tác hoàn tất).

**Trường hợp ngoại lệ:**
- Xác nhận xuất kho thất bại → toast **"Lỗi"**, trạng thái giữ nguyên **"Chờ duyệt"**.

### 4.6 Hủy phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-DETAIL` (Nhóm C)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở **"Chờ duyệt"** | Hiển thị nút **"Hủy"** |
| 2 | Nhấn nút **"Hủy"** | Mở modal yêu cầu nhập lý do hủy phiếu. Placeholder: **"Nhập lý do hủy phiếu"** |
| 3 | Nhập lý do và xác nhận hủy | Trạng thái → **"Đã hủy"** |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Hủy phiếu xuất kho thành công."** |
| 5 | — | Nút **"Hoàn tất"** và **"Hủy"** biến mất. Phiếu không còn cho phép chỉnh sửa |

**Trường hợp ngoại lệ:**
- Hủy phiếu thất bại → toast **"Lỗi"**, trạng thái giữ nguyên **"Chờ duyệt"**.

### 4.7 Hoàn tác phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-DETAIL` (Nhóm D)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở **"Đã duyệt"** | Hiển thị nút **"Hoàn tác"** |
| 2 | Nhấn nút **"Hoàn tác"** và xác nhận hành động | Trạng thái → **"Hoàn tác"**. Số lượng tồn kho của các sản phẩm trong phiếu tăng trở lại tương ứng |
| 3 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Hoàn tác phiếu xuất kho thành công."** |
| 4 | — | Nút **"Hoàn tác"** biến mất |

**Ghi chú:** Nếu kỳ kho đã đóng, hệ thống vẫn cho phép hoàn tác và kích hoạt điều chỉnh tồn kho kỳ.

**Trường hợp ngoại lệ:**
- Hoàn tác thất bại → toast **"Lỗi"**, trạng thái giữ nguyên **"Đã duyệt"**.

### 4.8 Chỉnh sửa phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-EDIT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết hoặc cột Thao tác trên Danh sách, phiếu ở **"Chờ duyệt"** | Chuyển sang form chỉnh sửa, dữ liệu hiện tại đã điền sẵn (2 mục: Thông tin phiếu xuất kho, Danh sách sản phẩm xuất kho) |
| 2 | Thay đổi mã phiếu dịch vụ, mã lô hàng, ghi chú, tệp đính kèm | Form hỗ trợ tìm kiếm phiếu dịch vụ — tương tự form tạo. Giá trị hiện tại được điền sẵn |
| 3 | Thêm, xóa hoặc thay đổi sản phẩm trong danh sách | Bảng sản phẩm với dữ liệu hiện tại điền sẵn. Placeholder thêm sản phẩm: **"Chọn"** |
| 4 | Nhấn **"Lưu"** (khi đủ trường bắt buộc) | Cập nhật phiếu xuất kho thành công. Trạng thái giữ nguyên **"Chờ duyệt"** |
| 5 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Cập nhật phiếu xuất kho thành công."**. Quay về Chi tiết phiếu xuất kho |

**Trường hợp ngoại lệ:**
- Phiếu đã chuyển trạng thái (bởi người dùng khác) trong khi đang chỉnh sửa → lưu thất bại do phiếu không còn ở trạng thái **"Chờ duyệt"**.
- Cập nhật thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → đóng form, quay về Chi tiết. Các thay đổi chưa lưu bị hủy bỏ.
- Validation form: áp dụng toàn bộ quy tắc tương tự form tạo (xem 4.2 trường hợp ngoại lệ).

### 4.9 In phiếu xuất kho

> FEAT tham chiếu: `FEAT-ID-DETAIL` (AC-13)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, nhấn nút **"In phiếu"** | Hệ thống xuất phiếu xuất kho dưới dạng PDF và mở giao diện in |

**Ghi chú:** Nút **"In phiếu"** hiển thị ở trạng thái **"Chờ duyệt"**, **"Đã duyệt"** và **"Hoàn tác"**. Phiếu ở trạng thái **"Đã hủy"** không hiển thị nút **"In phiếu"**.

### 4.10 Xuất file danh sách

> FEAT tham chiếu: `FEAT-ID-LIST` (AC-12)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Danh sách, nhấn nút **"Xuất file"** | Hệ thống tải xuống file danh sách phiếu xuất kho theo điều kiện lọc hiện tại |
| 2 | — | File bao gồm: Mã phiếu xuất kho, Nguồn xuất, Mã phiếu dịch vụ, Mã đơn bán hàng, Trạng thái, Danh sách phụ tùng xuất kho (Tên, SKU, Phân khúc, Số lượng xuất, Đơn vị, Giá vốn khi xuất), Ngày tạo, Ngày hoàn tất, Người hoàn tất, Ngày hoàn tác, Người hoàn tác, Ngày hủy, Người hủy, Lý do hủy |

## 5. States

### 5.1 Bảng trạng thái

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Chờ duyệt | **"Chờ duyệt"** | Phiếu vừa tạo, chờ xác nhận xuất kho | Cho phép chỉnh sửa |
| Đã duyệt | **"Đã duyệt"** | Đã xác nhận xuất kho, tồn kho đã giảm | Cho phép hoàn tác |
| Đã hủy | **"Đã hủy"** | Phiếu đã bị hủy, tồn kho không bị ảnh hưởng | Trạng thái kết thúc |
| Hoàn tác | **"Hoàn tác"** | Phiếu đã được hoàn tác, tồn kho đã cộng trả | Trạng thái kết thúc |

### 5.2 Ma trận hành động theo trạng thái

| Trạng thái | Hoàn tất | Hủy | Hoàn tác | Chỉnh sửa | In phiếu | Tạo phiếu |
|---|---|---|---|---|---|---|
| Chờ duyệt | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| Đã duyệt | — | — | ✓ | — | ✓ | ✓ |
| Đã hủy | — | — | — | — | — | ✓ |
| Hoàn tác | — | — | — | — | ✓ | ✓ |

### 5.3 Nguồn xuất

| Nguồn xuất | Tên hiển thị | Enum backend | Mô tả | Đặc thù |
|---|---|---|---|---|
| Mua ngoài | **"Mua ngoài"** | DIRECT | Kế thừa từ phiếu dịch vụ có phụ tùng mua ngoài nền tảng | Sản phẩm chọn từ danh mục |
| Nền tảng | **"Nền tảng"** | ECOMMERCE | Kế thừa từ phiếu dịch vụ có phụ tùng mua qua nền tảng | Sản phẩm tham chiếu từ phiếu dịch vụ, số lượng xuất không được vượt quá số lượng đặt hàng |

> Nguồn xuất kế thừa từ phiếu dịch vụ liên kết — form không có trường chọn nguồn riêng. Cả hai nguồn đều tạo thủ công qua form được (tùy nguồn của phiếu dịch vụ liên kết) và cũng có thể được hệ thống tự tạo.

## 6. Validation Rules

> Áp dụng cho Form tạo (`FEAT-ID-CREATE`) và Form chỉnh sửa (`FEAT-ID-EDIT`).

### 6.1 Mục Thông tin phiếu xuất kho

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Mã phiếu dịch vụ | Có | Tìm kiếm và chọn từ danh sách phiếu dịch vụ | **"Vui lòng nhập mã phiếu dịch vụ."** |
| Mã lô hàng | Không | — | — |
| Ghi chú | Không | — | — |
| Tệp đính kèm | Không | Tối đa 5 tệp, mỗi tệp tối đa 30 MB | — |

### 6.2 Mục Danh sách sản phẩm xuất kho

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Danh sách sản phẩm | Có | Ít nhất một sản phẩm | **"Vui lòng thêm ít nhất một sản phẩm."** |
| Tên phụ tùng (mỗi dòng) | Có | Chọn từ danh mục | **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."** |
| Số lượng (mỗi dòng) | Có | >= 0 | **"Vui lòng nhập số lượng."** / **"Số lượng phải lớn hơn hoặc bằng 0."** |
| Đơn vị kho (mỗi dòng) | Có | — | **"Vui lòng nhập đơn vị kho."** |
| Giá vốn (mỗi dòng) | Không | >= 0 (nếu nhập) | **"Vui lòng nhập giá vốn."** / **"Vui lòng nhập giá vốn lớn hơn hoặc bằng 0"** |
| Số lượng xuất (nguồn **"Nền tảng"**) | Có | Không vượt quá số lượng đặt hàng | **"Số lượng xuất không được vượt quá số lượng đặt hàng."** |

### 6.3 Điều kiện nút submit

**Form tạo — nút "Tạo mới":**
- Khả dụng (enabled): trường bắt buộc đã điền đủ (Mã phiếu dịch vụ, ít nhất một sản phẩm với đầy đủ thông tin) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

**Form chỉnh sửa — nút "Lưu":**
- Khả dụng (enabled): trường bắt buộc đã điền đủ (Mã phiếu dịch vụ, ít nhất một sản phẩm với đầy đủ thông tin) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-DELIVERY từ EP-INVENTORY-DELIVERY v1 và 4 FEAT: LIST v1, CREATE v1, DETAIL v1, EDIT v1. Vòng đời 4 trạng thái: Chờ duyệt → Đã duyệt/Đã hủy, Đã duyệt → Hoàn tác. Đối soát phiếu dịch vụ khi hoàn tất — cờ chênh lệch không chặn. |
| 2026-05-21 | 2 | Business Authority | Sửa §4.9 ghi chú + §5.2 ma trận: ẩn nút "In phiếu" ở trạng thái "Đã hủy" — phiếu đã hủy không được in. |
| 2026-05-21 | 3 | Business Authority | Xóa trường chọn nguồn xuất khỏi form (§4.2), cập nhật §6.1 + §6.3 validation. |
| 2026-05-21 | 4 | Business Authority | Sửa §1 sơ đồ, §4.2, §5.3: nguồn xuất kế thừa từ phiếu dịch vụ liên kết (DIRECT = Mua ngoài, ECOMMERCE = Nền tảng) — cả hai nguồn đều tạo thủ công được. Hệ thống tự tạo là kênh bổ sung. |
