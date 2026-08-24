import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { usePerfil } from "@/hooks/use-perfil";
import {
  ESTADOS,
  MESES,
  ORDEN_ESTADOS,
  agregarComentario,
  cambiarEstado,
  etiquetaAutor,
  fetchFuncionalidades,
  fetchProyecto,
  mesesDe,
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

/** Grupo 0: funcionalidades sin mes (transversales a todo el proyecto). */
const SIN_MES = 0;

function PildoraEstado({ estado }: { estado: Estado }) {
  const e = ESTADOS[estado];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
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
  usuarioId: string | null;
  esDB: boolean;
}) {
  const queryClient = useQueryClient();
  const [cuerpo, setCuerpo] = useState("");
  const [interno, setInterno] = useState(false);

  const enviar = useMutation({
    mutationFn: () => {
      if (!usuarioId) return Promise.reject(new Error("Ingresá para comentar."));
      return agregarComentario({
        funcionalidadId: funcionalidad.id,
        autorId: usuarioId,
        cuerpo,
        interno,
      });
    },
    onSuccess: () => {
      setCuerpo("");
      setInterno(false);
      void queryClient.invalidateQueries({ queryKey: ["funcionalidades"] });
    },
  });

  return (
    <div className="db-hair mt-4 space-y-3 pt-4">
      {funcionalidad.comentarios.map((c: Comentario) => (
        <div
          key={c.id}
          className={`rounded-2xl p-3.5 text-sm ${
            c.interno ? "border border-dashed border-amber-500/40 bg-amber-500/5" : "db-soft"
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-medium text-white">{etiquetaAutor(c.autor)}</span>
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
            <span className="ml-auto text-xs text-white/40">
              {fechaCorta.format(new Date(c.creado_en))}
            </span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-white/80">{c.cuerpo}</p>
        </div>
      ))}

      {!usuarioId ? (
        <p className="text-sm text-white/45">
          <Link to="/login" className="font-medium text-white underline">
            Ingresá con tu correo
          </Link>{" "}
          para comentar.
        </p>
      ) : (
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
            className="db-soft w-full resize-y rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3">
            {esDB ? (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-white/45">
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
              className="rounded-xl bg-white px-4 py-1.5 text-sm font-semibold text-[#06070B] transition hover:bg-white/90 disabled:opacity-40"
            >
              {enviar.isPending ? "Enviando…" : "Comentar"}
            </button>
          </div>
          {enviar.isError && (
            <p className="text-xs text-red-400">No se pudo enviar. Probá de nuevo.</p>
          )}
        </form>
      )}
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
  usuarioId: string | null;
  esDAC: boolean;
  esDB: boolean;
}) {
  const queryClient = useQueryClient();
  const [abierta, setAbierta] = useState(false);
  const estado: Estado = f.validaciones?.estado ?? "pendiente";
  const requisitos = (f.detalle ?? "").split("\n").filter(Boolean);
  const meses = mesesDe(f.mes_objetivo);

  const mutarEstado = useMutation({
    mutationFn: (nuevo: Estado) => {
      if (!usuarioId) return Promise.reject(new Error("Ingresá para validar."));
      return cambiarEstado(f.id, nuevo, usuarioId);
    },
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
    <article className="db-glass overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="db-eyebrow" style={{ color }}>
            {f.codigo}
            {meses.length > 1 && (
              <span className="ml-2 normal-case tracking-normal text-white/35">
                continúa en mes {meses[meses.length - 1]}
              </span>
            )}
          </p>
          <h3 className="mt-1.5 text-[16px] font-semibold leading-snug tracking-tight text-white">
            {f.titulo}
          </h3>
        </div>
        <PildoraEstado estado={estado} />
      </div>

      <ul className="mt-3.5 space-y-1.5">
        {requisitos.map((r, i) => (
          <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/60">
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
                    : { color: "rgba(255,255,255,.45)", borderColor: "rgba(255,255,255,.12)" }
                }
              >
                {ESTADOS[e].etiqueta}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/40">
            {esDB ? (
              "La validación la hace el equipo de DAC."
            ) : (
              <>
                Para validar,{" "}
                <Link to="/login" className="font-medium text-white underline">
                  ingresá con tu correo
                </Link>
                .
              </>
            )}
          </p>
        )}

        <button
          type="button"
          onClick={() => setAbierta(!abierta)}
          className="db-eyebrow text-white/40 transition hover:text-white"
        >
          Comentarios ({f.comentarios.length})
        </button>
      </div>

      {mutarEstado.isError && (
        <p className="mt-2 text-xs text-red-400">
          {mutarEstado.error instanceof Error
            ? mutarEstado.error.message
            : "No se pudo guardar el cambio."}
        </p>
      )}

      {abierta && <HiloComentarios funcionalidad={f} usuarioId={usuarioId} esDB={esDB} />}
    </article>
  );
}

function DetalleProyecto() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: perfil, isPending: cargandoPerfil } = usePerfil();

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

  /** La página se organiza cronológicamente: cada funcionalidad cuelga de su mes de inicio. */
  const grupos = useMemo(() => {
    const por = new Map<number, FuncionalidadConEstado[]>();
    for (const f of visibles) {
      const clave = mesesDe(f.mes_objetivo)[0] ?? SIN_MES;
      const lista = por.get(clave) ?? [];
      lista.push(f);
      por.set(clave, lista);
    }
    return por;
  }, [visibles]);

  if (proyecto.isPending || cargandoPerfil) {
    return (
      <main className="db-z mx-auto max-w-3xl px-5 py-24 text-sm text-white/45">Cargando…</main>
    );
  }
  if (proyecto.isError) {
    return (
      <main className="db-z mx-auto max-w-3xl px-5 py-24">
        <p className="text-sm text-red-400">No encontramos ese proyecto.</p>
        <Link to="/proyectos" className="mt-3 inline-block text-sm text-white underline">
          Volver a proyectos
        </Link>
      </main>
    );
  }

  const p = proyecto.data;
  const todas = funcionalidades.data ?? [];
  const conteo = { pendiente: 0, validado: 0, con_cambios: 0, no_va: 0 } as Record<Estado, number>;
  for (const f of todas) conteo[f.validaciones?.estado ?? "pendiente"] += 1;
  const esDAC = perfil?.lado === "dac";
  const esDB = perfil?.lado === "digital_builders";
  const usuarioId = perfil?.id ?? null;

  const ordenGrupos = [SIN_MES, 1, 2, 3, 4, 5, 6].filter((m) => grupos.has(m));

  return (
    <main className="db-z mx-auto w-full max-w-3xl px-5 pb-24 pt-8 sm:pt-12">
      <Link to="/proyectos" className="db-eyebrow text-white/40 transition hover:text-white">
        ← Todos los proyectos
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="db-eyebrow" style={{ color: p.color }}>
          Validación de alcance
        </span>
        <span className="h-px w-8 bg-white/15" />
        <span className="db-eyebrow text-white/35">{p.bajada}</span>
      </div>
      <h1 className="db-display db-grad mt-3 text-[clamp(2.4rem,9vw,4rem)]">{p.nombre}</h1>

      <div className="db-glass mt-7 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-white">
            {conteo.validado}/{todas.length} funcionalidades validadas
          </p>
          <p className="db-eyebrow text-white/30">Se actualiza en vivo</p>
        </div>
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
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
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
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
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filtro === e
                  ? "border-white/50 bg-white/10 text-white"
                  : "border-white/10 text-white/45 hover:text-white"
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
          className="db-soft w-full rounded-2xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none sm:w-48"
        />
      </div>

      {/* Línea de tiempo: el proyecto mes a mes, como el roadmap de la propuesta */}
      <ol className="relative mt-10">
        <div
          className="absolute bottom-4 left-[15px] top-2 w-px"
          style={{
            background: `linear-gradient(to bottom, ${p.color}80, ${p.color}22, transparent)`,
          }}
        />
        {funcionalidades.isPending && (
          <p className="pl-11 text-sm text-white/45">Cargando funcionalidades…</p>
        )}

        {ordenGrupos.map((m) => {
          const lista = grupos.get(m)!;
          const validadas = lista.filter(
            (f) => (f.validaciones?.estado ?? "pendiente") === "validado",
          ).length;
          const titulo =
            m === SIN_MES ? "Transversal" : (MESES.find((x) => x.n === m)?.titulo ?? "");
          return (
            <li key={m} className="relative pb-10 pl-11 last:pb-0">
              <span
                className="absolute left-0 top-0 grid h-[31px] w-[31px] place-items-center rounded-full border bg-[#06070B]"
                style={{ borderColor: `${p.color}66` }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              </span>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="db-eyebrow text-white/35">
                  {m === SIN_MES ? "Todo el proyecto" : `Mes 0${m}`}
                </p>
                <h2 className="text-[19px] font-semibold tracking-tight text-white">{titulo}</h2>
                <span className="db-eyebrow ml-auto text-white/30">
                  {validadas}/{lista.length} validadas
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {lista.map((f) => (
                  <TarjetaFuncionalidad
                    key={f.id}
                    f={f}
                    color={p.color}
                    usuarioId={usuarioId}
                    esDAC={esDAC}
                    esDB={esDB}
                  />
                ))}
              </div>
            </li>
          );
        })}

        {!funcionalidades.isPending && !ordenGrupos.length && (
          <p className="db-soft rounded-3xl p-6 text-center text-sm text-white/45">
            Ninguna funcionalidad coincide con el filtro.
          </p>
        )}
      </ol>
    </main>
  );
}
