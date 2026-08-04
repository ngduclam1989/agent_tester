---
type: epic
artifact_kind: epic
status: PLANNED
version: 19
tier: T2
owner_authority: Business Authority
boundary: "gf-accounting"
last_reviewed: "2026-06-15"
supersedes: null
---

# EP-INSURANCE-SETTLEMENT: Quyết toán bảo hiểm & Hồ sơ bảo hiểm

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INSURANCE-SETTLEMENT` |
| Title | Quyết toán bảo hiểm & Hồ sơ bảo hiểm |
| Status | PLANNED |
| Priority | P1 — NEED CONFIRMATION (đề xuất P1 do nghiệp vụ trọng yếu trong vận hành garage; chờ Delivery Authority xác nhận) |
| Target wave | Hậu baseline (post-Wave 2) — NEED CONFIRMATION |
| Primary boundary | `gf-accounting` (đề xuất; ranh giới chính xác do Architect quyết định khi spawn dev) |
| Affected boundaries | `gf-accounting` (phiếu QT BH, hồ sơ BH, đối soát thanh toán), `gf-sales` (mở rộng SO: phân bổ nguồn TT + điều chỉnh BH; widget công nợ BH trên Dashboard). Ranh giới ownership chi tiết thuộc Architect — BA/PO không quyết định kiến trúc. |

## 1. Outcome / Hypothesis

Nếu garage có thể phân tách chi phí sửa chữa theo nguồn thanh toán (bảo hiểm vs khách hàng), tính chính xác số tiền bảo hiểm phải trả sau các khoản điều chỉnh, tạo phiếu quyết toán bảo hiểm độc lập, xuất bộ hồ sơ PDF gửi doanh nghiệp bảo hiểm và theo dõi công nợ phải thu từ BH trên dashboard — thì garage sẽ kiểm soát được dòng tiền bảo hiểm, giảm sai sót quyết toán hai phía (BH/KH), rút ngắn thời gian thu hồi tiền bảo hiểm và loại bỏ thao tác Excel ngoài hệ thống.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Kế toán | PRIMARY | Phân bổ nguồn TT trên Phiếu dịch vụ, nhập điều chỉnh BH, tạo phiếu QT BH, lập & xuất bộ hồ sơ BH (4 tài liệu chuẩn), ghi nhận thanh toán từ BH nhiều đợt, tạo bộ hồ sơ mới khi BH yêu cầu sửa |
| Chủ garage | PRIMARY | Quyền tương đương kế toán; thêm nhiệm vụ kiểm soát doanh thu BH, chiết khấu liên kết BH, theo dõi công nợ BH qua widget Dashboard, review phiếu QT BH trước khi xuất hồ sơ, giải thích các khoản điều chỉnh BH cho khách hàng |

## 3. Vòng đời nghiệp vụ

```
  ┌────────────────────────┐
  │ Tạo SO + báo giá sơ bộ │  (Create — KHÔNG có phân bổ BH)
  └───────────┬────────────┘
              │ gửi báo giá sang BH duyệt (ngoài hệ thống)
              ▼
  ┌────────────────────────┐
  │ BH duyệt + đưa phân bổ │
  └───────────┬────────────┘
              │ garage chỉnh sửa SO (Edit)
              ▼
  ┌────────────────────────┐
  │ Phiếu dịch vụ (SO Edit)│
  │  nhập Nguồn TT per dòng│
  │  + 5 khoản điều chỉnh  │
  └───────────┬────────────┘
              │ (hoàn thành SO)
              ▼
  ┌────────────────────────┐         ┌──────────────────────┐
  │ Phiếu QT loại Bảo hiểm │────────▶│   Đã huỷ            │
  │  (DRAFT)               │  Huỷ    │  (CANCEL)           │
  └───────────┬────────────┘         └──────────────────────┘
              │ (kế toán hoàn thiện số liệu)
              ▼
  ┌────────────────────────┐
  │ Tạo Hồ sơ bảo hiểm     │
  │  (4 tài liệu chuẩn)    │
  └───────────┬────────────┘
              │ (in/xuất PDF)
              ▼
  ┌────────────────────────┐
  │ Hồ sơ đã xuất (PDF)    │  ───►  Tab "Hồ sơ BH đã xuất" (read-only)
  │  bản v1                │
  └───────────┬────────────┘
              │ (BH yêu cầu sửa → tạo bản mới)
              ▼
  ┌────────────────────────┐
  │ Hồ sơ v2, v3...        │  ───►  Lưu lịch sử tất cả bản
  └───────────┬────────────┘
              │
              ▼ (BH chuyển tiền — có thể nhiều đợt)
  ┌────────────────────────┐
  │ Ghi nhận thanh toán BH │  ───►  Tái sử dụng chức năng ghi nhận
  │  trên phiếu QT BH      │        thanh toán hiện có (FEAT-STL-DETAIL)
  └────────────────────────┘
