---
type: ux-index
artifact_kind: ux-index
status: ACTIVE
version: 8
tier: T2
owner_authority: Business Authority
last_reviewed: "2026-06-16"
supersedes: "none"
---

# Product/ux/ — UX Layer Index

> Thư mục chứa **behavior specs** (luồng UX end-to-end) + (optional) **visual source mockups** cho Garage. File này là index — không chứa spec chi tiết.
>
> Policy gốc: xem [DESIGN-SOURCE-POLICY.md](../DESIGN-SOURCE-POLICY.md).

---

## 1. Mục đích

UX layer giải quyết 3 câu hỏi mà PRD + feature spec + business rule không trả lời được:

1. **Người dùng đi qua màn nào, theo thứ tự nào?** — flow end-to-end, cross-feature navigation.
2. **Mỗi màn cư xử thế nào ở trạng thái non-happy?** — loading, empty, error, retry, optimistic + rollback.
3. **Pixel-level wireframe trông thế nào?** — layout, spacing, typography, copy (chỉ áp dụng khi có visual source).

Garage brownfield: câu (3) hiện trả lời bằng **production code** trong `garage-functions/gf-gms-web/` và `garage-functions/garage-mobile/`. Câu (1) + (2) là phạm vi của thư mục này.

---

## 2. Inventory — 10 UX Flow (behavior specs)

| # | Flow | Kind | File | Referenced Features |
|---|---|---|---|---|
| 1 | Lịch hẹn & tiếp nhận xe | FLOW | [UX-FLOW-BOOKING.md](UX-FLOW-BOOKING.md) | 8 FEAT (EP-BOOKING) |
| 2 | Tiếp nhận, sửa chữa xe | FLOW | [UX-FLOW-SERVICE-REPAIR.md](UX-FLOW-SERVICE-REPAIR.md) | 4 FEAT (EP-SERVICE-ORDER nhóm sửa chữa) |
| 3 | Bán lẻ phụ tùng | FLOW | [UX-FLOW-RETAIL.md](UX-FLOW-RETAIL.md) | 4 FEAT (EP-SERVICE-ORDER nhóm bán lẻ) |
| 4 | Thanh toán, ghi nhận công nợ | FLOW | [UX-FLOW-PAYMENT.md](UX-FLOW-PAYMENT.md) | 3 FEAT (EP-SETTLEMENT) |
| 5 | Mua hàng qua sàn | FLOW | [UX-FLOW-PROCUREMENT.md](UX-FLOW-PROCUREMENT.md) | 10 FEAT (EP-PROCUREMENT) |
| 6 | Nhập kho | FLOW | [UX-FLOW-INVENTORY-RECEIPT.md](UX-FLOW-INVENTORY-RECEIPT.md) | 4 FEAT (EP-INVENTORY-RECEIPT) |
| 7 | Xuất kho | FLOW | [UX-FLOW-INVENTORY-DELIVERY.md](UX-FLOW-INVENTORY-DELIVERY.md) | 4 FEAT (EP-INVENTORY-DELIVERY) |
| 8 | Tồn kho theo kỳ | FLOW | [UX-FLOW-INVENTORY-COUNT.md](UX-FLOW-INVENTORY-COUNT.md) | 1 FEAT (EP-INVENTORY-PERIOD) |
| 9 | Tồn kho | FLOW | [UX-FLOW-INVENTORY-STOCK.md](UX-FLOW-INVENTORY-STOCK.md) | 5 FEAT (EP-INVENTORY-STOCK) |
| 10 | Quyết toán bảo hiểm, hồ sơ BH & công nợ BH | FLOW | [UX-FLOW-INSURANCE-SETTLEMENT.md](UX-FLOW-INSURANCE-SETTLEMENT.md) | 6 FEAT (EP-INSURANCE-SETTLEMENT) |

> 44/85 features có flow cover trực tiếp. 41 features còn lại (catalog CRUD, customer/vehicle CRUD, employee CRUD, marketing, dashboard, support) dùng pattern UX đơn giản (list/detail/create/edit) — đặc tả nằm trong từng `features/FEAT-*.md` §4 UX Reference, không tạo flow riêng.

### 2.1 Inventory V2 — Forward Design `[DRAFT/PROPOSED — chưa cutover]`

