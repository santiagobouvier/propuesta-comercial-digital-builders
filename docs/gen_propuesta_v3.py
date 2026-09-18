# -*- coding: utf-8 -*-
# Propuesta DAC 2026 v3 — Digital Builders — diseño minimalista
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

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
OKC     = HexColor("#EAF5EE")
IABG    = HexColor("#F0F4FA")

W, H = A4
CONTENT_W = W - 44*mm

def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=11, leading=16.5, textColor=TXT)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
 "kicker": st("kicker", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=AZUL2, spaceAfter=3),
 "h1":   st("h1", fontName="Helvetica-Bold", fontSize=22, leading=27, textColor=TXT, spaceAfter=4),
 "h2":   st("h2", fontName="Helvetica-Bold", fontSize=13.5, leading=18, textColor=AZUL, spaceBefore=12, spaceAfter=6),
 "p":    st("p", spaceAfter=8),
 "small":st("small", fontSize=9.2, leading=13, textColor=GRIS, spaceAfter=6),
 "cell": st("cell", fontSize=9.6, leading=13.2),
 "cellb":st("cellb", fontName="Helvetica-Bold", fontSize=9.6, leading=13.2, textColor=TXT),
 "cellw":st("cellw", fontName="Helvetica-Bold", fontSize=9.6, leading=13, textColor=TXT),
}

story = []
_first_h1 = [True]
SECTION_N = [0]

def P(t, s="p"):
    if s == "h1":
        if not _first_h1[0]:
            story.append(PageBreak())
        _first_h1[0] = False
        SECTION_N[0] += 1
        # separar "N. Título" → kicker + título
        num, _, title = t.partition(". ")
        story.append(Paragraph(f"{int(num):02d}", S["kicker"]))
        story.append(Paragraph(title, S["h1"]))
        rule = Table([[""]], colWidths=[28*mm], rowHeights=[2])
        rule.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-1),1.6,AZUL2),
                                  ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
        story.append(rule)
        story.append(Spacer(1, 9*mm))
        return
    story.append(Paragraph(t, S[s]))

def SP(h=4): story.append(Spacer(1, h*1.6))
def PB(): pass  # los saltos los maneja P(..., "h1")

def banner(txt, color=AZUL):
    lbl = Paragraph(txt, st("bn", fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=color))
    t = Table([["", lbl]], colWidths=[3*mm, CONTENT_W-3*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(0,0),color),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LEFTPADDING",(0,0),(-1,-1),0),("LEFTPADDING",(1,0),(1,0),8),
        ("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),
    ]))
    story.append(Spacer(1, 4*mm)); story.append(t); story.append(Spacer(1, 3*mm))

def box(paras, bg=GRISCL, border=None, pad=10):
    inner = [Paragraph(x, S["cell"]) if isinstance(x,str) else x for x in paras]
    t = Table([["", inner]], colWidths=[2.2*mm, CONTENT_W-2.2*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),bg),
        ("BACKGROUND",(0,0),(0,0),AZUL2),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0),("LEFTPADDING",(1,0),(1,0),pad),
        ("RIGHTPADDING",(0,0),(-1,-1),pad),
        ("TOPPADDING",(0,0),(-1,-1),pad),("BOTTOMPADDING",(0,0),(-1,-1),pad),
    ]))
    story.append(Spacer(1, 2*mm)); story.append(t); story.append(Spacer(1, 4*mm))

def tbl(data, widths, header=True, hbg=None, zebra=False):
    # escalar anchos al ancho de contenido nuevo
    tot = sum(widths); widths = [w*CONTENT_W/tot for w in widths]
    rows = []
    for r_i, row in enumerate(data):
        out = []
        for c_i, c in enumerate(row):
            if not isinstance(c, str): out.append(c); continue
            if header and r_i == 0: sty = S["cellw"]
            elif c_i == 0 and len(row) > 1: sty = S["cellb"]
            else: sty = S["cell"]
            out.append(Paragraph(c, sty))
        rows.append(out)
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LINEBELOW",(0,0),(-1,-1),0.5,LINEA),
    ]
    if header:
        style += [("BACKGROUND",(0,0),(-1,0),GRISCL),
                  ("LINEBELOW",(0,0),(-1,0),1.0,LINEA2)]
    t.setStyle(TableStyle(style))
    story.append(t); story.append(Spacer(1, 6*mm))

