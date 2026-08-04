---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-OB-DELETE-LINES.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-DELETE-LINES"
source_feat_sha: "976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408"
generated_at: "2026-07-08T00:00:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán chọn 5 dòng OB (dòng thứ 3 thuộc kỳ đã khóa) → nhấn 'Xóa dòng đã chọn' → hệ thống fail-fast dừng ngay tại dòng thứ 3 với ERR-INV-024, không xóa dòng nào; chọn lại 5 dòng hợp lệ → xác nhận xóa → hệ thống xóa + cascade tính lại sổ tồn (StockLedgerRecomputeService) + trả cascadedKeys[]."
consumes_contracts: ["gf-accounting-api §V4-AP-LC"]
paired_bff_feats: []
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "not-provided-by-orchestrator"
  template_sha: "not-provided-by-orchestrator"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-DELETE-LINES.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-DELETE-LINES (BE): Xóa dòng tồn đầu kỳ đã chọn

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-DELETE-LINES` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` (owner), `gf-accounting` (cross-boundary lock-check consumer) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Kế toán chọn nhiều dòng OB (1 dòng thuộc kỳ đã khóa) → xóa → hệ thống fail-fast chặn cả lô với 1 mã lỗi đầu tiên vi phạm, không xóa dòng nào; chọn lại dòng hợp lệ → xóa thành công + cascade sổ tồn. |
| Cross-tier pair | BFF: (chưa gen tại thời điểm authoring) \| Web: (chưa gen tại thời điểm authoring) \| Mobile: N/A (out-of-scope W04 — web-only per Figma registry) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-DELETE-LINES` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-DELETE-LINES.md`](../../../../../Product/features/FEAT-OB-DELETE-LINES.md) |
| Source version | v7 |
| Source SHA | `976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408` |
| Generated at | 2026-07-08T04:51:55+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần dọn dẹp dữ liệu tồn đầu kỳ nhập sai bằng cách xóa nhiều dòng tồn đầu kỳ cùng lúc từ danh sách. Hệ thống phải bảo vệ tính toàn vẹn sổ sách: không cho xóa dòng thuộc kỳ kế toán đã khóa, và không cho xóa nếu việc xóa làm tồn kho của (mã sản phẩm + kho) rơi xuống âm tại bất kỳ thời điểm nào sau đó. Feature này nằm ở cuối vòng đời quản lý tồn đầu kỳ (import → sửa → xóa), là bước dọn dẹp trước khi garage bắt đầu ghi nhận phiếu nhập/xuất kho thật (W05).

## 2. Trách nhiệm backend (`gf-inventory`)

- Cung cấp 1 REST endpoint xóa **primary**: `POST /api/v2/opening-balances/delete-lines` (xóa nhiều dòng theo `ids[]` — W04-7). Single-delete `DELETE /api/v2/opening-balances/{id}` (W04-6) là canonical owned by `FEAT-OB-LIST` AC-11 (icon "Xóa" trên row list); FEAT này share **service-layer guardrail logic** (`OpeningBalanceDeleteService.deleteBulk()` / `deleteSingle()`) nhưng KHÔNG expose endpoint DELETE tại đây — xem `features/be/FEAT-OB-LIST.md §6.1`.
- Enforce **fail-fast, all-or-nothing**: validate guardrail theo đúng thứ tự `ids[]` trong request, dừng ngay tại id đầu tiên vi phạm, không xóa bất kỳ dòng nào nếu có vi phạm (BR-OB-DEL-004).
- Enforce **BR SSOT** — 2 guardrail chặn xóa, theo đúng thứ tự ưu tiên mã lỗi khi 1 dòng vi phạm cả 2: kỳ kế toán đã khóa (`ERR-INV-024`, BR-OB-DEL-002) trước, tồn âm point-in-time (`ERR-INV-036`, BR-OB-DEL-003) sau (BR-OB-DEL-005) — enforce tại `app/service`.
- Gọi cross-boundary REST advisory `gf-accounting` `GET /protected/v1/accounting-periods/lock-check?date=...` cho mỗi ngày "Tồn đến ngày" distinct của các dòng cần xóa — authoritative + fail-CLOSED (ADR-021) trong cùng transaction commit.
- Sau khi xóa thành công — cascade tính lại sổ tồn (`inventory_stock_ledger`) forward từ ngày OB bị xóa, cho từng (mã + kho) bị chạm, qua `StockLedgerRecomputeService.recompute()` dùng chung engine ADR-020 (không tạo engine riêng).
- Migration/persistence: không có schema delta mới cho 2 endpoint này — tái sử dụng entity `opening_balance_line` + `inventory_stock_ledger` đã thiết lập bởi Flyway `V{N+1}__inventory_v2_ob_ledger.sql` (cùng migration của W04-3/4/5 trong cùng PKG).

