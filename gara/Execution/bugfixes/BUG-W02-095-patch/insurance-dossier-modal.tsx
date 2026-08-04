import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/share/buttons/button";
import { Accordion } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import usePrintSettlement from "@/features/settlement-voucher/hooks/use-print-settlement";
import usePrintServiceOrder from "@/features/service-order/hooks/use-print-service-order";
import { ExportSOType } from "@/features/service-order/interfaces";
import { downloadFileFormUrl, printFileFormUrl } from "@/utils/file";

import {
  DOSSIER_DOCUMENT_ORDER,
  DOSSIER_PRINT_LABELS,
  INSURANCE_DOSSIER_DOC_TYPE,
  type InsuranceDossierDocType,
} from "../constants";
import useRenderAcceptanceRecordPdf from "../hooks/use-render-acceptance-record-pdf";
import useRenderPaymentAuthorizationPdf from "../hooks/use-render-payment-authorization-pdf";
import type {
  AcceptanceFormInput,
  AuthorizationFormInput,
  DossierEstimatePreviewData,
  DossierQuotationPreviewData,
  DossierTemplatePrefill,
} from "../interfaces";
import DocumentRow from "./document-row";
import DossierTemplateForm, {
  buildAcceptanceFromPrefill,
  buildAuthorizationFromPrefill,
  splitPlaceAndDate,
  type DossierTemplateFormRef,
} from "./dossier-template-form";
import EstimateDocumentPreview from "./estimate-document-preview";
import QuotationDocumentPreview from "./quotation-document-preview";

const normalizeAuthorizationPayload = (
  raw: AuthorizationFormInput,
): AuthorizationFormInput => {
  const { placeAndDate, garage: rawGarage, ...rest } = raw;
  const { address: _address, phone: _phone, bankName: _bankName, ...garage } =
    rawGarage;
  const derived = splitPlaceAndDate(placeAndDate);
  return {
    ...rest,
    placeIssued: derived.placeIssued || rest.placeIssued || "",
    dateIssued: derived.dateIssued || rest.dateIssued || "",
    garage,
  };
};

const buildAcceptancePayloadFromSnapshot = (
  raw: AcceptanceFormInput,
): AcceptanceFormInput => {
  const {
    recordPlace: _recordPlaceDrop,
    garage: rawGarage,
    ...rest
  } = raw;
  const { bankInfo: _bankInfoDrop, ...garage } = rawGarage;
  return { ...rest, garage } as AcceptanceFormInput;
};

export interface InsuranceDossierSubmitPayload {
  documentTypes: InsuranceDossierDocType[];
  acceptanceFormData?: AcceptanceFormInput;
  authorizationFormData?: AuthorizationFormInput;
}

interface InsuranceDossierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlementCode: string;
  serviceOrderCode: string;
  settlementId?: number | string | null;
  serviceOrderId?: number | string | null;
  vehiclePlate?: string | null;
  isSubmitting?: boolean;
  quotationData: DossierQuotationPreviewData;
  estimateData: DossierEstimatePreviewData;
  templatePrefill: DossierTemplatePrefill;
  onSubmit: (payload: InsuranceDossierSubmitPayload) => void | Promise<void>;
}

