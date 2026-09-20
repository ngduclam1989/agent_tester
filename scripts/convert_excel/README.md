# 📊 MD to XLSX Converter

Convert file Test Cases sang Excel (`.xlsx`) có format đẹp, sẵn sàng chia sẻ.

## Các script trong thư mục này

| Script | Dùng cho | Input | Output |
|---|---|---|---|
| `md_to_xlsx.js` | **TC UI** (schema 9 cột của `rbt_manual_testing`) | bảng Markdown `.md` | `.xlsx` |
| `api_tsv_to_md_xlsx.js` | **TC API** (schema 19 cột của `api_test_design`) | `.tsv` 19 cột | `.md` **và** `.xlsx` (có tô màu, 2 sheet: `API Test Cases` + `Tong hop`) |
| `reorder_api_tc.js` | Sắp xếp lại thứ tự dòng TC API theo nhóm/block | `.tsv` | `.tsv` |

## Yêu cầu

- **Node.js** ≥ 16

## Thư viện

| Thư viện | Vai trò |
|---|---|
| `xlsx` (SheetJS Community) | Đọc/ghi cấu trúc file Excel. **Không ghi được style** — mọi định dạng bị nuốt khi ghi |
| `xlsx-js-style` | Fork của SheetJS, API y hệt nhưng **ghi được** fill/font/border/wrap text. `api_tsv_to_md_xlsx.js` dùng bản này để tô màu |

> ⚠️ `npm audit` báo 1 lỗ hổng high trên `xlsx@0.18.5` (Prototype Pollution + ReDoS) và
> **không có bản vá trên npm registry** vì SheetJS đã chuyển sang phát hành ở CDN riêng.
> Các script ở đây chạy cục bộ và chỉ đọc file do chính project sinh ra nên rủi ro thực tế thấp.

## Cài đặt

```bash
cd scripts/convert_excel
npm install
```

## Cách dùng

```bash
# Từ thư mục gốc project
node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
```

### Ví dụ

```bash
# Output tự động cùng thư mục, cùng tên (đuôi .xlsx)
node scripts/convert_excel/md_to_xlsx.js requirements/crm/test_cases_crm_login.md

# Chỉ định output path
node scripts/convert_excel/md_to_xlsx.js requirements/crm/test_cases_crm_login.md output/crm_login.xlsx
```

## Đầu vào (Input)

File Markdown chứa bảng test cases theo format:

```markdown
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------| 
| TC_001 | ... | 🔴 High | ... | ... | Step 1<br>Step 2 | ... | Critical | ... |
```

> **Lưu ý:** Script tự động nhận diện tất cả các bảng có cột `TC ID` trong file.

## Đầu ra (Output)

File `.xlsx` với các tính năng:

| Tính năng | Mô tả |
|-----------|-------|
| **Column widths** | Tự động set độ rộng phù hợp cho từng cột |
| **Freeze panes** | Cố định dòng header khi cuộn |
| **AutoFilter** | Bộ lọc tự động trên header |
| **Outline group** | Nút `+/−` ở lề trái để đóng/mở cụm TC dưới mỗi dòng tiêu đề nhóm |
| **Line breaks** | Các bước test (`<br>`) chuyển thành xuống dòng trong cell |
| **Clean text** | Tự động xóa emoji, backtick markdown |
| **Quote-prefix** | Bật dấu `'` (text-force) cho mọi ô — ô mở đầu bằng `- `/`=`/`+` không bị Excel hiểu nhầm là công thức khi người dùng sửa rồi Enter. Dấu `'` chỉ hiện trên thanh công thức, không nằm trong nội dung ô |

## Bảng màu file .xlsx

Áp tự động trong **cả 2 converter** (`api_tsv_to_md_xlsx.js` và `md_to_xlsx.js`). File mẫu
để đối chiếu: `.claude/skills/rbt_manual_testing/templates/TC_mau_API.xlsx` (19 cột) và
`TC_mau_UI.xlsx` (9 cột) — cả hai do chính 2 script này sinh ra:

| Dòng | Nền | Chữ |
|---|---|---|
| Header (tên cột) | `2F5597` navy | Arial 10 đậm, trắng, căn giữa |
| Dòng nhóm cấp 1 | `9DC3E6` xanh vừa | Arial 10 đậm |
| Dòng nhóm cấp 2 | `BDD7EE` xanh nhạt | Arial 10 đậm |
| Dòng Test Case | trắng | Arial 10 thường, wrap text, căn trên |

