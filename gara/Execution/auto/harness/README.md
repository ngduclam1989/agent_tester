# Execution/auto/ — Test Automation Harness (2-lớp, CR-20260701-03)

> **FROZEN.** Thư mục `harness/` là **Lớp A** (infra "build once, reuse"). Test agent của
> `/test-exec` chạy ở chế độ **READ-ONLY** với thư mục này — KHÔNG sửa config/lib, KHÔNG đẻ
> thêm `pw-*.config.ts` theo wave/run (nguyên nhân 152 file harness tích luỹ qua W01/W02).
> Mọi thay đổi Lớp A = task harness-maintainer có chủ đích riêng, KHÔNG phải hành vi `/test-exec`.

## Phân lớp

| | Lớp A — `harness/` (FROZEN) | Lớp B — `specs/` + `evidence/` (generated) |
|---|---|---|
| Bản chất | Config, runner, lib, scaffold — dùng chung mọi wave | Spec + seed + evidence sinh theo wave |
| Tần suất đổi | Hiếm (maintainer) | Mỗi `/test-exec` |
| Ai ghi | Maintainer harness | 8 test agent |

```
Execution/auto/
├── harness/                    ← LỚP A (FROZEN, READ-ONLY với /test-exec)
│   ├── playwright/
│   │   ├── playwright.config.ts   ← CONFIG DUY NHẤT (projects: chromium | probe)
│   │   ├── lib/chrome-resolver.ts ← resolve Chrome portable (quét động ms-playwright)
│   │   └── probes/                ← smoke/debug probe hạ tầng (giữ nhóm được reference)
│   ├── api/
│   │   ├── jest.config.ts         ← roots trỏ ../../specs; testMatch '**/api/**'
│   │   ├── lib/helpers.ts         ← client/auth/helpers dùng chung
│   │   └── probes/ · setup.ts · package.json
│   ├── seed/lib/pg-exec.sh         ← khung seed param hóa (source bởi seed wave)
│   ├── patrol/ · flutter-widget/ · alchemist/ · integration-test/  ← Flutter scaffold
│   └── README.md  (file này)
│
├── specs/                      ← LỚP B (sinh theo wave)
│   └── W{NN}/{api,e2e,ui,mobile-e2e,mobile-ui,seed}/
└── evidence/W{NN}/             ← LỚP B (screenshot/log)
```

## Cách chạy (KHÔNG tạo config mới)

```bash
# Playwright (web E2E/UI) — cd Execution/auto/harness/playwright
npm install && npm run install-browsers                       # 1 lần
BASE_URL=http://localhost:45300 npx playwright test W03/e2e    # E2E wave 03 (filter theo path)
BASE_URL=http://localhost:45300 npx playwright test W03/ui     # UI  wave 03
npx playwright test --project=probe                            # smoke probe infra-level

# API (Jest) — cd Execution/auto/harness/api
npm install
npx jest --testPathPattern='W03/api'                          # wave bất kỳ

# Seed data theo wave (Lớp B source khung Lớp A)
PG_CONTAINER=gf-postgres bash ../../specs/W03/seed/seed-w03-*.sh
```

## Quy ước bắt buộc (W03+)

- **Chọn scope = CLI positional/flag**, KHÔNG tạo file config mới: `npx playwright test W{NN}/{ui,e2e}` · `jest --testPathPattern='W{NN}/api'`.
- **Host = ENV**: `BASE_URL` (web), `GF_*_BASE_URL` (api). KHÔNG hardcode IP máy vào spec/config.
- **Browser**: resolver quét động cache (macOS arm64 / linux / puppeteer). Override: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
- **macOS Apple Silicon**: `playwright.config.ts` đã nhúng `--disable-gpu --disable-software-rasterizer`
  (TL-W02-E2E-012 / BUG-W02-117 — không có sẽ SEGV_ACCERR khi render form phức tạp). KHÔNG gỡ.
- **Build-output** (`.dart_tool/`, `build/`, `playwright-report/`, `test-results/`, `pubspec.lock`,
  `local.properties`, `node_modules/`) đã `.gitignore` — KHÔNG commit.

## Lớp B write-contract

Xem `.claude/commands/test-exec.md` §Source/Target. Test agent CHỈ ghi:
`specs/W{NN}/**`, `evidence/W{NN}/`, `automated-test-cases/`, `test-reports/`, `Tracking/WAVE{NN}/`.
Chi tiết refactor: CR-20260701-03 (`Tracking/CHANGE-REQUESTS.md`).
