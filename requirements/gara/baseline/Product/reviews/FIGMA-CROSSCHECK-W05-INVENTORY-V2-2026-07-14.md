---
type: figma-crosscheck-report
artifact_kind: figma-audit
scope: W05-INVENTORY-V2-WEB
verdict: NEEDS_REVISION
feats_reviewed: 10
match_high: 1
match_medium: 9
match_low: 0
reviewer: 10-parallel-general-purpose-subagents
figma_file_key: EMGjGsnAJzGoGwTSK7dTuZ
emitted_at: 2026-07-14
---

# Figma ↔ Product Cross-check Report — W05 Inventory V2 (Web)

## Summary

10 FEAT (5 IR + 5 ID) cross-checked Figma design vs Product FEAT AC. **9/10 match=medium, 1/10 match=high** (FEAT-IR-LIST-V2). Không có FEAT nào match=low.

Không có FEAT perfect match. Toàn bộ 10 FEAT có gap cần fix — chia làm 3 nhóm root cause:
1. **Systematic wording drift** (~40% gap): FEAT vs Figma có convention khác nhau về button labels + tab casing (universal across FEAT).
2. **Figma stale content** (~35% gap): Figma predates FEAT v2/v6 updates → chưa sync (Tiền vốn/Giá vốn, 30MB/5MB, sourceDocType, Diễn giải).
3. **Missing screens/states** (~25% gap): Figma thiếu modal frames, error states, empty states mà FEAT AC declare.

---

## §1 Per-FEAT Verdict

| FEAT | Match | P0 count | P1 count | P2 count | Ghi chú |
|---|---|---|---|---|---|
| FEAT-IR-LIST-V2 | 🟢 high | 0 | 4 | 2 | 13/13 cột khớp. Toolbar "In" button missing. Placeholder Figma typo. |
| FEAT-IR-CREATE-V2 | 🟡 medium | 3 | 5 | 3 | Nút Tạo|Huỷ bỏ ≠ Lưu|Đóng. Attachment format. Missing modals. |
| FEAT-IR-DETAIL-V2 | 🟡 medium | 1 | 5 | 2 | Label "Xuất xứ" bug (should be "Ngày sửa"). Missing Sửa/Xóa on Ghi sổ. Timeline V1 stale. |
| FEAT-IR-EDIT-V2 | 🟡 medium | 1 | 4 | 3 | Attachment hint stale "25 tệp × 5MB" (V1). Chỉnh sửa ≠ Sửa. |
| FEAT-IR-DELETE | 🟡 medium | 1 | 2 | 1 | Block dialog copy contradict FEAT AC-2. "PX-00028" sample sai prefix. |
| FEAT-ID-LIST-V2 | 🟡 medium | 0 | 4 | 3 | "Giá vốn" (Figma stale) vs "Tiền vốn" (FEAT v2). Toolbar "In" missing. |
| FEAT-ID-CREATE-V2 | 🟡 medium | 3 | 6 | 2 | Same pattern IR-CREATE. Số phiếu "PN-007217" sai prefix (should be PX-). |
| FEAT-ID-DETAIL-V2 | 🟡 medium | 0 | 4 | 3 | Extra "Thêm phụ tùng" khi Ghi sổ (leak edit mode). Missing Sửa/Xóa. |
| FEAT-ID-EDIT-V2 | 🟡 medium | 0 | 4 | 3 | Title "Chỉnh sửa" ≠ "Sửa". 15 cột chưa spec đủ. |
| FEAT-ID-DELETE | 🟡 medium | 1 | 1 | 1 | Same block dialog contradict issue với IR-DELETE. |
| **TOTAL** | | **10 P0** | **39 P1** | **23 P2** | |

---

## §2 Cross-FEAT Systematic Issues (fix 1 lần ảnh hưởng nhiều FEAT)

### SYS-1 [P0] Button label systematic: "Lưu|Đóng" (FEAT) vs "Tạo|Huỷ bỏ" (Figma) — 4 FEAT

