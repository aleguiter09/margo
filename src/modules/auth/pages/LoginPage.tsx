"use client";

import Link from "next/link";
import { useTransition } from "react";
import { loginUserForm } from "@/modules/auth/actions/user-action";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { LoginUserSchema } from "@/modules/shared/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup } from "@/ui/field";
import { showToast } from "@/modules/shared/ui/toast";
import { ToastManager } from "@/modules/shared/ui/Toast/toast-manager";
import { AuthCard } from "@/modules/auth/ui/AuthCard";
import { AuthPageHeader } from "@/modules/auth/ui/AuthPageHeader";
import { GoogleAuthButton } from "@/modules/auth/ui/GoogleAuthButton";
import { AuthDivider } from "@/modules/auth/ui/AuthDivider";
import { PasswordField } from "@/modules/auth/ui/PasswordField";
import { AuthSwitchLink } from "@/modules/auth/ui/AuthSwitchLink";
import { Input } from "@/ui/input";

type Schema = z.infer<typeof LoginUserSchema>;

export function LoginPage() {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();

  const form = useForm<Schema>({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: Schema) {
    startTransition(async () => {
      const res = await loginUserForm(data);

      if (!res.success) {
        showToast({ type: "error", message: t(res.error ?? "defaultError") });
      }
    });
  }

  return (
    <>
      <AuthCard>
        <AuthPageHeader title={t("loginTitle")} subtitle={t("loginSubtitle")} />

        <form
          className="flex flex-col gap-2 "
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    className="bg-muted/60 h-11 rounded-xl focus-visible:bg-card"
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

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <PasswordField
                    {...field}
                    id="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    placeholder={t("password")}
                    toggleShowLabel={t("showPassword")}
                    toggleHideLabel={t("hidePassword")}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      error={t(fieldState.error?.message as string)}
                    />
                  )}

                  <div className="mt-1.5 flex items-center justify-end">
                    <Link
                      href="/reset"
                      className="text-primary text-[13px] font-medium hover:underline"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            className="mt-2 h-11 w-full rounded-xl"
            loading={pending}
            type="submit"
          >
            {t("signInToMargo")}
          </Button>
        </form>

        <AuthDivider label={t("orContinueWithEmail")} />
        <GoogleAuthButton />

        <AuthSwitchLink
          message={t("signUpMessage")}
          href="/register"
          linkLabel={t("createAccount")}
        />
      </AuthCard>
      <ToastManager />
    </>
  );
}
