---
type: business-rules-index
artifact_kind: business-rules-index
status: ACTIVE
version: 9
tier: T1
owner_authority: Business Authority
last_reviewed: "2026-07-21"
supersedes: "none"
---

# Business Rules — Garage (Garage Care)

> Index cho toàn bộ business rules của hệ thống. Chi tiết rules theo từng boundary nằm trong `business-rules/BR-*.md`.
>
> Brownfield baseline: 9 boundary có domain business logic đã được document hoá. Các boundary còn lại (gf-shipment, gf-notification, gf-erp-agent, gf-worker, gf-inventory-worker, agg-garage-graph, agg-sso-graph, garage-web, garage-mobile) là tầng infrastructure / orchestration / presentation — rule duy nhất là bám luồng nghiệp vụ thuộc các boundary chủ.
>
> **v2 (2026-05-27)**: bổ sung BR-EP-INSURANCE-SETTLEMENT (epic-scoped, cross-boundary gf-accounting + gf-sales) cho scope mới `EP-INSURANCE-SETTLEMENT` — pattern lần đầu xuất hiện trong project (epic-scoped thay vì boundary-scoped).

---

## 1. Cornerstone Rules (Bất biến — apply toàn hệ thống)

> Bất kỳ feature, refactor, technical debt remediation nào cũng phải tuân thủ. Vi phạm = data breach hoặc data corruption.

| BR ID | Rule | Category | Affected Boundaries |
|---|---|---|---|
| BR-CORE-001 | **Multi-tenant isolation**: Mọi truy vấn và thao tác phải filter theo `tenantId`. `TenantFilter` + `TenantContext` bắt buộc ở mọi backend service. Event header `OriginTenantId` phải match `data.tenantId`. | Tenant isolation | ALL |
| BR-CORE-002 | **Dual persona only**: Toàn hệ thống chỉ có 2 actor — `garage-owner` (chủ garage) và `accountant` (kế toán). Không tạo thêm vai trò mới. Ngoại lệ phân quyền duy nhất: kế toán không có quyền vào nhóm chat theo xe (EP-SUPPORT). | Authorization | ALL |
| BR-CORE-003 | **Tiếng Việt only**: Giao diện, thông báo lỗi, copy hiển thị và nội dung tài liệu Product hoàn toàn tiếng Việt (vi-VN). Dùng đúng tên hiển thị được định nghĩa trong Knowledge Graph. | i18n / UX | ALL |
| BR-CORE-004 | **Boundary isolation**: Cross-boundary communication CHỈ qua REST API (sync) hoặc Kafka events (async). KHÔNG direct DB access cross-boundary. KHÔNG modify entities/schemas thuộc boundary khác. | Architecture | ALL |
| BR-CORE-005 | **Outbox/inbox mandatory**: State-changing events phải qua transactional outbox. Consumer phải dedup qua `inbox` table hoặc `processed_events`. Không ack Kafka message trước khi idempotency guard thành công. | Eventing | ALL backend |
| BR-CORE-006 | **KafkaMessageWrapper envelope + filter**: Consumer phải filter `headers.MessageGroup` + `headers.MessageStep` trước khi process. Không filter = process sai loại event. | Eventing | ALL backend |
| BR-CORE-007 | **JPA no cross-boundary relationship mapping**: Chỉ scalar FK, không `@ManyToOne`/`@OneToMany` cross-boundary (ADR-009). Không cascade/orphanRemoval cross-boundary. | Data integrity | ALL Java backend |
| BR-CORE-008 | **Projection ≠ master**: Boundary giữ projection của entity boundary khác (vd. `gf-sales` giữ projection customer/vehicle) chỉ được dùng read-only. KHÔNG modify projection như master data. | Data integrity | gf-sales, gf-customer, gf-erp-mdm |
| BR-CORE-009 | **Migration evolution rule**: Sau khi `V1__*.sql` đã deploy, mọi schema change phải dùng `V{N+1}__*.sql`. KHÔNG rewrite migration cũ. Ngoại lệ: gf-erp-mdm, gf-accounting, gf-shipment, gf-worker dùng `ddl-auto=update`. | Data integrity | ALL Java backend |
| BR-CORE-010 | **Temporal workflow ID deterministic**: Pattern `{domain}-{tenantId}-{aggregate_code}` — prevent duplicate starts. Activities phải idempotent. Chỉ 5 service được dùng Temporal: gf-sales, gf-customer, gf-marketing, gf-inventory, gf-inventory-worker. | Workflow | 5 Temporal services |
| BR-CORE-011 | **No PII / payment / JWT / card token logging**: Không publish sensitive data trong Kafka events, không log password / JWT / số thẻ / OTP. | Security | ALL |
| BR-CORE-012 | **External payload validation gate**: External payload (Driver+, ERP/COP, payment gateway) KHÔNG write trực tiếp vào domain tables — phải qua validation gate (gf-erp-agent hoặc adapter validator). | Security | ALL backend |
| BR-CORE-013 | **Contract additive only**: Breaking changes to published REST API / GraphQL schema / Kafka event là cấm — additive only trong cùng major version. | Backward compatibility | ALL |
| BR-CORE-014 | **AC structure Tại / Khi / Thì**: Acceptance criteria phải testable, không vague. Mọi product spec dùng cấu trúc `Tại … Khi … Thì …`. | Documentation | ALL Product docs |
| BR-CORE-015 | **Versioning 3-in-1**: Mỗi edit document → bump `version` + update `last_reviewed` + add Change Log entry. Ba việc là một bộ. | Documentation | ALL Product / Architecture docs |

