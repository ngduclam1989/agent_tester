---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 2
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-05-20"
---

# UX-FLOW-BOOKING: Luồng lịch hẹn & tiếp nhận xe

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-BOOKING` |
| Kind | FLOW |
| Referenced by | `FEAT-BOOK-LIST`, `FEAT-BOOK-DETAIL`, `FEAT-BOOK-CREATE`, `FEAT-BOOK-EDIT`, `FEAT-BOOK-CONFIRM`, `FEAT-BOOK-ARRIVE`, `FEAT-BOOK-CANCEL`, `FEAT-BOOK-DECLINE` |

## 1. Purpose

Luồng lịch hẹn & tiếp nhận xe mô tả toàn bộ vòng đời vận hành lịch hẹn tại garage — từ lúc lịch hẹn được tạo đến khi kết thúc (tiếp nhận xe → tạo Phiếu dịch vụ, hoặc từ chối / hủy).

**Người thực hiện:** Chủ garage và Kế toán — quyền ngang nhau trên toàn bộ luồng lịch hẹn.

**Nền tảng:** Garage Care (bao gồm Web GMS và App Garage) — giao diện vận hành cho garage. Khách hàng tương tác qua ứng dụng tài xế Driver+ (ngoài phạm vi luồng này).

### Sơ đồ luồng vận hành tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                  LUỒNG VẬN HÀNH LỊCH HẸN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① TẠO LỊCH HẸN                                                │
│     Garage Care ── Tạo thủ công ────────► Đã xác nhận          │
│     (Web GMS + App Garage)                                      │
│     Driver+ ────── Sự kiện tự động ─────► Lịch hẹn mới         │
│     Walk-in ────── Tự sinh từ PDV ──────► Xe đã đến            │
│                                                                 │
│  ② XỬ LÝ (tại Chi tiết lịch hẹn)                               │
│     Lịch hẹn mới ─┬─ Xác nhận ─────────► Đã xác nhận          │
│                    └─ Từ chối (+ lý do) ► Đã từ chối           │
│     Đã xác nhận ──┬─ Xe đã đến ────────► Xe đã đến            │
│                   └─ Hủy (+ lý do) ────► Đã hủy               │
│     Quá hạn ─────── Hệ thống tự động ──► Đã hủy               │
│                                                                 │
│  ③ TIẾP NHẬN XE                                                │
│     Xe đã đến ──── Tạo Phiếu DV ───────► EP-SERVICE-ORDER      │
│                                                                 │
│  ④ CHỈNH SỬA (khi trạng thái cho phép)                         │
│     Lịch hẹn mới / Đã xác nhận                                 │
│     ── Form chỉnh sửa ─────────────────► Đồng bộ Driver+       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-FOUND` | Cấu hình garage, khung giờ (timeslot), phân quyền người dùng |
| Upstream | `EP-CUSTOMER` | Dữ liệu khách hàng và xe — gợi ý khi tạo / chỉnh sửa lịch hẹn |
| Downstream | `EP-SERVICE-ORDER` | Tạo Phiếu dịch vụ liên kết từ lịch hẹn; tự sinh booking walk-in khi tạo PDV không gắn lịch hẹn |
| Bên ngoài | Driver+ | Hai chiều: nhận lịch hẹn, đồng bộ trạng thái, phản hồi kết quả, đồng bộ chỉnh sửa |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | Menu lịch hẹn trên Web GMS | Đã đăng nhập, thuộc garage hiện tại | Màn hình Danh sách lịch hẹn |
| 2 | Nút **"Tạo lịch hẹn"** trên Danh sách | Đang ở Danh sách lịch hẹn | Form tạo lịch hẹn mới |
| 3 | Nhấn vào một lịch hẹn trong danh sách | Đang ở Danh sách lịch hẹn | Màn hình Chi tiết lịch hẹn |
| 4 | Nút chỉnh sửa trên Danh sách (cột Thao tác) | Trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** | Form chỉnh sửa lịch hẹn |
| 5 | Nút chỉnh sửa trên Chi tiết | Trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** | Form chỉnh sửa lịch hẹn |
| 6 | Khách hàng đặt lịch từ Driver+ | Sự kiện inbound từ Driver+ | Lịch hẹn mới trên Danh sách (**"Lịch hẹn mới"**) |
| 7 | Tạo Phiếu dịch vụ loại sửa chữa không gắn lịch hẹn | Từ luồng `FEAT-SO-CREATE` | Tự sinh lịch hẹn walk-in (**"Xe đã đến"**) |

