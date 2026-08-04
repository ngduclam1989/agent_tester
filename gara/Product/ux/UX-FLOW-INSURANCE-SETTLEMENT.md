---
type: ux
artifact_kind: ux-spec
status: PLANNED
version: 22
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-06-18"
---

# UX-FLOW-INSURANCE-SETTLEMENT: Quyết toán bảo hiểm, hồ sơ bảo hiểm & công nợ BH

---

## Metadata

| Field | Value |
|---|---|
| Screen / Flow | `UX-FLOW-INSURANCE-SETTLEMENT` |
| Kind | FLOW |
| Referenced by | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`, `FEAT-INS-DOSSIER-CREATE`, `FEAT-INS-DOSSIER-VIEW`, `FEAT-INS-DASH-DEBT` (5 FEAT). Foundation đã production: chọn bên thanh toán per dòng + tạo phiếu QT cặp KH+BH + danh sách công ty BH (system-seeded) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |

## 1. Purpose

Luồng quyết toán bảo hiểm mô tả toàn bộ vận hành thực tế tại garage khi tiếp nhận xe sửa chữa có liên quan tới doanh nghiệp bảo hiểm (BH) — từ lúc khách mang xe đến với hồ sơ BH, kế toán phân bổ chi phí theo nguồn thanh toán BH/KH trên Phiếu dịch vụ, nhập các khoản điều chỉnh BH, tạo phiếu quyết toán bảo hiểm độc lập, lập bộ hồ sơ 4 tài liệu chuẩn, xuất PDF gửi BH, đối soát thanh toán khi BH chuyển tiền (có thể nhiều đợt) và theo dõi công nợ BH tổng quan trên Dashboard.

**Người thực hiện:**
- **Kế toán**: vai trò chính — thao tác toàn bộ luồng từ SO đến đối soát thanh toán BH.
- **Chủ garage**: quyền tương đương kế toán; tập trung vào kiểm soát doanh thu BH, review phiếu QT BH, theo dõi công nợ trên Dashboard.

**Nền tảng:** Web GMS (chủ yếu — kế toán làm tại văn phòng). App Garage hỗ trợ xem nhanh.

### Bối cảnh thực tế tại garage (vì sao cần luồng này)

> Một ca sửa chữa BH **không bao giờ đơn giản là "BH thanh toán toàn bộ"**. Trong thực tế:
> - Một hồ sơ có thể có hạng mục BH duyệt và hạng mục KH tự trả lẫn lộn.
> - Garage thường có hợp đồng liên kết với DN BH → có % chiết khấu liên kết (giảm cho DN BH).
> - BH có thể loại trừ một phần chi phí (giảm trừ bồi thường) hoặc đặt khấu trừ.
> - KH phải chịu khấu hao vật tư thay mới và khấu trừ BH theo hợp đồng BH.
> - BH thường trả chậm và có thể trả nhiều đợt sau khi nhận đủ hồ sơ.
>
> Trước khi có luồng này: garage dùng Excel ngoài hệ thống → sai số tiền, thiếu giấy tờ khi gửi BH, không kiểm soát được công nợ phải thu BH.

### Sơ đồ luồng vận hành tổng quan

```
┌──────────────────────────────────────────────────────────────────────────────┐
│            LUỒNG VẬN HÀNH QUYẾT TOÁN BẢO HIỂM TẠI GARAGE                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ① TIẾP NHẬN XE & CỐ VẤN KHÁM XE                                            │
│     KH mang xe (có liên quan BH) ──► Cố vấn khám xe                         │
│     Đưa ra các đầu mục sửa chữa cần thực hiện                               │
│                                                                              │
│  ② TẠO PHIẾU DỊCH VỤ + BÁO GIÁ SƠ BỘ  [màn hình TẠO — Create]              │
│     Kế toán lập SO (loại "Dịch vụ xe") với các đầu mục + đơn giá            │
│     ❗ KHÔNG có cột Nguồn thanh toán, KHÔNG có section phân bổ BH            │
│        (chưa biết BH duyệt gì — đây chỉ là báo giá sơ bộ)                   │
│                                                                              │
│  ③ GỬI BÁO GIÁ SANG BẢO HIỂM ĐỂ DUYỆT  [ngoài hệ thống]                    │
│     Garage gửi báo giá sơ bộ cho DN BH                                       │
│     BH thẩm định → duyệt hạng mục nào BH trả, hạng mục nào loại trừ         │
│     BH đưa thông tin phân bổ + các khoản điều chỉnh                         │
│                                                                              │
│  ④ NHẬP PHÂN BỔ BH ĐÃ DUYỆT  [màn hình CHỈNH SỬA — Edit]                   │
│     Kế toán mở SO ở chế độ Edit → cột Nguồn thanh toán + section            │
│     "Phân bổ quyết toán bảo hiểm" XUẤT HIỆN:                               │
│       4a. Chọn công ty BH từ dropdown (system-seeded production)           │
│           + nhập số hợp đồng, người giám định, SĐT                          │
│       4b. Đánh dấu Nguồn thanh toán từng dòng (BH duyệt / KH tự trả)        │
│           ──► Footer hiện "Tổng thuộc BH" + "Tổng thuộc KH"                 │
│       4c. Nhập 5 khoản điều chỉnh BH đã duyệt:                              │
│           - Chiết khấu liên kết BH (vật tư + công DV) — %/số tiền           │
│           - Khấu hao vật tư/thay mới — đồng loạt hoặc per dòng              │
│           - Giảm trừ bồi thường — %/số tiền                                  │
│           - Khấu trừ bảo hiểm — nhập tay số tiền                            │
│       ──► Bảng tổng realtime: Bảo hiểm thanh toán / KH chịu từ điều         │
│           chỉnh BH / Tổng KH thanh toán                                      │
│                                                                              │
│  ⑤ HOÀN THÀNH SO & TẠO CẶP PHIẾU QUYẾT TOÁN                                │
│     SO chuyển sang "Hoàn thành" ──► Nút "Tạo phiếu quyết toán"              │
│     Hệ thống tự sinh atomic 2 phiếu:                                         │
│       - Phiếu QT khách hàng (loại "KH") — số tiền KH phải trả               │
│       - Phiếu QT bảo hiểm (loại "BH") — số tiền BH phải trả                 │
│     2 phiếu liên kết hai chiều qua relatedSettlementId                       │
│                                                                              │
│  ⑥ LẬP HỒ SƠ BẢO HIỂM (từ Phiếu QT BH)                                      │
│     Nút "Tạo hồ sơ bảo hiểm" ──► Màn hình hồ sơ 4 tài liệu:                 │
│       ① Phiếu báo giá (auto-render từ phiếu QT BH, all read-only)          │
│       ② Phiếu quyết toán (auto-render, all read-only)                       │
│       ③ Biên bản nghiệm thu (điền template trực tiếp)                       │
│       ④ Giấy ủy quyền (điền template, in cho KH ký)                         │
│     Tích chọn tài liệu ──► "Xuất hồ sơ bảo hiểm" (PDF riêng từng file)      │
│     ──► PDF lưu storage + chuyển read-only + xuất hiện trong tab            │
│         "Hồ sơ bảo hiểm đã xuất"                                            │
│                                                                              │
│  ⑦ GỬI HỒ SƠ CHO DN BH (ngoài hệ thống — email / giấy / chuyển phát)        │
│     Kế toán tải PDF từ hệ thống và gửi cho DN BH                            │
│                                                                              │
│  ⑧ NẾU BH YÊU CẦU BỔ SUNG / SỬA HỒ SƠ                                       │
│     Kế toán nhấn lại "Tạo hồ sơ bảo hiểm" ──► Bộ hồ sơ mới                   │
│     Điền lại nội dung template (không có "Sao chép từ bản trước")           │
│     Bản cũ KHÔNG bị xoá — vẫn lưu trong tab "Hồ sơ đã xuất" để truy vết    │
│                                                                              │
│  ⑨ ĐỐI SOÁT THANH TOÁN TỪ DN BH (sau khi BH chuyển tiền)                    │
│     BH chuyển tiền (1 đợt hoặc nhiều đợt) ──► Kế toán mở Phiếu QT BH       │
│     Nhấn "Ghi nhận thanh toán từ BH" ──► Component thanh toán baseline      │
│     Nhập: số tiền, ngày, phương thức, upload chứng từ chuyển khoản          │
│     ──► Trạng thái thanh toán cập nhật:                                     │
│         "Chưa thu" → "Thu một phần" → "Đã thu đủ"                           │
│                                                                              │
│  ⑩ THEO DÕI TỔNG QUAN TRÊN DASHBOARD (mọi lúc)                              │
│     Chủ garage / Kế toán mở Dashboard ──► Widget "Công nợ bảo hiểm":        │
│       - Filter kỳ (Hôm qua / Tuần này / Tuần trước / Tháng này / Tháng trước)│
│       - 3 KPI: Tổng phải thu BH, Đã thu trong kỳ, Số phiếu chờ thu          │
│       - Top phiếu chờ thu (số tiền) + Top phiếu chậm thanh toán (tuổi nợ)   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Dependency liên module

