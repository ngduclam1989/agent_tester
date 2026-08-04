---
type: execution
artifact_kind: work-package
status: PLANNED
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W05"
last_reviewed: "2026-06-24"
---

# PKG-W05 — Inventory V2: Giao dịch kho (Nhập + Xuất)

> Work package cho Wave 5 (Inventory V2 slice 3/4 — **wave dày nhất, 14 feature**): deliver **EP-INVENTORY-RECEIPT-V2** (7) + **EP-INVENTORY-DELIVERY-V2** (7).
> M01 Vertical-Slice. Timebox 5 ngày (fallback tách W05a/W05b nếu actuals báo tràn — KHÔNG kéo dài >5 ngày). Update Actuals (§9) cuối wave.

## 1. Overview

| Field | Value |
|---|---|
| Wave | W05 — Giao dịch kho: Nhập + Xuất |
| Epics | EP-INVENTORY-RECEIPT-V2 + EP-INVENTORY-DELIVERY-V2 |
| Duration | 5 ngày làm việc (timebox; fallback tách đôi nếu tràn) |
| Boundaries | `gf-inventory` · `agg-garage-graph` · `garage-web` · `garage-mobile`; **đọc** `gf-sales` (đối soát SO) |
| Vertical slice | Nhập/xuất kho → biến động tồn realtime; demo cả 2 platform |
| Entry gate | W04 complete (sổ tồn + lock kỳ + nguồn tồn) |

## 2. Scope

### 2.1 Business Goal

Garage quản lý phiếu **nhập/xuất kho V2** theo mã nội bộ + ĐVT quy đổi → tồn theo ĐVT chính; ghi sổ cộng/trừ tồn, **chặn tồn âm**, tuân **lock kỳ**, đối soát SO (cảnh báo) — số liệu tồn chính xác realtime làm nền cho tính giá + báo cáo.

### 2.2 Technical Scope

**14 feature** (2 module đồng nhất vòng đời Nháp→Ghi sổ→Bỏ ghi sổ):
- Nhập kho V2 (IR, 7): `FEAT-IR-LIST-V2` · `FEAT-IR-CREATE-V2` · `FEAT-IR-DETAIL-V2` · `FEAT-IR-EDIT-V2` · `FEAT-IR-DELETE` · `FEAT-IR-PRINT` *(P2)* · `FEAT-IR-EXPORT` *(P2)*
- Xuất kho V2 (ID, 7): `FEAT-ID-LIST-V2` · `FEAT-ID-CREATE-V2` · `FEAT-ID-DETAIL-V2` · `FEAT-ID-EDIT-V2` · `FEAT-ID-DELETE` · `FEAT-ID-PRINT` *(P2)* · `FEAT-ID-EXPORT` *(P2)*

**Backend (gf-inventory)**: phiếu Nhập (Nguồn nhập + Loại phiếu; PO không bắt buộc; ghi sổ = cộng tồn) + phiếu Xuất (ghi sổ = trừ tồn, check tồn khả dụng chặn âm point-in-time; đối soát SO cảnh báo không chặn); bỏ ghi sổ = đảo tồn về Nháp; xóa khi kỳ chưa khóa; chặn thao tác phiếu thuộc kỳ đã đóng; tính lại tồn khi sửa. Flyway V{N+1}.
**BFF**: GraphQL phiếu CRUD + ghi sổ/bỏ ghi sổ + print/export; INTEG đọc gf-sales (SO).
**Web + Mobile**: danh sách/tạo/sửa/chi tiết phiếu nhập & xuất + ghi sổ/bỏ ghi sổ + in + xuất excel.

### 2.3 Out of Scope

- Tính giá BQGQ + giá trị tồn theo giá vốn (W06) — giá vốn xuất = 0 đến khi chạy giá.
- Báo cáo tồn/NXT/thẻ kho (W06).

### 2.4 DEV Playbook

**Bước 0 — Reading list**: EP-RECEIPT-V2 + EP-DELIVERY-V2 + 14 FEAT + BR-GF-INVENTORY-RECEIPT-V2 + BR-GF-INVENTORY-DELIVERY-V2 + KG + HLD/API/INTEG + ADR lock kỳ (W04) + INTEG đọc gf-sales + Figma.

**Bước 1 — Reuse-First / Component-Inventory Gate (BẮT BUỘC)**: 2 module phiếu chung pattern → **reuse mạnh**. Search component sẵn có — keyword `voucher`/`document-form`, `line-items`/`editable-table`, `status-badge` (Nháp/Ghi sổ), `number`/`quantity`/`unit-selector`, `print`/`export`. Dựng **form phiếu chung** tái dùng cho cả Nhập + Xuất nếu inventory cho phép; chỉ dựng mới element thiếu (lý do + đăng ký KG). KHÔNG "build component X first".

**Bước 2 — Contract gate**. **Bước 3 — Figma gate** (NEED CONFIRMATION mobile). **Bước 4 — Reference**. **Bước 5 — Rules** (chặn tồn âm point-in-time; lock kỳ; đối soát SO cross-boundary đọc gf-sales qua REST, KHÔNG direct DB). **Bước 6 — KG + self-check**.