## 3. Hành vi cần triển khai (BE behaviour map)

> Coverage: 6/6 source AC-IDs.

### Cluster A — Xác nhận & thực thi xóa (UI-driven, BE thực thi tại bước confirm)

#### AC-1 → N/A (UI-only)

- Việc mở popup "Xác nhận" khi bấm "Xóa dòng đã chọn" là logic hiển thị client-side (optimistic — chưa gọi BE). BE không tham gia bước này. Guardrail thực tế chỉ được BE đánh giá tại thời điểm gọi endpoint xóa thật (khi user bấm nút "Xóa" trong popup — xem AC-2/AC-4). Xem `fe-web/FEAT-OB-DELETE-LINES.md §3 AC-1`.

#### AC-2 → Thực hiện xóa thành công (BE core path)

- **Khi**: client gọi `POST /api/v2/opening-balances/delete-lines` với `ids[]` (bulk, primary + only endpoint owned by FEAT này). Single-row `DELETE /api/v2/opening-balances/{id}` (W04-6) shared service logic nhưng endpoint canonical thuộc `FEAT-OB-LIST` AC-11 — xem `features/be/FEAT-OB-LIST.md §6.1`.
- **BE phải**: trong 1 `@Transactional`, với từng id theo đúng thứ tự trong `ids[]` — (a) resolve `opening_balance_line` theo `id` + tenant scope, 404 nếu không tồn tại; (b) gọi lock-check cho `asOfDate` của dòng (cache 30s theo `(tenantId, date)` — ADR-021); (c) kiểm tra guardrail tồn âm point-in-time qua `StockLedgerRecomputeService` dry-run; (d) nếu tất cả dòng pass → hard-delete toàn bộ dòng đã chọn + cascade recompute forward cho từng (mã + kho) distinct bị chạm.
- **Output**: `{requestedCount, deletedCount, cascadedKeys: [{productCode, warehouseCode, recomputedRows}]}` (W04-7).
- **Failure mode**: xem AC-4 (fail-fast guardrail) — không xóa dòng nào nếu bất kỳ dòng nào vi phạm.
- **Ref**: BR-OB-DEL-001 (§9), entity `OpeningBalanceLine` + `InventoryStockLedger` (§5.1), endpoint `POST /api/v2/opening-balances/delete-lines` (W04-7 — §6.1).

#### AC-3 → N/A (UI-only)

- Đóng popup + không gọi API khi bấm "Hủy" là hành vi client-side thuần túy. BE không nhận request nào trong case này. Xem `fe-web/FEAT-OB-DELETE-LINES.md §3 AC-3`.

### Cluster B — Guardrail chặn xóa (BR SSOT, core BE responsibility)

#### AC-4 → Chặn xóa fail-fast khi vi phạm kỳ khóa hoặc tồn âm

