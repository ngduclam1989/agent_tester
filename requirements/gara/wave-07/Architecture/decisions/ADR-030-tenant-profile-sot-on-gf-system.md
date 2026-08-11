---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-system
last_reviewed: "2026-08-05"
---

# ADR-030: Hồ sơ doanh nghiệp garage — bảng `tenant_profile` mới trên `gf-system` làm SoT (thay vì mở rộng `branches`)

## Status

ACCEPTED — 2026-08-05

## Context

1. **Câu hỏi chính**: khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS" (`FEAT-SYS-DRIVERPLUS-LINK` AC-11) cần 5 trường mà `gf-system` **hiện không có** — Tên doanh nghiệp, SĐT liên hệ, Địa chỉ chi tiết, Xã/Phường, Tỉnh/Thành phố. Lưu ở đâu?
2. **Câu hỏi phụ**: thêm cột vào `branches` hay tách bảng tenant-scoped mới?

**Constraints từ Product layer:**

- `FEAT-SYS-DRIVERPLUS-LINK` AC-11 — 3 block: **THÔNG TIN DOANH NGHIỆP** (Tên doanh nghiệp, SĐT liên hệ) · **ĐỊA CHỈ** (Địa chỉ chi tiết, Xã/Phường, Tỉnh/Thành phố) · **THÔNG TIN XUẤT HOÁ ĐƠN** (4 trường, đã có).
- `BR-GF-SYSTEM.md` §1 `CB-SYS-006` — đọc **real-time từ hồ sơ garage hiện tại**, `gf-system` "re-fetch từ chính domain của mình", **KHÔNG** snapshot lúc Duyệt, **KHÔNG** cache trung gian.
- `BR-DPL-SYN-002` — "Đồng bộ lại" đọc real-time, không dùng snapshot.
- `FEAT-SYS-DRIVERPLUS-LINK` AC-20 — modal xác nhận đồng bộ nói "thông tin garage hiện tại của **{Tên garage}**" → phạm vi **garage (tenant)**, không phải chi nhánh.

**Constraints từ runtime / source evidence (đã verify):**

- `Architecture/data/gf-system-data-model.md` §2 `tenant_invoice_info` phủ **đúng 4 trường** khối xuất hoá đơn: `company_name` / `tax_code` / `company_address` / `company_email_address` — tenant-scoped, unique `tenant_id`.
- `branches` **KHÔNG có bất kỳ cột địa chỉ/liên hệ nào**: chỉ `branch_code` / `branch_name` / `status` / `is_default` / `additional_config` / audit. Migration **V4 đã chủ động DROP** các cột address/contact cũ (`gf-system-data-model.md` §4 bảng migration, dòng V4: "drop các cột contact/branch type cũ").
- Tên doanh nghiệp + SĐT liên hệ **không tồn tại** ở bất kỳ bảng nào của `gf-system`.
- `INTEG-EXT-ct-saas-tenant.md` chỉ document đúng 1 operation `searchUsers` — **không có** endpoint garage profile để fetch từ control plane.
- `TenantProvisionedEvent` (`gf-system-events.md` §3.1) payload **đã mang sẵn** đúng các trường cần: `tenantName`, `address`, `city`, `ward`, `phone`, `email`, `taxCode` — hiện `gf-system` consume nhưng chỉ dùng phần subscription quota, phần còn lại bị bỏ.
- `gf-system` dùng **Flyway** (`ddl-auto=none`, `validate-on-migrate=true`), migration hiện tại V1..V6.

**Business rules liên quan**: CB-SYS-006, BR-DPL-SYN-002, BR-GF-SYSTEM-002 (projection ≠ SoT).

## Decision

**Tạo bảng mới `tenant_profile` (tenant-scoped, unique `tenant_id`) trong schema `dev_gf_system` qua migration Flyway `V7` additive; `gf-system` là SoT cho toàn bộ khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS". KHÔNG thêm cột địa chỉ/liên hệ vào `branches`.**

Cụ thể:

- **Bảng**: `tenant_profile` — `tenant_id` (unique, NOT NULL) · `business_name` · `contact_phone_number` · `address_detail` · `ward` · `city` · `version` (optimistic lock) · audit 4 cột. Chi tiết cột/type/index: `Architecture/data/gf-system-data-model.md` §2.
- **Migration**: `V7__create_tenant_profile.sql` — additive, KHÔNG rewrite V1..V6 (Gotcha #9).
- **Seed ban đầu**: mở rộng consumer `TenantProvisionedEvent` sẵn có (`MessageGroup=TENANT-PROVISIONING`, `MessageStep=TENANT_PROVISIONED.1`, `tenantType=GARAGE`) để upsert `tenant_profile` từ payload đã có (`tenantName` → `business_name`, `phone` → `contact_phone_number`, `address` → `address_detail`, `ward` → `ward`, `city` → `city`). Idempotent theo `tenant_id` — cùng guard style với `existsByTenantIdAndIsDefaultTrue` của default branch.
- **Đọc**: endpoint chi tiết yêu cầu liên kết + hành động "Đồng bộ lại" đọc **trực tiếp** `tenant_profile` + `tenant_invoice_info` theo `tenant_id` tại thời điểm request — **không** snapshot vào `partner_link_request`, **không** Redis cache (CB-SYS-006).
- **Ghi (đường nhập liệu do user garage tự sửa)**: **NGOÀI PHẠM VI W07** — xem Consequences.
- **Naming**: "Tỉnh/Thành phố" dùng canonical `city` (không phải `province`) để nhất quán với vocabulary đang có trong chính boundary: `TenantProvisionedEvent.city`, `BranchLifecycleChanged.city` (`gf-system-events.md` §3.1/§3.2) và token `{CITY_CODE}` trong quy tắc sinh `branch_code` (`gf-system-HLD.md` §3).

## Alternatives considered

| Phương án | Lý do loại |
|---|---|
| Thêm 5 cột vào `branches` | (a) Sai granularity — dữ liệu là **tenant-level**, 1 tenant N branch → N bản sao, không có SoT; AC-20 nói rõ "thông tin garage". (b) V4 đã **cố ý drop** cột address/contact khỏi `branches` — thêm lại là quay ngược một quyết định schema đã thực thi. (c) `branches` là bảng lifecycle (code/status/is_default), trộn hồ sơ pháp nhân vào làm nhoè trách nhiệm. |
| Nhét vào `branches.additional_config` (JSONB) | Không query/validate được, không optimistic lock, không thể index; dữ liệu chia sẻ ra bên thứ 3 cần shape chặt. |
| Mở rộng `tenant_invoice_info` thêm 5 cột | Trộn 2 khối nghiệp vụ khác nhau (hồ sơ vận hành vs hồ sơ pháp lý xuất HĐ) mà AC-11 + AC-12 cố ý tách; `tenant_invoice_info` còn có rule riêng "chỉ fill-blank, không overwrite" (BR-GF-SYSTEM-006) — không đúng semantic cho hồ sơ vận hành. |
| Fetch real-time từ `ct-saas-tenant` mỗi lần render | Không có endpoint (`INTEG-EXT-ct-saas-tenant.md` chỉ có `searchUsers`); thêm dependency đồng bộ vào hot path của màn hình; trái CB-SYS-006 "re-fetch từ chính domain của mình". |

## Consequences

**Tích cực:**

- `gf-system` tự chủ toàn bộ khối dữ liệu chia sẻ → "Đồng bộ lại" là 2 câu SELECT theo unique key, p95 thấp, không phụ thuộc service ngoài.
- Seed miễn phí từ event provisioning đã chạy sẵn — không cần backfill job cho tenant mới; tenant cũ cần backfill 1 lần (xem gap).
- `tenant_profile` là điểm mở rộng tự nhiên cho EP-FOUND khi có màn "Hồ sơ doanh nghiệp".

**Tiêu cực / gap:**

- **Gap 1 — đường nhập liệu/sửa**: W07 **không** tạo UI/endpoint cho garage tự sửa hồ sơ. Nguồn duy nhất là seed từ `TenantProvisionedEvent`. Hệ quả: nếu garage đổi địa chỉ, dữ liệu đẩy sang Driver Plus vẫn là bản provisioning. Thuộc `EP-FOUND` — ghi vào `open_questions`, KHÔNG block contract W07 (AC-11 chỉ yêu cầu **đọc** real-time từ hồ sơ hiện tại).
- **Gap 2 — backfill tenant hiện hữu**: tenant đã provisioning trước W07 không có row `tenant_profile`. Cần 1 backfill job/one-off script từ `ct-saas-tenant` hoặc để `NULL` và render rỗng. Đọc phải null-safe: response trả field `null`, UI hiển thị rỗng — **KHÔNG** chặn Duyệt/Đồng bộ (không có AC nào yêu cầu bắt buộc đủ hồ sơ mới được Duyệt).
- **Gap 3 — `EC-5`** (`FEAT-SYS-DRIVERPLUS-LINK`): "hồ sơ garage đang bị chỉnh sửa dở dang" → dùng bản đã persist gần nhất. Thoả tự nhiên vì không có draft state ở tầng DB.

## References

- `Product/features/FEAT-SYS-DRIVERPLUS-LINK.md` AC-11, AC-20, AC-21, EC-5
- `Product/business-rules/BR-GF-SYSTEM.md` §1 CB-SYS-006 · §2.5.5 BR-DPL-SYN-002
- `Architecture/data/gf-system-data-model.md` §2 (`tenant_profile`, `tenant_invoice_info`, `branches`) · §4 (migration V7)
- `Architecture/events/gf-system-events.md` §3.1 `TenantProvisioned`
- ADR-006 (Flyway per-service data ownership) · ADR-029 (giao thức Driver Plus — consumer của dữ liệu này)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-05 | 1 | Architecture Authority (agent-arch-author) | Initial — chốt `tenant_profile` tenant-scoped (V7 additive) làm SoT cho khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS", theo USER ANSWER Q3 (2026-08-05). Loại phương án thêm cột vào `branches` (V4 đã drop, sai granularity). Seed từ `TenantProvisionedEvent` payload sẵn có. |
