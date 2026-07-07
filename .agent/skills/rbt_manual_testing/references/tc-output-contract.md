# TC Output Contract

Muc tieu: giu nguyen schema output TC hien co cua `rbt_manual_testing`.

## Bat buoc

- Khong doi ten cot, thu tu cot, hoac so luong cot cua bang TC hien tai.
- Khong them cot ISTQB moi vao bang TC neu user khong yeu cau ro.
- Khong xoa cot hien co de "don gian hoa" output.
- Khong doi format TC ID, group header, newline bang `<br>`, hoac quy tac convert Excel.
- Dung cac reference ISTQB/RBT de cai thien phan tich, risk, coverage, wording, test data, test steps va expected result.

## QUICK mode schema

```text
TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority
```

## FULL RBT / Excel mapping schema

```text
TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data
```

## Xu ly thong tin bo sung

Neu can ghi nhan thong tin ngoai schema TC nhu `Technique`, `Automation Candidate`, `Test Type`,
`Risk Score`, `Defect Link`, `Environment`, `Entry/Exit Criteria`, hay `Residual Risk`, hay dat vao
phan metadata/summary/phu luc cua file markdown tong hop, khong chen vao bang TC chinh.

## Nguyen tac khi merge ISTQB

ISTQB references la playbook tham chieu. Output TC cu la contract. Khi hai ben xung dot, uu tien
contract output TC cu tru khi user yeu cau doi schema bang TC.
