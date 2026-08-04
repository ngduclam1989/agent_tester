---
type: index
artifact_kind: readme
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority + Architect
boundary: "cross-cutting"
last_reviewed: "2026-07-14"
---

# Product/Commons — Common Registry Index

> **Mục đích**: Single source of truth cho các artifact **dùng chung xuyên phân hệ** trong Garage — được cite từ Product docs (PRD/EP/FEAT/BR/UX-Flow) thay vì viết lại inline. Bootstrap 2026-07-10; index này khởi tạo 2026-07-14 để BA agent + DEV có 1 điểm truy cập.

---

## Files

| File | Kind | Content | When to cite |
|---|---|---|---|
| [BR-COMMON.md](./BR-COMMON.md) | Business Rules registry | Rule dùng chung toàn hệ thống (auth · data format · validation · pagination · UI display · confirm dialog · file upload · nghiệp vụ nội tại). Nguồn Confluence `/wiki/spaces/CE/pages/13828374`. 8 section (§2.1..§2.8). | FEAT/BR mới cần dùng rule scope common → cite `[BR-COMMON#SYS-RETRY-NNN]` thay vì viết lại. |
| [ERROR-CODE-REGISTRY.md](./ERROR-CODE-REGISTRY.md) | Error-code registry | Mã lỗi BE ↔ FE thống nhất (ERR-CMN-* common + ERR-INS-* insurance + ERR-INV-* inventory). §2/§3 human table + §6 machine-readable YAML cho codegen. | Mọi AC/BR có validation/error path → cite mã cụ thể (`ERR-INV-045`, `ERR-CMN-004`, …). Nếu mã chưa có → propose mã mới + CR. |

## Convention

1. **KHÔNG copy-paste rule/message vào FEAT/BR** — chỉ cite `[BR-COMMON#...]` hoặc `ERR-XXX-NNN`.
2. **Rule extensible**: append theo số tăng dần trong section tương ứng của BR-COMMON.md; error-code append cuối §2/§3/§4 của REGISTRY.
3. **Ownership**: Business Authority + Architect co-own. Any add/change → bump version + Change Log entry của file tương ứng.
4. **Naming**: `BR-COMMON.md` = business rules; `ERROR-CODE-REGISTRY.md` = error codes. Không tách file riêng theo domain (VLD/MSG/PERM) — dùng section trong 2 file canonical này.

## What NOT to add

- **KHÔNG tạo `Product/_common/` folder** (underscore/snake-case duplicate). Canonical path là `Product/Commons/` (PascalCase, per 2026-07-10 bootstrap).
- **KHÔNG tách VLD-COMMON.md / MSG-COMMON.md / PERM-COMMON.md riêng** — đã có §2.3 (validation), §2.5 (UI/message), §2.1 (auth/permission) trong BR-COMMON.md. Tách file → split registry → drift risk.
- **KHÔNG cite BR-COMMON rule vào FEAT/BR Garage nếu applicability chưa rõ** — BR-COMMON scope là org-level (Garage + Vendor + Express + ...); một số rule không apply hoặc apply 1 phần cho Garage. Kiểm tra trước khi cite.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-14 | 1 | Business Authority + Architect | Khởi tạo README index cho `Product/Commons/` folder (bootstrap từ 2026-07-10 nhưng chưa có index). Ghi rõ 2 file canonical (BR-COMMON.md + ERROR-CODE-REGISTRY.md) + convention cite / not-copy / ownership; note KHÔNG tạo `_common/` snake-case duplicate + KHÔNG tách VLD/MSG/PERM riêng (đã có trong BR-COMMON §2.x). Cite BA-review W05-INVENTORY-V2 2026-07-14 C4.1 (finding false positive do agent grep `_common/` sai path — bootstrap thực tế đã có). |
