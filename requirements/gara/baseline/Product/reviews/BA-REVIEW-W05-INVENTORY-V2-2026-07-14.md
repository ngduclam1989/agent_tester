---
type: ba-review-report
artifact_kind: ba-review
scope: W05-INVENTORY-V2
verdict: REJECTED
files_reviewed: 22
p0_high: 7
p0_medium: 0
p1_high: 8
p1_medium: 3
p2: 4
low_confidence: 0
delta_mode: true
previous_report: Product/reviews/PO-REVIEW-INVENTORY-V2-2026-07-13.md
reviewer: agent-ba-review v5
emitted_at: 2026-07-14
---

# BA-REVIEW — W05-INVENTORY-V2

## Summary

- **Verdict: REJECTED** — 7 P0 HIGH (100% carry-over từ PO-REVIEW 2026-07-13, chưa fix; không có evidence rằng doc đã update để giải quyết P0).
- **Instant-reject triggered**: KHÔNG (không hit category persona/tenant/silent-claim/AC-no-Tại-Khi-Thì).
- **Score trend**: **STABLE** so với PO review 2026-07-13 (P0=7 giữ nguyên; P1 giảm nhẹ do 2 finding STK-only ngoài W05 scope + thêm 3 P1 mới từ oracle HTML).
- **Scope alignment**: PKG-W05 declare 14 FEAT (7 IR + 7 ID) — khớp 14 FEAT trong `changed_files[]`. **3 FEAT STK-V2 + FEAT-IP-VIEW-V2 KHÔNG thuộc W05** (thuộc W06 per PKG §2.3 Out of Scope) → 2 finding PO-REVIEW C2.3/C9.2 mark `RESOLVED (out-of-scope W05)`.

## Score trend (delta mode)

| Review date | Verdict | P0 | P1 | P2 |
|---|---|---|---|---|
| 2026-07-13 (PO) | REJECTED | 7 | 9 | 5 |
| 2026-07-14 (BA) | REJECTED | 7 | 11 | 4 |

Delta: +3 P1 (new HTML oracle findings F-NEW-1, F-NEW-2, F-NEW-3); -2 P1 (STK-only findings C2.3, C9.2 out-of-scope W05); -1 P2 (C7 STK-specific dropped).

---

## §1. Scope & Artifacts reviewed

### 14 FEAT (khớp PKG-W05)

| # | FEAT | Version | Domain | Notes |
|---|---|---|---|---|
| 1 | FEAT-IR-LIST-V2 | 7 | IR | — |
| 2 | FEAT-IR-CREATE-V2 | 26 | IR | — |
| 3 | FEAT-IR-DETAIL-V2 | 9 | IR | — |
| 4 | FEAT-IR-EDIT-V2 | 14 | IR | — |
| 5 | FEAT-IR-DELETE | 5 | IR | — |
| 6 | FEAT-IR-PRINT | 5 | IR | **Sửa hôm nay** — link HTML |
| 7 | FEAT-IR-EXPORT | 4 | IR | — |
| 8 | FEAT-ID-LIST-V2 | 5 | ID | — |
| 9 | FEAT-ID-CREATE-V2 | 21 | ID | — |
| 10 | FEAT-ID-DETAIL-V2 | 7 | ID | — |
| 11 | FEAT-ID-EDIT-V2 | 10 | ID | — |
| 12 | FEAT-ID-DELETE | 2 | ID | — |
| 13 | FEAT-ID-PRINT | 2 | ID | **Sửa hôm nay** — link HTML |
| 14 | FEAT-ID-EXPORT | 2 | ID | — |

### EP / BR / UX-Flow / Oracle

