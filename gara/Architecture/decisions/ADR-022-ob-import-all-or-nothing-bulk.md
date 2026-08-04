---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 4
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-07-06"
---

# ADR-022: Import Tồn đầu kỳ — Wizard 2 bước all-or-nothing + Cap 500 dòng (mở rộng pattern ADR-018)

## Status
ACCEPTED — 2026-07-06

## Context

`FEAT-OB-IMPORT` v12 (BA chốt 2026-07-06) đã fix:
- **AC-3b (kiểm tra cấp file)**: chỉ chấp nhận `.xlsx`; file rỗng → block; > 500 dòng → `ERR-INV-048` ngay ở bước verify.
- **AC-6 (all-or-nothing)**: chỉ commit khi TẤT CẢ dòng hợp lệ; ≥ 1 dòng lỗi → block cả file (BR-OB-004a).
- **AC-5 (validate theo dòng)**: liệt kê 10 mã lỗi — mã sản phẩm không tồn tại, ngừng hoạt động, SL ≤ 0, GT < 0, ĐVT lệch, thiếu trường, sai định dạng ngày, kho không tồn tại, kỳ CLOSED, trùng (mã+kho), cascade tồn âm, OB sau ngày phiếu.

ADR-018 (`inventory-v2-bulk-import-pattern.md`) đã đặc tả sẵn pattern bulk cho `internal-products/verify-import + import` với FE-parse-xlsx-browser-side (KHÔNG parse server-side) + JSON body 2 bước. `FEAT-OB-IMPORT` follow paradigm này nhưng thêm ngữ nghĩa mới: (1) commit all-or-nothing (ADR-018 là partial-commit — commit các dòng hợp lệ, skip lỗi); (2) side-effect cascade sang sổ tồn + lock-check qua gf-accounting (ADR-020 + ADR-021).

Câu hỏi chính cần quyết định:

1. **Tái dùng pattern ADR-018** hay tách ADR mới?
2. **Ranh giới transaction all-or-nothing** — 1 DB transaction cho 500 dòng, hay commit theo chunk nhỏ hơn + stack rollback?
3. **Vị trí parse file** — FE (như ADR-018), BE server-side (bulk truyền thống), hay chia sẻ giữa 2?
4. **Điểm enforce cap 500** — FE, BFF, chỉ BE, hay cả 3?
5. **Thời điểm cascade** — cascade sổ tồn + lock-check ở bước verify (preview only), hay chỉ ở bước commit?

