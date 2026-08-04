---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-DELETE.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-DELETE"
source_feat_sha: "8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f"
generated_at: "2026-07-31T07:05:00Z"
status: ACTIVE
version: 4
tier: T4
owner_authority: Delivery Authority                    # Architecture Authority co-sign §5 §6 §7
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán xóa 1 log tính giá thuộc kỳ mở + trạng thái terminal (Thành công/Hoàn thành có lỗi) → soft-delete + toast thành công; log thuộc kỳ đóng hoặc đang \"Đang tính\" → chặn với error code tương ứng."
consumes_contracts: []
paired_bff_feats: ["FEAT-PRC-DELETE"]
paired_fe_web_feats: ["FEAT-PRC-DELETE"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "not-computed — no shasum tool available in author session"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-DELETE.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-08-02"
---

# FEAT-PRC-DELETE (BE): Xóa khoản mục lịch sử tính giá

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DELETE` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán xóa 1 log tính giá thuộc kỳ mở + trạng thái terminal → soft-delete + toast thành công; log thuộc kỳ đóng hoặc đang "Đang tính" → chặn với error code tương ứng |
| Cross-tier pair | BFF: `features/bff/FEAT-PRC-DELETE.md` (**AUTHORED** — mutation `priceCalcRunDelete`, xem §6.4) \| Web: `features/fe-web/FEAT-PRC-DELETE.md` (**AUTHORED**) \| Mobile: N/A (PRC web-only) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-DELETE.md`](../../../../../Product/features/FEAT-PRC-DELETE.md) |
| Source version | v7 |
| Source SHA | `8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f` |
| Generated at | 2026-07-31T07:05:00Z |

## 1. Mục đích nghiệp vụ

Sau khi chạy tính giá xuất kho BQGQ (CREATE/RECALC), garage cần dọn dẹp lịch sử tính giá khi có log dư thừa hoặc tính nhầm, để danh sách log gọn gàng và dễ tra cứu. Thao tác xóa chỉ xóa bản ghi lịch sử (soft-delete) — hệ thống tuyệt đối không tự động đảo giá vốn đã điền vào phiếu xuất, tránh gây sai lệch dữ liệu kế toán ngoài ý muốn. Để bảo vệ tính toàn vẹn số liệu đã chốt, hệ thống chặn xóa khi kỳ kế toán liên quan đã đóng hoặc khi log đang trong trạng thái tính toán dở dang. Chủ garage và kế toán có quyền thao tác ngang nhau.

## 2. Trách nhiệm backend (gf-accounting)

- Cung cấp endpoint `DELETE /api/v2/price-calc-runs/{id}` thực hiện **soft-delete** trên bảng `price_calc_run` (set `deleted_at`/`deleted_by`) — KHÔNG xóa vật lý, giữ audit trail cho truy vấn lịch sử.
- Enforce 2 guard trước khi cho phép xóa: (a) kỳ kế toán liên quan (`price_calc_run.period_id`) phải đang **OPEN** — CLOSED → 409 `ERR-INV-024`; (b) `price_calc_run.status` phải ở trạng thái terminal (`SUCCEEDED` / `COMPLETED_WITH_ERRORS`) — `PENDING`/`RUNNING` → 409 `ERR-INV-029`.
- KHÔNG thực hiện rollback `cost_unit_price`/`cost_value` trên `delivery_line` đã ghi ở `gf-inventory` — xóa chỉ tác động entity `price_calc_run`/`price_calc_run_item` nội bộ `gf-accounting`, KHÔNG gọi REST sang `gf-inventory` (khác biệt rõ với CREATE/RECALC).
- Đảm bảo idempotent: repeat DELETE cùng `runId` sau khi đã soft-delete trả `200 {deleted:true}` với message cached thay vì lỗi.
- Enforce dual persona (garage-owner + accountant) quyền ngang nhau cho endpoint DELETE, theo `BR-AP-CMN-002`.
- Migration: `ddl-auto=update` (không Flyway). Cột soft-delete `deleted_at`/`deleted_by` trên `price_calc_run` đã tồn tại từ khi entity được tạo (FEAT-PRC-CREATE be-tier, W06-3) — feature này KHÔNG thêm cột mới.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Thực thi xóa (soft-delete)

