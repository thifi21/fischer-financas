-- Segurança para APIs serverless e acesso familiar agregado
-- Aplicar no Supabase antes de publicar o código correspondente na Vercel.

CREATE TABLE IF NOT EXISTS api_rate_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  PRIMARY KEY (user_id, route)
);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy direta: acesso somente pelas funções SECURITY DEFINER abaixo.

CREATE OR REPLACE FUNCTION check_api_rate_limit(
  p_route text,
  p_limit integer,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_row api_rate_limits%ROWTYPE;
  v_now timestamptz := clock_timestamp();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  IF p_route IS NULL OR length(p_route) > 80 OR p_limit < 1
     OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Parâmetros de rate limit inválidos';
  END IF;

  INSERT INTO api_rate_limits (user_id, route, window_start, request_count)
  VALUES (v_user_id, p_route, v_now, 1)
  ON CONFLICT (user_id, route) DO UPDATE
  SET
    window_start = CASE
      WHEN api_rate_limits.window_start <= v_now - make_interval(secs => p_window_seconds)
      THEN v_now ELSE api_rate_limits.window_start END,
    request_count = CASE
      WHEN api_rate_limits.window_start <= v_now - make_interval(secs => p_window_seconds)
      THEN 1 ELSE api_rate_limits.request_count + 1 END
  RETURNING * INTO v_row;

  RETURN v_row.request_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION check_api_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_api_rate_limit(text, integer, integer) TO authenticated;

CREATE OR REPLACE FUNCTION get_resumo_familia(p_mes integer, p_ano integer)
RETURNS TABLE (
  user_id uuid,
  nome text,
  email text,
  papel text,
  entradas numeric,
  saidas numeric,
  saldo numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH meu_grupo AS (
    SELECT m.grupo_id
    FROM membros_familia m
    WHERE m.user_id = auth.uid()
    LIMIT 1
  ),
  membros AS (
    SELECT m.user_id, m.nome_membro, m.email_membro, m.papel
    FROM membros_familia m
    JOIN meu_grupo g ON g.grupo_id = m.grupo_id
  ),
  totais AS (
    SELECT
      m.user_id,
      m.nome_membro,
      m.email_membro,
      m.papel,
      COALESCE((SELECT sum(e.valor) FROM entradas e
        WHERE e.user_id = m.user_id AND e.mes = p_mes AND e.ano = p_ano), 0) AS total_entradas,
      COALESCE((SELECT sum(c.valor) FROM cartoes c
        WHERE c.user_id = m.user_id AND c.mes = p_mes AND c.ano = p_ano), 0)
      + COALESCE((SELECT sum(f.valor) FROM contas_fixas f
        WHERE f.user_id = m.user_id AND f.mes = p_mes AND f.ano = p_ano), 0)
      + COALESCE((SELECT sum(cb.valor) FROM combustivel cb
        WHERE cb.user_id = m.user_id AND cb.mes = p_mes AND cb.ano = p_ano), 0) AS total_saidas
    FROM membros m
  )
  SELECT
    t.user_id,
    COALESCE(NULLIF(t.nome_membro, ''), split_part(t.email_membro, '@', 1), 'Membro'),
    COALESCE(t.email_membro, ''),
    t.papel,
    t.total_entradas,
    t.total_saidas,
    t.total_entradas - t.total_saidas
  FROM totais t;
$$;

REVOKE ALL ON FUNCTION get_resumo_familia(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_resumo_familia(integer, integer) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_entradas_user_periodo ON entradas(user_id, ano, mes);
CREATE INDEX IF NOT EXISTS idx_cartoes_user_periodo ON cartoes(user_id, ano, mes);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_user_periodo ON contas_fixas(user_id, ano, mes);
CREATE INDEX IF NOT EXISTS idx_combustivel_user_periodo ON combustivel(user_id, ano, mes);

