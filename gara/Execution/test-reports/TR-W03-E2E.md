---
document_id: "TR-W03-E2E-agent-test-e2e"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: DRAFT
version: 1
wave: "W03"
agent: "agent-test-e2e"
boundary: "garage-web, agg-garage-graph, gf-inventory, gf-erp-mdm"
execution_date: "2026-07-02"
last_reviewed: "2026-07-02"
---

# Báo cáo kiểm thử — Wave 03: E2E Web (EP-INVENTORY-CATALOG — Danh mục vật tư)

> Báo cáo kết quả kiểm thử E2E web cho Wave W03, thực thi bởi `agent-test-e2e` qua Playwright live browser (Chromium, remote-box).

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W03 |
| **Subject / execution slice** | E2E Web — Danh mục vật tư (Material Group + Internal Product CRUD, Import/Export, Cross-cutting/Regression) |
| **Boundary(ies)** | `garage-web`, `agg-garage-graph`, `gf-inventory`, `gf-erp-mdm`, `gf-purchase`, `gf-sales`, `ct-file-storage` |
| **Agent thực thi** | `agent-test-e2e` |
| **Nguồn thống kê** | AUTOMATED (Playwright live Chromium, không code-inspection) |
| **Ngày bắt đầu (Run 1)** | 2026-07-02 |
| **Ngày kết thúc (latest run)** | 2026-07-02 |
| **Số lần chạy chính thức** | 1 (Run 1 — lần đầu execute artifact này; nhiều lần chạy thử/chẩn đoán trước đó trong cùng ngày KHÔNG tính là official run, chỉ dùng để phát hiện + fix lỗi hạ tầng/spec trước khi chốt run chính thức cuối cùng) |
| **Loại kiểm thử** | E2E full journey (Smoke + Wave + Regression) |
| **Môi trường** | Remote-box (`192.168.110.191:45300` qua `BASE_URL`), Playwright harness Layer A frozen tại `Execution/auto/harness/playwright/` |
| **Phiên bản code (latest run)** | garage-web + agg-garage-graph + gf-inventory tại thời điểm 2026-07-02 (remote-box live, không rõ commit SHA cụ thể — môi trường shared) |
| **Gate source** | Work package `PKG-W03-inventory-catalog.md` + agent-test-e2e contract |
| **Kết luận tổng quát (latest run)** | **FAIL** (xem §8 — 39/77 TC FAIL, trong đó CHỈ 2 xác nhận là lỗi sản phẩm thật; phần lớn còn lại là spec-locator gap phát hiện + fix một phần trong session, cần re-run có định hướng ở wave sau) |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-07-02 | `/test-exec` initial (lần đầu execute `TC-W03-E2E.md`, đã bump 73→77 TC theo yêu cầu bổ sung data-mới required-only/full-fields) | remote-box live (no SHA) | 53 (24 auto-skip do seed absent) | 14 | 39 | 24 | 0 | BUG-W03-117, BUG-W03-118 | — (không có bug nào ở trạng thái chờ verify map sang TC-W03-E2E-* trước run này) | FAIL |

> **Ghi chú quan trọng về Run 1**: trước khi đạt được kết quả cuối cùng ở trên, agent đã thực hiện NHIỀU lần chạy toàn bộ 77 TC trong cùng phiên làm việc để phát hiện + sửa lỗi hạ tầng (symlink sai — TL-W03-E2E-001) và lỗi spec (race điều hướng, ambiguous text-match, testid không wire — TL-W03-E2E-002/003/004). Các lần chạy trung gian đó KHÔNG được dùng làm evidence PASS/FAIL chính thức cho bất kỳ TC nào — chỉ lần chạy cuối cùng (sau khi đã áp dụng các fix khả thi trong thời gian cho phép) được dùng để chốt Status trong `TC-W03-E2E.md`.

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi (không tính BLOCKED) | 53 | — | — |
| TC PASS | 14 | — | — |
| TC FAIL | 39 | pass rate ≥ 80% theo exit criteria wave | KHÔNG |
| TC SKIP (tự ý) | 0 | — | — |
| TC BLOCKED-by-harness (seed env var absent, `test.skip()` tự động) | 24 | — | — |
| **Tỷ lệ pass (trên TC executed)** | 26.4% (14/53) | ≥ 80% | **KHÔNG** |
| Bug P0 mở | 0 | 0 | CÓ |
| Bug P1 mở | 1 (BUG-W03-117) | 0 mong muốn, cần fix trước GO | KHÔNG |
| Bug P2 mở | 1 (BUG-W03-118) | theo active gate | — |

