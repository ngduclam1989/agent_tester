---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-21"
---

# UX-FLOW-INVENTORY-RECEIPT: Nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INVENTORY-RECEIPT` |
| Kind | FLOW |
| Referenced by | `FEAT-IR-LIST`, `FEAT-IR-CREATE`, `FEAT-IR-DETAIL`, `FEAT-IR-EDIT` |

## 1. Purpose

Luồng nhập kho mô tả toàn bộ vòng đời vận hành phiếu nhập kho tại garage — từ lúc tạo phiếu, chờ duyệt, hoàn tất nhập kho (cộng tồn kho), đến huỷ hoặc hoàn tác khi phát hiện sai sót. Nguồn nhập gồm hai loại: **"Mua ngoài"** (đơn hàng mua từ bên ngoài nền tảng) và **"Nền tảng"** (đơn hàng mua qua nền tảng) — nguồn nhập kế thừa từ đơn hàng mua liên kết, form không có trường chọn nguồn riêng.

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng nhập kho.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage.

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                  LUỒNG VẬN HÀNH NHẬP KHO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TẠO PHIẾU NHẬP KHO                                          │
│     Tạo thủ công qua form ─────────────────► Chờ duyệt         │
│     Hệ thống tự tạo (từ đơn hàng mua) ───► Chờ duyệt         │
│     (Nguồn nhập kế thừa từ đơn hàng: Mua ngoài / Nền tảng)    │
│                                                                 │
│  ② XỬ LÝ (tại Chi tiết phiếu nhập kho)                         │
│     Chờ duyệt ──┬─ Hoàn tất ───────────────► Đã duyệt          │
│                  ├─ Huỷ (+ lý do) ──────────► Đã huỷ            │
│                  └─ Chỉnh sửa ──────────────► Chờ duyệt         │
│                                                                 │
│  ③ HOÀN TÁC (khi phát hiện sai sót)                            │
│     Đã duyệt ──── Hoàn tác (+ lý do) ─────► Hoàn tác           │
│                                                                 │
│  ④ IN PHIẾU (trừ Đã huỷ)                                       │
│     Chờ duyệt / Đã duyệt / Hoàn tác                            │
│     ── In phiếu ───────────────────────────► Xuất PDF           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-PROCUREMENT` | Phiếu nhập kho nguồn **"Nền tảng"** liên kết với đơn hàng mua — sản phẩm nhập tham chiếu từ đơn hàng |
| Upstream | `EP-CATALOG` | Danh mục sản phẩm (phụ tùng) để thêm vào phiếu nhập kho |
| Downstream | `EP-INVENTORY-PERIOD` | Tồn kho theo kỳ được tính từ phiếu nhập kho đã duyệt. Hoàn tác phiếu duyệt sau khi chốt kỳ tự động tạo điều chỉnh kho |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu quản lý kho trên Web GMS | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách phiếu nhập kho |
| 2 | Nút **"Tạo phiếu nhập kho mới"** trên Danh sách | Đang ở Danh sách phiếu nhập kho | Form tạo phiếu nhập kho |
| 3 | Nhấn vào một phiếu trong danh sách | Đang ở Danh sách phiếu nhập kho | Màn hình Chi tiết phiếu nhập kho |
| 4 | Nút chỉnh sửa trên Danh sách (cột Thao tác) | Phiếu ở trạng thái **"Chờ duyệt"** | Form chỉnh sửa phiếu nhập kho |
| 5 | Nút **"Chỉnh sửa"** trên Chi tiết | Phiếu ở trạng thái **"Chờ duyệt"** | Form chỉnh sửa phiếu nhập kho |

## 3. Layout / Wireframe

> Luồng nhập kho trên Web GMS gồm 4 màn hình chính. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐     Tạo mới      ┌──────────────────┐
│  Danh sách       │─────────────────►│  Form tạo        │
│  phiếu nhập kho  │                  │  phiếu nhập kho  │
│ (FEAT-IR-LIST)   │◄─────────────────│ (FEAT-IR-CREATE) │
│                  │   Tạo mới / Huỷ  └──────────────────┘
└──┬───────────────┘    bỏ
   │
   │ Xem chi tiết
   │ (hoặc Chỉnh sửa
   │  từ cột Thao tác *)
   ▼
┌──────────────────┐   Chỉnh sửa     ┌──────────────────┐
│  Chi tiết        │────────────────►│  Form chỉnh sửa  │
│  phiếu nhập kho  │◄────────────────│  phiếu nhập kho  │
│ (FEAT-IR-DETAIL) │   Lưu / Huỷ bỏ │ (FEAT-IR-EDIT)   │
│                  │                 └──────────────────┘
│ Hành động:       │
│ • Hoàn tất       │
│ • Huỷ            │
│ • Hoàn tác       │
│ • In phiếu       │
└──────────────────┘

(*) Chỉnh sửa từ cột Thao tác trên Danh sách đi thẳng đến
    Form chỉnh sửa; sau khi Lưu → quay về Chi tiết phiếu nhập kho.
```