| Hướng | Module | Quan hệ |
|---|---|---|
| Upstream | `EP-SERVICE-ORDER` | Phiếu dịch vụ là gốc. Nguồn thanh toán per dòng **đã có ở production** (baseline, foundation). Điều chỉnh BH nhập tại đây (FEAT-INS-SO-ADJUSTMENT — mới). |
| Upstream | `EP-SETTLEMENT` | Phiếu QT BH mở rộng vòng đời baseline (DRAFT/CANCEL — **data model/backend; KHÔNG hiển thị trạng thái này trên UI**, không có hành động huỷ phiếu trên UI). Chức năng ghi nhận thanh toán tái sử dụng FEAT-STL-DETAIL — không phát triển logic mới. |
| Upstream | `EP-CUSTOMER`, `EP-VEHICLE` | Thông tin KH & xe in trên các tài liệu hồ sơ BH. |
| Sibling | `EP-DASHBOARD` | Widget công nợ BH mở rộng FEAT-DASH-VIEW (không thay thế). |
| Sibling | `EP-CATALOG` | Danh sách công ty BH là system-seeded production (không phải master data garage tự quản) — đã bỏ FEAT-INS-COMPANY-*. EP-CATALOG không bị ảnh hưởng. |

## 2. Entry Points

| # | Điểm vào | Điều kiện | Đầu ra |
|---|---|---|---|
| 1 | **Chỉnh sửa** SO loại "Dịch vụ xe" sau khi BH duyệt (luồng UX-FLOW-SERVICE-REPAIR) | SO đã tạo ở Create + BH đã duyệt phân bổ | Form Edit mở — cột Nguồn TT + section phân bổ BH xuất hiện |
| 2 | Nút "Tạo phiếu quyết toán" trên SO đã hoàn thành (có dòng BH) | SO có ≥ 1 dòng Nguồn TT = BH + đã chọn công ty BH | Màn xác nhận **Tạo phiếu quyết toán** — hiển thị panel read-only "Tổng giá dịch vụ" (phân bổ BH snapshot từ SO) trước khi "Xác nhận" sinh cặp KH + BH (FEAT-INS-STL-CREATE) |
| 3 | Nhấn vào phiếu QT loại "Bảo hiểm" trong Danh sách phiếu quyết toán | Đang ở FEAT-STL-LIST | Màn hình FEAT-INS-STL-DETAIL |
| 4 | Nút "Tạo hồ sơ bảo hiểm" trên phiếu QT BH | Phiếu QT **Bên thanh toán = Bảo hiểm** (ẩn với phiếu QT Khách hàng; không ràng buộc trạng thái — giao diện không có Draft) | Màn hình lập hồ sơ BH (FEAT-INS-DOSSIER-CREATE) |
| 5 | Tab "Hồ sơ bảo hiểm đã xuất" trên phiếu QT BH | Phiếu QT **Bên thanh toán = Bảo hiểm** (ẩn với phiếu QT Khách hàng); danh sách rỗng nếu chưa xuất bộ nào | Tab read-only (FEAT-INS-DOSSIER-VIEW) |
| 6 | Widget "Công nợ bảo hiểm" trên Dashboard | Tenant có ≥ 1 phiếu QT BH | Drill-down sang FEAT-INS-STL-DETAIL |

> **Lưu ý**: Phần phân bổ BH (cột Nguồn TT + section điều chỉnh) **chỉ ở màn hình Chỉnh sửa (Edit) + Chi tiết (Detail)**, KHÔNG ở Tạo (Create). Màn Create chỉ lập báo giá sơ bộ gửi BH duyệt — xem §1 sơ đồ luồng ②③④.

## 3. Layout / Wireframe — quan hệ điều hướng giữa các màn hình

```
                                              ┌────────────────────────┐
                                              │ Master data Doanh      │
                                  ┌──────────►│ nghiệp bảo hiểm        │
                                  │  Quản lý  │ (3 màn LIST/CREATE/    │
                                  │  song song│  EDIT)                 │
                                  │           └───┬────────────────────┘
                                  │               │ Chọn từ dropdown
                                  │               ▼
┌──────────────────┐         ┌────┴─────────────┐
│ Phiếu dịch vụ    │── Mở ──►│ SO + section     │── Hoàn thành SO ──┐
│ (EP-SERVICE-     │  SO     │ "Phân bổ quyết   │                   │
│  ORDER)           │         │  toán bảo hiểm"  │                   │
└──────────────────┘         │                  │                   │
                              │ Nguồn TT per    │                   │
                              │ dòng + 5 khoản  │                   │
                              │ điều chỉnh BH   │                   │
                              └──────────────────┘                   │
                                                                     │
                              ┌──────────────────────────────────────┘
                              │  Tạo cặp phiếu QT (atomic)
                              ▼
                       ┌───────────────────┐     ┌───────────────────┐
                       │ Phiếu QT khách    │◄───►│ Phiếu QT bảo hiểm │
                       │ hàng              │     │ (FEAT-INS-STL-    │
                       │ (baseline EP-     │     │  DETAIL)          │
                       │  SETTLEMENT)      │     │                   │
                       │                   │     │ Panel công nợ BH  │
                       │ KH chịu từ        │     │ Lịch sử thanh toán│
                       │ điều chỉnh BH ────┤     │ Nút tạo hồ sơ BH  │
                       └───────────────────┘     └────┬──────────────┘
                                                      │
                                  ┌───────────────────┤
                                  │                   │
                                  ▼                   ▼
                       ┌───────────────────┐     ┌───────────────────┐
                       │ Tạo hồ sơ BH      │     │ Tab "Hồ sơ đã     │
                       │ (FEAT-INS-        │     │ xuất" (read-only) │
                       │  DOSSIER-CREATE)  │────►│ (FEAT-INS-        │
                       │                   │     │  DOSSIER-VIEW)    │
                       │ 4 tài liệu:       │     │                   │
                       │ ① Báo giá        │     │ v1, v2, v3 ...    │
                       │ ② QT             │     │ Tải PDF gốc       │
                       │ ③ BB nghiệm thu  │     │                   │
                       │ ④ Giấy ủy quyền  │     └───────────────────┘
                       │                   │
                       │ Xuất PDF gộp      │
                       └───────────────────┘

                       ┌───────────────────┐
                       │ Dashboard         │
                       │ (FEAT-DASH-VIEW   │
                       │  + widget công    │
                       │  nợ BH FEAT-INS-  │
                       │  DASH-DEBT)       │
                       │                   │
                       │ Drill-down → phiếu│
                       │ QT BH theo DN BH  │
                       └───────────────────┘
```

### Layout chi tiết — Section "Phân bổ quyết toán bảo hiểm" trên SO **(màn hình CHỈNH SỬA — Edit)**

> Section này chỉ render ở màn Edit (cho nhập) và Detail (read-only). Màn Create KHÔNG có.

```
┌─────────────────────────────────────────────────────────────────┐
│  PHIẾU DỊCH VỤ (Chỉnh sửa) — Sửa chữa xe                       │
│  Số phiếu: SVC-20260527-00012     Trạng thái: Đang xử lý       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Khách hàng: Nguyễn Văn A    Xe: 51F-12345 — Toyota Vios       │
│                                                                 │
│  ─── Bảng dịch vụ thực hiện ───────────────────────────────── │
│  ┌──┬──────────────┬──────────────┬────────┬──────────┐       │
│  │# │ Tên dịch vụ  │ Nguồn TT (▾) │ Đơn giá│ Thành tiền│      │
│  ├──┼──────────────┼──────────────┼────────┼──────────┤       │
│  │1 │ Thay dầu     │ KH ▾         │ 500.000│ 500.000  │       │
│  │2 │ Sơn cánh cửa │ BH ▾         │2.000.000│2.000.000│       │
│  │3 │ Cân chỉnh    │ BH ▾         │ 300.000│ 300.000  │       │
│  └──┴──────────────┴──────────────┴────────┴──────────┘       │
│  Tổng thuộc BH: 2.300.000đ    Tổng thuộc KH: 500.000đ          │
│                                                                 │
│  ─── Bảng phụ tùng sử dụng ───────────────────────────────── │
│  ┌──┬─────────────┬──────────┬────────┬────────┬─────────┐    │
│  │# │ Tên phụ tùng│ Nguồn TT │ Đơn giá│ Khấu   │ Thành   │    │
│  │  │             │          │        │ hao %  │ tiền    │    │
│  ├──┼─────────────┼──────────┼────────┼────────┼─────────┤    │
│  │1 │ Cánh cửa T  │ BH ▾    │5.000.000│  30%   │5.000.000│    │
│  │2 │ Bóng đèn    │ KH ▾    │ 200.000 │   -    │ 200.000 │    │
│  └──┴─────────────┴──────────┴────────┴────────┴─────────┘    │
│  Tổng thuộc BH: 5.000.000đ    Tổng thuộc KH: 200.000đ          │
│                                                                 │
│  ════ Thông tin bảo hiểm (toggle "Bảo hiểm = Có" — baseline)══ │
│  Công ty bảo hiểm: [PVI ▾] *   Số hợp đồng: BH-2026-00789     │
│  Ngày hết hạn: 31/12/2026      SĐT liên hệ BH: 0901234567      │
│  Người giám định: Trần Văn B                                  │
│  Hồ sơ bảo lãnh: [⬆ Kéo thả / tải tệp — tối đa 5 files 30MB]  │
│                                                                 │
│  ═══ Phân bổ quyết toán bảo hiểm  [Bảo hiểm ◉]  (MỚI) ═══════ │
│  BH thanh toán = phần BH duyệt sau CK liên kết − giảm trừ      │
│  bồi thường − khấu hao − khấu trừ. KH thanh toán = phần KH     │
│  tự trả + các khoản loại trừ chuyển sang KH.                  │
│  CK liên kết BH — Vật tư:    [ 5.000.000  ▾VND]               │
│  CK liên kết BH — Công DV:   [ 2.500.000  ▾VND]               │
│  Khấu hao vật tư/thay mới:   [   x %]  [Áp dụng tất cả]        │
│    (chỉ phụ tùng; per-dòng tại cột "Khấu hao %" bảng phụ tùng) │
│  Giảm trừ bồi thường:        [ 2.000.000  ▾VND]               │
│  Khấu trừ bảo hiểm:          [   520.000  ▾VND]               │
└─────────────────────────────────────────────────────────────────┘
```

