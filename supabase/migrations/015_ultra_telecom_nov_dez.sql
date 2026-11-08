-- Inclusão idempotente de Ultra Telecom em novembro e dezembro de 2026
-- ancorada no registro existente de outubro/2026 em Contas Fixas de Casa.
BEGIN;
DO $$
DECLARE
  origem RECORD;
BEGIN
  FOR origem IN
    SELECT *
    FROM contas_fixas
    WHERE ano = 2026
      AND mes = 10
      AND categoria = 'Contas Fixas de Casa'
      AND descricao = 'Ultra Telecom'
  LOOP
    -- Novembro/2026 (parcela 11/12)
    IF NOT EXISTS (
      SELECT 1 FROM contas_fixas
      WHERE user_id = origem.user_id
        AND ano = 2026
        AND mes = 11
        AND categoria = 'Contas Fixas de Casa'
        AND descricao = 'Ultra Telecom'
    ) THEN
      INSERT INTO contas_fixas (user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela)
      VALUES (origem.user_id, 11, 2026, 'Contas Fixas de Casa', 'Ultra Telecom', DATE '2026-11-11', origem.valor, FALSE, '11/12');
    END IF;

    -- Dezembro/2026 (parcela 12/12)
    IF NOT EXISTS (
      SELECT 1 FROM contas_fixas
      WHERE user_id = origem.user_id
        AND ano = 2026
        AND mes = 12
        AND categoria = 'Contas Fixas de Casa'
        AND descricao = 'Ultra Telecom'
    ) THEN
      INSERT INTO contas_fixas (user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela)
      VALUES (origem.user_id, 12, 2026, 'Contas Fixas de Casa', 'Ultra Telecom', DATE '2026-12-11', origem.valor, FALSE, '12/12');
    END IF;
  END LOOP;
END $$;
COMMIT;
