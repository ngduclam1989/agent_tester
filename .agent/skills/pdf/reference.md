# Tài liệu tham khảo nâng cao về xử lý file PDF

Tài liệu này chứa các tính năng xử lý PDF nâng cao, ví dụ chi tiết và các thư viện bổ sung không được đề cập trong phần hướng dẫn kỹ năng chính.

## Thư viện pypdfium2 (Giấy phép Apache/BSD)

### Tổng quan
pypdfium2 là thư viện liên kết Python (Python binding) cho PDFium (thư viện PDF của Chromium). Thư viện này rất tốt cho việc render PDF nhanh, sinh hình ảnh từ PDF và có thể dùng thay thế cho PyMuPDF.

### Render trang PDF thành hình ảnh
```python
import pypdfium2 as pdfium
from PIL import Image

# Tải file PDF
pdf = pdfium.PdfDocument("document.pdf")

# Render trang thành hình ảnh
page = pdf[0]  # Trang đầu tiên
bitmap = page.render(
    scale=2.0,  # Độ phân giải cao hơn
    rotation=0  # Không xoay trang
)

# Chuyển đổi thành PIL Image
img = bitmap.to_pil()
img.save("page_1.png", "PNG")

# Xử lý nhiều trang
for i, page in enumerate(pdf):
    bitmap = page.render(scale=1.5)
    img = bitmap.to_pil()
    img.save(f"page_{i+1}.jpg", "JPEG", quality=90)
```

### Trích xuất văn bản bằng pypdfium2
```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    text = page.get_text()
    print(f"Trang {i+1} có độ dài văn bản: {len(text)} ký tự")
```

## Các thư viện JavaScript

### pdf-lib (Giấy phép MIT)

pdf-lib là một thư viện JavaScript mạnh mẽ để tạo và sửa đổi tài liệu PDF trong bất kỳ môi trường JavaScript nào.

#### Tải và thao tác trên file PDF hiện có
```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function manipulatePDF() {
    // Tải file PDF hiện có
    const existingPdfBytes = fs.readFileSync('input.pdf');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Lấy số trang
    const pageCount = pdfDoc.getPageCount();
    console.log(`Tài liệu có ${pageCount} trang`);

    // Thêm trang mới
    const newPage = pdfDoc.addPage([600, 400]);
    newPage.drawText('Added by pdf-lib', {
        x: 100,
        y: 300,
        size: 16
    });

    // Lưu file PDF đã sửa đổi
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('modified.pdf', pdfBytes);
}
```

#### Tạo file PDF phức tạp từ đầu
```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function createPDF() {
    const pdfDoc = await PDFDocument.create();

    // Nhúng font chữ
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Thêm trang mới
    const page = pdfDoc.addPage([595, 842]); // Khổ A4
    const { width, height } = page.getSize();

    // Thêm chữ định dạng style
    page.drawText('Invoice #12345', {
        x: 50,
        y: height - 50,
        size: 18,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.8)
    });

    // Vẽ hình chữ nhật (làm nền cho header)
    page.drawRectangle({
        x: 40,
        y: height - 100,
        width: width - 80,
        height: 30,
        color: rgb(0.9, 0.9, 0.9)
    });

    // Vẽ nội dung dạng bảng
    const items = [
        ['Item', 'Qty', 'Price', 'Total'],
        ['Widget', '2', '$50', '$100'],
        ['Gadget', '1', '$75', '$75']
    ];

    let yPos = height - 150;
    items.forEach(row => {
        let xPos = 50;
        row.forEach(cell => {
            page.drawText(cell, {
                x: xPos,
                y: yPos,
                size: 12,
                font: helveticaFont
            });
            xPos += 120;
        });
        yPos -= 25;
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('created.pdf', pdfBytes);
}
```

#### Các thao tác gộp và tách trang nâng cao
```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function mergePDFs() {
    // Tạo tài liệu mới
    const mergedPdf = await PDFDocument.create();

    // Tải các file PDF nguồn
    const pdf1Bytes = fs.readFileSync('doc1.pdf');
    const pdf2Bytes = fs.readFileSync('doc2.pdf');

    const pdf1 = await PDFDocument.load(pdf1Bytes);
    const pdf2 = await PDFDocument.load(pdf2Bytes);

    // Sao chép tất cả các trang từ PDF thứ nhất
    const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
    pdf1Pages.forEach(page => mergedPdf.addPage(page));

    // Sao chép các trang cụ thể từ PDF thứ hai (trang 0, 2, 4)
    const pdf2Pages = await mergedPdf.copyPages(pdf2, [0, 2, 4]);
    pdf2Pages.forEach(page => mergedPdf.addPage(page));

    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync('merged.pdf', mergedPdfBytes);
}
```

