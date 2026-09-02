import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { APIResponse, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FIX #5: bật addFormats để các "format" trong JSON Schema (email, date-time, uri...)
 * thực sự được validate, thay vì bị Ajv bỏ qua âm thầm.
 * allErrors: true để báo hết lỗi schema trong 1 lần chạy.
 */
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * So sánh HTTP Status Code.
 * FIX #4: dùng expect.soft của Playwright thay cho throw Error thủ công — test vẫn chạy tiếp
 * xuống bước schema và JSON node, nên 1 lần chạy báo đủ cả 3 tầng lỗi thay vì chỉ tầng đầu.
 */
export function validateStatusCode(response: APIResponse, expectedStatus: number): void {
    expect
        .soft(response.status(), `[Step 1] HTTP Status — mong đợi ${expectedStatus}`)
        .toBe(expectedStatus);
}

function formatSchemaErrors(errors: ErrorObject[] | null | undefined): string {
    if (!errors?.length) return 'không rõ nguyên nhân';
    return errors
        .map((e) => `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim())
        .join(' | ');
}

/** So sánh JSON Schema với response body. */
export async function validateSchema(response: APIResponse, schema: object): Promise<void> {
    let responseBody: any;
    try {
        responseBody = await response.json();
    } catch {
        responseBody = await response.text();
    }

    const validate = ajv.compile(schema);
    const isValid = validate(responseBody);
    expect
        .soft(isValid, `[Step 2] Schema validation — ${formatSchemaErrors(validate.errors)}`)
        .toBe(true);
}

/**
 * Đọc file JSON Schema theo đường dẫn tương đối tính từ thư mục gốc project (TestScript/).
 * Neo theo `__dirname` chứ không phải `process.cwd()`, nên chạy test từ thư mục nào
 * cũng tìm đúng file — kể cả khi copy nguyên thư mục TestScript sang repo khác.
 */
export function loadSchema(relativePath: string): object | null {
    const fullPath = path.resolve(__dirname, '..', relativePath);
    if (!fs.existsSync(fullPath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

/** Tìm giá trị của 1 key trong JSON: hỗ trợ path có dấu chấm hoặc deep-search theo tên key. */
function findKeyInJson(obj: any, targetKey: string): any {
    if (targetKey.includes('.')) {
        return targetKey.split('.').reduce((acc, part) => (acc === null || acc === undefined ? acc : acc[part]), obj);
    }

    const search = (current: any): any => {
        if (current === null || typeof current !== 'object') return undefined;
        if (targetKey in current) return current[targetKey];

        const children = Array.isArray(current) ? current : Object.values(current);
        for (const child of children) {
            const found = search(child);
            if (found !== undefined) return found;
        }
        return undefined;
    };

    return search(obj);
}

/**
 * Kiểm tra nhiều node key-value từ chuỗi cấu hình cách nhau bằng dấu ";".
 * VD: params = "code;data.id", values = "200;123". Value rỗng = chỉ kiểm tra node tồn tại.
 */
export function validateJsonNodes(
    responseBody: any,
    responseParams: unknown,
    responseValues: unknown
): void {
    const paramsRaw = responseParams === undefined || responseParams === null ? '' : String(responseParams).trim();
    if (paramsRaw === '') return;

    const params = paramsRaw.split(';');
    const values = (responseValues === undefined || responseValues === null ? '' : String(responseValues)).split(';');

    params.forEach((rawKey, index) => {
        const key = rawKey.trim();
        if (!key) return;

        const expectedRaw = (values[index] ?? '').trim();
        const actual = findKeyInJson(responseBody, key);

        if (expectedRaw === '') {
            expect
                .soft(actual, `[Step 3] JSON Node — node "${key}" phải tồn tại trong response`)
                .not.toBeUndefined();
            return;
        }

        const expected = Number.isNaN(Number(expectedRaw)) ? expectedRaw : Number(expectedRaw);
        expect.soft(actual, `[Step 3] JSON Node — "${key}"`).toBe(expected);
    });
}

// ============================================================
// HELPER DÙNG CHUNG
// ============================================================

/** Sinh chuỗi số ngẫu nhiên độ dài cho trước. */
export function generateRandomNumber(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

/** Sinh chuỗi ngẫu nhiên từ tập ký tự cho trước. */
export function generateRandomText(
    length: number,
    options: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += options.charAt(Math.floor(Math.random() * options.length));
    }
    return result;
}

/** Lấy ngày hiện tại (UTC) cộng thêm addDays ngày, định dạng dd/mm/yyyy. */
export function getCurrentDateAndAddDays(addDays: number = 0): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + addDays);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getUTCFullYear()}`;
}

/** Lấy ngày hiện tại (UTC) định dạng dd/mm/yyyy. */
export function getCurrentDate(): string {
    return getCurrentDateAndAddDays(0);
}

/** Xoá file (nếu tồn tại) trước khi chạy test. */
export function removeFileBeforeRunTest(relativeFilePath: string): void {
    const fullPath = path.resolve(process.cwd(), relativeFilePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}
