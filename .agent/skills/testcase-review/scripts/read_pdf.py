#!/usr/bin/env python3
"""
Đọc tài liệu yêu cầu dạng PDF, trích xuất nội dung văn bản
"""

import json
import sys
import argparse
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Lỗi: Chưa cài đặt PyMuPDF. Hãy chạy: pip install pymupdf")
    sys.exit(1)


def read_pdf(file_path: str) -> dict:
    """
    Đọc tài liệu PDF

    Tham số:
        file_path: Đường dẫn tệp PDF

    Trả về:
        Từ điển chứa nội dung của tài liệu
    """
    doc = fitz.open(file_path)

    pages = []
    full_text = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        pages.append({
            'page': page_num + 1,
            'text': text.strip()
        })
        if text.strip():
            full_text.append(f"[Trang {page_num + 1}]\n{text.strip()}")

    # Trích xuất mục lục (nếu có)
    toc = []
    try:
        toc = doc.get_toc()
    except:
        pass

    return {
        'page_count': len(doc),
        'pages': pages,
        'toc': toc,
        'full_text': '\n\n'.join(full_text)
    }


def main():
    parser = argparse.ArgumentParser(description='Đọc tài liệu yêu cầu dạng PDF')
    parser.add_argument('file_path', help='Đường dẫn tệp PDF')
    parser.add_argument('-o', '--output', help='Đường dẫn xuất tệp JSON')
    parser.add_argument('--text-only', action='store_true', help='Chỉ xuất văn bản thuần túy')

    args = parser.parse_args()

    if not Path(args.file_path).exists():
        print(f"Lỗi: Không tìm thấy tệp: {args.file_path}")
        sys.exit(1)

    result = read_pdf(args.file_path)

    if args.text_only:
        print(result['full_text'])
    elif args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"Đã ghi kết quả đầu ra vào: {args.output}")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
