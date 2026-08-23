-- ═══════════════════════════════════════════════════════════════════════════
-- Carga del desglose real del pliego DAC 2026 y separacion de datos internos.
--
-- Tres cambios de fondo:
--
-- 1. Se elimina funcionalidades.horas. La tabla la puede leer cualquier usuario
--    con perfil, asi que dejar ahi las horas estimadas equivalia a publicarle al
--    cliente el costeo interno: aunque la pantalla no las muestre, se leen con
--    una llamada directa a la API. Las horas y el responsable pasan a la tabla
--    estimaciones, legible solo por el lado digital_builders. La proteccion
--    queda en el modelo y no depende de recordar que columnas seleccionar.
--
-- 2. Los comentarios pueden marcarse como internos y en ese caso solo los ve
--    Digital Builders.
--
-- 3. El estado de validacion solo lo cambia el lado dac. Digital Builders
--    comenta y propone; quien valida el alcance es el cliente, que es lo que le
--    da valor al acta.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Helper: el lado del usuario actual ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mi_lado()
RETURNS public.org_side
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT lado FROM public.profiles WHERE id = (SELECT auth.uid())
$$;
REVOKE ALL ON FUNCTION public.mi_lado() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mi_lado() TO authenticated;

-- ── funcionalidades: mes objetivo, y fuera las horas ────────────────────────
ALTER TABLE public.funcionalidades ADD COLUMN IF NOT EXISTS mes_objetivo text;
ALTER TABLE public.funcionalidades DROP COLUMN IF EXISTS horas;

-- ── estimaciones: solo Digital Builders ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.estimaciones (
  funcionalidad_id uuid PRIMARY KEY REFERENCES public.funcionalidades(id) ON DELETE CASCADE,
  horas numeric,
  responsable text
);
ALTER TABLE public.estimaciones ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.estimaciones TO authenticated;
GRANT ALL ON public.estimaciones TO service_role;
DROP POLICY IF EXISTS estimaciones_select_db ON public.estimaciones;
CREATE POLICY estimaciones_select_db ON public.estimaciones
  FOR SELECT TO authenticated
  USING (public.tiene_perfil() AND public.mi_lado() = 'digital_builders');

-- ── comentarios internos ────────────────────────────────────────────────────
ALTER TABLE public.comentarios ADD COLUMN IF NOT EXISTS interno boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS comentarios_select_autenticados ON public.comentarios;
CREATE POLICY comentarios_select_autenticados ON public.comentarios
  FOR SELECT TO authenticated
  USING (public.tiene_perfil() AND (interno = false OR public.mi_lado() = 'digital_builders'));

DROP POLICY IF EXISTS comentarios_insert_propio ON public.comentarios;
CREATE POLICY comentarios_insert_propio ON public.comentarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.tiene_perfil()
    AND autor_id = (SELECT auth.uid())
    AND (interno = false OR public.mi_lado() = 'digital_builders')
  );

-- ── validar es potestad del cliente ─────────────────────────────────────────
DROP POLICY IF EXISTS validaciones_update_autenticados ON public.validaciones;
CREATE POLICY validaciones_update_dac ON public.validaciones
  FOR UPDATE TO authenticated
  USING (public.tiene_perfil() AND public.mi_lado() = 'dac')
  WITH CHECK (public.tiene_perfil() AND public.mi_lado() = 'dac'
              AND actualizado_por = (SELECT auth.uid()));

-- ── Quinto grupo: la base transversal aplica a los 4 sitios ─────────────────
INSERT INTO public.proyectos (slug, nombre, color, bajada, orden) VALUES
  ('transversal', 'Base transversal', '#10B981', 'Aplica a los 4 sitios', 0)
ON CONFLICT (slug) DO UPDATE
  SET nombre = EXCLUDED.nombre, color = EXCLUDED.color,
      bajada = EXCLUDED.bajada, orden = EXCLUDED.orden;

-- ── Los 48 bloques del pliego ───────────────────────────────────────────────

