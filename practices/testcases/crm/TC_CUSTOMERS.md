# Bộ Test Case — Module: Customers (Toàn bộ)

## 1. Thông Tin Chung
- **Dự án:** Perfex CRM
- **Module:** Quản lý Khách hàng (Từ FR-CUST-001 đến FR-CUST-009)
- **URL Hệ thống:** `https://crm.anhtester.com/admin/clients`
- **Tổng số TC:** 39
- **Kỹ thuật áp dụng:** Phân lớp tương đương (EP), Phân tích giá trị biên (BVA), Phân tích luồng (Path Analysis), Bảng quyết định (Decision Table), Chuyển trạng thái (State Transition).

## 2. Bảng Tổng Hợp Risk Level
| Tính Năng (Module) | Risk Level | Lý Do Rủi Ro |
| :--- | :--- | :--- |
| FR-CUST-001: Xem danh sách | Medium | Lỗi hiển thị bảng, phân trang có thể gây khó khăn trong việc quản lý và tìm kiếm. |
| FR-CUST-002: Tạo mới | High | Lỗi tạo rác dữ liệu, thiếu validation trường bắt buộc ảnh hưởng các module sau. |
| FR-CUST-003: Chỉnh sửa | High | Cập nhật sai lệch thông tin core của khách hàng, ảnh hưởng đến Hóa đơn, Dự án. |
| FR-CUST-004: Xóa khách hàng | High | Nguy cơ mất dữ liệu vĩnh viễn hoặc lỗi cascade delete (ràng buộc khóa ngoại DB). |
| FR-CUST-005: Quản lý Contacts | Medium | Lỗi gán sai người dùng, liên quan tới quyền truy cập Client Portal. |
| FR-CUST-006: Import dữ liệu | High | Nguy cơ crash do file quá lớn, duplicate data diện rộng, lỗi mapping cột. |
| FR-CUST-007: Export dữ liệu | Low | Lỗi file format, lộ lọt dữ liệu nếu phân quyền sai (chỉ đọc nên ít rủi ro hệ thống). |
| FR-CUST-008: Bulk Actions | High | Xóa nhầm hàng loạt hoặc thay đổi thuộc tính nhóm sai ảnh hưởng nhiều khách hàng cùng lúc. |
| FR-CUST-009: Search & Filter | Medium | Nếu filter sai logic, người dùng không truy xuất được khách hàng cần thiết. |

## 3. Danh Sách Tài Khoản & Test Data Thiết Yếu
| Loại | Thông tin chi tiết |
| :--- | :--- |
| **Account Admin** | Email: `admin@example.com` / Pass: `123456` |
| **Data tạo mới** | Company: `Auto Test Corp`, Email: `autotest@domain.com`, Phone: `0999888777` |
| **File CSV Import** | 1. `valid_customers.csv` (Đủ field bắt buộc).<br>2. `missing_company.csv` (Thiếu Company).<br>3. `duplicate_email.csv` (Trùng email trong file và trùng với DB). |

## 4. Traceability Matrix
| Requirement ID | Requirement Description | Test Case ID |
| :--- | :--- | :--- |
| FR-CUST-001 | Xem Danh Sách Khách Hàng | CRM_CUST_TC_001 -> CRM_CUST_TC_005 |
| FR-CUST-002 | Tạo Mới Khách Hàng | CRM_CUST_TC_006 -> CRM_CUST_TC_009 |
| FR-CUST-003 | Xem & Chỉnh Sửa Chi Tiết | CRM_CUST_TC_010 -> CRM_CUST_TC_015 |
| FR-CUST-004 | Xóa Khách Hàng | CRM_CUST_TC_016 -> CRM_CUST_TC_017 |
| FR-CUST-005 | Quản Lý Contacts | CRM_CUST_TC_018 -> CRM_CUST_TC_022 |
| FR-CUST-006 | Import Khách Hàng | CRM_CUST_TC_023 -> CRM_CUST_TC_028 |
| FR-CUST-007 | Export Dữ Liệu | CRM_CUST_TC_029 -> CRM_CUST_TC_031 |
| FR-CUST-008 | Thao Tác Hàng Loạt | CRM_CUST_TC_032 -> CRM_CUST_TC_035 |
| FR-CUST-009 | Tìm Kiếm & Lọc Dữ Liệu | CRM_CUST_TC_036 -> CRM_CUST_TC_039 |

