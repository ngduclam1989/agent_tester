"""Công cụ dòng lệnh để xác thực các tệp XML tài liệu Office với XSD schema và các thay đổi được theo dõi (tracked changes).

Cách dùng:
    python validate.py <path> [--original <original_file>] [--auto-repair] [--author NAME]

Tham số đầu tiên có thể là:
- Thư mục đã giải nén chứa các tệp XML của tài liệu Office
- Tệp Office đã đóng gói (.docx/.pptx/.xlsx), tệp này sẽ được giải nén vào một thư mục tạm thời

Tính năng tự động sửa lỗi khắc phục:
- Các giá trị paraId/durableId vượt quá giới hạn OOXML
- Thiếu xml:space="preserve" trên các phần tử w:t có chứa khoảng trắng
"""

import argparse
import sys
import tempfile
import zipfile
from pathlib import Path

from validators import DOCXSchemaValidator, PPTXSchemaValidator, RedliningValidator


def main():
    parser = argparse.ArgumentParser(description="Xác thực các tệp XML của tài liệu Office")
    parser.add_argument(
        "path",
        help="Đường dẫn đến thư mục đã giải nén hoặc tệp Office đã đóng gói (.docx/.pptx/.xlsx)",
    )
    parser.add_argument(
        "--original",
        required=False,
        default=None,
        help="Đường dẫn đến tệp gốc (.docx/.pptx/.xlsx). Nếu bỏ qua, tất cả các lỗi XSD sẽ được báo cáo và bỏ qua xác thực redlining.",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Bật đầu ra chi tiết (verbose)",
    )
    parser.add_argument(
        "--auto-repair",
        action="store_true",
        help="Tự động sửa các lỗi phổ biến (ID thập lục phân, bảo toàn khoảng trắng)",
    )
    parser.add_argument(
        "--author",
        default="Claude",
        help="Tên tác giả để xác thực redlining (mặc định: Claude)",
    )
    args = parser.parse_args()

    path = Path(args.path)
    assert path.exists(), f"Lỗi: {path} không tồn tại"

    original_file = None
    if args.original:
        original_file = Path(args.original)
        assert original_file.is_file(), f"Lỗi: {original_file} không phải là tệp tin"
        assert original_file.suffix.lower() in [".docx", ".pptx", ".xlsx"], (
            f"Lỗi: {original_file} phải là tệp .docx, .pptx hoặc .xlsx"
        )

    file_extension = (original_file or path).suffix.lower()
    assert file_extension in [".docx", ".pptx", ".xlsx"], (
        f"Lỗi: Không thể xác định loại tệp từ {path}. Sử dụng --original hoặc cung cấp tệp .docx/.pptx/.xlsx."
    )

    if path.is_file() and path.suffix.lower() in [".docx", ".pptx", ".xlsx"]:
        temp_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(path, "r") as zf:
            zf.extractall(temp_dir)
        unpacked_dir = Path(temp_dir)
    else:
        assert path.is_dir(), f"Lỗi: {path} không phải là thư mục hoặc tệp Office"
        unpacked_dir = path

    match file_extension:
        case ".docx":
            validators = [
                DOCXSchemaValidator(unpacked_dir, original_file, verbose=args.verbose),
            ]
            if original_file:
                validators.append(
                    RedliningValidator(unpacked_dir, original_file, verbose=args.verbose, author=args.author)  
                )
        case ".pptx":
            validators = [
                PPTXSchemaValidator(unpacked_dir, original_file, verbose=args.verbose),
            ]
        case _:
            print(f"Lỗi: Xác thực không được hỗ trợ cho loại tệp {file_extension}")
            sys.exit(1)

    if args.auto_repair:
        total_repairs = sum(v.repair() for v in validators)
        if total_repairs:
            print(f"Đã tự động sửa {total_repairs} lỗi")

    success = all(v.validate() for v in validators)

    if success:
        print("Tất cả các xác thực đã ĐẠT!")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
