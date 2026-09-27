type Props = Readonly<{
  label: string;
}>;

export function AuthDivider({ label }: Props) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="bg-border h-px w-full" />
      <span className="bg-card text-muted-foreground absolute px-3 text-[11px] font-semibold tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}
