---
type: reference
artifact_kind: contract
status: ACTIVE
version: 2
tier: T2
owner_authority: Delivery Authority + Architecture Authority
last_reviewed: "2026-06-16"
applies_to: "Product/features/FEAT-*.md"
applies_from_wave: "W02"
---

# FEAT Frontmatter Contract — Fan-out Gate (W02+)

> Hợp đồng frontmatter cho **source FEAT** (`Product/features/FEAT-*.md`) khi được kéo vào wave scope W02 trở đi.
> File này là **input gate** cho `/gen-execution-spec` Phase 1.5 — `scripts/validate-feat-frontmatter.py --wave NN` enforce strict.
>
> **Design principle (v2)**: BA viết FEAT KHÔNG biết wave context. Wave-level fan-out (tier nào fan-out trong wave nào) là **Delivery Authority concern** — derive từ PKG-W{NN} §1 "Boundaries affected" row. FEAT chỉ declare BE owner.
>
> **Phạm vi áp dụng**: Chỉ FEAT thuộc wave W02+ (tham chiếu `Execution/work-packages/PKG-W{NN}-*.md` row "Features"). FEAT W01-era (đã ship + không thuộc wave mới) **KHÔNG retroactive enforce** — chạy bằng `--all --soft-fail` (warning, không exit 1).

---

## 1. Required field (single)

### 1.1 `target_boundary` (always required)

Boundary owner chính của FEAT — BE service phụ trách aggregate root + business logic + persistence. Stable cross-wave: 1 FEAT có 1 BE owner duy nhất xuyên suốt vòng đời.

| Wave entry | Required | Allowed values |
|---|---|---|
| ✅ FEAT thuộc PKG-W{NN}+ | YES (strict) | 14 boundaries trong `boundary` allowlist (xem §3) |
| ❌ FEAT W01-era không kéo vào W02+ | warn-only | — |

**Backwards compat**: Source FEAT đã có `boundary:` legacy field — script auto-fallback (`target_boundary` ← `boundary` nếu vắng). Không bắt buộc rename, nhưng FEAT mới nên dùng `target_boundary:` cho rõ intent.

---

## 2. Wave-level fan-out — KHÔNG khai báo ở FEAT

> ⚠ **Touchpoint flags (`has_*_touchpoint`, `target_bff`, `target_experience_*`) đã BỎ ở contract v2.** BA không biết wave nào sẽ pull FEAT vào scope, hoặc boundary nào tham gia wave đó. Wave fan-out decision derive từ PKG.

### 2.1 Cách wave-level tier_scope được resolve

`scripts/resolve-wave-tier-scope.py {wave}` parse PKG-W{NN}-*.md §1 "Boundaries affected" row, apply mapping rules:

| Boundary name pattern | Tier |
|---|---|
| `gf-*` (gf-accounting, gf-sales, ...) | `backend` |
| `agg-*` (agg-garage-graph, ...) | `bff` |
| `garage-web` (exact) | `fe-web` |
| `garage-mobile` (exact) | `mobile` |
| External / reuse (`ct-file-storage`, ...) | (ignored) |

Wave W02 §1 có `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` → tier_scope = `[backend, bff, fe-web, mobile]` (full fan-out).

Wave foundation chỉ có `gf-*` boundaries → tier_scope = `[backend]` (no BFF/FE/Mobile fan-out).

### 2.2 Per-FEAT fan-out logic

```
final_fanout(tier, FEAT) = (tier ∈ wave_tier_scope)
```

Tất cả FEAT trong cùng wave share cùng tier_scope. Granularity loss được chấp nhận: trong thực tế garage, wave plan có scope đồng nhất per-tier cho tất cả FEAT của wave.

### 2.3 Optional override

Delivery Authority có thể override tier_scope qua PKG frontmatter `tier_scope:` (vd wave touch garage-web nhưng tạm thời chỉ build BE + BFF cho phase 1):

```yaml
# PKG-W{NN}-*.md frontmatter (optional)
tier_scope:
  - backend
  - bff
```

Khi vắng → default = inferred từ §1 boundaries.

