import { z } from "zod";

const REQUIRED_MESSAGE = "Vui lòng nhập thông tin";
const NUMBER_INVALID_MESSAGE = "Vui lòng nhập số hợp lệ";
const NUMBER_NONNEGATIVE_MESSAGE = "Vui lòng nhập số không âm";
const MIN_CLAUSES_ACCEPTANCE_MESSAGE =
  "Vui lòng nhập ít nhất 1 điều khoản nghiệm thu";
const MIN_CLAUSES_AUTHORIZATION_MESSAGE =
  "Vui lòng nhập ít nhất 3 điều khoản cam kết";

const trimmedString = z
  .string({
    required_error: REQUIRED_MESSAGE,
    invalid_type_error: REQUIRED_MESSAGE,
  })
  .transform((v) => (typeof v === "string" ? v.trim() : v));

const optionalTrimmedString = trimmedString.optional();

const quoteReferenceSchema = z
  .object({
    code: optionalTrimmedString,
    date: optionalTrimmedString,
  })
  .optional();

const acceptanceCustomerSchema = z.object({
  name: trimmedString,
  address: optionalTrimmedString,
});

const acceptanceGarageSchema = z.object({
  name: trimmedString,
  delegate: optionalTrimmedString,
  delegateTitle: optionalTrimmedString,
  address: trimmedString,
  taxId: optionalTrimmedString,
  bankAccount: optionalTrimmedString,
  bankName: optionalTrimmedString,
  bankInfo: optionalTrimmedString,
});

export const acceptanceFormSchema = z.object({
  licensePlate: trimmedString,
  billDate: trimmedString,
  recordPlace: optionalTrimmedString,
  quoteReference: quoteReferenceSchema,
  customer: acceptanceCustomerSchema,
  garage: acceptanceGarageSchema,
  clauses: z
    .array(z.string())
    .min(1, { message: MIN_CLAUSES_ACCEPTANCE_MESSAGE })
    .default([]),
});

export type AcceptanceFormValues = z.infer<typeof acceptanceFormSchema>;

const authorizationCustomerSchema = z.object({
  name: trimmedString,
  address: trimmedString,
  nationality: optionalTrimmedString,
  delegate: optionalTrimmedString,
  delegateTitle: optionalTrimmedString,
  insuranceCertNo: optionalTrimmedString,
  nationalIdIssueDate: optionalTrimmedString,
  nationalIdIssuer: optionalTrimmedString,
  nationalId: optionalTrimmedString,
});

const authorizationGarageSchema = z.object({
  name: trimmedString,
  taxId: optionalTrimmedString,
  delegate: optionalTrimmedString,
  delegateTitle: optionalTrimmedString,
  bankAccount: optionalTrimmedString,
  address: optionalTrimmedString,
  phone: optionalTrimmedString,
  bankName: optionalTrimmedString,
});

const authorizationVehicleSchema = z.object({
  type: trimmedString,
  licensePlate: trimmedString,
});

const authorizationCompensationSchema = z.object({
  amountNumeric: z.coerce
    .number({
      required_error: REQUIRED_MESSAGE,
      invalid_type_error: NUMBER_INVALID_MESSAGE,
    })
    .nonnegative({ message: NUMBER_NONNEGATIVE_MESSAGE }),
  amountInWords: trimmedString,
  content: trimmedString,
});

export const authorizationFormSchema = z.object({
  placeIssued: trimmedString,
  dateIssued: trimmedString,
  placeAndDate: optionalTrimmedString,
  customer: authorizationCustomerSchema,
  garage: authorizationGarageSchema,
  vehicle: authorizationVehicleSchema,
  accidentDate: trimmedString,
  compensation: authorizationCompensationSchema,
  commitmentClauses: z
    .array(z.string())
    .min(3, { message: MIN_CLAUSES_AUTHORIZATION_MESSAGE })
    .default([]),
});

export type AuthorizationFormValues = z.infer<typeof authorizationFormSchema>;
