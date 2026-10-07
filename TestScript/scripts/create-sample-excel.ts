import * as path from 'path';
import * as XLSX from 'xlsx';

/**
 * Tạo file Excel mẫu test-data/db/db-queries.xlsx. Chạy: npm run sample:excel
 * Sheet "Queries": dòng 1 là tiêu đề, ô B2 chứa SQL, ô C2 chứa giá trị mong đợi.
 */
const rows = [
    ['TC_ID', 'SQL', 'EXPECTED'],
    ['DB_002', 'SELECT :amount AS AMOUNT FROM dual', '1500000'],
];

const sheet = XLSX.utils.aoa_to_sheet(rows);
// Mọi ô để định dạng Text để Excel không tự đổi "000123" thành 123 hay đổi ngày tháng.
for (const address of Object.keys(sheet).filter((key) => !key.startsWith('!'))) {
    sheet[address].t = 's';
    sheet[address].z = '@';
}
sheet['!cols'] = [{ wch: 12 }, { wch: 70 }, { wch: 20 }];

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, sheet, 'Queries');

const out = path.resolve(__dirname, '..', 'test-data', 'db', 'db-queries.xlsx');
XLSX.writeFile(workbook, out);
process.stdout.write(`Đã tạo ${out}\n`);