## 3. Layout / Wireframe

> Luồng lịch hẹn trên Web GMS gồm 4 màn hình chính. Sơ đồ dưới mô tả quan hệ điều hướng giữa các màn hình — chi tiết nội dung từng màn xem tại FEAT tương ứng.

```
┌──────────────────┐     Tạo mới      ┌──────────────────┐
│  Danh sách       │─────────────────►│  Form tạo        │
│  lịch hẹn        │                  │  lịch hẹn        │
│ (FEAT-BOOK-LIST) │◄─────────────────│ (FEAT-BOOK-      │
│                  │   Submit / Hủy   │  CREATE)          │
└──┬───────────────┘                  └──────────────────┘
   │
   │ Xem chi tiết
   │ (hoặc Chỉnh sửa
   │  từ cột Thao tác *)
   ▼
┌──────────────────┐   Chỉnh sửa     ┌──────────────────┐
│  Chi tiết        │────────────────►│  Form chỉnh sửa  │
│  lịch hẹn        │◄────────────────│  lịch hẹn        │
│ (FEAT-BOOK-      │   Lưu / Hủy    │ (FEAT-BOOK-      │
│  DETAIL)         │                 │  EDIT)            │
│                  │                 └──────────────────┘
│ Hành động:       │
│ • Xác nhận       │
│ • Từ chối        │   Tạo PDV      ┌──────────────────┐
│ • Xe đã đến      │───────────────►│  Tạo Phiếu DV    │
│ • Hủy            │                │ (→ FEAT-SO-CREATE)│
└──────────────────┘                └──────────────────┘

(*) Chỉnh sửa từ cột Thao tác trên Danh sách đi thẳng đến
    Form chỉnh sửa; sau khi Lưu → quay về Chi tiết lịch hẹn.
```

**Nguồn tự động (không qua form tạo thủ công):**

```
┌──────────────────┐               ┌──────────────────┐
│  Driver+         │── Sự kiện ───►│  Lịch hẹn mới    │
│  (ứng dụng       │   tự động    │  xuất hiện trên  │
│   tài xế)        │              │  Danh sách       │
├──────────────────┤              │  lịch hẹn        │
│  Phiếu dịch vụ  │── Tự sinh ───►│                  │
│  (walk-in)       │   booking    │  (walk-in: trạng │
│                  │              │   thái Xe đã đến)│
└──────────────────┘              └──────────────────┘
```

## 4. Behavior

### 4.1 Xem và tìm kiếm danh sách lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-LIST`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage / Kế toán truy cập menu lịch hẹn | Hiển thị bảng danh sách với 7 cột: Mã lịch hẹn, Nguồn, Khách hàng, Biển số xe, Thời gian hẹn, Trạng thái, Thao tác |
| 2 | Nhập từ khóa vào ô tìm kiếm | Lọc theo biển số xe, tên khách hàng hoặc số điện thoại |
| 3 | Chọn bộ lọc (trạng thái, nguồn, khoảng thời gian) | Danh sách cập nhật theo tiêu chí đã chọn |
| 4 | Nhấn **"Đặt lại bộ lọc"** | Xóa toàn bộ tiêu chí, hiển thị danh sách mặc định |
| 5 | Nhấn vào một lịch hẹn | Chuyển sang Chi tiết lịch hẹn (xem §4.4) |
| 6 | Nhấn nút **"Tạo lịch hẹn"** | Chuyển sang Form tạo lịch hẹn (xem §4.2) |
| 7 | Nhấn nút chỉnh sửa trong cột Thao tác | Chuyển sang Form chỉnh sửa (xem §4.9) — chỉ hiển thị khi trạng thái cho phép |

**Trường hợp ngoại lệ:**
- Không có lịch hẹn nào → hiển thị trạng thái trống.
- Tìm kiếm không có kết quả → hiển thị trạng thái trống với thông báo phù hợp.

