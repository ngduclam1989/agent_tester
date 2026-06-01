import os

md_path = "f:/lam_demo/antigravity-testing-kit/practices/testcases/cardoctor/TC_ONBOARD_TENANT.md"

headers = """# TÀI LIỆU TEST CASES: ONBOARD TENANT (ALL REQUIREMENTS + KNOWLEDGE GRAPH)

## 1. Thông tin chung
- **Dự án:** CarDoctor (COP)
- **Module:** Onboard Tenant (Khởi tạo, danh sách, chi tiết, kích hoạt, Owner, đối tác bảo hiểm)
- **Feature ID:** `FEAT-TEN-001`, `FEAT-TEN-002`
- **Hệ thống:** Web
- **Kỹ thuật áp dụng:** Equivalence Partitioning, Boundary Value Analysis, Error Guessing.

---

## 2. Bảng tổng hợp Risk Level (Thống kê rủi ro theo tính năng)

| Chức năng / Tính năng | Risk Level | Đánh giá & Căn cứ |
|---|:---:|---|
| Khởi tạo Tenant | **High** | Chức năng cốt lõi tạo dữ liệu gốc, các luồng happy cases với nhiều tổ hợp dữ liệu (required, optional, mix). |
| Kích hoạt / Khóa Tenant | **High** | Ảnh hưởng đến khả năng login/sử dụng của toàn bộ hệ thống của Tenant. Ghi log activation. |
| Quản lý Hồ sơ năng lực | **Medium** | Cập nhật thông tin hồ sơ của Tenant, lưu trữ thông tin nghiệp vụ. |
| Quản lý Tài khoản Tenant | **High** | Thêm, sửa, phân quyền tài khoản Tenant (Owner/Admin bootstrap). |
| Liên kết nhà xe | **Medium** | Liên kết, hủy liên kết với các hệ thống Transporter. |
| Validation Dữ liệu Form | **High** | Yêu cầu khắt khe từ Backend (Knowledge Graph) như: SĐT unique, Subdomain unique & max 20, MST. Validations phải check mọi edge cases (ký tự đặc biệt, chữ-số). |
| Danh sách, Chi tiết, Chỉnh sửa | **Medium** | Kiểm tra CRUD sau khi tạo mới, phân trang, lọc dữ liệu. |
| UI & Behavior | **Low** | Layout từ trên xuống dưới, Tab/Shift-Tab, Hover effects, dropdown selection. |

---

## 3. Danh sách tài khoản Test / Test Data thiết yếu

- **Admin User:** `admin_tenant@cardoctor.vn` (Quyền: `tenant-management`)
- **No-Access User:** `no_access@cardoctor.vn`

---

## 4. Traceability Matrix

| Requirement AC | Danh sách Test Cases (TC ID) |
|---|---|
| **AC-1** (Hiển thị FEAT-TEN-001) | UI_001 -> UI_010 |
| **AC-2** (Validation & Quyền FEAT-TEN-001) | VAL_001 -> VAL_080 |
| **AC-3** (Audit log FEAT-TEN-001) | SIDE_001 -> SIDE_010 |
| **AC-1** (Khoá/mở khoá FEAT-TEN-002) | CAR_TENANT_TC_138, CAR_TENANT_TC_141, CAR_TENANT_TC_142 |
| **AC-2** (Validation & Quyền FEAT-TEN-002) | CAR_TENANT_TC_143 -> CAR_TENANT_TC_145 |
| **AC-3** (Audit log FEAT-TEN-002) | CAR_TENANT_TC_134, CAR_TENANT_TC_141, CAR_TENANT_TC_142 |

---

## 5. BẢNG TEST CASES CHI TIẾT

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
"""

tcs = []
tc_count = 1

def add_tc(group, risk, title, steps, expected, priority, data="N/A", pre_cond="Đăng nhập tài khoản Admin"):
    global tc_count
    tcs.append((group, f"| CAR_TENANT_TC_{tc_count:03d} | Onboard tenant | {risk} | {title} | {pre_cond} | {steps} | {expected} | {priority} | {data} |"))
    tc_count += 1

