# PROMPT PARA CLAUDE CODE — Actualizar propuesta web + portal a la versión final (setiembre 2026)

> Pegá este archivo completo como primer mensaje en Claude Code, parado en la raíz del repo
> `propuesta-comercial-digital-builders`. Antes de pegarlo, copiá en `docs/` los 4 archivos
> que se indican en la sección 0. Trabajá en una rama nueva `actualizacion-v3` y hacé commits
> pequeños por sección; al final, merge a `main` con fast-forward (NUNCA reescribir historia).

---

## 0 · CONTEXTO Y FUENTES DE VERDAD

Leé primero `docs/proyecto-master-prompt.md` completo: describe la arquitectura del repo, el
reparto de territorio (la propuesta estática se mantiene a mano; `src/` es la app), la capa de
movimiento de la propuesta, cómo regenerar el Tailwind incrustado, los errores ya pagados y el
estándar de verificación. Todo eso sigue vigente. Este prompt lo actualiza en CONTENIDO y
NÚMEROS, no en arquitectura ni en estética.

Fuentes de verdad del contenido nuevo (en `docs/`, copiadas por el dueño):

1. `docs/DAC_propuesta_2026_v3.pdf` — la propuesta comercial FINAL (15 págs, 10 secciones).
2. `docs/DAC_anexo1_desglose_funcional.pdf` — Anexo I, alcance taxativo (21 págs, 48 bloques).
3. `docs/gen_propuesta_v3.py` — script generador de (1). **Todos los textos finales están ahí
   como strings Python.** Usalo como fuente exacta de cada frase; no reescribas ni "mejores"
   el contenido.
4. `docs/gen_anexo1.py` — script generador de (2). Cada llamada `F(codigo, titulo, [bullets],
   rel=..., tag=...)` es una funcionalidad con sus requisitos. Es la fuente para recargar el
   portal.

Regla de oro: **el contenido de la web debe coincidir palabra por palabra con los PDFs**. Si
encontrás una contradicción entre este prompt y los scripts, ganan los scripts.

Lo que CAMBIÓ respecto de lo que hay en el repo (resumen para que entiendas la magnitud):

| Tema | En el repo hoy (viejo) | Versión final |
|---|---|---|
| Desarrollo | USD 35.500 + IVA, 6 pagos de 5.916,67 | **USD 32.500 + IVA, 6 cuotas mensuales de 5.417** (1ª al inicio, siguientes cada 30 días; NO condicionadas a entrega) |
| Mantenimiento | 225/sistema, 900 las 4, "Crítica 24/7" | **Servicio mensual USD 2.000 + IVA = 1.500 mantenimiento integral + 500 operación IA** (dos líneas separadas) |
| IA | no existe | **Dos módulos de IA de uso interno** (asistente Intranet + lectura de CV en Sumate), implementación incluida sin costo al contratar la operación IA por 12 meses; primer mes de IA bonificado |
| Bolsa evolutiva | no existe / "no prometer bolsa de horas" | **Opcional: USD 400 + IVA/mes, 10 hs** |
| Mes 6 | "Colchón, sin costo adicional" | **"Estabilización"** — 6 meses de proyecto: 5 desarrollo + 1 estabilización, pruebas de aceptación finales y salida |
| Validez | 30 días, hasta 22/09/2026 | **60 días** desde la fecha de envío (dejar la fecha como variable fácil de editar) |
| Métrica "~1.000 hs estimadas" | pública en el hero/resumen | **ELIMINAR. Las horas jamás se muestran al cliente.** |
| Alcance | 48 funcionalidades viejas del pliego | Anexo I nuevo: 48 bloques actualizados con las respuestas del relevamiento de DAC (Fiserv, factura por sistema de encomiendas, link a Saico, abonos solo marcado, módulo de solicitudes y calendario, hoteles versión inicial, IA) |
| Supuestos / dependencias | no existe | Sección nueva con 8 supuestos (ver script) |
| Portal de validación | pensado para que DAC valide antes de adjudicar | **Se reposiciona como herramienta de aceptación por módulo DURANTE el proyecto**; antes de la firma solo se muestra en modo lectura |

