# BUGFIX — BUG-W03-155

> `getCurrentUser.role = "garage-owner"` (kebab-case, canonical persona slug per Critical Rule #6) không decode được bởi `UserRole` enum mobile (chỉ khai báo `@JsonValue("GARAGE_OWNER")`/`@JsonValue("CA")`) → `$enumDecodeNullable` throw `ArgumentError` tại `ProfileResponse.fromJson` → uncaught async ngay sau login
> Severity: **P2** · Boundary: `garage-mobile` (mobile-defensive; dual-assign gốc `agg-sso-graph` + `garage-mobile`) · Status: **FIX_DONE** (phần mobile-defensive) · Date: 2026-07-03

## 1. Summary

Phát hiện cùng Run 5 với BUG-156 (sau khi 153 fix xong, test binding hết STALL nên lỗi tiếp theo trong chuỗi bootstrap lộ rõ). `ProfileCubit.getProfile()` → `ProfileResponse.fromJson()` ném `ArgumentError` khi decode field `role` = `"garage-owner"`.

KHÔNG crash app thật (chỉ thiếu display data — `state.profile` không populate) nhưng chặn mobile E2E Patrol verdict PASS vì fire ngay sau login (foundation-level, mọi persona/mọi TC).

## 2. Root cause

- Backend (`agg-sso-graph`/`gf-hrms` qua `getCurrentUser`) trả `data.role = "garage-owner"` (kebab-case, khớp CHÍNH XÁC persona slug chính thức per Critical Rule #6 dual persona: `accountant` / `garage-owner`). Evidence raw response xác nhận: `"role": "garage-owner"`.
- Mobile `UserRole` enum (`lib/core/common/bases/enum/user_role.dart`) chỉ khai báo:
  ```dart
  enum UserRole {
    @JsonValue("GARAGE_OWNER") garage,
    @JsonValue("CA") ca,
  }
  ```
  → chỉ chấp nhận `GARAGE_OWNER` (upper-snake) / `CA` (2-letter), KHÔNG khớp giá trị thực tế backend trả (`garage-owner`).
- `json_annotation`'s `$enumDecodeNullable` (generated) ném `ArgumentError` khi giá trị JSON không khớp bất kỳ `@JsonValue` nào (không có `unknownEnumValue` fallback cấu hình cho field này).
- `ProfileCubit._fetchProfile()` có try/catch nhưng chỉ `rethrow` → lỗi lan lên `getProfile()`'s `Future.wait([...])` không caller nào guard → uncaught async → `PlatformDispatcher.onError` (chain đúng nhờ 153) → Crashlytics + test framework FAIL.

## 3. Quyết định fix (user-approved)

**Defensive fix phía mobile** — kebab `garage-owner` LÀ canonical persona per Critical Rule #6, nên enum parser mobile PHẢI chấp nhận nó (mobile-side enum stale so với slug chuẩn hoá). KHÔNG sửa BFF ở đây (máy mobile-only; nếu BFF cần chuẩn hoá thêm = follow-up riêng).

## 4. Fix

**4a. `lib/core/common/bases/enum/user_role.dart` — thêm parser tolerant `UserRole.fromJson(String?)`** (normalize kebab→UPPER_SNAKE + alias, KHÔNG throw):

```dart
enum UserRole {
  @JsonValue("GARAGE_OWNER") garage,
  @JsonValue("CA") ca;

  static UserRole? fromJson(String? value) {
    if (value == null) return null;
    final normalized = value.trim().toUpperCase().replaceAll('-', '_');
    switch (normalized) {
      case 'GARAGE_OWNER':
      case 'GARAGE':
        return UserRole.garage;
      case 'CA':
      case 'ACCOUNTANT':
        return UserRole.ca;
      default:
        return null;   // tolerate unknown — KHÔNG throw ArgumentError
    }
  }
}
```

- `garage-owner`/`GARAGE_OWNER`/`garage_owner`/` Garage-Owner ` → `garage`.
- `accountant`/`CA` → `ca` (persona slug `accountant` được nhận diện defensively).
- `null`/unknown → `null` (không ném exception với mọi giá trị).
- `@JsonValue` legacy giữ nguyên → `toJson` vẫn xuất `GARAGE_OWNER`/`CA` (contract write không đổi).

**4b. `lib/core/models/response/profile/profile_response.dart` — decode `role` qua parser tolerant:**

```dart
  @JsonKey(fromJson: UserRole.fromJson)
  final UserRole? role;
```

**4c. Regen `lib/core/models/response/profile/profile_response.g.dart`** (`build_runner` filtered) → generated đổi:
```diff
- role: $enumDecodeNullable(_$UserRoleEnumMap, json['role']),
+ role: UserRole.fromJson(json['role'] as String?),
```
(`_$UserRoleEnumMap` giữ lại phục vụ `toJson`.)

## 5. Touched files (blast radius)

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/common/bases/enum/user_role.dart` | Thêm static `fromJson` tolerant (enhanced enum) |
| `mobile/gf-garage-app/lib/core/models/response/profile/profile_response.dart` | `@JsonKey(fromJson: UserRole.fromJson)` trên `role` |
| `mobile/gf-garage-app/lib/core/models/response/profile/profile_response.g.dart` | Regen (build_runner) |
| `mobile/gf-garage-app/test/core/common/bases/enum/user_role_bug_155_test.dart` | **MỚI** — regression test |

**Don't-touch:** `UserRoleEx.label` extension (không đổi); `ProfileCubit._fetchProfile` rethrow (không cần đụng — enum nay không throw nữa; guard sâu hơn = ngoài scope); BFF schema/agg-sso-graph (cross-boundary, follow-up riêng).

**Shared-Symbol Gate:** `UserRole` chỉ được consume bởi `ProfileResponse.role` (grep xác nhận). `fromJson` là API MỚI (additive), không đổi hành vi legacy `GARAGE_OWNER`/`CA` → không kéo consumer khác.

## 6. Regression test

`test/core/common/bases/enum/user_role_bug_155_test.dart` — **headless, behavioral, GREEN 10/10**:
- `UserRole.fromJson`: `garage-owner`→garage · `GARAGE_OWNER`→garage · `accountant`→ca · `CA`→ca · mixed-case/whitespace normalize · `null`→null · unknown→null (returnsNormally, không throw).
- `ProfileResponse.fromJson`: payload y hệt evidence (`role:"garage-owner"`, `fullName:"Chủ Garage Demo"`) decode sạch → `role == UserRole.garage`; `accountant`→ca; thiếu field role→null.

Fail-trước-fix: `UserRole.fromJson` chưa tồn tại (compile error) + `ProfileResponse.fromJson({'role':'garage-owner'})` ném ArgumentError. Pass-sau-fix: GREEN.

## 7. Verify

- `flutter analyze` (pinned Flutter 3.41.9) trên file sửa: **0 error**.
- `flutter test` regression: **GREEN 10/10**, `--timeout 60s`.
- Patrol E2E (`TC-W03-ME2E-001..049`, live device) **DEFERRED** cho TEST_GROUP re-run → flip FIX_DONE → VERIFIED.

## 8. Note follow-up

- Mobile nay tolerate kebab (canonical). Nếu cần chuẩn hoá phía BFF (agg-sso-graph) để nhất quán → **follow-up riêng** (KHÔNG sửa BFF ở đây — máy mobile-only). Harness note (evidence): tài khoản test `0810000002`/`kAccountantPhone` trả `role:"garage-owner"` + `fullName:"Chủ Garage Demo"` — mapping số điện thoại ↔ persona trong harness có thể lệch tên hằng số; cần QC/BA re-xác nhận (KHÔNG thuộc scope fix này).
