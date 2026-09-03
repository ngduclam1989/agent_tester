import { test, expect } from '@playwright/test';
import * as path from 'path';
import { readExcel, ExcelRow } from '../../utils/excel-reader';
import { validateStatusCode, validateSchema, loadSchema, findKeyInJson } from '../../utils/api-function';
import { amlEnv, resolveUrl } from '../../config/env';

/**
 * API AML Transaction Screening (MSB) — data-driven từ bộ 327 manual TC.
 *
 * Nguồn TC : practices/testcases/msb-aml-tf/api/TC_AML_TRANSACTION_SCREENING_API 5.xlsx
 * Data chạy: test-data/data/test_aml_screening.xlsx (bản convert sang schema automation)
 *
 * Bản v5 dựng lại toàn bộ Test Data theo cURL thật của SIT: header đúng thứ tự cURL
 * (Authorization `Basic YWE6YmI=`, `branchCd VN0001001`, thêm `requestUserId` và `Cookie`),
 * envelope SWIFT dạng Output, và bản tin thật cho các TC trước đây chỉ ghi câu mô tả.
 *
 * Dòng nào có cột `${Run}` = No sẽ bị skip kèm lý do ở cột `${SkipReason}` — đây là các TC
 * không thể tự động hoá tất định (TC gộp nhiều request, TC thiếu Body ở file nguồn, mâu thuẫn
 * dữ liệu, hoặc cần dựng lỗi phía server).
 */

// Service SIT dùng chứng chỉ tự ký nên phải bỏ qua lỗi TLS cho riêng suite này.
test.use({ ignoreHTTPSErrors: true });

/** Tên cột trong file test-data/data/test_aml_screening.xlsx. */
const COL = {
    TCID: '${TCID}',
    NAME: '${Name}',
    DOMAIN: '${Domain}',
    ENDPOINT: '${EndPoint}',
    METHOD: '${Method}',
    CONTENT_TYPE: '${ContentType}',
    AUTH_MODE: '${AuthMode}',
    HEADERS: '${Headers}',
    DATA: '${Data}',
    STATUS: '${StatusCode}',
    SCHEMA: '${ResponseStructure}',
    PARAM: '${ResponseParam}',
    VALUE: '${ResponseValue}',
    RUN: '${Run}',
    SKIP_REASON: '${SkipReason}',
    NOTE: '${Note}',
} as const;

const EXCEL_PATH = path.join(__dirname, '..', '..', 'test-data', 'data', 'test_aml_screening.xlsx');
const SHEET_NAME = 'Sheet1';

const cell = (row: ExcelRow, key: string): string =>
    row[key] === undefined || row[key] === null ? '' : String(row[key]);

// Phần tử 0 của readExcel là dòng header nên bỏ qua; chỉ giữ dòng có mã TC.
const testData: ExcelRow[] = readExcel(EXCEL_PATH, SHEET_NAME)
    .slice(1)
    .filter((row) => cell(row, COL.TCID).trim() !== '');

/**
 * Dựng request từ 1 dòng Excel.
 *
 * `AuthMode` quyết định header Authorization:
 * - `as-is` — TC ghi rõ giá trị Authorization (kể cả sai cố ý) → giữ nguyên chuỗi trong TC.
 * - `none`  — TC kiểm thử trường hợp thiếu Authorization → không gắn header.
 * - `env`   — TC không ghi Authorization nhưng Pre-condition yêu cầu tài khoản hợp lệ
 *             → lấy Basic Auth từ biến môi trường.
 */
