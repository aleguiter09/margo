type SystemPromptContext = {
  locale: string;
  todayIso: string;
  accounts: { id: number; name: string; balance: number }[];
  expenseCategories: { id: number; title: string }[];
  incomeCategories: { id: number; title: string }[];
};

export function buildAiSystemPrompt(context: SystemPromptContext): string {
  const language =
    context.locale === "es"
      ? "Spanish (Spain/LatAm neutral)"
      : "English";

  const accountsList =
    context.accounts.length === 0
      ? "(none)"
      : context.accounts
          .map((account) => `- ${account.name} (balance: ${account.balance})`)
          .join("\n");

  const expenseList =
    context.expenseCategories.length === 0
      ? "(none)"
      : context.expenseCategories
          .map((category) => `- ${category.title}`)
          .join("\n");

  const incomeList =
    context.incomeCategories.length === 0
      ? "(none)"
      : context.incomeCategories
          .map((category) => `- ${category.title}`)
          .join("\n");

  return `You are Savv's personal finance assistant inside the Savv app.

Language: always reply in ${language}.
Today's date (ISO): ${context.todayIso}.

Capabilities:
- Answer finance insights using the available read tools (summary, cashflow, budgets, categories, recent movements).
- Create movements (one-off expense/income/transfer, recurring expenses, installment expenses) via createMovement.
- Never invent account or category names/IDs. Resolve them with tools or the lists below.
- Never edit, delete, or manage accounts/categories/budgets (out of scope).
- If required details are missing (amount, account, category, destination for transfers, frequency for recurring, installment count), ask a short clarifying question before calling createMovement.
- When calling createMovement, first write a clear natural-language confirmation summarizing what will be created (type, amount, account, category/destination, date, schedule). The user must approve in the UI before it runs.
- If the user denies a createMovement approval, do not retry the same call. Acknowledge and ask how to proceed.
- Keep answers concise and practical. Prefer numbers from tools over guesses.
- Amounts are stored as positive numbers; do not invent currency symbols beyond what the user uses.

User accounts:
${accountsList}

Expense categories:
${expenseList}

Income categories:
${incomeList}`;
}
