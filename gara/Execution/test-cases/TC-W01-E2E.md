---
document_id: 'GMS-TC-W01-E2E'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'gf-sales, gf-accounting, agg-garage-graph, garage-web, garage-mobile'
wave: 'W01'
owner: 'QA Authority'
last_reviewed: '2026-06-11'
---

# Test Case Template - W01: E2E

> File tầng E2E gộp 2 feature W01: luồng người dùng thực tế xuyên màn hình/boundary + Regression (R2) luồng SO thường / phiếu KH baseline + Deep E2E (R3) xuyên ≥2 feature có verify data consistency + nhánh rẽ nghiệp vụ + Tenant isolation luồng UI.
> Gộp từ `TC-INS-SO-ADJUSTMENT-W01-E2E-06062026-manual.md` (23 TC) + `TC-INS-STL-DETAIL-W01-E2E-06062026-manual.md` (13 TC). Renumbered tuần tự `TC-W01-E2E-001..036`.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-E2E`                                           |
| Wave          | W01                                                        |
| Boundary(ies) | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`            |
| Owner         | QA Authority                                               |
| Last Reviewed | 2026-06-11                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`  |

---

## 2. Scope

### In Scope

- Luồng end-to-end: kế toán mở SO Edit → nhập 5 khoản → Lưu → số tính đúng trên UI → persist (AC-13, BR-005)
- Luồng kế toán tạo phiếu QT BH từ SO → xem chi tiết → snapshot đúng xuyên suốt (AC-15 cross + AC-4..6)
- Đồng bộ Web ↔ Mobile cùng tenant (cả chiều nhập và chiều discard)
- Validation cản lưu khi lỗi (AC-14); SO đã có phiếu QT BH → khoá sửa (EC-5, AC-15)
- Tạo phiếu QT BH từ SO toàn KH → bị từ chối (VLD-INS-STL-001)
- Lỗi mạng / server / double-submit / settle callback fail / timeout ở luồng thật
- Huỷ phiếu QT BH trên UI → cascade huỷ phiếu KH → SO mở lại (AC-11)
- Regression (R2): luồng SO thường (không BH) + phiếu KH baseline + SO không-BH dùng chung endpoint vẫn hoạt động như cũ
- Deep E2E (R3): tạo SO BH → nhập 5 khoản → panel Tổng giá dịch vụ → tạo cặp phiếu QT (pull snapshot) → chi tiết phiếu QT BH; verify data consistency (tổng tiền, phân bổ) + nhánh rẽ BH âm vẫn lưu + multi-actor handover
- Tenant isolation luồng UI: garage-a mở deep-link SO/phiếu của garage-b → bị chặn
- Discard toggle BH=Có → BH=Không cross-boundary: tạo phiếu QT BH bị từ chối; for-settlement không leak allocation mồ côi; web↔mobile sync sau discard

### Out of Scope

- Field-level API validation (xem file `TC-W01-API.md`)
- UI component layout / form behavior chi tiết (xem file `TC-W01-UI.md`)
- Hồ sơ BH 4 tài liệu (W02), Dashboard công nợ BH (deferred)
- Ghi nhận thanh toán phiếu QT BH chi tiết (baseline production, FEAT-STL-DETAIL — chỉ chạm tới ở Deep E2E làm điểm dừng)
- Tạo / xem hồ sơ BH (FEAT-INS-DOSSIER-* — W02)

### Test Environment & Data

| Item                     | Required Data / Setup                                                              | Notes                                            |
| ------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| Tài khoản kế toán        | `accountant@garage-a.test` — tenant `garage-a`                                     | Actor chính                                      |
| Tài khoản chủ garage     | `owner@garage-a.test` — tenant `garage-a`                                          | Multi-actor (duyệt + R3 handover)                |
| SO DRAFT BH=Có           | `#SO-W01-BH-001`: 2 PT BH + 1 DV BH + 1 PT KH + 1 DV KH; Cộng sau VAT BH=207.9tr/KH=33tr | Luồng chính khớp ví dụ epic                |
| SO toàn KH               | `#SO-W01-KH-ONLY-001` — tất cả dòng KH                                             | VLD-INS-STL-001 / nhánh rẽ thiếu điều kiện       |
| SO thường (không BH)     | `#SO-W01-NORMAL-001` toggle BH=Không, có line KH                                   | Regression R2                                    |
| SO BH âm                 | `#SO-W01-BH-NEG` — khoản giảm > Cộng sau VAT BH                                    | Deep E2E nhánh rẽ EC-2                           |
| SO đã settled            | SO đã tạo phiếu QT BH                                                              | EC-5 khoá                                        |
| Phiếu QT BH              | `#SET-W01-INS-001` + phiếu KH `#SET-W01-KH-001` cùng cặp                           | Xem chi tiết + huỷ                               |
| Phiếu KH baseline        | `#SET-OLD-KH` (production, không cặp BH)                                           | Regression                                       |
| Phiếu QT cũ              | Phiếu QT tạo trước thay đổi schema                                                 | Regression tương thích ngược                     |
| Tenant B                 | `garage-b` với SO `#SO-B-001` riêng                                                | Test isolation deep-link                         |
| gf-sales mock            | Mock 500 cho `/settle` / timeout 30s                                               | Exception flow                                   |
| Staging env              | gf-sales + gf-accounting + agg-garage-graph + garage-web + mobile running          | Full stack cross-boundary                        |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | N/A   | —              |
| Manual        | 32    | 32 READY       |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-E2E-001 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph, garage-web | AC-13, BR-INS-SO-ADJ-005 | E2E | E2E | P1 | Kế toán nhập đủ 5 khoản → lưu → số tính đúng trên UI + persist | Staging; gf-sales + BFF + garage-web running; SO `#SO-W01-BH-001` DRAFT BH=Có | 1. Đăng nhập kế toán, mở SO Chỉnh sửa.<br>2. Nhập CK VT 5tr, CK CDV 2.5tr, Khấu hao 5%, Giảm trừ 200k, Khấu trừ 520k.<br>3. Nhấn Lưu.<br>4. Reload trang. | - Lưu thành công.<br>- Panel BH=197.680.000đ, KH=35.720.000đ, Tổng=233.400.000đ.<br>- Reload: dữ liệu persist đúng. | READY | N/A |
| TC-W01-E2E-003 | FEAT-INS-SO-ADJUSTMENT | garage-web, gf-sales | AC-14 | E2E | E2E | P1 | Nhập có lỗi validation → submit → hệ thống không lưu | garage-web; SO Edit BH=Có | 1. Nhập % âm vào CK VT.<br>2. Cố nhấn Lưu. | - Không lưu được (nút disabled hoặc thông báo lỗi).<br>- SO không cập nhật trên server. | READY | N/A |
| TC-W01-E2E-004 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | EC-5, AC-15 | E2E | E2E | P1 | Kế toán cố sửa SO đã có phiếu QT BH → bị khoá | Staging; SO đã settled (có phiếu QT BH) | 1. Mở SO đã QT ở màn Chỉnh sửa (hoặc gọi API trực tiếp).<br>2. Thử sửa allocation. | - Nút "Chỉnh sửa" disabled/không có.<br>- Gọi API trực tiếp: 409 hoặc 422.<br>- Muốn sửa phải huỷ phiếu QT trước (theo EC-5). | READY | N/A |
| TC-W01-E2E-005 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph | VLD-INS-STL-001, E2E-DP03 | E2E | E2E | P1 | Tạo phiếu QT BH từ SO toàn KH → bị từ chối | Staging; SO `#SO-W01-KH-ONLY-001` toàn KH | 1. Mở SO chỉ có KH.<br>2. Bấm "Tạo phiếu quyết toán" (hoặc gọi mutation). | - Thông báo lỗi rõ ràng (không có dòng BH).<br>- Không tạo được phiếu QT BH. | READY | N/A |
| TC-W01-E2E-006 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | AC-13, E2E-CS04 | E2E | E2E | P2 | Save SO timeout → UI lỗi rõ ràng + nút retry, data không mất | Staging; server mock timeout 30s | 1. Nhập allocation → Lưu → server không phản hồi.<br>2. Quan sát UI. | - Thông báo "Không thể lưu, vui lòng thử lại".<br>- Có nút Retry.<br>- Data nhập không bị xoá. | READY | N/A |
| TC-W01-E2E-007 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | AC-13, E2E-CS03 | E2E | E2E | P2 | Save SO server trả 500 → UI lỗi thân thiện, data không mất | Staging; server mock 500 | 1. Nhập allocation → Lưu → server trả 500. | - Thông báo lỗi chung ("Đã có lỗi xảy ra").<br>- Không stack trace.<br>- Data nhập vẫn còn. | READY | N/A |
| TC-W01-E2E-008 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | AC-13, E2E-CR10 | E2E | E2E | P2 | Double-click nút "Lưu" → chỉ gửi 1 request | garage-web; SO Edit BH=Có; network monitor | 1. Nhập allocation.<br>2. Double-click nhanh "Lưu".<br>3. Kiểm tra network log. | - Chỉ 1 request `updateServiceOrderV3`.<br>- SO không save 2 lần (không duplicate). | READY | N/A |
| TC-W01-E2E-009 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | E2E-CS01 | E2E | E2E | P2 | Mất internet khi đang submit → báo mất kết nối, không mất data | Staging; garage-web | 1. Nhập allocation.<br>2. Ngắt mạng → Lưu. | - Thông báo "Mất kết nối".<br>- Data đã nhập không mất.<br>- Kết nối lại → retry submit thành công. | READY | N/A |
| TC-W01-E2E-010 | FEAT-INS-SO-ADJUSTMENT | garage-web, gf-sales | AC-1, AC-0 | E2E | E2E | P2 | Luồng Create → Edit: section chỉ hiện ở Edit không hiện ở Create | Staging; SO mới tạo loại "Dịch vụ xe" | 1. Tạo SO mới (Create) → kiểm tra không có section.<br>2. Lưu SO → mở lại ở Edit toggle BH=Có. | - Create: section "Phân bổ" KHÔNG hiển thị.<br>- Edit BH=Có: section xuất hiện cho nhập. | READY | N/A |
| TC-W01-E2E-011 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | E2E-RG01, AC-13 | E2E | Regression | P1 | [Regression] SO thường (không BH) Edit → Lưu vẫn hoạt động như cũ | Staging; SO `#SO-W01-NORMAL-001` toggle BH=Không | 1. Mở SO thường ở Edit.<br>2. Sửa line item (không có section allocation).<br>3. Lưu → reload. | - Lưu thành công như trước thay đổi.<br>- Không xuất hiện section "Phân bổ" (BH=Không).<br>- Luồng cũ không vỡ. | READY | N/A |
| TC-W01-E2E-012 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | E2E-RG02 | E2E | Regression | P1 | [Regression] SO thường không bị validate/cản bởi logic allocation mới | Staging; SO thường BH=Không | 1. Mở SO thường → sửa → Lưu bình thường. | - Không yêu cầu nhập allocation BH.<br>- Không cảnh báo BH âm / field allocation. | READY | N/A |
| TC-W01-E2E-013 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | E2E-RG03, BR-INS-SO-ADJ-005 | E2E | Regression | P1 | [Regression] Công thức tổng tiền SO thường (Tổng thành tiền baseline) không đổi | Staging; SO thường có line item; baseline tổng tiền đã biết | 1. Mở SO thường → đọc "Tổng thành tiền".<br>2. So sánh với baseline trước khi thêm field allocation. | - Tổng thành tiền = baseline (logic tính cũ không bị ảnh hưởng bởi panel mới). | READY | N/A |
| TC-W01-E2E-014 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | E2E-RG04 | E2E | Regression | P2 | [Regression] Phân quyền/route SO cũ không bị nới/siết sau thêm section | Staging; role thợ + kế toán | 1. Đăng nhập từng role mở SO Edit thường + SO BH.<br>2. Kiểm tra quyền truy cập như trước. | - Quyền cũ giữ nguyên (kế toán/chủ garage sửa được, role thấp bị chặn) — không nới/siết ngoài ý muốn. | READY | N/A |
| TC-W01-E2E-015 | FEAT-INS-SO-ADJUSTMENT | gf-sales, garage-web | E2E-RG05 | E2E | Regression | P2 | [Regression] SO cũ tạo trước thay đổi (allocation NULL) mở/sửa không vỡ | Staging; SO cũ có BH=Có nhưng allocation NULL | 1. Mở SO cũ (trước deploy) ở Edit. | - Section render empty placeholder "Chưa có phân bổ".<br>- Không crash, không mất field cũ. | READY | N/A |
| TC-W01-E2E-016 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph, garage-web | AC-13, AC-15, BR-INS-SO-ADJ-005, E2E-DC01, E2E-DC04 | E2E | E2E | P1 | [Deep E2E] SO BH → nhập 5 khoản → panel Tổng giá DV → tạo cặp phiếu QT → chi tiết QT BH khớp số | Staging full stack; SO `#SO-W01-BH-001` DRAFT BH=Có Cộng sau VAT BH=207.9tr/KH=33tr | 1. Kế toán mở SO Edit, nhập 5 khoản (CK VT 5tr, CK CDV 2.5tr, Khấu hao 5%, Giảm trừ 200k, Khấu trừ 520k).<br>2. Xem panel "Tổng giá dịch vụ": BH=197.68tr / KH=35.72tr / Tổng=233.4tr.<br>3. Lưu SO + hoàn thành.<br>4. Bấm "Tạo phiếu quyết toán" → gf-accounting pull `for-settlement` → tạo cặp KH+BH atomic.<br>5. Mở chi tiết phiếu QT BH. | - Cặp phiếu QT KH+BH tạo atomic (liên kết relatedSettlementCode).<br>- **Tiền nhất quán**: panel SO = snapshot phiếu QT BH; Còn phải thu BH = 197.680.000đ.<br>- KH chịu từ điều chỉnh BH (35.72tr − 33tr = 2.72tr) cộng đúng vào phiếu QT KH.<br>- Tổng phân bổ = tổng tiền dòng, không lệch do làm tròn (E2E-DC04). | READY | N/A |
| TC-W01-E2E-017 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph, garage-web | AC-12, EC-2, E2E-DP02 | E2E | E2E | P1 | [Deep E2E] Nhánh rẽ: BH thanh toán âm → cảnh báo nhưng vẫn cho lưu + tạo phiếu QT | Staging; SO BH âm (khoản giảm > Cộng sau VAT BH) | 1. Nhập khoản điều chỉnh khiến BH thanh toán < 0.<br>2. Quan sát cảnh báo.<br>3. Vẫn nhấn Lưu.<br>4. Tạo phiếu QT BH. | - Cảnh báo "BH thanh toán không thể âm" hiển thị nhưng KHÔNG chặn (E2E-DP02).<br>- SO lưu với số âm (audit).<br>- Phiếu QT BH tạo được với số 0/âm phục vụ audit. | READY | N/A |
| TC-W01-E2E-018 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph | AC-15, E2E-DC05, EC-5 | E2E | E2E | P1 | [Deep E2E] Snapshot cứng: sửa SO sau tạo phiếu QT bị khoá → snapshot không drift | Staging; SO đã tạo phiếu QT BH | 1. Sau khi tạo phiếu QT BH, cố mở SO sửa allocation.<br>2. Kiểm tra phiếu QT BH detail. | - SO khoá hoàn toàn (EC-5), không sửa được → snapshot không lệch.<br>- Phiếu QT BH giữ snapshot cứng tại thời điểm tạo (không re-snapshot).<br>- Muốn sửa: huỷ phiếu QT (cascade cặp KH) → reopen SO → tạo lại. | READY | N/A |
| TC-W01-E2E-019 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph | E2E-TS04, ADR-014 | E2E | E2E | P2 | [Deep E2E] Side-effect: tạo phiếu QT sinh đúng cặp 1 lần, rollback khi settle fail | Staging; SO BH=Có hợp lệ; mock settle callback fail | 1. Tạo phiếu QT BH với settle callback fail.<br>2. Kiểm tra trạng thái. | - Rollback toàn bộ (không phiếu QT dở dang) khi settle fail (ADR-014, synchronous).<br>- Khi thành công: đúng 1 cặp KH+BH, không nhân đôi. | READY | N/A |
| TC-W01-E2E-021 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph, garage-web | E2E-DP01, AC-16 | E2E | E2E | P2 | [Deep E2E] Multi-actor: kế toán nhập phân bổ → chủ garage review/tạo phiếu QT | Staging; SO BH=Có; 2 tài khoản kế toán + chủ garage cùng garage-a | 1. Kế toán nhập 5 khoản + Lưu.<br>2. Chủ garage mở SO review → xác nhận số liệu.<br>3. Chủ garage tạo phiếu QT BH. | - Cả 2 vai trò thao tác được (AC-16).<br>- Bàn giao trạng thái đúng: số liệu kế toán nhập = số chủ garage thấy = snapshot phiếu QT. | READY | N/A |
| TC-W01-E2E-022 | FEAT-INS-SO-ADJUSTMENT | gf-sales, gf-accounting, agg-garage-graph, garage-web | AC-1, VLD-INS-STL-001, ADR-014, BR-INS-SO-ADJ-001 | E2E | E2E | P1 | [Discard] Nhập allocation BH → Lưu → toggle BH=Không → Lưu → tạo phiếu QT BH bị từ chối, snapshot không leak | Staging full stack; SO `#SO-W01-BH-001` đã nhập + lưu allocation (chưa tạo phiếu QT) | 1. Kế toán nhập 5 khoản + Lưu (SO có allocation).<br>2. Toggle BH=Không → Lưu.<br>3. Thử "Tạo phiếu quyết toán BH".<br>4. (Hoặc) gf-accounting pull `for-settlement` cho SO này. | - Toggle off lưu thành công, SO chuyển KH-only.<br>- "Tạo phiếu QT BH" bị từ chối như SO toàn KH (VLD-INS-STL-001).<br>- `for-settlement` KHÔNG trả allocation cũ (không mồ côi) → gf-accounting không tạo phiếu BH nhầm. | READY | N/A |
| TC-W01-E2E-024 | FEAT-INS-STL-DETAIL | gf-sales, gf-accounting, agg-garage-graph, garage-web | AC-15 (cross), AC-4..6 | E2E | E2E | P1 | Kế toán tạo phiếu QT BH → xem chi tiết → snapshot đúng | Staging; SO `#SO-W01-BH-001` đã lưu allocation; login kế toán | 1. Kế toán nhấn "Tạo phiếu quyết toán" từ SO.<br>2. Mở phiếu QT BH vừa tạo.<br>3. Kiểm tra header, tab Chi phí, panel Tổng giá DV. | - Phiếu QT BH tạo thành công, SO "Đã QT".<br>- Panel: BH=197.680.000đ, KH=35.720.000đ, Tổng=233.400.000đ.<br>- Nút "Tạo hồ sơ BH" disabled tooltip W02. | READY | N/A |
| TC-W01-E2E-026 | FEAT-INS-STL-DETAIL | gf-accounting, gf-sales, garage-web | ADR-014, E2E-CS03 | E2E | E2E | P1 | Tạo phiếu QT BH — settle callback fail → UI báo lỗi, SO không khoá | Staging; gf-sales mock 500 cho settle | 1. Kế toán nhấn "Tạo phiếu quyết toán".<br>2. Server fail ở bước settle. | - UI hiển thị thông báo lỗi rõ ràng.<br>- SO vẫn DRAFT (không bị khoá).<br>- Không có phiếu QT dở dang (rollback sạch). | READY | N/A |
| TC-W01-E2E-027 | FEAT-INS-STL-DETAIL | gf-accounting, garage-web | AC-11, BR-INS-STL-DET-003, E2E-TS05 | E2E | E2E | P1 | Kế toán huỷ phiếu QT BH → phiếu KH cũng huỷ → SO mở lại | Staging; phiếu QT BH + KH DRAFT, chưa payment | 1. Kế toán huỷ phiếu QT BH trên UI.<br>2. Kiểm tra phiếu KH và SO. | - Cả 2 phiếu QT (BH + KH) = CANCEL.<br>- SO = DRAFT (mở lại). | READY | N/A |
| TC-W01-E2E-028 | FEAT-INS-STL-DETAIL | gf-accounting, garage-web | §4 API, E2E-CS04 | E2E | E2E | P2 | Mở phiếu QT BH — server timeout load → thông báo lỗi + Retry | Staging; server mock timeout | 1. Mở trang chi tiết khi server không phản hồi. | - Sau timeout, UI hiển thị thông báo lỗi.<br>- Có nút Retry.<br>- Không crash, không loading vô tận. | READY | N/A |
| TC-W01-E2E-029 | FEAT-INS-STL-DETAIL | gf-accounting, garage-web | §4 API, E2E-CS03 | E2E | E2E | P2 | Server 500 khi tạo phiếu QT BH → UI lỗi thân thiện, retry được | Staging; gf-accounting mock 500 cho create | 1. Kế toán nhấn "Tạo phiếu quyết toán" → server trả 500. | - UI hiển thị "Đã có lỗi xảy ra".<br>- Không hiển thị stack trace.<br>- Kế toán có thể thử lại. | READY | N/A |
| TC-W01-E2E-030 | FEAT-INS-STL-DETAIL | gf-accounting, garage-web | E2E-RG01 | E2E | Regression | P1 | [Regression] Xem chi tiết phiếu KH baseline (production) vẫn đúng | Staging; phiếu KH baseline `#SET-OLD-KH` (không cặp BH) | 1. Mở chi tiết phiếu KH baseline qua UI mới.<br>2. Kiểm tra layout + số liệu. | - Phiếu KH render đúng (layout mới, không panel BH).<br>- Số liệu công nợ KH baseline không đổi so với trước wave. | READY | N/A |
| TC-W01-E2E-031 | FEAT-INS-STL-DETAIL | gf-sales, gf-accounting, garage-web | E2E-RG02 | E2E | Regression | P1 | [Regression] Tạo phiếu QT cho SO không-BH (toàn KH) vẫn theo luồng baseline | Staging; SO `#SO-W01-KH-ONLY-001` (toàn KH, không bật BH) | 1. Tạo phiếu QT từ SO toàn KH.<br>2. Mở chi tiết. | - Chỉ tạo phiếu QT KH (không sinh cặp BH).<br>- Field/logic BH mới KHÔNG ảnh hưởng luồng KH.<br>- Tổng tiền KH đúng baseline. | READY | N/A |
| TC-W01-E2E-032 | FEAT-INS-STL-DETAIL | gf-accounting, garage-web | E2E-RG05 | E2E | Regression | P2 | [Regression] Phiếu QT tạo trước wave: mở/xem vẫn tương thích | Staging; phiếu QT cũ tạo trước thay đổi schema | 1. Mở phiếu QT cũ (tạo trước khi thêm field BH).<br>2. Kiểm tra render. | - Phiếu cũ mở được, không vỡ, không mất field.<br>- Field BH mới hiển thị trống/ẩn đúng, không lỗi. | READY | N/A |
| TC-W01-E2E-033 | FEAT-INS-STL-DETAIL | gf-sales, gf-accounting, agg-garage-graph, garage-web | E2E-BW03, E2E-DC01, E2E-DC04 | E2E | E2E | P1 | [Deep E2E] SO BH nhập điều chỉnh → tạo phiếu QT BH → 4 tab → đối soát SO = phiếu QT | Staging; SO mới loại "Dịch vụ xe" có dòng BH+KH; login kế toán | 1. Mở SO ở Edit, bật "Bảo hiểm = Có", nhập 5 khoản điều chỉnh (CK VT, CK CDV, khấu hao, giảm trừ, khấu trừ).<br>2. Xác nhận realtime preview BH/KH/Tổng.<br>3. Tạo cặp phiếu QT.<br>4. Mở phiếu QT BH → xem 4 tab.<br>5. Đối soát số tiền: panel SO vs panel phiếu QT vs phiếu KH liên kết. | - Preview SO = panel phiếu QT BH: BH=197.680.000, KH=35.720.000, Tổng=233.400.000.<br>- Bảng chi phí phiếu QT chỉ hạng mục BH.<br>- Cộng sau VAT BH+KH = tổng dòng (E2E-DC04 không lệch làm tròn).<br>- Phần KH chịu từ điều chỉnh BH = đúng trên phiếu QT KH (E2E-DC01 khớp tuyệt đối). | READY | N/A |
| TC-W01-E2E-034 | FEAT-INS-STL-DETAIL | gf-sales, gf-accounting, garage-web | E2E-DP02, EC-2 | E2E | E2E | P2 | [Deep E2E][Nhánh rẽ] BH thanh toán âm vẫn cho lưu → tạo phiếu QT đi tiếp | Staging; SO `#SO-W01-BH-NEG` (điều chỉnh khiến BH < 0) | 1. Ở SO Edit nhập điều chỉnh khiến "BH thanh toán" < 0.<br>2. Quan sát cảnh báo + lưu SO.<br>3. Tạo phiếu QT BH → xem panel. | - Dòng "BH thanh toán" highlight đỏ + cảnh báo nhưng **vẫn cho lưu** (không block, chốt PO).<br>- Phiếu QT BH tạo được; panel phản ánh giá trị âm nhất quán với SO. | READY | N/A |
| TC-W01-E2E-035 | FEAT-INS-STL-DETAIL | gf-sales, gf-accounting, garage-web | E2E-DP03, VLD-INS-STL-001 | E2E | E2E | P2 | [Deep E2E][Nhánh rẽ] Tạo phiếu QT BH khi SO toàn KH (thiếu điều kiện) → bị chặn đúng bước | Staging; SO `#SO-W01-KH-ONLY-001` (không dòng BH/không chọn DN BH) | 1. Từ SO toàn KH, cố tạo phiếu QT BH.<br>2. Quan sát message. | - Bị chặn đúng bước tạo phiếu QT BH.<br>- Message rõ "Vui lòng nhập thông tin công ty bảo hiểm trên Phiếu dịch vụ".<br>- Không sinh phiếu QT BH. | READY | N/A |
| TC-W01-E2E-036 | FEAT-INS-STL-DETAIL | gf-sales, gf-accounting, garage-web | E2E-DP01, E2E-DP04 | E2E | E2E | P2 | [Deep E2E][Multi-actor] Kế toán tạo cặp QT → huỷ để sửa SO → chủ garage tạo lại → số liệu cập nhật đúng | Staging; SO `#SO-W01-BH-001`; tài khoản kế toán + chủ garage | 1. Kế toán tạo cặp phiếu QT từ SO.<br>2. Huỷ phiếu QT BH (cascade KH) → SO reopen.<br>3. Kế toán sửa allocation trên SO (đổi 1 khoản điều chỉnh).<br>4. Chủ garage tạo lại cặp phiếu QT → mở phiếu QT BH. | - Sau huỷ: cặp CANCEL, SO mở lại sửa được.<br>- Phiếu QT BH tạo lại = snapshot mới, số liệu phản ánh allocation đã sửa (không giữ số cũ — E2E-DP04).<br>- Mỗi actor thực hiện đúng phần việc theo quyền. | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| 2026-06-11 | Created by consolidating `TC-INS-SO-ADJUSTMENT-W01-E2E-06062026-manual.md` (23 TC) + `TC-INS-STL-DETAIL-W01-E2E-06062026-manual.md` (13 TC) into single E2E artifact theo `TC-TEMPLATE.md` v8. Renumbered tuần tự `TC-W01-E2E-001..036`: SO-ADJ giữ thứ tự gốc (001..023), STL chuyển sang (024..036) — Core 024..029, Regression 030..032, Deep E2E 033..036. Frontmatter `document_id`=`GMS-TC-W01-E2E`, boundary gộp full stack `gf-sales, gf-accounting, agg-garage-graph, garage-web, garage-mobile`, features `FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL`. Giữ đủ §1-§5 theo template. Nội dung TC giữ nguyên (steps, expected, AC ref, priority, status). | QA Authority |
| 2026-06-11 | **Split 4 TC sang 2 file theo type** (36→32 TC còn lại) — extract: (a) TC-W01-E2E-002, 023, 025 → `TC-W01-MOBILE-E2E.md` (3 TC cross-platform sync Web↔Mobile); (b) TC-W01-E2E-020 → `TC-W01-ISOLATION.md` (1 TC Suite=Isolation deep-link). TC ID + nội dung row của TC giữ lại giữ nguyên byte-for-byte; chỉ remove rows + update §3 count. | QA Authority |
