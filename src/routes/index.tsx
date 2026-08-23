import { createFileRoute } from "@tanstack/react-router";
import heroImage from "@/assets/hero-architecture.jpg";
import blueprintImage from "@/assets/process-blueprint.jpg";
import modelImage from "@/assets/craft-model.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Propuesta Digital Builders | Arquitectura digital para marcas B2B" },
      {
        name: "description",
        content:
          "Propuesta Digital Builders es un estudio de arquitectura digital. Diseñamos y construimos sistemas, interfaces y activos digitales con precisión técnica y estética deliberada.",
      },
      { property: "og:title", content: "Propuesta Digital Builders" },
      {
        property: "og:description",
        content:
          "Arquitectura digital para marcas B2B. Diseñamos y construimos sistemas, interfaces y activos digitales con precisión técnica.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Propuesta Digital Builders" },
      {
        name: "twitter:description",
        content:
          "Arquitectura digital para marcas B2B. Diseñamos y construimos sistemas digitales con precisión técnica.",
      },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: Index,
});

const navLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Metodología", href: "#metodologia" },
  { label: "Contacto", href: "#contacto" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="font-display text-lg font-semibold tracking-tight">
            Propuesta <span className="text-primary">Digital Builders</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Iniciar proyecto
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 lg:pt-40">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 lg:grid-cols-2 lg:items-center lg:pb-32">
            <div className="max-w-2xl">
              <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Estudio de arquitectura digital
              </span>
              <h1 className="mb-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
                Construimos activos digitales que perduran.
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                Diseñamos sistemas, interfaces y experiencias para empresas B2B que necesitan
                solidez técnica, coherencia visual y escalabilidad real.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#contacto"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Solicitar propuesta
                </a>
                <a
                  href="#servicios"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Ver servicios
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Detalle arquitectónico moderno con hormigón y líneas limpias"
                width={1440}
                height={912}
                loading="eager"
                className="rounded-2xl object-cover shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="servicios" className="border-y border-border bg-secondary/50 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Capacidades
              </span>
              <h2 className="mb-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Servicios de diseño y construcción digital
              </h2>
              <p className="text-lg text-muted-foreground">
                Cada proyecto empieza con un plano. Desde la estrategia hasta el código, cubrimos
                todo el ciclo de creación.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="group rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg"
                >
                  <div className="mb-6 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <service.icon className="size-6" />
                  </div>
                  <h3 className="mb-3 font-display text-xl font-semibold">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section id="metodologia" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-primary">
                  Metodología
                </span>
                <h2 className="mb-6 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  Un proceso pensado como una obra de arquitectura
                </h2>
                <p className="mb-10 text-lg text-muted-foreground">
                  No improvisamos. Cada fase aporta claridad, reduce riesgos y garantiza que el
                  resultado final sea estable y evolutivo.
                </p>

                <div className="space-y-10">
                  {phases.map((phase, index) => (
                    <div key={phase.title} className="flex gap-6">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border font-display text-lg font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="mb-2 font-display text-xl font-semibold">{phase.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {phase.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src={blueprintImage}
                  alt="Plano arquitectónico detallado que representa nuestro proceso de diseño"
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="rounded-2xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Contact */}
        <section id="contacto" className="bg-foreground py-24 text-background lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  ¿Listo para construir su próximo activo digital?
                </h2>
                <p className="mb-8 text-lg text-background/70">
                  Cuéntenos sobre su proyecto y le responderemos con un plan de trabajo claro,
                  plazos reales y una propuesta ajustada a sus objetivos.
                </p>
                <a
                  href="mailto:hola@propuestadigitalbuilders.com"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Enviar correo
                </a>
              </div>
              <div className="relative">
                <img
                  src={modelImage}
                  alt="Maqueta arquitectónica minimalista en madera y papel blanco"
                  width={944}
                  height={704}
                  loading="lazy"
                  className="rounded-2xl object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="font-display text-sm font-semibold tracking-tight">
            Propuesta Digital Builders © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              LinkedIn
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Instagram
            </a>
            <a href="mailto:hola@propuestadigitalbuilders.com" className="transition-colors hover:text-foreground">
              Correo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-8.48 8.48" />
      <path d="m16.24 7.76-3.54 12.02" />
      <path d="m16.24 7.76-12.02 3.54" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18 7.53 3.94c.8.42.8 1.57 0 1.99l-7.53 3.94a2.5 2.5 0 0 1-2.32 0L2.95 8.1a1.32 1.32 0 0 1 0-1.99l7.53-3.93a2.5 2.5 0 0 1 2.35 0Z" />
      <path d="m2.95 14.1 7.53 3.93a2.5 2.5 0 0 0 2.32 0l7.53-3.93a1.32 1.32 0 0 0 0-1.98" />
      <path d="m2.95 20.1 7.53 3.93a2.5 2.5 0 0 0 2.32 0l7.53-3.93a1.32 1.32 0 0 0 0-1.98" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function PenToolIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.5 8.6" />
      <path d="M22 22l-5.5-5.5" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const services = [
  {
    title: "Estrategia de producto",
    description:
      "Definimos la arquitectura de información, los flujos de usuario y los objetivos medibles antes de comenzar a diseñar.",
    icon: CompassIcon,
  },
  {
    title: "Diseño de sistemas",
    description:
      "Creamos lenguajes visuales coherentes, sistemas de componentes y documentación que escala con su organización.",
    icon: LayersIcon,
  },
  {
    title: "Desarrollo frontend",
    description:
      "Construimos interfaces con tecnologías modernas, código limpio y un rendimiento que se siente desde el primer clic.",
    icon: CodeIcon,
  },
  {
    title: "Performance y SEO",
    description:
      "Optimizamos la velocidad, la accesibilidad y la visibilidad en buscadores para que su producto crezca con solidez.",
    icon: TrendingUpIcon,
  },
  {
    title: "Diseño editorial",
    description:
      "Desarrollamos identidades digitales, landing pages y activos de marca con una estética deliberada y profesional.",
    icon: PenToolIcon,
  },
  {
    title: "Mantenimiento y evolución",
    description:
      "Acompañamos el crecimiento del producto con mejoras continuas, análisis de datos y ajustes técnicos estables.",
    icon: ShieldCheckIcon,
  },
];

const phases = [
  {
    title: "Cimentación",
    description:
      "Auditoría, investigación y definición de objetivos. Entendemos el terreno antes de levantar la estructura.",
  },
  {
    title: "Planos",
    description:
      "Arquitectura de información, wireframes, flujos de usuario y sistema de diseño. Aquí se decide la forma.",
  },
  {
    title: "Construcción",
    description:
      "Desarrollo iterativo, pruebas de usabilidad y ajustes de rendimiento. Cada módulo se prueba antes de ensamblarse.",
  },
  {
    title: "Entrega y escala",
    description:
      "Lanzamiento controlado, documentación y plan de evolución. Entregamos una herramienta lista para crecer.",
  },
];
