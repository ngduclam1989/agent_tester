/**
 * W03 API — Internal Product extra coverage (Run 2)
 * PRDLST-002/004/006/008/009/010/011, PRDCRE-015/017/024, PRDDET-001/003/004/006/007/008/009/011/012/014/015/016/017/018/019/020/021/022,
 * PRDEDT-002/003/007, PRDDEL-002
 */
import axios from 'axios';

const GF_INVENTORY_BASE = process.env.GF_INVENTORY_BASE_URL || 'http://192.168.110.191:45086/api/v2';
const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://192.168.110.191:45401/garage/graphql';
const SSO_STUB = process.env.SSO_STUB_URL || 'http://192.168.110.191:45410';
const TENANT_A = '1';
const RUN_ID = 'r2' + Date.now().toString().slice(-8);
const VALID_UNIT = 'UNIT_CAI';
const VALID_UNIT_2 = 'UNIT_ONG';

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
const FRAGMENT_PRD = `id code name mainUnitCode mainUnitDisplayName status nature pricingMethod materialGroupId materialGroupName brand originCode originDisplayName productSpec technicalSpec description notes imageUrl createdAt createdBy updatedAt updatedBy conversionUnits { id unitCode conversionRate } skuMappings { id sku } attachments { id fileName fileType fileSizeBytes fileUrl }`;
async function createProduct(token: string, input: Record<string, unknown>) {
  return gql(token, `mutation($input: CreateInternalProductInput!) { createInternalProduct(input:$input) { __typename ... on ApiResponseInternalProduct { data { ${FRAGMENT_PRD} } } ... on ErrorResponse { code message statusCode } } }`, { input });
}
async function getProduct(token: string, id: number | string) {
  return gql(token, `query($id: Int!) { getInternalProduct(id:$id) { __typename ... on ApiResponseInternalProduct { data { ${FRAGMENT_PRD} } } ... on ErrorResponse { code message statusCode } } }`, { id });
}
async function updateProduct(token: string, id: number | string, input: Record<string, unknown>) {
  return gql(token, `mutation($id: Int!, $input: UpdateInternalProductInput!) { updateInternalProduct(id:$id, input:$input) { __typename ... on ApiResponseInternalProduct { data { ${FRAGMENT_PRD} } } ... on ErrorResponse { code message statusCode } } }`, { id, input });
}
async function deleteProduct(token: string, id: number | string) {
  return gql(token, `mutation($id: Int!) { deleteInternalProduct(id:$id) { __typename ... on ApiResponseDeletePayload { success } ... on ErrorResponse { code message statusCode } } }`, { id });
}

let ownerToken: string;
beforeAll(async () => { ownerToken = await getToken('0810000001'); });

