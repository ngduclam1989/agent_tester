---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-18"
wave: "W02"
boundary: "garage-web"
---

# Implementation Checklist — W02 · garage-web

> Generate bởi orchestrator TRƯỚC `/spawn-dev garage-web`, từ `docs/Product/wave-02-tasks.md` +
> `Product/features/FEAT-INS-STL-CREATE.md` + `FEAT-INS-DOSSIER-CREATE.md` + `FEAT-INS-DOSSIER-VIEW.md` +
> ACs + 6 CR APPROVED (CR-20260612-01/02 + CR-20260616-01/02 + CR-20260618-01/02) +
> 8 Figma DEV spec synced `docs/Product/ux/figma-web/wave02-*.md` +
> `.harness/_REVIEW-CHECKLIST.md`. **2 phase tuần tự A → B** (~16h).

## Tasks — Phase A: Settlement create + CR adjustments (~6h)

- [x] T1 **Reuse-first/inventory gate** — reuse `<InsuranceSettlementDetailPanel>` từ W01; CHỈ extend cho per-payer 2 cột (KHÔNG dựng panel mới). Search KG `implementation.components` + `src/components/{share,ui,customs}` theo functional keyword · scope:`src/features/insurance-settlement/components/**`,`src/components/customs/insurance-*/**` · ac:`FEAT-INS-STL-CREATE-AC-6`,`BR-INS-STL-CRE-009` · review:`R1,D1`
- [x] T2 **CR-20260616-02** — panel "Tổng giá dịch vụ" reflow khối "Phân bổ Bảo hiểm" + "Cần thanh toán" 1 cột → **2 cột (BH | KH)** trên 3 màn: SO Edit (Figma `13354-57960`) + SO Detail (Figma `13354-58368`) + Tạo phiếu QT (Figma `13535-159225`). Mỗi khoản dấu +/− đúng cột, dóng thẳng theo Figma. Display-only · scope:`src/features/insurance-settlement/components/InsuranceSettlementDetailPanel/**`,`src/routes/service-order/{$code}.tsx`,`src/routes/settlement-voucher/create.tsx` · ac:`CR-20260616-02`,`FEAT-INS-STL-DETAIL-AC-6` · review:`R3,R6,D2`
- [x] T3 **CR-20260618-01** — render phiếu QT KH "chỉ phân bổ BH" layout mới (3 khoản dấu +, KHÔNG dòng dịch vụ/phụ tùng) theo Figma `13906-29632`. FE đọc cờ `customerStillHasInsuranceAllocation` từ BFF để decide layout. KHÔNG dùng layout phiếu QT KH baseline · scope:`src/routes/settlement-voucher/$code.tsx`,`src/features/insurance-settlement/components/CustomerOnlyAllocationLayout/**` · ac:`CR-20260618-01`,`BR-INS-STL-CRE-008` · review:`R3,R6,D2`
- [x] T4 **FEAT-INS-STL-CREATE** — panel "Tổng giá dịch vụ" read-only 3 khối trên màn xác nhận Tạo phiếu QT — **reuse component panel W01** (`<InsuranceSettlementDetailPanel>` mode read-only), hiển thị có điều kiện theo SO có/không BH (BR-INS-STL-CRE-009). KHÔNG dựng component mới · scope:`src/routes/settlement-voucher/create.tsx`,`src/features/insurance-settlement/components/InsuranceSettlementDetailPanel/**` · ac:`FEAT-INS-STL-CREATE-AC-6,AC-7`,`BR-INS-STL-CRE-009` · review:`R1,R3,D1`
- [x] T5 Wire GraphQL: extend `insuranceAdjustment` block (breakdownByPayer + 5 khoản adjustments + settlementBalance) từ query mở màn tạo phiếu QT; consume cờ `soHasInsurance` + `customerStillHasInsuranceAllocation` từ BFF response · scope:`src/hooks/use-query.ts`,`src/features/insurance-settlement/hooks/useInsuranceSettlement.ts`,`src/features/insurance-settlement/graphql/**` · ac:`FEAT-INS-STL-CREATE-AC-6,AC-9` · review:`R4,R19`
- [x] T6 **Conditional matrix verify** (carry-over W01 retro BUG-W01-025/026/027): walk `(BH=Có|Không) × (SO Create|Edit|Detail) × tab` cho panel 2 cột. Off-state phải ẨN body + chip "Bảo hiểm" + summary row. Capture screenshot vào `.claude/checklists/ui-state-matrix.md` · scope:`.claude/checklists/ui-state-matrix.md` · ac:`CR-20260616-02`,`BR-INS-STL-CRE-009` · review:`R3,D2`
- [x] T7 **Testid coverage** (PKG §3.C.1) — wire data-testid theo W02 cluster: `panel-allocation-2col`, `row-alloc-{ck-vat-tu,ck-cong-dv,giam-tru,khau-hao,khau-tru}` × 2 col, `panel-can-thanh-toan`, `dialog-hoan-thanh-pdv`, `warning-err-ins-003`. Coverage ≥ 95% theo matrix · scope:`src/features/insurance-settlement/components/**`,`src/features/service-order/components/**` · ac:`PKG-W02 §3.C.1`,`§3.C.4` · review:`R3,R17`

## Tasks — Phase B: Insurance Dossier (~10h) — sau hard gate A→B