- **Affected**: FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2, FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2
- **Figma verbatim**: `Huỷ bỏ` (secondary) + `Tạo` / `Lưu` (primary)
- **FEAT AC verbatim**: `Đóng` / `Hủy` + `Lưu`
- **Decision needed**: Chốt convention:
  - Option A: Follow Figma → FEAT AC dùng "Tạo" (form Tạo mới) + "Huỷ bỏ"
  - Option B: Follow FEAT → Figma re-label "Tạo" → "Lưu" + "Huỷ bỏ" → "Đóng"
  - Option C: Hybrid — "Lưu" cho cả Create + Edit (như FEAT); "Hủy" cho secondary
- **Root cause**: convention chưa lock — Figma theo pattern "Tạo mới" động từ, FEAT theo pattern "Lưu" chung.

### SYS-2 [P0] Attachment format whitelist mismatch — 4 FEAT

- **Affected**: FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2, FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2
- **Figma verbatim**: `Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf`
- **FEAT AC verbatim + BR-IRV2-026 / BR-IDV2-026**: `PDF, JPG, PNG` (ERR-CMN-005)
- **Issues**:
  - Figma extra `.doc` + `.xlxs` (KHÔNG có trong FEAT whitelist)
  - Figma typo `.xlxs` (chuẩn `.xlsx`)
  - Figma `.jpeg` vs FEAT `JPG` (alias OK nhưng inconsistent)
- **Decision needed**: 
  - Option A: FEAT giữ nguyên `PDF/JPG/PNG` → Figma xoá `.doc` + `.xlxs`, đồng bộ `.jpg`
  - Option B: Mở rộng FEAT + BR + ERR-CMN-005 để cho phép `.doc` + `.xlsx` (nếu nghiệp vụ cần)
  - Option C: Keep FEAT strict, treat Figma là design error → chỉ sửa Figma

### SYS-3 [P0] Attachment size hint stale — FEAT-IR-EDIT-V2 (1 FEAT nghiêm trọng)

- **Figma verbatim** (FEAT-IR-EDIT-V2): `(Tối đa 25tệp (5mb/tệp)` — V1 wording, còn typo mở ngoặc không đóng
- **FEAT AC + BR-IRV2-026 v25**: `5 tệp × 30MB` (ERR-CMN-004)
- **Action**: Figma refresh helper text — 1 chỗ cụ thể FEAT-IR-EDIT-V2

### SYS-4 [P0] Delete block dialog copy contradict FEAT — 2 FEAT

- **Affected**: FEAT-IR-DELETE, FEAT-ID-DELETE
- **Figma verbatim**: *"Phiếu PX-00028 đã ghi sổ kho HOẶC thuộc kỳ kế toán đã đóng nên không được xóa"*
- **FEAT AC-2 explicit**: *"Phiếu đã Ghi sổ kho vẫn xóa được khi kỳ chưa khóa (không bắt buộc Bỏ ghi sổ trước)"*
- **FEAT AC-5 (missing in Figma)**: Chặn khi xóa làm tồn kho âm (BR-IDV2-004 / BR-IRV2-008)
- **Contradiction**: Figma nói "đã ghi sổ kho" chặn xóa; FEAT nói cho phép. Figma ĐÚNG hay FEAT ĐÚNG?
- **Decision needed**:
  - Option A: Figma đúng (tenant safety) → update FEAT AC-2 cấm xóa phiếu đã ghi sổ
  - Option B: FEAT đúng (business allows) → Figma re-copy: 2 dialog riêng — "kỳ đã khóa" + "tồn âm point-in-time"
  - Option C: Compromise — cho phép xóa Ghi sổ khi kỳ chưa khóa AND không âm tồn (như FEAT AC-2 + AC-5)

### SYS-5 [P0] Sample data prefix wrong (copy-paste bug Figma) — 3 FEAT

- **FEAT-IR-DELETE** dialog: Figma `PX-00028` (Phiếu Xuất prefix) — phải là `PN-xxxxx`
- **FEAT-IR-CREATE-V2** form: Figma header `PN-007217` — OK (nhập)
- **FEAT-ID-CREATE-V2 + FEAT-ID-EDIT-V2** form: Figma header `PN-007217` — SAI (phải là `PX-xxxxx`)
- **Action**: Sửa sample data Figma theo đúng loại phiếu Nhập/Xuất

