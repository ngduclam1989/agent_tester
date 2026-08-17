---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 14
tier: T1
owner_authority: Architecture Authority
boundary: gf-accounting
last_reviewed: "2026-08-11"
---

# Events — `gf-accounting` boundary

> Producer = `gf-accounting` service. Convention chung xem [`_CONVENTIONS.md`](_CONVENTIONS.md).
>
> gf-accounting **KHÔNG publish business event ACTIVE** nào trong source. Outbox infrastructure (`OutboxEvent`, `OutboxProcessor`, Redis lock `gf-accounting-outbox-processor`) sẵn sàng nhưng chưa wire. Settlement lifecycle (create/cancel/payment/dossier-export) hoàn toàn đồng bộ qua REST (ADR-014).
>
> **(DESIGN — ADR-019)**: 2 outbound events `AccountingPeriodClosed` + `AccountingPeriodReopened` declared **PROPOSED** (contract khóa naming + envelope sớm; **KHÔNG publish trong batch**). ACTIVE flip = future wave responsibility khi RECEIPT-V2 / DELIVERY-V2 / PRC kick-off.
>
> **(DESIGN — W06 PRC, ADR-027 + ADR-028)**: PRC (Tính giá xuất kho PWA) **KHÔNG publish Kafka event** cho lifecycle (`PRICE_CALC_STARTED / COMPLETED / FAILED`). Sync HTTP polling contract theo BR-PRC-016 v29 ("polling từ trạng thái server") + AC-2c 5s interval — event thay thế polling sẽ làm mất trạng thái sync GET không cần thiết. Nếu future downstream cần listener (vd trigger auto-close accounting period sau PRC succeeded) — CR-based add ACTIVE event trên topic `AC-DEV-ACCOUNTING-EVENTS` (đã reuse cho AP). Xem ADR-028 §Alt-3 rejected rationale.
>
> **(DESIGN — ad-hoc 2026-08-10, ADR-031)**: 1 outbound event **có consumer thật** (Driver Plus) — `SettlementDocumentSync` trên topic **MỚI** `AC-DEV-DOCUMENT-EVENTS` (`MessageGroup=DOCUMENT`). Đây là **producer Driver+ đầu tiên** của boundary này — đồng bộ phiếu quyết toán sang app tài xế (`FEAT-STL-CREATE` AC-3 / `BR-STL-CRE-008`). Tái dùng 100% outbox sẵn có, **KHÔNG** bảng mới, **KHÔNG** cột mới (ADR-031 D6). Khác 2 event AP: nhóm này wire publish thật, gate bằng flag `Document:DriverPlus`.
>
> gf-accounting **KHÔNG dùng Temporal** (ADR-005 — chỉ 5 service) → không có §4 Workflow correlation.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-accounting` |
| Owned epics | EP-INSURANCE-SETTLEMENT (FEAT-INS-STL-DETAIL, FEAT-INS-DOSSIER-CREATE); **EP-INVENTORY-ACCOUNTING-PERIOD (5 FEAT-AP-*, DESIGN — boundary correction Delivery Authority 2026-06-23, ADR-019)** — BA frontmatter `boundary: gf-inventory` mismatch tolerated (OQ1) |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.accounting.*` (planned) |
| Total events | **2 outbound PROPOSED** (`AccountingPeriodClosed`, `AccountingPeriodReopened` — KHÔNG publish trong batch; ACTIVE flip = future wave) + **1 outbound DESIGN có consumer thật** (`SettlementDocumentSync` → Driver Plus; wire publish khi triển khai — ADR-031) |
| Reliability | Transactional outbox (`outbox_events`) + scheduled retry (poll 5s, batch 100, max 3 retry, Redis singleton lock) — ADR-004. Hiện chưa wire cho 2 event AP (PROPOSED = contract only); event chứng từ Driver+ **tái dùng nguyên hạ tầng này**, không thêm bảng/cột (ADR-031 D6). |
| Canonical envelope | `KafkaMessageWrapper` (per `_CONVENTIONS.md` §3 — khi flip ACTIVE) |
| Topic | **`AC-DEV-ACCOUNTING-EVENTS`** (reuse existing — D1 micro-decision; conform `AC-DEV-{DOMAIN}-EVENTS` pattern per `_CONVENTIONS §2`; topic đã register trong §11 inventory, currently 0 active events sau khi insurance events revoked v7) |
| MessageGroup | `ACCOUNTING_PERIOD_LIFECYCLE` (UPPER_SNAKE per `_CONVENTIONS §3.3`); **`DOCUMENT`** cho event chứng từ Driver+ (ADR-031 D2) |
| Partition key | `AccountingPeriod-{periodCode}` (per-aggregate per `_CONVENTIONS §4`; `periodCode` auto-derived deterministic — xem data-model §2ter.1); **`Document-{documentCode}`** cho event chứng từ Driver+ |
| Topic thứ 2 | **`AC-DEV-DOCUMENT-EVENTS`** (MỚI — dùng chung với `gf-sales`; D+ chỉ subscribe 1 topic cho chứng từ, ADR-031 D2) |

