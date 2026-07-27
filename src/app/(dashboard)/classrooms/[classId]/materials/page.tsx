/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, AlertCircle } from "lucide-react";
import { materialsApi } from "@/services/api";
import { ApiError } from "@/services/http";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/dashboard-card";
import type { ApiMaterial } from "@/types/api";

export default function MaterialsPage() {
  const params = useParams();
  const { user } = useAuth();
  const classId = params.classId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await materialsApi.list(classId);
      setMaterials(data.materials || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load materials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const newMaterial = await materialsApi.upload({
        file,
        class_id: classId,
        title: file.name.replace(/\.[^/.]+$/, ""),
      });
      setMaterials((prev) => [...prev, newMaterial as ApiMaterial]);
    } catch (err) {
      if (err instanceof ApiError) {
        setUploadError(err.message);
      } else {
        setUploadError("Failed to upload material");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "video":
        return "🎬";
      case "text":
        return "📝";
      default:
        return "📋";
    }
  };

  const isTeacher = user?.role?.name === "teacher";

  return (
    <div className="min-w-0 flex-1 flex flex-col">
      <div className="border-b border-border px-6 py-4 lg:px-8">
        <Link href={`/classrooms/${classId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          Back to Class
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Class Materials</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isTeacher ? "Upload resources for your students" : "View materials from your teacher"}
              </p>
            </div>
            {isTeacher && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Upload className="size-4" />
                {uploading ? "Uploading..." : "Upload Material"}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {uploadError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{uploadError}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">Loading materials...</div>
            </div>
          )}

          {!loading && materials.length === 0 && (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold">No materials yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isTeacher ? "Upload your first material to get started" : "No materials have been uploaded yet"}
              </p>
            </div>
          )}

          {!loading && materials.length > 0 && (
            <div className="space-y-3">
              {materials.map((material) => (
                <DashboardCard
                  key={material.id}
                  title={material.title}
                  titleRender={<h3 className="truncate" />}
                  description={new Date(material.created_at).toLocaleDateString()}
                  action={<span className="text-2xl">{getFileIcon(material.file_type)}</span>}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  {material.file_url && (
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Open material
                    </a>
                  )}
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
