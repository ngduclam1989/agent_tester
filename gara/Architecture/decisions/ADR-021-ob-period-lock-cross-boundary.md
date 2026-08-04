---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-07-06"
---

# ADR-021: Enforce khóa kỳ khi thao tác Tồn đầu kỳ — Tái dùng pattern REST advisory của ADR-019 (gf-inventory → gf-accounting)

## Status
ACCEPTED — 2026-07-06

## Context

`FEAT-OB-IMPORT` AC-5 + BR-OB-013 (`ERR-INV-024`), `FEAT-OB-EDIT` AC-5 + BR-OB-EDIT-002, `FEAT-OB-DELETE-LINES` AC-4 + BR-OB-DEL-002 đều yêu cầu: **chặn ghi khi "Tồn đến ngày" của dòng OB rơi vào kỳ kế toán đã CLOSED**. Master Accounting Period nằm ở `gf-accounting` per ADR-019, tức cross-boundary.

Câu hỏi chính cần quyết định:

1. **Transport để enforce** — REST sync call sang `gf-accounting`, subscribe Kafka projection (cache local), hay lai giữa 2?
2. **Timing** — advisory pre-flight (UX fail-fast), authoritative tại commit, hay cả hai?
3. **Chiến lược cache** — call fresh mỗi lần ghi, TTL cache, hay invalidation theo event?
4. **Hành vi fallback** — fail-open (cho phép khi gf-accounting down), fail-closed (chặn khi down), hay degrade xuống advisory-only?
5. **Phạm vi áp dụng** — cho cả import, edit, delete (3 write-path), hay chỉ import?

**Constraints từ Product layer** (BR-OB-013 + BR-OB-EDIT-002 + BR-OB-DEL-002; FEAT-OB-IMPORT AC-5 + FEAT-OB-EDIT AC-5 + FEAT-OB-DELETE-LINES AC-4):
- Chặn PHẢI áp ở tầng `write` — không cho phép partial-write (BR-OB-004a all-or-nothing cho import).
- Mã lỗi = `ERR-INV-024` nguyên văn trên cả 3 write-path (ERROR-CODE-REGISTRY §4 dòng 122).
- Ngày không thuộc kỳ nào (garage chưa lập kỳ) → **CHO import/edit/delete** (mệnh đề cuối của BR-OB-013) — cần phân biệt "không có kỳ nào chứa ngày này" vs "có kỳ và kỳ đó CLOSED".

**Constraints từ team / runtime:**
- ADR-019 đã đặc tả sẵn `GET /protected/v1/accounting-periods/lock-check?date={YYYY-MM-DD}` trên gf-accounting (auth S2S x-api-key) với **cache LRU 30s ở phía caller**. Advisory only — việc enforce authoritative nằm ở commit guard của caller.
- Trên topic `AC-DEV-ACCOUNTING-EVENTS` của ADR-019 các event `AccountingPeriodClosed/Reopened` chỉ ở trạng thái PROPOSED (chưa publish trong batch hiện tại); việc subscribe consumer thuộc trách nhiệm của wave sau.
- gf-inventory có Java 21 / Spring Boot / Resilience4j circuit breaker + Spring Retry (TECHSTACK §http-client).
- W04 KHÔNG được flip PROPOSED events → ACTIVE (ADR-019 §Decision C: "Flip ACTIVE = trách nhiệm của wave sau").

**Business rules liên quan:** BR-OB-013, BR-OB-EDIT-002, BR-OB-DEL-002, BR-AP-010/011/012 (trạng thái kỳ upstream), CB-OB-002 (tham chiếu cross-boundary theo ngày, cùng gf-accounting boundary sau ADR-019).

## Decision

**Áp dụng nguyên văn pattern REST advisory của ADR-019 cho cả 3 OB write-path** — `gf-inventory` đóng vai **REST consumer cross-boundary** của `gf-accounting /protected/v1/accounting-periods/lock-check`; xử lý response vừa là **advisory (UX preview) VÀ authoritative gate (commit guard)** trong W04 (không có local mirror). Kafka event projection = future wave, W04 chỉ giữ PROPOSED.

Cụ thể:

