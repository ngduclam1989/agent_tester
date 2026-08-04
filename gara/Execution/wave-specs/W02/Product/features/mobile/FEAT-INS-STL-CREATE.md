---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/ui/FEAT-INS-STL-CREATE.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-STL-CREATE"
source_feat_sha: "d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "brownfield-enhancement"
consumes_backend_feats: ["FEAT-INS-STL-CREATE"]
consumes_bff_feats: ["FEAT-INS-STL-CREATE"]
screens_touched:
  - "lib/ui/settlement/screens/create_settlement_screen.dart"
flutter_packages:
  - "flutter_bloc"
  - "graphql_flutter"
  - "go_router"
  - "freezed"
  - "get_it"
authoring_inputs:
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "78dfb9c9b06778ef56cd143a4244b300957f83879f552293638d5791aa2dc076"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-STL-CREATE.mobile.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
reviewer_fail_items_fixed: ["#18c", "#17"]
---

# FEAT-INS-STL-CREATE (Mobile): Màn Tạo phiếu quyết toán — panel phân bổ bảo hiểm read-only

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.
>
> **NEED CONFIRMATION [NC-1]**: Figma mobile node-id cho màn Tạo phiếu quyết toán (FEAT-INS-STL-CREATE) chưa xác nhận. Bundle §H PKG-W02 cung cấp node `13535-159225` cho web (CR-20260616-02 — Tạo QT), chưa có link mobile tương ứng. Dev cần confirm với BA/Design trước khi impl §5.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-STL-CREATE` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INSURANCE-SETTLEMENT`](../../epics/EP-INSURANCE-SETTLEMENT.md) |
| Wave | W02 |
| Status | DRAFT |
| Screens touched | `lib/ui/settlement/screens/create_settlement_screen.dart` |
| Flutter packages | `flutter_bloc`, `graphql_flutter`, `go_router`, `freezed`, `get_it` |
| Cross-tier consume | BE: `FEAT-INS-STL-CREATE` \| BFF: `FEAT-INS-STL-CREATE` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-STL-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/ui/FEAT-INS-STL-CREATE.md`](../../../../../Product/ui/FEAT-INS-STL-CREATE.md) |
| Source version | v6 |
| Source SHA | `d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` |
| Generated at | 2026-06-18T01:05:38+00:00 |

## 1. Mục đích nghiệp vụ

Kế toán / chủ garage cần đối chiếu chính xác phần phân bổ bảo hiểm — bao gồm các khoản điều chỉnh và số tiền BH thực trả — ngay trên màn Tạo phiếu quyết toán trước khi chốt, thay vì phải mở lại Phiếu dịch vụ để tra cứu. Feature này mở rộng luồng `FEAT-STL-CREATE` production bằng cách hiển thị panel "Tổng giá dịch vụ" read-only (3 khối: Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) snapshot từ SO, và đảm bảo số liệu BH thanh toán được tính server-side rồi snapshot vào cặp phiếu QT khi xác nhận — giảm sai sót và loại bỏ thao tác đối chiếu ngoài hệ thống.

## 2. Trách nhiệm Mobile (garage-mobile)

- **Extend màn tạo phiếu quyết toán** hiện có (`CreateSettlementScreen`) — thêm widget panel "Tổng giá dịch vụ" read-only phía trên nút "Xác nhận"; KHÔNG rebuild lại toàn màn.
- **Hiển thị có điều kiện**: nếu SO gốc có ≥ 1 dòng nguồn thanh toán BH → render panel đầy đủ 3 khối (2 cột BH + KH); nếu không có BH → render panel rút gọn 1 cột KH (không có khối "Phân bổ Bảo hiểm" và "Cân thanh toán" rút gọn 2 dòng).
- **Reuse-first**: ưu tiên tái dùng widget panel "Tổng giá dịch vụ" đã có từ W01 (FEAT-INS-SO-ADJUSTMENT) — chỉ truyền tham số chế độ hiển thị (`readOnly: true`, `payer: full | compact`); không dựng widget mới từ đầu.
- **Consume GraphQL query** từ BFF để lấy snapshot phân bổ BH gắn với SO tại thời điểm mở màn; field "Tổng tiền bảo hiểm trả" là read-only computed — không cho nhập.
- **State machine**: `initial → loading → loaded | error` qua Cubit; màn không có form nhập phân bổ — chỉ hiển thị dữ liệu đọc từ server.
- **RBAC**: giữ nguyên kiểm soát phân quyền baseline FEAT-STL-CREATE — chỉ `accountant` / `garage-owner` mới truy cập được màn này.

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 8 AC-IDs từ bundle §C đều phải có entry ở §3 hoặc §4.

### Cluster A — Mở màn và load dữ liệu

#### AC-1 → Mobile load màn Tạo phiếu QT từ SO đã hoàn thành

- **Khi**: người dùng tap action "Tạo phiếu quyết toán" từ màn chi tiết SO (trạng thái "Đã hoàn thành") trên mobile.
- **Mobile phải**: navigate sang `CreateSettlementScreen` với `serviceOrderId` làm param; dispatch `LoadSettlementFormEvent` để fetch snapshot SO (bao gồm cờ `soHasInsurance` và block phân bổ BH) từ BFF query.
- **State transition**: `InitialState → LoadingState → LoadedState(soSnapshot)` qua `CreateSettlementCubit`.
- **Widget**: `CreateSettlementScreen` (MODIFY — existing, thêm panel) → `ServiceTotalPanelWidget` (REUSE từ W01).
- **GraphQL op**: query `getServiceOrderForSettlement(serviceOrderId)` — lấy `soHasInsurance`, `payerBreakdown`, `insuranceAllocation`, `balanceSummary`.
- **i18n key (ARB)**: `settlement_create_title`, `settlement_loading_label`.
- **a11y**: `Semantics(label: 'Màn hình tạo phiếu quyết toán')` trên Scaffold; focus đặt vào tiêu đề panel khi loaded.
- **Ref**: paired BFF FEAT §6.1, Figma node — NEED CONFIRMATION [NC-1].

#### AC-2 → Mobile hiển thị có điều kiện panel "Tổng giá dịch vụ"

- **Khi**: `LoadedState` nhận được, Mobile kiểm tra `soHasInsurance` từ response BFF.
- **Mobile phải**: nếu `soHasInsurance = true` → render `ServiceTotalPanelWidget` chế độ `fullInsurance` (2 cột BH + KH, 3 khối đầy đủ); nếu `soHasInsurance = false` → render `ServiceTotalPanelWidget` chế độ `compactNoInsurance` (1 cột KH, ẩn khối "Phân bổ Bảo hiểm", "Cân thanh toán" chỉ 2 dòng KH + Tổng). Panel KHÔNG ẩn hẳn — luôn hiển thị ít nhất chế độ rút gọn.
- **State transition**: render quyết định tại `LoadedState.soHasInsurance`; không cần thêm event.
- **Widget**: `ServiceTotalPanelWidget(mode: FullInsuranceMode | CompactMode, readOnly: true)` — REUSE.
- **GraphQL op**: cùng query AC-1 — field `soHasInsurance` boolean.
- **i18n key (ARB)**: `settlement_panel_total_label`, `settlement_panel_insurance_section_label`.
- **a11y**: `Semantics(label: 'Bảng tổng giá dịch vụ, chỉ đọc')`.
- **Ref**: BR-INS-STL-CRE-009, BR-INS-SO-ADJ-009.

### Cluster B — Nội dung panel (các khối dữ liệu)

#### AC-3 → Mobile render bảng "Chi tiết theo bên thanh toán"

- **Khi**: panel chế độ `fullInsurance` được render.
- **Mobile phải**: hiển thị bảng dòng line item với 2 cột "Bảo hiểm thanh toán" và "Khách hàng thanh toán" — dữ liệu từ `payerBreakdown[]` trong BFF response; tất cả ô read-only (không tap để edit).
- **Widget**: `PayerBreakdownTableWidget` bên trong `ServiceTotalPanelWidget` — REUSE nếu đã có từ W01 FEAT-INS-SO-ADJUSTMENT; nếu chưa thì NEW với reuse pattern `DataTable` hoặc `ListView.builder` theo số dòng.
- **GraphQL op**: field `payerBreakdown[]{itemName, insuranceAmount, customerAmount}`.
- **i18n key (ARB)**: `settlement_payer_col_insurance`, `settlement_payer_col_customer`.
- **a11y**: `Semantics(label: 'Bảng chi tiết theo bên thanh toán')`.
- **Ref**: BR-INS-STL-CRE-009(a).

#### AC-4 → Mobile render section "Phân bổ Bảo hiểm" — chỉ khi SO có BH

- **Khi**: panel chế độ `fullInsurance`, section "Phân bổ Bảo hiểm" phải hiển thị 5 khoản điều chỉnh BH (chiết khấu liên kết VT, chiết khấu liên kết DV, giảm trừ bồi thường, khấu hao vật tư, khấu trừ bảo hiểm) dưới dạng read-only rows.
- **Mobile phải**: render `InsuranceAllocationSectionWidget` với 5 dòng từ `insuranceAllocation[]`; ẩn hoàn toàn khi `soHasInsurance = false`.
- **Widget**: `InsuranceAllocationSectionWidget` — REUSE từ W01 nếu đã tồn tại.
- **GraphQL op**: field `insuranceAllocation[]{adjustmentType, amount, sign}`.
- **i18n key (ARB)**: `settlement_ins_allocation_section_label`, `settlement_ins_adj_{type}_label`.
- **a11y**: `Semantics(label: 'Phần phân bổ bảo hiểm, chỉ đọc')`.
- **Ref**: BR-INS-STL-CRE-009(a).

#### AC-5 → Mobile render khối "Cân thanh toán"

- **Khi**: panel loaded — luôn render "Cân thanh toán" nhưng số dòng phụ thuộc `soHasInsurance`.
- **Mobile phải**: chế độ `fullInsurance` → 3 dòng (BH thanh toán + KH chịu + Tổng); chế độ `compact` → 2 dòng (KH + Tổng). Tất cả read-only, số liệu từ `balanceSummary` BFF.
- **Widget**: `BalanceSummaryWidget` bên trong `ServiceTotalPanelWidget` — REUSE.
- **GraphQL op**: field `balanceSummary{insurancePays, customerPays, total}`.
- **i18n key (ARB)**: `settlement_balance_insurance_row`, `settlement_balance_customer_row`, `settlement_balance_total_row`.
- **a11y**: `Semantics(label: 'Khối cân thanh toán')`.
- **Ref**: BR-INS-STL-CRE-009.

#### AC-6 → Mobile hiển thị trường "Tổng tiền bảo hiểm trả" — read-only computed

- **Khi**: panel `fullInsurance` đã render khối "Cân thanh toán".
- **Mobile phải**: hiển thị trường `insurancePays` là text label read-only (không phải TextField) — không cho người dùng chỉnh sửa; giá trị lấy từ BFF response `balanceSummary.insurancePays` (computed server-side theo BR-INS-STL-CRE-003).
- **Widget**: row trong `BalanceSummaryWidget` dùng `Text` widget với style `readOnlyAmount`; KHÔNG dùng `TextFormField`.
- **i18n key (ARB)**: `settlement_total_insurance_pays_label`.
- **a11y**: `Semantics(label: 'Tổng tiền bảo hiểm trả, chỉ đọc', value: formattedAmount)`.
- **Ref**: BR-INS-STL-CRE-003, CNF-INS-001 (resolved — computed, không nhập tay).

### Cluster C — Xác nhận tạo và phân quyền

#### AC-7 → Mobile trigger tạo cặp phiếu QT và snapshot panel

- **Khi**: người dùng tap nút "Xác nhận" sau khi đã đọc panel phân bổ.
- **Mobile phải**: dispatch mutation `createInsuranceSettlement(serviceOrderId, ...)` tới BFF; BFF/BE sẽ snapshot phân bổ tại thời điểm này (Mobile không tự snapshot — BE là SSOT); hiển thị `LoadingState` trong khi chờ; khi thành công → navigate về danh sách phiếu QT + SnackBar thành công.
- **State transition**: `LoadedState → SubmittingState → SuccessState | ErrorState`.
- **Widget**: nút "Xác nhận" trong `CreateSettlementScreen`; `CircularProgressIndicator` overlay khi `SubmittingState`.
- **GraphQL op**: mutation `createInsuranceSettlement(input: CreateInsuranceSettlementInput!)` — kết quả `{settlementCode, pairSettlementCode}`.
- **ops field**: `createInsuranceSettlement` (BFF canonical — per paired BFF FEAT §6.1).
- **i18n key (ARB)**: `settlement_confirm_button_label`, `settlement_create_success_message`.
- **a11y**: nút "Xác nhận" có `Semantics(label: 'Xác nhận tạo phiếu quyết toán', button: true)`; disable khi `SubmittingState`.
- **Ref**: BR-INS-STL-CRE-002 (snapshot by BE), BR-INS-STL-CRE-004 (atomic pair).

#### AC-8 → Mobile giữ nguyên RBAC baseline tạo phiếu QT

- **Khi**: người dùng truy cập route tạo phiếu QT.
- **Mobile phải**: kiểm tra role qua go_router guard — chỉ `accountant` và `garage-owner` được phép; role khác → redirect về màn không có quyền; không render nút "Xác nhận" nếu thiếu permission `settlement.create`.
- **State transition**: go_router `redirect` trước khi push `CreateSettlementScreen`.
- **Widget**: guard logic trong `app_router.dart`; nút "Xác nhận" wrapped trong `Visibility(visible: canCreate)`.
- **i18n key (ARB)**: `common_access_denied_message`.
- **a11y**: route guard không announce; nút ẩn không cần Semantics.
- **Ref**: BR-STL-CRE-004, BR-STL-CRE-005 (baseline permission).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám layout panel "Tổng giá dịch vụ" theo Figma node — **NEED CONFIRMATION [NC-1]**: chưa có node mobile; tạm thời dùng Web node `13535-159225` làm reference bố cục, điều chỉnh cho màn phone/tablet khi có Figma mobile.
- Design tokens từ `lib/theme/**` — không hardcode hex/dp; màu read-only field dùng token `colorSurfaceDisabled`.
- Phone (compact): panel scroll dọc, bảng cuộn ngang nếu 2 cột không vừa; tablet (medium+): panel 2 cột inline.
- Không re-invent spacing/typography — reuse `AppTextStyles` và `AppColors` hiện hành.

### 4.2 State machine + error handling

- Cubit states tường minh: `Initial | Loading | Loaded(soSnapshot) | Submitting | Success | Error(errorCode)`.
- Lỗi fetch dữ liệu panel → `ErrorState` + SnackBar inline thông báo không tải được thông tin phân bổ, kèm nút "Thử lại".
- Lỗi tạo phiếu (server reject) → map error code theo §4.9; KHÔNG silent fail.

### 4.3 Native interaction + permission

- Không cần permission hệ thống (camera/photo/location) cho flow này.
- Back gesture (Android) / swipe-to-pop (iOS): nếu đang ở `SubmittingState` → hiển thị Dialog xác nhận "Đang xử lý, bạn có muốn huỷ không?" trước khi pop.
- Không có deeplink riêng cho màn tạo QT — entry duy nhất từ SO detail.

### 4.4 Offline + connectivity

- Màn tạo phiếu QT yêu cầu online (transaction state-changing — không offline).
- Nếu mất kết nối khi đang submit → `ErrorState(ERR_NETWORK)` + SnackBar "Mất kết nối, vui lòng thử lại".
- Không cache dữ liệu panel vào Hive — luôn fetch mới mỗi lần mở màn (snapshot tức thời từ SO).

### 4.5 i18n + a11y

- Mọi label qua ARB (`lib/l10n/intl_vi.arb`, `intl_en.arb`) — không hardcode tiếng Việt inline.
- Số tiền format qua `NumberFormat.currency(locale: 'vi_VN', symbol: 'đ')`.
- `Semantics` widget cho mọi icon-only button; read-only amount field có `value:` trong Semantics.
- Tap target ≥ 48dp cho nút "Xác nhận"; contrast ratio WCAG AA cho text trên `colorSurfaceDisabled`.
- TalkBack (Android) / VoiceOver (iOS): panel read-only announce "chỉ đọc" qua `Semantics(readOnly: true)`.

### 4.6 RBAC render + feature flag

- Feature flag: `insurance_settlement_enabled` — nếu tắt, không render panel BH (chỉ render panel compact baseline).
- Route guard: `settlement.create` permission check tại go_router redirect.
- Nút "Xác nhận" chỉ enabled khi `canCreate = true` (kiểm tra qua user claims từ JWT).

### 4.7 Business rule secondary (UI hint)

- BR-INS-STL-CRE-001 (SO loại "Dịch vụ xe" + có dòng BH): BE enforce primary; Mobile nhận error code nếu vi phạm, hiển thị Dialog "SO không hợp lệ để tạo phiếu QT BH".
- BR-INS-STL-CRE-003 (field BH thanh toán = computed): Mobile enforce bằng cách render `Text` không phải `TextFormField` — không có UI path nào cho nhập tay.
- BR-INS-STL-CRE-008 (SO phải có thông tin công ty BH): nếu BFF trả lỗi `ERR-INS-STL-008` → Dialog "SO chưa có thông tin công ty BH, vui lòng cập nhật trước".
- CNF-INS-003 (SO khoá sau khi có phiếu QT): Mobile không hiển thị hành động sửa SO từ màn này — chỉ navigate "Quay lại SO".

### 4.8 Performance

- Panel không phải list dài — không cần `ListView.builder` (< 20 dòng điều chỉnh).
- Avoid rebuild toàn `CreateSettlementScreen` — bọc `ServiceTotalPanelWidget` trong `BlocBuilder<CreateSettlementCubit, CreateSettlementState>` granular; phần còn lại của màn dùng `const`.
- `const` constructor cho tất cả widget tĩnh trong panel (label, divider).

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `ERR-INS-STL-001` | Dialog | `AlertDialog` — SO không hợp lệ tạo phiếu BH | AC-1 |
| `ERR-INS-STL-008` | Dialog | `AlertDialog` — SO chưa có thông tin công ty BH | AC-1, AC-8 |
| `ERR-INS-STL-004` | SnackBar | Lỗi rollback atomic pair | AC-7 |
| `ERR-NETWORK` | SnackBar + nút Thử lại | `SnackBarAction` | AC-1, AC-7 |
| `ERR-INS-003` | SnackBar warning (warn-and-allow) | `SnackBar` màu warning | AC-7 (từ BR-INS-SO-ADJ-010) |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> **NEED CONFIRMATION [NC-1]**: Figma mobile node-id chưa xác nhận. Cột Figma node-id dưới đây để trống hoặc dùng node web tạm — cần BA/Design confirm trước impl §5.

### 5.1 Screens

| Screen | go_router path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `CreateSettlementScreen` | `/settlement/create/:serviceOrderId` | MODIFY (add panel) | NEED CONFIRMATION [NC-1] | AC-1, AC-2, AC-7, AC-8 |

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `ServiceTotalPanelWidget` | `lib/ui/settlement/widgets/service_total_panel_widget.dart` | REUSE/MODIFY (add readOnly + mode param) | StatelessWidget | reuse từ W01 | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `PayerBreakdownTableWidget` | `lib/ui/settlement/widgets/payer_breakdown_table_widget.dart` | REUSE nếu có / NEW nếu chưa | StatelessWidget | DataTable / ListView.builder | AC-3 |
| `InsuranceAllocationSectionWidget` | `lib/ui/settlement/widgets/insurance_allocation_section_widget.dart` | REUSE nếu có / NEW nếu chưa | StatelessWidget | Column + Row | AC-4 |
| `BalanceSummaryWidget` | `lib/ui/settlement/widgets/balance_summary_widget.dart` | REUSE nếu có / NEW nếu chưa | StatelessWidget | Column | AC-5, AC-6 |

### 5.3 Navigation

| Route | Screen | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/settlement/create/:serviceOrderId` | `CreateSettlementScreen` | `redirect: requireAuth + settlement.create role check` | (không có deeplink riêng) | AC-1, AC-8 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Màn tạo QT + panel | Cubit | `lib/ui/settlement/create_settlement_cubit.dart` | `Initial / Loading / Loaded(soSnapshot) / Submitting / Success / Error(code)` | AC-1 đến AC-8 |

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| `getServiceOrderForSettlement` | query | `Query()` | `lib/ui/settlement/data/settlement_repository.dart` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |
| `createInsuranceSettlement` | mutation | `Mutation()` | `lib/ui/settlement/data/settlement_repository.dart` | AC-7 |

> Tên op `createInsuranceSettlement` đã xác nhận theo BFF canonical (paired BFF FEAT §6.1 — reviewer item #17).

### 6.2 REST endpoints consumed direct

Không có — Mobile chỉ consume qua BFF GraphQL.

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| Panel snapshot | Không cache | — | Fetch mỗi lần mở màn | AC-1 |
| Submit queue | Không offline queue | — | Online required | AC-7 |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Back gesture khi submitting | `WillPopScope` / `PopScope` (Flutter 3.x) | Back button intercept | Hiển thị Dialog xác nhận khi `SubmittingState` |
| Number format | `vi_VN` locale (cùng Android) | `vi_VN` locale | `NumberFormat.currency` |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/garage-mobile/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/settlement/` | `create_settlement_page.dart` | MODIFY (add panel + submitting state) | Extend existing | ~80 thêm | AC-1, AC-2, AC-7, AC-8 |
| `lib/ui/settlement/widgets/` | `service_total_panel_widget.dart` | REUSE/MODIFY (thêm mode + readOnly params) | Extend existing | ~60 thêm | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `lib/ui/settlement/widgets/` | `payer_breakdown_table_widget.dart` | REUSE / NEW | DataTable | ~120 nếu NEW | AC-3 |
| `lib/ui/settlement/widgets/` | `insurance_allocation_section_widget.dart` | REUSE / NEW | Column + Row | ~80 nếu NEW | AC-4 |
| `lib/ui/settlement/widgets/` | `balance_summary_widget.dart` | REUSE / NEW | Column | ~70 nếu NEW | AC-5, AC-6 |
| `lib/ui/settlement/` | `create_settlement_cubit.dart` | MODIFY (thêm states Submitting/Success) | Extend existing Cubit | ~50 thêm | AC-1 đến AC-8 |
| `lib/core/repositories/settlement/` | `settlement_repository.dart` | MODIFY (thêm mutation method) | Extend existing | ~40 thêm | AC-7 |
| `lib/core/models/settlement/` | `so_settlement.dart` | NEW | freezed + JsonSerializable | ~60 | AC-1 đến AC-6 |
| `lib/router/` | `app_router.dart` | MODIFY (guard đã có, verify) | go_router | ~5 verify | AC-8 |
| `assets/localizations/vi.json` | — | MODIFY |  easy_localization | ~15 keys | AC-1 đến AC-8 |
| `assets/localizations/en.json` | — | MODIFY |  easy_localization | ~15 keys | AC-1 đến AC-8 |
| `test/settlement/` | `create_settlement_cubit_test.dart` | MODIFY / NEW | bloc_test | ~100 | AC-1, AC-7 |
| `test/settlement/` | `service_total_panel_widget_test.dart` | NEW | flutter_test | ~120 | AC-2 đến AC-6 |

## 8. Implementation sequence DAG (Mobile — S6)

```
(← BFF tier S5: SDL + resolver stable — getServiceOrderForSettlement + createInsuranceSettlement)
(← NEED CONFIRMATION [NC-1]: Figma mobile node confirmed)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 SDL stable + Figma confirmed + RBAC permission list stable
    Exit: Widget test green + Patrol E2E happy path green
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Mô hình dữ liệu `SoSettlement` (freezed) + Repository method | data layer | BFF S5 stable | Build pass | BFF S5 |
| S6.2 | Cubit extend: thêm Loading/Submitting states + fetch/submit methods | layer | S6.1 done | Unit test pass | S6.1 |
| S6.3 | Widget panel reuse/extend: ServiceTotalPanelWidget + 3 sub-widget |/widgets | S6.2 done + Figma NC-1 | Widget test green | S6.2, NC-1 |
| S6.4 | Integrate panel vào CreateSettlementScreen + submitting overlay |/screens | S6.3 done | Widget test screen pass | S6.3 |
| S6.5 | i18n ARB keys + a11y Semantics | l10n | S6.4 done | Build pass | S6.4 |
| S6.6 | Patrol E2E happy path | integration_test | S6.5 done | E2E green | S6.5 |

## 9. Business Rules to enforce (Mobile — UI hint + secondary)

> BE tier là SSOT enforcement. Mobile chỉ UI hint.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INS-STL-CRE-001` | CORNERSTONE | Dialog "SO không hợp lệ" nếu server reject | `create_settlement_screen.dart::_handleError` | AC-1 | BE final enforce |
| `BR-INS-STL-CRE-003` | CORNERSTONE | Render `Text` không phải `TextField` cho BH thanh toán | `balance_summary_widget.dart` | AC-6 | Không có UI path nhập tay |
| `BR-INS-STL-CRE-004` | CORNERSTONE | SnackBar khi rollback atomic pair fail (`ERR-INS-STL-004`) | `create_settlement_screen.dart` | AC-7 | BE enforce atomic |
| `BR-INS-STL-CRE-008` | CORNERSTONE | Dialog "SO chưa có thông tin công ty BH" | `create_settlement_screen.dart::_handleError` | AC-1 | Guard trước submit |
| `BR-INS-STL-CRE-009` | NORMAL | render mode `fullInsurance` / `compactNoInsurance` theo `soHasInsurance` | `service_total_panel_widget.dart` | AC-2, AC-4, AC-5 | Conditional display |
| `BR-INS-SO-ADJ-010` | NORMAL | SnackBar warning (warn-and-allow) khi BFF trả `ERR-INS-003` | `create_settlement_screen.dart` | AC-7 | Warn không block |
| `BR-STL-CRE-004` | CORNERSTONE | Route guard `settlement.create` | `app_router.dart::redirect` | AC-8 | RBAC baseline |

> **Primary enforcement** = BE tier (`ui/be/FEAT-INS-STL-CREATE.md §9`).

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (navigate + loading state) | test-mobile-ui | Cubit mock |
| AC-2 | Widget test (conditional render panel) | test-mobile-ui | `soHasInsurance` true/false cases |
| AC-3 | Widget test (PayerBreakdownTable render) | test-mobile-ui | 2-cột vs 1-cột |
| AC-4 | Widget test (InsuranceAllocationSection hiện/ẩn) | test-mobile-ui | golden snapshot |
| AC-5 | Widget test (BalanceSummary 3 dòng vs 2 dòng) | test-mobile-ui | conditional rows |
| AC-6 | Widget test (BH field không phải TextField) | test-mobile-ui | verify widget type `Text` |
| AC-7 | Widget test (submit → SubmittingState → SuccessState) + Cubit test | test-mobile-ui | mutation mock |
| AC-8 | Widget test (RBAC guard — redirect khi thiếu permission) | test-mobile-ui + test-isolation | dual persona |
| (smoke) | Patrol E2E happy path: SO có BH → tạo phiếu QT thành công | test-mobile-e2e | patrol / integration_test |

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `settlement_create_title` | "Tạo phiếu quyết toán" | "Create Settlement" | AC-1 |
| `settlement_loading_label` | "Đang tải thông tin..." | "Loading..." | AC-1 |
| `settlement_panel_total_label` | "Tổng giá dịch vụ" | "Total Service Price" | AC-2 |
| `settlement_panel_insurance_section_label` | "Phân bổ Bảo hiểm" | "Insurance Allocation" | AC-4 |
| `settlement_payer_col_insurance` | "Bảo hiểm thanh toán" | "Insurance Pays" | AC-3 |
| `settlement_payer_col_customer` | "Khách hàng thanh toán" | "Customer Pays" | AC-3 |
| `settlement_balance_insurance_row` | "BH thanh toán" | "Insurance Total" | AC-5 |
| `settlement_balance_customer_row` | "KH chịu" | "Customer Total" | AC-5 |
| `settlement_balance_total_row` | "Tổng thanh toán" | "Grand Total" | AC-5 |
| `settlement_total_insurance_pays_label` | "Tổng tiền bảo hiểm trả" | "Total Insurance Amount" | AC-6 |
| `settlement_confirm_button_label` | "Xác nhận" | "Confirm" | AC-7 |
| `settlement_create_success_message` | "Tạo phiếu quyết toán thành công" | "Settlement created successfully" | AC-7 |
| `settlement_so_invalid_error` | "Phiếu dịch vụ không hợp lệ để tạo phiếu quyết toán bảo hiểm" | "Service order is not eligible for insurance settlement" | AC-1 |
| `settlement_so_no_insurance_company_error` | "Phiếu dịch vụ chưa có thông tin công ty bảo hiểm" | "Service order missing insurance company information" | AC-1 |
| `common_access_denied_message` | "Bạn không có quyền truy cập chức năng này" | "Access denied" | AC-8 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: 'Màn hình tạo phiếu quyết toán')` trên root Scaffold | VoiceOver/TalkBack identify screen |
| AC-2 | `Semantics(label: 'Bảng tổng giá dịch vụ, chỉ đọc')` cho panel | announce readOnly |
| AC-3 | `Semantics(label: 'Bảng chi tiết theo bên thanh toán')` | table context |
| AC-4 | `Semantics(label: 'Phần phân bổ bảo hiểm, chỉ đọc')` | ẩn khi `soHasInsurance = false` (`excludeSemantics`) |
| AC-5 | `Semantics(label: 'Khối cân thanh toán')` | — |
| AC-6 | `Semantics(readOnly: true, value: formattedAmount, label: 'Tổng tiền bảo hiểm trả')` | announce giá trị |
| AC-7 | `Semantics(label: 'Xác nhận tạo phiếu quyết toán', button: true, enabled: !isSubmitting)` | disable announce khi submitting |
| AC-8 | Route guard không announce; nút ẩn dùng `ExcludeSemantics` | RBAC hidden element |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/ui/be/FEAT-INS-STL-CREATE.md` | DRAFT | BR primary enforcement, snapshot logic, atomic pair — read-only ref |
| BFF | `Execution/wave-specs/W02/Product/ui/bff/FEAT-INS-STL-CREATE.md` | DRAFT | GraphQL ops consumed (§6.1) — read-only ref |
| FE Web | `Execution/wave-specs/W02/Product/ui/fe-web/FEAT-INS-STL-CREATE.md` | DRAFT | Scope tương đương cho Web — read-only ref; widget panel có thể tham khảo layout logic |

**Source ID consistency** (item #18): `source_feat_sha` = `d417efec40fb1db1820affaa12a4e6043c68811c93ccfcdc8d58da935232d3bd` — identical với BE/BFF/FE files.

## 13. References

- **Source**: [`Product/ui/FEAT-INS-STL-CREATE.md`](../../../../../Product/ui/FEAT-INS-STL-CREATE.md) v6
- **Paired BE**: [`ui/be/FEAT-INS-STL-CREATE.md`](../be/FEAT-INS-STL-CREATE.md)
- **Paired BFF**: [`ui/bff/FEAT-INS-STL-CREATE.md`](../bff/FEAT-INS-STL-CREATE.md)
- **Paired FE Web**: [`ui/fe-web/FEAT-INS-STL-CREATE.md`](../fe-web/FEAT-INS-STL-CREATE.md)
- **PKG**: [`PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **BR file**: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` (§2.2, §2.3)
- **ADR-015**: REST sync gf-accounting public debt summary
- **ADR-016**: PDF generation + storage strategy (Phase B reference)

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260612-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260612-01--ins-stl-detail-panel-split-by-payer) | Panel chi tiết QT tách per-payer | APPROVED | Panel chi tiết QT tách per-payer (share component với Tạo QT) |
| [CR-20260612-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260612-02--ins-so-complete-popup-negative-bh-warn) | Popup hoàn thành SO cảnh báo Tổng BH âm | APPROVED | Render warning line trong popup `ERR-INS-003` |
| [CR-20260616-02](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260616-02--ins-total-panel-allocation-two-column) | Panel "Tổng giá dịch vụ" 2 cột (BH \| KH) | APPROVED | Layout 2 cột (BH \| KH) cho khối Phân bổ + Cân thanh toán |
| [CR-20260618-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260618-01--ins-stl-create-dual-voucher-when-insurance-covers-all) | Sinh phiếu QT KH khi BH 100% + KH chịu phân bổ | APPROVED | Render phiếu QT KH "chỉ phân bổ BH" layout (3 khoản dấu +) |

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-INS-STL-CREATE` W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm Mobile, §3 Mobile behaviour map 8 AC-IDs (AC-1 đến AC-8), §4 visual + state + native + offline + i18n + a11y + RBAC + BR secondary + perf + error mapping, §5-§11 Mobile-specific (screen MODIFY + widget REUSE-first + Cubit + repo). NEED CONFIRMATION [NC-1]: Figma mobile node-id chưa xác nhận — cần BA/Design confirm trước impl §5. Source FEAT chỉ audit. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix reviewer items #18c + #17. §1 replace bằng canonical BE wording (byte-equal cross-tier). AC-7 §3 op field xác nhận `createInsuranceSettlement` là BFF canonical; §6.1 table note cập nhật tương ứng. |
| 2026-06-22 | 3 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 4 CR liên quan tier mobile: CR-20260612-01, CR-20260612-02, CR-20260616-02, CR-20260618-01. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
