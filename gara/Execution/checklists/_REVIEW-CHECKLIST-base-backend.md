---
type: execution
artifact_kind: review-checklist-base
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-02"
stack: backend
---

# Review Checklist — Base (backend: 14 Java + 2 Node BFF)

> Composed source. `scripts/sync-docs-to-services.sh sync` ghép file này với
> `deltas/{boundary}.md` → `{tier}/{boundary}/.harness/_REVIEW-CHECKLIST.md`.
> Dùng bởi **agent-review-backend** (REVIEW stage) **và** DEV/FIX agent (self-check trước handoff).
> Items đánh `[BFF]` chỉ áp dụng cho agg-garage-graph / agg-sso-graph.

## Architecture & Boundaries

- [ ] R1 **Architecture compliance**: code khớp `docs/Architecture/hld/{b}-HLD.md` + `api/{b}-api.md` + `data/{b}-data-model.md`. Doc missing → skip + note, không suy diễn intent.
- [ ] R2 **Boundary isolation**: no cross-boundary writes; no direct DB cross-boundary; cross-service CHỈ qua REST hoặc Kafka (CLAUDE.md §3.2 rule 1).
- [ ] R3 **JPA**: chỉ scalar FK, KHÔNG `@ManyToOne`/`@OneToMany` cross-boundary (ADR-009); KHÔNG cascade/orphanRemoval cross-boundary.
- [ ] R4 **Hexagonal layering**: packages tuân `adapter/` + `app/` + `domain/`; domain KHÔNG depend lên app/adapter.

## State + Events

- [ ] R5 **Outbox/inbox mandatory**: state-changing events qua transactional outbox (ADR-004); consumer dedup qua inbox / `processed_events`.
- [ ] R6 **Kafka conventions**: topic `AC-DEV-{DOMAIN}-EVENTS`; `KafkaMessageWrapper` envelope; filter `headers.MessageGroup` + `headers.MessageStep` trước process; KHÔNG ack trước inbox guard.
- [ ] R7 **Temporal patterns** (chỉ 5 services: gf-sales, gf-customer, gf-marketing, gf-inventory, gf-inventory-worker): workflow ID `{domain}-{tenantId}-{aggregate_code}`; idempotent activities; worker registered trước startWorkflow.

## Tenant Isolation

- [ ] R8 **Tenant filter**: TenantFilter + TenantContext mọi service; event `OriginTenantId` match `data.tenantId` (CLAUDE.md §3.2 rule 4).
- [ ] R9 **Contacts cross-tenant exception** (gf-customer only): `contacts` table KHÔNG có tenant_id; verify access pattern không leak.

## Persistence

- [ ] R10 **Flyway evolution**: V{N+1} additive only, KHÔNG rewrite V1.
- [ ] R11 **ddl-auto exceptions** (gf-erp-mdm, gf-accounting, gf-shipment, gf-worker): KHÔNG có Flyway V1__*.sql.

## Security

- [ ] R12 **No hardcoded secrets**: env vars / Secrets Manager.
- [ ] R13 **No PII / payment / JWT in logs** (kể cả DEBUG).
- [ ] R14 **Input validation**: SQL injection prevention, length limits, type checks.
- [ ] R15 **No CORS origin=\*** in production. `[BFF]`
- [ ] R16 **PassthroughService discipline**: no persistence, no business logic — chỉ orchestration. `[BFF]`

## Tests

- [ ] R17 **Test coverage ≥ 80%**: meaningful tests, no mock-everything.
- [ ] R18 **Integration contract conformance**: `bash scripts/validate-integrations.sh` → exit 0. `[BFF]`

## Backward Compat

- [ ] R19 **No breaking changes** to published APIs / event schemas (additive only cùng major version).

---

## Severity Tiers

- **P0**: security breach, secret exposure, data loss, broken deploy, breaking change unflagged.
- **P1**: convention violation gây regression, boundary leak, missing tenant guard, outbox bypass.
- **P2**: incomplete handoff, KG out-of-sync, scope creep, missing test coverage.
- **P3**: style nit, naming, comment quality, optional refactor.

## Forbidden Actions (reviewer)

- KHÔNG code modification (read-only). KHÔNG approve nếu P0 outstanding. KHÔNG skip item.
- KHÔNG file finding không reference exact `file:line`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-02 | 1 | Delivery Authority | Externalize 19-item backend checklist từ `.agents/agent-review-backend.md` → base composable. |
