import { describe, expect, it } from "vitest";

import {
  acceptanceFormSchema,
  authorizationFormSchema,
} from "./dossier-template.schema";

const validBaseAuthorizationInput = {
  placeIssued: "Hà Nội",
  dateIssued: "24/06/2026",
  placeAndDate: "Hà Nội, ngày 24/06/2026",
  customer: {
    name: "Nguyễn Văn A",
    address: "12 Lê Lợi",
    nationality: "Việt Nam",
    delegate: "",
    delegateTitle: "",
    insuranceCertNo: "",
    nationalIdIssueDate: "",
    nationalIdIssuer: "",
    nationalId: "",
  },
  garage: {
    name: "Garage X",
    taxId: "012",
    delegate: "Trần B",
    delegateTitle: "Giám đốc",
    bankAccount: "1",
    address: "Hà Nội",
    phone: "0901",
    bankName: "VCB",
  },
  vehicle: { type: "Hyundai Accent", licensePlate: "30A-12345" },
  accidentDate: "20/06/2026",
  compensation: {
    amountInWords: "Tám triệu...",
    content: "Va chạm",
  },
  commitmentClauses: [
    "Điều khoản 1",
    "Điều khoản 2",
    "Điều khoản 3",
  ],
};

const collectIssueMessages = (
  result: ReturnType<typeof authorizationFormSchema.safeParse>,
): string[] => {
  if (result.success) return [];
  return result.error.issues.map((i) => i.message);
};

describe("BUG-W02-103 — Zod validate messages tiếng Việt cho amountNumeric + required fields", () => {
  it("amountNumeric = non-numeric string → message tiếng Việt 'Vui lòng nhập số hợp lệ' (KHÔNG 'Expected number')", () => {
    const result = authorizationFormSchema.safeParse({
      ...validBaseAuthorizationInput,
      compensation: {
        ...validBaseAuthorizationInput.compensation,
        amountNumeric: "575757567f",
      },
    });
    expect(result.success).toBe(false);
    const messages = collectIssueMessages(result);
    expect(messages).toContain("Vui lòng nhập số hợp lệ");
    messages.forEach((m) => {
      expect(m).not.toMatch(/Expected number/i);
      expect(m).not.toMatch(/received nan/i);
      expect(m).not.toMatch(/received string/i);
    });
  });

  it("amountNumeric = negative number → message tiếng Việt 'Vui lòng nhập số không âm'", () => {
    const result = authorizationFormSchema.safeParse({
      ...validBaseAuthorizationInput,
      compensation: {
        ...validBaseAuthorizationInput.compensation,
        amountNumeric: -5,
      },
    });
    expect(result.success).toBe(false);
    const messages = collectIssueMessages(result);
    expect(messages).toContain("Vui lòng nhập số không âm");
  });

  it("amountNumeric = valid number → pass (regression baseline)", () => {
    const result = authorizationFormSchema.safeParse({
      ...validBaseAuthorizationInput,
      compensation: {
        ...validBaseAuthorizationInput.compensation,
        amountNumeric: 8447207,
      },
    });
    expect(result.success).toBe(true);
  });

  it("amountNumeric = numeric string → coerced + pass (BUG-W02-066 regression)", () => {
    const result = authorizationFormSchema.safeParse({
      ...validBaseAuthorizationInput,
      compensation: {
        ...validBaseAuthorizationInput.compensation,
        amountNumeric: "8447207",
      },
    });
    expect(result.success).toBe(true);
  });

  it("required field bỏ trống (placeIssued = undefined) → message tiếng Việt 'Vui lòng nhập thông tin'", () => {
    const { placeIssued: _drop, ...rest } = validBaseAuthorizationInput;
    const result = authorizationFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
    const messages = collectIssueMessages(result);
    expect(messages).toContain("Vui lòng nhập thông tin");
    messages.forEach((m) => {
      expect(m).not.toMatch(/Required/i);
      expect(m).not.toMatch(/Expected string/i);
    });
  });

  it("commitmentClauses < 3 → message tiếng Việt 'Vui lòng nhập ít nhất 3 điều khoản cam kết'", () => {
    const result = authorizationFormSchema.safeParse({
      ...validBaseAuthorizationInput,
      compensation: {
        ...validBaseAuthorizationInput.compensation,
        amountNumeric: 100,
      },
      commitmentClauses: ["A", "B"],
    });
    expect(result.success).toBe(false);
    const messages = collectIssueMessages(result);
    expect(messages).toContain("Vui lòng nhập ít nhất 3 điều khoản cam kết");
  });

  it("acceptanceFormSchema: clauses rỗng → message tiếng Việt 'Vui lòng nhập ít nhất 1 điều khoản nghiệm thu'", () => {
    const result = acceptanceFormSchema.safeParse({
      licensePlate: "30A-12345",
      billDate: "25/06/2026",
      customer: { name: "Nguyễn Văn A" },
      garage: { name: "Garage X", address: "Hà Nội" },
      clauses: [],
    });
    expect(result.success).toBe(false);
    const messages = collectIssueMessages(
      result as ReturnType<typeof authorizationFormSchema.safeParse>,
    );
    expect(messages).toContain("Vui lòng nhập ít nhất 1 điều khoản nghiệm thu");
  });

  it("acceptanceFormSchema: licensePlate required missing → message tiếng Việt", () => {
    const result = acceptanceFormSchema.safeParse({
      billDate: "25/06/2026",
      customer: { name: "Nguyễn Văn A" },
      garage: { name: "Garage X", address: "Hà Nội" },
      clauses: ["A"],
    });
    expect(result.success).toBe(false);
    const messages = collectIssueMessages(
      result as ReturnType<typeof authorizationFormSchema.safeParse>,
    );
    expect(messages).toContain("Vui lòng nhập thông tin");
  });
});