- **Khi**: trong `ids[]` (hoặc single `id`) có ít nhất 1 dòng mà "Tồn đến ngày" (`asOfDate`) thuộc kỳ kế toán đã đóng, HOẶC việc xóa dòng đó làm tồn lũy kế của (mã sản phẩm + kho) tại bất kỳ thời điểm nào từ `asOfDate` trở đi xuống < 0.
- **BE phải**: validate **fail-fast theo đúng thứ tự `ids[]`** trong request — dừng ngay tại id đầu tiên vi phạm (KHÔNG loop hết danh sách để gom nhiều lỗi). Với id đó, nếu vi phạm CẢ HAI điều kiện cùng lúc → chỉ báo 1 mã lỗi theo thứ tự ưu tiên: `ERR-INV-024` (kỳ đóng) TRƯỚC, `ERR-INV-036` (tồn âm) SAU (BR-OB-DEL-005). Chặn cả lô — không xóa bất kỳ dòng nào (BR-OB-DEL-004), kể cả các dòng đứng trước id vi phạm trong `ids[]` đã pass guardrail riêng lẻ.
- **Output**: HTTP 400 `{errorCode: "ERR-INV-024" | "ERR-INV-036", offendingIds: [<id đầu tiên vi phạm>]}`.
- **Failure mode**: 400 (guardrail); 503 `ERR-CMN-007` nếu `gf-accounting` lock-check unreachable (fail-CLOSED, ADR-021 — không xóa khi không xác định được trạng thái kỳ).
- **Ref**: BR-OB-DEL-002/003/004/005 (§9), lock-check cross-boundary `gfAccountingClient` (§6.4), endpoint `POST /api/v2/opening-balances/delete-lines` (§6.1).

#### AC-5 → Quy tắc tồn ≥ 0 point-in-time (làm rõ ngữ nghĩa guardrail tồn âm)

- **Khi**: dòng OB đã được dùng làm nguồn cho phiếu xuất kho, nhưng đã có phiếu nhập kho bù đủ sau đó — nghĩa là sau khi xóa OB, tồn lũy kế của (mã + kho) tại mọi thời điểm từ `asOfDate` trở đi vẫn ≥ 0.
- **BE phải**: KHÔNG dùng rule đơn giản "có phiếu xuất tham chiếu tồn đầu kỳ → chặn". Guardrail tồn âm phải chạy qua `StockLedgerRecomputeService` dry-run cascade forward — tính lại `closing_qty` running tại **mọi ngày** (không chỉ ngày OB) từ `asOfDate` trở đi dựa trên nguồn còn lại (các phiếu nhập/xuất khác của cùng mã+kho) sau khi loại bỏ dòng OB; chỉ chặn khi phát hiện `closing_qty < 0` tại **bất kỳ** điểm nào trong chuỗi — cho phép xóa nếu invariant `closing_qty ≥ 0` giữ đúng tại mọi điểm (đối xứng với BR-OB-015 chiều import).
- **Output**: cho phép xóa (không throw lỗi) khi dry-run cascade pass.
- **Failure mode**: nếu dry-run phát hiện vi phạm → cùng path `ERR-INV-036` như AC-4.
- **Ref**: BR-OB-DEL-003 (§9), `StockLedgerRecomputeService` shared engine (ADR-020 §C4-C5), endpoint `POST /api/v2/opening-balances/delete-lines` (§6.1).

### Cluster C — Phân quyền

#### AC-6 → Phân quyền xóa ngang nhau (2 persona)

