# Prompts para Lovable — Portal de validación DAC

Ejecutarlos **en orden**. Esperá a que cada uno termine y compile antes del siguiente.
Si Lovable se va por las ramas, no insistas sobre el mismo prompt: abrí uno nuevo
pidiendo solo la corrección puntual.

---

## Paso 0 · Conectar Supabase (no es un prompt)

En la interfaz de Lovable, botón **Supabase / Cloud → Connect**. Elegí tu proyecto o
creá uno nuevo. Lovable deja las variables de entorno configuradas solo.

Recién cuando eso esté conectado, seguí con el Prompt 1.

---

## Knowledge del proyecto (pegar una sola vez)

En Lovable: **Settings → Knowledge** (o "Project instructions"). Esto queda como
contexto permanente y evita que se rompan cosas en cada prompt.

```
CONTEXTO DEL PROYECTO

Este repo tiene DOS partes separadas que no se mezclan:

1. `public/propuesta/index.html` — La propuesta comercial para DAC. Es un sitio
   estático de un solo archivo, con su CSS y su JS embebidos. NO LO TOQUES NUNCA.
   No lo edites, no lo migres a React, no lo reformatees, no lo dividas en
   componentes. Se mantiene por fuera de Lovable.

2. `src/` — La aplicación React (TanStack Start). Acá sí trabajás.

REGLAS FIJAS

- La ruta `/` debe seguir redirigiendo a `/propuesta/index.html`. No la conviertas
  en una landing ni le pongas contenido.
- El portal de validación vive bajo `/proyectos/...`.
- Paleta: fondo #06070B, texto blanco. Acentos por proyecto:
  DAC #3B82F6 · Grupo Agencia #F97316 · Sumate #F5A524 · Intranet #8B5CF6 ·
  transversal (Digital Builders) #10B981.
- Estética: dark, tarjetas con bordes redondeados grandes, tipografía Inter,
  mucho espacio en blanco. Mobile-first, sin desborde horizontal a 320px.
- Todo el texto de interfaz en español rioplatense (usá "vos", no "tú").
- Nunca pongas la service_role key de Supabase en el cliente. Solo la anon key.
- Toda tabla nueva va con RLS habilitada y políticas explícitas.
```

---

## Prompt 1 · Base de datos y seguridad

```
Creá el esquema de base de datos en Supabase para un portal donde el cliente DAC
valida el alcance de un proyecto, funcionalidad por funcionalidad.

TIPOS
- org_side: 'dac' | 'digital_builders'
- estado_funcionalidad: 'pendiente' | 'validado' | 'con_cambios' | 'no_va'

TABLAS
- profiles: id (uuid, FK a auth.users, PK), email (text, not null), nombre (text),
  lado (org_side, not null, default 'dac'), creado_en (timestamptz default now())

- invitados: email (text, PK), lado (org_side not null), nombre (text)
  Es la lista blanca. Solo quien esté acá puede tener cuenta.

- proyectos: id (uuid PK), slug (text unique not null), nombre (text not null),
  color (text not null), bajada (text), descripcion (text), orden (int default 0)

- funcionalidades: id (uuid PK), proyecto_id (uuid FK proyectos on delete cascade),
  codigo (text not null), titulo (text not null), detalle (text), horas (numeric),
  orden (int default 0), unique (proyecto_id, codigo)

- validaciones: funcionalidad_id (uuid PK, FK funcionalidades on delete cascade),
  estado (estado_funcionalidad not null default 'pendiente'),
  actualizado_por (uuid FK profiles), actualizado_en (timestamptz default now())

- comentarios: id (uuid PK), funcionalidad_id (uuid FK funcionalidades on delete
  cascade), autor_id (uuid FK profiles not null), cuerpo (text not null),
  creado_en (timestamptz default now())

- bitacora: id (bigserial PK), funcionalidad_id (uuid FK funcionalidades),
  autor_id (uuid FK profiles), accion (text not null), antes (text), despues (text),
  creado_en (timestamptz default now())

TRIGGERS
- Al crearse un usuario en auth.users, crear su fila en profiles copiando el `lado`
  desde la tabla invitados según su email. Si el email no está en invitados, abortar
  con excepción.
- Al insertarse una funcionalidad, crear automáticamente su fila en validaciones con
  estado 'pendiente'.
- Al cambiar el estado en validaciones, escribir una fila en bitacora con el estado
  anterior y el nuevo.

RLS (habilitada en todas las tablas)
- proyectos y funcionalidades: lectura para cualquier usuario autenticado. Escritura
  denegada desde el cliente.
- validaciones: lectura para autenticados. UPDATE permitido a cualquier autenticado,
  y actualizado_por debe ser auth.uid().
- comentarios: lectura para autenticados. INSERT solo con autor_id = auth.uid().
  UPDATE y DELETE solo sobre comentarios propios.
- bitacora: solo lectura para autenticados. Sin escritura desde el cliente.
- profiles: cada usuario lee su propia fila y las de los demás (para mostrar nombres).
  Solo puede editar la suya.
- invitados: sin acceso desde el cliente.

SEED
Insertá los 4 proyectos:
  dac | DAC | #3B82F6 | Sitio institucional
  grupo-agencia | Grupo Agencia | #F97316 | Plataforma transaccional
  sumate | Sumate | #F5A524 | Sitio de campaña
  intranet | Intranet | #8B5CF6 | Plataforma interna

No crees pantallas todavía. Solo el esquema, los triggers, las políticas y el seed.
```

