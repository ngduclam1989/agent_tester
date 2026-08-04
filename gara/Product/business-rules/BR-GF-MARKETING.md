---
type: business-rules
artifact_kind: business-rules
status: ACTIVE
version: 1
tier: T1
owner_authority: Business Authority
boundary: "gf-marketing"
last_reviewed: "2026-05-20"
supersedes: "none"
---

# Business Rules -- gf-marketing

> Boundary nay so huu domain: Chien dich marketing, Chuong trinh voucher, Mau tin nhan, QR va Temporal workflows cho gui tin tu dong.
> **Luu y:** Phan khuc khach hang (Segment) thuoc boundary `gf-customer` -- xem BR-GF-CUSTOMER.md S2.9.

---

## S1 Cross-boundary Rules

| BR ID | Rule | Boundary lien quan | Features |
|---|---|---|---|
| BR-MKT-CROSS-001 | Chien dich marketing su dung du lieu phan khuc khach hang tu `gf-customer`. Giao tiep qua REST API -- khong direct DB access. | `gf-customer` | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |
| BR-MKT-CROSS-002 | Gui tin nhan (SMS, push, Zalo, email) tu chien dich duoc chuyen qua `gf-notification` qua Kafka events. `gf-marketing` khong gui truc tiep. | `gf-notification` | FEAT-MKT-CAMP-DETAIL |
| BR-MKT-CROSS-003 | Chuong trinh voucher co the duoc lien ket voi chien dich. Khi chien dich chua hoan thanh hoac chua huy, khong cho phep huy hoac tam dung chuong trinh voucher lien ket. | Internal (campaign <-> voucher) | FEAT-MKT-VOUC-DETAIL, FEAT-MKT-CAMP-CREATE |
| BR-MKT-CROSS-004 | Phan khuc dang lien ket voi chien dich chua hoan thanh khong duoc chinh sua hoac chay lai -- rang buoc nay thuoc `gf-customer` nhung triggered boi trang thai chien dich trong `gf-marketing`. | `gf-customer` | FEAT-MKT-SEG-DETAIL |
| BR-MKT-CROSS-005 | Moi du lieu chien dich, voucher deu scoped theo tenant (garage). Tenant isolation bat buoc -- vi pham = data breach. | Tat ca boundaries | Tat ca FEAT |
| BR-MKT-CROSS-006 | Gui message bi gioi han hang thang theo tung kenh cho moi garage. He thong hien thi **"So luong toi da"** va **"Da su dung"** cho moi kenh. Thong tin gioi han lay tu `gf-notification` qua `GetNotificationLimits`. | `gf-notification` | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-DETAIL |

---

## S2 Rules Registry

### 2.1 Chien dich -- Quy tac chung (BR-MKT-CAMP-GEN-001..006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-CAMP-GEN-001 | Danh sach chien dich luon duoc pham vi theo garage hien tai -- khong hien thi chien dich cua garage khac. | Tenant scoping | FEAT-MKT-CAMP-LIST |
| BR-MKT-CAMP-GEN-002 | Ma chien dich duoc he thong tu sinh theo dinh dang **CAMP_{NNNNN}**, khong cho phep nhap thu cong hoac chinh sua. | Auto-generation | FEAT-MKT-CAMP-LIST, FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-GEN-003 | Trang thai chien dich co sau gia tri: **"Nhap"**, **"Da len lich"**, **"Dang chay"**, **"Tam dung"**, **"Hoan thanh"**, **"Da huy"**. | Lifecycle | FEAT-MKT-CAMP-LIST, FEAT-MKT-CAMP-DETAIL |
| BR-MKT-CAMP-GEN-004 | Loai chien dich co ba gia tri: **"Chay 1 lan"**, **"Lap lai theo lich"**, **"Tu dong theo su kien"**. | Classification | FEAT-MKT-CAMP-LIST, FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-GEN-005 | Chi cho phep xoa chien dich o trang thai **"Nhap"**. | Deletion guard | FEAT-MKT-CAMP-LIST |
| BR-MKT-CAMP-GEN-006 | Chi cho phep chinh sua chien dich khi o trang thai **"Nhap"**. Cac trang thai khac khong cho phep chinh sua. | Edit guard | FEAT-MKT-CAMP-EDIT |