```

**Ghi chú:**
- Phiếu QT BH là **loại phiếu mới song song** với phiếu QT khách hàng — một SO có hạng mục BH + KH sẽ sinh ra **cặp** 2 phiếu QT (logic baseline đã có ở `EP-SETTLEMENT` AC-4, AC-5 của `FEAT-STL-CREATE`).
- Epic này **mở rộng** baseline `EP-SETTLEMENT` + `EP-SERVICE-ORDER` để thêm: (a) phân bổ nguồn TT per dòng, (b) section "Phân bổ quyết toán bảo hiểm" trên SO với 5 khoản điều chỉnh, (c) module Hồ sơ bảo hiểm với versioning, (d) widget công nợ BH trên Dashboard.
- **KHÔNG sửa nội dung baseline đã DONE** của `EP-SETTLEMENT`, `EP-SERVICE-ORDER`, `EP-DASHBOARD` — các feature mới của epic này chỉ extend.

## 4. Phạm vi nghiệp vụ

### 4.1 Trên Phiếu dịch vụ (mở rộng EP-SERVICE-ORDER)

> **Chỉ ở màn hình Chỉnh sửa (Edit) + Chi tiết (Detail) — KHÔNG ở Tạo (Create)** (chốt 2026-05-27). Luồng thực tế: `Xe đến → cố vấn khám + lên đầu mục → tạo SO + báo giá sơ bộ (Create) → gửi báo giá sang BH duyệt → BH duyệt + đưa thông tin phân bổ → garage chỉnh sửa SO (Edit) nhập phân bổ BH đã duyệt`. Tại thời điểm Create chưa biết BH duyệt gì nên không có dữ liệu phân bổ.

- Chọn **Nguồn thanh toán** (Bảo hiểm / Khách hàng tự thanh toán) cho từng dòng vật tư/phụ tùng và công dịch vụ — **đã có ở production (EP-SERVICE-ORDER baseline)**, là foundation, không dev lần này.
- **(MỚI — scope epic)** Nhập các khoản điều chỉnh bảo hiểm trong section "Phân bổ quyết toán bảo hiểm" (ở màn Edit):
  - **Chiết khấu liên kết BH — Vật tư**: nhập theo **% hoặc số tiền** (UI có toggle).
  - **Chiết khấu liên kết BH — Công dịch vụ**: nhập theo **% hoặc số tiền** (UI có toggle).
  - **Khấu hao vật tư / thay mới**: áp dụng đồng loạt hoặc chỉnh riêng từng dòng phụ tùng.
  - **Giảm trừ bồi thường**: nhập theo **% hoặc số tiền** (UI có toggle).
  - **Khấu trừ bảo hiểm**: **nhập tay số tiền** (không tra cứu hợp đồng/template).

### 4.2 Phiếu quyết toán bảo hiểm

> **Tạo phiếu quyết toán (gồm cặp KH+BH) đã có ở production** (FEAT-STL-CREATE baseline). Phần MỚI lần này gồm 2 phần bổ trợ: (a) **truyền thêm thông tin phân bổ bảo hiểm** (5 khoản điều chỉnh + Cộng sau VAT theo bên + BH thanh toán/KH chịu) vào payload khi tạo phiếu QT từ SO — để phiếu QT BH snapshot đúng dữ liệu phân bổ (gộp vào `FEAT-INS-SO-ADJUSTMENT` AC-15); (b) **hiển thị panel read-only "Tổng giá dịch vụ"** (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) ngay trên **màn xác nhận Tạo phiếu quyết toán** để kế toán đối chiếu trước khi chốt — thuộc `FEAT-INS-STL-CREATE` (CR mở rộng màn FEAT-STL-CREATE, hiển thị có điều kiện theo SO có/không Bảo hiểm). Không xây mới luồng tạo phiếu QT.

- Chỉ quyết toán các hạng mục có Nguồn thanh toán = Bảo hiểm trên SO liên kết (logic baseline).
- Bên thanh toán = Doanh nghiệp bảo hiểm.
- Hiển thị: Phiếu dịch vụ liên kết, thông tin khách hàng/xe, danh sách hạng mục thuộc BH, bảng phân bổ BH (mới truyền vào), BH thanh toán, Còn phải thu BH, KH chịu từ điều chỉnh BH.
- Theo dõi trạng thái thanh toán riêng so với phần khách hàng tự trả.
- **Ghi nhận thanh toán từ BH tái sử dụng chức năng ghi nhận thanh toán hiện hành** trên phiếu QT baseline — không phát triển thêm logic mới.

### 4.3 Hồ sơ bảo hiểm

- Bộ hồ sơ chuẩn **dùng chung cho tất cả doanh nghiệp BH (mẫu chung)**, gồm **4 tài liệu** theo thứ tự:
  1. **Phiếu quyết toán** — phiếu QT BH sinh từ hệ thống (auto, "Sẵn sàng").
  2. **Phiếu báo giá** — "PHIẾU BÁO GIÁ SỬA CHỮA" sinh từ phiếu QT BH (auto, "Sẵn sàng").
  3. **Biên bản nghiệm thu** — mẫu chung, kế toán hoàn tất ("Bổ sung").
  4. **Giấy ủy quyền nhận tiền bồi thường** — mẫu chung, cần chữ ký gốc KH ("Bổ sung").
- UI (modal): progress bar "{X}/4 tài liệu sẵn sàng", 4 thẻ ngang có checkbox + badge "Sẵn sàng"/"Bổ sung", preview + In phiếu/Lưu phiếu, footer "Huỷ bỏ"/"Xuất hồ sơ bảo hiểm".
- Sau khi xuất PDF, file lưu trong tab **"Hồ sơ bảo hiểm đã xuất"** — chế độ chỉ xem.
- Khi BH yêu cầu sửa → **tạo bộ hồ sơ mới** (versioning) — không unlock bộ cũ. Bộ cũ vẫn lưu trong tab "Hồ sơ đã xuất" để truy vết.

### 4.4 Công nợ BH trên Dashboard

- Mở rộng FEAT-DASH-VIEW của `EP-DASHBOARD` (không thay thế) với widget công nợ BH.
- Hiển thị (chốt 2026-05-27): 3 KPI (Tổng phải thu BH, Đã thu trong kỳ, Số phiếu chờ thu) + 2 top list (chờ thu theo số tiền, chậm thanh toán theo tuổi nợ) + filter kỳ (Hôm qua / Tuần này / Tuần trước / Tháng này / Tháng trước).
- **Bỏ khỏi scope**: biểu đồ lịch sử thanh toán BH + phân chia công nợ theo DN BH.

### 4.5 Danh sách công ty bảo hiểm (BASELINE — không phải feature của epic)

> **CHỐT 2026-05-27**: dropdown "Công ty bảo hiểm" + danh sách công ty BH **là system-seeded toàn platform** (list ABIC, AAA, Bảo Long, Bảo Minh, Bảo Việt, BHV... — garage chỉ chọn, KHÔNG tự thêm/sửa). Đây là **BASELINE production**, không dev lần này.
>
> → **Đã bỏ 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** (master data CRUD không cần — garage không quản lý danh sách).

- Công ty bảo hiểm được **chọn từ dropdown system-seeded** trên SO (toggle "Bảo hiểm = Có" — baseline production, xem §4.1).
- Tên công ty BH được snapshot vào phiếu QT BH + hồ sơ BH (in PDF) tại thời điểm tạo.
- **% chiết khấu liên kết** nhập trực tiếp per-SO trong section "Phân bổ quyết toán bảo hiểm" (không có config mặc định per công ty trong scope này).

## 5. Quy tắc tính toán nghiệp vụ

> **Chi tiết đầy đủ**: [`Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md`](../business-rules/BR-EP-INSURANCE-SETTLEMENT.md) — bao gồm 67 domain rules + 11 cross-boundary rules + 17 validation rules + công thức tính chi tiết (§7) + print/export rules (§8) + phân tích conflict & missing rules (§9).
>
> **Mã lỗi & thông báo**: [`Product/error-code/ERROR-CODE-REGISTRY.md`](../error-code/ERROR-CODE-REGISTRY.md) — 18 mã (9 `ERR-CMN-*` common + 9 `ERR-INS-*` riêng) dùng chung BE/FE, kèm severity + hình thức hiển thị (TOAST/DIALOG/INLINE_*/EMPTY_STATE). Validation rules (BR §5) + Error UX (UX-FLOW §6/§8) đã map sang mã lỗi này.

```
Cơ sở tính = "Cộng sau VAT" theo bên thanh toán (xác nhận production screenshot 2026-05-27):

