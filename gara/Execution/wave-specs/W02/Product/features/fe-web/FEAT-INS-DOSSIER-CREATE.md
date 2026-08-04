---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-INS-DOSSIER-CREATE.md"
source_version: 22
source: "manual-realign-pkg-v13"
source_feat_id: "FEAT-INS-DOSSIER-CREATE"
source_feat_sha: "f04a51b87f035716574cecbd812eef3984b04d20458c4c82e48556cf25284eb0"
source_feat_version: 22
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 6
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-INS-DOSSIER-CREATE"]
consumes_bff_feats: ["FEAT-INS-DOSSIER-CREATE"]
i18n_keys: []
screens_touched:
  - "src/features/insurance-settlement/components/dossier/InsuranceDossierModal.tsx"
  - "src/features/insurance-settlement/components/dossier/dossier-document-row.tsx"
  - "src/features/insurance-settlement/components/dossier/dossier-template-form.tsx"
figma_refs:
  - "Product/ux/figma-web/wave02-ins-dossier-create.md (node 13257:536880 — 10 frame: modal state 2/4 + state 4/4 + 4 accordion expanded × 2 row)"
authoring_inputs:
  pkg_ref: "PKG-W02-insurance-dossier v13"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "9a804fe587a5fa306f6a2c65fe0d932dd5b394bd9fda02eb5b2e937b75fc2ec9"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-CREATE.fe-web.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
  kg_baseline_sha: "N/A (fe-web tier)"
paired_backend_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_bff_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_mobile_feats: ["FEAT-INS-DOSSIER-CREATE"]
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-CREATE (FE Web): Tạo hồ sơ bảo hiểm — modal accordion dọc

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma spec: [`Product/ux/figma-web/wave02-ins-dossier-create.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-create.md). PKG-W02 §2.2 + §2.4 là arbiter khi có discrepancy. Cross-tier coordination ở §12.
> **i18n KHÔNG dùng** — toàn bộ label render fixed tiếng Việt inline (xem §4.3).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-CREATE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React 19 / TypeScript) |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 (Phase B) |
| Status | DRAFT |
| Screens touched | `InsuranceDossierModal` (modal accordion dọc — overlay trên phiếu QT BH detail) |
| Cross-tier consume | BE: `FEAT-INS-DOSSIER-CREATE` (gf-accounting) \| BFF: `FEAT-INS-DOSSIER-CREATE` (agg-garage-graph) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/features/FEAT-INS-DOSSIER-CREATE.md) |
| Source version | v21 |
| Source SHA | `6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` |
| Figma spec | [`Product/ux/figma-web/wave02-ins-dossier-create.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-create.md) |
| PKG | [`Execution/work-packages/PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md) v13 |

## 1. Mục đích nghiệp vụ

Kế toán cần lập và xuất bộ hồ sơ bảo hiểm chuẩn (4 tài liệu) trực tiếp trong hệ thống thay vì thao tác ngoài Excel, nhằm gửi đầy đủ giấy tờ cho doanh nghiệp bảo hiểm ngay lần đầu. Feature cho phép kế toán xem trước từng tài liệu, điền nội dung vào template ③④, tích chọn tài liệu cần xuất, và nhận PDF sẵn sàng gửi BH — rút ngắn thời gian thu tiền và tránh bị trả lại hồ sơ.

## 2. Trách nhiệm FE Web (garage-web)

- **Modal "Hồ sơ bảo hiểm - {mã phiếu QT}"** (vd `Hồ sơ bảo hiểm - #SET-20260326-00001`): controlled `<Dialog>` shadcn/ui mở từ nút "Tạo hồ sơ bảo hiểm" trên thanh hành động phiếu QT BH detail. KHÔNG có tab nội bộ trong modal (tab "Hồ sơ bảo hiểm đã xuất" là FEAT riêng `FEAT-INS-DOSSIER-VIEW` nằm trên phiếu QT BH detail page).
- **Layout accordion dọc — 4 dòng tài liệu** (FEAT v21 AC-3 — **KHÔNG progress bar, KHÔNG badge "Sẵn sàng"/"Bổ sung"** — PKG-W02 v12 explicit gỡ): mỗi dòng = `Checkbox` (mặc định **bỏ trống**) + tiêu đề + dòng phụ mô tả + mũi tên `▾`. Click dòng → mở rộng accordion preview/template **inline** trong dòng (highlight + đổi mũi tên `▴`).
- **Tài liệu ①② Phiếu quyết toán + Phiếu báo giá** (`AUTO_RENDER`): render **HTML template read-only inline** (không phải iframe PDF) — `PHIẾU QUYẾT TOÁN SỬA CHỮA` + `PHIẾU BÁO GIÁ SỬA CHỮA` snapshot từ phiếu QT BH gốc. Nút action: **"In phiếu"** (web `window.print()` hoặc print stylesheet). Sẵn sàng tích chọn ngay khi mở (checkbox enabled).
- **Tài liệu ③④ Biên bản nghiệm thu + Giấy ủy quyền** (`FORM_FILL`): template editable inline (mẫu `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----` + nhiều khối trường) + hint info **"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."** Nút action: **"In biên bản"** / **"In giấy ủy quyền"**. Checkbox enabled — có thể tích chọn ngay, không phụ thuộc trạng thái điền template (FEAT v22 — gỡ EC-4 gate).
- **formData ③④ transient** (PKG v13 + ADR-016 v11): KHÔNG có mutation save form riêng. KHÔNG auto-save server. Nội dung chỉ persist khi user nhấn "Xuất hồ sơ bảo hiểm" (EC-1: đóng modal trước khi export → mất dữ liệu).
- **Footer modal**: `<Button variant="secondary">Huỷ bỏ</Button>` + `<Button variant="brand">Xuất hồ sơ bảo hiểm</Button>` (primary). Nút Xuất **disabled** khi 0 checkbox tick (không gate theo trạng thái điền template — FEAT v22).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG v14 §2.4 Bước 1, cập nhật 2026-06-18): trước MỌI UI task, search KG + scan codebase theo thứ tự ưu tiên:
  1. `src/components/customs/` — domain-specific reusable components (ưu tiên cao nhất; thường đăng ký KG W01).
  2. `src/components/share/` — cross-feature shared components.
  3. `src/components/ui/` — shadcn primitives (fallback cuối; chỉ dùng khi `customs/` + `share/` không có).
  → Reuse `Dialog`, `Accordion`, `Checkbox`, `Button`, `Input`, `Textarea` theo thứ tự priority. **Build-new 2 component** (theo PKG v14 đặt tên kebab-case): `dossier-document-row` (compose accordion trigger row) + `dossier-template-form` (form editable cho ③④).