---

## 2. Catalog

### 2.1 Outbound (gf-accounting → Kafka)

| # | Event Type (wrapper) | Domain eventType | Status | MessageGroup | MessageStep | Topic | Partition Key | Primary Consumers (FUTURE) |
|---|---|---|---|---|---|---|---|---|
| 1 | `ACCOUNTING_PERIOD_CLOSED` | `AccountingPeriodClosed` | **PROPOSED** (DESIGN — ADR-019; KHÔNG publish trong batch) | `ACCOUNTING_PERIOD_LIFECYCLE` | `CLOSED.1` | `AC-DEV-ACCOUNTING-EVENTS` | `AccountingPeriod-{periodCode}` | gf-inventory RECEIPT-V2 / DELIVERY-V2 (invalidate UI cache + reject mid-flight writes) · PRC (gate RECALC) — tất cả future wave |
| 2 | `ACCOUNTING_PERIOD_REOPENED` | `AccountingPeriodReopened` | **PROPOSED** (DESIGN — ADR-019; KHÔNG publish trong batch) | `ACCOUNTING_PERIOD_LIFECYCLE` | `REOPENED.1` | `AC-DEV-ACCOUNTING-EVENTS` | `AccountingPeriod-{periodCode}` | gf-inventory RECEIPT-V2 / DELIVERY-V2 (re-enable writes for period range) · PRC (re-enable RECALC) — tất cả future wave |
| 3 | `SETTLEMENT_DOCUMENT_SYNC` | `SettlementDocumentSync` | **DESIGN** (ad-hoc 2026-08-10 — ADR-031; **publish thật**, gate bằng flag `Document:DriverPlus`) | `DOCUMENT` | `DOCUMENT.SETTLEMENT.SYNC` | **`AC-DEV-DOCUMENT-EVENTS`** (MỚI) | `Document-{documentCode}` | **Driver Plus** (hồ sơ số của xe — `FEAT-DP-046`) |

