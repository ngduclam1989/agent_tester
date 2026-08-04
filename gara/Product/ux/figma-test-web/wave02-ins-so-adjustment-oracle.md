---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:469505"
fetched_at: 2026-06-18T13:45:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (section parent — DEV spec wave02 + wave01 oracles cover detail)
  get_variable_defs: skipped (token map đã consolidated trong wave01 oracle)
  get_design_context: skipped
  get_screenshot: success (3 PNG: section _full + State A Edit + Detail)
data_completeness:
  screen_inventory: complete
  component_inventory: pointer (delegate to wave01 oracles — wave02 design identical wave01)
  variant_state: pointer (delegate to wave01 oracles)
  text_content: pointer (delegate to wave01 oracles)
  design_tokens: pointer (delegate to wave01 oracles)
  interaction_states: pointer (wave01 oracle ghi states; verify shadcn baseline + AC-12/AC-14)
screenshots:
  - assets/wave02-ins-so-adjustment/_full.png
  - assets/wave02-ins-so-adjustment/13257-546398-edit-state-a.png
  - assets/wave02-ins-so-adjustment/13270-206807-detail.png
design_vs_feat_notes:
  - "Wave 02 oracle là **wave-pointer**: design KHÔNG đổi giữa wave 01 và wave 02 (same figma_url, same node_id `13257:469505`). agent-test-ui phải dùng song song 2 wave01 oracles canonical: `wave01-ins-so-adjustment--edit-oracle.md` (Edit screen — Nhóm B 'Phân bổ quyết toán BH' + Nhóm C 'Tổng giá dịch vụ') + `wave01-ins-so-adjustment--detail-oracle.md` (Detail screen read-only)."
  - "Wave 02 registry chuyển từ split-mode (W01 edit+detail) sang single-mode (W02 slug=null) — đây là **registry simplification**, không phải design change. Mọi conformance assertion vẫn dựa vào wave01 oracles."
  - "Section node `13257:469505` chứa 5 top-level frame: 4 frame state Edit + 1 frame Detail. Wave01 split-mode oracle đã capture đầy đủ; wave 02 chỉ liệt kê + screenshot tối thiểu."
  - "AC-12 + AC-14 (error/highlight BH thanh toán âm + validate per-field) → wave01 oracle Edit ghi states observed (default + error); agent-test-ui verify theo wave01 oracle."
---

# Oracle — FEAT-INS-SO-ADJUSTMENT (web) · wave 02 (single-mode pointer)

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13257:469505`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Section chứa **5 frame** (4 Edit state + 1 Detail) cho
> FEAT-INS-SO-ADJUSTMENT. **Wave 02 design = Wave 01 design** (registry simplification, không
> phải design change). agent-test-ui dùng wave01 oracles làm canonical.

---

## Screen Inventory (pointer)

| Screen state | nodeId | size | canonical oracle | screenshot |
|---|---|---|---|---|
| Chỉnh sửa SO — State A (canonical Edit) | 13257:546398 | 1440×3516 | wave01-ins-so-adjustment--edit-oracle.md | assets/wave02-ins-so-adjustment/13257-546398-edit-state-a.png |
| Chỉnh sửa SO — State B variant | 13257:544849 | 1440×2638 | wave01-ins-so-adjustment--edit-oracle.md (same layout, khác data) | (không re-shoot — same layout) |
| Chỉnh sửa SO — State C variant | 13354:58572 | 1440×2712 | wave01-ins-so-adjustment--edit-oracle.md (same layout, khác data) | (không re-shoot) |
| Chỉnh sửa SO — State D variant | 13257:478586 | 1440×3590 | wave01-ins-so-adjustment--edit-oracle.md (same layout, khác data) | (không re-shoot) |
| Chi tiết SO BH (Detail) | 13270:206807 | 1440×2320 | wave01-ins-so-adjustment--detail-oracle.md | assets/wave02-ins-so-adjustment/13270-206807-detail.png |

> Section full canvas (5 frames stacked): assets/wave02-ins-so-adjustment/_full.png — 4837×6822 (panoramic).

---

## Pointer to canonical oracles (wave01)

### Edit screen (Nhóm B + Nhóm C)
- **Canonical**: `Product/ux/figma-test-web/wave01-ins-so-adjustment--edit-oracle.md`
- Covers: Nhóm B "Phân bổ quyết toán bảo hiểm" (AC-1..AC-8 input section — dropdown VND/%, 5 fields nhập, nút "Áp dụng tất cả") + Nhóm C "Tổng giá dịch vụ" (AC-9 PayerBreakdownTable + AC-10 InsuranceAllocation + AC-11 PaymentBalance)
- Conformance verdict source: wave01 oracle 5 cấp (screen/component/variant/text/tokens) — verbatim apply cho wave 02.

### Detail screen (read-only)
- **Canonical**: `Product/ux/figma-test-web/wave01-ins-so-adjustment--detail-oracle.md`
- Covers: Header + Section "Thông tin SO/KH/xe" + Panel "Tổng giá dịch vụ" read-only.
- Conformance verdict source: wave01 oracle 5 cấp.

---

## Component / Variant / Text / Tokens

> **DELEGATE**: Toàn bộ 5 cấp conformance (Component Inventory · Variant & State · Text Content ·
> Design Tokens · Interaction states) → wave01 oracles cited above. agent-test-ui đọc 2 wave01
> oracle file thay vì duplicate content ở đây.

Lý do delegate: design Figma không đổi giữa W01 và W02. Duplicate content tạo drift risk khi
wave01 oracle update mà wave02 quên sync. Wave-pointer pattern đã dùng cho DEV spec
(`wave02-ins-so-adjustment.md`) — oracle cùng pattern.

---

## Screenshots
> assets/wave02-ins-so-adjustment/
- `_full.png` — Section full canvas 5 frames stacked (13257:469505, 4837×6822)
- `13257-546398-edit-state-a.png` — Edit canonical State A (13257:546398, 1440×3516)
- `13270-206807-detail.png` — Detail read-only (13270:206807, 1440×2320)
