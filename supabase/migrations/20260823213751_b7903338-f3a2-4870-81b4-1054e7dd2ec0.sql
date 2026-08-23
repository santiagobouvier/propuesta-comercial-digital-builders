-- Helper: ¿el usuario actual tiene perfil?
CREATE OR REPLACE FUNCTION public.tiene_perfil()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
$$;

REVOKE ALL ON FUNCTION public.tiene_perfil() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tiene_perfil() TO authenticated;

-- Políticas endurecidas
DROP POLICY IF EXISTS bitacora_select_autenticados ON public.bitacora;
CREATE POLICY bitacora_select_autenticados ON public.bitacora
  FOR SELECT TO authenticated USING (public.tiene_perfil());

DROP POLICY IF EXISTS proyectos_select_autenticados ON public.proyectos;
CREATE POLICY proyectos_select_autenticados ON public.proyectos
  FOR SELECT TO authenticated USING (public.tiene_perfil());

DROP POLICY IF EXISTS funcionalidades_select_autenticados ON public.funcionalidades;
CREATE POLICY funcionalidades_select_autenticados ON public.funcionalidades
  FOR SELECT TO authenticated USING (public.tiene_perfil());

DROP POLICY IF EXISTS validaciones_select_autenticados ON public.validaciones;
CREATE POLICY validaciones_select_autenticados ON public.validaciones
  FOR SELECT TO authenticated USING (public.tiene_perfil());

DROP POLICY IF EXISTS validaciones_update_autenticados ON public.validaciones;
CREATE POLICY validaciones_update_autenticados ON public.validaciones
  FOR UPDATE TO authenticated
  USING (public.tiene_perfil())
  WITH CHECK (public.tiene_perfil() AND actualizado_por = (SELECT auth.uid()));

DROP POLICY IF EXISTS comentarios_select_autenticados ON public.comentarios;
CREATE POLICY comentarios_select_autenticados ON public.comentarios
  FOR SELECT TO authenticated USING (public.tiene_perfil());

DROP POLICY IF EXISTS comentarios_insert_propio ON public.comentarios;
CREATE POLICY comentarios_insert_propio ON public.comentarios
  FOR INSERT TO authenticated
  WITH CHECK (public.tiene_perfil() AND autor_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS comentarios_update_propio ON public.comentarios;
CREATE POLICY comentarios_update_propio ON public.comentarios
  FOR UPDATE TO authenticated
  USING (public.tiene_perfil() AND autor_id = (SELECT auth.uid()))
  WITH CHECK (public.tiene_perfil() AND autor_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS comentarios_delete_propio ON public.comentarios;
CREATE POLICY comentarios_delete_propio ON public.comentarios
  FOR DELETE TO authenticated
  USING (public.tiene_perfil() AND autor_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_select_autenticados ON public.profiles;
CREATE POLICY profiles_select_autenticados ON public.profiles
  FOR SELECT TO authenticated USING (public.tiene_perfil());

DROP POLICY IF EXISTS profiles_update_propio ON public.profiles;
CREATE POLICY profiles_update_propio ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- asegurar_perfil: email desde el JWT, lado siempre desde invitados, solo auth.uid()
CREATE OR REPLACE FUNCTION public.asegurar_perfil()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_id uuid := (SELECT auth.uid());
  v_email text := lower(nullif((SELECT auth.jwt() ->> 'email'), ''));
  v_invitado public.invitados%ROWTYPE;
  v_perfil public.profiles%ROWTYPE;
BEGIN
  IF v_id IS NULL OR v_email IS NULL THEN
    RAISE EXCEPTION 'Sin sesion activa';
  END IF;

  SELECT * INTO v_perfil FROM public.profiles WHERE id = v_id;
  IF FOUND THEN
    RETURN v_perfil;
  END IF;

  SELECT * INTO v_invitado FROM public.invitados WHERE lower(email) = v_email;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este correo no tiene acceso al portal';
  END IF;

  INSERT INTO public.profiles (id, email, nombre, lado)
  VALUES (v_id, v_email, v_invitado.nombre, v_invitado.lado)
  RETURNING * INTO v_perfil;

  RETURN v_perfil;
END;
$function$;

REVOKE ALL ON FUNCTION public.asegurar_perfil() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.asegurar_perfil() TO authenticated;