import Link from "next/link";
import { cn } from "@/modules/shared/utils/cn";

type Props = Readonly<{
  message: string;
  href: string;
  linkLabel: string;
  className?: string;
}>;

export function AuthSwitchLink({
  message,
  href,
  linkLabel,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "bg-muted mt-6 rounded-xl p-3 text-center",
        className,
      )}
    >
      <p className="text-muted-foreground text-xs">
        {message}
        <Link
          href={href}
          className="text-primary ml-1 inline-flex items-center font-medium hover:underline"
        >
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}
