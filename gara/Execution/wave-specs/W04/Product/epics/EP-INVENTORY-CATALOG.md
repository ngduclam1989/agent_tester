---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source_ref: "Product/epics/EP-INVENTORY-CATALOG.md"
source_version: 8
source_sha: "NEED CONFIRMATION — sha256 chưa tính được trong spawn này (không có hashing tool khả dụng cho agent-execution-spec-author mode epic). Orchestrator backfill qua preflight script trước khi bump ACTIVE."
generated_at: "2026-07-08T00:00:00+00:00"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
features_in_wave:
  - FEAT-INV-MOBILE-MENU
boundaries_affected:
  - garage-mobile
w04_scope_note: "narrow-mobile-hub-state-matrix"
authoring_inputs:
  kg_baseline_sha: "0d92e4597229ff43fb7e98e486873200684b06884a4e285a9c88a9bf43ec616b"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — epic mode, không fan-out theo tier"
  bundle_path: "N/A — epic mode, không có per-tier bundle"
  bundle_generated_at: "N/A"
---

# EP-INVENTORY-CATALOG — Execution Spec (W04 Supplement — Mobile Hub State Matrix)

> **Execution spec bổ sung, phạm vi HẸP (narrow supplement)** — KHÔNG phải bản EP đầy đủ cho W04. Bản EP đầy đủ (12 FEAT catalog GRP/PROD, đã ship) là `Execution/wave-specs/W03/Product/epics/EP-INVENTORY-CATALOG.md` (version 2, **status ACTIVE**) — file đó vẫn là nguồn tham chiếu chính cho toàn bộ nghiệp vụ danh mục vật tư (Nhóm vật tư hàng hóa + Mã sản phẩm nội bộ).
>
> File này chỉ author **1 delta duy nhất của W04**: hub điều hướng mobile `FEAT-INV-MOBILE-MENU` mở thêm tile thứ 3 ("Tồn đầu kỳ") trong state matrix xuyên-wave (W03→W06). **KHÔNG re-generate** AC/FEAT catalog CRUD (GRP/PROD) đã ACTIVE tại W03 — chỉ reference.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INVENTORY-CATALOG.md`](../../../../Product/epics/EP-INVENTORY-CATALOG.md) |
| Source version | 8 |
| Source SHA | NEED CONFIRMATION (xem frontmatter) |
| Generated at | 2026-07-08T00:00:00+00:00 |
| Wave | W04 — Inventory V2 Slice 2/4: Khởi tạo kho (Kỳ kế toán + Tồn đầu kỳ) |
| W03 baseline (ACTIVE, full EP) | [`Execution/wave-specs/W03/Product/epics/EP-INVENTORY-CATALOG.md`](../../../W03/Product/epics/EP-INVENTORY-CATALOG.md) v2 |
| Related FEAT source | [`Product/features/FEAT-INV-MOBILE-MENU.md`](../../../../Product/features/FEAT-INV-MOBILE-MENU.md) v3 |
| Related BR | [`Product/business-rules/BR-GF-INVENTORY.md`](../../../../Product/business-rules/BR-GF-INVENTORY.md) v3 §2.6 (BR-INV-MENU-001..004) |
| Parent PKG | [`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`](../../../../Execution/work-packages/PKG-W04-inventory-period-opening-balance.md) v9 §2.2.5 |

---

## Note — Phạm vi hẹp W04 (scope narrowing)

- `EP-INVENTORY-CATALOG` nguồn (v8) từ W03 → W04 chỉ thay đổi 2 điểm: (a) v7 thêm `FEAT-INV-MOBILE-MENU` vào §4 Features (đã cover ở W03 spec §10 NC-W03-EP-001, sau đó resolve và feature này ACTIVE cùng W03); (b) v8 thêm Feature Flag `Inventory:InventoryV2` vào §5.2 Architecture Dependencies (đã cover — flag backfill qua CR-20260707-02 tại PKG-W04 §0.2, KHÔNG phải nghiệp vụ catalog mới).
- **Không có thay đổi entity/API/schema GRP/PROD** trong W04 — toàn bộ 12 FEAT catalog (GRP × 5 + PROD × 7) giữ nguyên hành vi đã ACTIVE tại W03.
- **Duy nhất 1 delta nghiệp vụ**: hub mobile `FEAT-INV-MOBILE-MENU` — theo state matrix §3 của FEAT nguồn (v3), tile số 6 ("Tồn đầu kỳ") chuyển từ ẨN (W03) → HIỂN THỊ (W04) khi `FEAT-OB-LIST` (thuộc `EP-INVENTORY-OPENING-BALANCE`, cũng trong PKG-W04) ship. Hub bản thân không có thay đổi entity/API — pure client-side navigation (BR-INV-MENU-004).
- Do đó, §1-§5 dưới đây **KHÔNG verbatim toàn bộ EP nguồn** (khác với policy §1-§5 verbatim mặc định của mode `epic`) — chỉ trích phần liên quan trực tiếp tới delta mobile hub W04, kèm pointer rõ ràng tới W03 spec cho phần còn lại. Quyết định này theo chỉ định orchestrator (Context Bundle §Task: "W04 chỉ author phần EP liên quan đến mobile hub state matrix W04").

---

## 1. Personas Impacted (không đổi — tham chiếu W03)

Không có thay đổi persona. Xem `EP-INVENTORY-CATALOG.md` (W03 spec) §2 — 2 persona `Chủ garage` (PRIMARY) và `Kế toán` (PRIMARY), quyền tương đương trên toàn bộ danh mục lẫn hub điều hướng (BR-INV-MENU-003: cả 2 vai trò thấy đầy đủ tile đã enable, không filter theo role tại lớp hub).

---

## 2. Mobile Hub State Matrix — W04 Delta

> Nguồn: `FEAT-INV-MOBILE-MENU.md` v3 §3 (state matrix xuyên-wave) + `BR-GF-INVENTORY.md` v3 §2.6 (BR-INV-MENU-001..004).

| # | Tile (label verbatim Figma) | FEAT đích | Wave ship | W03 | **W04** | W05 | W06 |
|---|---|---|---|---|---|---|---|
| 1 | **Sản phẩm** | `FEAT-CAT-PROD-LIST` (mobile view-only) | W03 | ✅ | ✅ | ✅ | ✅ |
| 2 | **Nhóm vật tư** | `FEAT-CAT-GRP-LIST` (mobile full CRUD) | W03 | ✅ | ✅ | ✅ | ✅ |
| 3 | **Phiếu nhập** | `FEAT-IR-LIST-V2` (W05 — `EP-INVENTORY-RECEIPT-V2`) | W05 | ❌ ẩn | ❌ ẩn | ✅ | ✅ |
| 4 | **Phiếu xuất** | `FEAT-ID-LIST-V2` (W05 — `EP-INVENTORY-DELIVERY-V2`) | W05 | ❌ ẩn | ❌ ẩn | ✅ | ✅ |
| 5 | **Tồn kho** | `FEAT-STK-LIST-V2` (W06 — `EP-INVENTORY-STOCK-V2`) | W06 | ❌ ẩn | ❌ ẩn | ❌ ẩn | ✅ |
| 6 | **Tồn đầu kỳ** | `FEAT-OB-LIST` (W04 — `EP-INVENTORY-OPENING-BALANCE`) | **W04** | ❌ ẩn | **✅ mới** | ✅ | ✅ |

**W04 render đúng 3 tile** (Sản phẩm, Nhóm vật tư, Tồn đầu kỳ) — 3 tile còn lại (Phiếu nhập, Phiếu xuất, Tồn kho) tiếp tục ẨN HOÀN TOÀN theo BR-INV-MENU-002 (KHÔNG placeholder, KHÔNG badge "Sắp ra mắt"). Thứ tự grid 2 cột giữ nguyên thứ tự cố định gốc (Sản phẩm → Nhóm vật tư → Phiếu nhập → Phiếu xuất → Tồn kho → Tồn đầu kỳ) — 3 tile ẩn không chiếm ô, các tile hiển thị tự reflow.

**Rule áp dụng (BR-INV-MENU-001..004, verbatim category — không paraphrase nội dung rule gốc):**

| BR ID | Áp dụng cho delta W04 |
|---|---|
| BR-INV-MENU-001 | Nhãn "Tồn đầu kỳ" verbatim Figma — không đổi tên, không reorder vị trí #6 trong grid. |
| BR-INV-MENU-002 | Tile "Tồn đầu kỳ" chuyển ẨN → HIỆN theo state matrix trên; 3 tile còn lại (Phiếu nhập/Phiếu xuất/Tồn kho) tiếp tục ẨN HOÀN TOÀN. |
| BR-INV-MENU-003 | Cả 2 role thấy tile "Tồn đầu kỳ" mới — không filter theo role tại lớp hub; permission gate ở `OpeningBalanceListPage` (route đích, FEAT-OB-LIST). |
| BR-INV-MENU-004 | Tap tile "Tồn đầu kỳ" → push route `OpeningBalanceListPage`, preserve back stack; hub KHÔNG gọi BFF khi render/reflow tile — pure client-side. |

---

## 3. Features (W04 scope)

| FEAT ID | Title | Link | Wave role W04 |
|---|---|---|---|
| `FEAT-INV-MOBILE-MENU` | Màn quản lý kho hàng — hub điều hướng mobile (state matrix delta: +1 tile) | [FEAT-INV-MOBILE-MENU](../../../../Product/features/FEAT-INV-MOBILE-MENU.md) | Partial — chỉ thay đổi state matrix (không rebuild hub) |

> 12 FEAT catalog GRP/PROD (`FEAT-CAT-GRP-*`, `FEAT-CAT-PROD-*`) — KHÔNG trong scope W04, xem W03 spec §4 Features.

---

## 4. Dependencies (W04 delta)

| Dependency | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-OPENING-BALANCE` (`FEAT-OB-LIST`) | Upstream cho hub delta | Hub tile "Tồn đầu kỳ" chỉ hiển thị được sau khi `FEAT-OB-LIST` (mobile screen `OpeningBalanceListPage`) ship trong cùng PKG-W04. Route target của tile #6. |
| Feature Flag `Inventory:InventoryV2` | Gate | Firebase RemoteConfig `Inventory:InventoryV2` gate toàn bộ `InventoryHubRoute` tile (CR-20260707-02, PKG-W04 §0.2) — fallback compile-time default ON nếu RemoteConfig fetch fail. Không riêng cho tile #6 — áp dụng toàn hub. |
| `garage-mobile` | Boundary chính (không đổi) | Hub state matrix hoàn toàn client-side — không schema/API mới. |