### Chi tiết màn hình: Chi tiết phiếu nhập kho

```
┌─────────────────────────────────────────────────────────────┐
│  Phiếu nhập kho — {Mã phiếu}          [badge Trạng thái]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Thông tin phiếu nhập kho ────────────────────────────┐ │
│  │ Nguồn:           Mua ngoài / Nền tảng                 │ │
│  │ Liên kết PO:     {Mã đơn hàng}                        │ │
│  │ Mã lô hàng:      {Mã lô}                              │ │
│  │ Tên nhà cung cấp: {Tên NCC}                           │ │
│  │ Tạo phiếu:       {Người tạo} — {Ngày tạo}             │ │
│  │ Hoàn tất:        {Người duyệt} — {Ngày duyệt}         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Danh sách sản phẩm nhập kho ────────────────────────┐ │
│  │ Tên phụ tùng | Mã Genuine | Phân khúc | Xuất xứ |    │ │
│  │ Đơn vị nhập | Quy đổi | Đơn vị kho | Số lượng |      │ │
│  │ Giá nhập | Giá bán gợi ý | ...                        │ │
│  │ ──────────────────────────────────────────             │ │
│  │ (dòng sản phẩm 1)                                     │ │
│  │ (dòng sản phẩm 2)                                     │ │
│  │ ...                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Tổng kết ────────────────────────────────────────────┐ │
│  │ Tổng số sản phẩm:      {n}                            │ │
│  │ Tổng giá trị phiếu nhập: {giá trị}                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Ghi chú nội bộ ─────────────────────────────────────┐ │
│  │ {Nội dung ghi chú}                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Tài liệu đính kèm ─────────────────────────────────┐ │
│  │ {Danh sách tệp}     [Xem thêm] / [Thu gọn]          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  [ Chỉnh sửa ] [ Hoàn tất ] [ Huỷ ] [ Hoàn tác ]         │
│                                           [ In phiếu ]     │
└─────────────────────────────────────────────────────────────┘
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu quản lý kho | Hiển thị bảng danh sách với 10 cột: Mã phiếu nhập kho, Nguồn nhập, Đơn hàng tương ứng, Trạng thái, Phụ tùng nhập, Tên nhà cung cấp, Người tạo, Người duyệt, Ngày tạo, Thao tác |
| 2 | Nhập từ khóa vào ô tìm kiếm (placeholder: **"Tìm kiếm theo mã phiếu, mã PO"**) | Lọc theo mã phiếu hoặc mã đơn hàng (PO). Kết quả cập nhật tự động |
| 3 | Chọn bộ lọc (trạng thái, nguồn nhập, khoảng ngày tạo) | Danh sách cập nhật theo tiêu chí đã chọn |
| 4 | Nhấn vào giá trị phụ tùng nhập của một phiếu | Hiển thị modal **"Danh sách sản phẩm trong phiếu nhập kho"** với chi tiết từng sản phẩm và **"Tổng giá trị"** |
| 5 | Nhấn vào một phiếu nhập kho | Chuyển sang Chi tiết phiếu nhập kho (xem 4.4) |
| 6 | Nhấn nút **"Tạo phiếu nhập kho mới"** | Chuyển sang Form tạo phiếu nhập kho (xem 4.2) |
| 7 | Nhấn nút chỉnh sửa trong cột Thao tác | Chuyển sang Form chỉnh sửa (xem 4.8) — chỉ hiển thị khi trạng thái **"Chờ duyệt"** |
| 8 | Nhấn nút **"Xuất file"** | Hệ thống xuất danh sách phiếu nhập kho ra file |

**Trường hợp ngoại lệ:**
- Không có phiếu nhập kho nào → hiển thị thông báo danh sách trống.
- Tìm kiếm hoặc lọc không có kết quả → hiển thị thông báo danh sách trống.
- Phiếu nguồn **"Mua ngoài"** không có đơn hàng → cột **"Đơn hàng tương ứng"** hiển thị trống.

### 4.2 Tạo phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn **"Tạo phiếu nhập kho mới"** trên Danh sách | Mở form trống gồm 4 mục: Thông tin phiếu nhập kho, Danh sách sản phẩm nhập kho, Tệp đính kèm, Ghi chú. Form không có trường chọn nguồn — nguồn nhập kế thừa từ đơn hàng mua liên kết |
| 2 | Nhập mã đơn hàng (bắt buộc, placeholder: **"Nhập mã đơn hàng"**) | Ghi nhận mã đơn hàng liên kết |
| 3 | Nhập mã lô hàng (không bắt buộc, placeholder: **"Nhập mã lô hàng"**) | Ghi nhận mã lô hàng |
| 4 | Thêm dòng sản phẩm vào bảng | Hiển thị dòng mới với các cột: Tên phụ tùng (gợi ý từ danh mục), Mã Genuine, Phân khúc, Xuất xứ, Đơn vị nhập, Quy đổi, Đơn vị kho, Số lượng, Giá nhập, Giá bán gợi ý, Thao tác |
| 5 | Chọn/nhập tên phụ tùng | Gợi ý danh sách sản phẩm từ danh mục. Chọn sản phẩm → tự động điền Mã Genuine, Xuất xứ |
| 6 | Nhập số lượng, giá nhập, quy đổi | Hệ thống tự động tính: Số lượng sau quy đổi = Số lượng x Quy đổi. Tổng giá trị cập nhật tự động |
| 7 | Tải tệp đính kèm (không bắt buộc, nhấn **"Nhấn để tải lên"**) | Cho phép tải lên tệp. **"Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"** |
| 8 | Nhập ghi chú (không bắt buộc, placeholder: **"Nhập ghi chú"**) | Ghi nhận ghi chú |
| 9 | Nhấn nút **"Tạo mới"** (khi đủ trường bắt buộc) | Tạo phiếu nhập kho → trạng thái **"Chờ duyệt"**, mã phiếu tự sinh |

**Trường hợp ngoại lệ:**
- Bỏ trống mã đơn hàng → thông báo lỗi: **"Vui lòng nhập mã đơn hàng."**.
- Chưa thêm sản phẩm → thông báo lỗi: **"Vui lòng thêm ít nhất một sản phẩm."**.
- Dòng sản phẩm thiếu thông tin bắt buộc → thông báo lỗi: **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."**.
- Thiếu trường bắt buộc → nút **"Tạo mới"** bị mờ (disabled).
- Tạo thành công → toast tiêu đề **"Thành công"**, mô tả **"Tạo phiếu nhập kho thành công."**. Chuyển về Chi tiết phiếu vừa tạo.
- Tạo thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút **"Huỷ bỏ"** → đóng form, quay về Danh sách. Dữ liệu không được lưu.

### 4.3 Hệ thống tự tạo phiếu nhập kho (từ đơn hàng mua)

> FEAT tham chiếu: `FEAT-IR-CREATE` (AC-2, AC-12)

Ngoài tạo thủ công qua form (§4.2), hệ thống cũng tự động tạo phiếu nhập kho khi đơn hàng mua chuyển sang trạng thái **"Đang giao hàng"** (xem `FEAT-PO-DETAIL`). Phiếu tự tạo ở trạng thái **"Chờ duyệt"**, liên kết với đơn hàng mua tương ứng, nguồn nhập kế thừa từ đơn hàng.

**Đặc thù nguồn Nền tảng (cả tạo thủ công lẫn tự tạo):**
- Số lượng nhập không được vượt quá số lượng đặt hàng → lỗi: **"Số lượng nhập không được vượt quá số lượng đặt hàng."**.
- Sản phẩm tham chiếu từ đơn hàng mua.

### 4.4 Xem chi tiết phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào phiếu nhập kho trên Danh sách | Mở Chi tiết phiếu nhập kho với tiêu đề **"Phiếu nhập kho"** kèm mã phiếu |
| 2 | Màn hình được tải | Hiển thị mục Thông tin phiếu nhập kho: Nguồn, Liên kết PO, Mã lô hàng, Tên nhà cung cấp, Tạo phiếu (người tạo + ngày), Hoàn tất (người duyệt + ngày, khi đã duyệt) |
| 3 | — | Hiển thị mục Danh sách sản phẩm nhập kho: bảng với các cột Tên phụ tùng, Mã Genuine, Phân khúc, Xuất xứ, Đơn vị nhập, Quy đổi, Đơn vị kho, Số lượng, Giá nhập, Giá bán gợi ý |
| 4 | — | Hiển thị mục Tổng kết: **"Tổng số sản phẩm"** và **"Tổng giá trị phiếu nhập"** |
| 5 | — | Hiển thị mục Ghi chú nội bộ (nếu có) |
| 6 | — | Hiển thị mục Tài liệu đính kèm (nếu có). Nhiều tệp → nút **"Xem thêm"** / **"Thu gọn"** |
| 7 | — | Hiển thị nút hành động phù hợp trạng thái (xem 5.2 ma trận hành động) |

**Trường hợp ngoại lệ:**
- Phiếu nhập kho không tồn tại → hiển thị thông báo **"Không tìm thấy phiếu nhập kho"**.
- Phiếu không có tệp đính kèm → mục tài liệu đính kèm không hiển thị nội dung.
- Phiếu không có ghi chú → mục ghi chú nội bộ không hiển thị nội dung.

### 4.5 Hoàn tất nhập kho (duyệt)

> FEAT tham chiếu: `FEAT-IR-DETAIL` (AC-9)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở **"Chờ duyệt"** | Hiển thị nút **"Hoàn tất"** |
| 2 | Nhấn nút **"Hoàn tất"** | Mở modal **"Xác nhận cập nhật trạng thái phiếu nhập kho"** với tiêu đề **"Xác nhận nhập kho"** và thông báo **"Vui lòng kiểm tra kỹ trước khi bấm xác nhận"**. Hai nút: **"Hủy"** và **"Xác nhận"** |
| 3 | Nhấn **"Xác nhận"** trên modal | Trạng thái → **"Đã duyệt"**. Tồn kho cập nhật tăng theo từng dòng sản phẩm |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Xác nhận nhập kho thành công."** |
| 5 | — | Nút **"Hoàn tất"**, **"Huỷ"**, **"Chỉnh sửa"** biến mất → thay bằng nút **"Hoàn tác"** |

**Trường hợp ngoại lệ:**
- Nhấn **"Hủy"** trên modal → đóng modal, giữ nguyên trạng thái phiếu.
- Duyệt thất bại → toast **"Lỗi"**, trạng thái không thay đổi.
- Sản phẩm chưa có trong kho → hệ thống tự động tạo bản ghi tồn kho mới.

### 4.6 Huỷ phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-DETAIL` (AC-10)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở **"Chờ duyệt"** | Hiển thị nút **"Hủy"** |
| 2 | Nhấn nút **"Hủy"** | Mở modal **"Hủy phiếu nhập kho"** với câu hỏi **"Bạn chắc chắn muốn hủy phiếu nhập kho?"**, trường nhập **"Lý do hủy phiếu"** (placeholder: **"Nhập lý do hủy phiếu"**). Hai nút: **"Hủy"** và **"Xác nhận"** |
| 3 | Nhập lý do và nhấn **"Xác nhận"** | Trạng thái → **"Đã hủy"** |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Hủy phiếu nhập kho thành công."** |
| 5 | — | Toàn bộ nút hành động biến mất |

