# -*- coding: utf-8 -*-
# Anexo I — Desglose funcional (alcance taxativo) — Digital Builders / DAC 2026
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER

AZUL    = HexColor("#1F4E79")
AZUL2   = HexColor("#2E6DA4")
TXT     = HexColor("#1F2933")
GRIS    = HexColor("#6B7280")
GRISCL  = HexColor("#F5F7FA")
LINEA   = HexColor("#E3E8EF")
LINEA2  = HexColor("#C5CEDA")
DACC    = HexColor("#1F4E79")
GAC     = HexColor("#1E7A46")
SUMC    = HexColor("#C46A10")
INTC    = HexColor("#5B3E8E")
TRAC    = HexColor("#4A5568")
IAC     = HexColor("#2E6DA4")
AMBAR   = HexColor("#B7791F")
VERDE   = HexColor("#2F855A")
ROJO    = HexColor("#9B2C2C")

W, H = A4
CONTENT_W = W - 44*mm

def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=11, leading=16.5, textColor=TXT)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
 "kicker": st("kicker", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=AZUL2, spaceAfter=3),
 "h1":   st("h1", fontName="Helvetica-Bold", fontSize=22, leading=27, textColor=TXT, spaceAfter=4),
 "p":    st("p", spaceAfter=8),
 "small":st("small", fontSize=9.2, leading=13, textColor=GRIS, spaceAfter=6),
 "cell": st("cell", fontSize=9.6, leading=13.2),
 "cellb":st("cellb", fontName="Helvetica-Bold", fontSize=9.6, leading=13.2, textColor=TXT),
 "cellw":st("cellw", fontName="Helvetica-Bold", fontSize=9.6, leading=13, textColor=TXT),
 "ft":   st("ft", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=TXT),
 "bul":  st("bul", fontSize=9.8, leading=13.6, leftIndent=10, firstLineIndent=-10, spaceAfter=1.5),
 "rel":  st("rel", fontSize=9.2, leading=12.8, textColor=GRIS, leftIndent=10, spaceBefore=3),
 "tag":  st("tag", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=white, alignment=TA_CENTER),
}

story = []
_first = [True]
N = [0]

def H1(title, numbered=True):
    if not _first[0]: story.append(PageBreak())
    _first[0] = False
    if numbered:
        N[0] += 1
        story.append(Paragraph(f"{N[0]:02d}", S["kicker"]))
    story.append(Paragraph(title, S["h1"]))
    rule = Table([[""]], colWidths=[28*mm], rowHeights=[2])
    rule.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-1),1.6,AZUL2),
                              ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
    story.append(rule); story.append(Spacer(1, 8*mm))

def P(t, s="p"): story.append(Paragraph(t, S[s]))

def banner(txt, color):
    lbl = Paragraph(txt, st("bn", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=color))
    t = Table([["", lbl]], colWidths=[3*mm, CONTENT_W-3*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),color),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LEFTPADDING",(0,0),(-1,-1),0),("LEFTPADDING",(1,0),(1,0),8),("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
    _pending.extend([Spacer(1, 5*mm), t, Spacer(1, 3*mm)])

_pending = []

def box(paras, pad=10):
    inner = [Paragraph(x, S["cell"]) if isinstance(x,str) else x for x in paras]
    t = Table([["", inner]], colWidths=[2.2*mm, CONTENT_W-2.2*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),GRISCL),("BACKGROUND",(0,0),(0,0),AZUL2),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("LEFTPADDING",(1,0),(1,0),pad),
        ("RIGHTPADDING",(0,0),(-1,-1),pad),("TOPPADDING",(0,0),(-1,-1),pad),("BOTTOMPADDING",(0,0),(-1,-1),pad)]))
    story.append(Spacer(1, 2*mm)); story.append(t); story.append(Spacer(1, 4*mm))

def tbl(data, widths, header=True):
    tot = sum(widths); widths = [w*CONTENT_W/tot for w in widths]
    rows = []
    for r_i, row in enumerate(data):
        out=[]
        for c_i,c in enumerate(row):
            if not isinstance(c,str): out.append(c); continue
            sty = S["cellw"] if (header and r_i==0) else (S["cellb"] if (c_i==0 and len(row)>1) else S["cell"])
            out.append(Paragraph(c, sty))
        rows.append(out)
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    style=[("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
           ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),("LINEBELOW",(0,0),(-1,-1),0.5,LINEA)]
    if header: style += [("BACKGROUND",(0,0),(-1,0),GRISCL),("LINEBELOW",(0,0),(-1,0),1.0,LINEA2)]
    t.setStyle(TableStyle(style)); story.append(t); story.append(Spacer(1, 6*mm))

TAGS = {
 "inc": ("INCLUIDO", VERDE),
 "dep": ("SUJETO A SERVICIO DE TERCEROS", AMBAR),
 "ini": ("VERSIÓN INICIAL", AZUL2),
 "evo": ("FASE EVOLUTIVA", GRIS),
}

def F(code, title, bullets, rel=None, tag="inc"):
    """Bloque de funcionalidad: código, título, tag, bullets y nota de relevamiento."""
    label, color = TAGS[tag]
    tagp = Table([[Paragraph(label, S["tag"])]], colWidths=[None])
    tagp.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),color),("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
                              ("TOPPADDING",(0,0),(-1,-1),2.5),("BOTTOMPADDING",(0,0),(-1,-1),2.5)]))
    head = Table([[Paragraph(f'<font color="#2E6DA4">{code}</font>&nbsp;&nbsp;{title}', S["ft"]), tagp]],
                 colWidths=[CONTENT_W-58*mm, 58*mm])
    head.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(1,0),(1,0),"RIGHT"),
                              ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
                              ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),4),
                              ("LINEBELOW",(0,0),(-1,-1),0.6,LINEA2)]))
    items = _pending[:] + [head, Spacer(1, 3)]
    _pending.clear()
    for b in bullets: items.append(Paragraph("•&nbsp;&nbsp;" + b, S["bul"]))
    if rel: items.append(Paragraph("<b>Definición del relevamiento:</b> " + rel, S["rel"]))
    items.append(Spacer(1, 6*mm))
    story.append(KeepTogether(items))

