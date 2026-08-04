# Style 7: OpenAI Official

Thẩm mỹ sạch sẽ, hiện đại, phù hợp với các tài liệu và sơ đồ nghiên cứu của OpenAI — tối giản nhưng chính xác.

## Bảng màu

```
Nền:            #ffffff  (trắng tinh)
Văn bản chính:  #0d0d0d  (gần như đen)
Văn bản phụ:    #6e6e80  (xám mờ)
Đường viền:     #e5e5e5  (xám nhạt)

Màu sắc nhấn (dùng tiết chế):
  Xanh lá nhấn: #10a37f  (xanh lá cây thương hiệu OpenAI)
  Xanh lam nhấn: #1d4ed8  (liên kết, hành động)
  Cam nhấn:     #f97316  (nổi bật, cảnh báo)
  Xám nhấn:     #71717a  (phần tử phụ)
```

## Kiểu chữ

```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica Neue, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif
font-size:   16px cho nhãn nút, 13px cho mô tả, 12px cho nhãn mũi tên
font-weight: 600 cho tiêu đề, 500 cho nhãn, 400 cho mô tả
letter-spacing: -0.01em (khá khít)
```

Không dùng phông chữ tùy chỉnh. Chỉ sử dụng các phông chữ hệ thống để có khả năng tương thích tối đa.

## Hộp nút (Node Boxes)

Hộp sạch sẽ, tối giản với đường viền tinh tế:

```xml
<!-- Nút tiêu chuẩn -->
<rect x="100" y="100" width="180" height="80" rx="8" ry="8"
      fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5"/>

<!-- Nút màu nhấn (với đường viền trái màu xanh lá) -->
<rect x="100" y="100" width="180" height="80" rx="8" ry="8"
      fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5"/>
<rect x="100" y="100" width="4" height="80" rx="2" ry="2"
      fill="#10a37f"/>
```

**Kỹ thuật chính:**
1. Màu tô trắng với viền xám nhạt (không bóng đổ)
2. Dải viền bên trái có màu sắc tùy chọn làm điểm nhấn (rộng 4px)
3. `rx="8"` để bo góc nhẹ
4. `stroke-width: 1.5` — đường viền mỏng, chính xác
5. Không dùng gradient, không bóng đổ, không yếu tố trang trí

## Mũi tên

Các mũi tên mỏng, chính xác với màu sắc tinh tế:

```xml
<defs>
  <!-- Mũi tên mặc định (xám) -->
  <marker id="arrow-oai" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#71717a"/>
  </marker>

  <!-- Mũi tên màu nhấn (xanh lá) -->
  <marker id="arrow-oai-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#10a37f"/>
  </marker>
</defs>

<!-- Liên kết mặc định -->
<line x1="280" y1="140" x2="400" y2="140"
      stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow-oai)"/>

<!-- Liên kết màu nhấn -->
<line x1="280" y1="140" x2="400" y2="140"
      stroke="#10a37f" stroke-width="1.5" marker-end="url(#arrow-oai-green)"/>
```

**Nguyên tắc về mũi tên:**
- Ưu tiên đường thẳng (định tuyến trực giao với góc vuông)
- `stroke-width: 1.5` — mỏng và chính xác
- Đầu mũi tên đa giác tô kín (không vẽ bằng nét)
- Màu xám mặc định, màu xanh lá cho các luồng chính/nhấn
- Nét đứt (`stroke-dasharray="4,3"`) cho các luồng tùy chọn/bất đồng bộ

## Nhãn Mũi tên

Nhãn tối giản, kích thước nhỏ:

```xml
<text x="340" y="133" text-anchor="middle" fill="#6e6e80" font-size="12">
  nhãn
</text>
```

Nhãn phải đảm bảo:
- Cỡ chữ 12px, màu xám (`#6e6e80`)
- Không có hình chữ nhật nền (nền trắng là mặc định)
- Từ ngữ ngắn gọn, mang tính kỹ thuật
- Nằm ở điểm giữa của mũi tên

## Hình dạng Cơ sở dữ liệu (Database Shapes)

Hình trụ sạch sẽ với đường viền mỏng:

```xml
<ellipse cx="200" cy="100" rx="50" ry="12" fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5"/>
<path d="M 150,100 L 150,140 Q 200,155 250,140 L 250,100"
      fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5"/>
<ellipse cx="200" cy="140" rx="50" ry="12" fill="none" stroke="#e5e5e5" stroke-width="1.5"/>
```

