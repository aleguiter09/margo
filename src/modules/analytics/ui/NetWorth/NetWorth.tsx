import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@/ui/card";
import { getBalanceTimeline } from "@/modules/analytics/services/analytics";
import { balanceTimelineAdapter } from "@/modules/analytics/adapters/balanceTimelineAdapter";
import { accountFilterToRpc } from "@/modules/analytics/utils/accountFilterToRpc";
import { deriveTimelineBucket } from "@/modules/analytics/utils/deriveTimelineBucket";
import { formatCurrency } from "@/modules/shared/utils/formatCurrency";
import { getNetWorth } from "../../../dashboard/services/net-worth";
import type { AnalyticsFiltersParams } from "../../types/analytics-filters.types";
import { BalanceTimelineChart } from "../BalanceTimelineChart";

export async function NetWorth({
  from,
  to,
  accountId,
}: Readonly<AnalyticsFiltersParams>) {
  const bucket = deriveTimelineBucket(from, to);

  const [locale, netWorth, t, timeline] = await Promise.all([
    getLocale(),
    getNetWorth({ from, to, accountId }),
    getTranslations("dashboard"),
    getBalanceTimeline({
      from: from.toISOString(),
      to: to.toISOString(),
      bucket,
      account_filter: accountFilterToRpc(accountId),
    }),
  ]);

  const percentChange =
    netWorth.periodStart !== 0
      ? ((netWorth.current - netWorth.periodStart) /
          Math.abs(netWorth.periodStart)) *
        100
      : 0;
  const isPositive = percentChange >= 0;
  const chartData = balanceTimelineAdapter(timeline, bucket);

  return (
    <Card className="flex h-full flex-col border-b-4 border-b-primary py-3">
      <div className="flex shrink-0 flex-col gap-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold">{t("netWorthTitle")}</p>
          <div
            className={`text-sm font-medium ${isPositive ? "text-income" : "text-expense"}`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(percentChange).toFixed(1)}%
          </div>
        </div>
        <p
          className={`text-3xl font-bold ${netWorth.current < 0 ? "text-expense" : ""}`}
        >
          {formatCurrency(locale, netWorth.current, 2)}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {t("netWorthComparedToPeriodStart")}
          <span className={netWorth.periodStart < 0 ? "text-expense" : ""}>
            {formatCurrency(locale, netWorth.current - netWorth.periodStart, 2)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <BalanceTimelineChart data={chartData} balanceLabel={t("balance")} />
      </div>
    </Card>
  );
}
