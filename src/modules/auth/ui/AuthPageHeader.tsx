import { BrandMark } from "@/modules/landing/ui/BrandMark";
import { cn } from "@/modules/shared/utils/cn";

type Props = Readonly<{
  title: string;
  subtitle: string;
  className?: string;
}>;

export function AuthPageHeader({ title, subtitle, className }: Props) {
  return (
    <div
      className={cn("mb-6 flex flex-col items-center text-center", className)}
    >
      <h1 className="text-foreground text-xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