### SYS-6 [P1] Tab casing: "CHI TIẾT" (FEAT) vs "Chi tiết" (Figma) — 4 FEAT

- **Affected**: FEAT-IR-CREATE-V2, FEAT-IR-EDIT-V2, FEAT-ID-CREATE-V2, FEAT-ID-EDIT-V2
- **FEAT AC uppercase**: `CHI TIẾT` / `ĐÍNH KÈM`
- **Figma sentence-case**: `Chi tiết` / `Đính kèm`
- **Decision**: Chốt casing rule (recommend follow Figma sentence-case, đồng bộ typography convention shadcn)

### SYS-7 [P1] Title "Sửa" vs "Chỉnh sửa" — 2 FEAT

- **FEAT-IR-EDIT-V2 + FEAT-ID-EDIT-V2**: FEAT "Sửa phiếu {nhập,xuất} kho" vs Figma "Chỉnh sửa phiếu {nhập,xuất} kho"
- **Decision**: Sync về "Chỉnh sửa" (Figma) hoặc "Sửa" (FEAT). Recommend "Chỉnh sửa" — natural VN wording.

### SYS-8 [P1] Missing "In" toolbar button — 2 FEAT

- **FEAT-IR-LIST-V2 + FEAT-ID-LIST-V2**: FEAT AC-1 + AC-9/AC-7 declare 3 toolbar button (`Xuất excel`, `In`, `Tạo mới PN/PX`). Figma chỉ có 2 (`Xuất excel` + `Tạo mới phiếu {nhập,xuất}`).
- **Note**: Có icon "In" per-row trong cột Thao tác (verified) — bulk print từ toolbar không hiển thị.
- **Decision needed**:
  - Option A: Follow Figma → xoá toolbar "In" khỏi FEAT AC (chỉ giữ per-row action)
  - Option B: Follow FEAT → thêm nút "In" vào Figma toolbar (bulk print)

### SYS-9 [P1] Missing Sửa/Xóa buttons on DETAIL Ghi sổ state — 2 FEAT

- **FEAT-IR-DETAIL-V2 + FEAT-ID-DETAIL-V2**: FEAT AC-4 nói khi Ghi sổ kho + kỳ chưa khóa hiện 4 nút (Sửa, Xóa, Bỏ ghi sổ, In). Figma chỉ hiện 2 (Bỏ ghi sổ + In).
- **FEAT-ID-DETAIL extra**: Có nút "Thêm phụ tùng" khi Ghi sổ (leak edit mode — sai)
- **Decision needed**:
  - Option A: FEAT đúng → Figma add 2 nút Sửa/Xóa
  - Option B: Figma đúng (business rule khi Ghi sổ chỉ cho Bỏ ghi sổ + In) → update FEAT AC-4

### SYS-10 [P1] Search placeholder duplicate prefix (Figma bug) — 2 FEAT

- **FEAT-IR-LIST-V2 Figma**: `"Tìm số phiếu Số phiếu nhập, Số đơn hàng, Diễn giải"` (thừa cụm `số phiếu ` đầu)
- **FEAT-ID-LIST-V2 Figma**: `"Tìm số phiếu Số phiếu xuất, Phiếu dịch vụ, diễn giải"` (thừa `số phiếu ` + lowercase `diễn giải`)
- **FEAT canonical**: `"Tìm Số phiếu {nhập,xuất}, {Số đơn hàng,Phiếu dịch vụ}, Diễn giải"`
- **Action**: Figma refresh — remove duplicate prefix + fix "Diễn giải" casing

### SYS-11 [P1] Column label "SL nhập/xuất" (FEAT abbreviated) vs "Số lượng" (Figma full) — 3 FEAT

- **FEAT-IR-CREATE-V2 + FEAT-ID-CREATE-V2 + FEAT-IR-DETAIL-V2**: Column `SL nhập` / `SL xuất` (FEAT) vs `Số lượng` (Figma)
- **Decision**: Chốt convention:
  - Option A: Follow Figma → FEAT sửa về "Số lượng" (natural VN, không viết tắt)
  - Option B: Follow FEAT → Figma đổi header về "SL nhập"/"SL xuất" (khớp với `SL quy đổi`, `ĐVT xuất`)