```
┌──── Tổng giá dịch vụ (panel phải) ──────────────────────────────┐
│  Chi tiết theo bên thanh toán      BH            KH            │
│    Dịch vụ                  21.000.000             0           │
│    Phụ tùng                168.000.000    30.000.000           │
│    VAT (10%)                18.900.000     3.000.000           │
│    Cộng sau VAT            207.900.000    33.000.000           │
│                                                                 │
│  Phân bổ Bảo hiểm                                              │
│    CK liên kết BH — Vật tư            −5.000.000đ  (xanh)      │
│    CK liên kết BH — Công dịch vụ      −2.500.000đ  (xanh)      │
│    Giảm trừ bồi thường                +2.000.000đ  (đỏ)        │
│    Khấu hao vật tư / thay mới           +200.000đ  (đỏ)        │
│    Khấu trừ BH                          +520.000đ  (đỏ)        │
│                                                                 │
│  Cân thanh toán                                                │
│    ▸ BH thanh toán            197.680.000đ  (ô xanh)           │
│    ▸ Khách hàng thanh toán     35.720.000đ  (ô cam)           │
│    ▸ Tổng thanh toán          233.400.000đ  (ô đen)           │
└─────────────────────────────────────────────────────────────────┘
```

> Đơn vị mỗi khoản điều chỉnh: dropdown VND/% (mặc định VND). CK liên kết = dấu − (giảm BH, không sang KH); giảm trừ/khấu hao/khấu trừ = dấu + (chuyển sang KH). Cơ sở tính = "Cộng sau VAT" theo bên thanh toán.

### Layout chi tiết — Màn hình Hồ sơ bảo hiểm

> **Bố cục theo Figma** — Web = **modal accordion dọc** (click 1 dòng → mở rộng preview/template inline); App = **màn list dọc → tap mở màn chi tiết per tài liệu**. Trạng thái sẵn sàng thể hiện qua **checkbox mặc định + dòng phụ mô tả**. (Chi tiết: FEAT-INS-DOSSIER-CREATE AC-2/AC-3/AC-8.)

```
WEB — Modal "Hồ sơ bảo hiểm - #SET-20260326-00001"
┌────────────────────────────────────────────────────────────────┐
│  Hồ sơ bảo hiểm - #SET-20260326-00001                           │
├────────────────────────────────────────────────────────────────┤
│ ☐ Phiếu quyết toán    SET-20260326-00001                        ▾│
│   └─ [mở rộng] PHIẾU QUYẾT TOÁN SỬA CHỮA (read-only)            │
│        Garage / Ngày QT / Khách hàng / Biển số xe               │
│        Bảng Dịch vụ thực hiện · Phụ tùng · Phân bổ bảo hiểm     │
│        [ In phiếu ]  [ Tải PDF ]                                │
│ ☐ Phiếu báo giá       PDV-20260320-00639                        ▾│
│ ☐ Biên bản nghiệm thu Chưa tạo — Cần bổ sung thông tin nghiệm thu▾│
│ ☐ Giấy ủy quyền nhận tiền bồi thường                            ▾│
│      Áp dụng cho garage chưa ký liên kết với bảo hiểm            │
├────────────────────────────────────────────────────────────────┤
│                          [ Huỷ bỏ ]   [ Xuất hồ sơ bảo hiểm ]   │
└────────────────────────────────────────────────────────────────┘

APP — Màn "Hồ sơ bảo hiểm"
┌──────────────────────────────┐
│ ‹  Hồ sơ bảo hiểm            │
│ Tài liệu bảo hiểm            │
│ Chọn tài liệu cần xuất.      │
│ ┌──────────────────────────┐ │
│ │☐ Phiếu quyết toán      › │ │
│ │  SET-20260326-00001      │ │
│ ├──────────────────────────┤ │
│ │☐ Phiếu báo giá         › │ │
│ │  SET-20260326-00001      │ │
│ ├──────────────────────────┤ │
│ │☐ Biên bản nghiệm thu   › │ │
│ │  Mẫu chung bảo hiểm ·    │ │
│ │  Cần bổ sung nội dung    │ │
│ ├──────────────────────────┤ │
│ │☐ Giấy uỷ quyền nhận    › │ │
│ │  bồi thường              │ │
│ │  Áp dụng cho garage chưa │ │
│ │  ký liên kết với bảo hiểm·│ │
│ │  Cần bổ sung nội dung    │ │
│ └──────────────────────────┘ │
│   [ Xuất hồ sơ bảo hiểm ]    │
└──────────────────────────────┘
```

## 4. Step-by-Step Flow (chi tiết từng bước theo bối cảnh thực)

### Bước 1 — Tiếp nhận xe & cố vấn khám xe (luồng UX-FLOW-SERVICE-REPAIR)

**Trigger**: Khách mang xe đến garage (ca có liên quan bảo hiểm).

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Cố vấn dịch vụ khám xe, ghi nhận các đầu mục sửa chữa cần thực hiện | (ngoài hệ thống / sổ tay cố vấn) | — |

**Lưu ý real-world**: Bước này thuần nghiệp vụ vật lý — chưa nhập hệ thống.

### Bước 2 — Tạo Phiếu dịch vụ + báo giá sơ bộ **[màn hình TẠO — Create]**

**Trigger**: Cố vấn đã chốt đầu mục sửa chữa.

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Kế toán mở SO loại "Dịch vụ xe", chọn KH + xe | FEAT-SO-CREATE | Tải snapshot KH + xe |
| Thêm các đầu mục vật tư/phụ tùng + công dịch vụ với đơn giá (báo giá sơ bộ) | Bảng line item trên SO | Lưu line items |
| ❗ Cột "Nguồn thanh toán" (baseline) + section "Phân bổ quyết toán bảo hiểm" (mới) **KHÔNG hiển thị** ở Create | FEAT-INS-SO-ADJUSTMENT AC-0 | Create chỉ là báo giá sơ bộ — chưa có dữ liệu phân bổ BH |

**State**: SO ở trạng thái "Đang xử lý" với báo giá sơ bộ. Dùng để gửi BH duyệt.

### Bước 3 — Gửi báo giá sang bảo hiểm để duyệt **[ngoài hệ thống]**

**Trigger**: Báo giá sơ bộ đã sẵn sàng.

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Garage in/xuất báo giá sơ bộ và gửi cho DN BH | (ngoài hệ thống — email/giấy) | — |
| DN BH thẩm định: duyệt hạng mục nào BH trả, loại trừ hạng mục nào, đưa các khoản điều chỉnh (chiết khấu, khấu hao, giảm trừ, khấu trừ) | (phía DN BH) | — |

**Lưu ý real-world**: Đây là bước chờ — có thể mất vài ngày. SO vẫn ở trạng thái "Đang xử lý" với báo giá sơ bộ chưa phân bổ.

### Bước 4 — Nhập phân bổ BH đã duyệt **[màn hình CHỈNH SỬA — Edit]**

**Trigger**: BH đã duyệt và đưa thông tin phân bổ.

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Kế toán mở SO ở chế độ **Chỉnh sửa** → cột "Nguồn thanh toán" (baseline) + section "Phân bổ quyết toán bảo hiểm" (mới) **xuất hiện** | FEAT-INS-SO-ADJUSTMENT AC-1 | Render section điều chỉnh (Edit only) |
| **4a.** Bật toggle "Bảo hiểm = Có" → điền thông tin công ty BH: chọn **Công ty bảo hiểm** từ dropdown (đã production), nhập số hợp đồng, ngày hết hạn, SĐT, người giám định, upload hồ sơ bảo lãnh | FEAT-INS-SO-ADJUSTMENT AC-2 (BASELINE production) | Lưu thông tin BH per-SO |
| **4b.** Đánh dấu Nguồn thanh toán từng dòng (BH duyệt / KH tự trả) theo kết quả BH duyệt — **năng lực baseline (đã production)** | EP-SERVICE-ORDER baseline | Footer 2 bảng hiện "Tổng thuộc BH" + "Tổng thuộc KH" |
| **4c.** Nhập 5 khoản điều chỉnh BH đã duyệt (xem bảng dưới) | FEAT-INS-SO-ADJUSTMENT AC-3..8 | Bảng tổng phân bổ refresh realtime |

