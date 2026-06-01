# MANUAL TEST CASES — MODULE LOGIN
## Hệ thống: Perfex CRM — Anh Tester Demo
## URL: https://crm.anhtester.com/admin/authentication
## Ngày sinh: 2026-04-09 | Phương pháp: AI-RBT (Risk-Based Testing)

---

## Thông tin chung

| Mục | Chi tiết |
|-----|----------|
| Dự án | Perfex CRM — Anh Tester Demo |
| Module | Login (Authentication) |
| Tổng số TC | 27 |
| Phương pháp | AI-RBT 6 bước (FULL RBT Mode) |
| Kỹ thuật áp dụng | EP, BVA, Decision Table, State Transition |

### Tài khoản Test

| Loại | Email | Password |
|------|-------|----------|
| Valid Admin | `admin@example.com` | `123456` |
| Non-existent | `nonexistent_user_9999@fake.com` | N/A |
| Wrong credentials | `hacker@gmail.com` | `WrongPass@999` |

### Assumptions đã xác nhận

| # | Nội dung |
|---|----------|
| Q1 | Lockout sau **5 lần** đăng nhập sai liên tiếp |
| Q3 | Remember me duy trì session trong **1 giờ** |
| Q2 | Không có giới hạn ký tự UI (test với >500 ký tự) |
| Q4 | Link reset password có expiry — cần xác nhận thêm với PO |
| Q5 | Email thiếu domain sau @ → HTML5 tooltip |
| Q6 | Đã login → vào lại trang login → redirect Dashboard |
| Q7 | Forgot Password với email không tồn tại → thông báo chung |
| Q8 | Không hỗ trợ Social Login / SSO |

---

