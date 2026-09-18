# PROMPT MAESTRO — Propuesta y Portal de Validación · Digital Builders → DAC 2026

> Este documento es la especificación completa del proyecto, escrita para que un
> chat nuevo de IA (o una persona) pueda continuar el trabajo sin perder nada.
> Pegalo como primer mensaje y agregá tu pedido al final.
> Última actualización: 24/08/2026 · Todo lo descripto está construido y en `main`.

---

## 1 · QUIÉN Y QUÉ

Sos el desarrollador principal de **Digital Builders** (estudio de desarrollo web,
Uruguay, contacto `info@digitalbuilders.net`). El cliente es **DAC / Grupo Agencia**
(empresa grande de encomiendas y pasajes). Se le está vendiendo el desarrollo de
**4 plataformas web** por **USD 32.500 + IVA** (v3, set-2026) más un servicio
mensual de USD 2.000 + IVA, según el pliego oficial del 10/08/2026.

El repo es `santiagobouvier/digital-builders-hub` (GitHub, rama `main`), conectado a
**Lovable** (los pushes a main sincronizan con su editor; NUNCA reescribir historia
pusheada). Es una app **TanStack Start** (React 19, Vite, Tailwind v4, shadcn) con
**Supabase** (proyecto ref `ebjdkkchzvhcurbwvttc`; en `.env` solo hay project id,
URL y clave publicable — la service_role no existe en el repo ni debe pedirse).

**Reparto de territorio (regla dura):** `public/propuesta/index.html` y
`public/guia/index.html` se mantienen A MANO (nunca por Lovable). `src/` es la app;
hoy la mantiene este chat directamente — no mandar más prompts a Lovable para el
portal (los pasos 1–5 de `docs/prompts-lovable.md` ya están hechos; solo queda el 6).

Hay TRES piezas: (A) la propuesta estática, (B) la guía estática, (C) el portal de
validación con Supabase.

---

## 2 · PIEZA A — LA PROPUESTA (`public/propuesta/index.html`)

Sitio one-page **de un solo archivo, 100% autocontenido**: sin CDN, sin assets
externos. Tailwind v3 **compilado e incrustado** en un `<style>` marcado con el
comentario `Tailwind compilado e incrustado`. Google Fonts (Inter + JetBrains Mono)
se carga no-bloqueante con fallback al stack del sistema. `meta robots
noindex,nofollow`. Favicon SVG por data URI con el logo. Se sirve en
`/propuesta/index.html`; la ruta `/` de la app **redirige ahí**
(`src/routes/index.tsx`, `redirect({ href: "/propuesta/index.html" })`).

### 2.1 Acceso
Overlay inicial que tapa todo: clave **`DAC2026`** validada en JS (case-insensitive),
guardada en `sessionStorage` bajo la clave **`db_prop_access` = "1"** (el portal
comparte este mismo flag). Ojo de mostrar/ocultar clave, shake en error, mail de
contacto. Es cortina, no seguridad: la clave está en el fuente y se le dijo
explícitamente al dueño.

### 2.2 Identidad visual
- Fondo `#06070B` (ink), tarjetas glass (`backdrop-filter` solo ≥1024px), blobs
  aura con `radial-gradient`, grilla enmascarada, grano SVG.
- Acentos: DAC `#3B82F6` · Grupo Agencia `#F97316` · Sumate `#F5A524` · Intranet
  `#8B5CF6` · transversal/marca `#10B981`. Celeste del logo `#8FCCF0`.
- Tipos: Inter (display 800, tracking −0.04em) + JetBrains Mono para eyebrows
  (10px, tracking .24em, uppercase).
- **Logo**: recreado en CSS puro (`.logo-db`): marco blanco cuadrado, cuadrado
  blanco arriba-derecha (~36%), cuadrado celeste `#8FCCF0` abajo-izquierda (~40%).
  Aparece en: overlay de clave, nav, hero ("Preparada por"), pie, favicon.
