import { createClient } from "@/infra/supabase/server";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("language")
    .single();

  if (data?.language) {
    return {
      locale: data.language,
      messages: {
        accounts: (
          await import(`../../messages/${data.language}/accounts.json`)
        ).default,
        auth: (await import(`../../messages/${data.language}/auth.json`))
          .default,
        budgets: (
          await import(`../../messages/${data.language}/budgets.json`)
        ).default,
        categories: (
          await import(`../../messages/${data.language}/categories.json`)
        ).default,
        common: (await import(`../../messages/${data.language}/common.json`))
          .default,
        dashboard: (
          await import(`../../messages/${data.language}/dashboard.json`)
        ).default,
        landing: (await import(`../../messages/${data.language}/landing.json`))
          .default,
        legal: (await import(`../../messages/${data.language}/legal.json`))
          .default,
        movements: (
          await import(`../../messages/${data.language}/movements.json`)
        ).default,
        settings: (
          await import(`../../messages/${data.language}/settings.json`)
        ).default,
      },
    };
  }

  const headersList = await headers();
  const cookieStore = await cookies();

  const defaultLocale = headersList.get("accept-language");
  const currentLocale =
    cookieStore.get("NEXT_LOCALE")?.value ?? defaultLocale ?? "en";

  const locale = currentLocale.split(",")[0].includes("es") ? "es" : "en";

  return {
    locale,
    messages: {
      accounts: (await import(`../../messages/${locale}/accounts.json`))
        .default,
      auth: (await import(`../../messages/${locale}/auth.json`)).default,
      budgets: (await import(`../../messages/${locale}/budgets.json`))
        .default,
      categories: (await import(`../../messages/${locale}/categories.json`))
        .default,
      common: (await import(`../../messages/${locale}/common.json`)).default,
      dashboard: (await import(`../../messages/${locale}/dashboard.json`))
        .default,
      landing: (await import(`../../messages/${locale}/landing.json`)).default,
      legal: (await import(`../../messages/${locale}/legal.json`)).default,
      movements: (await import(`../../messages/${locale}/movements.json`))
        .default,
      settings: (await import(`../../messages/${locale}/settings.json`))
        .default,
    },
  };
});
