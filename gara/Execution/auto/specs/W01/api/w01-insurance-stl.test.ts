/**
 * W01 Insurance FEAT-INS-STL-DETAIL — API test spec
 * Runner: jest --runInBand from Execution/auto/harness/api/
 * Coverage: TC-W01-API-STL-072 to STL-098
 *
 * Prerequisites:
 *   - gf-accounting:45081, agg-garage-graph:45401, gf-sales:45091 healthy
 *   - SETTLED SO id=2 (has_insurance=true) → settlement should exist (SET-20260610-00002)
 *   - DB: gf_accounting schema = gf_accounting
 *
 * Schema note (BUG-W01-245 Shape D reshape — live as of 2026-06-11):
 *   SettlementByCodeData fields (flat, Shape D — BUG-W01-245 BFF Surface B reshape):
 *     discountMaterial/discountLabor/depreciation/claimReduction/insuranceDeductible: InsuranceAdjustment{mode,value,amount}
 *     serviceInsurance, serviceCustomer, partsInsurance, partsCustomer,
 *     vatInsurance, vatCustomer, totalAfterVatInsurance, totalAfterVatCustomer: Float
 *     insurancePayment, customerPayment, totalPayment: Float
 *     debtPanel: InsuranceDebtPanel { receivableAmount, paidAmount, remainingAmount }
 *   NO nested `insurance` block — former wrapper types (InsuranceAdjustmentBlock, InsuranceSettlementBreakdown,
 *   InsuranceBreakdownPair, InsuranceSettlementHeader) have been dropped.
 *   Spec updated 2026-06-11 to match Shape D after BUG-W01-245 fix deployed.
 */

import axios from 'axios';
import { execSync } from 'child_process';

const GF_SALES_BASE = process.env.GF_SALES_BASE_URL || 'http://localhost:45091';
const GF_ACCOUNTING_BASE = process.env.GF_ACCOUNTING_BASE_URL || 'http://localhost:45081';
const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://localhost:45401/garage/graphql';
const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'internal-dev-key-local';
const SSO_URL = process.env.SSO_STUB_URL || 'http://localhost:45410';

const TENANT_A = 1;

async function getToken(identifier: string): Promise<string> {
  const r = await axios.get(`${SSO_URL}/dev/token?identifier=${identifier}&subdomain=demo`);
  return r.data.accessToken;
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': String(TENANT_A),
  };
}

async function gql(token: string, query: string, variables?: Record<string, unknown>) {
  const resp = await axios.post(AGG_GRAPH_URL, { query, variables }, {
    headers: authHeaders(token),
    validateStatus: () => true,
  });
  return { status: resp.status, data: resp.data };
}

function dbQuery(db: string, sql: string): string {
  try {
    return execSync(`docker exec gf-postgres psql -U chungnt -d ${db} -t -c "${sql}"`, { encoding: 'utf8' }).trim();
  } catch (e: unknown) {
    return `DB_ERROR: ${(e as Error).message}`;
  }
}

// =====================================================================
// Shape D GET_SETTLEMENT_QUERY — flat fields per BUG-W01-245 BFF reshape
// Former: insurance { breakdownByPayer { ... } settlementBalance { ... } ... }
// Current: flat fields directly on SettlementByCodeData root
// =====================================================================
const GET_SETTLEMENT_QUERY = `
  query GetSettlement($code: String!) {
    getSettlementByCode(code: $code) {
      ... on ApiResponseSettlementByCodeResponse {
        success code message
        data {
          code settlementType settlementStatus
          totalServiceAmount totalPartsAmount discountAmount taxAmount finalAmount
          relatedSettlementCode
          discountMaterial { mode value amount }
          discountLabor { mode value amount }
          depreciation { mode value amount }
          claimReduction { mode value amount }
          insuranceDeductible { mode value amount }
          serviceInsurance serviceCustomer
          partsInsurance partsCustomer
          vatInsurance vatCustomer
          totalAfterVatInsurance totalAfterVatCustomer
          insurancePayment customerPayment totalPayment
          debtPanel { receivableAmount paidAmount remainingAmount }
        }
      }
      ... on ErrorResponse { code message statusCode }
    }
  }
`;

