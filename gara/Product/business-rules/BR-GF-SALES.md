---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-sales"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules -- gf-sales

> Boundary nay so huu domain: Booking, Service Order (sua chua + ban le), Settlement-facing state, Dashboard.

---

## S1 Cross-boundary Rules

| BR ID | Rule | Boundary lien quan | Ghi chu |
|---|---|---|---|
| BR-CROSS-001 | Moi truy van va thao tac tren gf-sales phai gioi han theo `tenantId` hien tai. Khong hien thi, khong xu ly du lieu cua garage khac. Event header `OriginTenantId` phai khop `data.tenantId`. | Tat ca | Vi pham = data breach. TenantFilter + TenantContext bat buoc. |
| BR-CROSS-002 | Thong tin khach hang va xe trong gf-sales la **projection read-only** (ban snapshot). Du lieu chu (master) thuoc `gf-customer`. Khong duoc modify projection nhu master data. | gf-customer | Dong bo qua REST; snapshot luu tai thoi diem tao booking/phieu dich vu. |
| BR-CROSS-003 | Danh muc dich vu va phu tung lay tu `gf-erp-mdm` qua REST cached. gf-sales khong so huu danh muc. | gf-erp-mdm | |
| BR-CROSS-004 | Khi phieu dich vu co phu tung nguon INVENTORY va feature flag bat, gf-sales gui event xuat kho sang `gf-inventory` qua Kafka. | gf-inventory | Qua transactional outbox (ADR-004). |
| BR-CROSS-005 | Quyet toan thuoc `gf-accounting`. gf-sales nhan callback settle/reopen de cap nhat trang thai phieu dich vu (SETTLED / reopen ve trang thai truoc quyet toan). | gf-accounting | REST callback. |
| BR-CROSS-006 | Tich hop Driver+ la he thong ben ngoai. Nhan lich hen tu Driver+ qua su kien Kafka; dong bo trang thai va phan hoi hai chieu (BOOKING.CREATE.RESPONSE, BOOKING.UPDATE.RESPONSE). | Driver+ (external) | Consumer phai filter `MessageGroup` + `MessageStep`. |
| BR-CROSS-007 | State-changing events phai qua transactional outbox. Consumer phai dedup qua inbox table hoac `processed_events`. | Tat ca | ADR-004 bat buoc. |
| BR-CROSS-008 | Danh sach nhan vien lay tu `gf-hrms`. gf-sales khong so huu du lieu nhan vien. | gf-hrms | |
| BR-CROSS-009 | Chi 2 actor: **chu garage** (garage-owner) va **ke toan** (accountant). Quyen tuong duong tru "nhom chat theo xe". Khong tao them actor moi. | Tat ca | |

---

## S2 Rules Registry

