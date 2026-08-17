---
type: feature
artifact_kind: feature
status: DONE
version: 8
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SERVICE-ORDER"
boundary: "gf-sales"
last_reviewed: "2026-08-10"
---

# FEAT-SO-DETAIL: Chi tiết phiếu dịch vụ sửa chữa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-DETAIL` |
| Title | Chi tiết phiếu dịch vụ sửa chữa |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu dịch vụ sửa chữa bao gồm thông tin khách hàng, xe, dịch vụ, phụ tùng, trạng thái và lịch sử thanh toán, **so that** tôi nắm được tiến độ và chi phí sửa chữa.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Mở màn hình chi tiết phiếu dịch vụ
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: chủ garage nhấn vào dòng phiếu dịch vụ trong bảng.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết phiếu dịch vụ"** với tiêu đề là mã phiếu. Màn hình gồm các mục: **"Thông tin dịch vụ và thanh toán"**, **"Thông tin khách hàng"**, **"Thông tin xe"**, và các tab **"Dịch vụ & phụ tùng"**, **"Thông tin khác"**, **"Thông tin liên kết"**, **"Lịch sử thanh toán"**.

- [ ] **AC-2**: Hiển thị mục Thông tin dịch vụ và thanh toán
  - Tại: màn hình Chi tiết phiếu dịch vụ, mục **"Thông tin dịch vụ và thanh toán"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Loại phiếu"**, **"Thời gian dự kiến giao xe"**, **"Tổng tiền"**, **"Trạng thái thanh toán"**. Nếu báo giá đã gửi, hiển thị nhãn **"Đã gửi báo giá"**.

- [ ] **AC-3**: Hiển thị trạng thái phiếu dịch vụ
  - Tại: màn hình Chi tiết phiếu dịch vụ.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: trạng thái phiếu hiển thị dưới dạng badge với tên tương ứng:
    - **"Báo giá"** — phiếu mới tạo.
    - **"Đang thực hiện"** — đang sửa chữa.
    - **"Đã xác nhận"** — khách hàng xác nhận báo giá.
    - **"Đã từ chối"** — khách hàng từ chối báo giá.
    - **"Hoàn thành"** — sửa chữa hoàn tất.
    - **"Đã huỷ"** — phiếu bị hủy.
    - **"Đã tạo quyết toán"** — đã chuyển sang quyết toán.

- [ ] **AC-4**: Hiển thị trạng thái thanh toán
  - Tại: mục **"Thông tin dịch vụ và thanh toán"**, trường **"Trạng thái thanh toán"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: trạng thái thanh toán hiển thị với tên tương ứng:
    - **"Chưa thanh toán"** — chưa ghi nhận khoản thanh toán nào.
    - **"Thanh toán 1 phần"** — đã thanh toán một phần nhưng chưa đủ.
    - **"Đã thanh toán"** — đã thanh toán đủ.

- [ ] **AC-5**: Hiển thị mục Thông tin khách hàng
  - Tại: màn hình Chi tiết phiếu dịch vụ, mục **"Thông tin khách hàng"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Tên khách hàng"**, **"Số điện thoại"**, **"Loại khách hàng"** (giá trị: **"Cá nhân"** hoặc **"Tổ chức"**).

- [ ] **AC-6**: Hiển thị mục Thông tin xe
  - Tại: màn hình Chi tiết phiếu dịch vụ, mục **"Thông tin xe"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Số km đã chạy"**.

- [ ] **AC-7**: Hiển thị tab Dịch vụ & phụ tùng
  - Tại: màn hình Chi tiết phiếu dịch vụ, tab **"Dịch vụ & phụ tùng"**.
  - Khi: chủ garage chọn tab này.
  - Thì: hiển thị mục **"Dịch vụ thực hiện"** với bảng gồm các cột thông tin dịch vụ, và mục **"Phụ tùng sử dụng"** với bảng gồm các cột: **"Tên phụ tùng"**, **"Bên thanh toán"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**. Cuối bảng hiển thị dòng **"Tổng"**.