| Kind | Artifact | Version |
|---|---|---|
| EP | EP-INVENTORY-RECEIPT-V2 | 7 |
| EP | EP-INVENTORY-DELIVERY-V2 | 3 |
| BR | BR-GF-INVENTORY-RECEIPT-V2 | 32 (BR-IRV2-001..033) |
| BR | BR-GF-INVENTORY-DELIVERY-V2 | 28 (BR-IDV2-001..031) |
| UX-Flow | UX-FLOW-INVENTORY-RECEIPT-V2 | 9 |
| UX-Flow | UX-FLOW-INVENTORY-DELIVERY-V2 | 10 |
| HTML oracle | phieu-nhap-kho-01-vt.html | new (2026-07-14) |
| HTML oracle | phieu-xuat-kho-02-vt.html | new (2026-07-14) |

---

## §2. Delta status vs PO-REVIEW 2026-07-13

### Carry-over findings (chưa fix — verified qua grep)

| Old ID | Sev | Status now | Verification method | Notes |
|---|---|---|---|---|
| C2.1 | P0 | **CARRY-OVER** | grep row cap trong FEAT-{IR,ID}-EXPORT.md = 0 hit | Vẫn OPEN |
| C2.2 | P0 | **CARRY-OVER** | grep `sample_file\|file mẫu\|template.*xlsx` trong 2 FEAT EXPORT = 0 hit | Vẫn OPEN |
| C2.3 | P1 | **RESOLVED (out-of-scope W05)** | STK FEAT không thuộc PKG-W05 | Defer W06 |
| C2.4 | P1 | **CARRY-OVER** | grep điểm ra AC-Lưu trong 4 FEAT CREATE/EDIT — không có route/toast | Vẫn OPEN |
| C2.5 | P1 | **CARRY-OVER** | grep `ERR-CMN-008` trong BR-IRV2 + BR-IDV2 + FEAT-EDIT-V2 = 0 hit | Vẫn OPEN |
| C3.1 | P0 | **CARRY-OVER** | ERROR-CODE-REGISTRY.md line 68 vẫn "10MB" (chưa update) | Vẫn OPEN |
| C3.2 | P0 | **CARRY-OVER** | ERROR-CODE-REGISTRY.md line 93 vẫn "[DRAFT/PROPOSED]" | Vẫn OPEN |
| C3.3 | P1 | **CARRY-OVER** | không có `ERR-CMN-EMPTY-LIST` INFO code | Vẫn OPEN |
| C4.1 | P0 | **CARRY-OVER** | `Product/_common/` folder không tồn tại | Vẫn OPEN |
| C4.2 | P1 | **CARRY-OVER** | duplicate validation vẫn inline | Vẫn OPEN |
| C7 | P2 | **CARRY-OVER (partial)** | Retry / undo / progressive disclosure — vẫn chưa fix | Vẫn OPEN |
| C8.1 | P0 | **CARRY-OVER** | `grep -c 'feature_flag' Product/features/FEAT-{IR,ID}-*.md` → 0/14 | Vẫn OPEN |
| C8.2 | P0 | **CARRY-OVER** | 14/14 FEAT không có AC kill-switch behavior | Vẫn OPEN |
| C8.3 | P1 | **CARRY-OVER** | 2 EP W05 không có §Rollout Plan | Vẫn OPEN |
| C9.1 | P1 | **CARRY-OVER** | `figma-links.yaml` chưa có `waves["05"]:` key | Vẫn OPEN |
| C9.2 | P1 | **RESOLVED (out-of-scope W05)** | STK mobile Figma — W06 scope | Defer W06 |
| C10.1 | P1 | **CARRY-OVER** | 2 EP W05 vẫn "Target wave TBD" | Vẫn OPEN |

**Carry-over total**: **7 P0 + 8 P1 + 1 P2 (aggregate)** trên W05 scope.

---

## §3. New findings (BA review 2026-07-14)

### F-NEW-1 [P1 HIGH] Wording drift "Người lập phiếu" (FEAT/BR) vs "Người lập biểu" (HTML oracle)

