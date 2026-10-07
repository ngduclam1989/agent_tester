import * as path from 'path';
import { readExcel, type ExcelRow } from '../../utils/excel-reader';
import { evaluate, fromRuleColumns, type QueryResult } from '../../utils/expected-result';
import { expect, test } from '../fixtures/db.fixture';

/**
 * TEST_BNK — chạy các câu query của từng TC, chấm đúng / sai theo quy tắc từ cột "Kết quả đầu ra".
 *
 * Đọc file test data chuẩn test-data/db/test-bnk-db-cases.xlsx, sinh từ file TC gốc bằng
 * `npm run convert:test-bnk`. Sửa SQL hay kết quả mong đợi thì sửa file gốc rồi convert lại.
 * TC có TRANG_THAI_SCRIPT = LOI FAIL ngay ở Bước 2 với lý do ở cột LY_DO, không gửi query xuống DB.
 * Quy tắc chấm: utils/expected-result.ts.
 */

const EXCEL_PATH = path.join(__dirname, '..', '..', 'test-data', 'db', 'test-bnk-db-cases.xlsx');
const SHEET_NAME = 'Cases';

const cell = (row: ExcelRow, key: string): string =>
    row[key] === undefined || row[key] === null ? '' : String(row[key]).trim();

// Phần tử 0 của readExcel là dòng header nên bỏ qua.
const cases = readExcel(EXCEL_PATH, SHEET_NAME)
    .slice(1)
    .filter((row) => cell(row, 'TC_ID') !== '')
    .map((row) => ({
        id: cell(row, 'TC_ID'),
        sourceRow: cell(row, 'DONG_GOC'),
        title: cell(row, 'MO_TA').slice(0, 80),
        expectedText: cell(row, 'KET_QUA_DAU_RA'),
        expectation: fromRuleColumns(cell(row, 'LOAI_SO_SANH'), cell(row, 'GIA_TRI_MONG_DOI')),
        scriptOk: cell(row, 'TRANG_THAI_SCRIPT') === 'OK',
        issues: cell(row, 'LY_DO'),
        statements: Object.keys(row)
            .filter((key) => /^SQL_\d+$/.test(key))
            .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
            .map((key) => cell(row, key))
            .filter((sql) => sql !== ''),
    }));

test.describe('TEST_BNK - chạy Script và chấm theo Kết quả đầu ra', () => {
    for (const tc of cases) {
        // File gốc có mã TC trùng nhau nên tên test kèm số dòng ở file gốc để phân biệt và tra ngược.
        test(`${tc.id} (dòng ${tc.sourceRow}) - ${tc.title} @db`, async ({ db }, testInfo) => {
            const results: QueryResult[] = [];

            await test.step('Bước 1: Kết nối DB', async () => {
                expect(await db.ping(), 'Không truy vấn được bảng DUAL sau khi kết nối DB').toBe(true);
            });

            await test.step('Bước 2: Kiểm tra Script và Kết quả đầu ra', async () => {
                expect(tc.scriptOk, `[${tc.id}] Script lỗi, không chạy: ${tc.issues}`).toBe(true);
                expect(tc.expectation, `[${tc.id}] Không có quy tắc chấm cho "${tc.expectedText}"`).toBeDefined();
            });

            await test.step(`Bước 3: Chạy ${tc.statements.length} câu query`, async () => {
                for (const [index, sql] of tc.statements.entries()) {
                    const rows = await db.query(sql);
                    results.push({ sql, rows });
                    await testInfo.attach(`sql-${index + 1}.txt`, { body: sql, contentType: 'text/plain' });
                    await testInfo.attach(`ket-qua-sql-${index + 1}.json`, {
                        body: JSON.stringify({ rowCount: rows.length, first20Rows: rows.slice(0, 20) }, null, 2),
                        contentType: 'application/json',
                    });
                }
            });

            await test.step(`Bước 4: Chấm theo Kết quả đầu ra "${tc.expectedText}"`, async () => {
                const verdict = evaluate(tc.expectation!, results);
                await testInfo.attach('ket-luan.txt', { body: verdict.reason, contentType: 'text/plain' });
                expect(verdict.pass, `[${tc.id}] ${verdict.reason}`).toBe(true);
            });
        });
    }
});
