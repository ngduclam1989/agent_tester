---
document_id: "TR-W03-MOBILE-UI-agent-test-mobile-ui"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: DRAFT
version: 7
wave: "W03"
agent: "agent-test-mobile-ui"
boundary: "garage-mobile"
execution_date: "2026-07-03"
last_reviewed: "2026-07-03"
---

# Báo cáo kiểm thử — Wave 03: Mobile UI — Danh mục vật tư (EP-INVENTORY-CATALOG slice 1/4)

> Báo cáo kết quả kiểm thử cho Wave W03, thực thi bởi `agent-test-mobile-ui`.
> Nguồn: `Execution/automated-test-cases/TC-W03-MOBILE-UI.md` (108 TC automated).

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W03 |
| **Subject / execution slice** | Mobile UI — Danh mục vật tư (`FEAT-INV-MOBILE-MENU`, `FEAT-CAT-GRP-{LIST,CREATE,EDIT,DETAIL,DELETE}`, `FEAT-CAT-PROD-{LIST,DETAIL}` view-only) |
| **Boundary(ies)** | `garage-mobile` |
| **Agent thực thi** | `agent-test-mobile-ui` |
| **Nguồn thống kê** | AUTOMATED |
| **Ngày bắt đầu (Run 1)** | 2026-07-03 |
| **Ngày kết thúc (latest run)** | 2026-07-03 |
| **Số lần chạy chính thức** | 1 (Run 1 — initial TEST_EXECUTION, TC artifact trước đó chỉ `READY`, chưa từng thực thi thật) |
| **Loại kiểm thử** | Smoke + Wave + Regression (widget/BLoC, C1) — Full chưa đạt do C2/C3 chặn |
| **Môi trường** | Local (Mac Studio, Flutter `3.44.1`/Dart `3.12.1`, không cần backend live cho cluster C1/C2) |
| **Phiên bản code (latest run)** | `mobile/gf-garage-app` HEAD `b97a0023` (branch `feature/ep-inventory-v2-w03`) |
| **Gate source** | `agent-test-mobile-ui` contract §Test Methodology TEST_EXECUTION Phase |
| **Kết luận tổng quát (latest run)** | **BLOCKED** |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-07-03 | `/test-exec` initial (artifact trước đó `READY`, chưa từng execute) | `b97a0023` (mobile repo) | 108 | 32 | 0 | 76 | 0 | BUG-W03-148, BUG-W03-149 | — (4 bug re-verify-attempted: BUG-W03-030/031/035/036 → `REOPENED` procedural, KHÔNG `VERIFIED`) | BLOCKED |

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | 108 | — | — |
| TC PASS | 32 | — | — |
| TC FAIL | 0 | 0 open P1/P2 FAIL | CÓ |
| TC SKIP | 0 | — | — |
| TC BLOCKED | 76 | 0 (evidence bắt buộc "no fallback" cho visual-fidelity/flow-gated) | **KHÔNG** — cluster C2 (16 TC) + C3 (26 TC) + 34 C1 spec-gap chưa runnable |
| **Tỷ lệ pass** | 29.6% (32/108) | ≥ ngưỡng active gate (chưa đạt do BLOCKED cluster, không phải do FAIL) | KHÔNG |
| Bug P0 mở | 0 | 0 | CÓ |
| Bug P1 mở (mobile-ui liên quan) | 1 mới (`BUG-W03-148`) | 0 | **KHÔNG** |
| Bug P2 mở (mobile-ui liên quan) | 1 mới (`BUG-W03-149`) + 4 `REOPENED` procedural (`BUG-W03-030/031/035/036`) | 0 | **KHÔNG** |

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| P1 (Critical) | 34 | 13 | 0 | 21 | 38.2% |
| P2 (High) | 62 | 18 | 0 | 44 | 29.0% |
| P3 (Medium) | 12 | 1 | 0 | 11 | 8.3% |

