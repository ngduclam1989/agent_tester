---
description: Sinh locator ổn định cho UI element. Hỗ trợ Playwright.
skills:
  - smart_locator_agent
  - ui_debug_agent
---

# /generate_locator — Sinh Locator Ổn Định Cho UI Automation

> User cung cấp element cần tìm locator (mô tả, screenshot, URL, hoặc HTML snippet).
> AI inspect DOM/UI hierarchy thực tế, sinh locator ổn định theo priority chuẩn, verify uniqueness, trả về kết quả.

> **BẮT BUỘC (MANDATORY):** Trước khi bắt đầu, PHẢI nạp và đọc kỹ:
> - **Skill:** `.claude/skills/smart_locator_agent/SKILL.md` — Quy trình sinh locator
> - **Skill:** `.claude/skills/ui_debug_agent/SKILL.md` — Quy trình inspect DOM
> - **Rule:** `.claude/rules/locator_strategy.md` — Bản đồ ưu tiên locator
> - **Rule:** `.claude/rules/playwright_rules.md` — Quy tắc Playwright


## ⚠️ Nơi lưu code (BẮT BUỘC)

Mọi file code sinh ra hoặc chỉnh sửa đều nằm trong `TestScript/` ở gốc repo:
Page Object → `TestScript/pages/`, spec → `TestScript/tests/api/` và `TestScript/tests/web/`,
helper dùng chung → `TestScript/common/` và `TestScript/utils/`, test data → `TestScript/test-data/`.

KHÔNG tạo file code ở gốc repo, KHÔNG import vượt ra ngoài `TestScript/`, luôn neo đường dẫn file
bằng `__dirname` thay cho `process.cwd()`. Mọi lệnh chạy từ bên trong: `cd TestScript && npm run test:api`.

> Định nghĩa đầy đủ: `.claude/skills/qa_automation_engineer/SKILL.md` → mục **Automation Project Root**.

---

## Input cần từ User

| Input | Bắt buộc | Mô tả |
|-------|----------|-------|
| Mô tả element | ✅ | VD: "nút Login", "dropdown chọn Country", "ô nhập Email" |
| URL trang chứa element | ✅ | Để AI navigate và inspect DOM thực tế |
| HTML snippet | ❌ | Nếu User đã có sẵn DOM context — AI dùng để phân tích nhanh |
| Page class đích | ❌ | File Page class mà locator sẽ được thêm vào |
| Login yêu cầu | ❌ | Nếu trang yêu cầu đăng nhập — User cho biết cách login |

> **Lưu ý về Login:** Nếu trang yêu cầu đăng nhập, User PHẢI chỉ rõ cách login (fixture, script, URL login...). AI KHÔNG ĐƯỢC tự đọc `.env` hay đoán credentials.

---

## Các bước thực hiện

### Phase 1: Phân tích yêu cầu

1. **Hiểu element cần tìm** — Xác định rõ:
   - **Loại element:** button, input, link, dropdown, dialog, table row, checkbox, radio...
   - **Context:** Nằm trong page chính, dialog/modal, sidebar, table, iframe?
   - **Thao tác:** click, fill, select, hover, verify text, verify visibility?

2. **Đọc rule tương ứng:** `.claude/rules/playwright_rules.md`

3. **Kiểm tra Page class hiện tại (nếu User chỉ định):**
   - Đọc file Page class → biết locator đã có sẵn
   - Tránh trùng lặp hoặc xung đột naming

---

### Phase 2: Inspect DOM thực tế (Playwright MCP)

> ⚠️ **NGUYÊN TẮC BẤT DI BẤT DỊCH: KHÔNG BAO GIỜ ĐOÁN LOCATOR. PHẢI INSPECT THỰC TẾ.**

4. **Navigate đến trang chứa element:**
   ```
   browser_navigate(url=<target_url>)
   ```

5. **Resize viewport (BẮT BUỘC):**
   ```
   browser_resize(width=1920, height=1080)
   ```

6. **Capture DOM:**
   ```
   browser_snapshot()
   ```

7. **Phân tích element trong snapshot:**
   - Tìm ref element trong DOM tree
   - Ghi lại **tất cả attributes có giá trị**: `role`, `aria-label`, `aria-labelledby`, `data-testid`, `data-test`, `data-qa`, `id`, `name`, `placeholder`, `type`, `href`, text content
   - Ghi lại **parent context** (dialog? table? sidebar? iframe?)

8. **Nếu element bị ẩn** (dropdown menu, modal, tooltip...):
   - Thực hiện action mở element: `browser_click(ref=<trigger>)`
   - Capture lại: `browser_snapshot()`

---

### Phase 3: Sinh locator theo Priority

9. **Áp dụng bản đồ ưu tiên (Master Priority Map):**

   | # | Loại | Khi nào dùng |
   |---|------|-------------|
   | 1 | Accessibility / Aria | Element có `role`, `aria-label` rõ ràng |
   | 2 | Test attribute | Element có `data-testid`, `data-test`, `data-qa` |
   | 3 | ID / name | Element có `id` hoặc `name` ổn định (không auto-generated) |
   | 4 | Framework semantic | Playwright: `getByRole`, `getByLabel`... |
   | 5 | CSS Selector | Dùng attribute cụ thể, tránh class động |
   | 6 | XPath | Lựa chọn cuối cùng — chỉ dùng XPath tương đối |

