---
type: reference
artifact_kind: error-code-registry
status: ACTIVE
version: 25
tier: T3
owner_authority: Business Authority + Architect
boundary: "cross-cutting (gf-sales, gf-accounting, gf-inventory, agg-garage-graph, garage-web, gf-system, garage-mobile)"
last_reviewed: "2026-08-11"
supersedes: null
---

# ERROR-CODE-REGISTRY — Sổ đăng ký mã lỗi & thông báo (GMS v3)

> **Mục đích**: Nguồn duy nhất (single source of truth) cho **mã lỗi dùng chung BE ↔ FE**.
> Backend trả về `errorCode`; Frontend tra cứu registry này để render đúng **nội dung thông báo + loại thông báo + hình thức hiển thị**.
> Tránh hardcode chuỗi lệch giữa các màn — message tái sử dụng được khai báo nhóm **Common (`ERR-CMN-*`)**.

---

## 1. Quy ước

### 1.1 Cấu trúc mã

```
ERR-{NHÓM}-{NNN}
       │      └── số thứ tự 3 chữ số, tăng dần, KHÔNG tái sử dụng khi xoá (chỉ deprecate)
       └── CMN = Common (dùng chung mọi màn) · INS = Insurance-Settlement (riêng domain) · INV = Inventory V2 (riêng domain kho V2) · DPL = Driver Plus Link (riêng domain EP-PARTNER-LINK) · BOOK = Booking Driver+ (riêng domain EP-BOOKING, tích hợp Driver+)
```

- **BE**: ném/đáp `errorCode` (string) + (tuỳ chọn) `params` cho phần động.
- **FE**: KHÔNG tự đặt text — map `errorCode → message + severity + display` từ registry này (build thành i18n/constants dùng chung).
- **Hợp đồng BE/FE**: mã lỗi là contract — đổi text KHÔNG đổi mã; đổi semantics → cấp **mã mới**, deprecate mã cũ.

### 1.2 Loại thông báo (severity)

| Ký hiệu      | severity (code) | Ý nghĩa                              | Màu  |
| ------------ | --------------- | ------------------------------------ | ---- |
| 🔴 Lỗi       | `ERROR`         | Vi phạm chặn thao tác / lỗi hệ thống | Đỏ   |
| 🟡 Cảnh báo  | `WARNING`       | Bất thường nhưng **vẫn cho lưu**     | Vàng |
| 🔵 Thông tin | `INFO`          | Trạng thái rỗng / chỉ dẫn            | Xám  |

### 1.3 Common vs Riêng

- **Common (`ERR-CMN-*`)** — message generic, **tái sử dụng** cho màn hình khác sau này. Không nhúng từ ngữ đặc thù domain.
- **Riêng (`ERR-INS-*`)** — message gắn nghiệp vụ insurance-settlement; chỉ dùng trong domain này.

### 1.4 Hình thức hiển thị (display) — **dev agent đọc bảng này để biết render kiểu gì**

| `display`           | Mô tả render                                                                                                                                    | Vị trí                  | Block thao tác?                 | Tự đóng (auto-dismiss)                                                                    | Khi nào dùng                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `INLINE_FIELD`      | Text lỗi đỏ ngay dưới ô nhập + viền đỏ + highlight trường                                                                                       | Dưới input              | ✅ Có (chặn submit)             | ❌ Không — tự xoá khi sửa hợp lệ                                                          | Validation field-level (số tiền, %, dropdown bắt buộc, file format)                            |
| `INLINE_FORM`       | Banner/vùng lỗi trong form hoặc modal + highlight phần liên quan (vd thẻ tài liệu thiếu)                                                        | Đầu form / trong modal  | ✅ Có                           | ❌ Không                                                                                  | Validation gom nhiều phần khi bấm submit/xuất                                                  |
| `INLINE_WARNING`    | Dải cảnh báo vàng cạnh khối liên quan + highlight, **không chặn** lưu                                                                           | Cạnh khối tổng / trường | ❌ Không (vẫn cho lưu)          | ❌ Không                                                                                  | Cảnh báo nghiệp vụ (vd BH thanh toán âm)                                                       |
| `TOAST`             | Toast nổi (snackbar) góc trên-phải                                                                                                              | Overlay góc trên-phải   | ❌ Không chặn form              | ✅ Có (~4–5s); lỗi hệ thống có thể kèm nút **Thử lại** (không auto-dismiss khi có action) | Lỗi hệ thống / kết quả thao tác async thất bại                                                 |
| `DIALOG`            | Modal chặn, cần user bấm xác nhận / điều hướng (thường kèm link)                                                                                | Giữa màn, có overlay    | ✅ Có (chặn tới khi user xử lý) | ❌ Không                                                                                  | Guard nghiệp vụ cần quyết định/điều hướng (chưa chọn DN BH, đã tồn tại phiếu, conflict reload) |
| `EMPTY_STATE`       | Placeholder (icon + text) giữa vùng nội dung khi danh sách rỗng — **không phải lỗi**                                                            | Giữa vùng danh sách     | —                               | —                                                                                         | Tab/list không có dữ liệu                                                                      |
| `EXTERNAL_RESPONSE` | **KHÔNG render trên GMS UI** — kết quả nghiệp vụ gửi cho hệ thống ngoài gọi vào; có thể qua API response hoặc sự kiện phản hồi tùy Architecture | —                       | —                               | —                                                                                         | Kết quả từ chối gửi external partner (VD Driver Plus) khi GMS không xử lý request              |

> Với `EXTERNAL_RESPONSE`, giá trị HTTP có dấu `*` chỉ là status tương ứng **nếu** Architecture chọn kênh HTTP; đây không phải yêu cầu Product bắt buộc dùng HTTP.

---

## 2. Registry — Common (`ERR-CMN-*`)

| Mã            | Loại     | Hiển thị       | Category   | Message (VI)                                               | Action kèm   | HTTP | Rule ref        | Dùng tại (FEAT)                                        |
| ------------- | -------- | -------------- | ---------- | ---------------------------------------------------------- | ------------ | ---- | --------------- | ------------------------------------------------------ |
| `ERR-CMN-001` | 🔴 ERROR | `INLINE_FIELD` | Validation | Số tiền vượt quá số lượng cho phép                         | —            | 400  | VLD-INS-SO-004  | FEAT-INS-SO-ADJUSTMENT, _(tái sử dụng)_                |
| `ERR-CMN-002` | 🔴 ERROR | `INLINE_FIELD` | Validation | Chiết khấu không thể lớn hơn 100%                          | —            | 400  | VLD-INS-SO-003  | FEAT-INS-SO-ADJUSTMENT, _(tái sử dụng)_                |
| `ERR-CMN-003` | 🔴 ERROR | `INLINE_FIELD` | Validation | Khấu hao không thể lớn hơn 100%                            | —            | 400  | VLD-INS-SO-003  | FEAT-INS-SO-ADJUSTMENT, _(tái sử dụng)_                |
| `ERR-CMN-004` | 🔴 ERROR | `INLINE_FIELD` | File       | File quá lớn (tối đa 10MB)                                 | —            | 413  | —               | _(toàn platform — upload file)_                        |
| `ERR-CMN-005` | 🔴 ERROR | `INLINE_FIELD` | File       | Định dạng không hỗ trợ — chỉ chấp nhận PDF, JPG, PNG       | —            | 415  | —               | _(toàn platform — upload file)_                        |
| `ERR-CMN-006` | 🔴 ERROR | `TOAST`        | System     | Không tải lên được file — vui lòng thử lại                 | Nút: Thử lại | 502  | —               | _(toàn platform — upload file)_                        |
| `ERR-CMN-007` | 🔴 ERROR | `TOAST`        | System     | Hệ thống đang bận, vui lòng thử lại sau                    | —            | 503  | —               | _(toàn platform)_                                      |
| `ERR-CMN-008` | 🔴 ERROR | `DIALOG`       | System     | Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại | Nút: Tải lại | 409  | —               | FEAT-INS-STL-DETAIL, _(tái sử dụng — optimistic lock)_ |
| `ERR-CMN-009` | 🔴 ERROR | `TOAST`        | Business   | Phiếu dịch vụ chưa hoàn thành                              | —            | 409  | VLD-INS-STL-004 | FEAT-INS-STL-DETAIL, _(tái sử dụng — SO/settlement)_   |

## 3. Registry — Riêng Insurance-Settlement (`ERR-INS-*`)

