#!/usr/bin/env python3
"""
PDF to MD Converter
Mô tả: Chuyển đổi tài liệu PDF sang Markdown (.md) để agent trích dẫn được
       theo `path/to/file.md:line` khi phân tích requirements (Bước 1-2 của
       quy trình FULL RBT trong skill `rbt_manual_testing`).

Điểm khác biệt so với converter PDF thông thường: script này giữ lại **comment
review trong lề** (margin comments). Với tài liệu BRD đã qua nhiều vòng review,
rất nhiều quyết định nghiệp vụ chỉ tồn tại trong comment chứ không có trong
thân văn bản — mất comment là mất phần quan trọng nhất của tài liệu.

Dùng PyMuPDF (không phải pypdf) vì 2 lý do đã kiểm chứng trên BRD tiếng Việt:
  1. pypdf chèn khoảng trắng sai vào giữa từ có dấu ("th ực hi ện"), làm hỏng
     khả năng grep; PyMuPDF trả về đúng "thực hiện".
  2. Word xuất comment thành một cột riêng ở lề phải. pypdf đọc phẳng nên dòng
     nối tiếp của comment bị tách rời khỏi dòng đầu (comment cụt). PyMuPDF trả
     về mỗi comment như một block nguyên vẹn kèm toạ độ.

Cách dùng:
    python scripts/convert_doc/pdf_to_md.py <input.pdf> [output.md]

Ví dụ:
    python scripts/convert_doc/pdf_to_md.py requirements/BRD.pdf
    python scripts/convert_doc/pdf_to_md.py requirements/BRD.pdf practices/requirements/BRD.md

Mặc định output ghi cạnh file input với cùng tên, đuôi .md.
Exit code 0 = thành công. Khác 0 = lỗi.
"""

import os
import re
import sys
from datetime import datetime

# Windows pipe stdout qua ANSI codepage (không phải UTF-8) nên sẽ crash khi in
# tiếng Việt — reconfigure phòng thủ, giống validate_tc.py.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8")

# Word xuất PDF kèm markup sẽ chèn comment vào text layer dưới dạng
# "Đã chú thích [A22R18]: nội dung..." (bản tiếng Việt) hoặc
# "Commented [XYZ]: ..." (bản tiếng Anh).
COMMENT_RE = re.compile(
    r'^\s*(?:Đã chú thích|Commented)\s*\[([^\]]+)\]\s*:\s*(.*)$',
    re.DOTALL,
)

# Dòng chỉ có số trang đứng một mình — nhiễu, bỏ đi.
PAGE_NUMBER_ONLY_RE = re.compile(r'^\s*\d{1,3}\s*$')


def log(level, message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] [{level}] {message}")


def print_help():
    print("""
PDF to MD Converter
Cách dùng:
  python scripts/convert_doc/pdf_to_md.py <input_path> [output_path]

Ví dụ:
  python scripts/convert_doc/pdf_to_md.py requirements/BRD.pdf
  python scripts/convert_doc/pdf_to_md.py requirements/BRD.pdf practices/requirements/BRD.md

Ghi chú:
  - Giữ lại comment review trong lề, tách thành mục riêng theo từng trang.
  - Mỗi trang PDF thành một heading "## Trang N" để trích dẫn được số dòng.
  - KHÔNG dựng lại cấu trúc bảng — với bảng phức tạp phải đối chiếu PDF gốc.
  - PDF scan ảnh (không có text layer) sẽ KHÔNG đọc được — cần OCR riêng.

Yêu cầu: python -m pip install pymupdf
""")


def normalize(text):
    """Chuẩn hoá khoảng trắng trong một khối text, giữ nguyên nội dung chữ."""
    return " ".join(text.split())


def collapse_blank_lines(lines):
    """Gộp nhiều dòng trắng liên tiếp thành tối đa 1, bỏ trắng đầu/cuối."""
    out = []
    prev_blank = False
    for line in lines:
        is_blank = not line.strip()
        if is_blank and prev_blank:
            continue
        out.append(line)
        prev_blank = is_blank
    while out and not out[0].strip():
        out.pop(0)
    while out and not out[-1].strip():
        out.pop()
    return out


def extract_annotations(page):
    """Lấy comment từ annotation object thật trong PDF (nếu file còn giữ).

    Khác với comment nằm trong text layer, đây là annotation gốc — một số PDF
    giữ cả hai, một số chỉ giữ một. Gộp cả hai nguồn rồi khử trùng lặp.
    """
    results = []
    try:
        for annot in page.annots() or []:
            try:
                info = annot.info or {}
            except Exception:
                continue
            contents = (info.get("content") or "").strip()
            if not contents:
                continue
            author = (info.get("title") or "").strip() or None
            results.append((author, normalize(contents)))
    except Exception:
        # Annotation hỏng không được làm chết cả quá trình convert.
        pass
    return results