-- Base transversal (7 bloques)
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-01', 'Requisitos generales del pliego (los 4 sitios)', 'Diseño responsive para celular y PC en todos los sitios y todas las secciones.
Carga de documentos rápida y optimizada.
Correcto funcionamiento verificado en Chrome, Firefox, Edge y Safari.
Uso de HTTPS y cifrado SSL en todos los dominios.
Política de privacidad clara sobre el uso de datos.
Expiración automática de sesión después de un tiempo de inactividad.
Notificaciones sobre intentos de inicio de sesión sospechosos en TODOS los sitios.
Todos los sitios con opción de recuperación de contraseña.
Tras el primer inicio de sesión se solicita cambio de contraseña; el usuario puede cambiarla cuantas veces quiera (aplica especialmente a Intranet).
Login automático desde Google en los 2 sitios públicos (DAC y GA); DAC y GA además con ingreso por Facebook según secciones específicas.', NULL, 1
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-02', 'Arquitectura base', 'Diseño completo de base de datos (usuarios, roles, contenidos, envíos, postulaciones, comunicados, tickets de soporte).
Estructura multi-sitio: 4 proyectos, backend compartido donde convenga, aislado donde sea crítico.
Entornos separados: desarrollo, staging (validación de DAC) y producción.
Repositorios Git y flujo de trabajo con revisión de código previa a merge.
Convenciones de componentes, estilos y naming — los rieles del proyecto.', 'Mes 1', 2
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-03', 'Autenticación unificada', 'Login social Google y Facebook en sitios públicos.
Registro con usuario/contraseña + recuperación de contraseña en todos los sitios.
Cambio de contraseña obligatorio en primer ingreso donde aplique; cambio libre ilimitado posterior.
Migración/convivencia con usuarios registrados actuales (volumen y formato a confirmar con DAC).
Correos transaccionales (recuperación, confirmaciones) con dominio corporativo.', 'Mes 1', 3
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-04', 'Seguridad transversal', 'Expiración de sesión por inactividad con parámetro configurable.
Detección y notificación de logins sospechosos (IP/dispositivo inusual) en los 4 sitios.
Headers de seguridad (CSP, HSTS), cookies httpOnly/secure.
RLS (Row Level Security) en todas las tablas: aislamiento por usuario/rol a nivel de base de datos.
Secretos y credenciales de WS en vault/variables de entorno — nunca en código ni en cliente.
Cumplimiento Ley 18.331 (protección de datos personales).', 'Mes 1', 4
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-05', 'CMS unificado con auditoría', 'Panel único de gestión centralizado con accesos diferenciados por proyecto (compromiso de la propuesta 2025 que se mantiene).
Cada usuario ve y modifica solo lo que le corresponde según rol y permisos.
Registro de TODAS las acciones por usuario: quién modificó qué, cuándo y en qué área (trazabilidad exigida).
Todo el contenido de los sitios (textos, fotos, datos) actualizable por DAC de manera rápida sin depender de terceros — requisito repetido del pliego.
Sección de Soporte integrada: reporte de incidencias con estado, historial y trazabilidad (portal de tickets, cara DAC).', 'Mes 1', 5
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-06', 'QA integral final', 'Pruebas cross-browser: Chrome, Firefox, Edge, Safari.
Responsive completo celular/PC en todos los flujos.
Pruebas de flujos punta a punta: despacho, compra de pasaje, postulación, comunicado.
Pruebas de carga en secciones críticas (compra de pasajes, hacé tu envío).
Ronda de validación con el equipo de DAC (UAT) y corrección de observaciones con checklist de aceptación firmado por módulo.', 'Mes 5', 6
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'TR-07', 'Puesta en producción', 'Deploy de los 4 sitios, DNS, certificados SSL.
Ventana de corte pactada con DAC (mínima operación).
Monitoreo proactivo 24/7 con alertas configurado desde el día 1.
Capacitación al equipo de DAC en el CMS + documentación de administración entregada. Meses 2-5', 'Mes 5', 7
  FROM public.proyectos WHERE slug = 'transversal'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;

