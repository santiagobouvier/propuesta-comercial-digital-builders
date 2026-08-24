import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { usePerfil } from "@/hooks/use-perfil";
import { nombreVisible } from "@/lib/perfil";
import {
  ESTADOS,
  ORDEN_ESTADOS,
  agregarComentario,
  cambiarEstado,
  fetchFuncionalidades,
  fetchProyecto,
  suscribirPortal,
  type Comentario,
  type Estado,
  type FuncionalidadConEstado,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/proyectos/$slug")({
  head: () => ({
    meta: [
      { title: "Detalle del proyecto · Portal de validación DAC" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DetalleProyecto,
});

const fechaCorta = new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "short" });

function PildoraEstado({ estado }: { estado: Estado }) {
  const e = ESTADOS[estado];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: e.color, background: e.fondo }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} />
      {e.etiqueta}
    </span>
  );
}

function HiloComentarios({
  funcionalidad,
  usuarioId,
  esDB,
}: {
  funcionalidad: FuncionalidadConEstado;
  usuarioId: string;
  esDB: boolean;
}) {
  const queryClient = useQueryClient();
  const [cuerpo, setCuerpo] = useState("");
  const [interno, setInterno] = useState(false);

  const enviar = useMutation({
    mutationFn: () =>
      agregarComentario({ funcionalidadId: funcionalidad.id, autorId: usuarioId, cuerpo, interno }),
    onSuccess: () => {
      setCuerpo("");
      setInterno(false);
      void queryClient.invalidateQueries({ queryKey: ["funcionalidades"] });
    },
  });

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      {funcionalidad.comentarios.map((c: Comentario) => (
        <div
          key={c.id}
          className={`rounded-xl p-3 text-sm ${c.interno ? "border border-dashed border-amber-500/40 bg-amber-500/5" : "bg-muted/60"}`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-medium text-foreground">
              {c.autor ? nombreVisible(c.autor as never) : "—"}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={
                c.autor?.lado === "dac"
                  ? { color: "#3B82F6", background: "rgba(59,130,246,.12)" }
                  : { color: "#10B981", background: "rgba(16,185,129,.12)" }
              }
            >
              {c.autor?.lado === "dac" ? "DAC" : "Digital Builders"}
            </span>
            {c.interno && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                Interno
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {fechaCorta.format(new Date(c.creado_en))}
            </span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-foreground/90">
            {c.cuerpo}
          </p>
        </div>
      ))}

      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (cuerpo.trim()) enviar.mutate();
        }}
        className="space-y-2"
      >
        <textarea
          value={cuerpo}
          onChange={(ev) => setCuerpo(ev.target.value)}
          rows={2}
          placeholder="Escribí un comentario…"
          className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3">
          {esDB ? (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={interno}
                onChange={(ev) => setInterno(ev.target.checked)}
                className="h-3.5 w-3.5 accent-amber-500"
              />
              Interno (DAC no lo ve)
            </label>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!cuerpo.trim() || enviar.isPending}
            className="rounded-xl bg-foreground px-4 py-1.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-40"
          >
            {enviar.isPending ? "Enviando…" : "Comentar"}
          </button>
        </div>
        {enviar.isError && (
          <p className="text-xs text-destructive">No se pudo enviar. Probá de nuevo.</p>
        )}
      </form>
    </div>
  );
}