# --- 1. FUNCTION (Happy & Unhappy) ---
add_tc("Function", "High", "Khởi tạo Tenant thành công với FULL dữ liệu (Required + Optional)", 
       "1. Mở màn hình Khởi tạo<br>2. Nhập đầy đủ toàn bộ các trường bắt buộc và tuỳ chọn<br>3. Bấm Lưu",
       "1. Hệ thống tiếp nhận thông tin<br>2. Màn hình không hiển thị lỗi validation<br>3. Lưu thành công, hiển thị thông báo và quay về trang Danh sách", "Critical",
       "Tên: A, Loại: Vendor, Tên miền: a.abc.com, SĐT: 0987654321, Email: a@a.com, Gói: Free, Các dv: Gara App, Người đại diện: B, Kế toán: C, Đối tác BH: BIC, Vùng: MB1, Tỉnh: HN, Xã: Cầu Diễn, Địa chỉ: D, Ghi chú: E, Ảnh: img.jpg, Tên Cty: F, Email Cty: f@f.com, MST: 0123456789, ĐC Cty: G")

add_tc("Function", "High", "Khởi tạo Tenant thành công CHỈ với các trường bắt buộc", 
       "1. Mở màn hình Khởi tạo<br>2. Nhập đúng các trường có dấu *<br>3. Bỏ trống các trường optional (Email, Kế toán, Đối tác BH, Ảnh, Ghi chú)<br>4. Bấm Lưu",
       "1. Hệ thống tiếp nhận thông tin<br>2. Các trường bỏ trống không bị check validation<br>3. Không có lỗi<br>4. Lưu thành công", "Critical", "Chỉ nhập các trường bắt buộc")

add_tc("Function", "High", "Khởi tạo Tenant thành công với các trường bắt buộc + Email", 
       "1. Nhập các trường có dấu *<br>2. Nhập thêm Email<br>3. Bấm Lưu", "1. Hệ thống ghi nhận Email<br>2. Pass qua validation Email<br>3. Lưu thành công", "High", "Thêm Email")

add_tc("Function", "High", "Khởi tạo Tenant thành công với các trường bắt buộc + Đối tác bảo hiểm", 
       "1. Nhập các trường có dấu *<br>2. Chọn Đối tác bảo hiểm<br>3. Bấm Lưu", "1. Hệ thống ghi nhận các trường<br>2. Tag Đối tác bảo hiểm được lưu<br>3. Lưu thành công", "High", "Thêm Đối tác BH")

add_tc("Function", "High", "Khởi tạo Tenant thành công với các trường bắt buộc + Ghi chú + Ảnh đại diện", 
       "1. Nhập các trường có dấu *<br>2. Thêm Ghi chú và Ảnh đại diện<br>3. Bấm Lưu", "1. Hệ thống nhận Ghi chú, Ảnh<br>2. Upload ảnh không gặp lỗi<br>3. Lưu thành công", "High", "Thêm Ghi chú, Ảnh")

add_tc("Function", "High", "Khởi tạo Tenant thất bại khi thiếu thông tin bắt buộc", 
       "1. Bỏ trống 1 trường bắt buộc bất kỳ<br>2. Bấm Lưu", "1. Lỗi validation hiện lên tại vị trí field tương ứng<br>2. Nút Lưu không thực thi gọi API tạo mới", "High")

# --- 2. VALIDATION ---
fields_text = ["Tên Tenant", "Tên miền con", "Người đại diện", "Địa chỉ chi tiết", "Tên công ty", "Địa chỉ công ty", "Kế toán trưởng"]
for field in fields_text:
    req_level = "High" if field != "Kế toán trưởng" else "Medium"
    if field != "Kế toán trưởng":
        add_tc("Validation", "Medium", f"Validate {field} - Không nhập (Required)", f"1. Để trống trường {field}<br>2. Bấm Lưu", f"1. Báo lỗi yêu cầu nhập cho trường {field}<br>2. Quá trình tạo mới bị chặn", "High")
        add_tc("Validation", "Medium", f"Validate {field} - Nhập toàn khoảng trắng", f"1. Nhập toàn khoảng trắng (space) vào {field}<br>2. Bấm Lưu", f"1. Tự động clear space<br>2. Báo lỗi yêu cầu nhập cho trường {field}", "High")
    
    add_tc("Validation", "Medium", f"Validate {field} - Max length", f"1. Nhập chuỗi 256 ký tự vào {field}<br>2. Bấm Lưu", f"1. Form chặn không cho nhập tiếp ký tự thứ 256 HOẶC báo lỗi vượt độ dài tối đa<br>2. Quá trình tạo mới bị chặn", "Medium", "Chuỗi 256 ký tự 'a'")
    add_tc("Validation", "Medium", f"Validate {field} - Chứa ký tự đặc biệt", f"1. Nhập ký tự đặc biệt !@#$%^&* vào {field}<br>2. Bấm Lưu", f"1. Field chấp nhận input<br>2. Lưu thành công (nếu không có rule cấm)", "Medium", "!@#$%^&*")
    add_tc("Validation", "Medium", f"Validate {field} - Chữ và số kết hợp", f"1. Nhập chữ và số (ví dụ: Text123) vào {field}<br>2. Bấm Lưu", f"1. Dữ liệu được ghi nhận hợp lệ<br>2. Lưu thành công", "Low", "Text123")
    add_tc("Validation", "Medium", f"Validate {field} - Ký tự script (XSS)", f"1. Nhập chuỗi script `<script>alert(1)</script>` vào {field}<br>2. Bấm Lưu", f"1. Input được xử lý an toàn (encode html)<br>2. Lưu thành công dạng plain text, không pop-up alert", "High", "`<script>alert(1)</script>`")
    add_tc("Validation", "Medium", f"Validate {field} - Trim space đầu cuối", f"1. Nhập dữ liệu kèm khoảng trắng ở đầu và cuối (vd: '  Text  ') vào {field}<br>2. Bấm Lưu", f"1. Form tự động Trim space đầu và cuối của dữ liệu trước khi lưu", "Medium", "'  Text  '")
    add_tc("Validation", "Medium", f"Validate {field} - Copy/Paste", f"1. Copy chuỗi hợp lệ<br>2. Paste vào trường {field}", f"1. Form cho phép paste thành công", "Low")