-- DAC (15 bloques)
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-01', '1. Inicio (Home)', 'Diseño visual moderno y accesible.
Menú fijo INAMOVIBLE, visible todo el tiempo en todas las pestañas: INICIO / LA EMPRESA / ENVÍOS / SERVICIOS / TARIFAS / PASAJES / INGRESA A TU CUENTA.
Envíos con subsecciones: ''Hacé tu envío'' y ''Rastreá tu envío''.
Pie de página con secciones: Preguntas frecuentes, Sumate, Agencias, y Contacto.
Todo el contenido (textos, fotos, datos) editable por DAC desde el CMS sin depender de terceros.', 'Mes 2', 1
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-02', '2. La Empresa', 'Información clara presentando a DAC y su relación con GA (texto lo provee DAC).
El texto debe incluir links a: ''Hacé tu Envío'', ''Agencias'', ''Rastreo'', ''Trabajá con nosotros''.
Panel ''DAC en números'' de rápida visualización: cantidad de pedidos, colaboradores, agencias, flota, m² de superficie — editable.
Video institucional embebido + link al canal de YouTube.
Sección de novedades fácilmente editable: subir rápido noticias, links y posteos de interés.
Testimonios de clientes: citas y videos, con links a sus respectivos sitios web — carga fácil desde CMS.', 'Mes 2', 2
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-03', '3.a-b. Hacé tu envío (despacho online)', 'Despacho igual al que se realiza en cualquier mostrador de DAC.
Debe imprimir la ETIQUETA y emitir la FACTURA al confirmar el envío.
Requiere interacción con VARIOS Web Services.
Debe ser similar al actual (hay referencia funcionando para relevar).
El remitente debe estar registrado y logueado antes de poder despachar.
Guardar y borrar direcciones de envío: datos del destinatario y direcciones favoritas.
Editar direcciones para levante en diversas direcciones.
Con cliente logueado, además: botón ''guardar dirección frecuente'' + libreta de direcciones frecuentes con buscador.
Posibilidad de agregar SERVICIOS DE VALOR AGREGADO al envío (hoy NO se puede — funcionalidad nueva).
Gestión de datos del cliente: agregar, editar o quitar domicilios, teléfono, etc.
Manejo de errores del WS a mitad de despacho (anulación/reintento).', 'Mes 3', 3
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-04', '3.c-e. Rastreá tu envío + Reclamos', 'Funcionamiento similar al actual pero con diseño más moderno y user friendly.
Cualquiera puede ingresar un número de rastreo y ver el estado de la encomienda (sin login).
Para ver datos DETALLADOS (dirección de entrega, nombre del destinatario) se requiere login — protección de datos.
Mostrar el FLUJO del envío ''tildando los estados como un checklist a medida que avanzan''.
Al rastrear, devolver si el envío tiene reclamo y los datos asociados al mismo.
Inicio de reclamo desde la guía rastreada: identificar el incidente y subir evidencias.
Comunicación vía API con el sistema de encomiendas; las CONDICIONES de apertura las establece el sistema de encomiendas (mostrar mensaje claro si no se cumplen).
Tipos de reclamo del listado del sistema: rotura, falta de contenido, extravío, entrega incorrecta y mal despachado.
OBLIGATORIO adjuntar factura de compra o documentación que verifique el monto reclamado.
Ingreso de reclamo también desde el historial (botón ''ingresar reclamo'') o completando número de rastreo + teléfono de contacto.', 'Meses 2-3', 4
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-05', '3.f. Carga masiva corporativa', 'Clientes corporativos cargan al sitio un archivo en formato xlsx (enviado por DAC) con las columnas en el orden establecido.
La carga genera vía API los envíos en el sistema de encomiendas.
Permitir la impresión de las etiquetas de todos los envíos generados.
Máximo actual: 400 etiquetas por solicitud.
Resaltar y permitir CORREGIR direcciones erróneas que no se pudieron localizar en el mapa.
Solo para clientes corporativos con autorización para despachos masivos.', 'Mes 4', 5
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-06', '4. Servicios', '5 subsecciones: (1) Servicios logísticos: Fulfillment y Almacenamiento, última milla, abastecimiento a tiendas, contra reembolso, consolidación; (2) Ecommerce; (3) Servicios de Valor Agregado: etiquetado, ensobrado, giros, facturación, confirmación de entrega; (4) Servicios Postales; (5) Servicios Internacionales; + Venta de Pasajes.
DAC provee el texto y descripción de cada servicio.
Presentación ANIMADA y creativa que explique cada servicio — ''que no quede solo texto'' (requisito textual).', 'Mes 2', 6
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-07', '5. Tarifas — Simulador de envíos', 'Simulador donde cada persona pueda simular un despacho y conocer la tarifa APROXIMADA.
Mostrar todos los posibles servicios de valor agregado que puede añadir.
El simulador debe tomar datos del SISTEMA DE VENTAS de DAC (WS).
Contemplar la TASA POSTAL en los casos que corresponda.
Mostrar opción de bolsas, embalajes, rampa y todo el portfolio de servicios disponibles.', 'Mes 3', 7
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-08', '6.a. Registro / Ingreso', 'Registro igual al actual con diseño más moderno e intuitivo.
DAC debe poder cambiar el contenido de esta página desde el CMS.
Ingreso directo con Google y Facebook.
Se guarda la dirección para futuros despachos.
Mostrar un MAPA para que el cliente confirme la dirección.', 'Mes 2', 8
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-09', '6.b.iii. Historial de envíos (cliente logueado)', 'Resumen de todos los envíos del cliente en período reciente, con filtro por FECHA.
Campos de la tabla: Destinatario, quién paga, tipo de paquete o producto, monto cobrado o a cobrar, último estado del envío, reclamo (si tiene o no; si no tiene, poder ingresarlo).
Botón ''gestionar paquete'' para ingresar reclamo — condiciones las establece el sistema de encomiendas, con mensaje claro si no se cumplen.
Agregar MONTO SIN DESCUENTO (''porque hay descuentos que se calculan'') — hoy no está en el resumen.
En la exportación, agregar la opción ''cliente paga'' para verificar los datos del historial contra la factura.
Reenviar / reimprimir comprobante de envío y etiqueta.
Filtro por ESTADO en el historial (además del de fecha).', 'Mes 3', 9
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-10', '6.b.iv. Indicadores corporativos', 'Visibles SOLO para clientes corporativos — la distinción corporativo/público la hace el sistema de ventas (requiere WS).
Cantidad despachada.
Cantidad de lo despachado que está entregado.
Cantidad de no entregados, con link al historial para gestionar.
Promedio de días de entrega.
Cantidad de reclamos por estado, con link al historial.
Facturado en el mes de consulta, con link al historial.', 'Mes 4', 10
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-11', '6.b.v. Indicadores internos de uso', 'Para información interna de DAC sobre el uso del sitio por los clientes.
Ejemplos del pliego: clientes que se loguearon, cuántas veces lo hicieron en el mes, cuántos envíos generó, cuántos rastreos realizó, cuántas impresiones de etiquetas, etc.', 'Mes 4', 11
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-12', '6.b.vii. Gestión de facturación (corporativos)', 'Visualizar facturas y notas de crédito por mes.
Detalle de facturación del mes: MISMO Excel que hoy reciben por mail, emitido por el sistema de ventas.
Para clientes con CUENTA CONTROLADA: seleccionar envíos y realizar el PAGO a través de la pasarela de pagos.
Requiere integración vía API con el sistema de encomiendas (conciliación de pagos).', 'Mes 5', 12
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-13', '9. Impersonación de clientes', 'Usuarios internos de DAC se loguean y SELECCIONAN UN CLIENTE para trabajar en su nombre en el sistema de encomiendas.
Sin necesidad de que los usuarios internos conozcan la contraseña del cliente.
Los controles los realiza el sistema de encomiendas.
Registro de auditoría: qué usuario operó por qué cliente.', 'Mes 5', 13
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-14', '7-8. Preguntas frecuentes + Sumate', 'FAQ con BUSCADOR por palabras clave en la parte superior.
Preguntas clasificadas según el tema (ver sitio ejemplo que indicará DAC).
DAC proporciona las preguntas clave y sus respuestas.
Sección Sumate: lleva directamente al sitio Trabajá con Nosotros.', 'Mes 2', 14
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'DAC-15', 'SEO sitio DAC', 'Palabras clave estratégicas del sector transporte de encomiendas y pasajeros.
Etiquetas HTML correctas (H1, H2, H3), URLs amigables, metaetiquetas title y description optimizadas.
Optimización de tiempos de carga y responsive.
Sitemap XML + configuración de robots.txt.
Estrategia de enlazado interno + enlaces salientes a referencias relevantes.
Contenidos optimizados y bien estructurados; integración con redes sociales y estrategia de autoridad/backlinks.', 'Mes 3', 15
  FROM public.proyectos WHERE slug = 'dac'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;

