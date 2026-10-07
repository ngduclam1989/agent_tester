import type { DataSource } from '../../utils/data-source';
import type { DbBinds } from '../../utils/db-client';

export interface DbVerifyCase {
    id: string;
    title: string;
    /** Nơi chứa câu SQL: file txt, hoặc một ô Excel (sheet + cột + dòng) */
    sql: DataSource;
    /** Giá trị cho các bind biến :ten_bien trong câu SQL */
    binds?: DbBinds;
    expected: {
        /** Số dòng mong đợi. Bỏ trống = chỉ cần có ít nhất 1 dòng. */
        rowCount?: number;
        /** Tên cột cần kiểm tra ở dòng đầu tiên (Oracle trả tên cột CHỮ HOA) */
        column?: string;
        /** Giá trị mong đợi: ghi trực tiếp, hoặc trỏ tới file txt / ô Excel */
        value?: string | DataSource;
    };
}

/**
 * Thêm test case mới = thêm một phần tử vào mảng này, không cần sửa file spec.
 * Hai case mẫu dưới đây truy vấn bảng DUAL nên chạy được trên mọi Oracle DB,
 * dùng để kiểm tra kết nối trước khi thay bằng câu SQL nghiệp vụ.
 */
export const dbVerifyCases: DbVerifyCase[] = [
    {
        id: 'DB_001',
        title: 'SQL lấy từ file txt',
        sql: { type: 'txt', file: 'db/sql/sample-query.txt' },
        binds: { status: 'SUCCESS' },
        expected: { rowCount: 1, column: 'STATUS', value: 'SUCCESS' },
    },
    {
        id: 'DB_002',
        title: 'SQL và kết quả mong đợi lấy từ Excel',
        sql: { type: 'excel', file: 'db/db-queries.xlsx', sheet: 'Queries', column: 'B', row: 2 },
        binds: { amount: 1500000 },
        expected: {
            rowCount: 1,
            column: 'AMOUNT',
            value: { type: 'excel', file: 'db/db-queries.xlsx', sheet: 'Queries', column: 'C', row: 2 },
        },
    },
];
