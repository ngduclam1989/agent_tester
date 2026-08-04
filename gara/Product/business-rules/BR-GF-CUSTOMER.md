---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-customer"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules -- gf-customer

> Boundary nay so huu domain: Khach hang (master), Xe & lich su xe, Phan khuc khach hang.

---

## S1 Cross-boundary Rules

| BR ID | Rule | Boundary lien quan | Features |
|---|---|---|---|
| BR-CUST-CROSS-001 | `gf-customer` la master data cho khach hang va xe. `gf-sales` chi giu projection read-only -- khong duoc modify projection nhu master data. | `gf-sales` | Tat ca FEAT-CUST-*, FEAT-VEH-* |
| BR-CUST-CROSS-002 | Tinh/thanh pho, phuong/xa duoc validate qua danh muc he thong (`gf-erp-mdm`) qua Redis cache. Khong truy van truc tiep DB cua `gf-erp-mdm`. | `gf-erp-mdm` | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| BR-CUST-CROSS-003 | Hang xe, dong xe, phien ban duoc validate qua danh muc he thong (`gf-erp-mdm`). Phan cap hang-dong xe phai hop le. | `gf-erp-mdm` | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| BR-CUST-CROSS-004 | Du lieu lich su dich vu xe (phieu DV, dich vu da thuc hien, phu tung da thay, ghi chu ky thuat) thuoc `gf-sales`, truy xuat qua BFF `agg-garage-graph` -- khong truc tiep DB. | `gf-sales`, `agg-garage-graph` | FEAT-VEH-DETAIL |
| BR-CUST-CROSS-005 | Phan khuc khach hang (`gf-customer`) cung cap du lieu cho chien dich marketing (`gf-marketing`). Giao tiep qua REST API hoac Kafka events -- khong direct DB access. | `gf-marketing` | FEAT-MKT-SEG-LIST, FEAT-MKT-SEG-CREATE, FEAT-MKT-SEG-DETAIL |
| BR-CUST-CROSS-006 | Moi du lieu khach hang, xe, phan khuc deu scoped theo tenant (garage). Tenant isolation bat buoc -- vi pham = data breach. | Tat ca boundaries | Tat ca FEAT |

---

## S2 Rules Registry

### 2.1 Khach hang -- Quy tac chung (BR-CUST-GEN-001..007)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CUST-GEN-001 | Moi khach hang trong mot garage la duy nhat theo so dien thoai. So dien thoai trung -> tu choi tao/cap nhat. | Uniqueness | FEAT-CUST-CREATE, FEAT-CUST-EDIT, FEAT-CUST-IMPORT |
| BR-CUST-GEN-002 | Ma khach hang duoc he thong tu sinh theo dinh dang **KH-{sequence}**, unique theo tenant. Khong cho phep nhap thu cong hoac chinh sua. | Auto-generation | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| BR-CUST-GEN-003 | Trang thai khach hang chi co hai gia tri: **"Dang hoat dong"** va **"Ngung hoat dong"**. Trang thai khoi tao la **"Dang hoat dong"**. | Lifecycle | FEAT-CUST-CREATE, FEAT-CUST-LIST |
| BR-CUST-GEN-004 | Khach hang **"Ngung hoat dong"** co the kich hoat lai ve **"Dang hoat dong"**. Trang thai la soft-delete qua field `is_active` -- khong xoa vat ly du lieu. | Lifecycle | FEAT-CUST-EDIT |
| BR-CUST-GEN-005 | Danh sach khach hang luon duoc pham vi theo garage hien tai -- khong hien thi khach hang cua garage khac. | Tenant scoping | FEAT-CUST-LIST, FEAT-CUST-DETAIL |
| BR-CUST-GEN-006 | Lich su tuong tac duoc ghi nhan tu dong khi khach hang thuc hien cac hoat dong trong he thong (dat lich, su dung dich vu). | Interaction log | FEAT-CUST-DETAIL |
| BR-CUST-GEN-007 | Mot khach hang co the lien ket voi nhieu xe. Moi xe hien thi day du thong tin bao gom thong so bao duong. | Relationship | FEAT-CUST-DETAIL, FEAT-CUST-CREATE, FEAT-CUST-EDIT |