- **Criterion**: #1 Consistency + #9 Design↔Content alignment
- **Category**: terminology / design-alignment
- **Files**:
  - `Product/features/FEAT-IR-PRINT.md:54` — AC-2 "**Người lập phiếu** · Người giao hàng · Thủ kho · Kế toán trưởng"
  - `Product/features/FEAT-ID-PRINT.md:52` — AC-2 "**Người lập phiếu** · Người nhận hàng · Thủ kho · Kế toán trưởng ... · Giám đốc"
  - `Product/business-rules/BR-GF-INVENTORY-RECEIPT-V2.md:71` — BR-IRV2-019 "Khối chữ ký: **Người lập phiếu** / ..."
  - `Product/business-rules/BR-GF-INVENTORY-DELIVERY-V2.md:68` — BR-IDV2-019 "Khối chữ ký: **Người lập phiếu** / ..."
  - vs `Product/ux/assets/phieu-nhap-kho-01-vt.html:308` — `<div class="signature-role">**Người lập biểu**</div>`
  - vs `Product/ux/assets/phieu-xuat-kho-02-vt.html:254` — `<div class="signature-role">**Người lập biểu**</div>`
- **Issue**: HTML template (mới add hôm nay 2026-07-14 làm oracle) dùng "Người lập **biểu**" theo chuẩn TT 99/2025/TT-BTC; Change Log v5 FEAT-IR-PRINT + v2 FEAT-ID-PRINT (cùng ngày 2026-07-14) confirm "khối chữ ký 4 vai (Người lập **biểu** · ...)". Nhưng body AC-2 của 2 FEAT + BR-IRV2-019 + BR-IDV2-019 vẫn ghi "Người lập **phiếu**" — 4 nơi chưa sync với oracle mới. DEV render PDF sẽ có 2 nguồn contradictory: template HTML = "biểu", spec AC = "phiếu".
- **Owner**: BA (sync wording sau khi Business Authority chốt cụm chuẩn theo TT 99/2025).
- **Suggested action**: Chốt "Người lập **biểu**" (theo Thông tư 99/2025/TT-BTC + HTML oracle) → edit 4 vị trí trên; bump 3-in-1 cho FEAT-IR-PRINT (v5→v6), FEAT-ID-PRINT (v2→v3), BR-IRV2 (v32→v33), BR-IDV2 (v28→v29).
- **Confidence**: HIGH (grep confirm 4 hit trong FEAT/BR body vs 2 hit trong HTML — cross-verified).

### F-NEW-2 [P1 MEDIUM] HTML "Giám đốc (Ký, họ tên, đóng dấu)" — AC-2 chỉ "(Ký, họ tên)"

- **Criterion**: #9 Design↔Content alignment
- **Category**: design-alignment / completeness
- **Files**:
  - `Product/ux/assets/phieu-xuat-kho-02-vt.html:271` — `<div class="signature-hint">(Ký, họ tên, đóng dấu)</div>` (Giám đốc)
  - vs `Product/features/FEAT-ID-PRINT.md:52` — AC-2 "**Giám đốc** — (Ký, họ tên)" (thiếu "đóng dấu")
  - `Product/features/FEAT-ID-PRINT.md:65` (§3 UI/UX Reference note) có mention "**Giám đốc** — ký, họ tên, **đóng dấu**" — nhưng AC-2 body không có.
- **Issue**: Wording "đóng dấu" (Giám đốc = đại diện pháp lý → cần dấu công ty) có trong HTML oracle + §3 note nhưng chưa cascade xuống AC-2 body. Downstream DEV/QA đọc AC-2 sẽ code hint field thiếu "đóng dấu"; test không catch lệch.
- **Owner**: BA.
- **Suggested action**: Bổ sung "(Ký, họ tên, đóng dấu)" cho Giám đốc trong AC-2 FEAT-ID-PRINT + BR-IDV2-019 (nếu BR mở rộng ghi chi tiết hint từng vai). Bump 3-in-1.
- **Confidence**: MEDIUM (chỉ 1 nguồn HTML confirm — nhưng Change Log v2 FEAT-ID-PRINT đã note "Giám đốc — có 'đóng dấu'" → business intent rõ ràng).

