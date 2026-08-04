---
type: execution-spec
artifact_kind: business-rule
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source_ref: "Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md"
source_version: 13
source_sha: "NEED CONFIRMATION — sha256 chưa được compute trong spawn này (không có shell tool). Orchestrator/CI cần chạy `sha256sum Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` tại source_version 13 và điền lại field này trước khi bump DRAFT → ACTIVE."
generated_at: "2026-07-08T00:00:00Z"
boundary: "gf-inventory"
applies_to_feats:
  - FEAT-OB-LIST
  - FEAT-OB-IMPORT
  - FEAT-OB-EDIT
  - FEAT-OB-DELETE-LINES
parent_pkg: "PKG-W04-inventory-period-opening-balance"
authoring_inputs:
  kg_baseline_sha: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
---

# BR-GF-INVENTORY-OPENING-BALANCE — Wave W04 Scoped Spec

> **Phạm vi**: Toàn bộ 4 feature của `EP-INVENTORY-OPENING-BALANCE` trong W04 — `FEAT-OB-LIST` · `FEAT-OB-IMPORT` · `FEAT-OB-EDIT` · `FEAT-OB-DELETE-LINES`. Rule text §1 là **VERBATIM copy** từ nguồn canonical (v13). Toàn bộ rule trong nguồn thuộc scope epic này = thuộc scope W04 — **không filter** rule nào ra.
> Boundary primary: `gf-inventory` (per-boundary BR). Cross-boundary lock-check (ADR-021) tới `gf-accounting` là **consume-only** — `gf-inventory` không sở hữu kỳ kế toán.
> Nhấn mạnh theo yêu cầu wave: **all-or-nothing bulk** (BR-OB-004a), **cap 500 dòng** (BR-OB-004b), **empty-file semantic PASS `canCommit=false`**, **ĐVT khớp ĐVT chính** (BR-OB-010), **delete-lines fail-fast theo `ids[]`** (BR-OB-DEL-005), **REST advisory tới `gf-accounting` — fail-CLOSED commit-path** (ADR-021).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | `Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` |
| Source version | 13 |
| Source SHA | *(pending — xem §7 OI-W04-BR-001)* |
| Generated at | 2026-07-08T00:00:00Z |
| PKG | `PKG-W04-inventory-period-opening-balance` |
| Parent EP | `EP-INVENTORY-OPENING-BALANCE` |
| Related ADRs | ADR-019 (AP on gf-accounting) · ADR-020 v4 (stock ledger daily-snapshot) · ADR-021 v2 (OB period-lock cross-boundary) · ADR-022 v4 (OB import all-or-nothing) |

---

## §1 Rule Statements (VERBATIM — toàn bộ W04 scope)

> Toàn bộ rule trong nguồn áp dụng cho `EP-INVENTORY-OPENING-BALANCE` = W04 scope. Không filter out rule nào.

### 1.1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-OB-001 | Tồn đầu kỳ do gf-inventory sở hữu (bảng mới), tham chiếu mã sản phẩm nội bộ + ĐVT chính + kho cùng boundary; là nguồn tồn cho xuất kho và báo cáo tồn/NXT. | Nội bộ | `gf-inventory` | Trực tiếp trong boundary |
| CB-OB-002 | "Tồn đến ngày" của mỗi dòng quyết định kỳ kế toán liên quan (gián tiếp): nếu ngày rơi vào kỳ **đã đóng**, hệ thống chặn import / xóa dòng đó. | Tham chiếu | (kỳ kế toán, cùng boundary) | Kiểm tra theo ngày |

### 1.2 Tồn đầu kỳ (BR-OB-001 .. BR-OB-016)

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

### 1.3 Sửa dòng tồn đầu kỳ (BR-OB-EDIT-001 .. BR-OB-EDIT-006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-EDIT-001 | Sửa dòng tồn đầu kỳ qua icon **sửa (✏️)** trên cột Thao tác của danh sách. Mở form **"Sửa chi tiết tồn kho vật tư hàng hoá"** với 6 trường: **Sản phẩm \*** (dropdown, đổi được), **Kho \*** (dropdown, đổi được), **Đơn vị tính** (readonly — tự đổi theo mã sản phẩm = ĐVT chính), **Số lượng tồn**, **Tồn đến ngày**, **Giá trị tồn**. Nút **"Lưu"** + **"Huỷ bỏ"**. | Edit | FEAT-OB-EDIT |
| BR-OB-EDIT-002 | Chặn lưu nếu **"Tồn đến ngày"** (mới hoặc cũ) rơi vào **kỳ kế toán đã đóng** → mã lỗi **`ERR-INV-024`**. | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-003 | Chặn lưu nếu thay đổi (SL/kho/mã/ngày) làm **tồn lũy kế < 0 tại bất kỳ thời điểm nào** từ "Tồn đến ngày" trở đi (check point-in-time) → mã lỗi **`ERR-INV-036`**. | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-004 | Chặn lưu nếu **"Tồn đến ngày"** (mới) ≥ ngày phát sinh sớm nhất của phiếu nhập/xuất **đã ghi sổ** của (mã+kho) mới — OB phải trước mọi phiếu → mã lỗi **`ERR-INV-035`**. | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-005 | Chặn lưu nếu (mã+kho) sau sửa **trùng** dòng OB khác đã tồn tại → mã lỗi **`ERR-INV-034`** (OB duy nhất / (mã+kho) — BR-OB-012). | Edit Guard | FEAT-OB-EDIT |
| BR-OB-EDIT-006 | **Validate trường bắt buộc + giá trị** (đối xứng BR-OB-006..010 cho import): Sản phẩm bắt buộc + phải "Đang hoạt động" (ngừng → `ERR-INV-010`); Kho bắt buộc + phải tồn tại (`ERR-INV-020`); **Số lượng tồn > 0** (`ERR-INV-032`); **Giá trị tồn ≥ 0** (cho = 0; < 0 → `ERR-INV-033`); **Tồn đến ngày** bắt buộc + đúng định dạng. | Validation | FEAT-OB-EDIT |

> **Cascade khi sửa OB**: lưu thành công → engine tính lại sổ tồn từ (bảng OB + phiếu detail) cho (mã+kho+gara) bị ảnh hưởng (BR-STKV2-005a) → báo cáo tồn/NXT cập nhật theo. Nếu đổi (mã+kho), engine tính lại cho cả combo cũ và combo mới.

