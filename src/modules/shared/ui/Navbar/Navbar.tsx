"use client";

import Link from "next/link";
import { logout } from "@/modules/auth/actions/user-action";
import { FloatingAddButton } from "@/modules/dashboard/ui/ActionBar/FloatingAddButton";
import { MovementDialog } from "@/modules/movements/ui/MovementDialog";
import { ChartArea, Home, LogOutIcon, Settings, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "../../utils/cn";

const leftLinks = [
  { key: "home", href: "/home", icon: <Home /> },
  { key: "analytics", href: "/analytics", icon: <ChartArea /> },
];

const rightLinks = [
  { key: "ai", href: "/ai", icon: <Sparkles /> },
  { key: "settings", href: "/settings", icon: <Settings /> },
];

export function Navbar() {
  const t = useTranslations("common.nav");
  const tMovements = useTranslations("movements");
  const pathname = usePathname();
  const allLinks = [...leftLinks, ...rightLinks];
  const activeLink =
    allLinks.find(
      (link) => link.href !== "/home" && pathname.startsWith(link.href),
    )?.href ?? leftLinks[0].href;

  const renderLink = (link: (typeof leftLinks)[number]) => (
    <Link
      key={link.key}
      href={link.href}
      aria-label={t(link.key)}
      tabIndex={0}
      className={cn(
        "flex h-12 grow items-center justify-center text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring",
        activeLink === link.href && "text-primary",
      )}
      aria-current={activeLink === link.href ? "page" : undefined}
    >
      {link.icon}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-5 max-w-lg sm:mx-auto flex">
        {leftLinks.map(renderLink)}

        <div className="flex h-12 grow items-center justify-center">
          <MovementDialog
            trigger={
              <FloatingAddButton
                className="-translate-y-3 shadow-sm"
                aria-label={tMovements("addTitle")}
              />
            }
          />
        </div>

        {rightLinks.map(renderLink)}

        <form
          action={logout}
          className="flex h-12 grow items-center justify-center"
        >
          <button
            type="submit"
            tabIndex={0}
            aria-label={t("logout")}
            className="grow cursor-pointer h-full flex items-center justify-center text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring"
          >
            <LogOutIcon />
          </button>
        </form>
      </div>
    </nav>
  );
}
