---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: erp-mdm
last_reviewed: "2026-05-07"
---

# Events - `erp-mdm` boundary

> Producer = `gf-erp-mdm`. Boundary này phụ trách vehicle/master catalog Kafka outbound, đồng thời có **2 external-source inbound** (catalog từ COP/external + PIM ingestion) — boundary owns schema mirror tại §2.2 vì external producer không có canonical doc.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-erp-mdm` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.erp_mdm.*` (planned) |
| Total events | 1 outbound + 2 external-source inbound |
| Reliability | Direct Kafka publish/consume; producer acks `all`, idempotence enabled; consumer manual ack; chưa thấy outbox/inbox/DLQ riêng trong source |
| Canonical envelope | `PimLivedMessage extends com.actechx.common.messaging.Message` cho vehicle catalog publish; inbound consumers đọc `MessagePayload` qua `KafkaMessageHandler` |

---

## 2. Catalog

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `GarageCatalogPublished` | `AC-NONPROD-DEV-MDM-VEHICLE-CATALOG` | `getOrCreateHierarchyCatalogContent(..., publish=true)` tạo hoặc sync vehicle hierarchy | External/unknown; `gf-erp-mdm` self-consumer ignore step `GARAGE.CATALOG.1` | ≤ 30s | `source-aligned-producer-only` | self-consume ignore để tránh self-loop |

### 2.2 Inbound — external-source

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 2 | `MdmCatalogInbound` | `AC-NONPROD-DEV-MDM-VEHICLE-CATALOG` | External: COP/external (steps `COP.INSURANCE.CATALOG.1`, `COP.PROVINCE.CATALOG.1`, hierarchy khác) | `MdmCatalogMessageHandler` route theo `MessageStep`; gọi `mdmService.createInsurance/createProvince/getOrCreateHierarchyCatalogContent` | ≤ 30s | `consumer-only-confirmed` | nhánh else mutate vehicle catalog nếu payload hierarchy |
| 3 | `PimInfoIngested` | `AC-NONPROD-DEV-PIM-INFO` | External: PIM info feed | `PIMInfoMessageHandler` parse `PimLivedInfoDto`, gọi REST `gf-inventory.importPIM` | ≤ 60s | `consumer-only-confirmed` | không kiểm tra `MessageStep`; không inbox dedup |


| Config key | Default topic |
|---|---|
| `kafka.topics.pim-info` | `AC-NONPROD-DEV-PIM-INFO` |
| `kafka.topics.vehicle-catalog` | `AC-NONPROD-DEV-MDM-VEHICLE-CATALOG` |
| `kafka.consumer.group-id` | `ac-nonprod-dev-pim-info-gf-cg` |

Ràng buộc consumer: `PIMInfoMessageHandler` và `MdmCatalogMessageHandler` **dùng chung** `${kafka.consumer.group-id}` = `ac-nonprod-dev-pim-info-gf-cg` dù subscribe topic khác nhau. Khi scaling hoặc tách consumer cần lưu ý.

---

## 3. Schemas

### 3.1 `GarageCatalogPublished` _(outbound)_

**Trigger**: `MdmCatalogServiceImpl.publishCatalogIfPresent(...)` được gọi sau khi tạo brand/model/year/trim.
Source call-site:
- `createHierarchyCatalogContent(...)` luôn publish sau khi tạo hierarchy.
- `getOrCreateHierarchyCatalogContent(form, publish=true)` chỉ publish khi tham số `publish=true`. PIM/external inbound dùng `publish=false` để tránh self-loop.

**Payload** (Kafka value `PimLivedMessage` + headers `MessageGroup=CATALOG`, `MessageStep=GARAGE.CATALOG.1`, `OriginTenantId={header default 0}`, `OriginMessageCode={header default "0"}`):
```json
{
  "id": "string|null (không set khi publish từ publishCatalogIfPresent)",
  "carBrand": "string",
  "carModel": "string|null",
  "yearOfManufacture": "string|null",
  "trimsLevel": "string|null"
}
```

Ràng buộc source:
- Payload publish dùng `name` của catalog entity, không dùng `code`.
- `MdmCatalogPublisher` set wrapper `source = spring.application.name` và `type = "BASIC_MESSAGE"`.

**Idempotency**:
- Producer: direct Kafka publish (không outbox); key `message.getMessageId()`. Producer config `acks=all`, idempotence enabled — broker-level dedup.
- Consumer: self-consumer `MdmCatalogMessageHandler` ignore step `GARAGE.CATALOG.1` để tránh self-loop.

**Critical use case**: Self-loop guard. Khi external/PIM publish hierarchy, dùng `publish=false`. Khi nội bộ tạo, dùng `publish=true` → external có thể subscribe để sync.

### 3.2 `MdmCatalogInbound` _(inbound external-source)_

**Producer source**: COP/external master data system.

**Trigger upstream**: External catalog message với `MessageStep` cụ thể (không document chi tiết upstream — external owns flow).

**Payload** (route theo `MessageStep`):

| `MessageStep` | Payload DTO | Hành vi |
|---|---|---|
| `GARAGE.CATALOG.1` | `HierarchyMdmCatalogForm` | Ignore (self-loop guard) |
| `COP.INSURANCE.CATALOG.1` | `MdmCatalogForm` | `mdmService.createInsurance(form)` |
| `COP.PROVINCE.CATALOG.1` | `MdmCatalogProvinceForm` | `mdmService.createProvince(form)` |
| Khác | `HierarchyMdmCatalogForm` | `mdmService.getOrCreateHierarchyCatalogContent(form, false)` |