- [ ] **AC-8**: Hiển thị mục Tổng chi phí
  - Tại: màn hình Chi tiết phiếu dịch vụ, tab **"Dịch vụ & phụ tùng"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị mục **"Tổng chi phí"** gồm: **"Tổng thành tiền dịch vụ"**, **"Tổng thành tiền phụ tùng"**, **"Tổng thành tiền"** kèm mô tả **"(Dịch vụ + Phụ tùng)"**.

- [ ] **AC-9**: Hiển thị tab Thông tin khác
  - Tại: màn hình Chi tiết phiếu dịch vụ, tab **"Thông tin khác"**.
  - Khi: chủ garage chọn tab này.
  - Thì: hiển thị các mục ở trạng thái chỉ đọc:
    - Mục **"Người tạo"**: **"Người tạo"**, **"Thời gian tạo phiếu"**.
    - Mục **"Tổ chức"** (nếu loại khách hàng là **"Tổ chức"**): **"Tên tổ chức"**, **"Số điện thoại tổ chức"**, **"Mã số thuế"**.
    - Mục **"Bảo hiểm"** (nếu có bảo hiểm): **"Công ty Bảo hiểm"**, **"Số hợp đồng"**, **"Ngày hết hạn bảo hiểm"**, **"Số điện thoại liên hệ bảo hiểm"**, **"Người giám định"**, **"Hồ sơ bảo lãnh"**.
    - Thông tin xe bổ sung: **"Số khung xe (Số VIN)"**, **"Năm sản xuất"**, **"Phiên bản"**, **"Mức nhiên liệu"**, **"Mô tả tình trạng xe"**, **"Ghi chú"**, **"Hình ảnh xe"**, **"Tài liệu khác"**.

- [ ] **AC-10**: Hiển thị tab Thông tin liên kết
  - Tại: màn hình Chi tiết phiếu dịch vụ, tab **"Thông tin liên kết"**.
  - Khi: chủ garage chọn tab này.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Phiếu lịch hẹn liên kết"**, **"Yêu cầu báo giá liên kết"**, **"Đơn hàng ngoài sàn liên kết"**, **"Phiếu quyết toán liên kết"**, **"Phiếu xuất kho liên kết"**. Mỗi mục là liên kết dẫn đến chi tiết phiếu tương ứng (nếu có).

- [ ] **AC-11**: Hiển thị tab Lịch sử thanh toán
  - Tại: màn hình Chi tiết phiếu dịch vụ, tab **"Lịch sử thanh toán"**.
  - Khi: chủ garage chọn tab này.
  - Thì: hiển thị danh sách các giao dịch thanh toán đã ghi nhận, gồm thông tin **"Đã thanh toán"** và **"Còn lại"**.
  - Khi: phiếu chưa có giao dịch thanh toán nào.
  - Thì: hiển thị thông báo trống: **"Chưa có giao dịch thanh toán."**.

### Nhóm B — Nút hành động theo trạng thái phiếu

- [ ] **AC-12**: Nút hành động khi phiếu ở trạng thái **"Báo giá"**
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Báo giá"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị các nút: **"Chỉnh sửa"**, **"Hủy"** (hủy phiếu), **"Gửi báo giá"** (gửi báo giá đến Driver+), và nút tiến hành **"Đang thực hiện"** (bắt đầu sửa chữa).

- [ ] **AC-13**: Xác nhận bắt đầu sửa chữa
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Báo giá"**.
  - Khi: chủ garage nhấn nút tiến hành.
  - Thì: hệ thống hiển thị hộp thoại **"Xác nhận tiến hành dịch vụ"** với nội dung: **"Phiếu sẽ chuyển sang trạng thái"** **"Đang thực hiện"** kèm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-14**: Bắt đầu sửa chữa thành công
  - Tại: hộp thoại Xác nhận tiến hành dịch vụ.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái phiếu chuyển sang **"Đang thực hiện"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tiến hành dịch vụ thành công."**. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-15**: Nút hành động khi phiếu ở trạng thái **"Đang thực hiện"**
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Đang thực hiện"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị các nút: **"Chỉnh sửa"**, **"Hủy"** (hủy phiếu), **"Gửi báo giá"**, và nút **"Hoàn thành"** (hoàn thành phiếu dịch vụ).

