import { dbVerifyCases } from '../../test-data/db/db-verify-cases';
import { describeSource, readSource } from '../../utils/data-source';
import type { DbRow } from '../../utils/db-client';
import { expect, test } from '../fixtures/db.fixture';

test.describe('Kiểm tra dữ liệu Oracle DB theo câu SQL từ file', () => {
    for (const tc of dbVerifyCases) {
        test(`${tc.id} - ${tc.title} @db`, async ({ db }, testInfo) => {
            let rows: DbRow[] = [];

            await test.step('Bước 1: Kết nối DB', async () => {
                expect(await db.ping(), 'Không truy vấn được bảng DUAL sau khi kết nối DB').toBe(true);
            });

            await test.step(`Bước 2: Chạy query lấy từ ${describeSource(tc.sql)}`, async () => {
                const sql = readSource(tc.sql);
                rows = await db.query(sql, tc.binds ?? {});

                await testInfo.attach('sql.txt', { body: sql, contentType: 'text/plain' });
                await testInfo.attach('ket-qua-query.json', {
                    body: JSON.stringify({ rowCount: rows.length, first20Rows: rows.slice(0, 20) }, null, 2),
                    contentType: 'application/json',
                });
            });

            await test.step('Bước 3: Xác nhận kết quả', async () => {
                const { rowCount, column, value } = tc.expected;

                if (rowCount === undefined) {
                    expect(rows.length, `[${tc.id}] Query không trả về dòng nào`).toBeGreaterThan(0);
                } else {
                    expect(rows.length, `[${tc.id}] Số dòng trả về không đúng`).toBe(rowCount);
                }

                if (column !== undefined && value !== undefined) {
                    expect(rows.length, `[${tc.id}] Không có dòng nào để kiểm tra cột ${column}`).toBeGreaterThan(0);

                    const key = column.toUpperCase();
                    const firstRow = rows[0];
                    expect(Object.keys(firstRow), `[${tc.id}] Kết quả không có cột ${key}`).toContain(key);

                    const expectedValue = typeof value === 'string' ? value : readSource(value);
                    const actualValue = firstRow[key];
                    expect(
                        actualValue === null ? null : String(actualValue),
                        `[${tc.id}] Giá trị cột ${key} ở dòng đầu tiên không đúng`,
                    ).toBe(expectedValue);
                }
            });
        });
    }
});
