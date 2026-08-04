import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, options?: { label?: string }) =>
        options?.label ? `Nhập ${options.label}` : "",
      i18n: { language: "vi", changeLanguage: () => Promise.resolve() },
    }),
  };
});

vi.mock("@/utils/file", () => ({
  printFileFormUrl: vi.fn(),
  downloadFileFormUrl: vi.fn(),
}));

vi.mock("@/features/settlement-voucher/hooks/use-print-settlement", () => ({
  default: () => ({ exportPdfUrl: vi.fn(), loading: false }),
}));

vi.mock("@/features/service-order/hooks/use-print-service-order", () => ({
  default: () => ({
    exportPdfUrl: vi.fn(),
    exportImageUrl: vi.fn(),
    loading: false,
  }),
}));

vi.mock("../hooks/use-render-acceptance-record-pdf", () => ({
  default: () => ({ renderPdfUrl: vi.fn(), loading: false, error: null }),
}));

vi.mock("../hooks/use-render-payment-authorization-pdf", () => ({
  default: () => ({ renderPdfUrl: vi.fn(), loading: false, error: null }),
}));

import InsuranceDossierModal, {
  type InsuranceDossierSubmitPayload,
} from "./insurance-dossier-modal";
import type {
  DossierEstimatePreviewData,
  DossierQuotationPreviewData,
  DossierTemplatePrefill,
} from "../interfaces";

const buildQuotation = (): DossierQuotationPreviewData => ({
  garageName: "Garage X",
  settlementCode: "SET-DEMO-00002",
  settlementDate: "25/06/2026",
  customerDisplay: "Mai Ngọc Minh",
  vehicleDisplay: "88C111111",
  services: [],
  parts: [],
  servicesTotal: 0,
  partsTotal: 0,
  allocations: [],
  totalPayment: 0,
});

const buildEstimate = (): DossierEstimatePreviewData => ({
  garageName: "Công ty Mai Lệ",
  serviceOrderCode: "PDV-DEMO-01118",
  estimateDate: "25/06/2026",
  insuranceCompany: "Bảo hiểm Bảo Việt",
  insurancePolicy: "POL-1",
  items: [],
  itemsTotal: 0,
});

const buildPrefill = (): DossierTemplatePrefill => ({
  customerName: "Mai Ngọc Minh",
  vehiclePlate: "88C111111",
  vehicleModelDisplay: "Hyundai Accent",
  serviceOrderCode: "PDV-DEMO-01118",
  estimateDate: "25/06/2026",
  insuranceAmount: 5_000_000,
  insuranceAmountInWords: "Năm triệu đồng",
  garage: {
    name: "Công ty Mai Lệ",
    delegate: "Mai Ngọc Lệ 1",
    delegateTitle: "Giám đốc",
    address: "Số 236 đường Hoàng Quốc Việt",
    taxId: "0011223344",
    bankAccount: "1234567890",
    bankName: "VCB",
    phone: "0901234567",
  },
});

const renderModal = (onSubmit: (payload: InsuranceDossierSubmitPayload) => void) =>
  render(
    <InsuranceDossierModal
      open
      onOpenChange={vi.fn()}
      settlementCode="SET-DEMO-00002"
      serviceOrderCode="PDV-DEMO-01118"
      settlementId={42}
      serviceOrderId={99}
      vehiclePlate="88C111111"
      quotationData={buildQuotation()}
      estimateData={buildEstimate()}
      templatePrefill={buildPrefill()}
      onSubmit={onSubmit}
    />,
  );

describe("InsuranceDossierModal — lift-state snapshot serializes prefill payload without expanding accordion", () => {
  it("ticks Biên bản nghiệm thu without expanding accordion → Xuất sends acceptanceFormData populated from prefill snapshot", () => {
    const onSubmit = vi.fn();
    renderModal(onSubmit);

    fireEvent.click(screen.getByTestId("checkbox-doc-acceptance-record"));
    fireEvent.click(screen.getByTestId("button-xuat-ho-so"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as InsuranceDossierSubmitPayload;
    expect(payload.documentTypes).toEqual(["ACCEPTANCE_RECORD"]);

    expect(payload.acceptanceFormData).toBeDefined();
    const acceptance = payload.acceptanceFormData!;
    expect(acceptance.licensePlate).toBe("88C111111");
    expect(acceptance.customer.name).toBe("Mai Ngọc Minh");
    expect(acceptance.garage.name).toBe("Công ty Mai Lệ");
    expect(acceptance.garage.delegate).toBe("Mai Ngọc Lệ 1");
    expect(acceptance.garage.address).toBe("Số 236 đường Hoàng Quốc Việt");
    expect(Array.isArray(acceptance.clauses)).toBe(true);
    expect(acceptance.clauses.length).toBe(4);
  });

  it("ticks Giấy ủy quyền without expanding accordion → Xuất sends authorizationFormData populated from prefill snapshot", () => {
    const onSubmit = vi.fn();
    renderModal(onSubmit);

    fireEvent.click(screen.getByTestId("checkbox-doc-payment-authorization"));
    fireEvent.click(screen.getByTestId("button-xuat-ho-so"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as InsuranceDossierSubmitPayload;
    expect(payload.documentTypes).toEqual(["PAYMENT_AUTHORIZATION"]);

    expect(payload.authorizationFormData).toBeDefined();
    const auth = payload.authorizationFormData!;
    expect(auth.compensation.amountNumeric).toBe(5_000_000);
    expect(auth.garage.name).toBe("Công ty Mai Lệ");
  });

  it("ticks both Biên bản nghiệm thu and Giấy ủy quyền without expanding accordion → Xuất sends both form payloads from snapshots", () => {
    const onSubmit = vi.fn();
    renderModal(onSubmit);

    fireEvent.click(screen.getByTestId("checkbox-doc-acceptance-record"));
    fireEvent.click(screen.getByTestId("checkbox-doc-payment-authorization"));
    fireEvent.click(screen.getByTestId("button-xuat-ho-so"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as InsuranceDossierSubmitPayload;
    expect(payload.documentTypes).toEqual([
      "ACCEPTANCE_RECORD",
      "PAYMENT_AUTHORIZATION",
    ]);
    expect(payload.acceptanceFormData).toBeDefined();
    expect(payload.authorizationFormData).toBeDefined();
  });

  it("expand accordion, edit a field, then Xuất → payload reflects the edit (onValuesChange sync)", async () => {
    const onSubmit = vi.fn();
    renderModal(onSubmit);

    fireEvent.click(screen.getByTestId("checkbox-doc-acceptance-record"));

    const trigger = screen
      .getByTestId("row-doc-acceptance-record")
      .querySelector('[data-slot="accordion-trigger"]') as HTMLElement;
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger);

    const customerNameInput = await waitFor(() => {
      const el = document.getElementById("customer.name");
      if (!el) throw new Error("customer.name input not mounted");
      return el as HTMLInputElement;
    });

    fireEvent.change(customerNameInput, {
      target: { value: "Khách hàng đã sửa" },
    });

    await waitFor(() => {
      expect(customerNameInput.value).toBe("Khách hàng đã sửa");
    });

    fireEvent.click(screen.getByTestId("button-xuat-ho-so"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0] as InsuranceDossierSubmitPayload;
    expect(payload.acceptanceFormData).toBeDefined();
    expect(payload.acceptanceFormData!.customer.name).toBe(
      "Khách hàng đã sửa",
    );
  });
});
