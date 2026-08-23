-- Tipos
CREATE TYPE public.org_side AS ENUM ('dac', 'digital_builders');
CREATE TYPE public.estado_funcionalidad AS ENUM ('pendiente', 'validado', 'con_cambios', 'no_va');

-- Invitados (lista blanca)
CREATE TABLE public.invitados (
  email text PRIMARY KEY,
  lado public.org_side NOT NULL,
  nombre text
);
GRANT ALL ON public.invitados TO service_role;
ALTER TABLE public.invitados ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nombre text,
  lado public.org_side NOT NULL DEFAULT 'dac',
  creado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_propio" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Proyectos
CREATE TABLE public.proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nombre text NOT NULL,
  color text NOT NULL,
  bajada text,
  descripcion text,
  orden int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.proyectos TO authenticated;
GRANT ALL ON public.proyectos TO service_role;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proyectos_select_autenticados" ON public.proyectos FOR SELECT TO authenticated USING (true);

-- Funcionalidades
CREATE TABLE public.funcionalidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  titulo text NOT NULL,
  detalle text,
  horas numeric,
  orden int NOT NULL DEFAULT 0,
  UNIQUE (proyecto_id, codigo)
);
GRANT SELECT ON public.funcionalidades TO authenticated;
GRANT ALL ON public.funcionalidades TO service_role;
ALTER TABLE public.funcionalidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "funcionalidades_select_autenticados" ON public.funcionalidades FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_funcionalidades_proyecto ON public.funcionalidades (proyecto_id, orden);

-- Validaciones
CREATE TABLE public.validaciones (
  funcionalidad_id uuid PRIMARY KEY REFERENCES public.funcionalidades(id) ON DELETE CASCADE,
  estado public.estado_funcionalidad NOT NULL DEFAULT 'pendiente',
  actualizado_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.validaciones TO authenticated;
GRANT ALL ON public.validaciones TO service_role;
ALTER TABLE public.validaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "validaciones_select_autenticados" ON public.validaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "validaciones_update_autenticados" ON public.validaciones FOR UPDATE TO authenticated USING (true) WITH CHECK (actualizado_por = auth.uid());

-- Comentarios
CREATE TABLE public.comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionalidad_id uuid NOT NULL REFERENCES public.funcionalidades(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cuerpo text NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comentarios TO authenticated;
GRANT ALL ON public.comentarios TO service_role;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comentarios_select_autenticados" ON public.comentarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "comentarios_insert_propio" ON public.comentarios FOR INSERT TO authenticated WITH CHECK (autor_id = auth.uid());
CREATE POLICY "comentarios_update_propio" ON public.comentarios FOR UPDATE TO authenticated USING (autor_id = auth.uid()) WITH CHECK (autor_id = auth.uid());
CREATE POLICY "comentarios_delete_propio" ON public.comentarios FOR DELETE TO authenticated USING (autor_id = auth.uid());
CREATE INDEX idx_comentarios_funcionalidad ON public.comentarios (funcionalidad_id, creado_en);

-- Bitacora
CREATE TABLE public.bitacora (
  id bigserial PRIMARY KEY,
  funcionalidad_id uuid REFERENCES public.funcionalidades(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  accion text NOT NULL,
  antes text,
  despues text,
  creado_en timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bitacora TO authenticated;
GRANT ALL ON public.bitacora TO service_role;
ALTER TABLE public.bitacora ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bitacora_select_autenticados" ON public.bitacora FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_bitacora_funcionalidad ON public.bitacora (funcionalidad_id, creado_en DESC);

-- Trigger: nueva funcionalidad -> validacion pendiente
CREATE OR REPLACE FUNCTION public.crear_validacion_inicial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.validaciones (funcionalidad_id, estado)
  VALUES (NEW.id, 'pendiente')
  ON CONFLICT (funcionalidad_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_funcionalidad_validacion
AFTER INSERT ON public.funcionalidades
FOR EACH ROW EXECUTE FUNCTION public.crear_validacion_inicial();

-- Trigger: cambio de estado -> bitacora
CREATE OR REPLACE FUNCTION public.registrar_bitacora_estado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    INSERT INTO public.bitacora (funcionalidad_id, autor_id, accion, antes, despues)
    VALUES (NEW.funcionalidad_id, COALESCE(NEW.actualizado_por, auth.uid()), 'cambio_estado', OLD.estado::text, NEW.estado::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validacion_bitacora
AFTER UPDATE ON public.validaciones
FOR EACH ROW EXECUTE FUNCTION public.registrar_bitacora_estado();

-- Alta de perfil desde la lista blanca
CREATE OR REPLACE FUNCTION public.asegurar_perfil()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := auth.uid();
  v_email text;
  v_invitado public.invitados%ROWTYPE;
  v_perfil public.profiles%ROWTYPE;
BEGIN
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Sin sesion activa';
  END IF;

  SELECT * INTO v_perfil FROM public.profiles WHERE id = v_id;
  IF FOUND THEN
    RETURN v_perfil;
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_id;

  SELECT * INTO v_invitado FROM public.invitados WHERE lower(email) = v_email;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este correo no tiene acceso al portal';
  END IF;

  INSERT INTO public.profiles (id, email, nombre, lado)
  VALUES (v_id, v_email, v_invitado.nombre, v_invitado.lado)
  RETURNING * INTO v_perfil;

  RETURN v_perfil;
END;
$$;

REVOKE ALL ON FUNCTION public.asegurar_perfil() FROM public;
GRANT EXECUTE ON FUNCTION public.asegurar_perfil() TO authenticated;

-- Seed de proyectos
INSERT INTO public.proyectos (slug, nombre, color, bajada, orden) VALUES
  ('dac', 'DAC', '#3B82F6', 'Sitio institucional', 1),
  ('grupo-agencia', 'Grupo Agencia', '#F97316', 'Plataforma transaccional', 2),
  ('sumate', 'Sumate', '#F5A524', 'Sitio de campaña', 3),
  ('intranet', 'Intranet', '#8B5CF6', 'Plataforma interna', 4);