- Español rioplatense (vos) en toda la UI.

### 2.3 Secciones (v3 set-2026 · menú fijo con anclas, scroll-spy, índice lateral de 11)
Orden: 01 Inicio · 02 Resumen · 03 Proyectos · 04 Inteligencia aplicada (`#ia`) ·
05 Metodología · 06 Cronograma (`#roadmap`) · 07 Seguridad (`#seguridad`) ·
08 Servicio mensual (`#mantenimiento`) · 09 Inversión · 10 Supuestos
(`#supuestos`) · 11 Cierre. El menú móvil numera 01-10 (sin Inicio). Los textos
salen PALABRA POR PALABRA de `docs/gen_propuesta_v3.py` (fuente exacta; los PDF
en `docs/` y `public/docs/`).

1. **Hero** `#inicio`: eyebrow "Propuesta de desarrollo · Setiembre 2026", H1
   "Propuesta Técnica y Comercial" + subtítulo "Proyecto Sitios Web 2027",
   4 chips, bloque "Preparada por", CTA "Ver la propuesta".
2. **Resumen** `#resumen`: 2 párrafos exactos (plazo 5-6 meses; relevamiento
   funcional de 100 puntos) + recuadro "Tres definiciones" + métricas
   **4 plataformas · 6 meses de proyecto · Entregables validados cada 30 días ·
   2 módulos de IA incluidos** + tabla de inversión resumida (32.500 / 1.500 /
   500 / 400 opcional). PROHIBIDO reintroducir horas o "228 requisitos".
3. **Proyectos** `#proyectos`: 5 tarjetas (los 4 sitios + Base transversal),
   descripciones definitivas, acordeones con los bloques del Anexo I (código +
   título + marca INCLUIDO verde / SUJETO A SERVICIO DE TERCEROS ámbar /
   VERSIÓN INICIAL azul; SIN mes objetivo), botón "Ver el detalle en el portal"
   → `/proyectos/{slug}`, maquetas `[PENDIENTE]` (las provee el dueño) y botón
   de descarga del Anexo I.
4. **Inteligencia aplicada** `#ia`: intro exacta + tarjetas "A — La Intranet que
   responde" y "B — El portal de empleo que lee los CV" (Qué hace / Cómo
   funciona / El resultado, exactos) + 4 mini-cards (qué incluye la operación,
   implementación, límites, primer mes bonificado). Acentos #8FCCF0 / #10B981.
5. **Metodología** `#metodologia`: flujo Construimos → Lo mostramos → DAC lo
   prueba → Se firma; 4 tarjetas exactas (Avance validado cada mes ·
   Validaciones quincenales · Testing en 3 capas · Alcance escrito); bloque de
   equipo (Santiago Bouvier único interlocutor · por DAC: Mario Secchi y
   Sebastián Ciapessoni) + párrafo de Digital Builders. Sin siglas hacia el
   cliente (no UAT/QA/CI/SEO-UX/CPI/pentest) y sin comparaciones con nadie.
6. **Cronograma** `#roadmap`: matriz exacta de 5 carriles (DAC/GA/Sumate/
   Intranet/Transversal) × 6 meses. Titulares: **Cimientos · Toma forma · Se
   opera · Transaccional · Cierre · Estabilización** (mes 6 con el mismo peso
   visual, sin "sin costo adicional"). Nota al pie de servicios de terceros y
   recuadro "Compromisos del cronograma", exactos.
7. **Seguridad** `#seguridad`: intro + 7 principios exactos (Mínima custodia ·
   Permisos a nivel de dato · Accesos y credenciales · Operación defensiva ·
   Resguardo · Módulos de IA · Verificación externa) + badges (Ley 18.331 etc.,
   movidos desde metodología).
