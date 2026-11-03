import { tool } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAccounts } from "@/modules/accounts/services/accounts";
import { getCategories } from "@/modules/categories/services/categories";
import { INCOME_PARENT_ID } from "@/modules/categories/adapters/categories.adapter";
import {
  getCategoryComparison,
  getMonthlyCashflow,
} from "@/modules/analytics/services/analytics";
import { getBudgetProgress } from "@/modules/budgets/services/budgets";
import {
  getMonthExpenses,
  getMonthIncomes,
} from "@/modules/movements/services/movements-aggregations";
import { getLastMovements } from "@/modules/movements/services/movements-queries";
import { insertMovement } from "@/modules/movements/services/movements";
import { resolveCreateMovementInput } from "./resolve-movement-input";

const accountIdSchema = z
  .string()
  .optional()
  .describe('Account id as string, or "all" for every account. Defaults to "all".');

const createMovementInputSchema = z.object({
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive().max(999999),
  description: z.string().min(1).max(500),
  date: z
    .string()
    .describe("Movement date as YYYY-MM-DD or ISO datetime. Use today when the user says today."),
  accountName: z.string().min(1).describe("Source account name as shown to the user"),
  categoryName: z
    .string()
    .optional()
    .describe("Required for expense and income. Must match an existing category title."),
  toAccountName: z
    .string()
    .optional()
    .describe("Required for transfers. Destination account name."),
  schedule: z
    .enum(["once", "recurring", "installment"])
    .default("once")
    .describe("once for one-off; recurring/installment only for expenses"),
  frequency: z
    .enum(["weekly", "biweekly", "monthly", "yearly"])
    .optional()
    .describe("Required when schedule is recurring"),
  endDate: z
    .string()
    .nullable()
    .optional()
    .describe("Optional end date for recurring series (YYYY-MM-DD)"),
  installmentCount: z
    .number()
    .int()
    .min(2)
    .max(60)
    .optional()
    .describe("Required when schedule is installment. amount is the TOTAL to split."),
});

export function createAiTools() {
  return {
    listAccounts: tool({
      description: "List the user's accounts with current balances.",
      inputSchema: z.object({}),
      execute: async () => {
        const accounts = await getAccounts();
        return accounts.map((account) => ({
          id: account.id,
          name: account.name,
          balance: account.balance,
        }));
      },
    }),

    listCategories: tool({
      description:
        "List expense and income categories available for creating movements.",
      inputSchema: z.object({}),
      execute: async () => {
        const categories = await getCategories();
        const expense = categories
          .filter(
            (category) =>
              category.parent_id != null &&
              String(category.parent_id) !== INCOME_PARENT_ID &&
              !category.is_hidden,
          )
          .map((category) => ({
            id: category.id,
            title: category.title,
          }));
        const income = categories
          .filter(
            (category) =>
              String(category.parent_id) === INCOME_PARENT_ID &&
              !category.is_hidden,
          )
          .map((category) => ({
            id: category.id,
            title: category.title,
          }));
        return { expense, income };
      },
    }),

    getMonthSummary: tool({
      description:
        "Get this month's applied income total, expense total, net, and account balances.",
      inputSchema: z.object({
        accountId: accountIdSchema,
      }),
      execute: async ({ accountId }) => {
        const id = accountId ?? "all";
        const [incomes, expenses, accounts] = await Promise.all([
          getMonthIncomes(id),
          getMonthExpenses(id),
          getAccounts(),
        ]);
        const filteredAccounts =
          id === "all"
            ? accounts
            : accounts.filter((account) => String(account.id) === id);
        const totalBalance = filteredAccounts.reduce(
          (sum, account) => sum + Number(account.balance || 0),
          0,
        );
        return {
          incomes,
          expenses,
          net: incomes - expenses,
          totalBalance,
          accounts: filteredAccounts.map((account) => ({
            id: account.id,
            name: account.name,
            balance: account.balance,
          })),
        };
      },
    }),

    getCashflow: tool({
      description:
        "Get monthly cashflow (income, expenses, net, savings %) for the last 6, 12, or 24 months.",
      inputSchema: z.object({
        accountId: accountIdSchema,
        months: z
          .union([z.literal(6), z.literal(12), z.literal(24)])
          .optional()
          .describe("Number of months. Defaults to 6."),
      }),
      execute: async ({ accountId, months }) => {
        return getMonthlyCashflow(accountId ?? "all", months ?? 6);
      },
    }),

    getCategoryComparison: tool({
      description:
        "Compare current-month category spend vs 6-month average and budget.",
      inputSchema: z.object({
        accountId: accountIdSchema,
      }),
      execute: async ({ accountId }) => {
        return getCategoryComparison(accountId);
      },
    }),

    getBudgetProgress: tool({
      description: "Get budget progress for the current month by category.",
      inputSchema: z.object({
        accountId: accountIdSchema,
      }),
      execute: async ({ accountId }) => {
        const progress = await getBudgetProgress(accountId ?? "all");
        return progress.map((item) => ({
          category: item.categoryTitle,
          budgetAmount: item.budgetAmount,
          spentAmount: item.spentAmount,
          progressPercent: item.progressPercent,
          isOverBudget: item.isOverBudget,
        }));
      },
    }),

    getRecentMovements: tool({
      description: "Get the 5 most recent applied movements.",
      inputSchema: z.object({
        accountId: accountIdSchema,
      }),
      execute: async ({ accountId }) => {
        const movements = await getLastMovements(accountId ?? "all");
        return movements.map((movement) => ({
          id: movement.id,
          type: movement.type,
          amount: movement.amount,
          description: movement.description,
          doneAt: movement.done_at,
          account: movement.fullAccount?.name ?? null,
          category: movement.fullCategory?.title ?? null,
        }));
      },
    }),

    createMovement: tool({
      description:
        "Create a movement (expense/income/transfer; expenses may be once, recurring, or installment). Requires user approval before execution. Prefer account/category names from list tools.",
      inputSchema: createMovementInputSchema,
      needsApproval: true,
      execute: async (input) => {
        const resolved = await resolveCreateMovementInput(input);
        if (!resolved.ok) {
          return { success: false as const, error: resolved.error };
        }

        try {
          await insertMovement(resolved.payload);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "createDatabaseError";
          return { success: false as const, error: message };
        }

        revalidatePath("/home");
        revalidatePath("/analytics");
        revalidatePath("/movements");
        revalidatePath("/ai");

        return {
          success: true as const,
          summary: resolved.summary,
        };
      },
    }),
  };
}

export type AiTools = ReturnType<typeof createAiTools>;
