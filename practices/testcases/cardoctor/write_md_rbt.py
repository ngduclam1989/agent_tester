import os

md_path = "f:/lam_demo/antigravity-testing-kit/practices/testcases/cardoctor/TC_ONBOARD_TENANT.md"

headers = """# TÀI LIỆU TEST CASES: ONBOARD TENANT (RISK-BASED TESTING)

## 1. Thông tin chung
- **Dự án:** CarDoctor (COP)
- **Module:** Onboard tenant
- **URL:** Không có
- **Tổng số TC:** {total_tc}
- **Kỹ thuật áp dụng:** Equivalence Partitioning, Boundary Value Analysis, Decision Table, State Transition, Error Guessing.

## 2. Bảng tổng hợp Risk Level (Thống kê rủi ro theo tính năng)
| Module/Chức năng | Group | Risk Level | Đánh giá & Căn cứ |
|---|---|:---:|---|
| Khởi tạo & Quản lý Tenant | function | **High** | Chức năng cốt lõi tạo dữ liệu gốc, các luồng happy/unhappy cases. |
| Validation Dữ liệu Form | validate | **Medium** | Yêu cầu khắt khe từ Backend (SĐT unique, Subdomain unique & max 20, MST). Kiểm tra max/min, khoảng trắng, ký tự đặc biệt. |
| Phân quyền Truy cập | phân quyền | **High** | Đảm bảo tính bảo mật, chỉ user có quyền hợp lệ (tenant-management) mới được sử dụng chức năng. |
| Giao diện hiển thị (UI) | UI | **Medium** | Kiểm tra layout, element, thông báo, font chữ, màu sắc, behavior (tab, hover, focus, resize). |
| Kế thừa, Audit, Jenkins | các phần ảnh hưởng chức năng liên quan | **High** | Kế thừa dữ liệu legacy, ghi log Audit, trigger Jenkins khởi tạo subdomain. |

## 3. Danh sách tài khoản Test / Test Data thiết yếu
- **Admin User (Có quyền):** `admin_tenant@cardoctor.vn` (Quyền: `tenant-management`, Role: `SYSTEM_ADMIN`)
- **No-Access User (Không có quyền):** `no_access@cardoctor.vn` (Role: `GUEST`)

## 4. Traceability Matrix
| Requirement | Danh sách Test Cases (TC ID) |
|---|---|
| **FEAT-TEN-001 (Onboarding)** | Các TC khởi tạo trong nhóm function, validate, UI |
| **FEAT-TEN-002 (Manage)** | Các TC quản lý trong nhóm function, validate, UI |
| **ct-saas-tenant-service-api** | Các TC validate Feature Flags (PurchaseV02, InventoryStockV01, QuotationConsultant) |

## 5. Bảng tổng hợp Ambiguities & Câu hỏi Q&A (Assumptions)
| ID | Vấn đề (Ambiguity) | Đề xuất / Câu hỏi (Q&A) |
|---|---|---|
| Q1 | API DELETE `/api/v1/saas-tenant/{{tenantId}}` đang là `todo implement`. | Cần xác nhận có test luồng Xóa Tenant trên UI không? (Assumption: Không test Xóa hiện tại) |
| Q2 | Format Email có cho phép các TLD mới (.io, .tech, ...)? | Assumption: Dùng regex chuẩn cho phép mọi TLD hợp lệ. |

## 6. Bảng thống kê
| Priority | Kỹ thuật Test | Số lượng |
|---|---|---|
| Critical | State Transition, EP | 15 |
| High | BVA, Decision Table | 65 |
| Medium | EP, BVA | 75 |
| Low | UI Check | 30 |

## 7. BẢNG TEST CASES CHI TIẾT

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|---|---|---|---|---|---|---|---|---|
"""

tcs = []
tc_count = 1

import re

def add_tc(group, risk, title, steps, expected, priority, data="N/A", pre_cond="Đăng nhập tài khoản Admin"):
    global tc_count
    
    # Auto-align steps and expected results
    step_count = len(steps.split("<br>"))
    exp_count = len(expected.split("<br>"))
    
    if step_count > exp_count:
        exps = expected.split("<br>")
        clean_exps = [re.sub(r'^\d+\.\s*', '', e) for e in exps]
        padding_needed = step_count - exp_count
        new_exps = ["Hệ thống ghi nhận thao tác"] * padding_needed + clean_exps
        expected = "<br>".join([f"{i+1}. {e}" for i, e in enumerate(new_exps)])
    elif exp_count > step_count:
        exps = expected.split("<br>")
        clean_exps = [re.sub(r'^\d+\.\s*', '', e) for e in exps]
        merged_exps = clean_exps[:step_count-1]
        last_exp = ". ".join(clean_exps[step_count-1:])
        merged_exps.append(last_exp)
        expected = "<br>".join([f"{i+1}. {e}" for i, e in enumerate(merged_exps)])

    tcs.append((group, f"| CAR_TENANT_TC_{tc_count:03d} | Onboard tenant | {risk} | {title} | {pre_cond} | {steps} | {expected} | {priority} | {data} |"))
    tc_count += 1

