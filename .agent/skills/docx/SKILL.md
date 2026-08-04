---
name: docx
description: "Sử dụng kỹ năng này bất cứ khi nào người dùng muốn tạo, đọc, chỉnh sửa hoặc thao tác với tài liệu Word (tệp .docx). Các trường hợp kích hoạt bao gồm: bất kỳ đề cập nào về 'Word doc', 'word document', '.docx' hoặc các yêu cầu tạo tài liệu chuyên nghiệp có định dạng như mục lục (tables of contents), tiêu đề (headings), số trang hoặc tiêu đề thư (letterheads). Đồng thời sử dụng khi trích xuất hoặc sắp xếp lại nội dung từ các tệp .docx, chèn hoặc thay thế hình ảnh trong tài liệu, thực hiện tìm kiếm và thay thế trong tài liệu Word, làm việc với theo dõi thay đổi (tracked changes) hoặc bình luận (comments), hoặc chuyển đổi nội dung thành tài liệu Word đã được trau chuốt. Nếu người dùng yêu cầu một 'báo cáo', 'bản ghi nhớ', 'thư', 'mẫu' hoặc các sản phẩm tương tự dưới dạng tệp Word hoặc .docx, hãy sử dụng kỹ năng này. KHÔNG sử dụng cho tệp PDF, bảng tính, Google Docs hoặc các tác vụ lập trình chung không liên quan đến việc tạo tài liệu."
license: Proprietary. LICENSE.txt has complete terms
---

# Tạo, chỉnh sửa và phân tích tài liệu DOCX

## Tổng quan

Một tệp .docx là một kho lưu trữ ZIP chứa các tệp XML.

## Tài liệu tham khảo nhanh

| Tác vụ | Cách tiếp cận |
|------|----------|
| Đọc/phân tích nội dung | Sử dụng `pandoc` hoặc giải nén để lấy XML thô |
| Tạo tài liệu mới | Sử dụng `docx-js` - xem phần Tạo tài liệu mới bên dưới |
| Chỉnh sửa tài liệu hiện có | Giải nén → sửa XML → đóng gói lại - xem phần Chỉnh sửa tài liệu hiện có bên dưới |

### Chuyển đổi từ .doc sang .docx

Các tệp `.doc` cũ phải được chuyển đổi trước khi chỉnh sửa:

```bash
python .agent/skills/docx/scripts/office/soffice.py --headless --convert-to docx document.doc
```

### Đọc nội dung

```bash
# Trích xuất văn bản kèm theo các thay đổi được theo dõi
pandoc --track-changes=all document.docx -o output.md

# Truy cập XML thô
python .agent/skills/docx/scripts/office/unpack.py document.docx unpacked/
```

### Chuyển đổi thành hình ảnh

