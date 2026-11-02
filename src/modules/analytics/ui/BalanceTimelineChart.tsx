"use client";

import { formatCurrency } from "@/modules/shared/utils/formatCurrency";
import { chartColors } from "@/modules/shared/utils/chart-colors";
import { useLocale } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BalanceTimelinePoint = {
  date: string;
  balance: number;
};

function formatAxisBalance(value: number, locale: string) {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (abs >= 10_000) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return formatCurrency(locale, value, 0);
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
  balanceLabel: string;
  locale: string;
};

function BalanceTimelineTooltip({
  active,
  payload,
  label,
  balanceLabel,
  locale,
}: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const value = payload[0]?.value;

  if (value == null) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card px-2 py-1 shadow-sm">
      <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
      <p className="text-xs font-medium leading-tight tabular-nums text-foreground">
        {balanceLabel}: {formatCurrency(locale, value, 2)}
      </p>
    </div>
  );
}

export function BalanceTimelineChart({
  data,
  balanceLabel,
}: Readonly<{
  data: BalanceTimelinePoint[];
  balanceLabel: string;
}>) {
  const locale = useLocale();

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="h-full min-h-48 w-full flex-1 px-2 pb-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={chartColors.grid}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickCount={6}
            interval="preserveStartEnd"
            padding={{ left: 8, right: 8 }}
            tick={{ fontSize: 11, fill: chartColors.muted }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickCount={4}
            tick={{ fontSize: 11, fill: chartColors.muted }}
            tickFormatter={(value) => formatAxisBalance(Number(value), locale)}
          />
          <Tooltip
            cursor={{ stroke: chartColors.mutedLight, strokeWidth: 1 }}
            content={
              <BalanceTimelineTooltip
                balanceLabel={balanceLabel}
                locale={locale}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={chartColors.primary}
            fill={chartColors.primary}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: chartColors.primary }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
