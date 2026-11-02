import { getTranslations } from "next-intl/server";
import { parseAnalyticsSearchParams } from "../adapters/analytics.adapter";
import type { AnalyticsPageProps } from "../types/analytics-filters.types";
import { AnalyticsFilters } from "../ui/AnalyticsFilters/AnalyticsFilters";
import { CategoryComparisonTable } from "../ui/CategoryAverages";
import { FutureCommitmentsWidget } from "../ui/FutureCommitments/FutureCommitmentsWidget";
import { MonthlyCashflowTable } from "../ui/MonthlyCashflowTable";
import { NetWorth } from "../ui/NetWorth/NetWorth";

export type { AnalyticsPageProps };

export async function AnalyticsPage(props: Readonly<AnalyticsPageProps>) {
  const params = await parseAnalyticsSearchParams(props);
  const t = await getTranslations("dashboard");

  return (
    <section className="flex flex-col">
      <AnalyticsFilters
        {...params}
        heading={
          <>
            <h1 className="text-lg font-semibold">{t("analyticsTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("analyticsDescription")}
            </p>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <NetWorth {...params} />
        <MonthlyCashflowTable
          accountId={params.accountId}
          months={params.months}
        />
        <div className="h-full lg:col-span-2">
          <CategoryComparisonTable accountId={params.accountId} />
        </div>
        <div className="h-full lg:col-span-2">
          <FutureCommitmentsWidget accountId={params.accountId} />
        </div>
      </div>
    </section>
  );
}