```bash
python .agent/skills/docx/scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

### Chấp nhận các thay đổi được theo dõi (Tracked Changes)

Để tạo một tài liệu sạch với tất cả các thay đổi được theo dõi đã được chấp nhận (yêu cầu LibreOffice):

```bash
python .agent/skills/docx/scripts/accept_changes.py input.docx output.docx
```

---

## Tạo tài liệu mới

Tạo các tệp .docx bằng JavaScript, sau đó xác thực. Cài đặt: `npm install -g docx`

### Thiết lập
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
        InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
        PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
        TabStopType, TabStopPosition, Column, SectionType,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak } = require('docx');

const doc = new Document({ sections: [{ children: [/* nội dung */] }] });
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Xác thực
Sau khi tạo tệp, hãy xác thực nó. Nếu xác thực thất bại, hãy giải nén, sửa XML và đóng gói lại.
```bash
python .agent/skills/docx/scripts/office/validate.py doc.docx
```

### Kích thước trang

```javascript
// QUAN TRỌNG: docx-js mặc định là A4, không phải US Letter
// Luôn đặt kích thước trang một cách rõ ràng để có kết quả nhất quán
sections: [{
  properties: {
    page: {
      size: {
        width: 12240,   // 8.5 inches tính theo đơn vị DXA
        height: 15840   // 11 inches tính theo đơn vị DXA
      },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // Lề 1 inch
    }
  },
  children: [/* nội dung */]
}]
```

**Kích thước trang phổ biến (đơn vị DXA, 1440 DXA = 1 inch):**

| Khổ giấy | Chiều rộng | Chiều cao | Chiều rộng vùng nội dung (lề 1") |
|-------|-------|--------|---------------------------|
| US Letter | 12,240 | 15,840 | 9,360 |
| A4 (mặc định) | 11,906 | 16,838 | 9,026 |

**Hướng ngang (Landscape):** docx-js tự động hoán đổi chiều rộng/chiều cao ở bên trong, vì vậy hãy truyền vào kích thước của khổ dọc (portrait) và để nó tự xử lý việc hoán đổi:
```javascript
size: {
  width: 12240,   // Truyền cạnh NGẮN làm width
  height: 15840,  // Truyền cạnh DÀI làm height
  orientation: PageOrientation.LANDSCAPE  // docx-js sẽ hoán đổi chúng trong XML
},
// Chiều rộng vùng nội dung = 15840 - lề trái - lề phải (sử dụng cạnh dài)
```

### Style (Ghi đè tiêu đề tích hợp sẵn)

Sử dụng Arial làm phông chữ mặc định (được hỗ trợ rộng rãi). Giữ các tiêu đề màu đen để dễ đọc.

```javascript
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } }, // Mặc định 12pt
    paragraphStyles: [
      // QUAN TRỌNG: Sử dụng chính xác ID để ghi đè các style tích hợp sẵn
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } }, // outlineLevel bắt buộc để tạo TOC
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Tiêu đề")] }),
    ]
  }]
});
```

### Danh sách (KHÔNG BAO GIỜ sử dụng ký tự bullet unicode)

```javascript
// ❌ SAI - không bao giờ chèn các ký tự bullet một cách thủ công
new Paragraph({ children: [new TextRun("• Item")] })  // TỒI
new Paragraph({ children: [new TextRun("\u2022 Item")] })  // TỒI

// ✅ ĐÚNG - sử dụng cấu hình numbering với LevelFormat.BULLET
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Mục bullet")] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Mục đánh số")] }),
    ]
  }]
});

// ⚠️ Mỗi reference tạo ra đánh số ĐỘC LẬP
// Cùng reference = tiếp tục (1,2,3 rồi 4,5,6)
// Khác reference = bắt đầu lại (1,2,3 rồi 1,2,3)
```

### Bảng

**QUAN TRỌNG: Bảng cần thiết lập hai loại chiều rộng** - đặt cả `columnWidths` trên bảng VÀ `width` trên mỗi ô (cell). Nếu thiếu một trong hai, bảng sẽ hiển thị không chính xác trên một số nền tảng.

```javascript
// QUAN TRỌNG: Luôn đặt chiều rộng của bảng để hiển thị nhất quán
// QUAN TRỌNG: Sử dụng ShadingType.CLEAR (không phải SOLID) để tránh nền đen
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  width: { size: 9360, type: WidthType.DXA }, // Luôn sử dụng DXA (percentages bị lỗi trong Google Docs)
  columnWidths: [4680, 4680], // Tổng phải bằng chiều rộng bảng (DXA: 1440 = 1 inch)
  rows: [
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 4680, type: WidthType.DXA }, // Đặt cho từng ô
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, // CLEAR chứ không dùng SOLID
          margins: { top: 80, bottom: 80, left: 120, right: 120 }, // Khoảng đệm ô (cell padding - bên trong, không cộng thêm vào chiều rộng)
          children: [new Paragraph({ children: [new TextRun("Ô dữ liệu")] })]
        })
      ]
    })
  ]
})
```

**Tính toán chiều rộng bảng:**

Luôn sử dụng `WidthType.DXA` — `WidthType.PERCENTAGE` bị lỗi trong Google Docs.

```javascript
// Chiều rộng bảng = tổng columnWidths = chiều rộng vùng nội dung
// Khổ giấy US Letter với lề 1": 12240 - 2880 = 9360 DXA
width: { size: 9360, type: WidthType.DXA },
columnWidths: [7000, 2360]  // Tổng phải đúng bằng chiều rộng bảng
```

**Quy tắc về chiều rộng (width):**
- **Luôn sử dụng `WidthType.DXA`** — không bao giờ sử dụng `WidthType.PERCENTAGE` (không tương thích với Google Docs)
- Chiều rộng bảng phải bằng tổng của `columnWidths`
- Chiều rộng ô (`width` của cell) phải khớp với `columnWidth` tương ứng
- Lề ô (cell `margins`) là phần đệm bên trong - chúng làm giảm diện tích chứa nội dung chứ không cộng thêm vào chiều rộng ô
- Đối với bảng toàn chiều rộng (full-width): sử dụng chiều rộng vùng nội dung (chiều rộng trang trừ đi lề trái và lề phải)

### Hình ảnh

```javascript
// QUAN TRỌNG: tham số type là BẮT BUỘC
new Paragraph({
  children: [new ImageRun({
    type: "png", // Bắt buộc: png, jpg, jpeg, gif, bmp, svg
    data: fs.readFileSync("image.png"),
    transformation: { width: 200, height: 150 },
    altText: { title: "Tiêu đề", description: "Mô tả", name: "Tên" } // Cả ba đều bắt buộc
  })]
})
```

### Ngắt trang

```javascript
// QUAN TRỌNG: Ngắt trang (PageBreak) phải nằm bên trong một Paragraph
new Paragraph({ children: [new PageBreak()] })

