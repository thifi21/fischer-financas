-- ============================================
-- 007 — Rate limit persistente (janela fixa)
-- Substitui o contador em memória, que não funciona em serverless
-- (cada instância tinha seu próprio mapa).
-- Acesso apenas via service_role.
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- Sem policies: apenas service_role (que ignora RLS) acessa.

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO rate_limits AS r (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN 1
      ELSE r.count + 1
    END,
    window_start = CASE
      WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN now()
      ELSE r.window_start
    END
  RETURNING count INTO v_count;

  -- true = permitido
  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(text, integer, integer) TO service_role;

-- Limpeza opcional de chaves antigas (rodar periodicamente, ex.: pg_cron):
-- DELETE FROM rate_limits WHERE window_start < now() - interval '1 day';
