---
type: execution
artifact_kind: work-package
status: PLANNED
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W06"
last_reviewed: "2026-06-24"
---

# PKG-W06 — Inventory V2: Tính giá + Báo cáo

> Work package cho Wave 6 (Inventory V2 slice 4/4): deliver **EP-INVENTORY-ACCOUNTING-PERIOD nhóm PRC** (5) + **EP-INVENTORY-STOCK-V2** (3).
> M01 Vertical-Slice. Timebox 5 ngày. PRC là phần phức tạp nhất (BQGQ tính lặp hội tụ). Update Actuals (§9) cuối wave.

## 1. Overview

| Field | Value |
|---|---|
| Wave | W06 — Tính giá + Báo cáo |
| Epics | EP-INVENTORY-ACCOUNTING-PERIOD (PRC) + EP-INVENTORY-STOCK-V2 |
| Duration | 5 ngày làm việc |
| Boundaries | `gf-inventory` · `agg-garage-graph` · `garage-web` · `garage-mobile`; có thể `gf-inventory-worker` (PRC async — NEED CONFIRMATION) |
| Vertical slice | Tính giá BQGQ → giá vốn + giá trị tồn → báo cáo; demo cả 2 platform |
| Entry gate | W05 complete (Nhập/Xuất trong kỳ + sổ tồn stable) |

## 2. Scope

### 2.1 Business Goal

Garage **tính giá xuất kho BQGQ cuối kỳ** (điền giá vốn phiếu xuất + cập nhật giá trị sổ tồn) và xem **báo cáo tồn đến ngày / NXT / thẻ kho** dựa trên sổ tồn — nắm chính xác tồn + giá trị tại mọi thời điểm phục vụ kiểm kê, đối soát, quyết định.

### 2.2 Technical Scope

**8 feature**:
- Tính giá xuất kho (PRC, 5): `FEAT-PRC-LIST` · `FEAT-PRC-CREATE` · `FEAT-PRC-DETAIL` · `FEAT-PRC-RECALC` · `FEAT-PRC-DELETE`
- Báo cáo tồn V2 (STOCK, 3): `FEAT-STK-LIST-V2` (tồn đến ngày) · `FEAT-IP-VIEW-V2` (NXT) · `FEAT-STK-DETAIL-V2` (thẻ kho)

**Backend (gf-inventory)**: PRC BQGQ cuối kỳ theo (mã+kho+gara) — đơn giá BQ = (GT đầu+GT nhập)/(SL đầu+SL nhập), làm tròn 2 lẻ; tồn đầu = tồn đến "Từ ngày"−1; **tính lặp hội tụ** (BR-PRC-017); điền giá vốn xuất + cập nhật giá trị sổ tồn; bảng "SP chạy giá lỗi"; tính lại (ghi đè + audit), chặn RECALC/xóa log nếu kỳ đóng. Báo cáo: tồn đến ngày (tra sổ tồn ≤ D), NXT (Đầu+Nhập−Xuất), thẻ kho (running); SL realtime, giá trị theo BQGQ (số/0). (PRC async qua `gf-inventory-worker` nếu ADR chốt.)
**BFF**: GraphQL PRC run/recalc/delete + report queries.
**Web + Mobile**: màn chạy/lịch sử/chi tiết/tính lại/xóa tính giá + 3 báo cáo + export.

### 2.3 Out of Scope

- Điều chỉnh tồn (V2 KHÔNG có ADJUST). Mọi biến động qua phiếu nhập/xuất + OB.
- File V1 cũ (STK-LIST/DETAIL/ADJUST/PRICE, IP-VIEW) — không đụng, không link.

### 2.4 DEV Playbook

**Bước 0 — Reading list**: EP-ACCOUNTING-PERIOD (PRC §3.2 công thức) + EP-STOCK-V2 + 8 FEAT + BR-GF-INVENTORY-ACCOUNTING-PERIOD (BR-PRC-*) + BR-GF-INVENTORY-STOCK-V2 + KG + HLD/API/INTEG + **ADR engine BQGQ** + Figma.

**Bước 1 — Reuse-First / Component-Inventory Gate (BẮT BUỘC)**: search component sẵn có — keyword `report-table`/`data-grid`, `period-selector`, `run-job`/`progress`, `export`, `pivot`/`nxt`. CHỈ dựng mới nếu inventory thiếu (lý do + đăng ký KG). KHÔNG "build component X first".

**Bước 2 — Contract gate**. **Bước 3 — Figma gate** (NEED CONFIRMATION mobile). **Bước 4 — Reference**. **Bước 5 — Rules** (BQGQ làm tròn 2 lẻ + dùng giá trị đã làm tròn tính tiền; tính lặp hội tụ; chặn kỳ đóng). **Bước 6 — KG + self-check**.

## 3. Entry Criteria

