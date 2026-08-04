"""Đóng gói một thư mục thành tệp DOCX, PPTX hoặc XLSX.

Xác thực với tính năng tự động sửa lỗi, nén định dạng XML và tạo tệp Office.

Cách dùng:
    python pack.py <input_directory> <output_file> [--original <file>] [--validate true|false]

Ví dụ:
    python pack.py unpacked/ output.docx --original input.docx
    python pack.py unpacked/ output.pptx --validate false
"""

import argparse
import sys
import shutil
import tempfile
import zipfile
from pathlib import Path

import defusedxml.minidom

from validators import DOCXSchemaValidator, PPTXSchemaValidator, RedliningValidator


def pack(
    input_directory: str,
    output_file: str,
    original_file: str | None = None,
    validate: bool = True,
    infer_author_func=None,
) -> tuple[None, str]:
    input_dir = Path(input_directory)
    output_path = Path(output_file)
    suffix = output_path.suffix.lower()

    if not input_dir.is_dir():
        return None, f"Lỗi: {input_dir} không phải là một thư mục"

    if suffix not in {".docx", ".pptx", ".xlsx"}:
        return None, f"Lỗi: {output_file} phải là tệp .docx, .pptx hoặc .xlsx"

    if validate and original_file:
        original_path = Path(original_file)
        if original_path.exists():
            success, output = _run_validation(
                input_dir, original_path, suffix, infer_author_func
            )
            if output:
                print(output)
            if not success:
                return None, f"Lỗi: Xác thực thất bại cho {input_dir}"

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_content_dir = Path(temp_dir) / "content"
        shutil.copytree(input_dir, temp_content_dir)

        for pattern in ["*.xml", "*.rels"]:
            for xml_file in temp_content_dir.rglob(pattern):
                _condense_xml(xml_file)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in temp_content_dir.rglob("*"):
                if f.is_file():
                    zf.write(f, f.relative_to(temp_content_dir))

    return None, f"Đóng gói thành công {input_dir} thành {output_file}"


def _run_validation(
    unpacked_dir: Path,
    original_file: Path,
    suffix: str,
    infer_author_func=None,
) -> tuple[bool, str | None]:
    output_lines = []
    validators = []

    if suffix == ".docx":
        author = "Claude"
        if infer_author_func:
            try:
                author = infer_author_func(unpacked_dir, original_file)
            except ValueError as e:
                print(f"Cảnh báo: {e}. Sử dụng tác giả mặc định 'Claude'.", file=sys.stderr)

        validators = [
            DOCXSchemaValidator(unpacked_dir, original_file),
            RedliningValidator(unpacked_dir, original_file, author=author),
        ]
    elif suffix == ".pptx":
        validators = [PPTXSchemaValidator(unpacked_dir, original_file)]

    if not validators:
        return True, None

    total_repairs = sum(v.repair() for v in validators)
    if total_repairs:
        output_lines.append(f"Đã tự động sửa {total_repairs} lỗi")

    success = all(v.validate() for v in validators)

    if success:
        output_lines.append("Tất cả các xác thực đã ĐẠT!")

    return success, "\n".join(output_lines) if output_lines else None


def _condense_xml(xml_file: Path) -> None:
    try:
        with open(xml_file, encoding="utf-8") as f:
            dom = defusedxml.minidom.parse(f)

        for element in dom.getElementsByTagName("*"):
            if element.tagName.endswith(":t"):
                continue

            for child in list(element.childNodes):
                if (
                    child.nodeType == child.TEXT_NODE
                    and child.nodeValue
                    and child.nodeValue.strip() == ""
                ) or child.nodeType == child.COMMENT_NODE:
                    element.removeChild(child)

        xml_file.write_bytes(dom.toxml(encoding="UTF-8"))
    except Exception as e:
        print(f"LỖI: Không thể phân tích {xml_file.name}: {e}", file=sys.stderr)
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Đóng gói một thư mục thành tệp DOCX, PPTX hoặc XLSX"
    )
    parser.add_argument("input_directory", help="Thư mục tài liệu Office đã giải nén")
    parser.add_argument("output_file", help="Tệp Office đầu ra (.docx/.pptx/.xlsx)")
    parser.add_argument(
        "--original",
        help="Tệp gốc để so sánh xác thực",
    )
    parser.add_argument(
        "--validate",
        type=lambda x: x.lower() == "true",
        default=True,
        metavar="true|false",
        help="Chạy xác thực với tính năng tự động sửa lỗi (mặc định: true)",
    )
    args = parser.parse_args()

    _, message = pack(
        args.input_directory,
        args.output_file,
        original_file=args.original,
        validate=args.validate,
    )
    print(message)

    if "Lỗi" in message:
        sys.exit(1)
