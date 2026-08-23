import { createFileRoute, redirect } from "@tanstack/react-router";

// La propuesta para DAC / Grupo Agencia es un sitio estático autocontenido
// (Tailwind por CDN + JS vanilla) que vive en public/propuesta/index.html.
// Vite lo sirve tal cual, por fuera del router de React, así que la home
// redirige hacia él en vez de renderizar un componente.
//
// La landing anterior generada por Lovable sigue en el historial de git
// (commit c3e9e0a) si hiciera falta recuperarla.
const PROPUESTA_URL = "/propuesta/index.html";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: PROPUESTA_URL });
  },
});
