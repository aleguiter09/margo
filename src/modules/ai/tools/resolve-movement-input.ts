import { getAccounts } from "@/modules/accounts/services/accounts";
import { getCategories } from "@/modules/categories/services/categories";
import { INCOME_PARENT_ID } from "@/modules/categories/adapters/categories.adapter";
import { MovementSchema } from "@/modules/shared/utils/schemas";
import type { z } from "zod";
import { resolveEntityByName } from "../utils/resolve-entity";
import type { CreateMovementToolInput } from "../types/types";

type MovementPayload = z.infer<typeof MovementSchema>;

type ResolveResult =
  | { ok: true; payload: MovementPayload; summary: string }
  | { ok: false; error: string };

function toIsoDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T12:00:00.000Z`).toISOString();
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("invalid_date");
  }
  return parsed.toISOString();
}

export async function resolveCreateMovementInput(
  input: CreateMovementToolInput,
): Promise<ResolveResult> {
  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  const accountEntities = accounts
    .filter((account): account is { id: number; name: string; balance: number } =>
      typeof account.id === "number" && typeof account.name === "string",
    )
    .map((account) => ({ id: account.id, name: account.name }));

  const fromAccount = resolveEntityByName(accountEntities, input.accountName);
  if (fromAccount.status === "not_found") {
    return {
      ok: false,
      error: `Account "${input.accountName}" was not found. Available: ${accountEntities.map((a) => a.name).join(", ") || "none"}`,
    };
  }
  if (fromAccount.status === "ambiguous") {
    return {
      ok: false,
      error: `Account "${input.accountName}" is ambiguous. Matches: ${fromAccount.matches.map((m) => m.name).join(", ")}`,
    };
  }

  let doneAt: string;
  try {
    doneAt = toIsoDate(input.date);
  } catch {
    return {
      ok: false,
      error: `Invalid date "${input.date}". Use YYYY-MM-DD or an ISO datetime.`,
    };
  }

  const expenseCategories = categories
    .filter(
      (category) =>
        category.id != null &&
        category.title &&
        category.parent_id != null &&
        String(category.parent_id) !== INCOME_PARENT_ID,
    )
    .map((category) => ({
      id: category.id as number,
      name: category.title as string,
    }));

  const incomeCategories = categories
    .filter(
      (category) =>
        category.id != null &&
        category.title &&
        String(category.parent_id) === INCOME_PARENT_ID,
    )
    .map((category) => ({
      id: category.id as number,
      name: category.title as string,
    }));

  if (input.type === "transfer") {
    if (!input.toAccountName) {
      return {
        ok: false,
        error: "Transfers require toAccountName (destination account).",
      };
    }
    const toAccount = resolveEntityByName(accountEntities, input.toAccountName);
    if (toAccount.status === "not_found") {
      return {
        ok: false,
        error: `Destination account "${input.toAccountName}" was not found.`,
      };
    }
    if (toAccount.status === "ambiguous") {
      return {
        ok: false,
        error: `Destination account "${input.toAccountName}" is ambiguous. Matches: ${toAccount.matches.map((m) => m.name).join(", ")}`,
      };
    }

    const payloadCandidate = {
      type: "transfer" as const,
      amount: input.amount,
      description: input.description,
      done_at: doneAt,
      from: fromAccount.id,
      where: toAccount.id,
      schedule: "once" as const,
    };
    const parsed = MovementSchema.safeParse(payloadCandidate);
    if (!parsed.success) {
      return { ok: false, error: `Validation failed: ${parsed.error.message}` };
    }

    return {
      ok: true,
      payload: parsed.data,
      summary: `Transfer ${input.amount} from ${fromAccount.name} to ${toAccount.name} (${input.description}) on ${doneAt.slice(0, 10)}`,
    };
  }

  if (!input.categoryName) {
    return {
      ok: false,
      error: `${input.type} movements require categoryName.`,
    };
  }

  const categoryPool =
    input.type === "income" ? incomeCategories : expenseCategories;
  const category = resolveEntityByName(categoryPool, input.categoryName);
  if (category.status === "not_found") {
    return {
      ok: false,
      error: `Category "${input.categoryName}" was not found for ${input.type}. Available: ${categoryPool.map((c) => c.name).join(", ") || "none"}`,
    };
  }
  if (category.status === "ambiguous") {
    return {
      ok: false,
      error: `Category "${input.categoryName}" is ambiguous. Matches: ${category.matches.map((m) => m.name).join(", ")}`,
    };
  }

  if (input.type === "income") {
    const payloadCandidate = {
      type: "income" as const,
      amount: input.amount,
      description: input.description,
      done_at: doneAt,
      from: fromAccount.id,
      category: category.id,
      schedule: "once" as const,
    };
    const parsed = MovementSchema.safeParse(payloadCandidate);
    if (!parsed.success) {
      return { ok: false, error: `Validation failed: ${parsed.error.message}` };
    }
    return {
      ok: true,
      payload: parsed.data,
      summary: `Income ${input.amount} in ${fromAccount.name} / ${category.name} (${input.description}) on ${doneAt.slice(0, 10)}`,
    };
  }

  if (input.schedule === "recurring") {
    if (!input.frequency) {
      return {
        ok: false,
        error: "Recurring expenses require frequency (weekly|biweekly|monthly|yearly).",
      };
    }
    const payloadCandidate = {
      type: "expense" as const,
      amount: input.amount,
      description: input.description,
      done_at: doneAt,
      from: fromAccount.id,
      category: category.id,
      schedule: "recurring" as const,
      frequency: input.frequency,
      end_date: input.endDate ?? null,
    };
    const parsed = MovementSchema.safeParse(payloadCandidate);
    if (!parsed.success) {
      return { ok: false, error: `Validation failed: ${parsed.error.message}` };
    }
    return {
      ok: true,
      payload: parsed.data,
      summary: `Recurring expense ${input.amount} (${input.frequency}) in ${fromAccount.name} / ${category.name} (${input.description}) starting ${doneAt.slice(0, 10)}`,
    };
  }

  if (input.schedule === "installment") {
    if (!input.installmentCount) {
      return {
        ok: false,
        error: "Installment expenses require installmentCount (2-60).",
      };
    }
    const payloadCandidate = {
      type: "expense" as const,
      amount: input.amount,
      description: input.description,
      done_at: doneAt,
      from: fromAccount.id,
      category: category.id,
      schedule: "installment" as const,
      installment_count: input.installmentCount,
    };
    const parsed = MovementSchema.safeParse(payloadCandidate);
    if (!parsed.success) {
      return { ok: false, error: `Validation failed: ${parsed.error.message}` };
    }
    return {
      ok: true,
      payload: parsed.data,
      summary: `Installment expense total ${input.amount} x${input.installmentCount} in ${fromAccount.name} / ${category.name} (${input.description}) starting ${doneAt.slice(0, 10)}`,
    };
  }

  const payloadCandidate = {
    type: "expense" as const,
    amount: input.amount,
    description: input.description,
    done_at: doneAt,
    from: fromAccount.id,
    category: category.id,
    schedule: "once" as const,
  };
  const parsed = MovementSchema.safeParse(payloadCandidate);
  if (!parsed.success) {
    return { ok: false, error: `Validation failed: ${parsed.error.message}` };
  }
  return {
    ok: true,
    payload: parsed.data,
    summary: `Expense ${input.amount} in ${fromAccount.name} / ${category.name} (${input.description}) on ${doneAt.slice(0, 10)}`,
  };
}
