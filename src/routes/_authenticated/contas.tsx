import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import { AccountStatusBadge } from "@/components/status-badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { deleteConnectedAccount, instagramIntegration, listConnectedAccounts } from "@/services/accounts";

export const Route = createFileRoute("/_authenticated/contas")({
  head: () => ({
    meta: [
      { title: "Contas do Instagram | GrowKit" },
      {
        name: "description",
        content: "Acompanhe o status de cada conta profissional do Instagram cadastrada no GrowKit.",
      },
      { property: "og:title", content: "Contas do Instagram | GrowKit" },
      { property: "og:description", content: "Status e gestão das contas conectadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContasPage,
});

function ContasPage() {
  const queryClient = useQueryClient();
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: listConnectedAccounts });

  const remove = useMutation({
    mutationFn: deleteConnectedAccount,
    onSuccess: () => {
      toast.success("Conta removida.");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error("Não foi possível remover", { description: error.message }),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contas"
        description="Cada conta profissional do Instagram fica listada aqui com seu status de acesso."
        actions={
          <Button
            onClick={() => toast.info("Conexão com o Instagram chega na próxima fase do GrowKit.")}
            disabled={!instagramIntegration.isAvailable}
          >
            Conectar conta do Instagram
          </Button>
        }
      />

      {accounts.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (accounts.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          description="A conexão real com o Instagram será liberada na próxima fase. Até então, a lista permanece vazia."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {accounts.data!.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-start justify-between gap-3 pt-6">
                <div className="min-w-0">
                  <p className="truncate font-medium">{account.username ?? "Conta sem nome"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Adicionada em {formatDate(account.created_at)}
                  </p>
                  {account.token_expires_at ? (
                    <p className="text-xs text-muted-foreground">
                      Acesso válido até {formatDate(account.token_expires_at)}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <AccountStatusBadge status={account.account_status} />
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Remover conta">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover esta conta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Os agendamentos ligados a ela também serão removidos. Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(account.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