## 2. Product-level Constraints (từ PRD)

> Reflect các constraint C-1..C-6 trong [PRD.md §3](PRD.md). Không thay đổi nếu không có CR CRITICAL.

| ID | Constraint | Mô tả | Verify |
|---|---|---|---|
| PC-1 | i18n vi-VN | Hệ thống vận hành 100% bằng tiếng Việt — UI, error message, copy, tài liệu | Trùng BR-CORE-003 |
| PC-2 | Dual persona | Chỉ `garage-owner` + `accountant` | Trùng BR-CORE-002 |
| PC-3 | Multi-tenant | Mỗi garage là một tenant độc lập, dữ liệu cách ly | Trùng BR-CORE-001 |
| PC-4 | Driver+ integration | Lịch hẹn từ Driver+ phải đi qua adapter (gf-erp-agent / gf-sales inbound), không write thẳng vào `booking` table | INTEG-EXT-gf-erp-agent |
| PC-5 | ERP/COP integration | Master data sản phẩm + nhà cung cấp đồng bộ từ ERP/COP qua gf-erp-agent — garage KHÔNG tự nhập sản phẩm | INTEG-EXT-gf-erp-agent, INTEG-EXT-gf-erp-mdm |
| PC-6 | Dual device | Web GMS (desktop) + App Garage (mobile) cùng hỗ trợ — feature mới mặc định cover cả 2 nền tảng trừ khi có quyết định scope-trim trong PRD/feature spec | Per-feature review |

## 3. Cross-boundary Rules (apply nhiều boundaries)

> Các cross-boundary rules cụ thể được liệt kê trong section `§1 Cross-boundary Rules` của từng file `BR-{boundary}.md`. Bảng dưới đây là index nhanh.

