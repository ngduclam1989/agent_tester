import { test } from '@playwright/test';
import * as path from 'path';
import { readExcel, ExcelRow } from '../../utils/excel-reader';
import { login, createAuthHeaders, replaceDataWithRandom } from '../../common/api-common';
import {
    validateStatusCode,
    validateSchema,
    validateJsonNodes,
    loadSchema,
} from '../../utils/api-function';
import { env, resolveUrl } from '../../config/env';

// Tên các cột trong file Excel test data
const COL = {
    STT: '${STT}',
    NAME: '${Name}',
    DOMAIN: '${Domain}',
    ENDPOINT: '${EndPoint}',
    METHOD: '${Method}',
    DATA: '${Data}',
    STATUS: '${StatusCode}',
    SCHEMA: '${ResponseStructure}',
    PARAM: '${ResponseParam}',
    VALUE: '${ResponseValue}',
} as const;

const EXCEL_PATH = path.join(__dirname, '..', '..', 'test-data', 'data', 'test_addAPI.xlsx');
const SHEET_NAME = 'Sheet1';

const testData: ExcelRow[] = readExcel(EXCEL_PATH, SHEET_NAME);

test.describe('API — Thêm sản phẩm (data-driven từ Excel)', () => {
    let token: string;

    test.beforeAll(async ({ request }) => {
        token = await login(request);
    });

    // Duyệt từ index 1 vì phần tử 0 là dòng header do readExcel trả về.
    for (let i = 1; i < testData.length; i++) {
        const row = testData[i];

        // Cột STT không có giá trị thì dừng đọc data.
        if (!row[COL.STT]) break;

        const tcName = `TC${row[COL.STT]} - ${row[COL.NAME]}`;

        test(tcName, async ({ request }, testInfo) => {
            const url = resolveUrl(
                String(row[COL.DOMAIN] ?? '').trim() || env.apiBaseUrl,
                String(row[COL.ENDPOINT] ?? '')
            );
            const method = String(row[COL.METHOD] ?? 'GET').toUpperCase();
            const headers = createAuthHeaders(token);

            const rawData = replaceDataWithRandom(String(row[COL.DATA] ?? '{}'), '9999');
            let requestData: unknown;
            try {
                requestData = JSON.parse(rawData);
            } catch {
                requestData = rawData; // Data không phải JSON hợp lệ — gửi nguyên chuỗi
            }

            // FIX #8: đính kèm request/response vào report thay vì console.log ra stdout
            await testInfo.attach('request', {
                body: JSON.stringify({ method, url, headers, body: requestData }, null, 2),
                contentType: 'application/json',
            });

            const response = await request.fetch(url, { method, headers, data: requestData });

            let responseBody: any;
            try {
                responseBody = await response.json();
            } catch {
                responseBody = await response.text();
            }

            await testInfo.attach('response', {
                body: JSON.stringify(
                    {
                        status: `${response.status()} ${response.statusText()}`,
                        headers: response.headers(),
                        body: responseBody,
                    },
                    null,
                    2
                ),
                contentType: 'application/json',
            });

            // Tầng 1 — HTTP status code
            validateStatusCode(response, Number(row[COL.STATUS]));

            // Tầng 2 — JSON Schema (đường dẫn lấy từ cột ${ResponseStructure})
            const schemaPath = String(row[COL.SCHEMA] ?? '').trim();
            if (schemaPath) {
                const schema = loadSchema(path.join('test-data', schemaPath));
                if (schema) {
                    await validateSchema(response, schema);
                } else {
                    await testInfo.attach('schema-warning', {
                        body: `Không tìm thấy file schema khai báo trong Excel: ${schemaPath}`,
                        contentType: 'text/plain',
                    });
                }
            }

            // Tầng 3 — kiểm tra node cụ thể trong response body
            validateJsonNodes(responseBody, row[COL.PARAM], row[COL.VALUE]);
        });
    }
});
