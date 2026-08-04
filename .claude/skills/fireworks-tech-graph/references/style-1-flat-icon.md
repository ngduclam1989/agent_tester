# Style 1: Flat Icon (Mặc định)

Lấy cảm hứng từ các thiết lập mặc định của draw.io và phong cách tài liệu hướng dẫn của Apple.

## Màu sắc

```
Màu nền (Background):    #ffffff
Màu nền hộp (Box fill):  #ffffff
Màu viền hộp (Stroke):   #d1d5db  (gray-300)
Bo góc hộp (Box radius): 8px
Chữ chính (Primary):     #111827  (gray-900)
Chữ phụ (Secondary):     #6b7280  (gray-500)

Màu sắc mũi tên ngữ nghĩa (chọn theo loại luồng):
  Luồng A (chính - main):  #2563eb  (blue-600)
  Luồng B (phụ - alt):     #dc2626  (red-600)
  Luồng C (dữ liệu - data):#16a34a  (green-600)
  Luồng D (bất đồng bộ):   #9333ea  (purple-600)

Màu nền nhấn của Icon:
  Tông xanh lam (Blue):    #eff6ff / #dbeafe
  Tông đỏ (Red):           #fef2f2 / #fee2e2
  Tông xanh lá (Green):    #f0fdf4 / #dcfce7
  Tông tím (Purple):       #faf5ff / #ede9fe
  Tông cam (Orange):       #fff7ed / #fed7aa
  Tông xanh cyan (Teal):   #f0fdfa / #ccfbf1
```

## Kiểu chữ (Typography)

```
font-family: 'Helvetica Neue', Helvetica, Arial, 'PingFang SC',
             'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif
font-size:   nhãn 14px (labels), nhãn phụ 12px (sub-labels), tiêu đề 16px (titles)
font-weight: thường 400 (normal), bán đậm 600 (semi-bold) cho tiêu đề
```

## Hình dáng hộp (Box Shapes)

```xml
<!-- Hộp nút tiêu chuẩn -->
<rect rx="8" ry="8" fill="#ffffff" stroke="#d1d5db" stroke-width="1.5"/>

<!-- Hộp nhấn kèm icon (nền màu) -->
<rect rx="8" ry="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>

<!-- Hình trụ cơ sở dữ liệu (sử dụng SVG path) -->
<!-- Hộp cửa sổ Terminal: rx=4, fill=#111827, stroke=#374151 -->
<!-- Người dùng/Tác nhân (Actor): hình tròn hoặc hình chữ nhật bo góc kèm icon -->
```

## Mũi tên (Arrows)

```xml
<defs>
  <marker id="arrow-blue" markerWidth="10" markerHeight="7"
          refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb"/>
  </marker>
  <marker id="arrow-red" markerWidth="10" markerHeight="7"
          refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626"/>
  </marker>
</defs>

<!-- Đường thẳng -->
<line stroke="#2563eb" stroke-width="1.5" marker-end="url(#arrow-blue)"/>
<!-- Hoặc đường vẽ path cho định tuyến cong/vuông góc -->
<path stroke="#2563eb" stroke-width="1.5" fill="none" marker-end="url(#arrow-blue)"/>
```

## Chú giải (Legend)

Luôn đi kèm chú giải ở góc dưới bên trái nếu sơ đồ sử dụng nhiều màu sắc mũi tên khác nhau:

```xml
<g transform="translate(20, 560)">
  <line x1="0" y1="8" x2="30" y2="8" stroke="#2563eb" stroke-width="1.5"
        marker-end="url(#arrow-blue)"/>
  <text x="36" y="12" fill="#6b7280" font-size="12">Luồng Agent</text>
  <line x1="0" y1="24" x2="30" y2="24" stroke="#dc2626" stroke-width="1.5"
        marker-end="url(#arrow-red)"/>
  <text x="36" y="28" fill="#6b7280" font-size="12">Luồng RAG</text>
</g>
```

## Mẫu SVG Template

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" 
     width="960" height="600">
  <style>
    /* TUYỆT ĐỐI KHÔNG dùng @import — rsvg-convert không thể gọi URL bên ngoài */
    text { font-family: 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif; }
  </style>
  <defs>
    <!-- định nghĩa marker đầu mũi tên ở đây -->
    <!-- gradient màu hoặc bộ lọc filter nếu cần -->
  </defs>
  <!-- nền trắng -->
  <rect width="960" height="600" fill="#ffffff"/>
  <!-- tiêu đề sơ đồ (tùy chọn) -->
  <!-- các nút (nodes) -->
  <!-- các đường nối (edges) -->
  <!-- chú giải (legend) -->
</svg>
```
