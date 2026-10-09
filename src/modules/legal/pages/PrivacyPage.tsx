import { getTranslations } from "next-intl/server";
import { LegalDocumentLayout } from "@/modules/legal/ui/LegalDocumentLayout";

export async function PrivacyPage() {
  const t = await getTranslations("legal");
  const brandT = await getTranslations("landing");

  const sections = t.raw("privacy.sections") as Array<{
    heading: string;
    paragraphs: string[];
  }>;

  return (
    <LegalDocumentLayout
      brand={brandT("brand")}
      title={t("privacy.title")}
      lastUpdated={t("privacy.lastUpdated")}
      backHomeLabel={t("privacy.backHome")}
      otherDocLabel={t("privacy.otherDocLabel")}
      otherDocHref={t("privacy.otherDocHref")}
      sections={sections}
    />
  );
}
