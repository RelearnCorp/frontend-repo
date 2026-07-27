"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { classesApi } from "@/services/api";
import { ApiError } from "@/services/http";

const enrollSchema = z.object({
  classCode: z.string().trim().min(1, "Class code is required").toUpperCase(),
});

type EnrollForm = z.infer<typeof enrollSchema>;
type FieldErrors = Partial<Record<keyof EnrollForm, string[]>>;

export default function EnrollPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EnrollForm>({ classCode: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = enrollSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const enrollData = await classesApi.enroll(result.data.classCode);
      router.push(`/classrooms/${enrollData.class_id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "CLASS_NOT_FOUND") {
          setError("Class code not found. Please check and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to enroll in class");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href="/classrooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Classrooms
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center overflow-y-auto p-6 lg:p-8">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle render={<h1 />}>Join a Class</CardTitle>
            <CardDescription>
              Enter the class code your teacher provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id="enroll-form" noValidate>
              <FieldGroup>
                <Field data-invalid={!!fieldErrors.classCode}>
                  <FieldLabel htmlFor="class_code">Class Code</FieldLabel>
                  <Input
                    id="class_code"
                    value={formData.classCode}
                    onChange={(e) => {
                      setFormData({ classCode: e.target.value.toUpperCase() });
                      setFieldErrors((prev) => ({ ...prev, classCode: undefined }));
                    }}
                    placeholder="E.g., ABC123"
                    aria-invalid={!!fieldErrors.classCode}
                    autoComplete="off"
                  />
                  <FieldError errors={fieldErrors.classCode?.map((message) => ({ message }))} />
                </Field>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </FieldGroup>
            </form>
          </CardContent>

          <div className="border-t border-border px-6 py-4 flex gap-3">
            <Link href="/classrooms" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              form="enroll-form"
              className="flex-1 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderCircle className="animate-spin size-4" />}
              Join Class
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
