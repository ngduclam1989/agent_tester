---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-INS-DOSSIER-VIEW.md"
source_version: 15
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-DOSSIER-VIEW"
source_feat_sha: "d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 4
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán gọi POST /insurance-dossiers/search với settlementCode → nhận danh sách bộ hồ sơ phân trang (tất cả version đã xuất), mỗi row có pdfUrl cho từng tài liệu"
consumes_contracts: []
paired_bff_feats: ["FEAT-INS-DOSSIER-VIEW"]
paired_fe_web_feats: ["FEAT-INS-DOSSIER-VIEW"]
paired_mobile_feats: ["FEAT-INS-DOSSIER-VIEW"]
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "6b792ef863798bfeaf280cfcf512725585c8164268c876c44a1d185f44f44a0a"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-VIEW.be.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
source_feat_version: 15
---

# FEAT-INS-DOSSIER-VIEW (BE): Xem danh sách bộ hồ sơ bảo hiểm đã xuất

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-VIEW` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 |
| Status | DRAFT |
| Demo signature | Kế toán gọi POST /insurance-dossiers/search với settlementCode → nhận danh sách bộ hồ sơ phân trang (tất cả version đã xuất), mỗi row có pdfUrl cho từng tài liệu |
| Cross-tier pair | BFF: FEAT-INS-DOSSIER-VIEW \| Web: FEAT-INS-DOSSIER-VIEW \| Mobile: FEAT-INS-DOSSIER-VIEW |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-VIEW` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/features/FEAT-INS-DOSSIER-VIEW.md) |
| Source version | v15 |
| Source SHA | `d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` |
| Generated at | 2026-06-18T01:05:38+00:00 |

## 1. Mục đích nghiệp vụ

Tính năng cho phép kế toán và chủ garage tra cứu toàn bộ lịch sử các bộ hồ sơ bảo hiểm đã xuất PDF gắn với một phiếu quyết toán bảo hiểm cụ thể. Mỗi bộ hồ sơ đại diện cho một lần xuất (versioning), bao gồm các file PDF riêng lẻ của từng tài liệu trong bộ. Mục tiêu là hỗ trợ truy vết lịch sử hồ sơ đã gửi cho doanh nghiệp bảo hiểm, đối chiếu khi có tranh chấp và xem hoặc tải lại PDF gốc bất kỳ lúc nào.

## 2. Trách nhiệm backend (gf-accounting)

- Expose endpoint `POST /api/v1/insurance-dossiers/search` nhận `settlementCode` + Spring Pageable params (`page`, `size`, max `size=50`, default `page=0`/`size=10`); trả response dạng `{content[], page, size, totalElements, totalPages}`.
- Query JOIN `insurance_dossier` và `insurance_dossier_document` theo `settlement_code` + `tenant_id`, sắp xếp giảm dần theo `exported_at` (bộ xuất gần nhất trước).
- Trả `pdfUrl` là relative path / object key từ ct-file-storage (không scheme, không domain) cho từng `insurance_dossier_document` — FE/Mobile nối domain config phía client.
- Enforce read-only toàn bộ: không có endpoint create/update/delete trong scope này (FEAT-INS-DOSSIER-CREATE đảm nhiệm write path).
- Enforce tenant isolation qua `TenantFilter` + filter `tenant_id` trên mọi query; enforce phân quyền role `accountant` hoặc `garage-owner`.
- Sử dụng `ddl-auto=update` (policy gf-accounting) — không cần Flyway migration mới nếu schema đã tạo bởi FEAT-INS-DOSSIER-CREATE; nếu chạy độc lập cần đảm bảo entity `InsuranceDossier` + `InsuranceDossierDocument` đã tồn tại.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Phân quyền & truy cập tab

#### AC-1 → BE cấp quyền truy cập endpoint cho role hợp lệ

- **Khi**: BFF gọi `POST /api/v1/insurance-dossiers/search`
- **BE phải**: kiểm tra JWT claims `role` (accountant hoặc garage-owner) + `tenant_id` khớp `X-Tenant-Id` header. Từ chối nếu role không hợp lệ.
- **Output**: 403 `ACCESS_DENIED` nếu role không được phép; tiếp tục xử lý nếu hợp lệ.
- **Failure mode**: 403 với error code `ACCESS_DENIED`; 401 nếu token thiếu/invalid.
- **Ref**: BR-INS-DOSSIER-VIEW-001 (§9), Critical Rule #4 + #6