| Mã            | Loại       | Hiển thị         | Category    | Message (VI)                                                                              | Action kèm                      | HTTP | Rule ref            | Dùng tại (FEAT)                             |
| ------------- | ---------- | ---------------- | ----------- | ----------------------------------------------------------------------------------------- | ------------------------------- | ---- | ------------------- | ------------------------------------------- |
| `ERR-INS-001` | 🔴 ERROR   | `INLINE_FIELD`   | Validation  | Vui lòng chọn công ty bảo hiểm                                                            | —                               | 400  | VLD-INS-SO-002      | FEAT-INS-SO-ADJUSTMENT                      |
| `ERR-INS-002` | 🔴 ERROR   | `DIALOG`         | Business    | Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm | Link: Quay về Phiếu dịch vụ     | 409  | VLD-INS-STL-002     | FEAT-INS-STL-DETAIL, FEAT-INS-SO-ADJUSTMENT |
| `ERR-INS-003` | 🟡 WARNING | `INLINE_WARNING` | Business    | Bảo hiểm thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh                      | Highlight các trường điều chỉnh | 200  | VLD-INS-SO-005      | FEAT-INS-SO-ADJUSTMENT                      |
| `ERR-INS-004` | 🔴 ERROR   | `TOAST`          | Business    | Phiếu dịch vụ không có hạng mục thuộc bảo hiểm                                            | —                               | 409  | VLD-INS-STL-001     | FEAT-INS-STL-DETAIL                         |
| `ERR-INS-005` | 🔴 ERROR   | `DIALOG`         | Business    | Đã tồn tại phiếu quyết toán bảo hiểm cho phiếu dịch vụ này                                | Link: Xem phiếu hiện có         | 409  | VLD-INS-STL-003     | FEAT-INS-STL-DETAIL                         |
| `ERR-INS-007` | 🔴 ERROR   | `INLINE_FORM`    | Validation  | Vui lòng hoàn tất các tài liệu còn thiếu                                                  | Highlight thẻ tài liệu thiếu    | 400  | VLD-INS-DOSSIER-003 | FEAT-INS-DOSSIER-CREATE                     |
| `ERR-INS-008` | 🔴 ERROR   | `TOAST`          | System      | Không tạo được PDF hồ sơ — vui lòng thử lại                                               | Nút: Thử lại                    | 500  | —                   | FEAT-INS-DOSSIER-CREATE                     |
| `ERR-INS-009` | 🔴 ERROR   | `TOAST`          | System      | Không tải được hồ sơ — vui lòng liên hệ quản trị                                          | — (không retry)                 | 500  | —                   | FEAT-INS-DOSSIER-VIEW                       |
| `ERR-INS-010` | 🔵 INFO    | `EMPTY_STATE`    | Empty-state | Chưa có hồ sơ nào được xuất                                                               | —                               | —    | —                   | FEAT-INS-DOSSIER-VIEW                       |

> **Lưu ý gỡ bỏ**: thông báo cũ _"Vui lòng chọn nguồn thanh toán cho tất cả các dòng"_ **không cấp mã** — mặc định Nguồn thanh toán = Khách hàng nên không xảy ra trường hợp rỗng (chốt 2026-06-11).

## 4. Registry — Inventory V2 (`ERR-INV-*`)

> **[DRAFT/PROPOSED — Inventory V2, chưa cutover]**
>
> 40 mã lỗi domain kho V2 — đồng bộ từ mã **bare UPPERCASE_SNAKE** khai trong các BR `BR-GF-INVENTORY-*` (Catalog, Accounting-Period, Opening-Balance, Receipt-V2, Delivery-V2). Mã `ERR-INV-NNN` ánh xạ 1-1 với mã bare tương ứng (cột "Rule ref" = BR ID nguồn). Chưa cutover sang các epic kho V2 — giữ ở trạng thái đề xuất tới khi Architect chốt khi spawn dev.