### 1.4 Xóa dòng tồn đầu kỳ (BR-OB-DEL-001 .. BR-OB-DEL-005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-DEL-001 | Xóa nhiều dòng đồng thời qua checkbox chọn dòng + nút **"Xóa dòng đã chọn"**. | Delete | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-002 | Chặn xóa dòng có **"Tồn đến ngày" thuộc kỳ kế toán đã đóng (khóa)** → mã lỗi **`ERR-INV-024`**. | Delete Guard | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-003 | Chặn xóa nếu việc xóa làm **tồn kho của (mã sản phẩm + kho) xuống < 0** → mã lỗi **`ERR-INV-036`**. (Không chặn theo "có hay không có phiếu xuất": nếu đã có phiếu nhập bù đủ, số lượng xuất vẫn ≤ tổng nhập + tồn đầu, thì xóa tồn đầu vẫn để lại tồn ≥ 0 → cho xóa.) | Delete Guard | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-004 | Khi chọn nhiều dòng mà **một số** dòng vi phạm guardrail (BR-OB-DEL-002 / 003), hệ thống **chặn cả lô** — không xóa partial, hiển thị popup "Không thể xóa". | Delete Guard | FEAT-OB-DELETE-LINES |
| BR-OB-DEL-005 | Thứ tự bắn mã lỗi khi 1 dòng vi phạm cả 2 điều kiện — **kỳ đóng (`ERR-INV-024`) trước, tồn âm (`ERR-INV-036`) sau**. Mỗi dòng chỉ báo **1 mã lỗi** (mã đầu tiên vi phạm). Khi chọn nhiều dòng, gom tất cả dòng vi phạm vào 1 lần báo; popup giữ nội dung gộp — không tách theo mã. | Delete Guard | FEAT-OB-DELETE-LINES |

### 1.5 Audit & Phân quyền (BR-OB-CMN-001 .. BR-OB-CMN-002)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-OB-CMN-001 | Mỗi dòng tồn đầu kỳ ghi nhận **Người import** và **Ngày import**. Màn kết quả import hiển thị tổng dòng đã import, số thành công, thời gian, người import, thông tin file + checksum (checksum chỉ để hiển thị/audit). | Audit | FEAT-OB-IMPORT, FEAT-OB-LIST |
| BR-OB-CMN-002 | Hệ thống có 2 vai trò — **chủ garage** và **kế toán** — với **quyền ngang nhau** trên toàn bộ tồn đầu kỳ (xem / import / sửa / xóa). | Permission | (toàn bộ feature OB) |

---

## §2 Rationale (VERBATIM — trích header + preamble nguồn)

> Trích nguyên văn từ header + preamble nguồn canonical.

Tập business rules cho `EP-INVENTORY-OPENING-BALANCE`. File **mới**, không thay thế `BR-GF-INVENTORY.md`. Tồn đầu kỳ ghi vào **bảng dữ liệu mới**.

---

## §3 Enforcement Layer

### 3.1 Tổng quan phân lớp

| Layer | Vai trò | Rules chính |
|---|---|---|
| Domain (`gf-inventory` — `app/service`, `OpeningBalanceService`) | **PRIMARY** — enforce toàn bộ BR-OB-*/BR-OB-EDIT-*/BR-OB-DEL-* (CORNERSTONE per domain SSOT), commit atomicity (all-or-nothing), cascade sổ tồn, cross-entity validation | Tất cả BR-OB-*, BR-OB-EDIT-*, BR-OB-DEL-*, CB-OB-001 |
| Cross-boundary REST client (`gfAccountingClient`, ADR-021) | **PRIMARY cho lock-check** — advisory ở verify-import (fail-OPEN + marker), authoritative ở commit-path (import/edit/delete — fail-CLOSED) | BR-OB-013, BR-OB-EDIT-002, BR-OB-DEL-002, CB-OB-002 |
| Engine sổ tồn chung (`StockLedgerRecomputeService`, ADR-020 M1/M2) | **PRIMARY cho invariant tồn ≥ 0** — cascade forward + reject `NegativeStock` | BR-OB-015, BR-OB-EDIT-003, BR-OB-DEL-003 |
| REST adapter (`adapter/controller` — `OpeningBalanceController`) | Secondary — validate DTO shape trước khi vào domain; map lỗi thành HTTP response | BR-OB-001/003/008/009/011, BR-OB-EDIT-006 |
| DB-level (Flyway schema) | Hard constraint — unique `(tenant_id, product_code, warehouse_code)`, FK scalar | BR-OB-012 (unique index backup), tenant isolation cột `tenant_id` mọi bảng |
| BFF (`agg-garage-graph`) | Defense-in-depth — cap 500-row import (input validator mutation), `@FeatureOn(Inventory:InventoryV2)` gate, error-code passthrough | BR-OB-004b |
| UI (garage-web) | Secondary — nút "Xác nhận" disabled khi có dòng lỗi, banner INFO empty-file, popup "Không thể xóa", ĐVT field readonly | BR-OB-004a (FE gate), BR-OB-004b (Empty-file semantic), BR-OB-EDIT-001 (ĐVT readonly display) |

### 3.2 Chi tiết enforcement per rule

#### Cross-boundary

| Rule | Primary layer | Cơ chế |
|---|---|---|
| CB-OB-001 | Domain | `gf-inventory` tự dùng `opening_balance_line` + `internal_product` + `warehouse` cho engine sổ tồn + xuất kho + báo cáo — không cần cross-boundary call. |
| CB-OB-002 | Domain + Cross-boundary REST advisory (ADR-021) | "Tồn đến ngày" mỗi dòng → gọi `gfAccountingClient.lockCheck(date)` (`GET /protected/v1/accounting-periods/lock-check`) để suy ra kỳ liên quan gián tiếp; `periodId=null` (không thuộc kỳ nào) → `locked=false` → cho phép. |