---

## 1 · PIEZA A — PROPUESTA WEB (`public/propuesta/index.html`)

Editar A MANO el HTML (no Lovable, no migrar a React, no dividir). Mantener intacta la capa de
movimiento, la estética dark, el overlay de clave `DAC2026`, el menú móvil y todo lo descripto
en el master prompt. Si agregás clases Tailwind nuevas, seguir el procedimiento 2.5 del master
prompt para regenerar el CSS incrustado (Tailwind v3 CLI, `--minify`, mismo comentario marcador).

### 1.1 Reglas de tono (aplican a TODO el texto nuevo)
- Español rioplatense, "ustedes" para DAC.
- **Prohibido** mencionar al proveedor anterior, el proyecto fallido, "esta vez", "a diferencia
  de otros", o cualquier comparación con competidores. Si encontrás texto así en el HTML actual
  (por ejemplo en la cinta de "promesas" o en metodología), eliminarlo.
- **Prohibido** describir cómo trabaja DAC hoy ("tres personas ocupadas", "nadie lee las
  encuestas", etc.). Se describe qué hace el sistema, no la operación interna del cliente.
- Sin siglas técnicas hacia el cliente: no "UAT" (→ "pruebas de aceptación"), no "QA"
  (→ "control de calidad"), no "CI", no "UI", no "SEO/UX" (→ "posicionamiento en buscadores y
  experiencia de usuario"), no "CPI" (→ "inflación de EE.UU."), no "pentest" ni "prueba de
  penetración" (→ "auditoría de seguridad por terceros").
- Placeholders `[PENDIENTE: …]`: hay 12. Todos se reemplazan con texto real (abajo). Al
  terminar no debe quedar NINGÚN `[PENDIENTE` en el archivo, salvo las 4 maquetas panorámicas
  (ver 1.4).

### 1.2 Hero `#inicio`
- Eyebrow: "Propuesta de desarrollo · Setiembre 2026" (sacar "Documento confidencial" si está).
- H1 se mantiene: "Propuesta Técnica y Comercial". Subtítulo: "Proyecto Sitios Web 2027".
- 4 chips de proyecto: se mantienen con sus colores.
- Bloque "Preparada por Digital Builders" se mantiene.
- CTA "Ver la propuesta" se mantiene.

### 1.3 Resumen ejecutivo `#resumen`
- Reemplazar los 3 `[PENDIENTE]` por los DOS párrafos exactos de la sección
  "1. RESUMEN EJECUTIVO" en `gen_propuesta_v3.py` (empiezan "Proponemos el desarrollo
  integral…" y "Esta propuesta no parte del pliego solamente…"). Si el layout pide tres
  bloques, el tercero es el recuadro "Tres definiciones que estructuran esta propuesta" con sus
  3 viñetas exactas.
- Tarjetas métricas: reemplazar las 4 actuales por: **4 plataformas · 6 meses de proyecto ·
  Entregables validados cada 30 días · 2 módulos de IA incluidos**. ELIMINAR "~1.000 hs
  estimadas" y "228 requisitos relevados" (los números de requisitos cambiaron; no
  reintroducir contadores de horas bajo ningún nombre).
- Agregar debajo la **tabla de inversión resumida** (4 filas exactas del script: Desarrollo
  32.500 / Mantenimiento integral 1.500 / Operación de módulos IA 500 / Bolsa evolutiva 400
  opcional, con sus modalidades). En mobile, tarjetas apiladas.

### 1.4 Los 4 proyectos `#proyectos`
- Reemplazar las 4 descripciones `[PENDIENTE]` con un párrafo por proyecto construido
  EXCLUSIVAMENTE con el contenido de la sección "2. ALCANCE POR PROYECTO" del script (tomar la
  primera fila "Institucional + CMS" / "Portal del postulante" / "Comunicados" y resumir las
  demás filas en una frase; máximo 60 palabras por proyecto; sin agregar promesas que no estén
  en el PDF).
- El acordeón "Ver funcionalidades" de cada proyecto pasa a listar los bloques del **Anexo I
  nuevo** (códigos D.x, G.x, S.x, I.x y los T.x en un quinto bloque "Base transversal"), con
  título y, en vez del conteo de requisitos, la marca del bloque: INCLUIDO / SUJETO A SERVICIO
  DE TERCEROS / VERSIÓN INICIAL (colores: verde #10B981 / ámbar #F5A524 / azul #3B82F6). Sacar
  "Mes objetivo" del acordeón (el cronograma detallado no se publica).
- Botón "Abrir detalle y validar" → renombrar **"Ver el detalle en el portal"** y apuntar a
  `/proyectos/{slug}` como hasta ahora (modo lectura).
- Los 4 `[PENDIENTE: maqueta panoramica]` se dejan como están (placeholder SVG) — las
  maquetas las provee el dueño después. No inventar imágenes.
- Agregar en esta sección un botón secundario **"Descargar Anexo I — Desglose funcional
  (PDF)"** → `/docs/DAC_anexo1_desglose_funcional.pdf` (copiar el PDF a
  `public/docs/`). Y en el hero o en el cierre, **"Descargar la propuesta (PDF)"** →
  `/docs/DAC_propuesta_2026_v3.pdf`. Ambos con `download`.

### 1.5 Inteligencia aplicada `#ia` (SECCIÓN NUEVA, entre proyectos y metodología)
- Título: "Inteligencia aplicada — dos módulos que devuelven horas". Intro exacta del script.
- Dos tarjetas glass: "A — La Intranet que responde" y "B — El portal de empleo que lee los
  CV", cada una con sus tres párrafos exactos del script (Qué hace / Cómo funciona / El
  resultado). Acento: usar el color transversal #10B981 o el celeste del logo #8FCCF0.
- Debajo, la tabla de 4 filas del script (Qué incluye la operación IA / Implementación /
  Límites claros / Primer mes) como mini-cards.
- Agregar al menú fijo y al menú móvil el ancla `#ia` (el menú móvil numera 01-07; pasará a
  01-09 con las secciones nuevas; mantener el patrón de numeración y acentos).

### 1.6 Cómo trabajamos `#metodologia`
- Título: "Metodología de trabajo — avance que se ve, se prueba y se firma". Intro exacta del
  script (empieza "En un proyecto de cuatro plataformas en paralelo…"). ELIMINAR cualquier
  frase actual del tipo "para que no se repita la historia" o comparativa.
- Flujo de 4 pasos exacto: Construimos → Lo mostramos → DAC lo prueba → Se firma.
- Las 3 tarjetas actuales se reemplazan por 4, con los textos exactos del script:
  "Avance validado cada mes" · "Validaciones quincenales" · "Testing en 3 capas" ·
  "Alcance escrito". No hay tarjeta "Pagos contra avance" ni ejemplo del arquitecto.
- Los badges de seguridad de esta sección se mueven a la sección Seguridad (1.8).

### 1.7 Roadmap `#roadmap`
- Título: "Cronograma tentativo — los cuatro sitios en paralelo". Intro exacta del script
  (termina "Este cronograma queda sujeto a la validación de DAC.").
- Titulares de los 6 meses, EXACTOS: **Mes 01 Cimientos · Mes 02 Toma forma · Mes 03 Se
  opera · Mes 04 Transaccional · Mes 05 Cierre · Mes 06 Estabilización**. El mes 6 deja de
  estar atenuado/punteado y NO dice "sin costo adicional".
- Contenido por mes y por carril: tomar la matriz `cr` del script (5 carriles: DAC, GA,
  Sumate, Intranet, Transversal × 6 meses) tal cual.
- Las píldoras de ENTREGABLE por mes se reescriben coherentes con esa matriz (una frase por
  mes, sin inventar módulos que no estén en la matriz). Eliminar las píldoras viejas
  ("staging + design system", "DAC aprobado", etc.).
- Nota al pie exacta del script (asterisco sobre servicios en desarrollo por terceros).
- Recuadro "Compromisos del cronograma" exacto del script.

### 1.8 Seguridad `#seguridad` (SECCIÓN NUEVA, después del roadmap)
- Título: "Seguridad y protección de datos". Intro exacta del script.
- Las 7 filas de la tabla del script como tarjetas (Mínima custodia · Permisos a nivel de dato
  · Accesos y credenciales · Operación defensiva · Resguardo · Módulos de IA · Verificación
  externa), textos exactos. Sumar acá los badges que estaban en metodología (Ley 18.331, etc.)
  sin duplicar.

### 1.9 Mantenimiento → **Servicio mensual** `#mantenimiento`
Reescribir la sección completa:
- Título: "Servicio mensual — USD 2.000 + IVA". Subtítulo: "Dos componentes, contratables por
  separado".
- Card 1 **Mantenimiento integral — USD 1.500/mes**: viñetas exactas de la fila
  "Mantenimiento integral" del script (monitoreo permanente · pruebas funcionales semanales de
  los flujos críticos · hasta 20 horas correctivas · niveles de respuesta · copias de seguridad
  verificadas · portal de tickets · informe mensual · revisión trimestral).
- Card 2 **Operación IA — USD 500/mes**: viñetas exactas de la fila "Operación IA".
- Tabla de niveles de respuesta, EXACTA: **Crítica (plataforma caída o pagos sin funcionar):
  < 2 h, días hábiles 8 a 20 h, con guardia para caídas totales fines de semana y feriados de
  9 a 18 h · Alta: < 8 h hábiles · Normal: < 24 h hábiles**. ELIMINAR el badge "Crítica 24/7"
  y cualquier "todos los días".
- Condiciones (texto exacto): "Inicia con la puesta en producción · primer mes de la operación
  IA bonificado · plazo mínimo 12 meses · preaviso de 90 días · ajuste anual según inflación de
  EE.UU. · la componente IA puede contratarse, pausarse o darse de baja en forma independiente
  del mantenimiento".
- Card **Opcional — Bolsa evolutiva USD 400 + IVA/mes** con el párrafo exacto del script.
- ELIMINAR: "USD 225 por sistema", "900/mes", la grilla de 7 compromisos y la tarjeta "Portal
  de soporte integrado" (el portal de tickets queda como viñeta, no como bloque).

### 1.10 Inversión `#inversion`
- Número grande **USD 32.500** + "más IVA".
- Mini-stats: 4 plataformas · 6 meses · 6 cuotas · 2 módulos IA incluidos (sacar "0 costos
  ocultos").
- Cronograma de pagos: **6 cuotas mensuales de USD 5.417 + IVA: la primera al inicio del
  proyecto y las siguientes cada 30 días.** SIN condicionarlas a entregables ("se libera contra
  entregable validado" se ELIMINA). Presentar como 6 tarjetas: "Inicio" + "Mes 2"… "Mes 6".
- Fila "Implementación de los módulos de IA (Intranet + Sumate): incluida sin costo al
  contratar la operación IA por el plazo mínimo de 12 meses. De no contratarse, los módulos
  quedan desactivados".
- NO mostrar referencia a la propuesta 2025 ni a ningún precio anterior.

### 1.11 Supuestos y dependencias `#supuestos` (SECCIÓN NUEVA, antes del cierre)
- Título: "Supuestos y dependencias del plan". Intro exacta del script.
- Los 8 supuestos exactos del script, como lista numerada con el título en negrita (Servicios
  de terceros en desarrollo · Pruebas del sistema de pasajes · Pasarela de pagos · Contenidos ·
  Migraciones · Infraestructura y servicios · Definiciones tomadas del relevamiento · Reserva
  de hoteles). Estilo sobrio, sin animación llamativa: es texto contractual.

### 1.12 Equipo (puede ir dentro de metodología o como bloque corto)
- Dos filas exactas del script: "Santiago Bouvier — líder técnico y único interlocutor" y
  "Por parte de DAC" (con Mario Secchi y Sebastián Ciapessoni nombrados). NO existe "desarrollo
  de apoyo" ni ningún otro nombre de equipo.
- Párrafo de Digital Builders exacto del script.

### 1.13 Cierre `#cierre`
- Reemplazar `[PENDIENTE: párrafo de compromiso]` por: "Gracias por la confianza y por la
  calidad del relevamiento. Quedamos a disposición para presentar esta propuesta
  personalmente."
- Tabla "Próximos pasos" con las 3 filas exactas del script (Validación / Adjudicación y firma
  / Inicio — "Con la firma se emite la primera cuota").
- Validez: "Válida por 60 días desde su envío" + fecha en una constante JS/atributo `data-validez`
  fácil de editar (dejar `[FECHA DE ENVÍO]` como valor inicial, visible en gris para que el
  dueño la complete antes de publicar — es el ÚNICO placeholder permitido además de las
  maquetas).
- Mantener la línea "Esta propuesta fue construida con las mismas tecnologías y estándares que
  proponemos para sus sitios." y el mailto.
- Agregar botones de descarga de los dos PDFs si no están en el hero.

### 1.14 Menú y navegación
- Secciones finales en orden y con ancla: 01 Inicio · 02 Resumen · 03 Proyectos · 04
  Inteligencia aplicada · 05 Metodología · 06 Cronograma · 07 Seguridad · 08 Servicio mensual ·
  09 Inversión · 10 Supuestos · 11 Cierre. Actualizar scroll-spy, índice lateral y menú móvil
  (acentos por sección: mantener el criterio existente; a las nuevas asignar #10B981 o #8FCCF0).
- Cintas cinéticas: si alguna contiene promesas comparativas o el texto de "228 requisitos",
  reemplazar por: "4 plataformas · 6 meses · Entregas cada 30 días · IA aplicada · Alcance
  escrito".

---

## 2 · PIEZA C — PORTAL DE VALIDACIÓN (`src/` + Supabase)

### 2.1 Reposicionamiento (solo textos y un flag)
- En `/proyectos` (índice): el H1 "Validación de alcance" se mantiene, pero el banner de modo
  lectura pasa a decir: "Este portal es la herramienta con la que validaremos cada módulo
  durante el proyecto. Hasta la firma del contrato se encuentra en modo lectura." Quitar el
  CTA a `/login` de ese banner (el login sigue existiendo por URL para los invitados).
- Agregar una constante `VALIDACION_ABIERTA = false` en `src/lib/portal.ts`. Mientras sea
  `false`, el selector de estado se muestra deshabilitado para TODOS (incluido lado `dac`)
  con la nota "La validación se habilita al inicio del proyecto". Los comentarios siguen
  funcionando para usuarios invitados. Cuando el dueño ponga `true`, vuelve el comportamiento
  actual (solo `dac` valida). No tocar RLS.
- Sacar de todas las pantallas cualquier referencia a "48 funcionalidades / 228 requisitos"
  hardcodeada; los conteos salen de la base.

### 2.2 Recarga de datos desde el Anexo I (migración nueva)
Crear `supabase/migrations/<timestamp>_alcance_anexo1_v3.sql`, idempotente, que:
1. Borre `comentarios`, `bitacora`, `validaciones`, `estimaciones` y `funcionalidades`
   (en ese orden; hoy no hay validaciones reales de DAC).
2. Reinserte las funcionalidades leyendo `docs/gen_anexo1.py`: cada `F(codigo, titulo,
   bullets, rel, tag)` → una fila con `codigo` (T.1, D.5, G.7, S.2, I.7, IA.1…), `titulo`,
   `detalle` = los bullets unidos con `\n` (un requisito por línea, sin la viñeta) y, si hay
   `rel`, una última línea `Definición del relevamiento: …`. Proyecto según prefijo: T→
   `transversal`, D→`dac`, G→`grupo-agencia`, S→`sumate`, I e IA→`intranet` (IA.2 pertenece a
   Sumate → `sumate`). Orden = orden de aparición.
3. Agregue columna `marca text` a `funcionalidades` (valores: `incluido` | `terceros` |
   `inicial` | `evolutivo`) tomada del `tag` (`inc`/`dep`/`ini`/`evo`), y actualice la UI para
   mostrarla como píldora junto al título, con los colores de 1.4.
4. `mes_objetivo`: asignar según la matriz del cronograma (sección 5 del script de la
   propuesta) con esta correspondencia mínima; lo que no encaje claramente va sin mes:
   - T.1–T.5 → "Mes 1"; T.6 → "Mes 6"; T.7 → "Mes 3".
   - D.1–D.4 → "Mes 2"; D.5, D.6, D.9, D.15 → "Mes 3"; D.7 → "Mes 2"; D.8, D.10–D.13 →
     "Mes 4"; D.14 → "Mes 5".
   - G.1–G.6 → "Mes 2"; G.7 → "Mes 3"; G.8, G.13 → "Mes 5"; G.9–G.12 → "Mes 4".
   - S.6 (relevamiento) → "Mes 1"; S.1–S.3 → "Mes 3"; S.4, S.5 → "Mes 4".
   - I.1 → "Mes 1"; I.2 → "Mes 2"; I.3, I.5, I.6, I.8, I.9, I.10 → "Mes 3"; I.7 → "Mes 4";
     I.4 → "Mes 5".
   - IA.1 → "Mes 5"; IA.2 → "Mes 3".
5. NO recargar `estimaciones` (las horas no van al portal; el dueño las tiene en su Excel).
6. Actualizar `MESES` en `src/lib/portal.ts` a los titulares nuevos:
   `[Cimientos, Toma forma, Se opera, Transaccional, Cierre, Estabilización]`.
7. Actualizar `proyectos.bajada`/`descripcion` con los mismos párrafos de 1.4.

Generá también un script `scripts/anexo_a_sql.py` (Python, sin dependencias) que produzca esa
migración a partir de `docs/gen_anexo1.py`, para que futuras versiones del anexo se recarguen
sin trabajo manual. Ejecutalo para generar la migración; no la escribas a mano.

### 2.3 Guía (`public/guia/index.html`)
- Título: "Cómo vamos a validar el alcance durante el proyecto". Subtítulo sin números
  hardcodeados. Agregar al inicio: "Hasta la firma, el portal está en modo lectura: pueden
  recorrerlo para conocer el alcance en detalle."
- Los 5 pasos se mantienen (adaptando "Marquen el estado" con "cuando la validación esté
  habilitada").

---

## 3 · VERIFICACIÓN (obligatoria antes de cada commit)
- Propuesta: abrir con Playwright + Chromium local, **offline** (abortar toda request que no
  sea `file:`), en 320/360/375/414/768/1024/1280/1440/1920 px: cero desborde horizontal, cero
  `pageerror`, `prefers-reduced-motion` neutraliza todo, scroll-spy funciona con las 11
  secciones, menú móvil abre/cierra y lista las 11.
- `grep -n "35.500\|5.916\|USD 225\|900 / mes\|22 de setiembre\|Colchón\|sin costo adicional\|hs estimadas\|228 requisitos\|UAT\|QA\|pentest\|penetración\|CPI\|\[PENDIENTE" public/propuesta/index.html` debe devolver SOLO las 4 maquetas y el `[FECHA DE ENVÍO]`.
- Portal: `tsc` y `eslint` en cero; probar `/proyectos` y `/proyectos/dac` con route-mocking de
  `**/rest/v1/**` usando fixtures generadas desde la migración nueva.
- Comparar visualmente la propuesta antes/después a 1440 px (screenshots en `docs/qa/`) para
  confirmar que la estética no cambió.

## 4 · GIT
- Rama `actualizacion-v3`, commits en español, uno por sección (1.3, 1.4, …, 2.2, 2.3).
- `git fetch` antes de cada push. Nunca `--force`, nunca rebase de lo pusheado (Lovable
  sincroniza `main`).
- Al final: actualizar `docs/proyecto-master-prompt.md` (sección 2.3 secciones, 2.6 números,
  6 datos cargados, 7 decisiones: agregar "Números finales set-2026: 32.500 / 2.000 mensual
  (1.500 + 500 IA) / evolutiva 400 / 6 cuotas de 5.417 no condicionadas / validez 60 días /
  horas nunca públicas / portal en modo lectura hasta la firma").
- Reportar al dueño: lista de archivos tocados, qué quedó pendiente de él (fecha de envío,
  maquetas, correr la migración en el SQL Editor de Supabase, publicar desde Lovable) y
  cualquier decisión que hayas tenido que tomar por falta de dato.