- [ ] **AC-16**: Xác nhận hoàn thành phiếu dịch vụ
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Đang thực hiện"** hoặc **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút **"Hoàn thành"**.
  - Thì: hệ thống hiển thị hộp thoại **"Hoàn thành phiếu dịch vụ"** với nội dung: **"Bạn xác nhận hoàn thành phiếu dịch vụ?"** kèm dòng: **"Phiếu sẽ chuyển sang trạng thái"** **"Hoàn thành."** và nút **"Hủy"** / **"Xác nhận"**.

- [ ] **AC-17**: Hoàn thành phiếu dịch vụ thành công
  - Tại: hộp thoại Hoàn thành phiếu dịch vụ.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái phiếu chuyển sang **"Hoàn thành"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Hoàn thành dịch vụ thành công."**. Các nút hành động cập nhật theo trạng thái mới.
  - **Side-effect tự tạo phiếu xuất kho**: Nếu phiếu dịch vụ có phụ tùng sử dụng từ kho (nguồn **"Nền tảng"**), hệ thống tự động tạo một phiếu xuất kho ở trạng thái **"Chờ duyệt"** liên kết với phiếu dịch vụ này. Thời điểm trigger phụ thuộc loại phiếu: loại **"Dịch vụ xe"** (SERVICE) trigger khi phiếu chuyển sang **"Đang thực hiện"**; loại **"Bán lẻ"** (RETAIL) trigger khi phiếu chuyển sang **"Đã xác nhận"**. Phiếu xuất kho hiển thị tại tab **"Thông tin liên kết"**, mục **"Phiếu xuất kho liên kết"**.
  - **Side-effect emit sang Driver+ (BR-SO-DTL-007)**: Nếu phiếu dịch vụ liên kết với 1 lịch hẹn có nguồn từ Driver+ (`FEAT-BOOK-DRIVERPLUS-INBOUND`) và flag **`Document:DriverPlus=on`**, hệ thống gửi sự kiện **`DOCUMENT.SERVICE_ORDER.SYNC`** sang Driver+ kèm **mã phiếu dịch vụ** và **URL tuyệt đối để tải tệp phiếu dịch vụ**; Driver+ tự tải tệp từ URL, payload không đính kèm binary. URL có thời hạn hợp đồng 30 ngày kể từ thời điểm phát sự kiện. Việc gửi chứng từ không thay đổi vòng đời trạng thái booking. Đây là dữ liệu Driver+ dùng để ghi lịch sử vào hồ sơ số của xe (`FEAT-DP-046`, ngoài phạm vi feature này). Nếu chỉ có phiếu dịch vụ mà chưa có phiếu quyết toán, vẫn emit bình thường — không chờ đủ cả 2 loại phiếu (xem `FEAT-STL-CREATE` AC tương ứng cho phiếu quyết toán). Gửi lặp do retry cùng phiếu dịch vụ chỉ được Driver+ áp dụng một lần; GMS giữ ổ định `event_id` qua các lần retry theo outbox mandatory. Khi `Document:DriverPlus=off`, phiếu dịch vụ vẫn hoàn thành bình thường nhưng không phát sinh sự kiện chứng từ mới; luồng booking vẫn hoạt động theo flag `Booking:DriverPlus`. Chi tiết hợp đồng: `ADR-031` và `INTEG-EXT-driver-plus.md` §4.3.

- [ ] **AC-18**: Nút hành động khi phiếu ở trạng thái **"Đã xác nhận"**
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Đã xác nhận"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị các nút: **"Chỉnh sửa"**, **"Hủy"** (hủy phiếu), **"Gửi báo giá"**, và nút **"Hoàn thành"**.

- [ ] **AC-19**: Nút hành động khi phiếu ở trạng thái **"Hoàn thành"**
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Hoàn thành"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị nút **"Tạo quyết toán"**. Nút **"Chỉnh sửa"** và **"Hủy"** không hiển thị.