// Hoặc sử dụng pageBreakBefore
new Paragraph({ pageBreakBefore: true, children: [new TextRun("Trang mới")] })
```

### Đường liên kết (Hyperlinks)

```javascript
// Đường liên kết ngoài
new Paragraph({
  children: [new ExternalHyperlink({
    children: [new TextRun({ text: "Click vào đây", style: "Hyperlink" })],
    link: "https://example.com",
  })]
})

// Đường liên kết nội bộ (bookmark + reference)
// 1. Tạo bookmark tại điểm đích
new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
  new Bookmark({ id: "chapter1", children: [new TextRun("Chương 1")] }),
]})
// 2. Liên kết đến bookmark đó
new Paragraph({ children: [new InternalHyperlink({
  children: [new TextRun({ text: "Xem Chương 1", style: "Hyperlink" })],
  anchor: "chapter1",
})]})
```

### Chú thích cuối trang (Footnotes)

```javascript
const doc = new Document({
  footnotes: {
    1: { children: [new Paragraph("Nguồn: Báo cáo thường niên 2024")] },
    2: { children: [new Paragraph("Xem phụ lục để biết thêm về phương pháp luận")] },
  },
  sections: [{
    children: [new Paragraph({
      children: [
        new TextRun("Doanh thu tăng trưởng 15%"),
        new FootnoteReferenceRun(1),
        new TextRun(" sử dụng các chỉ số đã được điều chỉnh"),
        new FootnoteReferenceRun(2),
      ],
    })]
  }]
});
```

### Điểm dừng Tab (Tab Stops)

```javascript
// Căn phải văn bản trên cùng một dòng (ví dụ: ngày tháng đối diện với tiêu đề)
new Paragraph({
  children: [
    new TextRun("Tên Công ty"),
    new TextRun("\tTháng 1 năm 2025"),
  ],
  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
})

// Dấu chấm dẫn đường (ví dụ: kiểu mục lục TOC)
new Paragraph({
  children: [
    new TextRun("Giới thiệu"),
    new TextRun({ children: [
      new PositionalTab({
        alignment: PositionalTabAlignment.RIGHT,
        relativeTo: PositionalTabRelativeTo.MARGIN,
        leader: PositionalTabLeader.DOT,
      }),
      "3",
    ]}),
  ],
})
```

### Bố cục nhiều cột

```javascript
// Các cột có chiều rộng bằng nhau
sections: [{
  properties: {
    column: {
      count: 2,          // số lượng cột
      space: 720,        // khoảng cách giữa các cột tính theo DXA (720 = 0.5 inch)
      equalWidth: true,
      separate: true,    // đường kẻ dọc phân cách giữa các cột
    },
  },
  children: [/* nội dung sẽ tự động tràn qua các cột */]
}]

