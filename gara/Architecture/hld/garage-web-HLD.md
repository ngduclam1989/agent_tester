---
type: architecture
artifact_kind: hld
boundary: garage-web
tier: T1
status: ACTIVE
version: 11
owner_authority: Architecture Authority
last_reviewed: "2026-07-06"  # v11 W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý (bundled static asset). §8b.2 Performance & Scale, Cache bullet: thay câu "Template signed URL fetched fresh per wizard open — not stored (per W04-2 semantics)" bằng "Template `.xlsx` là FE bundled static asset (sync từ Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx vào frontend/gf-gms-web/src/assets/ tại build time) — link tải render qua `<a href download>`, KHÔNG call BFF/BE, browser cache immutable per bundle hash. Cập nhật template yêu cầu rebuild FE (chấp nhận được vì format OB rất ít thay đổi)". Không đụng Product docs. v10 W04 fix — Add explicit §8b.2 Performance & Scale section (6/6 items scoped to OB UI: expected load, offset pagination TanStack Table, index N/A client, no persistent client cache + React Query staleTime=0, N+1 N/A denormalized, FE 500-row cap as load-shedding decision). Main-agent post-hoc verification catch: v9 §8b.1 mentioned perf-related items scattered but did not group under a "Performance & Scale" heading — v10 promotes to a named section satisfying Reviewer G12 shape. v9 W04 — §8b Inventory V2 Opening Balance UI added.
depends_on:
  - "../TECHSTACK.md"
  - "../SYSTEM-ARCHITECTURE.md"
  - "./agg-garage-graph-HLD.md"
  - "./agg-sso-graph-HLD.md"
  - "../integrations/INTEG-FE-garage-web-agg-garage-graph.md"
  - "../integrations/INTEG-FE-garage-web-agg-sso-graph.md"
  - "../decisions/ADR-020-stock-ledger-daily-snapshot.md"
  - "../decisions/ADR-021-ob-period-lock-cross-boundary.md"
  - "../decisions/ADR-022-ob-import-all-or-nothing-bulk.md"
---

# HLD - `garage-web`

## 1. Overview

**Garage Web** là web app **internal/admin-facing** cho nhân sự garage vận hành GMS trên browser. Ứng dụng là **React 19 + TypeScript 5.8 + Vite 7 SPA**, không SSR vì đây là console nghiệp vụ nội bộ, không phải public SEO surface.

**Trách nhiệm:**

- Auth UI: login, forgot password, first-change-password, change-password, logout/session sync.
- Module shell sau đăng nhập: layout, navigation, tenant info, permission context, notification center, chat/call runtime.
- Nghiệp vụ vận hành: dashboard, booking, service order, settlement, quotation, purchase, supplier, inventory, customer, vehicle, segment, campaign, voucher, employee, account, permission, feedback.
- Realtime browser UX: Firebase Messaging/service worker redirect, CometChat chat/call, incoming call popup, Superset dashboard embed.
- File UX: upload attachment, import/export, preview/download PDF/image qua gateway/helper.
- **KHÔNG** sở hữu business data, business state machine, authorization enforcement hoặc payment/card secret.
- **KHÔNG** gọi trực tiếp backend domain services từ browser; mọi business call đi qua `agg-garage-graph` hoặc `agg-sso-graph`.

**Owned scope:** `garage-web` FE boundary cho `gf-gms-web`.

## 2. Component Diagram (C4 Level 3)

