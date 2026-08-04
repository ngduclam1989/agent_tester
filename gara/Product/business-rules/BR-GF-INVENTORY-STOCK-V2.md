---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 7
tier: T1
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-06"
supersedes: "none"
---

# Business Rules — gf-inventory Stock V2 (Báo cáo tồn kho · NXT · Thẻ kho)

> Tập business rules V2 cho `EP-INVENTORY-STOCK-V2`. File **mới** (không thay thế BR cũ — baseline giữ nguyên). Dựa trên **cơ chế lưu tồn (sổ tồn)** (xem BR-STKV2-001/002).

---

## §1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-STKV2-001 | Báo cáo tồn/NXT/thẻ kho đọc sổ tồn tồn + dòng chi tiết phiếu nhập/xuất + tồn đầu kỳ (cùng boundary gf-inventory). Giá trị phụ thuộc kết quả BQGQ (PRC). | Nội bộ | `gf-inventory` | Đọc trực tiếp |

---

## §2 Rules Registry

### 2.1 Nền tảng & dùng chung (BR-STKV2-001 .. BR-STKV2-005a)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-001 | Báo cáo dựa trên **cơ chế lưu tồn (sổ tồn)**. Sổ tồn ghi nhận cho mỗi **(mã + kho + garage) tại mỗi ngày** có biến động hoặc baseline: **(a) biến động trong ngày** = tổng SL/GT nhập + tổng SL/GT xuất (phiếu cùng ngày cùng (mã+kho+gara) **gộp thành 1 điểm dữ liệu**); **(b) tồn cuối ngày** = SL/GT tồn sau khi đã ghi sổ toàn bộ phiếu trong ngày. **Ghi/cập nhật sổ tồn ở 5 tình huống**: (1) **Import tồn đầu kỳ (OB)** → ghi vào **bảng tồn đầu kỳ** (source); engine tính lại sổ tồn từ (bảng OB + phiếu detail) → sổ tồn phản ánh OB. Xóa/sửa OB (`FEAT-OB-DELETE-LINES` / `FEAT-OB-EDIT`) → thao tác ở bảng tồn đầu kỳ → engine tính lại. Sổ tồn là **projection** — không cần đánh dấu dòng OB trong sổ tồn. Xóa xong có thể import lại như lần đầu. (2) **Ghi sổ / bỏ ghi sổ phiếu nhập** → cập nhật biến động nhập + tồn cuối ngày. (3) **Ghi sổ / bỏ ghi sổ phiếu xuất** → cập nhật biến động xuất + tồn cuối ngày; GT xuất = 0 trước khi chạy BQGQ. (4) **Sửa / xóa phiếu** → cập nhật biến động ngày phiếu + **tự cập nhật tồn cuối ngày của mọi ngày về sau** cho (mã+kho+gara). (5) **Chạy BQGQ cuối kỳ** (BR-PRC-005) → điền đơn giá vốn xuất vào chi tiết phiếu xuất; sổ tồn cập nhật **GT xuất + GT tồn cuối** cho các ngày trong kỳ; **SL không đổi**. **Đọc sổ tồn**: **Tồn-đến-ngày D** = tồn cuối ngày của mốc gần nhất ≤ D (không cộng dồn từ đầu); **Tổng nhập/xuất khoảng [Từ, Đến]** = tổng biến động nhập/xuất trong khoảng. | System | **Write-path** (5 tình huống): `FEAT-OB-IMPORT` · `FEAT-OB-EDIT` · `FEAT-OB-DELETE-LINES` · `FEAT-IRV2-*` (ghi/bỏ ghi sổ + sửa/xóa phiếu nhập) · `FEAT-IDV2-*` (ghi/bỏ ghi sổ + sửa/xóa phiếu xuất) · `BR-PRC-005` (BQGQ). **Read-path**: `FEAT-STK-LIST-V2` · `FEAT-STK-DETAIL-V2` · `FEAT-IP-VIEW-V2`. |
| BR-STKV2-005a | **Quy tắc tính lại sổ tồn (áp chung mọi thao tác)**. **Nguồn dữ liệu**: engine đọc từ 2 source — **(a) Bảng tồn đầu kỳ** (OB: SL/GT tại "Tồn đến ngày" — điểm khởi đầu); **(b) Chi tiết phiếu nhập/xuất đã ghi sổ** (SL quy đổi ĐVT chính + GT theo ngày chứng từ). Phiếu **Nháp** không nằm trong source (chưa tác động tồn). Sổ tồn là **projection** — có thể rebuild hoàn toàn từ 2 source trên. **Algorithm**: khi bất kỳ thao tác nào (import/sửa/xóa OB, ghi sổ/bỏ ghi sổ phiếu, sửa/xóa phiếu **đã ghi sổ**, chạy BQGQ) làm thay đổi dữ liệu source tại ngày D của (mã+kho+gara), hệ thống: **(1)** Tính lại biến động ngày D từ source (tổng nhập + tổng xuất đã ghi sổ cùng ngày). **(2)** Tính lại tồn cuối ngày D = tồn cuối ngày trước D + biến động nhập D − biến động xuất D. **(3)** Lặp bước 2 cho **mọi ngày về sau D** cho cùng (mã+kho+gara): tồn cuối N = tồn cuối (N−1) + nhập N − xuất N — đến hết. **(4)** Check tồn âm point-in-time: nếu tồn cuối bất kỳ ngày nào < 0 → **chặn thao tác gốc** (`ERR-INV-036`). Tất cả 10 write-path (BR-IRV2-003/004/006, BR-IDV2-003/005/006, OB import/EDIT/DEL, BR-PRC-005) **gọi chung** quy tắc này — không implement riêng. | System / Shared | **10 write-path**: `FEAT-OB-IMPORT` · `FEAT-OB-EDIT` · `FEAT-OB-DELETE-LINES` · `FEAT-IRV2-*` (ghi sổ / bỏ ghi sổ / sửa / xóa phiếu nhập — BR-IRV2-003/004/006) · `FEAT-IDV2-*` (ghi sổ / bỏ ghi sổ / sửa / xóa phiếu xuất — BR-IDV2-003/005/006) · BQGQ (`BR-PRC-005`). |
| BR-STKV2-002 | **Số lượng tồn realtime**; **giá trị tồn = GT tồn đầu + GT nhập − giá vốn xuất** (giá vốn xuất = 0 nếu chưa chạy BQGQ) — luôn hiển thị **số (hoặc 0)**, **KHÔNG dùng chữ "Tạm tính"** trong ô (chỉ là ghi chú ngoài bảng). | Display / Calculation | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2 |
| BR-STKV2-003 | Báo cáo theo **(mã + kho + garage)** — **tách dòng theo kho**: 1 mã ở nhiều kho → nhiều dòng (không gộp kho). Khi lọc nhiều kho / tất cả kho vẫn tách theo kho. | Grouping | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2 |
| BR-STKV2-004 | **Không filter Garage** — garage xác định theo tài khoản/ngữ cảnh đăng nhập (tenant isolation). Bộ lọc chỉ gồm Kho + Mã/Tên nội bộ (+ ngày). | Tenant Isolation | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2 |
| BR-STKV2-005 | **Xuất file** = xuất đúng các cột đang hiển thị ra `.xlsx` theo bộ lọc hiện tại (không cần mẫu riêng). | Export | FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2 |