| Origin Boundary | Cross-boundary Rule Group | File reference |
|---|---|---|
| gf-system | CB-SYS-001..003 (tenant scoping, transporter referential integrity, BFF gateway only) | `business-rules/BR-GF-SYSTEM.md §1` |
| gf-hrms | CB-HRMS-* (employee SSO, role propagation) | `business-rules/BR-GF-HRMS.md §1` |
| gf-erp-mdm | CB-MDM-* (product/supplier sync, dynamic-data) | `business-rules/BR-GF-ERP-MDM.md §1` |
| gf-customer | CB-CUST-* (customer master vs sales projection, vehicle ownership) | `business-rules/BR-GF-CUSTOMER.md §1` |
| gf-sales | CB-SALES-* (booking → SO → settlement, walk-in auto-booking, projection sync) | `business-rules/BR-GF-SALES.md §1` |
| gf-purchase | CB-PUR-* (QR → PR → PO, supplier reference, payment-reconciliation) | `business-rules/BR-GF-PURCHASE.md §1` |
| gf-inventory | CB-INV-* (stock ↔ receipt/delivery, reservation, period-closure) | `business-rules/BR-GF-INVENTORY.md §1` |
| gf-inventory (Opening Balance V2) | CB-OB-001..002 (OB import lock-check REST advisory `gf-inventory` → `gf-accounting` V4-AP-LC; OB duy nhất/(mã+kho) chặn OB-after-transaction) | `business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md §1` |
| gf-accounting | CB-ACC-* (settlement ↔ SO, sequence numbering, document sync) | `business-rules/BR-GF-ACCOUNTING.md §1` |
| gf-accounting ↔ gf-inventory (Kỳ kế toán + BQGQ V2) | CB-AP-001 (Kỳ kế toán master ở `gf-accounting`; `gf-inventory` consume qua REST khi chặn phiếu / import OB trong kỳ đóng; PRC BQGQ ở gf-accounting đọc Sổ tồn SL + phiếu nhập/xuất từ gf-inventory) | `business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md §1` |
| gf-marketing | CB-MKT-* (campaign trigger ← customer segment, voucher redemption ↔ settlement) | `business-rules/BR-GF-MARKETING.md §1` |
| **EP-INSURANCE-SETTLEMENT** (cross-boundary) | **CB-INS-001..011** (CB-INS-007 đã gỡ) — snapshot SO mở rộng, atomic cặp QT KH+BH, tái sử dụng RecordSettlementPayment baseline, công ty BH system-seeded — garage chỉ chọn, dashboard widget công nợ BH qua REST, object storage hồ sơ BH versioning, không tích hợp 2 chiều với DN BH | `business-rules/BR-EP-INSURANCE-SETTLEMENT.md §1` |

## 4. Boundary-specific Rules

> Mỗi boundary có file BR riêng. Cấu trúc nội bộ: §1 Cross-boundary · §2..N Feature-level rules (theo từng FEAT-ID).

### Naming convention (chuẩn — áp dụng cho mọi BR file mới)

| Pattern | Khi nào dùng | Ví dụ | Note |
|---|---|---|---|
| `BR-GF-{BOUNDARY}.md` | Khi rules thuộc **1 boundary duy nhất** trong nhóm `gf-*` services (Java backend) | `BR-GF-ACCOUNTING.md`, `BR-GF-SALES.md` | Baseline pattern — 9/9 files baseline đang dùng |
| `BR-EP-{EPIC-DOMAIN}.md` | Khi rules **cross-boundary** thuộc 1 epic — viết riêng từng `BR-GF-*.md` sẽ phân mảnh khó tham chiếu | `BR-EP-INSURANCE-SETTLEMENT.md` | Pattern mới (file đầu tiên xuất hiện v2; convention formalize tại v3 — 2026-05-27). File BR-EP-* **bổ sung** cho các `BR-GF-*.md` liên quan, không thay thế |

**Quy tắc chọn pattern:**
1. Epic có scope chỉ trong **1 boundary** → dùng `BR-GF-{BOUNDARY}.md` (kế thừa BR-GF-* baseline; append section feature-level mới vào file boundary hiện có).
2. Epic có scope trải **≥2 boundary** → tạo `BR-EP-{EPIC-DOMAIN}.md` mới; nội bộ có §1 Cross-boundary rules trải đúng các boundary liên quan.
3. **KHÔNG** tạo `BR-EP-*` cho epic single-boundary — sẽ trùng lặp với `BR-GF-*` file đã có.
4. `EPIC-DOMAIN` viết kebab-case-uppercase, mô tả miền nghiệp vụ (vd `INSURANCE-SETTLEMENT`), không dùng ID epic dạng `EP-XXX`.

> Cấu trúc nội bộ của `BR-EP-*.md` đồng nhất với `BR-GF-*.md`: §1 Cross-boundary · §2 Rules Registry (grouped by FEAT) · §3 Status Transition · §4 Permission · §5 Validation · §6 Dependency · §7 Phân tích & Đề xuất · Change Log. Có thể bổ sung các section đặc thù (vd §7 Calculation Rules trong BR-EP-INSURANCE-SETTLEMENT).

