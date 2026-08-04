---
type: review-report
artifact_kind: figma-png-crosscheck
status: DRAFT
version: 1
tier: T2
owner_authority: Business Authority
scope: "W05 Inventory V2 — 8 Figma web specs (id/ir × create/edit/detail/list/delete)"
review_date: "2026-07-16"
reviewer: "main-agent + 4 parallel subagents (PNG oracle-first method)"
supersedes: "none"
---

# PNG-CROSSCHECK — W05 Inventory V2 (Post-Drift-Fix Sweep)

> **Trigger**: User phát hiện drift `Loại đối tượng` trong `wave05-id-create-v2` (BR-IDV2-025 v29 mô tả radio-inside-dropdown popup, Figma vẽ 2 dropdown song song). Root cause: previous reviewers (FIGMA-CROSSCHECK 2026-07-14 + BA-REVIEW 2026-07-15) tin text (BR ↔ spec md prose) thay vì mở PNG oracle độc lập.
>
> **Method**: 4 subagent song song, mỗi agent mở PNG bằng Read tool **TRƯỚC**, cross-check ASCII spec md + BR + FEAT sau. PNG canonical, không tin prose visual_notes.
>
> **Coverage**: 8 Figma spec × 43 PNGs — full W05 web scope (id/ir × create/edit/detail/list/delete). Print/export không có Figma, dùng HTML/Excel template, ngoài scope.

---

## §1 Executive Summary

| Category | Count | Verdict |
|---|---|---|
| **P0 (chặn DEV)** | **2** | ❌ BLOCK — id-edit-v2 spec mark Trạng thái field disabled + zero coverage AC-4b popup |
| **P1 (nên fix trước DEV)** | **15** | ⚠️ FIX — spec md prose cleanup + button labels + filter order + missing button |
| **P2 (nice-to-have)** | **8** | 🟢 DEFER — bump BR version cites + diacritic + auto-set behavior notes |
| **Fix "Loại đối tượng" verify** | ✅ PASS (4/4 spec) | Cả CREATE + EDIT × ID + IR đều tuân đúng Option B (2 dropdown song song) trong PNG |

**Verdict tổng: NEEDS_REVISION** — 2 P0 phải fix trước /dev-start; 15 P1 nên cascade trong 1 batch.

---

## §2 Fix verify — "Loại đối tượng" (Option B 2-dropdown)

| Spec | PNG Evidence | Verdict |
|---|---|---|
| wave05-id-create-v2 (Xuất khác) | [`15346-96004.png`](../ux/figma-web/assets/wave05-id-create-v2/15346-96004.png) — Row 1 Section 2: 3 top-level `Loại đối tượng * (Nhà cung cấp) \| Đối tượng * (Công ty CP An Phát) \| Người phụ trách` | ✅ PASS |
| wave05-ir-create-v2 (Nhập khác) | [`15373:94762.png`](../ux/figma-web/assets/wave05-ir-create-v2/15373:94762.png) — Row 2 Section 2 same pattern | ✅ PASS |
| wave05-id-edit-v2 (Xuất khác) | [`15373-94264.png`](../ux/figma-web/assets/wave05-id-edit-v2/15373-94264.png) — auto-set "Nhà cung cấp" (stored `object_type`) | ✅ PASS |
| wave05-ir-edit-v2 (Nhập khác) | [`15373_95603.png`](../ux/figma-web/assets/wave05-ir-edit-v2/15373_95603.png) — auto-set "Nhà cung cấp" | ✅ PASS |

Fix cascade hôm 2026-07-16 (BR-IDV2-025 v41 + BR-IRV2-025 v43 + FEAT-ID-CREATE-V2 v31 + FEAT-IR-CREATE-V2 v32 + gf-inventory-api.md v59 comment sync) đã align với Figma canonical.

---

## §3 New drift findings

### §3.1 P0 (chặn DEV) — 2 findings

