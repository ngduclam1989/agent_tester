---
type: business-rules
artifact_kind: business-rules
status: PLANNED
version: 32
tier: T1
owner_authority: Business Authority
boundary: "gf-accounting + gf-sales (cross-boundary)"
parent_epic: "EP-INSURANCE-SETTLEMENT"
last_reviewed: "2026-06-18"
supersedes: "none"
---
# Business Rules — EP-INSURANCE-SETTLEMENT

> File BR-EP-\* — **pattern epic-scoped cross-boundary** theo chuẩn naming convention tại `BUSINESS-RULES.md §4` (chính thức từ v3 — 2026-05-27).
>
> Epic này cross-boundary (gf-accounting + gf-sales). File BR scoped theo Epic (không theo boundary) vì 5 features trải đều 2 boundary, viết riêng trong 2 file BR-GF-\*.md sẽ phân mảnh khó tham chiếu (áp dụng quy tắc §4 #2).
>
> File này **bổ sung** cho [BR-GF-ACCOUNTING.md](BR-GF-ACCOUNTING.md) và [BR-GF-SALES.md](BR-GF-SALES.md) baseline — không thay thế, không sửa rules cũ. Các BR baseline (BR-STL-*, BR-SO-*, BR-DASH-\*) vẫn áp dụng song song.
>
> Phạm vi tài liệu: EP-INSURANCE-SETTLEMENT (5 FEAT: INS-SO-ADJUSTMENT, INS-STL-DETAIL, INS-DOSSIER-CREATE, INS-DOSSIER-VIEW, INS-DASH-DEBT). *(Foundation đã production, không thuộc 5 feature: per-line payment source — EP-SERVICE-ORDER; tạo phiếu QT cặp KH+BH — EP-SETTLEMENT; danh sách/dropdown công ty BH — system-seeded.)*

---

## §1 Cross-boundary Rules

| Rule | Mô tả | Boundaries liên quan |
| --- | --- | --- |
| CB-INS-001 | Toàn bộ data của EP-INSURANCE-SETTLEMENT (phiếu QT BH, hồ sơ BH, điều chỉnh BH trên SO) phải filter strict theo `tenantId` (Critical Rule #4 tenant isolation). | gf-accounting, gf-sales, agg-garage-graph |
| CB-INS-002 | Khi tạo phiếu QT BH, gf-accounting gọi REST `gf-sales` để lấy snapshot SO **kèm các trường mở rộng**: Nguồn TT per dòng + 5 khoản điều chỉnh BH header. Thông tin CTBH từ `insuranceCompany` baseline (đã lưu mã v.d. `INS_BSH`). Snapshot là immutable sau khi tạo. | gf-accounting, gf-sales |
| CB-INS-003 | Khi tạo phiếu QT BH thành công, gf-accounting gọi callback gf-sales để chuyển SO sang trạng thái "đã quyết toán" (kế thừa baseline CB-ACC-003). **Phiếu QT BH không có chức năng huỷ → SO khoá vĩnh viễn, không reopen** (chốt 2026-06-08). | gf-accounting, gf-sales |
| CB-INS-004 | Phiếu QT BH và phiếu QT khách hàng liên kết qua `relatedSettlementId` — phải **tạo atomic** (cùng commit hoặc cùng rollback). Không cho phép 1 trong cặp tồn tại độc lập khi tạo từ SO có cả dòng BH + KH. *(Không có luồng huỷ cặp — phiếu QT BH không có chức năng huỷ, chốt 2026-06-08.)* | gf-accounting |
| CB-INS-005 | Ghi nhận thanh toán từ doanh nghiệp BH **tái sử dụng** chức năng baseline `FEAT-STL-DETAIL` (RecordSettlementPayment mutation) — gf-accounting không phát triển logic ghi nhận thanh toán mới (chốt PRD v5). | gf-accounting |
| CB-INS-006 | Danh sách công ty bảo hiểm là **system-seeded toàn platform** (chốt 2026-05-27) — garage chỉ chọn từ dropdown trên SO (toggle "Bảo hiểm = Có" — baseline production), KHÔNG tự CRUD. Master ở gf-erp-mdm catalog `directory='INSURANCE'`. gf-sales **đã lưu mã CTBH** trong `insurance_company` (VARCHAR baseline, v.d. `INS_BSH`) — **KHÔNG** thêm cột mới `insurance_code`. gf-accounting lấy thông tin CTBH qua REST `for-settlement` — không lưu riêng. (Đã bỏ FEAT-INS-COMPANY-\*.) | gf-sales (dropdown), gf-accounting (qua REST) |
| CB-INS-008 | Widget công nợ BH trên Dashboard (gf-sales) lấy số liệu từ gf-accounting qua REST `/protected/v1/insurance-debt-summary` — không truy vấn DB cross-boundary. | gf-sales, gf-accounting |
| CB-INS-009 | Object storage (S3 hoặc tương đương) lưu PDF hồ sơ BH (4 tài liệu render server-side) theo path pattern `{tenant}/insurance-dossiers/{settlementId}/v{N}/{tên file}`, trong đó `{tên file}` đặt theo BR-INS-DOSSIER-011. Mọi cross-boundary access dùng signed URL có TTL hợp lý. | gf-accounting, object-storage |
| CB-INS-010 | Mọi GraphQL operations từ frontend liên quan đến BH đi qua BFF `agg-garage-graph` rồi gọi REST gf-accounting / gf-sales. Frontend không truy cập trực tiếp backend (kế thừa baseline). | gf-accounting, gf-sales, agg-garage-graph |
| CB-INS-011 | Không có tích hợp 2 chiều realtime với hệ thống doanh nghiệp BH (gửi claim API, nhận phê duyệt, đồng bộ trạng thái bồi thường). Hồ sơ BH xuất PDF → gửi BH ngoài hệ thống (email/chuyển phát). | (out-of-scope) |

---

## §2 Rules Registry

### 2.1 Nguồn thanh toán BH/KH per line trên Phiếu dịch vụ (BR-INS-SO-PS-001..006)

> Boundary: `gf-sales`. Foundation: **năng lực chọn bên thanh toán per dòng — BASELINE đã production** (thuộc EP-SERVICE-ORDER; feature doc FEAT-INS-SO-PAYMENT-SOURCE đã gỡ khỏi epic vì không dev lần này).
>
> ⚠️ Các rule dưới đây **document hành vi production hiện hành** (foundation cho phần điều chỉnh BH mới) — KHÔNG phải yêu cầu build mới.

| BR ID | Rule | Category | Áp dụng |
| --- | --- | --- | --- |
| BR-INS-SO-PS-001 | Mỗi dòng vật tư/phụ tùng và mỗi dòng công dịch vụ trên SO loại **"Dịch vụ xe"** phải có thuộc tính `paymentSource` ∈ {**"BH"**, **"KH"**}. Không cho phép rỗng/null. | Domain constraint | baseline (EP-SERVICE-ORDER) |
| BR-INS-SO-PS-002 | SO loại **"Bán phụ tùng"** không có khái niệm Nguồn thanh toán — toàn bộ dòng cố định là **"KH"** (không hiển thị cột, không cho chỉnh). | Domain constraint | baseline (EP-SERVICE-ORDER) |
| BR-INS-SO-PS-003 | Khi line item được thêm mới trên SO, `paymentSource` mặc định = **"KH"** để không phá nghiệp vụ hiện hành. | Default value | baseline (EP-SERVICE-ORDER) |
| BR-INS-SO-PS-004 | Đổi `paymentSource` của một dòng phải trigger refresh section "Phân bổ quyết toán bảo hiểm" (tính lại Tổng chi phí thuộc BH + bảng tổng) — không cho phép số liệu BH lệch khỏi dữ liệu line item. | Data integrity | baseline + FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-PS-005 | Quy tắc chỉnh sửa SO baseline (chỉ sửa ở trạng thái cho phép theo BR-SO-EDT-\*) **áp dụng đầy đủ** cho cột Nguồn thanh toán — không tạo ngoại lệ. | Edit guard | baseline (EP-SERVICE-ORDER) |
| BR-INS-SO-PS-006 | Cột Nguồn thanh toán + section "Phân bổ quyết toán bảo hiểm" **chỉ xuất hiện ở màn hình Chỉnh sửa (Edit, nhập) + Chi tiết (Detail, read-only)**, KHÔNG ở màn hình Tạo (Create). Lý do nghiệp vụ: Create = báo giá sơ bộ gửi BH duyệt; phân bổ BH chỉ nhập sau khi BH duyệt (qua Edit). | Screen scope | baseline + FEAT-INS-SO-ADJUSTMENT |

### 2.2 Điều chỉnh bảo hiểm trên Phiếu dịch vụ (BR-INS-SO-ADJ-001..010)

> Boundary: `gf-sales`. Features: `FEAT-INS-SO-ADJUSTMENT`.

| BR ID | Rule | Category | Features |
| --- | --- | --- | --- |
| BR-INS-SO-ADJ-001 | Section **"Phân bổ quyết toán bảo hiểm"** hiển thị ở màn hình **Chỉnh sửa (Edit, nhập) + Chi tiết (Detail, read-only)** khi người dùng chọn **"Có"** tại mục **"Bảo hiểm"** (cùng trigger với khu vực thông tin BH). Chọn "Không" → ẩn. **KHÔNG** hiển thị ở màn Tạo (Create). | Conditional display + screen scope | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-002 | **Chiết khấu liên kết BH — Vật tư** và **Chiết khấu liên kết BH — Công dịch vụ**: cho phép nhập theo **% hoặc số tiền** (toggle), hệ thống lưu cả `mode` (PERCENT/AMOUNT) và `value`. | Input flexibility | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-003 | **Giảm trừ bồi thường**: cho phép nhập theo **% hoặc số tiền** (toggle, tương tự chiết khấu liên kết). Cơ sở tính khi mode = PERCENT là Tổng chi phí thuộc BH. | Input flexibility | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-004 | **Khấu trừ bảo hiểm**: chỉ nhập **số tiền** (không có chế độ %). | Input constraint | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-005 | **Khấu hao vật tư/thay mới**: cho phép áp dụng **đồng loạt** (% header) hoặc **per từng dòng phụ tùng** (cột % trong bảng). Giá trị per-dòng **override** giá trị đồng loạt; dòng không có giá trị riêng dùng giá trị đồng loạt. | Calculation precedence | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-006 | Toggle **"Bảo hiểm" (Có/Không)** + các trường thông tin công ty BH để fill (Công ty BH = dropdown **system-seeded**, số hợp đồng, người giám định, SĐT) trên SO **ĐÃ CÓ TRONG PRODUCTION** — không dev lần này. Danh sách công ty BH là system-seeded toàn platform (đã bỏ FEAT-INS-COMPANY-\*). Số hợp đồng BH, Người giám định, SĐT giám định nhập tay per-SO. | Baseline | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-007 | % chiết khấu liên kết BH (Vật tư + Công DV) nhập **trực tiếp per-SO** (AC-3/AC-4) — KHÔNG có % mặc định per công ty BH (danh sách công ty là system-seeded, không có entity master data để prefill). | Input per-SO | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-008 | Khi đổi Nguồn TT của line item → cơ sở tính của các khoản điều chỉnh phải refresh tự động. Số liệu tính toán phải nhất quán giữa client-side hiển thị realtime và server-side khi tạo phiếu QT BH (server là nguồn chốt khi có chênh lệch). | Data consistency | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-CREATE |
| BR-INS-SO-ADJ-009 | **Hiển thị có điều kiện theo SO chọn Bảo hiểm** (chốt 2026-06-10, theo production screenshot): (a) Panel **"Tổng giá dịch vụ"** trên SO hiển thị **cả khi có/không Bảo hiểm**, nhưng phần đặc thù BH (section "Phân bổ Bảo hiểm" + cột "Bảo hiểm thanh toán" + dòng Cân thanh toán BH) chỉ khi "Bảo hiểm = Có"; SO không BH = panel rút gọn **1 cột KH**; (b) cột **"Khấu hao VT"** trên bảng phụ tùng chỉ hiển thị khi "Bảo hiểm = Có". *(Panel trên SO Edit/Detail giữ 2 cột BH+KH — KHÔNG áp CR-20260612-01; CR đó chỉ tách hiển thị trên màn chi tiết phiếu QT — BR-INS-STL-DET-009.)* | Conditional display | FEAT-INS-SO-ADJUSTMENT |
| BR-INS-SO-ADJ-010 *(CR-20260612-02)* | Tại **popup "Hoàn thành phiếu dịch vụ"** (extend FEAT-SO-DETAIL AC-16, baseline gf-sales), nếu SO có hạng mục Bảo hiểm và **Tổng "Bảo hiểm thanh toán" < 0** → hiển thị dòng cảnh báo `ERR-INS-003` **"Bảo hiểm thanh toán đang âm — kiểm tra lại các khoản điều chỉnh trước khi hoàn thành"**. **Warn-and-allow**: nút "Xác nhận" vẫn enable, vẫn cho hoàn thành SO (không chặn — nhất quán AC-12/EC-2/VLD-INS-SO-005). Cảnh báo bổ sung vị trí (popup hoàn thành) bên cạnh inline panel (FEAT AC-12). | Warning (conditional) | FEAT-INS-SO-ADJUSTMENT (AC-17) |

### 2.3 Tạo phiếu quyết toán bảo hiểm (BR-INS-STL-CRE-001..009)

> Boundary: `gf-accounting`. **Luồng tạo phiếu quyết toán (cặp KH+BH) ĐÃ CÓ ở production** (FEAT-STL-CREATE baseline — BR-001/004/005/006/007/008 document hành vi baseline). Phần **MỚI** lần này gồm: (a) **truyền thêm thông tin phân bổ BH** khi tạo phiếu QT (BR-002 snapshot allocation, BR-003 tính server-side) — gộp vào **FEAT-INS-SO-ADJUSTMENT (AC-15)**; (b) **hiển thị panel "Tổng giá dịch vụ" read-only** trên màn xác nhận tạo phiếu QT (BR-009 display rule) — **FEAT-INS-STL-CREATE** (CR mở rộng màn FEAT-STL-CREATE).

| BR ID | Rule | Category | Áp dụng |
| --- | --- | --- | --- |
| BR-INS-STL-CRE-001 | Phiếu QT BH chỉ tạo từ SO loại **"Dịch vụ xe"** có ≥ 1 dòng Nguồn TT = **"BH"**. SO loại **"Bán phụ tùng"** không bao giờ sinh phiếu QT BH. | Type constraint | baseline (EP-SETTLEMENT), FEAT-INS-STL-CREATE |
| BR-INS-STL-CRE-002 | Phiếu QT BH **snapshot** dữ liệu BH từ SO tại thời điểm tạo: line items (Nguồn TT = BH), 5 khoản điều chỉnh BH, thông tin DN BH (từ `insuranceCompany` baseline), số hợp đồng BH, người giám định, SĐT, thông tin KH & xe, bảng phân bổ (Cộng sau VAT + BH thanh toán/KH chịu). Sau snapshot → immutable. | Snapshot allocation (**MỚI**) | FEAT-INS-SO-ADJUSTMENT (AC-15), FEAT-INS-STL-CREATE (AC-7) |
| BR-INS-STL-CRE-003 | **BH thanh toán** tính **server-side** theo công thức (xem §7.2) — không nhận giá trị nhập tay (khác baseline BR-STL-CRE-005 cho nhập tay). | Server calculation (**MỚI**) | FEAT-INS-SO-ADJUSTMENT (AC-15), FEAT-INS-STL-CREATE (AC-5/AC-6) |
| BR-INS-STL-CRE-004 | Khi SO có cả dòng KH + dòng BH → tạo **atomic** cặp 2 phiếu QT: 1 loại **"Khách hàng"** + 1 loại **"Bảo hiểm"**. Một phiếu lỗi → rollback cả 2 (xem CB-INS-004). | Atomic pair | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-005 | Mã phiếu QT BH sinh theo pattern `SET-yyyyMMdd-NNNNN` giống baseline; phân biệt loại qua field `payerType = INSURANCE`, không qua mã. | Code generation | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-006 | Trạng thái khởi tạo của phiếu QT BH = **"Nháp"** (DRAFT, hiển thị UI là **"Hoạt động"**). Không có workflow phê duyệt nội bộ trước khi xuất hồ sơ. | Default status | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-007 | Phiếu QT BH liên kết hai chiều với phiếu QT khách hàng cùng SO qua `relatedSettlementId`. Cả 2 share cùng `serviceOrderId`. | Pair linking | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-008 | SO **bắt buộc có thông tin công ty bảo hiểm** (điền khi toggle "Bảo hiểm = Có") trước khi tạo phiếu QT BH — block nếu chưa điền (xem FEAT-INS-SO-ADJUSTMENT AC-2). | Pre-condition guard | baseline + FEAT-INS-SO-ADJUSTMENT |
| BR-INS-STL-CRE-009 | Trên màn **Tạo phiếu quyết toán**, panel **"Tổng giá dịch vụ"** hiển thị **read-only** — snapshot phân bổ BH từ SO tại thời điểm mở màn, **không cho nhập/sửa** tại màn này (muốn sửa phải quay về SO ở màn Chỉnh sửa). **Hiển thị có điều kiện theo SO chọn Bảo hiểm** (chốt 2026-06-15, theo Figma): (a) SO có ≥ 1 dòng Nguồn TT = **"BH"** → đầy đủ **3 khối** ("Chi tiết theo bên thanh toán" **2 cột BH+KH** + section **"Phân bổ Bảo hiểm"** 5 khoản + **"Cân thanh toán" 3 dòng** (BH + KH + Tổng)); (b) SO **không** có dòng BH → **rút gọn** (1 cột KH, **KHÔNG** có "Phân bổ Bảo hiểm", "Cân thanh toán" **2 dòng** (KH + Tổng)). Panel **không ẩn hẳn** mà rút gọn. Số liệu tính **server-side** (xem BR-INS-STL-CRE-003), khớp panel trên SO + chi tiết QT. Song song **BR-INS-SO-ADJ-009** (= SO-ADJ-010 FEAT-world; panel trên SO) + **BR-INS-STL-DET-009** (= STL-DET-005 FEAT-world; panel trên chi tiết QT) — cùng quy tắc rút gọn theo bên thanh toán. | Conditional display (read-only, **MỚI**) | FEAT-INS-STL-CREATE (AC-2/AC-3/AC-4/AC-5) |

### 2.4 Chi tiết phiếu QT BH & đối soát thanh toán BH (BR-INS-STL-DET-001..009)

> Boundary: `gf-accounting`. Features: `FEAT-INS-STL-DETAIL`.

| BR ID | Rule | Category | Features |
| --- | --- | --- | --- |
| BR-INS-STL-DET-001 | Phiếu QT BH thuộc tenant nào chỉ truy cập được từ tenant đó (kế thừa tenant isolation baseline). | Tenant isolation | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-002 | Trường **"Tổng tiền bảo hiểm trả"** trên phiếu QT BH = computed `Bảo hiểm thanh toán` từ bảng phân bổ — read-only, không cho sửa tay. | Computed field | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-003 | Ghi nhận thanh toán từ doanh nghiệp BH **tái sử dụng** chức năng baseline (RecordSettlementPayment mutation từ FEAT-STL-DETAIL) — không phát triển logic mới. Form ghi nhận chỉ prefill `payerType = INSURANCE` và `bên thanh toán = "Doanh nghiệp bảo hiểm"`. | Reuse baseline | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-004 | Trạng thái thanh toán phiếu QT BH (**"Chưa thu"** / **"Thu một phần"** / **"Đã thu đủ"**) **suy ra realtime** từ tổng đợt thanh toán đã ghi nhận — không lưu cố định trong DB. | Derived status | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-005 *(CR-20260616-01 — mở rộng template phiếu KH)* | Phiếu QT BH có **template in riêng** (khác phiếu QT KH baseline) — chứa bảng phân bổ BH chi tiết (Tổng chi phí thuộc BH, 5 khoản điều chỉnh, Bảo hiểm thanh toán, KH chịu từ điều chỉnh BH). **Bản in chi tiết per-payer** theo PRINT-INS-001 (phiếu BH — 5 khoản dấu −) + PRINT-INS-007 (phiếu KH từ SO có BH — 3 khoản dấu +); phiếu QT KH từ SO **không** chọn BH giữ bản in baseline (không có section "Phân bổ bảo hiểm"). Khớp 2 mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html`. | Print template | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-006 | Huỷ phiếu QT BH **cascade** huỷ phiếu QT khách hàng liên kết (cùng cặp) và mở lại SO (kế thừa baseline BR-STL-DTL-002). Bị **chặn** nếu phiếu nào trong cặp đã có bản ghi thanh toán (kế thừa BR-STL-DTL-003). | Cascade cancel | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-007 | Các element đặc thù bảo hiểm trên màn chi tiết phiếu QT — nút **"+ Tạo hồ sơ bảo hiểm"**, nút **"Xuất hồ sơ bảo hiểm (PDF)"**, tab **"Hồ sơ bảo hiểm đã xuất"** — **chỉ hiển thị khi Bên thanh toán của phiếu = Bảo hiểm**; phiếu QT bên thanh toán = **Khách hàng** → **ẩn hoàn toàn** cả 3 element. Gate **chỉ theo Bên thanh toán**, **không** ràng buộc trạng thái phiếu — giao diện người dùng **không có trạng thái DRAFT** (chốt 2026-06-10, thay điều kiện DRAFT cũ). | Conditional action | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-008 | Khi BH thanh toán vượt số phải trả → vẫn cho ghi nhận, trạng thái = **"Đã thu đủ"**, hiển thị badge **"Thừa: {số tiền}"**. Phần thừa garage **xử lý ngoài hệ thống** (đối trừ/hoàn ngoài) — hệ thống **KHÔNG tự ghi negative adjustment** (chốt 2026-06-05). | Overpayment | FEAT-INS-STL-DETAIL |
| BR-INS-STL-DET-009 *(CR-20260612-01 — đảo quy tắc v23)* | Panel **"Tổng giá dịch vụ"** (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) hiển thị trên **cả phiếu QT BH lẫn KH**, nhưng **nội dung tách theo đúng bên thanh toán của phiếu — không lẫn cột bên kia** (chốt **CR-20260612-01** 2026-06-12, đảo logic 2-cột chốt 2026-06-10): **(a) phiếu QT BH** — "Chi tiết theo bên thanh toán" **chỉ 1 cột "Bảo hiểm thanh toán"** (bỏ cột "Khách hàng thanh toán"); "Cân thanh toán" **bỏ dòng "Khách hàng thanh toán"**, **giữ "Tổng thanh toán"** (= Bảo hiểm thanh toán, chốt 2026-06-12); giữ section "Phân bổ Bảo hiểm". **(b) phiếu QT KH đi từ SO có chọn Bảo hiểm** — 1 cột "Khách hàng thanh toán" + **THÊM section "Phân bổ Bảo hiểm"** liệt kê các khoản điều chỉnh BH **chuyển sang KH chịu** (Giảm trừ bồi thường / Khấu hao / Khấu trừ BH — dấu +; nhất quán CNF-INS-002). **(c) phiếu QT KH đi từ SO không chọn Bảo hiểm** — rút gọn 1 cột KH, **không** có "Phân bổ Bảo hiểm". Panel **không ẩn** mà **tách/rút gọn** theo bên thanh toán (khác BR-INS-STL-DET-007 ẩn hoàn toàn). *(Đảo quy tắc v23: trước đây phiếu BH hiển thị 2 cột BH+KH, phiếu KH không có "Phân bổ Bảo hiểm".)* **NEED CONFIRMATION** (Business Authority): 2 khoản "CK liên kết BH" (chỉ giảm BH, không sang KH) có hiển thị trên phiếu KH để tham chiếu hay ẩn? | Conditional display | FEAT-INS-STL-DETAIL |

### 2.5 Tạo & quản lý Hồ sơ bảo hiểm (BR-INS-DOSSIER-001..011)

> Boundary: `gf-accounting`. Features: `FEAT-INS-DOSSIER-CREATE`, `FEAT-INS-DOSSIER-VIEW`.

| BR ID | Rule | Category | Features |
| --- | --- | --- | --- |
| BR-INS-DOSSIER-001 | Bộ hồ sơ chuẩn **cố định 4 tài liệu (mẫu chung)** cho mọi DN BH, thứ tự: ① **"Phiếu quyết toán"**, ② **"Phiếu báo giá"** (PHIẾU BÁO GIÁ SỬA CHỮA), ③ **"Biên bản nghiệm thu"**, ④ **"Giấy ủy quyền nhận tiền bồi thường"**. ①② auto-sinh ("Sẵn sàng"); ③④ kế toán hoàn tất ("Bổ sung"). Không thêm/bớt tài liệu. | Document set | FEAT-INS-DOSSIER-CREATE |
| BR-INS-DOSSIER-002 | **Phiếu báo giá** (①) và **Phiếu quyết toán** (②) auto-render từ snapshot phiếu QT BH — **tất cả trường read-only** (chốt PRD v6). Trạng thái tài liệu tự động **"Sẵn sàng"** ngay khi mở. Nếu cần sửa số liệu → phải sửa ngược về phiếu QT BH / SO. | Auto-render read-only | FEAT-INS-DOSSIER-CREATE |
| BR-INS-DOSSIER-003 | **Biên bản nghiệm thu** (③): kế toán **điền template trực tiếp** (Ngày NT, Người đại diện garage/KH/BH, Mô tả hạng mục, Ghi chú). Prefill từ SO; in ra ký ngoài hệ thống. | Template fill | FEAT-INS-DOSSIER-CREATE |
| BR-INS-DOSSIER-004 | **Giấy ủy quyền nhận tiền bồi thường** (④) = **template điền (mẫu chung)**. Prefill KH/xe/DN BH từ phiếu QT BH; in cho KH ký ngoài hệ thống. | Template fill | FEAT-INS-DOSSIER-CREATE |
| BR-INS-DOSSIER-005 | Xuất hồ sơ: **xuất các tài liệu được tích chọn (checkbox)** — KHÔNG bắt buộc đủ 4/4 (chốt 2026-05-27). Không gate "phải hoàn tất template" — mọi tài liệu được tích chọn đều được xuất ngay (kế toán tự chịu trách nhiệm nội dung). Sinh PDF riêng mỗi tài liệu (không gộp). | Export gate | FEAT-INS-DOSSIER-CREATE |
| BR-INS-DOSSIER-006 | Sau khi xuất PDF, version đó **immutable** — không cho sửa nội dung, xuất lại đè bản cũ. PDF gốc lưu trong object storage với path pattern theo CB-INS-009. | Immutability after export | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW |
| BR-INS-DOSSIER-007 | Khi BH yêu cầu sửa hồ sơ sau xuất PDF → **tạo bộ hồ sơ mới** (điền lại template từ đầu — **không có chức năng "Sao chép từ bản trước"**), không unlock bản cũ. Bản cũ giữ trong tab "Hồ sơ bảo hiểm đã xuất" để truy vết. Các bộ phân biệt theo **ngày/lần xuất** — **không có trạng thái bộ hồ sơ trên giao diện** ("Đã thay thế"/"Replaced" không hiển thị). Tạo bộ mới không giới hạn số lượng. | Versioning | FEAT-INS-DOSSIER-CREATE |
| BR-INS-DOSSIER-009 | Tab **"Hồ sơ bảo hiểm đã xuất"** hiển thị **tất cả các version** đã xuất PDF (không filter, không xoá). Không có chức năng hard delete version trong scope hiện tại. | Audit trail | FEAT-INS-DOSSIER-VIEW |
| BR-INS-DOSSIER-010 | Phiếu QT BH ở trạng thái CANCEL → block tạo hồ sơ mới. Hồ sơ đã xuất vẫn truy cập được (read-only) để truy vết. | Cancel guard | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW |
| BR-INS-DOSSIER-011 | Mỗi tài liệu trong bộ hồ sơ BH khi xuất PDF có **tên file đặt theo quy tắc cố định** `{loại tài liệu}_{mã phiếu QT BH}_v{số lần xuất}.pdf`. Nhãn loại tài liệu dùng **slug không dấu**: **Phiếu báo giá** = `bao-gia`, **Phiếu quyết toán** = `quyet-toan`, **Biên bản nghiệm thu** = `bien-ban-nghiem-thu`, **Giấy ủy quyền nhận tiền bồi thường** = `uy-quyen-nhan-tien`. Tên file áp dụng **nhất quán** cho cả bản tải về và bản lưu trữ; cùng một loại tài liệu ở các lần xuất khác nhau phân biệt bằng hậu tố `v{N}` (khớp version bộ hồ sơ — BR-INS-DOSSIER-007). VD: `bao-gia_SET-001_v2.pdf`. | File naming | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW |

### 2.6 Widget công nợ bảo hiểm trên Dashboard (BR-INS-DASH-001..006)

> Scope (chốt 2026-05-27): 3 KPI + 2 top list + filter kỳ (5 giá trị). **Bỏ**: biểu đồ lịch sử thanh toán BH + phân chia công nợ theo DN BH.

> Boundary: `gf-sales` (Dashboard ownership). Features: `FEAT-INS-DASH-DEBT`.

> ⏸️ **DEFERRED (2026-06-05)**: Dashboard **không nằm trong đợt phát triển hiện tại** → các NEED CONFIRMATION còn mở của nhóm này (BR-INS-DASH-004 gốc tính tuổi nợ + threshold, BR-INS-DASH-005 widget config toggle) **được skip khi chạy sóng**, sẽ resolve khi FEAT-INS-DASH-DEBT vào scope. KHÔNG block các feature còn lại của epic.

| BR ID | Rule | Category | Features |
| --- | --- | --- | --- |
| BR-INS-DASH-001 | Số liệu công nợ BH lấy từ phiếu QT BH có `payerType = INSURANCE` và `status = DRAFT` (không tính CANCEL). | Data source | FEAT-INS-DASH-DEBT |
| BR-INS-DASH-002 | **"Đã thu trong kỳ"** chỉ đếm các bản ghi `payment` thuộc phiếu QT BH có `paymentDate` nằm trong kỳ filter. Filter kỳ: Hôm qua / Tuần này / Tuần trước / Tháng này (mặc định) / Tháng trước. | Period filter | FEAT-INS-DASH-DEBT |
| BR-INS-DASH-003 | **"Tổng phải thu BH"** = Σ (Bảo hiểm thanh toán − Đã thanh toán) của các phiếu QT BH DRAFT chưa thu đủ. | Aggregation | FEAT-INS-DASH-DEBT |
| BR-INS-DASH-004 | **Tuổi nợ** tính từ ngày tạo phiếu QT BH đến hiện tại (NEED CONFIRMATION: hay từ ngày xuất hồ sơ BH lần đầu?). Tuổi nợ &gt; 30 ngày highlight cảnh báo (NEED CONFIRMATION threshold). | Aging | FEAT-INS-DASH-DEBT |
| BR-INS-DASH-005 | Widget extends FEAT-DASH-VIEW — **không thay thế** các widget hiện có. Chủ garage có thể cấu hình bật/tắt widget nếu Dashboard hỗ trợ widget config (NEED CONFIRMATION). | Extension only | FEAT-INS-DASH-DEBT |
| BR-INS-DASH-006 | Filter kỳ gồm 5 giá trị cố định: Hôm qua, Tuần này, Tuần trước, Tháng này (mặc định), Tháng trước. (Biểu đồ lịch sử + phân chia theo DN BH đã **bỏ khỏi scope** 2026-05-27.) | Period filter | FEAT-INS-DASH-DEBT |

### 2.7 Danh sách công ty bảo hiểm (BASELINE — system-seeded, không phải feature)

> **CHỐT 2026-05-27**: Danh sách / dropdown công ty bảo hiểm là **system-seeded toàn platform** (garage chỉ chọn, KHÔNG tự thêm/sửa/xoá). **Đã bỏ 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** và các rule BR-INS-COMPANY-\* tương ứng.
>
> - Công ty BH chọn từ dropdown trên SO (toggle "Bảo hiểm = Có" — baseline production, xem BR-INS-SO-ADJ-006/008).
> - Tên công ty BH snapshot vào phiếu QT BH + hồ sơ BH tại thời điểm tạo.
> - Không có % chiết khấu liên kết mặc định per công ty — chiết khấu nhập trực tiếp per-SO.

---

## §3 Status Transition Rules

### 3.1 Phiếu quyết toán bảo hiểm (DRAFT — KHÔNG có huỷ)

> ⚠️ **Chốt 2026-06-08 — phiếu QT BH KHÔNG có chức năng huỷ** (đảo quyết định CANCEL trước đây): không có trạng thái CANCEL, không cascade huỷ cặp KH+BH, không reopen SO. Sơ đồ/nhánh "Đã huỷ (CANCEL)" bên dưới **đã void** — giữ lại chỉ để đối chiếu lịch sử.

```
  ┌──────────────────────────┐
  │  Tạo từ SO có dòng BH    │
  │  (atomic với QT KH cặp)   │
  └────────────┬─────────────┘
               │
               ▼
  ┌──────────────────────────┐         ┌──────────────────────┐
  │   Nháp (DRAFT)            │────────▶│   Đã huỷ (CANCEL)   │
  │   Hiển thị: "Hoạt động"   │  Huỷ    │                      │
  │                           │  cascade│   Cascade huỷ        │
  │   Trạng thái thanh toán   │         │   phiếu QT KH cặp   │
  │   suy ra realtime         │         │   + mở lại SO       │
  └──────────────────────────┘         └──────────────────────┘
```

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
| --- | --- | --- | --- |
| *(Tạo mới)* | Tạo phiếu QT BH | DRAFT | SO loại "Dịch vụ xe" + có dòng BH + đã chọn DN BH master data (BR-INS-STL-CRE-008) + chưa có phiếu QT BH DRAFT cùng SO |
| DRAFT | *(Không có huỷ)* | — | **Phiếu QT BH không có chức năng huỷ** (chốt 2026-06-08). SO khoá vĩnh viễn sau khi tạo QT — không có đường sửa lại số liệu. |

### 3.2 Trạng thái thanh toán phiếu QT BH (derived — không lưu DB)

```
                      Σ(payment) = 0           0 < Σ(payment) < phải trả
   Tạo mới ────────► "Chưa thu" ─────────────► "Thu một phần" ─────────►
                                                                          │
                                                                          ▼
                                                              Σ(payment) ≥ phải trả
                                                                          │
                                                                          ▼
                                                                  "Đã thu đủ"
                                                              (+ badge "Thừa" nếu vượt)
```

| Trạng thái | Điều kiện | Hành động khả dụng |
| --- | --- | --- |
| Chưa thu | Σ(payment) = 0 | Ghi nhận thanh toán mới |
| Thu một phần | 0 &lt; Σ(payment) &lt; Bảo hiểm phải trả | Ghi nhận thanh toán mới |
| Đã thu đủ | Σ(payment) ≥ Bảo hiểm phải trả | Cho phép ghi nhận tiếp (sẽ hiện badge "Thừa") |
| Đã thu đủ (Bảo hiểm phải trả = 0) | Phiếu QT BH có "Bảo hiểm thanh toán" = 0 | Không cho ghi nhận thanh toán (form disable) |

### 3.3 Hồ sơ bảo hiểm (Draft → Exported)

```
   ┌─────────────────────┐
   │  Tạo hồ sơ          │
   │  (4 tài liệu)       │
   └─────────┬───────────┘
             │
             ▼ Điền template
   ┌─────────────────────┐
   │  Draft (chưa xuất)  │
   │  ① ✓ ② ✓           │
   │  ③ ⚠ ④ ⚠           │
   └─────────┬───────────┘
             │ Xuất PDF (tài liệu tích chọn đã "Sẵn sàng")
             ▼
   ┌─────────────────────┐
   │  Exported (bộ hồ sơ)│  ───►  Lưu tab "Hồ sơ đã xuất" (Immutable)
   └─────────┬───────────┘
             │ BH yêu cầu sửa → tạo bộ mới (điền lại template từ đầu)
             ▼
   ┌─────────────────────┐
   │  Exported (bộ mới)  │  ───►  Tab có nhiều bộ, phân biệt theo
   │  (Immutable)        │        ngày/lần xuất; bộ cũ vẫn xem được
   └─────────────────────┘        (KHÔNG có trạng thái "Đã thay thế")
```

| Trạng thái | Hành động khả dụng | Chú thích |
| --- | --- | --- |
| Draft (đang điền, chưa xuất) | Điền template, xuất PDF (tài liệu tích chọn đã "Sẵn sàng") | **KHÔNG auto-save draft** — dữ liệu chỉ được persist khi user nhấn **"Xuất hồ sơ bảo hiểm"** (chốt 2026-06-05). Đóng màn trước khi xuất → mất dữ liệu nhập. Không có chức năng "Sao chép từ bản trước". |
| Exported (mọi bộ đã xuất) | Xem PDF, tải PDF, tạo bộ mới | Chế độ **"Chỉ xem"** — không có nút sửa/xuất đè trên giao diện. **Không có trạng thái bộ hồ sơ** ("Đã thay thế"/"Replaced" không hiển thị); các bộ phân biệt theo ngày/lần xuất. |

> *(§3.4 cũ — vòng đời master data DN BH — đã gỡ: danh sách công ty BH là system-seeded production, garage không quản lý trạng thái.)*

---

## §4 Permission Rules

| Action | garage-owner | accountant | Condition |
| --- | --- | --- | --- |
| Đánh dấu Nguồn TT (BH/KH) per dòng trên SO | Cho phép | Cho phép | SO ở trạng thái cho phép sửa (kế thừa BR-SO-EDT-\*) |
| Nhập 5 khoản điều chỉnh BH trên SO | Cho phép | Cho phép | SO có ≥ 1 dòng BH |
| Chọn công ty BH từ dropdown trên SO | Cho phép | Cho phép | Danh sách system-seeded (không CRUD) |
| Tạo phiếu QT BH | Cho phép | Cho phép | SO có dòng BH + đã chọn công ty BH + SO đã hoàn thành |
| Xem chi tiết phiếu QT BH | Cho phép | Cho phép | Phiếu thuộc tenant |
| Ghi nhận thanh toán từ BH | Cho phép | Cho phép | Phiếu QT BH ở trạng thái DRAFT |
| Huỷ phiếu QT BH | Cho phép | Cho phép | Phiếu chưa có thanh toán (cascade huỷ phiếu QT KH cặp) |
| In phiếu QT BH | Cho phép | Cho phép | Phiếu ở trạng thái DRAFT |
| Tạo hồ sơ BH (v1 và v2+) | Cho phép | Cho phép | Phiếu QT BH ở DRAFT |
| Xuất PDF hồ sơ BH | Cho phép | Cho phép | 4/4 tài liệu "Sẵn sàng" |
| Xem hồ sơ BH đã xuất | Cho phép | Cho phép | Phiếu có ≥ 1 version đã xuất |
| Tải lại PDF hồ sơ đã xuất | Cho phép | Cho phép | File còn tồn tại trong object storage |
| Xem widget công nợ BH trên Dashboard | Cho phép | Cho phép | Tenant có ≥ 1 phiếu QT BH |
| Chọn công ty BH từ dropdown trên SO | Cho phép | Cho phép | Danh sách system-seeded (không CRUD) |

> Không có ngoại lệ phân quyền cho EP-INSURANCE-SETTLEMENT — cả 2 vai trò có quyền ngang nhau (giống baseline EP-SETTLEMENT).

---

## §5 Validation Rules

### 5.1 Phiếu dịch vụ — Nguồn thanh toán & điều chỉnh BH

> **Mã lỗi**: tham chiếu [`Product/error-code/ERROR-CODE-REGISTRY.md`](../error-code/ERROR-CODE-REGISTRY.md) — nguồn duy nhất BE/FE dùng chung (severity + display). Cột "Mã lỗi" bên dưới là contract; đổi text KHÔNG đổi mã.

| Rule | Validation | Error message | Mã lỗi | Features |
| --- | --- | --- | --- | --- |
| VLD-INS-SO-001 | Mỗi dòng vật tư/công DV trên SO loại "Dịch vụ xe" phải có `paymentSource` | ~~"Vui lòng chọn nguồn thanh toán cho tất cả các dòng"~~ — **gỡ**: mặc định Nguồn TT = Khách hàng nên không phát sinh (chốt 2026-06-11) | — | SO-PAYMENT-SOURCE |
| VLD-INS-SO-002 | Công ty BH bắt buộc chọn từ dropdown (khi toggle "Bảo hiểm = Có") | **"Vui lòng chọn công ty bảo hiểm"** | `ERR-INS-001` | SO-ADJUSTMENT |
| VLD-INS-SO-003 | % chiết khấu / khấu hao / giảm trừ ∈ \[0, 100\] | **"Chiết khấu không thể lớn hơn 100%"** / **"Khấu hao không thể lớn hơn 100%"** | `ERR-CMN-002` / `ERR-CMN-003` | SO-ADJUSTMENT |
| VLD-INS-SO-004 | Số tiền chiết khấu / giảm trừ / khấu trừ ≥ 0, ≤ tổng cơ sở tương ứng | **"Số tiền vượt quá số lượng cho phép"** | `ERR-CMN-001` | SO-ADJUSTMENT |
| VLD-INS-SO-005 | "Bảo hiểm thanh toán" tính ra &lt; 0 → **cảnh báo nhưng cho lưu** (không block — chốt PO 2026-06-02). **Hiển thị cảnh báo ở 2 vị trí** (chốt **CR-20260612-02** 2026-06-12): (1) inline tại panel "Phân bổ quyết toán bảo hiểm" màn Chỉnh sửa SO (AC-12); (2) **trong popup "Hoàn thành phiếu dịch vụ"** (FEAT-SO-DETAIL AC-16) khi SO có BH — **warn-and-allow**, vẫn cho ấn "Xác nhận" hoàn thành. | **"Bảo hiểm thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh"** | `ERR-INS-003` | SO-ADJUSTMENT (AC-12, AC-17) |

### 5.2 Tạo phiếu QT BH

| Rule | Validation | Error message | Mã lỗi | Features |
| --- | --- | --- | --- | --- |
| VLD-INS-STL-001 | SO phải có ≥ 1 dòng `paymentSource = BH` | **"Phiếu dịch vụ không có hạng mục thuộc bảo hiểm"** | `ERR-INS-004` | STL-CREATE |
| VLD-INS-STL-002 | SO phải đã chọn công ty BH từ dropdown | **"Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm"** | `ERR-INS-002` | SO-ADJUSTMENT |
| VLD-INS-STL-003 | SO chưa có phiếu QT BH DRAFT trùng | **"Đã tồn tại phiếu quyết toán bảo hiểm cho phiếu dịch vụ này"** | `ERR-INS-005` | STL-CREATE |
| VLD-INS-STL-004 | SO ở trạng thái cho phép quyết toán (kế thừa baseline) | **"Phiếu dịch vụ chưa hoàn thành"** | `ERR-CMN-009` | STL-CREATE |

### 5.3 Hồ sơ BH

| Rule | Validation | Error message | Mã lỗi | Features |
| --- | --- | --- | --- | --- |
| VLD-INS-DOSSIER-003 | Các tài liệu được tích chọn phải "Sẵn sàng" trước khi xuất PDF | **"Vui lòng hoàn tất các tài liệu còn thiếu"** | `ERR-INS-007` | DOSSIER-CREATE |

> *(§5.4 cũ — validation master data DN BH — đã gỡ: danh sách công ty BH là system-seeded production, không có form CRUD.)*

### 5.5 Error Code Registry (BE↔FE — single source of truth)

> **Nguyên tắc**: Back-end là **source of truth** của `code` + `category`; Front-end **bind UI theo `code`**, KHÔNG parse message text (message có thể override qua i18n dùng `code` làm key). Mỗi mã có đầy đủ **HTTP · loại message · message tiếng Việt dễ hiểu · AC/Nguồn**. Mã được nhúng tại đúng AC/EC trong từng FEAT (theo §4.3 skill `gen-ep-feat`). **19 mã gắn AC/EC + 3 mã cross-cutting = 22 mã** (đã loại 4 mã `INS-1001`, `INS-1007`, `INS-2101`, `INS-3005` — xem ghi chú cuối bảng).

| Code | Num | Category | HTTP | Loại message | Message (vi) | AC / Nguồn |
| --- | --- | --- | --- | --- | --- | --- |
| `INS_SO_COMPANY_REQUIRED` | INS-1002 | VALIDATION | 422 | Field-level | "Vui lòng chọn công ty bảo hiểm trước khi tiếp tục." | SO-ADJUSTMENT AC-2 · VLD-INS-SO-002 |
| `INS_ADJ_PERCENT_OUT_OF_RANGE` | INS-1003 | VALIDATION | 422 | Field-level | "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100." | SO-ADJUSTMENT AC-14 · VLD-INS-SO-003 |
| `INS_ADJ_AMOUNT_EXCEEDS_BASE` | INS-1004 | VALIDATION | 422 | Field-level | "Số tiền vượt quá mức cho phép" | SO-ADJUSTMENT AC-14 · VLD-INS-SO-004 |
| `INS_ADJ_VALUE_NEGATIVE` | INS-1005 | VALIDATION | 422 | Field-level | "Vui lòng nhập giá trị từ 0 trở lên." | SO-ADJUSTMENT AC-14 · VLD-INS-SO-004 |
| `INS_ADJ_BH_PAYMENT_NEGATIVE` | INS-1006 | WARNING | 200 | Cảnh báo (non-block) | "Số tiền bảo hiểm thanh toán đang nhỏ hơn 0. Vui lòng kiểm tra lại các khoản điều chỉnh." | SO-ADJUSTMENT AC-12 · CALC-INS-004 |
| `INS_STL_COMPANY_REQUIRED` | INS-2002 | VALIDATION | 422 | Toast | "Vui lòng chọn công ty bảo hiểm trên phiếu dịch vụ trước khi tạo phiếu quyết toán." | SO-ADJUSTMENT AC-15 · VLD-INS-STL-002 |
| `INS_STL_DUPLICATE_DRAFT` | INS-2003 | BUSINESS | 409 | Toast | "Phiếu dịch vụ này đã có phiếu quyết toán bảo hiểm." | SO-ADJUSTMENT AC-15 · VLD-INS-STL-003 |
| `INS_STL_SO_NOT_COMPLETED` | INS-2004 | VALIDATION | 422 | Toast | "Chỉ tạo được phiếu quyết toán khi phiếu dịch vụ đã hoàn thành." | SO-ADJUSTMENT AC-15 · VLD-INS-STL-004 |
| `INS_STL_PAIR_ATOMIC_FAILED` | INS-2005 | SYSTEM | 500 | Toast + traceId | "Tạo phiếu quyết toán không thành công. Vui lòng thử lại." | SO-ADJUSTMENT AC-15 · CB-INS-004 |
| `INS_STL_NOT_FOUND` | INS-2006 | NOT_FOUND | 404 | Error state | "Không tìm thấy phiếu quyết toán bảo hiểm." | STL-DETAIL AC-1 · chuẩn REST |
| `INS_DOSSIER_FILE_TOO_LARGE` | INS-3001 | VALIDATION | 413 | Field upload | "Dung lượng tệp vượt quá 30MB. Vui lòng chọn tệp nhỏ hơn." | DOSSIER-CREATE AC-14 · VLD-INS-DOSSIER-002 |
| `INS_DOSSIER_FILE_FORMAT_UNSUPPORTED` | INS-3002 | VALIDATION | 415 | Field upload | "Định dạng tệp không hỗ trợ. Chỉ chấp nhận PDF, JPG, PNG." | DOSSIER-CREATE AC-14 · VLD-INS-DOSSIER-002 |
| `INS_DOSSIER_NO_DOC_SELECTED` | INS-3003 | VALIDATION | 422 | Toast | "Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ." | DOSSIER-CREATE AC-9 · VLD-INS-DOSSIER-003 |
| `INS_DOSSIER_DOCS_INCOMPLETE` | INS-3004 | VALIDATION | 422 | Toast | "Một số tài liệu chưa hoàn tất: {danh sách}. Vui lòng hoàn tất trước khi xuất." | DOSSIER-CREATE AC-9 · VLD-INS-DOSSIER-003 |
| `INS_DOSSIER_VERSION_CONFLICT` | INS-3006 | CONFLICT | 409 | Dialog reload | "Hồ sơ vừa được người khác cập nhật. Vui lòng tải lại trang." | DOSSIER-CREATE EC-2 (optimistic lock) |
| `INS_DOSSIER_PDF_GENERATION_FAILED` | INS-3007 | SYSTEM | 500 | Toast | "Tạo PDF hồ sơ không thành công. Vui lòng thử lại." | DOSSIER-CREATE AC-15 / EC-6 |
| `INS_DOSSIER_STORAGE_TIMEOUT` | INS-3008 | STORAGE | 504 | Toast + retry | "Hệ thống lưu trữ đang bận. Vui lòng thử lại sau giây lát." | DOSSIER-CREATE EC-6 |
| `INS_DOSSIER_FILE_UNAVAILABLE` | INS-4001 | STORAGE | 502 | Toast (+ re-generate fallback) | "Không tải được hồ sơ. Vui lòng liên hệ quản trị viên." | DOSSIER-VIEW AC-9 · PRINT-INS-005 |
| `INS_DOSSIER_URL_EXPIRED` | INS-4002 | STORAGE | 410 | Silent / refresh | *(im lặng — tự tải lại liên kết)* | DOSSIER-VIEW EC-3 |

**Cross-cutting (không gắn AC — ghi Nguồn):**

| Code | Num | Category | HTTP | Message (vi) | Nguồn |
| --- | --- | --- | --- | --- | --- |
| `INS_FORBIDDEN_TENANT` | INS-9001 | AUTH | 403 | "Bạn không có quyền truy cập dữ liệu này." | CB-INS-001 (tenant isolation) |
| `INS_UNAUTHENTICATED` | INS-9002 | AUTH | 401 | "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." | Baseline auth |
| `INS_INTERNAL_ERROR` | INS-9000 | SYSTEM | 500 | "Đã có lỗi xảy ra. Vui lòng thử lại." | Fallback chung |

> **Mã đã loại bỏ (chốt 2026-06-08)**: `INS_SO_PAYMENT_SOURCE_REQUIRED` (INS-1001 — nguồn TT mặc định = Khách hàng, đã có baseline); `INS_SO_LOCKED_HAS_SETTLEMENT` (INS-1007), `INS_STL_CANCEL_HAS_PAYMENT` (INS-2101), `INS_DOSSIER_SETTLEMENT_CANCELLED` (INS-3005 — phiếu QT BH **không có chức năng huỷ**, SO khoá vĩnh viễn không cho sửa).
>
> **DEFERRED**: dải `INS-5xxx` (FEAT-INS-DASH-DEBT) — cấp khi feature vào scope.

---

## §6 Dependency Rules

| Dependency | Loại | Mô tả |
| --- | --- | --- |
| `EP-SERVICE-ORDER` (baseline) | Upstream — Foundation + Extends | Năng lực `paymentSource` per line + dropdown công ty BH + thông tin BH trên SO **đã có ở production** (foundation). FEAT-INS-SO-ADJUSTMENT mở rộng entity SO thêm 5 trường điều chỉnh BH header (section "Phân bổ quyết toán bảo hiểm"). Không thay thế baseline FEAT-SO-CREATE/EDIT. |
| `EP-SETTLEMENT` (baseline) | Upstream — Foundation + Extends | **Tạo phiếu QT (cặp KH+BH) đã production** (foundation). Phần mới: truyền block `insuranceAdjustment` khi tạo phiếu QT (FEAT-INS-SO-ADJUSTMENT AC-15). FEAT-INS-STL-DETAIL **tái sử dụng** RecordSettlementPayment mutation baseline cho đối soát thanh toán BH. |
| `EP-DASHBOARD` (baseline) | Upstream — Extends | FEAT-INS-DASH-DEBT mở rộng FEAT-DASH-VIEW (thêm widget công nợ BH). Không thay thế các widget hiện có. |
| `EP-CUSTOMER`, `EP-VEHICLE` (baseline) | Upstream — Data ref | Thông tin KH & xe in trên các tài liệu hồ sơ BH (Phiếu báo giá, Phiếu quyết toán). Snapshot từ SO, không truy vấn realtime. |
| `EP-CATALOG` (baseline) | Sibling (no impact) | Danh sách công ty BH là system-seeded production (đã bỏ FEAT-INS-COMPANY-\*). EP-CATALOG không bị ảnh hưởng. |
| `gf-accounting` | Boundary chính | Phiếu QT BH, hồ sơ BH (versioning + PDF), đối soát thanh toán BH. Architect quyết định cuối khi spawn dev. |
| `gf-sales` | Boundary phụ | Mở rộng SO entity (Nguồn TT + điều chỉnh BH header) + widget công nợ BH trên Dashboard. |
| `agg-garage-graph` | Gateway | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp backend. |
| Object storage (S3 hoặc tương đương) | Infrastructure | Lưu PDF hồ sơ BH + file scan đính kèm. Signed URL TTL hợp lý. |

---

## §7 Calculation Rules (đặc biệt cho insurance)

### 7.1 Cơ sở tính các khoản điều chỉnh

> **Cơ sở tính = "Cộng sau VAT" theo bên thanh toán** (xác nhận production screenshot 2026-05-27), KHÔNG phải tổng thành tiền trước VAT.

| Khoản | Cơ sở tính (chế độ %) | Áp dụng cho | Dấu trên panel |
| --- | --- | --- | --- |
| CK liên kết BH — Vật tư | Cộng sau VAT phần vật tư thuộc BH | gf-sales (header SO) | − (giảm BH, không sang KH) |
| CK liên kết BH — Công DV | Cộng sau VAT phần công DV thuộc BH | gf-sales (header SO) | − (giảm BH, không sang KH) |
| Khấu hao vật tư/thay mới | **% khấu hao trên phụ tùng (vật tư) BH** — chỉ phụ tùng, không công DV. Số tiền = Σ(thành tiền phụ tùng BH × % khấu hao dòng). Có % per dòng + "Áp dụng tất cả" set đồng loạt | gf-sales (header + line phụ tùng) | \+ (chuyển sang KH) |
| Giảm trừ bồi thường | Tổng Cộng sau VAT thuộc BH (khi mode = PERCENT) | gf-sales (header SO) | \+ (chuyển sang KH) |
| Khấu trừ bảo hiểm | Không có cơ sở % (chỉ nhập số tiền) | gf-sales (header SO) | \+ (chuyển sang KH) |

### 7.2 Công thức chính

```
Cộng sau VAT (BH)            = Σ(dịch vụ BH) + Σ(phụ tùng BH) + Σ(thuế các dòng BH)
Cộng sau VAT (KH)            = Σ(dịch vụ KH) + Σ(phụ tùng KH) + Σ(thuế các dòng KH)
                            # Thuế do người dùng tự nhập per dòng — không cố định 10%

Tổng CK liên kết BH          = CK liên kết vật tư + CK liên kết công DV
                             (mỗi khoản: mode = PERCENT thì = % × cơ sở; AMOUNT thì = số tiền)

BH thanh toán                = Cộng sau VAT (BH)
                               − Tổng CK liên kết BH
                               − Giảm trừ bồi thường
                               − Khấu hao vật tư/thay mới
                               − Khấu trừ bảo hiểm

Khách hàng thanh toán        = Cộng sau VAT (KH)
                               + Giảm trừ bồi thường
                               + Khấu hao vật tư/thay mới
                               + Khấu trừ bảo hiểm
                             (CK liên kết BH KHÔNG cộng sang KH — khoản giữa garage và BH)

Tổng thanh toán              = BH thanh toán + Khách hàng thanh toán

Còn phải thu BH              = BH thanh toán − Σ(các đợt BH đã thanh toán)
```

**Ví dụ thực (production screenshot 2026-05-27)**: Cộng sau VAT BH 207.900.000 / KH 33.000.000; điều chỉnh CK vật tư −5.000.000, CK công DV −2.500.000, giảm trừ +2.000.000, khấu hao +200.000, khấu trừ +520.000 → **BH thanh toán 197.680.000** + **Khách hàng thanh toán 35.720.000** = **Tổng 233.400.000**.

### 7.3 Quy tắc tính toán bổ sung

| Rule | Mô tả |
| --- | --- |
| CALC-INS-001 | Tất cả số tiền tính ra (Bảo hiểm thanh toán, KH chịu từ điều chỉnh BH, Tổng KH thanh toán) đều tính **server-side** khi tạo phiếu QT BH — client-side chỉ hiển thị realtime để preview. Server là nguồn chốt khi có chênh lệch. |
| CALC-INS-002 | Khi chế độ chiết khấu = PERCENT và cơ sở thay đổi (vd line item đổi giá hoặc đổi Nguồn TT) → hệ thống tự tính lại số tiền quy đổi. Khi mode = AMOUNT, giữ nguyên số tiền cố định (không phụ thuộc cơ sở). |
| CALC-INS-003 | Khấu hao vật tư per dòng có ưu tiên cao hơn khấu hao đồng loạt — quy tắc precedence rõ ràng để Dev/Test không nhầm. |
| CALC-INS-004 | Khi Bảo hiểm thanh toán tính ra &lt; 0 → **vẫn cho lưu (cảnh báo, không block)**, phiếu QT BH có Bảo hiểm thanh toán âm/0 vẫn tạo được (audit purpose). **Chốt PO 2026-06-02** (FEAT-INS-SO-ADJUSTMENT AC-12 + EC-2). |
| CALC-INS-005 | Làm tròn số: tất cả giá trị tiền tệ tính ra làm tròn đến đơn vị VND (không có phần thập phân). Quy tắc **half-up** (chốt 2026-06-05): phần thập phân **< 0.5 giữ nguyên (làm tròn xuống)**, **≥ 0.5 làm tròn lên 1 đơn vị**. |

---

## §8 Print & Export Rules (in & xuất PDF)

| Rule | Mô tả |
| --- | --- |
| PRINT-INS-001 *(CR-20260616-01 — chi tiết 5 khoản dấu −)* | Phiếu QT BH có **template in riêng** (khác phiếu QT KH baseline) — chứa: thông tin KH/xe/DN BH, hạng mục thuộc BH (vật tư + công DV), bảng phân bổ chi tiết. **Khối tổng tiền (`note-total`) bổ sung section "Phân bổ bảo hiểm"** liệt kê **5 khoản điều chỉnh BH** với **dấu âm** (BH gánh): "CK liên kết BH - Vật tư", "CK liên kết BH - Công dịch vụ", "Giảm trừ bồi thường", "Khấu hao vật tư / thay mới", "Khấu trừ bảo hiểm" → trước dòng "Tổng thanh toán". Mẫu in: `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-insurance.html`. |
| PRINT-INS-007 *(CR-20260616-01 — phiếu KH từ SO có BH)* | Phiếu QT **KH chi trả đi từ SO có chọn Bảo hiểm** bổ sung section **"Phân bổ bảo hiểm"** trên bản in — liệt kê **3 khoản BH chuyển sang KH chịu** với **dấu dương**: "Giảm trừ bồi thường", "Khấu hao vật tư / thay mới", "Khấu trừ BH" → trước dòng "Tổng thanh toán". **Ẩn** 2 khoản "CK liên kết BH - Vật tư" + "CK liên kết BH - Công dịch vụ" (chỉ ảnh hưởng bên BH, không chuyển KH — chốt BA/PO 2026-06-16). Phiếu QT KH đi từ SO **không** chọn Bảo hiểm: **giữ bản in baseline**, không có section "Phân bổ bảo hiểm". Cờ điều kiện `soHasInsurance` do BFF/snapshot trả (tái dùng cờ CR-20260612-01). Mẫu in: `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-customer.html`. Bản in cũ trước CR giữ layout cũ — PDF gốc bất biến không re-generate (PRINT-INS-005). Dấu +/− và nhãn khoản phải khớp panel màn chi tiết QT (BR-INS-STL-DET-009) — tránh lệch số/nhãn giữa màn và giấy. |
| PRINT-INS-002 | Hồ sơ BH xuất **PDF riêng cho mỗi tài liệu được tích chọn** (tối đa 4, KHÔNG gộp 1 file): Phiếu quyết toán.pdf, Phiếu báo giá.pdf, Biên bản nghiệm thu.pdf, Giấy ủy quyền nhận tiền bồi thường.pdf. 1 lần xuất = 1 bộ hồ sơ. Xuất theo checkbox (không bắt buộc 4/4) — chốt 2026-05-27. |
| PRINT-INS-003 | Mỗi tài liệu trong hồ sơ BH có header chung (logo garage, mã phiếu QT BH, version số, ngày xuất) để dễ đối chiếu. |
| PRINT-INS-004 | Số tiền hiển thị bằng chữ tiếng Việt trên Phiếu báo giá và Phiếu quyết toán (kế thừa baseline BR-STL-DTL-005). |
| PRINT-INS-005 | PDF gốc đã xuất lưu trong object storage và không re-generate khi user tải lại — đảm bảo bản gửi BH bất biến (kế thừa BR-INS-DOSSIER-006, BR-INS-DOSSIER-VIEW-003). **Ngoại lệ recovery (chốt PO 2026-06-02)**: nếu file gốc **mất khỏi storage**, hệ thống **re-generate từ snapshot** — khả thi & khớp bản gốc vì hệ thống **chỉ dùng 1 template** mỗi loại tài liệu (không cần lưu template version). Xem FEAT-INS-DOSSIER-VIEW AC-9/EC-4. |
| PRINT-INS-006 | Nút **"In toàn bộ hồ sơ"** trên phiếu QT BH (FEAT-INS-STL-DETAIL AC-12) in/xuất = **phiếu QT BH + bộ hồ sơ BH đã xuất gần nhất** (chốt PO 2026-06-02). Nếu chưa từng xuất bộ hồ sơ nào → chỉ in phiếu QT BH. |

---

## §9 Phân tích & Đề xuất

### 9.1 Conflict / Overlap detected

| ID | Mô tả | Mức độ |
| --- | --- | --- |
| CNF-INS-001 | **Tổng tiền bảo hiểm trả** trên phiếu QT BH: baseline BR-STL-CRE-005 cho phép nhập tay; rule mới (BR-INS-STL-CRE-003 + BR-INS-STL-DET-002) chuyển sang computed read-only. Quyết định: ưu tiên rule mới (computed) — baseline rule vẫn áp dụng cho phiếu QT KH (không phải BH). **Áp dụng cả màn Tạo phiếu quyết toán** (FEAT-INS-STL-CREATE AC-6): trường "Tổng tiền bảo hiểm trả" của bên BH = read-only = "Bảo hiểm thanh toán" computed từ panel "Cân thanh toán"; KHÔNG nhập tay cho bên BH. | RESOLVED tại EP v2 (mở rộng màn tạo 2026-06-12) |
| CNF-INS-002 | **"Tổng tiền khách trả"** trên phiếu QT KH liên kết: **CHỐT (2026-06-05)** — server **tự cộng** khoản "KH chịu từ điều chỉnh BH" vào "Tổng tiền khách trả" của phiếu QT KH liên kết và **hiển thị chi tiết các đầu mục điều chỉnh** (giảm trừ bồi thường, khấu hao vật tư/thay mới, khấu trừ bảo hiểm) trên phiếu QT KH. Kế toán **không cộng tay** (FEAT-INS-SO-ADJUSTMENT AC-15). | RESOLVED tại 2026-06-05 |
| CNF-INS-003 | **Sửa SO sau khi đã có phiếu QT BH**: **CHỐT (PO 2026-06-02; cập nhật 2026-06-10)** — sau khi tạo phiếu QT, SO **khoá hoàn toàn, KHÔNG cho sửa** (theo logic production hiện hữu). **Giao diện người dùng KHÔNG có hành động huỷ phiếu quyết toán** (không trạng thái Draft/Cancel trên UI — chốt 2026-06-10): **không còn escape-hatch "huỷ phiếu QT để sửa"** trên UI; mọi điều chỉnh sau khi đã tạo phiếu QT xử lý ở data model/backend (baseline EP-SETTLEMENT). Snapshot phân bổ là cứng. Đồng bộ FEAT-INS-SO-ADJUSTMENT AC-15/EC-5 + FEAT-INS-STL-DETAIL EC-1. | RESOLVED (cập nhật 2026-06-10) |

### 9.2 Missing rules

| ID | Mô tả | Mức độ |
| --- | --- | --- |
| MISS-INS-001 | **Threshold tuổi nợ cảnh báo** trên widget Dashboard (BR-INS-DASH-004): hiện đề xuất &gt;30 ngày, cần BA chốt số chính xác. | ⚠ NEED CLARIFICATION |
| MISS-INS-002 | **Số đợt thanh toán BH tối đa** cho 1 phiếu QT BH: chốt PRD v5 tái sử dụng baseline (không giới hạn). Cần verify không có constraint ẩn nào ở FEAT-STL-DETAIL baseline. | ⚠ NEED CLARIFICATION |
| MISS-INS-003 | **Audit trail tạo/sửa/huỷ phiếu QT BH + hồ sơ BH**: chưa có BR yêu cầu ghi log ai/khi nào/sửa gì. Nghiệp vụ tài chính BH cần audit cao — đề xuất bổ sung. | ⚠ NEED CLARIFICATION |
| MISS-INS-004 | **Concurrent edit phiếu QT BH** (2 user cùng mở): chưa có optimistic lock rule. | ⚠ NEED CLARIFICATION |
| ~~MISS-INS-005~~ | **Retention policy** cho PDF hồ sơ BH đã xuất: **CHỐT (PO 2026-06-02)** — **lưu vĩnh viễn, KHÔNG cho xoá** bộ hồ sơ đã xuất (không có auto-purge trong scope). Đồng bộ FEAT-INS-DOSSIER-VIEW BR-005/EC. | RESOLVED tại PO sign-off 2026-06-02 |
| MISS-INS-006 | **Snapshot tên công ty BH trên phiếu QT BH + hồ sơ BH**: snapshot tên tại thời điểm tạo (đề xuất snapshot cả thông tin liên hệ vào PDF gốc để giữ historical accuracy). | ⚠ NEED CLARIFICATION |
| ~~MISS-INS-007~~ | ~~Trường mở rộng master data DN BH~~ — **N/A** (đã bỏ FEAT-INS-COMPANY-\*; danh sách công ty BH là system-seeded). | RESOLVED |
| ~~MISS-INS-008~~ | ~~Pattern Mã DN BH auto-sinh~~ — **N/A** (đã bỏ FEAT-INS-COMPANY-\*). | RESOLVED |

### 9.3 Đề xuất cải tiến

1. **Snapshot toàn bộ thông tin DN BH** vào phiếu QT BH (không chỉ ID + tên) — bao gồm địa chỉ, SĐT để bản in PDF gốc giữ historical accuracy khi DN BH đổi thông tin sau này.
2. **Bổ sung audit log** cho 3 thao tác trọng yếu: tạo phiếu QT BH, xuất PDF hồ sơ, ghi nhận thanh toán BH. Mỗi log lưu: user + timestamp + IP (nếu có) + change diff.
3. **Optimistic lock** cho phiếu QT BH (version field) — tránh 2 user cùng huỷ/sửa.
4. **Chốt threshold tuổi nợ**: đề xuất &gt;30 ngày là cảnh báo vàng, &gt;60 ngày cảnh báo đỏ, &gt;90 ngày escalate. Cần BA xác nhận.
5. **Quy trình rõ ràng khi BH yêu cầu sửa**: tách 2 case (a) sửa hồ sơ thôi (không đụng phiếu QT BH) — tạo bản hồ sơ mới versioning; (b) sửa số liệu QT BH — huỷ cặp phiếu QT, sửa SO, tạo lại cặp QT, tạo bản hồ sơ mới. Document rõ flow để tránh nhầm.
6. **Định nghĩa retention policy** cho PDF hồ sơ BH (compliance kế toán/thuế VN thường yêu cầu lưu 10 năm).
7. **Bổ sung notification** khi phiếu QT BH có tuổi nợ vượt threshold — đề xuất P2 (sau MVP).

---

## §10 Change Log

| Date | Version | Author | Description |
| 2026-06-18 | 32 | Delivery Authority (BE/raw cascade) | **Thực thi CR-20260616-01 cascade BE/raw** (APPROVED 2026-06-16, slot W02 Phase A): (1) **rewrite PRINT-INS-001** §8 — phiếu BH bản in bổ sung section "Phân bổ bảo hiểm" 5 khoản dấu − (CK liên kết BH × 2 / Giảm trừ bồi thường / Khấu hao VT-thay mới / Khấu trừ BH); (2) **thêm PRINT-INS-007** §8 — phiếu KH từ SO có BH bổ sung section "Phân bổ bảo hiểm" 3 khoản dấu + (Giảm trừ bồi thường / Khấu hao / Khấu trừ BH); ẩn 2 khoản CK liên kết BH trên phiếu KH (chốt 2026-06-16); phiếu QT KH từ SO không BH giữ baseline; cờ điều kiện `soHasInsurance` tái dùng CR-20260612-01; (3) **mở rộng BR-INS-STL-DET-005** §2.4 — đồng bộ cross-ref PRINT-INS-001/007 + 2 mockup HTML `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html`. Cascade FEAT-INS-STL-DETAIL §5 + UX-FLOW Bước 9 (lưu ý bản in). |
| 2026-06-18 | 31 | BA/PO (anhluong) | **BR-INS-DOSSIER-005**: gỡ gate "Tài liệu được chọn phải 'Sẵn sàng'" — rule không chính xác. Mọi tài liệu được tích chọn đều được xuất ngay, không phụ thuộc trạng thái điền template (đồng bộ FEAT-INS-DOSSIER-CREATE v22 — gỡ EC-4 + BR-002/003/004 gating). |
| 2026-06-12 | 30 | BA/PO (anhluong) | **Reconcile BR numbering FEAT ↔ BR-EP (BR-EP canonical)**: FEAT §5 của FEAT-INS-STL-DETAIL + FEAT-INS-SO-ADJUSTMENT đã rewrite dùng đúng ID BR-EP (bỏ hệ FEAT-local). Gỡ ghi chú "= FEAT-local" khỏi BR-INS-STL-DET-009 + BR-INS-SO-ADJ-010 (không còn cần). Fix header §2.4 (001..008 → **001..009**). Cập nhật cross-ref ở FEAT-INS-STL-CREATE/DOSSIER-CREATE/DOSSIER-VIEW + demos W01/W02 + CR ledger sang ID canonical. Mapping: STL-DET 001→002/002→PRINT-INS-006/004→007/005→009; SO-ADJ 002→002+003/003→004/004→005/005→§7/006+007→008/008→006/009→007/010→009/011→010. (Figma prefetch specs auto-gen — bỏ qua, tự đúng khi re-prefetch W02.) |
| 2026-06-15 | 29 | Business Authority | **Thực thi CR-20260612-01 + 02** (APPROVED, đầu W02): (1) **rewrite BR-INS-STL-DET-009** — panel chi tiết QT tách per-payer (đảo logic 2-cột v23): phiếu BH chỉ 1 cột BH (bỏ cột/dòng KH, giữ "Tổng thanh toán"); phiếu KH từ SO có BH thêm section "Phân bổ Bảo hiểm" các khoản chuyển sang KH; NEED CONFIRMATION 2 khoản CK liên kết BH trên phiếu KH; (2) **mở rộng VLD-INS-SO-005** — cảnh báo "BH thanh toán âm" thêm vị trí hiển thị tại popup "Hoàn thành phiếu dịch vụ" (FEAT-SO-DETAIL AC-16), warn-and-allow, `ERR-INS-003`, gắn AC-12+AC-17. Nguồn FEAT-INS-STL-DETAIL v15, FEAT-INS-SO-ADJUSTMENT v23. |
| 2026-06-12 | 29 | BA/PO (anhluong) | **2 CR slot đầu W02**: **CR-20260612-01** — rewrite **BR-INS-STL-DET-009** (đảo quy tắc v23): màn chi tiết phiếu QT tách hiển thị panel theo bên thanh toán — phiếu BH chỉ cột "Bảo hiểm thanh toán" (bỏ KH), giữ "Phân bổ Bảo hiểm"; phiếu KH chỉ cột "Khách hàng thanh toán" + "Phân bổ Bảo hiểm" chỉ khi SO có BH (CNF-INS-002). **CR-20260612-02** — thêm **BR-INS-SO-ADJ-010** (§2.2 header → 001..010): popup "Hoàn thành phiếu dịch vụ" cảnh báo Tổng BH thanh toán âm, warn-and-allow. Ghi chú: BR-INS-SO-ADJ-009 — panel trên SO giữ 2 cột (không áp CR-01). Đồng bộ FEAT-INS-STL-DETAIL v14, FEAT-INS-SO-ADJUSTMENT v22, Tracking/CHANGE-REQUESTS.md v1. |
| 2026-06-15 | 28 | Business Authority | **Thêm BR-INS-STL-CRE-009** — panel "Tổng giá dịch vụ" read-only trên màn **Tạo phiếu quyết toán** (snapshot phân bổ từ SO, không cho nhập/sửa); hiển thị có điều kiện theo SO chọn Bảo hiểm (SO có BH → 3 khối đầy đủ; không BH → rút gọn 1 cột KH). Tính server-side (BR-INS-STL-CRE-003). Song song BR-INS-SO-ADJ-009 (panel trên SO) + BR-INS-STL-DET-009 (panel trên chi tiết QT). §2.3 header → 001..009. Nguồn: FEAT-INS-STL-CREATE v4. *(Ghi chú drift đã biết: FEAT-world numbering panel = SO-ADJ-010/STL-DET-005 ≠ BR-EP canonical SO-ADJ-009/STL-DET-009 — reconcile ở v30.)* |
| 2026-06-12 | 28 | Business Authority | **Thêm BR-INS-STL-CRE-009 (display rule màn Tạo phiếu QT)** cho feature mới FEAT-INS-STL-CREATE: panel "Tổng giá dịch vụ" read-only (snapshot từ SO) trên màn tạo phiếu QT, hiển thị có điều kiện theo SO có/không BH (song song BR-INS-SO-ADJ-010 + BR-INS-STL-DET-005). §2.3 header → 001..009 + intro thêm phần (b) hiển thị panel. Map FEAT-INS-STL-CREATE vào BR-INS-STL-CRE-001/002/003 (cột Áp dụng). **CNF-INS-001** mở rộng: trường "Tổng tiền bảo hiểm trả" bên BH trên màn Tạo = read-only = computed (resolve FEAT AC-6 — đã chốt sẵn tại EP v2, không phải open question mới). |
| 2026-06-11 | 27 | BA/PO (anhluong) | **Bỏ "Sao chép từ bản trước" + trạng thái bộ hồ sơ** (chốt E-4/E-5): **gỡ BR-INS-DOSSIER-008** (Sao chép từ bản trước); BR-INS-DOSSIER-007 — tạo bộ mới = điền lại từ đầu, không có trạng thái bộ ("Đã thay thế"/"Replaced" không hiển thị), phân biệt theo ngày/lần xuất; §3.3 lifecycle đổi "Draft → Exported → Replaced" → "Draft → Exported" (gỡ Replaced + Sao chép + version label trong sơ đồ + bảng trạng thái). |
| 2026-06-11 | 26 | BA/PO (anhluong) | **Bỏ chức năng upload file scan** (chốt B-3): BR-INS-DOSSIER-003/004 → Biên bản + Giấy ủy quyền **điền template trực tiếp, KHÔNG upload scan**; BR-INS-DOSSIER-006 bỏ "upload thêm"; BR-INS-DOSSIER-008 copy nội dung template (bỏ "file đã upload"); lifecycle "Điền/upload" → "Điền template"; **gỡ VLD-INS-DOSSIER-001 (`ERR-INS-006`) + VLD-INS-DOSSIER-002 (`ERR-CMN-004/005`)** khỏi §5.3. Đồng bộ FEAT-INS-DOSSIER-CREATE v17, FEAT-INS-DOSSIER-VIEW v13, UX-FLOW, ERROR-CODE-REGISTRY. |
| 2026-06-11 | 25 | BA/PO (anhluong) | **Gắn mã lỗi (`Product/error-code/ERROR-CODE-REGISTRY.md`) vào §5 Validation Rules** — thêm cột **Mã lỗi** cho 3 bảng (§5.1/§5.2/§5.3), map VLD-INS-* → ERR-CMN-*/ERR-INS-*. Canonical-hoá wording theo registry: VLD-INS-SO-002 → "Vui lòng chọn công ty bảo hiểm" (`ERR-INS-001`); VLD-INS-SO-004 → "Số tiền vượt quá số lượng cho phép" (`ERR-CMN-001`, gỡ biến); VLD-INS-DOSSIER-003 → "Vui lòng hoàn tất các tài liệu còn thiếu" (`ERR-INS-007`, gỡ biến). Gỡ message VLD-INS-SO-001 (mặc định Nguồn TT = KH, không phát sinh — không cấp mã). |
| --- | --- | --- | --- |
| 2026-06-10 | 24 | BA/PO (anhluong) | **Thêm BR-INS-SO-ADJ-009 — validate hiển thị panel "Tổng giá dịch vụ" + cột "Khấu hao VT" trên Phiếu dịch vụ theo SO có Bảo hiểm** (theo production screenshot): panel hiển thị cả SO có/không BH nhưng phần BH (Phân bổ Bảo hiểm + cột/dòng BH) chỉ khi có BH, SO không BH rút gọn 1 cột KH; cột "Khấu hao VT" trên bảng phụ tùng chỉ hiện khi có BH. Song song BR-INS-STL-DET-009 (phiếu QT). §2.2 header → 001..009. Đồng bộ FEAT-INS-SO-ADJUSTMENT v20. |
| 2026-06-10 | 23 | BA/PO (anhluong) | **Thêm BR-INS-STL-DET-009 — validate hiển thị panel "Tổng giá dịch vụ" theo Bên thanh toán** (theo production screenshot): panel hiển thị cả 2 loại phiếu QT nhưng phần đặc thù BH (section "Phân bổ Bảo hiểm" + cột/dòng "Bảo hiểm thanh toán") chỉ ở phiếu BH; phiếu KH rút gọn 1 cột. Panel không ẩn hẳn (khác BR-INS-STL-DET-007). Đồng bộ FEAT-INS-STL-DETAIL v13 (AC-6 + BR-INS-STL-DET-005). |
| 2026-06-10 | 22 | BA/PO (anhluong) | **Consistency fix (sau gỡ cancel/draft)**: (1) **CNF-INS-003** §9 — gỡ luồng "huỷ phiếu QT để sửa SO" + chữ DRAFT, cập nhật: SO khoá hoàn toàn, UI không có hành động huỷ, điều chỉnh xử lý ở backend; fix ref EC-2→EC-1; (2) **BR-INS-STL-CRE-008** — gỡ dangling ref tới FEAT-INS-STL-DETAIL AC-11 (đã thành tombstone), giữ ref FEAT-INS-SO-ADJUSTMENT AC-2. Phát hiện khi chạy gen-product-sync. |
| 2026-06-10 | 21 | BA/PO (anhluong) | **Xoá VLD-INS-DOSSIER-004** (chặn tạo hồ sơ khi phiếu QT ở trạng thái DRAFT/đã huỷ) — **giao diện người dùng KHÔNG có trạng thái phiếu quyết toán Draft & Cancel**, nên validation chặn theo trạng thái này vô nghĩa. Đồng bộ FEAT-INS-DOSSIER-VIEW v10 (xoá AC-10 + BR-INS-DOSSIER-VIEW-006 xử lý phiếu CANCEL). |
| 2026-06-10 | 20 | BA/PO (anhluong) | **BR-INS-STL-DET-007 — validate hiển thị element đặc thù BH theo Bên thanh toán**: gộp điều kiện hiển thị 3 element (nút "+ Tạo hồ sơ bảo hiểm", nút "Xuất hồ sơ bảo hiểm (PDF)", tab "Hồ sơ bảo hiểm đã xuất") = **chỉ khi Bên thanh toán = Bảo hiểm**, ẩn hoàn toàn với phiếu QT Khách hàng; **gỡ điều kiện trạng thái DRAFT** (giao diện không có trạng thái phiếu Draft). Đồng bộ FEAT-INS-STL-DETAIL v9, UX-FLOW v13. |
| 2026-06-05 | 19 | BA/PO (anhluong) | **Resolve 4 NEED CONFIRMATION + defer nhóm Dashboard**: (1) **BR-INS-STL-DET-008** — overpayment: phần thừa xử lý **ngoài hệ thống**, KHÔNG auto negative adjustment; (2) **§3 states / Draft** — **KHÔNG auto-save draft hồ sơ BH**, chỉ persist khi nhấn "Xuất hồ sơ bảo hiểm" (đồng bộ FEAT-INS-DOSSIER-CREATE EC-1/EC-2, UX-FLOW §5.2); (3) **CALC-INS-005** — làm tròn **half-up**: <0.5 giữ nguyên, ≥0.5 lên 1 đơn vị; (4) **CNF-INS-002 → RESOLVED** — server **tự cộng** "KH chịu từ điều chỉnh BH" vào Tổng tiền khách trả phiếu QT KH + hiển thị chi tiết đầu mục điều chỉnh. **DEFERRED**: nhóm BR-INS-DASH-004/005 (Dashboard ngoài scope sóng hiện tại — skip khi chạy sóng). Đồng bộ UX-FLOW v12, FEAT-INS-DOSSIER-CREATE v13, FEAT-INS-DASH-DEBT v5. |
| 2026-06-02 | 18 | PO (cuongnguyen_ac) + Business Authority | **Re-sync PO sign-off (resolve NEED CONFIRMATION/CLARIFICATION)** — re-apply sau khi v17 (insuranceCode removal) ghi đè lượt sync trước: (1) **VLD-INS-SO-005 + CALC-INS-004** — BH thanh toán âm: cho lưu kèm cảnh báo, không block; (2) **CNF-INS-003 → RESOLVED** — SO khoá hoàn toàn sau khi tạo phiếu QT; sửa = huỷ cặp QT (reopen SO) → tạo lại; snapshot cứng; (3) **MISS-INS-005 → RESOLVED** — hồ sơ BH lưu vĩnh viễn, không xoá; (4) **PRINT-INS-005** — ngoại lệ recovery: re-generate từ snapshot khi mất file (1 template); (5) **+PRINT-INS-006** — "In toàn bộ hồ sơ" = phiếu QT BH + bộ hồ sơ gần nhất. Đồng bộ FEAT-INS-SO-ADJUSTMENT v15, FEAT-INS-STL-DETAIL v6, FEAT-INS-DOSSIER-VIEW v6, UX-FLOW v10. *(T1 — owner resolve open question; orthogonal với insuranceCode removal v17.)* |
| 2026-06-02 | 17 | Delivery Authority | **Bỏ `insuranceCode` / `insurance_code`**: gf-sales `insurance_company` (VARCHAR baseline) đã lưu mã CTBH (v.d. `INS_BSH`) — KHÔNG phải free-text. gf-accounting lấy thông tin CTBH qua REST `for-settlement`. Sửa CB-INS-002 (bỏ `insuranceCode` snapshot), CB-INS-006 (clarify `insurance_company` code-based, bỏ `insurance_code`), BR-INS-STL-CRE-002 (snapshot dùng `insuranceCompany` baseline). ADR-014 v5. |
| 2026-06-01 | 16 | Business Authority | **Đổi tham chiếu DN BH** `insuranceCompanyId` **(id) →** `insuranceCode` **(**`mdm_catalog.code`**,** `directory='INSURANCE'`**)** trong CB-INS-002 + BR-INS-STL-CRE-002; CB-INS-006 ghi rõ master `directory='INSURANCE'` + snapshot code+tên. Đồng bộ ADR-014 v4 + data-model/api/event/integration (Architecture) + PKG-W01 (Execution). Convention baseline code-based (agg-garage-graph `catalog/find-by-code`). |
| 2026-05-27 | 2 | Business Authority | **Correction luồng nghiệp vụ**: thêm BR-INS-SO-PS-006 + cập nhật BR-INS-SO-ADJ-001 — phần phân bổ BH (Nguồn TT + section điều chỉnh) chỉ ở màn **Chỉnh sửa (Edit) + Chi tiết (Detail)**, KHÔNG ở Tạo (Create). Lý do: Create = báo giá sơ bộ gửi BH duyệt → Edit nhập phân bổ đã duyệt. Đồng bộ với PRD v7, EP v3, FEAT-INS-SO-PAYMENT-SOURCE v2, FEAT-INS-SO-ADJUSTMENT v3, UX-FLOW v2. |
| 2026-05-27 | 3 | Business Authority | Thêm note §2.1: *BR-INS-SO-PS- document hành vi BASELINE đã production*\* (chọn bên thanh toán per dòng đã có sẵn) — không phải yêu cầu build mới. FEAT-INS-SO-PAYMENT-SOURCE = foundation, không dev lần này. Đồng bộ FEAT-INS-SO-PAYMENT-SOURCE v3 (status DONE), EP v4, PRD v8. |
| 2026-05-27 | 5 | Business Authority | **Xoá FEAT-INS-SO-PAYMENT-SOURCE** (đã production). §2.1 BR-INS-SO-PS-\* giữ nguyên (document hành vi baseline) nhưng cột "Áp dụng" đổi từ feature ref → "baseline (EP-SERVICE-ORDER)". §6 dependency EP-SERVICE-ORDER → "Foundation + Extends". Đồng bộ EP v6, PRD v9. |
| 2026-05-27 | 7 | Business Authority | Sửa BR-INS-SO-ADJ-001: trigger hiển thị section = chọn **"Có"** tại mục Bảo hiểm (cùng trigger khu vực thông tin BH), không phải "có dòng Nguồn TT = BH". Đồng bộ FEAT-INS-SO-ADJUSTMENT v8 (AC-1). |
| 2026-05-27 | 8 | Business Authority | §7.1 resolve khấu hao = **% trên phụ tùng (vật tư) BH** (không công DV), có % per dòng + "Áp dụng tất cả" đồng loạt. Đồng bộ FEAT-INS-SO-ADJUSTMENT v9 (AC-5/AC-8 + BR-INS-SO-ADJ-004). |
| 2026-05-27 | 9 | Business Authority | §7.2 công thức "Cộng sau VAT" = dịch vụ + phụ tùng + Σ thuế các dòng theo bên thanh toán; **thuế do người dùng tự nhập per dòng** (không cố định 10%). Đồng bộ FEAT-INS-SO-ADJUSTMENT v10 (AC-9). |
| 2026-05-27 | 12 | Business Authority | PRINT-INS-002: export hồ sơ sinh **PDF riêng từng tài liệu** (không gộp 1 file) — theo production design tab "Hồ sơ bảo hiểm đã xuất". Đồng bộ FEAT-INS-DOSSIER-VIEW v2, FEAT-INS-DOSSIER-CREATE v6. |
| 2026-05-27 | 14 | Business Authority | §2.6 Dashboard công nợ BH thu gọn: filter kỳ 5 giá trị (BR-INS-DASH-002/006); **bỏ biểu đồ lịch sử + phân chia theo DN BH** khỏi scope. Đồng bộ FEAT-INS-DASH-DEBT v3, EP v10. |
| 2026-05-27 | 15 | Business Authority | **Xoá 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** — danh sách công ty BH = **system-seeded production** (garage chỉ chọn, không CRUD). Gỡ §2.7/2.8/2.9 (BR-INS-COMPANY-\*) → thay note §2.7 baseline; CB-INS-006 reframe (gỡ CB-INS-007 master data single source — IDs 008..011 giữ nguyên để không vỡ ref CB-INS-009); §3.4 status master data, §4 permission rows, §5.4 validation đều gỡ; §6 dependency + §9 MISS-INS-004/007/008 cập nhật. Đồng bộ EP v11, PRD v12, README, UX-FLOW, FEAT-INS-SO-ADJUSTMENT/DASH-DEBT. |
| 2026-05-27 | 13 | Business Authority | Resolve 4 NEED CONFIRMATION hồ sơ BH: (1) tối đa **4 tài liệu** (không file thứ 5); (2) versioning **list dọc theo từng lần xuất**; (3) **Giấy ủy quyền = template điền** (BR-INS-DOSSIER-004, không upload-only); (4) **xuất theo tài liệu tích chọn** checkbox không bắt buộc 4/4 (BR-INS-DOSSIER-005 + PRINT-INS-002). Đồng bộ FEAT-INS-DOSSIER-VIEW v3, FEAT-INS-DOSSIER-CREATE v7. |
| 2026-05-27 | 11 | Business Authority | Cập nhật theo production design Hồ sơ BH: BR-INS-DOSSIER-001 thứ tự 4 tài liệu (Phiếu quyết toán → Phiếu báo giá → Biên bản nghiệm thu → Giấy ủy quyền nhận tiền bồi thường), ①② auto "Sẵn sàng" ③④ "Bổ sung". PRINT-INS-002 cập nhật thứ tự + xuất theo checkbox. Đồng bộ FEAT-INS-DOSSIER-CREATE v4, EP v9, PRD. |
| 2026-05-27 | 10 | Business Authority | **FEAT-INS-STL-CREATE đã xoá** (tạo phiếu QT đã production). §2.3 reframe: BR-001/004/005/006/007/008 = baseline (EP-SETTLEMENT); BR-002/003 (snapshot allocation + tính server-side) = MỚI → FEAT-INS-SO-ADJUSTMENT AC-15. Cột "Áp dụng" thay cho "Features". §6 dependency + §9 conflict refs cập nhật (bỏ ref feature đã xoá). |
| 2026-05-27 | 6 | Business Authority | **Sửa công thức §7 theo production screenshot**: cơ sở tính đổi từ "Tổng chi phí thuộc BH" (trước VAT) → **"Cộng sau VAT" theo bên thanh toán**. BH thanh toán/Khách hàng thanh toán/Tổng thanh toán tính trên base post-VAT. §7.1 thêm cột dấu (CK = − không sang KH; giảm trừ/khấu hao/khấu trừ = + sang KH). Thêm worked example khớp screenshot (197.680.000 / 35.720.000 / 233.400.000). Đồng bộ FEAT-INS-SO-ADJUSTMENT v7, EP v6 §5. |
| 2026-05-27 | 4 | Business Authority | **Toggle "Bảo hiểm Có/Không" + fill thông tin công ty BH ĐÃ production**: softened CB-INS-006 (master data không còn "nguồn duy nhất, cấm free text" — chuyển NEED CONFIRMATION trường Công ty BH trên SO dùng dropdown hay giữ fill production). Cập nhật BR-INS-SO-ADJ-006 (toggle baseline + master data NEED CONFIRMATION), BR-INS-SO-ADJ-007 (auto-prefill conditional). Đồng bộ FEAT-INS-SO-ADJUSTMENT v4 (sửa AC-2 + tách AC-2b). |
| 2026-05-27 | 1 | Business Authority | Khởi tạo BR-EP-INSURANCE-SETTLEMENT từ PRD v6 + EP-INSURANCE-SETTLEMENT v2 + 10 features FEAT-INS-\* + UX-FLOW-INSURANCE-SETTLEMENT v1. Cấu trúc đồng nhất với BR-GF-*.md baseline (Cross-boundary, Rules Registry grouped by FEAT, Status Transition, Permission, Validation, Dependency, Phân tích & Đề xuất); bổ sung §7 Calculation Rules (đặc biệt cho công thức tính BH) và §8 Print & Export Rules. 11 Cross-boundary rules (CB-INS-001..011). 67 Domain rules trải 9 nhóm features. 4 sơ đồ Status Transition (phiếu QT BH, thanh toán BH derived, hồ sơ BH versioning, master data DN BH). Bảng permission đầy đủ 19 actions (cả 2 vai trò ngang nhau — kế thừa baseline EP-SETTLEMENT). 17 Validation rules (VLD-INS-*). 8 missing rules + 3 conflicts cần BA/PO clarify thêm. |