### 2.2 Tao khach hang (BR-CUST-CRE-001..007)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CUST-CRE-001 | So dien thoai khach hang khong duoc trung trong cung mot garage. Neu trung, he thong tu choi tao va thong bao loi. | Uniqueness | FEAT-CUST-CREATE |
| BR-CUST-CRE-002 | Ma khach hang duoc he thong tu sinh theo dinh dang KH-{sequence}, khong cho phep nhap thu cong. | Auto-generation | FEAT-CUST-CREATE |
| BR-CUST-CRE-003 | Tao khach hang tu giao dien yeu cau it nhat mot xe; khi hang xe duoc chon, he thong kiem tra hop le phan cap hang-dong xe qua danh muc he thong. | Mandatory vehicle | FEAT-CUST-CREATE |
| BR-CUST-CRE-004 | Moi yeu cau tao khach hang chi duoc co mot xe chinh. Neu khong chi dinh, xe dau tien mac dinh la xe chinh. | Primary vehicle | FEAT-CUST-CREATE |
| BR-CUST-CRE-005 | So dien thoai phai dung 10 chu so va bat dau bang 0. | Validation | FEAT-CUST-CREATE |
| BR-CUST-CRE-006 | Bien so xe tu dong chuyen thanh chu in hoa, chi chap nhan ky tu chu cai va so. | Normalization | FEAT-CUST-CREATE |
| BR-CUST-CRE-007 | Tinh/thanh pho va phuong/xa (neu co) duoc kiem tra hop le theo danh muc he thong qua cache. | Validation | FEAT-CUST-CREATE |

### 2.3 Chinh sua khach hang (BR-CUST-EDT-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CUST-EDT-001 | So dien thoai khong duoc trung voi khach hang khac trong cung garage. Neu thay doi so dien thoai thanh so da ton tai cho khach hang khac, he thong tu choi cap nhat. | Uniqueness | FEAT-CUST-EDIT |
| BR-CUST-EDT-002 | Ma khach hang khong cho phep chinh sua -- hien thi chi doc. | Immutable | FEAT-CUST-EDIT |
| BR-CUST-EDT-003 | Moi khach hang chi co mot xe chinh. Khi danh dau xe khac lam xe chinh, xe truoc do tu dong bo danh dau. | Primary vehicle | FEAT-CUST-EDIT |
| BR-CUST-EDT-004 | Bien so xe tu dong chuyen thanh chu in hoa, chi chap nhan ky tu chu cai va so. | Normalization | FEAT-CUST-EDIT |
| BR-CUST-EDT-005 | Tinh/thanh pho va phuong/xa (neu co) duoc kiem tra hop le theo danh muc he thong qua cache. | Validation | FEAT-CUST-EDIT |

### 2.4 Import khach hang (BR-CUST-IMP-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CUST-IMP-001 | So dien thoai khach hang phai dung 10 chu so va bat dau bang so 0. Ban ghi co so dien thoai khong hop le bi danh dau loi trong buoc kiem tra. | Validation | FEAT-CUST-IMPORT |
| BR-CUST-IMP-002 | Moi khach hang trong mot garage la duy nhat theo so dien thoai. Khi import, cac ban ghi co so dien thoai trung voi khach hang da ton tai duoc tu dong bo qua (skip duplicates). | Dedup | FEAT-CUST-IMPORT |
| BR-CUST-IMP-003 | File import phai dung dinh dang .xlsx theo mau file **"Mau file danh sach khach hang.xlsx"** do he thong cung cap. | Format | FEAT-CUST-IMPORT |
| BR-CUST-IMP-004 | Du lieu import bao gom cac truong: ho va ten, so dien thoai, email, ngay sinh, gioi tinh, dia chi, tinh/thanh pho, phuong/xa, nguon khach hang, ghi chu. Trong do ho va ten va so dien thoai la bat buoc. | Required fields | FEAT-CUST-IMPORT |