**Trường hợp ngoại lệ:**
- Nhấn **"Hủy"** trên modal → đóng modal, giữ nguyên trạng thái phiếu.
- Huỷ thất bại → toast **"Lỗi"**, trạng thái không thay đổi.

### 4.7 Hoàn tác phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-DETAIL` (AC-11)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở **"Đã duyệt"** | Hiển thị nút **"Hoàn tác"** |
| 2 | Nhấn nút **"Hoàn tác"** | Mở modal với câu hỏi **"Bạn chắc chắn muốn hoàn tác phiếu nhập kho?"**, trường nhập **"Lý do hoàn tác"** (placeholder: **"Nhập lý do hoàn tác"**). Hai nút: **"Đóng"** và **"Xác nhận"** |
| 3 | Nhập lý do và nhấn **"Xác nhận"** | Trạng thái → **"Hoàn tác"**. Tồn kho cập nhật giảm lại theo từng dòng sản phẩm |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Hoàn tác phiếu nhập kho thành công."** |
| 5 | — | Toàn bộ nút hành động biến mất (trừ **"In phiếu"**) |

**Trường hợp ngoại lệ:**
- Nhấn **"Đóng"** trên modal → đóng modal, giữ nguyên trạng thái phiếu.
- Hoàn tác thất bại → toast **"Lỗi"**, trạng thái không thay đổi.
- Hoàn tác phiếu khi kỳ kho đã đóng → hệ thống vẫn xử lý hoàn tác và tự động tạo điều chỉnh kho cho kỳ đã đóng.

