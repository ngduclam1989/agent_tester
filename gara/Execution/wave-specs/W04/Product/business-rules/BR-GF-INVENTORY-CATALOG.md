---
type: execution-spec
artifact_kind: business-rule
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source_ref: "Product/business-rules/BR-GF-INVENTORY.md#26-hub-điều-hướng-mobile-br-inv-menu-001--br-inv-menu-004--mobile-only"
source_version: 3
source_sha: "NEED CONFIRMATION — SHA256 chưa tính được trong phiên author này (không có Bash tool khả dụng); orchestrator/CI backfill trước khi bump ACTIVE"
generated_at: "2026-07-08T00:00:00Z"
boundary: "garage-mobile"
applies_to_feats:
  - FEAT-INV-MOBILE-MENU
parent_pkg: "PKG-W04-inventory-period-opening-balance"
w04_scope_note: "mobile-menu-state-matrix-supplement"
---

# BR-GF-INVENTORY-CATALOG — Wave W04 Supplement Spec (Mobile Hub State Matrix)

> **Phạm vi hẹp (narrow-scope supplement)**: file này CHỈ author phần **BR-INV-MENU-001..004** (hub điều hướng mobile `FEAT-INV-MOBILE-MENU`) — bao gồm state matrix 3 tile W03/W04 đang active + 3 tile W05/W06 ẩn hoàn toàn, và gate feature-flag `Inventory:InventoryV2` cho hub (per CR-20260707-02).
>
> **KHÔNG re-generate AC catalog CRUD** (BR-CAT-GRP-*, BR-CAT-PROD-*, CB-CAT-*) — bản đầy đủ đã ACTIVE tại `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` (W03 catalog CRUD rules, boundary `gf-inventory`). Dev đọc file W03 đó cho toàn bộ nghiệp vụ Nhóm vật tư hàng hóa + Mã sản phẩm nội bộ.
>
> **NEED CONFIRMATION — source path discrepancy**: Context Bundle chỉ định nguồn là `Product/business-rules/BR-GF-INVENTORY-CATALOG.md`, nhưng file đó (v19, đã audit đầy đủ) **KHÔNG chứa** rule `BR-INV-MENU-*`. Rule hub điều hướng mobile thực tế nằm tại `Product/business-rules/BR-GF-INVENTORY.md` §2.6 "Hub điều hướng mobile (BR-INV-MENU-001 .. BR-INV-MENU-004) — mobile-only" (v3, `last_reviewed: 2026-07-02`). Author dùng nguồn đúng (`BR-GF-INVENTORY.md` §2.6) thay vì path bundle chỉ định — flag lại tại §9 Open Items để orchestrator cập nhật bundle generator.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path (canonical, đúng — không phải path bundle chỉ định) | `Product/business-rules/BR-GF-INVENTORY.md` §2.6 |
| Source version | 3 |
| Source last_reviewed | 2026-07-02 |
| Source SHA | NEED CONFIRMATION — chưa tính được (không có Bash tool trong phiên author) |
| Source path (bundle chỉ định, KHÔNG chứa BR-INV-MENU — mismatch) | `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` (v19) |
| Feature nguồn (embed rule text + state matrix + AC) | `Product/features/FEAT-INV-MOBILE-MENU.md` v3, `last_reviewed: 2026-07-07` |
| Generated at | 2026-07-08T00:00:00Z |
| Parent PKG | `PKG-W04-inventory-period-opening-balance` v9 §2.2.5 (Mobile hub scope) |
| KG baseline SHA (garage-mobile) | `0d92e4597229ff43fb7e98e486873200684b06884a4e285a9c88a9bf43ec616b` |
| W03 catalog CRUD reference (KHÔNG re-generate) | `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` (ACTIVE, v2) |

---

## §1 Rule Statements (VERBATIM — chỉ §2.6 Hub điều hướng mobile)

> Trích nguyên văn từ `BR-GF-INVENTORY.md` §2.6. Không paraphrase.

### 1.1 Hub điều hướng mobile (BR-INV-MENU-001 .. BR-INV-MENU-004) — mobile-only

