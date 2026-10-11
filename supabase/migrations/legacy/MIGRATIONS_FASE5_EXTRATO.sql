-- ============================================
-- MIGRATIONS PARA FISCHER FINANÇAS - FASE 5
-- CONCILIAÇÃO BANCÁRIA (EXTRATO)
-- ============================================

-- 1. Adicionar coluna 'conferido' em todas as tabelas de movimentação
-- ============================================

-- Entradas (Salários e Manuais)
ALTER TABLE entradas ADD COLUMN IF NOT EXISTS conferido boolean DEFAULT false;

-- Contas Fixas
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS conferido boolean DEFAULT false;

-- Cartões (Fatura)
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS conferido boolean DEFAULT false;

-- Combustível
ALTER TABLE combustivel ADD COLUMN IF NOT EXISTS conferido boolean DEFAULT false;

-- 2. Criar índices para performance nas consultas de conciliação
-- ============================================
CREATE INDEX IF NOT EXISTS idx_entradas_conferido ON entradas(conferido);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_conferido ON contas_fixas(conferido);
CREATE INDEX IF NOT EXISTS idx_cartoes_conferido ON cartoes(conferido);
CREATE INDEX IF NOT EXISTS idx_combustivel_conferido ON combustivel(conferido);
