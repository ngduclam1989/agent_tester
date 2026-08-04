---
name: pdf
description: "Sử dụng kỹ năng này bất cứ khi nào người dùng muốn thao tác với các file PDF. Bao gồm đọc hoặc trích xuất văn bản/bảng biểu từ PDF, kết hợp hoặc gộp nhiều file PDF làm một, tách file PDF, xoay trang, thêm đóng dấu bản quyền (watermark), tạo file PDF mới, điền các biểu mẫu PDF, mã hóa/giải mã PDF, trích xuất hình ảnh và chạy OCR trên các file PDF dạng quét để có thể tìm kiếm được. Sử dụng kỹ năng này nếu người dùng đề cập đến file .pdf hoặc yêu cầu tạo ra file PDF."
license: Proprietary. LICENSE.txt has complete terms
---

# Hướng dẫn xử lý file PDF

## Tổng quan

Hướng dẫn này bao gồm các thao tác xử lý PDF cơ bản bằng thư viện Python và các công cụ dòng lệnh. Để xem các tính năng nâng cao, thư viện JavaScript và các ví dụ chi tiết, vui lòng xem tệp [REFERENCE.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/reference.md). Nếu bạn cần điền thông tin vào biểu mẫu PDF, vui lòng đọc tệp [FORMS.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/forms.md) và làm theo hướng dẫn.

## Khởi động nhanh

```python
from pypdf import PdfReader, PdfWriter

# Đọc một file PDF
reader = PdfReader("document.pdf")
print(f"Số trang: {len(reader.pages)}")

# Trích xuất văn bản
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Các thư viện Python

### pypdf - Các thao tác cơ bản

#### Gộp các file PDF
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Tách file PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Trích xuất siêu dữ liệu (Metadata)
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Tiêu đề: {meta.title}")
print(f"Tác giả: {meta.author}")
print(f"Chủ đề: {meta.subject}")
print(f"Công cụ tạo: {meta.creator}")
```

#### Xoay trang PDF
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Xoay 90 độ theo chiều kim đồng hồ
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Trích xuất văn bản và bảng biểu

#### Trích xuất văn bản giữ nguyên bố cục
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Trích xuất bảng biểu
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Bảng {j+1} trên trang {i+1}:")
            for row in table:
                print(row)
```

#### Trích xuất bảng nâng cao (Xuất ra Excel)
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # Kiểm tra bảng không trống
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# Gộp tất cả các bảng lại
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab - Tạo file PDF mới

#### Tạo PDF cơ bản
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# Thêm chữ
c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")

# Vẽ một đường thẳng
c.line(100, height - 140, 400, height - 140)

# Lưu file
c.save()
```

#### Tạo PDF nhiều trang
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Thêm nội dung
title = Paragraph("Report Title", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

# Trang 2
story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

# Build PDF
doc.build(story)
```

#### Chỉ số dưới (Subscripts) và Chỉ số trên (Superscripts)

**LƯU Ý QUAN TRỌNG**: Tuyệt đối không sử dụng các ký tự chỉ số dưới/chỉ số trên dạng Unicode (₀₁₂₃₄₅₆₇₈₉, ⁰¹²³⁴⁵⁶⁷⁸⁹) trong file PDF tạo bằng ReportLab. Các font chữ tích hợp sẵn không chứa các ký tự này, khiến chúng hiển thị thành các hộp đen đặc khi render.

Thay vào đó, hãy sử dụng các thẻ XML markup của ReportLab trong các đối tượng `Paragraph`:
```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()

# Chỉ số dưới (Subscripts): dùng thẻ <sub>
chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])

# Chỉ số trên (Superscripts): dùng thẻ <super>
squared = Paragraph("x<super>2</super> + y<super>2</super>", styles['Normal'])
```

Đối với văn bản vẽ trực tiếp trên canvas (không phải đối tượng `Paragraph`), hãy điều chỉnh kích thước font và tọa độ hiển thị một cách thủ công thay vì sử dụng ký tự Unicode chỉ số dưới/chỉ số trên.

## Các công cụ dòng lệnh

### pdftotext (thuộc bộ poppler-utils)
```bash
# Trích xuất văn bản
pdftotext input.pdf output.txt

# Trích xuất văn bản giữ nguyên bố cục
pdftotext -layout input.pdf output.txt

# Trích xuất các trang cụ thể
pdftotext -f 1 -l 5 input.pdf output.txt  # Trang 1-5
```

### qpdf
```bash
# Gộp các file PDF
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Tách các trang cụ thể
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf

# Xoay trang PDF
qpdf input.pdf output.pdf --rotate=+90:1  # Xoay trang 1 đi 90 độ

# Gỡ bỏ mật khẩu
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

### pdftk (nếu có sẵn)
```bash
# Gộp
pdftk file1.pdf file2.pdf cat output merged.pdf

# Tách nhỏ
pdftk input.pdf burst

# Xoay trang
pdftk input.pdf rotate 1east output rotated.pdf
```

## Các tác vụ thường gặp

### Trích xuất văn bản từ PDF dạng quét (Scanned PDF)
```python
# Yêu cầu cài đặt: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

# Chuyển đổi PDF thành các file ảnh
images = convert_from_path('scanned.pdf')

# Chạy OCR cho từng trang
text = ""
for i, image in enumerate(images):
    text += f"Trang {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### Thêm watermark (Đóng dấu bản quyền)
```python
from pypdf import PdfReader, PdfWriter

# Tải trang đóng dấu (hoặc tạo mới)
watermark = PdfReader("watermark.pdf").pages[0]

# Áp dụng cho tất cả các trang
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Trích xuất hình ảnh từ PDF
```bash
# Sử dụng công cụ pdfimages (thuộc bộ poppler-utils)
pdfimages -j input.pdf output_prefix

# Lệnh này sẽ xuất toàn bộ ảnh dưới dạng output_prefix-000.jpg, output_prefix-001.jpg, v.v.
```

### Bảo vệ bằng mật khẩu
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Thêm mật khẩu bảo vệ
writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## Tài liệu tham khảo nhanh

| Nhiệm vụ | Công cụ tốt nhất | Lệnh / Mã nguồn |
|------|-----------|--------------|
| Gộp file PDF | pypdf | `writer.add_page(page)` |
| Tách file PDF | pypdf | Ghi mỗi trang ra một file |
| Trích xuất văn bản | pdfplumber | `page.extract_text()` |
| Trích xuất bảng | pdfplumber | `page.extract_tables()` |
| Tạo file PDF mới | reportlab | Canvas hoặc Platypus |
| Gộp bằng dòng lệnh | qpdf | `qpdf --empty --pages ...` |
| OCR PDF dạng quét | pytesseract | Chuyển đổi thành hình ảnh trước |
| Điền biểu mẫu PDF | pdf-lib hoặc pypdf | Xem hướng dẫn [FORMS.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/forms.md) |

## Các bước tiếp theo

- Để xem cách sử dụng pypdfium2 nâng cao, xem tệp [REFERENCE.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/reference.md).
- Để xem cách sử dụng các thư viện JavaScript (pdf-lib), xem tệp [REFERENCE.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/reference.md).
- Nếu bạn cần điền thông tin vào biểu mẫu PDF, hãy làm theo hướng dẫn trong tệp [FORMS.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/forms.md).
- Để xem hướng dẫn khắc phục sự cố, xem tệp [REFERENCE.md](file:///f:/lam_demo/antigravity-testing-kit/.agent/skills/pdf/reference.md).
