// Isolation deep-link test: TC-W01-ISO-009, TC-W01-ISO-010
// Tests that web app cannot render cross-tenant SO/settlement data
import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:45300';
const BFF_URL = process.env.BFF_URL || 'http://localhost:45401/garage/graphql';

// Tenant 1 token (from sso-stub /dev/token)
async function getTenant1Token(request: APIRequestContext): Promise<string> {
  const resp = await request.get('http://localhost:45410/dev/token?identifier=accountant%40demo.local');
  const data = await resp.json();
  return data.accessToken;
}

test('TC-W01-ISO-009: Web BFF GET SO of tenant B with tenant A credentials returns error (deep-link denial)', async ({ request }) => {
  const token = await getTenant1Token(request);
  
  // Simulate what the web app's GraphQL call would do when navigating to /service-order/PDV-T2-00001
  const resp = await request.post(BFF_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Tenant-Id': '1',
      'X-Branch-Id': '1',
    },
    data: {
      query: `query { getServiceOrderByCode(code: "PDV-T2-00001") { __typename ... on ErrorResponse { code message statusCode } } }`,
    },
  });
  
  const data = await resp.json();
  const result = data.data?.getServiceOrderByCode;
  
  // Must be ErrorResponse, not ServiceOrderData
  expect(result?.__typename).toBe('ErrorResponse');
  // Must not expose any SO fields of tenant B
  expect(result).not.toHaveProperty('id');
  expect(result).not.toHaveProperty('insuranceCompany');
  expect(result).not.toHaveProperty('hasInsurance');
  // Status should be 404 or 400 denial
  expect([400, 404]).toContain(result?.statusCode);
  
  console.log('TC-W01-ISO-009 result:', JSON.stringify(result));
});

test('TC-W01-ISO-010: Web BFF GET settlement of tenant B with tenant A credentials returns error', async ({ request }) => {
  const token = await getTenant1Token(request);
  
  // Simulate web app call when navigating to /settlement-voucher/SET-T2-00002
  const resp = await request.post(BFF_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Tenant-Id': '1',
      'X-Branch-Id': '1',
    },
    data: {
      query: `query { getSettlementByCode(code: "SET-T2-00002") { __typename ... on ErrorResponse { code message statusCode } } }`,
    },
  });
  
  const data = await resp.json();
  const result = data.data?.getSettlementByCode;
  
  // Must be ErrorResponse
  expect(result?.__typename).toBe('ErrorResponse');
  // Must not expose settlement data of tenant B
  expect(result).not.toHaveProperty('settlementType');
  expect(result).not.toHaveProperty('insurance');
  expect(result).not.toHaveProperty('insuranceAdjustment');
  // Status 404 expected
  expect(result?.statusCode).toBe(404);
  
  console.log('TC-W01-ISO-010 result:', JSON.stringify(result));
});