### SYS-12 [P1] Field spec incomplete — 3+ FEAT

- **FEAT-IR-EDIT-V2 + FEAT-ID-EDIT-V2 + FEAT-IR-DETAIL-V2 + FEAT-ID-DETAIL-V2**: Fields Figma render nhưng FEAT AC không declare:
  - `Mã đơn hàng` (dropdown, header)
  - `Mã lô hàng` (input, header)
  - `Người giao hàng` (input, header)
  - `Số phiếu` (input, header)
  - `Trạng thái` (dropdown, header — editable?)
  - `Diễn giải` (input, header)
- **Note**: Cover ở BR chung nhưng FEAT AC-2 không list nên DEV có thể sót.
- **Decision needed**: FEAT AC-2 bổ sung explicit list 11-13 header fields.

### SYS-13 [P1] Table column count incomplete in AC — 4 FEAT

- **FEAT-IR-DETAIL/EDIT + FEAT-ID-DETAIL/EDIT-V2**: Figma render 14-15 cột line-item; FEAT AC generic (chỉ nói "SKU, mã nội bộ, ĐVT chính, SL, đơn giá, thành tiền, kho, ghi chú")
- **Missing từ AC spec**: STT · Tên phụ tùng (SKU display name) · Tên sản phẩm nội bộ · Ghi chú per-row · Thao tác
- **Decision**: FEAT AC bổ sung table columns section (mirror pattern FEAT-*-LIST-V2 AC-2)

### SYS-14 [P2] Missing modal frames — 3 modal cross-FEAT

- **FEAT-IR-CREATE-V2 + FEAT-ID-CREATE-V2**: Missing Figma frames:
  - Modal "+ Tạo mới mã nội bộ" (4-tab reuse FEAT-CAT-PROD-CREATE, AC-6b)
  - Modal "+ Thêm ĐVT quy đổi" (AC-6c inline)
  - Popup "Đối tượng" radio-inside-dropdown cho "Nhập/Xuất khác" (BR-*V2-025)
- **Note**: 1 modal đã có (FEAT-IR-CREATE-V2 có modal "Thêm ĐVT quy đổi" mock)
- **Action**: UX bổ sung 2-3 modal frame vào Figma

---

## §3 Isolated Bugs (không systematic, fix từng cái)

### BUG-1 [P0] Label "Xuất xứ" ở vị trí "Ngày sửa" — FEAT-IR-DETAIL-V2

- **Figma node 13573:69595**: Label = "Xuất xứ" (paired with datetime "07/05/2026 09:55")
- **FEAT AC-3 expected**: "Ngày sửa"
- **Root cause**: Copy-paste bug từ Catalog Product screen (Xuất xứ là field trong catalog)
- **Action**: Figma fix label

### BUG-2 [P1] Timeline stale V1 wording — FEAT-IR-DETAIL-V2

- **Figma nodes 13575:86692/86696/86699**: `Hoàn tất` / `Hoàn tác` / `Hủy`
- **FEAT V2**: renamed thành `Ghi sổ` / `Bỏ ghi sổ` — V2 đã DROP `Hủy` (không còn trạng thái)
- **Action**: Figma refresh timeline sub-block per V2 spec

### BUG-3 [P1] Extra field "Số phiếu xuất" trên phiếu Nhập DETAIL — FEAT-IR-DETAIL-V2

- **Figma**: Field "Số phiếu xuất" trong header phiếu Nhập
- **FEAT AC-2**: Không declare
- **Question**: Là link tới phiếu Nhập trả (từ Xuất bán) hay dư thừa?

### BUG-4 [P1] Extra field "Số phiếu nhập" trên phiếu Xuất DETAIL — FEAT-ID-DETAIL-V2

- **Figma**: Field "Số phiếu nhập" trong header phiếu Xuất
- **FEAT AC-2**: Không declare
- **Question**: Là link tới phiếu Nhập gốc (Xuất trả hàng mua) hay dư thừa?

