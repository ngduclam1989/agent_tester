---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SERVICE-ORDER"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-SO-CREATE: Tạo phiếu dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-CREATE` |
| Title | Tạo phiếu dịch vụ |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu dịch vụ sửa chữa cho xe khách hàng bao gồm thông tin khách hàng, xe, dịch vụ thực hiện và phụ tùng sử dụng, **so that** tôi có thể ghi nhận và theo dõi công việc sửa chữa/bảo dưỡng.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form và điền thông tin

- [ ] **AC-1**: Mở màn hình tạo phiếu dịch vụ
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: chủ garage nhấn nút tạo phiếu dịch vụ.
  - Thì: hệ thống chuyển sang màn hình **"Tạo phiếu dịch vụ"** với form trống, gồm 7 mục: Thông tin chung, Thông tin khách hàng, Thông tin xe, Mô tả tình trạng xe & Ghi chú, Chi tiết dịch vụ thực hiện, Phụ tùng sử dụng, Tổng chi phí.

### Nhóm B — Mục: Thông tin chung

- [ ] **AC-2**: Chọn nhân viên tạo phiếu
  - Tại: mục **"Thông tin chung"**, trường **"Nhân viên tạo phiếu"**.
  - Khi: chủ garage chọn nhân viên tạo phiếu.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn nhân viên tạo phiếu"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**.

- [ ] **AC-3**: Nhập thời gian dự kiến giao xe
  - Tại: mục **"Thông tin chung"**, trường **"Thời gian dự kiến giao xe"**.
  - Khi: chủ garage nhập thời gian dự kiến giao xe.
  - Thì: hệ thống hiển thị ô nhập thời gian. Placeholder: **"Nhập thời gian dự kiến giao xe"**. Trường này không bắt buộc.

- [ ] **AC-4**: Chọn loại dịch vụ
  - Tại: mục **"Thông tin chung"**, trường loại dịch vụ.
  - Khi: chủ garage chọn loại dịch vụ.
  - Thì: hệ thống hiển thị nhóm tùy chọn với các giá trị: **"Car Spa"**, **"Sửa chữa"**, **"Bảo dưỡng"**. Trường này bắt buộc.

### Nhóm C — Mục: Thông tin khách hàng

- [ ] **AC-5**: Chọn loại khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường loại khách hàng.
  - Khi: chủ garage chọn loại khách hàng.
  - Thì:
    - Nếu chọn **"Cá nhân"** (mặc định): form hiển thị trường SĐT khách hàng và Tên khách hàng. Không hiển thị trường tổ chức.
    - Nếu chọn **"Tổ chức"**: form hiển thị thêm trường **"SĐT tổ chức"**, **"Tên tổ chức"** (placeholder: **"Nhập tên tổ chức"**), **"Mã số thuế"**, ngoài ra vẫn hiển thị trường SĐT khách hàng và Tên khách hàng.

- [ ] **AC-6**: Nhập SĐT khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"SĐT khách hàng"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống hiển thị ô nhập có gợi ý từ danh sách khách hàng đã có. Placeholder: **"Chọn/Nhập SĐT khách hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại không đúng định dạng"**.

- [ ] **AC-7**: Nhập tên khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"Tên khách hàng"**.
  - Khi: chủ garage nhập tên khách hàng.
  - Thì: hệ thống hiển thị ô nhập có gợi ý từ danh sách khách hàng đã có. Placeholder: **"Chọn/Nhập tên khách hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên khách hàng."**.

- [ ] **AC-8**: Chọn khách hàng từ gợi ý
  - Tại: mục **"Thông tin khách hàng"**, danh sách gợi ý (từ SĐT hoặc tên).
  - Khi: chủ garage chọn một khách hàng trong danh sách gợi ý.
  - Thì: hệ thống tự động điền SĐT khách hàng và tên khách hàng tương ứng. Nếu khách hàng có xe đã lưu, hệ thống tự động gợi ý danh sách xe ở mục Thông tin xe.

### Nhóm D — Mục: Thông tin xe

