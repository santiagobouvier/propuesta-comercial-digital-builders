import { createFileRoute } from "@tanstack/react-router";

import { usePerfil } from "@/hooks/use-perfil";
import { nombreVisible } from "@/lib/perfil";

export const Route = createFileRoute("/_authenticated/proyectos/")({
  head: () => ({
    meta: [
      { title: "Proyectos · Portal de validación DAC" },
      {
        name: "description",
        content: "Validá el alcance de cada proyecto, funcionalidad por funcionalidad.",
      },
      { property: "og:title", content: "Proyectos · Portal de validación DAC" },
      {
        property: "og:description",
        content: "Validá el alcance de cada proyecto, funcionalidad por funcionalidad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProyectosPage,
});

function ProyectosPage() {
  const { data: perfil, isPending, error } = usePerfil();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Proyectos</h1>
      {isPending ? (
        <p className="mt-3 text-sm text-muted-foreground">Cargando tu perfil…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-destructive">
          Ese correo no tiene acceso al portal.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Hola {nombreVisible(perfil)}. Acá vas a ver los proyectos a validar.
        </p>
      )}
    </main>
  );
}
