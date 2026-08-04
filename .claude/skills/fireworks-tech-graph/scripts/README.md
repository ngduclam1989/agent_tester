# Fireworks Tech Graph - Scripts

Tập hợp các script trợ giúp để cải thiện độ ổn định và hiệu suất sinh biểu đồ SVG.

## Danh sách Script

### 1. validate-svg.sh

Script xác thực SVG, kiểm tra cú pháp SVG và báo cáo lỗi chi tiết.

**Cách dùng:**
```bash
./validate-svg.sh <svg-file>
```

**Các hạng mục kiểm tra:**
- Cân bằng thẻ tag (thẻ mở vs thẻ đóng)
- Tính toàn vẹn của dấu ngoặc kép thuộc tính
- Escape các ký tự đặc biệt
- Tính toàn vẹn tham chiếu Marker
- Thẻ đóng `</svg>`
- Xác thực bằng rsvg-convert

**Ví dụ:**
```bash
./validate-svg.sh /path/to/diagram.svg
```

### 2. generate-diagram.sh

Script sinh biểu đồ SVG, hỗ trợ xác thực tự động và xuất ra file PNG.

**Cách dùng:**
```bash
./generate-diagram.sh [OPTIONS]
```

**Các tùy chọn:**
- `-t, --type TYPE` - Loại biểu đồ (xem phần trợ giúp của script)
- `-s, --style STYLE` - Số hiệu phong cách (1-7, mặc định: 1)
- `-o, --output PATH` - Đường dẫn đầu ra (mặc định: thư mục hiện tại)
- `-w, --width WIDTH` - Chiều rộng PNG (pixel, mặc định: 1920)
- `--no-validate` - Bỏ qua xác thực
- `-h, --help` - Hiển thị trợ giúp

**Ví dụ:**
```bash
# Sinh sơ đồ kiến trúc (Style 1)
./generate-diagram.sh -t architecture -s 1 -o ./output/arch.svg

# Sinh sơ đồ luồng (Style 2, rộng 2400px)
./generate-diagram.sh -t flowchart -s 2 -w 2400
```

**Lưu ý:** Nội dung SVG cần phải được chuẩn bị trước; script này chỉ chịu trách nhiệm xác thực và xuất file.

### 3. generate-from-template.py

Sinh SVG dựa trên cấu hình style và dữ liệu JSON. Phiên bản hiện tại không chỉ đơn thuần là nhét các `nodes/arrows` vào, mà còn thực thi một số quy tắc tính toán trong style guide, ví dụ:

- `style` - Số hiệu phong cách (1-7)
- `containers` - Các swimlane / vùng chứa nhóm
- `containers[].header_prefix` / `containers[].header_text` - Tiêu đề phân khu có đánh số kỹ thuật
- `containers[].side_label` - Nhãn lớp (layer label) ở bên trái
- `nodes[].kind` - Kiểu cấu phần ngữ nghĩa, ví dụ: `double_rect`, `cylinder`, `document`, `terminal`, `circle_cluster`
- `arrows[].flow` - Kiểu mũi tên ngữ nghĩa, ví dụ: `control`, `write`, `read`, `data`
- `source_port` / `target_port` - Chỉ định neo cổng (port anchor)
- `route_points` / `corridor_x` / `corridor_y` - Điều khiển chất lượng đi dây của các sơ đồ phức tạp
- `style_overrides` - Ghi đè cục bộ lên style hiện tại
- `window_controls` / `meta_*` - Terminal chrome phía trên
- `blueprint_title_block` - Title block ở góc dưới bên phải trong style bản vẽ kỹ thuật

**Cách dùng:**
```bash
python3 ./generate-from-template.py architecture ./output/arch.svg '{"style":1,"title":"My Diagram","containers":[],"nodes":[],"arrows":[]}'
```

**Ví dụ:**
```bash
python3 ./generate-from-template.py memory ./output/mem0.svg '{
  "style": 1,
  "title": "Mem0 Memory Architecture",
  "containers": [
    {"x":30,"y":90,"width":900,"height":90,"label":"Input Layer","header_prefix":"01"}
  ],
  "nodes": [
    {"id":"manager","kind":"double_rect","x":360,"y":220,"width":300,"height":72,"label":"Memory Manager"},
    {"id":"vector","kind":"cylinder","x":90,"y":360,"width":140,"height":110,"label":"Vector Store"}
  ],
  "arrows": [
    {"source":"manager","target":"vector","flow":"write","dashed":true}
  ]
}'
```

