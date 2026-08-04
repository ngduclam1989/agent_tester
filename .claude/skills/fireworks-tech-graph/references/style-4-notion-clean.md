# Style 4: Notion Clean

Tối giản, thân thiện với tài liệu. Được thiết kế để nhúng vào Notion, Confluence hoặc wiki GitHub.

## Màu sắc

```
Nền:            #ffffff
Màu tô hộp:     #f9fafb  (gray-50) hoặc #ffffff
Đường viền:     #e5e7eb  (gray-200)
Bo góc hộp:     4px

Văn bản chính:       #111827  (gray-900)
Văn bản phụ:         #374151  (gray-700)
Văn bản mờ (muted):  #9ca3af  (gray-400)
Nhãn văn bản:        #6b7280  (gray-500), viết hoa, 11px

Màu nhấn (tinh tế, sử dụng hạn chế):
  Xanh:   #3b82f6 (chỉ cho mũi tên)
  Xám:    #d1d5db (đường chia)
```

## Nguyên tắc Thiết kế

- **Không có biểu tượng trang trí** — chỉ sử dụng các hình dạng hình học (hình chữ nhật, hình tròn, hình thoi)
- **Khoảng trắng thoáng đãng** — khoảng đệm 24px+ giữa các phần tử  
- **Màu mũi tên duy nhất** — màu xanh lam (#3b82f6) cho tất cả các kết nối
- **Nhãn VIẾT HOA TOÀN BỘ** — tiêu đề phân đoạn và nhãn loại nút
- **Không đổ bóng** — chỉ thiết kế phẳng (flat)

## Kiểu chữ

```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei',
             'Microsoft JhengHei', 'SimHei', sans-serif
font-size:   14px cho nhãn, 11px cho nhãn viết hoa, 18px cho tiêu đề
font-weight: 400 normal, 500 medium cho nhãn nút
```

## Phong cách Hộp (Box Styles)

```xml
<!-- Nút tiêu chuẩn -->
<rect rx="4" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>
<text fill="#111827" font-size="14" font-weight="500"/>

<!-- Nhãn loại (bên trong hoặc phía trên hộp) -->
<text fill="#9ca3af" font-size="11" 
      font-weight="500" letter-spacing="0.08em">DATABASE</text>

<!-- Gom nhóm phân đoạn (container nét đứt) -->
<rect rx="4" fill="none" stroke="#e5e7eb" stroke-width="1" 
      stroke-dasharray="4,3"/>
```

## Mũi tên

```xml
<defs>
  <marker id="arrow-blue" markerWidth="8" markerHeight="6"
          refX="7" refY="3" orient="auto">
    <polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/>
  </marker>
</defs>
<line stroke="#3b82f6" stroke-width="1.5" 
      marker-end="url(#arrow-blue)"/>
<!-- Tùy chọn: mũi tên màu xám cho các luồng phụ -->
<line stroke="#d1d5db" stroke-width="1" 
      stroke-dasharray="4,3" marker-end="url(#arrow-gray)"/>
```

## Bản mẫu SVG (SVG Template)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560"
     width="960" height="560">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif; }
  </style>
  <defs>
    <!-- arrow markers (chỉ màu xanh) -->
  </defs>
  <rect width="960" height="560" fill="#ffffff"/>
  <!-- nodes (không có biểu tượng, chỉ có hình học) -->
  <!-- edges (chỉ một màu) -->
  <!-- legend (tối giản, chỉ có nếu có 2 luồng trở lên) -->
</svg>
```

## Hướng dẫn Kích thước

- Hộp nút: tối thiểu 120×40px, ưu tiên 160×48px để dễ đọc
- Tiêu đề: góc trên bên trái, 18px, màu gray-900, lề 32px từ các cạnh
- Khoảng cách: tối thiểu 80px giữa các nút theo chiều ngang, 60px theo chiều dọc
