REVOKE ALL ON FUNCTION public.crear_validacion_inicial() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.registrar_bitacora_estado() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.asegurar_perfil() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.asegurar_perfil() TO authenticated;