- [ ] **AC-9**: Nhập biển số xe
  - Tại: mục **"Thông tin xe"**, trường **"Biển số"**.
  - Khi: chủ garage nhập biển số xe.
  - Thì: hệ thống hiển thị ô nhập có gợi ý từ danh sách xe của khách hàng đã chọn. Trường này không bắt buộc.
  - Khi: chủ garage chọn xe từ gợi ý.
  - Thì: hệ thống tự động điền các trường Hãng xe, Dòng xe, Năm sản xuất, Phiên bản xe, Số khung xe (Số VIN) từ dữ liệu xe đã có.
  - Khi: chủ garage nhập biển số không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

- [ ] **AC-10**: Chọn hãng xe
  - Tại: mục **"Thông tin xe"**, trường **"Hãng xe"**.
  - Khi: chủ garage chọn hãng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn hãng xe."**.

- [ ] **AC-11**: Chọn dòng xe
  - Tại: mục **"Thông tin xe"**, trường **"Dòng xe"**.
  - Khi: chủ garage chọn dòng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Danh sách dòng xe phụ thuộc vào hãng xe đã chọn. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn dòng xe."**.

- [ ] **AC-12**: Nhập thông tin xe bổ sung
  - Tại: mục **"Thông tin xe"**.
  - Khi: chủ garage nhập các trường bổ sung.
  - Thì: hệ thống hiển thị các trường:
    - **"Năm sản xuất"** — ô chọn. Không bắt buộc.
    - **"Phiên bản xe"** — ô chọn. Không bắt buộc.
    - **"Số khung xe (Số VIN)"** — ô nhập text. Không bắt buộc.
    - **"Số km đã chạy"** — ô nhập số, placeholder: **"Nhập số km đã chạy"**. Không bắt buộc.
    - **"Mức nhiên liệu"** — ô nhập, placeholder: **"Nhập mức nhiên liệu"**. Không bắt buộc.
    - **"Màu xe"** — ô chọn. Không bắt buộc.

- [ ] **AC-13**: Thông tin bảo hiểm
  - Tại: mục **"Thông tin xe"**, toggle bảo hiểm.
  - Khi: chủ garage chọn trạng thái bảo hiểm.
  - Thì:
    - Nếu chọn **"Không"** (mặc định): không hiển thị trường bảo hiểm.
    - Nếu chọn **"Có"**: form hiển thị thêm các trường:
      - **"Công ty bảo hiểm"** — bắt buộc. Khi bỏ trống, hiển thị thông báo lỗi: **"Vui lòng nhập tên công ty bảo hiểm."**.
      - **"Số hợp đồng bảo hiểm"** — placeholder: **"Nhập số hợp đồng"**. Không bắt buộc.
      - **"Ngày hết hạn"** — bộ chọn ngày. Không bắt buộc.
      - **"Số điện thoại liên hệ bảo hiểm"** — ô nhập. Không bắt buộc.
      - **"Người giám định"** — placeholder: **"Nhập tên người giám định"**. Không bắt buộc.

- [ ] **AC-14**: Tải ảnh đăng kiểm (OCR)
  - Tại: mục **"Thông tin xe"**, trường **"Tải ảnh đăng kiểm để tự động điền thông tin xe"**.
  - Khi: chủ garage tải lên ảnh đăng kiểm.
  - Thì: hệ thống nhận diện ảnh và tự động điền các trường thông tin xe (biển số, hãng xe, dòng xe, số khung xe, v.v.) từ kết quả nhận diện. Trường này không bắt buộc.

- [ ] **AC-15**: Tải tài liệu đính kèm
  - Tại: mục **"Thông tin xe"**.
  - Khi: chủ garage tải lên tài liệu.
  - Thì: hệ thống cho phép tải lên các loại tài liệu:
    - **"Tài liệu khác"** — file upload. Không bắt buộc.
    - **"Hồ sơ bảo lãnh"** — file upload. Không bắt buộc.
    - **"Biên bản bàn giao nhận xe"** — file upload. Không bắt buộc.

### Nhóm E — Mục: Mô tả tình trạng xe & Ghi chú