function buildRequest(row: ExcelRow) {
    const domain = cell(row, COL.DOMAIN).trim() || amlEnv.baseUrl;
    const method = (cell(row, COL.METHOD) || 'POST').toUpperCase();

    const headers: Record<string, string> = {};
    const rawHeaders = cell(row, COL.HEADERS).trim();
    if (rawHeaders) {
        for (const [k, v] of Object.entries(JSON.parse(rawHeaders) as Record<string, unknown>)) {
            headers[k] = v === undefined || v === null ? '' : String(v);
        }
    }

    const contentType = cell(row, COL.CONTENT_TYPE).trim();
    if (contentType) headers['Content-Type'] = contentType;

    const authMode = cell(row, COL.AUTH_MODE).trim() || 'env';
    if (authMode === 'env') headers['Authorization'] = amlEnv.basicAuthHeader;
    else if (authMode === 'none') delete headers['Authorization'];

    return {
        url: resolveUrl(domain, cell(row, COL.ENDPOINT)),
        method,
        headers,
        // Body thô: bản tin SWIFT MT (text), XML ISO 20022, hoặc JSON.
        body: method === 'GET' || method === 'HEAD' ? undefined : cell(row, COL.DATA),
    };
}

/**
 * Tách cặp node/giá trị cần assert từ 2 cột `${ResponseParam}` và `${ResponseValue}`.
 * `expected` = undefined nghĩa là chỉ kiểm tra node tồn tại — dùng cho các TC mô tả
 * giá trị mở như "No-HIT hoặc HIT".
 */
function parseExpectedNodes(row: ExcelRow): Array<{ key: string; expected?: string | null }> {
    const params = cell(row, COL.PARAM).trim();
    if (!params) return [];
    const values = cell(row, COL.VALUE).split(';');

    return params
        .split(';')
        .map((raw, i) => ({ key: raw.trim(), rawValue: (values[i] ?? '').trim() }))
        .filter((p) => p.key !== '')
        .map(({ key, rawValue }) => {
            if (rawValue === '') return { key };
            if (rawValue === 'null') return { key, expected: null };
            return { key, expected: rawValue };
        });
}

test.describe('API AML Transaction Screening (data-driven từ Excel)', () => {
    for (const row of testData) {
        const tcId = cell(row, COL.TCID);

        test(`${tcId} — ${cell(row, COL.NAME)}`, async ({ request }, testInfo) => {
            if (cell(row, COL.RUN).trim().toLowerCase() !== 'yes') {
                test.skip(true, `Không tự động hoá được: ${cell(row, COL.SKIP_REASON)}`);
            }

            const note = cell(row, COL.NOTE);
            if (note) testInfo.annotations.push({ type: 'Chuẩn hoá dữ liệu', description: note });

            const req = buildRequest(row);

            await testInfo.attach('request', {
                body: JSON.stringify(
                    { method: req.method, url: req.url, headers: req.headers, body: req.body },
                    null,
                    2
                ),
                contentType: 'application/json',
            });

            const response = await request.fetch(req.url, {
                method: req.method,
                headers: req.headers,
                ...(req.body === undefined ? {} : { data: req.body }),
            });

            const rawText = await response.text();
            let responseBody: any = rawText;
            try {
                responseBody = JSON.parse(rawText);
            } catch {
                // Response không phải JSON (lỗi tầng hạ tầng) — giữ nguyên text để đọc log.
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

            // Tầng 1 — HTTP status code theo cột ${StatusCode}
            validateStatusCode(response, Number(cell(row, COL.STATUS)));

            // Tầng 2 — cấu trúc response theo JSON Schema ở cột ${ResponseStructure}
            const schemaPath = cell(row, COL.SCHEMA).trim();
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

            // Tầng 3 — giá trị từng node theo cột ${ResponseParam} / ${ResponseValue}
            for (const node of parseExpectedNodes(row)) {
                const actual = findKeyInJson(responseBody, node.key);

                if (node.expected === undefined) {
                    expect
                        .soft(actual, `[${tcId}] node "${node.key}" phải tồn tại trong response`)
                        .not.toBeUndefined();
                    continue;
                }
                if (node.expected === null) {
                    expect.soft(actual, `[${tcId}] node "${node.key}" phải bằng null`).toBeNull();
                    continue;
                }
                expect
                    .soft(
                        actual === null || actual === undefined ? actual : String(actual),
                        `[${tcId}] node "${node.key}"`
                    )
                    .toBe(node.expected);
            }
        });
    }
});
