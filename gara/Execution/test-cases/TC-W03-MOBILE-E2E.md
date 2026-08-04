---
document_id: 'GMS-TC-W03-MOBILE-E2E'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'garage-mobile, garage-web, gf-inventory, agg-garage-graph'
wave: 'W03'
owner: 'QA Authority'
last_reviewed: '2026-07-01'
---

# Test Case W03 — Mobile E2E

> Split từ `TC-W03-E2E.md` — gom các TC cross-platform sync (Web ↔ Mobile). TC ID giữ nguyên prefix `TC-W03-E2E-NNN` từ file gốc, KHÔNG renumber.

---

## 1. General Info

| Field | Value |
| --- | --- |
| Document ID | `GMS-TC-W03-MOBILE-E2E` |
| Wave | W03 |
| Boundary(ies) | `garage-mobile`, `garage-web`, `gf-inventory`, `agg-garage-graph` |
| Feature(s) | `FEAT-INV-MOBILE-MENU`, `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DETAIL` |
| Owner | `QA Authority` |
| Last Reviewed | 2026-07-01 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` |

---

## 2. Scope

### In Scope

- Web ↔ Mobile platform parity (cross-platform sync) cho danh mục vật tư (Nhóm VTHH full CRUD mobile + Mã sản phẩm view-only mobile)
- Tạo/xóa nhóm trên 1 platform → phản ánh đúng trên platform còn lại
- Tạo mã sản phẩm trên Web → mobile thấy đúng dữ liệu ở chế độ view-only

### Out of Scope

- Web-only E2E — xem `TC-W03-E2E.md`
- Mobile-only scope enforcement (KHÔNG gọi Q2, KHÔNG có nút Create/Edit/Delete Product) — vẫn giữ trong `TC-W03-E2E.md` (TC-026/027) vì đây là behavior đơn-platform, không phải cross-platform sync
- Mobile UI widget/layout test — xem `TC-W03-MOBILE-UI.md`
- Tenant isolation cross-tenant — xem `TC-W03-ISOLATION.md`

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| --- | --- | --- |
| Tài khoản kế toán | `accountant@garage-a.test` — tenant `garage-a` | Actor chính |
| Web client | garage-web staging | Nguồn tạo/sửa dữ liệu |
| Mobile device | Android 13 (Pixel 6) / iOS 17 (iPhone 14) device thật hoặc simulator | Verify sync |
| Staging env | Full stack chạy (gf-inventory + agg-garage-graph + garage-web + garage-mobile) | Cross-boundary |
| Seed | Tenant `garage-a` có sẵn vài nhóm/mã để test delete-sync | Dùng chung với TC-W03-E2E.md |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| --- | --- | --- |
| Automated | N/A | — |
| Manual | 6 | 6 READY |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-015 | FEAT-INV-MOBILE-MENU + FEAT-CAT-GRP-LIST | garage-mobile, agg-garage-graph | UX-FLOW §3.0 | E2E | E2E | P1 | Luồng chính mobile: Đăng nhập → Hub → tile Nhóm vật tư → tạo nhóm trên mobile → kiểm tra trên web | Tenant `garage-a` rỗng nhóm; mobile + web cùng tenant | 1. Đăng nhập mobile `accountant`.<br>2. Mở Hub → tap tile "Nhóm vật tư" → push List.<br>3. Tap footer "Thêm nhóm vật tư".<br>4. Nhập form (code MOBILE-001, tên "Nhóm mobile").<br>5. Tap "Lưu".<br>6. Quay sang web → mở List → search "MOBILE-001". | - Mobile: toast success + back về List + thấy `MOBILE-001`.<br>- Web (sau refresh): list có `MOBILE-001` với "Người tạo" = user mobile.<br>- Cùng tenant `garage-a`. | READY | N/A |
| TC-W03-E2E-016 | FEAT-CAT-GRP-CREATE | garage-web, garage-mobile | sync | E2E | E2E | P2 | Cross-platform sync: tạo nhóm trên Web → mobile pull-refresh thấy nhóm mới | Cả 2 platform login cùng tenant | 1. Tạo nhóm `GRP-WEB-001` trên Web.<br>2. Mở mobile Group List → pull-down refresh.<br>3. Kiểm tra list. | - Mobile sau refresh thấy `GRP-WEB-001`.<br>- `parentName` enrich đúng.<br>- `createdByName` = tên user web. | READY | N/A |
| TC-W03-E2E-017 | FEAT-CAT-GRP-DELETE | garage-web, garage-mobile | sync | E2E | E2E | P2 | Mobile xóa nhóm → Web reload thấy nhóm biến mất | Có nhóm `GRP-DEL-SYNC` trống | 1. Mobile mở Detail → tap "Xoá" → xác nhận.<br>2. Web reload List. | - Mobile: toast + pop List, không còn nhóm.<br>- Web: refresh thấy nhóm biến mất.<br>- DB tenant phản ánh đúng. | READY | N/A |
| TC-W03-E2E-018 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web, garage-mobile | view-only sync | E2E | E2E | P2 | Web tạo mã → mobile pull-refresh List + tap Detail render view-only đúng | Tạo mã `PROD-WEB-NEW` trên web | 1. Web tạo mã đầy đủ 4 tab.<br>2. Mobile mở Product List → pull-refresh.<br>3. Tap mã → Detail. | - Mobile List có mã.<br>- Mobile Detail render 4 cards (KHÔNG Tabs, KHÔNG Edit/Delete button per view-only AC-12).<br>- Hiển thị enrichment đầy đủ. | READY | N/A |
| TC-W03-E2E-036 | FEAT-CAT-GRP-EDIT | garage-web, garage-mobile | sync | E2E | E2E | P2 | Sửa nhóm trên Web (đổi tên + mô tả) → Mobile Detail/List pull-refresh phản ánh đúng dữ liệu mới | Nhóm `GRP-SYNC-EDIT` tồn tại trên cả 2 platform (cùng tenant) | 1. Web: mở Edit `GRP-SYNC-EDIT`, đổi tên thành "Tên đã sửa từ Web" + mô tả mới → Lưu.<br>2. Mobile: mở Group List → pull-down refresh → tap card `GRP-SYNC-EDIT` → Detail. | - Mobile List sau refresh hiển thị tên mới "Tên đã sửa từ Web".<br>- Mobile Detail hiển thị đúng tên + mô tả mới, "Người cập nhật" = user web, "Ngày sửa" mới.<br>- Không có dữ liệu cũ nào còn sót (cache stale). | READY | N/A |
| TC-W03-E2E-037 | FEAT-CAT-PROD-EDIT, FEAT-CAT-PROD-DETAIL | garage-web, garage-mobile | view-only sync | E2E | E2E | P2 | Sửa mã sản phẩm trên Web (đổi thương hiệu + gắn thêm SKU + thêm ĐVT quy đổi) → Mobile Product Detail (view-only) phản ánh đúng dữ liệu mới | Mã `PROD-SYNC-EDIT` tồn tại, mobile đã từng xem qua Detail trước đó (đã cache) | 1. Web: mở Edit `PROD-SYNC-EDIT`, đổi Thương hiệu → "Bosch", gắn thêm 1 SKU mới, thêm 1 ĐVT quy đổi → Lưu.<br>2. Mobile: mở Product Detail `PROD-SYNC-EDIT` → pull-down refresh. | - Mobile Detail sau refresh hiển thị đúng Thương hiệu "Bosch" mới (không phải giá trị cache cũ).<br>- Vì mobile là view-only (không có tab SKU/ĐVT quy đổi riêng như Web — chỉ 4 card), xác nhận card liên quan (GeneralInfoCard) phản ánh đúng field đã đổi; các thay đổi SKU/ĐVT quy đổi không hiển thị trực tiếp trên UI mobile (ngoài phạm vi 4 card) nhưng KHÔNG được gây lỗi/crash khi load lại.<br>- "Người cập nhật"/"Ngày sửa" (nếu mobile hiển thị) phản ánh đúng. | READY | N/A |

---

## 5. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-07-01 | Split từ `TC-W03-E2E.md` — extract 4 TC cross-platform sync: TC-W03-E2E-015, 016, 017, 018. TC ID + nội dung row giữ nguyên (không renumber). Lý do: quy ước wave-tc-adapter.md yêu cầu file MOBILE-E2E riêng cho cross-platform sync (giống pattern W01/W02) — trước đó các TC này bị lẫn trong TC-W03-E2E.md. | QA Authority |
| 2026-07-01 | Bổ sung 2 TC (036-037) sau khi user hỏi tại sao MOBILE-E2E ít TC so với số feature — phát hiện gap thật: trong 7/12 feature có mặt trên mobile, GRP-EDIT và PROD-EDIT (ảnh hưởng đến PROD-DETAIL view-only) chưa có test sync — 4 TC cũ chỉ cover Create/Delete, thiếu nhánh Update. | QA Authority |