---

## §5 Service Impact Matrix (W04 delta — mobile hub only)

> Không có thay đổi tại `gf-inventory` / `agg-garage-graph` / `garage-web` cho delta này (hub mobile-only, pure client navigation — BR-INV-MENU-004). Bảng dưới chỉ 1 dòng.

| Boundary | Role | FEAT touched (W04 delta) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `garage-mobile` | UI consumer (state-matrix update) | `FEAT-INV-MOBILE-MENU` | — (không entity mới) | — (hub không gọi BFF) | `InventoryHubPage` cập nhật tile-config: enable tile #6 "Tồn đầu kỳ" → push route `OpeningBalanceListPage` (FEAT-OB-LIST); giữ ẩn 3 tile còn lại | — |

**Dependency arrow:** `InventoryHubPage` (client-only tile reflow, không gọi BFF) → tap tile "Tồn đầu kỳ" → push route `OpeningBalanceListPage` (đã build cùng PKG-W04, FEAT-OB-LIST).

---

## §6 Cross-boundary Contracts

Không có CB mới cho delta này. Hub là pure client-side navigation (BR-INV-MENU-004) — không REST/GraphQL/Kafka touchpoint. Feature flag gate (`Inventory:InventoryV2`, Firebase RemoteConfig) là cơ chế duy nhất ảnh hưởng tới visibility toàn hub — xem CR-20260707-02 tại `PKG-W04-inventory-period-opening-balance.md` §0.2 (không phải CB theo nghĩa BR §1 Cross-boundary Rules).