- [ ] **AC-20**: Nút hành động khi phiếu ở trạng thái **"Đã huỷ"** hoặc **"Đã tạo quyết toán"**
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Đã huỷ"** hoặc **"Đã tạo quyết toán"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống không hiển thị nút hành động chuyển trạng thái. Nếu phiếu đã hủy, hiển thị nhãn **"Phiếu dịch vụ đã hủy"**.

- [ ] **AC-21**: Nút hành động khi phiếu ở trạng thái **"Đã từ chối"**
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái **"Đã từ chối"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị nút **"Chỉnh sửa"** và **"Hủy"** (hủy phiếu). Không hiển thị nút hoàn thành.

### Nhóm B2 — Hủy phiếu dịch vụ

- [ ] **AC-22**: Mở hộp thoại hủy phiếu
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái cho phép hủy.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống hiển thị hộp thoại **"Xác nhận hủy phiếu"** gồm trường **"Ghi chú"** với placeholder **"Nhập chi tiết lý do hủy"** (bắt buộc) và nút **"Hủy"** / **"Xác nhận"**.

- [ ] **AC-23**: Validation lý do hủy phiếu
  - Tại: hộp thoại Xác nhận hủy phiếu, trường **"Ghi chú"**.
  - Khi: chủ garage bỏ trống trường lý do hủy và nhấn xác nhận.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập lý do hủy phiếu"**.

- [ ] **AC-24**: Hủy phiếu thành công
  - Tại: hộp thoại Xác nhận hủy phiếu.
  - Khi: chủ garage nhấn nút **"Xác nhận"** với lý do hợp lệ và hệ thống xử lý thành công.
  - Thì: trạng thái phiếu chuyển sang **"Đã huỷ"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Đã hủy phiếu thành công."**. Các nút hành động cập nhật theo trạng thái mới.

### Nhóm B3 — Gửi báo giá đến Driver+

- [ ] **AC-25**: Nhấn nút gửi báo giá
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái cho phép gửi báo giá.
  - Khi: chủ garage nhấn nút **"Gửi báo giá"**.
  - Thì: hệ thống hiển thị hộp thoại **"Gửi báo giá đến Driver+"** với nội dung: **"Hệ thống sẽ gửi thông tin báo giá của phiếu dịch vụ {mã phiếu} đến ứng dụng của tài xế. Vui lòng kiểm tra các thông tin bắt buộc sau:"** kèm thông tin **"Tài xế"**, **"Xe"**, **"Mã lịch hẹn"** (nếu có), **"Tổng tiền"**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-26**: Gửi báo giá thành công
  - Tại: hộp thoại Gửi báo giá đến Driver+.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Gửi báo giá thành công."**. Mục **"Thông tin dịch vụ và thanh toán"** cập nhật hiển thị nhãn **"Đã gửi báo giá"**.

### Nhóm B4 — Ghi nhận thanh toán

- [ ] **AC-27**: Mở hộp thoại ghi nhận thanh toán
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu có trạng thái thanh toán **"Chưa thanh toán"** hoặc **"Thanh toán 1 phần"**.
  - Khi: chủ garage nhấn nút ghi nhận thanh toán.
  - Thì: hệ thống hiển thị hộp thoại ghi nhận thanh toán gồm:
    - Trường **"Số tiền"** — bắt buộc.
    - Trường **"Hình thức thanh toán"** — bắt buộc.

- [ ] **AC-28**: Validation số tiền thanh toán
  - Tại: hộp thoại ghi nhận thanh toán, trường **"Số tiền"**.
  - Khi: chủ garage nhập số tiền không hợp lệ.
  - Thì:
    - Nếu bỏ trống: hiển thị thông báo lỗi **"Vui lòng nhập số tiền thanh toán."**.
    - Nếu số tiền không hợp lệ: hiển thị thông báo lỗi **"Số tiền thanh toán không hợp lệ."**.
    - Nếu số tiền lớn hơn số tiền còn lại: hiển thị thông báo lỗi **"Số tiền nhập vào lớn hơn số tiền khách cần trả."**.

