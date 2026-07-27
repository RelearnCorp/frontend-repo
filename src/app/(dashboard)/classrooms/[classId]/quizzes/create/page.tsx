"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, ArrowLeft, Plus, X } from "lucide-react";
import { z } from "zod";

import { AuthGuard } from "@/components/app/auth-guard";
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
import { quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import type { QuestionType } from "@/types/api";

const createQuizSchema = z.object({
  title: z.string().trim().min(1, "Quiz title is required").min(3, "Title must be at least 3 characters"),
  description: z.string().trim().optional(),
});

type CreateQuizForm = z.infer<typeof createQuizSchema>;
type FieldErrors = Partial<Record<keyof CreateQuizForm, string[]>>;

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Record<string, string>;
  correctAnswer: string;
}

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [formData, setFormData] = useState<CreateQuizForm>({
    title: "",
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    text: "",
    type: "multiple_choice" as QuestionType,
    options: { a: "", b: "", c: "", d: "" },
    correctAnswer: "a",
  });
  const [questionFormError, setQuestionFormError] = useState<string | null>(null);

  const handleChange = (field: keyof CreateQuizForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addQuestion = () => {
    if (!questionForm.text.trim()) {
      setQuestionFormError("Please enter a question");
      return;
    }

    if (questionForm.type === "multiple_choice") {
      const filledOptions = Object.values(questionForm.options).filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setQuestionFormError("Please provide at least 2 answer options");
        return;
      }
    }

    setQuestionFormError(null);

    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionForm.text,
      type: questionForm.type,
      options: questionForm.type === "multiple_choice" ? questionForm.options : undefined,
      correctAnswer: questionForm.correctAnswer,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setQuestionForm({
      text: "",
      type: "multiple_choice",
      options: { a: "", b: "", c: "", d: "" },
      correctAnswer: "a",
    });
    setShowQuestionForm(false);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = createQuizSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question to the quiz");
      return;
    }

    setIsSubmitting(true);
    try {
      const quiz = await quizzesApi.create({
        class_id: classId,
        title: result.data.title,
        description: result.data.description,
      });

      // Add questions to the quiz
      for (const q of questions) {
        const options = q.type === "multiple_choice" ? q.options : undefined;
        await quizzesApi.addQuestion(quiz.id, {
          question_text: q.text,
          question_type: q.type,
          options,
          correct_answer: q.correctAnswer,
        });
      }

      router.push(`/classrooms/${classId}/quizzes/${quiz.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create quiz");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard role="teacher">
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href={`/classrooms/${classId}/quizzes`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Quizzes
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Create Quiz</h1>

          <form onSubmit={handleSubmit} id="create-quiz-form" noValidate>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field data-invalid={!!fieldErrors.title}>
                    <FieldLabel htmlFor="quiz_title">Quiz Title</FieldLabel>
                    <Input
                      id="quiz_title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="e.g., Physics Chapter 3 Assessment"
                      aria-invalid={!!fieldErrors.title}
                    />
                    <FieldError errors={fieldErrors.title?.map((message) => ({ message }))} />
                  </Field>

                  <Field data-invalid={!!fieldErrors.description}>
                    <FieldLabel htmlFor="description">
                      Description <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Tell students what this quiz covers"
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
              </CardContent>
            </Card>

            {/* Questions Section */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>
                    Add questions to your quiz — answers are graded as an
                    exact match against &ldquo;Correct answer&rdquo;, so
                    double-check spacing and capitalization for short answer
                    and essay questions.
                  </CardDescription>
                </div>
                {!showQuestionForm && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuestionFormError(null);
                      setShowQuestionForm(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Add Question
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.length === 0 && !showQuestionForm && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No questions added yet. Click &ldquo;Add Question&rdquo; to get started.
                  </p>
                )}

                {questions.map((question, idx) => (
                  <div
                    key={question.id}
                    className="p-4 rounded border border-border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Q{idx + 1}: {question.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {question.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    {question.type === "multiple_choice" && question.options && (
                      <div className="ml-4 space-y-1">
                        {Object.entries(question.options).map(([key, value]) => (
                          value && (
                            <div key={key} className="text-sm">
                              <span className="font-semibold">{key.toUpperCase()}:</span> {value}
                              {key === question.correctAnswer && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {showQuestionForm && (
                  <div className="p-4 rounded border border-border bg-blue-50 dark:bg-blue-950 space-y-3">
                    <div>
                      <label className="text-sm font-medium">Question Text</label>
                      <Input
                        value={questionForm.text}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({ ...prev, text: e.target.value }))
                        }
                        placeholder="Enter the question"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Question Type</label>
                      <select
                        value={questionForm.type}
                        onChange={(e) =>
                          setQuestionForm((prev) => ({
                            ...prev,
                            type: e.target.value as QuestionType,
                          }))
                        }
                        className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>

                    {questionForm.type === "multiple_choice" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Answer Options</label>
                        {Object.entries(questionForm.options).map(([key]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{key.toUpperCase()}:</span>
                            <Input
                              value={questionForm.options[key as keyof typeof questionForm.options]}
                              onChange={(e) =>
                                setQuestionForm((prev) => ({
                                  ...prev,
                                  options: {
                                    ...prev.options,
                                    [key]: e.target.value,
                                  },
                                }))
                              }
                              placeholder={`Option ${key.toUpperCase()}`}
                            />
                            <label className="flex items-center gap-1 whitespace-nowrap">
                              <input
                                type="radio"
                                name="correct_answer"
                                value={key}
                                checked={questionForm.correctAnswer === key}
                                onChange={() =>
                                  setQuestionForm((prev) => ({
                                    ...prev,
                                    correctAnswer: key,
                                  }))
                                }
                              />
                              <span className="text-xs">Correct</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {questionFormError && (
                      <p role="alert" className="text-sm text-destructive">
                        {questionFormError}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={addQuestion}
                        className="flex-1"
                      >
                        Add Question
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setQuestionFormError(null);
                          setShowQuestionForm(false);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href={`/classrooms/${classId}/quizzes`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                form="create-quiz-form"
                className="flex-1 gap-2"
                disabled={isSubmitting || questions.length === 0}
              >
                {isSubmitting && <LoaderCircle className="animate-spin size-4" />}
                Create Quiz
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