#### Tồn đầu kỳ (import)

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-OB-001 | REST adapter (DTO) + Domain (persist) | `OpeningBalanceLine` (7 field nghiệp vụ) map từ raw row JSON body (FE-parsed, ADR-022) → resolve `product_id`/`warehouse_id`/`unit_code`. |
| BR-OB-002 | Domain | Không có field `accounting_period_id` trên `opening_balance_line` — liên hệ kỳ chỉ suy ra qua `snapshot_date` tại thời điểm lock-check, không lưu trực tiếp. |
| BR-OB-003 | REST adapter | DTO chỉ nhận `stock_quantity` + `stock_value`; không có field đơn giá riêng trong request/response contract. |
| BR-OB-004 | Domain + ADR-022 wizard | `POST /protected/inventory/v1/opening-balances/import` (W04-4) chỉ INSERT — không có update-path; luôn qua `verify-import` (W04-3) trước; FE parse `.xlsx` browser-side (SheetJS), BE chỉ nhận JSON body (KHÔNG multipart binary). |
| **BR-OB-004a** | **Domain — `OpeningBalanceService.importOpeningBalances()` `@Transactional`** | Single JPA transaction wrap toàn bộ N rows (≤ 500). Re-validate mọi dòng bên trong tx (defense-in-depth); ≥ 1 lỗi (bất kỳ BR-OB-005..016) → throw `AllOrNothingImportException` → **rollback toàn bộ transaction** → response liệt kê dòng lỗi, **KHÔNG có row nào được ghi**. FE secondary gate: nút "Xác nhận" **disabled** khi `errorRows.length > 0` (client-side, chỉ UX — server luôn re-check authoritative). |
| **BR-OB-004b** | **3-tầng defense-in-depth (FE + BFF + BE)** | FE: đếm dòng khi SheetJS parse → reject ngay client-side nếu > 500 (trước khi gọi verify-import). BFF: input validator của mutation `verifyImportOpeningBalances`/`importOpeningBalances` re-check `items.length > 500`. BE: `POST /verify-import` (W04-3) VÀ `POST /import` (W04-4) đều re-check row count → `ERR-INV-048` nếu bypass. **Phân biệt 3 nhánh ngữ nghĩa riêng** (ADR-022): (a) extension mismatch (`.xlsx` sai) → FE reject với message thân thiện, không có mã lỗi Product-registered (bypass → BE `HTTP 400 ERR-CMN-validation`); (b) > 500 dòng → `ERR-INV-048`; (c) **file rỗng (0 dòng dữ liệu)** → **KHÔNG throw mã lỗi** — cho qua verify-import, BE trả `{totalRows: 0, validRows: 0, errorRows: 0, canCommit: false}` (công thức `canCommit = (totalRows > 0 AND errorRows == 0)`), FE render banner **INFO** "File không có dữ liệu, không có gì để import" (KHÔNG phải error) + nút "Xác nhận" **disabled** vì `canCommit=false`. |
| BR-OB-005 | Domain | Resolve `warehouseName` (từ file) → `warehouse.id` qua lookup theo tên (garage-scoped); không khớp → `ERR-INV-020`. |
| BR-OB-006 | Domain | Resolve `productCode` → `internal_product.id`; không tồn tại (tenant-scoped) → `ERR-INV-009`. |
| BR-OB-007 | Domain | Check `internal_product.status = INACTIVE` → `ERR-INV-010`. |
| BR-OB-008 | REST adapter + Domain | `stock_quantity > 0` — vi phạm → `ERR-INV-032`. |
| BR-OB-009 | REST adapter + Domain | `stock_value ≥ 0` (cho = 0 hoặc null) — vi phạm → `ERR-INV-033`. |
| **BR-OB-010** | **Domain — server-side enforce, KHÔNG lấy ĐVT ghi từ file** | `uom_id` được ghi vào `opening_balance_line.unit_code` = **`internal_product.main_unit_code`** (ĐVT chính, server tự set) — cột ĐVT trong file **chỉ dùng để validate khớp** với ĐVT chính, không dùng để ghi. Không khớp (kể cả ĐVT quy đổi hợp lệ của mã sản phẩm) → `ERR-INV-019`. |
| BR-OB-011 | REST adapter | `@NotBlank`/required-field check per dòng → `ERR-INV-017`; date-parse `"Tồn đến ngày"` theo format chuẩn → sai → `ERR-INV-018`. |
| BR-OB-012 | Domain + DB | In-memory `Set<(productCode, warehouseCode)>` check trong-file (duplicate cùng file) + query `opening_balance_line WHERE tenant_id=? AND product_code=? AND warehouse_code=?` (đã có OB) → **CHẶN**, `ERR-INV-034`. DB backup: `UNIQUE (tenant_id, product_code, warehouse_code)`. |
| **BR-OB-013** | **Domain + Cross-boundary (ADR-021)** | Verify-import (W04-3): lock-check advisory per ngày distinct trong file → mark dòng `ERR-INV-024` nếu `locked=true`. Import (W04-4, authoritative): re-check lock-check bên trong transaction cho mọi ngày trong batch → **1 ngày `locked=true`** → throw → **rollback toàn bộ** (tự động thỏa mãn all-or-nothing). `periodId=null` (không thuộc kỳ nào) → `locked=false` → cho import. |
| BR-OB-014 | Domain | Mọi query `WHERE tenant_id = TenantContext.getCurrentTenantId()`; `LIKE '%{keyword}%'` trên mã/tên; filter `warehouseId`/`createdBy`/`importedFrom..importedTo`; `ORDER BY created_at DESC` (mặc định); aggregate `SUM(quantity)`/`SUM(value)` server-side (`PagedOpeningBalanceData.aggregates`). |
| **BR-OB-015** | **Engine sổ tồn (`StockLedgerRecomputeService.recompute()`, ADR-020 M1/M2)** | Sau khi resolve dòng OB hợp lệ (per rule khác), engine chạy cascade forward từ `fromDate = snapshot_date` — invariant `closing_qty ≥ 0` tại mọi ngày N trong chain cascade; vi phạm → exception category `NegativeStock` (carrier: `productCode`/`warehouseCode`/`offendingDate`/`currentClosing`/`attemptedDelta`) → map `ERR-INV-036` → rollback transaction gốc (import/edit/delete). |
| BR-OB-016 | Domain | Query phiếu nhập/xuất `status IN (COMPLETED, REVERSED)` (bỏ Cancelled + Nháp) của (mã+kho) → `MIN(transaction_date)`; `snapshot_date ≥ minTransactionDate` → `ERR-INV-035`. |

#### Sửa dòng tồn đầu kỳ (edit)

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-OB-EDIT-001 | REST adapter (DTO) + Domain | `PUT /protected/inventory/v1/opening-balances/{id}` — 5 field editable (`productCode`, `warehouseId`, `quantity`, `snapshotDate`, `value`); `unitCode` **auto-derived server-side** từ `internal_product.main_unit_code` theo `productCode` mới (readonly, client KHÔNG gửi — api.md v44 clarify). Id không tồn tại → HTTP 404 (global handler, không có mã ERR-INV riêng). |
| **BR-OB-EDIT-002** | **Cross-boundary (ADR-021), fail-CLOSED** | Lock-check **cả ngày cũ VÀ ngày mới** (nếu `snapshotDate` đổi) trong cùng transaction → `locked=true` bất kỳ ngày nào → `ERR-INV-024`, rollback. |
| BR-OB-EDIT-003 | Engine sổ tồn (ADR-020 M1) | `recompute()` invariant check cho combo (mã+kho) mới (và combo cũ nếu đổi mã/kho) → `NegativeStock` → `ERR-INV-036`. |
| BR-OB-EDIT-004 | Domain | Check `snapshotDate` mới ≥ `MIN(transaction_date)` phiếu đã ghi sổ của (mã+kho) mới → `ERR-INV-035`. |
| BR-OB-EDIT-005 | Domain + DB | Query `opening_balance_line WHERE tenant_id=? AND product_code=? AND warehouse_code=? AND id != :currentId` → tồn tại → `ERR-INV-034`. |
| BR-OB-EDIT-006 | REST adapter + Domain | Mirror BR-OB-006/007/005/008/009/011 cho edit path — cùng mã lỗi (`ERR-INV-010`/`020`/`032`/`033`/required-field). |