### 2.2 Tao chien dich (BR-MKT-CAMP-CRE-001..006)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-CAMP-CRE-001 | Chien dich khi tao moi co trang thai mac dinh la **"Nhap"**. Ma chien dich duoc he thong tu sinh theo dinh dang CAMP_{NNNNN}. | Initialization | FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-CRE-002 | Loai chien dich **"Chay 1 lan"** yeu cau bat buoc co giai doan, ngay bat dau va phan khuc. | Type-specific required | FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-CRE-003 | Loai chien dich **"Tu dong theo su kien"** yeu cau bat buoc chon su kien kich hoat. Cac su kien ho tro: **"Sinh nhat khach hang"**, **"Hoan thanh booking"**, **"Den han bao duong"**, **"Khach lau khong quay lai"**. | Type-specific required | FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-CRE-004 | Loai chien dich **"Lap lai theo lich"** yeu cau cau hinh tan suat lap lai: **"Hang ngay"**, **"Hang tuan"** (chon thu), **"Hang thang"** (chon ngay), kem gio gui. | Type-specific required | FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-CRE-005 | Neu chien dich lien ket chuong trinh voucher, chuong trinh do phai o trang thai **"Hoat dong"** khi khoi chay. | Dependency | FEAT-MKT-CAMP-CREATE |
| BR-MKT-CAMP-CRE-006 | Su kien **"Khach lau khong quay lai"** yeu cau nhap so ngay. So ngay phai lon hon 0. | Event-specific | FEAT-MKT-CAMP-CREATE |

### 2.3 Chi tiet chien dich (BR-MKT-CAMP-DTL-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-CAMP-DTL-001 | Chien dich chi chuyen trang thai theo quy tac: **"Nhap"** -> **"Da len lich"** -> **"Dang chay"** -> **"Hoan thanh"**; **"Dang chay"** -> **"Tam dung"** / **"Da huy"**; **"Tam dung"** -> **"Dang chay"** / **"Da huy"**. Chuyen tu **"Nhap"** hoac **"Tam dung"** sang **"Dang chay"** la hanh dong **"Chay"**. | State machine | FEAT-MKT-CAMP-DETAIL |
| BR-MKT-CAMP-DTL-002 | Ket qua chien dich hien thi so lieu tong hop: da gui, da nhan, that bai -- cap nhat theo thoi gian thuc khi chien dich dang chay. | Analytics | FEAT-MKT-CAMP-DETAIL |
| BR-MKT-CAMP-DTL-003 | Trang thai giai doan co cac gia tri: **"Dang thiet lap"**, **"Da len lich"**, **"Dang chay"**, **"Hoan thanh"**, **"Tam dung"**, **"Da huy"**, **"Bo qua"**. | Wave lifecycle | FEAT-MKT-CAMP-DETAIL |
| BR-MKT-CAMP-DTL-004 | Trang thai message gui co cac gia tri: **"Cho gui"**, **"Dang gui"**, **"Da gui"**, **"Da nhan"**, **"Da mo"**, **"Da click"**, **"That bai"**, **"Loi (bounce)"**. | Message lifecycle | FEAT-MKT-CAMP-DETAIL |

### 2.4 Chinh sua chien dich (BR-MKT-CAMP-EDT-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-CAMP-EDT-001 | Chien dich chi cho phep chinh sua khi o trang thai **"Nhap"**. Cac trang thai khac khong cho phep chinh sua. | Edit guard | FEAT-MKT-CAMP-EDIT |
| BR-MKT-CAMP-EDT-002 | Khi luu, he thong giu nguyen ma chien dich da sinh -- khong cho phep thay doi. | Immutable code | FEAT-MKT-CAMP-EDIT |
| BR-MKT-CAMP-EDT-003 | Neu chien dich lien ket chuong trinh voucher, chuong trinh do phai o trang thai **"Hoat dong"** khi khoi chay. | Dependency | FEAT-MKT-CAMP-EDIT |

