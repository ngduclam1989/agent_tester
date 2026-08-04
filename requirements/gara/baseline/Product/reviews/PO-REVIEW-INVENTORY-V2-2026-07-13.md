---
type: review
artifact_kind: po-review
status: REJECTED
version: 3
tier: T3
owner_authority: Business Authority
scope: "EP-INVENTORY-RECEIPT-V2 + EP-INVENTORY-DELIVERY-V2 + EP-INVENTORY-STOCK-V2 (17 FEAT: 7 IR + 7 ID + 3 STK)"
reviewed_at: "2026-07-13"
reviewer: "PO (ninhnguyen) + main agent"
supersedes: null
---

# PO-REVIEW — Inventory V2 (17 FEAT · 3 EP · 3 BR · 3 UX-Flow)

> Verdict: **REJECTED**
> Total findings: **P0=7 · P1=9 · P2=5**
> Downstream unblock: **NO** — phải fix 7 P0 trước Architecture / DEV. Không cho `/gen-execution-spec W05` / `/arch-design W05` tới khi cycle mới đạt `APPROVED`.

**Pre-flight note (non-blocking):** `scripts/state.py validate` báo INVALID `owned_paths empty` (session W04/TEST_EXECUTION). Không block po-review (skill chỉ ghi `Product/reviews/` — scope authorized qua skill spec), nhưng cần fix STATE.owned_paths trước khi bấm command dev/fix cho W05.

---

## §1. Scope & Artifacts reviewed

### Feature scope (17 FEAT)

| # | FEAT ID | Version | Domain | Last Reviewed | Path |
|---|---|---|---|---|---|
| 1 | FEAT-IR-LIST-V2 | 7 | IR (nhập) | 2026-07-13 | [FEAT-IR-LIST-V2](../features/FEAT-IR-LIST-V2.md) |
| 2 | FEAT-IR-CREATE-V2 | 26 | IR | 2026-07-13 | [FEAT-IR-CREATE-V2](../features/FEAT-IR-CREATE-V2.md) |
| 3 | FEAT-IR-DETAIL-V2 | 9 | IR | 2026-06-26 | [FEAT-IR-DETAIL-V2](../features/FEAT-IR-DETAIL-V2.md) |
| 4 | FEAT-IR-EDIT-V2 | 14 | IR | 2026-07-13 | [FEAT-IR-EDIT-V2](../features/FEAT-IR-EDIT-V2.md) |
| 5 | FEAT-IR-DELETE | 5 | IR | 2026-06-26 | [FEAT-IR-DELETE](../features/FEAT-IR-DELETE.md) |
| 6 | FEAT-IR-PRINT | 4 | IR | 2026-06-10 | [FEAT-IR-PRINT](../features/FEAT-IR-PRINT.md) |
| 7 | FEAT-IR-EXPORT | 4 | IR | 2026-06-10 | [FEAT-IR-EXPORT](../features/FEAT-IR-EXPORT.md) |
| 8 | FEAT-ID-LIST-V2 | 5 | ID (xuất) | 2026-07-13 | [FEAT-ID-LIST-V2](../features/FEAT-ID-LIST-V2.md) |
| 9 | FEAT-ID-CREATE-V2 | 21 | ID | 2026-07-13 | [FEAT-ID-CREATE-V2](../features/FEAT-ID-CREATE-V2.md) |
| 10 | FEAT-ID-DETAIL-V2 | 7 | ID | 2026-06-26 | [FEAT-ID-DETAIL-V2](../features/FEAT-ID-DETAIL-V2.md) |
| 11 | FEAT-ID-EDIT-V2 | 10 | ID | 2026-07-13 | [FEAT-ID-EDIT-V2](../features/FEAT-ID-EDIT-V2.md) |
| 12 | FEAT-ID-DELETE | 2 | ID | 2026-06-26 | [FEAT-ID-DELETE](../features/FEAT-ID-DELETE.md) |
| 13 | FEAT-ID-PRINT | 1 | ID | 2026-06-03 | [FEAT-ID-PRINT](../features/FEAT-ID-PRINT.md) |
| 14 | FEAT-ID-EXPORT | 2 | ID | 2026-06-15 | [FEAT-ID-EXPORT](../features/FEAT-ID-EXPORT.md) |
| 15 | FEAT-STK-LIST-V2 | 4 | STK (tồn) | 2026-06-26 | [FEAT-STK-LIST-V2](../features/FEAT-STK-LIST-V2.md) |
| 16 | FEAT-STK-DETAIL-V2 | 5 | STK | 2026-06-26 | [FEAT-STK-DETAIL-V2](../features/FEAT-STK-DETAIL-V2.md) |
| 17 | FEAT-IP-VIEW-V2 | 6 | STK (NXT) | 2026-07-01 | [FEAT-IP-VIEW-V2](../features/FEAT-IP-VIEW-V2.md) |

### EP / BR / UX-Flow / Common

| Kind | Artifact | Version | Path |
|---|---|---|---|
| EP | EP-INVENTORY-RECEIPT-V2 | 7 | [EP-INVENTORY-RECEIPT-V2](../epics/EP-INVENTORY-RECEIPT-V2.md) |
| EP | EP-INVENTORY-DELIVERY-V2 | 3 | [EP-INVENTORY-DELIVERY-V2](../epics/EP-INVENTORY-DELIVERY-V2.md) |
| EP | EP-INVENTORY-STOCK-V2 | 5 | [EP-INVENTORY-STOCK-V2](../epics/EP-INVENTORY-STOCK-V2.md) |
| BR | BR-GF-INVENTORY-RECEIPT-V2 | 32 | [BR-GF-INVENTORY-RECEIPT-V2](../business-rules/BR-GF-INVENTORY-RECEIPT-V2.md) |
| BR | BR-GF-INVENTORY-DELIVERY-V2 | 28 | [BR-GF-INVENTORY-DELIVERY-V2](../business-rules/BR-GF-INVENTORY-DELIVERY-V2.md) |
| BR | BR-GF-INVENTORY-STOCK-V2 | 7 | [BR-GF-INVENTORY-STOCK-V2](../business-rules/BR-GF-INVENTORY-STOCK-V2.md) |
| UX-Flow | UX-FLOW-INVENTORY-RECEIPT-V2 | 9 | [UX-FLOW-INVENTORY-RECEIPT-V2](../ux/UX-FLOW-INVENTORY-RECEIPT-V2.md) |
| UX-Flow | UX-FLOW-INVENTORY-DELIVERY-V2 | 10 | [UX-FLOW-INVENTORY-DELIVERY-V2](../ux/UX-FLOW-INVENTORY-DELIVERY-V2.md) |
| UX-Flow | UX-FLOW-INVENTORY-STOCK-V2 | 6 | [UX-FLOW-INVENTORY-STOCK-V2](../ux/UX-FLOW-INVENTORY-STOCK-V2.md) |
| Common (BR-PRC) | BR-GF-INVENTORY-ACCOUNTING-PERIOD (BR-PRC-001/005/017) | — | [BR-GF-INVENTORY-ACCOUNTING-PERIOD](../business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) |

### Common registry status

- `Product/error-code/ERROR-CODE-REGISTRY.md` v17 — ⚠️ tồn tại nhưng nhóm `ERR-INV-*` (47 mã) đang **DRAFT/PROPOSED** (§4 line 93 chú thích: "chưa cutover sang các epic kho V2 — giữ ở trạng thái đề xuất tới khi Architect chốt khi spawn dev"). **17 FEAT + 3 BR cite ERR-INV-* như authoritative** → contradiction. Cả `ERR-CMN-004` message drift (§C3.1 dưới).
- `Product/_common/VALIDATION-RULES.md` — ❌ **MISSING** (folder `Product/_common/` không tồn tại).
- `Product/_common/MESSAGES.md` — ❌ **MISSING**.
- `Product/_common/ENUMS.md` — ❌ **MISSING**.
- `Product/_common/FEATURE-FLAGS.md` — ❌ **MISSING** (flag `Inventory:InventoryV2` chưa được register SSOT).

### Figma registry status

- `Product/ux/figma/figma-links.yaml` chỉ có tới **wave "04"** — **wave "05" chưa tồn tại** trong registry.
- 17 FEAT-V2 cite link Figma inline trong §3 UI/UX Reference (node ID cụ thể) nhưng registry lag → `/prefetch-figma web 05` / `/prefetch-figma mobile 05` sẽ fail (no `waves["05"]` key).

---

## §2. Findings — grouped by criterion

### C1. Consistency xuyên tài liệu — ✅ PASS (major)

