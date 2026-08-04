---
document_id: 'GMS-TC-W01-MOBILE-E2E'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'garage-mobile, garage-web, gf-sales, gf-accounting, agg-garage-graph'
wave: 'W01'
owner: 'QA Authority'
last_reviewed: '2026-06-11'
---

# Test Case Template - W01: Mobile E2E

> Split từ `TC-W01-E2E.md` — gom các TC cross-platform sync (Web ↔ Mobile). TC ID giữ nguyên prefix `TC-W01-E2E-NNN` từ file gốc.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-MOBILE-E2E`                                    |
| Wave          | W01                                                        |
| Boundary(ies) | `garage-mobile`, `garage-web`, `gf-sales`, `gf-accounting`, `agg-garage-graph` |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`            |
| Owner         | QA Authority                                               |
| Last Reviewed | 2026-06-11                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`  |

---

## 2. Scope

### In Scope

- Web ↔ Mobile platform parity (cross-platform sync) cho insurance allocation + phiếu QT BH

### Out of Scope

- Web-only E2E — xem `TC-W01-E2E.md`
- Mobile UI widget test — xem `TC-W01-MOBILE-UI.md`

### Test Environment & Data

| Item              | Required Data / Setup                                                       | Notes                                            |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| Tài khoản kế toán | `accountant@garage-a.test` — tenant `garage-a`                              | Actor chính                                      |
| Web client        | garage-web staging                                                          | Source nhập allocation                            |
| Mobile device     | Android API 28+ / iOS 14+ device thật                                       | Verify sync                                      |
| Staging env       | Full stack running                                                          | Cross-boundary                                   |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | N/A   | —              |
| Manual        | 3     | 3 READY        |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-E2E-002 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph, garage-web, garage-mobile | AC-13, E2E-DC06 | E2E | E2E | P2 | Web nhập phân bổ → Mobile hiển thị đồng bộ đúng | Staging; web + mobile cùng tenant; SO đã lưu trên web | 1. Trên web: lưu allocation BH=197.680.000đ.<br>2. Trên mobile: mở SO Detail cùng SO.<br>3. Kiểm tra section. | - Mobile hiển thị đúng giá trị từ web (list=detail=cùng con số).<br>- Không chênh lệch dữ liệu. | READY | N/A |
| TC-W01-E2E-023 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph, garage-web, garage-mobile | AC-1, E2E-DC06 | E2E | E2E | P2 | [Discard] Web toggle BH=Không + Lưu → Mobile reopen → section ẩn, tổng dồn về KH | Staging; web + mobile cùng tenant garage-a; SO đã có allocation đã lưu | 1. Web: mở SO có allocation, toggle BH=Không → Lưu.<br>2. Mobile: mở lại SO Detail cùng SO. | - Mobile: section "Phân bổ" ẩn.<br>- Tổng dồn về KH, không còn số BH cũ.<br>- Web = Mobile nhất quán, không chênh dữ liệu. | READY | N/A |
| TC-W01-E2E-025 | FEAT-INS-STL-DETAIL | gf-accounting, garage-web, garage-mobile | AC-1..9, E2E-DC06 | E2E | E2E | P2 | Web xem phiếu QT BH → mobile xem cùng phiếu → dữ liệu đồng bộ | Staging; phiếu `#SET-W01-INS-001` tồn tại | 1. Mở phiếu trên garage-web.<br>2. Mở cùng phiếu trên mobile.<br>3. So sánh số liệu panel + 4 tab. | - Số BH/KH/Tổng khớp nhau trên web và mobile (list = detail = cùng con số).<br>- 4 tab nội dung nhất quán 2 nền tảng. | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| 2026-06-11 | Split từ `TC-W01-E2E.md` — extract 3 TC cross-platform sync: TC-W01-E2E-002, TC-W01-E2E-023, TC-W01-E2E-025. TC ID + nội dung row giữ nguyên (không renumber). | QA Authority |
