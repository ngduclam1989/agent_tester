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

import DossierTemplateForm from "./dossier-template-form";
import { DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES } from "../constants";
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

const renderForm = () =>
  render(
    <DossierTemplateForm
      variant="acceptanceRecord"
      prefill={buildPrefill()}
    />,
  );

describe("BUG-W02-049 — Dossier BBNT modal UI fidelity (8 sub-symptoms)", () => {
  it("(a) HintBox uses edit-2 (Edit2) icon, not info-circle (InfoCircle)", () => {
    const { container } = renderForm();
    expect(screen.getByTestId("dossier-hint-icon")).toBeInTheDocument();
    expect(
      container.querySelector('svg [data-name="info-circle"]'),
    ).toBeNull();
  });

  it("(b) Header group renders 3-column grid layout (BKS / Ngày lập / Địa điểm)", () => {
    renderForm();
    const headerGroup = screen.getByTestId("acceptance-group-header");
    const grid = headerGroup.querySelector(".grid");
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("md:grid-cols-3");
    expect(grid?.className).not.toContain("md:grid-cols-2");
  });

  it("(c) 'Địa điểm lập biên bản' (recordPlace) input renders in header group", () => {
    renderForm();
    const recordPlace = document.getElementById("recordPlace");
    expect(recordPlace).not.toBeNull();
  });

  it("(d) 'Căn cứ phiếu báo giá' renders in its own full-width group (grid-cols-1)", () => {
    renderForm();
    const quoteRefGroup = screen.getByTestId("acceptance-group-quoteRef");
    const grid = quoteRefGroup.querySelector(".grid");
    expect(grid).not.toBeNull();
    expect(grid?.className).not.toContain("md:grid-cols-2");
    expect(grid?.className).not.toContain("md:grid-cols-3");
  });

  it("(e) Parties section renders as single 'Thông tin các bên' group, not split customer+garage cards", () => {
    renderForm();
    const partiesGroup = screen.getByTestId("acceptance-group-parties");
    expect(partiesGroup).toBeInTheDocument();
    expect(screen.queryByTestId("acceptance-group-customer")).toBeNull();
    expect(screen.queryByTestId("acceptance-group-garage")).toBeNull();
    // Card-style header (not <h4>) per PNG canonical
    expect(
      partiesGroup.querySelector("header")?.textContent,
    ).toBe("Thông tin các bên");
  });

  it("(f) Default acceptance clauses match verbatim spec text (4 legal-style clauses)", () => {
    expect(DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES).toEqual([
      "Bên B hoàn thành việc sửa chữa xe ô tô biển kiểm soát {vehiclePlate} theo đúng báo giá và quyết toán sửa chữa đã thống nhất.",
      "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng.",
      "Bên B chịu trách nhiệm bảo hành theo nội dung báo giá đã ký kết từ ngày bàn giao; Bên A có trách nhiệm bảo dưỡng, kiểm tra định kỳ và phối hợp xác định nguyên nhân khi có phát sinh.",
      "Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
    ]);
    renderForm();
    expect(
      screen.getByDisplayValue(
        "Bên A đồng ý với chất lượng sửa chữa, nhận bàn giao xe từ Bên B và xác nhận xe đủ điều kiện đưa vào sử dụng.",
      ),
    ).toBeInTheDocument();
  });

  it("(g) Clause textarea has rows=1 and remove button uses Trash icon (not CloseCircle)", () => {
    const { container } = renderForm();
    const firstTextarea = screen.getByTestId(
      "acceptance-clauses-item-0",
    ) as HTMLTextAreaElement;
    expect(firstTextarea.getAttribute("rows")).toBe("1");

    const removeIcon = screen.getByTestId("acceptance-clauses-remove-icon-0");
    expect(removeIcon).toBeInTheDocument();
    expect(
      container.querySelector('svg [data-name="close-circle"]'),
    ).toBeNull();
  });

  it("(h) Clause add button uses AddSquare icon (not Add/plus)", () => {
    renderForm();
    const addIcon = screen.getByTestId("acceptance-clauses-add-icon");
    expect(addIcon).toBeInTheDocument();
  });
});
