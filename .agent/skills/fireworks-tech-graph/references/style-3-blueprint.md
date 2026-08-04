# Style 3: Blueprint

Thẩm mỹ bản vẽ kỹ thuật với nền lưới và phong cách chú thích kỹ thuật.

## Màu sắc

```
Nền:            #0a1628
Màu lưới:       #112240  (các đường lưới tinh tế)
Màu tô bảng:    #0d1f3c
Đường viền:     #00b4d8  (xanh lục lam/teal)
Bo góc hộp:     2px  (các góc sắc nét cho cảm giác kỹ thuật)

Văn bản chính:       #caf0f8  (cyan nhạt)
Văn bản phụ:         #90e0ef
Nhãn văn bản:        #00b4d8
Văn bản mờ (muted):  #48cae4 ở độ mờ 60%

Màu sắc nhấn:
  Cyan:    #00b4d8 / #48cae4
  Trắng:   #ffffff (các nhãn chính)
  Cam:     #f77f00 (cảnh báo/lưu ý)
  Lục:     #06d6a0 (thành công/hoạt động)
```

## Nền với Lưới

```xml
<defs>
  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
    <path d="M 30 0 L 0 0 0 30" fill="none" 
          stroke="#112240" stroke-width="0.5"/>
  </pattern>
</defs>
<rect width="960" height="600" fill="#0a1628"/>
<rect width="960" height="600" fill="url(#grid)" opacity="0.6"/>
```

## Kiểu chữ

```
font-family: 'Courier New', 'Lucida Console', 'Microsoft YaHei', 'SimHei', monospace
font-size:   13px cho nhãn, 10px cho chú thích, 16px cho tiêu đề
font-weight: 400; tiêu đề sử dụng 700
text-transform: uppercase cho tiêu đề phân đoạn
letter-spacing: 0.05em
```

## Phong cách Hộp (Box Styles)

```xml
<!-- Hộp nút kỹ thuật -->
<rect rx="2" ry="2" fill="#0d1f3c" stroke="#00b4d8" stroke-width="1"/>

<!-- Dấu ngoặc góc thay vì đường viền đầy đủ (phong cách kỹ thuật) -->
<!-- Vẽ 4 hình chữ L ở các góc thay vì hình chữ nhật đầy đủ -->

<!-- Hộp nét đứt (thành phần bên ngoài/tùy chọn) -->
<rect rx="2" fill="none" stroke="#00b4d8" stroke-width="1" 
      stroke-dasharray="6,3"/>
```

## Mũi tên & Chú thích

```xml
<defs>
  <marker id="arrow-cyan" markerWidth="8" markerHeight="6"
          refX="7" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="#00b4d8"/>
  </marker>
</defs>
<!-- Các đường vẽ sắc nét, ưu tiên định tuyến trực giao -->
<polyline points="x1,y1 x2,y1 x2,y2" 
          stroke="#00b4d8" stroke-width="1" fill="none"
          marker-end="url(#arrow-cyan)"/>

<!-- Nhãn chú thích trên dòng -->
<text fill="#48cae4" font-size="10" text-anchor="middle">HTTP/REST</text>
```

## Khối Tiêu đề (góc dưới bên phải)

```xml
<!-- Khối tiêu đề Blueprint -->
<rect x="700" y="530" width="240" height="60" 
      fill="#0d1f3c" stroke="#00b4d8" stroke-width="1"/>
<line x1="700" y1="545" x2="940" y2="545" 
      stroke="#00b4d8" stroke-width="0.5"/>
<text x="820" y="542" text-anchor="middle" 
      fill="#caf0f8" font-size="10">KIẾN TRÚC HỆ THỐNG</text>
<text x="820" y="578" text-anchor="middle" 
      fill="#00b4d8" font-size="13" font-weight="700">TIÊU ĐỀ SƠ ĐỒ</text>
```

## Bản mẫu SVG (SVG Template)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600"
     width="960" height="600">
  <style>
    text { font-family: 'Courier New', 'Lucida Console', 'Microsoft YaHei', 'SimHei', monospace; fill: #caf0f8; }
  </style>
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#112240" stroke-width="0.5"/>
    </pattern>
    <!-- arrow markers -->
  </defs>
  <rect width="960" height="600" fill="#0a1628"/>
  <rect width="960" height="600" fill="url(#grid)" opacity="0.6"/>
  <!-- nodes, edges, title block -->
</svg>
```