- ✅ Traceability upstream: mọi FEAT có `parent_epic` resolve; 3 EP đều link 7/7 hoặc 3/3 FEAT children đúng (`EP-INVENTORY-RECEIPT-V2 §4` = 7 rows = 7 file exist; tương tự ID + STK).
- ✅ Persona reference: chỉ dùng "chủ garage" + "kế toán" — tuân Critical Rule #6 dual-persona.
- ✅ BR reference: BR-IRV2-001..032, BR-IDV2-001..031, BR-STKV2-001..015 (+005a) resolve trong 3 BR file V2. Cross-boundary: `BR-PRC-001/005/017` resolve tại `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md §2.2`. `BR-CAT-PROD-011/013` + `BR-OB-004b/012/016` + `BR-AP-*` — cite trong FEAT `Depends on` và các AC, đối chiếu file BR tồn tại.
- ✅ UX-Flow reference: 3 UX-Flow file tồn tại, `Referenced by` list đầy đủ 7/7 FEAT IR + 7/7 FEAT ID + 3/3 FEAT STK.
- ✅ Terminology consistency: "phiếu nhập kho / phiếu xuất kho / mã sản phẩm nội bộ / ĐVT chính / ĐVT quy đổi / SL quy đổi / sổ tồn / BQGQ / Ghi sổ kho / Nháp / kỳ đã đóng" đồng bộ xuyên FEAT + BR + EP + UX-Flow.
- ✅ Count consistency: EP §Features Included khớp filesystem: IR 7/7 · ID 7/7 · STK 3/3.
- ✅ State transition consistency: **Nháp → Ghi sổ kho → Bỏ ghi sổ kho** vòng đời khớp giữa `BR-IRV2-002 / BR-IDV2-002` ↔ FEAT-*-DETAIL AC-5/6 ↔ UX-FLOW §Sơ đồ + §4. "Bỏ trạng thái Đã hủy" — chỉ Xóa — nhất quán.
- ✅ Permission consistency: `BR-IRV2-023 / BR-IDV2-023 / BR-STKV2-015` "chủ garage + kế toán quyền ngang nhau" nhất quán với FEAT §Nhóm-Phân-Quyền + UX-Flow §Người thực hiện.

**Không có finding P0/P1 tại C1.**

---

### C2. AC & BR coverage completeness

#### C2.1 [P0] Import/export row cap explicit — thiếu ở 5 FEAT

- **Vấn đề**: 5 FEAT xuất Excel (danh sách phiếu Nhập, danh sách phiếu Xuất, báo cáo Tồn đến ngày, báo cáo NXT, Thẻ kho) hiện KHÔNG quy định **số dòng tối đa mỗi lần xuất**. Với garage vận hành lâu năm (500k+ phiếu, 200k+ mã hàng), user bấm "Xuất excel" một lần → hệ thống phải build toàn bộ file trong RAM → treo/timeout, download thất bại, tệ hơn là app crash làm gián đoạn cả tenant khác. Đối chiếu tài liệu Catalog đã đặt cap 500 dòng/lần import + 1.000 dòng/lần export và đã có mã lỗi tương ứng — 5 FEAT của Inventory V2 phải làm tương tự. BA cần chốt con số cụ thể (đề xuất: ≤ 5.000 dòng/lần với danh sách phiếu, ≤ 50.000 dòng/lần với báo cáo tồn NXT — hoặc số khác theo nghiệp vụ) + copy thông báo khi vượt cap.
- **Location**: `Product/features/FEAT-IR-EXPORT.md` (toàn file) · `Product/features/FEAT-ID-EXPORT.md` (toàn file) · `Product/features/FEAT-STK-LIST-V2.md` AC-8 · `Product/features/FEAT-IP-VIEW-V2.md` AC-7 · `Product/features/FEAT-STK-DETAIL-V2.md` AC-7.
- **Evidence**: `grep -E 'dòng tối đa|row cap|500 dòng|1\.000|giới hạn.*dòng' Product/features/FEAT-{IR,ID}-EXPORT.md Product/features/FEAT-{STK,IP}-*V2.md` → **0 hit**. Đối chiếu: `FEAT-CAT-PROD-IMPORT` đã đặt cap 500 dòng/lần (BR-CAT-PROD-020, `ERR-INV-041`); `FEAT-CAT-PROD-EXPORT` cap 1.000 dòng (`ERR-INV-045`). Nhưng 5 FEAT trong scope không nêu.
- **Impact**: Tenant có 500k+ phiếu Ghi sổ kho / báo cáo tồn 200k mã → export 1 lần → BE build .xlsx trong memory → **OOM production**, timeout HTTP 504, agent DEV không biết dùng streaming pagination hay giới hạn cứng.
- **Fix**: Bổ sung AC + BR cho từng FEAT nêu row cap explicit (ví dụ ≤ 5.000 dòng/lần cho phiếu list; ≤ 50.000 cho báo cáo tồn NXT) + cap error code (analog `ERR-INV-045` cho export). Chạy `/gen-business-rules` cascade `BR-IRV2-020 / BR-IDV2-020 / BR-STKV2-005`.
- **Owner**: Business Analyst + Architect.

#### C2.2 [P0] Sample file mandatory cho excel export — thiếu 5 FEAT

- **Vấn đề**: 5 FEAT xuất Excel chỉ **liệt kê tên cột** trong AC nhưng không có **file `.xlsx` mẫu** đính kèm để DEV biết layout thực tế: thứ tự cột, format ngày (dd/mm/yyyy hay yyyy-mm-dd), format tiền tệ (có dấu phẩy nghìn không, đơn vị VND cuối cột hay header), cách gộp header cho nhóm "Danh sách phụ tùng nhập/xuất kho" (merge 2 dòng hay flat), encoding UTF-8 hay Windows-1258. Ngược lại các FEAT **In phiếu** (PRINT) đã có mẫu chuẩn **01-VT / 02-VT theo Thông tư 99/2025/TT-BTC** của Bộ Tài chính — cực kỳ rõ ràng. Xuất Excel cần đối xứng: 1 file mẫu / báo cáo, có thể chỉ là template `.xlsx` demo với 2-3 dòng dữ liệu giả để DEV, tester, và kế toán đối tác (thuế, kiểm toán) cùng nhìn 1 chuẩn.
- **Location**: `FEAT-IR-EXPORT` §2 AC-2 · `FEAT-ID-EXPORT` §2 AC-2 · `FEAT-STK-LIST-V2` AC-8 · `FEAT-IP-VIEW-V2` AC-7 · `FEAT-STK-DETAIL-V2` AC-7.
- **Evidence**: FEAT-IR-EXPORT AC-2 chỉ liệt kê cột "Mã phiếu nhập · Ngày nhập · Nguồn nhập · Đối tượng · Đơn hàng tương ứng · Diễn giải · Trạng thái · Ngày tạo · Người tạo" + nhóm "Danh sách phụ tùng nhập kho" — **KHÔNG attach file mẫu output** (path URL / column-header row / data-type từng cột / rule format). `grep -E 'sample_file|file mẫu|template.*xlsx'` → **0 hit** trong 5 FEAT. Đối lập: PRINT có `BR-IRV2-019 / BR-IDV2-019` chỉ đích danh **Mẫu 01-VT / 02-VT (TT 99/2025/TT-BTC)** kèm layout đầy đủ ở AC-2.
- **Impact**: Agent DEV code layout tự bịa (thứ tự cột, format ngày dd/mm/yyyy vs ISO, format tiền tệ có/không dấu phẩy nghìn, encoding UTF-8 vs 1258, merge header 2 dòng cho nhóm "Danh sách phụ tùng" hay flat) → khách hàng đối tác đọc file sai schema.
- **Fix**: Attach file `.xlsx` mẫu vào `Product/ux/samples/{scope}/` + link trong FEAT AC-2. Hoặc bổ sung §2A "Layout .xlsx" với ASCII grid + type per cột + note format.
- **Owner**: Business Analyst + UX.

#### C2.3 [P1] Filter data description mỏng — 3 STK FEAT

- **Vấn đề**: 3 báo cáo tồn kho (Tồn đến ngày, NXT, Thẻ kho) chỉ nêu **tên trường** filter (Kho, Ngày, Từ/Đến) mà **không mô tả nguồn dữ liệu**: dropdown Kho lấy từ đâu (danh mục kho của garage? có gồm kho đang "Ngừng hoạt động" không?), sort thế nào (alphabet? theo mã?); Ngày mặc định là gì (hôm nay? trống → user tự chọn?), múi giờ áp dụng (Asia/Ho_Chi_Minh vì user ở VN?); khoảng ngày Từ-Đến có giới hạn tối đa không (VD không cho lọc 5 năm gây query nặng). Trong khi đó 2 danh sách phiếu Nhập/Xuất mô tả cực kỳ chi tiết filter Đối tượng + Người phụ trách (DISTINCT từ bảng phiếu, dedup theo mã, sort alphabet, cascade với Loại phiếu) — đó là chuẩn kỳ vọng. Không mô tả filter kho sẽ khiến dropdown có thể show kho đã đóng cửa → user chọn nhầm → filter trả về 0 dòng gây bối rối.
- **Location**: `FEAT-STK-LIST-V2` AC-4 · `FEAT-IP-VIEW-V2` AC-5 · `FEAT-STK-DETAIL-V2` AC-1.
- **Evidence**: `FEAT-STK-LIST-V2` AC-4: "**Kho** chọn tất cả / nhiều kho; **Ngày** là 1 mốc 'đến ngày'" — nguồn dropdown Kho không nêu (danh mục kho garage? có gồm kho INACTIVE / đã đóng không? sort thế nào?); default Ngày không nêu (hôm nay? trống?); timezone không nêu (Asia/Ho_Chi_Minh?). Tương tự AC-5 IP-VIEW (Từ ngày + Đến ngày — default range?), AC-1 STK-DETAIL. Đối chiếu tốt: `FEAT-IR-LIST-V2 AC-6` filter Đối tượng + Người phụ trách mô tả đầy đủ nguồn DISTINCT + dedup + sort + cascade — đây là chuẩn kỳ vọng.
- **Impact**: Agent DEV code dropdown Kho có thể include kho ngừng hoạt động (leak stale option); default date logic tự bịa (7 ngày gần nhất vs từ đầu năm) → user confusion.
- **Fix**: Cascade `BR-STKV2-008` mô tả nguồn từng filter (Kho: danh mục kho garage `status=ACTIVE`, sort alphabet; Ngày: default hôm nay, timezone Asia/Ho_Chi_Minh, max range 1 năm). Chạy `/gen-business-rules`.
- **Owner**: Business Analyst.