### 4.8 Chỉnh sửa phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-EDIT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết hoặc cột Thao tác trên Danh sách, phiếu ở **"Chờ duyệt"** | Chuyển sang form chỉnh sửa, dữ liệu hiện tại đã điền sẵn (4 mục: Thông tin phiếu nhập kho, Danh sách sản phẩm nhập kho, Tệp đính kèm, Ghi chú) |
| 2 | Thay đổi thông tin phiếu, sản phẩm, tệp đính kèm hoặc ghi chú | Form hỗ trợ gợi ý sản phẩm, validation — tương tự form tạo |
| 3 | Nhấn nút **"Lưu"** (khi đủ trường bắt buộc) | Cập nhật phiếu nhập kho thành công. Phiếu giữ nguyên trạng thái **"Chờ duyệt"** |
| 4 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Cập nhật phiếu nhập kho thành công."**. Quay về Chi tiết phiếu nhập kho |

**Trường hợp ngoại lệ:**
- Phiếu đã chuyển trạng thái trong lúc đang chỉnh sửa (người khác duyệt phiếu) → khi gửi form, hệ thống từ chối cập nhật và hiển thị lỗi.
- Cập nhật thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu đã chỉnh sửa.
- Thiếu trường bắt buộc → nút **"Lưu"** bị mờ (disabled).
- Nhấn nút **"Huỷ bỏ"** → đóng form, quay về Chi tiết. Các thay đổi chưa lưu bị huỷ bỏ.