- [ ] **AC-29**: Validation hình thức thanh toán
  - Tại: hộp thoại ghi nhận thanh toán, trường **"Hình thức thanh toán"**.
  - Khi: chủ garage không chọn hình thức thanh toán.
  - Thì: hiển thị thông báo lỗi: **"Vui lòng chọn hình thức thanh toán."**.

- [ ] **AC-30**: Ghi nhận thanh toán thành công
  - Tại: hộp thoại ghi nhận thanh toán.
  - Khi: chủ garage nhấn xác nhận với dữ liệu hợp lệ và hệ thống xử lý thành công.
  - Thì: hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Ghi nhận thanh toán thành công."**. Tab **"Lịch sử thanh toán"** cập nhật giao dịch mới. Trạng thái thanh toán cập nhật tương ứng.

### Nhóm B5 — In ấn

- [ ] **AC-31**: Các tùy chọn in ấn
  - Tại: màn hình Chi tiết phiếu dịch vụ.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị các tùy chọn in: **"In báo giá"**, **"In lệnh sửa chữa"**, **"In phiếu dịch vụ"**, **"Tạo hình ảnh phiếu"**.

- [ ] **AC-32**: Nút đặt hàng phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**, phiếu ở trạng thái cho phép đặt hàng.
  - Khi: chủ garage xem tab **"Dịch vụ & phụ tùng"**.
  - Thì: hệ thống hiển thị nút **"Đặt hàng"** cho phép tạo yêu cầu báo giá phụ tùng. Nút **"Đặt hàng"** không hiển thị khi phiếu ở trạng thái **"Hoàn thành"**, **"Đã tạo quyết toán"**, **"Đã huỷ"** hoặc **"Đã từ chối"**.

- [ ] **AC-33**: Nhấn nút chỉnh sửa
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái cho phép chỉnh sửa.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa phiếu dịch vụ (xem `FEAT-SO-EDIT`).

### Nhóm C — Phân quyền

- [ ] **AC-34**: Phân quyền xem chi tiết và thao tác phiếu dịch vụ
  - Tại: màn hình Chi tiết phiếu dịch vụ.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết phiếu, thực hiện chuyển trạng thái, hủy phiếu, gửi báo giá, ghi nhận thanh toán và in ấn. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-35**: Hành động chuyển trạng thái thất bại
  - Tại: hộp thoại xác nhận (bắt đầu sửa chữa, hoàn thành, hủy phiếu).
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái phiếu không thay đổi. Hộp thoại đóng lại.

- [ ] **AC-36**: Gửi báo giá thất bại
  - Tại: hộp thoại Gửi báo giá đến Driver+.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Hộp thoại đóng lại.

- [ ] **AC-37**: Ghi nhận thanh toán thất bại
  - Tại: hộp thoại ghi nhận thanh toán.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Hộp thoại giữ nguyên dữ liệu để chủ garage có thể thử lại.

- [ ] **AC-38**: Chưa gửi được phiếu dịch vụ sang Driver+
  - Tại: phiếu dịch vụ nguồn Driver+ đã được hoàn thành thành công và `Document:DriverPlus=on`.
  - Khi: hệ thống chưa tải được tệp lên kho lưu trữ hoặc chưa gửi được thông tin chứng từ sang Driver+.
  - Thì: kết quả hoàn thành phiếu dịch vụ vẫn được giữ nguyên; hệ thống phải lưu yêu cầu ở trạng thái chờ đồng bộ và tự động thử gửi lại cho đến khi thành công. Chủ garage không phải hoàn thành lại hoặc tạo lại phiếu. Các lần thử lại của cùng một phiếu không được tạo chứng từ trùng lặp tại Driver+.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SERVICE-ORDER.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Lấy chi tiết phiếu: Query `GetServiceOrderByCode`
- Bắt đầu sửa chữa: Mutation `StartServiceOrderV3`
- Hoàn thành phiếu: Mutation `CompleteServiceOrderV3`
- Hủy phiếu: Mutation `CancelServiceOrderV3`
- Gửi báo giá: Mutation `SendQuotationV3`
- Ghi nhận thanh toán: Mutation `RecordServiceOrderPaymentByCode`

## 5. Business Rules