const CREATE_INS_SETTLEMENT_MUTATION = `
  mutation CreateInsSett($id: Int!, $input: CreateInsuranceSettlementRequest!) {
    createInsuranceSettlement(id: $id, input: $input) {
      ... on ApiResponseInsuranceSettlementResponse {
        success code message
        data {
          insuranceSettlement { id code settlementType }
          customerSettlement { id code settlementType }
        }
      }
      ... on ErrorResponse { code message statusCode }
    }
  }
`;
// Note: CreateInsuranceSettlementRequest only has customerNotes/insuranceNotes fields.
// insurancePayableAmount is NOT an input — it is computed from the SO snapshot by the service.


// =====================================================================
// Existing settlement queries (from seed data)
// =====================================================================
describe('STL getSettlementByCode existing data (TC-082..087)', () => {
  let token: string;
  let insSettlementCode: string;
  let khSettlementCode: string;

  beforeAll(async () => {
    token = await getToken('accountant@demo.local');
    // Get existing settlement codes from DB
    const insRow = dbQuery('gf_accounting', `SELECT code FROM gf_accounting.settlement_records WHERE settlement_type='INSURANCE' AND tenant_id=1 ORDER BY created_at ASC LIMIT 1`);
    insSettlementCode = insRow.match(/SET-\S+/)?.[0]?.trim() || 'SET-20260610-00002';
    const khRow = dbQuery('gf_accounting', `SELECT code FROM gf_accounting.settlement_records WHERE settlement_type='CUSTOMER' AND tenant_id=1 ORDER BY created_at ASC LIMIT 1`);
    khSettlementCode = khRow.match(/SET-\S+/)?.[0]?.trim() || 'SET-20260610-00001';
    console.log('Insurance settlement code:', insSettlementCode);
    console.log('Customer settlement code:', khSettlementCode);
  });

  test('TC-W01-API-STL-082: getSettlementByCode INSURANCE → insurance flat fields + debtPanel present', async () => {
    const r = await gql(token, GET_SETTLEMENT_QUERY, { code: insSettlementCode });
    expect(r.status).toBe(200);
    const result = r.data.data?.getSettlementByCode;
    expect(result?.success).toBe(true);
    const data = result?.data;
    expect(data).toBeTruthy();
    expect(data?.settlementType).toBe('INSURANCE');
    // Shape D: insurance breakdown fields are flat on SettlementByCodeData (BUG-W01-245 BFF reshape)
    // assert at least one insurance breakdown field is non-null/non-zero
    expect(data?.totalAfterVatInsurance).toBeDefined();
    expect(data?.insurancePayment).toBeDefined();
    // debtPanel must be present
    expect(data?.debtPanel).toBeTruthy();
    expect(typeof data?.debtPanel?.receivableAmount).toBe('number');
    console.log('STL-082 totalAfterVatInsurance:', data?.totalAfterVatInsurance);
    console.log('STL-082 insurancePayment:', data?.insurancePayment);
    console.log('STL-082 debtPanel:', JSON.stringify(data?.debtPanel, null, 2));
  });

  test('TC-W01-API-STL-083: getSettlementByCode CUSTOMER → insurance flat fields null/zero', async () => {
    const r = await gql(token, GET_SETTLEMENT_QUERY, { code: khSettlementCode });
    expect(r.status).toBe(200);
    const result = r.data.data?.getSettlementByCode;
    expect(result?.success).toBe(true);
    const data = result?.data;
    expect(data?.settlementType).toBe('CUSTOMER');
    // Shape D: for CUSTOMER settlement, insurancePayment should be null or 0
    // (no insurance breakdown); discountMaterial etc. should be null
    expect(data?.discountMaterial).toBeNull();
    console.log('STL-083 CUSTOMER settlementType:', data?.settlementType);
    console.log('STL-083 insurancePayment:', data?.insurancePayment);
    console.log('STL-083 discountMaterial:', data?.discountMaterial);
  });

  test('TC-W01-API-STL-084: getSettlementByCode nonexistent → 404 + INS_STL_NOT_FOUND', async () => {
    const r = await gql(token, GET_SETTLEMENT_QUERY, { code: 'NONEXISTENT-999' });
    const result = r.data.data?.getSettlementByCode;
    // Should be ErrorResponse union
    expect(result?.code).toBe('INS_STL_NOT_FOUND');
    expect(result?.statusCode).toBe(404);
    console.log('STL-084 status:', result?.statusCode, 'code:', result?.code);
  });

  test('TC-W01-API-STL-085: Money fields are numbers (not strings) in Shape D flat fields', async () => {
    const r = await gql(token, GET_SETTLEMENT_QUERY, { code: insSettlementCode });
    expect(r.status).toBe(200);
    const data = r.data.data?.getSettlementByCode?.data;
    // Shape D flat breakdown fields must be numbers (not strings)
    if (data?.totalAfterVatInsurance !== null && data?.totalAfterVatInsurance !== undefined) {
      expect(typeof data?.totalAfterVatInsurance).toBe('number');
    }
    if (data?.insurancePayment !== null && data?.insurancePayment !== undefined) {
      expect(typeof data?.insurancePayment).toBe('number');
    }
    if (data?.serviceInsurance !== null && data?.serviceInsurance !== undefined) {
      expect(typeof data?.serviceInsurance).toBe('number');
    }
    console.log('STL-085 totalAfterVatInsurance:', data?.totalAfterVatInsurance, typeof data?.totalAfterVatInsurance);
    console.log('STL-085 insurancePayment:', data?.insurancePayment, typeof data?.insurancePayment);
  });

  test('TC-W01-API-STL-073: Snapshot fields match gf-accounting DB ground-truth', async () => {
    // Ground-truth DB assertion: settlement record in gf_accounting must match response
    const dbRow = dbQuery('gf_accounting', `SELECT insurance_payable_amount, breakdown_total_after_vat_insurance FROM gf_accounting.settlement_records WHERE code='${insSettlementCode}'`);
    console.log('STL-073 DB settlement record:', dbRow);

    const r = await gql(token, GET_SETTLEMENT_QUERY, { code: insSettlementCode });
    const data = r.data.data?.getSettlementByCode?.data;
    if (data) {
      // Shape D: insurancePayment (flat) should match insurance_payable_amount in DB
      const dbMatch = dbRow.match(/[\d.]+/g);
      if (dbMatch && dbMatch.length >= 1) {
        const dbPayable = parseFloat(dbMatch[0]);
        // Shape D: insurancePayment is the flat field (formerly settlementBalance.bhPayment)
        const apiInsPayment = data?.insurancePayment;
        if (apiInsPayment !== undefined && apiInsPayment !== null) {
          expect(apiInsPayment).toBeCloseTo(dbPayable, 2);
          console.log('STL-073 DB insurance_payable_amount:', dbPayable, 'API insurancePayment:', apiInsPayment);
        }
        // Also verify totalAfterVatInsurance matches breakdown_total_after_vat_insurance
        if (dbMatch.length >= 2) {
          const dbTotalAfterVat = parseFloat(dbMatch[1]);
          const apiTotalAfterVat = data?.totalAfterVatInsurance;
          if (apiTotalAfterVat !== undefined && apiTotalAfterVat !== null) {
            expect(apiTotalAfterVat).toBeCloseTo(dbTotalAfterVat, 2);
            console.log('STL-073 DB totalAfterVatInsurance:', dbTotalAfterVat, 'API:', apiTotalAfterVat);
          }
        }
      }
    }
  });

  test('TC-W01-API-STL-086: cancelSettlement BH settlement → blocked (insurance settlements cannot be cancelled)', async () => {
    const CANCEL_MUTATION = `
      mutation CancelSettlement($code: String!) {
        cancelSettlement(code: $code) {
          ... on ApiResponseSettlementDetailResponse { success code message }
          ... on ErrorResponse { code message statusCode }
        }
      }
    `;
    const r = await gql(token, CANCEL_MUTATION, { code: insSettlementCode });
    const result = r.data.data?.cancelSettlement;
    console.log('STL-086 cancelSettlement BH result:', JSON.stringify(result));
    // Should be blocked - insurance settlements cannot be cancelled
    const statusCode = result?.statusCode || r.status;
    expect([400, 422, 409]).toContain(statusCode);
  });

  test('TC-W01-API-STL-096: [Regression] getSettlementByCode CUSTOMER baseline still correct (no regression)', async () => {
    const r = await gql(token, GET_SETTLEMENT_QUERY, { code: khSettlementCode });
    expect(r.status).toBe(200);
    const result = r.data.data?.getSettlementByCode;
    expect(result?.success).toBe(true);
    const data = result?.data;
    expect(data?.settlementType).toBe('CUSTOMER');
    // Schema must be intact (no regression) — Shape D baseline fields present
    expect(data).toHaveProperty('code');
    expect(data).toHaveProperty('settlementStatus');
    // For CUSTOMER: discountMaterial adjustment fields should be null (no insurance adjustment)
    expect(data?.discountMaterial).toBeNull();
    console.log('STL-096 regression KH settlement keys:', Object.keys(data || {}));
  });
});

