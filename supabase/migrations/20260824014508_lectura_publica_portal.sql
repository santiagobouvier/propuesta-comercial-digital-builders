-- Lectura publica del portal de validacion.
--
-- La propuesta ya esta detras de un codigo de acceso; exigir ademas login por
-- correo solo para MIRAR los proyectos era doble barrera. Ahora el rol anon
-- puede leer proyectos, funcionalidades, estados y comentarios publicos.
-- Escribir (validar, comentar) sigue exigiendo cuenta invitada: esas politicas
-- no cambian.
--
-- Lo sensible sigue cerrado para anon:
--   - estimaciones (horas y responsables): sin politica anon, cero filas.
--   - comentarios internos: la politica anon exige interno = false.
--   - correos del equipo: profiles expone a anon solo id, nombre y lado
--     via privilegios de columna.

DROP POLICY IF EXISTS proyectos_select_anon ON public.proyectos;
CREATE POLICY proyectos_select_anon ON public.proyectos
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS funcionalidades_select_anon ON public.funcionalidades;
CREATE POLICY funcionalidades_select_anon ON public.funcionalidades
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS validaciones_select_anon ON public.validaciones;
CREATE POLICY validaciones_select_anon ON public.validaciones
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS comentarios_select_anon ON public.comentarios;
CREATE POLICY comentarios_select_anon ON public.comentarios
  FOR SELECT TO anon USING (interno = false);

DROP POLICY IF EXISTS profiles_select_anon ON public.profiles;
CREATE POLICY profiles_select_anon ON public.profiles
  FOR SELECT TO anon USING (true);

GRANT SELECT ON public.proyectos, public.funcionalidades,
               public.validaciones, public.comentarios TO anon;
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, nombre, lado) ON public.profiles TO anon;
