-- Aplicar após MIGRATIONS_FASE3.sql, que cria as tabelas de importação.
BEGIN;
ALTER TABLE public.importacoes_ofx ADD COLUMN IF NOT EXISTS arquivo_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS importacoes_ofx_usuario_hash
  ON public.importacoes_ofx (user_id, arquivo_hash) WHERE arquivo_hash IS NOT NULL;
ALTER TABLE public.lancamentos_importados
  DROP CONSTRAINT IF EXISTS lancamentos_importados_destino_check;
ALTER TABLE public.lancamentos_importados
  ADD CONSTRAINT lancamentos_importados_destino_check CHECK (
    destino IN ('nao_sincronizado', 'cartoes', 'contas_fixas',
                'combustivel', 'entradas', 'ignorado')
  );

CREATE OR REPLACE FUNCTION public.sincronizar_importacao(
  p_importacao_id uuid, p_mes integer, p_ano integer, p_itens jsonb
) RETURNS integer LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_importacao public.importacoes_ofx;
  v_item jsonb;
  v_lancamento public.lancamentos_importados;
  v_destino text;
  v_cartao_id uuid;
  v_count integer := 0;
  v_total integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF p_mes NOT BETWEEN 1 AND 12 OR p_ano NOT BETWEEN 2000 AND 2100
     OR jsonb_typeof(p_itens) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_itens) > 500 THEN
    RAISE EXCEPTION 'Dados da importação inválidos';
  END IF;

  SELECT * INTO v_importacao FROM public.importacoes_ofx
  WHERE id = p_importacao_id AND user_id = v_uid FOR UPDATE;
  IF NOT FOUND OR v_importacao.status <> 'pendente' THEN
    RAISE EXCEPTION 'Importação inexistente ou já sincronizada';
  END IF;
  SELECT count(*) INTO v_total FROM public.lancamentos_importados
  WHERE importacao_id = p_importacao_id AND user_id = v_uid AND sincronizado = false;
  IF v_total <> jsonb_array_length(p_itens) OR v_total = 0 THEN
    RAISE EXCEPTION 'A lista de transações está incompleta';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_itens) item
    GROUP BY item->>'id' HAVING count(*) > 1
  ) THEN RAISE EXCEPTION 'Transações repetidas na solicitação'; END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_itens) LOOP
    IF (v_item->>'id') IS NULL OR (v_item->>'id') !~
       '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
      RAISE EXCEPTION 'Identificador da transação inválido';
    END IF;
    SELECT * INTO v_lancamento FROM public.lancamentos_importados
    WHERE id = (v_item->>'id')::uuid AND importacao_id = p_importacao_id
      AND user_id = v_uid AND sincronizado = false FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Transação indisponível para sincronização'; END IF;

    v_destino := v_item->>'destino';
    IF v_destino NOT IN ('entradas', 'contas_fixas', 'combustivel', 'cartoes', 'ignorado')
       OR v_destino IS NULL THEN RAISE EXCEPTION 'Destino inválido'; END IF;
    IF v_lancamento.tipo = 'credito' AND v_destino NOT IN ('entradas', 'ignorado') THEN
      RAISE EXCEPTION 'Uma entrada não pode ser registrada como despesa';
    END IF;
    IF v_lancamento.tipo = 'debito' AND v_destino = 'entradas' THEN
      RAISE EXCEPTION 'Uma despesa não pode ser registrada como entrada';
    END IF;

    IF v_destino = 'entradas' THEN
      INSERT INTO public.entradas (user_id, mes, ano, descricao, valor, categoria, data_entrada)
      VALUES (v_uid, p_mes, p_ano, v_lancamento.descricao,
        abs(v_lancamento.valor), v_lancamento.categoria, v_lancamento.data_transacao);
    ELSIF v_destino = 'contas_fixas' THEN
      INSERT INTO public.contas_fixas (user_id, mes, ano, descricao, valor, categoria, data_vencimento, pago)
      VALUES (v_uid, p_mes, p_ano, v_lancamento.descricao,
        abs(v_lancamento.valor), v_lancamento.categoria, v_lancamento.data_transacao, false);
    ELSIF v_destino = 'combustivel' THEN
      INSERT INTO public.combustivel (user_id, mes, ano, data_abastecimento, valor)
      VALUES (v_uid, p_mes, p_ano, v_lancamento.data_transacao, abs(v_lancamento.valor));
    ELSIF v_destino = 'cartoes' THEN
      IF (v_item->>'cartao_id') IS NULL OR (v_item->>'cartao_id') !~
         '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
        RAISE EXCEPTION 'Selecione um cartão para cada compra';
      END IF;
      v_cartao_id := (v_item->>'cartao_id')::uuid;
      PERFORM 1 FROM public.cartoes WHERE id = v_cartao_id AND user_id = v_uid
        AND mes = p_mes AND ano = p_ano FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Cartão não encontrado neste período'; END IF;
      INSERT INTO public.lancamentos_cartao (user_id, cartao_id, mes, ano, data_compra, local, valor)
      VALUES (v_uid, v_cartao_id, p_mes, p_ano,
        v_lancamento.data_transacao, v_lancamento.descricao, abs(v_lancamento.valor));
      UPDATE public.cartoes SET valor = (
        SELECT coalesce(sum(valor), 0) FROM public.lancamentos_cartao
        WHERE cartao_id = v_cartao_id AND user_id = v_uid
      ) WHERE id = v_cartao_id AND user_id = v_uid;
    END IF;

    UPDATE public.lancamentos_importados SET sincronizado = true, destino = v_destino
    WHERE id = v_lancamento.id AND user_id = v_uid;
    IF v_destino <> 'ignorado' THEN v_count := v_count + 1; END IF;
  END LOOP;
  UPDATE public.importacoes_ofx SET sincronizados = v_count, status = 'sincronizado'
  WHERE id = p_importacao_id AND user_id = v_uid;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.sincronizar_importacao(uuid, integer, integer, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sincronizar_importacao(uuid, integer, integer, jsonb) TO authenticated;
COMMIT;
