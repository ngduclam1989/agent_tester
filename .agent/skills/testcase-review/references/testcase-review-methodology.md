# Phương pháp luận thẩm định ca kiểm thử (Testcase Review)

## Mục tiêu thẩm định

Mục tiêu cốt lõi của việc thẩm định ca kiểm thử là:
1. **Tính đầy đủ (Completeness)** - Đảm bảo mỗi điểm tính năng trong tài liệu yêu cầu đều có ca kiểm thử tương ứng.
2. **Tính chính xác (Accuracy)** - Đảm bảo phần mô tả của testcase nhất quán với tài liệu yêu cầu.
3. **Tính hiệu quả (Effectiveness)** - Đảm bảo testcase được thiết kế có khả năng phát hiện lỗi một cách hiệu quả nhất.

---

## Các khía cạnh thẩm định

### 1. Thẩm định độ bao phủ (Coverage)

| Khía cạnh | Giải thích | Tiêu chuẩn thẩm định |
|------|------|---------|
| Bao phủ tính năng | Các điểm tính năng trong yêu cầu có đầy đủ testcase hay chưa | Độ bao phủ ≥ 90% |
| Bao phủ kịch bản | Luồng chính, luồng rẽ nhánh, luồng ngoại lệ có đầy đủ chưa | Các kịch bản chính không được bỏ sót |
| Bao phủ dữ liệu | Đã bao phủ các giá trị biên, phân vùng tương đương chưa | Các biên quan trọng phải có testcase |

### 2. Thẩm định chất lượng testcase

| Khía cạnh | Giải thích | Tiêu chuẩn thẩm định |
|------|------|---------|
| Tính chính xác | Mô tả testcase nhất quán với tài liệu yêu cầu | Không mơ hồ, không mâu thuẫn |
| Tính thực thi | Các bước rõ ràng, có khả năng tái dựng kịch bản | Mỗi bước đều thao tác được trên thực tế |
| Tính toàn vẹn | Chứa đầy đủ tiền điều kiện, các bước thực hiện, kết quả kỳ vọng | Đầy đủ 3 yếu tố cốt lõi |
| Tính độc lập | Các testcase không phụ thuộc chéo lẫn nhau | Có thể thực thi độc lập |

### 3. Thẩm định độ ưu tiên

| Độ ưu tiên | Định nghĩa | Tỷ lệ khuyến nghị |
|--------|------|---------|
| P0 | Tính năng cốt lõi, luồng chính | 10-25% |
| P1 | Tính năng quan trọng, kịch bản nghiệp vụ phổ biến | 30-60% |
| P2 | Tính năng phụ, kịch bản ngoại lệ/đặc thù | 10-25% |

---

## Các loại lỗ hổng cần nhận diện

### Loại 1: Thiếu tính năng (Functional Gap)

**Đặc điểm nhận diện**:
- Điểm tính năng được mô tả rõ ràng trong tài liệu yêu cầu.
- Nhưng trong bộ testcase hoàn toàn không có ca kiểm thử nào tương ứng.

**Ví dụ**:
```
Yêu cầu: Hỗ trợ đăng nhập qua bên thứ ba (WeChat, GitHub).
Testcase hiện tại: Chỉ có testcase đăng nhập bằng tài khoản cục bộ.
→ Lỗ hổng: Thiếu kiểm thử tính năng đăng nhập qua bên thứ ba.
```

### Loại 2: Thiếu kịch bản (Scenario Gap)

**Đặc điểm nhận diện**:
- Thiếu testcase cho luồng ngoại lệ, luồng rẽ nhánh.
- Các điều kiện biên chưa được bao phủ.

**Ví dụ**:
```
Yêu cầu: Độ dài tên đăng nhập từ 4-20 ký tự.
Testcase hiện tại: Chỉ kiểm thử kịch bản "độ dài thông thường".
→ Lỗ hổng: Thiếu kiểm thử giá trị biên (3 ký tự, 21 ký tự).
```

### Loại 3: Thiếu dữ liệu (Data Gap)

**Đặc điểm nhận diện**:
- Chưa bao phủ trường hợp giá trị rỗng (null), ký tự đặc biệt.
- Chưa bao phủ giá trị cực đại/cực tiểu.

### Loại 4: Thiếu kịch bản tổ hợp (Combined Scenario Gap)

**Đặc điểm nhận diện**:
- Thiếu kiểm thử cho thao tác tổ hợp nhiều tính năng.
- Thiếu bao phủ luồng nghiệp vụ liên module (End-to-End).

---

## Quy trình thẩm định