### pdfjs-dist (Giấy phép Apache)

PDF.js là thư viện JavaScript của Mozilla để render PDF trên trình duyệt.

#### Tải và render PDF cơ bản
```javascript
import * as pdfjsLib from 'pdfjs-dist';

// Cấu hình worker (rất quan trọng cho hiệu năng)
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.js';

async function renderPDF() {
    // Tải file PDF
    const loadingTask = pdfjsLib.getDocument('document.pdf');
    const pdf = await loadingTask.promise;

    console.log(`Đã tải PDF với ${pdf.numPages} trang`);

    // Lấy trang đầu tiên
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    // Render lên thẻ canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    await page.render(renderContext).promise;
    document.body.appendChild(canvas);
}
```

#### Trích xuất văn bản kèm theo tọa độ
```javascript
import * as pdfjsLib from 'pdfjs-dist';

async function extractText() {
    const loadingTask = pdfjsLib.getDocument('document.pdf');
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Trích xuất văn bản từ tất cả các trang
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map(item => item.str)
            .join(' ');

        fullText += `\n--- Trang ${i} ---\n${pageText}`;

        // Lấy chữ kèm tọa độ phục vụ xử lý nâng cao
        const textWithCoords = textContent.items.map(item => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
        }));
    }

    console.log(fullText);
    return fullText;
}
```

#### Trích xuất chú thích (Annotations) và Biểu mẫu
```javascript
import * as pdfjsLib from 'pdfjs-dist';

async function extractAnnotations() {
    const loadingTask = pdfjsLib.getDocument('annotated.pdf');
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();

        annotations.forEach(annotation => {
            console.log(`Loại chú thích: ${annotation.subtype}`);
            console.log(`Nội dung: ${annotation.contents}`);
            console.log(`Tọa độ: ${JSON.stringify(annotation.rect)}`);
        });
    }
}
```

## Các thao tác nâng cao bằng dòng lệnh

### Các tính năng nâng cao của poppler-utils

#### Trích xuất văn bản kèm theo tọa độ hộp bao (Bounding Box)
```bash
# Trích xuất văn bản kèm theo tọa độ hộp bao (cực kỳ quan trọng để xử lý dữ liệu cấu trúc)
pdftotext -bbox-layout document.pdf output.xml

# File XML đầu ra sẽ chứa tọa độ chính xác của từng phần tử văn bản
```

#### Chuyển đổi hình ảnh nâng cao
```bash
# Chuyển đổi thành các file ảnh PNG với độ phân giải cụ thể
pdftoppm -png -r 300 document.pdf output_prefix

# Chuyển đổi các trang cụ thể với độ phân giải rất cao
pdftoppm -png -r 600 -f 1 -l 3 document.pdf high_res_pages

# Chuyển đổi sang JPEG kèm theo tùy chọn chất lượng nén
pdftoppm -jpeg -jpegopt quality=85 -r 200 document.pdf jpeg_output
```

#### Trích xuất hình ảnh nhúng trong file PDF
```bash
# Trích xuất toàn bộ ảnh kèm siêu dữ liệu (metadata)
pdfimages -j -p document.pdf page_images

# Chỉ liệt kê thông tin ảnh mà không thực hiện giải nén
pdfimages -list document.pdf

# Trích xuất ảnh ở định dạng gốc của chúng
pdfimages -all document.pdf images/img
```

### Các tính năng nâng cao của qpdf

#### Các thao tác xử lý trang phức tạp
```bash
# Tách file PDF lớn theo nhóm trang (mỗi file N trang)
qpdf --split-pages=3 input.pdf output_group_%02d.pdf

# Trích xuất các trang cụ thể với khai báo phức tạp
qpdf input.pdf --pages input.pdf 1,3-5,8,10-end -- extracted.pdf

# Gộp các trang chỉ định từ nhiều file PDF khác nhau
qpdf --empty --pages doc1.pdf 1-3 doc2.pdf 5-7 doc3.pdf 2,4 -- combined.pdf
```

#### Tối ưu hóa và sửa lỗi file PDF
```bash
# Tối ưu hóa PDF cho web (linearize để xem trực tuyến nhanh hơn)
qpdf --linearize input.pdf optimized.pdf

# Loại bỏ các đối tượng thừa không dùng đến và tiến hành nén file
qpdf --optimize-level=all input.pdf compressed.pdf

# Thử sửa lỗi cấu trúc file PDF bị hỏng
qpdf --check input.pdf
qpdf --fix-qdf damaged.pdf repaired.pdf

# Hiển thị toàn bộ cấu trúc file PDF để gỡ lỗi (debug)
qpdf --show-all-pages input.pdf > structure.txt
```

