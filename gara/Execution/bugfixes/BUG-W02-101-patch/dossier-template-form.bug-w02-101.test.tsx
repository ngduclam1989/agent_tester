import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
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

import DossierTemplateForm, {
  type DossierTemplateFormRef,
} from "./dossier-template-form";
import type { DossierTemplatePrefill } from "../interfaces";

const buildPrefill = (
  override?: Partial<DossierTemplatePrefill>,
): DossierTemplatePrefill => ({
  customerName: "Nguyễn Văn A",
  vehiclePlate: "30A-12345",
  vehicleModelDisplay: "Hyundai Accent",
  serviceOrderCode: "SO-001",
  estimateDate: "22/06/2026",
  insuranceAmount: 5_000_000,
  insuranceAmountInWords: "Năm triệu đồng",
  garage: {
    name: "Garage X",
    delegate: "Trần B",
    delegateTitle: "Giám đốc",
    address: "12 Lê Lợi",
    taxId: "012",
    bankAccount: "1",
    bankName: "VCB",
    phone: "0901",
  },
  ...override,
});

const getInputById = (id: string): HTMLInputElement => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Input ${id} not found`);
  return el as HTMLInputElement;
};

describe("BUG-W02-101 — getAuthorizationValues coerces compensation.amountNumeric to Number", () => {
  it("returns amountNumeric as number when user types a numeric string", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="paymentAuthorization"
        prefill={buildPrefill({ insuranceAmount: 0 })}
      />,
    );

    const amountField = getInputById("compensation.amountNumeric");
    fireEvent.change(amountField, { target: { value: "27410045" } });
    fireEvent.blur(amountField);

    const values = ref.current?.getAuthorizationValues();
    expect(typeof values?.compensation.amountNumeric).toBe("number");
    expect(values?.compensation.amountNumeric).toBe(27410045);
  });

  it("returns amountNumeric as number when user types comma-grouped string", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="paymentAuthorization"
        prefill={buildPrefill({ insuranceAmount: 0 })}
      />,
    );

    const amountField = getInputById("compensation.amountNumeric");
    fireEvent.change(amountField, { target: { value: "27,410,045" } });
    fireEvent.blur(amountField);

    const values = ref.current?.getAuthorizationValues();
    expect(typeof values?.compensation.amountNumeric).toBe("number");
    expect(values?.compensation.amountNumeric).toBe(27410045);
  });

  it("returns 0 (number) when amountNumeric input is blank", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="paymentAuthorization"
        prefill={buildPrefill({ insuranceAmount: 0 })}
      />,
    );

    const amountField = getInputById("compensation.amountNumeric");
    fireEvent.change(amountField, { target: { value: "" } });
    fireEvent.blur(amountField);

    const values = ref.current?.getAuthorizationValues();
    expect(typeof values?.compensation.amountNumeric).toBe("number");
    expect(values?.compensation.amountNumeric).toBe(0);
  });

  it("returns number from numeric prefill (baseline regression)", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="paymentAuthorization"
        prefill={buildPrefill({ insuranceAmount: 8_447_207 })}
      />,
    );

    const values = ref.current?.getAuthorizationValues();
    expect(typeof values?.compensation.amountNumeric).toBe("number");
    expect(values?.compensation.amountNumeric).toBe(8_447_207);
  });
});