- **BR-SO-DTL-001**: Phiếu dịch vụ sửa chữa chỉ được chuyển trạng thái theo quy tắc đã định sẵn cho loại phiếu **"Dịch vụ xe"**: **"Báo giá"** sang **"Đang thực hiện"**; **"Đang thực hiện"** hoặc **"Đã xác nhận"** sang **"Hoàn thành"**; **"Hoàn thành"** sang **"Đã tạo quyết toán"**. Phiếu ở trạng thái **"Báo giá"**, **"Đang thực hiện"**, **"Đã xác nhận"**, **"Đã từ chối"** có thể bị hủy.
- **BR-SO-DTL-002**: Ghi nhận thanh toán cập nhật số tiền đã trả, số tiền còn nợ và trạng thái thanh toán. Khi thanh toán đủ (bao gồm dung sai làm tròn), trạng thái thanh toán chuyển sang **"Đã thanh toán"** và số tiền còn nợ về 0. Số tiền thanh toán không được vượt quá số tiền khách cần trả.
- **BR-SO-DTL-003**: Gửi báo giá đến Driver+ bị chặn khi phiếu không có dịch vụ hoặc phụ tùng đang hoạt động.
- **BR-SO-DTL-004**: Nút **"Chỉnh sửa"** chỉ hiển thị khi phiếu ở trạng thái **"Báo giá"**, **"Đang thực hiện"**, **"Đã xác nhận"**, hoặc **"Đã từ chối"**.
- **BR-SO-DTL-005**: Nút **"Đặt hàng"** phụ tùng không hiển thị khi phiếu ở trạng thái **"Hoàn thành"**, **"Đã tạo quyết toán"**, **"Đã huỷ"** hoặc **"Đã từ chối"**.
- **BR-SO-DTL-006**: Khi phiếu dịch vụ có phụ tùng sử dụng từ kho (nguồn **"Nền tảng"**), hệ thống tự động tạo phiếu xuất kho ở trạng thái **"Chờ duyệt"** liên kết với phiếu dịch vụ. Thời điểm trigger phụ thuộc loại phiếu: loại **"Dịch vụ xe"** (SERVICE) → khi chuyển sang **"Đang thực hiện"**; loại **"Bán lẻ"** (RETAIL) → khi chuyển sang **"Đã xác nhận"**. Phiếu xuất kho do `gf-inventory-worker` (`DeliveryFulfillmentWorkflow`) xử lý qua sự kiện `ServiceOrderStatusChangedEvent`.
- **BR-SO-DTL-007** (mới, 2026-08-03; chốt contract 2026-08-10): Khi phiếu dịch vụ hoàn thành, có liên kết booking nguồn Driver+ và `Document:DriverPlus=on`, hệ thống emit **`DOCUMENT.SERVICE_ORDER.SYNC`** kèm mã phiếu và URL tuyệt đối tải tệp phiếu dịch vụ; không nhúng binary và không phụ thuộc phiếu quyết toán đã tạo hay chưa. Khi chưa tải hoặc gửi được tệp, hệ thống vẫn hoàn thành phiếu, phải lưu yêu cầu chờ đồng bộ và tự động thử lại đến khi thành công; người dùng không phải tạo lại phiếu và Driver+ không được ghi trùng chứng từ. Khi flag chứng từ `off`, nghiệp vụ hoàn thành phiếu vẫn thành công nhưng không phát sinh event chứng từ mới. Flag này độc lập với `Booking:DriverPlus`. Xem `ADR-031` và `INTEG-EXT-driver-plus.md` §4.3. `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` chỉ cover đồng bộ trạng thái booking, không sở hữu emit phiếu DV/QT.

## 6. Edge Cases