> Phân bổ P1/P2/P3 lấy từ cột `Priority` của `TC-W03-MOBILE-UI.md` §4 (không phải severity bug).

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|
| Widget/BLoC logic (cluster C1) | 66 | 32 | 34 | 48.5% |
| Golden visual-fidelity (cluster C2, alchemist) | 16 | 0 | 16 | 0% |
| Native route/gesture (cluster C3, Patrol) | 26 | 0 | 26 | 0% |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated | 108 | 32 | 0 | 76 | 0 | `Execution/automated-test-cases/TC-W03-MOBILE-UI.md` |
| Manual | 52 | — | — | — | — | `Execution/test-cases/TC-W03-MOBILE-UI.md` (read-only, không re-run trong execution slice này — QA Authority ownership riêng) |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

- **N/A — single-run wave (Run 1 initial).** Sẽ điền khi có Run 2 (sau khi `BUG-W03-148`/`BUG-W03-149` fix + re-run cluster C2/C3 + 34 C1 spec-gap được viết bổ sung).

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|
| TC-W03-MUI-HUB-001 | Hub 2-tile golden | BLOCKED | — | `BUG-W03-148` alchemist harness crash |
| TC-W03-MUI-A-001 | MaterialGroupListPage flat-card golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-A-015 | Footer "Thêm nhóm vật tư" → push AddPage | BLOCKED | — | C3 Patrol spec-gap |
| TC-W03-MUI-B-001 | AddMaterialGroupPage golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-C-001 | EditMaterialGroupPage golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-D-001 | MaterialGroupDetailPage golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-E-001 | Popover "Xác nhận" golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-E-003 | Popover "Không thể xóa" golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-F-001 | InternalProductListPage golden | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-F-002 | Mobile view-only — không nút Thêm/Import/Export | BLOCKED | — | spec-gap C1 |
| TC-W03-MUI-G-001 | InternalProductDetailPage golden 4-card | BLOCKED | — | `BUG-W03-148` |
| TC-W03-MUI-G-002 | Mobile view-only — không nút Sửa/Gắn SKU | BLOCKED | — | spec-gap C1 |

> Toàn bộ Smoke suite (P1, Suite=Smoke trong TC file) hiện `BLOCKED` — smoke chưa xác lập baseline chạy được cho cluster C2/C3.

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|---|
| TC-W03-MUI-A-020 | Footer boxShadow + search TabBar AppBar.bottom (regression BUG-W03-035/036 family) | W03 | **PASS** | <1s | Spec mới `regression_a020_f014_test.dart` — QC widget-tree reconstruction, evidence bar "structural presence" theo khai báo gốc của TC |
| TC-W03-MUI-F-014 | Search/filter widget-catalog fidelity + AppBarCustom bottom-slot TabBar (regression BUG-W03-030/031/036) | W03 | **PASS** | <1s | Cùng spec `regression_a020_f014_test.dart` |
| TC-W03-MUI-H-001 | Canonical reuse audit (manual TC-037 adapted) | W03 | BLOCKED | — | spec-gap C1 — chưa viết widget-presence test cho 7 màn |
| TC-W03-MUI-H-002 | Sibling-domain reuse (StatusBadge/StartInfoRow) không regress | W03 | BLOCKED | — | spec-gap C1 |

### 3.3 E2E Journeys

- **N/A** — không thuộc scope `agent-test-mobile-ui` (2 TC deep-flow H-008/H-009 là "E2E-ish mobile-ui scope, không native" nhưng vẫn gán cluster C3 Patrol, hiện `BLOCKED-by-harness` do thiếu Patrol spec — không phải journey cross-service thật, đó là `agent-test-mobile-e2e`).

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

> Bảng đầy đủ 108 TC nằm trong `Execution/automated-test-cases/TC-W03-MOBILE-UI.md` §4 (cột `Status`/`Bug ID` đã update). Bảng dưới đây tóm tắt theo nhóm (không lặp lại 108 dòng).

