-- Migração: Adicionar campo para exclusão local (ocultar) no extrato
-- Este campo permite que um item suma do extrato sem ser deletado das abas de origem.

-- 1. Tabela de Entradas
ALTER TABLE entradas ADD COLUMN IF NOT EXISTS oculto_extrato BOOLEAN DEFAULT FALSE;

-- 2. Tabela de Contas Fixas
ALTER TABLE contas_fixas ADD COLUMN IF NOT EXISTS oculto_extrato BOOLEAN DEFAULT FALSE;

-- 3. Tabela de Cartões (Faturas)
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS oculto_extrato BOOLEAN DEFAULT FALSE;

-- 4. Tabela de Combustível
ALTER TABLE combustivel ADD COLUMN IF NOT EXISTS oculto_extrato BOOLEAN DEFAULT FALSE;
