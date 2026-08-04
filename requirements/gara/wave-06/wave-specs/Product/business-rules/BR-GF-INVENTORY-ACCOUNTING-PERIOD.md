---
type: execution-spec
artifact_kind: business-rule
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W06"
last_reviewed: "2026-07-31"
source_ref: "Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md"
source_version: 40
source_sha: "888a5c60cc9a96754eed93604a50d434bfb09d290db94c7f822af7706f980976"  # backfilled by orchestrator 2026-07-31 (author session had no Bash tool)
generated_at: "2026-07-31T00:00:00+00:00"
boundary: "gf-accounting"
applies_to_feats:
  - FEAT-PRC-LIST
  - FEAT-PRC-CREATE
  - FEAT-PRC-DETAIL
  - FEAT-PRC-RECALC
  - FEAT-PRC-DELETE
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
---

# BR-GF-INVENTORY-ACCOUNTING-PERIOD — Wave W06 Scoped Spec

> **Phạm vi W06**: Nguồn canonical (v40) chứa **2 nhóm rule**: **Kỳ kế toán (BR-AP-001..016 + BR-AP-CMN-001)** và **Tính giá xuất kho / BQGQ (BR-PRC-001..018)**. W06 (`PKG-W06-inventory-pricing-stock-report`) chỉ deliver **5 FEAT nhóm PRC** (`FEAT-PRC-LIST` · `FEAT-PRC-CREATE` · `FEAT-PRC-DETAIL` · `FEAT-PRC-RECALC` · `FEAT-PRC-DELETE`) — nhóm Kỳ kế toán (`FEAT-AP-*`) **đã ship ở wave trước** và **không** thuộc phạm vi W06. Theo policy mode `business-rule` (chỉ giữ rule áp dụng cho FEAT trong wave), file này **verbatim copy toàn bộ BR-PRC-001..018** + giữ lại 2 rule cross-cutting trực tiếp liên quan PRC dù Features-tag gốc không chỉ FEAT-PRC: **CB-AP-001** (cross-boundary — mô tả đúng luồng REST PRC đọc Sổ tồn từ `gf-inventory`) và **BR-AP-CMN-002** (permission — Features column nguồn ghi rõ "toàn bộ feature AP + PRC"). **Loại bỏ khỏi §1** toàn bộ BR-AP-001..016 (Kỳ kế toán) + BR-AP-CMN-001 (Audit, chỉ `FEAT-AP-DETAIL`) — xem §7 OI-W06-BR-AP-002 cho pointer.
> Boundary primary: `gf-accounting` — **PRC master, NEW boundary trong W06** (per ADR-027/ADR-028, ratify `/arch-design W06` Round 1 2026-07-22). Cross-boundary consume: `gf-inventory` (đọc Sổ tồn SL + phiếu nhập/xuất khi chạy BQGQ, S2S x-api-key, 5 endpoint W06-P1..P5).
> Nhấn mạnh theo yêu cầu wave: **công thức BQGQ chỉ dùng phía nhập** (BR-PRC-001), **tồn đầu = tồn kho đến "Từ ngày" − 1** (BR-PRC-002/003), **không bắt tính tuần tự** (BR-PRC-006), **chạy nền — lưu phiếu trước tính sau** (BR-PRC-016), **tính lặp hội tụ tự tham chiếu** (BR-PRC-017, ADR-027 safety cap 100), **chặn kỳ đóng cho cả CREATE/RECALC/DELETE** (BR-PRC-008/011, `ERR-INV-024`), **chặn chạy trùng cùng kỳ+kho** (BR-PRC-016, `ERR-INV-029`), **2 scope RECALC** (`ALL`/`ERROR_ONLY`, BR-PRC-008), **3 lý do lỗi mã** (BR-PRC-007, `ERR-INV-030/031/052`).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` |
| Source version | 40 |
| Source SHA | `888a5c60cc9a96754eed93604a50d434bfb09d290db94c7f822af7706f980976` (backfilled 2026-07-31, xem §7 OI-W06-BR-AP-001 RESOLVED) |
| Generated at | 2026-07-31T00:00:00+00:00 |
| PKG | `PKG-W06-inventory-pricing-stock-report` (v8) |
| Parent EP | `EP-INVENTORY-ACCOUNTING-PERIOD` (v23, nhóm PRC) |
| Related ADRs | ADR-027 v5 (engine BQGQ 5-phase + tính lặp hội tụ, safety cap 100) · ADR-028 v4 (async execution HTTP 202 + Temporal workflow `PRC_TASK_QUEUE`, embedded `gf-accounting`) · ADR-004 (outbox/inbox) · ADR-009 (JPA no relationship mapping) |

---

## §1 Rule Statements (VERBATIM — W06 scope: nhóm PRC + 2 rule cross-cutting)

> **Filter áp dụng** (policy mode `business-rule`): giữ nguyên văn toàn bộ BR-PRC-001..018 (Features = FEAT-PRC-* — 100% trong W06). Giữ CB-AP-001 (cross-boundary — mô tả luồng REST PRC đọc gf-inventory) và BR-AP-CMN-002 (permission — Features cite explicit "toàn bộ feature AP + PRC"). **Loại bỏ** BR-AP-001..016 (Kỳ kế toán, Features = FEAT-AP-*, ngoài W06) + BR-AP-CMN-001 (Audit, chỉ FEAT-AP-DETAIL) — xem §7 OI-W06-BR-AP-002. Text dưới đây copy verbatim, không paraphrase.

### 1.1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-AP-001 | Kỳ kế toán do `gf-accounting` sở hữu (master); `gf-inventory` consume qua REST khi cần chặn phiếu nhập/xuất kho / import tồn đầu kỳ trong kỳ đóng và làm mốc cho báo cáo tồn/NXT. PRC BQGQ (thuộc `gf-accounting`) cross-boundary REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory`. | Cross-boundary | `gf-accounting` (owner Kỳ + PRC) ↔ `gf-inventory` (owner Sổ tồn SL + OB + phiếu nhập/xuất) | REST sync (gf-inventory → gf-accounting đọc Kỳ; gf-accounting → gf-inventory đọc Sổ tồn khi PRC BQGQ) |

