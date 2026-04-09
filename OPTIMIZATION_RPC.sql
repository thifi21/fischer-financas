-- ============================================================
-- SQL DE OTIMIZAÇÃO FISCHER FINANÇAS — RPC
-- Execute este script no painel "SQL Editor" do seu Supabase
-- ============================================================

CREATE OR REPLACE FUNCTION get_annual_summary(p_user_id UUID, p_year INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH meses AS (
        SELECT generate_series(1, 12) AS mes
    ),
    ent AS (
        SELECT mes, SUM(valor) as total
        FROM entradas
        WHERE user_id = p_user_id AND ano = p_year
        GROUP BY mes
    ),
    car AS (
        SELECT mes, SUM(valor) as total
        FROM cartoes
        WHERE user_id = p_user_id AND ano = p_year
        GROUP BY mes
    ),
    fix AS (
        SELECT mes, SUM(valor) as total
        FROM contas_fixas
        WHERE user_id = p_user_id AND ano = p_year
        GROUP BY mes
    ),
    comb AS (
        SELECT mes, SUM(valor) as total
        FROM combustivel
        WHERE user_id = p_user_id AND ano = p_year
        GROUP BY mes
    )
    SELECT jsonb_object_agg(m.mes, jsonb_build_object(
        'entradas', COALESCE(e.total, 0),
        'cartoes', COALESCE(c.total, 0),
        'fixas', COALESCE(f.total, 0),
        'combustivel', COALESCE(cb.total, 0)
    ))
    INTO result
    FROM meses m
    LEFT JOIN ent e ON e.mes = m.mes
    LEFT JOIN car c ON c.mes = m.mes
    LEFT JOIN fix f ON f.mes = m.mes
    LEFT JOIN comb cb ON cb.mes = m.mes;

    RETURN result;
END;
$$;

-- Permissões
REVOKE ALL ON FUNCTION get_annual_summary(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_annual_summary(UUID, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_annual_summary IS 'Retorna o resumo consolidado de entradas e saídas de todos os meses do ano para o dashboard.';