| Boundary | Domain coverage | File | Status |
|---|---|---|---|
| gf-system | Transporter registry (EP-CATALOG nhóm nhà xe liên kết — 4 FEAT) | [BR-GF-SYSTEM.md](business-rules/BR-GF-SYSTEM.md) | ACTIVE |
| gf-hrms | Employee CRUD + SSO + status (EP-FOUND — 6 FEAT) | [BR-GF-HRMS.md](business-rules/BR-GF-HRMS.md) | ACTIVE |
| gf-erp-mdm | Service catalog + supplier (EP-CATALOG nhóm dịch vụ + nhà cung cấp — 6 FEAT) | [BR-GF-ERP-MDM.md](business-rules/BR-GF-ERP-MDM.md) | ACTIVE |
| gf-customer | Customer + Vehicle (EP-CUSTOMER, EP-VEHICLE — 7 FEAT) | [BR-GF-CUSTOMER.md](business-rules/BR-GF-CUSTOMER.md) | ACTIVE |
| gf-sales | Booking + Service Order + Dashboard (EP-BOOKING, EP-SERVICE-ORDER, EP-DASHBOARD — 16 FEAT) | [BR-GF-SALES.md](business-rules/BR-GF-SALES.md) | ACTIVE |
| gf-purchase | Quotation Request + Purchase Request + Purchase Order (EP-PROCUREMENT — 10 FEAT) | [BR-GF-PURCHASE.md](business-rules/BR-GF-PURCHASE.md) | ACTIVE |
| gf-inventory | Receipt + Delivery + Stock + Period (EP-INVENTORY-* — 14 FEAT) | [BR-GF-INVENTORY.md](business-rules/BR-GF-INVENTORY.md) | ACTIVE |
| gf-inventory (Catalog V2) | Nhóm vật tư hàng hóa + Mã sản phẩm nội bộ + Hub mobile "Quản lý kho hàng" (EP-INVENTORY-CATALOG — 13 FEAT gồm FEAT-INV-MOBILE-MENU) `[DRAFT/PROPOSED]` | [BR-GF-INVENTORY-CATALOG.md](business-rules/BR-GF-INVENTORY-CATALOG.md) · Hub rules `BR-INV-MENU-001..004` ở `BR-GF-INVENTORY.md §2.6` | ACTIVE |
| gf-accounting (Kỳ kế toán V2) | Kỳ kế toán (Năm→Quý→Tháng, đóng/mở) + Tính giá xuất kho BQGQ (EP-INVENTORY-ACCOUNTING-PERIOD — 10 FEAT: 5 AP + 5 PRC) `[DRAFT/PROPOSED]` | [BR-GF-INVENTORY-ACCOUNTING-PERIOD.md](business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) (tên file legacy — nội dung thuộc gf-accounting sau v25 boundary move) | ACTIVE |
| gf-inventory (Opening Balance V2) | Tồn đầu kỳ import + sửa/xóa dòng + sổ tồn ledger (EP-INVENTORY-OPENING-BALANCE — 4 FEAT) `[DRAFT/PROPOSED]` | [BR-GF-INVENTORY-OPENING-BALANCE.md](business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md) | ACTIVE |
| gf-inventory (Stock V2) | Báo cáo tồn kho đến ngày + NXT + thẻ kho (EP-INVENTORY-STOCK-V2 — 3 FEAT). **Mobile W06 chỉ `FEAT-STK-LIST-V2` qua hub tile "Tồn kho"**; NXT/thẻ kho là Web GMS only trong W06. | [BR-GF-INVENTORY-STOCK-V2.md](business-rules/BR-GF-INVENTORY-STOCK-V2.md) | ACTIVE |
| gf-accounting | Settlement (EP-SETTLEMENT — 3 FEAT) | [BR-GF-ACCOUNTING.md](business-rules/BR-GF-ACCOUNTING.md) | ACTIVE |
| gf-marketing | Campaign + Voucher + Segment (EP-MARKETING — 11 FEAT) | [BR-GF-MARKETING.md](business-rules/BR-GF-MARKETING.md) | ACTIVE |

### 4.1 Epic-scoped Rules (cross-boundary) — pattern `BR-EP-{EPIC-DOMAIN}.md`

