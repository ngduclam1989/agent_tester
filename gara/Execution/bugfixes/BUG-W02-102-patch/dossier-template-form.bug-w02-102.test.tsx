import { createRef } from "react";
import { render, screen } from "@testing-library/react";
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
import {
  DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN,
  DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES,
} from "../constants";
import type { DossierTemplatePrefill } from "../interfaces";

const buildPrefill = (
  override?: Partial<DossierTemplatePrefill>,
): DossierTemplatePrefill => ({
  customerName: "Nguyễn Văn A",
  vehiclePlate: "15A-456.78",
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

describe("BUG-W02-102 — BBNT 4 default clauses verbatim theo template + đúng vai Bên A / Bên B", () => {
  it("constants: 4 default clauses tồn tại trong DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES", () => {
    expect(DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES).toHaveLength(4);
  });

  it("constants: clause 1 — Bên B hoàn thành sửa chữa, có placeholder {vehiclePlate}", () => {
    expect(DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES[0]).toBe(
      `Bên B hoàn thành việc sửa chữa xe ô tô biển kiểm soát ${DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN} theo đúng báo giá và quyết toán sửa chữa đã thống nhất.`,
    );
  });

  it("constants: clause 2 — Bên A đồng ý nhận bàn giao xe từ Bên B", () => {
    expect(DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES[1]).toBe(
      "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng.",
    );
  });

  it("constants: clause 3 — Bên B chịu trách nhiệm bảo hành, Bên A có trách nhiệm bảo dưỡng", () => {
    expect(DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES[2]).toBe(
      "Bên B chịu trách nhiệm bảo hành theo nội dung báo giá đã ký kết từ ngày bàn giao; Bên A có trách nhiệm bảo dưỡng, kiểm tra định kỳ và phối hợp xác định nguyên nhân khi có phát sinh.",
    );
  });

  it("constants: clause 4 — Biên bản 02 bản, mỗi bên giữ 01 bản", () => {
    expect(DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES[3]).toBe(
      "Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
    );
  });

  it("constants: KHÔNG còn legacy text (Bên A đã hoàn thành / Bên B (khách hàng))", () => {
    const joined = DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES.join("\n");
    expect(joined).not.toContain("Bên A đã hoàn thành sửa chữa");
    expect(joined).not.toContain("Bên B (khách hàng)");
    expect(joined).not.toContain("Bảo hành theo quy định của garage");
  });

  it("render: clause 1 đã thay placeholder {vehiclePlate} = vehiclePlate trong prefill", () => {
    render(
      <DossierTemplateForm
        variant="acceptanceRecord"
        prefill={buildPrefill({ vehiclePlate: "15A-456.78" })}
      />,
    );

    const clause1 = screen.getByDisplayValue(
      "Bên B hoàn thành việc sửa chữa xe ô tô biển kiểm soát 15A-456.78 theo đúng báo giá và quyết toán sửa chữa đã thống nhất.",
    );
    expect(clause1).toBeInTheDocument();
  });

  it("render: clause 2/3/4 verbatim trong form acceptanceRecord", () => {
    render(
      <DossierTemplateForm
        variant="acceptanceRecord"
        prefill={buildPrefill()}
      />,
    );

    expect(
      screen.getByDisplayValue(
        "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(
        "Bên B chịu trách nhiệm bảo hành theo nội dung báo giá đã ký kết từ ngày bàn giao; Bên A có trách nhiệm bảo dưỡng, kiểm tra định kỳ và phối hợp xác định nguyên nhân khi có phát sinh.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(
        "Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
      ),
    ).toBeInTheDocument();
  });

  it("getAcceptanceValues: clauses array gồm 4 phần tử đã substitute placeholder", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="acceptanceRecord"
        prefill={buildPrefill({ vehiclePlate: "30A-12345" })}
      />,
    );

    const values = ref.current?.getAcceptanceValues();
    expect(values?.clauses).toHaveLength(4);
    expect(values?.clauses[0]).toContain("30A-12345");
    expect(values?.clauses[0]).not.toContain("{vehiclePlate}");
  });

  it("render: vehiclePlate rỗng → placeholder substitute empty string (không leak token)", () => {
    const ref = createRef<DossierTemplateFormRef>();
    render(
      <DossierTemplateForm
        ref={ref}
        variant="acceptanceRecord"
        prefill={buildPrefill({ vehiclePlate: "" })}
      />,
    );

    const values = ref.current?.getAcceptanceValues();
    expect(values?.clauses[0]).not.toContain("{vehiclePlate}");
    expect(values?.clauses[0]).toContain("biển kiểm soát");
  });
});
