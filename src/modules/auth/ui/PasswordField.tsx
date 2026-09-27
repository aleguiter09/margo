"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/ui/input";
import { cn } from "@/modules/shared/utils/cn";

type Props = Readonly<
  Omit<React.ComponentProps<"input">, "type"> & {
    toggleShowLabel: string;
    toggleHideLabel: string;
  }
>;

export function PasswordField({
  className,
  toggleShowLabel,
  toggleHideLabel,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "bg-muted/60 h-11 rounded-xl border-0 pr-11 shadow-none focus-visible:bg-card",
          className,
        )}
      />
      <button
        type="button"
        aria-label={visible ? toggleHideLabel : toggleShowLabel}
        className="text-muted-foreground hover:text-foreground absolute right-3 flex items-center justify-center rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
