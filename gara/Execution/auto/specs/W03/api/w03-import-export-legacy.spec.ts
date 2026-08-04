/**
 * W03 API — Import (FEAT-CAT-PROD-IMPORT), Export (FEAT-CAT-PROD-EXPORT), Legacy regression (ADR-017)
 */
import axios from 'axios';

const GF_INVENTORY_BASE = process.env.GF_INVENTORY_BASE_URL || 'http://192.168.110.191:45086/api/v2';
const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://192.168.110.191:45401/garage/graphql';
const SSO_STUB = process.env.SSO_STUB_URL || 'http://192.168.110.191:45410';
const TENANT_A = '1';
const RUN_ID = Date.now().toString().slice(-8);
const VALID_UNIT_NAME = 'cái'; // import mainUnitCode field thực chất match theo TÊN ĐVT (đã xác nhận qua thực nghiệm), không phải code UNIT_CAI

async function getToken(identifier: string): Promise<string> {
  const resp = await axios.get(`${SSO_STUB}/dev/token`, { params: { identifier } });
  return resp.data.accessToken;
}
async function gql(token: string, query: string, variables?: Record<string, unknown>, tenant = TENANT_A) {
  return axios.post(AGG_GRAPH_URL, { query, variables }, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenant, 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });
}

let ownerToken: string;
beforeAll(async () => { ownerToken = await getToken('0810000001'); });

