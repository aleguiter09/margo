"use client";

import { format } from "date-fns";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { DateRangePicker } from "@/ui/date-picker";
import { AccountFilterSelect } from "@/modules/shared/ui/common/AccountFilterSelect";
import { FiltersPopover } from "@/modules/shared/ui/filters/FiltersPopover";
import {
  FiltersChips,
  FiltersTrigger,
  type FilterChip,
} from "@/modules/shared/ui/filters/FiltersTrigger";
import { useData } from "@/modules/shared/stores/DataProvider";
import { getDateFnsLocale } from "@/modules/shared/utils/dateFnsLocale";
import type { AnalyticsPageParams } from "../../types/analytics-filters.types";

type Props = Readonly<
  AnalyticsPageParams & {
    heading: ReactNode;
  }
>;

function getDefaultFrom() {
  return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
}

function getDefaultTo() {
  return new Date();
}

function isSameDay(a: Date, b: Date) {
  return format(a, "yyyy-MM-dd") === format(b, "yyyy-MM-dd");
}

export function AnalyticsFilters({
  from,
  to,
  accountId,
  months,
  heading,
}: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { accounts } = useData();
  const dateLocale = getDateFnsLocale(locale);

  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [draftAccountId, setDraftAccountId] = useState(accountId);

  useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
    setDraftAccountId(accountId);
  }, [from, to, accountId]);

  const isDirty = useMemo(() => {
    return (
      !isSameDay(from, draftFrom) ||
      !isSameDay(to, draftTo) ||
      accountId !== draftAccountId
    );
  }, [from, to, accountId, draftFrom, draftTo, draftAccountId]);

  const replaceFilters = useCallback(
    (nextFrom: Date, nextTo: Date, nextAccountId: string) => {
      const params = new URLSearchParams();
      params.set("from", format(nextFrom, "yyyy-MM-dd"));
      params.set("to", format(nextTo, "yyyy-MM-dd"));
      params.set("account", nextAccountId);
      params.set("months", String(months));
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [months, pathname, replace],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDraftFrom(from);
      setDraftTo(to);
      setDraftAccountId(accountId);
    }
  };

  const handleApply = () => {
    replaceFilters(draftFrom, draftTo, draftAccountId);
    setOpen(false);
  };

  const handleClear = () => {
    const defaultFrom = getDefaultFrom();
    const defaultTo = getDefaultTo();
    setDraftFrom(defaultFrom);
    setDraftTo(defaultTo);
    setDraftAccountId("all");
    replaceFilters(defaultFrom, defaultTo, "all");
    setOpen(false);
  };

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    const datesAreDefault =
      isSameDay(from, getDefaultFrom()) && isSameDay(to, getDefaultTo());

    if (!datesAreDefault) {
      next.push({
        id: "dates",
        label: `${format(from, "dd MMM", { locale: dateLocale })} – ${format(to, "dd MMM", { locale: dateLocale })}`,
        onRemove: () => {
          replaceFilters(getDefaultFrom(), getDefaultTo(), accountId);
        },
      });
    }

    if (accountId !== "all") {
      const accountName =
        accounts.find((account) => String(account.id) === accountId)?.name ??
        accountId;
      next.push({
        id: "account",
        label: accountName,
        onRemove: () => {
          replaceFilters(from, to, "all");
        },
      });
    }

    return next;
  }, [from, to, accountId, accounts, dateLocale, replaceFilters]);

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{heading}</div>
        <FiltersPopover
          open={open}
          onOpenChange={handleOpenChange}
          trigger={<FiltersTrigger activeCount={chips.length} />}
          onApply={handleApply}
          onClear={handleClear}
          applyDisabled={!isDirty}
        >
          <div className="flex flex-col gap-3">
            <DateRangePicker
              value={{ from: draftFrom, to: draftTo }}
              onChange={(val) => {
                if (val?.from) setDraftFrom(val.from);
                if (val?.to) setDraftTo(val.to);
              }}
              locale={dateLocale}
            />
            <AccountFilterSelect
              value={draftAccountId}
              onValueChange={setDraftAccountId}
            />
          </div>
        </FiltersPopover>
      </div>
      <FiltersChips chips={chips} />
    </div>
  );
}