PAGO = "6 cuotas mensuales de USD 5.417: la primera al inicio del proyecto y las siguientes cada 30 días"

# ============================================================
# PORTADA
# ============================================================
story.append(Spacer(1, 30*mm))
story.append(Paragraph("DIGITAL BUILDERS", st("c0", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=AZUL2)))
story.append(Spacer(1, 22*mm))
story.append(Paragraph("Propuesta de<br/>desarrollo", st("c1", fontName="Helvetica-Bold", fontSize=40, leading=46, textColor=TXT)))
story.append(Spacer(1, 6*mm))
_r = Table([[""]], colWidths=[36*mm], rowHeights=[2])
_r.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-1),2,AZUL2),("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
story.append(_r)
story.append(Spacer(1, 8*mm))
story.append(Paragraph("Proyecto Sitios Web 2027", st("c2", fontSize=18, leading=24, textColor=TXT)))
story.append(Paragraph("DAC · Grupo Agencia · Trabaja con Nosotros · Intranet", st("c3", fontSize=12, leading=18, textColor=GRIS)))
story.append(Spacer(1, 78*mm))
story.append(Paragraph("<b>Santiago Bouvier</b>", st("c4", fontSize=11.5, leading=16, textColor=TXT)))
story.append(Paragraph("Digital Builders · digitalbuilders.net", st("c5", fontSize=10.5, leading=15, textColor=GRIS)))
story.append(Paragraph("Montevideo, setiembre de 2026", st("c6", fontSize=10.5, leading=15, textColor=GRIS)))
story.append(Spacer(1, 5*mm))
story.append(Paragraph("En respuesta a la licitación del 10/08/2026 · Válida por 60 días", st("c7", fontSize=9, leading=13, textColor=GRIS)))
story.append(PageBreak())

# ============================================================
# 1. RESUMEN EJECUTIVO
# ============================================================
P("1. Resumen ejecutivo", "h1")
P("Proponemos el desarrollo integral de las cuatro plataformas del Proyecto Sitios Web 2027 en un plazo de 5 a 6 meses, "
  "con los cuatro sitios avanzando en paralelo, entregas demostrables cada 30 días, validadas por DAC.")
P("Esta propuesta no parte del pliego solamente: parte de un <b>relevamiento funcional de 100 puntos</b> que DAC respondió "
  "de forma casi completa, más las aclaraciones posteriores trabajadas directamente con el equipo de Sistemas. "
  "Cada funcionalidad cotizada aquí está especificada sobre esas respuestas.")
SP(2)
tbl([
    ["Concepto","Monto (USD + IVA)","Modalidad"],
    ["Desarrollo de las 4 plataformas","32.500",PAGO],
    ["Mantenimiento integral","1.500 / mes","Desde la puesta en producción"],
    ["Operación de módulos IA (Intranet + Sumate)","500 / mes","Implementación de ambos módulos incluida sin costo. Primer mes bonificado"],
    ["Bolsa evolutiva (opcional)","400 / mes","10 horas mensuales de mejoras sin cotización previa"],
], [58*mm, 34*mm, 78*mm])
box([
 "<b>Tres definiciones que estructuran esta propuesta:</b>",
 "• <b>Entregas que se ven:</b> cada mes hay algo funcionando para probar y validar.",
 "• <b>El sitio consulta, no duplica:</b> los datos operativos (envíos, pasajes, sueldos) siguen viviendo en los sistemas de DAC. Las plataformas los consultan por servicios web. Menos duplicación, menos riesgo.",
 "• <b>Inteligencia aplicada incluida:</b> dos módulos de IA de uso interno — la Intranet que responde consultas citando los manuales oficiales, y un portal de empleo que lee los CV — con su implementación bonificada.",
])

# ============================================================
# 2. ALCANCE POR PROYECTO
# ============================================================
P("2. Alcance por proyecto", "h1")
P("El alcance detallado, funcionalidad por funcionalidad, acompaña esta propuesta como <b>Anexo I — Desglose funcional</b>. "
  "Ese anexo es la lista taxativa de lo incluido. Aquí, el resumen de cada plataforma:")
SP(2)

banner("SITIO DAC — encomiendas y servicios logísticos", DACC)
tbl([
    ["Módulo","Qué incluye"],
    ["Institucional + CMS","Inicio con menú fijo del pliego, La Empresa, DAC en números (editable), novedades, testimonios, Servicios en 5 subsecciones con presentación animada, Preguntas frecuentes con buscador, Agencias. Todo el contenido autogestionable por DAC sin depender de terceros"],
    ["Hacé tu envío","Despacho web completo contra los servicios de encomiendas: emisión de factura por el sistema de encomiendas, etiqueta lista para imprimir, libreta de direcciones y destinatarios frecuentes, servicios de valor agregado (según disponibilidad del servicio)"],
    ["Rastreo y reclamos","Rastreo público con línea de estados tipo checklist · detalle completo para usuarios logueados · inicio de reclamo desde la guía con los 5 tipos definidos, adjuntos con validación y estado del reclamo visible (contra el servicio de reclamos, en desarrollo por el proveedor)"],
    ["Cuenta cliente","Registro con Google/Facebook y mapa de confirmación · historial con filtros, monto sin descuento, reimpresión de comprobantes y etiquetas · indicadores para corporativos · carga masiva (hasta 400 etiquetas) con corrección de direcciones en pantalla · gestión de facturación y pago vía Fiserv para cuentas controladas · operación en nombre del cliente para usuarios internos (mecanismo ya soportado por los servicios)"],
    ["Simulador de tarifas","Cotización en línea contra el servicio de costos existente, con tasa postal y servicios opcionales, respetando acuerdos del cliente logueado"],
], [32*mm, 138*mm], hbg=DACC)

banner("SITIO GRUPO AGENCIA — venta de pasajes", GAC)
tbl([
    ["Módulo","Qué incluye"],
    ["Institucional + CMS","Inicio con menú fijo, La Empresa, GA en números (editable), novedades, testimonios, Horarios y destinos con buscador, Preguntas frecuentes, Descuentos, Contrataciones (formulario a casilla configurable)"],
    ["Compra de pasajes","Buscador ágil origen-destino con información de 36 horas · timer de 15 minutos editable · ida y vuelta, solo ida, pasajes abiertos, vuelta abierta, compra para terceros y documento extranjero (según lo confirmado por DAC en el relevamiento) · pago vía Fiserv reutilizando la integración vigente · compra rápida como invitado · encuesta post-viaje (envío 3 hs después de la llegada programada)"],
    ["Cuenta cliente","Cambio de fecha y levante (servicio existente, mismo importe) · reenvío de pasaje · recompra · carné de estudiante con solicitud, validación y renovación anual gestionadas en el sitio · abonos: marcado y canje de boletos (la venta se mantiene presencial por definición operativa de DAC)"],
    ["Vales y cupones","Vales a bordo con envío por mail y página de verificación de canje único para comercios · cupones OCA e Itaú como descuento en la compra web, con generación de lotes y códigos de verificación"],
    ["Reserva de hoteles — versión inicial","Tras la compra, oferta de hotel en el destino: 1-2 hoteles por localidad, disponibilidad administrada desde el panel del sitio, selección y pago en la misma página vía Fiserv. Integraciones con sistemas hoteleros externos y venta de entradas: fase evolutiva, cotizable por separado"],
], [32*mm, 138*mm], hbg=GAC)
PB()

banner("SUMATE — trabaja con nosotros", SUMC)
tbl([
    ["Módulo","Qué incluye"],
    ["Portal del postulante","Formulario multi-paso con guardado automático · carga de CV y certificados (PDF/JPG/PNG/DOCX, 5 MB, drag & drop, previsualización) · lectura automática del CV para precompletar datos (resuelve la importación solicitada) · sugerencia de cargos · confirmación con código de seguimiento · estado de la postulación visible · postulación espontánea"],
    ["Backoffice RRHH","Publicación y cierre de vacantes · búsqueda y filtros por todos los campos relevantes · notificaciones de cambio de estado al candidato · depuración automática al año (borrado físico) · migración de la base actual (~9.000 CV) incluida"],
], [32*mm, 138*mm], hbg=SUMC)

_k = len(story)
banner("INTRANET — portal de colaboradores (más de 1.000 usuarios)", INTC)
tbl([
    ["Módulo","Qué incluye"],
    ["Comunicados","Publicación por grupos, subgrupos y etiquetas (Encargados / Tercerizados) · confirmación de lectura · auditoría de demora con reporte por comunicado · videos privados dentro del sitio, imágenes y links"],
    ["Manuales","Publicación en HTML con PDF descargable (archivo provisto por DAC) · organizados y buscables"],
    ["Recibos y beneficios","Acceso directo al portal del sistema de sueldos (definición del relevamiento) · beneficios con formulario al prestador configurable y conteo de solicitudes"],
    ["Vida interna","Cumpleaños con alerta por sector · página y video de bienvenida · directorio de agencias y sectores · alerta semestral de actualización de datos · buscador global"],
    ["Módulo de solicitudes y calendario interno","NUEVO — relevado con el equipo: solicitud de préstamos replicando el flujo actual (una vigente por persona, estados en análisis / aprobado / cancelado, gestión por RRHH) · solicitud de licencias en versión simple (el encargado del sector aprueba o deniega) · reservas de convenios · calendario de comunicados y eventos. Sincronización con Google Calendar: evolutivo"],
    ["Administración","Alta/baja de usuarios, grupos y etiquetas · superusuario con visibilidad total · panel de métricas de uso de los sitios"],
], [32*mm, 138*mm], hbg=INTC)
story[_k:] = [KeepTogether(story[_k:])]
PB()

# ============================================================
# 3. IA APLICADA
# ============================================================
P("3. Inteligencia aplicada — dos módulos que devuelven horas", "h1")
P("Incluimos inteligencia artificial únicamente donde optimiza un proceso concreto y medible, para uso interno. "
  "No son funciones decorativas: son horas de trabajo del equipo de DAC que vuelven, todos los meses.")
SP(2)
box([
 Paragraph("<b>A — La Intranet que responde</b>", S["cellb"]),
 "<b>Qué hace:</b> cualquier colaborador escribe su consulta en lenguaje natural —por ejemplo, <i>«¿cómo registro un bulto dañado?»</i>— "
 "y recibe en segundos la respuesta tomada de los manuales y comunicados oficiales de DAC, con el enlace al documento fuente.",
 "<b>Cómo funciona:</b> el asistente responde exclusivamente sobre el contenido cargado en la Intranet (manuales, comunicados, "
 "beneficios, directorio), citando siempre la fuente, y respeta los permisos del usuario: solo puede leer lo que ese usuario ya puede leer. "
 "Lo que no está en la Intranet, lo dice y deriva. Cada manual que DAC suba lo vuelve más útil.",
 "<b>El resultado:</b> las dudas de procedimiento se resuelven en el momento y en el lugar donde surgen, y los manuales que DAC ya tiene "
 "escritos pasan a trabajar por sí solos.",
], bg=IABG, border=HexColor("#B9CBE8"))
box([
 Paragraph("<b>B — El portal de empleo que lee los CV</b>", S["cellb"]),
 "<b>Qué hace:</b> al postularse, el sistema lee el CV y precompleta el formulario (el postulante no tipea lo que ya escribió). "
 "Al publicar una vacante, RRHH recibe la lista de postulantes ordenada por afinidad con el perfil, y puede buscar en la base completa "
 "escribiendo como le hablaría a una persona: <i>«chofer con categoría profesional y disponibilidad nocturna»</i>.",
 "<b>Cómo funciona:</b> la lectura y la clasificación se realizan sobre los datos que el propio postulante carga, dentro del flujo de "
 "postulación que ya prevé el pliego. RRHH siempre decide: el sistema ordena y sugiere, no descarta.",
 "<b>El resultado:</b> la revisión de candidatos pasa de leer CV uno por uno a elegir entre los mejores — y la base histórica de "
 "postulaciones se convierte en una fuente consultable por perfil.",
], bg=IABG, border=HexColor("#B9CBE8"))
_k2 = len(story)
tbl([
    ["","Detalle"],
    ["Qué incluye la operación IA (USD 500/mes)","Costos de procesamiento de ambos módulos · monitoreo de calidad de las respuestas · incorporación del contenido nuevo · ajuste continuo del comportamiento · informe mensual con las consultas más frecuentes (información valiosa en sí misma para la gestión)"],
    ["Implementación","El desarrollo de ambos módulos queda incluido sin costo al contratar la operación IA"],
    ["Límites claros","Hasta 15.000 consultas mensuales (holgadamente por encima del uso esperado de más de 1.000 usuarios); de superarse en forma sostenida, se ajusta el plan de común acuerdo"],
    ["Primer mes","Bonificado — el equipo lo prueba un mes completo sin costo"],
], [42*mm, 128*mm])
story[_k2:] = [KeepTogether(story[_k2:])]
PB()

# ============================================================
# 4. METODOLOGIA
# ============================================================
P("4. Metodología de trabajo — avance que se ve, se prueba y se firma", "h1")
P("En un proyecto de cuatro plataformas en paralelo, la claridad del método importa tanto como la capacidad técnica. "
  "Nuestro método es simple: el avance se ve, se prueba y se firma, todos los meses:")
SP(2)
_fc = st("fc", fontSize=9.8, leading=13.5)
_fa = st("fa", fontName="Helvetica-Bold", fontSize=14, leading=16, textColor=AZUL2, alignment=TA_CENTER)
_fw = (CONTENT_W - 3*7*mm) / 4
flow = Table([[
    Paragraph("<b>1. Construimos</b><br/>el módulo del mes", _fc),
    Paragraph("→", _fa),
    Paragraph("<b>2. Lo mostramos</b><br/>funcionando, con datos de prueba", _fc),
    Paragraph("→", _fa),
    Paragraph("<b>3. DAC lo prueba</b><br/>con checklist de aceptación", _fc),
    Paragraph("→", _fa),
    Paragraph("<b>4. Se firma</b><br/>módulo aceptado = módulo cerrado", _fc),
]], colWidths=[_fw, 7*mm, _fw, 7*mm, _fw, 7*mm, _fw])
flow.setStyle(TableStyle([
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("BACKGROUND",(0,0),(0,0),GRISCL),("BACKGROUND",(2,0),(2,0),GRISCL),
    ("BACKGROUND",(4,0),(4,0),GRISCL),("BACKGROUND",(6,0),(6,0),OKC),
    ("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),
    ("TOPPADDING",(0,0),(-1,-1),11),("BOTTOMPADDING",(0,0),(-1,-1),11),
    ("LEFTPADDING",(1,0),(1,0),0),("RIGHTPADDING",(1,0),(1,0),0),
    ("LEFTPADDING",(3,0),(3,0),0),("RIGHTPADDING",(3,0),(3,0),0),
    ("LEFTPADDING",(5,0),(5,0),0),("RIGHTPADDING",(5,0),(5,0),0),
]))
story.append(flow); story.append(Spacer(1, 8*mm))
tbl([
    ["Práctica","Cómo funciona"],
    ["Avance validado cada mes","Cada mes cierra con un entregable demostrable, probado y aceptado por DAC con un checklist simple. El estado real del proyecto es siempre visible, sin depender de informes"],
    ["Validaciones quincenales","Reunión corta cada dos semanas con acta simple: qué se mostró, qué se aprobó, qué se decidió. Las decisiones quedan registradas y son consultables por ambas partes"],
    ["Testing en 3 capas","Pruebas continuas durante el desarrollo · pruebas de aceptación por hito con DAC · control de calidad integral antes de cada salida a producción"],
    ["Alcance escrito","El Anexo I es la lista taxativa. Todo lo que surja fuera de él se conversa, se dimensiona y se cotiza — nunca se «asume». Así ambas partes saben exactamente qué esperar"],
], [34*mm, 136*mm])
PB()

# ============================================================
# 5. CRONOGRAMA
# ============================================================
P("5. Cronograma tentativo — los cuatro sitios en paralelo", "h1")
P("Tal como se conversó, los cuatro proyectos avanzan en simultáneo. El orden interno prioriza validar temprano lo más complejo "
  "(integraciones y flujos transaccionales), de modo que las dificultades aparezcan al principio, cuando hay tiempo, y no al final. "
  "Este cronograma queda sujeto a la validación de DAC.")
SP(2)
CW = [23*mm] + [(CONTENT_W-23*mm)/6]*6
cr = [
 ["", "MES 1<br/>Cimientos", "MES 2<br/>Toma forma", "MES 3<br/>Se opera", "MES 4<br/>Transaccional", "MES 5<br/>Cierre", "MES 6<br/>Estabilización"],
 ["DAC", "Arquitectura, accesos a ambientes de prueba, base institucional", "Institucional + CMS · rastreo público", "Hacé tu envío + registro · simulador", "Historial, indicadores, masivo, facturación Fiserv, reclamos*", "Operación en nombre del cliente · ajustes · control de calidad", "Pruebas de aceptación y salida"],
 ["GA", "Base y diseño", "Institucional + horarios", "Compra de pasajes completa (Fiserv)", "Cuenta cliente · vales y cupones", "Hoteles v. inicial · encuesta · control de calidad", "Pruebas de aceptación y salida"],
 ["Sumate", "Relevamiento de la base actual", "Diseño y formulario", "Portal postulante + IA de CV", "Backoffice RRHH + migración", "Ajustes · control de calidad", "Pruebas de aceptación y salida"],
 ["Intranet", "Modelo de grupos y permisos", "Comunicados + auditoría de lectura", "Manuales, beneficios, vida interna", "Módulo de solicitudes y calendario", "Agente IA · control de calidad", "Pruebas de aceptación y salida"],
 ["Transversal", "Seguridad, entornos, diseño de interfaz", "CMS común · correo transaccional", "Validaciones quincenales continuas", "Pruebas de integración", "Control de calidad integral + capacitación", "Seguimiento en producción"],
]
rows=[]
lane_colors=[None, DACC, GAC, SUMC, INTC, TRAC]
for i,row in enumerate(cr):
    out=[]
    for j,c in enumerate(row):
        if i==0: out.append(Paragraph(c, st("crh", fontName="Helvetica-Bold", fontSize=7.9, leading=10, textColor=TXT, alignment=TA_CENTER)))
        elif j==0: out.append(Paragraph(c, st("crl"+str(i), fontName="Helvetica-Bold", fontSize=8.6, leading=11, textColor=lane_colors[i])))
        else: out.append(Paragraph(c, st("crc", fontSize=8.2, leading=10.8)))
    rows.append(out)
t=Table(rows, colWidths=CW)
style=[("VALIGN",(0,0),(-1,-1),"TOP"),
       ("LINEBELOW",(0,0),(-1,-1),0.5,LINEA),
       ("BACKGROUND",(0,0),(-1,0),GRISCL),("LINEBELOW",(0,0),(-1,0),1.0,LINEA2),
       ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
       ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]
t.setStyle(TableStyle(style))
story.append(t); story.append(Spacer(1, 4*mm))
P("* Los módulos apoyados en servicios en desarrollo por proveedores externos (reclamos, valor agregado en despacho, detalle de facturación) "
  "se construyen en el mes previsto y su integración final se completa cuando el servicio esté disponible.", "small")
box([
 "<b>Compromisos del cronograma:</b> 6 meses de proyecto — 5 de desarrollo y 1 de estabilización, pruebas de aceptación finales y salida a producción · "
 "cada mes cierra con un entregable demostrable · los cuatro sitios pueden salir a producción juntos o escalonados, según prefiera DAC.",
])

# ============================================================
# 6. SEGURIDAD
# ============================================================
P("6. Seguridad y protección de datos", "h1")
P("Cuatro plataformas por donde pasan clientes, cobros y datos de más de 1.000 colaboradores exigen que la seguridad sea parte de la "
  "arquitectura, no un agregado del final. Los principios con los que trabajamos:")
tbl([
    ["Principio","En la práctica"],
    ["Mínima custodia","Un ejemplo cotidiano: el sitio funciona como el mostrador del banco, no como la bóveda. Sueldos, medios de pago y operación siguen en los sistemas donde hoy viven; las plataformas consultan por servicios web y muestran — no replican ni almacenan de más"],
    ["Permisos a nivel de dato","Cada registro de la base define quién puede leerlo (seguridad por filas). Un usuario con etiqueta Tercerizado solo accede a los contenidos dirigidos a esa etiqueta: no es que «no se muestra», es que no puede leerse"],
    ["Accesos y credenciales","Secretos en bóveda cifrada, nunca en el código · doble factor en todos los accesos del equipo · despliegues a producción exclusivamente por el líder técnico · datos de prueba, nunca datos reales de clientes, en desarrollo y pruebas"],
    ["Operación defensiva","Validación del lado del servidor en todo lo transaccional · límites de frecuencia contra abuso · sesiones con expiración · aviso de inicios de sesión sospechosos · registro de auditoría inmutable de operaciones sensibles (incluida la operación en nombre de clientes)"],
    ["Resguardo","Copias de seguridad de la base de datos y contenidos, con prueba de restauración mensual · cumplimiento de la Ley 18.331 de protección de datos personales (incluida la depuración anual de CV)"],
    ["Módulos de IA","El contenido reside en la base de datos del proyecto — la IA no almacena información: procesa cada consulta en forma transitoria, bajo términos comerciales que excluyen el uso de los datos para entrenamiento de modelos · a la IA viaja únicamente el fragmento necesario para responder cada consulta, respetando los permisos del usuario · el tratamiento puede documentarse en el marco de la Ley 18.331, con el proveedor de IA como encargado de tratamiento"],
    ["Verificación externa","Total disposición a una auditoría de seguridad por terceros que DAC designe, antes de la salida a producción"],
], [34*mm, 136*mm])
PB()

# ============================================================
# 7. EQUIPO
# ============================================================
P("7. Equipo e interlocución", "h1")
tbl([
    ["Rol","Responsabilidad"],
    ["Santiago Bouvier — líder técnico y único interlocutor","Arquitectura, base de datos, seguridad, todas las integraciones con servicios web, flujos transaccionales y de pago, módulos IA, y la relación diaria con DAC. Un solo teléfono para todo el proyecto"],
    ["Por parte de DAC","Referente técnico: Mario Secchi (Sistemas), para consultas y accesos · referente funcional: Sebastián Ciapessoni, para validaciones · entrega de contenidos por módulo según el plan (según lo definido en el relevamiento). La agilidad de este circuito es lo que hace posible el cronograma propuesto"],
], [46*mm, 124*mm])
P("Digital Builders desarrolla y mantiene plataformas web y sistemas de gestión para empresas en Uruguay, con foco en "
  "integraciones, autogestión del cliente y aplicaciones de inteligencia artificial sobre procesos reales. "
  "Referencias y trabajos: <b>digitalbuilders.net</b>")

# ============================================================
# 8. SUPUESTOS
# ============================================================
P("8. Supuestos y dependencias del plan", "h1")
P("Para que el plan sea realista para todos, dejamos explícito qué asume esta propuesta. Ninguno de estos puntos es una condición "
  "inusual: son la formalización de lo conversado en el relevamiento.")
tbl([
    ["#","Supuesto / dependencia"],
    ["1","<b>Servicios de terceros en desarrollo.</b> Algunos módulos se apoyan en servicios que están siendo desarrollados por proveedores externos, de los que también depende DAC (reclamos, valor agregado en el despacho, detalle de facturación, normalización de direcciones). Los tiempos de integración, pruebas y entrega de esas partes pueden variar según la disponibilidad de dichos servicios. El resto del cronograma no se detiene por ello"],
    ["2","<b>Pruebas del sistema de pasajes.</b> Al no existir un ambiente de pruebas del sistema de ventas, las validaciones se realizarán sobre servicios específicos creados a futuro para ese fin, según el procedimiento propuesto por Sistemas de DAC. Las pruebas del flujo de compra se realizan de forma coordinada con Sistemas de DAC sobre esos servicios, siguiendo un procedimiento acordado al inicio"],
    ["3","<b>Pasarela de pagos.</b> Se reutiliza el contrato e integración Fiserv vigentes; DAC provee credenciales y documentación de su implementación actual"],
    ["4","<b>Contenidos.</b> Textos, fotografías, videos, preguntas frecuentes y manuales son provistos por DAC según el calendario por módulo que se acuerde al inicio; la fecha de entrega de cada módulo se ajusta a la fecha de recepción de sus contenidos"],
    ["5","<b>Migraciones.</b> Usuarios de GA: se migran sin contraseñas, con restablecimiento en el primer ingreso. Sumate: DAC entrega la base actual (~9.000 CV) para su migración. Usuarios de DAC: se mantienen, al validar contra el sistema central"],
    ["6","<b>Infraestructura y servicios.</b> La infraestructura de hosting es contratada y administrada por DAC. Los compromisos de respuesta del mantenimiento aplican sobre el software desarrollado; la disponibilidad de la infraestructura es responsabilidad de su proveedor. El correo transaccional utiliza la infraestructura de correo de DAC. Los costos de servicios de terceros (mapas, hosting, correo) corren por cuenta de DAC"],
    ["7","<b>Definiciones tomadas del relevamiento.</b> La encuesta post-viaje se envía 3 horas después de la hora programada de llegada · la venta de abonos permanece presencial por definición operativa de DAC (el sitio permite marcar y canjear) · la página de verificación de vales se diseña a nuevo, con validación de DAC"],
    ["8","<b>Reserva de hoteles.</b> Se implementa la versión inicial descripta en el alcance (disponibilidad administrada desde el panel del sitio, 1-2 hoteles por localidad, pago vía Fiserv). Los convenios comerciales con los hoteles son gestionados por DAC"],
], [8*mm, 162*mm])
PB()

# ============================================================
# 9. INVERSION
# ============================================================
P("9. Inversión", "h1")
P("Todos los montos en dólares americanos, más IVA.", "small")
SP(2)
banner("DESARROLLO — USD 32.500 + IVA", AZUL)
tbl([
    ["Detalle","Monto"],
    ["Las cuatro plataformas completas según el Anexo I, incluyendo el módulo de solicitudes y calendario interno de la Intranet relevado con el equipo","USD 32.500"],
    ["Implementación de los módulos de IA (Intranet + Sumate)","<b>Incluida sin costo</b> al contratar la operación IA por el plazo mínimo de 12 meses. De no contratarse, los módulos quedan desactivados"],
    ["Forma de pago",PAGO],
], [110*mm, 60*mm])
banner("SERVICIO MENSUAL — USD 2.000 + IVA (dos componentes)", AZUL)
tbl([
    ["Componente","Incluye","Mensual"],
    ["Mantenimiento integral","Monitoreo permanente · pruebas funcionales semanales de los flujos críticos (envío, compra de pasaje, pagos) · hasta 20 horas correctivas · niveles de respuesta comprometidos: incidencia crítica (plataforma caída o pagos sin funcionar) atendida en menos de 2 horas en días hábiles de 8 a 20 h, con guardia para caídas totales fines de semana y feriados de 9 a 18 h · incidencia alta en menos de 8 horas hábiles · normal en menos de 24 horas hábiles · copias de seguridad verificadas mensualmente · portal de tickets · informe mensual de servicio · revisión trimestral conjunta","USD 1.500"],
    ["Operación IA","Operación de ambos módulos (procesamiento, monitoreo de calidad, incorporación de contenido, informe de consultas frecuentes) · hasta 15.000 consultas/mes","USD 500"],
], [34*mm, 102*mm, 34*mm])
tbl([
    ["Condiciones del servicio mensual"],
    ["Inicia con la puesta en producción · primer mes de la operación IA bonificado · plazo mínimo 12 meses · preaviso de 90 días · ajuste anual según inflación de EE.UU. · la componente IA puede contratarse, pausarse o darse de baja en forma independiente del mantenimiento"],
], [170*mm], header=True)
banner("OPCIONAL — BOLSA EVOLUTIVA: USD 400 + IVA / MES", AZUL2)
P("10 horas mensuales para mejoras y funcionalidades nuevas sin necesidad de cotización previa: la vía práctica para que los sitios "
  "sigan creciendo después del lanzamiento (por ejemplo: sincronización de licencias con Google Calendar, integraciones hoteleras, "
  "nuevos indicadores). Las horas no utilizadas no se acumulan. Puede activarse en cualquier momento.")

# ============================================================
# 10. CIERRE
# ============================================================
P("10. Próximos pasos", "h1")
tbl([
    ["Paso","Detalle"],
    ["1. Validación","Revisión de esta propuesta y del cronograma tentativo; ajustes que DAC considere"],
    ["2. Adjudicación y firma","Contrato con el Anexo I como alcance taxativo"],
    ["3. Inicio","Reunión de inicio en la primera semana tras la firma: accesos, entornos, calendario de contenidos y primera validación quincenal agendada. Con la firma se emite la primera cuota"],
], [36*mm, 134*mm])
P("Gracias por la confianza y por la calidad del relevamiento. Quedamos a disposición para presentar esta propuesta personalmente.")
SP(6)
P("<b>Santiago Bouvier</b><br/>Digital Builders · digitalbuilders.net<br/>Montevideo, setiembre de 2026", "p")

# ============================================================
# BUILD
# ============================================================
def on_page(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(GRIS)
        canvas.drawString(22*mm, 13*mm, "Digital Builders  ·  Propuesta Proyecto Sitios Web 2027  ·  DAC / Grupo Agencia")
        canvas.drawRightString(W-22*mm, 13*mm, f"{doc.page}")
    canvas.restoreState()

doc = BaseDocTemplate("/home/claude/dac/DAC_propuesta_2026_v3.pdf", pagesize=A4,
                      leftMargin=22*mm, rightMargin=22*mm, topMargin=22*mm, bottomMargin=24*mm)
frame = Frame(22*mm, 24*mm, CONTENT_W, H-46*mm, id="f")
doc.addPageTemplates([PageTemplate(id="t", frames=[frame], onPage=on_page)])
doc.build(story)
print("OK propuesta v3")
