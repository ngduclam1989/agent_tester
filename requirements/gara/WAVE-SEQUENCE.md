---
type: plan
artifact_kind: wave-sequence
status: ACTIVE
version: 24
tier: T2
owner_authority: Delivery Authority
scope: "ep-insurance-settlement + ep-inventory-v2 + ep-partner-link"
last_reviewed: "2026-08-10"
---

# Wave Sequence — GMS Garage

> **File đa-đợt (multi-epic)** theo mô hình append (PLANNING-PLAYBOOK §6.2, cách B):
> - **PART I — EP-INSURANCE-SETTLEMENT** (W01–W02) — giữ nguyên, xem ngay dưới.
> - **PART II — EP-INVENTORY-V2 / Tồn kho V2** (W03–W06) — đợt mới, xem cuối file.
> - **PART III — EP-PARTNER-LINK + booking relay Driver Plus** (W07) — xem trước phần Test Waves.
>
> Phương pháp planning: **M01 Vertical-Slice Wave Planning** (governing cố định — `Plan/PLANNING-PLAYBOOK.md`). Timebox cố định **5 ngày làm việc/wave**. Cadence epic-driven; wave đánh số liên tục (Insurance W01–W02 → Inventory V2 W03–W06 → Partner Link/Booking W07).

---

# PART I — EP-INSURANCE-SETTLEMENT