### 2.5 Danh sach khach hang (BR-CUST-LST-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CUST-LST-001 | Danh sach khach hang luon duoc pham vi theo garage hien tai -- khong hien thi khach hang cua garage khac. | Tenant scoping | FEAT-CUST-LIST |
| BR-CUST-LST-002 | Tim kiem tu khoa ap dung dong thoi cho ten va so dien thoai khach hang. | Search | FEAT-CUST-LIST |
| BR-CUST-LST-003 | Trang thai khach hang chi co hai gia tri: **"Dang hoat dong"** va **"Ngung hoat dong"**. | Display | FEAT-CUST-LIST |
| BR-CUST-LST-004 | File mau import **"Mau file danh sach khach hang.xlsx"** phai luon kha dung de tai xuong tu man hinh danh sach. | Availability | FEAT-CUST-LIST |

### 2.6 Chi tiet khach hang (BR-CUST-DTL-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-CUST-DTL-001 | Thong tin khach hang tren man hinh chi tiet luon duoc pham vi theo garage hien tai -- khong hien thi khach hang cua garage khac. | Tenant scoping | FEAT-CUST-DETAIL |
| BR-CUST-DTL-002 | Mot khach hang co the lien ket voi nhieu xe. Moi xe hien thi day du thong tin bao gom thong so bao duong. | Relationship | FEAT-CUST-DETAIL |
| BR-CUST-DTL-003 | Lich su tuong tac duoc ghi nhan tu dong khi khach hang thuc hien cac hoat dong trong he thong (dat lich, su dung dich vu). | Interaction log | FEAT-CUST-DETAIL |
| BR-CUST-DTL-004 | Thong tin xe bao gom thong so bao duong (**"So Km bao duong tiep theo"**, **"Chu ky bao duong (Km)"**, **"Chu ky bao duong (Thang)"**, **"Ngay bao duong tiep theo"**) phuc vu theo doi lich bao duong dinh ky. | Maintenance | FEAT-CUST-DETAIL |

### 2.7 Xe -- Danh sach (BR-VEH-LST-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-VEH-LST-001 | Danh sach xe luon duoc pham vi theo garage hien tai -- khong hien thi xe cua garage khac. | Tenant scoping | FEAT-VEH-LIST |
| BR-VEH-LST-002 | Tim kiem tu khoa ap dung dong thoi cho bien so va ten khach hang. | Search | FEAT-VEH-LIST |
| BR-VEH-LST-003 | Bo loc **"Hang xe & Dong xe"** la bo loc ket hop -- danh sach dong xe phu thuoc vao hang xe da chon. | Filter | FEAT-VEH-LIST |
| BR-VEH-LST-004 | Xuat file Excel ap dung cac dieu kien tim kiem va loc dang hien thi -- khong phai toan bo du lieu xe. | Export | FEAT-VEH-LIST |

### 2.8 Xe -- Chi tiet (BR-VEH-DTL-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-VEH-DTL-001 | Thong tin xe tren man hinh chi tiet luon duoc pham vi theo garage hien tai -- khong hien thi xe cua garage khac. | Tenant scoping | FEAT-VEH-DETAIL |
| BR-VEH-DTL-002 | Tab **"Tong quan"** chi hien thi toi da 5 phieu dich vu gan nhat lien ket voi xe. | Display limit | FEAT-VEH-DETAIL |
| BR-VEH-DTL-003 | Du lieu dich vu da thuc hien, phu tung da thay va ghi chu ky thuat duoc tong hop tu cac phieu dich vu da hoan thanh lien ket voi xe -- du lieu nguon thuoc `gf-sales`, truy xuat qua BFF. | Cross-boundary read | FEAT-VEH-DETAIL |
| BR-VEH-DTL-004 | Ghi chu ky thuat duoc tong hop tu dong tu cac phieu dich vu -- khong cho phep tao hoac chinh sua ghi chu truc tiep tren man hinh chi tiet xe. | Read-only | FEAT-VEH-DETAIL |
| BR-VEH-DTL-005 | Ma phieu DV trong tab **"Ghi chu ky thuat"** la lien ket dieu huong -- cho phep truy nguoc den phieu dich vu goc de xem day du ngu canh. | Navigation | FEAT-VEH-DETAIL |

