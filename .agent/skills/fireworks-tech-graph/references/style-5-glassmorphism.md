# Style 5: Glassmorphism

Các thẻ kính mờ trên nền gradient tối. Được thiết kế cho các trang giới thiệu sản phẩm, keynotes và các phần nổi bật (hero sections).

## Màu sắc

```
Gradient Nền: #0d1117 → #161b22 → #0d1117 (đường chéo)

Thẻ kính mờ (Glass card):
  màu tô (fill):  rgba(255,255,255,0.05)
  đường viền:      rgba(255,255,255,0.15)
  backdrop-filter: blur(12px)  [Trong SVG: sử dụng feGaussianBlur]
  bo góc hộp:     12px

Văn bản chính:       #f0f6fc  (gần như trắng)
Văn bản phụ:         #8b949e  (mờ)
Gradient văn bản:    sử dụng linearGradient cho màu tô văn bản đối với các nhãn nổi bật

Vầng phát sáng (mỗi phân lớp một màu):
  Sáng xanh lam:    #58a6ff  / rgba(88,166,255,0.3)
  Sáng tím:         #bc8cff  / rgba(188,140,255,0.3)
  Sáng xanh lá:     #3fb950  / rgba(63,185,80,0.3)
  Sáng cam:         #f78166  / rgba(247,129,102,0.3)
```

## Nền

```xml
<defs>
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#0d1117"/>
    <stop offset="50%"  stop-color="#161b22"/>
    <stop offset="100%" stop-color="#0d1117"/>
  </linearGradient>
  <!-- Các điểm phát sáng xung quanh -->
  <radialGradient id="glow-blue" cx="30%" cy="40%" r="40%">
    <stop offset="0%" stop-color="rgba(88,166,255,0.15)"/>
    <stop offset="100%" stop-color="rgba(88,166,255,0)"/>
  </radialGradient>
  <radialGradient id="glow-purple" cx="70%" cy="60%" r="35%">
    <stop offset="0%" stop-color="rgba(188,140,255,0.12)"/>
    <stop offset="100%" stop-color="rgba(188,140,255,0)"/>
  </radialGradient>
</defs>
<rect width="960" height="600" fill="url(#bg)"/>
<rect width="960" height="600" fill="url(#glow-blue)"/>
<rect width="960" height="600" fill="url(#glow-purple)"/>
```

## Hiệu ứng Thẻ Kính (Glass Card Effect)

SVG không thể thực hiện `backdrop-filter` thực sự, vì vậy hãy mô phỏng bằng:

```xml
<defs>
  <filter id="glass-blur">
    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
  </filter>
</defs>

<!-- Thẻ kính mờ: các hình chữ nhật xếp lớp -->
<!-- 1. Đổ bóng nhẹ bên trong -->
<rect rx="12" fill="rgba(255,255,255,0.03)" stroke="none"/>
<!-- 2. Thân kính -->
<rect rx="12" fill="rgba(255,255,255,0.06)" 
      stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
<!-- 3. Đường sáng nổi bật phía trên -->
<line stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
```

## Kiểu chữ

```
font-family: 'Inter', -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif
font-size:   14px cho nhãn, 12px cho nhãn phụ, 20px cho tiêu đề nổi bật
font-weight: 400 normal, 600 semi-bold, 700 bold cho tiêu đề
```

## Văn bản Gradient (cho các nhãn nổi bật)

```xml
<defs>
  <linearGradient id="text-grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#58a6ff"/>
    <stop offset="100%" stop-color="#bc8cff"/>
  </linearGradient>
</defs>
<text fill="url(#text-grad-blue)" font-weight="700" font-size="20">
  AI Pipeline
</text>
```

## Mũi tên

```xml
<defs>
  <marker id="arrow-blue" markerWidth="8" markerHeight="6"
          refX="7" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="#58a6ff"/>
  </marker>
</defs>
<!-- Đường vẽ phát sáng nhẹ -->
<path stroke="#58a6ff" stroke-width="1.5" fill="none"
      opacity="0.8" marker-end="url(#arrow-blue)"/>
```

## Bản mẫu SVG (SVG Template)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600"
     width="960" height="600">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    text { font-family: 'Inter', -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif; fill: #f0f6fc; }
  </style>
  <defs>
    <!-- bg gradients, glow gradients, glass filter, arrow markers -->
  </defs>
  <!-- các lớp nền -->
  <!-- thẻ kính mờ (nút) -->
  <!-- các cạnh phát sáng -->
  <!-- nhãn văn bản gradient cho tiêu đề nổi bật -->
</svg>
```