### 4.2 Tạo lịch hẹn thủ công (Garage Care)

> FEAT tham chiếu: `FEAT-BOOK-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn **"Tạo lịch hẹn"** trên Danh sách | Mở form trống gồm 5 mục: Thông tin khách hàng, Thông tin xe, Hình ảnh xe, Thời gian hẹn, Thông tin dịch vụ |
| 2 | Nhập SĐT hoặc tên khách hàng | Gợi ý danh sách khách hàng khớp từ dữ liệu đã có |
| 3 | Chọn khách hàng từ gợi ý (hoặc nhập thủ công) | Tự động điền SĐT và tên khách hàng tương ứng |
| 4 | Nhập biển số xe | Gợi ý danh sách xe khớp; chọn xe → tự động điền thông tin xe |
| 5 | Tải ảnh xe (không bắt buộc) | Cho phép tải nhiều ảnh cùng lúc |
| 6 | Chọn ngày hẹn và giờ hẹn | Kiểm tra khung giờ: thông báo phù hợp hoặc cảnh báo có lịch hẹn gần |
| 7 | Chọn loại dịch vụ, nhập mô tả / ghi chú | Điền thông tin dịch vụ |
| 8 | Nhấn nút submit (khi đủ trường bắt buộc) | Tạo lịch hẹn → trạng thái **"Đã xác nhận"**, mã tự sinh, nguồn tự động ghi nhận |

**Trường hợp ngoại lệ:**
- Biển số xe sai định dạng → thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.
- Có lịch hẹn gần khung giờ đã chọn → cảnh báo: **"Có {n} lịch hẹn gần thời điểm bạn chọn"** kèm liên kết xem chi tiết. Vẫn cho phép tạo (không chặn).
- Thiếu trường bắt buộc → nút submit bị mờ (disabled).
- Tạo thất bại → toast **"Lỗi"**, form giữ nguyên dữ liệu.
- Nhấn nút hủy bỏ → đóng form, quay về Danh sách. ⚠ NEED CLARIFICATION — KG chưa ghi nhận label nút hủy trên form tạo.

### 4.3 Nhận lịch hẹn từ nguồn bên ngoài

> FEAT tham chiếu: `FEAT-BOOK-CREATE` (Nhóm A2)

**4.3.1 Từ ứng dụng tài xế Driver+**

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Khách hàng đặt lịch trên Driver+ | Hệ thống tự động tạo lịch hẹn → trạng thái **"Lịch hẹn mới"**, nguồn **"Từ ứng dụng tài xế"** |
| 2 | — | Lịch hẹn xuất hiện trên Danh sách Web GMS để chủ garage xác nhận hoặc từ chối |
| 3 | Khách hàng hủy lịch trên Driver+ | Hệ thống tự động hủy → trạng thái **"Đã hủy"** trên Danh sách Web GMS |

### 4.4 Xem chi tiết lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-DETAIL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Nhấn vào lịch hẹn trên Danh sách | Mở Chi tiết lịch hẹn với tiêu đề **"Lịch hẹn"** |
| 2 | Màn hình được tải | Hiển thị thông tin tổng quan: mã lịch hẹn, trạng thái, nguồn, thời gian hẹn |
| 3 | — | Hiển thị thông tin khách hàng: tên, số điện thoại |
| 4 | — | Hiển thị thông tin xe: biển số, hãng xe, dòng xe, phiên bản, năm sản xuất, số VIN, số Km, hình ảnh (nếu có) |
| 5 | — | Hiển thị thông tin dịch vụ: loại dịch vụ, mô tả tình trạng xe, ghi chú khách hàng, ghi chú nội bộ |
| 6 | — | Hiển thị lịch sử chuyển trạng thái: hành động, mô tả, người thực hiện, thời gian, lý do (nếu có) |
| 7 | Lịch hẹn có PDV liên kết | Hiển thị mã và trạng thái Phiếu dịch vụ liên kết |
| 8 | Lịch hẹn chưa có PDV liên kết | Không hiển thị thông tin PDV (hoặc hiển thị trạng thái chưa liên kết) |
| 9 | — | Hiển thị nút hành động phù hợp trạng thái (xem §5.2 ma trận hành động) |

**Ghi chú:** Thông tin khách hàng và xe hiển thị là snapshot tại thời điểm tạo lịch hẹn, không phải dữ liệu hiện tại.

**Trường hợp ngoại lệ:**
- Lịch hẹn không có thông tin xe → các trường xe hiển thị trống.
- Lịch hẹn không có hình ảnh xe → mục hình ảnh không hiển thị.
- Lịch sử chỉ có 1 mục (vừa tạo) → hiển thị bình thường.

### 4.5 Xác nhận lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-CONFIRM`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, lịch hẹn ở **"Lịch hẹn mới"** | Hiển thị nút xác nhận |
| 2 | Nhấn nút xác nhận | Trạng thái → **"Đã xác nhận"** |
| 3 | — | Toast: tiêu đề **"Xác nhận lịch hẹn thành công"**, mô tả **"Lịch hẹn đã được xác nhận. Khách hàng sẽ nhận được thông báo qua Drive+"** |
| 4 | — | Nút xác nhận biến mất → thay bằng nút Xe đã đến và nút Hủy |

