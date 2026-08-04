---
name: xlsx
description: "Sử dụng kỹ năng này bất kỳ lúc nào tệp bảng tính là đầu vào hoặc đầu ra chính. Điều này bao gồm bất kỳ tác vụ nào mà người dùng muốn: mở, đọc, chỉnh sửa hoặc sửa một tệp .xlsx, .xlsm, .csv hoặc .tsv hiện có (ví dụ: thêm cột, tính toán công thức, định dạng, vẽ biểu đồ, làm sạch dữ liệu lộn xộn); tạo một bảng tính mới từ đầu hoặc từ các nguồn dữ liệu khác; hoặc chuyển đổi giữa các định dạng tệp dạng bảng. Kích hoạt đặc biệt là khi người dùng tham chiếu một tệp bảng tính bằng tên hoặc đường dẫn — thậm chí là đề cập thông thường (như \"tệp xlsx trong thư mục tải xuống của tôi\") — và muốn thực hiện một hành động nào đó trên đó hoặc tạo ra từ đó. Đồng thời kích hoạt để làm sạch hoặc tái cấu trúc các tệp dữ liệu dạng bảng lộn xộn (các hàng bị lỗi, các tiêu đề bị đặt sai chỗ, dữ liệu rác) thành các bảng tính thích hợp. Kết quả bàn giao phải là một tệp bảng tính. KHÔNG kích hoạt khi kết quả bàn giao chính là một tài liệu Word, báo cáo HTML, tập lệnh Python độc lập, đường ống cơ sở dữ liệu hoặc tích hợp Google Sheets API, ngay cả khi có liên quan đến dữ liệu dạng bảng."
license: Proprietary. LICENSE.txt has complete terms
---

# Yêu cầu đối với đầu ra

## Tất cả các tệp Excel

### Phông chữ chuyên nghiệp
- Sử dụng phông chữ chuyên nghiệp, nhất quán (ví dụ: Arial, Times New Roman) cho tất cả các sản phẩm bàn giao trừ khi có hướng dẫn khác từ người dùng

### Không có lỗi công thức
- Mọi mô hình Excel BẮT BUỘC phải được bàn giao với KHÔNG lỗi công thức (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)

### Giữ nguyên các bản mẫu hiện có (khi cập nhật bản mẫu)
- Nghiên cứu và khớp CHÍNH XÁC định dạng, phong cách và quy ước hiện có khi sửa đổi tệp
- Không bao giờ áp đặt định dạng chuẩn hóa lên các tệp đã có sẵn mẫu thiết lập
- Các quy ước của bản mẫu hiện có LUÔN LUÔN ghi đè các nguyên tắc này

## Các mô hình tài chính

### Tiêu chuẩn mã hóa màu sắc
Trừ khi có quy định khác của người dùng hoặc bản mẫu hiện có:

#### Quy ước màu sắc tiêu chuẩn ngành
- **Văn bản màu xanh lam (RGB: 0,0,255)**: Các dữ liệu đầu vào được nhập cứng (hardcoded inputs) và các con số người dùng sẽ thay đổi cho các kịch bản
- **Văn bản màu đen (RGB: 0,0,0)**: TẤT CẢ các công thức và phép tính
- **Văn bản màu xanh lá cây (RGB: 0,128,0)**: Các liên kết lấy dữ liệu từ các trang tính (worksheets) khác trong cùng một tệp (workbook)
- **Văn bản màu đỏ (RGB: 255,0,0)**: Các liên kết ngoài trỏ đến các tệp khác
- **Nền màu vàng (RGB: 255,255,0)**: Các giả định quan trọng cần chú ý hoặc các ô cần được cập nhật

### Tiêu chuẩn định dạng số

#### Quy tắc định dạng bắt buộc
- **Năm**: Định dạng dưới dạng chuỗi văn bản (ví dụ: "2024" chứ không phải "2.024")
- **Tiền tệ**: Sử dụng định dạng $#,##0; LUÔN LUÔN chỉ định đơn vị trong phần tiêu đề ("Revenue ($mm)")
- **Số không (0)**: Sử dụng định dạng số để hiển thị tất cả các số không thành dấu "-", bao gồm cả tỷ lệ phần trăm (ví dụ: "$#,##0;($#,##0);-")
- **Tỷ lệ phần trăm**: Mặc định định dạng 0.0% (một chữ số thập phân)
- **Hệ số nhân (Multiples)**: Định dạng dưới dạng 0.0x cho các hệ số nhân định giá (EV/EBITDA, P/E)
- **Số âm**: Sử dụng dấu ngoặc đơn (123) chứ không phải dấu trừ -123