# --- 1. FUNCTION (Happy & Unhappy) ---
add_tc("function", "High", "Khởi tạo Tenant (GARAGE) thành công với FULL dữ liệu (Required + Optional)", 
       "1. Mở màn hình Khởi tạo<br>2. Chọn Loại Tenant = GARAGE<br>3. Nhập đầy đủ toàn bộ các trường bắt buộc và tuỳ chọn<br>4. Bấm Lưu",
       "1. Hệ thống ghi nhận thao tác<br>2. Form nhận diện Loại GARAGE hiển thị đúng trường tuỳ biến<br>3. Hệ thống không báo lỗi validation<br>4. Lưu thành công, hiển thị thông báo và quay về trang Danh sách", "Critical",
       "Tên: A, Loại: GARAGE, Tên miền: a.abc.com, SĐT: 0987654321, Email: a@a.com, Gói: Free, Các dv: Gara App, Kế toán: C, Đối tác BH: BIC, Tỉnh: HN, MST: 0123...")

add_tc("function", "High", "Khởi tạo Tenant (VENDOR) thành công với FULL dữ liệu (Required + Optional)", 
       "1. Mở màn hình Khởi tạo<br>2. Chọn Loại Tenant = VENDOR<br>3. Nhập đầy đủ toàn bộ các trường bắt buộc và tuỳ chọn<br>4. Bấm Lưu",
       "1. Hệ thống ghi nhận thao tác<br>2. Form nhận diện Loại VENDOR hiển thị đúng trường tuỳ biến<br>3. Hệ thống không báo lỗi validation<br>4. Lưu thành công, hiển thị thông báo và quay về trang Danh sách", "Critical",
       "Tên: B, Loại: VENDOR, Tên miền: b.abc.com, SĐT: 0987654322, Email: b@a.com, Gói: Free, Các dv: VMS, Người đại diện: B, Kế toán: C, Tỉnh: HCM...")

add_tc("function", "High", "Khởi tạo Tenant (GARAGE) thành công CHỈ với các trường bắt buộc", 
       "1. Mở màn hình Khởi tạo<br>2. Chọn Loại Tenant = GARAGE<br>3. Nhập đúng các trường có dấu * (bao gồm các trường Invoice)<br>4. Bỏ trống các trường optional<br>5. Bấm Lưu",
       "1. Hệ thống ghi nhận thao tác<br>2. Form nhận diện Loại GARAGE<br>3. Hệ thống không báo lỗi validation<br>4. Các trường optional bỏ trống được xử lý thành null hợp lệ<br>5. Lưu thành công", "Critical", "GARAGE, chỉ nhập các trường bắt buộc")

add_tc("function", "High", "Khởi tạo Tenant (VENDOR) thành công CHỈ với các trường bắt buộc", 
       "1. Mở màn hình Khởi tạo<br>2. Chọn Loại Tenant = VENDOR<br>3. Nhập đúng các trường có dấu * (không bắt buộc nhập Invoice)<br>4. Bỏ trống các trường optional<br>5. Bấm Lưu",
       "1. Hệ thống ghi nhận thao tác<br>2. Form nhận diện Loại VENDOR<br>3. Hệ thống không báo lỗi validation<br>4. Các trường optional bỏ trống được xử lý thành null hợp lệ<br>5. Lưu thành công", "Critical", "VENDOR, chỉ nhập các trường bắt buộc")

add_tc("function", "High", "Khởi tạo Tenant thành công với các trường bắt buộc + Email", 
       "1. Nhập các trường có dấu *<br>2. Nhập thêm Email<br>3. Bấm Lưu", "1. Hệ thống ghi nhận Email<br>2. Pass qua validation Email<br>3. Lưu thành công", "High", "Thêm Email")

add_tc("function", "High", "Khởi tạo Tenant thành công với các trường bắt buộc + Đối tác bảo hiểm", 
       "1. Nhập các trường có dấu *<br>2. Chọn Đối tác bảo hiểm<br>3. Bấm Lưu", "1. Hệ thống ghi nhận các trường<br>2. Tag Đối tác bảo hiểm được lưu<br>3. Lưu thành công", "High", "Thêm Đối tác BH")