| Nhóm | Tổng TC | PASS (Run 1) | BLOCKED (Run 1) | Ghi chú |
|---|---|---|---|---|
| HUB — FEAT-INV-MOBILE-MENU | 10 | 4 (HUB-003/004/007/008) | 6 (2×C2-148, 2×C3-patrol, 2×spec-gap) | — |
| A — FEAT-CAT-GRP-LIST | 20 | 5 (A-004/005/006/007/020) | 15 (3×C2-148, 7×C3-patrol, 5×spec-gap) | A-020 PASS qua spec mới |
| B — FEAT-CAT-GRP-CREATE | 15 | 9 (B-004/005/006/007/008/010/013/014/015) | 6 (1×C2-148, 2×C3-patrol, 3×spec-gap) | — |
| C — FEAT-CAT-GRP-EDIT | 13 | 6 (C-004/005/006/009/012/013) | 7 (1×C2-148, 3×C3-patrol, 3×spec-gap) | — |
| D — FEAT-CAT-GRP-DETAIL | 9 | 0 | 9 (2×C2-148, 2×C3-patrol, 5×spec-gap) | — |
| E — FEAT-CAT-GRP-DELETE | 9 | 3 (E-005/006/007) | 6 (2×C2-148, 2×C3-patrol, 2×spec-gap) | — |
| F — FEAT-CAT-PROD-LIST | 14 | 4 (F-004/005/006/014) | 10 (1×C2-148, 4×C3-patrol, 5×spec-gap) | F-014 PASS qua spec mới |
| G — FEAT-CAT-PROD-DETAIL | 9 | 1 (G-005) | 8 (3×C2-148, 1×C3-patrol, 4×spec-gap) | — |
| H — Cross-cutting | 9 | 0 | 9 (1×C2-148, 3×C3-patrol, 5×spec-gap) | — |
| **Tổng** | **108** | **32** | **76** | 16 BLOCKED do `BUG-W03-148`; 26 BLOCKED do Patrol spec-gap C3; 34 BLOCKED do spec-gap C1 |

**Quy ước**: `BLOCKED-by-harness` — chưa chạy được vì harness/spec chưa runnable (2-retry exhausted cho harness readiness; spec-gap = spec chưa được viết trong TEST_PLANNING dù harness bản thân runnable — xác nhận qua smoke test).

---

## 4. Failed Tests — Chi tiết

Không có TC nào FAIL trong lần chạy này. (0 FAIL — toàn bộ TC không-PASS đều ở trạng thái BLOCKED-by-harness, không phải logic/assertion sai.)

---

## 5. Coverage Report

### 5.1 Code Coverage

- **N/A** — cluster C1/C2 QC harness là standalone widget-tree reconstruction (không import trực tiếp `cardoctor_garage_v3` package do native-plugin transitive dependency, theo `TL-W01-MUI-003`), nên coverage tool (`flutter test --coverage`) không đo được coverage thật của production `lib/`. Không áp dụng ngưỡng 80% cho execution slice này.

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC (ước lượng) | AC có TC PASS | AC BLOCKED | Coverage PASS |
|---|---|---|---|---|
| `FEAT-INV-MOBILE-MENU` | 6 | 4 (AC-3/4/6, một phần AC-2) | 2 (AC-1 golden, AC-5 nav) | ~67% |
| `FEAT-CAT-GRP-LIST` | ~9 | ~5 | ~4 | ~55% |
| `FEAT-CAT-GRP-CREATE` | 9 | 7 | 2 | ~78% |
| `FEAT-CAT-GRP-EDIT` | 8 | 5 | 3 | ~63% |
| `FEAT-CAT-GRP-DETAIL` | 4 | 0 | 4 | 0% |
| `FEAT-CAT-GRP-DELETE` | 5 | 3 | 2 | ~60% |
| `FEAT-CAT-PROD-LIST` (view-only) | 7 | 3 | 4 | ~43% |
| `FEAT-CAT-PROD-DETAIL` (view-only) | 5 | 1 | 4 | ~20% |

> Coverage đo trên granularity AC-đại-diện (không phải 1:1 chính xác — nhiều TC map nhiều AC). `FEAT-CAT-GRP-DETAIL` 0% PASS đáng chú ý nhất — toàn bộ 9 TC nhóm D đều BLOCKED (golden/spec-gap), cần ưu tiên fix trước.

