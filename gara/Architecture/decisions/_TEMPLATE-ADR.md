---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "YYYY-MM-DD"
---

# ADR-{{NNN}}: {{Decision Title}} — {{qualifier ngắn / scope / phase}}

## Status
ACCEPTED — YYYY-MM-DD

<!-- Status options:
- ACCEPTED — YYYY-MM-DD
- ACCEPTED with gaps — YYYY-MM-DD (kèm danh sách gap trong Consequences)
- ACCEPTED with hardening required — YYYY-MM-DD
- SUPERSEDED by ADR-NNN — YYYY-MM-DD
- DEPRECATED — YYYY-MM-DD
-->

## Context

{{Mô tả vấn đề/tình huống dẫn tới quyết định. Cấu trúc gợi ý:}}

1. {{Câu hỏi chính cần quyết định (granularity / technology / pattern / threshold).}}
2. {{Câu hỏi phụ liên quan (số lượng, phạm vi, ownership).}}

**Constraints từ Product layer** (PRD §x.y / CR-PRD-NNN):
- {{Timeline / wave / scope constraint.}}
- {{Persona / tenant / scale constraint.}}
- {{External integration constraint.}}

**Constraints từ team / runtime:**
- {{Tech stack đã chốt — TECHSTACK §x.y.}}
- {{Team capacity / skill / ops capacity.}}
- {{Existing source evidence: file/service/config đã tồn tại.}}

**Business rules liên quan:** {{BR-CORNER-NNN, BR-XXX-NNN nếu có.}}

## Decision

**{{Quyết định chính 1-2 câu — bold, dẫn nghĩa rõ chọn cái gì + qualifier (Phase 1, threshold, scope).}}**

Cụ thể:

- **{{Khía cạnh 1 (vd: Naming / Topic / Key)}}**: {{convention cụ thể, có ví dụ.}}
- **{{Khía cạnh 2 (vd: Config / TTL / Retry)}}**: {{số liệu cụ thể (5 phút, 50M/month, p95 < 100ms).}}
- **{{Khía cạnh 3 (vd: Ownership)}}**: {{service nào own gì, cấm cái gì.}}
- **{{Khía cạnh 4 (vd: Resilience / Fallback)}}**: {{behavior khi dependency down.}}

{{Nếu quyết định có Phase trigger để re-evaluate, liệt kê threshold:}}

**Threshold để re-evaluate (Phase 2 trigger):**
- {{Metric A vượt ngưỡng X.}}
- HOẶC {{Metric B vượt ngưỡng Y.}}
- HOẶC {{Compliance/business event Z.}}

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **{{Alt 1}}** | {{Pros}} | {{Cons}} | {{Lý do reject — bám constraint hoặc evidence}} |
| **{{Alt 2}}** | {{Pros}} | {{Cons}} | {{Lý do reject}} |
| **{{Alt 3}}** | {{Pros}} | {{Cons}} | {{Lý do reject}} |

## Consequences

**Positive:**
- {{Hệ quả tốt 1 — gắn với constraint đã listed trong Context.}}
- {{Hệ quả tốt 2 — gắn với scale / latency / ownership / audit benefit.}}
- {{Hệ quả tốt 3.}}

**Negative:**
- **{{Negative 1}}** — {{mô tả.}} **Mitigation**: {{cách giải quyết hoặc trigger Phase 2.}}
- **{{Negative 2}}** — {{mô tả.}} **Mitigation**:
  - {{Mitigation step a.}}
  - {{Mitigation step b.}}
- **{{Negative 3}}** — {{mô tả.}} **Mitigation**: {{...}}

**Risks:**
- {{Risk 1 — điều kiện trigger + impact.}} **Mitigation**: {{...}}
- {{Risk 2.}} **Mitigation**: {{...}}

**Trade-off accept:** {{Đánh đổi rõ ràng — chấp nhận chi phí X (overhead, complexity, vendor lock-in) đổi lấy lợi ích Y (independent deploy, scale, audit, PCI scope reduction).}}

<!-- Optional cho ADR runtime-critical (cache / saga / cross-service flow): -->

**Test verification ({{Wave / Phase}}):**
- Test 1: {{Setup → Action → Expected outcome.}}
- Test 2: {{...}}
- Test 3: {{...}}

## References

- [TECHSTACK.md §x.y {{section title}}](../TECHSTACK.md#xy-section-anchor)
- [SYSTEM-ARCHITECTURE.md §x.y {{section title}}](../SYSTEM-ARCHITECTURE.md#xy-section-anchor)
- [Product/PRD.md §x.y {{section title}}](../../Product/PRD.md)
- {{Business Rule: BR-CORNER-NNN, BR-XXX-NNN.}}
- Related ADRs: ADR-NNN ({{tên}}), ADR-NNN ({{tên}})
- {{HLD/data/workflow/event docs liên quan: ../hld/{boundary}-HLD.md, ../events/{boundary}-events.md, ...}}