`MdmCatalogForm`:
```json
{
  "id": 0,
  "directory": "string",
  "code": "string",
  "name": "string",
  "description": "string|null",
  "parentId": 0,
  "parentDirectory": "string|null"
}
```

`MdmCatalogProvinceForm`:
```json
{
  "directory": "string",
  "code": "string",
  "name": "string",
  "description": "string|null",
  "parentId": 0,
  "parentDirectory": "string|null",
  "parentCode": "string|null"
}
```

**Consumer logic** (`gf-erp-mdm` xử lý):
1. Consume topic `AC-NONPROD-DEV-MDM-VEHICLE-CATALOG`.
2. Lấy headers bắt buộc `MessageGroup`, `MessageStep`; `OriginTenantId`/`OriginMessageCode` optional.
3. Route theo `MessageStep` như bảng trên.
4. `acknowledgement.acknowledge()` sau `handleRawMessage(...)`.

**Idempotency**: Không có inbox/dedup table; phụ thuộc business logic `getOrCreate*` để dedup theo natural key. Rủi ro: nhánh else xử lý mọi step khác như hierarchy nên typo/future subtype có thể mutate vehicle catalog.

### 3.3 `PimInfoIngested` _(inbound external-source)_

**Producer source**: External PIM info feed.

**Trigger upstream**: External PIM publish thông tin part info.

**Payload** (top-level `PimLivedInfoDto`):
```json
{
  "pimInfo": "PimInfoDto",
  "identity": "MdmPartIdentityDto",
  "variants": "List<MdmPartIdentityDto>",
  "catalogs": "List<MdmVehicleCatalogDto>",
  "partAlias": "List<MdmPartAliasDto>",
  "suitableParts": "List<MdmSuitablePartDto>"
}
```

**Consumer logic**:
1. Consume `AC-NONPROD-DEV-PIM-INFO`.
2. Listener yêu cầu header `MessageGroup` và `MessageStep`, nhưng `handleMessage(...)` KHÔNG route theo 2 header này.
3. Parse `MessagePayload.data` thành `PimLivedInfoDto` qua `JsonUtils.toObject` (DTO có `@JsonIgnoreProperties(ignoreUnknown = true)`).
4. Gọi REST `POST ${gf-inventory.url}/protected/v1/pim-info` với form.
5. Acknowledge.

**Idempotency**: Không có inbox/dedup trong `gf-erp-mdm`; nếu Kafka redeliver hoặc REST timeout sau side effect downstream → có rủi ro gọi lại `gf-inventory`.

---

## 4. Forbidden patterns

- ❌ Mô tả vehicle catalog payload bằng field generic `vehicleCode`, `brand`, `model`, `version`; source hiện dùng `carBrand`, `carModel`, `yearOfManufacture`, `trimsLevel`.
- ❌ Gọi `GARAGE.CATALOG.1` là consumer-side mutation trong `gf-erp-mdm`; source self-consumer đang ignore step này.
- ❌ Publish vehicle catalog thiếu Kafka headers `MessageGroup` và `MessageStep`.
- ❌ Ghi external PIM payload thẳng vào master catalog tables; source hiện route PIM sang `gf-inventory` qua REST client.
- ❌ Assume có outbox, inbox hoặc DLQ ở boundary này khi source chưa có.
- ❌ Dùng MDM topic cho order/pricing payload.
- ❌ Publish `GarageCatalogPublished` mà kỳ vọng downstream có tenant thật nếu producer vẫn default `OriginTenantId=0`.
- ❌ Để `MessageStep` mới trên vehicle catalog topic rơi vào nhánh `else` nếu payload không phải hierarchy vehicle catalog; cần thêm route explicit trước khi mở rộng.
- ❌ Coi PIM consumer là filter theo `PIM.1`; source hiện không kiểm tra step trong `handleMessage(...)`.
- ❌ Log full raw PIM/catalog payload nếu payload bắt đầu chứa dữ liệu nhạy cảm hoặc dung lượng lớn.
- ❌ Tạo inbound section cho event có producer internal — chỉ dùng §2.2 cho external-source (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).

---

## 5. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Workflow files:
  - `erp-mdm-catalog-master-data-sync-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `erp-mdm` boundary: 1 outbound `GarageCatalogPublished` (`AC-NONPROD-DEV-MDM-VEHICLE-CATALOG`, `MessageGroup=CATALOG`/`MessageStep=GARAGE.CATALOG.1`) + 2 external-source inbound `MdmCatalogInbound` (steps `COP.INSURANCE.CATALOG.1`/`COP.PROVINCE.CATALOG.1`/hierarchy) và `PimInfoIngested` (`AC-NONPROD-DEV-PIM-INFO`); envelope `PimLivedMessage extends Message`; direct Kafka publish `acks=all` + idempotence; consumer ignore `GARAGE.CATALOG.1` để tránh self-loop; PIM consumer gọi REST sang `gf-inventory.importPIM`. Bao gồm producer summary, catalog split §2.1+§2.2, schemas 4-part, forbidden patterns, references. |
