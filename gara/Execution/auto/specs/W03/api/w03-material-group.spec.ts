/**
 * W03 API — Material Group CRUD (FEAT-CAT-GRP-LIST/CREATE/DETAIL/EDIT/DELETE)
 * Boundary: agg-garage-graph (GraphQL) chủ yếu + gf-inventory REST cho vài case cần REST-only.
 * Dữ liệu tạo mới hoàn toàn mỗi lần chạy (KHÔNG reuse seed cũ) — prefix APIW03GRP + timestamp unique.
 */
import axios from 'axios';

const GF_INVENTORY_BASE = process.env.GF_INVENTORY_BASE_URL || 'http://192.168.110.191:45086/api/v2';
const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://192.168.110.191:45401/garage/graphql';
const SSO_STUB = process.env.SSO_STUB_URL || 'http://192.168.110.191:45410';
const TENANT_A = '1';
const RUN_ID = Date.now().toString().slice(-8);

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

const FRAGMENT_GROUP = `id code name parentId parentName description status createdAt createdBy createdByName updatedAt updatedBy updatedByName`;

async function createGroup(token: string, input: Record<string, unknown>) {
  return gql(token, `mutation($input: CreateMaterialGroupInput!) { createMaterialGroup(input:$input) { __typename ... on ApiResponseMaterialGroup { data { ${FRAGMENT_GROUP} } } ... on ErrorResponse { code message statusCode } } }`, { input });
}
async function getGroup(token: string, id: number | string) {
  return gql(token, `query($id: Int!) { getMaterialGroup(id:$id) { __typename ... on ApiResponseMaterialGroup { data { ${FRAGMENT_GROUP} } } ... on ErrorResponse { code message statusCode } } }`, { id });
}
async function updateGroup(token: string, id: number | string, input: Record<string, unknown>) {
  return gql(token, `mutation($id: Int!, $input: UpdateMaterialGroupInput!) { updateMaterialGroup(id:$id, input:$input) { __typename ... on ApiResponseMaterialGroup { data { ${FRAGMENT_GROUP} } } ... on ErrorResponse { code message statusCode } } }`, { id, input });
}
async function deleteGroup(token: string, id: number | string) {
  return gql(token, `mutation($id: Int!) { deleteMaterialGroup(id:$id) { __typename ... on ApiResponseDeletePayload { success } ... on ErrorResponse { code message statusCode } } }`, { id });
}
async function searchGroups(token: string, input: Record<string, unknown>) {
  return gql(token, `query($input: MaterialGroupSearchInput!) { searchMaterialGroups(input:$input) { __typename ... on ApiResponsePageMaterialGroup { data { content { ${FRAGMENT_GROUP} } pageInfo { totalElements totalPages } } } ... on ErrorResponse { code message } } }`, { input });
}

let ownerToken: string;

beforeAll(async () => {
  ownerToken = await getToken('0810000001');
});

