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

/**
 * Config riêng cho API AML Transaction Screening (MSB).
 * Tách khỏi `env` ở trên vì suite này dùng Basic Auth + base URL khác, không dùng
 * luồng login lấy Bearer token. Getter lazy nên suite cũ không bị ép khai báo biến mới.
 */
export const amlEnv = {
    /** Base URL của service transaction-screening (SIT mặc định lấy từ bộ TC). */
    get baseUrl(): string {
        return required('AML_BASE_URL');
    },
    /**
     * Giá trị header Authorization dạng Basic.
     * Ưu tiên AML_AUTH_HEADER (đã gồm prefix "Basic "); nếu không có thì tự dựng
     * từ AML_USERNAME/AML_PASSWORD để không phải chép chuỗi base64 vào .env.
     */
    get basicAuthHeader(): string {
        const raw = process.env.AML_AUTH_HEADER;
        if (raw && raw.trim() !== '') return raw.trim();
        const credentials = `${required('AML_USERNAME')}:${required('AML_PASSWORD')}`;
        return 'Basic ' + Buffer.from(credentials, 'utf-8').toString('base64');
    },
};

/** Ghép base URL với path, chấp nhận path đã là URL tuyệt đối. */
export function resolveUrl(base: string, pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }
    return base.replace(/\/+$/, '') + '/' + pathOrUrl.replace(/^\/+/, '');
}