- [ ] **AC-16**: Nhập mô tả tình trạng xe
  - Tại: mục mô tả, trường **"Mô tả tình trạng xe"**.
  - Khi: chủ garage nhập mô tả.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Trường này không bắt buộc.

- [ ] **AC-17**: Nhập ghi chú
  - Tại: mục ghi chú, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Trường này không bắt buộc.

### Nhóm F — Mục: Chi tiết dịch vụ thực hiện

- [ ] **AC-18**: Thêm dòng dịch vụ
  - Tại: mục **"Chi tiết dịch vụ thực hiện"**.
  - Khi: chủ garage thêm dòng dịch vụ mới.
  - Thì: hệ thống hiển thị dòng mới với các trường:
    - **"Chọn/Nhập tên dịch vụ"** — ô chọn/nhập có gợi ý từ danh mục dịch vụ.
    - **"Chọn người thực hiện"** — ô chọn nhân viên.
    - **"Chọn bên thanh toán"** — ô chọn với giá trị C (khách hàng) hoặc I (bảo hiểm).
    - **SL** (số lượng) — ô nhập số.
    - **ĐVT** (đơn vị tính) — ô chọn.
    - **Đơn giá** — ô nhập số.
    - **CK%** (chiết khấu phần trăm) — ô nhập số, mặc định **"0 %"**.
    - **Thành tiền** — tính tự động = SL x Đơn giá x (1 - CK%).
  - Cho phép thêm nhiều dòng dịch vụ.

- [ ] **AC-19**: Lọc dịch vụ theo phân khúc
  - Tại: mục **"Chi tiết dịch vụ thực hiện"**, trường **"Chọn phân khúc"**.
  - Khi: chủ garage chọn phân khúc.
  - Thì: danh sách gợi ý dịch vụ được lọc theo phân khúc đã chọn.

- [ ] **AC-20**: Điều kiện hiển thị bên thanh toán bảo hiểm
  - Tại: mục **"Chi tiết dịch vụ thực hiện"**, trường **"Chọn bên thanh toán"**.
  - Khi: chủ garage chọn bên thanh toán cho dòng dịch vụ.
  - Thì: tùy chọn I (bảo hiểm) chỉ hiển thị khi toggle bảo hiểm ở mục Thông tin xe đang bật (**"Có"**). Khi toggle bảo hiểm tắt, chỉ hiển thị tùy chọn C (khách hàng).

### Nhóm G — Mục: Phụ tùng sử dụng

- [ ] **AC-21**: Thêm dòng phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**.
  - Khi: chủ garage thêm dòng phụ tùng mới.
  - Thì: hệ thống hiển thị dòng mới với các trường:
    - **"Chọn tên phụ tùng"** — ô chọn/nhập có gợi ý từ danh mục phụ tùng.
    - **SL** (số lượng) — ô nhập số.
    - **ĐVT** (đơn vị tính) — ô chọn.
    - **Đơn giá** — ô nhập số.
    - **CK%** (chiết khấu phần trăm) — ô nhập số, mặc định **"0 %"**.
    - **Thành tiền** — tính tự động = SL x Đơn giá x (1 - CK%).
  - Cho phép thêm nhiều dòng phụ tùng.

- [ ] **AC-22**: Kiểm tra tồn kho phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**, sau khi chọn phụ tùng.
  - Khi: chủ garage chọn phụ tùng từ danh mục.
  - Thì: hệ thống kiểm tra số lượng tồn kho hiện có và hiển thị cho người dùng. Nếu tồn kho không đủ so với số lượng nhập, hệ thống hiển thị cảnh báo nhưng vẫn cho phép thêm.

### Nhóm H — Mục: Tổng chi phí

- [ ] **AC-23**: Hiển thị tổng chi phí
  - Tại: mục **"Tổng chi phí"**.
  - Khi: chủ garage đã thêm dịch vụ và/hoặc phụ tùng.
  - Thì: hệ thống tự động tính và hiển thị:
    - **"Tổng thành tiền dịch vụ"** — tổng thành tiền tất cả dòng dịch vụ.
    - **"Tổng thành tiền phụ tùng"** — tổng thành tiền tất cả dòng phụ tùng.
    - **"Tổng thành tiền"** với mô tả **"(Dịch vụ + Phụ tùng)"** — tổng cộng = Tổng thành tiền dịch vụ + Tổng thành tiền phụ tùng.

