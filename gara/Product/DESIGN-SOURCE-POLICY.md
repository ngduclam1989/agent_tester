---
type: design-policy
artifact_kind: design-policy
status: ACTIVE
version: 6
tier: T1
owner_authority: Business Authority
last_reviewed: "2026-06-24"
---

# Design Source Policy — Garage (Garage Care)

## Mục tiêu

Định nghĩa **visual source-of-truth** cho dự án Garage và quy tắc DEV / FIX agent áp dụng khi implement screen mới hoặc fix screen hiện hành. Vì Garage là brownfield production, policy này phải phân biệt rõ baseline (đã ship) và new feature work.

---

## 1. Brownfield baseline — Production UI là source-of-truth

GMS Garage đã production với 15 epics / 79 features đã ship trên 2 nền tảng (baseline). Scope mới hậu baseline: EP-INSURANCE-SETTLEMENT (6 FEAT, PLANNED) — chưa có production code, sẽ dùng mode `design` hoặc `figma` khi DEV stage kick-off. Các FEAT-INS-* hiện đã gắn Figma link (web + mobile) theo mode `figma`. *(FEAT-INS-STL-CREATE là CR mở rộng màn production FEAT-STL-CREATE — visual source = Figma, web node 13535-157815, mobile node 553-27738.)*

Scope mới thứ hai: **EP-INVENTORY-CATALOG** (Inventory V2, PKG-W03 — wave figma `03`) — **11 FEAT** đã gắn Figma theo mode `figma`. Web file `EMGjGsnAJzGoGwTSK7dTuZ` (GMS-v.3); mobile file `5YU4H3iY726P8KNxI9oCYF` (App-Garage-V3):
> - **Nhóm VTHH — FEAT-CAT-GRP-LIST/CREATE/DETAIL/EDIT/DELETE** (5): **web + mobile đầy đủ** (mobile có thêm/sửa/xóa/list/xem).
> - **Mã SP nội bộ — FEAT-CAT-PROD-LIST/DETAIL** (2): **web đầy đủ + mobile view-only** (mobile chỉ list + xem).
> - **Mã SP nội bộ — FEAT-CAT-PROD-CREATE/EDIT/DELETE/IMPORT** (4): **web-only** (mobile không làm).
> - FEAT-CAT-PROD-EXPORT: không có Figma — chỉ có file mẫu template `.xlsx` (xem `Product/ux/assets/`).
>
> Registry: `figma-links.yaml` key wave `03`. *(Mode `figma` cho EP-INVENTORY-CATALOG suy ra từ sự hiện diện của Figma link ở §UI/UX Reference — chốt mode chính thức là quyết định Business Authority qua CR nếu cần.)*

| Nền tảng | Repo | Vai trò khi đối chiếu |
|---|---|---|
| Web GMS (desktop) | `garage-functions/gf-gms-web/` (React 19 / Vite / TanStack Router / shadcn/ui) | Visual source-of-truth cho web flows đã production |
| App Garage (mobile) | `garage-functions/garage-mobile/` (Flutter 3.41 / BLoC) | Visual source-of-truth cho mobile flows đã production |

> Khi đụng tới screen đã production (TD remediation, bugfix, behavior tweak): **đọc code component thực tế** + đối chiếu `Product/ux/UX-FLOW-*.md` (behavior spec). KHÔNG vẽ lại từ description.

---

## 2. Visual source mode — chọn 1 trong 2 (XOR) cho NEW feature

> Áp dụng cho feature mới được thêm post-baseline (chưa có code).

| Mode | Khi chọn | Marker |
|---|---|---|
| **`design`** (HTML mockups) | Có người làm UI mockups (qua gstack `/design-html`, designer hand-code, hoặc Figma export sang HTML) | `Product/ux/design/` chứa ≥1 `*.html` (recursive) |
| **`figma`** (live Figma) | Designer làm trên Figma; project có MCP figma được cấu hình | Figma link (per-platform) trong mỗi `Product/features/FEAT-*.md` §UI/UX Reference + pre-fetch qua `/prefetch-figma` |