#### Xóa dòng tồn đầu kỳ (delete)

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-OB-DEL-001 | REST adapter | `POST /protected/inventory/v1/opening-balances/delete-lines` (W04-7) nhận `ids: [Int!]!`; đơn lẻ có `DELETE /opening-balances/{id}` (W04-6). |
| BR-OB-DEL-002 | Cross-boundary (ADR-021), fail-CLOSED | Lock-check `snapshotDate` của dòng OB cần xóa → `locked=true` → `ERR-INV-024`. |
| BR-OB-DEL-003 | Engine sổ tồn (ADR-020 M1, reverse delta) | `recompute()` với dòng OB đã reverse (loại bỏ khỏi nguồn) — invariant `closing_qty ≥ 0` vi phạm → `ERR-INV-036`. Không có điều kiện phụ "có phiếu xuất hay không" — chỉ xét kết quả tồn cuối. |
| BR-OB-DEL-004 | Domain — 1 transaction cho cả batch | Toàn bộ `ids[]` validate trước khi bất kỳ `DELETE` nào chạy; ≥ 1 id vi phạm → **không xóa id nào** (rollback / short-circuit trước khi ghi). |
| **BR-OB-DEL-005** | **Domain — fail-fast theo thứ tự `ids[]`** | Duyệt `ids[]` theo **đúng thứ tự client gửi**; với mỗi id: check `ERR-INV-024` (kỳ đóng) **TRƯỚC** → nếu pass, check `ERR-INV-036` (tồn âm) **SAU**. Dừng ngay tại **id đầu tiên vi phạm** (không tiếp tục check các id còn lại) → response `{errorCode, offendingIds: [<id đầu>]}`. Endpoint W04-7 (`deleteOpeningBalanceLines` BFF) mirror ngữ nghĩa fail-fast này 1-1. |

