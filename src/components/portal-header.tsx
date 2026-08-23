import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { nombreVisible } from "@/lib/perfil";
import { usePerfil } from "@/hooks/use-perfil";

export function PortalHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: perfil } = usePerfil();

  async function cerrarSesion() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/proyectos" className="text-sm font-semibold text-foreground">
          Portal de validación
        </Link>
        <div className="flex items-center gap-3">
          <span className="max-w-[10rem] truncate text-sm text-muted-foreground">
            {nombreVisible(perfil)}
          </span>
          <Button variant="outline" size="sm" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