## Bảng Test Cases

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|
| TC_LOGIN_001 | MOD-01 · Login Form UI | 🔴 High | Verify trang Login hiển thị đầy đủ các phần tử giao diện | User chưa đăng nhập | 1. Mở trình duyệt, truy cập `https://crm.anhtester.com/admin/authentication`<br>2. Quan sát toàn bộ giao diện trang Login | 1. Trang load thành công, không lỗi<br>2. Hiển thị đủ: Logo, tiêu đề "Login", field "Email Address", field "Password", checkbox "Remember me" (mặc định unchecked), nút "Login", link "Forgot Password?"<br>3. Background xám nhạt (#eef0f8), card trắng, nút Login xanh full-width | High | N/A |
| TC_LOGIN_002 | MOD-01-B · Email Field | 🔴 High | Verify HTML5 validation khi email không có ký tự @ | User ở trang Login | 1. Nhập Email: `invalidemail`<br>2. Nhập Password: `123456`<br>3. Click nút "Login" | 1. Form KHÔNG submit lên server<br>2. HTML5 tooltip: *"Please include an '@' in the email address."*<br>3. Không có thông báo đỏ server-side<br>4. Trang không redirect | High | Email: `invalidemail`<br>Password: `123456` |
| TC_LOGIN_003 | MOD-01-B · Email Field | 🟡 Medium | Verify HTML5 validation khi email có @ nhưng thiếu domain | User ở trang Login | 1. Nhập Email: `test@`<br>2. Nhập Password: `123456`<br>3. Click nút "Login" | 1. Form KHÔNG submit lên server<br>2. HTML5 tooltip: *"Please include a '.' in the email address."* hoặc tương tự<br>3. Không có thông báo server-side | Medium | Email: `test@`<br>Password: `123456` |
| TC_LOGIN_004 | MOD-01-C · Password Field | 🔴 High | Verify ký tự nhập vào Password field hiển thị dạng masked | User ở trang Login | 1. Click vào field Password<br>2. Nhập: `MySecretPass123`<br>3. Quan sát hiển thị trên màn hình<br>4. Kiểm tra HTML attribute của field | 1. Ký tự hiển thị dạng masked (●●●), không hiện plaintext<br>2. HTML attribute: `type="password"`<br>3. Không có cơ chế tự động reveal mật khẩu | High | Password: `MySecretPass123` |
| TC_LOGIN_005 | MOD-01-E · Remember Me | 🟡 Medium | Verify checkbox "Remember me" mặc định ở trạng thái unchecked | User truy cập trang Login lần đầu hoặc sau khi logout | 1. Truy cập `https://crm.anhtester.com/admin/authentication`<br>2. Quan sát trạng thái checkbox "Remember me" | 1. Checkbox "Remember me" ở trạng thái **unchecked**<br>2. User phải chủ động tick trước khi đăng nhập | Medium | N/A |
| TC_LOGIN_006 | MOD-01-E · Remember Me | 🔴 High | Verify session duy trì trong vòng 1 giờ khi tick Remember me | User chưa đăng nhập | 1. Nhập Email: `admin@example.com`, Password: `123456`<br>2. Tick checkbox "Remember me"<br>3. Click "Login" → xác nhận vào Dashboard<br>4. Đóng toàn bộ cửa sổ trình duyệt<br>5. Mở lại trình duyệt trong vòng dưới 1 giờ<br>6. Truy cập `https://crm.anhtester.com/admin/` | 1. Bước 3: Redirect Dashboard thành công<br>2. Bước 6: Tự động vào Dashboard, không cần đăng nhập lại<br>3. Cookie session còn hiệu lực | High | Email: `admin@example.com`<br>Password: `123456`<br>Thời gian test: <60 phút sau login |
| TC_LOGIN_007 | MOD-01-E · Remember Me | 🔴 High | Verify session hết hạn sau 1 giờ và yêu cầu đăng nhập lại | Đã đăng nhập có tick Remember me | 1. Đăng nhập với Remember me (như TC_LOGIN_006)<br>2. Đóng trình duyệt<br>3. Chờ hơn 1 giờ (hoặc modify cookie expiry)<br>4. Mở lại trình duyệt, truy cập `https://crm.anhtester.com/admin/` | 1. Hệ thống redirect về trang Login<br>2. Không tự vào Dashboard<br>3. Cookie session đã hết hạn | High | Email: `admin@example.com`<br>Password: `123456`<br>Thời gian chờ: >60 phút |
| TC_LOGIN_008 | MOD-01-E · Remember Me | 🔴 High | Verify session KHÔNG duy trì khi không tick Remember me | User chưa đăng nhập | 1. Đăng nhập: Email `admin@example.com`, Password `123456`, KHÔNG tick Remember me<br>2. Click "Login" → vào Dashboard<br>3. Đóng toàn bộ cửa sổ trình duyệt<br>4. Mở lại trình duyệt, truy cập `https://crm.anhtester.com/admin/` | 1. Hệ thống redirect về trang Login<br>2. Phải đăng nhập lại từ đầu<br>3. Session không được lưu | High | Email: `admin@example.com`<br>Password: `123456` |
| TC_LOGIN_009 | MOD-02-A · Happy Path | 🔴 High | Verify đăng nhập thành công với Email và Password hợp lệ | Tài khoản `admin@example.com` tồn tại và active | 1. Truy cập `https://crm.anhtester.com/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `123456`<br>4. Click nút "Login" | 1. Xác thực thành công<br>2. Redirect đến `https://crm.anhtester.com/admin/`<br>3. Dashboard hiển thị tiêu đề "Dashboard"<br>4. Không có thông báo lỗi | Critical | Email: `admin@example.com`<br>Password: `123456` |
| TC_LOGIN_010 | MOD-02-C · Empty Fields | 🔴 High | Verify thông báo lỗi server-side khi để trống Email | User ở trang Login | 1. Để trống field Email<br>2. Nhập Password: `AnyPass@123`<br>3. Click nút "Login" | 1. Form submit lên server (không có `required` HTML)<br>2. Thông báo trong div alert-danger: **"The Email Address field is required."**<br>3. Chỉ hiển thị 1 thông báo<br>4. User vẫn ở trang Login | Critical | Email: *(để trống)*<br>Password: `AnyPass@123` |
| TC_LOGIN_011 | MOD-02-C · Empty Fields | 🔴 High | Verify thông báo lỗi server-side khi để trống Password | User ở trang Login | 1. Nhập Email: `admin@example.com`<br>2. Để trống field Password<br>3. Click nút "Login" | 1. Form submit lên server<br>2. Thông báo: **"The Password field is required."**<br>3. Chỉ hiển thị 1 thông báo<br>4. User vẫn ở trang Login | Critical | Email: `admin@example.com`<br>Password: *(để trống)* |
| TC_LOGIN_012 | MOD-02-C · Empty Fields | 🔴 High | Verify hiển thị đồng thời cả hai thông báo lỗi khi để trống cả Email và Password | User ở trang Login | 1. Để trống field Email<br>2. Để trống field Password<br>3. Click nút "Login" | 1. Form submit lên server<br>2. Hiển thị **đồng thời** 2 thông báo lỗi:<br>   - *"The Email Address field is required."*<br>   - *"The Password field is required."*<br>3. User vẫn ở trang Login | Critical | Email: *(trống)*<br>Password: *(trống)* |
| TC_LOGIN_013 | MOD-02-B · Invalid Credentials | 🔴 High | Verify thông báo "Invalid email or password" khi Email đúng nhưng Password sai | Tài khoản `admin@example.com` tồn tại | 1. Nhập Email: `admin@example.com`<br>2. Nhập Password: `WrongPass@999`<br>3. Click nút "Login" | 1. Xác thực thất bại<br>2. Thông báo: **"Invalid email or password"**<br>3. Không tiết lộ "password sai"<br>4. User vẫn ở trang Login | High | Email: `admin@example.com`<br>Password: `WrongPass@999` |
| TC_LOGIN_014 | MOD-02-B · Invalid Credentials | 🔴 High | Verify thông báo "Invalid email or password" khi Email sai nhưng Password đúng | Email `hacker@gmail.com` không tồn tại trong hệ thống | 1. Nhập Email: `hacker@gmail.com`<br>2. Nhập Password: `123456`<br>3. Click nút "Login" | 1. Xác thực thất bại<br>2. Thông báo: **"Invalid email or password"**<br>3. Không tiết lộ "email không tồn tại"<br>4. User vẫn ở trang Login | High | Email: `hacker@gmail.com`<br>Password: `123456` |
| TC_LOGIN_015 | MOD-02-B · Invalid Credentials | 🔴 High | Verify thông báo lỗi khi cả Email và Password đều sai | User ở trang Login | 1. Nhập Email: `notexist@fake.com`<br>2. Nhập Password: `FakePass@000`<br>3. Click nút "Login" | 1. Thông báo: **"Invalid email or password"**<br>2. Cùng nội dung với TC_LOGIN_013, TC_LOGIN_014 (thông báo chung)<br>3. User vẫn ở trang Login | High | Email: `notexist@fake.com`<br>Password: `FakePass@000` |
| TC_LOGIN_016 | MOD-02 · Boundary | 🟡 Medium | Verify hệ thống xử lý khi nhập Email có độ dài >500 ký tự | User ở trang Login | 1. Nhập Email: chuỗi 501 ký tự format hợp lệ (`aaa[x491]@domain.com`)<br>2. Nhập Password: `123456`<br>3. Click nút "Login" | 1. Hệ thống KHÔNG crash / lỗi 500<br>2. Trả về "Invalid email or password" hoặc HTML5 chặn<br>3. Không có unhandled exception | Medium | Email: `aaa...a@domain.com` (501 ký tự)<br>Password: `123456` |
| TC_LOGIN_017 | MOD-02-D · Account Lockout | 🔴 High | Verify hệ thống vẫn cho phép đăng nhập lại sau lần sai thứ 1 | Tài khoản `admin@example.com` chưa bị lockout | 1. Nhập Email: `admin@example.com`, Password: `WrongPass@001`<br>2. Click "Login"<br>3. Kiểm tra phản hồi | 1. Thông báo: "Invalid email or password"<br>2. Trang Login vẫn accessible<br>3. Không có thông báo cảnh báo đặc biệt | High | Email: `admin@example.com`<br>Password: `WrongPass@001`<br>Số lần sai: 1/5 |
| TC_LOGIN_018 | MOD-02-D · Account Lockout | 🔴 High | Verify hệ thống vẫn cho phép đăng nhập sau lần sai thứ 4 — boundary trước lockout | Đã đăng nhập sai 3 lần trước với `admin@example.com` | 1. Nhập Email: `admin@example.com`, Password: `WrongPass@004`<br>2. Click "Login" (lần thứ 4)<br>3. Kiểm tra phản hồi | 1. Vẫn hiển thị: "Invalid email or password"<br>2. Trang Login accessible, chưa bị lockout<br>3. Đây là lần cuối trước ngưỡng lockout | High | Email: `admin@example.com`<br>Password: `WrongPass@004`<br>Số lần sai: 4/5 |
| TC_LOGIN_019 | MOD-02-D · Account Lockout | 🔴 High | Verify hệ thống chặn đăng nhập sau lần sai thứ 5 liên tiếp | Đã đăng nhập sai 4 lần liên tiếp với `admin@example.com` | 1. Nhập Email: `admin@example.com`, Password: `WrongPass@005`<br>2. Click "Login" (lần thứ 5)<br>3. Kiểm tra thông báo<br>4. Thử đăng nhập lại với đúng Password: `123456` | 1. Bước 2: Hệ thống chặn — thông báo lockout<br>2. Bước 4: Dù đúng password, tài khoản vẫn bị chặn<br>3. Không thể bypass bằng credentials đúng | Critical | Email: `admin@example.com`<br>Wrong Pwd: `WrongPass@005`<br>Correct Pwd: `123456`<br>Số lần sai: 5/5 |
| TC_LOGIN_020 | MOD-02-E · Already Logged In | 🟡 Medium | Verify user đã đăng nhập mà truy cập lại trang Login sẽ redirect về Dashboard | User đã đăng nhập thành công, có session hợp lệ | 1. Đăng nhập thành công vào Dashboard<br>2. Mở tab mới, nhập URL: `https://crm.anhtester.com/admin/authentication`<br>3. Kiểm tra kết quả | 1. Hệ thống phát hiện session hợp lệ<br>2. Tự redirect về `https://crm.anhtester.com/admin/`<br>3. Không hiển thị lại form Login | Medium | Email: `admin@example.com`<br>Password: `123456` |
| TC_LOGIN_021 | MOD-03-A · Navigation | 🟡 Medium | Verify click "Forgot Password?" chuyển đến đúng trang | User ở trang Login | 1. Tại trang Login, click link "Forgot Password?" | 1. Redirect đến `https://crm.anhtester.com/admin/authentication/forgot_password`<br>2. Trang hiển thị: field Email Address và nút "Confirm" | High | N/A |
| TC_LOGIN_022 | MOD-03-B · Email Submission | 🟡 Medium | Verify hệ thống gửi email reset thành công khi nhập email đã đăng ký | User ở trang Forgot Password; `admin@example.com` tồn tại | 1. Nhập Email: `admin@example.com`<br>2. Click nút "Confirm"<br>3. Kiểm tra thông báo trên UI<br>4. Kiểm tra hộp thư `admin@example.com` | 1. Xử lý thành công<br>2. Thông báo thành công (vd: *"We have e-mailed your password reset link!"*)<br>3. Email khôi phục được gửi đến `admin@example.com` | High | Email: `admin@example.com` |
| TC_LOGIN_023 | MOD-03-C · Empty Email | 🟡 Medium | Verify HTML5 validation khi click Confirm mà không nhập email | User ở trang Forgot Password | 1. Để trống field Email Address<br>2. Click nút "Confirm" | 1. Form KHÔNG submit (field có `required` attribute)<br>2. HTML5 tooltip: *"Please fill in this field."*<br>3. Không có request lên server | High | Email: *(trống)* |
| TC_LOGIN_024 | MOD-03-D · Non-existent Email | 🟡 Medium | Verify hệ thống không tiết lộ thông tin khi Forgot Password với email không tồn tại | User ở trang Forgot Password; email không có trong DB | 1. Nhập Email: `nonexistent_user_9999@fake.com`<br>2. Click nút "Confirm"<br>3. Kiểm tra thông báo phản hồi | 1. Thông báo chung — không tiết lộ email tồn tại hay không<br>2. Thông báo tương tự TC_LOGIN_022 (bảo mật)<br>3. Không gửi email thực tế | High | Email: `nonexistent_user_9999@fake.com` |
| TC_LOGIN_025 | MOD-03 · Email Validation | 🟡 Medium | Verify HTML5 validation khi nhập email sai định dạng trên trang Forgot Password | User ở trang Forgot Password | 1. Nhập Email: `invalidemail`<br>2. Click nút "Confirm" | 1. Form KHÔNG submit<br>2. HTML5 tooltip: *"Please include an '@' in the email address."* | Medium | Email: `invalidemail` |
| TC_LOGIN_026 | MOD-04-A · Logout Flow | 🟡 Medium | Verify Logout redirect về trang Login và hủy session | User đã đăng nhập vào Dashboard | 1. Từ Dashboard, click avatar/profile dropdown góc trên phải<br>2. Click "Logout"<br>3. Kiểm tra trang sau khi logout | 1. Redirect về `https://crm.anhtester.com/admin/authentication`<br>2. Hiển thị form Login<br>3. Session bị hủy hoàn toàn | High | Email: `admin@example.com`<br>Password: `123456` |
| TC_LOGIN_027 | MOD-04-B · Session Termination | 🟡 Medium | Verify sau Logout, nhấn Back button trình duyệt không thể quay lại Dashboard | User vừa Logout thành công, đang ở trang Login | 1. Thực hiện Logout (TC_LOGIN_026)<br>2. Nhấn nút "Back" của trình duyệt<br>3. Kiểm tra trang hiển thị | 1. Trình duyệt **không** hiển thị lại Dashboard<br>2. Hệ thống redirect về trang Login<br>3. Session không thể bypass bằng browser history | High | N/A |

---

## Traceability Matrix — Requirements Coverage

| Req ID | Nội dung | TC Coverage |
|--------|----------|-------------|
| AC-01 | Đăng nhập đúng → redirect Dashboard | TC_LOGIN_009 |
| AC-02 | Trống Email → lỗi server-side | TC_LOGIN_010 |
| AC-03 | Trống Password → lỗi server-side | TC_LOGIN_011 |
| AC-04 | Trống cả hai → cả hai thông báo | TC_LOGIN_012 |
| AC-05 | Email sai định dạng → HTML5 tooltip | TC_LOGIN_002, TC_LOGIN_003 |
| AC-06 | Email/Password sai → "Invalid email or password" | TC_LOGIN_013, TC_LOGIN_014, TC_LOGIN_015 |
| AC-07 | Remember me + đăng nhập → session 1 giờ | TC_LOGIN_006, TC_LOGIN_007, TC_LOGIN_008 |
| AC-08 | Click Forgot Password → redirect đúng URL | TC_LOGIN_021 |
| AC-09 | Email hợp lệ + Confirm → gửi email | TC_LOGIN_022 |
| AC-10 | Trống email + Confirm → HTML5 validation | TC_LOGIN_023 |
| AC-11 | Logout → redirect trang Login | TC_LOGIN_026 |
| NFR-01 | CSRF token bảo vệ | TC_LOGIN_009 |
| NFR-02 | Password masked | TC_LOGIN_004 |
| NFR-03 | Thông báo chung không tiết lộ tài khoản | TC_LOGIN_013, TC_LOGIN_014, TC_LOGIN_024 |
| NFR-04 | HTML5 email input, đa trình duyệt | TC_LOGIN_002, TC_LOGIN_003 |
| NFR-05 | Responsive, Bootstrap UI | TC_LOGIN_001 |
| Q1-ANS | Lockout sau 5 lần sai | TC_LOGIN_017, TC_LOGIN_018, TC_LOGIN_019 |
| Q3-ANS | Remember me = 1 giờ | TC_LOGIN_006, TC_LOGIN_007 |
| Q6-ASM | Đã login → truy cập login → redirect Dashboard | TC_LOGIN_020 |
| Q7-ASM | Forgot Password email không tồn tại → thông báo chung | TC_LOGIN_024 |
| GAP-05 | Post-logout back button bảo mật | TC_LOGIN_027 |

---

## Summary

| Module | Risk | TC Count | Priority |
|--------|------|----------|----------|
| MOD-01 · Login Form + Remember Me | 🔴 High | 8 | TC_LOGIN_001–008 |
| MOD-02 · Authentication Logic | 🔴 High | 12 | TC_LOGIN_009–020 |
| MOD-03 · Forgot Password | 🟡 Medium | 5 | TC_LOGIN_021–025 |
| MOD-04 · Logout | 🟡 Medium | 2 | TC_LOGIN_026–027 |
| **TỔNG** | | **27** | **4 Critical · 18 High · 5 Medium** |
