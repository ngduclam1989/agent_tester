---
type: feature
artifact_kind: feature
status: PLANNED
version: 16
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"
boundary: "gf-accounting"
modifies: ["FEAT-STL-DETAIL"]
related: ["FEAT-INS-STL-DETAIL"]
change_type: "brownfield-enhancement"
last_reviewed: "2026-06-22"
---
# FEAT-INS-DOSSIER-VIEW: Xem hồ sơ bảo hiểm đã xuất (read-only, versioning)

---

## Metadata


| Field       | Value                                                    |
| ----------- | -------------------------------------------------------- |
| Feature ID  | `FEAT-INS-DOSSIER-VIEW`                                  |
| Title       | Xem hồ sơ bảo hiểm đã xuất (read-only, versioning) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT`                                |
| Boundary    | `gf-accounting`                      |
| Priority    | P1                                                       |
| Status      | PLANNED                                                  |
| Loại thay đổi | **CR — mở rộng feature production** (không phải màn hình mới) |
| Màn hình target | [`FEAT-STL-DETAIL`](./FEAT-STL-DETAIL.md) — Chi tiết phiếu quyết toán (production, gf-accounting) |
| Tích hợp qua | [`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md) — lớp mở rộng BH của cùng màn |
| Depends on  | `FEAT-INS-DOSSIER-CREATE` (đã có hồ sơ xuất ra)    |

## 0. Bối cảnh thay đổi (Change Request — DEV đọc trước)

> ⚠️ **ĐÂY LÀ CR MỞ RỘNG MÀN HÌNH ĐÃ CÓ — KHÔNG dựng màn hình mới.**
>
> - **Target (production)**: [`FEAT-STL-DETAIL`](./FEAT-STL-DETAIL.md) — màn **Chi tiết phiếu quyết toán** đang chạy production (gf-accounting), đã có sẵn **3 tab baseline** (Bảng chi phí / Chứng từ & hoá đơn / Lịch sử thanh toán). DEV agent **PHẢI đọc FEAT-STL-DETAIL trước**.
> - **Tích hợp qua**: [`FEAT-INS-STL-DETAIL`](./FEAT-INS-STL-DETAIL.md) — lớp mở rộng bảo hiểm (định nghĩa bộ tab mở rộng — xem AC-4).
> - **Phạm vi CR này**: THÊM **tab "Hồ sơ bảo hiểm đã xuất"** (tab thứ 3, read-only, versioning) vào bộ tab màn chi tiết phiếu QT — **chỉ hiển thị khi Bên thanh toán = Bảo hiểm** (BR-INS-DOSSIER-VIEW-008). Phiếu QT khách hàng giữ nguyên 3 tab baseline.
> - **Nguyên tắc DEV**: extend bộ tab hiện có, không rebuild; không phá vỡ hành vi baseline phiếu QT khách hàng.

## 1. User Story

**As** kế toán / chủ garage, **I want** xem lại các bộ hồ sơ bảo hiểm đã xuất (danh sách file PDF riêng từng tài liệu) của một phiếu quyết toán bảo hiểm — bao gồm các bộ đã từng phát hành — **so that** truy vết lịch sử hồ sơ đã gửi cho doanh nghiệp BH, đối chiếu khi cần và xem/tải lại PDF gốc.

## 2. Acceptance Criteria

### Nhóm A — Tab "Hồ sơ bảo hiểm đã xuất"

- [ ]  **AC-1**: Truy cập tab

  - Tại: phiếu QT BH (FEAT-INS-STL-DETAIL), tab **"Hồ sơ bảo hiểm đã xuất"**.
  - **Tiền đề hiển thị tab (chốt 2026-06-10)**: tab **"Hồ sơ bảo hiểm đã xuất"** **chỉ hiển thị khi Bên thanh toán của phiếu QT = Bảo hiểm** — phiếu QT Khách hàng **không có tab này** (chỉ 3 tab baseline). Gate **chỉ theo Bên thanh toán**, **không** ràng buộc trạng thái phiếu (giao diện người dùng không có trạng thái DRAFT). Xem FEAT-INS-STL-DETAIL AC-4 + BR-INS-STL-DET-007.
  - Khi: kế toán mở tab và phiếu đã từng xuất ≥ 1 bộ hồ sơ.
  - Thì: hiển thị **danh sách dọc các bộ hồ sơ đã xuất** (bộ mới nhất trên cùng); mỗi bộ gồm tiêu đề bộ hồ sơ + **lưới (grid) các thẻ file PDF xếp 2 cột**. Xem nội dung file qua hành động Xem PDF (AC-4/AC-5).
  - Khi: chưa từng xuất hồ sơ.
  - Thì: empty state **"Chưa có hồ sơ nào được xuất"** (`ERR-INS-010` · `EMPTY_STATE` · 🔵 Thông tin).
