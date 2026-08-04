---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-18"
wave: "W02"
boundary: "agg-garage-graph"
---

# Implementation Checklist — W02 · agg-garage-graph

> Generate bởi orchestrator TRƯỚC `/spawn-dev agg-garage-graph`, từ `docs/Product/wave-02-tasks.md` +
> `Product/features/FEAT-INS-STL-CREATE.md` + `FEAT-INS-DOSSIER-CREATE.md` + `FEAT-INS-DOSSIER-VIEW.md` +
> ACs + 6 CR APPROVED (CR-20260612-01/02 + CR-20260616-01/02 + CR-20260618-01/02) +
> `INTEG-BFF-GF-ACCOUNTING-DOSSIER` + `ADR-016 v11` +
> `.harness/_REVIEW-CHECKLIST.md`. Contract chốt đầu Phase A — gate cho web + mobile FE.

## Tasks — Phase A: Settlement adjustments support (~2h)

- [x] T1 **Expose 2 cờ BFF dùng chung** (carry-over response shape, additive):
  - Cờ `soHasInsurance` ("SO có chọn Bảo hiểm"): trả trên response query mở màn Tạo phiếu QT + chi tiết phiếu QT + popup hoàn thành SO.
  - Cờ `customerStillHasInsuranceAllocation` ("KH còn phân bổ BH > 0"): tổng `Khấu trừ BH + Khấu hao + Giảm trừ`; backend (gf-accounting) compute, BFF passthrough · scope:`src/graphql/modules/insurance-settlement/insurance-settlement.{schema,resolver,types}.ts` · ac:`FEAT-INS-STL-CREATE-AC-9`,`CR-20260618-01`,`BR-INS-STL-CRE-009` · review:`R1,R3`
- [x] T2 **A5 CR-20260616-02** — response màn chi tiết QT + Tạo QT trả **giá trị từng khoản phân bổ tách theo BH và KH** (không chỉ tổng): 5 khoản × 2 giá trị (BH dấu − / KH dấu + hoặc 0) cho FE render 2 cột. Schema additive — KHÔNG rename/siết nullability op hiện hữu · scope:`src/graphql/modules/insurance-settlement/insurance-settlement.{schema,types}.ts` · ac:`CR-20260616-02`,`FEAT-INS-STL-DETAIL-AC-6` · review:`R1,R3,R4`
- [x] T3 **CR-20260612-02 support** — response endpoint hoàn thành SO trả giá trị `insurancePayment` computed + flag `negativeInsuranceWarn` cho FE/mobile render popup ERR-INS-003 · scope:`src/graphql/modules/service-order/service-order.{schema,resolver,types}.ts` · ac:`CR-20260612-02`,`BR-INS-SO-ADJ-010` · review:`R1,R3`
- [x] T4 **A1 FEAT-INS-STL-CREATE support** — extend query mở màn Tạo phiếu QT passthrough block `insuranceAdjustment` (breakdownByPayer + 5 khoản + settlementBalance) từ gf-accounting response. KHÔNG aggregate/compute ở BFF · scope:`src/graphql/modules/insurance-settlement/insurance-settlement.{schema,resolver}.ts` · ac:`FEAT-INS-STL-CREATE-AC-6`,`AC-7` · review:`R1,R2`
- [x] T5 Auth header propagation (X-Tenant-Id, X-Branch-Id, Authorization) downstream — carry-over W01; verify mới ops dossier (Phase B) propagate đúng · scope:`src/graphql/common/passthrough-service.ts`,`src/graphql/modules/insurance-settlement/**` · ac:`BR-INS-STL-CRE-001` · review:`R5,R10`

## Tasks — Phase B: Insurance Dossier orchestrator (~4h) — sau hard gate A→B