### 2.2 Báo cáo tồn kho đến ngày (BR-STKV2-006 .. BR-STKV2-008)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-006 | Báo cáo tồn kho theo **một mốc "đến ngày"** (D). **SL tồn = SL tồn của dòng sổ tồn gần nhất ≤ D** (tra cứu, realtime). Cột: Mã nội bộ / Tên SP / ĐVT chính / Kho / Số lượng tồn / Giá trị tồn + dòng Tổng. | Calculation | FEAT-STK-LIST-V2 |
| BR-STKV2-007 | Báo cáo hiển thị các mã có **SL tồn > 0 tại ngày đã chọn** (tồn biến theo ngày → căn theo bộ lọc ngày; cùng mã có thể hiện ở ngày này, ẩn ở ngày khác). | Filter | FEAT-STK-LIST-V2 |
| BR-STKV2-008 | Bộ lọc: search mã/tên + Kho (tất cả / nhiều kho) + Ngày (mốc "đến ngày"). | Search | FEAT-STK-LIST-V2 |

### 2.3 Báo cáo Nhập Xuất Tồn (BR-STKV2-009 .. BR-STKV2-011)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-009 | NXT theo **khoảng [Từ ngày, Đến ngày]**, **1 dòng / (mã + kho)**. Cột: Tồn đầu kỳ (SL, GT) / Nhập (SL, GT) / Xuất (SL, GT) / Tồn cuối (SL, GT) + dòng Tổng. | Calculation | FEAT-IP-VIEW-V2 |
| BR-STKV2-010 | Báo cáo NXT theo [Từ, Đến] **đọc trực tiếp từ sổ tồn**, KHÔNG đọc chi tiết phiếu nhập/xuất: **Tồn đầu kỳ** = tồn cuối ngày của mốc gần nhất ≤ (Từ ngày − 1); **Nhập trong kỳ** = tổng SL/GT nhập trong khoảng; **Xuất trong kỳ** = tổng SL/GT xuất trong khoảng; **Tồn cuối kỳ** = tồn cuối ngày của mốc gần nhất ≤ Đến ngày (bằng Đầu + Nhập − Xuất theo tính chất). **Lý do**: đảm bảo Báo cáo NXT và Báo cáo tồn-đến-ngày cùng đọc 1 nguồn — số tồn tại 1 mốc ngày không lệch giữa 2 báo cáo. | Calculation | FEAT-IP-VIEW-V2 |
| BR-STKV2-011 | Hiển thị mã có **phát sinh nhập/xuất trong kỳ HOẶC tồn đầu/cuối ≠ 0**. Dòng chưa chạy tính giá → **chỉ GT Xuất = 0** (giá vốn chưa chốt); **GT Tồn đầu / GT Nhập vẫn hiển thị giá trị thật**, **GT Tồn cuối = GT đầu + GT nhập − GT xuất (= GT đầu + GT nhập khi GT xuất = 0)**. Ghi chú ngoài bảng nhắc cần chạy tính giá. | Filter / Display | FEAT-IP-VIEW-V2 |

