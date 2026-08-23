-- Cierra una escalada de privilegios en profiles.
--
-- La politica profiles_update_propio permite a cada usuario editar su propia
-- fila, y el GRANT de tabla le daba UPDATE sobre TODAS las columnas. Con eso,
-- un usuario del lado 'dac' podia cambiarse su propio campo `lado` a
-- 'digital_builders' con una llamada directa a la API y pasar a figurar del
-- lado de Digital Builders.
--
-- RLS no filtra por columna, asi que la herramienta correcta son los
-- privilegios de columna de Postgres: se revoca la escritura completa y se
-- concede unicamente sobre `nombre`.
--
-- Los campos id, email y lado quedan definidos solo por asegurar_perfil(),
-- que es SECURITY DEFINER y los toma del JWT y de la tabla invitados.
-- Esa funcion no se ve afectada por estos grants porque corre como owner.

REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT UPDATE (nombre) ON public.profiles TO authenticated;