### 1.2 Tính giá xuất kho (BR-PRC-001 .. BR-PRC-018)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-PRC-001 | **Đơn giá BQ = (Giá trị tồn đầu kỳ + Giá trị NHẬP trong kỳ) / (SL tồn đầu kỳ + SL nhập trong kỳ)** — chỉ dùng phía nhập, **KHÔNG** dùng giá vốn xuất (ngoại lệ: **"Xuất trả hàng mua"** là khoản **giảm-trừ phía nhập** — xem định nghĩa NHẬP). Tính theo **(Mã + Kho + Garage)**. **NHẬP trong kỳ (cả SL quy đổi và GT)** — phiếu **đã ghi sổ**, ngày chứng từ trong **[Từ ngày, Đến ngày]** = **Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua)**. **Giá trị kế thừa (KHÔNG theo đơn giá BQ kỳ này)**: **"Nhập hàng bán bị trả lại"**: dòng **"Tự nhập giá" KHÔNG tích** → giá trị nhập = giá vốn kế thừa từ phiếu **Xuất bán** gốc (do BQGQ ghi); dòng **"Tự nhập giá" tích** → **đơn giá nhập tay** (cơ chế: **BR-IRV2-031**); **"Xuất trả hàng mua"** kế thừa từ phiếu **Nhập mua** gốc (cơ chế: **BR-IDV2-030**). **Giá vốn xuất là output** = Đơn giá BQ × **SL quy đổi (của dòng xuất)**. **MỌI "SL" trong công thức PRC = SL quy đổi (ĐVT chính — đúng cột sổ tồn)**; **"GT" = tổng tiền tuyệt đối (VND)**. ⇒ **Đơn giá BQ ra theo ĐVT chính**, KHÁC "đơn giá nhập" trên phiếu (theo ĐVT nhập). *(Vd: nhập 10 thùng × 240.000 = GT 2.400.000; SL quy đổi 240 lon → đơn giá BQ = 2.400.000/240 = 10.000đ/lon; xuất 2 thùng = 48 lon → giá vốn = 10.000 × 48 = 480.000.)* Nếu **mẫu số (SL tồn đầu + SL nhập) = 0** (không tồn đầu và không nhập trong kỳ) → **đơn giá BQ = 0** (không phải lỗi). | Calculation | FEAT-PRC-CREATE, FEAT-PRC-RECALC |
| BR-PRC-002 | **SL tồn đầu kỳ** = **số lượng tồn kho** của mặt hàng theo (Mã + Kho + Garage), tính đến **hết ngày "Từ ngày" − 1** (SL quy đổi theo ĐVT chính — đúng cột sổ tồn). **GT tồn đầu kỳ** = **giá trị tồn kho** của mặt hàng theo (Mã + Kho + Garage), tính đến **hết ngày "Từ ngày" − 1** (tiền tuyệt đối VND). Phiếu đúng ngày "Từ ngày" đã thuộc "trong kỳ", **không** tính vào tồn đầu (tránh đếm trùng). | Calculation | FEAT-PRC-CREATE |
| BR-PRC-003 | **Điểm bắt đầu mỗi lần tính** = **tồn đầu kỳ (SL, GT)** theo BR-PRC-002 (tồn kho đến hết "Từ ngày" − 1), theo từng mã độc lập (không theo kỳ lịch). **Đơn giá bình quân** là **kết quả của lần chạy giá = (GT tồn đầu + GT nhập) / (SL tồn đầu + SL nhập)** (BR-PRC-001), suy ra khi cần hiển thị — **không** phải một số được lưu để tính kỳ sau (kỳ sau tự lấy lại tồn kho đến "Từ ngày" − 1 của kỳ đó). | Calculation | FEAT-PRC-CREATE |
| BR-PRC-004 | **Tồn cuối kỳ (SL, GT)** = số lượng tồn thực cuối kỳ và giá trị tồn tương ứng **sau khi chạy giá**. Lần tính kế tiếp **tự lấy tồn đầu theo tồn kho đến "Từ ngày" − 1** (BR-PRC-002) — đã gồm mọi biến động (nhập/xuất) của các kỳ trước, kể cả kỳ chưa tính giá (phiếu xuất chưa tính → tiền vốn = 0, GT tồn vẫn phản ánh đúng). | System | FEAT-PRC-CREATE, FEAT-PRC-RECALC |
| BR-PRC-005 | Sau khi tính: **(1) Cập nhật phiếu xuất** — điền **giá vốn = Đơn giá BQ × SL quy đổi (ĐVT chính)** vào các phiếu **Xuất bán / Xuất sửa chữa / Xuất khác** trong kỳ/kho của các mã thuộc phạm vi chạy (đang 0). **Riêng "Xuất trả hàng mua" KHÔNG tính theo đơn giá BQ** — tiền vốn **kế thừa từ phiếu nhập mua gốc**, là **khoản giảm-trừ phía nhập** (BR-PRC-001), không phải COGS (cơ chế kế thừa: **BR-IDV2-030**). **(2) Cập nhật sổ tồn** → **gọi quy tắc tính lại sổ tồn (BR-STKV2-005a)** — engine tính lại **giá trị tồn** (GT) của (mã+kho+garage) từ kỳ được tính trở đi (SL không đổi, chỉ GT vì giá vốn xuất vừa thay đổi); nhờ đó **báo cáo tồn / NXT tự cập nhật** theo giá vốn vừa chốt. **(3) Ghi/cập nhật log lần tính**: CREATE ghi log lần tính; RECALC cập nhật log hiện tại theo BR-PRC-008/016. ("Số phiếu xuất cập nhật" = số phiếu xuất được điền giá vốn.) | Stock Impact | FEAT-PRC-CREATE, FEAT-PRC-DETAIL |
| BR-PRC-006 | **KHÔNG bắt tính tuần tự**: tính giá **kỳ nào cũng được**, không cần tính các kỳ trước — vì **tồn đầu lấy theo tồn kho đến "Từ ngày" − 1** (BR-PRC-002) → đã phản ánh mọi biến động nhập/xuất của các kỳ trước (kể cả kỳ chưa tính giá: phiếu xuất chưa tính → tiền vốn = 0). *(Bỏ chặn cũ + mã lỗi `ERR-INV-028`.)* | Validation | FEAT-PRC-CREATE |
| BR-PRC-007 | Mã **chạy giá lỗi** → KHÔNG cập nhật giá vốn phiếu + KHÔNG cập nhật giá trị tồn cho mã đó; hiển thị ngay trong bảng chi tiết/log lỗi của lần tính bằng **"Trạng thái" = "Lỗi"** + cột **"Lí do lỗi"**; **không** có bảng lỗi riêng / cột **"Hướng xử lý"**. Các mã khác vẫn hoàn tất. **Lí do lỗi là enum (3 giá trị, v30):** (1) **"Do tồn âm"** — mã lỗi **`ERR-INV-030`** — SL tồn của mã trong kỳ bị **âm** (xuất vượt tồn) tại thời điểm bất kỳ / cuối kỳ → **đang áp dụng**; (2) **"Lệch hạch toán"** — mã lỗi **`ERR-INV-031`** — **[MỞ RỘNG TƯƠNG LAI]**: module hạch toán **chưa triển khai** nên **chưa bắt** lý do này; (3) **"Do sự cố hệ thống"** — mã lỗi **`ERR-INV-052`** — mã **chưa tới lượt tính** khi lần tính bị **job gián đoạn / hết retry** và log tự chốt "Hoàn thành có lỗi" (BR-PRC-014, BR-PRC-016) — **không phải lỗi nghiệp vụ dữ liệu**, chỉ cần bấm "Tính lại toàn bộ" (`FEAT-PRC-RECALC` AC-1) là tính lại bình thường; đồng thời mã này vẫn là dòng **"Trạng thái" = "Lỗi"** nên **tự động được cover** bởi nút "Tính lại mã lỗi" (AC-1b, scope `ERROR_ONLY`) mà không cần thêm logic riêng. (Mẫu số = 0 → đơn giá BQ = 0 theo BR-PRC-001, **không** tính là lỗi.) *(Thay mã lỗi chung `ERR-INV-027` cũ bằng enum lý do lỗi chi tiết.)* **Lưu ý:** tồn âm **đã bị chặn point-in-time ở MỌI thao tác chạm tới tồn** — tạo / sửa / **lùi ngày** / xóa phiếu (BR-IDV2-004/006, BR-IRV2-008), import / **xóa OB** (BR-OB-015, BR-OB-DEL-003), **bỏ ghi sổ** phiếu phụ thuộc. Do đó lý do **"Do tồn âm"** tại bước tính giá là **kiểm tra phòng vệ (invariant)** — về nguyên tắc **không xảy ra**; nếu xảy ra là dấu hiệu **dữ liệu bất thường / lỗi hệ thống** cần rà soát, **không** phải đường đi thường. | Error Handling | FEAT-PRC-CREATE, FEAT-PRC-DETAIL, FEAT-PRC-RECALC |
| BR-PRC-008 | **Tính lại (RECALC)** hỗ trợ **2 scope** (v28 — mirror FEAT-PRC-RECALC AC-1/AC-1b): **`ALL`** — chạy lại theo scope gốc của log; nếu log gốc là **"Tất cả mã"** thì server resolve lại toàn bộ mã BQGQ **"Đang hoạt động"** của garage theo predicate nguồn mã đã lưu, nếu log gốc là **"Chọn mã cụ thể"** thì chạy lại danh sách mã đã chọn đã lưu sau khi revalidate trạng thái **"Đang hoạt động"**; **`ERROR_ONLY`** — chạy lại **chỉ các mã trạng thái "Lỗi"** đã lưu trong log đó sau khi revalidate trạng thái **"Đang hoạt động"** (nút "Tính lại mã lỗi", mã "Đã tính" giữ nguyên không recompute). Scope thực tế sau revalidate chỉ gồm mã còn **"Đang hoạt động"**. Cả 2 scope: **cập nhật kết quả trên lần tính hiện tại** — ghi đè kết quả tính + cập nhật lại giá vốn phiếu xuất + **giá trị sổ tồn** (BR-PRC-005); thông tin **người thực hiện / ngày giờ thực hiện / scope / trạng thái** phản ánh lần chạy gần nhất. **Chặn tính giá nếu kỳ đã đóng — cả tính lần đầu (CREATE) lẫn RECALC** → mã lỗi **`ERR-INV-024`** (đóng kỳ = đã chốt số liệu; **phải tính giá TRƯỚC khi đóng kỳ**); nhưng đóng kỳ **KHÔNG vĩnh viễn** — **mở lại kỳ** (BR-AP-011) bất kỳ lúc nào để tính / tính lại. Tính lại kỳ N → các kỳ sau cần tính lại (BR-PRC-015). | Recalc | FEAT-PRC-RECALC, FEAT-PRC-DETAIL |
| BR-PRC-009 | Chọn **kỳ kế toán** → tự điền Từ/Đến, **khóa không sửa**. Chọn phạm vi mã theo 1 trong 2 cách: **"Tất cả mã"** / **"Chọn mã cụ thể"**. **Nguồn mã lấy từ danh mục vật tư hàng hóa (Mã sản phẩm nội bộ) thuộc garage hiện tại**, lọc **"Phương pháp tính giá" = "Bình quân cuối kỳ"** và **"Trạng thái" = "Đang hoạt động"** (BR-PRC-012); **kỳ/kho/khoảng ngày không dùng để lọc danh sách mã từ catalog**, mà là ngữ cảnh tính giá theo (Mã + Kho + Garage). Với **"Tất cả mã"**, form không đổ toàn bộ mã vào bảng, server resolve mã đủ điều kiện khi chạy và log chỉ bắt buộc lưu tổng hợp + mã lỗi. Với **"Chọn mã cụ thể"**, người dùng thêm mã qua nút **"Thêm phụ tùng"**; dropdown chỉ liệt kê mã đủ điều kiện và log lưu danh sách mã đã chọn. Tại thời điểm job bắt đầu, scope thực tế chỉ gồm các mã còn **"Đang hoạt động"** — nếu mã cụ thể đã chọn chuyển **"Ngừng hoạt động"** trước khi job bắt đầu thì hệ thống tự bỏ qua + hiển thị **toast cảnh báo** "**Đã bỏ qua N mã do ngừng hoạt động**" (N = số mã stale, lấy từ field `warningsSkippedItems`), **không** hiển thị như dòng **"Lỗi"**. Mỗi lần **Thực hiện tính giá** ghi **log lần tính** (tài khoản thực hiện + ngày giờ); RECALC cập nhật thông tin lần chạy gần nhất trên log hiện tại theo BR-PRC-008/016. | Form / Audit | FEAT-PRC-CREATE, FEAT-PRC-LIST |
| BR-PRC-010 | Bấm **"Tính giá"** lại cùng phạm vi (kỳ + kho + khoảng) đã có log → **tạo log lần tính mới chồng lên**; tính lại từ DETAIL cập nhật kết quả trên lần tính hiện tại theo BR-PRC-008/016. | History | FEAT-PRC-LIST, FEAT-PRC-CREATE |
| BR-PRC-011 | **Xóa log tính giá**: **KHÔNG rollback** giá vốn đã cập nhật (phiếu xuất giữ giá vốn). **Chặn xóa nếu kỳ đã đóng** → mã lỗi **`ERR-INV-024`** (kỳ đóng = đã chốt số liệu chính xác). **Chặn xóa nếu log đang "Đang tính"** (job nền CREATE/RECALC chưa xong) → mã lỗi **`ERR-INV-029`** (đợi hoàn tất rồi mới xóa — tránh xóa bản ghi đang được cập nhật). | Delete Guard | FEAT-PRC-DELETE |
| BR-PRC-012 | Lần tính BQGQ **chỉ áp cho mã có "Phương pháp tính giá" = "Bình quân cuối kỳ"** (thiết lập tại danh mục Mã sản phẩm nội bộ — `BR-CAT-PROD-010`) và **"Trạng thái" = "Đang hoạt động"** (`BR-CAT-PROD-007/008`). Phạm vi chạy PRC luôn được xác định bằng tập mã BQGQ **"Đang hoạt động"** tại thời điểm job bắt đầu. | Validation | FEAT-PRC-CREATE, FEAT-PRC-RECALC |
| BR-PRC-013 | **Làm tròn**: **Đơn giá BQ làm tròn về 2 chữ số thập phân NGAY SAU KHI TÍNH** — và **dùng chính giá trị đã làm tròn (2 lẻ) này để tính tiền vốn** (không giữ full precision). **Tiền vốn từng dòng phiếu xuất = đơn giá BQ (2 lẻ) × SL quy đổi**, rồi **làm tròn về đơn vị đồng (VND — 0 chữ số thập phân)**; thành tiền, giá trị tồn cũng làm tròn về đồng khi ghi sổ. Cột **"Giá bình quân"** (FEAT-PRC-DETAIL) hiển thị **đúng giá trị 2 chữ số thập phân** này. | Calculation | FEAT-PRC-CREATE, FEAT-PRC-RECALC, FEAT-PRC-DETAIL |
| BR-PRC-014 | **Trạng thái lần tính** (cấp log) có **3 giá trị**: **"Đang tính"** (transient — vừa lưu phiếu, đang chạy giá nền; **có bảo đảm thoát, không kẹt vĩnh viễn** — xem BR-PRC-016), **"Thành công"** (mọi mã trong phạm vi tính xong, không lỗi), **"Hoàn thành có lỗi"** (≥1 mã có trạng thái **"Lỗi"** — **gồm cả trường hợp toàn bộ mã lỗi**, **và trường hợp job nền bị gián đoạn / hết retry** → chốt "Hoàn thành có lỗi"; mã **chưa tới lượt tính** khi log chốt → gán trạng thái **"Lỗi"** với lý do **"Do sự cố hệ thống"** (`ERR-INV-052`, BR-PRC-007) để **giải kẹt, cho chạy lại** — BR-PRC-016). **Không có trạng thái "Thất bại" riêng** (toàn bộ lỗi vẫn là "Hoàn thành có lỗi"). Mỗi mã có trạng thái riêng: **"Đang tính" → "Đã tính" / "Lỗi"**. | Status | FEAT-PRC-DETAIL, FEAT-PRC-LIST |
| BR-PRC-015 | **Tính / tính lại một kỳ ảnh hưởng các kỳ sau đã tính**: vì **tồn cuối kỳ là đầu vào cho kỳ sau** (BR-PRC-002/004), tính/tính lại kỳ N → giá trị sổ tồn cascade lan tới các kỳ sau → các kỳ sau đã tính **cần tính lại**. Hệ thống **cảnh báo**; người dùng **tự chạy lại** (theo BR-PRC-008 / mở lại kỳ nếu đã đóng). | Recalc | FEAT-PRC-RECALC, FEAT-PRC-DETAIL |
| BR-PRC-016 | **Lưu phiếu trước, chạy giá nền sau**: khi bấm "Thực hiện tính giá", hệ thống **ghi ngay bản ghi lần tính** (kỳ, kho, khoảng ngày, scope mã, người thực hiện, thời điểm; nếu scope **"Tất cả mã"** thì lưu predicate nguồn mã = garage hiện tại + phương pháp BQGQ + trạng thái **"Đang hoạt động"**, nếu scope **"Chọn mã cụ thể"** thì lưu danh sách mã đã chọn) với trạng thái **"Đang tính"** → rồi **chạy tính BQGQ từng mã** (tác vụ nền **chạy phía server, độc lập với client** — user tắt máy/đóng trình duyệt **không dừng job**; mở lại màn Chi tiết sau đó vẫn thấy đúng tiến độ hiện tại (đọc từ trạng thái lưu ở server, không phụ thuộc phiên trình duyệt); có thể lâu; mã có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu → vòng tính của mã gồm **nhiều lượt lặp đến hội tụ** — BR-PRC-017). Với scope **"Tất cả mã"**, server resolve danh sách mã đủ điều kiện ở thời điểm job bắt đầu và log chỉ bắt buộc lưu **tổng hợp + danh sách mã lỗi**, không bắt buộc lưu toàn bộ mã thành công. Với scope **"Chọn mã cụ thể"** hoặc RECALC `ERROR_ONLY`, server revalidate trạng thái mã ở thời điểm job bắt đầu và chỉ chạy các mã còn **"Đang hoạt động"**. Khi một mã đã **chốt giá cuối** (bao gồm các vòng tính lặp BR-PRC-017 nếu có) thì **cập nhật kết quả mã đó** (giá vốn phiếu xuất + giá trị sổ tồn), đồng thời cập nhật tổng hợp/log lỗi; xong toàn bộ → chốt trạng thái lần tính (BR-PRC-014). **Tính lại (RECALC) dùng cùng cơ chế chạy nền** (bản ghi đã tồn tại): chuyển log về **"Đang tính"** → với log có chi tiết mã thì **ghi đè kết quả từng mã tại chỗ** (mã chưa tới lượt **giữ số cũ** để tham chiếu, **KHÔNG xóa trắng trước**); với log **"Tất cả mã"** không lưu toàn bộ mã thành công thì cập nhật tổng hợp + mã lỗi. Trạng thái từng mã/lỗi lật "Đang tính → Đã tính / Lỗi" khi tính tới → chốt trạng thái cuối. Thông tin **người thực hiện / ngày giờ thực hiện / scope / trạng thái** của log phản ánh lần chạy gần nhất. **Chặn chạy trùng**: khi đang có một lần tính **"Đang tính"** cho cùng **(kỳ + kho)** → **chặn mọi thao tác chạy giá khác trên cùng (kỳ + kho)** — gồm **tạo lần tính mới (CREATE)** *và* **tính lại (RECALC)** — → mã lỗi **`ERR-INV-029`** (tránh 2 job cùng cập nhật giá vốn/sổ tồn của một kho). **Chống kẹt "Đang tính" (giải deadlock):** durable execution (Architecture) bảo đảm job **không treo vĩnh viễn** — crash → **tự resume từ checkpoint** đến khi xong; **hết retry / không phục hồi được → tự chốt log về "Hoàn thành có lỗi"** (lý do "job gián đoạn"), **mở khóa** cho chạy lại (gỡ `ERR-INV-029`). Do đó **"Đang tính" luôn thoát về trạng thái cuối** ("Thành công" / "Hoàn thành có lỗi") — không có ca kẹt khiến vừa không chạy lại được (BR-PRC-016) vừa không xóa được (BR-PRC-011). *(Chi tiết durable execution thuộc Architecture — Product chỉ đặc tả trạng thái cuối + hành vi cho chạy lại.)* | Concurrency / System | FEAT-PRC-CREATE, FEAT-PRC-DETAIL, FEAT-PRC-RECALC |
| BR-PRC-017 | **Tính lặp khi có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu cùng kỳ**: GT/đơn giá nhập của phiếu **"Nhập hàng bán bị trả lại"** (kế thừa) = **giá vốn xuất của phiếu Xuất bán gốc** (BR-IRV2-031); khi phiếu Xuất bán đó **thuộc cùng kỳ đang tính** → giá vốn xuất bán lại là **output của BQGQ** ⇒ **phụ thuộc vòng**. Xử lý **tính lặp (per mã + kho)** trong **bộ tính tạm**: **(1)** tính **đơn giá BQ** với GT/SL nhập hiện có; **(2)** tính **tạm** giá vốn các phiếu Xuất bán = đơn giá BQ × SL quy đổi (làm **trước** — lưu ý thứ tự); **(3)** tính lại / ghi nhận **tạm** đơn giá/GT các dòng phiếu **"Nhập hàng bán bị trả lại"** có **"Tự nhập giá" KHÔNG tích** = giá vốn **đơn vị** của phiếu Xuất bán gốc; **(4)** GT/SL nhập tạm đổi → tính lại đơn giá BQ; **lặp (2)–(4) đến khi đơn giá BQ sau làm tròn 2 chữ số thập phân của vòng hiện tại bằng vòng liền trước** → chốt **Giá bình quân cuối**. **Chỉ sau khi đã hội tụ/chốt giá**, hệ thống mới cập nhật kết quả nghiệp vụ theo quy trình tổng: cập nhật giá vốn phiếu xuất → cập nhật đơn giá/GT phiếu nhập hàng bán bị trả lại kế thừa (nếu có) → gọi rule cập nhật sổ tồn (BR-PRC-005/016). **Không hiểu bước (2)–(4) là persist DB nghiệp vụ ở từng vòng lặp**. **Chỉ kích hoạt với mã có dòng phiếu trả "Tự nhập giá" KHÔNG tích** (đơn giá để hệ thống cập nhật); dòng **"Tự nhập giá" tích** (nhập đơn giá tay) → GT cố định, **KHÔNG lặp**. Hội tụ được **bảo đảm** (đóng góp phiếu trả co theo hệ số < 1) → **KHÔNG đặt số vòng tối đa**, chạy đến hội tụ. *(Chiều "Xuất trả hàng mua ← Nhập mua" KHÔNG gây vòng — giá nhập mua là input đã biết. Chống treo do dữ liệu bất thường thuộc Architecture — như BR-PRC-016.)* | Calculation / Iteration | FEAT-PRC-CREATE, FEAT-PRC-RECALC |
| BR-PRC-018 | Danh sách lịch sử tính giá (`FEAT-PRC-LIST`) mặc định sắp xếp theo **"Ngày giờ thực hiện" giảm dần** để lần chạy mới nhất nằm trên đầu. Nếu 2 log có cùng thời điểm hiển thị, tie-break bằng thứ tự tạo log giảm dần (log tạo sau đứng trước). | Display / Sort | FEAT-PRC-LIST |