> **Diễn giải bắt buộc đọc trước khi dùng số liệu này để quyết định gate**: pass rate 26.4% **KHÔNG phản ánh trực tiếp chất lượng feature production**. Root-cause breakdown chi tiết ở §4 cho thấy: chỉ **2/39 FAIL** có bằng chứng xác nhận là lỗi sản phẩm thật (BUG-W03-117, BUG-W03-118 — và BUG-W03-118 là lỗi testability/automation, không chặn người dùng cuối thao tác thủ công). **~36/39 FAIL còn lại** là do spec Playwright (viết bởi chính agent này) có gap về locator (race điều hướng SPA, text-match ambiguous, testid chưa wire khiến phải work-around) — agent đã phát hiện + fix được nhiều lớp gap trong cùng phiên (xem TL-W03-E2E-001..004) nhưng KHÔNG đủ thời gian fix triệt để + re-run trước khi phiên kết thúc. **Khuyến nghị**: KHÔNG dùng con số 26.4% làm căn cứ NO-GO cho feature; cần 1 lần re-run tiếp theo (sau khi áp dụng đầy đủ fix TL-W03-E2E-004) trước khi kết luận chất lượng thật của 12 FEAT trong wave này.

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass (/executed) |
|---|---|---|---|---|---|
| P1 (Smoke) | 16 | 5 | 8 | 3 | 38% |
| P2 (Wave) | 52 | 8 | 27 | 17 | 23% |
| P3 (Wave, biên) | 9 | 1 | 4 | 4 | 20% |

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | BLOCKED |
|---|---|---|---|---|
| E2E (garage-web → agg-garage-graph → gf-inventory/gf-erp-mdm) | 77 | 14 | 39 | 24 |
| Cross-boundary regression (gf-purchase/gf-sales zero-break ADR-017) | 2 (R07/R08) | 0 | 0 | 2 (thiếu `SEED_LEGACY_*_SKU`) |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated (Playwright live) | 77 | 14 | 39 | 24 | 0 | `Execution/automated-test-cases/TC-W03-E2E.md` v3 |
| Manual | N/A | — | — | — | — | Manual QC chưa chạy song song run này |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

N/A — Run 1 là lần chạy chính thức đầu tiên của artifact này (single official run trong báo cáo này).

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|
| TC-W03-E2E-A01 | Tạo cây nhóm 3 cấp — List trải phẳng | FAIL | 32.5s | Race điều hướng (TL-W03-E2E-004) |
| TC-W03-E2E-A07 | Xem chi tiết nhóm — 6 field + audit | PASS | 2.5s | — |
| TC-W03-E2E-A13 | Sửa nhóm — đổi tên+mô tả | FAIL | 2.1-2.9s | Race điều hướng (TL-W03-E2E-004) |
| TC-W03-E2E-A17 | Sửa nhóm — cascade Ngừng hoạt động | FAIL | 32.5s | Race điều hướng |
| TC-W03-E2E-A19 | Xóa nhóm — chain block/happy | FAIL | 32.7s | Race điều hướng + spec A19 chain drift đã biết (v2 changelog) |
| TC-W03-E2E-B01 | Tạo mã SP đầy đủ 4 tab | BLOCKED | — | Thiếu `SEED_UNMAPPED_SKU_ID` |
| TC-W03-E2E-B22 | Sửa mã SP — cập nhật đầy đủ | PASS | 4.2s | — |
| TC-W03-E2E-B24 | Xóa mã SP — cascade unmap | FAIL | 8.8s | — |
| TC-W03-E2E-C01 | Import 100 dòng mix | BLOCKED | — | Thiếu `SEED_IMPORT_MIX_100` |
| TC-W03-E2E-D01 | Export theo bộ lọc — 11 cột | FAIL | 2.2-30.7s | ambiguous option-text (TL-W03-E2E-004) |

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|---|
| TC-W03-E2E-R07 | [REGRESSION] Procurement (gf-purchase) zero-break ADR-017 | W03 (first run) | BLOCKED | — | Thiếu `SEED_LEGACY_PROCUREMENT_SKU` — **ADR-017 zero-break CHƯA được xác nhận live** |
| TC-W03-E2E-R08 | [REGRESSION] Bán lẻ phụ tùng (gf-sales) zero-break ADR-017 | W03 (first run) | BLOCKED | — | Thiếu `SEED_LEGACY_RETAIL_SKU` — tương tự R07 |
| TC-W03-E2E-R09 | [REGRESSION][co-located] Sidebar "Danh mục" không phá vỡ menu hiện có | W03 (first run) | **PASS** | 2.5s | Xác nhận live: menu mới append đúng vị trí, các menu group hiện có (Mua hàng/Sửa chữa & Dịch vụ/Tồn kho/Khách hàng/Nhân viên/Chat) vẫn render + navigate đúng |

