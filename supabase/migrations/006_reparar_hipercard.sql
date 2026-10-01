-- Reparação idempotente, ancorada no lançamento existente de dezembro/2026.
-- Não cria contas_fixas: a seção Cartões nessa tela representa a mesma fatura.
BEGIN;
DO $$
DECLARE
  origem RECORD;
  periodo DATE;
  destino UUID;
  quantidade INTEGER;
  numero INTEGER;
BEGIN
  FOR origem IN
    SELECT l.*, c.nome FROM lancamentos_cartao l
    JOIN cartoes c ON c.id = l.cartao_id AND c.user_id = l.user_id
    WHERE c.nome = 'Hipercard' AND c.mes = 12 AND c.ano = 2026
      AND l.mes = 12 AND l.ano = 2026
      AND l.local = 'Jota Car Joinville (Joãozinho Mecânico)'
      AND l.data_compra = DATE '2026-09-08' AND l.valor = 154.50
      AND l.parcela IN ('03/06', '3/6')
  LOOP
    SELECT count(*) INTO quantidade FROM lancamentos_cartao
    WHERE user_id = origem.user_id AND cartao_id = origem.cartao_id
      AND data_compra = origem.data_compra AND local = origem.local
      AND valor = origem.valor AND parcela IN ('03/06', '3/6');
    IF quantidade <> 1 THEN
      RAISE EXCEPTION 'Lançamento Hipercard ambíguo; reparação cancelada';
    END IF;

    FOR numero IN 3..6 LOOP
      periodo := (DATE '2026-12-01' + make_interval(months => numero - 3))::date;
      SELECT count(*), (array_agg(id))[1] INTO quantidade, destino
      FROM cartoes WHERE user_id = origem.user_id AND nome = origem.nome
        AND mes = EXTRACT(MONTH FROM periodo) AND ano = EXTRACT(YEAR FROM periodo);
      IF quantidade > 1 THEN
        RAISE EXCEPTION 'Mais de um Hipercard no período %; reparação cancelada', periodo;
      END IF;
      IF quantidade = 0 THEN
        INSERT INTO cartoes (user_id, nome, mes, ano, vencimento, valor, pago)
        VALUES (origem.user_id, origem.nome, EXTRACT(MONTH FROM periodo),
          EXTRACT(YEAR FROM periodo), '10/' || to_char(periodo, 'MM'), 0, FALSE)
        RETURNING id INTO destino;
      END IF;

      IF numero > 3 THEN
        SELECT count(*) INTO quantidade FROM lancamentos_cartao
        WHERE user_id = origem.user_id AND cartao_id = destino
          AND local = origem.local AND data_compra = origem.data_compra
          AND parcela IN (lpad(numero::text, 2, '0') || '/06', numero::text || '/6');
        IF quantidade > 1 THEN
          RAISE EXCEPTION 'Parcela Hipercard duplicada em %; reparação cancelada', periodo;
        ELSIF quantidade = 0 THEN
          INSERT INTO lancamentos_cartao (user_id, cartao_id, mes, ano, data_compra, local, parcela, valor)
          VALUES (origem.user_id, destino, EXTRACT(MONTH FROM periodo), EXTRACT(YEAR FROM periodo),
            origem.data_compra, origem.local, lpad(numero::text, 2, '0') || '/06', origem.valor);
        ELSE
          UPDATE lancamentos_cartao SET valor = origem.valor
          WHERE user_id = origem.user_id AND cartao_id = destino
            AND local = origem.local AND data_compra = origem.data_compra
            AND parcela IN (lpad(numero::text, 2, '0') || '/06', numero::text || '/6');
        END IF;
      END IF;

      UPDATE cartoes SET valor = (
        SELECT COALESCE(sum(valor), 0) FROM lancamentos_cartao
        WHERE cartao_id = destino AND user_id = origem.user_id
      ) WHERE id = destino AND user_id = origem.user_id;
    END LOOP;
  END LOOP;
END $$;
COMMIT;
