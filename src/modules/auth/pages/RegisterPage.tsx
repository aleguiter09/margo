"use client";

import Link from "next/link";
import { useTransition } from "react";
import { createUserForm } from "@/modules/auth/actions/user-action";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { showToast } from "@/modules/shared/ui/toast";
import { UserSchema } from "@/modules/shared/utils/schemas";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/modules/auth/ui/AuthCard";
import { AuthPageHeader } from "@/modules/auth/ui/AuthPageHeader";
import { GoogleAuthButton } from "@/modules/auth/ui/GoogleAuthButton";
import { AuthDivider } from "@/modules/auth/ui/AuthDivider";
import { AuthInput } from "@/modules/auth/ui/AuthInput";
import { PasswordField } from "@/modules/auth/ui/PasswordField";
import { AuthSwitchLink } from "@/modules/auth/ui/AuthSwitchLink";
import { ToastManager } from "@/modules/shared/ui/Toast/toast-manager";

const RegisterFormSchema = UserSchema.and(
  z.object({
    acceptTerms: z.literal(true, {
      error: "acceptTermsError",
    }),
  }),
);

type Schema = z.infer<typeof RegisterFormSchema>;

export function RegisterPage() {
  const t = useTranslations("auth");
  const [pending, startTransition] = useTransition();

  const form = useForm<Schema>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined,
    },
  });

  function onSubmit(data: Schema) {
    startTransition(async () => {
      const { acceptTerms: _acceptTerms, ...credentials } = data;
      const res = await createUserForm(credentials);

      if (!res.success) {
        showToast({ type: "error", message: t(res.error ?? "defaultError") });
      }
    });
  }

  return (
    <>
      <AuthCard>
        <AuthPageHeader
          title={t("registerTitle")}
          subtitle={t("registerSubtitle")}
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

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password" className="sr-only">
                    {t("password")}
                  </FieldLabel>
                  <PasswordField
                    {...field}
                    id="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    placeholder={t("password")}
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
                  <FieldLabel htmlFor="confirmPassword" className="sr-only">
                    {t("confirmPassword")}
                  </FieldLabel>
                  <PasswordField
                    {...field}
                    id="confirmPassword"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                    placeholder={t("confirmPassword")}
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
              name="acceptTerms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                  className="items-start gap-2"
                >
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true ? true : undefined)
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 justify-center ">
                    <FieldLabel
                      htmlFor="acceptTerms"
                      className="text-muted-foreground block w-full text-xs font-normal cursor-pointer"
                    >
                      {t("acceptTermsPrefix")}
                      <Link
                        href="/terms"
                        className="text-foreground underline-offset-2 hover:underline"
                      >
                        {t("termsOfService")}
                      </Link>
                      {t("acceptTermsAnd")}
                      <Link
                        href="/privacy"
                        className="text-foreground underline-offset-2 hover:underline"
                      >
                        {t("privacyPolicy")}
                      </Link>
                    </FieldLabel>
                    {fieldState.invalid && (
                      <FieldError
                        error={t(fieldState.error?.message as string)}
                      />
                    )}
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
            {t("createAccount")}
          </Button>
        </form>

        <AuthDivider label={t("orRegisterWithEmail")} />

        <GoogleAuthButton />
        <p className="text-muted-foreground mt-2 text-center text-xs leading-relaxed">
          {t("googleLegalNotice")}{" "}
          <Link
            href="/terms"
            className="text-foreground underline-offset-2 hover:underline"
          >
            {t("termsOfService")}
          </Link>
          {t("acceptTermsAnd")}
          <Link
            href="/privacy"
            className="text-foreground underline-offset-2 hover:underline"
          >
            {t("privacyPolicy")}
          </Link>
        </p>

        <AuthSwitchLink
          message={t("signInMessage")}
          href="/login"
          linkLabel={t("signIn")}
        />
      </AuthCard>
      <ToastManager />
    </>
  );
}