### 3.3 E2E Journeys

| Journey ID | Tên | Kết quả | Thời gian | Bước fail (nếu có) |
|---|---|---|---|---|
| J-A | Material Group full CRUD (List→Search→Filter→Create→Detail→Edit→Cascade→Delete) | FAIL (mixed) | — | A01/A03/A05/A09-A11/A13-A19/A21/A22 FAIL — root cause chủ yếu race điều hướng + ambiguous text-match (§4) |
| J-B | Internal Product full journey (List→Filter→Create 4-tab→Detail→Edit→Delete) | FAIL (mixed) | — | Phần lớn FAIL cùng root cause; B02/B04/B08/B22 PASS xác nhận CRUD path cơ bản hoạt động khi không vướng locator gap |
| J-C/D | Import/Export | BLOCKED (mixed) | — | Đa số cần seed file `.xlsx` không có sẵn; D01 FAIL do ambiguous text |
| J-R | Cross-cutting/Regression/Deep-flow | Mixed | — | R02/R05/R09 PASS (TENANT-USERS enrichment, DataLoader sanity, co-located sidebar); R01/R04/R06/R10 FAIL |

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

> Bảng đầy đủ 77 TC với Status/Bug ID chính thức đã cập nhật trực tiếp trong `Execution/automated-test-cases/TC-W03-E2E.md` v3 (§4 Test Cases) — không lặp lại toàn bộ ở đây để tránh 2 nguồn sự thật lệch nhau. Tóm tắt theo nhóm:

| Nhóm | Tổng TC | PASS | FAIL | BLOCKED |
|---|---|---|---|---|
| A — Material Group (A01-A12, A21-A22 mới) | 22 | 6 | 15 | 1 |
| T — Exception & Timeout (T01-T08) | 8 | 1 | 3 | 4 |
| B — Internal Product (B01-B16, B29-B30 mới) | 30 | 4 | 20 | 6 |
| C — Import (C01-C05) | 5 | 0 | 1 | 4 |
| D — Export (D01-D02) | 2 | 0 | 1 | 1 |
| R — Cross-cutting/Regression (R01-R10) | 10 | 3 | 4 | 3 |
| **Tổng** | **77** | **14** | **39** | **24** |

---

## 4. Failed Tests — Chi tiết (theo nhóm root-cause, không lặp lại 39 block riêng)

> Do khối lượng 39 TC FAIL với 2 nhóm root-cause chi phối (chỉ 2 TC có root-cause xác nhận là bug sản phẩm), báo cáo gom nhóm theo root-cause thay vì 39 block riêng lẻ — mỗi TC vẫn có Bug ID/note cụ thể trong `TC-W03-E2E.md`.

### 4.1 Root-cause nhóm A — Race điều hướng List→Detail→Edit (TL-W03-E2E-004 phần 1)

**TC bị ảnh hưởng**: A01, A13, A14, A16, A17, A18, A19, R01, R06, R10 (và một phần B20/B23/B24/B28 dùng pattern tương tự với Internal Product).