**Trường hợp ngoại lệ:**
- Lịch hẹn bị hệ thống tự chuyển trạng thái (quá hạn) trong khi thao tác → xác nhận thất bại, toast **"Lỗi"**.

### 4.6 Từ chối lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-DECLINE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, lịch hẹn ở **"Lịch hẹn mới"** | Hiển thị nút từ chối |
| 2 | Nhấn nút từ chối | Mở hộp thoại nhập lý do (placeholder: **"Nhập lý do từ chối"**) |
| 3 | Nhập lý do và xác nhận | Trạng thái → **"Đã từ chối"** |
| 4 | — | Toast: tiêu đề **"Đã từ chối lịch hẹn"**, mô tả **"Thông tin từ chối đã được gửi cho khách hàng trên Driver+"** |
| 5 | — | Nút từ chối biến mất. Lý do từ chối ghi nhận trong lịch sử trạng thái |

**Trường hợp ngoại lệ:**
- Lịch hẹn bị hệ thống tự chuyển trạng thái (quá hạn) → từ chối thất bại, toast **"Lỗi"**.

### 4.7 Xác nhận xe đã đến

> FEAT tham chiếu: `FEAT-BOOK-ARRIVE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, lịch hẹn ở **"Đã xác nhận"** | Hiển thị nút xe đã đến |
| 2 | Nhấn nút xe đã đến | Trạng thái → **"Xe đã đến"**. Ghi nhận thời điểm xe đến |
| 3 | — | Toast: tiêu đề **"Thành công"**, mô tả **"Đã cập nhật xe đã đến"** |
| 4 | — | Nút xe đã đến biến mất. Xuất hiện nút tạo Phiếu dịch vụ (nếu chưa có PDV liên kết) |

**Trường hợp ngoại lệ:**
- Lịch hẹn bị hệ thống tự hủy (quá hạn) → xác nhận thất bại, toast **"Lỗi"**.

### 4.8 Hủy lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-CANCEL`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, lịch hẹn ở **"Đã xác nhận"** và chưa có PDV liên kết | Hiển thị nút hủy |
| 2 | Nhấn nút hủy | Mở hộp thoại nhập lý do hủy (placeholder: **"Nhập lý do hủy lịch hẹn"**) |
| 3 | Nhập lý do và xác nhận hủy | Trạng thái → **"Đã hủy"** |
| 4 | — | Toast: **"Hủy lịch hẹn thành công"**. Nút hủy biến mất. Lý do ghi nhận trong lịch sử |

**Trường hợp ngoại lệ:**
- Phiếu dịch vụ vừa được tạo liên kết trong khi mở hộp thoại → hủy thất bại.
- Hủy thất bại → toast **"Lỗi"**, trạng thái không thay đổi.

