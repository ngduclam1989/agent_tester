# TÀI LIÊU YÊU CẦU: ONBOARD TENANT

## 1. TỔNG QUAN (OVERVIEW)
Mục đích của chức năng này là cho phép người quản trị (Admin) khởi tạo hồ sơ một Khách hàng doanh nghiệp (Tenant) mới vào hệ thống. Chức năng bao gồm việc thiết lập các thông tin cơ bản, cấu hình gói dịch vụ, định nghĩa mô hình hoạt động, chọn đối tác bảo hiểm và nhập thông tin xuất hóa đơn. Việc khởi tạo này là bước đầu tiên trong vòng đời của một Tenant (Onboarding Workflow).

## 2. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)
Danh sách các tính năng người dùng có thể thực hiện:
- Khởi tạo Tenant: Nhập và lưu trữ thông tin cơ bản, địa chỉ, ảnh đại diện, và ghi chú triển khai.
- Cấu hình gói dịch vụ: Lựa chọn loại Tenant, mô hình hoạt động, gói dịch vụ, và tên miền con.
- Cấu hình thông tin xuất hóa đơn: Nhập thông tin pháp nhân để phục vụ xuất hóa đơn.
- Phân loại khu vực: Chọn vùng, tỉnh/thành phố, và xã/phường hoạt động.

User Story:
Là một người dùng quản trị thuộc hệ thống (tenant management user), tôi muốn có chức năng Khởi tạo Tenant đầy đủ thông tin (khởi tạo, danh sách, chi tiết, kích hoạt, owner, đối tác bảo hiểm) để tôi có thể đưa dữ liệu khách hàng vào hệ thống COP và duy trì tính truy xuất dữ liệu.

Tiêu chí chấp nhận (Acceptance Criteria):
- Hệ thống hiển thị form nhập liệu với các trường đúng thiết kế, phân chia khu vực "Thông tin Tenant" và "Thông tin xuất hóa đơn".
- Hệ thống từ chối thao tác và hiển thị lỗi phù hợp nếu người dùng thiếu quyền, hoặc dữ liệu đầu vào không hợp lệ (ví dụ: trùng tên miền con, trùng số điện thoại).
- Thao tác khởi tạo thành công phải ghi nhận đầy đủ actor, thời điểm, bản ghi liên quan (Audit) và lưu đúng các trạng thái vòng đời.

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU (FIELD SPECIFICATIONS)

Bảng chi tiết các thành phần UI dựa trên quan sát giao diện:

| Tên trường trên UI | Tên trường hệ thống | Loại dữ liệu | Bắt buộc | Quy tắc xác thực (Validation Rules) và Ghi chú |
| --- | --- | --- | --- | --- |
| Tên Tenant | name | Text Input | Có | Không được để trống. |
| Loại Tenant | type | Dropdown | Có | Chỉ chấp nhận giá trị GARAGE hoặc VENDOR. |
| Loại mô hình | tenantBusinessModel | Dropdown | Có | Ví dụ: Garage sửa chữa (REPAIRING), SPA, ALL_IN_ONE, SPARE_PARTS. |
| Tên miền con | subdomain | Text Input | Có | Không quá 20 ký tự, không rỗng, phải là duy nhất. Form có tiền tố url https://<tendangnhap>.abc.com |
| Gói dịch vụ | saasTier | Dropdown | Có | Chọn phân hạng (Ví dụ: Free, Standard, Gold, Enterprise). |
| Các dịch vụ | saasSolution | Dropdown | Có | Ví dụ: Garage App, Vendor (GMS, VMS, EXPRESS). |
| Email | companyEmailAddress | Text Input | Không | Nếu nhập, phải đúng định dạng email. |
| Số điện thoại | companyPhoneNumber | Text Input | Có | Phải là duy nhất toàn hệ thống, không được rỗng. |
| Người đại diện | representativeName | Text Input | Có | Tên người đại diện pháp luật, không được để trống. |
| Kế toán trưởng | chiefAccountantName | Text Input | Không | Tên kế toán trưởng. |
| Đối tác bảo hiểm | N/A (Extension/Ops) | Multi-select | Không | Hỗ trợ chọn nhiều (dạng chips như BIC - BH BIDV, PVI - BH Dầu khí). |
| Vùng | operationRegionCode | Dropdown | Có | Phải chọn mã vùng hợp lệ từ danh mục MDM. |
| Tỉnh / Thành phố | city | Dropdown | Có | Mã vị trí từ danh mục. Bắt buộc để khởi tạo chi nhánh sau này. |
| Xã / Phường | ward | Dropdown | Có | Mã vị trí từ danh mục. |
| Địa chỉ chi tiết | companyHoAddress | Text Input | Có | Địa chỉ chi tiết (nhập tự do). |
| Ảnh đại diện | logoUrl | File Upload | Không | Hiển thị thumbnail kèm tên file, định dạng, dung lượng. Có biểu tượng thùng rác để xóa. |
| Ghi chú triển khai | opsNote | Text Input | Không | Ghi chú thêm cho bộ phận triển khai. |
| Tên công ty | invoiceCompanyName | Text Input | Có | Tối đa 255 ký tự. Bắt buộc đối với GARAGE khi có config hóa đơn. |
| Email công ty | invoiceCompanyEmailAddress | Text Input | Có | Phải đúng định dạng email. Tối đa 255 ký tự. |
| Mã số thuế | taxCode | Text Input | Có | Tối đa 50 ký tự. Bắt buộc đối với GARAGE. |
| Địa chỉ công ty | invoiceCompanyAddress | Text Input | Có | Tối đa 255 ký tự. Bắt buộc đối với GARAGE. |