---

## 6. Performance Metrics

- **N/A** — ngoài scope `agent-test-mobile-ui` (routed sang `agent-test-performance`).

---

## 7. Issues phát hiện

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug (test-infra) | P1 | Alchemist `^0.14.0` golden render crash (`RenderBox given an infinite size`) trên MỌI `Scaffold`-wrapped tree dưới Flutter `3.44.1` — chặn 100% cluster C2 (16 TC) | `garage-mobile` (QC harness) | `BUG-W03-148` | Open |
| 2 | Bug (test-infra) | P2 | `test/support/test_localization.dart#wrapLocalized` lồng `Scaffold` trong `Scaffold(body: SingleChildScrollView(...))` → cùng loại crash — chặn widget-render re-verify cho `BUG-W03-030/031/035/036` + nghi ngờ ảnh hưởng rộng hơn (nhiều `*_fidelity_test.dart` khác) | `garage-mobile` | `BUG-W03-149` | Open |
| 3 | Bug (re-verify, procedural) | P2 ×4 | `BUG-W03-030/031/035/036` (FIX_DONE) không thể confirm `VERIFIED` đầy đủ do `BUG-W03-149` chặn widget-render assertion tương ứng — flip `REOPENED` thủ tục (KHÔNG phải regression defect gốc; 2/3 hoặc nhiều hơn assertion mỗi bug đã PASS thật) | `garage-mobile` | `BUG-W03-030`, `BUG-W03-031`, `BUG-W03-035`, `BUG-W03-036` | Reopened (procedural) |
| 4 | Observation (planning gap) | — | 34/66 TC cluster C1 và toàn bộ 26 TC cluster C3 trong `TC-W03-MOBILE-UI.md` (QA-reviewed, `READY`) chưa có spec file/test-block runnable dù artifact khai `108 READY` — planning gap giữa "gán cluster" và "viết spec thật" | `garage-mobile` | — | Chưa file bug riêng (planning process gap, xem §7.2) |

### 7.1 Drift phát hiện

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| `TC-W03-MUI-A-020` cite `BUG-W03-035` làm regression target cho `GroupListFooter` | `TC-W03-MOBILE-UI.md` dòng A-020 | `BUGFIX-BUG-W03-035.md` §6 Non-goals ghi rõ "Không touch `group_list_footer.dart`" — bug 035 chỉ chạm Filter footer, KHÔNG chạm List footer. Regression target đúng của `GroupListFooter` là `BUG-W03-025` (đã `VERIFIED`) | Observation-only, không tự sửa TC file citation — QA Authority có thể muốn đổi label "Regression (BUG-W03-035, BUG-W03-036)" → "Regression (BUG-W03-025, BUG-W03-036)" ở lần review kế tiếp |
| Artifact TC `Status Summary` cũ ghi "108 READY ... chưa execute" nhưng chỉ 32/108 có spec runnable thật | `TC-W03-MOBILE-UI.md` (v1, trước run này) | Xác nhận qua execution: chỉ 6 spec file tồn tại, cover 32/108 TC bằng chứng thật (đã cập nhật lên v2 trong run này) | Đã cập nhật `TC-W03-MOBILE-UI.md` Status Summary + Changelog; khuyến nghị lesson-learned cho TEST_PLANNING wave sau (xem `Tracking/TEST-LESSONS-LEARNED.md`) |