#### Audit & Phân quyền

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-OB-CMN-001 | Domain | `imported_by` (userId từ auth context) + `imported_at` (server timestamp) + `source_filename` + `source_checksum` (SHA-256 nội dung file) auto-fill tại service layer khi commit import; hiển thị lại qua cột "Người import"/"Ngày import" ở `FEAT-OB-LIST`. |
| BR-OB-CMN-002 | REST adapter / BFF | Endpoint auth scope `authenticated` — cả `garage-owner` + `accountant` đều pass; không phân biệt role tại endpoint level (Critical Rule #6 dual persona). |

### 3.3 DB-level constraints (Flyway `V{N+1}__inventory_v2_ob_ledger.sql`)

**Table `opening_balance_line`**:

| Constraint | Detail |
|---|---|
| PK | `id UUID` |
| NOT NULL | `tenant_id, garage_id, warehouse_code, product_id, product_code, unit_code, quantity, snapshot_date, created_by, created_at` |
| UNIQUE | `uk_opening_balance_tenant_product_warehouse(tenant_id, product_code, warehouse_code)` — enforce BR-OB-012 ở tầng DB (backup cho pre-check tại domain) |
| FK scalar | `product_id UUID` (ADR-009 — KHÔNG `@ManyToOne`, chỉ scalar FK tới `internal_product.id`) |
| DEFAULT | `value = 0` khi client gửi `null` (BR-OB-009) |
| Audit | `import_batch_id`, `created_by`, `created_at` |

**Table `inventory_stock_ledger`** (ADR-020 v4):

| Constraint | Detail |
|---|---|
| PK | `id UUID` |
| NOT NULL | `tenant_id, garage_id, warehouse_code, product_code, movement_date, updated_at, origin_context` |
| Row semantics | 1 row cho mỗi `(tenant_id, product_code, warehouse_code, movement_date)` **có biến động** — dense-fill KHÔNG áp dụng (§Alternatives A2 rejected). |
| ENUM | `origin_context` — `OB_IMPORT`/`OB_EDIT`/`OB_DELETE` active tại W04 (3/7 giá trị; 4 giá trị còn lại `SLIP_*`/`BQGQ_RECOMPUTE` là W05/W06 stub). |
| Index | `(tenant_id, product_code, warehouse_code, movement_date DESC)` — phục vụ query point-in-time `ORDER BY ... DESC LIMIT 1`. |

---

## §4 Test Ideas

### TC-BR-GF-INV-OB — Cross-boundary

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-OB-CB1-01 | CB-OB-001 | Import OB thành công → verify bảng `opening_balance_line` ghi đúng boundary `gf-inventory`, không phát sinh cross-boundary write | Happy | Row persisted; không có REST call ghi tới boundary khác |
| TC-BR-GF-INV-OB-CB2-01 | CB-OB-002 | Import dòng có "Tồn đến ngày" thuộc kỳ CLOSED bên `gf-accounting` | Violation | `ERR-INV-024`, lock-check REST call ghi nhận trong log |
| TC-BR-GF-INV-OB-CB2-02 | CB-OB-002 | Import dòng có ngày không thuộc kỳ nào (`periodId=null`) | Happy | `locked=false` → cho import |

### TC-BR-GF-INV-OB — Tồn đầu kỳ (import)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-OB-001-01 | BR-OB-001 | Import 1 dòng đủ 7 field | Happy | Row `opening_balance_line` khớp field mapping |
| TC-BR-GF-INV-OB-002-01 | BR-OB-002 | Verify OB không có field `accounting_period_id` trong schema/response | Happy | Response không chứa field kỳ trực tiếp |
| TC-BR-GF-INV-OB-003-01 | BR-OB-003 | Gửi request kèm field `unitPrice` lạ | Violation | Field bị ignore (không có trong DTO); persist vẫn đúng `quantity`/`value` |
| TC-BR-GF-INV-OB-004-01 | BR-OB-004 | Gọi `import` mà chưa gọi `verify-import` trước | Edge | Vẫn re-validate lại toàn bộ tại BE (idempotency + defense-in-depth) — không bypass |
| **TC-BR-GF-INV-OB-004A-01** | **BR-OB-004a** | File 100 dòng, 1 dòng lỗi (`ERR-INV-019` ĐVT lệch), 99 dòng hợp lệ → confirm | **Violation** | HTTP 4xx, **0 dòng nào được ghi** (rollback toàn bộ); response liệt kê dòng lỗi |
| TC-BR-GF-INV-OB-004A-02 | BR-OB-004a | File 100 dòng, toàn bộ hợp lệ → confirm | Happy | 100 dòng committed trong 1 transaction; cascade sổ tồn chạy cho từng (mã+kho) distinct |
| TC-BR-GF-INV-OB-004A-03 | BR-OB-004a | FE: sau verify có `errorRows > 0` → kiểm tra nút "Xác nhận" | UI Guard | Nút disabled; user không click được vào commit path |
| **TC-BR-GF-INV-OB-004B-01** | **BR-OB-004b** | File 501 dòng dữ liệu → `verify-import` | **Violation** | `ERR-INV-048`, không parse rows, không ghi dòng nào |
| TC-BR-GF-INV-OB-004B-02 | BR-OB-004b | File 500 dòng dữ liệu (đúng cap) | Happy | Xử lý bình thường qua verify + import |
| TC-BR-GF-INV-OB-004B-03 | BR-OB-004b | File extension `.csv` (không phải `.xlsx`) | Violation | FE reject trước khi gọi BE; nếu bypass → BE `HTTP 400 ERR-CMN-validation` (KHÔNG dùng `ERR-INV-048`) |
| **TC-BR-GF-INV-OB-004B-04** | **BR-OB-004b (empty-file semantic)** | File `.xlsx` hợp lệ, chỉ có header, **0 dòng dữ liệu** → `verify-import` | **Edge** | HTTP 200, response `{totalRows: 0, validRows: 0, errorRows: 0, canCommit: false}` — **KHÔNG throw mã lỗi**; FE render banner **INFO** "File không có dữ liệu, không có gì để import" + nút "Xác nhận" disabled |
| TC-BR-GF-INV-OB-004B-05 | BR-OB-004b | Cap 500 bị bypass ở FE/BFF (giả lập gọi thẳng BE với 600 dòng JSON) | Violation | BE endpoint verify-import + import đều re-check độc lập → `ERR-INV-048` |
| TC-BR-GF-INV-OB-005-01 | BR-OB-005 | Cột "Kho" ghi tên không khớp danh mục garage | Violation | Dòng mark `ERR-INV-020` |
| TC-BR-GF-INV-OB-006-01 | BR-OB-006 | Mã sản phẩm nội bộ không tồn tại trong garage | Violation | Dòng mark `ERR-INV-009` |
| TC-BR-GF-INV-OB-007-01 | BR-OB-007 | Mã sản phẩm ở trạng thái "Ngừng hoạt động" | Violation | Dòng mark `ERR-INV-010` |
| TC-BR-GF-INV-OB-008-01 | BR-OB-008 | Số lượng tồn = 0 | Violation | Dòng mark `ERR-INV-032` |
| TC-BR-GF-INV-OB-008-02 | BR-OB-008 | Số lượng tồn > 0 (số lẻ hợp lệ) | Happy | Dòng "Hợp lệ" |
| TC-BR-GF-INV-OB-009-01 | BR-OB-009 | Giá trị tồn = -1 | Violation | Dòng mark `ERR-INV-033` |
| TC-BR-GF-INV-OB-009-02 | BR-OB-009 | Giá trị tồn để trống | Happy | Dòng "Hợp lệ", `value` default 0 |
| **TC-BR-GF-INV-OB-010-01** | **BR-OB-010** | ĐVT trong file = "Lít", ĐVT chính của mã sản phẩm = "Cái" | **Violation** | Dòng mark `ERR-INV-019` |
| TC-BR-GF-INV-OB-010-02 | BR-OB-010 | ĐVT trong file = tên ĐVT quy đổi hợp lệ của mã sản phẩm (không phải ĐVT chính) | Violation | Vẫn mark `ERR-INV-019` (chỉ chấp nhận đúng ĐVT chính, kể cả ĐVT quy đổi cũng lỗi) |
| TC-BR-GF-INV-OB-010-03 | BR-OB-010 | ĐVT trong file khớp đúng ĐVT chính | Happy | Dòng "Hợp lệ"; `unit_code` ghi = `internal_product.main_unit_code` (server-derived, không lấy trực tiếp từ file) |
| TC-BR-GF-INV-OB-011-01 | BR-OB-011 | Thiếu cột "Mã nội bộ" ở 1 dòng | Violation | `ERR-INV-017` |
| TC-BR-GF-INV-OB-011-02 | BR-OB-011 | "Tồn đến ngày" ghi sai format (vd `32/13/2026`) | Violation | `ERR-INV-018` |
| TC-BR-GF-INV-OB-012-01 | BR-OB-012 | 2 dòng cùng file, cùng (mã+kho) | Violation | Cả 2 dòng mark `ERR-INV-034` |
| TC-BR-GF-INV-OB-012-02 | BR-OB-012 | Dòng (mã+kho) đã có OB từ lần import trước | Violation | `ERR-INV-034` |
| TC-BR-GF-INV-OB-013-01 | BR-OB-013 | Dòng có "Tồn đến ngày" thuộc kỳ CLOSED | Violation | `ERR-INV-024` (verify: advisory mark row; import: authoritative rollback) |
| TC-BR-GF-INV-OB-013-02 | BR-OB-013 | Dòng có ngày không thuộc kỳ nào (garage chưa lập kỳ) | Happy | Cho import bình thường |
| TC-BR-GF-INV-OB-013-03 | BR-OB-013 | Race: verify pass → admin đóng kỳ giữa chừng → confirm import | Multi-step | `import` re-check lock-check → `ERR-INV-024` → rollback → gợi ý "verify lại" |
| TC-BR-GF-INV-OB-014-01 | BR-OB-014 | Tenant A search — không thấy dòng OB tenant B | Tenant isolation | Response chỉ chứa dòng tenant A |
| TC-BR-GF-INV-OB-014-02 | BR-OB-014 | Filter theo Kho + Người import + khoảng Ngày import | Happy | Kết quả khớp cả 3 filter kết hợp |
| TC-BR-GF-INV-OB-015-01 | BR-OB-015 | Import OB cho (mã+kho) đã có phiếu xuất trước đó, chèn vào giữa làm 1 ngày trong chain có `closing_qty < 0` | Violation | `ERR-INV-036`, rollback |
| TC-BR-GF-INV-OB-015-02 | BR-OB-015 | Import OB không ảnh hưởng tồn âm bất kỳ ngày nào | Happy | Import thành công, cascade update ledger |
| TC-BR-GF-INV-OB-016-01 | BR-OB-016 | "Tồn đến ngày" = cùng ngày với phiếu nhập đã ghi sổ của (mã+kho) | Violation | `ERR-INV-035` |
| TC-BR-GF-INV-OB-016-02 | BR-OB-016 | "Tồn đến ngày" trước phiếu Nháp (chưa ghi sổ) của (mã+kho) | Happy | Cho import (phiếu Nháp không tính) |
| TC-BR-GF-INV-OB-016-03 | BR-OB-016 | "Tồn đến ngày" ở tương lai (> ngày hiện tại), không có phiếu nào | Happy | Cho import (không chặn theo ngày tương lai) |

### TC-BR-GF-INV-OB — Sửa dòng (edit)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-OB-EDIT-001-01 | BR-OB-EDIT-001 | Mở form sửa → verify 6 field đổ sẵn dữ liệu, ĐVT readonly | Happy | Form hiển thị đúng; field ĐVT disabled |
| TC-BR-GF-INV-OB-EDIT-002-01 | BR-OB-EDIT-002 | Sửa SL (giữ nguyên ngày cũ) khi ngày cũ thuộc kỳ CLOSED | Violation | `ERR-INV-024` (chặn dù chỉ sửa SL — ngày chứng từ vẫn thuộc kỳ đóng) |
| TC-BR-GF-INV-OB-EDIT-002-02 | BR-OB-EDIT-002 | Đổi "Tồn đến ngày" sang ngày thuộc kỳ CLOSED | Violation | `ERR-INV-024` |
| TC-BR-GF-INV-OB-EDIT-003-01 | BR-OB-EDIT-003 | Giảm SL tồn khiến (mã+kho) âm ở ngày sau (do có phiếu xuất phụ thuộc) | Violation | `ERR-INV-036` |
| TC-BR-GF-INV-OB-EDIT-004-01 | BR-OB-EDIT-004 | Đổi "Tồn đến ngày" sang sau ngày phiếu đã ghi sổ | Violation | `ERR-INV-035` |
| TC-BR-GF-INV-OB-EDIT-005-01 | BR-OB-EDIT-005 | Đổi (mã+kho) trùng dòng OB khác đã tồn tại | Violation | `ERR-INV-034` |
| TC-BR-GF-INV-OB-EDIT-006-01 | BR-OB-EDIT-006 | Chọn sản phẩm "Ngừng hoạt động" | Violation | `ERR-INV-010` |
| TC-BR-GF-INV-OB-EDIT-006-02 | BR-OB-EDIT-006 | Sửa thành công, không vi phạm guardrail nào | Happy | Lưu thành công + cascade sổ tồn + quay về danh sách |
| TC-BR-GF-INV-OB-EDIT-EC7-01 | (EC-7 FEAT-OB-EDIT) | Phiên khác đã xóa dòng OB trước khi user bấm Lưu | Multi-step | Lỗi "Dòng không tồn tại" (HTTP 404 global handler), quay về danh sách |

### TC-BR-GF-INV-OB — Xóa dòng (delete-lines)

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-OB-DEL-001-01 | BR-OB-DEL-001 | Chọn 3 dòng hợp lệ → xóa | Happy | Cả 3 dòng bị xóa, danh sách + dòng Tổng cập nhật |
| TC-BR-GF-INV-OB-DEL-002-01 | BR-OB-DEL-002 | Xóa dòng có "Tồn đến ngày" thuộc kỳ CLOSED | Violation | `ERR-INV-024`, popup "Không thể xóa" |
| TC-BR-GF-INV-OB-DEL-003-01 | BR-OB-DEL-003 | Xóa dòng làm tồn (mã+kho) < 0 | Violation | `ERR-INV-036` |
| TC-BR-GF-INV-OB-DEL-003-02 | BR-OB-DEL-003 | Xóa dòng đã dùng cho phiếu xuất nhưng có phiếu nhập bù đủ (tồn sau xóa vẫn ≥ 0) | Happy | Cho xóa (không chặn chỉ vì "có phiếu xuất") |
| TC-BR-GF-INV-OB-DEL-004-01 | BR-OB-DEL-004 | Chọn 5 dòng, 1 dòng vi phạm (kỳ đóng) | Violation | Chặn cả 5 dòng — **0 dòng bị xóa** (all-or-nothing per batch) |
| **TC-BR-GF-INV-OB-DEL-005-01** | **BR-OB-DEL-005** | 1 dòng vi phạm CẢ 2 điều kiện (kỳ đóng + sẽ làm tồn âm) | **Violation** | Response chỉ báo **`ERR-INV-024`** (kỳ đóng, ưu tiên trước) — **KHÔNG** báo thêm `ERR-INV-036` cho dòng đó |
| TC-BR-GF-INV-OB-DEL-005-02 | BR-OB-DEL-005 | 2 dòng chọn: dòng A chỉ vi phạm tồn âm, dòng B chỉ vi phạm kỳ đóng | Violation | Popup gộp 1 lần báo cả 2 dòng vi phạm — không tách riêng theo mã lỗi |
| TC-BR-GF-INV-OB-DEL-EC2-01 | (EC-2 FEAT-OB-DELETE-LINES) | Dòng đủ điều kiện xóa lúc chọn, nhưng phiên khác vừa đóng kỳ trước khi user bấm "Xóa" | Multi-step | Re-check tại thời điểm xóa → chuyển sang popup "Không thể xóa" |

### TC-BR-GF-INV-OB — Audit & Phân quyền

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-GF-INV-OB-CMN-001-01 | BR-OB-CMN-001 | Import thành công → verify `imported_by` + `imported_at` + checksum | Happy | Field audit đúng user hiện tại + timestamp server; hiển thị lại ở FEAT-OB-LIST |
| TC-BR-GF-INV-OB-CMN-002-01 | BR-OB-CMN-002 | `accountant` thực hiện import/edit/delete | Permission | Full CRUD thành công — không bị 403 |
| TC-BR-GF-INV-OB-CMN-002-02 | BR-OB-CMN-002 | `garage-owner` thực hiện import/edit/delete | Permission | Full CRUD thành công — quyền ngang `accountant` |

---

## §5 BR → FEAT → AC Mapping

### FEAT-OB-LIST (v9)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| CB-OB-001 | Toàn bộ AC | Data ownership `gf-inventory` cho list scope |
| BR-OB-001 | AC-2 [web], AC-2b [mobile] | Cột hiển thị / card field khớp cấu trúc dòng OB |
| BR-OB-014 | AC-3/AC-3b [web], AC-3b-mobile [mobile], AC-4/AC-4b, AC-5/AC-5b/AC-5c, AC-9 [cross-platform] | Tenant isolation, search LIKE, filter Kho/Người import/Ngày import, dòng Tổng server-side aggregate |
| BR-OB-CMN-001 | AC-2 [web] (cột "Người import" + "Ngày import") | Audit hiển thị |
| BR-OB-CMN-002 | AC-9 [cross-platform] | Quyền ngang nhau; mobile cả 2 role view-only |

### FEAT-OB-IMPORT (v20)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-OB-001/002/003 | AC-2 | Template `.xlsx` cấu trúc cột đúng data shape |
| BR-OB-004 | AC-1, AC-3 | Single-page import, chỉ thêm mới, nhiều kho/file |
| **BR-OB-004a** | **AC-6** | All-or-nothing — nút "Xác nhận" disabled khi có dòng lỗi; response chặn cả file |
| **BR-OB-004b** | **AC-3b** | Kiểm tra cấp file: extension, file rỗng (banner INFO, KHÔNG lỗi), cap 500 (`ERR-INV-048`) |
| BR-OB-005 | AC-5 | Kho không tồn tại → `ERR-INV-020` |
| BR-OB-006 | AC-5 | Mã không tồn tại → `ERR-INV-009` |
| BR-OB-007 | AC-5 | Ngừng hoạt động → `ERR-INV-010` |
| BR-OB-008 | AC-5 | SL ≤ 0 → `ERR-INV-032` |
| BR-OB-009 | AC-5 | GT < 0 → `ERR-INV-033` |
| **BR-OB-010** | **AC-5, AC-6(b)** | ĐVT lệch → `ERR-INV-019`; AC-6(b) server enforce `uom_id` = ĐVT chính (không lấy từ file để ghi) |
| BR-OB-011 | AC-5 | Thiếu trường (`ERR-INV-017`) / sai ngày (`ERR-INV-018`) |
| BR-OB-012 | AC-5, AC-6 | Trùng (mã+kho) → `ERR-INV-034`, chặn ghi |
| BR-OB-013 | AC-5 | Kỳ đã đóng → `ERR-INV-024` |
| BR-OB-015 | AC-5 | Chèn OB làm tồn âm → `ERR-INV-036` |
| BR-OB-016 | AC-5 | OB sau/cùng ngày phiếu → `ERR-INV-035` |
| Cascade (BR-STKV2-001) | AC-6 | Trigger engine sổ tồn sau commit; rollback nếu cascade fail |
| BR-OB-CMN-001 | AC-6(b), AC-8 | Audit fields ghi tại commit; toast thành công |
| BR-OB-CMN-002 | AC-9 | Phân quyền ngang nhau |

### FEAT-OB-EDIT (v5)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-OB-001 | AC-2 | 6 trường form |
| BR-OB-EDIT-001 | AC-1, AC-2 | Mở form + hiển thị dữ liệu hiện tại |
| BR-OB-EDIT-002 | AC-5 | Kỳ đóng (ngày mới hoặc cũ) → `ERR-INV-024` (kể cả EC-8 chỉ sửa SL) |
| BR-OB-EDIT-003 | AC-6 | Tồn âm point-in-time → `ERR-INV-036` |
| BR-OB-EDIT-004 | AC-7 | OB sau phiếu → `ERR-INV-035` |
| BR-OB-EDIT-005 | AC-8 | Trùng (mã+kho) → `ERR-INV-034` |
| BR-OB-EDIT-006 | AC-9 | Validate trường bắt buộc + giá trị |
| Cascade (BR-STKV2-001) | AC-3 | Tính lại sổ tồn sau lưu thành công |
| BR-OB-CMN-002 | AC-10 | Quyền ngang nhau |

### FEAT-OB-DELETE-LINES (v7)

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-OB-DEL-001 | AC-1 | Checkbox + nút "Xóa dòng đã chọn" |
| BR-OB-DEL-002 | AC-4 | Kỳ đóng → `ERR-INV-024` |
| BR-OB-DEL-003 | AC-4, AC-5 | Tồn âm → `ERR-INV-036`; AC-5 làm rõ "không chặn chỉ vì có phiếu xuất" |
| BR-OB-DEL-004 | AC-4 | Chặn cả lô khi có dòng vi phạm |
| **BR-OB-DEL-005** | **AC-4** | Thứ tự bắn mã lỗi: kỳ đóng trước, tồn âm sau |
| Cascade (BR-STKV2-001) | AC-2 | Tính lại sổ tồn sau xóa thành công (EC-3) |
| BR-OB-CMN-002 | AC-6 | Quyền ngang nhau |

---

## §6 Error Code Mapping

> Nguồn canonical: `Product/error-code/ERROR-CODE-REGISTRY.md`. File này liệt kê mã áp dụng cho 4 FEAT trong W04 (nhóm OB).

| Code | HTTP | Display mode | Message (vi) | Trigger |
|---|---|---|---|---|
| `ERR-INV-009` | — (verify) / 4xx (commit) | INLINE_ROW (preview) → block toàn file (commit) | "Mã sản phẩm nội bộ không tồn tại" | BR-OB-006 |
| `ERR-INV-010` | — / 4xx | INLINE_ROW → block | "Mã sản phẩm ngừng hoạt động" | BR-OB-007, BR-OB-EDIT-006 |
| `ERR-INV-017` | — / 4xx | INLINE_ROW → block | "Thiếu trường bắt buộc" | BR-OB-011 |
| `ERR-INV-018` | — / 4xx | INLINE_ROW → block | "Sai định dạng ngày" | BR-OB-011 |
| `ERR-INV-019` | — / 4xx | INLINE_ROW → block | "ĐVT trong file khác ĐVT chính" | BR-OB-010 |
| `ERR-INV-020` | — / 4xx | INLINE_ROW → block / INLINE_FORM (edit) | "Kho không tồn tại" | BR-OB-005, BR-OB-EDIT-006 |
| `ERR-INV-024` | — (verify advisory) / 400 (commit authoritative) | INLINE_ROW (verify) / TOAST hoặc DIALOG (commit + delete popup) / INLINE_FORM (edit) | "Tồn đến ngày thuộc kỳ kế toán đã đóng" | BR-OB-013, BR-OB-EDIT-002, BR-OB-DEL-002 |
| `ERR-INV-032` | — / 4xx | INLINE_ROW → block / INLINE_FORM (edit) | "Số lượng tồn phải > 0" | BR-OB-008, BR-OB-EDIT-006 |
| `ERR-INV-033` | — / 4xx | INLINE_ROW → block / INLINE_FORM (edit) | "Giá trị tồn không được < 0" | BR-OB-009, BR-OB-EDIT-006 |
| `ERR-INV-034` | — / 4xx | INLINE_ROW → block / INLINE_FORM (edit) | "OB đã tồn tại cho (mã+kho) này" | BR-OB-012, BR-OB-EDIT-005 |
| `ERR-INV-035` | — / 4xx | INLINE_ROW → block / INLINE_FORM (edit) | "Tồn đến ngày sau/cùng ngày phiếu đã ghi sổ" | BR-OB-016, BR-OB-EDIT-004 |
| `ERR-INV-036` | — / 400 | INLINE_ROW (verify) / DIALOG (delete popup "Không thể xóa") / INLINE_FORM (edit) | "Xóa/sửa/import làm tồn kho xuống âm" | BR-OB-015, BR-OB-EDIT-003, BR-OB-DEL-003 |
| `ERR-INV-048` | 4xx (verify + import cùng check) | TOAST | "Vượt giới hạn 500 dòng/lần import tồn đầu kỳ — vui lòng tách file thành nhiều lần" | BR-OB-004b |
| `ERR-CMN-007` | 503 | TOAST (platform-wide) | "Hệ thống đang bận, vui lòng thử lại sau" | `gf-accounting` unreachable — ADR-021 fail-CLOSED (commit-path import/edit/delete) |

**Empty-file semantic (BR-OB-004b)**: `verify-import` với 0 dòng dữ liệu trả `canCommit=false` — **KHÔNG có mã lỗi đăng ký** cho case này; hiển thị bằng banner **INFO** riêng biệt (không dùng `ERR-INV-048` hay bất kỳ mã ERR-INV nào).

**Delete-lines fail-fast (BR-OB-DEL-005)**: response `{errorCode, offendingIds: [<id đầu tiên vi phạm>]}` — chỉ **1 mã lỗi** trong `errorCode` (một trong `ERR-INV-024`/`ERR-INV-036`, ưu tiên `ERR-INV-024`) dù nhiều dòng vi phạm khác nhau trong batch được gom vào popup 1 lần báo.

---

## §7 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W04-BR-001 | **`source_sha` chưa được compute**: agent-execution-spec-author spawn này không có shell tool để chạy `sha256sum` trên `Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` v13. Orchestrator/CI cần tính lại + điền frontmatter `source_sha` trước khi bump DRAFT → ACTIVE. | BLOCKING cho ACTIVE — không block DEV Stage |
| OI-W04-BR-002 | **`ERR-INV-049` (server-side 5xx cross-cutting) đã bị revert khỏi Product FEAT** (`FEAT-OB-IMPORT` v19→v20, `FEAT-OB-EDIT` v3→v4) — hành vi "Hệ thống đang bận, vui lòng thử lại sau" cho lỗi 5xx/network/DB-deadlock/cascade-fail generic sẽ do Architecture ghi vào HLD/ADR/global error policy riêng, **KHÔNG** thuộc phạm vi BR execution spec này. `ERR-CMN-007` (503, ADR-021 lock-check unavailable) là case **cụ thể** khác, đã cover ở §6. | INFO — DEV không tìm nhầm case generic 5xx trong BR này |
| OI-W04-BR-003 | **FEAT-OB-LIST v7/v8/v9 mobile AC (AC-1b, AC-2b, AC-3b-mobile, AC-4b, AC-5b, AC-5c, AC-6b)** đang gắn nhãn "pending BA/PO acknowledge" trong changelog nguồn — không block DEV W04 (mobile scope FEAT-OB-LIST là read-only list, không có write-path BR nào bị ảnh hưởng), nhưng theo dõi để BA/PO xác nhận trước GA. | LOW — theo dõi, không block W04 |
| OI-W04-BR-004 | **Ordered lock acquisition (ADR-020 C6)** cho batch M2 (`OB import 500 rows`, `delete-lines N rows`, `edit swap OLD/NEW combo`) sort theo `(productCode ASC, warehouseCode ASC)` — **khác** với `BR-OB-DEL-005` fail-fast theo **thứ tự `ids[]` client gửi** (không phải ASCII sort). DEV cần phân biệt rõ 2 tầng: (a) **lock acquisition order** (engine, ADR-020, tránh deadlock) vs (b) **error-reporting order** (BR-OB-DEL-005, theo `ids[]` client) — 2 khái niệm độc lập, không được nhầm lẫn khi implement. | MEDIUM — clarify cho DEV, không phải gap nghiệp vụ |

---

## §8 References

- `Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` v13 (nguồn canonical)
- `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9
- `Product/features/FEAT-OB-LIST.md` v9 · `FEAT-OB-IMPORT.md` v20 · `FEAT-OB-EDIT.md` v5 · `FEAT-OB-DELETE-LINES.md` v7
- `Architecture/api/gf-inventory-api.md` v44 §0 Wave Index W04 + §3b Opening Balance (W04-1..W04-7, skip W04-2)
- `Architecture/api/agg-garage-graph-graphql.md` §0 Wave Index W04 + §3g Opening Balance (W04-Q1/Q3 + W04-M1..M4)
- `Architecture/api/gf-accounting-api.md` §Accounting Period (`V4-AP-LC` lock-check endpoint)
- `Architecture/data/gf-inventory-data-model.md` §opening_balance_line + §inventory_stock_ledger
- `Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md`
- `Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md` v4 — engine sổ tồn dùng chung, exception categories
- `Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2 — REST advisory fail-CLOSED (commit) / fail-OPEN (verify)
- `Architecture/decisions/ADR-022-ob-import-all-or-nothing-bulk.md` v4 — wizard 2 bước all-or-nothing + cap 500 + empty-file semantic
- `Product/error-code/ERROR-CODE-REGISTRY.md`
- `Architecture/decisions/ADR-009.md` — JPA no relationship mapping
- `Architecture/decisions/ADR-018-inventory-v2-bulk-import-pattern.md` — precedent pattern (FE parse, JSON body, cap 500)

---

## §9 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT W04 scoped spec cho `BR-GF-INVENTORY-OPENING-BALANCE`. Verbatim copy toàn bộ rule từ nguồn v13 (2 CB + 16 BR-OB + 6 BR-OB-EDIT + 5 BR-OB-DEL + 2 BR-OB-CMN). Bổ sung §3 Enforcement Layer (domain/cross-boundary REST advisory ADR-021/engine sổ tồn ADR-020/REST adapter/DB/BFF/UI), §4 Test Ideas per rule (nhấn all-or-nothing BR-OB-004a, cap 500 + empty-file semantic BR-OB-004b, ĐVT khớp ĐVT chính BR-OB-010, delete-lines fail-fast BR-OB-DEL-005), §5 BR→FEAT→AC mapping cho 4 FEAT (dựa trực tiếp trên AC thực tế đọc từ nguồn FEAT), §6 Error code mapping đầy đủ 13 mã + `ERR-CMN-007`. 4 Open Item: `source_sha` pending compute (OI-001, blocking cho ACTIVE), `ERR-INV-049` cross-cutting đã revert khỏi Product (OI-002, info-only), FEAT-OB-LIST mobile AC pending BA/PO ack (OI-003, low), phân biệt lock-acquisition-order (ADR-020 C6 ASCII sort) vs error-reporting-order (BR-OB-DEL-005 theo `ids[]`) cho DEV (OI-004, medium clarify). |
