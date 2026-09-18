# -*- coding: utf-8 -*-
"""Genera la migración que recarga el portal desde el Anexo I.

Lee docs/gen_anexo1.py (el script que produce el PDF del Anexo I) y emite
supabase/migrations/<timestamp>_alcance_anexo1_v3.sql. Cada llamada
F(codigo, titulo, [bullets], rel=..., tag=...) del anexo se convierte en una
fila de public.funcionalidades; así el portal y el PDF no pueden divergir.

Uso:  python3 scripts/anexo_a_sql.py [timestamp]
      (sin argumento usa el timestamp fijo 20260918190000, para que
       regenerar no duplique migraciones)

Sin dependencias: solo biblioteca estándar. Las horas y estimaciones no se
tocan: nunca van al portal.
"""

import ast
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ANEXO = RAIZ / "docs" / "gen_anexo1.py"

# Proyecto según el prefijo del código. IA.2 (lectura de CV) vive en Sumate.
PROYECTO_POR_PREFIJO = {"T": "transversal", "D": "dac", "G": "grupo-agencia",
                        "S": "sumate", "I": "intranet", "IA": "intranet"}
PROYECTO_EXCEPCION = {"IA.2": "sumate"}

MARCA_POR_TAG = {"inc": "incluido", "dep": "terceros", "ini": "inicial", "evo": "evolutivo"}

# Mes objetivo según la matriz del cronograma de la propuesta (sección 5).
# Lo que no figura acá queda sin mes.
MES = {}
def _rango(prefijo, desde, hasta, mes):
    for n in range(desde, hasta + 1):
        MES[f"{prefijo}.{n}"] = mes
_rango("T", 1, 5, "Mes 1"); MES["T.6"] = "Mes 6"; MES["T.7"] = "Mes 3"
_rango("D", 1, 4, "Mes 2")
for c in ("D.5", "D.6", "D.9", "D.15"): MES[c] = "Mes 3"
MES["D.7"] = "Mes 2"
for c in ("D.8", "D.10", "D.11", "D.12", "D.13"): MES[c] = "Mes 4"
MES["D.14"] = "Mes 5"
_rango("G", 1, 6, "Mes 2"); MES["G.7"] = "Mes 3"
MES["G.8"] = MES["G.13"] = "Mes 5"
_rango("G", 9, 12, "Mes 4")
MES["S.6"] = "Mes 1"; _rango("S", 1, 3, "Mes 3"); MES["S.4"] = MES["S.5"] = "Mes 4"
MES["I.1"] = "Mes 1"; MES["I.2"] = "Mes 2"
for c in ("I.3", "I.5", "I.6", "I.8", "I.9", "I.10"): MES[c] = "Mes 3"
MES["I.7"] = "Mes 4"; MES["I.4"] = "Mes 5"
MES["IA.1"] = "Mes 5"; MES["IA.2"] = "Mes 3"

# bajada corta + descripción (los mismos párrafos de la propuesta, sección 1.4)
PROYECTOS = {
    "dac": (
        "Encomiendas y servicios logísticos",
        "Sitio público de encomiendas: institucional con todo el contenido autogestionable "
        "por DAC, despacho web completo con factura emitida por el sistema de encomiendas y "
        "etiqueta lista para imprimir, rastreo público y reclamos, cuenta cliente con historial, "
        "indicadores corporativos, carga masiva y pago vía Fiserv, y simulador de tarifas contra "
        "el servicio de costos existente."),
    "grupo-agencia": (
        "Venta de pasajes",
        "Sitio público de pasajes: institucional con horarios y destinos, compra en línea "
        "completa con pago vía Fiserv y compra rápida como invitado, cuenta cliente con cambio "
        "de fecha, recompra y carné de estudiante, vales a bordo y cupones OCA e Itaú, y reserva "
        "de hoteles en versión inicial administrada desde el panel del sitio."),
    "sumate": (
        "Trabajá con nosotros",
        "Portal del postulante con formulario multi-paso, guardado automático y carga de CV con "
        "lectura automática que precompleta los datos, más el backoffice de RRHH: publicación de "
        "vacantes, búsqueda y filtros, notificaciones de cambio de estado, depuración automática "
        "al año y migración de la base actual incluida."),
    "intranet": (
        "Portal de colaboradores",
        "Portal de colaboradores para más de 1.000 usuarios: comunicados por grupos con "
        "confirmación y auditoría de lectura, manuales buscables, recibos y beneficios, vida "
        "interna, el módulo de solicitudes y calendario interno relevado con el equipo, y "
        "administración de usuarios, grupos, etiquetas y métricas de uso."),
    "transversal": (
        "Aplica a los 4 sitios",
        "La infraestructura común de las cuatro plataformas: requisitos generales del pliego, "
        "arquitectura y entornos, autenticación, seguridad transversal, panel de administración "
        "unificado, control de calidad y puesta en producción, y posicionamiento en buscadores "
        "para los sitios DAC y GA."),
}


