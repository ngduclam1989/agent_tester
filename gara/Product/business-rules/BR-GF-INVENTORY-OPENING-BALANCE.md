---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 13
tier: T1
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-07"
supersedes: "none"
---

# Business Rules — gf-inventory Opening Balance (Tồn đầu kỳ)

> Tập business rules cho `EP-INVENTORY-OPENING-BALANCE`. File **mới**, không thay thế `BR-GF-INVENTORY.md`. Tồn đầu kỳ ghi vào **bảng dữ liệu mới**.

---

## §1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-OB-001 | Tồn đầu kỳ do gf-inventory sở hữu (bảng mới), tham chiếu mã sản phẩm nội bộ + ĐVT chính + kho cùng boundary; là nguồn tồn cho xuất kho và báo cáo tồn/NXT. | Nội bộ | `gf-inventory` | Trực tiếp trong boundary |
| CB-OB-002 | "Tồn đến ngày" của mỗi dòng quyết định kỳ kế toán liên quan (gián tiếp): nếu ngày rơi vào kỳ **đã đóng**, hệ thống chặn import / xóa dòng đó. | Tham chiếu | (kỳ kế toán, cùng boundary) | Kiểm tra theo ngày |

---

## §2 Rules Registry

### 2.1 Tồn đầu kỳ (BR-OB-001 .. BR-OB-016)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-001 | Mỗi dòng tồn đầu kỳ gồm: **Tồn đến ngày** (ngày chốt số tồn), **Kho**, **Mã sản phẩm nội bộ**, **Tên sản phẩm nội bộ**, **ĐVT**, **Số lượng tồn**, **Giá trị tồn**. | Data Shape | FEAT-OB-IMPORT, FEAT-OB-LIST |
| BR-OB-002 | Tồn đầu kỳ **không gắn trực tiếp** kỳ kế toán (không chọn kỳ thủ công). Liên hệ kỳ **gián tiếp qua "Tồn đến ngày"**. | Association | FEAT-OB-IMPORT |
| BR-OB-003 | Chỉ nhập **Số lượng tồn** và **Giá trị tồn** — **không** nhập đơn giá riêng (đơn giá suy ra = giá trị / số lượng nếu cần). | Data Shape | FEAT-OB-IMPORT |
| BR-OB-004 | **Import chỉ thêm mới**, bắt buộc đi qua bước kiểm tra dữ liệu (preview lỗi/hợp lệ) trước khi ghi. File template định dạng `.xlsx`. Một file có thể chứa nhiều kho (theo cột kho). | Import | FEAT-OB-IMPORT |
| BR-OB-004a | **Import all-or-nothing**: hệ thống **chỉ ghi khi toàn bộ dòng trong file hợp lệ**. File có **bất kỳ dòng lỗi nào** (kể cả 1 dòng vi phạm BR-OB-005..016) → **chặn cả file**, không ghi dòng nào; nút "Xác nhận import" bị disabled cho tới khi user sửa file và kiểm tra lại. Cơ chế này bảo toàn tính chính xác của số dư mở đầu (partial import có thể làm lệch NXT nếu thiếu dòng). | Import | FEAT-OB-IMPORT |
| BR-OB-004b | **Import giới hạn 500 dòng/lần**: mỗi lần import file `.xlsx` chỉ xử lý tối đa **500 dòng dữ liệu**. File vượt quá → toàn bộ lần import bị **từ chối ngay ở bước kiểm tra** (không ghi dòng nào) với mã lỗi **`ERR-INV-048`** ("Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần"). Giới hạn áp dụng ở cả tầng kiểm tra (verify-import) lẫn tầng ghi (import). File **không đúng định dạng `.xlsx`** hoặc **không đọc được** → báo lỗi định dạng, không chuyển sang bước kiểm tra. File **không có dòng dữ liệu** (rỗng) → báo **"File không có dữ liệu"**, không cho xác nhận import. | Validation | FEAT-OB-IMPORT |
| BR-OB-005 | Kho lấy từ **danh mục kho** gắn theo garage (kho tự sinh khi tạo garage). Cột "Kho" trong file import match theo **tên kho** (không dùng mã kho — hiện danh mục kho không hiển thị mã). Tên không khớp danh mục kho của garage → mã lỗi **`ERR-INV-020`**. | Validation | FEAT-OB-IMPORT, FEAT-OB-EDIT |
| BR-OB-006 | Dòng import **lỗi** nếu **mã sản phẩm nội bộ không tồn tại** trong garage → mã lỗi **`ERR-INV-009`**. | Validation | FEAT-OB-IMPORT |
| BR-OB-007 | Dòng import **lỗi** nếu mã sản phẩm ở trạng thái **"Ngừng hoạt động"** → mã lỗi **`ERR-INV-010`**. | Validation | FEAT-OB-IMPORT |
| BR-OB-008 | Dòng import **lỗi** nếu **Số lượng tồn ≤ 0** (phải > 0) → mã lỗi **`ERR-INV-032`**. | Validation | FEAT-OB-IMPORT |
| BR-OB-009 | **Giá trị tồn** cho phép **= 0 hoặc để trống**, nhưng **không được < 0** → mã lỗi **`ERR-INV-033`**. | Validation | FEAT-OB-IMPORT |
| BR-OB-010 | Dòng import **lỗi** nếu **ĐVT trong file khác ĐVT chính** của mã sản phẩm nội bộ trong danh mục → mã lỗi **`ERR-INV-019`**. | Validation | FEAT-OB-IMPORT |
| BR-OB-011 | Dòng import **lỗi** nếu thiếu trường bắt buộc (mã lỗi **`ERR-INV-017`**) hoặc **sai định dạng ngày** ("Tồn đến ngày" — mã lỗi **`ERR-INV-018`**). | Validation | FEAT-OB-IMPORT |
| BR-OB-012 | **OB duy nhất theo (mã + kho)**: mỗi (mã + kho) chỉ có **một** tồn đầu kỳ. Import dòng OB cho (mã + kho) **đã có OB** (dữ liệu cũ), hoặc trùng (mã + kho) với **dòng khác trong cùng file** → **CHẶN** (`ERR-INV-034`), **không ghi** dòng trùng. (Muốn đổi OB → xóa OB cũ rồi import lại.) | Validation | FEAT-OB-IMPORT |
| BR-OB-013 | Chặn import dòng có **"Tồn đến ngày" rơi vào kỳ kế toán đã đóng** → mã lỗi **`ERR-INV-024`**. Nếu ngày **không thuộc kỳ nào** (garage chưa lập kỳ kế toán) → **vẫn cho import** (OB liên hệ kỳ gián tiếp, không gắn trực tiếp — BR-OB-002). | Lock | FEAT-OB-IMPORT |
| BR-OB-014 | Danh sách tồn đầu kỳ luôn được phạm vi theo garage hiện tại (tenant isolation). Tìm kiếm LIKE theo mã/tên sản phẩm nội bộ; lọc theo Kho / Người import / Ngày import. Hiển thị dòng Tổng (tổng số lượng + tổng giá trị). Sắp xếp mặc định: **Ngày import mới nhất lên đầu**. | Tenant Isolation / Search | FEAT-OB-LIST |
| BR-OB-015 | Chặn import dòng OB nếu việc chèn dòng làm **tồn lũy kế của (mã + kho) tại bất kỳ thời điểm nào từ "Tồn đến ngày" trở đi xuống < 0** (check **point-in-time**, **đối xứng với BR-OB-DEL-003** ở chiều xóa) → mã lỗi **`ERR-INV-036`**. | Validation | FEAT-OB-IMPORT |
| BR-OB-016 | **OB phải là điểm khởi đầu — trước mọi phiếu**: chặn import dòng OB nếu **"Tồn đến ngày" ≥ ngày phát sinh sớm nhất** của phiếu nhập/xuất **đã ghi sổ** của cùng (mã + kho) → mã lỗi **`ERR-INV-035`**. (Đặt **sau HOẶC cùng ngày** phiếu đều chặn — tránh đếm trùng vì OB là số tồn chốt *as-of*.) **Chỉ xét phiếu ĐÃ GHI SỔ**: phiếu **Nháp** lùi ngày (tạo trước khi import OB) không chặn OB ở đây, nhưng **sẽ không ghi sổ được** (nhập → BR-IRV2-030; xuất → chặn tồn âm BR-IDV2-004). | Validation | FEAT-OB-IMPORT |