# Specific Subdomain
add_tc("Validation", "High", "Validate Tên miền con - Nhập đúng định dạng", "1. Nhập tên miền gồm chữ, số, dấu - (VD: test-tenant-123)<br>2. Bấm Lưu", "1. Chấp nhận hợp lệ<br>2. Lưu thành công", "High", "test-tenant-123")
add_tc("Validation", "High", "Validate Tên miền con - Bắt đầu hoặc kết thúc bằng gạch ngang", "1. Nhập '-testtenant' hoặc 'testtenant-'<br>2. Bấm Lưu", "1. Báo lỗi tên miền không đúng định dạng", "High", "-testtenant")
add_tc("Validation", "High", "Validate Tên miền con - Chứa ký tự đặc biệt khác gạch ngang", "1. Nhập 'test@tenant'<br>2. Bấm Lưu", "1. Báo lỗi tên miền không đúng định dạng", "High", "test@tenant")
add_tc("Validation", "High", "Validate Tên miền con - Max 20 ký tự (Backend rule)", "1. Nhập tên miền con dài 21 ký tự<br>2. Bấm Lưu", "1. Validation tên miền hoạt động<br>2. Báo lỗi độ dài vượt quá 20 ký tự", "High", "abcdefghijklmnopqrstu")
add_tc("Validation", "High", "Validate Tên miền con - Bị trùng lặp (Unique rule)", "1. Nhập tên miền con đã tồn tại trên DB<br>2. Bấm Lưu", "1. Gửi request check duplicate<br>2. Báo lỗi tên miền con đã được đăng ký", "Critical", "tenant-test-01")

# Number fields (SĐT, MST)
add_tc("Validation", "High", "Validate Số điện thoại - Không nhập", "1. Để trống trường SĐT<br>2. Bấm Lưu", "1. Form validation hoạt động<br>2. Báo lỗi yêu cầu nhập SĐT", "High")
add_tc("Validation", "High", "Validate Số điện thoại - Không đủ 10 ký tự", "1. Nhập 9 số (vd: 098765432)<br>2. Bấm Lưu", "1. Báo lỗi không đúng định dạng SĐT (phải đủ 10 số)", "High", "098765432")
add_tc("Validation", "High", "Validate Số điện thoại - Không bắt đầu bằng số 0", "1. Nhập SĐT bắt đầu bằng số 1 (vd: 1987654321)<br>2. Bấm Lưu", "1. Báo lỗi không đúng định dạng SĐT", "High", "1987654321")
add_tc("Validation", "High", "Validate Số điện thoại - Chứa chữ cái", "1. Nhập ký tự chữ '098abc1234' vào SĐT<br>2. Bấm Lưu", "1. Form chặn nhập chữ cái hoặc báo lỗi ngay khi nhập<br>2. Không cho phép lưu", "High", "098abc1234")
add_tc("Validation", "High", "Validate Số điện thoại - Chứa ký tự đặc biệt", "1. Nhập ký tự đặc biệt '0987-654-321' vào SĐT<br>2. Bấm Lưu", "1. Form chặn ký tự đặc biệt hoặc báo lỗi định dạng<br>2. Không cho phép lưu", "High", "0987-654-321")
add_tc("Validation", "High", "Validate Số điện thoại - Bị trùng lặp (Unique rule)", "1. Nhập SĐT đã có trong DB của Tenant khác<br>2. Bấm Lưu", "1. Check duplicate backend<br>2. Hiển thị thông báo lỗi số điện thoại đã tồn tại", "Critical")

