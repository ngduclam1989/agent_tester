---
type: epic
artifact_kind: epic
status: PLANNED
version: 15
tier: T2
owner_authority: Business Authority
boundary: "gf-system"
last_reviewed: "2026-08-10"
supersedes: null
---

# EP-PARTNER-LINK: Liên kết đối tác ngoài (giai đoạn 1: Driver Plus)

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-PARTNER-LINK` |
| Title | Liên kết đối tác ngoài (giai đoạn 1: Driver Plus) |
| Status | PLANNED |
| Priority | **P1** — xác nhận Delivery Authority 2026-07-28 (ngang các epic khác) |
| Target wave | **Wave 7 (W07)** — xác nhận Delivery Authority 2026-07-28 |
| Boundary | `gf-system` |

## 1. Outcome / Hypothesis

Nếu garage có thể nhận và xử lý yêu cầu liên kết từ đối tác ngoài (giai đoạn 1: app tài xế Driver Plus) — bao gồm duyệt / từ chối / hủy liên kết và đồng bộ real-time thông tin hồ sơ garage sang đối tác — thì garage sẽ chủ động kiểm soát danh tính tài khoản đối tác được phép nhận dữ liệu doanh nghiệp, mở kênh nguồn khách từ Driver Plus và giữ minh bạch dữ liệu chia sẻ cho các cuộc audit sau này.

Đặt tên epic theo domain "liên kết đối tác" (chứ không theo tên "Driver Plus" cụ thể) vì UI đã chừa sẵn tab **"Đối tác khác"** cho các đối tác tương lai. Tab đó **OUT OF SCOPE** lần này, không đặc tả AC.

> **Naming 3 tầng có chủ đích** (BA review F4, 2026-07-28 — giữ nguyên, không rename): Epic generic (`EP-PARTNER-LINK`) vs Feature + Business Rules gắn đối tác cụ thể (`FEAT-SYS-DRIVERPLUS-LINK`, `BR-DPL-*`) vì giai đoạn 1 hard-code 1 đối tác duy nhất. Chi tiết: `Product/features/FEAT-SYS-DRIVERPLUS-LINK.md` header.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Người chịu trách nhiệm chính quyết định chia sẻ dữ liệu doanh nghiệp ra ngoài. Duyệt / hủy liên kết là hành động có tác động pháp lý → thường do chủ garage trực tiếp thao tác. |
| Kế toán | PRIMARY | Quyền ngang chủ garage trên toàn bộ tính năng (Duyệt / Từ chối / Đồng bộ lại / Hủy). Thao tác thay khi chủ garage vắng mặt. |

**Không tạo actor mới** — tuân thủ Critical Rule #6 (Dual persona only).

## 3. Vòng đời trạng thái yêu cầu liên kết

Mỗi yêu cầu liên kết có mã `LKD-YYYY-NNN` (VD `LKD-2026-001`) do **Driver Plus tự sinh và gửi sang GMS**. Garage KHÔNG tự tạo được yêu cầu — chỉ nhận và xử lý.

```
                ┌─────────────────────────────────────┐
                │   NGUỒN TẠO                         │
                │   ─────────                         │
                │   Driver Plus app (external)        │
                │   push request → GMS gf-system      │
                └──────────────┬──────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │  Chờ liên kết      │◄──── (mặc định khi
                    │  (badge cam)       │       yêu cầu mới đến)
                    └──┬──────┬──────────┘
                       │      │
             Duyệt     │      │  Từ chối (kèm lý do)
                       │      │
                       ▼      ▼
              ┌───────────┐  ┌──────────┐
              │ Đã liên   │  │ Từ chối  │
              │ kết       │  │ (đỏ)     │
              │ (xanh lá) │  │ terminal │
              └──┬────────┘  └──────────┘
                 │
                 │  Hủy liên kết (kèm lý do)
                 ▼
              ┌───────────────┐
              │ Đã hủy liên   │
              │ kết (đỏ đậm)  │
              │ terminal      │
              └───────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │  RULE SINGLE-ACTIVE-LINK (system-generated cascade):    │
  │                                                         │
  │  Khi 1 yêu cầu "Chờ liên kết" được Duyệt                │
  │  ──► TẤT CẢ các yêu cầu "Chờ liên kết" khác của cùng    │
  │      garage tự động chuyển sang "Từ chối"               │
  │      (lý do: system-generated, không cần user nhập)     │
  │                                                         │
  │  ──► Mỗi thời điểm chỉ có tối đa 1 yêu cầu ở trạng thái │
  │      "Đã liên kết" trên 1 garage.                        │
  └─────────────────────────────────────────────────────────┘

  RE-REQUEST: yêu cầu ở trạng thái "Từ chối" hoặc "Đã hủy liên kết"
  cho phép Driver Plus gửi lại yêu cầu mới (tạo record LKD-xxx mới),
  NẾU garage hiện KHÔNG có tài khoản D+ khác "Đã liên kết"
  (vẫn qua single-active guard như mọi request — không phải ngoại lệ).
  Record cũ giữ nguyên trong lịch sử — không sửa, không xóa.
