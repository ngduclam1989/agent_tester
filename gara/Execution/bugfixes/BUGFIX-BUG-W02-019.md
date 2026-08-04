# BUGFIX BUG-W02-019 — `tsc -b` fail trên 2 test file insurance-dossier hooks (collateral từ FIX cycle BUG-W02-010+011)

> Wave: W02 · Severity: P1 · Status: OPEN → FIX_DONE
> Boundary: garage-web
> Source TC: infra-up wave 02 (bash bb0yhla3q)
> Reporter: orchestrator (infra selftest)

## 1. Failure mode

`npm run build` (= `tsc -b && vite build`) fail trong Docker image build cho garage-web → infra-up wave 02 BLOCKED. Cụ thể TypeScript errors:

- `src/features/insurance-dossier/hooks/use-export-insurance-dossier.bug-w02-011.test.tsx:16,18,56`
  - TS2344: `Type 'typeof MockedProvider' does not satisfy the constraint '(...args: any) => any'`
  - TS2345: `Argument of type '{ ... mocks ... }' is not assignable to parameter of type 'never'`
- `src/features/insurance-dossier/hooks/use-insurance-dossier-versions.bug-w02-010.test.tsx:11,58,80` — cùng 3 errors

## 2. Root cause

2 test file mới (thêm bởi FIX cycle BUG-W02-010 + BUG-W02-011) dùng helper:

```ts
const buildWrapper =
  (mocks: Parameters<typeof MockedProvider>[0]["mocks"]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>{children}</MockedProvider>
  );
```

Vấn đề:

- `MockedProvider` từ `@apollo/client/testing` (Apollo Client 3.13.8) là **class component**, không phải function: `export declare class MockedProvider extends React.Component<MockedProviderProps, MockedProviderState>`.
- `Parameters<T>` chỉ định nghĩa được khi `T extends (...args: any) => any`. Áp lên class type → TS2344.
- Vì `Parameters<...>` resolve về `never`, nên `Parameters<typeof MockedProvider>[0]["mocks"]` cũng resolve về `never`, làm `mocks` literal argument không assignable → TS2345.

`tsconfig.app.json` không exclude `*.test.tsx` → test files đi vào prod `tsc -b` → Docker build fail.

`MockedResponse` type được export trực tiếp từ `@apollo/client/testing` (re-export từ `core/index.d.ts`) — dùng nó trực tiếp là pattern chuẩn.

## 3. Fix

Áp dụng fix option (a) trong bug brief: cast/type `mocks` trực tiếp qua `MockedResponse` thay vì derive qua `Parameters<typeof MockedProvider>`.

Cả 2 file:

- Import bổ sung: `import { MockedProvider, type MockedResponse } from "@apollo/client/testing";`
- Đổi signature helper:

```ts
const buildWrapper =
  (mocks: ReadonlyArray<MockedResponse<any, any>>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>{children}</MockedProvider>
  );
```

`ReadonlyArray<MockedResponse<any, any>>` khớp chính xác signature `MockedProviderProps.mocks?: ReadonlyArray<MockedResponse<any, any>>` trong `@apollo/client/testing/react/MockedProvider.d.ts`. KHÔNG đụng test logic / mocks data / assertions.

KHÔNG đụng `tsconfig.app.json` (option c fallback) — giữ tests trong tsc gate để catch type drift sớm.

KHÔNG đụng prod hook code (`use-export-insurance-dossier.ts`, `use-insurance-dossier-versions.ts`) — fix scope cô lập trong test files.

## 4. Regression test

Build verify thay regression test (bug class = "build infra"):

- `npm run build` (= `tsc -b && vite build`) exit 0 — KHÔNG có TS2344 / TS2345.
- `tsc -b --force` exit 0 — rebuild sạch.
- Vite emit asset bundle bình thường (4MB+ chunks output đúng).

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-export-insurance-dossier.bug-w02-011.test.tsx` — import `MockedResponse` + đổi `buildWrapper` signature
- `frontend/gf-gms-web/src/features/insurance-dossier/hooks/use-insurance-dossier-versions.bug-w02-010.test.tsx` — import `MockedResponse` + đổi `buildWrapper` signature

## 6. Status update

BUG-W02-019: OPEN → FIX_DONE (build verify pass local; verify pending L2 trong Docker stack).

## 7. Lesson candidate

- Dùng `Parameters<typeof ClassComponent>` không hợp lệ — chỉ work với function components. Cho class component (MockedProvider, React.Component-based) phải import type tương ứng trực tiếp (vd `MockedResponse` thay vì derive qua `Parameters`). Pattern này thường lọt vitest local run (vitest dùng `esbuild` transpile, bỏ qua type errors) nhưng break `tsc -b` strict.
- Severity: memory-only candidate cho `BUG_PATTERNS.md` (root cause + fix pattern reusable cho mọi MockedProvider test sau).