- [x] T6 **BFF orchestrator 4-phase** (per ADR-016 v11 + INTEG-BFF-GF-ACCOUNTING-DOSSIER):
  1. Resolve context — gọi gf-accounting fetch settlement snapshot + dossier metadata (state + 4 doc slot).
  2. Render parallel — 2 endpoint `render-pdf` gf-accounting song song (Phiếu QT + Phiếu báo giá) → nhận PDF bytes.
  3. Upload ct-file-storage — `POST /api/v1/files/upload-files` multipart cho 2 auto PDF + N file upload (Biên bản + Giấy ủy quyền) với `folderType=SETTLEMENTS` + tenant header → nhận `pdfUrl` object key.
  4. Batch persist — gf-accounting `POST /api/v1/insurance-dossier-documents/batch` payload `pdfUrl` cho 4 doc slot. Atomic — fail bất kỳ bước → rollback (KHÔNG persist version partial) · scope:`src/graphql/modules/insurance-dossier/insurance-dossier.resolver.ts`,`src/graphql/modules/insurance-dossier/orchestrator.ts` · ac:`FEAT-INS-DOSSIER-CREATE-AC-3,AC-4,AC-5,AC-6,AC-7,AC-8`,`ADR-016 v11` · review:`R1,R2,R5,R10`
- [x] T7 **GraphQL ops** (per ADR-016 v11 — 1 mut + 1 query):
  - Mutation `publishInsuranceDossier(input: PublishInsuranceDossierRequest!)` → orchestrator 4-phase.
  - Query `insuranceDossierVersions(settlementCode: String!)` → list bộ hồ sơ + metadata (timestamp, version, state EXPORTED/REPLACED) · scope:`src/graphql/modules/insurance-dossier/insurance-dossier.{schema,resolver,types}.ts` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1`,`FEAT-INS-DOSSIER-VIEW-AC-1,AC-2,AC-3` · review:`R1,R3,R19`
- [x] T8 **KHÔNG signed URL TTL endpoint** (ADR-016 v11): FE compose download URL bằng env `CT_FILE_STORAGE_DOMAIN` + `pdfUrl` object key. BFF KHÔNG mediate download · scope:`src/graphql/modules/insurance-dossier/**` · ac:`FEAT-INS-DOSSIER-VIEW-AC-4`,`ADR-016 v11` · review:`R2,R10`
- [x] T9 **Multipart upload size limit** align stack (nginx 50MB + agg-garage-graph 50MB + gf-accounting 50MB per PKG §3.B); preserve streaming behavior + filename + auth forwarding · scope:`src/server.ts`,`src/config/env.ts`,`src/graphql/common/multipart-handler.ts` · ac:`FEAT-INS-DOSSIER-CREATE-AC-10,AC-11`,`BR-INS-DOSSIER-007` · review:`R2,R10`
- [x] T10 **Auth + tenant header propagate** xuống ct-file-storage (cross-boundary) — tenant isolation per upload + fetch; reject request thiếu X-Tenant-Id · scope:`src/graphql/modules/insurance-dossier/orchestrator.ts`,`src/graphql/common/passthrough-service.ts` · ac:`BR-INS-DOSSIER-001`,`ADR-009` · review:`R10`
- [deferred:no-vitest-runner] T11 Contract test (nếu có Vitest); orchestrator integration test mock gf-accounting + ct-file-storage; rollback atomic verify; nếu không có test runner → báo gap trung thực, KHÔNG claim coverage · scope:`src/__tests__/insurance-dossier/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-3,AC-4,AC-5` · review:`R17`
- [x] T12 Cập nhật KG `.knowledge-graph.yaml` nếu có (2 cờ + 2-col breakdown + 1 mut + 1 query dossier + orchestrator pattern) + 3-in-1 version bump (Change Log) · scope:`.knowledge-graph.yaml`,`package.json` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1` · review:`R2,R8`

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd bffs/agg-garage-graph && npm run build && npm run typecheck && npm run lint` pass
- [ ] Passthrough-first: KHÔNG persist/business logic; endpoint qua `buildEndpoint()`/`createEndpoint()`
- [ ] Schema additive — KHÔNG breaking rename/nullability siết trên op hiện hữu
- [ ] **Hard gate A → B**: Phase A merged + stable 24h staging trước Phase B start (WAVE-SEQUENCE §1.2)
- [ ] 3-in-1 version bump trên artifact chạm (KG + Change Log)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority | Generated for W02/agg-garage-graph (3 FEAT + 6 CR APPROVED + BFF orchestrator per ADR-016 v11). Phase A ~2h + Phase B ~4h. |