> Hub "Quản lý kho hàng" trên app Garage (`FEAT-INV-MOBILE-MENU`). Web KHÔNG triển khai hub — dùng sidebar điều hướng tương ứng.

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-INV-MENU-001 | Thứ tự và nhãn 6 tile cố định theo Figma: **Sản phẩm** · **Nhóm vật tư** · **Phiếu nhập** · **Phiếu xuất** · **Tồn kho** · **Tồn đầu kỳ** (grid 2 cột, top → bottom, left → right). KHÔNG reorder, KHÔNG relabel — nhãn tile phải đồng bộ với nhãn sidebar web tương ứng để tránh user dual-platform confuse. | UI Constraint | FEAT-INV-MOBILE-MENU |
| BR-INV-MENU-002 | Tile chỉ render khi sub-module tương ứng đã GA — **ẨN HOÀN TOÀN** tile chưa GA. KHÔNG hiển thị placeholder, KHÔNG badge "Sắp ra mắt". Hub W03 render đúng 2 tile (Sản phẩm + Nhóm vật tư); W04 thêm Tồn đầu kỳ; W05 thêm Phiếu nhập + Phiếu xuất; W06 đủ 6 tile. *(BA decision 2026-06-29: hide-only strategy.)* | Tile Visibility | FEAT-INV-MOBILE-MENU |
| BR-INV-MENU-003 | Cả 2 vai trò (chủ garage + kế toán) thấy đầy đủ tile đã enable trên hub. Permission per sub-module gate **ở route đích** (vào sub-screen mới check role) — KHÔNG filter tile theo role tại lớp hub. | Permission | FEAT-INV-MOBILE-MENU |
| BR-INV-MENU-004 | Tap tile → push route tới màn list sub-module + preserve back stack. Back từ sub-module quay về hub (không nhảy về root). Hub là pure client-side navigation — KHÔNG gọi BFF, KHÔNG fetch data. | Navigation | FEAT-INV-MOBILE-MENU |

> **Trọng tâm supplement W04**: BR-INV-MENU-001 (thứ tự/label cố định) + BR-INV-MENU-002 (state matrix ẩn/hiện theo wave) là 2 rule primary cho scope W04 (per Context Bundle). BR-INV-MENU-003/004 giữ nguyên verbatim vì cùng thuộc §2.6 nguồn và được `FEAT-INV-MOBILE-MENU` §5 tham chiếu song hành (AC-6, AC-5) — tách riêng sẽ phá vỡ tính mạch lạc BR→AC mapping.

---

## §2 Rationale (VERBATIM — trích preamble §2.6 nguồn)

> Hub "Quản lý kho hàng" trên app Garage (`FEAT-INV-MOBILE-MENU`). Web KHÔNG triển khai hub — dùng sidebar điều hướng tương ứng.

Bổ sung ngữ cảnh từ Change Log nguồn (v2, 2026-06-29): "Thêm §2.6 BR-INV-MENU-001..004 (4 BR, mobile-only) cho FEAT-INV-MOBILE-MENU mới. BR-INV-MENU-001 fix thứ tự + label 6 tile (đồng bộ sidebar web). BR-INV-MENU-002 enforce ẨN HOÀN TOÀN tile chưa GA (no badge — BA decision 2026-06-29). BR-INV-MENU-003 quyền: cả 2 role thấy đủ tile (gate ở route đích, không ở hub). BR-INV-MENU-004 navigation: client-only push route + preserve back stack, hub KHÔNG gọi BFF."

---

## §3 W04 State Matrix Scope (narrow — supplement focus)

> Trích lọc từ `FEAT-INV-MOBILE-MENU.md` §3 (state matrix đầy đủ 6 tile × 4 wave) — chỉ giữ 2 cột liên quan W04: **Hiển thị W03** (baseline đã ship trước W04) và **Hiển thị W04** (scope wave này). BR-INV-MENU-002 là rule chi phối toàn bộ bảng này.

| # | Tile (label verbatim Figma) | FEAT đích | Wave ship | Hiển thị W03 | Hiển thị W04 |
|---|---|---|---|---|---|
| 1 | **Sản phẩm** | `FEAT-CAT-PROD-LIST` (mobile view-only) | W03 | ✅ active | ✅ active |
| 2 | **Nhóm vật tư** | `FEAT-CAT-GRP-LIST` (mobile full CRUD) | W03 | ✅ active | ✅ active |
| 6 | **Tồn đầu kỳ** | `FEAT-OB-LIST` | W04 | ❌ ẩn | ✅ active (mới thêm W04) |
| 3 | **Phiếu nhập** | `FEAT-IR-LIST-V2` (W05) | W05 | ❌ ẩn | ❌ ẩn hoàn toàn |
| 4 | **Phiếu xuất** | `FEAT-ID-LIST-V2` (W05) | W05 | ❌ ẩn | ❌ ẩn hoàn toàn |
| 5 | **Tồn kho** | `FEAT-STK-LIST-V2` (W06) | W06 | ❌ ẩn | ❌ ẩn hoàn toàn |

