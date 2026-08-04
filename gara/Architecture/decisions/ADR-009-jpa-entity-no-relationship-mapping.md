---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-05-07"
---

# ADR-009: JPA Entity Relationship Mapping Policy — Không dùng `@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany` mặc định

## Status
ACCEPTED — 2026-04-23

## Context

Garage dùng Spring Boot + JPA cho nhiều services nghiệp vụ, với nguyên tắc service-owned schema và boundary tách rõ theo microservice. Câu hỏi cần quyết định:

1. JPA relationship mapping (`@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`) có nên được dùng làm pattern mặc định cho entity Garage không?
2. Khi không dùng relationship mapping, quan hệ dữ liệu được biểu diễn và truy vấn như thế nào?

**Evidence từ source / TECHSTACK:**
- Spring Boot 3.5 + JPA/Hibernate ở hầu hết Spring services theo `TECHSTACK.md`.
- Nhiều service đã dùng scalar foreign key (vd `customerId`, `serviceOrderId`, `warehouseId`) thay vì entity reference.
- Outbox/inbox và projection pattern đã rõ ràng theo từng service boundary.

**Constraints từ runtime:**
- Việc dùng relationship mapping dễ tạo `N+1 query` và query bùng nổ do lazy/eager loading khó kiểm soát.
- Side effect khó đoán từ `cascade` và `orphanRemoval`.
- Coupling mạnh giữa entity graph với transaction boundary.
- Rủi ro serialize vòng lặp object graph ở tầng API.
- Khó truy vết ownership khi entity tham chiếu chéo domain.
- Kiến trúc hiện tại ưu tiên transaction rõ ràng, idempotency, outbox/event contract và migration minh bạch theo từng service boundary.

**Business rules liên quan:** NA.

## Decision

**Cấm dùng JPA relationship mapping (`@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`) trong entity Garage; quan hệ biểu diễn bằng scalar foreign key + explicit query/projection.**

Policy này phù hợp với định hướng kiến trúc của Garage: giữ transaction boundary rõ, kiểm soát query plan, giảm coupling persistence model, và đồng bộ với mô hình integration qua API/event/workflow thay vì shared object graph.

Cụ thể:

- **Mapping rule**: Không khai báo relationship mapping JPA trong entity. Quan hệ dữ liệu được biểu diễn bằng scalar foreign key (vd `customerId`, `serviceOrderId`, `warehouseId`).
- **Join strategy**: Join dữ liệu thực hiện tường minh ở query layer (`JPQL`, `native query`, `specification`, `projection`) hoặc compose ở application/service layer.
- **Cascade**: Không dùng `cascade` để tự động ghi xóa xuyên aggregate; mọi write operation phải explicit theo service use case.
- **Cross-service reference**: Tham chiếu sang dữ liệu service khác chỉ lưu external/business ID theo contract, không map entity graph chéo service.
- **Exception process**: Ngoại lệ chỉ được chấp nhận khi có lý do kỹ thuật rõ ràng và phải có ADR/exception record riêng.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Dùng relationship mapping JPA đầy đủ theo object graph** | Code entity nhìn "thuần OOP", giảm viết query thủ công ở giai đoạn đầu | Khó kiểm soát query plan, dễ phát sinh lazy loading ngoài ý muốn, side effect từ cascade | Không phù hợp với scale và yêu cầu kiểm soát query plan của Garage |
| **Chỉ dùng relationship mapping cho một số module nội bộ** | Linh hoạt hơn, giảm boilerplate ở một vài use case | Style không đồng nhất giữa services, tăng chi phí review, tăng rủi ro drift kiến trúc | Tạo inconsistency giữa các service làm tăng friction review và drift theo thời gian |

## Consequences

**Positive:**
- Query/read-write path rõ ràng, dễ tối ưu và dễ dự đoán.
- Giảm lỗi runtime liên quan lazy loading, recursion serialization và cascade không mong muốn.
- Tăng tính ổn định khi scale service và khi thay đổi schema.

**Negative:**
- **Cần viết nhiều query/projection thủ công hơn** — boilerplate tăng. **Mitigation**: dùng `Specification`, projection interface và shared base repository để giảm trùng lặp.
- **Tăng effort ở service layer để compose dữ liệu từ nhiều bảng** — service layer phải xử lý fan-out manual. **Mitigation**: chuẩn hoá pattern compose trong code review; dùng DTO mapper (MapStruct) cho consistency.
- **Đòi hỏi team kỷ luật hơn trong naming foreign key và query conventions** — ownership rule cross-service phải bảo trì. **Mitigation**: convention naming `<entity>Id` cho FK; review checklist trong PR template.

## References

- [TECHSTACK.md](../TECHSTACK.md)
- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Events: [event-contracts.md](../events/event-contracts.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-006 (Flyway per-service data ownership)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-009 `JPA Entity Relationship Mapping Policy`: relationship mapping JPA dễ tạo N+1 query, lazy/eager loading khó kiểm soát, side effect cascade và serialize vòng lặp, không khớp service-owned schema và transaction boundary của Garage, decision = cấm `@ManyToOne`/`@OneToMany`/`@OneToOne`/`@ManyToMany` mặc định và dùng scalar foreign key + explicit query/projection/specification, consequence = query path rõ ràng và giảm lỗi runtime nhưng cần viết nhiều query thủ công hơn và service layer phải compose dữ liệu manual. Bao gồm Status, Context, Decision (mapping rule + join strategy + cascade + cross-service reference + exception process), Alternatives Considered, Consequences, References. |