### Quy tắc xây dựng công thức

#### Vị trí đặt giả định
- Đặt TẤT CẢ các giả định (tỷ lệ tăng trưởng, biên lợi nhuận, hệ số nhân, v.v.) trong các ô giả định riêng biệt
- Sử dụng các tham chiếu ô thay vì các giá trị nhập cứng trong công thức
- Ví dụ: Sử dụng =B5*(1+$B$6) thay vì =B5*1.05

#### Ngăn ngừa lỗi công thức
- Xác minh tất cả các tham chiếu ô là chính xác
- Kiểm tra các lỗi lệch một đơn vị (off-by-one) trong các vùng dữ liệu (ranges)
- Đảm bảo các công thức nhất quán trong tất cả các kỳ dự báo
- Kiểm tra với các trường hợp biên (giá trị bằng không, số âm)
- Xác minh không có tham chiếu vòng (circular references) ngoài ý muốn

#### Yêu cầu tài liệu đối với dữ liệu nhập cứng (Hardcodes)
- Viết bình luận (comment) hoặc ghi chú ở ô bên cạnh (nếu ở cuối bảng). Định dạng: "Source: [Hệ thống/Tài liệu], [Ngày], [Tham chiếu cụ thể], [URL nếu có]"
- Ví dụ:
  - "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"
  - "Source: Company 10-Q, Q2 2025, Exhibit 99.1, [SEC EDGAR URL]"
  - "Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity"
  - "Source: FactSet, 8/20/2025, Consensus Estimates Screen"

# Tạo, chỉnh sửa và phân tích XLSX

## Tổng quan

Người dùng có thể yêu cầu bạn tạo, chỉnh sửa hoặc phân tích nội dung của tệp .xlsx. Bạn có các công cụ và quy trình làm việc khác nhau cho các tác vụ khác nhau.

## Yêu cầu quan trọng

**Yêu cầu LibreOffice để tính toán lại công thức**: Bạn có thể giả định rằng LibreOffice đã được cài đặt để tính toán lại các giá trị công thức bằng tập lệnh `.agent/skills/xlsx/scripts/recalc.py`. Tập lệnh tự động cấu hình LibreOffice trong lần chạy đầu tiên, bao gồm cả trong môi trường sandbox nơi các socket Unix bị hạn chế (được xử lý bởi `.agent/skills/xlsx/scripts/office/soffice.py`)

## Đọc và phân tích dữ liệu

### Phân tích dữ liệu bằng pandas
Để phân tích dữ liệu, trực quan hóa và thực hiện các thao tác cơ bản, hãy sử dụng **pandas** để cung cấp khả năng xử lý dữ liệu mạnh mẽ:

```python
import pandas as pd

# Đọc Excel
df = pd.read_excel('file.xlsx')  # Mặc định: sheet đầu tiên
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # Tất cả các sheet dưới dạng dict

# Phân tích
df.head()      # Xem trước dữ liệu
df.info()      # Thông tin các cột
df.describe()  # Thống kê mô tả

# Ghi Excel
df.to_excel('output.xlsx', index=False)
```

## Quy trình làm việc với tệp Excel

## QUAN TRỌNG: Sử dụng công thức, không nhập cứng giá trị

**Luôn sử dụng công thức Excel thay vì tính toán giá trị trong Python rồi nhập cứng chúng vào.** Điều này đảm bảo trang tính luôn động và có thể cập nhật.

### ❌ SAI - Nhập cứng giá trị đã tính toán
```python
# Tồi: Tính toán trong Python và nhập cứng kết quả
total = df['Sales'].sum()
sheet['B10'] = total  # Nhập cứng 5000

# Tồi: Tính tỷ lệ tăng trưởng trong Python
growth = (df.iloc[-1]['Revenue'] - df.iloc[0]['Revenue']) / df.iloc[0]['Revenue']
sheet['C5'] = growth  # Nhập cứng 0.15

# Tồi: Tính trung bình bằng Python
avg = sum(values) / len(values)
sheet['D20'] = avg  # Nhập cứng 42.5
```