### 2.1 Booking (BR-BOOK-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-BOOK-001 | Trang thai khoi tao phu thuoc vao nguon tao: (a) Garage Care (Web GMS + App Garage) -> **"Da xac nhan"**; (b) Driver+ -> **"Lich hen moi"**; (c) Walk-in tu sinh tu Phieu dich vu -> **"Xe da den"**. | Status Init | FEAT-BOOK-CREATE |
| BR-BOOK-002 | Ma lich hen duoc he thong tu sinh theo dinh dang chuan, khong cho phep nhap thu cong. | Code Generation | FEAT-BOOK-CREATE |
| BR-BOOK-003 | Nguon lich hen duoc ghi nhan tu dong khi tao, khong hien thi tren form tao. Cac nguon: **"Tu ung dung tai xe"**, **"Garage Care"**, **"Walk-in"**. | Data Integrity | FEAT-BOOK-CREATE, FEAT-BOOK-LIST |
| BR-BOOK-004 | Khi chon khach hang/xe tu goi y, thong tin snapshot duoc luu cung lich hen tai thoi diem tao. | Snapshot | FEAT-BOOK-CREATE |
| BR-BOOK-005 | Lich hen tu Driver+ duoc tao qua kenh su kien tu dong. Garage khong nhap lieu ma chi xac nhan hoac tu choi. Sau khi tao thanh cong, he thong phan hoi ve Driver+ qua su kien `BOOKING.CREATE.RESPONSE` va gui thong bao cho khach hang. | Integration | FEAT-BOOK-CREATE |
| BR-BOOK-006 | Khi tao Phieu dich vu loai sua chua/bao duong/Car Spa ma khong gan lich hen, he thong tu sinh booking walk-in voi trang thai **"Xe da den"**, nguon **"Walk-in"**, thoi diem xe den = thoi diem tao phieu. Khong ap dung cho phieu ban le. | Auto-creation | FEAT-BOOK-CREATE, FEAT-SO-CREATE |
| BR-BOOK-007 | Chi cho phep chinh sua lich hen khi trang thai la **"Lich hen moi"** hoac **"Da xac nhan"**. Cac trang thai khac khong hien thi nut chinh sua. | Edit Constraint | FEAT-BOOK-EDIT, FEAT-BOOK-LIST |
| BR-BOOK-008 | Khi cap nhat lich hen thanh cong, he thong dong bo thong tin sang Driver+ qua su kien `BOOKING.UPDATE.RESPONSE`. | Integration | FEAT-BOOK-EDIT |
| BR-BOOK-009 | Chi cho phep xac nhan lich hen o trang thai **"Lich hen moi"**. | Status Transition | FEAT-BOOK-CONFIRM |
| BR-BOOK-010 | Sau khi xac nhan, khach hang nhan thong bao qua Driver+ (neu lich hen co nguon tu Driver+). He thong ghi nhan lich su chuyen trang thai voi nguoi thuc hien va thoi gian. | Notification | FEAT-BOOK-CONFIRM |
| BR-BOOK-011 | Chi cho phep xac nhan xe da den khi lich hen o trang thai **"Da xac nhan"**. He thong ghi nhan thoi diem xe den. | Status Transition | FEAT-BOOK-ARRIVE |
| BR-BOOK-012 | Sau khi xe da den, lich hen san sang de tao phieu dich vu lien ket. | Flow | FEAT-BOOK-ARRIVE, FEAT-SO-CREATE |
| BR-BOOK-013 | Chi cho phep huy lich hen o trang thai **"Da xac nhan"** va chua co phieu dich vu lien ket. | Cancel Constraint | FEAT-BOOK-CANCEL |
| BR-BOOK-014 | Ly do huy duoc ghi nhan trong lich su trang thai cung nguoi thuc hien va thoi gian. | Audit | FEAT-BOOK-CANCEL |
| BR-BOOK-015 | Chi cho phep tu choi lich hen o trang thai **"Lich hen moi"**. Sau khi tu choi, thong tin tu choi (ly do) duoc gui cho khach hang qua Driver+ (neu lich hen co nguon tu Driver+). | Status Transition | FEAT-BOOK-DECLINE |
| BR-BOOK-016 | Ly do tu choi duoc ghi nhan trong lich su trang thai cung nguoi thuc hien va thoi gian. | Audit | FEAT-BOOK-DECLINE |
| BR-BOOK-017 | Lich hen qua han o trang thai **"Lich hen moi"** hoac **"Da xac nhan"** duoc he thong tu dong chuyen sang **"Da huy"** (NO_SHOW), ghi lich su va gui thong bao. | Auto-cancel | FEAT-BOOK-LIST |
| BR-BOOK-018 | Trang thai NO_SHOW va CANCELLED deu hien thi chung la **"Da huy"** tren giao dien. | Display | FEAT-BOOK-LIST |
| BR-BOOK-019 | Lich su trang thai ghi nhan day du: trang thai truoc, trang thai sau, ly do (neu co), nguoi thuc hien, thoi gian. | Audit | FEAT-BOOK-DETAIL |
| BR-BOOK-020 | Thong tin khach hang va xe hien thi tren chi tiet lich hen la snapshot tai thoi diem tao, khong phai du lieu hien tai. | Snapshot | FEAT-BOOK-DETAIL |
| BR-BOOK-021 | Danh sach lich hen hien thi theo pham vi garage hien tai (tenant). Khong hien thi lich hen cua garage khac. | Tenant Scope | FEAT-BOOK-LIST |
| BR-BOOK-022 | Driver+ co the huy lich hen tu phia khach hang. He thong tu dong huy lich hen tuong ung va chuyen trang thai sang **"Da huy"**. | Integration | FEAT-BOOK-CREATE |

