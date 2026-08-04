---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: garage-web
last_reviewed: "2026-05-06"
---

# ADR-012: Garage Web Frontend Architecture — React/Vite SPA + GraphQL aggregator + shell-based realtime

## Status
ACCEPTED — 2026-05-06

## Context

`garage-web` là web console nội bộ cho nhân sự garage vận hành GMS trên browser. Ứng dụng bao phủ auth UI, module shell sau đăng nhập, các màn nghiệp vụ booking/service order/purchase/inventory/customer/marketing/admin, notification, chat/call, Superset dashboard embed và file upload/download UX.

Câu hỏi cần quyết định:

1. Web GMS nên là SPA nội bộ hay cần SSR/meta-framework?
2. Frontend nên gọi backend qua GraphQL aggregator hay gọi trực tiếp nhiều downstream service?
3. Chuẩn routing, state management, form validation và realtime runtime của `garage-web` là gì?
4. Frontend được sở hữu những loại state nào và bị cấm sở hữu những gì?

**Constraints từ runtime/source:**

- `gf-gms-web` hiện dùng React 19, TypeScript 5.8, Vite 7 và build ra static `dist/`.
- Routing hiện dùng TanStack Router file-based với generated route tree.
- Backend contract chính của web là GraphQL qua hai aggregator:
  - `agg-garage-graph` qua `VITE_GRAPHQL_URI` cho nghiệp vụ Garage.
  - `agg-sso-graph` qua `VITE_GRAPHQL_SSO_URI` cho auth/session, notification read model, CometChat helpers và Superset guest token.
- Source hiện có Apollo Client, Apollo Upload Client, TanStack Query, Zustand, React Hook Form, Zod, Tailwind CSS, Radix UI primitives và shadcn-style shared components.
- Firebase Messaging, CometChat và Superset là browser/provider integrations cần hoạt động sau đăng nhập.

**Business rules liên quan:** NA.

## Decision

**Chốt `garage-web` là React/Vite SPA nội bộ, dùng GraphQL aggregator làm backend contract chính, tách auth graph và domain graph, mount realtime runtime ở module shell, và chỉ sở hữu client/runtime state.**

Cụ thể:

- **SPA, không SSR**: `garage-web` là internal/admin-facing console, không phải public SEO surface; Vite SPA phù hợp data grid, form, detail và operational workflow.
- **Routing baseline**: TanStack Router file-based là chuẩn route ownership, typed navigation và route tree generation.
- **GraphQL transport**: Apollo Client là transport chính cho query/mutation/upload; domain call dùng `VITE_GRAPHQL_URI`, auth/session/realtime-adjacent call dùng `VITE_GRAPHQL_SSO_URI`. REST/blob helper chỉ dùng cho download/export/preview hoặc provider-specific flow qua gateway/helper, không dùng để gọi thẳng domain service.
- **State management**:
  - Apollo Client cache và TanStack Query dùng cho server/query coordination.
  - Zustand dùng cho client/runtime state như tenant context, filters, breadcrumb, permissions, chat/common state và UI state.
  - React component state chỉ dùng cho local interaction state.
- **Form/validation**: React Hook Form + Zod là baseline cho form create/edit/import/search; backend vẫn là authority cho business validation.
- **Realtime shell**: Firebase notification listener, CometChat chat/call runtime và incoming call popup được mount trong module shell hoặc component con của shell sau đăng nhập để không bị reset khi đổi route nghiệp vụ. Superset embed/token flow chạy trong dashboard route dưới authenticated module shell.
- **Data ownership**: frontend không own DB, business state machine, durable business state, authorization authority, payment/card secret, Superset guest token generation hoặc CometChat auth token generation.
- **Deployment baseline**: `yarn build` tạo static `dist/`; hosting phải support SPA fallback và nén gzip/brotli.
- **Implementation governance**: mọi route/action/button/form mới phải map về `INTEG-FE-*` trước DEV; FE không được tự bịa GraphQL operation name.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Next.js/SSR/meta-framework** | Có SSR, routing convention mạnh, SEO tốt hơn | Thêm server runtime và complexity không cần thiết cho internal console | GMS Web không cần SEO/SSR; source hiện tại đã là Vite SPA |
| **Client gọi trực tiếp nhiều REST service** | Bỏ được một GraphQL hop | Frontend biết quá nhiều service topology, tự fan-out/aggregate/error-map | Vi phạm ADR-002 GraphQL aggregator pattern và làm tăng coupling |
| **Một GraphQL endpoint duy nhất cho auth + domain** | Ít endpoint config hơn | Làm mờ ranh giới security/SSO với nghiệp vụ Garage | `agg-garage-graph` và `agg-sso-graph` có ownership, security surface và downstream khác nhau |
| **Redux/global store cho mọi server state** | Một global state model duy nhất | Dễ duplicate server cache, tăng boilerplate, lệch source hiện tại | Source đã tách Apollo/TanStack Query cho server state và Zustand cho runtime/UI state |
| **Frontend chứa business workflow/state machine** | Một số UX flow có thể triển khai nhanh hơn | Business rule phân tán, khó audit, dễ lệch backend source of truth | Domain service/BFF/backend workflow vẫn là authority cho durable state và invariant |

