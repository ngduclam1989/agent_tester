import type { DbRow } from './db-client';
import { topLevelSql } from './sql-script';

/**
 * Quy tắc chấm 1 TC:
 * - ketQua : câu query cuối tự tính cột KET_QUA ('TRUE' / 'FALSE') → mọi dòng phải TRUE
 * - equal  : "Giá trị mục 1 = Giá trị mục 2"
 * - count  : "Số lượng dòng tiền gốc = 1", "Số lượng bản ghi = 0", "Không có bản ghi thỏa mãn" (= 0)...
 */
export type Expectation =
    | { kind: 'ketQua'; allowEmpty: boolean }
    | { kind: 'equal' }
    | { kind: 'count'; value: number };

/** Tên loại so sánh lưu trong cột LOAI_SO_SANH của file test data chuẩn. */
export const RULE = {
    ketQua: 'KET_QUA_TRUE',
    equal: 'BANG_NHAU',
    count: 'SO_LUONG',
} as const;

export interface QueryResult {
    sql: string;
    rows: DbRow[];
}

export interface Verdict {
    pass: boolean;
    /** Lý do đúng / sai, hiển thị trong message assertion và report */
    reason: string;
}

/** Đọc cột "Kết quả đầu ra" của file TC gốc. */
export function parseExpectedText(text: string): Expectation | undefined {
    const value = text.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (/^giá trị mục 1 = giá trị mục 2$/i.test(value)) {
        return { kind: 'equal' };
    }
    if (/^không có (bản ghi|dòng tiền)/i.test(value)) {
        return { kind: 'count', value: 0 };
    }
    const count = /^số lượng .+ = (\d+)$/i.exec(value);
    return count ? { kind: 'count', value: Number(count[1]) } : undefined;
}

/**
 * Chốt quy tắc chấm cho 1 TC. Câu cuối đã tự tính cột KET_QUA thì ưu tiên dùng KET_QUA,
 * vì đó là phép so sánh người viết TC đã mã hoá sẵn trong SQL theo đúng "Kết quả đầu ra".
 */
export function resolveExpectation(expected: Expectation, statements: string[]): Expectation {
    const last = statements[statements.length - 1] ?? '';
    if (!/\bas\s+"?ket_qua"?/i.test(last)) {
        return expected;
    }
    return { kind: 'ketQua', allowEmpty: expected.kind === 'count' && expected.value === 0 };
}

/** Ghi quy tắc ra 2 cột LOAI_SO_SANH + GIA_TRI_MONG_DOI. */
export function toRuleColumns(expectation: Expectation): { type: string; value: string } {
    switch (expectation.kind) {
        case 'ketQua':
            return { type: RULE.ketQua, value: expectation.allowEmpty ? '0' : '' };
        case 'equal':
            return { type: RULE.equal, value: '' };
        case 'count':
            return { type: RULE.count, value: String(expectation.value) };
    }
}

/** Đọc lại quy tắc từ 2 cột LOAI_SO_SANH + GIA_TRI_MONG_DOI. */
export function fromRuleColumns(type: string, value: string): Expectation | undefined {
    if (type === RULE.ketQua) {
        return { kind: 'ketQua', allowEmpty: value === '0' };
    }
    if (type === RULE.equal) {
        return { kind: 'equal' };
    }
    if (type === RULE.count && /^\d+$/.test(value)) {
        return { kind: 'count', value: Number(value) };
    }
    return undefined;
}

/** Chấm đúng / sai từ kết quả các câu query theo quy tắc đã chốt. */
export function evaluate(expectation: Expectation, results: QueryResult[]): Verdict {
    const last = results[results.length - 1];
    switch (expectation.kind) {
        case 'ketQua':
            return evaluateKetQua(expectation.allowEmpty, last.rows);
        case 'equal':
            return evaluateEqual(results);
        case 'count':
            return evaluateCount(expectation.value, last);
    }
}

