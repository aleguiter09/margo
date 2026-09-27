"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updatePasswordForm } from "@/modules/auth/actions/user-action";
import { Button } from "@/ui/button";
import { showToast } from "@/modules/shared/ui/toast";
import { UpdatePasswordSchema } from "@/modules/shared/utils/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { AuthCard } from "@/modules/auth/ui/AuthCard";
import { AuthPageHeader } from "@/modules/auth/ui/AuthPageHeader";
import { PasswordField } from "@/modules/auth/ui/PasswordField";
import { ToastManager } from "@/modules/shared/ui/Toast/toast-manager";

type Schema = z.infer<typeof UpdatePasswordSchema>;

export function UpdatePasswordPage() {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();

  const form = useForm<Schema>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: Schema) {
    startTransition(async () => {
      const res = await updatePasswordForm(data);

      if (!res.success) {
        showToast({ type: "error", message: t("resetSent") });
      }
    });
  }

  return (
    <>
      <AuthCard>
        <AuthPageHeader
          title={t("updateTitle")}
          subtitle={t("updateSubtitle")}
        />

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <PasswordField
                    {...field}
                    id="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    placeholder="••••••••••••"
                    toggleShowLabel={t("showPassword")}
                    toggleHideLabel={t("hidePassword")}
                  />
                  {fieldState.invalid && (
                    <FieldError
                      error={t(fieldState.error?.message as string)}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    {t("confirmPassword")}
                  </FieldLabel>
                  <PasswordField
                    {...field}
                    id="confirmPassword"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    placeholder="••••••••••••"
                    toggleShowLabel={t("showPassword")}
                    toggleHideLabel={t("hidePassword")}
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
            className="mt-2 h-11 w-full rounded-xl text-[13px] font-semibold"
            loading={pending}
            type="submit"
          >
            {t("updateTitle")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>

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
