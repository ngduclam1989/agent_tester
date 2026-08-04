---
cr_id: CR-20260616-02
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260616-02
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13354-58368&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13354:58368"
screen_slug: a5-so-detail
fetched_at: 2026-06-29T03:20:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (identical structure to 13354:57960)
  get_variable_defs: cached
  get_design_context: skipped
  get_screenshot: reused (FEAT oracle pre-fetched)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (delegate FEAT oracle)
  variant_state: complete (full-insurance 2-cột)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (panel read-only)
screenshots:
  - assets/wave03-ins-so-adjustment--a5-so-detail/_full.png
related_features: [FEAT-INS-SO-ADJUSTMENT]
design_vs_feat_notes:
  - "Node `13354:58368` = panel A5 2-cột apply trên màn **Chi tiết Phiếu Dịch vụ** (SO Detail). CR-20260616-02 scope item 2/3. Visual IDENTICAL với 13354:57960 (a5-so-edit) — same shared panel component."
  - "Oracle CR-keyed này là VIEW thay thế (alias) của oracle FEAT-keyed `wave03-ins-so-adjustment--a5-so-detail-oracle.md` — same node, same screen, same screenshot folder."
  - "Khác biệt nghiệp vụ vs a5-so-edit: màn Edit có form input + Save action; màn Detail full read-only. Panel A5 IDENTICAL — đây là OUTPUT panel."
---

# Oracle — CR-20260616-02 (web) · wave 03 · screen "a5-so-detail"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13354:58368`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). CR-20260616-02 scope item 2/3 — panel "Tổng giá dịch vụ"
> A5 2-cột BH | KH apply trên **màn Chi tiết Phiếu Dịch vụ** (read-only).

---

## Pointer to canonical oracle (FEAT-keyed view)

**Canonical**: `Product/ux/figma-test-web/wave03-ins-so-adjustment--a5-so-detail-oracle.md`

→ FEAT-keyed oracle is itself a wave-pointer to `wave03-ins-so-adjustment--a5-so-edit-oracle.md`
(identical visual). Chain: this CR oracle → FEAT a5-so-detail oracle → FEAT a5-so-edit oracle
(5-cấp canonical).

Cùng node, cùng screen, cùng screenshot — wave03-ins-so-adjustment--a5-so-edit oracle ghi đầy đủ 5-cấp:

- Panel container 600×764 (title "Tổng giá dịch vụ")
- AC-9 Bảng "Chi tiết theo bên thanh toán" 3 cols (Khoản mục | BH | KH) × 5 rows
- AC-10 Bảng "Phân bổ Bảo hiểm" 3 cols × 5 dòng (Khoản mục | BH dấu − | KH dấu +)
- AC-11 Khối "Cân thanh toán" Row 1 split 2-cell + Row 2 Tổng full brand
- All text content verbatim
- Design tokens

---

## CR-20260616-02 SCOPE checklist (identical với a5-so-edit)

Same checklist 5 items per CR scope (verify against FEAT oracle a5-so-edit):
- (a) Phân bổ BH 2 cột BH | KH ✓
- (a) Mỗi khoản +/− đúng cột ✓
- (a) Alignment với AC-9 ✓
- (b) Cân thanh toán 2 cột ✓
- (b) Tổng thanh toán giữ highlight ✓

---

## Cross-feature shared panel

Panel SHARED cross 3 màn CR-20260616-02 scope:
1. Màn Chỉnh sửa SO (`13354:57960`) → `wave03-cr-20260616-02--a5-so-edit-oracle.md`
2. **Màn Chi tiết SO** (`13354:58368`) ← THIS oracle
3. Màn Tạo phiếu QT fullscreen (`13535:159225`) → `wave03-cr-20260616-02--fullscreen-a5-oracle.md`

---

## Screenshots (shared with FEAT oracle)

> assets/wave03-ins-so-adjustment--a5-so-detail/
- `_full.png` — Panel A5 2-cột full frame (1212×816) — visually identical to a5-so-edit

---

## Coverage notes (oracle — non-blocking)

- **CR scope verify** = same 2-cột layout as a5-so-edit; verify trên màn SO Detail context (URL khác, panel same).
- agent-test-ui Playwright nav: SO Detail page → assert panel render giống a5-so-edit oracle PNG (cross-page conformance).