### BUG-5 [P1] Extra "Thêm phụ tùng" trên Ghi sổ state — FEAT-ID-DETAIL-V2

- **Figma variant Ghi sổ**: Có nút "Thêm phụ tùng"
- **FEAT AC-1**: State Ghi sổ = read-only (không được edit dòng)
- **Root cause**: Leak edit mode UI vào detail read-only
- **Action**: Figma remove nút này khỏi state Ghi sổ

### BUG-6 [P2] "Xoá" vs "Xóa" spelling drift — 2 FEAT

- **FEAT-IR-DELETE + FEAT-ID-DELETE**: Figma "Xoá" (dấu sắc trên a) vs FEAT "Xóa" (dấu sắc trên o)
- **Decision**: Chốt 1 form (VN chuẩn hiện đại = "Xóa"; VN cũ = "Xoá")

### BUG-7 [P2] "Ghi sổ kho " trailing whitespace — FEAT-IR-DETAIL-V2 badge

- **Figma badge text**: `"Ghi sổ kho "` (trailing space)
- **Action**: Figma trim

### BUG-8 [P2] Section title "Thông tin phiếu" duplicated — FEAT-IR-CREATE-V2

- Section title xuất hiện 2 lần (top form + tab area)
- **Action**: Đổi section 2 → "Chi tiết phiếu" hoặc bỏ title

### BUG-9 [P2] "Giá vốn" stale label — FEAT-ID-LIST-V2

- **Figma header cột**: `Giá vốn` (V1 wording)
- **FEAT v2 (2026-06-15) renamed**: `Tiền vốn`
- **Action**: Figma sync

### BUG-10 [P2] Attachment tab count badge missing — 2 FEAT

- FEAT-IR-CREATE-V2 + FEAT-ID-CREATE-V2: FEAT AC-14 declare `ĐÍNH KÈM (n)` với count. Figma tab `Đính kèm` không có badge count.
- **Action**: Figma add badge

---

## §4 Fix Ownership Split

| Owner | Loại issue | Số finding |
|---|---|---|
| **BA/PM (Product docs)** | FEAT AC bổ sung spec (SYS-8 nếu chọn A, SYS-9 nếu chọn B, SYS-12, SYS-13) | ~15 |
| **UX/Designer (Figma refresh)** | Figma stale content, sample data, typo, missing frames (SYS-3, SYS-5, SYS-10, BUG-1..5, BUG-7..10, SYS-14) | ~25 |
| **BA + UX co-decide (convention)** | Systematic wording convention (SYS-1, SYS-2, SYS-6, SYS-7, SYS-11, BUG-6) | ~15 |
| **Architect + BA** | Delete business rule reconcile (SYS-4) | 2 |

---

## §5 Verdict Decision

**Verdict: 🟡 NEEDS_REVISION** — không có REJECTED (không rule integrity gap), không APPROVED (10 P0 + 39 P1).

- ✅ **Column headers 13/13 match** cho cả FEAT-IR-LIST-V2 + FEAT-ID-LIST-V2 (verbatim khớp, đúng thứ tự) — success case.
- ✅ **Filter names 5/5 & 6/6 match** verbatim — chỉ khác thứ tự (P2).
- ✅ **Persona + status badge colors + page title** khớp.
- ⚠ **Button labels + attachment format + delete dialog copy** cần decide convention rồi sửa 1 loạt.
- ⚠ **Figma cần refresh** để sync với FEAT v2+ (Tiền vốn, 30MB, Diễn giải, V2 status names).

## §6 Recommended Fix Order

1. **Reconcile SYS-1..SYS-5 (P0)** — chốt convention → cascade sửa FEAT hoặc Figma.
2. **UX refresh Figma** cho SYS-3, SYS-5, SYS-10, BUG-1..5, BUG-7..10 (stale content + typo).
3. **BA bổ sung FEAT AC** cho SYS-12 + SYS-13 (fields + columns explicit).
4. **UX design mới** cho SYS-14 (3 modal + empty states).
5. **Re-run cross-check** sau khi fix để verify APPROVED.
