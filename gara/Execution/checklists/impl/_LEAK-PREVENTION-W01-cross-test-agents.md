---
name: leak-prevention-w01-cross-test-agents
title: W01 Leak Prevention — Cross-Agent Test Rule Proposals
wave: W01
status: PROPOSAL (cần CR cho agent-test-ui + agent-test-e2e)
reporter: agent-test-api
created: 2026-06-10
version: 1
related:
  - Execution/test-reports/W01/QC-MANUAL-LEAK-ANALYSIS.md
  - Tracking/WAVE01/BUGS.md
---

# W01 Leak Prevention — Cross-Agent Test Rule Proposals

> Mục đích: đề xuất rule update cho `.agents/agent-test-ui.md` và `.agents/agent-test-e2e.md` để ngăn lặp lại pattern lọt bug giống W01 (Reporter=QC-Manual BUG-W01-023..033). Hai file `.agents/*` đó **ngoài OWNED_PATHS** của `agent-test-api`, cần raise CR riêng để apply.
>
> Trace gốc: [Execution/test-reports/W01/QC-MANUAL-LEAK-ANALYSIS.md](../../test-reports/W01/QC-MANUAL-LEAK-ANALYSIS.md).

## A. Đề xuất cho `.agents/agent-test-ui.md` (CR-NEEDED)

### A.1 Forbidden Actions thêm

- **`UI_ORACLE_COPY_FROM_DOM`** — Cấm assert string lấy từ rendered DOM hoặc source code FE đang test. Wording oracle phải từ Figma / PRD / BR / business-rules. Origin: BUG-W01-024 ("Cân thanh toán" lọt vì TC chép từ FE bug).
- **`UI_FIGMA_ORACLE_MISSING`** — TC-UI không được `READY` nếu wave chưa chạy `/prefetch-figma-oracle web {wave}` (hoặc `mobile {wave}`) đầy đủ cho mọi section in-scope. Mỗi section UI phải có file oracle `Product/ux/figma-test-{web,mobile}/wave{NN}-{slug}-oracle.md` tồn tại + được reference trong TC. Origin: BUG-W01-023/028/030/032/033 lọt vì không có Figma oracle.
- **`UI_FIELD_INVENTORY_MISS`** — TC-UI cho mỗi screen phải có ≥1 case **field-inventory diff** vs Figma oracle (assert mọi field/column/label trong Figma đều có DOM tương ứng). Presence-only "có chuỗi X" KHÔNG đủ. Origin: BUG-W01-028 thiếu "Đơn vị thanh toán", BUG-W01-032/033 thiếu cột "Khấu hao".
- **`UI_STATE_CONDITIONAL_MISS`** — TC-UI cho section/column phụ thuộc flag (vd `hasInsurance`) phải có cặp `flag=true → visible` + `flag=false → hidden` + `toggle on→off → hidden ngay sau Lưu`. Origin: BUG-W01-025/032/033.
- **`UI_FORMAT_LABEL_MISS`** — TC-UI phải có (a) date format check (vd `dd/mm/yyyy hh:mm`), (b) enum-to-label mapping (vd `customerType="INDIVIDUAL"` → hiển thị "Cá nhân"), (c) code-to-name mapping (vd brand/model name không phải code). Origin: BUG-W01-030 (8 lỗi UI).

### A.2 Section thêm: §Visual & Field-Inventory Gate

```markdown
## Visual & Field-Inventory Gate (bắt buộc với mọi UI TC)

> Origin: W01 leak — BUG-W01-023 (kích thước/alignment), 028 (thiếu field), 030 (8 mixed UI), 032/033 (thiếu column).

**1. Figma Oracle Required**:
- Mỗi screen trong scope phải có oracle file `Product/ux/figma-test-{web,mobile}/wave{NN}-{slug}-oracle.md`.
- Oracle file gen từ `/prefetch-figma-oracle {platform} {wave}` TRƯỚC khi viết TC.
- TC reference oracle file qua field `Oracle Source` trong artifact TC.

**2. Coverage tối thiểu per screen**:
- (a) **Field inventory diff**: assert mọi field/label/button/header trong Figma oracle hiện diện trong DOM.
- (b) **Wording assert**: từng chuỗi text khớp ĐÚNG oracle (case-sensitive, dấu/khoảng trắng đúng).
- (c) **Format check**: date, currency, percent format khớp oracle.
- (d) **Label mapping**: enum/code → display label khớp oracle (KHÔNG hiển thị raw code).
- (e) **Dimension/spacing** (nếu oracle có): width/height/spacing-key element khớp oracle (visual regression).
- (f) **State-conditional rendering**: section/column phụ thuộc flag → assert visible/hidden ở mỗi state.

**3. Forbidden**:
- Assert string lấy nguyên từ FE rendered text → `UI_ORACLE_COPY_FROM_DOM`.
- "render được" = PASS mà không diff với oracle → `UI_FIELD_INVENTORY_MISS`.
- TC không reference oracle file → `UI_FIGMA_ORACLE_MISSING`.
```