Hai cấp nhóm được suy ra khác nhau tùy loại file:

| Converter | Nhóm cấp 1 | Nhóm cấp 2 |
|---|---|---|
| `api_tsv_to_md_xlsx.js` (TC API) | dòng nhóm mở đầu 1 NHÓM RỦI RO | dòng nhóm của các block tiếp theo trong cùng nhóm |
| `md_to_xlsx.js` (TC UI) | `**NHÓM ...**` | `**— Trường: ...**` (nhóm con tách theo từng trường trong nhóm Validate) |

Viền mảnh `4472C4`, freeze dòng header, bật AutoFilter. Nhãn dòng nhóm được bỏ dấu `**` khi
ghi sang Excel (chỉ `.md` mới cần `**` để in đậm).

## Outline group (đóng/mở cụm TC)

Dòng Test Case luôn nằm ở cấp outline thấp nhất, dòng tiêu đề nhóm giữ cấp trên nó:

| Converter | Cấp 0 | Cấp 1 | Cấp 2 |
|---|---|---|---|
| `api_tsv_to_md_xlsx.js` | dòng tiêu đề block | dòng Test Case | — |
| `md_to_xlsx.js` | dòng `**NHÓM ...**` | dòng `**— Trường: ...**`, hoặc TC khi nhóm không có nhóm con | dòng Test Case nằm trong nhóm con |

Cả 2 script set `ws["!outline"] = { above: true }` (tức `summaryBelow = false`) vì dòng tiêu đề
nhóm nằm **trên** cụm TC — bỏ dòng này thì Excel gắn nút `+/−` lệch xuống dòng cuối của cụm.

### Vá outline cho file `.xlsx` đã bàn giao trước đó

File sinh trước khi có tính năng này (và `.tsv` nguồn đã xoá theo quy trình) thì không chạy lại
converter được. Cách xử lý: **vá thẳng XML bên trong file `.xlsx`**, giữ nguyên byte của mọi
phần khác nên style, độ rộng cột, AutoFilter và sheet `Tong hop` không suy suyển. Dòng tiêu đề
nhóm được nhận diện bằng đúng contract của nó — **chỉ cột A có giá trị, 18 cột còn lại rỗng**
(lưu ý các ô rỗng vẫn tồn tại dưới dạng `<v></v>` chứ không bị lược bỏ, nên phải so nội dung
chứ không đếm số thẻ `<c>`):

```python
import zipfile, re

SRC = "TC_XXX.xlsx"          # file cần vá
OUT = "TC_XXX_outline.xlsx"  # ghi ra file mới rồi mới đè lên bản gốc

zin   = zipfile.ZipFile(SRC)
sheet = zin.read("xl/worksheets/sheet1.xml").decode("utf-8")

row_re  = re.compile(r'(<row [^>]*r="(\d+)"[^>]*>)(.*?)</row>', re.S)
cell_re = re.compile(r'<c r="([A-Z]+)\d+"[^>]*?(?:/>|>(.*?)</c>)', re.S)
val_re  = re.compile(r'<v>(.*?)</v>', re.S)

def patch(m):
    open_tag, rnum, body = m.group(1), int(m.group(2)), m.group(3)
    if rnum == 1:                       # dòng header, giữ nguyên
        return m.group(0)
    nonempty = [col for col, inner in cell_re.findall(body)
                if (v := val_re.search(inner or "")) and v.group(1).strip()]
    if nonempty == ["A"]:               # dòng tiêu đề nhóm → cấp 0
        return m.group(0)
    return open_tag[:-1] + ' outlineLevel="1">' + body + "</row>"

sheet = row_re.sub(patch, sheet)
sheet = sheet.replace('<dimension ref=',
                      '<sheetPr><outlinePr summaryBelow="0"/></sheetPr><dimension ref=', 1)

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "xl/worksheets/sheet1.xml":
            data = sheet.encode("utf-8")
        zout.writestr(item, data)
```

Sau khi vá, **bắt buộc verify** trước khi đè lên bản gốc: đọc lại file bằng `xlsx-js-style`,
kiểm tra số dòng, số cột và tên 2 sheet khớp bản gốc; đối chiếu số dòng tiêu đề nhóm + số TC
phải bằng tổng số dòng dữ liệu.

Cách này chỉ dùng cho file cũ — file sinh mới đã tự có outline.