### 2.2 Service Order -- Sua chua (BR-SO-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-SO-001 | Phieu dich vu xe duoc tao voi trang thai khoi tao la **"Bao gia"**. Ma phieu tu sinh theo pattern **PDV-{yyyyMMdd}-{00000}**, unique theo tenant, khong cho phep nhap thu cong. | Code Generation | FEAT-SO-CREATE |
| BR-SO-002 | Khi tao phieu dich vu xe ma khong gan lich hen, he thong tu dong sinh lich hen walk-in voi trang thai **"Xe da den"**. Khong ap dung cho phieu ban le. | Auto-creation | FEAT-SO-CREATE |
| BR-SO-003 | Thong tin khach hang va xe trong phieu dich vu la ban snapshot tai thoi diem tao -- chi doc, khong phai du lieu chu. Du lieu chu do gf-customer nam giu. | Snapshot | FEAT-SO-CREATE |
| BR-SO-004 | Chiet khau tren moi dong dich vu hoac phu tung phai nam trong khoang 0% - 100%. | Validation | FEAT-SO-CREATE, FEAT-SO-EDIT |
| BR-SO-005 | So luong tren moi dong dich vu hoac phu tung phai lon hon 0. | Validation | FEAT-SO-CREATE, FEAT-SO-EDIT |
| BR-SO-006 | Khi toggle bao hiem bat, truong **"Cong ty bao hiem"** la bat buoc. Ben thanh toan I (bao hiem) tren dong dich vu chi kha dung khi toggle bao hiem bat. | Conditional Required | FEAT-SO-CREATE, FEAT-SO-EDIT |
| BR-SO-007 | Thanh tien moi dong = SL x Don gia x (1 - CK%). Tong thanh tien = Tong dich vu + Tong phu tung. He thong tu dong tinh, nguoi dung khong nhap truc tiep. | Calculation | FEAT-SO-CREATE, FEAT-SO-EDIT, FEAT-SO-DETAIL |
| BR-SO-008 | Chuyen trang thai phieu dich vu xe: **"Bao gia"** -> **"Dang thuc hien"**; **"Dang thuc hien"** hoac **"Da xac nhan"** -> **"Hoan thanh"**; **"Hoan thanh"** -> **"Da tao quyet toan"** (qua gf-accounting callback). Phieu o trang thai **"Bao gia"**, **"Dang thuc hien"**, **"Da xac nhan"**, **"Da tu choi"** co the bi huy. | Status Transition | FEAT-SO-DETAIL |
| BR-SO-009 | Ghi nhan thanh toan cap nhat so tien da tra, so tien con no va trang thai thanh toan. Khi thanh toan du, trang thai thanh toan chuyen sang **"Da thanh toan"** va so tien con no ve 0. So tien thanh toan khong duoc vuot qua so tien khach can tra. | Payment | FEAT-SO-DETAIL |
| BR-SO-010 | Gui bao gia den Driver+ bi chan khi phieu khong co dich vu hoac phu tung dang hoat dong. | Constraint | FEAT-SO-DETAIL |
| BR-SO-011 | Nut **"Chinh sua"** chi hien thi khi phieu o trang thai **"Bao gia"**, **"Dang thuc hien"**, **"Da xac nhan"**, hoac **"Da tu choi"**. | Edit Constraint | FEAT-SO-DETAIL, FEAT-SO-EDIT |
| BR-SO-012 | Nut **"Dat hang"** phu tung khong hien thi khi phieu o trang thai **"Hoan thanh"**, **"Da tao quyet toan"**, **"Da huy"** hoac **"Da tu choi"**. | Action Constraint | FEAT-SO-DETAIL |
| BR-SO-013 | Ma phieu dich vu khong cho phep chinh sua -- hien thi chi doc. | Immutable | FEAT-SO-EDIT |
| BR-SO-014 | Khi chinh sua phieu da gui bao gia truoc do, he thong tu dong tao bao gia moi va gui lai cho khach hang xac nhan (tang so lan gui bao gia). | Re-quotation | FEAT-SO-EDIT |
| BR-SO-015 | Bien so xe tu dong chuyen thanh chu in hoa, chi chap nhan ky tu chu cai va so. | Format | FEAT-SO-EDIT |
| BR-SO-016 | Khi thay doi hang xe, truong dong xe va phien ban xe duoc reset do phu thuoc danh muc. | Cascade Reset | FEAT-SO-EDIT |
| BR-SO-017 | Truong **"Cong ty bao hiem"** bat buoc khi chon co bao hiem. Neu khong co bao hiem, cac truong bao hiem khong hien thi. | Conditional Required | FEAT-SO-EDIT |
| BR-SO-018 | Dong dich vu va phu tung bi xoa tren form su dung co che xoa mem -- chi duoc ap dung khi nhan nut luu. | Soft Delete | FEAT-SO-EDIT |
| BR-SO-019 | Huy phieu dich vu bat buoc nhap ly do huy. | Cancel Constraint | FEAT-SO-DETAIL |
| BR-SO-020 | Danh sach phieu dich vu luon duoc pham vi theo garage hien tai -- khong hien thi phieu cua garage khac. | Tenant Scope | FEAT-SO-LIST |
| BR-SO-021 | Tim kiem tu khoa ap dung dong thoi cho ma phieu, ten khach hang, so dien thoai va bien so xe. | Search | FEAT-SO-LIST |
| BR-SO-022 | Trang thai phieu co 8 gia tri: **"Bao gia"**, **"Da xac nhan"**, **"Da tu choi"**, **"Dang thuc hien"**, **"Hoan thanh"**, **"Da huy"**, **"Da xuat kho"**, **"Da tao quyet toan"**. | Enumeration | FEAT-SO-LIST |
| BR-SO-023 | Trang thai thanh toan co 3 gia tri: **"Chua thanh toan"**, **"Thanh toan 1 phan"**, **"Da thanh toan"**. | Enumeration | FEAT-SO-LIST, FEAT-SO-DETAIL |
| BR-SO-024 | Loai phieu co 2 gia tri: **"Dich vu xe"** va **"Ban phu tung"**. | Enumeration | FEAT-SO-LIST |
| BR-SO-025 | Cac bo loc co the ket hop dong thoi -- he thong ap dung giao (AND) tat ca dieu kien loc. | Filter Logic | FEAT-SO-LIST |
| BR-SO-026 | Mo lai phieu tu **"Da tao quyet toan"** quay ve trang thai truoc quyet toan theo loai phieu -- bi chan neu phieu da co thanh toan. | Reopen | EP-SERVICE-ORDER |
| BR-SO-027 | Trang thai **"Da tu choi"** chi ap dung cho phieu dich vu xe khi khach hang tu choi bao gia qua Driver+. | Status Specific | EP-SERVICE-ORDER |
| BR-SO-028 | Truong bat buoc khi tao phieu dich vu xe: Nhan vien tao phieu, Loai dich vu, SDT khach hang, Ten khach hang, Hang xe, Dong xe. | Required Fields | FEAT-SO-CREATE |
| BR-SO-029 | Truong bat buoc khi chinh sua phieu dich vu xe: SDT khach hang, Ten khach hang, Bien so xe, Hang xe, Dong xe, Nhan vien tao phieu. | Required Fields | FEAT-SO-EDIT |

