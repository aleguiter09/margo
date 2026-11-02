"use client";

import { ListFilter, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Button } from "@/ui/button";
import { cn } from "@/modules/shared/utils/cn";

export type FilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

type FiltersTriggerProps = ComponentPropsWithoutRef<typeof Button> & {
  activeCount: number;
};

export const FiltersTrigger = forwardRef<HTMLButtonElement, FiltersTriggerProps>(
  function FiltersTrigger({ activeCount, className, ...props }, ref) {
    const t = useTranslations("movements");

    return (
      <Button
        type="button"
        variant="default"
        size="icon"
        aria-label={t("filters")}
        {...props}
        ref={ref}
        className={cn("relative shrink-0", className)}
      >
        <ListFilter className="size-4" />
        {activeCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-background px-1 text-[10px] font-semibold leading-none text-primary shadow-xs ring-1 ring-primary">
            {activeCount}
          </span>
        ) : null}
      </Button>
    );
  },
);

type FiltersChipsProps = {
  chips: FilterChip[];
};

export function FiltersChips({ chips }: Readonly<FiltersChipsProps>) {
  const t = useTranslations("movements");

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
        >
          <span>{chip.label}</span>
          <X className="size-3 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t("clearFilters")}</span>
        </button>
      ))}
    </div>
  );
}