### 2.5 Chuong trinh voucher -- Quy tac chung (BR-MKT-VOUC-GEN-001..005)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-VOUC-GEN-001 | Danh sach chuong trinh voucher luon duoc pham vi theo garage hien tai -- khong hien thi chuong trinh cua garage khac. | Tenant scoping | FEAT-MKT-VOUC-LIST |
| BR-MKT-VOUC-GEN-002 | Ma chuong trinh voucher duoc he thong tu sinh theo dinh dang **VP_{NNNNN}**, khong cho phep nhap thu cong hoac chinh sua. | Auto-generation | FEAT-MKT-VOUC-LIST, FEAT-MKT-VOUC-CREATE |
| BR-MKT-VOUC-GEN-003 | Trang thai chuong trinh voucher co nam gia tri: **"Nhap"**, **"Hoat dong"**, **"Het han"**, **"Da huy"**, **"Tam dung"**. | Lifecycle | FEAT-MKT-VOUC-LIST, FEAT-MKT-VOUC-DETAIL |
| BR-MKT-VOUC-GEN-004 | Loai voucher co bon gia tri: **"Giam theo %"**, **"Giam co dinh"**, **"Mien phi dich vu"**, **"Qua tang"**. | Classification | FEAT-MKT-VOUC-LIST, FEAT-MKT-VOUC-CREATE |
| BR-MKT-VOUC-GEN-005 | Chi cho phep xoa chuong trinh voucher o trang thai **"Nhap"**. | Deletion guard | FEAT-MKT-VOUC-LIST |

### 2.6 Tao chuong trinh voucher (BR-MKT-VOUC-CRE-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-VOUC-CRE-001 | Ma chuong trinh voucher duoc he thong tu sinh theo dinh dang VP_{NNNNN} -- khong cho phep nhap thu cong. | Auto-generation | FEAT-MKT-VOUC-CREATE |
| BR-MKT-VOUC-CRE-002 | Ngay ket thuc (**"Den ngay"**) phai sau ngay bat dau (**"Tu ngay"**) va khong duoc truoc thoi diem hien tai. | Date validation | FEAT-MKT-VOUC-CREATE |
| BR-MKT-VOUC-CRE-003 | Khi tao voi trang thai **"Hoat dong"**, he thong kich hoat quy trinh sinh voucher va len lich het han tu dong. | Auto-activation | FEAT-MKT-VOUC-CREATE |
| BR-MKT-VOUC-CRE-004 | So luong voucher phai la so nguyen duong. | Validation | FEAT-MKT-VOUC-CREATE |

### 2.7 Chi tiet chuong trinh voucher (BR-MKT-VOUC-DTL-001..004)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-VOUC-DTL-001 | Chuong trinh voucher chuyen trang thai theo quy tac: **"Nhap"** -> **"Hoat dong"** -> **"Het han"** / **"Da huy"** / **"Tam dung"**; **"Tam dung"** -> **"Hoat dong"** / **"Da huy"**. | State machine | FEAT-MKT-VOUC-DETAIL |
| BR-MKT-VOUC-DTL-002 | Khi kich hoat chuong trinh, he thong sinh pool voucher theo so luong da cau hinh va len lich het han tu dong. | Pool generation | FEAT-MKT-VOUC-DETAIL |
| BR-MKT-VOUC-DTL-003 | Khong cho phep huy hoac tam dung chuong trinh voucher dang lien ket voi chien dich chua hoan thanh hoac chua huy. | Dependency guard | FEAT-MKT-VOUC-DETAIL |
| BR-MKT-VOUC-DTL-004 | Trang thai voucher don le co cac gia tri: **"Da tao, chua phan phoi"**, **"Khach hang da thu thap (QR Scan)"**, **"Da gui cho khach hang qua chien dich Marketing"**, **"Da su dung"**, **"Da het han"**. | Voucher lifecycle | FEAT-MKT-VOUC-DETAIL |

### 2.8 Chinh sua chuong trinh voucher (BR-MKT-VOUC-EDT-001..003)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-MKT-VOUC-EDT-001 | Chuong trinh voucher chi cho phep chinh sua khi o trang thai **"Nhap"**. Cac trang thai khac khong cho phep chinh sua. | Edit guard | FEAT-MKT-VOUC-EDIT |
| BR-MKT-VOUC-EDT-002 | Khi luu, he thong giu nguyen ma chuong trinh da sinh -- khong cho phep thay doi. | Immutable code | FEAT-MKT-VOUC-EDIT |
| BR-MKT-VOUC-EDT-003 | Ngay ket thuc (**"Den ngay"**) phai sau ngay bat dau (**"Tu ngay"**) va khong duoc truoc thoi diem hien tai. | Date validation | FEAT-MKT-VOUC-EDIT |

---

## S3 Status Transition Rules

### 3.1 Chien dich (Campaign)