### 2.9 Phan khuc khach hang (BR-MKT-SEG-001..010)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-SEG-001 | Danh sach phan khuc luon duoc pham vi theo garage hien tai -- khong hien thi phan khuc cua garage khac. | Tenant scoping | FEAT-MKT-SEG-LIST |
| BR-MKT-SEG-002 | Trang thai phan khuc co ba gia tri: **"Dang hoat dong"**, **"Dang xu ly"**, **"Ngung hoat dong"**. | Lifecycle | FEAT-MKT-SEG-LIST |
| BR-MKT-SEG-003 | Khong cho phep cap nhat trang thai sang **"Dang xu ly"** tu giao dien -- trang thai nay chi duoc he thong tu dong chuyen khi dang danh gia phan khuc. | System-only state | FEAT-MKT-SEG-LIST |
| BR-MKT-SEG-004 | Ten phan khuc phai khong trung trong pham vi garage hien tai. | Uniqueness | FEAT-MKT-SEG-CREATE |
| BR-MKT-SEG-005 | Sau khi tao, he thong tu dong kich hoat quy trinh danh gia phan khuc bat dong bo (qua Temporal workflow) de xac dinh danh sach khach hang phu hop. | Auto-evaluation | FEAT-MKT-SEG-CREATE |
| BR-MKT-SEG-006 | Cac tieu chi duoc ket hop theo dieu kien AND -- khach hang phai thoa man tat ca tieu chi de thuoc phan khuc. | Criteria logic | FEAT-MKT-SEG-CREATE |
| BR-MKT-SEG-007 | Xem truoc khach hang la dry-run -- khong luu ket qua vao he thong. | Preview | FEAT-MKT-SEG-CREATE |
| BR-MKT-SEG-008 | Khi chay lai phan khuc, he thong xoa toan bo membership hien tai va danh gia lai tu dau theo tieu chi da cau hinh. | Re-evaluation | FEAT-MKT-SEG-DETAIL |
| BR-MKT-SEG-009 | Trong qua trinh danh gia, trang thai phan khuc chuyen sang **"Dang xu ly"** va tu dong chuyen ve **"Dang hoat dong"** khi hoan thanh. | Auto-transition | FEAT-MKT-SEG-DETAIL |
| BR-MKT-SEG-010 | Khong cho phep chay lai hoac chinh sua phan khuc neu phan khuc dang lien ket voi chien dich chua hoan thanh. | Dependency guard | FEAT-MKT-SEG-DETAIL |

---

## S3 Status Transition Rules

### 3.1 Khach hang

```
  +------------------+
  |    Tao moi       |
  |  (Create)        |
  +--------+---------+
           |
           v
  +------------------+         +------------------+
  | Dang hoat dong   |------->| Ngung hoat dong  |
  |   (is_active     |  Ngung |   (is_active     |
  |    = true)       |        |    = false)       |
  +------------------+        +------------------+
           ^                           |
           |       Kich hoat lai       |
           +---------------------------+
```

| Trang thai hien tai | Hanh dong | Trang thai moi | Dieu kien |
|---|---|---|---|
| _(chua ton tai)_ | Tao khach hang | **"Dang hoat dong"** | Ho va ten + So dien thoai hop le, SĐT khong trung trong garage |
| **"Dang hoat dong"** | Ngung hoat dong | **"Ngung hoat dong"** | Khong co dieu kien dac biet |
| **"Ngung hoat dong"** | Kich hoat lai | **"Dang hoat dong"** | Khong co dieu kien dac biet |

**Ghi chu:** Khong co trang thai xoa vat ly. Tat ca la soft-delete qua field `is_active`.

### 3.2 Xe

Xe **khong co vong doi trang thai rieng**. Xe la thuc the con cua khach hang (`CustomerVehicle`) -- duoc tao, chinh sua va xoa trong luong quan ly khach hang (`EP-CUSTOMER`).

### 3.3 Phan khuc khach hang

| Trang thai hien tai | Hanh dong | Trang thai moi | Dieu kien |
|---|---|---|---|
| _(chua ton tai)_ | Tao phan khuc | **"Dang xu ly"** | Ten phan khuc khong trung trong garage |
| **"Dang xu ly"** | He thong hoan thanh danh gia | **"Dang hoat dong"** | Tu dong (Temporal workflow) |
| **"Dang hoat dong"** | Ngung hoat dong | **"Ngung hoat dong"** | Khong dang lien ket chien dich chua hoan thanh |
| **"Ngung hoat dong"** | Kich hoat lai | **"Dang hoat dong"** | Khong co dieu kien dac biet |
| **"Dang hoat dong"** | Chay lai | **"Dang xu ly"** | Khong dang lien ket chien dich chua hoan thanh |