add_tc("function", "High", "Khởi tạo Tenant thành công với các trường bắt buộc + Ghi chú + Ảnh đại diện", 
       "1. Nhập các trường có dấu *<br>2. Thêm Ghi chú và Ảnh đại diện<br>3. Bấm Lưu", "1. Hệ thống nhận Ghi chú, Ảnh<br>2. Upload ảnh không gặp lỗi<br>3. Lưu thành công", "High", "Thêm Ghi chú, Ảnh")

add_tc("function", "High", "Khởi tạo Tenant thất bại khi thiếu thông tin bắt buộc", 
       "1. Bỏ trống 1 trường bắt buộc bất kỳ<br>2. Bấm Lưu", "1. Lỗi validation hiện lên tại vị trí field tương ứng<br>2. Nút Lưu không thực thi gọi API tạo mới", "High")

# Function - Exceptions
add_tc("function", "High", "Ngoại lệ - Tạo Tenant khi mất kết nối Internet", "1. Ngắt kết nối mạng<br>2. Nhập form hợp lệ<br>3. Bấm Lưu", "1. Báo lỗi Mất kết nối Internet<br>2. Không lưu vào DB", "High")
add_tc("function", "High", "Ngoại lệ - Tạo Tenant khi mất kết nối API/DB", "1. Gây lỗi API (500) hoặc DB down<br>2. Nhập form hợp lệ<br>3. Bấm Lưu", "1. Báo lỗi 500<br>2. Dữ liệu không lưu vào DB", "High")
add_tc("function", "High", "Ngoại lệ - Hủy bỏ thao tác bằng Nút Hủy", "1. Nhập thông tin form<br>2. Bấm nút Hủy bỏ", "1. Tắt màn hình Tạo mới, về màn Danh sách<br>2. Dữ liệu không được lưu", "High")
add_tc("function", "High", "Ngoại lệ - Hủy bỏ thao tác bằng Back browser / Breadcrumb", "1. Nhập thông tin form<br>2. Bấm Breadcrumb về danh sách hoặc nút Back browser", "1. Về trang danh sách<br>2. Dữ liệu không lưu", "High")

# Function - Quản lý (FEAT-TEN-002)
add_tc("function", "High", "Quản lý Hồ sơ năng lực - Cập nhật thành công", "1. Mở chi tiết Tenant<br>2. Vào tab Hồ sơ năng lực<br>3. Chỉnh sửa thông tin năng lực (số lượng nhân viên, dịch vụ hỗ trợ, diện tích...)<br>4. Bấm Lưu", "1. Lưu thông tin thành công<br>2. Dữ liệu hiển thị đúng trên màn hình chi tiết", "High")
add_tc("function", "High", "Quản lý Tài khoản Tenant - Thêm mới tài khoản thành công", "1. Mở chi tiết Tenant<br>2. Vào tab Tài khoản<br>3. Bấm Thêm mới<br>4. Nhập đủ thông tin (Tên, Email, SĐT, Vai trò)<br>5. Bấm Lưu", "1. Tài khoản được tạo mới thành công<br>2. Trạng thái tài khoản là Kích hoạt<br>3. Hiển thị trên danh sách tài khoản Tenant", "Critical", "Tên, Email, Vai trò Admin/User")
add_tc("function", "High", "Quản lý Tài khoản Tenant - Cập nhật trạng thái tài khoản (Khoá/Mở khoá)", "1. Tại tab Tài khoản của Tenant<br>2. Chọn một tài khoản đang Hoạt động<br>3. Chọn Khoá", "1. Trạng thái tài khoản chuyển sang Khoá<br>2. Người dùng bị khoá không thể login", "High")
add_tc("function", "High", "Quản lý Liên kết nhà xe - Thêm liên kết thành công", "1. Vào tab Liên kết nhà xe<br>2. Bấm Thêm liên kết<br>3. Chọn Nhà xe từ danh sách<br>4. Bấm Lưu", "1. Thêm liên kết thành công<br>2. Nhà xe hiển thị trong danh sách liên kết", "High", "Chọn nhà xe")
add_tc("function", "High", "Quản lý Liên kết nhà xe - Hủy liên kết", "1. Vào tab Liên kết nhà xe<br>2. Chọn một liên kết đang có<br>3. Bấm Hủy liên kết<br>4. Xác nhận", "1. Liên kết bị xóa khỏi danh sách<br>2. Dữ liệu mapping trong DB được cập nhật", "High")
add_tc("function", "High", "Khoá/Mở khoá Tenant - Khoá Tenant thành công", "1. Tại danh sách Tenant hoặc Chi tiết<br>2. Bấm nút Khoá cho Tenant đang Active<br>3. Điền lý do khoá<br>4. Xác nhận", "1. Trạng thái Tenant chuyển sang Locked<br>2. Tất cả tài khoản thuộc Tenant bị từ chối đăng nhập<br>3. Hệ thống ghi Audit log", "Critical")
add_tc("function", "High", "Khoá/Mở khoá Tenant - Mở khoá Tenant thành công", "1. Bấm nút Mở khoá cho Tenant đang Locked<br>2. Xác nhận", "1. Trạng thái Tenant chuyển sang Active<br>2. Các tài khoản có thể đăng nhập lại bình thường<br>3. Hệ thống ghi Audit log", "Critical")
add_tc("function", "High", "Khởi tạo Tenant với Operation Area Codes (Mảng khu vực)", "1. Chọn nhiều khu vực hoạt động (Operation Areas)<br>2. Bấm Lưu", "1. Dữ liệu mảng các khu vực hoạt động được lưu thành công vào Backend", "High", "Chọn 2-3 khu vực")
add_tc("function", "High", "Khởi tạo Tenant với Ops Note và Ops1-Ops5", "1. Nhập thông tin vào các trường mở rộng Ops Note, Ops 1 đến Ops 5<br>2. Bấm Lưu", "1. Các trường dữ liệu mở rộng được lưu thành công", "High", "Nhập text vào các trường ops")