**Chi tiết 5 khoản điều chỉnh (Bước 4c):**

| Khoản điều chỉnh | UI | Real-world example |
|---|---|---|
| Chiết khấu liên kết BH — Vật tư | Toggle %/số tiền | Garage có hợp đồng liên kết với PVI giảm 5% trên vật tư BH → nhập 5% |
| Chiết khấu liên kết BH — Công DV | Toggle %/số tiền | Tương tự, 3% trên công DV BH |
| Khấu hao vật tư đồng loạt | Input % | 0% (mặc định) — không áp dụng đồng loạt |
| Khấu hao per dòng | Cột phụ trong bảng phụ tùng (chỉ hiện cho dòng BH) | Cánh cửa thay mới khấu hao 30% — KH chịu 30% giá cánh cửa |
| Giảm trừ bồi thường | Toggle %/số tiền | BH thông báo trừ 500K do giấy tờ xe trễ đăng kiểm |
| Khấu trừ bảo hiểm | Số tiền tay | Hợp đồng BH quy định khấu trừ 500K mỗi vụ |

**Hệ thống xử lý**:
- Bảng tổng phân bổ refresh realtime sau mỗi keystroke (FEAT-INS-SO-ADJUSTMENT AC-9).
- Nếu "Bảo hiểm thanh toán" tính ra âm → highlight đỏ + cảnh báo **nhưng vẫn cho lưu** (không block — chốt PO 2026-06-02, AC-12/EC-2).
- Quick-select "Đánh dấu tất cả là Bảo hiểm" (nếu có ở production — năng lực chọn Nguồn TT là baseline EP-SERVICE-ORDER).

### Bước 5 — Hoàn thành SO & tạo cặp phiếu QT

> FEAT tham chiếu: `FEAT-SO-DETAIL` (AC-16 popup hoàn thành — baseline), `FEAT-INS-SO-ADJUSTMENT` (AC-15 truyền payload + AC-17 cảnh báo popup), `FEAT-STL-CREATE` (baseline luồng tạo), `FEAT-INS-STL-CREATE` (panel hiển thị trên màn tạo).

**Trigger**: Kế toán xác nhận xong số liệu, nhấn "Hoàn thành" trên Phiếu dịch vụ → SO chuyển sang "Hoàn thành" → tạo cặp phiếu QT.

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Nhấn "Hoàn thành" → popup **"Hoàn thành phiếu dịch vụ"** | FEAT-SO-DETAIL AC-16 (baseline) | Nếu SO có hạng mục Bảo hiểm và **Tổng "Bảo hiểm thanh toán" < 0** → popup hiển thị **dòng cảnh báo** "BH thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh" (`ERR-INS-003`). **Warn-and-allow**: vẫn cho ấn "Xác nhận" → SO chuyển "Hoàn thành" (CR-20260612-02 · VLD-INS-SO-005 · FEAT-INS-SO-ADJUSTMENT AC-17). SO không BH hoặc BH thanh toán ≥ 0 → popup baseline, không có dòng cảnh báo. |
| Nhấn "Tạo phiếu quyết toán" (luồng baseline EP-SETTLEMENT — đã production) | baseline FEAT-STL-CREATE | Validate: SO có thông tin công ty BH chưa? Nếu chưa → block (BR-INS-STL-CRE-008). Mở **màn xác nhận Tạo phiếu quyết toán**. |
| Xem màn **"Tạo phiếu quyết toán"** trước khi chốt — đối chiếu panel **"Tổng giá dịch vụ"** (read-only) | màn xác nhận (**FEAT-INS-STL-CREATE** — CR mở rộng FEAT-STL-CREATE) | Hiển thị panel read-only **"Tổng giá dịch vụ"** — snapshot phân bổ BH từ SO: **"Chi tiết theo bên thanh toán"** (Dịch vụ / Phụ tùng / VAT / Cộng sau VAT — 2 cột BH+KH) + **"Phân bổ Bảo hiểm"** (5 khoản: CK liên kết vật tư/công DV **−** xanh; Giảm trừ bồi thường / Khấu hao / Khấu trừ BH **+** đỏ) + **"Cân thanh toán"** (Bảo hiểm thanh toán / Khách hàng thanh toán / Tổng thanh toán). Trường **"Tổng tiền bảo hiểm trả"** bên BH = **read-only = computed** (BR-INS-STL-CRE-009 · CNF-INS-001; trường "Tổng tiền khách trả" giữ nhập tay baseline). SO không BH → panel rút gọn 1 cột KH (BR-INS-STL-CRE-009). Số liệu tính **server-side**. |
| Nhấn "Xác nhận" → tạo atomic cặp 2 phiếu QT (baseline) + **truyền block phân bổ BH** (FEAT-INS-SO-ADJUSTMENT AC-15 + FEAT-INS-STL-CREATE AC-7) | màn xác nhận → — | KH + BH liên kết qua `relatedSettlementId`. KH chịu từ điều chỉnh BH cộng vào phiếu QT khách hàng. Block phân bổ BH (Chi tiết theo bên TT + 5 khoản + Cân thanh toán) snapshot **immutable** vào phiếu QT BH. |
| Toast: "Tạo phiếu quyết toán thành công" | — | SO chuyển "Đã quyết toán"; redirect sang `FEAT-INS-STL-DETAIL` của phiếu BH (hoặc tab list mặc định KH) |

**Trường hợp ngoại lệ:**
- **SO không có dòng BH** (toàn bộ KH tự trả): panel "Tổng giá dịch vụ" hiển thị **rút gọn** — "Chi tiết theo bên thanh toán" chỉ 1 cột **"Khách hàng thanh toán"**, **không** có section "Phân bổ Bảo hiểm", "Cân thanh toán" chỉ 2 dòng (KH thanh toán + Tổng). Luồng tạo phiếu QT đơn lẻ loại "Khách hàng" theo baseline (BR-INS-STL-CRE-009).
- **"Bảo hiểm thanh toán" tính ra ≤ 0** (các khoản giảm trừ ≥ Cộng sau VAT BH): panel vẫn hiển thị + **cho tạo phiếu QT** kèm số 0/âm (phục vụ audit — FEAT-INS-STL-CREATE EC-2).
- **SO đã có phiếu QT BH đang hoạt động**: block tạo trùng theo baseline (BR-STL-CRE-004) — panel không thay đổi hành vi block.
- **Muốn sửa khoản điều chỉnh**: màn này read-only — phải quay về SO ở màn Chỉnh sửa (Bước 4); không sửa được tại màn tạo.

### Bước 6 — Lập hồ sơ bảo hiểm

**Trigger**: Kế toán mở phiếu QT BH, nhấn "Tạo hồ sơ bảo hiểm".

| Tài liệu | Thao tác | UI state |
|---|---|---|
| ① Phiếu quyết toán | Auto-render "PHIẾU QUYẾT TOÁN SỬA CHỮA" (Garage/Ngày QT/KH/Biển số + bảng Dịch vụ + Phụ tùng + Phân bổ bảo hiểm) — **all read-only**; web: **"In phiếu" + "Tải PDF"** | Sẵn sàng ngay (checkbox mặc định bỏ trống — tự chọn) |
| ② Phiếu báo giá | Auto-render "PHIẾU BÁO GIÁ SỬA CHỮA" — **all read-only**; web: **"In phiếu" + "Tải PDF"** | Sẵn sàng ngay (checkbox mặc định bỏ trống — tự chọn) |
| ③ Biên bản nghiệm thu | **Điền template trực tiếp** (mẫu linh hoạt); web: **"In biên bản"**; app: **"Lưu thông tin"** (lưu cục bộ trong phiên) | Có thể tích chọn ngay (checkbox mặc định bỏ trống — tự chọn) |
| ④ Giấy ủy quyền | **Template điền (mẫu chung)** — prefill xe/DN BH/số tiền + chỉ Tên KH; web: **"In giấy ủy quyền"**; app: **"Lưu thông tin"** | Có thể tích chọn ngay (checkbox mặc định bỏ trống — tự chọn) |

Nút "Xuất hồ sơ bảo hiểm" luôn hiển thị; **xuất theo các tài liệu được tích chọn** (KHÔNG bắt buộc đủ 4/4 — FEAT AC-9/BR-INS-DOSSIER-004). Không gate theo trạng thái điền template — mọi tài liệu được tích chọn đều được xuất ngay (kế toán tự chịu trách nhiệm nội dung).

**Thao tác**: Kế toán nhấn "Xuất hồ sơ bảo hiểm" → hệ thống generate **PDF riêng cho mỗi tài liệu được tích chọn** (KHÔNG gộp 1 file — chốt PRINT-INS-002 v12), thứ tự ①②③④, lưu storage, mark version 1 = exported. Toast: "Xuất hồ sơ bảo hiểm thành công".

**Sau khi xuất**:
- Màn hình chuyển read-only của version 1.
- Tab "Hồ sơ bảo hiểm đã xuất" cập nhật có 1 item v1.

