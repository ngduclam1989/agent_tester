import { forwardRef, useImperativeHandle, useMemo } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { AddSquare, Edit2, Printer, Trash } from "iconsax-reactjs";

import { Button } from "@/components/share/buttons/button";
import DatePicker from "@/components/share/date-picker/date-picker";
import { Input } from "@/components/share/inputs/input";
import Textarea from "@/components/share/textareas/textarea";

import {
  DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN,
  DOSSIER_ACCEPTANCE_GROUPS,
  DOSSIER_AUTHORIZATION_GROUPS,
  DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES,
  DOSSIER_DEFAULT_AUTHORIZATION_CLAUSES,
  DOSSIER_REPUBLIC_HEADER_LINES,
  DOSSIER_SIGNATURE_BLOCKS,
  type DossierFieldDef,
  type DossierFieldGroup,
} from "../constants";
import type {
  AcceptanceFormInput,
  AuthorizationFormInput,
  DossierTemplatePrefill,
} from "../interfaces";
import {
  acceptanceFormSchema,
  authorizationFormSchema,
} from "../schemas/dossier-template.schema";

type DossierTemplateFormVariant = "acceptanceRecord" | "paymentAuthorization";

interface DossierTemplateFormProps {
  variant: DossierTemplateFormVariant;
  prefill: DossierTemplatePrefill;
  onPrint?: () => void;
  printLabelOverride?: string;
  printDisabled?: boolean;
}

export interface DossierTemplateFormRef {
  getAcceptanceValues: () => AcceptanceFormInput;
  getAuthorizationValues: () => AuthorizationFormInput;
}

const resolvePrefillValue = (
  key: string | undefined,
  context: Record<string, string>,
): string => {
  if (!key) return "";
  return context[key] ?? "";
};

const composeBankInfo = (garage: DossierTemplatePrefill["garage"]): string => {
  const segments: string[] = [];
  if (garage.taxId) segments.push(`MST ${garage.taxId}`);
  if (garage.bankAccount) segments.push(`STK ${garage.bankAccount}`);
  if (garage.bankName) segments.push(garage.bankName);
  return segments.join(" - ");
};

const buildPrefillContext = (
  prefill: DossierTemplatePrefill,
): Record<string, string> => ({
  customerName: prefill.customerName,
  vehiclePlate: prefill.vehiclePlate,
  vehicleModelDisplay: prefill.vehicleModelDisplay,
  serviceOrderCode: prefill.serviceOrderCode,
  estimateDate: prefill.estimateDate,
  estimateReference: prefill.serviceOrderCode
    ? `${prefill.serviceOrderCode}${prefill.estimateDate ? ` ngày ${prefill.estimateDate}` : ""}`
    : "",
  insuranceAmountDisplay: prefill.insuranceAmount
    ? prefill.insuranceAmount.toLocaleString("vi-VN")
    : "",
  insuranceAmountInWords: prefill.insuranceAmountInWords,
  placeAndDate: "",
  "garage.name": prefill.garage.name,
  "garage.delegate": prefill.garage.delegate,
  "garage.delegateTitle": prefill.garage.delegateTitle,
  "garage.address": prefill.garage.address,
  "garage.taxId": prefill.garage.taxId,
  "garage.bankAccount": prefill.garage.bankAccount,
  "garage.bankName": prefill.garage.bankName,
  "garage.bankInfo": composeBankInfo(prefill.garage),
  "garage.phone": prefill.garage.phone,
});