// Các cột có chiều rộng tùy chỉnh (equalWidth phải là false)
sections: [{
  properties: {
    column: {
      equalWidth: false,
      children: [
        new Column({ width: 5400, space: 720 }),
        new Column({ width: 3240 }),
      ],
    },
  },
  children: [/* nội dung */]
}]
```

Ép buộc ngắt cột bằng một section mới sử dụng `type: SectionType.NEXT_COLUMN`.

### Mục lục (Table of Contents)

```javascript
// QUAN TRỌNG: Các tiêu đề phải CHỈ sử dụng HeadingLevel - không dùng style tùy chỉnh
new TableOfContents("Mục lục", { hyperlink: true, headingStyleRange: "1-3" })
```

### Đầu trang/Chân trang (Headers/Footers)

```javascript
sections: [{
  properties: {
    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } // 1440 = 1 inch
  },
  headers: {
    default: new Header({ children: [new Paragraph({ children: [new TextRun("Đầu trang")] })] })
  },
  footers: {
    default: new Footer({ children: [new Paragraph({
      children: [new TextRun("Trang "), new TextRun({ children: [PageNumber.CURRENT] })]
    })] })
  },
  children: [/* nội dung */]
}]
```

### Quy tắc quan trọng cho docx-js

- **Đặt kích thước trang một cách rõ ràng** - docx-js mặc định là A4; sử dụng US Letter (12240 x 15840 DXA) cho tài liệu US
- **Khổ ngang: truyền kích thước khổ dọc** - docx-js tự hoán đổi chiều rộng/chiều cao ở bên trong; truyền cạnh ngắn làm `width`, cạnh dài làm `height` và đặt `orientation: PageOrientation.LANDSCAPE`
- **Không bao giờ sử dụng `\n`** - hãy sử dụng các phần tử Paragraph riêng biệt
- **Không bao giờ sử dụng bullet unicode** - hãy sử dụng `LevelFormat.BULLET` với cấu hình numbering
- **PageBreak phải nằm trong Paragraph** - nếu đứng riêng lẻ sẽ tạo ra XML không hợp lệ
- **ImageRun yêu cầu tham số `type`** - luôn chỉ định png/jpg/v.v.
- **Luôn đặt chiều rộng bảng bằng DXA** - không bao giờ sử dụng `WidthType.PERCENTAGE` (bị lỗi trong Google Docs)
- **Bảng cần chiều rộng kép** - mảng `columnWidths` VÀ `width` của ô phải khớp nhau và bằng nhau
- **Chiều rộng bảng = tổng của `columnWidths`** - đối với DXA, hãy đảm bảo chúng cộng lại chính xác
- **Luôn thêm lề cho ô** - sử dụng `margins: { top: 80, bottom: 80, left: 120, right: 120 }` để có khoảng đệm dễ đọc
- **Sử dụng `ShadingType.CLEAR`** - không bao giờ dùng SOLID cho màu nền bảng
- **Không bao giờ sử dụng bảng làm đường chia/đường kẻ** - các ô có chiều cao tối thiểu và hiển thị dưới dạng các hộp trống (bao gồm cả trong đầu/chân trang); thay vào đó hãy sử dụng `border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } }` trên Paragraph. Đối với chân trang hai cột, hãy sử dụng điểm dừng tab (xem phần Điểm dừng Tab), không dùng bảng
- **TOC chỉ yêu cầu HeadingLevel** - không dùng style tùy chỉnh trên các đoạn tiêu đề
- **Ghi đè các style tích hợp sẵn** - sử dụng chính xác ID: "Heading1", "Heading2", v.v.
- **Bao gồm `outlineLevel`** - bắt buộc đối với TOC (0 cho H1, 1 cho H2, v.v.)

---

## Chỉnh sửa tài liệu hiện có

**Lần lượt làm theo cả 3 bước dưới đây.**

### Bước 1: Giải nén (Unpack)
```bash
python .agent/skills/docx/scripts/office/unpack.py document.docx unpacked/
```
Giải nén XML, định dạng đẹp (pretty-prints), hợp nhất các run liền kề và chuyển đổi các dấu ngoặc kép thông minh thành các thực thể XML (`&#x201C;` v.v.) để giữ nguyên khi chỉnh sửa. Sử dụng `--merge-runs false` để bỏ qua việc hợp nhất run.

### Bước 2: Chỉnh sửa XML

Chỉnh sửa các tệp trong `unpacked/word/`. Xem phần Tham chiếu XML bên dưới để biết các mẫu.

**Sử dụng "Claude" làm tác giả** cho các thay đổi và nhận xét được theo dõi (tracked changes & comments), trừ khi người dùng yêu cầu rõ ràng sử dụng một tên khác.