---

## §7 Implementation Sequence DAG (W04 delta)

```
garage-mobile (InventoryHubPage state-matrix update) — chạy song song với FEAT-OB-LIST mobile build:
  - Cập nhật tile-config: tile #6 "Tồn đầu kỳ" enabled=true → targetRoute=OpeningBalanceListPage
  - Giữ tile #3/#4/#5 (Phiếu nhập/Phiếu xuất/Tồn kho) enabled=false (ẨN HOÀN TOÀN, không đổi)
  - KHÔNG rebuild InventoryHubPage — chỉ thay đổi config/state matrix (per FEAT-INV-MOBILE-MENU v3: "W05/W06 chỉ enable thêm tile — không rebuild hub")

  Entry : OpeningBalanceListPage (FEAT-OB-LIST mobile screen) route đã sẵn sàng + feature-flag
          Inventory:InventoryV2 Firebase RemoteConfig gate đã wire (CR-20260707-02)
  Exit  : widget test tile-visibility state matrix (3 hiện / 3 ẩn) pass; alchemist golden test
          hub W04 state; bloc_test InventoryHubCubit (nếu có state cho tile-config) pass
```

> Không có DAG cross-boundary — delta chỉ nằm trong `garage-mobile`, phụ thuộc thứ tự build với `FEAT-OB-LIST` (cùng boundary, cùng PKG-W04, xem PKG §2.2.5).

---

## §8 Architecture References

- `Product/features/FEAT-INV-MOBILE-MENU.md` v3 §3 — state matrix nguồn xuyên-wave (W03-W06).
- `Product/business-rules/BR-GF-INVENTORY.md` v3 §2.6 — BR-INV-MENU-001..004 (hub điều hướng mobile, mobile-only).
- `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9 §2.2.5 — Mobile scope W04 (hub 3 tile) + §2.3 Out of Scope (enable tile W05/W06 ngoài phạm vi).
- `Execution/wave-specs/W03/Product/epics/EP-INVENTORY-CATALOG.md` v2 (ACTIVE) — bản EP đầy đủ, baseline cho 12 FEAT catalog + §10 NC-W03-EP-001 (nguồn gốc quyết định gom hub vào epic này).
- Figma mobile node `21729:24201` (App-Garage-V3, file `5YU4H3iY726P8KNxI9oCYF`) — màn hub, không có node mới cho W04 (thay đổi là data-driven state matrix, không phải screen mới).
- `Product/epics/EP-INVENTORY-CATALOG.md` v8 §5.2 — Feature Flag `Inventory:InventoryV2` (Architecture Dependencies).
- `Tracking/CHANGE-REQUESTS.md#cr-20260707-02--w03-inventory-v2-feature-flag-backfill` — CR-20260707-02 (flag backfill, ảnh hưởng gate toàn hub).
- KG `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` (kg_baseline_sha xem frontmatter).