- [ ] Hard gate W05→W06 pass: Nhập/Xuất trong kỳ + sổ tồn stable (đầu vào BQGQ).
- [ ] Architecture pre-wave: HLD-INVENTORY §BQGQ + §báo cáo; `gf-inventory-api.md` PRC + report; INTEG-FE/MOB/BFF-INV-PRICING + INV-STOCK-REPORT; **ADR — engine BQGQ + tính lặp + recalc + làm tròn**; **NEED CONFIRMATION: PRC sync hay async via gf-inventory-worker**.
- [ ] PO sign-off EP-ACCOUNTING-PERIOD (PRC) + EP-STOCK-V2 + BR ratified.
- [ ] **Reuse-First gate** acknowledged. Figma web verified; **Figma mobile NEED CONFIRMATION**.
- [ ] Spike perf "tồn đến ngày" + perf BQGQ "tất cả mã" (nếu cần). Branch `feature/ep-inventory-v2-w06` sau W05 merge.

## 4. Agent Assignments

### 4.1 DEV
`agent-dev-gf-inventory` (+ `agent-dev-gf-inventory-worker` nếu PRC async) · `agent-dev-agg-garage-graph` · `agent-dev-garage-web` · `agent-dev-garage-mobile`.
### 4.2 REVIEW
`agent-review-backend` · `agent-review-garage-web` · `agent-review-garage-mobile`.
### 4.3 TEST
`agent-test-api` · `agent-test-ui` · `agent-test-e2e` (chạy giá → báo cáo journey) · `agent-test-performance` (BQGQ + tồn đến ngày — nếu perf-sensitive).

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests
- [ ] **gf-inventory**: PRC BQGQ cuối kỳ (đơn giá BQ 2 lẻ; tồn đầu = đến "Từ ngày"−1; tính lặp hội tụ BR-PRC-017; điền giá vốn xuất + cập nhật giá trị sổ tồn; bảng SP lỗi; tính lại ghi đè + audit; chặn RECALC/xóa log nếu kỳ đóng). Báo cáo tồn đến ngày + NXT + thẻ kho. (Async via gf-inventory-worker nếu ADR chốt.) Coverage ≥ 80%.
- [ ] **agg-garage-graph**: GraphQL PRC + report queries. Coverage ≥ 80%.
- [ ] **garage-web** + **garage-mobile**: chạy/lịch sử/chi tiết/tính lại/xóa tính giá + 3 báo cáo + export. **Reuse-First**. Coverage ≥ 60%.
- [ ] Integration test: chạy BQGQ → giá vốn xuất + giá trị tồn khớp; tính lại kỳ → kỳ sau cần tính lại; kỳ có phiếu trả tự tham chiếu → hội tụ.

### 5.2 Architecture & Docs
- [ ] KG `gf-inventory` cập nhật PRC + report views + `last_verified`. ADR engine BQGQ merged.

### 5.3 Quality Gates
- [ ] Build/lint/test pass; REVIEW P1=0 (gồm perf review BQGQ + tồn đến ngày); AC coverage 100% (8 FEAT) cả 2 platform; 3-in-1.

### 5.4 Demo
- [ ] Demo script `Tracking/demos/ep-inventory-v2-w06-demo.md` ready.

## 6. Demo Target

Web + mobile: chạy tính giá BQGQ cuối kỳ (Tất cả mã) → đơn giá BQ 2 lẻ + giá vốn xuất điền + giá trị sổ tồn cập nhật; báo cáo tồn đến ngày + NXT + thẻ kho khớp số; thêm phiếu → tính lại → kết quả cập nhật + kỳ sau cần tính lại. Cross-platform.

## 7. Dependencies (External to Wave)

- W05 (Nhập/Xuất trong kỳ + sổ tồn). ADR engine BQGQ. Quyết định PRC async/gf-inventory-worker (Architecture Authority — NEED CONFIRMATION). Figma mobile.

## 8. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| BQGQ tính lặp không hội tụ / sai | ADR engine BQGQ + spike; integration test phiếu trả tự tham chiếu; giới hạn vòng lặp + cảnh báo |
| Perf BQGQ "tất cả mã" + tồn đến ngày | Spike trước; cân nhắc async gf-inventory-worker + index/materialized |
| Làm tròn 2 lẻ ảnh hưởng tiền vốn | Dùng giá trị đã làm tròn để tính tiền (BR-PRC-013); test ví dụ |
| Figma mobile chưa có | Web trước; escalate |

## 9. Post-Wave Actuals

*(Điền cuối wave — đóng Inventory V2; tổng kết sức chứa 5 ngày qua 4 wave để chốt baseline velocity PLANNING-PLAYBOOK §F3.)*

## 10. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-24 | 1 | Delivery Authority | Khởi tạo PKG-W06 Inventory V2 Tính giá + Báo cáo — PRC (5) + STOCK-V2 (3), 4 boundary (+gf-inventory-worker nếu async), M01 vertical slice, timebox 5 ngày. Reuse-First gate. NEED CONFIRMATION: Figma mobile, ADR engine BQGQ, PRC async via gf-inventory-worker. |
