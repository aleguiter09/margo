import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type NavItem = {
  href: string;
  label: string;
};

type Props = Readonly<{
  navItems: NavItem[];
}>;

export async function LandingFooter({ navItems }: Props) {
  const t = await getTranslations("landing");

  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center">
            <Image
              src="/margo-logo.png"
              alt={t("brand")}
              width={170}
              height={56}
              className="h-7 w-auto"
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>

        <div className="flex flex-wrap gap-12">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("footer.product")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              {t("footer.account")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  {t("cta.login")}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground">
                  {t("cta.createAccount")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              {t("footer.legal")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
