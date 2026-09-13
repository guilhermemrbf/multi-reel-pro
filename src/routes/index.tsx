import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Instagram, ShieldCheck, Video } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GrowKit — Central de Reels para várias contas" },
      {
        name: "description",
        content:
          "Organize vídeos, legendas, hashtags e agendamentos de Reels de várias contas profissionais do Instagram em um só painel.",
      },
      { property: "og:title", content: "GrowKit — Central de Reels para várias contas" },
      {
        property: "og:description",
        content:
          "Biblioteca de vídeos, modelos de legenda, grupos de hashtags e agenda de publicações em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Instagram,
    title: "Várias contas",
    text: "Cadastre e acompanhe o status de cada conta profissional em um painel único.",
  },
  {
    icon: Video,
    title: "Biblioteca de vídeos",
    text: "Envie seus Reels em MP4 ou MOV e mantenha tudo organizado com segurança.",
  },
  {
    icon: CalendarClock,
    title: "Agenda inteligente",
    text: "Agende o mesmo vídeo em várias contas com intervalo automático entre elas.",
  },
  {
    icon: ShieldCheck,
    title: "Dados isolados",
    text: "Cada usuário só acessa o próprio conteúdo, com armazenamento privado.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            G
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">GrowKit</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="py-16 sm:py-24">
          <p className="text-sm font-medium text-primary">Gestão de Reels</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Toda a produção dos seus Reels organizada em um só painel
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground">
            Centralize contas, vídeos, legendas, hashtags e a agenda de publicações. A publicação
            automática no Instagram entra na próxima fase — a fundação já está pronta.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Começar agora</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
