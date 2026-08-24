-- Publica los cambios de validaciones y comentarios por Realtime, para que la
-- vista del otro lado se refresque sin recargar. Idempotente.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime'
                   AND schemaname = 'public' AND tablename = 'validaciones') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.validaciones;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                 WHERE pubname = 'supabase_realtime'
                   AND schemaname = 'public' AND tablename = 'comentarios') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comentarios;
  END IF;
END $$;