> **Khác biệt trạng thái**: 2 event AP (#1/#2) là `PROPOSED` (contract-only, KHÔNG wire). Event chứng từ D+ (#3) là **DESIGN có consumer thật** (Driver+) → wire publish trong đợt triển khai, khác hoàn toàn với ràng buộc "KHÔNG publish trong batch" của §5.
>
> **KHÔNG có `DOCUMENT.SETTLEMENT.REVOKED`** (gỡ round 2, mandate Q8 2026-08-10): `FEAT-STL-DETAIL` EC-7 + AC-16/17/18 đã bị Business Authority gỡ 2026-08-03 (Change Log v3) — "Hủy phiếu quyết toán" là **chức năng không tồn tại**, nhầm với AC-15 "Hủy chỉnh sửa". Nếu BA xác nhận sau này có luồng hủy phiếu QT → CR bổ sung, thuần additive.

> Source/wire details (`source: gf-accounting`, `timestamp` ISO-8601 UTC, `messageId` UUID per Kafka message, full envelope schema) áp dụng `KafkaMessageWrapper` chuẩn — xem `_CONVENTIONS §3.1`.

### 2.2 Inbound

Không có inbound external-source. (gf-accounting consume internal events qua `_CONVENTIONS §12` discovery — không document trong §2.2.)

Insurance Settlement (EP-INSURANCE-SETTLEMENT) hoàn toàn đồng bộ qua REST (ADR-014) — không có event publish/consume cho insurance lifecycle.

---

## 3. Schemas

### 3.1 `AccountingPeriodClosed` (PROPOSED — DESIGN, ADR-019)

**Trigger** (PROPOSED — future ACTIVE wire-up):
- User chuyển kỳ kế toán từ `OPEN` → `CLOSED` qua `PUT /api/v2/accounting-periods/{id}` với `status=CLOSED` (FEAT-AP-EDIT AC-4, BR-AP-010).
- Service `AccountingPeriodService.update()` ghi row `outbox_events` cùng transaction với UPDATE `accounting_period.status` (ADR-004 outbox pattern).
- `OutboxProcessor` (Redis lock `gf-accounting-outbox-processor`) poll 5s, publish lên `AC-DEV-ACCOUNTING-EVENTS`.
- **PROPOSED status — KHÔNG implement trong batch.** Wire-up future wave.

**Payload (domain `data` content):**
```json
{
  "eventId": "uuid",
  "eventType": "AccountingPeriodClosed",
  "eventVersion": "1.0",
  "tenantId": 133,
  "occurredAt": "2026-07-05T08:30:00Z",
  "source": "gf-accounting",
  "periodId": 1024,
  "periodCode": "AP-MONTH-133-202606",
  "periodName": "Tháng 6/2026",
  "periodType": "MONTH",
  "parentId": 1020,
  "startDate": "2026-06-01",
  "endDate": "2026-06-30"
}
```

> **Audit-by-design**: payload KHÔNG carry `closedAt`/`closedBy` — consumers derive transition timestamp từ envelope `occurredAt` (line 77) + actor từ envelope `headers.actor` per `_CONVENTIONS §2`. Backend entity KHÔNG có separate `closed_at/by` cols (status transitions tracked via standard `updated_at/by` audit pair).

**Idempotency:**
- Dedup key: `{consumer-service}:{messageId}:ACCOUNTING_PERIOD_CLOSED` (per `_CONVENTIONS §5.2`).
- Producer-side: `outbox_events.id` natural unique + Redis lock prevent double-publish across replicas.
- Consumer-side (future): inbox table required (ADR-004) — RECEIPT-V2/DELIVERY-V2/PRC dedup before side-effect (cache invalidation, write-block enable).

**Critical use case (future):** RECEIPT-V2/DELIVERY-V2 consume → invalidate local lock-check cache cho period; PRC consume → block mọi mã trong `[startDate, endDate]` khỏi tạo lần tính giá mới (`FEAT-PRC-CREATE`) hoặc RECALC (BR-PRC-008).

### 3.2 `AccountingPeriodReopened` (PROPOSED — DESIGN, ADR-019)

**Trigger** (PROPOSED — future ACTIVE wire-up):
- User chuyển kỳ kế toán từ `CLOSED` → `OPEN` qua `PUT /api/v2/accounting-periods/{id}` với `status=OPEN` (FEAT-AP-EDIT AC-5, BR-AP-011 — cho mở lại đối xứng).
- Service `AccountingPeriodService.update()` ghi row `outbox_events` cùng transaction với UPDATE `accounting_period.status` (transition tracked via standard `updated_at`/`updated_by` audit pair — no separate close/reopen audit cols).
- `OutboxProcessor` poll 5s, publish lên `AC-DEV-ACCOUNTING-EVENTS`.
- **PROPOSED status — KHÔNG implement trong batch.** Wire-up future wave.

**Payload (domain `data` content):**
```json
{
  "eventId": "uuid",
  "eventType": "AccountingPeriodReopened",
  "eventVersion": "1.0",
  "tenantId": 133,
  "occurredAt": "2026-07-10T02:15:00Z",
  "source": "gf-accounting",
  "periodId": 1024,
  "periodCode": "AP-MONTH-133-202606",
  "periodName": "Tháng 6/2026",
  "periodType": "MONTH",
  "parentId": 1020,
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "reason": null
}
```

> **Audit-by-design**: payload KHÔNG carry `reopenedAt`/`reopenedBy` — consumers derive transition timestamp từ envelope `occurredAt` (line 113) + actor từ envelope `headers.actor` per `_CONVENTIONS §2`. Same pattern as `AccountingPeriodClosed`.

| Field | Required | Description |
|---|---|---|
| `reason` | NO (optional string) | Future: lý do mở lại kỳ (audit). KHÔNG có UI field hiện tại; reserve field cho future BA enhancement (optional additive). |

**Idempotency:** Same pattern §3.1 — dedup key `{consumer-service}:{messageId}:ACCOUNTING_PERIOD_REOPENED`. Future consumers re-check authoritative state qua REST `lock-check` trước khi side-effect (defensive vs stale event).

**Critical use case (future):** RECEIPT-V2/DELIVERY-V2 consume → invalidate cache, re-enable writes cho period range; PRC consume → re-enable RECALC (BR-PRC-008 mở lại kỳ để tính lại); user phải tự chạy RECALC sau (FE-EC-4 FEAT-AP-EDIT, BR-PRC-015).

### 3.3 `SettlementDocumentSync` (DESIGN — ad-hoc 2026-08-10, ADR-031)

**Trigger**: `SettlementService` tạo phiếu quyết toán thành công (`FEAT-STL-CREATE` AC-3) **VÀ** phiếu dịch vụ gốc liên kết booking có nguồn Driver+ **VÀ** flag `Document:DriverPlus` bật.

- Nguồn "booking nguồn Driver+": 3 field `isDriverPlusSource` / `bookingCode` / `externalBookingId` trong snapshot `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement` ([`gf-sales-api.md` §3bis.2](../api/gf-sales-api.md) — additive v13). Gate emit = `isDriverPlusSource == true`. `gf-accounting` **KHÔNG** đọc DB gf-sales (boundary isolation).
- Cặp phiếu quyết toán (AC-4 — `CUSTOMER` + `INSURANCE`) emit **riêng từng phiếu**, mỗi phiếu 1 event với `documentCode` riêng.
- Trình tự: render PDF (`DocPrintService.generatePdf(SETTLEMENT)`, cùng template với `GET /api/v1/settlements/{id}/export-pdf`) → upload `ct-file-storage` `POST /api/v1/files/upload-files` (ADR-016 §Phase C) → ghi `outbox_events` **cùng transaction** với INSERT `settlement_records` (ADR-004). `OutboxProcessor` (Redis lock, poll 5s) publish.
- Upload/publish lỗi → **KHÔNG** rollback phiếu quyết toán đã tạo; outbox retry 3× rồi `FAILED` cho vận hành.

**Payload (domain `data` content)** — headers `MessageGroup=DOCUMENT`, `MessageStep=DOCUMENT.SETTLEMENT.SYNC`, `OriginTenantId={tenantId}`, `OriginMessageCode={settlementCode}`:

```json
{
  "eventId": "5c2a9e11-7d40-5b62-8f18-2b4c6d9e0a37",
  "eventType": "SettlementDocumentSync",
  "eventVersion": "1.0",
  "tenantId": 5001,
  "occurredAt": "2026-08-10T10:05:00Z",
  "source": "gf-accounting",
  "documentCode": "PQT-20260810-00013",
  "documentType": "SETTLEMENT",
  "settlementCode": "PQT-20260810-00013",
  "settlementType": "CUSTOMER",
  "relatedSettlementCode": "PQT-20260810-00014",
  "serviceOrderCode": "PDV-20260810-00042",
  "bookingCode": "LH-20260810-00007",
  "externalBookingId": "DP-BK-99001",
  "file": {
    "fileUrl": "https://files.garage.example/settlements/PQT-20260810-00013/phieu-quyet-toan.pdf",
    "fileName": "phieu-quyet-toan.pdf",
    "mimeType": "application/pdf",
    "checksum": "sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    "expiresAt": "2026-09-09T10:05:00Z"
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `eventId` | UUID | ✅ | `UUIDv5(NS_DP_DOCUMENT, documentCode + "\|" + documentType)`; **= `messageId`** — ổn định qua retry | ADR-031 D5 · AC-17 wording (`FEAT-SO-DETAIL:139`) |
| `documentCode` | String | ✅ | **Mã phiếu quyết toán** | AC-3 · `BR-STL-CRE-008` |
| `documentType` | Enum `SETTLEMENT` | ✅ | Phân biệt với `SERVICE_ORDER` — D+ giữ riêng 2 loại, không ghi đè | `BR-STL-CRE-008` |
| `settlementCode` | String | ✅ | Bằng `documentCode`; giữ tên nghiệp vụ | `KG.gf-accounting.entities.SettlementRecord.code` |
| `settlementType` | Enum `CUSTOMER \| INSURANCE` | ✅ | Bên thanh toán của phiếu | AC-4 · AC-5 |
| `relatedSettlementCode` | String | ➖ | Mã phiếu còn lại của cặp (nếu tạo theo cặp AC-4) | AC-4 ("liên kết với nhau qua mã phiếu quyết toán liên quan") |
| `serviceOrderCode` | String | ✅ | Phiếu dịch vụ gốc — D+ ghép chứng từ về cùng lần sửa chữa | AC-3 ("phiếu dịch vụ gốc") |
| `bookingCode` | String | ✅ | Lịch hẹn nguồn D+ (điều kiện emit) | AC-3 · `BR-STL-CRE-008` |
| `externalBookingId` | String | ➖ | Mã lịch hẹn phía D+ nếu có trong snapshot SO | `gf-sales-events.md` §3.8 |
| `file.fileUrl` / `fileName` / `mimeType` / `checksum` / `expiresAt` | — | ✅ | Giống hợp đồng tệp của `gf-sales` §3.10; TTL 30 ngày | ADR-031 D4 · AC-3 (tệp phiếu) |

**Idempotency**: outbox `outbox_events` (poll 5s, batch 100, retry 3×, Redis lock `gf-accounting-outbox-processor`). `eventId` deterministic → D+ dedupe. **Known limitation**: không có `revision` → phiếu sửa/xuất lại bị D+ bỏ qua (ADR-031 D5).

**Critical use case**: D+ ghi phiếu quyết toán vào hồ sơ số của xe. Emit **độc lập** với phiếu dịch vụ — không chờ đủ cả 2 loại, không ghi đè nhau (`BR-STL-CRE-008`).

---

## 4. Event Flow Diagram (ASCII)

```
SO (gf-sales)                      gf-accounting
  │  Edit: payer + 8 adjustment columns   │
  │  (FEAT-INS-SO-ADJUSTMENT)             │
  ▼                                       │
[Tạo Phiếu QT BH] ── REST /for-settlement (pull snapshot, CB-INS-002) ──►
  ▲                                       │ create settlement (INSURANCE)
  │  REST settle (CB-INS-003) ◄───────────┤
  │                                       │
  │  REST reopen (CB-INS-003) ◄───────────┤ cancel (cascade cặp)
  ▼
[SO reopened]

Widget công nợ BH (gf-sales Dashboard) ── REST /protected/v1/insurance-debt-summary ──► gf-accounting
   (CB-INS-008, ADR-015 — pull, cache TTL 5 phút)

────────────────────────────────────────────────────────────────────────────
 (DESIGN — Accounting Period, ADR-019 — PROPOSED, KHÔNG publish trong batch)

User (Chủ garage / Kế toán)
  │ FEAT-AP-EDIT đổi status (OPEN ⇄ CLOSED)
  ▼
gf-accounting AccountingPeriodController
  │ tx: UPDATE accounting_period.status + INSERT outbox_events (FUTURE)
  ▼
[outbox_events table]  ──poll 5s──►  OutboxProcessor (Redis lock)
                                         │
                                         ▼
                              Kafka topic `AC-DEV-ACCOUNTING-EVENTS`
                                         │
              ┌──────────────────────────┼─────────────────────────────┐
              ▼                          ▼                             ▼
        gf-inventory                 gf-inventory                    gf-inventory
        (RECEIPT-V2 future)          (DELIVERY-V2 future)            (PRC future)
        consume + inbox dedup        consume + inbox dedup           consume + inbox dedup
        invalidate cache             invalidate cache                gate RECALC (BR-PRC-008)
        toggle write-block           toggle write-block              toggle CREATE first calc

         ▲                           ▲                              ▲
         │                           │                              │
         └───── REST lock-check (advisory, fail-fast UX, 30s LRU cache) ─────┘
                          GET /protected/v1/accounting-periods/lock-check?date=
                          → gf-accounting AccountingPeriodLockController
                          (ACTIVE trong batch — independent of events flip)

────────────────────────────────────────────────────────────────────────────
 (DESIGN — Driver+ document sync, ADR-031 — publish thật, gate flag `Document:DriverPlus`)

Chủ garage                                   Chủ garage / Kế toán
  │ Hoàn thành phiếu DV (AC-17) / Huỷ (AC-24)  │ Tạo phiếu QT (AC-3)
  ▼                                            ▼
gf-sales                                     gf-accounting
  │ render PDF → upload ct-file-storage        │ render PDF → upload ct-file-storage
  │ tx: UPDATE SO + INSERT outbox_event        │ tx: INSERT settlement + INSERT outbox_events
  ▼                                            ▼
[outbox poll 10s]                            [outbox poll 5s, Redis lock]
  │                                            │
  └────────────────┬───────────────────────────┘
                   ▼
      Kafka topic `AC-DEV-DOCUMENT-EVENTS`  (MessageGroup=DOCUMENT)
        steps: DOCUMENT.SERVICE_ORDER.SYNC | DOCUMENT.SETTLEMENT.SYNC
               (không có step REVOKED nào — cả 2 loại phiếu, ADR-031 v6 D3)
                   │
                   ▼
             Driver Plus  ── fetch fileUrl (trước expiresAt, verify checksum) ──►
             dedupe theo eventId → ghi vào hồ sơ số của xe (FEAT-DP-046)
```

---

## 5. Forbidden patterns

- ❌ Skip outbox, gọi `kafkaTemplate.send` trực tiếp — race giữa DB commit và broker publish (ADR-004, BR-GF-ACCOUNTING-011 pattern).
- ❌ Ack Kafka message trước khi inbox idempotency guard thành công (consumer) — duplicate side effect.
- ❌ Header `OriginTenantId` ≠ `data.tenantId` — tenant integrity breach (Critical Rule #7).
- ❌ **(DESIGN — ADR-019)** Implement publish `AccountingPeriodClosed` / `AccountingPeriodReopened` trong batch — status `PROPOSED` chỉ declare contract; ACTIVE flip = future wave (RECEIPT-V2 / DELIVERY-V2 / PRC kick-off). Vi phạm = wire publish khi không có consumer = waste + drift risk (precedent: v7 đã revoke 4 insurance events vì lý do tương tự).
- ❌ **(DESIGN — ADR-019)** Breaking change PROPOSED event contract trước khi flip ACTIVE (rename event type, đổi MessageStep semantic, remove payload field, đổi field type) — phải MAJOR version bump + deprecation window (ADR-013 backward-compat). Cho phép additive optional field only.
- ❌ **(ADR-031)** Nhúng binary/base64 tệp phiếu quyết toán vào payload `DOCUMENT.*` — chỉ gửi `fileUrl` + `checksum` + `expiresAt`.
- ❌ **(ADR-031)** Sinh `eventId` mới cho cùng `(documentCode, documentType)` khi phát lại — phá dedupe phía Driver+.
- ❌ **(ADR-031)** Rollback phiếu quyết toán đã tạo khi render PDF / upload `ct-file-storage` / publish thất bại — ghi ngoại lệ cho vận hành.
- ❌ **(ADR-031)** Emit chứng từ khi SO gốc **không** có booking nguồn Driver+ (`isDriverPlusSource != true`) — rò dữ liệu garage ra ngoài phạm vi consent.
- ❌ **(ADR-031)** Đọc DB `gf-sales` để biết booking có nguồn Driver+ hay không — phải lấy từ snapshot REST `for-settlement` (`gf-sales-api.md` §3bis.2, 3 field `bookingCode`/`externalBookingId`/`isDriverPlusSource`).
- ❌ **(mandate Q8)** Thêm step `DOCUMENT.SETTLEMENT.REVOKED` khi chưa có CR + xác nhận BA về luồng hủy phiếu quyết toán.
- ❌ **(DESIGN — ADR-019)** Đổi topic name `AC-DEV-ACCOUNTING-EVENTS` hoặc đổi MessageGroup `ACCOUNTING_PERIOD_LIFECYCLE` mà không update đồng bộ `_CONVENTIONS §11` + ADR-019 — topic là contract trong _CONVENTIONS, consumer hardcode topic name.

---

## 6. References / Cross-references

- **ADRs**: ADR-004 (Kafka outbox/inbox), ADR-005 (Temporal limit 5 services), ADR-013 (additive only same major), ADR-014 (Insurance Settlement ownership + workflow no-Temporal), ADR-015 (debt-summary strategy), ADR-016 (dossier PDF+S3), **ADR-019 (Accounting Period on gf-accounting)**
- **Business rules**: BR-EP-INSURANCE-SETTLEMENT §1 (CB-INS-*), §3 (lifecycle), §7 (calculation); BR-GF-ACCOUNTING-011/013; **BR-GF-INVENTORY-ACCOUNTING-PERIOD §2.1 (BR-AP-001..016, BR-AP-CMN-001/002, CB-AP-001)** — frontmatter `boundary: gf-inventory` mismatch (OQ1)
- **Conventions**: [`_CONVENTIONS.md`](_CONVENTIONS.md) — envelope §3, partition key §4, idempotency §5, retry §7, per-boundary inventory §11
- **Cross-link**:
  - HLD: [gf-accounting-HLD.md](../hld/gf-accounting-HLD.md) §9 (Accounting Period extension)
  - API: [gf-accounting-api.md](../api/gf-accounting-api.md) §4 (Accounting Period endpoints)
  - Data model: [gf-accounting-data-model.md](../data/gf-accounting-data-model.md) §2ter (`accounting_period` entity)
  - Integration: [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md) §6 (lock-check consumer pattern)
  - BFF: [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md) §3e
  - Consumer (gf-sales) cross-link: [gf-sales-events.md](gf-sales-events.md)
- **Product**: epic EP-INSURANCE-SETTLEMENT (FEAT-INS-STL-DETAIL, FEAT-INS-DOSSIER-CREATE); **epic EP-INVENTORY-ACCOUNTING-PERIOD + 5 FEAT-AP-* + UX-FLOW-INVENTORY-ACCOUNTING-PERIOD (web-only)**
- **Driver+ document sync (ad-hoc 2026-08-10)**: [ADR-031](../decisions/ADR-031-driver-plus-document-sync.md) · [INTEG-EXT-driver-plus.md §4.3](../integrations/INTEG-EXT-driver-plus.md) · producer đối ứng [gf-sales-events.md §3.10/§3.11](gf-sales-events.md) · [gf-accounting-api.md §6.5 Naming Registry](../api/gf-accounting-api.md) · Product `FEAT-STL-CREATE` AC-3/AC-4 + `BR-STL-CRE-008` · `Tracking/arch-design-document-sync-answers-1.md`
- **Tracking**: [Tracking/arch-design-inventory-v2-answers-1.md](../../Tracking/arch-design-inventory-v2-answers-1.md) — Q4 SUPERSEDED note (boundary correction history)
- **Đã chốt (2026-05-31, Delivery Lead)**: bảng payment BH = **bảng riêng `insurance_settlement_payments` trong gf-accounting** (không reuse gf-sales — ADR-016).
- **Đã chốt F5 (2026-05-31, Delivery Lead)**: topic/MessageGroup/MessageStep insurance đã thiết kế trước đó — **revoked v7** (không có consumer thực sự). Outbox infrastructure giữ nguyên cho future use.
- **D1 micro-decision (2026-06-24, ADR-019)**: reuse topic `AC-DEV-ACCOUNTING-EVENTS` cho 2 AP events PROPOSED — conform `AC-DEV-{DOMAIN}-EVENTS` pattern; topic đã register §11 inventory; future insurance events có thể join cùng topic (alternative `AC-DEV-ACCOUNTING-PERIOD-EVENTS` rejected — proliferate topics, no precedent).

---

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-11 | v14 | **§4 diagram cosmetic fix** (per user sonhoang, cascade từ `/warm-up gf-sales` GAP-W07-GSL-02): flow diagram từng ghi step `DOCUMENT.SERVICE_ORDER.REVOKED` (chỉ gf-sales) ở cạnh 2 step SYNC — nay step đó đã bị loại bỏ hoàn toàn (ADR-031 v6 D3, premise "hủy phiếu quyết toán" không tồn tại). Sửa lại diagram: chỉ còn 2 step SYNC, dòng cuối "đánh dấu thu hồi" cũng bỏ (không còn revoke flow nào). Doc gf-accounting-events.md bản thân chưa từng khai báo REVOKED của riêng nó (đã gỡ ở v13) — đây chỉ là cross-reference cosmetic tới trạng thái gf-sales trong cùng diagram. v13 → v14. |
| 2026-08-10 | v13 | **Round 2 fix (mandate Q7 + Q8)** — (Q8) **GỠ `SettlementDocumentRevoked`**: §3.4 xoá, §2.1 row #4 xoá (còn 1 event chứng từ), §1 callout + Total events + Reliability + MessageGroup/Partition rows chỉnh số, §4 diagram bỏ step, §5 +1 forbidden. Tiền đề round 1 sai — `FEAT-STL-DETAIL` EC-7 đã bị Business Authority gỡ 2026-08-03, không có luồng hủy phiếu QT. (Q7) §3.3 Trigger + §5 forbidden nêu đích danh 3 field `bookingCode`/`externalBookingId`/`isDriverPlusSource` mà `gf-sales-api.md` §3bis.2 v13 vừa bổ sung vào `for-settlement` — đóng P0 (payload trước đó đánh `bookingCode` Required nhưng snapshot không mang được trường nào). v12 → v13. |
| 2026-08-10 | v12 | **Driver+ document sync — phiếu quyết toán (DESIGN, ADR-031)**, đóng gap BA phát hiện sau W07. `gf-accounting` trở thành **producer Driver+ đầu tiên** của boundary: §1 header callout mới + producer summary (MessageGroup `DOCUMENT`, partition key `Document-{documentCode}`, topic thứ 2 `AC-DEV-DOCUMENT-EVENTS`) · §2.1 **+2 row** (#3 `SETTLEMENT_DOCUMENT_SYNC`, #4 `SETTLEMENT_DOCUMENT_REVOKED` — DESIGN có consumer thật, khác PROPOSED của AP) · **§3.3 + §3.4 MỚI** (schema đủ 4 phần, mọi field cite Product; cặp phiếu AC-4 emit riêng từng phiếu) · §5 Forbidden +5 rule · §6 References. Tệp gửi bằng `fileUrl` + `checksum` + `expiresAt` TTL 30 ngày (resolve marker `NEED CONFIRMATION Architecture` tại `FEAT-STL-CREATE:50`); `event_id` = UUIDv5 theo mã phiếu. **KHÔNG đụng**: §3.1/§3.2 AP, §4 flow diagram AP, schema DB (tái dùng `outbox_events`, không migration — boundary dùng `ddl-auto=update`). v11 → v12. |
| 2026-07-24 | v11 | **Mechanical rename `BQGQ` → `PWA`** (thống nhất pricing-method code với convention đã ratify tại `gf-inventory-data-model.md` v14 R13, 2026-06-24, Delivery Authority feedback). Đổi mọi technical enum/code occurrence (`pricingMethod` value, compound identifiers, prose shorthand, heading text) — KHÔNG đổi business meaning/behavior/error codes khác, KHÔNG đổi mô tả tiếng Việt "Bình quân cuối kỳ", KHÔNG rename file `ADR-027-bqgq-engine-and-convergent-iteration.md` (giữ nguyên làm historical identifier — chỉ đổi title/body bên trong). |
| 2026-07-22 | v10 | **W06 arch-design PRC decision — NO events published (per ADR-028 §Alt-3 rejected event-driven)**: §1 header callout thêm bullet PRC contract = sync HTTP polling (BR-PRC-016 v29 + FEAT-PRC-DETAIL AC-2c 5s polling); event thay thế polling sẽ mất trạng thái sync GET không cần thiết. Nếu future downstream cần listener (vd trigger auto-close accounting period sau PRC succeeded) — CR-based add ACTIVE event trên topic `AC-DEV-ACCOUNTING-EVENTS` (đã reuse cho AP D1 v8). Không thêm event PROPOSED — giữ file lean. Change surface: 1 note callout. Ratify per Q2=A + Delivery Authority + SA + Backend Lead 2026-07-22. v9 → v10. |
| 2026-05-30 | v1 | Initial (NEW file) — 4 DESIGN events cho EP-INSURANCE-SETTLEMENT: `insurance-settlement-created`, `insurance-settlement-cancelled`, `insurance-payment-recorded`, `insurance-dossier-exported`. Topic `DEV-ACCOUNTING-EVENTS`, outbox/inbox + KafkaMessageWrapper (ADR-004). Reopen/debt authoritative qua REST (CB-INS-003/008), event bổ trợ. No Temporal (ADR-005). Status `config-dto-only` (chưa wire). CR-1780147390. |
| 2026-05-31 | v2 | **Resolve Open item (Delivery Lead)**: bảng payment BH = bảng riêng `insurance_settlement_payments` trong gf-accounting (không reuse gf-sales). Còn mở: topic naming + `MessageGroup`/`MessageStep` (cascade F5). |
| 2026-05-31 | v3 | **Resolve F5 (Delivery Lead)**: topic `DEV-ACCOUNTING-EVENTS` → `AC-DEV-ACCOUNTING-EVENTS` (align convention); thống nhất `MessageGroup=INSURANCE_SETTLEMENT` cả 4 event (sửa #3 PAYMENT→PAYMENT_RECORDED.1, #4 INSURANCE_DOSSIER→DOSSIER_EXPORTED.1); partition key `Settlement-{settlementCode}`; thêm §1 topic/group/partition rows. Follow-up: đăng ký topic vào `_CONVENTIONS.md §11`. |
| 2026-05-31 | v4 | **ADR renumber 4→3** (gộp ADR-015 workflow vào ADR-014): cập nhật tham chiếu — debt-summary = ADR-015, dossier PDF/S3 = ADR-016 (callout §1, §3.4, §6 ADRs list). |
| 2026-06-01 | v5 | **Đổi event payload field `insuranceCompanyId` (BIGINT id) → `insuranceCode` (string, `mdm_catalog.code`, `directory='INSURANCE'`)** trên `insurance-settlement-created` — khớp convention baseline code-based (ADR-014 v4). |
| 2026-06-02 | v6 | **Bỏ `insuranceCode`** khỏi `insurance-settlement-created` payload (§3.1): `insurance_company` baseline đã lưu mã CTBH — consumer cần tên CTBH thì gọi catalog `find-by-code`. ADR-014 v5. |
| 2026-06-03 | v7 | **Xoá 4 DESIGN events** (`insurance-settlement-created`, `insurance-settlement-cancelled`, `insurance-payment-recorded`, `insurance-dossier-exported`): không có consumer thực sự — gf-notification optional (Product không yêu cầu trong W01-W02), reopen SO qua REST (CB-INS-003), cache debt widget dùng TTL 5 phút (ADR-015). Outbox infrastructure giữ nguyên cho future use. |
| 2026-06-24 | v9 | **R3 audit-by-design payload strip (per Delivery Authority feedback 2026-06-24)**: §3.1 `AccountingPeriodClosed` payload remove `closedAt` + `closedBy` fields; §3.2 `AccountingPeriodReopened` payload remove `reopenedAt` + `reopenedBy` (keep `reason` field). Added "Audit-by-design" callout dưới mỗi event: consumers derive timestamp từ envelope `occurredAt` + actor từ envelope `headers.actor` per `_CONVENTIONS §2`. §3.2 trigger note updated — backend KHÔNG có separate `closed_at/by` + `reopened_at/by` audit cols; status transitions tracked via standard `updated_at/by` pair. Simpler model — no duplicate audit fields. v8 → v9. |
| 2026-06-24 | v8 | **+2 PROPOSED outbound events `AccountingPeriodClosed` + `AccountingPeriodReopened` (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)**. Topic `AC-DEV-ACCOUNTING-EVENTS` (reuse existing — D1; conform `AC-DEV-{DOMAIN}-EVENTS`). MessageGroup `ACCOUNTING_PERIOD_LIFECYCLE` (UPPER_SNAKE). MessageStep `CLOSED.1` / `REOPENED.1` (versioned-suffix). Partition key `AccountingPeriod-{periodCode}` (per-aggregate). Envelope `KafkaMessageWrapper`. §1 producer summary update (total 0 → 2 PROPOSED, topic/group/partition rows). §2 Catalog split §2.1 outbound (2 PROPOSED rows) + §2.2 inbound (none — insurance REST only). §3 schemas — full 4-part (Trigger/Payload/Idempotency/Critical use case) cho mỗi event. §4 Event Flow Diagram +ASCII PROPOSED future state (outbox poll 5s → topic → 3 future consumers RECEIPT-V2/DELIVERY-V2/PRC; REST lock-check ACTIVE parallel). §5 Forbidden +3 bullet (no implement publish trong batch, no breaking change PROPOSED contract, no đổi topic/group naming). §6 References +ADR-005/013/019, BR-GF-INVENTORY-ACCOUNTING-PERIOD, integration §6, data model §2ter, BFF §3e, Tracking, D1 micro-decision context. **Status PROPOSED — KHÔNG publish trong batch**. ACTIVE flip = future wave responsibility. v7 → v8. |