- **Khi**: request tới `DELETE /api/v2/opening-balances/{id}` hoặc `POST /api/v2/opening-balances/delete-lines` mang JWT của persona `garage-owner` hoặc `accountant`.
- **BE phải**: KHÔNG áp thêm role-check phân biệt giữa 2 persona cho 2 endpoint này — cả hai có quyền xóa ngang nhau (BR-OB-CMN-002). Chỉ enforce `TenantFilter` + `TenantContext` (mọi dòng phải thuộc đúng tenant của JWT).
- **Output**: request hợp lệ về tenant + có 1 trong 2 persona → cho qua tới guardrail check (AC-4/AC-5).
- **Failure mode**: 401 nếu JWT invalid; 403 nếu `X-Tenant-Id` mismatch token tenant.
- **Ref**: BR-OB-CMN-002 (§9), Critical Rule #4 tenant isolation (§4.2).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-OB-DEL-002** (NORMAL): chặn xóa dòng có `asOfDate` thuộc kỳ kế toán đã đóng — enforce tại `app/service` qua cross-boundary lock-check `gfAccountingClient`. Vi phạm → `ERR-INV-024` + HTTP 400.
- **BR-OB-DEL-003** (NORMAL): chặn xóa nếu làm tồn (mã + kho) < 0 tại bất kỳ thời điểm point-in-time nào — enforce tại `app/service` qua `StockLedgerRecomputeService` dry-run. Vi phạm → `ERR-INV-036` + HTTP 400.
- **BR-OB-DEL-004** (CORNERSTONE): một số dòng vi phạm trong lô → chặn TOÀN BỘ lô, không xóa partial — enforce tại `app/service` trong cùng `@Transactional` (rollback tự động nếu throw trước bước `saveAll`/`deleteAll`).
- **BR-OB-DEL-005** (CORNERSTONE): thứ tự bắn mã lỗi khi 1 dòng vi phạm cả 2 điều kiện — `ERR-INV-024` trước, `ERR-INV-036` sau; mỗi dòng chỉ báo 1 mã lỗi; validate fail-fast dừng ngay tại id đầu tiên vi phạm theo thứ tự `ids[]` — enforce tại `app/service` (thứ tự gọi 2 guardrail check trong loop phải cố định: check kỳ đóng trước, check tồn âm sau, cho mỗi id).
- **BR-OB-CMN-002** (NORMAL): `garage-owner` + `accountant` quyền ngang nhau — enforce tại `adapter/controller` (không role-differentiate, chỉ tenant-scope).

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- Cả `DELETE /api/v2/opening-balances/{id}` và `POST /api/v2/opening-balances/delete-lines` chấp nhận cả 2 role `accountant` và `garage-owner` — không phân biệt quyền (BR-OB-CMN-002).
- Toàn bộ `OpeningBalanceController` gate `@FeatureOn("Inventory:InventoryV2")` class-level — tenant chưa bật flag → HTTP 403 (đồng nhất với các endpoint W04-1..W04-5 trong cùng controller).

### 4.3 Idempotency + concurrency

- `DELETE /api/v2/opening-balances/{id}` (W04-6) idempotent theo nghĩa REST chuẩn — gọi lặp lại lần 2 trở đi → HTTP 404 (dòng đã bị xóa lần đầu).
- `POST /api/v2/opening-balances/delete-lines` (W04-7) khuyến nghị header `X-Idempotency-Key` (không bắt buộc — khác với W04-4 import). Dedup pattern nếu implement: tương tự `processed_events` TTL đã dùng ở W04-4.
- Redisson lock per `(tenant, productId, warehouseId)` khi chạy `StockLedgerRecomputeService.recompute()` — ngăn 2 write-path OB (import/edit/delete) chạy đồng thời trên cùng key (ADR-020 recompute lock, timeout 30s).
- Concurrency edge case (EC-2 nguồn): dòng đủ điều kiện xóa tại thời điểm FE hiển thị nhưng phiên khác vừa đóng kỳ hoặc phát sinh giao dịch làm tồn âm trước khi request DELETE tới → BE PHẢI re-check guardrail tại thời điểm transaction thực thi (không tin cache/preview từ FE) — nếu vi phạm, trả lỗi tương ứng AC-4 dù FE đã optimistically mở popup "Xác nhận".

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-024` | 400 | AC-4 | DIALOG (popup "Không thể xóa" — chặn cả lô) |
| `ERR-INV-036` | 400 | AC-4, AC-5 | DIALOG (popup "Không thể xóa" — chặn cả lô) |
| `ERR-CMN-007` | 503 | AC-4 (lock-check unavailable, fail-CLOSED) | TOAST platform-wide |
| (404, global handler — không có mã Product-registered) | 404 | AC-2 | EMPTY_STATE / TOAST tùy FE — dòng không tồn tại hoặc đã bị xóa |
| 401 / 403 | 401 / 403 | AC-6 | TOAST |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `opening_balance_line` | (không có cột mới) | — | — | — | N/A — tái sử dụng schema đã thiết lập bởi `V{N+1}__inventory_v2_ob_ledger.sql` (cùng PKG, tạo bởi W04-3/4/5) | BR-OB-DEL-001..005 | AC-2, AC-4, AC-5 | 2 endpoint DELETE chỉ đọc + hard-delete row hiện có, không cần schema delta. |
| `inventory_stock_ledger` | (không có cột mới) | — | — | — | N/A — tái sử dụng schema đã thiết lập cùng migration trên | BR-STKV2-001, ADR-020 | AC-2, AC-5 | Ghi thêm/xóa row qua `StockLedgerRecomputeService.recompute()` (engine đã có sẵn từ W04-4) — không có cột mới. |

> **Boundary migration policy**: `gf-inventory` dùng Flyway V{N+1} additive. Không có migration mới riêng cho FEAT-OB-DELETE-LINES — dùng chung `V{N+1}__inventory_v2_ob_ledger.sql` đã được W04-3/4/5 trong cùng PKG-W04 khai báo.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| (không có thay đổi) | — | — | — | 2 endpoint DELETE dùng lại PK `opening_balance_line.id` (unique btree mặc định) + index `idx_ob_tenant_created`/`idx_ob_tenant_warehouse_asof` đã thiết lập bởi W04-1/3/4/5 cho lookup — không cần index mới. | — |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/opening-balances/delete-lines` (W04-7) | JWT (dual persona) | `{ ids: int64[] (1..500) }` | `{ requestedCount, deletedCount, cascadedKeys: [{productCode, warehouseCode, recomputedRows}] }` | recommended `X-Idempotency-Key` (không bắt buộc) | AC-2, AC-4, AC-5, AC-6 | — |