### 7.2 Handoff cập nhật registry / tracker (nếu cần)

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | W03 mobile-ui aggregate | 32 PASS / 76 BLOCKED / 0 FAIL, overall BLOCKED | QA Authority |
| `Execution/work-packages/PKG-W03-inventory-catalog.md` | §5 exit criteria mobile-ui | Chưa đạt — cần fix `BUG-W03-148`/`149` + bổ sung spec cho 34 C1 + 26 C3 TC trước khi có thể GO | Delivery Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | **KHÔNG** | Toàn bộ 12 TC Smoke suite hiện BLOCKED (golden/patrol/spec-gap) |
| Regression đạt ngưỡng active gate? | KHÔNG (partial) | 2/4 regression TC PASS (A-020, F-014 — spec mới); 2/4 BLOCKED (H-001/002 — spec-gap) |
| E2E Journeys đạt ngưỡng active gate? | N/A | Ngoài scope agent này |
| Coverage đạt ngưỡng active gate? | N/A | Không đo được (harness reconstruction, không import production code) |
| Bug P0 = 0? | CÓ | 0 bug P0 mới |
| Open bugs đạt ngưỡng active gate? | **KHÔNG** | 1 P1 mới (`BUG-W03-148`) + 1 P2 mới (`BUG-W03-149`) + 4 P2 `REOPENED` thủ tục |
| Tenant isolation = 0 leakage? | N/A | Ngoài scope agent này (routed `agent-test-isolation`) |

### 8.2 Quyết định

- [ ] CHO QUA GATE (GO)
- [x] **KHÔNG CHO QUA GATE (NO-GO)** — Cluster C2 (16 TC, alchemist harness crash `BUG-W03-148`) và cluster C3 (26 TC, thiếu Patrol spec) hoàn toàn chưa chạy được thật; 34/66 TC cluster C1 thiếu spec-block runnable. Theo `agent-test-mobile-ui` §Forbidden Actions ("KHÔNG chốt PASS/PASS_WITH_NOTES/CONDITIONAL GO khi còn visual-gated/flow-gated cluster chưa chạy thật"), kết luận execution slice này PHẢI là **BLOCKED**.
- [ ] CHO QUA GATE CÓ ĐIỀU KIỆN (CONDITIONAL GO)

### 8.3 Ghi chú cho wave tiếp theo

- **Ưu tiên 1**: Xin CR bump `alchemist` version (hoặc pin Flutter SDK tương thích) trong `Execution/auto/harness/alchemist/pubspec.yaml` (Lớp A frozen — cần CR approval) để mở khoá toàn bộ cluster C2 (16 TC, bao gồm mọi Smoke-suite golden).
- **Ưu tiên 2**: `agent-fix-garage-mobile` fix `test/support/test_localization.dart#wrapLocalized` (nested-Scaffold) để cho phép re-verify hoàn chỉnh `BUG-W03-030/031/035/036` (hiện `REOPENED` thủ tục, KHÔNG phải regression thật) + audit blast-radius rộng hơn trong `test/ui/inventory_catalog/**`.
- **Ưu tiên 3**: Bổ sung Patrol spec files cho 26 TC cluster C3 (`Execution/auto/specs/W03/mobile-ui/patrol/`) — hiện hoàn toàn chưa có; 3 emulator sẵn sàng (`Pixel6_API33_arm64`, `My_Android_33`, `apple_ios_simulator`) chưa được dùng.
- **Ưu tiên 4**: Bổ sung 34 spec-block C1 còn thiếu (wording/element-presence/BLoC-logic đơn giản, không cần golden/Patrol) — đây là phần "rẻ nhất" để đóng gap, nên làm trước cluster C2/C3.
- Lesson-learned: TEST_PLANNING artifact khai `108 READY` nhưng chỉ 32 TC có spec runnable thật lúc TEST_EXECUTION — cần gate chặt hơn ở review `/qc-start` để xác nhận spec file tồn tại + `flutter test` chạy được TRƯỚC khi đánh dấu `READY` (xem `Tracking/TEST-LESSONS-LEARNED.md` entry mới).

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-07-03 | Khởi tạo TR-W03-MOBILE-UI — Run 1 initial TEST_EXECUTION. 32/108 PASS, 76/108 BLOCKED-by-harness, 0 FAIL. 2 bug mới (`BUG-W03-148` P1 alchemist harness, `BUG-W03-149` P2 wrapLocalized test-infra), 4 bug re-verify-attempted (`BUG-W03-030/031/035/036` → `REOPENED` procedural). Overall verdict = BLOCKED. | agent-test-mobile-ui |