> **Hiện trạng (2026-05-29)**: MCP figma **đã kết nối** (`mcp__plugin_figma_figma__*`). Flow figma 2-session đã sẵn sàng cho cả 2 nền tảng — xem `.agents/_ref-frontend-figma-prefetch-flow.md` + `.agents/_ref-figma-mcp-tools.md`. `Product/ux/design/` (HTML mode) vẫn chưa tồn tại. Chọn mode cho từng feature mới: owner Business Authority + Senior PM, ghi nhận qua CR.
>
> **Never both**: design dir vừa có HTML vừa có Figma link là anti-pattern (drift, ambiguity).

### 2.1 §UI/UX Reference table schema (figma mode — 2 nền tảng)

Garage có 2 UI boundary (`garage-web`, `garage-mobile`) với 2 design-system khác nhau → mỗi `FEAT-*.md`
§UI/UX Reference dùng cột **Platform** để tách Figma link theo nền tảng:

```markdown
## N. UI/UX Reference

| Kind | Platform | URL / Path |
|---|---|---|
| Figma | web    | https://www.figma.com/design/{key}/...?node-id=... |
| Figma | mobile | https://www.figma.com/design/{key}/...?node-id=... |
| Wireframe | — | Product/ux/UX-FLOW-BOOKING.md |
```

- `/prefetch-figma web` đọc row `Platform=web`; `/prefetch-figma mobile` đọc `Platform=mobile`.
- Thiếu row platform → fallback wireframe (`FIGMA_LINK_MISSING`). Pre-fetch ghi spec ra
  `Product/ux/figma-{web|mobile}/{FEAT-ID}.md`; oracle ra `Product/ux/figma-test-{web|mobile}/{FEAT-ID}-oracle.md`.

---

## 3. Behavior source — `Product/ux/UX-FLOW-*.md`

> Bắt buộc đọc cho mọi screen, kể cả khi đã có visual source.

