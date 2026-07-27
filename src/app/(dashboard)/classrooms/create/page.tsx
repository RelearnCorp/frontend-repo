"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
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

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Class name is required").min(3, "Class name must be at least 3 characters"),
  description: z.string().trim().optional(),
});

type CreateClassForm = z.infer<typeof createClassSchema>;
type FieldErrors = Partial<Record<keyof CreateClassForm, string[]>>;

export default function CreateClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateClassForm>({
    name: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CreateClassForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = createClassSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newClass = await classesApi.create({
        name: result.data.name,
        description: result.data.description || undefined,
      });
      router.push(`/classrooms/${newClass.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create class");
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
            <CardTitle render={<h1 />}>Create a New Class</CardTitle>
            <CardDescription>
              Set up your classroom and start teaching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id="create-class-form" noValidate>
              <FieldGroup>
                <Field data-invalid={!!fieldErrors.name}>
                  <FieldLabel htmlFor="class_name">Class Name</FieldLabel>
                  <Input
                    id="class_name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Introduction to Physics"
                    aria-invalid={!!fieldErrors.name}
                  />
                  <FieldError errors={fieldErrors.name?.map((message) => ({ message }))} />
                </Field>

                <Field data-invalid={!!fieldErrors.description}>
                  <FieldLabel htmlFor="description">
                    Description <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Tell students what this class is about"
                    aria-invalid={!!fieldErrors.description}
                  />
                  <FieldError errors={fieldErrors.description?.map((message) => ({ message }))} />
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
              form="create-class-form"
              className="flex-1 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderCircle className="animate-spin size-4" />}
              Create Class
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