---

## Prompt 2 · Login por magic link

```
Implementá la autenticación con Supabase Auth usando magic link (sin contraseñas).

- Ruta /login: un input de email y un botón "Enviarme el acceso". Llama a
  signInWithOtp. Al enviarse, mostrá un mensaje de "revisá tu correo" en vez del
  formulario.
- Si el email no está en la tabla invitados, mostrá un mensaje claro de que ese
  correo no tiene acceso, sin revelar quién sí lo tiene.
- Todas las rutas bajo /proyectos requieren sesión. Sin sesión, redirigí a /login.
- En el encabezado, mostrá el nombre del usuario y un botón para cerrar sesión.
- Deshabilitá el registro abierto en Supabase Auth: solo se entra por invitación.
- La ruta / sigue redirigiendo a /propuesta/index.html, sin login.

Diseño: mismo dark del proyecto, tarjeta centrada, mobile-first.
```

---

## Prompt 3 · Página de detalle de proyecto

```
Creá la ruta /proyectos/$slug que muestra un proyecto y todas sus funcionalidades
para validar.

ENCABEZADO
- Nombre del proyecto en grande, con su color de acento y su bajada.
- Barra de avance de validación: cuántas funcionalidades están validadas sobre el
  total, y el desglose por estado con colores:
  validado verde #10B981 · con cambios ámbar #F5A524 · no va rojo #EF4444 ·
  pendiente gris.

LISTADO DE FUNCIONALIDADES
Una tarjeta por funcionalidad, mostrando código, título y detalle.
Cada tarjeta tiene:
- Un selector de estado con los 4 valores. Al cambiarlo, escribe en validaciones y
  guarda actualizado_por y actualizado_en. Mostrá quién lo cambió y cuándo.
- Un hilo de comentarios: los existentes con autor, fecha y una etiqueta visual
  distinta según el lado (DAC o Digital Builders), más un campo para agregar uno
  nuevo.
- El contador de comentarios visible aunque el hilo esté plegado.

FILTROS
Barra para filtrar por estado y un buscador por texto. En mobile que sea colapsable.

IMPORTANTE
- No muestres ni sumes las horas de las funcionalidades. Ese campo existe pero es
  de uso interno y no va en pantalla.
- Guardado optimista: el cambio se ve al instante y se revierte si falla, con aviso.
- Mobile-first: a 320px no puede haber desborde horizontal.
```

---

## Prompt 4 · Tiempo real

```
Agregá Supabase Realtime a la página /proyectos/$slug.

- Suscribite a los cambios de validaciones y comentarios de ese proyecto.
- Cuando alguien más cambia un estado o agrega un comentario, actualizá la vista sin
  recargar y marcá con una animación suave lo que cambió.
- Mostrá un indicador discreto de "conectado en vivo" y manejá la reconexión si se
  cae. No lo hagas ruidoso.
- Cuidado con no duplicar los cambios que hace el propio usuario, que ya se aplicaron
  de forma optimista.
```

---

## Prompt 5 · Índice del portal

```
Creá la ruta /proyectos con las 4 tarjetas de proyecto: nombre, bajada, color de
acento y el avance de validación de cada uno (validadas sobre total, con una barra).
Cada tarjeta lleva a /proyectos/$slug. Ordenadas por el campo orden.
Arriba, el avance global de los 4 proyectos juntos.
```

---

## Prompt 6 · Acta de alcance validado

```
En /proyectos agregá un botón "Descargar acta de alcance".

Genera un PDF con:
- Encabezado: "Acta de alcance validado", cliente DAC / Grupo Agencia, fecha de
  emisión.
- Por cada proyecto, la lista completa de funcionalidades con su estado final y, si
  tiene, el último comentario.
- Un resumen: totales por estado.
- Al pie: quiénes participaron de la validación y la fecha del último cambio.

Sin horas ni precios en ningún lado del documento.
```

---

## Lo que queda para después

- **Cargar las 51 funcionalidades** en la tabla `funcionalidades`. Eso lo hago yo por
  SQL cuando me pases el archivo, o lo pedís como prompt aparte.
- **Cargar los invitados** (emails de DAC y de Digital Builders) en la tabla
  `invitados`, con su `lado`.
- **Enlazar la propuesta con el portal**: los 4 bloques de proyecto de
  `public/propuesta/index.html` van a apuntar a `/proyectos/{slug}`. Eso lo hago yo.
