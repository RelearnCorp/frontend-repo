"use client";

import { useCallback } from "react";
import { FileText, Image as ImageIcon, LoaderCircle, Video } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow, Muted } from "@/components/ui/typography";
import { InteractiveChart } from "@/components/tutor/interactive-chart";
import { useApiData } from "@/hooks/use-api-data";
import { materialsApi } from "@/services/api";
import type { ApiClass, MaterialFileType } from "@/types/api";

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

function MaterialsList({ classId }: { classId: string }) {
  const fetcher = useCallback(() => materialsApi.list(classId), [classId]);
  const { data, status } = useApiData(fetcher);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading materials…
      </div>
    );
  }

  if (!data || data.materials.length === 0) {
    return <Muted className="text-xs">No materials in this class yet.</Muted>;
  }

  return (
    <div className="space-y-2">
      {data.materials.slice(0, 4).map((material) => {
        const Icon = iconFor(material.file_type);
        const content = (
          <Card size="sm" className="gap-0.5 transition-colors hover:bg-sidebar-accent/40">
            <CardHeader className="flex-row items-center gap-2.5">
              <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              <CardTitle className="truncate text-xs font-semibold" render={<h3 />}>
                {material.title}
              </CardTitle>
            </CardHeader>
          </Card>
        );
        return material.file_url ? (
          <a
            key={material.id}
            href={material.file_url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {content}
          </a>
        ) : (
          <div key={material.id}>{content}</div>
        );
      })}
    </div>
  );
}

export function SidebarBuddy({
  classes,
  classesLoading,
  selectedClassId,
  onSelectClass,
}: {
  classes: ApiClass[];
  classesLoading: boolean;
  selectedClassId: string | null;
  onSelectClass: (classId: string) => void;
}) {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-7 overflow-y-auto border-r bg-background p-5 xl:flex">
      <section>
        <Eyebrow render={<h2 />} className="pb-3 text-xs text-foreground">
          Studying
        </Eyebrow>
        {classesLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading classes…
          </div>
        ) : classes.length === 0 ? (
          <Muted className="text-xs leading-relaxed">
            Join a class to get materials and score history alongside your
            chat.
          </Muted>
        ) : (
          <Select
            value={selectedClassId ?? undefined}
            onValueChange={(v) => onSelectClass(v as string)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </section>

      {selectedClassId && (
        <>
          <section>
            <Eyebrow render={<h2 />} className="pb-3 text-xs text-foreground">
              Materials
            </Eyebrow>
            <MaterialsList classId={selectedClassId} />
          </section>

          <section>
            <Eyebrow render={<h2 />} className="pb-3 text-xs text-foreground">
              Your Recent Scores
            </Eyebrow>
            <InteractiveChart classId={selectedClassId} />
          </section>
        </>
      )}
    </aside>
  );
}