---

## §9 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker cho |
|---|---|---|---|
| NC-W04-EP-001 | **`source_sha` chưa tính được** — agent-execution-spec-author mode `epic` không có hashing tool khả dụng trong spawn này (chỉ Read/Write/Edit). Orchestrator cần backfill `source_sha` (sha256 của `Product/epics/EP-INVENTORY-CATALOG.md` v8) qua preflight script trước khi bump DRAFT → ACTIVE. | Delivery Authority (orchestrator) | Frontmatter audit trail hoàn chỉnh; reviewer verify §0 |
| NC-W04-EP-002 | **Đóng gói / không tách file riêng** — bản supplement này là **narrow scope theo chỉ định orchestrator**, khác policy mặc định "mode epic §1-5 verbatim copy" tại `agent-execution-spec-author-modes-extra.md`. Nếu reviewer/QA cần bản EP đầy đủ cho W04 (không chỉ delta), cần raise CR yêu cầu regenerate full theo policy chuẩn — hiện tại supplement này CHỦ ĐÍCH KHÔNG duplicate nội dung GRP/PROD đã ACTIVE ở W03. | Delivery Authority | Reviewer đánh giá coverage — cần xác nhận narrow-scope là intentional, không phải thiếu sót. |
| NC-W04-EP-003 | **Mid-session force-logout khi Ops flip `Inventory:InventoryV2`** — chưa implement trong W04 (theo PKG-W04 §2.3 Out of Scope). Ảnh hưởng tới hành vi hub nếu flag bị flip OFF giữa session — hub chỉ re-check ở lần fetch RemoteConfig kế tiếp (app resume), không real-time. Không phải blocker W04 nhưng cần theo dõi cho W05/W06. | Business Authority | Không blocker W04; theo dõi cho wave sau |

---

## §10 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INVENTORY-CATALOG.md` v8 | BA source-of-truth (đã cover đủ nội dung — không thay đổi GRP/PROD từ v7→v8) |
| W03 EP spec (ACTIVE, full) | `Execution/wave-specs/W03/Product/epics/EP-INVENTORY-CATALOG.md` v2 | Baseline đầy đủ 12 FEAT catalog + hub NC gốc |
| FEAT-INV-MOBILE-MENU | `Product/features/FEAT-INV-MOBILE-MENU.md` v3 | State matrix nguồn + AC-1..AC-8 |
| BR hub mobile | `Product/business-rules/BR-GF-INVENTORY.md` v3 §2.6 | BR-INV-MENU-001..004 |
| Parent PKG | `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9 | §2.2.5 Mobile scope W04 + §0.2 CR-20260707-02 flag |
| Related EP (upstream cho tile #6) | `Product/epics/EP-INVENTORY-OPENING-BALANCE.md` | `FEAT-OB-LIST` — route target tile "Tồn đầu kỳ" |
| KG garage-mobile | `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` | kg_baseline_sha `0d92e4597229ff43fb7e98e486873200684b06884a4e285a9c88a9bf43ec616b` |
| CR backfill flag | `Tracking/CHANGE-REQUESTS.md#cr-20260707-02--w03-inventory-v2-feature-flag-backfill` | Gate toàn hub qua `Inventory:InventoryV2` |

---

## §11 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W04 — **narrow supplement** cho `EP-INVENTORY-CATALOG` (chỉ delta mobile hub state matrix, KHÔNG regenerate 12 FEAT catalog GRP/PROD đã ACTIVE tại W03). §2 State matrix delta (tile "Tồn đầu kỳ" ẨN→HIỆN W04, 3 tile còn lại tiếp tục ẨN). §5 Service Impact Matrix (garage-mobile only, pure client-side, không schema/API mới). §6 Cross-boundary Contracts = none (hub không gọi BFF). §7 Sequence DAG (chỉ garage-mobile, phụ thuộc FEAT-OB-LIST cùng PKG-W04). §9 Open items: source_sha chưa tính (NC-W04-EP-001), xác nhận narrow-scope là chủ đích (NC-W04-EP-002), mid-session flag flip theo dõi cho wave sau (NC-W04-EP-003). |