### ✅ ĐÚNG - Sử dụng công thức Excel
```python
# Tốt: Để Excel tự tính tổng
sheet['B10'] = '=SUM(B2:B9)'

# Tốt: Tỷ lệ tăng trưởng dưới dạng công thức Excel
sheet['C5'] = '=(C4-C2)/C2'

# Tốt: Tính trung bình sử dụng hàm Excel
sheet['D20'] = '=AVERAGE(D2:D19)'
```

Quy tắc này áp dụng cho TẤT CẢ các tính toán - tổng số, tỷ lệ phần trăm, tỷ lệ, chênh lệch, v.v. Bảng tính sẽ tự động tính toán lại khi dữ liệu nguồn thay đổi.

## Quy trình làm việc phổ biến
1. **Chọn công cụ**: pandas cho dữ liệu, openpyxl cho công thức/định dạng
2. **Tạo/Tải**: Tạo một workbook mới hoặc tải một tệp hiện có
3. **Sửa đổi**: Thêm/chỉnh sửa dữ liệu, công thức và định dạng
4. **Lưu**: Ghi vào tệp
5. **Tính toán lại công thức (BẮT BUỘC NẾU DÙNG CÔNG THỨC)**: Sử dụng tập lệnh .agent/skills/xlsx/scripts/recalc.py
   ```bash
   python .agent/skills/xlsx/scripts/recalc.py output.xlsx
   ```
6. **Xác minh và sửa bất kỳ lỗi nào**: 
   - Tập lệnh trả về chuỗi JSON chứa chi tiết lỗi
   - Nếu `status` là `errors_found`, hãy kiểm tra `error_summary` để biết các loại lỗi và vị trí cụ thể
   - Sửa các lỗi được xác định và tính toán lại một lần nữa
   - Các lỗi phổ biến cần khắc phục:
     - `#REF!`: Tham chiếu ô không hợp lệ
     - `#DIV/0!`: Lỗi chia cho không
     - `#VALUE!`: Sai kiểu dữ liệu trong công thức
     - `#NAME?`: Tên công thức không được nhận diện

### Tạo tệp Excel mới

```python
# Sử dụng openpyxl cho các công thức và định dạng
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# Thêm dữ liệu
sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])

# Thêm công thức
sheet['B2'] = '=SUM(A1:A10)'

# Định dạng
sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# Độ rộng cột
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

### Chỉnh sửa tệp Excel hiện có

```python
# Sử dụng openpyxl để bảo toàn các công thức và định dạng
from openpyxl import load_workbook

# Tải tệp hiện có
wb = load_workbook('existing.xlsx')
sheet = wb.active  # hoặc wb['SheetName'] cho một sheet cụ thể

# Làm việc với nhiều sheet
for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    print(f"Sheet: {sheet_name}")

# Sửa đổi các ô
sheet['A1'] = 'New Value'
sheet.insert_rows(2)  # Chèn hàng tại vị trí 2
sheet.delete_cols(3)  # Xóa cột 3

# Thêm sheet mới
new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

## Tính toán lại công thức

Các tệp Excel được tạo hoặc sửa đổi bằng openpyxl chỉ chứa các công thức dưới dạng chuỗi chứ không có giá trị đã tính toán. Sử dụng tập lệnh `.agent/skills/xlsx/scripts/recalc.py` được cung cấp để tính toán lại công thức:

```bash
python .agent/skills/xlsx/scripts/recalc.py <excel_file> [timeout_seconds]
```

Ví dụ:
```bash
python .agent/skills/xlsx/scripts/recalc.py output.xlsx 30
```