| # | Flow | Kind | File | Referenced Features |
|---|---|---|---|---|
| V2-1 | Danh mục vật tư kho (Mã SP nội bộ & Nhóm VTHH) | FLOW | [UX-FLOW-INVENTORY-CATALOG.md](UX-FLOW-INVENTORY-CATALOG.md) | 12 FEAT (EP-INVENTORY-CATALOG) |
| V2-2 | Kỳ kế toán & Tính giá xuất kho | FLOW | [UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md](UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) | 10 FEAT (FEAT-AP-* + FEAT-PRC-*) |
| V2-3 | Tồn đầu kỳ | FLOW | [UX-FLOW-INVENTORY-OPENING-BALANCE.md](UX-FLOW-INVENTORY-OPENING-BALANCE.md) | 3 FEAT (FEAT-OB-*) |
| V2-4 | Nhập kho (V2) | FLOW | [UX-FLOW-INVENTORY-RECEIPT-V2.md](UX-FLOW-INVENTORY-RECEIPT-V2.md) | 7 FEAT (FEAT-IR-*-V2 + DELETE/PRINT/EXPORT) |
| V2-5 | Xuất kho (V2) | FLOW | [UX-FLOW-INVENTORY-DELIVERY-V2.md](UX-FLOW-INVENTORY-DELIVERY-V2.md) | 7 FEAT (FEAT-ID-*-V2 + DELETE/PRINT/EXPORT) |
| V2-6 | Báo cáo tồn kho (V2) | FLOW | [UX-FLOW-INVENTORY-STOCK-V2.md](UX-FLOW-INVENTORY-STOCK-V2.md) | 3 FEAT (STK-LIST-V2 + IP-VIEW-V2 + STK-DETAIL-V2) |

> Flow thiết kế hướng tới (to-be) cho rework phần kho V2 — chưa thay baseline. Các flow V2 còn lại sẽ bổ sung dần.

---

## 3. Visual source mode — XOR (design vs figma)

> Detection theo convention của `scripts/spawn-dev.sh` (sẽ active khi Phase 5 Agent setup chạy):

| Trạng thái thư mục `design/` | UX source mode | Ghi chú |
|---|---|---|
| Có ≥1 `*.html` (recursive) | `design` | HTML mockups inline vào prompt DEV/FIX agent |
| Không có `*.html` (hoặc thư mục `design/` không tồn tại) | `figma` | Orchestrator phải pre-fetch Figma qua MCP |

Override: `STATE.ux_source` = `"design"` / `"figma"` / `null` (auto). Mặc định `null`.

> Detection chỉ nhìn extension **`*.html`**. File `.md`, `.png`, README, `_TEMPLATE.*` không tính.

**Hiện trạng Garage (2026-05-27)**:

- Thư mục `Product/ux/design/` **chưa tồn tại** trong repo design.
- MCP figma **chưa được kết nối** cho repo này.
- Brownfield baseline: 79/79 features đã ship — visual source-of-truth = production code (web + mobile).
- Khi có feature mới post-baseline cần wireframe trước code → Business Authority + Senior PM quyết định mode qua CR; ghi nhận trong [DESIGN-SOURCE-POLICY.md](../DESIGN-SOURCE-POLICY.md) §2.

> **Never both**: design dir vừa có HTML vừa có Figma link là anti-pattern (drift, ambiguity, wasted prompt budget). Pick một source per feature.

---

## 4. Convention cho `UX-FLOW-*.md` (behavior specs)

> File `UX-FLOW-*.md` đã có pattern thống nhất qua 9 flow hiện hành.

Naming: `UX-FLOW-{SCOPE}.md` — SCOPE viết hoa, dùng dấu nối, mô tả domain (`BOOKING`, `INVENTORY-RECEIPT`, `SERVICE-REPAIR`).

Frontmatter: `type: ux-flow`, `artifact_kind: ux-flow`, `tier: T2`, `owner_authority: Business Authority`.

Nội dung bắt buộc:

| Section | Mô tả |
|---|---|
| §Mục tiêu flow | Outcome end-to-end (1-3 câu) |
| §Persona & device | `garage-owner` / `accountant` + web / mobile / cả 2 |
| §Pre-condition | State giả định trước khi flow bắt đầu |
| §Steps | Sequence màn → màn, ghi rõ trigger (button click, form submit, system event) |
| §States per screen | Loading / empty / error / success / optimistic + rollback |
| §Validation real-time | Field-level + form-level, tiếng Việt, dùng tên hiển thị từ Knowledge Graph |
| §Cross-flow nav | Liên kết sang flow khác (booking → SO → settlement) |
| §Error UX | Error code → message tiếng Việt; retry policy; fallback |
| §A11y | Keyboard order, focus trap, ARIA labels, screen-reader text |
| §Referenced features | FEAT-IDs cover bởi flow này |

