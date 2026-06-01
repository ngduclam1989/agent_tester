# TÀI LIỆU TEST CASES: ONBOARD TENANT

## 1. THÔNG TIN CHUNG
- **Dự án:** COP (CarDoctor)
- **Module:** Onboard Tenant
- **URL tham chiếu:** `/tenants/create`
- **Tổng số TC:** 23
- **Kỹ thuật thiết kế áp dụng:** Phân lớp tương đương (Equivalence Partitioning), Phân tích giá trị biên (Boundary Value Analysis), Bảng quyết định (Decision Table), Chuyển trạng thái (State Transition).

## 2. BẢNG TỔNG HỢP RISK LEVEL
| Tính năng / Nhóm chức năng | Mức độ rủi ro (Risk Level) | Lý do |
| --- | --- | --- |
| Phân quyền (Permissions) | High | Đảm bảo tính bảo mật, chỉ user có thẩm quyền (System_Admin, BD) mới được truy cập và khởi tạo khách hàng. |
| Chức năng (Function) | High | Là core flow để đưa khách hàng mới vào hệ thống, sai sót logic sẽ làm hỏng toàn bộ dữ liệu quản lý. |
| Phần ảnh hưởng liên quan | High | Luồng xử lý bất đồng bộ (Provisioning), Kafka events và BPM worker dễ xảy ra lỗi tích hợp giữa các microservices. |
| Kiểm tra dữ liệu (Validate) | Medium | Lỗi nhập liệu kiểm soát ở UI và API, không phá vỡ hoàn toàn hệ thống nhưng gây sai lệch thông tin và lỗi nghiệp vụ. |
| Giao diện (UI) | Medium | Lỗi hiển thị ít ảnh hưởng core logic nhưng làm giảm trải nghiệm người dùng. |

## 3. DANH SÁCH TÀI KHOẢN / TEST DATA THIẾT YẾU
| Loại | Tên / Giá trị | Vai trò |
| --- | --- | --- |
| Tài khoản | `admin@cardoctor.vn` / `Pass@123` | System_Admin (Được phép khởi tạo Tenant). |
| Tài khoản | `bd_head@cardoctor.vn` / `Pass@123` | User phòng BD (Được phép khởi tạo Tenant). |
| Tài khoản | `staff_normal@cardoctor.vn` / `Pass@123` | User thường (Không có quyền tạo Tenant). |
| Test Data | Subdomain: `garage-test-01` | Tên miền con hợp lệ dùng test happy case. |
| Test Data | Số điện thoại: `0988111222` | Số điện thoại chuẩn, chưa tồn tại trên hệ thống. |
| Test Data | Mã số thuế: `0312345678` | Mã số thuế hợp lệ chuẩn. |

## 4. TRACEABILITY MATRIX
| Yêu cầu (Requirement) | Danh sách TC bao phủ |
| --- | --- |
| Quy tắc quyền truy cập | COP_ONBOARD_TENANT_TC_001, COP_ONBOARD_TENANT_TC_002, COP_ONBOARD_TENANT_TC_003 |
| Khởi tạo Tenant GARAGE/VENDOR (Happy/Unhappy) | COP_ONBOARD_TENANT_TC_004, COP_ONBOARD_TENANT_TC_005, COP_ONBOARD_TENANT_TC_006, COP_ONBOARD_TENANT_TC_007 |
| Provisioning & Event (Chức năng liên quan) | COP_ONBOARD_TENANT_TC_008, COP_ONBOARD_TENANT_TC_009, COP_ONBOARD_TENANT_TC_010 |
| Validate dữ liệu bắt buộc và biên | COP_ONBOARD_TENANT_TC_011 -> COP_ONBOARD_TENANT_TC_018 |
| Giao diện UI & Behavior | COP_ONBOARD_TENANT_TC_019 -> COP_ONBOARD_TENANT_TC_023 |

## 5. BẢNG TỔNG HỢP AMBIGUITIES & Q&A
| Số thứ tự | Vấn đề phát hiện (Ambiguity) | Câu hỏi Q&A | Giả định áp dụng (Assumptions) |
| --- | --- | --- | --- |
| 1 | Các trường Hóa đơn của loại VENDOR | Khi chọn loại VENDOR, các trường "Tên công ty", "Mã số thuế" có bị ẩn đi không hay chỉ bỏ dấu bắt buộc? | Giả định: Form vẫn hiển thị nhưng loại bỏ dấu * (không bắt buộc nhập). |
| 2 | Kích thước ảnh Upload | Chưa ghi rõ hỗ trợ những định dạng nào và dung lượng tối đa. | Giả định: Hỗ trợ JPG/PNG, dung lượng tối đa 5MB. |
| 3 | Xóa ảnh Upload | Nhấn vào icon xóa ảnh thì ảnh mất ngay hay có modal confirm? | Giả định: Xóa ngay lập tức không cần popup confirm, cho phép chọn lại ảnh khác. |