-- Grupo Agencia (11 bloques)
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-01', '1. Inicio (Home)', 'Diseño visual moderno y accesible.
Títulos fijos INAMOVIBLES visibles en todas las pestañas: INICIO / LA EMPRESA / DESTINOS Y HORARIOS / COMPRA TU PASAJE / INGRESA A TU CUENTA.
Pie de página con: Preguntas frecuentes, Descuentos, Contrataciones/Excursiones, y Trabajá con Nosotros.
Buscador principal de destinos y horarios TAMBIÉN presente en la página de inicio.', 'Mes 3', 1
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-02', '2. Compra tu pasaje — flujo completo', 'Buscador principal de destinos y horarios, conectado vía WS con el sistema de ventas.
Debe ser ÁGIL Y MUY RÁPIDO.
TIMER visible durante TODA la compra: 15 minutos desde que se selecciona un asiento; el parámetro de tiempo debe ser EDITABLE por DAC.
Al ingresar origen y destino: desplegar los servicios mostrando todos los horarios del día y medio día del siguiente (información de 36 horas).
Al elegir horario: solicitar cantidad de pasajeros y llevar directo a la compra, pidiendo fecha de viaje y proponiendo automáticamente ''ida y vuelta'' (marcar ''solo ida'' si corresponde).
Poder comprar: pasajes abiertos, pasajes con vuelta abierta, y pasajes para un TERCERO.
Compra rápida para cliente sin registrar (invitado) + compra con documento EXTRANJERO.
Selección de asientos (mapa del coche vía WS).', 'Mes 4', 2
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-03', '2.e. Encuesta post-viaje', 'Encuesta por mail a TODOS los clientes que compren por web.
El correo debe llegar el DÍA en que el cliente viaja, TRES HORAS después de terminado el viaje.', 'Mes 5', 3
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-04', '2.f. Reserva web de hoteles y estadías', 'Luego de la compra del pasaje, ofrecer la reserva de un hotel en esa localidad (ej.: ''Reserve su hotel en Salto aquí'').
Una o dos opciones por localidad.
Mostrar las HABITACIONES DISPONIBLES, poder seleccionarlas y ABONAR en la misma página.
Nota vigente de la propuesta 2025: ampliaciones o definiciones posteriores de mayor complejidad se recotizan.', 'Mes 5', 4
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-05', '2.g. Vales a bordo', 'Para las localidades con vale de a bordo por compra web: ENVIAR el vale por mail; el pasajero lo imprime para canjearlo donde corresponda.
El MONTO del vale debe ser editable por DAC — esto NO es vía WS (gestión propia del sitio).
Página donde el COMERCIO que realiza el canje pueda verificar la VALIDEZ y el USO POR ÚNICA VEZ del vale.', 'Mes 5', 5
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-06', '2.h. Cupones OCA e Itaú', 'Gestión y canje de pasajes a través de cupones para OCA e Itaú.
Generación de LISTA de cupones con valores predeterminados (EDITABLES) y códigos de verificación.
Las listas se proporcionan a los comercios mencionados.', 'Mes 5', 6
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-07', '3. La Empresa', 'Información clara presentando a GA y su relación con DAC (texto lo provee DAC).
Panel ''GA en números'': cantidad de coches, colaboradores, agencias — EDITABLE/actualizable por DAC.
Sección de novedades fácilmente editable (noticias, links, posteos).
Testimonios de CLIENTES y de COLABORADORES sobre la empresa, con citas, videos y links a sus sitios.', 'Mes 3', 7
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-08', '4. Horarios y Destinos', 'Mostrar todos los horarios y destinos, ACLARANDO LOS DÍAS en que se realiza cada servicio.
Fácil de actualizar; preferiblemente conectado vía WS con el sistema de ventas.
Buscador por origen y destino.', 'Mes 3', 8
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-09', '5. Ingresa a tu cuenta (cliente logueado)', 'Ingreso con Google y Facebook; usuario y contraseña.
a. Compra de pasajes: ida, ida y vuelta, y pasaje abierto.
b. Marcar pasaje abierto (figura ''pendiente de implementación'' en el pliego — confirmar alcance real del WS).
c. Marcar abonos (figura ''pendiente de desarrollo'' — ídem).
d. CAMBIO DE FECHA de pasajes y levante: replicar mapa de paradas (modificable por DAC); el cambio se realiza por WS en RJ.
e. Reenviar pasaje al mail.
f. Recompra: volver a comprar el mismo pasaje con diferente fecha.
g. Solicitar/renovar CARNÉ DE ESTUDIANTE y condiciones para la solicitud; la BASE DE DATOS de estudiantes/pasajeros con descuento se aloja en el servidor web y la gestionan usuarios de GA.
h. Condiciones para compra con descuentos habilitados por el MTOP — igual a la información del link al pie de página de todo el sitio.
i. Opción ''Enviar encomienda'': lleva directamente a la web de DAC.', 'Mes 5', 9
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-10', '6. Contrataciones', 'Servicio de traslado particular mediante formulario derivado a una casilla de mail a elección de GA.
Datos: a. Nombre y apellido; b. Tipo (particular, empresa, institución pública o privada); c. Dirección, teléfono y email; d. Origen, destino, fecha de ida y vuelta; e. Cantidad de personas.', 'Mes 3', 10
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'GA-11', '7. Preguntas frecuentes + SEO GA', 'FAQ con buscador por palabras clave arriba y clasificación por temas (ver sitio ejemplo); contenido lo provee DAC.
SEO GA: mismas exigencias que DAC — keywords del sector, H1-H3, URLs amigables, metas, velocidad, sitemap, robots.txt, enlazado, redes y backlinks. Objetivo declarado del pliego —
Publicar vacantes, recibir CVs e información de interesados en vacantes o buscando trabajo en general.
Poder FILTRAR y BUSCAR ÁGILMENTE en la base de datos que se vaya generando.', 'Meses 3-4', 11
  FROM public.proyectos WHERE slug = 'grupo-agencia'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;