Anti-pattern (cấm):

- Pseudo-code component code trong UX-FLOW (component code thuộc về repo `garage-web` / `garage-mobile`)
- Mock JSON dài trong UX-FLOW (schema thuộc về `Architecture/api/*.md` hoặc `Architecture/integrations/*.md`)
- Copy text bằng tiếng Anh — vi phạm BR-CORE-003 (i18n vi-VN)

---

## 5. Convention cho `Product/ux/design/` (khi mode `design` active)

> Section này active **khi và chỉ khi** có quyết định bật mode `design` (xem [DESIGN-SOURCE-POLICY.md](../DESIGN-SOURCE-POLICY.md) §2).

### 5.1 File naming

```
Product/ux/design/
├── README.md                           # (sẽ tạo khi mode active — không tính vào detection)
├── FEAT-BOOK-CREATE.html               # per-feature mockup
├── FEAT-SO-CREATE.html
├── gf-sales/                           # per-boundary subfolder (optional)
│   ├── booking-list.html
│   └── service-order-detail.html
└── shared/                             # cross-feature primitives
    ├── nav.html
    └── design-tokens.html
```

`scripts/spawn-dev.sh` chọn HTML theo thứ tự (sẽ implement khi Phase 5 chạy):

1. `Product/ux/design/{FEAT-ID}*.html` — cho mỗi FEAT-ID trong `STATE.features_in_flight`
2. `Product/ux/design/{boundary_active}/*.html` — cho boundary đang spawn
3. `Product/ux/design/shared/*.html` — luôn include
4. Fallback: ALL `*.html` recursively (nếu project nhỏ chưa có substructure)

Duplicates được dedup.

### 5.2 HTML mockup phải có gì

HTML mockup là **fidelity-1 reference**, không phải wireframe loose. DEV agent dịch sang React 19 (`garage-web`) hoặc Flutter (`garage-mobile`). Yêu cầu:

- **Layout thật**: section, grid, spacing rhythm thật — không Lorem boxes
- **Copy thật tiếng Việt**: text hiển thị trong giọng văn / thuật ngữ của Garage Care, dùng tên hiển thị từ Knowledge Graph
- **States**: loading / empty / error / success — separate files hoặc separate sections
- **Responsive markers**: breakpoint hint qua comment (`<!-- breakpoint: md -->`) hoặc media query
- **Components**: design system primitive được đánh dấu (`<button class="btn-primary">`)
- **Tokens**: CSS variables cho color / spacing / typography để map sang shadcn theme (web) hoặc Material theme (mobile)
- **Interactions**: data-attribute hoặc comment cho hover / focus / transition
- **A11y**: ARIA, label, keyboard order thật

Self-contained là tốt nhất — inline `<style>` OK, base64 image OK (nặng), external CDN script chỉ khi cần.

### 5.3 HTML mockup KHÔNG nên có

- Page chưa hoàn thiện kèm `TODO` comment
- Backend logic (inline mock JSON nhỏ OK; SQL query thì không)
- Auth flow thật (UI login OK; OAuth secret thì không)
- Framework-specific code (React JSX, Flutter widget) — HTML mockup là **stack-agnostic**
- Copy tiếng Anh — vi phạm BR-CORE-003

### 5.4 Tools tạo HTML mockup

- gstack `/design-html` — generate Pretext-native HTML từ approved mockup / plan
- gstack `/design-shotgun` — generate multi-variant để so sánh
- Hand-coded bởi designer / PM
- Export từ Figma (Figma → HTML plugin)

Commit **final approved version**. Iteration history nằm trong design exploration notes (ngoài repo design), không vào thư mục này.

---

## 6. Khi nào dùng Figma thay vì HTML

Bật mode `figma` (để `Product/ux/design/` rỗng, không tạo `*.html`) khi:

- Designer-led project, design thay đổi nhanh trên Figma
- Org standard yêu cầu Figma là source-of-truth
- Design system maintain dưới dạng Figma library
- Product team không ship HTML mockup

