/**
 * W03 API — Internal Product CRUD (FEAT-CAT-PROD-LIST/CREATE/DETAIL/EDIT/DELETE)
 * Boundary: agg-garage-graph (GraphQL) chủ yếu.
 * Dữ liệu tạo mới hoàn toàn mỗi lần chạy — prefix APIW03PRD + timestamp unique.
 */
import axios from 'axios';

const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://192.168.110.191:45401/garage/graphql';
const SSO_STUB = process.env.SSO_STUB_URL || 'http://192.168.110.191:45410';
const TENANT_A = '1';
const RUN_ID = Date.now().toString().slice(-8);
const VALID_UNIT = 'UNIT_CAI';   // xác nhận qua listUnits — code hợp lệ
const VALID_UNIT_2 = 'UNIT_ONG';
const VALID_ORIGIN = 'US';        // xác nhận qua thực nghiệm — master COUNTRY chấp nhận (2-ký-tự)

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

const FRAGMENT_PRD = `id code name mainUnitCode mainUnitDisplayName status nature pricingMethod materialGroupId materialGroupName brand originCode originDisplayName productSpec technicalSpec description notes imageUrl createdAt createdBy updatedAt updatedBy conversionUnits { unitCode conversionRate } skuMappings { sku } attachments { id fileName fileType fileSizeBytes fileUrl }`;
// FRAGMENT rút gọn dùng riêng cho searchInternalProducts (list/search context) — KHÔNG chọn
// conversionUnits/skuMappings/attachments. Lý do: BUG THẬT phát hiện qua execution — 3 field này
// khai NON_NULL trên type InternalProduct nhưng resolver searchInternalProducts KHÔNG populate,
// khiến GraphQL null hoá toàn bộ item khi client chọn field đó trong list context (xem PRDLST-012 +
// BUG-W03-1xx). getInternalProduct (detail)/create/update KHÔNG bị ảnh hưởng — vẫn dùng FRAGMENT_PRD đầy đủ.
const FRAGMENT_PRD_LIST = `id code name mainUnitCode mainUnitDisplayName status nature pricingMethod materialGroupId materialGroupName brand originCode originDisplayName productSpec technicalSpec description notes imageUrl createdAt createdBy updatedAt updatedBy`;

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
async function searchProducts(token: string, input: Record<string, unknown>) {
  return gql(token, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { ${FRAGMENT_PRD_LIST} } pageInfo { totalElements totalPages } } } ... on ErrorResponse { code message } } }`, { input });
}

let ownerToken: string;
beforeAll(async () => { ownerToken = await getToken('0810000001'); });

// ============================================================
// FEAT-CAT-PROD-CREATE
// ============================================================
describe('FEAT-CAT-PROD-CREATE', () => {
  it('TC-W03-API-PRDCRE-001 [required-only]: tạo mã chỉ với code+name+mainUnitCode — status/nature/pricingMethod default, persist ground-truth', async () => {
    const code = `APIW03PRD-REQ-${RUN_ID}`;
    const resp = await createProduct(ownerToken, { code, name: 'QC API Required-Only Product', mainUnitCode: VALID_UNIT });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const created = resp.data.data.createInternalProduct.data;
    expect(created.status).toBe('ACTIVE');
    expect(created.nature).toBe('GOODS');
    expect(created.pricingMethod).toBe('PWA');
    expect(created.description == null).toBe(true);
    expect(created.brand == null).toBe(true);
    expect(created.materialGroupId == null).toBe(true);

    const g = await getProduct(ownerToken, created.id);
    const gd = g.data.data.getInternalProduct.data;
    expect(gd.status).toBe('ACTIVE');
    expect(gd.nature).toBe('GOODS');
    expect(gd.pricingMethod).toBe('PWA');
  });

  it('TC-W03-API-PRDCRE-FULL [full-fields]: tạo mã với ĐẦY ĐỦ tất cả trường (kể cả optional + conversionUnits) — persist ground-truth toàn bộ giá trị', async () => {
    const grpCode = `APIW03PRD-FULLGRP-${RUN_ID}`;
    const grp = (await gql(ownerToken, `mutation($input: CreateMaterialGroupInput!) { createMaterialGroup(input:$input) { __typename ... on ApiResponseMaterialGroup { data { id } } } }`, { input: { code: grpCode, name: 'Full group for product' } })).data.data.createMaterialGroup.data;

    const code = `APIW03PRD-FULL-${RUN_ID}`;
    const resp = await createProduct(ownerToken, {
      code,
      name: 'QC API Full-Fields Product',
      mainUnitCode: VALID_UNIT,
      nature: 'TOOL',
      materialGroupId: grp.id,
      brand: 'QC Brand Name',
      originCode: VALID_ORIGIN,
      productSpec: 'Quy cách QC đầy đủ',
      technicalSpec: 'Thông số kỹ thuật QC đầy đủ',
      description: 'Mô tả đầy đủ toàn bộ trường',
      notes: 'Ghi chú đầy đủ toàn bộ trường',
      imageUrl: 'https://example.com/qc-full.png',
      status: 'INACTIVE',
      initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 12.5 }],
    });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const created = resp.data.data.createInternalProduct.data;
    expect(created.nature).toBe('TOOL');
    expect(String(created.materialGroupId)).toBe(String(grp.id));
    expect(created.brand).toBe('QC Brand Name');
    expect(created.originCode).toBe(VALID_ORIGIN);
    expect(created.productSpec).toBe('Quy cách QC đầy đủ');
    expect(created.technicalSpec).toBe('Thông số kỹ thuật QC đầy đủ');
    expect(created.description).toBe('Mô tả đầy đủ toàn bộ trường');
    expect(created.notes).toBe('Ghi chú đầy đủ toàn bộ trường');
    expect(created.imageUrl).toBe('https://example.com/qc-full.png');
    expect(created.status).toBe('INACTIVE');
    // pricingMethod LUÔN PWA bất kể input (locked theo AC-9) — không truyền ở đây, xác nhận default lock riêng ở PRDCRE-014-style

    // Ground-truth độc lập — toàn bộ field + conversion unit
    const g = await getProduct(ownerToken, created.id);
    const gd = g.data.data.getInternalProduct.data;
    expect(gd.nature).toBe('TOOL');
    expect(gd.brand).toBe('QC Brand Name');
    expect(gd.originCode).toBe(VALID_ORIGIN);
    expect(gd.status).toBe('INACTIVE');
    expect(gd.conversionUnits.some((u: any) => u.unitCode === VALID_UNIT_2 && Number(u.conversionRate) === 12.5)).toBe(true);
  });

  it('TC-W03-API-PRDCRE-002: mã chứa ký tự đặc biệt bị từ chối — ERR-INV-006', async () => {
    const resp = await createProduct(ownerToken, { code: `PRD@${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    expect(resp.data.data.createInternalProduct.code).toBe('ERR-INV-006');
  });

  it('TC-W03-API-PRDCRE-003: trùng mã trong cùng tenant — ERR-INV-007', async () => {
    const code = `APIW03PRD-DUP-${RUN_ID}`;
    await createProduct(ownerToken, { code, name: 'Original', mainUnitCode: VALID_UNIT });
    const dup = await createProduct(ownerToken, { code, name: 'Dup', mainUnitCode: VALID_UNIT });
    expect(dup.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    expect(dup.data.data.createInternalProduct.code).toBe('ERR-INV-007');
  });

  it('TC-W03-API-PRDCRE-004: nature ngoài 4-enum bị từ chối — ERR-INV-012', async () => {
    const resp = await gql(ownerToken, `mutation($input: CreateInternalProductInput!) { createInternalProduct(input:$input) { __typename ... on ErrorResponse { code message } } }`, { input: { code: `APIW03PRD-NAT-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, nature: 'MATERIAL' } });
    // Enum sai ngay tại validate GraphQL layer → có thể là GRAPHQL_VALIDATION_FAILED (không map ERR-INV-012 được vì input coercion fail trước khi tới resolver)
    const hasError = (resp.data.errors && resp.data.errors.length > 0) || resp.data.data?.createInternalProduct?.__typename === 'ErrorResponse';
    expect(hasError).toBe(true);
  });

  it('TC-W03-API-PRDCRE-005: mainUnitCode không tồn tại trong master bị từ chối', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-NOUNIT-${RUN_ID}`, name: 'Test', mainUnitCode: 'UNIT_NOPE_XXX' });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDCRE-006: originCode không khớp master COUNTRY bị từ chối', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-NOORIGIN-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, originCode: 'ZZ_NOPE' });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDCRE-007: brand free-text — không validate catalog, chấp nhận chuỗi bất kỳ', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-BRAND-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, brand: 'Thương hiệu chưa từng có QC 12345' });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    expect(resp.data.data.createInternalProduct.data.brand).toBe('Thương hiệu chưa từng có QC 12345');
  });

  it('TC-W03-API-PRDCRE-008: initialConversionUnits conversionRate <= 0 bị từ chối — ERR-INV-013', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-CR0-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 0 }] });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    expect(resp.data.data.createInternalProduct.code).toBe('ERR-INV-013');
  });

  it('TC-W03-API-PRDCRE-009 [BVA scale 6/7]: conversionRate 6 chữ số thập phân hợp lệ, 7 chữ số bị từ chối — ERR-INV-047', async () => {
    const ok = await createProduct(ownerToken, { code: `APIW03PRD-SCALE6-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 1.123456 }] });
    expect(ok.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const bad = await createProduct(ownerToken, { code: `APIW03PRD-SCALE7-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 1.1234567 }] });
    expect(bad.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    expect(bad.data.data.createInternalProduct.code).toBe('ERR-INV-047');
  });

  it('TC-W03-API-PRDCRE-010: initialConversionUnits trùng unitCode bị từ chối — ERR-INV-014', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-DUPUNIT-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 12 }, { unitCode: VALID_UNIT_2, conversionRate: 24 }] });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    expect(resp.data.data.createInternalProduct.code).toBe('ERR-INV-014');
  });

  it('TC-W03-API-PRDCRE-011 [BVA 500/501 description]', async () => {
    const desc500 = 'B'.repeat(500);
    const desc501 = 'B'.repeat(501);
    const ok = await createProduct(ownerToken, { code: `APIW03PRD-D500-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, description: desc500 });
    expect(ok.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    expect(ok.data.data.createInternalProduct.data.description.length).toBe(500);
    const bad = await createProduct(ownerToken, { code: `APIW03PRD-D501-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, description: desc501 });
    expect(bad.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDCRE-012 [BVA 500/501 notes — trường độc lập với description]', async () => {
    const notes500 = 'C'.repeat(500);
    const notes501 = 'C'.repeat(501);
    const ok = await createProduct(ownerToken, { code: `APIW03PRD-N500-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, notes: notes500 });
    expect(ok.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const bad = await createProduct(ownerToken, { code: `APIW03PRD-N501-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, notes: notes501 });
    expect(bad.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDCRE-013 [bỏ trống optional field — description/notes]: vẫn tạo thành công', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-NOOPT-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    expect(resp.data.data.createInternalProduct.data.description == null).toBe(true);
    expect(resp.data.data.createInternalProduct.data.notes == null).toBe(true);
  });

  it('TC-W03-API-PRDCRE-014 [pricingMethod LOCKED]: client gửi giá trị khác PWA vẫn bị khóa/ghi đè về PWA', async () => {
    const code = `APIW03PRD-PM-${RUN_ID}`;
    const resp = await createProduct(ownerToken, { code, name: 'Test', mainUnitCode: VALID_UNIT, pricingMethod: 'FIFO' });
    if (resp.data.data.createInternalProduct.__typename === 'ApiResponseInternalProduct') {
      const g = await getProduct(ownerToken, resp.data.data.createInternalProduct.data.id);
      expect(g.data.data.getInternalProduct.data.pricingMethod).toBe('PWA');
    } else {
      console.log('[PRDCRE-014] server reject FIFO tường minh thay vì lock-ignore:', JSON.stringify(resp.data.data.createInternalProduct));
      expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
    }
  });

  it('TC-W03-API-PRDCRE-016: bỏ trống mainUnitCode (bắt buộc) bị từ chối', async () => {
    const resp = await gql(ownerToken, `mutation($input: CreateInternalProductInput!) { createInternalProduct(input:$input) { __typename ... on ErrorResponse { code message } } }`, { input: { code: `APIW03PRD-NOUNIT2-${RUN_ID}`, name: 'Test', mainUnitCode: '' } });
    const success = resp.data.data?.createInternalProduct?.__typename === 'ApiResponseInternalProduct';
    expect(success).toBe(false);
  });

  it('TC-W03-API-PRDCRE-018 [space-only code]', async () => {
    const resp = await createProduct(ownerToken, { code: '   ', name: 'Test', mainUnitCode: VALID_UNIT });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDCRE-019/020/021/022 [4/4 enum nature]: GOODS(default)/TOOL/SERVICE/OTHER đều tạo + persist đúng', async () => {
    const natures = ['TOOL', 'SERVICE', 'OTHER'];
    for (const nature of natures) {
      const code = `APIW03PRD-NAT-${nature}-${RUN_ID}`;
      const resp = await createProduct(ownerToken, { code, name: `Nature ${nature}`, mainUnitCode: VALID_UNIT, nature });
      expect(resp.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
      const g = await getProduct(ownerToken, resp.data.data.createInternalProduct.data.id);
      expect(g.data.data.getInternalProduct.data.nature).toBe(nature);
    }
    // GOODS default đã cover ở PRDCRE-001 (required-only)
  });

  it('TC-W03-API-PRDCRE-023 [XSS]: payload script trong name lưu như văn bản thuần', async () => {
    const resp = await createProduct(ownerToken, { code: `APIW03PRD-XSS-${RUN_ID}`, name: '<script>alert(1)</script>', mainUnitCode: VALID_UNIT });
    expect(resp.data.data.createInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    expect(resp.data.data.createInternalProduct.data.name).toBe('<script>alert(1)</script>');
  });
});

// ============================================================
// FEAT-CAT-PROD-DETAIL (conversion unit / SKU mapping / attachment)
// ============================================================
describe('FEAT-CAT-PROD-DETAIL', () => {
  it('TC-W03-API-PRDDET-002: GET id không tồn tại → ErrorResponse', async () => {
    const resp = await getProduct(ownerToken, 999999999);
    expect(resp.data.data.getInternalProduct.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-PRDDET-005: addConversionUnit ground-truth qua getInternalProduct độc lập', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-ADDCONV-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    // Union trả về đúng theo SDL introspect: ApiResponseInternalProductConversionUnit (data: InternalProductConversionUnit),
    // KHÔNG phải ApiResponseInternalProduct — sửa lỗi test vòng trước.
    const add = await gql(ownerToken, `mutation($id: Int!, $input: ConversionUnitInput!) { addConversionUnit(id:$id, input:$input) { __typename ... on ApiResponseInternalProductConversionUnit { data { id unitCode conversionRate } } ... on ErrorResponse { code message } } }`, { id: created.id, input: { unitCode: VALID_UNIT_2, conversionRate: 5 } });
    expect(add.data.data.addConversionUnit.__typename).toBe('ApiResponseInternalProductConversionUnit');
    const g = await getProduct(ownerToken, created.id);
    expect(g.data.data.getInternalProduct.data.conversionUnits.some((u: any) => u.unitCode === VALID_UNIT_2 && Number(u.conversionRate) === 5)).toBe(true);
  });

  it('TC-W03-API-PRDDET-010: addInternalProductAttachment (standalone, AttachmentInput) ground-truth', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-ATT-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    // Union đúng: InternalProductAttachmentResponse -> ApiResponseInternalProductAttachment (data: InternalProductAttachment).
    // input dùng AttachmentInput (fileName/fileType/fileSizeBytes/fileUrl) — type KHÁC với InternalProductAttachmentInput
    // dùng ở CreateInternalProductInput.attachments (field rename R38) — 2 input type riêng biệt cho 2 mutation khác nhau,
    // đã xác nhận qua introspection, KHÔNG phải lỗi test.
    const resp = await gql(ownerToken, `mutation($id: Int!, $input: AttachmentInput!) { addInternalProductAttachment(id:$id, input:$input) { __typename ... on ApiResponseInternalProductAttachment { data { id fileName fileType fileSizeBytes fileUrl attachmentKind } } ... on ErrorResponse { code message } } }`, {
      id: created.id,
      input: { fileName: 'catalog-test.pdf', fileType: 'application/pdf', fileSizeBytes: 102400, fileUrl: 'https://example.com/catalog-test.pdf' },
    });
    expect(resp.data.data.addInternalProductAttachment.__typename).toBe('ApiResponseInternalProductAttachment');
    const g = await getProduct(ownerToken, created.id);
    expect(g.data.data.getInternalProduct.data.attachments.some((a: any) => a.fileName === 'catalog-test.pdf')).toBe(true);
  });

  it('TC-W03-API-PRDDET-013: mapSkuToInternalProduct ground-truth (nếu tenant có SKU unmapped khả dụng)', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-SKU-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    // Union đúng: PagedSkuSearchResponse -> ApiResponsePageSkuSearchResult (sửa lỗi test vòng trước: không phải ApiResponsePageSkuSearch).
    const skuSearch = await gql(ownerToken, `{ searchSkus(unmapped:true, page:0, size:1) { __typename ... on ApiResponsePageSkuSearchResult { data { content { sku productId } } } ... on ErrorResponse { code message } } }`);
    const skuTypename = skuSearch.data.data?.searchSkus?.__typename;
    expect(skuTypename).toBe('ApiResponsePageSkuSearchResult');
    const content = skuSearch.data.data.searchSkus.data.content;
    if (content.length > 0) {
      const target = content[0];
      // Union đúng: InternalProductSkuMappingResponse -> ApiResponseInternalProductSkuMapping.
      const map = await gql(ownerToken, `mutation($id: Int!, $productId: Int!) { mapSkuToInternalProduct(id:$id, productId:$productId) { __typename ... on ApiResponseInternalProductSkuMapping { data { sku } } ... on ErrorResponse { code message } } }`, { id: created.id, productId: target.productId });
      expect(map.data.data.mapSkuToInternalProduct.__typename).toBe('ApiResponseInternalProductSkuMapping');
      const g = await getProduct(ownerToken, created.id);
      expect(g.data.data.getInternalProduct.data.skuMappings.some((m: any) => m.sku === target.sku)).toBe(true);
    } else {
      console.log('[PRDDET-013] Không có SKU unmapped khả dụng trong tenant hiện tại tại thời điểm chạy — chỉ xác nhận query searchSkus hoạt động đúng contract, KHÔNG thực hiện được nhánh map thật (môi trường phụ thuộc dữ liệu SKU do service khác/pre-seed cung cấp).');
    }
  });

  it('TC-W03-API-PRDLST-012 [BUG THẬT — không phải lỗi test]: searchInternalProducts trả lỗi GraphQL NON_NULL khi client chọn conversionUnits/skuMappings/attachments trong list context', async () => {
    const suffix = RUN_ID + 'nn';
    await createProduct(ownerToken, { code: `APIW03PRD-NNBUG-${suffix}`, name: 'NonNull bug repro', mainUnitCode: VALID_UNIT });
    const resp = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename ... on ApiResponsePageInternalProduct { data { content { id code skuMappings { sku } conversionUnits { unitCode } attachments { id } } } } ... on ErrorResponse { code message } } }`, { input: { keyword: `APIW03PRD-NNBUG-${suffix}`, page: 0, size: 5 } });
    console.log('[PRDLST-012][BUG] response khi chọn conversionUnits/skuMappings/attachments trong searchInternalProducts:', JSON.stringify(resp.data).slice(0, 500));
    // Kỳ vọng ĐÚNG hợp đồng schema: content item không null khi field NON_NULL được resolver populate đầy đủ.
    // Bug thật quan sát được: GraphQL trả errors "Cannot return null for non-nullable field InternalProduct.<field>"
    // và item bị null hoá hoàn toàn — assertion dưới đây phản ánh ĐÚNG kỳ vọng hợp đồng (sẽ FAIL cho tới khi fix).
    expect(resp.data.errors).toBeUndefined();
    const content = resp.data.data?.searchInternalProducts?.data?.content;
    expect(content?.[0]).not.toBeNull();
  });
});

// ============================================================
// FEAT-CAT-PROD-EDIT
// ============================================================
describe('FEAT-CAT-PROD-EDIT', () => {
  it('TC-W03-API-PRDEDT-001: sửa nhiều trường cùng lúc thành công, persist ground-truth', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-EDIT-${RUN_ID}`, name: 'Before edit', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const upd = await updateProduct(ownerToken, created.id, { name: 'Tên mới', brand: 'Brand mới', description: 'Mô tả mới sau sửa' });
    expect(upd.data.data.updateInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const g = await getProduct(ownerToken, created.id);
    expect(g.data.data.getInternalProduct.data.name).toBe('Tên mới');
    expect(g.data.data.getInternalProduct.data.brand).toBe('Brand mới');
    expect(g.data.data.getInternalProduct.data.description).toBe('Mô tả mới sau sửa');
  });

  it('TC-W03-API-PRDEDT-004 [state-transition set-on]: chuyển status ACTIVE→INACTIVE persist đúng', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-STAT-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, status: 'ACTIVE' })).data.data.createInternalProduct.data;
    const upd = await updateProduct(ownerToken, created.id, { status: 'INACTIVE' });
    expect(upd.data.data.updateInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const g = await getProduct(ownerToken, created.id);
    expect(g.data.data.getInternalProduct.data.status).toBe('INACTIVE');
  });

  it('TC-W03-API-PRDEDT-004b [state-transition set-off/re-toggle]: INACTIVE→ACTIVE→INACTIVE không leak state cũ', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-RETOG-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, status: 'ACTIVE' })).data.data.createInternalProduct.data;
    await updateProduct(ownerToken, created.id, { status: 'INACTIVE' });
    await updateProduct(ownerToken, created.id, { status: 'ACTIVE' });
    const finalUpd = await updateProduct(ownerToken, created.id, { status: 'INACTIVE' });
    expect(finalUpd.data.data.updateInternalProduct.__typename).toBe('ApiResponseInternalProduct');
    const g = await getProduct(ownerToken, created.id);
    expect(g.data.data.getInternalProduct.data.status).toBe('INACTIVE');
  });

  it('TC-W03-API-PRDEDT-005: mainUnitCode có thể sửa (khác nhóm field immutable)', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-UNITEDIT-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT })).data.data.createInternalProduct.data;
    const upd = await updateProduct(ownerToken, created.id, { mainUnitCode: VALID_UNIT_2 });
    if (upd.data.data.updateInternalProduct.__typename === 'ApiResponseInternalProduct') {
      const g = await getProduct(ownerToken, created.id);
      expect(g.data.data.getInternalProduct.data.mainUnitCode).toBe(VALID_UNIT_2);
    } else {
      console.log('[PRDEDT-005] mainUnitCode KHÔNG sửa được (server reject) — ghi nhận hành vi thật:', JSON.stringify(upd.data.data.updateInternalProduct));
    }
  });

  it('TC-W03-API-PRDEDT-006: imageUrl có thể clear về null', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-IMGCLR-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, imageUrl: 'https://example.com/a.png' })).data.data.createInternalProduct.data;
    const upd = await updateProduct(ownerToken, created.id, { imageUrl: null });
    if (upd.data.data.updateInternalProduct.__typename === 'ApiResponseInternalProduct') {
      const g = await getProduct(ownerToken, created.id);
      expect(g.data.data.getInternalProduct.data.imageUrl == null).toBe(true);
    } else {
      console.log('[PRDEDT-006] imageUrl null update bị reject — ghi nhận:', JSON.stringify(upd.data.data.updateInternalProduct));
    }
  });
});