```
┌─────────────────────────────────────────────────────────┐
│  Bước 1: Thu thập tài liệu                              │
│  - Excel testcase hiện có                               │
│  - Tài liệu yêu cầu (Word/PDF/PRD/Hình ảnh)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Bước 2: Phân tích cấu trúc                             │
│  - Trích xuất module, tiêu đề, các bước của testcase    │
│  - Trích xuất điểm tính năng trong PRD (theo module)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Bước 3: Thiết lập ánh xạ (Mapping)                     │
│  - Ánh xạ điểm tính năng testcase → điểm tính năng PRD  │
│  - Nhận diện các điểm tính năng chưa được ánh xạ        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Bước 4: Phân tích lỗ hổng                              │
│  - Phân loại lỗ hổng (tính năng/kịch bản/dữ liệu/tổ hợp)│
│  - Đánh giá mức độ ảnh hưởng và rủi ro                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Bước 5: Xuất báo cáo                                   │
│  - Thống kê tỷ lệ độ bao phủ                            │
│  - Danh sách lỗ hổng (kèm mô tả testcase khuyến nghị)   │
│  - Khuyến nghị độ ưu tiên bổ sung                       │
└─────────────────────────────────────────────────────────┘
```

---

## Mẫu kết quả đầu ra

### Bảng tổng quan độ bao phủ

| Module | Số điểm tính năng | Số testcase hiện có | Số testcase bị thiếu | Độ bao phủ |
|------|-------------|-----------|-----------|--------|
| Đăng nhập | 8 | 6 | 2 | 75% |
| Đăng ký | 5 | 5 | 0 | 100% |
| Trang chủ | 12 | 8 | 4 | 67% |

### Danh sách testcase bị thiếu

#### 1. [Tên Module] - Thiếu tính năng

| Điểm tính năng bị thiếu | Mô tả yêu cầu trong PRD | Loại testcase đề xuất | Độ ưu tiên đề xuất |
|-----------|---------|-------------|-----------|
| Đăng nhập bên thứ ba | Hỗ trợ đăng nhập qua WeChat/GitHub | Kiểm thử chức năng | P1 |
| Xử lý hết hạn đăng nhập | Hết hạn Token yêu cầu đăng nhập lại | Kiểm thử ngoại lệ | P1 |

#### 2. [Tên Module] - Thiếu kịch bản biên

| Kịch bản bị thiếu | Điều kiện biên | Loại testcase đề xuất | Độ ưu tiên đề xuất |
|---------|---------|-------------|-----------|
| Độ dài tên đăng nhập tối thiểu | Dưới 4 ký tự | Kiểm thử biên | P2 |
| Độ dài tên đăng nhập tối đa | Trên 20 ký tự | Kiểm thử biên | P2 |

---

## Các điểm kiểm tra thẩm định cốt lõi

### Các điểm kiểm tra cho Module Đăng nhập
- [ ] Đăng nhập thành công với dữ liệu hợp lệ.
- [ ] Nhập sai mật khẩu.
- [ ] Tài khoản không tồn tại.
- [ ] Tài khoản bị vô hiệu hóa/khóa.
- [ ] Xử lý khi Token hết hạn.
- [ ] Xung đột khi đăng nhập đồng thời trên nhiều thiết bị.
- [ ] Đăng nhập qua bên thứ ba (WeChat/GitHub).
- [ ] Ghi nhật ký đăng nhập (log).

### Các điểm kiểm tra cho Module Đăng ký
- [ ] Đăng ký thành công với dữ liệu hợp lệ.
- [ ] Tên đăng nhập đã tồn tại trên hệ thống.
- [ ] Mật khẩu không đúng định dạng yêu cầu.
- [ ] Định dạng email sai.
- [ ] Định dạng số điện thoại sai.
- [ ] Mã xác thực (OTP) nhập sai hoặc đã hết hạn.
- [ ] Phòng chống gửi yêu cầu đăng ký trùng lặp (Double submit).

### Các điểm kiểm tra cho Ô nhập liệu biểu mẫu
- [ ] Bỏ trống đầu vào.
- [ ] Nhập liệu hợp lệ.
- [ ] Các giá trị biên (tối thiểu/tối đa).
- [ ] Nhập dữ liệu quá dài.
- [ ] Nhập ký tự đặc biệt.
- [ ] Tấn công SQL Injection / XSS.
- [ ] Xử lý khoảng trắng / Khoảng trắng ở đầu và cuối chuỗi.

---

## Nhật ký thẩm định

Mỗi lần thực hiện thẩm định khuyến nghị ghi chép lại các thông tin:
- Ngày thực hiện thẩm định
- Người thực hiện thẩm định
- Phạm vi thẩm định (Scope)
- Số lượng vấn đề phát hiện được
- Số lượng testcase khuyến nghị bổ sung
- Số lượng testcase thực tế được bổ sung (theo dõi sau đó)
