import { getTranslations } from "next-intl/server";
import { LegalDocumentLayout } from "@/modules/legal/ui/LegalDocumentLayout";

export async function TermsPage() {
  const t = await getTranslations("legal");
  const brandT = await getTranslations("landing");

  const sections = t.raw("terms.sections") as Array<{
    heading: string;
    paragraphs: string[];
  }>;

  return (
    <LegalDocumentLayout
      brand={brandT("brand")}
      title={t("terms.title")}
      lastUpdated={t("terms.lastUpdated")}
      backHomeLabel={t("terms.backHome")}
      otherDocLabel={t("terms.otherDocLabel")}
      otherDocHref={t("terms.otherDocHref")}
      sections={sections}
    />
  );
}