**Sử dụng trực tiếp công cụ chỉnh sửa để thay thế chuỗi. Không viết tập lệnh Python.** Tập lệnh gây ra sự phức tạp không cần thiết. Công cụ chỉnh sửa hiển thị chính xác những gì đang được thay thế.

**QUAN TRỌNG: Sử dụng dấu ngoặc kép thông minh cho nội dung mới.** Khi thêm văn bản có dấu nháy đơn hoặc dấu ngoặc kép, hãy sử dụng các thực thể XML để tạo ra dấu ngoặc kép thông minh:
```xml
<!-- Sử dụng các thực thể này để có kiểu chữ chuyên nghiệp -->
<w:t>Here&#x2019;s a quote: &#x201C;Hello&#x201D;</w:t>
```
| Thực thể XML | Ký tự tương ứng |
|--------|-----------|
| `&#x2018;` | ‘ (nháy đơn mở) |
| `&#x2019;` | ’ (nháy đơn đóng / dấu nháy lửng) |
| `&#x201C;` | “ (ngoặc kép mở) |
| `&#x201D;` | ” (ngoặc kép đóng) |

**Thêm bình luận (comments):** Sử dụng `comment.py` để xử lý boilerplate trên nhiều tệp XML (văn bản phải là XML được escape trước):
```bash
python .agent/skills/docx/scripts/comment.py unpacked/ 0 "Comment text with &amp; and &#x2019;"
python .agent/skills/docx/scripts/comment.py unpacked/ 1 "Reply text" --parent 0  # trả lời cho comment 0
python .agent/skills/docx/scripts/comment.py unpacked/ 0 "Text" --author "Custom Author"  # tên tác giả tùy chỉnh
```
Sau đó thêm các thẻ đánh dấu vào document.xml (xem phần Bình luận trong Tham chiếu XML).

### Bước 3: Đóng gói (Pack)
```bash
python .agent/skills/docx/scripts/office/pack.py unpacked/ output.docx --original document.docx
```
Xác thực với tính năng tự động sửa lỗi, nén XML và tạo tệp DOCX. Sử dụng `--validate false` để bỏ qua.

**Tính năng tự động sửa lỗi sẽ khắc phục:**
- `durableId` >= 0x7FFFFFFF (tạo lại ID hợp lệ)
- Thiếu `xml:space="preserve"` trên `<w:t>` có chứa khoảng trắng

**Tính năng tự động sửa lỗi sẽ KHÔNG khắc phục:**
- XML bị lỗi cú pháp, lồng ghép phần tử không hợp lệ, thiếu quan hệ (relationships), vi phạm schema

### Các cạm bẫy thường gặp

- **Thay thế toàn bộ phần tử `<w:r>`**: Khi thêm các thay đổi được theo dõi, hãy thay thế toàn bộ khối `<w:r>...</w:r>` bằng các phần tử đồng cấp `<w:del>...<w:ins>...`. Không chèn các thẻ thay đổi được theo dõi bên trong một run.
- **Giữ nguyên định dạng `<w:rPr>`**: Sao chép khối `<w:rPr>` của run gốc vào các run thay đổi được theo dõi để duy trì kiểu in đậm, cỡ chữ, v.v.

---

## Tham chiếu XML

### Tuân thủ Schema

- **Thứ tự các phần tử trong `<w:pPr>`**: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` cuối cùng
- **Khoảng trắng**: Thêm `xml:space="preserve"` vào `<w:t>` có chứa khoảng trắng ở đầu hoặc ở cuối
- **RSID**: Phải là hệ thập lục phân 8 chữ số (ví dụ: `00AB1234`)

### Theo dõi thay đổi (Tracked Changes)

**Chèn (Insertion):**
```xml
<w:ins w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>inserted text</w:t></w:r>
</w:ins>
```

**Xóa (Deletion):**
```xml
<w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
```

**Bên trong `<w:del>`**: Sử dụng `<w:delText>` thay vì `<w:t>`, và `<w:delInstrText>` thay vì `<w:instrText>`.

**Chỉnh sửa tối thiểu** - chỉ đánh dấu những gì thay đổi:
```xml
<!-- Đổi "30 days" thành "60 days" -->
<w:r><w:t>The term is </w:t></w:r>
<w:del w:id="1" w:author="Claude" w:date="...">
  <w:r><w:delText>30</w:delText></w:r>