```text
-------------------------- garage-web (React 19 + Vite 7 SPA) --------------------------+
|                                                                                       |
|  Browser entry                                                                        |
|    index.html -> src/main.tsx                                                         |
|      -> QueryClientProvider + ThemeProvider + I18nextProvider + RouterProvider        |
|      -> AuthSyncManager + Toaster + global CSS/font                                   |
|                                                                                       |
|  TanStack Router file routes                                                          |
|    /login, /forgot-password, /first-change-password -> Auth shell                     |
|    /protected-permission, /dashboard, /booking, /service-order, /service-order/sale  |
|    /inventory-*, /customers, /customers/import, /vehicles, /segments                  |
|    /campaign, /voucher-programs, /employees, /accounts, /permissions, /chat-*         |
|    /feedback, /debug, /401, /403, /404, /500, /503                                    |
|    /payment -> authenticated payment result/callback route under module shell         |
|                                                                                       |
|  Auth shell                                                                            |
|    AUTH_CLIENT -> VITE_GRAPHQL_SSO_URI -> agg-sso-graph                               |
|    login / forgot / first-change-password / change-password / logout                  |
|                                                                                       |
|  Module shell                                                                          |
|    ApolloClientLayout -> VITE_GRAPHQL_URI -> agg-garage-graph                         |
|    header / sidebar / breadcrumb / tenant info / permissions                          |
|    notification center / CometChat shell / incoming call popup                        |
|                                                                                       |
|  Feature modules                                                                       |
|    dashboard | booking | service-order | settlement-voucher                          |
|    quotation-requests | purchase-requests | purchase-orders | suppliers              |
|    linked-transporters | inventory-stock | inventory-receipt                          |
|    inventory-delivery | inventory-period | inventory-services                         |
|    customers | interactions | vehicles | segments | campaigns                        |
|    voucher-programs | vouchers | employees | accounts | permissions | feedback       |
|                                                                                       |
|  Client state + UI                                                                     |
|    Apollo Client cache + TanStack Query cache                                         |
|    Zustand stores: tenant, filters, breadcrumb, chat/common, permissions, notification|
|    React Hook Form + Zod schemas                                                       |
|    Tailwind CSS v4 + Radix UI primitives + shadcn-style shared components             |
|                                                                                       |
|  Browser/provider integrations                                                         |
|    Firebase Messaging + service worker                                                 |
|    CometChat SDK                                                                       |
|    Superset Embedded dashboard                                                         |
|    Google Sheet feedback endpoint                                                      |
|                                                                                       |
|  Build: yarn install -> yarn lint -> yarn build -> dist/ static bundle                |
+---------------------------------------------------------------------------------------+
       |
       v
  Browser -> static hosting/CDN/web server -> agg-sso-graph / agg-garage-graph
                                           -> Firebase / CometChat / Superset
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| React 19 + Vite 7 SPA, không SSR | Garage Web là internal console; SEO không cần thiết, SPA phù hợp data grid/form/detail workflow. | TECHSTACK, `gf-gms-web` |
| Tách auth graph và domain graph | Auth/session đi qua `agg-sso-graph`; nghiệp vụ Garage đi qua `agg-garage-graph`. | `INTEG-FE-*` |
| TanStack Router file-based | Route tree là ownership surface cho page/module và giữ typed navigation. | `garage-web-HLD` route model |
| Feature-based module structure | Mỗi feature giữ page/widget/hook/schema/store gần nhau để giảm xung đột khi agent triển khai. | `src/features/**` |
| Apollo Client là GraphQL transport chính | Bọc query/mutation/upload/error/refresh trong client/hook thay vì gọi fetch rải rác. | `src/layouts/**/apollo-client*` |
| TanStack Query + Zustand cho client/runtime state | Tách server query coordination khỏi UI/runtime state như filters, breadcrumb, chat, permissions. | `src/router.ts`, `src/store/**` |
| Feature flag/permission chỉ là UX guard | FE hide/redirect để cải thiện UX; backend/BFF vẫn là authorization authority. | Security rule |
| Realtime mount ở module shell | Notification, chat/call và incoming call phải hoạt động xuyên route sau đăng nhập. | `CometLayout`, notification shell |
| Static deployment | Build ra `dist/`; có thể serve bằng web server/CDN/object static hosting với SPA fallback. | Deployment assumption |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| Garage staff browsers | HTTPS static app | Vận hành GMS qua browser |
| Browser service worker runtime | Browser event | Notification redirect và foreground/background message handling |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `agg-sso-graph` | GraphQL HTTPS via `VITE_GRAPHQL_SSO_URI` | Login/logout/refresh, password flows, Firebase device token registration, CometChat helpers, Superset guest token |
| `agg-garage-graph` | GraphQL HTTPS via `VITE_GRAPHQL_URI` | Booking, service order, purchase, inventory, customer, marketing, accounting, HRMS, notification center read/read-state operations, upload/export |
| Firebase Messaging | Browser SDK/service worker | Push/in-app notification signal và route redirect |
| CometChat | Browser SDK | Chat/call runtime, group/user token flow, incoming call UX |
| Superset | Embedded dashboard | Dashboard iframe với guest token lấy từ `agg-sso-graph` |
| Google Sheet feedback endpoint | HTTPS | Feedback form integration ngoài GraphQL |
| Static hosting/CDN/web server | HTTPS | Serve `dist/`, public assets, import templates và SPA fallback |

## 5. Data Ownership (client-side)

**KHÔNG own DB.** Garage Web chỉ sở hữu client/runtime state:

- **Auth/session state:** token/session qua cookie helpers, refresh flow qua Apollo error link, `BroadcastChannel("auth_channel")` để đồng bộ login/logout giữa browser tabs.
- **Server state cache:** Apollo Client cache và TanStack Query cache cho dữ liệu đọc từ `agg-garage-graph`/`agg-sso-graph`; không là source of truth.
- **UI/runtime state:** Zustand stores cho tenant context, permissions, filters, breadcrumb, chat/common state và notification UI.
- **Form state:** React Hook Form + Zod cho create/edit/import/search forms; backend vẫn là authority cho business validation.
- **Realtime state:** Firebase permission/message runtime, CometChat token/group/call runtime, Superset guest token ngắn hạn.
- **Payment return state:** route `/payment` nằm dưới module shell và cần session theo source hiện tại; FE chỉ render callback/result, payment transaction source thuộc backend/payment provider.

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Initial app shell load on office broadband | ≤ 3s to interactive for authenticated shell after static assets are cached |
| Protected route transition | ≤ 500ms excluding backend query latency |
| Table/list first page query p95 | ≤ 1.5s through BFF under normal office network |
| Form mutation feedback | Loading state within 100ms; success/error toast after backend response |
| Auth refresh retry | One centralized retry after 401; failed refresh redirects to login |
| File upload UX | Per-action loading/error state; no silent failure for attachment/import flows |
| Realtime UX | Notification/chat/call failure must degrade widget-level, not block entire module shell |
| Accessibility | Keyboard-accessible core navigation/forms/dialogs; no known blocker for WCAG 2.1 AA patterns |
| Bundle/deployment | `yarn build` produces static `dist/`; hosting must support SPA fallback and gzip/brotli |

## 7. Forbidden Actions

- Direct call `gf-*`, `hrms`, `policy-agent`, `ct-*`, IAM, conversation, notification, payment, storage or DynamoDB services from browser.
- Build Superset guest token, CometChat auth token, payment secret, KMS/card data, ledger or business state machine in frontend.
- Persist domain-sensitive data, CometChat auth token, Superset guest token or payment/card information in long-lived browser storage.
- Treat feature flag, menu visibility, route guard or client permission snapshot as final authorization enforcement.
- Hardcode backend URLs in components; all GraphQL/provider config must go through `VITE_*` config and shared helpers.
- Invent GraphQL operation names during implementation; every route/action must map to `INTEG-FE-*` before FE DEV work.
- Use `client.resetStore()` for normal domain updates; reserve full reset for logout/recovery.
- Change `APP_ENVIRONMENT` / legacy `APP_ENVIROMENT` compatibility without a coordinated config migration.

## 8. Insurance Settlement UI (DESIGN — EP-INSURANCE-SETTLEMENT)

> Wave W01 slice 1/3. Canonical scope: `Execution/work-packages/PKG-W01-insurance-foundation.md §2.2 garage-web`. Cross-ref: ADR-014 (ownership + pull snapshot), `UX-FLOW-INSURANCE-SETTLEMENT.md`, `INTEG-FE-garage-web-agg-garage-graph.md §3.4b`.

### 8.1 Insurance Feature UI (SO + settlement)

- `<InsuranceAllocationSection>` render trên **SO Edit page** + SO Detail page — **KHÔNG** trên SO Create page (AC-0). Lưu ý: toggle "Bảo hiểm = Có" + chọn DN BH/HĐ/SĐT giám định **hiển thị ở Create**; chỉ **panel 5 khoản phân bổ** giới hạn Edit/Detail.
- 3 toggle %/số tiền (CK liên kết VT, CK liên kết CDV, Giảm trừ bồi thường); input số Khấu trừ BH; input % per dòng phụ tùng Khấu hao. Realtime preview "BH thanh toán" + "KH thanh toán" + "Tổng thanh toán".
- `<InsuranceSettlementDetailPage>` (page route) 4 tab (Chi phí + panel "Tổng giá dịch vụ" / Hồ sơ BH placeholder W02 / Chứng từ placeholder / Lịch sử thanh toán) + header + thông tin quyết toán. Nút "+ Tạo hồ sơ bảo hiểm" hiển thị nhưng **disabled** với tooltip "Sẽ available ở W02".

## 8b. Inventory V2 — Opening Balance (DESIGN — EP-INVENTORY-OPENING-BALANCE, W04)

> W04 scope: 4 features FEAT-OB-LIST/IMPORT/EDIT/DELETE-LINES trên Garage Care Web GMS (full CRUD). Mobile view-only (per INTEG-MOB §3.4b). Backend module = `gf-inventory/opening-balance` per ADR-022. BFF module = `gf-inventory/opening-balance` per `agg-garage-graph-graphql.md §3g`. Web mapping authoritative: `INTEG-FE-garage-web-agg-garage-graph.md §3.6c`.

### 8b.1 Opening Balance UI

- Route convention: `/inventory/opening-balances` (danh sách + filter + dòng Tổng), `/inventory/opening-balances/import` (wizard 2-step).
- **Wizard import 2-step (ADR-018/022)**: FE parses `.xlsx` browser-side via SheetJS; first-check `.xlsx` extension + non-empty + rows.length ≤ 500 (`ERR-INV-048`) trước khi gọi BFF; BFF re-check defensive; BE re-check authoritative.
- **All-or-nothing commit (BR-OB-004a)**: nút "Xác nhận import" disabled nếu `verifyImportOpeningBalances.canCommit=false`; FE generate `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` trước gọi `importOpeningBalances` (retry-safe per ADR-022).
- **Edit form** (`FEAT-OB-EDIT`): 6-field form (Sản phẩm/Kho dropdown + ĐVT readonly + SL + Ngày + GT); guardrails render error toast per code `ERR-INV-024/034/035/036`.
- **Delete UX**: icon 🗑️ per row → popup single delete (W04-6); checkbox multi-select → "Xóa dòng đã chọn" batch delete (W04-7), all-or-nothing chặn cả lô nếu bất kỳ dòng vi phạm (BR-OB-DEL-004).
- **Cross-boundary lock-check UX**: response `ERR-INV-024` "Tồn đến ngày rơi vào kỳ kế toán đã đóng" — display in error banner với hint "Vui lòng chọn ngày khác hoặc mở lại kỳ (Kỳ kế toán → chỉnh sửa trạng thái)".
- **Component reuse-first gate** (per PKG-W04 §DEV Playbook step 1): reuse existing `date-picker`, `file-upload`, `preview-table`, `data-table`, `dropdown`; build new chỉ khi inventory thiếu + đăng ký registry `.claude/references/web-component-registry.yaml` (per Item 12 CLAUDE.md).

### 8b.2 Performance & Scale — Opening Balance UI (W04)

> Scoped to §8b W04 UI additions only. §6 Quality Attributes remain the baseline for other features. Downstream `/spawn-dev` phải dùng các quyết định này thay vì tự bịa pagination / cache TTL / client-side render pattern.

1. **Expected load** — OB list route `/inventory/opening-balances` is a review-only screen used at seed/setup time or occasional audit; expected ≤ 10 page loads/tenant/day, ≤ 2 concurrent open tabs/tenant. Wizard import `/inventory/opening-balances/import` invoked ≤ 1 time/tenant/hour (baseline seed activity — matches gf-inventory §6b.1). Client-side p95 targets: first contentful paint ≤ 2s (cold nav), table render for 20-row page ≤ 200ms, wizard step-2 preview render for 500 rows ≤ 500ms (client `virtual-scroll` required). Wizard `.xlsx` browser-parse via SheetJS ≤ 3s for 500-row file (JS single-thread bound; must block user progress bar during parse).
2. **Pagination strategy** — **Offset-based** for OB list (defaults `page=0, size=20`, max `size=100` — inherited from BFF/BE per gf-inventory §6b.2, since typical tenant OB rows ≤ 10k). Table renders per-page with `TanStack Table` (existing stack per §1 Overview); user-visible pagination footer with page-number buttons + jump-to-page + per-page dropdown. **No infinite-scroll on web** — desktop UX favors explicit page control for auditing (contrast mobile view-only which uses infinite-scroll per garage-mobile-HLD §11b.2). Sort default `createdAt DESC` (BR-OB-014 "Ngày import mới nhất lên đầu"). Filter changes reset page to 0.
3. **Index list** — **N/A** at client layer (no DB, no persistence — per §5 Data Ownership "client-side only"). Query filter fields (`warehouseId`, `createdBy`, `importedFrom`/`importedTo`, `keyword`) align with the tenant-prefixed indexes in gf-inventory §6b.3 (`idx_ob_tenant_created`, `idx_ob_tenant_warehouse_asof`, `idx_ob_tenant_created_by`) — client only needs to know these are supported filter combinations, not to define them.
4. **Cache strategy** — **Explicit "no persistent client cache" decision** for OB data. React Query `staleTime=0` + no `IndexedDB`/`localStorage` persistence for OB list content (data-freshness for audit workflow requires always-fresh). React Query `cacheTime=5min` in-memory only (revisit page within 5min shows cached list instantly, but background refetch triggers). Wizard state (parsed file rows) held in component state only — cleared on route unmount; refuses to persist across sessions (`.xlsx` data can contain sensitive stock/value figures). Template `.xlsx` là **FE bundled static asset** (sync từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` vào `frontend/gf-gms-web/src/assets/` tại build time) — link tải render qua `<a href={bundled_url} download>`, KHÔNG call BFF/BE, browser cache immutable per bundle hash. Cập nhật template yêu cầu rebuild FE (chấp nhận được vì format OB rất ít thay đổi). AP lock-check status is **not** cached client-side; server-side per ADR-021 owns the 30s TTL.
5. **N+1 avoidance** — **N/A specifically for OB UI** because the list endpoint returns fully-denormalized rows (`productName`, `warehouseName`, `mainUnitCode` snapshot from `opening_balance_line` per gf-inventory §6b.5). Client renders directly from the response — no per-row lookup mutation to fetch display names. Contrast: some legacy pages (`/inventory-receipt` list) run 1 list query + N `getProductName` sub-fetches — anti-pattern to avoid per W04 design.
6. **Tenant fairness — client-side 500-row cap as load-shedding**: The FE first-check for `.xlsx` file size (extension + non-empty + rows.length ≤ 500 → user-friendly `ERR-INV-048` message before any network call per §8b.1) IS a tenant-fairness / load-shedding decision as much as a UX gate. Rationale: if a user attempts a 10k-row file, blocking at FE parse (SheetJS runs ≤ 3s worst-case then rejects) prevents (a) BFF JSON body inflation (10k rows ≈ 10MB body → BFF memory pressure), (b) BE unnecessary validation cycles that would abort at the same `ERR-INV-048` anyway, (c) gf-accounting lock-check spike (10k rows × ≤ 30 distinct dates × REST hop = 900 unnecessary calls). This is the client edge of the 3-layer defense-in-depth per ADR-018/022. No per-tenant client-side throttle (each user is scoped to 1 tenant per session; server-side per-tenant limits per gf-inventory §6b.6 are authoritative for cross-user coordination).

## 9. References

- TECHSTACK: `../TECHSTACK.md`
- System context: `../SYSTEM-ARCHITECTURE.md`
- BFF HLDs:
  - [agg-garage-graph-HLD.md](./agg-garage-graph-HLD.md)
  - [agg-sso-graph-HLD.md](./agg-sso-graph-HLD.md)
- FE integration contracts:
  - [INTEG-FE-garage-web-agg-garage-graph.md](../integrations/INTEG-FE-garage-web-agg-garage-graph.md)
  - [INTEG-FE-garage-web-agg-sso-graph.md](../integrations/INTEG-FE-garage-web-agg-sso-graph.md)
- GraphQL API:
  - `Architecture/api/agg-garage-graph-graphql.md`
  - `Architecture/api/agg-sso-graph-graphql.md`
- Insurance (EP-INSURANCE-SETTLEMENT):
  - Work package: `../../Execution/work-packages/PKG-W01-insurance-foundation.md`
  - ADR: `../decisions/ADR-014-insurance-settlement-ownership.md`
  - UX flow: `../../Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md`
  - INTEG: `../integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.4b

## Change Log

| Date | Version | Summary |
|---|---:|---|
| 2026-05-04 | 4 | Initial detailed HLD and FE integration contract alignment. |
| 2026-05-05 | 5 | Rebuilt into concise 9-section web HLD structure aligned with execution planning. |
| 2026-05-06 | 6 | Temporarily removed FE execution planning section because it is not in scope yet. |
| 2026-05-12 | 6.1 | Source-aligned route diagram with `/protected-permission`, `/service-order/sale/*`, `/customers/import`, `/debug`, error routes, and authenticated `/payment` callback behavior. |
| 2026-06-02 | 7 | Add §8 Insurance Settlement + V3 Foundation (EP-INSURANCE-SETTLEMENT W01): V3 layout shell (header/main-nav/footer toàn app, token additive), Global Bottom Sheet Manager (typed registry + zustand stack + lazy + permission-at-open + dirty-guard + search-param sync, xoá route create/edit), insurance feature UI (`<InsuranceAllocationSection>` EDIT_SO/Detail-only, `<InsuranceSettlementDetailPage>` 4 tab), V3-sourcing invariants + gate. References §insurance. Renumber References §8→§9. |
| 2026-06-04 | 8 | **Bỏ V3 Foundation — giữ design system cũ.** Gỡ §8.1 V3 Layout Shell, §8.2 Global Bottom Sheet Manager (+ routing search-param sync / xoá route create-edit), §8.4 V3-specific invariants + gate `check-v3-sourcing.sh`. §8 còn lại = Insurance Feature UI trên trang SO Edit/Detail + Settlement Detail hiện hữu (create/edit giữ page route như cũ). Gỡ ADR-012 token-additive ref ở §9. Quyết định kế hoạch: chưa nâng cấp V3 — không thay thế bằng kiến trúc mới. |
| 2026-07-06 | 9 | **W04 — Add §8b Inventory V2 Opening Balance UI (DESIGN)**. Route convention `/inventory/opening-balances` (danh sách + filter + dòng Tổng), `/inventory/opening-balances/import` (wizard 2-step). Wizard: FE parses `.xlsx` browser-side (SheetJS per ADR-018/022) + first-check 500-cap `ERR-INV-048`; button "Xác nhận import" disabled khi `canCommit=false` (BR-OB-004a); FE-generated `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` (ADR-022). Edit 6-field form với ĐVT readonly auto-derive; guardrail errors `ERR-INV-024/034/035/036` toast. Delete UX icon 🗑️ single + checkbox batch (all-or-nothing chặn cả lô). Cross-boundary lock-check `ERR-INV-024` UX message với hint "mở lại kỳ". Reuse-first gate cho components (date-picker/file-upload/preview-table/data-table) per PKG-W04 DEV Playbook step 1. Mobile view-only per INTEG-MOB §3.4b (không thuộc §8b). §9 References thêm ADR-020/021/022. v8 → v9. |
| 2026-07-06 | 10 | **W04 fix — add missing §8b.2 Performance & Scale section (main-agent post-hoc verification catch)**. v9 §8b.1 scattered perf-related mentions (500-row FE cap, no-client-cache decision, virtual-scroll wizard preview) but did not surface them under a named "Performance & Scale" heading — Reviewer G12 shape gate requires a section covering ≥5/6 items. Add §8b.2 covering all 6 items scoped to the W04 OB UI: (1) expected load — ≤10 page loads/tenant/day, wizard ≤1/hour, FCP ≤2s, SheetJS ≤3s for 500-row parse; (2) offset pagination — TanStack Table page/size/dropdown, sort default `createdAt DESC`, filter resets page 0; no infinite-scroll on web; (3) index list — **N/A** client, filter fields align with gf-inventory §6b.3 tenant-prefixed indexes; (4) cache — React Query `staleTime=0` + `cacheTime=5min` in-memory only, no IndexedDB/localStorage (audit freshness + PII stock/value data), wizard state cleared on unmount, template URL fetched fresh; (5) N+1 — **N/A** for OB (denormalized response), contrast legacy inventory-receipt anti-pattern; (6) tenant fairness — client-side 500-row cap explicitly framed as load-shedding at the 3-layer defense edge (protects BFF memory, prevents BE cycle waste, prevents gf-accounting lock-check spike). No other file touched. v9 → v10. |
| 2026-07-06 | 11 | **W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý (bundled static asset)**. §8b.2 Performance & Scale, Cache bullet (#4): THAY câu "Template signed URL fetched fresh per wizard open — not stored (per W04-2 semantics)" bằng "Template `.xlsx` là **FE bundled static asset** (sync từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` vào `frontend/gf-gms-web/src/assets/` tại build time) — link tải render qua `<a href={bundled_url} download>`, KHÔNG call BFF/BE, browser cache immutable per bundle hash. Cập nhật template yêu cầu rebuild FE (chấp nhận được vì format OB rất ít thay đổi).". Pair với `gf-inventory-api v38` (xoá W04-2) + `agg-garage-graph-graphql v7.47` (xoá `getOpeningBalanceTemplate`) + `agg-garage-graph-HLD v12` + `INTEG-FE-garage-web-agg-garage-graph v17` + `ADR-022 v4`. Không đụng Product docs (`Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` đã có sẵn từ BA, `FEAT-OB-IMPORT.md` AC-2 wording không phụ thuộc transport). v10 → v11. |