Cộng sau VAT (BH)            = Σ(dịch vụ BH) + Σ(phụ tùng BH) + Σ(thuế các dòng BH)
Cộng sau VAT (KH)            = Σ(dịch vụ KH) + Σ(phụ tùng KH) + Σ(thuế các dòng KH)
                            (Thuế do người dùng tự nhập per dòng — không cố định 10%)

BH thanh toán                = Cộng sau VAT (BH)
                               − CK liên kết BH (vật tư + công DV)
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

# Ví dụ: Cộng sau VAT BH 207.900.000 / KH 33.000.000; điều chỉnh −5.000.000 −2.500.000 +2.000.000 +200.000 +520.000
#   → BH thanh toán 197.680.000 + KH thanh toán 35.720.000 = Tổng 233.400.000
```

## 6. Features

> **6 features.** Lưu ý các năng lực **đã có ở production** (foundation, KHÔNG phải feature của epic):
> - Chọn bên thanh toán (BH/KH) per dòng trên Phiếu dịch vụ (EP-SERVICE-ORDER baseline).
> - **Luồng tạo phiếu quyết toán** (gồm cặp KH+BH) từ Phiếu dịch vụ (EP-SETTLEMENT baseline — FEAT-STL-CREATE) — KHÔNG rebuild. Phần MỚI gồm 2 mảng: (a) **truyền thêm thông tin phân bổ bảo hiểm** vào payload khi tạo phiếu QT — gộp vào FEAT-INS-SO-ADJUSTMENT (AC-15); (b) **hiển thị panel read-only "Tổng giá dịch vụ"** trên màn xác nhận Tạo phiếu QT — `FEAT-INS-STL-CREATE` (CR mở rộng màn tạo).
> - **Danh sách / dropdown công ty bảo hiểm** (system-seeded toàn platform — garage chỉ chọn, không tự CRUD). Master data DN BH KHÔNG phải feature của epic (đã bỏ FEAT-INS-COMPANY-LIST/CREATE/EDIT).

| FEAT ID | Title | Boundary | Link | Figma (web) | Figma (mobile) | Priority |
|---|---|---|---|---|---|---|
| `FEAT-INS-SO-ADJUSTMENT` | Nhập & tính các khoản điều chỉnh BH trên Phiếu dịch vụ (section "Phân bổ quyết toán bảo hiểm") + truyền thông tin phân bổ khi tạo phiếu QT | `gf-sales` | [FEAT-INS-SO-ADJUSTMENT](../features/FEAT-INS-SO-ADJUSTMENT.md) | [node 13257-469505](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev) | [node 319-65571](https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-65571&m=dev) | P1 |
| `FEAT-INS-STL-CREATE` | Hiển thị phân bổ bảo hiểm (panel "Tổng giá dịch vụ" read-only) trên màn Tạo phiếu quyết toán — CR mở rộng FEAT-STL-CREATE | `gf-accounting` | [FEAT-INS-STL-CREATE](../features/FEAT-INS-STL-CREATE.md) | [node 13535-157815](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-157815&m=dev) | [node 553-27738](https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=553-27738&m=dev) | P1 |
| `FEAT-INS-STL-DETAIL` | Chi tiết phiếu quyết toán bảo hiểm | `gf-accounting` | [FEAT-INS-STL-DETAIL](../features/FEAT-INS-STL-DETAIL.md) | [node 13255-177002](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev) | [node 81-39472](https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472&m=dev) | P1 |
| `FEAT-INS-DOSSIER-CREATE` | Tạo & quản lý hồ sơ bảo hiểm (4 tài liệu chuẩn) | `gf-accounting` (NEED CONFIRMATION) | [FEAT-INS-DOSSIER-CREATE](../features/FEAT-INS-DOSSIER-CREATE.md) | [node 13257-536880](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-536880&m=dev) | [node 319-57346](https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-57346&m=dev) | P1 |
| `FEAT-INS-DOSSIER-VIEW` | Xem hồ sơ bảo hiểm đã xuất (read-only, versioning) | `gf-accounting` (NEED CONFIRMATION) | [FEAT-INS-DOSSIER-VIEW](../features/FEAT-INS-DOSSIER-VIEW.md) | [node 13257-480151](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-480151&m=dev) | [node 319-43731](https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-43731&m=dev) | P1 |
| `FEAT-INS-DASH-DEBT` | Widget công nợ bảo hiểm trên Dashboard | `gf-sales` | [FEAT-INS-DASH-DEBT](../features/FEAT-INS-DASH-DEBT.md) | — | — | P1 |

## 7. Dependencies

### 7.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-SERVICE-ORDER` | Upstream — foundation + extends | Năng lực **chọn bên thanh toán (BH/KH) per dòng** trên SO **đã có ở production** (EP-SERVICE-ORDER baseline) — foundation cho epic. FEAT-INS-SO-ADJUSTMENT mở rộng FEAT-SO-EDIT/FEAT-SO-DETAIL (thêm section "Phân bổ quyết toán bảo hiểm"). Không thay thế nội dung baseline. |
| `EP-SETTLEMENT` | Upstream — foundation + extends | **Tạo phiếu quyết toán** (cặp KH+BH) **đã có ở production** (FEAT-STL-CREATE baseline AC-4, AC-9, AC-11) — foundation. Phần MỚI: truyền thêm thông tin phân bổ BH khi tạo phiếu QT (gộp vào FEAT-INS-SO-ADJUSTMENT). FEAT-INS-STL-DETAIL reuse chức năng ghi nhận thanh toán trên FEAT-STL-DETAIL baseline. |
| `EP-DASHBOARD` | Upstream — extends | FEAT-INS-DASH-DEBT mở rộng FEAT-DASH-VIEW (thêm widget công nợ BH). |
| `EP-CUSTOMER`, `EP-VEHICLE` | Upstream — data ref | Thông tin khách hàng/xe in trên các tài liệu hồ sơ BH. |
| `EP-CATALOG` | Sibling (no impact) | Danh sách công ty bảo hiểm là system-seeded production (không phải master data garage tự quản) — đã bỏ 3 features FEAT-INS-COMPANY-*. EP-CATALOG không bị ảnh hưởng. |

