---
type: feature
artifact_kind: feature
status: PLANNED
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-CATALOG"
boundary: "garage-mobile"
last_reviewed: "2026-07-21"
---

# FEAT-INV-MOBILE-MENU: Màn quản lý kho hàng (hub điều hướng mobile)

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INV-MOBILE-MENU` |
| Title | Màn quản lý kho hàng — hub điều hướng mobile |
| Parent Epic | `EP-INVENTORY-CATALOG` |
| Boundary | `garage-mobile` (mobile-only) |
| Platform scope | **Mobile only** — web không có hub tile tương đương (web dùng sidebar điều hướng) |
| Priority | P1 |
| Status | PLANNED |

> **Phạm vi**: hub điều hướng mobile vào toàn bộ module **Quản lý kho hàng V2** (xuyên các wave W03–W06). Là entry điểm duy nhất trên app cho 6 sub-module kho V2. Web không cần FEAT tương đương — sidebar web phục vụ điều hướng tương ứng.

## 1. User Story

**As** chủ garage / kế toán, **I want** một màn hub trên app Garage hiển thị các module quản lý kho dưới dạng tile (icon + nhãn), **so that** tôi có thể truy cập nhanh tới từng module kho mà không phải mò qua sidebar/menu dài.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị màn hub

- [ ] **AC-1**: Mở màn hub
  - Tại: màn Home (Sảnh chính) của app Garage mobile.
  - Khi: người dùng tap **mission tile "Quản lý kho hàng"** trong grid mission tile màn Home.
  - Thì: hệ thống push route `InventoryHubRoute` — hiển thị màn hub với header **"Quản lý kho hàng"** + nút back (←) về màn Home. Back stack preserved. *(Entry point chốt là mission tile Home, KHÔNG dùng drawer/bottom-nav — khớp code W03 đã ship: `mission_function_widget.dart:107-110`.)*

- [ ] **AC-2**: Header
  - Tại: màn hub.
  - Khi: màn render.
  - Thì: hệ thống hiển thị header **"Quản lý kho hàng"** (verbatim Figma, KHÔNG đổi tên), có nút back (←) bên trái + chuông thông báo + signal/battery icons theo template app hiện hành.

- [ ] **AC-3**: Tile grid 2 cột
  - Tại: vùng nội dung màn hub.
  - Khi: màn render.
  - Thì: hệ thống hiển thị các tile đã enable (xem AC-4) dưới dạng **grid 2 cột**, mỗi tile gồm: icon (vòng tròn nhạt + biểu tượng) ở trên, nhãn tile ở dưới, padding đều, tile có shadow nhẹ + bo góc. Thứ tự cố định theo §3.

- [ ] **AC-4**: Tile chỉ render khi module đã ship — ẨN tile chưa ship
  - Tại: màn hub.
  - Khi: 1 sub-module trong 6 module chưa được ship trong wave hiện hành (xem §3 state matrix).
  - Thì: hệ thống **ẨN HOÀN TOÀN** tile đó (không hiển thị placeholder, không hiển thị badge "Sắp ra mắt"). Wave 3 chỉ render 2 tile (Sản phẩm + Nhóm vật tư); Wave 4 thêm 1; Wave 5 thêm 2; Wave 6 thêm 1 (đầy đủ 6 tile). *(BA decision 2026-06-29: hide-only strategy, không badge.)*

- [ ] **AC-5**: Tap tile → điều hướng tới sub-module
  - Tại: 1 tile bất kỳ.
  - Khi: người dùng tap tile.
  - Thì: hệ thống push route tới màn list của sub-module tương ứng (xem §3 mapping). Back stack được preserve — back từ sub-module quay về hub.
  - Riêng W06 tile **"Tồn kho"**: push route tới **`FEAT-STK-LIST-V2`** (màn Báo cáo tồn kho đến ngày) và **không** route sang `FEAT-IP-VIEW-V2` / `FEAT-STK-DETAIL-V2`.

### Nhóm B — Phân quyền

- [ ] **AC-6**: Phân quyền truy cập hub
  - Tại: màn hub.
  - Khi: chủ garage hoặc kế toán mở app.
  - Thì: cả hai vai trò đều thấy đầy đủ tile đã enable (không filter theo role tại lớp hub). Permission per sub-module được gate ở route đích (vào sub-screen mới check role) — pattern tương tự `BR-WH-002` tenant-scoped only.

### Nhóm C — Tenant isolation

- [ ] **AC-7**: Phạm vi theo garage
  - Tại: màn hub.
  - Khi: người dùng đăng nhập garage X.
  - Thì: hub không hiển thị dữ liệu thuộc garage khác. Hub bản thân là pure client navigation, không gọi BFF — tenant isolation enforce ở từng sub-module sau khi tap.

### Nhóm D — Trạng thái nền tảng

- [ ] **AC-8**: Phạm vi nền tảng — **mobile-only**
  - Tại: app mobile (garage-mobile) vs web GMS.
  - Khi: BA review scope.
  - Thì: feature này CHỈ trên mobile. Web KHÔNG implement hub tile tương ứng — web dùng sidebar điều hướng. Label tile mobile phải đồng bộ với label sidebar web (xem §5 Business Rules).

## 3. State matrix tile per wave

| # | Tile (label verbatim Figma) | FEAT đích | Wave ship | Hiển thị W03 | Hiển thị W04 | Hiển thị W05 | Hiển thị W06 |
|---|---|---|---|---|---|---|---|
| 1 | **Sản phẩm** | `FEAT-CAT-PROD-LIST` (mobile view-only) | W03 | ✅ | ✅ | ✅ | ✅ |
| 2 | **Nhóm vật tư** | `FEAT-CAT-GRP-LIST` (mobile full CRUD) | W03 | ✅ | ✅ | ✅ | ✅ |
| 3 | **Phiếu nhập** | `FEAT-IR-LIST-V2` *(W05 — xem `EP-INVENTORY-RECEIPT-V2`)* | W05 | ❌ ẩn | ❌ ẩn | ✅ | ✅ |
| 4 | **Phiếu xuất** | `FEAT-ID-LIST-V2` *(W05 — xem `EP-INVENTORY-DELIVERY-V2`)* | W05 | ❌ ẩn | ❌ ẩn | ✅ | ✅ |
| 5 | **Tồn kho** | `FEAT-STK-LIST-V2` *(W06 — mobile Stock V2 chỉ có feature này; xem `EP-INVENTORY-STOCK-V2`)* | W06 | ❌ ẩn | ❌ ẩn | ❌ ẩn | ✅ |
| 6 | **Tồn đầu kỳ** | `FEAT-OB-LIST` *(W04 — xem `EP-INVENTORY-OPENING-BALANCE`)* | W04 | ❌ ẩn | ✅ | ✅ | ✅ |

> Thứ tự render trong grid 2 cột (top → bottom, left → right): **Sản phẩm** · **Nhóm vật tư** · **Phiếu nhập** · **Phiếu xuất** · **Tồn kho** · **Tồn đầu kỳ** — theo Figma. Khi 1 tile bị ẩn (AC-4), các tile còn lại tự reflow giữ thứ tự gốc.

## 4. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | mobile | https://www.figma.com/design/5YU4H3iY726P8KNxI9oCYF/App-Garage-V3?node-id=21729-24201&t=1wyfngHFoc9eXNsZ-4 |
| Figma | web | KHÔNG ÁP DỤNG (mobile-only) |

- Luồng: [UX-FLOW-INVENTORY-CATALOG](../ux/UX-FLOW-INVENTORY-CATALOG.md) §3.0 (hub mobile).
- Design source: **Figma** (mobile only — registry `Product/ux/figma/figma-links.yaml` waves["03"] → waves["06"] `FEAT-INV-MOBILE-MENU`; W06 dùng cùng hub Figma, tile **"Tồn kho"** visible để dẫn vào `FEAT-STK-LIST-V2`).

## 5. Business Rules

- **BR-INV-MENU-001**: Thứ tự + label 6 tile cố định theo Figma — không reorder, không relabel cross-platform.
- **BR-INV-MENU-002**: Tile chỉ enable khi sub-module tương ứng đã GA — tile chưa GA bị ẨN HOÀN TOÀN (no placeholder, no badge).
- **BR-INV-MENU-003**: Cả 2 role (chủ garage + kế toán) thấy đủ tile đã enable — permission gate ở route đích, không tại hub.
- **BR-INV-MENU-004**: Tap tile → push route giữ back stack — back từ sub-module quay về hub, không phải về root.
- Xem chi tiết: [BR-GF-INVENTORY §2.6 BR-INV-MENU](../business-rules/BR-GF-INVENTORY.md).

## 6. Edge Cases

- **EC-1**: Wave 3 mới ra mắt — hub render đúng 2 tile (Sản phẩm + Nhóm vật tư), 4 tile còn lại ẨN. Không hiển thị empty state vì hub vẫn có >0 tile.
- **EC-2**: (Hypothetical, không xảy ra W03) Nếu cả 6 tile đều bị ẩn → hub hiển thị empty state **"Chưa có module nào khả dụng"** + icon placeholder. (Không phải lỗi.)
- **EC-3**: Người dùng tap tile rất nhanh 2 lần → chỉ điều hướng 1 lần (debounce navigation).
- **EC-4**: Quay lại hub từ sub-module sau khi state tile thay đổi (vd app upgrade thêm tile mới) → hub re-render theo state matrix mới.

## 7. Out of Scope

- **Web hub tương ứng** — web dùng sidebar điều hướng, không có hub tile.
- **Permission gate per role** — gate ở route đích (sub-FEAT), không tại hub.
- **Personalization** (user pin tile / reorder) — out of scope wave này.
- **Badge "Sắp ra mắt"** — BA quyết định ẨN HOÀN TOÀN (2026-06-29), không hiển thị placeholder.
- **Analytics tap event** — out of scope wave này; có thể bổ sung sau qua CR.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Business Authority | Khởi tạo FEAT-INV-MOBILE-MENU — màn hub điều hướng mobile "Quản lý kho hàng" cho EP-INVENTORY-CATALOG. Hub render grid 2 cột tối đa 6 tile xuyên W03–W06. **BA decisions 2026-06-29**: (a) tile chưa ship ẨN HOÀN TOÀN không badge; (b) gom vào EP-INVENTORY-CATALOG; (c) cả 2 role thấy đủ tile (gate ở route đích); (d) header "Quản lý kho hàng" verbatim Figma. **NEED CONFIRMATION**: (1) Figma URL + node-id màn hub; (2) điểm vào hub từ đâu (tile màn chính / drawer / bottom-nav). |
| 2026-06-29 | 2 | Business Authority | Resolve NEED CONFIRMATION (1) — gắn Figma mobile URL `5YU4H3iY726P8KNxI9oCYF` node `21729:24201` (App-Garage-V3). Cập nhật §4 UI/UX Reference + registry `Product/ux/figma/figma-links.yaml` waves["03"].FEAT-INV-MOBILE-MENU.mobile. NEED CONFIRMATION (2) điểm vào hub vẫn open. |
| 2026-07-07 | 3 | Business Authority (in-session, user ninhnguyen) | **Resolve NEED CONFIRMATION (2)** — chốt entry point hub = **mission tile "Quản lý kho hàng" trên màn Home (Sảnh chính)**, KHÔNG dùng drawer/bottom-nav. Rationale: code W03 đã ship dùng option này (bằng chứng `mission_function_widget.dart:107-110` push `InventoryHubRoute` từ mission tile), FEAT spec chỉ cần đồng bộ với code — không cần rework mobile. AC-1 rewrite verbatim theo pattern Home mission tile + push route + back stack. Đóng follow-up cuối cùng của FEAT-INV-MOBILE-MENU. **Lưu ý cho HLD**: HLD `garage-mobile-HLD.md` §11b hiện default "drawer menu item" — cần cascade update thành "Home mission tile" cho đồng bộ (Architecture tier, không thuộc scope Product edit này). |
| 2026-07-21 | 4 | Business Authority (user directive) | **Clarify W06 Stock V2 mobile entry** — tile **"Tồn kho"** visible ở W06 và chỉ route vào `FEAT-STK-LIST-V2`; không route sang NXT/thẻ kho. Đồng bộ registry W06 có cả menu + `FEAT-STK-LIST-V2` mobile. |