### 4.9 Chỉnh sửa lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-EDIT`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết hoặc cột Thao tác trên Danh sách, lịch hẹn ở **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** | Chuyển sang form chỉnh sửa, dữ liệu hiện tại đã điền sẵn (5 mục: Thông tin khách hàng, Thông tin xe, Hình ảnh xe, Thời gian hẹn, Thông tin dịch vụ) |
| 2 | Thay đổi thông tin | Form hỗ trợ gợi ý khách hàng, xe, kiểm tra khung giờ — tương tự form tạo |
| 3 | Nhấn **"Lưu thay đổi"** (khi đủ trường bắt buộc) | Cập nhật lịch hẹn thành công |
| 4 | — | Toast: tiêu đề **"Cập nhật lịch hẹn thành công"**, mô tả **"Thông tin lịch hẹn đã được cập nhật."**. Quay về Chi tiết lịch hẹn |
| 5 | — | Đồng bộ thông tin cập nhật sang Driver+ |

**Trường hợp ngoại lệ:**
- Lịch hẹn bị chuyển trạng thái (quá hạn) trong khi chỉnh sửa → lưu thất bại.
- Trạng thái **"Đã xác nhận"** — cho phép chỉnh sửa nhưng trạng thái không thay đổi sau khi lưu.
- Cập nhật thất bại → toast **"Lỗi"**.
- Nhấn nút hủy bỏ → đóng form, quay về Chi tiết. ⚠ NEED CLARIFICATION — KG chưa ghi nhận label nút hủy trên form chỉnh sửa.

### 4.10 Hệ thống tự hủy quá hạn

> FEAT tham chiếu: `FEAT-BOOK-LIST` (AC-14), `FEAT-BOOK-CANCEL` (BR-BOOK-CAN-004)

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Lịch hẹn ở **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** quá hạn thời gian quy định | Hệ thống tự động chuyển trạng thái → **"Đã hủy"** |
| 2 | — | Ghi nhận lịch sử chuyển trạng thái. Danh sách hiển thị trạng thái mới |

**Ghi chú:** Không qua nút bấm — hành vi hoàn toàn tự động của hệ thống. Không phải hành động của người dùng trong module lịch hẹn.

### 4.11 Walk-in: Tự sinh lịch hẹn từ Phiếu dịch vụ