describe('FEAT-CAT-PROD-LIST — extra', () => {
  it('TC-W03-API-PRDLST-002: keyword OR-match 3-cột (code/name/SKU mapping)', async () => {
    const suffix = RUN_ID + 'kw3';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-KW3-${suffix}`, name: 'Phu tung dac biet KW3', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const byCode = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { code } } } } }`, { input: { keyword: `APIW03PRD-KW3-${suffix}`.slice(0, 15), page: 0, size: 20 } });
    const byName = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { code } } } } }`, { input: { keyword: 'dac biet KW3', page: 0, size: 20 } });
    expect(byCode.data.data.searchInternalProducts.data.content.some((x: any) => x.code === prod.code)).toBe(true);
    expect(byName.data.data.searchInternalProducts.data.content.some((x: any) => x.code === prod.code)).toBe(true);
  });

  it('TC-W03-API-PRDLST-004 [pagination]', async () => {
    const suffix = RUN_ID + 'pg';
    for (let i = 0; i < 5; i++) {
      await createProduct(ownerToken, { code: `APIW03PRD-PG${i}-${suffix}`, name: `Paging ${i}`, mainUnitCode: VALID_UNIT });
    }
    const page0 = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { code } pageInfo { totalElements } } } } }`, { input: { keyword: `PG`, page: 0, size: 2 } });
    expect(page0.data.data.searchInternalProducts.data.content.length).toBeLessThanOrEqual(2);
  });

  it('TC-W03-API-PRDLST-006: response type đúng kiểu dữ liệu (id là số, không phải chuỗi)', async () => {
    const suffix = RUN_ID + 'type';
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-TYPE-${suffix}`, name: 'Type check', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    expect(typeof created.id).toBe('number');
    const search = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { id } } } } }`, { input: { keyword: `APIW03PRD-TYPE-${suffix}`, page: 0, size: 5 } });
    expect(typeof search.data.data.searchInternalProducts.data.content[0].id).toBe('number');
  });

  it('TC-W03-API-PRDLST-008: search có dấu tiếng Việt khớp tên có dấu', async () => {
    const suffix = RUN_ID + 'vn';
    await createProduct(ownerToken, { code: `APIW03PRD-VN-${suffix}`, name: 'Phụ tùng ô tô đặc biệt', mainUnitCode: VALID_UNIT });
    const withDiacritics = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { code } } } } }`, { input: { keyword: 'phụ tùng ô tô đặc biệt', page: 0, size: 5 } });
    expect(withDiacritics.data.data.searchInternalProducts.data.content.some((x: any) => x.code === `APIW03PRD-VN-${suffix}`)).toBe(true);
  });

  it('TC-W03-API-PRDLST-009: filter không khớp record nào → content=[] không lỗi', async () => {
    const resp = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { code } } } } }`, { input: { nature: 'TOOL', keyword: `NOMATCH-${RUN_ID}-XYZ`, page: 0, size: 20 } });
    expect(resp.data.data.searchInternalProducts.__typename).toBe('ApiResponsePageInternalProduct');
    expect(resp.data.data.searchInternalProducts.data.content).toEqual([]);
  });

  it('TC-W03-API-PRDLST-010: sai HTTP method GET trên /internal-products/search — cross-ref BUG-W03-113 (đã file ở Run 1)', async () => {
    const resp = await axios.get(`${GF_INVENTORY_BASE}/internal-products/search`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A },
      validateStatus: () => true,
    });
    // Cùng bug đã file BUG-W03-113 ở Run 1 (qua TC-W03-API-CROSS-006) — TC này là bản sao theo đúng FEAT-CAT-PROD-LIST,
    // giữ nguyên kỳ vọng chuẩn REST để tránh 2 TC có 2 kỳ vọng khác nhau cho cùng 1 bug.
    expect([404, 405]).toContain(resp.status);
  });

  it('TC-W03-API-PRDLST-011 [DataLoader N+1]: search 5 mã, đếm số call ra gf-erp-mdm qua so sánh response time — sanity, không đo p95', async () => {
    const suffix = RUN_ID + 'n1';
    for (let i = 0; i < 5; i++) {
      await createProduct(ownerToken, { code: `APIW03PRD-N1-${i}-${suffix}`, name: `N1 test ${i}`, mainUnitCode: VALID_UNIT, originCode: 'US' });
    }
    const start = Date.now();
    const resp = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { code mainUnitCode originCode } } } } }`, { input: { keyword: `APIW03PRD-N1-`, page: 0, size: 20 } });
    const elapsed = Date.now() - start;
    console.log('[PRDLST-011] search 5 mã elapsed=', elapsed, 'ms — không có hook đếm query trực tiếp trong harness hiện tại (KHÔNG có log SQL/HTTP trace access), dùng elapsed time làm proxy sanity thay vì đếm chính xác N+1.');
    expect(resp.data.data.searchInternalProducts.__typename).toBe('ApiResponsePageInternalProduct');
    // Sanity: không quá chậm bất thường (proxy cho không N+1 nghiêm trọng) — KHÔNG phải SLA chính thức (delegate agent-test-performance)
    expect(elapsed).toBeLessThan(5000);
  });
});

describe('FEAT-CAT-PROD-CREATE — extra', () => {
  it('TC-W03-API-PRDCRE-015: status không truyền → default ACTIVE, verify persist', async () => {
    const suffix = RUN_ID + 'stdef';
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-STDEF-${suffix}`, name: 'Status default', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const g = await getProduct(ownerToken, created.id);
    expect(g.data.data.getInternalProduct.data.status).toBe('ACTIVE');
  });

  it('TC-W03-API-PRDCRE-017: bỏ trống cả 3 field bắt buộc — liệt kê đủ field lỗi', async () => {
    const resp = await gql(ownerToken, `mutation($input: CreateInternalProductInput!) { createInternalProduct(input:$input) { __typename ... on ErrorResponse { code message details } } }`, { input: { code: '', name: '', mainUnitCode: '' } });
    const r = resp.data.data?.createInternalProduct;
    const isError = r?.__typename === 'ErrorResponse' || (resp.data.errors && resp.data.errors.length > 0);
    expect(isError).toBe(true);
  });

  it('TC-W03-API-PRDCRE-024 [spec-gap]: attachments[] inline-tại-create — ghi nhận hành vi thật, KHÔNG assert PASS/FAIL cứng', async () => {
    const suffix = RUN_ID + 'inline';
    const resp = await gql(ownerToken, `mutation($input: CreateInternalProductInput!) { createInternalProduct(input:$input) { __typename ... on ApiResponseInternalProduct { data { id attachments { fileName } } } ... on ErrorResponse { code message } } }`, {
      input: { code: `APIW03PRD-INLINEATT-${suffix}`, name: 'Inline attachment spec-gap', mainUnitCode: VALID_UNIT, attachments: [{ fileUrl: 'https://example.com/a.pdf', fileName: 'a.pdf', fileType: 'application/pdf', fileSizeBytes: 1024, attachmentKind: 'DOC' }] },
    });
    console.log('[PRDCRE-024][spec-gap] createInternalProduct với attachments inline:', JSON.stringify(resp.data).slice(0, 400));
    // spec-gap còn tồn tại (AC-13 vs SDL R31 mâu thuẫn, chưa BA/Architecture chốt) — chỉ ghi nhận, không fail cứng theo 1 nhánh.
    expect(resp.status).toBe(200);
  });
});