| Mã            | Loại       | Hiển thị         | Category   | Message (VI)                                                                               | Action kèm                     | HTTP | Rule ref                                                                                                   | Dùng tại (FEAT)                                                                                                                                      |
| ------------- | ---------- | ---------------- | ---------- | ------------------------------------------------------------------------------------------ | ------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ERR-INV-001` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mã nhóm vật tư hàng hóa không hợp lệ — không được chứa ký tự đặc biệt                      | Highlight ô Mã nhóm            | 400  | BR-CAT-GRP-002                                                                                             | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-CREATE/EDIT)                                                                                                      |
| `ERR-INV-002` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mã nhóm vật tư hàng hóa đã tồn tại                                                         | Highlight ô Mã nhóm            | 400  | BR-CAT-GRP-003                                                                                             | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-CREATE)                                                                                                           |
| `ERR-INV-003` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Không thể chuyển nhóm vào chính nó hoặc nhóm con của nó (tránh vòng lặp phân cấp)          | Highlight ô Thuộc nhóm         | 400  | BR-CAT-GRP-009                                                                                             | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-EDIT)                                                                                                             |
| `ERR-INV-004` | 🔴 ERROR   | `DIALOG`         | Business   | Không thể xóa — nhóm đã phát sinh mã sản phẩm nội bộ                                       | —                              | 400  | BR-CAT-GRP-010                                                                                             | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-DELETE)                                                                                                           |
| `ERR-INV-005` | 🔴 ERROR   | `DIALOG`         | Business   | Không thể xóa — nhóm cha còn nhóm con, phải xóa hết nhóm con trước                         | —                              | 400  | BR-CAT-GRP-011                                                                                             | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-DELETE)                                                                                                           |
| `ERR-INV-006` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mã sản phẩm nội bộ không hợp lệ — không được chứa ký tự đặc biệt                           | Highlight ô Mã nội bộ          | 400  | BR-CAT-PROD-002                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE)                                                                                                          |
| `ERR-INV-007` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mã sản phẩm nội bộ đã tồn tại                                                              | Highlight ô Mã nội bộ          | 400  | BR-CAT-PROD-003                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-IMPORT)                                                                                    |
| `ERR-INV-008` | 🔴 ERROR   | `DIALOG`         | Business   | Không thể xóa — mã sản phẩm đã phát sinh dữ liệu sử dụng (phiếu nhập/xuất hoặc tồn kho)    | —                              | 400  | BR-CAT-PROD-016                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-DELETE)                                                                                                          |
| `ERR-INV-009` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Mã sản phẩm nội bộ không tồn tại trong garage                                              | Highlight dòng lỗi             | 400  | BR-OB-006                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-010` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Mã sản phẩm nội bộ đang ở trạng thái "Ngừng hoạt động"                                     | Highlight dòng lỗi             | 400  | BR-OB-007                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-011` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Phải có mã sản phẩm nội bộ ở mọi dòng trước khi ghi sổ kho                                 | Highlight dòng thiếu mã        | 400  | BR-IRV2-028 / BR-IDV2-028                                                                                  | EP-INVENTORY-RECEIPT-V2 / EP-INVENTORY-DELIVERY-V2 (FEAT-IR/ID-DETAIL-V2)                                                                            |
| `ERR-INV-012` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Tính chất sản phẩm không hợp lệ — chỉ chọn từ danh sách cố định                            | Highlight ô Tính chất          | 400  | BR-CAT-PROD-019                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/IMPORT)                                                                                              |
| `ERR-INV-013` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Tỷ lệ quy đổi phải lớn hơn 0                                                               | Highlight dòng ĐVT quy đổi     | 400  | BR-CAT-PROD-011                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/DETAIL)                                                                                              |
| `ERR-INV-014` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | ĐVT quy đổi bị trùng trong cùng mã sản phẩm                                                | Highlight dòng ĐVT quy đổi     | 400  | BR-CAT-PROD-011                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/DETAIL)                                                                                              |
| `ERR-INV-015` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mã SKU đã được gắn cho một mã sản phẩm nội bộ khác                                         | Highlight ô chọn SKU           | 400  | BR-CAT-PROD-013                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-DETAIL)                                                                                                          |
| `ERR-INV-016` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mô tả vượt quá 255 ký tự                                                                   | Highlight ô Mô tả              | 400  | BR-CAT-GRP-012                                                                                             | EP-INVENTORY-CATALOG (FEAT-CAT-GRP-CREATE/EDIT)                                                                                                      |
| `ERR-INV-017` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Thiếu trường bắt buộc                                                                      | Highlight dòng/trường thiếu    | 400  | BR-OB-011                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-018` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Sai định dạng ngày ("Tồn đến ngày")                                                        | Highlight dòng lỗi             | 400  | BR-OB-011                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-019` | 🔴 ERROR   | `INLINE_FORM`    | Validation | ĐVT trong file không khớp ĐVT chính của mã sản phẩm                                        | Highlight dòng lỗi             | 400  | BR-OB-010                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-020` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Kho không tồn tại trong danh mục kho của garage                                            | Highlight dòng lỗi             | 400  | BR-OB-005                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-021` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu                                          | Highlight ô Ngày               | 400  | BR-AP-006                                                                                                  | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-CREATE)                                                                                                      |
| `ERR-INV-022` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Khoảng ngày của kỳ con phải nằm trong khoảng ngày của kỳ cha                               | Highlight ô Ngày               | 400  | BR-AP-007                                                                                                  | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-CREATE)                                                                                                      |
| `ERR-INV-023` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Khoảng ngày bị chồng lấn với kỳ cùng cấp trong cùng kỳ cha                                 | Highlight ô Ngày               | 400  | BR-AP-008                                                                                                  | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-CREATE)                                                                                                      |
| `ERR-INV-024` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Kỳ kế toán đã đóng — không thể thêm/sửa/xóa/ghi sổ chứng từ thuộc kỳ này                   | —                              | 400  | BR-AP-012 / BR-OB-013 / BR-OB-DEL-002 / BR-IRV2-007 / BR-IDV2-007                                          | EP-INVENTORY-RECEIPT-V2 / DELIVERY-V2 / OPENING-BALANCE / ACCOUNTING-PERIOD                                                                          |
| `ERR-INV-025` | 🔴 ERROR   | `DIALOG`         | Business   | Không thể xóa kỳ kế toán — kỳ đã đóng hoặc đã phát sinh dữ liệu kho liên quan              | —                              | 400  | BR-AP-013                                                                                                  | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-DELETE)                                                                                                      |
| `ERR-INV-026` | 🔴 ERROR   | `DIALOG`         | Business   | Không thể xóa — kỳ cha còn kỳ con, phải xóa hết kỳ con trước                               | —                              | 400  | BR-AP-014                                                                                                  | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-AP-DELETE)                                                                                                      |
| `ERR-INV-027` | 🔴 ERROR   | `TOAST`          | System     | Tính giá xuất kho thất bại — vui lòng thử lại                                              | Nút: Thử lại                   | 400  | BR-PRC-007 _(deprecated — thay bằng ERR-INV-030/031)_                                                      | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/RECALC)                                                                                              |
| `ERR-INV-028` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Kỳ trước chưa được tính giá                                                                | —                              | 400  | BR-PRC-006 _(deprecated — đã bỏ chặn tuần tự)_                                                             | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE)                                                                                                     |
| `ERR-INV-029` | 🔴 ERROR   | `DIALOG`         | Business   | Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất                         | —                              | 400  | BR-PRC-016 / BR-PRC-011                                                                                    | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE, FEAT-PRC-RECALC, FEAT-PRC-DELETE)                                                                   |
| `ERR-INV-030` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Tồn kho âm — mã không thể chạy giá do xuất vượt tồn                                        | Highlight mã lỗi               | 400  | BR-PRC-007                                                                                                 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/DETAIL/RECALC)                                                                                       |
| `ERR-INV-031` | 🟡 WARNING | `INLINE_WARNING` | Business   | Lệch hạch toán — mã không thể chạy giá [MỞ RỘNG TƯƠNG LAI]                                 | Highlight mã lỗi               | 400  | BR-PRC-007                                                                                                 | EP-INVENTORY-ACCOUNTING-PERIOD (FEAT-PRC-CREATE/DETAIL)                                                                                              |
| `ERR-INV-032` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Số lượng tồn phải lớn hơn 0                                                                | Highlight dòng lỗi             | 400  | BR-OB-008                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-033` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Giá trị tồn không được nhỏ hơn 0                                                           | Highlight dòng lỗi             | 400  | BR-OB-009                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-034` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Tồn đầu kỳ đã tồn tại cho (mã + kho) này — mỗi (mã + kho) chỉ có một tồn đầu kỳ            | Highlight dòng trùng           | 400  | BR-OB-012                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-035` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Tồn đầu kỳ phải là điểm khởi đầu — "Tồn đến ngày" phải trước ngày phiếu đã ghi sổ sớm nhất | Highlight dòng lỗi             | 400  | BR-OB-016                                                                                                  | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-036` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Không cho phép tồn âm — thao tác làm tồn kho xuống dưới 0 tại một thời điểm                | Highlight dòng/phiếu lỗi       | 400  | BR-IRV2-008 / BR-IDV2-004 / BR-OB-015 / BR-OB-DEL-003                                                      | EP-INVENTORY-RECEIPT-V2 / DELIVERY-V2 / OPENING-BALANCE                                                                                              |
| `ERR-INV-037` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Không đủ tồn để xuất                                                                       | Highlight dòng vượt tồn        | 400  | BR-IDV2-004                                                                                                | EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/DETAIL-V2/EDIT-V2/DELETE)                                                                                |
| `ERR-INV-038` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Phiếu nhập có ngày chứng từ trước/cùng "Tồn đến ngày" của tồn đầu kỳ — không hợp lệ        | Highlight ô Ngày chứng từ      | 400  | BR-IRV2-030                                                                                                | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2/EDIT-V2)                                                                                                  |
| `ERR-INV-039` | 🟡 WARNING | `INLINE_WARNING` | Business   | Lệch số lượng/sản phẩm so với phiếu dịch vụ (SO) — kiểm tra lại (vẫn cho ghi sổ)           | Highlight dòng lệch            | 400  | BR-IDV2-009                                                                                                | EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/DETAIL-V2)                                                                                               |
| `ERR-INV-040` | 🔴 ERROR   | `INLINE_FORM`    | Business   | Số lượng trả vượt quá số lượng của phiếu gốc (đã xuất / đã nhập) — không hợp lệ            | Highlight ô Số lượng           | 400  | BR-IRV2-032 / BR-IDV2-031                                                                                  | EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2/EDIT-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2/EDIT-V2)                                           |
| `ERR-INV-041` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần                     | Thông báo banner: tách file    | 400  | BR-CAT-PROD-020                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT)                                                                                                          |
| `ERR-INV-042` | 🔴 ERROR   | `INLINE_FORM`    | Validation | ĐVT trong file không khớp danh mục đơn vị tính                                             | Highlight dòng lỗi             | 400  | BR-CAT-PROD-021                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT)                                                                                                          |
| `ERR-INV-043` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Nhóm vật tư/hàng hóa trong file không tồn tại hoặc đang ngừng hoạt động                    | Highlight dòng lỗi             | 400  | BR-CAT-PROD-022                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT)                                                                                                          |
| `ERR-INV-044` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Xuất xứ trong file không khớp danh mục xuất xứ                                             | Highlight dòng lỗi             | 400  | BR-CAT-PROD-023                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-IMPORT)                                                                                                          |
| `ERR-INV-045` | 🔴 ERROR   | `DIALOG`         | Validation | Kết quả vượt 1.000 mục — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại           | Dialog cảnh báo + gợi ý áp lọc | 400  | BR-CAT-PROD-024 / BR-IRV2-020 / BR-IDV2-020                                                                | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-EXPORT) · EP-INVENTORY-RECEIPT-V2 (FEAT-IR-EXPORT) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-EXPORT)                   |
| `ERR-INV-046` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Mô tả / Ghi chú vượt quá 500 ký tự                                                         | Highlight ô Mô tả / Ghi chú    | 400  | BR-CAT-PROD-025                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT)                                                                                      |
| `ERR-INV-047` | 🔴 ERROR   | `INLINE_FIELD`   | Validation | Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy                                      | Highlight dòng ĐVT quy đổi     | 400  | BR-CAT-PROD-011                                                                                            | EP-INVENTORY-CATALOG (FEAT-CAT-PROD-CREATE/EDIT/DETAIL) · EP-INVENTORY-RECEIPT-V2 (FEAT-IR-CREATE-V2) · EP-INVENTORY-DELIVERY-V2 (FEAT-ID-CREATE-V2) |
| `ERR-INV-048` | 🔴 ERROR   | `INLINE_FORM`    | Validation | Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần          | Thông báo banner: tách file    | 400  | BR-OB-004b                                                                                                 | EP-INVENTORY-OPENING-BALANCE (FEAT-OB-IMPORT)                                                                                                        |
| `ERR-INV-050` | 🔴 ERROR   | `DIALOG`         | Business   | V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2                  | Dialog + redirect V2           | 410  | EP-INVENTORY-RECEIPT-V2 §5.2 / EP-INVENTORY-DELIVERY-V2 §5.2 / EP-INVENTORY-STOCK-V2 §5.2 (V1 Module Hide) | EP-INVENTORY-RECEIPT-V2 / EP-INVENTORY-DELIVERY-V2 / EP-INVENTORY-STOCK-V2 (V1 controllers `@FeatureOff("Inventory:InventoryV2")`)                   |

---

## 5. Registry — Riêng Driver Plus Link (`ERR-DPL-*`)

> Domain `EP-PARTNER-LINK` (giai đoạn 1: Driver Plus), feature `FEAT-SYS-DRIVERPLUS-LINK` (Web + Mobile). Ánh xạ 1-1 từ mã bare `VLD-DPL-NNN` khai trong `BR-GF-SYSTEM.md §5.5` + 2 message toast/banner bổ sung không có VLD-ID riêng + 2 empty state (BA-review F7, 2026-07-30).

| Mã                                        | Loại     | Hiển thị       | Category   | Message (VI)                                                                                                                    | Action kèm                                           | HTTP | Rule ref                                      | Dùng tại (FEAT)                                                                                                   |
| ----------------------------------------- | -------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ERR-DPL-001`                             | 🔴 ERROR | `INLINE_FIELD` | Validation | Vui lòng nhập lý do từ chối.                                                                                                    | Button "Xác nhận từ chối" disabled                   | 400  | VLD-DPL-001                                   | FEAT-SYS-DRIVERPLUS-LINK — Từ chối (AC-18)                                                                        |
| `ERR-DPL-002`                             | 🔴 ERROR | `INLINE_FIELD` | Validation | Vui lòng nhập lý do hủy liên kết.                                                                                               | Button "Xác nhận hủy liên kết" disabled              | 400  | VLD-DPL-002                                   | FEAT-SYS-DRIVERPLUS-LINK — Hủy liên kết (AC-23)                                                                   |
| `ERR-DPL-003`                             | 🔴 ERROR | `INLINE_FIELD` | Validation | Vui lòng cuộn xuống cuối để tiếp tục.                                                                                           | Checkbox điều khoản + nút "Đồng ý liên kết" disabled | 400  | VLD-DPL-003                                   | FEAT-SYS-DRIVERPLUS-LINK — Duyệt (AC-13, AC-14)                                                                   |
| `ERR-DPL-004`                             | 🔴 ERROR | `TOAST`        | System     | Yêu cầu liên kết này đã được xử lý bởi người dùng khác. Vui lòng làm mới trang.                                                 | —                                                    | 409  | VLD-DPL-004                                   | FEAT-SYS-DRIVERPLUS-LINK — cả 4 action (AC-27)                                                                    |
| `ERR-DPL-005`                             | 🔴 ERROR | `TOAST`        | System     | Không thể xử lý yêu cầu. Vui lòng thử lại sau.                                                                                  | —                                                    | 503  | VLD-DPL-005                                   | FEAT-SYS-DRIVERPLUS-LINK — cả 4 action (AC-29)                                                                    |
| `ERR-DPL-006`                             | 🔴 ERROR | `TOAST`        | Business   | Đã có tài khoản Driver Plus khác vừa được liên kết. Yêu cầu của bạn tự động chuyển "Từ chối".                                   | —                                                    | 409  | BR-DPL-CMN-002                                | FEAT-SYS-DRIVERPLUS-LINK — Duyệt, race 2 user (AC-31)                                                             |
| `ERR-DPL-007`                             | 🔴 ERROR | `INLINE_FORM`  | System     | Không tải được danh sách yêu cầu liên kết. Vui lòng thử lại.                                                                    | Nút: Tải lại                                         | 503  | —                                             | FEAT-SYS-DRIVERPLUS-LINK — load danh sách thất bại (UX-FLOW §4)                                                   |
| `ERR-DPL-008`                             | 🔵 INFO  | `EMPTY_STATE`  | Empty      | Chưa có yêu cầu liên kết nào từ Driver Plus.                                                                                    | —                                                    | —    | —                                             | FEAT-SYS-DRIVERPLUS-LINK — chưa từng có yêu cầu (AC-7)                                                            |
| `ERR-DPL-009`                             | 🔵 INFO  | `EMPTY_STATE`  | Empty      | Không có yêu cầu nào khớp bộ lọc.                                                                                               | —                                                    | —    | —                                             | FEAT-SYS-DRIVERPLUS-LINK — filter loại bỏ hết (EC-1)                                                              |
| `ERR-DPL-010` (mới, BA-review round 2 N2) | 🔴 ERROR | `EXTERNAL_RESPONSE` | Business   | Garage đã liên kết với một tài khoản Driver Plus khác. Không thể gửi yêu cầu liên kết mới cho đến khi liên kết hiện tại bị hủy. | —                                                    | 409  | BR-DPL-CMN-007                                | FEAT-SYS-DRIVERPLUS-LINK — response cho Driver Plus khi bị chặn tại adapter gate (AC-34, KHÔNG render GMS UI)     |
| `ERR-DPL-011`                             | 🔴 ERROR | `EXTERNAL_RESPONSE` | System     | Chức năng liên kết Driver Plus đang tạm ngừng. Vui lòng thử lại sau.                                                            | Thử lại sau khi kill-switch được bật                 | 503  | BR-DPL-CMN-008                                | FEAT-SYS-DRIVERPLUS-LINK — response cho Driver Plus khi `PartnerLink:DriverPlus=off` (AC-43, KHÔNG render GMS UI) |
| `ERR-DPL-012`                             | 🔴 ERROR | `INLINE_FIELD` | Validation | Lý do không được vượt quá 2.000 ký tự.                                                                                          | Disable nút xác nhận đến khi hợp lệ                  | 400  | VLD-DPL-006 · BR-DPL-REJ-002 · BR-DPL-CAN-002 | FEAT-SYS-DRIVERPLUS-LINK — Từ chối/Hủy trên Web + Mobile (AC-18/AC-23)                                            |
| `ERR-DPL-013` (mới, ADR-029 v2, gap G3)    | 🔴 ERROR | `EXTERNAL_RESPONSE` | Business   | Không tìm thấy garage nào đăng ký số điện thoại này trong hệ thống GMS. Vui lòng kiểm tra lại số điện thoại.                    | —                                                    | 404  | ADR-029 v2 (amendment)                        | FEAT-SYS-DRIVERPLUS-LINK — response cho Driver Plus khi resolve tenant từ SĐT thất bại tại `PARTNER_LINK.REQUEST.CREATE` (KHÔNG render GMS UI) |