function evaluateKetQua(allowEmpty: boolean, rows: DbRow[]): Verdict {
    if (rows.length === 0) {
        return allowEmpty
            ? pass('Query trả về 0 dòng, đúng kỳ vọng không có bản ghi')
            : fail('Query trả về 0 dòng, không có dữ liệu để kiểm tra cột KET_QUA');
    }
    const failed = rows.filter((row) => text(row.KET_QUA) !== 'TRUE');
    return failed.length === 0
        ? pass(`Cột KET_QUA = TRUE ở cả ${rows.length} dòng`)
        : fail(`${failed.length}/${rows.length} dòng có KET_QUA khác TRUE, vd: ${preview(failed)}`);
}

function evaluateEqual(results: QueryResult[]): Verdict {
    if (results.length === 1) {
        const rows = results[0].rows;
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        if (rows.length === 1 && columns.length >= 2) {
            return compareValues(columns[0], text(rows[0][columns[0]]), columns[1], text(rows[0][columns[1]]));
        }
        if (rows.length === 2 && columns.length === 1) {
            return compareValues('dòng 1', text(rows[0][columns[0]]), 'dòng 2', text(rows[1][columns[0]]));
        }
        return cannotEvaluate(
            `1 câu query trả về ${rows.length} dòng × ${columns.length} cột, không tách được mục 1 và mục 2`,
        );
    }

    if (results.length > 2) {
        return cannotEvaluate(`Script có ${results.length} câu query, không xác định được câu nào là mục 1 / mục 2`);
    }

    const [first, second] = results.map((result) => result.rows);
    if (first.length === 0 && second.length === 0) {
        return fail('Cả 2 query đều trả về 0 dòng, chưa có dữ liệu để so sánh');
    }
    if (isScalar(first) && isScalar(second)) {
        const [a, b] = [Object.keys(first[0])[0], Object.keys(second[0])[0]];
        return compareValues(`${a} (mục 1)`, text(first[0][a]), `${b} (mục 2)`, text(second[0][b]));
    }

    const [firstColumns, secondColumns] = [columnsOf(first), columnsOf(second)];
    if (firstColumns.length > 0 && secondColumns.length > 0 && firstColumns.length !== secondColumns.length) {
        // Khác cấu trúc cột thì không so từng giá trị được, chỉ so số bản ghi của 2 query.
        return compareValues('Số bản ghi mục 1', String(first.length), 'số bản ghi mục 2', String(second.length));
    }
    return compareRowSets(first, second);
}

function evaluateCount(expected: number, last: QueryResult): Verdict {
    const rows = last.rows;
    if (rows.length === 0) {
        return expected === 0
            ? pass('Query trả về 0 dòng, đúng kỳ vọng = 0')
            : fail(`Query trả về 0 dòng, kỳ vọng số lượng = ${expected}`);
    }

    const columns = columnsOf(rows);
    const countColumn = findCountColumn(last.sql, columns);
    if (countColumn) {
        const wrong = rows.filter((row) => text(row[countColumn]) !== String(expected));
        return wrong.length === 0
            ? pass(`${countColumn} = ${expected} ở cả ${rows.length} dòng`)
            : fail(`${wrong.length}/${rows.length} dòng có ${countColumn} khác ${expected}, vd: ${preview(wrong)}`);
    }

    if (/\bgroup\s+by\b/i.test(topLevelSql(last.sql))) {
        return cannotEvaluate(`Câu cuối đã GROUP BY nhưng không có cột đếm (COUNT) — cột trả về: ${columns.join(', ')}`);
    }
    if (expected === 0) {
        return fail(`Query trả về ${rows.length} dòng, kỳ vọng không có bản ghi, vd: ${preview(rows)}`);
    }

    // Câu cuối trả về từng dòng tiền chưa gom nhóm: đếm số dòng theo khoá ở cột đầu tiên (thường là ID_NUMBER).
    const key = columns[0];
    const perKey = new Map<string, number>();
    for (const row of rows) {
        perKey.set(text(row[key]), (perKey.get(text(row[key])) ?? 0) + 1);
    }
    const wrong = [...perKey].filter(([, count]) => count !== expected);
    return wrong.length === 0
        ? pass(`Mỗi ${key} có đúng ${expected} dòng (${perKey.size} ${key})`)
        : fail(
              `${wrong.length}/${perKey.size} ${key} có số dòng khác ${expected}, vd: ${wrong
                  .slice(0, 5)
                  .map(([id, count]) => `${id}=${count}`)
                  .join(', ')}`,
          );
}