### 2.3 Service Order -- Ban le (BR-SALE-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-SALE-001 | Phieu ban le phu tung luon co loai phieu la **"Ban phu tung"**, khoi tao o trang thai **"Bao gia"**. Ma phieu tu sinh theo dinh dang PDV-{yyyyMMdd}-{00000}. | Code Generation | FEAT-SO-SALE-CREATE |
| BR-SALE-002 | Phieu ban le khong tu sinh lich hen walk-in khi tao, khac voi phieu dich vu xe. | No Walk-in | FEAT-SO-SALE-CREATE |
| BR-SALE-003 | Phieu ban le yeu cau it nhat mot dong phu tung. Khong co muc dich vu/cong (khac voi phieu dich vu xe). | Min Items | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| BR-SALE-004 | Truong SDT khach hang, Ten khach hang va Nguoi tao phieu la bat buoc. | Required Fields | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| BR-SALE-005 | So dien thoai phai dung dinh dang. Neu khop voi khach hang trong he thong, tu dong dien ten khach hang. | Validation | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| BR-SALE-006 | Vong doi trang thai phieu ban le: **"Bao gia"** -> **"Da xac nhan"** -> **"Da xuat kho"** -> **"Da tao quyet toan"**. Phieu co the huy tu **"Bao gia"** hoac **"Da xac nhan"** sang **"Da huy"**. Phieu co the bi tu choi tu **"Bao gia"** sang **"Da tu choi"**. | Status Transition | FEAT-SO-SALE-DETAIL |
| BR-SALE-007 | Phieu ban le quyet toan tu trang thai **"Da xuat kho"** sang **"Da tao quyet toan"**; khac voi phieu dich vu xe quyet toan tu **"Hoan thanh"**. | Settlement Diff | FEAT-SO-SALE-DETAIL |
| BR-SALE-008 | Nut **"Chinh sua"** chi hien thi khi phieu o trang thai **"Bao gia"** hoac **"Da xac nhan"**. | Edit Constraint | FEAT-SO-SALE-DETAIL, FEAT-SO-SALE-EDIT |
| BR-SALE-009 | Nut **"Dat hang"** phu tung an khi phieu o trang thai **"Da xuat kho"**, **"Da huy"** hoac **"Da tao quyet toan"**. | Action Constraint | FEAT-SO-SALE-DETAIL |
| BR-SALE-010 | Huy phieu ban le bat buoc nhap ly do huy. | Cancel Constraint | FEAT-SO-SALE-DETAIL |
| BR-SALE-011 | Ma phieu khong duoc phep thay doi (chi doc). | Immutable | FEAT-SO-SALE-EDIT |
| BR-SALE-012 | Cap nhat phieu ban le da gui bao gia se tang so lan gui bao gia, cho phep gui lai. | Re-quotation | FEAT-SO-SALE-EDIT |
| BR-SALE-013 | Gui bao gia phieu ban le bi chan neu da gui truoc do hoac khong co dong phu tung nao. | Constraint | FEAT-SO-SALE-DETAIL |

### 2.4 Settlement / Quyet toan (BR-STL-001..NNN)

> **Luu y**: Settlement thuoc boundary `gf-accounting`. Muc nay ghi nhan cac rules lien quan den gf-sales trong luong quyet toan.

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-STL-001 | Tao phieu quyet toan phai lay snapshot phieu dich vu truoc khi ghi nhan -- dam bao du lieu chi phi dich vu va phu tung khop tai thoi diem quyet toan. | Snapshot | FEAT-STL-CREATE |
| BR-STL-002 | Neu phieu dich vu co ca hang muc khach hang va bao hiem, he thong tao cap phieu quyet toan **"Khach hang"** va **"Bao hiem"**, lien ket hai chieu qua ma phieu quyet toan lien quan. | Pair Creation | FEAT-STL-CREATE |
| BR-STL-003 | Neu phieu dich vu chi co hang muc khach hang thi tao phieu **"Khach hang"**; chi co hang muc bao hiem thi tao phieu **"Bao hiem"**. Ca hai truong hop deu chuyen phieu dich vu sang trang thai **"Da tao quyet toan"**. | Single Creation | FEAT-STL-CREATE |
| BR-STL-004 | Khong cho phep tao phieu quyet toan dang hoat dong trung ma phieu dich vu va loai ben thanh toan. Phieu da huy truoc do co the duoc tai su dung ma khi tao lai. | Uniqueness | FEAT-STL-CREATE |
| BR-STL-005 | Tong tien quyet toan nhan truc tiep tu gia tri chu garage nhap -- he thong khong tu tinh server-side (cho phep thuong luong gia). | Manual Input | FEAT-STL-CREATE |
| BR-STL-006 | Ma phieu quyet toan tu sinh theo dinh dang **SET-{yyyyMMdd}-{00001}**, unique theo tenant, khong cho phep nhap thu cong. | Code Generation | FEAT-STL-CREATE |
| BR-STL-007 | Phieu quyet toan khoi tao luon o trang thai **"Nhap"** (DRAFT). Khong co trang thai phe duyet hay thanh toan tren phieu quyet toan -- vong doi thanh toan thuoc phieu dich vu. | Status Init | FEAT-STL-CREATE |
| BR-STL-008 | Huy phieu quyet toan se huy toan bo phieu quyet toan cung ma phieu dich vu (bao gom ca phieu lien ket trong cap khach hang/bao hiem) va mo lai phieu dich vu tu trang thai da quyet toan. | Cancel Cascade | FEAT-STL-DETAIL |
| BR-STL-009 | Mo lai phieu dich vu tu trang thai da quyet toan bi chan neu phieu dich vu da co giao dich thanh toan. | Reopen Block | FEAT-STL-DETAIL |
| BR-STL-010 | Cap nhat phieu quyet toan chi cho phep thay doi ghi chu va dong bo chung tu. Cac thong tin khac (dich vu, phu tung, tong tien, thong tin khach hang) khong duoc phep sua. | Edit Scope | FEAT-STL-DETAIL |
| BR-STL-011 | In phieu quyet toan chi hien thi cac hang muc theo ben thanh toan tuong ung. Tong tien duoc hien thi bang chu tieng Viet. | Print | FEAT-STL-DETAIL |
| BR-STL-012 | Trang thai phieu quyet toan chi co 2 gia tri: **"Hoat dong"** (DRAFT) va **"Da huy"** (CANCEL). | Enumeration | FEAT-STL-LIST |