# --- 2. VALIDATE ---
fields_text = ["Tên Tenant", "Tên miền con", "Người đại diện", "Địa chỉ chi tiết", "Tên công ty", "Địa chỉ công ty", "Kế toán trưởng"]
for field in fields_text:
    add_tc("validate", "Medium", f"Validate {field} - Không nhập (Required)", f"1. Để trống trường {field}<br>2. Bấm Lưu", f"1. Báo lỗi yêu cầu nhập cho trường {field}<br>2. Quá trình tạo mới bị chặn", "Medium")
    add_tc("validate", "Medium", f"Validate {field} - Nhập toàn khoảng trắng", f"1. Nhập toàn khoảng trắng (space) vào {field}<br>2. Bấm Lưu", f"1. Tự động clear space<br>2. Báo lỗi yêu cầu nhập cho trường {field}", "Medium")
    add_tc("validate", "Medium", f"Validate {field} - Max length", f"1. Nhập chuỗi 256 ký tự vào {field}<br>2. Bấm Lưu", f"1. Form chặn không cho nhập tiếp ký tự thứ 256 HOẶC báo lỗi vượt độ dài tối đa<br>2. Quá trình tạo mới bị chặn", "Medium", "Chuỗi 256 ký tự 'a'")
    add_tc("validate", "Medium", f"Validate {field} - Chứa ký tự đặc biệt", f"1. Nhập ký tự đặc biệt !@#$%^&* vào {field}<br>2. Bấm Lưu", f"1. Field chấp nhận input<br>2. Lưu thành công (nếu không có rule cấm)", "Medium", "!@#$%^&*")
    add_tc("validate", "Medium", f"Validate {field} - Chữ và số kết hợp", f"1. Nhập chữ và số (ví dụ: Text123) vào {field}<br>2. Bấm Lưu", f"1. Dữ liệu được ghi nhận hợp lệ<br>2. Lưu thành công", "Medium", "Text123")
    add_tc("validate", "Medium", f"Validate {field} - Ký tự script (XSS)", f"1. Nhập chuỗi script `<script>alert(1)</script>` vào {field}<br>2. Bấm Lưu", f"1. Input được xử lý an toàn (encode html)<br>2. Lưu thành công dạng plain text, không pop-up alert", "Medium", "`<script>alert(1)</script>`")
    add_tc("validate", "Medium", f"Validate {field} - Trim space đầu cuối", f"1. Nhập dữ liệu kèm khoảng trắng ở đầu và cuối (vd: '  Text  ') vào {field}<br>2. Bấm Lưu", f"1. Form tự động Trim space đầu và cuối của dữ liệu trước khi lưu", "Medium", "'  Text  '")

# Specific Subdomain
add_tc("validate", "Medium", "Validate Tên miền con - Nhập đúng định dạng", "1. Nhập tên miền gồm chữ, số, dấu - (VD: test-tenant-123)<br>2. Bấm Lưu", "1. Chấp nhận hợp lệ<br>2. Lưu thành công", "Medium", "test-tenant-123")
add_tc("validate", "Medium", "Validate Tên miền con - Bắt đầu hoặc kết thúc bằng gạch ngang", "1. Nhập '-testtenant' hoặc 'testtenant-'<br>2. Bấm Lưu", "1. Báo lỗi tên miền không đúng định dạng", "Medium", "-testtenant")
add_tc("validate", "Medium", "Validate Tên miền con - Chứa ký tự đặc biệt khác gạch ngang", "1. Nhập 'test@tenant'<br>2. Bấm Lưu", "1. Báo lỗi tên miền không đúng định dạng", "Medium", "test@tenant")
add_tc("validate", "Medium", "Validate Tên miền con - Max 20 ký tự (Backend rule)", "1. Nhập tên miền con dài 21 ký tự<br>2. Bấm Lưu", "1. Validation tên miền hoạt động<br>2. Báo lỗi độ dài vượt quá 20 ký tự", "Medium", "abcdefghijklmnopqrstu")
add_tc("validate", "Medium", "Validate Tên miền con - Bị trùng lặp (Unique rule)", "1. Nhập tên miền con đã tồn tại trên DB<br>2. Bấm Lưu", "1. Gửi request check duplicate<br>2. Báo lỗi tên miền con đã được đăng ký", "Medium", "tenant-test-01")