### Bước 7 — Gửi hồ sơ cho DN BH (ngoài hệ thống)

> Garage Care không tích hợp 2 chiều realtime với DN BH (PRD OS-4). Kế toán tải các file PDF từ tab "Hồ sơ đã xuất", gửi qua email / chuyển phát / nộp trực tiếp.

### Bước 8 — BH yêu cầu bổ sung / sửa hồ sơ

**Trigger**: DN BH trả hồ sơ với yêu cầu sửa (vd thiếu mô tả hạng mục, sai số tiền).

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Nhấn lại "Tạo hồ sơ bảo hiểm" trên phiếu QT BH | FEAT-INS-DOSSIER-CREATE AC-11 | Mở **bộ hồ sơ mới** (điền lại template từ đầu — không có "Sao chép từ bản trước") |
| Điền lại nội dung template Biên bản nghiệm thu + Giấy ủy quyền theo yêu cầu BH | — | Cập nhật nội dung 2 tài liệu thủ công |
| Xuất PDF bộ mới | — | Lưu storage bộ mới. Tab "Hồ sơ đã xuất" có **2 bộ phân biệt theo ngày/lần xuất** (bộ mới nhất trên cùng); bộ cũ vẫn xem được — **không có trạng thái "Đã thay thế"** |

**Lưu ý real-world**: Một số ca BH yêu cầu sửa nhiều lần (3-5 lần) — tạo bộ mới không giới hạn.

### Bước 9 — Đối soát thanh toán từ DN BH

**Trigger**: BH chuyển tiền (uỷ nhiệm chi, chuyển khoản).

**Scenario A — BH trả 1 đợt đầy đủ:**

| Thao tác | Màn hình | Hệ thống xử lý |
|---|---|---|
| Kế toán mở phiếu QT BH | FEAT-INS-STL-DETAIL | Panel "Công nợ bảo hiểm" hiện: Bảo hiểm phải trả 4.481.000đ, Đã thanh toán 0đ, Còn phải thu 4.481.000đ. Trạng thái: "Chưa thu" |
| Nhấn "Ghi nhận thanh toán từ BH" | Modal baseline FEAT-STL-DETAIL | Trường "Bên thanh toán" prefill "Doanh nghiệp bảo hiểm" |
| Nhập số tiền 4.481.000đ, ngày 2026-06-10, phương thức "Chuyển khoản", upload uỷ nhiệm chi | — | Lưu bản ghi `payment` |
| Trạng thái cập nhật | — | "Đã thu đủ" — Còn phải thu = 0đ |

**Scenario B — BH trả 2 đợt:**

| Đợt | Số tiền | Trạng thái sau ghi nhận |
|---|---|---|
| Đợt 1 (10/06) | 2.000.000đ | "Thu một phần" — Còn phải thu 2.481.000đ |
| Đợt 2 (25/06) | 2.481.000đ | "Đã thu đủ" — Còn phải thu 0đ |

**Scenario C — BH trả vượt** (hiếm, do tính nhầm):

- Ghi nhận → trạng thái "Đã thu đủ" + badge "Thừa: {số tiền}" (FEAT-INS-STL-DETAIL BR-007).
- Phần thừa xử lý **ngoài hệ thống** (đối trừ/hoàn ngoài) — hệ thống KHÔNG tự ghi negative adjustment (chốt 2026-06-05, BR-INS-STL-DET-008).

**Lưu ý hiển thị panel "Tổng giá dịch vụ" trên chi tiết phiếu QT** (tab "Bảng chi phí" — chốt **CR-20260612-01**, đảo logic 2-cột cũ; xem FEAT-INS-STL-DETAIL AC-6 + BR-INS-STL-DET-009): panel **tách theo đúng bên thanh toán của phiếu**, không lẫn cột bên kia.

| Loại phiếu QT | Chi tiết theo bên thanh toán | Phân bổ Bảo hiểm | Cân thanh toán |
|---|---|---|---|
| **Phiếu BH** | 1 cột **"Bảo hiểm thanh toán"** (bỏ cột KH) | Hiển thị 5 khoản | "Bảo hiểm thanh toán" + **"Tổng thanh toán"** (= BH; bỏ dòng KH) |
| **Phiếu KH (từ SO có chọn Bảo hiểm)** | 1 cột **"Khách hàng thanh toán"** | **Hiển thị** các khoản chuyển sang KH chịu (Giảm trừ bồi thường / Khấu hao / Khấu trừ BH, dấu +) | "Khách hàng thanh toán" + "Tổng thanh toán" |
| **Phiếu KH (từ SO không chọn Bảo hiểm)** | 1 cột "Khách hàng thanh toán" | **Ẩn** (rút gọn) | "Khách hàng thanh toán" + "Tổng thanh toán" |

> **NEED CONFIRMATION (Business Authority)**: 2 khoản "CK liên kết BH" (chỉ giảm BH, không chuyển sang KH) có hiển thị trên phiếu KH để tham chiếu hay ẩn?

**Lưu ý bản in (PDF/A4) phiếu QT** (chốt **CR-20260616-01**, đồng bộ với panel màn chi tiết — xem BR-EP §8 PRINT-INS-001 + PRINT-INS-007): khối tổng tiền (`note-total`) trên bản in bổ sung section **"Phân bổ bảo hiểm"** theo cùng quy tắc per-payer của panel — render server-side qua `common-printing`.

| Loại phiếu QT bản in | Section "Phân bổ bảo hiểm" trên bản in | Mockup tham chiếu |
|---|---|---|
| **Phiếu BH** | **5 khoản dấu −** (BH gánh): CK liên kết BH × 2 + Giảm trừ bồi thường + Khấu hao VT/thay mới + Khấu trừ BH | `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-insurance.html` |
| **Phiếu KH (từ SO có chọn Bảo hiểm)** | **3 khoản dấu +** (chuyển KH chịu): Giảm trừ bồi thường + Khấu hao VT/thay mới + Khấu trừ BH (ẩn 2 khoản CK liên kết BH — chốt 2026-06-16) | `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-customer.html` |
| **Phiếu KH (từ SO không chọn Bảo hiểm)** | **Không có section** — giữ bản in baseline | — (baseline phiếu QT KH) |

> Cờ điều kiện `soHasInsurance` từ BFF/snapshot quyết định render section "Phân bổ bảo hiểm" trên phiếu KH (tái dùng cờ CR-20260612-01). Bản in cũ xuất trước CR giữ layout cũ — PDF gốc bất biến không re-generate (PRINT-INS-005). Dấu +/− + nhãn khoản khớp panel màn chi tiết (BR-INS-STL-DET-009) — tránh lệch màn ↔ giấy.

### Bước 10 — Theo dõi tổng quan trên Dashboard

**Trigger**: Chủ garage / Kế toán mở Dashboard bất cứ lúc nào.

| Section widget | Hiển thị |
|---|---|
| Filter kỳ | Hôm qua / Tuần này / Tuần trước / Tháng này (mặc định) / Tháng trước |
| 3 KPI tổng quan | Tổng phải thu BH, Đã thu trong kỳ, Số phiếu QT BH chờ thu |
| Top phiếu chờ thu (số tiền lớn nhất) | Top 5 — cột: Mã QT, Công ty BH, Còn phải thu, Tuổi nợ. Tuổi nợ > 30 ngày highlight cảnh báo |
| Top phiếu chậm thanh toán (tuổi nợ cao nhất) | Top 5 theo tuổi nợ |

> **Bỏ khỏi scope (chốt 2026-05-27)**: biểu đồ lịch sử thanh toán BH + phân chia công nợ theo DN BH.

> **Lưu ý**: Danh sách công ty bảo hiểm là **system-seeded production** (garage chỉ chọn từ dropdown, không tự quản lý). Không có bước quản lý master data DN BH trong luồng này (đã bỏ FEAT-INS-COMPANY-*).

## 5. States per screen

### 5.1 Section "Phân bổ quyết toán bảo hiểm" trên SO

| State | Trigger | UX behavior |
|---|---|---|
| Hidden | SO không có dòng nào Nguồn TT = BH | Section ẩn |
| Empty (vừa mới có dòng BH) | Lần đầu có dòng BH | Section hiện với các trường rỗng/0, bảng tổng = Tổng chi phí thuộc BH (không giảm trừ) |
| Editing | Kế toán đang nhập | Bảng tổng update sau mỗi keystroke (debounce 300ms) |
| Warning negative | "Bảo hiểm thanh toán" < 0 | Dòng "Bảo hiểm thanh toán" highlight đỏ + tooltip cảnh báo |
| Validation error | % > 100 hoặc số tiền > tổng cơ sở | Lỗi field-level, không cho lưu SO |

### 5.2 Màn hình Hồ sơ bảo hiểm (FEAT-INS-DOSSIER-CREATE)

