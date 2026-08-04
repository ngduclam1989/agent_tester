---
type: execution-spec
artifact_kind: business-rule
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W06"
last_reviewed: "2026-07-31"
source_ref: "Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md"
source_version: 19
source_sha: "b115a1ee57dcd0214d89410b51a9ad68e36fd1c0830ef4d1e3cb9adb4cb671d7"  # backfilled by orchestrator 2026-07-31 (author session had no Bash tool)
generated_at: "2026-07-31T00:00:00Z"
boundary: "gf-inventory"
applies_to_feats:
  - FEAT-STK-LIST-V2
  - FEAT-IP-VIEW-V2
  - FEAT-STK-DETAIL-V2
  - FEAT-INV-MOBILE-MENU
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
authoring_inputs:
  kg_baseline_sha: "456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b"
---

# BR-GF-INVENTORY-STOCK-V2 — Wave W06 Scoped Spec

> **Phạm vi**: Toàn bộ 3 feature của `EP-INVENTORY-STOCK-V2` trong W06 — `FEAT-STK-LIST-V2` (tồn đến ngày, web+mobile) · `FEAT-IP-VIEW-V2` (NXT, web-only) · `FEAT-STK-DETAIL-V2` (thẻ kho, web-only). Rule text §1 là **VERBATIM copy** từ nguồn canonical (v19). File nguồn này thuộc **riêng** `EP-INVENTORY-STOCK-V2` (không dùng chung epic khác) — toàn bộ 16 BR + 1 CB đều thuộc scope W06, **không filter** rule nào ra.
> Boundary primary: `gf-inventory`. Cross-wave state-matrix: `FEAT-INV-MOBILE-MENU` (boundary `garage-mobile`) — hub thêm 1 tile "Tồn kho" per BR-STKV2-016, không phải FEAT count trong PKG §2.2 nhưng có applies_to relationship với rule đó.
> **Lưu ý mechanism**: `BR-STKV2-001` + `BR-STKV2-005a` mô tả **shared engine sổ tồn** (`StockLedgerRecomputeService`, ADR-020) — 3 FEAT trong wave này (STK-LIST-V2/IP-VIEW-V2/STK-DETAIL-V2) là **READ-ONLY consumer** của sổ tồn (`inventory_stock_ledger`); **write-path** (5 tình huống ghi/cập nhật sổ tồn) thuộc các FEAT **NGOÀI wave này**: `FEAT-OB-IMPORT/EDIT/DELETE-LINES` (W04, đã có wave-spec `Execution/wave-specs/W04/.../BR-GF-INVENTORY-OPENING-BALANCE.md`), `FEAT-IRV2-*`/`FEAT-IDV2-*` (W05, đã có wave-spec `RECEIPT-V2`/`DELIVERY-V2`), và `BR-PRC-005` (W06 — nhưng thuộc `EP-INVENTORY-ACCOUNTING-PERIOD` / `BR-GF-INVENTORY-ACCOUNTING-PERIOD`, spec riêng do agent song song `exec-spec-br-accounting-period` author). File này giữ **verbatim toàn bộ text** BR-STKV2-001/005a (đúng theo nguồn canonical), nhưng §3/§4/§5/§6 dưới đây **nhấn mạnh phần READ-PATH** áp dụng cho 3 FEAT wave W06; phần WRITE-PATH cross-reference sang 3 spec trên thay vì duplicate.
> Nhấn mạnh theo yêu cầu wave: **hide rule OR** (BR-STKV2-007/011, `SL ≠ 0 HOẶC GT ≠ 0`), **NXT đọc trực tiếp sổ tồn + OB-in-range = Nhập kho** (BR-STKV2-010, GAP-W06-GI-08 closed 2026-07-31), **thẻ kho đọc chi tiết phiếu KHÔNG đọc sổ tồn gộp** (BR-STKV2-013, GAP-W06-GI-01 closed 2026-07-31), **thẻ kho full-page + bỏ chip Kho + link "Số phiếu" điều hướng** (BR-STKV2-012, v16-v18), **mobile W06 chỉ FEAT-STK-LIST-V2** (BR-STKV2-016).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` |
| Source version | 19 |
| Source SHA | `b115a1ee57dcd0214d89410b51a9ad68e36fd1c0830ef4d1e3cb9adb4cb671d7` (backfilled 2026-07-31, xem §7 OI-W06-BR-STKV2-001 RESOLVED) |
| Generated at | 2026-07-31T00:00:00Z |
| PKG | `PKG-W06-inventory-pricing-stock-report` (v8) |
| Parent EP | `EP-INVENTORY-STOCK-V2` (v10) |
| Related ADRs | ADR-020 v7 (Sổ tồn point-in-time snapshot + engine tính lại dùng chung `StockLedgerRecomputeService`) · ADR-009 (JPA no relationship mapping, scalar FK) · ADR-027 v5 / ADR-028 v4 (BQGQ engine + Temporal async — nguồn giá trị "Giá trị tồn" phụ thuộc, thuộc `gf-accounting` PRC master, spec riêng) |

---

## §1 Rule Statements (VERBATIM — toàn bộ W06 scope)

> Toàn bộ rule trong nguồn áp dụng cho `EP-INVENTORY-STOCK-V2` = W06 scope. Không filter out rule nào (file nguồn dành riêng cho epic này).

### 1.1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-STKV2-001 | Báo cáo tồn/NXT/thẻ kho đọc sổ tồn tồn + dòng chi tiết phiếu nhập/xuất + tồn đầu kỳ (cùng boundary gf-inventory). Giá trị phụ thuộc kết quả BQGQ (PRC). | Nội bộ | `gf-inventory` | Đọc trực tiếp |

### 1.2 Nền tảng & dùng chung (BR-STKV2-001 .. BR-STKV2-005a)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-001 | Báo cáo dựa trên **cơ chế lưu tồn (sổ tồn)**. Sổ tồn ghi nhận cho mỗi **(mã + kho + garage) tại mỗi ngày** có biến động hoặc baseline: **(a) biến động trong ngày** = tổng SL/GT nhập + tổng SL/GT xuất (phiếu cùng ngày cùng (mã+kho+gara) **gộp thành 1 điểm dữ liệu**); **(b) tồn cuối ngày** = SL/GT tồn sau khi đã ghi sổ toàn bộ phiếu trong ngày. **Ghi/cập nhật sổ tồn ở 5 tình huống**: (1) **Import tồn đầu kỳ (OB)** → ghi vào **bảng tồn đầu kỳ** (source); engine tính lại sổ tồn từ (bảng OB + phiếu detail) → sổ tồn phản ánh OB **như 1 biến động ngày tại ngày OB import** (cùng công thức uniform với biến động phiếu nhập — xem BR-STKV2-010 note OB-trong-khoảng, GAP-W06-GI-08). Xóa/sửa OB (`FEAT-OB-DELETE-LINES` / `FEAT-OB-EDIT`) → thao tác ở bảng tồn đầu kỳ → engine tính lại. Sổ tồn là **projection** — không cần đánh dấu dòng OB trong sổ tồn. Xóa xong có thể import lại như lần đầu. (2) **Ghi sổ / bỏ ghi sổ phiếu nhập** → cập nhật biến động nhập + tồn cuối ngày. (3) **Ghi sổ / bỏ ghi sổ phiếu xuất** → cập nhật biến động xuất + tồn cuối ngày; GT xuất = 0 trước khi chạy BQGQ. (4) **Sửa / xóa phiếu** → cập nhật biến động ngày phiếu + **tự cập nhật tồn cuối ngày của mọi ngày về sau** cho (mã+kho+gara). (5) **Chạy BQGQ cuối kỳ** (BR-PRC-005) → điền đơn giá vốn xuất vào chi tiết phiếu xuất; sổ tồn cập nhật **GT xuất + GT tồn cuối** cho các ngày trong kỳ; **SL không đổi**. **Đọc sổ tồn**: **Tồn-đến-ngày D** = tồn cuối ngày của mốc gần nhất ≤ D (không cộng dồn từ đầu); **Tổng nhập/xuất khoảng [Từ, Đến]** = tổng biến động nhập/xuất trong khoảng. | System | **Write-path** (5 tình huống, NGOÀI wave W06 trừ (5)): `FEAT-OB-IMPORT` · `FEAT-OB-EDIT` · `FEAT-OB-DELETE-LINES` · `FEAT-IRV2-*` (ghi/bỏ ghi sổ + sửa/xóa phiếu nhập) · `FEAT-IDV2-*` (ghi/bỏ ghi sổ + sửa/xóa phiếu xuất) · `BR-PRC-005` (BQGQ, W06 nhưng thuộc BR-GF-INVENTORY-ACCOUNTING-PERIOD). **Read-path (W06 scope)**: `FEAT-STK-LIST-V2` · `FEAT-STK-DETAIL-V2` · `FEAT-IP-VIEW-V2`. |
| BR-STKV2-005a | **Quy tắc tính lại sổ tồn (áp chung mọi thao tác)**. **Nguồn dữ liệu**: engine đọc từ 2 source — **(a) Bảng tồn đầu kỳ** (OB: SL/GT tại "Tồn đến ngày" — điểm khởi đầu); **(b) Chi tiết phiếu nhập/xuất đã ghi sổ** (SL quy đổi ĐVT chính + GT theo ngày chứng từ). Phiếu **Nháp** không nằm trong source (chưa tác động tồn). Sổ tồn là **projection** — có thể rebuild hoàn toàn từ 2 source trên. **Algorithm**: khi bất kỳ thao tác nào (import/sửa/xóa OB, ghi sổ/bỏ ghi sổ phiếu, sửa/xóa phiếu **đã ghi sổ**, chạy BQGQ) làm thay đổi dữ liệu source tại ngày D của (mã+kho+gara), hệ thống: **(1)** Tính lại biến động ngày D từ source (tổng nhập + tổng xuất đã ghi sổ cùng ngày). **(2)** Tính lại tồn cuối ngày D = tồn cuối ngày trước D + biến động nhập D − biến động xuất D. **(3)** Lặp bước 2 cho **mọi ngày về sau D** cho cùng (mã+kho+gara): tồn cuối N = tồn cuối (N−1) + nhập N − xuất N — đến hết. **(4)** Check tồn âm point-in-time: nếu tồn cuối bất kỳ ngày nào < 0 → **chặn thao tác gốc** (`ERR-INV-036`). Tất cả 10 write-path (BR-IRV2-003/004/006, BR-IDV2-003/005/006, OB import/EDIT/DEL, BR-PRC-005) **gọi chung** quy tắc này — không implement riêng. | System / Shared | **10 write-path** (NGOÀI wave W06 trừ BQGQ): `FEAT-OB-IMPORT` · `FEAT-OB-EDIT` · `FEAT-OB-DELETE-LINES` · `FEAT-IRV2-*` (BR-IRV2-003/004/006) · `FEAT-IDV2-*` (BR-IDV2-003/005/006) · BQGQ (`BR-PRC-005`). |
| BR-STKV2-002 | **Số lượng tồn realtime**; **giá trị tồn = GT tồn đầu + GT nhập − giá vốn xuất** (giá vốn xuất = 0 nếu chưa chạy BQGQ) — luôn hiển thị **số (hoặc 0)**, **KHÔNG dùng chữ "Tạm tính"** trong ô (chỉ là ghi chú ngoài bảng). | Display / Calculation | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2 |
| BR-STKV2-003 | Báo cáo theo **(mã + kho + garage)** — **tách dòng theo kho**: 1 mã ở nhiều kho → nhiều dòng (không gộp kho). Khi lọc nhiều kho / tất cả kho vẫn tách theo kho. | Grouping | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2 |
| BR-STKV2-004 | **Không filter Garage** — garage xác định theo tài khoản/ngữ cảnh đăng nhập (tenant isolation). Bộ lọc chỉ gồm Kho + Mã/Tên nội bộ (+ ngày). | Tenant Isolation | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2 |
| BR-STKV2-005 | **Xuất file** = xuất đúng các cột dữ liệu báo cáo ra `.xlsx` theo bộ lọc hiện tại và **bám mẫu Excel chuẩn theo từng báo cáo**: `FEAT-STK-LIST-V2` → [Báo cáo tồn kho.xlsx](<../ux/assets/Báo cáo tồn kho.xlsx>); `FEAT-IP-VIEW-V2` → [Báo cáo nhập xuất tồn.xlsx](<../ux/assets/Báo cáo nhập xuất tồn.xlsx>); `FEAT-STK-DETAIL-V2` → [Báo cáo thẻ kho.xlsx](<../ux/assets/Báo cáo thẻ kho.xlsx>). Không xuất các cột/entry UI-only như **"Thao tác"**. DEV bám tên sheet / cột / thứ tự / định dạng số / merge / header của mẫu tương ứng. | Export | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2 |

### 1.3 Báo cáo tồn kho đến ngày (BR-STKV2-006 .. BR-STKV2-008)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-006 | Báo cáo tồn kho theo **một mốc "đến ngày"** (D). **SL tồn = SL tồn của dòng sổ tồn gần nhất ≤ D** (tra cứu, realtime). Cột: Mã nội bộ / Tên SP / ĐVT chính / Kho / Số lượng tồn / Giá trị tồn + dòng Tổng. | Calculation | FEAT-STK-LIST-V2 |
| BR-STKV2-007 | Báo cáo hiển thị các mã có **SL tồn ≠ 0 HOẶC Giá trị tồn ≠ 0 tại ngày đã chọn** (tồn biến theo ngày → căn theo bộ lọc ngày; cùng mã có thể hiện ở ngày này, ẩn ở ngày khác). Điều kiện OR — bắt cả trường hợp SL=0 nhưng còn dư giá trị (vd chênh lệch làm tròn giá vốn bình quân sau BQGQ). Đồng bộ pattern với BR-STKV2-011 (NXT). | Filter | FEAT-STK-LIST-V2 |
| BR-STKV2-008 | Bộ lọc: search mã/tên + Kho (tất cả / nhiều kho) + Ngày (mốc "đến ngày"). | Search | FEAT-STK-LIST-V2 |

### 1.4 Báo cáo Nhập Xuất Tồn (BR-STKV2-009 .. BR-STKV2-011)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-009 | NXT theo **khoảng [Từ ngày, Đến ngày]**, **1 dòng / (mã + kho)**. Cột: STT / Mã SP nội bộ / Tên SP nội bộ / ĐVT chính / Kho / 4 nhóm cột **Đầu kỳ** / **Nhập kho** / **Xuất kho** / **Cuối kỳ**; mỗi nhóm có 2 cột con **Số lượng** + **Giá trị**; có dòng Tổng. | Calculation | FEAT-IP-VIEW-V2 |
| BR-STKV2-010 | Báo cáo NXT theo [Từ, Đến] **đọc trực tiếp từ sổ tồn**, KHÔNG đọc chi tiết phiếu nhập/xuất: nhóm **Đầu kỳ** = tồn cuối ngày của mốc gần nhất ≤ (Từ ngày − 1); nhóm **Nhập kho** = tổng SL/GT nhập trong khoảng; nhóm **Xuất kho** = tổng SL/GT xuất trong khoảng; nhóm **Cuối kỳ** = tồn cuối ngày của mốc gần nhất ≤ Đến ngày (bằng Đầu kỳ + Nhập kho − Xuất kho theo tính chất). **Lý do**: đảm bảo Báo cáo NXT và Báo cáo tồn-đến-ngày cùng đọc 1 nguồn — số tồn tại 1 mốc ngày không lệch giữa 2 báo cáo. **OB rơi trong khoảng lọc** (BA xác nhận 2026-07-31, GAP-W06-GI-08): nếu tồn đầu kỳ (OB) được import với ngày rơi trong khoảng `[Từ ngày, Đến ngày]`, SL/GT của OB đó **tính vào nhóm Nhập kho** (không phải Đầu kỳ) — vì sổ tồn ghi nhận OB import như 1 biến động ngày (per BR-STKV2-001 mục (1)), cùng công thức uniform với biến động phiếu nhập. Kế toán có thể thấy cột "Nhập kho" chứa khoản phát sinh từ import OB, không chỉ từ phiếu nhập. | Calculation | FEAT-IP-VIEW-V2 |
| BR-STKV2-011 | Hiển thị mã có **phát sinh nhập/xuất trong kỳ HOẶC Đầu kỳ/Cuối kỳ ≠ 0**. Dòng chưa chạy tính giá → **chỉ Giá trị nhóm Xuất kho = 0** (giá vốn chưa chốt); **Giá trị nhóm Đầu kỳ / Nhập kho vẫn hiển thị giá trị thật**, **Giá trị nhóm Cuối kỳ = Giá trị Đầu kỳ + Giá trị Nhập kho − Giá trị Xuất kho (= Giá trị Đầu kỳ + Giá trị Nhập kho khi Giá trị Xuất kho = 0)**. Ghi chú ngoài bảng nhắc cần chạy tính giá. | Filter / Display | FEAT-IP-VIEW-V2 |

### 1.5 Thẻ kho — Xem lịch sử tồn kho (BR-STKV2-012 .. BR-STKV2-014)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-012 | Thẻ kho theo **1 mã + 1 kho**, mở dạng **màn riêng (full-page, v8 — đổi từ popup)** từ nút **"Xem lịch sử"** trên Báo cáo tồn kho **Web GMS** (tự lấy mã + kho — **không chọn mã trực tiếp**, **không hiển thị bộ lọc/chip Kho trên UI** — v16, kho vẫn xác định ngầm từ dòng nguồn); nút "Đóng" điều hướng quay lại Báo cáo tồn kho. Bộ lọc: chỉ còn khoảng ngày (1 range-picker, mặc định tháng hiện tại). Cột **"Số phiếu"** là **link** — click → **chuyển màn** (không mở tab mới) sang chi tiết phiếu tương ứng (`FEAT-IR-DETAIL-V2` phiếu nhập / `FEAT-ID-DETAIL-V2` phiếu xuất) theo `slipType` (v18). App Garage W06 không expose thẻ kho theo BR-STKV2-016. | Scope | FEAT-STK-DETAIL-V2 |
| BR-STKV2-013 | **Nguồn dữ liệu**: thẻ kho đọc trực tiếp **chi tiết phiếu nhập/xuất đã ghi sổ** — **KHÔNG đọc sổ tồn** (sổ tồn gộp phiếu cùng ngày theo BR-STKV2-001, mất granularity per-phiếu) và **KHÔNG hiển thị dòng OB riêng** dù ngày OB rơi vào khoảng lọc (biến động OB **không** tự thành 1 dòng trên thẻ kho — chỉ phản ánh gián tiếp qua giá trị Đầu kỳ dòng phiếu đầu tiên, xem dưới). Sổ tồn chỉ dùng để tra **Đầu kỳ dòng đầu**. Mỗi dòng = **1 phiếu** (nhập/xuất ghi sổ) trong khoảng; cột **Đầu kỳ / Nhập kho / Xuất kho / Cuối kỳ** (SL + Giá trị) chạy **running** (Cuối kỳ dòng trước = Đầu kỳ dòng sau). **Đầu kỳ dòng đầu** = tra sổ tồn ≤ (Từ ngày − 1) — sổ tồn này đã cộng gộp mọi OB import trước đó, kể cả OB rơi trong khoảng lọc nếu ngày OB < ngày phiếu đầu tiên trong khoảng; nếu chưa có biến động trước đó → 0. **Reconciliation invariant**: cuối dòng phiếu cuối cùng của ngày D = tồn cuối ngày D trên sổ tồn. | Calculation | FEAT-STK-DETAIL-V2 |
| BR-STKV2-014 | Dòng Tổng: Đầu kỳ (đầu khoảng) / Σ Nhập / Σ Xuất / Cuối kỳ (cuối khoảng). Giá trị cột **Xuất** dùng giá vốn BQGQ đã chốt; chưa chạy → **GT Xuất = 0** (kéo theo GT Cuối kỳ = GT Đầu + GT Nhập). **GT Đầu kỳ / GT Nhập vẫn là giá trị thật**. | Calculation | FEAT-STK-DETAIL-V2 |

### 1.6 Phân quyền (BR-STKV2-015)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-015 | 2 vai trò — chủ garage và kế toán — **quyền ngang nhau** trên toàn bộ báo cáo tồn / NXT / thẻ kho. | Permission | (toàn bộ feature) |

### 1.7 Platform scope W06 (BR-STKV2-016)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-016 | **App Garage W06 chỉ triển khai `FEAT-STK-LIST-V2` trong Stock V2**: mobile vào từ hub `FEAT-INV-MOBILE-MENU` tile **"Tồn kho"** và mở màn **Báo cáo tồn kho đến ngày**. Mobile W06 **không expose** `FEAT-IP-VIEW-V2`, `FEAT-STK-DETAIL-V2`, tab NXT, route thẻ kho, hoặc action **"Xem lịch sử"**. Web GMS vẫn triển khai đầy đủ 3 feature Stock V2. | Platform Scope | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2, FEAT-INV-MOBILE-MENU |

---

## §2 Rationale (VERBATIM — trích header + preamble nguồn)

> Trích nguyên văn từ header + preamble nguồn canonical.

Tập business rules V2 cho `EP-INVENTORY-STOCK-V2`. File **mới** (không thay thế BR cũ — baseline giữ nguyên). Dựa trên **cơ chế lưu tồn (sổ tồn)** (xem BR-STKV2-001/002).

---

## §3 Enforcement Layer

### 3.1 Tổng quan phân lớp

| Layer | Vai trò | Rules chính |
|---|---|---|
| Domain (`gf-inventory` — `app/service`, `StockLedgerReportService`) | **PRIMARY** cho query logic 3 báo cáo (tồn-đến-ngày / NXT / thẻ kho) — hide-rule OR, group-by (mã+kho), running formula thẻ kho, aggregate server-side | BR-STKV2-001 (read-path), BR-STKV2-002/003/004, BR-STKV2-006..014 |
| Engine sổ tồn chung (`StockLedgerRecomputeService`, ADR-020) | **PRIMARY cho write-path invariant tồn ≥ 0** — Stock V2 reports là **READ-ONLY consumer**, KHÔNG tự ghi/cascade; write-path 10 tình huống thuộc FEAT ngoài wave này (xem note đầu file) | BR-STKV2-001 (write-path, cross-ref), BR-STKV2-005a |
| DB-level (`inventory_stock_ledger`, `opening_balance_line` — ADR-020 §4b, đã tồn tại từ W04; `receipt_line`/`delivery_line` — §4c, đã tồn tại từ W05) | Hard constraint — **KHÔNG có bảng mới cho W06 Stock V2** (3 báo cáo là pure read query trên schema đã ship); index `idx_ledger_lookup` (point-in-time DESC), `idx_ledger_tenant_date` (NXT range), `idx_ledger_warehouse`; `closing_qty ≥ 0` enforce ở engine level (không phải DB CHECK) | BR-STKV2-006/010 (point-in-time lookup), BR-STKV2-013 (Q3 nguồn receipt_line/delivery_line) |
| REST adapter (`gf-inventory` — index `Architecture/api/gf-inventory-api.md` v72 §3g, endpoints W06-STK-Q1/Q2/Q3/EX1/EX2/EX3) | Secondary — request DTO validate (`asOfDate`/`warehouseIds[]`/`keyword`, `fromDate`/`toDate`, `productCode`+`warehouseCode`), pagination, row-cap export (50k Q1/Q2, 10k Q3), `@FeatureOn(Inventory:InventoryV2)` gate | BR-STKV2-006/007/008/009/010/011/012/013/014 |
| BFF (`agg-garage-graph`, `Architecture/api/agg-garage-graph-graphql.md` v7.79 §3j) | Defense-in-depth — resolver thuần passthrough, **KHÔNG recompute `aggregates`/`content[]`** từ dữ liệu con (luôn dùng BE-computed); `stockLedgerAtDate` mobile SUPPORTED, `stockInoutSummary`/`stockCardDetail` web-only | BR-STKV2-002 (aggregates verbatim), BR-STKV2-016 (mobile Q1-only) |
| UI (`garage-web` / `garage-mobile`) | Secondary — không hiển thị "Tạm tính", empty state 3 báo cáo, thẻ kho full-page + bỏ chip/bộ lọc Kho, cột "Số phiếu" link điều hướng, Export Excel bám mẫu `.xlsx` | BR-STKV2-002, BR-STKV2-005, BR-STKV2-012, BR-STKV2-016 |
| Cross-feature routing (`FEAT-IR-DETAIL-V2` / `FEAT-ID-DETAIL-V2`, ngoài applies_to_feats file này) | Secondary — entry point nhận điều hướng "chuyển màn" từ cột "Số phiếu" thẻ kho theo `slipType` | BR-STKV2-012 (v18 cascade — đã áp dụng ở FEAT-IR/ID-DETAIL-V2 AC-1) |

### 3.2 Chi tiết enforcement per rule

#### Cross-boundary / nền tảng

| Rule | Primary layer | Cơ chế |
|---|---|---|
| CB-STKV2-001 | Domain | `gf-inventory` tự đọc `inventory_stock_ledger` + `receipt_line`/`delivery_line` + `opening_balance_line` trong cùng boundary — không cross-boundary REST call cho 3 report. Giá trị "Giá trị tồn"/"Giá vốn xuất" phụ thuộc kết quả BQGQ do `gf-accounting` (PRC master, W06) ghi ngược vào `delivery_line.cost_unit_price` qua S2S `W06-P3 bulk-fill-cost` + `W06-P5 bulk-recompute` (xem `BR-GF-INVENTORY-ACCOUNTING-PERIOD` wave-spec, ngoài phạm vi file này) — Stock V2 reports chỉ **đọc kết quả sau khi PRC đã ghi**, không tự gọi PRC. |
| BR-STKV2-001 (read-path) | Domain — `StockLedgerReportService` | Q1 (`stockLedgerAtDate`) point-lookup `ORDER BY movement_date DESC LIMIT 1 WHERE movement_date <= asOfDate`; Q2 (`stockInoutSummary`) point-lookup 2 đầu khoảng + `SUM(inbound/outbound)` trong range; Q3 (`stockCardDetail`) — xem BR-STKV2-013 (khác nguồn). |
| BR-STKV2-001 (write-path, cross-ref) | Engine (`StockLedgerRecomputeService`, ADR-020) | 5 tình huống ghi sổ — (1)(2)(3)(4) thuộc `FEAT-OB-*`/`FEAT-IRV2-*`/`FEAT-IDV2-*` (đã có wave-spec W04/W05); (5) BQGQ thuộc `BR-PRC-005` (W06, spec riêng `BR-GF-INVENTORY-ACCOUNTING-PERIOD`). File này KHÔNG lặp lại enforcement chi tiết — chỉ cross-reference. |
| BR-STKV2-005a | Engine (`StockLedgerRecomputeService.recomputeBatch`, ADR-020 §C — cascade forward algorithm) | 4 bước: (1) tính lại biến động ngày D; (2) tính lại `closing_qty/closing_value` ngày D; (3) lặp cascade forward mọi ngày sau D cùng (mã+kho+gara); (4) invariant `closing_qty ≥ 0` — vi phạm → exception `NegativeStock` → `ERR-INV-036`, rollback thao tác gốc. **Concurrency**: 2 recompute cùng (mã+kho) tại cùng thời điểm → ordered-lock cross-key (ADR-020) → timeout → `ERR-INV-051`. Trigger cụ thể (10 write-path) NGOÀI wave W06 trừ BQGQ (`BR-PRC-005`, spec sibling). |

#### Báo cáo tồn kho đến ngày

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-STKV2-002 | Domain (formula) + BFF (passthrough) + UI (không hiển thị "Tạm tính") | `Giá trị tồn = inbound_value_cumulative − outbound_value_cumulative` tính sẵn trong `closing_value` của dòng ledger gần nhất ≤ D — BE trả số nguyên/thập phân, KHÔNG trả flag "tạm tính"; FE render số trực tiếp, ghi chú "phụ thuộc BQGQ" đặt ngoài bảng (static text, không phải data-driven). |
| BR-STKV2-003 | Domain — REST endpoint `W06-STK-Q1` | Query `GROUP BY (product_code, warehouse_code)` — mỗi kết quả `content[]` item = 1 (mã+kho); filter nhiều kho vẫn giữ tách dòng (không `GROUP BY product_code` riêng). |
| BR-STKV2-004 | Domain + REST adapter (Critical Rule #4 tenant isolation) | `TenantFilter`/`TenantContext` enforce mọi query; request DTO Q1 **không có field `garageId`** trong body — chỉ `warehouseIds[]`/`keyword`/`asOfDate`; garage suy từ JWT/`X-Tenant-Id`. |
| BR-STKV2-006 | Domain — `W06-STK-Q1` | `idx_ledger_lookup (tenant_id, product_id, warehouse_id, movement_date DESC)` — point-in-time "gần nhất ≤ D" 1 index scan/mã+kho; `content[]` map trực tiếp `closing_qty`/`closing_value` của dòng match. |
| BR-STKV2-007 | Domain — `W06-STK-Q1` hide rule | `WHERE closing_qty <> 0 OR closing_value <> 0` — áp filter tại tầng query (không phải post-filter tại FE), tránh trả thừa dữ liệu; bắt case SL=0 GT≠0 (chênh làm tròn BQGQ). |
| BR-STKV2-008 | REST adapter — `W06-STK-Q1` request DTO | `keyword` (LIKE mã/tên) + `warehouseIds[]` (multi/all) + `asOfDate` (bắt buộc, default hôm nay nếu FE không gửi — xác nhận tại FEAT). |

#### Báo cáo Nhập Xuất Tồn

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-STKV2-009 | Domain — `W06-STK-Q2` | Response `content[]` 1 item/(mã+kho), mỗi item 4 nhóm field (`opening{qty,value}`, `inbound{qty,value}`, `outbound{qty,value}`, `closing{qty,value}`) + `aggregates{}` 8 field tổng server-side. |
| BR-STKV2-010 | Domain — `W06-STK-Q2` | `opening` = point-lookup `movement_date <= fromDate - 1`; `inbound`/`outbound` = `SUM(inbound_qty/value)`/`SUM(outbound_qty/value) WHERE movement_date BETWEEN fromDate AND toDate` — **OB-in-range tự động nằm trong SUM này** vì sổ tồn ghi OB baseline row vào `inbound_qty/inbound_value` theo BR-STKV2-001 mục (1) (uniform formula, không cần branch riêng); `closing` = point-lookup `movement_date <= toDate`. Không đọc `receipt_line`/`delivery_line`. |
| BR-STKV2-011 | Domain — `W06-STK-Q2` hide rule + display rule | `WHERE (inbound_qty <> 0 OR outbound_qty <> 0 in-range) OR opening_qty <> 0 OR closing_qty <> 0`; GT Xuất trả `outbound_value` verbatim từ ledger (đã = 0 nếu chưa PRC ghi — không cần logic FE riêng để ẩn/hiện). |

#### Thẻ kho

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-STKV2-012 | Domain (`W06-STK-Q3` request `productCode`+`warehouseCode` server-side) + UI (`garage-web` route `/inventory-stock/reports/card/$productCode`, full-page, không filter/chip Kho — v16) + Cross-feature routing | `productCode`/`warehouseCode` lấy từ dòng nguồn `FEAT-STK-LIST-V2` (query param khi navigate, KHÔNG có dropdown chọn mã trên màn thẻ kho); response `content[].slipCode`+`slipType` đủ để FE build route `FEAT-IR-DETAIL-V2`/`FEAT-ID-DETAIL-V2` theo `slipType` (`RECEIPT`→IR, `DELIVERY`→ID) — không cần API riêng. |
| BR-STKV2-013 | Domain — `W06-STK-Q3` | Nguồn `content[]` = `receipt`+`receipt_line` UNION `delivery`+`delivery_line` với `status=POSTED`, line-level join theo `(product_code, warehouse_code)`; **KHÔNG** query `inventory_stock_ledger` cho `content[]` (chỉ dùng ledger 1 lần cho `opening{}` point-lookup `movement_date < fromDate`). No-movement case → HTTP 200 với `content:[]` (KHÔNG 404) — `opening`/`aggregates` vẫn populate. |
| BR-STKV2-014 | Domain — `W06-STK-Q3 aggregates{}` | BE-compute running total server-side (`opening`(đầu khoảng) + `Σ inbound` + `Σ outbound` + `closing`(cuối khoảng, = opening lookup tại `toDate`)); FE **KHÔNG** tự tính lại từ `content[]` (BFF passthrough verbatim per §3.1). |

#### Phân quyền / Platform scope

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-STKV2-015 | REST adapter / BFF | Endpoint auth scope `authenticated` — cả `garage-owner` + `accountant` pass, không phân biệt role tại endpoint level (Critical Rule #6 dual persona); không có RBAC-gated field/action riêng trên 3 báo cáo. |
| BR-STKV2-016 | Feature-flag gate (`Inventory:InventoryV2`) + UI routing + BFF SDL scope | `garage-web`: đủ 3 route (`/inventory-stock/reports/{at-date,inout,card/$productCode}`). `garage-mobile`: chỉ `StockAtDateReportPage` (`lib/ui/inventory/`) consume GraphQL `stockLedgerAtDate` (Q1); `stockInoutSummary`/`stockCardDetail` **không có mobile client code** (BFF SDL vẫn expose op nhưng garage-mobile không gọi — "mobile SUPPORTED" chỉ áp cho Q1 theo PKG §2.2.3). `FEAT-INV-MOBILE-MENU` hub enable 1 tile "Tồn kho" → route `StockAtDateReportPage`. |

### 3.3 DB-level (không có schema mới W06 Stock V2)

> 3 báo cáo trong wave này là **pure read query** trên schema đã ship trước W06 — **không thêm bảng/cột/migration mới**. Bảng dùng:

| Bảng | Nguồn wave | Vai trò cho Stock V2 W06 |
|---|---|---|
| `inventory_stock_ledger` | W04 (ADR-020, `V20260707020000__create_inventory_stock_ledger.sql`) | Nguồn chính Q1 (tồn-đến-ngày) + Q2 (NXT) — point-in-time lookup + range SUM |
| `opening_balance_line` | W04 (ADR-022) | Nguồn gián tiếp qua ledger (OB baseline row) — không query trực tiếp từ 3 report này |
| `receipt` / `receipt_line` | W05 (ADR-023/024) | Nguồn Q3 (thẻ kho) — dòng nhập POSTED |
| `delivery` / `delivery_line` | W05 (ADR-023/024) | Nguồn Q3 (thẻ kho) — dòng xuất POSTED |

Index dùng (đã tồn tại, không thêm mới): `idx_ledger_lookup (tenant_id, product_id, warehouse_id, movement_date DESC)` — Q1 point-lookup; `idx_ledger_tenant_date (tenant_id, movement_date)` — Q2 range; `idx_ledger_warehouse (tenant_id, warehouse_id, movement_date)` — tách dòng theo kho (BR-STKV2-003); `idx_receipt_line_parent`/`idx_delivery_line_parent` + `idx_*_product_wh` (W05) — Q3 line-level join.

---

## §4 Test Ideas

### TC-BR-GF-INV-STKV2 — Cross-boundary / nền tảng

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-STKV2-CB1-01 | CB-STKV2-001 | Q1/Q2/Q3 gọi trong cùng request lifecycle → verify không phát sinh REST call cross-boundary nào | Happy | 0 outbound call tới `gf-accounting`/`gf-sales`; toàn bộ query nội bộ `gf-inventory` |
| TC-BR-GF-INV-STKV2-001-01 | BR-STKV2-001 | Mã đã có OB (W04) + 2 phiếu nhập/xuất (W05) cùng ngày → Q1 tra ngày đó | Happy | `closing_qty`/`closing_value` = tổng gộp đúng biến động ngày đó (1 điểm dữ liệu) |
| TC-BR-GF-INV-STKV2-001-02 | BR-STKV2-001 | Chạy BQGQ (PRC, sibling spec) xong → Q1/Q2/Q3 tra lại cùng ngày | Happy | GT Xuất/GT tồn cuối đổi từ 0 sang giá trị BQGQ thực; SL không đổi |
| TC-BR-GF-INV-STKV2-005A-01 | BR-STKV2-005a | (Cross-ref, xem TC đầy đủ ở wave-spec W04 OB / W05 IRV2/IDV2 / W06 PRC) — Q1/Q2/Q3 chỉ SELECT, không invoke recompute | Edge | Verify 3 report READ-ONLY: 0 write query tới `inventory_stock_ledger` phát sinh từ Q1/Q2/Q3 |

### TC-BR-GF-INV-STKV2 — Báo cáo tồn kho đến ngày (Q1)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-STKV2-002-01 | BR-STKV2-002 | Mã chưa chạy BQGQ, GT tồn = GT đầu + GT nhập − 0 | Happy | Ô hiển thị số, không có text/flag "Tạm tính" |
| TC-BR-GF-INV-STKV2-003-01 | BR-STKV2-003 | 1 mã tồn ở 2 kho, filter "Tất cả kho" | Happy | 2 dòng riêng biệt, không gộp |
| TC-BR-GF-INV-STKV2-004-01 | BR-STKV2-004 | 2 tenant khác nhau cùng gọi Q1 | Tenant isolation | Mỗi tenant chỉ thấy dữ liệu garage mình |
| TC-BR-GF-INV-STKV2-006-01 | BR-STKV2-006 | Tra ngày D không trùng ngày có biến động (nằm giữa 2 mốc) | Happy | Trả `closing_*` của mốc gần nhất ≤ D (không nội suy) |
| TC-BR-GF-INV-STKV2-006-02 | BR-STKV2-006 | Tra ngày trước mốc OB đầu tiên | Edge | SL/GT tồn = 0 (EC-1 FEAT-STK-LIST-V2) |
| **TC-BR-GF-INV-STKV2-007-01** | **BR-STKV2-007** | Mã có `closing_qty=0` nhưng `closing_value=15000` (chênh làm tròn BQGQ) tại ngày D | **Edge** | Mã **vẫn hiển thị** trong `content[]` (OR condition) |
| TC-BR-GF-INV-STKV2-007-02 | BR-STKV2-007 | Mã có `closing_qty=0 AND closing_value=0` | Happy | Mã **không hiển thị** (đúng AND-negation của OR) |
| TC-BR-GF-INV-STKV2-008-01 | BR-STKV2-008 | Search keyword + filter 2 kho cụ thể + đổi `asOfDate` | Happy | Kết quả combine đúng cả 3 filter (AND) |

### TC-BR-GF-INV-STKV2 — Báo cáo NXT (Q2)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-STKV2-009-01 | BR-STKV2-009 | Mã ở 2 kho, khoảng [Từ, Đến] có phát sinh cả 2 kho | Happy | 2 dòng, mỗi dòng đủ 4 nhóm × 2 cột (SL+GT) |
| **TC-BR-GF-INV-STKV2-010-01** | **BR-STKV2-010** | OB import ngày rơi giữa `[Từ, Đến]` của filter | **Violation-check (regression GAP-W06-GI-08)** | SL/GT của OB đó cộng vào nhóm **Nhập kho**, KHÔNG cộng vào Đầu kỳ |
| TC-BR-GF-INV-STKV2-010-02 | BR-STKV2-010 | OB import ngày TRƯỚC `Từ ngày` | Happy | OB phản ánh trong Đầu kỳ (qua point-lookup ledger ≤ Từ ngày − 1), không lặp vào Nhập kho |
| TC-BR-GF-INV-STKV2-010-03 | BR-STKV2-010 | Verify Q1(Đến ngày = Đến ngày filter Q2) và Cuối kỳ Q2 cùng khoảng | Multi-step | Q1.closing == Q2.closing (cùng nguồn, không lệch) |
| TC-BR-GF-INV-STKV2-011-01 | BR-STKV2-011 | Mã chưa BQGQ, có nhập+xuất trong kỳ | Happy | GT Xuất = 0; GT Đầu/Nhập = số thật; GT Cuối = GT Đầu + GT Nhập |
| TC-BR-GF-INV-STKV2-011-02 | BR-STKV2-011 | Mã chỉ có Đầu kỳ ≠ 0, không phát sinh trong kỳ | Edge | Vẫn hiển thị (OR: Đầu kỳ ≠ 0) |

### TC-BR-GF-INV-STKV2 — Thẻ kho (Q3)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-STKV2-012-01 | BR-STKV2-012 | Click "Xem lịch sử" từ Q1 → verify route + params | Happy | Chuyển màn full-page `/inventory-stock/reports/card/{productCode}`, không popup; không có filter/chip Kho hiển thị |
| **TC-BR-GF-INV-STKV2-012-02** | **BR-STKV2-012** | Click cột "Số phiếu" (dòng `slipType=RECEIPT`) | **Happy** | Chuyển màn (không tab mới) sang `FEAT-IR-DETAIL-V2` theo `slipCode` |
| TC-BR-GF-INV-STKV2-012-03 | BR-STKV2-012 | Click cột "Số phiếu" (dòng `slipType=DELIVERY`) | Happy | Chuyển màn sang `FEAT-ID-DETAIL-V2` |
| **TC-BR-GF-INV-STKV2-013-01** | **BR-STKV2-013 (regression GAP-W06-GI-01)** | Ngày OB import rơi vào khoảng lọc thẻ kho `[Từ, Đến]` | **Violation-check** | KHÔNG có dòng OB riêng trong `content[]` — chỉ phiếu nhập/xuất thật; Đầu kỳ dòng đầu đã cộng gộp OB gián tiếp |
| TC-BR-GF-INV-STKV2-013-02 | BR-STKV2-013 | Không có biến động nào trong khoảng | Edge | HTTP 200, `content:[]`, `opening`/`aggregates` populated (opening=closing) — KHÔNG 404 |
| TC-BR-GF-INV-STKV2-013-03 | BR-STKV2-013 | 3 phiếu (nhập/xuất xen kẽ) trong khoảng, verify running | Happy | Cuối kỳ dòng N = Đầu kỳ dòng N+1; dòng phiếu cuối cùng ngày D khớp `closing` ledger ngày D |
| TC-BR-GF-INV-STKV2-014-01 | BR-STKV2-014 | Mã chưa chạy BQGQ | Happy | GT Xuất=0, GT Cuối kỳ = GT Đầu + GT Nhập |

### TC-BR-GF-INV-STKV2 — Phân quyền / Platform scope

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-STKV2-015-01 | BR-STKV2-015 | `accountant` gọi Q1/Q2/Q3 | Permission | Full access — không 403 |
| TC-BR-GF-INV-STKV2-015-02 | BR-STKV2-015 | `garage-owner` gọi Q1/Q2/Q3 | Permission | Full access — quyền ngang `accountant` |
| **TC-BR-GF-INV-STKV2-016-01** | **BR-STKV2-016** | Mobile W06 — verify hub `FEAT-INV-MOBILE-MENU` chỉ route tile "Tồn kho" tới `StockAtDateReportPage` | **Scope-guard** | Không có route/UI cho NXT/thẻ kho trên mobile client |
| TC-BR-GF-INV-STKV2-016-02 | BR-STKV2-016 | Mobile gọi GraphQL `stockInoutSummary`/`stockCardDetail` trực tiếp (bypass UI, giả lập) | Edge | BFF vẫn trả response hợp lệ (op không bị chặn tầng BFF) — scope-guard là UI-layer only, không phải server-side block; note cho QA regression |

---

## §5 BR → FEAT → AC Mapping

### FEAT-STK-LIST-V2 (v10)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-STKV2-001/002 | AC-1, AC-3 | Cơ chế sổ tồn; SL realtime + GT số/0 (không "Tạm tính") |
| BR-STKV2-003 | AC-5 | Tách dòng theo kho |
| BR-STKV2-004 | AC-4 | Không filter Garage |
| BR-STKV2-005 | AC-8 | Xuất file bám mẫu `Báo cáo tồn kho.xlsx`, không xuất cột "Thao tác" |
| BR-STKV2-006 | AC-3 | SL tồn = dòng sổ tồn gần nhất ≤ ngày đã chọn |
| BR-STKV2-007 | AC-6 | Hiển thị mã SL≠0 HOẶC GT≠0 (EC-5) |
| BR-STKV2-008 | AC-4 | Bộ lọc mã/tên + Kho + Ngày |
| BR-STKV2-012 (đầu) | AC-7 | "Xem lịch sử" → chuyển màn `FEAT-STK-DETAIL-V2` (mobile: ẩn) |
| BR-STKV2-015 | AC-9 | Phân quyền ngang nhau |
| BR-STKV2-016 | AC-1, AC-2, AC-7 | Mobile scope guard: chỉ có màn này; ẩn cột "Thao tác"/action "Xem lịch sử" trên mobile |

### FEAT-IP-VIEW-V2 (v10)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-STKV2-001/002 | AC-3, AC-4 | Cơ chế sổ tồn; GT số/0 |
| BR-STKV2-003/004 | AC-6, AC-5 | Tách theo kho; không filter Garage |
| BR-STKV2-005 | AC-7 | Xuất file bám mẫu `Báo cáo nhập xuất tồn.xlsx` |
| BR-STKV2-009 | AC-2 | 4 nhóm cột 2-tầng header (Đầu kỳ/Nhập kho/Xuất kho/Cuối kỳ) |
| **BR-STKV2-010** | **AC-3** | Cả 4 cột đọc trực tiếp sổ tồn; **OB-in-range = Nhập kho** (v19, GAP-W06-GI-08) |
| BR-STKV2-011 | AC-4, AC-6 | GT Xuất=0 trước BQGQ; hiển thị mã có phát sinh HOẶC tồn ≠0 |
| BR-STKV2-015 | AC-8 | Phân quyền ngang nhau |
| BR-STKV2-016 | (§7 Out of Scope) | Web-only trong W06 — không có AC mobile |

### FEAT-STK-DETAIL-V2 (v16)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-STKV2-001/002 | AC-5 | GT số/0 |
| BR-STKV2-005 | AC-7 | Xuất file bám mẫu `Báo cáo thẻ kho.xlsx` |
| **BR-STKV2-012** | **AC-1, AC-2** | Full-page (v8), không chọn mã trực tiếp, không chip Kho (v16); cột "Số phiếu" link điều hướng (v18) |
| **BR-STKV2-013** | **AC-3, AC-4** | Mỗi dòng=1 phiếu running; Đầu kỳ dòng đầu tra sổ tồn; **không dòng OB riêng** (v19, GAP-W06-GI-01) |
| BR-STKV2-014 | AC-5, AC-6 | GT Xuất theo BQGQ; dòng Tổng |
| BR-STKV2-015 | AC-8 | Phân quyền ngang nhau |
| BR-STKV2-016 | (§7 Out of Scope) | Web-only trong W06 — không có AC mobile |

### FEAT-INV-MOBILE-MENU (cross-wave state-matrix, không tính FEAT count)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-STKV2-016 + BR-INV-MENU-002 | (hub tile enable) | Thêm 1 tile "Tồn kho" (route → `StockAtDateReportPage`), tổng 6 tile W06 |

---

## §6 Error Code Mapping

> Nguồn canonical: `Product/Commons/ERROR-CODE-REGISTRY.md` v33. 3 FEAT trong wave này là **read-only report** — bề mặt lỗi hẹp hơn nhóm write-path (OB/IRV2/IDV2/PRC). Mã liệt kê dưới đây áp dụng trực tiếp hoặc gián tiếp (qua shared engine BR-STKV2-005a).

| Code | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|
| `ERR-CMN-010` | 200 | `EMPTY_STATE` | "Không có kết quả phù hợp" | Q1/Q2 không có mã nào khớp filter (EC-4 cả 2 FEAT) — text UI thực tế theo FEAT dùng "Không có dữ liệu" verbatim, cùng semantic `EMPTY_STATE` |
| `ERR-INV-036` | 400 (tại thao tác gốc, KHÔNG tại Q1/Q2/Q3) | — (write-path only) | "Không cho phép tồn âm — thao tác làm tồn kho xuống dưới 0 tại một thời điểm" | BR-STKV2-005a bước 4 — trigger khi FEAT-OB-*/FEAT-IRV2-*/FEAT-IDV2-*/BR-PRC-005 ghi/cascade, **KHÔNG** trigger tại 3 report này (read-only). Liệt kê ở đây vì BR-STKV2-005a nằm trong file, không phải vì Q1/Q2/Q3 throw mã này. |
| `ERR-INV-051` | 409 | `INLINE_FORM` | "Đang có thao tác tính giá khác xử lý cùng dữ liệu tồn kho — vui lòng thử lại sau" | BR-STKV2-005a ordered-lock cross-key timeout — trigger tại `gf-accounting` PRC gọi `W06-P5 bulk-recompute`, **KHÔNG** trigger tại 3 report này |
| `ERR-CMN-validation` | 400 | `INLINE_FIELD`/`INLINE_FORM` | (generic theo field) | REST adapter DTO validate — vd `asOfDate` thiếu/sai format ở Q1, `fromDate > toDate` ở Q2/Q3 (chưa có mã `ERR-INV-*` riêng đăng ký cho case này — dùng generic Common) |

**Không có mã lỗi riêng cho**: hide-rule OR (BR-STKV2-007/011 — business display logic, không phải validation error), phân quyền (BR-STKV2-015 — không phân biệt role nên không có lỗi 403 domain-specific), platform scope (BR-STKV2-016 — UI-layer gate, không phải server error).

**Gap chưa có mã đăng ký** (xem §7 OI-W06-BR-STKV2-002): row-cap export (Q1 50k / Q2 50k / Q3 10k, per PKG-W06 §2.2.2) — không giống `ERR-INV-045` (CAT/IR/ID export cap 1.000, dùng `DIALOG` chặn trước khi sinh file) — PKG chưa mô tả rõ hành vi khi vượt cap (chặn cứng hay truncate silent).

---

## §7 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W06-BR-STKV2-001 | ~~`source_sha` chưa được compute~~ **RESOLVED 2026-07-31** — orchestrator backfill `b115a1ee57dcd0214d89410b51a9ad68e36fd1c0830ef4d1e3cb9adb4cb671d7` vào frontmatter + §0. | RESOLVED — không còn block ACTIVE |
| OI-W06-BR-STKV2-002 | **Row-cap export chưa có mã lỗi đăng ký**: PKG-W06 §2.2.2 mô tả `W06-STK-EX1`/`EX2` cap 50k rows, `EX3` cap 10k rows, nhưng không cite mã lỗi khi vượt cap (khác với `ERR-INV-045` dùng cho CAT/IR/ID export cap 1.000). Cần BA/SA xác nhận: (a) chặn cứng trước khi sinh file (giống pattern `ERR-INV-045`, cần cấp mã mới hoặc reuse `ERR-INV-045`), hay (b) truncate silent tại row cap (không cần mã lỗi). Không block DEV W06 (row cap 50k/10k thực tế khó chạm ở garage-scale hiện tại) nhưng cần chốt trước GA. | MEDIUM — theo dõi, không block W06 |
| OI-W06-BR-STKV2-003 | **BR-STKV2-016 "mobile SUPPORTED" cho `stockLedgerAtDate` là UI-layer scope-guard, không phải server-side block**: BFF SDL (`agg-garage-graph-graphql.md` v7.79 §3j) expose cả `stockInoutSummary`/`stockCardDetail` mà không có `@FeatureOn` platform-check riêng cho mobile — nếu mobile client (hoặc client thứ 3) gọi trực tiếp 2 op này, BFF vẫn trả response hợp lệ (không 403/404). Đây là thiết kế chấp nhận được (API-level không cần phân biệt platform), nhưng flag để QA regression test không hiểu nhầm là bug nếu test trực tiếp GraphQL op ngoài UI flow. | LOW — thông tin cho QA, không phải gap nghiệp vụ |

---

## §8 References

- `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` v19 (nguồn canonical)
- `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v8
- `Product/features/FEAT-STK-LIST-V2.md` v10 · `FEAT-IP-VIEW-V2.md` v10 · `FEAT-STK-DETAIL-V2.md` v16
- `Product/epics/EP-INVENTORY-STOCK-V2.md` v10
- `Architecture/api/gf-inventory-api.md` v72 §0 Wave Index W06 + §3g Stock V2 Reports (W06-STK-Q1/Q2/Q3/EX1/EX2/EX3)
- `Architecture/api/agg-garage-graph-graphql.md` v7.79 §0 Wave Index W06 + §3j Stock V2 Reports
- `Architecture/data/gf-inventory-data-model.md` v30 §4b Inventory V2 — Opening Balance + Stock Ledger (`inventory_stock_ledger`, `opening_balance_line`) + §4c Receipt V2 + Delivery V2 (`receipt_line`/`delivery_line` nguồn Q3)
- `Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md` v7 — engine sổ tồn dùng chung, cascade algorithm, exception categories, ordered-lock
- `Product/Commons/ERROR-CODE-REGISTRY.md` v33 — §4 Inventory V2 (`ERR-INV-*`)
- `Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` — write-path cross-ref (5 tình huống (1))
- `Execution/wave-specs/W05/Product/business-rules/BR-GF-INVENTORY-RECEIPT-V2.md` / `BR-GF-INVENTORY-DELIVERY-V2.md` — write-path cross-ref (5 tình huống (2)(3)(4))
- `Execution/wave-specs/W06/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` (sibling spec, tác giả `exec-spec-br-accounting-period`) — write-path cross-ref BR-PRC-005 (5 tình huống (5))
- `Architecture/decisions/ADR-009.md` — JPA no relationship mapping (scalar FK)
- `Architecture/decisions/ADR-027-*.md` v5 / `ADR-028-*.md` v4 — BQGQ engine + Temporal async (nguồn giá trị PRC, đọc gián tiếp bởi Stock V2 reports)