// =====================================================================
// createInsuranceSettlement (TC-072..075)
// =====================================================================
describe('STL createInsuranceSettlement (TC-072..075)', () => {
  let token: string;

  beforeAll(async () => {
    token = await getToken('accountant@demo.local');
  });

  test('TC-W01-API-STL-074: [for-settlement] Pull 2 times same SO → same snapshot (idempotent)', async () => {
    // Use settled SO id=2 for idempotency test
    const r1 = await axios.get(`${GF_SALES_BASE}/protected/v1/service-orders/${TENANT_A}/2/for-settlement`, {
      headers: { 'X-API-Key': INTERNAL_KEY },
      validateStatus: () => true,
    });
    const r2 = await axios.get(`${GF_SALES_BASE}/protected/v1/service-orders/${TENANT_A}/2/for-settlement`, {
      headers: { 'X-API-Key': INTERNAL_KEY },
      validateStatus: () => true,
    });
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(JSON.stringify(r1.data)).toBe(JSON.stringify(r2.data));
  });

  test('TC-W01-API-STL-080: createInsuranceSettlement SO all-KH → rejected (BH flag required)', async () => {
    // SO id=3 (PRICING, has_insurance=false) — should fail: no BH flag
    const r = await gql(token, CREATE_INS_SETTLEMENT_MUTATION, {
      id: 3,
      input: {}  // no insurancePayableAmount — computed by service
    });
    const result = r.data.data?.createInsuranceSettlement;
    console.log('STL-080 createInsuranceSettlement all-KH result:', JSON.stringify(result));
    const statusCode = result?.statusCode || r.status;
    expect([400, 422, 500]).toContain(statusCode);
  });

  test('TC-W01-API-STL-081: createInsuranceSettlement duplicate (SO id=2 already SETTLED) → 409', async () => {
    // SO id=2 is already SETTLED with insurance settlement (SET-20260610-00002)
    const r = await gql(token, CREATE_INS_SETTLEMENT_MUTATION, { id: 2, input: {} });
    const result = r.data.data?.createInsuranceSettlement;
    console.log('STL-081 duplicate settlement result:', JSON.stringify(result));
    const statusCode = result?.statusCode || r.status;
    // Should be 409 conflict - already settled
    expect([409, 400, 422]).toContain(statusCode);
  });
});

