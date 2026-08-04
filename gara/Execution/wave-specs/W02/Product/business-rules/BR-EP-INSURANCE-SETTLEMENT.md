---
type: execution-spec
artifact_kind: business-rules-wave-scoped
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W02"
last_reviewed: "2026-06-18"
source: "gen-execution-spec"
source_artifact: "Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md"
source_version: 31
source_sha: "31815b485e4a3b0688648cd8c31495f1031b813a603877bb63e759d6af8afc52"
generated_at: "2026-06-18T01:05:38+00:00"
boundary_scope: "cross-boundary"
pkg_ref: "PKG-W02-insurance-dossier"
fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
applies_to_feats:
  - FEAT-INS-STL-CREATE
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
boundaries_in_wave:
  - gf-accounting
  - gf-sales
  - agg-garage-graph
  - garage-web
  - garage-mobile
---

# BR-EP-INSURANCE-SETTLEMENT — Wave W02 Scoped Spec

> **Phạm vi**: Chỉ giữ các rule áp dụng cho 3 feature trong W02:
> `FEAT-INS-STL-CREATE` · `FEAT-INS-DOSSIER-CREATE` · `FEAT-INS-DOSSIER-VIEW`.
>
> Các rule của `FEAT-INS-SO-ADJUSTMENT` (W01) và `FEAT-INS-STL-DETAIL` (W01) đã được spec trong wave trước — file này KHÔNG re-include.
>
> Rule text §1–§2 là **VERBATIM copy** từ nguồn canonical (v30, SHA trên). Policy `mode=business-rule` §2 modes-extra.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` |
| Source version | 30 |
| Source SHA | `31815b485e4a3b0688648cd8c31495f1031b813a603877bb63e759d6af8afc52` |
| Generated at | 2026-06-18T01:05:38+00:00 |
| PKG | `PKG-W02-insurance-dossier` |

---

## §1 Rule Statements (VERBATIM — filtered cho W02)

### 1.1 Cross-boundary Rules áp dụng W02

> Trích nguyên văn §1 nguồn. Giữ CB-INS-001/002/003/004/006/009/010 (relevant trực tiếp). CB-INS-005/008/011 không có trong scope 3 feature W02 nên không bao gồm.

| Rule | Mô tả | Boundaries liên quan |
| --- | --- | --- |
| CB-INS-001 | Toàn bộ data của EP-INSURANCE-SETTLEMENT (phiếu QT BH, hồ sơ BH, điều chỉnh BH trên SO) phải filter strict theo `tenantId` (Critical Rule #4 tenant isolation). | gf-accounting, gf-sales, agg-garage-graph |
| CB-INS-002 | Khi tạo phiếu QT BH, gf-accounting gọi REST `gf-sales` để lấy snapshot SO **kèm các trường mở rộng**: Nguồn TT per dòng + 5 khoản điều chỉnh BH header. Thông tin CTBH từ `insuranceCompany` baseline (đã lưu mã v.d. `INS_BSH`). Snapshot là immutable sau khi tạo. | gf-accounting, gf-sales |
| CB-INS-003 | Khi tạo phiếu QT BH thành công, gf-accounting gọi callback gf-sales để chuyển SO sang trạng thái "đã quyết toán" (kế thừa baseline CB-ACC-003). **Phiếu QT BH không có chức năng huỷ → SO khoá vĩnh viễn, không reopen** (chốt 2026-06-08). | gf-accounting, gf-sales |
| CB-INS-004 | Phiếu QT BH và phiếu QT khách hàng liên kết qua `relatedSettlementId` — phải **tạo atomic** (cùng commit hoặc cùng rollback). Không cho phép 1 trong cặp tồn tại độc lập khi tạo từ SO có cả dòng BH + KH. *(Không có luồng huỷ cặp — phiếu QT BH không có chức năng huỷ, chốt 2026-06-08.)* | gf-accounting |
| CB-INS-006 | Danh sách công ty bảo hiểm là **system-seeded toàn platform** (chốt 2026-05-27) — garage chỉ chọn từ dropdown trên SO (toggle "Bảo hiểm = Có" — baseline production), KHÔNG tự CRUD. Master ở gf-erp-mdm catalog `directory='INSURANCE'`. gf-sales **đã lưu mã CTBH** trong `insurance_company` (VARCHAR baseline, v.d. `INS_BSH`) — **KHÔNG** thêm cột mới `insurance_code`. gf-accounting lấy thông tin CTBH qua REST `for-settlement` — không lưu riêng. (Đã bỏ FEAT-INS-COMPANY-\*.) | gf-sales (dropdown), gf-accounting (qua REST) |
| CB-INS-009 | Object storage (S3 hoặc tương đương) lưu PDF hồ sơ BH (4 tài liệu render server-side) theo path pattern `{tenant}/insurance-dossiers/{settlementId}/v{N}/{tên file}`, trong đó `{tên file}` đặt theo BR-INS-DOSSIER-011. Mọi cross-boundary access dùng signed URL có TTL hợp lý. | gf-accounting, object-storage |
| CB-INS-010 | Mọi GraphQL operations từ frontend liên quan đến BH đi qua BFF `agg-garage-graph` rồi gọi REST gf-accounting / gf-sales. Frontend không truy cập trực tiếp backend (kế thừa baseline). | gf-accounting, gf-sales, agg-garage-graph |

### 1.2 Domain Rules — Tạo phiếu quyết toán bảo hiểm (BR-INS-STL-CRE-001..009)

> Áp dụng cho **FEAT-INS-STL-CREATE**. Boundary: `gf-accounting`. Trích nguyên văn §2.3 nguồn.

| BR ID | Rule | Category | Áp dụng |
| --- | --- | --- | --- |
| BR-INS-STL-CRE-001 | Phiếu QT BH chỉ tạo từ SO loại **"Dịch vụ xe"** có ≥ 1 dòng Nguồn TT = **"BH"**. SO loại **"Bán phụ tùng"** không bao giờ sinh phiếu QT BH. | Type constraint | baseline (EP-SETTLEMENT), FEAT-INS-STL-CREATE |
| BR-INS-STL-CRE-002 | Phiếu QT BH **snapshot** dữ liệu BH từ SO tại thời điểm tạo: line items (Nguồn TT = BH), 5 khoản điều chỉnh BH, thông tin DN BH (từ `insuranceCompany` baseline), số hợp đồng BH, người giám định, SĐT, thông tin KH & xe, bảng phân bổ (Cộng sau VAT + BH thanh toán/KH chịu). Sau snapshot → immutable. | Snapshot allocation (**MỚI**) | FEAT-INS-SO-ADJUSTMENT (AC-15), FEAT-INS-STL-CREATE (AC-7) |
| BR-INS-STL-CRE-003 | **BH thanh toán** tính **server-side** theo công thức (xem §7.2 nguồn) — không nhận giá trị nhập tay (khác baseline BR-STL-CRE-005 cho nhập tay). | Server calculation (**MỚI**) | FEAT-INS-SO-ADJUSTMENT (AC-15), FEAT-INS-STL-CREATE (AC-5/AC-6) |
| BR-INS-STL-CRE-004 | Khi SO có cả dòng KH + dòng BH → tạo **atomic** cặp 2 phiếu QT: 1 loại **"Khách hàng"** + 1 loại **"Bảo hiểm"**. Một phiếu lỗi → rollback cả 2 (xem CB-INS-004). | Atomic pair | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-005 | Mã phiếu QT BH sinh theo pattern `SET-yyyyMMdd-NNNNN` giống baseline; phân biệt loại qua field `payerType = INSURANCE`, không qua mã. | Code generation | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-006 | Trạng thái khởi tạo của phiếu QT BH = **"Nháp"** (DRAFT, hiển thị UI là **"Hoạt động"**). Không có workflow phê duyệt nội bộ trước khi xuất hồ sơ. | Default status | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-007 | Phiếu QT BH liên kết hai chiều với phiếu QT khách hàng cùng SO qua `relatedSettlementId`. Cả 2 share cùng `serviceOrderId`. | Pair linking | baseline (EP-SETTLEMENT) |
| BR-INS-STL-CRE-008 | SO **bắt buộc có thông tin công ty bảo hiểm** (điền khi toggle "Bảo hiểm = Có") trước khi tạo phiếu QT BH — block nếu chưa điền (xem FEAT-INS-SO-ADJUSTMENT AC-2). | Pre-condition guard | baseline + FEAT-INS-SO-ADJUSTMENT |
| BR-INS-STL-CRE-009 | Trên màn **Tạo phiếu quyết toán**, panel **"Tổng giá dịch vụ"** hiển thị **read-only** — snapshot phân bổ BH từ SO tại thời điểm mở màn, **không cho nhập/sửa** tại màn này (muốn sửa phải quay về SO ở màn Chỉnh sửa). **Hiển thị có điều kiện theo SO chọn Bảo hiểm** (chốt 2026-06-15, theo Figma): (a) SO có ≥ 1 dòng Nguồn TT = **"BH"** → đầy đủ **3 khối** ("Chi tiết theo bên thanh toán" **2 cột BH+KH** + section **"Phân bổ Bảo hiểm"** 5 khoản + **"Cân thanh toán" 3 dòng** (BH + KH + Tổng)); (b) SO **không** có dòng BH → **rút gọn** (1 cột KH, **KHÔNG** có "Phân bổ Bảo hiểm", "Cân thanh toán" **2 dòng** (KH + Tổng)). Panel **không ẩn hẳn** mà rút gọn. Số liệu tính **server-side** (xem BR-INS-STL-CRE-003), khớp panel trên SO + chi tiết QT. Song song **BR-INS-SO-ADJ-009** (= SO-ADJ-010 FEAT-world; panel trên SO) + **BR-INS-STL-DET-009** (= STL-DET-005 FEAT-world; panel trên chi tiết QT) — cùng quy tắc rút gọn theo bên thanh toán. | Conditional display (read-only, **MỚI**) | FEAT-INS-STL-CREATE (AC-2/AC-3/AC-4/AC-5) |

### 1.3 Domain Rules — Tạo & quản lý Hồ sơ bảo hiểm (BR-INS-DOSSIER-001..011)

> Áp dụng cho **FEAT-INS-DOSSIER-CREATE** và **FEAT-INS-DOSSIER-VIEW**. Boundary: `gf-accounting`. Trích nguyên văn §2.5 nguồn.

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

### 1.4 Status Transition Rules (trích §3 nguồn)

#### Phiếu QT BH (§3.1 — KHÔNG có huỷ)

| Trạng thái hiện tại | Hành động | Trạng thái đích | Điều kiện |
| --- | --- | --- | --- |
| *(Tạo mới)* | Tạo phiếu QT BH | DRAFT | SO loại "Dịch vụ xe" + có dòng BH + đã chọn DN BH master data (BR-INS-STL-CRE-008) + chưa có phiếu QT BH DRAFT cùng SO |
| DRAFT | *(Không có huỷ)* | — | **Phiếu QT BH không có chức năng huỷ** (chốt 2026-06-08). SO khoá vĩnh viễn sau khi tạo QT — không có đường sửa lại số liệu. |

#### Hồ sơ bảo hiểm (§3.3 — Draft → Exported)

| Trạng thái | Hành động khả dụng | Chú thích |
| --- | --- | --- |
| Draft (đang điền, chưa xuất) | Điền template, xuất PDF (tài liệu tích chọn đã "Sẵn sàng") | **KHÔNG auto-save draft** — dữ liệu chỉ được persist khi user nhấn **"Xuất hồ sơ bảo hiểm"** (chốt 2026-06-05). Đóng màn trước khi xuất → mất dữ liệu nhập. Không có chức năng "Sao chép từ bản trước". |
| Exported (mọi bộ đã xuất) | Xem PDF, tải PDF, tạo bộ mới | Chế độ **"Chỉ xem"** — không có nút sửa/xuất đè trên giao diện. **Không có trạng thái bộ hồ sơ** ("Đã thay thế"/"Replaced" không hiển thị); các bộ phân biệt theo ngày/lần xuất. |

### 1.5 Permission Rules (trích §4 nguồn — W02-relevant)

| Action | garage-owner | accountant | Condition |
| --- | --- | --- | --- |
| Tạo phiếu QT BH | Cho phép | Cho phép | SO có dòng BH + đã chọn công ty BH + SO đã hoàn thành |
| Tạo hồ sơ BH (v1 và v2+) | Cho phép | Cho phép | Phiếu QT BH ở DRAFT |
| Xuất PDF hồ sơ BH | Cho phép | Cho phép | 4/4 tài liệu "Sẵn sàng" |
| Xem hồ sơ BH đã xuất | Cho phép | Cho phép | Phiếu có ≥ 1 version đã xuất |
| Tải lại PDF hồ sơ đã xuất | Cho phép | Cho phép | File còn tồn tại trong object storage |

> Không có ngoại lệ phân quyền — cả 2 vai trò có quyền ngang nhau (giống baseline EP-SETTLEMENT).

### 1.6 Print & Export Rules (trích §8 nguồn — W02-relevant)

| Rule | Mô tả |
| --- | --- |
| PRINT-INS-002 | Hồ sơ BH xuất **PDF riêng cho mỗi tài liệu được tích chọn** (tối đa 4, KHÔNG gộp 1 file): Phiếu quyết toán.pdf, Phiếu báo giá.pdf, Biên bản nghiệm thu.pdf, Giấy ủy quyền nhận tiền bồi thường.pdf. 1 lần xuất = 1 bộ hồ sơ. Xuất theo checkbox (không bắt buộc 4/4) — chốt 2026-05-27. |
| PRINT-INS-003 | Mỗi tài liệu trong hồ sơ BH có header chung (logo garage, mã phiếu QT BH, version số, ngày xuất) để dễ đối chiếu. |
| PRINT-INS-004 | Số tiền hiển thị bằng chữ tiếng Việt trên Phiếu báo giá và Phiếu quyết toán (kế thừa baseline BR-STL-DTL-005). |
| PRINT-INS-005 | PDF gốc đã xuất lưu trong object storage và không re-generate khi user tải lại — đảm bảo bản gửi BH bất biến (kế thừa BR-INS-DOSSIER-006, BR-INS-DOSSIER-VIEW-003). **Ngoại lệ recovery** (chốt PO 2026-06-02): nếu file gốc **mất khỏi storage**, hệ thống **re-generate từ snapshot** — khả thi & khớp bản gốc vì hệ thống **chỉ dùng 1 template** mỗi loại tài liệu. Xem FEAT-INS-DOSSIER-VIEW AC-9/EC-4. |

---

## §2 Rationale (VERBATIM — trích §preamble + §6 nguồn)

> Trích nguyên văn từ header + §6 Dependency Rules của nguồn.

EP-INSURANCE-SETTLEMENT cross-boundary (gf-accounting + gf-sales). File BR scoped theo Epic (không theo boundary) vì 5 features trải đều 2 boundary, viết riêng trong 2 file BR-GF-\*.md sẽ phân mảnh khó tham chiếu.

File này **bổ sung** cho `BR-GF-ACCOUNTING.md` và `BR-GF-SALES.md` baseline — không thay thế, không sửa rules cũ. Các BR baseline (BR-STL-*, BR-SO-*, BR-DASH-\*) vẫn áp dụng song song.

**Dependency context** (tóm tắt §6):

| Dependency | Mô tả |
| --- | --- |
| `EP-SERVICE-ORDER` (baseline) | Foundation: `paymentSource` per line + dropdown công ty BH đã production. FEAT-INS-STL-CREATE tiêu thụ snapshot phân bổ BH này. |
| `EP-SETTLEMENT` (baseline) | Tạo phiếu QT (cặp KH+BH) đã production. FEAT-INS-STL-CREATE mở rộng màn xác nhận tạo phiếu QT (thêm panel phân bổ). |
| `gf-accounting` | Boundary chính: phiếu QT BH, hồ sơ BH (versioning + PDF), đối soát thanh toán BH. |
| `gf-sales` | Boundary phụ: SO extension + insurance allocation snapshot exposed qua REST `for-settlement`. |
| `agg-garage-graph` | BFF chuyển tiếp GraphQL → REST. Frontend không gọi trực tiếp backend. |
| Object storage (ct-file-storage) | Lưu PDF hồ sơ BH. Signed URL TTL hợp lý. |

---

## §3 Enforcement Layer

### 3.1 Tổng quan phân lớp

| Layer | Vai trò | Rules chính |
|---|---|---|
| Domain (gf-accounting) | PRIMARY — enforce CORNERSTONE rules, server-side computation, atomicity | BR-INS-STL-CRE-001/002/003/004/007/008/009; BR-INS-DOSSIER-001..007/009..011; CALC-INS-001..005; CB-INS-004 |
| API / REST adapter (gf-accounting) | Secondary gate — validation đầu vào trước khi vào domain | VLD-INS-STL-001/002/003/004; VLD-INS-DOSSIER-003 |
| BFF / agg-garage-graph | Secondary — auth propagation, N+1 guard, error mapping | CB-INS-001/009/010; error code mapping |
| DB-level (gf-accounting) | Hard constraint — schema DDL | xem §3.3 |
| UI (garage-web / garage-mobile) | Secondary — UX guard, warn-and-allow, conditional display | BR-INS-STL-CRE-009; BR-INS-DOSSIER-005 |

### 3.2 Chi tiết enforcement per rule nhóm

#### FEAT-INS-STL-CREATE — phiếu QT BH

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-INS-STL-CRE-001 | Domain `SettlementService` | Check `SO.type == SERVICE` && `anyLine.paymentSource == BH` trước khi accept request tạo phiếu QT BH. |
| BR-INS-STL-CRE-002 | Domain | Snapshot toàn bộ block phân bổ từ `for-settlement` REST response vào `settlement_records` additive columns khi INSERT; sau INSERT → immutable (không có UPDATE path). |
| BR-INS-STL-CRE-003 | Domain / gf-sales | `insurance_payable_amount` = server-side computed từ gf-sales (truyền trong `for-settlement` response). gf-accounting KHÔNG tự tính; lưu giá trị nhận được. UI field = read-only. |
| BR-INS-STL-CRE-004 | Domain | Wrap INSERT cặp phiếu QT (INSURANCE + CUSTOMER) trong 1 `@Transactional`. Exception → rollback cả 2. |
| BR-INS-STL-CRE-008 | REST adapter | Validate `SO.insuranceCompany != null/blank` trước khi xử lý. Trả `ERR-INS-002` (`INS_STL_COMPANY_REQUIRED`, HTTP 422) nếu vi phạm. |
| BR-INS-STL-CRE-009 | BFF + UI | BFF expose cờ `soHasInsurance` (bool) trong response `openSettlementCreate`. UI quyết định render 3-khối (khi `true`) hay rút gọn (khi `false`). Số liệu đến từ `insuranceAdjustment` block — read-only UI. |
| CB-INS-003 (liên quan) | Domain | Sau tạo phiếu QT BH thành công → gọi `gf-sales` REST callback để đánh dấu SO "đã quyết toán". Phiếu QT BH không có delete/cancel endpoint. |
| CB-INS-004 | Domain | Cùng `@Transactional` với CRE-004. |

#### FEAT-INS-DOSSIER-CREATE — hồ sơ BH

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-INS-DOSSIER-001 | Domain | `InsuranceDossierService.createDossier()` validate đúng 4 `document_type` enum (`QUOTATION_SHEET`/`SETTLEMENT_SHEET`/`ACCEPTANCE_RECORD`/`PAYMENT_AUTHORIZATION`). KHÔNG cho phép type ngoài enum này. |
| BR-INS-DOSSIER-002 | Domain + gf-accounting render | ①② `QUOTATION_SHEET`/`SETTLEMENT_SHEET`: `doc_status=READY` set ngay khi tạo dossier header. Render từ snapshot `settlement_records` + line items — không nhận formData từ request cho 2 type này. |
| BR-INS-DOSSIER-003 / 004 | Domain + BFF orchestrator | ③④: BFF truyền `acceptanceFormData`/`authorizationFormData` transient (không persist DB). gf-accounting nhận request render-pdf POST, render byte[] và trả về — không INSERT formData. |
| BR-INS-DOSSIER-005 | Domain + UI | `exportInsuranceDossier` mutation validate `documentTypes.length ≥ 1`. UI "Xuất hồ sơ" button enable khi `≥ 1 checkbox tích` — KHÔNG gate theo `doc_status=READY` (FEAT v22 gỡ EC-4). |
| BR-INS-DOSSIER-006 | Domain | Row `insurance_dossier_documents` immutable sau INSERT (`exported_at != null`). Không có UPDATE endpoint cho document row. Xuất lại → INSERT `insurance_dossiers` vN+1. |
| BR-INS-DOSSIER-007 | Domain | `POST /api/v1/insurance-dossier-documents/batch`: atomic INSERT `insurance_dossiers` vN+1 + INSERT N rows + UPDATE vN `dossier_status=REPLACED`. unique constraint `uk_dossier_settlement_version` ngăn duplicate version. Không có "copy from" logic. |
| BR-INS-DOSSIER-010 | Domain | Nếu `settlement_records.settlement_status == CANCEL` → reject `createDossier`. Hồ sơ đã có thì vẫn readable. |
| BR-INS-DOSSIER-011 | Domain | File name pattern enforce trong `DossierPdfNamingService`: `{slug}_{settlementCode}_v{versionNo}.pdf`. Slug enum map: `QUOTATION_SHEET→bao-gia`, `SETTLEMENT_SHEET→quyet-toan`, `ACCEPTANCE_RECORD→bien-ban-nghiem-thu`, `PAYMENT_AUTHORIZATION→uy-quyen-nhan-tien`. |
| PRINT-INS-005 | Domain | gf-accounting giữ snapshot scalar columns + 1 template per doc type → re-render feasible. `pdf_url` immutable sau INSERT. |

#### FEAT-INS-DOSSIER-VIEW — xem hồ sơ

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-INS-DOSSIER-009 | Domain / query | `POST /api/v1/insurance-dossiers/search` trả toàn bộ version không filter (trừ `tenant_id`). Không có `is_deleted` gate cho dossier version. |
| BR-INS-DOSSIER-006 (view) | Domain | `pdf_url` là object key ct-file-storage — immutable. FE compose URL từ domain config. |
| CB-INS-001 (tenant) | Domain | Mọi query scope `tenant_id = SecurityUtils.getCurrentTenantIdAsLong()` qua `InsuranceDossierSpecifications`. |

### 3.3 DB-level constraints (từ `Architecture/data/gf-accounting-data-model.md` §2bis)

**Table `insurance_dossiers`** (NEW, ddl-auto=update):

| Constraint | Detail |
|---|---|
| PK | `id BIGINT IDENTITY` |
| NOT NULL | `tenant_id, settlement_code, version_no, dossier_status` |
| UNIQUE | `uk_dossier_settlement_version(tenant_id, settlement_code, version_no)` — ngăn duplicate version per phiếu QT |
| Index | `idx_dossier_tenant_settlement(tenant_id, settlement_code)`, `idx_dossier_status(dossier_status)` |

**Table `insurance_dossier_documents`** (NEW, ddl-auto=update):

| Constraint | Detail |
|---|---|
| PK | `id BIGINT IDENTITY` |
| NOT NULL | `tenant_id, dossier_id, document_type, doc_status, is_selected` |
| UNIQUE | `uk_dossier_doc_type(dossier_id, document_type)` — mỗi dossier version chỉ có 1 row mỗi loại |
| Index | `idx_dossier_doc_dossier_id(dossier_id)`, `idx_dossier_doc_tenant(tenant_id)` |
| KHÔNG có | `form_data` JSONB column (formData ③④ transient, không persist — BA chốt 2026-06-16, data-model v8) |
| KHÔNG có | `uploaded_file_url` / `UPLOAD` enum value (B-3 chốt bỏ upload scan) |

**Table `settlement_records`** — additive columns cho INSURANCE rows:

| Cột additive | Type | Nullable | Mục đích |
|---|---|---|---|
| `insurance_policy_no` | `VARCHAR(100)` | YES | Snapshot số hợp đồng BH |
| `discount_material_mode` / `_value` | `VARCHAR(10)` / `NUMERIC(15,2)` | YES | CK liên kết vật tư snapshot |
| `discount_labor_mode` / `_value` | `VARCHAR(10)` / `NUMERIC(15,2)` | YES | CK liên kết công DV snapshot |
| `depreciation_default_percent` | `NUMERIC(5,2)` | YES | Khấu hao mặc định % |
| `claim_reduction_mode` / `_value` | `VARCHAR(10)` / `NUMERIC(15,2)` | YES | Giảm trừ bồi thường snapshot |
| `insurance_deductible_amount` | `NUMERIC(15,2)` | YES | Khấu trừ bảo hiểm snapshot |
| `breakdown_*_insurance` / `_customer` (8 cột) | `NUMERIC(15,2)` | YES | Breakdown per payer (dịch vụ/phụ tùng/vat/total_after_vat) |
| `insurance_payable_amount` | `NUMERIC(15,2)` | YES | "BH thanh toán" — nhận từ gf-sales, không tự tính |

> Schema sinh qua `ddl-auto=update` (gf-accounting KHÔNG dùng Flyway DDL — ADR-006 exception, Gotcha #5). Index/constraint khai báo qua `@Table(indexes=…)` + `@UniqueConstraint`.

---

## §4 Test Ideas

### TC-BR-INS-STL-CRE (FEAT-INS-STL-CREATE)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-INS-STL-CRE-001-01 | BR-INS-STL-CRE-001 | SO loại "Dịch vụ xe" có 1 dòng BH → tạo phiếu QT BH | Happy | Tạo thành công, `settlement_type=INSURANCE` |
| TC-BR-INS-STL-CRE-001-02 | BR-INS-STL-CRE-001 | SO loại "Bán phụ tùng" → thử tạo phiếu QT BH | Violation | Reject, `ERR-INS-004` (`INS_STL_NO_BH_ITEMS`) |
| TC-BR-INS-STL-CRE-001-03 | BR-INS-STL-CRE-001 | SO loại "Dịch vụ xe" nhưng 0 dòng BH → thử tạo | Violation | Reject, `ERR-INS-004` |
| TC-BR-INS-STL-CRE-002-01 | BR-INS-STL-CRE-002 | Tạo phiếu QT BH → verify snapshot 5 điều chỉnh + breakdown columns | Happy | Tất cả snapshot columns NOT NULL cho hàng INSURANCE |
| TC-BR-INS-STL-CRE-002-02 | BR-INS-STL-CRE-002 | Sau khi tạo QT, sửa SO adjustment → kiểm tra phiếu QT BH | Immutability | Phiếu QT BH giữ nguyên snapshot gốc |
| TC-BR-INS-STL-CRE-003-01 | BR-INS-STL-CRE-003 | Request tạo phiếu QT BH với `insurancePayable` nhập tay khác server-computed | Violation | Server overwrite = ignore input, dùng computed từ gf-sales |
| TC-BR-INS-STL-CRE-004-01 | BR-INS-STL-CRE-004 | SO có cả dòng BH + KH → tạo cặp phiếu QT | Happy | 2 records: INSURANCE + CUSTOMER, `related_settlement_code` filled |
| TC-BR-INS-STL-CRE-004-02 | BR-INS-STL-CRE-004 | Giả lập lỗi INSERT phiếu KH sau khi đã INSERT phiếu BH | Atomicity | Rollback cả 2; DB không có record nào |
| TC-BR-INS-STL-CRE-008-01 | BR-INS-STL-CRE-008 | SO toggle BH=Có nhưng chưa chọn công ty BH → tạo phiếu QT | Violation | Reject, `ERR-INS-002` (`INS_STL_COMPANY_REQUIRED`, HTTP 422) |
| TC-BR-INS-STL-CRE-009-01 | BR-INS-STL-CRE-009 | Mở màn tạo phiếu QT từ SO có BH → panel "Tổng giá dịch vụ" | Happy | Panel hiển thị 3 khối: Chi tiết 2 cột + Phân bổ BH + Cân thanh toán |
| TC-BR-INS-STL-CRE-009-02 | BR-INS-STL-CRE-009 | Mở màn tạo phiếu QT từ SO không có BH → panel | Happy | Panel rút gọn: 1 cột KH, không có "Phân bổ BH", "Cân TT" 2 dòng |
| TC-BR-INS-STL-CRE-009-03 | BR-INS-STL-CRE-009 | Panel hiển thị, thử chỉnh sửa field trong panel | Violation | UI không cho sửa (read-only); không có input field |

### TC-BR-INS-DOSSIER-CRE (FEAT-INS-DOSSIER-CREATE)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-INS-DOSSIER-001-01 | BR-INS-DOSSIER-001 | Mở modal "Tạo hồ sơ BH" → kiểm tra cấu trúc | Happy | Đúng 4 tài liệu, đúng thứ tự: ①Phiếu QT ②Phiếu BG ③Biên bản ④Giấy UQ |
| TC-BR-INS-DOSSIER-001-02 | BR-INS-DOSSIER-001 | Thử POST batch với document_type không hợp lệ | Violation | Reject 422, invalid enum value |
| TC-BR-INS-DOSSIER-002-01 | BR-INS-DOSSIER-002 | Mở ①②  → kiểm tra trạng thái và khả năng sửa | Happy | `doc_status=READY`, tất cả field read-only |
| TC-BR-INS-DOSSIER-002-02 | BR-INS-DOSSIER-002 | Số liệu ① Phiếu QT ≠ settlement_records → verify nguồn | Data | Render từ snapshot settlement_records — không tự tính lại |
| TC-BR-INS-DOSSIER-003-01 | BR-INS-DOSSIER-003 | Mở ③ Biên bản nghiệm thu → điền formData → render PDF | Happy | PDF render đúng 13 fields; formData không persist DB |
| TC-BR-INS-DOSSIER-004-01 | BR-INS-DOSSIER-004 | Mở ④ Giấy ủy quyền → prefill KH/xe/CTBH → render PDF | Happy | PDF render đúng prefill + formData 22 fields; không persist |
| TC-BR-INS-DOSSIER-005-01 | BR-INS-DOSSIER-005 | Tích 2/4 tài liệu → nhấn "Xuất hồ sơ" | Happy | Chỉ 2 PDF được sinh và persist; `insurance_dossier_documents` có 2 rows |
| TC-BR-INS-DOSSIER-005-02 | BR-INS-DOSSIER-005 | Không tích tài liệu nào → nhấn "Xuất hồ sơ" | Violation | Reject, `ERR-INS-003` (`INS_DOSSIER_NO_DOC_SELECTED`) |
| TC-BR-INS-DOSSIER-005-03 | BR-INS-DOSSIER-005 | Tích ③ chưa điền đủ trường tùy ý → nhấn "Xuất hồ sơ" | Happy | UI cho phép tích + submit; BE render PDF với trường còn trống (FEAT v22 — không gate "form complete") |
| TC-BR-INS-DOSSIER-006-01 | BR-INS-DOSSIER-006 | Xuất v1 thành công → thử update row `insurance_dossier_documents` | Immutability | Không có UPDATE endpoint; row không thể thay đổi |
| TC-BR-INS-DOSSIER-007-01 | BR-INS-DOSSIER-007 | Sau v1 Exported → click "+ Tạo hồ sơ" lần 2 → hoàn thành | Happy | INSERT `insurance_dossiers` v2; v1 `dossier_status=REPLACED`; unique constraint không vi phạm |
| TC-BR-INS-DOSSIER-007-02 | BR-INS-DOSSIER-007 | Concurrent POST batch cùng `settlementCode` lần 2 | Concurrency | `uk_dossier_settlement_version` ngăn duplicate; 409 conflict |
| TC-BR-INS-DOSSIER-010-01 | BR-INS-DOSSIER-010 | Phiếu QT BH ở CANCEL → thử tạo hồ sơ | Violation | Reject, gợi ý "phiếu QT đã huỷ" |
| TC-BR-INS-DOSSIER-011-01 | BR-INS-DOSSIER-011 | Xuất hồ sơ v1 → verify `pdf_file_name` từng tài liệu | Happy | `bao-gia_SET-20260618-00001_v1.pdf`, `quyet-toan_…_v1.pdf`, v.v. |
| TC-BR-INS-DOSSIER-011-02 | BR-INS-DOSSIER-011 | Xuất v2 cùng phiếu → verify `pdf_file_name` hậu tố v2 | Happy | `bao-gia_SET-20260618-00001_v2.pdf` |

### TC-BR-INS-DOSSIER-VIEW (FEAT-INS-DOSSIER-VIEW)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-INS-DOSSIER-009-01 | BR-INS-DOSSIER-009 | Phiếu QT BH đã xuất 3 version → gọi search | Happy | `totalElements=3`, `content` có đủ v1/v2/v3 theo thứ tự descending `versionNo` |
| TC-BR-INS-DOSSIER-009-02 | BR-INS-DOSSIER-009 | Paginate: page=1, size=2 khi có 5 version | Pagination | `content.length=2`, `page=1`, `totalElements=5`, `totalPages=3` |
| TC-BR-INS-VIEW-001-01 | CB-INS-001 | Tenant A truy cập hồ sơ của tenant B qua direct `settlementCode` | Tenant isolation | 403 `INS_FORBIDDEN_TENANT` |
| TC-BR-INS-VIEW-002-01 | BR-INS-DOSSIER-006 | Tab "Hồ sơ đã xuất" → verify `pdfUrl` per document | Happy | `pdfUrl` = ct-file-storage object key (no scheme/domain), consistent với `pdf_file_name` |
| TC-BR-INS-VIEW-002-02 | PRINT-INS-005 (recovery) | Giả lập mất file trên storage → GET tab | Recovery | Hệ thống re-generate PDF từ snapshot; response thành công |
| TC-BR-INS-VIEW-003-01 | BR-INS-DOSSIER-009 | Phiếu QT BH không có hồ sơ nào | Edge | Empty state `ERR-INS-010`, `EMPTY_STATE`, HTTP 200 |

---

## §5 BR → FEAT → AC Mapping

### FEAT-INS-STL-CREATE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-INS-STL-CRE-001 | AC-1 (trigger từ SO đã hoàn thành) | Gate loại SO + dòng BH |
| BR-INS-STL-CRE-003, BR-INS-STL-CRE-009 | AC-2 (panel hiển thị có điều kiện) | `soHasInsurance` flag |
| BR-INS-STL-CRE-009 | AC-3 (bảng Chi tiết 2 cột) | Render server-side snapshot |
| BR-INS-STL-CRE-009 | AC-4 (Phân bổ Bảo hiểm 5 khoản) | Chỉ khi SO có BH |
| BR-INS-STL-CRE-003, BR-INS-STL-CRE-009 | AC-5 (Cân thanh toán 3 dòng) | `insurance_payable_amount` computed |
| BR-INS-STL-CRE-003, CNF-INS-001 | AC-6 ("Tổng tiền BH trả" read-only = computed) | Không nhập tay cho bên BH |
| BR-INS-STL-CRE-002, CB-INS-004 | AC-7 (snapshot block phân bổ vào cặp phiếu QT) | Atomic pair + immutable |
| BR-INS-STL-CRE-001/004/005/006/007/008 | AC từ baseline FEAT-STL-CREATE | Kế thừa toàn bộ baseline behavior |

### FEAT-INS-DOSSIER-CREATE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-INS-DOSSIER-001 | AC-1 (mở modal từ phiếu QT BH), AC-3 (4 dòng accordion/list) | Gate: `payerType=INSURANCE` + BR-INS-STL-DET-007 |
| BR-INS-DOSSIER-002 | AC-4 (preview ①②) | `AUTO_RENDER`, read-only, `doc_status=READY` |
| BR-INS-DOSSIER-003 | AC-6 (điền ③ Biên bản nghiệm thu) | formData transient, prefill từ SO |
| BR-INS-DOSSIER-004 | AC-7 (điền ④ Giấy ủy quyền) | formData transient, prefill KH/xe/CTBH |
| BR-INS-DOSSIER-005 | AC-9 (xuất subset checkbox), AC-8 (preview per tài liệu) | ≥1 checkbox (không gate READY — FEAT v22) |
| BR-INS-DOSSIER-006, BR-INS-DOSSIER-007 | AC-10/EC-2 (versioning tạo bộ mới) | INSERT v+1, UPDATE v cũ REPLACED |
| BR-INS-DOSSIER-010 | AC-1 / guard | Block khi CANCEL (note: UI không có CANCEL state visible) |
| BR-INS-DOSSIER-011, CB-INS-009 | AC-15/EC-6 (export PDF + naming) | File name rule + ct-file-storage path |
| CB-INS-001 | Mọi AC | TenantFilter enforce mọi query |

### FEAT-INS-DOSSIER-VIEW

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-INS-DOSSIER-009 | AC-1 (tab "Hồ sơ đã xuất" + danh sách) | All versions, descending |
| BR-INS-DOSSIER-009 | AC-2 (khối "Bộ hồ sơ"), AC-3 (metadata bộ) | `exported_at`, `exportedBy`, N docs |
| BR-INS-DOSSIER-006, PRINT-INS-005 | AC-4/AC-5 (xem / tải PDF) | Immutable `pdfUrl`; recovery re-generate |
| BR-INS-DOSSIER-007 | AC-6/7 (versioning UX) | Tạo v2 từ tab — không copy từ v1 |
| BR-INS-DOSSIER-010 | AC-8 (truy cập hồ sơ khi phiếu QT CANCEL) | Read-only access vẫn được |
| PRINT-INS-005 | AC-9/EC-4 (recovery re-generate) | Re-render từ snapshot khi mất file |
| CB-INS-001 | Mọi AC | TenantFilter |

---

## §6 Error Code Mapping

> Nguồn canonical: `Product/error-code/ERROR-CODE-REGISTRY.md`. File này chỉ liệt kê mã áp dụng cho 3 FEAT trong W02.

### ERR-INS-STL-CREATE (FEAT-INS-STL-CREATE)

| Code | Num | Category | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|---|---|
| `INS_STL_COMPANY_REQUIRED` | INS-2002 | VALIDATION | 422 | Toast | "Vui lòng chọn công ty bảo hiểm trên phiếu dịch vụ trước khi tạo phiếu quyết toán." | VLD-INS-STL-002, BR-INS-STL-CRE-008 |
| `INS_STL_DUPLICATE_DRAFT` | INS-2003 | BUSINESS | 409 | Toast | "Phiếu dịch vụ này đã có phiếu quyết toán bảo hiểm." | VLD-INS-STL-003 |
| `INS_STL_SO_NOT_COMPLETED` | INS-2004 | VALIDATION | 422 | Toast | "Chỉ tạo được phiếu quyết toán khi phiếu dịch vụ đã hoàn thành." | VLD-INS-STL-004 |
| `INS_STL_PAIR_ATOMIC_FAILED` | INS-2005 | SYSTEM | 500 | Toast + traceId | "Tạo phiếu quyết toán không thành công. Vui lòng thử lại." | CB-INS-004 rollback |
| `INS_STL_NOT_FOUND` | INS-2006 | NOT_FOUND | 404 | Error state | "Không tìm thấy phiếu quyết toán bảo hiểm." | Open settlement create với settlementCode không tồn tại |

> **Lưu ý từ nguồn §5.2**: `VLD-INS-STL-001` (SO không có dòng BH) maps tới `ERR-INS-004`; mã canonical chưa được listing trong ERROR-CODE-REGISTRY tại thời điểm này — DEV cần confirm với BA hoặc add `INS_STL_NO_BH_ITEMS` khi implement.

### ERR-INS-DOSSIER-CREATE + VIEW (FEAT-INS-DOSSIER-CREATE / FEAT-INS-DOSSIER-VIEW)

| Code | Num | Category | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|---|---|
| `INS_DOSSIER_NO_DOC_SELECTED` | INS-3003 | VALIDATION | 422 | Toast | "Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ." | BR-INS-DOSSIER-005 (0 checkbox) |
| `INS_DOSSIER_DOCS_INCOMPLETE` | INS-3004 | VALIDATION | 422 | Toast | "Một số tài liệu chưa hoàn tất: {danh sách}. Vui lòng hoàn tất trước khi xuất." | VLD-INS-DOSSIER-003 |
| `INS_DOSSIER_VERSION_CONFLICT` | INS-3006 | CONFLICT | 409 | Dialog reload | "Hồ sơ vừa được người khác cập nhật. Vui lòng tải lại trang." | `uk_dossier_settlement_version` conflict (optimistic) |
| `INS_DOSSIER_PDF_GENERATION_FAILED` | INS-3007 | SYSTEM | 500 | Toast | "Tạo PDF hồ sơ không thành công. Vui lòng thử lại." | Render byte[] fail (Phase B BFF) |
| `INS_DOSSIER_STORAGE_TIMEOUT` | INS-3008 | STORAGE | 504 | Toast + retry | "Hệ thống lưu trữ đang bận. Vui lòng thử lại sau giây lát." | ct-file-storage upload timeout (Phase C BFF) |
| `INS_DOSSIER_FILE_UNAVAILABLE` | INS-4001 | STORAGE | 502 | Toast (+ re-generate fallback) | "Không tải được hồ sơ. Vui lòng liên hệ quản trị viên." | `pdfUrl` không load được (FEAT-INS-DOSSIER-VIEW) |
| `INS_DOSSIER_URL_EXPIRED` | INS-4002 | STORAGE | 410 | Silent / refresh | *(im lặng — tự tải lại liên kết)* | Signed URL hết hạn (DOSSIER-VIEW EC-3) |

### Cross-cutting (tất cả feature W02)

| Code | Num | HTTP | Message (vi) |
|---|---|---|---|
| `INS_FORBIDDEN_TENANT` | INS-9001 | 403 | "Bạn không có quyền truy cập dữ liệu này." |
| `INS_UNAUTHENTICATED` | INS-9002 | 401 | "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." |
| `INS_INTERNAL_ERROR` | INS-9000 | 500 | "Đã có lỗi xảy ra. Vui lòng thử lại." |

### BFF-level error codes (Phase B/C/D orchestrator)

| Code | Trigger (phase) | HTTP → extensions.code |
|---|---|---|
| `INS_DOSSIER_RENDER_FAIL` | Phase B (render-pdf fail) | 502 |
| `INS_DOSSIER_STORAGE_UPLOAD_FAIL` | Phase C (ct-file-storage fail) | 502 |
| `INS_DOSSIER_PERSIST_FAIL` | Phase D (batch POST gf-accounting fail) | 500 |
| `INS_DOSSIER_FORM_INCOMPLETE` | Phase A validation (thiếu formData required) | 400 |

---

## §7 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W02-BR-001 | **`INS_STL_NO_BH_ITEMS` error code**: nguồn §5.2 reference `ERR-INS-004` nhưng ERROR-CODE-REGISTRY chưa list mã canonical này. Cần BA confirm hoặc DEV gf-accounting add `INS_STL_NO_BH_ITEMS` (INS-2004? conflict với `INS_STL_SO_NOT_COMPLETED`) trước implement. | NEED CONFIRMATION |
| OI-W02-BR-002 | **MISS-INS-002**: số đợt thanh toán BH tối đa cho 1 phiếu QT BH — chốt PRD v5 tái sử dụng baseline (không giới hạn). Cần verify constraint ẩn ở `FEAT-STL-DETAIL` baseline trước Phase B. | LOW — verify only |
| OI-W02-BR-003 | **BR-INS-STL-DET-009 NEED CONFIRMATION** (còn mở từ nguồn v30): 2 khoản "CK liên kết BH" trên phiếu QT KH — hiển thị để tham chiếu hay ẩn? Chốt 2026-06-16 per PKG-W02: **ẩn**. Confirm với BA nếu thay đổi trước sprint start. | RESOLVED (per PKG-W02) — verify final |
| OI-W02-BR-004 | **Virus scan strategy** cho file PDF xuất (ct-file-storage) chưa chốt (PKG §3.B). Không block logic BR nhưng block gate Phase B entry. | BLOCK Phase B entry if unresolved |
| OI-W02-BR-005 | **Mobile PDF library** (`pdfx` / `flutter_pdfview` / `syncfusion_flutter_pdfviewer`) chưa chốt — ảnh hưởng FEAT-INS-DOSSIER-VIEW mobile render. | BLOCK mobile Phase B if unresolved |

---

## §8 References

- `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` v30 (nguồn canonical)
- `Architecture/data/gf-accounting-data-model.md` v8 (§2bis — insurance_dossiers, insurance_dossier_documents, insurance_settlement_payments, settlement_records additive)
- `Execution/work-packages/PKG-W02-insurance-dossier.md` v13
- `Product/features/FEAT-INS-STL-CREATE.md` v6
- `Product/features/FEAT-INS-DOSSIER-CREATE.md` v21
- `Product/features/FEAT-INS-DOSSIER-VIEW.md` v15
- `Architecture/decisions/ADR-014-insurance-settlement-ownership.md`
- `Architecture/decisions/ADR-015-insurance-debt-summary-strategy.md`
- `Architecture/decisions/ADR-016-insurance-dossier-pdf-s3.md`
- `Product/error-code/ERROR-CODE-REGISTRY.md`

---

## §9 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 2 | User request | **Gỡ gate "Tài liệu được chọn phải Sẵn sàng"** (sync source BR-EP v31 / FEAT v22): §2 BR-INS-DOSSIER-005 update không gate "phải hoàn tất template"; §3 Enforcement BR-INS-DOSSIER-005 update gỡ `doc_status=READY` gate; §4 Test idea TC-BR-INS-DOSSIER-005-03 đổi từ Violation → Happy (UI cho phép tích + submit, BE render PDF với trường còn trống); §5 BR mapping gỡ "READY gate". |
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT W02 scoped spec. Filter từ BR-EP-INSURANCE-SETTLEMENT v30 — giữ rules áp dụng cho FEAT-INS-STL-CREATE / FEAT-INS-DOSSIER-CREATE / FEAT-INS-DOSSIER-VIEW. Bổ sung §3 Enforcement Layer (domain/API/BFF/DB-level), §4 Test Ideas per rule, §5 BR→FEAT→AC mapping, §6 Error code mapping đầy đủ. §3.3 lookup từ gf-accounting-data-model v8 §2bis. |
