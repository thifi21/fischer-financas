-- Aplicar antes do código que chama criar_grupo_familia e entrar_grupo_familia.
-- Prepara novas funções e corrige a recursão entre as duas políticas RLS.
BEGIN;

-- Convites antigos de oito caracteres deixam de ser válidos após esta migração.
ALTER TABLE public.grupos_familia ALTER COLUMN codigo_convite
  SET DEFAULT replace(gen_random_uuid()::text, '-', '');
UPDATE public.grupos_familia
  SET codigo_convite = replace(gen_random_uuid()::text, '-', '')
  WHERE length(codigo_convite) < 32;

CREATE OR REPLACE FUNCTION public.usuario_participa_grupo(p_grupo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.membros_familia m
    WHERE m.grupo_id = p_grupo_id AND m.user_id = (SELECT auth.uid())
  );
$$;
CREATE OR REPLACE FUNCTION public.usuario_dono_grupo(p_grupo_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.grupos_familia g
    WHERE g.id = p_grupo_id AND g.dono_id = (SELECT auth.uid())
  );
$$;
REVOKE ALL ON FUNCTION public.usuario_participa_grupo(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.usuario_dono_grupo(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.usuario_participa_grupo(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.usuario_dono_grupo(uuid) TO authenticated;

DROP POLICY IF EXISTS "Ver grupos onde é membro ou dono" ON public.grupos_familia;
CREATE POLICY "Ver grupos onde é membro ou dono" ON public.grupos_familia
  FOR SELECT TO authenticated
  USING (dono_id = (SELECT auth.uid()) OR public.usuario_participa_grupo(id));
DROP POLICY IF EXISTS "Ver membros do seu grupo" ON public.membros_familia;
CREATE POLICY "Ver membros do seu grupo" ON public.membros_familia
  FOR SELECT TO authenticated
  USING (public.usuario_participa_grupo(grupo_id) OR public.usuario_dono_grupo(grupo_id));
-- A política antiga de INSERT só é removida na migração 011, após o deploy.

CREATE OR REPLACE FUNCTION public.criar_grupo_familia(p_nome text)
RETURNS public.grupos_familia LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_grupo public.grupos_familia; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF length(trim(coalesce(p_nome, ''))) NOT BETWEEN 2 AND 80 THEN
    RAISE EXCEPTION 'Nome do grupo inválido';
  END IF;
  INSERT INTO public.grupos_familia (nome, dono_id)
  VALUES (trim(p_nome), v_uid) RETURNING * INTO v_grupo;
  INSERT INTO public.membros_familia (grupo_id, user_id, email_membro, nome_membro, papel)
  VALUES (v_grupo.id, v_uid, auth.jwt() ->> 'email',
    split_part(coalesce(auth.jwt() ->> 'email', 'Admin'), '@', 1), 'admin');
  RETURN v_grupo;
END;
$$;

CREATE OR REPLACE FUNCTION public.entrar_grupo_familia(p_codigo text)
RETURNS public.grupos_familia LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_grupo public.grupos_familia; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF trim(coalesce(p_codigo, '')) !~ '^[a-f0-9]{32}$' THEN
    RAISE EXCEPTION 'Código de convite inválido';
  END IF;
  SELECT * INTO v_grupo FROM public.grupos_familia
  WHERE codigo_convite = trim(p_codigo);
  IF NOT FOUND THEN RAISE EXCEPTION 'Código de convite inválido'; END IF;
  INSERT INTO public.membros_familia (grupo_id, user_id, email_membro, nome_membro, papel)
  VALUES (v_grupo.id, v_uid, auth.jwt() ->> 'email',
    split_part(coalesce(auth.jwt() ->> 'email', 'Membro'), '@', 1), 'membro')
  ON CONFLICT (grupo_id, user_id) DO NOTHING;
  RETURN v_grupo;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_grupo_familia(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.entrar_grupo_familia(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.criar_grupo_familia(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.entrar_grupo_familia(text) TO authenticated;
COMMIT;
