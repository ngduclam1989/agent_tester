# Bản sửa API framework (dựa trên C:\playwright_Demo) — CHỜ REVIEW

> Toàn bộ nằm trong scratchpad. **Chưa copy vào `c:\agent_tester`, chưa cài package nào.**

## Bảng ánh xạ lỗi → cách sửa

| # | Lỗi trong bản gốc | Cách sửa | File |
|---|---|---|---|
| 1 | `apidemo2.spec.ts` trùng 100% `apidemo.spec.ts`, cùng tên describe → chạy nhân đôi 92 TC | Gộp còn 1 spec, đặt tên theo nghiệp vụ `product-add.spec.ts`, describe duy nhất | `tests/api/product-add.spec.ts` |
| 2 | Credentials + login URL hardcode trong source | Đọc từ biến môi trường qua `config/env.ts`, có `.env.example`, `.env` đã vào `.gitignore` | `config/env.ts`, `common/api-common.ts`, `.env.example` |
| 3 | `responseBody` khai báo trong `try` → vẫn `undefined` khi body không phải JSON | **KHÔNG SỬA — giữ nguyên bản gốc theo yêu cầu.** Vẫn `try { response.json() } catch { response.text() }` ngay trong test, `validateJsonNodes` nhận thẳng `responseBody` | `utils/api-function.ts`, `tests/api/product-add.spec.ts` |
| 4 | `assertTest()` tự throw Error → fail tầng 1 là tầng 2, 3 không chạy | Chuyển sang `expect.soft()` của Playwright — 1 lần chạy báo đủ cả 3 tầng, có message tiếng Việt rõ ràng | `utils/api-function.ts` |
| 5 | Ajv không có `ajv-formats` → `"format": "email"/"date-time"` bị bỏ qua âm thầm | Thêm `addFormats(ajv)` + `allErrors: true`, in gộp toàn bộ lỗi schema | `utils/api-function.ts` |
| 6 | `if (!row[STT]) break;` → 1 dòng trống giữa file là mất hết TC phía sau | **KHÔNG SỬA — giữ nguyên bản gốc theo yêu cầu.** Vẫn `break` khi gặp dòng thiếu STT, không có test `Data sanity` | `tests/api/product-add.spec.ts` |
| 7 | `lstatSync` gọi trước `existsSync` → ném ENOENT thô; `slice(0)` khiến header lọt vào data | **KHÔNG SỬA — giữ nguyên bản gốc theo yêu cầu.** Thứ tự check và `slice(startRow - headerRow)` giữ như cũ, spec vẫn duyệt từ index 1 | `utils/excel-reader.ts` |
| 8 | Ngập `console.log` in request/response ra stdout (vi phạm rule Cleanup) | Đính kèm request/response vào report bằng `testInfo.attach()`; bỏ `console.log` trong `writeExcelData` | `tests/api/product-add.spec.ts`, `utils/excel-reader.ts` |
| 9 | `test-data/data/url.ts` khai 3 URL nhưng không nơi nào dùng; domain nằm trong Excel | Base URL tập trung ở `config/env.ts`; cột `${Domain}` chỉ còn là override tuỳ chọn, trống thì lấy từ env | `config/env.ts`, `tests/api/product-add.spec.ts` |
| 10 | `screenshot: 'on'` áp cho cả suite API (không mở browser); import `expect`/biến `tcCount` thừa | Tách `projects` api/web; web dùng `only-on-failure` + viewport 1920x1080; xoá hết import và biến không dùng | `playwright.config.ts` |

> **Quyết định của bạn (chốt ngày 01/09):** lỗi **#3, #6, #7 để nguyên bản gốc**, không sửa. Bảng trên đã cập nhật đúng trạng thái thực tế của code.

### Sửa kèm (không nằm trong 10 lỗi đã báo)
- `replaceDataWithRandom()`: escape ký tự đặc biệt trước khi build RegExp, và giá trị thay thế đổi sang **timestamp + random** để traceable đúng rule CLAUDE.md mục 7 (số random thuần không truy ngược được lần chạy nào tạo bản ghi).
- `login()` kiểm tra thiếu `access_token` và in body lỗi thay vì để `undefined` trôi vào header `Bearer undefined`.
- `writeExcelData()` bỏ `type: 'binary'` dùng sai, chỉ giữ `bookType: 'xlsx'` (phần `extractNumber`/chữ ký hàm giữ nguyên bản gốc).
- File schema khai trong Excel mà không tồn tại: giữ hành vi gốc là **cảnh báo, không fail test** — nhưng ghi vào report qua `testInfo.attach()` thay vì `console.log`.

## Cấu trúc đã dựng

```
api-framework-fixed/
├── .env.example              # mẫu biến môi trường (KHÔNG chứa credentials thật)
├── .gitignore
├── package.json              # thêm ajv-formats, dotenv; script tách api/web
├── playwright.config.ts
├── tsconfig.json
├── common/api-common.ts      # login, createAuthHeaders, replaceDataWithRandom
├── config/env.ts             # config tập trung + resolveUrl
├── utils/api-function.ts     # parseResponse, validate 3 tầng, helper chung
├── utils/excel-reader.ts     # readExcel, writeExcelData
├── tests/api/product-add.spec.ts
└── test-data/json_schema/    # 2 schema copy từ demo (chưa sửa)
```

## Đã kiểm tra tới đâu

- ✅ Cú pháp: cả 6 file `.ts` pass `node --experimental-strip-types --check`; `package.json` + `tsconfig.json` parse OK (đã check lại sau khi revert #3/#6/#7).
- ❌ **Chưa chạy test thật, chưa `npm install`, chưa type-check bằng `tsc`** — scratchpad không có `node_modules`, và theo quy ước của bạn tôi không tự cài package.

## Việc còn thiếu để chạy được

1. Copy sang project thật + `npm i` (`@playwright/test`, `ajv`, `ajv-formats`, `xlsx`, `dotenv`, `monocart-reporter`).
2. Copy `test-data/data/test_addAPI.xlsx` từ demo sang.
3. Tạo `.env` từ `.env.example`, điền `API_USERNAME` / `API_PASSWORD` (bản demo đang dùng `admin_role`).
4. Chạy `npm run test:api` và fix nếu còn lỗi type/runtime.