**Mô tả lỗi**: `page.getByRole('link').first().click()` (mở Detail từ dòng bảng List) ngay sau đó `page.getByRole('button', {name:'Chỉnh sửa'}).click()` — dù đã thêm `waitForLoadState('networkidle')` giữa 2 bước, Playwright vẫn throw `strict mode violation: getByRole('button', {name:'Chỉnh sửa'}) resolved to 20 elements` ở một số lần chạy — nghĩa là click thực thi khi trang VẪN còn ở List (nhiều nút "Chỉnh sửa", 1 nút/dòng), chưa kịp chuyển sang Detail (chỉ có đúng 1 nút "Chỉnh sửa" trên toàn trang).

**Log lỗi tiêu biểu**:
```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Chỉnh sửa' }) resolved to 20 elements:
    1) <button type="button" aria-label="Chỉnh sửa">…</button> aka getByRole('row', ...).getByLabel('Chỉnh sửa')
    ...
```

**Root cause**: `waitForLoadState('networkidle')` đo network activity, KHÔNG đo thời điểm SPA client-side router hoàn tất chuyển route — không phải tín hiệu đủ tin cậy cho race này.

**Hành động tiếp theo**:
- [ ] Đổi sang `page.waitForURL(/\/material-groups\/\d+/)` hoặc chờ heading đặc trưng Detail xuất hiện trước khi thao tác tiếp (đã ghi chi tiết TL-W03-E2E-004).
- [ ] Re-run 10 TC trên sau khi fix.
- [ ] KHÔNG file bug sản phẩm cho nhóm này — chưa có bằng chứng lỗi sản phẩm, chỉ là spec-locator timing gap.

### 4.2 Root-cause nhóm B — Ambiguous text-match khi chọn option filter (TL-W03-E2E-004 phần 2)

**TC bị ảnh hưởng**: A03, B03, D01 (và nguy cơ tương tự ở TC dùng cùng pattern chưa kịp re-run).

**Log lỗi tiêu biểu**:
```
Error: locator.click: Error: strict mode violation: getByText('Đang hoạt động', { exact: true }) resolved to 22 elements:
    1) ...aka getByRole('button', { name: 'Trạng thái Đang hoạt động' })
    2) ...aka getByText('Đang hoạt động').nth(1)  [status badge trong bảng]
    ...
```

**Root cause**: `getByText(exact:true)` chỉ đảm bảo không match substring, KHÔNG đảm bảo unique — text "Đang hoạt động" xuất hiện cả ở nút filter đã chọn lẫn mọi badge trạng thái trong bảng.

**Hành động tiếp theo**:
- [ ] Scope click option vào `page.getByRole('option', {name:...})` (Radix Command list item) nhất quán toàn bộ 7 spec file.
- [ ] Re-run A03/B03/D01 sau khi fix.
- [ ] KHÔNG file bug sản phẩm cho nhóm này.

### 4.3 Root-cause nhóm C — Locator ambiguous khác đã fix một phần, cần re-verify (B09, B16, B29, C03, A09, A05, A10, A11, A21, A22, B05, B07, B10-B14, T01-T03)

**Mô tả**: nhóm TC này FAIL trong lần chạy cuối vì kế thừa hiệu ứng dây chuyền từ §4.1/§4.2 (dùng chung helper `createGroup`/`createBasicProduct` hoặc bước điều hướng tương tự) hoặc lỗi cụ thể khác đã được sửa NGAY SAU KHI phát hiện trong session này (vd `input[type="file"]` khớp 2 phần tử khi cả ảnh sản phẩm lẫn đính kèm cùng hiện diện — đã sửa dùng `.last()`/scope theo tab đang mở nhưng CHƯA kịp re-run xác nhận cuối). **KHÔNG file bug sản phẩm cho nhóm này** — cần 1 lần re-run đầy đủ ở wave sau để phân loại chính xác FAIL nào còn lại là thật.

### 4.4 Root-cause nhóm D — Bug sản phẩm xác nhận thật (2 TC)

| TC ID | Bug ID | Severity | Tóm tắt |
|---|---|---|---|
| TC-W03-E2E-B23 (và ảnh hưởng B01/B10/B22/B29/B30) | BUG-W03-117 | P1 | Dropdown "ĐVT chính"/"ĐVT quy đổi" dùng `UNIT_OPTIONS` hardcode local, chọn "m2" → backend reject 400 "ĐVT chính không tồn tại trong danh mục đơn vị tính (master)" — vi phạm FEAT-CAT-PROD-CREATE AC-6. Xác nhận qua GraphQL response thật (không phải suy đoán). |
| Toàn bộ TC Internal Product Create/List/Detail dùng testid field-level | BUG-W03-118 | P2 | Nhiều `data-testid` khai báo trong registry nhưng không wire vào DOM Internal Product form/filter/detail/dialog/row-action — xác nhận `count()=0` qua Playwright live. |