### 2.4 Thẻ kho — Xem lịch sử tồn kho (BR-STKV2-012 .. BR-STKV2-014)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-012 | Thẻ kho theo **1 mã + 1 kho**, mở dạng popup từ nút **"Xem lịch sử"** trên Báo cáo tồn kho (tự lấy mã + kho — **không chọn mã trực tiếp**). Bộ lọc: Kho + Từ ngày + Đến ngày. | Scope | FEAT-STK-DETAIL-V2 |
| BR-STKV2-013 | Mỗi dòng = **1 phiếu** (nhập/xuất ghi sổ) trong khoảng; cột **Đầu kỳ / Nhập kho / Xuất kho / Cuối kỳ** (SL + Giá trị) chạy **running** (Cuối kỳ dòng trước = Đầu kỳ dòng sau). **Đầu kỳ dòng đầu** = tra sổ tồn ≤ (Từ ngày − 1); nếu chưa có biến động trước đó → 0. | Calculation | FEAT-STK-DETAIL-V2 |
| BR-STKV2-014 | Dòng Tổng: Đầu kỳ (đầu khoảng) / Σ Nhập / Σ Xuất / Cuối kỳ (cuối khoảng). Giá trị cột **Xuất** dùng giá vốn BQGQ đã chốt; chưa chạy → **GT Xuất = 0** (kéo theo GT Cuối kỳ = GT Đầu + GT Nhập). **GT Đầu kỳ / GT Nhập vẫn là giá trị thật**. | Calculation | FEAT-STK-DETAIL-V2 |

### 2.5 Phân quyền (BR-STKV2-015)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STKV2-015 | 2 vai trò — chủ garage và kế toán — **quyền ngang nhau** trên toàn bộ báo cáo tồn / NXT / thẻ kho. | Permission | (toàn bộ feature) |

