"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRangePicker } from "@/ui/date-picker";
import { getCategoryLabel } from "@/modules/categories/utils/getCategoryLabel";
import { AccountFilterSelect } from "@/modules/shared/ui/common/AccountFilterSelect";
import { CategoryFilterSelect } from "@/modules/shared/ui/common/CategoryFilterSelect";
import { FiltersPopover } from "@/modules/shared/ui/filters/FiltersPopover";
import {
  FiltersChips,
  FiltersTrigger,
  type FilterChip,
} from "@/modules/shared/ui/filters/FiltersTrigger";
import { useData } from "@/modules/shared/stores/DataProvider";
import { cn } from "@/modules/shared/utils/cn";
import { getDateFnsLocale } from "@/modules/shared/utils/dateFnsLocale";
import type { MovementsScope } from "../../types/types";

type Props = Readonly<{
  from: Date;
  to: Date;
  accountId: string;
  categoryId: string;
  scope: MovementsScope;
}>;

function getDefaultFrom() {
  return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
}

function getDefaultTo() {
  return new Date();
}

function isSameDay(a: Date, b: Date) {
  return format(a, "yyyy-MM-dd") === format(b, "yyyy-MM-dd");
}

function buildScopeHref(
  scope: MovementsScope,
  accountId: string,
  categoryId: string,
  from: Date,
  to: Date,
) {
  const params = new URLSearchParams();
  params.set("account", accountId);
  params.set("category", categoryId);

  if (scope === "upcoming") {
    params.set("scope", "upcoming");
  } else {
    params.set("from", format(from, "yyyy-MM-dd"));
    params.set("to", format(to, "yyyy-MM-dd"));
  }

  return `/movements?${params.toString()}`;
}

