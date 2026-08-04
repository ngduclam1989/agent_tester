"""Giải nén các tệp Office (DOCX, PPTX, XLSX) để chỉnh sửa.

Giải nén kho lưu trữ ZIP, định dạng đẹp (pretty-print) các tệp XML và tùy chọn:
- Hợp nhất các run liền kề có định dạng giống hệt nhau (chỉ DOCX)
- Đơn giản hóa các thay đổi được theo dõi liền kề từ cùng một tác giả (chỉ DOCX)

Cách dùng:
    python unpack.py <office_file> <output_dir> [tùy chọn]

Ví dụ:
    python unpack.py document.docx unpacked/
    python unpack.py presentation.pptx unpacked/
    python unpack.py document.docx unpacked/ --merge-runs false
"""

import argparse
import sys
import zipfile
from pathlib import Path

import defusedxml.minidom

from helpers.merge_runs import merge_runs as do_merge_runs
from helpers.simplify_redlines import simplify_redlines as do_simplify_redlines

SMART_QUOTE_REPLACEMENTS = {
    "\u201c": "&#x201C;",  
    "\u201d": "&#x201D;",  
    "\u2018": "&#x2018;",  
    "\u2019": "&#x2019;",  
}


def unpack(
    input_file: str,
    output_directory: str,
    merge_runs: bool = True,
    simplify_redlines: bool = True,
) -> tuple[None, str]:
    input_path = Path(input_file)
    output_path = Path(output_directory)
    suffix = input_path.suffix.lower()

    if not input_path.exists():
        return None, f"Lỗi: {input_file} không tồn tại"

    if suffix not in {".docx", ".pptx", ".xlsx"}:
        return None, f"Lỗi: {input_file} phải là tệp .docx, .pptx hoặc .xlsx"

    try:
        output_path.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(input_path, "r") as zf:
            zf.extractall(output_path)

        xml_files = list(output_path.rglob("*.xml")) + list(output_path.rglob("*.rels"))
        for xml_file in xml_files:
            _pretty_print_xml(xml_file)

        message = f"Đã giải nén {input_file} ({len(xml_files)} tệp XML)"

        if suffix == ".docx":
            if simplify_redlines:
                simplify_count, _ = do_simplify_redlines(str(output_path))
                message += f", đã đơn giản hóa {simplify_count} thay đổi được theo dõi"

            if merge_runs:
                merge_count, _ = do_merge_runs(str(output_path))
                message += f", đã hợp nhất {merge_count} run"

        for xml_file in xml_files:
            _escape_smart_quotes(xml_file)

        return None, message

    except zipfile.BadZipFile:
        return None, f"Lỗi: {input_file} không phải là tệp Office hợp lệ"
    except Exception as e:
        return None, f"Lỗi giải nén: {e}"


def _pretty_print_xml(xml_file: Path) -> None:
    try:
        content = xml_file.read_text(encoding="utf-8")
        dom = defusedxml.minidom.parseString(content)
        xml_file.write_bytes(dom.toprettyxml(indent="  ", encoding="utf-8"))
    except Exception:
        pass  


def _escape_smart_quotes(xml_file: Path) -> None:
    try:
        content = xml_file.read_text(encoding="utf-8")
        for char, entity in SMART_QUOTE_REPLACEMENTS.items():
            content = content.replace(char, entity)
        xml_file.write_text(content, encoding="utf-8")
    except Exception:
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Giải nén tệp Office (DOCX, PPTX, XLSX) để chỉnh sửa"
    )
    parser.add_argument("input_file", help="Tệp Office cần giải nén")
    parser.add_argument("output_directory", help="Thư mục đầu ra")
    parser.add_argument(
        "--merge-runs",
        type=lambda x: x.lower() == "true",
        default=True,
        metavar="true|false",
        help="Hợp nhất các run liền kề có định dạng giống nhau (chỉ dành cho DOCX, mặc định: true)",
    )
    parser.add_argument(
        "--simplify-redlines",
        type=lambda x: x.lower() == "true",
        default=True,
        metavar="true|false",
        help="Hợp nhất các thay đổi được theo dõi liền kề từ cùng một tác giả (chỉ dành cho DOCX, mặc định: true)",
    )
    args = parser.parse_args()

    _, message = unpack(
        args.input_file,
        args.output_directory,
        merge_runs=args.merge_runs,
        simplify_redlines=args.simplify_redlines,
    )
    print(message)

    if "Lỗi" in message:
        sys.exit(1)