add_tc("Validation", "High", "Validate Mã số thuế - Chứa chữ cái", "1. Nhập MST có chữ '0123A56789'<br>2. Bấm Lưu", "1. Form báo lỗi MST chỉ chấp nhận định dạng số<br>2. Ngăn lưu dữ liệu", "High", "0123A56789")
add_tc("Validation", "High", "Validate Mã số thuế - Chữ và số kết hợp", "1. Nhập MST gồm chữ và số 'ABC12345'<br>2. Bấm Lưu", "1. Form báo lỗi sai định dạng<br>2. Ngăn lưu dữ liệu", "Medium", "ABC12345")
add_tc("Validation", "High", "Validate Mã số thuế - Min/Max length", "1. Nhập MST có 9 số (hoặc 14 số)<br>2. Bấm Lưu", "1. Rule length kích hoạt<br>2. Báo lỗi độ dài MST (chỉ nhận 10 hoặc 13 chữ số)", "Medium")

# Email fields
add_tc("Validation", "Medium", "Validate Email (Tenant) - Sai định dạng", "1. Nhập Email sai format 'testgmail.com'<br>2. Bấm Lưu", "1. Regex Email hoạt động<br>2. Báo lỗi định dạng Email chưa đúng", "Medium")
add_tc("Validation", "High", "Validate Email công ty - Không nhập", "1. Bỏ trống Email công ty<br>2. Bấm Lưu", "1. Validation Required hoạt động<br>2. Báo lỗi yêu cầu điền Email công ty", "High")
add_tc("Validation", "High", "Validate Email công ty - Sai định dạng", "1. Nhập Email sai format 'test@.com'<br>2. Bấm Lưu", "1. Regex Email hoạt động<br>2. Báo lỗi định dạng Email chưa hợp lệ", "Medium")

# Dropdown / Dependency Logic
add_tc("Validation", "High", "Validate Loại mô hình / Dịch vụ - Khi chọn GARAGE", "1. Chọn Loại Tenant là GARAGE<br>2. Bấm mở dropdown Loại Mô hình<br>3. Bấm mở dropdown Dịch vụ", "1. Loại mô hình hiển thị 4 option: Sửa chữa, Chăm sóc, Tổng hợp, Mua bán PT<br>2. Dịch vụ hiển thị option: GMS", "High")
add_tc("Validation", "High", "Validate Loại mô hình / Dịch vụ - Khi chọn VENDOR", "1. Chọn Loại Tenant là VENDOR<br>2. Bấm mở dropdown Loại Mô hình<br>3. Bấm mở dropdown Dịch vụ", "1. Loại mô hình hiển thị 1 option: Mua bán phụ tùng<br>2. Dịch vụ hiển thị option: VMS", "High")

# Region logic (Vùng, Tỉnh Thành)
add_tc("Validation", "High", "Validate Vùng - Khi FF InventoryStockV01 = ON", "1. Thiết lập FF InventoryStockV01 = ON<br>2. Mở form Khởi tạo Tenant", "1. Trường Vùng bị Ẩn đi", "High", "Cấu hình InventoryStockV01=ON")
add_tc("Validation", "High", "Validate Vùng - Khi FF InventoryStockV01 = OFF", "1. Thiết lập FF InventoryStockV01 = OFF<br>2. Mở form Khởi tạo Tenant<br>3. Chọn Vùng", "1. Trường Vùng hiển thị<br>2. Dropdown hiển thị đủ các option Vùng", "High", "Cấu hình InventoryStockV01=OFF")
add_tc("Validation", "Medium", "Validate Dropdown Phụ thuộc - Tỉnh/Thành & Xã/Phường", "1. Chọn Tỉnh/Thành phố là Hà Nội<br>2. Mở dropdown Xã/Phường", "1. Dropdown Xã/Phường chỉ hiển thị các xã/phường thuộc Hà Nội", "High")

