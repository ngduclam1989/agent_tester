# Thực hành tốt nhất về Bố cục Sơ đồ kỹ thuật SVG

## Quy tắc bố cục chung (Áp dụng cho tất cả các style)

### 1. Khoảng cách giữa các thành phần
- **Khoảng trống tối thiểu giữa các thành phần**: 80px (từ cạnh đến cạnh)
- **Khoảng trống tối thiểu cho các đường dẫn mũi tên**: 60px từ các cạnh của thành phần
- **Khoảng cách dọc giữa các lớp**: 120px giữa các lớp nằm ngang
- **Khoảng cách ngang trên cùng một lớp**: 100-120px giữa các thành phần

### 2. Định tuyến mũi tên & Điểm kết nối

#### Quy tắc Điểm kết nối
- **Không bao giờ kết nối mũi tên với các góc của thành phần** - sử dụng trung điểm của các cạnh
- **Các điểm vào/ra**: 
  - Cạnh trên: `cx ± offset` với offset = 0 cho mũi tên đơn, ±30px cho nhiều mũi tên
  - Cạnh dưới: quy tắc tương tự
  - Cạnh trái/phải: `cy ± offset`
- **Khoảng cách từ các góc**: tối thiểu 20px

#### Định tuyến Đường dẫn Mũi tên
- **Tránh các đường chéo đi qua các thành phần** - sử dụng định tuyến trực giao (đường đi hình chữ L)
- **Đối với các mũi tên cong**: 
  - Điểm kiểm soát phải cách ít nhất 40px từ bất kỳ cạnh thành phần nào
  - Sử dụng các điểm trung gian cho định tuyến phức tạp: `M x1,y1 L x2,y2 Q cx,cy x3,y3`
- **Nhiều mũi tên giữa các lớp giống nhau**: xếp so le tọa độ Y từ 15-20px để tránh chồng chéo

#### Ngăn ngừa trùng lặp mũi tên
```svg
<!-- Tồi: mũi tên chéo đi qua thành phần -->
<path d="M 200,100 L 600,400"/>

<!-- Tốt: định tuyến trực giao xung quanh thành phần -->
<path d="M 200,100 L 200,250 L 600,250 L 600,400"/>

<!-- Tốt: cong với điểm kiểm soát an toàn -->
<path d="M 200,100 Q 400,200 600,400"/>
<!-- Điểm kiểm soát (400,200) cách bất kỳ thành phần nào hơn 50px -->
```

### 3. Đặt vị trí nhãn mũi tên
- **Vị trí**: trung điểm của đường dẫn mũi tên, lệch 5-10px vuông góc với hướng mũi tên
- **Hình chữ nhật nền**: LUÔN LUÔN bao gồm, với:
  - Khoảng đệm (Padding): 4px ngang, 2px dọc
  - Màu tô (Fill): khớp với màu nền tảng
  - Độ mờ (Opacity): 0.9-0.95
- **Khoảng cách an toàn**: tối thiểu 15px từ bất kỳ cạnh thành phần nào
- **Nhiều mũi tên hội tụ**: xếp so le các vị trí nhãn theo chiều dọc 20px

### 4. Phát hiện chồng chéo thành phần
Trước khi hoàn tất SVG, hãy kiểm tra:
- Không có hộp bao quanh thành phần nào chồng chéo (sử dụng biên an toàn 20px)
- Không có đường dẫn mũi tên nào đi qua bên trong thành phần (trừ trường hợp cố ý đi xuyên qua với phong cách nét đứt)
- Không có nhãn văn bản nào chồng chéo với các thành phần hoặc nhãn khác

### 5. Phân lớp Z-Index (thứ tự render SVG)
```svg
<!-- Thứ tự render (từ trên xuống dưới / từ sau ra trước): -->
1. Hình chữ nhật nền
2. Các hộp nhóm (hình chữ nhật nét đứt)
3. Các đường dẫn mũi tên
4. Hình chữ nhật nền của nhãn mũi tên
5. Các thành phần (hộp, hình trụ, v.v.)
6. Văn bản thành phần
7. Văn bản nhãn mũi tên
8. Chú giải (Legend)
```

## Các cải tiến theo từng style

### Style-1: Flat Icon Clean
- **Căn chỉnh hoàn hảo**: snap tất cả tọa độ theo lưới 8px
- **Góc sắc nét**: rx="8" ry="8" cho hình chữ nhật bo góc (nhất quán)
- **Mũi tên**: mỏng (1.5-2px), các marker đa giác tô kín
- **Không bóng đổ**: nguyên tắc thiết kế phẳng (flat design)

### Style-6: Claude Official Warm
- **Bóng đổ mềm**: `<feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#00000008"/>`
- **Các góc bo tròn**: rx="12" ry="12" (tròn hơn so với Style-1)
- **Mũi tên**: độ dày trung bình (2px), marker tinh tế

## Danh sách xác thực

Trước khi xuất PNG, hãy xác minh:
- [ ] Không có sự chồng chéo giữa mũi tên và thành phần (kiểm tra bằng mắt)
- [ ] Tất cả các nhãn mũi tên đều có hình chữ nhật nền
- [ ] Khoảng trống tối thiểu 60px cho tất cả các đường mũi tên
- [ ] Khoảng cách giữa các thành phần ≥ 80px
- [ ] Điểm kết nối mũi tên tránh các góc (≥20px từ góc)
- [ ] Nhiều mũi tên giữa các lớp được xếp so le
- [ ] Chú giải rõ ràng và không chồng chéo nội dung
- [ ] SVG hợp lệ với `rsvg-convert`

## Các phản mẫu (Anti-Patterns) phổ biến cần tránh

| Phản mẫu | Giải pháp khắc phục |
|--------------|-----|
| Mũi tên cắt qua thành phần | Sử dụng định tuyến trực giao hoặc tăng khoảng cách điểm kiểm soát |
| Nhãn đè lên thành phần | Thêm hình chữ nhật nền + tăng độ lệch (offset) |
| Các thành phần quá gần nhau | Tăng khoảng cách lên tối thiểu 80px |
| Mũi tên kết nối vào góc | Di chuyển điểm kết nối đến trung điểm cạnh |
| Không lập kế hoạch z-index | Tuân thủ thứ tự render: mũi tên -> thành phần -> văn bản |