- **Transport**: Sync REST `GET /protected/v1/accounting-periods/lock-check?date={YYYY-MM-DD}` với header `x-api-key` (auth S2S). Client = Spring `RestClient` bean `gfAccountingClient` (mới — theo pattern giống `gfPurchaseClient` đã có per `gf-inventory-HLD.md` §4.2). Circuit breaker cho `gf-accounting` (Resilience4j mặc định: 50% failure rate, cửa sổ mở 60s); Spring Retry 3 lần với exponential backoff (100/200/400ms).
- **Timing** — **cả hai**:
  - **Advisory / pre-flight**: Verify-import (`POST /verify-import`) call lock-check cho mỗi ngày distinct trong file → dòng có ngày CLOSED → mark `ERR-INV-024` trong preview (chưa block cả file — user vẫn thấy dòng lỗi cụ thể).
  - **Authoritative / commit guard**: Confirm import (`POST /import`) re-check lock-check cho mỗi ngày trong batch bên trong transaction → có 1 ngày CLOSED → throw `ERR-INV-024` → rollback (BR-OB-004a all-or-nothing tự động thỏa mãn). Áp dụng tương tự cho edit (1 ngày) + delete-lines (theo từng ngày của mỗi dòng).
- **Cache**: `caffeine`/`spring-cache` LRU TTL 30s scope `(tenantId, date)` — implement local ở gf-inventory (mirror pattern caller-side của ADR-019, đã document cho gf-inventory RECEIPT-V2/DELIVERY-V2/PRC → cùng boundary gf-inventory với OB, chia sẻ chung cache). Cache invalidation: chỉ dựa TTL trong W04 (Kafka event PROPOSED trong ADR-019 sẽ flip ACTIVE ở wave sau để invalidate chủ động — không phải W04).
- **Fallback (gf-accounting down / timeout)**:
  - **Fail-CLOSED** cho commit-path (confirm import + edit + delete). Lý do: OB import ghi vào source data — cửa sổ stale 30s có thể miss trường hợp "vừa mới CLOSED" → nếu API down thì tuyệt đối không ghi (data integrity > availability cho baseline OB).
  - **Fail-OPEN kèm marker** cho verify-import: preview vẫn hiển thị các dòng dữ liệu nhưng cảnh báo "Không thể xác định trạng thái kỳ — vui lòng thử lại" — user không bấm được Confirm (button disabled) cho đến khi verify success.
  - Response `{locked: true}` HOẶC HTTP 5xx / timeout → chặn commit; response `{locked: false}` HOẶC `{locked: null, no-period-found}` → cho phép.
- **Contract response** (mirror ADR-019 §Decision C): `{locked: bool, periodId: string|null, periodCode: string, status: "OPEN"|"CLOSED", periodType: "YEAR"|"QUARTER"|"MONTH", startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD"}`. `periodId=null` → không thuộc kỳ nào → `locked=false` (theo mệnh đề "ngày không thuộc kỳ nào" của BR-OB-013).
- **Phạm vi áp dụng**: 3 write-path — verify-import, import, edit (`PUT /api/v2/opening-balances/{id}` — kiểm tra CẢ ngày cũ VÀ ngày mới per FEAT-OB-EDIT AC-5), delete (`DELETE /api/v2/opening-balances/{id}` và `POST /api/v2/opening-balances/delete-lines` — check ngày của từng dòng).
- **Idempotency**: lock-check là GET idempotent; retry an toàn.
- **Header**: pass-through `X-Tenant-Id` từ request inbound (BR-AP-015 tenant isolation — mỗi tenant có kỳ riêng).

**Threshold để re-evaluate (Phase 2 trigger):**
- p95 lock-check > 200ms → xét bump local cache TTL 30s → 60s hoặc chuyển sang pattern snapshot.
- Fail-CLOSED gây false-positive block > 0.1% commits (do network transient) → xét flip PROPOSED event sang ACTIVE + subscribe local.
- Tần suất đóng kỳ ở gf-accounting cao (> 5 events/tenant/ngày) → cần cache invalidation theo event thay vì TTL.

## Alternatives Considered

