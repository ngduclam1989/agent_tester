import * as fs from 'fs';
import * as path from 'path';
import { readExcelCell } from './excel-reader';

/** Nội dung nằm trong cả một file .txt / .sql */
export interface TxtSource {
    type: 'txt';
    /** Đường dẫn tính từ thư mục test-data/ */
    file: string;
}

/** Nội dung nằm trong một ô Excel, chỉ định bằng sheet + cột + dòng */
export interface ExcelSource {
    type: 'excel';
    /** Đường dẫn tính từ thư mục test-data/ */
    file: string;
    sheet: string;
    /** Chữ cái cột, ví dụ 'B' */
    column: string;
    /** Số dòng như hiển thị trên Excel, bắt đầu từ 1 */
    row: number;
}

export type DataSource = TxtSource | ExcelSource;

const TEST_DATA_DIR = path.resolve(__dirname, '..', 'test-data');

export function describeSource(source: DataSource): string {
    return source.type === 'txt'
        ? `txt: ${source.file}`
        : `excel: ${source.file} | sheet "${source.sheet}" | ô ${source.column.toUpperCase()}${source.row}`;
}

/** Đọc nội dung từ file txt hoặc từ một ô Excel. Ném lỗi rõ ràng nếu không tìm thấy hoặc rỗng. */
export function readSource(source: DataSource): string {
    const filePath = path.resolve(TEST_DATA_DIR, source.file);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Không tìm thấy file dữ liệu: ${filePath}`);
    }

    if (source.type === 'txt') {
        const content = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '').trim();
        if (!content) {
            throw new Error(`File rỗng: ${filePath}`);
        }
        return content;
    }

    const address = `${source.column.toUpperCase()}${source.row}`;
    const text = readExcelCell(filePath, source.sheet, address).trim();
    if (!text) {
        throw new Error(`Ô ${address} của sheet "${source.sheet}" trong ${source.file} đang trống.`);
    }
    return text;
}