#### C2.4 [P1] Navigation AC ambiguity — điểm ra sau Lưu form Tạo/Sửa

- **Vấn đề**: Các AC "Lưu phiếu" ở 4 form Tạo/Sửa phiếu Nhập/Xuất chỉ mô tả **hành vi lưu** ("hệ thống lưu phiếu Nháp, tồn tự sinh Số phiếu" hay "cập nhật tồn, cập nhật Người sửa") mà **không nêu điểm ra** — sau khi Lưu thành công, người dùng thấy gì tiếp theo? Có 3 hướng khả dĩ và mỗi hướng UX khác nhau: (a) ở lại form giữ dữ liệu vừa nhập (thuận cho tạo nhiều phiếu liền), (b) đóng form, quay về danh sách + refresh + toast "Lưu thành công" (thuận cho check nhanh phiếu vừa lưu trong list), (c) chuyển sang màn chi tiết của phiếu vừa tạo/sửa để xem lại + có thể bấm Ghi sổ luôn. DEV mỗi màn có thể chọn khác nhau → UX không nhất quán giữa 4 form và giữa Nhập/Xuất/các phân hệ khác. BA cần chốt 1 pattern chung.
- **Location**: `FEAT-IR-CREATE-V2` AC-11 · `FEAT-ID-CREATE-V2` AC-10 · `FEAT-IR-EDIT-V2` AC-5 · `FEAT-ID-EDIT-V2` AC-5.
- **Evidence**: AC-11 `FEAT-IR-CREATE-V2` chỉ nêu "hệ thống lưu phiếu trạng thái 'Nháp' (chưa tác động tồn), Số phiếu tự sinh" — **không** nêu điểm ra sau Lưu thành công (điều hướng về danh sách? mở màn chi tiết phiếu vừa tạo? toast success gì? focus quay về đâu?). Tương tự `FEAT-IR-EDIT-V2 AC-5`: "lưu, cập nhật tồn... cập nhật Người sửa / Ngày sửa" — không nêu route sau save. UX-FLOW §Sơ đồ chỉ vẽ `Lưu / Đóng` chung chung — chưa disambiguate.
- **Impact**: Agent web DEV tự chọn: (a) stay-in-page giữ form, (b) navigate về danh sách + refresh, (c) navigate về chi tiết. 3 lựa chọn khác nhau → 3 UX inconsistent giữa CREATE + EDIT + các FEAT khác trong wave.
- **Fix**: Bổ sung 1 dòng "Thì" cho mỗi AC-Lưu: "chuyển về màn Chi tiết phiếu vừa tạo/sửa + toast 'Lưu thành công' (`ERR-CMN-XXX` INFO)".
- **Owner**: Business Analyst + UX.

#### C2.5 [P1] Concurrency / optimistic lock — không có AC

- **Vấn đề**: Kịch bản thực tế tại garage: 2 kế toán ngồi 2 máy tính, cùng mở phiếu nhập PN-00123 để sửa. Kế toán A đổi SL nhập từ 100 → 90 lon dầu và bấm Lưu; kế toán B (chưa refresh nên vẫn thấy SL cũ = 100) đổi Đối tượng Nhà cung cấp và bấm Lưu sau. Hiện tại tài liệu **không mô tả hệ thống xử lý ra sao** — nếu để "last-write-wins" như mặc định thì thay đổi SL của A sẽ **biến mất im lặng** khi B ghi đè, và B không hề biết mình vừa "xoá" chỉnh sửa của A. Rủi ro: sai lệch số lượng nhập kho → tồn kho lệch → giá vốn BQGQ sai. Trong Error Registry đã có sẵn mã **`ERR-CMN-008`** ("Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại") nhưng chưa được cite ở BR/AC nào của Inventory V2, DEV không biết dùng.
- **Location**: `BR-IRV2-*` toàn file · `BR-IDV2-*` toàn file · FEAT-IR/ID-EDIT-V2 toàn file.
- **Evidence**: Registry `ERR-CMN-008` cho "Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại" (DIALOG, 409, optimistic lock) — **KHÔNG được cite** trong BR-IRV2-* / BR-IDV2-* / bất kỳ AC nào của FEAT EDIT. FEAT-IR-EDIT-V2 AC-4 nêu "Tính lại tồn + re-check tồn âm" nhưng không nêu behavior khi 2 user cùng edit cùng phiếu.
- **Impact**: 2 accountant đồng thời edit phiếu Ghi sổ kho → last-write-wins mất silent thay đổi của user A khi user B save sau. Không có DIALOG cảnh báo reload.
- **Fix**: Thêm 1 AC vào `FEAT-IR-EDIT-V2` + `FEAT-ID-EDIT-V2`: "Khi: 2 user cùng edit, user B save sau. Thì: hệ thống chặn với `ERR-CMN-008` DIALOG 'Dữ liệu đã được cập nhật... — Tải lại'." Cascade BR-IRV2-* / BR-IDV2-* thêm rule concurrency.
- **Owner**: Business Analyst + Architect.

Các bullet còn lại (AC Tại/Khi/Thì · Happy+alt+exception · Boundary values · Empty/null · Enum coverage · State transition matrix · Immutability · Cascade + delete guard · Cross-boundary side-effect · Tenant isolation) — ✅ PASS. Đặc biệt điểm sáng:
- State machine "Bỏ ghi sổ" có re-check tồn âm cascade (BR-IRV2-004 v21 fix M6 lỗ hổng) ✅.
- Point-in-time tồn âm check phủ 5 tình huống (create/edit/delete/ghi sổ/bỏ ghi sổ) qua BR-STKV2-005a shared engine ✅.
- Cross-boundary cite đúng: FEAT-IR/ID-CREATE-V2 §2A → gf-purchase/gf-sales inheritance chi tiết (SL/đơn giá/Đối tượng/Kho).
- Enum backend `RECEIPT_*` + `DELIVERY_*` đã lock (BR-IRV2-009 v28, BR-IDV2-010 v23).

---

### C3. Error message coverage

#### C3.1 [P0] ERR-CMN-004 registry drift — "10MB" vs 30MB Inventory V2

- **Vấn đề**: BA đã chốt (Change Log 2026-06-29) rằng **toàn Inventory V2 cho phép upload đính kèm ≤ 30 MB** (thay vì 10 MB mặc định), lý do: kế toán cần upload PDF chứng từ + ảnh chất lượng cao (biên nhận, phiếu giao nhận NCC). Các FEAT (Nhập, Xuất) đều đã ghi "≤ 30 MB (`ERR-CMN-004`)" và Change Log ghi rõ "Đồng bộ ERROR-CODE-REGISTRY (CR đổi message ERR-CMN-004)". **Nhưng registry chưa được cập nhật** — nội dung thông báo lỗi vẫn là **"File quá lớn (tối đa 10MB)"**. Kịch bản đời thường: kế toán upload PDF 20 MB → nếu FE dùng registry render lỗi → hiển thị "10MB" (sai thông tin, kế toán bối rối); nếu BE cũng follow registry chặn ở 10MB → trái quyết định BA. Cần Business Authority + Architect chốt CR để đồng bộ registry ngay.
- **Location**: `Product/error-code/ERROR-CODE-REGISTRY.md:68` (registry) vs `FEAT-IR-CREATE-V2:146` (AC-14) + `FEAT-IR-EDIT-V2:78` (AC-5b) + `FEAT-ID-CREATE-V2:132` (AC-13) + `FEAT-ID-EDIT-V2:72` (AC-5b) + `BR-IRV2-026` + `BR-IDV2-026` — cross-doc.
- **Evidence**:
  - Registry line 68: `` `ERR-CMN-004` | 🔴 ERROR | `INLINE_FIELD` | File | **File quá lớn (tối đa 10MB)** | ... 413 `` — vẫn ghi **10MB**.
  - FEAT-IR-CREATE-V2 v22 Change Log (line 258): "BA chốt all-30MB toàn Inventory V2 đồng nhất → **`ERR-CMN-004` common message sẽ đổi '10MB' → '30MB'**, không cần error code domain-specific... **Đồng bộ ... ERROR-CODE-REGISTRY (CR đổi message ERR-CMN-004)**."
  - Nhưng ERROR-CODE-REGISTRY Change Log không có dòng đổi message ERR-CMN-004. FEAT cite `ERR-CMN-004` với "≤ 30 MB", registry vẫn nói 10MB.
- **Impact**: FE dựa registry render `"File quá lớn (tối đa 10MB)"` khi user upload 15 MB — nhưng BE Inventory V2 **cho phép** file 15 MB (chưa vượt 30MB) → 2 khả năng đều tệ: (a) BE reject at 10MB → FE hiển thị "10MB" đúng, contradiction với BA quyết 30MB; (b) BE accept 15MB nhưng FE hiển thị message sai → user tưởng lỗi. Agent DEV không biết đọc source nào (registry chính thức vs FEAT chốt cuối).
- **Fix**: (Owner Business Authority + Architect co-owner registry) → CR update registry ERR-CMN-004 message "10MB" → "30MB" + bump registry version + Change Log. Kiểm tra downstream cross-domain: Insurance (đã de-link `ERR-INS-006`), Catalog (BR-CAT-PROD-015 v16 = 30MB) — thống nhất 30MB overload common. Nếu Insurance/Insurance-adjacent cần 10MB thì phải tạo `ERR-INV-048` domain-specific cho Inventory.
- **Owner**: Business Authority + Architect (registry dual-owner).