### 7.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-accounting` | Boundary chính: nghiệp vụ phiếu QT BH, lưu trữ hồ sơ BH (versioning), sinh PDF, đối soát thanh toán BH. |
| `gf-sales` | Mở rộng SO entity: thêm cột Nguồn TT cho từng dòng (vật tư + công DV), thêm 5 trường điều chỉnh BH ở header. Sinh widget công nợ BH cho dashboard. |
| `agg-garage-graph` | BFF: GraphQL operations từ frontend xuống gf-accounting + gf-sales. |
| `garage-web` | UI: section "Phân bổ quyết toán bảo hiểm" trên SO, màn hình phiếu QT BH, modal/màn hình quản lý hồ sơ BH, tab "Hồ sơ đã xuất", widget Dashboard. |
| Object storage (S3 hoặc tương đương) | Lưu trữ PDF hồ sơ BH (4 tài liệu render server-side). |

## 8. Out-of-Scope

- **Tích hợp 2 chiều realtime với hệ thống doanh nghiệp BH** (gửi claim qua API, nhận phê duyệt, đồng bộ trạng thái bồi thường) — thuộc PRD OS-4, KHÔNG trong epic này.
- **Quản lý hợp đồng bảo hiểm chi tiết** (điều khoản, phí, hiệu lực) — chỉ ghi nhận thông tin tối thiểu trên SO/hồ sơ.
- **Cơ chế xuất file XML/EDI** theo định dạng riêng của từng doanh nghiệp BH — chỉ xuất PDF chuẩn dùng chung.
- **Báo cáo phân tích lợi nhuận theo doanh nghiệp BH** — chỉ widget công nợ tổng quan trên dashboard.
- **Workflow phê duyệt phiếu QT BH nội bộ** trước khi xuất hồ sơ — kế toán/chủ garage có toàn quyền tạo & xuất.