</w:del>
<w:ins w:id="2" w:author="Claude" w:date="...">
  <w:r><w:t>60</w:t></w:r>
</w:ins>
<w:r><w:t> days.</w:t></w:r>
```

**Xóa toàn bộ đoạn văn/mục danh sách** - khi xóa TOÀN BỘ nội dung khỏi một đoạn văn, hãy đánh dấu cả ký hiệu đoạn văn là đã xóa để nó hợp nhất với đoạn văn tiếp theo. Thêm `<w:del/>` bên trong `<w:pPr><w:rPr>`:
```xml
<w:p>
  <w:pPr>
    <w:numPr>...</w:numPr>  <!-- danh sách numbering nếu có -->
    <w:rPr>
      <w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z"/>
    </w:rPr>
  </w:pPr>
  <w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
    <w:r><w:delText>Entire paragraph content being deleted...</w:delText></w:r>
  </w:del>
</w:p>
```
Nếu không có `<w:del/>` trong `<w:pPr><w:rPr>`, việc chấp nhận các thay đổi sẽ để lại một đoạn văn/mục danh sách trống.

**Từ Chi từ chối nội dung chèn của tác giả khác** - lồng hành động xóa bên trong hành động chèn của họ:
```xml
<w:ins w:author="Jane" w:id="5">
  <w:del w:author="Claude" w:id="10">
    <w:r><w:delText>their inserted text</w:delText></w:r>
  </w:del>
</w:ins>
```

**Khôi phục nội dung xóa của tác giả khác** - thêm hành động chèn vào phía sau (không sửa đổi hành động xóa của họ):
```xml
<w:del w:author="Jane" w:id="5">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
<w:ins w:author="Claude" w:id="10">
  <w:r><w:t>deleted text</w:t></w:r>
</w:ins>
```

### Bình luận (Comments)

Sau khi chạy `comment.py` (xem Bước 2), hãy thêm các điểm đánh dấu vào document.xml. Đối với câu trả lời, hãy sử dụng cờ `--parent` và lồng các điểm đánh dấu bên trong điểm đánh dấu cha.

**QUAN TRỌNG: `<w:commentRangeStart>` và `<w:commentRangeEnd>` là các phần tử đồng cấp của `<w:r>`, không bao giờ nằm bên trong `<w:r>`.**

```xml
<!-- Thẻ đánh dấu bình luận là con trực tiếp của w:p, không bao giờ nằm trong w:r -->
<w:commentRangeStart w:id="0"/>
<w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted</w:delText></w:r>
</w:del>
<w:r><w:t> more text</w:t></w:r>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>

<!-- Bình luận 0 với câu trả lời 1 được lồng bên trong -->
<w:commentRangeStart w:id="0"/>
  <w:commentRangeStart w:id="1"/>
  <w:r><w:t>text</w:t></w:r>
  <w:commentRangeEnd w:id="1"/>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="1"/></w:r>
```

### Hình ảnh

1. Thêm tệp hình ảnh vào `word/media/`
2. Thêm quan hệ (relationship) vào `word/_rels/document.xml.rels`:
```xml
<Relationship Id="rId5" Type=".../image" Target="media/image1.png"/>
```
3. Thêm content type vào `[Content_Types].xml`:
```xml
<Default Extension="png" ContentType="image/png"/>
```
4. Tham chiếu trong document.xml:
```xml
<w:drawing>
  <wp:inline>
    <wp:extent cx="914400" cy="914400"/>  <!-- Đơn vị EMU: 914400 = 1 inch -->
    <a:graphic>
      <a:graphicData uri=".../picture">
        <pic:pic>
          <pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill>
        </pic:pic>
      </a:graphicData>
    </a:graphic>
  </wp:inline>
</w:drawing>
```

---

## Các thư viện phụ thuộc

- **pandoc**: Trích xuất văn bản
- **docx**: `npm install -g docx` (tạo tài liệu mới)
- **LibreOffice**: Chuyển đổi PDF (tự động cấu hình cho môi trường sandbox thông qua `.agent/skills/docx/scripts/office/soffice.py`)
- **Poppler**: `pdftoppm` để xuất hình ảnh
