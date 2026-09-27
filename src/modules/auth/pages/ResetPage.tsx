"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
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
        <AuthPageHeader
          title={t("resetTitle")}
          subtitle={t("resetSubtitle")}
        />

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
                  <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                  <AuthInput
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
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
            className="h-11 w-full rounded-xl text-[13px] font-semibold"
            loading={pending}
            type="submit"
          >
            {t("sendRecoveryLink")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>

        <div className="bg-muted text-muted-foreground mt-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs leading-normal">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{t("resetSpamTip")}</p>
        </div>

        <div className="mt-6 flex flex-col items-center pt-2 text-center">
          <Link
            href="/login"
            className="text-primary inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("backToSignIn")}
          </Link>
        </div>
      </AuthCard>
      <ToastManager />
    </>
  );
}