## 5. Bảng Tổng Hợp Ambiguities & Câu Hỏi Q&A
| # | Ambiguities (Điểm mờ/Mâu thuẫn) | Câu Hỏi (Q&A cho PO) | Assumption (Giả định tạm thời để test) |
| :--- | :--- | :--- | :--- |
| 1 | Validation các định dạng (Email, Phone) | Khi nhập Contact Email, Phone có check định dạng hợp lệ không? | Giả định hệ thống bắt lỗi Email phải có `@`, Phone chỉ là chuỗi thường. |
| 2 | Giới hạn độ dài Company | Tên Company giới hạn tối đa bao nhiêu ký tự? | Giả định tối đa 255 ký tự. |
| 3 | Xóa khách hàng (Cascade) | Xóa Customer có tự động xóa Contacts và Invoices không? | Giả định nếu KH đã có Invoice thì sẽ chặn xóa (show warning). |
| 4 | Trùng Company | Có cho phép 2 khách hàng trùng Company Name không? | Giả định cho phép, quản lý thông qua ID. |
| 5 | Timeout khi Export | Export 10.000 dòng có bị timeout không? | Giả định hệ thống xử lý được file lớn. |

## 6. Bảng Thống Kê
| Priority | Số lượng TC | Kỹ thuật áp dụng chính |
| :--- | :--- | :--- |
| High | 16 | Phân lớp tương đương (EP), BVA |
| Medium | 15 | Phân tích luồng (Path Analysis), Bảng quyết định |
| Low | 8 | Exploratory Testing |

