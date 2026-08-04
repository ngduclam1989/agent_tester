// Global setup for Garage API test harness
// Reads env: GF_SALES_BASE_URL, GF_ACCOUNTING_BASE_URL, AGG_GARAGE_GRAPH_URL
// Auth: garage JWT (no signature verify — HS256 sso-stub mint, see MEMORY garage-jwt-no-signature-verify)

export const GF_SALES_BASE = process.env.GF_SALES_BASE_URL || 'http://localhost:8083';
export const GF_ACCOUNTING_BASE = process.env.GF_ACCOUNTING_BASE_URL || 'http://localhost:8084';
export const AGG_GRAPH_URL = process.env.AGG_GARAGE_GRAPH_URL || 'http://localhost:4000/graphql';

export const TENANT_A = 'garage-a';
export const TENANT_B = 'garage-b';

// Test tokens — placeholder; actual token generation via sso-stub in TEST_EXECUTION
export const ACCOUNTANT_TOKEN = process.env.ACCOUNTANT_TOKEN || 'TEST_TOKEN_ACCOUNTANT';
export const OWNER_TOKEN = process.env.OWNER_TOKEN || 'TEST_TOKEN_OWNER';
export const TECH_TOKEN = process.env.TECH_TOKEN || 'TEST_TOKEN_TECH';