8. **Servicio mensual** `#mantenimiento`: **USD 2.000 + IVA = Mantenimiento
   integral 1.500 + Operación IA 500**, dos cards con viñetas exactas; niveles
   de respuesta: **Crítica (plataforma caída o pagos sin funcionar) < 2 h, días
   hábiles 8-20 h, guardia fines de semana y feriados 9-18 h para caídas
   totales · Alta < 8 h hábiles · Normal < 24 h hábiles** (NO existe "Crítica
   24/7"); condiciones exactas (12 meses mínimos, preaviso 90 días, ajuste por
   inflación de EE.UU., IA independiente); card opcional Bolsa evolutiva 400.
9. **Inversión** `#inversion`: **USD 32.500 + IVA**; mini-stats 4/6/6/2; **6
   cuotas mensuales de USD 5.417 + IVA, la primera al inicio y las siguientes
   cada 30 días, NO condicionadas a entregables**; fila de implementación IA
   incluida al contratar la operación por 12 meses.
10. **Supuestos** `#supuestos`: los 8 supuestos exactos, lista numerada sobria.
11. **Cierre** `#cierre`: agradecimiento exacto, 3 próximos pasos ("Con la firma
    se emite la primera cuota"), **validez 60 días desde el envío** con la fecha
    en `#fecha-envio[data-validez]` (valor inicial `[FECHA DE ENVÍO]`, lo
    completa el dueño), botones de descarga de ambos PDF, línea de "mismas
    tecnologías" y mailto.

Placeholders permitidos que quedan: las 4 maquetas panorámicas y
`[FECHA DE ENVÍO]`. Nada más.

### 2.4 Capa de movimiento (JS vanilla, un solo bucle rAF)
- Titulares `data-split`: se parten en líneas reales (medidas por offsetTop tras
  limpiar `<br>`), cada línea sube desde máscara con delay escalonado; en
  `grad-text` el degradado se recrea POR LÍNEA con `--lt/--bh` medidos con rects
  relativos al titular (offsetTop apunta al offsetParent — bug conocido).
- Reveals con IntersectionObserver. ⚠ Bug aprendido: `clip-path: inset(0 0 100% 0)`
  da área 0 y el observer NUNCA dispara → el recorte `.wipe` va en el contenido
  interno y se observa el contenedor.
- Cintas cinéticas (2): proyectos y promesas, texto hollow, **Web Animations API**
  con px (compuestas); en desktop el scroll modula `playbackRate`.
- Parallax (hero + maquetas) SOLO desktop (`RICH = ≥1024px && pointer fine`).
- Roadmap: riel `scaleX/scaleY` por `--p`, puntos `.tl-dot` que se encienden.
- Índice lateral de secciones (≥1280px), spotlight que sigue el cursor, CTA
  magnético, barra de progreso superior con **`transform: scaleX`** (NUNCA width:
  width invalidaba layout — 226→56 layouts forzados).
- Optimización móvil (<1024px): `backdrop-filter` OFF (54→0), fondos glass
  pintados planos, blobs → radial-gradients, blur decorativo 38px máx,
  `will-change` solo en cintas (69→2), guardas en toggles de clase, bucle rAF se
  duerme sin trabajo. ~61 fps verificado.
- **Menú móvil**: pantalla completa que abre con **círculo clip-path desde el
  burger** (`circle(0) → circle(165%)` en `calc(100% - 42px) 46px`), burger 3
  líneas morfea a X, 7 links gigantes numerados 01-07 con acento por sección que
  entran en cascada (55ms/item), marca la sección activa (color + punto), marca de
  agua cinética hollow "DAC 2026 · Digital Builders" abajo, pie con mail. Cierra
  con X/Escape/link; bloquea scroll del fondo. El menú va **z-55, debajo del
  header** para que el burger real haga de X.
- TODO respeta `prefers-reduced-motion` (se neutraliza completo).
- Desktop nav: píldora que gana `.glass shadow-2xl` al scrollear (>24px), scroll-spy
  en links.

### 2.5 Cómo regenerar el Tailwind incrustado (si se tocan clases)
No hay build en el repo para esto. Procedimiento: (1) quitar el bloque `<style>`
que empieza con el comentario `Tailwind compilado e incrustado`; (2) correr
Tailwind **v3** CLI con config `content: [ese HTML]` y theme extend de colores
`ink #06070B, ink2 #0A0C13, dac, ga, sumate, intra, db` + fonts Inter/JetBrains
Mono, input `@tailwind base/components/utilities`, `--minify`; (3) volver a
incrustar el CSS con el mismo comentario marcador. Verificar SIEMPRE offline
(bloqueando toda red) a 320–1920px sin desborde horizontal.

---

## 3 · PIEZA B — LA GUÍA (`public/guia/index.html`)

Página estática autocontenida para mandarle a DAC junto a la invitación.
Misma estética (CSS artesanal, sin Tailwind). Contenido: título "Cómo vamos a
validar el alcance durante el proyecto", sub sin números hardcodeados, aviso
"Hasta la firma, el portal está en modo lectura", 5 pasos (Ingresen con su
correo / Elijan un proyecto / Recorran el cronograma / Marquen el estado —
cuando la validación esté habilitada, con los 4 chips explicados / Comenten),
nota "No hace falta hacerlo de una vez", pie con mail. Trata de "ustedes".

---

## 4 · PIEZA C — EL PORTAL DE VALIDACIÓN (`src/` + Supabase)

### 4.1 Modelo de acceso (tres niveles)
1. **Clave compartida** (`DAC2026` → flag `db_prop_access` en sessionStorage, el
   MISMO de la propuesta): da **modo lectura**. Quien viene de la propuesta entra
   directo; por URL directa aparece `CompuertaClave`.
2. **Cuenta invitada lado `dac`** (magic link, sin contraseñas): puede **validar**
   estados y comentar.
3. **Cuenta invitada lado `digital_builders`**: comenta (con opción "Interno"),
   ve horas/estimaciones, NO puede validar (RLS lo impide y la UI lo muestra en
   lectura con "La validación la hace el equipo de DAC").

Login en `/login` con `signInWithOtp`; al entrar se llama al RPC
`asegurar_perfil()` que crea el perfil copiando el `lado` desde `invitados` (y
falla si el correo no está invitado). Registro abierto deshabilitado.

### 4.2 Rutas (TanStack Router, file-based)
- `/` → redirect a la propuesta. `/login` → página de Lovable (Paso 2).
- Layout `src/routes/_authenticated/route.tsx`: `ssr:false`;
  `beforeLoad` lee sesión con `getSession()` (local, no red) con **cota de 6 s**
  (Promise.race — el broker de sesión del preview de Lovable por postMessage puede
  no contestar; sin cota quedaba pantalla negra). NO redirige: devuelve
  `user | null`. `pendingMs: 0` + `pendingComponent` (spinner "Cargando…") +
  `errorComponent` con mensaje real y Reintentar. `PortalLayout`: si no hay user ni
  pase → `CompuertaClave`; si hay → header + Outlet, todo dentro de `.db-fondo`.
- `/proyectos` (índice): eyebrow "DAC · Grupo Agencia — 2026", H1 display
  degradado "Validación de alcance", banner modo lectura con CTA a /login,
  tarjeta "Avance global" (barra apilada por estado + leyenda), 5 tarjetas glass
  de proyecto con **borde superior 2px en su color**, conteo `validado/total`,
  barra, "ABRIR DETALLE →".
- `/proyectos/$slug` (detalle): back-link, eyebrow "Validación de alcance — {bajada}"
  en el color del proyecto, H1 display degradado con el nombre, tarjeta de avance
  ("N/M funcionalidades validadas · SE ACTUALIZA EN VIVO", barra apilada,
  leyenda), filtros píldora por estado + buscador, y la página entera como
  **LÍNEA DE TIEMPO vertical** en el color del proyecto: riel degradado, un hito
  por mes con nodo circular, eyebrow "Mes 0N", el TITULAR DEL ROADMAP DE LA
  PROPUESTA (misma constante `MESES`), "x/y validadas"; debajo las tarjetas de
  funcionalidad de ese mes. Grupo 0 "Todo el proyecto / Transversal" para las sin
  mes. Tarjeta de funcionalidad: código mono en color (+ "continúa en mes N" si
  abarca rango), título, requisitos como lista (el campo `detalle` viene con un
  requisito por línea — hacer `split("\n")`), píldora de estado, selector de 4
  estados (solo DAC; optimista con rollback; detecta el rechazo silencioso de RLS
  cuando el update devuelve 0 filas), toggle "COMENTARIOS (n)" con hilo: autor
  (`etiquetaAutor`: nombre o "Equipo DAC"/"Digital Builders" — NUNCA emails),
  chip de lado, marca "Interno" ámbar punteado, form (checkbox Interno solo DB;
  sin sesión → CTA "Ingresá con tu correo").
- **Realtime**: `suscribirPortal()` — canal con `postgres_changes` sobre
  `validaciones` y `comentarios` → invalida queries de react-query.

### 4.3 Lenguaje visual del portal (clases en `src/styles.css`, al final)
`.db-fondo` (fondo #06070B + auras + grilla fija en ::before/::after),
`.db-z`, `.db-glass` (blur solo ≥1024px), `.db-soft`, `.db-eyebrow`,
`.db-display`, `.db-grad`, `.db-hair`, `.logo-db`. Header = píldora glass
flotante (max-w-3xl) con logo-db + "Digital Builders"; a la derecha nombre +
"Cerrar sesión" (logueado) o "Ingresar" (lectura); en mobile Sheet de shadcn con
tarjeta de usuario ("Modo lectura / Ingresá para validar" si anónimo).
Contenido max-w-3xl. Estados: pendiente `#9CA3AF` · validado `#10B981` ·
con_cambios `#F5A524` · no_va `#EF4444` (constante `ESTADOS` con color+fondo).

### 4.4 Capa de datos (`src/lib/portal.ts`)
Tipos desde `Database` generado (+ extensión manual `marca` hasta regenerar
tipos). `VALIDACION_ABIERTA` (false hasta la firma), `ESTADOS`, `ORDEN_ESTADOS`,
`MARCAS` (incluido/terceros/inicial/evolutivo con color+fondo),
`MESES = [Cimientos, Toma forma, Se opera, Transaccional, Cierre,
Estabilización]`, `mesesDe("Mes 2"|"Meses 2-3") → number[]`,
`etiquetaAutor`. Fetchers: `fetchProyectos` (order orden), `fetchAvance`
(agrupa por proyecto/estado), `fetchProyecto(slug)`,
`fetchFuncionalidades(proyectoId)` (funcionalidades + `validaciones(*)` embebido,
y comentarios con `autor:profiles(id,nombre,lado)` + `funcionalidades!inner` para
filtrar por proyecto). `cambiarEstado` (update + `.select()`; 0 filas ⇒ throw "La
validación la hace el equipo de DAC."), `agregarComentario`, `suscribirPortal`.
`usePerfil()`: sin sesión → `null` (NO llama al RPC); con sesión → asegurar_perfil.

---

## 5 · BASE DE DATOS (Supabase, esquema `public`) — estado final

**Tipos:** `org_side = 'dac'|'digital_builders'`;
`estado_funcionalidad = 'pendiente'|'validado'|'con_cambios'|'no_va'`.

**Tablas:**
- `invitados(email PK, lado, nombre)` — lista blanca. SIN acceso de cliente.
- `profiles(id PK→auth.users, email, nombre, lado, creado_en)`.
- `proyectos(id, slug UNIQUE, nombre, color, bajada, descripcion, orden)`.
- `funcionalidades(id, proyecto_id FK, codigo, titulo, detalle, mes_objetivo,
  orden, UNIQUE(proyecto_id,codigo))` — **SIN columna horas** (se eliminó a
  propósito: la tabla es legible por el cliente).
- `validaciones(funcionalidad_id PK/FK, estado, actualizado_por FK, actualizado_en)`.
- `comentarios(id, funcionalidad_id FK, autor_id FK, cuerpo, interno bool, creado_en)`.
- `bitacora(id, funcionalidad_id, autor_id, accion, antes, despues, creado_en)`.
- `estimaciones(funcionalidad_id PK/FK, horas, responsable)` — **SOLO lado
  digital_builders puede leer**. Acá viven horas y responsables.

**Funciones:** `asegurar_perfil()` (SECURITY DEFINER, search_path='', email de
`auth.jwt()`, lado desde invitados, inserta solo `auth.uid()`, EXECUTE solo
authenticated); `tiene_perfil()`; `mi_lado()`; triggers: validación inicial
'pendiente' al insertar funcionalidad; bitácora en cada cambio de estado.

**RLS (todas con RLS ON):**
- SELECT `authenticated`: exige `tiene_perfil()` en todo.
- SELECT `anon` (lectura libre tras la clave): proyectos, funcionalidades,
  validaciones `USING(true)`; comentarios `USING(interno=false)`; profiles
  `USING(true)` PERO con **privilegios de columna**: anon solo `(id,nombre,lado)`
  — sin email. `estimaciones` SIN política anon (cero filas) y para authenticated
  `mi_lado()='digital_builders'`.
- UPDATE validaciones: **solo lado `dac`**, con `actualizado_por = auth.uid()`.
- comentarios INSERT: `autor_id=auth.uid()`; interno=true solo si DB;
  SELECT authenticated: internos solo DB. UPDATE/DELETE solo propios.
- profiles: UPDATE revocado por tabla; `GRANT UPDATE (nombre)` únicamente
  (cierra escalada de cambiarse el `lado`).
- Realtime: `validaciones` y `comentarios` agregadas a `supabase_realtime`.

**Migraciones** en `supabase/migrations/` (aplicarlas en orden por timestamp; las
escribe este chat, las ejecuta el dueño en el SQL Editor). Todas idempotentes.

---

## 6 · DATOS CARGADOS (Anexo I v3, set-2026)

La migración `20260918190000_alcance_anexo1_v3.sql` (GENERADA por
`scripts/anexo_a_sql.py` desde `docs/gen_anexo1.py` — regenerar con el script,
no editar a mano) borra el alcance anterior y carga **53 bloques** con columna
nueva `funcionalidades.marca` (incluido/terceros/inicial/evolutivo):

| slug | nombre | color | bajada | bloques | códigos |
|---|---|---|---|---|---|
| transversal | Base transversal | #10B981 | Aplica a los 4 sitios | 7 | T.1-T.7 |
| dac | DAC | #3B82F6 | Encomiendas y servicios logísticos | 15 | D.1-D.15 |
| grupo-agencia | Grupo Agencia | #F97316 | Venta de pasajes | 13 | G.1-G.13 |
| sumate | Sumate | #F5A524 | Trabajá con nosotros | 7 | S.1-S.6 + IA.2 |
| intranet | Intranet | #8B5CF6 | Portal de colaboradores | 11 | I.1-I.10 + IA.1 |

`detalle` = un requisito por línea + última línea "Definición del relevamiento:
…" cuando existe. `mes_objetivo` según la matriz del cronograma (T.1-T.5 M1,
T.6 M6, T.7 M3; D/G/S/I/IA según el mapa del script). Marcas no-incluido:
D.6, D.8, D.13 = terceros · G.13 = inicial. La migración la aplica el dueño en
el SQL Editor; NO recarga `estimaciones`.

**INTERNO — nunca mostrar al cliente:** las horas viven solo en el Excel del
dueño (la tabla `estimaciones` queda vacía tras la migración y no se recarga).
Nombres del equipo interno fuera de toda superficie; los únicos nombres
públicos son los que el dueño puso en la propuesta (Santiago Bouvier; por DAC,
Mario Secchi y Sebastián Ciapessoni).

---

## 7 · DECISIONES TOMADAS (no re-litigar sin el dueño)

1. **Números finales set-2026: 32.500 / 2.000 mensual (1.500 + 500 IA) /
   evolutiva 400 / 6 cuotas de 5.417 no condicionadas / validez 60 días /
   horas nunca públicas / portal en modo lectura hasta la firma.**
2. Contenido de la web = palabra por palabra los PDF v3; ante contradicción
   ganan los scripts generadores (`docs/gen_propuesta_v3.py`, `gen_anexo1.py`).
3. Sin comparaciones con proveedores anteriores ni descripciones de la
   operación interna de DAC; sin siglas técnicas hacia el cliente.
4. Solo `dac` valida; DB comenta/propone. Comentarios internos solo DB.
5. Horas JAMÁS visibles al cliente (ni pantalla, ni API, ni acta).
6. Ver es libre con la clave; escribir exige invitación (atribución del acta).
7. La clave compartida es cortina asumida; el resto lo protege RLS de verdad.
8. Estados: pendiente/validado/con_cambios/no_va.
9. Portal con el MISMO lenguaje visual de la propuesta, organizado
   cronológicamente, y reposicionado como herramienta de aceptación por módulo
   DURANTE el proyecto: `VALIDACION_ABIERTA=false` en `src/lib/portal.ts` hasta
   la firma (el dueño lo pone en `true` al inicio; la RLS no cambia).

## 8 · ERRORES YA PAGADOS (no repetir)

- Lovable pisa `src/` y hasta tocó la propuesta pese al Knowledge → no ejecutar
  prompts de Lovable sobre el portal; siempre `git fetch` antes de push.
- Pantalla negra: beforeLoad async sin pendingComponent + getUser() de red +
  broker del preview → getSession local + cota 6s + pending/error components.
- IntersectionObserver + clip-path inset 100% = nunca dispara.
- background-clip:text se pierde al partir en líneas → recrear por línea.
- Animar `width` (barra progreso) fuerza layout → `transform: scaleX`.
- `%` en transform de animación no compone → WAAPI con píxeles.
- pypdf choca con cryptography roto del sistema → stub ImportError.
- El mirror npm de Lovable da 403 fuera de su sandbox → `--registry
  https://registry.npmjs.org`.
- tsc: `noUncheckedIndexedAccess` (ms[0] puede ser undefined).
- El repo formatea con Prettier (printWidth 100); la propuesta está en
  `.prettierignore`.

## 9 · PENDIENTES

**Del dueño:** correr `20260918190000_alcance_anexo1_v3.sql` en el SQL Editor
(y antes las de lectura anon + realtime si faltan); completar la fecha de envío
en `#fecha-envio` (texto visible + `data-validez`); proveer las 4 maquetas
panorámicas; cargar `invitados` reales; publicar desde Lovable; al firmar,
poner `VALIDACION_ABIERTA=true`.

**De desarrollo:** Paso 6 — **acta de alcance en PDF** desde `/proyectos`
(estados finales + comentarios públicos + quién validó; sin horas ni internos).
Futuro: este portal será la base del sistema de tickets del mantenimiento.
Cuando Lovable regenere los tipos de Supabase, quitar la extensión manual de
`marca` en `src/lib/portal.ts`.

## 10 · CÓMO VERIFICAR (estándar del proyecto)

Playwright + Chromium local (`/opt/pw-browsers/chromium-*/chrome-linux/chrome` en
el sandbox). La propuesta SIEMPRE offline (abortar toda request no-file) en
320/360/375/414/768/1024/1280/1440/1920 — cero desborde horizontal, cero
pageerrors, reduced-motion neutraliza todo, ~60fps. El portal se puede probar con
route-mocking de `**/rest/v1/**` usando fixtures del pliego. tsc y eslint en cero
antes de cada push. Commits en español, sin nombres de modelo de IA, con el
trailer de coautoría de Claude.