### 2.5 Dashboard (BR-DASH-001..NNN)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-DASH-001 | Phan van hanh thoi gian thuc hien thi du lieu live, khong bi anh huong boi bo loc thoi gian. | Realtime | FEAT-DASH-VIEW |
| BR-DASH-002 | Phan thong ke (dich vu, doanh thu, mua hang) duoc loc theo khoang thoi gian da chon. | Filter | FEAT-DASH-VIEW |
| BR-DASH-003 | Phan tram thay doi duoc tinh so voi ky truoc cung do dai (vi du: tuan nay so voi tuan truoc). | Calculation | FEAT-DASH-VIEW |
| BR-DASH-004 | Dashboard du lieu luon duoc pham vi theo garage hien tai -- khong hien thi du lieu cua garage khac. | Tenant Scope | FEAT-DASH-VIEW |
| BR-DASH-005 | Dashboard BI nang cao (Superset) yeu cau guest token hop le de render. Token duoc lay qua he thong xac thuc. | Security | FEAT-DASH-VIEW |

---

## S3 Status Transition Rules

### 3.1 Booking Lifecycle

| From | To | Dieu kien | Trigger | Features |
|---|---|---|---|---|
| *(tao moi)* | **Lich hen moi** | Nguon = Driver+ | Su kien tu Driver+ | FEAT-BOOK-CREATE |
| *(tao moi)* | **Da xac nhan** | Nguon = Garage Care (Web GMS / App Garage) | Nguoi dung tao qua Garage Care | FEAT-BOOK-CREATE |
| *(tao moi)* | **Xe da den** | Walk-in tu sinh tu Phieu DV (loai sua chua) | He thong tu dong khi tao SO khong gan booking | FEAT-BOOK-CREATE, FEAT-SO-CREATE |
| **Lich hen moi** | **Da xac nhan** | Garage xac nhan lich hen | Nguoi dung nhan Xac nhan | FEAT-BOOK-CONFIRM |
| **Lich hen moi** | **Da tu choi** | Garage tu choi lich hen; phai nhap ly do | Nguoi dung nhan Tu choi | FEAT-BOOK-DECLINE |
| **Lich hen moi** | **Da huy** (NO_SHOW) | Lich hen qua han thoi gian quy dinh | He thong tu dong (scheduler) | FEAT-BOOK-LIST |
| **Da xac nhan** | **Xe da den** | Xe khach hang den garage | Nguoi dung nhan Xe da den | FEAT-BOOK-ARRIVE |
| **Da xac nhan** | **Da huy** (CANCELLED) | Chua co phieu DV lien ket; phai nhap ly do | Nguoi dung nhan Huy | FEAT-BOOK-CANCEL |
| **Da xac nhan** | **Da huy** (NO_SHOW) | Lich hen qua han thoi gian quy dinh | He thong tu dong (scheduler) | FEAT-BOOK-LIST |
| **Da xac nhan** | **Da huy** (CANCELLED) | Khach hang huy tu Driver+ | Su kien tu Driver+ | FEAT-BOOK-CREATE |

**Trang thai ket thuc** (khong co chuyen tiep): **Da tu choi**, **Da huy** (CANCELLED/NO_SHOW), **Xe da den** (chi chuyen sang Phieu DV).

### 3.2 Service Order -- Phieu dich vu xe (SERVICE) Lifecycle

| From | To | Dieu kien | Trigger | Features |
|---|---|---|---|---|
| *(tao moi)* | **Bao gia** | Tao phieu dich vu xe thanh cong | Nguoi dung tao phieu | FEAT-SO-CREATE |
| **Bao gia** | **Dang thuc hien** | Xac nhan bat dau sua chua | Nguoi dung nhan "Dang thuc hien" | FEAT-SO-DETAIL |
| **Bao gia** | **Da tu choi** | Khach hang tu choi bao gia qua Driver+ | Su kien tu Driver+ | FEAT-SO-DETAIL |
| **Bao gia** | **Da huy** | Phai nhap ly do huy | Nguoi dung nhan Huy | FEAT-SO-DETAIL |
| **Dang thuc hien** | **Hoan thanh** | Xac nhan sua chua hoan tat | Nguoi dung nhan "Hoan thanh" | FEAT-SO-DETAIL |
| **Dang thuc hien** | **Da huy** | Phai nhap ly do huy | Nguoi dung nhan Huy | FEAT-SO-DETAIL |
| **Da xac nhan** | **Hoan thanh** | Xac nhan hoan tat (bypass "Dang thuc hien") | Nguoi dung nhan "Hoan thanh" | FEAT-SO-DETAIL |
| **Da xac nhan** | **Da huy** | Phai nhap ly do huy | Nguoi dung nhan Huy | FEAT-SO-DETAIL |
| **Da tu choi** | **Da huy** | Phai nhap ly do huy | Nguoi dung nhan Huy | FEAT-SO-DETAIL |
| **Hoan thanh** | **Da tao quyet toan** | Tao quyet toan thanh cong tu gf-accounting | gf-accounting callback | FEAT-STL-CREATE |
| **Da tao quyet toan** | **Hoan thanh** | Huy quyet toan (chua co thanh toan) | gf-accounting callback (reopen) | FEAT-STL-DETAIL |

### 3.3 Service Order -- Phieu ban le (RETAIL) Lifecycle

