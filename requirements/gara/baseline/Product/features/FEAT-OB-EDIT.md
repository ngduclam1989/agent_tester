---
type: feature
artifact_kind: feature
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
boundary: "gf-inventory"
last_reviewed: "2026-07-08"
---

# FEAT-OB-EDIT: Sửa dòng tồn đầu kỳ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-EDIT` |
| Title | Sửa dòng tồn đầu kỳ |
| Parent Epic | `EP-INVENTORY-OPENING-BALANCE` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** sửa thông tin một dòng tồn đầu kỳ (sản phẩm, kho, số lượng, giá trị, ngày), **so that** tôi điều chỉnh dữ liệu tồn khởi đầu sai mà không phải xóa rồi import lại.

## 2. Acceptance Criteria

### Nhóm A — Mở form sửa

- [ ] **AC-1**: Mở form sửa từ danh sách
  - Tại: danh sách tồn đầu kỳ (`FEAT-OB-LIST`), cột **"Thao tác"**, icon **sửa (✏️)** trên dòng.
  - Khi: chủ garage nhấn icon sửa.
  - Thì: hệ thống mở màn **"Sửa chi tiết tồn kho vật tư hàng hoá"** với header gồm nút **"← Quay lại"** (back), **"Huỷ bỏ"** và **"Lưu"**.

- [ ] **AC-2**: Hiển thị form với dữ liệu hiện tại
  - Tại: form sửa, section **"Thông tin tồn đầu kỳ"**.
  - Khi: form mở.
  - Thì: hệ thống hiển thị 6 trường đổ sẵn dữ liệu hiện tại:
    - **Sản phẩm nội bộ \*** (dropdown — chọn lại mã sản phẩm nội bộ "Đang hoạt động").
    - **Kho \*** (dropdown — chọn lại kho trong danh mục garage).
    - **Đơn vị tính** (readonly — tự đổi theo mã sản phẩm nội bộ đã chọn = ĐVT chính).
    - **Số lượng tồn \*** (input số, cho số lẻ).
    - **Tồn đến ngày \*** (date picker).
    - **Giá trị tồn** (input số, cho = 0 hoặc trống).

### Nhóm B — Lưu thay đổi

- [ ] **AC-3**: Validate & lưu
  - Tại: form sửa, nút **"Lưu"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống validate (xem Nhóm C) → nếu hợp lệ: cập nhật dòng OB + **cascade tồn cuối ngày của (mã+kho+gara) trong sổ tồn** (BR-STKV2-001) → quay về danh sách + thông báo thành công.

- [ ] **AC-4**: Huỷ bỏ
  - Tại: form sửa, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn.
  - Thì: hệ thống quay về danh sách, không lưu thay đổi.

### Nhóm C — Guardrails (validate khi lưu)

- [ ] **AC-5**: Chặn khi kỳ đã đóng
  - Tại: lưu form.
  - Khi: **"Tồn đến ngày"** (mới hoặc cũ) rơi vào kỳ kế toán đã đóng.
  - Thì: chặn lưu → mã lỗi **`ERR-INV-024`**.

- [ ] **AC-6**: Chặn khi tồn âm
  - Tại: lưu form.
  - Khi: thay đổi (SL / kho / mã / ngày) làm **tồn lũy kế < 0 tại bất kỳ thời điểm nào** từ "Tồn đến ngày" trở đi cho (mã+kho+gara) — check point-in-time.
  - Thì: chặn lưu → mã lỗi **`ERR-INV-036`**.

- [ ] **AC-7**: Chặn khi "Tồn đến ngày" sau phiếu
  - Tại: lưu form.
  - Khi: **"Tồn đến ngày"** (mới) ≥ ngày phát sinh sớm nhất của phiếu nhập/xuất **đã ghi sổ** của (mã+kho) mới.
  - Thì: chặn lưu → mã lỗi **`ERR-INV-035`** (OB phải là điểm khởi đầu, trước mọi phiếu).

- [ ] **AC-8**: Chặn khi trùng (mã+kho)
  - Tại: lưu form.
  - Khi: (mã sản phẩm + kho) sau sửa **trùng** với dòng OB khác đã tồn tại.
  - Thì: chặn lưu → mã lỗi **`ERR-INV-034`** (OB duy nhất / (mã+kho) — BR-OB-012).

- [ ] **AC-9**: Validate trường bắt buộc + giá trị
  - Tại: lưu form.
  - Thì: áp dụng validate tương tự import:
    - Sản phẩm: bắt buộc, phải "Đang hoạt động" (ngừng → `ERR-INV-010`).
    - Kho: bắt buộc, phải tồn tại (`ERR-INV-020`).
    - Số lượng tồn: **> 0** (`ERR-INV-032`).
    - Giá trị tồn: **≥ 0** (cho = 0 hoặc trống; < 0 → `ERR-INV-033`).

### Nhóm D — Phân quyền

- [ ] **AC-10**: Phân quyền sửa
  - Tại: danh sách tồn đầu kỳ.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò sửa được với quyền ngang nhau.

## 3. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web | https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14854-94446&t=fabmGKlGamljM40l-4 |

