import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Folder, LogOut, Menu, User, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePerfil } from "@/hooks/use-perfil";
import { nombreVisible } from "@/lib/perfil";
import logoIcon from "@/assets/logo-icon.png.asset.json";

export function PortalHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: perfil } = usePerfil();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function cerrarSesion() {
    setMobileOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const Logo = (
    <Link
      to="/proyectos"
      className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-card ring-1 ring-border group-hover:ring-primary/40 transition-all duration-300">
        <img
          src={logoIcon.url}
          alt=""
          className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </span>
      <span className="font-display text-base font-semibold tracking-tight text-foreground">
        Digital Builders
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        {Logo}

        {isMobile ? (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menú"
                className="h-10 w-10 rounded-xl text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[85vw] max-w-xs flex-col border-l border-primary/20 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-primary/5 px-5 py-6"
            >
              <SheetHeader className="space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-background ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                    <img src={logoIcon.url} alt="" className="h-7 w-7 object-contain" />
                  </span>
                  <div className="flex flex-col">
                    <SheetTitle className="font-display text-lg tracking-tight">
                      Digital Builders
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Portal de validación
                    </SheetDescription>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {nombreVisible(perfil)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{perfil?.email || ""}</p>
                  </div>
                </div>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-2">
                <Link
                  to="/proyectos"
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Folder className="h-4 w-4" />
                  </span>
                  Proyectos
                </Link>
              </nav>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={cerrarSesion}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Digital Builders · Portal de validación
                </p>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-3">
            <span className="max-w-[14rem] truncate text-sm text-muted-foreground">
              {nombreVisible(perfil)}
            </span>
            <Button variant="outline" size="sm" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
