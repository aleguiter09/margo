"use client";

import { Button } from "@/ui/button";
import { useTranslations } from "next-intl";

type CreateMovementInput = {
  type?: string;
  amount?: number;
  description?: string;
  date?: string;
  accountName?: string;
  categoryName?: string;
  toAccountName?: string;
  schedule?: string;
  frequency?: string;
  installmentCount?: number;
};

type CreateMovementOutput =
  | { success: true; summary: string }
  | { success: false; error: string }
  | undefined;

type Props = {
  state: string;
  input: CreateMovementInput;
  output?: CreateMovementOutput;
  approvalId?: string;
  onApprove: (approvalId: string) => void;
  onDeny: (approvalId: string) => void;
};

function formatPreview(input: CreateMovementInput) {
  const parts = [
    input.type,
    input.amount != null ? String(input.amount) : null,
    input.description,
    input.accountName ? `@ ${input.accountName}` : null,
    input.categoryName ? `/ ${input.categoryName}` : null,
    input.toAccountName ? `→ ${input.toAccountName}` : null,
    input.schedule && input.schedule !== "once" ? input.schedule : null,
    input.frequency,
    input.installmentCount != null ? `x${input.installmentCount}` : null,
    input.date,
  ].filter(Boolean);

  return parts.join(" · ");
}

export function CreateMovementApprovalCard({
  state,
  input,
  output,
  approvalId,
  onApprove,
  onDeny,
}: Props) {
  const t = useTranslations("ai");

  if (state === "approval-requested" && approvalId) {
    return (
      <div className="mt-2 rounded-xl border border-border bg-card p-3 shadow-xs">
        <p className="text-sm font-medium text-foreground">
          {t("approvalPending")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPreview(input)}
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => onApprove(approvalId)}
          >
            {t("approve")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDeny(approvalId)}
          >
            {t("deny")}
          </Button>
        </div>
      </div>
    );
  }

  if (state === "output-denied") {
    return (
      <p className="mt-2 text-sm text-muted-foreground">{t("approvalDenied")}</p>
    );
  }

  if (state === "input-available" || state === "approval-responded") {
    return (
      <p className="mt-2 text-sm text-muted-foreground">{t("approvalRunning")}</p>
    );
  }

  if (state === "output-available") {
    if (output && output.success) {
      return (
        <p className="mt-2 text-sm text-income">
          {t("approvalSuccess")} {output.summary}
        </p>
      );
    }
    return (
      <p className="mt-2 text-sm text-destructive">
        {t("approvalError")}
        {output && !output.success ? ` ${output.error}` : ""}
      </p>
    );
  }

  return null;
}