> Áp dụng quy tắc §4 #2 (xem trên): epic cross-boundary tạo file BR riêng để tránh phân mảnh. File BR-EP-* **bổ sung** cho BR-GF-*.md baseline, không thay thế. Cấu trúc nội bộ đồng nhất với BR-GF-*.md (xem note ở §4 header).

| Epic | Domain coverage | File | Status |
|---|---|---|---|
| EP-INSURANCE-SETTLEMENT | Phân bổ quyết toán BH trên SO + panel phân bổ read-only trên màn Tạo phiếu QT + Hồ sơ BH (4 tài liệu chuẩn versioning) + Widget công nợ BH trên Dashboard — cross-boundary gf-accounting + gf-sales (6 FEAT). Danh sách công ty BH = system-seeded production. | [BR-EP-INSURANCE-SETTLEMENT.md](business-rules/BR-EP-INSURANCE-SETTLEMENT.md) | PLANNED |

## 5. Traceability Matrix

> Mapping rules → product artifacts và knowledge graphs. Dùng để kiểm tra coverage và impact analysis khi sửa rule.

| Rule scope | PRD reference | Feature reference | Knowledge Graph reference |
|---|---|---|---|
| BR-CORE-001..003 | [PRD.md §3 C-1..C-3](PRD.md#3-constraints) | ALL features | Tất cả `Execution/knowledge-graphs/*.yaml` |
| BR-CORE-004..013 | — | ALL backend features | `Architecture/SYSTEM-ARCHITECTURE.md`, ADR-004, ADR-009 |
| BR-CORE-014..015 | — | ALL Product docs | `CLAUDE.md §3.2` |
| PC-4 (Driver+) | [PRD.md §3 C-4](PRD.md#3-constraints) | EP-BOOKING (FEAT-BOOK-*) | `gf-sales.knowledge-graph.yaml` |
| PC-5 (ERP/COP) | [PRD.md §3 C-5](PRD.md#3-constraints) | EP-CATALOG, EP-PROCUREMENT | `gf-erp-mdm.knowledge-graph.yaml`, `gf-erp-agent.knowledge-graph.yaml` |
| BR-TRANS-* (gf-system) | EP-CATALOG | FEAT-CAT-TRANS-{LIST,CREATE,EDIT,DELETE} | `gf-system.knowledge-graph.yaml` |
| BR-HRMS-* | EP-FOUND | FEAT-FND-EMP-* (6 FEAT) | `gf-hrms.knowledge-graph.yaml` |
| BR-CUST-*, BR-VEH-* | EP-CUSTOMER, EP-VEHICLE | FEAT-CUST-*, FEAT-VEH-* | `gf-customer.knowledge-graph.yaml` |
| BR-BOOK-*, BR-SO-*, BR-DASH-* | EP-BOOKING, EP-SERVICE-ORDER, EP-DASHBOARD | FEAT-BOOK-*, FEAT-SO-*, FEAT-DASH-* | `gf-sales.knowledge-graph.yaml` |
| BR-STL-* | EP-SETTLEMENT | FEAT-STL-* | `gf-accounting.knowledge-graph.yaml` |
| BR-QR-*, BR-PR-*, BR-PO-* | EP-PROCUREMENT | FEAT-QR-*, FEAT-PR-*, FEAT-PO-* | `gf-purchase.knowledge-graph.yaml` |
| BR-IR-*, BR-ID-*, BR-STK-*, BR-IP-*, BR-WH-* | EP-INVENTORY-* | FEAT-IR-*, FEAT-ID-*, FEAT-STK-*, FEAT-IP-*, FEAT-WH-* | `gf-inventory.knowledge-graph.yaml` |
| BR-CAT-GRP-*, BR-CAT-PROD-*, BR-CAT-CMN-*, CB-CAT-* | EP-INVENTORY-CATALOG | FEAT-CAT-GRP-* (5), FEAT-CAT-PROD-* (7) | `gf-inventory.knowledge-graph.yaml`, `gf-erp-mdm.knowledge-graph.yaml` (ĐVT/thương hiệu master) |
| BR-INV-MENU-001..004 (Hub mobile "Quản lý kho hàng") | EP-INVENTORY-CATALOG | FEAT-INV-MOBILE-MENU | `garage-mobile.knowledge-graph.yaml`, `gf-inventory.knowledge-graph.yaml` (state matrix wave W03-W06) |
| BR-AP-001..016, BR-PRC-001..018, BR-AP-CMN-*, CB-AP-001 | EP-INVENTORY-ACCOUNTING-PERIOD | FEAT-AP-* (5: LIST/CREATE/DETAIL/EDIT/DELETE), FEAT-PRC-* (5: LIST/CREATE/DETAIL/RECALC/DELETE) | `gf-accounting.knowledge-graph.yaml` (kỳ + BQGQ master), `gf-inventory.knowledge-graph.yaml` (Sổ tồn + phiếu — cross-boundary REST read) |
| BR-OB-*, BR-OB-EDIT-*, BR-OB-DEL-*, BR-OB-LIST-*, BR-OB-IMP-*, CB-OB-001..002 | EP-INVENTORY-OPENING-BALANCE | FEAT-OB-* (4: LIST/IMPORT/EDIT/DELETE-LINES) | `gf-inventory.knowledge-graph.yaml` (OB + Sổ tồn ledger), `gf-accounting.knowledge-graph.yaml` (V4-AP-LC lock-check REST advisory) |
| BR-STKV2-001..016, CB-STKV2-001 | EP-INVENTORY-STOCK-V2 | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2; mobile W06 entry via FEAT-INV-MOBILE-MENU tile "Tồn kho" | `gf-inventory.knowledge-graph.yaml` (sổ tồn + báo cáo), `garage-mobile.knowledge-graph.yaml` (mobile hub route) |
| BR-MKT-* | EP-MARKETING | FEAT-MKT-* | `gf-marketing.knowledge-graph.yaml` |
| BR-SVC-*, BR-SUP-* | EP-CATALOG | FEAT-CAT-SVC-*, FEAT-CAT-SUP-* | `gf-erp-mdm.knowledge-graph.yaml` |
| BR-INS-SO-ADJ-*, BR-INS-STL-*, BR-INS-DOSSIER-*, BR-INS-DASH-* | [PRD.md §EP-INSURANCE-SETTLEMENT](PRD.md) | FEAT-INS-* (6 FEAT) | `gf-accounting.knowledge-graph.yaml`, `gf-sales.knowledge-graph.yaml` (cập nhật khi Architect chốt boundary) |

## 6. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-27 | 1 | Business Authority | Khởi tạo Business Rules index: 15 cornerstone rules + 6 product constraints + 9 boundary rule files (index hoá baseline đã production) |
| 2026-05-27 | 2 | Business Authority | Bổ sung BR-EP-INSURANCE-SETTLEMENT (epic-scoped, PLANNED) — pattern lần đầu xuất hiện trong project, dùng cho epic cross-boundary (gf-accounting + gf-sales) thay vì phân mảnh vào 2 file BR-GF-*.md. Thêm §4.1 "Epic-scoped Rules" và row CB-INS-001..011 vào §3 cross-boundary index. Cập nhật traceability matrix §5 với hàng cuối cho BR-INS-*. |
| 2026-05-27 | 3 | Business Authority | Formalize naming convention BR-EP-* tại §4 header (chuẩn từ v3): document 2 pattern song song `BR-GF-{BOUNDARY}.md` (boundary-scoped, baseline) và `BR-EP-{EPIC-DOMAIN}.md` (epic-scoped, cross-boundary mới). Bổ sung 4 quy tắc chọn pattern + nội bộ structure đồng nhất + extension cho section đặc thù. Không thay đổi nội dung rules — chỉ formalize convention để các BR file tương lai có chuẩn rõ ràng. |
| 2026-05-28 | 4 | Business Authority | Đồng bộ EP-INSURANCE-SETTLEMENT về **5 FEAT** (bỏ FEAT-INS-COMPANY-LIST/CREATE/EDIT + SO-PAYMENT-SOURCE + STL-CREATE): danh sách công ty BH = system-seeded production. §3 cross-boundary index (gỡ CB-INS-007 master data single source — còn 001..006/008..011), §4.1 epic registry, §5 traceability (bỏ BR-INS-SO-PS-*/BR-INS-COMPANY-*). |
| 2026-06-12 | 5 | Business Authority | Đồng bộ EP-INSURANCE-SETTLEMENT về **6 FEAT** (thêm lại FEAT-INS-STL-CREATE — CR mở rộng màn Tạo phiếu QT). §4.1 epic registry + §5 traceability (5 → 6 FEAT). Nội dung rule BR-INS-STL-CRE-009 (display panel màn tạo) đã thêm trong BR-EP v28 — index chỉ trỏ file, không liệt kê số BR chi tiết. |
| 2026-06-15 | 5 | Business Authority | **Tái lập FEAT-INS-STL-CREATE** → EP-INSURANCE-SETTLEMENT **5 → 6 FEAT**: §4.1 epic registry + §5 traceability (FEAT-INS-* 5→6 FEAT) cập nhật mô tả (thêm panel phân bổ read-only trên màn Tạo phiếu QT). BR mới BR-INS-STL-CRE-009 nằm trong nhóm BR-INS-STL-* hiện hữu (file BR-EP-INSURANCE-SETTLEMENT v28) — không đổi số file BR (10). |
| 2026-06-24 | 6 | Business Authority | **Index BR-GF-INVENTORY-CATALOG** (rà soát wave 3 — trước đó vô hình trong index tổng): §4 thêm dòng "gf-inventory (Catalog V2) — EP-INVENTORY-CATALOG 12 FEAT"; §5 Traceability thêm mapping `BR-CAT-GRP-*/BR-CAT-PROD-*/BR-CAT-CMN-*/CB-CAT-*` → EP-INVENTORY-CATALOG → FEAT-CAT-* → gf-inventory + gf-erp-mdm KG. |
| 2026-07-08 | 7 | Business Authority (quannn) + main agent | **P2-d fix index thiếu BR-AP/BR-OB/BR-INV-MENU + CB-AP-001** (audit W04 P2-d 2026-07-08). Cascade 3 nơi: (1) §3 Cross-boundary index — thêm 2 row: `gf-inventory (Opening Balance V2)` với CB-OB-001..002 (OB import lock-check REST advisory); `gf-accounting ↔ gf-inventory (Kỳ kế toán + BQGQ V2)` với CB-AP-001 (v25 mới cross-boundary sau EP boundary move); (2) §4 Boundary registry — thêm 2 row: `gf-accounting (Kỳ kế toán V2)` với BR-GF-INVENTORY-ACCOUNTING-PERIOD (tên file legacy — nội dung thuộc gf-accounting sau v25); `gf-inventory (Opening Balance V2)` với BR-GF-INVENTORY-OPENING-BALANCE; row Catalog V2 cập nhật count 12→13 (thêm FEAT-INV-MOBILE-MENU hub) + note BR-INV-MENU-* ở BR-GF-INVENTORY §2.6; (3) §5 Traceability — thêm 3 row: BR-INV-MENU-001..004 → EP-INVENTORY-CATALOG → FEAT-INV-MOBILE-MENU → garage-mobile KG; BR-AP-*/BR-PRC-*/CB-AP-001 → EP-INVENTORY-ACCOUNTING-PERIOD → FEAT-AP/PRC (5+5) → gf-accounting + gf-inventory KG; BR-OB-*/CB-OB-* → EP-INVENTORY-OPENING-BALANCE → FEAT-OB-* (4) → gf-inventory + gf-accounting KG. 4 BR file W04 (CATALOG + AP + OB + INVENTORY) giờ đều index-visible. |
| 2026-07-21 | 8 | Business Authority (user directive) | **Index Stock V2 scope guard** — thêm row `gf-inventory (Stock V2)` và traceability `BR-STKV2-001..016`; note mobile W06 chỉ `FEAT-STK-LIST-V2` qua hub tile **"Tồn kho"**, NXT/thẻ kho là Web GMS only trong W06. |
| 2026-07-21 | 9 | Business Authority (user directive) | **Sync BR index range** cho PRC: traceability range cũ → `BR-PRC-001..018` sau khi `BR-PRC-018` sort lịch sử tính giá đã được thêm ở `BR-GF-INVENTORY-ACCOUNTING-PERIOD`. |
