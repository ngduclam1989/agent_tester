---
description: Vẽ diagram kỹ thuật (architecture, sequence, flowchart, ER, state machine, timeline, org chart...) bằng skill diagram-design — output HTML tự chứa, lưu vào practices/diagram/.
skills:
  - diagram-design
---

# /generate_diagram — Vẽ Diagram Kỹ Thuật (System Design)

> Input: mô tả hệ thống/luồng cần vẽ, HOẶC tên wave/feature/tài liệu có sẵn trong `requirements/` để AI tự đọc lấy nội dung.
> Output: file `.html` tự chứa (inline SVG), lưu vào `practices/diagram/`.

> **BẮT BUỘC (MANDATORY):** Trước khi vẽ, đọc kỹ `.claude/skills/diagram-design/SKILL.md` — đặc biệt:
> - §0 — style guide gate (lần đầu vẽ trong project phải hỏi user có customize brand không)
> - §3 — chọn semantic pattern / loại diagram (27 loại)
> - §7 — complexity budget (max node/arrow/lifeline theo từng loại)
> - §9 — pre-output checklist (taste gate) trước khi giao
> - §13 — quy ước output riêng cho project này (`practices/diagram/`)

---

## Input cần từ User

| Input | Bắt buộc | Mô tả |
|---|---|---|
| Nội dung cần vẽ | ✅ | Mô tả trực tiếp, HOẶC tên wave/feature/file trong `requirements/` để AI tự đọc |
| Loại diagram | ❌ | **Mặc định của project này**: nếu User không nêu rõ loại diagram, vẽ **cả 3** — Architecture (topology tổng thể), Sequence, và Activity/Flowchart — mỗi loại 1 file riêng, mỗi file tự trong complexity budget của nó (§7 của skill). Không tự chọn 1 loại duy nhất khi chưa nêu rõ. Nếu User có nêu rõ loại (vd "vẽ sequence diagram") thì chỉ vẽ đúng loại đó. |
| Nguồn import | ❌ | Nếu có sẵn `.drawio*` hoặc Mermaid `.mmd`/fenced block cần vẽ lại — nêu rõ đường dẫn, xem §11 |

---

## Các bước thực hiện

1. **Lấy nội dung nguồn** — nếu User chỉ nêu tên wave/feature (không paste nội dung sẵn), chủ động tìm tài liệu liên quan trong `requirements/gara/wave-XX/**` (Architecture HLD, events, integrations, business-rules...) rồi mới vẽ. Không đoán nội dung khi chưa đọc tài liệu gốc.
2. **Chọn loại + pattern** theo §3 của skill. Nếu nội dung vượt complexity budget (§7) → chia thành overview + detail thay vì nhồi vào 1 diagram.
3. **Confirm trước khi vẽ** (theo mục "Confirm before drawing" §3): nêu ngắn gọn loại diagram, phạm vi, và những gì sẽ bị cắt do budget — trừ khi input đã chỉ định rõ đủ type/size/content.
4. **Vẽ** theo đúng primitives + design system của skill (§4–§8).
5. **Tự kiểm tra** — chạy `python3 .claude/skills/diagram-design/scripts/self_check.py <file>` trước khi báo hoàn thành; sửa tới khi sạch.
6. **Lưu file** vào `practices/diagram/<ten-kebab-case>.html` (giữ phẳng, không tạo sub-folder theo wave trừ khi User yêu cầu khác — xem §13).
7. **Báo cáo**: đường dẫn file, loại diagram đã chọn, những gì đã cắt/giả định (nếu có).

---

## NGHIÊM CẤM

| ❌ Không được làm | ✅ Thay thế đúng |
|---|---|
| Vẽ khi chưa đọc tài liệu nguồn (đoán nội dung) | Đọc `requirements/**` liên quan trước |
| Nhồi >budget (§7) vào 1 diagram cho "đủ" | Chia overview + detail |
| Bỏ qua self_check.py trước khi báo hoàn thành | Luôn chạy self_check.py, sửa sạch |
| Lưu output ngoài `practices/diagram/` mà không hỏi | Mặc định `practices/diagram/`, chỉ đổi khi User yêu cầu |
| Publish diagram lên Artifact (Google Fonts external → vi phạm CSP tự chứa) | Giao file `.html` local để mở bằng browser |