```

**Ghi chú**:
- **Chờ liên kết** là trạng thái duy nhất có 2 nút thao tác (**Duyệt** + **Từ chối**).
- **Đã liên kết** có 2 nút (**Đồng bộ lại thông tin sang D+** + **Hủy liên kết**). Đồng bộ lại KHÔNG đổi trạng thái, chỉ gửi lại data.
- **Từ chối** và **Đã hủy liên kết** là terminal state — không có nút thao tác nào.
- Song song nhiều "Chờ liên kết" cùng lúc trên 1 garage là hợp lệ (Driver Plus có thể có nhiều tài khoản test cùng gửi request). Chỉ khi Duyệt mới enforce rule single-active-link.
- **Single-active guard — chặn gửi trùng** (v6, chốt 2026-07-29 — BR-DPL-CMN-007 + CB-SYS-004): khi garage đã có 1 tài khoản D+ "Đã liên kết", Driver Plus **KHÔNG gửi được** yêu cầu liên kết mới — GMS chặn tại adapter gate + trả lỗi về D+. Do đó không bao giờ có "Chờ liên kết" đồng thời với "Đã liên kết". Muốn đổi tài khoản D+ → Hủy liên kết hiện tại trước → garage trở về trạng thái trống → D+ mới gửi lại được. (Thay thế phương án "no-warning" từng cân nhắc trước đó.)
- **Hủy 2 chiều** (v5, chốt 2026-07-29): ngoài case garage tự hủy (Đã liên kết → Đã hủy, user GMS), còn có 2 case inbound từ D+: (a) D+ withdraw pending (Chờ liên kết → Đã hủy — đã có từ v3 BR/FEAT), (b) D+ unlink linked (Đã liên kết → Đã hủy — v5 mới). Cả 2 case inbound: Người thực hiện = "Driver Plus" (thống nhất 1 nhãn cho mọi hành động đến từ Driver Plus, phân biệt với case garage tự hủy hiển thị tên nhân viên + role), UI cập nhật ngầm không toast.
- **Notification outbound** (chốt nghiệp vụ 2026-07-29, kỹ thuật theo ADR-029): khi state đổi do action từ GMS (Duyệt / Từ chối user / Auto-reject cascade / Hủy), `gf-system` gửi trực tiếp Kafka event `PARTNER_LINK.STATUS.CHANGED` sang D+ cho tài khoản liên quan; field `notification.message` chứa wording chính thức đã chốt (xem FEAT AC-36..39 + BR-DPL-NOTI-001..004). Không qua `gf-notification`, không dùng REST/email/SMS do GMS điều phối. Case ngược (D+ inbound withdraw/unlink) KHÔNG gửi noti ngược.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-SYS-DRIVERPLUS-LINK` | Quản lý yêu cầu liên kết Driver Plus (list + xem chi tiết + 4 action: Duyệt / Từ chối / Đồng bộ lại / Hủy) | [FEAT-SYS-DRIVERPLUS-LINK](../features/FEAT-SYS-DRIVERPLUS-LINK.md) | P1 |

