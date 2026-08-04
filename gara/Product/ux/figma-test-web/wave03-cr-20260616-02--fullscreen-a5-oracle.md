---
cr_id: CR-20260616-02
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260616-02
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-159225&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13535:159225"
screen_slug: fullscreen-a5
fetched_at: 2026-06-29T03:21:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (sibling structure already captured)
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
  - assets/wave03-ins-stl-create--fullscreen-a5/_full.png
related_features: [FEAT-INS-STL-CREATE]
design_vs_feat_notes:
  - "Node `13535:159225` = panel A5 2-cột apply trên màn **Tạo phiếu Quyết toán fullscreen** (STL-CREATE). CR-20260616-02 scope item 3/3. Visual IDENTICAL với 13354:57960 (a5-so-edit) + 13354:58368 (a5-so-detail) — same shared panel component cross-feature."
  - "Oracle CR-keyed này là VIEW thay thế (alias) của oracle FEAT-keyed `wave03-ins-stl-create--fullscreen-a5-oracle.md` (đó là pointer wave02 fullscreen-a5 — chain 3 cấp pointer)."
  - "FEAT AC mapping: STL-CREATE AC-3 ⇄ SO-ADJ AC-9 'Chi tiết theo bên thanh toán'; STL-CREATE AC-4 ⇄ SO-ADJ AC-10 'Phân bổ Bảo hiểm'; STL-CREATE AC-5 ⇄ SO-ADJ AC-11 'Cân thanh toán'."
---

# Oracle — CR-20260616-02 (web) · wave 03 · screen "fullscreen-a5"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13535:159225`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). CR-20260616-02 scope item 3/3 — panel "Tổng giá dịch vụ"
> A5 2-cột BH | KH apply trên **màn Tạo phiếu Quyết toán fullscreen**.

---

## Pointer to canonical oracle

**Canonical chain**:
1. This CR oracle (CR-keyed view)
2. → `wave03-ins-stl-create--fullscreen-a5-oracle.md` (FEAT-keyed, wave03)
3. → `wave02-ins-stl-create--fullscreen-a5-oracle.md` (5-cấp canonical, same node, no design change wave02 → wave03)

Wave02 fullscreen-a5 oracle ghi đầy đủ 5-cấp cho `13535:159225`:

- Panel container 600×764 (title "Tổng giá dịch vụ")
- AC-3/AC-9 PayerBreakdownTable 600×284 (3 cols × 5 rows)
- AC-4/AC-10 InsuranceAllocation 600×296 (5 dòng × 3 cols với dấu/màu)
- AC-5/AC-11 PaymentBalance 600×140 (Row 1 3 ô highlight + Row 2 Tổng full)
- All text content verbatim
- Design tokens

---

## CR-20260616-02 SCOPE checklist (identical với a5-so-edit/detail)

Same 5-item checklist per CR scope (verify against wave02 fullscreen-a5 oracle):
- (a) Phân bổ BH 2 cột BH | KH ✓ (AC-4 InsuranceAllocation)
- (a) Mỗi khoản +/− đúng cột ✓
- (a) Alignment với AC-3 PayerBreakdownTable ✓
- (b) Cân thanh toán 2 cột ✓ (AC-5 PaymentBalance Row 1)
- (b) Tổng thanh toán giữ highlight ✓ (AC-5 Row 2 brand-CD)

---

## Cross-feature shared panel

Panel SHARED cross 3 màn CR-20260616-02 scope:
1. Màn Chỉnh sửa SO (FEAT-INS-SO-ADJUSTMENT) → `wave03-cr-20260616-02--a5-so-edit-oracle.md`
2. Màn Chi tiết SO (FEAT-INS-SO-ADJUSTMENT) → `wave03-cr-20260616-02--a5-so-detail-oracle.md`
3. **Màn Tạo phiếu QT fullscreen** (FEAT-INS-STL-CREATE) ← THIS oracle

DEV: panel "Tổng giá dịch vụ" là 1 shared component prop-driven, render IDENTICAL trên 3 màn.

---

## Screenshots (shared with FEAT oracle)

> assets/wave03-ins-stl-create--fullscreen-a5/
- `_full.png` — Panel A5 2-cột full frame (13535:159225, 1212×816) — visually identical to a5-so-edit/detail

---

## Coverage notes (oracle — non-blocking)

- **CR scope verify** = panel A5 2-cột apply trên màn STL-CREATE Tạo phiếu QT fullscreen mode.
- Cross-màn conformance: agent-test-ui verify panel render giống cả 3 màn (SO Edit + SO Detail + Tạo QT) — pixel diff = 0.
- Wave02 oracle có mô tả màu xanh/đỏ cho AC-4 dấu +/−; PNG wave03 hiển thị đen — verify với BA dấu có style hay không (production CSS layer).