### 1.3 Phân quyền (W06 subset)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-AP-CMN-002 | Hệ thống có 2 vai trò — **chủ garage** và **kế toán** — với **quyền ngang nhau** trên toàn bộ danh mục kỳ kế toán (xem / tạo / sửa / đóng-mở / xóa) **và chức năng tính giá xuất kho (PRC)** (tạo / xem / tính lại / xóa log). | Permission | (toàn bộ feature AP + PRC) |

> **Ghi chú (không sửa nguồn, chỉ pointer)**: BR-PRC-008/011 cite chéo **BR-AP-011** ("mở lại kỳ") và mã lỗi `ERR-INV-024` cite chéo **BR-AP-012** (kỳ đóng chặn phiếu nhập/xuất + tính giá) — 2 rule này thuộc nhóm Kỳ kế toán §2.1 nguồn, **ngoài phạm vi W06** (đã ship wave trước qua `FEAT-AP-EDIT`), nên **không** verbatim copy lại ở đây; text đầy đủ của BR-PRC-008/011 ở trên đã tự chứa đủ ngữ nghĩa cross-reference cần cho DEV W06.

---

## §2 Rationale (VERBATIM — trích header + preamble nguồn)

> Trích nguyên văn từ header + preamble nguồn canonical.

**Note tên file legacy**: file này quản lý business rules cho Kỳ kế toán (BR-AP-*) + Tính giá xuất kho (BR-PRC-*) — nay thuộc `boundary: gf-accounting` (Kỳ + BQGQ là nghiệp vụ kế toán, khớp pattern ERP truyền thống SAP FI-CO / Misa / Fast / Odoo). Tên `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` giữ nguyên legacy để tránh cascade break reference từ EP/FEAT/KG/HLD/PKG. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16.

