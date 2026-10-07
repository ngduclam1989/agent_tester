# Database Rules (Oracle)

Quy tắc bắt buộc khi agent sinh hoặc sửa code có truy vấn Oracle Database trong automation framework Playwright (TypeScript).

Áp dụng cho mọi code nằm trong `TestScript/`. Đọc kèm:

- `.claude/rules/automation_rules.md`
- `.claude/rules/playwright_rules.md`

---

## 1. Phạm vi sử dụng DB trong test

DB chỉ được dùng cho 3 mục đích:

| Mục đích | Câu lệnh cho phép | Đặt ở đâu |
|---|---|---|
| **Verify** — kiểm tra dữ liệu sau thao tác UI/API | `SELECT` | Trong test, qua fixture `db` |
| **Setup** — chuẩn bị data mà UI/API không tạo được | `INSERT`, `UPDATE` | Fixture hoặc `beforeEach` |
| **Cleanup** — dọn data do chính test tạo ra | `DELETE`, `UPDATE` | Fixture teardown hoặc `afterEach` |

- KHÔNG dùng DB để thay cho bước nghiệp vụ mà test case yêu cầu thực hiện qua UI/API.
- KHÔNG assert trên DB khi kết quả đã kiểm tra được qua UI/API, trừ khi test case ghi rõ bước verify DB.
- TUYỆT ĐỐI KHÔNG chạy DDL (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`) hay `GRANT` từ test.

---

## 2. Thư viện và chế độ kết nối

- Thư viện duy nhất: `oracledb` (node-oracledb, driver chính thức của Oracle). KHÔNG tự đổi sang ORM hay driver khác.
- Mặc định chạy **Thin mode** (không cần Oracle Instant Client).
- Chỉ bật **Thick mode** khi có một trong các điều kiện sau, và phải ghi lý do trong `README.md` của `TestScript/`:
  - DB bật Native Network Encryption (lỗi thường gặp: `NJS-500`, `ORA-12660`)
  - DB phiên bản cũ hơn 12.1
  - Cần tính năng Thin mode chưa hỗ trợ
- Khi dùng Thick mode: gọi `oracledb.initOracleClient()` đúng một lần, trước khi tạo pool, và đường dẫn thư viện đọc từ biến môi trường `ORACLE_CLIENT_LIB_DIR`.

---

## 3. Cấu trúc file (Mandatory)

```
TestScript/
├── .env.example                # Thêm DB_USER, DB_PASSWORD, DB_CONNECT_STRING
├── config/
│   └── env.ts                  # `dbEnv`: đọc biến DB, không hardcode
├── utils/
│   ├── db-client.ts            # Lớp DUY NHẤT được import 'oracledb'
│   ├── data-source.ts          # Đọc SQL / giá trị mong đợi từ txt hoặc ô Excel
│   └── excel-reader.ts         # Bộ đọc Excel dùng chung (`readExcelCell`), không thêm thư viện Excel thứ hai
├── common/
│   └── db-queries.ts           # Hàm truy vấn theo nghiệp vụ, chứa câu SQL
├── test-data/
│   └── db/
│       ├── db-verify-cases.ts  # Danh sách test case verify DB (data-driven)
│       ├── db-queries.xlsx     # SQL + giá trị mong đợi theo sheet / cột / dòng
│       └── sql/                # File .txt / .sql, mỗi file một câu SELECT
└── tests/
    ├── db/
    │   └── db-verify.spec.ts   # Spec chạy các case trong db-verify-cases.ts
    └── fixtures/
        └── db.fixture.ts       # Fixture `db` (scope: worker)
```

- Chỉ `utils/db-client.ts` được `import 'oracledb'`. Page Object, spec và file khác KHÔNG import trực tiếp.
- Page Object KHÔNG chứa truy vấn DB. Page chỉ chứa tương tác UI.
- Câu SQL KHÔNG viết inline trong file `.spec.ts`. SQL chỉ được nằm ở một trong hai nơi:
  - Hàm có tên theo nghiệp vụ trong `common/db-queries.ts`, ví dụ `getTransactionStatus(db, transactionId)` — dùng khi verify DB là một bước trong test UI/API.
  - File dữ liệu trong `test-data/db/` (txt hoặc ô Excel), đọc qua `utils/data-source.ts` — dùng cho test verify DB dạng data-driven. Xem mục 5.4.
- SQL dài hơn 15 dòng: tách ra file trong `test-data/db/sql/`.

---

## 4. Quản lý kết nối

- Dùng **connection pool** (`oracledb.createPool`), KHÔNG mở kết nối lẻ cho từng truy vấn.
- Pool được tạo và đóng trong fixture `db` với `scope: 'worker'`. KHÔNG tạo pool trong `beforeEach`, trong spec hay ở biến global.
- Mỗi lần lấy connection PHẢI trả lại pool trong khối `finally`.
- `poolMax` không vượt quá 4 cho mỗi worker, để tổng số session không vượt giới hạn của DB test khi chạy song song.
- Đặt `callTimeout` (khuyến nghị 30 giây) để truy vấn treo không làm treo cả lượt chạy.

```ts
// ✅ Đúng
const conn = await this.pool.getConnection();
try {
  const res = await conn.execute<T>(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  return res.rows ?? [];
} finally {
  await conn.close();
}
```

---

## 5. Viết truy vấn

### 5.1 Bind biến (Mandatory)

Mọi giá trị đưa vào SQL PHẢI qua bind biến. TUYỆT ĐỐI KHÔNG nối chuỗi hay dùng template string để chèn giá trị.

```ts
// ❌ Sai
await db.query(`SELECT status FROM transactions WHERE id = '${id}'`);

// ✅ Đúng
await db.query('SELECT status FROM transactions WHERE id = :id', { id });
```

Tên bảng và tên cột không bind được: chỉ được viết sẵn trong câu SQL (trong code hoặc trong file SQL ở `test-data/db/`), KHÔNG ghép từ biến, test data sinh tự động hay input bên ngoài.

### 5.2 Chọn cột và giới hạn kết quả

- KHÔNG dùng `SELECT *`. Liệt kê rõ cột cần dùng.
- Truy vấn có thể trả nhiều dòng PHẢI có `ORDER BY` và giới hạn bằng `FETCH FIRST n ROWS ONLY`.
- Điều kiện `WHERE` phải đủ hẹp để chỉ trúng data của test hiện tại (theo ID hoặc prefix traceable), không dựa vào "dòng mới nhất trong bảng".

### 5.3 Kiểu dữ liệu trả về

| Kiểu Oracle | Lưu ý | Cách xử lý |
|---|---|---|
| Tên cột | Oracle trả về CHỮ HOA | Khai báo interface với key chữ hoa, hoặc đặt alias trong dấu nháy kép |
| `NUMBER` (số tiền, ID dài) | Có thể mất độ chính xác khi chuyển sang `number` của JS | Lấy dạng chuỗi (`TO_CHAR` trong SQL hoặc `fetchTypeHandler`) rồi so sánh chuỗi |
| `DATE`, `TIMESTAMP` | Trả về `Date` theo múi giờ máy chạy test | So sánh sau khi chuẩn hóa múi giờ; không so sánh chuỗi định dạng |
| `CLOB` | Mặc định trả về stream | Cấu hình `fetchAsString` cho `CLOB` trong `db-client.ts` |
| Chuỗi rỗng | Oracle lưu `''` thành `NULL` | Assert `toBeNull()`, không assert `toBe('')` |

Kết quả truy vấn PHẢI có kiểu rõ ràng (`db.query<TransactionRow>(...)`), KHÔNG dùng `any`.

### 5.4 SQL nạp từ file txt / Excel

Áp dụng khi câu SQL nằm trong `test-data/db/` và được chỉ định bằng đường dẫn file (txt) hoặc sheet + cột + dòng (Excel).

- Chỉ cho phép câu lệnh bắt đầu bằng `SELECT` hoặc `WITH`. `db-client.ts` PHẢI chặn mọi câu lệnh khác trước khi gửi xuống DB.
- Mỗi nguồn chỉ chứa MỘT câu lệnh. Không có dấu `;` ở giữa; dấu `;` cuối câu được tự bỏ.
- Giá trị thay đổi theo test case vẫn đi qua bind biến `:ten_bien`, khai báo trong `binds` của case. KHÔNG sửa trực tiếp giá trị trong câu SQL cho từng case.
- Ô Excel chứa SQL và giá trị mong đợi để định dạng **Text**, để Excel không tự đổi `000123` thành `123` hay đổi ngày tháng.
- File SQL và file Excel là một phần của test: PHẢI commit vào repo và được review như code.
- Khi nguồn không tồn tại (sai file, sai tên sheet, ô trống), test PHẢI fail với message nêu rõ file, sheet và địa chỉ ô.

---

## 6. Ghi dữ liệu và transaction

- Câu lệnh ghi PHẢI commit tường minh (`autoCommit: true` cho lệnh đơn, hoặc `commit()` sau nhóm lệnh). Lỗi giữa chừng PHẢI `rollback()`.
- Data do test tạo PHẢI unique và traceable, dùng cùng quy ước prefix với `test_data_generator` (ví dụ `AT_<timestamp>_<random>`).
- Cleanup chỉ được xóa data khớp prefix của chính lượt chạy đó. TUYỆT ĐỐI KHÔNG `DELETE` hoặc `UPDATE` thiếu `WHERE`.
- Cleanup đặt trong teardown của fixture để vẫn chạy khi test fail.
- Trước mọi lệnh ghi, `db-client.ts` PHẢI kiểm tra môi trường: nếu `ENV` là `prod` thì ném lỗi và dừng.

---

## 7. Chờ dữ liệu bất đồng bộ

Khi DB được cập nhật sau UI/API (job, queue, batch), dùng `expect.poll()`. KHÔNG dùng `waitForTimeout()` và KHÔNG tự viết vòng lặp `sleep`.

```ts
// ✅ Đúng
await expect
  .poll(() => getTransactionStatus(db, transactionId), {
    timeout: 30_000,
    intervals: [1_000, 2_000, 5_000],
    message: `Trạng thái giao dịch ${transactionId} chưa chuyển sang SUCCESS`,
  })
  .toBe('SUCCESS');
```

---

## 8. Assertion và báo cáo

- Kiểm tra số dòng trả về trước khi đọc giá trị, để lỗi "không tìm thấy bản ghi" không bị che thành lỗi `undefined`.
- Mỗi assertion DB có message nêu rõ bảng, khóa tra cứu và giá trị mong đợi.
- Đính câu SQL, bind và kết quả vào report bằng `testInfo.attach()`. KHÔNG dùng `console.log`.
- Trước khi đính vào report PHẢI che dữ liệu nhạy cảm: số tài khoản, số thẻ, CCCD, số điện thoại, mật khẩu, token.

---

## 9. Bảo mật

- Thông tin kết nối chỉ nằm trong `.env` (đã gitignore). `.env.example` chỉ chứa tên biến, không chứa giá trị thật.
- Dùng user DB riêng cho automation, quyền tối thiểu: `SELECT` trên các bảng cần verify, quyền ghi chỉ trên bảng cần setup/cleanup.
- KHÔNG dùng user `SYS`, `SYSTEM` hay user schema owner của ứng dụng.
- KHÔNG in connection string hoặc mật khẩu ra log, report hay message lỗi.
- Trên CI, biến DB lấy từ secret của pipeline.

---

## 10. Anti-Patterns (FORBIDDEN)

| ❌ Anti-Pattern | ✅ Đúng cách |
|---|---|
| Nối chuỗi giá trị vào SQL | Bind biến `:ten_bien` |
| `import oracledb` trong spec hoặc Page Object | Chỉ import trong `utils/db-client.ts` |
| SQL inline trong `.spec.ts` | Hàm nghiệp vụ trong `common/db-queries.ts` |
| Mở kết nối mới cho mỗi truy vấn | Pool trong fixture `db` scope worker |
| Quên `conn.close()` khi truy vấn lỗi | `try / finally` |
| `SELECT *` | Liệt kê cột |
| `waitForTimeout()` chờ DB cập nhật | `expect.poll()` |
| `DELETE` không `WHERE`, `TRUNCATE` | Xóa theo prefix traceable của lượt chạy |
| Hardcode user/password/connect string | `.env` + `dbEnv` trong `config/env.ts` |
| Chạy `INSERT` / `UPDATE` / `DELETE` nạp từ txt / Excel | File dữ liệu chỉ chứa `SELECT` / `WITH` |
| `console.log(rows)` | `testInfo.attach()` sau khi che dữ liệu nhạy cảm |
| So sánh số tiền bằng `number` | So sánh chuỗi |
| Kết quả kiểu `any` | Interface cho từng truy vấn |

---

## 11. Checklist trước khi hoàn thành

Agent PHẢI tự kiểm tra trước khi báo xong:

- [ ] `oracledb` chỉ được import trong `utils/db-client.ts`
- [ ] Mọi truy vấn dùng bind biến
- [ ] Không có SQL inline trong spec, không có truy vấn DB trong Page Object
- [ ] SQL nạp từ txt / Excel chỉ là một câu `SELECT` / `WITH`, và ô Excel để định dạng Text
- [ ] Connection luôn được trả lại pool trong `finally`
- [ ] Data do test tạo có prefix traceable và có cleanup trong teardown
- [ ] Không có `waitForTimeout()` để chờ DB
- [ ] Không có credentials trong code, log hay report
- [ ] `.env.example` đã có đủ `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING`
- [ ] Đã chạy test thật và truy vấn trả về kết quả đúng kỳ vọng