## 9. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu quyết toán BH có hồ sơ đã xuất PDF | >= 90% | Số phiếu QT BH có ít nhất 1 bộ hồ sơ PDF / tổng phiếu QT BH trong kỳ |
| Thời gian trung bình từ tạo phiếu QT BH đến xuất hồ sơ gửi BH | <= 2 ngày làm việc | (Thời điểm xuất PDF lần đầu) − (Thời điểm tạo phiếu QT BH) |
| Tỷ lệ ca sửa chữa BH có ≥ 1 dòng "BH thanh toán" được phân bổ đúng | >= 95% | Audit thủ công theo mẫu (NEED CONFIRMATION: cách lấy mẫu) |
| Tỷ lệ hồ sơ BH phải tạo bản v2/v3+ (chỉ báo chất lượng đầu vào) | <= 20% | Số hồ sơ có version > 1 / tổng hồ sơ trong kỳ |
| Thời gian trung bình thu tiền BH (từ xuất hồ sơ đến đã thu đủ) | <= 30 ngày (NEED CONFIRMATION baseline thực tế) | (Ngày BH thanh toán đủ) − (Ngày xuất hồ sơ lần đầu) |

## 10. Open Questions (NEED CONFIRMATION)

### 10.1 BA / Delivery Authority Open Questions

1. **Priority & Wave** (Delivery Authority): P1 hậu baseline có đúng không? Có cần đẩy P0 nếu có khách hàng/garage pilot đang chờ?

### 10.2 Architecture decisions (Architect — không phải BA/PO)