| From | To | Dieu kien | Trigger | Features |
|---|---|---|---|---|
| *(tao moi)* | **Bao gia** | Tao phieu ban le thanh cong | Nguoi dung tao phieu | FEAT-SO-SALE-CREATE |
| **Bao gia** | **Da xac nhan** | Xac nhan don hang | Nguoi dung nhan "Xac nhan" | FEAT-SO-SALE-DETAIL |
| **Bao gia** | **Da tu choi** | Khach hang tu choi qua Driver+ | Su kien tu Driver+ | FEAT-SO-SALE-DETAIL |
| **Bao gia** | **Da huy** | Phai nhap ly do huy | Nguoi dung nhan Huy | FEAT-SO-SALE-DETAIL |
| **Da xac nhan** | **Da xuat kho** | Xac nhan hoan thanh don hang (xuat kho) | Nguoi dung nhan "Hoan thanh don hang" | FEAT-SO-SALE-DETAIL |
| **Da xac nhan** | **Da huy** | Phai nhap ly do huy | Nguoi dung nhan Huy | FEAT-SO-SALE-DETAIL |
| **Da xuat kho** | **Da tao quyet toan** | Tao quyet toan thanh cong tu gf-accounting | gf-accounting callback | FEAT-STL-CREATE |
| **Da tao quyet toan** | **Da xuat kho** | Huy quyet toan (chua co thanh toan) | gf-accounting callback (reopen) | FEAT-STL-DETAIL |

### 3.4 Settlement Lifecycle (boundary gf-accounting, reference)

| From | To | Dieu kien | Trigger | Features |
|---|---|---|---|---|
| *(tao moi)* | **Nhap** (DRAFT) | Tao quyet toan thanh cong | Nguoi dung xac nhan tao | FEAT-STL-CREATE |
| **Nhap** | **Da huy** (CANCEL) | Chua co thanh toan tren phieu DV lien ket | Nguoi dung xac nhan huy | FEAT-STL-DETAIL |

### 3.5 Payment Status (thuoc phieu dich vu tren gf-sales)

| From | To | Dieu kien | Features |
|---|---|---|---|
| **Chua thanh toan** | **Thanh toan 1 phan** | Ghi nhan thanh toan < tong tien | FEAT-SO-DETAIL |
| **Chua thanh toan** | **Da thanh toan** | Ghi nhan thanh toan = tong tien | FEAT-SO-DETAIL |
| **Thanh toan 1 phan** | **Da thanh toan** | Ghi nhan them thanh toan du so tien con lai | FEAT-SO-DETAIL |

---

## S4 Permission Rules

| Hanh dong | garage-owner | accountant | Dieu kien |
|---|---|---|---|
| Xem danh sach lich hen | Co | Co | -- |
| Tao lich hen | Co | Co | -- |
| Xem chi tiet lich hen | Co | Co | -- |
| Chinh sua lich hen | Co | Co | Trang thai = "Lich hen moi" hoac "Da xac nhan" |
| Xac nhan lich hen | Co | Co | Trang thai = "Lich hen moi" |
| Xac nhan xe da den | Co | Co | Trang thai = "Da xac nhan" |
| Huy lich hen | Co | Co | Trang thai = "Da xac nhan", chua co phieu DV lien ket |
| Tu choi lich hen | Co | Co | Trang thai = "Lich hen moi" |
| Xem danh sach phieu DV | Co | Co | -- |
| Tao phieu dich vu xe | Co | Co | -- |
| Tao phieu ban le | Co | Co | -- |
| Xem chi tiet phieu DV | Co | Co | -- |
| Chinh sua phieu DV xe | Co | Co | Trang thai = "Bao gia", "Dang thuc hien", "Da xac nhan", "Da tu choi" |
| Chinh sua phieu ban le | Co | Co | Trang thai = "Bao gia", "Da xac nhan" |
| Chuyen trang thai phieu DV | Co | Co | Theo rules chuyen trang thai (S3) |
| Huy phieu DV | Co | Co | Trang thai cho phep huy + nhap ly do bat buoc |
| Gui bao gia Driver+ | Co | Co | Phieu co dich vu/phu tung hoat dong |
| Ghi nhan thanh toan | Co | Co | Trang thai thanh toan = "Chua thanh toan" hoac "Thanh toan 1 phan" |
| In phieu DV / bao gia | Co | Co | -- |
| Xem dashboard | Co | Co | -- |
| Tao quyet toan | Co | Co | Phieu DV o trang thai "Hoan thanh" (xe) hoac "Da xuat kho" (ban le) |
| Huy quyet toan | Co | Co | Phieu DV chua co thanh toan |
| In phieu quyet toan | Co | Co | -- |

> **Ghi chu**: Hai vai tro co quyen tuong duong trong toan bo gf-sales. Khong co ngoai le phan quyen cho bat ky chuc nang nao.

---

## S5 Validation Rules

### 5.1 Booking Validations

| Truong | Rule | Thong bao loi | Features |
|---|---|---|---|
| SDT khach hang | Bat buoc | *(thong bao mac dinh)* | FEAT-BOOK-CREATE, FEAT-BOOK-EDIT |
| Ten khach hang | Bat buoc | *(thong bao mac dinh)* | FEAT-BOOK-CREATE, FEAT-BOOK-EDIT |
| Ngay hen | Bat buoc | *(thong bao mac dinh)* | FEAT-BOOK-CREATE, FEAT-BOOK-EDIT |
| Gio hen | Bat buoc | *(thong bao mac dinh)* | FEAT-BOOK-CREATE, FEAT-BOOK-EDIT |
| Loai dich vu | Bat buoc | *(thong bao mac dinh)* | FEAT-BOOK-CREATE, FEAT-BOOK-EDIT |
| Bien so xe | Khong bat buoc; neu nhap phai dung dinh dang | **"Bien so xe khong dung dinh dang (Vi du chuan: 30A12345)"** | FEAT-BOOK-CREATE, FEAT-BOOK-EDIT |