- **EC-1**: Phiếu dịch vụ không có lịch hẹn liên kết — tab **"Thông tin liên kết"** hiển thị trường **"Phiếu lịch hẹn liên kết"** trống (phiếu walk-in).
- **EC-2**: Phiếu có trạng thái thanh toán **"Đã thanh toán"** nhưng chưa hoàn thành — hệ thống cho phép tiếp tục sửa chữa, trạng thái thanh toán và trạng thái phiếu hoạt động độc lập.
- **EC-3**: Gửi báo giá khi phiếu không có lịch hẹn từ Driver+ — hộp thoại xác nhận gửi báo giá không hiển thị dòng **"Mã lịch hẹn"**.
- **EC-4**: Yêu cầu đặt hàng phụ tùng khi chưa chọn phụ tùng — hiển thị thông báo **"Vui lòng chọn ít nhất một phụ tùng"**.
- **EC-5**: Yêu cầu đặt hàng phụ tùng khi chưa chọn nhà cung cấp — hiển thị thông báo **"Vui lòng chọn nhà cung cấp"**.

## 7. Out of Scope

- Chỉnh sửa phiếu dịch vụ → xem `FEAT-SO-EDIT`.
- Tạo phiếu dịch vụ mới → xem `FEAT-SO-CREATE`.
- Danh sách phiếu dịch vụ → xem `FEAT-SO-LIST`.
- Chi tiết phiếu bán lẻ phụ tùng — thuộc phạm vi phiếu bán lẻ (loại phiếu khác).
- Quyết toán phiếu dịch vụ → xem `EP-SETTLEMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (service-order-code detail screen, payment modal, send-quote modal, cancel modal, status transitions, print actions) |
| 2026-05-20 | 2 | Business Authority | Bổ sung AC-17 side-effect: tự động tạo phiếu xuất kho khi SO → "Hoàn thành" có phụ tùng từ kho. Thêm BR-SO-DTL-006 (auto-creation via DeliveryFulfillmentWorkflow). |
| 2026-05-21 | 3 | Business Authority | Sửa AC-17 + BR-SO-DTL-006: trigger tạo phiếu xuất kho phụ thuộc loại phiếu — SERVICE → "Đang thực hiện" (IN_PROGRESS), RETAIL → "Đã xác nhận" (CONFIRMED). Trước đó ghi nhầm "Hoàn thành" chung cho cả hai loại. |
| 2026-08-03 | 4 | user (Business Authority) qua main agent | **Đợt viết lại tích hợp Driver+ (EP-BOOKING)**: AC-17 thêm side-effect emit sang Driver+ khi hoàn thành phiếu dịch vụ (mã phiếu + tệp), áp dụng cho booking có nguồn Driver+. Thêm BR-SO-DTL-007. Quyết định giữ logic này trong FEAT-SO-DETAIL (không tách FEAT/BR cross-boundary riêng) theo boundary ownership sẵn có. |
| 2026-08-03 | 5 | user (Business Authority) qua main agent | **Fix P2 (BA-review round 1)**: AC-17 side-effect emit Driver+ gỡ ngoặc mập mờ "(file/URL)" — thêm marker **NEED CONFIRMATION Architecture** riêng cho định dạng tệp (URL tải về hay binary đính kèm), tách khỏi marker sẵn có về tên event. |
| 2026-08-10 | 6 | user (Business Authority) qua main agent | **Đóng NEED CONFIRMATION theo ADR-031 v2**: AC-17 và BR-SO-DTL-007 chốt event `DOCUMENT.SERVICE_ORDER.SYNC`; payload gửi mã phiếu + URL tuyệt đối tải tệp, không nhúng binary; URL có thời hạn hợp đồng 30 ngày; `event_id` ổn định qua retry. |
| 2026-08-10 | 7 | Business Authority qua main agent | **Đồng bộ feature flag với ADR-031**: việc gửi phiếu dịch vụ dùng `Document:DriverPlus`, độc lập với `Booking:DriverPlus`. Khi tắt flag chứng từ, phiếu dịch vụ vẫn hoàn thành bình thường nhưng không phát sinh event chứng từ mới. |
| 2026-08-10 | 8 | Business Authority qua main agent | **Bổ sung xử lý lỗi đồng bộ chứng từ**: AC-38 và BR-SO-DTL-007 quy định lỗi tải/gửi tệp không rollback việc hoàn thành phiếu; hệ thống phải lưu yêu cầu chờ đồng bộ và tự động thử lại, không yêu cầu người dùng tạo lại và không tạo bản ghi trùng tại Driver+. |
