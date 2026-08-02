# Bản ghi quyết định chiến lược test (TSDR)

<!--
  Mẫu này được tạo vào cuối phiên grill-me-qa.
  AI điền vào tất cả các phần dựa trên phiên chất vấn QA.
  Sao chép file này vào thư mục docs/ của dự án để traceability.
-->

# TSDR: {{PROJECT_NAME}}

**Ngày:** {{DATE}}
**Người tham gia:** {{PARTICIPANTS}}
**Loại phiên:** Chiến lược QA
**Công cụ:** skill grill-me-qa

---

## Tóm tắt điều hành

**Tổng trạng thái:** {{RESOLVED_COUNT}}/7 dimension đã chốt · {{DEFERRED_COUNT}} trì hoãn · {{OPEN_COUNT}} còn mở

|Dimension|Trạng thái|Quyết định chính|
|-----------|--------|--------------|
|1. Chiến lược và phạm vi test|{{D1_STATUS}}|{{D1_SUMMARY}}|
|2. Framework & Tools|{{D2_STATUS}}|{{D2_SUMMARY}}|
|3. Kiến trúc testing|{{D3_STATUS}}|{{D3_SUMMARY}}|
|4. Tích hợp AI|{{D4_STATUS}}|{{D4_SUMMARY}}|
|5. Pipeline CI/CD|{{D5_STATUS}}|{{D5_SUMMARY}}|
|6. Kỹ thuật chất lượng|{{D6_STATUS}}|{{D6_SUMMARY}}|
|7. Khả năng bảo trì|{{D7_STATUS}}|{{D7_SUMMARY}}|

---

## Dimension 1: Chiến lược và phạm vi test

**Trạng thái:** Đã chốt / Trì hoãn / Còn mở

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 1.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|
| 1.2 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

### Các mục trì hoãn

- {{ITEM}} — **Tác động nếu trì hoãn:** {{IMPACT}}

---

## Dimension 2: Framework & Tools

**Trạng thái:** {{STATUS}}

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 2.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

---

## Dimension 3: Kiến trúc testing

**Trạng thái:** {{STATUS}}

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 3.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

---

## Dimension 4: Tích hợp AI

**Trạng thái:** {{STATUS}}

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 4.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

### Cấp độ tự chủ AI

|Workflow|Tier|Ghi chú|
|----------|------|-------|
|Tạo test| 1-2 |{{NOTES}}|
|Triage| 2-3 |{{NOTES}}|
|Test healing| 2 |{{NOTES}}|

---

## Dimension 5: CI/CD pipeline

**Trạng thái:** {{STATUS}}

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 5.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

### Giai đoạn pipeline

|Stage|Test|Time budget|Quality gate|
|-------|-------|--------|------|
|PR|{{TESTS}}|{{TIME_BUDGET}}|{{GATE}}|
|Merge|{{TESTS}}|{{TIME_BUDGET}}|{{GATE}}|
|Nightly|{{TESTS}}|{{TIME_BUDGET}}|{{GATE}}|

---

## Dimension 6: Quality engineering

**Trạng thái:** {{STATUS}}

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 6.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

---

## Dimension 7: Khả năng bảo trì và bền vững

**Trạng thái:** {{STATUS}}

### Quyết định

| # |Câu hỏi|Đề xuất|Đã chọn|Lý do|
|---|----------|-------------|--------|-----------|
| 7.1 |{{QUESTION}}|{{RECOMMENDED}}|{{CHOSEN}}|{{RATIONALE}}|

---

## Outstanding items

| # |Item|Dimension|Owner|Due date|
|---|------|-----------|-------|-----|
| 1 |{{ITEM}}|{{DIM}}|{{OWNER}}|{{DUE_DATE}}|

---

## Hành động tiếp theo

- [ ] {{ACTION}}
- [ ] {{ACTION}}

---

*Được tạo bởi skill grill-me-qa · {{DATE}}*
