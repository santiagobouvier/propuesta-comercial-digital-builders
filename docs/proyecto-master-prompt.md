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
**4 plataformas web** por **USD 35.500 + IVA**, según el pliego oficial del 10/08/2026.

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

### 2.3 Secciones (menú fijo con anclas y scroll-spy)
1. **Hero** `#inicio`: eyebrow "Documento confidencial · 2026", H1 "Propuesta
   Técnica y Comercial" (se parte en líneas animadas), 4 chips de proyectos con su
   color, bloque "Preparada por Digital Builders · Desarrollo web & plataformas
   digitales · Uruguay", CTA "Ver la propuesta" (magnético), indicador de scroll.
2. **Resumen ejecutivo** `#resumen`: 3 párrafos `[PENDIENTE]` + 4 tarjetas métricas:
   **4 plataformas · 228 requisitos relevados** (contador animado; "Agrupados en 48
   funcionalidades, uno por uno desde el pliego") **· ~1.000 hs estimadas ·
   Entregables demostrables cada mes**.
3. **Los 4 proyectos** `#proyectos`: tarjeta grande glass por proyecto con hairline
   superior en su color, descripción `[PENDIENTE]`, `<img loading="lazy">`
   placeholder SVG de maqueta panorámica, botón **"Abrir detalle y validar"** →
   `/proyectos/{slug}`, y acordeón "Ver funcionalidades" con los bloques REALES del
   pliego (título · N requisitos · Mes objetivo, `whitespace-nowrap` en el conteo).
4. **Cómo trabajamos** `#metodologia`: 3 tarjetas — entregable cada 30 días / UAT
   con checklist firmado por módulo / testing en 3 capas (automatizado, funcional
   interno, aceptación del cliente) — + badges de seguridad: sesiones con
   expiración, alertas de acceso, auditoría, **Ley 18.331**.
5. **Roadmap** `#roadmap`: timeline de 6 meses, horizontal en desktop y vertical en
   mobile, riel que **se dibuja con el scroll** y 6 puntos que se encienden en
   secuencia. Titulares EXACTOS: **Mes 01 Cimientos · Mes 02 DAC toma forma ·
   Mes 03 DAC opera · GA nace · Mes 04 Transaccional · Mes 05 Cierre total —
   producción · Mes 06 Colchón** (atenuado, borde punteado, "sin costo adicional").
   Cada mes lista lo completado por proyecto (bullets con color) y una píldora de
   ENTREGABLE: M1 "Entorno de staging + design system navegable" · M2 "DAC
   navegable en staging con contenido real" · M3 "DAC aprobado + primeras vistas de
   Grupo Agencia" · M4 "Grupo Agencia en UAT + Sumate en staging" · M5 "4
   plataformas en producción + documentación". (Contenidos redactados por la IA,
   pendientes de visto bueno del dueño.)
6. **Mantenimiento** `#mantenimiento`: **USD 225 por sistema, por mes + IVA**, con
   caja destacada "Las 4 plataformas USD 900 / mes + IVA". Bullets del plan:
   soporte correctivo de las 4, monitoreo continuo con alertas, actualizaciones de
   seguridad mensuales, informe mensual con cumplimiento del SLA (NO prometer
   "bolsa de horas"). Tabla SLA (tarjetas en mobile, tabla en ≥sm): **Crítica < 2 hs
   todos los días · Alta < 8 hs · Normal < 24 hs** (badge "Crítica 24/7").
   Grilla **"Qué garantiza el servicio, mes a mes"** con 7 compromisos:
   01 Informe mensual automático (destacada, doble ancho: PDF día 1 con tickets,
   tiempos vs SLA, uptime, horas usadas, mejoras) · 02 Monitoreo proactivo con
   alertas · 03 SLA por severidad, medido · 04 Portal de tickets propio ·
   05 Revisión trimestral (30 min) · 06 Actualizaciones de seguridad mensuales ·
   07 Backup verificado mensual (se restaura y documenta). Tarjeta "Portal de
   soporte integrado con trazabilidad completa" (4 mini-cards: ticket con
   historial, estado en tiempo real, SLA medido, reporte mensual).
7. **Inversión** `#inversion`: número grande **USD 35.500** + "más IVA" (entra con
   blur→foco). Mini-stats 4/5/6/0 (plataformas/meses/pagos/costos ocultos).
   Cronograma de pagos: **6 pagos mensuales IGUALES de USD 5.916,67 + IVA**, uno
   por mes contra etapa cumplida (Firma/Anticipo + M1..M5 con su entregable).
   Nota: "El total se divide en 6 pagos mensuales iguales de USD 5.916,67 + IVA, y
   cada uno se libera contra entregable validado por el equipo de DAC." (La suma da
   35.500,02 — el dueño eligió pagos iguales sabiéndolo.)
   ⚠ Pregunta abierta: si el 1er pago es a la firma o contra mes 1 cumplido.
8. **Cierre** `#cierre`: "Empecemos a construir.", párrafo compromiso `[PENDIENTE]`,
   tarjeta mailto `info@digitalbuilders.net`, **Validez: 30 días — hasta el 22 de
   setiembre de 2026**, y la línea "Esta propuesta fue construida con las mismas
   tecnologías y estándares que proponemos para sus sitios."

