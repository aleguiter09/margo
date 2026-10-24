import Link from "next/link";

type Props = Readonly<{
  message: string;
  href: string;
  linkLabel: string;
}>;

export function AuthSwitchLink({ message, href, linkLabel }: Props) {
  return (
    <p className="mt-4 text-center text-muted-foreground text-xs">
      {message}
      <Link
        href={href}
        className="text-primary ml-0.5 font-medium hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