- Boundary chính module Hồ sơ BH (gf-accounting vs new `gf-insurance`) — Architect quyết định khi spawn dev. **KHÔNG block BA/PO.** *(Danh sách công ty BH là system-seeded production — không phải master data garage tự quản.)*

### 10.3 RESOLVED at v2 (2026-05-27)

- ✅ **Danh sách công ty BH = system-seeded production** (chốt v11, đảo quyết định v2): garage chỉ chọn từ dropdown, KHÔNG tự CRUD — đã bỏ 3 features FEAT-INS-COMPANY-*.
- ✅ **Template Phiếu báo giá trong Hồ sơ BH**: tất cả trường read-only, render từ snapshot phiếu QT BH.
- ✅ **Boundary ownership**: di chuyển sang §10.2 Architect concern.

## 11. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-15 | 19 | Business Authority + Senior PM | §6 Features: bổ sung **Figma (mobile)** cho FEAT-INS-STL-CREATE (App GMS v3 — New Design, node `553-27738`, chuẩn `&m=dev`). Đồng bộ FEAT-INS-STL-CREATE v4 (§3 UI/UX Reference). |
| 2026-06-15 | 18 | Business Authority + Senior PM | **Tái lập FEAT-INS-STL-CREATE với scope MỚI** (CR mở rộng màn Tạo phiếu QT — hiển thị panel read-only "Tổng giá dịch vụ", KHÔNG rebuild luồng tạo; khác feature cùng ID đã xoá ở v8 vốn là rebuild luồng tạo). §6 Features **5 → 6 features** (thêm row FEAT-INS-STL-CREATE, gf-accounting, P1, Figma web `13535-157815`); cập nhật note foundation §6 + §4.2 (phần MỚI gồm 2 mảng: truyền payload phân bổ + hiển thị panel trên màn tạo). Đồng bộ FEAT-INS-STL-CREATE v3, README index. NEED CONFIRMATION: Figma mobile màn tạo; BR-INS-STL-CRE-009 (display rule) chờ `gen-business-rules` bổ sung vào BR-EP §2.3. |
| 2026-06-12 | 18 | Business Authority + Senior PM | **Thêm FEAT-INS-STL-CREATE** (CR mở rộng màn Tạo phiếu quyết toán — baseline FEAT-STL-CREATE, gf-accounting): hiển thị panel read-only "Tổng giá dịch vụ" (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán), snapshot từ phân bổ SO, hiển thị có điều kiện theo SO có/không BH. §6 Features **5 → 6**; cập nhật §4.2 + note §6 (phần MỚI = truyền payload [SO-ADJUSTMENT AC-15] + hiển thị panel [STL-CREATE]). Tái dùng ID đã xoá ở v8 — scope khác (hiển thị panel, không rebuild luồng tạo). FEAT AC-6 (trường "Tổng tiền bảo hiểm trả" bên BH = read-only computed) **đã chốt theo CNF-INS-001**; NEED CONFIRMATION còn lại: Figma mobile link. Đồng bộ FEAT-INS-STL-CREATE v1 + BR-EP v28 (BR-INS-STL-CRE-009); chờ README + UX-FLOW sync. |
| 2026-06-11 | 17 | BA/PO (anhluong) | **Bỏ chức năng upload file scan hồ sơ BH** (chốt B-3): Biên bản nghiệm thu + Giấy ủy quyền = điền template trực tiếp, KHÔNG upload scan. §5 cập nhật con trỏ 19→**18 mã** (gỡ `ERR-INS-006`). Đồng bộ FEAT-INS-DOSSIER-CREATE v17, FEAT-INS-DOSSIER-VIEW v13, BR-EP v26, UX-FLOW v16, ERROR-CODE-REGISTRY v3. |
| 2026-06-11 | 16 | BA/PO (anhluong) | §5: thêm con trỏ tới **`Product/error-code/ERROR-CODE-REGISTRY.md`** — 19 mã lỗi dùng chung BE/FE (severity + display). Đồng bộ gắn mã lỗi vào BR-EP §5 (v25), UX-FLOW §6/§8 (v15), FEAT-INS-SO-ADJUSTMENT (v21), FEAT-INS-DOSSIER-CREATE (v16), FEAT-INS-DOSSIER-VIEW (v12). |
| 2026-06-04 | 15 | Business Authority | §6 Features: chuẩn hoá cột **Figma (mobile)** sang query `&m=dev` (dev-mode chuẩn, đồng bộ format link web) cho 4 FEAT (SO-ADJUSTMENT `319-65571`, STL-DETAIL `81-39472`, DOSSIER-CREATE `319-57346`, DOSSIER-VIEW `319-43731`); node-id giữ nguyên. Đồng bộ §3 UI/UX Reference 4 FEAT + registry figma-links.yaml (mobile). |
| 2026-06-04 | 14 | Business Authority | §6 Features: cập nhật cột **Figma (web)** sang file mới `GMS-v.3` (`EMGjGsnAJzGoGwTSK7dTuZ`) per FEAT (SO-ADJUSTMENT `13257-469505`, STL-DETAIL `13255-177002`, DOSSIER-CREATE `13257-536880`, DOSSIER-VIEW `13257-480151`), thay node cũ file `D1walLy4OuAvYhB12vUuPT`. Đồng bộ §3 UI/UX Reference 4 FEAT + UX-FLOW v11 + registry figma-links.yaml. Cột Figma (mobile) giữ nguyên. (CR-1780555878) |
| 2026-06-02 | 13 | Business Authority | §6 Features: thêm cột **Figma (mobile)** với link design App GMS v3 — New Design per FEAT (SO-ADJUSTMENT `319-65571`, STL-DETAIL `81-39472`, DOSSIER-CREATE `319-57346`, DOSSIER-VIEW `319-43731`; DASH-DEBT chưa có). Đồng bộ 4 FEAT (§3 UI/UX Reference thêm dòng `Figma | mobile`). Source-of-truth chi tiết tại §3 UI/UX Reference từng FEAT (DESIGN-SOURCE-POLICY §2.1). |
| 2026-06-02 | 12 | Business Authority | §6 Features: thêm cột **Figma (web)** với link design GMS V3 — New Design per FEAT (SO-ADJUSTMENT `1113-15568`, STL-DETAIL `1101-9485`, DOSSIER-CREATE `1101-9486`, DOSSIER-VIEW `1113-21146`; DASH-DEBT chưa có). Đồng bộ 4 FEAT (§3 thêm Figma link + gỡ dòng "Production design reference (screenshot 2026-05-27)") + UX-FLOW v9. Source-of-truth chi tiết tại §3 UI/UX Reference từng FEAT (DESIGN-SOURCE-POLICY §2.1). |
| 2026-05-27 | 1 | Business Authority | Khởi tạo EP-INSURANCE-SETTLEMENT từ PRD v5 §EP-INSURANCE-SETTLEMENT. 7 features (FEAT-INS-SO-PAYMENT-SOURCE, FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-CREATE, FEAT-INS-STL-DETAIL, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW, FEAT-INS-DASH-DEBT). Quyết định chốt v4+v5 PRD: chiết khấu liên kết BH & giảm trừ bồi thường nhập %/số tiền (UI toggle); khấu trừ BH nhập tay; hồ sơ BH 1 bộ chuẩn 4 tài liệu cho mọi DN BH (Phiếu báo giá, Phiếu quyết toán, Biên bản nghiệm thu, Giấy ủy quyền); sửa hồ sơ sau xuất = tạo bản mới (versioning); đối soát thanh toán BH tái sử dụng FEAT-STL-DETAIL baseline; quyền & nghiệp vụ sửa phiếu QT kế toán giữ nguyên; không tích hợp Driver+. 3 Open Questions còn lại ở mức architecture/planning. |
| 2026-05-27 | 2 | Business Authority | Resolve 3 Open Questions từ PRD v6: (a) **Master data DN BH cần phải có** — thêm 3 features mới FEAT-INS-COMPANY-LIST, FEAT-INS-COMPANY-CREATE, FEAT-INS-COMPANY-EDIT vào epic (7→10 features); bổ sung §4.5 mô tả entity DN BH (8 trường cơ bản + status). (b) **Template Phiếu báo giá trong Hồ sơ BH all read-only** — render từ snapshot phiếu QT BH, kế toán không sửa nội dung. (c) **Boundary ownership tách khỏi BA Open Questions** sang Architect concern (§10.2) — BA/PO không quyết định kiến trúc. Cập nhật §4.4 Dashboard (phân chia theo DN BH chính xác nhờ master data), §7.1 EP-CATALOG dependency thành Sibling (giữ master data DN BH trong epic này, không di chuyển sang EP-CATALOG). |
| 2026-05-27 | 3 | Business Authority | **Correction luồng nghiệp vụ**: phần phân bổ BH trên SO (Nguồn TT per dòng + 5 khoản điều chỉnh) **chỉ ở màn hình Chỉnh sửa (Edit) + Chi tiết (Detail), KHÔNG ở Tạo (Create)**. Luồng thực: Create = báo giá sơ bộ → gửi BH duyệt (ngoài hệ thống) → BH đưa phân bổ → Edit nhập phân bổ đã duyệt. Cập nhật §3 vòng đời nghiệp vụ (thêm 3 bước trước Phiếu QT: Create báo giá → BH duyệt → Edit nhập phân bổ), §4.1 (note Edit/Detail only). Đồng bộ với FEAT-INS-SO-PAYMENT-SOURCE v2 + FEAT-INS-SO-ADJUSTMENT v3 + UX-FLOW v2. |
| 2026-05-27 | 4 | Business Authority | **FEAT-INS-SO-PAYMENT-SOURCE = BASELINE đã production** (chọn bên thanh toán per dòng đã có sẵn). Đánh dấu trong §6 Features table (Priority → "— (baseline)", title note "BASELINE"). Thêm note tổng functional surface: 10 features = 9 dev mới + 1 baseline. Feature này document làm foundation, KHÔNG phát triển lần này. Đồng bộ FEAT-INS-SO-PAYMENT-SOURCE v3 (status DONE). |
| 2026-05-27 | 5 | Business Authority | **Production screenshot xác nhận khu vực thông tin BH trên SO đã production** (toggle Bảo hiểm + dropdown Công ty BH có sẵn list + số hợp đồng + ngày hết hạn + SĐT + người giám định + upload Hồ sơ bảo lãnh). Cập nhật §4.5: dropdown chọn DN BH = BASELINE; thêm NEED CONFIRMATION quyết định scope FEAT-INS-COMPANY-* (a) system-seeded → loại 3 features, hay (b) per-tenant CRUD. % chiết khấu mặc định per công ty chưa có production. Đồng bộ FEAT-INS-SO-ADJUSTMENT v5 (AC-2 reflect production fields). |
| 2026-05-27 | 7 | Business Authority | §5 công thức: cơ sở "Cộng sau VAT" = dịch vụ + phụ tùng + Σ thuế các dòng (thuế do người dùng tự nhập per dòng, không cố định 10%). Khấu hao = % trên phụ tùng. Đồng bộ FEAT-INS-SO-ADJUSTMENT v9-v10, BR-EP v8-v9. |
| 2026-05-27 | 10 | Business Authority | §4.4 Dashboard công nợ BH: thu gọn scope — 3 KPI + 2 top list + filter kỳ (5 giá trị); **bỏ biểu đồ lịch sử thanh toán + phân chia theo DN BH**. Đồng bộ FEAT-INS-DASH-DEBT v3, BR-EP v14. |
| 2026-05-27 | 11 | Business Authority | **Xoá 3 features FEAT-INS-COMPANY-LIST/CREATE/EDIT** — danh sách công ty BH là **system-seeded production** (garage chỉ chọn, không CRUD). §6 Features 8 → **5 features**; §4.5 reframe thành "Danh sách công ty BH (baseline)"; §7.1 EP-CATALOG → no impact. Đồng bộ PRD, README, UX-FLOW, BR-EP, FEAT-INS-SO-ADJUSTMENT, FEAT-INS-DASH-DEBT. |
| 2026-05-27 | 9 | Business Authority | §4.3 Hồ sơ BH: cập nhật theo production design — thứ tự 4 tài liệu (1) Phiếu quyết toán (2) Phiếu báo giá (3) Biên bản nghiệm thu (4) Giấy ủy quyền nhận tiền bồi thường; ①② auto "Sẵn sàng", ③④ "Bổ sung" mẫu chung; UI modal (progress bar, 4 thẻ ngang có checkbox, preview, footer Xuất hồ sơ). Đồng bộ FEAT-INS-DOSSIER-CREATE v4, PRD, BR-EP. |
| 2026-05-27 | 8 | Business Authority | **Xoá FEAT-INS-STL-CREATE** (tạo phiếu quyết toán đã production). Phần mới = truyền thêm thông tin phân bổ BH khi tạo phiếu QT → gộp vào FEAT-INS-SO-ADJUSTMENT. §6 Features 9 → **8**; §4.2 + §7.1 EP-SETTLEMENT dependency reframe "foundation + extends". Đồng bộ PRD, README, UX-FLOW, BR-EP, FEAT-INS-STL-DETAIL/DOSSIER-CREATE. |
| 2026-05-27 | 6 | Business Authority | **Xoá FEAT-INS-SO-PAYMENT-SOURCE** (đã production, không dev đợt này). Năng lực chọn bên thanh toán per dòng giờ ghi nhận là foundation thuộc EP-SERVICE-ORDER baseline (không phải feature của epic). §6 Features: 10 → **9 features**; gỡ row. §4.1: reframe Nguồn TT là baseline. §7.1 EP-SERVICE-ORDER dependency → "foundation + extends". Đồng bộ PRD, README, UX-FLOW, BR-EP. |