Placeholders SIEMPRE visibles en gris itálica `[PENDIENTE: …]` (clase `.pending`),
nunca lorem ipsum.

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
Misma estética (CSS artesanal, sin Tailwind). Contenido: título "Cómo validar el
alcance de sus proyectos", sub con "48 funcionalidades y 228 requisitos", 5 pasos
(Ingresen con su correo / Elijan un proyecto / Recorran el cronograma / Marquen el
estado — con los 4 chips de colores explicados / Comenten), nota "No hace falta
hacerlo de una vez", pie con mail. Trata de "ustedes" al equipo de DAC.

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
Tipos desde `Database` generado. `ESTADOS`, `ORDEN_ESTADOS`,
`MESES = [Cimientos, DAC toma forma, DAC opera · GA nace, Transaccional,
Cierre total — producción, Colchón]`, `mesesDe("Mes 2"|"Meses 2-3") → number[]`,
`etiquetaAutor`. Fetchers: `fetchProyectos` (order orden), `fetchAvance`
(48 filas, agrupa por proyecto/estado), `fetchProyecto(slug)`,
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

## 6 · DATOS CARGADOS (del pliego, YA en la base)

5 proyectos / **48 funcionalidades / 228 requisitos**:

| slug | nombre | color | bajada | bloques | requisitos | prefijo códigos |
|---|---|---|---|---|---|---|
| transversal | Base transversal | #10B981 | Aplica a los 4 sitios | 7 | 40 | TR- |
| dac | DAC | #3B82F6 | Sitio institucional | 15 | 85 | DAC- |
| grupo-agencia | Grupo Agencia | #F97316 | Plataforma transaccional | 11 | 47 | GA- |
| sumate | Sumate | #F5A524 | Sitio de campaña | 4 | 23 | SU- |
| intranet | Intranet | #8B5CF6 | Plataforma interna | 11 | 33 | IN- |

`mes_objetivo` formato "Mes N" / "Meses A-B" (los TR de requisitos generales van
sin mes). Distribución: M1×4, M2×5, M3×8, M4×7, M5×21, rangos 2-3 y 3-4.

**INTERNO — nunca mostrar al cliente:** horas por proyecto en `estimaciones`:
transversal 130 · DAC ~400 · GA ~299 (doc decía ~245+extras) · Sumate 85–93 ·
Intranet 167 · total ~1.081–1.089 con coordinación. Responsables: Santiago,
Kaoru, Ambos, Transversal. Se limpiaron 2 fugas del PDF: "(trabajo con Kaoru)" en
un requisito y la tabla de horas pegada al final del último requisito de Intranet.
Fuente: PDF "DAC_desglose_hiperdetallado" (9 págs; bullets = char \x7f).

---

## 7 · DECISIONES TOMADAS (no re-litigar sin el dueño)

1. 6 pagos **iguales** de 5.916,67 + IVA (el dueño lo eligió sobre 5×5.917+5.915).
2. Mantenimiento 225 + IVA por sistema; 900 + IVA las 4. Sin bolsa de horas.
3. Validez 30 días (hasta 22/09/2026) — recomendación aceptada.
4. Métrica pública: "228 requisitos relevados" (no "51 funcionalidades": no cuadraba).
5. Solo `dac` valida; DB comenta/propone. Comentarios internos solo DB.
6. Horas JAMÁS visibles al cliente (ni en pantalla, ni API, ni acta): tabla aparte.
7. Ver es libre con la clave; escribir exige invitación (atribución del acta).
8. La clave compartida es cortina asumida; el resto lo protege RLS de verdad.
9. Estados: pendiente/validado/con_cambios/no_va ("Va con cambios" agregado).
10. Portal con el MISMO lenguaje visual de la propuesta y organizado
    cronológicamente (feedback fuerte del dueño tras una v1 genérica).

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

**Del dueño:** correr migraciones nuevas en SQL Editor si faltan (lectura anon +
realtime); cargar `invitados` reales (DB primero, DAC después); probar login;
confirmar si el 1er pago es a la firma o contra mes 1; dar visto bueno a los
textos que la IA redactó (roadmap por mes, hitos de pago, garantías).

**De contenido (propuesta):** 12 `[PENDIENTE]`: 3 párrafos del resumen, 4
descripciones de proyecto, párrafo de compromiso, 4 maquetas panorámicas.

**De desarrollo:** Paso 6 — **acta de alcance en PDF** desde `/proyectos`
(estados finales + comentarios públicos + quién validó; sin horas ni internos).
Futuro: este portal será la base del sistema de tickets del mantenimiento.

## 10 · CÓMO VERIFICAR (estándar del proyecto)

Playwright + Chromium local (`/opt/pw-browsers/chromium-*/chrome-linux/chrome` en
el sandbox). La propuesta SIEMPRE offline (abortar toda request no-file) en
320/360/375/414/768/1024/1280/1440/1920 — cero desborde horizontal, cero
pageerrors, reduced-motion neutraliza todo, ~60fps. El portal se puede probar con
route-mocking de `**/rest/v1/**` usando fixtures del pliego. tsc y eslint en cero
antes de cada push. Commits en español, sin nombres de modelo de IA, con el
trailer de coautoría de Claude.
