"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/http";
import type { ApiUser } from "@/types/api";

type Mode = "login" | "register";

function homeFor(user: ApiUser) {
  return user.role?.name === "teacher" ? "/teacher" : "/profile";
}

export function AuthForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user =
        mode === "login"
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
        <CardTitle className="text-xl font-bold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue learning with Relearn."
            : "New accounts start as students. Password must be at least 8 characters."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="auth-form">
          <FieldGroup>
            {mode === "register" && (
              <Field>
                <FieldLabel htmlFor="full_name">Full name</FieldLabel>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aria Wijaya"
                  minLength={2}
                  required
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                {mode === "login" && (
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
                onChange={(e) => setPassword(e.target.value)}
                minLength={mode === "register" ? 8 : 1}
                required
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
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </Button>
      </CardFooter>
    </Card>
  );
}
