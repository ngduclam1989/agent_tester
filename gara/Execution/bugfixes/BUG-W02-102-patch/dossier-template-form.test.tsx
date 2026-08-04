import { createRef } from "react";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const buildPrefill = (): DossierTemplatePrefill => ({
  customerName: "Nguyễn Văn A",
  vehiclePlate: "30A-12345",
  vehicleModelDisplay: "Hyundai Accent",
  serviceOrderCode: "SO-001",
  estimateDate: "22/06/2026",
  insuranceAmount: 5000000,
  insuranceAmountInWords: "Năm triệu đồng",
  garage: {
    name: "Garage X",
    delegate: "Trần B",
    delegateTitle: "Giám đốc",
    address: "12 Lê Lợi, Q.1, HCM",
    taxId: "0312345678",
    bankAccount: "1900-9999",
    bankName: "Vietcombank",
    phone: "0901234567",
  },
});

const getInputById = (id: string): HTMLInputElement => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`No element with id "${id}"`);
  return el as HTMLInputElement;
};

describe("DossierTemplateForm — variant rendering", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders acceptanceRecord with prefilled customer + garage fields", () => {
    render(
      <DossierTemplateForm
        variant="acceptanceRecord"
        prefill={buildPrefill()}
      />,
    );

    const root = screen.getByTestId("dossier-template-form-acceptance");
    expect(root).toBeInTheDocument();
    expect(
      within(root).getByText("BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG"),
    ).toBeInTheDocument();

    const customerName = getInputById("customer.name");
    expect(customerName.value).toBe("Nguyễn Văn A");
    expect(customerName).not.toHaveAttribute("readonly");

    const garageName = getInputById("garage.name");
    expect(garageName.value).toBe("Garage X");
    expect(garageName).not.toHaveAttribute("readonly");

    const licensePlate = getInputById("licensePlate");
    expect(licensePlate.value).toBe("30A-12345");
    expect(licensePlate).not.toHaveAttribute("readonly");

    expect(
      screen.getByDisplayValue(
        "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng.",
      ),
    ).toBeInTheDocument();
  });

  it("renders paymentAuthorization with prefilled vehicle + compensation fields", () => {
    render(
      <DossierTemplateForm
        variant="paymentAuthorization"
        prefill={buildPrefill()}
      />,
    );

    const root = screen.getByTestId("dossier-template-form-authorization");
    expect(root).toBeInTheDocument();
    expect(within(root).getByText("GIẤY ỦY QUYỀN")).toBeInTheDocument();

    const vehicleType = getInputById("vehicle.type");
    expect(vehicleType.value).toBe("Hyundai Accent");
    expect(vehicleType).not.toHaveAttribute("readonly");

    const amountInWords = getInputById("compensation.amountInWords");
    expect(amountInWords.value).toBe("Năm triệu đồng");
    expect(amountInWords).not.toHaveAttribute("readonly");

    expect(
      screen.getByDisplayValue(
        "Bên ủy quyền cam kết các thông tin cung cấp là chính xác, trung thực và chịu trách nhiệm trước pháp luật.",
      ),
    ).toBeInTheDocument();
  });
});

describe("DossierTemplateForm — imperative ref", () => {
  it("getAcceptanceValues returns current acceptance form state", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="acceptanceRecord"
        prefill={buildPrefill()}
      />,
    );

    const values = ref.current?.getAcceptanceValues();
    expect(values?.licensePlate).toBe("30A-12345");
    expect(values?.customer.name).toBe("Nguyễn Văn A");
    expect(values?.garage.name).toBe("Garage X");
    expect(values?.clauses.length).toBeGreaterThanOrEqual(1);
  });

  it("getAuthorizationValues returns current authorization form state", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="paymentAuthorization"
        prefill={buildPrefill()}
      />,
    );

    const values = ref.current?.getAuthorizationValues();
    expect(values?.vehicle.licensePlate).toBe("30A-12345");
    expect(values?.vehicle.type).toBe("Hyundai Accent");
    expect(values?.compensation.amountNumeric).toBe(5000000);
    expect(values?.compensation.amountInWords).toBe("Năm triệu đồng");
    expect(values?.commitmentClauses.length).toBeGreaterThanOrEqual(3);
  });
});

describe("DossierTemplateForm — interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trim-on-blur applies to editable input", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="acceptanceRecord"
        prefill={buildPrefill()}
      />,
    );

    const delegateField = getInputById("garage.delegate");

    fireEvent.change(delegateField, { target: { value: "   Trần B   " } });
    fireEvent.blur(delegateField);

    const values = ref.current?.getAcceptanceValues();
    expect(values?.garage.delegate).toBe("Trần B");
  });

  it("clicking Add clause appends item; clicking Remove decreases count", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="acceptanceRecord"
        prefill={buildPrefill()}
      />,
    );

    const countItems = () =>
      screen.queryAllByTestId(/^acceptance-clauses-item-\d+$/).length;

    const initialDomCount = countItems();
    expect(initialDomCount).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByTestId("acceptance-clauses-add"));
    expect(countItems()).toBe(initialDomCount + 1);

    const afterAddCount = countItems();
    fireEvent.click(screen.getByTestId("acceptance-clauses-remove-1"));
    expect(countItems()).toBeLessThan(afterAddCount);
  });
});
