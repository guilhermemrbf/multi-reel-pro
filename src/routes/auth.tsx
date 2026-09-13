import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no GrowKit | Agendamento de Reels" },
      {
        name: "description",
        content:
          "Acesse o GrowKit para organizar vídeos, legendas e agendamentos de Reels em várias contas do Instagram.",
      },
      { property: "og:title", content: "Entrar no GrowKit" },
      {
        property: "og:description",
        content: "Painel do GrowKit para gestão de Reels em múltiplas contas do Instagram.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (!data.session) {
      setAwaitingConfirm(true);
      toast.success("Confira seu e-mail para confirmar a conta.");
    }
  }

  async function google() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (error) {
      toast.error("Falha no login com Google", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            G
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">GrowKit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Central de Reels para múltiplas contas do Instagram.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso</CardTitle>
            <CardDescription>Entre com seu e-mail ou crie uma conta.</CardDescription>
          </CardHeader>
          <CardContent>
            {awaitingConfirm ? (
              <div className="space-y-4 text-sm">
                <p>
                  Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele para
                  ativar sua conta e depois volte aqui para entrar.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setAwaitingConfirm(false)}>
                  Voltar
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar conta</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-5">
                  <form className="space-y-4" onSubmit={signIn}>
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">E-mail</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      Entrar
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-5">
                  <form className="space-y-4" onSubmit={signUp}>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome</Label>
                      <Input
                        id="signup-name"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      Criar conta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {!awaitingConfirm ? (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  ou
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button variant="outline" className="w-full" onClick={google} disabled={loading}>
                  Continuar com Google
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
