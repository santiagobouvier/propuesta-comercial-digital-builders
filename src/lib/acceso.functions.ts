import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const esquema = z.object({ email: z.string().email().max(320) });

/**
 * Verifica que el correo esté en la lista blanca `invitados` y, si todavía no
 * tiene cuenta, la crea. El registro abierto está deshabilitado en Auth, así que
 * sin este paso el magic link nunca llegaría a un invitado nuevo.
 */
export const prepararAcceso = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => esquema.parse(data))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invitado, error } = await supabaseAdmin
      .from("invitados")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[acceso] error consultando invitados", error);
      throw new Error("No pudimos verificar el acceso. Probá de nuevo en un momento.");
    }

    if (!invitado) {
      return { permitido: false as const };
    }

    const { data: creado, error: errorAlta } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    // Si el usuario ya existe, createUser falla: no es un problema.
    if (errorAlta && !creado?.user) {
      const mensaje = errorAlta.message?.toLowerCase() ?? "";
      const yaExiste = mensaje.includes("already") || mensaje.includes("registered");
      if (!yaExiste) {
        console.error("[acceso] error creando usuario invitado", errorAlta);
        throw new Error("No pudimos preparar tu acceso. Probá de nuevo en un momento.");
      }
    }

    return { permitido: true as const };
  });