---

## 3. Allowlist canonical

Định nghĩa chính thức tại `Execution/wave-specs/_routing/FEAT-FAN-OUT-MAP.yaml::allowlists`. Snapshot:

| Allowlist key | Values (current inventory) |
|---|---|
| `boundary` | gf-system, gf-hrms, gf-erp-mdm, gf-sales, gf-purchase, gf-inventory, gf-inventory-worker, gf-accounting, gf-shipment, gf-customer, gf-marketing, gf-notification, gf-erp-agent, gf-worker (14) |
| `bff` | agg-garage-graph (1) |
| `experience_web` | garage-web (1) |
| `experience_mobile` | garage-mobile (1) |

> `target_boundary` ở FEAT phải ∈ allowlist `boundary`. Tier-specific targets (BFF/FE/Mobile) auto-resolve từ allowlist single-value default trong `resolve-fanout.py` — không cần FEAT khai báo. Mở rộng inventory: update YAML map + cập nhật `BOUNDARY_TIER_MAP_RULES` trong `resolve-wave-tier-scope.py` (nếu thêm tier mới).

---

## 4. Sample valid frontmatter (FEAT W02+)

```yaml
---
type: feature
artifact_kind: feature
status: PLANNED
version: 18
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INSURANCE-SETTLEMENT"

# Fan-out gate (W02+) — only required field
target_boundary: "gf-accounting"

# Optional legacy alias (auto-fallback nếu target_boundary vắng)
# boundary: "gf-accounting"

last_reviewed: "2026-06-16"
---
```

Sau khi update frontmatter:
1. `python3 scripts/validate-feat-frontmatter.py --wave 02` exit 0.
2. `python3 scripts/resolve-fanout.py --source Product/features/FEAT-X.md --wave 02 --auto-wave-tier-scope --dry-run` print plan tương ứng wave_tier_scope.
3. `/gen-execution-spec 02 --dry-run` print expected output files.

---

## 5. Error messages mapping

| Validate exit | Lỗi | Cách fix |
|---|---|---|
| 1 (error) | Missing `target_boundary` (no `boundary` fallback) | Thêm `target_boundary: <name>` vào frontmatter |
| 1 (error) | `target_boundary` not in allowlist | Sửa giá trị về 1 trong 14 boundary; nếu inventory thay đổi, update YAML map trước |

---

## 6. Migration policy (W01-era FEAT)

- **KHÔNG sweep migrate** 80+ FEAT files đã production.
- FEAT chỉ migrate khi **được kéo vào W02+ wave scope** lần đầu (gate kích hoạt tại Phase 1.5).
- BA/PO update frontmatter ad-hoc khi gen execution spec lần đầu cho wave.
- Lệnh `validate-feat-frontmatter.py --all --soft-fail` chạy bulk validation no-fail để inventory drift trên CI (informational).

---

## 7. References

- `Execution/wave-specs/_routing/FEAT-FAN-OUT-MAP.yaml` — routing + allowlist + denylist canonical.
- `scripts/validate-feat-frontmatter.py` — enforcer.
- `scripts/resolve-fanout.py` — consumer.
- `scripts/resolve-wave-tier-scope.py` — wave-level gate (PKG-derived).
- `.claude/commands/gen-execution-spec.md` — orchestrator Phase 1.5.
- `Execution/wave-specs/README.md` — lifecycle DRAFT → ACTIVE.

---

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-16 | 1 | Delivery Authority + Architecture Authority | Initial contract — required fields, allowlist, wave_tier_scope interaction, migration policy (no retroactive W01). |
| 2026-06-16 | 2 | Delivery Authority + Architecture Authority | **Redesign — drop touchpoint flags ở FEAT**. BA không có wave context; touchpoint là Delivery Authority concern derive từ PKG §1 boundaries. §1 chỉ còn `target_boundary` required. §1.2 + §1.3 (touchpoint flags + conditional target_*) gỡ. §2 rewrite explain PKG-derived fan-out + optional override mechanism. Sample frontmatter giảm 4 flag → 1 field. |
