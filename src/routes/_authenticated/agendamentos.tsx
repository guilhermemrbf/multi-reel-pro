import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import { PostStatusBadge } from "@/components/status-badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { listConnectedAccounts } from "@/services/accounts";
import {
  cancelScheduledPost,
  deleteScheduledPost,
  listScheduledPosts,
  type ScheduledPostFilters,
} from "@/services/schedule";
import { POST_STATUS_LABELS, type PostStatus, type ScheduledPostDetailed } from "@/types/growkit";

export const Route = createFileRoute("/_authenticated/agendamentos")({
  head: () => ({
    meta: [
      { title: "Agendamentos | GrowKit" },
      {
        name: "description",
        content: "Acompanhe a fila de agendamentos de Reels por conta, status e período.",
      },
      { property: "og:title", content: "Agendamentos | GrowKit" },
      { property: "og:description", content: "Fila de agendamentos com filtros e ações." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScheduledPostsPage,
});

function ScheduledPostsPage() {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState("");
  const [status, setStatus] = useState<PostStatus | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<ScheduledPostDetailed | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ScheduledPostDetailed | null>(null);

  const filters: ScheduledPostFilters = {
    ...(accountId ? { accountId } : {}),
    status,
    ...(from ? { from: new Date(`${from}T00:00:00`).toISOString() } : {}),
    ...(to ? { to: new Date(`${to}T23:59:59`).toISOString() } : {}),
  };

  const accounts = useQuery({ queryKey: ["accounts"], queryFn: listConnectedAccounts });
  const posts = useQuery({
    queryKey: ["scheduled-posts", filters],
    queryFn: () => listScheduledPosts(filters),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelScheduledPost,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Agendamento cancelado.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduledPost,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setPendingDelete(null);
      toast.success("Agendamento excluído.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agendamentos"
        description="Fila de publicações. Nesta fase os agendamentos ficam registrados; a publicação automática chega na próxima fase."
        actions={
          <Button asChild>
            <Link to="/agendar">Novo agendamento</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-account">Conta</Label>
            <select
              id="filter-account"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todas</option>
              {(accounts.data ?? []).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.username ?? "Conta sem nome"}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-status">Status</Label>
            <select
              id="filter-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PostStatus | "all")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos</option>
              {Object.entries(POST_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-from">De</Label>
            <Input
              id="filter-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-to">Até</Label>
            <Input
              id="filter-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {posts.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : posts.isError ? (
        <EmptyState
          title="Não foi possível carregar os agendamentos"
          description="Tente novamente em alguns instantes."
          action={
            <Button size="sm" variant="outline" onClick={() => posts.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : (posts.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhum agendamento encontrado"
          description="Ajuste os filtros ou crie um novo agendamento."
          action={
            <Button asChild size="sm">
              <Link to="/agendar">Novo agendamento</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {posts.data!.map((post) => (
                <li key={post.id} className="flex flex-wrap items-center gap-3 px-4 py-4 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {post.media_assets?.original_filename ?? "Vídeo"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.connected_accounts?.username ?? "Conta"} ·{" "}
                      {formatDateTime(post.scheduled_for)}
                    </p>
                  </div>
                  <PostStatusBadge status={post.status} />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDetail(post)}>
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={post.status !== "pending" || cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(post.id)}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPendingDelete(post)}>
                      Excluir
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
            <DialogDescription>
              {detail?.media_assets?.original_filename ?? "Vídeo"}
            </DialogDescription>
          </DialogHeader>
          {detail ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Conta</dt>
                <dd>{detail.connected_accounts?.username ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Programado para</dt>
                <dd>{formatDateTime(detail.scheduled_for)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <PostStatusBadge status={detail.status} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Tentativas</dt>
                <dd>{detail.attempt_count}</dd>
              </div>
              {detail.error_message ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Erro</dt>
                  <dd className="text-destructive">{detail.error_message}</dd>
                </div>
              ) : null}
              <div className="space-y-1 pt-2">
                <dt className="text-muted-foreground">Legenda</dt>
                <dd className="whitespace-pre-wrap">
                  {detail.caption_override ?? detail.caption_templates?.texto ?? "—"}
                </dd>
              </div>
              <div className="space-y-1 pt-2">
                <dt className="text-muted-foreground">Hashtags</dt>
                <dd className="flex flex-wrap gap-1">
                  {(detail.hashtags_override ?? detail.hashtag_groups?.hashtags ?? []).length ===
                  0 ? (
                    <span>—</span>
                  ) : (
                    (detail.hashtags_override ?? detail.hashtag_groups!.hashtags).map((tag) => (
                      <span key={tag} className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O registro será removido definitivamente. O vídeo continua na biblioteca.
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
