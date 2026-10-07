import * as path from 'path';
import * as XLSX from 'xlsx';
import { readExcel, type ExcelRow } from '../utils/excel-reader';
import { parseExpectedText, resolveExpectation, toRuleColumns } from '../utils/expected-result';
import { findScriptIssues, parseSqlScript } from '../utils/sql-script';

/**
 * Convert file TC gốc TEST_BNK_Testdata.xlsx (sheet "Testcase") sang file test data chuẩn
 * test-data/db/test-bnk-db-cases.xlsx mà tests/db/test-bnk-script-verify.spec.ts đọc.
 * Chạy: npm run convert:test-bnk
 *
 * File chuẩn: mỗi TC 1 dòng, mỗi câu query 1 ô SQL_1, SQL_2... (đã bỏ comment, chép khối WITH
 * dùng chung để từng câu chạy độc lập), kèm quy tắc chấm và trạng thái script.
 */

const SOURCE = path.resolve(__dirname, '..', 'test-data', 'db', 'TEST_BNK_Testdata.xlsx');
const SOURCE_SHEET = 'Testcase';
const OUTPUT = path.resolve(__dirname, '..', 'test-data', 'db', 'test-bnk-db-cases.xlsx');
const EXCEL_CELL_LIMIT = 32_767;

/** Tên cột trong sheet Testcase của file gốc. */
const SRC = {
    TCID: 'Mã TC',
    MODULE: 'Nghiệp vụ',
    TITLE: 'Mô tả',
    EXPECTED: 'Kết quả đầu ra',
    SCRIPT: 'Script',
} as const;

const cell = (row: ExcelRow, key: string): string =>
    row[key] === undefined || row[key] === null ? '' : String(row[key]).trim();

// Phần tử 0 của readExcel là dòng header (dòng 1 trên Excel), nên phần tử i là dòng i + 1.
const cases = readExcel(SOURCE, SOURCE_SHEET)
    .map((row, index) => ({ row, excelRow: index + 1 }))
    .slice(1)
    .filter(({ row }) => cell(row, SRC.TCID) !== '' && cell(row, SRC.SCRIPT) !== '')
    .map(({ row, excelRow }) => {
        const script = parseSqlScript(cell(row, SRC.SCRIPT));
        const expectedText = cell(row, SRC.EXPECTED).replace(/\s+/g, ' ');
        const parsed = parseExpectedText(expectedText);
        const issues = findScriptIssues(script);
        if (!parsed) {
            issues.push(expectedText ? `Không đọc được Kết quả đầu ra: "${expectedText}"` : 'Chưa có Kết quả đầu ra');
        }
        const rule = parsed ? toRuleColumns(resolveExpectation(parsed, script.statements)) : { type: '', value: '' };

        return {
            TC_ID: cell(row, SRC.TCID),
            DONG_GOC: String(excelRow),
            NGHIEP_VU: cell(row, SRC.MODULE),
            MO_TA: cell(row, SRC.TITLE).replace(/\s+/g, ' '),
            KET_QUA_DAU_RA: expectedText,
            LOAI_SO_SANH: rule.type,
            GIA_TRI_MONG_DOI: rule.value,
            SO_CAU_QUERY: String(script.statements.length),
            TRANG_THAI_SCRIPT: issues.length === 0 ? 'OK' : 'LOI',
            LY_DO: issues.join('\n'),
            statements: script.statements,
        };
    });

const maxStatements = Math.max(...cases.map((tc) => tc.statements.length));
const sqlHeaders = Array.from({ length: maxStatements }, (_, index) => `SQL_${index + 1}`);
const headers = [
    'TC_ID', 'DONG_GOC', 'NGHIEP_VU', 'MO_TA', 'KET_QUA_DAU_RA', 'LOAI_SO_SANH',
    'GIA_TRI_MONG_DOI', 'SO_CAU_QUERY', 'TRANG_THAI_SCRIPT', 'LY_DO', ...sqlHeaders,
] as const;

const rows = cases.map(({ statements, ...tc }) => {
    for (const sql of statements) {
        if (sql.length > EXCEL_CELL_LIMIT) {
            throw new Error(`${tc.TC_ID} (dòng ${tc.DONG_GOC}): câu SQL dài ${sql.length} ký tự, vượt giới hạn 1 ô Excel`);
        }
    }
    return [...Object.values(tc), ...sqlHeaders.map((_, index) => statements[index] ?? '')];
});

const casesSheet = XLSX.utils.aoa_to_sheet([[...headers], ...rows]);
// Mọi ô để dạng Text để Excel không tự đổi mã TC, số dòng hay giá trị mong đợi.
for (const address of Object.keys(casesSheet).filter((key) => !key.startsWith('!'))) {
    casesSheet[address].t = 's';
    casesSheet[address].z = '@';
}
casesSheet['!cols'] = headers.map((header) => ({ wch: header.startsWith('SQL_') ? 80 : header === 'LY_DO' ? 50 : 18 }));
casesSheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: headers.length - 1 } }) };

const tally = new Map<string, number>();
for (const tc of cases) {
    const key = `${tc.TRANG_THAI_SCRIPT}\t${tc.LOAI_SO_SANH || '(không có)'}\t${tc.SO_CAU_QUERY}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
}
const summary = [
    ['TRANG_THAI_SCRIPT', 'LOAI_SO_SANH', 'SO_CAU_QUERY', 'SO_TC'],
    ...[...tally].sort().map(([key, count]) => [...key.split('\t'), String(count)]),
    ['Tổng', '', '', String(cases.length)],
];

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, casesSheet, 'Cases');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'TongHop');
XLSX.writeFile(workbook, OUTPUT);

process.stdout.write(`Đã tạo ${OUTPUT}\n${summary.map((line) => line.join('\t')).join('\n')}\n`);