**Ghi chu:** Trang thai **"Dang xu ly"** chi duoc he thong tu dong chuyen -- nguoi dung khong the chon trang thai nay tu giao dien.

---

## S4 Permission Rules

| Hanh dong | Chu garage (garage-owner) | Ke toan (accountant) | Dieu kien |
|---|---|---|---|
| Xem danh sach khach hang | Co | Co | -- |
| Tao khach hang | Co | Co | -- |
| Xem chi tiet khach hang | Co | Co | -- |
| Chinh sua khach hang | Co | Co | -- |
| Import khach hang | Co | Co | -- |
| Xem danh sach xe | Co | Co | -- |
| Xem chi tiet xe | Co | Co | -- |
| Xuat file danh sach xe | Co | Co | -- |
| Xem danh sach phan khuc | Co | Co | -- |
| Tao phan khuc | Co | Co | -- |
| Xem chi tiet phan khuc | Co | Co | -- |
| Chay lai phan khuc | Co | Co | Phan khuc khong dang o **"Dang xu ly"** va khong lien ket chien dich chua hoan thanh |
| Thay doi trang thai phan khuc | Co | Co | Phan khuc khong dang o **"Dang xu ly"** |
| Xem nhom chat theo xe | Co | **KHONG** | Day la ngoai le phan quyen duy nhat trong toan he thong |

**Ghi chu:** Ngoai tru nhom chat theo xe (thuoc `EP-SUPPORT`, ngoai pham vi boundary nay), ke toan co quyen tuong duong chu garage trong moi chuc nang cua `gf-customer`.

---

## S5 Validation Rules

### 5.1 Khach hang -- Thong tin co ban

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Ho va ten"** | Bat buoc, khong duoc de trong | **"Vui long nhap ho va ten."** | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"So dien thoai"** | Bat buoc, dung 10 chu so, bat dau bang 0 | **"Vui long nhap so dien thoai."** | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"So dien thoai"** | Khong trung trong cung garage | _(thong bao so dien thoai da duoc su dung boi khach hang khac)_ | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Email"** | Khong bat buoc | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Ngay sinh"** | Khong bat buoc | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Gioi tinh"** | Khong bat buoc. Gia tri: Nam, Nu, Khac | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Trang thai"** | Bat buoc. Mac dinh: **"Dang hoat dong"** | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Ghi chu"** | Khong bat buoc | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Tag"** | Khong bat buoc. Moi tag tao khi nhan Enter | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |

### 5.2 Khach hang -- Thong tin dia chi

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Tinh/Thanh pho"** | Khong bat buoc. Validate qua danh muc he thong (cache) | Loi validation neu khong tim thay trong danh muc | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Phuong/Xa"** | Khong bat buoc. Validate qua danh muc he thong (cache) | Loi validation neu khong tim thay trong danh muc | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Dia chi"** | Khong bat buoc | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |

### 5.3 Xe

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Bien so"** | Khong bat buoc. Tu dong chuyen chu in hoa. Chi chap nhan chu cai va so. | **"Bien so xe khong dung dinh dang (Vi du chuan: 30A12345)"** | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"So VIN"** | Khong bat buoc | **"So VIN khong hop le"** | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"So may"** | Khong bat buoc | **"So may khong hop le"** | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Hang xe"** | Khong bat buoc. Validate qua danh muc he thong | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Dong xe"** | Khong bat buoc. Phu thuoc hang xe. Validate phan cap hang-dong xe | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Phien ban"** | Khong bat buoc. Phu thuoc dong xe | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Nam san xuat"** | Khong bat buoc | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"So Km gan nhat"** | Khong bat buoc. Kieu so | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"So Km bao duong tiep theo"** | Khong bat buoc. Kieu so | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Chu ky bao duong (Km)"** | Khong bat buoc. Kieu so | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Chu ky bao duong (Thang)"** | Khong bat buoc. Kieu so | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Ngay bao duong tiep theo"** | Khong bat buoc. Date picker | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |
| **"Xe chinh"** | Mac dinh xe dau tien la xe chinh. Chi mot xe chinh tai moi thoi diem | -- | FEAT-CUST-CREATE, FEAT-CUST-EDIT |