#### Các thao tác mã hóa nâng cao
```bash
# Thêm mật khẩu bảo vệ kèm theo thiết lập phân quyền cụ thể
qpdf --encrypt user_pass owner_pass 256 --print=none --modify=none -- input.pdf encrypted.pdf

# Kiểm tra trạng thái mã hóa của file
qpdf --show-encryption encrypted.pdf

# Gỡ bỏ mật khẩu bảo vệ (yêu cầu phải cung cấp mật khẩu hiện tại)
qpdf --password=secret123 --decrypt encrypted.pdf decrypted.pdf
```

## Các kỹ thuật Python nâng cao

### Các tính năng nâng cao của pdfplumber

#### Trích xuất chữ kèm tọa độ chính xác
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]
    
    # Trích xuất toàn bộ chữ kèm tọa độ chi tiết
    chars = page.chars
    for char in chars[:10]:  # Lấy 10 ký tự đầu tiên
        print(f"Ký tự: '{char['text']}' tại tọa độ x:{char['x0']:.1f} y:{char['y0']:.1f}")
    
    # Trích xuất chữ nằm trong vùng hộp bao cụ thể (left, top, right, bottom)
    bbox_text = page.within_bbox((100, 100, 400, 200)).extract_text()
```

#### Trích xuất bảng nâng cao với cấu hình tùy chỉnh
```python
import pdfplumber
import pandas as pd

with pdfplumber.open("complex_table.pdf") as pdf:
    page = pdf.pages[0]
    
    # Trích xuất các bảng với thiết lập tùy chỉnh cho các bố cục phức tạp
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "intersection_tolerance": 15
    }
    tables = page.extract_tables(table_settings)
    
    # Gỡ lỗi trực quan (visual debug) bằng cách kết xuất ảnh bố cục bảng
    img = page.to_image(resolution=150)
    img.save("debug_layout.png")
```

### Các tính năng nâng cao của reportlab

#### Tạo bảng biểu báo cáo chuyên nghiệp
```python
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

# Dữ liệu mẫu
data = [
    ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
    ['Widgets', '120', '135', '142', '158'],
    ['Gadgets', '85', '92', '98', '105']
]

# Tạo tài liệu PDF chứa bảng
doc = SimpleDocTemplate("report.pdf")
elements = []

# Thêm tiêu đề
styles = getSampleStyleSheet()
title = Paragraph("Quarterly Sales Report", styles['Title'])
elements.append(title)

# Thiết lập style nâng cao cho bảng
table = Table(data)
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 14),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
    ('GRID', (0, 0), (-1, -1), 1, colors.black)
]))
elements.append(table)

doc.build(elements)
```

## Các luồng công việc phức tạp

### Trích xuất các hình vẽ minh họa / hình ảnh từ file PDF

#### Phương pháp 1: Sử dụng pdfimages (nhanh nhất)
```bash
# Trích xuất toàn bộ ảnh giữ nguyên chất lượng gốc
pdfimages -all document.pdf images/img
```

#### Phương pháp 2: Sử dụng pypdfium2 + Xử lý hình ảnh
```python
import pypdfium2 as pdfium
from PIL import Image
import numpy as np

def extract_figures(pdf_path, output_dir):
    pdf = pdfium.PdfDocument(pdf_path)
    
    for page_num, page in enumerate(pdf):
        # Render trang với độ phân giải cao
        bitmap = page.render(scale=3.0)
        img = bitmap.to_pil()
        
        # Chuyển đổi thành mảng numpy để xử lý ảnh
        img_array = np.array(img)
        
        # Nhận diện hình vẽ đơn giản (các vùng không phải màu trắng)
        mask = np.any(img_array != [255, 255, 255], axis=2)
        
        # Tìm các đường bao (contours) và trích xuất tọa độ bounding box
        # (Đây là mô tả tối giản - trên thực tế cần các thuật toán nhận diện tinh vi hơn)
        
        # Lưu các hình vẽ phát hiện được
        # ... logic thực hiện tùy thuộc vào nhu cầu thực tế