const setDeep = (
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): void => {
  const segments = path.split(".");
  let current: Record<string, unknown> = target;
  segments.forEach((segment, idx) => {
    if (idx === segments.length - 1) {
      current[segment] = value;
      return;
    }
    if (typeof current[segment] !== "object" || current[segment] === null) {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  });
};

const substituteAcceptanceClausePlaceholders = (
  clause: string,
  prefill: DossierTemplatePrefill,
): string =>
  clause.split(DOSSIER_ACCEPTANCE_CLAUSE_PLATE_TOKEN).join(prefill.vehiclePlate ?? "");

const buildAcceptanceDefaults = (
  prefill: DossierTemplatePrefill,
): AcceptanceFormInput => {
  const context = buildPrefillContext(prefill);
  const defaults: Record<string, unknown> = {
    clauses: DOSSIER_DEFAULT_ACCEPTANCE_CLAUSES.map((clause) =>
      substituteAcceptanceClausePlaceholders(clause, prefill),
    ),
  };
  DOSSIER_ACCEPTANCE_GROUPS.forEach((group) => {
    group.fields.forEach((field) => {
      setDeep(
        defaults,
        field.name,
        resolvePrefillValue(field.prefillKey, context),
      );
    });
  });
  return defaults as unknown as AcceptanceFormInput;
};

const buildAuthorizationDefaults = (
  prefill: DossierTemplatePrefill,
): AuthorizationFormInput => {
  const context = buildPrefillContext(prefill);
  const defaults: Record<string, unknown> = {
    commitmentClauses: [...DOSSIER_DEFAULT_AUTHORIZATION_CLAUSES],
    placeIssued: "",
    dateIssued: "",
    placeAndDate: "",
    compensation: {
      amountNumeric: prefill.insuranceAmount ?? 0,
      amountInWords: prefill.insuranceAmountInWords ?? "",
      content: "",
    },
  };
  DOSSIER_AUTHORIZATION_GROUPS.forEach((group) => {
    group.fields.forEach((field) => {
      if (field.name === "compensation.amountNumeric") {
        setDeep(defaults, field.name, prefill.insuranceAmount ?? 0);
        return;
      }
      setDeep(
        defaults,
        field.name,
        resolvePrefillValue(field.prefillKey, context),
      );
    });
  });
  return defaults as unknown as AuthorizationFormInput;
};

const PLACE_AND_DATE_PATTERN = /^(.*?),\s*ngày\s+(\d{2}\/\d{2}\/\d{4})\s*$/i;

const coerceCompensationAmountNumeric = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return 0;
    const parsed = Number(trimmed.replace(/[,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeAuthorizationGetValues = (
  values: AuthorizationFormInput,
): AuthorizationFormInput => ({
  ...values,
  compensation: {
    ...values.compensation,
    amountNumeric: coerceCompensationAmountNumeric(
      values.compensation?.amountNumeric,
    ),
  },
});

export const splitPlaceAndDate = (
  composite: string | undefined,
): { placeIssued: string; dateIssued: string } => {
  if (!composite) return { placeIssued: "", dateIssued: "" };
  const trimmed = composite.trim();
  const match = trimmed.match(PLACE_AND_DATE_PATTERN);
  if (match) {
    return { placeIssued: match[1].trim(), dateIssued: match[2].trim() };
  }
  const separatorIdx = trimmed.toLowerCase().indexOf(", ngày ");
  if (separatorIdx !== -1) {
    return {
      placeIssued: trimmed.slice(0, separatorIdx).trim(),
      dateIssued: trimmed.slice(separatorIdx + 7).trim(),
    };
  }
  return { placeIssued: trimmed, dateIssued: "" };
};

const HeaderRepublic = () => (
  <div
    className="flex flex-col items-center gap-1 py-2 text-center"
    data-testid="dossier-republic-header"
  >
    {DOSSIER_REPUBLIC_HEADER_LINES.map((line, index) => (
      <p
        key={line}
        className={
          index === 0
            ? "text-base font-bold uppercase tracking-wide text-foreground"
            : index === 1
              ? "text-sm font-semibold text-foreground"
              : "text-sm text-foreground"
        }
      >
        {line}
      </p>
    ))}
  </div>
);

const HintBox = () => (
  <div className="flex items-center gap-2 rounded-md border border-warning bg-background-warning px-3 py-2">
    <Edit2
      size={16}
      variant="Linear"
      data-testid="dossier-hint-icon"
      className="shrink-0 text-foreground-warning"
    />
    <span className="text-sm text-foreground-warning">
      {"Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."}
    </span>
  </div>
);

const SignatureBlock = () => (
  <div
    className="mt-6 grid grid-cols-2 gap-6 pt-4"
    data-testid="dossier-signature-block"
  >
    {DOSSIER_SIGNATURE_BLOCKS.map((block) => (
      <div
        key={block.side}
        className="flex min-h-32 flex-col items-center gap-1 text-center"
        data-testid={`dossier-signature-${block.side}`}
      >
        <p className="text-sm font-semibold text-foreground">{block.label}</p>
        <p className="text-xs italic text-muted-foreground">{block.hint}</p>
      </div>
    ))}
  </div>
);

interface FieldRendererProps {
  field: DossierFieldDef;
}

const FieldRenderer = ({ field }: FieldRendererProps) => {
  const fieldType = field.type ?? "text";

  if (field.readOnly) {
    return (
      <Input
        name={field.name}
        label={field.label}
        readOnly
      />
    );
  }

  if (fieldType === "textarea") {
    return (
      <Textarea
        name={field.name}
        label={field.label}
        placeholder={field.placeholder}
      />
    );
  }

  if (fieldType === "date") {
    return (
      <DatePicker name={field.name} label={field.label} />
    );
  }

  return (
    <Input
      name={field.name}
      label={field.label}
      type={fieldType}
      placeholder={field.placeholder}
    />
  );
};

const CARD_SECTION_GROUPS = new Set([
  "parties",
  "customer",
  "garage",
  "vehicle",
]);

const resolveGridClass = (group: DossierFieldGroup): string => {
  switch (group.layout) {
    case "grid-3col":
      return "grid grid-cols-1 gap-3 md:grid-cols-3";
    case "grid-1col":
      return "grid grid-cols-1 gap-3";
    case "grid-2col":
      return "grid grid-cols-1 gap-3 md:grid-cols-2";
    default:
      return group.columns === 1
        ? "grid grid-cols-1 gap-3"
        : "grid grid-cols-1 gap-3 md:grid-cols-2";
  }
};

interface KeyValueRowProps {
  field: DossierFieldDef;
}

const KeyValueRow = ({ field }: KeyValueRowProps) => (
  <div className="grid grid-cols-12 items-center gap-3">
    <label
      htmlFor={field.name}
      className="col-span-12 text-sm font-medium text-foreground md:col-span-3"
    >
      {field.label}
    </label>
    <div className="col-span-12 md:col-span-9">
      <FieldRenderer field={{ ...field, label: "" }} />
    </div>
  </div>
);

interface GroupSectionProps {
  group: DossierFieldGroup;
  testIdPrefix: string;
}

const GroupSection = ({ group, testIdPrefix }: GroupSectionProps) => {
  const isCardSection = CARD_SECTION_GROUPS.has(group.id);

  if (group.layout === "cardKeyValueGrid2col") {
    const body = (
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
        {group.fields.map((field) => (
          <KeyValueRow key={field.name} field={field} />
        ))}
      </div>
    );

    return (
      <section
        className="overflow-hidden rounded-md border border-border bg-muted/50"
        data-testid={`${testIdPrefix}-group-${group.id}`}
      >
        {group.title ? (
          <header className="px-4 py-2 text-sm font-semibold text-foreground">
            {group.title}
          </header>
        ) : null}
        <div className="space-y-3 p-4">
          {group.subTitle ? (
            <p className="text-sm text-muted-foreground">{group.subTitle}</p>
          ) : null}
          {body}
        </div>
      </section>
    );
  }

  if (group.layout === "keyValueList") {
    const body = (
      <div className="flex flex-col gap-3">
        {group.fields.map((field) => (
          <KeyValueRow key={field.name} field={field} />
        ))}
      </div>
    );

    if (isCardSection && group.title) {
      return (
        <section
          className="overflow-hidden rounded-md border border-border bg-muted/50"
          data-testid={`${testIdPrefix}-group-${group.id}`}
        >
          <header className="px-4 py-2 text-sm font-semibold text-foreground">
            {group.title}
          </header>
          <div className="space-y-3 p-4">
            {group.subTitle ? (
              <p className="text-sm text-muted-foreground">{group.subTitle}</p>
            ) : null}
            {body}
          </div>
        </section>
      );
    }

    return (
      <section
        className="flex flex-col gap-3"
        data-testid={`${testIdPrefix}-group-${group.id}`}
      >
        {group.title ? (
          <h4 className="text-sm font-semibold text-foreground">
            {group.title}
          </h4>
        ) : null}
        {group.subTitle ? (
          <p className="text-sm text-muted-foreground">{group.subTitle}</p>
        ) : null}
        {body}
      </section>
    );
  }

  const fields = (
    <div className={resolveGridClass(group)}>
      {group.fields.map((field) => (
        <FieldRenderer key={field.name} field={field} />
      ))}
    </div>
  );

  if (isCardSection && group.title) {
    return (
      <section
        className="overflow-hidden rounded-md border border-border bg-muted/50"
        data-testid={`${testIdPrefix}-group-${group.id}`}
      >
        <header className="px-4 py-2 text-sm font-semibold text-foreground">
          {group.title}
        </header>
        <div className="space-y-3 p-4">
          {group.subTitle ? (
            <p className="text-sm text-muted-foreground">{group.subTitle}</p>
          ) : null}
          {fields}
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col gap-3"
      data-testid={`${testIdPrefix}-group-${group.id}`}
    >
      {group.title ? (
        <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
      ) : null}
      {group.subTitle ? (
        <p className="text-sm text-muted-foreground">{group.subTitle}</p>
      ) : null}
      {fields}
    </section>
  );
};

interface ClauseArraySectionProps {
  title: string;
  name: string;
  testIdPrefix: string;
}

const ClauseArraySection = ({
  title,
  name,
  testIdPrefix,
}: ClauseArraySectionProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  return (
    <section className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ol
        className="flex flex-col gap-3"
        data-testid={`${testIdPrefix}-clauses`}
      >
        {fields.map((field, index) => (
          <li key={field.id} className="flex items-start gap-2">
            <span className="mt-2 w-6 shrink-0 text-sm font-medium text-foreground">
              {index + 1}.
            </span>
            <div className="flex-1">
              <Textarea
                name={`${name}.${index}`}
                label=""
                rows={1}
                data-testid={`${testIdPrefix}-clauses-item-${index}`}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Xoá điều khoản"
              data-testid={`${testIdPrefix}-clauses-remove-${index}`}
            >
              <Trash
                size={16}
                variant="Linear"
                data-testid={`${testIdPrefix}-clauses-remove-icon-${index}`}
                className="text-muted-foreground hover:text-destructive"
              />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        onClick={() => append("" as never)}
        className="w-full justify-center"
        data-testid={`${testIdPrefix}-clauses-add`}
      >
        <AddSquare
          size={16}
          className="mr-1"
          variant="Linear"
          data-testid={`${testIdPrefix}-clauses-add-icon`}
        />
        {"Thêm mục điều khoản"}
      </Button>
    </section>
  );
};

interface TemplateBodyProps<TForm extends FieldValues> {
  title: string;
  groups: DossierFieldGroup[];
  form: UseFormReturn<TForm>;
  clauseName: Path<TForm>;
  clauseTitle: string;
  printLabel: string;
  testIdPrefix: string;
  testIdRoot: string;
  onPrint?: () => void;
  printDisabled?: boolean;
}

const TemplateBody = <TForm extends FieldValues>({
  title,
  groups,
  form,
  clauseName,
  clauseTitle,
  printLabel,
  testIdPrefix,
  testIdRoot,
  onPrint,
  printDisabled,
}: TemplateBodyProps<TForm>) => (
  <FormProvider {...form}>
    <div className="flex flex-col gap-4 p-6 bg-white border-t border-border" data-testid={testIdRoot}>
      <HeaderRepublic />
      <h3 className="text-center text-lg font-bold uppercase text-foreground">
        {title}
      </h3>
      <HintBox />

      {groups.map((group) => (
        <GroupSection
          key={group.id}
          group={group}
          testIdPrefix={testIdPrefix}
        />
      ))}

      <ClauseArraySection
        title={clauseTitle}
        name={clauseName as string}
        testIdPrefix={testIdPrefix}
      />

      <SignatureBlock />

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="process"
          size="sm"
          onClick={onPrint}
          disabled={printDisabled}
          isLoading={printDisabled}
          data-testid={`${testIdPrefix}-print-button`}
          className="text-primary"
        >
          <Printer size={16} className="mr-1" variant="Linear" />
          {printLabel}
        </Button>
      </div>
    </div>
  </FormProvider>
);

const DossierTemplateForm = forwardRef<
  DossierTemplateFormRef,
  DossierTemplateFormProps
>(({ variant, prefill, onPrint, printLabelOverride, printDisabled }, ref) => {
  const acceptanceDefaults = useMemo(
    () => buildAcceptanceDefaults(prefill),
    [prefill],
  );
  const authorizationDefaults = useMemo(
    () => buildAuthorizationDefaults(prefill),
    [prefill],
  );

  const acceptanceForm = useForm<AcceptanceFormInput>({
    defaultValues: acceptanceDefaults,
    resolver: zodResolver(acceptanceFormSchema) as never,
    mode: "onChange",
  });
  const authorizationForm = useForm<AuthorizationFormInput>({
    defaultValues: authorizationDefaults,
    resolver: zodResolver(authorizationFormSchema) as never,
    mode: "onChange",
  });

  useImperativeHandle(
    ref,
    () => ({
      getAcceptanceValues: () => acceptanceForm.getValues(),
      getAuthorizationValues: () =>
        normalizeAuthorizationGetValues(authorizationForm.getValues()),
    }),
    [acceptanceForm, authorizationForm],
  );

  if (variant === "acceptanceRecord") {
    return (
      <TemplateBody<AcceptanceFormInput>
        title="BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG"
        groups={DOSSIER_ACCEPTANCE_GROUPS}
        form={acceptanceForm}
        clauseName={"clauses" as Path<AcceptanceFormInput>}
        clauseTitle="Nội dung nghiệm thu"
        printLabel={printLabelOverride ?? "In biên bản"}
        testIdPrefix="acceptance"
        testIdRoot="dossier-template-form-acceptance"
        onPrint={onPrint}
        printDisabled={printDisabled}
      />
    );
  }

  return (
    <TemplateBody<AuthorizationFormInput>
      title="GIẤY ỦY QUYỀN"
      groups={DOSSIER_AUTHORIZATION_GROUPS}
      form={authorizationForm}
      clauseName={"commitmentClauses" as Path<AuthorizationFormInput>}
      clauseTitle="Mục IV. Cam kết"
      printLabel={printLabelOverride ?? "In giấy ủy quyền"}
      testIdPrefix="authorization"
      testIdRoot="dossier-template-form-authorization"
      onPrint={onPrint}
      printDisabled={printDisabled}
    />
  );
});

DossierTemplateForm.displayName = "DossierTemplateForm";

export default DossierTemplateForm;