### 4.9 In phiếu nhập kho

> FEAT tham chiếu: `FEAT-IR-DETAIL` (AC-12)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, phiếu ở trạng thái **"Chờ duyệt"**, **"Đã duyệt"** hoặc **"Hoàn tác"** | Hiển thị nút **"In phiếu"** |
| 2 | Nhấn nút **"In phiếu"** | Hệ thống xuất phiếu nhập kho dưới dạng PDF và mở bản in |

## 5. States

### 5.1 Bảng trạng thái

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Chờ duyệt | **"Chờ duyệt"** | Phiếu nhập kho vừa tạo, chờ hoàn tất nhập kho | Cho phép chỉnh sửa, duyệt, huỷ |
| Đã duyệt | **"Đã duyệt"** | Phiếu đã hoàn tất nhập kho, tồn kho đã cộng | Cho phép hoàn tác |
| Đã huỷ | **"Đã hủy"** | Phiếu bị huỷ, không ảnh hưởng tồn kho | Trạng thái kết thúc |
| Hoàn tác | **"Hoàn tác"** | Phiếu đã duyệt bị hoàn tác, tồn kho đã trừ | Trạng thái kết thúc |

### 5.2 Ma trận hành động theo trạng thái

| Trạng thái | Chỉnh sửa | Hoàn tất | Huỷ | Hoàn tác | In phiếu |
|---|---|---|---|---|---|
| Chờ duyệt | Hiển thị | Hiển thị | Hiển thị | Ẩn | Hiển thị |
| Đã duyệt | Ẩn | Ẩn | Ẩn | Hiển thị | Hiển thị |
| Hoàn tác | Ẩn | Ẩn | Ẩn | Ẩn | Hiển thị |
| Đã huỷ | Ẩn | Ẩn | Ẩn | Ẩn | Ẩn |