#### AC-8 → BE enforce phân quyền xem per-tenant

- **Khi**: request có `settlementCode` của tenant khác hoặc token không hợp lệ
- **BE phải**: filter `WHERE tenant_id = :tenantId` trên mọi query `insurance_dossier`; không leak dossier của tenant khác kể cả khi `settlementCode` đúng.
- **Output**: nếu `settlementCode` tồn tại nhưng thuộc tenant khác → trả `content: []` (empty page) hoặc 404 tuỳ policy (khuyến nghị 200 empty để tránh enumeration).
- **Failure mode**: KHÔNG bao giờ trả dossier cross-tenant.
- **Ref**: BR-INS-DOSSIER-VIEW-008 (§9), Critical Rule #4, entity `InsuranceDossier` (§5.1)

### Cluster B — Query & phân trang danh sách bộ hồ sơ

#### AC-2 → BE trả danh sách bộ hồ sơ phân trang theo settlementCode

- **Khi**: `POST /api/v1/insurance-dossiers/search` với body `{settlementCode, page, size}`
- **BE phải**: query `insurance_dossier` WHERE `settlement_code = :settlementCode AND tenant_id = :tenantId`, ORDER BY `exported_at DESC` (tie-break `version_no DESC` để xác định trong trường hợp 2 version có cùng timestamp), áp Spring Pageable (`page`, `size` capped tại 50).
- **Output**: `{content: [DossierSummary], page, size, totalElements, totalPages}` — mỗi `DossierSummary` gồm `{id, versionNo, exportedAt, status, documents: [{documentType, pdfUrl, fileName}]}`.
- **Failure mode**: 400 `MISSING_SETTLEMENT_CODE` nếu body thiếu `settlementCode`; 400 `PAGE_SIZE_EXCEEDED` nếu `size > 50`.
- **Ref**: BR-INS-DOSSIER-009 (§9), endpoint `POST /api/v1/insurance-dossiers/search` (§6.1), entity `InsuranceDossier` (§5.1)

#### AC-7 → BE bảo toàn toàn bộ version lịch sử (không filter, không xoá)

- **Khi**: query trả về danh sách bộ hồ sơ
- **BE phải**: include ALL versions `status IN (EXPORTED, REPLACED)` — không filter bỏ bộ đã `REPLACED`. Thứ tự `exported_at DESC` (bộ xuất gần nhất hiển thị trước; tie-break `version_no DESC`).
- **Output**: tất cả version xuất hiện trong `content[]`, mỗi version có `status` field cho FE biết bộ hiện hành vs đã thay thế.
- **Failure mode**: không có — đây là read-only invariant.
- **Ref**: BR-INS-DOSSIER-009, BR-INS-DOSSIER-007 (§9)

### Cluster C — Trả pdfUrl cho tài liệu trong mỗi bộ hồ sơ

#### AC-3 → BE trả danh sách tài liệu PDF trong mỗi bộ hồ sơ

- **Khi**: JOIN `insurance_dossier_document` theo `dossier_id`
- **BE phải**: với mỗi `InsuranceDossier` trong page result, JOIN `insurance_dossier_document` WHERE `dossier_id = dossier.id`, trả `[{documentType, pdfUrl, fileName}]` — tối đa 4 tài liệu per bộ (BR-INS-DOSSIER-001).
- **Output**: field `documents[]` trong `DossierSummary`. `pdfUrl` = relative path (object key ct-file-storage, no domain, no scheme).
- **Failure mode**: nếu không có document nào → `documents: []` (bộ hồ sơ không hợp lệ — không nên xảy ra với data EXPORTED).
- **Ref**: BR-INS-DOSSIER-001, BR-INS-DOSSIER-006 (§9), entity `InsuranceDossierDocument` (§5.1)

#### AC-4 → N/A (UI-only — FE/Mobile render PDF viewer khi chọn tài liệu)

- Source AC này mô tả hành vi chọn file PDF trên giao diện để hiển thị. BE không touch — BE chỉ trả `pdfUrl`, FE/Mobile quyết định cách render. Xem `fe-web/FEAT-INS-DOSSIER-VIEW.md §3 AC-4` và `mobile/FEAT-INS-DOSSIER-VIEW.md §3 AC-4`.

#### AC-5 → BE trả pdfUrl để FE/Mobile compose download URL

