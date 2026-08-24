import { useState } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PortalHeader } from "@/components/portal-header";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cota superior para leer la sesión: cubre el broker del preview de Lovable,
 * que resuelve por postMessage y puede no contestar.
 */
const ESPERA_MS = 6000;

/** La misma clave y el mismo flag de sessionStorage que usa la propuesta. */
const CLAVE = "DAC2026";
const FLAG = "db_prop_access";

function tienePase(): boolean {
  try {
    return sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  // Ya no redirige al login: sin sesión el portal se ve en modo lectura y las
  // políticas RLS solo permiten leer. Escribir sigue exigiendo cuenta invitada.
  beforeLoad: async () => {
    const espera = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ESPERA_MS);
    });
    const sesion = await Promise.race([
      supabase.auth.getSession().then(({ data }) => data.session),
      espera,
    ]);
    return { user: sesion?.user ?? null };
  },
  pendingMs: 0,
  pendingComponent: Verificando,
  errorComponent: ErrorDeAcceso,
  component: PortalLayout,
});

function Verificando() {
  return (
    <div className="db-fondo flex min-h-screen items-center justify-center px-6">
      <div className="db-z">
        <div className="text-center">
          <span
            className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-white/45">Cargando…</p>
        </div>
      </div>
    </div>
  );
}

function ErrorDeAcceso({ error }: { error: Error }) {
  return (
    <div className="db-fondo flex min-h-screen items-center justify-center px-6">
      <div className="db-z">
        <div className="db-glass max-w-md rounded-3xl p-6 text-center">
          <h1 className="text-lg font-semibold text-foreground">Algo salió mal</h1>
          <p className="mt-2 break-words text-sm text-muted-foreground">
            {error?.message ?? "Error desconocido."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}

function CompuertaClave({ onPase }: { onPase: () => void }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="db-fondo flex min-h-screen items-center justify-center px-6">
      <div className="db-z">
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (clave.trim().toUpperCase() === CLAVE) {
              try {
                sessionStorage.setItem(FLAG, "1");
              } catch {
                /* modo privado sin storage: dejamos pasar igual */
              }
              onPase();
            } else {
              setError(true);
              setClave("");
            }
          }}
          className="db-glass w-full max-w-sm rounded-3xl p-7"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Digital Builders
          </p>
          <h1 className="mt-3 text-xl font-semibold text-foreground">Portal de validación</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresá la clave de acceso de la propuesta para continuar.
          </p>
          <input
            type="password"
            value={clave}
            onChange={(ev) => {
              setClave(ev.target.value);
              setError(false);
            }}
            placeholder="••••••••"
            autoFocus
            className="mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono tracking-[0.2em] text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
          />
          {error && <p className="mt-2 text-xs text-destructive">Clave incorrecta.</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

function PortalLayout() {
  const { user } = Route.useRouteContext();
  const [pase, setPase] = useState(() => Boolean(user) || tienePase());

  if (!pase) return <CompuertaClave onPase={() => setPase(true)} />;

  return (
    <div className="db-fondo">
      <PortalHeader />
      <Outlet />
    </div>
  );
}