// ============================================================
// FEAT-CAT-GRP-CREATE
// ============================================================
describe('FEAT-CAT-GRP-CREATE', () => {
  it('TC-W03-API-GRPCRE-006 [required-only]: tạo nhóm chỉ với code+name — description/parentId=null, status default ACTIVE, persist ground-truth', async () => {
    const code = `APIW03GRP-REQ-${RUN_ID}`;
    const resp = await createGroup(ownerToken, { code, name: 'QC API Required-Only Group' });
    expect(resp.data.data.createMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
    const created = resp.data.data.createMaterialGroup.data;
    expect(created.code).toBe(code);
    expect(created.status).toBe('ACTIVE');
    expect(created.description == null).toBe(true);
    expect(created.parentId == null).toBe(true);

    // Ground-truth: query độc lập
    const g = await getGroup(ownerToken, created.id);
    const gd = g.data.data.getMaterialGroup.data;
    expect(gd.code).toBe(code);
    expect(gd.status).toBe('ACTIVE');
    expect(gd.description == null).toBe(true);
    expect(gd.parentId == null).toBe(true);
  });

  it('TC-W03-API-GRPCRE-001 [full-fields]: tạo nhóm với ĐẦY ĐỦ tất cả trường (code/name/description/parentId/status) — persist ground-truth', async () => {
    // Parent phải tồn tại trước (ACTIVE) để test parentId
    const parentCode = `APIW03GRP-PARENT-${RUN_ID}`;
    const parentResp = await createGroup(ownerToken, { code: parentCode, name: 'QC API Parent Group', status: 'ACTIVE' });
    const parentId = parentResp.data.data.createMaterialGroup.data.id;

    const code = `APIW03GRP-FULL-${RUN_ID}`;
    const resp = await createGroup(ownerToken, {
      code, name: 'QC API Full-Fields Group', description: 'Mô tả đầy đủ toàn bộ trường', parentId, status: 'ACTIVE',
    });
    expect(resp.data.data.createMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
    const created = resp.data.data.createMaterialGroup.data;
    expect(created.code).toBe(code);
    expect(created.name).toBe('QC API Full-Fields Group');
    expect(created.description).toBe('Mô tả đầy đủ toàn bộ trường');
    expect(String(created.parentId)).toBe(String(parentId));
    expect(created.status).toBe('ACTIVE');
    // Ghi chú: mutation response KHÔNG enrich parentName (chỉ query getMaterialGroup/searchMaterialGroups mới enrich) —
    // đây là hành vi nhất quán quan sát được, không phải bug (AC không yêu cầu mutation echo phải enrich).
    // Ground-truth độc lập — đây mới là nơi assert parentName backend-native (R21) đúng nghĩa.
    const g = await getGroup(ownerToken, created.id);
    const gd = g.data.data.getMaterialGroup.data;
    expect(gd.description).toBe('Mô tả đầy đủ toàn bộ trường');
    expect(String(gd.parentId)).toBe(String(parentId));
    expect(gd.parentName).toBe('QC API Parent Group');
  });

  it('TC-W03-API-GRPCRE-002: mã chứa ký tự đặc biệt bị từ chối — ERR-INV-001', async () => {
    const resp = await createGroup(ownerToken, { code: `GRP@${RUN_ID}`, name: 'Test' });
    const r = resp.data.data.createMaterialGroup;
    expect(r.__typename).toBe('ErrorResponse');
    expect(r.code).toBe('ERR-INV-001');
  });

  it('TC-W03-API-GRPCRE-003 + GRPCRE-015: trùng mã (kể cả lowercase case-insensitive) bị từ chối — ERR-INV-002', async () => {
    const code = `APIW03GRP-DUP-${RUN_ID}`;
    const first = await createGroup(ownerToken, { code, name: 'Original' });
    expect(first.data.data.createMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');

    const dup = await createGroup(ownerToken, { code, name: 'Duplicate' });
    expect(dup.data.data.createMaterialGroup.__typename).toBe('ErrorResponse');
    expect(dup.data.data.createMaterialGroup.code).toBe('ERR-INV-002');

    const dupLower = await createGroup(ownerToken, { code: code.toLowerCase(), name: 'Duplicate lowercase' });
    expect(dupLower.data.data.createMaterialGroup.__typename).toBe('ErrorResponse');
    expect(dupLower.data.data.createMaterialGroup.code).toBe('ERR-INV-002');
  });

  it('TC-W03-API-GRPCRE-007 [bỏ trống — CRITICAL]: tên nhóm rỗng bị từ chối', async () => {
    const resp = await createGroup(ownerToken, { code: `APIW03GRP-NT-${RUN_ID}`, name: '' });
    expect(resp.data.data.createMaterialGroup.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-GRPCRE-008 [space-only — HIGH]: tên chỉ khoảng trắng bị xử lý như rỗng', async () => {
    const resp = await createGroup(ownerToken, { code: `APIW03GRP-SP-${RUN_ID}`, name: '   ' });
    expect(resp.data.data.createMaterialGroup.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-GRPCRE-009: mã nhóm bỏ trống bị từ chối', async () => {
    const resp = await createGroup(ownerToken, { code: '', name: 'Test' });
    expect(resp.data.data.createMaterialGroup.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-GRPCRE-011: thiếu cả code lẫn name — trả lỗi (400/validation)', async () => {
    const resp = await gql(ownerToken, `mutation($input: CreateMaterialGroupInput!) { createMaterialGroup(input:$input) { __typename ... on ErrorResponse { code message } } }`, { input: { code: '', name: '' } });
    // GraphQL có thể trả errors[] validation cấp input hoặc ErrorResponse — chấp nhận cả 2, miễn không phải success
    const success = resp.data.data?.createMaterialGroup?.__typename === 'ApiResponseMaterialGroup';
    expect(success).toBe(false);
  });

  it('TC-W03-API-GRPCRE-012 [trimspace, spec-gap]: mã/tên có khoảng trắng đầu/cuối — ghi nhận hành vi thật (AC-2/AC-3 KHÔNG yêu cầu tường minh phải trim)', async () => {
    const code = `APIW03GRP-WS-${RUN_ID}`;
    const resp = await createGroup(ownerToken, { code: `  ${code}  `, name: '  Phụ tùng  ' });
    const created = resp.data.data.createMaterialGroup;
    // spec-gap: FEAT-CAT-GRP-CREATE AC-2/AC-3 chỉ yêu cầu reject ký tự đặc biệt cho code, KHÔNG nói rõ có phải
    // trim khoảng trắng đầu/cuối hay không (space không nằm trong blacklist ~!@#$%^&*). Hành vi thật quan sát được:
    // server giữ nguyên khoảng trắng (KHÔNG trim) — ghi nhận làm baseline, KHÔNG coi là lỗi vì chưa có AC minh thị.
    expect(created.__typename).toBe('ApiResponseMaterialGroup'); // tối thiểu: không silently corrupt / không lỗi 500
    if (created.__typename === 'ApiResponseMaterialGroup') {
      console.log('[GRPCRE-012][spec-gap] code lưu thật =', JSON.stringify(created.data.code), '| name lưu thật =', JSON.stringify(created.data.name), '— server KHÔNG tự trim, đề nghị BA/Architecture chốt rõ AC nếu cần trim.');
    }
  });

  it('TC-W03-API-GRPCRE-013 [XSS]: payload script trong name lưu như văn bản thuần, không lỗi 500', async () => {
    const code = `APIW03GRP-XSS-${RUN_ID}`;
    const resp = await createGroup(ownerToken, { code, name: '<script>alert(1)</script>' });
    expect(resp.data.data.createMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
    expect(resp.data.data.createMaterialGroup.data.name).toBe('<script>alert(1)</script>');
  });

  it('TC-W03-API-GRPCRE-014 [Audit fields]: createdAt/createdBy set tự động khi tạo', async () => {
    const code = `APIW03GRP-AUD-${RUN_ID}`;
    const before = Date.now();
    const resp = await createGroup(ownerToken, { code, name: 'Audit test' });
    const created = resp.data.data.createMaterialGroup.data;
    expect(created.createdAt).toBeTruthy();
    expect(created.createdBy).toBeTruthy();
    const createdAtMs = new Date(created.createdAt).getTime();
    expect(Math.abs(createdAtMs - before)).toBeLessThan(15000);
  });

  it('TC-W03-API-GRPCRE-004 [BVA 255/256]: mô tả đúng 255 ký tự tạo thành công, 256 ký tự bị từ chối (ERR-INV-016)', async () => {
    const desc255 = 'A'.repeat(255);
    const desc256 = 'A'.repeat(256);
    const code1 = `APIW03GRP-BVA255-${RUN_ID}`;
    const resp1 = await createGroup(ownerToken, { code: code1, name: 'BVA255', description: desc255 });
    expect(resp1.data.data.createMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
    const g1 = await getGroup(ownerToken, resp1.data.data.createMaterialGroup.data.id);
    expect(g1.data.data.getMaterialGroup.data.description.length).toBe(255);

    const code2 = `APIW03GRP-BVA256-${RUN_ID}`;
    const resp2 = await createGroup(ownerToken, { code: code2, name: 'BVA256', description: desc256 });
    expect(resp2.data.data.createMaterialGroup.__typename).toBe('ErrorResponse');
    expect(resp2.data.data.createMaterialGroup.code).toBe('ERR-INV-016');
  });
});

// ============================================================
// FEAT-CAT-GRP-DETAIL
// ============================================================
describe('FEAT-CAT-GRP-DETAIL', () => {
  it('TC-W03-API-GRPDET-002: GET id không tồn tại → 404/ErrorResponse', async () => {
    const resp = await getGroup(ownerToken, 999999999);
    expect(resp.data.data.getMaterialGroup.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-GRPDET-005: detail nhóm vừa xóa trả về ErrorResponse (hard-delete thật)', async () => {
    const code = `APIW03GRP-DELCHK-${RUN_ID}`;
    const created = await createGroup(ownerToken, { code, name: 'To be deleted' });
    const id = created.data.data.createMaterialGroup.data.id;
    const del = await deleteGroup(ownerToken, id);
    expect(del.data.data.deleteMaterialGroup.__typename).toBe('ApiResponseDeletePayload');
    const after = await getGroup(ownerToken, id);
    expect(after.data.data.getMaterialGroup.__typename).toBe('ErrorResponse');
  });
});

// ============================================================
// FEAT-CAT-GRP-EDIT
// ============================================================
describe('FEAT-CAT-GRP-EDIT', () => {
  it('TC-W03-API-GRPEDT-001: sửa tên+mô tả thành công, persist ground-truth', async () => {
    const code = `APIW03GRP-EDIT-${RUN_ID}`;
    const created = await createGroup(ownerToken, { code, name: 'Before edit' });
    const id = created.data.data.createMaterialGroup.data.id;
    const upd = await updateGroup(ownerToken, id, { name: 'Tên mới sau sửa', description: 'Mô tả mới', status: 'ACTIVE' });
    expect(upd.data.data.updateMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
    const g = await getGroup(ownerToken, id);
    expect(g.data.data.getMaterialGroup.data.name).toBe('Tên mới sau sửa');
    expect(g.data.data.getMaterialGroup.data.description).toBe('Mô tả mới');
  });

  it('TC-W03-API-GRPEDT-002: chuyển parentId tới chính nó bị từ chối — ERR-INV-003', async () => {
    const code = `APIW03GRP-SELFPAR-${RUN_ID}`;
    const created = await createGroup(ownerToken, { code, name: 'Self parent test' });
    const id = created.data.data.createMaterialGroup.data.id;
    const upd = await updateGroup(ownerToken, id, { parentId: id });
    expect(upd.data.data.updateMaterialGroup.__typename).toBe('ErrorResponse');
    expect(upd.data.data.updateMaterialGroup.code).toBe('ERR-INV-003');
  });

  it('TC-W03-API-GRPEDT-003 [BFS descendant]: chuyển parentId tới nhóm cháu (A→B→C, đổi A.parent=C) bị từ chối — ERR-INV-003', async () => {
    const suffix = RUN_ID + 'x';
    const a = (await createGroup(ownerToken, { code: `APIW03GRP-A-${suffix}`, name: 'A' })).data.data.createMaterialGroup.data;
    const b = (await createGroup(ownerToken, { code: `APIW03GRP-B-${suffix}`, name: 'B', parentId: a.id })).data.data.createMaterialGroup.data;
    const c = (await createGroup(ownerToken, { code: `APIW03GRP-C-${suffix}`, name: 'C', parentId: b.id })).data.data.createMaterialGroup.data;
    const upd = await updateGroup(ownerToken, a.id, { parentId: c.id });
    expect(upd.data.data.updateMaterialGroup.__typename).toBe('ErrorResponse');
    expect(upd.data.data.updateMaterialGroup.code).toBe('ERR-INV-003');
  });

  it('TC-W03-API-GRPEDT-005 [state-transition set-on]: cha INACTIVE cascade toàn bộ con mọi cấp', async () => {
    const suffix = RUN_ID + 'casc';
    const a = (await createGroup(ownerToken, { code: `APIW03GRP-CA-${suffix}`, name: 'CascadeA', status: 'ACTIVE' })).data.data.createMaterialGroup.data;
    const b = (await createGroup(ownerToken, { code: `APIW03GRP-CB-${suffix}`, name: 'CascadeB', parentId: a.id, status: 'ACTIVE' })).data.data.createMaterialGroup.data;
    const c = (await createGroup(ownerToken, { code: `APIW03GRP-CC-${suffix}`, name: 'CascadeC', parentId: b.id, status: 'ACTIVE' })).data.data.createMaterialGroup.data;

    const upd = await updateGroup(ownerToken, a.id, { status: 'INACTIVE' });
    expect(upd.data.data.updateMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');

    const [ga, gb, gc] = await Promise.all([getGroup(ownerToken, a.id), getGroup(ownerToken, b.id), getGroup(ownerToken, c.id)]);
    expect(ga.data.data.getMaterialGroup.data.status).toBe('INACTIVE');
    expect(gb.data.data.getMaterialGroup.data.status).toBe('INACTIVE');
    expect(gc.data.data.getMaterialGroup.data.status).toBe('INACTIVE');
  });

  it('TC-W03-API-GRPEDT-006 [state-transition set-off, asymmetric]: cha INACTIVE→ACTIVE KHÔNG cascade ACTIVE cho con', async () => {
    const suffix = RUN_ID + 'asym';
    // Sửa lỗi test vòng trước: KHÔNG thể tạo con với parentId trỏ cha đang INACTIVE (bị chặn theo BR-CAT-GRP-008,
    // xác nhận đúng ở GRPCRE-005) — phải tạo cây ở trạng thái ACTIVE trước, dùng chính cascade (GRPEDT-005) để đưa
    // cả cây về INACTIVE, rồi mới test chiều ngược lại (activate cha, xác nhận con KHÔNG bị cascade theo).
    const a = (await createGroup(ownerToken, { code: `APIW03GRP-AA-${suffix}`, name: 'AsymA', status: 'ACTIVE' })).data.data.createMaterialGroup.data;
    const b = (await createGroup(ownerToken, { code: `APIW03GRP-AB-${suffix}`, name: 'AsymB', parentId: a.id, status: 'ACTIVE' })).data.data.createMaterialGroup.data;

    const deactivate = await updateGroup(ownerToken, a.id, { status: 'INACTIVE' });
    expect(deactivate.data.data.updateMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
    const bAfterCascade = await getGroup(ownerToken, b.id);
    expect(bAfterCascade.data.data.getMaterialGroup.data.status).toBe('INACTIVE'); // xác nhận cascade xuống đã xảy ra trước khi test chiều ngược

    const upd = await updateGroup(ownerToken, a.id, { status: 'ACTIVE' });
    expect(upd.data.data.updateMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');

    const gb = await getGroup(ownerToken, b.id);
    // Kỳ vọng theo BR-CAT-GRP-007: KHÔNG cascade ngược — con vẫn INACTIVE
    expect(gb.data.data.getMaterialGroup.data.status).toBe('INACTIVE');
  });
});

// ============================================================
// FEAT-CAT-GRP-DELETE
// ============================================================
describe('FEAT-CAT-GRP-DELETE', () => {
  it('TC-W03-API-GRPDEL-001: xóa nhóm trống thành công, verify hard-delete', async () => {
    const code = `APIW03GRP-DEL1-${RUN_ID}`;
    const created = await createGroup(ownerToken, { code, name: 'Delete happy' });
    const id = created.data.data.createMaterialGroup.data.id;
    const del = await deleteGroup(ownerToken, id);
    expect(del.data.data.deleteMaterialGroup.__typename).toBe('ApiResponseDeletePayload');
    expect(del.data.data.deleteMaterialGroup.success).toBe(true);
    const after = await getGroup(ownerToken, id);
    expect(after.data.data.getMaterialGroup.__typename).toBe('ErrorResponse');
  });

  it('TC-W03-API-GRPDEL-003: reject xóa nhóm còn nhóm con — ERR-INV-005', async () => {
    const suffix = RUN_ID + 'delc';
    const parent = (await createGroup(ownerToken, { code: `APIW03GRP-DP-${suffix}`, name: 'DelParent' })).data.data.createMaterialGroup.data;
    await createGroup(ownerToken, { code: `APIW03GRP-DC-${suffix}`, name: 'DelChild', parentId: parent.id });
    const del = await deleteGroup(ownerToken, parent.id);
    expect(del.data.data.deleteMaterialGroup.__typename).toBe('ErrorResponse');
    expect(del.data.data.deleteMaterialGroup.code).toBe('ERR-INV-005');
    const stillThere = await getGroup(ownerToken, parent.id);
    expect(stillThere.data.data.getMaterialGroup.__typename).toBe('ApiResponseMaterialGroup');
  });

  it('TC-W03-API-GRPDEL-005 [state-transition chain EC-2]: xóa con trước rồi xóa cha lại thành công', async () => {
    const suffix = RUN_ID + 'chain';
    const parent = (await createGroup(ownerToken, { code: `APIW03GRP-CHP-${suffix}`, name: 'ChainParent' })).data.data.createMaterialGroup.data;
    const child = (await createGroup(ownerToken, { code: `APIW03GRP-CHC-${suffix}`, name: 'ChainChild', parentId: parent.id })).data.data.createMaterialGroup.data;

    const delParentBlocked = await deleteGroup(ownerToken, parent.id);
    expect(delParentBlocked.data.data.deleteMaterialGroup.__typename).toBe('ErrorResponse');
    expect(delParentBlocked.data.data.deleteMaterialGroup.code).toBe('ERR-INV-005');

    const delChild = await deleteGroup(ownerToken, child.id);
    expect(delChild.data.data.deleteMaterialGroup.__typename).toBe('ApiResponseDeletePayload');
    const childGone = await getGroup(ownerToken, child.id);
    expect(childGone.data.data.getMaterialGroup.__typename).toBe('ErrorResponse');

    const delParentAgain = await deleteGroup(ownerToken, parent.id);
    expect(delParentAgain.data.data.deleteMaterialGroup.__typename).toBe('ApiResponseDeletePayload');
    const parentGone = await getGroup(ownerToken, parent.id);
    expect(parentGone.data.data.getMaterialGroup.__typename).toBe('ErrorResponse');
  });
});

// ============================================================
// FEAT-CAT-GRP-LIST
// ============================================================
describe('FEAT-CAT-GRP-LIST', () => {
  it('TC-W03-API-GRPLST-001: searchMaterialGroups trả danh sách với đủ field user-facing + audit', async () => {
    const suffix = RUN_ID + 'lst';
    await createGroup(ownerToken, { code: `APIW03GRP-L1-${suffix}`, name: 'ListTest Alpha' });
    const resp = await searchGroups(ownerToken, { keyword: `APIW03GRP-L1-${suffix}`, page: 0, size: 20 });
    expect(resp.data.data.searchMaterialGroups.__typename).toBe('ApiResponsePageMaterialGroup');
    const content = resp.data.data.searchMaterialGroups.data.content;
    expect(content.length).toBeGreaterThan(0);
    const item = content[0];
    expect(item.code).toBeTruthy();
    expect(item.name).toBeTruthy();
    expect('status' in item).toBe(true);
    expect('createdByName' in item).toBe(true);
  });

  it('TC-W03-API-GRPLST-002 [keyword OR-match code+name]', async () => {
    const suffix = RUN_ID + 'kw';
    const code = `APIW03GRPKW${suffix}`;
    await createGroup(ownerToken, { code, name: 'Phu tung dac biet QC' });
    const byName = await searchGroups(ownerToken, { keyword: 'dac biet QC', page: 0, size: 20 });
    const byCode = await searchGroups(ownerToken, { keyword: code.slice(0, 10), page: 0, size: 20 });
    expect(byName.data.data.searchMaterialGroups.data.content.some((x: any) => x.code === code)).toBe(true);
    expect(byCode.data.data.searchMaterialGroups.data.content.some((x: any) => x.code === code)).toBe(true);
  });

  it('TC-W03-API-GRPLST-003 [filter status ACTIVE/INACTIVE]', async () => {
    const suffix = RUN_ID + 'st';
    const active = (await createGroup(ownerToken, { code: `APIW03GRP-ACT-${suffix}`, name: 'Active grp', status: 'ACTIVE' })).data.data.createMaterialGroup.data;
    const inactive = (await createGroup(ownerToken, { code: `APIW03GRP-INA-${suffix}`, name: 'Inactive grp', status: 'INACTIVE' })).data.data.createMaterialGroup.data;

    const onlyActive = await searchGroups(ownerToken, { keyword: suffix, status: 'ACTIVE', page: 0, size: 50 });
    const codes = onlyActive.data.data.searchMaterialGroups.data.content.map((x: any) => x.code);
    expect(codes).toContain(active.code);
    expect(codes).not.toContain(inactive.code);
  });

  it('TC-W03-API-GRPLST-004 [Filter parentId trả đúng nhóm con trực tiếp]', async () => {
    const suffix = RUN_ID + 'p4';
    const parent = (await createGroup(ownerToken, { code: `APIW03GRP-P4P-${suffix}`, name: 'Parent P4' })).data.data.createMaterialGroup.data;
    const child1 = (await createGroup(ownerToken, { code: `APIW03GRP-P4C1-${suffix}`, name: 'Child1 P4', parentId: parent.id })).data.data.createMaterialGroup.data;
    const child2 = (await createGroup(ownerToken, { code: `APIW03GRP-P4C2-${suffix}`, name: 'Child2 P4', parentId: parent.id })).data.data.createMaterialGroup.data;
    const resp = await searchGroups(ownerToken, { parentId: parent.id, parentIdProvided: true, page: 0, size: 20 });
    const codes = resp.data.data.searchMaterialGroups.data.content.map((x: any) => x.code);
    expect(codes).toEqual(expect.arrayContaining([child1.code, child2.code]));
    expect(codes).not.toContain(parent.code);
  });

  it('TC-W03-API-GRPLST-004b [verify BUG-W03-066 FIX_DONE — regression]: 3-state parentId filter (all-level/root-only/children-of-X) hoạt động đúng qua parentIdProvided', async () => {
    const suffix = RUN_ID + 'v066';
    const parent = (await createGroup(ownerToken, { code: `APIW03GRP-V066P-${suffix}`, name: 'verify066 root' })).data.data.createMaterialGroup.data;
    const child = (await createGroup(ownerToken, { code: `APIW03GRP-V066C-${suffix}`, name: 'verify066 child', parentId: parent.id })).data.data.createMaterialGroup.data;

    const rootOnly = await searchGroups(ownerToken, { keyword: `APIW03GRP-V066`, parentId: null, parentIdProvided: true, page: 0, size: 20 });
    const rootCodes = rootOnly.data.data.searchMaterialGroups.data.content.map((x: any) => x.code);
    expect(rootCodes).toContain(parent.code);
    expect(rootCodes).not.toContain(child.code);

    const childrenOfX = await searchGroups(ownerToken, { keyword: `APIW03GRP-V066`, parentId: parent.id, parentIdProvided: true, page: 0, size: 20 });
    const childCodes = childrenOfX.data.data.searchMaterialGroups.data.content.map((x: any) => x.code);
    expect(childCodes).toContain(child.code);
    expect(childCodes).not.toContain(parent.code);

    const allLevel = await searchGroups(ownerToken, { keyword: `APIW03GRP-V066`, page: 0, size: 20 });
    const allCodes = allLevel.data.data.searchMaterialGroups.data.content.map((x: any) => x.code);
    expect(allCodes).toEqual(expect.arrayContaining([parent.code, child.code]));
  });

  it('TC-W03-API-GRPLST-005: tenant chưa có nhóm trùng keyword ngẫu nhiên — content=[] không lỗi', async () => {
    const resp = await searchGroups(ownerToken, { keyword: `NOMATCH-RANDOM-${RUN_ID}-ZZZZZ`, page: 0, size: 20 });
    expect(resp.data.data.searchMaterialGroups.__typename).toBe('ApiResponsePageMaterialGroup');
    expect(resp.data.data.searchMaterialGroups.data.content).toEqual([]);
  });

  it('TC-W03-API-GRPLST-006 [GraphQL tree — SDL re-verify: union trả data[] phẳng, KHÔNG phải data.nodes[] như planning giả định]', async () => {
    const resp = await gql(ownerToken, `{ getMaterialGroupTree { __typename ... on ApiResponseMaterialGroupTreeList { data { group { code parentName } children { group { code } } } } ... on ErrorResponse { code message } } }`);
    expect(resp.status).toBe(200);
    // BUG THẬT phát hiện qua execution: resolver getMaterialGroupTree luôn trả ErrorResponse
    // message="nodes is not iterable" — bất kể field selection nào (kể cả chỉ __typename).
    // REST /material-groups/tree (GRPLST-007) hoạt động bình thường cùng lúc — lỗi nằm ở
    // BFF resolver (agg-garage-graph), không phải BE gf-inventory. Xem BUG-W03-1xx.
    console.log('[GRPLST-006] getMaterialGroupTree response:', JSON.stringify(resp.data));
    expect(resp.data.data.getMaterialGroupTree.__typename).toBe('ApiResponseMaterialGroupTreeList');
    expect(Array.isArray(resp.data.data.getMaterialGroupTree.data)).toBe(true);
  });

  it('TC-W03-API-GRPLST-007 [REST tree — shape data.nodes[], khác GraphQL shape]', async () => {
    const resp = await axios.get(`${GF_INVENTORY_BASE}/material-groups/tree`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A },
      validateStatus: () => true,
    });
    expect(resp.status).toBe(200);
    expect(Array.isArray(resp.data.data.nodes)).toBe(true);
  });

  it('TC-W03-API-GRPLST-009 [pagination]', async () => {
    const suffix = RUN_ID + 'pg';
    for (let i = 0; i < 5; i++) {
      await createGroup(ownerToken, { code: `APIW03GRP-PG${i}-${suffix}`, name: `Paging ${i}` });
    }
    const page0 = await searchGroups(ownerToken, { keyword: `PG`, page: 0, size: 2 });
    expect(page0.data.data.searchMaterialGroups.data.content.length).toBeLessThanOrEqual(2);
  });

  it('TC-W03-API-GRPLST-010 [tenant context negative — smoke, KHÔNG phải leakage matrix đầy đủ (agent-test-isolation sở hữu chính thức)]', async () => {
    const suffix = RUN_ID + 'tn';
    const code = `APIW03GRP-TENANTA-${suffix}`;
    await createGroup(ownerToken, { code, name: 'Only tenant A visible' });
    // Ghi nhận: tenant context của gf-inventory qua BFF được resolve từ JWT claim custom:tenant_id,
    // KHÔNG phải từ header X-Tenant-Id override (đã verify thực nghiệm — đổi header không đổi tenant thực).
    // Vì harness chưa có identity thật của tenant 467, TC này chỉ smoke-check: server KHÔNG lỗi 5xx khi
    // client gửi X-Tenant-Id không khớp JWT claim — không assert leakage đầy đủ (out of scope, xem Anti-Duplication Routing).
    const resp = await gql(ownerToken, `query($input: MaterialGroupSearchInput!) { searchMaterialGroups(input:$input) { __typename } }`, { input: { keyword: code, page: 0, size: 20 } }, '467');
    expect(resp.status).toBeLessThan(500);
  });

  it('TC-W03-API-GRPLST-011: listUnits gọi thẳng gf-erp-mdm, trả danh sách ĐVT', async () => {
    const resp = await gql(ownerToken, `{ listUnits { __typename ... on ApiResponseUnitList { data { code name } } ... on ErrorResponse { code } } }`);
    expect(resp.data.data.listUnits.__typename).toBe('ApiResponseUnitList');
    expect(resp.data.data.listUnits.data.length).toBeGreaterThan(0);
  });

  it('TC-W03-API-GRPLST-012 [SQL injection safe]', async () => {
    const resp = await searchGroups(ownerToken, { keyword: "' OR '1'='1", page: 0, size: 20 });
    expect(resp.status).toBe(200);
    expect(resp.data.data.searchMaterialGroups.__typename).toBe('ApiResponsePageMaterialGroup');
    expect(resp.data.data.searchMaterialGroups.data.content).toEqual([]);
  });
});