#### AC-2 → Soft-delete `price_calc_run` + response thành công

- **Khi**: client gọi `DELETE /api/v2/price-calc-runs/{id}` với `id` hợp lệ, tenant-scoped, run tồn tại, kỳ OPEN, `status` terminal.
- **BE phải**: set `deleted_at = now()`, `deleted_by = actor` trên row `price_calc_run` (soft-delete); KHÔNG chạm `delivery_line.cost_unit_price`/`cost_value` (giữ nguyên, không gọi REST `gf-inventory`); KHÔNG cascade xóa `price_calc_run_item` con (giữ nguyên cho audit — chỉ filter `deleted_at IS NULL` ở query LIST/DETAIL của các endpoint khác).
- **Output**: HTTP 200 `{ runId, deleted: true, message }`.
- **Failure mode**: 404 nếu run không tồn tại hoặc không thuộc tenant hiện tại (no-leak).
- **Ref**: BR-PRC-011 (§9), entity `price_calc_run` (§5.1), endpoint `DELETE /api/v2/price-calc-runs/{id}` (§6.1).

### Cluster B — Guard chặn xóa

#### AC-4 → Chặn khi kỳ đã đóng

- **Khi**: client gọi DELETE cho run mà kỳ kế toán liên quan (qua `run.period_id`) có `status = CLOSED`.
- **BE phải**: query `accounting_period.status` trước khi thực hiện soft-delete, trong cùng transaction; nếu CLOSED → reject, KHÔNG mutate DB.
- **Output**: HTTP 409 `{ error: { code: "ERR-INV-024", message } }`.
- **Failure mode**: transaction rollback — không commit soft-delete nếu guard fail.
- **Ref**: BR-PRC-011 (§9), guard check trong `app/service` (§7).

#### AC-4b → Chặn khi log đang "Đang tính"

- **Khi**: client gọi DELETE cho run có `status ∈ {PENDING, RUNNING}` (job nền CREATE/RECALC chưa chạy xong).
- **BE phải**: kiểm tra `run.status` trước soft-delete, đọc trong cùng transaction với guard AC-4; `PENDING`/`RUNNING` → reject ngay cả khi kỳ đang OPEN.
- **Output**: HTTP 409 `{ error: { code: "ERR-INV-029", message } }`.
- **Ref**: BR-PRC-011 + BR-PRC-016 (§9).

### Cluster C — Phân quyền

#### AC-5 → Phân quyền ngang nhau

- **Khi**: request DELETE tới từ actor có role `garage-owner` hoặc `accountant`.
- **BE phải**: authorize cả 2 role như nhau — KHÔNG có role-based restriction bổ sung nào phân biệt giữa 2 persona cho endpoint DELETE.
- **Output**: hành vi/response giống nhau bất kể persona (miễn tenant hợp lệ).
- **Ref**: BR-AP-CMN-002 (§9).

### Cluster D — UI-only (N/A cho BE)

#### AC-1 → N/A (UI-only)

- Source AC này là hiển thị popup xác nhận "Xóa khoản mục lịch sử tính giá" trước khi gọi API. BE không touch — chỉ nhận request khi user đã confirm ở client. Xem tier fe-web `features/fe-web/FEAT-PRC-DELETE.md` (**AUTHORED**, xem Metadata `:57`) — popup xác nhận nằm trong luồng đó, gọi mutation `priceCalcRunDelete` khi user confirm.

#### AC-3 → N/A (UI-only)

- Nút "Hủy" (hoặc đóng ✕) chỉ đóng popup client-side, không gọi API. BE không touch.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-PRC-011** (CORNERSTONE — Delete Guard): xóa log tính giá KHÔNG rollback giá vốn đã cập nhật; chặn xóa nếu kỳ đã đóng (`ERR-INV-024`) hoặc log đang "Đang tính" (`ERR-INV-029`) — enforce tại `app/service` (`PriceCalcRunService.delete()`), guard chạy TRƯỚC `UPDATE deleted_at`. Vi phạm → HTTP 409.
- **BR-PRC-016** (CORNERSTONE — Concurrency/System, phần "chặn chạy trùng" áp dụng cho DELETE qua guard status): log đang "Đang tính" (job nền chưa xong) → chặn xóa cho tới khi job tự chốt về trạng thái terminal — cùng enforcement point với guard (b) của BR-PRC-011.
- **BR-AP-CMN-002** (NORMAL — Permission): chủ garage + kế toán quyền ngang nhau trên toàn bộ chức năng PRC (bao gồm xóa log) — enforce ở authorization layer, không phân biệt 2 role cho DELETE.