const defaultSelection: Record<InsuranceDossierDocType, boolean> = {
  [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: false,
  [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: false,
  [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]: false,
  [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]: false,
};

const toFiniteNumber = (
  value: number | string | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const InsuranceDossierModal = ({
  open,
  onOpenChange,
  settlementCode,
  serviceOrderCode,
  settlementId,
  serviceOrderId,
  vehiclePlate,
  isSubmitting = false,
  quotationData,
  estimateData,
  templatePrefill,
  onSubmit,
}: InsuranceDossierModalProps) => {
  const [selection, setSelection] =
    useState<Record<InsuranceDossierDocType, boolean>>(defaultSelection);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [acceptanceSnapshot, setAcceptanceSnapshot] =
    useState<AcceptanceFormInput | null>(null);
  const [authorizationSnapshot, setAuthorizationSnapshot] =
    useState<AuthorizationFormInput | null>(null);
  const acceptanceFormRef = useRef<DossierTemplateFormRef>(null);
  const authorizationFormRef = useRef<DossierTemplateFormRef>(null);

  const prefillKey = useMemo(
    () => JSON.stringify(templatePrefill),
    [templatePrefill],
  );

  useEffect(() => {
    if (open) {
      setSelection(defaultSelection);
      setFormInstanceKey((prev) => prev + 1);
      setAcceptanceSnapshot(buildAcceptanceFromPrefill(templatePrefill));
      setAuthorizationSnapshot(buildAuthorizationFromPrefill(templatePrefill));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefillKey]);

  const { exportPdfUrl: exportSettlementPdfUrl, loading: settlementPrinting } =
    usePrintSettlement();
  const { exportPdfUrl: exportServiceOrderPdfUrl, loading: quotationPrinting } =
    usePrintServiceOrder();
  const { renderPdfUrl: renderAcceptancePdfUrl, loading: acceptancePrinting } =
    useRenderAcceptanceRecordPdf();
  const {
    renderPdfUrl: renderAuthorizationPdfUrl,
    loading: authorizationPrinting,
  } = useRenderPaymentAuthorizationPdf();

  const handleToggle = (type: InsuranceDossierDocType) => (next: boolean) => {
    setSelection((prev) => ({ ...prev, [type]: next }));
  };

  const selectedCount = useMemo(
    () => Object.values(selection).filter(Boolean).length,
    [selection],
  );

  const subtitleByType: Record<InsuranceDossierDocType, string> = {
    [INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET]: settlementCode,
    [INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET]: serviceOrderCode,
    [INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD]:
      "Thông tin được sử dụng để lập biên bản nghiệm thu",
    [INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION]:
      "Áp dụng cho garage chưa ký liên kết với bảo hiểm",
  };

  const handleSubmit = () => {
    const selected = DOSSIER_DOCUMENT_ORDER.filter((type) => selection[type]);
    const payload: InsuranceDossierSubmitPayload = {
      documentTypes: selected,
    };
    if (
      selected.includes(INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD) &&
      acceptanceSnapshot
    ) {
      payload.acceptanceFormData =
        buildAcceptancePayloadFromSnapshot(acceptanceSnapshot);
    }
    if (
      selected.includes(INSURANCE_DOSSIER_DOC_TYPE.PAYMENT_AUTHORIZATION) &&
      authorizationSnapshot
    ) {
      payload.authorizationFormData =
        normalizeAuthorizationPayload(authorizationSnapshot);
    }
    onSubmit(payload);
  };

  const handlePrintSettlement = async () => {
    const numericId = toFiniteNumber(settlementId);
    if (numericId === null) return;
    const url = await exportSettlementPdfUrl(numericId);
    if (!url?.length) return;
    printFileFormUrl(url);
    downloadFileFormUrl(url, `${settlementCode || "settlement"}_Phiếu quyết toán`);
  };

  const handlePrintQuotation = async () => {
    const numericId = toFiniteNumber(serviceOrderId);
    if (numericId === null) return;
    const url = await exportServiceOrderPdfUrl(numericId, ExportSOType.QUOTATION);
    if (!url?.length) return;
    printFileFormUrl(url);
    downloadFileFormUrl(url, `${vehiclePlate || "service-order"}_Phiếu báo giá`);
  };

  const handlePrintAcceptance = async () => {
    const raw = acceptanceFormRef.current?.getAcceptanceValues();
    if (!raw) return;
    const values = buildAcceptancePayloadFromSnapshot(raw);
    const url = await renderAcceptancePdfUrl(settlementCode, values);
    if (!url?.length) return;
    printFileFormUrl(url);
    downloadFileFormUrl(
      url,
      `${vehiclePlate || "dossier"}_Biên bản nghiệm thu`,
    );
  };

  const handlePrintAuthorization = async () => {
    const raw = authorizationFormRef.current?.getAuthorizationValues();
    if (!raw) return;
    const values = normalizeAuthorizationPayload(raw);
    const url = await renderAuthorizationPdfUrl(settlementCode, values);
    if (!url?.length) return;
    printFileFormUrl(url);
    downloadFileFormUrl(
      url,
      `${vehiclePlate || "dossier"}_Giấy ủy quyền nhận tiền bồi thường`,
    );
  };

  const renderContent = (type: InsuranceDossierDocType) => {
    if (type === INSURANCE_DOSSIER_DOC_TYPE.SETTLEMENT_SHEET) {
      return (
        <QuotationDocumentPreview
          data={quotationData}
          onPrint={handlePrintSettlement}
          printLabel={DOSSIER_PRINT_LABELS[type]}
          printDisabled={settlementPrinting}
          printTestId="print-settlement-sheet"
        />
      );
    }
    if (type === INSURANCE_DOSSIER_DOC_TYPE.QUOTATION_SHEET) {
      return (
        <EstimateDocumentPreview
          data={estimateData}
          onPrint={handlePrintQuotation}
          printLabel={DOSSIER_PRINT_LABELS[type]}
          printDisabled={quotationPrinting}
          printTestId="print-quotation-sheet"
        />
      );
    }
    if (type === INSURANCE_DOSSIER_DOC_TYPE.ACCEPTANCE_RECORD) {
      return (
        <DossierTemplateForm
          key={`acceptance-${formInstanceKey}`}
          ref={acceptanceFormRef}
          variant="acceptanceRecord"
          prefill={templatePrefill}
          onPrint={handlePrintAcceptance}
          printLabelOverride={DOSSIER_PRINT_LABELS[type]}
          printDisabled={acceptancePrinting}
          onValuesChange={setAcceptanceSnapshot}
        />
      );
    }
    return (
      <DossierTemplateForm
        key={`authorization-${formInstanceKey}`}
        ref={authorizationFormRef}
        variant="paymentAuthorization"
        prefill={templatePrefill}
        onPrint={handlePrintAuthorization}
        printLabelOverride={DOSSIER_PRINT_LABELS[type]}
        printDisabled={authorizationPrinting}
        onValuesChange={setAuthorizationSnapshot}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="dialog-tao-ho-so-bh"
        className="max-h-[90%] w-[1200px] max-w-[90%]!"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            {"Hồ sơ bảo hiểm"} - {settlementCode}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-238px)]">
          <Accordion
            type="single"
            collapsible
            className="flex flex-col gap-3"
          >
            {DOSSIER_DOCUMENT_ORDER.map((type) => (
              <DocumentRow
                key={type}
                type={type}
                subtitle={subtitleByType[type]}
                selected={selection[type]}
                onSelectedChange={handleToggle(type)}
              >
                {renderContent(type)}
              </DocumentRow>
            ))}
          </Accordion>
        </div>

        <DialogFooter>
          <Button
            data-testid="button-huy-bo"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {"Huỷ bỏ"}
          </Button>
          <Button
            data-testid="button-xuat-ho-so"
            variant="brand"
            disabled={selectedCount === 0}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            {"Xuất hồ sơ bảo hiểm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsuranceDossierModal;
