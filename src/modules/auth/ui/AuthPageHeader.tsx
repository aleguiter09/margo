import { cn } from "@/modules/shared/utils/cn";

type Props = Readonly<{
  title: string;
  subtitle: string;
  className?: string;
}>;

export function AuthPageHeader({ title, subtitle, className }: Props) {
  return (
    <div className={cn("mb-4 flex flex-col gap-0.5", className)}>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-[13px]">{subtitle}</p>
    </div>
  );
}