```
  +------------------+
  |    Tao moi       |
  |  (Create)        |
  +--------+---------+
           |
           v
  +------------------+
  |    Nhap          |-------- Xoa ---------> (xoa vinh vien)
  |   (DRAFT)        |
  +--------+---------+
           |
      Len lich / Chay
           |
           v
  +------------------+
  |  Da len lich     |-------- Huy --------+
  |  (SCHEDULED)     |                     |
  +--------+---------+                     |
           |                               |
      Thuc hien                            |
      (tu dong)                            |
           |                               |
           v                               |
  +------------------+                     |
  | Dang chay        |-------- Huy --------+
  | (IN_PROGRESS)    |                     |
  +----+-------+-----+                     |
       |       |                           |
  Tam dung   Hoan thanh                    |
       |     (tu dong)                     |
       v       |                           |
  +------------------+    |                |
  |  Tam dung        |----+--- Huy --------+
  |  (PAUSED)        |                     |
  +--------+---------+                     |
       |                                   |
   Tiep tuc                               |
   (Chay)                                 |
       |                                   v
       +---------> Dang chay     +------------------+
                                 |     Da huy       |
                                 |   (CANCELLED)    |
                                 +------------------+

                                 +------------------+
                                 |  Hoan thanh      |
                                 |  (COMPLETED)     |
                                 +------------------+
```

| Trang thai hien tai | Hanh dong | Trang thai moi | Dieu kien |
|---|---|---|---|
| _(chua ton tai)_ | Tao chien dich | **"Nhap"** | Ten chien dich bat buoc, loai chien dich da chon |
| **"Nhap"** | Xoa | _(xoa vinh vien)_ | Chi ap dung cho trang thai **"Nhap"** |
| **"Nhap"** | Chay | **"Dang chay"** | Tat ca truong bat buoc da dien, voucher lien ket (neu co) phai **"Hoat dong"** |
| **"Nhap"** | Len lich | **"Da len lich"** | Trang thai chon la **"Da len lich"**, ngay bat dau da thiet lap |
| **"Da len lich"** | Tu dong thuc hien | **"Dang chay"** | Den thoi diem bat dau da len lich |
| **"Da len lich"** | Huy | **"Da huy"** | Xac nhan tu nguoi dung |
| **"Dang chay"** | Tam dung | **"Tam dung"** | Xac nhan tu nguoi dung |
| **"Dang chay"** | Huy | **"Da huy"** | Xac nhan tu nguoi dung |
| **"Dang chay"** | Hoan thanh | **"Hoan thanh"** | Tu dong khi tat ca giai doan hoan thanh |
| **"Tam dung"** | Tiep tuc (Chay) | **"Dang chay"** | Xac nhan tu nguoi dung |
| **"Tam dung"** | Huy | **"Da huy"** | Xac nhan tu nguoi dung |
| **"Hoan thanh"** | -- | -- | Trang thai cuoi cung, khong co hanh dong tiep |
| **"Da huy"** | -- | -- | Trang thai cuoi cung, khong co hanh dong tiep |

**Ghi chu:**
- Chuyen tu **"Da len lich"** sang **"Dang chay"** la tu dong theo lich trinh.
- Chuyen tu **"Dang chay"** sang **"Hoan thanh"** la tu dong khi tat ca giai doan hoan thanh.
- **"Hoan thanh"** va **"Da huy"** la trang thai cuoi cung -- khong hien thi nut hanh dong.

### 3.2 Giai doan chien dich (Campaign Wave)

| Trang thai | Mo ta |
|---|---|
| **"Dang thiet lap"** | Giai doan dang duoc cau hinh |
| **"Da len lich"** | Giai doan da len lich, cho den thoi diem chay |
| **"Dang chay"** | Giai doan dang gui tin nhan |
| **"Hoan thanh"** | Giai doan da gui xong tat ca tin nhan |
| **"Tam dung"** | Giai doan bi tam dung (nguoi dung hoac he thong) |
| **"Da huy"** | Giai doan bi huy |
| **"Bo qua"** | Giai doan bi bo qua (vi chien dich bi huy truoc khi den giai doan nay) |

### 3.3 Chuong trinh voucher (Voucher Program)