## Consequences

**Positive:**

- Baseline frontend rõ cho engineer và DEV agent khi triển khai `garage-web`.
- Giảm pattern drift giữa routing, GraphQL client, query cache, runtime store và form validation.
- Client contract tập trung vào `agg-garage-graph`/`agg-sso-graph`, không phụ thuộc trực tiếp service topology.
- Realtime notification/chat/call hoạt động xuyên route sau đăng nhập.
- Static deployment đơn giản hơn server-rendered web runtime.

**Negative:**

- **SPA bundle có thể lớn khi module tăng** — cần giữ code splitting, lazy route và bundle review trong build pipeline. **Mitigation**: bám TanStack Router/Vite code splitting và kiểm tra bundle khi thêm module lớn.
- **GraphQL schema/operation governance tăng** — thay đổi schema ảnh hưởng trực tiếp web. **Mitigation**: mọi route/action phải được duy trì trong `INTEG-FE-*` và kiểm tra với API docs/schema.
- **Realtime runtime ở shell tăng complexity** — lỗi Firebase/CometChat có thể ảnh hưởng shell nếu không isolate; lỗi Superset chỉ được phép ảnh hưởng dashboard embed. **Mitigation**: lỗi provider phải degrade ở widget/runtime layer, không block module shell hoặc các route nghiệp vụ khác.
- **SPA fallback phụ thuộc hosting config** — refresh deep link có thể 404 nếu hosting sai. **Mitigation**: deployment checklist phải có SPA fallback về `index.html`.

**Risks:**

- **FE permission/feature flag bị hiểu nhầm là authorization enforcement**. **Mitigation**: backend/BFF/domain service vẫn phải enforce authorization; FE guard chỉ là UX.
- **Token/provider secret bị persist sai ở browser**. **Mitigation**: không lưu Superset guest token, CometChat auth token, payment/card data hoặc domain-sensitive data vào long-lived storage.
- **DEV agent tự bịa GraphQL operation khi thiếu mapping**. **Mitigation**: FM-016 bắt buộc cập nhật `INTEG-FE-*` trước khi triển khai button/form/action mới.
- **Business rule bị kéo vào frontend do form logic tăng dần**. **Mitigation**: Zod chỉ validate input shape/UX; business validation và state transition thuộc backend owner.

**Trade-off accept:** chấp nhận SPA bundle governance, GraphQL contract governance và realtime shell complexity để đổi lấy frontend baseline thống nhất, static deployment đơn giản, client contract tập trung và ownership rõ giữa FE, GraphQL aggregator và domain service.

## References

- [TECHSTACK.md](../TECHSTACK.md)
- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- HLD: [garage-web-HLD.md](../hld/garage-web-HLD.md)
- FE integration contracts:
  - [INTEG-FE-garage-web-agg-garage-graph.md](../integrations/INTEG-FE-garage-web-agg-garage-graph.md)
  - [INTEG-FE-garage-web-agg-sso-graph.md](../integrations/INTEG-FE-garage-web-agg-sso-graph.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-002 (GraphQL aggregator pattern), ADR-003 (tenant và SSO boundary), ADR-010 (feature flags governance)
- Business Rules: NA