| State | Trigger | UX behavior |
|---|---|---|
| Mới tạo (draft, version 1) | Lần đầu mở từ phiếu QT BH | Accordion/list 4 dòng, **checkbox mặc định bỏ trống** — kế toán tự chọn; cả 4 tài liệu đều có thể tích chọn ngay (không phụ thuộc trạng thái điền template ③④) |
| Đang điền | Kế toán thao tác | **KHÔNG auto-save server** — dữ liệu chỉ persist khi nhấn "Xuất hồ sơ bảo hiểm". App nút "Lưu thông tin" = lưu cục bộ trong phiên (không persist server). Đóng màn/app trước khi xuất → mất dữ liệu nhập. |
| Sẵn sàng xuất | Có ≥1 tài liệu được tích chọn | Nút "Xuất hồ sơ bảo hiểm" cho phép xuất (không bắt buộc 4/4; không gate theo trạng thái điền template) |
| Đang xuất PDF | Sau nhấn xuất | Spinner toàn màn + disable thao tác |
| Đã xuất (read-only) | Sau khi PDF lưu thành công | Banner "Đã xuất ngày {date} — chỉ xem"; **không có** nút sửa/xuất đè trên giao diện (không có trạng thái bộ hồ sơ) |
| Lỗi xuất PDF | Generate fail | Toast lỗi, giữ trạng thái draft, cho retry |

### 5.3 Panel Công nợ bảo hiểm trên Phiếu QT BH

| State | Hiển thị |
|---|---|
| Chưa thu | "Chưa thu" (badge xám) — Đã thanh toán 0đ |
| Thu một phần | "Thu một phần" (badge vàng) + progress bar |
| Đã thu đủ | "Đã thu đủ" (badge xanh) — Còn phải thu 0đ |
| Đã thu đủ + thừa | "Đã thu đủ" + sub-badge "Thừa: {số}đ" |
| Bảo hiểm thanh toán = 0 | "Đã thu đủ" (auto) + hint "Không phát sinh công nợ BH" |

### 5.4 Widget công nợ BH trên Dashboard

| State | Trigger | Hiển thị |
|---|---|---|
| Loading | Lần đầu load / refresh | Skeleton loader |
| Có data | Tenant có ≥ 1 phiếu QT BH | 3 KPI + 2 top list (chờ thu / chậm thanh toán) + filter kỳ |
| Empty | Tenant chưa có phiếu QT BH | "Chưa có dữ liệu công nợ bảo hiểm" + hint |
| Error | API fail | "Không tải được dữ liệu công nợ BH" + nút retry |

## 6. Validation real-time (field-level + form-level)

### 6.1 Form-level (toàn SO)

- Khi bật toggle "Bảo hiểm = Có": phải điền thông tin công ty BH (Công ty bảo hiểm bắt buộc) — cơ chế production.
- Khi tạo phiếu QT BH: SO phải có thông tin công ty BH (FEAT-INS-STL-DETAIL AC-11) → block với thông báo **"Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm"** (`ERR-INS-002`).

### 6.2 Field-level

| Trường | Validation | Thông báo lỗi | Mã lỗi |
|---|---|---|---|
| Công ty bảo hiểm (dropdown system-seeded) | Bắt buộc khi toggle "Bảo hiểm = Có" | "Vui lòng chọn công ty bảo hiểm" | `ERR-INS-001` |
| % chiết khấu / khấu hao (mọi trường) | 0-100 | "Chiết khấu không thể lớn hơn 100%" / "Khấu hao không thể lớn hơn 100%" | `ERR-CMN-002` / `ERR-CMN-003` |
| Số tiền điều chỉnh BH | ≥ 0, ≤ cơ sở (Cộng sau VAT thuộc BH) | "Số tiền vượt quá số lượng cho phép" | `ERR-CMN-001` |

## 7. Cross-flow navigation

| Từ | Sang | Trigger | Ghi chú |
|---|---|---|---|
| UX-FLOW-SERVICE-REPAIR (SO sửa chữa) | UX-FLOW-INSURANCE-SETTLEMENT (luồng này) | SO có dòng BH | Section "Phân bổ quyết toán bảo hiểm" tự hiện trên SO |
| UX-FLOW-INSURANCE-SETTLEMENT | UX-FLOW-PAYMENT (luồng QT khách hàng baseline) | Cặp phiếu QT KH + BH | Phiếu QT KH có dòng "Phần chịu từ điều chỉnh bảo hiểm" |
| Phiếu QT BH | Phiếu QT KH liên kết | Link "Xem phiếu QT khách hàng liên kết" | Trên FEAT-INS-STL-DETAIL |
| Dashboard widget công nợ BH | Phiếu QT BH cụ thể | Click vào hàng top phiếu chờ thu / chậm thanh toán | Drill-down sang FEAT-INS-STL-DETAIL |

## 8. Error UX

### 8.1 Lỗi nghiệp vụ (validation + business rule)

| Mã lỗi | Scenario | Thông báo (tiếng Việt) | Hiển thị / Hành động |
|---|---|---|---|
| `ERR-INS-002` | SO chưa chọn DN BH khi tạo phiếu QT BH | "Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm" | `DIALOG` + link "Quay về Phiếu dịch vụ" |
| `ERR-INS-003` | Bảo hiểm thanh toán < 0 | "Bảo hiểm thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh" | `INLINE_WARNING` **ở 2 vị trí** (CR-20260612-02): (1) inline tại panel "Phân bổ quyết toán bảo hiểm" màn Chỉnh sửa SO; (2) **trong popup "Hoàn thành phiếu dịch vụ"** (FEAT-SO-DETAIL AC-16). **Vẫn cho lưu / hoàn thành** (warn-and-allow, không block — chốt PO 2026-06-02) |
| `ERR-INS-005` | Đã tồn tại phiếu QT BH cho SO này | "Đã tồn tại phiếu quyết toán bảo hiểm cho phiếu dịch vụ này" | `DIALOG` + link "Xem phiếu hiện có" |

### 8.2 Lỗi hệ thống

| Mã lỗi | Scenario | Thông báo | Hiển thị / Retry policy |
|---|---|---|---|
| `ERR-INS-008` | Generate PDF hồ sơ fail (template render lỗi) | "Không tạo được PDF hồ sơ — vui lòng thử lại" | `TOAST` + nút Thử lại; auto-retry 2 lần rồi user nhấn thủ công |
| `ERR-CMN-006` | Object storage timeout khi upload | "Không tải lên được file — vui lòng thử lại" | `TOAST` + nút Thử lại (user-initiated) |
| `ERR-INS-009` | Tải PDF version cũ fail | "Không tải được hồ sơ — vui lòng liên hệ quản trị" | `TOAST`; không retry tự động (có thể do file đã xoá) |
| `ERR-CMN-007` | Cross-boundary call gf-accounting ↔ gf-sales fail (cập nhật snapshot) | "Hệ thống đang bận, vui lòng thử lại sau" | `TOAST`; retry 3 lần backoff exponential |
| `ERR-CMN-008` | Cập nhật phiếu QT BH bị conflict (optimistic lock) | "Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại" | `DIALOG` + nút Tải lại (user reload form) |

### 8.3 Fallback

- Nếu widget Dashboard không load được → hiển thị message lỗi nhưng các widget khác vẫn hoạt động (không block toàn dashboard).
- Nếu tab "Hồ sơ đã xuất" không load được URL signed của object storage → cho phép user retry click lại; backend refresh signed URL.

## 9. Accessibility (A11y)

| Tiêu chí | Áp dụng |
|---|---|
| Keyboard navigation | Toàn bộ form SO, modal tạo hồ sơ, dropdown công ty BH thao tác được bằng Tab/Shift+Tab/Enter/Escape |
| Focus trap | Modal tạo hồ sơ BH + modal ghi nhận thanh toán BH → focus trap đến khi đóng |
| ARIA labels | Toggle %/số tiền (Chiết khấu liên kết, Giảm trừ bồi thường) có `aria-label="Chuyển chế độ phần trăm/số tiền"` |
| Screen reader | Bảng tổng phân bổ BH realtime có `aria-live="polite"` để đọc thay đổi |
| Color contrast | Highlight đỏ "Bảo hiểm thanh toán âm" + badge trạng thái thanh toán (xám/vàng/xanh) tuân thủ WCAG AA |
| Tooltip cảnh báo | Có version text rendered trong DOM để screen reader đọc, không chỉ hover-only |

## 10. Referenced features

> Figma Web design link per FEAT — source-of-truth tại `§3 UI/UX Reference` của từng FEAT (DESIGN-SOURCE-POLICY §2.1). Cột "Figma (web)" dưới đây dẫn nhanh node tương ứng trong file GMS-v.3 (`EMGjGsnAJzGoGwTSK7dTuZ`).