- [x] T8 **Reuse-first** — search KG + `src/components/{share,ui,customs}` cho modal / tab layout / preview embedded; reuse trước khi dựng. Component cần dựng mới (qua FM-018 gate): `<InsuranceDossierModal>` + `<InsuranceDossierTab>` + `<DocumentCardSlot>` × 4 · scope:`src/features/insurance-dossier/**`,`src/components/customs/dossier-*/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1` · review:`R1,D1`
- [x] T9 `<InsuranceDossierModal>` (FEAT-INS-DOSSIER-CREATE): progress bar "{X}/4 tài liệu sẵn sàng" + 4 thẻ ngang (Phiếu QT auto / Phiếu báo giá auto / Biên bản upload / Giấy ủy quyền upload) + preview area + footer "Huỷ bỏ" / "Xuất hồ sơ bảo hiểm". Theo Figma `wave02-ins-dossier-create.md` · scope:`src/features/insurance-dossier/components/InsuranceDossierModal/**`,`src/features/insurance-dossier/components/DocumentCardSlot/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-1,AC-2,AC-3`,`BR-INS-DOSSIER-005` · review:`R3,R6,D2`
- [x] T10 Upload UX: multipart upload qua agg-garage-graph passthrough; validate MIME (`application/pdf` + `image/jpeg` + `image/png`) + max 10MB/file (UI side, BE authoritative); progress indicator per upload; cancel + retry · scope:`src/features/insurance-dossier/components/DocumentCardSlot/**`,`src/features/insurance-dossier/hooks/useDossierUpload.ts` · ac:`FEAT-INS-DOSSIER-CREATE-AC-10,AC-11`,`BR-INS-DOSSIER-007` · review:`R3,R14`
- [deferred:STAGE-TEST-OUT-OF-SCOPE-policy-20260604] T11 Preview area: embedded PDF viewer (reuse `react-pdf` nếu KG có; nếu không, evaluate `@react-pdf-viewer/core` qua FM-018 gate) cho phiếu auto-render; ảnh JPEG/PNG render qua `<img>` · scope:`src/features/insurance-dossier/components/PdfPreview/**`,`knowledge-graph.yaml` · ac:`FEAT-INS-DOSSIER-CREATE-AC-3,AC-4` · review:`R1,R6,D1`
- [deferred:STAGE-TEST-OUT-OF-SCOPE-policy-20260604] T12 `<InsuranceDossierTab>` (FEAT-INS-DOSSIER-VIEW): layout 2 cột — list bộ hồ sơ (mới nhất trên cùng) + preview PDF + nút tải. FE compose download URL bằng env `CT_FILE_STORAGE_DOMAIN` + `pdfUrl` object key (per ADR-016 v11 — KHÔNG signed URL). Theo Figma `wave02-ins-dossier-view.md` · scope:`src/features/insurance-dossier/components/InsuranceDossierTab/**`,`src/routes/settlement-voucher/$code.tsx` · ac:`FEAT-INS-DOSSIER-VIEW-AC-1,AC-2,AC-3,AC-4`,`ADR-016 v11` · review:`R3,R6,D2`
- [deferred:STAGE-TEST-OUT-OF-SCOPE-policy-20260604] T13 **Versioning UX**: bộ mới khi BH yêu cầu sửa = tạo bản version+1 (không unlock bản cũ); list hiển thị cả v1 + v2 với timestamp "Xuất ngày dd/MM/yyyy HH:mm · 4 tài liệu PDF" · scope:`src/features/insurance-dossier/components/InsuranceDossierTab/VersionList.tsx` · ac:`FEAT-INS-DOSSIER-VIEW-AC-2,AC-3`,`BR-INS-DOSSIER-006` · review:`R3,R6`
- [x] T14 Wire GraphQL: mutation `publishInsuranceDossier` + query `insuranceDossierVersions` qua `use-mutation.ts` / `use-query.ts`; auth + tenant header propagate · scope:`src/features/insurance-dossier/graphql/**`,`src/features/insurance-dossier/hooks/**` · ac:`FEAT-INS-DOSSIER-CREATE-AC-3`,`FEAT-INS-DOSSIER-VIEW-AC-1` · review:`R4,R19`
- [x] T15 **Testid coverage** Phase B (PKG §3.C.1) — wire: `dialog-tao-ho-so-bh`, `row-doc-{quotation-sheet,settlement-sheet,acceptance-record,payment-authorization}`, `checkbox-doc-*` (default unchecked per BR-INS-DOSSIER-005), `card-file-*`, `card-version-v{1,2}`, `empty-state-dossier-history`, `button-{xuat-ho-so,tai-pdf,huy-bo}` · scope:`src/features/insurance-dossier/components/**` · ac:`PKG-W02 §3.C.1`,`§3.C.4` · review:`R3,R17`
- [x] T16 Honor `coverage_gaps` từ Figma spec: flag drift PR khi spec/FEAT conflict (không tự đoán default) · scope:`PR description + .claude/checklists/figma-drift.md` · ac:`PKG-W02 §3.A` · review:`D3`
- [x] T17 Cập nhật KG `knowledge-graph.yaml` đăng ký pages + components mới (gate `/dev-handoff` verify KG changed) + 3-in-1 version bump · scope:`knowledge-graph.yaml` · ac:`PKG-W02 §5` · review:`R2,R8,D3`

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] `cd frontend/gf-gms-web && yarn build && yarn lint && yarn test --coverage` pass (≥ 60%)
- [ ] **State Matrix evidence** filled: `.claude/checklists/ui-state-matrix.md` (panel 2 cột × SO có/không BH × 3 màn)
- [ ] **Testid coverage probe**: `grep -rE 'data-testid' src/features/insurance-settlement src/components/customs/insurance-* src/features/insurance-dossier` ≥ 95% theo matrix §3.C.1
- [ ] Boundary clean (chỉ edit `frontend/gf-gms-web/**`)
- [ ] **Hard gate A → B**: Phase A merged + stable 24h staging trước Phase B start
- [ ] 3-in-1 version bump trên KG + Change Log

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority | Generated for W02/garage-web (3 FEAT + 6 CR APPROVED + 8 Figma wave02 spec). Phase A ~6h + Phase B ~10h. |