> **Single-delete `DELETE /api/v2/opening-balances/{id}` (W04-6) — KHÔNG own endpoint tại FEAT này**: W04-6 là canonical owned by `FEAT-OB-LIST` AC-11 (icon "Xóa" trên row list) per API doc `gf-inventory-api.md §3b.1`. `FEAT-OB-DELETE-LINES` share **service-layer guardrail logic** (lock-check per `asOfDate` + cascade recompute per distinct `(product, warehouse)` — chung `OpeningBalanceDeleteService.deleteSingle()` / `deleteBulk()`) nhưng KHÔNG expose endpoint DELETE tại đây. Xem `features/be/FEAT-OB-LIST.md §6.1` cho contract W04-6.

### 6.2 Modified REST endpoints (additive)

_(không có — 2 endpoint trên là mới, không sửa endpoint đã tồn tại)_

### 6.3 Kafka topics (publish/consume)

_(không có — W04 chỉ intra-service sync call `StockLedgerRecomputeService`. ADR-020: "Trigger từ Kafka event OB EDIT/DELETE ở future wave → không bắt buộc outbox ở W04". Không publish event nào cho DELETE OB trong wave này.)_

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| _(không có endpoint nào của gf-inventory bị boundary khác gọi trực tiếp cho feature này — chỉ BFF `agg-garage-graph` wrap qua GraphQL, xem §11)_ | — | — | — | — |