### Nhóm I — Validation chung

- [ ] **AC-24**: Validation chiết khấu
  - Tại: mục Chi tiết dịch vụ thực hiện hoặc Phụ tùng sử dụng, trường CK%.
  - Khi: chủ garage nhập giá trị chiết khấu.
  - Thì: hệ thống chỉ chấp nhận giá trị từ 0% đến 100%. Nếu ngoài khoảng, hiển thị thông báo lỗi: **"Chiết khấu phải trong khoảng 0% - 100%"**.

- [ ] **AC-25**: Validation số lượng
  - Tại: mục Chi tiết dịch vụ thực hiện hoặc Phụ tùng sử dụng, trường SL.
  - Khi: chủ garage nhập số lượng.
  - Thì: hệ thống chỉ chấp nhận giá trị lớn hơn 0. Nếu nhập giá trị bằng 0 hoặc âm, hiển thị thông báo lỗi: **"Số lượng phải lớn hơn 0."**.

### Nhóm J — Nút hành động trên form

- [ ] **AC-26**: Điều kiện nút tạo phiếu dịch vụ
  - Tại: cuối form tạo phiếu dịch vụ, nút submit.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Nhân viên tạo phiếu, Loại dịch vụ, SĐT khách hàng, Tên khách hàng, Hãng xe, Dòng xe) và hệ thống không đang gửi yêu cầu.
  - Thì: nút submit ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút submit ở trạng thái bị mờ (disabled).

- [ ] **AC-27**: Hủy bỏ tạo phiếu dịch vụ
  - Tại: form tạo phiếu dịch vụ, nút hủy bỏ.
  - Khi: chủ garage nhấn nút hủy bỏ.
  - Thì: hệ thống đóng form tạo phiếu dịch vụ và quay về màn hình Danh sách phiếu dịch vụ. Dữ liệu đã nhập trên form không được lưu.

### Nhóm K — Phân quyền

- [ ] **AC-28**: Phân quyền tạo phiếu dịch vụ
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo phiếu dịch vụ và có quyền tạo phiếu dịch vụ.

### Nhóm L — Xử lý lỗi và trạng thái sau tạo

- [ ] **AC-29**: Tạo phiếu dịch vụ thành công
  - Tại: form tạo phiếu dịch vụ, sau khi nhấn nút submit.
  - Khi: hệ thống tạo phiếu dịch vụ thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"**, mô tả **"Tạo phiếu dịch vụ thành công."**. Phiếu dịch vụ được tạo với trạng thái **"Báo giá"**. Mã phiếu dịch vụ được hệ thống tự sinh. Hệ thống chuyển về màn hình chi tiết phiếu dịch vụ vừa tạo.

- [ ] **AC-30**: Tự sinh lịch hẹn walk-in khi tạo phiếu dịch vụ không gắn lịch hẹn
  - Tại: hệ thống tự động xử lý khi tạo phiếu dịch vụ.
  - Khi: chủ garage tạo phiếu dịch vụ (loại sửa chữa/bảo dưỡng/Car Spa, không phải bán lẻ) mà không gắn với lịch hẹn nào.
  - Thì: hệ thống tự động sinh một lịch hẹn walk-in với trạng thái **"Xe đã đến"**, nguồn **"Walk-in"**, thời điểm xe đến ghi nhận là thời điểm tạo phiếu. Lịch hẹn walk-in xuất hiện trong danh sách lịch hẹn và được liên kết với phiếu dịch vụ vừa tạo. Không áp dụng cho phiếu dịch vụ loại bán lẻ.

- [ ] **AC-31**: Tạo phiếu dịch vụ thất bại
  - Tại: form tạo phiếu dịch vụ, sau khi nhấn nút submit.
  - Khi: hệ thống tạo phiếu dịch vụ thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