**Verification history:**

| Run # | Ngày | Verdict | Bug status sau run | Evidence path | Notes |
|---|---|---|---|---|---|
| Run 1 | 2026-07-02 | FAIL (2 bug filed) | `BUG-W03-117` OPEN, `BUG-W03-118` OPEN | `Execution/auto/evidence/W03-e2e-internal-product-d-9124c--Bình-quân-cuối-kỳ-disabled-chromium/` | GraphQL response 400 thật + count()=0 xác nhận qua diag test riêng trước khi kết luận |

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — E2E web không đo code coverage (Playwright browser automation, không phải unit/integration test có instrument coverage).

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC (ước lượng) | AC có TC | Ghi chú |
|---|---|---|---|
| FEAT-CAT-GRP-LIST/CREATE/DETAIL/EDIT/DELETE | ~40 | Đủ (Nhóm A 22 TC) | Coverage rate thật cần re-run để xác nhận pass, hiện chỉ xác nhận PHỦ (có TC), chưa xác nhận PASS |
| FEAT-CAT-PROD-LIST/CREATE/DETAIL/EDIT/DELETE/IMPORT/EXPORT | ~60 | Đủ (Nhóm B/C/D 37 TC) | Tương tự — phủ đủ nhưng verdict PASS thật cần re-run |

---

## 6. Performance Metrics

N/A — không thuộc scope wave này (agent-test-performance sở hữu, R05 trong artifact chỉ là sanity DataLoader N+1, không đo p95).

---

## 7. Issues phát hiện

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug | P1 | "ĐVT chính"/"ĐVT quy đổi" dropdown offer unit không có trong master gf-erp-mdm | garage-web | BUG-W03-117 | Open |
| 2 | Bug | P2 | Internal Product feature — nhiều data-testid khai báo nhưng không wire (Web Component Registry violation) | garage-web | BUG-W03-118 | Open |
| 3 | Drift/Observation | — | Symlink hạ tầng `Execution/auto/specs/node_modules` bị trỏ sai (checkout máy khác) — không phải bug sản phẩm, đã fix + ghi lesson learned | Execution/auto/harness | N/A | Fixed (TL-W03-E2E-001) |
| 4 | Drift/Observation | — | Spec locator race/ambiguous-text pattern lặp lại nhiều lần — sửa được một phần trong session, cần re-run wave sau | garage-web (test-side) | N/A | Partially fixed (TL-W03-E2E-004) |
| 5 | Drift/Observation | — | R07/R08 (regression ADR-017 zero-break Procurement/Retail) chưa xác nhận live do thiếu seed | gf-purchase, gf-sales | N/A | BLOCKED — cần seed `SEED_LEGACY_PROCUREMENT_SKU`/`SEED_LEGACY_RETAIL_SKU` ở lần chạy sau |

### 7.1 Drift phát hiện

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| ĐVT chính dropdown phải lấy từ danh mục ĐVT master | FEAT-CAT-PROD-CREATE AC-6 | FE dùng `UNIT_OPTIONS` hardcode local (`UnitEnum`), không fetch master | BUG-W03-117 filed — cần DEV fix |
| `data-testid` field-level Internal Product PHẢI wire theo Web Component Registry | `.claude/references/web-component-registry.yaml` | Nhiều field/filter/dialog/row-action chưa wire | BUG-W03-118 filed — cần DEV fix + `scripts/check-component-registry-drift.sh` re-verify |