# Dropdown fields required
dropdowns = ["Loại Tenant", "Loại mô hình", "Gói dịch vụ", "Tỉnh / Thành phố", "Xã / Phường"]
for dd in dropdowns:
    add_tc("Validation", "Medium", f"Validate {dd} - Bỏ trống (Không chọn)", f"1. Bỏ qua dropdown {dd}<br>2. Bấm Lưu", f"1. Validation dropdown báo lỗi tại vị trí {dd}<br>2. Không thể lưu", "High")

add_tc("Validation", "Medium", "Validate Các dịch vụ (Multi-select) - Không chọn", "1. Để trống không chọn Option nào trong 'Các dịch vụ'<br>2. Bấm Lưu", "1. Validation multi-select báo lỗi<br>2. Yêu cầu chọn ít nhất 1 dịch vụ", "High")

# Ảnh đại diện
add_tc("Validation", "Medium", "Validate Ảnh đại diện - Upload đúng định dạng/size", "1. Bấm Nhấn để chọn tệp<br>2. Chọn ảnh <30MB, định dạng JPG/PNG", "1. Upload thành công<br>2. Hiển thị preview ảnh đại diện", "Medium")
add_tc("Validation", "High", "Validate Ảnh đại diện - Upload quá 30MB", "1. Chọn ảnh vượt quá 30MB", "1. Báo lỗi Ảnh không được vượt quá 30MB<br>2. Không cho phép upload", "High")
add_tc("Validation", "High", "Validate Ảnh đại diện - Sai định dạng", "1. Chọn file PDF hoặc EXE", "1. Báo lỗi Ảnh không hợp lệ (Vui lòng chọn JPG, PNG, JPEG, SVG...)<br>2. Không cho upload", "High")

# Exceptions
add_tc("Exception", "High", "Ngoại lệ - Tạo Tenant khi mất kết nối Internet", "1. Ngắt kết nối mạng<br>2. Nhập form hợp lệ<br>3. Bấm Lưu", "1. Báo lỗi Mất kết nối Internet<br>2. Không lưu vào DB", "High")
add_tc("Exception", "High", "Ngoại lệ - Tạo Tenant khi mất kết nối API/DB", "1. Gây lỗi API (500) hoặc DB down<br>2. Nhập form hợp lệ<br>3. Bấm Lưu", "1. Báo lỗi 500<br>2. Dữ liệu không lưu vào DB", "High")
add_tc("Exception", "Medium", "Ngoại lệ - Hủy bỏ thao tác bằng Nút Hủy", "1. Nhập thông tin form<br>2. Bấm nút Hủy bỏ", "1. Tắt màn hình Tạo mới, về màn Danh sách<br>2. Dữ liệu không được lưu", "Medium")
add_tc("Exception", "Medium", "Ngoại lệ - Hủy bỏ thao tác bằng Back browser / Breadcrumb", "1. Nhập thông tin form<br>2. Bấm Breadcrumb về danh sách hoặc nút Back browser", "1. Về trang danh sách<br>2. Dữ liệu không lưu", "Medium")

# --- 3. UI & BEHAVIOR ---
ui_elements = [
    "Tiêu đề 'Khởi tạo Tenant'", "Block 'Thông tin Tenant'", "Trường Tên Tenant", "Trường Loại Tenant", 
    "Trường Loại mô hình", "Trường Tên miền con", "Trường Gói dịch vụ", "Trường Các dịch vụ", 
    "Trường Email", "Trường Số điện thoại", "Trường Người đại diện", "Trường Kế toán trưởng",
    "Trường Đối tác bảo hiểm", "Trường Vùng", "Trường Tỉnh / Thành phố", "Trường Xã / Phường", 
    "Trường Địa chỉ chi tiết", "Block Upload Ảnh", "Trường Ghi chú triển khai", 
    "Block 'Thông tin xuất hóa đơn'", "Trường Tên công ty", "Trường Email công ty", "Trường MST", "Trường Địa chỉ công ty",
    "Nút Hủy bỏ", "Nút Lưu"
]
for el in ui_elements:
    add_tc("UI", "Low", f"Kiểm tra hiển thị layout - {el}", f"1. Mở màn hình Khởi tạo<br>2. Quan sát Element '{el}'", f"1. Element tồn tại<br>2. Layout, màu sắc, font chữ hiển thị chuẩn xác", "Low")

