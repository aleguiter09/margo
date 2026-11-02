import type {
  MonthlyCashflowMovement,
  MonthlyCashflowRow,
  MonthlyCashflowSummary,
} from "../types/monthly-cashflow.types";

function toMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildEmptyMonths(
  months: number,
  now = new Date(),
): MonthlyCashflowRow[] {
  const rows: MonthlyCashflowRow[] = [];

  for (let offset = 0; offset < months; offset += 1) {
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    rows.push({
      monthKey: toMonthKey(monthStart),
      monthStart,
      income: 0,
      expenses: 0,
      difference: 0,
      differencePercent: null,
    });
  }

  return rows;
}

function withDifference(income: number, expenses: number) {
  const difference = income - expenses;
  const differencePercent = income > 0 ? (difference / income) * 100 : null;

  return { difference, differencePercent };
}

export function aggregateMonthlyCashflow(
  movements: MonthlyCashflowMovement[],
  months = 6,
  now = new Date(),
): MonthlyCashflowRow[] {
  const rowsByMonth = new Map(
    buildEmptyMonths(months, now).map((row) => [row.monthKey, row]),
  );

  for (const movement of movements) {
    const doneAt = new Date(movement.done_at);
    const monthKey = toMonthKey(doneAt);
    const row = rowsByMonth.get(monthKey);
    if (!row) continue;

    if (movement.type === "income") {
      row.income += movement.amount;
    } else if (movement.type === "expense") {
      row.expenses += Math.abs(movement.amount);
    }
  }

  return [...rowsByMonth.values()].map((row) => {
    const { difference, differencePercent } = withDifference(
      row.income,
      row.expenses,
    );

    return {
      ...row,
      difference,
      differencePercent,
    };
  });
}

export function summarizeMonthlyCashflow(
  rows: MonthlyCashflowRow[],
): MonthlyCashflowSummary {
  if (rows.length === 0) {
    return {
      income: 0,
      expenses: 0,
      difference: 0,
      differencePercent: null,
    };
  }

  const income = rows.reduce((sum, row) => sum + row.income, 0) / rows.length;
  const expenses =
    rows.reduce((sum, row) => sum + row.expenses, 0) / rows.length;
  const { difference, differencePercent } = withDifference(income, expenses);

  return {
    income,
    expenses,
    difference,
    differencePercent,
  };
}

export function getMonthlyCashflowRange(months = 12, now = new Date()) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}