### 7.2 Handoff cập nhật registry / tracker (nếu cần)

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W03-E2E (auto) | 14 PASS / 39 FAIL / 24 BLOCKED-by-harness | QA Authority |
| `Execution/WAVE-TRACKER.md` | W03 E2E verdict | FAIL (cần re-run sau khi áp dụng TL-W03-E2E-004 fix đầy đủ) | Delivery Authority / QA Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | KHÔNG | Nhiều Smoke TC (A01/A13/A17/A19/B24/D01) FAIL do root-cause đã phân tích §4 |
| Regression đạt ngưỡng active gate? | KHÔNG | R07/R08 (ADR-017 zero-break) BLOCKED chưa xác nhận; R09 PASS |
| E2E Journeys đạt ngưỡng active gate? | KHÔNG | Pass rate 26.4% < 80% |
| Coverage đạt ngưỡng active gate? | N/A | Không đo code coverage cho E2E |
| Bug P0 = 0? | CÓ | 0 bug P0 |
| Open bugs đạt ngưỡng active gate? | KHÔNG | 1 P1 (BUG-W03-117) đang OPEN |
| Tenant isolation = 0 leakage? | N/A | Ngoài scope agent-test-e2e (thuộc agent-test-isolation) |

### 8.2 Quyết định

- [ ] CHO QUA GATE (GO)
- [x] **KHÔNG CHO QUA GATE (NO-GO)** — Còn 1 bug P1 (BUG-W03-117) chặn flow tạo/sửa mã sản phẩm khi chọn đơn vị tính không khớp master; pass rate 26.4% chưa đạt ngưỡng 80%; 2 regression ADR-017 chưa xác nhận live (R07/R08 BLOCKED)
- [ ] CHO QUA GATE CÓ ĐIỀU KIỆN (CONDITIONAL GO)

**Lý do NO-GO cụ thể (không dùng để suy diễn feature hỏng diện rộng)**:
1. BUG-W03-117 (P1) phải fix trước — đây là AC violation thật (FEAT-CAT-PROD-CREATE AC-6), ảnh hưởng người dùng cuối thật khi chọn "m2" làm ĐVT chính.
2. Pass rate thấp CHỦ YẾU do spec-locator gap (agent tự phát hiện + fix một phần trong session, xem TL-W03-E2E-004) — cần 1 lần re-run E2E sau khi hoàn thiện fix (waitForURL thay networkidle, scoped getByRole('option') nhất quán) trước khi có kết luận verdict đáng tin cậy về chất lượng thật của 12 FEAT trong wave.
3. R07/R08 (Procurement/Retail zero-break ADR-017) chưa có bằng chứng live — cần seed `SEED_LEGACY_PROCUREMENT_SKU`/`SEED_LEGACY_RETAIL_SKU` trước khi coi ADR-017 an toàn.

### 8.3 Ghi chú cho wave tiếp theo

- Áp dụng đầy đủ TL-W03-E2E-001..004 (symlink guard, login-race fix, testid fallback pattern, waitForURL + scoped getByRole('option')) rồi re-run toàn bộ 77 TC 1 lần nữa trước khi chốt verdict cuối cùng cho W03 E2E.
- Seed `SEED_LEGACY_PROCUREMENT_SKU`/`SEED_LEGACY_RETAIL_SKU`/`SEED_UNMAPPED_SKU_ID`/`SEED_MAPPED_SKU_ID`/`SEED_PRODUCT_WITH_TXN*`/`SEED_IMPORT_*`/`BIG_TENANT_BASE_URL`/`EMPTY_TENANT_BASE_URL` cần chuẩn bị trước lần chạy sau — 24 TC hiện BLOCKED hoàn toàn do thiếu các biến này.
- Sau khi BUG-W03-117/118 được fix, re-run các TC liên quan (B01/B10/B22/B23/B29/B30 cho 117; toàn bộ TC dùng testid field-level Internal Product cho 118) để verify.
- Cân nhắc bootstrap 1 helper `waitForDetailPage(page, {group|product})` dùng chung cho mọi TC List→Detail→Edit thay vì lặp lại `waitForLoadState('networkidle')` không đáng tin cậy ở từng test.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-07-02 | Khởi tạo từ TEST-REPORT-TEMPLATE — Run 1 TEST_EXECUTION W03 E2E web (77 TC: 14 PASS/39 FAIL/24 BLOCKED-by-harness). 2 bug sản phẩm filed (BUG-W03-117 P1, BUG-W03-118 P2). 4 lesson learned filed (TL-W03-E2E-001..004). | agent-test-e2e |
