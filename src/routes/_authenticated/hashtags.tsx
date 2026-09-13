import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Hash, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, EmptyState } from "@/components/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createHashtagGroup, deleteHashtagGroup, listHashtagGroups, updateHashtagGroup, type HashtagGroupInput } from "@/services/hashtags";
import type { HashtagGroup } from "@/types/growkit";

export const Route = createFileRoute("/_authenticated/hashtags")({
  head: () => ({
    meta: [
      { title: "Hashtags | GrowKit" },
      { name: "description", content: "Crie e organize grupos de hashtags para seus Reels." },
    ],
  }),
  component: HashtagsPage,
});

const emptyForm: HashtagGroupInput = { nome: "", nicho: "", hashtags: [] };

function normalizeHashtags(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n\s]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
    ),
  );
}

function HashtagsPage() {
  const queryClient = useQueryClient();
  const groups = useQuery({ queryKey: ["hashtags"], queryFn: listHashtagGroups });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HashtagGroup | null>(null);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: () => (editing ? updateHashtagGroup(editing.id, form) : createHashtagGroup(form)),
    onSuccess: () => {
      toast.success(editing ? "Grupo atualizado." : "Grupo criado.");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["hashtags"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error("Não foi possível salvar", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: deleteHashtagGroup,
    onSuccess: () => {
      toast.success("Grupo excluído.");
      queryClient.invalidateQueries({ queryKey: ["hashtags"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error("Não foi possível excluir", { description: error.message }),
  });

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(group: HashtagGroup) {
    setEditing(group);
    setForm({ nome: group.nome, nicho: group.nicho ?? "", hashtags: group.hashtags });
    setOpen(true);
  }

  const rawHashtags = form.hashtags.join(" ");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hashtags"
        description="Monte grupos reutilizáveis para acelerar seus agendamentos."
        action={<Button onClick={startCreate}><Plus className="mr-2 size-4" />Novo grupo</Button>}
      />

      {groups.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-lg border border-border bg-muted/30" />)}
        </div>
      ) : (groups.data ?? []).length === 0 ? (
        <EmptyState title="Nenhum grupo ainda" description="Crie seu primeiro grupo de hashtags para reutilizá-lo nos agendamentos." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.data!.map((group) => (
            <Card key={group.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{group.nome}</CardTitle>
                  {group.nicho ? <p className="mt-1 text-xs text-muted-foreground">{group.nicho}</p> : null}
                </div>
                <Hash className="size-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{group.hashtags.join(" ") || "Nenhuma hashtag cadastrada."}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(group)}><Pencil className="mr-1.5 size-3.5" />Editar</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={`Excluir ${group.nome}`}><Trash2 className="size-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
                        <AlertDialogDescription>O grupo "{group.nome}" será removido. Agendamentos que já usam hashtags copiadas não serão alterados.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate(group.id)} disabled={remove.isPending}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar grupo" : "Novo grupo de hashtags"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="hashtag-name">Nome</Label><Input id="hashtag-name" value={form.nome} onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))} placeholder="Ex.: Alcance geral" /></div>
            <div className="space-y-2"><Label htmlFor="hashtag-niche">Nicho <span className="text-muted-foreground">(opcional)</span></Label><Input id="hashtag-niche" value={form.nicho ?? ""} onChange={(e) => setForm((current) => ({ ...current, nicho: e.target.value }))} placeholder="Ex.: Fitness" /></div>
            <div className="space-y-2"><Label htmlFor="hashtag-list">Hashtags</Label><Textarea id="hashtag-list" value={rawHashtags} onChange={(e) => setForm((current) => ({ ...current, hashtags: normalizeHashtags(e.target.value) }))} placeholder="#reels #instagram #conteudo" className="min-h-32" /><p className="text-xs text-muted-foreground">Separe por espaço, vírgula ou quebra de linha. O # é adicionado automaticamente.</p></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !form.nome.trim()}>{save.isPending ? "Salvando…" : "Salvar grupo"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
