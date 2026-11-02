"use client";

import { type ReactElement, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

type FiltersPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  applyDisabled?: boolean;
};

function isPortaledOverlayTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-radix-popper-content-wrapper]"))
  );
}

export function FiltersPopover({
  open,
  onOpenChange,
  trigger,
  children,
  onApply,
  onClear,
  applyDisabled = false,
}: Readonly<FiltersPopoverProps>) {
  const t = useTranslations("movements");

  const dismissGuards = {
    onPointerDownOutside: (e: {
      preventDefault: () => void;
      target: EventTarget | null;
    }) => {
      if (isPortaledOverlayTarget(e.target)) e.preventDefault();
    },
    onInteractOutside: (e: {
      preventDefault: () => void;
      target: EventTarget | null;
    }) => {
      if (isPortaledOverlayTarget(e.target)) e.preventDefault();
    },
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-80 max-w-[calc(100%-2rem)] overflow-x-hidden p-0"
        {...dismissGuards}
      >
        <div className="flex max-h-[min(70dvh,28rem)] flex-col gap-3 overflow-x-hidden overflow-y-auto p-4">
          {children}
        </div>
        <div className="flex gap-2 border-t border-border p-3">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="flex-1"
            disabled={applyDisabled}
            onClick={onApply}
          >
            {t("applyFilters")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClear}
          >
            {t("clearFilters")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
