---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 4
tier: T1
owner_authority: Architecture Authority
boundary: "cross-boundary (gf-sales, gf-accounting)"
last_reviewed: "2026-06-03"
---
# ADR-015: Insurance Receivable Debt — REST Debt-Summary (KHÔNG projection/CQRS cross-boundary)

## Status

ACCEPTED — 2026-06-01

## Context

`FEAT-INS-DASH-DEBT`: widget công nợ BH trên Dashboard (gf-sales UI) — 3 KPI ("Tổng phải thu BH", "Đã thu trong kỳ", "Số phiếu QT BH chờ thu") + 2 top-list (top 5 theo số tiền, top 5 theo tuổi nợ), filter kỳ (5 giá trị). Số liệu công nợ derive từ Phiếu QT BH + bản ghi thanh toán BH — **do gf-accounting sở hữu** (ADR-014). Câu hỏi: gf-sales lấy số liệu này thế nào?

**Constraints:**

- CB-INS-008: widget lấy số liệu qua REST `/protected/v1/insurance-debt-summary` — KHÔNG query DB cross-boundary.
- Critical Rule: boundary isolation — KHÔNG direct DB cross-boundary (ADR-009 không @relationship).
- "Còn phải thu BH" = `insurance_payable_amount − Σ insurance_settlement_payments` — derived, KHÔNG lưu DB (BR-EP §3.2).
- Widget realtime nhưng chấp nhận eventual consistency (không phải giao dịch tiền).

## Decision

**gf-sales lấy số liệu công nợ BH qua REST đồng bộ** `GET /protected/v1/insurance-debt-summary` **từ gf-accounting (x-api-key, tenant-scoped), KHÔNG dùng read-projection/CQRS replicate cross-boundary, KHÔNG đọc DB gf-accounting.**

- **gf-accounting** tính summary ngay khi nhận request: aggregate `settlement_records` (payerType=INSURANCE, status=DRAFT) + `insurance_settlement_payments`, filter theo `period` (5 giá trị — BR-INS-DASH-006), index `(tenant_id, payer_type, status)`. Tuổi nợ tính **từ ngày tạo Phiếu QT BH** (✅ chốt 2026-05-31 — BR-INS-DASH-004); threshold cảnh báo = **30 ngày** (cấu hình sau — MISS-INS-001).
- **gf-sales** cache kết quả ở Redis (**TTL = 5 phút** — ✅ chốt 2026-05-31, Delivery Lead). Không event eviction — TTL-only cache strategy.
- **Fallback**: gf-accounting down → render từ cache + banner "số liệu tạm"; KHÔNG block Dashboard.
- Widget UI/aggregation thuộc gf-sales; **số liệu là REST**, cache refresh chỉ qua TTL expiry (KHÔNG event eviction).

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
| --- | --- | --- | --- |
| **CQRS read-projection** (gf-accounting publish event, gf-sales build bảng công nợ local) | Đọc cực nhanh, không cross-call | Duplicate data + eventual consistency phức tạp; gf-sales phải maintain projection (như customer/vehicle — đã là gánh nặng); event-as-source-of-truth dễ drift | Over-engineering cho 1 widget; CB-INS-008 chỉ định REST; rủi ro drift số tiền |
| **Direct DB read cross-boundary** | Đơn giản | Vi phạm boundary isolation tuyệt đối | Cấm (Critical Rule #1) |
| **GraphQL BFF compose trực tiếp gf-accounting** | Không cần endpoint gf-sales | Mất khả năng cache/aggregate phía gf-sales + lệ thuộc 2 downstream cho 1 widget | Widget thuộc dashboard gf-sales; gf-sales compose hợp lý hơn |

## Consequences

**Positive:**

- Boundary isolation tuyệt đối; 1 nguồn số liệu duy nhất (gf-accounting) → không drift.
- Đơn giản; tái dùng pattern protected REST + Redis cache có sẵn.
- TTL-only cache strategy — đơn giản, không phụ thuộc event infrastructure.

**Negative:**

- **Latency phụ thuộc gf-accounting + aggregate query.** **Mitigation**: index phù hợp; cache TTL; p95 &lt; 500ms.
- **Staleness trong TTL window (5 phút).** **Mitigation**: TTL ngắn (5 phút); chấp nhận eventual (không phải giao dịch tiền).

**Risks:**

- **gf-accounting down → widget stale.** **Mitigation**: fallback cache + banner; không block.
- **Cache không scope đúng** `(tenantId, period)` **→ sai số.** **Mitigation**: cache key gồm tenant + period; forbidden pattern ghi rõ.

**Trade-off accept:** chấp nhận latency + eventual consistency (TTL 5 phút) của REST+cache → đổi lấy 1 nguồn số liệu, boundary isolation, đơn giản.

**Quyết định (✅ chốt 2026-05-31, Delivery Lead):** cache TTL = **5 phút**; tuổi nợ tính **từ ngày tạo Phiếu QT BH** (BR-INS-DASH-004); threshold cảnh báo tuổi nợ = **30 ngày** (cấu hình sau — MISS-INS-001).

## References

- Related ADRs: ADR-014 (ownership), ADR-009 (no cross-boundary relationship), ADR-007 (Redis cache)
- API: [gf-accounting-api.md §3bis.8](../api/gf-accounting-api.md), [gf-sales-api.md §3bis.3](../api/gf-sales-api.md)
- Integration: [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md)
- BR: BR-EP-INSURANCE-SETTLEMENT CB-INS-008, BR-INS-DASH-001..006, §3.2
- Change Request: `CR-1780147390`

## Change Log

| Date | Version | Author | Description |
| --- | --- | --- | --- |
| 2026-05-30 | 1 | Architecture Author (Delivery Lead) | Initial — REST debt-summary (CB-INS-008) thay CQRS/projection; Redis cache + event evict. Staged in Tracking. |
| 2026-05-31 | 2 | Delivery Lead | Resolve open questions: cache TTL = 5′; tuổi nợ từ ngày tạo Phiếu QT BH; threshold cảnh báo 30 ngày. Relocate canonical từ `Tracking/insurance-settlement-ADR-drafts.md` sau khi STATE unlock ADR path (CR-1780147390). PROPOSED — pending SA ratification (Bước 2.5). |
| 2026-06-03 | 4 | Delivery Authority | **Xoá event eviction**: bỏ `insurance-payment-recorded` → TTL-only cache 5 phút. |
| 2026-05-31 | 3 | Delivery Lead | **Renumber ADR-016 → ADR-015** (do hợp nhất ADR-015 cũ "workflow no-Temporal" vào ADR-014). Nội dung không đổi; file rename `ADR-016-…` → `ADR-015-insurance-debt-summary-strategy.md`. |
