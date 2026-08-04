---
type: execution
artifact_kind: implementation-checklist
status: PLANNED
version: 2
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-09"
wave: "W01"
boundary: "garage-mobile"
---

# Implementation Checklist — W01 · garage-mobile

> Generate bởi orchestrator TRƯỚC `/spawn-dev garage-mobile`, từ `docs/Product/wave-01-tasks.md` +
> FEAT-INS-SO-ADJUSTMENT/STL-DETAIL ACs + **PKG §2.2 + 2 DEV NOTE (wiring + conditional-display)** +
> `.harness/_REVIEW-CHECKLIST.md`. Flutter / BLoC. Hai task T3+T6 là root-cause lỗi run trước.

## Tasks

- [x] T1 `InsuranceAllocationSection` dạng **inline Card trong ListView** (KHÔNG bottom sheet — Figma `397:23265`); tên `InsuranceAllocationBottomSheet` cũ là sai · scope:`lib/ui/service_order/**/insurance_allocation_section.dart` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-1` · review:`R5`
- [x] T2 BLoC `InsuranceAllocationCubit` quản lý 5 trường + realtime preview BH/KH/Tổng · scope:`lib/ui/service_order/**/cubit/**` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-8,AC-9,AC-11` · review:`R3,R7`
- [x] T3 **Wiring (DEV NOTE)**: mount `InsuranceAllocationSection` vào `ServiceOrderCreationPage` (`lib/ui/service_order/service_order_creation/service_order_creation_page.dart`) **CHỈ khi `isEdit == true`** (`fromServiceOrderDetail != null`) + toggle Bảo hiểm="Có"; KHÔNG ở Create (AC-0); read-only ở màn Chi tiết. **KHÔNG để widget mồ côi (0 reference)** · scope:`lib/ui/service_order/service_order_creation/service_order_creation_page.dart` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-0,AC-1` · review:`R1,R5`
- [x] T4 Toggle "%"/"Số tiền" qua `SegmentedButton` (3 trường); `TextField` (number) Khấu trừ BH; `TextField` % per dòng phụ tùng (Khấu hao); validation %∈[0,100], số ≥0 inline error · scope:`lib/ui/service_order/**/insurance_allocation_section.dart` · ac:`FEAT-INS-SO-ADJUSTMENT-AC-5,AC-7,AC-14` · review:`R5,R6`
- [x] T5 `InsuranceSettlementDetailScreen` `DefaultTabController` 4 tab + AppBar header + Card "Thông tin quyết toán" + Card KH/Xe + Tab "Chi phí" panel "Tổng giá dịch vụ" · scope:`lib/ui/settlement/**/insurance_settlement_detail_screen.dart` · ac:`FEAT-INS-STL-DETAIL-AC-4,AC-5,AC-9` · review:`R5,R6`
- [x] T6 **Conditional-display (DEV NOTE)**: CHỈ 2 khối "Phân bổ bảo hiểm" + "Tổng giá dịch vụ" gate theo `payerType == INSURANCE`; header/4-tab/nút "Chỉnh sửa phiếu"/action bar = layout mới cho MỌI loại phiếu; **CẤM cờ `isInsurance` bọc toàn màn** — hạ `isInsurance` xuống chỉ bọc `InsuranceAllocationPanel` + `TotalServicePricePanel` · scope:`lib/ui/settlement/**/insurance_settlement_detail_screen.dart` · ac:`FEAT-INS-STL-DETAIL-AC-6,AC-10,AC-11` · review:`R1,R5,R6`
- [x] T7 Nút "+ Tạo hồ sơ bảo hiểm" trong AppBar action — disabled (greyed) + SnackBar "Tính năng sẽ available ở Wave 2" (insurance-only AC-13) · scope:`lib/ui/settlement/**/insurance_settlement_detail_screen.dart` · ac:`FEAT-INS-STL-DETAIL-AC-13` · review:`R5,R6`
- [x] T8 GraphQL qua `graphql_flutter` — auth + tenant context propagate qua `Link` interceptor; documents tại `lib/core/services/graphql/documents/`; offline → snackbar khi mất kết nối · scope:`lib/core/services/graphql/documents/**` · ac:`FEAT-INS-STL-DETAIL-AC-1` · review:`R3,R8`
- [x] T9 Build_runner generators sync nếu chạm freezed/json_serializable/injectable/auto_route; cập nhật KG `knowledge-graph.yaml` (screens mới) · scope:`knowledge-graph.yaml`,`lib/**/*.g.dart`,`lib/**/*.freezed.dart` · ac:`FEAT-INS-STL-DETAIL-AC-4` · review:`R4,R9`
- [ ] T10 **(FIX CR-1780980611) Bind error theo `code`**: mobile đọc `errors[].extensions.code` (KHÔNG parse message) → snackbar/field-error/cảnh báo theo registry §5.5 (INS-1003/1004/1005/1008 field, `INS_ADJ_BH_PAYMENT_NEGATIVE` 1006 warning non-block, `INS_STL_*` + INS-9001/9002); message theo `code` i18n key · scope:`lib/features/insurance*/**`,`lib/core/**/error*/**` · ac:`AC-12`,`STL-DETAIL AC-1` · review:`R9` · ref:`CR-1780980611` (flag #3)

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] Self-review theo `.harness/_REVIEW-CHECKLIST.md`; verify phiếu QT Khách hàng thấy layout mới (chỉ thiếu 2 khối BH)
- [ ] `cd mobile/gf-garage-app && fvm flutter analyze && fvm flutter test --coverage && make build-apk-uat` pass; coverage ≥ 60%
- [ ] E2E `integration_test`: section KHÔNG mở từ SO Create
- [ ] 3-in-1 version bump KG; prefix `[dev]`

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-07 | 1 | Delivery Authority | Generated for W01/garage-mobile (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL); T3 wiring + T6 conditional-display = root-cause lỗi run trước. |
| 2026-06-09 | 2 | Delivery Authority (CR-1780980611) | +T10 bind error theo `extensions.code` (FIX): không parse message; INS-1006 warning non-block; message theo code i18n key. Flag #3. |
