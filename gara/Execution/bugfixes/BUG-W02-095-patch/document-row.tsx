import { ReactNode } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DOSSIER_ACCORDION_VALUE,
  DOSSIER_CHECKBOX_TESTID_BY_DOC,
  DOSSIER_DOCUMENT_LABELS,
  DOSSIER_TESTID_BY_DOC,
  type InsuranceDossierDocType,
} from "../constants";

interface DocumentRowProps {
  type: InsuranceDossierDocType;
  subtitle: string;
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
  children: ReactNode;
}

const DocumentRow = ({
  type,
  subtitle,
  selected,
  onSelectedChange,
  children,
}: DocumentRowProps) => {
  const value = DOSSIER_ACCORDION_VALUE[type];

  return (
    <AccordionItem
      value={value}
      data-testid={DOSSIER_TESTID_BY_DOC[type]}
      className="rounded-md border border-border bg-gray-50"
    >
      <div className="flex w-full items-center gap-3 px-4 py-3">
        <Checkbox
          data-testid={DOSSIER_CHECKBOX_TESTID_BY_DOC[type]}
          checked={selected}
          onCheckedChange={(value) => onSelectedChange(Boolean(value))}
          aria-label={DOSSIER_DOCUMENT_LABELS[type]}
          className="mt-0.5"
        />
        <AccordionTrigger headerClassName="w-full" className="flex flex-1 items-center gap-3 py-0 w-full max-w-full">
          <div className="flex flex-1 flex-col gap-1 text-left">
            <span className="text-base font-semibold text-foreground">
              {DOSSIER_DOCUMENT_LABELS[type]}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </AccordionTrigger>
      </div>
      <AccordionContent className="pb-0">{children}</AccordionContent>
    </AccordionItem>
  );
};

export default DocumentRow;