### 5.2 Service Order -- Sua chua Validations

| Truong | Rule | Thong bao loi | Features |
|---|---|---|---|
| Nhan vien tao phieu | Bat buoc | **"Vui long chon nhan vien tao phieu."** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| Loai dich vu | Bat buoc (Car Spa / Sua chua / Bao duong) | *(thong bao mac dinh)* | FEAT-SO-CREATE |
| SDT khach hang | Bat buoc; phai dung dinh dang | **"Vui long nhap so dien thoai."** / **"So dien thoai khong dung dinh dang"** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| Ten khach hang | Bat buoc | **"Vui long nhap ten khach hang."** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| Hang xe | Bat buoc | **"Vui long chon hang xe."** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| Dong xe | Bat buoc; phu thuoc hang xe | **"Vui long chon dong xe."** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| Bien so xe | Khong bat buoc khi tao; bat buoc khi chinh sua; phai dung dinh dang | **"Vui long nhap bien so xe."** / **"Bien so xe khong dung dinh dang (Vi du chuan: 30A12345)"** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| Cong ty bao hiem | Bat buoc khi toggle bao hiem bat | **"Vui long nhap ten cong ty bao hiem."** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| CK% (chiet khau) | Gia tri 0% - 100% | **"Chiet khau phai trong khoang 0% - 100%"** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| SL (so luong) | Gia tri > 0 | **"So luong phai lon hon 0."** | FEAT-SO-CREATE, FEAT-SO-EDIT |
| So VIN | Khong bat buoc; neu nhap phai hop le | **"So VIN khong hop le"** | FEAT-SO-EDIT |
| Ly do huy phieu | Bat buoc khi huy | **"Vui long nhap ly do huy phieu"** | FEAT-SO-DETAIL |
| So tien thanh toan | Bat buoc; phai hop le; khong vuot so tien con lai | **"Vui long nhap so tien thanh toan."** / **"So tien thanh toan khong hop le."** / **"So tien nhap vao lon hon so tien khach can tra."** | FEAT-SO-DETAIL |
| Hinh thuc thanh toan | Bat buoc | **"Vui long chon hinh thuc thanh toan."** | FEAT-SO-DETAIL |

### 5.3 Service Order -- Ban le Validations

| Truong | Rule | Thong bao loi | Features |
|---|---|---|---|
| SDT khach hang | Bat buoc; phai dung dinh dang | **"Vui long nhap so dien thoai."** / **"So dien thoai khong dung dinh dang"** | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| Ten khach hang | Bat buoc | **"Vui long nhap ten khach hang."** | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| Nguoi tao phieu | Bat buoc | **"Vui long chon nhan vien tao phieu."** | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| Danh sach phu tung | It nhat 1 dong phu tung | *(nut luu disabled khi 0 dong)* | FEAT-SO-SALE-CREATE, FEAT-SO-SALE-EDIT |
| Ly do huy phieu | Bat buoc khi huy | **"Vui long nhap ly do huy phieu"** | FEAT-SO-SALE-DETAIL |

### 5.4 Settlement Validations (boundary gf-accounting, reference)

| Truong | Rule | Thong bao loi | Features |
|---|---|---|---|
| Phieu dich vu | Bat buoc | **"Phieu dich vu la bat buoc"** | FEAT-STL-CREATE |
| Tong tien khach tra | Bat buoc; phai hop le | **"So tien quyet toan khong hop le"** | FEAT-STL-CREATE |
| Tong tien bao hiem tra | Bat buoc khi co bao hiem; phai hop le | **"So tien quyet toan khong hop le"** | FEAT-STL-CREATE |

---

## S6 Dependency Rules

| Dependency | Loai | gf-sales role | Mieu ta | Rui ro |
|---|---|---|---|---|
| gf-customer | Upstream (REST) | Consumer | Lay projection khach hang/xe de goi y va snapshot. | Neu gf-customer khong kha dung, khong goi y duoc khach hang/xe; van cho phep nhap thu cong. |
| gf-erp-mdm | Upstream (REST cached) | Consumer | Lay danh muc dich vu, phu tung, hang/dong xe. | Neu gf-erp-mdm khong kha dung, khong load duoc danh muc dich vu/phu tung. |
| gf-hrms | Upstream (REST) | Consumer | Lay danh sach nhan vien (truong "Nhan vien tao phieu", "Nguoi thuc hien"). | Neu gf-hrms khong kha dung, khong chon duoc nhan vien. |
| gf-inventory | Downstream (Kafka) | Producer | Gui event xuat kho khi phieu DV co phu tung nguon INVENTORY. | Thong qua transactional outbox; gf-inventory xu ly async. |
| gf-accounting | Downstream (REST callback) | Consumer/Producer | gf-sales gui snapshot khi tao quyet toan; nhan callback settle/reopen. | Neu gf-accounting khong kha dung, khong tao duoc quyet toan. |
| Driver+ (external) | Bidirectional (Kafka) | Consumer/Producer | Nhan lich hen, huy, tu choi bao gia tu Driver+; gui phan hoi, bao gia. | Consumer phai filter MessageGroup + MessageStep. Su kien bi mat = lich hen khong duoc tao/cap nhat. |
| agg-garage-graph | Gateway (GraphQL/REST) | Provider | Nhan moi request tu frontend qua BFF. | Mo moi endpoint moi phai co tuong ung trong BFF. |
| gf-worker | Upstream (scheduler) | Consumer | Scheduler goi gf-sales de tu dong huy lich hen qua han (NO_SHOW). | Neu scheduler khong hoat dong, lich hen qua han khong bi tu dong huy. |

