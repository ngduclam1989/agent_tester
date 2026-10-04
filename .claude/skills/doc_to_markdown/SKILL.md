---
name: doc_to_markdown
description: Chuyển tài liệu Word (.doc/.docx) sang Markdown sạch — GIỮ NGUYÊN BẢNG, tách ảnh ra thư mục riêng `<tên>_images/`, dọn rác Word (comment marker, revision history, TOC link). Dùng làm bước tiền xử lý BRD/PTTK/RSD trước khi phân tích requirements hoặc sinh test case.
---

# Kỹ năng Chuyển Word → Markdown (Doc to Markdown)

Chuyển file Word (`.doc` / `.docx`) thành:
- 1 file Markdown (`.md`) gọn, giữ đúng cấu trúc heading + **bảng Markdown**
- 1 thư mục ảnh `<tên>_images/` được tham chiếu bằng đường dẫn tương đối (mặc định)

Mục tiêu: file `.md` nhỏ, đọc được bằng mắt và trích dẫn được theo `path/to/file.md:line` khi phân tích requirements.

## 1. Khi nào dùng

- Đầu vào requirements là file Word mà workspace chưa có file `.md` tương ứng.
- File `.md` hiện có được convert bằng công cụ cũ và **mất bảng** (ô bảng bị tách thành từng đoạn rời).
- Được gọi từ bước tiền xử lý của `requirements_analyzer`, `rbt_manual_testing`, `/analyze_requirement_document`.

> **Vì sao không dùng `scripts/convert_doc/docx_to_md.js` (mammoth) làm mặc định?**
> Đã kiểm chứng trên `MSB_BRD_TM_v1.9_20260930.docx`: mammoth xuất Markdown **không có bảng nào**
> (mọi ô bảng thành đoạn văn rời, mất quan hệ dòng–cột), nhúng ảnh base64 làm file phình 836 KB,
> và escape thừa (`\(TM\)`, `Anti\-Money`). Converter `markitdown` của skill này giữ 355 dòng bảng,
> file còn 69 KB. Rule nghiệp vụ trong BRD phần lớn nằm trong bảng → mất bảng là mất requirement.
> `docx_to_md.js` chỉ còn là phương án dự phòng khi máy không có Python.

## 2. Cách dùng

Chạy từ gốc repo:

```bash
# Convert 1 file (.docx hoặc .doc) — output nằm cạnh file input
python scripts/convert_doc/word_to_md/convert_word_to_markdown.py "path/to/document.docx"

# Nhúng ảnh base64 vào chính file .md (1 file tự chứa, rất nặng — chỉ dùng khi cần gửi đi)
python scripts/convert_doc/word_to_md/convert_word_to_markdown.py --embedded "path/to/document.docx"

# Kiểm tra dependency khi có lỗi
python scripts/convert_doc/word_to_md/convert_word_to_markdown.py --check
```

Convert hàng loạt cả thư mục (Git Bash):

```bash
for f in path/to/folder/*.doc path/to/folder/*.docx; do
  [ -e "$f" ] || continue
  python scripts/convert_doc/word_to_md/convert_word_to_markdown.py "$f"
done
```

### Output

```
document.docx
document.md            # Markdown sạch, có bảng
document_images/       # ảnh trích ra từ tài liệu (bỏ logo/watermark header-footer)
  image1.png
  image2.png
```

**Lưu ý:** script **ghi đè** `document.md` nếu đã tồn tại → kiểm tra trước, nếu file `.md` cũ là
bản do người dùng chỉnh tay thì hỏi lại trước khi chạy.

## 3. Dependency

| Thành phần | Bắt buộc | Cài đặt |
|---|---|---|
| Python ≥ 3.10 | ✅ | — |
| `markitdown[all]` | ✅ | `python -m pip install "markitdown[all]"` |
| LibreOffice | ⭕ chỉ cho `.doc` và ảnh WMF/EMF | Windows: `winget install TheDocumentFoundation.LibreOffice` · macOS: `brew install --cask libreoffice` |

