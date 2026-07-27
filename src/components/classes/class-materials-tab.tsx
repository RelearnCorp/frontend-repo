"use client";

import { useCallback, useState } from "react";
import { FileText, Image as ImageIcon, LoaderCircle, Plus, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Muted } from "@/components/ui/typography";
import { useApiData } from "@/hooks/use-api-data";
import { materialsApi } from "@/services/api";
import { ApiError } from "@/services/http";
import type { MaterialFileType } from "@/types/api";

function iconFor(type: MaterialFileType) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "video":
      return Video;
    default:
      return FileText;
  }
}

function UploadMaterialDialog({
  classId,
  onUploaded,
}: {
  classId: string;
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !file) {
      setError("Title and a file are both required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await materialsApi.upload({ file, class_id: classId, title: title.trim() });
      setTitle("");
      setFile(null);
      setOpen(false);
      onUploaded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't upload the file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-1.5 font-semibold" />}>
        <Plus />
        Upload Material
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="upload-material-form">
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="material-title">Title</FieldLabel>
              <Input
                id="material-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter 5: Introduction to Derivatives"
                aria-invalid={!!error}
              />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="material-file">File</FieldLabel>
              <Input
                id="material-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form="upload-material-form" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ClassMaterialsTab({
  classId,
  role,
}: {
  classId: string;
  role: "teacher" | "student";
}) {
  const fetcher = useCallback(() => materialsApi.list(classId), [classId]);
  const { data, status, error, refetch } = useApiData(fetcher);

  return (
    <div className="space-y-4">
      {role === "teacher" && (
        <div className="flex justify-end">
          <UploadMaterialDialog classId={classId} onUploaded={refetch} />
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading materials…
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {status === "success" && data && data.materials.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <FileText className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-semibold">No materials yet</p>
          <Muted className="text-xs">
            {role === "teacher"
              ? "Upload a PDF, image, or video to share with your students."
              : "Your teacher hasn't uploaded anything yet."}
          </Muted>
        </div>
      )}

      {status === "success" && data && data.materials.length > 0 && (
        <ul className="space-y-3">
          {data.materials.map((material) => {
            const Icon = iconFor(material.file_type);
            return (
              <li
                key={material.id}
                className="flex items-center gap-3 rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-foreground/10">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{material.title}</p>
                  <Muted className="text-xs">
                    Uploaded {new Date(material.created_at).toLocaleDateString()}
                  </Muted>
                </div>
                {material.file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a href={material.file_url} target="_blank" rel="noreferrer" />
                    }
                  >
                    Open
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
