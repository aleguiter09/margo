import { cn } from "@/modules/shared/utils/cn";

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export function AuthCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "border-border/60 bg-card flex w-full max-w-110 flex-col rounded-xl border p-4 shadow-sm sm:p-8 md:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