### F-NEW-3 [P1 HIGH] FEAT-IR-PRINT §5 thiếu cite BR-IRV2-024 (asymmetric với FEAT-ID-PRINT)

- **Criterion**: #5 Traceability AC↔BR
- **Category**: traceability
- **Files**:
  - `Product/features/FEAT-IR-PRINT.md:80` — §5 Business Rules chỉ liệt kê **BR-IRV2-019** (bố cục PDF).
  - `Product/features/FEAT-IR-PRINT.md:66` — AC-4 "In khả dụng ở mọi trạng thái phiếu" — không có BR justify.
  - vs `Product/business-rules/BR-GF-INVENTORY-RECEIPT-V2.md:76` — **BR-IRV2-024** có nêu: "**In phiếu** và **Xuất excel** **luôn khả dụng** không phụ thuộc trạng thái hay kỳ" — nhưng FEAT-IR-PRINT không cite.
  - Đối lập: `Product/features/FEAT-ID-PRINT.md:74-75` §5 cite cả **BR-IDV2-019 + BR-IDV2-024** ("In luôn khả dụng") — đúng chuẩn.
- **Issue**: FEAT-IR-PRINT AC-4 business rule "khả dụng ở mọi trạng thái" → BR justify tồn tại (BR-IRV2-024) nhưng FEAT không cite. Traceability AC↔BR lệch cho AC-4. FEAT-ID-PRINT có pattern đúng — FEAT-IR-PRINT lệch pattern.
- **Owner**: BA.
- **Suggested action**: Thêm dòng BR-IRV2-024 vào §5 FEAT-IR-PRINT: "**BR-IRV2-024**: In luôn khả dụng (không phụ thuộc trạng thái / kỳ)". Bump 3-in-1.
- **Confidence**: HIGH (grep confirm — asymmetric giữa 2 file symmetric FEAT PRINT).

### F-NEW-4 [P1 HIGH] HTML placeholder wider than FEAT §3 note list (missing `receiptDay/Month/Year` + sign date)

- **Criterion**: #9 Design↔Content alignment (Component/field alignment)
- **Category**: design-alignment / completeness
- **Files**:
  - `Product/features/FEAT-IR-PRINT.md:71` — §3 note liệt kê placeholder: "*(tenant, voucherNo, debit/credit, deliveredByName, sourceDoc, warehouse, location, items[], totalAmount, amountInWords, attachmentsCount, sign date)*" — thiếu `receiptDay/Month/Year` (ngày nhập kho trên tiêu đề).
  - vs `Product/ux/assets/phieu-nhap-kho-01-vt.html:227` — `<p class="doc-date">Ngày {{receiptDay}} tháng {{receiptMonth}} năm {{receiptYear}}</p>` (bind ngày nhập kho, khác `signDay/Month/Year`).
  - Tương tự `FEAT-ID-PRINT.md:65` §3 note thiếu `deliveryDay/Month/Year` (line 180 HTML).
- **Issue**: FEAT §3 note claim đủ placeholder nhưng grep list thấy thiếu 3 field (receiptDay/Month/Year và deliveryDay/Month/Year). DEV làm binding contract theo FEAT note → miss binding ngày chứng từ ở tiêu đề PDF → PDF render `Ngày {{receiptDay}} tháng {{receiptMonth}}...` literal text placeholder.
- **Owner**: BA.
- **Suggested action**: Bổ sung `receiptDay/Month/Year` (IR) và `deliveryDay/Month/Year` (ID) vào list placeholder tại §3 UI/UX Reference (phân biệt rõ với `signDay/Month/Year` — 2 field ngày khác nhau). Bump 3-in-1.
- **Confidence**: HIGH (grep placeholder trong HTML vs list note trong FEAT — deterministic mismatch).

### F-NEW-5 [P1 MEDIUM] AC-2 "Theo đơn hàng số ... của [đối tượng]" narrower than HTML `sourceDocType/sourceDocNo/sourceDocParty`

