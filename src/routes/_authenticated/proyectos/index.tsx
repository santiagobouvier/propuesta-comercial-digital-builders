import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Link as RouterLink } from "@tanstack/react-router";

import { usePerfil } from "@/hooks/use-perfil";
import { ESTADOS, fetchAvance, fetchProyectos, suscribirPortal, type Estado } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/proyectos/")({
  head: () => ({
    meta: [
      { title: "Proyectos · Portal de validación DAC" },
      {
        name: "description",
        content: "Validá el alcance de cada proyecto, funcionalidad por funcionalidad.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProyectosPage,
});

function BarraEstados({ conteo, total }: { conteo: Record<Estado, number>; total: number }) {
  if (!total) return null;
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
      {(["validado", "con_cambios", "no_va"] as Estado[]).map((e) =>
        conteo[e] ? (
          <div
            key={e}
            style={{ width: `${(conteo[e] / total) * 100}%`, background: ESTADOS[e].color }}
          />
        ) : null,
      )}
    </div>
  );
}

function ProyectosPage() {
  const queryClient = useQueryClient();
  const { data: perfil, error: errorPerfil } = usePerfil();
  const proyectos = useQuery({ queryKey: ["proyectos"], queryFn: fetchProyectos });
  const avance = useQuery({ queryKey: ["avance"], queryFn: fetchAvance });

  useEffect(
    () => suscribirPortal(() => void queryClient.invalidateQueries({ queryKey: ["avance"] })),
    [queryClient],
  );

  const total = { pendiente: 0, validado: 0, con_cambios: 0, no_va: 0 } as Record<Estado, number>;
  for (const c of avance.data?.values() ?? []) {
    for (const e of Object.keys(total) as Estado[]) total[e] += c[e];
  }
  const totalFuncs = Object.values(total).reduce((a, b) => a + b, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        DAC · Grupo Agencia · 2026
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        Validación de alcance
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Revisá cada funcionalidad, marcá su estado y dejá comentarios. Todo queda registrado con
        autor y fecha.
      </p>

      {!perfil && !errorPerfil && (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span>
            Estás en <strong className="text-foreground">modo lectura</strong>. Para validar o
            comentar,
          </span>
          <RouterLink to="/login" className="font-medium text-foreground underline">
            ingresá con tu correo
          </RouterLink>
        </div>
      )}
      {errorPerfil ? (
        <p className="mt-5 text-sm text-destructive">
          Tu correo no está en la lista de invitados: podés mirar, pero no validar.
        </p>
      ) : null}

      {totalFuncs > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Avance global</p>
            <p className="font-mono text-sm text-muted-foreground">
              {total.validado}/{totalFuncs} validadas
            </p>
          </div>
          <div className="mt-3">
            <BarraEstados conteo={total} total={totalFuncs} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(Object.keys(ESTADOS) as Estado[]).map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: ESTADOS[e].color }} />
                {ESTADOS[e].etiqueta}: {total[e]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {proyectos.data?.map((p) => {
          const c = avance.data?.get(p.id);
          const n = c ? Object.values(c).reduce((a, b) => a + b, 0) : 0;
          return (
            <Link
              key={p.id}
              to="/proyectos/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/25"
              style={{ borderTopColor: p.color, borderTopWidth: 2 }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">{p.nombre}</h2>
                {c && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.validado}/{n}
                  </span>
                )}
              </div>
              {p.bajada && <p className="mt-1 text-sm text-muted-foreground">{p.bajada}</p>}
              <div className="mt-4">{c && <BarraEstados conteo={c} total={n} />}</div>
              <p className="mt-3 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                Abrir detalle →
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
