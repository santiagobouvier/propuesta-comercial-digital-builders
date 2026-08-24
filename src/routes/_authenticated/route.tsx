import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { PortalHeader } from "@/components/portal-header";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cota superior para leer la sesión. Cubre el broker de sesión del preview de
 * Lovable, que resuelve por postMessage y puede no contestar; sin esta cota el
 * guard quedaba esperando para siempre y la ruta se veía en negro.
 */
const ESPERA_MS = 6000;

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession lee del almacenamiento local: no hace un viaje a la red como
    // getUser, así que no puede colgarse contra el backend. La validez real
    // del token la siguen garantizando las políticas RLS en cada consulta.
    const espera = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ESPERA_MS);
    });
    const sesion = await Promise.race([
      supabase.auth.getSession().then(({ data }) => data.session),
      espera,
    ]);
    if (!sesion) throw redirect({ to: "/login" });
    return { user: sesion.user };
  },
  pendingMs: 0,
  pendingComponent: Verificando,
  errorComponent: ErrorDeAcceso,
  component: PortalLayout,
});

function Verificando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <span
          className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm text-muted-foreground">Verificando acceso…</p>
      </div>
    </div>
  );
}

function ErrorDeAcceso({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold text-foreground">No pudimos verificar tu acceso</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {error?.message ?? "Error desconocido."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-foreground px-4 py-2 font-medium text-background"
          >
            Reintentar
          </button>
          <Link to="/login" className="rounded-xl border border-border px-4 py-2 text-foreground">
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  );
}

function PortalLayout() {
  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />
      <Outlet />
    </div>
  );
}