# Number fields (SĐT, MST)
add_tc("validate", "Medium", "Validate Số điện thoại - Không đủ 10 ký tự", "1. Nhập 9 số (vd: 098765432)<br>2. Bấm Lưu", "1. Báo lỗi không đúng định dạng SĐT (phải đủ 10 số)", "Medium", "098765432")
add_tc("validate", "Medium", "Validate Số điện thoại - Không bắt đầu bằng số 0", "1. Nhập SĐT bắt đầu bằng số 1 (vd: 1987654321)<br>2. Bấm Lưu", "1. Báo lỗi không đúng định dạng SĐT", "Medium", "1987654321")
add_tc("validate", "Medium", "Validate Số điện thoại - Chứa chữ cái", "1. Nhập ký tự chữ '098abc1234' vào SĐT<br>2. Bấm Lưu", "1. Form chặn nhập chữ cái hoặc báo lỗi ngay khi nhập<br>2. Không cho phép lưu", "Medium", "098abc1234")
add_tc("validate", "Medium", "Validate Số điện thoại - Bị trùng lặp (Unique rule)", "1. Nhập SĐT đã có trong DB của Tenant khác<br>2. Bấm Lưu", "1. Check duplicate backend<br>2. Hiển thị thông báo lỗi số điện thoại đã tồn tại", "Medium")

add_tc("validate", "Medium", "Validate Mã số thuế - Chứa chữ cái", "1. Nhập MST có chữ '0123A56789'<br>2. Bấm Lưu", "1. Form báo lỗi MST chỉ chấp nhận định dạng số<br>2. Ngăn lưu dữ liệu", "Medium", "0123A56789")
add_tc("validate", "Medium", "Validate Mã số thuế - Min/Max length", "1. Nhập MST có 9 số (hoặc 14 số)<br>2. Bấm Lưu", "1. Rule length kích hoạt<br>2. Báo lỗi độ dài MST (chỉ nhận 10 hoặc 13 chữ số)", "Medium")

# Email fields
add_tc("validate", "Medium", "Validate Email - Sai định dạng", "1. Nhập Email sai format 'testgmail.com'<br>2. Bấm Lưu", "1. Regex Email hoạt động<br>2. Báo lỗi định dạng Email chưa đúng", "Medium")

# Dropdown / Dependency Logic
add_tc("validate", "Medium", "Validate Loại mô hình / Dịch vụ - Khi chọn GARAGE", "1. Chọn Loại Tenant là GARAGE<br>2. Bấm mở dropdown Loại Mô hình<br>3. Bấm mở dropdown Dịch vụ", "1. Loại mô hình hiển thị 4 option: Sửa chữa, Chăm sóc, Tổng hợp, Mua bán PT<br>2. Dịch vụ hiển thị option: GMS", "Medium")
add_tc("validate", "Medium", "Validate Loại mô hình / Dịch vụ - Khi chọn VENDOR", "1. Chọn Loại Tenant là VENDOR<br>2. Bấm mở dropdown Loại Mô hình<br>3. Bấm mở dropdown Dịch vụ", "1. Loại mô hình hiển thị 1 option: Mua bán phụ tùng<br>2. Dịch vụ hiển thị option: VMS", "Medium")
add_tc("validate", "Medium", "Validate Vùng - Khi FF InventoryStockV01 = ON", "1. Thiết lập FF InventoryStockV01 = ON<br>2. Mở form Khởi tạo Tenant", "1. Trường Vùng bị Ẩn đi", "Medium", "Cấu hình InventoryStockV01=ON")
add_tc("validate", "Medium", "Validate Vùng - Khi FF InventoryStockV01 = OFF", "1. Thiết lập FF InventoryStockV01 = OFF<br>2. Mở form Khởi tạo Tenant<br>3. Chọn Vùng", "1. Trường Vùng hiển thị<br>2. Dropdown hiển thị đủ các option Vùng", "Medium", "Cấu hình InventoryStockV01=OFF")
add_tc("validate", "Medium", "Validate Dropdown Phụ thuộc - Tỉnh/Thành & Xã/Phường", "1. Chọn Tỉnh/Thành phố là Hà Nội<br>2. Mở dropdown Xã/Phường", "1. Dropdown Xã/Phường chỉ hiển thị các xã/phường thuộc Hà Nội", "Medium")

