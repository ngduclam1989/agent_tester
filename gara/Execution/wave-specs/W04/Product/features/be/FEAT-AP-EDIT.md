---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-AP-EDIT.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-EDIT"
source_feat_sha: "17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416"
generated_at: "2026-07-08T05:30:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting", "gf-inventory"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán đổi Trạng thái kỳ 'Tháng 6/2026' từ 'Chưa đóng' sang 'Đã đóng' và bấm Lưu → BE cập nhật status=CLOSED + updated_by/updated_at, trả 200 {id, code, status, updatedAt, updatedBy}; sau đó gf-inventory gọi lock-check cho ngày trong kỳ nhận locked=true."
consumes_contracts: []
paired_bff_feats: []
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "not-provided-this-spawn — orchestrator context bundle không inject giá trị này; backfill khi regen"
  template_sha: "not-provided-this-spawn — orchestrator context bundle không inject giá trị này; backfill khi regen"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-EDIT.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-EDIT (BE): Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ) — backend gf-accounting

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

> **⚠️ Migration cascade note (2026-07-08)**: Entity `accounting_period` được tạo qua **Flyway `V{N+1}__accounting_v1_accounting_period.sql`** bởi `FEAT-AP-CREATE` v2 per **ADR-019 v5 Decision B**. Reference `ddl-auto=update` trong file này là **STALE từ v1 auto-gen** (regen `/gen-execution-spec --force` pending sau khi GAP-01 CHARTER cascade). Dùng `FEAT-AP-CREATE` §5.1 v2 làm canonical cho migration strategy. Feature này KHÔNG tạo migration schema mới.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-EDIT` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting`, `gf-inventory` (consumer cross-boundary lock-check, ADR-021) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Kế toán đổi Trạng thái kỳ sang "Đã đóng" và Lưu → BE cập nhật `status=CLOSED` + audit → downstream `gf-inventory` lock-check trả `locked=true` |
| Cross-tier pair | BFF: (chưa xác định — `paired_bff_feats=[]`) \| Web: (chưa xác định) \| Mobile: (chưa xác định) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-EDIT.md`](../../../../../Product/features/FEAT-AP-EDIT.md) |
| Source version | v7 |
| Source SHA | `17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416` |
| Generated at | 2026-07-08T05:30:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần chỉnh sửa nhãn hiển thị của một kỳ kế toán (tên, mô tả, thứ tự) và kiểm soát thời điểm chốt sổ bằng cách đóng/mở kỳ. Đóng kỳ khóa thao tác phiếu nhập/xuất và tính giá trong kỳ đó nhưng không phải hành động vĩnh viễn — có thể mở lại bất kỳ lúc nào. Feature này là điểm điều khiển trung tâm cho vòng đời kỳ kế toán, đứng giữa lập cây kỳ (`FEAT-AP-CREATE`) và các nghiệp vụ bị khóa theo kỳ (nhập/xuất kho, tính giá xuất kho BQGQ).

## 2. Trách nhiệm backend (gf-accounting)

- **Cập nhật entity `accounting_period`** (đã tạo bởi `FEAT-AP-CREATE` cùng wave): chỉ cho phép ghi 4 trường `name` / `description` / `displayOrder` / `status`; các trường cấu trúc (`type`, `parentId`, `startDate`, `endDate`, `autoGenerateChildren`) tuyệt đối immutable sau khi tạo.
- **Expose endpoint mới** `PUT /api/v2/accounting-periods/{id}` (V4-AP-5) — sửa kỳ + đổi trạng thái đóng/mở qua cùng một field `status` (không có endpoint đóng/mở riêng, per BR-AP-010).
- **Expose endpoint cross-boundary advisory** `GET /protected/v1/accounting-periods/lock-check?date={ISO}` (V4-AP-LC) — hệ quả trực tiếp của khả năng đóng/mở kỳ mà feature này cung cấp; `gf-inventory` gọi endpoint này để verify ngày chứng từ có thuộc kỳ CLOSED không (ADR-021).
- **Enforce BR SSOT**: field mutability (BR-AP-016), đóng/mở không ràng buộc thứ tự cha-con (BR-AP-010/011), audit `updated_by`/`updated_at` mỗi lần transition (BR-AP-CMN-001 — v13 R3 strip: KHÔNG có `closed_at`/`reopened_at` riêng, status change tracked qua audit pair chuẩn), phân quyền ngang nhau `garage-owner`/`accountant` (BR-AP-CMN-002).
- **Tenant isolation**: mọi thao tác scoped theo `tenant_id` qua `TenantFilter`/`TenantContext`; feature-flag `@FeatureOn("Inventory:InventoryV2")` class-level (đã áp dụng từ `FEAT-AP-CREATE`, verify áp dụng đúng trên 2 endpoint mới).
- **Persistence**: `ddl-auto=update` (KHÔNG Flyway, boundary `gf-accounting`) — feature này KHÔNG cần schema mới, tái dùng bảng `accounting_period` đã sinh bởi `FEAT-AP-CREATE`.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Mở form sửa (tải dữ liệu)

#### AC-1 → N/A (UI-only, dữ liệu pre-fill lấy từ endpoint GET detail có sẵn)

- Source AC-1 mô tả FE mở form "Sửa Kỳ kế toán" với các trường pre-filled. BE không có logic mới — FE gọi endpoint `GET /api/v2/accounting-periods/{id}` (V4-AP-3, thuộc `FEAT-AP-DETAIL`, đã tồn tại) để lấy dữ liệu hiện tại. Xem `fe-web/FEAT-AP-EDIT.md §3 AC-1`.

### Cluster B — Cập nhật trường + khóa cấu trúc

#### AC-2 → BE validate + persist 4 trường mutable, `name` bắt buộc

- **Khi**: client gửi `PUT /api/v2/accounting-periods/{id}` body `{name, description, displayOrder, status}`.
- **BE phải**: validate `name` non-null non-blank (≤255 chars); `description` optional (≤500 chars); `displayOrder` integer; `status` một trong `OPEN|CLOSED`. `name` rỗng → reject.
- **Output**: 400 nếu `name` rỗng; ngược lại proceed sang persist (AC-6).
- **Failure mode**: 400 `ERR-CMN-validation` — message "Tên kỳ kế toán là bắt buộc".
- **Ref**: BR-AP-016 (§9), entity `accounting_period` (§5.1), endpoint `PUT /api/v2/accounting-periods/{id}` (§6.1).

#### AC-3 → BE reject request chứa trường cấu trúc bất biến

- **Khi**: request body chứa bất kỳ field nào trong `{type, parentId, startDate, endDate, autoGenerateChildren}` (kể cả khi giá trị giống hiện tại — payload có mặt field là đủ để reject, theo rationale R2 F1 tại API doc §4.5).
- **BE phải**: reject toàn bộ request với `400 ERR-AP-001` trước khi chạm tới persist; KHÔNG áp dụng phân biệt "có kỳ con phụ thuộc hay không" (BR-AP-016 khóa các trường này **vô điều kiện**, không phải điều kiện theo children — xem NEED CONFIRMATION dưới §4.4).
- **Output**: 400 `ERR-AP-001` — body liệt kê field nào bị reject.
- **Failure mode**: reject toàn bộ, không partial update.
- **Ref**: BR-AP-016 (§9), endpoint `PUT /api/v2/accounting-periods/{id}` (§6.1).

### Cluster C — Đóng / mở kỳ (state transition)

#### AC-4 → BE transition `OPEN → CLOSED` (audit qua `updated_at/by`)

- **Khi**: request có `status: "CLOSED"` trên kỳ đang `OPEN`.
- **BE phải**: cập nhật `status=CLOSED`, bump `updated_at=now()` + `updated_by` (audit v13 R3 — KHÔNG có cột `closed_at` riêng, transition được track qua audit pair chuẩn). KHÔNG chặn dựa trên tình trạng tính giá của kỳ — cho phép đóng kỳ **kể cả khi còn phiếu xuất chưa tính giá** (giá vốn=0, theo BR-PRC-008 phạm vi `FEAT-PRC-CREATE`/`RECALC`, không phải guard của endpoint này). Đóng kỳ **không ràng buộc thứ tự** với kỳ cha/con (BR-AP-011) — KHÔNG thêm validation hierarchy nào ở bước này.
- **Output**: 200 với `status=CLOSED`, `updatedAt`, `updatedBy`.
- **Failure mode**: — (không có guard chặn ở BE cho action đóng kỳ; hệ quả khóa phiếu nhập/xuất + tính giá được enforce ở boundary khác qua lock-check, xem §6.4).
- **Ref**: BR-AP-012 (§9), BR-PRC-008 (tham chiếu, ngoài scope FEAT này), endpoint `PUT /api/v2/accounting-periods/{id}` (§6.1), lock-check `GET /protected/v1/accounting-periods/lock-check` (§6.1).

#### AC-5 → BE transition `CLOSED → OPEN` (audit qua `updated_at/by`), không ràng buộc thứ tự

- **Khi**: request có `status: "OPEN"` trên kỳ đang `CLOSED`.
- **BE phải**: cập nhật `status=OPEN`, bump `updated_at=now()` + `updated_by` (audit v13 R3 — KHÔNG có cột `reopened_at` riêng). **KHÔNG** kiểm tra trạng thái kỳ cha/kỳ con (BR-AP-011 — user tự thao tác trên từng kỳ, không bắt buộc thứ tự mở). **KHÔNG** tự động trigger RECALC giá — người dùng tự chạy `FEAT-PRC-RECALC` sau đó (ngoài scope endpoint này).
- **Output**: 200 với `status=OPEN`, `updatedAt`, `updatedBy`.
- **Failure mode**: — (không guard).
- **Ref**: BR-AP-011 (§9), endpoint `PUT /api/v2/accounting-periods/{id}` (§6.1).

### Cluster D — Lưu / Huỷ bỏ

#### AC-6 → BE persist transactional + trả response + audit

- **Khi**: dữ liệu hợp lệ qua AC-2/AC-3.
- **BE phải**: persist trong 1 transaction (`@Transactional`) — cập nhật `name`/`description`/`display_order`/`status` + bump `updated_by`/`updated_at` (audit v13 R3 — KHÔNG ghi `closed_at`/`reopened_at` vì cột đã strip).
- **Output**: `200 {data: {id, code, name, status, updatedAt, updatedBy}, code: "ACCOUNTING_PERIOD_UPDATED"}`.
- **Failure mode**: 404 `ERR-CMN-not-found` nếu `id` không tồn tại / sai tenant.
- **Ref**: BR-AP-CMN-001 (§9), endpoint `PUT /api/v2/accounting-periods/{id}` (§6.1), entity `accounting_period` (§5.1).

#### AC-7 → N/A (UI-only — Huỷ bỏ là hành động client-side, không gọi BE)

- Source AC-7 mô tả nút "Huỷ bỏ" đóng form không lưu. Không có request BE nào phát sinh. Xem `fe-web/FEAT-AP-EDIT.md §3 AC-7`.

### Cluster E — Phân quyền

#### AC-8 → BE cho phép `garage-owner` và `accountant` sửa với quyền ngang nhau

- **Khi**: bất kỳ request nào tới `PUT .../accounting-periods/{id}`.
- **BE phải**: xác thực JWT hợp lệ với role thuộc `{garage-owner, accountant}` (Critical Rule #6 dual persona) — **không** phân biệt quyền giữa 2 role trên endpoint này (BR-AP-CMN-002).
- **Output**: pass-through nếu role hợp lệ.
- **Failure mode**: 403 nếu role ngoài 2 persona hoặc thiếu token.
- **Ref**: BR-AP-CMN-002 (§9), endpoint `PUT /api/v2/accounting-periods/{id}` (§6.1).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-AP-016** (CORNERSTONE): Chỉnh sửa kỳ chỉ cho sửa `name`/`description`/`displayOrder`/`status`; các trường `type`/`parentId`(Thuộc kỳ)/`startDate`/`endDate`/`autoGenerateChildren` (+ "Năm" của kỳ Năm, đồng bộ semantic với "Thuộc kỳ") **khóa vô điều kiện** sau khi tạo. Enforce tại `AccountingPeriodService.validateEditableFields()`. Vi phạm → `400 ERR-AP-001`.
- **BR-AP-010** (NORMAL): Đóng/mở kỳ là field `status` sửa qua endpoint này — KHÔNG có endpoint đóng/mở riêng biệt. Enforce bằng thiết kế contract (route duy nhất).
- **BR-AP-011** (NORMAL): Đóng/mở không ràng buộc thứ tự cha-con; cho phép mở lại kỳ đã đóng bất kỳ lúc nào. Enforce bằng **việc cố tình KHÔNG thêm** hierarchy guard tại `AccountingPeriodService.updatePeriod()`.
- **BR-AP-012** (CORNERSTONE — hệ quả, không phải guard tại endpoint này): Kỳ `CLOSED` chặn thêm/sửa/xóa phiếu nhập/xuất + chặn tính giá (CREATE/RECALC) trong kỳ. Enforcement chi tiết thuộc `EP-INVENTORY-RECEIPT-V2`/`EP-INVENTORY-DELIVERY-V2` (boundary `gf-inventory`) + `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC` (boundary `gf-accounting`, FEAT khác). Feature này chỉ chịu trách nhiệm ghi đúng `status` + audit `updated_at/by` để các consumer đó verify qua lock-check (§6.1/§6.4).
- **BR-AP-CMN-001** (NORMAL): Audit `created_at/by`, `updated_at/by` hiển thị đầy đủ; mỗi lần sửa cập nhật `updated_by`/`updated_at`.
- **BR-AP-CMN-002** (NORMAL): `garage-owner` và `accountant` quyền ngang nhau trên toàn bộ danh mục kỳ kế toán.
- **ADR-021** (contract, không phải BR): endpoint lock-check `GET .../lock-check?date={ISO}` trả `{locked, periodId, periodCode, status, periodType, startDate, endDate}` — advisory cho preview, authoritative commit-guard cho consumer boundary.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- `PUT .../accounting-periods/{id}`: yêu cầu JWT role thuộc `{garage-owner, accountant}` — quyền ngang nhau, không phân biệt (AC-8, BR-AP-CMN-002).
- `GET .../lock-check`: auth `x-api-key` S2S (cross-boundary, không phải JWT user) — chỉ dành cho service-to-service call từ `gf-inventory`.
- Class-level `@FeatureOn("Inventory:InventoryV2")` trên `AccountingPeriodController` (đã có từ `FEAT-AP-CREATE`).

### 4.3 Idempotency + concurrency

- `PUT .../accounting-periods/{id}` là idempotent by nature (PUT semantics) — không cần client idempotency-key.
- Không có optimistic locking field (`@Version`) trên `accounting_period` theo KG hiện tại — concurrent edit là last-write-wins (không có invariant nào trong BR-AP-* yêu cầu concurrency guard cho EDIT).
- `GET .../lock-check` là safe/idempotent (read-only), retry an toàn theo ADR-021.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-2 | INLINE (field `name`) |
| `ERR-AP-001` | 400 | AC-3 | TOAST |
| `ERR-CMN-not-found` | 404 | AC-6 | EMPTY_STATE |
| `403` (role check) | 403 | AC-8 | TOAST |

---

## 5. Schema delta (BE — contract focus)

> `gf-accounting` dùng `ddl-auto=update` (KHÔNG Flyway). **Không có schema mới** cho `FEAT-AP-EDIT` — feature này tái dùng bảng `accounting_period` đã được `FEAT-AP-CREATE` (cùng wave W04) sinh entity JPA. Bảng dưới đây chỉ liệt kê các cột **bị chạm** bởi luồng EDIT (không phải toàn bộ entity).

### 5.1 Entity columns touched — `gf-accounting.accounting_period`

| Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|
| `name` | `VARCHAR(255)` | N | — | ddl-auto=update (đã tồn tại từ CREATE) | BR-AP-016 | AC-2, AC-6 | Required khi edit |
| `description` | `VARCHAR(500)` | Y | `NULL` | ddl-auto=update | BR-AP-016 | AC-2, AC-6 | Optional |
| `display_order` | `INTEGER` | N | `0` | ddl-auto=update | BR-AP-016 | AC-2, AC-6 | — |
| `status` | `VARCHAR(16)` | N | `'OPEN'` | ddl-auto=update | BR-AP-010, BR-AP-011, BR-AP-012 | AC-4, AC-5, AC-6 | Enum `OPEN\|CLOSED` |
| `updated_by` | `VARCHAR(255)` | N | — | ddl-auto=update | BR-AP-CMN-001 | AC-4, AC-5, AC-6 | Audit (bump mỗi transition — track status change per v13 R3) |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | N | `NOW()` | ddl-auto=update | BR-AP-CMN-001 | AC-4, AC-5, AC-6 | Audit (bump mỗi transition — v13 R3 strip: KHÔNG có `closed_at`/`reopened_at` riêng) |

> **Trường KHÔNG được chạm bởi luồng EDIT** (immutable per BR-AP-016 — reject nếu có mặt trong request): `type`, `parent_id`, `start_date`, `end_date`, `auto_generate_children`. Các cột này đã tồn tại từ `FEAT-AP-CREATE`.

### 5.2 Index / constraint changes

- **N/A** — không có index/constraint mới. Index `idx_ap_tenant_status(tenant_id, status)` (đã tạo bởi `FEAT-AP-CREATE` theo ADR-019 Decision B) đã đủ phục vụ truy vấn `status` sau khi EDIT + phục vụ lock-check query (§6.1).

---

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref |
|---|---|---|---|---|---|---|
| PUT | `/api/v2/accounting-periods/{id}` (V4-AP-5) | JWT `{garage-owner, accountant}` | `{name, description, displayOrder, status}` | `{data: {id, code, name, status, updatedAt, updatedBy}, code: "ACCOUNTING_PERIOD_UPDATED"}` | idempotent (PUT semantics) | AC-2..AC-6, AC-8 |
| GET | `/protected/v1/accounting-periods/lock-check?date={YYYY-MM-DD}&tenantId={id}` (V4-AP-LC) | `x-api-key` (S2S) + `X-Tenant-Id` | — path/query `date` + `tenantId` | `{locked: bool, periodId: Long\|null, periodCode: string, periodName: string, periodType: "YEAR"\|"QUARTER"\|"MONTH", status: "OPEN"\|"CLOSED", startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD"}` (7-field per ADR-019 §Decision C) | safe (read), cacheable | AC-4, AC-5 (hệ quả) |

**Immutable-field reject — request payload chi tiết** (AC-3):
```jsonc
{
  "name": "Tháng 6/2026 — đã chốt",
  "description": "Đã chốt số liệu kho",
  "displayOrder": 6,
  "status": "CLOSED",
  "startDate": "2026-06-01"   // ← present → 400 ERR-AP-001, toàn bộ request bị reject
}
```

### 6.2 Modified REST endpoints (additive)

- **N/A** — không có endpoint hiện hữu nào bị thay đổi. `GET .../accounting-periods/{id}` (V4-AP-3, `FEAT-AP-DETAIL`) không đổi contract.

### 6.3 Kafka topics (publish/consume)

| Topic | Direction | Schema | When | AC ref |
|---|---|---|---|---|
| `garage.gf-accounting.accounting-period-closed` | publish | `AccountingPeriodClosedV1` | **PROPOSED** — khi `status: OPEN→CLOSED` | AC-4 |
| `garage.gf-accounting.accounting-period-reopened` | publish | `AccountingPeriodReopenedV1` | **PROPOSED** — khi `status: CLOSED→OPEN` | AC-5 |

> W04 chỉ giữ **PROPOSED** (không publish, không outbox row) — theo API doc §4.5 note: "downstream consumers chưa exist nên không có notification cascade". Flip sang ACTIVE là future wave (ADR-019 Decision C). BE **KHÔNG** implement outbox writer cho 2 topic này trong W04.

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /protected/v1/accounting-periods/lock-check?date=` | `gf-inventory` (RECEIPT-V2 / DELIVERY-V2 / OB verify-import / OB import / OB edit / OB delete-lines) | Advisory pre-flight (fail-OPEN + banner) VÀ authoritative commit-guard (fail-CLOSED) — cả 2 timing (ADR-021) | Timeout/5xx → caller fail-CLOSED cho commit-path, fail-OPEN+marker cho preview-path | Caller-side: Spring Retry 3 lần exponential backoff (100/200/400ms), circuit breaker 50% failure/60s window (ADR-021) |
| `PUT /api/v2/accounting-periods/{id}` (status transition) | (không có consumer REST trực tiếp) — hệ quả gián tiếp qua lock-check ở trên | — | — | — |

> **Hand-off tới BFF**: nếu wave sau xác nhận `has_bff_touchpoint=true` cho `FEAT-AP-EDIT`, BFF FEAT sẽ wrap endpoint `PUT /api/v2/accounting-periods/{id}` (V4-AP-5) thành GraphQL mutation `updateAccountingPeriod` (V4-AP-M2 per PKG §2.2.3). W04 batch này chưa xác định paired BFF FEAT (`paired_bff_feats=[]` theo Context Bundle) — KHÔNG describe GraphQL ở đây.

---

## 7. File/module impact map (BE — Hexagonal)

> Tất cả path ⊆ `services/gf-accounting/**`. KHÔNG cross-boundary file path (Critical Rule #1). Nhiều file đã tồn tại từ `FEAT-AP-CREATE` (cùng wave) — chỉ mở rộng.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/model/AccountingPeriod.java` | MODIFY | thêm domain method `applyEdit()`, `close()`, `reopen()` | ~30 | AC-2, AC-3, AC-4, AC-5 |
| `domain/repository` | `services/gf-accounting/src/main/java/.../domain/repository/AccountingPeriodRepository.java` | ADDITIVE | thêm finder `findPeriodCoveringDate(tenantId, date)` cho lock-check | ~10 | AC-4, AC-5 |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/AccountingPeriodService.java` | MODIFY | mở rộng `updatePeriod()` (validate mutable/immutable field) + `checkLock(date)` | ~90 | AC-2..AC-6 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/AccountingPeriodEditRequest.java` | NEW | DTO body PUT (`name`, `description`, `displayOrder`, `status`) | ~30 | AC-2, AC-3 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/LockCheckResponse.java` | NEW | DTO response lock-check | ~20 | AC-4, AC-5 |
| `adapter/controller` | `services/gf-accounting/src/main/java/.../adapter/controller/AccountingPeriodController.java` | MODIFY | thêm `@PutMapping({id})` + `@GetMapping(lock-check)` | ~50 | AC-2..AC-6 |
| `adapter/persistence` | `services/gf-accounting/src/main/java/.../adapter/persistence/AccountingPeriodJpaRepository.java` | ADDITIVE | query method `findByTenantIdAndStatusAndDateRange(...)` | ~10 | AC-4, AC-5 |
| `db/migration` | — | N/A | `ddl-auto=update` — không có Flyway file | 0 | — |
| `test/unit` | `services/gf-accounting/src/test/java/.../app/service/AccountingPeriodServiceTest.java` | ADDITIVE | test method edit/close/reopen/immutable-reject/lock-check | ~180 | AC-2..AC-8 |
| `test/contract` | `services/gf-accounting/src/test/java/.../adapter/controller/AccountingPeriodEditContractTest.java` | NEW | contract test PUT + GET lock-check | ~100 | AC-2..AC-6, AC-8 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Xác nhận schema tồn tại (không migration mới)
    Entry: FEAT-AP-CREATE entity `accounting_period` đã deploy local
    Exit: verify 8 cột touched (§5.1) đã có sẵn qua ddl-auto=update
    └─► S2

S2  Repository + Service logic (BR enforcement primary)
    Entry: S1
    Action: AccountingPeriodRepository.findPeriodCoveringDate(); AccountingPeriodService.updatePeriod() (validate mutable/immutable BR-AP-016) + checkLock(date)
    Exit: unit test AccountingPeriodServiceTest ≥10 green (edit happy path, immutable reject, close, reopen, name required, lock-check found/not-found)
    └─► S3

S3  REST adapter (controller)
    Entry: S2
    Action: AccountingPeriodController thêm PUT {id} + GET lock-check; AccountingPeriodEditRequest DTO validate
    Exit: contract test AccountingPeriodEditContractTest ≥8 green (200/400 ERR-AP-001/400 ERR-CMN-validation/404 ERR-CMN-not-found/403)
    └─► S4

S4  Integration test (cross-boundary REST)
    Entry: S3 + gf-inventory lock-check caller stub sẵn sàng
    Action: test end-to-end đóng kỳ → gọi lock-check từ giả lập gf-inventory client → verify locked=true; mở lại kỳ → verify locked=false
    Exit: integ test green
    └─► (hand-off BFF tier S5 — khi paired_bff_feats xác định)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify schema tồn tại (no migration) | domain/model | FEAT-AP-CREATE deployed | 8 cột touched xác nhận | — |
| S2 | Repository + service logic | domain + app | S1 | Unit test ≥10 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test ≥8 green | S2 |
| S4 | Integration test | test/integration | S3 + gf-inventory stub | Integ test green | S3 |

---

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-AP-016` | CORNERSTONE | domain (primary) + validation (secondary) | `AccountingPeriodService.validateEditableFields()` | AC-2, AC-3 | `TC-BR-AP-016-*` |
| `BR-AP-010` | NORMAL | contract design (single route) | `AccountingPeriodController` (chỉ 1 route PUT) | AC-4, AC-5 | `TC-BR-AP-010-*` |
| `BR-AP-011` | NORMAL | service (absence of hierarchy guard) | `AccountingPeriodService.updatePeriod()` | AC-4, AC-5 | `TC-BR-AP-011-*` |
| `BR-AP-012` | CORNERSTONE (hệ quả — enforce ở consumer, không phải guard tại đây) | service (ghi đúng `status` + bump `updated_at/by`) + consumer boundary (`gf-inventory`, `FEAT-PRC-*`) | `AccountingPeriodService.close()` + lock-check contract (§6.1) | AC-4 | `TC-BR-AP-012-*` |
| `BR-AP-CMN-001` | NORMAL | service (audit stamping) | `AccountingPeriodService.updatePeriod()` | AC-6 | `TC-BR-AP-CMN-001-*` |
| `BR-AP-CMN-002` | NORMAL | controller (role check) | `AccountingPeriodController` Spring Security role guard | AC-8 | `TC-BR-AP-CMN-002-*` |

> **Enforcement layer priority** (rules-backend): Primary tại `AccountingPeriodService` (SSOT). Secondary tại `@Valid` DTO (UX feedback qua error response `ERR-CMN-validation`). BR-AP-012 là ngoại lệ — enforcement thực sự (chặn phiếu/tính giá) thuộc FEAT/boundary khác; feature này chỉ đảm bảo `status` + audit `updated_at/by` chính xác để consumer verify (v13 R3 — KHÔNG có `closed_at`/`reopened_at` riêng).

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | API contract (negative — name required) | test-api | 400 `ERR-CMN-validation` |
| AC-3 | API contract (negative — immutable field reject) | test-api | 400 `ERR-AP-001` cho từng field trong 5 field khóa |
| AC-4 | Unit (transition OPEN→CLOSED) + Integration (lock-check downstream) | test-api | verify `updated_at`/`updated_by` bump + `status=CLOSED`; verify `gf-inventory` lock-check trả `locked=true` sau đó |
| AC-5 | Unit (transition CLOSED→OPEN, không hierarchy guard) | test-api | verify `updated_at`/`updated_by` bump + `status=OPEN`; verify không có validation cha/con |
| AC-6 | API contract (200 happy path) + Unit (audit stamping) | test-api | verify `updatedBy`/`updatedAt` cập nhật đúng |
| AC-8 | Isolation (RBAC dual persona) | test-isolation | `garage-owner` và `accountant` đều 200; role khác → 403 |
| AC-1, AC-7 | N/A (UI-only) | — | Covered ở fe-web tier test scope |

---

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-EDIT.md` | N/A (chưa xác định — `paired_bff_feats=[]` theo Context Bundle) | Nếu wave sau xác nhận touchpoint, BFF sẽ wrap `PUT .../accounting-periods/{id}` thành GraphQL mutation |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-EDIT.md` | N/A (chưa xác định — `paired_fe_web_feats=[]`) | AC-1, AC-7 (UI-only) thuộc tier này khi được tạo |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-AP-EDIT.md` | N/A (chưa xác định — `paired_mobile_feats=[]`) | Kỳ kế toán chủ yếu quản trị trên web; xác nhận scope mobile khi FEAT được fan-out |

**Cross-tier contracts (read-only từ BE perspective)**:
- Endpoint `GET .../lock-check` là contract cross-boundary với `gf-inventory` (§6.4) — implement bởi `FEAT-OB-EDIT`/`FEAT-OB-IMPORT`/`FEAT-OB-DELETE-LINES` (boundary `gf-inventory`, FEAT khác) khi gọi lock-check.
- Response envelope `{data, code}` của `PUT .../accounting-periods/{id}` phải giữ nguyên shape khi BFF/FE tier được tạo về sau — additive only.

**Source ID consistency** (item 18): tất cả tier file (khi được tạo) phải có cùng `source_feat_sha = 17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416`.

---

## 12. References

- **Source**: [`Product/features/FEAT-AP-EDIT.md`](../../../../../Product/features/FEAT-AP-EDIT.md) v7
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) (converted)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) v27 (BR-AP-010..012, BR-AP-016, BR-AP-CMN-001/002, BR-PRC-008 tham chiếu)
- **HLD**: `Architecture/hld/gf-accounting-HLD.md`
- **API contract**: `Architecture/api/gf-accounting-api.md` §4.5, §2.2 index table row #21 (V4-AP-5 PUT) + row #23 (V4-AP-LC lock-check)
- **ADR-009**: JPA no relationship mapping — scalar FK only
- **ADR-019**: AP slice boundary ownership + schema + cross-boundary integration surface (lock-check contract origin)
- **ADR-021**: REST advisory pattern áp dụng cho OB write-path — contract response shape + fail-CLOSED/fail-OPEN semantics
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6 (sha: `f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d`)
- **PKG**: `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` §2.2.1
- **Fan-out map**: `Execution/wave-specs/W04/_routing/FEAT-FAN-OUT-MAP.yaml`

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-AP-EDIT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE (PUT edit + GET lock-check), §3 cover 8/8 AC (6 BE behaviour + 2 N/A UI-only: AC-1, AC-7), §4 ràng buộc (BR-AP-016 CORNERSTONE + error codes), §5 schema delta KHÔNG cần migration mới (tái dùng bảng `accounting_period` từ `FEAT-AP-CREATE`), §6 REST (V4-AP-4 PUT + V4-AP-LC GET lock-check ADR-021) + Kafka PROPOSED-only, §7-§11 BE-specific. **Grounding note**: Focus hint ban đầu đề cập "POST /:id/close" + "POST /:id/reopen" như 2 endpoint riêng — spec này **không theo hint đó** vì mâu thuẫn trực tiếp với BR-AP-010 ("sửa qua FEAT-AP-EDIT, không có feature đóng/mở riêng") và API doc §4.5 (chỉ 1 route PUT xử lý cả sửa lẫn đóng/mở qua field `status`); dùng bundle (nguồn ground-truth mới nhất, đã audit BR v27 + API doc) làm authoritative. 3 NEED CONFIRMATION được flag: (1) API doc index-table `ERR-AP-013` mâu thuẫn BR-AP-016 — dùng `ERR-AP-001` theo §4.5 chi tiết; (2) namespace `ERR-AP-*` pending đăng ký `ERROR-CODE-REGISTRY.md`; (3) lock-check period-selection logic (ưu tiên MONTH-level) là giả định kỹ thuật hợp lý nhưng chưa được BR/ADR chốt tường minh. `authoring_inputs.fanout_map_sha`/`template_sha` không được Context Bundle inject ở lần spawn này — flag backfill khi regen. |
| 2026-07-08 | 2 | Delivery Authority (main agent, cuongnguyen_ac audit-fix) | **Fix P0 drift alignment vs Architecture canonical** (audit 2026-07-08). (1) **PUT endpoint path + label**: `PUT /protected/accounting/v1/accounting-periods/{id}` label `V4-AP-4` → `PUT /api/v2/accounting-periods/{id}` label **V4-AP-5** (canonical PKG-W04 §2.2.1 + API doc §2.2 row #21; V4-AP-4 là POST CREATE, không phải PUT EDIT). Cascade §2 + §3 AC-2..AC-6 + AC-8 + §4.4 + §6.1 + §6.4 handoff BFF. (2) **Lock-check endpoint path**: `GET /protected/accounting/v1/accounting-periods/lock-check` → `GET /protected/v1/accounting-periods/lock-check` (bỏ segment `/accounting`, canonical API doc §2.2 row #23 + ADR-021). Cascade §2 + §3 AC-4 Ref + §6.1 endpoint table + §6.4 consumer table. (3) **Entity strip `closed_at`/`reopened_at`** (canonical `gf-accounting-data-model.md` §2ter.1 v10 audit v13 R3 — status transition tracked via `updated_at`/`updated_by` audit pair, KHÔNG có cột `closed_at`/`reopened_at` riêng). Cascade demo_signature frontmatter + §2 + §3 AC-4 heading + AC-4 behaviour + AC-5 heading + AC-5 behaviour + AC-6 persist + §4.1 BR-AP-012 + §5.1 entity col table (drop 2 rows) + §10 test scope AC-4/AC-5. (4) **Error code AC-6 404**: `ERR-AP-020` (unregistered) → `ERR-CMN-not-found` (canonical PKG-W04 §2.2.1 V4-AP-3 note + API doc §4.3). Cascade §3 AC-6 + §4.4 error mapping. **Non-goal**: KHÔNG đụng 3 NEED CONFIRMATION #1/#2/#3 (Architecture Authority scope). |
