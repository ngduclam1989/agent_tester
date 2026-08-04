---
cr_id: CR-20260612-01
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260612-01
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13548-92509&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13548:92509"
screen_slug: stl-detail-kh-no-bh
fetched_at: 2026-06-29T03:18:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (already captured trong wave02-ins-stl-detail-oracle.md cùng node)
  get_variable_defs: cached (identical wave03 vocab)
  get_design_context: skipped
  get_screenshot: success (1440×2052 scaled 1438×2048)
data_completeness:
  screen_inventory: complete (1 frame Chi tiết phiếu QT KH from SO không BH)
  component_inventory: complete (delegate wave02-ins-stl-detail-oracle.md KH variant inline)
  variant_state: complete (KH variant baseline — no allocation section)
  text_content: complete (verbatim từ PNG + wave02 oracle pointer)
  design_tokens: complete (variable_defs success)
  interaction_states: partial
screenshots:
  - assets/wave03-cr-20260612-01--stl-detail-kh-no-bh/_full.png
related_features: [FEAT-INS-STL-DETAIL]
design_vs_feat_notes:
  - "Node `13548:92509` = màn 'Chi tiết phiếu quyết toán' bên thanh toán = **Khách hàng** đi từ SO **KHÔNG chọn Bảo hiểm**. CR-20260612-01 scope (b) elsewhere: SO không BH → KHÔNG hiển thị section 'Phân bổ Bảo hiểm' (giữ panel baseline)."
  - "Wave02 oracle `wave02-ins-stl-detail-oracle.md` đã ghi đầy đủ 5-cấp INLINE cho cùng node 13548:92509 (KH variant detail) — DELEGATE 5-cấp về wave02. Wave03 re-emit chỉ theo CR-keyed convention."
  - "Diff vs `kh-with-bh` oracle (13354:56440): KHÔNG có section 'Phân bổ Bảo hiểm' trong panel. Baseline 'Cân thanh toán' chỉ 'Khách hàng thanh toán' + 'Tổng thanh toán'."
  - "PNG confirms: panel = title + AC-9 1 cột KH + AC-11 'Cân thanh toán' 2 dòng (KH + Tổng). KHÔNG có AC-10 'Phân bổ Bảo hiểm'."
  - "Tab navigation 3 tab (giống kh-with-bh): 'Bảng chi phí' (active) · 'Chứng từ & hóa đơn' · 'Lịch sử thanh toán'."
---

# Oracle — CR-20260612-01 (web) · wave 03 · screen "stl-detail-kh-no-bh"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13548:92509`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **Chi tiết phiếu quyết toán bên Khách hàng** đi
> từ SO **KHÔNG chọn Bảo hiểm** — panel "Tổng giá dịch vụ" baseline (NO Phân bổ Bảo hiểm)
> per CR-20260612-01 scope (b) negative case.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Chi tiết phiếu QT KH (from SO không BH) — panel baseline | 13548:92509 | 1440×2052 | assets/wave03-cr-20260612-01--stl-detail-kh-no-bh/_full.png |

---

## Pointer to canonical oracle (wave02 — same node)

**Canonical**: `Product/ux/figma-test-web/wave02-ins-stl-detail-oracle.md` (oracle_version 2)

Wave 02 oracle (2026-06-18 update) ghi đầy đủ 5-cấp INLINE cho cùng node `13548:92509`
(KH variant — "Chi tiết phiếu quyết toán khách hàng" frame). Wave03 không duplicate. Covers:

- AC-1 Header (BackArrow + mã phiếu + Badge "Chờ thanh toán" + 2-3 action buttons)
- AC-2 Thông tin quyết toán (4 cột × 2 rows info grid)
- AC-3 Thông tin khách hàng & xe (4 cột × 2 rows)
- AC-4 TabNav 4 tabs (PER wave02 oracle — verify whether KH variant có 3 hay 4 tab)
- AC-5 Bảng chi phí (Dịch vụ thực hiện + Phụ tùng sử dụng)
- AC-6 Panel "Tổng giá dịch vụ" mode `no-insurance` (2 cột + Cân thanh toán 2 dòng)
- All text content verbatim
- Design tokens (variable_defs)

---

## Component Inventory (delta wave02 — confirm + CR scope)

### CR scope diff (panel "Tổng giá dịch vụ")
- AC-9 "Chi tiết theo bên thanh toán" 2 cột (Khoản mục + Khách hàng thanh toán)
- **NO** Section "Phân bổ Bảo hiểm" (CR scope b: SO không BH → không render)
- AC-11 "Cân thanh toán" 2 dòng (Khách hàng thanh toán + Tổng thanh toán)

### Tab Navigation observation (PNG)
- 3 tabs: "Bảng chi phí" (active brand-CD underline) · "Chứng từ & hóa đơn" · "Lịch sử thanh toán"
- **NO** "Hồ sơ bảo hiểm đã xuất" tab (KH variant từ SO không BH — không có hồ sơ BH)
- Wave02 oracle ghi 4 tab — verify diff: wave02 KH variant (kh-with-bh implicit) vs wave03 KH-no-BH (this oracle = 3 tab vì SO không BH)

---

## Text Content (verbatim — match wave02 + PNG)

### Panel "Tổng giá dịch vụ" (CR scope — SO không BH)
- "Tổng giá dịch vụ" (panel title)
- "Chi tiết theo bên thanh toán" (header muted)
- "Khoản mục" · "Khách hàng thanh toán" (2 col headers)
- "Dịch vụ" · "Phụ tùng" · "VAT" · "Cộng sau VAT" (4 row labels)
- "Cân thanh toán" (header)
- "Khách hàng thanh toán" (row 1 label) · "Tổng thanh toán" (row 2 label semibold)
- Sample values AC-9: "0đ" / "95.040đ" / "95.040đ" / "95.040đ"
- Sample values "Cân thanh toán": "50.000.000đ" (KH) · "50.000.000đ" (Tổng brand-CD)

### Other sections
- Delegate wave02-ins-stl-detail-oracle.md inline 5-cấp KH variant detail (AC-2/AC-3/AC-5).

---

## Design Tokens (delegate wave02 KH variant)

Wave02 oracle (`wave02-ins-stl-detail-oracle.md`) §"Design Tokens — KH variant (13548:92509)"
ghi đầy đủ design tokens cho node này (colors / typography / spacing / radius / size).

Highlights áp dụng:
- Panel: 600×468 (no-insurance variant) → `w-[600px]`
- 2 cols (Khoản mục 400 + KH 200)
- Footer "Tổng thanh toán" value: 18px weight 700 brand-CD → `text-xl font-semibold text-primary`

---

## Screenshots

> assets/wave03-cr-20260612-01--stl-detail-kh-no-bh/
- `_full.png` — Màn Chi tiết phiếu QT KH from SO không BH (13548:92509, 1440×2052 scaled 1438×2048)

---

## Coverage notes (oracle — non-blocking)

- **CR scope verify** (NEGATIVE case) = panel KHÔNG hiển thị "Phân bổ Bảo hiểm" khi SO không BH.
- agent-test-ui verify: this oracle vs kh-with-bh oracle để confirm conditional render đúng theo SO context.
- **Tab count diff** wave02 (4 tab) vs wave03 (3 tab observed): có thể wave02 oracle dùng frame `13548:92509` cho KH baseline reference (chưa apply CR), còn wave03 PNG đã apply CR (bỏ tab BH). Flag verify với BA — hoặc wave02 oracle wording chưa cập nhật.