**Constraints từ Product layer:**
- BR-OB-004a all-or-nothing (nguyên văn).
- BR-OB-004b cap 500 dòng, `ERR-INV-048` (mở rộng cap 500 của ADR-018).
- FEAT-OB-IMPORT AC-3b: file check (`.xlsx`, rỗng, > 500) ở **bước verify** (trước preview).
- FEAT-OB-IMPORT AC-4 cards preview: Tổng dòng / Hợp lệ / Lỗi / Kho + table 12 cột.
- FEAT-OB-IMPORT AC-6 all-or-nothing tại commit + cascade sổ tồn (BR-STKV2-001 tình huống #1 write-path).

**Constraints từ team / runtime:**
- ADR-018 đã chốt: FE parse `.xlsx` browser-side (SheetJS hoặc tương tự), gửi JSON body 2 bước; BE CHỈ validate JSON. Cap 500 dòng defensive ở FE + BFF + BE.
- Engine tính lại sổ tồn của ADR-020 có thể được gọi từ write-path OB (cascade forward).
- ADR-021 lock-check cross-boundary REST advisory + authoritative.
- gf-inventory Flyway V{N+1} additive.
- Hạ tầng hiện có: bảng legacy `product` + `internal_product` mới (ADR-017) + catalog `warehouse` mới + BR-OB-005 lookup theo tên kho.

**Business rules liên quan:** BR-OB-001..016, BR-OB-EDIT-*, BR-OB-DEL-*, BR-STKV2-001, BR-STKV2-005a, BR-AP-012.

## Decision

**Mở rộng pattern ADR-018** với 3 điểm khác biệt cho OB: (a) **commit all-or-nothing** (single JPA transaction, rollback khi có bất kỳ lỗi nào); (b) **cascade sổ tồn ngay sau commit** qua `StockLedgerRecomputeService` (ADR-020); (c) **tích hợp lock-check** qua `gfAccountingClient` (ADR-021). Parse file ở FE (browser SheetJS), body JSON, cap 500 ở FE + BFF + BE.

Cụ thể:

- **Wizard 2 bước, body JSON** (mirror ADR-018):
  - Bước 1: FE parse `.xlsx` browser-side (SheetJS). Kiểm tra cấp file gồm 2 nhánh khác nhau về ngữ nghĩa (BA/PO chốt 2026-07-06):
    - **Extension mismatch**: FE first-check phải là `.xlsx` — file khác định dạng thì reject ngay ở FE với message thân thiện "Vui lòng chọn file `.xlsx`" (không có mã lỗi Product-registered; nếu bị bypass qua BFF thì BE trả HTTP 400 thuần với `ERR-CMN-validation`).
    - **> 500 dòng**: FE first-check reject với `ERR-INV-048` (BR-OB-004b) — message "Vượt giới hạn 500 dòng/lần import — vui lòng tách file". Mutation BFF `verifyImportOpeningBalances` + BE `POST /api/v2/opening-balances/verify-import` re-check row count (defensive) → trả `ERR-INV-048` nếu bị bypass.
    - **File rỗng (chỉ có headers, 0 dòng dữ liệu)** — **KHÔNG reject, KHÔNG throw mã lỗi** (BA/PO 2026-07-06 chốt "empty file không phải là error"). FE cho qua sang bước 2 → verify-import BE trả `totalRows=0 / validRows=0 / errorRows=0 / canCommit=false` (canCommit=false vì `totalRows === 0`, không có gì để commit); BFF/FE render banner INFO "File không có dữ liệu, không có gì để import" trong preview area (KHÔNG phải error message) + nút "Xác nhận import" DISABLED; user phải quay lại chọn file khác. Ngữ nghĩa "empty file" khác biệt hoàn toàn với `ERR-INV-048` (over-cap) và với extension mismatch — không dùng chung mã lỗi.
  - Bước 2: FE submit JSON body `[{tenIdRowNumber, ma, tenSp, dvt, kho, slTon, gtTon, tonDenNgay}]` (các row raw từ file, chưa resolve ID). BE resolve: product code → `internal_product.id` + `main_unit_code` (BR-OB-006/007/010), warehouse name → `warehouse.id` (BR-OB-005), validate 10 mã lỗi (BR-OB-006..016), lock-check qua `gfAccountingClient` (ADR-021). Response: `{totalRows, validRows, errorRows, warehouseNames[], previewLines[{rowNumber, status: 'VALID'|'ERROR', errors: [{code, field, message}]}]}`.
- **Commit all-or-nothing** ở BE:
  - `POST /api/v2/opening-balances/import` — 1 method Spring `@Transactional`:
    1. Chạy lại validate theo dòng (idempotency + defense-in-depth).
    2. Chạy lại lock-check cho từng ngày distinct (authoritative — ADR-021).
    3. Nếu ≥ 1 lỗi → throw `AllOrNothingImportException` → rollback transaction → response `ERR-INV-024`/`ERR-INV-034`/... với danh sách dòng lỗi.
    4. Bulk `saveAll(openingBalanceLines)` — JPA batch insert (`hibernate.jdbc.batch_size=100`).
    5. Với mỗi `(tenant, product, warehouse)` distinct được chạm → gọi `StockLedgerRecomputeService.recompute(fromDate = ngày OB nhỏ nhất cho key đó)` (ADR-020).
    6. Trả về `{totalRows, importedRows, timestamp, importedBy, checksum, fileName}` (card kết quả FEAT-OB-IMPORT AC-8).
  - Cascade rollback: nếu bước 5 fail (cascade tồn âm, `ERR-INV-036`) → rollback transaction → bước 4 undo → không có row OB nào tồn tại.
- **Enforce cap 500** — 3 tầng (defense-in-depth): FE (đếm khi SheetJS parse), BFF (validator input của mutation), BE (endpoint verify-import + import).
- **Parse file** — **CHỈ browser-side ở FE** (nguyên văn ADR-018). BE không bao giờ nhận binary `.xlsx`. Download template `.xlsx` = **FE bundled static asset** (sync từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` vào `frontend/gf-gms-web/src/assets/`) — KHÔNG có BE endpoint, KHÔNG S3, KHÔNG call qua BFF. BA/PO chốt 2026-07-06 (Q2 fix — thay đề xuất ban đầu `GET /api/v2/opening-balances/template` bằng FE bundled asset).
- **Thời điểm cascade** — cascade sổ tồn CHỈ ở bước commit (không phải verify). Preview verify chỉ hiển thị status validate; side-effect cascade chạy atomically bên trong transaction commit.
- **Ngữ nghĩa preview distinct-count** — response include danh sách warehouse distinct cho card preview "Kho áp dụng" (FEAT-OB-IMPORT AC-4).
- **Idempotency** — client sinh header `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` cho `POST /import`; BE dedup 24h qua `processed_events` (per gf-inventory-HLD.md §5). Ngăn double-commit khi retry.

**Threshold để re-evaluate:**
- File > 500 dòng trở thành use case thông thường → bump cap 500 → 1000 (cần benchmark lại impact tenant fairness); đồng thời update pattern ADR-018.
- p95 cascade recompute > 5s cho batch 500 dòng → chuyển recompute sang async qua Kafka (theo threshold của ADR-020).
- Rủi ro OOM BE khi validate 500 dòng in-memory → paginate validate + streaming JSON.

## Alternatives Considered

| Alternative | Ưu điểm | Nhược điểm | Tại sao không |
|---|---|---|---|
| **A1. Parse `.xlsx` server-side** (bulk import truyền thống) | BE kiểm soát hoàn toàn; không phụ thuộc FE parse | Vi phạm pattern ADR-018 (FE parse browser-side); BE dep Apache POI tăng memory + attack surface; phức tạp multipart upload. | **Rejected** — precedent ADR-018 + lý do (memory, attack surface, quirks của XLSX parse). |
| **A2. Partial commit (skip các dòng lỗi)** (pattern ADR-018) | User throughput cao hơn; ít re-work | Vi phạm BR-OB-004a all-or-nothing (BA đã đổi FEAT-OB-IMPORT v10 2026-07-03 rõ ràng từ partial sang all-or-nothing); partial commit OB = NXT lệch. | **Rejected** — hard requirement của BR. |
| **A3. Chunked commit** (100 dòng/chunk, stack rollback) | Xử lý được 500 dòng với transaction nhỏ hơn; ít contention lock | Stack rollback phức tạp; nếu chunk N+1 fail, chunk 1..N đã commit → user thấy "ghi một phần" — vi phạm all-or-nothing. | **Rejected** — cùng lý do. |
| **A4. Không enforce cap 500 ở BE (tin FE + BFF)** | Code BE đơn giản hơn | Vi phạm defense-in-depth; client malicious/buggy bypass FE + BFF → BE xử lý 100k dòng → OOM. | **Rejected** — enforce 3 tầng là pattern của ADR-018. |
| **A5. Cascade recompute async qua Kafka trigger** | Giảm latency import; scale tốt hơn | Response cần confirm success — user không biết OB import "thành công" nhưng cascade fail (tồn âm) → invariant broken một cách vô hình; UX bị hỏng. | **Rejected** — cascade tight-coupling với write per thuật toán 4 bước của ADR-020; async để lại future work theo threshold. |
| **A6. Cascade non-transactional (best-effort)** | Recompute không block import | Nếu cascade fail sau khi import success → sổ tồn drift so với OB → BR-STKV2-001 bị broken; recovery phức tạp. | **Rejected** — single transaction + rollback là gọn gàng nhất. |

## Consequences

**Positive:**
- Tái dùng pattern ADR-018 — FE + BFF + BE đều đã biết paradigm này (2-step, JSON, cap 500, defense-in-depth).
- Tuân thủ BR-OB-004a all-or-nothing qua single transaction + rollback.
- Idempotency key ngăn double-commit khi retry (network drop giữa chừng commit).
- Cascade atomic với import → sổ tồn + OB luôn nhất quán (không có cửa sổ drift).
- Enforce cap 500 ở 3 tầng khớp với pattern defense của ADR-018.

**Negative:**
- **Single transaction 500 dòng có thể lock table** (write cascade `opening_balance_line` + `inventory_stock_ledger` + `inventory_stock`). **Mitigation**: (a) JPA `batch_size=100`; (b) OB import hiếm/thường ngoài giờ (dữ liệu seed của garage); (c) Redisson lock per `(tenant, product, warehouse)` trong recompute — không lock cấp table.
- **BE re-validate mọi field 2 lần** (verify + import) — CPU × 2 + REST call × 2 (lock-check per ngày distinct). **Mitigation**: cache LRU (ADR-021); re-validation là safety net authoritative.
- **File > 500 dòng không được hỗ trợ** → user phải tách file (thủ công). **Mitigation**: message của FEAT-OB-IMPORT AC-3b rõ: "Vui lòng tách file thành nhiều lần"; threshold ở wave sau bump cap sau khi benchmark.

**Risks:**
- **BE OOM khi validate 500 dòng in-memory** — worst-case JSON body ~500KB, resolve 500 product code + 500 ngày × 200ms lock-check. **Mitigation**: fetch parallel các key distinct + cache; cap 500 giới hạn memory ceiling ~50MB per request; monitor JVM heap.
- **Collision idempotency-key giữa các tenant** → false dedup. **Mitigation**: format key gồm tenantId + uuid → unique toàn cục.
- **Cascade recompute fail sau khi validate xong nhưng trước khi commit** (DB transient error giữa chừng cascade) — rollback transaction + retry. **Mitigation**: Spring `@Retryable` ở wrapper method (không đặt bên trong transaction); idempotency key đảm bảo retry safe.

**Trade-off accept:** Chấp nhận **lock 500 dòng trong single transaction** đổi lấy **tuân thủ BR-OB-004a** + **atomicity với cascade** + **retry idempotent**. Use case file > 500 dòng defer qua workaround tách file.

**Test verification (DEV Stage — W04):**
- Test 1: File 100 dòng, 1 dòng lỗi (unit mismatch) → verify preview mark row 1 error; button disabled; user sửa file → verify pass; import → 100 dòng committed + ledger cascade cho từng (mã+kho) distinct; card kết quả OK.
- Test 2: File 501 dòng → verify-import → `ERR-INV-048` trước khi parse rows; message "Vui lòng tách file".
- Test 3: File extension `.txt` → FE reject trước khi tới BFF; nếu bypass → BE reject với format error.
- Test 4: File rỗng (chỉ có headers, 0 dòng dữ liệu) → verify-import PASS với response `{totalRows: 0, validRows: 0, errorRows: 0, canCommit: false, warehousesInFile: [], previewLines: []}`; FE render banner INFO "File không có dữ liệu, không có gì để import" trong preview area + nút "Xác nhận import" DISABLED (do `canCommit=false`); user phải quay lại chọn file khác. **KHÔNG throw error code** cho case này (BA/PO chốt 2026-07-06 — empty file không phải error).
- Test 5: 2 import đồng thời cùng tenant cùng key (mã+kho) → transaction serialize qua Redisson lock; cái thứ 2 nhận `ERR-INV-034` (duplicate).
- Test 6: Import commit thành công; cascade recompute fail giữa chừng (giả lập DB error) → rollback cả transaction; OB rows không tồn tại; response 5xx kèm hint retryable.
- Test 7: Import gọi 2 lần với cùng `X-Idempotency-Key` → lần thứ 2 trả cached response (200 OK, `alreadyImported: true`).

## References

- [ADR-018: Inventory V2 Bulk Import Pattern](ADR-018-inventory-v2-bulk-import-pattern.md) — precedent pattern (FE parse, JSON body, cap 500, 2-step)
- [ADR-020: Stock Ledger Daily-Snapshot](ADR-020-stock-ledger-daily-snapshot.md) — engine cascade được gọi tại commit bước 5
- [ADR-021: OB Period-Lock Cross-Boundary](ADR-021-ob-period-lock-cross-boundary.md) — tích hợp lock-check ở cả verify + commit
- [`Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md`](../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md) §2.1 BR-OB-001..016, đặc biệt BR-OB-004a/004b
- [`Product/features/FEAT-OB-IMPORT.md`](../../Product/features/FEAT-OB-IMPORT.md) v12 AC-1..9, EC-1..11
- [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../Product/error-code/ERROR-CODE-REGISTRY.md) — ERR-INV-009/010/017/018/019/020/024/032/033/034/035/036/048
- Related ADRs: ADR-004 (outbox — có note về consumer PROPOSED tương lai), ADR-013 (backward-compat additive), ADR-017 (catalog V2 additive), ADR-018 (precedent pattern bulk-import)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-06 | 4 | Architecture Authority (agent-arch-author W04) | **W04 Q2 fix — BA/PO chốt 2026-07-06 template `.xlsx` do FE quản lý (bundled static asset)**. Audit độc lập phát hiện Q2 còn treo. BA/PO chốt phương án khác 3 lựa chọn ban đầu: xoá endpoint BE `GET /api/v2/opening-balances/template` khỏi thiết kế; FE bundle file `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` (BA đã tạo, ship trong Product docs 2026-07-06) làm static asset trong `frontend/gf-gms-web/src/assets/`, render qua `<a href={bundled_url} download>` hoặc `fetch(bundled_url).then(blob → saveAs)` — zero BFF/BE call. Sửa 1 điểm trong ADR-022 §Decision bullet "Parse file": thay câu "Download template `.xlsx` = static asset qua `GET /api/v2/opening-balances/template` (redirect S3 signed URL hoặc classpath resource)" bằng "Download template `.xlsx` = **FE bundled static asset** (sync từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` vào `frontend/gf-gms-web/src/assets/`) — KHÔNG có BE endpoint, KHÔNG S3, KHÔNG call qua BFF. BA/PO chốt 2026-07-06 (Q2 fix)". Pair với `gf-inventory-api v38` (xoá §3b.1 W04-2 row + §3b.2 detail block + §3b.4 mapping + §5.1 Naming Registry row) + `agg-garage-graph-graphql v7.47` (xoá §2 row 332 + §3g.1 SDL type + §3g.2 W04-Q2 + §3g.6 detail block) + `agg-garage-graph-HLD v12` (§1 callout 7→6 ops + §1b cache bullet) + `INTEG-FE-garage-web-agg-garage-graph v17` (§3.6c UI mapping) + `garage-web-HLD v11` (§8b.2 cache bullet). **KHÔNG đụng Product docs** — `FEAT-OB-IMPORT.md` AC-2 "Tải template mẫu" wording không phụ thuộc transport (fit cả BE-endpoint và FE-bundled patterns); `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` đã có sẵn từ BA. v3 → v4. |
| 2026-07-06 | 3 | Architecture Authority (agent-arch-author W04) | **BA/PO chốt 2026-07-06 — phương án (b) cho case file rỗng**: KHÔNG chặn file rỗng (không phải error), nhưng vẫn không cho commit no-op. Sửa 2 điểm trong ADR-022: (1) §Decision bullet "Wizard 2 bước → Bước 1" tách thành 3 nhánh ngữ nghĩa riêng biệt — **extension mismatch** (FE reject với message "Vui lòng chọn file `.xlsx`", nếu bypass thì BE trả HTTP 400 `ERR-CMN-validation` thuần), **> 500 dòng** (giữ `ERR-INV-048` per BR-OB-004b), **file rỗng** (KHÔNG reject, KHÔNG throw mã lỗi — cho qua sang bước 2 → verify-import BE trả `totalRows=0/validRows=0/errorRows=0/canCommit=false` → BFF/FE banner INFO "File không có dữ liệu, không có gì để import" + button DISABLED). Xoá gộp chung "extension, rỗng, > 500" cùng dùng `ERR-INV-048` (sai ngữ nghĩa). (2) §Test verification Test 4: thay `verify ERR-INV-XXX-EMPTY` placeholder (chưa resolve) bằng mô tả hành vi phương án (b) — verify-import PASS với `{totalRows:0, validRows:0, errorRows:0, canCommit:false, warehousesInFile:[], previewLines:[]}` + FE render banner INFO + button DISABLED, KHÔNG throw error code. Không đụng file khác. `gf-inventory-api.md §3b.2` W04-3 verify-import response schema đã có sẵn field `canCommit: bool` — chỉ cần bump khi doc rõ semantics case empty file. **KHÔNG sửa Product docs** (BR-OB-004b + FEAT-OB-IMPORT AC-3b sẽ do BA tự update — kiến trúc chỉ khớp với quyết định (b), không đồng bộ ngược lên Product). v2 → v3. |
| 2026-07-06 | 2 | Architecture Authority (agent-arch-author W04) | Dịch toàn bộ nội dung mô tả sang tiếng Việt có dấu theo yêu cầu user — không đổi quyết định/logic/số liệu, chỉ đổi ngôn ngữ trình bày. Đã dịch: §Context (câu hỏi chính + 2 khối Constraints), §Decision (bullets Wizard 2-bước + Commit all-or-nothing 6 bước + Enforce cap 500 + Parse file + Cascade timing + Preview + Idempotency + Threshold), §Alternatives Considered (header cột `Pros` → `Ưu điểm`, `Cons` → `Nhược điểm`; dịch nội dung 2 cột đó; cột "Tại sao không" giữ nguyên), §Consequences (Positive/Negative/Risks/Trade-off accept — giữ nguyên label in đậm tiếng Anh, chỉ dịch câu mô tả), §Test verification (7 test case). Giữ nguyên 7 heading cấu trúc, frontmatter, mọi identifier kỹ thuật (tên endpoint/class/service, mã lỗi, citation ID, path, `X-Idempotency-Key` format), và mọi code block. v1 → v2. |
| 2026-07-06 | 1 | Architecture Authority (agent-arch-author W04) | ADR khởi tạo — Wizard OB import 2 bước mở rộng pattern ADR-018 với (a) commit all-or-nothing single-transaction (BR-OB-004a), (b) cascade sổ tồn atomic tại commit bước 5 qua engine ADR-020, (c) tích hợp lock-check ở verify + commit qua ADR-021. Cap 500 dòng enforce ở 3 tầng FE+BFF+BE (`ERR-INV-048`). Format idempotency-key `OB-IMPORT-{tenantId}-{uuid}`. Đã cân nhắc 6 alternatives (server-parse, partial commit, chunked, no BE cap, async cascade, non-tx cascade). |