- [ ]  **AC-2**: Khối "Bộ hồ sơ"

  - Tại: đầu mỗi khối bộ hồ sơ trong danh sách dọc.
  - Khi: tab tải.
  - Thì: hiển thị tiêu đề **"Bộ hồ sơ {mã phiếu QT}"** (vd "Bộ hồ sơ #SET-20260326-00001") + dòng phụ **"Xuất ngày {dd/mm/yyyy hh:mm} · {N} tài liệu PDF"** (N ≤ 4 — số tài liệu được tích chọn xuất).
  - Nếu có nhiều bộ hồ sơ (BH yêu cầu sửa → xuất bộ mới) → hiển thị **list dọc, chia theo từng lần xuất** (mỗi lần xuất = 1 khối "Bộ hồ sơ" với ngày xuất riêng), bộ mới nhất trên cùng (chốt 2026-05-27).
- [ ]  **AC-3**: Lưới thẻ file PDF trong bộ hồ sơ (grid 2 cột)

  - Tại: trong mỗi khối bộ hồ sơ, dưới tiêu đề + dòng phụ.
  - Khi: tab tải.
  - Thì: hiển thị **các file PDF riêng từng tài liệu dưới dạng lưới thẻ (card) xếp 2 cột** (export sinh PDF riêng mỗi tài liệu, KHÔNG phải 1 PDF gộp), mỗi thẻ gồm:
    - Icon PDF.
    - **Tên file + kích thước trên cùng một dòng** (vd "Phiếu quyết toán.pdf · 100kb"); tên nằm trong 4 tài liệu chuẩn ("Phiếu báo giá.pdf", "Phiếu quyết toán.pdf", "Biên bản nghiệm thu.pdf", "Giấy ủy quyền nhận tiền bồi thường.pdf").
    - **Mã tham chiếu phiếu QT** (vd #SET-20260326-00001) ở dòng dưới.
  - Thẻ đang chọn highlight **viền nổi bật**. Mặc định chọn thẻ đầu tiên của bộ mới nhất.
  - Số thẻ trong bộ = số tài liệu được tích chọn khi xuất (**tối đa 4** — chốt 2026-05-27, không có file thứ 5/bản gộp).

### Nhóm B — Xem file PDF

- [ ]  **AC-4**: Chọn & xem file PDF 

  - Tại: lưới thẻ file PDF.
  - Khi: kế toán nhấn 1 thẻ file PDF.
  - Thì: hệ thống **mở file PDF gốc để xem** ở chế độ read-only qua hành động Xem PDF (AC-5).
- [ ]  **AC-5**: Xem / tải PDF gốc

  - Tại: hành động **"Xem PDF"** trên thẻ file / trong trình xem — và/hoặc action tải.
  - Khi: kế toán nhấn.
  - Thì: mở/tải file PDF gốc đã lưu trong object storage. **Không re-generate** (đảm bảo bản gửi BH bất biến).
  - Khi ấn xem hoặc tải pdf, hệ thống hiển thị mẫu phiếu in tương ứng của từng loại phiếu:
    - Phiếu báo giá và Phiếu quyết toán lấy mẫu phiếu in hiện tại đã có.
    - Biên bản nghiệm thu: lấy mẫu phiếu trong file ~ux/assets/bien-ban-nghiem-thu.html
    - Giấy ủy quyền nhận bồi thường lấy trong file: ux/assets/giay-uy-quyen.html
    - Mở màn hình preview phiếu in mặc định của trình duyệt
### Nhóm C — Read-only

- [ ]  **AC-6**: Toàn bộ chế độ chỉ xem
  - Tại: tab "Hồ sơ bảo hiểm đã xuất".
  - Khi: kế toán xem.
  - Thì: tất cả file đã xuất ở chế độ **"Chỉ xem"** — không sửa nội dung, không thay thế, không xuất đè. Muốn điều chỉnh → tạo bộ hồ sơ mới (nút "+ Tạo hồ sơ bảo hiểm" trên header phiếu QT BH).

### Nhóm D — Versioning & phân quyền

- [ ]  **AC-7**: Nhiều bộ hồ sơ (versioning) — list dọc theo từng lần xuất

  - Tại: danh sách bộ hồ sơ.
  - Khi: phiếu QT BH đã xuất nhiều lần (BH yêu cầu sửa → xuất bộ mới).
  - Thì: hiển thị **list dọc, chia theo từng lần xuất** — mỗi khối "Bộ hồ sơ" có ngày xuất riêng + **lưới thẻ file PDF (2 cột)** của lần đó. Bộ mới nhất trên cùng. Bộ cũ vẫn truy cập (read-only) để truy vết.
- [ ]  **AC-8**: Phân quyền xem

  - Tại: tab "Hồ sơ bảo hiểm đã xuất".
  - Khi: kế toán hoặc chủ garage truy cập.
  - Thì: cả 2 vai trò đều xem & tải PDF. Không có ngoại lệ phân quyền.

### Nhóm E — Xử lý lỗi & edge

- [ ]  **AC-9**: File PDF không tồn tại / storage lỗi

  - Tại: nút "Xem PDF" / tải file.
  - Khi: file đã bị xoá khỏi storage hoặc storage offline.
  - Thì: hiển thị lỗi **"Không tải được hồ sơ — vui lòng liên hệ quản trị"** (`ERR-INS-009` · `TOAST`, không retry tự động), đồng thời **re-generate từ snapshot** (chốt PO 2026-06-02). Vì hệ thống chỉ dùng **1 template** (xem EC-4) nên bản tái tạo khớp bản gốc. *(Đây là fallback recovery khi file mất khỏi storage — khác luồng xem thường BR-003 phục vụ file gốc bất biến, không re-generate.)*
## 3. UI/UX Reference


| Kind  | Platform | URL / Path                                                                                          |
| ----- | -------- | --------------------------------------------------------------------------------------------------- |
| Figma | web      | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-480151&m=dev              |
| Figma | mobile   | https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-43731&m=dev |

- Behavior spec: [`Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`](../ux/UX-FLOW-INSURANCE-SETTLEMENT.md) §4 Bước 6 (sau xuất) & Bước 8 (versioning).
- Design source: **Figma** (web + mobile — xem bảng trên). HTML mockup không dùng (chốt PO 2026-06-02 — design-source = Figma).

## 4. API Reference

- Boundary: `gf-accounting`
- Query `ListInsuranceDossierSets(settlementId: ID, limit: Int = 5, offset: Int)` → trả danh sách các bộ hồ sơ đã xuất (mỗi bộ: ngày xuất, người xuất, số tài liệu), **phân trang mỗi lần 5 bộ** (sắp ngày xuất giảm dần) + tổng số bộ (`totalCount`) / cờ `hasMore` để FE quyết định hiển thị "Xem thêm" (xem AC-7).
- Query `GetInsuranceDossierSet(dossierId: ID)` → trả metadata + danh sách file PDF riêng từng tài liệu (tên, kích thước, số trang, signed URL).
- Object storage: read-only access (signed URL refresh khi cần), không có endpoint write từ FEAT này.

## 5. Business Rules

- **BR-INS-DOSSIER-VIEW-001**: Tab "Hồ sơ bảo hiểm đã xuất" hiển thị **tất cả các bộ hồ sơ** đã xuất (không filter, không xoá). Mỗi bộ = 1 lần xuất, chứa **các file PDF riêng từng tài liệu** (không phải 1 PDF gộp).
- **BR-INS-DOSSIER-VIEW-002**: File trong bộ đã xuất là **immutable** — read-only, "Chỉ xem", không thay thế, không xuất đè.
- **BR-INS-DOSSIER-VIEW-003**: Xem/tải PDF lấy đúng file đã lưu trong object storage tại thời điểm xuất — không re-generate (đảm bảo bản gửi BH bất biến).
- **BR-INS-DOSSIER-VIEW-004**: Nhiều bộ hồ sơ hiển thị **list dọc chia theo từng lần xuất** (bộ mới nhất trên cùng). Bộ cũ vẫn truy cập (read-only) để truy vết.
- **BR-INS-DOSSIER-VIEW-005**: **Không cho phép xoá bộ hồ sơ đã xuất** — audit trail **giữ vĩnh viễn** (chốt PO 2026-06-02; không có retention/auto-purge policy trong scope).
- **BR-INS-DOSSIER-VIEW-007**: Export sinh **PDF riêng cho mỗi tài liệu được tích chọn** (tối đa 4: Phiếu báo giá.pdf, Phiếu quyết toán.pdf, Biên bản nghiệm thu.pdf, Giấy ủy quyền nhận tiền bồi thường.pdf) — không có file gộp/file thứ 5 (chốt 2026-05-27). Đồng bộ FEAT-INS-DOSSIER-CREATE.
- **BR-INS-DOSSIER-VIEW-008**: Tab **"Hồ sơ bảo hiểm đã xuất"** **chỉ hiển thị trên phiếu QT có Bên thanh toán = Bảo hiểm**; ẩn hoàn toàn với phiếu QT Khách hàng (về 3 tab baseline). Gate **chỉ theo Bên thanh toán**, không theo trạng thái phiếu — giao diện người dùng **không có trạng thái DRAFT** (chốt 2026-06-10). Đồng bộ BR-INS-STL-DET-007 + FEAT-INS-STL-DETAIL AC-4.

## 6. Edge Cases

- **EC-1**: Phiếu QT BH có nhiều bộ hồ sơ đã xuất → danh sách **list dọc, phân trang mỗi lần load 5 bộ** (page size = 5, "Xem thêm" load thêm 5 bộ tiếp theo — xem AC-7). *(Cập nhật 2026-06-17: thay quyết định cũ "không paginate" 2026-06-02 — danh sách dài cần phân trang để tải nhẹ.)*
- **EC-2**: Phân quyền xem tài liệu hồ sơ riêng tư (vd nội dung nhạy cảm) → **chưa cần role-based access** ngoài 2 persona dual (chốt PO 2026-06-02). Cả 2 personas (kế toán + chủ garage) đều xem được toàn bộ.
- **EC-3**: Object storage URL hết hạn (signed URL) → backend phải refresh signed URL khi user click "Tải PDF".
- **EC-4**: **CHỐT (PO 2026-06-02)**: hệ thống **chỉ dùng 1 template** cho mỗi loại tài liệu → **không cần lưu/quản lý template version** trong dossier record. Re-generate (fallback AC-9) dùng đúng template hiện hành + snapshot data → khớp bản gốc.
- **EC-5**: Tenant đã xoá phiếu QT BH hoàn toàn (hard delete — nếu có) → hồ sơ liên kết xử lý thế nào? Đề xuất chặn hard delete khi còn hồ sơ.

## 7. Out of Scope

- Tạo & xuất hồ sơ BH → `FEAT-INS-DOSSIER-CREATE`.
- Chỉnh sửa nội dung tài liệu của version đã xuất → KHÔNG cho phép (chỉ tạo bản mới).
- Xoá version đã xuất → KHÔNG cho phép trong scope hiện tại.
- Export định dạng khác PDF (XML/EDI) → ngoài scope.
- So sánh diff giữa các version → có thể nice-to-have, ngoài scope MVP.

## Related CRs

> Link sang [`Tracking/CHANGE-REQUESTS.md`](../../Tracking/CHANGE-REQUESTS.md) — chỉ liệt kê. Đọc chi tiết tại CR Registry.

| CR ID | Title (short) | Status | Scope hint |
|---|---|---|---|
| [CR-20260622-04](../../Tracking/CHANGE-REQUESTS.md#cr-20260622-04--ins-dossier-view-grid-to-list) | GridView 2-col → 1-col vertical ListView | APPROVED (MINOR self) | AC-3 + §4.1 responsive + §5.2 widget breakdown + §11.2 a11y — primarily mobile; web parity flag follow-up |
| [CR-20260622-05](../../Tracking/CHANGE-REQUESTS.md#cr-20260622-05--ins-dossier-view-t40-pdf-viewer-mode) | T40 PDF viewer mode drift (external vs inline) | RAISED (pending BA) | BA quyết option a/b/c — giữ AC-4 `LaunchMode.externalApplication` mandate đến khi BA chốt |

---

## 8. Change Log


| Date       | Version | Author                                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-22 | 16 | Delivery Authority | Thêm section "Related CRs" — link 2 CR W02 mobile-cycle (CR-20260622-04 APPROVED + CR-20260622-05 RAISED) sang `Tracking/CHANGE-REQUESTS.md`. Không copy nội dung CR — chỉ link dẫn + scope hint. |
| 2026-06-16 | 15 | BA/PO (anhluong) | **Cập nhật layout tab "Hồ sơ bảo hiểm đã xuất" theo design mới (ảnh 2026-06-16)**: bỏ layout 2 cột (danh sách trái + preview nhúng phải) → **danh sách dọc các bộ hồ sơ, mỗi bộ là lưới thẻ file PDF xếp 2 cột**; reword AC-1/AC-2/AC-3/AC-4/AC-5/AC-7 theo grid card. Thẻ file: tên + kích thước cùng dòng + mã tham chiếu phiếu QT. **Bỏ badge "Đã xuất" + vùng embedded preview + dòng metadata "{số} trang · {KB} · Chỉ xem"** (không còn trong thiết kế). Giữ nguyên BR (versioning list dọc, read-only, tối đa 4 tài liệu, gate Bên thanh toán = Bảo hiểm). Số tài liệu/bộ trong mock (8/5) chỉ là minh hoạ — giữ ràng buộc tối đa 4. Dọn sót layout cũ: tiêu đề "Nhóm B — Preview file PDF" → "Xem file PDF"; AC-7 "Tại: cột trái" → "danh sách bộ hồ sơ". Đồng bộ Tracking/demos W02 v8. |
| 2026-06-12 | 14 | BA/PO (anhluong) | **Reconcile BR numbering → BR-EP canonical**: cross-ref tab gate cập nhật BR-INS-STL-DET-004→**007** (gộp dòng "004/007" trùng → 007). Không đổi nội dung feature. |
| 2026-06-11 | 13 | BA/PO (anhluong) | **Đồng bộ bỏ upload file scan** (chốt B-3, theo FEAT-INS-DOSSIER-CREATE v17): AC-6 + BR-INS-DOSSIER-VIEW-002 đổi "không upload thay thế" → "không thay thế"; EC-2 reword "file scan upload riêng tư" → "tài liệu hồ sơ riêng tư" (không còn file scan). |
| 2026-06-11 | 12 | BA/PO (anhluong) | **Gắn mã lỗi vào AC** (xem [`Product/error-code/ERROR-CODE-REGISTRY.md`](../error-code/ERROR-CODE-REGISTRY.md)): AC-1 empty-state "Chưa có hồ sơ nào được xuất" → `ERR-INS-010` (`EMPTY_STATE`, 🔵 Thông tin); AC-9 lỗi tải file → `ERR-INS-009` (`TOAST`, không retry). |
| 2026-06-10 | 11      | BA/PO (anhluong)                         | **Đánh dấu là CR mở rộng feature production**: thêm frontmatter `modifies: FEAT-STL-DETAIL` + `related: FEAT-INS-STL-DETAIL` + `change_type`; thêm rows Metadata (Loại thay đổi / Màn hình target / Tích hợp qua); thêm **§0 Bối cảnh thay đổi** chỉ thị DEV agent đọc FEAT-STL-DETAIL trước, extend bộ tab màn chi tiết phiếu QT đã có (tab "Hồ sơ BH đã xuất" = tab thứ 3, không dựng màn mới). Giữ `artifact_kind=feature`. |
| 2026-06-10 | 10      | BA/PO (anhluong)                         | **Xoá xử lý trạng thái phiếu CANCEL** — **giao diện người dùng KHÔNG có trạng thái phiếu quyết toán Draft & Cancel**: gỡ **AC-10** (phiếu QT BH đã CANCEL → banner "đã huỷ") + **BR-INS-DOSSIER-VIEW-006** (phiếu CANCEL không xoá hồ sơ, vẫn xem). Đồng bộ BR-EP v21 (xoá VLD-INS-DOSSIER-004).                                                                                                                                                                                                                                                                                       |
| 2026-06-10 | 9       | BA/PO (anhluong)                         | **Bổ sung gate tab theo Bên thanh toán**: AC-1 + BR-INS-DOSSIER-VIEW-008 — tab "Hồ sơ bảo hiểm đã xuất" chỉ hiển thị khi Bên thanh toán phiếu QT = Bảo hiểm, ẩn với phiếu QT Khách hàng (về 3 tab baseline); gate **chỉ theo Bên thanh toán**, không theo trạng thái (giao diện không có DRAFT). Đồng bộ FEAT-INS-STL-DETAIL v9, BR-EP v20.                                                                                                                                                                                                                                                                  |
| 2026-06-04 | 8       | Business Authority                       | §3 UI/UX Reference: chuẩn hoá**Figma Mobile (App) design link** sang query `&m=dev` (dev-mode chuẩn, đồng bộ format link web), node-id `319-43731` giữ nguyên. Registry `figma-links.yaml` (mobile, wave02) sync theo.                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-06-04 | 7       | Business Authority                       | §3 UI/UX Reference: cập nhật**Figma Web design link** sang file mới `GMS-v.3` (file_key `EMGjGsnAJzGoGwTSK7dTuZ`, node `13257-480151`), thay link cũ `GMS-V3---New-Design` node `1113-21146`. Registry `figma-links.yaml` (web) sync theo; spec figma-web (wave02) cần re-prefetch (`/prefetch-figma web 02`) khi gen vì design source đổi file. (CR-1780555878)                                                                                                                                                                                                                                                         |
| 2026-06-02 | 6       | PO (cuongnguyen_ac) + Business Authority | **Resolve 5 NEED CONFIRMATION (PO sign-off)**: (1) **AC-9** — file load fail: re-generate từ snapshot (khả thi vì chỉ 1 template); (2) **BR-005** — không cho xoá bộ hồ sơ, audit giữ vĩnh viễn (không retention policy); (3) **EC-1** — 5+ bộ hồ sơ: list dọc cuộn xuống (không paginate/collapse); (4) **EC-2** — chưa cần role-based access ngoài 2 persona; (5) **EC-4** — chỉ dùng 1 template → không cần lưu template version. Gỡ "HTML mockup: TBD" (design-source = Figma). *Còn mở: boundary `gf-accounting` vs `gf-insurance` = Architect concern (epic §10.2), không block PO.* |
| 2026-06-02 | 5       | Business Authority                       | §3 UI/UX Reference: thêm**Figma Mobile design link** (App GMS v3 — New Design, node `319-43731`) cho mobile app, bổ sung bên cạnh link web hiện có (DESIGN-SOURCE-POLICY §2.1, figma mode).                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-06-02 | 4       | Business Authority                       | §3 UI/UX Reference: thêm**Figma Web design link** (GMS V3 — New Design, node `1113-21146`) theo schema DESIGN-SOURCE-POLICY §2.1 (figma mode); gỡ dòng tham chiếu "Production design reference (screenshot 2026-05-27)" (design-source thay bằng Figma) + blockquote screenshot dưới §2.                                                                                                                                                                                                                                                                                                                               |
| 2026-05-27 | 1       | Business Authority                       | Khởi tạo FEAT từ PRD v5 §EP-INSURANCE-SETTLEMENT phạm vi §3 cuối + quyết định chốt v4 (versioning khi BH yêu cầu sửa = tạo bản mới, không unlock bản cũ). Read-only mode cho tất cả version đã xuất. Tải PDF lấy file storage gốc, không re-generate. Audit trail giữ tất cả version.                                                                                                                                                                                                                                                                                                             |
| 2026-05-27 | 3       | Business Authority                       | Resolve NEED CONFIRMATION: (1)**tối đa 4 tài liệu** (không có file thứ 5/gộp); (2) nhiều bộ hồ sơ hiển thị **list dọc chia theo từng lần xuất**; (3) export theo **tài liệu tích chọn** (checkbox). Cập nhật AC-2/AC-3/AC-7 + BR-004/007.                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-05-27 | 2       | Business Authority                       | **Rewrite §2 theo production design screenshot** (tab "Hồ sơ bảo hiểm đã xuất"): layout 2 cột — trái khối "Bộ hồ sơ #SET" (Xuất ngày + N tài liệu PDF) + **danh sách file PDF riêng từng tài liệu** (tên/kích thước/#SET/badge "Đã xuất"); phải preview file ("{số} trang · {KB} · Chỉ xem" + "Xem PDF"). **Phát hiện: export sinh PDF riêng mỗi tài liệu (không phải 1 PDF gộp)** → thêm BR-INS-DOSSIER-VIEW-007 + flag cần đồng bộ FEAT-INS-DOSSIER-CREATE AC-9. Cập nhật §1/§3/§4/§5/§6. NEED CONFIRMATION: số file (5 vs 4), hiển thị nhiều bộ versioning.     |
