# Style 2: Dark Terminal

Thẩm mỹ hacker màu neon trên nền tối. Khớp với phong cách sơ đồ kỹ thuật tiêu chuẩn của CLAUDE.md.

## Màu sắc

```
Nền:            #0f0f1a  (gần như đen)
Màu tô bảng:    #0f172a  (slate-950)
Đường viền:     #334155  (slate-700)
Bo góc hộp:     6px

Văn bản chính:       #e2e8f0  (slate-200)
Văn bản phụ:         #94a3b8  (slate-400)
Văn bản mờ (muted):  #475569  (slate-600)

Bảng màu nhấn (sử dụng theo chủ đề/phân lớp):
  Tím:    #7c3aed / #a855f7
  Cam:    #ea580c / #f97316
  Xanh:   #1d4ed8 / #3b82f6
  Lục:    #059669 / #10b981
  Vàng:   #eab308
  Đỏ:     #dc2626 / #ef4444

Màu mũi tên: khớp với màu nhấn của chủ đề nút nguồn
```

## Gradient Nền

```xml
<defs>
  <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#0f0f1a"/>
    <stop offset="100%" stop-color="#1a1a2e"/>
  </linearGradient>
</defs>
<rect width="960" height="600" fill="url(#bg-grad)"/>
```

## Kiểu chữ

```
font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', 'Microsoft YaHei', 'SimHei', monospace
font-size:   13px cho nhãn, 11px cho nhãn phụ, 15px cho tiêu đề
font-weight: 400 normal, 700 bold cho tiêu đề phân đoạn
letter-spacing: 0.02em cho nhãn
```

## Phong cách Hộp (Box Styles)

```xml
<!-- Bảng tiêu chuẩn -->
<rect rx="6" ry="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>

<!-- Hộp màu nhấn (theo chức năng) -->
<rect rx="6" ry="6" fill="#1e1b4b" stroke="#7c3aed" stroke-width="1.5"/>
<!-- Màu tím cho các nút AI/ML -->
<!-- #1c1917 / #ea580c cho các nút tính toán/API -->
<!-- #052e16 / #059669 cho các nút lưu trữ/DB -->
<!-- #1e3a5f / #3b82f6 cho các nút mạng/gateway -->
```

## Hiệu ứng Phát sáng (tùy chọn, cho các nút chính)

```xml
<defs>
  <filter id="glow-purple">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<rect filter="url(#glow-purple)" stroke="#a855f7" .../>
```

## Mũi tên

```xml
<defs>
  <marker id="arrow-purple" markerWidth="8" markerHeight="6"
          refX="7" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="#a855f7"/>
  </marker>
</defs>
<path stroke="#a855f7" stroke-width="1.5" stroke-dasharray="none"
      fill="none" marker-end="url(#arrow-purple)"/>
```

## Bản mẫu SVG (SVG Template)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600"
     width="960" height="600">
  <style>
    text { font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', 'Microsoft YaHei', 'SimHei', monospace; fill: #e2e8f0; }
  </style>
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0f1a"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <!-- arrow markers -->
    <!-- glow filters -->
  </defs>
  <rect width="960" height="600" fill="url(#bg-grad)"/>
  <!-- nodes, edges, legend -->
</svg>
```