add_tc("UI", "Low", "Kiểm tra Tiêu đề màn hình và Tiêu đề Tab", "1. Truy cập Khởi tạo Tenant", "1. Title tab hiển thị 'Khởi tạo Tenant'", "Low")
add_tc("UI", "Low", "Kiểm tra Breadcrumb", "1. Kiểm tra breadcrumb ở góc trên", "1. Hiển thị đúng breadcrumb<br>2. Chuột biến thành pointer khi hover", "Low")
add_tc("UI", "Low", "Kiểm tra Zoom In / Zoom Out (Ctrl + / Ctrl -)", "1. Nhấn Ctrl+ và Ctrl-", "1. Giao diện phóng to thu nhỏ mà không bị vỡ layout", "Low")
add_tc("UI", "Low", "Kiểm tra Behavior - Tab từ trên xuống dưới", "1. Click vào trường Tên Tenant<br>2. Nhấn phím Tab tuần tự<br>3. Theo dõi Element đang được active", "1. Focus con trỏ chuột bắt đầu từ Tên Tenant<br>2. Nhảy đúng thứ tự từ trên xuống dưới<br>3. Không bỏ sót Element input nào", "Medium")
add_tc("UI", "Low", "Kiểm tra Behavior - Shift+Tab từ dưới lên trên", "1. Focus vào nút Lưu<br>2. Nhấn tổ hợp phím Shift+Tab nhiều lần<br>3. Theo dõi Element active", "1. Bắt đầu từ Nút Lưu<br>2. Focus nhảy ngược lại lên các trường phía trên<br>3. Đúng trình tự ngược", "Medium")
add_tc("UI", "Low", "Kiểm tra Behavior - Hover qua nút Lưu/Hủy bỏ", "1. Di chuyển trỏ chuột (Hover) qua nút Hủy bỏ<br>2. Di chuyển Hover qua nút Lưu", "1. Nút Hủy bỏ đổi màu nền (hover state)<br>2. Nút Lưu đổi màu nền hoặc bóng đổ (hover state)", "Low")
add_tc("UI", "Low", "Kiểm tra Behavior - Dropdown Đa lựa chọn", "1. Click mở dropdown Đối tác bảo hiểm<br>2. Chọn 2 option bất kỳ<br>3. Bấm icon X trên 1 option đã chọn", "1. Danh sách Option mở ra<br>2. Chọn xong hiển thị dưới dạng Tag<br>3. Bấm X thì Tag bị gỡ bỏ khỏi input", "Medium")

# --- 4. ẢNH HƯỞNG CHỨC NĂNG (SIDE EFFECTS - CRUD) ---
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra dữ liệu trên List sau khi Tạo mới", "1. Hoàn tất tạo 1 Tenant A<br>2. Điều hướng ra màn hình Danh sách<br>3. Quan sát thông tin Tenant A", "1. Tenant A được tạo thành công<br>2. Bản ghi A nằm ở đầu danh sách (sort)<br>3. Các cột dữ liệu (Tên, SĐT, Loại) khớp với lúc nhập", "High")
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra dữ liệu trên Detail sau khi Tạo mới", "1. Hoàn tất tạo 1 Tenant A<br>2. Click vào tên Tenant A để xem Chi tiết<br>3. Đối chiếu toàn bộ trường thông tin", "1. Tạo thành công<br>2. Mở được màn hình Detail<br>3. Các trường từ form Create sang Detail bảo toàn không bị null hay sai format", "High")
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra Database record sau khi tạo mới thành công", "1. Tạo Tenant mới thành công<br>2. Kiểm tra DB", "1. Tạo thành công<br>2. DB insert bản ghi vào đủ các bảng: tenants, tenant_stage_transition_history, tenant_business_model, tenant_vehicle_profile, tenant_operation_area, predefined_tiers, tiering_solution, microservice_registry, image_registry, tenant_subscription, tenant_users, tenant_invoice_info, tenant_transporter-registry", "Critical")
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra chức năng Sửa (Update) sau khi Tạo mới", "1. Mở xem chi tiết Tenant A vừa tạo<br>2. Bấm Sửa, thực hiện thay đổi SĐT mới<br>3. Bấm Lưu thông tin sửa", "1. Chuyển sang chế độ Edit<br>2. Validate SĐT mới hợp lệ<br>3. Lưu và hiển thị SĐT cập nhật thành công trên trang Detail", "High")
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra logic Kế thừa Branch/Warehouse (Backend BR)", "1. Tạo Tenant mới<br>2. Truy vấn DB xem có bản ghi rác của Branch/Warehouse không", "1. Tenant tạo thành công<br>2. Khẳng định không có Branch/Warehouse mới tự sinh ra (theo Legacy logic)", "High")
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra Ghi log Audit khi Kích hoạt/Khóa", "1. Chọn Tenant<br>2. Thực hiện thao tác Kích hoạt (hoặc Khóa)<br>3. Check Audit log", "1. Hành động thành công trên UI<br>2. Trigger Audit log<br>3. Log có đủ thông tin Actor (userId), Action name, Timestamp", "Critical")
add_tc("Ảnh hưởng chức năng", "High", "Kiểm tra trigger Jenkins (Backend BR)", "1. Kích hoạt Tenant từ UI<br>2. Kiểm tra Backend status và quá trình gọi Jenkins", "1. Kích hoạt trigger UI<br>2. Hệ thống chuyển status thành ACTIVATING và gọi Jenkins tạo subdomain<br>3. Khi hoàn tất, quay về ACTIVE", "Critical")