> **Kết quả W04**: hub render **3 tile active** (Sản phẩm · Nhóm vật tư · Tồn đầu kỳ, đúng thứ tự cố định BR-INV-MENU-001) + **3 tile ẩn hoàn toàn** (Phiếu nhập · Phiếu xuất · Tồn kho — không placeholder, không badge, per BR-INV-MENU-002). Thứ tự render trong grid 2 cột giữ nguyên theo thứ tự gốc 6 tile (per FEAT §3 note) — khi tile bị ẩn, các tile còn lại tự reflow giữ đúng thứ tự tương đối.
>
> Route đích tile "Tồn đầu kỳ" W04 = `OpeningBalanceListPage` (`FEAT-OB-LIST`, Cubit `OpeningBalanceListCubit`) per PKG-W04 §2.2.5 — mobile chỉ **read-only list** (import/edit/delete-lines OB là web-only per PKG §2.2.5 Mobile out-of-scope).

---

## §4 Enforcement Layer

### 4.1 Tổng quan phân lớp (mobile-only, KHÔNG có BE/BFF layer — hub là pure client navigation)

| Layer | Vai trò | Rules chính |
|---|---|---|
| Mobile UI (`lib/ui/inventory/InventoryHubPage`) | PRIMARY — render tile order/label cố định, ẩn/hiện tile theo state matrix compile-time/config, push route + preserve back stack | BR-INV-MENU-001, BR-INV-MENU-002, BR-INV-MENU-004 |
| Mobile Cubit (`InventoryHubCubit`) | Secondary — **KHÔNG gọi API** (per FEAT-INV-MOBILE-MENU v3 + BR-INV-MENU-002: "pure client navigation, không gọi Cubit gọi API"); chỉ compute tile-visible list từ config tĩnh (wave state matrix + feature-flag RemoteConfig) | BR-INV-MENU-002 |
| Route đích (sub-screen `FEAT-CAT-PROD-LIST`/`FEAT-CAT-GRP-LIST`/`FEAT-OB-LIST`) | Permission gate — role check thực hiện tại route đích, KHÔNG tại hub | BR-INV-MENU-003 |
| Firebase RemoteConfig | Feature-flag gate `Inventory:InventoryV2` — ẩn toàn bộ hub tile nếu OFF (CR-20260707-02) | §8 dưới |

### 4.2 Chi tiết enforcement per rule

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-INV-MENU-001 | Mobile UI | Danh sách tile hardcode theo thứ tự cố định (Sản phẩm → Nhóm vật tư → Phiếu nhập → Phiếu xuất → Tồn kho → Tồn đầu kỳ) trong `InventoryHubPage`; label lấy từ `LocaleKeys` (M-30 mandatory, KHÔNG hardcode VN literal) — nội dung string phải đồng bộ với sidebar web (`T-web-Nav1` menu "Kho V2"/"Quản lý kho hàng"). |
| BR-INV-MENU-002 | Mobile UI + Cubit | `InventoryHubCubit` compute `visibleTiles = allTiles.where(tile => tile.waveShipped <= currentWave)` từ config tĩnh (không phải API); W04 config `{Sản phẩm: true, Nhóm vật tư: true, Tồn đầu kỳ: true, Phiếu nhập: false, Phiếu xuất: false, Tồn kho: false}`. Tile `visible=false` bị loại khỏi widget tree hoàn toàn (`if (tile.visible) TileWidget(...)`) — KHÔNG dùng `Visibility(visible: false)` giữ layout space (tránh vi phạm §4.2 forbidden pattern verify khi author FEAT execution spec song song). |
| BR-INV-MENU-003 | Route đích | Hub KHÔNG check role; role check (garage-owner/accountant — quyền ngang nhau) enforce tại `FEAT-CAT-PROD-LIST`/`FEAT-CAT-GRP-LIST`/`FEAT-OB-LIST` execution spec riêng (đã/sẽ author độc lập). |
| BR-INV-MENU-004 | Mobile UI (Navigator) | `Navigator.push` (route named `InventoryHubRoute` → sub-route), KHÔNG `pushReplacement`/`pushAndRemoveUntil` — giữ back stack; back button trả về đúng `InventoryHubPage`. Debounce tap (EC-3 FEAT nguồn) tránh double-navigation khi user tap 2 lần nhanh. |

---