### 4.2 Tenant + auth

- Mọi request propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4).
- Endpoint yêu cầu authenticated user với role `garage-owner` hoặc `accountant` (dual persona) — không role nào khác được phép.

### 4.3 Idempotency + concurrency

- Repeat `DELETE` cùng `runId` sau khi đã soft-delete → trả `200 {deleted: true}` với message cached (không phải 404) — tránh lỗi giả khi client double-click.
- Guard check (period status + run status) phải đọc trong cùng transaction với `UPDATE` soft-delete để tránh race condition (ví dụ RECALC vừa kick-off song song với DELETE) — dùng `SELECT ... FOR UPDATE` trên row `price_calc_run` (đồng nhất pattern concurrency guard đã dùng cho CREATE/RECALC per ADR-027).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-024` | 409 | AC-4 | INLINE popup "Không thể xóa" |
| `ERR-INV-029` | 409 | AC-4b | INLINE popup "Không thể xóa" |
| — (not found) | 404 | AC-2 (implicit) | TOAST |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-accounting`

**Không có cột mới**. Feature này tái sử dụng entity `price_calc_run` đã thiết lập bởi `FEAT-PRC-CREATE` be-tier (W06-3) — cụ thể các cột soft-delete `deleted_at` (TIMESTAMP, nullable) và `deleted_by` (VARCHAR, nullable) đã tồn tại sẵn cho mục đích DELETE. Bảng `price_calc_run_item` không bị chạm — giữ nguyên khi run cha bị soft-delete (audit).

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `price_calc_run` | `deleted_at` | `TIMESTAMP` | Y | `NULL` | `ddl-auto=update` (đã tồn tại từ FEAT-PRC-CREATE) | `BR-PRC-011` | AC-2 | Set khi soft-delete thành công |
| `price_calc_run` | `deleted_by` | `VARCHAR` | Y | `NULL` | `ddl-auto=update` (đã tồn tại từ FEAT-PRC-CREATE) | `BR-PRC-011` | AC-2 | Actor thực hiện xóa |

