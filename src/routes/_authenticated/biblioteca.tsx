import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Play, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatDate, formatDuration } from "@/lib/format";
import {
  createSignedUrl,
  deleteMediaAsset,
  listMediaAssets,
  uploadMediaAsset,
  validateVideoFile,
} from "@/services/media";
import type { MediaAsset } from "@/types/growkit";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca de vídeos | GrowKit" },
      {
        name: "description",
        content: "Envie e organize os vídeos MP4 e MOV que serão publicados como Reels.",
      },
      { property: "og:title", content: "Biblioteca de vídeos | GrowKit" },
      { property: "og:description", content: "Vídeos prontos para agendamento no GrowKit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BibliotecaPage,
});

function BibliotecaPage() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ asset: MediaAsset; url: string } | null>(null);
  const assets = useQuery({ queryKey: ["media"], queryFn: () => listMediaAssets() });

  const upload = useMutation({
    mutationFn: uploadMediaAsset,
    onSuccess: () => {
      toast.success("Vídeo enviado.");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error("Falha no envio", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => {
      toast.success("Vídeo excluído.");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error("Não foi possível excluir", { description: error.message }),
  });

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const problem = validateVideoFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    upload.mutate(file);
  }

  async function openPreview(asset: MediaAsset) {
    try {
      const url = await createSignedUrl(asset.storage_path);
      setPreview({ asset, url });
    } catch (error) {
      toast.error("Não foi possível abrir o vídeo", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Biblioteca"
        description="Envie vídeos em MP4 ou MOV de até 500 MB. Eles ficam guardados de forma privada."
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/40 px-6 py-12 text-center"
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="mt-3 font-medium">Arraste um vídeo aqui</p>
        <p className="mt-1 text-sm text-muted-foreground">MP4 ou MOV, no máximo 500 MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button className="mt-5" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? "Enviando…" : "Escolher arquivo"}
        </Button>
      </div>

      {assets.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (assets.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhum vídeo ainda"
          description="Envie seu primeiro vídeo para poder agendá-lo nas suas contas."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.data!.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="space-y-3 pt-6">
                <p className="truncate font-medium">{asset.original_filename ?? "Vídeo"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(asset.file_size_bytes)} · {formatDuration(asset.duration_seconds)} ·{" "}
                  {formatDate(asset.created_at)}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openPreview(asset)}>
                    <Play className="mr-1 size-3.5" />
                    Ver
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="Excluir vídeo">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir este vídeo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O arquivo e os agendamentos que usam este vídeo serão removidos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate(asset)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate">
              {preview?.asset.original_filename ?? "Vídeo"}
            </DialogTitle>
          </DialogHeader>
          {preview ? (
            <video src={preview.url} controls className="max-h-[70vh] w-full rounded-md bg-black" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