Tập lệnh thực hiện:
- Tự động thiết lập macro LibreOffice trong lần chạy đầu tiên
- Tính toán lại tất cả các công thức trong tất cả các sheet
- Quét TẤT CẢ các ô để tìm lỗi Excel (#REF!, #DIV/0!, v.v.)
- Trả về chuỗi JSON chi tiết vị trí và số lượng lỗi
- Hoạt động trên cả Linux và macOS

## Danh sách kiểm tra xác minh công thức

Kiểm tra nhanh để đảm bảo công thức hoạt động chính xác:

### Xác minh thiết yếu
- [ ] **Thử nghiệm 2-3 tham chiếu mẫu**: Xác minh chúng kéo đúng giá trị trước khi xây dựng mô hình đầy đủ
- [ ] **Ánh xạ cột**: Xác nhận các cột Excel khớp nhau (ví dụ: cột 64 = BL, không phải BK)
- [ ] **Độ lệch hàng**: Lưu ý rằng các hàng trong Excel bắt đầu từ 1 (hàng DataFrame 5 = hàng Excel 6)

### Các cạm bẫy phổ biến
- [ ] **Xử lý NaN**: Kiểm tra các giá trị null bằng `pd.notna()`
- [ ] **Các cột bên phải ngoài cùng**: Dữ liệu năm tài chính (FY) thường ở các cột 50+ 
- [ ] **Nhiều kết quả trùng khớp**: Tìm kiếm tất cả các kết quả xuất hiện, không chỉ kết quả đầu tiên
- [ ] **Chia cho không**: Kiểm tra mẫu số trước khi sử dụng phép chia `/` trong công thức (#DIV/0!)
- [ ] **Sai tham chiếu**: Xác minh tất cả các tham chiếu ô trỏ đúng đến ô mong muốn (#REF!)
- [ ] **Tham chiếu chéo sheet**: Sử dụng đúng định dạng (Sheet1!A1) để liên kết các sheet

### Chiến lược kiểm thử công thức
- [ ] **Bắt đầu ở quy mô nhỏ**: Kiểm tra công thức trên 2-3 ô trước khi áp dụng rộng rãi
- [ ] **Xác minh các phụ thuộc**: Kiểm tra xem tất cả các ô được tham chiếu trong công thức đều tồn tại
- [ ] **Kiểm tra các trường hợp biên**: Bao gồm các giá trị bằng không, số âm và các giá trị rất lớn

### Giải thích đầu ra của .agent/skills/xlsx/scripts/recalc.py
Tập lệnh trả về JSON với các chi tiết lỗi:
```json
{
  "status": "success",           // hoặc "errors_found"
  "total_errors": 0,              // Tổng số lỗi
  "total_formulas": 42,           // Số lượng công thức trong tệp
  "error_summary": {              // Chỉ xuất hiện nếu phát hiện lỗi
    "#REF!": {
      "count": 2,
      "locations": ["Sheet1!B5", "Sheet1!C10"]
    }
  }
}
```

## Thực hành tốt nhất

### Lựa chọn thư viện
- **pandas**: Tốt nhất cho phân tích dữ liệu, hoạt động hàng loạt và xuất dữ liệu đơn giản
- **openpyxl**: Tốt nhất cho định dạng phức tạp, công thức và các tính năng cụ thể của Excel

### Làm việc với openpyxl
- Các chỉ số ô bắt đầu từ 1 (row=1, column=1 là ô A1)
- Sử dụng `data_only=True` để đọc các giá trị đã được tính toán: `load_workbook('file.xlsx', data_only=True)`
- **Cảnh báo**: Nếu mở bằng `data_only=True` và lưu lại, các công thức sẽ bị thay thế bằng các giá trị và mất vĩnh viễn
- Đối với tệp lớn: Sử dụng `read_only=True` để đọc hoặc `write_only=True` để ghi
- Các công thức được giữ nguyên nhưng không được đánh giá - hãy sử dụng .agent/skills/xlsx/scripts/recalc.py để cập nhật các giá trị

### Làm việc với pandas
- Chỉ định kiểu dữ liệu để tránh các vấn đề tự động suy luận: `pd.read_excel('file.xlsx', dtype={'id': str})`
- Đối với các tệp lớn, chỉ đọc các cột cụ thể: `pd.read_excel('file.xlsx', usecols=['A', 'C', 'E'])`
- Xử lý định dạng ngày tháng chính xác: `pd.read_excel('file.xlsx', parse_dates=['date_column'])`

## Nguyên tắc phong cách viết code
**QUAN TRỌNG**: Khi tạo mã Python cho các thao tác với Excel:
- Viết mã Python tối giản, súc tích không có bình luận không cần thiết
- Tránh các tên biến quá dài và các thao tác dư thừa
- Tránh các lệnh in (print) không cần thiết

**Đối với bản thân các tệp Excel**:
- Thêm bình luận vào các ô có công thức phức tạp hoặc các giả định quan trọng
- Ghi lại nguồn dữ liệu cho các giá trị nhập cứng
- Bao gồm các ghi chú cho các tính toán chính và các phần mô hình