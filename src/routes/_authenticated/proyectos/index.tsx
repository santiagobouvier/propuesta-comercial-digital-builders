import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Link as RouterLink } from "@tanstack/react-router";

import { usePerfil } from "@/hooks/use-perfil";
import {
  ESTADOS,
  VALIDACION_ABIERTA,
  fetchAvance,
  fetchProyectos,
  suscribirPortal,
  type Estado,
} from "@/lib/portal";

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
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
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
    <main className="db-z mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:pt-12">
      <div className="flex items-center gap-3">
        <span className="db-eyebrow text-[#10B981]">DAC · Grupo Agencia</span>
        <span className="h-px w-8 bg-white/15" />
        <span className="db-eyebrow text-white/35">2026</span>
      </div>
      <h1 className="db-display db-grad mt-3 text-[clamp(2.2rem,8.5vw,3.6rem)]">
        Validación de alcance
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
        Revisá cada funcionalidad, marcá su estado y dejá comentarios. Todo queda registrado con
        autor y fecha.
      </p>

      {!VALIDACION_ABIERTA ? (
        <div className="db-soft mt-5 rounded-2xl px-4 py-3 text-sm text-white/50">
          Este portal es la herramienta con la que validaremos cada módulo durante el proyecto.
          Hasta la firma del contrato se encuentra en <strong className="text-white">modo lectura</strong>.
        </div>
      ) : (
        !perfil &&
        !errorPerfil && (
          <div className="db-soft mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3 text-sm text-white/50">
            <span>
              Estás en <strong className="text-white">modo lectura</strong>. Para validar o
              comentar,
            </span>
            <RouterLink to="/login" className="font-medium text-white underline">
              ingresá con tu correo
            </RouterLink>
          </div>
        )
      )}
      {errorPerfil ? (
        <p className="mt-5 text-sm text-red-400">
          Tu correo no está en la lista de invitados: podés mirar, pero no validar.
        </p>
      ) : null}

      {totalFuncs > 0 && (
        <div className="db-glass mt-8 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-white">Avance global</p>
            <p className="db-eyebrow text-white/30">
              {total.validado}/{totalFuncs} validadas
            </p>
          </div>
          <div className="mt-3">
            <BarraEstados conteo={total} total={totalFuncs} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
            {(Object.keys(ESTADOS) as Estado[]).map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: ESTADOS[e].color }} />
                {ESTADOS[e].etiqueta}: {total[e]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {proyectos.data?.map((p) => {
          const c = avance.data?.get(p.id);
          const n = c ? Object.values(c).reduce((a, b) => a + b, 0) : 0;
          return (
            <Link
              key={p.id}
              to="/proyectos/$slug"
              params={{ slug: p.slug }}
              className="db-glass group rounded-3xl p-5 transition hover:border-white/25 sm:p-6"
              style={{ borderTopColor: p.color, borderTopWidth: 2 }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[19px] font-semibold tracking-tight text-white">{p.nombre}</h2>
                {c && (
                  <span className="db-eyebrow text-white/30">
                    {c.validado}/{n}
                  </span>
                )}
              </div>
              {p.bajada && <p className="mt-1 text-sm text-white/45">{p.bajada}</p>}
              <div className="mt-4">{c && <BarraEstados conteo={c} total={n} />}</div>
              <p className="db-eyebrow mt-4 text-white/35 transition group-hover:text-white">
                Abrir detalle →
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