- **GraphQL** (agg-garage-graph-graphql v7.7 #51-52 — sau ADR-016 v11 supersede): **1 mutation + 1 query**:
  - Mutation `exportInsuranceDossier` (orchestrator 4-phase ở BFF) — invoke 1 lần khi user nhấn "Xuất hồ sơ bảo hiểm".
  - Query `getInsuranceDossierVersions(settlementCode, page, size)` — pagination Spring Pageable, refetch sau khi mutation success.
  - **KHÔNG** có `getInsuranceDossierCurrent` (wave-spec v2 trước đó nhầm — không cần prefetch).
- **RBAC**: nút "Tạo hồ sơ bảo hiểm" + entry modal chỉ render cho `accountant` và `garage-owner` — ẩn hoàn toàn (không show + disable). Khi phiếu QT bên thanh toán ≠ Bảo hiểm → ẩn nút (BR-INS-DOSSIER-011).

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Entry point + mở modal

#### AC-1 → FE render nút "Tạo hồ sơ bảo hiểm" trên thanh hành động phiếu QT BH

- **Khi**: kế toán đang xem màn chi tiết phiếu QT BH (Bên thanh toán = Bảo hiểm — BR-INS-STL-DET-007).
- **FE phải**: render `<Button variant="brand">Tạo hồ sơ bảo hiểm</Button>` trên thanh hành động (cạnh nút "Xuất hồ sơ bảo hiểm (PDF)" baseline). Click → mở `InsuranceDossierModal` (controlled state local).
- **Điều kiện hiển thị**: phiếu QT BH có `payerType === 'INSURANCE'`. Phiếu QT KH ẩn nút hoàn toàn.
- **Component**: `src/features/insurance-settlement/components/dossier/InsuranceDossierModal.tsx` (NEW) + entry button trong `InsuranceSettlementDetailPage` (MODIFY).
- **GraphQL op**: không có (chỉ open state local).
- **Label fixed**: `"Tạo hồ sơ bảo hiểm"` (button text).
- **a11y**: button `aria-label="Tạo hồ sơ bảo hiểm"`; click mở Dialog focus trap + focus vào tiêu đề modal.
- **Ref**: Figma spec §"## Screen: Modal 'Hồ sơ bảo hiểm' — State 2/4 tài liệu sẵn sàng (13257:536881)"; FEAT v21 AC-1.

#### AC-2 → FE render layout modal đúng cấu trúc

- **Khi**: modal mở.
- **FE phải**: render shadcn `<Dialog>` với:
  - `<DialogHeader>` — title `"Hồ sơ bảo hiểm - {settlementCode}"` (vd `"Hồ sơ bảo hiểm - #SET-20260326-00001"`) + close button `×` top-right.
  - `<DialogContent>` — 4 dòng accordion dọc (xem AC-3).
  - `<DialogFooter>` — nút `"Huỷ bỏ"` (secondary) + nút `"Xuất hồ sơ bảo hiểm"` (brand, disabled theo rule §4.5).
  - **KHÔNG** có tab "Hồ sơ mới" / "Hồ sơ đã xuất" nội bộ modal (PKG-W02 §2.2 explicit — tab "đã xuất" là FEAT-INS-DOSSIER-VIEW riêng trên detail page).
- **State transition**: `idle → ready` (không cần prefetch — data nguồn từ phiếu QT BH đã load ở trang cha + 4 doc-row state local).
- **Component**: `InsuranceDossierModal` wraps 4 instance `<dossier-document-row>`.
- **GraphQL op**: không có (data render từ phiếu QT BH context đã có ở trang cha — pass qua props).
- **Label fixed**: title compose `"Hồ sơ bảo hiểm - " + settlementCode`.
- **a11y**: `<Dialog>` shadcn built-in focus trap + `aria-labelledby` trỏ tiêu đề + Escape đóng.
- **Ref**: Figma spec §"### ModalHeader" + "### ModalFooter"; FEAT v21 AC-2.

### Cluster B — 4 dòng tài liệu accordion dọc

#### AC-3 → FE render 4 dòng accordion với checkbox mặc định bỏ trống

- **Khi**: modal ready.
- **FE phải**: render 4 `<dossier-document-row>` đúng thứ tự (FEAT v21 BR-INS-DOSSIER-001), mỗi dòng có cấu trúc:
  - Trigger row: `Checkbox` (mặc định **unchecked**) + Title text + Subtitle text + `Chevron` icon (xoay theo state).
  - Click trigger → expand accordion content (preview/template inline) + highlight dòng + đổi chevron `▾ → ▴`.
- **4 dòng cố định** (label fixed + subtitle fixed theo FEAT v21 AC-3):

| # | Title | Subtitle | Type | Checkbox initial state |
|---|---|---|---|---|
| ① | `"Phiếu quyết toán"` | `{settlementCode}` (vd `"SET-20260326-00001"`) | AUTO_RENDER | enabled (sẵn sàng tích ngay) |
| ② | `"Phiếu báo giá"` | `{serviceOrderCode}` (vd `"PDV-20260320-00639"`) | AUTO_RENDER | enabled (sẵn sàng tích ngay) |
| ③ | `"Biên bản nghiệm thu"` | `"Thông tin được sử dụng để lập biên bản nghiệm thu"` | FORM_FILL | enabled (sẵn sàng tích ngay — FEAT v22 gỡ EC-4) |
| ④ | `"Giấy ủy quyền nhận tiền bồi thường"` | `"Áp dụng cho garage chưa ký liên kết với bảo hiểm"` | FORM_FILL | enabled (sẵn sàng tích ngay — FEAT v22 gỡ EC-4) |

- **Component**: `src/features/insurance-settlement/components/dossier/dossier-document-row.tsx` (NEW — kebab-case per PKG §2.4 Bước 1).
- **GraphQL op**: không có (state local).
- **a11y**: `<Checkbox>` shadcn (built-in `<label>` + `aria-checked`); accordion trigger dùng semantic `<button>` với `aria-expanded` + `aria-controls`; keyboard: Enter/Space toggle, Tab navigate.
- **Ref**: Figma spec §"### Accordion/PhieuQuyetToan" / "### Accordion/PhieuBaoGia" / "### Accordion/BienBanNghiemThu" / "### Accordion/GiayUyQuyen"; FEAT v21 AC-3.

#### AC-4 → FE render Phiếu quyết toán (①) — HTML template read-only inline

- **Khi**: kế toán click expand dòng ① Phiếu quyết toán.
- **FE phải**: render **HTML template read-only inline** (KHÔNG iframe, KHÔNG `pdfUrl`) — "PHIẾU QUYẾT TOÁN SỬA CHỮA" snapshot từ phiếu QT BH gốc gồm các khối:
  - Tiêu đề `"PHIẾU QUYẾT TOÁN SỬA CHỮA"` + dòng phụ `"{settlementCode}"` (vd `"SET-20260326-00001"`).
  - Header thông tin: `"Garage"`, `"Ngày quyết toán"`, `"Khách hàng"` (vd `"Chungntt — 0123123123"`), `"Biển số xe"` (vd `"30A1234 — ACURA TSX"`).
  - Bảng **"Dịch vụ thực hiện"** — cột: `STT | Nội dung | ĐVT | SL | Đơn giá | Thành tiền` + dòng `"Tổng"`.
  - Bảng **"Phụ tùng sử dụng"** — cùng cấu trúc cột + dòng `"Tổng"`.
  - Khối **"Phân bổ bảo hiểm"** — các dòng: `"CK liên kết BH - Vật tư"`, `"CK liên kết BH - Công dịch vụ"`, `"Giảm trừ bồi thường"`, `"Khấu hao vật tư/thay mới"`, `"Khấu trừ bảo hiểm"` + dòng `"Tổng thanh toán"`.
- **State**: read-only (KHÔNG có input editable). Sẵn sàng tích chọn ngay khi expand.
- **Action bar trong accordion content**: `<Button variant="secondary">In phiếu</Button>` (icon iconsax-reactjs/Printer/Linear, 20px, color=`#71717a`).
- **Component**: render trực tiếp trong `dossier-document-row` (variant `type="AUTO_RENDER"`, `documentType="SETTLEMENT_SHEET"`). Reuse template render layer baseline `settlement-voucher` print template (nếu có) hoặc compose lại từ scratch theo Figma.
- **GraphQL op**: không có. Dữ liệu lấy từ phiếu QT BH context (props từ trang cha).
- **Label fixed**: tất cả label section + cột bảng + button đều hardcode tiếng Việt như liệt kê trên.
- **a11y**: container `role="region"` + `aria-label="Phiếu quyết toán"`; bảng dùng semantic `<table>` + `<th scope="col">`.
- **Ref**: Figma spec §"## Screen: Modal — Accordion 'Phiếu quyết toán' expanded (13257:537062)"; FEAT v21 AC-4.

#### AC-5 → FE render Phiếu báo giá (②) — HTML template read-only inline

- **Khi**: kế toán click expand dòng ② Phiếu báo giá.
- **FE phải**: render **HTML template read-only inline** — "PHIẾU BÁO GIÁ SỬA CHỮA" snapshot từ phiếu QT BH gốc gồm các khối:
  - Tiêu đề `"PHIẾU BÁO GIÁ SỬA CHỮA"` + dòng phụ `"{serviceOrderCode} · Bảo hiểm đã duyệt giá"` (vd `"PDV-20260320-00639 · Bảo hiểm đã duyệt giá"`).
  - Header: `"Garage"`, `"Ngày báo giá"`, `"Công ty bảo hiểm"` (vd `"Bảo hiểm Bảo Việt"`), `"Số hợp đồng BH"` (vd `"BV-2903812-093814"`).
  - Bảng hạng mục — cột: `STT | Nội dung sửa chữa | Phụ tùng | Đơn giá | Thành tiền` + dòng `"Tổng"`.
- **State**: read-only, sẵn sàng tích chọn ngay.
- **Action bar**: `<Button variant="secondary">In phiếu</Button>`.
- **Component**: `dossier-document-row` (variant `type="AUTO_RENDER"`, `documentType="QUOTATION_SHEET"`).
- **GraphQL op**: không có.
- **Label fixed**: hardcode tiếng Việt như liệt kê.
- **a11y**: container `role="region"` + `aria-label="Phiếu báo giá"`.
- **Ref**: Figma spec §"## Screen: Modal — Accordion 'Phiếu báo giá' expanded (13257:537243)"; FEAT v21 AC-5.

#### AC-6 → FE render Biên bản nghiệm thu (③) — template editable inline

- **Khi**: kế toán click expand dòng ③ Biên bản nghiệm thu.
- **FE phải**: render template editable inline với tiêu đề cố định + hint info + các khối field editable + signing block. Layout đầy đủ:
  - Tiêu đề cố định 3 dòng giữa: `"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"` (uppercase) / `"Độc lập - Tự do - Hạnh phúc"` (italic) / `"-----o0o-----"`.
  - Tiêu đề tài liệu: `"BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG"`.
  - Hint info box (icon Info + text): `"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."` — color `text-muted-foreground` (#71717a).
  - **Khối "Lập biên bản"** (4 trường):

    | Label | Field type | Nguồn |
    |---|---|---|
    | `"BKS xe"` | text input inline | Nhập tay |
    | `"Ngày lập biên bản"` | date input `dd/mm/yyyy` | Nhập tay |
    | `"Địa điểm lập biên bản"` | text input inline | Nhập tay |
    | `"Căn cứ phiếu báo giá (số + ngày)"` | text (prefill từ phiếu báo giá ②, read-only) | Prefill |

  - **Khối "Thông tin các bên"**:
    - **Bên A — Khách hàng/Chủ xe**:

      | Label | Field type | Nguồn |
      |---|---|---|
      | `"Tên khách hàng/chủ xe"` | text (prefill — chỉ Tên từ phiếu QT BH) | Prefill |
      | `"Đại diện"`, `"Địa chỉ"`, `"CCCD"`, `"Ngày cấp"`, `"Nơi cấp"` | text input inline | Nhập tay |

    - **Bên B — Garage**:

      | Label | Field type | Nguồn |
      |---|---|---|
      | `"Tên công ty"`, `"Đại diện"`, `"Chức vụ"`, `"Địa chỉ"`, `"MST"`, `"STK"`, `"Ngân hàng"` | text (prefill từ hồ sơ garage) | Prefill |

  - **Khối "Nội dung nghiệm thu"** — danh sách điều khoản template editable, prefill 4 điều khoản chuẩn (text sửa được — `<Textarea>` hoặc `contenteditable`):
    1. Hoàn thành sửa chữa.
    2. Nhận bàn giao.
    3. Bảo hành.
    4. Lập thành 02 bản.
    - Nút **`"+ Thêm mục điều khoản"`** (icon Plus + text) — thêm dòng mới cuối list. Mỗi dòng có icon `×` để xoá.

  - **Khối ký — display-only** (chốt 2026-06-18 — user request):
    - **CHỈ render label tĩnh** dạng 2 cột — flex layout, **KHÔNG có signature canvas, KHÔNG có e-signature, KHÔNG cho ký trực tiếp trên UI**. Mục đích: hiển thị mô tả khối ký trên template để in giấy ra ký tay ngoài hệ thống (đồng bộ FEAT v21 AC-6 "ký tay ngoài hệ thống").
    - Cột trái: `"Đại diện khách hàng"` / `"(Ký, ghi rõ họ tên)"`.
    - Cột phải: `"Đại diện xưởng sửa chữa"` / `"(Ký, ghi rõ họ tên)"`.
    - Render: `<div>` semantic với 2 text block căn giữa, KHÔNG `<input>` / KHÔNG `<canvas>` / KHÔNG button "Ký".

  - **Action bar trong accordion content**: `<Button variant="secondary">In biên bản</Button>`.

- **Editable field UX**: từng field NHẬP LIỆU (BKS xe, Ngày lập, Địa điểm, Bên A — Đại diện/Địa chỉ/CCCD/Ngày cấp/Nơi cấp, Nội dung nghiệm thu điều khoản) là `<Input>` hoặc `<Textarea>` shadcn inline — focus ring khi click; placeholder rỗng để giữ layout legal template. **Khối ký KHÔNG editable** (display-only).
- **State**: form state cục bộ qua `react-hook-form` trong `dossier-template-form` — KHÔNG persist server (transient — chỉ submit khi Export).
- **Checkbox enable rule**: tất cả field bắt buộc (BKS xe, Ngày lập, Địa điểm, Bên A — Tên/Đại diện/Địa chỉ, ≥1 điều khoản) → checkbox dòng ③ enable + auto-tick được. Trước đó checkbox disabled.
- **Component**: `src/features/insurance-settlement/components/dossier/dossier-template-form.tsx` (NEW, variant `"acceptanceRecord"`).
- **GraphQL op**: không có save riêng. Khi user nhấn Export → form data gộp vào input `acceptanceFormData` của mutation `exportInsuranceDossier` (13 trường strict Figma State 4 — xem §6.1).
- **Label fixed**: tất cả label + tiêu đề + điều khoản template hardcode tiếng Việt.
- **a11y**: mỗi input có `<label>` semantic + `aria-required="true"` cho field bắt buộc; date picker keyboard accessible; điều khoản list dùng `<ol role="list">`.
- **Ref**: Figma spec §"## Screen: Modal — Accordion 'Biên bản nghiệm thu' expanded (13257:537424)"; FEAT v21 AC-6 + BR-INS-DOSSIER-003 (prefill chỉ Tên KH).

#### AC-7 → FE render Giấy ủy quyền nhận tiền bồi thường (④) — template editable inline

- **Khi**: kế toán click expand dòng ④ Giấy ủy quyền.
- **FE phải**: render template editable inline với cấu trúc:
  - Tiêu đề cố định 3 dòng `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM` (giống AC-6).
  - Tiêu đề tài liệu: `"GIẤY ỦY QUYỀN"`.
  - Hint info box: `"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."`
  - **Đầu phiếu**: `"Địa danh"` + `"Ngày lập"` (vd `"An Lão, ngày dd/mm/yyyy"`) — nhập tay.
  - **Mục I. Bên ủy quyền (Khách hàng)**:

    | Label | Field type | Nguồn |
    |---|---|---|
    | `"Họ tên / Tên đơn vị"` | text (prefill — chỉ Tên từ phiếu QT BH) | Prefill |
    | `"Địa chỉ"`, `"Quốc tịch"`, `"Đại diện"`, `"Chức vụ"`, `"GCN bảo hiểm tự nguyện / bắt buộc"`, `"Số CMND/CCCD"`, `"Ngày cấp"`, `"Nơi cấp"` | text input inline | Nhập tay |

  - **Mục II. Bên được ủy quyền (Garage)**:

    | Label | Field type | Nguồn |
    |---|---|---|
    | `"Tên garage/Công ty"`, `"Địa chỉ"`, `"MST"`, `"Điện thoại"`, `"Đại diện"`, `"Chức vụ"`, `"Số tài khoản"`, `"Ngân hàng"` | text (prefill từ hồ sơ garage) | Prefill |

  - **Mục III. Nội dung ủy quyền**:

    | Label | Field type | Nguồn |
    |---|---|---|
    | `"Loại xe"`, `"Biển kiểm soát"` | text (prefill xe từ QT BH) | Prefill |
    | `"Số tiền bồi thường"`, `"Bằng chữ"` | text (prefill từ QT BH) | Prefill |
    | `"Ngày tai nạn"`, `"Nội dung"` | text input inline | Nhập tay |

  - **Mục IV. Cam kết** — list 3 điều khoản template editable + nút `"+ Thêm mục điều khoản"` (cùng pattern AC-6).
  - **Khối ký — display-only** (giống AC-6 — chốt 2026-06-18): chỉ render label tĩnh 2 cột `"Đại diện khách hàng / (Ký, ghi rõ họ tên)"` + `"Đại diện xưởng sửa chữa / (Ký, ghi rõ họ tên)"`. **KHÔNG signature canvas, KHÔNG e-signature, KHÔNG cho ký trực tiếp**. Render `<div>` semantic, KHÔNG `<input>` / `<canvas>` / button "Ký".
  - **Action bar**: `<Button variant="secondary">In giấy ủy quyền</Button>`.

- **Editable field UX + state**: giống AC-6 (transient `react-hook-form` cục bộ trong `dossier-template-form` variant `"paymentAuthorization"`).
- **Checkbox enable rule**: tất cả field bắt buộc (đặc biệt Mục I — Họ tên KH, Số CMND/CCCD; Mục III — Loại xe, Biển kiểm soát, Số tiền) → checkbox dòng ④ enable.
- **Component**: `dossier-template-form.tsx` (variant `"paymentAuthorization"`).
- **GraphQL op**: form data gộp vào input `authorizationFormData` (22 trường nested 4 sections strict Figma State 5 — xem §6.1) khi Export.
- **Label fixed**: tất cả label hardcode tiếng Việt.
- **a11y**: tương tự AC-6.
- **Ref**: Figma spec §"## Screen: Modal — Accordion 'Giấy ủy quyền' expanded (13257:537605)"; FEAT v21 AC-7 + BR-INS-DOSSIER-004.

### Cluster C — Preview + thao tác từng tài liệu

#### AC-8 → FE render action bar trong expanded accordion row

- **Khi**: một dòng accordion đang expanded.
- **FE phải**:
  - **①② AUTO_RENDER**: action bar có `<Button variant="secondary">In phiếu</Button>` — gọi `window.print()` với print stylesheet riêng (ẩn UI chrome, chỉ in template content). KHÔNG có nút "Tải PDF" riêng (PDF chỉ sinh khi Export).
  - **③④ FORM_FILL**: action bar có `<Button variant="secondary">In biên bản</Button>` hoặc `<Button variant="secondary">In giấy ủy quyền</Button>` — cùng pattern `window.print()`.
  - **KHÔNG** có nút "Upload" (FEAT v17 chốt B-3 bỏ upload).
  - **KHÔNG** có nút "Lưu phiếu" / "Lưu thông tin" trên web (EC-1 — đồng bộ với mobile "Lưu thông tin" cục bộ).
- **State**: trong khi printing → window.print() dialog (browser native).
- **Component**: `<Button>` shadcn + print stylesheet (`@media print`) trong `dossier-document-row.tsx`.
- **GraphQL op**: không có.
- **Label fixed**: `"In phiếu"` (①②), `"In biên bản"` (③), `"In giấy ủy quyền"` (④).
- **a11y**: button `aria-label` mô tả hành động + tên tài liệu.
- **Ref**: Figma spec; FEAT v21 AC-4/5/6/7 web action; PKG-W02 §2.2.

### Cluster D — Xuất hồ sơ bảo hiểm

#### AC-9 → FE invoke mutation exportInsuranceDossier khi nhấn "Xuất hồ sơ bảo hiểm"

- **Khi**: kế toán đã tích ít nhất 1 checkbox và nhấn `"Xuất hồ sơ bảo hiểm"` ở footer modal.
- **FE phải**:
  - **Validate inline**:
    - Nếu `selectedDocs.length === 0` → button **disabled** + tooltip `"Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ."` (không cho click).
    - KHÔNG client-side gate theo trạng thái điền template ③④ (FEAT v22 — gỡ EC-4). Mọi tài liệu được tích đều invoke mutation; BE quyết định fallback render nếu thiếu trường.
    - Nếu pass → invoke mutation.
  - **Mutation input**:
    ```typescript
    {
      settlementCode: string,
      documentTypes: DocumentType[],         // chỉ những type được tích (subset of 4)
      acceptanceFormData?: AcceptanceFormData,    // chỉ truyền khi ③ được tích — 13 trường
      authorizationFormData?: AuthorizationFormData,  // chỉ truyền khi ④ được tích — 22 trường nested 4 sections
    }
    ```
- **State transition**: `idle → submitting` (button "Xuất hồ sơ bảo hiểm" loading spinner + disable footer + disable accordion edit) → `success` (toast `"Xuất hồ sơ bảo hiểm thành công"` + close modal + refetch `getInsuranceDossierVersions` để tab "Hồ sơ bảo hiểm đã xuất" cập nhật) hoặc `error` (toast theo error code §4.6).
- **Component**: footer `<Button>` trong `InsuranceDossierModal`; hook `useExportInsuranceDossier` wraps TanStack mutation.
- **GraphQL op**: `exportInsuranceDossier` (mutation) — BFF orchestrate Phase A-E (ADR-016 v11).
- **Label fixed**: `"Xuất hồ sơ bảo hiểm"` (button), `"Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ."` (tooltip), `"Vui lòng hoàn tất các tài liệu còn thiếu"` (toast), `"Xuất hồ sơ bảo hiểm thành công"` (success toast).
- **a11y**: loading state `aria-busy="true"` + visible spinner; toast announce `aria-live="polite"`.
- **Ref**: BFF spec §"exportInsuranceDossier orchestrator 4-phase"; ADR-016 v11; FEAT v21 AC-9.

#### AC-10 → FE cập nhật UI sau khi xuất thành công

- **Khi**: mutation `exportInsuranceDossier` trả về success với `{versionNo, exports[]}`.
- **FE phải**:
  - Toast success `"Xuất hồ sơ bảo hiểm thành công"`.
  - Refetch query `getInsuranceDossierVersions(settlementCode, page=0, size=10)` để tab `<InsuranceDossierTab>` (thuộc FEAT-INS-DOSSIER-VIEW) cập nhật entry mới.
  - Đóng modal (không reset state nội bộ vì modal sẽ unmount).
  - Phiếu QT BH detail page có thể navigate user sang tab "Hồ sơ bảo hiểm đã xuất" hoặc giữ tab hiện tại (BA chốt: giữ tab hiện tại — user tự click vào tab "đã xuất" nếu muốn xem).
- **State transition**: `submitting → success → modal close`.
- **Component**: `InsuranceDossierModal` `onSuccess` handler + invalidate TanStack query key.
- **GraphQL op**: `getInsuranceDossierVersions` refetch (xem FEAT-INS-DOSSIER-VIEW wave-spec).
- **Label fixed**: `"Xuất hồ sơ bảo hiểm thành công"` (toast).
- **Ref**: BR-INS-DOSSIER-006 (immutability sau export); BR-INS-DOSSIER-009 (hiển thị tất cả versions).

#### AC-11 → FE handle versioning — "Tạo bộ hồ sơ mới"

- **Khi**: kế toán nhấn lại nút `"Tạo hồ sơ bảo hiểm"` trên phiếu QT BH detail (sau khi đã có ≥1 bộ xuất).
- **FE phải**: mở `InsuranceDossierModal` **mới hoàn toàn** — KHÔNG copy form data từ bộ trước (BR-INS-DOSSIER-007 cấm "Sao chép từ bản trước"). 4 dòng accordion reset về state initial: checkbox unchecked, ③④ form prefill lại từ phiếu QT BH gốc (Tên KH + garage info).
- **State transition**: modal đóng (sau bộ v1 export) → user click lại nút → modal mở fresh state.
- **Component**: `InsuranceDossierModal` mount mới mỗi lần (key=`{settlementCode}-{Date.now()}` hoặc reset state local).
- **GraphQL op**: không có.
- **Label fixed**: nút trên detail page vẫn là `"Tạo hồ sơ bảo hiểm"`.
- **Ref**: BR-INS-DOSSIER-007 (không unlock bộ cũ); FEAT v21 AC-11.

#### AC-12 → FE KHÔNG cho sửa bộ hồ sơ đã xuất (immutability)

- **Khi**: kế toán xem 1 bộ hồ sơ đã xuất từ tab `<InsuranceDossierTab>` (thuộc FEAT-INS-DOSSIER-VIEW).
- **FE phải**: tab "đã xuất" chỉ hiển thị PDF file list + action download/view — KHÔNG có entry vào `InsuranceDossierModal` cho bộ cũ. Modal `InsuranceDossierModal` chỉ phục vụ TẠO bộ mới (không có chế độ edit bộ cũ).
- **Component**: tab "đã xuất" là FEAT-INS-DOSSIER-VIEW riêng — xem `wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-VIEW.md` §3 Cluster C/D.
- **Ref**: BR-INS-DOSSIER-006 + BR-INS-DOSSIER-007.

### Cluster E — Phân quyền + lỗi

#### AC-13 → FE enforce RBAC + condition Bên thanh toán

- **Khi**: user mở phiếu QT BH detail.
- **FE phải**:
  - Role check: chỉ `accountant` hoặc `garage-owner` → render nút `"Tạo hồ sơ bảo hiểm"`. Role khác → ẩn hoàn toàn (không render DOM).
  - Condition check: nút chỉ render khi `settlement.payerType === 'INSURANCE'` (Bên thanh toán = Bảo hiểm). Phiếu QT KH → ẩn nút (BR-INS-DOSSIER-011 + BR-INS-STL-DET-007).
- **Component**: conditional render trong `InsuranceSettlementDetailPage` dùng `usePermission()` hook + check `settlement.payerType`.
- **GraphQL op**: không có (data từ context phiếu QT BH).
- **Ref**: BR-INS-DOSSIER-011; FEAT v21 AC-13.

#### AC-14 → FE hiển thị lỗi PDF generate per document

- **Khi**: mutation `exportInsuranceDossier` trả về error (Phase B render fail / Phase C upload fail / Phase D persist fail / partial).
- **FE phải**: map error code → display mode theo §4.6. Cụ thể:
  - `INS_DOSSIER_RENDER_FAIL` (Phase B) → toast `"Không thể tạo PDF tài liệu này. Vui lòng thử lại."` + giữ modal open (cho phép retry).
  - `INS_DOSSIER_STORAGE_UPLOAD_FAIL` (Phase C) → toast `"Lỗi tải file lên kho lưu trữ. Vui lòng thử lại."` + giữ modal open.
  - `INS_DOSSIER_PERSIST_FAIL` (Phase D) → toast `"Lỗi lưu hồ sơ. Vui lòng thử lại."` + giữ modal open.
  - `INS_DOSSIER_NO_DOC_SELECTED` (400 validation) → inline tooltip trên nút Export (đã handle ở AC-9, không tới mutation).
  - `INS_DOSSIER_FORM_INCOMPLETE` (400) → inline error tại field thiếu + scroll to + toast `"Vui lòng hoàn tất các tài liệu còn thiếu"`.
  - Network error → toast `"Không có kết nối. Vui lòng kiểm tra mạng và thử lại."`.
- **State transition**: `submitting → error (toast + giữ modal open + button "Xuất hồ sơ bảo hiểm" enable lại)`.
- **Component**: error mapping trong `useExportInsuranceDossier.onError` handler; toast từ global `useToast()` baseline.
- **Label fixed**: tất cả toast/inline error hardcode tiếng Việt như liệt kê.
- **a11y**: error toast `aria-live="assertive"` (urgent); inline error `aria-describedby` trỏ field.
- **Ref**: BFF spec error code mapping; FEAT v21 AC-14.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Layout modal accordion dọc theo Figma spec [`wave02-ins-dossier-create.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-create.md) — KHÔNG re-invent thẻ ngang hoặc tab nội bộ (BA chốt v12 PKG-W02).
- Design tokens từ `tailwind.config.js` / `src/index.css` — không hardcode hex/px ở component code (nhưng label tiếng Việt được hardcode trực tiếp).
- Responsive: modal full-screen trên màn hẹp (<768px), `max-w-[960px]` trên desktop theo Figma.
- Hint info box trong ③④: dùng `text-muted-foreground` + icon iconsax-reactjs/InfoCircle/Linear, color `#71717a`.
- Print stylesheet (`@media print`): chỉ in template content (PHIẾU QUYẾT TOÁN / PHIẾU BÁO GIÁ / BIÊN BẢN / GIẤY UỶ QUYỀN) — ẩn modal chrome (header, footer, accordion border, hint box).

### 4.2 State machine + error handling

- State tường minh: `idle | submitting | success | error` cho modal level + `collapsed | expanded` cho mỗi accordion row + `unchecked | checked | disabled` cho mỗi checkbox.
- Form state ③④ qua `react-hook-form` cục bộ — dirty state tracked cho prompt khi đóng modal (`"Có thông tin chưa xuất. Đóng modal sẽ mất dữ liệu. Tiếp tục?"`).
- KHÔNG silent fail — mọi lỗi GraphQL phải reach UI (toast hoặc inline error).
- Partial error (1 phase fail trong 4) → toast cảnh báo + giữ modal open + cho phép retry với cùng payload.

### 4.3 Labels (fixed tiếng Việt — KHÔNG i18n)

> Quyết định 2026-06-18 (user request): toàn bộ label hardcode tiếng Việt inline trong component code. KHÔNG dùng `i18next` / `useTranslation` / namespace `insuranceDossier.*`. Lý do: giảm indirection, đơn giản hoá build, đồng bộ với 1-locale (VN) policy. Nếu sau cần multi-locale → CR riêng + extract sau.

**Catalog label fixed (chỉ tham khảo — render trực tiếp trong JSX):**

| Vị trí | Label tiếng Việt |
|---|---|
| Button entry trên detail page | `"Tạo hồ sơ bảo hiểm"` |
| Modal title | `"Hồ sơ bảo hiểm - " + settlementCode` |
| Tài liệu ① title | `"Phiếu quyết toán"` |
| Tài liệu ② title | `"Phiếu báo giá"` |
| Tài liệu ③ title | `"Biên bản nghiệm thu"` |
| Tài liệu ④ title | `"Giấy ủy quyền nhận tiền bồi thường"` |
| Tài liệu ③ subtitle | `"Thông tin được sử dụng để lập biên bản nghiệm thu"` |
| Tài liệu ④ subtitle | `"Áp dụng cho garage chưa ký liên kết với bảo hiểm"` |
| ①② action button | `"In phiếu"` |
| ③ action button | `"In biên bản"` |
| ④ action button | `"In giấy ủy quyền"` |
| ③④ template hint | `"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."` |
| ③④ tiêu đề cố định | `"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"` / `"Độc lập - Tự do - Hạnh phúc"` / `"-----o0o-----"` |
| ③ tiêu đề tài liệu | `"BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG"` |
| ④ tiêu đề tài liệu | `"GIẤY ỦY QUYỀN"` |
| ③④ nút thêm điều khoản | `"+ Thêm mục điều khoản"` |
| ③④ khối ký trái | `"Đại diện khách hàng"` / `"(Ký, ghi rõ họ tên)"` |
| ③④ khối ký phải | `"Đại diện xưởng sửa chữa"` / `"(Ký, ghi rõ họ tên)"` |
| Footer secondary button | `"Huỷ bỏ"` |
| Footer primary button | `"Xuất hồ sơ bảo hiểm"` |
| Validation tooltip Export disabled | `"Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ."` |
| Form incomplete toast | `"Vui lòng hoàn tất các tài liệu còn thiếu"` |
| Export success toast | `"Xuất hồ sơ bảo hiểm thành công"` |
| PDF render fail toast | `"Không thể tạo PDF tài liệu này. Vui lòng thử lại."` |
| Storage upload fail toast | `"Lỗi tải file lên kho lưu trữ. Vui lòng thử lại."` |
| Persist fail toast | `"Lỗi lưu hồ sơ. Vui lòng thử lại."` |
| Network error toast | `"Không có kết nối. Vui lòng kiểm tra mạng và thử lại."` |
| Dirty close prompt | `"Có thông tin chưa xuất. Đóng modal sẽ mất dữ liệu. Tiếp tục?"` |

### 4.4 a11y

- `<Dialog>` shadcn built-in: focus trap, Escape đóng, focus trả về trigger button.
- Accordion: `aria-expanded`, `aria-controls`, `<button>` semantic. Keyboard Enter/Space toggle.
- Checkbox: `<Checkbox>` shadcn (built-in `<label>` + `aria-checked` + Space toggle).
- ③④ form: mỗi input có `<label>` semantic + `aria-required="true"` cho field bắt buộc + `aria-describedby` trỏ inline error message khi có.
- Print button: `aria-label="In phiếu quyết toán"` / `aria-label="In phiếu báo giá"` / `aria-label="In biên bản nghiệm thu"` / `aria-label="In giấy ủy quyền"`.
- Submit button loading: `aria-busy="true"` + visible spinner.
- Toast: success `aria-live="polite"`, error `aria-live="assertive"`.

### 4.5 RBAC render + feature flag

- Chỉ `accountant` và `garage-owner` thấy nút `"Tạo hồ sơ bảo hiểm"` — ẩn hoàn toàn DOM, không disable.
- Feature flag `insurance_settlement_enabled` (PKG §2.4 Bước 5) — nếu Platform cung cấp, gắn vào điều kiện render nút entry.
- Khi `settlement.payerType !== 'INSURANCE'` (phiếu QT KH): ẩn nút.

### 4.6 Business rule secondary (UI hint)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC |
|---|---|---|---|---|
| `BR-INS-DOSSIER-001` | CORNERSTONE | Giữ thứ tự 4 dòng cố định ①→②→③→④; KHÔNG reorder/add/remove | `InsuranceDossierModal.tsx` (hardcoded order) | AC-3 |
| `BR-INS-DOSSIER-002` | CORNERSTONE | ①② render read-only — KHÔNG có editable input | `dossier-document-row.tsx` variant `AUTO_RENDER` | AC-4, AC-5 |
| `BR-INS-DOSSIER-003` | CORNERSTONE | ③④ chỉ prefill **Tên** KH từ phiếu QT BH; các field định danh KH còn lại nhập tay | `dossier-template-form.tsx` defaultValues | AC-6, AC-7 |
| `BR-INS-DOSSIER-005` | CORNERSTONE | Nút "Xuất hồ sơ bảo hiểm" disable khi `selectedDocs.length === 0` (tooltip giải thích); KHÔNG buộc đủ 4/4 | `InsuranceDossierModal.tsx` footer | AC-9 |
| `BR-INS-DOSSIER-006` | CORNERSTONE | Sau xuất thành công, bộ đó immutable — modal `InsuranceDossierModal` KHÔNG có chế độ edit bộ cũ | `InsuranceDossierModal.tsx` (chỉ create mode) | AC-10, AC-12 |
| `BR-INS-DOSSIER-007` | CORNERSTONE | "Tạo bộ mới" reset hoàn toàn — KHÔNG copy form data từ bộ trước | `InsuranceDossierModal.tsx` mount fresh state | AC-11 |
| `BR-INS-DOSSIER-010` | NORMAL | Phiếu QT cancel → ẩn nút "Tạo hồ sơ bảo hiểm"; tab "Hồ sơ đã xuất" (DOSSIER-VIEW) vẫn accessible read-only | `InsuranceSettlementDetailPage.tsx` conditional | AC-13 |
| `BR-INS-DOSSIER-011` | NORMAL | Nút "Tạo hồ sơ bảo hiểm" enable chỉ khi flag `insurance_settlement_enabled` ON + `payerType === 'INSURANCE'` | `InsuranceSettlementDetailPage.tsx` conditional | AC-13 |

> **Primary enforcement** = BE tier (`features/be/FEAT-INS-DOSSIER-CREATE.md §9`).

### 4.7 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Label fixed | Source AC |
|---|---|---|---|---|
| `INS_DOSSIER_NO_DOC_SELECTED` (400) | INLINE_TOOLTIP (disable button) | `InsuranceDossierModal.tsx` footer | `"Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ."` | AC-9 |
| `INS_DOSSIER_FORM_INCOMPLETE` (400) | INLINE_ERROR (field) + TOAST | `dossier-template-form.tsx` | `"Vui lòng hoàn tất các tài liệu còn thiếu"` | AC-9, AC-14 |
| `INS_DOSSIER_RENDER_FAIL` (502 Phase B) | TOAST | global toaster | `"Không thể tạo PDF tài liệu này. Vui lòng thử lại."` | AC-14 |
| `INS_DOSSIER_STORAGE_UPLOAD_FAIL` (502 Phase C) | TOAST | global toaster | `"Lỗi tải file lên kho lưu trữ. Vui lòng thử lại."` | AC-14 |
| `INS_DOSSIER_PERSIST_FAIL` (500 Phase D) | TOAST | global toaster | `"Lỗi lưu hồ sơ. Vui lòng thử lại."` | AC-14 |
| `INS_STL_NOT_FOUND` (404 Phase A) | TOAST + close modal | global toaster | `"Không tìm thấy phiếu quyết toán."` | AC-9 |
| `ERR-CMN-NETWORK` | TOAST | global toaster | `"Không có kết nối. Vui lòng kiểm tra mạng và thử lại."` | AC-9, AC-14 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node | AC ref |
|---|---|---|---|---|
| `InsuranceDossierModal` | (modal — không có route riêng; overlay trên phiếu QT BH detail) | NEW | `13257:536880` (section), 10 frame state | AC-1, AC-2, AC-3 |
| `InsuranceSettlementDetailPage` | `/settlement-voucher/{settlementCode}` (baseline — verify `routeTree.gen.ts` theo memory `garage-web-route-singular-vs-api-plural`) | MODIFY (add button "Tạo hồ sơ bảo hiểm" trên thanh hành động) | (xem `wave01-ins-stl-detail.md`) | AC-1, AC-13 |

### 5.2 Components new/modified

| Component | Path | Change type | Props | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|---|
| `InsuranceDossierModal` | `src/features/insurance-settlement/components/dossier/InsuranceDossierModal.tsx` | NEW | `{ settlementCode, open, onClose, settlementData }` | accordion expand state, form state local, selectedDocs[], mutation state | shadcn/ui `Dialog` | AC-1, AC-2, AC-9, AC-10, AC-11, AC-13 |
| `dossier-document-row` | `src/features/insurance-settlement/components/dossier/dossier-document-row.tsx` | NEW (kebab-case per PKG §2.4 Bước 1) | `{ type: 'AUTO_RENDER' \| 'FORM_FILL', documentType, title, subtitle, checked, onToggle, disabled, expanded, onExpandChange, data, formMethods? }` | local expand state; checkbox state lifted | shadcn/ui `Accordion` + `Checkbox` | AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 |
| `dossier-template-form` | `src/features/insurance-settlement/components/dossier/dossier-template-form.tsx` | NEW (kebab-case) | `{ variant: 'acceptanceRecord' \| 'paymentAuthorization', defaultValues, onValidChange }` | `react-hook-form` form state | shadcn/ui `Form` + `Input` + `Textarea` | AC-6, AC-7 |
| `dossier-quotation-preview` (optional split) | `src/features/insurance-settlement/components/dossier/dossier-quotation-preview.tsx` | NEW | `{ settlementData }` | — | static template | AC-4 |
| `dossier-estimate-preview` (optional split) | `src/features/insurance-settlement/components/dossier/dossier-estimate-preview.tsx` | NEW | `{ settlementData }` | — | static template | AC-5 |
| `InsuranceSettlementDetailPage` (existing) | `src/features/insurance-settlement/pages/InsuranceSettlementDetailPage.tsx` | MODIFY (add button entry + open state cho modal) | — | modal open state | existing pattern | AC-1, AC-13 |

> **PKG v14 §2.4 Bước 1 reuse-first — priority `customs/` > `share/` > `ui/`** (cập nhật 2026-06-18): trước MỌI UI task, scan codebase theo thứ tự ưu tiên — (1) `src/components/customs/` (domain-specific W01 — ưu tiên cao nhất); (2) `src/components/share/` (cross-feature); (3) `src/components/ui/` (shadcn primitives — fallback). Component baseline (`Dialog`, `Accordion`, `Checkbox`, `Button`, `Input`, `Textarea`) — verify `customs/` + `share/` trước → fallback `ui/`. 2 (hoặc 4 nếu split preview) component build-new tại `src/features/insurance-settlement/components/dossier/` — đăng ký KG sau khi xong.

### 5.3 Design tokens (Tailwind / shadcn)

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `text-foreground` (#18181b) | `src/index.css` | title, body text mặc định | AC-3, AC-4, AC-5 |
| `text-muted-foreground` (#71717a) | `src/index.css` | subtitle, hint, secondary text | AC-3, AC-6, AC-7 |
| `bg-primary` / `bg-brand` (#0052ff) | `src/index.css` | nút "Xuất hồ sơ bảo hiểm" primary | AC-9 |
| `bg-background-warning` (#fff7ed) | `src/index.css` | mobile banner cảnh báo cam — web KHÔNG dùng (FEAT v21 web dùng hint info muted) | (mobile only) |
| `text-foreground-warning` (#f97316) | `src/index.css` | icon warning trong hint | (optional) |
| `bg-background-error` / `text-foreground-error` (#dc2626) | `src/index.css` | inline error message + toast error | AC-9, AC-14 |
| `border` / `border-input` (#e4e4e7) | `src/index.css` | accordion divider, modal border | AC-2, AC-3 |
| `rounded-lg` (8px) | Tailwind | modal panel, card | AC-2 |
| `shadow-lg` | Tailwind | modal elevation | AC-2 |
| `text-xs` / `text-sm` / `text-base` / `text-xl` | Tailwind | size scale theo Figma | (visual) |

## 6. Data integration (FE — consume BFF)

### 6.1 GraphQL operations consumed (từ BFF)

**1 mutation + 1 query** (agg-garage-graph-graphql v7.7 #51-52 — sau ADR-016 v11 supersede).

| Operation | Type | Query file | TanStack key | AC ref |
|---|---|---|---|---|
| `exportInsuranceDossier` | mutation | `src/api/graphql/exportInsuranceDossier.graphql` | — (TanStack mutation) | AC-9, AC-10, AC-14 |
| `getInsuranceDossierVersions` | query | `src/api/graphql/getInsuranceDossierVersions.graphql` | `['insuranceDossierVersions', settlementCode, page, size]` | AC-10 (refetch sau export) |

> **KHÔNG có** `getInsuranceDossierCurrent` (wave-spec v2 nhầm — gỡ ở v3). Modal CREATE không cần prefetch dossier state vì:
> 1. Data prefill ③④ lấy từ phiếu QT BH context đã load ở trang cha (KH name + garage info + xe info + số tiền).
> 2. Modal luôn tạo bộ MỚI (BR-INS-DOSSIER-007 — không copy bản trước).
> 3. Tab "đã xuất" là FEAT-INS-DOSSIER-VIEW riêng dùng `getInsuranceDossierVersions`.

**Input type `exportInsuranceDossier`** (theo BFF spec orchestrator 4-phase):

```graphql
input ExportInsuranceDossierInput {
  settlementCode: String!
  documentTypes: [DocumentType!]!     # chỉ những type được tích (subset)
  acceptanceFormData: AcceptanceFormDataInput    # required nếu ACCEPTANCE_RECORD in documentTypes
  authorizationFormData: AuthorizationFormDataInput  # required nếu PAYMENT_AUTHORIZATION in documentTypes
}

enum DocumentType {
  QUOTATION_SHEET       # ②
  SETTLEMENT_SHEET      # ①
  ACCEPTANCE_RECORD     # ③
  PAYMENT_AUTHORIZATION # ④
}

input AcceptanceFormDataInput {  # 13 trường strict Figma State 4
  bksXe: String!
  ngayLap: String!  # dd/mm/yyyy
  diaDiemLap: String!
  canCuPhieuBaoGia: String!  # prefill — pass through
  benA_tenKhachHang: String!  # prefill — pass through
  benA_daiDien: String
  benA_diaChi: String
  benA_cccd: String
  benA_ngayCap: String
  benA_noiCap: String
  noiDungNghiemThu: [String!]!  # list điều khoản (≥1)
  # ... 13 trường tổng
}

input AuthorizationFormDataInput {  # 22 trường nested 4 sections strict Figma State 5
  diaDanhNgayLap: String!  # đầu phiếu
  mucI_BenUyQuyen: BenUyQuyenInput!     # 9 trường
  mucII_BenDuocUyQuyen: BenDuocUyQuyenInput!  # 8 trường — prefill
  mucIII_NoiDungUyQuyen: NoiDungUyQuyenInput!  # 6 trường
  mucIV_CamKet: [String!]!  # list điều khoản (≥1)
  # 22 trường tổng
}
```

> Schema canonical xem BFF tier spec §5 SDL delta.

### 6.2 REST endpoints consumed direct

Không có — toàn bộ data qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Settlement context (phiếu QT BH) | TanStack Query (existing baseline) | — | `['settlement', settlementCode]` | AC-1, AC-2 |
| Modal open state | local useState trong `InsuranceSettlementDetailPage` | — | `dossierModalOpen: boolean` | AC-1, AC-2 |
| Accordion expand state | local useState trong `InsuranceDossierModal` | — | `expandedDoc: DocumentType \| null` | AC-3..AC-8 |
| Checkbox selection | local useState trong `InsuranceDossierModal` | — | `selectedDocs: DocumentType[]` | AC-3, AC-9 |
| Form state ③ | react-hook-form trong `dossier-template-form` (variant acceptanceRecord) | — | — | AC-6, AC-9 |
| Form state ④ | react-hook-form trong `dossier-template-form` (variant paymentAuthorization) | — | — | AC-7, AC-9 |
| Export mutation | TanStack mutation | `useExportInsuranceDossier` | — | AC-9, AC-10, AC-14 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/settlement-voucher/{settlementCode}` (baseline — verify routeTree) | `InsuranceSettlementDetailPage` (modified) | existing loader | RBAC: `accountant \| garage-owner` | AC-1, AC-13 |

Modal không có route riêng — controlled local state trong `InsuranceSettlementDetailPage`.

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (Critical Rule #19 — boundary `garage-web`).

| Layer | Path | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/insurance-settlement/pages/` | `InsuranceSettlementDetailPage.tsx` | MODIFY (add button + modal open state) | existing page | ~20 | AC-1, AC-13 |
| `src/features/insurance-settlement/components/dossier/` | `InsuranceDossierModal.tsx` | NEW | shadcn `Dialog` | ~250 | AC-1..AC-14 |
| `src/features/insurance-settlement/components/dossier/` | `dossier-document-row.tsx` | NEW (kebab-case) | shadcn `Accordion` + `Checkbox` | ~150 | AC-3..AC-8 |
| `src/features/insurance-settlement/components/dossier/` | `dossier-template-form.tsx` | NEW (kebab-case) | shadcn `Form` + `Input` + `Textarea` | ~200 | AC-6, AC-7 |
| `src/features/insurance-settlement/components/dossier/` | `dossier-quotation-preview.tsx` | NEW (optional) | static template | ~120 | AC-4 |
| `src/features/insurance-settlement/components/dossier/` | `dossier-estimate-preview.tsx` | NEW (optional) | static template | ~100 | AC-5 |
| `src/features/insurance-settlement/hooks/` | `useExportInsuranceDossier.ts` | NEW | TanStack mutation wrapper | ~50 | AC-9, AC-14 |
| `src/features/insurance-settlement/types/` | `dossier.types.ts` | NEW | TypeScript types (DocumentType enum, AcceptanceFormData, AuthorizationFormData) | ~80 | — |
| `src/api/graphql/` | `exportInsuranceDossier.graphql` | NEW | persisted query | ~30 | AC-9 |
| `src/api/graphql/` | `getInsuranceDossierVersions.graphql` | NEW | persisted query | ~25 | AC-10 (shared với DOSSIER-VIEW) |
| `src/api/generated/` | `*.generated.ts` | AUTO-GEN | graphql-codegen | — | — |
| `src/styles/` | `dossier-print.css` (`@media print`) | NEW | print stylesheet | ~40 | AC-8 |
| `tests/features/insurance-settlement/dossier/` | `InsuranceDossierModal.test.tsx` | NEW | Vitest + RTL | ~250 | AC-2..AC-14 |
| `tests/features/insurance-settlement/dossier/` | `dossier-document-row.test.tsx` | NEW | Vitest + RTL | ~120 | AC-3..AC-8 |
| `tests/features/insurance-settlement/dossier/` | `dossier-template-form.test.tsx` | NEW | Vitest + RTL | ~120 | AC-6, AC-7 |

> **i18n directory KHÔNG đụng** — KHÔNG thêm `src/i18n/vi/insuranceDossier.json` (quyết định 2026-06-18 hardcode VN labels).

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL + `exportInsuranceDossier` mutation resolver stable). Phase A (settlement display + 4 CR) phải stable trước Phase B start (hard gate PKG §1.2).

```
(← Phase A gate: FEAT-INS-STL-CREATE + CR-20260612-01 + CR-20260612-02 + CR-20260616-01 + CR-20260616-02 stable on staging)
(← BFF tier S5: SDL delta exportInsuranceDossier / getInsuranceDossierVersions stable)
(← Figma prefetch xong: ✅ Product/ux/figma-web/wave02-ins-dossier-create.md)

S6.1  Types + GraphQL query files + codegen
      Entry: BFF S5 SDL stable
      Output: dossier.types.ts, *.graphql, *.generated.ts green

S6.2  dossier-document-row + dossier-template-form
      Entry: S6.1 done
      Output: 2 component unit-test green (form validation, accordion expand)

S6.3  dossier-quotation-preview + dossier-estimate-preview (template render)
      Entry: S6.1 done
      Output: snapshot match Figma + print stylesheet apply

S6.4  InsuranceDossierModal (compose 4 row + footer + mutation wiring)
      Entry: S6.2 + S6.3 done + BFF local endpoint reachable
      Output: modal integration test green (export flow happy + 5 error paths)

S6.5  InsuranceSettlementDetailPage button entry + RBAC + payerType conditional
      Entry: S6.4 modal functional
      Output: entry wired + RBAC guard tested

S6.6  E2E happy path (Playwright)
      Entry: S6.5 done + BE/BFF staging deployed + ct-file-storage SETTLEMENTS folder OK
      Exit: E2E smoke green → hand-off QA
```

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. BE là primary (paired `be/FEAT-INS-DOSSIER-CREATE.md §9`). FE: client-side hint, RBAC render, error code → display mode.

Bảng BR liệt ở §4.6 trên — không lặp lại.

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (button render + RBAC + payerType) | test-ui | accountant/owner thấy; role khác ẩn; phiếu QT KH ẩn |
| AC-2 | UI (modal layout — 4 dòng accordion dọc, KHÔNG tab nội bộ) | test-ui | assert KHÔNG có tab "Hồ sơ mới"/"Hồ sơ đã xuất" trong modal |
| AC-3 | UI (4 dòng theo thứ tự + checkbox default unchecked + subtitle text) | test-ui | assert subtitle khớp label fixed |
| AC-4 | UI (① HTML template read-only — KHÔNG iframe) | test-ui | assert KHÔNG có `<iframe>`; assert nút "In phiếu" tồn tại |
| AC-5 | UI (② HTML template read-only — KHÔNG iframe) | test-ui | tương tự AC-4 |
| AC-6 | UI (③ template editable inline — Cộng Hoà XHCN VN + Bên A/B + điều khoản list + khối ký display-only) | test-ui | assert tiêu đề cố định + 4 khối field + nút "+ Thêm mục điều khoản"; assert khối ký KHÔNG có `<canvas>` / `<input>` / button "Ký" — chỉ text label |
| AC-7 | UI (④ template editable inline — Mục I/II/III/IV + khối ký display-only) | test-ui | tương tự AC-6 với Giấy ủy quyền structure; khối ký display-only verify |
| AC-8 | UI ("In phiếu"/"In biên bản"/"In giấy ủy quyền" buttons + print stylesheet) | test-ui | mock `window.print()`; assert print stylesheet ẩn modal chrome |
| AC-9 | UI (mutation trigger + validation) | test-ui | disable button khi 0 selected; tooltip; form incomplete → inline error |
| AC-10 | UI (post-export — toast + close modal + refetch query) | test-ui | mock mutation success → assert toast + modal close + `getInsuranceDossierVersions` refetch |
| AC-11 | UI ("Tạo bộ mới" reset state) | test-ui | mở modal lần 2 sau export → form reset về prefill (không giữ data bộ cũ) |
| AC-12 | UI (modal KHÔNG có chế độ edit bộ cũ) | test-ui | assert không có entry point edit từ tab "đã xuất" |
| AC-13 | UI + RBAC (button hide condition) | test-ui + test-isolation | dual persona test + payerType condition |
| AC-14 | UI (error display per error code) | test-ui | mock 5 error code → assert toast/inline text khớp label fixed |
| (smoke) | E2E happy path | test-e2e | Playwright: open modal → tick ②③ → fill ③ → export → toast → tab "đã xuất" refetch |

## 11. a11y (KHÔNG có §i18n — quyết định 2026-06-18)

§4.4 trên đã cover requirement. Bảng cụ thể per-AC:

| AC | a11y requirement |
|---|---|
| AC-1 | Button `aria-label="Tạo hồ sơ bảo hiểm"`; click mở Dialog focus vào tiêu đề |
| AC-2 | `<Dialog>` shadcn built-in focus trap + `aria-labelledby` trỏ tiêu đề; Escape đóng; focus trả về trigger |
| AC-3 | Accordion `aria-expanded`/`aria-controls`; Checkbox `aria-checked`; keyboard Enter/Space toggle |
| AC-4 | Container `role="region"` + `aria-label="Phiếu quyết toán"`; bảng semantic `<table>` + `<th scope="col">` |
| AC-5 | Container `role="region"` + `aria-label="Phiếu báo giá"` |
| AC-6 | Mỗi input `<label>` + `aria-required` cho required field + `aria-describedby` cho error; điều khoản `<ol role="list">` |
| AC-7 | Tương tự AC-6 |
| AC-8 | Print button `aria-label` mô tả tài liệu cụ thể |
| AC-9 | Loading state `aria-busy="true"` + visible spinner |
| AC-10 | Toast `aria-live="polite"` |
| AC-13 | Button ẩn không render DOM (KHÔNG dùng `display:none aria-hidden`) |
| AC-14 | Error toast `aria-live="assertive"`; inline error `aria-describedby` |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-CREATE.md` | DRAFT (pending) | Primary BR enforcement; 2 aggregate entity + 4 endpoint canonical (2 render-pdf + 1 batch + 1 search) + ct-file-storage upload |
| BFF | `Execution/wave-specs/W02/Product/features/bff/FEAT-INS-DOSSIER-CREATE.md` | DRAFT (pending) | `exportInsuranceDossier` mutation orchestrator 4-phase (Phase A resolve → B render parallel → C upload → D persist atomic → E aggregate); `getInsuranceDossierVersions` paginated passthrough |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-CREATE.md` | DRAFT (pending) | Full-screen flow thay modal; `InsuranceDossierScreen` + `DossierDocumentDetailScreen` per tài liệu; ③④ nút "Lưu thông tin" cục bộ phiên (KHÔNG persist) |

**Source ID consistency** (item #18): `source_feat_sha = 6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` — identical với BE/BFF/Mobile files.

**FE Web consume (read-only reference)**:

- BFF mutation `exportInsuranceDossier` — FE invoke 1 lần; BFF orchestrate Phase A-E (ADR-016 v11). FE KHÔNG gọi gf-accounting / gf-sales / ct-file-storage trực tiếp.
- BFF query `getInsuranceDossierVersions(settlementCode, page, size)` — paginated Spring Pageable. FE-WEB-VIEW refetch sau khi mutation success.
- Download URL: FE compose `${VITE_FILE_STORAGE_BASE_URL}/${pdfUrl}` — `pdfUrl` = relative path từ BFF response (object key ct-file-storage). KHÔNG có endpoint `/download` riêng + KHÔNG có signed URL TTL (ADR-016 v11 supersede 2026-05-31).

## 13. References

- **Source**: [`Product/features/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/features/FEAT-INS-DOSSIER-CREATE.md) v21
- **Figma spec**: [`Product/ux/figma-web/wave02-ins-dossier-create.md`](../../../../../Product/ux/figma-web/wave02-ins-dossier-create.md)
- **PKG**: [`Execution/work-packages/PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md) v13 §2.2 + §2.4
- **Paired BE**: [`features/be/FEAT-INS-DOSSIER-CREATE.md`](../be/FEAT-INS-DOSSIER-CREATE.md)
- **Paired BFF**: [`features/bff/FEAT-INS-DOSSIER-CREATE.md`](../bff/FEAT-INS-DOSSIER-CREATE.md)
- **Paired Mobile**: [`features/mobile/FEAT-INS-DOSSIER-CREATE.md`](../mobile/FEAT-INS-DOSSIER-CREATE.md)
- **ADR-016 v11**: `Architecture/decisions/ADR-016.md` — ct-file-storage + BFF orchestrator + pdfUrl pattern + KHÔNG signed URL
- **BR-INS-DOSSIER-001..011**: `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` §2.5
- **Fan-out map**: `Execution/wave-specs/W02/_routing/FEAT-FAN-OUT-MAP.yaml`
- **Memory `garage-web-route-singular-vs-api-plural`**: verify route path với `routeTree.gen.ts`

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260622-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-01--ins-dossier-current-endpoint-contract) | Add `GET /api/v1/insurance-dossiers/current` endpoint | RAISED (pending Architecture) | Wire op `getInsuranceDossierCurrent` để preload draft existing |
| [CR-20260622-03](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-03--ins-dossier-create-nav-expansion-to-push) | Reconcile §5.2 ExpansionTile → push nav 4 màn chi tiết | APPROVED MINOR self | §5 widget breakdown đồng bộ push nav (cascade từ mobile) |

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 5 | User request | **Gỡ gate "③④ checkbox disabled cho tới khi điền đủ trường bắt buộc"** (sync FEAT v22 — rule không chính xác): §2 layout ③④ → "Checkbox enabled, có thể tích chọn ngay" (gỡ disabled state); §2 footer modal → nút Xuất disabled chỉ khi 0 checkbox tick (gỡ "tài liệu được tick chưa hoàn tất"); AC-3 bảng 4 dòng ③④ checkbox initial state "**disabled** (cho tới khi điền đủ — EC-4)" → "enabled (sẵn sàng tích ngay — FEAT v22 gỡ EC-4)"; AC-9 validate inline gỡ block client-side "form chưa hoàn tất" — chỉ check ≥1 checkbox. BE-side `INS_DOSSIER_FORM_INCOMPLETE` (400) error mapping giữ nguyên (defensive). Đồng bộ source FEAT v22, PKG-W02 v16, BR-EP v31, UX-FLOW v21. |
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho FEAT-INS-DOSSIER-CREATE W02. Policy v2 "tier-authoritative". NEED CONFIRMATION: Figma node-id cần `/prefetch-figma web 02` trước dev. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix #18c: §1 đã byte-equal với canonical (Mobile). Fix #17 op naming: verify ops `exportInsuranceDossier` + `getInsuranceDossierVersions` + `getInsuranceDossierCurrent`. |
| 2026-06-22 | 6 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 2 CR liên quan tier FE-web: CR-20260622-01, CR-20260622-03. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
| 2026-06-18 | 4 | User request | **3 updates 2026-06-18 (later same day)**: (a) §2 + §5.2 reuse-first đổi sang **priority `customs/` > `share/` > `ui/`** (PKG v14 §2.4 Bước 1 — `customs/` ưu tiên cao nhất domain-specific, `ui/` shadcn fallback); (b) AC-6 + AC-7 khối ký **explicit display-only** — render label tĩnh "Đại diện khách hàng / (Ký, ghi rõ họ tên)" + "Đại diện xưởng sửa chữa / (Ký, ghi rõ họ tên)" qua `<div>` semantic, KHÔNG `<canvas>` / `<input>` / e-signature / button "Ký" / cho ký trực tiếp (ký giấy ngoài hệ thống); (c) §10 test scope AC-6/AC-7 update verify khối ký display-only. KHÔNG đổi AC business / GraphQL contract / file paths / i18n policy. Đồng bộ PKG-W02 v14. |
| 2026-06-18 | 3 | User request | **Realign hoàn toàn với PKG-W02 v13 + FEAT v21 + Figma spec wave02-ins-dossier-create.md** (user verify gap với 3 source authoritative). Major changes: **(a)** GỠ `getInsuranceDossierCurrent` query — modal không prefetch dossier state (BR-INS-DOSSIER-007 modal luôn tạo mới); **(b)** SỬA AC-4/AC-5 từ iframe `pdfUrl` → HTML template read-only inline render (AUTO_RENDER per FEAT v21 + PKG §2.2); **(c)** REWRITE AC-6/AC-7 form structure đầy đủ theo FEAT v21 + Figma (CỘNG HOÀ XHCN VN tiêu đề + 4 khối Lập biên bản/Thông tin các bên/Nội dung nghiệm thu/Khối ký cho ③; Đầu phiếu + Mục I/II/III/IV cho ④); **(d)** GỠ "Sẵn sàng"/"Bổ sung" badge (PKG v12 explicit gỡ — thay bằng dòng phụ subtitle); **(e)** GỠ tab nội bộ "Hồ sơ mới"/"Hồ sơ đã xuất" trong modal (PKG §2.2 — tab "đã xuất" là FEAT-INS-DOSSIER-VIEW riêng trên detail page); **(f)** SỬA file paths từ `src/features/insurance-dossier/` → `src/features/insurance-settlement/components/dossier/` (per PKG §2.4 Bước 4); **(g)** ĐỔI component naming PascalCase `DossierDocumentRow.tsx` → kebab-case `dossier-document-row.tsx` (per PKG §2.4 Bước 1); **(h)** THÊM nút "In phiếu"/"In biên bản"/"In giấy ủy quyền" web action (FEAT v21 AC-4/5/6/7); **(i)** SỬA footer button "Xuất hồ sơ" → "Xuất hồ sơ bảo hiểm" + thêm nút "Huỷ bỏ" (Figma + FEAT); **(j)** SỬA modal title "Hồ sơ bảo hiểm" → "Hồ sơ bảo hiểm - {settlementCode}"; **(k)** GỠ HOÀN TOÀN i18n keys + namespace `insuranceDossier.*` — hardcode fixed VN labels inline (user request 2026-06-18); §4.3 thay bằng catalog label fixed; (l) SỬA error code mapping align với BFF orchestrator 4-phase (INS_DOSSIER_RENDER_FAIL/STORAGE_UPLOAD_FAIL/PERSIST_FAIL/NO_DOC_SELECTED/FORM_INCOMPLETE/INS_STL_NOT_FOUND). Status tier-authoritative READY. |