## 6. THỐNG KÊ TEST CASES
| Mức độ rủi ro | Số lượng | Mức độ ưu tiên |
| --- | --- | --- |
| High | 10 | High |
| Medium | 13 | Medium |

## 7. BẢNG TEST CASES CHI TIẾT

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COP_ONBOARD_TENANT_TC_001 | Phân quyền | High | Kiểm tra user nhóm System_Admin có quyền truy cập trang Onboard. | Có tài khoản System_Admin. | 1. Đăng nhập bằng tài khoản System_Admin.<br>2. Điều hướng đến màn hình Khởi tạo Tenant. | 1. Đăng nhập thành công.<br>2. Hiển thị form Khởi tạo Tenant đầy đủ các trường. | High | Tài khoản: admin@cardoctor.vn |
| COP_ONBOARD_TENANT_TC_002 | Phân quyền | High | Kiểm tra user nhóm BD có quyền truy cập trang Onboard. | Có tài khoản thuộc nhóm BD. | 1. Đăng nhập bằng tài khoản BD.<br>2. Điều hướng đến màn hình Khởi tạo Tenant. | 1. Đăng nhập thành công.<br>2. Hiển thị form Khởi tạo Tenant bình thường. | High | Tài khoản: bd_head@cardoctor.vn |
| COP_ONBOARD_TENANT_TC_003 | Phân quyền | High | Kiểm tra user không có quyền bị từ chối truy cập. | Có tài khoản user thường. | 1. Đăng nhập bằng tài khoản user thường.<br>2. Nhập URL /tenants/create trên thanh địa chỉ. | 1. Đăng nhập thành công.<br>2. Hệ thống báo lỗi 403 Forbidden hoặc chặn không cho hiển thị form. | High | Tài khoản: staff_normal@cardoctor.vn |
| COP_ONBOARD_TENANT_TC_004 | Chức năng | High | Khởi tạo thành công Tenant loại GARAGE (Happy Case). | Đang ở form Khởi tạo Tenant. | 1. Chọn loại Tenant: GARAGE.<br>2. Nhập thông tin bắt buộc: Tên (Auto G1), Mô hình (REPAIRING), Tên miền (garage-auto-01), Gói dịch vụ (Free), SĐT (0988111222), Vùng/Tỉnh/Xã hợp lệ, Hóa đơn (Có Tên CT, MST, Địa chỉ).<br>3. Nhấn nút "Lưu". | 1. Dữ liệu được chọn thành công.<br>2. Không hiển thị lỗi validation.<br>3. Hệ thống báo "Khởi tạo thành công", lưu vào DB với trạng thái PROVISIONED. | High | Tên: Auto G1<br>Tên miền: garage-auto-01<br>SĐT: 0988111222 |
| COP_ONBOARD_TENANT_TC_005 | Chức năng | High | Khởi tạo thành công Tenant loại VENDOR (Happy Case). | Đang ở form Khởi tạo Tenant. | 1. Chọn loại Tenant: VENDOR.<br>2. Nhập thông tin bắt buộc, bỏ trống phần Hóa đơn (Tên công ty, MST).<br>3. Nhấn nút "Lưu". | 1. Form cập nhật bỏ yêu cầu bắt buộc phần Hóa đơn.<br>2. Dữ liệu hợp lệ.<br>3. Hệ thống báo "Khởi tạo thành công", lưu vào DB với trạng thái PROVISIONED. | High | Tên: Parts V1<br>Tên miền: vendor-parts-01<br>SĐT: 0999222333 |
| COP_ONBOARD_TENANT_TC_006 | Chức năng | High | Khởi tạo không thành công do trùng Tên miền con (Exception). | Đã có Tenant tên miền "garage-auto-01". | 1. Nhập toàn bộ dữ liệu hợp lệ.<br>2. Nhập tên miền con: garage-auto-01.<br>3. Nhấn nút "Lưu". | 1. Các trường khác hợp lệ.<br>2. Input tên miền nhận giá trị.<br>3. Báo lỗi "Tên miền con đã tồn tại trên hệ thống", hệ thống từ chối lưu. | High | Tên miền: garage-auto-01 |
| COP_ONBOARD_TENANT_TC_007 | Chức năng | High | Khởi tạo không thành công do trùng Số điện thoại (Exception). | Đã có Tenant dùng SĐT 0988111222. | 1. Nhập toàn bộ dữ liệu hợp lệ.<br>2. Nhập SĐT: 0988111222.<br>3. Nhấn nút "Lưu". | 1. Các trường khác hợp lệ.<br>2. Input SĐT nhận giá trị.<br>3. Báo lỗi "Số điện thoại đã tồn tại trên hệ thống", hệ thống từ chối lưu. | High | SĐT: 0988111222 |
| COP_ONBOARD_TENANT_TC_008 | Liên quan | High | Kiểm tra trạng thái Tenant ngay sau khi tạo thành công. | Đã tạo thành công Tenant. | 1. Mở trang danh sách Tenant.<br>2. Tìm kiếm Tenant vừa tạo.<br>3. Kiểm tra cột trạng thái (stage và status). | 1. Tải trang danh sách thành công.<br>2. Tìm thấy bản ghi Tenant.<br>3. Stage là PROVISIONED, Status là PROVISIONED. | High | Dữ liệu vừa tạo từ TC_004 |
| COP_ONBOARD_TENANT_TC_009 | Liên quan | High | Kiểm tra chức năng Complete Onboarding sinh sự kiện Kafka. | Tenant đang ở trạng thái PROVISIONED. | 1. Click "Complete" tại trang chi tiết Tenant.<br>2. Kiểm tra log/hệ thống xem có Kafka event sinh ra không. | 1. Tenant chuyển sang ACTIVE / PROVISIONING.<br>2. Sự kiện TENANT_PROVISIONED sinh ra yêu cầu tạo kho/chi nhánh mặc định thành công. | High | Tenant ID: 101 |
| COP_ONBOARD_TENANT_TC_010 | Liên quan | High | Kiểm tra job BPM Worker probe subdomain để Activate Tenant. | Tenant ở trạng thái ACTIVATING. | 1. Kích hoạt BPM Worker thực hiện cập nhật.<br>2. Kiểm tra trạng thái của Tenant trên DB. | 1. BPM worker chạy thành công.<br>2. Nếu tên miền phản hồi, trạng thái chuyển thành ACTIVATED. | High | N/A |
| COP_ONBOARD_TENANT_TC_011 | Validate | Medium | Cảnh báo lỗi khi bỏ trống các trường bắt buộc của GARAGE. | Đang ở form Khởi tạo loại GARAGE. | 1. Không nhập dữ liệu vào Tên, Tên miền, Gói, SĐT, Vùng, Địa chỉ, Tên Cty, MST.<br>2. Nhấn nút "Lưu" hoặc click ra ngoài. | 1. Báo lỗi dòng chữ đỏ "Trường này là bắt buộc" dưới mỗi input bị thiếu.<br>2. Nút Lưu bị chặn. | Medium | Bỏ trống các trường |
| COP_ONBOARD_TENANT_TC_012 | Validate | Medium | Cảnh báo lỗi khi bỏ trống các trường bắt buộc của VENDOR. | Đang ở form Khởi tạo loại VENDOR. | 1. Không nhập dữ liệu vào Tên, Tên miền, Gói, SĐT, Vùng, Địa chỉ.<br>2. Nhấn nút "Lưu". | 1. Báo lỗi các trường bắt buộc cơ bản.<br>2. Không báo lỗi tại trường Hóa đơn (Tên Cty, MST). Nút Lưu bị chặn. | Medium | Loại: VENDOR |
| COP_ONBOARD_TENANT_TC_013 | Validate | Medium | Kiểm tra định dạng Tên miền con có ký tự đặc biệt, dấu cách. | Đang nhập tên miền. | 1. Nhập tên miền con: "garage test @!".<br>2. Nhấn "Lưu" hoặc mất focus. | 1. Ô input ghi nhận dữ liệu.<br>2. Báo lỗi "Tên miền không được chứa ký tự đặc biệt và dấu cách". | Medium | Tên miền: garage test @! |
| COP_ONBOARD_TENANT_TC_014 | Validate | Medium | Kiểm tra biên giá trị tối đa của Tên miền con (Boundary). | Đang nhập tên miền. | 1. Nhập tên miền 21 ký tự: "abcdefghijklmnopqrs12".<br>2. Nhấn "Lưu" hoặc mất focus. | 1. Giao diện chặn không cho nhập ký tự thứ 21 hoặc báo lỗi "Không vượt quá 20 ký tự".<br>2. Không cho phép lưu. | Medium | Tên miền: abcdefghijklmnopqrs12 |
| COP_ONBOARD_TENANT_TC_015 | Validate | Medium | Kiểm tra Số điện thoại nhập chữ và ký tự đặc biệt. | Đang nhập số điện thoại. | 1. Nhập: "098abc@12".<br>2. Nhấn "Lưu" hoặc mất focus. | 1. Ô input ghi nhận giá trị.<br>2. Báo lỗi "Số điện thoại chỉ được chứa chữ số". | Medium | SĐT: 098abc@12 |
| COP_ONBOARD_TENANT_TC_016 | Validate | Medium | Kiểm tra Email công ty sai định dạng. | Đang nhập email. | 1. Nhập email: "contact.garage.vn" (thiếu @).<br>2. Nhấn "Lưu" hoặc mất focus. | 1. Ô input ghi nhận giá trị.<br>2. Báo lỗi "Định dạng email không hợp lệ". | Medium | Email: contact.garage.vn |
| COP_ONBOARD_TENANT_TC_017 | Validate | Medium | Kiểm tra biên giá trị Mã số thuế (> 50 ký tự). | Đang nhập mã số thuế. | 1. Nhập chuỗi dài 51 ký tự vào trường Mã số thuế.<br>2. Mất focus. | 1. Giao diện chặn không cho nhập ký tự thứ 51 hoặc hiển thị lỗi "Tối đa 50 ký tự". | Medium | MST: 51 ký tự "1" |
| COP_ONBOARD_TENANT_TC_018 | Validate | Medium | Kiểm tra nhập khoảng trắng ở đầu và cuối các trường text. | Đang nhập Tên Tenant. | 1. Nhập: "   Garage Space   ".<br>2. Nhấn "Lưu". | 1. Nhập liệu thành công.<br>2. Hệ thống tự động trim (cắt) khoảng trắng thừa trước khi đẩy qua API. | Medium | Tên: "   Garage Space   " |
| COP_ONBOARD_TENANT_TC_019 | UI | Medium | Kiểm tra layout và UI elements tổng thể của form. | Mở form Khởi tạo. | 1. Quan sát bố cục các khối: Thông tin Tenant, Thông tin xuất hóa đơn.<br>2. Kiểm tra dấu (*) đỏ ở các trường bắt buộc. | 1. Khối hiển thị theo đúng thứ tự thiết kế.<br>2. Dấu (*) đỏ xuất hiện đúng ở các label yêu cầu. | Medium | N/A |
| COP_ONBOARD_TENANT_TC_020 | UI | Medium | Kiểm tra behavior khi ấn Tab / Shift+Tab để điều hướng. | Đang ở ô nhập Tên Tenant. | 1. Nhấn phím Tab liên tục.<br>2. Nhấn phím Shift+Tab. | 1. Tiêu điểm (Focus) nhảy theo thứ tự logic từ trái qua phải, trên xuống dưới.<br>2. Focus nhảy ngược lại đúng thứ tự. | Medium | N/A |
| COP_ONBOARD_TENANT_TC_021 | UI | Medium | Kiểm tra behavior Focus và Hover trên nút "Lưu". | Hover chuột vào nút Lưu. | 1. Di chuột vào nút "Lưu".<br>2. Hover vào nút "Hủy bỏ". | 1. Nút Lưu thay đổi sắc độ màu (tối hơn hoặc sáng hơn) hiển thị hover state.<br>2. Nút Hủy bỏ hiển thị hiệu ứng hover. | Medium | N/A |
| COP_ONBOARD_TENANT_TC_022 | UI | Medium | Kiểm tra chức năng Upload ảnh đại diện. | Chọn Upload File. | 1. Click vào khu vực Upload và chọn ảnh JPG 1MB.<br>2. Quan sát giao diện.<br>3. Click icon Xóa. | 1. Cửa sổ chọn file mở ra.<br>2. Ảnh hiển thị thumbnail kèm tên file, size.<br>3. Ảnh bị xóa, khu vực upload quay về ban đầu. | Medium | File: image_1mb.jpg |
| COP_ONBOARD_TENANT_TC_023 | UI | Medium | Kiểm tra giao diện responsive khi thay đổi kích thước cửa sổ. | Đang mở form Khởi tạo. | 1. Thu nhỏ chiều rộng cửa sổ trình duyệt xuống kích thước tablet/mobile.<br>2. Kéo dãn ra màn hình to (1920x1080). | 1. Bố cục tự động bẻ dòng (stack), các cột input co giãn không bị mất chữ hay đè lên nhau.<br>2. Khung form căn giữa hoặc dãn đều đẹp mắt. | Medium | Màn hình resize |