> Kế hoạch triển khai **EP-INSURANCE-SETTLEMENT** (Quyết toán bảo hiểm & Hồ sơ bảo hiểm) — **đợt này deliver 5/6 features P1** (FEAT-INS-DASH-DEBT defer đợt sau)
> trích từ [`Product/epics/EP-INSURANCE-SETTLEMENT.md`](../Product/epics/EP-INSURANCE-SETTLEMENT.md) v18 (2026-06-12)
> và 5 feature spec [`FEAT-INS-SO-ADJUSTMENT`](../Product/features/FEAT-INS-SO-ADJUSTMENT.md),
> [`FEAT-INS-STL-DETAIL`](../Product/features/FEAT-INS-STL-DETAIL.md),
> [`FEAT-INS-STL-CREATE`](../Product/features/FEAT-INS-STL-CREATE.md),
> [`FEAT-INS-DOSSIER-CREATE`](../Product/features/FEAT-INS-DOSSIER-CREATE.md),
> [`FEAT-INS-DOSSIER-VIEW`](../Product/features/FEAT-INS-DOSSIER-VIEW.md),
> cộng **6 CR đã APPROVED** ([`CR-20260612-01`](../Tracking/CHANGE-REQUESTS.md#cr-20260612-01--ins-stl-detail-panel-split-by-payer), [`CR-20260612-02`](../Tracking/CHANGE-REQUESTS.md#cr-20260612-02--ins-so-complete-popup-negative-bh-warn), [`CR-20260616-01`](../Tracking/CHANGE-REQUESTS.md#cr-20260616-01--ins-stl-print-voucher-add-allocation), [`CR-20260616-02`](../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column), [`CR-20260618-01`](../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all), [`CR-20260618-02`](../Tracking/CHANGE-REQUESTS.md#cr-20260618-02--ins-so-print-voucher-add-allocation-and-payer-split)) slot đầu W02 Phase A.
>
> **2 waves tuần tự** vertical slicing — W01 Foundation → W02 (Settlement adjustments + Dossier). Mỗi wave deliver vertical slice (BE + BFF + Web + Mobile) demo được cho PO.
> **W02 chạy 2 phase tuần tự**: **Phase A** (cụm CR settlement + FEAT-INS-STL-CREATE) → hard gate nội bộ → **Phase B** (Hồ sơ bảo hiểm — dossier). Phase A phải xong trước vì dossier auto-render Phiếu QT + Phiếu báo giá từ panel "Tổng giá dịch vụ" + template in mà cụm CR thay đổi (xem §1.2).
> Phạm vi này **superseded** TD P0 Remediation scope cũ (W01-W03 backend/web/mobile) — TD P0 đã merge hoặc archived.
> Epic touch **cả web + mobile** — kế toán + chủ garage dùng cả 2 platform cho luồng quyết toán bảo hiểm. Mỗi wave có boundary `garage-mobile` parallel với `garage-web` (workload tương đương). GA timeline mobile có thể lag 24-48h do app store review (TestFlight + Play Console).
>
> **Deferred (KHÔNG trong đợt này)**: FEAT-INS-DASH-DEBT (widget công nợ bảo hiểm trên Dashboard) — chuyển sang epic / wave kế tiếp khi Business Authority confirm scope + ưu tiên.

---

## 1. Wave Dependency Graph

```
                ┌──────────────────────────────────────────────────┐
                │  W01 — Insurance Foundation (5 ngày)             │
                │  Team: Full-stack (BE + Web)                     │
                │                                                  │
                │   FEAT-INS-SO-ADJUSTMENT  (gf-sales)             │
                │       │  + section "Phân bổ quyết toán BH"       │
                │       │    trên SO Edit/Detail (5 khoản)         │
                │       │  + snapshot payload allocation           │
                │       │    truyền sang gf-accounting             │
                │       ▼                                          │
                │   FEAT-INS-STL-DETAIL  (gf-accounting)           │
                │          + màn chi tiết phiếu QT BH              │
                │            (4 tab: Chi phí + Hồ sơ + Chứng       │
                │            từ + Lịch sử thanh toán)              │
                │          + panel "Tổng giá dịch vụ" hiển         │
                │            thị phân bổ                           │
                │                                                  │
                │   Web:    garage-web (UI section + 4 tab)        │
                │   Mobile: garage-mobile (Flutter — section       │
                │           bottom sheet + screen chi tiết 4 tab)  │
                │   BFF:    agg-garage-graph (resolver + types)    │
                └──────────────────────┬───────────────────────────┘
                                       │  Hard gate W01 → W02:
                                       │  - Phiếu QT BH detail
                                       │    stable trên staging 24h
                                       │  - SO snapshot allocation
                                       │    contract ratified
                                       │    (gf-sales → gf-accounting)
                                       │  - Phiếu QT BH có nhiều bộ
                                       │    dữ liệu mẫu để test dossier
                                       ▼
                ┌──────────────────────────────────────────────────┐
                │  W02 — Settlement Adjustments + Dossier (6 ngày) │
                │  Team: Full-stack (BE + BFF + Web + Mobile)      │
                │                                                  │
                │  ┌─ PHASE A — Settlement create + CR (2 ngày) ─┐ │
                │  │ FEAT-INS-STL-CREATE (gf-accounting)         │ │
                │  │   + panel "Tổng giá DV" read-only trên      │ │
                │  │     màn Tạo phiếu QT (snapshot từ SO)        │ │
                │  │ CR-20260612-01 (gf-accounting + web/mob)    │ │
                │  │   + tách panel per-payer màn chi tiết QT    │ │
                │  │   (phiếu BH chỉ cột BH; phiếu KH thêm        │ │
                │  │    "Phân bổ BH" nếu SO có BH)               │ │
                │  │ CR-20260616-01 (gf-accounting + gf-sales)   │ │
                │  │   + phiếu in QT + "Phân bổ bảo hiểm"        │ │
                │  │ CR-20260612-02 (gf-sales + web/mob)         │ │
                │  │   + popup hoàn thành SO cảnh báo BH âm       │ │
                │  │ CR-20260616-02 (web/mob + agg)              │ │
                │  │   + panel "Tổng giá DV": Phân bổ BH +        │ │
                │  │     Cân thanh toán → 2 cột (BH | KH)         │ │
                │  │ CR-20260618-01 (gf-accounting + gf-sales    │ │
                │  │   + web/mob)                                 │ │
                │  │   + sửa logic sinh phiếu QT: sinh QT KH     │ │
                │  │     "chỉ phân bổ BH" khi BH 100% phụ tùng/  │ │
                │  │     dịch vụ + KH chịu khoản phân bổ          │ │
                │  │ CR-20260618-02 (gf-sales + web/mob)         │ │
                │  │   + template in PDV (phiếu dịch vụ) bổ      │ │
                │  │     sung "Phân bổ bảo hiểm" 5 khoản 2 cột   │ │
                │  │     + "Cần thanh toán" 3 dòng (BH/KH/Tổng)  │ │
                │  └─────────────────────┬───────────────────────┘ │
                │   Hard gate A → B: panel + template in QT/      │
                │   báo giá stable (dossier render từ đây)        │
                │  ┌─ PHASE B — Insurance Dossier (4 ngày) ──────┐ │
                │  │ FEAT-INS-DOSSIER-CREATE (gf-accounting)     │ │
                │  │   + entity InsuranceDossier + Version       │ │
                │  │     + Document + File (4 tài liệu)          │ │
                │  │   + PDF gen server-side + upload            │ │
                │  │     Biên bản + Giấy ủy quyền               │ │
                │  │   + xuất bộ PDF + versioning               │ │
                │  │ FEAT-INS-DOSSIER-VIEW (gf-accounting)       │ │
                │  │   + tab "Hồ sơ BH đã xuất" read-only        │ │
                │  │   + preview PDF + tải PDF gốc              │ │
                │  │   + list nhiều bộ theo lần xuất            │ │
                │  └─────────────────────────────────────────────┘ │
                │                                                  │
                │   Web:    garage-web   Mobile: garage-mobile     │
                │   BFF:    agg-garage-graph                       │
                │   Infra:  object storage (S3 — Phase B)          │
                └──────────────────────────────────────────────────┘

                            ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄
                              DEFERRED (đợt sau):
                              FEAT-INS-DASH-DEBT
                              Widget công nợ bảo hiểm
                              trên Dashboard
                            ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄
```

### 1.1 Lý do W01 → W02 sequential (hard gate)

1. **Phiếu QT BH là context của Dossier**. Modal "Hồ sơ bảo hiểm" mở **từ** phiếu QT BH (FEAT-INS-DOSSIER-CREATE AC-1) → phải có phiếu QT BH detail stable trước khi tạo dossier.
2. **Phiếu báo giá auto-render** trong bộ hồ sơ (tài liệu #2 — "Sẵn sàng" tự động) snapshot dữ liệu từ phiếu QT BH bao gồm panel "Tổng giá dịch vụ" + phân bổ BH (FEAT-INS-DOSSIER-CREATE AC-5). Nếu W01 chưa stable, render PDF sai số.
3. **SO snapshot allocation contract** (5 trường điều chỉnh + cộng sau VAT theo bên + BH thanh toán/KH chịu) phải ratify cuối W01 — là input cho cả W02 PDF template + W03 dashboard aggregation. Tránh build trên contract chưa chốt.
4. **Test data**: W02 + W03 cần nhiều phiếu QT BH với tổ hợp phân bổ khác nhau → W01 production-ish data trên staging làm fixture.

### 1.2 Intra-W02 phase ordering (Phase A → Phase B hard gate)

W02 chạy **2 phase tuần tự** — Phase A (cụm CR settlement + FEAT-INS-STL-CREATE) phải xong + stable trước khi start Phase B (Dossier). Lý do hard gate nội bộ:


1. **Dossier render từ panel + template in mà CR thay đổi**. 
FEAT-INS-DOSSIER-CREATE auto-render **Phiếu QT** (②) + **Phiếu báo giá** (①) từ snapshot panel "Tổng giá dịch vụ" + template in. **CR-20260612-01** (tách panel per-payer) + **CR-20260616-01** (template in QT + "Phân bổ bảo hiểm") đổi đúng phần này → nếu Phase B chạy trước, PDF dossier render theo layout cũ rồi phải làm lại.
2. **FEAT-INS-STL-CREATE là nơi tạo phiếu QT** — đối tượng mà dossier đính kèm (`settlement_code` FK). Panel snapshot ở màn Tạo phiếu QT phải khớp panel màn chi tiết (CR-20260612-01) trước khi dossier snapshot lại lần nữa.
3. **Số liệu một nguồn**: Phase A chốt panel "Tổng giá dịch vụ" + per-payer + template in server-side → Phase B chỉ tiêu thụ snapshot, không tự tính lại. Tránh lệch số giữa màn ↔ giấy ↔ PDF dossier.
4. **CR-20260612-02** (popup hoàn thành SO cảnh báo BH âm) thuộc `gf-sales` — độc lập với dossier nhưng cùng cụm "điều chỉnh settlement/SO", gom vào Phase A để 1 lần regression luồng SO→QT, không mở lại ở Phase B.
5. **CR-20260618-01** (sửa logic sinh phiếu QT — sinh phiếu QT KH "chỉ phân bổ BH" khi BH 100% + KH chịu phân bổ) thuộc `gf-accounting` + `gf-sales` + UI — bám luồng tạo phiếu QT của FEAT-INS-STL-CREATE; gom vào Phase A để 1 lần update logic sinh + render phiếu QT KH "chỉ phân bổ BH" (Figma web `13906-29632` · mobile `758-28571`), tránh re-test Phase B.
6. **CR-20260618-02** (template in PDV — phiếu dịch vụ bổ sung "Phân bổ bảo hiểm" + tách "Cần thanh toán" 3 dòng) thuộc `gf-sales` — cùng họ template print với CR-20260616-01 (phiếu QT BH/KH), gom vào Phase A để 1 lần update common-printing render PDV + QT đồng thời, không split.

> **Cấm** start Phase B trước khi Phase A merged + panel/template in QT + báo giá stable trên staging (gate nội bộ §4 Parallel Rules).

### 1.3 Intra-wave parallelism

- **W01**: 5 boundaries parallel — `gf-sales` (SO entity + payload) + `gf-accounting` (phiếu QT BH detail extension) start cùng ngày 1; `agg-garage-graph` skeleton ngày 1 + wire ngày 2-3; `garage-web` + `garage-mobile` mock data ngày 1-2 + wire thật ngày 3-4. Contract-first cho phép parallel an toàn — ADR-015 snapshot schema chốt cuối ngày 1. Web + mobile teams share GraphQL contract từ agg-garage-graph (1 source of truth, không double work BFF).
- **W02 Phase A** (~2 ngày): `gf-accounting` (FEAT-INS-STL-CREATE panel + CR-20260612-01 panel chi tiết + CR-20260616-01 template in QT + **CR-20260618-01 sửa logic sinh phiếu QT KH**) + `gf-sales` (CR-20260612-02 popup + CR-20260616-01 phần in từ SO + **CR-20260618-02 template in PDV phân bổ BH 2 cột + CR-20260618-01 trigger sinh phiếu QT**) start cùng ngày 1; `agg-garage-graph` mở rộng response (cờ "SO có Bảo hiểm" + panel snapshot + giá trị per-payer từng khoản cho CR-20260616-02 + cờ "KH còn phân bổ BH > 0" cho CR-20260618-01) ngày 1; `garage-web` + `garage-mobile` render panel/popup + reflow panel 2 cột (CR-20260616-02) + **render phiếu QT KH "chỉ phân bổ BH" layout Figma per-platform (CR-20260618-01)** ngày 1-2. Phần lớn tái dùng component panel "Tổng giá dịch vụ" + template in đã có từ W01.
  - **FEAT-INS-STL-CREATE** trong Phase A là task nhẹ (~6h toàn stack), **hấp thụ trong ~2d Phase A** không đổi calendar. Reuse panel "Tổng giá dịch vụ" component đã dựng W01 (FEAT-INS-STL-DETAIL AC-6 / FEAT-INS-SO-ADJUSTMENT AC-9..11) — chỉ gắn lên màn xác nhận Tạo phiếu QT ở chế độ read-only snapshot; **KHÔNG dựng component mới**. gf-accounting chỉ mở rộng response màn tạo phiếu QT thêm block `insuranceAdjustment` read-only (tái dùng logic tính server-side W01). Chạy trong Phase A để re-validate panel trên luồng tạo trước khi vào phần dossier nặng (PDF/S3) ở Phase B; **độc lập với dossier** (màn khác) — không tạo loop.
- **W02 Phase B** (~4 ngày): 4 boundaries parallel — `gf-accounting` entity schema chốt cuối ngày 1 Phase B (gate cho BFF + Web + Mobile). PDF gen + upload parallel với BFF/Web/Mobile work nếu mock interface có sẵn. Mobile cần buffer 0.5d cho permission handling (iOS Photo Library / Android Storage) + file picker integration.

### 1.4 Note — FEAT-INS-DASH-DEBT defer

FEAT-INS-DASH-DEBT (widget công nợ bảo hiểm trên Dashboard) **không trong scope đợt này** per Business Authority decision (2026-06-01). Lý do defer:
- Đợt này tập trung deliver luồng nghiệp vụ chính (nhập phân bổ + xem phiếu QT BH + xuất hồ sơ) — đủ giá trị cho pilot kế toán.
- Dashboard widget cần data sync mechanism phức tạp (REST sync vs Kafka projection ADR-018) — defer để có thêm production usage data làm input thiết kế.
- Sẽ raise riêng PKG-W{NN}-insurance-dashboard.md trong epic / wave kế tiếp khi Business Authority confirm scope + ưu tiên.

---

## 2. Wave Details

### Wave 1 — Insurance Foundation (5d)

| Field | Value |
|---|---|
| Phase | Feature delivery — EP-INSURANCE-SETTLEMENT slice 1/3 |
| Duration | 5 ngày (~32h work, 5 dev parallel — web + mobile chạy đồng thời) |
| Features | FEAT-INS-SO-ADJUSTMENT (gf-sales) + FEAT-INS-STL-DETAIL (gf-accounting) |
| Boundaries | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` |
| Team | Full-stack (1 BE gf-sales + 1 BE gf-accounting + 1 BFF + 1 Web + 1 Mobile) |
| Dependencies | None (entry wave) — đã có baseline EP-SERVICE-ORDER + EP-SETTLEMENT |

**Entry Criteria**:

- [ ] **Architecture artifacts ratified** (SA approve MR design pre-wave):
  - HLD-SALES update §SO entity (5 cột mới phân bổ BH + payment_source per line item)
  - HLD-ACCOUNTING update §Phiếu QT BH (snapshot allocation từ gf-sales)
  - `Architecture/api/gf-sales-api.md` thêm endpoint POST SO save với allocation payload + trường response phiếu QT trigger
  - `Architecture/api/gf-accounting-api.md` thêm GET /protected/v1/insurance-settlement/{id}/detail + snapshot intake
  - `Architecture/api/agg-garage-graph-api.md` thêm GraphQL types `InsuranceAllocation`, `InsuranceSettlement`, `SettlementCostTab`
  - `Architecture/integrations/INTEG-FE-INS-SO-ALLOCATION.md` (web)
  - `Architecture/integrations/INTEG-FE-INS-STL-DETAIL.md` (web)
  - `Architecture/integrations/INTEG-MOB-INS-SO-ALLOCATION.md` (mobile — Flutter equivalent contract)
  - `Architecture/integrations/INTEG-MOB-INS-STL-DETAIL.md` (mobile)
  - `Architecture/integrations/INTEG-BFF-GF-SALES-INSURANCE.md`
  - `Architecture/integrations/INTEG-BFF-GF-ACCOUNTING-INSURANCE.md`
  - `Architecture/decisions/ADR-015-insurance-allocation-snapshot.md` (gf-sales → gf-accounting payload schema, idempotency, retry)
- [ ] **PO sign-off** FEAT-INS-SO-ADJUSTMENT v12 + FEAT-INS-STL-DETAIL v3 (tất cả AC chốt, không còn NEED CONFIRMATION block)
- [ ] **UX-FLOW** production design verified cho **CẢ 2 platform**:
  - Web: section "Phân bổ quyết toán bảo hiểm" trên SO Edit + 4 tab phiếu QT BH (Figma DEV spec prefetched qua `/prefetch-figma garage-web`)
  - Mobile: bottom sheet "Phân bổ quyết toán bảo hiểm" trên SO Edit + screen chi tiết phiếu QT BH với 4 tab (Figma DEV spec prefetched qua `/prefetch-figma garage-mobile`) — **NEED CONFIRMATION**: mobile UX design hiện có chưa? Nếu chưa → BA phải tạo trước W01 entry
- [ ] **Knowledge graph** review: `gf-sales.knowledge-graph.yaml` + `gf-accounting.knowledge-graph.yaml` + `garage-mobile.knowledge-graph.yaml` (mobile screen graph) thêm entities mới
- [ ] **Branch** `feature/ep-insurance-settlement-w01` tạo từ `feature/add-architecture-v3`
- [ ] **PKG-W01** populated (xem [`PKG-W01-insurance-foundation.md`](../Execution/work-packages/PKG-W01-insurance-foundation.md))
- [ ] **STATE.json** `wave=01`, `stage=PLANNING`, `boundary_active=null` trước khi `/dev-start`
- [ ] **Flyway migration window** align với on-call (gf-sales V{N+1} ALTER TABLE SO thêm 5+ cột)

**Exit Criteria**:

- [ ] **gf-sales**: SO entity bổ sung 5 column phân bổ BH (`ck_lien_ket_vat_tu_amount`, `ck_lien_ket_vat_tu_percent`, `ck_lien_ket_cong_dv_amount`, `ck_lien_ket_cong_dv_percent`, `khau_hao_vat_tu_percent`, `giam_tru_boi_thuong_amount`, `giam_tru_boi_thuong_percent`, `khau_tru_bao_hiem_amount` — tên chính xác xem ADR-015) + `payment_source` per line item (đã có baseline). Flyway `V{N+1}__add_so_insurance_allocation.sql` deploy success.
- [ ] **gf-sales**: logic tính "Cộng sau VAT theo bên thanh toán" + "BH thanh toán" + "KH thanh toán" implemented + unit test ≥ 5 case từ §5 epic công thức + ví dụ 197,680,000 BH / 35,720,000 KH.
- [ ] **gf-sales**: payload POST tạo phiếu QT BH gửi sang gf-accounting bao gồm full snapshot phân bổ. REST call có outbox transactional + retry idempotent.
- [ ] **gf-accounting**: entity InsuranceSettlement extend snapshot fields (allocation_snapshot JSONB hoặc relational — ADR-015 chốt). ddl-auto=update apply success trên staging.
- [ ] **gf-accounting**: endpoint `GET /protected/v1/insurance-settlement/{id}/detail` trả 4 tab data + panel "Tổng giá dịch vụ" với phân bổ. Response shape khớp INTEG contract.
- [ ] **agg-garage-graph**: GraphQL types + resolvers cho SO insurance allocation + phiếu QT BH detail. DataLoader cho N+1.
- [ ] **garage-web**: component `<InsuranceAllocationSection>` chỉ render ở SO Edit + SO Detail (ẩn ở Create — AC-0 FEAT-INS-SO-ADJUSTMENT). Component `<InsuranceSettlementDetail>` với 4 tab.
- [ ] **garage-web**: toggle "%" / "số tiền" cho 3 trường (CK liên kết VT, CK liên kết CDV, Giảm trừ bồi thường); nhập tay số tiền cho Khấu trừ BH; % per dòng phụ tùng cho Khấu hao.
- [ ] **garage-mobile** (Flutter): `InsuranceAllocationBottomSheet` chỉ mở từ SO Edit + SO Detail (KHÔNG ở Create — AC-0). BLoC `InsuranceAllocationCubit` xử lý state + realtime preview. Toggle "%" / "số tiền" UI tương đương web.
- [ ] **garage-mobile**: `InsuranceSettlementDetailScreen` với TabController 4 tab (Chi phí + Hồ sơ + Chứng từ + Lịch sử thanh toán) + panel "Tổng giá dịch vụ" hiển thị phân bổ. Nút "+ Tạo hồ sơ bảo hiểm" disabled với tooltip "Sẽ available ở W02".
- [ ] **garage-mobile**: GraphQL operations dùng `graphql_flutter` package; tenant context + auth header propagate qua interceptor.
- [ ] **AC coverage** 100% FEAT-INS-SO-ADJUSTMENT (toàn bộ Nhóm A-G) + FEAT-INS-STL-DETAIL (toàn bộ Nhóm A-D) — áp dụng **cả web + mobile**.
- [ ] **Build/lint/test pass per boundary**:
  - `cd services/gf-sales && ./gradlew build checkstyleMain test` — coverage ≥ 80%
  - `cd services/gf-accounting && ./gradlew build checkstyleMain test` — coverage ≥ 80%
  - `cd garage-functions/agg-garage-graph && npm run build && npm run typecheck && npm test` — coverage ≥ 80%
  - `cd frontend/gf-gms-web && npm run build && npm run lint && npm test` — coverage ≥ 60%
  - `cd mobile/gf-garage-app && flutter analyze && flutter test && flutter build apk --debug` — coverage ≥ 60%
- [ ] **Integration test** `InsuranceSettlementSnapshotIT.java` (gf-sales tạo SO → publish event → gf-accounting consume → phiếu QT BH snapshot khớp).
- [ ] **REVIEW gates**: `agent-review-backend` finding P1=0 (3 BE boundary); `agent-review-garage-web` finding P1=0; **`agent-review-garage-mobile` finding P1=0**; `bash scripts/scan-boundary.sh` exit 0; KG `last_verified` updated.
- [ ] **3-in-1 version bump** tất cả file đã sửa.
- [ ] **Demo script** `Tracking/demos/ep-insurance-settlement-w01-demo.md` ready.

**Demo target**: Live trên staging — demo trên **cả 2 platform** đồng thời.

**Phần Web**: kế toán mở SO loại "Dịch vụ xe" hiện có → vào màn Chỉnh sửa → bật toggle "Bảo hiểm = Có" → chọn DN BH "Bảo Việt" từ dropdown system-seeded → nhập 5 dòng vật tư/dịch vụ với Nguồn TT = "Bảo hiểm" → section "Phân bổ quyết toán bảo hiểm" hiển thị → nhập (CK liên kết VT 5,000,000 + CK liên kết CDV 2,500,000 + Khấu hao 5% trên 2 phụ tùng + Giảm trừ bồi thường 200,000 + Khấu trừ BH 520,000) → save → hệ thống tính BH thanh toán 197,680,000 + KH thanh toán 35,720,000 + Tổng 233,400,000. Bấm "Tạo phiếu quyết toán" → tạo cặp 2 phiếu QT (KH + BH). Mở phiếu QT BH `#SET-20260601-00001` → header + 4 tab + panel phân bổ + Còn phải thu BH = 197,680,000. (Nút "+ Tạo hồ sơ bảo hiểm" hiển thị nhưng disabled với tooltip "Sẽ available ở W02".)

**Phần Mobile** (Android + iOS): cùng tenant + cùng SO → mở app trên thiết bị thật → vào SO Edit → bottom sheet "Phân bổ quyết toán bảo hiểm" → nhập 5 khoản tương đương → save → backend trả số giống web (197,680,000 BH). Mở screen chi tiết phiếu QT BH → 4 tab + panel phân bổ + Còn phải thu BH = 197,680,000. Verify cross-platform consistency: mở phiếu QT BH trên web (vừa demo phần Web) → hiển thị chính xác snapshot do mobile tạo.

### Wave 2 — Settlement Adjustments + Insurance Dossier (6d)

| Field | Value |
|---|---|
| Phase | Feature delivery — EP-INSURANCE-SETTLEMENT slice 2/3 — **2 phase tuần tự (A → B)** |
| Duration | 6 ngày (~40h work, 4 dev parallel — web + mobile đồng thời). Phase A ~2 ngày + Phase B ~4 ngày |
| CR updates (Phase A) | **CR-20260612-01** (gf-accounting — màn chi tiết phiếu QT tách hiển thị theo bên thanh toán) · **CR-20260616-01** (phiếu in QT + "Phân bổ bảo hiểm") · **CR-20260612-02** (gf-sales — popup hoàn thành SO cảnh báo Tổng BH thanh toán âm) · **CR-20260616-02** (panel "Tổng giá dịch vụ" 2 cột BH\|KH) · **CR-20260618-01** (sửa logic sinh phiếu QT: sinh phiếu QT KH "chỉ phân bổ BH" khi BH 100% + KH chịu phân bổ; Figma web `13906-29632` · mobile `758-28571`) · **CR-20260618-02** (template in PDV bổ sung khối "Phân bổ bảo hiểm" 5 khoản 2 cột + tách "Cần thanh toán" 3 dòng; mockup `print-service.html`). Xem [`Tracking/CHANGE-REQUESTS.md`](../Tracking/CHANGE-REQUESTS.md). |
| Features | **Phase A**: FEAT-INS-STL-CREATE (`gf-accounting`) + cụm 6 CR (CR-20260612-01 panel chi tiết per-payer · CR-20260616-01 phiếu in QT + phân bổ BH · CR-20260612-02 popup hoàn thành SO cảnh báo BH âm · CR-20260616-02 panel "Tổng giá dịch vụ" 2 cột · CR-20260618-01 sửa logic sinh phiếu QT khi BH 100% + KH chịu phân bổ · CR-20260618-02 template in PDV phân bổ BH). **Phase B**: FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW (cả 2 trên `gf-accounting`) |
| Boundaries | `gf-accounting`, `gf-sales` (Phase A — CR-20260612-02 popup + phần in từ SO), `agg-garage-graph`, `garage-web`, `garage-mobile` + object storage (S3 — Phase B) |
| Team | Full-stack (BE gf-accounting + BE gf-sales [Phase A] + 1 BFF + 1 Web + 1 Mobile) |
| Dependencies | W01 complete (hard gate W01→W02 — xem §1.1). Nội bộ: Phase A → Phase B hard gate (xem §1.2) |

#### Phase A — Settlement create + CR adjustments (~2 ngày)

**Phase A Entry Criteria**:

- [ ] **Hard Gate W01 → W02 pass**: Phiếu QT BH detail stable trên staging 24h + SO snapshot allocation contract ratified + test data nhiều bộ trên staging.
- [ ] **PO sign-off** 6 CR + FEAT-INS-STL-CREATE: CR-20260612-01 / CR-20260612-02 / CR-20260616-01 / CR-20260616-02 / CR-20260618-01 / CR-20260618-02 (tất cả đã APPROVED, [`Tracking/CHANGE-REQUESTS.md`](../Tracking/CHANGE-REQUESTS.md)) + FEAT-INS-STL-CREATE v6 (BR-INS-STL-CRE-009 read-only panel). NEED CONFIRMATION đã resolve: 2 khoản "CK liên kết BH" **ẩn** trên phiếu KH (chốt 2026-06-16).
- [ ] **Print mockup chuẩn**: 3 file `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{customer,insurance,service}.html` — `customer.html` + `insurance.html` cho CR-20260616-01 (phiếu QT BH/KH); **`service.html` mới (2026-06-18)** cho CR-20260618-02 (phiếu dịch vụ PDV).
- [ ] **Cờ "SO có chọn Bảo hiểm" + "KH còn phân bổ BH > 0"** từ BFF/snapshot: agg-garage-graph trả 2 cờ để web/mobile quyết render section "Phân bổ bảo hiểm" trên phiếu KH (panel + bản in PDV + bản in QT) + backend quyết sinh phiếu QT KH "chỉ phân bổ BH" (CR-20260618-01) — dùng chung CR-20260612-01 + CR-20260616-01 + CR-20260618-01 + CR-20260618-02 + FEAT-INS-STL-CREATE.
- [ ] **UX-FLOW + Figma**: panel "Tổng giá dịch vụ" per-payer + popup hoàn thành SO + template in (QT + PDV) + **panel 2 cột (CR-20260616-02)** + **phiếu QT KH "chỉ phân bổ BH" (CR-20260618-01)** — đối chiếu `UX-FLOW-INSURANCE-SETTLEMENT.md` + 3 Figma node CR-20260612-01 (web GMS-v.3: 13256-45155 / 13354-56440 / 13548-92509) + 3 Figma node CR-20260616-02 (SO Edit 13354-57960 / SO Detail 13354-58368 / Tạo QT 13535-159225) + **2 Figma node CR-20260618-01 (web `13906-29632` · mobile `758-28571`)** + 3 print mockup HTML (`customer` + `insurance` + `service`).

**Phase A Exit Criteria**:

- [ ] **gf-accounting**: FEAT-INS-STL-CREATE — màn Tạo phiếu QT thêm panel read-only "Tổng giá dịch vụ" (3 khối, snapshot từ SO); trường "Tổng tiền bảo hiểm trả" read-only = computed (AC-6); snapshot block phân bổ vào cặp phiếu QT khi xác nhận (AC-7). KHÔNG rebuild luồng tạo phiếu QT baseline.
- [ ] **gf-accounting**: CR-20260612-01 — panel màn chi tiết phiếu QT tách per-payer (phiếu BH 1 cột BH giữ "Tổng thanh toán"; phiếu KH từ SO có BH thêm section "Phân bổ Bảo hiểm" 3 khoản chuyển KH, **ẩn** 2 khoản CK liên kết BH).
- [ ] **gf-accounting** + **gf-sales**: CR-20260616-01 — template in phiếu QT bổ sung section "Phân bổ bảo hiểm": phiếu BH 5 khoản (dấu −), phiếu KH từ SO có BH 3 khoản (dấu +), phiếu QT từ SO không BH giữ bản in baseline. Khớp 2 print mockup HTML.
- [ ] **gf-sales**: CR-20260612-02 — popup "Hoàn thành phiếu dịch vụ" thêm dòng cảnh báo khi Tổng "Bảo hiểm thanh toán" < 0 (`ERR-INS-003`, warn-and-allow, không chặn).
- [ ] **garage-web** + **garage-mobile**: CR-20260616-02 — panel "Tổng giá dịch vụ" reflow khối "Phân bổ Bảo hiểm" + "Cân thanh toán" 1 cột → **2 cột (BH \| KH)** dóng thẳng, mỗi khoản +/− đúng cột, trên 3 màn (SO Edit/Detail + Tạo QT) theo Figma `13354-57960`/`13354-58368`/`13535-159225`. Display-only; mobile xử lý responsive. KHÔNG áp màn chi tiết QT (1-cột per-payer).
- [ ] **gf-accounting** + **gf-sales**: CR-20260618-01 — sửa logic sinh phiếu QT từ SO. Điều kiện sinh phiếu QT KH mở rộng: sinh khi (a) có phụ tùng/dịch vụ KH chi trả HOẶC (b) `Khấu trừ BH + Khấu hao vật tư-thay mới + Giảm trừ bồi thường > 0` — kể cả khi BH thanh toán 100% phụ tùng + dịch vụ. Case "BH 100% + KH chịu phân bổ" → sinh 2 phiếu (phiếu QT BH đầy đủ + phiếu QT KH "chỉ phân bổ BH" 3 khoản dấu +, KHÔNG có dòng dịch vụ/phụ tùng). Tổng thanh toán phiếu QT KH = tổng 3 khoản phân bổ. KHÔNG re-evaluate phiếu QT cũ.
- [ ] **garage-web** + **garage-mobile**: CR-20260618-01 — render phiếu QT KH "chỉ phân bổ BH" layout mới (KHÔNG dùng layout phiếu QT KH baseline) theo Figma `13906-29632` (web) + `758-28571` (mobile). FE đọc cờ "KH còn phân bổ BH > 0" từ BFF để decide layout.
- [ ] **gf-sales**: CR-20260618-02 — template in **Phiếu dịch vụ (PDV)** mở rộng khi SO có chọn Bảo hiểm: bổ sung khối "Phân bổ bảo hiểm" 5 khoản × 2 cột (BH dấu − / KH dấu + hoặc 0); thay 1 dòng "Tổng thanh toán" → khối "Cần thanh toán" 3 dòng (`Bảo hiểm thanh toán` + `Khách hàng thanh toán` + `Tổng thanh toán` bold). Dòng "bằng chữ" bám KH thanh toán. SO không Bảo hiểm giữ baseline. Khớp mockup `print-service.html`.
- [ ] **agg-garage-graph**: response trả cờ "SO có chọn Bảo hiểm" + panel snapshot per-payer cho web/mobile; giá trị "Bảo hiểm thanh toán" computed cho popup; **giá trị từng khoản phân bổ tách BH/KH** (CR-20260616-02 render 2 cột).
- [ ] **garage-web** + **garage-mobile**: render panel "Tổng giá dịch vụ" per-payer (màn Tạo QT + chi tiết QT) + popup cảnh báo BH âm + bản in QT mới (web print / mobile share-PDF). Reuse component panel + template in từ W01 — KHÔNG dựng lại.
- [ ] **AC coverage** 100% FEAT-INS-STL-CREATE (Nhóm A-D) + 3 CR scope — web + mobile.
- [ ] **Build/lint/test pass** các boundary chạm (gf-accounting, gf-sales, agg-garage-graph, garage-web, garage-mobile) — threshold như W01.
- [ ] **REVIEW gates** Phase A: `agent-review-backend` + `agent-review-garage-web` + `agent-review-garage-mobile` P1=0; `scripts/scan-boundary.sh` exit 0.
- [ ] **Hard gate A → B**: panel "Tổng giá dịch vụ" per-payer + template in QT/báo giá stable trên staging (dossier Phase B render từ đây — §1.2).

#### Phase B — Insurance Dossier (~4 ngày)

**Phase B Entry Criteria**:

- [ ] **Hard Gate Phase A → B pass**: panel per-payer + template in QT + Phiếu báo giá stable trên staging (§1.2). Dossier auto-render từ snapshot Phase A.
- [ ] **Object storage provisioned** (Platform team): bucket `gms-insurance-dossier-{env}` + IAM policy + lifecycle (NEED CONFIRMATION retention 7 năm theo Luật Kế toán) + tenant-prefix key convention.
- [ ] **PDF template engine decision** (Architect ADR-016): server-side options (Apache PDFBox / OpenHTMLtoPDF / iText / Puppeteer headless) — Java BE friendly + 4 mẫu hồ sơ.
- [ ] **PDF template Legal approval**: mẫu Phiếu QT + Phiếu báo giá + Biên bản nghiệm thu + Giấy ủy quyền nhận tiền bồi thường — Legal team xác nhận bố cục + nội dung điều khoản chuẩn.
- [ ] **Architecture artifacts**:
  - HLD-ACCOUNTING update §Dossier entity tree (InsuranceDossier 1-n InsuranceDossierVersion 1-n InsuranceDossierDocument 1-n InsuranceDossierFile)
  - `gf-accounting-api.md` section Dossier (CRUD + upload multipart + publish + preview + signed URL download)
  - INTEG-FE-INS-DOSSIER (modal + tab contracts — web)
  - INTEG-MOB-INS-DOSSIER (full-screen flow + tab — mobile, Flutter native picker upload, file system permissions)
  - INTEG-BFF-GF-ACCOUNTING-DOSSIER (upload passthrough + signed URL)
  - ADR-016 PDF template engine + ADR-017 dossier versioning strategy (tạo bản mới, không unlock bản cũ)
- [ ] **PO sign-off** FEAT-INS-DOSSIER-CREATE v7 + FEAT-INS-DOSSIER-VIEW v3 + **FEAT-INS-STL-CREATE v1** (panel màn tạo phiếu QT — resolve NEED CONFIRMATION Figma mobile link nếu mobile in scope).
- [ ] **FEAT-INS-STL-CREATE Figma**: web node `13535-157815` thêm vào `/prefetch-figma web 02`; **Figma mobile link — NEED CONFIRMATION** (BA + Mobile UX; nếu chưa có → STL-CREATE mobile bị block, web vẫn chạy được).
- [ ] **Branch** `feature/ep-insurance-settlement-w02` tạo sau khi W01 merge.
- [ ] **Multipart upload size limit** confirmed (đề xuất 10MB per file, 40MB per dossier total). Nginx/ingress + agg-garage-graph + gf-accounting align.
- [ ] **PKG-W02** populated (xem [`PKG-W02-insurance-dossier.md`](../Execution/work-packages/PKG-W02-insurance-dossier.md)).

**Phase B Exit Criteria**:

- [ ] **CR updates (chạy đầu wave — ngày 1)**:
  - [ ] **CR-20260612-01** (gf-accounting + BFF + web + mobile): màn chi tiết phiếu QT — phiếu **BH** panel "Tổng giá dịch vụ" chỉ cột "Bảo hiểm thanh toán" (bỏ cột/dòng KH), giữ "Phân bổ Bảo hiểm"; phiếu **KH** chỉ cột "Khách hàng thanh toán" + "Phân bổ Bảo hiểm" hiển thị **chỉ khi đi từ SO có chọn Bảo hiểm**. BFF trả cờ "SO có chọn BH" cho phiếu KH. AC coverage FEAT-INS-STL-DETAIL AC-6 (rewrite); BR-INS-STL-DET-009.
  - [ ] **CR-20260612-02** (gf-sales + web + mobile): popup "Hoàn thành phiếu dịch vụ" hiển thị cảnh báo `ERR-INS-003` khi Tổng "Bảo hiểm thanh toán" < 0 — **warn-and-allow** (vẫn cho hoàn thành). AC coverage FEAT-INS-SO-ADJUSTMENT AC-17; BR-INS-SO-ADJ-010.
- [ ] **FEAT-INS-STL-CREATE (chạy đầu wave)**:
  - **gf-accounting**: response màn Tạo phiếu QT (loại Bảo hiểm) trả thêm block `insuranceAdjustment` read-only (breakdownByPayer + 5 khoản adjustments + settlementBalance) — tái dùng logic tính server-side W01 (BR-INS-STL-CRE-003), KHÔNG tính lại logic mới. Trường "Tổng tiền bảo hiểm trả" bên BH = read-only = computed (CNF-INS-001).
  - **agg-garage-graph**: query mở màn tạo phiếu QT extend block `insuranceAdjustment`.
  - **garage-web**: panel "Tổng giá dịch vụ" hiển thị read-only trên màn xác nhận Tạo phiếu QT — **reuse component panel W01** (`<InsuranceSettlementDetail>` panel), hiển thị có điều kiện theo SO có/không BH (BR-INS-STL-CRE-009). KHÔNG dựng component mới.
  - **garage-mobile**: panel tương đương trên màn tạo phiếu QT (reuse panel screen W01) — **NEED CONFIRMATION Figma mobile**.
  - **AC coverage** 100% FEAT-INS-STL-CREATE (Nhóm A-D).
- [ ] **gf-accounting**: entity `InsuranceDossier`, `InsuranceDossierVersion`, `InsuranceDossierDocument` (4 row per version cho 4 tài liệu chuẩn), `InsuranceDossierFile`. ddl-auto=update apply success.
- [ ] **gf-accounting**: PDF generation server-side cho Phiếu QT + Phiếu báo giá (auto-render từ snapshot phiếu QT BH); upload PDF cho Biên bản + Giấy ủy quyền (kế toán bổ sung).
- [ ] **gf-accounting**: endpoint POST `/protected/v1/insurance-dossiers` (tạo bản mới version=n+1), PUT `.../{id}/documents/{docType}`, POST `.../{id}/publish` (sinh PDF + upload S3), GET `.../{id}/versions`, GET `.../{id}/files/{fileId}/signed-url` (1h expiry).
- [ ] **gf-accounting**: file scan upload validation: MIME type (`application/pdf` + `image/jpeg` + `image/png`), max 10MB per file, virus scan (NEED CONFIRMATION: ClamAV sidecar hay Lambda hook).
- [ ] **agg-garage-graph**: GraphQL mutations `createInsuranceDossier`, `updateDossierDocument`, `publishInsuranceDossier`, `uploadDossierFile`. Queries `insuranceDossierVersions`, `insuranceDossierFiles`. Auth header propagation.
- [ ] **garage-web**: modal `<InsuranceDossierModal>` với progress bar "{X}/4 tài liệu sẵn sàng" + 4 thẻ ngang + preview + footer "Huỷ bỏ" / "Xuất hồ sơ bảo hiểm".
- [ ] **garage-web**: tab `<InsuranceDossierTab>` layout 2 cột — list bộ hồ sơ (mới nhất trên cùng) + preview PDF + nút tải.
- [ ] **garage-web**: bộ mới khi BH yêu cầu sửa = tạo bản version+1 (không unlock bản cũ); bản cũ vẫn xem trong tab.
- [ ] **garage-mobile** (Flutter): `InsuranceDossierScreen` full-screen flow — progress bar + 4 thẻ tài liệu dạng list dọc (responsive cho mobile) + preview embedded PDF (qua `pdfx` hoặc `flutter_pdfview` package) + footer button.
- [ ] **garage-mobile**: file picker tích hợp (`file_picker` package) cho upload Biên bản + Giấy ủy quyền (PDF/JPEG/PNG, max 10MB); permission handling iOS + Android.
- [ ] **garage-mobile**: tab "Hồ sơ bảo hiểm đã xuất" trong screen chi tiết phiếu QT BH — list bộ + preview PDF inline + tải về local storage (signed URL).
- [ ] **garage-mobile**: versioning UX tương đương web — tạo bộ v2 độc lập, list hiển thị cả v1 + v2.
- [ ] **AC coverage** 100% FEAT-INS-DOSSIER-CREATE (Nhóm A-D) + FEAT-INS-DOSSIER-VIEW (Nhóm A-C) — áp dụng cả web + mobile.
- [ ] **Build/lint/test pass per boundary** (cùng threshold W01) bao gồm `flutter analyze && flutter test && flutter build apk --debug`.
- [ ] **Integration test** `InsuranceDossierLifecycleIT.java` (tạo → upload 2 file → publish → tải signed URL); mobile e2e test `integration_test/insurance_dossier_test.dart` (Flutter integration_test framework).
- [ ] **REVIEW gates**: `agent-review-backend` + `agent-review-garage-web` + **`agent-review-garage-mobile`** P1=0; security review upload + signed URL + mobile file system permissions clean.
- [ ] **Demo script** `Tracking/demos/ep-insurance-settlement-w02-demo.md` ready.

**Demo target**: Live trên staging — demo trên **cả 2 platform**, theo 2 phase.

**Phase A demo** (settlement + CR): kế toán mở SO có Bảo hiểm (đã hoàn thành) ở màn **Chỉnh sửa** → panel "Tổng giá dịch vụ" hiển thị khối "Phân bổ Bảo hiểm" + "Cân thanh toán" **2 cột (BH \| KH)** dóng thẳng (CR-20260616-02); mở **Chi tiết phiếu dịch vụ** → panel 2 cột tương tự. Bấm "Tạo phiếu quyết toán" → màn Tạo phiếu QT hiển thị panel **"Tổng giá dịch vụ"** read-only 3 khối (Chi tiết theo bên thanh toán 2 cột BH/KH + Phân bổ Bảo hiểm 5 khoản + Cân thanh toán: BH 197,680,000 / KH 35,720,000 / Tổng 233,400,000 — số khớp panel trên SO W01), "Tổng tiền bảo hiểm trả" read-only = 197,680,000 (computed) → xác nhận tạo cặp phiếu QT, snapshot block phân bổ. (Demo SO không Bảo hiểm → panel rút gọn 1 cột KH.) Mở **phiếu QT BH** → panel chi tiết chỉ 1 cột "Bảo hiểm thanh toán" + "Phân bổ Bảo hiểm" (giữ "Tổng thanh toán"); **in phiếu QT BH** → bản in có "Phân bổ bảo hiểm" 5 khoản (dấu −). Mở **phiếu QT KH** (từ SO có BH) → panel + bản in có "Phân bổ Bảo hiểm" 3 khoản chuyển KH (dấu +), **không** thấy 2 khoản CK liên kết BH. Mở SO không BH → phiếu QT in baseline (không có "Phân bổ bảo hiểm"). Trên popup "Hoàn thành phiếu dịch vụ" của SO có Tổng BH thanh toán âm → hiển thị dòng cảnh báo `ERR-INS-003` ("Bảo hiểm thanh toán đang âm…", vẫn cho xác nhận — warn-and-allow). → **Hard gate A→B**: panel + template in stable 24h staging.

**Phase B demo** (dossier) — **Phần Web**: kế toán mở phiếu QT BH `#SET-20260601-00001` (từ W01 / vừa tạo ở Phase A) → bấm **"+ Tạo hồ sơ bảo hiểm"** → modal mở → progress "2/4 tài liệu sẵn sàng" (Phiếu QT + Phiếu báo giá auto "Sẵn sàng") → preview Phiếu báo giá auto-render từ snapshot phân bổ → upload Biên bản nghiệm thu (PDF 2MB) → upload Giấy ủy quyền (PDF 1.5MB) → progress "4/4 tài liệu sẵn sàng" → bấm "Xuất hồ sơ bảo hiểm" → 4 PDF render + upload S3 + bộ đánh dấu published version 1. Vào tab "Hồ sơ bảo hiểm đã xuất" → thấy bộ v1 với "Xuất ngày 01/06/2026 14:32 · 4 tài liệu PDF" → click 1 tài liệu → preview hiển thị → tải PDF gốc (signed URL 1h). Simulate BH yêu cầu sửa → tạo bộ v2 → xuất → tab hiển thị cả v2 (trên) và v1 (dưới).

**Phần Mobile** (Android + iOS device thật): cùng phiếu QT BH → mở mobile app → vào screen chi tiết phiếu QT BH → bấm "+ Tạo hồ sơ bảo hiểm" → mở `InsuranceDossierScreen` full-screen → progress "2/4" → preview Phiếu báo giá (PDF embedded) → tap "Upload Biên bản" → file picker mở (permission grant) → chọn PDF từ Downloads → upload → progress "3/4" → tương tự Giấy ủy quyền → "4/4 sẵn sàng" → "Xuất hồ sơ bảo hiểm" → 4 PDF render + S3 upload + bộ v1 published. Tab "Hồ sơ đã xuất" mở → list bộ v1 → tap 1 PDF → preview inline → tải về Downloads folder. Verify cross-platform: web hiển thị bộ v1 mobile vừa tạo + bộ v2 do mobile tạo sau đó.

# PART III — EP-PARTNER-LINK + BOOKING RELAY DRIVER PLUS

> Wave 7 bổ sung lát cắt tích hợp Driver Plus theo **Kafka adapter tự-own tại boundary sở hữu** (ADR-029): garage quản lý liên kết tài khoản D+ trên Web/Mobile và GMS tiếp nhận/phản hồi booking qua event correlated. Đây là một wave độc lập với Inventory V2: không kế thừa hard gate W06, nhưng chỉ được start sau khi bộ contract external đã ratify.

## P3.1 Wave Dependency Graph

```text
Driver Plus (Kafka)
   ├─ PARTNER_LINK.REQUEST.CREATE / .WITHDRAW / .UNLINK
   │       ↓
   │  W07 gf-system: validation + lifecycle + outbox
   │       ↓ REST                     ↓ Kafka correlated events
   │  agg-garage-graph                Driver Plus
   │       ↓
   │  garage-web + garage-mobile
   │
   └─ BOOKING.CREATE.REQUEST / BOOKING.CANCELLED
           ↓
      W07 gf-sales: booking relay + outbox
           ↓
      BOOKING.CREATE_RESPONSE / BOOKING.CANCEL_RESPONSE /
      BOOKING.CHANGE.STATUS → Driver Plus
```

### Wave 7 — Liên kết Driver Plus + relay Booking (5 ngày)

| Field | Value |
|---|---|
| Phase | Partner Link phase 1 + Booking relay contract hardening |
| Duration | 5 ngày làm việc (M01 timebox cố định) |
| Features (3 core) | `FEAT-SYS-DRIVERPLUS-LINK` · `FEAT-BOOK-DRIVERPLUS-INBOUND` · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` |
| Compatibility verification (không count FEAT) | `FEAT-BOOK-EDIT` AC-15: giữ `BOOKING.UPDATE.RESPONSE` cho đồng bộ sửa nội dung lịch hẹn, regression-only. |
| Boundaries | `gf-system` (Partner Link owner) · `gf-sales` (Booking owner) · `agg-garage-graph` · `garage-web` · `garage-mobile` · Driver Plus external. |
| Core contracts | `AC-DEV-PARTNER-LINK-EVENTS` / `MessageGroup=PARTNER_LINK` (6 step) · `AC-DEV-BOOKING-EVENTS` / `MessageGroup=BOOKING` (5 step W07). |
| Dependencies | ADR-029 + ADR-030 · `INTEG-EXT-driver-plus.md` · pre-existing booking lifecycle and EP-FOUND profile data. |

**Entry Criteria**:

- [ ] Architecture pre-wave ratified/merged trước `/wave-start 07`: `ADR-029` (Kafka adapter + correlated response), `ADR-030` (tenant profile SoT), `INTEG-EXT-driver-plus.md` v2, API/data/HLD/event artifacts của `gf-system` + `gf-sales`, GraphQL §3k, và FE/Mobile integration contracts. `Tracking/ARCH-REVIEW-W07.md` phải giữ P0=0, P1=0.
- [ ] Product baseline ratified: `EP-PARTNER-LINK` v15; `FEAT-SYS-DRIVERPLUS-LINK` v32; `FEAT-BOOK-DRIVERPLUS-INBOUND` v6; `FEAT-BOOK-DRIVERPLUS-OUTBOUND` v4; `BR-GF-SYSTEM` v21 và `BR-GF-SALES` v5. Không sử dụng HTTP synchronous response cho external event.
- [ ] Driver Plus và Platform xác nhận topic/ACL/SASL, headers bắt buộc (`OriginTenantId`, `MessageGroup`, `MessageStep`, correlation), schema/version, sandbox test tenant, và consumer-side dedupe cho event retry.
- [ ] Feature flags `PartnerLink:DriverPlus` và `Booking:DriverPlus` có default `on` + Delivery Authority giữ kill-switch; adapter dùng `FeatureFlagService.isEnabled()` programmatic cho Booking.
- [ ] Reuse-First gate cho Web/Mobile đã đọc UI contracts. Nguồn UX Partner Link là design reference hiện có; không chờ Figma mới. KG update plan cho `gf-system` và `gf-sales` được ghi nhận trước DEV.
- [ ] PKG-W07 populated; branch/STATE/infrastructure scope được Delivery Authority xác nhận khi wave thực sự start.

**Exit Criteria**:

- [ ] **gf-system**: nhận 3 inbound Partner Link step; kiểm tra tenant, inbox dedupe, state guard và single-active-link bằng transaction + partial unique index; tạo response correlated. Sáu REST endpoint list/detail/approve/reject/resync/cancel chạy đủ; approve phát `PROFILE.SYNC` + `STATUS.CHANGED`, không rollback state khi outbox publish lỗi.
- [ ] **gf-sales**: nhận booking create 14 trường và cancel; validate/reject có kiểm soát; áp dụng cancel chỉ tại state hợp lệ; dedupe và partition key `Booking-{bookingCode}`. Phát `BOOKING.CREATE.RESPONSE`, `BOOKING.CANCEL.RESPONSE`, `BOOKING.CHANGE.STATUS`; `cancelSource`/`driverPlusStatus` additive, giữ regression `BOOKING.UPDATE.RESPONSE`.
- [ ] **agg-garage-graph + garage-web + garage-mobile**: đủ 6 Partner Link GraphQL operations, menu/tab, list/detail và 4 action; flag off ẩn surface. Không phát sinh màn booking mới — kiểm thử booking đã tạo/đổi trạng thái hiển thị qua màn baseline.
- [ ] Integration test Kafka: create/approve/cascade reject/resync/unlink Partner Link; booking create/cancel; payload sai và booking không tồn tại trả correlated error; retry không double side-effect; tenant A không thấy/ảnh hưởng tenant B.
- [ ] Build/lint/test theo boundary pass; REVIEW P1=0; update KG, 3-in-1 và demo script trước `/wave-end`.

**Explicitly deferred — không được đưa vào Exit W07**:

- Emit phiếu dịch vụ/SO và phiếu quyết toán/settlement sang Driver Plus: Product yêu cầu nhưng Architecture chưa có contract event/owner/payload/retry/idempotency. Cần design/CR riêng trước khi lập wave.
- Hiển thị trạng thái retry/error của liên kết trên Web/Mobile: **đã chốt không triển khai trong W07**. Retry và event `FAILED` xử lý ngầm ở backend/vận hành; Web/Mobile không có badge, cảnh báo hoặc nút thử lại. UI tương lai phải qua CR/feature riêng.

**Demo target**: D+ gửi yêu cầu liên kết → garage duyệt trên Web hoặc Mobile → chỉ một tài khoản được liên kết, hồ sơ garage đồng bộ và status event được phát; D+ gửi booking hợp lệ → lịch hẹn xuất hiện; hủy hợp lệ được áp dụng; message sai/booking không tồn tại nhận event lỗi correlated mà không sinh dữ liệu sai.

## P3.2 Parallel Execution Rules

| Rule | Áp dụng | Chi tiết |
|---|---|---|
| Contract-first | Toàn W07 | Kafka headers, steps, correlation, topic ACL và schema phải lock Day 1. Không đổi Kafka sang REST trong DEV. |
| Backend parallel | `gf-system` ∥ `gf-sales` | Hai adapter sở hữu độc lập; chỉ dùng `INTEG-EXT-driver-plus.md` chung, không gọi direct DB hay qua `gf-erp-agent`. |
| Client dependency | BFF → Web/Mobile | BFF mock contract Day 1; Web/Mobile wire thật sau khi 6 GraphQL operation và flag behavior ổn định. |
| Review/Test parallel | Post-DEV | Backend review kiểm tra inbox/outbox, tenant isolation, partial unique index, event filter; web/mobile review kiểm tra 6 action và flag hide. API/E2E/isolation/security test planning song song. |
| Timebox fallback | Day 4 risk | Không cắt Kafka safety, tenant isolation, hoặc booking response. Không bổ sung retry UI ngoài phạm vi đã chốt; không kéo wave quá 5 ngày. |

## P3.3 NEED CONFIRMATION / Pre-start Gates

| Item | Tại sao cần chốt | Owner | Blocks |
|---|---|---|---|
| Driver Plus sandbox + Kafka ACL/correlation acknowledgment | Không có môi trường/đối tác xác nhận thì không thể chứng minh correlated response, retry và dedupe liên hệ hai chiều. | Driver Plus + Platform | W07 TEST_EXECUTION / release |
| Emit chứng từ SO/QT sang D+ | Thiếu architecture contract (event step, owner, payload URL/binary, retry, idempotency); không suy luận từ booking relay. | BA + Architecture Authority | Wave/CR riêng, không block core W07 |

## 3. Test Waves

> Scope EP-INSURANCE-SETTLEMENT (đợt này) là vertical slice feature delivery — không tách wave WT-M / WT-F riêng. Test cases bundled vào exit criteria mỗi wave.

| Wave | Timing | Scope | Scale |
|---|---|---|---|
| (n/a) | — | Test cases per feature theo AC structure (Tại/Khi/Thì) bundled trong PKG-W01/W02 | — |

**Lý do**: 4 features cùng epic, cùng team, cùng codebase — test coverage per wave đủ đảm bảo regression. Nếu phát sinh performance regression hoặc security finding cross-wave, raise CR riêng + có thể trigger test wave bổ sung trước GA (xem `LAUNCH-CHECKLIST.md` §4 GA gate).

---

## 4. Parallel Execution Rules

| Rule | Áp dụng | Chi tiết |
|---|---|---|
| **Inter-wave** | W01 → W02 sequential | 1 hard gate ở §1.1. **Cấm** start W02 trước W01 merged + 24h soak. |
| **Intra-W02 phase** | Phase A → Phase B sequential | Hard gate nội bộ §1.2. **Cấm** start Phase B (Dossier) trước khi Phase A (CR settlement + FEAT-INS-STL-CREATE) merged + panel "Tổng giá dịch vụ" per-payer + template in QT/báo giá stable trên staging. Dossier Phase B render PDF từ snapshot Phase A. |
| **Intra-wave W01** | 5 boundaries parallel | `gf-sales` + `gf-accounting` start cùng ngày 1; `agg-garage-graph` skeleton ngày 1 + wire ngày 2-3; `garage-web` + `garage-mobile` mock data ngày 1-2 + wire thật ngày 3-4. ADR-015 chốt cuối ngày 1. |
| **Intra-wave W02 Phase A** | 5 boundaries parallel | **FEAT-INS-STL-CREATE chạy ngày 1 Phase A** (reuse panel W01, ~6h, hấp thụ trong ~2d Phase A — không gate dossier). `gf-accounting` (FEAT-INS-STL-CREATE + CR-20260612-01 + CR-20260616-01 template) + `gf-sales` (CR-20260612-02 + phần in từ SO) start cùng ngày 1; `agg-garage-graph` cờ "SO có Bảo hiểm" + panel snapshot + giá trị per-payer từng khoản (CR-20260616-02) ngày 1; `garage-web` + `garage-mobile` render panel/popup/bản in + reflow panel 2 cột (CR-20260616-02) ngày 1-2. Tái dùng component panel + template in từ W01. |
| **Intra-wave W02 Phase B** | 4 boundaries parallel với gate nội bộ | `gf-accounting` entity schema dossier chốt cuối ngày 1 Phase B (gate cho BFF + Web + Mobile). PDF gen + upload parallel với BFF/Web/Mobile work nếu mock interface có sẵn. Mobile buffer 0.5d permission + file picker. |
| **Cross-boundary contract** | Ratify trước dev | ADR-015 (allocation snapshot — W01), ADR-016 PDF engine + ADR-017 dossier versioning (W02) phải merged trước khi boundary tương ứng start. ADR-018 dashboard sync **defer** cùng FEAT-INS-DASH-DEBT. |
| **Review parallel** | Per-boundary post-handoff | `agent-review-backend` chấm 2 BE boundary (W01), 1 BE (W02). `agent-review-garage-web` chấm Web (mọi wave). `agent-review-garage-mobile` chấm Mobile (mọi wave). |
| **FIX agents** | Standby sau REVIEW | `agent-fix-*` activate nếu REVIEW flag P1/P2 — không pre-allocate. |
| **Test agents** | TEST_PLANNING song song REVIEW cuối wave | `agent-test-api` + `agent-test-ui` + `agent-test-e2e` generate TC từ AC + API contract; `agent-test-isolation` + `agent-test-performance` + `agent-test-security` periodic. |
| **MR design pre-wave** | Bắt buộc | Leader soạn full bộ HLD/API/data/event/integration/ADR cho mỗi wave → mở MR design branch → SA review + approve + merge **trước** `/wave-start`. Chưa approve = không start được wave. |
| **Feature flag** | Per-tenant | `insurance_settlement_enabled` flag — pilot 2-3 garage trước GA toàn platform (xem `RELEASE-PLAN.md`). |

---

## 5. NEED CONFIRMATION

| Item | Tại sao cần confirm | Owner | Blocks Wave |
|---|---|---|---|
| Phiếu QT KH (từ SO không BH) — bản in baseline giữ nguyên | CR-20260616-01 chỉ thêm "Phân bổ bảo hiểm" cho phiếu từ SO **có** BH; xác nhận phiếu từ SO không BH **không** đổi layout in (đã chốt trong CR — flag để DEV không vô tình áp section mới cho mọi phiếu) | Business Authority | W02 Phase A |
| Cờ "SO có chọn Bảo hiểm" — nguồn server-side cho web/mobile | Web/mobile cần cờ để quyết render "Phân bổ bảo hiểm" trên panel + bản in phiếu KH (CR-20260612-01 + CR-20260616-01 + FEAT-INS-STL-CREATE dùng chung). Xác nhận agg-garage-graph/snapshot expose cờ này | Backend Lead + BFF | W02 Phase A |
| Boundary chính module Dossier (gf-accounting vs `gf-insurance` mới) | Epic note §10.2 — Architect quyết định. Wave plan giả định **gf-accounting**. Nếu tách `gf-insurance` mới → W02 cần thêm setup boundary (~3d) | Solution Architect | W02 Phase B |
| Object storage provider | S3 (AWS) hay MinIO (self-host) hay Azure Blob? Bucket naming + IAM + lifecycle retention (Luật Kế toán 7 năm) | Platform + Security | W02 |
| PDF template engine choice (ADR-016) | Apache PDFBox / OpenHTMLtoPDF / iText / Puppeteer headless — performance + license + maintenance trade-off | Solution Architect + Backend Lead | W02 |
| Dossier upload virus scan strategy | ClamAV sidecar trong gf-accounting pod hay Lambda S3 trigger hay client-side check? | Security | W02 |
| Feature flag mechanism | Existing flag system (LaunchDarkly / homegrown) hay add mới? Granularity tenant-level đủ chưa? | Platform | W01 (cần resolve trước GA) |
| Legal approval timing cho 4 PDF template | Mẫu cần Legal review cuối W01 để W02 không bị block | Legal + Business Authority | W02 |
| SO entity backward compat sau migration | SO cũ (chưa có 5 cột) sau migration sẽ default NULL — query phải handle. Test với dump prod-like cuối W01 | Backend Lead + Delivery Authority | W01 |
| Release target date M4 GA | Chưa có deadline cụ thể từ Business Authority — cần để align communication + training kế toán | Business Authority | GA |
| Mobile UX design (Flutter screens + bottom sheets) | Epic + 4 FEAT chỉ document UI cho web (modal/tab/section). Mobile equivalent (bottom sheet / full-screen) cần BA + Mobile UX designer tạo trước W01 entry. Nếu mobile UX chưa có → W01 mobile bị block | BA + Mobile UX | W01, W02 |
| Mobile PDF rendering library | `pdfx` vs `flutter_pdfview` vs `syncfusion_flutter_pdfviewer` — license + perf + iOS/Android compat | Mobile Lead | W02 |
| Mobile file picker + permission strategy | iOS Photo Library + Camera + Files; Android Storage Access Framework (SAF) — permission rationale UI | Mobile Lead + UX | W02 |
| App Store + Play Console release process | TestFlight internal vs external review timeline; Play Console staged rollout %; build signing key holder | Mobile Lead + Platform | GA |
| Figma **mobile** link cho FEAT-INS-STL-CREATE (màn Tạo phiếu QT) | Web đã có node `13535-157815`; mobile chưa có link design. Nếu chưa có → STL-CREATE mobile bị block (web vẫn chạy). | BA + Mobile UX | W02 (mobile) |

---

# PART II — EP-INVENTORY-V2 (Tồn kho V2)

> Kế hoạch triển khai **Tồn kho V2** — 6 epic / **42 feature** trên boundary **`gf-inventory`** (post-baseline forward design).
> Nguồn: [`EP-INVENTORY-CATALOG`](../Product/epics/EP-INVENTORY-CATALOG.md) · [`EP-INVENTORY-ACCOUNTING-PERIOD`](../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) · [`EP-INVENTORY-OPENING-BALANCE`](../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) · [`EP-INVENTORY-RECEIPT-V2`](../Product/epics/EP-INVENTORY-RECEIPT-V2.md) · [`EP-INVENTORY-DELIVERY-V2`](../Product/epics/EP-INVENTORY-DELIVERY-V2.md) · [`EP-INVENTORY-STOCK-V2`](../Product/epics/EP-INVENTORY-STOCK-V2.md).
>
> **4 waves tuần tự** (M01 vertical slicing). Mỗi wave = 1 lát cắt dọc demo-able end-to-end: BE `gf-inventory` + BFF `agg-garage-graph` + Web `garage-web` + Mobile `garage-mobile`. Timebox **5 ngày làm việc/wave**; phạm vi là biến số tinh chỉnh theo actuals (PLANNING-PLAYBOOK §6.2).
> Cả 4 wave dùng **chung 1 backend boundary `gf-inventory`** ⟹ **bắt buộc tuần tự** (không song song 2 wave). Song song chỉ trong nội bộ wave: BE ∥ BFF ∥ Web ∥ Mobile.

---

## P2.1 Wave Dependency Graph

```
        ┌─────────────────────────────────────────────────────────────┐
        │  W03 — Danh mục vật tư (5 ngày)                              │
        │  EP-INVENTORY-CATALOG (12 feat)                             │
        │    Nhóm vật tư (GRP 5) + Mã SP nội bộ (PROD 7: CRUD+IMP/EXP)│
        │    BE gf-inventory · BFF · Web · Mobile                     │
        └───────────────────────────┬─────────────────────────────────┘
                                     │ Hard gate W03→W04:
                                     │ - Mã SP nội bộ + ĐVT quy đổi stable (staging 24h)
                                     │ - Mapping SKU contract ratified
                                     ▼
        ┌─────────────────────────────────────────────────────────────┐
        │  W04 — Khởi tạo kho: Kỳ kế toán + Tồn đầu kỳ (5 ngày)        │
        │  AP (5) + OB (3) + nền SỔ TỒN (ledger)                      │
        │    Kỳ Năm→Quý→Tháng + đóng/mở; import OB → ghi sổ tồn       │
        │    BE gf-inventory · BFF · Web · Mobile                     │
        └───────────────────────────┬─────────────────────────────────┘
                                     │ Hard gate W04→W05:
                                     │ - Sổ tồn (ledger) ghi/đọc stable
                                     │ - Lock kỳ kế toán enforce
                                     │ - Tồn đầu kỳ làm nguồn tồn test
                                     ▼
        ┌─────────────────────────────────────────────────────────────┐
        │  W05 — Giao dịch kho: Nhập + Xuất (5 ngày)                   │
        │  RECEIPT-V2 (7) + DELIVERY-V2 (7)                           │
        │    Nháp→Ghi sổ→Bỏ ghi sổ; cộng/trừ tồn; chặn tồn âm;       │
        │    lock kỳ; đối soát SO (cảnh báo, đọc gf-sales)            │
        │    BE gf-inventory · BFF · Web · Mobile                     │
        └───────────────────────────┬─────────────────────────────────┘
                                     │ Hard gate W05→W06:
                                     │ - Nhập/Xuất trong kỳ + sổ tồn stable
                                     │   (đầu vào công thức BQGQ)
                                     ▼
        ┌─────────────────────────────────────────────────────────────┐
        │  W06 — Tính giá + Báo cáo (5 ngày)                           │
        │  PRC (5) + STOCK-V2 (3)                                     │
        │    BQGQ cuối kỳ (tính lặp hội tụ) → giá vốn xuất +          │
        │    giá trị sổ tồn; báo cáo tồn đến ngày / NXT / thẻ kho     │
        │    BE gf-accounting (PRC master) + gf-inventory (S2S+báo    │
        │    cáo) · BFF · Web · Mobile (chỉ tồn đến ngày)             │
        └─────────────────────────────────────────────────────────────┘
```

### P2.1.1 Lý do W03→W04→W05→W06 tuần tự (hard gate)

1. **Danh mục là nền (W03)**: Kỳ/OB/Nhập/Xuất/Báo cáo đều tham chiếu **mã SP nội bộ** + ĐVT quy đổi. Phải có danh mục stable trước.
2. **Sổ tồn + lock kỳ (W04)**: là hạ tầng mọi phiếu ghi vào (cộng/trừ tồn) và báo cáo đọc ra. OB là writer đầu tiên → xây ledger ở W04. Lock kỳ (AP đóng → chặn phiếu trong kỳ) là cross-feature, phải có trước phiếu Nhập/Xuất.
3. **Nguồn tồn cho Xuất (W05)**: Xuất kho check tồn khả dụng (chặn tồn âm) ⟹ cần nguồn tồn từ Nhập (W05) + OB (W04). Nhập/Xuất chung vòng đời (Nháp→Ghi sổ→Bỏ ghi sổ) + chung ledger → 1 lát cắt.
4. **BQGQ cần dữ liệu kỳ (W06)**: Tính giá lấy Nhập/Xuất trong kỳ làm đầu vào; Báo cáo lấy giá trị sau khi chạy giá. Phải có giao dịch (W05) stable trước.
5. **Single backend boundary (W03-W05) + shared data dependency (W06)**: W03-W05 cả 3 wave sửa `gf-inventory` ⟹ không thể chạy song song. W06 thêm boundary `gf-accounting` (PRC master, tách biệt `gf-inventory`) nhưng vẫn tuần tự sau W05 vì **data dependency** (BQGQ cần Nhập/Xuất trong kỳ đã stable từ W05, không phải vì cùng boundary) — tuần tự + 24h soak giữa wave giữ nguyên cho toàn chuỗi W03→W06.

### P2.1.2 Intra-wave parallelism

- Mỗi wave: `gf-inventory` (BE: entity + Flyway V{N+1} + logic) chốt contract cuối ngày 1 → `agg-garage-graph` (GraphQL types/resolvers) + `garage-web` + `garage-mobile` mock ngày 1-2, wire thật ngày 3-4. Web + Mobile share GraphQL contract từ agg-garage-graph (1 source, không double BFF).
- Mobile cần buffer cho permission (W04 OB import file picker; W05 in/export phiếu; W06 xem báo cáo) — iOS/Android.

---

## P2.2 Wave Details

### Wave 3 — Danh mục vật tư (5 ngày)

| Field | Value |
|---|---|
| Phase | Inventory V2 slice 1/4 — Foundation |
| Duration | 5 ngày làm việc (timebox cố định) |
| Features (12) | GRP: `FEAT-CAT-GRP-LIST/CREATE/DETAIL/EDIT/DELETE` · PROD: `FEAT-CAT-PROD-LIST/CREATE/DETAIL/EDIT/DELETE/IMPORT/EXPORT` |
| Boundaries | `gf-inventory`, `agg-garage-graph`, `garage-web`, `garage-mobile` |
| Dependencies | None (entry wave Inventory V2) |

**Entry Criteria**:
- [ ] Architecture pre-wave ratified (SA): HLD-INVENTORY §danh mục (mã nội bộ + nhóm phân cấp + mapping SKU + ĐVT quy đổi); `gf-inventory-api.md` CRUD + import/export; `agg-garage-graph-api.md` GraphQL types; INTEG-FE-INV-CATALOG (web) + INTEG-MOB-INV-CATALOG (mobile) + INTEG-BFF-GF-INVENTORY-CATALOG; **ADR — mã nội bộ/SKU mapping + ĐVT quy đổi (làm tròn)**.
- [ ] PO sign-off EP-INVENTORY-CATALOG + 12 FEAT (AC chốt, BR-GF-INVENTORY-CATALOG ratified).
- [ ] **UX-FLOW + Figma** cả 2 platform — **NEED CONFIRMATION Figma mobile** (xem P2.5).
- [ ] KG `gf-inventory.knowledge-graph.yaml` review entities mới (InternalProduct, ProductGroup, SkuMapping, Uom).
- [ ] Branch `feature/ep-inventory-v2-w03`; PKG-W03 populated; Flyway window align on-call (gf-inventory dùng Flyway — KHÔNG ddl-auto).

**Exit Criteria**:
- [ ] **gf-inventory**: entity Nhóm vật tư (cây cha-con đa tầng + cascade INACTIVE) + Mã SP nội bộ (ACTIVE/INACTIVE, mapping SKU n-1, ĐVT chính + quy đổi). Flyway `V{N+1}__inventory_v2_catalog.sql` deploy success.
- [ ] **gf-inventory**: import (preview lỗi/hợp lệ, chỉ thêm mới) + export danh mục.
- [ ] **agg-garage-graph**: GraphQL CRUD + import/export passthrough; DataLoader N+1.
- [ ] **garage-web** + **garage-mobile**: màn danh sách/cây nhóm + form mã SP (gắn SKU + ĐVT) + import/export. Reuse-First component gate (PKG §2.4).
- [ ] AC coverage 100% (12 FEAT) cả web + mobile; build/lint/test pass per boundary (BE ≥80%, FE/Mobile ≥60%).
- [ ] REVIEW gates: `agent-review-backend` + `agent-review-garage-web` + `agent-review-garage-mobile` P1=0; `scan-boundary.sh` exit 0; KG updated; 3-in-1 bump.
- [ ] Demo script `Tracking/demos/ep-inventory-v2-w03-demo.md` ready.

**Demo target** (staging, web + mobile): tạo cây nhóm phân cấp → ngừng nhóm cha → nhóm con cascade INACTIVE; tạo mã SP nội bộ gắn 2 SKU + ĐVT chính "Cái" + ĐVT quy đổi "Thùng (×12)"; import file danh mục (preview lỗi → sửa → import hợp lệ); export. Cross-platform: mã tạo trên mobile hiển thị trên web.

### Wave 4 — Khởi tạo kho: Kỳ kế toán + Tồn đầu kỳ (5 ngày)

| Field | Value |
|---|---|
| Phase | Inventory V2 slice 2/4 — Khởi tạo tồn + nền sổ tồn (ledger) |
| Duration | 5 ngày làm việc (timebox cố định) |
| Features (10) | AP (5, boundary `gf-accounting`, **web-only**): `FEAT-AP-LIST` · `FEAT-AP-CREATE` · `FEAT-AP-DETAIL` · `FEAT-AP-EDIT` (gồm đóng/mở) · `FEAT-AP-DELETE` · OB (4, boundary `gf-inventory`, **web-only trừ FEAT-OB-LIST có mobile**): `FEAT-OB-LIST` (web + mobile) · `FEAT-OB-IMPORT` (web-only) · `FEAT-OB-EDIT` (web-only) · `FEAT-OB-DELETE-LINES` (web-only) · Mobile hub (1, boundary `garage-mobile`, **mobile-native**): `FEAT-INV-MOBILE-MENU` (partial — 3 tile W03/W04; W05/W06 enable thêm). **Mobile scope**: chỉ 2 màn (OB list + hub) per Figma registry `Product/ux/figma/figma-links.yaml` W04 mobile block — FEAT không có link Figma mobile → mobile out-of-scope. |
| CR piggyback (đầu wave) | **CR-20260707-01** (`gf-inventory` + `agg-garage-graph` + `garage-web` — Import Internal Product chuyển policy partial-success → **atomic all-or-nothing cutover từ GA**, **KHÔNG flag phụ `internal_product_import_atomic`** (endpoint vẫn gate qua flag chung `Inventory:InventoryV2` per CR-20260707-02 — Ops kill-switch per-tenant vẫn còn), legacy partial-success code path xóa dứt điểm; rollback nhanh = Ops flip `Inventory:InventoryV2=OFF` per-tenant (tắt cả Inventory V2, blast radius rộng), rollback dài = revert code + hotfix) · **CR-20260707-02** (`gf-inventory` + `agg-garage-graph` + `garage-web` + `garage-mobile` — backfill feature-flag **`Inventory:InventoryV2`** vào scope W03 catalog + wave-spec docs W03; **1 flag duy nhất cho toàn Inventory V2 subsystem W03/W04/W05/W06**, default ON toàn tenant kill-switch semantic, seed migration bắt buộc). Cả 2 CR **PENDING_APPROVAL** — REVIEW_GROUP cross-boundary yêu cầu approve trước khi implement. Xem [`Tracking/CHANGE-REQUESTS.md`](../Tracking/CHANGE-REQUESTS.md#cr-20260707-01--import-product-atomic-all-or-nothing-policy). |
| Boundaries affected | `gf-accounting` (Kỳ kế toán master — theo EP-INVENTORY-ACCOUNTING-PERIOD v16 boundary move 2026-07-07) · `gf-inventory` (OB + nền sổ tồn ledger + consumer Kỳ qua REST advisory ADR-021) · `agg-garage-graph` (BFF §3e Accounting Period + §3g Opening Balance passthrough) · `garage-web` · `garage-mobile` |
| Vertical slice | Lập cây kỳ kế toán trên `gf-accounting` + import tồn đầu kỳ trên `gf-inventory` (validate cross-boundary lock kỳ qua REST advisory) → ghi **sổ tồn (ledger)** point-in-time daily snapshot → demo cả 2 platform |
| Dependencies | W03 complete (hard gate: mã nội bộ + ĐVT stable; feature-flag `Inventory:InventoryV2` backfill W03 — CR-20260707-02). Inter-service REST advisory: `gf-inventory` → `gf-accounting` lock-check (ADR-021 fail-CLOSED trên commit-path, fail-OPEN + banner cảnh báo trên preview-path) |

**Entry Criteria**:
- [ ] Hard gate W03→W04 pass: mã nội bộ + ĐVT staging 24h; mapping SKU ratified.
- [ ] **Feature flag `Inventory:InventoryV2`** đã seed default ON cho mọi tenant (CR-20260707-02 §Scope điểm 6 — migration/startup job) — điều kiện tiên quyết mọi API V2 (§3b/§3e/§3g) reachable.
- [ ] Architecture pre-wave ratified: `gf-inventory-api.md` v42 §0 Wave Index W04 + §3b Opening Balance (7 endpoint W04-1..W04-7, skip W04-2 — FE bundled `.xlsx`); `agg-garage-graph-graphql.md` v7.48 §0 Wave Index W04 + §3g Opening Balance (6 op — `searchOpeningBalances` · `verifyImportOpeningBalances` · `importOpeningBalances` · `updateOpeningBalanceLine` · `deleteOpeningBalanceLine` · `deleteOpeningBalanceLines`) + §3e Accounting Period (AP CRUD); `gf-accounting-api.md` §Accounting Period ratified; **ADR-020 v4** (nền sổ tồn — point-in-time daily snapshot + engine tính lại dùng chung) + **ADR-021** (enforce khóa kỳ REST advisory cross-boundary `gf-inventory` → `gf-accounting`) + **ADR-022 v3** (OB import all-or-nothing bulk + empty-file semantic PASS/`canCommit=false`) merged; ADR-019 (AP on gf-accounting) confirmed.
- [ ] PO sign-off EP-INVENTORY-ACCOUNTING-PERIOD (nhóm AP, v16) + EP-INVENTORY-OPENING-BALANCE (v4) + FEAT-INV-MOBILE-MENU (v3) + BR-GF-INVENTORY-ACCOUNTING-PERIOD + BR-GF-INVENTORY-OPENING-BALANCE ratified.
- [ ] Reuse-First / Component-Inventory Gate acknowledged (web `.claude/references/web-component-registry.yaml` v?? — keyword: `tree`/`period-picker`/`file-upload`/`preview-table`/`status-toggle`; mobile `lib/ui/widgets/` — `ListWidget`/`SmartRefresher`/`StatusBadge`/`CustomAppBar`/`AppButton`).
- [ ] Figma web + mobile verified (per-screen node đủ 10 FEAT — 5 AP + 4 OB + hub).
- [ ] KG entities updated: `gf-accounting.knowledge-graph.yaml` (AccountingPeriod), `gf-inventory.knowledge-graph.yaml` (OpeningBalanceLine, StockLedgerDailySnapshot), `garage-mobile.knowledge-graph.yaml` (InventoryHubRoute + 3 tile config).
- [ ] Branch `feature/ep-inventory-v2-w04` (đã tồn tại — checkout ready); PKG-W04 v2 populated (đồng bộ CR + boundary split).
- [ ] Flyway window align on-call: `gf-inventory` V{N+1}__inventory_v2_ob_ledger.sql; `gf-accounting` migration (nếu bảng AP mới — verify với BE lead trước wave).

**Exit Criteria**:
- [ ] **gf-accounting**: entity `AccountingPeriod` (3 cấp Năm→Quý→Tháng + "Thuộc kỳ" + trạng thái OPEN/CLOSED + mở lại, không ràng buộc thứ tự); AP CRUD endpoints; endpoint READ `GET /protected/accounting/v1/accounting-periods/lock-check` cho `gf-inventory` gọi REST advisory (ADR-021). Feature-flag `Inventory:InventoryV2` gate. Test coverage ≥80%.
- [ ] **gf-inventory**: nền **sổ tồn (ledger)** — `inventory_stock_ledger` point-in-time daily snapshot theo (tenant+garage+warehouse+productCode)+snapshotDate (ADR-020 v4); engine `StockLedgerRecomputeEngine` interface C1..C8 baseline (OB import là writer đầu tiên); 7 endpoints W04-1..W04-7 (skip W04-2) — verify (fail-OPEN advisory) + import (fail-CLOSED all-or-nothing) + edit-line + delete-single + delete-lines (fail-fast theo `ids[]`); validate ĐVT khớp ĐVT chính; empty-file semantics PASS `canCommit=false`. Flyway `V{N+1}__inventory_v2_ob_ledger.sql`. Feature-flag `Inventory:InventoryV2` gate. Coverage ≥80%.
- [ ] **CR-20260707-01** (piggyback W04 Product List): `gf-inventory` `POST /protected/inventory/v1/internal-products/import` — validate-all-first, persist-all-or-none (1 tx), lỗi → rollback + 422 `errorRows[]`. **Atomic-only cutover từ GA — KHÔNG flag phụ `internal_product_import_atomic`** (endpoint vẫn giữ `@FeatureOn("Inventory:InventoryV2")` class-level per CR-20260707-02 — Ops kill-switch per-tenant vẫn hoạt động); legacy partial-success code path xóa dứt điểm khỏi codebase. `agg-garage-graph` mutation `confirmImportInternalProduct` response shape `{status: SUCCESS|REJECTED, errorRows[]}`; `garage-web` FE reject flow — nút "Xác nhận" disabled khi `errorRows > 0`. Docs cascade: `FEAT-CAT-PROD-IMPORT.md` AC-6/8/9 rewrite + BR-INV-PROD-IMPORT-ATOMIC-001 + UX-flow reject branch + API contract update.
- [ ] **CR-20260707-02** (piggyback W04 execution window — backfill W03 wave-spec): BE `gf-inventory` `@FeatureOn("Inventory:InventoryV2")` class-level trên 23 V2 controller W03 + 7 W04 OB controller (đã có trong `gf-inventory-api.md` v39-v42) → 403 khi OFF; BFF `agg-garage-graph` fail-fast 403 trước forward; FE `garage-web` TanStack Router `beforeLoad` + sidebar ẩn khi OFF; FE `garage-mobile` Firebase RemoteConfig gate `InventoryHubRoute` tile default ON. Docs cascade: 20 FEAT W03 rewrite §4.4/§4.6 → `Inventory:InventoryV2` + PKG-W03 §Infra Readiness bổ sung migration seed. TC ON/OFF kill-switch scenario.
- [ ] **agg-garage-graph**: §3e Accounting Period passthrough (AP CRUD) + §3g Opening Balance (6 op W04 — search/verifyImport/import/updateLine/deleteLine/deleteLines) — passthrough (not enrichment); auth header propagation; error-code map `ERR-INV-{009,010,017,018,019,020,024,032,033,034,035,036,048}` + `ERR-CMN-007` (503 fail-CLOSED). DataLoader N+1 nếu có nested. Vitest ≥80%.
- [ ] **garage-web**: routes `/inventory/accounting-periods` (list/tree/detail/edit form) + `/inventory/opening-balances` (list + import wizard 4-step + edit line + delete-selected). Reuse-First gate (tree hierarchy, date-period-picker, file-upload with preview, status-toggle). AC coverage 100% (5 AP + 4 OB). Testid ≥ 95%. Vitest ≥60%.
- [ ] **garage-web** Navigation & Routing: `frontend/gf-gms-web/src/layouts/home/modules/constants.ts` — menu entry parent "Danh mục kho" (hoặc "Kho V2" verbatim figma navbar) + child "Kỳ kế toán" + "Tồn đầu kỳ"; TanStack Router catch-all verify; RBAC per BR permissions.
- [ ] **garage-mobile**: **2 screen** (`InventoryHubPage` hub + `OpeningBalanceListPage` read-only list — scope narrowed per Figma registry `Product/ux/figma/figma-links.yaml` W04 mobile block). Cubit per screen; reuse `ListWidget`/`SmartRefresher`/`StatusBadge`/`CustomAppBar`/`AppButton`; SafeArea bottom + pull-to-refresh + skeleton. LocaleKeys MANDATORY (M-30). Widget/bloc_test/alchemist golden ≥60%. **8 FEAT còn lại (5 AP + FEAT-OB-IMPORT + FEAT-OB-EDIT + FEAT-OB-DELETE-LINES) web-only, KHÔNG build mobile**.
- [ ] **garage-mobile** hub (`FEAT-INV-MOBILE-MENU` state-matrix W04): render **3 tile** (Sản phẩm + Nhóm vật tư từ W03 + Tồn đầu kỳ từ W04). 3 tile W05/W06 (Phiếu nhập / Phiếu xuất / Tồn kho) **ẩn hoàn toàn** (BR-INV-MENU-002). Hub pure client navigation — không gọi BFF. Firebase RemoteConfig `Inventory:InventoryV2` gate (CR-20260707-02): hub ẩn khi OFF.
- [ ] Integration test: tạo cây kỳ (Năm→Quý→Tháng) trên `gf-accounting`; đóng kỳ → REST advisory `gf-inventory` fail-CLOSED chặn OB import trong kỳ; mở lại kỳ → import success → ghi sổ tồn ledger point-in-time snapshot; import file 501 dòng → `ERR-INV-041` reject; empty file → `canCommit=false` banner INFO; delete-lines fail-fast theo `ids[]`.
- [ ] AC coverage 100% (**10 FEAT** — 5 AP + 4 OB + FEAT-INV-MOBILE-MENU) trên web; mobile chỉ cover 2 FEAT có Figma mobile (`FEAT-OB-LIST` + `FEAT-INV-MOBILE-MENU`) — 8 FEAT còn lại web-only.
- [ ] Build/lint/test pass per boundary; REVIEW gates: `agent-review-backend` (gf-accounting + gf-inventory) + `agent-review-garage-web` + `agent-review-garage-mobile` P1=0; `scan-boundary.sh` exit 0; KG updated; 3-in-1 bump.
- [ ] Demo script `Tracking/demos/ep-inventory-v2-w04-demo.md` ready.

**Demo target** (staging, web + mobile end-to-end):
1. Kế toán tạo cây kỳ Năm 2026 → Quý 1..4 → Tháng 1..12 trên `gf-accounting`; đóng Tháng 1 → mở lại; xóa kỳ chưa dùng.
2. Chủ garage upload file OB template (mã + kho + Tồn đến ngày 2026-01-01 thuộc Tháng 1 — kỳ OPEN) → preview `verify` pass `canCommit=true` → confirm `import` → ghi sổ tồn ledger; xem list OB theo (mã+kho); sửa dòng SL + giá trị; xóa nhiều dòng (fail-fast nếu có id vi phạm).
3. Đóng lại Tháng 1 → import file OB Ngày 2026-01-15 → REST advisory `gf-inventory` → `gf-accounting` fail-CLOSED `ERR-INV-024` LOCKED_PERIOD → banner chặn.
4. Import file 501 dòng → `ERR-INV-041` reject; empty file → banner INFO "0 dòng, không thể commit".
5. **CR-20260707-01 demo**: user import mã sản phẩm với 5 dòng lỗi trong 100 dòng → button "Xác nhận" disabled → download file lỗi → sửa → re-upload → 100% pass → confirm success.
6. **CR-20260707-02 demo**: Ops flip tenant `Inventory:InventoryV2=OFF` qua gf-system → refresh web (sidebar Inventory ẩn) + mobile (hub tile ẩn) + API 403 fail-fast; flip ON → restore.
7. **Mobile hub (scope narrowed 2 màn)**: mở app → tap "Quản lý kho hàng" → 3 tile (Sản phẩm, Nhóm vật tư, Tồn đầu kỳ) — 3 tile W05/W06 không thấy; tap Tồn đầu kỳ → `OpeningBalanceListPage` read-only list → filter warehouse/product/date. **KHÔNG demo AP CRUD + OB import/edit/delete-lines trên mobile** (web-only per Figma registry).
Cross-platform consistency: kỳ tạo trên web → mobile OB list tra cứu (không có tạo/sửa/xóa mobile trong W04 scope).

### Wave 5 — Giao dịch kho: Nhập + Xuất (5 ngày)

| Field | Value |
|---|---|
| Phase | Inventory V2 slice 3/4 — Giao dịch (wave dày nhất) |
| Duration | 5 ngày làm việc |
| Features (14 + 1 cross-wave) | RECEIPT-V2 (7): `FEAT-IR-LIST-V2/CREATE-V2/DETAIL-V2/EDIT-V2/DELETE/PRINT/EXPORT` · DELIVERY-V2 (7): `FEAT-ID-LIST-V2/CREATE-V2/DETAIL-V2/EDIT-V2/DELETE/PRINT/EXPORT` · **Cross-wave state-matrix update**: `FEAT-INV-MOBILE-MENU` (hub enable 2 tile "Phiếu nhập" + "Phiếu xuất" per BR-INV-MENU-002; KHÔNG count vào FEAT count — ship hub base ở W04, W05/W06 chỉ flag flip). |
| Boundaries | `gf-inventory`, `agg-garage-graph`, `garage-web`, `garage-mobile`, `gf-sales`, `gf-purchase`, `gf-hrms` |
| Dependencies | W04 complete (hard gate: sổ tồn + lock kỳ + nguồn tồn) |

**Entry Criteria**:
- [ ] Hard gate W04→W05 pass (sổ tồn ghi/đọc stable; lock kỳ enforce; OB làm nguồn tồn test).
- [ ] Architecture pre-wave ratified (SA merge trước `/wave-start 05`): `Architecture/hld/gf-inventory-HLD.md` v23 §6b.7 (vòng đời Nháp⇄Ghi sổ; ghi sổ = engine `StockLedgerRecomputeService.recomputeBatch(M2)` cộng/trừ tồn theo SL quy đổi → ĐVT chính; chặn tồn âm point-in-time; tính lại tồn khi sửa/xóa) · `gf-inventory-api.md` v56 §0+§3c+§3d (**22 endpoint** W05-R1..R11 + W05-D1..D11: CRUD + post/unpost/delete + print/export + lookup/inherit) · `agg-garage-graph-graphql.md` v7.70 §0+§3h+§3i (**22 op** = 10 Q + 12 M; legacy Mobile slip ops deleted v7.70) · `gf-inventory-data-model.md` v29 §4c (6 bảng + 3 Flyway) · `INTEG-EXT-gf-inventory.md` v14 §13b lock-check 12 slip write-path + **§13c đọc gf-sales `so-summary` cho đối soát SO (cảnh báo fail-OPEN, không chặn)** · `INTEG-BFF-agg-garage-graph-gf-hrms.md` v1 (staff name resolve).
- [ ] **ADR ratify gate**: ADR-021 đã ACCEPTED (W04); **ADR-023 v2 (slip write-path engine + lock kỳ enforce §D5 fail-CLOSED) + ADR-024 v3 (cross-slip inheritance + đối soát SO) + ADR-025 v1 (staff ref Cognito) hiện PROPOSED → PHẢI flip ACCEPTED trước `/dev-start`**.
- [ ] PO sign-off EP-INVENTORY-RECEIPT-V2 v10 + EP-INVENTORY-DELIVERY-V2 v6 + BR-IRV2 v40 / BR-IDV2 ratified.
- [ ] Figma web + mobile confirmed 2026-07-15 (mobile scope narrow — 4 màn: 2 LIST có Post/Unpost inline row-action (mobile-only, khác web) + 2 DETAIL có Post/Unpost per AC-5/6: FEAT-IR-LIST-V2, FEAT-IR-DETAIL-V2, FEAT-ID-LIST-V2, FEAT-ID-DETAIL-V2; CREATE/EDIT/DELETE/PRINT/EXPORT web-only); KG entities (Receipt, Delivery + lines — data-model v29 §4c, KHÔNG prefix `Stock`).
- [ ] Branch `feature/ep-inventory-v2-w05` sau W04 merge; **PKG-W05 v2 populated** (full template per PKG-W04 pattern — 22 endpoint index + 22 op + agent effort ~97h).
- [ ] **Sizing watch**: wave 14 feat (dày nhất) — 2 module phiếu đồng nhất vòng đời; nếu actuals W04 cho thấy nguy cơ tràn 5 ngày → fallback tách W05a Nhập / W05b Xuất (PLANNING-PLAYBOOK §6.2, không kéo dài >5 ngày).

**Exit Criteria**:
- [ ] **gf-inventory**: phiếu Nhập V2 (Nguồn nhập + Loại phiếu Nhập mua/Nhập trả/Nhập khác; PO không bắt buộc; ghi sổ = cộng tồn) + phiếu Xuất V2 (ghi sổ = trừ tồn, check tồn khả dụng chặn âm; đối soát SO cảnh báo). Bỏ ghi sổ = đảo tồn về Nháp. Xóa khi kỳ chưa khóa.
- [ ] **gf-inventory**: chặn thêm/sửa/xóa phiếu có ngày chứng từ thuộc kỳ đã đóng; tính lại tồn khi sửa SP/SL/ngày/kho.
- [ ] **agg-garage-graph** + **garage-web** + **garage-mobile**: danh sách/tạo/sửa/chi tiết phiếu + ghi sổ/bỏ ghi sổ + in + xuất excel (P2: PRINT/EXPORT — drop trước nếu tràn timebox). Reuse-First gate (form phiếu nhập/xuất chung pattern).
- [ ] **garage-mobile**: enable 2 tile hub "Quản lý kho hàng" — **Phiếu nhập + Phiếu xuất** (BR-INV-MENU-002).
- [ ] Integration test: nhập → tồn tăng; xuất quá tồn → chặn; bỏ ghi sổ → đảo tồn; thao tác kỳ đóng → chặn. AC coverage 100% (14 FEAT) cả 2 platform.
- [ ] build/lint/test pass; REVIEW P1=0 (gồm security check đối soát SO cross-boundary); KG + 3-in-1; demo script ready.

**Demo target** (web + mobile): nhập kho (cộng tồn) → xuất kho cho SO (trừ tồn, đối soát SO cảnh báo lệch) → xuất quá tồn bị chặn (tồn âm) → bỏ ghi sổ phiếu nhập (đảo tồn) → sổ tồn realtime đúng; thao tác trên phiếu kỳ đã đóng bị chặn. Cross-platform.

### Wave 6 — Tính giá + Báo cáo (5 ngày)

| Field | Value |
|---|---|
| Phase | Inventory V2 slice 4/4 — Định giá + báo cáo |
| Duration | 5 ngày làm việc |
| Features (8 + 1 cross-wave) | PRC (5): `FEAT-PRC-LIST/CREATE/DETAIL/RECALC/DELETE` · STOCK-V2 (3): `FEAT-STK-LIST-V2/IP-VIEW-V2/STK-DETAIL-V2` · **Cross-wave state-matrix update**: `FEAT-INV-MOBILE-MENU` (hub enable tile "Tồn kho" → 6 tile đủ per BR-INV-MENU-002; KHÔNG list vào FEAT count — ship hub base ở W04, W05/W06 chỉ flag flip). |
| Boundaries | `gf-accounting` (**PRC master — NEW boundary W06**, per ADR-027/028 ratify 2026-07-22) · `gf-inventory` (Stock V2 Reports public + 5 PRC-facing S2S protected) · `agg-garage-graph` · `garage-web` · `garage-mobile` (**chỉ `FEAT-STK-LIST-V2`**) |
| Dependencies | W05 complete (hard gate: Nhập/Xuất trong kỳ + sổ tồn stable) |

**Entry Criteria**:
- [ ] Hard gate W05→W06 pass (giao dịch trong kỳ + sổ tồn stable — đầu vào BQGQ).
- [ ] Architecture (✅ UNBLOCK SA ratify per `Tracking/ARCH-REVIEW-W06.md` Round 3, 2026-07-23): §tính giá BQGQ cuối kỳ (đơn giá BQ = (GT đầu+GT nhập)/(SL đầu+SL nhập), làm tròn 2 lẻ; tồn đầu = tồn đến "Từ ngày"−1; **tính lặp hội tụ** khi có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu Xuất bán cùng kỳ — BR-PRC-017, safety cap 100 vòng) + §báo cáo (sổ tồn → tồn đến ngày / NXT / thẻ kho); `gf-accounting-api.md` v24 §5 (6 endpoint PRC) + `gf-inventory-api.md` v72 §3f (5 S2S) + §3g (3 report + 3 export) + `agg-garage-graph-graphql.md` v7.79 §3f+§3j (12 op); **ADR-027 v5 (engine BQGQ + tính lặp) + ADR-028 v4 (async HTTP 202 + Temporal workflow `PRC_TASK_QUEUE` embed trong `gf-accounting`) — ✅ ACCEPTED**.
- [ ] PO sign-off EP-INVENTORY-ACCOUNTING-PERIOD v23 (nhóm PRC) + EP-INVENTORY-STOCK-V2 v8 + BR-GF-INVENTORY-ACCOUNTING-PERIOD v40 + BR-GF-INVENTORY-STOCK-V2 v15 ratified — ✅ `agent-ba-review` 2026-07-24 (8/9 P1/P2 finding resolved same-day).
- [ ] Figma web (7/8 FEAT node — RECALC action inline DETAIL không cần node riêng) + mobile confirmed (mobile scope narrow — **chỉ `FEAT-STK-LIST-V2`**, node `21632:28892`; PRC + IP-VIEW-V2 + STK-DETAIL-V2 web-only); KG entities (`PriceCalcRun`/`PriceCalcRunItem` tại `gf-accounting`, report views tại `gf-inventory`).
- [ ] Branch `feature/ep-inventory-v2-w06` sau W05 merge; PKG-W06 v3 (full rebuild 2026-07-24) populated.

**Exit Criteria**:
- [ ] **gf-accounting** (PRC master): tính giá BQGQ cuối kỳ theo (mã+kho+gara) — chọn kỳ (tự điền Từ/Đến, khóa), "Tất cả mã" hoặc mã cụ thể; **async HTTP 202 kick-off + Temporal workflow polling 5s**; điền giá vốn phiếu xuất + cập nhật giá trị sổ tồn (qua 5 S2S protected endpoint gọi `gf-inventory`); tính lặp hội tụ (BR-PRC-017, safety cap 100); bảng "SP chạy giá lỗi" (3 lý do: tồn âm/lệch hạch toán/sự cố hệ thống). Tính lại (row mới + `source_run_id` + audit); chặn CREATE/RECALC/xóa log nếu kỳ đã đóng HOẶC run đang chạy.
- [ ] **gf-inventory**: báo cáo tồn đến ngày (tra sổ tồn ≤ D, hide-rule `SL≠0 OR GT≠0`) + NXT (4 nhóm cột Đầu/Nhập/Xuất/Cuối) + thẻ kho (đọc chi tiết phiếu, mỗi dòng = 1 phiếu thật, running pagination-safe); SL realtime, giá trị theo BQGQ (số/0, không "Tạm tính"); tách dòng theo kho; 3 endpoint export Excel.
- [ ] **agg-garage-graph** + **garage-web**: màn chạy/lịch sử/chi tiết/tính lại/xóa tính giá + 3 báo cáo + export. **garage-mobile**: chỉ báo cáo tồn đến ngày (read-only). Reuse-First gate.
- [ ] **garage-mobile**: enable 1 tile hub "Quản lý kho hàng" — **Tồn kho** → hub đủ 6 tile (BR-INV-MENU-002).
- [ ] Integration test: chạy BQGQ → giá vốn xuất + giá trị tồn khớp ví dụ; tính lại kỳ → kỳ sau cần tính lại; chạy giá kỳ có phiếu trả tự tham chiếu → hội tụ; concurrency 2 CREATE cùng kỳ+kho → 1 thành công 1 chặn. AC coverage 100% (8 FEAT) — web full, mobile 1/8.
- [ ] build/lint/test pass; REVIEW P1=0 (gồm Temporal workflow discipline + performance check báo cáo tồn đến ngày + perf BQGQ "tất cả mã"); KG + 3-in-1; demo script ready.

**Demo target** (web + mobile): chạy tính giá BQGQ cuối kỳ (Tất cả mã) → 202 kick-off → polling 5s → đơn giá BQ 2 lẻ + giá vốn xuất điền + giá trị sổ tồn cập nhật; báo cáo tồn đến ngày + NXT + thẻ kho khớp số; tính lại sau khi thêm phiếu → kết quả cập nhật; mobile chỉ xem báo cáo tồn đến ngày read-only. Cross-platform.

---

## P2.3 Test Waves

> Inventory V2 là vertical slice feature delivery — test cases bundled vào exit criteria mỗi wave (per AC structure Tại/Khi/Thì). Không tách WT riêng. Perf BQGQ + perf báo cáo tồn đến ngày + isolation (tenant + kho theo garage) raise CR/test bổ sung trước GA nếu phát sinh (LAUNCH-CHECKLIST §GA gate).

---

## P2.4 Parallel Execution Rules

| Rule | Áp dụng | Chi tiết |
|---|---|---|
| **Inter-wave** | W03→W04→W05→W06 tuần tự | 3 hard gate (P2.1.1). **Cấm** start wave sau trước khi wave trước merge + 24h soak. W03-W05 cùng 1 BE boundary `gf-inventory` → không song song. W06 thêm boundary `gf-accounting` (PRC master, tách biệt) nhưng vẫn tuần tự do data dependency (P2.1.1 điểm 4/5). |
| **Intra-wave** | 4 boundaries/wave | `gf-inventory` chốt contract + Flyway cuối ngày 1 (gate cho BFF/Web/Mobile); Web + Mobile share GraphQL contract; mock ngày 1-2, wire 3-4. |
| **Cross-boundary contract** | Ratify trước dev | ADR mã/SKU/ĐVT (W03); ADR sổ tồn + lock kỳ (W04); **ADR-027 (engine BQGQ) + ADR-028 (async Temporal) — ✅ ACCEPTED** (W06) phải merged trước wave tương ứng. INTEG đọc gf-sales SO (W05). INTEG-EXT-gf-accounting-gf-inventory (S2S bulk write giá vốn — W06). |
| **Review parallel** | Per-boundary post-handoff | `agent-review-backend` (gf-inventory mọi wave + `gf-accounting` W06 — PRC master) + `agent-review-garage-web` + `agent-review-garage-mobile`. |
| **FIX agents** | Standby sau REVIEW | `agent-fix-gf-inventory` / web / mobile activate nếu P1/P2. |
| **Sizing fallback** | W05 (14 feat) | Nếu actuals báo nguy cơ tràn 5 ngày → tách W05a Nhập / W05b Xuất; KHÔNG kéo dài wave >5 ngày (PLANNING-PLAYBOOK §6.2). |
| **MR design pre-wave** | Bắt buộc | SA soạn + approve + merge HLD/API/INTEG/ADR mỗi wave **trước** `/wave-start`. |
| **Inter-wave** | W01 → W02 sequential | 1 hard gate ở §1.1. **Cấm** start W02 trước W01 merged + 24h soak. |
| **Intra-W02 phase** | Phase A → Phase B sequential | Hard gate nội bộ §1.2. **Cấm** start Phase B (Dossier) trước khi Phase A (CR settlement + FEAT-INS-STL-CREATE) merged + panel "Tổng giá dịch vụ" per-payer + template in QT/báo giá stable trên staging. Dossier Phase B render PDF từ snapshot Phase A. |
| **Intra-wave W01** | 5 boundaries parallel | `gf-sales` + `gf-accounting` start cùng ngày 1; `agg-garage-graph` skeleton ngày 1 + wire ngày 2-3; `garage-web` + `garage-mobile` mock data ngày 1-2 + wire thật ngày 3-4. ADR-015 chốt cuối ngày 1. |
| **Intra-wave W02 Phase A** | 5 boundaries parallel | **FEAT-INS-STL-CREATE chạy ngày 1 Phase A** (reuse panel W01, ~6h, hấp thụ trong ~2d Phase A — không gate dossier). `gf-accounting` (FEAT-INS-STL-CREATE + CR-20260612-01 + CR-20260616-01 template + **CR-20260618-01 sửa logic sinh phiếu QT**) + `gf-sales` (CR-20260612-02 + phần in từ SO + **CR-20260618-02 template in PDV + CR-20260618-01 trigger sinh phiếu QT**) start cùng ngày 1; `agg-garage-graph` cờ "SO có Bảo hiểm" + panel snapshot + giá trị per-payer từng khoản (CR-20260616-02) + **cờ "KH còn phân bổ BH > 0" (CR-20260618-01)** ngày 1; `garage-web` + `garage-mobile` render panel/popup/bản in + reflow panel 2 cột (CR-20260616-02) + **render phiếu QT KH "chỉ phân bổ BH" layout Figma per-platform (CR-20260618-01)** ngày 1-2. Tái dùng component panel + template in từ W01. |
| **Intra-wave W02 Phase B** | 4 boundaries parallel với gate nội bộ | `gf-accounting` entity schema dossier chốt cuối ngày 1 Phase B (gate cho BFF + Web + Mobile). PDF gen + upload parallel với BFF/Web/Mobile work nếu mock interface có sẵn. Mobile buffer 0.5d permission + file picker. |
| **Cross-boundary contract** | Ratify trước dev | ADR-015 (allocation snapshot — W01), ADR-016 PDF engine + ADR-017 dossier versioning (W02) phải merged trước khi boundary tương ứng start. ADR-018 dashboard sync **defer** cùng FEAT-INS-DASH-DEBT. |
| **Review parallel** | Per-boundary post-handoff | `agent-review-backend` chấm 2 BE boundary (W01), 1 BE (W02). `agent-review-garage-web` chấm Web (mọi wave). `agent-review-garage-mobile` chấm Mobile (mọi wave). |
| **FIX agents** | Standby sau REVIEW | `agent-fix-*` activate nếu REVIEW flag P1/P2 — không pre-allocate. |
| **Test agents** | TEST_PLANNING song song REVIEW cuối wave | `agent-test-api` + `agent-test-ui` + `agent-test-e2e` generate TC từ AC + API contract; `agent-test-isolation` + `agent-test-performance` + `agent-test-security` periodic. |
| **MR design pre-wave** | Bắt buộc | Leader soạn full bộ HLD/API/data/event/integration/ADR cho mỗi wave → mở MR design branch → SA review + approve + merge **trước** `/wave-start`. Chưa approve = không start được wave. |
| **Feature flag** | Per-tenant | `insurance_settlement_enabled` flag — pilot 2-3 garage trước GA toàn platform (xem `RELEASE-PLAN.md`). |

---

## P2.5 NEED CONFIRMATION

| Item | Tại sao cần confirm | Owner | Blocks Wave |
|---|---|---|---|
| Phiếu QT KH (từ SO không BH) — bản in baseline giữ nguyên | CR-20260616-01 chỉ thêm "Phân bổ bảo hiểm" cho phiếu từ SO **có** BH; xác nhận phiếu từ SO không BH **không** đổi layout in (đã chốt trong CR — flag để DEV không vô tình áp section mới cho mọi phiếu) | Business Authority | W02 Phase A |
| Cờ "SO có chọn Bảo hiểm" — nguồn server-side cho web/mobile | Web/mobile cần cờ để quyết render "Phân bổ bảo hiểm" trên panel + bản in phiếu KH (CR-20260612-01 + CR-20260616-01 + FEAT-INS-STL-CREATE dùng chung). Xác nhận agg-garage-graph/snapshot expose cờ này | Backend Lead + BFF | W02 Phase A |
| Boundary chính module Dossier (gf-accounting vs `gf-insurance` mới) | Epic note §10.2 — Architect quyết định. Wave plan giả định **gf-accounting**. Nếu tách `gf-insurance` mới → W02 cần thêm setup boundary (~3d) | Solution Architect | W02 Phase B |
| Object storage provider | S3 (AWS) hay MinIO (self-host) hay Azure Blob? Bucket naming + IAM + lifecycle retention (Luật Kế toán 7 năm) | Platform + Security | W02 |
| PDF template engine choice (ADR-016) | Apache PDFBox / OpenHTMLtoPDF / iText / Puppeteer headless — performance + license + maintenance trade-off | Solution Architect + Backend Lead | W02 |
| Dossier upload virus scan strategy | ClamAV sidecar trong gf-accounting pod hay Lambda S3 trigger hay client-side check? | Security | W02 |
| Feature flag mechanism | Existing flag system (LaunchDarkly / homegrown) hay add mới? Granularity tenant-level đủ chưa? | Platform | W01 (cần resolve trước GA) |
| Legal approval timing cho 4 PDF template | Mẫu cần Legal review cuối W01 để W02 không bị block | Legal + Business Authority | W02 |
| SO entity backward compat sau migration | SO cũ (chưa có 5 cột) sau migration sẽ default NULL — query phải handle. Test với dump prod-like cuối W01 | Backend Lead + Delivery Authority | W01 |
| Release target date M4 GA | Chưa có deadline cụ thể từ Business Authority — cần để align communication + training kế toán | Business Authority | GA |
| Mobile UX design (Flutter screens + bottom sheets) | Epic + 4 FEAT chỉ document UI cho web (modal/tab/section). Mobile equivalent (bottom sheet / full-screen) cần BA + Mobile UX designer tạo trước W01 entry. Nếu mobile UX chưa có → W01 mobile bị block | BA + Mobile UX | W01, W02 |
| Mobile PDF rendering library | `pdfx` vs `flutter_pdfview` vs `syncfusion_flutter_pdfviewer` — license + perf + iOS/Android compat | Mobile Lead | W02 |
| Mobile file picker + permission strategy | iOS Photo Library + Camera + Files; Android Storage Access Framework (SAF) — permission rationale UI | Mobile Lead + UX | W02 |
| App Store + Play Console release process | TestFlight internal vs external review timeline; Play Console staged rollout %; build signing key holder | Mobile Lead + Platform | GA |
| Figma **mobile** link cho FEAT-INS-STL-CREATE (màn Tạo phiếu QT) | Web đã có node `13535-157815`; mobile chưa có link design. Nếu chưa có → STL-CREATE mobile bị block (web vẫn chạy). | BA + Mobile UX | W02 (mobile) |
| Figma **mobile** cho các màn Inventory V2 | ✅ **CLOSED 2026-07-15** — all 4 waves confirmed. Mobile scope narrow theo registry `Product/ux/figma/figma-links.yaml` (rule v11 2026-07-07: FEAT không gán Figma mobile = mobile out-of-scope): W03 = 8 FEAT catalog · W04 = 2 FEAT (FEAT-OB-LIST + FEAT-INV-MOBILE-MENU) · W05 = 4 FEAT LIST+DETAIL (LIST có Post/Unpost inline row-action mobile-only + DETAIL có Post/Unpost per AC-5/6, IR/ID) · W06 = 1 FEAT STK-LIST-V2. Các FEAT CREATE/EDIT/DELETE ở W05 web-only; PRC/STK-DETAIL/STK-ADJUST ở W06 web-only. | BA + Mobile UX | ✅ CLOSED |
| **ADR — cơ chế sổ tồn (ledger)**: point-in-time snapshot vs running balance | ✅ **CLOSED W04** — `ADR-020-stock-ledger-daily-snapshot.md` v4 ACCEPTED, merged W04 (point-in-time daily snapshot + engine `StockLedgerRecomputeService`) | Solution Architect | ✅ CLOSED |
| **ADR — lock kỳ kế toán** (đóng kỳ → chặn phiếu theo ngày chứng từ) | ✅ **CLOSED 2026-07-15** — `ADR-021` ACCEPTED W04 (OB write-path fail-CLOSED); `ADR-023 v3 §D5` (slip state-change lock-check trong tx, fail-CLOSED 503 `ERR-CMN-007`, kỳ CLOSED 422 `ERR-INV-024`) ACCEPTED cùng lô Gap #1 ratify batch. Test 7/8 ADR-023 sẽ verify trong W05 DEV | Solution Architect | ✅ CLOSED |
| **ADR-023 v3 + ADR-024 v4 + ADR-025 v2 ratify** (slip write-path engine · cross-slip inheritance + đối soát SO · staff ref Cognito) + INTEG-BFF-gf-hrms v2 | ✅ **CLOSED 2026-07-15** — Gap #1 ratify batch (user bachho procedural override + BA co-sign 3 sub-item Round 3 Q4 lines 115/123/145: SSO coverage adequate + wording confirm + `ERR-HRMS-STAFF-NOT-ELIGIBLE` add vào `Product/Commons/ERROR-CODE-REGISTRY.md v24 §4a` HRMS group). API v56 §3c/§3d + SDL v7.70 §3h/§3i "DESIGN" section-level markers vẫn giữ (file-level ACTIVE) — sẽ xóa marker cascade cùng /wave-start 05. gf-hrms cross-boundary CR skip raise (endpoint đã cascade sẵn tại `gf-hrms-api.md v2 §2 rows #19/#20` ACTIVE) | Solution Architect | ✅ CLOSED |
| **`so-summary` verb lệch + direction endpoint sai** (Gap #2 mở rộng): verify runtime code phát hiện `/protected/v1/product/so-summary` là do gf-INVENTORY expose (không phải gf-sales); ADR-024 v1-v4 D2 cite endpoint sai direction. Endpoint đúng cho use case = `GET /protected/v1/service-orders/{tenantId}/detail/{code}` existing tại gf-sales (client `GfSalesClient` gf-inventory đã có sẵn từ trước W05) | ✅ **CLOSED 2026-07-15** — Gap #2 batch: ADR-024 v5 + INTEG-EXT-gf-inventory v15 §13c rewrite 8 nơi + gf-inventory-HLD v24 §1/§5/§6b.7 update 8 nơi. Compare logic simplify match by `sku` (SO parts DTO không có warehouseCode) | Architecture Authority | ✅ CLOSED |
| **Auto-create phiếu từ PO/SO** (BR-IRV2-033 trigger `PurchaseOrderStatusChanged` · BR-IDV2-032 trigger SO status) — thuộc W05 hay defer? | ✅ **CLOSED 2026-07-15** — Gap #3 batch full include W05 per user bachho Q1=B (không CR raise). Spec đầy đủ: `gf-inventory-api.md v57 §3e` W05-AR1 (`POST /protected/receipts-v2/from-po`) + W05-AD1 (`POST /protected/deliveries-v2/from-so`) + `INTEG-EXT-gf-inventory.md v16 §13d` worker-consumer contract + `gf-inventory-HLD.md v25 §1` subsystem callout. Worker route per-tenant flag via `TenantSubscriptionCacheService`. V1 Protected exempt `@FeatureOff` giữ callable fallback (Gap #3 Q2=A). BQGQ W06 chỉ đọc V2 tables (Gap #3 Q3=A). Cascade Product follow-up EP §5.2 clarify defer BA authorize | SA + Delivery Authority | ✅ CLOSED |
| **ADR — engine BQGQ + tính lặp hội tụ** | Thuật toán phức tạp nhất (BR-PRC-017 tự tham chiếu); làm tròn 2 lẻ; recalc | Solution Architect + Backend Lead | ✅ **CLOSED 2026-07-22** — `ADR-027 v5` ACCEPTED (`/arch-design W06` Round 1). Công thức Đơn giá BQ = (GT đầu+GT nhập)/(SL đầu+SL nhập) `HALF_UP` scale 2; hội tụ = `avg_curr == avg_prev` trên giá trị đã round; `SAFETY_ITERATION_CAP=100` (safety-net, KHÔNG hard cap cứng theo BR — vượt cap → item ERROR/SYSTEM_ERROR, không hard-block toàn run). |
| **PRC chạy sync hay async** | Tính giá "Tất cả mã" + tính lặp có thể long-running → cần async pattern | Architecture Authority | ✅ **CLOSED 2026-07-23** — `ADR-028 v4` ACCEPTED: **HTTP 202 kick-off + Temporal workflow** (KHÔNG `gf-inventory-worker` — PRC master = `gf-accounting`, embed worker riêng task queue `PRC_TASK_QUEUE`, mirror `gf-sales` pattern; Common Gotcha #7 update 6 service dùng Temporal, Q2 v3 reversal từ v1 sync-HTTP-plus-background-thread). Client poll GET mỗi 5000ms fixed (KHÔNG backoff). |
| Perf "tồn đến ngày" + perf BQGQ ở quy mô lớn (mã × kho × ngày) | Spike trước GA rollout toàn tenant; có thể cần index/materialized strategy | Backend Lead | W06 (GA gate — `agent-test-performance` scope PKG-W06 §4.3, không block DEV wave) |
| gf-inventory V1 ↔ V2 coexistence (schema + entity) | V2 cộng sinh baseline V1; Flyway V{N+1} additive, không rewrite | Solution Architect + Backend Lead | W03 |
| App Store / Play Console release cho mobile Inventory V2 | TestFlight/Play staged; build signing | Mobile Lead + Platform | GA |

## 3. Test Waves

> Scope EP-INSURANCE-SETTLEMENT (đợt này) là vertical slice feature delivery — không tách wave WT-M / WT-F riêng. Test cases bundled vào exit criteria mỗi wave.

| Wave | Timing | Scope | Scale |
|---|---|---|---|
| (n/a) | — | Test cases per feature theo AC structure (Tại/Khi/Thì) bundled trong PKG-W01/W02 | — |

**Lý do**: 4 features cùng epic, cùng team, cùng codebase — test coverage per wave đủ đảm bảo regression. Nếu phát sinh performance regression hoặc security finding cross-wave, raise CR riêng + có thể trigger test wave bổ sung trước GA (xem `LAUNCH-CHECKLIST.md` §4 GA gate).


---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-10 | 24 | Delivery Authority qua quyết định Business Authority | **Đóng NEED CONFIRMATION retry/error UI W07**: đồng bộ FEAT Link v32 và PKG-W07 v5; retry/event `FAILED` xử lý ngầm ở backend/vận hành, không hiển thị badge/cảnh báo/nút thử lại trên Web/Mobile, state nghiệp vụ không rollback. Mọi UI tương lai phải qua CR/feature riêng. |
| 2026-08-10 | 23 | Delivery Authority (main agent, theo yêu cầu user) | **APPEND PART III — W07 Partner Link + Booking relay Driver Plus**, theo mẫu vertical-slice W06. Mở rộng `scope` thêm `ep-partner-link`; bổ sung Wave 7 timebox 5 ngày với 3 core feature (`FEAT-SYS-DRIVERPLUS-LINK`, Booking inbound, Booking outbound), 5 boundary thực thi (`gf-system`, `gf-sales`, BFF, Web, Mobile), Kafka topics/steps, entry/exit gate, demo, parallel rules và NEED CONFIRMATION. Khóa hướng **Kafka correlated response theo ADR-029**, không HTTP synchronous. Nêu rõ hai mục chưa có contract/UX quyết định (emit chứng từ SO/QT; retry/error state UI) là deferred ngoài Exit W07 để tránh scope mơ hồ. Cascade: tạo `PKG-W07-partner-link-booking-driver-plus.md` v1. |
| 2026-07-28 | 22 | Delivery Authority (user dev-ac) | **Version cite sync sau khi Architecture team fix NF-02**. §Wave 6 Entry Criteria dòng Architecture: `gf-inventory-api.md` v71 → v72 (NF-02 cascade-fix 2026-07-28: §5.2 Naming Registry sync đúng field `openingQty`/`openingValue` cho Thẻ kho Q3, `movementKind` retag W04-write-side-only). Xác nhận qua drift re-check `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md` verdict `CONSISTENT` — không còn drift Product↔Architecture cho W06. Cascade song song `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md v4→v5`. **KHÔNG đụng** nội dung khác §Wave 6 + PART I + W01-W05 + Change Log historical entries. |
| 2026-07-24 | 21 | Delivery Authority (`/gen-wave-plan` — main agent + user dev-ac) | **W06 full rebuild sync (cascade PKG-W06 v2→v3)**. §Wave 6 `\| Boundaries \|` row: `gf-inventory, agg-garage-graph, garage-web, garage-mobile` → `gf-accounting (PRC master — NEW boundary W06), gf-inventory (Stock V2 Reports public + 5 PRC-facing S2S), agg-garage-graph, garage-web, garage-mobile (chỉ FEAT-STK-LIST-V2)`. Root cause: quyết định "PRC master boundary" bị treo NEED CONFIRMATION từ khi tạo PART II (2026-06-24) — `/arch-design W06` Round 1 (2026-07-22, composite SA+Delivery+Backend Lead ratify) chốt `gf-accounting` làm PRC master (pattern ERP truyền thống SAP FI-CO — `gf-inventory` chỉ cấp data qua 5 S2S protected endpoint), KHÔNG phải `gf-inventory` như PKG-W06 skeleton v1/v2 giả định. Entry/Exit Criteria rewrite full: cite `gf-accounting-api.md v24 §5` (6 endpoint) + `gf-inventory-api.md v71 §3f+§3g` (5 S2S + 3 report + 3 export) + `agg-garage-graph-graphql.md v7.79 §3f+§3j` (12 op) + **`ADR-027 v5` (engine BQGQ + tính lặp hội tụ safety cap 100) + `ADR-028 v4` (async pattern = HTTP 202 kick-off + Temporal workflow `PRC_TASK_QUEUE` embed trong `gf-accounting`, KHÔNG `gf-inventory-worker` — Common Gotcha #7 update 6 service dùng Temporal, Q2 v3 reversal 2026-07-23 từ v1 sync-HTTP-plus-background-thread) — cả 2 ACCEPTED**; PO sign-off cite `agent-ba-review` 2026-07-24 verdict NEEDS_REVISION → 8/9 P1/P2 finding resolved same-day; Figma mobile narrow xác nhận **chỉ `FEAT-STK-LIST-V2`** (7/8 FEAT còn lại web-only, không phải "PRC + STK-DETAIL-V2 + STK-ADJUST web-only" như wording cũ mơ hồ). §P2.4 Parallel Execution Rules: `Cross-boundary contract` row cite ADR-027/028 + `INTEG-EXT-gf-accounting-gf-inventory`; `Review parallel` row add `gf-accounting`. §P2.5 NEED CONFIRMATION đóng 2 row treo từ đầu: "ADR — engine BQGQ + tính lặp hội tụ" → ✅ CLOSED (ADR-027 v5); "PRC chạy sync hay async (`gf-inventory-worker`)" → ✅ CLOSED (ADR-028 v4, quyết định KHÔNG dùng `gf-inventory-worker`). Row "Perf tồn đến ngày + BQGQ quy mô lớn" giữ OPEN nhưng downgrade từ "block W06" → "GA gate, không block DEV wave" (đã có `agent-test-performance` scope trong PKG-W06 §4.3). **Nguồn**: `Tracking/ARCH-REVIEW-W06.md` Round 3 UNBLOCK SA ratify + `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-24-RECHECK.md` verdict `MINOR_DRIFT` không block + `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-23.md` baseline. **KHÔNG đụng** §Wave 1-5 + PART I Insurance + §1..§P2.3 flow + §P2.5 row khác (auto-create PO/SO, sổ tồn, lock kỳ — đã CLOSED trước) + Change Log historical entries. Cascade: `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md v2→v3` (full rebuild, xem Change Log riêng). |
| 2026-07-20 | 20 | user ninhnguyen (Delivery Authority) + main-orchestrator | **W05 §Boundaries scope sync — CR-20260720-01 SELF_APPROVED MINOR**. Sync `§Wave 5` row `\| Boundaries \|` (line 543) với `PKG-W05 v13` canonical: add `gf-purchase` + `gf-hrms` boundary chính, upgrade `gf-sales` từ "**đọc** `gf-sales` (đối soát SO)" read-only footnote → boundary chính. Row cuối: `gf-inventory`, `agg-garage-graph`, `garage-web`, `garage-mobile`, `gf-sales`, `gf-purchase`, `gf-hrms`. Root cause: §Wave 5 row stuck at v11 pivot baseline chưa cascade khi PKG-W05 v11 (2026-07-16) promote `gf-sales`/`gf-purchase` từ read-only → producer per **ADR-026 v2** (producer FF-gate + V2 topic route `AC-NONPROD-DEV-INVENTORY-V2-{PURCHASE,SERVICE}-EVENTS`) + thêm `gf-hrms` per **ADR-025 v1** (staff lookup-by-iam endpoints, fail-CLOSED slip Create/Edit write-path). Hệ quả pre-fix: `infra/wave_scope.py` regex `` `([^`]+)` `` parse §Boundaries row → chỉ 5 boundary → `/infra-up 05` thiếu `gf-hrms` + `gf-purchase` → gf-inventory `PurchaseOrderConsumer` (ADR-026 v1 direct-consume) đói event khi PO producer down + slip Create/Edit fail-CLOSED khi gf-hrms unreachable. User ninhnguyen (Delivery Authority) identified drift 2026-07-20 Q&A session (main-orchestrator diagnostic `/infra-up 05 --dry` output only 5 boundary). `gf-accounting` (lock-check ADR-021) KHÔNG add — runtime pre-existing W04 dep, user ninhnguyen decision 2026-07-20 out-of-scope W05 infra derivation. Post-fix `/infra-up 05` sẽ start canonical **7 Java BE**: `gf-inventory` + `gf-sales` + `gf-purchase` + `gf-hrms` + `gf-erp-mdm` + `gf-customer` + `gf-system` (last 3 ALWAYS-ON) + `agg-garage-graph` BFF + `garage-web` SPA. **KHÔNG đụng** §Wave 5 Features + Entry Criteria + Exit + Demo + Dependencies + §P2.5 gap-map + PART I Insurance + W03/W04/W06 sections + Change Log historical entries. Cascade: `Tracking/CHANGE-REQUESTS.md` add CR-20260720-01 entry + `STATE.wave_scope.modify_allowlist` append 2 entry (`version` + `last_reviewed`). |
| 2026-07-15 | 19 | user bachho (Delivery Authority) + main agent | **W05 Gap #4 extend cascade — mobile List có Post/Unpost inline row-action mobile-only** (user confirm 2026-07-15: "màn list nó 2 nút ghi sổ và bỏ ghi sổ thì có ở trên mobile thôi. ko có trên web đâu"). Extend v18 wording (chỉ Detail) sang cả List. §Wave 5 Entry Criteria Figma bullet + §P2.5 row Figma mobile W05 subblock — "2 LIST read-only + 2 DETAIL có Post/Unpost" → "2 LIST có Post/Unpost inline row-action (mobile-only, khác web) + 2 DETAIL có Post/Unpost per AC-5/6". **Web List canonical UNCHANGED** (Sửa/Xóa/In row-action per FEAT-IR-LIST-V2 + FEAT-ID-LIST-V2 AC-7). Effort mobile dev 21h → 23h (+2h List row-action wiring) ghi trong PKG-W05 v7 §4.1. **Cascade Product tier follow-up needed** (BA authorize): FEAT LIST-V2 AC-7 wording cần add mobile-specific note. Mirror PKG-W05 v7 + LAUNCH-CHECKLIST v12. |
| 2026-07-15 | 18 | user bachho (Delivery Authority) + main agent | **W05 Gap #4 Mobile Post/Unpost cascade** — fix wording contradiction PKG-W05 v4 "mobile 4 màn read-only" vs FEAT-IR-DETAIL-V2 + FEAT-ID-DETAIL-V2 AC-4/5/6 canonical (Business Authority owned) mô tả nút Ghi sổ / Bỏ ghi sổ trên màn Detail có Figma mobile node đã gắn (`21629:24082` cho Receipt, `21629:28663` cho Delivery). Sửa 2 nơi: (a) §Wave 5 Entry Criteria bullet Figma line 16 — "4 FEAT LIST + DETAIL read-only" → "4 màn: 2 LIST có Post/Unpost inline row-action (mobile-only, khác web) + 2 DETAIL có Post/Unpost per AC-5/6" + expand web-only list add PRINT/EXPORT; (b) §P2.5 row Figma mobile line 665 — subblock W05 same update. **KHÔNG đụng** scope + Features + Boundaries + Exit criteria + Demo target + Change Log historical entries (bao gồm entry v12 line 405 giữ nguyên historical wording). Semantic tổng W05: mobile in-scope 4 màn (2 LIST + 2 DETAIL) với LIST read-only + DETAIL có 2 action Post/Unpost (button-state matrix theo trạng thái + lock kỳ). Effort +4h mobile dev (17h → 21h) ghi trong PKG-W05 v5 §4.1. Cascade PKG-W05 v6 + LAUNCH-CHECKLIST v11. |
| 2026-07-15 | 15 | user bachho (Delivery Authority) + Architecture Authority | **§P2.5 cascade Gap #2 resolve batch** (W05 pre-stage — scope expand architectural direction fix). Row "`so-summary` verb lệch" OPEN → ✅ **CLOSED** — Gap #2 initially flagged verb GET/POST inconsistency; verify runtime code `services/gf-sales/src/main/java` + `services/gf-inventory/src/main/java` phát hiện bug lớn hơn dự đoán: endpoint `/protected/v1/product/so-summary` do gf-INVENTORY expose (`InternalProductController.java:59` @GetMapping), gf-sales là CALLER via `InventoryClient.java:12` @GetExchange cho baseline SO delivery completion check. W05 ADR-024 D2 use case ngược lại (gf-inventory Delivery V2 gọi gf-sales lấy SO items). Endpoint đúng cho use case = `GET /protected/v1/service-orders/{tenantId}/detail/{code}` existing tại gf-sales `ProtectedServiceOrderController.java:27`; gf-inventory `GfSalesClient.getServiceOrderByCode(tenantId, code)` đã có sẵn từ trước W05 cho AC-8 legacy V1 delivery validation. **Cascade rewrite**: ADR-024 v4→v5 §Status + §Decision D2 (endpoint + compare logic pseudocode simplify match by `sku` — SO parts DTO không có `warehouseCode`, warehouse là delivery-time concept) + §Consequences + §References; INTEG-EXT-gf-inventory v14→v15 §13c intro line 401 + caller table §13c.1 + auth headers §13c.2 + compare logic pseudocode §13c.3 + forbidden §13c.6 (2 rules text update) + soft question §13c.7 S-W05-3 endpoint tên; gf-inventory-HLD v23→v24 §1 subsystem callout + cross-slip inheritance READ + cross-boundary touch + §5 Data Ownership row + §6b.7 latency budget + cache + N+1 + tenant fairness bulkhead + §7 Forbidden fail-CLOSED rule. **Semantic UNCHANGED**: latency 700ms, cache TTL 60s, fail-OPEN với marker `ERR-CMN-007-DEGRADED`, forbidden 6 rules. **KHÔNG đụng** 2 row còn OPEN: (i) auto-create phiếu PO/SO Gap #3; (ii) ADR engine BQGQ + PRC sync/async W06. Cascade: PKG-W05 unchanged (§3 Entry Criteria đã note ADR-024 v4 — nay bump v5 semantic tương thích) + LAUNCH-CHECKLIST v9 mirror. |
| 2026-07-15 | 14 | user bachho (Delivery Authority) + BA + Architecture Authority | **§P2.5 cascade Gap #1 ratify batch** (W05 pre-stage). (a) Row "ADR — lock kỳ kế toán" PARTIAL → ✅ **CLOSED** (ADR-023 v3 ACCEPTED §D5 cover slip lock-check trong tx fail-CLOSED). (b) Row "ADR-023 v2 + ADR-024 v3 + ADR-025 v1 ratify" OPEN → ✅ **CLOSED** (bundle: ADR-023 v3 + ADR-024 v4 + ADR-025 v2 + INTEG-BFF-agg-garage-graph-gf-hrms v2 flip PROPOSED → ACCEPTED; drift ADR-024 References verb `POST` → `GET` fix để khớp INTEG SSOT §4.6 row 30 — verb `GET` vs `POST` cross-cut Gap #2 vẫn OPEN sẽ xử lý riêng; BA co-sign 3 sub-item Round 3 Q4 lines 115/123/145: SSO coverage adequate + wording confirm + `ERR-HRMS-STAFF-NOT-ELIGIBLE` add vào `Product/Commons/ERROR-CODE-REGISTRY.md v24 §4a` HRMS group; gf-hrms cross-boundary CR skip raise — endpoint đã cascade sẵn `gf-hrms-api.md v2 §2 rows #19/#20` ACTIVE). Ratify được user bachho authorize procedural override (STATE hiện tại W04/TEST_EXECUTION, boundary_active=wave04_all, owned_paths=[]). **KHÔNG đụng** 3 row còn OPEN: (i) `so-summary` verb Gap #2; (ii) auto-create phiếu PO/SO Gap #3; (iii) ADR engine BQGQ + PRC sync/async W06. Cascade: PKG-W05 v3 + LAUNCH-CHECKLIST v8 + ADR-023 v3 + ADR-024 v4 + ADR-025 v2 + INTEG-BFF-gf-hrms v2 + ERROR-CODE-REGISTRY v24. |
| 2026-06-01 | 1 | Delivery Authority | Initial wave sequence cho EP-INSURANCE-SETTLEMENT — 3 waves vertical slicing (W01 Foundation 5d + W02 Dossier 4d + W03 Dashboard 2d). Superseded TD P0 Remediation scope cũ. 5 features P1 FEAT-INS-* (SO Adjustment, STL Detail, Dossier Create, Dossier View, Dashboard Debt). Hard gates W01→W02 (snapshot allocation contract + phiếu QT BH stable) và W02→W03 (dossier publish stable + summary contract). 4 boundaries Java BE (gf-sales + gf-accounting) + Node BFF (agg-garage-graph) + React Web (garage-web). Mobile out of scope. |
| 2026-06-01 | 2 | Delivery Authority | **Thêm garage-mobile vào tất cả 3 wave** (user feedback: kế toán + chủ garage dùng cả 2 platform, mobile workload tương đương web). Mỗi wave +5h-6h work cho Flutter equivalent (bottom sheet thay modal, full-screen thay tab, Dashboard card thay widget). Boundaries 4 → 5 mỗi wave. Calendar duration giữ nguyên (parallel team thêm 1 Mobile dev). Thêm INTEG-MOB-* contracts (3 file: SO-ALLOCATION, STL-DETAIL, DOSSIER, DASHBOARD). Thêm `agent-review-garage-mobile` vào review gates. Build commands bổ sung `flutter analyze && flutter test && flutter build apk --debug` (coverage ≥ 60%). 5 NEED CONFIRMATION items mới (mobile UX design, PDF library, file picker, App Store process, mobile timezone). GA timeline note: mobile có thể lag 24-48h do app store review. |
| 2026-06-01 | 3 | Delivery Authority | **Remove W03 Insurance Dashboard khỏi đợt này** per Business Authority decision. FEAT-INS-DASH-DEBT defer cho epic / wave kế tiếp. Scope rút gọn 3→2 waves: W01 Foundation (5d) + W02 Dossier (4d) = 9 ngày calendar / ~58h work. Bỏ §1.2 W02→W03 hard gate, §Wave 3 chi tiết, intra-wave W03 parallelism, ADR-018 dependency, NEED CONFIRMATION dashboard sync + widget timezone. Test waves: 4 features thay 5. Mobile timezone NEED CONFIRMATION cũng remove (chỉ liên quan widget). |
| 2026-06-12 | 4 | Delivery Authority | **Thêm FEAT-INS-STL-CREATE vào W02 — chạy ĐẦU wave** (CR mở rộng màn Tạo phiếu QT, hiển thị panel "Tổng giá dịch vụ" read-only). W02 features 2→3 (đợt này deliver 4→**5/6 features P1**). §1 graph (W02 box thêm slice ①), §1.2 intra-wave (STL-CREATE ngày 1, reuse panel W01, hấp thụ 4d không đổi calendar — **độc lập dossier, không hard gate mới, không loop**), §2 Wave 2 (Features + Entry: PO sign-off v1 + Figma web 13535-157815 / mobile NEED CONFIRMATION; Exit: gf-accounting block insuranceAdjustment read-only + reuse panel web/mobile; Demo Phần 0), §4 intra-wave W02. **Duration giữ 4d** (hấp thụ). Đồng bộ PKG-W02 v10, FEAT-INS-STL-CREATE v1, EP v18, BR-EP v28. NEED CONFIRMATION mới: Figma mobile link STL-CREATE (BA + Mobile UX). |
| 2026-06-24 | 5 | Delivery Authority | **APPEND PART II — EP-INVENTORY-V2 (Tồn kho V2), W03–W06** (cách B, KHÔNG đụng PART I Insurance). Frontmatter: tiêu đề bỏ hậu tố epic, `scope` 2 epic, thêm header 2-part. Planning theo M01 Vertical-Slice (PLANNING-PLAYBOOK governing), timebox 5 ngày/wave, đánh số nối tiếp W03+. 6 epic Inventory V2 / 42 feature chia 4 vertical slice: W03 Danh mục (12) · W04 Khởi tạo kho Kỳ+Tồn đầu+sổ tồn (8) · W05 Giao dịch Nhập+Xuất (14) · W06 Tính giá+Báo cáo (8). Boundary mỗi wave: gf-inventory + agg-garage-graph + garage-web + garage-mobile. Hard gate tuần tự W03→W04→W05→W06 (cùng 1 BE boundary). NEED CONFIRMATION: Figma mobile, ADR sổ tồn (W04) / lock kỳ (W05) / engine BQGQ (W06), PRC async via gf-inventory-worker. Đồng bộ PKG-W03..W06 (mới), Plan/README, RELEASE-PLAN, LAUNCH-CHECKLIST. |