- Header: **"Sửa chi tiết tồn kho vật tư hàng hoá"** (theo design).
- Layout: 2 cột (Sản phẩm / Kho, Đơn vị tính / Số lượng tồn, Tồn đến ngày / Giá trị tồn).
- Luồng: [UX-FLOW-INVENTORY-OPENING-BALANCE](../ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md).

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`).
- Cập nhật dòng OB: Mutation `[PROPOSED] UpdateOpeningBalanceLine`.

## 5. Business Rules

- **BR-OB-001**: Cấu trúc dòng (Tồn đến ngày, Kho, Mã, ĐVT, SL, Giá trị).
- **BR-OB-012**: OB duy nhất / (mã+kho) — đổi (mã+kho) trùng dòng khác → chặn `ERR-INV-034`.
- **BR-OB-013**: "Tồn đến ngày" thuộc kỳ đã đóng → chặn `ERR-INV-024`.
- **BR-OB-015**: Sửa làm tồn (mã+kho) < 0 point-in-time → chặn `ERR-INV-036`.
- **BR-OB-016**: "Tồn đến ngày" sau/cùng ngày phiếu (mã+kho) → chặn `ERR-INV-035`.
- **Cascade sổ tồn**: sửa OB → tính lại tồn cuối ngày của (mã+kho+gara) từ "Tồn đến ngày" trở đi (BR-STKV2-001).
- **ĐVT readonly**: ĐVT tự đổi theo mã sản phẩm nội bộ = ĐVT chính; không cho chọn tay.
- **BR-OB-CMN-002**: Phân quyền — chủ garage + kế toán quyền ngang nhau.

## 6. Edge Cases

- **EC-1**: Sửa Sản phẩm → ĐVT tự đổi theo mã mới (readonly).
- **EC-2**: Sửa Kho hoặc Sản phẩm → (mã+kho) mới trùng OB khác → chặn `ERR-INV-034`.
- **EC-3**: Giảm SL tồn → cascade làm tồn âm ở ngày sau (do có phiếu xuất phụ thuộc) → chặn `ERR-INV-036`.
- **EC-4**: Đổi "Tồn đến ngày" sang kỳ đã đóng → chặn `ERR-INV-024`.
- **EC-5**: Đổi "Tồn đến ngày" sang sau ngày phiếu nhập/xuất đã ghi sổ → chặn `ERR-INV-035`.
- **EC-6**: Sửa thành công → cascade sổ tồn + báo cáo tồn/NXT cập nhật theo.
- **EC-7**: Phiên khác đã xóa dòng OB này trước khi user lưu → lỗi "Dòng không tồn tại", quay về danh sách.
- **EC-8**: "Tồn đến ngày" cũ thuộc kỳ đã đóng (chưa sửa ngày) → chặn lưu `ERR-INV-024` (dù chỉ sửa SL/giá trị — vì ngày chứng từ vẫn thuộc kỳ đóng).

## 7. Out of Scope

- Import tồn đầu kỳ → xem `FEAT-OB-IMPORT`.
- Xóa dòng → xem `FEAT-OB-DELETE-LINES`.
- Sửa hàng loạt (batch edit) — chỉ hỗ trợ sửa từng dòng.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | Business Authority | Khởi tạo FEAT-OB-EDIT (mới) — sửa dòng tồn đầu kỳ từ icon ✏️ trên danh sách. Form 6 trường (Sản phẩm/Kho/ĐVT readonly/SL tồn/Tồn đến ngày/Giá trị tồn). Guardrails tương tự import: kỳ đóng (`ERR-INV-024`), tồn âm point-in-time (`ERR-INV-036`), OB trước mọi phiếu (`ERR-INV-035`), unique (mã+kho) (`ERR-INV-034`). Cascade sổ tồn sau lưu. Cho đổi Sản phẩm + Kho (validate unique). Header: "Sửa chi tiết tồn kho vật tư hàng hoá" (theo design). |
| 2026-07-06 | 2 | Business Authority (in-session, user ninhnguyen) | **Sync label field theo Figma** — AC-2: **"Sản phẩm \*"** → **"Sản phẩm nội bộ \*"** verbatim. Follow-up Design cần fix trong Figma: 2 field "Số lượng tồn" + "Tồn đến ngày" hiện thiếu dấu `*` bắt buộc (spec giữ nguyên `*` cho cả 2). |
| 2026-07-07 | 3 | Business Authority (in-session, user ninhnguyen) | **[REVERTED v4]** Add AC-3b + EC-9 — xử lý save-time server-side failure (mirror FEAT-OB-IMPORT v19). Dùng 1 error code chung `ERR-INV-049` HTTP 503 + toast "Hệ thống đang bận, vui lòng thử lại sau." cho MỌI save-time failure. Reverted vì thuộc cross-cutting concern (Architecture tier). |
| 2026-07-07 | 4 | Business Authority (in-session, user ninhnguyen) | **Revert v3** per Architect decision — cùng lý do như FEAT-OB-IMPORT v20: server-side error handling (HTTP 5xx, network fail, DB deadlock, cascade fail) là cross-cutting concern thuộc Architecture tier, KHÔNG thuộc Product FEAT AC. Xóa AC-3b + EC-9. Behavior "Hệ thống đang bận, vui lòng thử lại sau." + `ERR-INV-049` HTTP 503 sẽ do Architect ghi vào tài liệu kỹ thuật (HLD/ADR/global error policy). |
| 2026-07-08 | 5 | Business Authority (quannn) + main agent | **Đồng bộ User Story theo label mới FEAT-OB-LIST v6** — bỏ "đã import" khỏi "một dòng tồn đầu kỳ đã import" → "một dòng tồn đầu kỳ". Lý do: cascade FEAT-OB-LIST v6 (BA quannn 2026-07-08 gọn label "Danh sách tồn đầu kỳ đã import" → "Danh sách tồn đầu kỳ") — giữ terminology nhất quán xuyên FEAT trong cùng epic. AC/BR không đổi. |