### A.3 Section thêm: §State-Conditional Rendering

```markdown
## State-Conditional Rendering (bắt buộc cho UI feature có flag)

> Origin: W01 leak — BUG-W01-025/026 (`hasInsurance=false` UI vẫn hiện section).

**Khi áp dụng**: feature có ≥1 flag boolean/nullable điều khiển hiển thị (vd `hasInsurance` toggle section "Phân bổ BH"; `payerType` hiển thị mục "Đơn vị thanh toán").

**Yêu cầu TC bộ ba**:
1. **TC flag-on**: set flag=true → Lưu → assert section/column visible + có data đúng.
2. **TC flag-off**: set flag=false → Lưu → assert section/column **hidden** + không leak data cũ.
3. **TC toggle on→off**: bắt đầu flag=true (có data) → toggle off → Lưu → assert section/column hidden ngay sau reload + dependent fields không hiện ở tab khác (vd "Thông tin khác").

**Forbidden**: bỏ TC flag-off với lý do "feature chính là 'có BH'" — vi phạm `UI_STATE_CONDITIONAL_MISS`.
```

---

## B. Đề xuất cho `.agents/agent-test-e2e.md` (CR-NEEDED)

### B.1 Forbidden Actions thêm

- **`E2E_TITLE_BODY_MISMATCH`** — TC title phải khớp implementation. Title "Kế toán bật/tắt toggle Bảo hiểm" nhưng steps chỉ verify "section visible" = mismatch, mandatory failure. Review gate phải check title vs steps match. Origin: BUG-W01-025/026/027 lọt qua TC-W01-E2E-002.
- **`E2E_DB_GROUND_TRUTH_MISS`** — Write flow E2E phải có cross-boundary DB assertion ở end-state. Không chấp nhận chỉ assert UI "hiển thị success" + assert response 200. Origin: BUG-W01-029 (snapshot zero), BUG-W01-031 (customer không lưu).
- **`E2E_LIFECYCLE_GAP`** — Feature có lifecycle multi-stage (Create → Update → Complete → Settle) phải có ≥1 E2E TC trace full lifecycle với DB assertion ở mỗi stage. Origin: BUG-W01-031 không cover SO→COMPLETED side-effect; BUG-W01-029 không cover SO→QT-BH snapshot lifecycle.

### B.2 Section thêm: §Lifecycle Coverage Gate

```markdown
## Lifecycle Coverage Gate (bắt buộc cho feature có multi-stage)

> Origin: W01 leak — BUG-W01-029 (snapshot lifecycle), BUG-W01-031 (completion sync), BUG-W01-026/027 (state-transition).

**Khi áp dụng**: feature có flow multi-stage chạy qua ≥2 boundary (vd SO Create → SO Complete → Settlement Create → Settle).

**Yêu cầu TC bộ tối thiểu**:
1. **Lifecycle E2E** — 1 TC trace full chain stages với cross-boundary DB assert ở MỖI stage transition (vd Create → assert `service_order` row; Complete → assert `service_order.status=COMPLETED` + `customers` upsert + outbox event; Settle → assert `settlements` snapshot khớp SO source).
2. **State-transition E2E** — với mọi flag boolean trong feature, cặp `set-on + set-off + re-toggle` xuyên UI + DB.
3. **Cross-screen consistency** — sau action ở screen A, assert state khớp ở screen B (vd toggle BH off ở Edit SO → assert tab "Thông tin khác" + section Phân bổ BH ở Detail SO đều ẩn).

**Ground-Truth Assertion Required**:
- KHÔNG đủ: UI hiển thị toast "Lưu thành công" + response 200.
- BẮT BUỘC: psql SELECT hoặc REST master endpoint xác nhận state cuối khớp expected.

**Forbidden**:
- Title test khớp business action nhưng steps chỉ verify "trạng thái có" mà không verify chuyển trạng thái → `E2E_TITLE_BODY_MISMATCH`.
- TC kết luận PASS chỉ bằng UI assertion + response → `E2E_DB_GROUND_TRUTH_MISS`.
- Feature lifecycle multi-stage thiếu TC trace full chain → `E2E_LIFECYCLE_GAP`.
```