## 3. Entry Criteria

- [ ] Hard gate W04→W05 pass: sổ tồn ghi/đọc stable; lock kỳ enforce; OB làm nguồn tồn test.
- [ ] Architecture pre-wave: HLD-INVENTORY §phiếu Nhập/Xuất V2; `gf-inventory-api.md` phiếu + ghi sổ/bỏ ghi sổ + print/export; INTEG-FE/MOB/BFF-INV-RECEIPT + INV-DELIVERY; **INTEG đọc gf-sales (SO)**; ADR lock kỳ (ratified W04).
- [ ] PO sign-off EP-RECEIPT-V2 + EP-DELIVERY-V2 + BR ratified.
- [ ] **Reuse-First gate** acknowledged (form phiếu chung). Figma web verified; **Figma mobile NEED CONFIRMATION**.
- [ ] KG entities (StockReceipt, StockDelivery + lines). Branch `feature/ep-inventory-v2-w05` sau W04 merge.
- [ ] **Sizing watch**: nếu actuals W04 báo nguy cơ tràn → kích hoạt fallback tách W05a Nhập / W05b Xuất.

## 4. Agent Assignments

### 4.1 DEV
`agent-dev-gf-inventory` · `agent-dev-agg-garage-graph` · `agent-dev-garage-web` · `agent-dev-garage-mobile`.
### 4.2 REVIEW
`agent-review-backend` (gồm review cross-boundary đọc gf-sales) · `agent-review-garage-web` · `agent-review-garage-mobile`.
### 4.3 TEST
`agent-test-api` · `agent-test-ui` · `agent-test-e2e` (nhập→xuất→tồn journey + chặn tồn âm + lock kỳ).

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests
- [ ] **gf-inventory**: phiếu Nhập (cộng tồn) + Xuất (trừ tồn, chặn tồn âm, đối soát SO cảnh báo); bỏ ghi sổ đảo tồn; xóa khi kỳ chưa khóa; chặn phiếu kỳ đóng; tính lại tồn khi sửa. Flyway V{N+1}. Coverage ≥ 80%.
- [ ] **agg-garage-graph**: GraphQL phiếu + ghi sổ/bỏ ghi sổ + print/export; đọc gf-sales SO. Coverage ≥ 80%.
- [ ] **garage-web** + **garage-mobile**: danh sách/tạo/sửa/chi tiết phiếu nhập & xuất + ghi sổ/bỏ ghi sổ + in + xuất excel. **Reuse-First** (form phiếu chung Nhập/Xuất; P2 PRINT/EXPORT drop trước nếu tràn timebox). Coverage ≥ 60%.
- [ ] Integration test: nhập → tồn tăng; xuất quá tồn → chặn; bỏ ghi sổ → đảo tồn; thao tác kỳ đóng → chặn; đối soát SO lệch → cảnh báo.

### 5.2 Architecture & Docs
- [ ] KG `gf-inventory` cập nhật entities phiếu + `last_verified`.

### 5.3 Quality Gates
- [ ] Build/lint/test pass; REVIEW P1=0 (gồm security đối soát SO cross-boundary); AC coverage 100% (14 FEAT) cả 2 platform; 3-in-1.

### 5.4 Demo
- [ ] Demo script `Tracking/demos/ep-inventory-v2-w05-demo.md` ready.

## 6. Demo Target

Web + mobile: nhập kho (cộng tồn) → xuất kho cho SO (trừ tồn, đối soát SO cảnh báo lệch) → xuất quá tồn bị chặn → bỏ ghi sổ phiếu nhập (đảo tồn) → sổ tồn realtime đúng; thao tác phiếu kỳ đã đóng bị chặn. Cross-platform.

## 7. Dependencies (External to Wave)

- W04 (sổ tồn + lock kỳ + nguồn tồn). `gf-sales` (đọc SO đối soát). `gf-purchase` (PO inheritance — optional). ADR lock kỳ. Figma mobile.

## 8. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Wave 14 feat tràn 5 ngày | Fallback tách W05a Nhập / W05b Xuất; reuse form phiếu chung giảm tải |
| Chặn tồn âm point-in-time phức tạp | Test kỹ point-in-time từ ngày chứng từ trở đi; integration test |
| Đối soát SO cross-boundary | Đọc gf-sales qua REST (không direct DB); cảnh báo không chặn |
| Figma mobile chưa có | Web trước; escalate |

## 9. Post-Wave Actuals

*(Điền cuối wave — đặc biệt ghi nhận có cần tách đôi không, làm input sizing W06.)*

## 10. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-24 | 1 | Delivery Authority | Khởi tạo PKG-W05 Inventory V2 Giao dịch kho — RECEIPT-V2 (7) + DELIVERY-V2 (7) = 14 feature, 4 boundary + đọc gf-sales, M01 vertical slice, timebox 5 ngày + fallback tách đôi. Reuse-First (form phiếu chung). NEED CONFIRMATION: Figma mobile. |
