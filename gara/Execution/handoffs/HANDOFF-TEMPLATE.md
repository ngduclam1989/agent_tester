---
type: execution
artifact_kind: wave-handoff
status: TEMPLATE
version: 1
tier: T4
owner_authority: Delivery Authority
supersedes: "none"
---

# Wave Handoff — Wave {{N}} → Wave {{N+1}}

> Điền template này khi Wave {{N}} hoàn thành và chuyển giao sang Wave {{N+1}}.
> Delivery Authority review và sign-off trước khi Wave {{N+1}} DEV bắt đầu.

---

## 1. Wave {{N}} Completion Summary

| Field | Value |
|---|---|
| Wave | {{N}} — {{Title}} |
| Completed | {{YYYY-MM-DD}} |
| Duration | {{actual days}} ngày (planned: {{planned days}}) |
| Final QC | PASS / FAIL |
| Bugs filed | {{count}} (P1: {{p1}}, P2: {{p2}}, P3: {{p3}}, P4: {{p4}}) |
| Bugs resolved | {{count}} |
| Regression | PASS / FAIL |
| Demo result | ACCEPTED / REJECTED |

## 2. Deliverables Produced

| Boundary | Artifacts | Status |
|---|---|---|
| `{{boundary}}` | {{source code / migrations / APIs / events / schemas / UI screens}} | DONE / PARTIAL |

## 3. Known Issues Carried Forward

> Bugs hoặc incomplete items từ Wave {{N}} phải được Wave {{N+1}} hoặc FIX agents xử lý.

| Bug ID | Severity | Description | Assigned To | Target Wave |
|---|---|---|---|---|
| — | — | — | — | — |

## 4. Dependencies Unlocked for Wave {{N+1}}

> Wave {{N}} cung cấp dependencies nào mà Wave {{N+1}} cần.

| Dependency | Provided By | Consumed By |
|---|---|---|
| {{API endpoint}} | `{{boundary}}` | `{{next boundary}}` |
| {{Kafka event}} | `{{boundary}}` | `{{next boundary}}` |
| {{GraphQL schema fragment}} | `{{bff}}` | `{{portal}}` |

## 5. Wave {{N+1}} Entry Confirmation

| # | Check | Status |
|---|---|---|
| 1 | Wave {{N}} Exit Criteria tất cả PASS | YES / NO |
| 2 | Wave {{N+1}} Work Package (`PKG-W{{N+1}}`) reviewed | YES / NO |
| 3 | DEV agents cho Wave {{N+1}} briefed | YES / NO |
| 4 | Dependencies từ Wave {{N}} available | YES / NO |
| 5 | No open P1/P2 bugs blocking Wave {{N+1}} | YES / NO |

## 6. Sign-off

| Role | Decision | Date | Notes |
|---|---|---|---|
| Delivery Authority | GO / NO-GO | {{date}} | |
| QA Authority | GO / NO-GO | {{date}} | |

---

## Change Log

| Ngày | Version | Tác giả | Thay đổi |
|---|---|---|---|
| {{date}} | 1 | Delivery Authority | Tạo handoff Wave {{N}} → {{N+1}} |