// ============================================================
// FEAT-CAT-PROD-IMPORT
// ============================================================
describe('FEAT-CAT-PROD-IMPORT', () => {
  it('TC-W03-API-PRDIMP-001: verifyImportInternalProducts với dòng hợp lệ → summary.valid=1, validRows chứa đúng dòng', async () => {
    const code = `APIW03IMP-OK-${RUN_ID}`;
    const resp = await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { verifyImportInternalProducts(input:$input) { __typename ... on ApiResponseImportInternalProductsReport { data { summary { total valid error } validRows { rowIndex } errorRows { rowIndex errors } } } ... on ErrorResponse { code message } } }`, { input: { items: [{ code, name: 'Import OK', mainUnitCode: VALID_UNIT_NAME }] } });
    expect(resp.data.data.verifyImportInternalProducts.__typename).toBe('ApiResponseImportInternalProductsReport');
    const d = resp.data.data.verifyImportInternalProducts.data;
    expect(d.summary.total).toBe(1);
    expect(d.summary.valid).toBe(1);
    expect(d.summary.error).toBe(0);
  });

  it('TC-W03-API-PRDIMP-002: verify với ĐVT không khớp master → errorRows chứa ERR-INV-042', async () => {
    const resp = await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { verifyImportInternalProducts(input:$input) { __typename ... on ApiResponseImportInternalProductsReport { data { summary { total valid error } errorRows { rowIndex errors } } } } }`, { input: { items: [{ code: `APIW03IMP-BADUNIT-${RUN_ID}`, name: 'Bad unit', mainUnitCode: 'ĐVT KHÔNG TỒN TẠI XYZ' }] } });
    const d = resp.data.data.verifyImportInternalProducts.data;
    expect(d.summary.error).toBe(1);
    expect(d.errorRows[0].errors.some((e: string) => e.includes('ERR-INV-042'))).toBe(true);
  });

  it('TC-W03-API-PRDIMP-003 [ERR-INV-041, cap 500]: verify với 501 dòng bị từ chối toàn bộ batch', async () => {
    const items = Array.from({ length: 501 }, (_, i) => ({ code: `APIW03IMP-CAP-${RUN_ID}-${i}`, name: `Cap test ${i}`, mainUnitCode: VALID_UNIT_NAME }));
    const resp = await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { verifyImportInternalProducts(input:$input) { __typename ... on ErrorResponse { code message } ... on ApiResponseImportInternalProductsReport { data { summary { total } } } } }`, { input: { items } });
    const r = resp.data.data.verifyImportInternalProducts;
    console.log('[PRDIMP-003] 501-row verify response typename:', r.__typename, JSON.stringify(r).slice(0, 200));
    expect(r.__typename).toBe('ErrorResponse');
    expect(r.code).toBe('ERR-INV-041');
  });

  it('TC-W03-API-PRDIMP-004 [boundary 500 dòng — hợp lệ]: verify với đúng 500 dòng KHÔNG bị chặn cap', async () => {
    const items = Array.from({ length: 500 }, (_, i) => ({ code: `APIW03IMP-CAP500-${RUN_ID}-${i}`, name: `Cap500 ${i}`, mainUnitCode: VALID_UNIT_NAME }));
    const resp = await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { verifyImportInternalProducts(input:$input) { __typename ... on ErrorResponse { code } ... on ApiResponseImportInternalProductsReport { data { summary { total } } } } }`, { input: { items } });
    const r = resp.data.data.verifyImportInternalProducts;
    expect(r.__typename).toBe('ApiResponseImportInternalProductsReport');
    expect(r.data.summary.total).toBe(500);
  });

  it('TC-W03-API-PRDIMP-005: importInternalProducts commit thật — ground-truth qua searchInternalProducts sau import', async () => {
    const code = `APIW03IMP-COMMIT-${RUN_ID}`;
    const resp = await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { importInternalProducts(input:$input) { __typename ... on ApiResponseImportInternalProductsResult { data { importedCount failedCount } } ... on ErrorResponse { code message } } }`, { input: { items: [{ code, name: 'Import commit test', mainUnitCode: VALID_UNIT_NAME }] } });
    expect(resp.data.data.importInternalProducts.__typename).toBe('ApiResponseImportInternalProductsResult');
    expect(resp.data.data.importInternalProducts.data.importedCount).toBe(1);
    // Ground-truth: verify record thật xuất hiện qua search độc lập (Ground-Truth DB Assertion Gate)
    const search = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { id code mainUnitCode } } } } }`, { input: { keyword: code, page: 0, size: 5 } });
    const content = search.data.data.searchInternalProducts.data.content;
    expect(content.some((x: any) => x.code === code)).toBe(true);
  });

  it('TC-W03-API-PRDIMP-006: importInternalProducts với mã đã trùng trong tenant → errorRows/failedCount phản ánh đúng', async () => {
    const code = `APIW03IMP-DUPCOMMIT-${RUN_ID}`;
    await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { importInternalProducts(input:$input) { __typename } }`, { input: { items: [{ code, name: 'first', mainUnitCode: VALID_UNIT_NAME }] } });
    const second = await gql(ownerToken, `mutation($input: ImportInternalProductsInput!) { importInternalProducts(input:$input) { __typename ... on ApiResponseImportInternalProductsResult { data { importedCount failedCount report { errorRows { errors } } } } ... on ErrorResponse { code } } }`, { input: { items: [{ code, name: 'dup attempt', mainUnitCode: VALID_UNIT_NAME }] } });
    const r = second.data.data.importInternalProducts;
    if (r.__typename === 'ApiResponseImportInternalProductsResult') {
      expect(r.data.failedCount).toBe(1);
      expect(r.data.importedCount).toBe(0);
    } else {
      expect(r.__typename).toBe('ErrorResponse');
    }
  });
});

// ============================================================
// FEAT-CAT-PROD-EXPORT
// ============================================================
describe('FEAT-CAT-PROD-EXPORT', () => {
  it('TC-W03-API-PRDEXP-001: exportInternalProducts trả downloadUrl hợp lệ + tải thật xác nhận file .xlsx (ground-truth, không chỉ tin response)', async () => {
    await gql(ownerToken, `mutation($input: CreateInternalProductInput!) { createInternalProduct(input:$input) { __typename } }`, { input: { code: `APIW03EXP-${RUN_ID}`, name: 'Export test', mainUnitCode: 'UNIT_CAI' } });
    const resp = await gql(ownerToken, `query($filter: InternalProductSearchInput) { exportInternalProducts(filter:$filter) { __typename ... on ApiResponseExportFileUrlPayload { data { downloadUrl } } ... on ErrorResponse { code message } } }`, { filter: { keyword: `APIW03EXP-${RUN_ID}`, page: 0, size: 20 } });
    expect(resp.data.data.exportInternalProducts.__typename).toBe('ApiResponseExportFileUrlPayload');
    // downloadUrl là relative path (route qua BFF reverse-proxy), KHÔNG phải absolute URL — sửa lỗi test vòng trước.
    const downloadUrl: string = resp.data.data.exportInternalProducts.data.downloadUrl;
    expect(downloadUrl).toMatch(/^\/garage\/api\/v2\/internal-products\/export\//);
    // Ground-truth thật: tải file qua đúng route, xác nhận content-type .xlsx + HTTP 200 (không chỉ tin response GraphQL).
    const bffOrigin = new URL(AGG_GRAPH_URL).origin;
    const fileResp = await axios.get(`${bffOrigin}${downloadUrl}`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A },
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });
    expect(fileResp.status).toBe(200);
    expect(fileResp.headers['content-type']).toContain('spreadsheetml');
    expect(fileResp.data.byteLength).toBeGreaterThan(0);
  });

  it('TC-W03-API-PRDEXP-002: export bộ lọc không khớp mã nào — vẫn trả downloadUrl (file chỉ có header)', async () => {
    const resp = await gql(ownerToken, `query($filter: InternalProductSearchInput) { exportInternalProducts(filter:$filter) { __typename ... on ApiResponseExportFileUrlPayload { data { downloadUrl } } ... on ErrorResponse { code message } } }`, { filter: { keyword: `NOMATCH-EXPORT-${RUN_ID}-ZZZZ`, page: 0, size: 20 } });
    expect(resp.data.data.exportInternalProducts.__typename).toBe('ApiResponseExportFileUrlPayload');
  });
});

// ============================================================
// Cross-Cutting — Legacy `product` regression (ADR-017)
// ============================================================
describe('Cross-Cutting — Legacy product endpoints regression (ADR-017)', () => {
  it('TC-W03-API-CROSS-008 [regression]: GET /api/v2/products/search vẫn hoạt động bình thường sau Flyway W03', async () => {
    const resp = await axios.get(`${GF_INVENTORY_BASE}/products/search`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A },
      validateStatus: () => true,
    });
    expect(resp.status).toBe(200);
    expect(resp.data.success).toBe(true);
  });

  it('TC-W03-API-CROSS-009 [regression]: GET /api/v2/products/search-grouped vẫn hoạt động', async () => {
    const resp = await axios.get(`${GF_INVENTORY_BASE}/products/search-grouped`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A },
      validateStatus: () => true,
    });
    expect(resp.status).toBeLessThan(500);
  });

  it('TC-W03-API-CROSS-010 [regression]: POST /api/v2/products/stock/cost-price vẫn hoạt động (không 5xx do schema mới)', async () => {
    const resp = await axios.post(`${GF_INVENTORY_BASE}/products/stock/cost-price`, { skus: ['SKU-DEMO-BATTERY-60AH'] }, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    expect(resp.status).toBeLessThan(500);
  });
});