### 5.4 Import khach hang

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| File | Phai dung dinh dang .xlsx | Toast **"Loi"** khi file khong dung dinh dang | FEAT-CUST-IMPORT |
| **"Ho va ten"** (trong file) | Bat buoc | Danh dau **"Khong hop le"** tai cot **"Loi"** | FEAT-CUST-IMPORT |
| **"So dien thoai"** (trong file) | Bat buoc, 10 chu so, bat dau bang 0 | Danh dau **"Khong hop le"** tai cot **"Loi"** | FEAT-CUST-IMPORT |

### 5.5 Phan khuc khach hang

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Ten phan khuc"** | Bat buoc. Khong trung trong garage | **"Vui long nhap ten phan khuc"** | FEAT-MKT-SEG-CREATE |
| **"Mo ta"** | Khong bat buoc | -- | FEAT-MKT-SEG-CREATE |
| **"Tieu chi"** (khi them) | Bat buoc chon loai tieu chi | **"Vui long chon tieu chi"** / **"Tieu chi khong hop le"** | FEAT-MKT-SEG-CREATE |
| **"Chi tieu"** (truong con) | Nhap chi tieu tu hoac chi tieu den | **"Vui long nhap chi tieu tu hoac chi tieu den"** | FEAT-MKT-SEG-CREATE |
| **"Thoi gian dang ky"** (truong con) | Chon tu ngay va den ngay | **"Vui long chon tu ngay va den ngay"** | FEAT-MKT-SEG-CREATE |
| **"Tinh/Thanh pho"** (truong con) | Chon it nhat mot | **"Vui long chon it nhat mot Tinh/Thanh pho"** | FEAT-MKT-SEG-CREATE |
| **"Thong tin xe -- Hang xe"** (truong con) | Bat buoc chon it nhat mot hang xe | **"Vui long chon it nhat mot Hang xe"** | FEAT-MKT-SEG-CREATE |
| **"Khach con hoat dong trong"** (truong con) | Nhap so ngay | **"Vui long nhap so ngay khong hoat dong"** | FEAT-MKT-SEG-CREATE |
| **"So luot booking tu"** (truong con) | Nhap so luot | **"Vui long nhap so luot booking"** | FEAT-MKT-SEG-CREATE |

---

## S6 Dependency Rules

| Dependency | Mo ta | Anh huong |
|---|---|---|
| `gf-erp-mdm` -> `gf-customer` | Danh muc tinh/thanh pho, phuong/xa, hang xe, dong xe, phien ban phai kha dung qua cache. | Neu cache khong kha dung, form tao/sua khach hang khong validate duoc dia chi va thong tin xe. |
| `gf-customer` -> `gf-sales` (projection) | `gf-sales` giu projection customer/vehicle. Khi tao/sua/xoa khach hang hoac xe, phai sync projection. | Projection la read-only cache tai `gf-sales`. Khong duoc modify projection nhu master data. |
| `gf-customer` -> `gf-marketing` (segment data) | Phan khuc khach hang cung cap du lieu cho chien dich marketing. | Khi chien dich dang chay, khong cho phep chay lai hoac chinh sua phan khuc lien ket. |
| `gf-sales` -> `gf-customer` (vehicle history) | Lich su dich vu xe, phu tung da thay, ghi chu ky thuat lay tu `gf-sales` qua BFF. | Neu `gf-sales` khong kha dung, tab Tong quan / Dich vu / Phu tung / Ghi chu tren chi tiet xe hien thi loi. |
| Temporal -> `gf-customer` (segment evaluation) | Temporal workflow danh gia phan khuc bat dong bo. | Neu Temporal khong kha dung, phan khuc mac o trang thai **"Dang xu ly"**. |

---

## S7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

1. **Overlap BR-CUST-GEN-001 vs BR-CUST-CRE-001 vs BR-CUST-EDT-001**: Ca ba rule deu noi ve uniqueness so dien thoai trong cung garage. De xuat: giu BR-CUST-GEN-001 lam quy tac tong, BR-CUST-CRE-001 va BR-CUST-EDT-001 reference nguoc ve BR-CUST-GEN-001.