> **Boundary migration policy**: `gf-accounting` dùng `ddl-auto=update` (Common Gotcha #5) — KHÔNG viết migration file.

### 5.2 Index / constraint changes

Không có index mới cho feature này. Guard AC-4/AC-4b tái sử dụng index hiện có: `idx_prc_run_tenant_period (tenant_id, period_id, status)` (đọc `period.status` + `run.status`) đã được tạo bởi `FEAT-PRC-CREATE` be-tier.

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| DELETE | `/api/v2/price-calc-runs/{id}` | authenticated (dual persona) | — (không body) | `{ runId, deleted, message }` | idempotent — repeat trả 200 `{deleted:true}` cached | AC-2 | — |

> Contract verified verbatim tại `Architecture/api/gf-accounting-api.md` §5.5 (W06-5), v24. Bundle §G keyword-match trỏ nhầm sang §4.6 `FEAT-AP-DELETE` (accounting period) — đã fallback Read trực tiếp §5.5 để lấy đúng contract.

### 6.2 Modified REST endpoints (additive)

Không có — endpoint DELETE là mới hoàn toàn cho W06, không sửa endpoint có sẵn.

### 6.3 Kafka topics (publish/consume)

Không có — thao tác xóa log tính giá không publish event Kafka.

### 6.4 Cross-boundary REST consumers

Không có — endpoint DELETE này KHÔNG gọi REST sang `gf-inventory` (KHÔNG rollback `cost_unit_price`/`cost_value`), khác với CREATE/RECALC (W06-3/W06-4) vốn gọi `bulk-fill-cost` + `bulk-recompute-ledger`.

> **Hand-off tới BFF**: `paired_bff_feats=["FEAT-PRC-DELETE"]` — tier file BFF riêng cho `FEAT-PRC-DELETE` đã được author (mutation `priceCalcRunDelete`, xem `features/bff/FEAT-PRC-DELETE.md`) — KHÔNG describe GraphQL ở đây. *(Cập nhật 2026-07-31: reconciliation pass sau khi toàn bộ 25 tier author hoàn tất — ghi chú gốc "chưa tạo tier file BFF riêng" viết tại thời điểm spawn, trước khi Batch C hoàn thành song song.)*

## 7. File/module impact map (BE — Hexagonal)

> **Package convention (chốt cho W06 — `CR-20260801-06` APPROVED 2026-08-02)**: theo hiện trạng repo `gf-accounting` + precedent `gf-sales`, KHÔNG theo `rules-backend` §1 canonical. JPA entity/repository/mapper → `infrastructure/persistence/{entity,jpa,repository,mapper}/` (repo **không có** `adapter/persistence`; `adapter/` chỉ gồm `{client, config, controller}`). Temporal workflow/activity → top-level `com/actechx/gf/workflow/` + `workflow/impl/` + `workflow/activity/`.

> Path glob ⊆ `services/gf-accounting/**`. Cross-boundary touch chỉ qua §6 (REST) — không có cho feature này.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `app/service` | `src/main/java/.../app/service/PriceCalcRunService.java` | MODIFY | add `delete(id, actor)` method + guards | ~40 | AC-2, AC-4, AC-4b |
| `domain/model` | `src/main/java/.../domain/model/PriceCalcRun.java` | REUSE | không đổi — soft-delete field đã có | 0 | — |
| `adapter/controller` | `src/main/java/.../adapter/controller/PriceCalcRunController.java` | MODIFY | add `@DeleteMapping` | ~20 | AC-2 |
| `infrastructure/persistence` | `src/main/java/com/actechx/gf/infrastructure/persistence/jpa/PriceCalcRunJpaRepository.java` | REUSE | tái dùng `findByIdAndTenantId` hiện có | 0 | — |
| `test/unit` | `src/test/java/.../app/service/PriceCalcRunServiceTest.java` | ADDITIVE | test `delete()` guard cases | ~80 | AC-2, AC-4, AC-4b, AC-5 |
| `test/contract` | `src/test/java/.../adapter/controller/PriceCalcRunControllerContractTest.java` | ADDITIVE | contract test DELETE endpoint | ~50 | AC-2, AC-4, AC-4b |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema (skip — reuse existing entity)
    Entry: entity price_calc_run stable (established FEAT-PRC-CREATE, có sẵn deleted_at/deleted_by)
    Exit: N/A — không có migration mới
    └─► S2

S2  Service logic (BR enforcement primary)
    Entry: S1
    Exit: unit test ≥6 green (2 guard case + happy path + idempotent replay + RBAC)
    └─► S3

S3  REST adapter (controller)
    Entry: S2
    Exit: contract test green
    └─► S4

S4  Integration test
    Entry: S3
    Exit: integ test green (soft-delete verified không rollback gf-inventory)
    └─► (hand-off BFF tier khi được fan-out)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Không có migration | — | Entity stable từ FEAT-PRC-CREATE | N/A | — |
| S2 | `delete()` service logic + guards | app | S1 | Unit test ≥6 green | S1 |
| S3 | REST adapter (`DELETE` mapping) | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-PRC-011` | CORNERSTONE | domain (primary) via `app/service` guard | `app/service/PriceCalcRunService.java::delete()` | AC-2, AC-4, AC-4b | `TC-BR-gf-accounting-PRC-011-*` |
| `BR-PRC-016` | CORNERSTONE | service (concurrency guard, status check) | `app/service/PriceCalcRunService.java::delete()` | AC-4b | `TC-BR-gf-accounting-PRC-016-*` |
| `BR-AP-CMN-002` | NORMAL | authorization (security config / controller) | `adapter/controller/PriceCalcRunController.java` | AC-5 | `TC-BR-gf-accounting-AP-CMN-002-*` |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | Unit (soft-delete logic) + API contract | test-api | Verify `deleted_at`/`deleted_by` set, `cost_unit_price` phiếu xuất KHÔNG đổi |
| AC-2 (idempotent replay) | API contract | test-api | Repeat DELETE cùng runId → 200 cached |
| AC-4 | Unit (guard) + API contract (negative 409) | test-api | Period CLOSED case → `ERR-INV-024` |
| AC-4b | Unit (guard) + API contract (negative 409) | test-api | Run `status ∈ {PENDING,RUNNING}` case → `ERR-INV-029` |
| AC-5 | Isolation (RBAC) | test-isolation | Dual persona equal access — cả 2 role đều xóa được |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-DELETE.md` | ACTIVE candidate (DRAFT) | Tier file riêng đã được author (mutation `priceCalcRunDelete`), `paired_backend_feats=["FEAT-PRC-DELETE"]` set phía BFF cho reciprocity (item #16) |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-DELETE.md` | ACTIVE candidate (DRAFT) | Popup xác nhận/chặn (AC-1/AC-3/AC-4/AC-4b UI) có tier file riêng, dialog reuse `share/dialogs/alert-confirm` |
| Mobile | `Execution/wave-specs/W06/Product/features/mobile/FEAT-PRC-DELETE.md` | N/A | PRC là web-only (per PKG §Overview — mobile W06 chỉ `FEAT-STK-LIST-V2`) |

**Source ID consistency** (item 18): tất cả tier file (nếu có) phải cùng `source_feat_sha = 8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f`.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-DELETE.md`](../../../../../Product/features/FEAT-PRC-DELETE.md) v7
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.2 (BR-PRC-011/016), §2.3 (BR-AP-CMN-002)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md)
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §5.5 (v24)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md)
- **ADR**: ADR-027 (BQGQ engine), ADR-028 (PRC async execution — không liên quan trực tiếp tới DELETE vì DELETE là sync)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v17
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: `_routing/FEAT-FAN-OUT-MAP.yaml` (fanout_map_sha `750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a`)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-02 | 4 | main-agent (post final-review fix, approver sonhoang) | **Fix residue thứ 6 (cùng loại CR-20260801-10, phát hiện muộn qua review độc lập).** §3 Cluster D AC-1 — câu "Xem tier fe-web (chưa fan-out riêng cho `FEAT-PRC-DELETE` W06...)" mâu thuẫn với chính Metadata `:57` (`features/fe-web/FEAT-PRC-DELETE.md` đã **AUTHORED**) → sửa lại cite đúng file + mutation `priceCalcRunDelete`. **KHÔNG đụng**: AC, guard logic. 3 → 4. |
| 2026-08-02 | 3 | main-agent (CR batch W06, approver sonhoang) | **Apply 2 CR APPROVED — `CR-20260801-06` + `CR-20260801-10`.** (1) `CR-20260801-06`: §7 File/module impact map — `adapter/persistence/PriceCalcRunJpaRepository.java` → `infrastructure/persistence/jpa/…`; thêm blockquote ghi chú package convention chốt cho W06 (theo hiện trạng repo `gf-accounting` + precedent `gf-sales`, KHÔNG theo `rules-backend` §1 canonical). (2) `CR-20260801-10`: Metadata row `Cross-tier pair` — "BFF: N/A (chưa fan-out riêng cho W06) | Web: N/A" là sai, align về đúng hiện trạng đã ghi tại §6.4 (`features/bff/FEAT-PRC-DELETE.md` + `features/fe-web/FEAT-PRC-DELETE.md` đều **AUTHORED**). **KHÔNG đụng**: AC, guard logic, §6 endpoint contract, §8 DAG. 2 → 3. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-PRC-DELETE` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 BE behaviour map cho 6 AC-ID (AC-2/4/4b/5 BE-owned, AC-1/3 N/A UI-only), §4 ràng buộc BR-PRC-011/016 + BR-AP-CMN-002 + error code, §5-§11 BE-specific (reuse entity từ FEAT-PRC-CREATE, endpoint `DELETE /api/v2/price-calc-runs/{id}` verified verbatim §5.5 v24 sau khi bundle §G keyword-match nhầm sang FEAT-AP-DELETE). Source FEAT chỉ audit. |