def extraer_funcionalidades():
    """Cada F(codigo, titulo, [bullets], rel=?, tag=?) del anexo, en orden."""
    arbol = ast.parse(ANEXO.read_text(encoding="utf-8"))
    filas = []
    for nodo in ast.walk(arbol):
        if not (isinstance(nodo, ast.Call) and isinstance(nodo.func, ast.Name)
                and nodo.func.id == "F"):
            continue
        codigo = ast.literal_eval(nodo.args[0])
        titulo = ast.literal_eval(nodo.args[1])
        bullets = ast.literal_eval(nodo.args[2])
        rel, tag = None, "inc"
        for kw in nodo.keywords:
            if kw.arg == "rel":
                rel = ast.literal_eval(kw.value)
            elif kw.arg == "tag":
                tag = ast.literal_eval(kw.value)
        filas.append((codigo, titulo, bullets, rel, tag))
    return filas


def sql_str(texto):
    return "'" + texto.replace("'", "''") + "'"


def generar(timestamp):
    filas = extraer_funcionalidades()
    assert filas, "no se encontraron llamadas F() en el anexo"

    partes = ["""-- ═══════════════════════════════════════════════════════════════════════════
-- Alcance v3: el portal se recarga con los bloques del Anexo I (set-2026).
--
-- GENERADO por scripts/anexo_a_sql.py a partir de docs/gen_anexo1.py.
-- No editar a mano: ante una nueva versión del anexo, volver a correr el
-- script. Idempotente: puede ejecutarse más de una vez sin duplicar nada.
--
-- No recarga estimaciones: las horas no van al portal.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Marca del bloque (incluido / terceros / inicial / evolutivo) ────────────
ALTER TABLE public.funcionalidades ADD COLUMN IF NOT EXISTS marca text;

-- ── Borrado del alcance anterior (hoy no hay validaciones reales de DAC) ────
DELETE FROM public.comentarios;
DELETE FROM public.bitacora;
DELETE FROM public.validaciones;
DELETE FROM public.estimaciones;
DELETE FROM public.funcionalidades;

-- ── Bajadas y descripciones alineadas con la propuesta ──────────────────────"""]

    for slug, (bajada, descripcion) in PROYECTOS.items():
        partes.append(
            f"UPDATE public.proyectos SET bajada = {sql_str(bajada)},\n"
            f"  descripcion = {sql_str(descripcion)}\n"
            f"  WHERE slug = {sql_str(slug)};")

    partes.append("\n-- ── Los bloques del Anexo I ─────────────────────────────────────────────────")

    for orden, (codigo, titulo, bullets, rel, tag) in enumerate(filas, start=1):
        slug = PROYECTO_EXCEPCION.get(codigo) or PROYECTO_POR_PREFIJO[codigo.split(".")[0]]
        lineas = list(bullets)
        if rel:
            lineas.append("Definición del relevamiento: " + rel)
        detalle = "\n".join(lineas)
        mes = MES.get(codigo)
        mes_sql = sql_str(mes) if mes else "NULL"
        partes.append(f"""
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, marca, mes_objetivo, orden)
SELECT id, {sql_str(codigo)}, {sql_str(titulo)}, {sql_str(detalle)}, {sql_str(MARCA_POR_TAG[tag])}, {mes_sql}, {orden}
  FROM public.proyectos WHERE slug = {sql_str(slug)}
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      marca = EXCLUDED.marca, mes_objetivo = EXCLUDED.mes_objetivo,
      orden = EXCLUDED.orden;""")

    destino = RAIZ / "supabase" / "migrations" / f"{timestamp}_alcance_anexo1_v3.sql"
    destino.write_text("\n".join(partes) + "\n", encoding="utf-8")

    conteo = {}
    for codigo, *_ in filas:
        slug = PROYECTO_EXCEPCION.get(codigo) or PROYECTO_POR_PREFIJO[codigo.split(".")[0]]
        conteo[slug] = conteo.get(slug, 0) + 1
    print(f"{destino.relative_to(RAIZ)}: {len(filas)} bloques -> {conteo}")


if __name__ == "__main__":
    generar(sys.argv[1] if len(sys.argv) > 1 else "20260918190000")