## §5 Test Ideas

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-INV-MENU-001-01 | BR-INV-MENU-001 | Mở hub W04 → verify thứ tự tile render | Happy | Thứ tự đúng: Sản phẩm, Nhóm vật tư, Tồn đầu kỳ (theo thứ tự gốc 6-tile, reflow bỏ 3 tile ẩn) |
| TC-BR-INV-MENU-001-02 | BR-INV-MENU-001 | So sánh label tile mobile vs label sidebar web tương ứng | Consistency | Label khớp 1-1 ("Sản phẩm", "Nhóm vật tư", "Tồn đầu kỳ") |
| TC-BR-INV-MENU-002-01 | BR-INV-MENU-002 | Mở hub W04 → đếm số tile render | Happy | Đúng 3 tile active |
| TC-BR-INV-MENU-002-02 | BR-INV-MENU-002 | Verify 3 tile chưa GA (Phiếu nhập/Phiếu xuất/Tồn kho) | Violation guard | KHÔNG render — không placeholder, không badge "Sắp ra mắt" |
| TC-BR-INV-MENU-002-03 | BR-INV-MENU-002 | Kiểm tra widget tree bằng golden test | Edge | Widget tree KHÔNG chứa node ẩn (không phải `Visibility(visible:false)`) |
| TC-BR-INV-MENU-003-01 | BR-INV-MENU-003 | Đăng nhập role garage-owner vs accountant → mở hub | Happy | Cả 2 role thấy đủ 3 tile active giống nhau |
| TC-BR-INV-MENU-004-01 | BR-INV-MENU-004 | Tap tile "Tồn đầu kỳ" → back | Happy | Push `OpeningBalanceListPage`; back trả về đúng `InventoryHubPage`, không về Home |
| TC-BR-INV-MENU-004-02 | BR-INV-MENU-004 | Tap tile 2 lần liên tiếp rất nhanh | Edge (EC-3) | Chỉ điều hướng 1 lần (debounce) |
| TC-BR-INV-MENU-FLAG-01 | §8 flag gate | Ops flip `Inventory:InventoryV2` OFF, app resume | Flag gate | Hub tile (mission tile Home) ẩn theo RemoteConfig; nếu fetch fail → fallback compile-time default ON |

---

## §6 BR → FEAT → AC Mapping

### FEAT-INV-MOBILE-MENU

| BR ID | AC liên quan (nguồn FEAT §2) | Ghi chú |
|---|---|---|
| BR-INV-MENU-001 | AC-3 (Tile grid 2 cột, thứ tự cố định) | Order verbatim theo Figma; đồng bộ label sidebar web |
| BR-INV-MENU-002 | AC-4 (Tile chỉ render khi module đã ship — ẩn hoàn toàn), EC-1, EC-2, EC-4 | W04: 3 active + 3 ẩn (xem §3 bảng trên) |
| BR-INV-MENU-003 | AC-6 (Phân quyền truy cập hub) | Gate ở route đích, không filter tile theo role |
| BR-INV-MENU-004 | AC-1 (Mở màn hub), AC-5 (Tap tile → điều hướng), EC-3 (debounce) | Pure client navigation, preserve back stack |
| (n/a — flag gate, không phải BR-INV-MENU) | AC-7 (Tenant isolation), AC-8 (Phạm vi mobile-only) | AC-7: hub bản thân không gọi BFF nên tenant isolation enforce ở sub-module; AC-8: xem §7 dưới |

---

## §7 Error Code Mapping

> **N/A — không áp dụng**. Hub `FEAT-INV-MOBILE-MENU` là **pure client-side navigation** (BR-INV-MENU-004: "KHÔNG gọi BFF, KHÔNG fetch data") — không có REST/GraphQL call tại lớp hub nên không phát sinh mã lỗi domain. Mọi mã lỗi (`ERR-INV-*`, `ERR-AP-*`) phát sinh tại route đích (sub-module) đã được cover ở execution spec riêng của từng FEAT đích (`FEAT-CAT-PROD-LIST`, `FEAT-CAT-GRP-LIST`, `FEAT-OB-LIST`).

---

## §8 Feature-flag Gate `Inventory:InventoryV2` cho hub (CR-20260707-02)

> Theo `PKG-W04-inventory-period-opening-balance.md` §0.2 CR-20260707-02 + `BR-GF-INVENTORY.md` §6.6.

- **Cơ chế**: Firebase RemoteConfig key `Inventory:InventoryV2` gate mission tile "Quản lý kho hàng" trên màn Home (entry point vào `InventoryHubRoute`, per FEAT-INV-MOBILE-MENU v3 AC-1) — flag OFF → mission tile ẩn khỏi grid Home, user không vào được hub.
- **Fallback**: RemoteConfig fetch fail → dùng **compile-time constant default ON** (không chặn user nếu network fail — kill-switch semantic, không phải pilot rollout).
- **Timing**: nếu Ops flip flag OFF sau khi user đã ở trong hub, thay đổi áp dụng ở **lần fetch tiếp theo** (app resume) — KHÔNG force logout mid-session (còn NEED CONFIRMATION theo PKG §2.3 Out of Scope, không implement trong W04).
- **Scope flag**: 1 flag `Inventory:InventoryV2` duy nhất gate toàn bộ 6 epic Inventory V2 (W03–W06), bao gồm cả hub — không phải flag riêng cho hub.
- **Layer khác** (tham chiếu, không thuộc scope mobile-menu supplement này): BE `gf-inventory`/`gf-accounting` `@FeatureOn` class-level 403; BFF `agg-garage-graph` resolver-level fail-fast 403; Web `garage-web` TanStack Router `beforeLoad` gate + sidebar ẩn.

