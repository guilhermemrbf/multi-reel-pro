import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CalendarPlus,
  Hash,
  Instagram,
  LayoutDashboard,
  LogOut,
  Menu,
  Type,
  UserRound,
  Video,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/contas", label: "Contas", icon: Instagram },
  { to: "/biblioteca", label: "Biblioteca", icon: Video },
  { to: "/agendar", label: "Novo agendamento", icon: CalendarPlus },
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarClock },
  { to: "/legendas", label: "Legendas", icon: Type },
  { to: "/hashtags", label: "Hashtags", icon: Hash },
  { to: "/perfil", label: "Perfil", icon: UserRound },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75",
            "transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        G
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">GrowKit</span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <div className="flex flex-col gap-6">
          <Brand />
          <NavLinks />
        </div>
        <Button variant="ghost" className="justify-start gap-3" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sair
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-border bg-surface/60 px-4 py-3 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Navegação</SheetTitle>
              <div className="mt-4 flex flex-col gap-6">
                <Brand />
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Brand />
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleSignOut}>
            <LogOut className="size-5" />
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