```
  +------------------+
  |    Tao moi       |
  |  (Create)        |
  +--------+---------+
           |
           v
  +------------------+
  |    Nhap          |-------- Xoa ---------> (xoa vinh vien)
  |   (DRAFT)        |
  +--------+---------+
           |
      Chay (Kich hoat)
           |
           v
  +------------------+         +------------------+
  | Hoat dong        |------->| Tam dung         |
  | (ACTIVE)         |        | (SUSPENDED)      |
  +----+-------+-----+        +--------+---------+
       |       |                    |       |
    Het han  Huy              Tiep tuc    Huy
   (tu dong)   |                |          |
       v       v                v          v
  +---------+ +----------+  Hoat dong  +----------+
  | Het han | | Da huy   |            | Da huy   |
  +---------+ +----------+            +----------+
```

| Trang thai hien tai | Hanh dong | Trang thai moi | Dieu kien |
|---|---|---|---|
| _(chua ton tai)_ | Tao chuong trinh | **"Nhap"** hoac **"Hoat dong"** | Neu tao voi trang thai **"Hoat dong"**, he thong tu kich hoat |
| **"Nhap"** | Xoa | _(xoa vinh vien)_ | Chi ap dung cho trang thai **"Nhap"** |
| **"Nhap"** | Chay (kich hoat) | **"Hoat dong"** | Xac nhan tu nguoi dung. He thong sinh pool voucher |
| **"Hoat dong"** | Tam dung | **"Tam dung"** | Khong dang lien ket chien dich chua hoan thanh/chua huy |
| **"Hoat dong"** | Huy | **"Da huy"** | Khong dang lien ket chien dich chua hoan thanh/chua huy |
| **"Hoat dong"** | Het han (tu dong) | **"Het han"** | He thong tu dong khi den ngay ket thuc hoac het so luong |
| **"Tam dung"** | Tiep tuc (Chay) | **"Hoat dong"** | Xac nhan tu nguoi dung |
| **"Tam dung"** | Huy | **"Da huy"** | Xac nhan tu nguoi dung |
| **"Het han"** | -- | -- | Trang thai cuoi cung |
| **"Da huy"** | -- | -- | Trang thai cuoi cung |

**Ghi chu:**
- Khi kich hoat, he thong sinh pool voucher theo so luong cau hinh.
- Het han tu dong khi den ngay ket thuc hoac het so luong voucher.
- Khong cho phep huy/tam dung neu dang lien ket chien dich chua hoan thanh.

### 3.4 Voucher don le

| Trang thai | Mo ta |
|---|---|
| **"Da tao, chua phan phoi"** | Voucher da sinh nhung chua phat cho khach hang |
| **"Khach hang da thu thap (QR Scan)"** | Khach hang da quet QR de nhan voucher |
| **"Da gui cho khach hang qua chien dich Marketing"** | Voucher duoc phat qua chien dich marketing |
| **"Da su dung"** | Khach hang da su dung voucher |
| **"Da het han"** | Voucher het han |

### 3.5 Message gui (Campaign Message)

| Trang thai | Mo ta |
|---|---|
| **"Cho gui"** | Message dang cho den luot gui |
| **"Dang gui"** | Message dang duoc gui qua kenh |
| **"Da gui"** | Message da gui thanh cong |
| **"Da nhan"** | Khach hang da nhan message |
| **"Da mo"** | Khach hang da mo message |
| **"Da click"** | Khach hang da click link trong message |
| **"That bai"** | Gui that bai |
| **"Loi (bounce)"** | Message bi bounce |

---

## S4 Permission Rules

| Hanh dong | Chu garage (garage-owner) | Ke toan (accountant) | Dieu kien |
|---|---|---|---|
| Xem danh sach chien dich | Co | Co | -- |
| Tao chien dich | Co | Co | -- |
| Xem chi tiet chien dich | Co | Co | -- |
| Chinh sua chien dich | Co | Co | Chien dich phai o trang thai **"Nhap"** |
| Xoa chien dich | Co | Co | Chien dich phai o trang thai **"Nhap"** |
| Chay chien dich | Co | Co | Chien dich o **"Nhap"**, **"Da len lich"** hoac **"Tam dung"** |
| Tam dung chien dich | Co | Co | Chien dich o **"Dang chay"** |
| Huy chien dich | Co | Co | Chien dich o **"Dang chay"** hoac **"Tam dung"** |
| Xem danh sach chuong trinh voucher | Co | Co | -- |
| Tao chuong trinh voucher | Co | Co | -- |
| Xem chi tiet chuong trinh voucher | Co | Co | -- |
| Chinh sua chuong trinh voucher | Co | Co | Chuong trinh phai o trang thai **"Nhap"** |
| Xoa chuong trinh voucher | Co | Co | Chuong trinh phai o trang thai **"Nhap"** |
| Chay chuong trinh voucher | Co | Co | Chuong trinh o **"Nhap"** hoac **"Tam dung"** |
| Tam dung chuong trinh voucher | Co | Co | Chuong trinh o **"Hoat dong"** va khong lien ket chien dich chua hoan thanh |
| Huy chuong trinh voucher | Co | Co | Chuong trinh o **"Hoat dong"** hoac **"Tam dung"** va khong lien ket chien dich chua hoan thanh |
| Huy voucher don le | Co | Co | -- |