## 7. Bảng Test Cases Chi Tiết

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CRM_CUST_TC_001 | FR-CUST-001 | Medium | Kiểm tra hiển thị bảng dữ liệu khách hàng. | Login Admin. | 1. Truy cập `/admin/clients`.<br>2. Quan sát bảng DataTable. | Bảng hiển thị đúng các cột: #, Company, Primary Contact, Primary Email, Phone, Active, Groups, Date Created. | High | N/A |
| CRM_CUST_TC_002 | FR-CUST-001 | Medium | Phân trang bảng danh sách khách hàng. | Bảng có > 50 KH. | 1. Chọn dropdown hiển thị "50".<br>2. Click nút Next page. | Bảng hiển thị đúng 50 dòng/trang, chuyển trang đúng dữ liệu tiếp theo. | Medium | N/A |
| CRM_CUST_TC_003 | FR-CUST-001 | Medium | Sắp xếp (Sort) dữ liệu theo cột Company. | N/A | 1. Click vào tiêu đề cột "Company" (A-Z).<br>2. Click lần 2 (Z-A). | Dữ liệu sắp xếp đúng alpha-b theo tên Company. | Medium | N/A |
| CRM_CUST_TC_004 | FR-CUST-001 | Low | Toggle chuyển trạng thái Active tại bảng (State Transition). | KH ID=1 đang Active. | 1. Click toggle ở cột Active của KH ID=1. | Trạng thái chuyển sang Inactive ngay lập tức, không reload trang. | Medium | KH ID: `1` |
| CRM_CUST_TC_005 | FR-CUST-001 | Low | Click link ở cột Company. | KH ID=1 có tên "ABC Corp". | 1. Click vào tên "ABC Corp". | Chuyển hướng thành công sang URL `/admin/clients/client/1`. | Low | KH ID: `1` |
| CRM_CUST_TC_006 | FR-CUST-002 | High | Tạo mới khách hàng thành công với thông tin bắt buộc (Happy Path). | Mở form `/admin/clients/client`. | 1. Nhập Company.<br>2. Click "Save". | Hệ thống lưu thành công, chuyển hướng sang trang chi tiết của KH vừa tạo. | High | Company: `New Corp Ltd` |
| CRM_CUST_TC_007 | FR-CUST-002 | High | Bỏ trống thông tin bắt buộc khi tạo KH (Exception). | Mở form New Customer. | 1. Bỏ trống Company.<br>2. Click "Save". | Báo lỗi màu đỏ "This field is required" dưới ô Company. Không tạo mới. | High | Company: `[Rỗng]` |
| CRM_CUST_TC_008 | FR-CUST-002 | Medium | Tạo mới KH và chọn "Save and create contact" (Alternate Path). | Mở form New Customer. | 1. Nhập Company hợp lệ.<br>2. Click "Save and create contact". | Lưu KH thành công và màn hình chuyển tới popup/form tạo Contact mới cho KH đó. | Medium | Company: `Contact Create Corp` |
| CRM_CUST_TC_009 | FR-CUST-002 | Medium | Nhập Company vượt quá 255 ký tự (Boundary Value). | Mở form New Customer. | 1. Nhập tên Company 256 ký tự.<br>2. Click "Save". | Hệ thống không cho nhập thêm hoặc có thông báo lỗi quá ký tự. | Medium | Chuỗi 256 ký tự 'X' |
| CRM_CUST_TC_010 | FR-CUST-003 | High | Chỉnh sửa và lưu thông tin KH hợp lệ. | Ở trang chi tiết KH ID=1. | 1. Đổi tên Company và nhập Phone mới.<br>2. Click "Save". | Thông báo cập nhật thành công. Dữ liệu mới được hiển thị đúng. | High | Company: `Updated Corp`, Phone: `111222333` |
| CRM_CUST_TC_011 | FR-CUST-003 | High | Cố tình xóa trắng trường bắt buộc khi edit (Exception). | Ở trang chi tiết KH ID=1. | 1. Xóa nội dung ô Company.<br>2. Click "Save". | Báo lỗi validation "This field is required", dữ liệu cũ không bị ghi đè. | High | Company: `[Trắng]` |
| CRM_CUST_TC_012 | FR-CUST-003 | Medium | Sử dụng chức năng "Same as Customer Info" ở tab Billing. | Chuyển sang tab Billing & Shipping. | 1. Đã nhập Address bên Customer Details.<br>2. Click "Same as Customer Info". | Các trường Billing (Street, City, Zip...) tự động nhận dữ liệu từ Address. | Medium | N/A |
| CRM_CUST_TC_013 | FR-CUST-003 | Medium | Sử dụng chức năng "Copy Billing Address" sang Shipping. | Chuyển sang tab Billing & Shipping. | 1. Nhập Billing Address.<br>2. Click "Copy Billing Address". | Dữ liệu bên cột Shipping tự động điền giống hệt Billing. | Medium | Billing Street: `123 ABC` |
| CRM_CUST_TC_014 | FR-CUST-003 | Low | Click mở URL website ra tab ngoài. | Ở tab Customer Details, KH có website. | 1. Click icon 🌐 cạnh ô Website. | Mở tab mới với địa chỉ URL đúng. | Low | URL: `https://google.com` |
| CRM_CUST_TC_015 | FR-CUST-003 | Low | Điều hướng qua lại giữa các tab trong Profile. | Ở trang chi tiết KH ID=1. | 1. Click tab Notes, Invoices, Tasks. | Nội dung giữa màn hình đổi đúng module mà không lỗi trắng trang. | Low | N/A |
| CRM_CUST_TC_016 | FR-CUST-004 | High | Xóa khách hàng độc lập thành công. | KH ID=99 không có ràng buộc. | 1. Click dropdown action cạnh tên.<br>2. Chọn Delete.<br>3. Xác nhận "OK". | Xóa thành công, chuyển về bảng danh sách, KH ID=99 mất khỏi bảng. | High | KH không có liên kết hóa đơn. |
| CRM_CUST_TC_017 | FR-CUST-004 | High | Hủy thao tác xóa khách hàng. | Ở trang chi tiết KH ID=99. | 1. Chọn Delete.<br>2. Chọn "Cancel" trên popup cảnh báo. | Khách hàng không bị xóa, vẫn ở trang chi tiết. | Medium | N/A |
| CRM_CUST_TC_018 | FR-CUST-005 | Medium | Mở tab Contacts của KH và kiểm tra giao diện. | Ở trang chi tiết KH ID=1. | 1. Click tab Contacts. | Hiển thị bảng danh sách Contacts (Full Name, Email, Position...). Nút "New Contact" tồn tại. | Medium | N/A |
| CRM_CUST_TC_019 | FR-CUST-005 | High | Thêm Contact mới cho KH (Happy Path). | Tab Contacts của KH ID=1. | 1. Click "New Contact".<br>2. Điền Firstname, Lastname, Email hợp lệ.<br>3. Save. | Tạo thành công, Contact xuất hiện trong bảng. | High | Email: `newcontact@abc.com` |
| CRM_CUST_TC_020 | FR-CUST-005 | High | Tạo Contact trùng Email với hệ thống (Exception). | Tab Contacts của KH ID=1. | 1. Click "New Contact".<br>2. Nhập Email đã tồn tại trong DB.<br>3. Save. | Hệ thống chặn và báo lỗi Email đã được sử dụng. | High | Email trùng lặp |
| CRM_CUST_TC_021 | FR-CUST-005 | Medium | Mở trang Contacts tổng (Tất cả KH). | Bảng danh sách Customers. | 1. Click nút "Contacts" ở top menu. | Hiển thị bảng tổng, chứa liên hệ của mọi khách hàng. | Medium | N/A |
| CRM_CUST_TC_022 | FR-CUST-005 | Low | Bật/tắt Active contact ở trang tổng. | Bảng Contacts tổng. | 1. Click toggle Active của Contact A. | Đổi trạng thái Contact thành công. | Low | N/A |
| CRM_CUST_TC_023 | FR-CUST-006 | Medium | Kiểm tra chức năng "Simulate Import" với file chuẩn (Happy Path). | Truy cập `/admin/clients/import`. | 1. Tải lên `valid_customers.csv`.<br>2. Click "Simulate Import". | Báo cáo mô phỏng trả về thành công, báo số dòng sẽ được import, không có lỗi. | High | File `valid_customers.csv` |
| CRM_CUST_TC_024 | FR-CUST-006 | High | Thực hiện "Import" khách hàng với file chuẩn (Happy Path). | Truy cập Import. | 1. Tải lên `valid_customers.csv`.<br>2. Click "Import". | Import thành công, dữ liệu hiển thị đúng trên bảng danh sách. | High | File `valid_customers.csv` |
| CRM_CUST_TC_025 | FR-CUST-006 | High | Simulate file thiếu trường bắt buộc (Exception). | Truy cập Import. | 1. Tải lên `missing_company.csv`.<br>2. Click "Simulate Import". | Báo lỗi dòng chứa data thiếu "Company is required". | High | File `missing_company.csv` |
| CRM_CUST_TC_026 | FR-CUST-006 | High | Simulate file có email trùng lặp (Exception). | Truy cập Import. | 1. Tải lên `duplicate_email.csv`.<br>2. Click "Simulate Import". | Báo lỗi duplicate email tại các dòng trùng, cảnh báo bỏ qua các dòng lỗi. | High | File `duplicate_email.csv` |
| CRM_CUST_TC_027 | FR-CUST-006 | Medium | Assign Group và Password mặc định khi Import. | Truy cập Import. | 1. Chọn Group `VIP`.<br>2. Nhập default password `Pass123`.<br>3. Tải CSV và Import. | KH mới được gán tag VIP và contact có thể login bằng `Pass123`. | Medium | Group `VIP` |
| CRM_CUST_TC_028 | FR-CUST-006 | Medium | Tải sai định dạng file (ví dụ .xlsx thay vì .csv). | Truy cập Import. | 1. Chọn file `.xlsx`.<br>2. Cố gắng upload. | Giao diện tự động từ chối file hoặc khi nhấn Import báo lỗi sai format. | Medium | File `test.xlsx` |
| CRM_CUST_TC_029 | FR-CUST-007 | Low | Export dữ liệu dạng CSV. | Bảng danh sách Customers. | 1. Click "Export" -> chọn "CSV". | Tải xuống thành công file `.csv` chứa đúng dữ liệu trên bảng. | Low | N/A |
| CRM_CUST_TC_030 | FR-CUST-007 | Low | Export dữ liệu dạng Excel. | Bảng danh sách Customers. | 1. Click "Export" -> chọn "Excel". | Tải xuống thành công file `.xlsx`. | Low | N/A |
| CRM_CUST_TC_031 | FR-CUST-007 | Low | Export dữ liệu dạng PDF. | Bảng danh sách Customers. | 1. Click "Export" -> chọn "PDF". | Tải xuống thành công file `.pdf` hiển thị format bảng chuẩn. | Low | N/A |
| CRM_CUST_TC_032 | FR-CUST-008 | High | Thực hiện Mass Delete (Bulk Action). | Có ít nhất 3 KH dummy. | 1. Check vào 3 KH.<br>2. Click "Bulk Actions".<br>3. Đánh dấu "Mass Delete" & Confirm. | 3 KH được xóa khỏi danh sách thành công. | High | Chọn 3 KH test |
| CRM_CUST_TC_033 | FR-CUST-008 | Medium | Assign nhóm hàng loạt bằng Bulk Action. | Có 2 KH chưa có nhóm. | 1. Check 2 KH.<br>2. Chọn "Bulk Actions".<br>3. Chọn Group `Wholesale` & Confirm. | 2 KH được gán thêm tag `Wholesale`. | High | Group: `Wholesale` |
| CRM_CUST_TC_034 | FR-CUST-008 | Medium | Gỡ bỏ toàn bộ nhóm bằng Bulk Action (Luồng đặc biệt). | Chọn 1 KH có nhóm. | 1. Check KH.<br>2. Mở "Bulk Actions".<br>3. Để trống Groups, Click Confirm. | Khách hàng bị gỡ bỏ toàn bộ nhóm cũ theo luật "If you do not select any group...". | Medium | Để trống Group |
| CRM_CUST_TC_035 | FR-CUST-008 | Low | Đóng Bulk Action dialog không làm gì cả. | Chọn 1 KH. | 1. Click "Bulk Actions".<br>2. Nhấn "Close". | Dialog đóng, không có thay đổi nào diễn ra. | Low | N/A |
| CRM_CUST_TC_036 | FR-CUST-009 | Medium | Tìm kiếm nhanh theo tên Company (Real-time). | Có KH "Tech VNG". | 1. Gõ "Tech VNG" vào ô Search. | Bảng lập tức filter chỉ hiển thị KH có tên chứa từ khóa. | Medium | Search text: `Tech VNG` |
| CRM_CUST_TC_037 | FR-CUST-009 | Medium | Tìm kiếm nhanh không có kết quả. | Bảng Customers. | 1. Gõ "XXXXXXXX". | Bảng báo "No matching records found". | Medium | Search text: `XXXXXXXX` |
| CRM_CUST_TC_038 | FR-CUST-009 | High | Sử dụng Advanced Filter theo thuộc tính Active. | Bảng Customers. | 1. Click icon Filter -> "New Filter".<br>2. Chọn điều kiện Active = Yes. | Bảng chỉ hiển thị các KH đang có toggle Active được bật. | High | Rule: `Active` = `Yes` |
| CRM_CUST_TC_039 | FR-CUST-009 | High | Sử dụng nhiều Advanced Filter kết hợp (Decision Table). | Bảng Customers. | 1. Thêm Rule: Active = Yes.<br>2. Thêm Rule: City = "Ha Noi". | Bảng chỉ hiện KH thỏa mãn ĐỒNG THỜI 2 điều kiện (AND logic). | High | Rule1: `Active = Yes`, Rule2: `City = Ha Noi` |