# --- 5. FUNCTION - QUẢN LÝ (FEAT-TEN-002) ---
add_tc("Function - Quản lý", "High", "Quản lý Hồ sơ năng lực - Cập nhật thành công", "1. Mở chi tiết Tenant<br>2. Vào tab Hồ sơ năng lực<br>3. Chỉnh sửa thông tin năng lực (số lượng nhân viên, dịch vụ hỗ trợ, diện tích...)<br>4. Bấm Lưu", "1. Lưu thông tin thành công<br>2. Dữ liệu hiển thị đúng trên màn hình chi tiết", "High")
add_tc("Function - Quản lý", "High", "Quản lý Tài khoản Tenant - Thêm mới tài khoản thành công", "1. Mở chi tiết Tenant<br>2. Vào tab Tài khoản<br>3. Bấm Thêm mới<br>4. Nhập đủ thông tin (Tên, Email, SĐT, Vai trò)<br>5. Bấm Lưu", "1. Tài khoản được tạo mới thành công<br>2. Trạng thái tài khoản là Kích hoạt<br>3. Hiển thị trên danh sách tài khoản Tenant", "Critical", "Tên, Email, Vai trò Admin/User")
add_tc("Function - Quản lý", "Medium", "Quản lý Tài khoản Tenant - Cập nhật trạng thái tài khoản (Khoá/Mở khoá)", "1. Tại tab Tài khoản của Tenant<br>2. Chọn một tài khoản đang Hoạt động<br>3. Chọn Khoá", "1. Trạng thái tài khoản chuyển sang Khoá<br>2. Người dùng bị khoá không thể login", "High")
add_tc("Function - Quản lý", "Medium", "Quản lý Liên kết nhà xe - Thêm liên kết thành công", "1. Vào tab Liên kết nhà xe<br>2. Bấm Thêm liên kết<br>3. Chọn Nhà xe từ danh sách<br>4. Bấm Lưu", "1. Thêm liên kết thành công<br>2. Nhà xe hiển thị trong danh sách liên kết", "Medium", "Chọn nhà xe")
add_tc("Function - Quản lý", "Medium", "Quản lý Liên kết nhà xe - Hủy liên kết", "1. Vào tab Liên kết nhà xe<br>2. Chọn một liên kết đang có<br>3. Bấm Hủy liên kết<br>4. Xác nhận", "1. Liên kết bị xóa khỏi danh sách<br>2. Dữ liệu mapping trong DB được cập nhật", "Medium")
add_tc("Function - Quản lý", "High", "Khoá/Mở khoá Tenant - Khoá Tenant thành công", "1. Tại danh sách Tenant hoặc Chi tiết<br>2. Bấm nút Khoá cho Tenant đang Active<br>3. Điền lý do khoá<br>4. Xác nhận", "1. Trạng thái Tenant chuyển sang Locked<br>2. Tất cả tài khoản thuộc Tenant bị từ chối đăng nhập<br>3. Hệ thống ghi Audit log", "Critical")
add_tc("Function - Quản lý", "High", "Khoá/Mở khoá Tenant - Mở khoá Tenant thành công", "1. Bấm nút Mở khoá cho Tenant đang Locked<br>2. Xác nhận", "1. Trạng thái Tenant chuyển sang Active<br>2. Các tài khoản có thể đăng nhập lại bình thường<br>3. Hệ thống ghi Audit log", "Critical")