## Các hộp nhóm (Grouping Containers)

Hộp hình chữ nhật nét đứt để gom nhóm logic:

```xml
<rect x="80" y="80" width="400" height="200" rx="8" ry="8"
      fill="none" stroke="#e5e5e5" stroke-width="1" stroke-dasharray="4,3"/>
<text x="90" y="97" fill="#6e6e80" font-size="12" font-weight="500">
  Nhãn nhóm
</text>
```

## Nội dung Nút

Bố cục văn bản sạch sẽ, tối giản:

```xml
<rect x="100" y="100" width="180" height="80" rx="8" ry="8"
      fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5"/>
<text x="190" y="130" text-anchor="middle" fill="#0d0d0d"
      font-size="16" font-weight="600">
  Tên thành phần
</text>
<text x="190" y="150" text-anchor="middle" fill="#6e6e80"
      font-size="13">
  Mô tả ngắn gọn
</text>
```

**Nguyên tắc nội dung:**
- 1-2 dòng mỗi hộp
- Nhãn chính: 16px, font-weight: 600, gần như đen
- Mô tả: 13px, font-weight: 400, xám
- Văn bản căn giữa trong hộp

## Nguyên tắc Bố cục

**Bố cục căn chỉnh lưới chính xác:**
- Snap tất cả tọa độ theo lưới 8px
- Khoảng cách ngang 100px nhất quán
- Khoảng cách dọc 120px nhất quán
- Khoảng trắng thoáng đãng (lề 40px+)
- Không có yếu tố trang trí dư thừa

**Sự tối giản của OpenAI:**
- Chỉ sử dụng màu sắc khi có ý nghĩa ngữ nghĩa (màu xanh lá thương hiệu cho luồng chính)
- Các hộp màu trắng trên nền trắng — phân biệt chỉ qua đường viền và nhãn
- Tránh: bóng đổ, gradient, họa tiết, biểu tượng, yếu tố trang trí
- Ưu tiên: đường thẳng, định tuyến trực giao, nét mỏng

## Bản mẫu SVG (SVG Template)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" width="960" height="600">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica Neue, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif; }
  </style>
  <defs>
    <marker id="arrow-oai" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#71717a"/>
    </marker>
    <marker id="arrow-oai-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#10a37f"/>
    </marker>
  </defs>

  <!-- Nền trắng -->
  <rect width="960" height="600" fill="#ffffff"/>

  <!-- Tiêu đề -->
  <text x="480" y="30" text-anchor="middle" fill="#0d0d0d"
        font-size="20" font-weight="600">Tiêu đề sơ đồ</text>

  <!-- Nút tiêu chuẩn -->
  <rect x="100" y="70" width="180" height="80" rx="8" ry="8"
        fill="#ffffff" stroke="#e5e5e5" stroke-width="1.5"/>
  <text x="190" y="100" text-anchor="middle" fill="#0d0d0d"
        font-size="16" font-weight="600">Thành phần</text>
  <text x="190" y="120" text-anchor="middle" fill="#6e6e80"
        font-size="13">Mô tả</text>

  <!-- Kết nối -->
  <line x1="280" y1="110" x2="400" y2="110"
        stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow-oai)"/>
  <text x="340" y="103" text-anchor="middle" fill="#6e6e80" font-size="12">nhãn</text>
</svg>
```

## Triết lý Thiết kế

Phong cách OpenAI Official nhấn mạnh:
- **Sự tối giản**: Trắng trên nền trắng, chỉ có các yếu tố trực quan thiết yếu
- **Sự chính xác**: Nét vẽ mỏng, góc sắc nét (rx=8), căn lưới
- **Sự rõ ràng**: Ưu tiên nội dung, không có hạt nhiễu trực quan
- **Sự nhất quán thương hiệu**: xanh lá `#10a37f` được dùng tiết chế cho các luồng chính

Tránh:
- Bóng đổ và gradient
- Màu tô nhiều màu (chỉ màu trắng)
- Đường viền dày (>2px)
- Yếu tố trang trí (biểu tượng, hoa văn, kết cấu)
- Phông chữ tùy chỉnh (chỉ phông chữ hệ thống)
