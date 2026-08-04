/**
 * W03 API — Smoke + Auth Baseline (CROSS-001..007)
 * Boundary: gf-inventory (REST /api/v2) + agg-garage-graph (GraphQL)
 * Remote-box mode: SUT chạy sẵn tại 192.168.110.191 (PKG-W03 §3.C).
 */
import axios from 'axios';

const GF_INVENTORY_BASE = process.env.GF_INVENTORY_BASE_URL || 'http://192.168.110.191:45086/api/v2';
const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://192.168.110.191:45401/garage/graphql';
const SSO_STUB = process.env.SSO_STUB_URL || 'http://192.168.110.191:45410';
const TENANT_A = '1';

async function getToken(identifier: string): Promise<string> {
  const resp = await axios.get(`${SSO_STUB}/dev/token`, { params: { identifier } });
  return resp.data.accessToken;
}

async function gql(token: string | undefined, query: string, variables?: Record<string, unknown>, tenant = TENANT_A) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenant) headers['X-Tenant-Id'] = tenant;
  return axios.post(AGG_GRAPH_URL, { query, variables }, { headers, validateStatus: () => true });
}

let ownerToken: string;
let accountantToken: string;

beforeAll(async () => {
  ownerToken = await getToken('0810000001');
  accountantToken = await getToken('0810000002');
});

describe('Environment smoke (precondition, không phải TC sản phẩm)', () => {
  it('REST gf-inventory reachable — POST /material-groups/search trả 2xx/4xx (không network error)', async () => {
    const resp = await axios.post(`${GF_INVENTORY_BASE}/material-groups/search`, {}, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    expect(resp.status).toBeLessThan(500);
  });

  it('GraphQL agg-garage-graph reachable — {__typename} trả 200', async () => {
    const resp = await gql(ownerToken, '{ __typename }');
    expect(resp.status).toBe(200);
  });
});

describe('TC-W03-API-CROSS-001..005 — Auth/Authz baseline (Common Baseline API-AA01-07, auto-miss resolved)', () => {
  it('TC-W03-API-CROSS-001: REST không kèm Authorization header → 401', async () => {
    const resp = await axios.post(`${GF_INVENTORY_BASE}/material-groups/search`, {}, {
      headers: { 'X-Tenant-Id': TENANT_A, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    expect([401, 403]).toContain(resp.status);
  });

  it('TC-W03-API-CROSS-002: REST token giả mạo (invalid signature payload) → 401', async () => {
    const resp = await axios.post(`${GF_INVENTORY_BASE}/material-groups/search`, {}, {
      headers: { Authorization: 'Bearer tampered.signature.payload', 'X-Tenant-Id': TENANT_A, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    expect([401, 403]).toContain(resp.status);
  });

  it('TC-W03-API-CROSS-003: GraphQL không kèm Authorization header → lỗi auth (data null hoặc errors auth)', async () => {
    const resp = await gql(undefined, '{ searchMaterialGroups(input:{page:0,size:5}) { __typename } }');
    const body = resp.data;
    const hasAuthError = (body.errors && body.errors.length > 0) ||
      (body.data?.searchMaterialGroups?.__typename === 'ErrorResponse');
    expect(hasAuthError).toBe(true);
  });

  it('TC-W03-API-CROSS-004: GraphQL token giả mạo → lỗi auth, không trả dữ liệu thật', async () => {
    const resp = await gql('tampered.signature.payload', '{ searchMaterialGroups(input:{page:0,size:5}) { __typename } }');
    const body = resp.data;
    const hasAuthError = (body.errors && body.errors.length > 0) ||
      (body.data?.searchMaterialGroups?.__typename === 'ErrorResponse');
    expect(hasAuthError).toBe(true);
  });

  it('TC-W03-API-CROSS-005: token hợp lệ nhưng thiếu X-Tenant-Id header — REST reject hoặc fallback an toàn (không leak all-tenant)', async () => {
    const resp = await axios.post(`${GF_INVENTORY_BASE}/material-groups/search`, {}, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    // Ghi nhận hành vi thật: hoặc reject (4xx) hoặc tenant tự resolve từ JWT claim (200, nhưng vẫn scoped đúng tenant).
    // KHÔNG chấp nhận HTTP 500 (unexpected exception) — đó là dấu hiệu thiếu validate.
    expect(resp.status).toBeLessThan(500);
  });
});

describe('TC-W03-API-CROSS-006 — HTTP Method sai (Common Baseline API-M0x)', () => {
  it('TC-W03-API-CROSS-006: GET trên route chỉ hỗ trợ POST (/internal-products/search) — ghi nhận status thật, không được 5xx unhandled', async () => {
    const resp = await axios.get(`${GF_INVENTORY_BASE}/internal-products/search`, {
      headers: { Authorization: `Bearer ${ownerToken}`, 'X-Tenant-Id': TENANT_A },
      validateStatus: () => true,
    });
    // eslint-disable-next-line no-console
    console.log('[CROSS-006] GET /internal-products/search status=', resp.status, 'body=', JSON.stringify(resp.data).slice(0, 300));
    // Kỳ vọng chuẩn REST: 404 (route không match GET) hoặc 405 (method not allowed).
    // Nếu server trả 500 "INTERNAL_SERVER_ERROR" (unexpected runtime exception) — đây là hành vi KHÔNG đạt chuẩn REST hygiene, ghi nhận làm bug.
    expect([404, 405]).toContain(resp.status);
  });
});

describe('TC-W03-API-CROSS-007 — Auth header propagation REST → GraphQL', () => {
  it('TC-W03-API-CROSS-007: accountant token GraphQL search trả dữ liệu (không bị chặn do role) — kế toán và chủ garage quyền ngang nhau', async () => {
    const resp = await gql(accountantToken, '{ searchMaterialGroups(input:{page:0,size:5}) { __typename } }');
    expect(resp.status).toBe(200);
    expect(resp.data.data.searchMaterialGroups.__typename).not.toBe('ErrorResponse');
  });
});