> **Cascade khi import**: import OB **kích hoạt tính lại (cascade forward)** tồn lũy kế của (mã + kho) từ "Tồn đến ngày" trở đi → tồn-đến-ngày / giá trị tồn ở các mốc sau được cập nhật để phản ánh OB. Cascade dùng engine sổ tồn chung (**BR-STKV2-001** — Import OB là tình huống #1 trong 5 tình huống cập nhật sổ tồn; đối xứng với §2.2 note EDIT). Kết hợp BR-OB-016, OB luôn là điểm sớm nhất nên không phát sinh đếm trùng.
> **"Tồn đến ngày" ở tương lai** (> ngày hiện tại): **KHÔNG chặn** — cho phép import (quyết định Business Authority 2026-06-15).
> **Sửa dòng OB**: hỗ trợ sửa trực tiếp qua `FEAT-OB-EDIT` — form cho đổi Sản phẩm, Kho, SL tồn, Giá trị tồn, Tồn đến ngày (ĐVT readonly theo mã). Guardrails sửa tương tự import (BR-OB-EDIT-001..005). Sửa xong → engine tính lại sổ tồn từ (bảng OB + phiếu detail) — BR-STKV2-005a.

### 2.2 Sửa dòng tồn đầu kỳ (BR-OB-EDIT-001 .. BR-OB-EDIT-006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-EDIT-001 | Sửa dòng tồn đầu kỳ qua icon **sửa (✏️)** trên cột Thao tác của danh sách. Mở form **"Sửa chi tiết tồn kho vật tư hàng hoá"** với 6 trường: **Sản phẩm \*** (dropdown, đổi được), **Kho \*** (dropdown, đổi được), **Đơn vị tính** (readonly — tự đổi theo mã sản phẩm = ĐVT chính), **Số lượng tồn**, **Tồn đến ngày**, **Giá trị tồn**. Nút **"Lưu"** + **"Huỷ bỏ"**. | Edit | FEAT-OB-EDIT |
| BR-OB-EDIT-002 | Chặn lưu nếu **"Tồn đến ngày"** (mới hoặc cũ) rơi vào **kỳ kế toán đã đóng** → mã lỗi **`ERR-INV-024`**. | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-003 | Chặn lưu nếu thay đổi (SL/kho/mã/ngày) làm **tồn lũy kế < 0 tại bất kỳ thời điểm nào** từ "Tồn đến ngày" trở đi (check point-in-time) → mã lỗi **`ERR-INV-036`**. | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-004 | Chặn lưu nếu **"Tồn đến ngày"** (mới) ≥ ngày phát sinh sớm nhất của phiếu nhập/xuất **đã ghi sổ** của (mã+kho) mới — OB phải trước mọi phiếu → mã lỗi **`ERR-INV-035`**. | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-005 | Chặn lưu nếu (mã+kho) sau sửa **trùng** dòng OB khác đã tồn tại → mã lỗi **`ERR-INV-034`** (OB duy nhất / (mã+kho) — BR-OB-012). | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-006 | **Validate trường bắt buộc + giá trị** (đối xứng BR-OB-006..010 cho import): Sản phẩm bắt buộc + phải "Đang hoạt động" (ngừng → `ERR-INV-010`); Kho bắt buộc + phải tồn tại (`ERR-INV-020`); **Số lượng tồn > 0** (`ERR-INV-032`); **Giá trị tồn ≥ 0** (cho = 0; < 0 → `ERR-INV-033`); **Tồn đến ngày** bắt buộc + đúng định dạng. | Validation | FEAT-OB-EDIT |

> **Cascade khi sửa OB**: lưu thành công → engine tính lại sổ tồn từ (bảng OB + phiếu detail) cho (mã+kho+gara) bị ảnh hưởng (BR-STKV2-005a) → báo cáo tồn/NXT cập nhật theo. Nếu đổi (mã+kho), engine tính lại cho cả combo cũ và combo mới.

### 2.3 Xóa dòng tồn đầu kỳ (BR-OB-DEL-001 .. BR-OB-DEL-005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-DEL-001 | Xóa nhiều dòng đồng thời qua checkbox chọn dòng + nút **"Xóa dòng đã chọn"**. | Delete | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-002 | Chặn xóa dòng có **"Tồn đến ngày" thuộc kỳ kế toán đã đóng (khóa)** → mã lỗi **`ERR-INV-024`**. | Delete Guard | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-003 | Chặn xóa nếu việc xóa làm **tồn kho của (mã sản phẩm + kho) xuống < 0** → mã lỗi **`ERR-INV-036`**. (Không chặn theo "có hay không có phiếu xuất": nếu đã có phiếu nhập bù đủ, số lượng xuất vẫn ≤ tổng nhập + tồn đầu, thì xóa tồn đầu vẫn để lại tồn ≥ 0 → cho xóa.) | Delete Guard | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-004 | Khi chọn nhiều dòng mà **một số** dòng vi phạm guardrail (BR-OB-DEL-002 / 003), hệ thống **chặn cả lô** — không xóa partial, hiển thị popup "Không thể xóa". | Delete Guard | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-005 | Thứ tự bắn mã lỗi khi 1 dòng vi phạm cả 2 điều kiện — **kỳ đóng (`ERR-INV-024`) trước, tồn âm (`ERR-INV-036`) sau**. Mỗi dòng chỉ báo **1 mã lỗi** (mã đầu tiên vi phạm). Khi chọn nhiều dòng, gom tất cả dòng vi phạm vào 1 lần báo; popup giữ nội dung gộp — không tách theo mã. | Delete Guard | FEAT-OB-DELETE-LINES |

### 2.3 Audit & Phân quyền (BR-OB-CMN-001 .. BR-OB-CMN-002)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-CMN-001 | Mỗi dòng tồn đầu kỳ ghi nhận **Người import** và **Ngày import**. Màn kết quả import hiển thị tổng dòng đã import, số thành công, thời gian, người import, thông tin file + checksum (checksum chỉ để hiển thị/audit). | Audit | FEAT-OB-IMPORT, FEAT-OB-LIST |
| BR-OB-CMN-002 | Hệ thống có 2 vai trò — **chủ garage** và **kế toán** — với **quyền ngang nhau** trên toàn bộ tồn đầu kỳ (xem / import / sửa / xóa). | Permission | (toàn bộ feature OB) |

## §3 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo BR-GF-INVENTORY-OPENING-BALANCE (file mới) — 14 rule tồn đầu kỳ (BR-OB), 4 rule xóa (BR-OB-DEL), 2 cross-boundary (CB-OB), 2 audit/phân quyền (BR-OB-CMN). Xóa theo guardrail tồn ≥ 0 + kỳ đã đóng; chặn cả lô. |
| 2026-06-03 | 2 | Business Authority | Gắn **mã lỗi** (UPPERCASE_SNAKE): INTERNAL_PRODUCT_NOT_FOUND/INACTIVE, OPENING_BALANCE_QUANTITY_INVALID/VALUE_INVALID/DUPLICATED, UOM_MISMATCH, REQUIRED_FIELD_MISSING, DATE_FORMAT_INVALID, ACCOUNTING_PERIOD_CLOSED, NEGATIVE_STOCK_NOT_ALLOWED. |
| 2026-06-15 | 3 | Business Authority | Rà completeness: thêm **BR-OB-015** import check tồn âm point-in-time (đối xứng BR-OB-DEL-003 — A7); **BR-OB-005** thêm mã lỗi `WAREHOUSE_NOT_FOUND`; **BR-OB-012** cover trùng trong cùng file + làm rõ cảnh báo không chặn; **BR-OB-013** ngày không thuộc kỳ nào → cho import; note sửa OB = xóa + import lại (A6) + NEED CONFIRMATION ngày tương lai. |
| 2026-06-15 | 4 | Business Authority | Theo quyết định BA: thêm **BR-OB-016** — OB phải trước mọi phiếu của (mã+kho), chặn import nếu "Tồn đến ngày" sau/cùng ngày phiếu phát sinh → `OPENING_BALANCE_AFTER_TRANSACTION`; thêm note **cascade khi import OB** (tính lại tồn-đến-ngày forward — đồng bộ Plan §7.1). |
| 2026-06-15 | 5 | Business Authority | Quyết định BA: "Tồn đến ngày" ở **tương lai KHÔNG chặn** — cho phép import (gỡ NEED CONFIRMATION). |
| 2026-06-15 | 6 | Business Authority | Rà lỗ hổng (Nhóm B): **BR-OB-012** đổi "cảnh báo trùng" → **CHẶN — OB duy nhất theo (mã+kho)** (6c); **BR-OB-016** giữ "chỉ xét phiếu đã ghi sổ" + ghi rõ phiếu Nháp trước OB không ghi sổ được (6a). Note "Sửa dòng OB": bổ sung đường thoát khi xóa OB bị chặn do tồn âm — bỏ ghi sổ/xóa phiếu phụ thuộc trước (D2). |
| 2026-06-16 | 7 | Business Authority | Đăng ký mã lỗi: đổi bare UPPERCASE_SNAKE → ERR-INV-NNN (ERROR-CODE-REGISTRY §4) cho nhóm Tồn đầu kỳ. |
| 2026-06-16 | 8 | Business Authority | Gỡ con trỏ "(xem `Plan/INVENTORY-V2-RULES.md` §7.1)" ở note Cascade khi import (note file sắp xóa) — Product độc lập. |
| 2026-07-02 | 9 | Business Authority | **Thêm §2.2 Sửa dòng tồn đầu kỳ** (BR-OB-EDIT-001..005, 5 rule) cho `FEAT-OB-EDIT` mới. Form 6 trường (Sản phẩm/Kho đổi được, ĐVT readonly theo mã). Guardrails: kỳ đóng (`ERR-INV-024`), tồn âm point-in-time (`ERR-INV-036`), OB trước mọi phiếu (`ERR-INV-035`), unique (mã+kho) (`ERR-INV-034`). Cascade sổ tồn sau lưu. §2.2 Xóa → đánh lại §2.3. BR-OB-CMN-002 thêm "sửa". Note "Sửa dòng OB" đổi sang ref `FEAT-OB-EDIT`. |
| 2026-07-03 | 10 | Business Authority | **Thêm BR-OB-004a — Import OB all-or-nothing** (BA chốt để bảo toàn tính chính xác số dư đầu kỳ): chỉ ghi khi toàn bộ dòng hợp lệ; có bất kỳ dòng lỗi nào → chặn cả file, không ghi dòng nào. Thay mô hình cũ "ghi dòng hợp lệ + bỏ qua dòng lỗi". Lý do: partial import có thể làm lệch NXT nếu thiếu dòng OB. Đồng bộ FEAT-OB-IMPORT v9 (AC-6 rewrite + EC-1 sửa). |
| 2026-07-03 | 11 | Business Authority | **Thêm BR-OB-004b — Import OB giới hạn 500 dòng/lần + validate cấp file** (BA chốt song song cap PROD-IMPORT BR-CAT-PROD-020): file vượt 500 dòng → chặn cả file, mã lỗi `ERR-INV-048`; sai định dạng `.xlsx` hoặc không đọc được → báo lỗi định dạng; file rỗng → báo "File không có dữ liệu". Áp cả tầng kiểm tra lẫn tầng ghi. Đồng bộ FEAT-OB-IMPORT v11 (thêm AC-3b file-level check) + ERROR-CODE-REGISTRY v17 (cấp `ERR-INV-048`). |
| 2026-07-06 | 12 | Business Authority (in-session, user ninhnguyen) | **§2.1 note "Cascade khi import" cite `BR-STKV2-001`** — parallel FEAT-OB-EDIT §5 + §2.2 note EDIT (đã cite BR-STKV2-001). Thêm phrase "Cascade dùng engine sổ tồn chung (BR-STKV2-001 — Import OB là tình huống #1 trong 5 tình huống cập nhật sổ tồn; đối xứng với §2.2 note EDIT)". Clarification-only, không đổi behavior. Đồng bộ FEAT-OB-IMPORT v12 (§5 thêm bullet Cascade sổ tồn cùng cite BR-STKV2-001). |
| 2026-07-07 | 13 | Business Authority (in-session, user ninhnguyen) | **Thêm BR-OB-DEL-005** — chốt thứ tự bắn mã lỗi khi 1 dòng vi phạm cả 2 điều kiện: kỳ đóng (`ERR-INV-024`) trước, tồn âm (`ERR-INV-036`) sau. Mỗi dòng chỉ báo 1 mã lỗi; nhiều dòng vi phạm gom 1 lần báo. §2.3 header đổi range 001..004 → 001..005. Đồng bộ FEAT-OB-DELETE-LINES v7. |