Khi đó, mỗi `Product/features/FEAT-*.md` §4 UX Reference phải có Figma URL trỏ tới frame cụ thể, và project phải có MCP figma được kết nối để orchestrator pre-fetch JSON.

---

## 7. Size considerations

Một HTML mockup nặng (~50-80KB với inline style) × 5 feature = ~300KB chỉ cho UX trong spawn prompt. Nếu prompt quá lớn:

- Tách state thành file riêng (`FEAT-BOOK-CREATE-empty.html`, `-loading.html`, `-error.html`)
- Move shared chrome (nav, footer) vào `shared/` 1 lần — được dedup
- Strip `<style>` block nếu DEV agent đã có design token reference
- Last resort: `STATE.ux_source = "figma"` override cho 1 wave cụ thể

---

## 8. Cross-references

| Cần | Đi đến |
|---|---|
| Design source policy (XOR rule, FM-016 gate) | [../DESIGN-SOURCE-POLICY.md](../DESIGN-SOURCE-POLICY.md) |
| Feature spec + AC | [../features/](../features/) |
| Mapping UI action → GraphQL operation | [../../Architecture/integrations/INTEG-FE-*, INTEG-MOB-*](../../Architecture/integrations/) |
| Knowledge Graph (entity display names, status labels) | [../../Execution/knowledge-graphs/](../../Execution/knowledge-graphs/) |
| Product index | [../README.md](../README.md) |
| Business rules (copy / validation requirement) | [../BUSINESS-RULES.md](../BUSINESS-RULES.md) |

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-27 | 1 | Business Authority | Khởi tạo UX index: liệt kê 9 UX-FLOW (38/79 feature cover trực tiếp), document convention cho behavior spec + (future) design/ HTML mockup, reference DESIGN-SOURCE-POLICY |
| 2026-05-27 | 2 | Business Authority | Thêm UX-FLOW thứ 10: `UX-FLOW-INSURANCE-SETTLEMENT` (10 FEAT — EP-INSURANCE-SETTLEMENT) cover toàn bộ luồng vận hành thực tế quyết toán BH từ tiếp nhận xe → phân bổ nguồn TT → điều chỉnh BH → tạo cặp QT KH+BH → lập bộ hồ sơ 4 tài liệu → xuất PDF → đối soát thanh toán BH (nhiều đợt) → theo dõi công nợ trên Dashboard. Cập nhật tổng cover 38/79 → 48/89 features. |
| 2026-05-27 | 3 | Business Authority | Xoá FEAT-INS-SO-PAYMENT-SOURCE (đã production) → flow #10 còn **9 FEAT**; cập nhật cover 48/89 → **47/88 features**. |
| 2026-05-27 | 4 | Business Authority | Xoá FEAT-INS-STL-CREATE (tạo phiếu QT đã production) → flow #10 còn **8 FEAT**; cập nhật cover 47/88 → **46/87 features**. |
| 2026-05-27 | 5 | Business Authority | Xoá 3 features FEAT-INS-COMPANY-* (danh sách công ty BH = system-seeded) → flow #10 còn **5 FEAT**; cập nhật cover 46/87 → **43/84 features**. |
| 2026-06-16 | 7 | Business Authority | Housekeeping: sửa số liệu cũ — §2 mẫu số "84 features" → "85 features" (44/85, baseline hiện 85 feature); dòng UX-FLOW #10 "5 FEAT" → "6 FEAT" (EP-INSURANCE-SETTLEMENT hiện 6 FEAT, khớp README §3/§6). Không đụng nội dung nghiệp vụ bảo hiểm / Inventory V2. |
| 2026-06-12 | 6 | Business Authority | Additive (Inventory V2 forward design — gộp từ workstream kho): thêm §2.1 liệt kê 6 UX-FLOW Inventory V2 (CATALOG, ACCOUNTING-PERIOD, OPENING-BALANCE, RECEIPT-V2, DELIVERY-V2, STOCK-V2), nhãn [DRAFT/PROPOSED — chưa cutover]. KHÔNG đụng baseline + flow #10 bảo hiểm. |
| 2026-06-16 | 8 | Business Authority | Gỡ con trỏ "Bối cảnh: `Plan/INVENTORY-V2-RULES.md`" khỏi §2.1 blockquote Inventory V2 forward-design (note file sắp xóa). |