def parse_page(page):
    """Tách một trang thành (dòng nội dung chính, danh sách comment).

    Comment nhận diện bằng marker "Đã chú thích [ID]:" / "Commented [ID]:".
    PyMuPDF trả mỗi comment là 1 block trọn vẹn (đã gồm dòng nối tiếp), nên
    không cần ghép thủ công như khi dùng pypdf.
    """
    body_blocks = []
    comments = []

    try:
        blocks = page.get_text("blocks")
    except Exception:
        return [], []

    # Sắp theo thứ tự đọc: trên xuống dưới, trái sang phải.
    for block in sorted(blocks, key=lambda b: (round(b[1], 1), round(b[0], 1))):
        text = (block[4] or "").strip()
        if not text:
            continue

        m = COMMENT_RE.match(text)
        if m:
            comment_id = normalize(m.group(1))
            comment_body = normalize(m.group(2))
            comments.append((comment_id, comment_body))
            continue

        body_blocks.append(text)

    body_lines = []
    for block_text in body_blocks:
        for line in block_text.split('\n'):
            line = line.rstrip()
            if PAGE_NUMBER_ONLY_RE.match(line):
                continue
            body_lines.append(line)
        body_lines.append('')

    return collapse_blank_lines(body_lines), comments


def convert(input_path, output_path):
    try:
        import pymupdf
    except ImportError:
        try:
            import fitz as pymupdf  # tên cũ của PyMuPDF
        except ImportError:
            log('ERROR',
                "Thiếu thư viện 'pymupdf'. Cài bằng: python -m pip install pymupdf")
            return 1

    log('INFO', f"Đang đọc file PDF: {input_path}")

    try:
        doc = pymupdf.open(input_path)
    except Exception as e:
        log('ERROR', f"Không mở được file PDF: {e}")
        return 1

    if doc.needs_pass:
        log('ERROR', "File PDF được bảo vệ bằng mật khẩu — không đọc được.")
        doc.close()
        return 1

    total_pages = doc.page_count
    log('INFO', f"Tổng số trang: {total_pages}")

    doc_name = os.path.basename(input_path)
    md = [
        f"# {doc_name}",
        "",
        f"> Chuyển đổi tự động từ `{input_path}` bằng `scripts/convert_doc/pdf_to_md.py`.",
        f"> Tổng {total_pages} trang. Ngày chuyển đổi: {datetime.now().strftime('%Y-%m-%d %H:%M')}.",
        "> Bản chuyển đổi giữ nguyên văn text layer và comment review, nhưng KHÔNG",
        "> dựng lại cấu trúc bảng — với bảng phức tạp cần đối chiếu lại PDF gốc",
        "> trước khi trích dẫn làm căn cứ viết test case.",
        "",
        "---",
        "",
    ]

    empty_pages = []
    total_comments = 0

    for idx in range(total_pages):
        page = doc[idx]
        page_no = idx + 1

        body_lines, inline_comments = parse_page(page)
        annot_comments = extract_annotations(page)

        # Khử trùng lặp: comment vừa nằm trong text layer vừa là annotation.
        seen = {body for _, body in inline_comments}
        annot_comments = [
            (author, body) for author, body in annot_comments if body not in seen
        ]

        if not body_lines and not inline_comments and not annot_comments:
            empty_pages.append(page_no)

        md.append(f"## Trang {page_no}")
        md.append("")

        if body_lines:
            md.extend(body_lines)
            md.append("")
        else:
            md.append("_(Trang không có nội dung text — có thể là ảnh/sơ đồ.)_")
            md.append("")

        if inline_comments or annot_comments:
            md.append(f"### Comment review — trang {page_no}")
            md.append("")
            for cid, cbody in inline_comments:
                md.append(f"- **[{cid}]** {cbody}")
                total_comments += 1
            for author, contents in annot_comments:
                prefix = f"**[{author}]** " if author else ""
                md.append(f"- {prefix}{contents}")
                total_comments += 1
            md.append("")

        md.append("---")
        md.append("")

    doc.close()

    content = "\n".join(md).rstrip() + "\n"

    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir and not os.path.isdir(out_dir):
        os.makedirs(out_dir, exist_ok=True)
        log('INFO', f"Đã tạo thư mục: {out_dir}")

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        log('ERROR', f"Không ghi được file output: {e}")
        return 1

    size_kb = os.path.getsize(output_path) / 1024
    line_count = content.count('\n')

    log('SUCCESS', f"Đã tạo file Markdown: {output_path}")
    log('INFO', f"Kích thước: {size_kb:.1f} KB — {line_count} dòng")
    log('INFO', f"Số comment review trích xuất được: {total_comments}")

    if empty_pages:
        preview = ", ".join(str(p) for p in empty_pages[:10])
        more = f" (và {len(empty_pages) - 10} trang khác)" if len(empty_pages) > 10 else ""
        log('WARN',
            f"{len(empty_pages)}/{total_pages} trang không có text: {preview}{more}. "
            f"Nếu tài liệu là bản scan, cần OCR riêng — script này không OCR được.")

    if total_comments == 0:
        log('WARN',
            "Không tìm thấy comment review nào. Nếu tài liệu gốc CÓ comment, "
            "nhiều khả năng PDF đã được xuất ở chế độ ẩn markup — hãy yêu cầu "
            "bản xuất kèm comment để không mất quyết định nghiệp vụ.")

    return 0


def main():
    args = sys.argv[1:]

    if not args or args[0] in ('--help', '-h'):
        print_help()
        return 0

    input_path = args[0]

    if not os.path.isfile(input_path):
        log('ERROR', f"Không tìm thấy file: {input_path}")
        return 1

    if not input_path.lower().endswith('.pdf'):
        log('ERROR', f"File không phải định dạng .pdf: {input_path}")
        return 1

    output_path = args[1] if len(args) > 1 else os.path.splitext(input_path)[0] + '.md'

    return convert(input_path, output_path)


if __name__ == '__main__':
    sys.exit(main())