---

## §9 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W04-MENU-BR-001 | **Source path mismatch trong Context Bundle**: bundle chỉ định `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` làm nguồn cho BR-INV-MENU-001/002, nhưng rule này thực tế nằm ở `Product/business-rules/BR-GF-INVENTORY.md` §2.6 (boundary `gf-inventory`, nhưng §2.6 mobile-only không có REST/DB liên quan tới catalog CRUD). Author đã dùng nguồn đúng; đề nghị orchestrator sửa bundle generator (`scripts/preflight-wave-spec-bundle.py`) trỏ đúng file cho FEAT-INV-MOBILE-MENU. | MEDIUM — không block DEV (nguồn đúng đã dùng), nhưng cần fix bundle generator tránh lặp lại drift |
| OI-W04-MENU-BR-002 | **SHA256 chưa tính**: phiên author này không có Bash tool để tính SHA256 file `BR-GF-INVENTORY.md`. `source_sha` trong frontmatter đang là placeholder NEED CONFIRMATION. Cần CI/orchestrator backfill trước khi bump DRAFT → ACTIVE (audit trail đầy đủ). | LOW — không block review nội dung, nhưng block audit trail hoàn chỉnh trước ACTIVE |
| OI-W04-MENU-BR-003 | **Mid-session force-logout khi Ops flip `Inventory:InventoryV2`**: chưa có quyết định BA — kế thừa từ PKG-W04 §2.3 Out of Scope. Không implement W04; theo dõi tại BR flag §8 cho tới khi có CR riêng. | LOW — theo dõi, không block W04 |
| OI-W04-MENU-BR-004 | **BR-INV-MENU-003/004 nằm ngoài phạm vi hẹp task ban đầu (chỉ nêu 001/002)** nhưng được giữ verbatim để đảm bảo §6 BR→FEAT→AC mapping mạch lạc (AC-1/AC-5/AC-6 cần 003/004). Nếu reviewer muốn tách hẳn 2 rule này ra khỏi supplement W04, cần raise theo hướng dẫn riêng. | LOW — decision transparency, không phải lỗi |

---

## §10 References

- `Product/business-rules/BR-GF-INVENTORY.md` v3 §2.6 (nguồn canonical rule text — KHÔNG phải path bundle chỉ định)
- `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` v19 (audit — KHÔNG chứa BR-INV-MENU, dùng cho AC catalog CRUD W03 riêng)
- `Product/features/FEAT-INV-MOBILE-MENU.md` v3 (§2 AC, §3 state matrix, §5 BR embed, §6 Edge Cases)
- `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` (ACTIVE v2 — AC catalog CRUD đầy đủ, KHÔNG re-generate ở đây)
- `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9 §2.2.5 (Mobile hub scope, out-of-scope 8 FEAT)
- `Tracking/CHANGE-REQUESTS.md#cr-20260707-02--w03-inventory-v2-feature-flag-backfill`
- `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` (KG baseline SHA `0d92e4597229ff43fb7e98e486873200684b06884a4e285a9c88a9bf43ec616b`)
- `Product/ux/UX-FLOW-INVENTORY-CATALOG.md` §3.0 (luồng hub mobile)

---

## §11 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT W04 supplement spec — narrow-scope chỉ BR-INV-MENU-001..004 (hub điều hướng mobile `FEAT-INV-MOBILE-MENU`) + gate feature-flag `Inventory:InventoryV2` (CR-20260707-02). Verbatim copy §2.6 từ `BR-GF-INVENTORY.md` v3 (nguồn đúng — sửa path mismatch so với Context Bundle chỉ định `BR-GF-INVENTORY-CATALOG.md`, flag tại OI-W04-MENU-BR-001). §3 trích lọc state matrix 2 cột W03/W04 từ FEAT §3 (3 tile active + 3 tile ẩn hoàn toàn). §7 Error code mapping = N/A (hub pure client navigation, không gọi BFF). AC catalog CRUD W03 KHÔNG re-generate — reference `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md`. |
