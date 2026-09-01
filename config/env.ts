/**
 * Centralized environment config.
 * FIX #2: credentials & URL không còn hardcode trong source — đọc từ biến môi trường.
 * FIX #9: base URL tập trung tại đây, cột ${Domain} trong Excel chỉ là override tuỳ chọn.
 */

function required(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(
            `Thiếu biến môi trường bắt buộc: ${name}. ` +
            `Tạo file .env từ .env.example rồi điền giá trị trước khi chạy test.`
        );
    }
    return value;
}

export const env = {
    /** Base URL mặc định của API under test. */
    get apiBaseUrl(): string {
        return required('API_BASE_URL');
    },
    /** Endpoint login (path tương đối so với apiBaseUrl, hoặc URL tuyệt đối). */
    get loginPath(): string {
        return process.env.API_LOGIN_PATH ?? '/login-with-local';
    },
    get username(): string {
        return required('API_USERNAME');
    },
    get password(): string {
        return required('API_PASSWORD');
    },
    /** Ngôn ngữ gửi kèm header, mặc định VN. */
    get lang(): string {
        return process.env.API_LANG ?? 'VN';
    },
};

/** Ghép base URL với path, chấp nhận path đã là URL tuyệt đối. */
export function resolveUrl(base: string, pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }
    return base.replace(/\/+$/, '') + '/' + pathOrUrl.replace(/^\/+/, '');
}
