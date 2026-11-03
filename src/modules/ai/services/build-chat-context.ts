import { getAccounts } from "@/modules/accounts/services/accounts";
import { getCategories } from "@/modules/categories/services/categories";
import { INCOME_PARENT_ID } from "@/modules/categories/adapters/categories.adapter";
import { createClient } from "@/infra/supabase/server";
import { buildAiSystemPrompt } from "../prompts/system-prompt";

export async function buildChatContext() {
  const supabase = await createClient();
  const [{ data: settings }, accounts, categories] = await Promise.all([
    supabase.from("user_settings").select("language").single(),
    getAccounts(),
    getCategories(),
  ]);

  const locale = settings?.language === "es" ? "es" : "en";
  const todayIso = new Date().toISOString().slice(0, 10);

  const expenseCategories = categories
    .filter(
      (category) =>
        category.id != null &&
        category.title &&
        category.parent_id != null &&
        String(category.parent_id) !== INCOME_PARENT_ID &&
        !category.is_hidden,
    )
    .map((category) => ({
      id: category.id as number,
      title: category.title as string,
    }));

  const incomeCategories = categories
    .filter(
      (category) =>
        category.id != null &&
        category.title &&
        String(category.parent_id) === INCOME_PARENT_ID &&
        !category.is_hidden,
    )
    .map((category) => ({
      id: category.id as number,
      title: category.title as string,
    }));

  const accountList = accounts
    .filter(
      (account): account is { id: number; name: string; balance: number } =>
        typeof account.id === "number" && typeof account.name === "string",
    )
    .map((account) => ({
      id: account.id,
      name: account.name,
      balance: account.balance,
    }));

  const systemPrompt = buildAiSystemPrompt({
    locale,
    todayIso,
    accounts: accountList,
    expenseCategories,
    incomeCategories,
  });

  return { locale, systemPrompt };
}
