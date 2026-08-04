---
type: checklist
artifact_kind: visual-baseline-spec
status: ACTIVE
version: 1
tier: T4
owner_authority: QA Authority
last_reviewed: "2026-06-14"
applies_to: [agent-test-ui, agent-test-mobile-ui]
---

# Visual Baseline Freeze Specification

> Spec cho quy trình tạo, freeze, và quản lý visual baseline phục vụ regression detection wave-over-wave.
> Root cause address: TL-W01-ALL-002 (DEV testability gap) + phân tích agent-test-ui visual bug leakage (2026-06-14).

---

## 1. Vấn đề không có spec này

Khi `toHaveScreenshot()` được gọi lần đầu (chưa có baseline), Playwright **tạo baseline mới và PASS ngay**. Nếu lần đầu đó component đang có bug màu/size → bug trở thành baseline → wave sau compare vs baseline lỗi → không bao giờ phát hiện drift.

**Spec này giải quyết**: xác định baseline chỉ được freeze sau khi visual assertion đã PASS với `toHaveCSS()` và `boundingBox()` gate, không phải sau khi screenshot được chụp tuỳ tiện.

---

## 2. Baseline Storage Location

```
Execution/auto/evidence/W{NN}/baselines/
  └── {screen-slug}/
        ├── {screen-slug}--default.png          # trạng thái mặc định
        ├── {screen-slug}--loading.png           # loading state
        ├── {screen-slug}--empty.png             # empty state
        ├── {screen-slug}--error.png             # error state
        ├── {screen-slug}--{variant}.png         # per variant nếu có
        └── BASELINE-MANIFEST.md                 # metadata
```

`BASELINE-MANIFEST.md` format:
```markdown
# Baseline Manifest — {screen-slug}

| Field | Value |
|---|---|
| Wave | W{NN} |
| Screen | {screen-slug} |
| Oracle | wave{NN}-{feat-slug}[-–{screen-slug}]-oracle.md |
| Frozen at | YYYY-MM-DD |
| Frozen by | agent-test-ui (Run {N}) |
| QA Authority approval | [signed / pending] |
| CSS gate pass | [YES / NO] — phải YES trước khi freeze |
| Playwright version | X.X.X |
| Browser | Chromium X.X |
| Viewport | {width}x{height} |

## CSS Gate Evidence (bắt buộc trước khi freeze)

| Property | Oracle Expected | Actual (probe) | Match |
|---|---|---|---|
| color | #XXXXXX | rgb(X,Y,Z) | YES/NO |
| background-color | #XXXXXX | rgb(X,Y,Z) | YES/NO |
| font-size | NNpx | NNpx | YES/NO |
| font-weight | NNN | NNN | YES/NO |
| border-radius | Npx | Npx | YES/NO |
```

---

## 3. Baseline Freeze Protocol (BẮT BUỘC)

Baseline CHỈ được freeze khi **tất cả** điều kiện sau đã thỏa:

### Step 1 — CSS Gate PASS (prerequisite)

Tất cả CSS property assertions tối thiểu (≥3) từ oracle Design Tokens đã PASS với `toHaveCSS()`:

```typescript
// Must PASS before screenshot baseline creation
await expect(element).toHaveCSS('color', oracleValue.textColor)
await expect(element).toHaveCSS('background-color', oracleValue.bgColor)
await expect(element).toHaveCSS('font-size', oracleValue.fontSize)
// ... ≥3 assertions total
```

Nếu CSS gate chưa PASS → **KHÔNG được chụp baseline screenshot**. Bug màu/size sẽ đưa vào baseline làm ô nhiễm toàn bộ wave sau.

### Step 2 — Chụp baseline screenshot

```typescript
// Chỉ sau khi CSS gate PASS
await expect(page.locator('[data-testid="screen-root"]')).toHaveScreenshot(
  `${screenSlug}--default.png`,
  {
    animations: 'disabled',    // tắt animation để stable
    mask: [page.locator('[data-testid="dynamic-timestamp"]')],  // mask dynamic content
  }
)
```

### Step 3 — Điền BASELINE-MANIFEST.md

- Ghi rõ oracle source, CSS gate evidence, Playwright version, viewport.
- Field `QA Authority approval` = `pending` cho đến khi QA Authority ký.

### Step 4 — Commit baseline (sau QA approval)

```bash
git add Execution/auto/evidence/W{NN}/baselines/
git commit -m "chore(test): freeze visual baseline W{NN} {screen-slug} — CSS gate PASS"
```

**KHÔNG commit baseline nếu `QA Authority approval = pending`.**

---

## 4. Wave-over-Wave Regression Detection

Sau khi baseline đã committed, mọi run `toHaveScreenshot()` tiếp theo (kể cả wave sau) sẽ **compare với committed baseline**:

```typescript
// Wave tiếp theo — tự động compare
await expect(element).toHaveScreenshot(`${screenSlug}--default.png`)
// Playwright diff với committed baseline
// → PASS nếu pixel diff < threshold
// → FAIL nếu drift phát hiện (màu đổi, layout dịch, component thêm/mất)
```

**Threshold mặc định**: `maxDiffPixelRatio: 0.01` (1% pixel diff). Vượt ngưỡng = automatic FAIL, không thể PASS.

---

## 5. Baseline Update Process (Approved Change)

Khi design thay đổi intentionally (approved redesign):

1. **Phải có approval**: CR-MINOR từ QA Authority hoặc Design Authority xác nhận change là intentional.
2. **Xóa baseline cũ** và **chạy lại CSS gate** với oracle mới.
3. **Re-freeze** theo protocol §3 với oracle mới.
4. **KHÔNG dùng `--update-goldens` / `--update-snapshots`** tùy tiện để ép PASS — Playwright sẽ overwrite baseline không warning. Thay vào đó phải xóa file baseline thủ công sau khi có approval.

**Forbidden**:
```bash
# KHÔNG dùng lệnh này để né FAIL
npx playwright test --update-snapshots
```

---

## 6. Per-Agent Responsibility

| Agent | Trách nhiệm |
|---|---|
| `agent-test-ui` | Chạy CSS gate (Tier-1); chụp baseline screenshot sau khi gate PASS; điền MANIFEST; commit pending-approval |
| `agent-test-mobile-ui` | Tương tự nhưng dùng `golden_toolkit` golden diff (`flutter test --update-goldens` chỉ qua approval) |
| QA Authority | Review + sign BASELINE-MANIFEST; approve commit; quyết định update khi design change |
| `agent-dev-garage-web` | Cung cấp `data-testid` đúng convention TC artifact trước khi merge (DEV stage gate) |

---

## 7. Anti-patterns Forbidden

- **KHÔNG freeze baseline khi CSS gate chưa PASS** — bug trở thành baseline.
- **KHÔNG dùng `--update-snapshots` tùy tiện** — phải xóa file thủ công + approval.
- **KHÔNG commit baseline với `QA Authority approval = pending`** — chưa review xong.
- **KHÔNG dùng baseline từ wave trước làm regression target cho wave hiện tại nếu design đã đổi** — phải re-freeze với oracle wave hiện tại.
- **KHÔNG mask quá nhiều dynamic content** — mask che bug thật, chỉ mask timestamp/random ID thực sự dynamic.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-14 | 1 | agent-test-api + QA Authority | Initial spec — address visual baseline drift gap; CSS gate prerequisite; BASELINE-MANIFEST format; wave-over-wave regression detection; anti-patterns. Root: TL-W01-ALL-002 + agent-test-ui visual bug leakage analysis. |