Tập business rules cho `EP-INVENTORY-ACCOUNTING-PERIOD`. File **mới**, không thay thế `BR-GF-INVENTORY.md` (**Kỳ kế toán ≠ kỳ kho** — rule kỳ kho cũ ở BR-IP-* giữ nguyên). Gồm 2 nhóm rule: **Kỳ kế toán (BR-AP)** + **Tính giá xuất kho (BR-PRC)** — cả 2 đã đặc tả đầy đủ.

---

## §3 Enforcement Layer

### 3.1 Tổng quan phân lớp

| Layer | Vai trò | Rules chính |
|---|---|---|
| Domain (`gf-accounting` — `app/service`, `PriceCalcRunService`) | **PRIMARY** — enforce toàn bộ BR-PRC-*, lifecycle CREATE/RECALC/DELETE, ghi log lần tính, validate scope/kỳ/kho | BR-PRC-001/002/006/008/009/010/011/012/014 |
| Temporal engine (`PriceCalcRunWorkflow`, task queue `PRC_TASK_QUEUE`, 7 activities — ADR-027 v5 + ADR-028 v4) | **PRIMARY cho engine BQGQ 5-phase + tính lặp hội tụ** — SnapshotPull → ComputeItem (per-item, tính lặp `SAFETY_ITERATION_CAP=100`) → BulkFillCost → BulkInheritCost → BulkRecomputeLedger → CommitRun; heartbeat 60s; durable resume-on-crash | BR-PRC-001/003/004/005/013/016/017 |
| Cross-boundary REST S2S client → `gf-inventory` (5 endpoint W06-P1..P5, x-api-key) | **PRIMARY cho snapshot + bulk write** — đọc Sổ tồn SL tại "Từ ngày−1" + enumerate phiếu trong kỳ + ghi giá vốn phiếu xuất + kế thừa giá phiếu trả + cascade sổ tồn | CB-AP-001, BR-PRC-002/005 |
| Domain (đọc bảng Kỳ kế toán nội bộ `gf-accounting`) | **PRIMARY cho lock-gate** — CREATE/RECALC/DELETE check `period.status` trong cùng transaction trước khi cho phép | BR-PRC-008 (`ERR-INV-024`), BR-PRC-011 (`ERR-INV-024`) |
| DB-level (JPA `ddl-auto=update` — **KHÔNG Flyway**, `gf-accounting-data-model.md` v14 §2quater) | Hard constraint — partial unique index chặn concurrent run, scale 2 cho đơn giá, enum status/scope/error_reason | BR-PRC-016 (concurrency), BR-PRC-013 (scale), BR-PRC-007/014 (enum) |
| REST adapter (`adapter/controller` — `PriceCalcRunController`) | Secondary — validate DTO shape, map exception → HTTP + `errorCode`, 202 Accepted kick-off semantics, Idempotency-Key window 5 phút | BR-PRC-009 (DTO scope/period), BR-PRC-016 (kick-off 202) |
| BFF (`agg-garage-graph`) | Defense-in-depth — resolver passthrough + enrichment (`executedByName` TENANT-USERS DataLoader), `@FeatureOn(Inventory:InventoryV2)` gate, error-code passthrough, Idempotency-Key arg→header forward | BR-PRC-009 (enrichment người thực hiện), BR-PRC-016 (Idempotency forward) |
| UI (`garage-web`, W06 web-only — PRC không có mobile scope) | Secondary — polling `pollInterval:5000` fixed khi status ∈ {PENDING,RUNNING}, Modal "Chạy tính giá" (Kỳ/Kho/scope/dropdown mã), toast wording verbatim, 2 nút RECALC (Tính lại toàn bộ / Tính lại mã lỗi), popup xóa log | BR-PRC-009 (form), BR-PRC-014/016 (polling UI theo trạng thái), BR-PRC-008 (2 nút RECALC), BR-PRC-011 (popup xóa) |