---

## S7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

| # | Phat hien | Chi tiet | Muc do |
|---|---|---|---|
| C-1 | **Bien so xe: bat buoc khac nhau giua tao va sua phieu DV xe** | FEAT-SO-CREATE: Bien so xe khong bat buoc. FEAT-SO-EDIT AC-13: Bien so xe bat buoc (co error message "Vui long nhap bien so xe."). Khi nguoi dung tao phieu khong nhap bien so -> khi chinh sua bi bat buoc -> confusing UX. | MEDIUM |
| C-2 | **Trang thai thanh toan: khac nhau giua SO va STL** | Phieu DV (gf-sales) co 3 trang thai thanh toan: "Chua thanh toan", "Thanh toan 1 phan", "Da thanh toan". Phieu quyet toan (gf-accounting) co 4 trang thai: them "Cho thanh toan". Can lam ro moi quan he giua 2 bo trang thai nay. | LOW |
| C-3 | **Trang thai "Hoat dong" trong STL vs "Nhap" (DRAFT)** | EP-SETTLEMENT ghi phieu quyet toan khoi tao o trang thai "Nhap" (DRAFT). FEAT-STL-LIST hien thi trang thai la "Hoat dong". Can thong nhat ten hien thi: "Hoat dong" = "Nhap" (DRAFT). | LOW |

### 7.2 Missing rules

| # | Phat hien | Chi tiet | De xuat |
|---|---|---|---|
| M-1 | **Thieu quy tac thoi gian qua han booking** | BR-BOOK-017 ghi nhan "qua han thoi gian quy dinh" nhung khong xac dinh cu the bao lau (1 ngay? 2 ngay? configurable?). | Can Business Authority xac dinh thoi gian qua han cu the hoac co che cau hinh. |
| M-2 | **Thieu validation toi da hinh anh booking** | FEAT-BOOK-CREATE cho phep tai nhieu anh cung luc nhung khong quy dinh gioi han so luong hoac dung luong toi da. | Can bo sung BR gioi han so luong anh va dung luong toi da (vi du: MAX_BOOKING_IMAGES). |
| M-3 | **Thieu quy tac dong thoi (concurrency)** | Nhieu nguoi co the chinh sua cung 1 phieu dich vu dong thoi. Chi FEAT-SO-SALE-EDIT EC co de cap "phieu da bi thay doi trang thai trong luc chinh sua". | Can bo sung optimistic locking rule (version check) cho tat ca entity update. |
| M-4 | **Thieu quy tac xoa phu tung lien ket xuat kho** | FEAT-SO-EDIT EC-1 de cap "xoa phu tung co the anh huong phieu xuat kho lien ket" nhung khong co BR cu the. | Can Business Authority xac dinh: cho phep xoa hay chan? Neu cho phep, phieu xuat kho xu ly the nao? |
| M-5 | **Thieu quy tac ve don vi tien te va lam tron** | Cac phep tinh thanh tien, tong tien, thanh toan khong de cap don vi tien te va quy tac lam tron. | Can bo sung BR ve don vi tien te (VND) va quy tac lam tron (0 decimal cho VND). |
| M-6 | **Thieu quy tac gioi han so dong dich vu/phu tung** | Khong co gioi han toi da so dong dich vu hoac phu tung tren 1 phieu. | Can danh gia co can gioi han hay khong de tranh performance issue. |
| M-7 | **Thieu quy tac ly do huy booking** | FEAT-BOOK-CANCEL yeu cau nhap ly do nhung khong xac dinh ly do co bat buoc khong (truong co the bo trong?). So sanh: FEAT-SO-DETAIL AC-23 xac dinh ly do huy phieu DV la bat buoc. | Can xac nhan ly do huy booking co bat buoc hay khong. |

### 7.3 De xuat cai tien

| # | De xuat | Ly do | Uu tien |
|---|---|---|---|
| P-1 | **Thong nhat truong bat buoc bien so xe** giua tao va sua phieu DV xe. | Tranh confusing UX khi tao khong bat buoc nhung sua bat buoc (C-1). | MEDIUM |
| P-2 | **Dinh nghia thoi gian qua han booking** co the cau hinh theo garage (M-1). | Moi garage co nhu cau khac nhau ve thoi gian cho. | HIGH |
| P-3 | **Bo sung optimistic locking** cho booking va service order (M-3). | Tranh mat du lieu khi nhieu nguoi chinh sua dong thoi. Hien chi FEAT-SO-SALE-EDIT de cap edge case nay. | HIGH |
| P-4 | **Bo sung don vi tien te va quy tac lam tron** vao BR (M-5). | Dam bao tinh nhat quan khi tinh toan tai chinh. | MEDIUM |
| P-5 | **Lam ro moi quan he trang thai thanh toan** giua phieu DV (gf-sales) va phieu quyet toan (gf-accounting) (C-2). | Hien tai 2 boundary co bo trang thai thanh toan khac nhau, gay khong nhat quan. | MEDIUM |

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Initial gf-sales business rules -- tong hop tu 4 EP (BOOKING, SERVICE-ORDER, SETTLEMENT, DASHBOARD), 19 FEAT (8 booking, 7 SO, 3 STL, 1 dashboard). 9 cross-boundary rules, 83 domain rules, 3 lifecycle diagrams, permission matrix, validation registry, 7 missing rules, 5 de xuat cai tien. | Business Authority |
