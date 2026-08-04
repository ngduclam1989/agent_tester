---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 6
tier: T1
owner_authority: Architecture Authority
boundary: "cross-boundary (gf-accounting, gf-sales)"
last_reviewed: "2026-06-03"
---
# ADR-014: Insurance Settlement Architecture — Ownership (reuse gf-accounting, split compute/record) + Synchronous workflow (no Temporal)

## Status

ACCEPTED — 2026-06-01

> Tạo qua `CR-1780147390` (MAJOR) trong giai đoạn Pre cho `EP-INSURANCE-SETTLEMENT` (5 features, P1, post-baseline). Quyết định nền cho HLD/API/data/events/integration của Insurance Settlement. Boundary ownership do Architecture quyết định (BR-EP §9.2 "Architecture Level").

## Context

`EP-INSURANCE-SETTLEMENT` bổ sung năng lực quyết toán bảo hiểm: phân bổ Nguồn TT per dòng SO, 5 khoản điều chỉnh BH, **Phiếu QT BH** (cặp atomic với phiếu QT khách hàng), **Hồ sơ BH** (bộ 4 tài liệu, versioning, xuất PDF), **đối soát thanh toán BH** nhiều đợt, và **widget công nợ BH** trên Dashboard.

**Câu hỏi cần quyết định:**

1. Module Phiếu QT BH + Hồ sơ BH + đối soát thanh toán BH đặt ở boundary nào — tái dùng `gf-accounting`, hay tạo boundary thứ 19 `gf-insurance`?
2. Phần tính toán (5 khoản điều chỉnh, BH/KH thanh toán theo "Cộng sau VAT" per payer) thuộc `gf-sales` hay `gf-accounting`?
3. Ranh giới ghi nhận công nợ + nguồn số liệu widget Dashboard thuộc boundary nào?
4. Luồng xử lý (tạo QT → lập/xuất Hồ sơ → ghi nhận thanh toán nhiều đợt → huỷ/tạo lại) orchestrate bằng **Temporal durable workflow** hay **synchronous REST + event-driven (outbox)**?

**Constraints từ Product layer** (EP-INSURANCE-SETTLEMENT §10, BR-EP §1, §6):

- P1 post-baseline .
- CB-INS-002: tạo Phiếu QT BH ⇒ gf-accounting gọi REST gf-sales lấy snapshot SO (Nguồn TT + 5 điều chỉnh). Thông tin CTBH đã có trong `insurance_company` baseline.
- CB-INS-003: tạo/huỷ Phiếu QT BH ⇒ callback gf-sales settle/reopen SO.
- CB-INS-004: Phiếu QT BH ↔ phiếu QT khách hàng atomic qua `relatedSettlementId`.
- CB-INS-005: ghi nhận thanh toán BH **tái sử dụng** FEAT-STL-DETAIL baseline.
- CB-INS-008: widget công nợ BH lấy số liệu qua REST `/protected/v1/insurance-debt-summary` — không query DB cross-boundary.

**Constraints từ team / runtime (source evidence):**

