import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  createCaptionTemplate,
  deleteCaptionTemplate,
  listCaptionTemplates,
  updateCaptionTemplate,
} from "@/services/captions";
import type { CaptionTemplate } from "@/types/growkit";

export const Route = createFileRoute("/_authenticated/legendas")({
  head: () => ({
    meta: [
      { title: "Legendas | GrowKit" },
      {
        name: "description",
        content: "Crie e organize modelos de legenda por nicho para seus Reels.",
      },
      { property: "og:title", content: "Legendas | GrowKit" },
      { property: "og:description", content: "Modelos de legenda reutilizáveis por nicho." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaptionsPage,
});

function CaptionsPage() {
  const queryClient = useQueryClient();
  const templates = useQuery({ queryKey: ["captions"], queryFn: listCaptionTemplates });

  const [search, setSearch] = useState("");
  const [nichoFilter, setNichoFilter] = useState("");
  const [editing, setEditing] = useState<CaptionTemplate | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [nicho, setNicho] = useState("");
  const [texto, setTexto] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CaptionTemplate | null>(null);

  function openForm(template: CaptionTemplate | null) {
    setEditing(template);
    setNome(template?.nome ?? "");
    setNicho(template?.nicho ?? "");
    setTexto(template?.texto ?? "");
    setFormOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!nome.trim()) throw new Error("Informe um nome.");
      if (!texto.trim()) throw new Error("Informe o texto da legenda.");
      const input = { nome: nome.trim(), texto: texto.trim(), nicho: nicho.trim() || null };
      return editing ? updateCaptionTemplate(editing.id, input) : createCaptionTemplate(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captions"] });
      setFormOpen(false);
      toast.success(editing ? "Legenda atualizada." : "Legenda criada.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCaptionTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captions"] });
      setPendingDelete(null);
      toast.success("Legenda excluída.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const nichos = Array.from(
    new Set((templates.data ?? []).map((t) => t.nicho).filter((n): n is string => Boolean(n))),
  );

  const filtered = (templates.data ?? []).filter((template) => {
    const matchesSearch = template.nome.toLowerCase().includes(search.trim().toLowerCase());
    const matchesNicho = !nichoFilter || template.nicho === nichoFilter;
    return matchesSearch && matchesNicho;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Legendas"
        description="Modelos de legenda reutilizáveis nos agendamentos."
        actions={<Button onClick={() => openForm(null)}>Nova legenda</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">Pesquisar</Label>
          <Input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome da legenda"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nicho-filter">Nicho</Label>
          <select
            id="nicho-filter"
            value={nichoFilter}
            onChange={(event) => setNichoFilter(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            {nichos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {templates.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            (templates.data ?? []).length === 0
              ? "Nenhuma legenda cadastrada"
              : "Nenhuma legenda encontrada"
          }
          description="Crie modelos para reaproveitar textos nos agendamentos."
          action={
            <Button size="sm" onClick={() => openForm(null)}>
              Nova legenda
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((template) => (
            <Card key={template.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{template.nome}</p>
                    {template.nicho ? (
                      <p className="text-xs text-muted-foreground">{template.nicho}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openForm(template)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingDelete(template)}>
                      Excluir
                    </Button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{template.texto}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar legenda" : "Nova legenda"}</DialogTitle>
            <DialogDescription>Defina um nome, o nicho e o texto da legenda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nicho">Nicho (opcional)</Label>
              <Input id="nicho" value={nicho} onChange={(event) => setNicho(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="texto">Texto</Label>
              <Textarea
                id="texto"
                rows={6}
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir legenda?</AlertDialogTitle>
            <AlertDialogDescription>
              Agendamentos que usam este modelo mantêm o texto já definido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