#### C3.2 [P0] ERR-INV-* status "DRAFT/PROPOSED" chưa cutover — 47 mã

- **Vấn đề**: Nhóm mã lỗi **ERR-INV-*** (47 mã dành riêng cho Inventory V2 — VD "Không cho phép tồn âm" `ERR-INV-036`, "Kỳ kế toán đã đóng" `ERR-INV-024`, "Phải có mã sản phẩm nội bộ ở mọi dòng" `ERR-INV-011`...) đang được registry đánh dấu **"[DRAFT/PROPOSED — chưa cutover]"** kèm ghi chú *"giữ ở trạng thái đề xuất tới khi Architect chốt khi spawn dev"*. Đồng thời tất cả 17 FEAT + 3 BR-V2 đã dùng các mã này như đã chốt (VD BR-IRV2-008 → `ERR-INV-036`, BR-IRV2-030 → `ERR-INV-038`, BR-IRV2-032 → `ERR-INV-040`). Đây là **mâu thuẫn status**: BA/BR treat như đã ratified, còn Architect note treat như còn có thể đổi. Rủi ro cụ thể: nếu Architect quyết định split mã (VD chia `ERR-INV-030` thành 2 mã "tồn âm" vs "lệch hạch toán" như đã hint trong Registry) khi kick-off DEV, thì toàn bộ FE i18n + BE constant phải sửa lại → mất thời gian, dễ sót. Cần cutover trước khi bấm nút DEV.
- **Location**: `Product/error-code/ERROR-CODE-REGISTRY.md:93` "[DRAFT/PROPOSED — Inventory V2, chưa cutover]... 40 mã lỗi domain kho V2 — đồng bộ từ mã bare... Chưa cutover sang các epic kho V2 — giữ ở trạng thái đề xuất tới khi Architect chốt khi spawn dev."
- **Evidence**: 17 FEAT + 3 BR-V2 cite ERR-INV-011/024/036/037/038/040/047 như authoritative (BR-IRV2-008 → `ERR-INV-036`; BR-IRV2-028 → `ERR-INV-011`; BR-IRV2-030 → `ERR-INV-038`; BR-IRV2-032 → `ERR-INV-040`; v.v.). Nhưng registry note: "giữ ở trạng thái đề xuất tới khi Architect chốt khi spawn dev".
- **Impact**: Contradiction status: BA/BR treat as ratified (implement liền), Architect treat as proposal (có thể đổi khi spawn dev). Agent DEV không biết code cứng theo `ERR-INV-036` hay chờ Architect cutover. Nếu Architect đổi mã (VD sau audit hạ `ERR-INV-030` → `ERR-INV-030A` split "tồn âm" ≠ "lệch hạch toán"), toàn bộ FE i18n phải rewrite.
- **Fix**: Trước khi kick-off W05 DEV → Business Authority + Architect chốt CR "cutover ERR-INV-*" đổi note "DRAFT/PROPOSED" → "ACTIVE" trong ERROR-CODE-REGISTRY §4, bump version. Nếu còn số mã cần lock/split → chốt trong CR đó luôn.
- **Owner**: Business Authority + Architect.

#### C3.3 [P1] Empty-state INFO code missing cho list/report rỗng

- **Vấn đề**: Các danh sách và báo cáo có mô tả case "khi không có dữ liệu" trong Edge Cases (VD FEAT-IR-LIST-V2 EC-1: *"Garage chưa có phiếu nào — hiển thị trạng thái rỗng"*) **nhưng không cite mã thông báo cụ thể**. Nhóm ERR-INV-* trong registry cũng chưa có mã INFO/EMPTY_STATE nào. Kết quả: mỗi màn (Nhập / Xuất / Tồn / Thẻ kho / NXT) sẽ tự đặt chuỗi "Chưa có dữ liệu" khác nhau về tone và wording, không nhất quán, và thường thiếu **hint hướng dẫn tiếp theo** (VD "Chưa có phiếu nào — bấm 'Tạo mới PN' ở góc trên phải để bắt đầu"). UX của các trang rỗng là điểm chạm quan trọng khi garage mới onboard nhưng đang không được chuẩn hoá.
- **Location**: `FEAT-IR-LIST-V2` EC-1 · `FEAT-ID-LIST-V2` EC-1 · `FEAT-STK-LIST-V2` (không có EC empty) · `FEAT-IP-VIEW-V2` (không có EC empty) · `FEAT-STK-DETAIL-V2` EC-3 · `FEAT-IR-EXPORT` EC-1 · `FEAT-ID-EXPORT` EC-1.
- **Evidence**: `FEAT-IR-LIST-V2 EC-1`: "Garage chưa có phiếu nào — hiển thị trạng thái rỗng" — không cite error code (analog `ERR-INS-010` INFO `EMPTY_STATE` cho insurance dossier rỗng). Registry §4 (ERR-INV-*) không có mã INFO/EMPTY_STATE nào.
- **Impact**: FE tự bịa copy "Chưa có dữ liệu" khác nhau cho mỗi list (Nhập / Xuất / Tồn / Thẻ kho / NXT) → tone inconsistent + agent code hardcode chuỗi lệch giữa các màn.
- **Fix**: Thêm 1 mã common `ERR-CMN-EMPTY-LIST` (INFO / EMPTY_STATE) với message "Chưa có dữ liệu, tạo mới ở góc phải" (hoặc tương tự) trong registry §2. Cascade cite trong EC-1 các FEAT LIST/report.
- **Owner**: Business Authority + Architect.

Bullet còn lại C3 — ✅ PASS: (1:1 rule↔error code, severity+display, system error, warning-but-allow-save, confirm dialog):
- `BR-IDV2-009 → ERR-INV-039 WARNING` "Lệch SO — vẫn cho ghi sổ" ✅ đúng WARNING không phải ERROR.
- Confirm dialog `FEAT-IR-DELETE AC-1` + `FEAT-ID-DELETE AC-1` explicit copy với số phiếu ✅.
- Popup ghi sổ / bỏ ghi sổ `FEAT-ID-DETAIL-V2 AC-5/6` có copy explicit ✅.

---

### C4. Common registry reuse

#### C4.1 [P0] Product/_common/ folder không tồn tại

- **Vấn đề**: Repo Product hiện **chưa có thư mục `Product/_common/`** chứa 4 file dùng chung xuyên phân hệ. Hệ quả: các quy tắc/copy tái sử dụng đang bị **viết lặp lại inline** khắp tài liệu — "SL > 0 (cho số lẻ)", "Đơn giá ≥ 0", "tỷ lệ quy đổi > 0 ≤ 6 chữ số thập phân", enum status "Đang hoạt động"/"Ngừng làm việc"/"Đang làm việc"/"Nghỉ việc" (nhân sự), toast copy "Lưu thành công"/"Bạn có chắc chắn muốn xoá phiếu ... không?" — cùng chuỗi xuất hiện ở 5-10 chỗ giữa BR-IRV2 / BR-IDV2 / BR-CAT-PROD / BR-OB. Khi cần chỉnh 1 rule (VD BA sau này muốn tăng số chữ số thập phân từ 6 → 8) thì phải grep + edit 10 nơi, chắc chắn sẽ sót → dữ liệu lệch giữa các màn (màn Nhập bắt 6 số, màn Catalog cho phép 8 số → confusing). Ngoài ra flag `Inventory:InventoryV2` cũng chưa được đăng ký ở 1 nơi SSOT → BFF/BE/config-service không có chỗ tra thống nhất.
- **Location**: `Product/_common/` (folder không tồn tại).
- **Evidence**: `ls Product/_common/` → `No such file or directory`.
- **Impact**: Không có SSOT cho:
  - `VALIDATION-RULES.md` — pattern chung "SL > 0 (cho số lẻ)", "Đơn giá ≥ 0", "tỷ lệ quy đổi > 0 ≤ 6 chữ số thập phân", "code regex", "tenant_id required" — repeat inline trong `BR-IRV2-025` + `BR-IDV2-025` + `BR-CAT-PROD-011` v.v. Duplicate = P2, nhưng khi common không có = P0 gap "must-create-common".
  - `MESSAGES.md` — toast copy chung "Lưu thành công", "Bạn có chắc chắn muốn xóa phiếu ... không?", "Đã hủy".
  - `ENUMS.md` — enum status ACTIVE/INACTIVE, "Đang hoạt động" / "Ngừng hoạt động" / "Đang làm việc" / "Nghỉ việc" (nhân sự) — dùng khắp BR-IRV2-025 + BR-IDV2-025 + BR-OB-* + BR-HRMS-*.
  - `FEATURE-FLAGS.md` — flag `Inventory:InventoryV2` chưa được register SSOT (finding C8.1 kèm).
- **Fix**: Business Authority tạo CR "Bootstrap Product/_common/" — 4 file tối thiểu. Backfill từ pattern hiện tại (grep repeat ≥ 3 lần). Sau khi có common → refactor cite trong BR-V2 (P2 cleanup, không block).
- **Owner**: Product Manager + Business Analyst.