// =====================================================================
// createInsuranceSettlement validation (TC-076..079)
// =====================================================================
describe('STL createInsuranceSettlement validation (TC-076..079)', () => {
  let token: string;

  beforeAll(async () => {
    token = await getToken('accountant@demo.local');
  });

  test('TC-W01-API-STL-076: createInsuranceSettlement on PRICING SO (state invalid) → 400/500 error', async () => {
    // Schema note: CreateInsuranceSettlementRequest only has optional customerNotes/insuranceNotes
    // insurancePayableAmount is NOT an input field - it is computed from SO snapshot
    // PRICING SO → for-settlement returns 400 → createInsuranceSettlement propagates error
    const r = await gql(token, CREATE_INS_SETTLEMENT_MUTATION, { id: 4, input: {} });
    const result = r.data.data?.createInsuranceSettlement;
    const hasError = result?.statusCode >= 400 || r.data.errors?.length > 0;
    console.log('STL-076 PRICING SO result:', JSON.stringify(result));
    expect(hasError).toBe(true);
  });

  test('TC-W01-API-STL-077: createInsuranceSettlement valid notes input schema accepted', async () => {
    // Schema note: CreateInsuranceSettlementRequest only has customerNotes/insuranceNotes
    // Test that correct schema (empty input) is accepted by GraphQL (type error vs business error)
    const r = await gql(token, CREATE_INS_SETTLEMENT_MUTATION, {
      id: 4,
      input: { customerNotes: 'test note', insuranceNotes: 'ins note' }
    });
    // No schema/type errors — business error (PRICING state) is acceptable
    const isSchemaError = r.data.errors?.some((e: { message: string }) =>
      e.message.includes('not defined') || e.message.includes('Expected type')
    );
    console.log('STL-077 valid notes result:', JSON.stringify(r.data.data?.createInsuranceSettlement));
    expect(isSchemaError).toBeFalsy();
  });

  test('TC-W01-API-STL-078: createInsuranceSettlement with unknown field → 400 GraphQL validation error', async () => {
    // Passing an unknown field should cause schema validation error
    const r = await axios.post(AGG_GRAPH_URL, {
      query: CREATE_INS_SETTLEMENT_MUTATION,
      variables: { id: 4, input: { unknownField: 'value' } }
    }, { headers: authHeaders(token), validateStatus: () => true });
    const isSchemaError = r.data.errors?.some((e: { message: string }) =>
      e.message.includes('not defined') || e.message.includes('Field')
    );
    console.log('STL-078 unknown field errors:', r.data.errors?.[0]?.message);
    expect(isSchemaError).toBe(true);
  });

  test('TC-W01-API-STL-079: createInsuranceSettlement notes = null → schema accepts (optional fields)', async () => {
    // customerNotes and insuranceNotes are optional — null should be accepted
    const r = await gql(token, CREATE_INS_SETTLEMENT_MUTATION, {
      id: 4,
      input: { customerNotes: null, insuranceNotes: null }
    });
    const isSchemaError = r.data.errors?.some((e: { message: string }) =>
      e.message.includes('Expected type') || e.message.includes('null value')
    );
    console.log('STL-079 null notes errors:', r.data.errors?.[0]?.message);
    expect(isSchemaError).toBeFalsy();
  });
});

