**QUAN TRỌNG: Bạn BẮT BUỘC phải hoàn thành các bước này theo thứ tự. Không nhảy cóc sang viết code ngay.**

Nếu bạn cần điền thông tin vào một biểu mẫu PDF, trước tiên hãy kiểm tra xem file PDF đó có các trường biểu mẫu điền được (fillable form fields) hay không. Chạy script này từ thư mục chứa file này:
 `python scripts/check_fillable_fields <file.pdf>`, và tùy thuộc vào kết quả, hãy chuyển đến phần "Trường điền được (Fillable fields)" hoặc "Trường không điền được (Non-fillable fields)" bên dưới và làm theo hướng dẫn tương ứng.

# Trường điền được (Fillable fields)

Nếu PDF có các trường biểu mẫu điền được:
- Chạy script này từ thư mục chứa file này: `python scripts/extract_form_field_info.py <input.pdf> <field_info.json>`. Nó sẽ tạo ra một file JSON chứa danh sách các trường theo định dạng sau:
```
[
  {
    "field_id": (ID duy nhất của trường),
    "page": (số trang, đánh số từ 1),
    "rect": ([left, bottom, right, top] hộp bao bounding box theo tọa độ PDF, với y=0 là đáy trang),
    "type": ("text", "checkbox", "radio_group", hoặc "choice"),
  },
  // Checkbox có thuộc tính "checked_value" và "unchecked_value":
  {
    "field_id": (ID duy nhất của trường),
    "page": (số trang, đánh số từ 1),
    "type": "checkbox",
    "checked_value": (Đặt trường này thành giá trị này để tích chọn checkbox),
    "unchecked_value": (Đặt trường này thành giá trị này để bỏ tích chọn checkbox),
  },
  // Radio group chứa danh sách "radio_options" với các lựa chọn khả thi.
  {
    "field_id": (ID duy nhất của trường),
    "page": (số trang, đánh số từ 1),
    "type": "radio_group",
    "radio_options": [
      {
        "value": (đặt trường này thành giá trị này để chọn tùy chọn radio này),
        "rect": (hộp bao bounding box cho nút radio tương ứng với tùy chọn này)
      },
      // Các tùy chọn radio khác
    ]
  },
  // Trường trắc nghiệm (choice) chứa danh sách "choice_options" với các lựa chọn khả thi:
  {
    "field_id": (ID duy nhất của trường),
    "page": (số trang, đánh số từ 1),
    "type": "choice",
    "choice_options": [
      {
        "value": (đặt trường này thành giá trị này để chọn tùy chọn này),
        "text": (văn bản hiển thị của tùy chọn)
      },
      // Các tùy chọn khác
    ],
  }
]
```
- Chuyển đổi PDF thành ảnh PNG (mỗi trang một ảnh) bằng script này (chạy từ thư mục chứa file này):
`python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
Sau đó phân tích hình ảnh để xác định mục đích của từng trường biểu mẫu (đảm bảo chuyển đổi tọa độ hộp bao PDF sang tọa độ hình ảnh).
- Tạo một file `field_values.json` theo định dạng sau chứa các giá trị cần điền cho từng trường:
```
[
  {
    "field_id": "last_name", // Phải khớp với field_id trích xuất từ `extract_form_field_info.py`
    "description": "Họ của người dùng",
    "page": 1, // Phải khớp với giá trị "page" trong field_info.json
    "value": "Simpson"
  },
  {
    "field_id": "Checkbox12",
    "description": "Checkbox được tích nếu người dùng từ 18 tuổi trở lên",
    "page": 1,
    "value": "/On" // Nếu là checkbox, sử dụng giá trị "checked_value" để tích chọn. Nếu là nút radio, sử dụng một trong các giá trị "value" trong "radio_options".
  },
  // các trường khác
]
```
- Chạy script `fill_fillable_fields.py` từ thư mục chứa file này để tạo ra file PDF đã điền thông tin:
`python scripts/fill_fillable_fields.py <input pdf> <field_values.json> <output pdf>`
Script này sẽ xác thực xem các ID trường và giá trị bạn cung cấp có hợp lệ hay không; nếu xuất hiện thông báo lỗi, hãy sửa lại các trường tương ứng và thử lại.

# Trường không điền được (Non-fillable fields)

Nếu file PDF không có các trường biểu mẫu điền được, bạn sẽ phải thêm các chú thích văn bản (text annotations). Trước tiên, hãy thử trích xuất tọa độ từ cấu trúc PDF (chính xác hơn), sau đó chuyển sang phương pháp ước tính trực quan bằng hình ảnh nếu cần thiết.

## Bước 1: Thử trích xuất cấu trúc trước

Chạy script này để trích xuất các nhãn văn bản, đường thẳng và checkbox cùng với tọa độ PDF chính xác của chúng:
`python scripts/extract_form_structure.py <input.pdf> form_structure.json`

Lệnh này sẽ tạo ra một file JSON chứa:
- **labels**: Mỗi phần tử văn bản kèm theo tọa độ chính xác (x0, top, x1, bottom tính theo PDF points)
- **lines**: Các đường thẳng ngang xác định ranh giới dòng
- **checkboxes**: Các hình vuông nhỏ được coi là checkbox (kèm tọa độ tâm)
- **row_boundaries**: Các vị trí đỉnh/đáy dòng được tính toán từ các đường thẳng ngang

**Kiểm tra kết quả**: Nếu file `form_structure.json` có các nhãn có ý nghĩa (phần tử văn bản tương ứng với các trường biểu mẫu), hãy sử dụng **Phương pháp A: Tọa độ dựa trên cấu trúc**. Nếu PDF là dạng quét/dạng ảnh và có ít hoặc không có nhãn văn bản, hãy sử dụng **Phương pháp B: Ước tính trực quan**.

---

## Phương pháp A: Tọa độ dựa trên cấu trúc (Ưu tiên)

Sử dụng phương pháp này khi `extract_form_structure.py` tìm thấy các nhãn văn bản trong PDF.

### A.1: Phân tích cấu trúc

Đọc file `form_structure.json` và xác định:

1. **Nhóm nhãn**: Các phần tử văn bản nằm cạnh nhau tạo nên một nhãn duy nhất (ví dụ: "Last" + "Name")
2. **Cấu trúc dòng**: Các nhãn có giá trị `top` gần giống nhau sẽ nằm trên cùng một dòng
3. **Cột nhập liệu**: Khu vực nhập liệu bắt đầu sau khi nhãn kết thúc (x0 = label.x1 + khoảng cách)
4. **Checkbox**: Sử dụng trực tiếp tọa độ checkbox trích xuất từ cấu trúc

**Hệ tọa độ**: Tọa độ PDF với y=0 ở ĐỈNH trang, y tăng dần đi xuống dưới.

### A.2: Kiểm tra các phần tử bị thiếu

Việc trích xuất cấu trúc có thể không nhận diện được tất cả các phần tử biểu mẫu. Các trường hợp phổ biến:
- **Checkbox hình tròn**: Chỉ có các hình vuông mới được nhận diện là checkbox
- **Đồ họa phức tạp**: Các yếu tố trang trí hoặc các điều khiển biểu mẫu phi tiêu chuẩn
- **Yếu tố bị mờ hoặc màu nhạt**: Có thể không trích xuất được

Nếu bạn nhìn thấy các trường biểu mẫu trên ảnh PDF nhưng không có trong `form_structure.json`, bạn cần sử dụng **phân tích trực quan** cho các trường cụ thể đó (xem "Phương pháp lai" bên dưới).

### A.3: Tạo file fields.json với tọa độ PDF

Đối với mỗi trường, hãy tính toán tọa độ nhập liệu từ cấu trúc đã trích xuất:

**Trường văn bản:**
- entry x0 = label x1 + 5 (khoảng cách nhỏ sau nhãn)
- entry x1 = x0 của nhãn tiếp theo, hoặc ranh giới dòng
- entry top = trùng với top của nhãn
- entry bottom = đường ranh giới dòng bên dưới, hoặc label bottom + chiều cao dòng (row_height)

**Checkbox:**
- Sử dụng trực tiếp tọa độ hình chữ nhật checkbox từ `form_structure.json`
- entry_bounding_box = [checkbox.x0, checkbox.top, checkbox.x1, checkbox.bottom]

Tạo file `fields.json` sử dụng `pdf_width` và `pdf_height` (biểu thị tọa độ PDF):
```json
{
  "pages": [
    {"page_number": 1, "pdf_width": 612, "pdf_height": 792}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "Trường nhập Họ",
      "field_label": "Last Name",
      "label_bounding_box": [43, 63, 87, 73],
      "entry_bounding_box": [92, 63, 260, 79],
      "entry_text": {"text": "Smith", "font_size": 10}
    },
    {
      "page_number": 1,
      "description": "Checkbox Yes cho US Citizen",
      "field_label": "Yes",
      "label_bounding_box": [260, 200, 280, 210],
      "entry_bounding_box": [285, 197, 292, 205],
      "entry_text": {"text": "X"}
    }
  ]
}
```

**Quan trọng**: Sử dụng `pdf_width`/`pdf_height` và tọa độ trực tiếp từ `form_structure.json`.

### A.4: Xác thực các hộp bao (Bounding Boxes)

Trước khi điền, hãy kiểm tra các hộp bao xem có lỗi không:
`python scripts/check_bounding_boxes.py fields.json`

Lệnh này sẽ kiểm tra các hộp bao chồng chéo nhau hoặc các hộp nhập liệu quá nhỏ so với kích thước font chữ. Hãy sửa các lỗi được báo cáo trước khi tiến hành điền.

---

## Phương pháp B: Ước tính trực quan (Dự phòng)

Sử dụng phương pháp này khi PDF là dạng quét/dạng ảnh và việc trích xuất cấu trúc không tìm thấy nhãn văn bản khả dụng (ví dụ: tất cả văn bản hiển thị dưới dạng chuỗi "(cid:X)").

### B.1: Chuyển đổi PDF thành hình ảnh

`python scripts/convert_pdf_to_images.py <input.pdf> <images_dir/>`

### B.2: Xác định trường ban đầu

Quan sát ảnh của từng trang để xác định các phần biểu mẫu và đưa ra **ước tính sơ bộ** về vị trí các trường:
- Các nhãn trường biểu mẫu và vị trí ước tính của chúng
- Vùng nhập liệu (các đường kẻ, hộp hoặc khoảng trống để nhập chữ)
- Các checkbox và vị trí ước tính của chúng

Đối với mỗi trường, ghi lại tọa độ pixel ước tính (chưa cần phải chính xác tuyệt đối).

### B.3: Thu phóng chi tiết (BẮT BUỘC để đảm bảo độ chính xác)

Đối với mỗi trường, hãy crop một vùng xung quanh vị trí ước tính để tinh chỉnh tọa độ một cách chính xác.

**Tạo ảnh crop thu phóng bằng ImageMagick:**
```bash
magick <page_image> -crop <width>x<height>+<x>+<y> +repage <crop_output.png>
```

Trong đó:
- `<x>, <y>` = góc trên bên trái của vùng crop (sử dụng vị trí ước tính sơ bộ của bạn trừ đi một khoảng đệm)
- `<width>, <height>` = kích thước của vùng crop (khu vực trường cần crop cộng thêm khoảng đệm ~50px ở mỗi cạnh)

**Ví dụ:** Để tinh chỉnh trường "Name" ước tính ở vị trí khoảng (100, 150):
```bash
magick images_dir/page_1.png -crop 300x80+50+120 +repage crops/name_field.png
```

(Lưu ý: nếu lệnh `magick` không khả dụng, hãy thử lệnh `convert` với các tham số tương tự).

**Quan sát ảnh đã crop** để xác định tọa độ chính xác:
1. Xác định pixel chính xác nơi vùng nhập liệu bắt đầu (sau nhãn)
2. Xác định nơi vùng nhập liệu kết thúc (trước trường tiếp theo hoặc mép biên)
3. Xác định đỉnh và đáy của đường/hộp nhập liệu

**Chuyển đổi tọa độ crop ngược lại tọa độ ảnh đầy đủ:**
- full_x = crop_x + crop_offset_x
- full_y = crop_y + crop_offset_y

Ví dụ: Nếu ảnh crop bắt đầu từ (50, 120) và hộp nhập liệu bắt đầu từ (52, 18) trong ảnh crop:
- entry_x0 = 52 + 50 = 102
- entry_top = 18 + 120 = 138

**Lặp lại cho từng trường**, có thể gộp các trường gần nhau vào chung một ảnh crop nếu có thể.

### B.4: Tạo file fields.json với tọa độ đã tinh chỉnh

Tạo file `fields.json` sử dụng `image_width` và `image_height` (biểu thị tọa độ hình ảnh):
```json
{
  "pages": [
    {"page_number": 1, "image_width": 1700, "image_height": 2200}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "Trường nhập Họ",
      "field_label": "Last Name",
      "label_bounding_box": [120, 175, 242, 198],
      "entry_bounding_box": [255, 175, 720, 218],
      "entry_text": {"text": "Smith", "font_size": 10}
    }
  ]
}
```

**Quan trọng**: Sử dụng `image_width`/`image_height` và tọa độ pixel đã được tinh chỉnh từ quá trình thu phóng phân tích.

### B.5: Xác thực các hộp bao (Bounding Boxes)

Trước khi điền, hãy kiểm tra các hộp bao xem có lỗi không:
`python scripts/check_bounding_boxes.py fields.json`

Lệnh này sẽ kiểm tra các hộp bao chồng chéo hoặc các hộp nhập liệu quá nhỏ so với kích thước font chữ. Hãy sửa các lỗi được báo cáo trước khi tiến hành điền.

---

## Phương pháp lai (Hybrid): Cấu trúc + Trực quan

Sử dụng phương pháp này khi việc trích xuất cấu trúc hoạt động tốt cho hầu hết các trường nhưng bỏ sót một số phần tử (ví dụ: các checkbox tròn, các điều khiển biểu mẫu đặc biệt).

1. **Sử dụng Phương pháp A** cho các trường được nhận diện trong `form_structure.json`
2. **Chuyển đổi PDF thành hình ảnh** để phân tích trực quan các trường bị thiếu
3. **Sử dụng thu phóng tinh chỉnh** (từ Phương pháp B) cho các trường bị thiếu đó
4. **Kết hợp tọa độ**: Đối với các trường từ trích xuất cấu trúc, sử dụng `pdf_width`/`pdf_height`. Đối với các trường ước tính trực quan, bạn phải chuyển đổi tọa độ hình ảnh sang tọa độ PDF:
   - pdf_x = image_x * (pdf_width / image_width)
   - pdf_y = image_y * (pdf_height / image_height)
5. **Sử dụng một hệ tọa độ duy nhất** trong `fields.json` - chuyển đổi tất cả sang tọa độ PDF với `pdf_width`/`pdf_height`

---

## Bước 2: Xác thực trước khi điền

**Luôn xác thực các hộp bao trước khi điền:**
`python scripts/check_bounding_boxes.py fields.json`

Lệnh này sẽ kiểm tra:
- Các hộp bao chồng chéo nhau (gây đè chữ lên nhau)
- Các hộp nhập quá nhỏ so với kích thước font chữ chỉ định

Hãy sửa các lỗi được phát hiện trong file `fields.json` trước khi tiếp tục.

## Bước 3: Điền biểu mẫu

Script điền biểu mẫu sẽ tự động nhận diện hệ tọa độ và xử lý việc chuyển đổi:
`python scripts/fill_pdf_form_with_annotations.py <input.pdf> fields.json <output.pdf>`

## Bước 4: Kiểm tra kết quả đầu ra

Chuyển đổi file PDF đã điền thành hình ảnh để kiểm tra vị trí hiển thị chữ:
`python scripts/convert_pdf_to_images.py <output.pdf> <verify_images/>`

Nếu chữ bị lệch vị trí:
- **Phương pháp A**: Kiểm tra xem bạn có đang sử dụng tọa độ PDF từ `form_structure.json` kèm `pdf_width`/`pdf_height` hay không.
- **Phương pháp B**: Kiểm tra xem kích thước hình ảnh có khớp không và tọa độ pixel có chính xác không.
- **Phương pháp lai**: Đảm bảo các chuyển đổi tọa độ đã chính xác cho các trường ước tính trực quan.