- **Criterion**: #9 Design↔Content alignment
- **Category**: design-alignment / completeness
- **Files**:
  - `Product/features/FEAT-IR-PRINT.md:50` — AC-2 "Theo **đơn hàng số** [mã đơn hàng] ngày ... của [đối tượng] (nếu có PO/đối tượng)."
  - vs `Product/ux/assets/phieu-nhap-kho-01-vt.html:240-246` — 6 field: `{{sourceDocType}}` (loại chứng từ, VD "Hóa đơn"/"Đơn hàng"/"Phiếu giao"), `{{sourceDocNo}}`, `{{sourceDocDay/Month/Year}}`, `{{sourceDocParty}}`.
- **Issue**: HTML template flexible (mọi loại chứng từ nguồn: PO / hóa đơn / phiếu giao / v.v.) — hợp lý cho phiếu Nhập với 4 loại (RECEIPT_PURCHASE / RECEIPT_RETURN_FROM_SALES / RECEIPT_OTHER / v.v.) khác chứng từ nguồn. AC-2 lock "đơn hàng" → DEV có thể hardcode literal "Theo đơn hàng số" thay vì bind `sourceDocType` dynamic → phiếu "Nhập khác" không có PO in ra "Theo đơn hàng số [trống]" awkward.
- **Owner**: BA.
- **Suggested action**: Cập nhật AC-2 "Theo **[loại chứng từ nguồn]** số ... ngày ... của **[đối tượng]** (nếu có; loại chứng từ theo Loại phiếu — VD Nhập mua = 'Đơn hàng', Nhập trả bán = 'Phiếu xuất bán', Nhập khác = 'Chứng từ')". Bump 3-in-1.
- **Confidence**: MEDIUM (HTML rõ ràng broader; nhưng có thể BA quyết chỉ dùng "Đơn hàng" cho V2 — cần confirm).

### F-NEW-6 [P2] HTML `debitAccount/creditAccount` placeholder tồn tại nhưng AC nói "để trống"

- **Criterion**: #9 Design↔Content alignment (mode-conditional)
- **Category**: design-alignment
- **Files**:
  - `Product/ux/assets/phieu-nhap-kho-01-vt.html:233-234`, `phieu-xuat-kho-02-vt.html:185-186` — placeholder `{{debitAccount}}` / `{{creditAccount}}` bound literal.
  - vs `FEAT-IR-PRINT.md:48` + `FEAT-ID-PRINT.md:46` — AC-2 "(Nợ/Có **để trống**)".
- **Issue**: Contract ambiguous — HTML có placeholder (agent BE có thể bind giá trị) nhưng AC nói "để trống" (agent FE có thể render "Nợ: " literal). Không blocking (default V2 để trống, template forward-compat cho phase khi integrate Accounting), nhưng nên note explicit "V2 render trống; placeholder giữ cho tương lai fill từ hạch toán kế toán".
- **Owner**: BA + Architect.
- **Suggested action**: AC-2 note thêm "AC V2: `debitAccount = creditAccount = ""` — placeholder trong template giữ cho tương lai (khi tích hợp hạch toán Nợ/Có tự động)".
- **Confidence**: MEDIUM.

### F-NEW-7 [P2] FEAT-ID-PRINT thiếu `signDay/Month/Year` trong list placeholder §3

- **Criterion**: #9 Design↔Content alignment
- **Category**: completeness
- **Files**: `Product/features/FEAT-ID-PRINT.md:65` — §3 note kết bằng "sign date" (chung chung), không explicit 3 field `signDay/signMonth/signYear` như HTML line 251.
- **Issue**: Đối xứng F-NEW-4 — dùng cụm "sign date" ambiguous; HTML tách 3 field.
- **Suggested action**: Bổ sung explicit `signDay/signMonth/signYear`. (Gộp cùng F-NEW-4 khi fix.)
- **Confidence**: MEDIUM.

---

## §4. Deep-check summary

