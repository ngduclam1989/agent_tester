import { Page } from '@playwright/test';
import { BFF_HOST, uniqueSuffix } from '../e2e/_helpers';

/**
 * Seed helper cho nhóm TC pagination volume (A-011/F-013/L-004) — Run 5.
 *
 * Cách hoạt động: SAU KHI page đã login + đã điều hướng tới 1 màn có gọi
 * GraphQL thật (vd List page — fires `searchMaterialGroups`/`searchInternalProducts`),
 * bắt 1 request GraphQL bất kỳ qua `page.on('request')` để LẤY ĐÚNG header thật
 * (Authorization Bearer token + mọi header khác app tự set — x-client-type,
 * Garage-App-Version...) mà KHÔNG cần tự suy đoán/hardcode. Sau đó dùng
 * `page.request.post()` (cùng browser context, share cookie) gọi THẲNG mutation
 * `createMaterialGroup`/`createInternalProduct` N lần liên tiếp.
 *
 * QUAN TRỌNG — đây KHÔNG phải "pre-seed DB" (không phải direct DB INSERT bypass
 * write path — xem lesson TL-W01-API-007 sub-point (e) "Seed bypass real path").
 * Đây là gọi ĐÚNG cùng 1 GraphQL mutation mà UI form gọi khi submit thật (cùng
 * BFF → backend → DB write path, cùng validation/business-logic) — chỉ khác ở
 * chỗ KHÔNG cần điền form qua từng field UI (tiết kiệm thời gian cho việc seed
 * volume lớn, không phải hành vi cần verify của TC pagination — TC pagination
 * chỉ cần N dòng ACTIVE tồn tại thật, không cần verify lại hành vi form Create
 * đã được cover đầy đủ ở nhóm B/G riêng).
 */

interface CapturedAuth {
  headers: Record<string, string>;
}

/** Bắt header GraphQL thật từ request đầu tiên khớp điều kiện (dùng cho POST kế tiếp). */
export async function captureGraphQLAuthHeaders(page: Page, triggerNavigate: () => Promise<void>): Promise<CapturedAuth> {
  let captured: Record<string, string> | null = null;
  const listener = (req: import('@playwright/test').Request) => {
    if (captured) return;
    const url = req.url();
    if ((url.includes('/graphql') || url.includes(BFF_HOST)) && req.method() === 'POST') {
      captured = req.headers();
    }
  };
  page.on('request', listener);
  await triggerNavigate();
  // Doi toi da 10s de bat duoc it nhat 1 request GraphQL that.
  for (let i = 0; i < 20 && !captured; i++) {
    await page.waitForTimeout(500);
  }
  page.off('request', listener);
  if (!captured) throw new Error('captureGraphQLAuthHeaders: khong bat duoc request GraphQL nao sau 10s');
  const h = captured as Record<string, string>;
  // Loai bo header co the gay loi khi tai su dung qua page.request (content-length se tu tinh lai).
  delete h['content-length'];
  return { headers: h };
}

const CREATE_MATERIAL_GROUP_MUTATION = `
  mutation CreateMaterialGroup($input: CreateMaterialGroupInput!) {
    createMaterialGroup(input: $input) {
      ... on ApiResponseMaterialGroup {
        success
        code
        message
        data { id code name }
      }
      ... on ErrorResponse {
        id code message statusCode path timestamp details
      }
    }
  }
`;

const CREATE_INTERNAL_PRODUCT_MUTATION = `
  mutation CreateInternalProduct($input: CreateInternalProductInput!) {
    createInternalProduct(input: $input) {
      ... on ApiResponseInternalProduct {
        success
        code
        message
        data { id code name }
      }
      ... on ErrorResponse {
        id code message statusCode path timestamp details
      }
    }
  }
`;

function graphqlEndpoint(): string {
  return BFF_HOST.replace(/\/$/, '') + '/garage/graphql';
}

/**
 * Seed `count` nhóm vật tư/hàng hóa ACTIVE qua GraphQL mutation thật (KHÔNG
 * qua UI form — chỉ tiết kiệm thời gian điền form, cùng write path thật).
 * Trả về mảng code đã tạo thành công.
 */
export async function seedMaterialGroupsViaApi(
  page: Page,
  auth: CapturedAuth,
  count: number,
  prefix: string,
): Promise<string[]> {
  const created: string[] = [];
  const ts = uniqueSuffix();
  for (let i = 0; i < count; i++) {
    const code = `${prefix}-${ts}-${String(i).padStart(3, '0')}`;
    const name = `${prefix} seed ${ts} #${i}`;
    const resp = await page.request.post(graphqlEndpoint(), {
      headers: auth.headers,
      data: {
        query: CREATE_MATERIAL_GROUP_MUTATION,
        variables: { input: { code, name, status: 'ACTIVE' } },
      },
    });
    const json = await resp.json().catch(() => null);
    const ok = json?.data?.createMaterialGroup?.success === true;
    if (ok) created.push(code);
    else {
      // Ghi log 1 lan de debug, khong throw ngay (co the do trung code hi hu, thu lai voi suffix khac).
      // eslint-disable-next-line no-console
      console.log(`seedMaterialGroupsViaApi: item ${i} khong success — `, JSON.stringify(json)?.slice(0, 400));
    }
  }
  return created;
}

/**
 * Seed `count` mã sản phẩm nội bộ ACTIVE qua GraphQL mutation thật.
 */
export async function seedInternalProductsViaApi(
  page: Page,
  auth: CapturedAuth,
  count: number,
  prefix: string,
): Promise<string[]> {
  const created: string[] = [];
  const ts = uniqueSuffix();
  for (let i = 0; i < count; i++) {
    const code = `${prefix}-${ts}-${String(i).padStart(3, '0')}`;
    const name = `${prefix} seed ${ts} #${i}`;
    const resp = await page.request.post(graphqlEndpoint(), {
      headers: auth.headers,
      data: {
        query: CREATE_INTERNAL_PRODUCT_MUTATION,
        variables: {
          input: {
            code,
            name,
            mainUnitCode: 'UNIT_CAI',
            status: 'ACTIVE',
            nature: 'GOODS',
          },
        },
      },
    });
    const json = await resp.json().catch(() => null);
    const ok = json?.data?.createInternalProduct?.success === true;
    if (ok) created.push(code);
    else {
      // eslint-disable-next-line no-console
      console.log(`seedInternalProductsViaApi: item ${i} khong success — `, JSON.stringify(json)?.slice(0, 400));
    }
  }
  return created;
}
