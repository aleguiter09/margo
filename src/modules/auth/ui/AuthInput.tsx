import { Input } from "@/ui/input";
import { cn } from "@/modules/shared/utils/cn";

type Props = Readonly<React.ComponentProps<"input">>;

/** Auth-styled text input matching the Margo card look. */
export function AuthInput({ className, ...props }: Props) {
  return (
    <Input
      {...props}
      className={cn(
        "bg-muted/60 h-11 rounded-xl border-0 shadow-none focus-visible:bg-card",
        className,
      )}
    />
  );
}