| Nhóm | Ran | Findings | Skip reason |
|---|---|---|---|
| **E — Error-code registry** | YES | 2 (C3.1 carry-over ERR-CMN-004 drift = E5 versioning + E1 format · C3.2 carry-over ERR-INV-* status = E1 format). Không tìm ra E2 duplicate / E3 orphan / E4 missing mới (mọi mã cite trong FEAT/BR đều tồn tại registry, mọi mã registry đều được cite). | — |
| **C — BR-COMMON compliance** | PARTIAL | Không tìm ra C1 duplicate / C2 conflict / C3 missing cite / C4 cite orphan mới. FEAT/BR không cite BR-COMMON tag — có thể do repo chưa có `Product/Commons/BR-COMMON.md` (path trong SCOPE INPUT `Product/Commons/BR-COMMON.md` vs skill mặc định `Product/error-code/BR-COMMON.md` — cần confirm path canonical, đã grep 2 path đều không thấy file). Nếu chưa bootstrap BR-COMMON → check này degrade thành "N/A". | File BR-COMMON.md không tìm thấy tại `Product/Commons/` cũng như `Product/error-code/` — nên C1-C4 default `not_applicable` |
| **A — ba-author v4 integrity** | SKIPPED | `author_return_json = null` per SCOPE INPUT | Không có return JSON |

---

## §5. Findings — grouped by owner

### PM (Product Manager)
- **[P0][C4.1]** Bootstrap `Product/_common/` folder (4 file skeleton) — carry-over.
- **[P1][C8.3]** 2 EP W05 thêm §Rollout Plan (IR trước / ID sau, hoặc bật đồng thời?).

### BA (Business Analyst)
- **[P0][C2.1]** 2 FEAT EXPORT (IR + ID) thêm row cap explicit + BR + error code.
- **[P0][C2.2]** 2 FEAT EXPORT attach `.xlsx` sample file.
- **[P0][C8.1]** 14 FEAT thêm `feature_flag:` frontmatter (batch CR).
- **[P0][C8.2]** 14 FEAT thêm AC kill-switch behavior.
- **[P1][C2.4]** 4 FEAT CREATE/EDIT thêm điểm ra AC-Lưu.
- **[P1][C2.5]** 2 FEAT EDIT cite `ERR-CMN-008` optimistic lock.
- **[P1][C3.3]** Cite ERR-CMN-EMPTY-LIST (chờ registry add) trong EC-1 các LIST/EXPORT.
- **[P1][C4.2]** Refactor duplicate validation sau khi có common.
- **[P1][C10.1]** Chốt Target wave = W05 cho 2 EP.
- **[P1][F-NEW-1]** Sync "Người lập phiếu" → "Người lập biểu" 4 vị trí (2 FEAT PRINT AC-2 + 2 BR-*V2-019).
- **[P1][F-NEW-3]** FEAT-IR-PRINT §5 thêm cite BR-IRV2-024.
- **[P1][F-NEW-4]** FEAT-IR-PRINT + FEAT-ID-PRINT §3 note bổ sung `receiptDay/Month/Year` (IR) và `deliveryDay/Month/Year` (ID) + `signDay/signMonth/signYear` explicit.
- **[P1][F-NEW-5]** FEAT-IR-PRINT AC-2 mở rộng "Theo [loại chứng từ nguồn]..." không lock cứng "đơn hàng".
- **[P1][F-NEW-2]** FEAT-ID-PRINT AC-2 bổ sung "(Ký, họ tên, đóng dấu)" cho Giám đốc.
- **[P2][F-NEW-6]** AC-2 note explicit "Nợ/Có = trống V2, placeholder giữ future" cho 2 FEAT PRINT.
- **[P2][F-NEW-7]** Gộp với F-NEW-4 (signDay/Month/Year explicit list).

### UX
- **[P2][C7 aggregate]** Retry / undo / progressive disclosure / confirm dialog số phiếu bỏ ghi sổ — carry-over improvements.

