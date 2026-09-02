import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export type ExcelRow = Record<string, any>;

const headerRow: number = 1; // Fixed header row
const startRow: number = 1;  // Fixed start row

/**
 * Đọc 1 sheet Excel thành mảng object, key = tên cột ở dòng header.
 * Giữ nguyên hành vi bản gốc: phần tử đầu tiên của mảng trả về vẫn là dòng header,
 * nên spec phải duyệt từ index 1.
 */
export function readExcel(filePath: string, sheetName: string): ExcelRow[] {
    const resolvedPath = path.resolve(filePath);

    // Check if the path is a directory
    if (fs.lstatSync(resolvedPath).isDirectory()) {
        throw new Error(`Path is a directory, not a file: ${resolvedPath}`);
    }

    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`);
    }

    const workbook = XLSX.readFile(resolvedPath);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        const availableSheets = workbook.SheetNames.join(', ');
        throw new Error(
            `Sheet "${sheetName}" not found in file "${resolvedPath}". Available sheets: ${availableSheets}`
        );
    }

    // Convert the sheet to JSON starting from the specified header row
    const range = XLSX.utils.decode_range(sheet['!ref']!);
    range.s.r = headerRow - 1;
    sheet['!ref'] = XLSX.utils.encode_range(range);

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headers: string[] = rows[0] as string[];

    return rows.slice(startRow - headerRow).map((row) => {
        const rowData: ExcelRow = {};
        row.forEach((cell: any, index: number) => {
            rowData[headers[index]] = cell;
        });
        return rowData;
    });
}

/**
 * Ghi 1 giá trị vào ô Excel.
 * FIX #8: bỏ console.log; bỏ `type: 'binary'` dùng sai, chỉ giữ bookType xlsx.
 */
export function writeExcelData(
    filePath: string,
    sheetName: string,
    row: string,
    column: string,
    value: string
): void {
    const writeRow: number = extractNumber(row) + startRow - 1;
    const workbook = XLSX.readFile(filePath, { cellStyles: true, cellFormula: true });
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error(`Worksheet ${sheetName} not found`);
    }

    const cellAddress = `${column}${writeRow}`;
    const cleanValue = String(value).replace(/\x1b\[[0-9;]*m/g, '');

    worksheet[cellAddress] = { t: 's', v: cleanValue };
    XLSX.writeFile(workbook, filePath, { bookType: 'xlsx', bookSST: false });
}

function extractNumber(str: string): number {
    const match = str.match(/FN_(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
}