10. **Sinh locator Playwright:**

    ```typescript
    // Priority 1: Role-based
    page.getByRole('button', { name: 'Submit' })

    // Priority 2: Test ID
    page.getByTestId('submit-btn')

    // Priority 3: Label / Placeholder
    page.getByLabel('Email')
    page.getByPlaceholder('Enter your password')

    // Priority 4: Text
    page.getByText('Submit')

    // Priority 5: CSS
    page.locator('#submit-button')
    page.locator('[data-testid="submit-btn"]')

    // Priority 6: XPath (cuối cùng)
    page.locator('//button[@type="submit"]')
    ```

---

### Phase 4: Validate locator

11. **Verify uniqueness — PHẢI match đúng 1 element** (Playwright MCP):
    ```
    browser_evaluate(function="() => document.querySelectorAll('<css_selector>').length")
    ```

12. **Verify visibility** — Element phải tương tác được:
    - Không bị overlay bởi element khác
    - Không ở trạng thái `hidden`, `display:none`, `visibility:hidden`
    - Không nằm ngoài viewport (cần scroll)

13. **Verify stability — Kiểm tra checklist:**
    - [ ] Không dùng dynamic CSS class (VD: `css-1n2xyz`, `sc-bdnxRM`)
    - [ ] Không dùng XPath tuyệt đối (VD: `//html/body/div[1]/div[2]/button`)
    - [ ] Không dùng auto-generated ID (VD: `ember123`, `react-select-2-input`)
    - [ ] Không dùng `nth-child` / `nth-of-type` khi có lựa chọn tốt hơn
    - [ ] Sống sót qua page reload
    - [ ] Ổn định trên nhiều trạng thái trang (loading, loaded, có data, không data)

---

### Phase 5: Trả kết quả

14. **Output Format — BẮT BUỘC cung cấp đầy đủ 3 phần:**

```markdown
## Locator Result: [Mô tả element]

**Framework:** Playwright

### 🎯 Primary Locator (Recommended)
```<language>
// Locator code — copy-paste ready
```
- **Loại:** [Role-based / Test ID / CSS / ...]
- **Unique:** ✅ Match 1 element
- **Stability:** ✅ Không dùng dynamic class / absolute xpath

### 🔄 Fallback Locator
```<language>
// Locator thay thế khi primary hỏng
```
- **Loại:** [CSS / XPath / ...]
- **Khi nào dùng:** Khi primary locator bị break do DOM thay đổi

### 💡 Reasoning
- Giải thích tại sao chọn Primary locator này
- Tại sao loại bỏ các candidate khác
- Rủi ro tiềm ẩn (nếu có)

### 📋 Usage Example (nếu User yêu cầu)
```<language>
// Ví dụ sử dụng locator trong test code
```
```

15. **(Tùy chọn) Nếu User yêu cầu thêm vào Page class:**
    - Thêm locator đúng vị trí trong Page class
    - Đặt tên theo naming convention của project
    - Tạo method sử dụng locator nếu cần

---

## Common Patterns (Tham khảo)

### Scoping locator trong Dialog / Modal:
```typescript
const dialog = page.getByRole('dialog');
dialog.getByRole('button', { name: 'Confirm' }).click();
```

### Dynamic text matching:
```typescript
page.getByText('Submit', { exact: true })     // exact match
page.getByText(/submit/i)                      // regex, case-insensitive
```

### Table row action:
```typescript
const row = page.getByRole('row').filter({ hasText: 'John Doe' });
row.getByRole('button', { name: 'Edit' }).click();
```

---

## NGHIÊM CẤM

| ❌ Không được làm | ✅ Thay thế đúng |
|-------------------|-----------------|
| Đoán locator không inspect DOM | `browser_snapshot()` trước |
| Dùng CSS class động (`css-1n2xyz`, `sc-xxx`) | Dùng role, aria, data-testid, text |
| Dùng XPath tuyệt đối (`//html/body/div[1]...`) | Dùng XPath tương đối với attribute |
| Dùng auto-generated ID (`ember123`, `:r1:`) | Dùng stable attribute hoặc text |
| Trả locator không verify uniqueness | Luôn verify match đúng 1 element |
| Chỉ trả 1 locator, không có fallback | Trả Primary + Fallback + Reasoning |
| Đọc `.env` để lấy credentials login | Hỏi User cách login hoặc dùng fixture có sẵn |

---

## Checklist cuối

- [ ] Đã inspect DOM/UI hierarchy thực tế (không đoán)
- [ ] Locator theo đúng priority: accessibility > test-id > id/name > semantic > css > xpath
- [ ] Primary locator match đúng 1 element duy nhất
- [ ] Có Fallback locator
- [ ] Có Reasoning giải thích lý do chọn
- [ ] Không dùng dynamic class, absolute xpath, auto-generated ID
- [ ] Locator ổn định qua page reload và nhiều trạng thái
- [ ] (Nếu thêm vào Page class) Đã verify code chạy không lỗi