| # | Location | Drift | Cite | Suggested Fix |
|---|---|---|---|---|
| P0-1 | Spec [wave05-id-edit-v2.md:20](../ux/figma-web/wave05-id-edit-v2.md#L20) + [:455](../ux/figma-web/wave05-id-edit-v2.md#L455) + [:715](../ux/figma-web/wave05-id-edit-v2.md#L715) + [:825](../ux/figma-web/wave05-id-edit-v2.md#L825) + [:937](../ux/figma-web/wave05-id-edit-v2.md#L937) — 5 loci mark Trạng thái field **disabled/read-only** | Contradicts [FEAT-ID-EDIT-V2 AC-4b v15](../features/FEAT-ID-EDIT-V2.md#L62): user PHẢI đổi dropdown Trạng thái Nháp → Ghi sổ + Lưu để trigger BE đối soát SO popup (BR-IDV2-009 v40 rewrite semantic) | [FEAT AC-4b:L62](../features/FEAT-ID-EDIT-V2.md#L62) + [BR-IDV2-009 v40](../business-rules/BR-GF-INVENTORY-DELIVERY-V2.md) | Bỏ toàn bộ `disabled=true`/`_readonly` cho Trạng thái; add state note "dropdown editable; Nháp→Ghi sổ + Lưu triggers AC-4b flow" |
| P0-2 | Spec [wave05-id-edit-v2.md:15-21](../ux/figma-web/wave05-id-edit-v2.md#L15) `_negative_coverage` **0 mention** AC-4b popup | Spec thiếu hoàn toàn: (a) popup xác nhận SO lệch `ERR-INV-039` verbatim "Số lượng phụ tùng trong phiếu xuất kho và phiếu dịch vụ #{mã_phiếu} chưa trùng khớp..." + `[Đóng]` + `[Vẫn Ghi sổ]`; (b) popup DEGRADED `ERR-CMN-007-DEGRADED` verbatim "Hệ thống chưa đối soát được vì mất kết nối phòng dịch vụ..." + `[Vẫn Ghi sổ]`. DEV không có Figma placeholder → guess-based | [FEAT AC-4b:L62-72](../features/FEAT-ID-EDIT-V2.md#L62) + [BR-IDV2-009 v40](../business-rules/BR-GF-INVENTORY-DELIVERY-V2.md) | Add coverage_gap entry "AC-4b popup pending Figma (BA vẽ mới)" + placeholder wording verbatim từ AC-4b làm reference cho DEV. Extend spec §New Screen (Popup) với title/content/buttons |

### §3.2 P1 (nên fix trước DEV) — 15 findings

**Nhóm A — Spec md prose cleanup (drift cũ chưa dọn theo fix Option B, 7 findings)**:

| # | Location | Drift | Fix |
|---|---|---|---|
| P1-A1 | [wave05-id-create-v2.md:317](../ux/figma-web/wave05-id-create-v2.md#L317) | `LoaiDoiTuongField.on_change` prose "per BR-IDV2-025 v29 radio-inside-dropdown" contradicts current 2-dropdown widget | Rewrite → "per BR-IDV2-025 v41 — 2 dropdown song song" |
| P1-A2..A6 | [wave05-ir-create-v2.md:55](../ux/figma-web/wave05-ir-create-v2.md#L55) + [:181](../ux/figma-web/wave05-ir-create-v2.md#L181) + [:207](../ux/figma-web/wave05-ir-create-v2.md#L207) + [:871](../ux/figma-web/wave05-ir-create-v2.md#L871) + [:1306](../ux/figma-web/wave05-ir-create-v2.md#L1306) | 5 loci còn text cũ "radio-inside-dropdown"/"radio-in-dropdown" (Screenshots row + Screen §1 stub + §VV claim + `Row2Col1_DoiTuong._mode_switch` DSL + §3 State Table) | Cascade rewrite tất cả → "list load theo dropdown 'Loại đối tượng' cạnh bên (2-dropdown per BR-IRV2-025 v43)" |
| P1-A7 | [wave05-ir-create-v2.md:210-212](../ux/figma-web/wave05-ir-create-v2.md#L210) §VV claim | "Diễn giải col 3 spans wider" — SAI. PNG [15373:94762.png](../ux/figma-web/assets/wave05-ir-create-v2/15373:94762.png) show 3 field equal-width (~395px each), Diễn giải NOT wider | Rewrite: "Row 3 = 3 equal-width fields; Diễn giải col_span=1 (nhập khác variant)" |
| P1-A8 | [wave05-ir-create-v2.md:919-921](../ux/figma-web/wave05-ir-create-v2.md#L919) DSL `Row3Col23_DienGiai._grid_span_cols: 2` | Hardcoded, thiếu mode-switch cho variant Nhập khác (col_span=1). ID spec parity đã có `col_span_ABC:2 / col_span_D:1` tại [wave05-id-create-v2.md:388-389](../ux/figma-web/wave05-id-create-v2.md#L388) | Add `_mode_switch: "nhap_mua\|nhap_tra_ban → col_span=2 · nhap_khac → col_span=1"` |

**Nhóm B — Widget/button verbatim label + popup wording (4 findings)**:

| # | Location | Drift | Fix |
|---|---|---|---|
| P1-B1 | PNG [`13575:86403.png`](../ux/figma-web/assets/wave05-id-detail-v2/13575:86403.png) vs [FEAT AC-5:L74](../features/FEAT-ID-DETAIL-V2.md#L74) | Popup Ghi sổ button label: PNG `[Hủy] + [Xác nhận]` vs FEAT + BR-IDV2-009 v40 `[Đóng] + [Xác nhận]` | BA chốt canonical (PNG hay FEAT). Đề xuất: PNG canonical → update FEAT + BR wording `[Đóng]` → `[Hủy]` cho popup xác nhận chung; giữ `[Vẫn Ghi sổ]` cho popup lệch/DEGRADED (chưa vẽ Figma) |
| P1-B2 | Spec [wave05-id-detail-v2.md](../ux/figma-web/wave05-id-detail-v2.md) missing AC-5 v13 5-step flow | Spec chỉ document popup xác nhận chung, thiếu (a) popup lệch verbatim `ERR-INV-039` + (b) popup DEGRADED `ERR-CMN-007-DEGRADED` + `[Vẫn Ghi sổ]` button | Add coverage_gap "AC-5 v13 popup lệch + DEGRADED chưa Figma; DEV placeholder verbatim per BR-IDV2-009 v40". Extend `§5 mutation_bindings` với sequence popup1 → BE reconcile → popup2 → commit |
| P1-B3 | PNG [`13573:67164.png`](../ux/figma-web/assets/wave05-ir-detail-v2/13573:67164.png) vs PNG [`13575:82898.png`](../ux/figma-web/assets/wave05-id-detail-v2/13575:82898.png) | Cross-spec button variant inconsistency: IR-DETAIL DRAFT "Ghi sổ kho" render **primary blue** vs ID-DETAIL render **outline** — cùng primary action, 2 màn 2 style | Design reconcile: canonical 1 style cho cả 2 boundary (đề xuất primary blue theo IR pattern). Update id-detail-v2 spec §1 BtnPostOrUnpost DRAFT branch → `variant=primary` |
| P1-B4 | Spec + FEAT [FEAT-IR-DELETE.md:40](../features/FEAT-IR-DELETE.md#L40) vs PNG [wave05-ir-delete.md:117](../ux/figma-web/wave05-ir-delete.md#L117) | Confirm body: FEAT `"Bạn có chắc chắn muốn xóa phiếu nhập kho [số phiếu] không?"` vs PNG `"Bạn có chắc chắn muốn xóa phiếu PX-00028 không?"` (missing phrase "nhập kho") | BA reconcile: (a) FEAT drop "nhập kho" khớp PNG, hoặc (b) Design add "nhập kho" vào Figma text node |

**Nhóm C — Missing element + wrong count (2 findings)**:

| # | Location | Drift | Fix |
|---|---|---|---|
| P1-C1 | PNG [`13573:67164.png`](../ux/figma-web/assets/wave05-ir-detail-v2/13573:67164.png) vs [FEAT AC-4:L62](../features/FEAT-IR-DETAIL-V2.md#L62) + [BR-IRV2-024](../business-rules/BR-GF-INVENTORY-RECEIPT-V2.md) | Screen 2 DRAFT render 3 nút (Chỉnh sửa/Xoá phiếu/Ghi sổ kho) — **thiếu "In phiếu nhập"**. FEAT + BR mandate "In luôn khả dụng bất kể trạng thái/kỳ" | DEV render đủ 4 nút DRAFT per FEAT canonical. Design flag Figma bổ sung slot 4 vào DRAFT frame |
| P1-C2 | [wave05-id-edit-v2.md:28](../ux/figma-web/wave05-id-edit-v2.md#L28) §Overview | "3×3 grid (10 fields thay vì 9)" — actual PNG count: Xuất bán default 8 fields, Xuất khác 9 fields (add Loại đối tượng, Diễn giải collapse col_span=1). Off-by-one both counts | Fix: "3×3 grid (9 fields thay vì 8)" |

**Nhóm D — Filter order (2 findings, đối xứng ID + IR)**:

| # | Location | Drift | Fix |
|---|---|---|---|
| P1-D1 | Spec [wave05-id-list-v2.md:319-420](../ux/figma-web/wave05-id-list-v2.md#L319) + PNG [`13573:72123.png`](../ux/figma-web/assets/wave05-id-list-v2/13573:72123.png) | 5 filter order render **Loại phiếu / Đối tượng / Trạng thái / Ngày xuất / Người phụ trách** — [FEAT AC-4](../features/FEAT-ID-LIST-V2.md#L59) + [BR-IDV2-021](../business-rules/BR-GF-INVENTORY-DELIVERY-V2.md#L70) yêu cầu **Loại phiếu / Đối tượng / Người phụ trách / Trạng thái / Ngày xuất** — vị trí 3-5 lệch | BA chốt: (a) FEAT/BR update filter order khớp Figma, hoặc (b) Design đẩy Người phụ trách sang slot 3 |
| P1-D2 | Spec [wave05-ir-list-v2.md:159-244](../ux/figma-web/wave05-ir-list-v2.md#L159) + PNG [`14547:91891.png`](../ux/figma-web/assets/wave05-ir-list-v2/14547:91891.png) | 6 filter order: PNG **Nguồn nhập / Loại phiếu / Đối tượng / Trạng thái / Ngày nhập / Người phụ trách** vs [FEAT AC-6:L70](../features/FEAT-IR-LIST-V2.md#L70) + [BR-IRV2-021](../business-rules/BR-GF-INVENTORY-RECEIPT-V2.md#L73) **Nguồn nhập / Loại phiếu / Đối tượng / Người phụ trách / Trạng thái / Ngày nhập** — đối xứng lỗi ID | Fix 1 lần cho cả 2 spec (đối xứng) |

### §3.3 P2 (nice-to-have) — 8 findings

| # | Location | Drift | Fix |
|---|---|---|---|
| P2-1..4 | wave05-id-create-v2 [:331](../ux/figma-web/wave05-id-create-v2.md#L331) + [:345](../ux/figma-web/wave05-id-create-v2.md#L345) + [:1239](../ux/figma-web/wave05-id-create-v2.md#L1239) + [:1300](../ux/figma-web/wave05-id-create-v2.md#L1300) | Stale `BR-IDV2-025 v29/v25` cites (4 loci) — BR now v41 | Bump v41 |
| P2-5 | wave05-id-edit-v2 [:1596](../ux/figma-web/wave05-id-edit-v2.md#L1596) LoaiDoiTuongField | Missing explicit `_behavior: "form load → LoaiDoiTuongField.value = stored objectType"` — BR-IDV2-025 v41 canonical yêu cầu auto-set | Add `_behavior` tag |
| P2-6 | wave05-ir-edit-v2 [:1097](../ux/figma-web/wave05-ir-edit-v2.md#L1097) LoaiDoiTuongField "Nhập khác" | Same missing auto-set behavior note | Add `_behavior` tag |
| P2-7 | wave05-ir-edit-v2 [:1506-1517](../ux/figma-web/wave05-ir-edit-v2.md#L1506) "Tự nhập giá" col | Spec capture variant column từ PNG nhưng [FEAT AC-3](../features/FEAT-IR-EDIT-V2.md#L51) không mention business behavior checkbox "Tự nhập giá" (override auto-priced returns) | Flag NEED CONFIRMATION cho FEAT/BR: add AC/BR "Tự nhập giá" toggle behavior |
| P2-8 | PNG [`13563:211779.png`](../ux/figma-web/assets/wave05-ir-detail-v2/13563:211779.png) vs [FEAT AC-2:L45](../features/FEAT-IR-DETAIL-V2.md#L45) | Screen 1 (Nhập mua) render slot "Số phiếu xuất" với link — AC-2 field CHỈ hiển thị khi Loại = `RECEIPT_RETURN_FROM_SALES`, Nhập mua phải ẩn. Fixture drift + missing explicit `visible_when` DSL | Add `visible_when: "receiptType === 'RECEIPT_RETURN_FROM_SALES'"` — consistency với id-detail-v2 pattern |
| P2-9 | wave05-id-delete + wave05-ir-delete Confirm button | PNG render "Xoá" (dấu sắc trên `a`) vs FEAT "Xóa" (dấu sắc trên `o`) — diacritic variant, verbatim string literal | BA chọn 1 canonical, sync FEAT ↔ Figma cả 2 spec |

---

## §4 Cross-cutting patterns

1. **Spec md prose cleanup lag sau fix BR** (Nhóm A, 8 P1) — flip Option B hôm 2026-07-16 touch BR + FEAT canonical text nhưng để lại spec md prose/§VV/DSL comments cite pre-flip pattern. **Reviewer follow-up rule mới**: mỗi lần flip UX pattern, MUST grep spec md `Product/ux/figma-*/wave*.md` cho keywords cũ ("radio", version cites old) và cascade fix cùng batch.

2. **PNG oracle discipline missing** (root cause chính) — 2 review trước (FIGMA-CROSSCHECK 2026-07-14, BA-REVIEW 2026-07-15) đã miss vì tin text (BR ↔ spec md prose visual_notes) thay vì mở PNG. Đề xuất **memory update** cho `checklist-gate-png-canonical` + add rule warm-up Phase A: "MUST open PNG bằng Read tool khi review UX widget pattern; verdict CONFIRMED chỉ khi có PNG cite; text-vs-text = verdict PLAUSIBLE only".

3. **Cross-spec inconsistency** (Nhóm B P1-B3, D1+D2, P2-9) — 2 boundary IR + ID vẽ 2 style khác nhau cho cùng primary action / filter order / button label. Signal: Figma design không có centralized "atomic" pattern library — mỗi màn tự vẽ. **Design team action**: dedicated review pass symmetry cho pair Receipt ↔ Delivery (đối xứng cực cao).

4. **Missing element vs "everything must be visible in Figma"** (P1-C1) — Figma DRAFT frame chỉ vẽ 3 nút, FEAT nói 4 nút ("In phiếu luôn khả dụng"). Reviewer trước không catch vì spec md note "Figma omission — flag lên BA sync" nhưng không escalate. **Rule mới**: `Figma omission` note trong spec md → auto P1 finding, MUST resolve trước DEV.

---

## §5 Recommendation — fix ordering

**Batch 1 (BLOCK /dev-start, ~1-2h)**:
- Fix P0-1 + P0-2 (id-edit-v2 spec — Trạng thái editable + AC-4b popup coverage)
- Bump wave05-id-edit-v2 spec version

**Batch 2 (nên trong cùng session pre-DEV, ~2-3h)**:
- Cascade cleanup 8 spec md prose (Nhóm A) — sweep grep + rewrite text cite BR v41/v43
- Fix P1-C1 (ir-detail thiếu "In phiếu nhập") — Design flag
- Fix P1-C2 (id-edit off-by-one count) — 1-line edit
- Batch bump spec md versions

**Batch 3 (need BA decision, blocker soft)**:
- P1-B1 button label `[Đóng]` vs `[Hủy]` — BA chọn canonical
- P1-B4 confirm body wording "nhập kho" — BA chọn
- P1-D1 + D2 filter order — BA chốt reorder Figma hay reorder FEAT/BR
- P1-B3 button variant primary blue vs outline — Design chốt
- P2-9 diacritic "Xoá" vs "Xóa" — BA chốt

**Batch 4 (defer, không blocker)**:
- P1-B2 spec md AC-5 v13 popup coverage extend (id-detail)
- 8 P2 findings — batch cùng version bump lần sau

---

## §6 Reference

- **Related fix hôm 2026-07-16**: BR-IDV2-025 v41 + BR-IRV2-025 v43 + FEAT-ID-CREATE-V2 v31 + FEAT-IR-CREATE-V2 v32 + gf-inventory-api.md v59
- **Root cause RCA**: memory [[warm-up-detection-heuristics]] cần extend rule PNG-first
- **Precedent**: memory [[checklist-gate-png-canonical]] — "PNG oracle là canonical, không tin prose visual_notes"
- **Prior reviews (miss drift)**: [FIGMA-CROSSCHECK-W05-INVENTORY-V2-2026-07-14.md](FIGMA-CROSSCHECK-W05-INVENTORY-V2-2026-07-14.md), [BA-REVIEW-W05-INVENTORY-V2-2026-07-15.md](BA-REVIEW-W05-INVENTORY-V2-2026-07-15.md)

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-16 | 1 | main-agent + 4 parallel subagents (PNG oracle-first method) | Initial report — post-drift-fix sweep W05 Inventory V2 8 Figma web specs. Verdict NEEDS_REVISION: 2 P0 + 15 P1 + 8 P2. Fix "Loại đối tượng" verify PASS cả 4 form. Recommend 4-batch fix ordering. |
