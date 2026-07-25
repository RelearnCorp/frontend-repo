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
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/http";
import type { ApiUser } from "@/types/api";

type Mode = "login" | "register";

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

function homeFor(user: ApiUser) {
  return user.role?.name === "teacher" ? "/teacher" : "/profile";
}

export function AuthForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const isLogin = mode === "login";
  const isRegister = !isLogin;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const user = isLogin
        ? await login(email, password)
        : await register(email, password, fullName);
      router.push(homeFor(user));
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
            : "New accounts start as students. Password must be at least 8 characters."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="auth-form" noValidate>
          <FieldGroup>
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                {isLogin && (
                  <Button
                    variant="link"
                    size="sm"
                    disabled
                    title="Password reset is coming soon"
                    className="h-auto p-0 text-xs text-muted-foreground disabled:opacity-60"
                  >
                    Forgot password?
                  </Button>
                )}
              </div>
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