```

### Xử lý hàng loạt PDF kèm theo bắt lỗi (Error Handling)
```python
import os
import glob
from pypdf import PdfReader, PdfWriter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def batch_process_pdfs(input_dir, operation='merge'):
    pdf_files = glob.glob(os.path.join(input_dir, "*.pdf"))
    
    if operation == 'merge':
        writer = PdfWriter()
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    writer.add_page(page)
                logger.info(f"Đã xử lý: {pdf_file}")
            except Exception as e:
                logger.error(f"Thất bại khi xử lý file {pdf_file}: {e}")
                continue
        
        with open("batch_merged.pdf", "wb") as output:
            writer.write(output)
    
    elif operation == 'extract_text':
        for pdf_file in pdf_files:
            try:
                reader = PdfReader(pdf_file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                
                output_file = pdf_file.replace('.pdf', '.txt')
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(text)
                logger.info(f"Đã trích xuất văn bản từ: {pdf_file}")
                
            except Exception as e:
                logger.error(f"Thất bại khi trích xuất văn bản từ {pdf_file}: {e}")
                continue
```

### Cắt trang PDF nâng cao (Cropping)
```python
from pypdf import PdfWriter, PdfReader

reader = PdfReader("input.pdf")
writer = PdfWriter()

# Thiết lập giới hạn cắt trang (left, bottom, right, top tính theo points)
page = reader.pages[0]
page.mediabox.left = 50
page.mediabox.bottom = 50
page.mediabox.right = 550
page.mediabox.top = 750

writer.add_page(page)
with open("cropped.pdf", "wb") as output:
    writer.write(output)
```

## Các mẹo tối ưu hóa hiệu năng

### 1. Đối với các file PDF dung lượng lớn
- Sử dụng cách tiếp cận dạng luồng (streaming) thay vì tải toàn bộ file PDF vào bộ nhớ.
- Sử dụng lệnh dòng lệnh `qpdf --split-pages` để tách nhỏ các file lớn trước khi xử lý.
- Xử lý tuần tự từng trang bằng thư viện pypdfium2.

### 2. Đối với trích xuất văn bản
- Lệnh dòng lệnh `pdftotext -bbox-layout` là cách nhanh nhất để trích xuất văn bản thuần.
- Sử dụng thư viện `pdfplumber` nếu cần xử lý dữ liệu bảng biểu và dữ liệu cấu trúc.
- Tránh dùng `pypdf.extract_text()` cho các tài liệu quá lớn.

### 3. Đối với trích xuất hình ảnh
- Công cụ `pdfimages` chạy nhanh hơn nhiều so với việc render toàn bộ trang rồi crop ảnh.
- Sử dụng độ phân giải thấp khi cần xem trước nhanh, và độ phân giải cao cho tệp đầu ra cuối cùng.

### 4. Đối với điền biểu mẫu
- Thư viện `pdf-lib` duy trì cấu trúc biểu mẫu tốt hơn hầu hết các giải pháp thay thế khác.
- Luôn xác thực các trường biểu mẫu trước khi tiến hành điền.

### 5. Quản lý bộ nhớ
```python
# Xử lý PDF lớn theo từng đoạn nhỏ (chunks)
def process_large_pdf(pdf_path, chunk_size=10):
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    
    for start_idx in range(0, total_pages, chunk_size):
        end_idx = min(start_idx + chunk_size, total_pages)
        writer = PdfWriter()
        
        for i in range(start_idx, end_idx):
            writer.add_page(reader.pages[i])
        
        # Xử lý đoạn hiện tại
        with open(f"chunk_{start_idx//chunk_size}.pdf", "wb") as output:
            writer.write(output)
```

## Khắc phục các lỗi thường gặp

### File PDF bị mã hóa/có mật khẩu bảo vệ
```python
# Xử lý file PDF bị mã hóa
from pypdf import PdfReader

try:
    reader = PdfReader("encrypted.pdf")
    if reader.is_encrypted:
        reader.decrypt("password")
except Exception as e:
    print(f"Giải mã thất bại: {e}")
```

### File PDF bị hỏng (Corrupted PDFs)
```bash
# Sử dụng qpdf để sửa lỗi
qpdf --check corrupted.pdf
qpdf --replace-input corrupted.pdf
```

### Lỗi không trích xuất được văn bản (PDF dạng quét)
```python
# Chuyển sang dùng OCR nếu PDF là dạng quét
import pytesseract
from pdf2image import convert_from_path

def extract_text_with_ocr(pdf_path):
    images = convert_from_path(pdf_path)
    text = ""
    for i, image in enumerate(images):
        text += pytesseract.image_to_string(image)
    return text
```

## Thông tin về bản quyền và giấy phép sử dụng

- **pypdf**: Giấy phép BSD
- **pdfplumber**: Giấy phép MIT
- **pypdfium2**: Giấy phép Apache/BSD
- **reportlab**: Giấy phép BSD
- **poppler-utils**: Giấy phép GPL-2
- **qpdf**: Giấy phép Apache
- **pdf-lib**: Giấy phép MIT
- **pdfjs-dist**: Giấy phép Apache