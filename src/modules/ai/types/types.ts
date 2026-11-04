export type ResolvedEntity =
  | { status: "ok"; id: number; name: string }
  | { status: "ambiguous"; matches: { id: number; name: string }[] }
  | { status: "not_found"; query: string };

export type CreateMovementToolInput = {
  type: "expense" | "income" | "transfer";
  amount: number;
  description: string;
  date: string;
  accountName: string;
  categoryName?: string;
  toAccountName?: string;
  schedule: "once" | "recurring" | "installment";
  frequency?: "weekly" | "biweekly" | "monthly" | "yearly";
  endDate?: string | null;
  installmentCount?: number;
};
