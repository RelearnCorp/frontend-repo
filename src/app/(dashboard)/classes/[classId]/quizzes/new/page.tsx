"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Check, Copy, LoaderCircle, Minus, Plus } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { AuthGuard } from "@/components/app/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "@/components/ui/typography";
import { getSidebarSections } from "@/constants/nav";
import { quizzesApi } from "@/services/api";
import { ApiError } from "@/services/http";
import type { ApiQuestion, ApiQuiz, QuestionType } from "@/types/api";

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice",
  short_answer: "Short answer",
  essay: "Essay",
};

function CreateQuizForm({ classId, onCreated }: { classId: string; onCreated: (quiz: ApiQuiz) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Quiz title is required");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const quiz = await quizzesApi.create({
        class_id: classId,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onCreated(quiz);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the quiz.");
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardCard title="New quiz" titleRender={<h2 />} className="max-w-lg">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="quiz-title">Title</FieldLabel>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter 5 Quiz"
              aria-invalid={!!error}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="quiz-description">Description (optional)</FieldLabel>
            <Textarea
              id="quiz-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Test your understanding of derivatives"
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" disabled={isSubmitting} className="font-semibold">
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Create Quiz
          </Button>
        </FieldGroup>
      </form>
    </DashboardCard>
  );
}

function ShareQuizLink({ classId, quizId }: { classId: string; quizId: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/classes/${classId}/quizzes/${quizId}/take`;

  return (
    <DashboardCard title="Share with students" titleRender={<h2 />}>
      <Muted className="pb-3 text-xs leading-relaxed">
        There&apos;s no quiz directory yet, so share this link directly with
        your students (e.g. post it in your class chat or materials) so they
        can take it.
      </Muted>
      <div className="flex items-center gap-2">
        <Input readOnly value={path} className="font-mono text-xs" />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-1.5"
          onClick={async () => {
            await navigator.clipboard.writeText(
              `${window.location.origin}${path}`,
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="text-emerald-600" /> : <Copy />}
          Copy
        </Button>
      </div>
    </DashboardCard>
  );
}

function OptionsBuilder({
  options,
  onChange,
}: {
  options: { key: string; value: string }[];
  onChange: (options: { key: string; value: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={option.key}
            onChange={(e) => {
              const next = [...options];
              next[index] = { ...next[index], key: e.target.value };
              onChange(next);
            }}
            placeholder="a"
            className="w-14 font-mono"
          />
          <Input
            value={option.value}
            onChange={(e) => {
              const next = [...options];
              next[index] = { ...next[index], value: e.target.value };
              onChange(next);
            }}
            placeholder="Option text"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove option"
            disabled={options.length <= 2}
            onClick={() => onChange(options.filter((_, i) => i !== index))}
          >
            <Minus />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange([...options, { key: "", value: "" }])}
      >
        <Plus />
        Add option
      </Button>
    </div>
  );
}

function AddQuestionForm({
  quizId,
  onAdded,
}: {
  quizId: string;
  onAdded: (question: ApiQuestion) => void;
}) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [options, setOptions] = useState([
    { key: "a", value: "" },
    { key: "b", value: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionText.trim() || !correctAnswer.trim()) {
      setError("Question text and correct answer are both required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const optionsMap =
        questionType === "multiple_choice"
          ? Object.fromEntries(
              options
                .filter((o) => o.key.trim() && o.value.trim())
                .map((o) => [o.key.trim(), o.value.trim()]),
            )
          : undefined;

      const question = await quizzesApi.addQuestion(quizId, {
        question_text: questionText.trim(),
        question_type: questionType,
        options: optionsMap,
        correct_answer: correctAnswer.trim(),
      });
      onAdded(question);
      setQuestionText("");
      setCorrectAnswer("");
      setOptions([
        { key: "a", value: "" },
        { key: "b", value: "" },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add the question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardCard title="Add a question" titleRender={<h2 />}>
      <Muted className="pb-4 text-xs">
        Grading is an exact match against &ldquo;Correct answer&rdquo; — for
        multiple choice, that&apos;s the option key (e.g. &ldquo;a&rdquo;).
      </Muted>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="question-text">Question</FieldLabel>
            <Textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What is the derivative of x^2?"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="question-type">Type</FieldLabel>
            <Select
              value={questionType}
              onValueChange={(value) => setQuestionType(value as QuestionType)}
            >
              <SelectTrigger id="question-type">
                <SelectValue placeholder="Choose a type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {QUESTION_TYPE_LABEL[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {questionType === "multiple_choice" && (
            <Field>
              <FieldLabel>Options</FieldLabel>
              <OptionsBuilder options={options} onChange={setOptions} />
            </Field>
          )}
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="correct-answer">Correct answer</FieldLabel>
            <Input
              id="correct-answer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder={questionType === "multiple_choice" ? "a" : "Exact expected answer"}
              aria-invalid={!!error}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" disabled={isSubmitting} className="font-semibold">
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Add Question
          </Button>
        </FieldGroup>
      </form>
    </DashboardCard>
  );
}

function QuestionList({ questions }: { questions: ApiQuestion[] }) {
  if (questions.length === 0) {
    return (
      <Muted className="text-xs">No questions added yet.</Muted>
    );
  }
  return (
    <ul className="space-y-2">
      {questions.map((q, index) => (
        <Card key={q.id ?? index} size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold" render={<h3 />}>
              {index + 1}. {q.question_text ?? q.content}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Muted className="text-xs">
              {QUESTION_TYPE_LABEL[(q.question_type ?? q.type ?? "short_answer") as QuestionType]}
              {q.options && ` · ${Object.keys(q.options).length} options`}
            </Muted>
          </CardContent>
        </Card>
      ))}
    </ul>
  );
}

export default function NewQuizPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);
  const [quiz, setQuiz] = useState<ApiQuiz | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);

  return (
    <AuthGuard role="teacher">
      <AppSidebar sections={getSidebarSections("teacher")} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar
          title={quiz ? quiz.title : "New Quiz"}
          subtitle={
            <Link href={`/classes/${classId}`} className="hover:underline">
              Back to class
            </Link>
          }
        />

        <main className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-8">
          {!quiz && <CreateQuizForm classId={classId} onCreated={setQuiz} />}

          {quiz && (
            <>
              <ShareQuizLink classId={classId} quizId={quiz.id} />
              <AddQuestionForm
                quizId={quiz.id}
                onAdded={(q) => setQuestions((prev) => [...prev, q])}
              />
              <div className="space-y-3">
                <h2 className="text-sm font-bold">
                  Questions ({questions.length})
                </h2>
                <QuestionList questions={questions} />
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