Các nút tương tác:
- Hủy bỏ (Cancel): Nút thứ cấp. Hủy bỏ quá trình nhập liệu, đóng form, không lưu dữ liệu.
- Lưu (Save): Nút chính (màu xanh). Kích hoạt việc kiểm tra tính hợp lệ của toàn bộ form và gọi API hệ thống để khởi tạo Tenant.

## 4. CÁC LUỒNG XỬ LÝ VÀ BÁO LỖI (BUSINESS RULES & VALIDATIONS)

### 4.1. Luồng xử lý chính (User Flows)
Dựa theo luồng nghiệp vụ kiến trúc:
- Bước 1: Khởi tạo Vendor/Garage Tenant: Người dùng điền đầy đủ thông tin vào form UI và nhấn "Lưu". API /api/v1/saas-tenant được gọi. Nếu hợp lệ, hệ thống tạo Tenant với trạng thái là PROVISIONED.
- Bước 2: Tạo User (Tùy chọn): Quản trị viên có thể tạo trước người dùng (Pre-create user) trước khi hoàn tất Onboarding.
- Bước 3: Hoàn tất Onboarding (Complete): Quản trị viên xác nhận hoàn tất. Tenant chuyển từ trạng thái PROVISIONED sang ACTIVE (status: PROVISIONING).
- Bước 4: Provisioning & Event: Khi được kích hoạt, hệ thống tự động sinh các sự kiện Kafka (ví dụ: yêu cầu tạo Branch/Warehouse mặc định) cho các hệ thống liên quan.
- Bước 5: Kích hoạt Async (Probing): Một tiến trình ngầm (BPM Worker) định kỳ kiểm tra (probe) tên miền con. Nếu tên miền phản hồi thành công, trạng thái của Tenant được cập nhật thành ACTIVATED, kết thúc vòng đời khởi tạo.

### 4.2. Quy tắc nghiệp vụ và Validation (Business Rules)
- Quy tắc quyền truy cập: Chỉ người dùng thuộc nhóm có quyền khởi tạo (System_Admin và user thuộc phòng ban BD: CD_BD_HEAD, CD_BD_LEAD, CD_BD_MANAGER, CD_BD) mới được phép tạo Tenant.
- Chỉ tạo 1 trong 2 đối tượng là vendor hoặc garage, đối với các TH này sẽ có các trường thông tin required khác nhau. Kiểm tra điều này trên UI. - đây là 2 rẽ nhánh chính liên quan chú yếu tới data validation và api call sau này.  
- Ràng buộc tên miền con (Subdomain): Phải là duy nhất. Khi nhấn "Lưu", hệ thống kiểm tra lock ngầm định (pessimistic lock). Nếu đã tồn tại, trả về Validation Message: "Tên miền con đã tồn tại trên hệ thống".
- Ràng buộc số điện thoại: Phải là duy nhất toàn hệ thống. Báo lỗi nếu số điện thoại bị trùng.
- Ràng buộc địa lý (Location): Thông tin Tỉnh/Thành phố, Xã/Phường và Địa chỉ chi tiết là bắt buộc để hỗ trợ luồng tạo chi nhánh và kho mặc định sau này. Báo lỗi yêu cầu nhập nếu bị bỏ trống.
- Ràng buộc thông tin hóa đơn: Khi cấu hình PurchaseV02 bật cho loại GARAGE, các trường "Tên công ty", "Mã số thuế", và "Địa chỉ công ty" bắt buộc phải có để hoàn tất khởi tạo. Dữ liệu email công ty phải có định dạng hợp lệ.
- Hành vi giao diện: Nút "Lưu" sẽ bị chặn gọi API tiếp nếu đang có lỗi validation tại Client-side (hiển thị text màu đỏ bên dưới trường nhập liệu bị thiếu hoặc sai định dạng).