# =====================================================================
# PORTADA
# =====================================================================
story.append(Spacer(1, 30*mm))
story.append(Paragraph("DIGITAL BUILDERS", st("c0", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=AZUL2)))
story.append(Spacer(1, 22*mm))
story.append(Paragraph("Anexo I<br/>Desglose funcional", st("c1", fontName="Helvetica-Bold", fontSize=40, leading=46, textColor=TXT)))
story.append(Spacer(1, 6*mm))
_r = Table([[""]], colWidths=[36*mm], rowHeights=[2])
_r.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-1),2,AZUL2),("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
story.append(_r); story.append(Spacer(1, 8*mm))
story.append(Paragraph("Alcance taxativo del Proyecto Sitios Web 2027", st("c2", fontSize=18, leading=24, textColor=TXT)))
story.append(Paragraph("DAC · Grupo Agencia · Trabaja con Nosotros · Intranet", st("c3", fontSize=12, leading=18, textColor=GRIS)))
story.append(Spacer(1, 74*mm))
story.append(Paragraph("<b>Santiago Bouvier</b>", st("c4", fontSize=11.5, leading=16, textColor=TXT)))
story.append(Paragraph("Digital Builders · digitalbuilders.net", st("c5", fontSize=10.5, leading=15, textColor=GRIS)))
story.append(Paragraph("Montevideo, setiembre de 2026", st("c6", fontSize=10.5, leading=15, textColor=GRIS)))
story.append(Spacer(1, 5*mm))
story.append(Paragraph("Acompaña a la Propuesta de Desarrollo · Forma parte del alcance contractual", st("c7", fontSize=9, leading=13, textColor=GRIS)))
story.append(PageBreak())
_first[0] = False

# =====================================================================
# CÓMO LEER ESTE ANEXO
# =====================================================================
H1("Cómo leer este anexo", numbered=False)
P("Este anexo enumera, proyecto por proyecto, cada funcionalidad incluida en la propuesta de desarrollo. "
  "Cada bloque reúne los requisitos del pliego del 10/08/2026 y, cuando corresponde, la definición acordada en el relevamiento "
  "funcional respondido por DAC en setiembre de 2026.")
P("<b>Lo que figura en este anexo está incluido en el precio de desarrollo. Lo que no figura, se conversa, se dimensiona y se cotiza por separado.</b> "
  "Esa es la única regla del documento, y protege a ambas partes: DAC sabe exactamente qué va a recibir, y el equipo de desarrollo "
  "sabe exactamente qué debe construir.")
tbl([
    ["Marca","Significado"],
    ["INCLUIDO","Funcionalidad completa dentro del alcance y del precio de desarrollo"],
    ["SUJETO A SERVICIO DE TERCEROS","Incluida en el alcance; se construye en el mes previsto y su integración final se completa cuando el servicio del proveedor externo esté disponible (ver supuesto 1 de la propuesta)"],
    ["VERSIÓN INICIAL","Incluida en el alcance con la definición exacta que se describe; ampliaciones de mayor complejidad se cotizan aparte"],
    ["FASE EVOLUTIVA","Fuera del alcance de desarrollo. Se lista para que quede explícito; puede incorporarse mediante la bolsa evolutiva o cotización puntual"],
], [42*mm, 128*mm])

# =====================================================================
# 01 REQUISITOS GENERALES Y BASE TRANSVERSAL
# =====================================================================
H1("Requisitos generales y base transversal")
P("Aplican a los cuatro sitios. Son exigencias explícitas del pliego más la infraestructura común sobre la que se construyen las cuatro plataformas.")

F("T.1", "Requisitos generales del pliego (los 4 sitios)", [
 "Diseño responsive para celular y computadora en todos los sitios y todas las secciones.",
 "Carga de páginas y documentos rápida y optimizada.",
 "Funcionamiento verificado en Chrome, Firefox, Edge y Safari.",
 "HTTPS y cifrado SSL en todos los dominios.",
 "Política de privacidad clara sobre el uso de datos, publicada en cada sitio.",
 "Expiración automática de sesión tras un tiempo de inactividad (parámetro configurable).",
 "Notificación por correo ante inicios de sesión sospechosos (dispositivo o ubicación no habitual) en todos los sitios.",
 "Recuperación de contraseña en todos los sitios.",
 "Cambio de contraseña solicitado tras el primer ingreso; el usuario puede cambiarla cuantas veces quiera.",
], rel="la notificación por correo es suficiente como aviso de inicio de sesión sospechoso.")

F("T.2", "Arquitectura y entornos", [
 "Diseño completo de la base de datos para los cuatro proyectos (usuarios, roles, contenidos, postulaciones, comunicados, solicitudes, soporte).",
 "Estructura multi-sitio: backend compartido donde conviene, aislado donde es crítico.",
 "Tres entornos separados: desarrollo, validación (para pruebas de DAC) y producción.",
 "Control de versiones con revisión previa de todo cambio.",
 "Datos de prueba —nunca datos reales de clientes— en desarrollo y validación.",
], rel="DAC provee acceso al ambiente de pruebas del sistema de encomiendas (con usuarios nominados) desde el inicio, y usuarios de prueba de cada perfil para validar todos los flujos.")

F("T.3", "Autenticación", [
 "Ingreso con Google y Facebook en los sitios públicos (DAC y GA).",
 "Registro con usuario y contraseña, recuperación de contraseña, cambio obligatorio en primer ingreso donde aplique.",
 "Sitio DAC: el ingreso valida contra el sistema central de encomiendas; los usuarios y contraseñas actuales se mantienen.",
 "Sitio GA: los usuarios registrados actuales se migran; las contraseñas no son migrables, por lo que cada usuario restablece la suya en el primer ingreso.",
 "Correos transaccionales (confirmaciones, recuperación, avisos) enviados desde la infraestructura de correo de DAC.",
], rel="DAC mantiene login y contraseña porque valida contra el sistema central; en GA se migran usuarios sin contraseñas.")

F("T.4", "Seguridad transversal", [
 "Permisos a nivel de fila en toda la base de datos: cada registro define quién puede leerlo.",
 "Secretos y credenciales de los servicios web en bóveda cifrada, nunca en código ni en el navegador.",
 "Validación del lado del servidor en todo lo transaccional; límites de frecuencia contra abuso; cabeceras de seguridad y cookies protegidas.",
 "Registro de auditoría inmutable de operaciones sensibles.",
 "Doble factor en todos los accesos del equipo de desarrollo; despliegues a producción exclusivamente por el líder técnico.",
 "Cumplimiento de la Ley 18.331 de protección de datos personales.",
])

F("T.5", "Panel de administración unificado (CMS)", [
 "Un panel central con accesos diferenciados por proyecto: cada usuario administrador ve y modifica solo lo que le corresponde según su rol.",
 "Todo el contenido de los sitios (textos, imágenes, datos, secciones) actualizable por DAC sin depender de terceros.",
 "Registro de todas las acciones: quién modificó qué, cuándo y en qué área.",
 "Panel de métricas de uso de los sitios (visitas, secciones más consultadas, uso de las funciones principales), visible para administradores.",
 "Sección de soporte integrada para el período de mantenimiento: reporte de incidencias con estado, historial y trazabilidad.",
], rel="DAC solicitó «un apartado donde visualizar rápidamente métricas de los sitios»; se incorpora como panel del administrador.")

F("T.6", "Control de calidad y puesta en producción", [
 "Pruebas continuas durante el desarrollo; pruebas de aceptación por hito con DAC; control de calidad integral antes de cada salida a producción.",
 "Pruebas en los cuatro navegadores y en celular/computadora, en todos los flujos.",
 "Pruebas de flujos completos: despacho, compra de pasaje, postulación, comunicado.",
 "Puesta en producción de los cuatro sitios sobre la infraestructura de DAC, en los dominios actuales, con redirecciones de las URL anteriores para conservar el posicionamiento.",
 "Capacitación al equipo de DAC en el uso del panel y documentación de administración.",
], rel="los sitios nuevos reemplazan a los actuales en los mismos dominios; los dominios los administra DAC.")

F("T.7", "Posicionamiento en buscadores (SEO) — sitios DAC y GA", [
 "Palabras clave del sector transporte de encomiendas y pasajeros.",
 "Estructura de títulos correcta, URL amigables, metaetiquetas optimizadas.",
 "Optimización de velocidad y de la versión móvil.",
 "Mapa del sitio y archivo robots configurados; enlazado interno; integración con redes sociales.",
])

# =====================================================================
# 02 SITIO DAC
# =====================================================================
H1("Sitio DAC — encomiendas y servicios logísticos")
P("Sitio público de encomiendas: institucional, despacho en línea, rastreo y reclamos, cuenta de cliente y funciones para clientes corporativos.")

banner("Institucional y contenidos", DACC)
F("D.1", "Inicio", [
 "Diseño visual moderno y accesible.",
 "Menú fijo, visible en todas las páginas: INICIO / LA EMPRESA / ENVÍOS / SERVICIOS / TARIFAS / PASAJES / INGRESÁ A TU CUENTA.",
 "ENVÍOS con subsecciones «Hacé tu envío» y «Rastreá tu envío».",
 "Pie de página con: Preguntas frecuentes, Sumate, Agencias y Contacto.",
 "Todo el contenido editable por DAC desde el panel.",
])
F("D.2", "La Empresa", [
 "Presentación de DAC y su relación con Grupo Agencia (texto provisto por DAC), con enlaces a «Hacé tu envío», «Agencias», «Rastreo» y «Trabajá con nosotros».",
 "Panel «DAC en números» (pedidos, colaboradores, agencias, flota, superficie) editable desde el panel.",
 "Video institucional embebido y enlace al canal de YouTube.",
 "Novedades: publicación rápida de noticias, enlaces y posteos, con fecha de vigencia (publicación y retiro automáticos).",
 "Testimonios de clientes: citas y videos, con enlaces a sus sitios.",
], rel="«DAC en números» es editable por DAC, como hoy; novedades con fecha de vigencia (hoy es manual).")
F("D.3", "Servicios", [
 "Cinco subsecciones: (1) Servicios logísticos —fulfillment y almacenamiento, última milla, abastecimiento a tiendas, contra reembolso, consolidación—; (2) E-commerce; (3) Servicios de valor agregado —etiquetado, ensobrado, giros, facturación, confirmación de entrega—; (4) Servicios postales; (5) Servicios internacionales; más el acceso a Venta de pasajes.",
 "Presentación animada y creativa de cada servicio, no solo texto. Diseño propuesto por Digital Builders sobre el manual de marca de DAC, con dos rondas de revisión por sección.",
 "Textos y material gráfico provistos por DAC.",
], rel="DAC no tiene referencias definidas y prefiere que se propongan; aporta el material gráfico.")
F("D.4", "Preguntas frecuentes, Agencias, Sumate y Contacto", [
 "Preguntas frecuentes con buscador por palabras clave y clasificación por tema; contenido provisto por DAC.",
 "Agencias: listado con datos, horarios y ubicación, administrado desde el panel de DAC, con marca de aplicación a encomiendas, pasajes o ambos (catálogo único compartido con GA y la Intranet).",
 "Sumate: acceso directo al portal Trabajá con Nosotros.",
 "Contacto: datos y formulario a casilla configurable.",
], rel="las agencias se administran desde el panel de DAC y se marcan según apliquen a pasajes, encomiendas o ambos.")

banner("Envíos", DACC)
F("D.5", "Hacé tu envío — despacho en línea", [
 "Despacho equivalente al que se realiza en un mostrador de DAC, integrado con los servicios web del sistema de encomiendas.",
 "Requiere usuario registrado y con sesión iniciada.",
 "Al confirmar: emisión de la factura por el sistema de encomiendas y etiqueta lista para imprimir (recibida del servicio en formato imprimible).",
 "Libreta de destinatarios y direcciones frecuentes propia del sitio: guardar, editar y borrar; botón «guardar dirección frecuente»; buscador en la libreta.",
 "Direcciones de levante múltiples y editables.",
 "Gestión de datos del cliente: domicilios, teléfono y demás datos de contacto.",
 "Medios de pago según definición del sistema de encomiendas: cuenta corriente, cobro al entregar o cobro al remitente mediante Fiserv.",
 "Manejo de errores del servicio a mitad del despacho: mensaje claro, reintento o anulación sin dejar envíos a medio generar.",
], rel="la factura la emite el sistema de encomiendas; la etiqueta la devuelve el servicio; la libreta de direcciones es propia del sitio; los medios de pago son los indicados.")
F("D.6", "Servicios de valor agregado en el despacho", [
 "Posibilidad de agregar servicios de valor agregado al envío desde el despacho web (bolsas, embalajes, devolución de documento firmado y los que el sistema habilite).",
 "Catálogo de servicios tomado del sistema de encomiendas: el sitio muestra los que el servicio devuelve como disponibles para ese envío.",
], rel="hoy solo están habilitados devolución de documento firmado y bolsas; el resto está en desarrollo del lado del sistema de encomiendas.", tag="dep")
F("D.7", "Rastreá tu envío", [
 "Cualquier persona ingresa un número de rastreo y ve el estado del envío, sin iniciar sesión.",
 "Línea de estados tipo checklist, con fecha y hora de cada etapa, según el catálogo de estados del sistema de encomiendas.",
 "Datos detallados (dirección de entrega, destinatario) visibles solo con sesión iniciada.",
 "Si el envío tiene un reclamo asociado, se muestra junto con sus datos.",
], rel="el servicio devuelve el detalle de estados con fecha y hora; DAC comparte el catálogo completo de estados.")
F("D.8", "Reclamos", [
 "Inicio de reclamo desde la guía rastreada, desde el historial («gestionar paquete») o completando número de rastreo y teléfono.",
 "Tipos: rotura, falta de contenido, extravío, entrega incorrecta, mal despachado —lista validada por el servicio, ampliable a futuro.",
 "Adjuntos obligatorios: factura de compra o documentación que respalde el monto reclamado; evidencias en imagen o PDF con validación de formato y tamaño.",
 "Las condiciones de apertura las establece el sistema de encomiendas; si no se cumplen, el sitio muestra un mensaje claro.",
 "Estado del reclamo visible para el cliente.",
 "Las evidencias se envían al sistema de encomiendas junto con el reclamo (no se conservan copias en el sitio).",
], rel="el servicio de reclamos está en desarrollo del lado del sistema de encomiendas; la idea de DAC es que las evidencias se alojen en ese sistema.", tag="dep")

banner("Cuenta de cliente", DACC)
F("D.9", "Registro e ingreso", [
 "Registro con diseño moderno e intuitivo; contenido de la página editable por DAC.",
 "Ingreso con Google y Facebook, o usuario y contraseña.",
 "Mapa para confirmar la dirección al registrarse (API de mapas contratada por DAC); la dirección queda guardada para futuros despachos.",
], rel="DAC usa y paga la API de Google Maps; existe además una API de Ica en desarrollo para el mismo fin.")
F("D.10", "Historial de envíos", [
 "Resumen de todos los envíos del cliente con filtros por fecha y por estado.",
 "Columnas: destinatario, quién paga, tipo de paquete o producto, monto cobrado o a cobrar, monto sin descuento, último estado, reclamo (si tiene, o botón para ingresarlo).",
 "Exportación con la opción «cliente paga» para conciliar contra la factura.",
 "Reenvío y reimpresión de comprobante de envío y de etiqueta.",
], rel="existe servicio de historial y devuelve los datos necesarios, incluido el monto sin descuento.")
F("D.11", "Indicadores para clientes corporativos", [
 "Visibles solo para clientes corporativos (la distinción la hace el sistema de ventas).",
 "Cantidad despachada; cantidad entregada; no entregados con enlace al historial; promedio de días de entrega; reclamos por estado con enlace; facturado en el mes.",
 "Los datos los devuelve el servicio; los cálculos y la presentación se hacen en el sitio, como hoy.",
])
F("D.12", "Carga masiva de envíos", [
 "Clientes corporativos autorizados cargan un archivo xlsx (modelo provisto por DAC) con las columnas en el orden establecido.",
 "La carga genera los envíos en el sistema de encomiendas mediante el servicio existente; hasta 400 etiquetas por solicitud.",
 "Impresión de las etiquetas de todos los envíos generados.",
 "Direcciones no localizadas: se resaltan y quedan editables en pantalla para que el cliente las corrija antes de confirmar.",
 "Es el mismo flujo para el archivo provisto por DAC y para el módulo masivo del cliente con sesión iniciada.",
], rel="se usa el método de carga masiva existente; DAC comparte los archivos modelo; la corrección en pantalla replica el comportamiento actual.")
F("D.13", "Gestión de facturación y pagos (corporativos)", [
 "Facturas y notas de crédito por mes.",
 "Detalle de facturación mensual descargable (el mismo detalle que hoy reciben por correo).",
 "Clientes con cuenta controlada: selección de envíos y pago mediante Fiserv; la conciliación la aplica el sistema de encomiendas.",
], rel="la pasarela es Fiserv (contrato vigente); el servicio del detalle de facturación está en desarrollo del lado del sistema de ventas.", tag="dep")
F("D.14", "Operación en nombre del cliente (usuarios internos)", [
 "Usuarios internos de DAC ingresan con su propio usuario; el servicio identifica su perfil y permite elegir en nombre de qué cliente operar.",
 "Consulta de información y generación de envíos en nombre del cliente, sin conocer su contraseña.",
 "Los controles de autorización los aplica el sistema de encomiendas; el sitio registra en auditoría qué usuario operó por qué cliente y cuándo.",
], rel="el mecanismo ya está soportado por el servicio del sistema de encomiendas.")

banner("Tarifas", DACC)
F("D.15", "Simulador de envíos", [
 "Simulación de un despacho para conocer la tarifa aproximada, mediante el servicio de costos del sistema de encomiendas.",
 "Datos de entrada: origen, destino, tipo de paquete o producto (los que el servicio requiere).",
 "Contempla la tasa postal cuando corresponde, calculada por el servicio.",
 "Muestra los servicios de valor agregado disponibles (bolsas, embalajes, rampa y el resto del catálogo habilitado).",
 "Con sesión iniciada, respeta los acuerdos comerciales del cliente; sin sesión, cotiza como cliente público.",
], rel="existe el servicio de cotización; el sistema de encomiendas devuelve el costo y respeta acuerdos del cliente con sesión iniciada.")

# =====================================================================
# 03 GRUPO AGENCIA
# =====================================================================
H1("Sitio Grupo Agencia — venta de pasajes")
P("Sitio público de pasajes: institucional, venta en línea completa, cuenta de cliente, vales y cupones, reserva de hoteles en versión inicial.")

banner("Institucional y contenidos", GAC)
F("G.1", "Inicio", [
 "Diseño visual moderno y accesible.",
 "Menú fijo en todas las páginas: INICIO / LA EMPRESA / DESTINOS Y HORARIOS / COMPRÁ TU PASAJE / INGRESÁ A TU CUENTA.",
 "Pie de página con: Preguntas frecuentes, Descuentos, Contrataciones y Trabajá con Nosotros.",
 "Buscador principal de destinos y horarios también en la página de inicio.",
])
F("G.2", "La Empresa", [
 "Presentación de GA y su relación con DAC (texto provisto por DAC).",
 "Panel «GA en números» (coches, colaboradores, agencias) editable desde el panel.",
 "Novedades con fecha de vigencia; testimonios de clientes y de colaboradores, con citas, videos y enlaces.",
])
F("G.3", "Horarios y destinos", [
 "Buscador por origen y destino; para cada servicio, los días en que se realiza.",
 "Información obtenida del sistema de ventas mediante servicio web (según fecha, origen y destino devuelve los servicios habilitados).",
], rel="el sistema devuelve, según fecha, origen y destino, los servicios habilitados.")
F("G.4", "Descuentos", [
 "Sección con los tipos de descuento vigentes (estudiantes, MTOP y los que DAC defina), condiciones para acceder y enlace a la solicitud desde la cuenta.",
 "Contenido provisto por DAC; administrable desde el panel.",
], rel="los descuentos se gestionan con la misma lógica que el carné de estudiante.")
F("G.5", "Contrataciones", [
 "Formulario de traslado particular: nombre y apellido; tipo (particular, empresa, institución pública o privada); dirección, teléfono y correo; origen, destino, fechas de ida y vuelta; cantidad de personas.",
 "Derivado a una casilla de correo única y configurable.",
], rel="únicamente el formulario, a casilla única.")
F("G.6", "Preguntas frecuentes", [
 "Buscador por palabras clave y clasificación por tema; contenido provisto por DAC.",
])

banner("Compra de pasajes", GAC)
F("G.7", "Buscador y flujo de compra", [
 "Buscador de origen y destino conectado con el sistema de ventas; respuesta ágil.",
 "Al ingresar origen y destino: todos los horarios del día y medio día siguiente (información de 36 horas, compuesta de dos consultas al servicio).",
 "Al elegir horario: cantidad de pasajeros, fecha de viaje, propuesta automática de ida y vuelta con opción de solo ida.",
 "Selección de asiento sobre el mapa del coche devuelto por el servicio.",
 "Contador de 15 minutos visible durante toda la compra desde la selección del asiento; el bloqueo y la liberación del asiento los administra el sistema de ventas; el parámetro de minutos es editable por DAC.",
 "Modalidades: ida y vuelta, solo ida, pasaje abierto, vuelta abierta, compra para un tercero (documento y nombre del pasajero, que no necesita estar registrado) y documento extranjero.",
 "Compra rápida como invitado, sin registrarse como cliente.",
 "Pago mediante Fiserv, reutilizando el contrato e integración vigentes.",
 "Datos del pasajero: validación de cédula uruguaya y RUT; para «otros documentos» se acepta cualquier valor, controlando que no duplique un documento ya cargado.",
], rel="todas las modalidades listadas están soportadas hoy por el servicio de ventas; el bloqueo del asiento lo administra el sistema de pasajes; la pasarela es Fiserv con el mismo contrato.")
F("G.8", "Encuesta post-viaje", [
 "Envío automático por correo a todos los clientes que compran por web.",
 "Se envía el día del viaje, tres horas después de la hora programada de llegada.",
 "Preguntas definidas por DAC y administrables desde el panel; resultados consultables por servicio y período.",
], rel="el servicio no expone la hora real de llegada, por lo que se usa la hora programada; las preguntas las define la empresa.")

banner("Cuenta de cliente", GAC)
F("G.9", "Ingreso y gestión de pasajes", [
 "Ingreso con Google y Facebook, o usuario y contraseña.",
 "Compra desde la cuenta: ida, ida y vuelta y pasaje abierto.",
 "Cambio de fecha y cambio de levante mediante el servicio existente (mantiene el importe; el servicio informa si el pasaje admite cambio); mapa de paradas presentado en el sitio y editable por DAC.",
 "Reenvío del pasaje por correo.",
 "Recompra: mismo pasaje con otra fecha, verificando disponibilidad y precio vigente, con los datos ya precargados.",
 "Abonos: marcado y canje de boletos del abono (la compra del abono se mantiene presencial, según definición operativa de DAC).",
 "Opción «Enviar encomienda» que lleva al sitio de DAC.",
], rel="el cambio de fecha existe y mantiene importe; el mapa de paradas es propio de la web; la venta de abonos requiere orden de compra física, por lo que en el sitio solo se marcan y canjean.")
F("G.10", "Carné de estudiante y descuentos", [
 "Solicitud y renovación del carné de estudiante desde la cuenta: cédula y comprobante de estudios adjuntos.",
 "Validación por un usuario de GA en el panel: aprobación o rechazo con aviso al solicitante.",
 "Vigencia del 1/3 al 28/2, con renovación anual.",
 "La base de estudiantes y pasajeros con descuento se aloja en el sitio y la gestionan usuarios de GA; el descuento se aplica en la compra según esa base.",
 "Condiciones de compra con descuentos habilitados por el MTOP, iguales a la información del pie de página.",
], rel="se exige cédula y comprobante; un usuario de GA valida; vigencia 1/3 al 28/2; la validación la hace la web.")

banner("Vales, cupones y hoteles", GAC)
F("G.11", "Vales a bordo", [
 "En las localidades con vale de a bordo por compra web: envío del vale por correo al pasajero, con código único.",
 "Monto del vale editable por DAC desde el panel (gestión propia del sitio, sin servicio web).",
 "Página de verificación para los comercios que canjean: ingreso del código, validación de vigencia y registro del uso por única vez; acceso con usuario por comercio.",
 "Diseño de la página de canje a nuevo, validado con DAC.",
], rel="hoy el canje es presencial en dos locales y no opera por web; la idea es un código que se valida en la web al momento del canje.")
F("G.12", "Cupones OCA e Itaú", [
 "Generación de listas de cupones con valores predeterminados editables y códigos de verificación, para entregar a los comercios.",
 "El cupón se aplica como descuento en la compra web; se genera y valida en el sitio, sin conciliación externa.",
], rel="convenios firmados, Itaú operativo; funciona como descuento aplicado en la web; se genera solo en la web; no requiere conciliación.")
F("G.13", "Reserva de hoteles y estadías — versión inicial", [
 "Tras la compra del pasaje, oferta de reserva de hotel en la localidad de destino («Reservá tu hotel en Salto aquí»).",
 "Una o dos opciones de hotel por localidad, administradas desde el panel del sitio.",
 "Disponibilidad de habitaciones cargada y mantenida desde el panel (por GA o por el hotel con un usuario propio).",
 "Selección de habitación y pago en la misma página mediante Fiserv; confirmación por correo al pasajero y aviso al hotel.",
 "Los convenios comerciales con los hoteles son gestionados por DAC.",
 "Fuera de esta versión: integración con sistemas de reservas de hoteles y venta de entradas a espectáculos (fase evolutiva).",
], rel="hoy no está desarrollado; DAC manifestó interés en extenderlo a venta de entradas, lo que se cotiza como evolutivo.", tag="ini")

# =====================================================================
# 04 SUMATE
# =====================================================================
H1("Trabajá con Nosotros (Sumate)")
P("Portal de empleo sumate.dac.com.uy, accesible desde DAC y GA: postulaciones, seguimiento y backoffice de RRHH.")

banner("Portal del postulante", SUMC)
F("S.1", "Vacantes y postulación", [
 "Publicación de vacantes con descripción detallada: funciones, requisitos, beneficios.",
 "Filtro por área o cargo; el postulante elige a qué puesto aplica; postulación espontánea sin vacante específica (entra al mismo flujo de estados).",
 "Un postulante puede postularse a varias vacantes.",
 "Formulario dividido en pasos: datos personales, CV adjunto, experiencia, formación, disponibilidad horaria.",
 "Validaciones en tiempo real y mensajes de error claros.",
 "Guardado automático: si el postulante cierra la página, retoma donde quedó.",
 "Carga de archivos (CV, referencias, certificados): PDF, JPG, PNG y DOCX; hasta 5 MB por archivo; arrastrar y soltar; previsualización antes de enviar; imágenes comprimidas.",
])
F("S.2", "Autocompletado desde el CV y sugerencia de cargos", [
 "Lectura automática del CV subido para precompletar el formulario (experiencia, formación, contacto); el postulante revisa y confirma.",
 "Campo para el enlace al perfil de LinkedIn.",
 "Sugerencia de cargos según las habilidades ingresadas.",
], rel="enlace a LinkedIn más lectura automática del CV es suficiente para el requisito de importación.")
F("S.3", "Confirmación y seguimiento", [
 "Confirmación de postulación por mensaje y correo con código de seguimiento.",
 "Estado visible para el postulante: en revisión, rechazada, preseleccionado.",
 "Notificación por correo ante cada cambio de estado.",
 "Edición de la postulación después de enviada.",
 "Preguntas frecuentes del proceso de selección.",
], rel="cada cambio de estado envía notificación.")

banner("Backoffice RRHH", SUMC)
F("S.4", "Administración y búsqueda", [
 "Hasta 10 usuarios administradores (administración, gerencia, RRHH) con las mismas capacidades: alta y baja de usuarios, restablecer contraseñas.",
 "Publicar, editar y cerrar vacantes.",
 "Búsqueda y filtrado de la base por cargo, área, formación, disponibilidad, fecha de postulación y estado, combinables entre sí (campos a confirmar con RRHH).",
 "Cambio de estado de cada postulación con notificación al candidato.",
 "Registro de acciones por usuario administrador; control de intentos de envío según política de seguridad.",
], rel="10 usuarios, sin necesidad de roles diferenciados; los campos de búsqueda se confirman con RRHH al inicio.")
F("S.5", "Búsqueda por afinidad y ranking de candidatos", [
 "Al publicar una vacante, lista de postulantes ordenada por afinidad con el perfil solicitado.",
 "Búsqueda en lenguaje natural sobre toda la base («chofer con categoría profesional y disponibilidad nocturna»).",
 "El sistema ordena y sugiere; RRHH siempre decide.",
], rel="módulo de inteligencia aplicada; ver sección 06.")
F("S.6", "Migración y depuración", [
 "Migración de la base actual de sumate.dac.com.uy (~9.000 registros con sus archivos), entregada por DAC.",
 "Depuración automática: borrado físico de cada CV (datos y archivos) al cumplir un año de presentado, sin aviso previo al postulante.",
], rel="la base actual se migra; el borrado es físico y no requiere notificación.")

# =====================================================================
# 05 INTRANET
# =====================================================================
H1("Intranet — portal de colaboradores")
P("Sitio privado para empleados y prestadores de servicio (más de 1.000 usuarios), accesible desde «Colaboradores» en DAC y GA.")

banner("Acceso, usuarios y permisos", INTC)
F("I.1", "Acceso y administración de usuarios", [
 "Ingreso con usuario y contraseña; credenciales entregadas por Sistemas al ingreso del colaborador.",
 "Cambio de contraseña obligatorio en el primer ingreso; luego libre.",
 "Altas, bajas y restablecimiento de contraseñas desde el panel (carga manual por Sistemas).",
 "Cada usuario pertenece a un grupo y un sector; etiquetas transversales de Encargado y Tercerizado.",
 "Superusuario: personas definidas por DAC con lectura de todos los grupos; edición y creación reservadas al administrador.",
 "Foto de perfil subida por el propio colaborador, sin aprobación previa.",
], rel="altas manuales; un funcionario pertenece a un solo grupo y sector; encargados como propiedad fuera de los grupos; superusuario solo lectura.")

banner("Comunicación interna", INTC)
F("I.2", "Comunicados y noticias", [
 "Publicación y edición de comunicados dirigidos a grupos, subgrupos y etiquetas (Encargados, Tercerizados).",
 "Cada comunicado admite imágenes, enlaces externos y videos privados alojados en el sitio (sin YouTube ni canales públicos), de hasta 3 minutos.",
 "Confirmación de lectura: el comunicado se considera leído al abrirlo.",
 "Auditoría de lectura por comunicado: quién lo leyó, quién no, y demora desde la publicación; reporte consultable por administradores y superusuarios.",
 "Novedades de la empresa: noticias, aniversarios y similares.",
], rel="leído al abrir; videos privados internos de hasta 3 minutos.")
F("I.3", "Manuales de procedimiento", [
 "Carga de manuales por el administrador en formato HTML navegable (contenido en Word o PDF provisto por DAC), organizados por tema.",
 "PDF descargable e imprimible por manual, subido como archivo.",
 "Buscables desde el buscador global y consultables por el asistente de la Intranet.",
], rel="los carga el administrador; el PDF se sube como archivo; hoy hay 9 manuales y DAC prevé sumar más.")
F("I.4", "Asistente de consultas de la Intranet", [
 "Consulta en lenguaje natural sobre manuales, comunicados, beneficios y directorio; respuesta con cita y enlace al documento fuente.",
 "Respeta los permisos del usuario: solo responde con contenido que ese usuario puede ver.",
 "Lo que no está en la Intranet, lo indica y deriva.",
], rel="módulo de inteligencia aplicada; ver sección 06.")

banner("Servicios al colaborador", INTC)
F("I.5", "Recibos de sueldo", [
 "Acceso directo (enlace) al portal del sistema de sueldos, que gestiona por sí mismo la autenticación y la consulta de recibos, liquidaciones y adelantos.",
 "Los recibos no se almacenan en la Intranet ni forman parte de su buscador.",
], rel="solo un enlace a la página del sistema de sueldos (Saico, con portal propio).")
F("I.6", "Beneficios", [
 "Listado de todos los beneficios (información provista por DAC), administrable desde el panel.",
 "Formulario de solicitud por beneficio, enviado al correo del prestador configurado para ese beneficio.",
 "Conteo de solicitudes por beneficio visible en el panel.",
], rel="cada beneficio tiene un correo configurable; el conteo es suficiente.")
F("I.7", "Módulo de solicitudes y calendario interno", [
 "Solicitud de préstamo: el colaborador indica monto, motivo y forma de pago; una sola solicitud vigente por persona; llega a RRHH; estados «en análisis», «aprobado» y «cancelado» gestionados desde el panel; el colaborador ve solo su solicitud.",
 "Solicitud de licencia: el colaborador la registra con fechas; llega a los encargados de su sector, que la aprueban o deniegan desde el panel; el colaborador ve el estado.",
 "Reservas de convenios: anotación a beneficios con fecha y cupo, con visualización de fechas tomadas.",
 "Calendario interno: vista mensual con comunicados y eventos de la empresa (compartida) y, para cada usuario, sus licencias y reservas (personal).",
 "Fuera de esta versión: sincronización con Google Calendar (fase evolutiva).",
], rel="préstamos replica el flujo actual por correo; licencias en versión simple (encargado del sector aprueba); Google Calendar como evolutivo.")
F("I.8", "Cumpleaños", [
 "Publicación de los cumpleaños de los próximos 30 días, con los del día resaltados.",
 "Aviso al ingresar al sitio de los cumpleaños del mismo sector; el resto se consulta en la sección.",
 "Fecha de nacimiento y sector cargados en el alta del usuario; sin opción de exclusión.",
], rel="datos cargados en el alta; no se contempla opción de no aparecer.")
F("I.9", "Directorio", [
 "Dos pestañas: Agencias y Sectores, con correo y teléfono.",
 "Datos cargados por el administrador, sobre el mismo catálogo de agencias del sitio DAC, con campos visibles solo en la Intranet (por ejemplo, teléfono del encargado).",
], rel="mismo catálogo que las otras páginas, con información adicional no pública.")
F("I.10", "Bienvenida, actualización de datos y buscador", [
 "Página y video de bienvenida para nuevos colaboradores, accesible en todo momento para usuarios con sesión iniciada.",
 "Alerta semestral al ingresar al sitio recordando actualizar datos personales (foto, teléfono, correo).",
 "Buscador global sobre comunicados, agencias, beneficios y manuales.",
], rel="bienvenida para usuarios con sesión; alerta al ingresar; los recibos no entran al buscador.")

# =====================================================================
# 06 INTELIGENCIA APLICADA
# =====================================================================
H1("Módulos de inteligencia aplicada")
P("Dos módulos de uso interno, incluidos en el desarrollo al contratar la operación IA. Su alcance exacto es el que se describe aquí.")
F("IA.1", "Asistente de consultas de la Intranet", [
 "Responde exclusivamente sobre el contenido cargado en la Intranet: manuales, comunicados, beneficios y directorio.",
 "Cita siempre la fuente y enlaza al documento; si la respuesta no está en la Intranet, lo indica y deriva.",
 "Hereda los permisos del usuario con sesión iniciada: no puede leer lo que ese usuario no puede leer.",
 "El contenido reside en la base de datos del proyecto; a la IA viaja únicamente el fragmento necesario para responder cada consulta, en forma transitoria.",
 "Operación incluida: procesamiento, monitoreo de calidad, incorporación del contenido nuevo, ajuste del comportamiento e informe mensual de consultas frecuentes; hasta 15.000 consultas mensuales.",
])
F("IA.2", "Lectura de CV, ranking y búsqueda por afinidad (Sumate)", [
 "Lectura del CV subido para precompletar el formulario de postulación; el postulante revisa y confirma.",
 "Al publicar una vacante, ordenamiento de los postulantes por afinidad con el perfil.",
 "Búsqueda en lenguaje natural sobre la base completa de postulaciones.",
 "El sistema ordena y sugiere; la decisión es siempre de RRHH.",
 "El procesamiento se realiza sobre los datos que el propio postulante carga, dentro del flujo de postulación, con aviso en la política de privacidad del portal.",
])

# =====================================================================
# 07 EXCLUSIONES Y FASES EVOLUTIVAS
# =====================================================================
H1("Fuera del alcance y fases evolutivas")
P("Para que no queden zonas grises, se lista explícitamente lo que esta propuesta no incluye. Cualquiera de estos puntos puede "
  "incorporarse más adelante mediante la bolsa evolutiva o una cotización puntual.")
tbl([
    ["Ítem","Situación"],
    ["Venta de abonos en línea","Se mantiene presencial por definición operativa de DAC (requiere orden de compra física). El sitio marca y canjea boletos del abono"],
    ["Integración con sistemas de reservas de hoteles","La versión inicial administra la disponibilidad desde el panel; integrar sistemas hoteleros externos es fase evolutiva"],
    ["Venta de entradas a espectáculos con reserva de asiento","Interés manifestado por DAC en el relevamiento; se dimensiona y cotiza aparte"],
    ["Sincronización de licencias con Google Calendar","Fase evolutiva del módulo de solicitudes"],
    ["Facturación electrónica del lado del sitio","No aplica: la factura la emite el sistema de encomiendas"],
    ["Recibos de sueldo dentro de la Intranet","No aplica: acceso directo al portal del sistema de sueldos, según definición de DAC"],
    ["Migración de contraseñas de usuarios de GA","No es técnicamente posible; cada usuario restablece la suya en el primer ingreso"],
    ["Desarrollo o modificación de servicios web de terceros","Los servicios del sistema de encomiendas y del sistema de ventas los desarrollan sus proveedores; el sitio los consume"],
    ["Producción de contenidos","Textos, fotografías, videos, preguntas frecuentes y manuales son provistos por DAC; el desarrollo incluye su carga inicial"],
    ["Infraestructura, dominios, correo y servicios de terceros","Contratados y administrados por DAC (hosting, mapas, correo, pasarela)"],
    ["Funcionalidades no listadas en este anexo","Se conversan, se dimensionan y se cotizan por separado"],
], [62*mm, 108*mm])
P("Este anexo forma parte de la Propuesta de Desarrollo de Digital Builders para el Proyecto Sitios Web 2027 y se integra al contrato como definición del alcance.", "small")

# =====================================================================
def on_page(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Helvetica", 8); canvas.setFillColor(GRIS)
        canvas.drawString(22*mm, 13*mm, "Digital Builders  ·  Anexo I — Desglose funcional  ·  Proyecto Sitios Web 2027")
        canvas.drawRightString(W-22*mm, 13*mm, f"{doc.page}")
    canvas.restoreState()

doc = BaseDocTemplate("/home/claude/dac/DAC_anexo1_desglose_funcional.pdf", pagesize=A4,
                      leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=24*mm)
frame = Frame(22*mm, 24*mm, CONTENT_W, H-46*mm, id="f")
doc.addPageTemplates([PageTemplate(id="t", frames=[frame], onPage=on_page)])
doc.build(story)
print("OK anexo")
