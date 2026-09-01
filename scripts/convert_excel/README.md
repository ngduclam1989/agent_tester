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
| **Line breaks** | Các bước test (`<br>`) chuyển thành xuống dòng trong cell |
| **Clean text** | Tự động xóa emoji, backtick markdown |

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
