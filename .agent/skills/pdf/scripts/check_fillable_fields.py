import sys
from pypdf import PdfReader


if len(sys.argv) < 2:
    print("Cách dùng: check_fillable_fields.py <file_pdf>")
    sys.exit(1)

reader = PdfReader(sys.argv[1])
if reader.get_fields():
    print("Tệp PDF này chứa các trường biểu mẫu có thể điền thông tin")
else:
    print("Tệp PDF này không chứa các trường biểu mẫu có thể điền thông tin; bạn cần tự xác định vị trí nhập dữ liệu bằng trực quan")
