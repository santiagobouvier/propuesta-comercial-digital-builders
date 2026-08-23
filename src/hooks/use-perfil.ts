import { useQuery } from "@tanstack/react-query";

import { asegurarPerfil, type Perfil } from "@/lib/perfil";

/**
 * Garantiza que el usuario logueado tenga su fila en `profiles`.
 * Sin esto, todas las políticas RLS le niegan el acceso.
 */
export function usePerfil() {
  return useQuery<Perfil>({
    queryKey: ["perfil"],
    queryFn: asegurarPerfil,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
