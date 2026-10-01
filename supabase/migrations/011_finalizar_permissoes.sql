-- Aplicar SOMENTE após o deploy do commit que usa as novas RPCs.
BEGIN;
DROP POLICY IF EXISTS "Entrar em grupos (insert próprio user_id)" ON public.membros_familia;
REVOKE INSERT ON public.membros_familia FROM PUBLIC, authenticated, anon;
-- O aplicativo não edita grupos diretamente; impede trocar o código ou o dono.
REVOKE UPDATE ON public.grupos_familia FROM PUBLIC, authenticated, anon;

DO $$ BEGIN
  IF to_regprocedure('public.get_annual_summary(uuid,integer)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.get_annual_summary(uuid, integer) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
COMMIT;
