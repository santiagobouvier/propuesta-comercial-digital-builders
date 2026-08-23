import { supabase } from "@/integrations/supabase/client";

export type Perfil = {
  id: string;
  email: string;
  nombre: string | null;
  lado: "dac" | "digital_builders";
};

/**
 * Crea (o recupera) el perfil del usuario logueado tomando el `lado` desde la
 * tabla `invitados`. Sin perfil, las políticas RLS le niegan todo.
 */
export async function asegurarPerfil(): Promise<Perfil> {
  const { data, error } = await supabase.rpc("asegurar_perfil");
  if (error) throw error;
  const perfil = Array.isArray(data) ? data[0] : data;
  return perfil as Perfil;
}

export function nombreVisible(perfil: Perfil | null | undefined) {
  if (!perfil) return "";
  return perfil.nombre?.trim() || perfil.email;
}
