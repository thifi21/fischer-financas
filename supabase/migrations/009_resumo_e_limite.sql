-- Resumo anual isolado por usuário e limite compartilhado entre instâncias da API.
BEGIN;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  PRIMARY KEY (user_id, route)
);
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  p_route text, p_limit integer, p_window_seconds integer DEFAULT 60
) RETURNS boolean LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_uid uuid := auth.uid(); v_row public.api_rate_limits%ROWTYPE;
  v_now timestamptz := clock_timestamp(); v_expected_limit integer;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  v_expected_limit := CASE p_route
    WHEN 'chat' THEN 20 WHEN 'ia' THEN 10
    WHEN 'familia-read' THEN 60 WHEN 'familia-write' THEN 20
    WHEN 'drive-upload' THEN 10 WHEN 'drive-list' THEN 30
    WHEN 'telegram' THEN 5 WHEN 'whatsapp' THEN 5
    WHEN 'open-finance' THEN 5 WHEN 'open-finance-sync' THEN 5
    ELSE NULL END;
  IF v_expected_limit IS NULL OR p_limit IS DISTINCT FROM v_expected_limit
     OR p_window_seconds IS DISTINCT FROM 60 THEN
    RAISE EXCEPTION 'Parâmetros de limite inválidos';
  END IF;
  INSERT INTO public.api_rate_limits AS current_limit (user_id, route, window_start, request_count)
  VALUES (v_uid, p_route, v_now, 1)
  ON CONFLICT (user_id, route) DO UPDATE
  SET window_start = CASE WHEN current_limit.window_start <=
      v_now - make_interval(secs => p_window_seconds) THEN v_now
      ELSE current_limit.window_start END,
      request_count = CASE WHEN current_limit.window_start <=
      v_now - make_interval(secs => p_window_seconds) THEN 1
      ELSE current_limit.request_count + 1 END
  RETURNING * INTO v_row;
  RETURN v_row.request_count <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.check_api_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_api_rate_limit(text, integer, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_annual_summary_secure(p_year integer)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_uid uuid := auth.uid(); v_result jsonb;
BEGIN
  IF v_uid IS NULL OR p_year NOT BETWEEN 2000 AND 2100 THEN
    RAISE EXCEPTION 'Consulta não autorizada';
  END IF;
  SELECT jsonb_object_agg(mes, jsonb_build_object(
    'entradas', entradas, 'cartoes', cartoes,
    'fixas', fixas, 'combustivel', combustivel
  )) INTO v_result
  FROM (
    SELECT m.mes,
      (SELECT coalesce(sum(e.valor), 0) FROM public.entradas e
        WHERE e.user_id = v_uid AND e.ano = p_year AND e.mes = m.mes) AS entradas,
      (SELECT coalesce(sum(CASE WHEN EXISTS (
        SELECT 1 FROM public.lancamentos_cartao l
        WHERE l.cartao_id = c.id AND l.user_id = v_uid
      ) THEN (SELECT coalesce(sum(l.valor), 0) FROM public.lancamentos_cartao l
        WHERE l.cartao_id = c.id AND l.user_id = v_uid) ELSE c.valor END), 0)
        FROM public.cartoes c WHERE c.user_id = v_uid
          AND c.ano = p_year AND c.mes = m.mes) AS cartoes,
      (SELECT coalesce(sum(f.valor), 0) FROM public.contas_fixas f
        WHERE f.user_id = v_uid AND f.ano = p_year AND f.mes = m.mes) AS fixas,
      (SELECT coalesce(sum(cb.valor), 0) FROM public.combustivel cb
        WHERE cb.user_id = v_uid AND cb.ano = p_year AND cb.mes = m.mes) AS combustivel
    FROM generate_series(1, 12) AS m(mes)
  ) resumo;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_annual_summary_secure(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_annual_summary_secure(integer) TO authenticated;

-- O cliente publicado ainda usa a função legada. A revogação ocorre na migração 011,
-- depois que o deploy com get_annual_summary_secure estiver ativo.
COMMIT;