**Ghi chú**: 1 feature duy nhất bao trọn vòng đời record LKD-xxx vì list + xem chi tiết + 4 action đều thuộc 1 lifecycle, không đủ khối lượng tách feature nhỏ hơn. Tab "Đối tác khác" trong menu "Liên kết" là placeholder — KHÔNG có FEAT tương ứng đợt này.

**Platform (v9, 2026-07-30)**: feature ship đồng thời **Web GMS** (top-nav menu "Liên kết") và **Mobile app `garage-mobile`** (bottom-nav tab "Liên kết") — cùng 1 FEAT, cùng 1 nghiệp vụ/lifecycle, chỉ khác giao diện/điều hướng theo platform (chi tiết: `FEAT-SYS-DRIVERPLUS-LINK.md` Nhóm N).

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-FOUND` | Upstream | Hồ sơ doanh nghiệp / chi nhánh (Tên doanh nghiệp, SĐT liên hệ, địa chỉ) — đọc real-time khi hiển thị block "Thông tin đồng bộ sang Driver Plus" và khi bấm "Đồng bộ lại". |
| `EP-BOOKING` | Downstream | Post-liên kết, dữ liệu D+ được EP-BOOKING dùng để nhận dạng nguồn Driver Plus khi có booking gửi sang. Năng lực nhận booking D+ đã có ở baseline production — KHÔNG dev thêm trong scope epic này. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-system` | Boundary chính: sở hữu hồ sơ garage (doanh nghiệp, chi nhánh, xuất hóa đơn) — khớp `Execution/SERVICE-BOUNDARY-MATRIX.md`. Domain "yêu cầu liên kết đối tác" là mở rộng tự nhiên trên boundary này. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL query/mutation liên quan menu "Liên kết" từ frontend sang gf-system — dùng chung cho cả Web GMS và Mobile app (cùng 1 BFF, không có BFF riêng cho mobile). |
| `garage-web` | Frontend Web GMS — render menu "Liên kết" trên top-navigation (xem FEAT Nhóm A→M). |
| `garage-mobile` (v9, BA-review F8 2026-07-30) | Frontend Mobile app (Flutter) — render tab "Liên kết" trên bottom-navigation, layout card + màn Bộ lọc/chi tiết full-screen riêng khác Web (xem FEAT Nhóm N). Cùng gọi qua `agg-garage-graph`, không có API riêng cho mobile. |
| Driver Plus (external) | Nguồn phát sinh request LKD-xxx. Giao thức hai chiều dùng Kafka `AC-DEV-PARTNER-LINK-EVENTS`, `MessageGroup=PARTNER_LINK`; inbound theo các step tạo/withdraw/unlink, outbound theo các step response/profile-sync/status-changed. |
| PC-4 (Driver+ integration) | PRD constraint hiện hành: dữ liệu từ Driver+ phải qua adapter validation gate, không write thẳng vào domain table (BR-CORE-012). Áp dụng cho request LKD. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ yêu cầu "Chờ liên kết" được xử lý trong 24h | >= 80% | Số LKD chuyển sang Đã liên kết / Từ chối trong 24h kể từ khi D+ push / tổng LKD phát sinh trong kỳ |
| Tỷ lệ garage có ít nhất 1 tài khoản D+ ở trạng thái "Đã liên kết" | Baseline & tăng dần theo tháng | Số garage có ≥1 LKD Đã liên kết / tổng garage active |
| Tỷ lệ yêu cầu bị Từ chối có nhập lý do (không rỗng) | >= 95% | Số LKD Từ chối có lý do / tổng Từ chối (đo consistency thao tác — v13, BA-review round 2 N8: bỏ ngưỡng "≥10 ký tự" vì BR-DPL-REJ-002 chỉ chặn khi rỗng, không enforce độ dài tối thiểu, nên metric cũ không đo được) |