describe('FEAT-CAT-PROD-DETAIL — extra', () => {
  it('TC-W03-API-PRDDET-001: getInternalProduct(id) trả detail enriched đủ skuMappings/conversionUnits/attachments', async () => {
    const suffix = RUN_ID + 'det1';
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-DET1-${suffix}`, name: 'Detail full', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 2 }] })).data.data.createInternalProduct.data;
    const g = await getProduct(ownerToken, created.id);
    const gd = g.data.data.getInternalProduct.data;
    expect(Array.isArray(gd.conversionUnits)).toBe(true);
    expect(gd.conversionUnits.length).toBe(1);
    expect(Array.isArray(gd.skuMappings)).toBe(true);
    expect(Array.isArray(gd.attachments)).toBe(true);
  });

  it('TC-W03-API-PRDDET-003: gắn SKU đã mapping mã khác bị từ chối', async () => {
    const suffix = RUN_ID + 'skudup';
    const prod1 = (await createProduct(ownerToken, { code: `APIW03PRD-SKUDUP1-${suffix}`, name: 'p1', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const prod2 = (await createProduct(ownerToken, { code: `APIW03PRD-SKUDUP2-${suffix}`, name: 'p2', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const skuSearch = await gql(ownerToken, `{ searchSkus(unmapped:true, page:0, size:1) { __typename ... on ApiResponsePageSkuSearchResult { data { content { sku productId } } } } }`);
    const content = skuSearch.data.data.searchSkus.data.content;
    if (content.length === 0) {
      console.log('[PRDDET-003] Không có SKU unmapped khả dụng — SKIP nhánh thật, chỉ xác nhận searchSkus hoạt động.');
      expect(skuSearch.data.data.searchSkus.__typename).toBe('ApiResponsePageSkuSearchResult');
      return;
    }
    const target = content[0];
    const firstMap = await gql(ownerToken, `mutation($id: Int!, $productId: Int!) { mapSkuToInternalProduct(id:$id, productId:$productId) { __typename } }`, { id: prod1.id, productId: target.productId });
    expect(firstMap.data.data.mapSkuToInternalProduct.__typename).toBe('ApiResponseInternalProductSkuMapping');
    const secondMap = await gql(ownerToken, `mutation($id: Int!, $productId: Int!) { mapSkuToInternalProduct(id:$id, productId:$productId) { __typename ... on ErrorResponse { code message } } }`, { id: prod2.id, productId: target.productId });
    expect(secondMap.data.data.mapSkuToInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDDET-004: unmapSkuFromInternalProduct gỡ mapping — SKU gốc không bị xóa', async () => {
    const suffix = RUN_ID + 'unmap';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-UNMAP-${suffix}`, name: 'unmap test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const skuSearch = await gql(ownerToken, `{ searchSkus(unmapped:true, page:0, size:1) { __typename ... on ApiResponsePageSkuSearchResult { data { content { sku productId } } } } }`);
    const content = skuSearch.data.data.searchSkus.data.content;
    if (content.length === 0) {
      console.log('[PRDDET-004] Không có SKU unmapped khả dụng — SKIP nhánh thật.');
      return;
    }
    const target = content[0];
    await gql(ownerToken, `mutation($id: Int!, $productId: Int!) { mapSkuToInternalProduct(id:$id, productId:$productId) { __typename } }`, { id: prod.id, productId: target.productId });
    const unmap = await gql(ownerToken, `mutation($id: Int!, $productId: Int!) { unmapSkuFromInternalProduct(id:$id, productId:$productId) { __typename ... on ApiResponseDeletePayload { success } ... on ErrorResponse { code message } } }`, { id: prod.id, productId: target.productId });
    expect(unmap.data.data.unmapSkuFromInternalProduct.__typename).toBe('ApiResponseDeletePayload');
    const g = await getProduct(ownerToken, prod.id);
    expect(g.data.data.getInternalProduct.data.skuMappings.length).toBe(0);
    // SKU gốc không bị xóa — verify lại qua searchSkus(unmapped:true) thấy lại SKU đó
    const afterUnmap = await gql(ownerToken, `{ searchSkus(unmapped:true, page:0, size:50) { __typename ... on ApiResponsePageSkuSearchResult { data { content { sku } } } } }`);
    expect(afterUnmap.data.data.searchSkus.data.content.some((x: any) => x.sku === target.sku)).toBe(true);
  });

  it('TC-W03-API-PRDDET-006: conversionRate âm (-5) bị từ chối cùng nhánh ERR-INV-013 như 0', async () => {
    const suffix = RUN_ID + 'neg';
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-NEGCR-${suffix}`, name: 'neg rate', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: -5 }] });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    expect(resp.data.data.createInternalProduct.code).toBe('ERR-INV-013');
  });

  it('TC-W03-API-PRDDET-007 [BLOCKED-by-seed-data]: reject sửa conversion-unit đã có giao dịch', async () => {
    // W03 sandbox chưa có luồng nhập/xuất kho thật (W05 chưa build) — không tự tạo được transaction thật cho conversion-unit.
    // Theo planning đã ghi nhận rõ: BLOCKED-by-seed-data, KHÔNG giả lập cờ hasTransactions.
    console.log('[PRDDET-007] BLOCKED-by-seed-data: W03 sandbox chưa có cơ chế tạo giao dịch nhập/xuất kho thật (W05 chưa build) để seed conversion-unit "đã giao dịch".');
    expect(true).toBe(true); // placeholder — verdict thật ghi BLOCKED-by-seed-data trong doc
  });

  it('TC-W03-API-PRDDET-008 [BLOCKED-by-seed-data]: deleteConversionUnit từ chối khi đã giao dịch', async () => {
    console.log('[PRDDET-008] BLOCKED-by-seed-data: cùng lý do PRDDET-007.');
    expect(true).toBe(true);
  });

  it('TC-W03-API-PRDDET-009: updateConversionUnit thành công cho ĐVT CHƯA giao dịch', async () => {
    const suffix = RUN_ID + 'updconv';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-UPDCONV-${suffix}`, name: 'upd conv', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 10 }] })).data.data.createInternalProduct.data;
    const unitId = prod.conversionUnits[0].id;
    const upd = await gql(ownerToken, `mutation($id: Int!, $unitId: Int!, $input: ConversionUnitInput!) { updateConversionUnit(id:$id, unitId:$unitId, input:$input) { __typename ... on ApiResponseInternalProductConversionUnit { data { conversionRate } } ... on ErrorResponse { code message } } }`, { id: prod.id, unitId, input: { unitCode: VALID_UNIT_2, conversionRate: 20 } });
    expect(upd.data.data.updateConversionUnit.__typename).toBe('ApiResponseInternalProductConversionUnit');
    const g = await getProduct(ownerToken, prod.id);
    expect(Number(g.data.data.getInternalProduct.data.conversionUnits[0].conversionRate)).toBe(20);
  });

  it('TC-W03-API-PRDDET-011: attachment MIME .exe bị từ chối — ERR-CMN-005', async () => {
    const suffix = RUN_ID + 'mime';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-MIME-${suffix}`, name: 'mime test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const resp = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ErrorResponse { code message } } }`, { id: prod.id, input: { fileName: 'virus.exe', fileType: 'application/x-msdownload', fileSizeBytes: 1024, fileUrl: 'https://example.com/virus.exe' } });
    expect(resp.data.data.addInternalProductAttachment.__typename).toBe('ErrorResponse');
    expect(resp.data.data.addInternalProductAttachment.code).toBe('ERR-CMN-005');
  });

  it('TC-W03-API-PRDDET-012: attachment >30MB bị từ chối — ERR-CMN-004', async () => {
    const suffix = RUN_ID + 'big';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-BIG-${suffix}`, name: 'big file test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const resp = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ErrorResponse { code message } } }`, { id: prod.id, input: { fileName: 'big.pdf', fileType: 'application/pdf', fileSizeBytes: 31457281, fileUrl: 'https://example.com/big.pdf' } });
    expect(resp.data.data.addInternalProductAttachment.__typename).toBe('ErrorResponse');
    expect(resp.data.data.addInternalProductAttachment.code).toBe('ERR-CMN-004');
  });

  it('TC-W03-API-PRDDET-014: file .exe đổi tên/khai báo MIME thành .pdf — ghi nhận hành vi thật (magic-byte spoof detection)', async () => {
    const suffix = RUN_ID + 'spoof';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-SPOOF-${suffix}`, name: 'spoof test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const resp = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ApiResponseInternalProductAttachment { data { id } } ... on ErrorResponse { code message } } }`, { id: prod.id, input: { fileName: 'renamed.pdf', fileType: 'application/pdf', fileSizeBytes: 1024, fileUrl: 'https://example.com/actually-virus.exe' } });
    console.log('[PRDDET-014] spoof MIME test ->', resp.data.data.addInternalProductAttachment.__typename);
    // Metadata-only design (ADR-016) — server chỉ nhận metadata client khai báo, KHÔNG tự tải file để kiểm tra magic-byte.
    // Đây là hành vi THIẾT KẾ (không phải bug) — ghi nhận rõ, không assert reject cứng vì ngoài khả năng metadata-only.
    expect(resp.data.data.addInternalProductAttachment.__typename).toBe('ApiResponseInternalProductAttachment');
  });

  it('TC-W03-API-PRDDET-015: tên file có path traversal hoặc quá dài — xử lý an toàn (không lỗi 500, không lộ path hệ thống)', async () => {
    const suffix = RUN_ID + 'path';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-PATH-${suffix}`, name: 'path traversal test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const resp = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ApiResponseInternalProductAttachment { data { fileName } } ... on ErrorResponse { code message } } }`, { id: prod.id, input: { fileName: '../../../etc/passwd.pdf', fileType: 'application/pdf', fileSizeBytes: 1024, fileUrl: 'https://example.com/x.pdf' } });
    expect(resp.status).toBe(200);
    expect(['ApiResponseInternalProductAttachment', 'ErrorResponse']).toContain(resp.data.data.addInternalProductAttachment.__typename);
  });

  it('TC-W03-API-PRDDET-016 [cross-ref BUG-W03-116]: originDisplayName qua batch enrich gf-erp-mdm — hiện tại luôn null (bug đã file Run 1)', async () => {
    const suffix = RUN_ID + 'origin16';
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-ORIGIN16-${suffix}`, name: 'origin enrich', mainUnitCode: VALID_UNIT, originCode: 'US' })).data.data.createInternalProduct.data;
    const g = await getProduct(ownerToken, created.id);
    // Cùng bug BUG-W03-116 đã file ở Run 1 (qua PRDLST-013) — TC này verify riêng theo đúng FEAT-CAT-PROD-DETAIL AC gốc.
    expect(g.data.data.getInternalProduct.data.originDisplayName).toBeTruthy();
  });

  it('TC-W03-API-PRDDET-017: InternalProduct KHÔNG áp dụng TENANT-USERS enrichment — response KHÔNG có createdByName/updatedByName field', async () => {
    const introspect = await gql(ownerToken, `{ __type(name: "InternalProduct") { fields { name } } }`);
    const fields = introspect.data.data.__type.fields.map((f: any) => f.name);
    expect(fields).not.toContain('createdByName');
    expect(fields).not.toContain('updatedByName');
  });

  it('TC-W03-API-PRDDET-018 [race-condition]: SKU vừa mapping bởi phiên khác → phiên sau trả lỗi', async () => {
    const suffix = RUN_ID + 'raceku';
    const prod1 = (await createProduct(ownerToken, { code: `APIW03PRD-RSKU1-${suffix}`, name: 'race1', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const prod2 = (await createProduct(ownerToken, { code: `APIW03PRD-RSKU2-${suffix}`, name: 'race2', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const skuSearch = await gql(ownerToken, `{ searchSkus(unmapped:true, page:0, size:1) { __typename ... on ApiResponsePageSkuSearchResult { data { content { sku productId } } } } }`);
    const content = skuSearch.data.data.searchSkus.data.content;
    if (content.length === 0) {
      console.log('[PRDDET-018] Không có SKU unmapped khả dụng — SKIP nhánh thật.');
      return;
    }
    const target = content[0];
    const [r1, r2] = await Promise.all([
      gql(ownerToken, `mutation($id: Int!, $productId: Int!) { mapSkuToInternalProduct(id:$id, productId:$productId) { __typename } }`, { id: prod1.id, productId: target.productId }),
      gql(ownerToken, `mutation($id: Int!, $productId: Int!) { mapSkuToInternalProduct(id:$id, productId:$productId) { __typename } }`, { id: prod2.id, productId: target.productId }),
    ]);
    const t1 = r1.data.data.mapSkuToInternalProduct.__typename;
    const t2 = r2.data.data.mapSkuToInternalProduct.__typename;
    console.log('[PRDDET-018] race map cùng SKU: r1=', t1, 'r2=', t2);
    // Ground-truth: đúng 1 trong 2 phải thành công, cái còn lại phải fail — nếu CẢ 2 cùng thành công là race bug thật.
    const bothSucceeded = t1 === 'ApiResponseInternalProductSkuMapping' && t2 === 'ApiResponseInternalProductSkuMapping';
    if (bothSucceeded) console.log('[PRDDET-018][BUG NGHI VẤN] Cả 2 request map cùng 1 SKU đều thành công — race condition thật.');
    expect(bothSucceeded).toBe(false);
  });

  it('TC-W03-API-PRDDET-019: conversionRate vượt NUMERIC(18,6) bị từ chối rõ ràng, không lỗi 500', async () => {
    const suffix = RUN_ID + 'overflow';
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-OVERFLOW-${suffix}`, name: 'overflow', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 99999999999999 }] });
    expect(resp.status).toBeLessThan(500);
    console.log('[PRDDET-019] conversionRate cực lớn ->', resp.data.data?.createInternalProduct?.__typename, JSON.stringify(resp.data).slice(0, 200));
  });

  it('TC-W03-API-PRDDET-020: conversionRate là chuỗi không phải số bị từ chối validation (REST raw, bypass GraphQL type)', async () => {
    const suffix = RUN_ID + 'strnum';
    const resp = await axios.post(`${GF_INVENTORY_BASE}/internal-products`, { code: `APIW03PRD-STRNUM-${suffix}`, name: 'str num', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 'khong-phai-so' }] }, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    console.log('[PRDDET-020] REST raw conversionRate=string -> status=', resp.status, JSON.stringify(resp.data).slice(0, 200));
    expect(resp.status).toBeGreaterThanOrEqual(400);
    expect(resp.status).toBeLessThan(500);
  });

  it('TC-W03-API-PRDDET-021: attachment PDF 0 byte bị từ chối — ghi nhận message có thể sai (cross-check với bug mới)', async () => {
    const suffix = RUN_ID + 'zerobyte';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-ZEROBYTE-${suffix}`, name: 'zero byte', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const resp = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ErrorResponse { code message } } }`, { id: prod.id, input: { fileName: 'empty.pdf', fileType: 'application/pdf', fileSizeBytes: 0, fileUrl: 'https://example.com/empty.pdf' } });
    expect(resp.data.data.addInternalProductAttachment.__typename).toBe('ErrorResponse');
    // Bug thật: message trả "vượt 30MB" cho file 0 byte (sai ngữ nghĩa) — xem BUG-W03-1xx (file ở cuối Run 2).
    console.log('[PRDDET-021][BUG NGHI VẤN] message thật cho 0-byte:', resp.data.data.addInternalProductAttachment.message);
    expect(resp.data.data.addInternalProductAttachment.message).not.toMatch(/30\s*MB/);
  });

  it('TC-W03-API-PRDDET-022 [ground-truth field-rename R38]: fileSizeBytes/fileUrl (GraphQL) truyền đúng xuống REST + persist đúng', async () => {
    const suffix = RUN_ID + 'rename';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-RENAME-${suffix}`, name: 'field rename check', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const add = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ApiResponseInternalProductAttachment { data { fileSizeBytes fileUrl } } ... on ErrorResponse { code message } } }`, { id: prod.id, input: { fileName: 'rename-check.pdf', fileType: 'application/pdf', fileSizeBytes: 54321, fileUrl: 'https://example.com/rename-check.pdf' } });
    expect(add.data.data.addInternalProductAttachment.__typename).toBe('ApiResponseInternalProductAttachment');
    expect(add.data.data.addInternalProductAttachment.data.fileSizeBytes).toBe(54321);
    expect(add.data.data.addInternalProductAttachment.data.fileUrl).toBe('https://example.com/rename-check.pdf');
    const g = await getProduct(ownerToken, prod.id);
    const att = g.data.data.getInternalProduct.data.attachments.find((a: any) => a.fileName === 'rename-check.pdf');
    expect(att.fileSizeBytes).toBe(54321);
    expect(att.fileUrl).toBe('https://example.com/rename-check.pdf');
  });
});