-- Sumate (4 bloques)
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'SU-01', 'Front-end: Formulario de postulación', 'Datos personales, CV adjunto, experiencia, formación académica, disponibilidad horaria.
Filtros por áreas o cargos: el postulante selecciona a qué puesto aplica.
Descripción detallada de los puestos: funciones, requisitos, beneficios.
Formulario dividido en pasos (MULTI-STEP) para que no sea pesado.
Carga de imágenes y archivos (CV, referencias, certificados): – Formatos permitidos: PDF, JPG, PNG, DOCX. – Límite de tamaño: máximo 5MB por archivo. – Arrastrar y soltar (drag & drop). – PREVISUALIZACIÓN del archivo antes de enviarlo.
Mensajes de error y VALIDACIONES EN TIEMPO REAL.
GUARDADO AUTOMÁTICO si el usuario cierra la página.
Imágenes comprimidas para no afectar la velocidad de carga.', 'Mes 4', 1
  FROM public.proyectos WHERE slug = 'sumate'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'SU-02', 'Front-end: Autocompletado e importación', 'Permitir que el usuario IMPORTE datos desde su LinkedIn o su CV.
SUGERENCIAS DE CARGOS según habilidades ingresadas.', 'Mes 4', 2
  FROM public.proyectos WHERE slug = 'sumate'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'SU-03', 'Front-end: Confirmación y seguimiento', 'Confirmación de postulación: mensaje o email automático de recibido.