dropdowns = ["Loại Tenant", "Loại mô hình", "Gói dịch vụ", "Tỉnh / Thành phố", "Xã / Phường"]
for dd in dropdowns:
    add_tc("validate", "Medium", f"Validate {dd} - Bỏ trống (Không chọn)", f"1. Bỏ qua dropdown {dd}<br>2. Bấm Lưu", f"1. Validation dropdown báo lỗi tại vị trí {dd}<br>2. Không thể lưu", "Medium")
add_tc("validate", "Medium", "Validate Các dịch vụ (Multi-select) - Không chọn", "1. Để trống không chọn Option nào trong 'Các dịch vụ'<br>2. Bấm Lưu", "1. Validation multi-select báo lỗi<br>2. Yêu cầu chọn ít nhất 1 dịch vụ", "Medium")
add_tc("validate", "Medium", "Validate Combobox Single-select", "1. Mở dropdown Loại Tenant hoặc Gói dịch vụ<br>2. Cố gắng chọn nhiều option", "1. Chỉ cho phép chọn 1 option duy nhất, option chọn sau sẽ thay thế option trước", "Medium")

# Ảnh đại diện
add_tc("validate", "Medium", "Validate Ảnh đại diện - Không upload ảnh", "1. Bỏ qua không chọn ảnh đại diện<br>2. Bấm Lưu", "1. Hệ thống cho phép lưu (Ảnh không phải trường bắt buộc)", "Medium")
add_tc("validate", "Medium", "Validate Ảnh đại diện - Upload đúng định dạng/size", "1. Bấm Nhấn để chọn tệp<br>2. Chọn ảnh <30MB, định dạng JPG/PNG", "1. Upload thành công<br>2. Hiển thị preview ảnh đại diện", "Medium")
add_tc("validate", "Medium", "Validate Ảnh đại diện - Upload quá 30MB", "1. Chọn ảnh vượt quá 30MB", "1. Báo lỗi Ảnh không được vượt quá 30MB<br>2. Không cho phép upload", "Medium")
add_tc("validate", "Medium", "Validate Ảnh đại diện - Chọn nhiều ảnh", "1. Bấm Nhấn để chọn tệp<br>2. Chọn nhiều ảnh cùng lúc", "1. Form File Picker OS chỉ cho phép chọn 1 file duy nhất", "Medium")

add_tc("validate", "Medium", "Validate Quản lý Tài khoản - Trùng Email", "1. Thêm mới tài khoản<br>2. Nhập Email đã tồn tại trong hệ thống<br>3. Bấm Lưu", "1. Báo lỗi Email đã tồn tại<br>2. Không cho phép tạo", "Medium", "Email trùng")
add_tc("validate", "Medium", "Validate Quản lý Tài khoản - Trùng SĐT", "1. Thêm mới tài khoản<br>2. Nhập SĐT đã tồn tại<br>3. Bấm Lưu", "1. Báo lỗi SĐT đã tồn tại<br>2. Không cho phép tạo", "Medium", "SĐT trùng")
add_tc("validate", "Medium", "Validate Liên kết nhà xe - Liên kết trùng lặp", "1. Thêm liên kết nhà xe<br>2. Chọn nhà xe đã liên kết trước đó<br>3. Bấm Lưu", "1. Form báo lỗi Nhà xe đã được liên kết<br>2. Không tạo dữ liệu trùng", "Medium")
add_tc("validate", "Medium", "Validate Invoice Info - Khi FF PurchaseV02 = ON và Type = GARAGE", "1. Cấu hình FF Purchase:PurchaseV02 = ON<br>2. Chọn Loại Tenant = GARAGE<br>3. Bỏ trống MST, Tên công ty, Địa chỉ công ty xuất hoá đơn<br>4. Bấm Lưu", "1. Báo lỗi bắt buộc nhập MST, Tên công ty, Địa chỉ công ty xuất hoá đơn", "Medium")
add_tc("validate", "Medium", "Validate Max Length Invoice Info", "1. Nhập MST > 50 ký tự<br>2. Nhập Tên công ty > 255 ký tự<br>3. Nhập Địa chỉ công ty > 255 ký tự<br>4. Bấm Lưu", "1. Báo lỗi vượt quá độ dài tối đa cho phép của Backend", "Medium", "MST 51 char, Tên/Địa chỉ 256 char")
add_tc("validate", "Medium", "Validate Consultant - Khi FF QuotationConsultant = ON và Type = GARAGE", "1. Cấu hình FF Marketplace:QuotationConsultant = ON<br>2. Chọn Loại Tenant = GARAGE<br>3. Không gán Consultant<br>4. Bấm Lưu", "1. Báo lỗi bắt buộc phải gán Consultant cho Tenant", "Medium")

