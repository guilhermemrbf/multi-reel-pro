import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/page-header";
import { AccountStatusBadge, PostStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { listConnectedAccounts } from "@/services/accounts";
import { getDashboardStats, listRecentActivity, listUpcomingPosts } from "@/services/schedule";
import { ACCOUNT_ATTENTION_STATUSES, type AccountStatus } from "@/types/growkit";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel | GrowKit" },
      { name: "description", content: "Visão geral das contas, vídeos e agendamentos do GrowKit." },
      { property: "og:title", content: "Painel | GrowKit" },
      { property: "og:description", content: "Visão geral das contas, vídeos e agendamentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({ queryKey: ["dashboard-stats"], queryFn: getDashboardStats });
  const upcoming = useQuery({ queryKey: ["upcoming-posts"], queryFn: () => listUpcomingPosts(5) });
  const activity = useQuery({ queryKey: ["recent-activity"], queryFn: () => listRecentActivity(6) });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: listConnectedAccounts });

  const attention = (accounts.data ?? []).filter((a) =>
    ACCOUNT_ATTENTION_STATUSES.includes(a.account_status as AccountStatus),
  );

  const cards = [
    { label: "Contas", value: stats.data?.accounts },
    { label: "Vídeos", value: stats.data?.media },
    { label: "Agendados", value: stats.data?.scheduled },
    { label: "Publicados", value: stats.data?.published },
    { label: "Com erro", value: stats.data?.errors },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel"
        description="Resumo do que está no ar, do que está agendado e do que precisa de atenção."
        actions={
          <Button asChild>
            <Link to="/agendar">Novo agendamento</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {stats.isLoading ? (
                <Skeleton className="mt-2 h-8 w-12" />
              ) : (
                <p className="mt-1 text-3xl font-semibold tabular-nums">{card.value ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {attention.length > 0 ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader className="flex-row items-center gap-2">
            <AlertTriangle className="size-4 text-warning" />
            <CardTitle className="text-base">Contas que precisam de atenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.map((account) => (
              <div key={account.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{account.username ?? "Conta sem nome"}</span>
                <AccountStatusBadge status={account.account_status} />
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to="/contas">Gerenciar contas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas publicações</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (upcoming.data ?? []).length === 0 ? (
              <EmptyState
                title="Nada agendado"
                description="Crie um agendamento para ver a fila de publicações aqui."
                action={
                  <Button asChild size="sm">
                    <Link to="/agendar">Agendar Reel</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.data!.map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {post.media_assets?.original_filename ?? "Vídeo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.connected_accounts?.username ?? "Conta"} ·{" "}
                        {formatDateTime(post.scheduled_for)}
                      </p>
                    </div>
                    <PostStatusBadge status={post.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (activity.data ?? []).length === 0 ? (
              <EmptyState title="Sem atividade ainda" />
            ) : (
              <ul className="divide-y divide-border">
                {activity.data!.map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {post.media_assets?.original_filename ?? "Vídeo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Atualizado em {formatDateTime(post.updated_at)}
                      </p>
                    </div>
                    <PostStatusBadge status={post.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
