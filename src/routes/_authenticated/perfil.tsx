import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, updateMyProfile } from "@/services/profile";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil | GrowKit" },
      { name: "description", content: "Gerencie os dados do seu perfil no GrowKit." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.full_name ?? "");
      setAvatarUrl(profile.data.avatar_url ?? "");
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () => updateMyProfile({ full_name: name.trim() || null, avatar_url: avatarUrl.trim() || null }),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      toast.success("Perfil atualizado.");
    },
    onError: (error: Error) => toast.error("Não foi possível atualizar o perfil", { description: error.message }),
  });

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    window.location.assign("/auth");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Perfil" description="Atualize seus dados de acesso e a identificação exibida no GrowKit." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle>Dados do perfil</CardTitle><CardDescription>Essas informações pertencem somente à sua conta.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2"><Label htmlFor="profile-name">Nome</Label><Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" disabled={profile.isLoading} /></div>
            <div className="space-y-2"><Label htmlFor="profile-avatar">URL da foto <span className="text-muted-foreground">(opcional)</span></Label><Input id="profile-avatar" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." disabled={profile.isLoading} /></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || profile.isLoading}><Save className="mr-2 size-4" />{save.isPending ? "Salvando…" : "Salvar alterações"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="grid size-12 place-items-center rounded-full bg-muted"><UserRound className="size-5 text-muted-foreground" /></div><CardTitle className="mt-4">Conta</CardTitle><CardDescription>Seu login é gerenciado pelo Supabase Auth.</CardDescription></CardHeader>
          <CardContent><Button variant="outline" className="w-full" onClick={signOut}><LogOut className="mr-2 size-4" />Sair da conta</Button></CardContent>
        </Card>
      </div>
    </div>
  );
}