### Architect / Business Authority (co-own registry)
- **[P0][C3.1]** CR update ERR-CMN-004 message "10MB" → "30MB" trong ERROR-CODE-REGISTRY §2 + §6 + bump v18.
- **[P0][C3.2]** CR cutover ERR-INV-* status "DRAFT/PROPOSED" → "ACTIVE" trong ERROR-CODE-REGISTRY §4.
- **[P1][C9.1]** `scripts/sync-figma-links.sh 05` sau W05 kickoff.

---

## §6. Verdict decision

| Verdict | Điều kiện | Match? |
|---|---|---|
| APPROVED | P0 HIGH+MEDIUM = 0 AND P1 HIGH+MEDIUM = 0 AND không instant-reject | ❌ (P0=7) |
| NEEDS_REVISION | P0 = 0 AND P1 ≥ 1 AND không instant-reject | ❌ (P0 ≠ 0) |
| **REJECTED** | **P0 HIGH+MEDIUM ≥ 1 OR instant-reject** | ✅ **(7 P0 HIGH)** |

**Chosen verdict: REJECTED**

**Rationale**: 7 P0 HIGH carry-over 100% từ PO-REVIEW 2026-07-13 (báo cáo cách đây 1 ngày). Ngoại trừ 2 file HTML mẫu in mới thêm (làm oracle DEV) + bump 2 file FEAT-*-PRINT version, source docs W05 không có evidence rằng P0 đã được address (grep verify `feature_flag = 0`, ERROR-CODE-REGISTRY.md ERR-CMN-004 vẫn "10MB", `_common/` folder chưa tồn tại, ERR-INV-* vẫn "DRAFT/PROPOSED"). Việc thêm 2 HTML mẫu in là bước đúng đắn (cung cấp oracle cho DEV render PDF), NHƯNG ngay lập tức làm phát sinh 5 finding P1 mới về design↔content alignment (F-NEW-1..5) do body FEAT/BR chưa sync với oracle mới.

**Nghiệp vụ core (traceability AC↔BR, terminology, persona, state machine, cross-EP consistency IR↔ID) — HIGH quality:**
- ✅ State transition Nháp → Ghi sổ → Bỏ ghi sổ đồng bộ 2 module IR + ID.
- ✅ Persona dual (chủ garage + kế toán) tuân Critical Rule #6.
- ✅ Format số phiếu, permission matrix, kỳ kế toán logic đồng bộ 2 EP.
- ✅ PKG-W05 scope integrity: 14 FEAT list khớp exact — không thiếu spec.
- ✅ BQGQ dependency clear: EC-1 FEAT-IR-PRINT ("đơn giá nhập, không phụ thuộc BQGQ") vs EC-1 FEAT-ID-PRINT ("giá vốn = 0 đến khi chạy BQGQ") — asymmetric correctly per business logic.

**Điểm nghẽn: tầng infrastructure/policy compliance** (common registry, feature-flag, error-code cutover) — cùng nhóm root cause với PO-REVIEW.

---

## §7. Next steps

- **REJECTED** → fix 7 P0 (carry-over) theo Round 1 của PO-REVIEW §5, + 5 P1 mới từ oracle HTML (F-NEW-1..5).
- Ưu tiên fix P0 song song với 5 P1 HTML sync (P1 HTML sync chỉ mất ~30 phút cho 4 file, không blocking Round 1 P0).
- Sau khi fix xong → chạy lại `/ba-review W05-INVENTORY-V2 --previous Product/reviews/BA-REVIEW-W05-INVENTORY-V2-2026-07-14.md` để delta re-audit.
- Chỉ khi verdict APPROVED → unlock `/arch-design W05` + `/gen-execution-spec W05`.

---

## Fallback notes

- SKILL po-review đọc thành công — theo template.
- `BR-COMMON.md` file không tìm thấy tại `Product/Commons/BR-COMMON.md` cũng như `Product/error-code/BR-COMMON.md` — deep-check C degraded to N/A. (Có thể canonical path đã đổi — cần confirm.)