# --- 3. PHÂN QUYỀN ---
add_tc("phân quyền", "High", "Kiểm tra truy cập khi user là System_Admin", "1. Đăng nhập với tài khoản System_Admin<br>2. Truy cập màn hình Tenant Management", "1. Hệ thống ghi nhận thao tác<br>2. Truy cập thành công, hiển thị đầy đủ danh sách và nút Khởi tạo", "Critical", "sysadmin@cardoctor.vn")
add_tc("phân quyền", "High", "Kiểm tra truy cập khi user thuộc phòng ban BD (VD: CD_BD_HEAD, CD_BD)", "1. Đăng nhập với tài khoản thuộc nhóm BD (CD_BD_HEAD, CD_BD_LEAD, CD_BD_MANAGER, CD_BD)<br>2. Truy cập màn hình Khởi tạo Tenant", "1. Hệ thống ghi nhận thao tác<br>2. Truy cập thành công, form Khởi tạo hiển thị đầy đủ", "Critical", "bd_user@cardoctor.vn")
add_tc("phân quyền", "High", "Kiểm tra truy cập khi user KHÔNG thuộc nhóm BD và không phải System_Admin", "1. Đăng nhập với tài khoản phòng ban khác (Kế toán, Marketing...)<br>2. Cố gắng truy cập màn hình Khởi tạo Tenant", "1. Hệ thống chặn truy cập<br>2. Trình duyệt hiển thị trang Không có quyền truy cập (403 Forbidden)", "Critical", "ketoan@cardoctor.vn")
add_tc("phân quyền", "High", "Kiểm tra API tạo mới khi user bị thu hồi quyền BD", "1. Gửi API request POST /api/v1/saas-tenant bằng token của user đã bị thu hồi role BD", "1. Backend từ chối request<br>2. Trả về lỗi 403 Forbidden, dữ liệu không được lưu", "Critical")

# --- 4. UI ---
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
    add_tc("UI", "Medium", f"Kiểm tra hiển thị giao diện - {el}", f"1. Mở màn hình Khởi tạo<br>2. Quan sát Element '{el}'", f"1. Element tồn tại đúng vị trí<br>2. Font chữ, màu sắc, khoảng cách theo đúng chuẩn UI/UX design", "Low")

add_tc("UI", "Medium", "Kiểm tra Behavior - Focus vào Input field", "1. Click chuột vào trường Tên Tenant", "1. Field đổi màu viền (border active state)<br>2. Con trỏ chuột nhấp nháy", "Low")
add_tc("UI", "Medium", "Kiểm tra giao diện rẽ nhánh - Khi Loại Tenant là GARAGE (Các trường Invoice Required)", "1. Chọn Loại Tenant = GARAGE<br>2. Quan sát các trường MST, Tên công ty xuất hóa đơn, Địa chỉ công ty xuất hóa đơn, Consultant", "1. Hệ thống ghi nhận thao tác<br>2. Hiển thị dấu * (bắt buộc) bên cạnh label của các trường Invoice Info (nếu cờ bật)", "Medium")
add_tc("UI", "Medium", "Kiểm tra giao diện rẽ nhánh - Khi Loại Tenant là VENDOR (Các trường Invoice Optional)", "1. Chọn Loại Tenant = VENDOR<br>2. Quan sát các trường MST, Tên công ty xuất hóa đơn, Địa chỉ công ty xuất hóa đơn, Consultant", "1. Hệ thống ghi nhận thao tác<br>2. KHÔNG hiển thị dấu * bên cạnh label của các trường này (chỉ là optional)", "Medium")
add_tc("UI", "Medium", "Kiểm tra trạng thái mặc định của Nút Lưu", "1. Mở màn hình Khởi tạo Tenant", "1. Nút Lưu hiển thị disable mặc định khi chưa điền đủ trường bắt buộc", "Low")
add_tc("UI", "Medium", "Kiểm tra Breadcrumb", "1. Hover chuột vào breadcrumb<br>2. Click vào breadcrumb", "1. Hiển thị con trỏ pointer khi hover<br>2. Điều hướng thành công về danh sách Tenant", "Low")
add_tc("UI", "Medium", "Kiểm tra Behavior - Tab từ trên xuống dưới", "1. Click vào trường Tên Tenant<br>2. Nhấn phím Tab tuần tự<br>3. Theo dõi Element đang được active", "1. Focus con trỏ chuột nhảy đúng thứ tự từ trên xuống dưới<br>2. Không bỏ sót Element input nào", "Medium")
add_tc("UI", "Medium", "Kiểm tra Behavior - Shift+Tab từ dưới lên trên", "1. Focus vào nút Lưu<br>2. Nhấn tổ hợp phím Shift+Tab nhiều lần<br>3. Theo dõi Element active", "1. Focus nhảy ngược lại lên các trường phía trên<br>2. Đúng trình tự ngược", "Medium")
add_tc("UI", "Medium", "Kiểm tra Behavior - Hover qua nút Lưu/Hủy bỏ", "1. Di chuyển trỏ chuột (Hover) qua nút Hủy bỏ<br>2. Di chuyển Hover qua nút Lưu", "1. Nút Hủy bỏ đổi màu nền (hover state)<br>2. Nút Lưu đổi màu nền hoặc bóng đổ (hover state)", "Low")
add_tc("UI", "Medium", "Kiểm tra Behavior - Resize cửa sổ trình duyệt", "1. Mở màn hình<br>2. Thu nhỏ cửa sổ trình duyệt (simulate tablet/mobile)", "1. Giao diện có tính Responsive<br>2. Không bị vỡ layout, các cột tự rớt xuống", "Medium")
add_tc("UI", "Medium", "Kiểm tra Zoom In / Zoom Out (Ctrl+ / Ctrl-)", "1. Nhấn phím Ctrl + và Ctrl - trên trình duyệt", "1. Màn hình thu nhỏ, phóng to tương ứng<br>2. Không bị vỡ giao diện layout", "Low")