function TarjetaFuncionalidad({
  f,
  color,
  usuarioId,
  esDAC,
  esDB,
}: {
  f: FuncionalidadConEstado;
  color: string;
  usuarioId: string;
  esDAC: boolean;
  esDB: boolean;
}) {
  const queryClient = useQueryClient();
  const [abierta, setAbierta] = useState(false);
  const estado: Estado = f.validaciones?.estado ?? "pendiente";
  const requisitos = (f.detalle ?? "").split("\n").filter(Boolean);

  const mutarEstado = useMutation({
    mutationFn: (nuevo: Estado) => cambiarEstado(f.id, nuevo, usuarioId),
    onMutate: async (nuevo) => {
      await queryClient.cancelQueries({ queryKey: ["funcionalidades"] });
      const previo = queryClient.getQueriesData({ queryKey: ["funcionalidades"] });
      queryClient.setQueriesData(
        { queryKey: ["funcionalidades"] },
        (datos: FuncionalidadConEstado[] | undefined) =>
          datos?.map((x) =>
            x.id === f.id
              ? {
                  ...x,
                  validaciones: {
                    funcionalidad_id: x.id,
                    actualizado_por: usuarioId,
                    actualizado_en: new Date().toISOString(),
                    ...x.validaciones,
                    estado: nuevo,
                  },
                }
              : x,
          ),
      );
      return { previo };
    },
    onError: (_e, _v, ctx) => {
      for (const [clave, datos] of ctx?.previo ?? []) queryClient.setQueryData(clave, datos);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["funcionalidades"] });
      void queryClient.invalidateQueries({ queryKey: ["avance"] });
    },
  });

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-wide" style={{ color }}>
            {f.codigo}
            {f.mes_objetivo && (
              <span className="ml-2 text-muted-foreground">· {f.mes_objetivo}</span>
            )}
          </p>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
            {f.titulo}
          </h3>
        </div>
        <PildoraEstado estado={estado} />
      </div>

      <ul className="mt-3 space-y-1.5">
        {requisitos.map((r, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/75">
            <span
              className="mt-[9px] h-1 w-1 shrink-0 rounded-full"
              style={{ background: color }}
            />
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {esDAC ? (
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Estado">
            {ORDEN_ESTADOS.map((e) => (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={estado === e}
                disabled={mutarEstado.isPending}
                onClick={() => e !== estado && mutarEstado.mutate(e)}
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
                style={
                  estado === e
                    ? {
                        color: ESTADOS[e].color,
                        background: ESTADOS[e].fondo,
                        borderColor: ESTADOS[e].color,
                      }
                    : { color: "var(--muted-foreground)", borderColor: "var(--border)" }
                }
              >
                {ESTADOS[e].etiqueta}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">La validación la hace el equipo de DAC.</p>
        )}

        <button
          type="button"
          onClick={() => setAbierta(!abierta)}
          className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          {abierta ? "Ocultar" : "Comentarios"} ({f.comentarios.length})
        </button>
      </div>

      {mutarEstado.isError && (
        <p className="mt-2 text-xs text-destructive">
          {mutarEstado.error instanceof Error
            ? mutarEstado.error.message
            : "No se pudo guardar el cambio."}
        </p>
      )}
      {f.validaciones?.actualizado_por && estado !== "pendiente" && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Actualizado el {fechaCorta.format(new Date(f.validaciones.actualizado_en))}
        </p>
      )}

      {abierta && <HiloComentarios funcionalidad={f} usuarioId={usuarioId} esDB={esDB} />}
    </article>
  );
}

function DetalleProyecto() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: perfil } = usePerfil();

  const proyecto = useQuery({ queryKey: ["proyecto", slug], queryFn: () => fetchProyecto(slug) });
  const funcionalidades = useQuery({
    queryKey: ["funcionalidades", slug],
    queryFn: () => fetchFuncionalidades(proyecto.data!.id),
    enabled: !!proyecto.data,
  });

  useEffect(
    () =>
      suscribirPortal(() => {
        void queryClient.invalidateQueries({ queryKey: ["funcionalidades"] });
        void queryClient.invalidateQueries({ queryKey: ["avance"] });
      }),
    [queryClient],
  );

  const [filtro, setFiltro] = useState<Estado | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    let lista = funcionalidades.data ?? [];
    if (filtro !== "todos") {
      lista = lista.filter((f) => (f.validaciones?.estado ?? "pendiente") === filtro);
    }
    const q = busqueda.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (f) => f.titulo.toLowerCase().includes(q) || (f.detalle ?? "").toLowerCase().includes(q),
      );
    }
    return lista;
  }, [funcionalidades.data, filtro, busqueda]);

  if (proyecto.isPending || !perfil) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">Cargando…</main>
    );
  }
  if (proyecto.isError) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm text-destructive">No encontramos ese proyecto.</p>
        <Link to="/proyectos" className="mt-3 inline-block text-sm text-foreground underline">
          Volver a proyectos
        </Link>
      </main>
    );
  }

  const p = proyecto.data;
  const todas = funcionalidades.data ?? [];
  const conteo = { pendiente: 0, validado: 0, con_cambios: 0, no_va: 0 } as Record<Estado, number>;
  for (const f of todas) conteo[f.validaciones?.estado ?? "pendiente"] += 1;
  const esDAC = perfil.lado === "dac";
  const esDB = perfil.lado === "digital_builders";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/proyectos"
        className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        ← Todos los proyectos
      </Link>

      <div
        className="mt-4 rounded-2xl border border-border bg-card p-6"
        style={{ borderTopColor: p.color, borderTopWidth: 3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{p.nombre}</h1>
        {p.bajada && <p className="mt-1 text-sm text-muted-foreground">{p.bajada}</p>}

        <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {(["validado", "con_cambios", "no_va"] as Estado[]).map((e) =>
            conteo[e] && todas.length ? (
              <div
                key={e}
                style={{
                  width: `${(conteo[e] / todas.length) * 100}%`,
                  background: ESTADOS[e].color,
                }}
              />
            ) : null,
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono text-foreground">
            {conteo.validado}/{todas.length} validadas
          </span>
          {(Object.keys(ESTADOS) as Estado[]).map((e) =>
            conteo[e] ? (
              <span key={e} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: ESTADOS[e].color }} />
                {ESTADOS[e].etiqueta}: {conteo[e]}
              </span>
            ) : null,
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["todos", ...ORDEN_ESTADOS] as (Estado | "todos")[]).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setFiltro(e)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filtro === e
                  ? "border-foreground/50 bg-foreground/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {e === "todos" ? `Todas (${todas.length})` : `${ESTADOS[e].etiqueta} (${conteo[e]})`}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(ev) => setBusqueda(ev.target.value)}
          placeholder="Buscar…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none sm:w-52"
        />
      </div>

      <div className="mt-5 space-y-4">
        {funcionalidades.isPending && (
          <p className="text-sm text-muted-foreground">Cargando funcionalidades…</p>
        )}
        {visibles.map((f) => (
          <TarjetaFuncionalidad
            key={f.id}
            f={f}
            color={p.color}
            usuarioId={perfil.id}
            esDAC={esDAC}
            esDB={esDB}
          />
        ))}
        {!funcionalidades.isPending && !visibles.length && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Ninguna funcionalidad coincide con el filtro.
          </p>
        )}
      </div>
    </main>
  );
}