function compareValues(leftName: string, left: string, rightName: string, right: string): Verdict {
    return left === right
        ? pass(`${leftName} = ${rightName} = ${left}`)
        : fail(`${leftName} = ${left} khác ${rightName} = ${right}`);
}

/** So sánh 2 tập dòng theo giá trị từng cột (theo thứ tự cột), không phụ thuộc thứ tự dòng hay tên cột. */
function compareRowSets(first: DbRow[], second: DbRow[]): Verdict {
    const toKeys = (rows: DbRow[]): string[] => rows.map((row) => Object.values(row).map(text).join(' | '));
    const onlyInFirst = subtract(toKeys(first), toKeys(second));
    const onlyInSecond = subtract(toKeys(second), toKeys(first));

    if (onlyInFirst.length === 0 && onlyInSecond.length === 0) {
        return pass(`Mục 1 và mục 2 khớp nhau (${first.length} dòng)`);
    }
    return fail(
        `Mục 1 có ${first.length} dòng, mục 2 có ${second.length} dòng; ` +
            `${onlyInFirst.length} dòng chỉ có ở mục 1 (vd: ${onlyInFirst.slice(0, 3).join(' ; ') || '-'}), ` +
            `${onlyInSecond.length} dòng chỉ có ở mục 2 (vd: ${onlyInSecond.slice(0, 3).join(' ; ') || '-'})`,
    );
}

/** Phần tử có trong `from` nhưng không có trong `other`, tính theo số lần xuất hiện. */
function subtract(from: string[], other: string[]): string[] {
    const remaining = new Map<string, number>();
    for (const key of other) {
        remaining.set(key, (remaining.get(key) ?? 0) + 1);
    }
    return from.filter((key) => {
        const count = remaining.get(key) ?? 0;
        if (count > 0) {
            remaining.set(key, count - 1);
            return false;
        }
        return true;
    });
}

/** Cột đếm trong kết quả: alias của COUNT(...) trong SQL, hoặc tên cột bắt đầu bằng CNT / SO_LUONG. */
function findCountColumn(sql: string, columns: string[]): string | undefined {
    const aliases = [...sql.matchAll(/count\s*\((?:[^()]|\([^()]*\))*\)\s*(?:as\s+)?"?([a-z_]\w*)"?/gi)].map((match) =>
        match[1].toUpperCase(),
    );
    return [...columns].reverse().find((column) => aliases.includes(column) || /^(CNT|SO_LUONG)/i.test(column));
}

const isScalar = (rows: DbRow[]): boolean => rows.length === 1 && Object.keys(rows[0]).length === 1;

const columnsOf = (rows: DbRow[]): string[] => (rows.length > 0 ? Object.keys(rows[0]) : []);

/** Chuẩn hoá giá trị để so sánh: NUMBER đã là chuỗi (fetchAsString), bỏ số 0 thừa; DATE đổi sang ISO. */
function text(value: unknown): string {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    const raw = String(value).trim();
    if (!/^-?\d*\.?\d+$/.test(raw)) {
        return raw;
    }
    const normalized = raw.includes('.') ? raw.replace(/0+$/, '').replace(/\.$/, '') : raw;
    // Oracle trả 0.5 dạng ".5"
    return normalized.replace(/^(-?)\./, (_, sign: string) => `${sign}0.`);
}

const preview = (rows: DbRow[]): string => JSON.stringify(rows.slice(0, 3));

const pass = (reason: string): Verdict => ({ pass: true, reason });

const fail = (reason: string): Verdict => ({ pass: false, reason });

const cannotEvaluate = (reason: string): Verdict => ({
    pass: false,
    reason: `Không tự chấm được theo "Kết quả đầu ra": ${reason}`,
});