---

## §9 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT W06 scoped spec cho `BR-GF-INVENTORY-STOCK-V2`. Verbatim copy toàn bộ rule từ nguồn v19 (1 CB + 16 BR: 5 nền tảng gồm 005a + 3 tồn-đến-ngày + 3 NXT + 3 thẻ kho + 1 phân quyền + 1 platform-scope). §3 Enforcement Layer nhấn mạnh 3 FEAT wave W06 là READ-ONLY consumer của sổ tồn/receipt-delivery line — write-path (BR-STKV2-001/005a) cross-reference sang wave-spec W04 (OB) / W05 (Receipt-Delivery) / W06 sibling (PRC) thay vì duplicate. §4 Test Ideas nhấn OB-in-range = Nhập kho (BR-STKV2-010, GAP-W06-GI-08 regression), thẻ kho không dòng OB riêng (BR-STKV2-013, GAP-W06-GI-01 regression), link "Số phiếu" điều hướng (BR-STKV2-012 v18), mobile scope-guard (BR-STKV2-016). §5 BR→FEAT→AC mapping cho 3 FEAT + cross-wave `FEAT-INV-MOBILE-MENU`. §6 Error code mapping — bề mặt lỗi hẹp (chủ yếu `ERR-CMN-010` empty-state; `ERR-INV-036`/`ERR-INV-051` liệt kê cho đầy đủ nhưng KHÔNG trigger tại 3 report này). 3 Open Item: `source_sha` pending compute (OI-001, blocking cho ACTIVE), row-cap export chưa có mã lỗi đăng ký (OI-002, medium), mobile SUPPORTED là UI-layer scope-guard không phải server block (OI-003, low, thông tin QA). |