### 3.2 Chi tiết enforcement per rule

#### Cross-boundary

| Rule | Primary layer | Cơ chế |
|---|---|---|
| CB-AP-001 | Cross-boundary REST S2S (`gf-accounting → gf-inventory`, x-api-key, ADR-027 Phase 1) | `GET /protected/v1/stock-ledgers/at-date` (W06-P1, batch snapshot ≤200 productCodes/req) + `POST /protected/v1/slips-in-period/search` (W06-P2, enumerate phiếu nhập/xuất) — gọi tại Phase 1 (SnapshotPull activity) của mọi lần CREATE/RECALC. |

#### Tính giá xuất kho (BR-PRC-001 .. BR-PRC-018)

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-PRC-001 | Temporal `ComputeItemActivity` (ADR-027 §Engine BQGQ) | Per (mã+kho+garage): `avgPrice = (openingValue + receiptValue) / (openingQty + receiptQty)`; mẫu số=0 → 0; NHẬP = Σ(Nhập mua+Nhập hàng bán bị trả lại+Nhập khác) − Σ(Xuất trả hàng mua); giá vốn xuất = avgPrice × deliveryQty (trừ Xuất trả hàng mua kế thừa). |
| BR-PRC-002 | Temporal `SnapshotPullActivity` qua S2S W06-P1 | `asOfDate = fromDate - 1` gọi `/stock-ledgers/at-date`; SL/GT tồn đầu tách riêng field. |
| BR-PRC-003 | Temporal engine (derive-at-read) | `average_unit_price` KHÔNG lưu làm input kỳ sau — mỗi run tự query lại tồn kho sống tại `fromDate-1`. |
| BR-PRC-004 | Temporal engine + `gf-inventory` sổ tồn sống | Tồn cuối không snapshot riêng trên `price_calc_run`; kỳ sau tự truy vấn qua W06-P1 tại thời điểm chạy đó. |
| BR-PRC-005 | Temporal `BulkFillCostActivity` (W06-P3) + `BulkInheritCostActivity` (W06-P4) + `BulkRecomputeLedgerActivity` (W06-P5) | Chunk ≤500 lines/request, `X-Idempotency-Key: PRC-{runId}-{PHASE}-{chunkIdx}`; W06-P5 sync blocking ≤60s cascade GT sổ tồn từ `fromDate`. |
| BR-PRC-006 | Domain + Temporal (không có guard tuần tự) | Không check `period` trước đó có run hay chưa trước khi cho phép CREATE — chỉ check `period.status` hiện tại (BR-PRC-008). |
| BR-PRC-007 | Temporal `ComputeItemActivity` + entity `price_calc_run_item.error_reason` | Enum `NEGATIVE_STOCK` (`ERR-INV-030`) / `ACCOUNTING_MISMATCH` (`ERR-INV-031`, chưa implement) / `SYSTEM_ERROR` (`ERR-INV-052`, gán khi CommitRun chốt log với mã chưa tới lượt); item lỗi giữ nguyên `status=ERROR`, không gọi BulkFillCost cho item đó. |
| BR-PRC-008 | Domain (`PriceCalcRunController` W06-4) + entity `source_run_id` | `runScope ∈ {ALL, ERROR_ONLY}` param body; copy-forward Phase 0 predicate/list từ run gốc; period-status check trong cùng tx → `ERR-INV-024`; row mới `source_run_id` trỏ run gốc. |
| BR-PRC-009 | REST adapter (W06-3 request DTO) + BFF `priceCalcItemsForCogsLookup` (W06-6) | `scope ∈ {ALL, SPECIFIC}`; `SPECIFIC` yêu cầu `items[]` ≤500; dropdown lookup cross-boundary compose `gf-erp-mdm` catalog + `gf-inventory` slip count; toast `warningsSkippedItems` field trong response. |
| BR-PRC-010 | Domain (INSERT mới mỗi lần CREATE) | Không UPDATE log cũ khi CREATE mới cùng phạm vi — luôn tạo row `price_calc_run` mới. |
| BR-PRC-011 | Domain (`DELETE` W06-5) + entity soft-delete | `deleted_at/by` set, KHÔNG xóa cứng, KHÔNG rollback `delivery_line.cost_*`; guard `period.status=CLOSED` → `ERR-INV-024`; guard `status ∈ {PENDING,RUNNING}` → `ERR-INV-029`; idempotent repeat-delete → 200 cached. |
| BR-PRC-012 | Cross-boundary lookup `gf-erp-mdm` catalog (W06-6) + Domain filter | Query catalog `WHERE pricing_method='PWA' AND status='ACTIVE'`; scope resolve luôn filter lại tại thời điểm job bắt đầu (không dùng cache catalog cũ). |
| BR-PRC-013 | Temporal `ComputeItemActivity` — `RoundingMode.HALF_UP`, `scale=2` | `average_unit_price DECIMAL(scale=2)`; `cost_value = round(avgPrice(2dp) × qty, 0)` VND. |
| BR-PRC-014 | Entity `price_calc_run.status` enum `PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS` (BE 4 giá trị, UI gộp `PENDING+RUNNING` = "Đang tính" 3 UI state) | `CommitRunActivity` chốt status cuối cùng dựa trên `items_resolved/done/error_count`. |
| BR-PRC-015 | Domain (response field `affectedSubsequentPeriods[]`) | W06-4 RECALC response liệt kê kỳ sau đã tính cần tính lại — chỉ cảnh báo, không tự cascade. |
| BR-PRC-016 | REST adapter (202 kick-off, W06-3/W06-4) + Temporal `WorkflowClient.start()` + DB `uidx_prc_active_lock` partial unique + Idempotency-Key 5-phút window | INSERT `status=PENDING` → `WorkflowClient.start(workflowId=prc-{tenantId}-{runId}, taskQueue=PRC_TASK_QUEUE, WorkflowIdReusePolicy.REJECT_DUPLICATE, timeout=60min)`; concurrency 3-layer (DB `SELECT FOR UPDATE` + partial unique index `uidx_prc_active_lock(tenant_id,garage_id,warehouse_id,period_id) WHERE status IN ('PENDING','RUNNING')` + Temporal reuse-policy) → vi phạm `ERR-INV-029`; Temporal outage tại kick-off → 503 + compensating DELETE row. |
| BR-PRC-017 | Temporal `ComputeItemActivity` (per mã+kho, in-memory tạm tính, `has_self_reference` flag) | Vòng lặp (2)–(4) chỉ trong bộ tính tạm của activity, KHÔNG persist DB mỗi vòng; `SAFETY_ITERATION_CAP=100` (ADR-027) — vượt cap → item `ERROR`/`SYSTEM_ERROR`, KHÔNG hard-block toàn run; entity field `iterations_applied` ghi số vòng đã chạy. |
| BR-PRC-018 | REST adapter (W06-1 search) | `sort=executedAt,desc` mặc định; tie-break `id DESC` (log tạo sau đứng trước). |

