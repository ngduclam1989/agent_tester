import { APIRequestContext } from '@playwright/test';
import { env, resolveUrl } from '../config/env';

/**
 * Login lấy access token.
 * FIX #2: username/password/URL lấy từ config env, không hardcode.
 */
export async function login(request: APIRequestContext): Promise<string> {
    const loginUrl = resolveUrl(env.apiBaseUrl, env.loginPath);
    const response = await request.post(loginUrl, {
        data: {
            username: env.username,
            password: env.password,
        },
    });

    if (response.status() !== 200) {
        throw new Error(
            `Login FAILED: ${loginUrl} trả về status ${response.status()} — ${await response.text()}`
        );
    }

    const body = await response.json();
    if (!body?.access_token) {
        throw new Error(`Login FAILED: response không có field "access_token" — ${JSON.stringify(body)}`);
    }
    return `Bearer ${body.access_token}`;
}

/** Tạo header chuẩn có Authorization từ token đã login. */
export function createAuthHeaders(token: string, extraHeaders: Record<string, string> = {}) {
    return {
        Authorization: token,
        'Content-Type': 'application/json;charset=UTF-8',
        lang: env.lang,
        clientTime: Date.now().toString(),
        ...extraHeaders,
    };
}

/**
 * Sinh token duy nhất + traceable theo rule CLAUDE.md mục 7:
 * ghép timestamp (truy ngược được lần chạy) với 3 số random (chống trùng khi chạy parallel).
 */
export function generateTraceableToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
}

/** Escape ký tự đặc biệt để dùng chuỗi thường làm pattern RegExp an toàn. */
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Thay placeholder trong test data bằng giá trị unique + traceable.
 * FIX: placeholder được escape trước khi build RegExp; giá trị thay thế dựa trên timestamp
 * nên truy ngược được test nào tạo ra bản ghi, thay vì số random thuần không truy vết được.
 */
export function replaceDataWithRandom(data: string, placeholder: string): string {
    if (!placeholder) return data;
    return data.replace(new RegExp(escapeRegExp(placeholder), 'g'), generateTraceableToken());
}
