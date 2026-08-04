---
type: architecture
artifact_kind: api-contract
boundary: agg-sso-graph
api_type: graphql
tier: T1
status: ACTIVE
version: 2
owner_authority: Architecture Authority
last_reviewed: "2026-05-12"
depends_on:
  - "../hld/agg-sso-graph-HLD.md"
---

# GraphQL Schema - `agg-sso-graph`

> GraphQL aggregation gateway cho identity-adjacent flows của Garage: auth/session, notification read model, conversation helper, Firebase device token và Superset guest token/proxy.
>
> Tài liệu này được rà soát lại từ mã nguồn hiện tại. SDL trong `src/graphql/**/**/*.schema.ts` vẫn là source of truth khi implementation thay đổi.

## 1. Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Endpoint | `/graphql`; dev `http://localhost:4007/graphql` |
| Auth | Forward `Authorization`/`x-client-type` xuống downstream; gateway không issue JWT. |
| API style | GraphQL over HTTP JSON, multipart upload khi có scalar `Upload` |
| Runtime | Node.js 22 / TypeScript / Express / Apollo Server 4 / `@graphql-tools/schema` |
| Transport | Tất cả operation dùng `POST /graphql`; client phân biệt bằng `operationName` và `variables`. |
| Downstream | `sec-iam-service`, `ct-notihub-notification`, `ct-conversation-client`, Superset, DynamoDB `${DEVICE_TOKEN_TABLE}` |
| Error model | GraphQL errors ở top-level `errors[]`; business/downstream errors thường đi trong union `ErrorResponse`. |

## 2. Endpoint Summary

| # | Type | Operation | Module | Arguments | Return type | Transport | Auth |
|---:|---|---|---|---|---|---|---|
| 1 | `Query` | `me` | auth | - | `User` | `POST /graphql` | authenticated/context-dependent |
| 2 | `Mutation` | `login` | auth | input: LoginInput! | `LoginResponse!` | `POST /graphql` | authenticated/context-dependent |
| 3 | `Mutation` | `forgotPassword` | auth | input: ForgotPasswordInput! | `ForgotPasswordResponse!` | `POST /graphql` | authenticated/context-dependent |
| 4 | `Mutation` | `forgotPasswordConfirm` | auth | input: ForgotPasswordConfirmInput! | `ForgotPasswordConfirmResponse!` | `POST /graphql` | authenticated/context-dependent |
| 5 | `Mutation` | `firstChangePassword` | auth | input: FirstChangePasswordInput! | `FirstChangePasswordResponse!` | `POST /graphql` | authenticated/context-dependent |
| 6 | `Mutation` | `logout` | auth | input: LogoutInput! | `LogoutResponse!` | `POST /graphql` | authenticated/context-dependent |
| 7 | `Mutation` | `changePassword` | auth | input: ChangePasswordInput! | `ChangePasswordResponse!` | `POST /graphql` | authenticated/context-dependent |
| 8 | `Mutation` | `refreshToken` | auth | input: RefreshTokenInput! | `RefreshTokenResponse!` | `POST /graphql` | authenticated/context-dependent |
| 9 | `Mutation` | `deleteUser` | auth | input: DeleteUserInput | `DeleteUserResponse` | `POST /graphql` | authenticated/context-dependent |
| 10 | `Query` | `conversationList` | conversation | filter: ConversationFilter | `ConversationListResponse` | `POST /graphql` | authenticated/context-dependent |
| 11 | `Query` | `groupConversationList` | conversation | filter: GroupConversationFilter | `GroupConversationListResponse` | `POST /graphql` | authenticated/context-dependent |
| 12 | `Query` | `groupSubordinates` | conversation | request: GroupSubordinatesRequest | `GroupSubordinatesResponse` | `POST /graphql` | authenticated/context-dependent |
| 13 | `Query` | `userToken` | conversation | - | `UserTokenResponse` | `POST /graphql` | authenticated/context-dependent |
| 14 | `Mutation` | `groupUpload` | conversation | request: GroupUploadRequest | `GroupUploadResponse` | `POST /graphql` | authenticated/context-dependent |
| 15 | `Mutation` | `deleteToken` | conversation | request: DeleteTokenRequest | `DeleteTokenResponse` | `POST /graphql` | authenticated/context-dependent |
| 16 | `Mutation` | `routingCandidate` | conversation | request: RoutingCandidateRequest | `RoutingCandidateResponse` | `POST /graphql` | authenticated/context-dependent |
| 17 | `Mutation` | `endCall` | conversation | request: EndCallRequest | `EndCallResponse` | `POST /graphql` | authenticated/context-dependent |
| 18 | `Mutation` | `groupCS` | conversation | request: GroupCSRequest | `GroupCSResponse` | `POST /graphql` | authenticated/context-dependent |
| 19 | `Mutation` | `addCS` | conversation | request: AddCSRequest | `AddCSResponse` | `POST /graphql` | authenticated/context-dependent |
| 20 | `Mutation` | `addCSWeekend` | conversation | request: AddCSRequest | `AddCSResponse` | `POST /graphql` | authenticated/context-dependent |
| 21 | `Mutation` | `kickMemberQuotationGroupChat` | conversation | request: KickMemberQuotationGroupChatRequest | `KickMemberQuotationGroupChatResponse` | `POST /graphql` | authenticated/context-dependent |
| 22 | `Mutation` | `kickMemberOrderGroupChat` | conversation | request: KickMemberQuotationGroupChatRequest | `KickMemberQuotationGroupChatResponse` | `POST /graphql` | authenticated/context-dependent |
| 23 | `Mutation` | `KickMemberCCRoutingGroupChat` | conversation | request: KickMemberQuotationGroupChatRequest | `KickMemberQuotationGroupChatResponse` | `POST /graphql` | authenticated/context-dependent |
| 24 | `Mutation` | `addMembers` | conversation | request: AddMembersRequest | `AddMembersResponse` | `POST /graphql` | authenticated/context-dependent |
| 25 | `Mutation` | `saveToken` | firebase | input: SaveTokenInput | `SaveTokenResponse` | `POST /graphql` | authenticated/context-dependent |
| 26 | `Query` | `notificationList` | notification | filter: NotificationFilter | `NotificationListResponse` | `POST /graphql` | authenticated/context-dependent |
| 27 | `Query` | `notificationUnreadCount` | notification | page: Int<br>size: Int | `NotificationUnreadCountResponse` | `POST /graphql` | authenticated/context-dependent |
| 28 | `Mutation` | `notificationReadAll` | notification | - | `NotificationReadAllResponse` | `POST /graphql` | authenticated/context-dependent |
| 29 | `Mutation` | `notificationReadById` | notification | id: Int | `NotificationReadByIdResponse` | `POST /graphql` | authenticated/context-dependent |
| 30 | `Query` | `supperSetQuestToken` | supper-set | input: supperSetQuestTokenInput | `SupperSetQuestTokenResponse` | `POST /graphql` | authenticated/context-dependent |

