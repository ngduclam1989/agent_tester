/**
 * Smoke probe — chứng minh runner execute được trên máy hiện tại.
 * Chạy: npx jest --runInBand --testPathPattern='probes/smoke'
 * Pass khi jest có thể chạy ít nhất 1 assertion; không cần services online.
 */
describe('API Harness Smoke Probe', () => {
  it('runner execute được — Jest + ts-jest hoạt động', () => {
    expect(1 + 1).toBe(2);
  });

  it('env vars có thể đọc được', () => {
    const base = process.env.GF_SALES_BASE_URL || 'http://localhost:8083';
    expect(base).toMatch(/^https?:\/\//);
  });
});
