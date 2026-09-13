import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/page-header";
import { AccountStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toIsoTimestamp } from "@/lib/format";
import { listConnectedAccounts } from "@/services/accounts";
import { listCaptionTemplates } from "@/services/captions";
import { listHashtagGroups } from "@/services/hashtags";
import { listMediaAssets } from "@/services/media";
import { createScheduledPosts } from "@/services/schedule";

export const Route = createFileRoute("/_authenticated/agendar")({
  head: () => ({
    meta: [
      { title: "Novo agendamento | GrowKit" },
      {
        name: "description",
        content: "Agende um Reel para uma ou várias contas do Instagram no GrowKit.",
      },
      { property: "og:title", content: "Novo agendamento | GrowKit" },
      { property: "og:description", content: "Agende um Reel para várias contas de uma vez." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewSchedule,
});

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function NewSchedule() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const media = useQuery({ queryKey: ["media"], queryFn: () => listMediaAssets() });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: listConnectedAccounts });
  const captions = useQuery({ queryKey: ["captions"], queryFn: listCaptionTemplates });
  const hashtags = useQuery({ queryKey: ["hashtags"], queryFn: listHashtagGroups });

  const [mediaAssetId, setMediaAssetId] = useState("");
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [captionTemplateId, setCaptionTemplateId] = useState("");
  const [hashtagGroupId, setHashtagGroupId] = useState("");
  const [captionOverride, setCaptionOverride] = useState("");
  const [hashtagsOverride, setHashtagsOverride] = useState("");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("12:00");
  const [distribute, setDistribute] = useState(false);
  const [spacing, setSpacing] = useState(30);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!mediaAssetId) throw new Error("Selecione um Reel.");
      if (accountIds.length === 0) throw new Error("Selecione ao menos uma conta.");
      if (!date || !time) throw new Error("Informe data e horário.");
      const startAt = toIsoTimestamp(date, time);
      if (Number.isNaN(new Date(startAt).getTime())) throw new Error("Data ou horário inválido.");
      const overrideTags = hashtagsOverride
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      return createScheduledPosts({
        mediaAssetId,
        accountIds,
        captionTemplateId: captionTemplateId || null,
        hashtagGroupId: hashtagGroupId || null,
        captionOverride: captionOverride.trim() || null,
        hashtagsOverride: overrideTags.length > 0 ? overrideTags : null,
        startAt,
        spacingMinutes: distribute ? Math.max(0, spacing) : 0,
      });
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries();
      toast.success(
        count === 1 ? "1 agendamento criado." : `${count} agendamentos criados (um por conta).`,
      );
      navigate({ to: "/agendamentos" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function toggleAccount(id: string) {
    setAccountIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  const loading = media.isLoading || accounts.isLoading;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Novo agendamento"
        description="Escolha um Reel, as contas de destino, a legenda e o horário. Cada conta recebe um agendamento independente."
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (media.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhum Reel na biblioteca"
          description="Envie um vídeo antes de criar um agendamento."
          action={
            <Button asChild size="sm">
              <Link to="/biblioteca">Adicionar primeiro Reel</Link>
            </Button>
          }
        />
      ) : (
        <form
          className="grid gap-4 lg:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="media">Vídeo</Label>
              <select
                id="media"
                value={mediaAssetId}
                onChange={(event) => setMediaAssetId(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Selecione um Reel</option>
                {media.data!.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.original_filename ?? asset.storage_path}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contas de destino</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(accounts.data ?? []).length === 0 ? (
                <EmptyState
                  title="Nenhuma conta cadastrada"
                  description="Cadastre uma conta para escolher o destino."
                  action={
                    <Button asChild size="sm" variant="outline">
                      <Link to="/contas">Ir para contas</Link>
                    </Button>
                  }
                />
              ) : (
                accounts.data!.map((account) => (
                  <label key={account.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-3">
                      <Checkbox
                        checked={accountIds.includes(account.id)}
                        onCheckedChange={() => toggleAccount(account.id)}
                      />
                      {account.username ?? "Conta sem nome"}
                    </span>
                    <AccountStatusBadge status={account.account_status} />
                  </label>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legenda e hashtags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caption-template">Modelo de legenda (opcional)</Label>
                <select
                  id="caption-template"
                  value={captionTemplateId}
                  onChange={(event) => setCaptionTemplateId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Nenhum</option>
                  {(captions.data ?? []).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption-override">Legenda personalizada (opcional)</Label>
                <Textarea
                  id="caption-override"
                  rows={4}
                  value={captionOverride}
                  onChange={(event) => setCaptionOverride(event.target.value)}
                  placeholder="Sobrescreve o modelo para este agendamento."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtag-group">Grupo de hashtags (opcional)</Label>
                <select
                  id="hashtag-group"
                  value={hashtagGroupId}
                  onChange={(event) => setHashtagGroupId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Nenhum</option>
                  {(hashtags.data ?? []).map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags-override">Hashtags personalizadas (opcional)</Label>
                <Input
                  id="hashtags-override"
                  value={hashtagsOverride}
                  onChange={(event) => setHashtagsOverride(event.target.value)}
                  placeholder="#marketing #reels"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data e horário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={distribute}
                  onCheckedChange={(checked) => setDistribute(checked === true)}
                />
                Distribuir automaticamente entre as contas
              </label>

              {distribute ? (
                <div className="space-y-2">
                  <Label htmlFor="spacing">Intervalo mínimo (minutos)</Label>
                  <Input
                    id="spacing"
                    type="number"
                    min={1}
                    value={spacing}
                    onChange={(event) => setSpacing(Number(event.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    A primeira conta publica no horário escolhido e as seguintes são espaçadas por
                    esse intervalo.
                  </p>
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Criando..." : "Criar agendamento"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