**Ghi chu:** Trong toan bo `gf-marketing`, ke toan co quyen tuong duong chu garage. Khong co ngoai le phan quyen nao cho boundary nay.

---

## S5 Validation Rules

### 5.1 Chien dich -- Thong tin chung

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Ten chien dich"** | Bat buoc | **"Vui long nhap ten chien dich"** | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |
| **"Trang thai"** | Bat buoc. Gia tri: **"Nhap"**, **"Da len lich"**. Mac dinh: **"Nhap"** | **"Vui long chon trang thai"** | FEAT-MKT-CAMP-CREATE |
| **"Loai chien dich"** | Bat buoc. Gia tri: **"Chay 1 lan"**, **"Lap lai theo lich"**, **"Tu dong theo su kien"** | **"Vui long chon loai chien dich"** | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |
| **"Nguoi khoi tao"** | Bat buoc | **"Vui long nhap nguoi khoi tao"** | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |
| **"Danh sach kenh su dung"** | Bat buoc chon it nhat mot kenh. Gia tri: **"Push"**, **"SMS"**, **"Zalo"**, **"Email"** | **"Vui long chon it nhat mot kenh"** | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |
| **"Phan khuc"** | Khong bat buoc (tuy loai chien dich) | -- | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |
| **"Mo ta"** | Khong bat buoc | -- | FEAT-MKT-CAMP-CREATE, FEAT-MKT-CAMP-EDIT |

### 5.2 Chien dich -- Truong theo loai

| Truong | Dieu kien hien thi | Quy tac | Thong bao loi | Features |
|---|---|---|---|---|
| **"Bat dau tu"** (ngay gio) | Loai = **"Chay 1 lan"** | Bat buoc | **"Vui long chon ngay bat dau"** | FEAT-MKT-CAMP-CREATE |
| **"Su kien"** | Loai = **"Tu dong theo su kien"** | Bat buoc. Gia tri: **"Sinh nhat khach hang"**, **"Hoan thanh booking"**, **"Den han bao duong"**, **"Khach lau khong quay lai"** | **"Su kien la bat buoc"** | FEAT-MKT-CAMP-CREATE |
| **"So ngay"** | Su kien = **"Khach lau khong quay lai"** | Bat buoc, lon hon 0 | **"So ngay la bat buoc va phai lon hon 0"** | FEAT-MKT-CAMP-CREATE |
| **"Tan suat"** | Loai = **"Lap lai theo lich"** | Bat buoc. Gia tri: **"Hang ngay"**, **"Hang tuan"**, **"Hang thang"** | -- | FEAT-MKT-CAMP-CREATE |
| **"Thu"** | Tan suat = **"Hang tuan"** | Bat buoc | -- | FEAT-MKT-CAMP-CREATE |
| **"Ngay"** | Tan suat = **"Hang thang"** | Bat buoc | -- | FEAT-MKT-CAMP-CREATE |
| **"Gio"** | Loai = **"Lap lai theo lich"** | Bat buoc | -- | FEAT-MKT-CAMP-CREATE |

### 5.3 Chuong trinh voucher -- Thong tin co ban

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Ten chuong trinh"** | Bat buoc | **"Vui long nhap ten chuong trinh"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"Tu ngay"** | Bat buoc. Dinh dang dd/mm/yyyy hh:mm | **"Vui long chon ngay bat dau"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"Den ngay"** | Bat buoc. Phai sau **"Tu ngay"** va khong truoc thoi diem hien tai | **"Vui long chon ngay ket thuc"** / **"Ngay ket thuc phai sau ngay bat dau"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"Trang thai"** | Bat buoc. Gia tri: **"Nhap"**, **"Hoat dong"** | **"Vui long chon trang thai"** | FEAT-MKT-VOUC-CREATE |
| **"Mo ta"** | Khong bat buoc | -- | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |

### 5.4 Chuong trinh voucher -- Cau hinh voucher

| Truong | Quy tac | Thong bao loi | Features |
|---|---|---|---|
| **"Loai voucher"** | Bat buoc. Gia tri: **"Giam theo %"**, **"Giam co dinh"**, **"Mien phi dich vu"**, **"Qua tang"** | **"Vui long chon loai voucher"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"So luong voucher"** | Bat buoc. So nguyen duong | **"So luong voucher phai la so nguyen"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"So luong thu thap toi da/Khach"** | Khong bat buoc. So nguyen | **"So luong thu thap toi da/Khach phai la so nguyen"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"So lan dung toi da/Khach"** | Khong bat buoc. So nguyen | **"So lan dung toi da/Khach phai la so nguyen"** | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |
| **"Chu ky thu thap"** | Khong bat buoc. Gia tri: **"Khong"**, **"Moi ngay"**, **"Moi tuan"**, **"Moi thang"**, **"Moi nam"** | -- | FEAT-MKT-VOUC-CREATE, FEAT-MKT-VOUC-EDIT |

---

## S6 Dependency Rules

| Dependency | Mo ta | Anh huong |
|---|---|---|
| `gf-customer` -> `gf-marketing` (phan khuc) | Chien dich su dung phan khuc de xac dinh danh sach khach hang muc tieu. | Neu `gf-customer` khong kha dung, khong the chon phan khuc hoac dem so luong khach hang. |
| `gf-notification` -> `gf-marketing` (gui tin) | Chien dich gui tin nhan qua `gf-notification` (Kafka events). | Neu `gf-notification` khong kha dung, message se o trang thai **"Cho gui"** hoac **"That bai"**. |
| `gf-notification` -> `gf-marketing` (gioi han) | Gioi han gui tin hang thang lay tu `gf-notification`. | Neu khong lay duoc gioi han, he thong van cho phep tao chien dich nhung khong hien thi duoc so da su dung. |
| Temporal -> `gf-marketing` (campaign execution) | Temporal workflow dieu phoi viec gui tin nhan theo giai doan va lich trinh. | Neu Temporal khong kha dung, chien dich khong the chuyen tu **"Da len lich"** sang **"Dang chay"** hoac xu ly giai doan. |
| Campaign -> Voucher Program (lien ket) | Chien dich co the lien ket chuong trinh voucher. Chuong trinh phai **"Hoat dong"** khi khoi chay. | Neu chuong trinh voucher bi huy hoac het han truoc khi chien dich chay, can validate lai. |

---

## S7 Phan tich & De xuat

### 7.1 Conflict / Overlap detected

1. **Conflict trang thai chien dich giua EP va FEAT**: EP-MARKETING S3.1 dinh nghia 5 trang thai (DRAFT -> SCHEDULED -> IN_PROGRESS -> COMPLETED, CANCELLED) nhung FEAT-MKT-CAMP-LIST AC-2 va FEAT-MKT-CAMP-DETAIL AC-7/AC-8 bo sung trang thai **"Tam dung"** (PAUSED) thanh tong cong **6 trang thai**. De xuat cap nhat EP-MARKETING S3.1 de dong bo.

2. **Conflict trang thai voucher giua EP va FEAT**: EP-MARKETING S3.2 dinh nghia 2 trang thai don gian (ACTIVE/INACTIVE) nhung FEAT-MKT-VOUC-LIST AC-2 dinh nghia **5 trang thai**: **"Nhap"**, **"Hoat dong"**, **"Het han"**, **"Da huy"**, **"Tam dung"**. Day la xung dot lon -- EP can cap nhat lifecycle voucher.

3. **Overlap BR-MKT-CAMP-CRE-005 vs BR-MKT-CAMP-EDT-003**: Cung mot quy tac (voucher phai **"Hoat dong"** khi khoi chay) duoc lap lai o ca tao va sua. De xuat gop thanh BR-MKT-CAMP-GEN-007.

4. **Overlap BR-MKT-VOUC-CRE-002 vs BR-MKT-VOUC-EDT-003**: Quy tac ngay ket thuc phai sau ngay bat dau duoc lap lai. De xuat gop thanh BR-MKT-VOUC-GEN-006.