Thứ tự script tìm `markitdown`: biến `MARKITDOWN_CMD` → `.venv/` cạnh script → `markitdown` trên PATH →
`python -m markitdown` (khi pip cài vào user site mà không thêm vào PATH — trường hợp thường gặp trên
Windows) → `uvx`.

Biến môi trường tuỳ chọn: `MARKITDOWN_CMD` (ghi đè toàn bộ lệnh), `MARKITDOWN_UVX_PYTHON` (mặc định `3.11`),
`MARKITDOWN_UVX_OFFLINE=0` (cho `uvx` dùng mạng), `UV_CACHE_DIR`.

## 4. Quy trình convert pipeline

1. `.doc` → `.docx` bằng LibreOffice headless (file `.docx` tạm bị xoá sau khi xong).
2. Trích ảnh trong `word/media/`, bỏ ảnh của header/footer (logo, watermark); WMF/EMF → PNG nếu có LibreOffice.
3. `markitdown` chuyển `.docx` → Markdown (giữ bảng).
4. Thay placeholder ảnh base64 bằng link tương đối — khớp thứ tự ảnh theo **hash nội dung**,
   fallback theo thứ tự XML của tài liệu, cuối cùng là natural sort.
5. Dọn rác: comment marker Word (`[///txt]`, `[/***]`...), dòng gạch ngang revision (`~~...~~`, `(removed)`),
   link TOC (`[1 Abc 4](#_Toc...)`), dòng trống thừa.

Chỉ chạy bước dọn rác trên 1 file `.md` có sẵn:

```bash
python scripts/convert_doc/word_to_md/clean_markdown.py file.md [-o out.md] [--remove-strikethrough] [--keep-toc-links] [--dry-run]
```

## 5. Kiểm tra sau khi convert (BẮT BUỘC)

Không báo "convert xong" chỉ dựa vào log của script — phải tự kiểm tra output:

- Đếm dòng bảng: `grep -c '^|' file.md` — tài liệu Word có bảng mà kết quả = 0 là convert hỏng.
- Đếm heading: `grep -c '^#' file.md` — đối chiếu với mục lục của tài liệu gốc.
- Ảnh: mọi link `![](..._images/...)` phải trỏ tới file có thật; ảnh `.emf`/`.wmf` còn sót là do máy
  thiếu LibreOffice → báo người dùng (ảnh đó không hiển thị trong viewer Markdown, nội dung chữ không mất).
- Báo cáo cho người dùng: đường dẫn file `.md`, số dòng/dung lượng, số dòng bảng, số ảnh, hạn chế còn lại.

## 6. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `markitdown not found` | Chưa cài markitdown | `python -m pip install "markitdown[all]"`, chạy lại `--check` |
| Convert `.doc` báo `output file not found` | LibreOffice GUI đang mở, headless không khởi động được | Đóng hết cửa sổ LibreOffice rồi chạy lại |
| Convert `.doc` lỗi, máy không có LibreOffice | Thiếu dependency | Cài LibreOffice, hoặc nhờ người dùng mở Word → Save As `.docx` |
| Ảnh `.emf`/`.wmf` không hiển thị | Thiếu LibreOffice để đổi sang PNG | Cài LibreOffice rồi convert lại, hoặc ghi chú hạn chế trong báo cáo |
| `Failed to initialize cache at ...uv` | `uvx` không ghi được cache | Đặt `UV_CACHE_DIR` sang thư mục ghi được |

## 7. Thành phần script

Tất cả nằm trong `scripts/convert_doc/word_to_md/`:

| File | Vai trò |
|---|---|
| `convert_word_to_markdown.py` | Entrypoint — xử lý cả `.doc` và `.docx`, `--check`, `--embedded` |
| `convert_with_images.py` | Lõi convert `.docx` + trích/khớp ảnh (chỉ nhận `.docx`) |
| `convert_doc_to_docx.py` | `.doc` → `.docx` qua LibreOffice; chứa `find_libreoffice()` dùng chung |
| `clean_markdown.py` | Dọn rác Markdown, chạy độc lập được |
| `test_clean_markdown.py` | Unit test cho `clean_markdown` — `cd scripts/convert_doc/word_to_md && python -m unittest test_clean_markdown` |