> FEAT tham chiếu: `FEAT-BOOK-CREATE` (AC-26), cross-module với `FEAT-SO-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Chủ garage tạo Phiếu dịch vụ loại sửa chữa mà không gắn lịch hẹn | Hệ thống tự sinh lịch hẹn walk-in → trạng thái **"Xe đã đến"**, nguồn **"Walk-in"** |
| 2 | — | Thời điểm xe đến = thời điểm tạo phiếu. Lịch hẹn liên kết tự động với PDV |
| 3 | — | Lịch hẹn xuất hiện trên Danh sách lịch hẹn Web GMS |

**Ghi chú:** Không áp dụng cho Phiếu dịch vụ loại bán lẻ. Chi tiết trigger tạo xem `FEAT-SO-CREATE`.

### 4.12 Chuyển tiếp: Tạo Phiếu dịch vụ từ lịch hẹn

> FEAT tham chiếu: `FEAT-BOOK-DETAIL` (AC-11, AC-12), cross-module với `FEAT-SO-CREATE`

| Bước | Trigger | Phản hồi |
|---|---|---|
| 1 | Tại Chi tiết, lịch hẹn ở **"Xe đã đến"** và chưa có PDV liên kết | Hiển thị nút tạo Phiếu dịch vụ |
| 2 | Nhấn nút tạo Phiếu dịch vụ | Chuyển sang màn hình tạo Phiếu dịch vụ (`FEAT-SO-CREATE`) với thông tin lịch hẹn liên kết sẵn |
| 3 | (Sau khi PDV được tạo) | Nút tạo PDV biến mất → thay bằng thông tin PDV liên kết (mã và trạng thái) |

## 5. States

### 5.1 Bảng trạng thái

| Trạng thái | Tên hiển thị | Mô tả | Tính chất |
|---|---|---|---|
| Lịch hẹn mới | **"Lịch hẹn mới"** | Lịch hẹn vừa tạo, chờ garage xác nhận hoặc từ chối | Cho phép chỉnh sửa |
| Đã xác nhận | **"Đã xác nhận"** | Garage đã xác nhận, chờ xe đến | Cho phép chỉnh sửa |
| Xe đã đến | **"Xe đã đến"** | Xe đã đến garage, sẵn sàng tạo Phiếu dịch vụ | Trạng thái chờ chuyển tiếp |
| Đã từ chối | **"Đã từ chối"** | Garage từ chối lịch hẹn | Trạng thái kết thúc |
| Đã hủy | **"Đã hủy"** | Hủy thủ công hoặc quá hạn tự động | Trạng thái kết thúc |

**Ghi chú:** Hai trạng thái nội bộ (hủy thủ công và không đến) đều hiển thị chung là **"Đã hủy"** trên giao diện.

### 5.2 Ma trận hành động theo trạng thái

| Trạng thái | Xác nhận | Từ chối | Xe đã đến | Hủy | Chỉnh sửa | Tạo PDV |
|---|---|---|---|---|---|---|
| Lịch hẹn mới | ✓ | ✓ | — | — | ✓ | — |
| Đã xác nhận | — | — | ✓ | ✓ * | ✓ | — |
| Xe đã đến | — | — | — | — | — | ✓ ** |
| Đã từ chối | — | — | — | — | — | — |
| Đã hủy | — | — | — | — | — | — |

\* Hủy chỉ khả dụng khi chưa có Phiếu dịch vụ liên kết.

\** Tạo PDV chỉ hiển thị khi chưa có Phiếu dịch vụ liên kết. Khi đã có PDV → hiển thị thông tin PDV thay cho nút.

### 5.3 Nguồn lịch hẹn và trạng thái khởi tạo

| Nguồn | Tên hiển thị | Trạng thái khởi tạo | Cách tạo |
|---|---|---|---|
| Garage Care (Web GMS + App Garage) | — | **"Đã xác nhận"** | Chủ garage / Kế toán tạo thủ công |
| Driver+ | **"Từ ứng dụng tài xế"** | **"Lịch hẹn mới"** | Hệ thống nhận sự kiện tự động |
| Walk-in | **"Walk-in"** | **"Xe đã đến"** | Hệ thống tự sinh khi tạo PDV không gắn booking |

## 6. Validation Rules

> Áp dụng cho Form tạo (`FEAT-BOOK-CREATE`) và Form chỉnh sửa (`FEAT-BOOK-EDIT`).

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|---|---|---|---|
| SĐT khách hàng | Có | — | — |
| Tên khách hàng | Có | — | — |
| Biển số xe | Không | Kiểm tra định dạng | **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"** |
| Số khung xe (Số VIN) | Không | — | — |
| Số Km | Không | — | — |
| Hãng xe | Không | — | — |
| Dòng xe | Không | — | — |
| Năm sản xuất | Không | — | — |
| Phiên bản | Không | — | — |
| Hình ảnh xe | Không | — | — |
| Ngày hẹn | Có | Kiểm tra khung giờ (cảnh báo nếu có lịch hẹn gần, không chặn) | — |
| Giờ hẹn | Có | Kiểm tra khung giờ (cảnh báo nếu có lịch hẹn gần, không chặn) | — |
| Loại dịch vụ | Có | — | — |
| Mô tả tình trạng xe | Không | — | — |
| Ghi chú khách hàng | Không | — | — |
| Ghi chú nội bộ | Không | — | — |

**Điều kiện nút submit (Tạo / Lưu thay đổi):**
- Khả dụng (enabled): 5 trường bắt buộc đã điền đủ (SĐT khách hàng, Tên khách hàng, Ngày hẹn, Giờ hẹn, Loại dịch vụ) và hệ thống không đang gửi yêu cầu.
- Bị mờ (disabled): thiếu trường bắt buộc hoặc đang gửi yêu cầu.

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo UX-FLOW-BOOKING từ EP-BOOKING v2 và 8 FEAT: LIST v3, DETAIL v2, CREATE v6, EDIT v2, CONFIRM v1, ARRIVE v1, CANCEL v1, DECLINE v1. |
| 2026-05-20 | 2 | Business Authority | Sửa toàn bộ nguồn tạo: Garage Care = Web GMS + App Garage → trạng thái khởi tạo **"Đã xác nhận"**; xóa Web GMS khỏi nguồn riêng; xóa Garage Care khỏi nguồn bên ngoài; xóa §4.3.2; cập nhật §4.2 trạng thái → **"Đã xác nhận"**. |
