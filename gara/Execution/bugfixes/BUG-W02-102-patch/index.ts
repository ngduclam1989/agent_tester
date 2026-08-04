export const INSURANCE_DOSSIER_DOC_TYPE = {
  QUOTATION_SHEET: "QUOTATION_SHEET",
  SETTLEMENT_SHEET: "SETTLEMENT_SHEET",
  ACCEPTANCE_RECORD: "ACCEPTANCE_RECORD",
  PAYMENT_AUTHORIZATION: "PAYMENT_AUTHORIZATION",
} as const;

export type InsuranceDossierDocType =
  (typeof INSURANCE_DOSSIER_DOC_TYPE)[keyof typeof INSURANCE_DOSSIER_DOC_TYPE];

export const DOSSIER_DOCUMENT_TYPE = INSURANCE_DOSSIER_DOC_TYPE;
export type DossierDocumentType = InsuranceDossierDocType;

export const DOSSIER_DOCUMENT_ORDER: InsuranceDossierDocType[] = [
  INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET,
  INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET,
  INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD,
  INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION,
];

export const DOSSIER_DOCUMENT_LABELS: Record<InsuranceDossierDocType, string> =
  {
    [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: "Phiếu quyết toán",
    [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: "Phiếu báo giá",
    [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]: "Biên bản nghiệm thu",
    [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]:
      "Giấy ủy quyền nhận tiền bồi thường",
  };

export const DOSSIER_DOCUMENT_FILE_NAMES: Record<
  InsuranceDossierDocType,
  string
> = {
  [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: "Phiếu quyết toán.pdf",
  [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: "Phiếu báo giá.pdf",
  [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]: "Biên bản nghiệm thu.pdf",
  [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]:
    "Giấy ủy quyền nhận tiền bồi thường.pdf",
};

export const DOSSIER_NO_DOC_SELECTED_ERROR =
  "Vui lòng chọn ít nhất 1 tài liệu để xuất hồ sơ.";
export const DOSSIER_EXPORT_SUCCESS = "Xuất hồ sơ bảo hiểm thành công";

export const DOSSIER_REPUBLIC_HEADER_LINES = [
  "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
  "Độc lập - Tự do - Hạnh phúc",
  "-----o0o-----",
] as const;

export const DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN = "{vehiclePlate}";

export const DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES: string[] = [
  `Bên B hoàn thành việc sửa chữa xe ô tô biển kiểm soát ${DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN} theo đúng báo giá và quyết toán sửa chữa đã thống nhất.`,
  "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng.",
  "Bên B chịu trách nhiệm bảo hành theo nội dung báo giá đã ký kết từ ngày bàn giao; Bên A có trách nhiệm bảo dưỡng, kiểm tra định kỳ và phối hợp xác định nguyên nhân khi có phát sinh.",
  "Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
];

export const DOSSIER_DEFAULT_AUTHORIZATION_CLAUSES: string[] = [
  "Bên ủy quyền cam kết các thông tin cung cấp là chính xác, trung thực và chịu trách nhiệm trước pháp luật.",
  "Bên được ủy quyền cam kết sử dụng tiền bồi thường đúng mục đích sửa chữa xe và xuất hóa đơn đầy đủ.",
  "Giấy ủy quyền có hiệu lực kể từ ngày ký cho đến khi hoàn tất việc nhận tiền bồi thường từ công ty bảo hiểm.",
];

export const DOSSIER_QUOTATION_PRINT_LABEL = "In phiếu";

export const DOSSIER_PRINT_LABELS: Record<InsuranceDossierDocType, string> = {
  [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: "In phiếu quyết toán",
  [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: "In phiếu báo giá",
  [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]: "In biên bản",
  [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]: "In giấy ủy quyền",
};

export const DOSSIER_ACCORDION_VALUE: Record<InsuranceDossierDocType, string> =
  {
    [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: "settlement-sheet",
    [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: "quotation-sheet",
    [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]: "acceptance-record",
    [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]: "payment-authorization",
  };

export const DOSSIER_TESTID_BY_DOC: Record<InsuranceDossierDocType, string> = {
  [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: "row-doc-settlement-sheet",
  [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: "row-doc-quotation-sheet",
  [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]: "row-doc-acceptance-record",
  [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]:
    "row-doc-payment-authorization",
};

export const DOSSIER_CHECKBOX_TESTID_BY_DOC: Record<
  InsuranceDossierDocType,
  string
> = {
  [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: "checkbox-doc-settlement-sheet",
  [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: "checkbox-doc-quotation-sheet",
  [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]:
    "checkbox-doc-acceptance-record",
  [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]:
    "checkbox-doc-payment-authorization",
};

export type DossierFieldType = "text" | "date" | "textarea";

export type DossierGroupLayout =
  | "grid-2col"
  | "grid-3col"
  | "grid-1col"
  | "keyValueList"
  | "cardKeyValueGrid2col";

export interface DossierFieldDef {
  name: string;
  label: string;
  type?: DossierFieldType;
  placeholder?: string;
  readOnly?: boolean;
  prefillKey?: string;
}

export interface DossierFieldGroup {
  id: string;
  title?: string;
  subTitle?: string;
  columns?: 1 | 2;
  layout?: DossierGroupLayout;
  fields: DossierFieldDef[];
}

export const DOSSIER_ACCEPTANCE_GROUPS: DossierFieldGroup[] = [
  {
    id: "header",
    layout: "grid-3col",
    fields: [
      {
        name: "licensePlate",
        label: "BKS xe",
        placeholder: "Vd: 30A-12345",
        prefillKey: "vehiclePlate",
      },
      {
        name: "billDate",
        label: "Ngày lập biên bản",
        type: "date",
      },
      {
        name: "recordPlace",
        label: "Địa điểm lập biên bản",
      },
    ],
  },
  {
    id: "quoteRef",
    layout: "grid-1col",
    fields: [
      {
        name: "quoteReference.code",
        label: "Căn cứ phiếu báo giá",
        prefillKey: "estimateReference",
      },
    ],
  },
  {
    id: "parties",
    title: "Thông tin các bên",
    layout: "keyValueList",
    fields: [
      {
        name: "customer.name",
        label: "Bên A",
        prefillKey: "customerName",
      },
      {
        name: "garage.name",
        label: "Bên B",
        prefillKey: "garage.name",
      },
      {
        name: "garage.delegate",
        label: "Đại diện",
        prefillKey: "garage.delegate",
      },
      {
        name: "garage.delegateTitle",
        label: "Chức vụ",
        prefillKey: "garage.delegateTitle",
      },
      {
        name: "garage.address",
        label: "Địa chỉ Công ty",
        prefillKey: "garage.address",
      },
      {
        name: "garage.bankInfo",
        label: "MST / STK / NH",
        prefillKey: "garage.bankInfo",
      },
    ],
  },
];

export const DOSSIER_AUTHORIZATION_GROUPS: DossierFieldGroup[] = [
  {
    id: "header",
    layout: "grid-1col",
    fields: [
      {
        name: "placeAndDate",
        label: "Địa danh, ngày lập",
        placeholder: "Vd: An Lão, ngày 24/04/2026",
        prefillKey: "placeAndDate",
      },
    ],
  },
  {
    id: "customer",
    title: "Mục I. Bên ủy quyền",
    layout: "cardKeyValueGrid2col",
    fields: [
      {
        name: "customer.name",
        label: "Họ tên / Tên đơn vị",
        prefillKey: "customerName",
      },
      {
        name: "customer.insuranceCertNo",
        label: "GCN bảo hiểm tự nguyện / bắt buộc",
      },
      { name: "customer.address", label: "Địa chỉ" },
      { name: "customer.nationalId", label: "Số CMND / CCCD" },
      {
        name: "customer.nationality",
        label: "Quốc tịch",
        placeholder: "Việt Nam",
      },
      {
        name: "customer.nationalIdIssueDate",
        label: "Ngày cấp",
        type: "date",
      },
      { name: "customer.delegate", label: "Đại diện / Chức vụ" },
      { name: "customer.nationalIdIssuer", label: "Nơi cấp" },
    ],
  },
  {
    id: "garage",
    title: "Mục II. Bên được ủy quyền",
    layout: "cardKeyValueGrid2col",
    fields: [
      {
        name: "garage.name",
        label: "Tên garage / Công ty",
        prefillKey: "garage.name",
      },
      {
        name: "garage.delegate",
        label: "Đại diện",
        prefillKey: "garage.delegate",
      },
      {
        name: "garage.address",
        label: "Địa chỉ",
        prefillKey: "garage.address",
      },
      {
        name: "garage.delegateTitle",
        label: "Chức vụ",
        prefillKey: "garage.delegateTitle",
      },
      {
        name: "garage.taxId",
        label: "Mã số thuế",
        prefillKey: "garage.taxId",
      },
      {
        name: "garage.bankAccount",
        label: "Số tài khoản",
        prefillKey: "garage.bankAccount",
      },
      {
        name: "garage.phone",
        label: "Điện thoại",
        prefillKey: "garage.phone",
      },
      {
        name: "garage.bankName",
        label: "Ngân hàng",
        prefillKey: "garage.bankName",
      },
    ],
  },
  {
    id: "vehicle",
    title: "Mục III. Nội dung ủy quyền",
    layout: "cardKeyValueGrid2col",
    fields: [
      {
        name: "vehicle.type",
        label: "Loại xe",
        prefillKey: "vehicleModelDisplay",
      },
      {
        name: "compensation.amountNumeric",
        label: "Số tiền bồi thường",
        prefillKey: "insuranceAmountDisplay",
      },
      {
        name: "vehicle.licensePlate",
        label: "Biển kiểm soát",
        prefillKey: "vehiclePlate",
      },
      {
        name: "compensation.amountInWords",
        label: "Bằng chữ",
        prefillKey: "insuranceAmountInWords",
      },
      {
        name: "accidentDate",
        label: "Ngày tai nạn",
        type: "date",
      },
      {
        name: "compensation.content",
        label: "Nội dung",
        type: "textarea",
        placeholder: "Mô tả vụ tai nạn",
      },
    ],
  },
];

export interface DossierSignatureBlock {
  side: "left" | "right";
  label: string;
  hint: string;
}

export const DOSSIER_SIGNATURE_BLOCKS: DossierSignatureBlock[] = [
  { side: "left", label: "Đại diện khách hàng", hint: "(Ký, ghi rõ họ tên)" },
  { side: "right", label: "Đại diện xưởng sửa chữa", hint: "(Ký, ghi rõ họ tên)" },
];

export const DOSSIER_QUOTATION_HEADER_FIELDS: ReadonlyArray<{
  label: string;
  key: "garageName" | "settlementDate" | "customerDisplay" | "vehicleDisplay";
}> = [
  { label: "Garage", key: "garageName" },
  { label: "Ngày quyết toán", key: "settlementDate" },
  { label: "Khách hàng", key: "customerDisplay" },
  { label: "Biển số xe", key: "vehicleDisplay" },
];

export const DOSSIER_ESTIMATE_HEADER_FIELDS: ReadonlyArray<{
  label: string;
  key: "garageName" | "estimateDate" | "insuranceCompany" | "insurancePolicy";
}> = [
  { label: "Garage", key: "garageName" },
  { label: "Ngày báo giá", key: "estimateDate" },
  { label: "Công ty bảo hiểm", key: "insuranceCompany" },
  { label: "Số hợp đồng BH", key: "insurancePolicy" },
];

export const DOSSIER_TABLE_TOTAL_LABEL = "Tổng";

export const DOSSIER_INSURANCE_PAYER = "INSURANCE";

export const DOSSIER_UNKNOWN_UNIT_FALLBACK = "";

export const DOSSIER_ALLOCATION_SIGNS: Record<
  | "discountMaterial"
  | "discountLabor"
  | "claimReduction"
  | "depreciation"
  | "insuranceDeductible",
  "+" | "-"
> = {
  discountMaterial: "-",
  discountLabor: "-",
  claimReduction: "-",
  depreciation: "-",
  insuranceDeductible: "-",
};
