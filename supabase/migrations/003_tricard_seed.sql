-- ============================================================
-- SEED 003: Tricard — dados faltantes
-- Desenvolvido por Thiago Fischer
-- Execute no Supabase SQL Editor
-- Substitua 'SEU_USER_ID_AQUI' pelo UUID do seu usuário
-- ============================================================

DO $$
DECLARE
  uid UUID := 'SEU_USER_ID_AQUI';
BEGIN

  -- Remove Tricard existente para evitar duplicatas
  DELETE FROM cartoes WHERE user_id = uid AND nome = 'Tricard' AND ano = 2026;

  -- Insere Tricard todos os meses
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '467d3ba3-c23c-46d9-b2c4-d64f0c59dcdc', uid, 1, 2026, 'Tricard', '20/01', 624.32, TRUE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '91e6636d-a7f0-4855-b6ed-3d121e20ecd9', uid, 2, 2026, 'Tricard', '20/02', 623.05, TRUE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'b1918632-f156-4171-8700-22505cceb082', uid, 3, 2026, 'Tricard', '20/03', 570.2, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '0db92f4f-d980-4048-b091-725f702e12ad', uid, 4, 2026, 'Tricard', '20/04', 406.75, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'ba748714-095e-4b03-8b96-077bdd2b4915', uid, 5, 2026, 'Tricard', '20/05', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '698264af-bfcc-45b9-b2b1-a1d446b9b472', uid, 6, 2026, 'Tricard', '20/06', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'd0cb09c8-9cb2-44c8-bd97-8ecfba329683', uid, 7, 2026, 'Tricard', '20/07', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '66e40b56-f230-4fb4-9333-7a2912c7b09c', uid, 8, 2026, 'Tricard', '20/08', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '163f97f4-0c00-4d2b-a2a9-a5a5578ebd0a', uid, 9, 2026, 'Tricard', '20/09', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '305d1590-eb70-472a-9e8b-782c3704331e', uid, 10, 2026, 'Tricard', '20/10', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'ada10e5b-12ce-4095-8d89-cbc282fe8052', uid, 11, 2026, 'Tricard', '20/11', 0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '5719499f-a3da-4d34-aca4-9f4670d98ee1', uid, 12, 2026, 'Tricard', '20/12', 0.0, FALSE
  );

END $$;

-- Verificação:
SELECT mes, nome, vencimento, valor, pago FROM cartoes
WHERE nome = 'Tricard' AND ano = 2026 ORDER BY mes;