## 7. Out of Scope (giai đoạn 1)

- **Tab "Đối tác khác"** trong menu "Liên kết" — placeholder cho tương lai, không đặc tả AC lần này.
- **Notification real-time / badge đỏ** đếm yêu cầu mới trên menu (web) / tab (mobile) — BA/PO đã chốt bỏ khỏi giai đoạn 1, áp dụng cả 2 platform (v10, BA-review P2 làm rõ).
- **Ô tìm kiếm** và **phân trang** trên danh sách yêu cầu — BA/PO đã chốt bỏ (danh sách thường ngắn).
- **Garage tự tạo yêu cầu liên kết Driver Plus từ Web GMS** — chỉ D+ tạo và push sang.
- **Cấu hình / master data đối tác** (thêm mới đối tác, quản lý danh sách đối tác) — giai đoạn 1 hard-code 1 đối tác "Driver Plus".
- **API 2 chiều realtime với Driver Plus cho luồng đặt lịch** — đã có ở EP-BOOKING baseline production, không thuộc epic này.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-24 | 1 | Business Authority + Senior PM (main agent, spawn qua ba-author) | Khởi tạo EP-PARTNER-LINK từ BA/PO decision set 2026-07-24: menu "Liên kết" 2 tab (Driver Plus in-scope, Đối tác khác placeholder OOS), 4 trạng thái yêu cầu, 4 action với modal xác nhận riêng, rule single-active-link (Duyệt → auto-reject Chờ khác), cho phép re-request sau Từ chối/Hủy, dual persona ngang quyền. 1 feature `FEAT-SYS-DRIVERPLUS-LINK` bao trọn lifecycle. Boundary `gf-system` (khớp Execution/SERVICE-BOUNDARY-MATRIX ownership hồ sơ garage). NEED CONFIRMATION: field "Thông tin xuất hóa đơn" (screenshot bị cắt) + wording đầy đủ "Điều khoản chia sẻ thông tin" (pháp lý). Architecture decision (Architect quyết): giao thức inbound/outbound sync với D+ + retention audit log. |
| 2026-07-28 | 2 | user (Business Authority) qua main agent, fix theo `Product/reviews/BA-REVIEW-EP-PARTNER-LINK-2026-07-28.md` | **Fix F3**: chốt visual source mode = `design` (chưa có Figma cho feature này) — đồng bộ `DESIGN-SOURCE-POLICY.md` v8. **Fix F4**: thêm note "Naming 3 tầng có chủ đích" (§1) — giữ nguyên `EP-PARTNER-LINK` (generic) / `FEAT-SYS-DRIVERPLUS-LINK` + `BR-DPL-*` (gắn đối tác cụ thể), không rename. **Còn mở**: Priority + Target wave (F5) vẫn NEED CONFIRMATION Delivery Authority — chưa có dữ liệu để chốt. |
| 2026-07-28 | 3 | user (Delivery Authority) qua main agent | **Fix F5 (một phần)**: chốt **Target wave = Wave 7 (W07)**, bỏ marker NEED CONFIRMATION. **Priority vẫn đang chờ user xác nhận** (giữ P1 đề xuất hay hạ P2) — chưa bump khỏi NEED CONFIRMATION. |
| 2026-07-28 | 4 | user (Delivery Authority) qua main agent | **Fix F5 (hoàn tất)**: chốt **Priority = P1** ("ưu tiên ngang các epic khác") — bỏ marker NEED CONFIRMATION cuối cùng. EP-PARTNER-LINK nay đủ Priority (P1) + Target wave (W07), không còn T0/T1 marker unresolved. |
| 2026-07-29 | 5 | user (Business Authority) qua main agent | **Cập nhật 3 quyết định GMS ↔ D+ 2026-07-29** — cập nhật §3 ghi chú vòng đời state: (a) resolve NEED CONFIRMATION #3 (no-warning UI) — thêm ghi chú BR-DPL-CMN-007 rõ ràng: KHÔNG hiển cảnh báo khi có "Chờ liên kết" mới lúc đang có 1 "Đã liên kết"; user muốn đổi tài khoản D+ phải Hủy cũ + Duyệt mới (2 thao tác). (b) SCOPE EXPANSION — **Hủy 2 chiều**: ngoài garage tự hủy, thêm case inbound D+ unlink Đã liên kết (BR-DPL-CAN-005 + CB-SYS-008) song song với D+ withdraw pending đã có (BR-DPL-CAN-004 + CB-SYS-007); Người thực hiện phân biệt "Driver Plus (hệ thống)" (inbound) vs nhân viên GMS kèm role (garage tự hủy). (c) SCOPE EXPANSION — **Notification outbound sang D+ 4 loại** (Duyệt / Từ chối / Auto-reject / Hủy) khi state đổi do action từ GMS; wording chính thức + confirm có/không gửi cho auto-reject NEED CONFIRMATION Business Authority; kênh Architect quyết. Đồng bộ FEAT v7 (AC-34 + AC-35 + AC-36..AC-39 + BR cite mới), BR-GF-SYSTEM v6 (§1 CB-SYS-008 + CB-SYS-009, §2.5.1 BR-DPL-CMN-007, §2.5.6 BR-DPL-CAN-005, §2.5.7 mới BR-DPL-NOTI-001..004, §3.2 diagram + row transition), UX-FLOW v3 (bước ⑤ no-warning + bước ⑥ hủy 2 chiều + bước ⑦ noti outbound), PRD v20 (§EP-PARTNER-LINK resolve Open Q1 + Q3, thêm 3 NEED CONFIRMATION mới), README v17 + BUSINESS-RULES v9 + DESIGN-SOURCE-POLICY v9. Note field xuất HĐ (Open Q1) chỉ ảnh hưởng FEAT-AC + BR, không ảnh hưởng structure EP nên không update body ở đây. |
| 2026-07-29 | 6 | user (Business Authority) qua main agent | **Đảo hướng single-active guard (thay thế no-warning)**: §3 ghi chú vòng đời sửa lại — khi garage đã có 1 tài khoản D+ "Đã liên kết", Driver Plus **KHÔNG gửi được** yêu cầu mới (GMS chặn tại adapter gate + trả lỗi), thay cho phương án "no-warning cho song song" ở v5. Muốn đổi tài khoản → Hủy liên kết hiện tại trước. Đồng bộ BR-GF-SYSTEM v7 (CB-SYS-004 clause chặn + BR-DPL-CMN-007 viết lại + CMN-002 bổ sung) + FEAT v8 (AC-34 viết lại, Nhóm K đổi tên) + UX-FLOW (bước ⑤ + state-machine). Resolve BA-review 2026-07-29 NF1 (invariant gap). |
| 2026-07-29 | 7 | user (Business Authority) qua main agent | **Thống nhất nhãn "Người thực hiện" D+ inbound (BA-review NF4)**: §3 ghi chú "Hủy 2 chiều" — đổi "Driver Plus" / "Driver Plus (hệ thống)" → **chỉ "Driver Plus"** (1 nhãn duy nhất cho cả 2 case inbound; vẫn phân biệt với case garage tự hủy hiển thị nhân viên + role). Đồng bộ BR-GF-SYSTEM v9 + FEAT v11 + UX-FLOW v6. | user (Business Authority) qua main agent |
| 2026-07-29 | 8 | user (Business Authority) qua main agent | **Fix G1 (BA-review 2026-07-30 — stale marker)**: §3 ghi chú "Notification outbound" — bỏ mệnh đề "Wording chính thức chờ Business Authority chốt" (mâu thuẫn với AC-36..39 + BR-DPL-NOTI-001..004 đã chốt), thay bằng "Wording chính thức đã chốt (xem FEAT); kênh + giao thức — Architecture (CB-SYS-009)". Đồng bộ FEAT v13. | user (Business Authority) qua main agent |
| 2026-07-30 | 9 | user (Business Authority) qua main agent | **SCOPE EXPANSION — Mobile app vào scope W07**: user xác nhận feature ship đồng thời Web GMS + Mobile app (`garage-mobile`), cùng 1 FEAT — thêm note "Platform" ở §4 Features. Nghiệp vụ/lifecycle (§3) giữ nguyên, không đổi cho cả 2 platform — chỉ khác giao diện/điều hướng (chi tiết đặc tả tại `FEAT-SYS-DRIVERPLUS-LINK.md` Nhóm N mới). Đồng bộ FEAT v14, BR-GF-SYSTEM v10, UX-FLOW v7, README v18, BUSINESS-RULES v10, DESIGN-SOURCE-POLICY v10, PRD v21. |
| 2026-07-30 | 10 | user (Business Authority) qua main agent | **Fix P1 F8 (BA-review 2026-07-30)**: §5.2 Architecture Dependencies chưa liệt kê boundary `garage-mobile` dù mobile đã vào scope ở v9 — chỉ có `gf-system` + `agg-garage-graph` + Driver Plus + PC-4. Thêm row `garage-web` (tách rõ khỏi `agg-garage-graph`) + `garage-mobile` (Flutter, cùng gọi qua `agg-garage-graph`, không có BFF/API riêng). Không phát sinh dependency mới ở tầng backend — chỉ bổ sung 2 client boundary cho đầy đủ bức tranh delivery W07. |
| 2026-07-30 | 11 | user (Business Authority) qua main agent | **Fix P2 batch (BA-review 2026-07-30)**: §7 Out of Scope "badge đỏ đếm yêu cầu mới trên menu top-nav" → tổng quát hoá "menu (web) / tab (mobile)" cho khớp cả 2 platform (đồng bộ FEAT v21 AC-40 + §7). Thuần editorial. |
| 2026-07-30 | 12 | user (Business Authority) qua main agent | **Fix P1 N1 (BA-review round 2, 2026-07-30)**: §3 khối RE-REQUEST mô tả D+ luôn gửi lại được yêu cầu sau Từ chối/Hủy — mâu thuẫn với rule single-active guard ngay phía trên trong cùng §3. Thêm điều kiện: chỉ cho phép nếu garage hiện KHÔNG có tài khoản D+ khác "Đã liên kết". Đồng bộ FEAT v22 (AC-25), BR-GF-SYSTEM v15 (CMN-003), PRD v23 (item 8), UX-FLOW v12. |
| 2026-07-30 | 13 | user (Business Authority) qua main agent | **Fix P2 N8 (BA-review round 2, 2026-07-30)**: §6 Success Metric đo "lý do Từ chối ≥ 10 ký tự ≥ 95%" nhưng BR-DPL-REJ-002 chỉ chặn rỗng, không enforce độ dài — metric không đo được đúng thực tế. User chốt **giữ nguyên hành vi** (không thêm min-length), sửa metric thành "có nhập lý do (không rỗng)". Đồng bộ BR-GF-SYSTEM v18 (BR-DPL-REJ-002/CAN-002). |
| 2026-08-10 | 14 | Business Authority qua main agent | **Chốt Kafka theo ADR-029**: dependency Driver Plus xác định giao thức, topic/message group và các nhóm message step; gỡ marker Architecture về REST/webhook/Kafka. |
| 2026-08-10 | 15 | Business Authority qua main agent | **Dọn stale notification marker**: §3 xác nhận `gf-system` gửi notification trực tiếp qua Kafka `PARTNER_LINK.STATUS.CHANGED` với `notification.message`; không qua `gf-notification`, REST, email hoặc SMS do GMS điều phối. |
