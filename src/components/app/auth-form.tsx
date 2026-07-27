"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Muted } from "@/components/ui/typography";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/http";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";
type AccountRole = "student" | "teacher";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FieldErrors = Partial<Record<"fullName" | "email" | "password", string[]>>;

export function AuthForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const isLogin = mode === "login";
  const isRegister = !isLogin;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountRole, setAccountRole] = useState<AccountRole>("student");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const result = isLogin
      ? loginSchema.safeParse({ email, password })
      : registerSchema.safeParse({ fullName, email, password });

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName, accountRole);
      }
      router.push("/classrooms");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Cannot reach the backend. Make sure it is running and NEXT_PUBLIC_API_URL points to it.",
        );
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold" render={<h1 />}>
          {isLogin ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Sign in to continue learning with Relearn."
            : "Password must be at least 8 characters."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="auth-form" noValidate>
          <FieldGroup>
            {isRegister && (
              <Field>
                <FieldLabel>I am a</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(["student", "teacher"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={accountRole === option}
                      onClick={() => setAccountRole(option)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-semibold capitalize transition-colors",
                        accountRole === option
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {accountRole === "teacher" && (
                  <Muted className="text-xs">
                    Teacher accounts are being rolled out — if this doesn&apos;t
                    take effect right away, ask an admin to upgrade your
                    account.
                  </Muted>
                )}
              </Field>
            )}
            {isRegister && (
              <Field data-invalid={!!fieldErrors.fullName}>
                <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="Aria Wijaya"
                  aria-invalid={!!fieldErrors.fullName}
                />
                <FieldError
                  errors={fieldErrors.fullName?.map((message) => ({ message }))}
                />
              </Field>
            )}
            <Field data-invalid={!!fieldErrors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@school.edu"
                aria-invalid={!!fieldErrors.email}
              />
              <FieldError errors={fieldErrors.email?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={!!fieldErrors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={!!fieldErrors.password}
              />
              <FieldError
                errors={fieldErrors.password?.map((message) => ({ message }))}
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button
          type="submit"
          form="auth-form"
          className="w-full font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          {isLogin ? "Sign in" : "Create account"}
        </Button>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => {
            setMode(isLogin ? "register" : "login");
            setError(null);
            setFieldErrors({});
          }}
        >
          {isLogin
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