| FEAT ID | Vai trò trong flow | Figma (web) |
|---|---|---|
| *(foundation — baseline)* | Đánh dấu nguồn TT BH/KH per dòng trên SO (Bước 4b) — **đã production**, EP-SERVICE-ORDER | — |
| `FEAT-INS-SO-ADJUSTMENT` | Nhập 5 khoản điều chỉnh BH + bảng tổng realtime (Bước 4c) + truyền phân bổ khi tạo phiếu QT (Bước 5, AC-15) | [node 13257-469505](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-469505&m=dev) |
| *(foundation — baseline)* | Tạo cặp phiếu QT KH + BH atomic (Bước 5) — **đã production**, EP-SETTLEMENT | — |
| `FEAT-INS-STL-CREATE` | Panel "Tổng giá dịch vụ" read-only trên màn xác nhận Tạo phiếu QT (Bước 5) — CR mở rộng FEAT-STL-CREATE | [node 13535-157815](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13535-157815&m=dev) |
| `FEAT-INS-STL-DETAIL` | Xem chi tiết phiếu QT BH + ghi nhận thanh toán từ BH (Bước 9) | [node 13255-177002](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev) |
| `FEAT-INS-DOSSIER-CREATE` | Lập bộ hồ sơ 4 tài liệu + xuất PDF + versioning (Bước 6, 8) | [node 13257-536880](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-536880&m=dev) |
| `FEAT-INS-DOSSIER-VIEW` | Tab "Hồ sơ đã xuất" read-only — truy vết lịch sử (Bước 6 sau xuất, Bước 8 sau tạo v2+) | [node 13257-480151](https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-480151&m=dev) |
| `FEAT-INS-DASH-DEBT` | Widget công nợ BH trên Dashboard (Bước 10) | — |
| *(foundation — baseline)* | Danh sách/dropdown công ty BH (Bước 4a) — **system-seeded production** | — |

**Cross-reference features baseline được mở rộng**:
- `FEAT-SO-CREATE`, `FEAT-SO-EDIT` (EP-SERVICE-ORDER) — thêm cột Nguồn TT + section điều chỉnh BH.
- `FEAT-STL-CREATE` (EP-SETTLEMENT) — tạo cặp KH+BH đã có ở baseline (production); phần mới = truyền block phân bổ BH khi tạo (FEAT-INS-SO-ADJUSTMENT AC-15).
- `FEAT-STL-DETAIL` (EP-SETTLEMENT) — component ghi nhận thanh toán được tái sử dụng cho phiếu QT BH (FEAT-INS-STL-DETAIL).
- `FEAT-DASH-VIEW` (EP-DASHBOARD) — thêm widget công nợ BH (FEAT-INS-DASH-DEBT).

## Change Log