## §3 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo BR-GF-INVENTORY-STOCK-V2 (file mới) — 15 rule: cơ chế lưu tồn (sổ tồn), SL realtime + giá trị số/0 (không "Tạm tính"), tách dòng theo kho, không filter Garage, xuất file dump bảng; báo cáo tồn đến ngày (SL>0 theo ngày), NXT (đầu kỳ tra + nhập/xuất tính + cuối kỳ), thẻ kho (1 mã+kho running, popup từ Xem lịch sử). |
| 2026-06-15 | 2 | Business Authority | Sửa mâu thuẫn cách hiển thị giá trị khi chưa chạy BQGQ — thống nhất theo BR-STKV2-002 (Cách 1): **chỉ GT Xuất (giá vốn) = 0**, GT Tồn đầu / GT Nhập vẫn là giá trị thật, GT Tồn cuối = GT đầu + GT nhập − GT xuất. Cập nhật BR-STKV2-011 (NXT) và BR-STKV2-014 (thẻ kho) — bỏ cách diễn đạt "cả cột giá trị = 0". |
| 2026-06-15 | 3 | Business Authority | BR-STKV2-001: thêm **"chạy giá"** vào tác nhân cập nhật giá trị sổ tồn (BR-PRC-005) — chạy giá điền giá vốn xuất → tính lại giá trị tồn → báo cáo tự đúng. **Đổi thuật ngữ tiếng Anh sang "sổ tồn"** toàn file. |
| 2026-06-16 | 4 | Business Authority | Gỡ con trỏ intro tới `Plan/INVENTORY-V2-RULES.md` §7.1 (note file sắp xóa) → đổi sang tham chiếu nội bộ BR-STKV2-001/002. |
| 2026-07-02 | 6 | Business Authority | **Thêm BR-STKV2-005a — Quy tắc tính lại sổ tồn (shared engine)**: 4 bước (cập nhật biến động → tính lại tồn cuối D → lặp mọi ngày về sau → check tồn âm). Tất cả 9 write-path (OB import/sửa/xóa, ghi sổ/bỏ ghi sổ nhập/xuất, sửa/xóa phiếu, BQGQ) **gọi chung** quy tắc này. Heading §2.1 đổi ..005 → ..005a. |
| 2026-07-06 | 7 | Business Authority (in-session, user ninhnguyen) | **BR-STKV2-001 + BR-STKV2-005a cột "Features" enumerate FEAT ID** — thay "(toàn bộ)" / "(toàn bộ write-path)" (mơ hồ) bằng danh sách FEAT ID cụ thể. **BR-STKV2-001**: write-path 5 tình huống (`FEAT-OB-IMPORT/EDIT/DELETE-LINES` + `FEAT-IRV2-*` + `FEAT-IDV2-*` + `BR-PRC-005` BQGQ) + read-path 3 báo cáo (`FEAT-STK-LIST-V2` + `FEAT-STK-DETAIL-V2` + `FEAT-IP-VIEW-V2`). **BR-STKV2-005a**: 10 write-path (3 OB FEAT + `FEAT-IRV2-*` per BR-IRV2-003/004/006 + `FEAT-IDV2-*` per BR-IDV2-003/005/006 + BQGQ `BR-PRC-005`). Cải thiện traceability BR→FEAT. Clarification-only, không đổi behavior. |
| 2026-07-01 | 5 | Business Authority | **Refactor cơ chế sổ tồn (BR-STKV2-001 + BR-STKV2-010)** — sổ tồn ghi nhận **biến động ngày** (SL/GT nhập + xuất, gộp phiếu cùng ngày cùng (mã+kho+gara) thành 1 điểm dữ liệu) + **tồn cuối ngày**. **OB lưu tách biệt** khỏi biến động phiếu (xóa độc lập qua `FEAT-OB-DELETE-LINES`, xóa xong import lại như lần đầu). BQGQ cập nhật GT xuất + GT tồn cuối, SL không đổi. Sửa/xóa phiếu → tự cập nhật tồn cuối mọi ngày về sau. **BR-STKV2-010** đổi từ "Nhập/Xuất kỳ = tổng dòng chi tiết phiếu" → **đọc trực tiếp sổ tồn** để đảm bảo nhất quán với báo cáo tồn-đến-ngày. Wording ở tầng BA contract (biến động ngày, tồn cuối, điểm dữ liệu) — architect chốt schema/index/lock. |