## 3. Endpoint Details

Các API dưới đây có cùng HTTP transport `POST /graphql`. Request/response thể hiện đúng operation signature, variables và return wrapper theo SDL. Với union response, client luôn nên query `__typename` và branch theo success type hoặc `ErrorResponse`.

### Query `me`

Module: `auth`. Return type: `User`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "me",
  "query": "query me { me { id username email role createdAt } }",
  "variables": {}
}
```

**Response 200**:
```json
{
  "data": {
    "me": {
      "__typename": "User",
      "id": 51001,
      "username": "String-sample",
      "email": "String-sample",
      "role": "ADMIN",
      "createdAt": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "me": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `login`

Module: `auth`. Return type: `LoginResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "login",
  "query": "mutation login($input: LoginInput!) { login(input: $input) { __typename ... on LoginOutput { idToken accessToken refreshToken firstLoginChallenge } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "identifier": "String-sample",
      "password": "String-sample",
      "subdomain": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "login": {
      "__typename": "LoginOutput",
      "idToken": "String-sample",
      "accessToken": "String-sample",
      "refreshToken": "String-sample",
      "firstLoginChallenge": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "login": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `forgotPassword`

Module: `auth`. Return type: `ForgotPasswordResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "forgotPassword",
  "query": "mutation forgotPassword($input: ForgotPasswordInput!) { forgotPassword(input: $input) { __typename ... on ForgotPasswordOutput { success } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "identifier": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "forgotPassword": {
      "__typename": "ForgotPasswordOutput",
      "success": true
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "forgotPassword": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `forgotPasswordConfirm`

Module: `auth`. Return type: `ForgotPasswordConfirmResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "forgotPasswordConfirm",
  "query": "mutation forgotPasswordConfirm($input: ForgotPasswordConfirmInput!) { forgotPasswordConfirm(input: $input) { __typename ... on ForgotPasswordConfirmOutput { success } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "identifier": "String-sample",
      "code": "String-sample",
      "newPassword": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "forgotPasswordConfirm": {
      "__typename": "ForgotPasswordConfirmOutput",
      "success": true
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "forgotPasswordConfirm": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `firstChangePassword`

Module: `auth`. Return type: `FirstChangePasswordResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "firstChangePassword",
  "query": "mutation firstChangePassword($input: FirstChangePasswordInput!) { firstChangePassword(input: $input) { __typename ... on FirstChangePasswordOutput { success } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "identifier": "String-sample",
      "newPassword": "String-sample",
      "challengeSession": "String-sample",
      "tempPassword": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "firstChangePassword": {
      "__typename": "FirstChangePasswordOutput",
      "success": true
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "firstChangePassword": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `logout`

Module: `auth`. Return type: `LogoutResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "logout",
  "query": "mutation logout($input: LogoutInput!) { logout(input: $input) { __typename ... on LogoutOutput { success } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "accessToken": "String-sample",
      "deviceId": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "logout": {
      "__typename": "LogoutOutput",
      "success": true
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "logout": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `changePassword`

Module: `auth`. Return type: `ChangePasswordResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "changePassword",
  "query": "mutation changePassword($input: ChangePasswordInput!) { changePassword(input: $input) { __typename ... on ChangePasswordOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "newPassword": "String-sample",
      "currentPassword": "String-sample",
      "accessToken": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "changePassword": {
      "__typename": "ChangePasswordOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "changePassword": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `refreshToken`

Module: `auth`. Return type: `RefreshTokenResponse!`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "refreshToken",
  "query": "mutation refreshToken($input: RefreshTokenInput!) { refreshToken(input: $input) { __typename ... on RefreshTokenOutput { idToken accessToken refreshToken firstLoginChallenge } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "identifier": "String-sample",
      "refreshToken": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "refreshToken": {
      "__typename": "RefreshTokenOutput",
      "idToken": "String-sample",
      "accessToken": "String-sample",
      "refreshToken": "String-sample",
      "firstLoginChallenge": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "refreshToken": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `deleteUser`

Module: `auth`. Return type: `DeleteUserResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "deleteUser",
  "query": "mutation deleteUser($input: DeleteUserInput) { deleteUser(input: $input) { __typename ... on DeleteUserOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "userId": "String-sample",
      "clientType": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "deleteUser": {
      "__typename": "DeleteUserOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "deleteUser": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `conversationList`

Module: `conversation`. Return type: `ConversationListResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "conversationList",
  "query": "query conversationList($filter: ConversationFilter) { conversationList(filter: $filter) { __typename ... on ConversationListOutput { success code message data { content pageInfo } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "filter": {
      "page": 51001,
      "size": 51001
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "conversationList": {
      "__typename": "ConversationListOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": {
        "__typename": "ConversationListData",
        "content": [
          {
            "__typename": "ConversationItem",
            "groupCode": "String-sample",
            "groupName": "String-sample",
            "metadata": "ConversationMetadata-sample",
            "tags": "String-sample",
            "lastMessage": "String-sample",
            "lastMessageTime": 1250000.5,
            "unreadMessageCount": 51001
          }
        ],
        "pageInfo": {
          "__typename": "PageInfo",
          "page": 51001,
          "size": 51001,
          "totalElements": 51001,
          "totalPages": 51001,
          "first": true,
          "last": true,
          "hasNext": true,
          "hasPrevious": true
        }
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "conversationList": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `groupConversationList`

Module: `conversation`. Return type: `GroupConversationListResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "groupConversationList",
  "query": "query groupConversationList($filter: GroupConversationFilter) { groupConversationList(filter: $filter) { __typename ... on GroupConversationListOutput { success code message data { content pageInfo } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "filter": {
      "sourceCode": "String-sample",
      "page": 51001,
      "size": 51001
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "groupConversationList": {
      "__typename": "GroupConversationListOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": {
        "__typename": "ConversationListData",
        "content": [
          {
            "__typename": "ConversationItem",
            "groupCode": "String-sample",
            "groupName": "String-sample",
            "metadata": "ConversationMetadata-sample",
            "tags": "String-sample",
            "lastMessage": "String-sample",
            "lastMessageTime": 1250000.5,
            "unreadMessageCount": 51001
          }
        ],
        "pageInfo": {
          "__typename": "PageInfo",
          "page": 51001,
          "size": 51001,
          "totalElements": 51001,
          "totalPages": 51001,
          "first": true,
          "last": true,
          "hasNext": true,
          "hasPrevious": true
        }
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "groupConversationList": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `groupSubordinates`

Module: `conversation`. Return type: `GroupSubordinatesResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "groupSubordinates",
  "query": "query groupSubordinates($request: GroupSubordinatesRequest) { groupSubordinates(request: $request) { __typename ... on GroupSubordinatesOutput { success code message data { content pageInfo } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupType": "String-sample",
      "userIds": [
        "String-sample"
      ],
      "tags": [
        "String-sample"
      ],
      "sort": "String-sample",
      "direction": "String-sample",
      "page": 51001,
      "size": 51001
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "groupSubordinates": {
      "__typename": "GroupSubordinatesOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": {
        "__typename": "GroupSubordinatesData",
        "content": [
          {
            "__typename": "GroupSubordinateItem",
            "groupCode": "String-sample",
            "groupName": "String-sample",
            "groupType": "String-sample",
            "tags": "String-sample",
            "status": "String-sample"
          }
        ],
        "pageInfo": {
          "__typename": "PageInfo",
          "page": 51001,
          "size": 51001,
          "totalElements": 51001,
          "totalPages": 51001,
          "first": true,
          "last": true,
          "hasNext": true,
          "hasPrevious": true
        }
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "groupSubordinates": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `userToken`

Module: `conversation`. Return type: `UserTokenResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "userToken",
  "query": "query userToken { userToken { __typename ... on UserTokenOutput { success code message data { authToken createdAt } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {}
}
```

**Response 200**:
```json
{
  "data": {
    "userToken": {
      "__typename": "UserTokenOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": {
        "__typename": "UserTokenData",
        "authToken": "String-sample",
        "createdAt": 1250000.5
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "userToken": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `groupUpload`

Module: `conversation`. Return type: `GroupUploadResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "groupUpload",
  "query": "mutation groupUpload($request: GroupUploadRequest) { groupUpload(request: $request) { __typename ... on GroupUploadOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample",
      "files": [
        "<multipart Upload>"
      ]
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "groupUpload": {
      "__typename": "GroupUploadOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "groupUpload": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `deleteToken`

Module: `conversation`. Return type: `DeleteTokenResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "deleteToken",
  "query": "mutation deleteToken($request: DeleteTokenRequest) { deleteToken(request: $request) { __typename ... on DeleteTokenOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "token": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "deleteToken": {
      "__typename": "DeleteTokenOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "deleteToken": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `routingCandidate`

Module: `conversation`. Return type: `RoutingCandidateResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "routingCandidate",
  "query": "mutation routingCandidate($request: RoutingCandidateRequest) { routingCandidate(request: $request) { __typename ... on RoutingCandidateOutput { success code message data { uid sessionCode selectionKey retryAfterMs } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "sessionCode": "String-sample",
      "prevKey": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "routingCandidate": {
      "__typename": "RoutingCandidateOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": {
        "__typename": "RoutingCandidateData",
        "uid": "String-sample",
        "sessionCode": "String-sample",
        "selectionKey": "String-sample",
        "retryAfterMs": 51001
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "routingCandidate": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `endCall`

Module: `conversation`. Return type: `EndCallResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "endCall",
  "query": "mutation endCall($request: EndCallRequest) { endCall(request: $request) { __typename ... on EndCallOutput { success code message data { uid sessionCode selectionKey retryAfterMs } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "sessionCode": "String-sample",
      "prevKey": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "endCall": {
      "__typename": "EndCallOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": {
        "__typename": "EndCallData",
        "uid": "String-sample",
        "sessionCode": "String-sample",
        "selectionKey": "String-sample",
        "retryAfterMs": 51001
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "endCall": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `groupCS`

Module: `conversation`. Return type: `GroupCSResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "groupCS",
  "query": "mutation groupCS($request: GroupCSRequest) { groupCS(request: $request) { __typename ... on GroupCSOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "name": "String-sample",
      "tenantType": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "groupCS": {
      "__typename": "GroupCSOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "groupCS": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `addCS`

Module: `conversation`. Return type: `AddCSResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "addCS",
  "query": "mutation addCS($request: AddCSRequest) { addCS(request: $request) { __typename ... on AddCSOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "addCS": {
      "__typename": "AddCSOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "addCS": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `addCSWeekend`

Module: `conversation`. Return type: `AddCSResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "addCSWeekend",
  "query": "mutation addCSWeekend($request: AddCSRequest) { addCSWeekend(request: $request) { __typename ... on AddCSOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "addCSWeekend": {
      "__typename": "AddCSOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "addCSWeekend": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `kickMemberQuotationGroupChat`

Module: `conversation`. Return type: `KickMemberQuotationGroupChatResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "kickMemberQuotationGroupChat",
  "query": "mutation kickMemberQuotationGroupChat($request: KickMemberQuotationGroupChatRequest) { kickMemberQuotationGroupChat(request: $request) { __typename ... on KickMemberQuotationGroupChatOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample",
      "userId": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "kickMemberQuotationGroupChat": {
      "__typename": "KickMemberQuotationGroupChatOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "kickMemberQuotationGroupChat": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `kickMemberOrderGroupChat`

Module: `conversation`. Return type: `KickMemberQuotationGroupChatResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "kickMemberOrderGroupChat",
  "query": "mutation kickMemberOrderGroupChat($request: KickMemberQuotationGroupChatRequest) { kickMemberOrderGroupChat(request: $request) { __typename ... on KickMemberQuotationGroupChatOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample",
      "userId": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "kickMemberOrderGroupChat": {
      "__typename": "KickMemberQuotationGroupChatOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "kickMemberOrderGroupChat": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `KickMemberCCRoutingGroupChat`

Module: `conversation`. Return type: `KickMemberQuotationGroupChatResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "KickMemberCCRoutingGroupChat",
  "query": "mutation KickMemberCCRoutingGroupChat($request: KickMemberQuotationGroupChatRequest) { KickMemberCCRoutingGroupChat(request: $request) { __typename ... on KickMemberQuotationGroupChatOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample",
      "userId": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "KickMemberCCRoutingGroupChat": {
      "__typename": "KickMemberQuotationGroupChatOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "KickMemberCCRoutingGroupChat": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `addMembers`

Module: `conversation`. Return type: `AddMembersResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "addMembers",
  "query": "mutation addMembers($request: AddMembersRequest) { addMembers(request: $request) { __typename ... on AddMembersOutput { success code message data } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "request": {
      "groupCode": "String-sample",
      "members": [
        {
          "userId": "String-sample",
          "type": "String-sample"
        }
      ]
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "addMembers": {
      "__typename": "AddMembersOutput",
      "success": true,
      "code": "String-sample",
      "message": "String-sample",
      "data": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "addMembers": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `saveToken`

Module: `firebase`. Return type: `SaveTokenResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "saveToken",
  "query": "mutation saveToken($input: SaveTokenInput) { saveToken(input: $input) { __typename ... on SaveTokenOutput { data { deviceId } success message code } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "notificationToken": "String-sample",
      "platform": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "saveToken": {
      "__typename": "SaveTokenOutput",
      "data": {
        "__typename": "SaveTokenData",
        "deviceId": "String-sample"
      },
      "success": true,
      "message": "String-sample",
      "code": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "saveToken": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `notificationList`

Module: `notification`. Return type: `NotificationListResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "notificationList",
  "query": "query notificationList($filter: NotificationFilter) { notificationList(filter: $filter) { __typename ... on NotificationListOutput { data { content pageInfo } success message code } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "filter": {
      "page": 51001,
      "size": 51001,
      "isRead": true
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "notificationList": {
      "__typename": "NotificationListOutput",
      "data": {
        "__typename": "NotificationData",
        "content": [
          {
            "__typename": "Notification",
            "id": 51001,
            "tenantId": 51001,
            "tenantType": "String-sample",
            "userId": "String-sample",
            "title": "String-sample",
            "content": "String-sample",
            "targetClient": "String-sample",
            "targetRoute": "String-sample",
            "routeParams": "String-sample",
            "sourceSystem": "String-sample",
            "isRead": true,
            "readAt": "String-sample",
            "createdAt": "String-sample"
          }
        ],
        "pageInfo": {
          "__typename": "PageInfo",
          "page": 51001,
          "size": 51001,
          "totalElements": 51001,
          "totalPages": 51001,
          "first": true,
          "last": true,
          "hasNext": true,
          "hasPrevious": true
        }
      },
      "success": true,
      "message": "String-sample",
      "code": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "notificationList": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `notificationUnreadCount`

Module: `notification`. Return type: `NotificationUnreadCountResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "notificationUnreadCount",
  "query": "query notificationUnreadCount($page: Int, $size: Int) { notificationUnreadCount(page: $page, size: $size) { __typename ... on NotificationUnreadCountOutput { data { unread_count } success message code } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "page": 51001,
    "size": 51001
  }
}
```

**Response 200**:
```json
{
  "data": {
    "notificationUnreadCount": {
      "__typename": "NotificationUnreadCountOutput",
      "data": {
        "__typename": "NotificationUnreadCountData",
        "unread_count": 51001
      },
      "success": true,
      "message": "String-sample",
      "code": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "notificationUnreadCount": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `notificationReadAll`

Module: `notification`. Return type: `NotificationReadAllResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "notificationReadAll",
  "query": "mutation notificationReadAll { notificationReadAll { __typename ... on NotificationReadAllOutput { data success message code } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {}
}
```

**Response 200**:
```json
{
  "data": {
    "notificationReadAll": {
      "__typename": "NotificationReadAllOutput",
      "data": 51001,
      "success": true,
      "message": "String-sample",
      "code": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "notificationReadAll": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Mutation `notificationReadById`

Module: `notification`. Return type: `NotificationReadByIdResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Không thấy gateway enforce `Idempotency-Key`; chống gọi trùng thuộc downstream/domain owner.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "notificationReadById",
  "query": "mutation notificationReadById($id: Int) { notificationReadById(id: $id) { __typename ... on NotificationReadByIdOutput { data success message code } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "id": 51001
  }
}
```

**Response 200**:
```json
{
  "data": {
    "notificationReadById": {
      "__typename": "NotificationReadByIdOutput",
      "data": "String-sample",
      "success": true,
      "message": "String-sample",
      "code": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "notificationReadById": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

### Query `supperSetQuestToken`

Module: `supper-set`. Return type: `SupperSetQuestTokenResponse`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, không yêu cầu `Idempotency-Key`.

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-20260512-0001"
  },
  "operationName": "supperSetQuestToken",
  "query": "query supperSetQuestToken($input: supperSetQuestTokenInput) { supperSetQuestToken(input: $input) { data { token } success message code } }",
  "variables": {
    "input": {
      "dashboardId": "String-sample"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "supperSetQuestToken": {
      "__typename": "SupperSetQuestTokenResponse",
      "data": {
        "__typename": "SupperSetQuestTokenData",
        "token": "String-sample"
      },
      "success": true,
      "message": "String-sample",
      "code": "String-sample"
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "supperSetQuestToken": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "2026-05-12T09:30:00Z"
    }
  }
}
```

**Error codes**:
| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document không parse được. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables không khớp SDL. |
| `BAD_USER_INPUT` | 400 | Input không hợp lệ theo GraphQL/custom scalar. |
| `UNAUTHENTICATED` | 401 | `AuthenticationError` khi operation yêu cầu auth. |
| `FORBIDDEN` | 403 | `AuthorizationError` khi user không đủ quyền. |
| `MISS_X_CLIENT` | 400 | Thiếu header `x-client-type` ở flow yêu cầu client type. |
| `NOT_FOUND` | 404 | `NotFoundError` cho resource không tồn tại. |
| `ERROR` | 500 | `firebase.service.ts` trả khi save/delete token thất bại. |
| `SUPPERSET_ERROR` | 502 | Superset login/CSRF/guest token thất bại hoặc resolver Superset catch lỗi. |
| `<downstream code>` | downstream | Auth/notification/conversation services trả structured error; resolver preserve trong `ErrorResponse`. |

## 4. Forbidden Patterns

- Không issue JWT hoặc persist session trong gateway nếu downstream IAM/tenant service mới là authority.
- Không thêm persistence layer mới cho BFF nếu chưa có ADR rõ ràng.
- Không gọi direct database của downstream service trong resolver.
- Không log raw `Authorization`, token, file content hoặc PII payload.
- Không đổi tên public operation nếu chưa có deprecation/migration plan.

## 5. References

- HLD: [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md)
- Source schema: `src/graphql/common/base.schema.ts`, `src/graphql/modules/**/**/*.schema.ts`
- Source resolvers/services: `src/graphql/modules/**/**/*.resolver.ts`, `src/graphql/modules/**/**/*.service.ts`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-12 | v2 | Rà soát lại từ mã nguồn, cập nhật đầy đủ Query/Mutation trong SDL, request/response theo operation signature và mã lỗi gateway/downstream thực tế. |