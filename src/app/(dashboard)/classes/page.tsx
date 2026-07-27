"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Check, Copy, LoaderCircle, Plus, Users } from "lucide-react";

import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "@/components/ui/typography";
import { getSidebarSections } from "@/constants/nav";
import { useApiData } from "@/hooks/use-api-data";
import { useAuth } from "@/hooks/use-auth";
import { classesApi } from "@/services/api";
import { ApiError } from "@/services/http";

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 font-mono font-bold"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="text-emerald-600" /> : <Copy />}
      {code}
    </Button>
  );
}

function CreateClassDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Class name is required");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await classesApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-1.5 font-semibold" />}>
        <Plus />
        Create Class
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="create-class-form">
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="class-name">Name</FieldLabel>
              <Input
                id="class-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Advanced Mathematics 101"
                aria-invalid={!!error}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="class-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="class-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this class?"
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form="create-class-form" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Create Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JoinClassDialog({ onJoined }: { onJoined: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("Class code is required");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await classesApi.enroll(code.trim().toUpperCase());
      setCode("");
      setOpen(false);
      onJoined();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't join the class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-1.5 font-semibold" />}>
        <Plus />
        Join with Code
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="join-class-form">
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="class-code">Class code</FieldLabel>
              <Input
                id="class-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MATH101"
                className="font-mono uppercase"
                aria-invalid={!!error}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form="join-class-form" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Join Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ClassesPage() {
  const { user } = useAuth();
  const role = user?.role?.name === "teacher" ? "teacher" : "student";

  const fetcher = useCallback(() => classesApi.list(), []);
  const { data, status, error, refetch } = useApiData(fetcher);

  return (
    <>
      <AppSidebar sections={getSidebarSections(role)} />
      <div className="min-w-0 flex-1 flex flex-col">
        <AppTopbar title="My Classes" subtitle={role === "teacher" ? "Classes you teach" : "Classes you're enrolled in"}>
          {role === "teacher" ? (
            <CreateClassDialog onCreated={refetch} />
          ) : (
            <JoinClassDialog onJoined={refetch} />
          )}
        </AppTopbar>

        <main className="p-6 lg:p-8">
          {status === "loading" && (
            <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading classes…
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={refetch}>
                Try again
              </Button>
            </div>
          )}

          {status === "success" && data && data.classes.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="size-10 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No classes yet</p>
              <Muted className="max-w-xs text-xs">
                {role === "teacher"
                  ? "Create your first class to start uploading materials and quizzes."
                  : "Join a class using the code your teacher shared with you."}
              </Muted>
            </div>
          )}

          {status === "success" && data && data.classes.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.classes.map((cls) => (
                <Card key={cls.id} className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="font-bold">{cls.name}</CardTitle>
                    {cls.description && (
                      <Muted className="text-xs leading-relaxed">
                        {cls.description}
                      </Muted>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {role === "teacher" ? (
                        <>
                          {cls.class_code && <CopyCodeButton code={cls.class_code} />}
                          <Badge variant="outline" className="gap-1.5">
                            <Users className="size-3" />
                            {cls.student_count ?? 0} students
                          </Badge>
                        </>
                      ) : (
                        cls.teacher?.full_name && (
                          <Badge variant="outline">{cls.teacher.full_name}</Badge>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full font-semibold"
                      nativeButton={false}
                      render={<Link href={`/classes/${cls.id}`} />}
                    >
                      Open Class
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
