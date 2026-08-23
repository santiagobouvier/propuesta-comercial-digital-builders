import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { prepararAcceso } from "@/lib/acceso.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ingresar · Portal de validación DAC" },
      {
        name: "description",
        content:
          "Acceso por invitación al portal donde DAC y Digital Builders validan el alcance del proyecto.",
      },
      { property: "og:title", content: "Ingresar · Portal de validación DAC" },
      {
        property: "og:description",
        content: "Acceso por invitación al portal de validación de alcance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const preparar = useServerFn(prepararAcceso);
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"form" | "enviando" | "enviado">("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/proyectos", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEstado("enviando");
    const correo = email.trim().toLowerCase();

    try {
      const { permitido } = await preparar({ data: { email: correo } });
      if (!permitido) {
        setEstado("form");
        setError("Ese correo no tiene acceso al portal. Escribinos si creés que es un error.");
        return;
      }

      const { error: errorOtp } = await supabase.auth.signInWithOtp({
        email: correo,
        options: { emailRedirectTo: `${window.location.origin}/proyectos` },
      });
      if (errorOtp) throw errorOtp;

      setEstado("enviado");
    } catch (err) {
      console.error(err);
      setEstado("form");
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No pudimos enviar el acceso. Probá de nuevo en un momento.",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Digital Builders
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-card-foreground">
          Portal de validación
        </h1>

        {estado === "enviado" ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-card-foreground">
              Listo, revisá tu correo. Te mandamos un enlace de acceso a{" "}
              <span className="font-medium">{email.trim().toLowerCase()}</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              El enlace sirve una sola vez y vence en poco tiempo. Si no lo ves, mirá
              en spam.
            </p>
            <Button
              variant="ghost"
              className="px-0 text-sm"
              onClick={() => {
                setEstado("form");
                setError(null);
              }}
            >
              Usar otro correo
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingresás con un enlace mágico, sin contraseña. Solo funciona con los
              correos invitados.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Tu correo</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Enviando…" : "Enviarme el acceso"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