#### C4.2 [P1] Duplicate validation rule inline — ≥ 3 FEAT/BR viết cùng "SL > 0 · số lẻ · Đơn giá ≥ 0"

- **Vấn đề**: Cụ thể hoá C4.1 — ràng buộc **"SL nhập > 0 (cho số lẻ)"** và **"Đơn giá ≥ 0 (cho số lẻ)"** xuất hiện lặp lại ở ≥ 5 chỗ (FEAT-IR-CREATE-V2 §2A, FEAT-ID-CREATE-V2 §2A, BR-IRV2-025, BR-IDV2-025, BR-OB-008/009). Nếu sau này BA muốn nới (VD chấp nhận SL = 0 cho phiếu điều chỉnh nội bộ, hoặc chấp nhận Đơn giá âm cho phiếu chiết khấu), tất cả 5+ nơi phải sửa đồng bộ. Sau khi bootstrap `_common/VALIDATION-RULES.md` (C4.1) → refactor cite về ID chung (VD `theo COMMON-VLD-QTY-POSITIVE`).
- **Location**: `FEAT-IR-CREATE-V2 §2A` (dòng chi tiết validate) · `FEAT-ID-CREATE-V2 §2A` · `BR-IRV2-025` · `BR-IDV2-025` · `BR-OB-008/009` (registry cite).
- **Evidence**: 5+ occurrence pattern `**SL nhập > 0** (cho số lẻ), **Đơn giá nhập ≥ 0** (cho số lẻ)` — repeat inline. Không cite common validation ID.
- **Impact**: Nếu thay đổi rule (VD chấp nhận SL = 0 cho phiếu điều chỉnh) — phải grep + edit 5 nơi → dễ miss.
- **Fix**: Sau khi có `Product/_common/VALIDATION-RULES.md` (từ C4.1) → refactor các cite thành `theo COMMON-VLD-QTY-POSITIVE` + `theo COMMON-VLD-PRICE-NON-NEGATIVE`.
- **Owner**: Business Analyst (post-C4.1).

Bullet còn lại C4 — ✅ PASS: Error code source (mọi mã cite tồn tại trong registry §4), enum reuse (RECEIPT_* / DELIVERY_* declared lock 1 lần trong BR-IRV2-009 / BR-IDV2-010, cite lại không duplicate).

---

### C5. Traceability matrix AC ↔ BR ↔ Error-code ↔ UX-Flow

Coverage estimate:
- **AC → BR**: ~98% (mỗi AC "Thì" cite BR-IRV2-*/BR-IDV2-*/BR-STKV2-* justify — đặc biệt `FEAT-IR-CREATE-V2 §5` list 15 BR liên quan; `FEAT-ID-CREATE-V2 §5` list 12 BR).
- **BR → Error-code**: ~95% (mọi BR "khi vi phạm" cite ERR-INV-036/037/038/040/024/011/047 — bảng ánh xạ 1-1 clear).
- **AC → UX-Flow**: ~90% (FEAT §3 UX Reference trỏ UX-FLOW §Sơ đồ/§Sub-section — đủ cho DEV navigate).
- **UX-Flow → State transition**: ✅ UX-FLOW §Sơ đồ + §4 khớp state machine trong BR + AC.

**Coverage vượt ngưỡng 95% ✅** — không có finding aggregate.

**Không có finding P0/P1 tại C5.**

---

### C6. Persona + Permission compliance — ✅ PASS