Hệ thống có 10 UX flow file mô tả luồng end-to-end (xem [README.md §6](README.md#6-ux-inventory)). Mỗi file cover:

- Trạng thái màn hình (loading, empty, error, success)
- Optimistic UI và rollback behavior
- Validation real-time và messaging tiếng Việt
- A11y requirements (keyboard, screen-reader)
- Cross-flow navigation (vd. booking → SO → settlement)

> Behavior source giải quyết những thứ visual source không truyền đạt được: timing, transition, error UX, state-machine.

---

## 4. Thứ tự ưu tiên khi conflict

1. **Product spec** (PRD + feature ACs + business rules) — thắng visual về **behavior** và **business correctness**
2. **Production code** (đối với screen đã ship) HOẶC **visual source** HTML/Figma (đối với feature mới) — thắng wireframe/text description về **layout, spacing, typography, color, copy**
3. **`Product/ux/UX-FLOW-*.md`** — phụ trợ visual source về animations, states, error UX, a11y, cross-flow nav

> Visual source chưa có cho 1 màn hình critical mới → ghi `FALLBACK: missing visual` trong wave block + raise blocker MED tới Business Authority.

---

## 5. UI Action → GraphQL Operation Mapping (FE / Mobile)

> **CRITICAL**: nếu boundary là `garage-web` (React) hoặc `garage-mobile` (Flutter), visual source **không đủ**. Agent cần thêm mapping table.

Mapping được document trong `Architecture/integrations/INTEG-FE-*.md` (web) hoặc `INTEG-MOB-*.md` (mobile). Mỗi actionable element (button, form submit, navigation) phải có 1 row map sang concrete GraphQL operation (Query / Mutation / Subscription) thuộc `agg-garage-graph` hoặc `agg-sso-graph`.

File mapping hiện hành cho Garage:

| File | Vai trò |
|---|---|
| [INTEG-FE-garage-web-agg-garage-graph.md](../Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md) | Web → BFF garage (chính) |
| [INTEG-FE-garage-web-agg-sso-graph.md](../Architecture/integrations/INTEG-FE-garage-web-agg-sso-graph.md) | Web → BFF SSO (auth, session, chat, dashboard proxy) |
| [INTEG-MOB-garage-mobile-agg-garage-graph.md](../Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md) | Mobile → BFF garage |
| [INTEG-MOB-garage-mobile-agg-sso-graph.md](../Architecture/integrations/INTEG-MOB-garage-mobile-agg-sso-graph.md) | Mobile → BFF SSO |

**Pre-DEV gate**: architect đảm bảo mapping table tồn tại + đầy đủ rows TRƯỚC khi spawn DEV agent. Thiếu → FM-016, agent stop và request CR tới Solution Architect.

---

## 6. Hướng dẫn bắt buộc cho DEV / FIX agent khi implement screen

### 6.1 Pre-code reading list

Theo thứ tự:

1. `Product/PRD.md` §3 Constraints + §7 Epic chứa feature
2. `Product/features/FEAT-{id}.md` (acceptance criteria + §4 UX Reference)
3. `Product/business-rules/BR-{boundary}.md` các rule liên quan
4. `Product/ux/UX-FLOW-{flow}.md` (behavior spec)
5. Visual source — production code (brownfield screen) HOẶC HTML/Figma (new feature)
6. (FE/Mobile only) `Architecture/integrations/INTEG-{FE|MOB}-*.md` §Mapping
7. `Execution/knowledge-graphs/{boundary}.knowledge-graph.yaml` (entity names, permissions, allowed transitions)

### 6.2 Pre-code checklist (FM-016)

- [ ] Visual source đã xác định:
  - Brownfield screen → production code path trong `garage-web` hoặc `garage-mobile`
  - New feature → mode `design` hoặc `figma` chọn xong + content tồn tại
- [ ] (FE / Mobile) Mapping table đầy đủ rows cho mọi actionable element
- [ ] Op Names trong Mapping match generated hooks/classes (run codegen trước nếu cần)
- [ ] Error codes referenced match BFF schema's `extensions.code` enum
- [ ] Copy tiếng Việt khớp Knowledge Graph (display names, status labels)
- [ ] Persona check: feature có ảnh hưởng EP-SUPPORT chat-theo-xe không (accountant bị chặn)

Fail bất kỳ → STOP, return early với `needs_review` lên Business Authority / SA.

### 6.3 Implementation source-mapping

| Visual decision | Source (brownfield) | Source (new feature, design mode) | Source (new feature, figma mode) |
|---|---|---|---|
| Layout structure | Production component code | HTML markup | Figma layout JSON |
| Spacing rhythm | CSS / Tailwind / Flutter Theme | CSS in HTML | Figma auto-layout |
| Typography | Theme tokens | CSS | Figma text styles |
| Color tokens | shadcn theme / Material color scheme | CSS variables | Figma color styles |
| Copy (tiếng Việt) | Production text + i18n files | HTML innerText | Figma text |
| Interactions | Production handler code + UX-FLOW spec | HTML data-attrs / comments | Figma prototype |
| States (loading, empty, error) | Production state machine + UX-FLOW spec | Separate HTML files | Figma variants |
| GraphQL ops to call | Mapping table + production usage | Mapping table | Mapping table |

> **figma mode — pre-fetched spec, KHÔNG đọc Figma trực tiếp**: DEV/test sub-agent KHÔNG gọi MCP. Orchestrator
> pre-fetch qua `/prefetch-figma {boundary}` → spec markdown đã transform sẵn:
>
> | Platform | DEV spec | Transform vocabulary | Oracle (test) |
> |---|---|---|---|
> | web (`garage-web`) | `Product/ux/figma-web/{FEAT-ID}.md` | `→ shadcn:` / `→ tw:` — `.agents/_ref-web-transform-figma.md` | `Product/ux/figma-test-web/{FEAT-ID}-oracle.md` |
> | mobile (`garage-mobile`) | `Product/ux/figma-mobile/{FEAT-ID}.md` | `→ flutter:` / `→ theme:` (AppColors/AppTextStyle) — `.agents/_ref-mobile-transform-figma.md` | `Product/ux/figma-test-mobile/{FEAT-ID}-oracle.md` |
>
> Spec có frontmatter `status:` fallback → dùng `fallback:` path (UX-FLOW wireframe). Flow: `.agents/_ref-frontend-figma-prefetch-flow.md`.

### 6.4 Anti-patterns (cấm)

- "Tôi đoán layout từ feature description" → sai, đọc production code hoặc visual source
- "Đoán mutation name từ button label" → sai, dùng Mapping table
- "Skip optimistic UI vì UX không nói rõ" → sai, optimistic = contract trong Mapping
- "Copy HTML verbatim vào codebase" → sai, **dịch** sang React / Flutter component đúng convention codebase
- "Sửa copy theo ý mình cho gọn" → sai, copy lấy từ Knowledge Graph hoặc UX-FLOW; muốn đổi phải qua CR
- "Tạo screen mới mà không cập nhật INTEG-FE/MOB Mapping" → sai, mapping phải có trước khi merge

---

## 7. Why this policy exists for agents

Spawn DEV / FIX agents (subagents qua Agent tool):

- KHÔNG có MCP access → không tự fetch Figma được, không tự đọc browser
- KHÔNG có persistent context → không nhớ prior conversation
- KHÔNG có git history awareness → không biết visual source vừa update
- → Orchestrator phải pre-fetch + inline mọi context. Spawn script (sẽ build trong Phase 5) sẽ làm việc này theo policy trên.

Workflow chi tiết: sẽ document trong `Execution/PROTOCOL.md §DEV` khi Phase 5 (Agent setup) kick-off.

---

## 8. Triggers cho cập nhật policy này

| Tình huống | Action |
|---|---|
| Project bật MCP figma | Bump version, update §2 Mode availability |
| Có người làm HTML mockups → tạo `Product/ux/design/` | Bump version, document mode `design` đang active |
| Đổi tech stack frontend (vd. React → Solid) | CR CRITICAL, update §1 + §6.3 source-mapping |
| Thêm nền tảng mới (vd. desktop Electron) | CR MAJOR, mở rộng §1 |
| INTEG-FE/MOB-* schema thay đổi đáng kể | Bump version §5 |

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-27 | 1 | Business Authority | Khởi tạo design-source policy cho GMS Garage brownfield: §1 production code = baseline source, §2 XOR mode cho new feature (hiện chưa kích hoạt), §5 reference INTEG-FE/MOB mapping (FM-016) |
| 2026-05-27 | 2 | Business Authority | Cập nhật §1 ghi nhận scope mới hậu baseline EP-INSURANCE-SETTLEMENT (10 FEAT, PLANNED) — chưa có production code, sẽ dùng mode `design`/`figma`. Cập nhật §3 đếm UX flow 9 → 10 (thêm UX-FLOW-INSURANCE-SETTLEMENT). |
| 2026-05-28 | 3 | Business Authority | §1 đồng bộ EP-INSURANCE-SETTLEMENT 10 → **5 FEAT** (bỏ FEAT-INS-COMPANY-* + SO-PAYMENT-SOURCE + STL-CREATE — danh sách công ty BH system-seeded, các năng lực còn lại = baseline production). |
| 2026-06-15 | 4 | Business Authority | §1 đồng bộ EP-INSURANCE-SETTLEMENT 5 → **6 FEAT** — tái lập **FEAT-INS-STL-CREATE** (CR mở rộng màn production FEAT-STL-CREATE: panel phân bổ BH read-only trên màn Tạo phiếu QT). Visual source = Figma, mode `figma`: web node `13535-157815` + mobile node `553-27738`. §3 đếm UX flow giữ **10** (cập nhật UX-FLOW-INSURANCE-SETTLEMENT, không thêm flow mới). |
| 2026-06-24 | 5 | Business Authority | §1 ghi nhận **scope mới thứ hai EP-INVENTORY-CATALOG** (Inventory V2, wave figma `03`) — 6 FEAT mã SP nội bộ đã gắn **Figma web** (mode `figma`, file `EMGjGsnAJzGoGwTSK7dTuZ`); mobile: 4 FEAT web-only + LIST/DETAIL chờ link. Registry `figma-links.yaml` wave `03` synced (6 web entry). |
| 2026-06-24 | 6 | Business Authority | §1 cập nhật catalog wave 03 đầy đủ: **+5 FEAT-CAT-GRP** (web + mobile, mobile file `5YU4H3iY726P8KNxI9oCYF` App-Garage-V3) + **lấp mobile** cho PROD-LIST/DETAIL. Catalog nay 11 FEAT có Figma (registry 15 FEAT / 3 wave). EXPORT chỉ có file mẫu `.xlsx`, không Figma. |