Email de confirmación con CÓDIGO DE SEGUIMIENTO.
Seguimiento del estado: el postulante ve si está EN REVISIÓN, RECHAZADA o PRESELECCIONADO (en su cuenta).
Notificación cuando la postulación CAMBIA DE ESTADO.
Opción de EDITAR la postulación después de enviarla.
Preguntas frecuentes (FAQs) del proceso de selección — estructura similar a las FAQ de DAC y GA.', 'Mes 4', 3
  FROM public.proyectos WHERE slug = 'sumate'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'SU-04', 'Backend del portal (backoffice RRHH)', 'Administrador que puede ver y editar el backoffice del sitio.
Administrar usuarios: altas, bajas, restablecer contraseñas.
Publicar y editar vacantes; poder CERRAR el proceso.
Forma rápida y fácil de FILTRAR la base: por TODOS los campos y COMBINACIONES de los mismos.
Notificar al candidato de cambios en su postulación.
DEPURACIÓN AUTOMÁTICA de la base una vez que el CV cumple UN AÑO de presentado.
Control de intentos de envío según política de seguridad + registro de acciones por usuario administrador.', 'Mes 5', 4
  FROM public.proyectos WHERE slug = 'sumate'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;

-- Intranet (11 bloques)
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-01', 'Acceso y usuarios', 'Acceso desde ''Colaboradores'' en la web de DAC o GA → página de login con usuario y contraseña.
Credenciales proporcionadas por SISTEMAS al momento del ingreso del colaborador a la empresa.
Tras el primer inicio: cambio de contraseña OBLIGATORIO; luego cambio libre ilimitado.
ACCESO SUPER USUARIO: personas definidas por DAC que pueden ver TODOS los grupos de la Intranet.
Administrador con backoffice completo del sitio.
Administrar usuarios: altas, bajas, restablecer contraseñas.
Categorizar usuarios en GRUPOS y SUBGRUPOS + ''etiquetas'' de ENCARGADOS y TERCERIZADOS.', 'Mes 5', 1
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-02', 'Comunicados y noticias (con auditoría)', 'Subir y editar comunicados; TODAS las publicaciones identificadas por grupos y subgrupos a los que aplican, incluidas las banderas de Encargados o Tercerizados.
En todas las publicaciones: poder cargar VIDEOS de manera PRIVADA dentro del sitio, SIN acceso por canal público de YouTube o red externa.
Poder cargar imágenes y links externos si se requiere.
Cada comunicado con CONFIRMACIÓN DE LECTURA.
Forma rápida y fácil de ver si los comunicados fueron LEÍDOS O NO + AUDITORÍA DE DEMORA de lectura.
Publicar novedades: noticias de la empresa, cumpleaños, aniversarios, etc.', 'Mes 5', 2
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-03', 'Videos privados (infraestructura)', 'Almacenamiento y reproducción interna con control de acceso.
Sin exposición pública; streaming eficiente; costo de storage previsto en la operación.', 'Mes 5', 3
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-04', 'Manuales de procedimiento', 'Subir y editar manuales.
Publicados en formato HTML navegable.
Con documento PDF para BAJAR e IMPRIMIR si el usuario lo desea.', 'Mes 5', 4
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-05', 'Recibos de sueldo', 'Requiere ENLACE con el sistema de Sueldos.
El PROPIO sistema de sueldos gestiona los accesos a liquidaciones y adelantos.
Visualizar recibos de sueldo, liquidaciones y adelantos solicitados de cada usuario.
Filtro por FECHA.
Datos ultrasensibles: máxima seguridad; postura recomendada: los datos nunca salen del sistema de origen (autenticar y enlazar).', 'Mes 5', 5
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-06', 'Beneficios', 'Mostrar TODOS los beneficios de los empleados (información la proporciona DAC).
Formulario web para SOLICITAR el beneficio → llega al PRESTADOR del servicio.
Deja un CONTEO en el administrador de quiénes lo solicitaron.', 'Mes 5', 6
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-07', 'Cumpleaños', 'Publicar los cumpleaños dentro de los PRÓXIMOS 30 DÍAS.
ALERTA de los cumpleaños del MISMO SECTOR; el resto solo se ve al ingresar a la sección.', 'Mes 5', 7
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-08', 'Bienvenida', 'Página y video de bienvenida SIEMPRE ACCESIBLE para nuevos colaboradores.', 'Mes 5', 8
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-09', 'Directorio', 'Dos divisiones/pestañas: – Pestaña 1: AGENCIAS — solo correo y teléfono (sin horarios/dirección). – Pestaña 2: SECTORES — solo correo y teléfono.', 'Mes 5', 9
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-10', 'Alerta de actualización de datos', 'Cada usuario debe tener datos actualizados: foto de perfil, teléfono, mail, etc.
Cada 6 MESES enviar alerta recordando loguearse y actualizar datos personales.', 'Mes 5', 10
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;
INSERT INTO public.funcionalidades (proyecto_id, codigo, titulo, detalle, mes_objetivo, orden)
SELECT id, 'IN-11', 'Buscador global', 'Buscador para filtrar rápido dentro de TODO el sitio: comunicados, agencias, beneficios, recibos, etc.', 'Mes 5', 11
  FROM public.proyectos WHERE slug = 'intranet'