- **Khi**: `pdfUrl` được trả về trong response
- **BE phải**: trả `pdfUrl` = relative path / object key (vd `settlements/bao-gia_SET-001_v2.pdf`) — KHÔNG scheme, KHÔNG domain, KHÔNG signed URL TTL. FE nối với domain config env-driven để tạo download link đầy đủ (ADR-016).
- **Output**: `pdfUrl` field trong `InsuranceDossierDocumentDto` — string relative path, persistent, không expire.
- **Failure mode**: nếu `pdf_url` column null trong DB (document chưa upload hoặc lỗi dữ liệu) → trả `pdfUrl: null` để FE biết cần xử lý EC (AC-9 flow).
- **Ref**: ADR-016, BR-INS-DOSSIER-006, BR-INS-DOSSIER-VIEW-003 (§9)

### Cluster D — Toàn bộ chế độ read-only & edge case storage

#### AC-6 → BE không expose endpoint write/delete cho dossier đã xuất

- **Khi**: bất kỳ request nào cố modify/delete `insurance_dossier` hoặc `insurance_dossier_document` ngoài write path FEAT-INS-DOSSIER-CREATE
- **BE phải**: không có endpoint update/delete trong scope này. Nếu cần guard thêm: service layer throw `UnsupportedOperationException` khi gọi delete method.
- **Output**: 405 Method Not Allowed hoặc không expose route.
- **Failure mode**: không áp dụng — không expose route.
- **Ref**: BR-INS-DOSSIER-006, BR-INS-DOSSIER-VIEW-002 (§9)

#### AC-9 → BE xử lý trường hợp pdfUrl null / storage không tiếp cận được