**Outbound cross-boundary call** (gf-inventory là consumer, không phải producer trong bảng trên): `gf-inventory` gọi `gf-accounting` `GET /protected/v1/accounting-periods/lock-check?date={asOfDate}` cho mỗi ngày distinct trong lô xóa (ADR-021) — authoritative + fail-CLOSED trong transaction commit. Client bean `gfAccountingClient` (Spring `RestClient`, đã có sẵn từ W04-3/4/5) + Resilience4j circuit breaker (50% failure rate, cửa sổ mở 60s) + Spring Retry 3 lần (100/200/400ms). Cache LRU 30s scope `(tenantId, date)` chia sẻ với các write-path OB khác trong cùng service.

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-OB-DELETE-LINES.md`) sẽ wrap 2 endpoint này thành GraphQL mutation `deleteOpeningBalanceLine(id)` + `deleteOpeningBalanceLines(ids)` (per `agg-garage-graph-graphql.md` §3g). KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/OpeningBalanceLineRepository.java` | ADDITIVE | new finder `findAllByIdInAndTenantId` | ~10 | AC-2, AC-4 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/OpeningBalanceService.java` | MODIFY | extend (add `deleteLine()` + `deleteLines()` — fail-fast guardrail loop, tái dùng `StockLedgerRecomputeService`) | ~120 | AC-2, AC-4, AC-5, AC-6 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/OpeningBalanceController.java` | MODIFY | extend (add `DELETE /{id}` + `POST /delete-lines` handler methods trên controller đã có) | ~40 | AC-2, AC-4 |
| `adapter/client` | `services/gf-inventory/src/main/java/.../adapter/client/GfAccountingClient.java` | REUSE | (không đổi — client `lockCheck()` đã có từ W04-3/4/5) | 0 | AC-4 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/OpeningBalanceLineJpaRepository.java` | ADDITIVE | method `deleteAllByIdInAndTenantId` | ~5 | AC-2 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/OpeningBalanceServiceDeleteTest.java` | ADDITIVE | new test methods (fail-fast order, all-or-nothing, dual persona, dry-run tồn ≥ 0) | ~180 | AC-2, AC-4, AC-5, AC-6 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/OpeningBalanceControllerDeleteContractTest.java` | NEW | contract test cho 2 endpoint mới | ~90 | AC-2, AC-4 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Repository finder (reuse schema — no migration)
    Entry: opening_balance_line schema stable (từ W04-3/4/5)
    Exit: finder compile + unit test green
    └─► S2

S2  Service logic — fail-fast guardrail + cascade (BR enforcement primary)
    Entry: S1 + StockLedgerRecomputeService (ADR-020) đã tồn tại
    Exit: unit test ≥8 green (order 024→036, all-or-nothing, dual persona, dry-run tồn ≥0)
    └─► S3

S3  REST adapter (controller) — DELETE + POST delete-lines
    Entry: S2
    Exit: contract test green (fail-fast response shape, error codes)
    └─► S4

S4  Integration test (cross-boundary lock-check gf-accounting + cascade ledger)
    Entry: S3 + gf-accounting V4-AP-LC stable
    Exit: integ test green (Testcontainers: đóng kỳ → xóa → ERR-INV-024; tồn âm → ERR-INV-036; fail-CLOSED khi gf-accounting down)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Repository finder | domain + adapter/persistence | Schema stable (W04-3/4/5) | Unit test green | — |
| S2 | Service logic (guardrail + cascade) | app/service | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + `gf-accounting` V4-AP-LC | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-OB-DEL-001` | NORMAL | adapter/controller (endpoint shape) | `adapter/controller/OpeningBalanceController.java` | AC-2 | `TC-BR-gf-inventory-OB-DEL-001-*` |
| `BR-OB-DEL-002` | NORMAL | app/service (primary, via `gfAccountingClient`) | `app/service/OpeningBalanceService.java::deleteLines()` | AC-4 | `TC-BR-gf-inventory-OB-DEL-002-*` |
| `BR-OB-DEL-003` | NORMAL | app/service (primary, via `StockLedgerRecomputeService` dry-run) | `app/service/OpeningBalanceService.java::deleteLines()` | AC-4, AC-5 | `TC-BR-gf-inventory-OB-DEL-003-*` |
| `BR-OB-DEL-004` | CORNERSTONE | app/service (primary, `@Transactional` all-or-nothing) | `app/service/OpeningBalanceService.java::deleteLines()` | AC-4 | `TC-BR-gf-inventory-OB-DEL-004-*` |
| `BR-OB-DEL-005` | CORNERSTONE | app/service (primary, thứ tự guardrail check cố định) | `app/service/OpeningBalanceService.java::deleteLines()` | AC-4 | `TC-BR-gf-inventory-OB-DEL-005-*` |
| `BR-OB-CMN-002` | NORMAL | adapter/controller (không role-differentiate, chỉ tenant scope) | `adapter/controller/OpeningBalanceController.java` | AC-6 | `TC-BR-gf-inventory-OB-CMN-002-*` |
| `BR-STKV2-001` | CORNERSTONE | app/service (cascade forward, via shared engine) | `app/service/StockLedgerRecomputeService.java` (đã có từ W04-4) | AC-2, AC-5 | `TC-BR-gf-inventory-STKV2-001-*` |