| Alternative | Ưu điểm | Nhược điểm | Tại sao không |
|---|---|---|---|
| **A1. Local mirror qua Kafka event `AccountingPeriodClosed/Reopened`** | Zero-hop latency; không phụ thuộc REST cross-boundary ở write path; ordering đảm bảo qua partition key | ADR-019 vẫn PROPOSED-not-ACTIVE trong batch — gf-accounting KHÔNG publish → mirror stale mãi mãi; flip ACTIVE = future wave (không thể làm ở W04); consumer projection = duplicate SoT vi phạm pattern "projection not master" (Critical Rule #7). | **Rejected** — phải chờ ADR-019 flip; timebox W04 không kịp; ADR-019 đã document threshold để làm khi RECEIPT-V2/DELIVERY-V2 kick off. |
| **A2. Advisory-only (không có commit guard)** | Đơn giản; giảm 1 REST call ở commit path | Không đảm bảo consistency (cửa sổ stale 30s → user ghi vào kỳ vừa CLOSED); vi phạm "chặn import" của BR-OB-013 (hard block, không phải advisory); ADR-019 §Decision C nói rõ "authoritative enforcement vẫn ở downstream backend". | **Rejected** — BR spec cứng yêu cầu block; advisory-only sẽ fail integration test. |
| **A3. Fail-OPEN cho commit khi gf-accounting down** | HA cao — OB import không bị đứng khi gf-accounting bảo trì | Phá vỡ data integrity (user ghi OB thuộc kỳ đã CLOSED — sổ tồn bị lệch); OB là baseline foundation — không thể chấp nhận wrong-write. | **Rejected** — data integrity > availability cho OB (không phải hot-path end-user, có thể retry). |
| **A4. Batch check mọi ngày trong file bằng 1 REST call `/lock-check/batch`** | Ít REST call cho file lớn (~500 dòng có thể có 30-50 ngày distinct) | ADR-019 chưa expose batch endpoint; thêm endpoint mới = update ADR-019 = out of scope W04; lợi ích latency vừa phải (30ms/call × 50 = 1.5s vs 200ms batch — chấp nhận được với parallel + cache). | **Rejected** cho W04 — parallel single-call + cache TTL đã đủ. Future revise ADR-019 nếu phát sinh vấn đề perf. |
| **A5. Bỏ hẳn period-lock — chỉ dùng check "có phiếu nhập/xuất chưa" (BR-OB-016)** | Đơn giản hóa integration | Vi phạm hard block theo kỳ CLOSED của BR-OB-013; UX sai lệch (user không hiểu vì sao bị chặn). | **Rejected** — hard requirement của BR. |

## Consequences

**Positive:**
- Không thay đổi spec ADR-019 — ADR-021 chỉ document pattern áp dụng; endpoint `/lock-check` của gf-accounting tái dùng nguyên trạng.
- Pattern check cross-boundary nhất quán: RECEIPT-V2/DELIVERY-V2/PRC ở wave sau sẽ dùng cùng client + cache (`gfAccountingClient`) — 1 điểm maintain duy nhất.
- Advisory ở verify-import + authoritative ở commit → UX fail-fast (user thấy dòng lỗi ngay) + data integrity (rollback khi race).
- Fail-CLOSED trong commit-path của OB đồng nhất với đặc điểm "OB là baseline foundation" — không phải hot end-user path.

**Negative:**
- **REST hop cho mỗi commit dòng OB** — file 500 dòng × 30 ngày distinct × 200ms = ~6s worst-case. **Mitigation**: cache 30s có hit rate > 90% khi user thao tác batch cùng ngày; fetch parallel cho các ngày distinct; đã document threshold revise ADR-019 để thêm batch endpoint.
- **Availability của gf-accounting làm chặt hơn write path của OB** — HA của OB = HA của gf-accounting. **Mitigation**: circuit breaker + retry + user có thể retry (OB import không phải hot). Fail-CLOSED là cố ý.
- **Cache stale worst-case 30s** — user vừa đóng kỳ trên UI khác, 30s sau vẫn import được. **Mitigation**: re-check authoritative ở commit guard + message UX "Kỳ vừa được đóng" (theo pattern mitigation của ADR-019).

**Risks:**
- **Race kỳ CLOSED trong cửa sổ 30s giữa verify → confirm import** (user verify pass, admin đóng kỳ, user bấm confirm) — commit guard vẫn block đúng, nhưng user confused. **Mitigation**: error message rõ "Kỳ vừa được đóng — vui lòng verify lại"; UI reset về step verify.
- **gf-accounting migrate / restart trong khi đang import file 500 dòng** — retry exponential backoff (100/200/400ms) fail hết → rollback transaction. **Mitigation**: user re-import; batch upload log persist file khi commit fail (mang tính phòng thủ; surface retry cho FEAT-OB-IMPORT ở tương lai).
- **Vòng lặp / retry vô hạn giữa 2 service** khi gf-accounting side call ngược gf-inventory. **Mitigation**: gf-accounting KHÔNG call gf-inventory cho flow lock-check (pattern consumer 1 chiều); ADR-019 §Decision C xác nhận.

**Trade-off accept:** Chấp nhận **REST latency + HA coupling** đổi lấy **tuân thủ BR-OB-013** + **tái dùng pattern ADR-019 (không phát sinh contract event mới)** + **data integrity cho baseline OB**. Việc bùng phát advisory batch call được xử lý qua cache TTL + parallel.

**Test verification (DEV Stage — W04):**
- Test 1: `verify-import` với 100 dòng, trong đó 5 dòng có ngày rơi vào kỳ CLOSED (cùng periodId), 95 dòng OK → response mark 5 rows `ERR-INV-024`; button "Xác nhận import" disabled (per BR-OB-004a all-or-nothing).
- Test 2: `verify-import` sạch → `import` → gf-accounting đóng kỳ ở giữa (race) → import call lock-check → 1 dòng CLOSED → rollback transaction → response `ERR-INV-024` + gợi ý re-verify.
- Test 3: gf-accounting trả 503 timeout → verify-import mark rows "Kỳ chưa xác định" + button disabled; user click Refresh → gf-accounting up → verify pass; import success.
- Test 4: PUT `/opening-balances/{id}` edit khi ngày cũ đã CLOSED → block `ERR-INV-024` (FEAT-OB-EDIT AC-5 + EC-8 "ngày cũ thuộc kỳ đóng chặn kể cả khi chỉ sửa SL").
- Test 5: DELETE dòng có ngày thuộc kỳ CLOSED → block `ERR-INV-024` (per BR-OB-DEL-002).
- Test 6: 2 lần verify đồng thời cùng tenant, cùng ngày `2026-03-15` → cache hit ở lần 2; latency < 20ms.

## References

- [ADR-019: Accounting Period on gf-accounting](ADR-019-accounting-period-on-gf-accounting.md) §Decision C REST lock-check ACTIVE — nguồn authoritative cho pattern
- [`Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md`](../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md) §2.1 BR-OB-013, §2.2 BR-OB-EDIT-002, §2.3 BR-OB-DEL-002
- [`Product/features/FEAT-OB-IMPORT.md`](../../Product/features/FEAT-OB-IMPORT.md) AC-5 `ERR-INV-024`; [`FEAT-OB-EDIT.md`](../../Product/features/FEAT-OB-EDIT.md) AC-5 + EC-8; [`FEAT-OB-DELETE-LINES.md`](../../Product/features/FEAT-OB-DELETE-LINES.md) AC-4
- [`Architecture/integrations/INTEG-EXT-gf-inventory.md`](../integrations/INTEG-EXT-gf-inventory.md) §13b — gf-inventory là consumer của gf-accounting lock-check (document trong batch này)
- [`Architecture/integrations/INTEG-EXT-gf-accounting.md`](../integrations/INTEG-EXT-gf-accounting.md) §6 — contract server của lock-check (đã có theo ADR-019)
- Related ADRs: ADR-004 (outbox/inbox), ADR-013 (backward-compat additive cùng major), ADR-015 (REST > CQRS precedent — debt-summary), ADR-019 (boundary AP + lock-check + PROPOSED event), ADR-020 (sổ tồn — sibling cho write-path guard W04)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-06 | 2 | Architecture Authority (agent-arch-author W04) | Dịch toàn bộ nội dung mô tả sang tiếng Việt có dấu theo yêu cầu user — không đổi quyết định/logic/số liệu, chỉ đổi ngôn ngữ trình bày. Đã dịch: §Context (câu hỏi chính + 2 khối Constraints), §Decision (bullets Transport/Timing/Cache/Fallback/Response contract/Coverage/Idempotency/Header + Threshold), §Alternatives Considered (header cột `Pros` → `Ưu điểm`, `Cons` → `Nhược điểm`; dịch nội dung 2 cột đó; cột "Tại sao không" giữ nguyên), §Consequences (Positive/Negative/Risks/Trade-off accept — giữ nguyên label in đậm tiếng Anh, chỉ dịch câu mô tả), §Test verification (6 test case). Giữ nguyên 7 heading cấu trúc, frontmatter, mọi identifier kỹ thuật (tên endpoint/class/service, mã lỗi, citation ID, path), và mọi code block. v1 → v2. |
| 2026-07-06 | 1 | Architecture Authority (agent-arch-author W04) | ADR khởi tạo — Các write-path OB (import/edit/delete) consume gf-accounting `/protected/v1/accounting-periods/lock-check` qua bean REST `gfAccountingClient`; advisory ở verify-import + authoritative ở commit; fail-CLOSED với cache LRU 30s scope `(tenantId, date)`; fetch parallel theo mỗi ngày distinct kèm circuit breaker. Không thay đổi spec ADR-019 — chỉ tái dùng pattern. Kafka event projection vẫn giữ PROPOSED theo ADR-019 §C. Đã cân nhắc 5 alternatives (local mirror, advisory-only, fail-OPEN, batch API, skip-check). Giải quyết PKG-W04 NEED CONFIRMATION #2 "period-lock enforcement on OB import". |
