# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (REQUIREMENTS SPECIFICATION) - TRANG WEB LANDING PAGE IFIRSTAID

## 1. Tổng quan
Tài liệu này mô tả chi tiết các yêu cầu chức năng, đặc tả trường dữ liệu và luồng xử lý nghiệp vụ cho trang Landing Page của ứng dụng iFirstAid (phiên bản thử nghiệm tại https://test.project-staging.com/#features). Trang web được thiết kế theo dạng Single-Page Application (SPA) nhằm giới thiệu các tính năng chính, cung cấp tài nguyên học tập sơ cấp cứu, liên kết tải ứng dụng và form liên hệ trực tiếp cho người dùng.
Tài liệu này đóng vai trò làm tài liệu tham khảo chuẩn cho lập trình viên phát triển sản phẩm và kiểm thử viên thiết kế kịch bản kiểm thử (test cases).

## 2. Yêu cầu chức năng

### 2.1. Chức năng thanh điều hướng và đầu trang (Header & Navigation)
- Logo iFirstAid: Nằm ở phía bên trái thanh điều hướng, chứa liên kết trỏ về trang chủ (index.html). Khi nhấp vào logo, trang web sẽ được tải lại về trạng thái trang chủ.
- Liên kết Features: Khi nhấp vào, trang web cuộn mượt mà đến phần giới thiệu tính năng (id là features).
- Liên kết First Look: Khi nhấp vào, trang web cuộn mượt mà đến phần hình ảnh xem trước ứng dụng (id là first-look).
- Liên kết Resources: Khi nhấp vào, trang web cuộn mượt mà đến phần tài nguyên tải về (id là resources).
- Liên kết Contact: Khi nhấp vào, trang web cuộn mượt mà đến phần liên hệ (id là contact).
- Nút tải ứng dụng (Download App): Hiển thị ở góc phải của thanh điều hướng.
  - Trên giao diện máy tính: Có 2 nút tải ứng dụng riêng biệt dành cho iOS (class là ios-link) và Android (class là android-link).
  - Cả hai nút hiện đang liên kết đến dấu thăng (#) dưới dạng liên kết chờ cấu hình.
- Menu thu gọn trên thiết bị di động:
  - Khi màn hình nhỏ dưới độ phân giải máy tính, menu điều hướng sẽ được thu gọn vào biểu tượng nút toggle (class là navbar-toggler).
  - Nhấp vào biểu tượng toggle sẽ hiển thị menu điều hướng đầy đủ dưới dạng trượt. Có nút đóng menu (class là navbar-close).

### 2.2. Chức năng phần giới thiệu (Hero & Statistics Sections)
- Phần đầu trang (Hero Section):
  - Hiển thị tiêu đề chính: Life saver in your pocket.
  - Cung cấp mã QR tải ứng dụng (class là download-qr) và các nút tải ứng dụng nhanh cho iOS (class là ios-link) và Android (class là android-link). Tất cả các liên kết này hiện trỏ đến dấu thăng (#).
  - Hiển thị hình ảnh minh họa chính (assets/images/web/hero.png).
- Phần số liệu thống kê (Statistics Section):
  - Hiển thị hai thông tin thống kê nổi bật:
    - 100+ First Aid Topics (Hơn 100 chủ đề sơ cấp cứu).
    - 10K+ App Downloads (Hơn 10.000 lượt tải ứng dụng).

### 2.3. Chức năng giới thiệu tính năng (Features Section)
- Hiển thị tiêu đề Features và khẩu hiệu: iFirstAid gives you peace of mind wherever you go.
- Giới thiệu 4 tính năng chính của ứng dụng dưới dạng các thẻ thông tin:
  - Tính năng 1: No internet? No problem (Hoạt động ngoại tuyến). Mô tả: When you’re offline, you still have access to First Aid help. We have your back.
  - Tính năng 2: Be best at First Aid (Bài học ngắn gọn). Mô tả: With short and compact lessons, you get to learn from the best to be the best First Aider.
  - Tính năng 3: First Aid at your fingertips (Tiếp cận nhanh). Mô tả: Get the First Aid you need to keep you and your loved ones safe with our App.
  - Tính năng 4: Stay Safe with iFirstAid (Bảo vệ người thân). Mô tả: Keep your family and friends safe with iFirstAid, when accidents happen.

### 2.4. Chức năng xem trước giao diện (First Look Section)
- Hiển thị tiêu đề: Take a closer look.
- Hiển thị một hình ảnh tĩnh xem trước giao diện ứng dụng thực tế (đường dẫn: assets/images/web/Image.jpg). Phần này không chứa các phần tử tương tác khác.

### 2.5. Chức năng tài nguyên học tập (Resources Section)
- Cung cấp các thẻ liên kết tải tài nguyên học tập và thiết bị sơ cấp cứu:
  - Thẻ 1: Digital Book - FREE First Aid eBook kèm liên kết Download Now (trỏ về #).
  - Thẻ 2: FREE App - FREE First Aid App kèm liên kết Download Now (trỏ về #).
  - Thẻ 3: Award-Winning - First Aid Emergency Handbook kèm liên kết Check it Now (trỏ về #).
  - Thẻ 4: Highest Quality - Best First Aid KITs kèm liên kết Buy Now (trỏ về #).

### 2.6. Chức năng liên hệ (Contact Section)
- Cung cấp các thông tin liên hệ trực tiếp:
  - Email: Contact@ifirstaid.com (sử dụng liên kết mailto).
  - Chat: Nhãn hiển thị là Chat Now, nhưng liên kết thực tế đang trỏ đến mailto:Contact@ifirstaid.com thay vì công cụ live chat.
  - Address: Terrigal, NSW, Australia.
- Form gửi tin nhắn liên hệ (Contact Form):
  - Cho phép người dùng nhập các thông tin: Full Name (Họ và tên), Phone (Số điện thoại), Your Email (Địa chỉ email) và Your Message (Nội dung tin nhắn).
  - Nhấp nút Send Now để gửi thông tin đi.

### 2.7. Chức năng chân trang và tiện ích nổi (Footer & Widgets)
- Phần chân trang (Footer Section):
  - Hiển thị thông tin bản quyền: Copyright © 2023 | SURVIVAL.
  - Hiển thị thông điệp: Stay Safe kèm biểu tượng hình trái tim.
- Tiện ích tải ứng dụng nổi (Floating Download Widget):
  - Luôn hiển thị ở phía cạnh phải màn hình khi người dùng cuộn trang.
  - Chứa biểu tượng mã QR (download-qr) và hai nút tải ứng dụng iOS (ios-link), Android (android-link). Tất cả đều liên kết đến dấu thăng (#).
- Nút cuộn lên đầu trang (goTop Button):
  - Biểu tượng mũi tên hướng lên, hiển thị ở góc dưới cùng bên phải màn hình khi người dùng cuộn trang xuống dưới.
  - Khi nhấp vào, trang web sẽ tự động cuộn nhanh lên đầu trang (vị trí hero section).

## 3. Đặc tả trường dữ liệu (Contact Form)
Dưới đây là bảng đặc tả thuộc tính DOM chi tiết của các trường nhập liệu trong form liên hệ tại phần Contact Us:

| Tên trường trên UI | Thẻ HTML | Thuộc tính Type | Thuộc tính Name | Thuộc tính Placeholder | Bắt buộc (Required) | Quy tắc kiểm tra dữ liệu (Validation Rules) |
| --- | --- | --- | --- | --- | --- | --- |
| Full Name | input | text | name | Enter Full Name | Không | Nhập văn bản tự do, không giới hạn độ dài ký tự tối đa trong HTML |
| Phone (optional) | input | text | tel | Enter Your phone number | Không | Nhập văn bản hoặc chữ số tự do, không giới hạn định dạng số điện thoại |
| Your Email | input | email | email | Enter Your Email | Không | Phải nhập đúng định dạng email (chứa ký tự @ và phần tên miền hợp lệ) |
| Your Message | textarea | không áp dụng | subject | Enter Message | Không | Nhập văn bản tự do nhiều dòng. Kích thước hiển thị mặc định là 6 dòng (rows=6) |

Lưu ý đặc biệt cho lập trình và kiểm thử:
- Trong mã nguồn HTML hiện tại của trang web, không có thuộc tính required (bắt buộc) nào được khai báo cho cả 4 trường dữ liệu trên. Người dùng có thể để trống hoàn toàn và vẫn gửi được form.
- Trường Your Email có thuộc tính type=email, vì vậy nếu người dùng nhập dữ liệu vào trường này, trình duyệt sẽ tự động kích hoạt tính năng kiểm tra định dạng email chuẩn và hiển thị thông báo lỗi mặc định của HTML5 nếu định dạng không hợp lệ.

## 4. Luồng xử lý và Quy tắc nghiệp vụ

### 4.1. Luồng gửi thông tin liên hệ (Contact Form Submission)
- Bước 1: Người dùng điền thông tin vào các trường trên form liên hệ.
- Bước 2: Người dùng nhấn nút Send Now.
- Bước 3: Trình duyệt kiểm tra định dạng dữ liệu:
  - Nếu trường Your Email có dữ liệu và không đúng định dạng email (ví dụ: thiếu ký tự @ hoặc thiếu tên miền), trình duyệt sẽ chặn hành động gửi và hiển thị thông báo lỗi tương ứng với ngôn ngữ của trình duyệt.
  - Nếu tất cả dữ liệu hợp lệ (hoặc form được để trống hoàn toàn do không bắt buộc), trình duyệt kích hoạt hành động gửi.
- Cơ chế gửi form thực tế:
  - Form sử dụng phương thức gửi dữ liệu tĩnh: action=mailto:Contact@ifirstaid.com, method=post, enctype=text/plain.
  - Khi form được gửi thành công, trình duyệt sẽ kích hoạt và mở ứng dụng email mặc định trên thiết bị của người dùng (ví dụ: Outlook, Mail) và tự động điền các thông tin đã nhập vào nội dung email chuẩn bị gửi đến địa chỉ Contact@ifirstaid.com.
  - Giao diện trang web không tải lại, không xóa trắng các trường thông tin đã nhập sau khi nhấn Send Now. Không hiển thị thông báo thành công dạng Toast hay Alert trên UI (do là form tĩnh sử dụng mailto).

Các kịch bản kiểm thử (Test Cases) của luồng gửi thông tin liên hệ:

Kịch bản kiểm thử thành công (Pass cases):
- TC-PASS-01: Gửi form thành công khi nhập đầy đủ thông tin hợp lệ vào tất cả các trường. Kết quả mong đợi: Form được gửi đi, ứng dụng mail mặc định mở ra với nội dung email chứa dữ liệu đã nhập.
- TC-PASS-02: Gửi form thành công khi chỉ điền các trường không phải Email (Full Name, Phone, Your Message) và để trống Your Email. Kết quả mong đợi: Form gửi đi thành công do không có thuộc tính required.
- TC-PASS-03: Gửi form thành công khi để trống hoàn toàn tất cả các trường. Kết quả mong đợi: Form gửi đi thành công do không có trường nào bắt buộc nhập.

Kịch bản kiểm thử thất bại hoặc lỗi định dạng (Fail cases):
- TC-FAIL-01: Không cho phép gửi form khi Your Email nhập thiếu ký tự @ (ví dụ: testemail.com). Kết quả mong đợi: Trình duyệt chặn gửi form, hiển thị thông báo lỗi yêu cầu thêm ký tự @.
- TC-FAIL-02: Không cho phép gửi form khi Your Email chỉ có ký tự @ mà thiếu tên miền phía sau (ví dụ: testemail@). Kết quả mong đợi: Trình duyệt chặn gửi form, hiển thị thông báo lỗi yêu cầu nhập phần sau ký tự @.
- TC-FAIL-03: Không cho phép gửi form khi Your Email chứa khoảng trắng không hợp lệ (ví dụ: test email@domain.com). Kết quả mong đợi: Trình duyệt chặn gửi form, hiển thị thông báo lỗi yêu cầu nhập địa chỉ email hợp lệ.

### 4.2. Luồng cuộn trang tự động (Smooth Scroll Navigation)
- Bước 1: Người dùng nhấn vào một trong các liên kết điều hướng trên Header (Features, First Look, Resources, Contact).
- Bước 2: Trang web xác định phần tử mục tiêu dựa trên giá trị href (ví dụ: href=/#features tương ứng với phần tử có id=features).
- Bước 3: Màn hình tự động cuộn mượt mà (smooth scrolling) từ vị trí hiện tại đến đầu phần tử mục tiêu. Thanh điều hướng vẫn được cố định ở vị trí trên cùng của màn hình.

### 4.3. Luồng quay lại đầu trang (Scroll to Top)
- Bước 1: Người dùng cuộn trang web xuống phía dưới. Nút cuộn lên đầu trang (goTop) xuất hiện ở góc dưới bên phải.
- Bước 2: Người dùng nhấn vào nút goTop.
- Bước 3: Màn hình tự động cuộn mượt mà lên trên cùng của trang web (vị trí Hero section).