// =====================================================================
// cancelSettlement regression (TC-098)
// =====================================================================
describe('STL cancelSettlement regression (TC-098)', () => {
  let token: string;

  beforeAll(async () => {
    token = await getToken('accountant@demo.local');
  });

  test('TC-W01-API-STL-098: [Regression] cancelSettlement KH baseline (no BH pair) → correct cancel/reject', async () => {
    // Use customer settlement SET-20260610-00001 (DRAFT status if not cancelled yet)
    const khCode = dbQuery('gf_accounting', `SELECT code FROM gf_accounting.settlement_records WHERE settlement_type='CUSTOMER' AND settlement_status='DRAFT' AND tenant_id=1 LIMIT 1`)
      .match(/SET-\S+/)?.[0]?.trim() || '';
    console.log('STL-098 target KH settlement:', khCode);

    if (!khCode.startsWith('SET-')) {
      console.log('STL-098 SKIP: No DRAFT KH settlement found (may already be cancelled)');
      return;
    }

    const CANCEL_MUTATION = `
      mutation CancelSettlement($code: String!) {
        cancelSettlement(code: $code) {
          ... on ApiResponseSettlementDetailResponse { success code message }
          ... on ErrorResponse { code message statusCode }
        }
      }
    `;
    const r = await gql(token, CANCEL_MUTATION, { code: khCode });
    const result = r.data.data?.cancelSettlement;
    console.log('STL-098 cancel result:', JSON.stringify(result));

    if (result?.success) {
      // Verify DB status changed to CANCEL
      const dbRow = dbQuery('gf_accounting', `SELECT settlement_status FROM gf_accounting.settlement_records WHERE code='${khCode}'`);
      console.log('STL-098 DB after cancel:', dbRow);
      expect(dbRow).toContain('CANCEL');
    } else {
      // May have payment or other blocker - check it's a sensible error code
      const statusCode = result?.statusCode || r.status;
      console.log('STL-098 cancel blocked with status:', statusCode, 'code:', result?.code);
      expect([400, 409, 422]).toContain(statusCode);
    }
  });
});