- **Khi**: `pdf_url` = null hoặc document row tồn tại nhưng object không có trong ct-file-storage (phát hiện ở tầng FE khi fetch URL thực sự)
- **BE phải**: trả `pdfUrl: null` trong response — KHÔNG che dấu. Không re-generate PDF tại thời điểm list (re-generate chỉ xảy ra khi user chủ động tải — thuộc flow PRINT-INS-005 recovery, không nằm trong list endpoint này).
- **Output**: `{documentType, pdfUrl: null, fileName}` — FE hiển thị trạng thái "file không khả dụng".
- **Failure mode**: 200 vẫn trả với `pdfUrl: null`; không throw 500.
- **Ref**: BR-INS-DOSSIER-VIEW-005, PRINT-INS-005 recovery note (§9)

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-INS-DOSSIER-006** (CORNERSTONE): bộ hồ sơ đã xuất là immutable — không cho sửa/xoá `insurance_dossier` hoặc `insurance_dossier_document` sau khi `status=EXPORTED`. Enforce tại `app/service/InsuranceDossierService.java`. Vi phạm → 409 `DOSSIER_IMMUTABLE`.
- **BR-INS-DOSSIER-009** (CORNERSTONE): list endpoint phải trả ALL versions (status EXPORTED + REPLACED) — không filter bỏ bất kỳ version nào. Enforce tại query layer (không có WHERE clause lọc status). Vi phạm = audit trail gap.
- **BR-INS-DOSSIER-007** (NORMAL): `version_no` tăng dần, `replaced_by_version` chain — response phải phản ánh đúng chain này (field `status` + `replacedByVersion` trong DTO). Enforce tại query projection.
- **BR-INS-DOSSIER-010** (NORMAL): phiếu QT BH trạng thái CANCEL — hồ sơ đã xuất vẫn truy cập được read-only. Endpoint list không block theo settlement status. Enforce: không có guard block trên settlement status trong list flow.
- **BR-INS-DOSSIER-011** (NORMAL): `fileName` phải khớp pattern `{slug}_{settlementCode}_v{N}.pdf` — enforce tại lúc lưu (FEAT-INS-DOSSIER-CREATE), list chỉ trả lại `file_name` đã lưu, không validate lại.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `tenant_id` trong query phải match header — Critical Rule #4.
- `POST /api/v1/insurance-dossiers/search`: yêu cầu JWT với role `accountant` hoặc `garage-owner` (Critical Rule #6 — dual persona only).
- `pdfUrl` trả về là relative path — không chứa tenant info trong URL (security: URL pattern khó đoán, tenant isolation qua header check per ADR-016).

### 4.3 Idempotency + concurrency

- Endpoint `POST /api/v1/insurance-dossiers/search` là read-only — safe, idempotent by nature.
- Không cần optimistic locking cho read flow.
- Page `size` capped cứng tại 50 tại service layer (không phụ thuộc client input) — tránh unbounded query.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `MISSING_SETTLEMENT_CODE` | 400 | AC-2 | TOAST |
| `PAGE_SIZE_EXCEEDED` | 400 | AC-2 | TOAST |
| `ACCESS_DENIED` | 403 | AC-1, AC-8 | TOAST |
| `INS_STL_NOT_FOUND` | 404 | AC-2 | EMPTY_STATE (nếu settlementCode không tồn tại) |
| `DOSSIER_IMMUTABLE` | 409 | AC-6 | TOAST (guard phòng ngừa — không expose trong view flow) |

---

## 5. Schema delta (BE — contract focus)

> gf-accounting dùng `ddl-auto=update` — schema tự sinh từ entity JPA. FEAT-INS-DOSSIER-VIEW là read-only feature: KHÔNG cần thêm column mới nếu FEAT-INS-DOSSIER-CREATE đã tạo entity. Bảng dưới mô tả các field liên quan đến read flow này.

### 5.1 Entity changes — `gf-accounting`

> Không có schema change mới. Các entity + column dưới đây được tạo bởi FEAT-INS-DOSSIER-CREATE và được đọc bởi feature này.

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `insurance_dossier` | `id` | `BIGINT` | N | auto | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-006 | AC-2, AC-7 | PK |
| `insurance_dossier` | `settlement_code` | `VARCHAR(50)` | N | — | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-009 | AC-2 | FK ref (scalar, no JPA rel — ADR-009) |
| `insurance_dossier` | `tenant_id` | `VARCHAR(100)` | N | — | ddl-auto (FEAT-CREATE) | Critical Rule #4 | AC-8 | Tenant isolation |
| `insurance_dossier` | `version_no` | `INT` | N | 1 | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-007 | AC-7 | Tăng dần per export |
| `insurance_dossier` | `status` | `VARCHAR(20)` | N | `EXPORTED` | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-007 | AC-7 | Enum: EXPORTED, REPLACED |
| `insurance_dossier` | `replaced_by_version` | `INT` | Y | null | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-007 | AC-7 | null nếu là bản hiện hành |
| `insurance_dossier` | `exported_at` | `TIMESTAMP` | N | — | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-009 | AC-2, AC-7 | Thời điểm xuất PDF — sort key chính cho list endpoint |
| `insurance_dossier_document` | `id` | `BIGINT` | N | auto | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-001 | AC-3 | PK |
| `insurance_dossier_document` | `dossier_id` | `BIGINT` | N | — | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-001 | AC-3 | FK scalar → `insurance_dossier.id` (ADR-009) |
| `insurance_dossier_document` | `document_type` | `VARCHAR(50)` | N | — | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-001 | AC-3 | Enum: QUOTATION_SHEET, SETTLEMENT_SHEET, ACCEPTANCE_RECORD, PAYMENT_AUTHORIZATION |
| `insurance_dossier_document` | `pdf_url` | `TEXT` | Y | null | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-006 | AC-3, AC-5, AC-9 | Relative path / object key (no domain) |
| `insurance_dossier_document` | `file_name` | `VARCHAR(255)` | Y | null | ddl-auto (FEAT-CREATE) | BR-INS-DOSSIER-011 | AC-3 | `{slug}_{settlementCode}_v{N}.pdf` |

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `insurance_dossier` | `idx_ins_dossier_stl_tenant` | `(settlement_code, tenant_id)` | btree | Query nhanh theo settlementCode + tenant | Critical Rule #4 |
| `insurance_dossier` | `idx_ins_dossier_exported_at` | `(settlement_code, tenant_id, exported_at DESC, version_no DESC)` | btree | ORDER BY exported_at DESC hiệu quả (tie-break version_no DESC) | BR-INS-DOSSIER-009 |

> Index này được tạo bởi FEAT-INS-DOSSIER-CREATE hoặc ddl-auto — liệt kê ở đây để agent BE verify khi implement list endpoint. **Note v3**: `idx_ins_dossier_version` đổi thành `idx_ins_dossier_exported_at` để khớp sort key mới (exported_at DESC); nếu schema đã deploy từ CREATE với index cũ thì agent BE thêm `@Index` mới (ddl-auto sẽ create, không drop index cũ — drop manual nếu muốn tiết kiệm storage).

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | BR ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v1/insurance-dossiers/search` | JWT (accountant \| garage-owner) | `{settlementCode: string, page?: int=0, size?: int=10}` | `{content: DossierSummary[], page, size, totalElements, totalPages}` | safe (read) | AC-1,2,3,5,7,8,9 | BR-INS-DOSSIER-009 |

**Request body chi tiết**:
```jsonc
{
  "settlementCode": "SET-20260530-00007",  // bắt buộc
  "page": 0,                                // optional, default=0
  "size": 10                                // optional, default=10, max=50
}
```

**Response body chi tiết**:
```jsonc
{
  "content": [
    {
      "id": 123,
      "versionNo": 2,
      "exportedAt": "2026-06-01T10:30:00+07:00",
      "status": "REPLACED",
      "replacedByVersion": 3,
      "documents": [
        {
          "documentType": "QUOTATION_SHEET",
          "pdfUrl": "settlements/bao-gia_SET-20260530-00007_v2.pdf",
          "fileName": "bao-gia_SET-20260530-00007_v2.pdf"
        },
        {
          "documentType": "SETTLEMENT_SHEET",
          "pdfUrl": "settlements/quyet-toan_SET-20260530-00007_v2.pdf",
          "fileName": "quyet-toan_SET-20260530-00007_v2.pdf"
        }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

> `pdfUrl` = relative path (object key) — KHÔNG có scheme/domain. FE/Mobile nối domain config env-driven để tạo full URL. KHÔNG có endpoint `/download` riêng (ADR-016, chốt 2026-06-17).

### 6.2 Modified REST endpoints (additive)

Không có endpoint hiện hữu bị sửa đổi trong scope FEAT-INS-DOSSIER-VIEW.

### 6.3 Kafka topics

Không publish/consume Kafka event. List operation là read-only synchronous (ADR-016: export đồng bộ, không publish event).

### 6.4 Cross-boundary REST consumers

Endpoint `POST /api/v1/insurance-dossiers/search` được consume bởi `agg-garage-graph` (BFF) khi resolve GraphQL query `listInsuranceDossiers`.

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `POST /api/v1/insurance-dossiers/search` | `agg-garage-graph` (BFF) | Khi FE/Mobile query tab "Hồ sơ bảo hiểm đã xuất" | BFF trả lỗi upstream; FE hiển thị EMPTY_STATE | Sync, BFF retry tối đa 1 lần (Resilience4j) |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-INS-DOSSIER-VIEW.md`) wrap endpoint này thành GraphQL query `listInsuranceDossiers(settlementCode, page, size)`. KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-accounting/**` (Critical Rule #1).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/model/InsuranceDossier.java` | READ (FEAT-CREATE owns write) | read entity — no change if CREATE done | ~0 | AC-2, AC-7 |
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/model/InsuranceDossierDocument.java` | READ | read entity — no change if CREATE done | ~0 | AC-3, AC-5 |
| `domain/repository` | `services/gf-accounting/src/main/java/.../domain/repository/InsuranceDossierRepository.java` | ADDITIVE | thêm `Page<InsuranceDossier> findBySettlementCodeAndTenantId(String, String, Pageable)` | ~10 | AC-2, AC-7 |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/InsuranceDossierService.java` | ADDITIVE | method `searchDossiers(request, tenantId): Page<DossierSummaryDto>` | ~50 | AC-1–AC-9 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/InsuranceDossierSearchRequest.java` | NEW | DTO request | ~15 | AC-2 |
| `app/dto` | `services/gf-accounting/src/main/java/.../app/dto/DossierSummaryDto.java` | NEW | DTO response (nested `InsuranceDossierDocumentDto`) | ~30 | AC-2, AC-3, AC-5 |
| `adapter/controller` | `services/gf-accounting/src/main/java/.../adapter/controller/InsuranceDossierController.java` | ADDITIVE | thêm `POST /api/v1/insurance-dossiers/search` endpoint | ~30 | AC-1, AC-2, AC-8 |
| `test/unit` | `services/gf-accounting/src/test/java/.../app/service/InsuranceDossierServiceTest.java` | ADDITIVE | new test methods cho search + page cap + tenant isolation | ~100 | AC-2, AC-7, AC-8, AC-9 |
| `test/contract` | `services/gf-accounting/src/test/java/.../adapter/controller/InsuranceDossierContractTest.java` | ADDITIVE | contract test cho POST /search endpoint | ~60 | AC-1, AC-2 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Verify schema (entity InsuranceDossier + InsuranceDossierDocument)
    Entry: FEAT-INS-DOSSIER-CREATE schema stable (hoặc tạo entity nếu chạy độc lập)
    Exit: entity tồn tại, index idx_ins_dossier_stl_tenant confirmed
    └─► S2

S2  Repository finder + Service logic (search + page cap + tenant filter)
    Entry: S1
    Exit: unit test ≥6 green (happy path + page cap + empty result + tenant isolation + pdfUrl null case)
    └─► S3

S3  REST adapter — POST /api/v1/insurance-dossiers/search
    Entry: S2
    Exit: contract test green (200 paginated + 400 missing param + 403 role)
    └─► S4

S4  Integration test (BFF → gf-accounting search flow)
    Entry: S3 + BFF tier S5 đang dev
    Exit: integ test green với BFF call round-trip
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify / tạo entity + index | domain/model + persistence | FEAT-CREATE schema | Entity + index xác nhận | — |
| S2 | Repository finder + service search | domain/repository + app/service | S1 | Unit test ≥6 green | S1 |
| S3 | REST adapter POST /search | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test end-to-end | test/integration | S3 + BFF endpoint | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-INS-DOSSIER-006` | CORNERSTONE | service (read guard) | `app/service/InsuranceDossierService.java` | AC-5, AC-6 | `TC-BR-accounting-006-*` |
| `BR-INS-DOSSIER-007` | NORMAL | query projection (replacedByVersion chain) | `domain/repository/InsuranceDossierRepository.java` | AC-7 | `TC-BR-accounting-007-*` |
| `BR-INS-DOSSIER-009` | CORNERSTONE | query (no status filter) | `domain/repository/InsuranceDossierRepository.java` | AC-2, AC-7 | `TC-BR-accounting-009-*` |
| `BR-INS-DOSSIER-010` | NORMAL | service (no cancel guard on list) | `app/service/InsuranceDossierService.java` | AC-2 | `TC-BR-accounting-010-*` |
| `BR-INS-DOSSIER-011` | NORMAL | read-only (fileName already persisted by CREATE) | `app/dto/DossierSummaryDto.java` | AC-3 | `TC-BR-accounting-011-*` |
| `BR-INS-DOSSIER-VIEW-001` | CORNERSTONE | controller (role check) | `adapter/controller/InsuranceDossierController.java` | AC-1, AC-8 | `TC-BR-accounting-view-001-*` |
| `BR-INS-DOSSIER-VIEW-002` | CORNERSTONE | service (no write op exposed) | `app/service/InsuranceDossierService.java` | AC-6 | `TC-BR-accounting-view-002-*` |
| `BR-INS-DOSSIER-VIEW-003` | NORMAL | dto mapping (pdfUrl relative, no domain) | `app/dto/InsuranceDossierDocumentDto.java` | AC-5 | `TC-BR-accounting-view-003-*` |
| `BR-INS-DOSSIER-VIEW-005` | NORMAL | dto mapping (pdfUrl null passthrough) | `app/dto/InsuranceDossierDocumentDto.java` | AC-9 | `TC-BR-accounting-view-005-*` |
| `BR-INS-STL-DET-004` | NORMAL | query (tenant_id filter) | `domain/repository/InsuranceDossierRepository.java` | AC-8 | `TC-BR-accounting-stldet-004-*` |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (403 role) | test-api | Verify 403 khi role sai / token thiếu |
| AC-2 | Unit (page cap) + API contract (200 paginated) | test-api | page=0, size=10 default; size=50 max; size=51 → 400 |
| AC-3 | Unit (JOIN documents) + API contract | test-api | Verify documents[] nested đúng |
| AC-4 | N/A (UI-only) | — | Xem fe-web/mobile tier |
| AC-5 | Unit (pdfUrl relative path) | test-api | Verify không có scheme/domain trong pdfUrl |
| AC-6 | API contract (405/no-route) | test-api | Verify không có DELETE/PUT endpoint |
| AC-7 | Unit (all versions returned) + Integration | test-api | Verify REPLACED status xuất hiện trong content[] |
| AC-8 | Isolation (tenant cross-check) | test-isolation | Verify không leak dossier cross-tenant |
| AC-9 | Unit (pdfUrl null passthrough) | test-api | Verify 200 với pdfUrl=null khi document chưa upload |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-DOSSIER-VIEW.md` | DRAFT | Resolver wrap `POST /api/v1/insurance-dossiers/search` thành GraphQL query `listInsuranceDossiers` |
| FE Web | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-VIEW.md` | DRAFT | UI consume BFF query; nối domain config + `pdfUrl` để tạo download URL |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-VIEW.md` | DRAFT | Flutter consume BFF query; nối domain config + `pdfUrl`; share-PDF native |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c`.

**Key contracts cho paired tier**:
- Endpoint: `POST /api/v1/insurance-dossiers/search` (§6.1) — BFF wrap thành GraphQL.
- `pdfUrl` field = relative path, không signed URL, không TTL — BFF/FE/Mobile phải nối domain.
- `status` field trong `DossierSummary` (`EXPORTED` | `REPLACED`) — FE/Mobile dùng để render visual differentiation nếu cần (secondary, BE không enforce UI).

## 12. References

- **Source**: [`Product/features/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/features/FEAT-INS-DOSSIER-VIEW.md) v15
- **Parent EP**: `EP-INSURANCE-SETTLEMENT`
- **BR refs**: `BR-INS-DOSSIER-006`, `BR-INS-DOSSIER-007`, `BR-INS-DOSSIER-009`, `BR-INS-DOSSIER-010`, `BR-INS-DOSSIER-011`, `BR-INS-DOSSIER-VIEW-001..008`, `BR-INS-STL-DET-004`, `BR-INS-STL-DET-007`
- **ADR-009**: Cấm JPA relationship mapping — scalar FK only
- **ADR-015**: gf-sales lấy số liệu công nợ BH qua REST từ gf-accounting
- **ADR-016**: pdfUrl = relative path; list paginated; KHÔNG signed URL TTL; KHÔNG endpoint /download riêng
- **HLD**: `Architecture/hld/gf-accounting-HLD.md`
- **API contract**: `Architecture/api/gf-accounting-api.md`
- **Integration**: `Architecture/integrations/INTEG-BFF-gf-accounting.md`
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6
- **PKG**: `Execution/wave-specs/W02/work-packages/PKG-W02-insurance-dossier.md`
- **Fan-out map**: `Execution/wave-specs/W02/_routing/FEAT-FAN-OUT-MAP.yaml`
- **Paired FEAT-CREATE (write path)**: `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-CREATE.md`

## Related CRs

Hiện không có CR W02 active liên quan tier này. Tham chiếu CR mobile-scoped: [CR-20260622-04](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-04--ins-dossier-view-grid-to-list), [CR-20260622-05](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-05--ins-dossier-view-t40-pdf-viewer-mode) (nếu cần parity verify).

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-INS-DOSSIER-VIEW` W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map 9 AC-IDs (AC-4 N/A UI-only), §4 ràng buộc + error code, §5 schema delta read-only (entity từ FEAT-CREATE), §6 POST /insurance-dossiers/search paginated + pdfUrl relative path (ADR-016 no signed URL, no /download), §7-§11 BE-specific (Hexagonal/DAG/BR primary/test/cross-tier). |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | Fix #18c: replace §1 bằng canonical wording byte-equal cross-tier (reviewer FAIL). §1 cũ bám góc nhìn UI-tab; §1 mới product-focused, identical với BFF/FE/Mobile tier files. |
| 2026-06-18 | 3 | Delivery Authority | Đổi sort key list endpoint từ `version_no DESC` sang `exported_at DESC` (tie-break `version_no DESC`) — §2 mô tả responsibility, §3 AC-2 query SQL, §3 AC-7 invariant thứ tự, §5.1 ghi chú cột `exported_at` là sort key chính (AC-2), §5.2 index đổi tên `idx_ins_dossier_version` → `idx_ins_dossier_exported_at` cột `(settlement_code, tenant_id, exported_at DESC, version_no DESC)`, §9 BR-INS-DOSSIER-007 enforcement layer chuyển sang "query projection" thay vì ORDER BY. Cross-tier impact: response shape KHÔNG đổi (vẫn `versionNo` + `exportedAt` + `status` + `replacedByVersion`); BFF/FE/Mobile tier KHÔNG cần regen vì chỉ hiển thị thứ tự BE trả; mention trong cross-tier note nếu FE có hardcode assertion thứ tự version. |
| 2026-06-22 | 4 | Delivery Authority | Thêm section "Related CRs" — không có CR W02 active liên quan tier BE; chỉ note tham chiếu CR mobile-scoped (CR-20260622-04, CR-20260622-05) để parity verify. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