### 5.3 Nguồn nhập và đặc thù

| Nguồn nhập | Tên hiển thị | Enum backend | Mô tả | Đặc thù |
|---|---|---|---|---|
| Mua ngoài | **"Mua ngoài"** | DIRECT | Kế thừa từ đơn hàng mua ngoài nền tảng | Nhập thủ công toàn bộ thông tin sản phẩm, cho phép chỉnh sửa phân khúc |
| Nền tảng | **"Nền tảng"** | ECOMMERCE | Kế thừa từ đơn hàng mua qua nền tảng | Sản phẩm tham chiếu từ đơn hàng mua, số lượng nhập không vượt số lượng đặt hàng |

> Nguồn nhập kế thừa từ đơn hàng mua liên kết — form không có trường chọn nguồn riêng. Cả hai nguồn đều tạo thủ công qua form được (tùy nguồn của đơn hàng mua liên kết) và cũng có thể được hệ thống tự tạo.

## 6. Validation Rules

> Áp dụng cho Form tạo (`FEAT-IR-CREATE`) và Form chỉnh sửa (`FEAT-IR-EDIT`).

### 6.1 Thông tin phiếu nhập kho

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Mã đơn hàng | Có | — | **"Vui lòng nhập mã đơn hàng."** |
| Mã lô hàng | Không | — | — |

### 6.2 Danh sách sản phẩm nhập kho

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Danh sách sản phẩm | Có | Ít nhất một dòng sản phẩm | **"Vui lòng thêm ít nhất một sản phẩm."** |
| Tên phụ tùng | Có (mỗi dòng) | — | **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."** |
| Số lượng | Có (mỗi dòng) | >= 0 | Bỏ trống: **"Vui lòng nhập số lượng."** / Âm: **"Số lượng phải lớn hơn hoặc bằng 0."** / Nguồn **"Nền tảng"** vượt đặt hàng: **"Số lượng nhập không được vượt quá số lượng đặt hàng."** |
| Đơn vị kho | Có (mỗi dòng) | — | **"Vui lòng nhập đơn vị kho."** |
| Quy đổi | Không | > 0 | **"Vui lòng nhập tỷ lệ quy đổi lớn hơn 0"** |
| Giá bán gợi ý | Không | >= 0 | **"Vui lòng nhập giá đề xuất lớn hơn hoặc bằng 0"** |

### 6.3 Tệp đính kèm và ghi chú

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| Tệp đính kèm | Không | **"Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"** | — |
| Ghi chú | Không | — | — |

### 6.4 Điều kiện nút submit

**Form tạo — nút "Tạo mới":**
- Khả dụng (enabled): trường bắt buộc đã điền đủ (Mã đơn hàng, ít nhất một sản phẩm với tên, số lượng, đơn vị kho) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

**Form chỉnh sửa — nút "Lưu":**
- Khả dụng (enabled): trường bắt buộc đã điền đủ (Mã đơn hàng, ít nhất một sản phẩm với tên, số lượng, đơn vị kho) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-INVENTORY-RECEIPT từ EP-INVENTORY-RECEIPT v1 và 4 FEAT: LIST v1, CREATE v1, DETAIL v1, EDIT v1. Vòng đời 4 trạng thái, 2 nguồn nhập, ma trận hành động, validation rules. |
| 2026-05-21 | 2 | Business Authority | Sửa §1 sơ đồ, §4.6 bước 5, §4.9 bước 1, §5.2 ma trận: ẩn nút "In phiếu" ở trạng thái "Đã hủy" — phiếu đã hủy không được in. |
| 2026-05-21 | 3 | Business Authority | Xóa trường chọn nguồn nhập khỏi form (§4.2), cập nhật §6.1 + §6.4 validation. |
| 2026-05-21 | 4 | Business Authority | Sửa §1 purpose + sơ đồ, §4.2, §4.3, §5.3: nguồn nhập kế thừa từ đơn hàng mua liên kết (DIRECT = Mua ngoài, ECOMMERCE = Nền tảng) — cả hai nguồn đều tạo thủ công được. Hệ thống tự tạo là kênh bổ sung, không phải kênh duy nhất cho Nền tảng. |
