import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/ui/card";
import {
  FutureCommitmentsContent,
  FutureCommitmentsSkeleton,
} from "./FutureCommitmentsContent";

type Props = Readonly<{
  accountId: string;
}>;

export async function FutureCommitmentsWidget({ accountId }: Props) {
  const t = await getTranslations("dashboard");

  return (
    <Card className="flex h-full flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold">{t("commitmentsTitle")}</h3>
      <div className="min-h-0 max-h-68 flex-1 overflow-auto">
        <Suspense key={accountId} fallback={<FutureCommitmentsSkeleton />}>
          <FutureCommitmentsContent accountId={accountId} />
        </Suspense>
      </div>
    </Card>
  );
}