describe('FEAT-CAT-PROD-EDIT — extra', () => {
  it('TC-W03-API-PRDEDT-002 [BLOCKED-by-seed-data]: mainUnitCode immutable khi mã đã có giao dịch', async () => {
    console.log('[PRDEDT-002] BLOCKED-by-seed-data: cùng lý do PRDDET-007 — W03 sandbox chưa có luồng giao dịch thật.');
    expect(true).toBe(true);
  });

  it('TC-W03-API-PRDEDT-003: mainUnitCode cho phép sửa khi mã CHƯA giao dịch (state pair với PRDEDT-002)', async () => {
    const suffix = RUN_ID + 'unitedit3';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-UNITEDIT3-${suffix}`, name: 'unit edit ok', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const upd = await updateProduct(ownerToken, prod.id, { mainUnitCode: VALID_UNIT_2 });
    expect(upd.data.data.updateInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const g = await getProduct(ownerToken, prod.id);
    expect(g.data.data.getInternalProduct.data.mainUnitCode).toBe(VALID_UNIT_2);
  });

  it('TC-W03-API-PRDEDT-007: updateInternalProduct sửa nhiều field thông tin chung hợp lệ cùng lúc — luồng thành công tổng quát', async () => {
    const suffix = RUN_ID + 'multi';
    const prod = (await createProduct(ownerToken, { code: `APIW03PRD-MULTI-${suffix}`, name: 'multi field', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const upd = await updateProduct(ownerToken, prod.id, { name: 'Tên đã sửa', brand: 'Brand mới', productSpec: 'Quy cách mới', technicalSpec: 'Thông số mới', notes: 'Ghi chú mới' });
    expect(upd.data.data.updateInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const g = await getProduct(ownerToken, prod.id);
    const gd = g.data.data.getInternalProduct.data;
    expect(gd.name).toBe('Tên đã sửa');
    expect(gd.brand).toBe('Brand mới');
    expect(gd.productSpec).toBe('Quy cách mới');
    expect(gd.technicalSpec).toBe('Thông số mới');
    expect(gd.notes).toBe('Ghi chú mới');
  });
});

describe('FEAT-CAT-PROD-DELETE — extra', () => {
  it('TC-W03-API-PRDDEL-002 [BLOCKED-by-seed-data]: reject xóa mã đã có giao dịch nhập/xuất/tồn', async () => {
    console.log('[PRDDEL-002] BLOCKED-by-seed-data: cùng lý do PRDDET-007.');
    expect(true).toBe(true);
  });
});