---

## 6. Registry — Riêng Booking Driver+ (`ERR-BOOK-*`)

> Domain `EP-BOOKING`, tích hợp Driver+ (`FEAT-BOOK-DRIVERPLUS-INBOUND` + `FEAT-BOOK-DRIVERPLUS-OUTBOUND`). Kết quả từ chối được gửi **cho Driver+** và không render trên GMS UI. Product không quy định kết quả đi qua API response hay sự kiện phản hồi; Architecture quyết định kênh truyền. Dấu `*` ở cột HTTP là HTTP status tương ứng nếu kênh được chọn là HTTP, không phải yêu cầu bắt buộc dùng HTTP.

| Mã             | Loại     | Hiển thị            | Category   | Message (VI)                                                                                | Action kèm | HTTP  | Rule ref                                 | Dùng tại (FEAT)                                                                                                             |
| -------------- | -------- | ------------------- | ---------- | ------------------------------------------------------------------------------------------- | ---------- | ----- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ERR-BOOK-001` | 🔴 ERROR | `EXTERNAL_RESPONSE` | Validation | Yêu cầu đặt lịch không hợp lệ — thiếu trường bắt buộc hoặc giờ hẹn không đúng bước 15 phút. | —          | 400\* | FEAT-BOOK-DRIVERPLUS-INBOUND AC-2 / EC-3 | FEAT-BOOK-DRIVERPLUS-OUTBOUND — kết quả từ chối gửi Driver+ khi request không hợp lệ (AC-10, KHÔNG render GMS UI)           |
| `ERR-BOOK-002` | 🔴 ERROR | `EXTERNAL_RESPONSE` | Business   | Không tìm thấy lịch hẹn tương ứng với yêu cầu hủy.                                          | —          | 404\* | FEAT-BOOK-DRIVERPLUS-INBOUND AC-8        | FEAT-BOOK-DRIVERPLUS-OUTBOUND — kết quả từ chối gửi Driver+ khi yêu cầu hủy không khớp booking (AC-11, KHÔNG render GMS UI) |

---

## 7. Tổng hợp

| Nhóm                                          | Số mã  | 🔴 ERROR | 🟡 WARNING | 🔵 INFO |
| --------------------------------------------- | ------ | -------- | ---------- | ------- |
| Common (`ERR-CMN-*`)                          | 9      | 9        | 0          | 0       |
| Riêng (`ERR-INS-*`)                           | 9      | 7        | 1          | 1       |
| Inventory V2 (`ERR-INV-*`) _(DRAFT/PROPOSED)_ | 47     | 45       | 2          | 0       |
| Driver Plus Link (`ERR-DPL-*`)                | 13     | 11       | 0          | 2       |
| Booking Driver+ (`ERR-BOOK-*`)                | 2      | 2        | 0          | 0       |
| **Tổng**                                      | **80** | **74**   | **3**      | **3**   |

**Theo hình thức hiển thị (gồm `ERR-INV-*` + `ERR-DPL-*` + `ERR-BOOK-*`, tổng 80)**: `INLINE_FIELD` ×25 · `INLINE_FORM` ×24 · `INLINE_WARNING` ×3 · `TOAST` ×10 · `DIALOG` ×10 · `EMPTY_STATE` ×3 · `API_RESPONSE` ×5.

---

## 8. Machine-readable registry (BE/FE đồng bộ)

> Block dưới là **nguồn sinh code**: BE generate enum/constants, FE generate i18n map + display handler. Giữ đồng bộ với bảng §2–§3.

```yaml
errorCodes:
  # ---- Common (reusable) ----
  - code: ERR-CMN-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Số tiền vượt quá số lượng cho phép"
    action: null
    http: 400
    rule: VLD-INS-SO-004
  - code: ERR-CMN-002
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Chiết khấu không thể lớn hơn 100%"
    action: null
    http: 400
    rule: VLD-INS-SO-003
  - code: ERR-CMN-003
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: true
    message_vi: "Khấu hao không thể lớn hơn 100%"
    action: null
    http: 400
    rule: VLD-INS-SO-003
  - code: ERR-CMN-004
    severity: ERROR
    display: INLINE_FIELD
    category: file
    common: true
    message_vi: "File quá lớn (tối đa {XX}MB)"
    action: null
    http: 413
    rule: null
  - code: ERR-CMN-005
    severity: ERROR
    display: INLINE_FIELD
    category: file
    common: true
    message_vi: "Định dạng không hỗ trợ — chỉ chấp nhận PDF, JPG, PNG"
    action: null
    http: 415
    rule: null
  - code: ERR-CMN-006
    severity: ERROR
    display: TOAST
    category: system
    common: true
    message_vi: "Không tải lên được file — vui lòng thử lại"
    action: "retry"
    http: 502
    rule: null
  - code: ERR-CMN-007
    severity: ERROR
    display: TOAST
    category: system
    common: true
    message_vi: "Hệ thống đang bận, vui lòng thử lại sau"
    action: null
    http: 503
    rule: null
  - code: ERR-CMN-008
    severity: ERROR
    display: DIALOG
    category: system
    common: true
    message_vi: "Dữ liệu đã được cập nhật bởi người khác — vui lòng tải lại"
    action: "reload"
    http: 409
    rule: null
  - code: ERR-CMN-009
    severity: ERROR
    display: TOAST
    category: business
    common: true
    message_vi: "Phiếu dịch vụ chưa hoàn thành"
    action: null
    http: 409
    rule: VLD-INS-STL-004
  # ---- Insurance-Settlement (domain-specific) ----
  - code: ERR-INS-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Vui lòng chọn công ty bảo hiểm"
    action: null
    http: 400
    rule: VLD-INS-SO-002
  - code: ERR-INS-002
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Vui lòng chọn công ty bảo hiểm trên Phiếu dịch vụ trước khi tạo phiếu quyết toán bảo hiểm"
    action: "nav:service-order"
    http: 409
    rule: VLD-INS-STL-002
  - code: ERR-INS-003
    severity: WARNING
    display: INLINE_WARNING
    category: business
    common: false
    message_vi: "Bảo hiểm thanh toán không thể âm — kiểm tra lại các khoản điều chỉnh"
    action: "highlight:adjustments"
    http: 200
    rule: VLD-INS-SO-005
  - code: ERR-INS-004
    severity: ERROR
    display: TOAST
    category: business
    common: false
    message_vi: "Phiếu dịch vụ không có hạng mục thuộc bảo hiểm"
    action: null
    http: 409
    rule: VLD-INS-STL-001
  - code: ERR-INS-005
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Đã tồn tại phiếu quyết toán bảo hiểm cho phiếu dịch vụ này"
    action: "nav:existing-settlement"
    http: 409
    rule: VLD-INS-STL-003
  - code: ERR-INS-007
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Vui lòng hoàn tất các tài liệu còn thiếu"
    action: "highlight:missing-docs"
    http: 400
    rule: VLD-INS-DOSSIER-003
  - code: ERR-INS-008
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Không tạo được PDF hồ sơ — vui lòng thử lại"
    action: "retry"
    http: 500
    rule: null
  - code: ERR-INS-009
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Không tải được hồ sơ — vui lòng liên hệ quản trị"
    action: null
    http: 500
    rule: null
  - code: ERR-INS-010
    severity: INFO
    display: EMPTY_STATE
    category: empty-state
    common: false
    message_vi: "Chưa có hồ sơ nào được xuất"
    action: null
    http: null
    rule: null
  # ---- Inventory V2 (ERR-INV-*) [DRAFT/PROPOSED] ----
  - code: ERR-INV-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã nhóm vật tư hàng hóa không hợp lệ — không được chứa ký tự đặc biệt"
    action: "highlight:ma-nhom"
    http: 400
    rule: BR-CAT-GRP-002
  - code: ERR-INV-002
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã nhóm vật tư hàng hóa đã tồn tại"
    action: "highlight:ma-nhom"
    http: 400
    rule: BR-CAT-GRP-003
  - code: ERR-INV-003
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Không thể chuyển nhóm vào chính nó hoặc nhóm con của nó (tránh vòng lặp phân cấp)"
    action: "highlight:thuoc-nhom"
    http: 400
    rule: BR-CAT-GRP-009
  - code: ERR-INV-004
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — nhóm đã phát sinh mã sản phẩm nội bộ"
    action: null
    http: 400
    rule: BR-CAT-GRP-010
  - code: ERR-INV-005
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — nhóm cha còn nhóm con, phải xóa hết nhóm con trước"
    action: null
    http: 400
    rule: BR-CAT-GRP-011
  - code: ERR-INV-006
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã sản phẩm nội bộ không hợp lệ — không được chứa ký tự đặc biệt"
    action: "highlight:ma-noi-bo"
    http: 400
    rule: BR-CAT-PROD-002
  - code: ERR-INV-007
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã sản phẩm nội bộ đã tồn tại"
    action: "highlight:ma-noi-bo"
    http: 400
    rule: BR-CAT-PROD-003
  - code: ERR-INV-008
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — mã sản phẩm đã phát sinh dữ liệu sử dụng (phiếu nhập/xuất hoặc tồn kho)"
    action: null
    http: 400
    rule: BR-CAT-PROD-016
  - code: ERR-INV-009
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Mã sản phẩm nội bộ không tồn tại trong garage"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-006
  - code: ERR-INV-010
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: 'Mã sản phẩm nội bộ đang ở trạng thái "Ngừng hoạt động"'
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-007
  - code: ERR-INV-011
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Phải có mã sản phẩm nội bộ ở mọi dòng trước khi ghi sổ kho"
    action: "highlight:dong-thieu-ma"
    http: 400
    rule: BR-IRV2-028 # multi-source: cũng map BR-IDV2-028 (xem bảng §4)
  - code: ERR-INV-012
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Tính chất sản phẩm không hợp lệ — chỉ chọn từ danh sách cố định"
    action: "highlight:tinh-chat"
    http: 400
    rule: BR-CAT-PROD-019
  - code: ERR-INV-013
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Tỷ lệ quy đổi phải lớn hơn 0"
    action: "highlight:dvt-quy-doi"
    http: 400
    rule: BR-CAT-PROD-011
  - code: ERR-INV-014
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "ĐVT quy đổi bị trùng trong cùng mã sản phẩm"
    action: "highlight:dvt-quy-doi"
    http: 400
    rule: BR-CAT-PROD-011
  - code: ERR-INV-015
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mã SKU đã được gắn cho một mã sản phẩm nội bộ khác"
    action: "highlight:chon-sku"
    http: 400
    rule: BR-CAT-PROD-013
  - code: ERR-INV-016
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mô tả vượt quá 255 ký tự"
    action: "highlight:mo-ta"
    http: 400
    rule: BR-CAT-GRP-012
  - code: ERR-INV-017
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Thiếu trường bắt buộc"
    action: "highlight:dong-thieu"
    http: 400
    rule: BR-OB-011
  - code: ERR-INV-018
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: 'Sai định dạng ngày ("Tồn đến ngày")'
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-011
  - code: ERR-INV-019
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "ĐVT trong file không khớp ĐVT chính của mã sản phẩm"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-010
  - code: ERR-INV-020
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Kho không tồn tại trong danh mục kho của garage"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-005
  - code: ERR-INV-021
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
    action: "highlight:ngay"
    http: 400
    rule: BR-AP-006
  - code: ERR-INV-022
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Khoảng ngày của kỳ con phải nằm trong khoảng ngày của kỳ cha"
    action: "highlight:ngay"
    http: 400
    rule: BR-AP-007
  - code: ERR-INV-023
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Khoảng ngày bị chồng lấn với kỳ cùng cấp trong cùng kỳ cha"
    action: "highlight:ngay"
    http: 400
    rule: BR-AP-008
  - code: ERR-INV-024
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Kỳ kế toán đã đóng — không thể thêm/sửa/xóa/ghi sổ chứng từ thuộc kỳ này"
    action: null
    http: 400
    rule: BR-AP-012 # multi-source: cũng map BR-OB-013 / BR-OB-DEL-002 / BR-IRV2-007 / BR-IDV2-007 (xem bảng §4)
  - code: ERR-INV-025
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa kỳ kế toán — kỳ đã đóng hoặc đã phát sinh dữ liệu kho liên quan"
    action: null
    http: 400
    rule: BR-AP-013
  - code: ERR-INV-026
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Không thể xóa — kỳ cha còn kỳ con, phải xóa hết kỳ con trước"
    action: null
    http: 400
    rule: BR-AP-014
  - code: ERR-INV-027
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Tính giá xuất kho thất bại — vui lòng thử lại"
    action: "retry"
    http: 400
    rule: BR-PRC-007 # deprecated — thay bằng ERR-INV-030/031
  - code: ERR-INV-028
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Kỳ trước chưa được tính giá"
    action: null
    http: 400
    rule: BR-PRC-006 # deprecated — đã bỏ chặn tuần tự
  - code: ERR-INV-029
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "Đang có lần tính giá chạy cho kỳ + kho này — vui lòng đợi hoàn tất"
    action: null
    http: 400
    rule: BR-PRC-016
  - code: ERR-INV-030
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Tồn kho âm — mã không thể chạy giá do xuất vượt tồn"
    action: "highlight:ma-loi"
    http: 400
    rule: BR-PRC-007
  - code: ERR-INV-031
    severity: WARNING
    display: INLINE_WARNING
    category: business
    common: false
    message_vi: "Lệch hạch toán — mã không thể chạy giá [MỞ RỘNG TƯƠNG LAI]"
    action: "highlight:ma-loi"
    http: 400
    rule: BR-PRC-007
  - code: ERR-INV-032
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Số lượng tồn phải lớn hơn 0"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-008
  - code: ERR-INV-033
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Giá trị tồn không được nhỏ hơn 0"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-009
  - code: ERR-INV-034
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Tồn đầu kỳ đã tồn tại cho (mã + kho) này — mỗi (mã + kho) chỉ có một tồn đầu kỳ"
    action: "highlight:dong-trung"
    http: 400
    rule: BR-OB-012
  - code: ERR-INV-035
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: 'Tồn đầu kỳ phải là điểm khởi đầu — "Tồn đến ngày" phải trước ngày phiếu đã ghi sổ sớm nhất'
    action: "highlight:dong-loi"
    http: 400
    rule: BR-OB-016
  - code: ERR-INV-036
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Không cho phép tồn âm — thao tác làm tồn kho xuống dưới 0 tại một thời điểm"
    action: "highlight:dong-phieu-loi"
    http: 400
    rule: BR-IRV2-008 # multi-source: cũng map BR-IDV2-004 / BR-OB-015 / BR-OB-DEL-003 (xem bảng §4)
  - code: ERR-INV-037
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Không đủ tồn để xuất"
    action: "highlight:dong-vuot-ton"
    http: 400
    rule: BR-IDV2-004
  - code: ERR-INV-038
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: 'Phiếu nhập có ngày chứng từ trước/cùng "Tồn đến ngày" của tồn đầu kỳ — không hợp lệ'
    action: "highlight:ngay-chung-tu"
    http: 400
    rule: BR-IRV2-030
  - code: ERR-INV-039
    severity: WARNING
    display: INLINE_WARNING
    category: business
    common: false
    message_vi: "Lệch số lượng/sản phẩm so với phiếu dịch vụ (SO) — kiểm tra lại (vẫn cho ghi sổ)"
    action: "highlight:dong-lech"
    http: 400
    rule: BR-IDV2-009
  - code: ERR-INV-040
    severity: ERROR
    display: INLINE_FORM
    category: business
    common: false
    message_vi: "Số lượng trả vượt quá số lượng của phiếu gốc (đã xuất / đã nhập) — không hợp lệ"
    action: "highlight:so-luong"
    http: 400
    rule: BR-IRV2-032, BR-IDV2-031
  - code: ERR-INV-041
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Vượt giới hạn 500 dòng/lần import — vui lòng tách file thành nhiều lần"
    action: "banner:tach-file"
    http: 400
    rule: BR-CAT-PROD-020
  - code: ERR-INV-042
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "ĐVT trong file không khớp danh mục đơn vị tính"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-CAT-PROD-021
  - code: ERR-INV-043
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Nhóm vật tư/hàng hóa trong file không tồn tại hoặc đang ngừng hoạt động"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-CAT-PROD-022
  - code: ERR-INV-044
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Xuất xứ trong file không khớp danh mục xuất xứ"
    action: "highlight:dong-loi"
    http: 400
    rule: BR-CAT-PROD-023
  - code: ERR-INV-045
    severity: ERROR
    display: DIALOG
    category: validation
    common: false
    message_vi: "Kết quả vượt 1.000 mục — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"
    action: "dialog:apply-filter"
    http: 400
    rule: BR-CAT-PROD-024 / BR-IRV2-020 / BR-IDV2-020
  - code: ERR-INV-046
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Mô tả / Ghi chú vượt quá 500 ký tự"
    action: "highlight:o-mo-ta-ghi-chu"
    http: 400
    rule: BR-CAT-PROD-025
  - code: ERR-INV-047
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy"
    action: "highlight:dvt-quy-doi"
    http: 400
    rule: BR-CAT-PROD-011
  - code: ERR-INV-048
    severity: ERROR
    display: INLINE_FORM
    category: validation
    common: false
    message_vi: "Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần"
    action: "banner:tach-file"
    http: 400
    rule: BR-OB-004b
  - code: ERR-INV-050
    severity: ERROR
    display: DIALOG
    category: business
    common: false
    message_vi: "V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2"
    action: "dialog:redirect-v2"
    http: 410
    rule: EP-INVENTORY-RECEIPT-V2 §5.2 / EP-INVENTORY-DELIVERY-V2 §5.2 / EP-INVENTORY-STOCK-V2 §5.2 (V1 Module Hide)
  # ---- Riêng Driver Plus Link (EP-PARTNER-LINK, FEAT-SYS-DRIVERPLUS-LINK) ----
  - code: ERR-DPL-001
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Vui lòng nhập lý do từ chối."
    action: null
    http: 400
    rule: VLD-DPL-001
  - code: ERR-DPL-002
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Vui lòng nhập lý do hủy liên kết."
    action: null
    http: 400
    rule: VLD-DPL-002
  - code: ERR-DPL-003
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Vui lòng cuộn xuống cuối để tiếp tục."
    action: null
    http: 400
    rule: VLD-DPL-003
  - code: ERR-DPL-004
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Yêu cầu liên kết này đã được xử lý bởi người dùng khác. Vui lòng làm mới trang."
    action: null
    http: 409
    rule: VLD-DPL-004
  - code: ERR-DPL-005
    severity: ERROR
    display: TOAST
    category: system
    common: false
    message_vi: "Không thể xử lý yêu cầu. Vui lòng thử lại sau."
    action: null
    http: 503
    rule: VLD-DPL-005
  - code: ERR-DPL-006
    severity: ERROR
    display: TOAST
    category: business
    common: false
    message_vi: 'Đã có tài khoản Driver Plus khác vừa được liên kết. Yêu cầu của bạn tự động chuyển "Từ chối".'
    action: null
    http: 409
    rule: BR-DPL-CMN-002
  - code: ERR-DPL-007
    severity: ERROR
    display: INLINE_FORM
    category: system
    common: false
    message_vi: "Không tải được danh sách yêu cầu liên kết. Vui lòng thử lại."
    action: "button:reload"
    http: 503
    rule: null
  - code: ERR-DPL-008
    severity: INFO
    display: EMPTY_STATE
    category: empty
    common: false
    message_vi: "Chưa có yêu cầu liên kết nào từ Driver Plus."
    action: null
    http: null
    rule: null
  - code: ERR-DPL-009
    severity: INFO
    display: EMPTY_STATE
    category: empty
    common: false
    message_vi: "Không có yêu cầu nào khớp bộ lọc."
    action: null
    http: null
    rule: null
  - code: ERR-DPL-010
    severity: ERROR
    display: EXTERNAL_RESPONSE
    category: business
    common: false
    message_vi: "Garage đã liên kết với một tài khoản Driver Plus khác. Không thể gửi yêu cầu liên kết mới cho đến khi liên kết hiện tại bị hủy."
    action: null
    http: 409
    rule: BR-DPL-CMN-007
  - code: ERR-DPL-011
    severity: ERROR
    display: EXTERNAL_RESPONSE
    category: system
    common: false
    message_vi: "Chức năng liên kết Driver Plus đang tạm ngừng. Vui lòng thử lại sau."
    action: "retry_after_kill_switch_on"
    http: 503
    rule: BR-DPL-CMN-008
  - code: ERR-DPL-012
    severity: ERROR
    display: INLINE_FIELD
    category: validation
    common: false
    message_vi: "Lý do không được vượt quá 2.000 ký tự."
    action: "disable:confirm"
    http: 400
    rule: VLD-DPL-006
  - code: ERR-DPL-013
    severity: ERROR
    display: EXTERNAL_RESPONSE
    category: business
    common: false
    message_vi: "Không tìm thấy garage nào đăng ký số điện thoại này trong hệ thống GMS. Vui lòng kiểm tra lại số điện thoại."
    action: null
    http: 404
    rule: null
  # ---- Booking Driver+ (EP-BOOKING) ----
  - code: ERR-BOOK-001
    severity: ERROR
    display: EXTERNAL_RESPONSE
    category: validation
    common: false
    message_vi: "Yêu cầu đặt lịch không hợp lệ — thiếu trường bắt buộc hoặc giờ hẹn không đúng bước 15 phút."
    action: null
    http: 400
    rule: "FEAT-BOOK-DRIVERPLUS-INBOUND AC-2 / EC-3"
  - code: ERR-BOOK-002
    severity: ERROR
    display: EXTERNAL_RESPONSE
    category: business
    common: false
    message_vi: "Không tìm thấy lịch hẹn tương ứng với yêu cầu hủy."
    action: null
    http: 404
    rule: "FEAT-BOOK-DRIVERPLUS-INBOUND AC-8"