- `gf-accounting` đã sở hữu **settlement pair** CUSTOMER+INSURANCE (`settlement_records.settlement_type` + `related_settlement_code` bidirectional), pair-cancel enforced (BR-GF-ACCOUNTING-002/005), printing (common-printing HTML/PDF/PNG, `SettlementPrintDataBuilder` filter theo payer — BR-GF-ACCOUNTING-012), `tenant_sequences` code-gen `SET-yyyyMMdd-00001`, document sync (`settlement_documents.document_url` identity).
- `gf-sales` đã sở hữu **SO line payer** (`service_order_item.payer`, `service_order_part.payer` ∈ CUSTOMER/INSURANCE), `has_insurance`/`insurance_amount`/`customer_amount`, dashboard realtime (Redis cache), và protected endpoint `/for-settlement` + `/settle` + `/reopen-from-settled` (đã phục vụ gf-accounting).
- gf-accounting dùng `ddl-auto=update` (no Flyway DDL), KHÔNG Temporal — phù hợp aggregate đơn giản, flow synchronous.
- ADR-005: chỉ **5 service** dùng Temporal (gf-sales, gf-customer, gf-marketing, gf-inventory, gf-inventory-worker); gf-accounting **KHÔNG** trong danh sách (Gotcha #7). Mọi bước đều **đồng bộ do người dùng kích hoạt** — không có long-running timer/wait-for-signal; CB-INS-011: không integration 2 chiều realtime với DN BH.

**Business rules liên quan:** BR-GF-ACCOUNTING-001..013 (settlement), BR-GF-SALES-005/014/016, BR-EP §1 CB-INS-\*, BR-EP §7 (calculation).

## Decision

**Tái dùng** `gf-accounting` **làm boundary chủ cho Phiếu QT BH + Hồ sơ BH + đối soát thanh toán BH. KHÔNG tạo boundary mới** `gf-insurance`**. Tách trách nhiệm compute (gf-sales) ↔ record (gf-accounting) theo đường ranh giới SO-master vs Settlement-master.**

Cụ thể:

- **Ownership gf-accounting (record/settlement master)**:
  - Phiếu QT BH = mở rộng aggregate `settlement_records` (settlement_type=INSURANCE) — tái dùng pair model + code-gen + printing.
  - Hồ sơ BH = aggregate mới `insurance_dossiers` + `insurance_dossier_documents` (4 tài liệu, versioning immutable, PDF → S3 — ADR-016).
  - Đối soát thanh toán BH = `insurance_settlement_payments` (tái dùng cơ chế record-payment baseline — CB-INS-005).
  - Nguồn số liệu công nợ BH = gf-accounting → expose `GET /protected/v1/insurance-debt-summary` (ADR-015).
- **Ownership gf-sales (SO master / compute)**:
  - Nguồn TT per dòng + 5 khoản điều chỉnh BH nhập trên SO Edit/Detail (KHÔNG Create — BR-INS-SO-PS-006).
  - Tính BH/KH thanh toán theo "Cộng sau VAT" per payer (BR-EP §7.2) — số liệu sống của SO.
  - Snapshot provider: extend `/protected/v1/service-orders/{tenantId}/{id}/for-settlement` trả 8 scalar breakdown fields + 8 scalar adjustment fields (additive, flat — không nested JSON). Thông tin CTBH từ `insurance_company` baseline — KHÔNG thêm field `insuranceCode`.
  - Widget Dashboard: aggregation/UI gọi REST gf-accounting debt-summary (CB-INS-008).
- **Đường ranh giới**: số liệu **sống/tính toán** thuộc SO (gf-sales); số liệu **đóng băng/đối soát/chứng từ** thuộc settlement (gf-accounting). Snapshot immutable tại thời điểm tạo Phiếu QT BH (CB-INS-002).
- **Master DN BH**: system-seeded platform-wide (CB-INS-006). **✅ Chốt 2026-05-31 (Delivery Lead); refine 2026-06-02:** master ở **gf-erp-mdm catalog**, phân loại `directory='INSURANCE'`. gf-sales **đã lưu mã CTBH** trong `insurance_company` (VARCHAR baseline, v.d. `INS_BSH`) — **KHÔNG thêm cột mới** `insurance_code`. gf-accounting lấy thông tin CTBH qua REST `for-settlement` — không lưu `insurance_code`/`insurance_company_name` riêng. Dropdown nạp qua contract catalog sẵn có (`searchCatalog` / `POST /api/v1/catalog/inquiry` / `find-by-code`) — KHÔNG cần op mới.

**Workflow execution model — synchronous REST + event-driven (outbox), KHÔNG Temporal** (hợp nhất từ ADR-015 cũ):

- **Tạo Phiếu QT BH**: 1 transaction synchronous — REST `for-settlement` (snapshot scalar columns) → persist cặp settlement (atomic, CB-INS-004) → REST `settle` (CB-INS-003) → done. Rollback nếu bất kỳ bước nào fail.
- **Huỷ**: synchronous cascade cặp + REST `reopen-from-settled` → done. Chặn nếu đã có payment.
- **Lập/xuất Hồ sơ BH + ghi nhận thanh toán**: synchronous. Không có bước chờ external (CB-INS-011). Không publish event.
- **Reliability**: Lỗi cross-boundary REST settle sau persist → rollback transaction (KHÔNG cần saga/Temporal). Debt authoritative qua REST; cache TTL 5 phút (ADR-015).

**Threshold để re-evaluate (tách gf-insurance ở tương lai):**

- Khi BH có integration 2 chiều realtime với hệ thống DN BH (gửi claim API / nhận phê duyệt) — hiện out-of-scope (CB-INS-011, PRD OS-4).
- HOẶC khi domain BH phình &gt; 3 aggregate độc lập + cần ownership team riêng.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
| --- | --- | --- | --- |
| **Boundary mới** `gf-insurance` **(thứ 19)** | Domain sạch, ownership rõ, scale độc lập | Phải dựng lại outbox/inbox/sequence/printing/tenant filter từ đầu; thêm 1 service vào landscape (ADR-001); nhiều ADR + cập nhật SERVICE-BOUNDARY-MATRIX; duplicate settlement pair logic | Chi phí cao cho P1 brownfield; vi phạm nguyên tắc "ưu tiên update artifact có sẵn"; không có driver scale/ownership riêng |
| **Toàn bộ trong** `gf-sales` | 1 boundary, không cross-call khi tạo QT | gf-sales đã rất nặng (booking+SO+quotation+projection+dashboard+Temporal); phá ranh giới settlement-master của gf-accounting; duplicate code-gen/printing | Phá boundary isolation; gf-accounting đã là settlement SoT |
| **Tách compute sang gf-accounting (gọi ngược gf-sales lấy line)** | Settlement tự tính | gf-accounting phải hiểu business tính giá SO (thuế/CK per line) — không thuộc domain kế toán; BR-GF-ACCOUNTING-006 cấm compute amount server-side | Vi phạm "amount nhận từ request"; SO là master số liệu dòng |
| **Temporal workflow cho settlement** (thay vì sync+outbox) | Durable retry, visibility, saga compensation | gf-accounting phải onboard Temporal (worker/task queue/SDK) — vi phạm ADR-005 (chỉ 5 service); over-engineering cho flow ngắn synchronous; thêm vận hành | ADR-005 loại gf-accounting; không có long-running wait justify durability |

## Consequences

**Positive:**

- Tái dùng tối đa settlement pair + printing + code-gen + document sync → giảm rủi ro + thời gian.
- Boundary isolation giữ nguyên: cross-boundary chỉ REST (CB-INS-002/003/008).
- Không tăng số service trong landscape (ADR-001).
- Ranh giới compute/record khớp BR-GF-ACCOUNTING-006 (amount từ request, không tự tính).
- Workflow synchronous nhất quán ADR-005 (gf-accounting không Temporal); pair atomicity bằng DB transaction (CB-INS-004) — không cần saga.

**Negative:**

- **gf-accounting phình thêm 2 aggregate + S3 dependency.** **Mitigation**: aggregate độc lập; S3 qua signed URL (ADR-016).
- **Không có durable retry cho cross-boundary REST settle.** **Mitigation**: REST settle idempotent theo `settlementCode`; fail → rollback + người dùng retry thủ công (flow do người dùng kích hoạt). Open item: dead-letter cho settle-fail hiếm.
- **Cross-boundary round-trip khi tạo Phiếu QT BH.** **Mitigation**: 1 REST call synchronous đã là pattern hiện hữu; snapshot immutable nên chỉ 1 lần.
- **Governance gap ddl-auto vs Flyway lan sang bảng mới.** **Mitigation**: chấp nhận ddl-auto=update nhất quán (ADR-006 exception).

**Risks:**

- **Snapshot drift** khi SO sửa sau tạo QT. **Mitigation**: snapshot immutable; flow sửa = huỷ QT (cascade) + sửa SO + tạo lại (Open Question CNF-INS-003).
- **Debt-summary latency.** **Mitigation**: ADR-015 cache TTL + index `(tenant_id, payer_type, status)`.

**Trade-off accept:** gf-accounting nặng thêm + 1 cross-boundary snapshot call → đổi lấy tái dùng settlement infra + giữ boundary isolation + không tăng service count.

## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [Product/epics/EP-INSURANCE-SETTLEMENT.md](../../Product/epics/EP-INSURANCE-SETTLEMENT.md) §3, §6, §10
- [Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md](../../Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md) §1, §7
- HLDs: [gf-accounting-HLD.md §8](../hld/gf-accounting-HLD.md), [gf-sales-HLD.md §8](../hld/gf-sales-HLD.md)
- Data models: [gf-accounting-data-model.md §2bis](../data/gf-accounting-data-model.md), [gf-sales-data-model.md §2bis](../data/gf-sales-data-model.md)
- Integration: [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md), [INTEG-EXT-gf-sales.md](../integrations/INTEG-EXT-gf-sales.md)
- Events: [gf-accounting-events.md](../events/gf-accounting-events.md)
- Related ADRs: ADR-001, ADR-004 (Kafka outbox/inbox), ADR-005 (Temporal — 5 service), ADR-006, ADR-009, ADR-015 (debt-summary), ADR-016 (dossier PDF/S3)
- Change Request: `CR-1780147390`

## Change Log

| Date | Version | Author | Description |
| --- | --- | --- | --- |
| 2026-05-30 | 1 | Architecture Author (Delivery Lead) | Initial draft — reuse gf-accounting (no gf-insurance) + tách compute(gf-sales)/record(gf-accounting). Staged in Tracking (ADR path locked). |
| 2026-05-31 | 2 | Delivery Lead | Resolve master DN BH location = gf-erp-mdm catalog (`directory='INSURANCE_COMPANY'`, dùng `searchCatalog`/`catalog/inquiry` sẵn có). Relocate canonical từ `Tracking/insurance-settlement-ADR-drafts.md` sau khi STATE unlock ADR path (CR-1780147390). PROPOSED — pending SA ratification (Bước 2.5). |
| 2026-05-31 | 3 | Delivery Lead | **Hợp nhất ADR-015 cũ (workflow synchronous + no Temporal) vào ADR này** (giảm 4→3 ADR). Thêm Context Q4, mục Decision "Workflow execution model", alternative Temporal, consequence. Renumber còn lại: debt-summary = ADR-015, dossier PDF/S3 = ADR-016. |
| 2026-06-01 | 4 | Delivery Lead | **Đổi tham chiếu công ty BH:** `insurance_company_id` **(FK** `mdm_catalog.id`**) →** `insurance_code` **(FK** `mdm_catalog.code`**);** `directory='INSURANCE_COMPANY'` **→** `INSURANCE`**.** Lý do: khớp convention baseline đã production (agg-garage-graph tham chiếu DN BH bằng code + enrich tên qua `catalog/find-by-code`, BR-AGG-GARAGE-GRAPH-001). Snapshot đổi "id+tên"→"code+tên" (`insurance_company_name` snapshot giữ nguyên). Cập nhật Decision + CB-INS-002 snapshot field. Đồng bộ data-model/api/event/integration (Architecture) + PKG-W01 (Execution) + BR-EP/FEAT-INS-DASH-DEBT (Product). Refinement trong CR-1780147390 (ADR còn PROPOSED). |
| 2026-06-03 | 6 | Delivery Authority | **Xoá event publish + flatten JSONB**: bỏ 4 outbox event steps khỏi workflow (REST-only); snapshot schema → scalar columns thay JSONB. |
| 2026-06-02 | 5 | Delivery Authority | **Bỏ `insurance_code` + `insurance_company_name`**: gf-sales `insurance_company` (VARCHAR baseline) đã lưu mã CTBH (v.d. `INS_BSH`) — KHÔNG phải free-text như data-model v1.2 giả định. gf-accounting lấy thông tin CTBH qua REST `for-settlement` — không cần lưu riêng. Sửa Decision §Ownership (bỏ `insurance_code` scalar FK), CB-INS-002 (bỏ `insuranceCode` snapshot), Snapshot provider (bỏ `insuranceCode` additive). Đồng bộ 8 downstream docs. |