### 7.2 Missing rules

1. **WARN -- Gioi han gui tin nhan hang thang**: BR-MKT-CAMP-CRE-006 de cap gioi han gui tin hang thang nhung **khong quy dinh hanh vi khi vuot gioi han**. He thong co tu choi khoi chay hay chi canh bao? Can Business Authority lam ro.

2. **WARN -- Chinh sua giai doan khi chien dich dang chay**: Khong co BR nao quy dinh viec chinh sua giai doan (wave) cua chien dich khi chien dich dang o trang thai **"Dang chay"** hoac **"Tam dung"**. Hien tai chi co tam dung/tiep tuc/huy giai doan (API reference FEAT-MKT-CAMP-DETAIL). Can lam ro scope.

3. **WARN -- Voucher da su dung khi chuong trinh bi huy**: Khong co BR quy dinh hanh vi cua voucher da duoc khach hang su dung khi chuong trinh bi huy. Voucher da su dung co bi anh huong khong? Can lam ro.

4. **WARN -- Khoi chay chien dich tu form tao/sua**: FEAT-MKT-CAMP-CREATE AC-3 va FEAT-MKT-CAMP-EDIT AC-3 cho phep khoi chay ngay tu form. Nhung **khong co BR quy dinh tat ca truong bat buoc phai hop le truoc khi khoi chay** (ngoai tren nut **"Luu"** da co validation). Can xac nhan: khoi chay co kiem tra nghiem ngat hon luu nhap khong?

5. **WARN -- So luong giai doan toi da**: Khong co BR gioi han so luong giai doan (wave) toi da trong mot chien dich. Can Business Authority xac nhan.

6. **WARN -- Chien dich khong co giai doan**: FEAT-MKT-CAMP-DETAIL EC-2 cho phep chien dich khong co giai doan. Nhung BR-MKT-CAMP-CRE-002 yeu cau loai **"Chay 1 lan"** phai co giai doan. Cac loai khac thi sao? Can lam ro.

7. **WARN -- Gia tri giam voucher**: FEAT-MKT-VOUC-CREATE khong dinh nghia truong nhap gia tri giam (%, so tien co dinh) cho tung loai voucher. Chi co loai voucher nhung khong co truong cau hinh gia tri tuong ung. Can xac nhan: cau hinh gia tri giam o dau?

### 7.3 De xuat cai tien

1. **Cap nhat EP-MARKETING lifecycle**: EP-MARKETING S3.1 (chien dich) can bo sung trang thai **"Tam dung"** (PAUSED). EP-MARKETING S3.2 (voucher) can thay doi tu 2 trang thai don gian (ACTIVE/INACTIVE) thanh 5 trang thai day du (DRAFT/ACTIVE/EXPIRED/CANCELLED/SUSPENDED) de dong bo voi cac FEAT.

2. **Bo sung BR cho behavior khi het han voucher**: Voucher het han tu dong -- can quy dinh: voucher da gui cho khach hang nhung chua su dung thi xu ly the nao? Co thong bao cho khach hang khong?

3. **Tach biet Segment boundary ro rang**: Phan khuc (Segment) thuoc `gf-customer` nhung duoc su dung chinh boi `gf-marketing`. De xuat bo sung cross-boundary contract chinh thuc (Kafka event hoac REST API contract) giua hai boundary.

4. **Bo sung BR cho duplicate campaign name**: Hien tai khong co quy tac nam ten chien dich phai unique. So sanh voi phan khuc (phai unique). Can xac nhan.

5. **Bo sung specification cho template message**: FEAT-MKT-CAMP-CREATE AC-17 de cap truong **"Template"** nhung khong co FEAT nao dinh nghia CRUD template. Can xac nhan: template duoc quan ly nhu the nao? Co can FEAT rieng khong?

---

## Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-20 | Khoi tao business rules tu 8 FEAT chien dich + voucher (CAMP-LIST/CREATE/DETAIL/EDIT, VOUC-LIST/CREATE/DETAIL/EDIT) + EP-MARKETING. Tong cong 37 BR chinh thuc, 7 WARN can clarification, 2 conflict EP/FEAT can dong bo. Ghi chu: phan khuc (3 FEAT) thuoc boundary gf-customer, xem BR-GF-CUSTOMER.md. | Business Authority |
