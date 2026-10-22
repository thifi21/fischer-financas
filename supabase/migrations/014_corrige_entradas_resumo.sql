-- Corrige o resumo anual: 'entradas' não deve somar saldo inicial nem lançamentos
-- manuais de extrato (extrato_entrada / extrato_saida), que ficam na mesma tabela.
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
        WHERE e.user_id = v_uid AND e.ano = p_year AND e.mes = m.mes
          AND coalesce(e.categoria, '') NOT IN ('saldo_inicial', 'extrato_entrada', 'extrato_saida')) AS entradas,
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