---

## C. Đề xuất Test Case bổ sung (re-test W01 nếu wave còn open)

| TC mới | Loại | Bug cover | Mô tả |
|---|---|---|---|
| TC-W01-API-NEW-1 | API state-transition | BUG-026/027 | PUT `/api/v3/service-orders/{id}` với `hasInsurance=false` (SO đang có BH) → assert DB `has_insurance=false`, 5 cột adjustment NULL, response read-back BH section absent |
| TC-W01-API-NEW-2 | API side-effect ground-truth | BUG-031 | POST `/api/v3/service-orders` với customer code mới + COMPLETED transition → SELECT `dev_gf_customer.customers WHERE code=?` → assert 1 row + projection `dev_gf_sales.customer_projection` cũng có |
| TC-W01-API-NEW-3 | API snapshot lifecycle | BUG-029 | POST `/api/v1/settlements` cho SO BH có 5 adjustment → SELECT `dev_gf_accounting.settlements` → assert snapshot.adjustment fields khớp SO source (không zero) |
| TC-W01-E2E-NEW-1 | E2E state-transition + cross-screen | BUG-025/026/027 | Toggle BH on tại Edit SO → save → assert UI section visible + DB flag=true → Toggle off → save → assert UI section hidden (Edit + Detail + tab "Thông tin khác") + DB flag=false + 5 cột null |
| TC-W01-E2E-NEW-2 | E2E lifecycle | BUG-029/031 | Create SO BH → adjustment → Complete (assert customer sync) → Tạo phiếu QT BH (assert snapshot khớp) → Settle (assert immutable snapshot) — 4 stage với DB assertion mỗi stage |
| TC-W01-UI-NEW-1 | UI wording oracle | BUG-024/030 | Field-by-field wording diff cho mọi label/button/header trong feature scope → diff vs oracle `Product/ux/figma-test-web/wave01-*-oracle.md` |
| TC-W01-UI-NEW-2 | UI field-inventory | BUG-028/032/033 | Field-inventory diff: phiếu QT detail (assert "Đơn vị thanh toán"), parts-used table (assert column "Khấu hao" khi hasInsurance=true cho cả Detail + Edit) |
| TC-W01-UI-NEW-3 | UI format/label mapping | BUG-030 (8 items) | Format check (date `dd/mm/yyyy hh:mm`), enum→label (customerType "Cá nhân/Tổ chức"), code→name (brand/model name), badge color, column width, button label |

## D. Action Items

1. ⏳ Raise CR — cập nhật `.agents/agent-test-ui.md` theo §A (5 Forbidden Action + 2 section mới). Reviewer: TEST_GROUP lead.
2. ⏳ Raise CR — cập nhật `.agents/agent-test-e2e.md` theo §B (3 Forbidden Action + 1 section mới). Reviewer: TEST_GROUP lead.
3. ⏳ Nếu W01 còn cycle test → bổ sung 8 TC ở §C qua re-spawn agent-test-* tương ứng.
4. ⏳ Update `.claude/skills/rules-test-ui/SKILL.md` + `.claude/skills/rules-test-e2e/SKILL.md` theo CR (skill là nơi enforce rule chính thức).
5. ✅ Update `.agents/agent-test-api.md` v5 — đã áp 2 Forbidden Action + 2 section trong scope (Ground-Truth + State-Transition) — commit cùng artifact này.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-10 | 1 | agent-test-api | Initial proposal — đề xuất rule update cho agent-test-ui (5 forbidden + visual gate + state-conditional) + agent-test-e2e (3 forbidden + lifecycle gate) + 8 TC bổ sung. Cross-ref [QC-MANUAL-LEAK-ANALYSIS.md](../../test-reports/W01/QC-MANUAL-LEAK-ANALYSIS.md). |