ON CONFLICT (proyecto_id, codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, detalle = EXCLUDED.detalle,
      mes_objetivo = EXCLUDED.mes_objetivo, orden = EXCLUDED.orden;

-- ── Estimaciones internas ───────────────────────────────────────────────────
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, NULL, 'Transversal' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-01'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-02'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 20, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-03'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-04'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 30, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-05'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Ambos' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-06'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'transversal' AND f.codigo = 'TR-07'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 12, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-01'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 18, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-02'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 60, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-03'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 55, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-04'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 45, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-05'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-06'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 30, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-07'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-08'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-09'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 20, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-10'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-11'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 45, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-12'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-13'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 10, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-14'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 10, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'dac' AND f.codigo = 'DAC-15'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 10, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-01'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 100, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-02'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 10, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-03'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 40, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-04'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-05'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 20, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-06'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-07'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 20, 'Ambos' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-08'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 35, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-09'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 8, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-10'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 16, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'grupo-agencia' AND f.codigo = 'GA-11'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 30, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'sumate' AND f.codigo = 'SU-01'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'sumate' AND f.codigo = 'SU-02'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'sumate' AND f.codigo = 'SU-03'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'sumate' AND f.codigo = 'SU-04'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 25, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-01'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 30, 'Ambos' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-02'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 15, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-03'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 12, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-04'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 35, 'Santiago' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-05'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 12, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-06'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 10, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-07'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 4, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-08'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 8, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-09'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 6, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-10'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
INSERT INTO public.estimaciones (funcionalidad_id, horas, responsable)
SELECT f.id, 10, 'Kaoru' FROM public.funcionalidades f
  JOIN public.proyectos p ON p.id = f.proyecto_id
 WHERE p.slug = 'intranet' AND f.codigo = 'IN-11'
ON CONFLICT (funcionalidad_id) DO UPDATE
  SET horas = EXCLUDED.horas, responsable = EXCLUDED.responsable;
