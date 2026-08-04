---
cr_id: CR-20260616-02
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260616-02
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13354-57960&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13354:57960"
screen_slug: a5-so-edit
fetched_at: 2026-06-29T03:19:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (đã capture trong wave03-ins-so-adjustment--a5-so-edit-oracle.md)
  get_variable_defs: cached
  get_design_context: skipped
  get_screenshot: reused (asset shared via FEAT oracle)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (delegate FEAT-keyed oracle)
  variant_state: complete (full-insurance 2-cột BH+KH per CR)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (panel read-only)
screenshots:
  - assets/wave03-ins-so-adjustment--a5-so-edit/_full.png
related_features: [FEAT-INS-SO-ADJUSTMENT]
design_vs_feat_notes:
  - "Node `13354:57960` = panel 'Tổng giá dịch vụ' A5 2-cột apply trên màn **Chỉnh sửa SO**. CR-20260616-02 scope item 1/3: khối 'Phân bổ Bảo hiểm' từ 1 cột → 2 cột BH | KH; khối 'Cân thanh toán' từ 1 cột → 2 cột (dòng 'Thanh toán' split BH/KH); dòng 'Tổng thanh toán' giữ nguyên highlight."
  - "Oracle CR-keyed này là VIEW thay thế (alias) của oracle FEAT-keyed `wave03-ins-so-adjustment--a5-so-edit-oracle.md` — same node, same screen, same screenshot folder. agent-test-ui có thể consume bằng CR perspective hoặc FEAT perspective."
  - "Visual identical với CR-20260616-02 a5-so-detail (`13354:58368`) + fullscreen-a5 (`13535:159225`) — same shared panel component cross 3 màn theo CR scope."
  - "**SHARED SCREENSHOT FOLDER**: `assets/wave03-ins-so-adjustment--a5-so-edit/_full.png` (FEAT oracle pre-created folder). CR-keyed oracle KHÔNG tạo duplicate folder để tiết kiệm storage + đảm bảo single source of truth visual."
---

# Oracle — CR-20260616-02 (web) · wave 03 · screen "a5-so-edit"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13354:57960`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). CR-20260616-02 scope item 1/3 — panel "Tổng giá dịch vụ"
> A5 2-cột BH | KH apply trên **màn Chỉnh sửa Phiếu Dịch vụ**. CR-keyed view (alias của
> FEAT-keyed oracle `wave03-ins-so-adjustment--a5-so-edit-oracle.md`).

---

## Pointer to canonical oracle (FEAT-keyed view)

**Canonical**: `Product/ux/figma-test-web/wave03-ins-so-adjustment--a5-so-edit-oracle.md`

Cùng node `13354:57960`, cùng screen, cùng screenshot — oracle FEAT-keyed đã ghi đầy đủ 5-cấp:

- Screen Inventory (1 frame Panel A5 2-cột)
- Section-container: Panel container (13354:57962) 600×764 + AC-9 (13354:57964) 600×284 + AC-10 (13787:116416) 600×296 + AC-11 (13787:116748) 600×140
- Component Inventory (Panel + 3 sub-section + 3 cols Table per AC-9 + 3 cols AllocationGrid per AC-10 + 2 rows + 2-3 cell per AC-11)
- Variant & State (full-insurance mode + dấu +/− per row AC-10 + AC-11 split per-payer)
- Text Content verbatim
- Design Tokens (colors / typography / spacing / radius / size cached `variable_defs`)

---

## CR-20260616-02 SCOPE checklist (verify against FEAT oracle)

| CR Scope item | Verify in PNG / FEAT oracle |
|---|---|
| (a) Khối "Phân bổ Bảo hiểm" 2 cột BH \| KH | ✓ AC-10 (13787:116416) 3 cols layout (Khoản mục 200 + BH 200 + KH 200) — section "Component Inventory § AC-10" |
| (a) Mỗi khoản hiển thị +/− ở đúng cột | ✓ AC-10 PNG: BH dấu `-`, KH dấu `+` — verify dấu prefix ở mỗi cell |
| (a) Cùng hàng dóng thẳng với AC-9 phía trên | ✓ AC-10 grid alignment 3 cols × 5 rows match AC-9 3 cols × 4 rows (visual alignment) |
| (b) Khối "Cân thanh toán" 2 cột | ✓ AC-11 Row 1 split 2 cell (BH 200 + KH 200) |
| (b) Dòng "Tổng thanh toán" giữ 1 dòng highlight | ✓ AC-11 Row 2 full row label "Tổng thanh toán" + value brand-CD 20px |

---

## Cross-feature shared panel

Panel = SHARED component cross **3 màn** (CR-20260616-02 scope):
1. **Màn Chỉnh sửa SO** (`13354:57960`) ← THIS oracle
2. **Màn Chi tiết SO** (`13354:58368`) → `wave03-cr-20260616-02--a5-so-detail-oracle.md`
3. **Màn Tạo phiếu QT fullscreen** (`13535:159225`) → `wave03-cr-20260616-02--fullscreen-a5-oracle.md`

DEV implement 1 component prop-driven cho cả 3 màn. Visual + content IDENTICAL.

---

## Screenshots (shared with FEAT oracle)

> assets/wave03-ins-so-adjustment--a5-so-edit/
- `_full.png` — Panel A5 2-cột full frame (1212×816) — SAME screenshot as FEAT-keyed oracle (single source visual)

---

## Coverage notes (oracle — non-blocking)

- **CR scope verify** = layout 2-cột BH | KH cho 2 khối (Phân bổ BH + Cân thanh toán) + 3-cell Row 1 + dấu +/− đúng cột.
- Display-only change, không đụng công thức (per CR Scope).
- AC-10 màu (xanh/đỏ vs đen): xem note trong oracle FEAT-keyed canonical.
- agent-test-ui khi test CR-20260616-02 → consume 3 oracle CR-keyed (a5-so-edit + a5-so-detail + fullscreen-a5) để cover 3 màn scope. Cross-check với FEAT-keyed oracle cho 5-cấp depth.