```

---

## 9. Open Questions (NEED CONFIRMATION)

1. **HTTP status** ở cột "HTTP" là đề xuất — Architect chốt khi spawn dev (đặc biệt `ERR-INS-003` WARNING: BE trả 200 + warning trong body hay header?).
2. **Phạm vi Common**: `ERR-CMN-002/003` (chiết khấu/khấu hao) hiện gắn từ ngữ cụ thể — nếu sau này nhiều màn cần, có thể gom thành 1 message generic "Giá trị phần trăm không được lớn hơn 100%". Chờ BA/Architect xác nhận.
3. **Display cho guard nghiệp vụ** (`ERR-INS-002/004/005`): đang đề xuất DIALOG/TOAST dựa theo "Hành động đề xuất" trong UX-FLOW §8.1 — FE/UX chốt cuối khi prefetch Figma oracle.
4. Registry này hiện đã phủ **5 domain** (`ERR-CMN-*` common, `ERR-INS-*` EP-INSURANCE-SETTLEMENT, `ERR-INV-*` Inventory V2 [DRAFT/PROPOSED], `ERR-DPL-*` EP-PARTNER-LINK, `ERR-BOOK-*` EP-BOOKING tích hợp Driver+) — mô hình 1-file-tập-trung đang hoạt động tốt, giữ nguyên cách này khi mở rộng thêm domain mới thay vì tách file (fix stale note, BA-review round 2 N7 2026-07-30; cập nhật domain count BA-review F7 2026-08-03).

## 10. Change Log

| Date       | Version | Author                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-11 | 25      | Delivery Authority (sonhoang) qua main agent — ADR-029 v2 amendment (gap G3, Driver Plus team) | Thêm `ERR-DPL-013` cho case resolve tenant từ SĐT thất bại tại `PARTNER_LINK.REQUEST.CREATE` (SĐT đúng định dạng nhưng không khớp garage nào trong GMS): ERROR, `API_RESPONSE`, HTTP 404, response cho Driver Plus qua step `PARTNER_LINK.REQUEST.RESPONSE` đã có (KHÔNG render GMS UI, KHÔNG tạo `MessageStep` mới). DPL 12→13 mã (ERROR 10→11); tổng 79→80, ERROR 73→74, API_RESPONSE 4→5. Đồng bộ `ADR-029` v2 + `gf-system-events.md` v6 §3.11/§3.12. |
| 2026-08-10 | 23      | user (Business Authority) qua main agent               | Thêm `ERR-DPL-011` cho request tạo liên kết bị từ chối khi `PartnerLink:DriverPlus=off`: HTTP 503, `API_RESPONSE`, message "Chức năng liên kết Driver Plus đang tạm ngừng. Vui lòng thử lại sau.". Cập nhật DPL 10→11 mã, tổng 77→78, ERROR 71→72, API_RESPONSE 3→4. Đồng bộ FEAT AC-43 + BR-DPL-CMN-008.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-06-24 | 13      | Business Authority                                     | **Thêm 3 mã lỗi validate import catalog** (BA chốt khi rà soát wave 3): `ERR-INV-042` (ĐVT file không khớp danh mục → BR-CAT-PROD-021), `ERR-INV-043` (nhóm VTHH không tồn tại/ngừng hoạt động → BR-CAT-PROD-022), `ERR-INV-044` (xuất xứ không khớp danh mục → BR-CAT-PROD-023). §4 + §6 YAML; §5 tổng `ERR-INV` 40→43, tổng 58→61. Đồng bộ FEAT-CAT-PROD-IMPORT AC-5 + BR-GF-INVENTORY-CATALOG.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-06-25 | 14      | Business Authority                                     | **Thêm `ERR-INV-045` — cap 1.000 dòng/lần export catalog** (BA chốt phòng timeout/OOM): 🔴 ERROR, `DIALOG`, 400, rule **BR-CAT-PROD-024**, dùng tại **FEAT-CAT-PROD-EXPORT**. Message: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại". §4 + §6 YAML thêm 045; §5 tổng `ERR-INV` 43→44 (ERROR 41→42), tổng 61→62 (ERROR 57→58); display `DIALOG` 9→10. Đồng bộ FEAT-CAT-PROD-EXPORT v8 + BR-GF-INVENTORY-CATALOG v13.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-06-25 | 15      | Business Authority                                     | **Thêm `ERR-INV-046` — Mô tả / Ghi chú mã SP nội bộ vượt 500 ký tự** (BA chốt khi rà soát form tạo/sửa): 🔴 ERROR, `INLINE_FIELD`, 400, rule **BR-CAT-PROD-025**, dùng tại **FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-EDIT**. Message: "Mô tả / Ghi chú vượt quá 500 ký tự". §4 + §6 YAML thêm 046; §5 tổng `ERR-INV` 44→45 (ERROR 42→43), tổng 62→63 (ERROR 58→59); display `INLINE_FIELD` 19→20. Đồng bộ FEAT-CAT-PROD-CREATE v9 + FEAT-CAT-PROD-EDIT v7 + BR-GF-INVENTORY-CATALOG v14.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-06-26 | 16      | Business Authority                                     | **Thêm `ERR-INV-047` — Tỷ lệ quy đổi vượt 6 chữ số thập phân** (BA chốt khi chuẩn hoá precision): 🔴 ERROR, `INLINE_FIELD`, 400, rule **BR-CAT-PROD-011** (mở rộng), dùng tại **FEAT-CAT-PROD-CREATE/EDIT/DETAIL + FEAT-IR-CREATE-V2 + FEAT-ID-CREATE-V2** (modal "Thêm ĐVT quy đổi" trên catalog + modal inline phiếu nhập/xuất V2). Message: "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy". §4 + §6 YAML thêm 047; §5 tổng `ERR-INV` 45→46 (ERROR 43→44), tổng 63→64 (ERROR 59→60); display `INLINE_FIELD` 20→21. ERR-INV-013 (≤0) + ERR-INV-014 (trùng ĐVT) giữ nguyên. Đồng bộ BR-GF-INVENTORY-CATALOG v15 + FEAT-CAT-PROD-CREATE v10 + FEAT-CAT-PROD-DETAIL v8 + FEAT-CAT-PROD-EDIT v8 + FEAT-IR-CREATE-V2 v19 + FEAT-ID-CREATE-V2 v14 + UX-FLOW-INVENTORY-CATALOG v9.                                                                                                                                                                             |
| 2026-07-03 | 17      | Business Authority                                     | **Thêm `ERR-INV-048` — cap 500 dòng/lần import tồn đầu kỳ** (BA chốt song song cap PROD-IMPORT `ERR-INV-041`): 🔴 ERROR, `INLINE_FORM`, 400, rule **BR-OB-004b** (mới), dùng tại **FEAT-OB-IMPORT**. Message: "Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần". §4 + §6 YAML thêm 048; §5 tổng `ERR-INV` 46→47 (ERROR 44→45), tổng 64→65 (ERROR 60→61); display `INLINE_FORM` 22→23. Đồng bộ BR-GF-INVENTORY-OPENING-BALANCE v11 (thêm BR-OB-004b) + FEAT-OB-IMPORT v11 (thêm AC-3b file-level check).                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-13 | 18      | Business Authority (BA in-session review W05 chuẩn bị) | **Thêm `ERR-INV-050` — V1 endpoint disabled cho tenant bật V2** (BA chốt combo Option 1 per-EP §5.2 + Option 2 có mã lỗi). 🔴 ERROR, `DIALOG`, **HTTP 410 Gone**, category `business`, rule **EP-INVENTORY-RECEIPT-V2 §5.2 / EP-INVENTORY-DELIVERY-V2 §5.2 / EP-INVENTORY-STOCK-V2 §5.2** (V1 Module Hide row), dùng tại V1 controllers `@FeatureOff("Inventory:InventoryV2")`. Message: "V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2". §4 + §6 YAML thêm 050. Rationale: defensive backup cho edge case UI hide không triệt để (bookmark URL cũ / tab pre-flip / integration cũ) + FE parse structured response + log/monitoring track spike. 4 V1 module bị ẩn: "Tồn kho" + "Tồn kho theo kỳ" + "Phiếu nhập kho" + "Phiếu xuất kho". V1 data tables KHÔNG delete (giữ audit + rollback). Cascade EP-INVENTORY-RECEIPT-V2 + EP-INVENTORY-DELIVERY-V2 + EP-INVENTORY-STOCK-V2 §5.2 thêm row V1 Module Hide.                         |
| 2026-07-30 | 19      | user (Business Authority) qua main agent               | **Fix P1 F7 (BA-review EP-PARTNER-LINK 2026-07-30)**: thêm §5 mới **Registry Riêng Driver Plus Link (`ERR-DPL-001..009`)** — 9 mã lỗi domain `EP-PARTNER-LINK` (Web + Mobile): ERR-DPL-001..003 (validation input, ánh xạ VLD-DPL-001..003), ERR-DPL-004..005 (race condition + lỗi hệ thống, ánh xạ VLD-DPL-004..005), ERR-DPL-006 (race 2 user cùng Duyệt, rule BR-DPL-CMN-002), ERR-DPL-007 (banner load danh sách thất bại), ERR-DPL-008..009 (2 empty state — chưa có yêu cầu / filter loại bỏ hết). §1.1 thêm nhóm `DPL`. **Renumber** (theo đúng pattern đã dùng ở v4): §5→§6 (Tổng hợp), §6→§7 (Machine-readable), §7→§8 (Open Questions), §8→§9 (Change Log). §6 Tổng hợp 65→**74** mã (ERROR 61→68, INFO 1→3). §7 YAML thêm 9 entry ERR-DPL-001..009. `boundary` frontmatter thêm `gf-system, garage-mobile`. Đồng bộ FEAT-SYS-DRIVERPLUS-LINK + BR-GF-SYSTEM (cite ERR-DPL-\* vào §5 Business Rules + §5.5 Validation Rules).                          |
| 2026-07-30 | 20      | user (Business Authority) qua main agent               | **Fix P1 N2 (BA-review round 2 EP-PARTNER-LINK, 2026-07-30)**: thêm `ERR-DPL-010` — message GMS trả về Driver Plus khi chặn request tại adapter gate (AC-34/BR-DPL-CMN-007), trước đó chỉ có "wording đề xuất" không mã. Wording **chốt chính thức** user 2026-07-30 (không đổi so với đề xuất cũ). Khác 9 mã trước — đây là response cho **external caller** (Driver Plus), KHÔNG render trên GMS UI, nên thêm display type mới `API_RESPONSE` vào §1.4 taxonomy (thay vì gán nhầm vào 1 trong 6 loại UI hiện có). §5/§6/§7 cập nhật: DPL 9→10 mã (ERROR 7→8), Tổng 74→**75** (ERROR 68→69); display thêm `API_RESPONSE` ×1. Đồng bộ FEAT v22 (AC-34) + BR-GF-SYSTEM v16 (BR-DPL-CMN-007).                                                                                                                                                                                                                                                                       |
| 2026-07-30 | 21      | user (Business Authority) qua main agent               | **Fix P2 N7 (BA-review round 2, 2026-07-30)**: §8 Open Question item 4 vẫn ghi "registry hiện chỉ phủ EP-INSURANCE-SETTLEMENT" — stale từ trước khi có `ERR-INV-*` (v4) và `ERR-DPL-*` (v19). Viết lại phản ánh đúng 4 domain hiện có, xác nhận mô hình 1-file-tập-trung vẫn phù hợp. Thuần editorial.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-08-03 | 22      | user (Business Authority) qua main agent               | **Fix P1 F7 (BA-review EP-BOOKING Driver+ rewrite, 2026-08-03)**: thêm §6 mới **Registry Riêng Booking Driver+ (`ERR-BOOK-001..002`)** — 2 mã lỗi domain `EP-BOOKING` tích hợp Driver+, cùng mẫu `API_RESPONSE` với `ERR-DPL-010` (response cho external caller Driver+, không render GMS UI): `ERR-BOOK-001` (đặt lịch không hợp lệ — thiếu trường bắt buộc / giờ hẹn sai bước 15 phút, rule FEAT-BOOK-DRIVERPLUS-INBOUND AC-2/EC-3), `ERR-BOOK-002` (không tìm thấy booking cho yêu cầu hủy, rule FEAT-BOOK-DRIVERPLUS-INBOUND AC-8). §1.1 thêm nhóm `BOOK`. **Renumber** (theo đúng pattern v19): §6→§7 (Tổng hợp), §7→§8 (Machine-readable), §8→§9 (Open Questions), §9→§10 (Change Log). §7 Tổng hợp 75→**77** mã (ERROR 69→71), domain 4→5. §8 YAML thêm 2 entry ERR-BOOK-001..002. §9 Open Question item 4 cập nhật 5 domain. Đồng bộ `FEAT-BOOK-DRIVERPLUS-OUTBOUND` (thêm AC-10/AC-11 phản hồi từ chối) + `FEAT-BOOK-DRIVERPLUS-INBOUND` (resolve EC-3). |
| 2026-08-05 | 23      | user                                                   | **Transport-neutral external result**: đổi display type hiện hành `API_RESPONSE` → `EXTERNAL_RESPONSE` cho `ERR-DPL-010` + `ERR-BOOK-001/002`; Product chỉ yêu cầu external partner nhận đúng kết quả, không chốt API response đồng bộ hay Kafka response event. HTTP 409/400/404 đổi thành giá trị tương ứng có dấu `*`, chỉ áp dụng nếu Architecture chọn HTTP. Đồng bộ FEAT-BOOK-DRIVERPLUS-OUTBOUND v4, FEAT-SYS-DRIVERPLUS-LINK v25 và BR-GF-SYSTEM v19.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-06-24 | 12      | Business Authority + Architect                         | **Giải xung đột domain `ERR-INV-019`** (gap A1): `ERR-INV-019` đã được registry cấp cho **BR-OB-010** (ĐVT file ≠ ĐVT chính — Opening Balance, FEAT-OB-IMPORT) nhưng bị ADR-018/PKG-W03/Architecture chiếm dụng lại cho "cap 500 dòng import catalog" (rule chỉ "proposed BR-CAT-PROD-020"). Cấp **mã mới `ERR-INV-041`** (🔴 ERROR, INLINE_FORM, 400, rule BR-CAT-PROD-020, FEAT-CAT-PROD-IMPORT) cho cap 500 rows — `ERR-INV-019` giữ nguyên cho Opening Balance. §4 + §6 YAML thêm 041; §5 tổng hợp 39→40 (`ERR-INV`), tổng 57→58. Architecture (ADR-018, gf-inventory-api, agg-garage-graph-graphql), PKG-W03 cascade đổi 019→041 cho catalog import.                                                                                                                                                                                                                                                                                                         |
| 2026-06-16 | 11      | Business Authority                                     | **Thống nhất HTTP status MỌI mã `ERR-INV` → 400** (chốt BA — đảo chuẩn-hoá HTTP v9 của Architect): 12 mã đổi về 400 ở cả §4 + YAML §6 — **422** (030/035/036/037/038/040), **404** (009/020), **409** (029), **500** (027), **200** (031/039). **Lưu ý**: `ERR-INV-031` & `ERR-INV-039` **vẫn giữ severity WARNING** (display INLINE_WARNING, "vẫn cho lưu") — chỉ http đổi 400; behavior chặn/không-chặn **chưa đổi** (chờ BA chốt riêng). `ERR-INV-027` deprecated cũng về 400.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-06-16 | 10      | Business Authority                                     | Thêm **`ERR-INV-040`** (🔴 ERROR, 422, INLINE_FORM): "Số lượng trả vượt quá số lượng của phiếu gốc (đã xuất / đã nhập)" — dùng chung cho **Nhập hàng bán bị trả lại** (SL ≤ SL đã xuất, BR-IRV2-032) và **Xuất trả hàng mua** (SL ≤ SL đã nhập, BR-IDV2-031). Cập nhật §4 + YAML §6 + đếm 39→40.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-06-22 | 9       | Business Authority + Architect                         | **Chuẩn hoá HTTP status Inventory V2 theo phản hồi kỹ thuật**: `409` chỉ dành cho xung đột ghi đồng thời / optimistic-lock (đồng bộ convention R-03 `TEST-CASE-REGISTRY`). Đổi **409 → 400** cho 15 mã `ERR-INV` (002, 004, 005, 007, 008, 010, 011, 014, 015, 023, 024, 025, 026, 028, 034) ở cả bảng §4 lẫn YAML §6. **Giữ 409**: `ERR-INV-029` (đang chạy tính giá — concurrency conflict thật). **Giữ nguyên** các mã `422` (030/035/036/037/038) và 409 domain bảo hiểm (`ERR-CMN-008/009`, `ERR-INS-002/004/005`). Bảng API `gf-inventory-api.md`/`-worker-api.md` (row `.04`) + INTEG idempotency Temporal **không đụng** — xử lý riêng.                                                                                                                                                                                                                                                                                                                   |
| 2026-06-16 | 8       | Business Authority                                     | `ERR-INV-029`: rule-ref thêm **BR-PRC-011**, "Dùng tại" thêm **FEAT-PRC-DELETE** — chặn xóa log khi đang "Đang tính" (rà lỗ hổng G3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-16 | 7       | Business Authority                                     | `ERR-INV-029` (chặn chạy trùng tính giá): cột "Dùng tại (FEAT)" thêm **FEAT-PRC-RECALC** — sau khi BR-PRC-016 mở rộng chặn-trùng phủ cả RECALC (rà lỗ hổng G2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-06-16 | 6       | Business Authority + Architect                         | Housekeeping §4/§5/§6: đánh dấu ERR-INV-027/028 deprecated; đồng bộ rule-ref đa nguồn (011/024/036) giữa bảng và YAML; sửa thống kê "theo hiển thị" §5 cộng đủ 57.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-06-16 | 5       | Business Authority + Architect                         | Bổ sung 39 mã ERR-INV-001..039 vào khối YAML machine-readable §6 (đồng bộ với bảng §4) cho BE/FE codegen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-06-16 | 4       | Business Authority + Architect                         | Thêm §4 Registry Inventory V2 (ERR-INV-001..039) — đăng ký 39 mã lỗi domain kho V2 [DRAFT/PROPOSED — chưa cutover]; đồng bộ từ mã bare UPPERCASE_SNAKE trong BR-GF-INVENTORY-\*. §1.1 thêm nhóm INV; §4 Tổng hợp 18→57 mã (thêm 39 ERR-INV: 37 ERROR + 2 WARNING); renumber §4→§5 (Tổng hợp), §5→§6 (Machine-readable), §6→§7 (Open Questions), §7→§8 (Change Log).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-06-11 | 3       | BA/PO (anhluong)                                       | **Bỏ upload file scan hồ sơ BH** (chốt B-3): **gỡ `ERR-INS-006`** ("Vui lòng upload Giấy ủy quyền", VLD-INS-DOSSIER-001 — Giấy ủy quyền điền template); de-link `ERR-CMN-004/005/006` khỏi hồ sơ BH (rule → null, "Dùng tại" → toàn platform upload file — codes giữ cho upload khác). §4 Tổng hợp 19→18 mã (ERR-INS 10→9). Đồng bộ BR-EP v26, FEAT-INS-DOSSIER-CREATE v17, UX-FLOW v16.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-06-11 | 2       | ThanhVu (Business Authority)                           | Thêm chiều **hình thức hiển thị** cho dev agent: §1.4 taxonomy `display` (INLINE_FIELD / INLINE_FORM / INLINE_WARNING / TOAST / DIALOG / EMPTY_STATE) với thuộc tính block/auto-dismiss/vị trí; thêm cột **Hiển thị** + **Action kèm** vào §2–§3; thêm field `display` + `action` vào YAML; §4 thêm thống kê theo display; §6 thêm OQ-3 (display guard nghiệp vụ chờ UX chốt).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-06-11 | 1       | ThanhVu (Business Authority)                           | Khởi tạo registry mã lỗi cho EP-INSURANCE-SETTLEMENT — 19 mã (9 `ERR-CMN-*` common + 10 `ERR-INS-*` riêng). Mỗi mã có severity, category, common flag, message VI, HTTP gợi ý, rule ref, FEAT usage. Thêm block YAML machine-readable cho BE/FE đồng bộ. Gỡ thông báo "chọn nguồn thanh toán"; đổi 2 message sang chuỗi tĩnh không biến.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