> **Enforcement layer priority**: Primary ở `app/service` (SSOT). Secondary UX feedback (popup wording, disable button) → FE/Mobile tier secondary (xem §11).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | API contract + Integration | test-api | Xóa thành công + cascade `cascadedKeys[]` đúng shape ADR-020 §C4 |
| AC-4 | API contract (negative) + Integration | test-api | Fail-fast order 024 trước 036; all-or-nothing (không xóa dòng nào); `offendingIds` = id đầu tiên vi phạm |
| AC-5 | Integration | test-api | Case tồn đã được bù bởi phiếu nhập sau → cho phép xóa (KHÔNG chặn theo "có phiếu xuất") |
| AC-6 | Isolation (RBAC) | test-isolation | dual persona — cả `accountant` + `garage-owner` xóa được ngang quyền |
| — | Cross-boundary | test-api | `gf-accounting` down → 503 `ERR-CMN-007` fail-CLOSED (không xóa) |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-DELETE-LINES.md` | N/A (chưa gen tại thời điểm authoring) | Resolver wrap `deleteOpeningBalanceLine(id)` + `deleteOpeningBalanceLines(ids)` cho §6.1 endpoints |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-DELETE-LINES.md` | N/A (chưa gen tại thời điểm authoring) | UI popup "Xác nhận"/"Không thể xóa" (AC-1/3/4) consume BFF mutation |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-DELETE-LINES.md` | N/A — out-of-scope W04 | `FEAT-OB-DELETE-LINES` không có Figma mobile link trong registry `Product/ux/figma/figma-links.yaml` W04 block → web-only per PKG-W04 §2.3 Out of Scope. |

**Source ID consistency** (item 18): tất cả tier file (khi được gen) phải có cùng `source_feat_sha = 976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408`.

## 12. References

- **Source**: [`Product/features/FEAT-OB-DELETE-LINES.md`](../../../../../Product/features/FEAT-OB-DELETE-LINES.md) v7
- **Parent EP**: [`EP-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md)
- **BR refs**: [`BR-GF-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md) §2.3, [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) v44 §3b (W04-6, W04-7), [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §Accounting Period (V4-AP-LC)
- **ADRs**: [`ADR-019`](../../../../../Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md), [`ADR-020`](../../../../../Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md) v4, [`ADR-021`](../../../../../Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v4
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Error registry**: [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../../../../Product/error-code/ERROR-CODE-REGISTRY.md) (`ERR-INV-024`, `ERR-INV-036`, `ERR-CMN-007`)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-OB-DELETE-LINES` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE (2 endpoint W04-6 single + W04-7 bulk fail-fast), §3 BE behaviour map 6/6 AC-ID, §4 ràng buộc (BR-OB-DEL-001..005 + BR-OB-CMN-002 + error code mapping), §5-§11 BE-specific (schema reuse — không có delta mới, REST W04-6/W04-7, cross-boundary lock-check gf-accounting, sequence S1-S4, BR primary enforcement, test hand-off, cross-tier pair N/A tại thời điểm authoring). Source FEAT chỉ audit. |
| 2026-07-08 | 2 | Delivery Authority (main agent, cuongnguyen_ac audit-fix) | **Fix P0+P2 drift alignment vs Architecture canonical** (audit 2026-07-08). (1) **Lock-check endpoint path** (P0): `GET /protected/accounting/v1/accounting-periods/lock-check` → `GET /protected/v1/accounting-periods/lock-check` (bỏ segment `/accounting`, canonical API doc §2.2 row #23 + ADR-021). Cascade §0 + §2 + §6.4 (3 mention). (2) **Dedup single-delete W04-6 ownership** (P2): §6.1 endpoint table + §2 trách nhiệm + §3 AC-2 khi/output/ref — bỏ khai `DELETE /api/v2/opening-balances/{id}` như endpoint owned by FEAT này. W04-6 canonical thuộc `FEAT-OB-LIST` AC-11 (icon "Xóa" trên row list) per API doc `gf-inventory-api.md §3b.1`. FEAT này chỉ share service-layer guardrail logic (`OpeningBalanceDeleteService.deleteBulk()` / `deleteSingle()`), KHÔNG expose endpoint DELETE. **Non-goal**: KHÔNG sửa AC-2/AC-4/AC-6/AC-8 role mention "endpoint DELETE"/permission còn lại — chỉ endpoint ownership tại §6.1 chuyển. |