# --- 6. VALIDATION - QUẢN LÝ (FEAT-TEN-002) ---
add_tc("Validation - Quản lý", "High", "Validate Quản lý Tài khoản - Trùng Email", "1. Thêm mới tài khoản<br>2. Nhập Email đã tồn tại trong hệ thống<br>3. Bấm Lưu", "1. Báo lỗi Email đã tồn tại<br>2. Không cho phép tạo", "High", "Email trùng")
add_tc("Validation - Quản lý", "High", "Validate Quản lý Tài khoản - Trùng SĐT", "1. Thêm mới tài khoản<br>2. Nhập SĐT đã tồn tại<br>3. Bấm Lưu", "1. Báo lỗi SĐT đã tồn tại<br>2. Không cho phép tạo", "High", "SĐT trùng")
add_tc("Validation - Quản lý", "Medium", "Validate Liên kết nhà xe - Liên kết trùng lặp", "1. Thêm liên kết nhà xe<br>2. Chọn nhà xe đã liên kết trước đó<br>3. Bấm Lưu", "1. Form báo lỗi Nhà xe đã được liên kết<br>2. Không tạo dữ liệu trùng", "Medium")

# --- 7. BỔ SUNG LOGIC THEO API (ct-saas-tenant-service-api.md) ---
add_tc("Validation - API Logic", "High", "Validate Invoice Info - Khi FF PurchaseV02 = ON và Type = GARAGE", "1. Cấu hình FF Purchase:PurchaseV02 = ON<br>2. Chọn Loại Tenant = GARAGE<br>3. Bỏ trống MST, Tên công ty, Địa chỉ công ty xuất hoá đơn<br>4. Bấm Lưu", "1. Báo lỗi bắt buộc nhập MST, Tên công ty, Địa chỉ công ty xuất hoá đơn", "High")
add_tc("Validation - API Logic", "High", "Validate Invoice Info - Khi FF PurchaseV02 = OFF", "1. Cấu hình FF Purchase:PurchaseV02 = OFF<br>2. Chọn Loại Tenant = GARAGE<br>3. Bỏ trống MST, Tên công ty xuất hoá đơn<br>4. Bấm Lưu", "1. Không báo lỗi bắt buộc nhập từ feature này (tuỳ thuộc vào logic legacy, không bị force bởi PurchaseV02)", "High")
add_tc("Validation - API Logic", "High", "Validate Max Length Invoice Info", "1. Nhập MST > 50 ký tự<br>2. Nhập Tên công ty > 255 ký tự<br>3. Nhập Địa chỉ công ty > 255 ký tự<br>4. Bấm Lưu", "1. Báo lỗi vượt quá độ dài tối đa cho phép của Backend", "High", "MST 51 char, Tên/Địa chỉ 256 char")
add_tc("Validation - API Logic", "High", "Validate Consultant - Khi FF QuotationConsultant = ON và Type = GARAGE", "1. Cấu hình FF Marketplace:QuotationConsultant = ON<br>2. Chọn Loại Tenant = GARAGE<br>3. Không gán Consultant<br>4. Bấm Lưu", "1. Báo lỗi bắt buộc phải gán Consultant cho Tenant", "High")
add_tc("Validation - API Logic", "High", "Validate Location - Khi FF InventoryStockV01 = ON", "1. Cấu hình FF Inventory:InventoryStockV01 = ON<br>2. Bỏ trống companyHoAddress, city, ward<br>3. Bấm Lưu", "1. Báo lỗi bắt buộc nhập Địa chỉ trụ sở chính (HO), Tỉnh/Thành (city), Xã/Phường (ward)", "High")
add_tc("Function - API Logic", "High", "Khởi tạo Tenant với Operation Area Codes (Mảng khu vực)", "1. Chọn nhiều khu vực hoạt động (Operation Areas)<br>2. Bấm Lưu", "1. Dữ liệu mảng các khu vực hoạt động được lưu thành công vào Backend", "High", "Chọn 2-3 khu vực")
add_tc("Function - API Logic", "Medium", "Khởi tạo Tenant với Ops Note và Ops1-Ops5", "1. Nhập thông tin vào các trường mở rộng Ops Note, Ops 1 đến Ops 5<br>2. Bấm Lưu", "1. Các trường dữ liệu mở rộng được lưu thành công", "Low", "Nhập text vào các trường ops")

with open(md_path, "w", encoding="utf-8") as f:
    f.write(headers)
    current_group = ""
    for group, tc in tcs:
        if group != current_group:
            if current_group != "":
                f.write("| | | | | | | | | |\n")
            f.write(f"| **NHÓM {group.upper()}** | | | | | | | | |\n")
            current_group = group
        f.write(tc + "\n")