### 4. test-all-styles.sh

Script chạy thử nghiệm hàng loạt, kiểm thử hồi quy các ảnh mẫu của 7 phong cách.

**Cách dùng:**
```bash
./test-all-styles.sh
```

**Tính năng:**
- Kiểm tra các file tham chiếu của tất cả các style
- Render các fixture hồi quy `fixtures/*.json`
- Xác thực các file SVG được tạo ra
- Xuất các file PNG sang thư mục `test-output/`
- Tạo báo cáo thử nghiệm

**Đầu ra:**
- Tóm tắt thử nghiệm (thống kê pass/fail)
- Các file PNG (kèm timestamp)
- Thông tin chi tiết về lỗi xác thực

**Ví dụ:**
```bash
./test-all-styles.sh
```

## Yêu cầu phụ thuộc

Tất cả các script yêu cầu các công cụ sau:

- **rsvg-convert** - Chuyển đổi SVG sang PNG
  ```bash
  brew install librsvg
  ```

- **grep, sed, awk** - Các công cụ xử lý văn bản (sẵn có trên macOS)

## Cấu trúc thư mục

```
fireworks-tech-graph/
├── SKILL.md                    # Tài liệu chính của Skill
├── references/                 # Các file tham chiếu style
│   ├── style-1-flat-icon.md
│   ├── style-2-dark-terminal.md
│   └── ...
├── fixtures/                   # Mẫu thử nghiệm hồi quy (JSON)
│   ├── mem0-style1.json
│   ├── tool-call-style2.json
│   └── ...
├── scripts/                    # Script bổ trợ (thư mục này)
│   ├── README.md              # Tài liệu này
│   ├── validate-svg.sh        # Xác thực SVG
│   ├── generate-diagram.sh    # Xác thực SVG và xuất PNG
│   ├── generate-from-template.py # Sinh SVG theo mẫu
│   └── test-all-styles.sh     # Chạy thử nghiệm hàng loạt
└── test-output/               # Thư mục xuất kết quả test (tự động tạo)
```

## Các kịch bản sử dụng

### Kịch bản 1: Xác thực file SVG hiện có

```bash
cd .claude/skills/fireworks-tech-graph/scripts
./validate-svg.sh /path/to/your-diagram.svg
```

### Kịch bản 2: Sinh và xác thực biểu đồ

1. Dùng Claude Code để sinh nội dung SVG
2. Chạy xác thực và xuất file:
   ```bash
   ./generate-diagram.sh -t architecture -s 1 -o ./output/arch.svg
   ```

### Kịch bản 3: Thử nghiệm hàng loạt tất cả các style

```bash
cd .claude/skills/fireworks-tech-graph/scripts
./test-all-styles.sh
```

Script test sẽ tự động:
1. Đọc các file `../fixtures/*.json`
2. Gọi `generate-from-template.py` dựa trên `template_type + style`
3. Chạy `validate-svg.sh`
4. Xuất PNG sang `../test-output/`

Xem kết quả test:
```bash
ls -lh ../test-output/
```

## Khắc phục lỗi

### Lỗi: rsvg-convert not found

**Cách xử lý:**
```bash
brew install librsvg
```

### Lỗi: Permission denied (Quyền bị từ chối)

**Cách xử lý:**
```bash
chmod +x *.sh
```

### Lỗi: Xác thực SVG thất bại

**Cách xử lý:**
```bash
1. Xem thông báo lỗi chi tiết
2. Dùng công cụ Edit để sửa lỗi cú pháp
3. Chạy lại xác thực
```

## Hướng dẫn phát triển

### Thêm quy tắc xác thực mới

Chỉnh sửa `validate-svg.sh`, thêm logic kiểm tra mới sau các hạng mục kiểm tra hiện có:

```bash
# Check N: Your new check
echo -n "Checking something... "
# Logic kiểm tra của bạn ở đây
if [ condition ]; then
    echo -e "${GREEN}✓ Pass${NC}"
else
    echo -e "${RED}✗ Fail${NC}"
fi
```

### Mở rộng loại biểu đồ được hỗ trợ

Chỉnh sửa `generate-diagram.sh`, thêm loại mới vào phần xử lý tham số `--type`.

## Lịch sử phiên bản

- **v1.0.0** (2026-04-11) - Phiên bản đầu tiên
  - Script xác thực SVG
  - Script sinh biểu đồ
  - Script chạy thử nghiệm hàng loạt

## Giấy phép

Giấy phép MIT - Cùng loại với fireworks-tech-graph skill