| Date | Version | Author | Description |
| 2026-06-18 | 22 | Delivery Authority (BE/raw cascade) | **CR-20260616-01 cascade BE/raw** (APPROVED 2026-06-16, slot W02 Phase A): §4 Bước 9 — thêm **"Lưu ý bản in (PDF/A4) phiếu QT"** sau bảng panel màn chi tiết: bản in bổ sung section **"Phân bổ bảo hiểm"** theo cùng quy tắc per-payer (BH 5 khoản dấu −; KH từ SO có BH 3 khoản dấu +, ẩn 2 khoản CK liên kết; KH từ SO không BH giữ baseline); cờ `soHasInsurance` tái dùng CR-20260612-01; PDF gốc bất biến (PRINT-INS-005); dấu/nhãn khớp panel (BR-INS-STL-DET-009). Mockup `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-{insurance,customer}.html`. Đồng bộ BR-EP v32 (PRINT-INS-001 + PRINT-INS-007) + FEAT-INS-STL-DETAIL v16. |
| 2026-06-18 | 21 | BA/PO (anhluong) | **Gỡ gate "③④ chỉ tích được sau khi điền đủ trường bắt buộc"** (rule không chính xác): §4 Bước 6 bảng tài liệu cột UI state ③④ sửa "Sẵn sàng sau khi điền đủ" → "Có thể tích chọn ngay"; câu giới thiệu nút "Xuất hồ sơ bảo hiểm" gỡ block "tài liệu điền tay chưa hoàn tất" + ERR-INS-007; §5.2 state "Mới tạo" sửa "③④ chỉ tích được sau khi điền đủ" → "cả 4 tài liệu đều có thể tích chọn ngay"; state "Sẵn sàng xuất" gỡ "tài liệu được chọn đã hoàn tất"; §8.1 gỡ dòng `ERR-INS-007`. Đồng bộ FEAT-INS-DOSSIER-CREATE v22, BR-EP v31. |
| 2026-06-17 | 20 | BA/PO (anhluong) | **Đồng bộ màn Hồ sơ bảo hiểm theo đọc lại Figma APP (`437-24051`) + WEB (`13257-536880`)**: §3 thay wireframe 2-pane (sidebar badge ✓/⚠ + preview) bằng bố cục mới — **web modal accordion dọc** + **app màn list → màn chi tiết**, **gỡ progress bar + badge "Sẵn sàng/Bổ sung"**; Bước 6 cập nhật bảng tài liệu (PQT có Phân bổ bảo hiểm; nút web "In phiếu"+"Tải PDF", "In biên bản"/"In giấy ủy quyền"; app "Lưu thông tin" = lưu cục bộ trong phiên) + xuất theo tích chọn (bỏ "4/4 → enable"); §5.2 states cập nhật theo checkbox/dòng phụ; sửa diagram §2 "Xuất PDF gộp" → "Xuất hồ sơ (PDF riêng từng file)". Nguồn FEAT-INS-DOSSIER-CREATE v21. |
| 2026-06-15 | 19 | Business Authority | **Thực thi CR-20260612-01 + 02**: (1) Bước 9 + §6.2 — panel "Tổng giá dịch vụ" trên chi tiết phiếu QT **tách theo bên thanh toán** (phiếu BH chỉ cột BH + giữ "Tổng thanh toán"; phiếu KH từ SO có BH thêm "Phân bổ Bảo hiểm"; KH từ SO không BH rút gọn) + bảng tóm tắt 3 loại phiếu + NEED CONFIRMATION CK liên kết trên phiếu KH; (2) Bước 5 — thêm bước popup **"Hoàn thành phiếu dịch vụ"** cảnh báo "BH thanh toán âm" (warn-and-allow), §6.2 `ERR-INS-003` ghi 2 vị trí hiển thị. Nguồn FEAT-INS-STL-DETAIL v15, FEAT-INS-SO-ADJUSTMENT v23, BR-EP v29. |
| 2026-06-15 | 18 | Business Authority | **Panel "Tổng giá dịch vụ" trên màn Tạo phiếu quyết toán** (FEAT-INS-STL-CREATE): §4 Bước 5 — thêm bước xem màn xác nhận Tạo phiếu QT hiển thị panel read-only (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) snapshot từ SO trước khi "Xác nhận"; trường "Tổng tiền bảo hiểm trả" bên BH read-only=computed (BR-INS-STL-CRE-009); thêm Trường hợp ngoại lệ (SO không BH rút gọn / BH ≤ 0 / trùng phiếu / read-only). §2 Entry Point #2 cập nhật phản ánh panel màn tạo. Đồng bộ FEAT-INS-STL-CREATE v5, BR-EP v28. |
| 2026-06-12 | 18 (teammate) | Business Authority | **Bổ sung màn xác nhận Tạo phiếu QT (FEAT-INS-STL-CREATE)** vào Bước 5: chèn bước xem màn xác nhận + panel "Tổng giá dịch vụ" read-only (Chi tiết theo bên thanh toán + Phân bổ Bảo hiểm + Cân thanh toán) trước khi "Xác nhận"; trường "Tổng tiền bảo hiểm trả" bên BH = read-only computed (CNF-INS-001); SO không BH → panel rút gọn (BR-INS-STL-CRE-009). Cập nhật Entry Point #2 + §10 Referenced features (thêm FEAT-INS-STL-CREATE, node 13535-157815). Fix stale ref Bước 5 "FEAT-INS-STL-DETAIL AC-11" (tombstone) → BR-INS-STL-CRE-008. |
| 2026-06-11 | 17 | BA/PO (anhluong) | **Bỏ "Sao chép từ bản trước" + trạng thái bộ hồ sơ** (chốt E-4/E-5/E-6): §1 sơ đồ ⑧ + §4 Bước 8 (tạo bộ mới = điền lại template, không "Sao chép từ bản trước"; tab có nhiều bộ phân biệt theo ngày/lần xuất, **không có trạng thái "Đã thay thế"**); wireframe §3 (gỡ nút [Upload]/[Sao chép từ bản trước] + nhãn "v1"); §5.2 state "Đã xuất" (gỡ banner "v{N}" + "thao tác sửa disable" → "Chỉ xem", không có nút sửa/xuất đè). |
| 2026-06-11 | 16 | BA/PO (anhluong) | **Bỏ chức năng upload file scan** (chốt B-3): §1 sơ đồ bước ⑥ (③④ điền template, bỏ "upload scan"); §4 Bước 6 bảng tài liệu ③④ điền template trực tiếp; §4 Bước 7 (tải PDF, bỏ "tài liệu scan"); §4 Bước 8 versioning (sao chép nội dung template, "sửa nội dung template"); **§6.2 gỡ dòng "File upload Biên bản scan" + `ERR-CMN-004/005`**. Đồng bộ FEAT-INS-DOSSIER-CREATE v17, BR-EP v26, ERROR-CODE-REGISTRY. |
| 2026-06-11 | 15 | BA/PO (anhluong) | **Gắn mã lỗi (`Product/error-code/ERROR-CODE-REGISTRY.md`) vào §6 + §8** — thêm cột **Mã lỗi** + **Hiển thị** (display type) cho bảng field-level §6.2, lỗi nghiệp vụ §8.1, lỗi hệ thống §8.2; chú thích §6.1 form-level. Canonical-hoá wording: gộp 4 biến thể "chọn/nhập công ty/doanh nghiệp bảo hiểm" → 1 message `ERR-INS-002`; số tiền → "Số tiền vượt quá số lượng cho phép" (`ERR-CMN-001`); hoàn tất tài liệu bỏ biến → `ERR-INS-007`. Gắn display TOAST/DIALOG/INLINE_* theo registry. |
|---|---|---|---|
| 2026-06-10 | 14 | BA/PO (anhluong) | **Gỡ cancel/huỷ phiếu QT khỏi UI** — giao diện không có hành động/trạng thái huỷ phiếu quyết toán: gỡ 2 guard exception (Sửa SO → "Huỷ phiếu quyết toán"; "Huỷ phiếu QT BH đã có thanh toán"); gỡ **nhánh sửa số liệu Bước 8** (huỷ phiếu → reopen SO → tạo lại) — Bước 8 chỉ còn sửa **tài liệu hồ sơ** (tạo version mới); reword dependency note §EP-SETTLEMENT (DRAFT/CANCEL = data model/backend, không lên UI). Đồng bộ FEAT-INS-STL-DETAIL v10, BR-EP v21. |
| 2026-06-10 | 13 | BA/PO (anhluong) | **Validate hiển thị element đặc thù BH theo Bên thanh toán** (đồng bộ FEAT-INS-STL-DETAIL v9 + BR-EP v20): navigation map mục 4 (nút "Tạo hồ sơ bảo hiểm") + mục 5 (tab "Hồ sơ bảo hiểm đã xuất") đổi điều kiện sang **Bên thanh toán = Bảo hiểm** (ẩn với phiếu QT Khách hàng), **gỡ điều kiện trạng thái DRAFT** (giao diện không có trạng thái phiếu Draft). Reword guard exception "phiếu QT BH DRAFT" → "phiếu QT BH (chưa huỷ)". |
| 2026-06-05 | 12 | BA/PO (anhluong) | **Resolve 2 NEED CONFIRMATION**: (1) Bước 9 Scenario C — overpayment BH: phần thừa xử lý **ngoài hệ thống** (không auto negative adjustment, BR-INS-STL-DET-008); (2) §5.2 states màn Hồ sơ BH — **KHÔNG auto-save draft**, dữ liệu chỉ persist khi nhấn "Xuất hồ sơ bảo hiểm" (đồng bộ BR-EP v19, FEAT-INS-DOSSIER-CREATE v13). |
| 2026-06-04 | 11 | Business Authority | §10 Referenced features — cập nhật cột **Figma (web)** sang file mới `GMS-v.3` (`EMGjGsnAJzGoGwTSK7dTuZ`): STL-DETAIL `13255-177002`, SO-ADJUSTMENT `13257-469505`, DOSSIER-CREATE `13257-536880`, DOSSIER-VIEW `13257-480151` (thay node cũ trong file `D1walLy4OuAvYhB12vUuPT`). Đồng bộ §3 UI/UX Reference 4 FEAT + registry figma-links.yaml. Mobile giữ nguyên. (CR-1780555878) |
| 2026-06-02 | 10 | PO (cuongnguyen_ac) + Business Authority | **Sync PO sign-off + fix 3 drift**: (1) Bước 4 + §8.1 — "Bảo hiểm thanh toán" âm: cảnh báo nhưng **vẫn cho lưu** (không block); (2) Bước 8 — resolve NEED CONFIRMATION: SO **khoá hoàn toàn** khi có phiếu QT BH → huỷ phiếu QT (cascade cặp KH) → reopen SO → sửa → tạo lại; (3) **fix drift Bước 6** đồng bộ BR đã ratified: thứ tự tài liệu ① Phiếu quyết toán → ② Phiếu báo giá (BR-INS-DOSSIER-001), ④ Giấy ủy quyền = **template điền** không upload-only (BR-INS-DOSSIER-004 v13), xuất **PDF riêng mỗi tài liệu** không gộp (PRINT-INS-002 v12). Đồng bộ BR-EP v17, FEAT-INS-SO-ADJUSTMENT v15, FEAT-INS-DOSSIER-CREATE v7. |
| 2026-06-02 | 9 | Business Authority | §10 Referenced features: thêm cột **Figma (web)** dẫn nhanh node Figma per FEAT (STL-DETAIL `1101-9485`, SO-ADJUSTMENT `1113-15568`, DOSSIER-CREATE `1101-9486`, DOSSIER-VIEW `1113-21146`) — source-of-truth tại §3 UI/UX Reference của từng FEAT (DESIGN-SOURCE-POLICY §2.1). |
| 2026-05-27 | 1 | Business Authority | Khởi tạo UX-FLOW-INSURANCE-SETTLEMENT từ PRD v6 + EP-INSURANCE-SETTLEMENT v2 + 10 features FEAT-INS-*. Mô tả luồng vận hành thực tế tại garage qua 10 bước chính + 1 bước phụ master data. Bao gồm bối cảnh nghiệp vụ thực (BH duyệt một phần, BH trả nhiều đợt, BH yêu cầu sửa hồ sơ, master data DN BH với chiết khấu mặc định). Wireframe ASCII section "Phân bổ quyết toán bảo hiểm" trên SO + màn hình Hồ sơ BH + sơ đồ navigation. 4 bảng states per screen, 6 nhóm error UX, A11y. Cross-flow nav sang UX-FLOW-SERVICE-REPAIR (upstream) + UX-FLOW-PAYMENT (sibling cặp QT KH). |
| 2026-05-27 | 2 | Business Authority | **Correction luồng nghiệp vụ**: phần phân bổ BH (cột Nguồn TT + section điều chỉnh) chỉ ở màn **Chỉnh sửa (Edit) + Chi tiết (Detail)**, KHÔNG ở Tạo (Create). Sửa sơ đồ luồng tổng quan ①-⑤: ① khám xe → ② tạo SO + báo giá sơ bộ (Create, không phân bổ) → ③ gửi BH duyệt (ngoài hệ thống) → ④ Edit nhập phân bổ BH đã duyệt (4a chọn DN BH, 4b nguồn TT, 4c 5 khoản điều chỉnh) → ⑤ tạo cặp QT. Rewrite §4 Bước 1-5. Cập nhật Entry Point #1 (Edit thay Create) + note. Wireframe header đổi "(Chỉnh sửa)". |
| 2026-05-27 | 3 | Business Authority | **Xoá ref FEAT-INS-SO-PAYMENT-SOURCE** (đã production, gỡ khỏi epic) — Referenced by 10 → 9 FEAT. Nguồn TT per dòng (Bước 4b) ghi nhận là baseline foundation (EP-SERVICE-ORDER). Bước 4a cập nhật: dropdown công ty BH + 6 trường + upload hồ sơ bảo lãnh = production (toggle "Bảo hiểm = Có"). Quick-select ghi nhận baseline. |
| 2026-05-27 | 4 | Business Authority | Cập nhật wireframe theo production design screenshot: tách 2 panel (trái = "Phân bổ quyết toán bảo hiểm" 5 trường VND/% + "Áp dụng tất cả"; phải = "Tổng giá dịch vụ" gồm Chi tiết theo bên thanh toán / Phân bổ Bảo hiểm / Cân thanh toán). Số liệu thật: Cộng sau VAT BH 207.9M / KH 33M → BH thanh toán 197.68M + KH 35.72M = Tổng 233.4M. Thêm trường production "Ngày hết hạn" + "Hồ sơ bảo lãnh". Gỡ duplicate header + cân bằng code fence. |
| 2026-05-27 | 5 | Business Authority | Wireframe: Khấu hao đổi sang **% + nút "Áp dụng tất cả"** (chỉ phụ tùng; per-dòng tại cột "Khấu hao %" bảng phụ tùng). Trigger section = toggle "Bảo hiểm = Có". Đồng bộ FEAT-INS-SO-ADJUSTMENT v9. |
| 2026-05-27 | 6 | Business Authority | **Xoá ref FEAT-INS-STL-CREATE** (tạo phiếu QT đã production) — Referenced by 9 → 8 FEAT. Bước 5: tạo cặp phiếu QT = baseline + truyền block phân bổ BH (mới, FEAT-INS-SO-ADJUSTMENT AC-15). §6 validation + §10 referenced features cập nhật. |
| 2026-05-27 | 7 | Business Authority | Bước 10 Dashboard: thu gọn — filter kỳ (5 giá trị) + 3 KPI + 2 top list; **bỏ biểu đồ lịch sử thanh toán + phân chia theo DN BH**. Đồng bộ FEAT-INS-DASH-DEBT v3. |
| 2026-05-27 | 8 | Business Authority | **Bỏ 3 features FEAT-INS-COMPANY-*** (danh sách công ty BH = system-seeded production). Gỡ Entry Point #2 (menu) + #8 (inline create), Bước phụ ⓿ master data, §6/§7/§8 refs, §10 referenced features (8 → 5 FEAT). Referenced by 8 → 5 FEAT. Danh sách công ty BH ghi nhận là foundation baseline. |
