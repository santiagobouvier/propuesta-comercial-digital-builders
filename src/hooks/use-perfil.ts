import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { asegurarPerfil, type Perfil } from "@/lib/perfil";

/**
 * Perfil del usuario logueado, o null en modo lectura (sin sesión).
 * Con sesión, garantiza la fila en `profiles`; sin ella las políticas RLS
 * dejan leer pero no escribir.
 */
export function usePerfil() {
  return useQuery<Perfil | null>({
    queryKey: ["perfil"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return null;
      return asegurarPerfil();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