- ✅ Dual persona rule: chỉ "chủ garage" + "kế toán" (Critical Rule #6 respect).
- ✅ Permission section: mọi FEAT có §Nhóm-Phân-Quyền/AC-Phân-Quyền explicit "chủ garage + kế toán quyền ngang nhau".
- ✅ Permission ↔ BR sync: `BR-IRV2-023 / BR-IDV2-023 / BR-STKV2-015` khớp FEAT.
- ✅ UX-Flow "Ai thao tác": UX-FLOW §Người thực hiện = "Chủ garage và Kế toán — quyền ngang nhau".
- ⚠️ [P2] Persona journey completeness: 2 personas quyền ngang nhau nên không tách journey. Chấp nhận với dual persona pattern. — soft, không action.

**Không có finding P0/P1 tại C6.**

---

### C7. UX & business tightness — improvement suggestions (P2)

Đề xuất cải tiến (không block):

- [P2] **Retry cho system error**: chỉ ERR-CMN-006/007 có Retry button (registry). Print/Export failures không có retry AC — user phải F5 → mất filter. Đề xuất thêm mã `ERR-INV-PRINT-FAIL` / `ERR-INV-EXPORT-FAIL` (TOAST + Retry) trong registry §4.
- [P2] **Confirm dialog thiếu context số phiếu Bỏ ghi sổ kho**: `FEAT-IR-DETAIL-V2 AC-6` / `FEAT-ID-DETAIL-V2 AC-6` popup xác nhận Bỏ ghi sổ chỉ hỏi Yes/No — không nêu SL tồn sẽ giảm bao nhiêu ở kho nào. Copy cải tiến: "Bỏ ghi sổ phiếu này sẽ trừ 240 lon Dầu-DOT4 khỏi kho A. Tiếp tục?".
- [P2] **Concurrent user warning banner**: cross-ref C2.5 — thêm banner "User B đang xem phiếu này" khi 2 tab mở cùng phiếu (light-weight, không cần lock cứng).
- [P2] **Undo delete**: `FEAT-IR-DELETE` / `FEAT-ID-DELETE` hard delete. Đề xuất soft-delete với `deleted_at` + toast "Đã xoá — Hoàn tác (10s)". Fit ergonomic accountant use case (accidental delete).
- [P2] **Progressive disclosure header form**: `FEAT-IR-CREATE-V2` header có 12 trường ngang — mobile responsive khó. Đề xuất group section "Thông tin phân loại / Đối tác / Kho + ngày" (đã có Figma từng nhóm — cần note explicit trong FEAT).

---

### C8. Feature-flag configuration compliance

#### C8.1 [P0] FEAT §Feature-Flag section — **17/17 FEAT MISSING**

- **Vấn đề**: Chuẩn skill po-review (C8) yêu cầu **mỗi FEAT** phải khai báo đủ **4 mục feature-flag** — `flag_key` (mã flag), `default_state` (off/on đầu wave), `rollout_scope` (all_tenants / pilot / internal_only / role-based), `kill_switch_owner` (ai có quyền tắt khi khẩn cấp). Hiện 17 FEAT Inventory V2 đều **không có** khai báo này; chỉ EP §5.2 nhắc tên flag `Inventory:InventoryV2` ở phần Architecture Dependencies dưới dạng chú thích chung. Hệ quả: đến lúc rollout, các câu hỏi cơ bản mà DEV/SRE cần đều không có câu trả lời trong tài liệu — flag mặc định off hay on khi deploy? Thả rộng cho tất cả tenant hay pilot 5-10 tenant chọn trước? Khi có sự cố sản xuất (VD tồn kho tính sai) — ai được quyền tắt flag runtime để dừng bug lan rộng? Đây là 3 câu hỏi cần có sẵn trong tài liệu trước Architecture stage.
- **Location**: 17 FEAT trong scope — grep frontmatter `feature_flag` → **0 hit**. 17 FEAT không có `§Feature-Flag` section body với 4 mục.
- **Evidence**: `grep -c 'feature_flag' Product/features/FEAT-{IR,ID,STK,IP}-*V2.md Product/features/FEAT-{IR,ID}-{DELETE,PRINT,EXPORT}.md` → tất cả `:0`. Cite duy nhất là EP §5.2 Architecture Dependencies: "Feature Flag | `Inventory:InventoryV2` — toàn bộ API ... `@FeatureOn` class-level. Tenant chưa enable → API 403; Web/Mobile ẩn menu/route."
- **Impact**: FEAT không declare 4 mục required (per skill C8):
  1. `flag_key: Inventory:InventoryV2` (naming standard `{Domain}:{Provider|Capability}` PascalCase ✅ đúng — nhưng chưa declare per-FEAT).
  2. `default_state: off` (chưa nêu — DEV không biết bật hay tắt đầu wave).
  3. `rollout_scope: all_tenants / pilot_tenants:[...] / internal_only` (chưa nêu — DEV không biết thả rộng hay pilot).
  4. `kill_switch_owner: {Delivery Authority + on-call SRE}` (chưa nêu — không rõ ai được tắt runtime).
- **Fix**: Thêm frontmatter block `feature_flag:` vào 17 FEAT (batch qua CR duy nhất) hoặc §Feature-Flag section body. Chạy `/gen-ep-feat` cascade cho từng file.
- **Owner**: Business Authority + Delivery Authority (co-own flag ownership).

#### C8.2 [P0] Kill-switch behavior AC — **17/17 FEAT MISSING**

- **Vấn đề**: EP nói chung chung "Tenant chưa enable → API 403; Web/Mobile ẩn menu/route" nhưng **không có FEAT nào có AC cụ thể** mô tả UX chi tiết khi flag off. Kịch bản thực tế lúc bật kill-switch runtime (sự cố sản xuất phải tắt gấp): menu "Kho V2" ẩn hoàn toàn khỏi thanh navbar hay chỉ **disabled + tooltip** giải thích ("Feature đang tạm dừng — liên hệ SA")? Người dùng đã bookmark URL cũ `/inventory/receipts-v2/...` rồi truy cập → hệ thống redirect về V1 hay show dialog 403 lạnh lùng? Trên App Garage (mobile) — icon tab Kho biến mất hay vẫn thấy nhưng chạm vào không mở được? Đây là các câu hỏi UX quan trọng để tránh khách hàng bối rối khi bug tắt flag khẩn cấp — DEV không thể tự bịa mà phải theo BA/UX.
- **Location**: Tất cả 17 FEAT — không có AC nào mô tả behavior khi `Inventory:InventoryV2 = off`.
- **Evidence**: FEAT AC không mention "flag off / tenant chưa enable"; EP §5.2 chỉ nói "API 403; Web/Mobile ẩn menu/route" ở kiểu general nhưng không có AC nào codify UX cụ thể (menu "Kho V2" ẩn khỏi navbar? redirect legacy V1 URL về V1? banner "Feature chưa enable, liên hệ SA"?).
- **Impact**: Khi flag tắt runtime (kill-switch) — DEV không biết:
  - Web SPA có ẩn route `/inventory/receipts-v2/*` khỏi router hay không? Nếu router giữ, click link cũ → 403 dialog thay vì redirect nhẹ.
  - App Garage view-only mobile — icon menu "Nhập/Xuất/Báo cáo tồn" ẩn hay disabled + tooltip?
- **Fix**: Thêm 1 AC/EP mỗi feature "Khi: `Inventory:InventoryV2 = off` cho tenant. Thì: (web) menu 'Kho' item 'Phiếu nhập kho / xuất kho / Báo cáo tồn' ẩn khỏi sidebar + route `/inventory/*-v2` redirect về `/inventory-v1`; (mobile) tab Kho toolbar item ẩn."
- **Owner**: Business Authority + Architect (frontend routing).

#### C8.3 [P1] EP Feature-Flag roll-up rollout order — thiếu

- **Vấn đề**: 3 EP (Nhập kho, Xuất kho, Báo cáo tồn) **đều dùng chung flag `Inventory:InventoryV2`** nhưng không có kế hoạch rollout theo thứ tự. Câu hỏi mở cho Delivery Authority: bật đồng thời cả 3 (rủi ro cao nếu 1 phân hệ có bug ảnh hưởng cả 3) hay lần lượt IR trước → ID → STK để giảm rủi ro? Nếu dùng cùng 1 flag mà muốn tách thứ tự thì phải tách thành 3 sub-flag (`Inventory:ReceiptV2` / `Inventory:DeliveryV2` / `Inventory:StockReportV2`). BA + Delivery Authority cần thống nhất trước Architecture stage.
- **Location**: `EP-INVENTORY-RECEIPT-V2 §5.2` · `EP-INVENTORY-DELIVERY-V2 §5.2` · `EP-INVENTORY-STOCK-V2 §5.2` — chỉ nêu flag key, không nêu rollout order.
- **Evidence**: Không nêu "IR dark-launch tuần 1 → ID progressive 10% tuần 2 → STK GA tuần 3" hay tương tự.
- **Impact**: Không rõ dark-launch nào trước; 3 EP dùng cùng flag `Inventory:InventoryV2` — nghĩa là bật cùng lúc? Nếu dùng chung flag nhưng muốn IR trước STK → cần 3 flag riêng hoặc sub-flag.
- **Fix**: 3 EP thêm §Rollout Plan (dark-launch pilot 5 tenant test → progressive 20% → GA). Business Authority + Delivery Authority co-decide.
- **Owner**: Product Manager + Delivery Authority.

Bullet còn lại C8 — ⚠️ marginal:
- ✅ Flag naming standard `Inventory:InventoryV2` — PascalCase + `:` separator (đúng chuẩn `{Domain}:{Provider|Capability}` per skill C8 v3).
- ⚠️ Legacy feature exception: Inventory V2 là refactor cho legacy V1 — có thể argue `default_state: on` sau cutover — nhưng phải explicit.
- ⚠️ Flag lifecycle retire: Không có note khi flag retire sau V2 GA. Cost: zombie flag tech debt sau 2-3 wave.
- ⚠️ Common flag registry `Product/_common/FEATURE-FLAGS.md` không tồn tại (cross-ref C4.1).

---

### C9. Design ↔ Content alignment

Figma coverage: 17 FEAT — 13 web link explicit + 5 mobile link explicit (theo scope UX-FLOW `App Garage view-only` = LIST + DETAIL). 4 FEAT không cần Figma (PRINT + EXPORT theo Mẫu 01-VT/02-VT TT 99/2025/TT-BTC — layout mô tả AC full ✅).

#### C9.1 [P1] figma-links.yaml registry drift — wave "05" chưa tồn tại

- **Vấn đề**: File registry Figma (`Product/ux/figma/figma-links.yaml`) hiện chỉ có đến wave **"04"** (Tồn đầu kỳ + Kỳ kế toán). Wave **"05"** — chính là Inventory V2 (17 FEAT đang review) — **chưa có block `waves["05"]:`** trong file. Trong khi đó FEAT §3 UI/UX Reference đã ghi link Figma + node ID cho từng màn (VD `FEAT-IR-LIST-V2` web `14146-87559`, mobile `21629-24081`). Nếu không đồng bộ registry, lệnh `/prefetch-figma web 05` và `/prefetch-figma mobile 05` sẽ fail vì không tìm thấy wave 05 → không tạo được spec chi tiết ở `Product/ux/figma-{web,mobile}/wave05-*.md` — đây là input mà agent Architecture + Web/Mobile DEV dùng để cross-check binding token, component type, label verbatim (nếu thiếu bước prefetch thì có nguy cơ tái diễn W03 InternalProductFormPage incident — nhầm ImageUploadCard thành text field opaque URL).
- **Location**: `Product/ux/figma/figma-links.yaml` — kết thúc ở wave `"04"` (line 356 onwards W04 OB/AP), không có `waves["05"]:` key.
- **Evidence**: 17 FEAT-V2 cite Figma URL inline trong §3 (VD `FEAT-IR-LIST-V2` web `14146-87559`, mobile `21629-24081`; `FEAT-STK-LIST-V2` web `14507-89271`, mobile `21632-28892`) nhưng registry chưa được sync qua `scripts/sync-figma-links.sh 05`.
- **Impact**: `/prefetch-figma web 05` sẽ fail (no `waves["05"]` key). `/prefetch-figma-oracle mobile 05` fail. Downstream `/gen-execution-spec W05` + `agent-arch-author W05` không có prefetch spec `Product/ux/figma-{web,mobile}/wave05-*.md` để cross-check binding token / component type / label verbatim.
- **Fix**: Chạy `scripts/sync-figma-links.sh 05` sau khi cutover W05 hoặc thủ công thêm `waves["05"]:` block với 17 FEAT + node ID từ §3.
- **Owner**: Delivery Authority (sync-script owner) + Business Analyst review.

#### C9.2 [P1] Mobile Figma missing cho STK-DETAIL-V2 + IP-VIEW-V2 dù UX-Flow declare view-only

- **Vấn đề**: UX-Flow báo cáo tồn kho ghi rõ "App Garage view-only báo cáo tồn kho" (áp cho cả 3 màn STK-LIST, STK-DETAIL, IP-VIEW). Nhưng khi kiểm tra §3 UI/UX Reference của từng FEAT — chỉ FEAT-STK-LIST-V2 có Figma cả web + mobile ✅, còn **FEAT-STK-DETAIL-V2 (Thẻ kho popup) và FEAT-IP-VIEW-V2 (báo cáo NXT) chỉ có Figma web**, mobile ghi "chưa có". Mâu thuẫn: hoặc là design team **thiếu 2 màn mobile** (cần bổ sung), hoặc là **scope mobile hẹp lại** chỉ có mỗi STK-LIST — nếu vậy phải update UX-Flow §1 để bỏ chữ "báo cáo tồn kho" chung chung mà nêu rõ "chỉ báo cáo Tồn đến ngày, không gồm Thẻ kho + NXT trên mobile". BA + UX cần chốt 1 hướng trước Architecture stage — nếu không, mobile DEV có thể tự bịa layout Thẻ kho + NXT trên di động.
- **Location**: `UX-FLOW-INVENTORY-STOCK-V2 §1`: "**App Garage** (chỉ **XEM** — view-only: báo cáo tồn kho, không thao tác)" — declare mobile view-only cho tất cả 3 STK FEAT. Nhưng `FEAT-STK-DETAIL-V2 §3` chỉ có web link `14507-89272`, `FEAT-IP-VIEW-V2 §3` chỉ có web link `14507-89273` — **không có mobile row**. Change Log v5 (STK-DETAIL) + v5 (IP-VIEW) note "Mobile chưa có".
- **Evidence**: `FEAT-STK-LIST-V2 §3` có web + mobile (`21632-28892`) ✅ nhưng STK-DETAIL + IP-VIEW không có.
- **Impact**: Mobile DEV không có Figma để implement view-only NXT / Thẻ kho screen → tự bịa layout list.
- **Fix**: Design team bổ sung 2 màn mobile view-only (NXT + Thẻ kho popup). Nếu quyết định thu hẹp scope mobile (chỉ view LIST tồn kho, không NXT/Thẻ kho) → cập nhật UX-FLOW-INVENTORY-STOCK-V2 §1 để nhất quán.
- **Owner**: UX + Business Authority.

Bullet còn lại C9 — ⚠️ **không verifiable trong review này** (không có prefetch spec `Product/ux/figma-web/wave05-*.md` do C9.1). Post-C9.1 fix → cần chạy `agent-figma-spec-reviewer` để cross-check binding + label verbatim + container hierarchy + mode-conditional.

- ✅ Figma link mandatory cho FEAT có UI touchpoint: 13/13 web + 5/5 mobile (view-only scope).
- ✅ Post-baseline no-design case: PRINT/EXPORT có layout mô tả AC-2 mẫu chuẩn TT 99/2025/TT-BTC + column list ✅.
- ⏸ Screen list ↔ Figma node count / Field list ↔ Figma binding / Component type alignment / Label verbatim / Container hierarchy — defer tới sau /prefetch-figma W05.

---

### C10. NEED CONFIRMATION — unresolved markers

Total markers: **3** (T2/T3 = 3, T0/T1 = 0, T4/T5 = 0)

Top markers:

1. `Product/epics/EP-INVENTORY-RECEIPT-V2.md:25` — `| Target wave | **TBD** — Inventory V2 (post-baseline) |` — Owner: implicit Delivery Authority — ETA: không có (W05 signal in Change Log v6 nhưng chưa lock).
2. `Product/epics/EP-INVENTORY-DELIVERY-V2.md:25` — cùng pattern TBD Target wave. Owner: Delivery Authority — ETA: không có.
3. `Product/epics/EP-INVENTORY-STOCK-V2.md:25` — cùng pattern TBD Target wave. Owner: Delivery Authority — ETA: không có.

#### C10.1 [P1] TBD Target wave — no explicit ETA

- **Vấn đề**: Metadata của cả 3 EP đều ghi *"Target wave | **TBD** — Inventory V2 (post-baseline)"* — nghĩa là **chưa chốt cứng vào wave cụ thể**. Change Log v6 EP-INVENTORY-RECEIPT-V2 (2026-07-13) có tín hiệu "BA in-session review W05 chuẩn bị" nhưng `Plan/WAVE-SEQUENCE.md` chưa xác nhận và cũng chưa có `Execution/work-packages/PKG-W05-*.md`. Nếu để nguyên marker TBD, đến khi bấm `agent-arch-author W05` — agent sẽ hỏi ngược lại BA/PO wave nào → chậm nhịp giao việc. Delivery Authority cần chốt cứng (khả năng cao W05) và cascade sang Plan + Work Package.
- **Severity**: Marker chạm T2 (planning/EP metadata) → P1 per skill.
- **Impact**: Không rõ 3 EP kick-off wave nào — W05 signal ở Change Log nhưng chưa lock trong `Plan/WAVE-SEQUENCE.md`. Downstream `agent-arch-author W05` sẽ hỏi lại BA.
- **Fix**: Business Authority + Delivery Authority chốt wave (khả năng cao W05 per BA in-session review notes 2026-07-13), update 3 EP `Target wave: W05` + cascade `Plan/WAVE-SEQUENCE.md` + `Execution/work-packages/PKG-W05-*.md`.
- **Owner**: Delivery Authority.

Total markers = 3 (well below 20 threshold ✅). T0/T1 markers = 0 ✅.

Không có common registry marker `pending BA` (checked ERROR-CODE-REGISTRY.md — 0 hit). ✅

---

## §3. Findings — grouped by owner (action list)

### Owner: Product Manager

- **[P0][C4.1]** Tạo `Product/_common/` folder + 4 file skeleton (`VALIDATION-RULES.md`, `MESSAGES.md`, `ENUMS.md`, `FEATURE-FLAGS.md`) — CR mới. Backfill entry lookup `SL > 0`, `ĐVT tỷ lệ`, status enum `Đang hoạt động`, flag `Inventory:InventoryV2`.
- **[P1][C8.3]** 3 EP thêm §Rollout Plan (dark-launch → progressive → GA).

### Owner: Business Analyst

- **[P0][C2.1]** Thêm row cap explicit vào 5 FEAT EXPORT + STK/IP report (VD ≤ 5.000 dòng/lần list, ≤ 50.000 dòng/lần báo cáo tồn) + BR + error code. `/gen-business-rules` cascade `BR-IRV2-020 / BR-IDV2-020 / BR-STKV2-005`.
- **[P0][C2.2]** Attach file mẫu `.xlsx` cho 5 FEAT EXPORT/report vào `Product/ux/samples/` + link trong FEAT AC-2.
- **[P0][C8.1]** Thêm frontmatter `feature_flag:` (hoặc §Feature-Flag section body) cho 17 FEAT — 4 mục (`flag_key/default_state/rollout_scope/kill_switch_owner`).
- **[P0][C8.2]** Thêm AC kill-switch behavior cho 17 FEAT — mô tả UX khi flag `off`.
- **[P1][C2.3]** Cascade `BR-STKV2-008` mô tả nguồn filter Kho + default Ngày + timezone.
- **[P1][C2.4]** Bổ sung điểm-ra AC-Lưu cho 4 FEAT CREATE/EDIT (điều hướng về chi tiết vừa tạo + toast success).
- **[P1][C2.5]** Thêm AC optimistic lock (`ERR-CMN-008`) cho FEAT-IR/ID-EDIT-V2.
- **[P1][C3.3]** Đề xuất mã common `ERR-CMN-EMPTY-LIST` (INFO / EMPTY_STATE) + cite EC empty của các LIST/report.
- **[P1][C4.2]** Refactor duplicate validation rule inline sau khi có `Product/_common/VALIDATION-RULES.md`.
- **[P1][C10.1]** Chốt Target wave 3 EP (khả năng cao W05) + cascade `Plan/WAVE-SEQUENCE.md`.

### Owner: UX

- **[P1][C9.2]** Design 2 màn mobile view-only (Báo cáo NXT + Thẻ kho popup) cho App Garage HOẶC thu hẹp scope mobile → cập nhật UX-FLOW-INVENTORY-STOCK-V2 §1.
- **[P2][C7]** Refactor `FEAT-IR-CREATE-V2` header form section grouping + confirm dialog Bỏ ghi sổ hiển thị số lượng tồn ảnh hưởng.

### Owner: Architect / Delivery Authority (co-own registry)

- **[P0][C3.1]** CR update `ERR-CMN-004` message "10MB" → "30MB" trong ERROR-CODE-REGISTRY §2 + machine-readable §6 + Change Log. Verify cross-domain impact Insurance / Catalog.
- **[P0][C3.2]** CR cutover ERR-INV-* status "DRAFT/PROPOSED" → "ACTIVE" trong ERROR-CODE-REGISTRY §4 header. Nếu Architect còn muốn split mã (VD `ERR-INV-030` tồn âm) → chốt trong cùng CR.
- **[P1][C9.1]** Chạy `scripts/sync-figma-links.sh 05` sau khi cutover W05 để đưa 17 FEAT-V2 vào registry.

---

## §4. Verdict decision

| Verdict | Condition | Match? |
|---|---|---|
| APPROVED | P0 = 0 · P1 ≤ 2 · Traceability ≥ 95% · Không "must-create-common" · Feature-flag 4 mục đủ · Design↔Content không lệch P0 · marker T0/T1 = 0 và total ≤ 20 | ❌ (P0 = 7) |
| NEEDS_REVISION | P0 = 0 nhưng có P1 dư / traceability < 95% / common gap / feature-flag thiếu mục / design↔content lệch P1 / marker T0/T1 > 0 | ❌ (P0 ≠ 0) |
| **REJECTED** | **P0 ≥ 1** | ✅ **(P0 = 7)** |

**Chosen verdict**: **REJECTED**.

**Rationale**: 7 P0 tập trung ở 3 nhóm hệ thống: (a) Common registry chưa bootstrap (`Product/_common/`) + drift `ERR-CMN-004` 10→30MB + `ERR-INV-*` status "DRAFT" ambiguity → agent DEV không có SSOT chuẩn, sẽ hardcode chuỗi lệch giữa các FEAT; (b) Feature-flag `Inventory:InventoryV2` chỉ khai ở EP §5.2, 17 FEAT không có declare frontmatter + không có AC kill-switch behavior → khi tắt flag runtime, DEV không biết code fallback; (c) Import/export row cap + sample file mẫu missing cho 5 FEAT EXPORT/report → OOM production + agent tự bịa layout file. Ba nhóm này đều là "SSOT không đủ" — dạng lỗi nếu để lọt DEV sẽ khó rollback (drift lan xuống 3 tier: FEAT text ↔ registry ↔ generated code).

Traceability AC↔BR ~98%, BR→ErrorCode ~95%, terminology + persona consistency ✅ — chất lượng nghiệp vụ core tốt; vấn đề nằm ở tầng infrastructure / policy compliance.

---

## §4A. Trạng thái xử lý finding (BA cập nhật khi fix)

> **Owner của bảng này = BA/PO đang chạy fix cycle**, KHÔNG phải agent po-review (agent chỉ khởi tạo bảng với toàn bộ finding ở trạng thái `OPEN`). Khi BA chạy `/po-review-apply` để update tài liệu dựa vào §2, command sẽ đồng thời cập nhật row tương ứng ở bảng này (Status + Vị trí đã update + Updated by + Updated at + Notes).
>
> **KHÔNG được edit §1-§4 finding gốc** (audit trail bất biến từ agent scan). Chỉ được edit bảng §4A + footer "Tổng quan progress". KHÔNG cần bump report version cho BA edit (dùng `updated_at` per-row).
>
> **Trạng thái hợp lệ**:
> - `OPEN` — chưa xử lý (default khi agent khởi tạo).
> - `IN_PROGRESS` — BA đang draft fix / chờ approve CR.
> - `DONE` — đã fix + verified (nêu vị trí đã update).
> - `DEFERRED` — defer sang wave / CR sau; ghi CR link + rationale trong Notes.
> - `WONT_FIX` — BA/PO quyết không fix (rationale + confirm bởi Business Authority trong Notes).
>
> **Vị trí đã update** = `file:line` (hoặc `file` nếu edit nhiều dòng) thực tế BA đã sửa — cần để reviewer verify khi chạy lại `/po-review`. Nếu fix nằm ở artifact ngoài scope original (VD tạo `Product/_common/*` mới) → ghi path mới.

| Finding ID | Sev | Title (rút gọn) | Owner | Status | Vị trí đã update (file:line) | Updated by | Updated at | Notes |
|---|---|---|---|---|---|---|---|---|
| C2.1 | P0 | Import/export row cap explicit thiếu 5 FEAT | BA+Arch | OPEN | — | — | — | — |
| C2.2 | P0 | Sample file `.xlsx` mandatory thiếu 5 FEAT | BA+UX | OPEN | — | — | — | — |
| C2.3 | P1 | Filter data description mỏng 3 STK FEAT | BA | OPEN | — | — | — | — |
| C2.4 | P1 | Navigation AC — điểm ra sau Lưu form CREATE/EDIT | BA+UX | OPEN | — | — | — | — |
| C2.5 | P1 | Concurrency / optimistic lock — ERR-CMN-008 chưa cite | BA+Arch | OPEN | — | — | — | — |
| C3.1 | P0 | ERR-CMN-004 registry drift 10MB → 30MB | BA+Arch | OPEN | — | — | — | — |
| C3.2 | P0 | ERR-INV-* status DRAFT/PROPOSED chưa cutover — 47 mã | BA+Arch | OPEN | — | — | — | — |
| C3.3 | P1 | Empty-state INFO code missing cho list/report rỗng | BA+Arch | OPEN | — | — | — | — |
| C4.1 | P0 | `Product/_common/` folder không tồn tại (4 file) | PM+BA | OPEN | — | — | — | — |
| C4.2 | P1 | Duplicate validation rule inline ≥ 3 FEAT/BR | BA | OPEN | — | — | — | — |
| C7 | P2 | UX & business tightness (5 improvements aggregate) | UX+BA | OPEN | — | — | — | — |
| C8.1 | P0 | FEAT §Feature-Flag section thiếu 17/17 FEAT | BA+DA | OPEN | — | — | — | — |
| C8.2 | P0 | Kill-switch behavior AC thiếu 17/17 FEAT | BA+Arch | OPEN | — | — | — | — |
| C8.3 | P1 | EP Feature-Flag roll-up rollout order thiếu | PM+DA | OPEN | — | — | — | — |
| C9.1 | P1 | figma-links.yaml wave "05" chưa tồn tại | DA+BA | OPEN | — | — | — | — |
| C9.2 | P1 | Mobile Figma missing STK-DETAIL-V2 + IP-VIEW-V2 | UX+BA | OPEN | — | — | — | — |
| C10.1 | P1 | TBD Target wave 3 EP — chưa lock W05 | DA | OPEN | — | — | — | — |

**Tổng quan progress** (BA cập nhật cuối bảng):
- Total findings: **17 rows** (P0=7 · P1=9 · P2=1 aggregate C7 = 5 items) · **OPEN: 17** · IN_PROGRESS: 0 · DONE: 0 · DEFERRED: 0 · WONT_FIX: 0
- P0 remaining OPEN/IN_PROGRESS: **7** (blocking downstream `/gen-execution-spec W05` + `/arch-design W05`)
- Last updated: 2026-07-14 bởi main agent (khởi tạo bảng)

**Ví dụ 1 row đã fix** (BA copy pattern):
```
| C2.2 | P0 | Sample file mandatory | BA+UX | DONE | Product/ux/samples/inventory-v2/FEAT-IR-EXPORT-sample.xlsx + FEAT-IR-EXPORT.md:AC-2 | quannn | 2026-07-16 | 5/5 FEAT có sample file attach + link inline AC |
```

**Ví dụ 1 row deferred**:
```
| C4.1 | P0 | _common/ folder missing | PM | DEFERRED | — | ninhnguyen | 2026-07-15 | CR-20260715-01 defer bootstrap common/ đến W06 (BA quyết); Business Authority approve 2026-07-16 |
```

---

## §5. Next steps (owner-actionable)

### Round 1 — Fix P0 (blocking) — order dependency-aware:

1. **[Architect + Business Authority]** CR cutover ERR-INV-* + fix ERR-CMN-004 message → 30MB (C3.1 + C3.2). Bump ERROR-CODE-REGISTRY v18. **Dep**: none, chạy đầu tiên.
2. **[Product Manager]** Tạo `Product/_common/` với 4 file skeleton + backfill entry (C4.1). Bump 3-in-1. **Dep**: sau (1) để bootstrap FEATURE-FLAGS.md có row `Inventory:InventoryV2`.
3. **[Business Analyst]** Cascade 17 FEAT `feature_flag:` frontmatter + §Kill-Switch AC (C8.1 + C8.2). Chạy `/gen-ep-feat` batch cho toàn scope. **Dep**: sau (2) — flag entry đã có trong common registry.
4. **[Business Analyst + Architect]** 5 FEAT EXPORT/report thêm row cap + sample file (C2.1 + C2.2). **Dep**: song song với (3), không blocking.

### Round 2 — Fix P1 (sau khi Round 1 xong):

5. Business Analyst cascade filter data description STK/IP (C2.3), navigation AC (C2.4), concurrency AC (C2.5), empty-state code (C3.3), duplicate validation refactor (C4.2), Target wave lock (C10.1).
6. UX design 2 màn mobile STK-DETAIL + IP-VIEW (C9.2) hoặc thu hẹp scope.
7. Delivery Authority sync `Product/ux/figma/figma-links.yaml` wave "05" (C9.1). EP thêm rollout plan (C8.3).

### Round 3 — Re-review:

8. **PO chạy lại `/po-review EP-INVENTORY-RECEIPT-V2 EP-INVENTORY-DELIVERY-V2 EP-INVENTORY-STOCK-V2`** — kỳ vọng verdict `APPROVED` hoặc `NEEDS_REVISION` (nếu còn ≤ 2 P1).

### Round 4 — Downstream unlock (chỉ khi APPROVED):

9. `/gen-execution-spec W05` + `/arch-design W05`.
10. Chạy `/prefetch-figma web 05` + `/prefetch-figma mobile 05` để generate `Product/ux/figma-{web,mobile}/wave05-*.md` — feed vào Architecture stage.
11. Sau Arch review + REVIEW_GROUP + CR approved → `/wave-start W05` + `/dev-start garage-web` (hoặc boundary tương ứng).

---

## §6. Change Log (report versions)

| Date | Version | Reviewer | Description |
|---|---|---|---|
| 2026-07-13 | 1 | PO (ninhnguyen) + main agent | Initial review — 21 findings (P0=7 · P1=9 · P2=5). Verdict REJECTED. Scope: 17 FEAT (7 IR + 7 ID + 3 STK) + 3 EP-V2 + 3 BR-V2 + 3 UX-FLOW-V2 + ERROR-CODE-REGISTRY. P0 tập trung 3 nhóm: common-registry bootstrap (folder missing + ERR-CMN-004 drift + ERR-INV-* status DRAFT), FEAT feature-flag section + kill-switch behavior AC missing 17/17 FEAT, import/export row cap + sample file mẫu missing 5 FEAT EXPORT/report. Round 1 fix path: cutover ERR-INV-* → bootstrap _common/ → cascade FEAT flag frontmatter → EXPORT row cap. |
| 2026-07-14 | 3 | main agent (khởi tạo §4A tracking) | **Bổ sung §4A "Trạng thái xử lý finding"** giữa §4 và §5 — bảng 9 cột (Finding ID · Sev · Title · Owner · Status · Vị trí đã update · Updated by · Updated at · Notes) khởi tạo với 17 row từ §2 findings (P0=7 · P1=9 · P2=1 aggregate C7), toàn bộ default `OPEN`. Kèm footer "Tổng quan progress" + 2 ví dụ pattern DONE/DEFERRED. BA sẽ chạy `/po-review-apply` để iterate fix từng finding + auto-update bảng này song song với source docs. Không đổi verdict / severity / total finding count. |
| 2026-07-13 | 2 | PO (ninhnguyen) + main agent | **Bổ sung field "Vấn đề" (Problem statement) cho 16 finding chi tiết** (C2.1..C2.5, C3.1..C3.3, C4.1..C4.2, C8.1..C8.3, C9.1..C9.2, C10.1) — mô tả nghiệp vụ tiếng Việt dễ hiểu cho BA/PO không có bối cảnh kỹ thuật đầy đủ. Mỗi finding giờ có 6 field: **Vấn đề** (nghiệp vụ WHY matters) → **Location** → **Evidence** (trích quote) → **Impact** (downstream) → **Fix** (đề xuất) → **Owner**. Không đổi verdict / severity / total finding count. |