export function MovementsFilters({
  from,
  to,
  accountId,
  categoryId,
  scope,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("movements");
  const tCategories = useTranslations("categories");
  const pathname = usePathname();
  const { replace } = useRouter();
  const { accounts, incomeCategories, expenseCategories } = useData();
  const dateLocale = getDateFnsLocale(locale);
  const isUpcoming = scope === "upcoming";

  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [draftAccountId, setDraftAccountId] = useState(accountId);
  const [draftCategoryId, setDraftCategoryId] = useState(categoryId);

  useEffect(() => {
    setDraftFrom(from);
    setDraftTo(to);
    setDraftAccountId(accountId);
    setDraftCategoryId(categoryId);
  }, [from, to, accountId, categoryId]);

  const isDirty = useMemo(() => {
    const accountChanged = accountId !== draftAccountId;
    const categoryChanged = categoryId !== draftCategoryId;

    if (isUpcoming) {
      return accountChanged || categoryChanged;
    }

    return (
      !isSameDay(from, draftFrom) ||
      !isSameDay(to, draftTo) ||
      accountChanged ||
      categoryChanged
    );
  }, [
    from,
    to,
    accountId,
    categoryId,
    draftFrom,
    draftTo,
    draftAccountId,
    draftCategoryId,
    isUpcoming,
  ]);

  const replaceFilters = useCallback(
    (
      nextFrom: Date,
      nextTo: Date,
      nextAccountId: string,
      nextCategoryId: string,
    ) => {
      const params = new URLSearchParams();
      params.set("account", nextAccountId);
      params.set("category", nextCategoryId);

      if (isUpcoming) {
        params.set("scope", "upcoming");
      } else {
        params.set("from", format(nextFrom, "yyyy-MM-dd"));
        params.set("to", format(nextTo, "yyyy-MM-dd"));
      }

      replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [isUpcoming, pathname, replace],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDraftFrom(from);
      setDraftTo(to);
      setDraftAccountId(accountId);
      setDraftCategoryId(categoryId);
    }
  };

  const handleApply = () => {
    replaceFilters(draftFrom, draftTo, draftAccountId, draftCategoryId);
    setOpen(false);
  };

  const handleClear = () => {
    const defaultFrom = getDefaultFrom();
    const defaultTo = getDefaultTo();
    setDraftFrom(defaultFrom);
    setDraftTo(defaultTo);
    setDraftAccountId("all");
    setDraftCategoryId("all");
    replaceFilters(defaultFrom, defaultTo, "all", "all");
    setOpen(false);
  };

  const resolveCategoryLabel = useCallback(
    (id: string) => {
      if (id === "incomes") return tCategories("allIncomes");
      if (id === "expenses") return tCategories("allExpenses");

      const category = [...incomeCategories, ...expenseCategories].find(
        (item) => String(item.id) === id,
      );
      if (!category) return id;

      return getCategoryLabel(
        category.title,
        category.isGlobal,
        category.isCustomName,
        tCategories,
      );
    },
    [expenseCategories, incomeCategories, tCategories],
  );

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];

    if (!isUpcoming) {
      const datesAreDefault =
        isSameDay(from, getDefaultFrom()) && isSameDay(to, getDefaultTo());

      if (!datesAreDefault) {
        next.push({
          id: "dates",
          label: `${format(from, "dd MMM", { locale: dateLocale })} – ${format(to, "dd MMM", { locale: dateLocale })}`,
          onRemove: () => {
            replaceFilters(
              getDefaultFrom(),
              getDefaultTo(),
              accountId,
              categoryId,
            );
          },
        });
      }
    }

    if (accountId !== "all") {
      const accountName =
        accounts.find((account) => String(account.id) === accountId)?.name ??
        accountId;
      next.push({
        id: "account",
        label: accountName,
        onRemove: () => {
          replaceFilters(from, to, "all", categoryId);
        },
      });
    }

    if (categoryId !== "all") {
      next.push({
        id: "category",
        label: resolveCategoryLabel(categoryId),
        onRemove: () => {
          replaceFilters(from, to, accountId, "all");
        },
      });
    }

    return next;
  }, [
    isUpcoming,
    from,
    to,
    accountId,
    categoryId,
    accounts,
    dateLocale,
    replaceFilters,
    resolveCategoryLabel,
  ]);

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">{t("listTitle")}</h1>
        <FiltersPopover
          open={open}
          onOpenChange={handleOpenChange}
          trigger={<FiltersTrigger activeCount={chips.length} />}
          onApply={handleApply}
          onClear={handleClear}
          applyDisabled={!isDirty}
        >
          <div className="flex flex-col gap-3">
            {!isUpcoming ? (
              <DateRangePicker
                value={{ from: draftFrom, to: draftTo }}
                onChange={(val) => {
                  if (val?.from) setDraftFrom(val.from);
                  if (val?.to) setDraftTo(val.to);
                }}
                locale={dateLocale}
              />
            ) : null}
            <AccountFilterSelect
              value={draftAccountId}
              onValueChange={setDraftAccountId}
            />
            <CategoryFilterSelect
              value={draftCategoryId}
              onValueChange={setDraftCategoryId}
            />
          </div>
        </FiltersPopover>
      </div>

      <div className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <Link
          href={buildScopeHref("applied", accountId, categoryId, from, to)}
          className={cn(
            "inline-flex h-full flex-1 items-center justify-center rounded-md px-3 text-sm font-medium transition-all",
            !isUpcoming && "bg-background text-foreground shadow-sm",
          )}
        >
          {t("scopeApplied")}
        </Link>
        <Link
          href={buildScopeHref("upcoming", accountId, categoryId, from, to)}
          className={cn(
            "inline-flex h-full flex-1 items-center justify-center rounded-md px-3 text-sm font-medium transition-all",
            isUpcoming && "bg-background text-foreground shadow-sm",
          )}
        >
          {t("scopeUpcoming")}
        </Link>
      </div>

      <FiltersChips chips={chips} />
    </div>
  );
}