#### Phân quyền

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-AP-CMN-002 | REST adapter / BFF | Endpoint auth scope `authenticated` — cả `garage-owner` + `accountant` pass full CRUD + Tính giá/Tính lại/Xóa log, không phân biệt role (Critical Rule #6). |

### 3.3 DB-level constraints (JPA `ddl-auto=update` — KHÔNG Flyway migration file, per `gf-accounting-data-model.md` v14 §2quater + Common Gotcha #5)

**Table `price_calc_run`**:

| Constraint | Detail |
|---|---|
| PK | `id` |
| Cột chính | `tenant_id, garage_id, period_id, period_name_snapshot, from_date, to_date, warehouse_id/code/name, pricing_method (PWA), scope (ALL\|SPECIFIC), scope_predicate (JSONB), items_snapshot (JSONB), source_run_id, status (PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS), temporal_workflow_id, progress_items_total/done, items_resolved/done/error_count, warnings_skipped_items, executed_by/at, completed_at, error_summary, deleted_at/by` |
| Partial UNIQUE | `uidx_prc_active_lock (tenant_id, garage_id, warehouse_id, period_id) WHERE status IN ('PENDING','RUNNING')` — Layer 3 concurrency guard (BR-PRC-016) |
| Soft-delete filter | `deleted_at IS NULL` mandatory trên mọi query (BR-PRC-011) |
| Index | `idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, executed_at DESC)` · `idx_prc_run_tenant_period (tenant_id, period_id, status)` |
| BR ref | BR-PRC-001/008/009/014/016 |

**Table `price_calc_run_item`**:

| Constraint | Detail |
|---|---|
| PK | `id` |
| Cột chính | `tenant_id, run_id, product_code/id/name, main_unit_code, opening_qty/value, receipt_qty/value, delivery_qty/value, average_unit_price (scale 2), updated_delivery_slip_count, status (RUNNING\|DONE\|ERROR), error_reason (NEGATIVE_STOCK\|ACCOUNTING_MISMATCH\|SYSTEM_ERROR), error_message, iterations_applied, has_self_reference, computed_at` |
| Uniqueness | `(tenant_id, run_id, product_code)` |
| Index | `idx_prc_item_error` partial `WHERE status='ERROR'` · `idx_prc_item_run (tenant_id, run_id, status)` · `idx_prc_item_run_product (tenant_id, run_id, product_code)` |
| BR ref | BR-PRC-005/007/013/017 |

---

## §4 Test Ideas

### TC-BR-GF-ACC-PRC — Cross-boundary

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-CB1-01 | CB-AP-001 | CREATE tính giá — engine gọi S2S `stock-ledgers/at-date` + `slips-in-period/search` tới `gf-inventory` | Happy | Snapshot đúng tồn đầu + đúng phiếu trong kỳ, dùng làm input BQGQ |
| TC-BR-GF-ACC-PRC-CB1-02 | CB-AP-001 | `gf-inventory` unreachable khi Phase 1 SnapshotPull | Edge | Activity retry theo Temporal policy; hết retry → item `SYSTEM_ERROR` (`ERR-INV-052`) chứ không crash toàn run |

### TC-BR-GF-ACC-PRC — Công thức BQGQ (BR-PRC-001/002/003/004/013/017)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-001-01 | BR-PRC-001 | Có tồn đầu + nhập trong kỳ, tính đơn giá BQ | Happy | `avgPrice = (openingValue+receiptValue)/(openingQty+receiptQty)`, đúng ví dụ thùng/lon |
| **TC-BR-GF-ACC-PRC-001-02** | **BR-PRC-001** | Mẫu số (SL tồn đầu + SL nhập) = 0 | **Edge** | `avgPrice = 0`, KHÔNG phải lỗi |
| TC-BR-GF-ACC-PRC-001-03 | BR-PRC-001 | Có dòng "Xuất trả hàng mua" trong kỳ | Happy | GT trừ khỏi NHẬP (giảm-trừ phía nhập), giá vốn dòng này kế thừa từ Nhập mua gốc — không theo avgPrice |
| TC-BR-GF-ACC-PRC-002-01 | BR-PRC-002 | Phiếu đúng ngày "Từ ngày" | Edge | KHÔNG tính vào tồn đầu (đã thuộc "trong kỳ") |
| TC-BR-GF-ACC-PRC-003-01 | BR-PRC-003 | 2 lần CREATE liên tiếp cho 2 kỳ khác nhau (cùng mã) | Happy | Kỳ sau tự query lại tồn đến `fromDate-1` của kỳ đó, không dùng số lưu từ kỳ trước |
| TC-BR-GF-ACC-PRC-004-01 | BR-PRC-004 | Sau khi CREATE kỳ N xong, chạy CREATE kỳ N+1 | Happy | Tồn đầu kỳ N+1 phản ánh đúng biến động phát sinh trong kỳ N (kể cả phiếu xuất kỳ N chưa tính giá → tiền vốn 0 nhưng SL đúng) |
| **TC-BR-GF-ACC-PRC-013-01** | **BR-PRC-013** | avgPrice tính ra 3 chữ số thập phân | **Happy** | Làm tròn HALF_UP về 2 lẻ NGAY sau khi tính; tiền vốn dùng giá trị 2 lẻ này × SL rồi làm tròn đồng |
| **TC-BR-GF-ACC-PRC-017-01** | **BR-PRC-017** | Mã có phiếu "Nhập hàng bán bị trả lại" (Tự nhập giá KHÔNG tích) tham chiếu Xuất bán cùng kỳ | **Multi-step** | Tính lặp 2-5 vòng đến khi avgPrice (2 lẻ) hội tụ; chỉ sau hội tụ mới cập nhật thật phiếu xuất + phiếu trả + sổ tồn |
| TC-BR-GF-ACC-PRC-017-02 | BR-PRC-017 | Dòng phiếu trả "Tự nhập giá" TÍCH | Happy | KHÔNG tính lặp — GT cố định theo giá nhập tay |
| TC-BR-GF-ACC-PRC-017-03 | BR-PRC-017 | Data bất thường khiến không hội tụ trong 100 vòng | Edge | Item chuyển `ERROR`/`SYSTEM_ERROR` (ADR-027 safety cap), KHÔNG hard-block toàn run |

### TC-BR-GF-ACC-PRC — Cập nhật kết quả & không tuần tự (BR-PRC-005/006/015)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-005-01 | BR-PRC-005 | Sau CREATE thành công | Happy | Phiếu Xuất bán/Sửa chữa/Khác trong kỳ/kho được điền giá vốn; sổ tồn cascade GT từ kỳ tính trở đi; log ghi nhận |
| TC-BR-GF-ACC-PRC-006-01 | BR-PRC-006 | CREATE cho kỳ N mà kỳ N-1 chưa từng tính giá | Happy | KHÔNG chặn — chạy bình thường, tồn đầu đã phản ánh biến động kỳ N-1 |
| **TC-BR-GF-ACC-PRC-015-01** | **BR-PRC-015** | Tính lại kỳ N, kỳ N+1 đã có log tính trước đó | **Edge** | Response `affectedSubsequentPeriods[]` liệt kê kỳ N+1; hệ thống KHÔNG tự cascade tính lại |

### TC-BR-GF-ACC-PRC — Mã lỗi (BR-PRC-007/012)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| **TC-BR-GF-ACC-PRC-007-01** | **BR-PRC-007** | Mã có SL tồn âm tại một thời điểm trong kỳ | **Violation** | `status=ERROR`, `error_reason=NEGATIVE_STOCK` (`ERR-INV-030`); mã khác vẫn hoàn tất |
| TC-BR-GF-ACC-PRC-007-02 | BR-PRC-007 | Job nền gián đoạn trước khi tính tới 1 mã, hết retry | Edge | Mã đó `status=ERROR`, `error_reason=SYSTEM_ERROR` (`ERR-INV-052`); log chốt "Hoàn thành có lỗi"; cover được bởi cả 2 nút RECALC |
| TC-BR-GF-ACC-PRC-012-01 | BR-PRC-012 | Mã có phương pháp tính giá ≠ "Bình quân cuối kỳ" | Violation | KHÔNG xuất hiện trong dropdown / KHÔNG thuộc scope "Tất cả mã" |
| TC-BR-GF-ACC-PRC-012-02 | BR-PRC-012 | Mã "Ngừng hoạt động" đã chọn "Chọn mã cụ thể" trước khi job chạy | Edge | Tự bỏ qua + toast "Đã bỏ qua N mã do ngừng hoạt động"; KHÔNG tính là lỗi |

### TC-BR-GF-ACC-PRC — RECALC 2 scope + lock kỳ (BR-PRC-008)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-008-01 | BR-PRC-008 | RECALC scope `ALL` cho log gốc "Tất cả mã" | Happy | Server resolve lại toàn bộ mã BQGQ Đang hoạt động theo predicate đã lưu |
| TC-BR-GF-ACC-PRC-008-02 | BR-PRC-008 | RECALC scope `ERROR_ONLY` | Happy | Chỉ chạy lại mã "Lỗi" đã lưu (còn Đang hoạt động); mã "Đã tính" giữ nguyên |
| **TC-BR-GF-ACC-PRC-008-03** | **BR-PRC-008** | CREATE hoặc RECALC khi kỳ đã "Đã đóng" | **Violation** | `ERR-INV-024` — chặn cả 2; mở lại kỳ (BR-AP-011) mới tính/tính lại được |
| TC-BR-GF-ACC-PRC-008-04 | BR-PRC-008 | Mở lại kỳ đã đóng rồi RECALC | Multi-step | Cho phép chạy lại bình thường |

### TC-BR-GF-ACC-PRC — Form / phạm vi mã (BR-PRC-009/010)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-009-01 | BR-PRC-009 | Chọn kỳ kế toán trong form | Happy | Từ/Đến ngày tự điền + khóa không sửa |
| TC-BR-GF-ACC-PRC-009-02 | BR-PRC-009 | Scope "Tất cả mã" | Happy | Form không đổ toàn bộ mã; server resolve khi bấm "Thực hiện tính giá" |
| TC-BR-GF-ACC-PRC-010-01 | BR-PRC-010 | Bấm "Tính giá" lần 2 cùng (kỳ+kho) | Happy | Tạo log mới chồng lên, không update log cũ |

### TC-BR-GF-ACC-PRC — Xóa log (BR-PRC-011)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-011-01 | BR-PRC-011 | Xóa log, kỳ chưa đóng, log terminal | Happy | Soft-delete, giá vốn phiếu xuất giữ nguyên (không rollback) |
| **TC-BR-GF-ACC-PRC-011-02** | **BR-PRC-011** | Xóa log thuộc kỳ đã đóng | **Violation** | `ERR-INV-024` |
| **TC-BR-GF-ACC-PRC-011-03** | **BR-PRC-011** | Xóa log đang "Đang tính" | **Violation** | `ERR-INV-029` |

### TC-BR-GF-ACC-PRC — Trạng thái & chạy nền (BR-PRC-014/016)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-014-01 | BR-PRC-014 | Toàn bộ mã trong scope đều lỗi | Edge | Log status = "Hoàn thành có lỗi" (KHÔNG có "Thất bại" riêng) |
| TC-BR-GF-ACC-PRC-016-01 | BR-PRC-016 | Bấm "Thực hiện tính giá" | Happy | 202 ngay, row `PENDING` xuất hiện tức thì, job chạy nền server-side |
| **TC-BR-GF-ACC-PRC-016-02** | **BR-PRC-016** | 2 request CREATE cùng (tenant, kỳ, kho) gần như đồng thời | **Violation / Concurrency** | 1 request 202 thành công, request kia chặn `ERR-INV-029`; không deadlock/race giá vốn |
| TC-BR-GF-ACC-PRC-016-03 | BR-PRC-016 | Client đóng trình duyệt giữa lúc job đang chạy | Edge | Job tiếp tục chạy server-side; mở lại Detail sau đó thấy đúng tiến độ hiện tại |
| TC-BR-GF-ACC-PRC-016-04 | BR-PRC-016 | Temporal worker crash giữa job | Multi-step | Resume từ checkpoint; hết retry → tự chốt "Hoàn thành có lỗi", mở khóa cho chạy lại |

### TC-BR-GF-ACC-PRC — Sort danh sách (BR-PRC-018)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-018-01 | BR-PRC-018 | List có nhiều log khác thời điểm thực hiện | Happy | Sort "Ngày giờ thực hiện" DESC |
| TC-BR-GF-ACC-PRC-018-02 | BR-PRC-018 | 2 log cùng thời điểm hiển thị | Edge | Tie-break: log tạo sau đứng trước |

### TC-BR-GF-ACC-PRC — Phân quyền (BR-AP-CMN-002)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-ACC-PRC-CMN2-01 | BR-AP-CMN-002 | `accountant` thực hiện toàn bộ CRUD + tính giá + tính lại + xóa log | Permission | Full quyền — không 403 |
| TC-BR-GF-ACC-PRC-CMN2-02 | BR-AP-CMN-002 | `garage-owner` thực hiện tương tự | Permission | Full quyền — không 403 |

---

## §5 BR → FEAT → AC Mapping

### FEAT-PRC-LIST (v12)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-PRC-014 | AC-2 | Cột "Trạng thái" — Đang tính/Thành công/Hoàn thành có lỗi |
| BR-PRC-009 / BR-PRC-010 / BR-PRC-018 | AC-3 | Mỗi dòng = 1 log, sort "Ngày giờ thực hiện" DESC, bấm lại tạo log mới |
| BR-PRC-016 | AC-2 (cột "Số mã") | Số mã đã resolve — chỉ mã BQGQ Đang hoạt động, mã Ngừng hoạt động không tính |
| BR-AP-CMN-002 | AC-7 | Phân quyền ngang nhau + tenant isolation |

### FEAT-PRC-CREATE (v32)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-PRC-009 | AC-2, AC-3, AC-4, AC-6 | Chọn kỳ khóa ngày; kho + phương pháp; nguồn mã + 2 cách chọn phạm vi |
| BR-PRC-012 | AC-4, AC-6b | Chỉ mã BQGQ "Đang hoạt động" |
| BR-PRC-001 / BR-PRC-002 / BR-PRC-003 / BR-PRC-013 | AC-7 | Công thức BQGQ + tồn đầu + làm tròn |
| BR-PRC-005 / BR-PRC-016 | AC-8 | Cập nhật phiếu xuất + sổ tồn + log tổng hợp |
| BR-PRC-016 | AC-8b, AC-13 | Lưu phiếu trước chạy nền; chặn chạy trùng (`ERR-INV-029`) |
| BR-PRC-006 | AC-9 | Không bắt tính tuần tự |
| BR-PRC-015 | AC-9b | Cảnh báo kỳ sau cần tính lại |
| BR-PRC-007 | AC-10 | Mã lỗi 3 lý do enum |
| BR-PRC-008 (cross-ref BR-AP-012) | AC-13b | Chặn tính giá khi kỳ đã đóng (`ERR-INV-024`) |
| BR-AP-CMN-002 | AC-12 | Phân quyền |

### FEAT-PRC-DETAIL (v24)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-PRC-014 | AC-2 | Cụm thông tin đầu màn — 3 trạng thái |
| BR-PRC-016 | AC-2c | Polling 5s khi "Đang tính", dừng khi trạng thái cuối, toast hoàn tất |
| BR-PRC-001 / BR-PRC-004 / BR-PRC-005 / BR-PRC-013 | AC-3 | Bảng chi tiết theo mã, cột "Giá bình quân" |
| BR-PRC-007 | AC-4 | Hiển thị mã lỗi + "Lí do lỗi" (3 enum) trong bảng chính |
| BR-PRC-008 | AC-5 | Nút "Tính lại toàn bộ" (scope `ALL`) |
| BR-PRC-008 | AC-5b | Nút "Tính lại mã lỗi" (scope `ERROR_ONLY`) |
| BR-AP-CMN-002 | AC-6 | Phân quyền |

### FEAT-PRC-RECALC (v21)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-PRC-008 | AC-1 | Scope `ALL` |
| BR-PRC-008 | AC-1b | Scope `ERROR_ONLY` |
| BR-PRC-005 / BR-PRC-008 | AC-2 | Ghi đè kết quả — phiếu xuất + sổ tồn |
| BR-PRC-016 / BR-PRC-017 | AC-2b | Chạy nền — ghi đè tại chỗ, không xóa trắng; tính lặp nếu cần |
| BR-PRC-008 (cross-ref BR-AP-011) | AC-3 | Chặn tính lại khi kỳ đã đóng (`ERR-INV-024`) |
| BR-PRC-016 | AC-3b | Chặn tính lại khi đang có lần tính chạy nền (`ERR-INV-029`) |
| BR-PRC-007 | AC-4 | Mã lỗi 3 lý do enum |
| BR-AP-CMN-002 | AC-5 | Phân quyền |

### FEAT-PRC-DELETE (v7)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-PRC-011 | AC-1 | Popup xác nhận xóa (nhắc không rollback) |
| BR-PRC-011 | AC-2 | Xóa log, KHÔNG rollback giá vốn |
| BR-PRC-011 (cross-ref BR-AP-013) | AC-4 | Chặn khi kỳ đã đóng (`ERR-INV-024`) |
| BR-PRC-011 / BR-PRC-016 | AC-4b | Chặn khi log đang "Đang tính" (`ERR-INV-029`) |
| BR-AP-CMN-002 | AC-5 | Phân quyền |

---

## §6 Error Code Mapping

| Mã | HTTP | Display | Message (VI) | BR ref |
|---|---|---|---|---|
| `ERR-INV-024` | 400 | INLINE_FORM (form guard) / DIALOG (popup "Không thể xóa"/"Không thể tính") | Kỳ kế toán đã đóng — Bạn không thể thực hiện mọi thao tác thuộc kỳ này | BR-PRC-008 (chặn CREATE/RECALC) · BR-PRC-011 (chặn DELETE) — cross-ref BR-AP-012 (ngoài W06 scope, xem §1.3 note) |
| `ERR-INV-029` | 400 | DIALOG | Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất | BR-PRC-016 (chặn CREATE/RECALC trùng) · BR-PRC-011 (chặn DELETE khi "Đang tính") |
| `ERR-INV-030` | 400 | INLINE_FORM | Tồn kho âm — mã không thể chạy giá do xuất vượt tồn | BR-PRC-007 (lý do lỗi "Do tồn âm" — invariant, về nguyên tắc không xảy ra) |
| `ERR-INV-031` | 400 | INLINE_WARNING | Lệch hạch toán — mã không thể chạy giá [MỞ RỘNG TƯƠNG LAI] | BR-PRC-007 (lý do lỗi "Lệch hạch toán" — module hạch toán chưa triển khai, hiện chưa bắt được trong W06) |
| `ERR-INV-051` | 409 | INLINE_FORM | Đang có thao tác tính giá khác xử lý cùng dữ liệu tồn kho — vui lòng thử lại sau | **Không phải BR-PRC-* trực tiếp** — nguồn gốc `BR-STKV2-005a` (engine recompute sổ tồn ordered-lock cross-key, `ADR-020`, sở hữu bởi `gf-inventory`) — surface tới PRC caller khi gọi W06-P5 `bulk-recompute` gặp lock timeout. Xem §7 OI-W06-BR-AP-003 (cross-check sibling `BR-GF-INVENTORY-STOCK-V2` wave-spec). |
| `ERR-INV-052` | 400 | INLINE_FORM | Chưa kịp tính do lần chạy trước bị gián đoạn (sự cố hệ thống) — vui lòng bấm "Tính lại mã lỗi" hoặc "Tính lại toàn bộ" để tính lại | BR-PRC-007 (lý do lỗi "Do sự cố hệ thống") · BR-PRC-014 (log tự chốt "Hoàn thành có lỗi" khi job gián đoạn/hết retry) |
| `ERR-CMN-validation` (generic, chưa có mã ERR-INV riêng) | 400 | INLINE_FORM | (theo field cụ thể — DTO required-field validation) | Chung cho request DTO không hợp lệ tại W06-1/W06-3/W06-4/W06-6 (không có mã ERR-INV riêng cho nhóm field header PRC, khác nhóm OB import) |
| `ERR-CMN-not-found` (generic, tenant no-leak) | 404 | TOAST | (không tồn tại / không thuộc tenant hiện tại) | W06-2 `GET /api/v2/price-calc-runs/{id}` — 404 khi run không tồn tại hoặc không thuộc tenant (tránh leak thông tin cross-tenant) |

> **Deprecated (không dùng ở W06)**: `ERR-INV-027` (BR-PRC-007 — đã thay bằng enum `ERR-INV-030/031/052`) · `ERR-INV-028` (BR-PRC-006 — đã bỏ chặn tính tuần tự). Registry vẫn giữ 2 mã này ở trạng thái deprecated cho lịch sử tra cứu; DEV **KHÔNG** dùng lại.

---

## §7 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W06-BR-AP-001 | ~~`source_sha` chưa tính được~~ **RESOLVED 2026-07-31** — orchestrator backfill `888a5c60cc9a96754eed93604a50d434bfb09d290db94c7f822af7706f980976` vào frontmatter + §0 (đối xứng tiền lệ `OI-W05-BR-ID-001`). | RESOLVED — không còn block ACTIVE |
| OI-W06-BR-AP-002 | **Nhóm Kỳ kế toán (BR-AP-001..016 + BR-AP-CMN-001) bị loại khỏi §1 theo policy filter** vì `FEAT-AP-*` không thuộc W06 wave scope (đã ship ở wave trước — theo `Product/features/FEAT-PRC-LIST.md` § các FEAT-AP-* không xuất hiện trong `PKG-W06 §1 Features` list). DEV cần context Kỳ kế toán đầy đủ (vd cơ chế đóng/mở kỳ, dropdown năm, auto-sinh cây kỳ) nên đọc trực tiếp `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` §2.1 nguồn hoặc wave-spec của wave đã ship `FEAT-AP-*` (chưa xác định wave nào — không tìm thấy trong phạm vi đọc của agent này; nếu cần, escalate Delivery Authority xác nhận wave gốc). | LOW — informational, không block W06 |
| OI-W06-BR-AP-003 | **`ERR-INV-051` origin ngoài BR-PRC-*** — theo `ERROR-CODE-REGISTRY.md` v33 §4, rule ref của mã này là `BR-STKV2-005a` (thuộc sibling BR `BR-GF-INVENTORY-STOCK-V2`, boundary `gf-inventory`), không phải rule nào trong file BR-GF-INVENTORY-ACCOUNTING-PERIOD này. Mã lỗi này có thể surface tới FE khi PRC gọi W06-P5 `bulk-recompute` gặp `LockTimeoutException`. Cần cross-check với wave-spec `Execution/wave-specs/W06/Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` (author khác, `exec-spec-ep-stock-v2`) để đảm bảo `ERR-INV-051` được đặc tả nhất quán ở đúng 1 nơi chủ, file này chỉ tham chiếu. | LOW — cross-check consistency, không block DEV `gf-accounting` |
| OI-W06-BR-AP-004 | **Cơ chế lock 3-layer của BR-PRC-016 chi tiết hơn text BR nguồn** — text BR-PRC-016 gốc chỉ đặc tả hành vi nghiệp vụ ("chặn chạy trùng cùng kỳ+kho"); chi tiết implement (DB `SELECT FOR UPDATE` + Temporal `WorkflowIdReusePolicy.REJECT_DUPLICATE` + partial unique index `uidx_prc_active_lock`) đến từ `PKG-W06 §2.2.1` + `ADR-027`/`ADR-028` (Architecture elaboration, không phải rule Product gốc). DEV nên coi PKG + 2 ADR là authoritative cho cơ chế lock cụ thể; BR-PRC-016 chỉ là nguồn của yêu cầu nghiệp vụ. | INFO — không phải drift, chỉ làm rõ nguồn thẩm quyền |

---

## §8 References

- `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v40 (nguồn canonical)
- `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v8
- `Product/features/FEAT-PRC-LIST.md` v12 · `FEAT-PRC-CREATE.md` v32 · `FEAT-PRC-DETAIL.md` v24 · `FEAT-PRC-RECALC.md` v21 · `FEAT-PRC-DELETE.md` v7
- `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v23 (nhóm PRC — context qua PKG, chưa Read trực tiếp trong spawn này)
- `Architecture/api/gf-accounting-api.md` v24 §5 (6 endpoint W06-1..6) + §6 Naming Registry
- `Architecture/api/gf-inventory-api.md` v72 §3f (5 S2S protected W06-P1..P5)
- `Architecture/api/agg-garage-graph-graphql.md` v7.79 §3f (6 GraphQL op PRC)
- `Architecture/data/gf-accounting-data-model.md` v14 §2quater — bảng `price_calc_run` / `price_calc_run_item`
- `Architecture/decisions/ADR-027-*.md` v5 — engine BQGQ 5-phase + tính lặp hội tụ (safety cap 100)
- `Architecture/decisions/ADR-028-*.md` v4 — async execution HTTP 202 + Temporal workflow `PRC_TASK_QUEUE`
- `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v2
- `Architecture/decisions/ADR-004.md` — outbox/inbox
- `Architecture/decisions/ADR-009.md` — JPA no relationship mapping
- `Product/Commons/ERROR-CODE-REGISTRY.md` v33 §4

---

## §9 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority (agent-execution-spec-author) | Khởi tạo DRAFT W06 scoped spec cho `BR-GF-INVENTORY-ACCOUNTING-PERIOD`. Filter theo policy mode `business-rule`: verbatim copy toàn bộ 18 rule `BR-PRC-001..018` (Features 100% = `FEAT-PRC-*`, đủ 5 FEAT trong W06) + giữ 2 rule cross-cutting (`CB-AP-001` cross-boundary REST PRC↔gf-inventory, `BR-AP-CMN-002` permission — Features cite explicit "toàn bộ feature AP + PRC"); loại bỏ 16 rule `BR-AP-001..016` (Kỳ kế toán) + `BR-AP-CMN-001` (Audit) vì `FEAT-AP-*` không thuộc W06 wave scope (đã ship wave trước). §3 Enforcement Layer xây theo `PKG-W06 §2.2.1` (domain `PriceCalcRunService` + Temporal `PriceCalcRunWorkflow` 7 activities + S2S `gf-inventory` 5 endpoint + DB `uidx_prc_active_lock`). §4 Test Ideas 20 rule × Happy/Violation/Edge/Multi-step (nhấn tính lặp hội tụ BR-PRC-017, concurrency 3-layer BR-PRC-016, 2 scope RECALC BR-PRC-008, 3 lý do lỗi enum BR-PRC-007). §5 BR→FEAT→AC mapping cho 5 FEAT dựa trực tiếp trên AC thực tế đọc từ 5 file FEAT nguồn (`FEAT-PRC-LIST` v12, `FEAT-PRC-CREATE` v32, `FEAT-PRC-DETAIL` v24, `FEAT-PRC-RECALC` v21, `FEAT-PRC-DELETE` v7). §6 Error Code Mapping đầy đủ theo `ERROR-CODE-REGISTRY.md` v33 (`ERR-INV-024/029/030/031/051/052` + generic `ERR-CMN-validation`/`ERR-CMN-not-found`), có note deprecated `ERR-INV-027/028`. 4 Open Item: `source_sha` pending compute — không có Bash tool trong session này (OI-001, BLOCKING cho ACTIVE), nhóm Kỳ kế toán bị filter khỏi scope + pointer cho DEV cần context (OI-002, LOW), `ERR-INV-051` origin thuộc sibling BR `BR-GF-INVENTORY-STOCK-V2` cần cross-check (OI-003, LOW), cơ chế lock 3-layer chi tiết đến từ PKG/ADR không phải text BR gốc (OI-004, INFO). |