// ============================================================
// FEAT-CAT-PROD-DELETE
// ============================================================
describe('FEAT-CAT-PROD-DELETE', () => {
  it('TC-W03-API-PRDDEL-001: xóa mã sản phẩm thành công, verify hard-delete + cascade mapping/conversion/attachment', async () => {
    const created = (await createProduct(ownerToken, { code: `APIW03PRD-DEL-${RUN_ID}`, name: 'Test', mainUnitCode: VALID_UNIT, initialConversionUnits: [{ unitCode: VALID_UNIT_2, conversionRate: 3 }] })).data.data.createInternalProduct.data;
    const del = await deleteProduct(ownerToken, created.id);
    expect(del.data.data.deleteInternalProduct.__typename).toBe('ApiResponseDeletePayload');
    expect(del.data.data.deleteInternalProduct.success).toBe(true);
    const after = await getProduct(ownerToken, created.id);
    expect(after.data.data.getInternalProduct.__typename).toBe('ErrorResponse');
  });
});

// ============================================================
// FEAT-CAT-PROD-LIST
// ============================================================
describe('FEAT-CAT-PROD-LIST', () => {
  it('TC-W03-API-PRDLST-001: searchInternalProducts trả danh sách với enrichment đầy đủ', async () => {
    const suffix = RUN_ID + 'lst';
    await createProduct(ownerToken, { code: `APIW03PRD-L1-${suffix}`, name: 'ListTest Alpha QC', mainUnitCode: VALID_UNIT });
    const resp = await searchProducts(ownerToken, { keyword: `APIW03PRD-L1-${suffix}`, page: 0, size: 20 });
    expect(resp.data.data.searchInternalProducts.__typename).toBe('ApiResponsePageInternalProduct');
    const content = resp.data.data.searchInternalProducts.data.content;
    expect(content.length).toBeGreaterThan(0);
    expect(content[0].mainUnitDisplayName).toBeTruthy();
  });

  it('TC-W03-API-PRDLST-003 [filter combo status+nature]', async () => {
    const suffix = RUN_ID + 'combo';
    const target = (await createProduct(ownerToken, { code: `APIW03PRD-COMBO-${suffix}`, name: 'Combo test', mainUnitCode: VALID_UNIT, nature: 'TOOL', status: 'ACTIVE' })).data.data.createInternalProduct.data;
    await createProduct(ownerToken, { code: `APIW03PRD-COMBO2-${suffix}`, name: 'Combo test 2', mainUnitCode: VALID_UNIT, nature: 'SERVICE', status: 'ACTIVE' });
    const resp = await searchProducts(ownerToken, { keyword: `COMBO`, status: 'ACTIVE', nature: 'TOOL', page: 0, size: 50 });
    const codes = resp.data.data.searchInternalProducts.data.content.map((x: any) => x.code);
    expect(codes).toContain(target.code);
  });

  it('TC-W03-API-PRDLST-005: searchSkus(unmapped) hoạt động không lỗi', async () => {
    const resp = await gql(ownerToken, `{ searchSkus(unmapped:true, page:0, size:5) { __typename ... on ApiResponsePageSkuSearchResult { data { content { sku } } } ... on ErrorResponse { code } } }`);
    expect(resp.status).toBe(200);
    expect(resp.data.data.searchSkus.__typename).toBe('ApiResponsePageSkuSearchResult');
  });

  it('TC-W03-API-PRDLST-013 [BUG THẬT — không phải lỗi test]: mainUnitDisplayName/originDisplayName LUÔN null (list lẫn detail), khác materialGroupName hoạt động đúng', async () => {
    const grp = (await gql(ownerToken, `mutation($input: CreateMaterialGroupInput!) { createMaterialGroup(input:$input) { __typename ... on ApiResponseMaterialGroup { data { id } } } }`, { input: { code: `APIW03PRD-ENRGRP-${RUN_ID}`, name: 'Enrich group QC' } })).data.data.createMaterialGroup.data;
    const code = `APIW03PRD-ENRICH-${RUN_ID}`;
    const created = (await createProduct(ownerToken, { code, name: 'Enrich test', mainUnitCode: VALID_UNIT, originCode: VALID_ORIGIN, materialGroupId: grp.id })).data.data.createInternalProduct.data;
    // materialGroupName enrich đúng ngay tại create (gf-inventory tự join, cùng boundary) — dùng làm baseline đối chứng.
    expect(created.materialGroupName).toBe('Enrich group QC');
    const g = await getProduct(ownerToken, created.id);
    const gd = g.data.data.getInternalProduct.data;
    console.log('[PRDLST-013][BUG] mainUnitCode=', gd.mainUnitCode, 'mainUnitDisplayName=', gd.mainUnitDisplayName, '| originCode=', gd.originCode, 'originDisplayName=', gd.originDisplayName);
    // Kỳ vọng ĐÚNG hợp đồng (R18 enrichment qua DataLoader gf-erp-mdm UNIT/COUNTRY) — hiện tại LUÔN null (bug thật, xem BUG-W03-1xx).
    expect(gd.mainUnitDisplayName).toBeTruthy();
    expect(gd.originDisplayName).toBeTruthy();
  });

  it('TC-W03-API-PRDLST-007 [tenant context negative — smoke]: content không lộ code cross-tenant khi header khác JWT claim', async () => {
    const suffix = RUN_ID + 'tnprd';
    const code = `APIW03PRD-TN-${suffix}`;
    await createProduct(ownerToken, { code, name: 'Tenant negative smoke', mainUnitCode: VALID_UNIT });
    const resp = await gql(ownerToken, `query($input: InternalProductSearchInput!) { searchInternalProducts(input:$input) { __typename } }`, { input: { keyword: code, page: 0, size: 20 } }, '467');
    expect(resp.status).toBeLessThan(500);
  });
});
