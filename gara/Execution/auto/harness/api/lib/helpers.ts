/**
 * W02 API test helpers
 */
import axios, { AxiosInstance } from 'axios';

export const GF_ACCOUNTING_BASE = process.env.GF_ACCOUNTING_BASE_URL || 'http://192.168.110.191:45081';
export const GF_SALES_BASE = process.env.GF_SALES_BASE_URL || 'http://192.168.110.191:45091';
export const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://192.168.110.191:45401/garage/graphql';
export const CT_FILE_STORAGE_BASE = process.env.CT_FILE_STORAGE_URL || 'http://192.168.110.191:45888';
export const SSO_STUB = process.env.SSO_STUB_URL || 'http://192.168.110.191:45410';

export const TENANT_1 = '1';
export const TENANT_467 = '467';

// Known test data from DB
export const INSURANCE_SO_CODE = 'PDV-20260626-00005';       // tenant=1, SETTLED, has_insurance=true
export const INSURANCE_SO_ID = 5;                              // id in service_order table
export const CUSTOMER_SO_CODE = 'PDV-20260626-00006';         // tenant=1, COMPLETED, has_insurance=false
export const IN_PROGRESS_INS_SO_CODE = 'PDV-20260626-00009'; // tenant=1, IN_PROGRESS, has_insurance=true
export const INSURANCE_STL_CODE = 'SET-20260626-00006';       // INSURANCE settlement for INSURANCE_SO
export const CUSTOMER_STL_CODE = 'SET-20260626-00005';        // CUSTOMER settlement for same SO
export const EXISTING_DOSSIER_STL = 'SET-20260626-00006';     // has v10 EXPORTED dossier
export const FRESH_DOSSIER_STL = 'SET-20260626-00006';        // fresh settlement with v1 EXPORTED
// SO BH COMPLETED — seeded via seed-w02-bh-completed.sh (TL-W02-E2E-003)
// After seed: PDV-20260622-00009, PDV-20260622-00010, PDV-20260622-00012 all COMPLETED, has_insurance=true, no settlement
export const BH_COMPLETED_SO_CODE = process.env.SEED_SO_BH_COMPLETED_CODE || 'PDV-20260626-00005';

export async function getToken(identifier: string = '0810000002'): Promise<string> {
  const resp = await axios.get(`${SSO_STUB}/dev/token`, { params: { identifier } });
  return resp.data.accessToken;
}

export function makeGfAccountingClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: GF_ACCOUNTING_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': TENANT_1,
      'Content-Type': 'application/json',
    },
    validateStatus: () => true, // don't throw on 4xx/5xx
  });
}

export function makeGfSalesClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: GF_SALES_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': TENANT_1,
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });
}

export async function gqlQuery(token: string, query: string, variables?: Record<string, unknown>) {
  const resp = await axios.post(AGG_GRAPH_URL, { query, variables }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Id': TENANT_1,
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });
  return resp;
}

export async function gqlMutation(token: string, mutation: string, variables?: Record<string, unknown>) {
  return gqlQuery(token, mutation, variables);
}
