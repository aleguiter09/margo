import { Card } from "@/ui/card";
import { getCategoryComparison } from "../services/analytics";
import { Badge } from "@/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { CategoryIcon } from "@/modules/shared/ui/common/CategoryIcon";
import { getCategoryLabel } from "@/modules/categories/utils/getCategoryLabel";
import { formatCurrency } from "@/modules/shared/utils/formatCurrency";
import { getLocale, getTranslations } from "next-intl/server";
import type { AnalyticsAccountFilter } from "../types/analytics-filters.types";

type CategoryComparisonData = {
  category_id: number;
  category_title: string;
  category_icon: string;
  category_color: string;
  current_month_spent: number;
  six_month_avg: number;
  budget_amount: number;
  diff_vs_avg_percent: number;
  diff_vs_budget_percent: number | null;
};

function formatAmount(locale: string, value: number) {
  if (!value) return "-";
  return formatCurrency(locale, value, 0);
}

function formatPercent(value: number | null) {
  if (value === null) return "-";
  return `${value.toFixed(0)}%`;
}

function getAvgColor(delta: number) {
  if (delta > 20) return "destructive";
  if (delta > 5) return "info";
  if (delta < -10) return "success";
  return "secondary";
}

export async function CategoryComparisonTable({
  accountId,
}: Readonly<AnalyticsAccountFilter>) {
  const [data, t, locale] = await Promise.all([
    getCategoryComparison(accountId),
    getTranslations("categories"),
    getLocale(),
  ]);

  if (!data || data.length === 0) return null;

  const sorted = [...data].sort(
    (a, b) => b.current_month_spent - a.current_month_spent,
  );

  return (
    <Card className="flex h-full flex-col p-4">
      <h3 className="mb-4 shrink-0 text-sm font-semibold">
        {t("analytics.title")}
      </h3>

      <Table containerClassName="min-h-0 max-h-68 flex-1 overflow-auto">
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="text-xs">{t("analytics.category")}</TableHead>
            <TableHead className="text-right text-xs">
              {t("analytics.thisMonth")}
            </TableHead>
            <TableHead className="text-right text-xs">
              {t("analytics.sixMonthAvg")}
            </TableHead>
            <TableHead className="text-right text-xs">
              {t("analytics.difference")}
            </TableHead>
            <TableHead className="text-right text-xs">
              {t("analytics.budget")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item) => (
            <TableRow key={item.category_id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon
                    icon={item.category_icon}
                    color={item.category_color}
                    size={12}
                  />
                  <span className="text-xs font-normal">
                    {getCategoryLabel(item.category_title, true, false, t)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right text-xs text-nowrap">
                {formatAmount(locale, item.current_month_spent)}
              </TableCell>
              <TableCell className="text-right text-xs">
                {formatAmount(locale, item.six_month_avg)}
              </TableCell>
              <TableCell className="text-right text-xs">
                <Badge variant={getAvgColor(item.diff_vs_avg_percent)}>
                  {formatPercent(item.diff_vs_avg_percent)}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-xs">
                {formatAmount(locale, item.budget_amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
