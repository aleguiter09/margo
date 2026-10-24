"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useTransition } from "react";
import { resetPasswordForm } from "@/modules/auth/actions/user-action";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { showToast } from "@/modules/shared/ui/toast";
import { ResetUserSchema } from "@/modules/shared/utils/schemas";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { ToastManager } from "@/modules/shared/ui/Toast/toast-manager";
import { AuthCard } from "@/modules/auth/ui/AuthCard";
import { AuthPageHeader } from "@/modules/auth/ui/AuthPageHeader";
import { AuthInput } from "@/modules/auth/ui/AuthInput";

type Schema = z.infer<typeof ResetUserSchema>;

export function ResetPage() {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();

  const form = useForm<Schema>({
    resolver: zodResolver(ResetUserSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: Schema) {
    startTransition(async () => {
      const res = await resetPasswordForm(data);

      if (res.success) {
        showToast({ type: "success", message: t("resetSent") });
      } else {
        showToast({ type: "error", message: t(res.error ?? "defaultError") });
      }
    });
  }

  return (
    <>
      <AuthCard>
        <AuthPageHeader title={t("resetTitle")} subtitle={t("resetSubtitle")} />

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className="sr-only">
                    {t("email")}
                  </FieldLabel>
                  <AuthInput
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    type="email"
                    autoComplete="email"
                    placeholder={t("email")}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      error={t(fieldState.error?.message as string)}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            className="h-11 w-full rounded-xl"
            loading={pending}
            type="submit"
          >
            {t("sendRecoveryLink")}
          </Button>
        </form>

        <div className="bg-muted text-muted-foreground mt-4 flex  gap-2.5 rounded-xl p-3 text-xs">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{t("resetSpamTip")}</p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-primary text-[13px] font-medium hover:underline"
          >
            {t("backToSignIn")}
          </Link>
        </div>
      </AuthCard>
      <ToastManager />
    </>
  );
}