2. **Overlap BR-CUST-GEN-002 vs BR-CUST-CRE-002 vs BR-CUST-EDT-002**: Quy tac ve ma khach hang KH-{sequence} duoc lap lai o nhieu noi. De xuat: hieu nhu cach 1 -- giu GEN lam master, CRE/EDT reference.

3. **Overlap BR-CUST-CRE-006 vs BR-CUST-EDT-004**: Bien so xe tu dong chuyen chu in hoa -- cung mot quy tac ap dung cho ca tao va sua. Co the gop chung thanh BR-VEH-GEN voi scope rong hon.

### 7.2 Missing rules

1. **WARN -- Bien so xe khong unique toan cuc**: FEAT-CUST-CREATE EC-2 ghi nhan bien so xe da ton tai cho khach hang khac duoc cho phep tao, chi hien thi canh bao. Tuy nhien **khong co Business Rule chinh thuc** quy dinh hanh vi nay. De xuat Business Authority xac nhan: bien so xe co nen unique theo garage khong?

2. **WARN -- Xoa xe dang lien ket booking/SO**: FEAT-CUST-EDIT EC-1 de cap viec xoa xe tren form chinh sua co the bi tu choi khi xe dang duoc tham chieu boi lich hen hoac phieu dich vu. Tuy nhien **khong co Business Rule chinh thuc** quy dinh dieu kien nay. De xuat bo sung BR-CUST-EDT-006.

3. **WARN -- File mau import khong co specification**: BR-CUST-IMP-003 chi yeu cau file .xlsx dung mau, nhung khong quy dinh cau truc cot cu the cua file mau. De xuat bo sung specification cau truc file mau.

4. **WARN -- Import: duplicate trong cung file**: FEAT-CUST-IMPORT EC-3 de cap nhieu ban ghi trong cung file co so dien thoai trung nhau -- xu ly theo thu tu va bo qua ban ghi trung. Nhung khong co BR chinh thuc. De xuat bo sung BR-CUST-IMP-005.

5. **WARN -- Export xe: phan quyen**: FEAT-VEH-LIST co NEED CLARIFICATION ve thong bao **"Ban khong co quyen xuat file Excel."** trong KG. Can Business Authority xac nhan: co vai tro nao bi gioi han xuat file khong?

6. **WARN -- Email validation**: Truong email khong bat buoc nhung cung khong co quy tac validation dinh dang email khi nguoi dung nhap. De xuat bo sung BR-CUST-GEN-008 quy dinh dinh dang email hop le.

7. **WARN -- Phan khuc: khong co Edit feature**: Hien tai chi co FEAT-MKT-SEG-CREATE va FEAT-MKT-SEG-DETAIL (chay lai). Khong co FEAT-MKT-SEG-EDIT de chinh sua ten, mo ta hoac tieu chi cua phan khuc da tao. Can xac nhan day la co y hay la missing feature.

### 7.3 De xuat cai tien

1. **Gop Validation Rules thanh shared module**: Nhieu validation rules (so dien thoai 10 so, bien so xe, tinh/thanh pho) duoc dung o ca tao, sua, import. De xuat tach thanh shared validation utility de dam bao tinh nhat quan.

2. **Bo sung BR cho cascade behavior khi ngung hoat dong khach hang**: Khi chuyen khach hang sang **"Ngung hoat dong"**, cac booking/SO dang mo co bi anh huong khong? Can quy dinh ro.

3. **Bo sung BR cho kich hoat lai khach hang**: Hien tai chi co trang thai chuyen doi nhung khong co dieu kien. De xuat xem xet co can rang buoc gi khi kich hoat lai (vi du: xac nhan so dien thoai con hop le).

4. **Lam ro hanh vi khi thay doi hang xe trong form sua**: FEAT-CUST-EDIT EC-2 ghi nhan khi thay doi hang xe thi dong xe va phien ban duoc reset. De xuat nang len thanh BR chinh thuc (BR-CUST-EDT-006 hoac BR-VEH-GEN-001).

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khoi tao business rules tu 7 FEAT (CUST-LIST/CREATE/DETAIL/EDIT/IMPORT, VEH-LIST/DETAIL) + 3 FEAT phan khuc (MKT-SEG-LIST/CREATE/DETAIL) + 3 EP (CUSTOMER, VEHICLE, MARKETING). Tong cong 46 BR chinh thuc, 7 WARN can clarification. | Business Authority |
