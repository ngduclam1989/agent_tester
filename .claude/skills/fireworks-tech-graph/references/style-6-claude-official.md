# Style 6: Claude Official

Lấy cảm hứng từ các sơ đồ kỹ thuật trên blog Claude của Anthropic — ấm áp, dễ tiếp cận, chuyên nghiệp.

## Màu sắc

```
Nền:            #f8f6f3  (màu kem ấm)
Màu tô hộp:       
  - Tông xanh lam:   #a8c5e6  (nút cảnh báo/đầu vào)
  - Tông xanh lá:    #9dd4c7  (nút agent)
  - Màu be:          #f4e4c1  (hạ tầng/bus)
  - Tông xám:        #e8e6e3  (lưu trữ/trạng thái)
Đường viền hộp: #4a4a4a  (xám đậm)
Bo góc hộp:     12px
Văn bản chính:       #1a1a1a  (gần như đen)
Văn bản phụ:         #6a6a6a  (xám trung bình)
Nhãn văn bản:        #5a5a5a  (nhãn mũi tên)

Màu sắc nút ngữ nghĩa:
  Đầu vào/Nguồn:    #a8c5e6  (xanh lam nhạt)
  Agent/Quy trình:   #9dd4c7  (xanh lục bảo nhạt)
  Hạ tầng:          #f4e4c1  (màu be ấm)
  Lưu trữ/Trạng thái:   #e8e6e3  (xám nhạt)
  
Màu mũi tên:     #5a5a5a  (màu xám đậm nhất quán)
```

## Kiểu chữ

```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue',
             Arial, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif
font-size:   16px cho nhãn nút, 14px cho mô tả, 13px cho nhãn mũi tên
font-weight: 600 cho nhãn nút, 400 cho mô tả, 700 cho tiêu đề
```

## Hình dạng Hộp (Box Shapes)

```xml
<!-- Nút Agent (xanh lục bảo nhạt) -->
<rect rx="12" ry="12" fill="#9dd4c7" stroke="#4a4a4a" stroke-width="2.5"/>

<!-- Nút Đầu vào/Nguồn (xanh lam nhạt) -->
<rect rx="12" ry="12" fill="#a8c5e6" stroke="#4a4a4a" stroke-width="2.5"/>

<!-- Nút Hạ tầng (màu be ấm) -->
<rect rx="12" ry="12" fill="#f4e4c1" stroke="#4a4a4a" stroke-width="2.5"/>

<!-- Nút Lưu trữ/Trạng thái (xám nhạt) -->
<rect rx="12" ry="12" fill="#e8e6e3" stroke="#4a4a4a" stroke-width="2.5"/>
```

## Mũi tên

```xml
<defs>
  <marker id="arrow-claude" markerWidth="8" markerHeight="8"
          refX="7" refY="4" orient="auto">
    <polygon points="0 0, 8 4, 0 8" fill="#5a5a5a"/>
  </marker>
</defs>

<!-- Đường mũi tên -->
<line stroke="#5a5a5a" stroke-width="2" marker-end="url(#arrow-claude)"/>

<!-- Hoặc sử dụng đường thẳng đơn giản không có đầu mũi tên để có giao diện sạch sẽ hơn -->
<line stroke="#5a5a5a" stroke-width="2"/>
```

## Ngữ nghĩa của Mũi tên

Sử dụng các kiểu mũi tên khác nhau để truyền đạt ý nghĩa:

| Loại luồng | Màu sắc | Đường nét | Nét đứt | Cách dùng |
|-----------|-------|--------|------|-------|
| Luồng dữ liệu chính | #5a5a5a | Nét liền 2px | Không | Đường dẫn yêu cầu/phản hồi chính |
| Ghi bộ nhớ | #5a5a5a | 2px | `5,3` | Thao tác ghi/lưu trữ |
| Đọc bộ nhớ | #5a5a5a | Nét liền 2px | Không | Lấy dữ liệu từ kho lưu trữ |
| Điều khiển/kích hoạt | #5a5a5a | 1.5px | `3,2` | Các kích hoạt sự kiện |

```xml
<!-- Mũi tên nét liền cho đọc bộ nhớ -->
<line stroke="#5a5a5a" stroke-width="2" marker-end="url(#arrow-claude)"/>

<!-- Mũi tên nét đứt cho ghi bộ nhớ -->
<line stroke="#5a5a5a" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrow-claude)"/>
```

## Nhãn Mũi tên

Nhãn mũi tên phải **mang tính kỹ thuật và cụ thể**, nằm ở giữa mũi tên:

```xml
<text x="..." y="..." fill="#5a5a5a" font-size="13" text-anchor="middle">
  store(embedding)
</text>
```

Ví dụ tốt: `query(text)`, `retrieve(top_k=5)`, `embed(768d)`, `POST /api/search`
Tránh các nhãn mơ hồ: "Process", "Send", "Get"

## Nguyên tắc Nội dung Nút

Nội dung nút phải bao gồm **các chi tiết kỹ thuật**, không chỉ là các khái niệm chung:

**Ví dụ tốt:**
- "Vector Store" → "Vector Store" + "• 768-dim embeddings" + "• Cosine similarity"
- "LLM" → "GPT-4" + "• 8K context" + "• Temperature: 0.7"
- "Memory" → "Redis Cache" + "• TTL: 5min" + "• Max: 4K tokens"

**Tránh các mô tả mơ hồ:**
- "Process data" → chỉ định cụ thể quá trình xử lý nào
- "Store information" → chỉ định cụ thể loại và định dạng lưu trữ
- "Handle requests" → chỉ định cụ thể loại yêu cầu và phương thức

Sử dụng 2-3 dòng cho mỗi nút:
1. Tên thành phần (in đậm, 16px)
2. Chi tiết kỹ thuật hoặc hiện thực (14px)
3. Tham số hoặc ràng buộc chính (14px, tùy chọn)

## Nhãn phân lớp

Đối với các kiến trúc nhiều lớp, thêm nhãn lớp ở phía bên trái:

```xml
<text x="30" y="130" fill="#6a6a6a" font-size="14" font-weight="600">Input</text>
<text x="30" y="290" fill="#6a6a6a" font-size="14" font-weight="600">Processing</text>
<text x="30" y="490" fill="#6a6a6a" font-size="14" font-weight="600">Storage</text>
```

Đặt ở vị trí trung tâm chiều dọc của mỗi lớp.

## Yêu cầu về Chú giải (Legend)

Khi sử dụng từ 2 loại hoặc màu sắc mũi tên trở lên, hãy đưa vào một phần chú giải ở góc dưới bên phải:

```xml
<!-- Hộp chú giải -->
<rect x="720" y="520" width="220" height="70" rx="8" ry="8" 
      fill="#ffffff" stroke="#4a4a4a" stroke-width="1.5"/>
<text x="735" y="540" fill="#1a1a1a" font-size="13" font-weight="600">Chú giải</text>

<!-- Các mục chú giải -->
<line x1="735" y1="555" x2="765" y2="555" stroke="#5a5a5a" stroke-width="2"/>
<text x="775" y="560" fill="#6a6a6a" font-size="12">Thao tác đọc</text>

<line x1="735" y1="570" x2="765" y2="570" stroke="#5a5a5a" stroke-width="2" stroke-dasharray="5,3"/>
<text x="775" y="575" fill="#6a6a6a" font-size="12">Thao tác ghi</text>
```

Vị trí: góc dưới bên phải, cách lề 20px.

## Nguyên tắc Bố cục

- **Khoảng cách thoáng đãng**: Tối thiểu 80px giữa các cạnh của nút
- **Căn chỉnh ngang**: các nút trong cùng một lớp phải căn chỉnh thẳng hàng một cách hoàn hảo
- **Luồng dọc**: Ưu tiên từ trên xuống dưới
- **Symmetry**: Cân đối bố cục
- **Đường vẽ sạch sẽ**: Định tuyến trực giao (thẳng đứng rồi nằm ngang hoặc ngược lại)

## Bản mẫu SVG (SVG Template)

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600" 
     width="960" height="600">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                   'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', 'Microsoft JhengHei', 'SimHei', sans-serif;
    }
  </style>
  <defs>
    <marker id="arrow-claude" markerWidth="8" markerHeight="8"
            refX="7" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="#5a5a5a"/>
    </marker>
    <filter id="shadow-soft">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#00000008"/>
    </filter>
  </defs>
  
  <!-- Nền màu kem ấm -->
  <rect width="960" height="600" fill="#f8f6f3"/>
  
  <!-- Tiêu đề (tùy chọn) -->
  <text x="480" y="40" text-anchor="middle" fill="#1a1a1a" 
        font-size="20" font-weight="700">Tiêu đề sơ đồ</text>
  
  <!-- Các nút -->
  <!-- Ví dụ nút Agent -->
  <rect x="100" y="100" width="180" height="80" rx="12" ry="12"
        fill="#9dd4c7" stroke="#4a4a4a" stroke-width="2.5" 
        filter="url(#shadow-soft)"/>
  <text x="190" y="145" text-anchor="middle" fill="#1a1a1a" 
        font-size="16" font-weight="600">Tên Agent</text>
  
  <!-- Các cạnh -->
  <line x1="190" y1="180" x2="190" y2="240" 
        stroke="#5a5a5a" stroke-width="2" marker-end="url(#arrow-claude)"/>
  <text x="210" y="215" fill="#5a5a5a" font-size="13">Publish</text>
</svg>
```

## Triết lý Thiết kế

Phong cách chính thức của Claude nhấn mạnh:
- **Sự ấm áp**: Nền màu kem, các tông màu dịu
- **Độ rõ nét**: Độ tương phản cao của văn bản, khoảng cách rộng rãi thoáng đãng
- **Sự chuyên nghiệp**: Độ dày nét vẽ nhất quán, các phần tử căn chỉnh thẳng hàng
- **Sự thân thiện**: Các góc được bo tròn, màu sắc thân thiện

Tránh:
- Bóng đổ hoặc gradient quá gắt
- Màu sắc quá bão hòa
- Độ dày nét vẽ quá mỏng (< 2px)
- Bố cục lộn xộn