- [ ] **AC-32**: Validation form thất bại
  - Tại: form tạo phiếu dịch vụ, sau khi nhấn nút submit.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-2 đến AC-25) và không gửi yêu cầu lên hệ thống.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-SERVICE-REPAIR.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Tạo phiếu dịch vụ: Mutation `CreateServiceOrderV3`
- Kiểm tra tồn kho phụ tùng: Query `GetTotalStockBySkus`
- Gợi ý khách hàng: Query `SuggestCustomerByPhone`, `SuggestCustomerByName`
- Gợi ý xe theo biển số: Query `SuggestVehicleByPlate`
- Danh mục hãng/dòng xe: Query `SearchCatalog`
- Danh mục dịch vụ: từ danh mục hệ thống
- Danh mục phụ tùng: từ danh mục hệ thống

## 5. Business Rules

- **BR-SO-CRE-001**: Phiếu dịch vụ được tạo với trạng thái khởi tạo là **"Báo giá"**. Mã phiếu dịch vụ được hệ thống tự sinh, không cho phép nhập thủ công.
- **BR-SO-CRE-002**: Khi tạo phiếu dịch vụ (loại sửa chữa/bảo dưỡng/Car Spa, không phải bán lẻ) mà không gắn với lịch hẹn nào, hệ thống tự động sinh lịch hẹn walk-in với trạng thái **"Xe đã đến"**, nguồn **"Walk-in"**, thời điểm xe đến là thời điểm tạo phiếu. Không áp dụng cho phiếu dịch vụ loại bán lẻ (xem `FEAT-SO-SALE-CREATE`).
- **BR-SO-CRE-003**: Thông tin khách hàng và xe trong phiếu dịch vụ là bản snapshot tại thời điểm tạo — chỉ đọc, không phải dữ liệu chủ. Dữ liệu chủ do hệ thống quản lý khách hàng nắm giữ.
- **BR-SO-CRE-004**: Chiết khấu trên mỗi dòng dịch vụ hoặc phụ tùng phải nằm trong khoảng 0% - 100%.
- **BR-SO-CRE-005**: Số lượng trên mỗi dòng dịch vụ hoặc phụ tùng phải lớn hơn 0.
- **BR-SO-CRE-006**: Khi toggle bảo hiểm bật, trường **"Công ty bảo hiểm"** là bắt buộc. Bên thanh toán I (bảo hiểm) trên dòng dịch vụ chỉ khả dụng khi toggle bảo hiểm bật.
- **BR-SO-CRE-007**: Thành tiền mỗi dòng = SL x Đơn giá x (1 - CK%). Tổng thành tiền = Tổng dịch vụ + Tổng phụ tùng. Hệ thống tự động tính, người dùng không nhập trực tiếp.

## 6. Edge Cases

- **EC-1**: Khách hàng mới chưa có trong hệ thống — cho phép nhập thủ công SĐT và tên mà không cần chọn từ gợi ý.
- **EC-2**: Xe mới chưa có trong hệ thống — cho phép nhập thủ công biển số và thông tin xe.
- **EC-3**: Phụ tùng không đủ tồn kho — hiển thị cảnh báo nhưng vẫn cho phép thêm vào phiếu (không chặn).
- **EC-4**: OCR ảnh đăng kiểm không nhận diện được — cho phép nhập thủ công các trường thông tin xe.
- **EC-5**: Tạo phiếu dịch vụ từ màn hình chi tiết lịch hẹn (lịch hẹn ở trạng thái **"Xe đã đến"**) — thông tin khách hàng và xe được tự động điền từ lịch hẹn, không tự sinh thêm lịch hẹn walk-in.

## 7. Out of Scope

- Xem chi tiết phiếu dịch vụ sau khi tạo → xem `FEAT-SO-DETAIL`.
- Chỉnh sửa phiếu dịch vụ → xem `FEAT-SO-EDIT`.
- Tạo phiếu bán lẻ phụ tùng → xem `FEAT-SO-SALE-CREATE`.
- Thanh toán và quyết toán phiếu dịch vụ → xem `FEAT-SO-DETAIL`.
- Gửi báo giá qua Driver+ → xem `FEAT-SO-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (service-order create form, 7 mục form, walk-in auto-booking) |