# --- 5. CÁC PHẦN ẢNH HƯỞNG CHỨC NĂNG LIÊN QUAN ---
add_tc("các phần ảnh hưởng chức năng liên quan", "High", "Kiểm tra dữ liệu trên List sau khi Tạo mới", "1. Hoàn tất tạo 1 Tenant A<br>2. Điều hướng ra màn hình Danh sách<br>3. Quan sát thông tin Tenant A", "1. Tenant A được tạo thành công<br>2. Bản ghi A nằm ở đầu danh sách (sort)<br>3. Các cột dữ liệu (Tên, SĐT, Loại) khớp với lúc nhập", "High")
add_tc("các phần ảnh hưởng chức năng liên quan", "High", "Kiểm tra dữ liệu trên Detail sau khi Tạo mới", "1. Hoàn tất tạo 1 Tenant A<br>2. Click vào tên Tenant A để xem Chi tiết<br>3. Đối chiếu toàn bộ trường thông tin", "1. Tạo thành công<br>2. Mở được màn hình Detail<br>3. Các trường từ form Create sang Detail bảo toàn không bị null hay sai format", "High")
add_tc("các phần ảnh hưởng chức năng liên quan", "High", "Kiểm tra Database record sau khi tạo mới thành công", "1. Tạo Tenant mới thành công<br>2. Kiểm tra DB", "1. Tạo thành công<br>2. DB insert bản ghi vào đủ các bảng liên kết nghiệp vụ", "Critical")
add_tc("các phần ảnh hưởng chức năng liên quan", "High", "Kiểm tra logic Kế thừa Branch/Warehouse (Backend BR)", "1. Tạo Tenant mới<br>2. Truy vấn DB xem có bản ghi rác của Branch/Warehouse không", "1. Tenant tạo thành công<br>2. Khẳng định không có Branch/Warehouse mới tự sinh ra (theo Legacy logic)", "High")
add_tc("các phần ảnh hưởng chức năng liên quan", "High", "Kiểm tra Ghi log Audit khi Kích hoạt/Khóa", "1. Chọn Tenant<br>2. Thực hiện thao tác Kích hoạt (hoặc Khóa)<br>3. Check Audit log", "1. Hành động thành công trên UI<br>2. Trigger Audit log<br>3. Log có đủ thông tin Actor (userId), Action name, Timestamp", "Critical")
add_tc("các phần ảnh hưởng chức năng liên quan", "High", "Kiểm tra trigger Jenkins (Backend BR)", "1. Kích hoạt Tenant từ UI<br>2. Kiểm tra Backend status và quá trình gọi Jenkins", "1. Kích hoạt trigger UI<br>2. Hệ thống chuyển status thành ACTIVATING và gọi Jenkins tạo subdomain<br>3. Khi hoàn tất, quay về ACTIVE", "Critical")


with open(md_path, "w", encoding="utf-8") as f:
    f.write(headers.format(total_tc=len(tcs)))
    current_group = ""
    for group, tc in tcs:
        if group != current_group:
            if current_group != "":
                f.write("| | | | | | | | | |\n")
            f.write(f"| **NHÓM {group.upper()}** | | | | | | | | |\n")
            current_group = group
        f.write(tc + "\n")

print(f"Generated {len(tcs)} test cases successfully!")
