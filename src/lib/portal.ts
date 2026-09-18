import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Estado = Database["public"]["Enums"]["estado_funcionalidad"];
export type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];
export type Validacion = Database["public"]["Tables"]["validaciones"]["Row"];

/**
 * Hasta la firma del contrato el portal es una vitrina del alcance: se lee,
 * se comenta, pero nadie marca estados (ni siquiera el lado dac). Al inicio
 * del proyecto se pone en `true` y vuelve el comportamiento normal, donde
 * la RLS sigue siendo la única protección real. No toca la base.
 */
export const VALIDACION_ABIERTA = false;

/** Marca del bloque según el Anexo I (columna `funcionalidades.marca`). */
export type Marca = "incluido" | "terceros" | "inicial" | "evolutivo";

export const MARCAS: Record<Marca, { etiqueta: string; color: string; fondo: string }> = {
  incluido: { etiqueta: "Incluido", color: "#10B981", fondo: "rgba(16,185,129,.12)" },
  terceros: {
    etiqueta: "Sujeto a servicio de terceros",
    color: "#F5A524",
    fondo: "rgba(245,165,36,.12)",
  },
  inicial: { etiqueta: "Versión inicial", color: "#3B82F6", fondo: "rgba(59,130,246,.12)" },
  evolutivo: { etiqueta: "Fase evolutiva", color: "#9CA3AF", fondo: "rgba(156,163,175,.12)" },
};

/** La columna `marca` es posterior a los tipos generados; se extiende acá. */
export type Funcionalidad = Database["public"]["Tables"]["funcionalidades"]["Row"] & {
  marca?: Marca | null;
};

export type Autor = {
  id: string;
  nombre: string | null;
  lado: Database["public"]["Enums"]["org_side"];
};

/** Nombre visible de un autor; sin nombre cae a la etiqueta de su lado. */
export function etiquetaAutor(autor: Autor | null): string {
  if (!autor) return "—";
  return autor.nombre?.trim() || (autor.lado === "dac" ? "Equipo DAC" : "Digital Builders");
}

export type Comentario = Database["public"]["Tables"]["comentarios"]["Row"] & {
  autor: Autor | null;
};

export type FuncionalidadConEstado = Funcionalidad & {
  validaciones: Validacion | null;
  comentarios: Comentario[];
};

/** Orden fijo y presentación de cada estado. */
export const ESTADOS: Record<Estado, { etiqueta: string; color: string; fondo: string }> = {
  pendiente: { etiqueta: "Pendiente", color: "#9CA3AF", fondo: "rgba(156,163,175,.12)" },
  validado: { etiqueta: "Validado", color: "#10B981", fondo: "rgba(16,185,129,.14)" },
  con_cambios: { etiqueta: "Con cambios", color: "#F5A524", fondo: "rgba(245,165,36,.14)" },
  no_va: { etiqueta: "No va", color: "#EF4444", fondo: "rgba(239,68,68,.14)" },
};

export const ORDEN_ESTADOS: Estado[] = ["pendiente", "validado", "con_cambios", "no_va"];

/** El mismo cronograma que la propuesta comercial: seis meses con sus titulares. */
export const MESES = [
  { n: 1, titulo: "Cimientos" },
  { n: 2, titulo: "Toma forma" },
  { n: 3, titulo: "Se opera" },
  { n: 4, titulo: "Transaccional" },
  { n: 5, titulo: "Cierre" },
  { n: 6, titulo: "Estabilización" },
] as const;

/** "Mes 2" -> [2] · "Meses 2-3" -> [2, 3] · null -> [] */
export function mesesDe(mesObjetivo: string | null): number[] {
  const m = mesObjetivo?.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!m) return [];
  const desde = Number(m[1]);
  const hasta = m[2] ? Number(m[2]) : desde;
  const out: number[] = [];
  for (let i = desde; i <= hasta; i++) out.push(i);
  return out;
}

export async function fetchProyectos(): Promise<Proyecto[]> {
  const { data, error } = await supabase.from("proyectos").select("*").order("orden");
  if (error) throw error;
  return data;
}

/** Conteo por estado de todas las funcionalidades, agrupado por proyecto. */
export async function fetchAvance(): Promise<Map<string, Record<Estado, number>>> {
  const { data, error } = await supabase
    .from("funcionalidades")
    .select("proyecto_id, validaciones(estado)");
  if (error) throw error;
  const out = new Map<string, Record<Estado, number>>();
  for (const f of data) {
    const acc =
      out.get(f.proyecto_id) ??
      ({ pendiente: 0, validado: 0, con_cambios: 0, no_va: 0 } as Record<Estado, number>);
    const estado: Estado = f.validaciones?.estado ?? "pendiente";
    acc[estado] += 1;
    out.set(f.proyecto_id, acc);
  }
  return out;
}

export async function fetchProyecto(slug: string): Promise<Proyecto> {
  const { data, error } = await supabase.from("proyectos").select("*").eq("slug", slug).single();
  if (error) throw error;
  return data;
}

export async function fetchFuncionalidades(proyectoId: string): Promise<FuncionalidadConEstado[]> {
  const [funcs, coms] = await Promise.all([
    supabase
      .from("funcionalidades")
      .select("*, validaciones(*)")
      .eq("proyecto_id", proyectoId)
      .order("orden"),
    supabase
      .from("comentarios")
      .select("*, autor:profiles(id, nombre, lado), funcionalidades!inner(proyecto_id)")
      .eq("funcionalidades.proyecto_id", proyectoId)
      .order("creado_en"),
  ]);
  if (funcs.error) throw funcs.error;
  if (coms.error) throw coms.error;

  const porFunc = new Map<string, Comentario[]>();
  for (const c of coms.data as unknown as Comentario[]) {
    const lista = porFunc.get(c.funcionalidad_id) ?? [];
    lista.push(c);
    porFunc.set(c.funcionalidad_id, lista);
  }
  return funcs.data.map((f) => ({
    ...f,
    validaciones: f.validaciones ?? null,
    comentarios: porFunc.get(f.id) ?? [],
  }));
}

/** Solo el lado `dac` pasa la política RLS; para otros el update devuelve 0 filas. */
export async function cambiarEstado(funcionalidadId: string, estado: Estado, usuarioId: string) {
  const { data, error } = await supabase
    .from("validaciones")
    .update({ estado, actualizado_por: usuarioId, actualizado_en: new Date().toISOString() })
    .eq("funcionalidad_id", funcionalidadId)
    .select();
  if (error) throw error;
  if (!data.length) throw new Error("La validación la hace el equipo de DAC.");
  return data[0];
}

export async function agregarComentario(args: {
  funcionalidadId: string;
  autorId: string;
  cuerpo: string;
  interno: boolean;
}) {
  const { error } = await supabase.from("comentarios").insert({
    funcionalidad_id: args.funcionalidadId,
    autor_id: args.autorId,
    cuerpo: args.cuerpo,
    interno: args.interno,
  });
  if (error) throw error;
}

/**
 * Cambios hechos por otros (estados y comentarios) llegan por Realtime; el
 * callback invalida las queries y la vista se refresca sin recargar.
 */
export function suscribirPortal(onCambio: () => void) {
  const canal = supabase
    .channel("portal-validacion")
    .on("postgres_changes", { event: "*", schema: "public", table: "validaciones" }, onCambio)
    .on("postgres_changes", { event: "*", schema: "public", table: "comentarios" }, onCambio)
    .subscribe();
  return () => {
    void supabase.removeChannel(canal);
  };
}
