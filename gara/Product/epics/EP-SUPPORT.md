---
type: epic
artifact_kind: epic
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
boundary: "agg-garage-graph"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-SUPPORT: Hỗ trợ & phản hồi

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-SUPPORT` |
| Title | Hỗ trợ & phản hồi |
| Status | PLANNED |
| Priority | P2 |
| Target wave | Wave 2 |

## 1. Outcome / Hypothesis

Nếu garage có thể trao đổi nhanh với đội hỗ trợ qua chat, tạo nhóm chat theo xe để phối hợp nội bộ, và gửi phản hồi về hệ thống — thì garage sẽ được hỗ trợ kịp thời khi gặp vấn đề, nâng cao trải nghiệm sử dụng và đóng góp ý kiến cải thiện sản phẩm.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Sử dụng chat hỗ trợ, chat theo xe và gửi phản hồi |
| Kế toán | SECONDARY | Sử dụng chat hỗ trợ và gửi phản hồi — **không có quyền** vào nhóm chat theo xe |

## 3. Vòng đời trạng thái

Epic này không có vòng đời trạng thái riêng. Chat và phản hồi là các tương tác đơn lẻ — không có entity với trạng thái chuyển đổi.

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-SUP-CHAT` | Chat hỗ trợ & chat theo xe | [FEAT-SUP-CHAT](../features/FEAT-SUP-CHAT.md) | P2 |
| `FEAT-SUP-FEEDBACK` | Gửi phản hồi | [FEAT-SUP-FEEDBACK](../features/FEAT-SUP-FEEDBACK.md) | P2 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-VEHICLE` | Upstream | Nhóm chat theo xe tham chiếu thông tin xe (biển số, hãng, dòng) từ dữ liệu khách hàng. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `agg-garage-graph` | Boundary chính: xử lý chat (qua third-party chat SDK), routing CS, tạo nhóm chat và gửi phản hồi. |
| `gf-customer` | Cung cấp thông tin xe để tạo nhóm chat theo xe. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phản hồi được gửi thành công | >= 99% | Số phản hồi gửi thành công / tổng lần nhấn gửi |
| Thời gian phản hồi đầu tiên từ CS | <= 5 phút | Từ gửi tin nhắn đầu tiên đến nhận phản hồi CS |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-SUPPORT từ 2 FEAT đã gen (CHAT v1, FEEDBACK v1). Kế toán không có quyền vào nhóm chat theo xe — ngoại lệ phân quyền duy nhất trong hệ thống. |
