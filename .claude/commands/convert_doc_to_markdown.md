---
description: Chuyển tài liệu Word (.doc/.docx) sang Markdown sạch — giữ bảng, tách ảnh ra thư mục riêng, dọn rác Word. Hỗ trợ 1 file hoặc cả thư mục.
skills:
  - doc_to_markdown
---

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`doc_to_markdown`** (tại `.claude/skills/doc_to_markdown/SKILL.md`) trước khi bắt đầu.

# Workflow: Convert Word → Markdown

## Khi nào sử dụng

- User nói: "convert docx sang md", "chuyển file Word sang markdown", "convert tài liệu này"
- Chuẩn bị đầu vào cho `/analyze_requirement_document`, `/generate_manual_testcases_rbt`, `/generate_testcases_from_requirements`

## Đầu vào (Input)

| # | Input | Bắt buộc | Mô tả |
|---|---|---|---|
| 1 | **Đường dẫn file hoặc thư mục** | ✅ | File `.doc`/`.docx`, hoặc thư mục chứa nhiều file Word |
| 2 | **Chế độ ảnh** | ⭕ | Mặc định: tách ảnh ra `<tên>_images/`. Chỉ dùng `--embedded` khi user yêu cầu 1 file tự chứa |

## Các bước thực hiện

### Bước 1: Kiểm tra đầu vào

1. Xác nhận file/thư mục tồn tại; liệt kê các file `.doc`/`.docx` sẽ convert.
2. Nếu cạnh file đã có `<tên>.md` → script sẽ **ghi đè**. Nếu file đó là bản do người dùng chỉnh tay,
   hỏi lại trước khi chạy; nếu là bản convert cũ (vd mammoth mất bảng) thì ghi đè được.
3. Có file `.doc` → cần LibreOffice; thiếu thì báo user Save As `.docx` hoặc cài LibreOffice.

### Bước 2: Kiểm tra dependency

```bash
python scripts/convert_doc/word_to_md/convert_word_to_markdown.py --check
```

Dòng `markitdown cmd:` báo `ERROR` → hướng dẫn user cài `python -m pip install "markitdown[all]"`
(hỏi trước khi tự cài).

### Bước 3: Convert

```bash
python scripts/convert_doc/word_to_md/convert_word_to_markdown.py "<file.docx>"
```

Thư mục: lặp qua từng file theo vòng `for` trong SKILL.md mục 2.

### Bước 4: Kiểm tra output (BẮT BUỘC)

Thực hiện checklist tại SKILL.md mục 5: số dòng bảng (`grep -c '^|'`), số heading, link ảnh hợp lệ,
ảnh `.emf`/`.wmf` còn sót.

### Bước 5: Báo cáo (Tiếng Việt)

Với mỗi file: đường dẫn `.md` (dạng link markdown), số dòng/dung lượng, số dòng bảng, số heading,
số ảnh trong `<tên>_images/`, và các hạn chế còn lại (vd ảnh EMF chưa đổi sang PNG vì thiếu LibreOffice).
