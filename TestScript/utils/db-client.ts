import oracledb from 'oracledb';
import { dbEnv } from '../config/env';

export type DbBinds = Record<string, string | number | Date | null>;
export type DbRow = Record<string, unknown>;

let thickModeReady = false;

/**
 * Lớp DUY NHẤT được import 'oracledb'.
 * Chỉ cho phép câu lệnh đọc (SELECT / WITH) vì SQL được nạp từ file bên ngoài.
 */
export class DbClient {
    private pool?: oracledb.Pool;

    async init(): Promise<void> {
        const { user, password, connectString, clientLibDir } = dbEnv;

        if (clientLibDir && !thickModeReady) {
            oracledb.initOracleClient({ libDir: clientLibDir });
            thickModeReady = true;
        }

        // NUMBER và CLOB trả về dạng chuỗi: không mất độ chính xác số tiền / ID dài,
        // và so sánh được trực tiếp với giá trị mong đợi đọc từ txt / Excel.
        oracledb.fetchAsString = [oracledb.NUMBER, oracledb.CLOB];

        this.pool = await oracledb.createPool({
            user,
            password,
            connectString,
            poolMin: 0,
            poolMax: 4,
        });
    }

    async query<T extends DbRow = DbRow>(sql: string, binds: DbBinds = {}): Promise<T[]> {
        if (!this.pool) {
            throw new Error('DbClient chưa được khởi tạo. Hãy dùng fixture `db`.');
        }
        const statement = normalizeSql(sql);
        assertReadOnly(statement);

        const conn = await this.pool.getConnection();
        try {
            conn.callTimeout = 30_000;
            const result = await conn.execute<T>(statement, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            });
            return result.rows ?? [];
        } finally {
            await conn.close();
        }
    }

    /** Kiểm tra kết nối còn sống. Trả về true nếu truy vấn được bảng DUAL. */
    async ping(): Promise<boolean> {
        const rows = await this.query<{ OK: string }>('SELECT 1 AS OK FROM dual');
        return rows.length === 1;
    }

    async close(): Promise<void> {
        if (this.pool) {
            await this.pool.close(0);
            this.pool = undefined;
        }
    }
}

/** Bỏ comment và dấu `;` cuối câu (oracledb báo ORA-00933 nếu còn dấu `;`). */
export function normalizeSql(sql: string): string {
    return sql
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split(/\r?\n/)
        .map((line) => line.replace(/--.*$/, ''))
        .join('\n')
        .trim()
        .replace(/;\s*$/, '')
        .trim();
}

export function assertReadOnly(statement: string): void {
    if (!statement) {
        throw new Error('Câu SQL rỗng.');
    }
    if (!/^(select|with)\b/i.test(statement)) {
        throw new Error(`Chỉ cho phép câu lệnh SELECT / WITH. Nhận được: "${statement.slice(0, 60)}..."`);
    }
    if (statement.includes(';')) {
        throw new Error('Mỗi lần chỉ chạy một câu lệnh, không được chứa dấu ";" ở giữa.');
    }
}
