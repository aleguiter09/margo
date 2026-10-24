import { Balance } from "@/modules/dashboard/ui/Balance/Balance";
import { ExpenseByCat } from "@/modules/dashboard/ui/ExpenseByCat/ExpenseByCat";
import { BudgetWidget } from "@/modules/budgets/ui/BudgetWidget";
import { LastMovements } from "@/modules/dashboard/ui/LastMovements/LastMovements";
import { UpcomingPayments } from "@/modules/dashboard/ui/UpcomingPayments/UpcomingPayments";

export function HomePage() {
  const accountId = "all";

  return (
    <div className="max-w-lg mx-auto">
      <Balance accountId={accountId} />
      <LastMovements accountId={accountId} />
      <ExpenseByCat
        accountId={accountId}
        year={new Date().getFullYear()}
        month={new Date().getMonth()}
      />
      <BudgetWidget />
      <UpcomingPayments accountId={accountId} />
    </div>
  );
}
